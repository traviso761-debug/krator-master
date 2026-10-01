// ================================================================= CORE — carve patches (overhangs on a heightfield)
// Shared by every build that wants rock above open space on a heightfield world:
// one copy here (core/terrain), read by each build's build.py; a local src/ copy
// with the same name overrides it for that build only.
//
// The ground stays a heightfield (one height per x,z: everything that roots,
// walks or clamps a camera reads it). A PATCH is where a feature needs rock
// ABOVE open space: an alcove in a cliff, a niche round a carved front, the
// undercut behind a waterfall, or any shape a build registers with kind().
// Inside its plan the host lowers its heightfield to the floor (recessD() gives
// the distance to fold into the host's own wall function), and the patch is
// meshed (surface nets) to put the rock back above the void's ceiling. The patch
// overlaps the cliff round it and sinks its top `sink` (3 cm) under the
// heightfield wherever the two coincide; give it the ground's own material
// (world-space, no UVs needed) and the join does not show.
//
// The recess runs `pad` (2 m) BEHIND the void's walls, inside the patch's rock: a
// ground triangle spanning the recess's edge would otherwise cut a ramp of spikes
// into the void (pad must exceed the ground grid's cell diagonal). The `margin`
// must be wider than pad + the host's wall blend, or the ramp shows past the patch.
//
// Needs nothing but THREE (from opt.THREE, BIO.host.THREE or the global) and only
// at mesh(); every query is plain maths and a no-op with no patches declared. Axes:
// y up, metres. With the biome core loaded it is also BIO.carve.
//
//   const C=KCARVE                    the shared instance (KCARVE.create() makes an independent one)
//   C.add({id, kind:'alcove'|'niche'|'undercut'|<registered>, c:[x,z], n:[nx,nz] (out of the rock,
//          toward the open floor), hw (half-width along the wall), depth (into the rock),
//          h (void height at the mouth above floorY), floorY, base:(x,z)=>y (the ground WITHOUT
//          the patch), margin (5.5), pad (2), cell (.5), mouth (2.5: plan in front of the foot),
//          sink (.03), name})
//   C.kind(name, {plan(L,Q)->sd, ceil(Q,u,q)->y, occ (0..1, how much the hood darkens the floor)})
//                                     register a shape: L = {u along the wall, q into the rock}
//   C.get(id), C.clear(), C.patches, C.local(Q,x,z), C.planSD(Q,x,z)
//   C.recessD(x,z)       signed distance to the nearest patch's plan grown by its pad (negative inside)
//   C.covered(x,z)       the lowest ceiling over (x,z), or null
//   C.topAt(x,z)         the patch's top over (x,z), within its plan + margin (the ground without it), or null
//   C.rockAt(x,y,z)      is (x,y,z) inside a patch's rock
//   C.floorOcc(x,z)      how much sky the ground at (x,z) sees under a hood (1 in the open)
//   C.floorSun(x,y,z,sun) 0 where a hood stands between (x,y,z) and the sun ([x,y,z], toward it), 1 lit;
//                         the ground only under the hood and in its mouth
//   C.mesh(material, opt) one mesh per patch. opt: a sun direction [x,y,z], or {sun, THREE, ao:true,
//                         aoReach:32, penumbra (degrees; ~3 by default), cast:'hood'|'patch'}. Each vertex gets
//                         aOcc (ambient occlusion through the patch's density field: only the rock
//                         round the void counts, so an open face does not darken against the plain
//                         heightfield beside it) and aSun (1 lit, 0 shaded; 'hood': only the rock
//                         over the void casts, for a world whose cliffs cast no shadow; 'patch': all
//                         of it, for one with shadow maps of its own). Stats on each patch's .stats.
(function(root){
const local=(Q,x,z)=>{const dx=x-Q.c[0],dz=z-Q.c[1];return{u:dx*Q.n[1]-dz*Q.n[0],q:-(dx*Q.n[0]+dz*Q.n[1])};};   // u along the wall, q into the rock
// the built-in shapes
const BUILTIN={
 // a Mesa Verde alcove: a half-ellipse in plan, its ceiling a dome falling to the back
 alcove:{occ:1,
  plan(L,Q){if(L.q<0)return Math.max(Math.abs(L.u)-Q.hw,-L.q-Q.mouth);return(Math.hypot(L.u/Q.hw,L.q/Q.depth)-1)*Math.min(Q.hw,Q.depth);},
  ceil(Q,u,q){const a=Math.abs(u)/Q.hw,b=Math.max(0,q)/Q.depth;return Q.floorY+Q.h*Math.sqrt(Math.max(0,1-b*b))*Math.sqrt(Math.max(0,1-a*a*a*a));}},
 // a niche round a carved front: a rounded box, its head nearly level
 niche:{occ:.5,
  plan(L,Q){const ax=Math.abs(L.u)-Q.hw,aq=Math.max(L.q-Q.depth,-L.q-2);return Math.hypot(Math.max(ax,0),Math.max(aq,0))+Math.min(Math.max(ax,aq),0);},
  ceil(Q,u,q){const a=Math.abs(u)/Q.hw;return Q.floorY+Q.h*(1-.12*a*a);}}};
BUILTIN.undercut=BUILTIN.alcove;   // the plunge pool's undercut: an alcove whose floor is under water

function makeCarve(){
 const P=[],KINDS=Object.assign({},BUILTIN);
 const shape=Q=>{const K=KINDS[Q.kind];if(!K)throw new Error('carve: no kind '+Q.kind+' (register it with kind())');return K;};
 const planSD=(Q,x,z)=>Q.K.plan(local(Q,x,z),Q);
 const ceil=(Q,u,q)=>Q.K.ceil(Q,u,q);
 const near=(Q,x,z,r)=>Math.abs(x-Q.c[0])<=Q.hw+Q.depth+r&&Math.abs(z-Q.c[1])<=Q.hw+Q.depth+r;
 // rock is negative: under the original surface, inside the patch's region, outside the void
 function dens(Q,x,y,z,base){const sd=planSD(Q,x,z),reg=sd-Q.margin,band=sd>0?Q.sink:0;let f=Math.max(y-(base-band),reg);
  if(sd<0){const L=local(Q,x,z),cy=ceil(Q,L.u,L.q),v=Math.max(sd,y-cy,Q.floorY-.5-y);f=Math.max(f,-v);}
  return f;}
 // five rays round the sun's direction (the penumbra: the grids' shadow edges come out soft)
 const soft=(D,e)=>{const ax=Math.abs(D[1])<.9?[0,1,0]:[1,0,0],u=[D[1]*ax[2]-D[2]*ax[1],D[2]*ax[0]-D[0]*ax[2],D[0]*ax[1]-D[1]*ax[0]],ul=Math.hypot(...u);u[0]/=ul;u[1]/=ul;u[2]/=ul;
  const w=[D[1]*u[2]-D[2]*u[1],D[2]*u[0]-D[0]*u[2],D[0]*u[1]-D[1]*u[0]];return[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[D[0]+(u[0]*a+w[0]*b)*e,D[1]+(u[1]*a+w[1]*b)*e,D[2]+(u[2]*a+w[2]*b)*e]);};
 const unit=v=>{const l=Math.hypot(...v);return[v[0]/l,v[1]/l,v[2]/l];};
 const C={patches:P,local,planSD,create:makeCarve,
  kind(name,def){if(typeof def.plan!=='function'||typeof def.ceil!=='function')throw new Error('carve kind '+name+': needs plan(L,Q) and ceil(Q,u,q)');KINDS[name]=Object.assign({occ:1},def);return C;},
  add(o){for(const k of ['id','c','n','hw','depth','h','floorY','base'])if(o[k]===undefined)throw new Error('carve.add '+(o.id||'?')+': missing '+k);
   const Q=Object.assign({margin:5.5,pad:2,cell:.5,mouth:2.5,sink:.03,kind:'alcove'},o);const l=Math.hypot(Q.n[0],Q.n[1]);Q.n=[Q.n[0]/l,Q.n[1]/l];
   Object.defineProperty(Q,'K',{value:shape(Q),enumerable:false});P.push(Q);return Q;},
  get(id){return P.find(Q=>Q.id===id)||null;},
  clear(){P.length=0;return C;},
  recessD(x,z){let d=1e9;for(const Q of P){if(!near(Q,x,z,Q.pad+6))continue;d=Math.min(d,planSD(Q,x,z)-Q.pad);}return d;},
  covered(x,z){let c=null;for(const Q of P){if(!near(Q,x,z,4))continue;const sd=planSD(Q,x,z);if(sd>0)continue;
   const L=local(Q,x,z);if(L.q<0)continue;const y=ceil(Q,L.u,L.q);if(c===null||y<c)c=y;}return c;},
  topAt(x,z){for(const Q of P){if(!near(Q,x,z,Q.margin+2))continue;if(planSD(Q,x,z)<Q.margin)return Q.base(x,z);}return null;},
  floorOcc(x,z){let o=1;for(const Q of P){if(!near(Q,x,z,4))continue;const L=local(Q,x,z),sd=planSD(Q,x,z);if(sd>0)continue;
   // the hood hides more of the sky the further in: a third at the mouth, most of it at the back
   const a=Math.abs(L.u)/Q.hw,b=Math.max(0,L.q)/Q.depth;o=Math.min(o,1-Q.K.occ*(.62*Math.min(1,.35+b*1.1)*(1-.5*a*a))*Math.min(1,(L.q+2)/2));}return Math.max(.25,o);},
  floorSun(x,y,z,sun,deg){if(!P.some(Q=>near(Q,x,z,Q.margin+40)))return 1;
   // the ground only under the hood or in its mouth, fading out over the mouth (the plain cliff casts no shadow)
   let fade=0;for(const Q of P){if(planSD(Q,x,z)<0){const L=local(Q,x,z);fade=Math.max(fade,Math.min(1,(L.q+Q.mouth)/Q.mouth));}}if(!fade)return 1;
   let lit=0;const S=soft(unit(sun),deg===undefined?.052:Math.tan(deg*Math.PI/180));
   for(const D of S){let l1=1;for(let t=1;t<48&&l1;t+=1.2){const px=x+D[0]*t,py=y+.3+D[1]*t,pz=z+D[2]*t;for(const Q of P)if(planSD(Q,px,pz)<0&&dens(Q,px,py,pz,Q.base(px,pz))<0){l1=0;break;}}lit+=l1/S.length;}
   return 1-(1-lit)*fade;},
  rockAt(x,y,z){for(const Q of P){if(!near(Q,x,z,Q.margin+2))continue;if(dens(Q,x,y,z,Q.base(x,z))<0)return true;}return false;},
  // surface nets: one vertex per sign-changing cell (the mean of its edge crossings), one quad per sign-changing edge
  mesh(material,opt){opt=Array.isArray(opt)?{sun:opt}:(opt||{});
   const T=opt.THREE||(typeof BIO!=='undefined'&&BIO.host&&BIO.host.THREE)||root.THREE;if(!T)throw new Error('carve.mesh: no THREE');
   const SD=opt.sun?unit(opt.sun):null,AO=opt.ao!==false,REACH=opt.aoReach||32,CAST=opt.cast||'hood',out=[];
   const STEPS=[1,2.2,4,7,11,16,23,32].map(t=>t*REACH/32);
   const now=()=>(typeof performance!=='undefined'?performance.now():Date.now());
   for(const Q of P){const t0=now(),c=Q.cell,R=Q.hw+Q.depth+Q.margin+1,x0=Q.c[0]-R,z0=Q.c[1]-R,nx=Math.ceil(2*R/c),nz=nx;
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
    // the field, trilinear (outside the grid is open)
    const Fat=(X,Y,Z)=>{const fi=(X-x0)/c,fj=(Y-y0)/c,fk=(Z-z0)/c;if(fi<0||fj<0||fk<0||fi>=nx||fj>=ny||fk>=nz)return 1;
     const i=fi|0,j=fj|0,k=fk|0,u=fi-i,v=fj-j,w=fk-k,L=(a,b,t)=>a+(b-a)*t;
     return L(L(L(F[id(i,j,k)],F[id(i+1,j,k)],u),L(F[id(i,j+1,k)],F[id(i+1,j+1,k)],u),v),L(L(F[id(i,j,k+1)],F[id(i+1,j,k+1)],u),L(F[id(i,j+1,k+1)],F[id(i+1,j+1,k+1)],u),v),w);};
    const DIRS=[];for(let d=0;d<14;d++){const yv=1-(d+.5)/14*2,r=Math.sqrt(1-yv*yv),a=d*2.39996;DIRS.push([Math.cos(a)*r,yv,Math.sin(a)*r]);}
    const SOFT=SD?soft(SD,opt.penumbra===undefined?.052:Math.tan(opt.penumbra*Math.PI/180)):null,occ=new Float32Array(pos.length/3).fill(1),sunA=new Float32Array(pos.length/3).fill(1);
    for(let v=0;v<occ.length;v++){const X=pos[v*3],Y=pos[v*3+1],Z=pos[v*3+2],nX=nrm[v*3],nY=nrm[v*3+1],nZ=nrm[v*3+2];
     // ambient occlusion: 14 directions round the normal; only the rock round the void (within 3 m
     // of its plan, above its floor) occludes, so an open face of the patch does not darken
     if(AO){let seen=0,tot=0;
      for(const D of DIRS){let dx=D[0],dy=D[1],dz=D[2],dn=dx*nX+dy*nY+dz*nZ;if(dn<0){dx=-dx;dy=-dy;dz=-dz;dn=-dn;}
       let open=1;for(const t of STEPS){const px=X+dx*t,py=Y+dy*t,pz=Z+dz*t;if(py>Q.floorY+.3&&Fat(px,py,pz)<0&&planSD(Q,px,pz)<3){open=0;break;}}
       seen+=open*dn;tot+=dn;}
      occ[v]=Math.max(.22,seen/tot);}
     // the sun, on faces turned to it: 'hood' counts only the rock inside the plan (over the void)
     if(SD&&nX*SD[0]+nY*SD[1]+nZ*SD[2]>0){let lit=0;for(const J of SOFT){let l=1;for(let t=.8;t<60;t+=.9){const px=X+nX*.3+J[0]*t,py=Y+nY*.3+J[1]*t,pz=Z+nZ*.3+J[2]*t;
       if(Fat(px,py,pz)<0&&(CAST==='patch'||planSD(Q,px,pz)<0)){l=0;break;}}lit+=l/SOFT.length;}sunA[v]=lit;}}
    // quads: an edge between grid points that changes sign is shared by the four cells round it
    const quad=(a,b,c2,d,flip)=>{if(a<0||b<0||c2<0||d<0)return;if(flip)idx.push(a,b,c2,a,c2,d);else idx.push(a,c2,b,a,d,c2);};
    for(let k=1;k<nz;k++)for(let j=1;j<ny;j++)for(let i=0;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i+1,j,k)]<0;if(s0===s1)continue;quad(V[cid(i,j-1,k-1)],V[cid(i,j,k-1)],V[cid(i,j,k)],V[cid(i,j-1,k)],s0);}
    for(let k=1;k<nz;k++)for(let j=0;j<ny;j++)for(let i=1;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i,j+1,k)]<0;if(s0===s1)continue;quad(V[cid(i-1,j,k-1)],V[cid(i-1,j,k)],V[cid(i,j,k)],V[cid(i,j,k-1)],s0);}
    for(let k=0;k<nz;k++)for(let j=1;j<ny;j++)for(let i=1;i<nx;i++){const s0=F[id(i,j,k)]<0,s1=F[id(i,j,k+1)]<0;if(s0===s1)continue;quad(V[cid(i-1,j-1,k)],V[cid(i,j-1,k)],V[cid(i,j,k)],V[cid(i-1,j,k)],s0);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));
    g.setAttribute('aOcc',new T.Float32BufferAttribute(occ,1));g.setAttribute('aSun',new T.Float32BufferAttribute(sunA,1));g.setIndex(idx);g.computeBoundingSphere();
    const m=new T.Mesh(g,material);m.name='carve:'+Q.id;m.userData.carve=Q.id;m.userData.inspectLabel=Q.name||Q.id;out.push(m);
    Q.stats={verts:pos.length/3,tris:idx.length/3,ms:Math.round(now()-t0)};}
   return out;}};
 return C;}
const KCARVE=makeCarve();
root.KCARVE=KCARVE;
if(typeof BIO!=='undefined')BIO.carve=KCARVE;
})(typeof window!=='undefined'?window:globalThis);
