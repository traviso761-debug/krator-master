// ================================================================= THE FLASHING EYE — the build: the retaining faces, every place, chunk by chunk
// Where a pad stands off the ground at its edge by more than a metre, an ashlar face (the Qiblai pack's qAshB) runs from the lower
// ground to the upper, every 6 m along the edge. Then every record of FE_PLACE through VERN.place at its level (o.y), chunk by
// chunk (240 m), each chunk baked into its own group and drawn while in view and range, as the Azure Dream's page does. Each
// building's lights (feLamp, 89qf) are turned into the world: FE_LAMPS. Then the Vale of Xanadu's flora over the site's mask.
// [web]: three.js.
reseed(34464);const FE_B0=performance.now();
const FE_LAMPS=[];
const FE_SMOKES=[];   /* [x, y, z, kind]: the chimneys' smoke and the bath's steam, in world metres (90fh) */   /* [x, y, z, kind, id]: the Ember's window and the fire basket, in world metres (90fh lights them by the hour) */
const FE_RETAIN=new THREE.Group();FE_RETAIN.name='retaining walls';scene.add(FE_RETAIN);
{const stone=xC(0x4a4542);let n=0;
 for(const p of FE_PADS){const edges=[[p.x0,p.z0,p.x1,p.z0,0,-1],[p.x0,p.z1,p.x1,p.z1,0,1],[p.x0,p.z0,p.x0,p.z1,Math.PI/2,-1],[p.x1,p.z0,p.x1,p.z1,Math.PI/2,1]];
  for(const [ax,az,bx,bz,ry,s] of edges){const L=Math.hypot(bx-ax,bz-az),k=Math.max(1,Math.round(L/6)),seg=L/k;
   for(let i=0;i<k;i++){const t=(i+.5)/k,x=ax+(bx-ax)*t,z=az+(bz-az)*t,ox=ry?s*.6:0,oz=ry?0:s*.6,g=feBase(x+ox*3,z+oz*3);
    if(Math.abs(g-p.y)<1)continue;const lo=Math.min(g,p.y),hi=Math.max(g,p.y),T=3,cx=x+(ry?s*T/2:0),cz=z+(ry?0:s*T/2);
    vB('qAshB',cx,lo-1,cz,seg+.05,hi-lo+1.4,T,ry,stone);n++;}}}
 /* the banks the bench is cut into, behind its north, west and east walls: dry-stone walls along the bank's contours every 1.5 m,
    so it reads as terraced, not bare earth; open where the Way of Breath and the mule road come through */
 const dry=xC(0x6e675f),T0=FE.L.terraces;let nb=0;
 const bank=(x0,z0,dx,dz,lvl,len,along)=>{for(let k=1;k<12;k++){const L=lvl+1.5*k;let hit=null;for(let s=0;s<=len;s+=.5){const x=x0+dx*s,z=z0+dz*s;if(terrainH(x,z)>=L){hit=[x,z];break;}}
  if(!hit)break;vB('qAshB',hit[0],L-1.7,hit[1],along?6.1:.9,1.85,along?.9:6.1,0,dry);nb++;}};
 for(let x=-93;x<=93;x+=6)if(Math.abs(x)>6)bank(x,-147,0,-1,T0[T0.length-1].y,40,true);
 for(let z=-141;z<=-30;z+=6)for(const s of[-1,1]){if(s<0&&Math.abs(z+87)<9)continue;bank(s*92,z,s,0,FLASHING_EYE.terraceY(FE.L,z),40,false);}
 kbake(FE_RETAIN);for(const k in KIT.items)KIT.items[k].length=0;window._feRetain=n;window._feBanks=nb;}
const FE_CHUNK=240,FE_CHUNKS={};
for(const p of FE_PLACE){const k=p.kind==='wall'?'walls':Math.floor(p.x/FE_CHUNK)+','+Math.floor(p.z/FE_CHUNK);(FE_CHUNKS[k]=FE_CHUNKS[k]||[]).push(p);}
const FE_GROUPS=[];let FE_INST=0;
const feD=(v,d)=>v==null?d:v;
function feBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;p.lamps=[];FE_LAMPREC.cur=p.lamps;p.smokes=[];FE_SMOKEREC.cur=p.smokes;
  if(p.kind!=='wall'){p.stacks=[];QB_SHELLREC.cur=p.stacks;}
  const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);FE_LAMPREC.cur=null;FE_SMOKEREC.cur=null;QB_SHELLREC.cur=null;if(g)p.G=g;
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;REG[i].id=REG[i].id||p.id;}
  for(const L of p.smokes){const w=loc(p.x,p.z,L[0],L[2],p.ry);FE_SMOKES.push([w[0],feD(p.o.y,0)+L[1],w[1],L[3]]);}
  for(const L of p.lamps){const w=loc(p.x,p.z,L[0],L[2],p.ry);FE_LAMPS.push([w[0],feD(p.o.y,0)+L[1],w[1],L[3],p.id]);}
  const r=Math.max(feD(p.w,10),feD(p.d,10))/2+10;x0=Math.min(x0,p.x-r);x1=Math.max(x1,p.x+r);z0=Math.min(z0,p.z-r);z1=Math.max(z1,p.z+r);y0=Math.min(y0,feD(p.o.y,0)-40);y1=Math.max(y1,feD(p.o.y,0)+feD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();FE_INST+=feD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='walls'?1e9:4200,n:list.length};FE_GROUPS.push(e);
 window._registered=REG.length;return e;}
for(const k of Object.keys(FE_CHUNKS).sort())feBakeChunk(k,FE_CHUNKS[k]);
window._instances=FE_INST;
const feFr=new THREE.Frustum(),fePm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();fePm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);feFr.setFromProjectionMatrix(fePm);const P=camera.position;let shown=0;
 for(const e of FE_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&feFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu's biome over the site's mask (89zfe), then baked; its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1500,quality:.7,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._chunks=FE_GROUPS.length;window._buildMs=Math.round(performance.now()-FE_B0);
window._flashing=Object.assign({},window._feSite,{placed:FE_PLACE.length,chunks:FE_GROUPS.length,lamps:FE_LAMPS.length,retain:window._feRetain,
 byKind:FE_PLACE.reduce((a,p)=>{a[p.kind]=feD(a[p.kind],0)+1;return a;},{})});
