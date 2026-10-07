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
const LIFE=['lichen','mossclump','mat','cushion'];
const HCHK={
 // nothing lives here but lichen and the warm ground's life: no trees, and every plant one of the hardy few (or a glow mushroom)
 lifeless(T,P){const bad=P.filter(p=>/^biome:/.test(p[3])&&LIFE.indexOf(p[3].slice(6))<0&&!/^biome:(glowshroom|penitente|icetower|boulder|stone|ventcone)/.test(p[3]));
  return{ok:!T.length&&!bad.length,detail:T.length+bad.length?(T.length+' trees, '+bad.length+' other plants ('+[...new Set(bad.map(p=>p[3]))].slice(0,4).join(', ')+')'):'no trees; only lichen, moss, the mat and glow mushrooms'};},
 // and the little there is lives on the warm ground and the rocks, not on the floor or in the lake
 floor(P){const bad=P.filter(p=>LIFE.indexOf(p[3].slice(6))>=0&&calR(p[0],p[2])<CAL.foot);return{ok:!bad.length,detail:bad.length?bad.length+' plants on the caldera floor':'nothing on the floor'};},
 // the lava lake is there and glows; the plume rises out of it
 lake(S){const m=S.lakeMesh;return{ok:!!m&&!!m.material.uniforms&&S.plume>=500,detail:m?'the lake ('+Math.round(S.lake.r)+' m), the plume '+S.plume+' billows':'no lake'};},
 // the eruption toggle: off, nothing thrown; on, its state eases up and the fountains draw; off again, it dies away slowly
 erupt(S){const E={on:false,k:0,t:0};for(let i=0;i<60;i++)S.eruptStep(E,1/30);const k0=E.k;E.on=true;for(let i=0;i<600;i++)S.eruptStep(E,1/30);const k1=E.k;E.on=false;for(let i=0;i<120;i++)S.eruptStep(E,1/30);const k2=E.k;
  return{ok:k0===0&&k1>.99&&k2<k1&&k2>.5&&!!S.fountains&&S.vents>=3,detail:'off '+k0.toFixed(2)+', on 20 s '+k1.toFixed(2)+', off 4 s '+k2.toFixed(2)+'; '+S.vents+' vents'};},
 weather(W,U){const ok=!!W&&['snowfall','blizzard','ashfall','ash'].every(m=>W.MODES.indexOf(m)>=0)&&!!U&&!!U.snow&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow or no ash'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('nothing lives here but the hardiest few',HCHK.lifeless(THRONE.TREES,P));
 add('nothing on the caldera floor',HCHK.floor(P));
 add('the lava lake and the plume',HCHK.lake(SUMMIT));
 add('the eruption toggle',HCHK.erupt(SUMMIT));
 add('the snow and the ash (core/atmos, opt-in) are here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a tree on the rim',HCHK.lifeless([{sp:SPK('ashpine'),x:0,z:0}],[]));
 add('a fern up here',HCHK.lifeless([],[[0,0,0,'biome:fern']]));
 add('lichen on the floor',HCHK.floor([[LAKE.x+LAKE.r*1.5,CAL.floor,LAKE.z,'biome:lichen']]));
 add('no plume',HCHK.lake(Object.assign({},SUMMIT,{plume:0})));
 add('an eruption that never starts',HCHK.erupt(Object.assign({},SUMMIT,{eruptStep:(E)=>E})));
 add('a weather without the ash',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.concat(['snowfall','blizzard'])}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,summit:()=>SUMMIT,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
