// ================================================================= QIBLAI — the build: the walls, the kora, the plan's buildings, outside the wall
// Order: the rings' walls (each on its terrace's edge: the made ground's retaining face in ashlar, the wall on top), their
// gate towers and their corner and curtain towers; the kora's prayer-wheel arcades along its inner side and a chorten on
// every crossing; the ghat way and the ghats at the river, the caravanserai on the road south; then every building of the
// plan (89zq: the infill's lots, the Temple Mountain, the eight monasteries, the gate markets), chunk by chunk, each chunk
// baked into its own group and drawn while it is in view and in range (Erewhon's runtime LOD). [web]: three.js.
reseed(QC.SEED+2);const QC_B0=performance.now();
const QC_EXTRA=[];   // the site's own pieces, placed like the plan's buildings
const qcLevelAt=(x,z)=>{const l=KCITY.squares.levelAt(QC_S,x,z);return l==null?terrainH(x,z):l;};
// ---------------------------------------------------------------- the walls: each segment a qb_wall run of its length, its face out
for(const W of QC_S.walls){const outer=W.kind==='outer',v=outer?0:1;
 for(const s of W.segs){const dx=s.bx-s.ax,dz=s.bz-s.az,L=Math.hypot(dx,dz);if(L<2)continue;
  const mx=(s.ax+s.bx)/2,mz=(s.az+s.bz)/2;let nx=dz/L,nz=-dx/L;if(nx*(mx-QC_LM.x)+nz*(mz-QC_LM.z)<0){nx=-nx;nz=-nz;}
  QC_EXTRA.push({key:'qb_wall',x:mx,z:mz,ry:Math.atan2(nx,nz),o:{v,len:L,y:W.yIn==null?qcLevelAt(mx,mz):W.yIn},kind:'wall',retain:[W.yOut,W.yIn,W.thick+1.2,L],id:W.id+':'+mx.toFixed(0)+','+mz.toFixed(0),h:10});}
 for(const g of W.gates)QC_EXTRA.push({key:'qb_wall_gate',x:g.x,z:g.z,ry:g.ry,o:{v,y:g.yIn==null?qcLevelAt(g.x,g.z):g.yIn},kind:'gate',retain:[g.yOut,g.yIn,outer?16:9,outer?26:16],id:g.id,h:26});
 for(const t of W.towers){if(t.kind==='gate')continue;QC_EXTRA.push({key:'qb_wall_corner',x:t.x,z:t.z,ry:0,o:{v,y:W.yIn==null?qcLevelAt(t.x,t.z):W.yIn},kind:'tower',retain:[W.yOut,W.yIn,t.size+1,t.size+1],id:t.id,h:16});}}
// ---------------------------------------------------------------- the kora: arcades along its inner side, a chorten at every crossing
const QC_KORA=QC_S.ways.find(w=>w.kind==='kora');
if(QC_KORA){const P=QC_KORA.pts,n=P.length,y=QC_KORA.level==null?qcLevelAt(P[0][0],P[0][1]):QC_KORA.level;
 for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];if(!QC_KORA.closed&&i===n-1)break;const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  let ix=-uz,iz=ux;if(ix*(QC_LM.x-(a[0]+b[0])/2)+iz*(QC_LM.z-(a[1]+b[1])/2)<0){ix=-ix;iz=-iz;}   // toward the centre
  const off=QC_KORA.w/2-1.75,ry=Math.atan2(-ix,-iz),seg=24.4;
  for(let s=16;s+seg<=L-16;s+=seg+.8){const m=s+seg/2;if(Math.abs(m-L/2)<seg/2+16)continue;   // the avenue crosses mid-side
   QC_EXTRA.push({key:'qb_kora_arcade',x:a[0]+ux*m+ix*off,z:a[1]+uz*m+iz*off,ry,o:{v:(i+Math.round(m))%3,len:seg,y},kind:'arcade',id:'kora:'+i+':'+Math.round(m),h:6});}}}
for(const c of QC_S.crossings)if(c.chorten)QC_EXTRA.push({key:'qb_chorten',x:c.x,z:c.z,ry:0,o:{v:1,y:qcLevelAt(c.x,c.z)},kind:'chorten',id:c.id,h:7});
// ---------------------------------------------------------------- outside the wall: the ghat way, the ghats, the caravanserai
{const x0=QC_B.x1+30,x1=QC_RIVER.x-QC_RIVER.w/2-34;let k=0;
 for(let x=x0+40;x<x1-30;x+=110,k++){const s=k%2?1:-1;QC_EXTRA.push({key:k%3===2?'qb_shrine':'qb_chorten',x,z:s*15,ry:s>0?Math.PI:0,o:{v:k%3===2?k%2:0,y:terrainH(x,s*15)},kind:'ghatway',id:'ghatway:'+k,h:6});}
 QC_EXTRA.push({key:'qb_ghats',x:QC_RIVER.x-QC_RIVER.w/2-11,z:0,ry:Math.PI/2,o:{v:0,y:QC_RIVER.y+.05},kind:'ghats',id:'ghats',h:14});
 QC_EXTRA.push({key:'qb_caravanserai',x:-60,z:QC_B.z1+150,ry:Math.PI/2,o:{v:0,y:terrainH(-60,QC_B.z1+150)},kind:'caravanserai',id:'caravanserai',h:14});}
// ---------------------------------------------------------------- the build, chunk by chunk
const QC_ALL=QC_PLACE.concat(QC_EXTRA);
const QC_CHUNK=400,QC_CHUNKS={};
for(const p of QC_ALL){const k=p.kind==='landmark'?'landmark':(p.kind==='wall'||p.kind==='gate'||p.kind==='tower')?'walls':Math.floor(p.x/QC_CHUNK)+','+Math.floor(p.z/QC_CHUNK);(QC_CHUNKS[k]=QC_CHUNKS[k]||[]).push(p);}
const QC_GROUPS=[];let QC_INST=0;
function qcBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){
  // the made ground's retaining face under a wall, a gate or a tower: ashlar from the lower terrace to the upper
  if(p.retain&&p.retain[0]!=null&&p.retain[1]!=null&&p.retain[1]-p.retain[0]>.2){TSTAT.cur='qc_retain/0';vB('qAshB',p.x,p.retain[0]-.5,p.z,p.retain[3],p.retain[1]-p.retain[0]+.5,p.retain[2],p.ry,xC(xPick(QSTONE)));}
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);if(g)p.G=g;for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,qcD(p.o.y,0));y1=Math.max(y1,(qcD(p.o.y,0))+qcD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();QC_INST+=qcD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='landmark'||key==='walls'?1e9:2200,n:list.length};QC_GROUPS.push(e);return e;}
for(const k of Object.keys(QC_CHUNKS).sort())qcBakeChunk(k,QC_CHUNKS[k]);
window._instances=QC_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const qcFr=new THREE.Frustum(),qcPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();qcPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);qcFr.setFromProjectionMatrix(qcPm);const P=camera.position;let shown=0;
 for(const e of QC_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&qcFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu biome built over the city's mask (89zq: the country, the gardens, the odd tree in a yard), then baked
// with the builders' own plants (xaPlant); its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:2300,quality:.8,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=QC_GROUPS.length;window._buildMs=Math.round(performance.now()-QC_B0);
window._qiblai=Object.assign(window._qiblaiPlan||{},{placed:QC_ALL.length,extra:QC_EXTRA.length,chunks:QC_GROUPS.length,
 byKind:QC_ALL.reduce((a,p)=>{a[p.kind]=qcD(a[p.kind],0)+1;return a;},{}),xanaduShare:(()=>{const h=QC_PLACE.filter(p=>p.kind==='lot'&&/^(qb_row_|qb_corner|qb_court|xa_(rich|mid|poor))/.test(p.key));return h.length?+(h.filter(p=>/^xa_/.test(p.key)).length/h.length).toFixed(3):0;})()});
