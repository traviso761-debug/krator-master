// node core/region/tests/test-ambush.js — ambushes on a carrier (R2 of openworld/catch-bowl/PLAN-RAIDS.md; the owner's
// item 5 of 2026-11-24, "implement bandits and Stalkers attacking caravans"). core/region/53-region-ambush.js is the
// host, opt-in by a valley spec's `ambushes`; CATCH_TUNE declares two parties that must not blur -- the Tin-Skulls, a
// bandit gang that tolls and takes cargo, and the Stalkers, who never toll, take no cargo at all, and take PEOPLE AND
// BEASTS. Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);
 (0,eval)(rd('core/region/50-region-valley.js'));(0,eval)(rd('core/region/53-region-ambush.js'));
 (0,eval)(rd('core/region/data/xan-tune.js'));(0,eval)(rd('core/region/data/catch-tune.js'));return H;};
const PX=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
const t=n=>(n/1000).toFixed(1)+' t';
const DAYS=200;   /* long enough that both parties get a good many tries; a full year lives in test-catch */
function run(days,edit){const H=load(),V=CATCH_TUNE.join(XAN_TUNE.valley(PX,{}),{});if(edit)edit(V);
 const S=H.simValley(V),a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap();
 return{H,V,S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},ledger:SIM.ledger(a,b,{tol:1}),
  amb:S.ambushes||null,log:S.ambushLog||null};}

/* ---- the ladder is a pure function, so it is checked as one: no run, no clock, just the rule */
{const H=load(),kit={explosives:6},TS=CATCH_TUNE.ambushes.parties.find(p=>p.id==='tinskulls');
 const ST=CATCH_TUNE.ambushes.parties.find(p=>p.id==='stalkers.floor');
 const tally=(kind,strength,guard,hidden)=>{const c={};for(let i=0;i<20;i++){
  const o=H.ambushOutcome({kind,strength,guard,hidden,roll:i/20});c[o]=(c[o]||0)+1;}return c;};
 const unguardedTS=tally('outlaw',TS.strength,0),unguardedST=tally('stalker',ST.strength,0);
 const guardedTS=tally('outlaw',TS.strength,6),guardedST=tally('stalker',ST.strength,6);
 const kitted=tally('stalker',ST.strength,H.ambushGuard({guard:6,kit:['explosives']},kit));
 const good=unguardedTS.broken===20&&unguardedST.broken===20
  &&!guardedTS.mauled&&!guardedTS.broken&&guardedTS.passed>0&&guardedTS.tolled>0
  &&guardedST.passed>0&&guardedST.mauled>0&&!guardedST.tolled
  &&kitted.passed===20;
 T.ok('R2: the ladder reads as a ladder -- an unguarded train is broken by either, a guarded one is passed or tolled by the bandits and passed or mauled by the Stalkers, and explosives pass them both',good,
  'unguarded: Tin-Skulls '+JSON.stringify(unguardedTS)+'; guarded(6): '+JSON.stringify(guardedTS)+' and Stalkers '
  +JSON.stringify(guardedST)+'; with explosives: '+JSON.stringify(kitted));
 T.neg('a ladder that breaks a guarded train every time is the one the first numbers gave',
  x=>!x.broken,tally('outlaw',11,6),guardedTS);}

/* ---- THE TWO DANGERS MUST NOT BLUR (PLAN-RAIDS.md section 4), and it is the rule that enforces it, not the numbers:
   a Stalker party has no `tolled` rung at all. */
{const H=load();
 const ladder=kind=>Array.from({length:40},(_,i)=>H.ambushOutcome({kind,strength:7,guard:3,roll:i/40}));
 const ol=new Set(ladder('outlaw')),st=new Set(ladder('stalker'));
 const good=ol.has('tolled')&&!st.has('tolled');
 T.ok('R2: a bandit party can toll a train and a Stalker party never can -- the two kinds do not share a ladder',good,
  'the bandits\' rungs: '+Array.from(ol).join('/')+'; the Stalkers\': '+Array.from(st).join('/'));
 T.neg('a Stalker that tolls has blurred into a bandit',x=>!x.has('tolled'),ol,st);}

// ---- the spec: two parties, their appetites, and the kit that answers them
{const A=CATCH_TUNE.ambushes,TS=A.parties.find(p=>p.id==='tinskulls'),ST=A.parties.find(p=>p.id==='stalkers.floor');
 const good=A.parties.length===2&&TS.kind==='outlaw'&&ST.kind==='stalker'
  &&(TS.wants||[]).length>0&&TS.wants[0]==='water'&&!!TS.cache&&TS.toll>0
  &&!ST.wants&&!ST.toll&&ST.people>0&&ST.hiddenIn==='storms'&&!ST.cache
  &&A.kit.explosives>0;
 T.ok('R2: the Tin-Skulls want cargo in an order, toll, and have a cache; the Stalkers want no cargo, never toll, take people, and have nowhere to sell',good,
  'Tin-Skulls want '+(TS.wants||[]).slice(0,3).join('/')+'..., toll '+TS.toll+', cache '+TS.cache
  +'; Stalkers take '+ST.people+' of the crew, hidden in '+ST.hiddenIn+', cache '+(ST.cache||'none'));
 T.neg('a Stalker party with a cache has somewhere to sell cargo it does not take',
  x=>!x.cache,Object.assign({},ST,{cache:'svhmyhf33w'}),ST);}

// ---- the explosives stopped being a hard-coded exception
{const V=CATCH_TUNE.join(XAN_TUNE.valley(PX,{}),{}),road=id=>V.roads.find(r=>r.id===id);
 const geo=road('caravan.geomancer'),get=road('caravan.getmastarz'),salt=road('caravan.train.salt');
 const noneLeft=V.roads.every(r=>!(r.losses||[]).some(l=>/Stalker/i.test(l.why)));
 const good=(geo.kit||[]).indexOf('explosives')>=0&&(get.kit||[]).length===0
  &&geo.guard>0&&get.guard>0&&salt.guard>0&&noneLeft;
 T.ok('R2: the Geomancers\' explosives are a `kit` on the round and no longer an `if(!g.explosives)` in the loss rule, and no Stalker loss is left in C5',good,
  'the Geomancers\' kit '+JSON.stringify(geo.kit)+', guard '+geo.guard+'; Getmastarz\' '+JSON.stringify(get.kit)
  +', guard '+get.guard+'; the salt run\'s guard '+salt.guard+'; Stalker losses left in C5: '+(noneLeft?'none':'SOME'));
 T.neg('a round with no guard at all is broken by every ambush',
  x=>x>0,0,salt.guard);}

/* ---- then it has to run, and the booking is the part that could go wrong quietly */
const t0=Date.now(),Y=run(DAYS);
console.log(DAYS+' days of Xanadu and the Catch with the ambushes on in '+((Date.now()-t0)/1000).toFixed(0)+' s');
T.ok('R2: the year\'s books balance with the ambushes on, every settlement, road and good',Y.ledger.ok,
 Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
{const A=Y.amb||{},TS=A.tinskulls||{},ST=A['stalkers.floor']||{};
 const good=TS.tries>0&&ST.tries>0&&(Y.log||[]).length>0;
 T.ok('R2: both parties work the floor over '+DAYS+' days and every attempt is logged',good,
  'the Tin-Skulls: '+TS.tries+' tries ('+TS.passed+' passed, '+TS.tolled+' tolled, '+TS.mauled+' mauled, '+TS.broken+' broken); '
  +'the Stalkers: '+ST.tries+' tries ('+ST.passed+' passed, '+ST.mauled+' mauled, '+ST.broken+' broken); '
  +(Y.log||[]).length+' log entries');
 T.neg('a party that never tries is not working the floor',x=>x>0,0,TS.tries);}
// what each takes, and what it does NOT: the Stalkers' people and beasts against the bandits' cargo
{const A=Y.amb||{},TS=A.tinskulls||{},ST=A['stalkers.floor']||{};
 const tsCargo=Object.keys(TS.took||{}).length,stCargo=Object.keys(ST.took||{}).length;
 const good=ST.people>0&&stCargo===0&&(TS.tolled>0?tsCargo>0:true)&&ST.beasts>=0;
 T.ok('R2: the Stalkers book PEOPLE and beasts and not one kilogram of cargo; the bandits book cargo',good,
  'the Stalkers took '+ST.people+' of the crews and '+ST.beasts+' beasts, and '+stCargo+' goods; '
  +'the Tin-Skulls took '+tsCargo+' goods'+(tsCargo?' ('+Object.keys(TS.took).slice(0,4).join(', ')+')':''));
 T.neg('a Stalker party that books a good has taken cargo it does not want',
  x=>Object.keys(x).length===0,{salt:1},ST.took||{});}
/* ---- THE NEGATIVE THE PLAN ASKS FOR: take `ambushes` off the spec and the host is inert -- no log, no counters, and
   the books come out as C5 left them. This is what makes 53 safe for every other tune in the repo. */
{const N=run(60,V=>{delete V.ambushes;});
 const good=!N.S.ambushes&&!N.S.ambushLog&&N.ledger.ok;
 T.ok('R2: a spec with no `ambushes` runs the host not at all -- no counters, no log, and the books balance',good,
  'ambushes '+(N.S.ambushes?'present':'absent')+', log '+(N.S.ambushLog?'present':'absent')+', ledger '+(N.ledger.ok?'ok':'FAILED'));
 T.neg('a spec that still carries ambushes is not the inert case',
  x=>!x,Y.S.ambushes,N.S.ambushes);}
T.done();
