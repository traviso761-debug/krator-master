// ---------------------------------------------------------------- v2 helpers
kdef('strutW',new THREE.BoxGeometry(1,1,1),MAT.white); kdef('strutR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('cell',new THREE.BoxGeometry(1,1,.5),MAT.dot);
// The same cell on a LIT material. `cell` is MeshBasicMaterial, which is right
// for a window that is on and wrong for one that is off: a DEAD instance colour
// is 0x0a0c0e and an unlit material ignores the scene, so it renders at a fixed
// ~60/255 grey. In daylight that reads as a dark opening and nobody noticed.
// Put the scene into night for The Project and every dead window on the tower
// became a pale panel, brighter than the wall around it. This one goes black
// when the light does.
kdef('cellD',new THREE.BoxGeometry(1,1,.5),MAT.winDead);
kdef('winSmI',arcWindowGeo(1.1,2,.4),MAT.winIntact); kdef('winSmD',arcWindowGeo(1.1,2,.4),MAT.winDead);
function beam(name,a,b,w,dp,color){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.sqrt(dx*dx+dy*dy+dz*dz);
 const q=new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx,dy,dz).normalize());kput(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q,[w,L,dp],color||null);}
// A beam with its ROLL fixed (from the Forest Ring, QA arcA). beam() leaves roll
// to setFromUnitVectors, so a near-horizontal strut comes out with its section
// at whatever angle the shortest arc gives and a 9 x 11 strut reads as a
// twisted plank. Here local X (`w`, the DEPTH exactly as in beam()) is held in
// the vertical plane through the beam and local Z (`dp`) is horizontal, so
// every strut presents the same face to the same light. Same arguments as beam().
const _rbX=new THREE.Vector3(),_rbY=new THREE.Vector3(),_rbZ=new THREE.Vector3(),_rbM=new THREE.Matrix4();
function rbeam(name,a,b,w,dp,color){_rbY.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_rbY.length();
 if(!(L>1e-6))return;_rbY.multiplyScalar(1/L);
 _rbZ.set(-_rbY.z,0,_rbY.x);if(_rbZ.lengthSq()<1e-8)_rbZ.set(0,0,1);_rbZ.normalize();
 _rbX.crossVectors(_rbY,_rbZ);_rbM.makeBasis(_rbX,_rbY,_rbZ);
 kput(name,[(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5],
  new THREE.Quaternion().setFromRotationMatrix(_rbM),[w,L,dp],color||null);}
// ---------------------------------------------------------------- mouldings
// MOULDING: a profile swept along a path that lies in a wall. One helper for
// every hood, sill, cornice, string course and bone roll in the kit (it replaced
// three private ones: the civic hoods and cornices, the domestic `domMould`, the
// towers' Hotel sills and Cultural bands).
//   profile  [[n,u],...]: the section, walked CLOCKWISE with n out of the wall
//            (along `wn`) and u across the path (along wn x tangent: "up" for a
//            path running left to right on a wall you face). MOULD.* are stock.
//   path     t -> [x,y,z], t in 0..1, in the frame of the mesh it will join.
//   opt.wn   the wall's outward normal: [x,y,z], or t -> [x,y,z] on a curved wall.
//   opt.nu   segments along the path (40). opt.scale: t -> size multiplier
//            (knuckles, tapers). opt.hole(u,v): drop a quad (v runs round the
//            section). opt.uS/vS: uv scale. opt.caps: close both ends.
//   opt.up   [x,y,z]: if given, the section is turned so that u points this way
//            whichever way the path runs (and the winding is kept outward).
// Returns a BufferGeometry for the caller to merge or kdef: a moulding costs
// no draw call of its own.
const MOULD={
 // a round roll, n sides (the bone roll's section)
 round:(n,r)=>{n=n||8;r=r||1;const P=[];for(let j=0;j<=n;j++){const ph=j/n*TAU;P.push([r*Math.cos(ph),-r*Math.sin(ph)]);}return P;},
 // a flat band w proud, h tall
 band:(w,h)=>[[0,h],[w,h],[w,0],[0,0]],
 // a sill: weathered (sloped) top, square nose, a drip under the nose
 sill:(w,h)=>[[0,h],[w,h*.72],[w,h*.12],[w*.86,0],[0,0]],
 // a hood (label) mould: flat top, chamfered nose, a throated drip underneath
 hood:(w,h)=>[[0,h],[w*.7,h],[w,h*.45],[w*.8,0],[0,0]],
 // a cornice: square crown, then an ogee curving back into the wall
 cornice:(w,h)=>[[0,h],[w,h],[w,h*.8],[w*.86,h*.62],[w*.6,h*.46],[w*.38,h*.28],[w*.22,h*.08],[0,0]],
};
function moulding(profile,path,opt){opt=opt||{};const nu=opt.nu||40,np=profile.length-1;
 const wnF=typeof opt.wn==='function'?opt.wn:null,W=new THREE.Vector3();
 if(!wnF){const w=opt.wn||[0,0,1];W.set(w[0],w[1],w[2]).normalize();}
 const wAt=u=>{if(wnF){const w=wnF(u);W.set(w[0],w[1],w[2]).normalize();}return W;};
 const T=new THREE.Vector3(),B=new THREE.Vector3();
 const frame=u=>{const q=path(Math.min(1,u+.002)),o=path(Math.max(0,u-.002));
  T.set(q[0]-o[0],q[1]-o[1],q[2]-o[2]).normalize();B.crossVectors(T,wAt(u)).normalize();};
 let sg=1;if(opt.up){frame(.5);sg=-Math.sign(B.x*opt.up[0]+B.y*opt.up[1]+B.z*opt.up[2])||1;}
 const g=gridSurface((u,v)=>{const p=path(u);frame(u);const s=opt.scale?opt.scale(u):1,P=profile[Math.round(v*np)],pu=P[1]*sg;
  return[p[0]+s*(P[0]*W.x-pu*B.x),p[1]+s*(P[0]*W.y-pu*B.y),p[2]+s*(P[0]*W.z-pu*B.z)];},nu,np,{hole:opt.hole,uS:opt.uS,vS:opt.vS});
 if(sg<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.computeVertexNormals();}
 if(!opt.caps)return g;
 // caps: a fan from the section's centroid at each end, on vertices of their own
 const pos=g.attributes.position.array,cols=nu+1,P=[],N=[],U=[],I=[],nv0=pos.length/3;
 const f0=profile[0],f1=profile[np],m=Math.hypot(f0[0]-f1[0],f0[1]-f1[1])<1e-9?np:np+1;   // a closed section repeats its first point
 for(const[e,dir]of[[0,-1],[nu,1]]){const base=nv0+P.length/3;let cx=0,cy=0,cz=0;
  const vs=[];for(let j=0;j<m;j++){const k=(j*cols+e)*3;vs.push([pos[k],pos[k+1],pos[k+2]]);cx+=pos[k];cy+=pos[k+1];cz+=pos[k+2];}
  frame(e/nu);const n=T.clone().multiplyScalar(dir);
  P.push(cx/m,cy/m,cz/m);N.push(n.x,n.y,n.z);U.push(.5,.5);
  for(const v of vs){P.push(v[0],v[1],v[2]);N.push(n.x,n.y,n.z);U.push(0,0);}
  for(let j=0;j<m;j++){const a=base+1+j,b=base+1+(j+1)%m;if(dir*sg>0)I.push(base,a,b);else I.push(base,b,a);}}
 const M=new THREE.BufferGeometry(),A=g.attributes;
 const cat=(x,y)=>{const o=new Float32Array(x.length+y.length);o.set(x);o.set(y,x.length);return o;};
 M.setAttribute('position',new THREE.BufferAttribute(cat(A.position.array,P),3));
 M.setAttribute('normal',new THREE.BufferAttribute(cat(A.normal.array,N),3));
 M.setAttribute('uv',new THREE.BufferAttribute(cat(A.uv.array,U),2));
 M.setIndex(Array.from(g.index.array).concat(I));return M;}
function hexR(R,th){const a=R*Math.cos(Math.PI/6);const f=((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3);return a/Math.cos(f-Math.PI/6);}
// petal shell: base on +x at radius Rb, rises Hp, tip leans outward by `lean`, cupped by `curl`
function petalGeo(Rb,Hp,W,lean,curl,hole){return gridSurface((u,v)=>{const s=u*2-1;const w=W*(.3+.7*Math.sin(Math.PI*Math.pow(v,.9)))*.5;
 const x=Rb+lean*v-curl*s*s*w;return[x,Hp*v,s*w];},14,22,{uS:2,vS:4,hole});}
function petalRing(parent,n,Rb,Hp,W,lean,curl,y,d,seed,mat,skipFn){for(let i=0;i<n;i++){if(skipFn&&skipFn(i))continue;const g=petalGeo(Rb,Hp,W,lean,curl,d>0?(u,v)=>fbm(u*3+i,v*5,seed+i,2)<.3*d:null);
 const m=mesh(g,mat,parent,0,y,0);m.rotation.y=-i/n*TAU;}}
// Luce-style hypar shell pair: two warped sheets leaning together over a glass gable
function luceShells(parent,xc,zc,Wb,Hs,Dd,d,seed,skin){[-1,1].forEach(side=>{const g=gridSurface((u,v)=>{const x=xc+(u-.5)*Wb*(1-.55*v);const z=zc+side*(Dd*(1-v)*(1-.35*Math.pow(u-.5,2)*4)+.6*(1-v)+.5*v);return[x,Hs*v*(1-.15*Math.pow((u-.5)*2,2)),z];},20,16,{uS:4,vS:3,hole:holeFn(d*.7,seed+side,null,2)});
 mesh(g,skin,parent);});
 if(d===0){const s=new THREE.Shape();s.moveTo(-Wb/2,0);s.lineTo(Wb/2,0);s.lineTo(0,Hs*.98);s.lineTo(-Wb/2,0);const gl=mesh(new THREE.ShapeGeometry(s),MAT.glass,parent,xc,0,zc+.2);}
 kput('archOpen',[xc,3,zc-Dd*.05],qFacing([0,0,1]),[.45,.45,1],null);}
function ribCurveGeo(pts,r){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],0))),28,r,8,false);}

