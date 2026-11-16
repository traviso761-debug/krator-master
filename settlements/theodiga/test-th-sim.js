/* node settlements/theodiga/test-th-sim.js: the census on core/simulation (src/47-th-sim.js) on a town of the page's kind and
   the blueprint's arcology (src/43-th-arc-program.js), each run in a fresh core/simulation (a vm context of its own), each check
   with a negative (tools/ktest.js): every resident has a home; each quarter's role is the census's; the arcology's people are the
   blueprint's by area, every one in that area's homes; every worker's job is a place of its role's kinds; no hour finds an
   activity short of places and none is unknown; SIM.check names nothing; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
const SIMF=['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-economy.js',
 '77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-6-trade.js','77-sim-7-lod.js','77-sim-7-stocks.js','77-sim-8-export.js','77-sim-9-debug.js'];
const SRC=SIMF.map(f=>fs.readFileSync(path.join(ROOT,'core/simulation',f),'utf8')).concat(['settlements/theodiga/src/43-th-arc-program.js','settlements/theodiga/src/47-th-sim.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')));
/* a fresh SIM with TH_SIM in it */
const fresh=()=>{const C={console};C.window=C;C.globalThis=C;vm.createContext(C);for(const s of SRC)vm.runInContext(s,C);vm.runInContext('this.SIM=SIM;this.TH_SIM=TH_SIM;this.TH_ARC_PROGRAM=TH_ARC_PROGRAM;',C);return C;};
const Q=['square','bazaar','gate','salvage','farmers','poor','farms'];
const KEYS=['xa_scrap_house','xa_scrap_row','xa_scrap_bazaar','xa_scrap_store','xa_scrap_serai','xa_scrap_gate','xa_scrap_shrine','xa_scrap_bath','xa_scrap_granary','xa_scrap_farm','qb_hostel','qb_chorten','xa_scrap_hull','xa_scrap_court'];
const input=()=>{const lots=[],byQ={};
 for(let i=0;i<420;i++){const q=Q[i%7],k=KEYS[Math.floor(i/7)%KEYS.length],p=/house|row|hull|court/.test(k)?6+(i*7)%9:0;lots.push({id:'t'+i,key:k,name:k,x:400+(i%30)*20,y:440,z:-300+Math.floor(i/30)*40,quarter:q,people:p});byQ[q]=(byQ[q]||0)+p;}
 for(let i=0;i<12;i++)lots.push({id:'y'+i,key:'xa_scrap_store',name:'a scrap store',x:100+i*12,y:2,z:390,quarter:'works',people:0,work:'salvage'});
 lots.push({id:'b0',key:'xa_scrap_court',name:'the Rare Devisers\' lodge',x:280,y:1,z:480,quarter:'works',people:0,work:'the bore'});
 lots.push({id:'b1',key:'xa_scrap_store',name:'the Devisers\' stores and assay hall',x:280,y:1,z:505,quarter:'works',people:0,work:'the bore'});
 const fields=[];for(let i=0;i<48;i++)fields.push({id:'f'+i,corners:[[140+(i%8)*24,-180+Math.floor(i/8)*14],[162+(i%8)*24,-180+Math.floor(i/8)*14],[162+(i%8)*24,-168+Math.floor(i/8)*14],[140+(i%8)*24,-168+Math.floor(i/8)*14]],y:285});
 return {lots,fields,census:{byQuarter:byQ},kora:{x0:-100,x1:280,zc:x=>-140*(1-Math.pow(x/320,2)),y:400},gx:1150,gz:0};};
const run=(mod)=>{const C=fresh(),o=input();o.arc=C.TH_ARC_PROGRAM;if(mod)mod(o,C);const R=C.TH_SIM.declare(C.SIM,o);const a=C.SIM.audit();return {C,o,R,a};};
const base=run();
console.log(base.R.places+' places, '+base.R.actors+' actors ('+Object.entries(base.R.byRole).map(([k,v])=>k+' '+v).join(', ')+'), '+base.R.ms+' ms');
const actors=C=>C.SIM.all('actor'),placeOf=(C,id)=>C.SIM.R.place[id];
/* BLUEPRINT.md "Who lives where": the crest, the gallery, the six standing fin heads (the Monks' and Novices' two share 330) */
const BLUEPRINT={crest:120,gallery:60,'fin+0':200,'fin+46':165,'fin-46':165,'fin-92':60,'fin+138':110,'fin-138':25};
const CHECKS={
 'every resident has a home':X=>[X.R.homeless===0&&actors(X.C).every(a=>a.home&&placeOf(X.C,a.home)),X.R.homeless+' homeless'],
 'each quarter\'s role is the census\'s':X=>{const bad=Object.keys(X.C.TH_SIM.QROLE).filter(q=>(X.o.census.byQuarter[q]|0)!==(X.R.byRole[X.C.TH_SIM.QROLE[q].id]|0));return [bad.length===0,bad.join(', ')||'all seven'];},
 'the arcology\'s people are the blueprint\'s, each in its area\'s homes':X=>{const A=BLUEPRINT,by={};
   for(const a of actors(X.C)){const P=placeOf(X.C,a.home);if(P&&/^arc:/.test(P.kind))by[P.kind.slice(4)]=(by[P.kind.slice(4)]||0)+1;}
   const bad=Object.keys(A).filter(k=>(by[k]|0)!==A[k]);return [bad.length===0,bad.map(k=>k+' '+(by[k]|0)+'/'+A[k]).join(', ')||'905 in their areas'];},
 'every worker\'s job is a place of its role\'s kinds':X=>{let bad=0;for(const a of actors(X.C)){const R=X.C.SIM.R.role[a.role];if(!R||!R.work)continue;const P=placeOf(X.C,a.work);if(!P||R.work.kinds.indexOf(P.kind)<0)bad++;}return [bad===0,bad+' off their kinds'];},
 /* T-town-8: the salvagers walk about 2.3 world hours to the yards, so they eat at the yards' cookhouse */
 'the salvagers eat at the yards\' cookhouse':X=>{const S=actors(X.C).filter(a=>a.role==='salvager');let bad=0;for(const a of S){const P=X.C.SIM.choose(a,'EAT',12);if(!P||P.kind!=='yard')bad++;}
   return [S.length>0&&bad===0,S.length+' salvagers, '+bad+' eating elsewhere at noon'];},
 'no hour short of places, no activity unknown, SIM.check clean':X=>[(X.a.capacity||[]).length===0&&(X.a.unknownActivities||[]).length===0&&X.R.problems.length===0,(X.a.capacity||[]).length+' short hours, '+(X.a.unknownActivities||[]).length+' unknown, '+X.R.problems.length+' problems']};
const NEG={
 'every resident has a home':o=>{o.lots.forEach(L=>{if(L.quarter==='salvage')L.people=Math.floor(L.people/3);});},
 'each quarter\'s role is the census\'s':o=>{o.census.byQuarter.bazaar+=40;o.lots.find(L=>L.quarter==='bazaar'&&L.people>0).people+=40;o.census.byQuarter.bazaar-=0;o._skew=true;},
 'the arcology\'s people are the blueprint\'s, each in its area\'s homes':(o,C)=>{C.TH_SIM.AREA['fin+0']=260;},
 'every worker\'s job is a place of its role\'s kinds':(o,C)=>{const R=C.TH_SIM.QROLE.salvage;R.work=['yard','no-such-kind'];o.lots=o.lots.filter(L=>L.work!=='salvage');},
 'the salvagers eat at the yards\' cookhouse':(o,C)=>{C.TH_SIM.QROLE.salvage.eat=null;},
 'no hour short of places, no activity unknown, SIM.check clean':o=>{o.kora=null;}};
/* the census negative: the census says 40 more than the homes hold, and the check must see the role's count and the census part */
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](base);T.ok(name+' ('+detail+')',pass,detail);
 const F=run(NEG[name]);if(name==='each quarter\'s role is the census\'s')F.o.census.byQuarter.bazaar-=40;
 T.ok('negative: '+name+' is caught',!CHECKS[name](F)[0],CHECKS[name](F)[1]);}
T.ok('the declaration reruns the same',JSON.stringify(run().C.SIM.all('actor').map(a=>[a.id,a.role,a.home,a.work]))===JSON.stringify(base.C.SIM.all('actor').map(a=>[a.id,a.role,a.home,a.work])));
T.done();
