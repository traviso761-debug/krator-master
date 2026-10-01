// ================================================================= BIOME CORE — carve patches (overhangs on a heightfield)
// The ground stays a heightfield (one height per x,z: everything that roots,
// walks or clamps a camera reads it). A PATCH is where a feature needs rock
// ABOVE open space: an alcove in a cliff, a niche round a carved front, the
// undercut behind a waterfall. Inside its plan the host lowers the heightfield
// to the floor (BIO.carve.recessD gives the distance the host folds into its
// own wall function), and the patch is meshed (surface nets) to put the rock
// back above the void's ceiling. The patch overlaps the cliff round it, sinks
// its top 3 cm under the heightfield wherever the two coincide, and takes the
// strata shader (world space), so the join does not show.
//
// The heightfield's recess runs `pad` (2 m) BEHIND the void's walls, inside the
// patch's rock: a ground triangle (1.25 m) spanning the recess's edge would
// otherwise cut a ramp of spikes into the void. The patch's `margin` must be
// wider than pad + the host's wall width, or the ramp shows beyond the patch.
// Each patch vertex carries `aOcc` (ambient occlusion marched through the
// density field) and `aSun` (1 lit, 0 in the hood's shadow, given the sun's
// direction); floorOcc() and floorSun() give the same for the ground under a hood.
//
//   BIO.carve.add({id, kind:'alcove'|'niche'|'undercut', c:[x,z], n:[nx,nz] (out of the rock,
//                  toward the open floor), hw (half-width along the wall), depth (into the rock),
//                  h (void height at the mouth above floorY), floorY, base:(x,z)=>y (the ground
//                  WITHOUT the patch), margin (5.5), pad (2), cell (.5)})
//   BIO.carve.recessD(x,z)      signed distance to the nearest patch's plan grown by its pad (negative inside)
//   BIO.carve.covered(x,z)      the lowest ceiling over (x,z), or null
//   BIO.carve.topAt(x,z)        the patch's top over (x,z), within its plan + margin (the ground without it), or null
//   BIO.carve.rockAt(x,y,z)     is (x,y,z) inside a patch's rock
//   BIO.carve.floorOcc(x,z)     how much sky the ground at (x,z) sees under a hood (1 in the open)
//   BIO.carve.floorSun(x,y,z,sun) 0 where a patch's rock stands between (x,y,z) and the sun ([x,y,z], toward it), else 1
//   BIO.carve.mesh(material,sun) surface-nets meshes, one per patch, with aOcc and aSun (call after BIO.init)
(function(){
const P=[];
const local=(Q,x,z)=>{const dx=x-Q.c[0],dz=z-Q.c[1];return{u:dx*Q.n[1]-dz*Q.n[0],q:-(dx*Q.n[0]+dz*Q.n[1])};};   // u along the wall, q into the rock
function planSD(Q,x,z){const L=local(Q,x,z);
 if(Q.kind==='niche'){const ax=Math.abs(L.u)-Q.hw,aq=Math.max(L.q-Q.depth,-L.q-2);return Math.hypot(Math.max(ax,0),Math.max(aq,0))+Math.min(Math.max(ax,aq),0);}
 if(L.q<0)return Math.max(Math.abs(L.u)-Q.hw,-L.q-2.5);                  // in front of the foot: the open mouth, 2.5 m of it
 return(Math.hypot(L.u/Q.hw,L.q/Q.depth)-1)*Math.min(Q.hw,Q.depth);}
// the void's ceiling above (u, q)
function ceil(Q,u,q){const a=Math.abs(u)/Q.hw,b=Math.max(0,q)/Q.depth;
 if(Q.kind==='niche')return Q.floorY+Q.h*(1-.12*a*a);
 return Q.floorY+Q.h*Math.sqrt(Math.max(0,1-b*b))*Math.sqrt(Math.max(0,1-a*a*a*a));}
// rock is negative: under the original surface, inside the patch's region, outside the void
function dens(Q,x,y,z,base){const sd=planSD(Q,x,z),reg=sd-Q.margin,band=sd>0?.03:0;let f=Math.max(y-(base-band),reg);
 if(sd<0){const L=local(Q,x,z),cy=ceil(Q,L.u,L.q),v=Math.max(sd,y-cy,Q.floorY-.5-y);f=Math.max(f,-v);}
 return f;}
// five rays round the sun's direction (a 3-degree penumbra: the grids' shadow edges come out soft)
const soft=D=>{const ax=Math.abs(D[1])<.9?[0,1,0]:[1,0,0],u=[D[1]*ax[2]-D[2]*ax[1],D[2]*ax[0]-D[0]*ax[2],D[0]*ax[1]-D[1]*ax[0]],ul=Math.hypot(...u);u[0]/=ul;u[1]/=ul;u[2]/=ul;
 const w=[D[1]*u[2]-D[2]*u[1],D[2]*u[0]-D[0]*u[2],D[0]*u[1]-D[1]*u[0]],e=.052;return[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[D[0]+(u[0]*a+w[0]*b)*e,D[1]+(u[1]*a+w[1]*b)*e,D[2]+(u[2]*a+w[2]*b)*e]);};
const C={patches:P,
 add(o){const Q=Object.assign({margin:5.5,pad:2,cell:.5,kind:'alcove'},o);const l=Math.hypot(Q.n[0],Q.n[1]);Q.n=[Q.n[0]/l,Q.n[1]/l];P.push(Q);return Q;},
 planSD,
 recessD(x,z){let d=1e9;for(const Q of P){if(Math.abs(x-Q.c[0])>Q.hw+Q.depth+8||Math.abs(z-Q.c[1])>Q.hw+Q.depth+8)continue;d=Math.min(d,planSD(Q,x,z)-Q.pad);}return d;},
 covered(x,z){let c=null;for(const Q of P){if(Math.abs(x-Q.c[0])>Q.hw+Q.depth+4||Math.abs(z-Q.c[1])>Q.hw+Q.depth+4)continue;const sd=planSD(Q,x,z);if(sd>0)continue;
  const L=local(Q,x,z);if(L.q<0)continue;const y=ceil(Q,L.u,L.q);if(c===null||y<c)c=y;}return c;},
 topAt(x,z){for(const Q of P){if(Math.abs(x-Q.c[0])>Q.hw+Q.depth+Q.margin+2||Math.abs(z-Q.c[1])>Q.hw+Q.depth+Q.margin+2)continue;if(planSD(Q,x,z)<Q.margin)return Q.base(x,z);}return null;},
 floorOcc(x,z){let o=1;for(const Q of P){if(Math.abs(x-Q.c[0])>Q.hw+Q.depth+4||Math.abs(z-Q.c[1])>Q.hw+Q.depth+4)continue;const L=local(Q,x,z),sd=planSD(Q,x,z);if(sd>0)continue;
  // the hood hides more of the sky the further in: a third at the mouth, most of it at the back
  const a=Math.abs(L.u)/Q.hw,b=Math.max(0,L.q)/Q.depth,k=Q.kind==='niche'?.5:1;o=Math.min(o,1-k*(.62*Math.min(1,.35+b*1.1)*(1-.5*a*a))*Math.min(1,(L.q+2)/2));}return Math.max(.25,o);},
 floorSun(x,y,z,sun){const l=Math.hypot(...sun);let near=false;
  for(const Q of P)if(Math.abs(x-Q.c[0])<Q.hw+Q.depth+Q.margin+40&&Math.abs(z-Q.c[1])<Q.hw+Q.depth+Q.margin+40){near=true;break;}if(!near)return 1;
  // the ground only under the hood or in its mouth, fading out over the 2.5 m in front (the plain cliff casts no shadow)
  let fade=0;for(const Q of P){const sd=planSD(Q,x,z);if(sd<0){const L=local(Q,x,z);fade=Math.max(fade,Math.min(1,(L.q+2.5)/2.5));}}if(!fade)return 1;
  let lit=0;const S=soft([sun[0]/l,sun[1]/l,sun[2]/l]);
  for(const D of S){let l1=1;for(let t=1;t<48&&l1;t+=1.2){const px=x+D[0]*t,py=y+.3+D[1]*t,pz=z+D[2]*t;for(const Q of P)if(planSD(Q,px,pz)<0&&dens(Q,px,py,pz,Q.base(px,pz))<0){l1=0;break;}}lit+=l1/S.length;}return 1-(1-lit)*fade;},
 rockAt(x,y,z){for(const Q of P){if(Math.abs(x-Q.c[0])>Q.hw+Q.depth+Q.margin+2||Math.abs(z-Q.c[1])>Q.hw+Q.depth+Q.margin+2)continue;if(dens(Q,x,y,z,Q.base(x,z))<0)return true;}return false;},
 // surface nets: one vertex per sign-changing cell (the mean of its edge crossings), one quad per sign-changing edge
 mesh(material,sun){const T=BIO.host.THREE,out=[],sl=sun?Math.hypot(...sun):1,SD=sun?[sun[0]/sl,sun[1]/sl,sun[2]/sl]:null;
  for(const Q of P){const t0=performance.now(),c=Q.cell,R=Q.hw+Q.depth+Q.margin+1,x0=Q.c[0]-R,z0=Q.c[1]-R,nx=Math.ceil(2*R/c),nz=nx;
   let ymax=-1e9;for(let i=0;i<=nx;i+=2)for(let k=0;k<=nz;k+=2)ymax=Math.max(ymax,Q.base(x0+i*c,z0+k*c));
   const y0=Q.floorY-1.5,ny=Math.ceil((ymax+1.5-y0)/c),W=nx+1,H=ny+1,F=new Float32Array(W*H*(nz+1)),B=new Float32Array(W*(nz+1));
   for(let k=0;k<=nz;k++)for(let i=0;i<=nx;i++)B[k*W+i]=Q.base(x0+i*c,z0+k*c);
   const id=(i,j,k)=>(k*H+j)*W+i;
   for(let k=0;k<=nz;k++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)F[id(i,j,k)]=dens(Q,x0+i*c,y0+j*c,z0+k*c,B[k*W+i]);
   const V=new Int32Array(nx*ny*nz).fill(-1),pos=[],nrm=[],idx=[];
   const cid=(i,j,k)=>(k*ny+j)*nx+i;
   const corner=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],edges=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
   for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const v=corner.map(o=>F[id(i+o[0],j+o[1],k+o[2])]);let m=0;for(let a=0;a<8;a++)if(v[a]<0)m|=1<<a;if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,n=0;for(const [a,b] of edges){if((v[a]<0)===(v[b]<0))continue;const t=v[a]/(v[a]-v[b]),A=corner[a],Bc=corner[b];sx+=A[0]+(Bc[0]-A[0])*t;sy+=A[1]+(Bc[1]-A[1])*t;sz+=A[2]+(Bc[2]-A[2])*t;n++;}
    const X=x0+(i+sx/n)*c,Y=y0+(j+sy/n)*c,Z=z0+(k+sz/n)*c;V[cid(i,j,k)]=pos.length/3;pos.push(X,Y,Z);
    const e=c*.5,bx=Q.base(X,Z),g=[dens(Q,X+e,Y,Z,Q.base(X+e,Z))-dens(Q,X-e,Y,Z,Q.base(X-e,Z)),dens(Q,X,Y+e,Z,bx)-dens(Q,X,Y-e,Z,bx),dens(Q,X,Y,Z+e,Q.base(X,Z+e))-dens(Q,X,Y,Z-e,Q.base(X,Z-e))],gl=Math.hypot(...g)||1;
    nrm.push(g[0]/gl,g[1]/gl,g[2]/gl);}
   // ambient occlusion: 14 directions round the normal, marched through the field. Only the rock
   // round the void (within 3 m of its plan, above its floor) occludes: the heightfield beside the
   // patch has no occlusion either, so an open face of the patch must not darken (the join would show)
   const Fat=(X,Y,Z)=>{const fi=(X-x0)/c,fj=(Y-y0)/c,fk=(Z-z0)/c;if(fi<0||fj<0||fk<0||fi>=nx||fj>=ny||fk>=nz)return 1;
    const i=fi|0,j=fj|0,k=fk|0,u=fi-i,v=fj-j,w=fk-k,L=(a,b,t)=>a+(b-a)*t;
    return L(L(L(F[id(i,j,k)],F[id(i+1,j,k)],u),L(F[id(i,j+1,k)],F[id(i+1,j+1,k)],u),v),L(L(F[id(i,j,k+1)],F[id(i+1,j,k+1)],u),L(F[id(i,j+1,k+1)],F[id(i+1,j+1,k+1)],u),v),w);};
   const DIRS=[];for(let d=0;d<14;d++){const yv=1-(d+.5)/14*2,r=Math.sqrt(1-yv*yv),a=d*2.39996;DIRS.push([Math.cos(a)*r,yv,Math.sin(a)*r]);}
   const SOFT=SD?soft(SD):null,occ=new Float32Array(pos.length/3),sunA=new Float32Array(pos.length/3).fill(1);
   for(let v=0;v<occ.length;v++){const X=pos[v*3],Y=pos[v*3+1],Z=pos[v*3+2],nX=nrm[v*3],nY=nrm[v*3+1],nZ=nrm[v*3+2];let seen=0,tot=0;
    for(const D of DIRS){let dx=D[0],dy=D[1],dz=D[2],dn=dx*nX+dy*nY+dz*nZ;if(dn<0){dx=-dx;dy=-dy;dz=-dz;dn=-dn;}
     let open=1;for(const t of [1,2.2,4,7,11,16,23,32]){const px=X+dx*t,py=Y+dy*t,pz=Z+dz*t;if(py>Q.floorY+.3&&Fat(px,py,pz)<0&&planSD(Q,px,pz)<3){open=0;break;}}
     seen+=open*dn;tot+=dn;}
    occ[v]=Math.max(.22,seen/tot);
    // the sun: marched through the whole field (the hood shades the floor and back wall)
    // only the HOOD (rock inside the plan, over the void) casts: the rest of the patch stands in for
    // the plain cliff, which casts no shadow in this world, so it must not here either
    if(SD&&nX*SD[0]+nY*SD[1]+nZ*SD[2]>0){let lit=0;for(const J of SOFT){let l=1;for(let t=.8;t<60;t+=.9){const px=X+nX*.3+J[0]*t,py=Y+nY*.3+J[1]*t,pz=Z+nZ*.3+J[2]*t;if(Fat(px,py,pz)<0&&planSD(Q,px,pz)<0){l=0;break;}}lit+=l/SOFT.length;}sunA[v]=lit;}}
   // quads: an edge between grid points (i,j,k)-(i+1,j,k) that changes sign is shared by the four cells round it
   const quad=(a,b,c2,d,flip)=>{if(a<0||b<0||c2<0||d<0)return;if(flip)idx.push(a,b,c2,a,c2,d);else idx.push(a,c2,b,a,d,c2);};
   for(let k=1;k<nz;k++)for(let j=1;j<ny;j++)for(let i=0;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i+1,j,k)]<0;if(s0===s1)continue;quad(V[cid(i,j-1,k-1)],V[cid(i,j,k-1)],V[cid(i,j,k)],V[cid(i,j-1,k)],s0);}
   for(let k=1;k<nz;k++)for(let j=0;j<ny;j++)for(let i=1;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i,j+1,k)]<0;if(s0===s1)continue;quad(V[cid(i-1,j,k-1)],V[cid(i-1,j,k)],V[cid(i,j,k)],V[cid(i,j,k-1)],s0);}
   for(let k=0;k<nz;k++)for(let j=1;j<ny;j++)for(let i=1;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i,j,k+1)]<0;if(s0===s1)continue;quad(V[cid(i-1,j-1,k)],V[cid(i,j-1,k)],V[cid(i,j,k)],V[cid(i-1,j,k)],s0);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setAttribute('aOcc',new T.Float32BufferAttribute(occ,1));g.setAttribute('aSun',new T.Float32BufferAttribute(sunA,1));g.setIndex(idx);g.computeBoundingSphere();
   const m=new T.Mesh(g,material);m.name='carve:'+Q.id;m.userData.carve=Q.id;m.userData.inspectLabel=Q.name||Q.id;out.push(m);
   Q.stats={verts:pos.length/3,tris:idx.length/3,ms:Math.round(performance.now()-t0)};}
  return out;}};
BIO.carve=C;
})();
