// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from BIO.stats
// (charged by BIO.cur inside the biome); the biome's own invariants (every
// species placed, the stream descending, nothing rooted in the water or on a
// cliff, the tower hung with growth, the night lighting the glow) are measured
// here from the built scene.
const BUDGET={
 showcase:{tris:32000000,calls:520,rendered:15000000},   // held in memory (stand-ins included) / drawn at any one camera, with the runtime LOD
 cls:{pass:22000000,host:1500000},
 type:{'nhighlands/trees':'pass','nhighlands/floor':'pass','nhighlands/dress':'pass','host':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i+=Math.max(1,Math.floor(o.count/4000))){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
 return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
// the instances of one item, as positions
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
function biomeChecks(){const R={};
 // every species placed at least once
 R.missing=NHL.SPECIES.filter((S,i)=>!NHL.TREES.some(T=>T.sp===i)).map(S=>S.key);
 R.bySpecies=NHL.SPECIES.map((S,i)=>S.key+':'+NHL.TREES.filter(T=>T.sp===i).length).join(' ');
 // the stream descends: its surface never climbs, its bed is always under its surface
 let mono=true,under=true;for(let i=1;i<STREAM.level.length;i++){if(STREAM.level[i]>STREAM.level[i-1]+1e-6)mono=false;if(STREAM.bed[i]>STREAM.level[i])under=false;}
 R.stream={monotone:mono,bedUnder:under,drop:+(STREAM.level[0]-STREAM.level[STREAM.level.length-1]).toFixed(1),falls:STREAM.falls.length,lenKm:+(STREAM.LEN/1000).toFixed(2)};
 // nothing rooted in the water: trees, and the floor's plants (the stepping stones are the one thing meant to stand in it)
 R.treesInWater=NHL.TREES.filter(T=>BIO.depth(T.x,T.z)>.05).length;
 const FLOOR=['frond','lady','lace','pleat','blade','bell','heath','sorrel','ucard','mondo','spike','paddle','spurge','smoke','disc','cane','bracken','zebra'];
 let wet=0,n=0;FLOOR.forEach(it=>itemPositions(it,7).forEach(p=>{n++;if(BIO.depth(p[0],p[2])>.35)wet++;}));R.floorInWater={wet,of:n};
 // nothing rooted on a cliff
 R.treesOnCliffs=NHL.TREES.filter(T=>FC.at(FC.a.slope,T.x,T.z)>1.5&&T.lv>0).length;
 // the probe's finds: a great trumpet, a colony of understorey trumpets, the glow
 R.greatTrumpets=NHL.TREES.filter(T=>T.sp===NHL.KEY.greattrumpet).length;
 R.biggestColony=NHL.COLONIES.reduce((m,c)=>Math.max(m,c.sp===NHL.KEY.trumpet?c.n:0),0);
 R.bulbs=itemPositions('bulb').length;R.pods=itemPositions('lantern').length;
 // the tower carries hanging growth under its slabs
 let hang=0;if(TOWER.top)['drape','beard','bulb','lantern'].forEach(it=>itemPositions(it).forEach(p=>{if(Math.abs(p[0]-TOWER.x)<27&&Math.abs(p[2]-TOWER.z)<27&&p[1]>TOWER.y0+3&&p[1]<TOWER.top+2)hang++;}));R.towerHanging=hang;
 // and its upper floors run colder: beard lichen above, hanging moss below
 if(TOWER.top){const mid=(TOWER.y0+TOWER.top)/2;const cnt=(it,lo,hi)=>itemPositions(it).filter(p=>Math.abs(p[0]-TOWER.x)<27&&Math.abs(p[2]-TOWER.z)<27&&p[1]>lo&&p[1]<hi).length;
  R.towerGradient={mossLow:cnt('drape',TOWER.y0,mid),mossHigh:cnt('drape',mid,TOWER.top+2),lichenLow:cnt('beard',TOWER.y0,mid),lichenHigh:cnt('beard',mid,TOWER.top+2)};}
 // the night raises the glow
 const was=NHL._night,nk=NHL.setNight(1);R.night={bulb:+nk.bulb.toFixed(2),pod:+nk.pod.toFixed(2)};NHL.setNight(was);R.day=NHL.setNight(was);
 return R;}
window._api={BUDGET,REG,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,biomeChecks,itemPositions,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
