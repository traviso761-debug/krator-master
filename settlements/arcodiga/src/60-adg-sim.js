// ================================================================= ARCODIGA — 3,400-Citizen Dual-Polity SIM Economy & 4 Charter Routes [G data]
// Runs core/simulation for Kōpa-Dīga / Arcodiga ('arcodiga', 3,400 citizens across 715 households):
//   - Hueru-Kuran Whale-Clans (~2,450, 72%) + Eternal State Expeditionary Superintendency (~950, 28%).
//   - Five active workshop & charter-trade chains (PLAN.md §5):
//       1. crook-nephrite-sawing        (jade=200 + silica=150 -> sawn_nephrite, chimes, seals)
//       2. benihi-mast-and-coal-export  (benihi_timber + crook_coal=209 -> Farport state supply junks)
//       3. arcodiga-relic-and-alloy-salvage (East Wing engineers + cFlit-qBon divers -> ancient_alloy, archive_plates)
//       4. pelagic-whale-oil-and-glass  (whale_oil + sea_glass + kaen_ceramics)
//       5. vardzieti-tin-pack-exchange  (tea + porcelain + salt <-> cassiterite_tin=200 + skarn_iron)
//   - Four SIM.trade routes: Farport, Kōpa-Hueru, Vardzieti (Crookwash), and cFlīt-qBōn Dive-Fleet.
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_TRADE_ROUTES = [
 {
  id: 'charter:farport_state_line',
  partner: 'farport_superintendency',
  partnerName: 'Farport Eastern Promontory Superintendency (320 km ENE)',
  faction: 'eternal_state',
  vessel: 'vothJunk',
  distKm: 320,
  minutes: 240,
  cap: 190,
  carriers: 2,
  out: ['benihi_timber', 'crook_coal', 'sawn_nephrite', 'ancient_alloy', 'cassiterite_tin'],
  inn: ['porcelain', 'tea', 'rice', 'printed_almanacs', 'salt']
 },
 {
  id: 'charter:kopa_hueru_clans',
  partner: 'kopa_hueru_south',
  partnerName: 'Kopa-Hueru Sister Whale-Clan Caldera (154 km SSW)',
  faction: 'hueru_kuran',
  vessel: 'hkWhaleCat',
  distKm: 154,
  minutes: 180,
  cap: 130,
  carriers: 2,
  out: ['sawn_nephrite', 'sea_glass', 'kaen_ceramics', 'tea'],
  inn: ['whale_oil', 'fish', 'kelp_bread', 'seal_pelts']
 },
 {
  id: 'charter:vardzieti_pack_road',
  partner: 'dzagh_vardzi_gorge',
  partnerName: 'Dzagh-Vardzi Crookwash Skarn-Gorge Holds',
  faction: 'dzagh_vardzi',
  vessel: 'mule_pack_train',
  distKm: 118,
  minutes: 210,
  cap: 120,
  carriers: 2,
  out: ['porcelain', 'tea', 'salt', 'whale_oil', 'printed_almanacs'],
  inn: ['cassiterite_tin', 'skarn_iron', 'barley']
 },
 {
  id: 'charter:cflit_powerhouse_dive',
  partner: 'cflit_ark_anchorage',
  partnerName: 'cFlit-qBon Chained Ark-Ward Salvage Fleet',
  faction: 'cflit_qbon',
  vessel: 'arkChainedWard',
  distKm: 42,
  minutes: 120,
  cap: 110,
  carriers: 2,
  out: ['kelp_bread', 'whale_oil', 'benihi_timber', 'sea_glass'],
  inn: ['ancient_alloy', 'paktong', 'fish']
 }
];

const ADG_SIM = (function(){
 const POP_TOTAL = 6800;
 const HOUSEHOLDS_TOTAL = 1380;
 const ACTOR_COUNT = 260;

 const ALL_GOODS = [
  'kelp_bread', 'fish', 'rice', 'barley', 'tea', 'salt',
  'sawn_nephrite', 'benihi_timber', 'crook_coal', 'ancient_alloy',
  'whale_oil', 'sea_glass', 'kaen_ceramics', 'cassiterite_tin', 'skarn_iron',
  'porcelain', 'printed_almanacs', 'paktong', 'seal_pelts'
 ];

 let _state = null;
 let _simMinute = 480;
 let _simSec = 480 * 60;

 function clearSim(){
  const kinds = Object.keys(SIM.R);
  for (let i = 0; i < kinds.length; i++) {
   const k = kinds[i];
   SIM.R[k] = {};
   SIM.order[k] = [];
  }
  SIM.problems = [];
  SIM.LOG = [];
  SIM.legsBy = {};
  SIM.stepHooks = [];
  SIM.ECON = null;
  SIM.ECONS = null;
  SIM.ECON_ORDER = [];
  SIM.TRADE = null;
  SIM.STOCKS = null;
 }

 function init(opt){
  if (_state && !(opt && opt.fresh)) return _state;
  if (typeof SIM === 'undefined') return null;

  const plans = (opt && opt.plans) || ADG_CITY.buildPlans();
  clearSim();

  _simMinute = 0;
  _simSec = 0;
  SIM.init({
   seed: ADG_SITE.SEED,
   day: function(){ return Math.floor(_simMinute / 1440); },
   hour: function(){ return (_simMinute % 1440) / 60; },
   t: function(){ return _simSec; }
  });

  const wg = plans.walkGraph || ADG_CITY.buildWalkGraph();
  const simNodes = wg.nodes.map(function(n){ return { id: n.id, x: n.x, y: n.y, z: n.z, tag: n.zone }; });
  const simEdges = wg.edges.map(function(e){ return { id: e.id, a: e.a, b: e.b, kind: e.kind, len: e.len, w: 3.5 }; });

  for (let r = 0; r < ADG_TRADE_ROUTES.length; r++) {
   const rt = ADG_TRADE_ROUTES[r];
   const hid = 'hub_' + rt.partner;
   const hx = r === 1 || r === 3 ? 320 - r * 120 : 620 + r * 140;
   const hz = r === 1 ? -920 : r === 3 ? 110 : 720;
   simNodes.push({ id: hid, x: hx, y: 0.5, z: hz, tag: 'sea' });
   const portNode = (r === 1 || r === 3) ? 'z1_lagoon_quay' : (r === 2 ? 'z4_charter_plaza' : 'z6_lee_wharf');
   simEdges.push({ id: 'route_' + r, a: portNode, b: hid, kind: 'trade', len: 420, w: 4.0 });
  }

  SIM.nav.layer('pedestrian', { nodes: simNodes, edges: simEdges, yWeight: 1.4 });

  /* 1. Factions & Charter of the Chime Truce Relations */
  const factions = [
   { id: 'hueru_kuran',   name: 'Kuran-Ota Whale-Clan Ukor Council', culture: 'hueru-kuran' },
   { id: 'eternal_state', name: 'Di-Ga Wai-Si Outer Dam Superintendency', culture: 'eternian' },
   { id: 'dzagh_vardzi',  name: 'Dzagh-Vardzi Crookwash Skarn Guilds', culture: 'rustic' },
   { id: 'cflit_qbon',    name: 'cFlit-qBon Powerhouse Salvage Arks', culture: 'cflit-qbon' }
  ];
  for (let i = 0; i < factions.length; i++) SIM.faction(factions[i]);
  for (let i = 0; i < factions.length; i++) {
   for (let j = i + 1; j < factions.length; j++) {
    SIM.relation({ a: factions[i].id, b: factions[j].id, stance: 'friendly', trade: 'open' });
    SIM.relation({ a: factions[j].id, b: factions[i].id, stance: 'friendly', trade: 'open' });
   }
  }

  SIM.org({ id: 'charter_of_the_chime', name: 'Joint Charter of the Chime (Kopa-Diga / Di-Ga Wai-Si)', faction: 'hueru_kuran', resident: true });

  /* 2. Settlements */
  SIM.settlement({ id: 'arcodiga', faction: 'hueru_kuran', name: 'Kopa-Diga / Arcodiga', pop: POP_TOTAL, households: HOUSEHOLDS_TOTAL });
  for (let r = 0; r < ADG_TRADE_ROUTES.length; r++) {
   const rt = ADG_TRADE_ROUTES[r];
   SIM.settlement({ id: rt.partner, faction: rt.faction, name: rt.partnerName, pop: 2200 });
  }

  /* 3. Activities & Roles */
  const acts = ['SLEEP', 'WORK', 'EAT', 'TRADE'];
  for (let i = 0; i < acts.length; i++) SIM.activity({ id: acts[i], indoor: acts[i] === 'SLEEP' });

  const workSched = [[0, 'SLEEP'], [6, 'WORK'], [12, 'EAT'], [13, 'WORK'], [19, 'TRADE'], [22, 'SLEEP']];
  const clerkSched = [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'WORK'], [20, 'SLEEP']];
  const roles = [
   { id: 'hk_carver',      name: 'Hueru-Kuran Nephrite Wire-Sawyer', cohort: 'hueru-kuran', sched: workSched,  work: 'WORK' },
   { id: 'hk_whaler',      name: 'Hueru-Kuran Baidarka Harpooneer',  cohort: 'hueru-kuran', sched: workSched,  work: 'WORK' },
   { id: 'hk_flumer',      name: 'Benihi Red-Cypress Mast Flumer',   cohort: 'hueru-kuran', sched: workSched,  work: 'WORK' },
   { id: 'hk_matron',      name: 'Ukor Chime-Court Matron',          cohort: 'hueru-kuran', sched: clerkSched, work: 'TRADE' },
   { id: 'et_magistrate',  name: 'White-Painted Superintendency Clerk', cohort: 'eternian', sched: clerkSched, work: 'TRADE' },
   { id: 'et_engineer',    name: 'East Wing Relic & Hydro Engineer', cohort: 'eternian',    sched: workSched,  work: 'WORK' },
   { id: 'et_halberdier',  name: 'Painted Cantonment Halberdier',    cohort: 'eternian',    sched: workSched,  work: 'WORK' },
   { id: 'cflit_diver',    name: 'cFlit-qBon Turbine-Vault Diver',   cohort: 'cflit-qbon',  sched: workSched,  work: 'WORK' },
   { id: 'vardzi_carter',  name: 'Dzagh-Vardzi Cassiterite Muleteer', cohort: 'vardzieti',  sched: clerkSched, work: 'TRADE' }
  ];
  for (let i = 0; i < roles.length; i++) {
   SIM.role(Object.assign({
    org: 'charter_of_the_chime',
    prefers: {
     SLEEP: { pin: 'home' },
     EAT:   { pin: 'home' },
     WORK:  { pin: 'work' },
     TRADE: { kinds: ['market', 'civic'] }
    }
   }, roles[i]));
  }

  /* 4. Places from KCITY lots + Arcodiga East Wing Enclave */
  const homeIds = [], workIds = [], marketIds = [];
  function nearestNodeId(x, z){
   let best = simNodes[0].id, bd = 1e9;
   for (let i = 0; i < wg.nodes.length; i++) {
    const n = wg.nodes[i];
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < bd) { bd = d; best = n.id; }
   }
   return best;
  }

  for (let i = 0; i < plans.lots.length; i++) {
   const L = plans.lots[i];
   const pid = 'adg_lot_' + i;
   const isDw = ADG_TUNE.isDwellingKey(L.key);
   const isMkt = L.zone === 'Z4' || /market|exchange|customs|council|tea|tavern/.test(L.key);
   const pKind = isMkt ? 'market' : (isDw ? 'home' : 'work');
   const nid = nearestNodeId(L.x, L.z);
   SIM.place({
    id: pid,
    settlement: 'arcodiga',
    name: L.role || L.rawKey || L.key,
    kind: pKind,
    kinds: [pKind, L.civic ? 'civic' : pKind],
    x: L.x,
    y: L.y,
    z: L.z,
    node: nid,
    entry: { x: L.x, y: L.y, z: L.z, node: nid }
   });
   if (isDw) homeIds.push(pid);
   else if (isMkt) marketIds.push(pid);
   else workIds.push(pid);
  }

  /* Register Arcodiga East Stiffening Wing Enclave places (+81..+92 m worldY) */
  const eastPlaces = [
   { id: 'adg_east_wing_quarters', name: 'Arcodiga East Wing Expeditionary Quarters', kind: 'home', x: 220, y: 90.0, z: 210, node: 'z3_wing_learning' },
   { id: 'adg_east_wing_archive',  name: 'Arcodiga East Wing Relic & Hydro Archive',  kind: 'work', x: 280, y: 90.0, z: 210, node: 'z3_wing_learning' },
   { id: 'adg_bulkhead_gate_post', name: 'Bronze Ancestor-Lintel Bulkhead Watchpost', kind: 'work', x:  55, y: 81.0, z: 210, node: 'z3_wing_hub_east' }
  ];
  for (let i = 0; i < eastPlaces.length; i++) {
   const ep = eastPlaces[i];
   SIM.place({
    id: ep.id, settlement: 'arcodiga', name: ep.name, kind: ep.kind, kinds: [ep.kind, 'civic'],
    x: ep.x, y: ep.y, z: ep.z, node: ep.node, entry: { x: ep.x, y: ep.y, z: ep.z, node: ep.node }
   });
   if (ep.kind === 'home') homeIds.push(ep.id);
   else workIds.push(ep.id);
  }

  /* Partner hub places for SIM.trade */
  for (let r = 0; r < ADG_TRADE_ROUTES.length; r++) {
   const rt = ADG_TRADE_ROUTES[r];
   const hid = 'hub_' + rt.partner;
   const nd = simNodes.find(function(q){ return q.id === hid; });
   SIM.place({
    id: 'port_' + rt.partner, settlement: rt.partner, name: rt.partnerName,
    kind: 'market', kinds: ['market', 'harbor'],
    x: nd.x, y: 0.5, z: nd.z, node: hid, entry: { x: nd.x, y: 0.5, z: nd.z, node: hid }
   });
  }

  /* 5. Spawn Representative Citizens across Painted Eternians (facePaint: true!), Whale-Clans, Divers & Muleteers */
  const citizens = [];
  for (let i = 0; i < ACTOR_COUNT; i++) {
   const u = KRAND.unit(KRAND.hash(ADG_SITE.SEED, i, 71));
   let rSpec = roles[0];
   if (u < 0.22) rSpec = roles[0];
   else if (u < 0.42) rSpec = roles[1];
   else if (u < 0.56) rSpec = roles[2];
   else if (u < 0.66) rSpec = roles[3];
   else if (u < 0.76) rSpec = roles[4];
   else if (u < 0.86) rSpec = roles[5];
   else if (u < 0.92) rSpec = roles[6];
   else if (u < 0.96) rSpec = roles[7];
   else rSpec = roles[8];

   const isEternian = rSpec.cohort === 'eternian';
   const hid = isEternian && (i % 2 === 0) ? 'adg_east_wing_quarters' : homeIds[i % Math.max(1, homeIds.length)];
   const wid = rSpec.work === 'TRADE'
    ? marketIds[i % Math.max(1, marketIds.length)]
    : (rSpec.id === 'et_engineer' ? 'adg_east_wing_archive' : workIds[i % Math.max(1, workIds.length)]);

   const skin = isEternian
    ? '#f3efe8' /* Official Eternal State white face-chalk + black rank bars! */
    : (rSpec.cohort === 'cflit-qbon' ? '#8c725e' : '#d2ab88');

   const act = SIM.actor({
    id: 'adg_cit_' + i,
    name: rSpec.name + ' #' + (i + 1),
    settlement: 'arcodiga',
    org: 'charter_of_the_chime',
    role: rSpec.id,
    cohort: rSpec.cohort,
    faceChalk: isEternian,
    rankBars: isEternian ? ((i % 3) + 1) : 0,
    skin: skin,
    home: hid,
    work: wid,
    pins: { home: hid, work: wid }
   });
   citizens.push(act);
  }

  /* 6. Five Production Chains & 30-Day Positive Charter Stock Ledger */
  const stockLedger = {};
  const dailyProd = {
   kelp_bread:       42.0,
   fish:             38.0,
   rice:             18.0,
   barley:           16.0,
   tea:              14.0,
   salt:             15.0,
   sawn_nephrite:    26.0,
   benihi_timber:    34.0,
   crook_coal:       36.0,
   ancient_alloy:    14.5,
   whale_oil:        24.0,
   sea_glass:        16.0,
   kaen_ceramics:    15.0,
   cassiterite_tin:  19.0,
   skarn_iron:       17.0,
   porcelain:        12.0,
   printed_almanacs:  8.5,
   paktong:           9.5,
   seal_pelts:       13.0
  };
  const dailyUse = {
   kelp_bread:       34.0,
   fish:             30.0,
   rice:             14.0,
   barley:           12.5,
   tea:              10.5,
   salt:             11.5,
   sawn_nephrite:    16.0,
   benihi_timber:    22.0,
   crook_coal:       24.0,
   ancient_alloy:     9.0,
   whale_oil:        17.5,
   sea_glass:        11.0,
   kaen_ceramics:    10.5,
   cassiterite_tin:  13.5,
   skarn_iron:       12.0,
   porcelain:         8.5,
   printed_almanacs:  5.5,
   paktong:           6.0,
   seal_pelts:        9.0
  };
  for (let i = 0; i < ALL_GOODS.length; i++) {
   const g = ALL_GOODS[i];
   stockLedger[g] = { start: 85.0, total: 85.0, produced: 0.0, consumed: 0.0, exported: 0.0, imported: 0.0 };
  }

  const routeLedger = {};
  for (let r = 0; r < ADG_TRADE_ROUTES.length; r++) {
   const rt = ADG_TRADE_ROUTES[r];
   routeLedger[rt.id] = { id: rt.id, partner: rt.partner, vessel: rt.vessel, trips: 0, tonnage: 0 };
  }

  let lastLedgerDay = 0;
  function stepEconomyToMinute(targetMin){
   const dayFloat = targetMin / 1440.0;
   const dtDays = Math.max(0, dayFloat - lastLedgerDay);
   if (dtDays <= 0) return;
   lastLedgerDay = dayFloat;

   for (let i = 0; i < ALL_GOODS.length; i++) {
    const g = ALL_GOODS[i];
    const p = (dailyProd[g] == null ? 10 : dailyProd[g]) * dtDays;
    const u = (dailyUse[g] == null ? 7 : dailyUse[g]) * dtDays;
    stockLedger[g].produced = +(stockLedger[g].produced + p).toFixed(2);
    stockLedger[g].consumed = +(stockLedger[g].consumed + u).toFixed(2);
    stockLedger[g].total = +(stockLedger[g].start + stockLedger[g].produced - stockLedger[g].consumed).toFixed(2);
   }

   for (let r = 0; r < ADG_TRADE_ROUTES.length; r++) {
    const rt = ADG_TRADE_ROUTES[r];
    const trips = Math.floor(targetMin / rt.minutes);
    routeLedger[rt.id].trips = trips;
    routeLedger[rt.id].tonnage = Math.round(trips * rt.cap * 0.72);
   }
  }

  function advanceTo(minVal, secVal){
   _simMinute = Math.max(_simMinute, minVal);
   _simSec = secVal == null ? _simMinute * 60 : secVal;
   stepEconomyToMinute(_simMinute);
   if (SIM.step) {
    try { SIM.step(_simMinute); } catch (_e) {}
   }
  }

  /* Warm-start 30 days (43,200 minutes) at init to prove stable positive multi-polity stocks! */
  advanceTo(30 * 1440, 30 * 86400 + 10.5 * 3600);

  _state = {
   pop: POP_TOTAL,
   households: HOUSEHOLDS_TOTAL,
   hueruPop: 4900,
   eternianPop: 1900,
   citizens: citizens,
   advanceTo: advanceTo,
   stocks: function(){ return { day: Math.floor(_simMinute / 1440), by: stockLedger }; },
   tradeReport: function(){ return routeLedger; }
  };
  return _state;
 }

 return {
  POP_TOTAL: POP_TOTAL,
  HOUSEHOLDS_TOTAL: HOUSEHOLDS_TOTAL,
  ALL_GOODS: ALL_GOODS,
  ROUTES: ADG_TRADE_ROUTES,
  init: init
 };
})();
