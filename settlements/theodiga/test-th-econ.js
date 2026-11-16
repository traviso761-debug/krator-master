/* node settlements/theodiga/test-th-econ.js: the economy (src/49-th-econ.js) on the census (src/47-th-sim.js) of a town of the
   page's kind, run a week at the abstract level in a fresh core/simulation each, each check with a negative (tools/ktest.js):
   the books balance (core's ledger: opening + made + imported - consumed - spoiled - exported = closing, every good); the town
   feeds itself (no food falls by a fifth over the week, nobody goes without a meal); every maker makes (each food, the yards'
   salvage, the bore's artifacts); the Dome's fall runs down by what the yards took; the carters and the warehouses are there. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
const SIMF=['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-economy.js','77-sim-6-govern.js',
 '77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-6-trade.js','77-sim-7-ledger.js','77-sim-7-lod.js','77-sim-7-stocks.js','77-sim-8-export.js','77-sim-9-debug.js'];
const SRC=SIMF.map(f=>fs.readFileSync(path.join(ROOT,'core/simulation',f),'utf8')).concat(['core/rand/08-core-rand.js','settlements/theodiga/src/43-th-arc-program.js',
 'settlements/theodiga/src/47-th-sim.js','settlements/theodiga/src/49-th-econ.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')));
const DAYS=7;
/* a week of the town: the census declared, the economy on it, lowered to the abstract level and stepped a minute at a time */
function run(rates){const C={console};C.window=C;vm.createContext(C);for(const s of SRC)vm.runInContext(s,C);C.RATES=rates||null;C.DAYS=DAYS;
 return vm.runInContext(`(function(){
  const Q=['square','bazaar','gate','salvage','farmers','poor','farms'];
  const KEYS=['xa_scrap_house','xa_scrap_row','xa_scrap_bazaar','xa_scrap_store','xa_scrap_serai','xa_scrap_gate','xa_scrap_shrine','xa_scrap_bath','xa_scrap_granary','xa_scrap_farm','qb_hostel','qb_chorten','xa_scrap_hull','xa_scrap_court'];
  const lots=[],byQ={};
  for(let i=0;i<420;i++){const q=Q[i%7],k=KEYS[Math.floor(i/7)%KEYS.length],p=/house|row|hull|court/.test(k)?6+(i*7)%9:0;lots.push({id:'t'+i,key:k,name:k,x:400+(i%30)*20,y:440,z:-300+Math.floor(i/30)*40,quarter:q,people:p});byQ[q]=(byQ[q]||0)+p;}
  for(let i=0;i<12;i++)lots.push({id:'y'+i,key:'xa_scrap_store',name:'a scrap store',x:100+i*12,y:2,z:390,quarter:'works',people:0,work:'salvage'});
  lots.push({id:'b0',key:'xa_scrap_court',name:"the Rare Devisers' lodge",x:280,y:1,z:480,quarter:'works',people:0,work:'the bore'});
  lots.push({id:'b1',key:'xa_scrap_store',name:"the Devisers' stores",x:280,y:1,z:505,quarter:'works',people:0,work:'the bore'});
  const B=['grain','pulse','tuber'],fields=[];for(let i=0;i<60;i++)fields.push({id:'f'+i,bucket:B[i%3],corners:[[140+(i%8)*24,-180+Math.floor(i/8)*14],[162+(i%8)*24,-180+Math.floor(i/8)*14],[162+(i%8)*24,-168+Math.floor(i/8)*14],[140+(i%8)*24,-168+Math.floor(i/8)*14]],y:285});
  let H=8;
  TH_SIM.declare(SIM,{lots,fields,census:{byQuarter:byQ},arc:TH_ARC_PROGRAM,kora:{x0:-100,x1:280,zc:x=>-140*(1-Math.pow(x/320,2)),y:400},gx:1150,gz:0,hour:()=>H%24,day:()=>Math.floor(H/24),t:()=>H*200});
  const X=TH_ECON.declare(SIM,{fields,rates:RATES});
  SIM.level('theodiga','abstract');SIM.jump();
  for(let m=0;m<DAYS*1440;m++){H+=1/60;SIM.step();}
  const R=TH_ECON.report(SIM,X);
  return {X:{warehouses:X.warehouses,carts:X.carts,makers:X.makers},R,carts:SIM.all('actor').filter(a=>a.driven).length};})()`,C);}
const base=run();
const town=base.R.town,F=['grain','pulse','tuber','milk','honey','bread'];
console.log('a week: '+F.map(g=>g+' '+town[g].opening+' -> '+town[g].closing).join(', ')+'; salvage '+town.salvage.made+', artifacts '+town.artifacts.made+'; meals '+JSON.stringify(base.R.meals));
const CHECKS={
 'the books balance (opening + made + imported - consumed - spoiled - exported = closing)':X=>[X.R.ok===true&&Object.values(X.R.town).every(r=>Math.abs(r.residual)<=.5),X.R.ok?'every good':X.R.problems.join('; ')],
 'the town feeds itself (no food falls by a fifth over the week, nobody without a meal)':X=>{const bad=F.filter(g=>X.R.town[g].closing<.8*X.R.town[g].opening);const none=(X.R.meals&&X.R.meals.none)||0;
   return [bad.length===0&&none===0,(bad.join(', ')||'every food holds')+'; '+none+' meals of nothing'];},
 'every maker makes (each food, the salvage, the artifacts)':X=>{const bad=F.concat(['salvage','artifacts']).filter(g=>!(X.R.town[g].made>0));return [bad.length===0,bad.join(', ')||'all eight goods made'];},
 'the Dome\'s fall runs down by what the yards took':X=>{const S=(X.R.sites||[]).find(s=>s.id==='th.site.dome-fall');return [!!S&&S.taken>0&&Math.abs(S.start-S.taken-S.amount)<1e-6&&S.taken===X.R.town.salvage.made,S?S.start+' - '+S.taken+' = '+S.amount:'no site'];},
 'the carters and the warehouses are there':X=>[X.X.carts>0&&X.carts===X.X.carts&&X.X.warehouses>0,X.X.carts+' carters, '+X.X.warehouses+' warehouses']};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](base);T.ok(name+' ('+detail+')',pass,detail);}
/* the negatives: a fault each, the check must fail on it */
{const X=JSON.parse(JSON.stringify(base));X.R.ok=false;X.R.problems=['grain: residual 40'];X.R.town.grain.residual=40;T.ok('negative: unbalanced books are caught',!CHECKS['the books balance (opening + made + imported - consumed - spoiled - exported = closing)'](X)[0]);}
{const starved=run({surplus:.35});T.ok('negative: a town whose makers are sized to a third of its meals is caught short',!CHECKS['the town feeds itself (no food falls by a fifth over the week, nobody without a meal)'](starved)[0],
  F.map(g=>g+' '+starved.R.town[g].closing).join(', '));
 const noBread=run({bake:{in:{grain:3},out:{bread:8},hours:1e7}});T.ok('negative: kitchens that never finish a batch are caught',!CHECKS['every maker makes (each food, the salvage, the artifacts)'](noBread)[0]);}
{const X=JSON.parse(JSON.stringify(base));const S=X.R.sites.find(s=>s.id==='th.site.dome-fall');S.amount+=100;T.ok('negative: a fall that does not run down by the take is caught',!CHECKS['the Dome\'s fall runs down by what the yards took'](X)[0]);}
{const X=JSON.parse(JSON.stringify(base));X.X.carts=0;T.ok('negative: a town without carters is caught',!CHECKS['the carters and the warehouses are there'](X)[0]);}
T.done();
