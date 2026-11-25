// node core/region/tests/test-five-tunes.js — step S4 / C6 (openworld/catch-bowl/PLAN-SIM.md section 6): all three of
// this region's tunes into EAST_RIFT with Xanadu and Longsong, as ONE LEDGER over five tunes. This is item 7 of the
// owner's brief of 2026-11-24 -- "prep this multi-region build to attach to the xanadu-oidong-highrift as unified Sim".
//
// The chain composes because each join takes a valley of the same shape and returns one:
//   STALKER_TUNE.join(BOWL_TUNE.join(CATCH_TUNE.join(EAST_RIFT.valley(Pxan, Pls))))
// EAST_RIFT.valley is itself Object.assign({}, XAN_TUNE.valley(...), {...}), which is why CATCH_TUNE.join takes it
// unchanged -- nothing in the three new tunes had to know that Longsong was there.
//
// THE RUNS ARE 120 DAYS, not a year. A year over 317 settlements is twenty-odd minutes and this test makes TWO runs to
// measure one number against the other; 120 days settles every structural question and the salt comparison, and the
// year-long runs live in each tune's own test (test-east-rift, test-catch, test-bowl-join, test-stalker).
// Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/xan-tune.js'));(0,eval)(rd('settlements/longsong/src/15-ls-tune.js'));
 (0,eval)(rd('core/region/data/east-rift.js'));(0,eval)(rd('core/region/data/catch-tune.js'));
 (0,eval)(rd('core/rand/08-core-rand.js'));
 fs.readdirSync(path.join(ROOT,'core','space')).filter(f=>/^\d.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/space/'+f)));
 fs.readdirSync(path.join(ROOT,'core','camp')).filter(f=>/^\d/.test(f)).sort().forEach(f=>(0,eval)(rd('core/camp/'+f)));
 (0,eval)(rd('core/region/data/bowl-tune.js'));(0,eval)(rd('core/region/data/stalker-tune.js'));return H;};
const PX=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json')),PL=JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
const t=n=>(n/1000).toFixed(1)+' t';
const DAYS=120,SB='sfgtxw10kr',JABAL='sa5o6dvjdv',POOL='gate.dasri';

/* the four stages, so each tune's own settlements can be named exactly rather than guessed at by scale */
function stages(){const H=load();
 const er=EAST_RIFT.valley(PX,PL),cv=CATCH_TUNE.join(er,{}),bv=BOWL_TUNE.join(cv,{}),sv=STALKER_TUNE.join(bv,{});
 const ids=V=>V.settlements.map(s=>s.id),minus=(a,b)=>a.filter(x=>b.indexOf(x)<0);
 const E=ids(er),C=ids(cv),B=ids(bv),S=ids(sv);
 return{H,er,cv,bv,sv,own:{eastrift:E,catch:minus(C,E),bowl:minus(B,C),stalker:minus(S,B)},gone:minus(C,S).concat(minus(E,S))};}
function go(V,H,days){const S=H.simValley(V),a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap();
 return{S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},xfer:SIM.transfersReport?SIM.transfersReport():{},
  ledger:SIM.ledger(a,b,{tol:1})};}

const G=stages();
console.log('the five tunes: '+G.er.settlements.length+' (Xanadu + Longsong) -> '+G.cv.settlements.length+' (+ the Catch) -> '
 +G.bv.settlements.length+' (+ the Bowl) -> '+G.sv.settlements.length+' (+ the Stalker Range), '
 +G.sv.settlements.reduce((n,s)=>n+s.people,0)+' people');

// ---- 1: all five tunes are in, and each one's own settlements can be named
{const o=G.own,good=o.eastrift.length>=280&&o.catch.length>=16&&o.bowl.length>=7&&o.stalker.length>=11
  &&G.sv.settlements.length===o.eastrift.length+o.catch.length+o.bowl.length+o.stalker.length-1;  /* -1: the Dasri pool goes */
 T.ok('S4: five tunes in one valley -- Xanadu and Longsong, the Catch, the Bowl, the Stalker Range -- and the Dasri pool gone',good,
  o.eastrift.length+' + '+o.catch.length+' + '+o.bowl.length+' + '+o.stalker.length+' - 1 = '+G.sv.settlements.length);
 T.neg('a valley missing a tune is not the five',
  x=>x.length>=11,[],G.own.stalker);}

// ---- 2: nothing of any tune's goods, factions or calendar is lost on the way in
{const g=Object.keys(G.sv.goods),f=G.sv.factions.map(x=>x.id),w=Object.keys(G.sv.calendar.windows);
 const want=[[Object.keys(G.er.goods),'East Rift goods'],[Object.keys(CATCH_TUNE.goods),'Catch goods'],
  [Object.keys(BOWL_TUNE.goods),'Bowl goods'],[Object.keys(STALKER_TUNE.goods),'Range goods']];
 const lost=want.filter(([xs])=>!xs.every(x=>g.indexOf(x)>=0)).map(([,nm])=>nm);
 const fl=[CATCH_TUNE,BOWL_TUNE,STALKER_TUNE].every(TU=>TU.factions.every(x=>f.indexOf(x.id)>=0));
 const wl=[G.er,{calendar:CATCH_TUNE.calendar},{calendar:BOWL_TUNE.calendar},{calendar:STALKER_TUNE.calendar}]
  .every(V=>Object.keys(V.calendar.windows).every(k=>w.indexOf(k)>=0));
 T.ok('S4: every tune\'s goods, factions and calendar windows survive the four joins',lost.length===0&&fl&&wl,
  g.length+' goods, '+f.length+' factions, '+w.length+' windows'+(lost.length?'; LOST: '+lost.join(', '):''));
 T.neg('a join that dropped a tune\'s goods is caught',
  x=>Object.keys(STALKER_TUNE.goods).every(k=>x.indexOf(k)>=0),g.filter(k=>k!=='charcoal'),g);}

// ---- 3: the things the earlier steps settled are still true at the end of the chain
{const sv=G.sv,road=id=>sv.roads.find(r=>r.id===id);
 const trainHome=(road('caravan.train')||{stops:[]}).stops[0]===JABAL;
 const poolGone=sv.settlements.every(s=>s.id!==POOL);
 const hubAbsent=sv.settlements.every(s=>s.id!==STALKER_TUNE.hub.id)
  &&sv.roads.every(r=>(r.stops||[]).indexOf(STALKER_TUNE.hub.id)<0&&r.from!==STALKER_TUNE.hub.id&&r.to!==STALKER_TUNE.hub.id);
 const salary=(sv.transfers||[]).some(x=>x.id===STALKER_TUNE.salary.id);
 const offsets=['caravan.getmastarz','caravan.goldanda'].map(id=>(road(id)||{}).offset);
 const staggered=offsets[0]===0&&offsets[1]>0;
 T.ok('S4: at the end of the chain the Train still loads at Jabal, the pool is gone, the salary is on the books, the rival houses still leave in turn, and Hub 01 is still not a settlement',
  trainHome&&poolGone&&hubAbsent&&salary&&staggered,
  'Train from '+((road('caravan.train')||{stops:['?']}).stops[0])+'; pool gone '+poolGone+'; salary '+salary
  +'; house offsets '+offsets.join(' / ')+'; hub absent '+hubAbsent);
 T.neg('a chain that lost the stagger has undone S2\'s fix',
  x=>x[0]===0&&x[1]>0,[0,0],offsets);}

// ---- 4: it runs, with one ledger over all five
const t0=Date.now(),J=go(G.sv,G.H,DAYS);
console.log(DAYS+' days of all five in '+((Date.now()-t0)/1000).toFixed(0)+' s: '+J.S.order.length+' settlements');
T.ok('S4: the five-tune valley runs with no problems reported',!J.S.problems.length,
 J.S.problems.slice(0,3).join('; ')||'none');
T.ok('S4: ONE LEDGER over five tunes balances -- every settlement, road, transfer and good',J.ledger.ok,
 J.ledger.ok?'all goods':J.ledger.problems.slice(0,3).join('; '));
// the salary still lands at the far end of the chain
{const X=J.xfer[STALKER_TUNE.salary.id]||{},debt=Object.keys(X.owed||{}).filter(g=>(X.owed[g]||0)>0);
 T.ok('S4: the Emirate\'s salary still falls and lands inside the five-tune valley',(X.times||0)>=3&&((X.landed||{}).grain||0)>0&&debt.length===0,
  (X.times||0)+' times in '+DAYS+' days, grain '+t((X.landed||{}).grain||0)+'; owed '+(debt.join(', ')||'nothing'));
 T.neg('a salary that never fell is not on the books',x=>x>=3,0,X.times||0);}

/* ---- 5: THE SALT, AND A PLAN EXPECTATION THAT TURNED OUT BACKWARDS. PLAN-SIM.md section 6 said S4 would show
   "Xanadu's salt shortfall narrows but does not close". Measured over 120 days it does neither: the Sultanate alone is
   short NOTHING, and with the three tunes joined it is short a little. The reason is worth more than the expectation:
   CATCH_TUNE.join REMOVES Xanadu's four Catch gateway roads (`trade.gate.iziz` and its three siblings) and puts the
   five groups' CARAVAN ROUNDS in their place. A gateway road delivered continuously; a caravan round of 133 days
   arrives in batches -- so the far ends of Xanadu's own distribution, its hamlets and ring villages of 145 to 290
   people, run dry between arrivals. That is the join trading a convenient fiction for a lumpy truth, and the cost is
   small and locatable rather than diffuse.
   So the check asserts the shape of the real answer: joined, the shortfall is SMALL against the Sultanate's appetite
   and it is CONCENTRATED at the gateway and the chain's far ends. */
const H2=load(),E2=EAST_RIFT.valley(PX,PL),A=go(E2,H2,DAYS);
const xanIds=G.own.eastrift.filter(id=>{const s=G.er.settlements.find(q=>q.id===id);return s&&s.scale!==EAST_RIFT.lsScale;});
const saltShort=Bk=>xanIds.reduce((n,id)=>n+(((Bk[id]||{}).short||{}).salt||0),0);
const saltAte=Bk=>xanIds.reduce((n,id)=>n+(((Bk[id]||{}).eaten||{}).salt||0),0);
{const before=saltShort(A.B),after=saltShort(J.B),ate=saltAte(J.B);
 const rows=xanIds.map(id=>({id,s:(((J.B[id]||{}).short||{}).salt||0)})).filter(r=>r.s>0).sort((a,b)=>b.s-a.s);
 const share=ate>0?after/ate:1,top=rows[0];
 const good=before===0&&after>0&&share<0.05&&!!top&&top.id===SB;
 T.ok('S4: the join costs Xanadu a little salt rather than saving it -- caravan rounds arrive in batches where the gateway roads ran continuously',good,
  'the Sultanate short '+t(before)+' alone and '+t(after)+' joined, against '+t(ate)+' eaten ('
  +(share*100).toFixed(1)+' % of its appetite) over '+rows.length+' settlements; the worst is '
  +(top?top.id+' at '+t(top.s):'none')+', the gateway itself');
 T.neg('a shortfall of a tenth of the Sultanate\'s appetite would not be a rounding of the caravans\' timing',
  x=>x<0.05,0.2,share);}
// and the salt does still arrive: the gateway imports far more than it falls short of
{const sb=J.B[SB]||{},imp=((sb.imported||{}).salt||0),sh=((sb.short||{}).salt||0);
 T.ok('S4: Strongbow still takes the Catch\'s salt -- it imports several times what it falls short of',imp>sh*2,
  'the gateway imported '+t(imp)+' of salt in '+DAYS+' days and fell '+t(sh)+' short');
 T.neg('a gateway that imports less than it lacks is not being supplied',x=>x.imp>x.sh*2,{imp:sh,sh},{imp,sh});}
T.done();
