/* ============================== HOOK: THE ENVIRONS' ROADS ([web]) ============================== */
/* Draws the roads of the places (77m: core/hamlet's lanes, each hamlet's link to the road net along the Ancient city's
   streets) and the plan's south road (77): a ribbon a road, sampled every 4 m, each edge laid on the drawn ground
   (HOOK_RUIN_DRAW.meshH, 90c) a few centimetres over it, so it follows the ground across its width; packed dirt for the
   lanes and links, the old road's grey for the south road. One mesh for all of them. It decides nothing about where a
   road runs. window._hookRoads holds what verify.py reads. */
const HOOK_ROADS={stats:null};
(()=>{const P=typeof HOOK_PLACES!=='undefined'?HOOK_PLACES:null,R=typeof HOOK_RUIN!=='undefined'?HOOK_RUIN:null,D=typeof HOOK_RUIN_DRAW!=='undefined'?HOOK_RUIN_DRAW:null;
 if(!P||!D||!D.meshH){window._hookRoads={ready:false};return;}
 const meshH=D.meshH,LIFT=.12,STEP=4,list=[];
 for(const r of P.roads)list.push({pts:r.pts,w:r.w,c:r.kind==='lane'?0x93805f:0x87714f});
 for(const r of (R&&R.roads)||[])list.push({pts:r.pts,w:8,c:0x7d7466});
 const pos=[],col=[],idx=[],c=new THREE.Color();let n=0,len=0;
 for(const r of list){c.setHex(r.c);const P2=[];
  for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L/STEP));len+=L;
   for(let s=0;s<k;s++)P2.push([a[0]+(b[0]-a[0])*s/k,a[1]+(b[1]-a[1])*s/k]);}
  P2.push(r.pts[r.pts.length-1]);if(P2.length<2)continue;
  const base=n;
  for(let i=0;i<P2.length;i++){const p=P2[i],q=P2[Math.min(P2.length-1,i+1)],o=P2[Math.max(0,i-1)],dx=q[0]-o[0],dz=q[1]-o[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*r.w/2,nz=dx/l*r.w/2;
   for(const s of [-1,1]){const x=p[0]+nx*s,z=p[1]+nz*s;pos.push(x,meshH(x,z)+LIFT,z);const k=.92+.16*(((i*7+s*3)%5+5)%5)/5;col.push(Math.pow(c.r*k,1.9),Math.pow(c.g*k,1.9),Math.pow(c.b*k,1.9));n++;}}   /* the table is sRGB-ish, vertex colours linear (as kits/port 71's ground) */
  for(let i=0;i<P2.length-1;i++){const a=base+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}   /* up-facing (and drawn both sides) */
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setIndex(n>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));g.computeVertexNormals();g.computeBoundingSphere();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.name='hook roads';m.userData.probeSkip=true;m.userData.own='roads';scene.add(m);
 HOOK_ROADS.mesh=m;HOOK_ROADS.stats={roads:list.length,km:+(len/1000).toFixed(2),verts:n};
 window._hookRoads={ready:true,stats:HOOK_ROADS.stats};})();
