// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:10000000,calls:300},   // the ceiling for this 5 km map at q=1 (KNOWN_ISSUES). Calls were ~100 at the first view before the trees became variants: each variant part is one InstancedMesh (~140 of them), the shape Godot draws as MultiMeshes
 cls:{pass:7500000,host:900000},
 type:{'nwbay/trees':'pass','nwbay/floor':'pass','nwbay/reeds':'pass','nwbay/dress':'pass','nwbay/fauna':'pass','host':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 REG.forEach((r,i)=>{for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
// the biome's own invariants: the height ceiling (nothing Girder-sized), the
// karst mask (nothing rooted on a cliff face), the figs on the karst
function extra(){const R=[];const T=NWBAY.TREES||[];
 let tallest=0,tallSp='';T.forEach(t=>{if(t.H>tallest){tallest=t.H;tallSp=NWBAY.SPECIES[t.sp].key;}});
 R.push({name:'height-ceiling',ok:tallest<=NWBAY.TEMPLE_H*1.01+.5,detail:'tallest tree '+tallest.toFixed(1)+' m ('+tallSp+') against a ceiling of '+NWBAY.TEMPLE_H+' m'});
 let onFace=0;T.forEach(t=>{const k=BIO.field('karst',t.x,t.z);if(k>.03&&k<.9)onFace++;});
 R.push({name:'nothing-on-a-cliff-face',ok:onFace===0,detail:onFace+' trees rooted where karst is between .03 and .9 (the rim band)'});
 const figs=T.filter(t=>NWBAY.SPECIES[t.sp].key==='clifffig'),figsOnKarst=figs.filter(t=>BIO.field('karst',t.x,t.z)>.9).length;
 R.push({name:'figs-on-the-karst',ok:figs.length>0&&figsOnKarst===figs.length,detail:figs.length+' cliff figs, '+figsOnKarst+' of them on the karst'});
 const under=T.filter(t=>t.y0<-1.9&&NWBAY.SPECIES[t.sp].key!=='mangrove').length;
 R.push({name:'nothing-rooted-under-water',ok:under===0,detail:under+' non-mangrove trees with their foot below -1.9 m'});
 // the tsingy and the sinkholes (host geometry the biome cannot see): no tree rooted inside a blade's footprint or
 // on a sinkhole's wall band, and the Madagascarene flora where the zones say
 if(typeof pinAt==='function'){let inBlade=0;T.forEach(t=>{if(tsingyK(t.x,t.z)>0&&pinAt(t.x,t.z)<0)inBlade++;});
  R.push({name:'nothing-in-a-blade',ok:inBlade===0,detail:inBlade+' trees rooted inside a tsingy blade ('+PINS.length+' blades)'});}
 if(typeof sinkAt==='function'){let onWall=0;T.forEach(t=>{const Q=sinkAt(t.x,t.z);if(Q&&Q.d>-4&&Q.d<4)onWall++;});
  const floor=T.filter(t=>BIO.field('hollow',t.x,t.z)>.5).length;
  R.push({name:'nothing-on-a-sinkhole-wall',ok:onWall===0,detail:onWall+' trees within 4 m of a sinkhole rim; '+floor+' on the floors'});}
 const mada=['spinewand','rockbottle','avenuebaobab','travellerfan'].map(k=>k+':'+T.filter(t=>NWBAY.SPECIES[t.sp].key===k).length);
 R.push({name:'madagascarene-flora',ok:mada.every(x=>+x.split(':')[1]>0),detail:mada.join(' ')});
 // every hero is a variant (biomes/WORLD.md: trees as variants), and no species has more than NWBAY.VARIANTS of them
 {const heroes=T.filter(t=>t.lv>0),byV={};heroes.forEach(t=>{const k=t.sp;(byV[k]=byV[k]||new Set()).add(t.variant);});
  const most=Math.max(0,...Object.values(byV).map(s=>s.size)),nov=heroes.filter(t=>t.variant==null).length;
  R.push({name:'heroes-are-variants',ok:nov===0&&most<=NWBAY.VARIANTS,detail:heroes.length+' heroes drawn from '+(NWBAY.PROTOS?NWBAY.PROTOS.size:0)+' prototypes; at most '+most+' variants a species; '+nov+' without one'});}
 return R;}
window._api={BUDGET,REG,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,extra,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
