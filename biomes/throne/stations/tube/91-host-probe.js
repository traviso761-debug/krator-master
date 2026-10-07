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
 // the light's life grows under the skylights: siphon trees and lamp caps there, and only there in the tube
 skylit(T){const sp=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]),inT=t=>!!tubeAt(t.x,t.z),near=t=>SKY.some(S=>Math.hypot(t.x-S.x,t.z-S.z)<S.r*1.3);
  const sip=T.filter(t=>t.sp===sp('siphon')),lamp=T.filter(t=>t.sp===sp('lampcap')),dark=T.filter(t=>inT(t)&&!near(t));
  return{ok:sip.length>=2&&lamp.length>=3&&!dark.length,detail:sip.length+' siphon trees, '+lamp.length+' lamp caps'+(dark.length?'; '+dark.length+' trees in the dark':'; none in the dark')};},
 // the cave life holds the dark floor; nothing lives in the hot reach
 cave(B,P){const hot=P.filter(p=>{const t=tubeAt(p[0],p[2]);return t&&t.T===TUBE&&hotK(t.u)>.5&&p[1]<t.T.floor(t.u)+3&&/^biome:/.test(p[3])&&!/^biome:(lavacicle|block)/.test(p[3]);});
  const n=B&&B.cave?B.cave.mat+B.cave.glow+B.cave.cards:0;return{ok:n>=150&&!hot.length,detail:n+' cave plants on the dark floor'+(hot.length?'; '+hot.length+' in the hot reach':'; none in the hot reach')};},
 // the walls and the roof carry their life; the skylights their light
 walls(C){return{ok:C.brackets>=40&&C.lavacicles>=500&&C.curtains>=60,detail:C.brackets+' lantern brackets, '+C.drips+' drips, '+C.ledgeGlow+' on the ledges, '+C.curtains+' curtains, '+C.lavacicles+' lavacicles, '+C.blocks+' blocks'};},
 light(S){return{ok:S.length===SKY.length&&S.every(s=>s.isSpotLight),detail:S.length+' skylight spots'};},
 // the camera stays in the tube's section
 inside(C){const bad=C.filter(c=>{const t=tubeAt(c.x,c.z);if(!t)return false;const f=t.T.floor(t.u);return c.y<f+.3||c.y>f+t.T.H(t.u)+1;});return{ok:!bad.length,detail:bad.length?'out of the tube: '+bad.map(c=>c.view).join(', '):'cameras in the tube clear of its floor and roof'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const camList=()=>Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the light\'s life under the skylights, none in the dark',HCHK.skylit(THRONE.TREES));
 add('cave life on the dark floor, none in the hot reach',HCHK.cave(window._biome,P));
 add('the walls and the roof alive',HCHK.walls(CAVE));
 add('daylight through every skylight',HCHK.light(SPOTS));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras inside the tube',HCHK.inside(camList()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),u=800,p=TUBE.P(u);
 add('a lamp cap in the dark',HCHK.skylit(THRONE.TREES.concat([{sp:THRONE.SPECIES.indexOf(THRONE.byKey.lampcap),x:p[0],z:p[1]}])));
 {const q=TUBE.P(1300);add('a mushroom in the lava',HCHK.cave(window._biome,[[q[0],TUBE.floor(1300),q[1],'biome:glowshroom0']]));}
 add('bare walls',HCHK.walls(Object.assign({},CAVE,{brackets:0})));
 add('a skylight without light',HCHK.light(SPOTS.slice(1)));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera in the rock',HCHK.inside([{view:'rock',x:p[0],y:TUBE.floor(u)+TUBE.H(u)+6,z:p[1]}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,cave:()=>CAVE,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
