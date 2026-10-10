// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside each kit).
const BUDGET={
 showcase:{tris:26000000,calls:300},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'geyser/sinter':'pass','geyser/trees':'pass','geyser/floor':'pass','geyser/show':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
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
// every instanced item: [x, y, z, its name, its kit]
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,M.userData.kit||'']);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native','dead'],HEATS=['splash','hot','warm','margin','acid','dead','water'];
const MINERAL=['biome:bead','biome:sinterknob','biome:stone','biome:boulder'];
const gk=p=>p[4]==='geyser';
const HCHK={
 // nothing lives in the hot water or on the scalding ground (over ~83 degC): only the sinter's own knobs and beads
 scald(P,T){const bp=P.filter(p=>gk(p)&&MINERAL.indexOf(p[3])<0&&GEYSER.at(p[0],p[2]).T>83&&p[1]<terrainH(p[0],p[2])+1.2),bt=T.filter(t=>GEYSER.at(t.x,t.z).T>70);
  return{ok:!bp.length&&!bt.length,detail:bp.length+bt.length?(bt.length+' trees and '+bp.length+' plants on scalding ground ('+[...new Set(bp.map(p=>p[3]))].slice(0,4).join(', ')+')'):'nothing on the scalding ground'};},
 // the run-off cools as it runs, and the big springs' runs reach out
 runoff(R){const bad=R.filter(c=>!(GEYSER.chT(c,0)>GEYSER.chT(c,c.len)+5)),long=R.filter(c=>c.len>=100).length;
  return{ok:!bad.length&&long>=4&&R.length>=12,detail:bad.length?bad.length+' channels that do not cool':R.length+' channels, '+long+' over 100 m, the Prism\'s from '+Math.round(GEYSER.chT(R[0],0))+' to '+Math.round(GEYSER.chT(R[0],R[0].len))+' degC'};},
 // every geyser erupts on its own cycle: a column at its height, a rest with none, the column its share of the period
 cycles(G){const bad=[];for(const g of G){if(g.kind==='spouter')continue;let mx=0,rest=0,col=0;const n=600;for(let i=0;i<n;i++){const c=GEYSER.cycle(g,g.off+i/n*g.period);mx=Math.max(mx,c.water);if(c.phase==='rest'&&c.water===0)rest++;if(c.phase==='column')col++;}
   if(mx<.9||!rest||Math.abs(col/n-g.dur/g.period)>.02)bad.push(g.key);}
  return{ok:!bad.length,detail:bad.length?'off their cycles: '+bad.join(', '):G.filter(g=>g.kind!=='spouter').length+' geysers on their cycles, periods '+G.filter(g=>g.period&&g.kind!=='spouter').map(g=>g.period).join('/')+' s'};},
 // a spring brims at its rim: its level at its rim's lowest ground and over its bowl's floor
 springs(S){const bad=S.filter(s=>{let lo=1e9;for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,terrainH(s.x+Math.cos(a)*s.r*1.04,s.z+Math.sin(a)*s.r*1.04));}return Math.abs(lo-.04-s.level)>.3||terrainH(s.x,s.z)>s.level-.5;});
  return{ok:!bad.length,detail:bad.length?'off their rims: '+bad.map(s=>s.key).join(', '):S.length+' springs brim at their rims'};},
 // the Stair's pools step down to the sea, one under the next
 terraces(L){let dn=0,up=0,big=0;for(let i=1;i<L.length;i++){const d=L[i-1]-L[i];if(d>.01)dn++;if(d>1.5)big++;else if(d<-.45)up++;}
  return{ok:dn>=10&&up===0&&big>=3,detail:up?up+' pools climb':dn+' pools down the Stair, '+big+' tier walls over 1.5 m'};},
 // the dead forest: its snags stand in it, and nothing living of the kit's trees in its heart
 dead(T){const sn=T.filter(t=>GEYSER.SPECIES[t.sp].key==='snag'),out=sn.filter(t=>GEYSER.at(t.x,t.z).dead<.25),live=T.filter(t=>GEYSER.SPECIES[t.sp].key!=='snag'&&GEYSER.at(t.x,t.z).dead>.85);
  return{ok:sn.length>=30&&!out.length&&!live.length,detail:sn.length+' snags'+(out.length?', '+out.length+' out of the dead forest':'')+(live.length?', '+live.length+' living trees in its heart':'')};},
 // the hyperjungle walls the basin in: its trees round it, none on the floor
 jungle(P){const hj=P.filter(p=>p[4]==='hyperjungle'),on=hj.filter(p=>FIELD.floor(p[0],p[2])>.65&&p[1]<terrainH(p[0],p[2])+3);
  return{ok:hj.length>2000&&!on.length,detail:on.length?on.length+' jungle plants on the basin floor':hj.length+' jungle items round the basin'};},
 // the thermophiles: the warm ground's grass, ferns and clubmoss; streamers in the run-off; lilies on the warm water
 thermo(P){const c=n=>P.filter(p=>gk(p)&&p[3]==='biome:'+n),warm=c('grass').concat(c('fern'),c('clubmoss')).filter(p=>{const h=GEYSER.at(p[0],p[2]).heat;return h>.04;}).length,
  st=c('streamer').filter(p=>GEYSER.at(p[0],p[2]).film>.2).length,li=c('lily').length;
  return{ok:warm>=600&&st>=150&&li>=60,detail:warm+' thermophile tufts on warm ground, '+st+' streamers in the run-off, '+li+' kettle lilies'};},
 placed(C){const zero=GEYSER.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):GEYSER.SPECIES.length+' species, the scarcest '+Math.min(...C)};},
 tagged(L){const reg=Object.keys(GEYSER.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||HEATS.indexOf(t.heat)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(GEYSER.PLANTS).map(k=>Object.assign({key:k},GEYSER.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},GEYSER.SPECIES.map(()=>0));
// the Stair's pools' levels down its axis (a pool lower than the one above it, or level with it; a climb is a fault)
const stairLevels=()=>{const t=LAYOUT.terraces[0],L=[];let last=null;for(let z=STAIR.z0+130;z<shoreZ(STAIR.x0)-30;z+=1){const x=stairX(z)+20;if(terraceMask(x,z)<.99)continue;
 const q=GEYSER.poolAt(t,x,z);if(q.A&&!q.A.sea&&q.A!==last){L.push(q.A.L);last=q.A;}}return L;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),T=GEYSER.TREES||[];
 add('nothing lives on the scalding ground',HCHK.scald(P,T));
 add('the run-off cools as it runs',HCHK.runoff(LAYOUT.runoff));
 add('every geyser erupts on its own cycle',HCHK.cycles(LAYOUT.geysers));
 add('the springs brim at their rims',HCHK.springs(LAYOUT.springs));
 add('the Stair steps down to the sea',HCHK.terraces(stairLevels()));
 add('the dead forest stands dead',HCHK.dead(T));
 add('the hyperjungle walls the basin in',HCHK.jungle(P));
 add('thermophiles on the warm ground and the run-off',HCHK.thermo(P));
 add('every species of the kit placed',HCHK.placed(counts(T)));
 add('every species and plant tagged',HCHK.tagged(GEYSER.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),s=LAYOUT.springs[0],T=GEYSER.TREES||[];
 add('a fern in the Great Prism',HCHK.scald([[s.x,terrainH(s.x,s.z),s.z,'biome:fern','geyser']],[]));
 add('a channel that warms as it runs',HCHK.runoff(LAYOUT.runoff.map((c,i)=>i?c:Object.assign({},c,{T0:20}))));
 add('a geyser with no column',HCHK.cycles(LAYOUT.geysers.map((g,i)=>i?g:Object.assign({},g,{dur:0,_c:null}))));
 add('a spring 2 m over its rim',HCHK.springs([Object.assign({},s,{level:s.level+2})]));
 add('a Stair that climbs',HCHK.terraces(stairLevels().reverse()));
 add('a snag out on the open floor',HCHK.dead(T.concat([{sp:GEYSER.SPECIES.findIndex(S=>S.key==='snag'),x:0,z:-100}])));
 add('a jungle tree on the floor',HCHK.jungle(instPoints().concat([[BASIN.x,terrainH(BASIN.x,BASIN.z),BASIN.z,'biome:trunk','hyperjungle']])));
 add('no thermophiles',HCHK.thermo([]));
 {const C=counts(T);C[0]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(GEYSER.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,records:()=>GEYSER.records(),erupt:k=>GEYSER.erupt(k,GEYSER.SHOW?GEYSER.SHOW.t:0),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const g=GEYSER.at(x,z);['T','heat','sinter','film','acid','dead','spray','terr','bw'].forEach(k=>o[k]=+(+g[k]).toFixed(3));return o;}};
window._registered=REG.length;
