// ================================================================= BATTERED PORT — 5,000-citizen SIM economy & 4 Smuggler Ring trade lines [G data]
// Partitioned core/simulation runtime for Bè-tõ-pò ('battered_port', 5,000 citizens across 1,020 households):
//   - On-island coal = 201 coking, nickel = 180 + iron marine-steel forging, wood = 255 ship-timber, wrack/kelp/fish/sweet-potato/celadon works.
//   - Four multi-polity SIM.trade maritime contraband & truce corridors:
//       1. ring:farport_night    (752 km SSW, bpBlockadeLugger)
//       2. ring:yonni_strait     (364 km SSW, yonniTradeGalley)
//       3. ring:crook_whalerun   (1010 km SW, hkWhaler)
//       4. ring:delta_silkbypass (450 km ENE, bpDeltaSkiff)
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const BP_SMUGGLER_ROUTES = [
 {
  id: 'ring:farport_night',
  partner: 'farport_covens',
  partnerName: 'Farport Night-Cove Factors',
  faction: 'eternian_underground',
  vessel: 'bpBlockadeLugger',
  distKm: 752,
  minutes: 360,
  cap: 140,
  carriers: 2,
  contraband: true,
  out: ['spider_silk', 'ria_amber', 'jade', 'paktong', 'uncensored_books'],
  inn: ['alabaster', 'celadon', 'circuit_glass', 'rice']
 },
 {
  id: 'ring:yonni_strait',
  partner: 'yonni_coves',
  partnerName: 'Yonni Spear-Queen Truce Coves',
  faction: 'yonni_queens',
  vessel: 'yonniTradeGalley',
  distKm: 364,
  minutes: 240,
  cap: 180,
  carriers: 2,
  contraband: false,
  out: ['coke_coal', 'nickel_steel', 'celadon'],
  inn: ['saltpeter', 'tin', 'ria_amber']
 },
 {
  id: 'ring:crook_whalerun',
  partner: 'crook_whalers',
  partnerName: 'Hueru-Kuran and cFlit-qBon Outer Fleet',
  faction: 'crook_mariners',
  vessel: 'hkWhaler',
  distKm: 1010,
  minutes: 420,
  cap: 160,
  carriers: 2,
  contraband: true,
  out: ['celadon', 'nickel_steel', 'sail_hemp', 'tea'],
  inn: ['jade', 'whale_oil', 'paktong']
 },
 {
  id: 'ring:delta_silkbypass',
  partner: 'double_delta_factors',
  partnerName: 'Double Delta Sponge-Channel Bypass',
  faction: 'ria_smugglers',
  vessel: 'bpDeltaSkiff',
  distKm: 450,
  minutes: 300,
  cap: 150,
  carriers: 2,
  contraband: true,
  out: ['celadon', 'alabaster', 'jade', 'nickel_steel', 'saltpeter'],
  inn: ['spider_silk', 'ria_amber', 'superconductors', 'wheat']
 }
];

const BP_SIM = (function(){
 const POP_TOTAL = 5000;
 const HOUSEHOLDS_TOTAL = 1020;
 const ACTOR_COUNT = 220;

 const ALL_GOODS = [
  'sweet_potato', 'taro', 'fish', 'wheat', 'rice', 'tea', 'alecap',
  'coke_coal', 'nickel_steel', 'sail_hemp', 'celadon', 'uncensored_books',
  'spider_silk', 'ria_amber', 'jade', 'paktong', 'alabaster', 'circuit_glass',
  'saltpeter', 'tin', 'whale_oil', 'superconductors', 'ship_timber'
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

 function buildNavGraph(){
  const nodes = [], edges = [], byId = {};
  function addNode(id, x, y, z, tag){
   const n = { id: id, x: x, y: y, z: z, tag: tag };
   nodes.push(n); byId[id] = n;
   return n;
  }
  function addEdge(a, b, kind){
   const A = byId[a], B = byId[b];
   if (!A || !B || a === b) return;
   edges.push({ id: 'e' + edges.length, a: a, b: b, kind: kind || 'street', len: Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z), w: 3.5 });
  }

  const rimPts = [
   ['rim_d1_citadel', -225, -445],
   ['rim_d1_press',   -268, -432],
   ['rim_d1_beacon',  -298, -396],
   ['rim_d1_gate',    -135, -385],
   ['rim_d2_west',     -55, -365],
   ['rim_d2_bazaar',    72, -442],
   ['rim_d2_east',     185, -362],
   ['rim_d3_smithy',   355, -345],
   ['rim_d3_kilns',    445, -265],
   ['rim_d3_mine',     525, -155],
   ['rim_d4_north',   -435, -265],
   ['rim_d4_mid',     -455, -165],
   ['rim_d4_south',   -485,  -65],
   ['rim_d5_west',    -175, -625],
   ['rim_d5_mid',        5, -625],
   ['rim_d5_east',     185, -615]
  ];
  for (let i = 0; i < rimPts.length; i++) {
   const p = rimPts[i];
   addNode(p[0], p[1], BP_SITE.bareGround(p[1], p[2]), p[2], 'rim');
  }
  const rimLinks = [
   ['rim_d1_beacon', 'rim_d1_press'], ['rim_d1_press', 'rim_d1_citadel'], ['rim_d1_citadel', 'rim_d1_gate'],
   ['rim_d1_gate', 'rim_d2_west'], ['rim_d2_west', 'rim_d2_bazaar'], ['rim_d2_bazaar', 'rim_d2_east'],
   ['rim_d2_east', 'rim_d3_smithy'], ['rim_d3_smithy', 'rim_d3_kilns'], ['rim_d3_kilns', 'rim_d3_mine'],
   ['rim_d1_beacon', 'rim_d4_north'], ['rim_d4_north', 'rim_d4_mid'], ['rim_d4_mid', 'rim_d4_south'],
   ['rim_d1_citadel', 'rim_d5_west'], ['rim_d5_west', 'rim_d5_mid'], ['rim_d5_mid', 'rim_d5_east'],
   ['rim_d2_bazaar', 'rim_d5_mid'], ['rim_d2_east', 'rim_d5_east']
  ];
  for (let i = 0; i < rimLinks.length; i++) addEdge(rimLinks[i][0], rimLinks[i][1], 'street');

  addNode('stair_top', -52, BP_SITE.bareGround(-52, -330), -330, 'stair');
  addNode('stair_mid1', -78, 72.0, -268, 'stair');
  addNode('stair_mid2', -34, 36.0, -210, 'stair');
  addNode('cove_d6_west', -135, 3.8, -125, 'cove');
  addNode('cove_d6_mid',     5, 3.8, -125, 'cove');
  addNode('cove_d6_east',  135, 3.8, -125, 'cove');
  addNode('vault_d7_wharf', -245, 3.2, -5, 'vault');
  addNode('vault_d7_silk',  -292, 5.2, -24, 'vault');

  addEdge('rim_d2_west', 'stair_top', 'street');
  addEdge('stair_top', 'stair_mid1', 'stair');
  addEdge('stair_mid1', 'stair_mid2', 'stair');
  addEdge('stair_mid2', 'cove_d6_mid', 'stair');
  addEdge('cove_d6_west', 'cove_d6_mid', 'quay');
  addEdge('cove_d6_mid', 'cove_d6_east', 'quay');
  addEdge('cove_d6_west', 'vault_d7_wharf', 'tunnel');
  addEdge('vault_d7_wharf', 'vault_d7_silk', 'tunnel');

  for (let r = 0; r < BP_SMUGGLER_ROUTES.length; r++) {
   const rt = BP_SMUGGLER_ROUTES[r];
   const id = 'hub_' + rt.partner;
   addNode(id, -180 + r * 120, 0.5, 480 + r * 35, 'sea');
   addEdge('cove_d6_mid', id, 'sea');
  }

  function nearest(x, z){
   let best = nodes[0], bd = 1e9;
   for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].tag === 'sea') continue;
    const d = Math.hypot(nodes[i].x - x, nodes[i].z - z);
    if (d < bd) { bd = d; best = nodes[i]; }
   }
   return best;
  }

  return { nodes: nodes, edges: edges, byId: byId, nearest: nearest };
 }

 function init(opt){
  if (_state && !(opt && opt.fresh)) return _state;
  if (typeof SIM === 'undefined') return null;

  const plans = (opt && opt.plans) || BP_CITY.buildPlans();
  clearSim();

  _simMinute = 0;
  _simSec = 0;
  SIM.init({
   seed: BP_SITE.SEED,
   day: function(){ return Math.floor(_simMinute / 1440); },
   hour: function(){ return (_simMinute % 1440) / 60; },
   t: function(){ return _simSec; }
  });

  const nav = buildNavGraph();
  SIM.nav.layer('pedestrian', { nodes: nav.nodes, edges: nav.edges, yWeight: 1.5 });

  /* 1. Factions & Truce Relations */
  const factions = [
   { id: 'exile_syndicate',      name: 'Council of Bare Lintels (Bè-tõ-pò)', culture: 'eternian' },
   { id: 'eternian_underground', name: 'Farport Defector and Night-Factor Ring', culture: 'eternian' },
   { id: 'yonni_queens',         name: 'Yonni Spear-Queen Truce Dyads', culture: 'yonni' },
   { id: 'crook_mariners',       name: 'Hueru-Kuran and cFlit-qBon Mariners', culture: 'hueru-kuran' },
   { id: 'ria_smugglers',        name: 'Double Delta Ghost-Silk Factors', culture: 'ria' }
  ];
  for (let i = 0; i < factions.length; i++) SIM.faction(factions[i]);
  for (let i = 1; i < factions.length; i++) {
   SIM.relation({ a: 'exile_syndicate', b: factions[i].id, stance: 'friendly', trade: 'open' });
   SIM.relation({ a: factions[i].id, b: 'exile_syndicate', stance: 'friendly', trade: 'open' });
  }
  SIM.org({ id: 'council_bare_lintels', name: 'Council of Bare Lintels (Bè-dò Hò)', faction: 'exile_syndicate', resident: true });

  /* 2. Settlements */
  SIM.settlement({ id: 'battered_port', faction: 'exile_syndicate', name: 'Bè-tõ-pò (Bare-Stone Port)', pop: POP_TOTAL, households: HOUSEHOLDS_TOTAL });
  for (let r = 0; r < BP_SMUGGLER_ROUTES.length; r++) {
   const rt = BP_SMUGGLER_ROUTES[r];
   SIM.settlement({ id: rt.partner, faction: rt.faction, name: rt.partnerName, pop: 1800 });
  }

  /* 3. Activities & Roles */
  const acts = ['SLEEP', 'WORK', 'EAT', 'WATCH', 'TRADE'];
  for (let i = 0; i < acts.length; i++) SIM.activity({ id: acts[i], indoor: acts[i] === 'SLEEP' });

  const baseSched = [[0, 'SLEEP'], [6, 'WORK'], [12, 'EAT'], [13, 'WORK'], [19, 'TRADE'], [22, 'SLEEP']];
  const factorSched = [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'TRADE'], [21, 'SLEEP']];
  const roles = [
   { id: 'bp_smith',   name: 'Nickel-Steel Crucible Smith', cohort: 'exile',  sched: baseSched,   work: 'WORK' },
   { id: 'bp_collier', name: 'Collar-Seam Collier & Coker', cohort: 'exile',  sched: baseSched,   work: 'WORK' },
   { id: 'bp_rigger',  name: 'Farport Creole Hoist-Rigger', cohort: 'creole', sched: baseSched,   work: 'WORK' },
   { id: 'bp_mariner', name: 'Blockade-Lugger Mariner',     cohort: 'creole', sched: baseSched,   work: 'WORK' },
   { id: 'bp_terrace', name: 'Wrack-Terrace Grower',        cohort: 'exile',  sched: baseSched,   work: 'WORK' },
   { id: 'bp_factor',  name: 'Bare-Lintel Sea-Factor',      cohort: 'exile',  sched: factorSched, work: 'TRADE' },
   { id: 'bp_envoy',   name: 'Truce Envoy Factor',          cohort: 'truce',  sched: factorSched, work: 'TRADE' },
   { id: 'bp_carter',  name: 'Rim-Hoist Mule & Cart Hand',  cohort: 'creole', sched: baseSched,   work: 'WORK' }
  ];
  for (let i = 0; i < roles.length; i++) {
   SIM.role(Object.assign({
    org: 'council_bare_lintels',
    prefers: {
     SLEEP: { pin: 'home' },
     EAT:   { pin: 'home' },
     WORK:  { pin: 'work' },
     TRADE: { kinds: ['market', 'civic'] }
    }
   }, roles[i]));
  }

  /* 4. Economy Goods Table */
  const goodsCfg = {};
  for (let i = 0; i < ALL_GOODS.length; i++) {
   goodsCfg[ALL_GOODS[i]] = { minLoad: 8, export: true };
  }

  SIM.economy({
   goods: goodsCfg,
   every: 60,
   window: 2,
   useShort: true,
   cart: { cap: 120, load: 15, unload: 15, minLoad: 10, urgent: 2 },
   imports: { days: 4, scan: 60 },
   exports: { minDays: 2, made: false },
   meal: { per: 1, foods: ['sweet_potato', 'taro', 'fish', 'wheat', 'rice', 'alecap'] }
  }, { settlement: 'battered_port' });

  function addBPPlace(id, name, kind, x, z, actsMap, yOpt){
   const n = nav.nearest(x, z);
   const y = yOpt == null ? BP_SITE.bareGround(x, z) : yOpt;
   return SIM.place({
    id: id, name: name, kind: kind, settlement: 'battered_port', org: 'council_bare_lintels',
    layer: 'pedestrian', x: x, y: y, z: z,
    door: { x: n.x, y: n.y, z: n.z, node: n.id },
    activities: actsMap || { WORK: 40, TRADE: 40 }
   });
  }

  const whRim = addBPPlace('bp.wh.rim', 'Upper Rim Contraband Strongroom', 'warehouse', 238, -432, { WORK: 24 });
  const whVault = addBPPlace('bp.wh.vault', 'Da-wò-hò Sea-Cave Vault', 'warehouse', -292, -24, { WORK: 24 }, 5.2);
  const whGranary = addBPPlace('bp.wh.granary', 'Tsunami-Proof +96 m Basalt Granary', 'warehouse', -65, -612, { WORK: 20 });
  const quayStop = addBPPlace('bp.stop.kettle', 'Kettle Truce-Berth and Hoist Quay', 'harbor', 8, -118, { WORK: 60, TRADE: 40 }, 3.4);

  SIM.store(whRim.id, { kind: 'warehouse', cap: 9000 });
  SIM.store(whVault.id, { kind: 'warehouse', cap: 9000 });
  SIM.store(whGranary.id, { kind: 'warehouse', cap: 9000 });
  SIM.store(quayStop.id, { kind: 'site', cap: 4000 });

  const initRim = {
   coke_coal: 780, nickel_steel: 340, celadon: 310, uncensored_books: 220, sail_hemp: 240, tea: 195, ship_timber: 240
  };
  const initVault = {
   spider_silk: 240, ria_amber: 220, jade: 210, paktong: 185, alabaster: 195, saltpeter: 210, whale_oil: 165, circuit_glass: 85, superconductors: 75, tin: 135
  };
  const initGranary = {
   sweet_potato: 620, taro: 360, fish: 420, wheat: 340, rice: 290, alecap: 165
  };
  Object.keys(initRim).forEach(function(g){ whRim.stock[g] = initRim[g]; });
  Object.keys(initVault).forEach(function(g){ whVault.stock[g] = initVault[g]; });
  Object.keys(initGranary).forEach(function(g){ whGranary.stock[g] = initGranary[g]; });

  const worksSpec = [
   { id: 'bp.work.coal',    name: 'Collar-Seam Coke Ovens',        x: 408,  z: -322, out: ['coke_coal'],        rate: 3.8 },
   { id: 'bp.work.smithy',  name: 'Nickel-Steel Crucible Forge',   x: 355,  z: -345, out: ['nickel_steel'],     rate: 2.6 },
   { id: 'bp.work.celadon', name: 'Unsealed Olive-Celadon Kiln',   x: 452,  z: -285, out: ['celadon'],          rate: 2.4 },
   { id: 'bp.work.press',   name: 'Exile Free Block-Press',        x: -268, z: -432, out: ['uncensored_books'], rate: 1.9 },
   { id: 'bp.work.weaver',  name: 'Tan-Bark Sail-Loft',            x: -418, z: -182, out: ['sail_hemp'],        rate: 2.1 },
   { id: 'bp.work.terrace', name: 'Wrack-Manured Scoria Terraces', x: -12,  z: -675, out: ['sweet_potato', 'taro', 'tea'], rate: 4.5 },
   { id: 'bp.work.cellar',  name: 'Palagonite Alecap Vault',       x: 142,  z: -575, out: ['alecap'],           rate: 1.8 },
   { id: 'bp.work.fish',    name: 'Kettle Squid & Kelp Landing',   x: 84,   z: -130, out: ['fish'],             rate: 3.6, y: 3.8 },
   { id: 'bp.work.dock',    name: 'Podocarp Lugger Yard',          x: -215, z: -128, out: ['ship_timber'],      rate: 2.0, y: 3.6 }
  ];
  for (let i = 0; i < worksSpec.length; i++) {
   const W = worksSpec[i];
   const P = addBPPlace(W.id, W.name, 'works', W.x, W.z, { WORK: 50 }, W.y);
   SIM.recipe(P.id, { out: W.out, rate: W.rate, cap: 900 });
  }

  const bazaar = addBPPlace('bp.place.bazaar', 'Nine-Hull Prize-Bazaar', 'market', 72, -446, { TRADE: 180, WORK: 30 });
  const court = addBPPlace('bp.place.court', 'Council of Bare Lintels (Bè-dò Hò)', 'civic', -225, -445, { TRADE: 120, WORK: 30 });

  const homeLots = plans.lots.filter(function(l){ return !l.civic && !l.underConstruction; });
  const homes = [];
  const nHomes = Math.min(48, Math.max(16, homeLots.length));
  for (let i = 0; i < nHomes; i++) {
   const L = homeLots[(i * 7) % homeLots.length];
   const hid = 'bp.home.' + i;
   const H = addBPPlace(hid, 'Bare-Lintel Household ' + (i + 1), 'home', L.x, L.z, { SLEEP: 12, EAT: 12 }, L.y);
   H.people = 5;
   H.store = { sweet_potato: 24, fish: 18, wheat: 14, rice: 12 };
   homes.push(H);
  }

  /* 6. Partner Settlement Economies & Landings */
  for (let r = 0; r < BP_SMUGGLER_ROUTES.length; r++) {
   const rt = BP_SMUGGLER_ROUTES[r];
   SIM.economy({
    goods: goodsCfg,
    every: 60,
    window: 2,
    useShort: true,
    imports: { days: 5, scan: 60 },
    exports: { minDays: 1, made: false }
   }, { settlement: rt.partner });

   const hubNode = 'hub_' + rt.partner;
   const hn = nav.byId[hubNode];
   const pWh = SIM.place({
    id: rt.partner + '.wh', name: rt.partnerName + ' Warehouse', kind: 'warehouse',
    settlement: rt.partner, layer: 'pedestrian', x: hn.x, y: 0.5, z: hn.z,
    door: { x: hn.x, y: 0.5, z: hn.z, node: hubNode }, activities: { WORK: 20 }
   });
   const pStop = SIM.place({
    id: rt.partner + '.stop', name: rt.partnerName + ' Cove Landing', kind: 'harbor',
    settlement: rt.partner, layer: 'pedestrian', x: hn.x, y: 0.5, z: hn.z,
    door: { x: hn.x, y: 0.5, z: hn.z, node: hubNode }, activities: { WORK: 20 }
   });
   SIM.store(pWh.id, { kind: 'warehouse', cap: 12000 });
   SIM.store(pStop.id, { kind: 'site', cap: 4000 });

   for (let gIdx = 0; gIdx < rt.inn.length; gIdx++) pWh.stock[rt.inn[gIdx]] = 2400;
   for (let gIdx = 0; gIdx < rt.out.length; gIdx++) pWh.stock[rt.out[gIdx]] = 12;
  }

  /* 7. Register the 4 Smuggler Ring SIM.trade routes */
  for (let r = 0; r < BP_SMUGGLER_ROUTES.length; r++) {
   const rt = BP_SMUGGLER_ROUTES[r];
   const goodsMap = {};
   goodsMap['battered_port'] = rt.out.slice();
   goodsMap[rt.partner] = rt.inn.slice();

   const expectMap = { battered_port: {} };
   expectMap[rt.partner] = {};
   for (let i = 0; i < rt.inn.length; i++) expectMap.battered_port[rt.inn[i]] = 36;
   for (let i = 0; i < rt.out.length; i++) expectMap[rt.partner][rt.out[i]] = 32;

   SIM.trade({
    id: rt.id,
    stops: [
     { settlement: 'battered_port', place: quayStop.id },
     { settlement: rt.partner, place: rt.partner + '.stop' }
    ],
    cap: rt.cap,
    carriers: rt.carriers,
    minutes: rt.minutes,
    mins: 60,
    stagger: r * 45,
    keep: 1,
    want: 12,
    goods: goodsMap,
    expect: expectMap
   });
  }

  /* 8. Populate Unpainted Exile, Farport Creole & Truce Envoy Citizens + Carts */
  const citizens = [];
  for (let i = 0; i < ACTOR_COUNT; i++) {
   const h = homes[i % homes.length];
   const u = KRAND.unit(KRAND.hash(BP_SITE.SEED ^ 0x7711, i));
   const cohort = u < 0.62 ? 'eternian_exile' : (u < 0.90 ? 'farport_creole' : 'truce_envoy');
   const isCart = i < 6;
   const roleId = isCart ? 'bp_carter'
    : cohort === 'truce_envoy' ? 'bp_envoy'
    : cohort === 'farport_creole' ? (i % 2 === 0 ? 'bp_rigger' : 'bp_mariner')
    : (i % 4 === 0 ? 'bp_smith' : i % 4 === 1 ? 'bp_collier' : i % 4 === 2 ? 'bp_terrace' : 'bp_factor');

   const workPlace = isCart ? whRim.id
    : roleId === 'bp_smith' ? 'bp.work.smithy'
    : roleId === 'bp_collier' ? 'bp.work.coal'
    : roleId === 'bp_terrace' ? 'bp.work.terrace'
    : roleId === 'bp_rigger' ? quayStop.id
    : roleId === 'bp_mariner' ? 'bp.work.fish'
    : roleId === 'bp_envoy' ? court.id : bazaar.id;

   const skinPalette = ['#ebd3be', '#d8b496', '#c09674', '#b48764'];
   const skinHex = skinPalette[KRAND.hash(0x51a, i) % skinPalette.length];

   const actor = SIM.actor({
    id: 'bp.cit.' + i,
    role: roleId,
    org: 'council_bare_lintels',
    home: h.id,
    work: workPlace
   });
   actor.cohort = cohort;
   actor.skin = skinHex;
   actor.whiteFacePaint = false;
   actor.censorateStripes = false;
   actor.metallicHeirSkin = false;
   if (isCart) SIM.cart(actor);
   citizens.push(actor);
  }

  SIM.stepHooks.push(function(minute){
   if (minute % 360 !== 0) return;
   SIM.withEcon('battered_port', function(){
    SIM.supply('sweet_potato', 8, false);
    SIM.supply('fish', 6, false);
    SIM.supply('wheat', 5, false);
    SIM.supply('rice', 4, false);
    SIM.supply('coke_coal', 6, false);
    SIM.produce('bp.work.coal', 'coke_coal', 28);
    SIM.produce('bp.work.smithy', 'nickel_steel', 20);
    SIM.produce('bp.work.celadon', 'celadon', 18);
    SIM.produce('bp.work.press', 'uncensored_books', 12);
    SIM.produce('bp.work.weaver', 'sail_hemp', 14);
    SIM.produce('bp.work.terrace', 'sweet_potato', 24);
    SIM.produce('bp.work.terrace', 'tea', 10);
    SIM.produce('bp.work.fish', 'fish', 20);
   });
   for (let r = 0; r < BP_SMUGGLER_ROUTES.length; r++) {
    const rt = BP_SMUGGLER_ROUTES[r];
    SIM.withEcon(rt.partner, function(){
     for (let i = 0; i < rt.out.length; i++) SIM.supply(rt.out[i], 6, false);
     const wh = SIM.R.place[rt.partner + '.wh'];
     if (wh && wh.stock) {
      for (let i = 0; i < rt.inn.length; i++) {
       if ((wh.stock[rt.inn[i]] || 0) < 1200) wh.stock[rt.inn[i]] = (wh.stock[rt.inn[i]] || 0) + 80;
      }
     }
    });
   }
  });

  /* Advance 3.5 simulated days (5,040 minutes in 30-min ticks) so all 4 smuggler routes sail & land multiple loads */
  for (let m = 30; m <= 5040; m += 30) {
   _simMinute = m;
   _simSec = m * 60;
   SIM.step();
  }

  _state = {
   pop: POP_TOTAL,
   households: HOUSEHOLDS_TOTAL,
   citizens: citizens,
   routes: BP_SMUGGLER_ROUTES,
   nav: nav,
   advanceTo: function(minute, sec){
    _simMinute = minute;
    _simSec = sec;
    SIM.step();
   },
   stocks: function(){
    return SIM.withEcon('battered_port', function(){ return SIM.stocks ? SIM.stocks() : null; });
   },
   tradeReport: function(){
    return SIM.tradeReport ? SIM.tradeReport() : {};
   }
  };
  return _state;
 }

 return {
  POP_TOTAL: POP_TOTAL,
  HOUSEHOLDS_TOTAL: HOUSEHOLDS_TOTAL,
  ALL_GOODS: ALL_GOODS,
  init: init
 };
})();
if (typeof module !== 'undefined' && module.exports) {
 module.exports = { BP_SMUGGLER_ROUTES: BP_SMUGGLER_ROUTES, BP_SIM: BP_SIM };
}
