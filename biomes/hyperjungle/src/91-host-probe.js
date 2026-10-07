// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
// Raised from 5M / 1.4M per pass when the belt grew to six hypertree species,
// a 2 km hero disc, the extra understorey and the fauna (Sep 2026).
const BUDGET={
 showcase:{tris:11000000,calls:140},
 cls:{pass:6500000,host:600000},
 type:{'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
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
// species and plants that yield something edible the kit does not draw as a catalog fruit: named, not hidden
const FRUIT_NOT_DRAWN=['treefern','ginger','bromeliad'];
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome)n[M.name.replace(/^biome:/,'')]=(n[M.name.replace(/^biome:/,'')]||0)+M.count;});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // drawn); every catalog fruit the kit names is drawn by its item; the screwpines bear pandan-key heads
 fruit(SP,PL,N){const all=SP.map(S=>[S.key,S.tags]).concat(Object.keys(PL).map(k=>[k,PL[k].tags]));
  const untagged=all.filter(e=>!e[1].harvest).map(e=>e[0]);
  const miss=all.filter(e=>e[1].harvest&&e[1].harvest.edible.length&&!e[1].harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(e[0])<0).map(e=>e[0]);
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))];
  const undrawn=keys.filter(k=>!(N[HYPERJUNGLE.FRUIT_ITEMS[k]]>0));
  const ok=!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=4&&(N.pandankeys||0)>=20;
  return{ok,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged, '+keys.length+' catalog keys ('+keys.join(', ')+'); drawn: '+
   ['pod','capsule','bloom','pandankeys'].map(k=>k+' '+(N[k]||0)).join(', ')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(HYPERJUNGLE.SPECIES,HYPERJUNGLE.PLANTS,_itemCounts()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts();
 const noFruit=(S,k)=>S.key===k?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S;
 add('a fruiting species with no catalog fruit',HCHK.fruit(HYPERJUNGLE.SPECIES.map(S=>noFruit(S,'mahogany')),HYPERJUNGLE.PLANTS,N));
 add('screwpines with no pandan-key heads drawn',HCHK.fruit(HYPERJUNGLE.SPECIES,HYPERJUNGLE.PLANTS,Object.assign({},N,{pandankeys:0})));
 add('a plant with no harvest tag',HCHK.fruit(HYPERJUNGLE.SPECIES,Object.assign({},HYPERJUNGLE.PLANTS,{test:{name:'test',tags:{},items:[]}}),N));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
