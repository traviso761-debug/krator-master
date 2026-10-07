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
 // the stilt parasols stand along the fan's channels
 stilts(T){const S=T.filter(t=>KEYOF(t)==='stilt'),off=S.filter(t=>FIELD.braid(t.x,t.z)<.3);return{ok:S.length>=30&&off.length<=S.length*.1,detail:S.length+' stilt parasols, '+off.length+' off the fan'};},
 // the gill-parasols make the woods; the star aloes stand in the grass
 woods(T){const G=T.filter(t=>KEYOF(t)==='gillparasol'),gin=G.filter(t=>FIELD.capwood(t.x,t.z)>.3),A=T.filter(t=>KEYOF(t)==='staraloe'),ain=A.filter(t=>FIELD.savanna(t.x,t.z)>.3);
  return{ok:G.length>=40&&gin.length>=G.length*.85&&A.length>=100&&ain.length>=A.length*.85,detail:gin.length+' of '+G.length+' gill-parasols in the woods; '+ain.length+' of '+A.length+' star aloes in the grass'};},
 // the burn has fewer trees for its size than the grass round it
 burn(T){const inB=T.filter(t=>FIELD.burn(t.x,t.z)>.6).length,area=Math.PI*BURN.rx*BURN.rz*.8,ring=T.filter(t=>{const d=Math.hypot((t.x-BURN.x)/BURN.rx,(t.z-BURN.z)/BURN.rz);return d>1.2&&d<1.9&&FIELD.fan(t.x,t.z)<.3;}).length,ringA=Math.PI*BURN.rx*BURN.rz*(1.9*1.9-1.2*1.2)*.7;
  const a=inB/area,b=ring/ringA;return{ok:b>0&&a<b*.75,detail:(a*1e4).toFixed(2)+' trees a hectare on the burn, '+(b*1e4).toFixed(2)+' round it'};},
 // the lahar's boulders lie on the fan
 boulders(B){const bad=B.filter(b=>fanIn(b.x,b.z)<.6);return{ok:B.length>=60&&!bad.length,detail:(bad.length?bad.length+' off the fan; ':'')+B.length+' lahar boulders'};},
 placed(C){const here=THRONE.SPECIES.filter(S=>['stilt','gillparasol','staraloe','trumpet','ruff'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the stilt parasols stand along the channels',HCHK.stilts(THRONE.TREES));
 add('gill-parasols in the woods, star aloes in the grass',HCHK.woods(THRONE.TREES));
 add('the burn is barer than the grass round it',HCHK.burn(THRONE.TREES));
 add('the lahar\'s boulders lie on the fan',HCHK.boulders(SAV.boulders));
 add('every species of the savanna placed',HCHK.placed(counts(THRONE.TREES)));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and water',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('stilt parasols out in the grass',HCHK.stilts(THRONE.TREES.concat(Array.from({length:600},(_,i)=>({sp:SPK("stilt"),x:-1800,z:-2400+i*4})))));
 add('gill-parasols out in the grass',HCHK.woods(THRONE.TREES.map(t=>KEYOF(t)==='gillparasol'?Object.assign({},t,{x:FAN.cx(t.z)}):t)));
 add('a burn as thick as the grass',HCHK.burn(THRONE.TREES.concat(Array.from({length:3000},(_,i)=>({sp:0,x:BURN.x+(i%60-30)*12,z:BURN.z+(Math.floor(i/60)-25)*12})))));
 add('a boulder off the fan',HCHK.boulders(SAV.boulders.concat([{x:-2000,z:-2000,s:2}])));
 {const C=counts(THRONE.TREES);C[SPK('stilt')]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const Pl=POOLS[0];add('a plant on a pool\'s floor',HCHK.dry([[Pl.x,Pl.level-2,Pl.z,'biome:fern']]));}
 {const Pl=POOLS[0];add('a camera under a pool',HCHK.camerasOut([{view:'under',x:Pl.x,y:Pl.level-1.5,z:Pl.z}]));}
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,savanna:()=>SAV,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
