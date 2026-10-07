// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 // held in memory (the heroes' lite stand-ins included) / drawn at any one camera, with the runtime LOD /
 // draw calls (KNOWN_ISSUES, BUDGET). Measured Oct 2026 at the 27 presets: 11.6M held; 4.1-8.1M drawn
 // (renderer.info; BIO.lodShown counts the chunk meshes only, ~0.9M less) in 216-403 calls; 1.3M / 99 from afar.
 // Before the LOD every camera drew all 11.7M in ~63 calls. `rendered` is tracked, not asserted by verify.py.
 showcase:{tris:12000000,calls:450,rendered:9000000},
 cls:{pass:9000000,host:900000},
 type:{'lowlands/trees':'pass','lowlands/floor':'pass','lowlands/dress':'pass','host':'host'},
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
// ---------------------------------------------------------------- the host's own checks (verify.py runs them when present)
// species that yield something edible the kit does not draw as a catalog fruit (acorns, palm fruit, bay berries,
// seeds, palm heart): named, not hidden (biomes/FRUIT.md)
const FRUIT_NOT_DRAWN=['kapok','canepalm','sprawloak','corkoak','coastoak','skirtpalm','pine','baylaurel'];
function _instNames(){const o=[];scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome)o.push([M.name,M.count]);});return o;}
const HCHK={
 // fruit: every species and fruiting plant carries a harvest tag, every edible one names a catalog piece (or is listed
 // as not drawn), the kit names the four catalog keys of FRUIT.md, and the figs and pods are drawn on the stage
 fruit(SP,PL,N){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const cnt=re=>N.filter(n=>re.test(n[0])).reduce((a,n)=>a+n[1],0),figs=cnt(/^biome:fig$/),pods=cnt(/^biome:pod$/);
  const keys=SWLOW.FRUIT_KEYS,want=['generic_fruit_madrone','generic_fruit_rattlepod','generic_fruit_ember_tamarind','generic_fruit_pillar_fig'],lost=want.filter(k=>keys.indexOf(k)<0);
  return{ok:!miss.length&&!untagged.length&&!lost.length&&figs>=500&&pods>=500,
   detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(lost.length?'catalog keys missing: '+lost.join(', ')+'; ':'')
    +figs+' figs and '+pods+' pods drawn; '+SP.length+' species and '+Object.keys(PL).length+' plant tagged; catalog keys: '+keys.length};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_instNames();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_instNames();
 add('a fruiting species with no catalog fruit',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='rattlepod'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),SWLOW.PLANTS,N));
 add('a species with no harvest tag',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='madrone'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),SWLOW.PLANTS,N));
 add('the figs never drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N.filter(n=>n[0]!=='biome:fig')));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
