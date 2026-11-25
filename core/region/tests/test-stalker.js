// node core/region/tests/test-stalker.js — the Stalker Range on core/simulation (step S3 of
// openworld/catch-bowl/PLAN-SIM.md section 4; the owner's answers of 2026-11-24). One fort that matters, ten kept
// waystations on a network measured off the model's own ground (openworld/catch-bowl/tools/gate_route.py), the Emirate's
// salary as a standing bill of supplies, and Hub 01 as a record with no economy that must never become a settlement.
//
// S3's second half -- the bounty on Stalkers (SIM.bounty) and the Rangers' cut of expeditions -- is NOT here and has no
// checks here: it waits on code that is approved and unbuilt (core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md).
// Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/stalker-tune.js'));return H;};
const t=n=>(n/1000).toFixed(1)+' t';
function run(days,edit){const H=load(),V=STALKER_TUNE.valley({});if(edit)edit(V);const S=H.simValley(V);
 const a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap();
 return{H,V,S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},xfer:SIM.transfersReport?SIM.transfersReport():{},
  ledger:SIM.ledger(a,b,{tol:1})};}
const t0=Date.now(),Y=run(365),B=Y.B;
console.log('a year of the Stalker Range in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' settlements, '
 +Y.V.settlements.reduce((n,s)=>n+s.people,0)+' people at 1 actor to '+Y.V.scale);
const HQ='sz85a8i5js',POOL='crown.yuni';

// ---- 1: the census the plan allows and no more
{const P=STALKER_TUNE.places,fort=P.filter(x=>x.kind==='fort'),posts=P.filter(x=>x.kind==='post');
 const people=P.reduce((n,x)=>n+x.people,0),hq=P.find(x=>x.id===HQ);
 const good=fort.length===1&&hq.people===500&&hq.m===1982&&hq.water_km===2&&posts.length===10&&!Y.S.problems.length;
 T.ok('S3: one fort of 500 on Lake Vapora\'s shore at 1,982 m, ten kept waystations, and nothing else',good,
  hq.people+' at the fort + '+posts.length+' posts of '+posts.map(x=>x.people).join('/')+' = '+people+' people; problems: '
  +(Y.S.problems.slice(0,2).join('; ')||'none'));
 T.neg('a province with a second town is not this one',
  x=>x.filter(q=>q.kind==='fort'||q.people>100).length===1,
  P.concat([{id:'x',kind:'town',people:4000}]),P);}

// ---- 2: nothing in the province farms, which is the fact that sets its shape (PLAN-SIM 4a)
{const grows=STALKER_TUNE.places.some(P=>Object.keys(P.make||{}).some(g=>/grain|dates|figs|hides|timber/.test(g)));
 const hq=STALKER_TUNE.places.find(P=>P.id===HQ),mk=Object.keys(hq.make||{});
 T.ok('S3: nothing in the Stalker Range farms: the fort makes salvage and nothing else, at 1,982 m in a 0 mm province',
  !grows&&mk.length===2&&mk.indexOf('alloy')>=0&&mk.indexOf('cells')>=0,
  'the fort makes '+mk.join(', ')+'; no place grows food');
 T.neg('a province with a farm feeds itself and does not need the salary',
  x=>!x.some(P=>Object.keys(P.make||{}).some(g=>/grain/.test(g))),
  STALKER_TUNE.places.map(P=>P.id===HQ?Object.assign({},P,{make:{grain:1e6}}):P),STALKER_TUNE.places);}

// ---- 3: EVERY place carries a water number AND a fodder number (core/simulation/SCHEMA.md; PLAN-SIM 2x)
{const bad=STALKER_TUNE.places.filter(P=>!P.well||!(P.fodder>0));
 const tanks=STALKER_TUNE.places.filter(P=>P.tank).length;
 T.ok('S3: every place in the province has a water number and a fodder number, most of them tanks and bins the patrol fills',
  bad.length===0&&tanks===10,
  bad.length?'WITHOUT BOTH: '+bad.map(P=>P.id).join(', '):STALKER_TUNE.places.length+' places, '+tanks+' of them tanks and bins');
 T.neg('a waystation with a tank and no fodder bin is a sink the beasts cannot be fed from',
  x=>x.every(P=>!!P.well&&P.fodder>0),
  STALKER_TUNE.places.map(P=>{if(P.id!=='gate.w3')return P;const d=Object.assign({},P);delete d.fodder;return d;}),
  STALKER_TUNE.places);}

// ---- 4: the network as the tool measured it, and the south branch withdrawn
{const N=STALKER_TUNE.network,kept=N.trunks.concat(N.branches).reduce((a,x)=>a.concat(x.kept),[]);
 const ids=STALKER_TUNE.places.map(P=>P.id);
 const bothies=N.trunks.concat(N.branches).reduce((n,x)=>n+x.bothies,0);
 const west=N.trunks.find(x=>x.id==='west'),east=N.trunks.find(x=>x.id==='east');
 const good=N.hub===HQ&&kept.length===10&&kept.every(k=>ids.indexOf(k)>=0)
  &&N.trunks.length===2&&N.branches.length===2&&N.branches.every(b=>b.of==='east')
  &&N.withdrawn.length===1&&N.withdrawn[0].id==='south'
  &&west.km===538&&east.km===148&&bothies===39;
 T.ok('S3: two trunks and two forks off the east one, every kept post declared, the south branch withdrawn, 39 bothies between them',good,
  'west '+west.km+' km / '+west.kept.length+' posts, east '+east.km+' km shared then forking; branches '
  +N.branches.map(b=>b.id+' '+b.km+' km').join(', ')+'; withdrawn: '+N.withdrawn.map(w=>w.id).join(', '));
 T.neg('a network whose south branch is still a branch has not read the ground',
  x=>x.withdrawn.some(w=>w.id==='south'),Object.assign({},N,{withdrawn:[]}),N);}

// ---- 5: HUB 01 IS NOT A SETTLEMENT and must never become one (the owner: no trail, no people, no polity)
{const h=STALKER_TUNE.hub,inV=Y.V.settlements.some(s=>s.id===h.id);
 const inRoads=Y.V.roads.some(r=>(r.stops||[]).indexOf(h.id)>=0||r.from===h.id||r.to===h.id);
 const good=!inV&&!inRoads&&h.economy===false&&h.people===0&&h.faction===null&&h.hidden===true
  &&h.endable.byAttrition===false&&h.endable.byExpedition===true;
 T.ok('S3: Hub 01 is a record and not a settlement -- no economy, no people, no polity, no road to it, and endable by an expedition but not by attrition',good,
  h.id+' at '+h.m+' m: in the valley '+inV+', on a road '+inRoads+', hidden '+h.hidden);
 T.neg('a Hub 01 that is a settlement has an economy the owner ruled it does not have',
  x=>!x.some(s=>s.id===h.id),Y.V.settlements.concat([{id:h.id,people:0}]),Y.V.settlements);}
// and its pressure appears in no report a player could read
{const rep=JSON.stringify({books:Y.B,trade:Y.trade,xfer:Y.xfer,order:Y.S.order});
 T.ok('S3: Hub 01\'s pressure appears in no settlement, trade or transfer report',rep.indexOf('pressure')<0&&rep.indexOf(STALKER_TUNE.hub.id)<0,
  'the year\'s reports mention neither "pressure" nor '+STALKER_TUNE.hub.id);
 T.neg('a report naming the hub has leaked it',
  x=>x.indexOf(STALKER_TUNE.hub.id)<0,rep+STALKER_TUNE.hub.id,rep);}

// ---- 6: the salary falls and lands, every month, and never answers scarcity
{const X=Y.xfer[STALKER_TUNE.salary.id]||{};
 const times=X.times||0,landed=X.landed||{},owed=X.owed||{};
 /* `owed` carries a key per good of the bill whether or not anything is owed, so the test is on the AMOUNTS: a bill met
    in full reads 0 everywhere. Checking the keys instead reported a debt that did not exist. */
 const debt=Object.keys(owed).filter(g=>(owed[g]||0)>0);
 const sent=X.sent||{},exact=Object.keys(sent).every(g=>Math.abs((sent[g]||0)-(landed[g]||0))<1e-6);
 const good=times>=12&&times<=13&&(landed.grain||0)>0&&(landed.charcoal||0)>0&&debt.length===0&&exact;
 T.ok('S3: the Emirate\'s salary falls twelve times in a year and lands in full -- a fixed bill, never priced and never answering scarcity',good,
  times+' times; landed grain '+t(landed.grain||0)+', charcoal '+t(landed.charcoal||0)+', arms '+Math.round(landed.arms||0)
  +'; sent equals landed, so nothing is in two places; owed: '+(debt.join(', ')||'nothing'));
 T.neg('a salary with a good owed has not been met in full',
  x=>Object.keys(x).filter(g=>(x[g]||0)>0).length===0,Object.assign({},owed,{grain:1}),owed);}
// it is what makes 500 people possible: the bill covers the fort's own year
{const d=STALKER_TUNE.diet.fort,sal=STALKER_TUNE.salary.goods,yr=365/STALKER_TUNE.salary.every;
 const eats=d.grain*500*365,gives=sal.grain*yr;
 T.ok('S3: the salary\'s grain covers the fort\'s year with a little over, which is what makes a garrison of 500 possible in a 0 mm province',
  gives>=eats&&gives<=eats*1.3,
  'the fort eats '+t(eats)+' a year; the salary brings '+t(gives)+' ('+Math.round(100*gives/eats)+' %)');
 T.neg('a salary short of the fort\'s own bread cannot hold 500 people',x=>x.gives>=x.eats,{gives:eats*.5,eats},{gives,eats});}

// ---- 7: the three patrols keep the posts, and the books balance
{const ids=Y.V.roads.map(r=>r.id),want=STALKER_TUNE.patrols.map(r=>r.id);
 const good=want.every(x=>ids.indexOf(x)>=0)&&ids.length===3;
 T.ok('S3: one patrol per branch -- west, north-east and south-east -- and no other road in the province',good,
  ids.join(', '));
 T.neg('a province with one round over all ten posts walks the same beasts up both trunks',
  x=>x.length===3,[ 'caravan.rangers' ],ids);}
T.ok('S3: the province\'s year balances, every settlement, road and good',Y.ledger.ok,
 Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
/* and past the stocked start the patrols actually carry: the posts are stocked for 400 days like the Bowl's places, so
   inside a year nobody wants anything (PLAN-SIM 3c records why that is right and not a bug) */
{const L=run(520),landed={};
 L.V.roads.forEach(r=>{const M=(SIM.tradeReport(r.id)||{}).landed||{};
  Object.keys(M).forEach(k=>{const to=k.split('>')[1];Object.keys(M[k]).forEach(g=>{
   (landed[to]=landed[to]||{})[g]=(landed[to][g]||0)+M[k][g];});});});
 const posts=STALKER_TUNE.places.filter(P=>P.kind==='post').map(P=>P.id);
 const fed=posts.filter(id=>landed[id]&&Object.keys(landed[id]).length>0);
 T.ok('S3: run past the stocked start and the patrols reach their posts, carrying the upkeep the salary pays for',fed.length>=4,
  '520 days: '+fed.length+' of '+posts.length+' posts landed goods ('+(fed.slice(0,4).join(', ')||'none')+')');
 T.neg('a province where no post is ever reached has no upkeep to pay for',x=>x>=4,0,fed.length);}
T.done();
