// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // two kits on one page: a ceiling, not a target (KNOWN_ISSUES)
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
const KEY=t=>THRONE.SPECIES[t.sp].key;
const fieldOf=(x,z)=>{const u=uOf(x,z),p=pOf(x,z);for(const F of FIELDS)if(fieldIn(u,p,F)>.5)return F;return null;};
const HCHK={
 // the plantations are planted: every planted (non-clear) field has rows, every row tree stands in its field
 rows(R){const planted=FIELDS.filter(F=>F.kind!=='clear'),empty=planted.filter(F=>!R.some(r=>r.field===F.i)),out=R.filter(r=>{const F=fieldOf(r.x,r.z);return !F||F.i!==r.field;});
  return{ok:R.length>200&&!empty.length&&!out.length,detail:(empty.length?empty.length+' planted fields with no rows; ':'')+(out.length?out.length+' row trees outside their field; ':'')+R.length+' planted Ranj trees in '+planted.length+' fields'};},
 // and they bear no resin (the tree's fungus has not taken in them): no resin drop within a planted row tree's crown
 noResin(R,resin){const bad=resin.filter(p=>R.some(r=>Math.hypot(p[0]-r.x,p[2]-r.z)<2.5));
  return{ok:!bad.length,detail:bad.length?bad.length+' resin drops on planted trees':'no resin on any planted tree ('+resin.length+' drops elsewhere)'};},
 // the clearings are cleared: stumps in each, no living tree of either kit standing in one
 clearings(S,T,J){const clear=FIELDS.filter(F=>F.kind==='clear'),noStump=clear.filter(F=>!S.some(s=>fieldOf(s.x,s.z)===F)),bad=T.concat(J).filter(t=>{const F=fieldOf(t.x,t.z);return F&&F.kind==='clear';});
  return{ok:!noStump.length&&!bad.length,detail:(noStump.length?noStump.length+' clearings with no stumps; ':'')+(bad.length?bad.length+' trees standing in a clearing; ':'')+S.length+' stumps'};},
 // the traps are on the natives' trails, near their ends, each tagged
 traps(X){const bad=X.filter(t=>PATHGRID.at(t.x,t.z).d>3.5||t.culture!=='throne-natives'||!t.kind),kinds=new Set(X.map(t=>t.kind));
  return{ok:X.length>=10&&!bad.length&&kinds.has('punji')&&kinds.has('snare'),detail:(bad.length?bad.length+' traps off a trail or untagged; ':'')+X.length+' traps ('+[...kinds].join(', ')+')'};},
 // Zey'danin's footprint is empty: no tree of either kit stands in it
 city(T,J){const bad=T.concat(J).filter(t=>Math.hypot(t.x-CITY.x,t.z-CITY.z)<CITY.r*.9);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees in the city\'s footprint':'the footprint is empty ('+CITY.r+' m)'};},
 // nothing grows on the road or the trails
 paths(T,J){const bad=T.concat(J).filter(t=>PATHGRID.at(t.x,t.z).d<-.2);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on a path':'no tree on the road or the trails'};},
 // the hyperjungle stands only in the forest
 jungle(J,own){const bad=J.filter(t=>own(t.x,t.z)<.3);
  return{ok:J.length>20&&!bad.length,detail:bad.length?bad.length+' hyperjungle trees off the forest':J.length+' hyperjungle trees, all in the forest'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const JT=()=>(typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.TREES)||[];
const resinPts=()=>instPoints().filter(p=>p[3]==='biome:resin');
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the plantations are planted in rows',HCHK.rows(FRONTIER.rows));
 add('the planted Ranj trees bear no resin',HCHK.noResin(FRONTIER.rows,resinPts()));
 add('the clearings are cleared (stumps, no standing trees)',HCHK.clearings(FRONTIER.stumps,THRONE.TREES,JT()));
 add('the traps are on the natives\' trails',HCHK.traps(FRONTIER.traps));
 add('Zey\'danin\'s footprint is empty',HCHK.city(THRONE.TREES,JT()));
 add('nothing grows on the road or the trails',HCHK.paths(THRONE.TREES,JT()));
 add('the hyperjungle stands in the forest',HCHK.jungle(JT(),FIELD.owned));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and sea',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const F0=FIELDS.find(F=>F.kind!=='clear'),FC=FIELDS.find(F=>F.kind==='clear');
 add('a planted field with no rows',HCHK.rows(FRONTIER.rows.filter(r=>r.field!==F0.i)));
 add('resin on a planted tree',HCHK.noResin(FRONTIER.rows,[[FRONTIER.rows[0].x,0,FRONTIER.rows[0].z,'test']]));
 add('a tree in a clearing',HCHK.clearings(FRONTIER.stumps,THRONE.TREES.concat([{sp:0,x:FC.x,z:FC.z}]),JT()));
 add('a trap in the open forest',HCHK.traps(FRONTIER.traps.concat([{kind:'snare',culture:'throne-natives',x:F0.x+2000,z:F0.z}])));
 add('a tree in the city',HCHK.city(THRONE.TREES.concat([{sp:0,x:CITY.x,z:CITY.z}]),JT()));
 {const p=ROAD.pts[10];add('a tree on the road',HCHK.paths([{x:p[0],z:p[1]}],[]));}
 add('a hypertree in a field',HCHK.jungle(JT().concat([{x:F0.x,z:F0.z}]),FIELD.owned));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const b=xzOf(BAY.u,BAY.p);add('a plant on the bay\'s floor',HCHK.dry([[b[0],SEA-6,b[1],'test']]));}
 add('a camera under the sea',HCHK.camerasOut([{view:'under',x:xzOf(BAY.u,BAY.p)[0],y:SEA-5,z:xzOf(BAY.u,BAY.p)[1]}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,jungle:()=>window._jungle,frontier:()=>({rows:FRONTIER.rows.length,stumps:FRONTIER.stumps.length,traps:FRONTIER.traps,paths:FRONTIER.paths,walls:FRONTIER.walls,slash:FRONTIER.slash}),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),u:uOf(x,z),p:pOf(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
