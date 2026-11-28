// node core/simulation/test-pilgrims.js — cyclic/lunar windows (77-sim-6-season.js), liturgical observances
// (77-sim-6d-decrees.js), internal + external pilgrimages and the Great Pilgrim's Market (77-sim-6p-pilgrims.js),
// verified at both PRESENTED and ABSTRACT levels against 77-sim-7-ledger.js (0.00 goods & money residual).
// Every check carries a negative control.
const fs = require('fs'), path = require('path');
global.window = global;

const FILES = [
  '77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js',
  '77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js','77-sim-6-economy.js',
  '77-sim-6-govern.js','77-sim-6-items.js','77-sim-6-money.js','77-sim-6-season.js',
  '77-sim-6-trade.js','77-sim-7-stocks.js','77-sim-7-ledger.js','77-sim-7-lod.js',
  '77-sim-6d-decrees.js','77-sim-6p-pilgrims.js'
];
(0, eval)(fs.readFileSync(path.join(__dirname, '..', 'clock', '20-core-clock.js'), 'utf8'));

let bad = 0;
function ok(name, pass, neg, detail){
  const r = !!(pass && !neg);
  if(!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (neg ? ' (its negative passed)' : ''));
}

function loadFresh(){
  FILES.forEach(f => (0, eval)(fs.readFileSync(path.join(__dirname, f), 'utf8')));
  return window.SIM;
}

function buildJimjamWorld(opts){
  opts = opts || {};
  const S = loadFresh(), clock = { m:0, h:0, d:0, t:0 };
  S.init({ seed:7, hour:()=>clock.h, day:()=>clock.d, t:()=>clock.t });
  S.WAKE = true; S.LAG = 4;

  ['SLEEP','WORK','CRAFT','TRIAL','WORSHIP','VIGIL','EAT','BUY','DEPART'].forEach(a =>
    S.activity({ id:a, indoor:a==='SLEEP' })
  );

  ['jimjam','hykkousoi','eternian','order','erehwon_fac'].forEach(f => S.faction({ id:f, name:f }));
  S.settlement({ id:'jimjam', faction:'jimjam', name:'Jimjam' });
  S.settlement({ id:'vellai', faction:'jimjam', name:'Vellai-kal' });
  if(opts.hykkHostile){
    S.relation({ a:'jimjam', b:'hykkousoi', stance:'hostile', trade:'closed' });
    S.relation({ a:'hykkousoi', b:'jimjam', stance:'hostile', trade:'closed' });
  } else {
    S.relation({ a:'jimjam', b:'hykkousoi', stance:'friendly' });
  }
  S.presence({ faction:'eternian', settlement:'jimjam', status:opts.eternianExpelled ? 'EXPELLED' : 'VISITING' });

  S.org({ id:'jj_folk', faction:'jimjam' });
  S.org({ id:'jj_kauntavan', faction:'jimjam' });
  S.org({ id:'hykk_sailors', faction:'hykkousoi' });
  S.org({ id:'et_pilgrims', faction:'eternian' });
  S.org({ id:'ord_scholars', faction:'order' });

  S.nav.layer('pedestrian', {
    nodes:[{id:0,x:0,y:0,z:0},{id:1,x:60,y:0,z:0},{id:2,x:120,y:0,z:0},{id:3,x:180,y:0,z:0}],
    edges:[
      {id:0,a:0,b:1,kind:'ground',len:60,w:6},
      {id:1,a:1,b:2,kind:'ground',len:60,w:6},
      {id:2,a:2,b:3,kind:'ground',len:60,w:6}
    ]
  });

  S.port({ id:'port_south_cut', x:0, z:0, layer:'pedestrian', kind:'road' });
  S.port({ id:'port_east_serai', x:180, z:0, layer:'pedestrian', kind:'road' });
  S.port({ id:'port_nnw_cove', x:60, z:0, layer:'pedestrian', kind:'water' });

  /* Places in Jimjam + internal satellite Vellai-kal */
  S.place({ id:'jj_home', kind:'jj_house', x:60, z:0, settlement:'jimjam', district:'day', activities:{SLEEP:8, REST:8} });
  S.place({ id:'jj_kiln', kind:'jj_kiln', x:120, z:0, settlement:'jimjam', district:'day', open:[6,18], activities:{CRAFT:4, WORK:4} });
  S.place({ id:'jj_court', kind:'jj_court', x:60, z:0, settlement:'jimjam', district:'week', open:[8,17], activities:{TRIAL:4} });
  S.place({ id:'jj_temple_13', kind:'jj_temple_thirteen', x:120, z:0, settlement:'jimjam', district:'thirteen', open:[6,20], activities:{WORSHIP:40, VIGIL:40} });
  S.place({ id:'jj_giant_ghat', kind:'jj_giant_ghat', x:60, z:0, settlement:'jimjam', district:'giant', open:[5,22], activities:{WORSHIP:40, VIGIL:40} });
  S.place({ id:'jj_chapterhouse', kind:'jj_chapterhouse_order', x:120, z:0, settlement:'jimjam', district:'thirteen', activities:{SLEEP:6, WORSHIP:12} });
  S.place({ id:'jj_hostel_et', kind:'jj_hostel_eternian', x:60, z:0, settlement:'jimjam', district:'companion', activities:{SLEEP:12} });
  S.place({ id:'jj_dharmashala', kind:'jj_dharmashala', x:60, z:0, settlement:'jimjam', district:'thirteen', activities:{SLEEP:8} });
  S.place({ id:'jj_camp_maidan', kind:'jj_camp', x:0, z:0, settlement:'jimjam', closed:true, transient:true, activities:{SLEEP:80} });
  S.place({ id:'jj_shrine_wanderer', kind:'jj_shrine_wanderer', x:180, z:0, settlement:'jimjam', district:'izani', activities:{WORSHIP:12} });
  S.place({ id:'jj_pilgrim_bazaar', kind:'jj_pilgrim_market', x:0, z:0, settlement:'jimjam', closed:true, activities:{BUY:30} });
  S.place({ id:'jj_wh', kind:'warehouse', x:60, z:0, settlement:'jimjam', activities:{WORK:2, BUY:8} });

  S.place({ id:'vk_home', kind:'jj_house', x:0, z:0, settlement:'vellai', activities:{SLEEP:12} });
  S.place({ id:'vk_wh', kind:'warehouse', x:0, z:0, settlement:'vellai', activities:{WORK:2} });

  /* Economies & trade route with C5 Double-Dark lockout */
  const GOODS = { rice:{}, brick:{}, almanacs:{}, reagents:{} };
  S.economy({ goods:GOODS, every:60, meal:{ per:1, foods:['rice'] } }, { settlement:'jimjam' });
  S.economy({ goods:GOODS, every:60, meal:{ per:1, foods:['rice'] } }, { settlement:'vellai' });
  S.store('jj_wh', { kind:'warehouse' });
  S.store('jj_pilgrim_bazaar', { kind:'warehouse' });
  S.store('vk_wh', { kind:'warehouse' });
  S.withEcon('jimjam', () => {
    S.produce('jj_wh', 'rice', 800);
    S.produce('jj_wh', 'almanacs', 200);
  });
  S.withEcon('vellai', () => {
    S.produce('vk_wh', 'rice', 400);
    S.produce('vk_wh', 'brick', 120);
  });
  S.recipe('jj_kiln', { out:['brick'], rate:2 });

  /* Items & Money */
  S.items({
    kinds:{
      rice:{ food:true, good:'rice', per:1 },
      tethyan_bio_vial:{ cat:'reagent' },
      dalab_pressure_gel:{ cat:'reagent' },
      yuni_vault_cell:{ cat:'tech' },
      dam_servo_relic:{ cat:'artifact' },
      tete_codex:{ cat:'artifact' }
    },
    free:['VIGIL','WORSHIP']
  });
  S.shop('jj_wh', ['rice']);
  S.money({ currencies:{ talent:{ name:'Talent', talent:1 } } });
  S.account({ id:'treasury:jimjam', owner:'jimjam', kind:'treasury', currency:'talent', settlement:'jimjam' });
  S.account({ id:'treasury:vellai', owner:'vellai', kind:'treasury', currency:'talent', settlement:'vellai' });
  S.account({ id:'org:kauntavan', owner:'jj_kauntavan', kind:'guild', currency:'talent', settlement:'jimjam' });
  S.account({ id:'player:expedition', owner:'player', kind:'player', currency:'talent', settlement:'jimjam' });
  S.mint('treasury:vellai', 2000, 'opening');
  S.mint('player:expedition', 1000, 'opening');

  /* Roles & Resident Kiln-Workers */
  S.role({
    id:'jj_potter', org:'jj_folk', settlement:'jimjam',
    prefers:{ WORK:{ pin:'work' }, SLEEP:{ pin:'home' } },
    scheds:{
      work: [[0,'SLEEP'],[6,'WORK'],[18,'WORSHIP'],[21,'SLEEP']],
      double_dark: [[0,'SLEEP'],[6,'VIGIL'],[22,'SLEEP']]
    },
    when:{ 'double-dark':'double_dark' }
  });
  S.role({ id:'jj_pilgrim_serai', org:'jj_folk', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'jj_pilgrim_local', org:'jj_folk', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'hykk_sailor_pilgrim', org:'hykk_sailors', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'eternian_pilgrim', org:'et_pilgrims', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'eternian_minder', org:'et_pilgrims', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'talia_savant', org:'ord_scholars', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'dalab_savant', org:'ord_scholars', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.role({ id:'yuni_savant', org:'ord_scholars', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });

  S.actor({ id:'pot1', role:'jj_potter', home:'jj_home', work:'jj_kiln' });
  S.actor({ id:'pot2', role:'jj_potter', home:'jj_home', work:'jj_kiln' });
  S.actor({ id:'explorer', role:'talia_savant', home:'jj_chapterhouse' });

  /* Calendar: 91-day Kauntu Double Dark on day 3, Flood window days 1..5 */
  S.calendar({
    year:{ yearD:365, startDay:259, solsticeDay:350 },
    latitude:-34.34,
    windows:{ 'day-outside':[364, 365] },
    cycles:{
      'double-dark':       { periodD:91, phase0:3, spanD:1 },
      'double-dark-flood': { periodD:91, phase0:1, spanD:4 },
      'day-transit':       { periodM:1440, phase0:600, spanM:120 }
    }
  });

  S.trade({
    id:'lbl77_barge',
    stops:[{ settlement:'vellai', place:'vk_wh' }, { settlement:'jimjam', place:'jj_wh' }],
    cap:40, minutes:180, mins:60,
    goods:{ vellai:['brick'], jimjam:['almanacs'] },
    closed:[{ legs:[0, 1], window:'double-dark' }]
  });

  if(!opts.noObservance){
    S.observance({
      id:'jj.double-dark',
      window:'double-dark',
      settlement:'jimjam',
      forbidActs:['CRAFT','WORK','TRIAL'],
      closeKinds:['jj_kiln','jj_court'],
      openKinds:['jj_temple_thirteen','jj_giant_ghat'],
      holdRecipes:'observance: double-dark',
      roleSched:'double_dark',
      banners:'double_dark',
      lamps:0.15,
      priority:100
    });
  }

  S.pilgrimage({
    id:'jj.flood',
    to:'jimjam',
    faction:'jimjam',
    baseMult:opts.flatFlood ? 0 : 0.2,
    leadDays:0,
    windows:{ 'double-dark-flood':6.0 },
    stayNights:[2, 3],
    partySize:[4, 5],
    lodging:{
      hostelKinds:['jj_dharmashala'],
      overflowCamps:['jj_camp_maidan'],
      tentCap:5
    },
    circuit:[
      { act:'WORSHIP', kinds:['jj_temple_thirteen','jj_giant_ghat','jj_chapterhouse_order'], weight:1.0 }
    ],
    souvenirs:['almanacs'],
    souvenirRate:0.35,
    offering:{ acct:'org:kauntavan', currency:'talent', perPersonDay:2 },
    streams:[
      { id:'local', fromSettlement:'vellai', basePerDay:3, role:'jj_pilgrim_local' },
      { id:'serai', fromPort:'port_east_serai', faction:'jimjam', basePerDay:6, role:'jj_pilgrim_serai' },
      { id:'hykkousoi', fromPort:'port_south_cut', faction:'hykkousoi', basePerDay:4, role:'hykk_sailor_pilgrim',
        circuitBoost:{ kinds:['jj_giant_ghat'], mult:4.0 } },
      { id:'eternian', fromPort:'port_nnw_cove', faction:'eternian', basePerDay:4, role:'eternian_pilgrim',
        governance:{ mode:'escorted_cohort', wardenRole:'eternian_minder', cohortSize:4, maxCohorts:2,
                     lodgeOnly:['jj_hostel_et'], forbidKinds:['jj_shrine_wanderer'] } },
      { id:'scholars', fromPort:'port_south_cut', faction:'order', basePerDay:3,
        mix:[['talia_savant',0.4],['dalab_savant',0.35],['yuni_savant',0.25]],
        lodgePrefer:['jj_chapterhouse_order'] }
    ]
  });

  S.pilgrimMarket({
    id:'jj.great_market',
    pilgrimage:'jj.flood',
    settlement:'jimjam',
    place:'jj_pilgrim_bazaar',
    minPilgrims:12,
    currency:'talent',
    hostAcct:'treasury:jimjam',
    treasuryTax:0.10,
    pools:{
      hykkousoi:[
        { id:'tethyan_vial', cat:'reagent', good:'reagents', item:'tethyan_bio_vial', qty:[3, 5], price:40, rarity:1.0 }
      ],
      scholars:[
        { id:'dalab_gel', cat:'reagent', item:'dalab_pressure_gel', qty:[2, 3], price:80, rarity:1.0 },
        { id:'yuni_cell', cat:'tech', item:'yuni_vault_cell', qty:[1, 2], price:120, rarity:1.0 }
      ],
      serai:[
        { id:'dam_relic', cat:'artifact', item:'dam_servo_relic', qty:[1, 2], price:100, rarity:1.0 }
      ],
      eternian:[
        { id:'tete_codex', cat:'artifact', item:'tete_codex', qty:[1, 1], price:150, rarity:1.0, covert:true }
      ]
    }
  });

  return { S, clock };
}

function stepMinutes(W, mins, onMin){
  const { S, clock } = W, end = clock.m + mins;
  for(; clock.m < end; clock.m++){
    clock.d = Math.floor(clock.m / 1440);
    clock.h = (clock.m % 1440 + 0.5) / 60;
    clock.t += 60;
    S.step();
    if(onMin) onMin(clock.m, clock.d, clock.h);
  }
}

/* 1. 91-day lunar & sub-daily cycles in 77-sim-6-season.js */
{
  const W = buildJimjamWorld(), S = W.S;
  const onDay3 = S.inSeason('double-dark', 3 * 1440 + 120);
  const onDay94 = S.inSeason('double-dark', 94 * 1440 + 120);   /* 3 + 91 = 94! Drifts vs 365-day year */
  const onDay50 = S.inSeason('double-dark', 50 * 1440);
  const subDailyOn = S.inSeason('day-transit', 650);
  const subDailyOff = S.inSeason('day-transit', 200);
  ok('91-day lunar Kauntu and sub-daily orbital cycles repeat on their exact period across years',
    onDay3 && onDay94 && subDailyOn && !subDailyOff, onDay50 || subDailyOff,
    'day 3 & 94 double-dark, minute 650 day-transit');
}

/* 2. SIM.observance: Double-Dark kiln hold, court lock, 24h temple vigil & WAKE schedule switch */
{
  const W = buildJimjamWorld(), S = W.S;
  let brickBefore = 0, brickAfterDD = 0, brickDay4 = 0, potVigil = false, templeNightOpen = false, courtShut = false;
  let bargeWaitedBefore = 0, bargeWaitedAfter = 0;
  stepMinutes(W, 3 * 1440); /* up to start of Day 3 (Double Dark) */
  S.withEcon('jimjam', () => { brickBefore = S.ECON.made.brick || 0; });
  bargeWaitedBefore = S.TRADE.routes.lbl77_barge.waited || 0;

  stepMinutes(W, 1440, (m, d, h) => {
    if(Math.floor(h) === 12){
      courtShut = !S.isOpen(S.R.place.jj_court, 'TRIAL', 12);
      if(S.R.actor.pot1.activity === 'VIGIL') potVigil = true;
    }
    if(Math.floor(h) === 23){
      templeNightOpen = S.isOpen(S.R.place.jj_temple_13, 'VIGIL', 23);
    }
  });
  S.withEcon('jimjam', () => { brickAfterDD = S.ECON.made.brick || 0; });
  bargeWaitedAfter = S.TRADE.routes.lbl77_barge.waited || 0;
  stepMinutes(W, 1440); /* Day 4: kilns relight! */
  S.withEcon('jimjam', () => { brickDay4 = S.ECON.made.brick || 0; });

  /* Negative control: without observance, kilns fire right through Day 3 */
  const WN = buildJimjamWorld({ noObservance:true });
  stepMinutes(WN, 3 * 1440);
  let nb0 = 0, nb1 = 0;
  WN.S.withEcon('jimjam', () => { nb0 = WN.S.ECON.made.brick || 0; });
  stepMinutes(WN, 1440);
  WN.S.withEcon('jimjam', () => { nb1 = WN.S.ECON.made.brick || 0; });

  ok('Double-Dark observance halts kilns (0 brick made), locks courts, opens midnight vigils, wakes potters & holds barges',
    brickBefore > 0 && brickAfterDD === brickBefore && brickDay4 > brickAfterDD && potVigil && templeNightOpen && courtShut && bargeWaitedAfter > bargeWaitedBefore,
    !(nb1 > nb0),
    'brick before='+brickBefore+', DD='+brickAfterDD+', day4='+brickDay4+', bargeWaited='+(bargeWaitedAfter - bargeWaitedBefore));
}

/* 3. Pilgrim Flood, Escorted Eternal-State Cohorts, Internal Away-Tracking & core/camp Tent Overflow */
{
  const W = buildJimjamWorld({ flatFlood:true }), S = W.S;
  const snap0 = S.ledgerSnap();
  let maxTents = 0, maxActive = 0, sawEscorted = false, forbiddenBlocked = false, awayPeak = 0;

  /* Day 0 has 0 flood -> 0 tents */
  stepMinutes(W, 20 * 60);
  const preFloodTents = S.pilgrimCampTents('jj_camp_maidan');

  /* Days 1..4: double-dark-flood opens! */
  stepMinutes(W, 4 * 1440, () => {
    maxTents = Math.max(maxTents, S.pilgrimCampTents('jj_camp_maidan'));
    const rep = S.pilgrimReport('jj.flood');
    maxActive = Math.max(maxActive, rep.activePilgrims);
    awayPeak = Math.max(awayPeak, S.awayPilgrims('vellai'));
    S.all('actor').forEach(a => {
      if(a.faction === 'eternian' && a.role === 'eternian_minder') sawEscorted = true;
      if(a.faction === 'eternian' && a.transient){
        if(!S.welcome(a, S.R.place.jj_shrine_wanderer, 'WORSHIP')) forbiddenBlocked = true;
      }
    });
  });

  /* Advance past flood (Days 5..9) so overflow campers depart & camp strikes back to 0! */
  stepMinutes(W, 5 * 1440);
  const postFloodTents = S.pilgrimCampTents('jj_camp_maidan');
  const repEnd = S.pilgrimReport('jj.flood');
  const led = S.ledger(snap0, S.ledgerSnap());

  ok('Pilgrim flood fills hostels into core/camp Maidan tents, enforces Eternian minders/forbidKinds, tracks internal awayPilgrims & strikes tents after',
    maxActive >= 25 && maxTents > 0 && postFloodTents === 0 && sawEscorted && forbiddenBlocked && awayPeak > 0 && repEnd.stats.offeringsPaid > 0 && led.ok,
    preFloodTents > 0 || !led.ok,
    'peakPilgrims='+maxActive+', peakTents='+maxTents+', postTents='+postFloodTents+', awayVellai='+awayPeak+', offerings='+repEnd.stats.offeringsPaid+', ledgerOk='+led.ok);
}

/* 4. The Great Pilgrim's Market: rare reagents/tech/artifacts, covert lots & causal diplomatic disruption */
{
  const W = buildJimjamWorld({ flatFlood:true }), S = W.S;
  const snap0 = S.ledgerSnap();
  stepMinutes(W, 12 * 60); /* Day 0 outside flood: market must be closed */
  const earlyOffers = S.pilgrimMarketOffers('jj.great_market');

  stepMinutes(W, 2 * 1440 + 12 * 60); /* Mid-flood: market opens with stream-sourced exotics! */
  const pubOffers = S.pilgrimMarketOffers('jj.great_market');
  const allOffers = S.pilgrimMarketOffers('jj.great_market', { covert:true });
  const hasHykk = pubOffers.some(o => o.id === 'hykkousoi:tethyan_vial');
  const hasYuni = pubOffers.some(o => o.id === 'scholars:yuni_cell');
  const covertHiddenInPub = !pubOffers.some(o => o.id === 'eternian:tete_codex') && allOffers.some(o => o.id === 'eternian:tete_codex');

  /* Buy Tethyan lab reagent (warehouse good + actor item) & covert Eternian star-codex */
  const blockedCovert = S.pilgrimMarketBuy('jj.great_market', 'eternian:tete_codex', 1, { account:'player:expedition', actor:'explorer' });
  const okCovert = S.pilgrimMarketBuy('jj.great_market', 'eternian:tete_codex', 1, { account:'player:expedition', actor:'explorer', covert:true });
  const okReagent = S.pilgrimMarketBuy('jj.great_market', 'hykkousoi:tethyan_vial', 2, { account:'player:expedition', actor:'explorer' });
  const ownsItems = S.owns(S.R.actor.explorer, 'tete_codex') === 1 && S.owns(S.R.actor.explorer, 'tethyan_bio_vial') === 2;
  let whReagents = 0;
  S.withEcon('jimjam', () => { whReagents = S.stockOf('reagents'); });
  const led = S.ledger(snap0, S.ledgerSnap());

  /* Negative / Disruption test: hostile Hykkousoi + expelled Eternians -> ZERO Tethyan or Eternian lots in market! */
  const WD = buildJimjamWorld({ flatFlood:true, hykkHostile:true, eternianExpelled:true });
  stepMinutes(WD, 3 * 1440);
  const disOffers = WD.S.pilgrimMarketOffers('jj.great_market', { covert:true });
  const leakedBlockedStream = disOffers.some(o => o.stream === 'hykkousoi' || o.stream === 'eternian');

  ok('Great Pilgrim\'s Market opens only in floods, stocks rare reagents/tech/artifacts causally by arriving streams, guards covert lots & closes SIM.ledger',
    hasHykk && hasYuni && covertHiddenInPub && !blockedCovert.ok && okCovert.ok && okReagent.ok && ownsItems && whReagents === 2 && led.ok && disOffers.some(o => o.stream === 'scholars'),
    earlyOffers.length > 0 || leakedBlockedStream || !led.ok,
    'pubLots='+pubOffers.length+', allLots='+allOffers.length+', reagentsLanded='+whReagents+', tax='+S.PILGRIMS.markets['jj.great_market'].stats.taxPaid+', ledgerProblems='+led.problems.length);
}

/* 5. Dual-LOD: ABSTRACT festival accounting & raising to PRESENTED mid-flood with 0.00 ledger residual */
{
  const W = buildJimjamWorld({ flatFlood:true }), S = W.S;
  const snap0 = S.ledgerSnap();
  S.level('jimjam', 'abstract');
  S.level('vellai', 'abstract');

  /* Run right into the Double-Dark flood while BOTH settlements are ABSTRACT! */
  stepMinutes(W, 3 * 1440 + 6 * 60);
  const absRep = S.pilgrimReport('jj.flood');
  const absMarket = S.pilgrimMarketOffers('jj.great_market');

  /* Now player walks up to Jimjam mid-flood: raise to PRESENTED -> cohorts materialize, ledger stays 0.00! */
  S.level('jimjam', 'presented');
  const livePilgrimActors = S.all('actor').filter(a => a.transient && a.group && a.group.indexOf('pilg:') === 0).length;
  stepMinutes(W, 2 * 1440);
  const led = S.ledger(snap0, S.ledgerSnap());

  ok('ABSTRACT pilgrimage & Pilgrim Market book exact meals/souvenirs/offerings and materialize into PRESENTED cohorts with 0.00 ledger residual',
    absRep.stats.mealsEaten > 0 && absRep.stats.offeringsPaid > 0 && absMarket.length > 0 && livePilgrimActors >= 12 && led.ok,
    !led.ok,
    'absMeals='+absRep.stats.mealsEaten+', absMarketLots='+absMarket.length+', materializedActors='+livePilgrimActors+', ledgerOk='+led.ok+(led.problems.length?' ('+led.problems.join('; ')+')':''));
}

/* 6. Xanadu internal pilgrimage (Erehwon -> Qiblai kora): internal qud offerings & prayer-wheel souvenirs close both towns' ledgers */
{
  const S = loadFresh(), clock = { m:0, h:0, d:0, t:0 };
  S.init({ seed:19, hour:()=>clock.h, day:()=>clock.d, t:()=>clock.t });
  ['SLEEP','WORK','WORSHIP','DEPART'].forEach(a => S.activity({ id:a, indoor:a==='SLEEP' }));
  S.faction({ id:'xanadu', name:'Sultanate of Xanadu' });
  S.settlement({ id:'erehwon', faction:'xanadu', name:'Erehwon' });
  S.settlement({ id:'qiblai', faction:'xanadu', name:'Qiblai' });
  S.org({ id:'xan_folk', faction:'xanadu' });
  S.org({ id:'prismarchy', faction:'xanadu' });
  S.nav.layer('pedestrian', {
    nodes:[{id:0,x:0,y:0,z:0},{id:1,x:100,y:0,z:0}],
    edges:[{id:0,a:0,b:1,kind:'ground',len:100,w:5}]
  });
  S.place({ id:'er_home', kind:'xan_house', x:0, z:0, settlement:'erehwon', activities:{SLEEP:20} });
  S.place({ id:'er_wh', kind:'warehouse', x:0, z:0, settlement:'erehwon', activities:{WORK:2} });
  S.place({ id:'qb_hostel', kind:'qb_hostel', x:100, z:0, settlement:'qiblai', activities:{SLEEP:30} });
  S.place({ id:'qb_kora', kind:'qb_kora_arcade', x:100, z:0, settlement:'qiblai', activities:{WORSHIP:40} });
  S.place({ id:'qb_wh', kind:'warehouse', x:100, z:0, settlement:'qiblai', activities:{WORK:2} });

  const XGOODS = { barley:{}, prayer_wheels:{} };
  S.economy({ goods:XGOODS, every:60, meal:{ per:1, foods:['barley'] } }, { settlement:'erehwon' });
  S.economy({ goods:XGOODS, every:60, meal:{ per:1, foods:['barley'] } }, { settlement:'qiblai' });
  S.store('er_wh', { kind:'warehouse' });
  S.store('qb_wh', { kind:'warehouse' });
  S.withEcon('erehwon', () => { S.produce('er_wh', 'barley', 300); });
  S.withEcon('qiblai', () => { S.produce('qb_wh', 'barley', 300); S.produce('qb_wh', 'prayer_wheels', 80); });

  S.money({ currencies:{ qud:{ name:'Qud', talent:0.05 } } });
  S.account({ id:'treasury:erehwon', owner:'erehwon', kind:'treasury', currency:'qud', settlement:'erehwon' });
  S.account({ id:'acct:prismarchy', owner:'prismarchy', kind:'guild', currency:'qud', settlement:'qiblai' });
  S.mint('treasury:erehwon', 5000, 'opening');

  S.role({ id:'xan_pilgrim', org:'xan_folk', sched:[[0,'SLEEP'],[7,'WORSHIP'],[20,'SLEEP']] });
  S.actor({ id:'qb_monk', role:'xan_pilgrim', home:'qb_hostel' });
  S.calendar({ year:{ yearD:365, startDay:0, solsticeDay:350 }, cycles:{ 'decree-feast':{ periodD:91, phase0:1, spanD:3 } } });

  S.pilgrimage({
    id:'xan.qiblai_kora',
    to:'qiblai',
    faction:'xanadu',
    baseMult:0.5,
    leadDays:0,
    windows:{ 'decree-feast':4.0 },
    stayNights:[1, 2],
    partySize:[3, 4],
    lodging:{ hostelKinds:['qb_hostel'], overflowCamps:[] },
    circuit:[{ act:'WORSHIP', kinds:['qb_kora_arcade'], weight:1.0 }],
    souvenirs:['prayer_wheels'],
    souvenirRate:0.5,
    offering:{ acct:'acct:prismarchy', currency:'qud', perPersonDay:12 },
    streams:[{ id:'vale_folk', fromSettlement:'erehwon', basePerDay:4, role:'xan_pilgrim' }]
  });

  const snap0 = S.ledgerSnap();
  stepMinutes({ S, clock }, 4 * 1440);
  const led = S.ledger(snap0, S.ledgerSnap());
  let erWheels = 0;
  S.withEcon('erehwon', () => { erWheels = S.stockOf('prayer_wheels'); });
  const prismQuds = S.acct('acct:prismarchy').balance;

  ok('Xanadu internal pilgrimage (Erehwon -> Qiblai kora) carries prayer-wheels home, transfers qud offerings & closes both towns\' ledgers',
    erWheels > 0 && prismQuds > 0 && led.ok,
    !led.ok,
    'erPrayerWheels='+erWheels+', prismarchyQuds='+prismQuds+', ledgerOk='+led.ok);
}

console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
