// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 // held in memory (the heroes' lite stand-ins included) / drawn at any one camera, with the runtime LOD /
 // draw calls (KNOWN_ISSUES, BUDGET). The agreed 10M at q=1 plus the stand-ins (0.29M). Measured Oct 2026:
 // 10.13M held; 4.7-7.0M drawn at the presets checked (renderer.info; BIO.lodShown counts the chunk meshes
 // only, 2.0-6.2M over the 27 presets) in 169-273 calls. Before the LOD every camera drew all ~10.5M in
 // 57-97 calls. `rendered` is tracked, not asserted by verify.py.
 showcase:{tris:10500000,calls:400,rendered:8000000},
 cls:{pass:7500000,host:900000},
 type:{'bay/trees':'pass','bay/floor':'pass','bay/dress':'pass','bay/fauna':'pass','host':'host'},
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
// species that yield something edible the kit does not draw as a catalog fruit: named, not hidden. The umbrella
// thorn's pods and the monkey-puzzle cones are not drawn (biomes/FRUIT.md); the tree fern's are fiddleheads.
const FRUIT_NOT_DRAWN=['thorn','puzzle','treefern','cherry'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // fruit: every fruiting species names a catalog piece (biomes/FRUIT.md), and fruit is drawn on the stage (the baobabs'
 // gatepods are the 'pod' items, the parasol caps the 'parasol' items; the coral fungus is built into its bucket)
 fruit(SP,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key),np=P.filter(p=>/:pod$/.test(p[3])).length,nc=P.filter(p=>/:parasol$/.test(p[3])).length;
  return{ok:!miss.length&&!untagged.length&&np>=20&&nc>=100,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+np+' gatepods and '+nc+' parasol caps drawn; catalog keys: '+SWBAY.FRUIT_KEYS.join(', ')+'; not drawn: '+FRUIT_NOT_DRAWN.join(', ')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SWBAY.SPECIES,P));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('a fruiting species with no catalog fruit',HCHK.fruit(SWBAY.SPECIES.map(S=>S.key==='baobab'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 add('a species with no harvest tag',HCHK.fruit(SWBAY.SPECIES.map(S=>S.key==='coral'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),P));
 add('no gatepods drawn',HCHK.fruit(SWBAY.SPECIES,P.filter(p=>!/:pod$/.test(p[3]))));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
