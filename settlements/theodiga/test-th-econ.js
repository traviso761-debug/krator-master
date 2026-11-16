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
 '77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-population.js','77-sim-6-trade.js','77-sim-6-money.js','77-sim-7-ledger.js','77-sim-7-lod.js','77-sim-7-stocks.js','77-sim-8-export.js','77-sim-9-debug.js'];
const SRC=SIMF.map(f=>fs.readFileSync(path.join(ROOT,'core/simulation',f),'utf8')).concat(['core/rand/08-core-rand.js','settlements/theodiga/src/43-th-arc-program.js',
 'settlements/theodiga/src/47-th-sim.js','settlements/theodiga/src/49-th-econ.js','settlements/theodiga/src/49m-th-money.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')));
const DAYS=7;
/* the road's tune (src/49-th-econ.js TUNE.road), for the negative that holds its lots back */
const TUNE_ROAD={minutes:600,tea:3000,charcoal:600,charStart:300,cap:800,size:[2,6],per:2,mins:180,speed:1};
/* a week of the town: the census declared, the economy on it, lowered to the abstract level and stepped a minute at a time */
function run(rates,money){const C={console};C.window=C;vm.createContext(C);for(const s of SRC)vm.runInContext(s,C);C.RATES=rates||null;C.MONEY=money||null;C.DAYS=DAYS;
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
  const X=TH_ECON.declare(SIM,{fields,rates:RATES});const MN=TH_MONEY.declare(SIM,MONEY);X.snap=SIM.ledgerSnap();let MA=null;
  SIM.level('theodiga','abstract');SIM.jump();
  for(let m=0;m<DAYS*1440;m++){H+=1/60;SIM.step();TH_ECON.tick(SIM,X);if(!MA&&SIM.MONEY.m1.live)MA=TH_MONEY.books(SIM);}
  const R=TH_ECON.report(SIM,X);const MB=TH_MONEY.books(SIM),ML=MA?SIM.ledger(MA.ledger,MB.ledger,{tol:.5}):null;
  return {money:{a:MA,b:MB,ledger:ML?{ok:ML.ok,problems:ML.problems.slice(0,6),money:!!ML.money}:null,accounts:MN.accounts},X:{warehouses:X.warehouses,carts:X.carts,makers:X.makers,keepers:X.keepers,robes:X.robes,lampDay:X.lampDay,rates:X.rates},R,carts:SIM.all('actor').filter(a=>a.driven).length};})()`,C);}
const base=run();
const town=base.R.town,F=['grain','pulse','tuber','milk','honey','bread'];
console.log('a week: '+F.map(g=>g+' '+town[g].opening+' -> '+town[g].closing).join(', ')+'; tea in '+town.tea.imported+', charcoal in '+town.charcoal.imported+'; scrap '+town.scrap.made+', iron '+town.iron.made+' (used '+town.iron.consumed+'), rarities '+town.rarities.made+'; meals '+JSON.stringify(base.R.meals));
console.log('the lamps: '+base.X.keepers+' keepers burn '+base.X.lampDay+' pats a day (churn batch '+base.X.rates.churn+' h); butter '+town.butter.opening+' -> '+town.butter.closing+
 ' (made '+town.butter.made+', burnt '+town.butter.consumed+'); robes: '+base.X.robes+' worn, '+((base.R.worn||{}).robe||0)+' worn out, '+((base.R.bought||{}).robe||0)+' bought, garments '+
 town.garments.opening+' -> '+town.garments.closing+' (in '+town.garments.imported+'); rarities '+town.rarities.made+' found, '+town.rarities.exported+' to the factor house ('+JSON.stringify(base.R.factor)+')');
const CHECKS={
 'the books balance (opening + made + imported - consumed - spoiled - exported = closing)':X=>[X.R.ok===true&&Object.values(X.R.town).every(r=>Math.abs(r.residual)<=.5),X.R.ok?'every good':X.R.problems.join('; ')],
 'the town feeds itself (no food falls by a fifth over the week, nobody without a meal)':X=>{const bad=F.filter(g=>X.R.town[g].closing<.8*X.R.town[g].opening);const none=(X.R.meals&&X.R.meals.none)||0;
   return [bad.length===0&&none===0,(bad.join(', ')||'every food holds')+'; '+none+' meals of nothing'];},
 'every maker makes (each food, the scrap, the iron, the rarities)':X=>{const bad=F.concat(['scrap','iron','rarities']).filter(g=>!(X.R.town[g].made>0));return [bad.length===0,bad.join(', ')||'all nine goods made'];},
 'the road brings what the town lacks (its tea, and the tea never runs out; the charcoal comes when it runs low)':X=>{const t=X.R.town;return [t.tea.imported>0&&t.tea.closing>0&&(X.R.meals.none||0)===0,'tea '+t.tea.imported+' in, '+t.tea.closing+' left'];},
 /* (the tools wear only where people are posed: the page's walk, not the abstract level; the page checks them) */
 'the smelter turns scrap and charcoal to iron':X=>[X.R.town.iron.made>0&&X.R.town.charcoal.consumed>0,X.R.town.iron.made+' iron from '+X.R.town.charcoal.consumed+' charcoal'],
 'the Dome\'s fall runs down by what the yards took':X=>{const S=(X.R.sites||[]).find(s=>s.id==='th.site.dome-fall');return [!!S&&S.taken>0&&Math.abs(S.start-S.taken-S.amount)<1e-6&&S.taken===X.R.town.scrap.made,S?S.start+' - '+S.taken+' = '+S.amount:'no site'];},
 'the Lamp Hall burns its butter and the churns make it':X=>{const b=X.R.town.butter;return [X.X.keepers>0&&b.made>0&&b.consumed>0&&b.closing>0,X.X.keepers+' keepers, '+b.made+' pats churned, '+b.consumed+' burnt, '+b.closing+' left'];},
 'the town wears out its robes and buys new ones at the bazaar':X=>{const g=X.R.town.garments,w=(X.R.worn||{}).robe||0,b=(X.R.bought||{}).robe||0;
   return [X.X.robes>0&&w>0&&b>0&&g.consumed===b,X.X.robes+' robes worn, '+w+' worn out, '+b+' bought ('+g.consumed+' garments)'];},
 'the Devisers send what the bore finds to their factor house':X=>{const r=X.R.town.rarities;return [r.made>0&&r.exported>0&&!!X.R.factor&&X.R.factor.sent===r.exported,r.made+' found, '+r.exported+' sent in '+(X.R.factor?X.R.factor.trips:0)+' consignments'];},
 'the carters and the warehouses are there':X=>[X.X.carts>0&&X.carts===X.X.carts&&X.X.warehouses>0,X.X.carts+' carters, '+X.X.warehouses+' warehouses']};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](base);T.ok(name+' ('+detail+')',pass,detail);}
/* the negatives: a fault each, the check must fail on it */
{const X=JSON.parse(JSON.stringify(base));X.R.ok=false;X.R.problems=['grain: residual 40'];X.R.town.grain.residual=40;T.ok('negative: unbalanced books are caught',!CHECKS['the books balance (opening + made + imported - consumed - spoiled - exported = closing)'](X)[0]);}
{const starved=run({surplus:.35});T.ok('negative: a town whose makers are sized to a third of its meals is caught short',!CHECKS['the town feeds itself (no food falls by a fifth over the week, nobody without a meal)'](starved)[0],
  F.map(g=>g+' '+starved.R.town[g].closing).join(', '));
 const noBread=run({bake:{in:{grain:3},out:{bread:8},hours:1e7}});T.ok('negative: kitchens that never finish a batch are caught',!CHECKS['every maker makes (each food, the scrap, the iron, the rarities)'](noBread)[0]);
 const noRoad=run({road:Object.assign({},TUNE_ROAD,{minutes:1e7})});T.ok('negative: a road whose lots never arrive is caught',!CHECKS['the road brings what the town lacks (its tea, and the tea never runs out; the charcoal comes when it runs low)'](noRoad)[0],'tea '+noRoad.R.town.tea.imported);}
{const cold=run({smelt:{in:{scrap:4,charcoal:1},out:{iron:1},hours:1e7}});T.ok('negative: a smelter that never finishes a batch is caught',!CHECKS['the smelter turns scrap and charcoal to iron'](cold)[0]);}
{const X=JSON.parse(JSON.stringify(base));const S=X.R.sites.find(s=>s.id==='th.site.dome-fall');S.amount+=100;T.ok('negative: a fall that does not run down by the take is caught',!CHECKS['the Dome\'s fall runs down by what the yards took'](X)[0]);}
/* one run with three faults: churns that never finish, robes that never wear, Devisers who never send */
{const F=run({churn:{in:{milk:6},out:{butter:1},hours:1e7},robeLife:1e9,factor:{hour:99,keep:0}});
 T.ok('negative: churns that never finish a batch are caught',!CHECKS['the Lamp Hall burns its butter and the churns make it'](F)[0]);
 T.ok('negative: robes that never wear out are caught',!CHECKS['the town wears out its robes and buys new ones at the bazaar'](F)[0]);
 T.ok('negative: Devisers who never send are caught',!CHECKS['the Devisers send what the bore finds to their factor house'](F)[0]);}
{const X=JSON.parse(JSON.stringify(base));X.X.carts=0;T.ok('negative: a town without carters is caught',!CHECKS['the carters and the warehouses are there'](X)[0]);}
/* THE MONEY (src/49m-th-money.js, T-money-1): the checks are plain functions of two snapshots (the market's opening and the
   week's end), so each is run on the week and on a copy with a fault */
const MCTX={};vm.createContext(MCTX);vm.runInContext(fs.readFileSync(path.join(ROOT,'settlements/theodiga/src/49m-th-money.js'),'utf8'),MCTX);
const MCHK=X=>MCTX.TH_MONEY.checks(X.money.a,X.money.b,X.money.ledger);
const mOk=(X,i)=>MCHK(X)[i].ok;
T.ok('money: the market opens within the week (the calibration)',!!base.money.a,base.money.a?'at minute '+base.money.a.minute:'no snapshot: the market never opened');
if(base.money.a){console.log('the money: '+base.money.accounts+' accounts; opened at minute '+base.money.a.minute+', markup '+(base.money.b.markup||1).toFixed(2));
 MCHK(base).forEach(c=>T.ok('money: '+c.name+' ('+c.detail+')',c.ok,c.detail));
 const cp=()=>JSON.parse(JSON.stringify(base)),hh=X=>X.money.b.accounts.find(A=>A.kind==='household');
 {const X=cp();X.money.b.accounts=X.money.b.accounts.filter(A=>A.id!=='hh:'+X.money.b.expect.households[0]);T.ok('negative: a household without its account is caught',!mOk(X,0));}
 {const X=cp();hh(X).balance=-5;T.ok('negative: an account below nothing is caught',!mOk(X,1));}
 {const X=cp();X.money.ledger.ok=false;X.money.ledger.problems=['qud: residual 40'];T.ok('negative: money off its books is caught',!mOk(X,2));}
 {const X=cp();X.money.b.prices.grain=0;T.ok('negative: a price under one qud is caught',!mOk(X,3));}
 {const X=cp();hh(X).balance+=10;T.ok('negative: quds from nowhere in a household are caught (the circular flow)',!mOk(X,4));}
 {const X=cp();X.money.b.accounts.find(A=>A.kind==='treasury').balance+=1e7;T.ok('negative: a treasury far off even is caught',!mOk(X,6));}
 {const broke=run(null,{treasury:0,endow:{poor:0,middle:0,rich:0}});T.ok('negative: a treasury and households with nothing cannot pay the wage bill',!broke.money.a||!mOk(broke,5),
   broke.money.a?MCHK(broke)[5].detail:'the market never opened');}}
T.done();
