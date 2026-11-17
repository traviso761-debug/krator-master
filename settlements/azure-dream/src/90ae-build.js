// ================================================================= GRĒṬ-ĀIL — the build: the retaining walls, every place, chunk by chunk
// The pads and terraces (89zad) stand on the slope: where one stands off the ground at its edge by more than a metre, an ashlar
// face (the Qiblai pack's qAshB) runs from the lower ground to the upper, every 6 m along the edge. Then every record of
// AD_PLACE, through VERN.place at its level (o.y), chunk by chunk (240 m), each chunk baked into its own group and drawn while in
// view and range, as Qiblai's city does. Each building's lamps (adLamp, 89qa) are turned into the world: AD_LAMPS. [web]: three.js.
reseed(34153);const AD_B0=performance.now();
const AD_LAMPS=[];   /* [x, y, z, kind]: every lamp a building hangs, in world metres (90af's light pool by night) */
// ---------------------------------------------------------------- the retaining faces
const AD_RETAIN=new THREE.Group();AD_RETAIN.name='retaining walls';scene.add(AD_RETAIN);
{const stone=xC(xPick(QSTONE)),G=AD_RETAIN;let n=0;
 for(const p of AD_PADS){const edges=[[p.x0,p.z0,p.x1,p.z0,0,-1],[p.x0,p.z1,p.x1,p.z1,0,1],[p.x0,p.z0,p.x0,p.z1,Math.PI/2,-1],[p.x1,p.z0,p.x1,p.z1,Math.PI/2,1]];
  for(const [ax,az,bx,bz,ry,s] of edges){const L=Math.hypot(bx-ax,bz-az),k=Math.max(1,Math.round(L/6)),seg=L/k;
   for(let i=0;i<k;i++){const t=(i+.5)/k,x=ax+(bx-ax)*t,z=az+(bz-az)*t,ox=ry?s*.6:0,oz=ry?0:s*.6,g=adBase(x+ox*3,z+oz*3);
    if(Math.abs(g-p.y)<1)continue;
    /* another pad that holds the outside point lies over it (two terraces meeting): the face is the higher one's */
    const q=adPadAt(x+ox*3,z+oz*3);const lo=q?Math.min(q.y,p.y):Math.min(g,p.y),hi=q?Math.max(q.y,p.y):Math.max(g,p.y);if(hi-lo<1)continue;
    /* a solid face 7 m deep on the outer side: the ground's 6 m cells smear the step over one cell outside the edge, and the face
       stands over that smear */
    const T=p.id.startsWith('terrace:')?7:p.id.startsWith('landing:')?1.2:3,cx=x+(ry?s*T/2:0),cz=z+(ry?0:s*T/2);vB('qAshB',cx,lo-1,cz,seg+.05,hi-lo+1.4,T,ry,stone);n++;}}}
 kbake(G);for(const k in KIT.items)KIT.items[k].length=0;window._adRetain=n;}
// ---------------------------------------------------------------- the places, chunk by chunk
for(const p of AD_PLACE)if(p.o.y==null)p.o.y=Math.max(0,terrainH(p.x,p.z));   /* a place with no pad and no level: on the ground as it lies (the beached dugouts) */
const AD_CHUNK=240,AD_CHUNKS={};
for(const p of AD_PLACE){const k=p.kind==='wall'?'walls':Math.floor(p.x/AD_CHUNK)+','+Math.floor(p.z/AD_CHUNK);(AD_CHUNKS[k]=AD_CHUNKS[k]||[]).push(p);}
const AD_GROUPS=[];let AD_INST=0;
function adBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;p.lamps=[];AD_LAMPREC.cur=p.lamps;
  if(p.kind!=='wall'&&p.kind!=='boat'){p.stacks=[];QB_SHELLREC.cur=p.stacks;}
  const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);AD_LAMPREC.cur=null;QB_SHELLREC.cur=null;if(g)p.G=g;
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;REG[i].id=REG[i].id||p.id;
   /* a terrace stair registered 1.2 m tall at its head (kits/qiblai 89q4 before 4f1f45adf, which registers its whole fall):
      where the kit's record is still the short one, set (not add) its volume to span the fall; a no-op once the kit's fix is here */
   if(p.key==='qb_terrace_stair'&&p.o.rise&&REG[i].h<p.o.rise){REG[i].y=p.o.y-p.o.rise-1.5;REG[i].h=p.o.rise+2.7;}}
  for(const L of p.lamps){const w=loc(p.x,p.z,L[0],L[2],p.ry);AD_LAMPS.push([w[0],qcDflt(p.o.y,0)+L[1],w[1],L[3],p.id]);}
  const r=Math.max(qcDflt(p.w,10),qcDflt(p.d,10))/2+10;x0=Math.min(x0,p.x-r);x1=Math.max(x1,p.x+r);z0=Math.min(z0,p.z-r);z1=Math.max(z1,p.z+r);y0=Math.min(y0,qcDflt(p.o.y,0)-8);y1=Math.max(y1,qcDflt(p.o.y,0)+qcDflt(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();AD_INST+=qcDflt(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='walls'?1e9:2600,n:list.length};AD_GROUPS.push(e);
 window._registered=REG.length;   /* the registry so far (Xanadu's 90-scene set it before the site was placed) */
 return e;}
function qcDflt(v,d){return v==null?d:v;}
for(const k of Object.keys(AD_CHUNKS).sort())adBakeChunk(k,AD_CHUNKS[k]);
window._instances=AD_INST;
const adFr=new THREE.Frustum(),adPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();adPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);adFr.setFromProjectionMatrix(adPm);const P=camera.position;let shown=0;
 for(const e of AD_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&adFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu's biome over the page's mask (89zad: the isle's woods, the shore's redwoods and reeds), then
// baked with the builders' own plants (the gardens' xaPlant), as Qiblai's city does; its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:AD_SITE.bio.R,quality:1,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._chunks=AD_GROUPS.length;window._buildMs=Math.round(performance.now()-AD_B0);
window._azure=Object.assign({},window._adSite,{placed:AD_PLACE.length,chunks:AD_GROUPS.length,lamps:AD_LAMPS.length,retain:window._adRetain,
 byKind:AD_PLACE.reduce((a,p)=>{a[p.kind]=qcDflt(a[p.kind],0)+1;return a;},{}),cots:AD_HALL.cots.length,
 cotsByTurning:AD_HALL.cots.reduce((a,c)=>{a[c[3]]=qcDflt(a[c[3]],0)+1;return a;},{})});
