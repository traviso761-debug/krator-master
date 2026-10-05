// ================================================================= OPEN WORLD — the floor: the kits' small plants, rocks and litter, near the camera
// [draw] Geometry near, texture far (VISUAL-BAR.md, A): every terrain chunk of 128 m or less (the nearest ~600 m) gets
// a floor, tiled from 32 m patches the nursery grew with each kit's own floor pass under a zone's profile. A patch cell
// is aligned to the world, so the same cell gets the same patch whatever chunk holds it. Per cell, by its hash:
// which kit (weighted by the overlays here), which profile (weighted by the kit's zones here, as its buildFloor mixes
// its planters), which of four variants, a quarter turn and a mirror. Every plant is set on the ground the chunk DRAWS
// (its own height grid), so nothing floats or sinks where the chunk's triangles cut a corner; plants are thinned whole
// where the kit's weight or its zones run out, and none stands in water. One mesh per material per chunk.
var FLOOR;LATE.push(()=>{FLOOR=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,PATCH=32,MAXS=128,FSEED=31337,REACH=380;   // REACH: no floor on a chunk further than this
const H=KRAND.hash,U=KRAND.unit;
const ST={chunks:0,meshes:0,verts:0,ms:0,waiting:0};
const QUEUE=new Set();let on=true;
function forChunk(n){if(n.s>MAXS)return;QUEUE.add(n);}
function free(n){const c=n.chunk;if(!c||!c.floor)return;for(const m of c.floor){scene.remove(m);m.geometry.dispose();ST.meshes--;}c.floor=null;ST.chunks--;}
const far=n=>{const P=camera.position,dx=Math.max(0,Math.abs(P.x-n.cx)-n.s/2),dz=Math.max(0,Math.abs(P.z-n.cz)-n.s/2);return Math.hypot(dx,dz)>REACH;};
function show(n,v){const c=n.chunk;if(c&&c.floor){const s=v&&on&&!far(n);for(const m of c.floor)m.visible=s;}}
// the profile weights at a point: the kit's own pick (WORLD_KITS[].floor.pick, from its zones as its buildFloor mixes them)
const profiles=(k,x,z)=>WORLD_KITS[k].floor.pick(x,z);
function build(n){const t0=performance.now(),c=n.chunk,N=Math.round(n.s/PATCH),G=new Map();let pending=false;
 const P=camera.position;
 for(let pj=0;pj<N;pj++)for(let pi=0;pi<N;pi++){const cx=c.x0+(pi+.5)*PATCH,cz=c.z0+(pj+.5)*PATCH,gx=Math.floor(cx/PATCH),gz=Math.floor(cz/PATCH),h=H(FSEED,gx,gz);
  if(!WORLD.inside(cx,cz)||WORLD.townW(cx,cz)>0||WORLD.roadD(cx,cz)<24)continue;   // no ground cover in a town or over a road
  const w=WORLD_KITS.map((_,q)=>WORLD.kitW(q,cx,cz)),tot=w.reduce((a,b)=>a+b,0);if(tot<.05)continue;
  let r=U(H(h,1))*tot,k=0;for(;k<w.length-1;k++){if(r<w[k])break;r-=w[k];}
  const kit=WORLD_KITS[k].name,pw=profiles(k,cx,cz);let pt=0;for(const p in pw)pt+=pw[p];if(pt<=.02)continue;
  let rp=U(H(h,2))*pt,prof=null;for(const p in pw){prof=p;if(rp<pw[p])break;rp-=pw[p];}
  const dens=Math.min(1,pt*1.1)*Math.min(1,w[k]*1.4),v=H(h,3)%4,rot=H(h,4)%4,mir=H(h,5)&1;
  const d=Math.hypot(cx-P.x,cz-P.z);
  const proto=NURSERY.get('F|'+kit+'|'+prof+'|'+v,{patch:true,kit,profile:prof,v},d);
  if(!proto){pending=true;continue;}
  const keep=new Map();
  const tf=(x,z)=>{if(mir)x=-x;return rot===0?[x,z]:rot===1?[-z,x]:rot===2?[-x,-z]:[z,-x];};
  for(const part of proto.parts){const g=part.geo,A=g.userData.anchor;if(!A)continue;
   const Pp=g.attributes.position.array,Nn=g.attributes.normal.array,Uu=g.attributes.uv.array,Cc=g.attributes.color.array,AN=g.attributes.aN?g.attributes.aN.array:null,AC=g.attributes.aC2?g.attributes.aC2.array:null;
   let gr=G.get(part.mat);if(!gr){gr={P:[],N:[],U:[],C:[],AN:[],AC:[],aN:!!AN,aC:!!AC};G.set(part.mat,gr);}
   const nv=Pp.length/3;
   for(let t=0;t<nv;t+=3){const ia=t*3,item=A[ia+2]>.5;let ax,az,gy;
    if(item){const key=A[ia]*131071+A[ia+1];let dcs=keep.get(key);
     if(dcs===undefined){const a=tf(A[ia],A[ia+1]);ax=cx+a[0];az=cz+a[1];gy=TERRAIN.chunkH(c,ax,az);
      const ok=U(H(h,Math.round(A[ia]*100),Math.round(A[ia+1]*100)))<dens&&WORLD.water(ax,az)<gy-.2;dcs=ok?gy:null;keep.set(key,dcs);}
     if(dcs===null)continue;gy=dcs;}
    for(let q=0;q<3;q++){const o=(t+q)*3,a=tf(Pp[o],Pp[o+2]),x=cx+a[0],z=cz+a[1];
     const y=item?Pp[o+1]+gy:Pp[o+1]+TERRAIN.chunkH(c,cx+tf(A[(t+q)*3],A[(t+q)*3+1])[0],cz+tf(A[(t+q)*3],A[(t+q)*3+1])[1]);
     gr.P.push(x-c.x0,y,z-c.z0);const nn=tf(Nn[o],Nn[o+2]);gr.N.push(nn[0],Nn[o+1],nn[1]);gr.U.push(Uu[(t+q)*2],Uu[(t+q)*2+1]);gr.C.push(Cc[o],Cc[o+1],Cc[o+2]);
     if(AN){const an=tf(AN[o],AN[o+2]);gr.AN.push(an[0],AN[o+1],an[1]);}if(AC)gr.AC.push(AC[o],AC[o+1],AC[o+2]);}}}}
 const meshes=[];
 for(const [mat,gr] of G){if(!gr.P.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(gr.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(gr.N,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(gr.U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(gr.C,3));
  if(gr.aN)g.setAttribute('aN',new THREE.Float32BufferAttribute(gr.AN,3));if(gr.aC)g.setAttribute('aC2',new THREE.Float32BufferAttribute(gr.AC,3));
  g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.position.set(c.x0,0,c.z0);m.matrixAutoUpdate=false;m.updateMatrix();m.visible=c.mesh.visible&&on&&!far(n);m.userData.inspectLabel='floor';
  scene.add(m);meshes.push(m);ST.verts+=gr.P.length/3;}
 if(c.floor)free(n);c.floor=meshes;ST.chunks++;ST.meshes+=meshes.length;ST.ms+=performance.now()-t0;
 return !pending;}
function update(budgetMs){const t0=performance.now(),P=camera.position;
 const L=[...QUEUE].filter(n=>{if(!n.chunk){QUEUE.delete(n);return false;}return true;})
  .sort((a,b)=>Math.hypot(a.cx-P.x,a.cz-P.z)-Math.hypot(b.cx-P.x,b.cz-P.z));
 ST.waiting=L.filter(n=>!far(n)).length;   // the chunks out of reach wait without counting
 for(const n of L){if(far(n))continue;
  // a chunk not drawn now keeps its place in the queue; one drawn gets its floor (again, once its patches have grown)
  if(!n.chunk.mesh.visible&&n.chunk.floor)continue;
  if(n._ft&&performance.now()-n._ft<400)continue;   // still waiting on its patches: try again in a moment
  n._ft=performance.now();if(build(n))QUEUE.delete(n);if(performance.now()-t0>budgetMs)break;}}
return{forChunk,free,show,update,stats:ST,setOn:v=>{on=v;}};})();});
