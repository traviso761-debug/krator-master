// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 REG.forEach((r,i)=>{for(const p of P)if(regHas(r,p[0],p[1],p[2]))n[i]++;});
 return REG.map((r,i)=>({name:r.name,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const SPK=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
const KEYOF=t=>THRONE.SPECIES[t.sp].key;
const HCHK={
 // Krator's own life holds vent country: its trees native; of Earth's only the spice tree (its fungus takes on the vent ground)
 native(T){const earth=T.filter(t=>THRONE.SPECIES[t.sp].tags.origin==='earth'&&KEYOF(t)!=='spice'),bb=T.filter(t=>KEYOF(t)==='bonebell').length;
  return{ok:bb>=20&&!earth.length,detail:(earth.length?earth.length+' Earth trees on the vents ('+[...new Set(earth.map(KEYOF))].join(', ')+'); ':'')+bb+' bone bells, '+T.length+' trees'};},
 // nothing lives in the CO2 hollows: no tree, no plant on their floors
 hollow(T,P){let bt=0,bp=0;for(const H of HOLLOWS){const r=H.r*.85;bt+=T.filter(t=>Math.hypot(t.x-H.x,t.z-H.z)<r).length;bp+=P.filter(p=>Math.hypot(p[0]-H.x,p[2]-H.z)<r).length;}
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants in the hollows'):'the hollows are dead: nothing grows on their floors'};},
 // the marsh holds the sulphur rosettes; the pools' shores the vent coral and the brain caps
 marsh(P){const n=P.filter(p=>p[3]==='biome:srosette'&&marshD(p[0],p[2])<1.3).length;return{ok:n>=40,detail:n+' sulphur rosettes in the marsh'};},
 // the sulphur life (the kit's, on the 'sulph' field): reeds, pads and bladders in the marsh and round the vents
 sulphur(P){const c=n=>P.filter(p=>p[3]==='biome:'+n).length,t=c('tassel')+P.filter(p=>/^biome:reedbrim/.test(p[3])).length,a=c('acidpad'),b=c('bladder'),wet=P.filter(p=>p[3]==='biome:acidpad'&&marshD(p[0],p[2])<1.05).length;
  return{ok:t>=200&&a>=100&&b>=100&&wet>=a*.8,detail:t+' reeds (stems or stands), '+a+' acid pads ('+wet+' on the marsh), '+b+' gas bladders'};},
 // nothing lives on the hot ground (the fissure's ramparts and crack, its cones)
 hot(T,P){const rock=['biome:boulder','biome:stone'],bt=T.filter(t=>hotAt(t.x,t.z)>.6).length,bp=P.filter(p=>hotAt(p[0],p[2])>.6&&rock.indexOf(p[3])<0&&p[1]<terrainH(p[0],p[2])+1.5).length;   // at the ground (a crown may reach over the edge)
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants on the hot ground'):'the fissure and its cones are bare'};},
 pools(P){const n=P.filter(p=>(p[3]==='biome:column'||p[3]==='biome:brain')&&POOLS.some(Q=>Math.hypot(p[0]-Q.x,p[2]-Q.z)<Q.r*4)).length;return{ok:n>=10,detail:n+' vent corals and brain caps round the pools'};},
 // the weather: the module's fog (the acid fog) and its opt-in ash both offered
 weather(W,U){const ok=!!W&&W.MODES.indexOf('fog')>=0&&W.MODES.indexOf('ash')>=0&&W.MODES.indexOf('ashfall')>=0&&typeof W.ash==='number'&&!!U&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no acid fog or no ash'};},
 placed(C){const here=THRONE.SPECIES.filter(S=>S.vents||['bonebell','lampcap','drizzle','ropepuff','pagoda'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('Krator\'s own life holds vent country',HCHK.native(THRONE.TREES));
 add('nothing lives in the CO2 hollows',HCHK.hollow(THRONE.TREES,P));
 add('nothing lives on the fissure or its cones',HCHK.hot(THRONE.TREES,P));
 add('sulphur rosettes in the marsh',HCHK.marsh(P));
 add('vent coral and brain caps round the hot pools',HCHK.pools(P));
 add('the sulphur life: reeds, acid pads, gas bladders',HCHK.sulphur(P));
 add('the acid fog and the ash (core/atmos) are here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species of vent country placed',HCHK.placed(counts(THRONE.TREES)));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),H=HOLLOWS[0];
 add('a lehua on the vents',HCHK.native(THRONE.TREES.concat([{sp:SPK('lehua'),x:0,z:0}])));
 add('a plant in a hollow',HCHK.hollow(THRONE.TREES,[[H.x,terrainH(H.x,H.z),H.z,'biome:fern']]));
 add('a marsh with no rosettes',HCHK.marsh([]));
 {const c=fissPt(1200);add('a plant on the fissure',HCHK.hot(THRONE.TREES,[[c[0],terrainH(c[0],c[1]),c[1],'biome:fern']]));}
 add('pools with nothing round them',HCHK.pools([]));
 add('no sulphur life',HCHK.sulphur([]));
 add('a weather without the ash',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.filter(m=>m!=='fog')}),ATMOS.U));
 {const C=counts(THRONE.TREES);C[SPK('brimstone')]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,vents:()=>VENTS,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
