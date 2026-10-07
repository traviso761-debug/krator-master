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
 // the cold belt: its conifers and its gill-coral trees placed; of the kit's others none (the shoulder and plume woods stand down)
 placed(C){const here=['ashpine','gillcoral','glasswillow'].map(k=>THRONE.byKey[k]),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key),other=THRONE.SPECIES.filter(S=>here.indexOf(S)<0&&C[S.i]>0).map(S=>S.key);
  return{ok:!zero.length&&!other.length,detail:(zero.length?'never placed: '+zero.join(', ')+'; ':'')+(other.length?'out of place: '+other.join(', ')+'; ':'')+here.map(S=>S.key+' '+C[S.i]).join(', ')};},
 // nothing roots on the ice (the host's seracs, towers and bergs are ice themselves)
 ice(T,P){const own=['biome:serac','biome:icetower'],bt=T.filter(t=>iceAt(t.x,t.z)>1).length,bp=P.filter(p=>iceAt(p[0],p[2])>1&&own.indexOf(p[3])<0).length;
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants on the ice'):'nothing grows on the glacier'};},
 // every ice cave warm and alive inside
 caves(L){const poor=L.filter(c=>c.life<20);return{ok:L.length>=3&&!poor.length,detail:L.length+' caves, life '+L.map(c=>c.life).join(', ')};},
 // the river runs DOWN the flank from the breach (its water surface never climbs more than a metre along its course)
 river(H){let up=0;for(let i=1;i<H.length;i++)if(H[i]>H[i-1]+1)up++;return{ok:H.length>20&&!up,detail:up?up+' stretches running uphill':'falls '+Math.round(H[0]-H[H.length-1])+' m over its course'};},
 caps(L){let bad=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.x-b.x)>a.s+b.s||Math.abs(a.z-b.z)>a.s+b.s)continue;
   if(Math.hypot(a.x-b.x,a.z-b.z)<(a.s+b.s)*.9&&a.y0<b.y1&&b.y0<a.y1)bad++;}   // their footprints and their heights overlap
  return{ok:L.length>50&&!bad,detail:bad?bad+' pairs of gill-coral caps clipping':L.length+' caps, none clipping'};},
 weather(W,U){const ok=!!W&&W.MODES.indexOf('snowfall')>=0&&W.MODES.indexOf('blizzard')>=0&&typeof W.snow==='number'&&!!U&&!!U.snow;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow weather'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
const capList=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();scene.traverse(M=>{if(!M.isInstancedMesh||M.name!=='biome:gcoral')return;
 for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);if(p.y>terrainH(p.x,p.z)+2)o.push({x:p.x,y:p.y,z:p.z,s:s.x,y0:p.y+.44*s.y,y1:p.y+1.05*s.y});}});return o;};   // y0..y1 the cap's own height (its lathe runs .44..1 of its scale)
const riverProfile=()=>{const H=[];for(let u=BREACH_U;u>-TERR.R;u-=25){const c=upAt(u,riverC(u)),w=waterH(c[0],c[1]);if(w>-1e8)H.push(w);}return H;};   // the water's own surface, as the page reads it
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the cold belt\'s trees placed, and only they',HCHK.placed(counts(THRONE.TREES)));
 add('nothing grows on the ice',HCHK.ice(THRONE.TREES,P));
 add('every ice cave warm and alive inside',HCHK.caves(GLACIER.caves));
 add('the river runs down the flank',HCHK.river(riverProfile()));
 add('no gill-coral cap clips another',HCHK.caps(capList()));
 add('the snow weather (core/atmos, opt-in) is here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),c=upAt(900,GL.pg(900));
 {const C=counts(THRONE.TREES);C[SPK('gillcoral')]=0;add('no gill-coral trees',HCHK.placed(C));}
 {const C=counts(THRONE.TREES);C[SPK('pagoda')]=3;add('a pagoda cap in the snow',HCHK.placed(C));}
 add('a plant on the ice',HCHK.ice(THRONE.TREES,[[c[0],terrainH(c[0],c[1]),c[1],'biome:fern']]));
 add('a dead cave',HCHK.caves(GLACIER.caves.map((x,i)=>i?x:Object.assign({},x,{life:0}))));
 add('a river running uphill',HCHK.river(riverProfile().reverse()));
 {const L=capList();add('two caps in one place',HCHK.caps(L.concat([Object.assign({},L[0],{x:L[0].x+.5,y0:L[0].y0+.2,y1:L[0].y1+.2})])));}
 add('a weather without the snow',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,glacier:()=>GLACIER,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
