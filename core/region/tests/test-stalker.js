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
const vm=require('vm');
const load=()=>{vm.runInThisContext(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>vm.runInThisContext(rd('core/simulation/'+f)));
 vm.runInThisContext(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);
 vm.runInThisContext(rd('core/region/50-region-valley.js'));
 vm.runInThisContext(rd('core/region/53-region-ambush.js'));
 vm.runInThisContext(rd('core/region/54-region-outlaws.js'));
 vm.runInThisContext(rd('core/region/data/stalker-tune.js'));return H;};
const t=n=>(n/1000).toFixed(1)+' t';
function run(days,edit){const H=load(),V=STALKER_TUNE.valley({});if(edit)edit(V);const S=H.simValley(V);
 const a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap();
 return{H,V,S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},xfer:SIM.transfersReport?SIM.transfersReport():{},
  bounty:SIM.bountyReport?SIM.bountyReport():null,outlaws:SIM.outlawsReport?SIM.outlawsReport():null,
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

// ---- 8 (S3 Part 2): Range salvage expeditions pay Ranger HQ its 15% cut, independent of passing road traffic
{const E=Y.S.expeditions||{};
 const alloyGross=(E.grossSalvage&&E.grossSalvage.alloy)||0,alloyCut=(E.rangerCut&&E.rangerCut.alloy)||0;
 const ratio=alloyGross>0?alloyCut/alloyGross:0;
 T.ok('S3 Part 2: Range salvage expeditions stage from Ranger HQ and pay Ranger HQ its 15% cut of expedition profits, balancing every book',
  E.runs>=10&&alloyCut>0&&Math.abs(ratio-0.15)<0.03&&Y.ledger.ok,
  E.runs+' expeditions: gross alloy '+alloyGross+', Ranger HQ cut '+alloyCut+' ('+Math.round(ratio*100)+'%)');
 const zeroTraffic=run(120,V=>{V.roads=[];});
 T.neg('S3 Part 2: expeditions still pay Ranger HQ its cut when passing road traffic is zero (an expedition config with 0% cut pays nothing)',
  cutAlloy=>cutAlloy>0&&zeroTraffic.ledger.ok,0,(zeroTraffic.S.expeditions&&zeroTraffic.S.expeditions.rangerCut.alloy)||0);}

// ---- 9 (S3 Part 2, owner ruling 2026-11-25): Standing Stalker bounty as a high exchange price for pneumatic guns & Ancient-alloy blades
{const ws=(Y.bounty&&Y.bounty.warrants)||[];
 const wGun=ws.find(w=>w.id==='bounty.rangers.stalker.gun');
 const wBlade=ws.find(w=>w.id==='bounty.rangers.stalker.blade');
 const bf06=Y.outlaws&&Y.outlaws.factions&&Y.outlaws.factions['BF-06'];
 T.ok('S3 Part 2: Ranger HQ implements its Stalker bounty as standing high exchange prices for salvaged pneumatic guns (`stalker_guns`) and Ancient-alloy blades (`stalker_blades`)',
  !!wGun&&wGun.standing===true&&wGun.trophyGood==='stalker_guns'&&wGun.amount===420&&wGun.trophiesReceived>=10&&(wGun.paidGoods.grain||0)>=500
  &&!!wBlade&&wBlade.standing===true&&wBlade.trophyGood==='stalker_blades'&&wBlade.amount===280&&wBlade.trophiesReceived>=20&&(wBlade.paidGoods.arms||0)>=20
  &&!!bf06&&bf06.stage==='active',
  'exchanged guns: '+(wGun&&wGun.trophiesReceived)+' (paid grain '+(wGun&&wGun.paidGoods.grain)+'), blades: '
  +(wBlade&&wBlade.trophiesReceived)+' (paid arms '+(wBlade&&wBlade.paidGoods.arms)+')');
 T.neg('a one-off warrant or one with zero trophies exchanged cannot serve as Ranger HQ\'s standing weapon exchange bounty',
  w=>w.standing===true&&w.status==='open'&&w.trophiesReceived>=10,
  Object.assign({},wGun,{standing:false,status:'killed',trophiesReceived:0}),wGun);}

// ---- 9b (owner ruling 2026-11-25): Ancient-alloy blades arm an elite Ranger unit; pneumatic guns mount as gate guns across the Yuni lands
{const SW=Y.S.stalkerWeapons||{};
 const eu=SW.eliteUnit||{},gg=SW.gateGuns||{};
 const sites=gg.sites||[];
 const yuniMounted=sites.filter(s=>s.settlement===POOL&&s.mounted>0);
 const lakeGate=sites.find(s=>s.id==='sz85a8i5js.lake_gate');
 T.ok('S3 Part 2: salvaged Ancient-alloy blades arm the White-Blade Watch elite Ranger unit at Ranger HQ, raising Ranger posse strength',
  eu.id==='rangers.blade_watch'&&eu.bladesIssued>=20&&eu.troopersEquipped>=10&&eu.bonusStrength>=2&&Y.ledger.ok,
  eu.name+': '+eu.bladesIssued+' Ancient-alloy blades issued -> '+eu.troopersEquipped+' elite Rangers armed (+'+eu.bonusStrength+' posse strength)');
 T.neg('an unequipped Ranger unit with 0 blades issued has armed nobody',
  u=>u.bladesIssued>=20&&u.troopersEquipped>=10,{bladesIssued:0,troopersEquipped:0},eu);
 T.ok('S3 Part 2: salvaged Stalker pneumatic guns mount on Ranger HQ\'s gate and ship down the West Trunk to mount as gate guns across the Yuni lands',
  !!lakeGate&&lakeGate.mounted===lakeGate.quota&&gg.shippedToYuni>=8&&gg.totalMounted>=10&&yuniMounted.length>=2&&Y.ledger.ok,
  'Lake Vapora gate '+((lakeGate&&lakeGate.mounted)||0)+'/'+((lakeGate&&lakeGate.quota)||0)+', shipped to Yuni '+gg.shippedToYuni
  +', mounted across Yuni gates: '+yuniMounted.map(s=>s.id+':'+s.mounted).join(', '));
 T.neg('if pneumatic guns never ship down the West Trunk, Yuni\'s city gates mount none',
  g=>g.shippedToYuni>0&&g.totalMounted>=4,{shippedToYuni:0,totalMounted:0},gg);}

// ---- 10 (S3 Part 2): Hidden Hub 01 source loop — attrition-proof on its own, ended by Heir/Yusar or force, and NEVER leaked
{const H2=load(),V2=STALKER_TUNE.valley({});
 V2.ambushes={parties:[{id:'stalkers.gate',name:'Range Stalkers',kind:'stalker',legs:{'caravan.rangers.west':[0,1,2]},every:1,spare:0,strength:8,beasts:0.2,people:2}]};
 const S2=H2.simValley(V2);
 H2.valleyRun(90*1440,60);
 const beforeEnd=S2.ambushes['stalkers.gate'].tries;
 const actBefore=H2._stalkerActivity(S2);
 /* Weak expedition fails to end Hub 01; full Heir/Yusar or force expedition ends it permanently! */
 const badForce=H2.resolveHub01(S2,{mode:'force',relics:1,army:10,explosives:20});
 const badCall=H2.resolveHub01(S2,{mode:'call',who:'stranger'});
 const goodForce=H2.resolveHub01(S2,{mode:'force',relics:4,army:120,explosives:350});
 H2.valleyRun(120*1440,60);
 const afterEnd=S2.ambushes['stalkers.gate'].tries;
 T.neg('S3 Part 2: an under-equipped party or non-Heir cannot end the hidden source, whereas a full relic+army+explosives expedition silences it',
  r=>r.ok&&r.status==='dead',badForce,goodForce);
 T.ok('S3 Part 2: once the source is ended (`dead`), zero further Stalker ambushes occur anywhere in the province (and non-Heir call is refused)',
  !badCall.ok&&beforeEnd>0&&actBefore.activity>=0.25&&afterEnd===beforeEnd,
  'before end: '+beforeEnd+' Stalker ambushes; in 120 days after end: '+(afterEnd-beforeEnd));
 const allReports=JSON.stringify({books:Y.B,trade:Y.trade,xfer:Y.xfer,bounty:Y.bounty,outlaws:Y.outlaws,exp:Y.S.expeditions,weapons:Y.S.stalkerWeapons});
 T.neg('S3 Part 2: neither "pressure" nor Hub 01\'s id (`sodpa02bfv`) ever appears in books, trade, transfer, bounty, outlaw, expedition or weapon reports',
  s=>s.indexOf('pressure')<0&&s.indexOf(STALKER_TUNE.hub.id)<0,allReports+' pressure '+STALKER_TUNE.hub.id,allReports);}
T.done();
