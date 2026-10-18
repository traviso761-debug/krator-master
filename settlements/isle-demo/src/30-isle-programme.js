/* ============================== 2. THE TOWNS' PROGRAMMES (PLAN.md SECTION 8) AS DATA ============================== */
/* [G data] What each town is made of, read by the city plan (32-isle-city.js): its districts' roles, the kit pieces each
   lot class takes, each district's draw of classes, how dense it is, the landmarks the owner named (and the ones the
   brief asks for that are not drawn yet: "to draw" in PLAN.md 8a), its avenues to draw, its harbours' vessels and the
   world records beyond the planning square. Keys are the kits' own:
     ie-* ip-*        kits/islanders, the East set (Kautoa's)
     vern_*           the Iziz Vernacular (settlements/iziz/src), Izanitown's
     br_bldg_*        the catalog's Beast Rider buildings (kits/catalog, from Girder and Mav's Refuge), Ridertown's: the
                      Beast Riders kit (kits/beast-riders, waiting on three textures) will bring the stables and the
                      rookery tower; until then a stable is the Islanders' byre (ie-byre), named a stand-in in the census
     ringsea keys     kits/ringsea's vessels (islanderDrua, vothDhow ...) */
ISLE.PROG = {};
/* The programme's own coordinates (a centre, the brief's added districts) and lengths (the reach of the wealth, the
   fringe) are in the owner's drawing's frame. The site file's drawing is scaled toward the harbour (tools/scale-site.js,
   owner 2026-10-18: Kautoa 0.35, Valapo its own factor; the town's `scaled` {factor, anchor}), so the programme takes
   the same scale: ISLE.scaledProg(P, scaled) is P with those moved and shortened alike. Sizes of things (buildings,
   streets, the hug's walking distances) do not scale */
ISLE.scaledProg = function (P, sc) {
  if (!sc || sc.factor === 1) return P;
  var s = sc.factor, a = sc.anchor, pt = function (p) { return [a[0] + s * (p[0] - a[0]), a[1] + s * (p[1] - a[1])]; }, Q = {};
  for (var k in P) Q[k] = P[k];
  Q.centre = pt(P.centre); Q.reach = P.reach * s; if (P.fringe != null) Q.fringe = P.fringe * s;
  Q.addDistricts = (P.addDistricts || []).map(function (d) { var e = {}; for (var j in d) e[j] = d[j]; e.poly = d.poly.map(pt); return e; });
  return Q;
};

/* the lot classes both towns share (core/city's TUNE.classes: [key, variant]) */
ISLE.CLASSES = {
  poor: [['ie-hut-scrap', 0], ['ie-hut-garden', 0], ['ie-house-shared', 0]],
  middle: [['ie-house-uma', 0], ['ie-house-long', 0], ['ie-house-cross', 0], ['ie-house-twin', 0], ['ie-house-clan', 0]],
  rich: [['ie-house-wealthy', 0], ['ie-house-great', 0]],
  manor: [['ie-house-noble', 0], ['ie-house-chief', 0]],
  shop: [['ie-trader', 0], ['ie-chandler', 0], ['ie-potter', 0], ['ie-weaver', 0], ['ie-bakehouse', 0], ['ie-butcher', 0]],
  tavern: [['ie-kava-house', 0], ['ie-guesthouse', 0]],
  industrial: [['ie-warehouse', 0], ['ie-smithy', 0], ['ie-granary', 0]],
  /* the works quarter (PLAN 8a: forges, smithies, a tool and weapon works, cooperage, rope walks, kilns): the kit's smithy,
     warehouse, potter's kilns, weaver and tannery; it has no cooperage or rope walk yet (KNOWN_ISSUES.md) */
  works: [['ie-smithy', 0], ['ie-warehouse', 0], ['ie-potter', 0], ['ie-tannery', 0], ['ie-weaver', 0]],
  farm: [['ie-farm', 0], ['ie-farm-poor', 0], ['ie-byre', 0], ['ie-pens', 0], ['ie-granary', 0]],
  military: [['ie-barracks', 0], ['ie-watchtower', 0]],
  /* Izanitown: the Iziz Vernacular */
  vpoor: [['vern_house_poor_a', 0], ['vern_house_poor_b', 0], ['vern_house_poor_c', 0]],
  vmiddle: [['vern_house_mid_a', 0], ['vern_house_mid_b', 0], ['vern_house_mid_c', 0]],
  vrich: [['vern_house_rich_a', 0], ['vern_house_rich_b', 0]],
  vshop: [['vern_shops', 0], ['vern_workshop_a', 0], ['vern_workshop_b', 0], ['vern_smithy', 0], ['vern_tavern', 0]],
  vmilitary: [['vern_guard_tower', 0], ['vern_watch_house', 0]],
  /* Ridertown: the riders' shrines, rookeries and stables (the stable a stand-in until kits/beast-riders has one) */
  shrine: [['br_bldg_nature_shrine', 0]],
  rookery: [['br_bldg_roost_gallery', 0]],
  stable: [['ie-byre', 0]]
};
ISLE.FALLBACK = { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', tavern: 'shop', industrial: 'poor', works: 'industrial', farm: 'poor',
  military: 'middle', vrich: 'vmiddle', vmiddle: 'vpoor', vshop: 'vpoor', vmilitary: 'vshop', vpoor: null, shrine: 'poor', rookery: 'stable',
  stable: 'poor', poor: null };
/* a district role's draw of lot classes, by street class (the default draw by wealth is core/city's) */
ISLE.DRAWS = {
  izani: { avenue: { vshop: 0.35, vrich: 0.25, vmiddle: 0.3, vmilitary: 0.1 }, main: { vshop: 0.2, vrich: 0.12, vmiddle: 0.43, vpoor: 0.2, vmilitary: 0.05 },
    side: { vshop: 0.1, vmiddle: 0.45, vpoor: 0.45 }, alley: { vmiddle: 0.3, vpoor: 0.6, vshop: 0.1 } },
  riders: { avenue: { middle: 0.35, rich: 0.1, shrine: 0.15, stable: 0.18, rookery: 0.22 }, main: { middle: 0.33, poor: 0.17, shrine: 0.14, stable: 0.16, rookery: 0.2 },
    side: { middle: 0.35, poor: 0.35, shrine: 0.1, stable: 0.12, rookery: 0.08 }, alley: { poor: 0.6, middle: 0.25, stable: 0.15 } },
  works: { avenue: { works: 0.75, shop: 0.15, tavern: 0.1 }, main: { works: 0.8, shop: 0.1, poor: 0.1 }, side: { works: 0.75, poor: 0.25 }, alley: { works: 0.6, poor: 0.4 } },
  harbour: { avenue: { industrial: 0.35, shop: 0.3, tavern: 0.15, middle: 0.2 }, main: { industrial: 0.3, shop: 0.2, tavern: 0.1, poor: 0.4 },
    side: { industrial: 0.2, poor: 0.6, shop: 0.2 }, alley: { poor: 0.7, industrial: 0.3 } },
  naval: { avenue: { military: 0.6, industrial: 0.3, tavern: 0.1 }, main: { military: 0.5, industrial: 0.3, poor: 0.2 }, side: { military: 0.4, poor: 0.6 }, alley: { poor: 1 } },
  fringe: { avenue: { farm: 0.45, middle: 0.3, poor: 0.25 }, main: { farm: 0.6, poor: 0.3, middle: 0.1 }, side: { farm: 0.65, poor: 0.35 }, alley: { farm: 0.5, poor: 0.5 } }
};
/* the role table (core/city KCITY.site.roles): a district's name first, then its type */
ISLE.ROLES = KCITY.site.roles({ types: [],
  names: [[/^build (region|area)$/, 'zone'], [/^ceremonial park$/, 'ceremonial'], [/white sand beach/, 'beach'], [/^military harbor$/, 'naval'], [/^harbor$/, 'harbour'],
    [/^ridertown$/, 'riders'], [/^izanitown$/, 'izani'], [/^warrior's square$/, 'warriors'], [/^works quarter$/, 'works'], [/^park/, 'park'], [/^market/, 'market'],
    [/^funerary/, 'funerary']], other: 'misc' });
/* (no district type is its own role: the names decide, so Warrior's Square, typed a plaza, is the warriors') */

ISLE.PROG.Kautoa = {
  cell: 2.5, half: 4400, gridCell: 5, wall: true, maxSlope: 0.32, maxDrop: 6,
  centre: [0, 130], reach: 3600,
  /* districts the brief adds (to draw): the works quarter between Avenues 2 and 5, east of Izanitown (PLAN 8a) */
  addDistricts: [{ id: 'w1', type: 'misc', name: 'works quarter', poly: [[1750, 200], [2600, 200], [2600, 680], [1750, 680]] }],
  /* how dense each role is (the share of frontage built: core/city's vacant rule); the residential ground thins from the
     centre to the wall */
  dens: { izani: 0.95, works: 0.9, harbour: 0.6, naval: 0.6, riders: 0.45, res: [0.24, 0.04] },
  /* the hug (owner, 2026-10-18): the houses keep to the shore, the landmarks and the avenues; beyond them, farmland */
  hug: { r0: 55, r1: 140, floor: 0.03, roles: ['res', 'riders'] },
  /* at the town's scale (0.35) fewer, wider-spaced streets, so the farmland between them reads as fields */
  tune: { voidMax: 90, voidIters: 12, sideSpacing: 90 },
  /* the farmland inside the wall (8c: the wet lowland's rice paddies, cloves and cacao rain-fed, and the isles' own coconut,
     banana and taro) */
  farm: { cell: 24, crops: [{ crop: 'rice', kind: 'paddy', w: 4, maxSlope: 0.14, maxH: 360 }, { crop: 'cloves', kind: 'orchard', w: 3 },
    { crop: 'cacao', kind: 'orchard', w: 2, maxH: 600 }, { crop: 'coconut', kind: 'orchard', w: 1, maxH: 250 }, { crop: 'banana', kind: 'orchard', w: 1 },
    { crop: 'taro', kind: 'field', w: 1, maxSlope: 0.12 }] },
  /* the ceremonial centre: each faces the park, its front parallel to the nearest side of the ring (PLAN 8a) */
  ring: { district: 'ceremonial park', gap: 8 },
  aligned: [
    { marker: 'PALACE', key: 'ip-palace', role: 'palace', name: 'Palace of Kautoa' },
    { marker: 'A', key: 'ie-envoy', role: 'envoy', name: 'Envoy house A' },
    { marker: 'B', key: 'ie-envoy', role: 'envoy', name: 'Envoy house B' },
    { marker: 'C', key: 'ie-envoy', role: 'envoy', name: 'Envoy house C' },
    { marker: 'D', key: 'ie-envoy', role: 'envoy', name: 'Envoy house D' },
    { marker: 'E', key: 'ie-envoy', role: 'envoy', name: 'Envoy house E' },
    { marker: 'SQUARE', key: 'ie-square', role: 'ceremonial square', name: 'Ceremonial square', ringed: true, over: ['Avenue 1', 'Avenue 3'] },
    { marker: "IZIZ GOVERNOR'S HOUSE", key: 'vern_governor_palace', role: 'governor', name: "Governor's House (the old)" }
  ],
  /* landmarks at a marker or a district (the first that fits, hunted outward) */
  fixed: [
    { marker: 'QUARRIES', keys: ['ie-quarry', 'ie-quarry', 'ie-quarry'], role: 'quarry', spread: 60 },
    { marker: 'SALT WORKS', keys: ['ie-saltworks', 'ie-saltworks', 'ie-saltworks', 'ie-saltworks'], role: 'salt works', spread: 50 },
    /* no Islander caravanserai: the guest house (an inn) stands for it (KNOWN_ISSUES.md) */
    { marker: 'CARAVANSERAI', keys: ['ie-guesthouse', 'ie-warehouse', 'ie-pens'], role: 'caravanserai', spread: 40 },
    { district: 'Funerary 1', keys: ['ie-temple'], role: 'ancestor temple' }
  ],
  /* the native military round Warrior's Square: barracks and the war-canoe captains' halls along its sides, watch towers
     at its corners, all facing the square */
  squareRing: { district: "Warrior's Square", sides: ['ie-barracks', 'ie-house-long', 'ie-barracks', 'ie-barracks', 'ie-house-long', 'ie-barracks'], corners: 'ie-watchtower', inset: 4 },
  markets: { 'Market 1': { keys: ['ie-market', 'ie-market', 'ie-trader', 'ie-chandler', 'ie-kava-house'], gap: 14 },
    'Market 2': { keys: ['ie-market', 'ie-market', 'ie-trader', 'ie-weaver', 'ie-potter', 'ie-kava-house'], gap: 16 },
    'Market 3': { keys: ['ie-market', 'ie-trader', 'ie-chandler'], gap: 14 } },
  /* the avenues the brief asks for (to draw): rings round these, and the western loop (routed over the ground) */
  rings: ['Market 2', 'Market 3', 'Park 3'],
  routes: [{ name: 'Avenue Market 3 - Park 2', from: 'Market 3', to: 'Park 3' }, { name: 'Avenue Park 2 - Market 2', from: 'Park 3', to: 'Market 2' }],
  /* the highways beyond the wall start at three gates (PLAN 8a): a spur out through the wall, the rest a world record */
  gates: [{ name: 'North Gate', avenue: 'Avenue 7', end: 'last', toward: 'beast rider territory' },
    { name: 'West Gate', avenue: 'Avenue 8', end: 'last', toward: 'the western fishing villages' },
    { name: 'East Gate', avenue: 'Avenue 10', end: 'last', toward: 'the eastern fishing villages' }],
  civic: [{ key: 'ie-school', near: 'res' }, { key: 'ie-school', near: 'res' }, { key: 'ie-school', near: 'riders' }, { key: 'ie-healer', near: 'res' },
    { key: 'ie-healer', near: 'harbour' }, { key: 'ie-healer', near: 'res' }, { key: 'ie-hall', near: 'res' }, { key: 'ie-hall', near: 'res' }, { key: 'ie-hall', near: 'riders' },
    { key: 'ie-granary-great', near: 'res' }, { key: 'ie-granary-great', near: 'res' }, { key: 'ie-temple', near: 'res' }, { key: 'ie-windmill', near: 'works' },
    { key: 'ie-windmill', near: 'res' }],
  /* the harbours (PLAN 8a): their shore pieces, then the vessels moored off them */
  harbours: [
    { district: 'military harbor', shore: ['ie-canoeshed', 'ie-canoeshed', 'ie-canoeshed', 'ie-canoeshed', 'ie-dockyard', 'ie-canoeshed', 'ie-canoeshed'],
      vessels: [['islanderDrua', 3], ['islanderKorakora', 3], ['islanderKarakoa', 3], ['islanderLanong', 2]], use: 'naval' },
    { district: 'Harbor', shore: ['ie-quay', 'ie-fishdock', 'ie-quay', 'ie-fishdock', 'ie-harbourmaster', 'ie-quay', 'ie-fishdock', 'ie-beacon', 'ie-fishdock', 'ie-quay', 'ie-fishdock', 'ie-ferry'],
      vessels: [['islanderOruwa', 8], ['islanderLakatoi', 5], ['vothDhow', 2], ['vothJunk', 1], ['vothHulk', 1], ['vothBarge', 1], ['hykCorbita', 2], ['hykGalley', 1], ['hykPearl', 1],
        ['izizDhoni', 2], ['izizLighter', 1], ['izizTurtle', 1], ['beastWaa', 2], ['beastRookery', 1], ['salvageTug', 1]], use: 'civilian', landing: true }
  ],
  /* beyond the planning square (PLAN 8a): world records the open world places later */
  beyond: [
    { kind: 'farm ring', note: 'farms and orchards round the wall, outside the planning square (8c: rice, cloves, cacao)', ring: [800, 2600], count: 40 },
    { kind: 'fishing village', note: 'small fishing villages along the coast highways (8a), placed in a later step', count: 4 },
    { kind: 'highway', note: 'west along the coast from the West Gate', from: 'West Gate' },
    { kind: 'highway', note: 'east along the coast from the East Gate', from: 'East Gate' },
    { kind: 'highway', note: 'north past Ridertown to beast rider territory', from: 'North Gate' }
  ]
};

ISLE.PROG.Valapo = {
  cell: 2.5, half: 4400, gridCell: 5, wall: false, maxSlope: 0.3, maxDrop: 5, village: true,
  centre: [420, -1580], reach: 2600,
  /* the open village (8b), about a third of Kautoa's size (owner, 2026-10-18): the build area is the dense part; it fades
     to suburbs and then farms for this far beyond it */
  fringe: 900,
  addDistricts: [],
  dens: { harbour: 0.55, naval: 0.6, res: [0.36, 0.08], fringe: [0.12, 0.03] },
  hug: { r0: 55, r1: 140, floor: 0.03, roles: ['res', 'fringe'] },
  tune: { voidMax: 90, voidIters: 12, sideSpacing: 90 },
  /* the farmland (8c: sugar cane and cotton on the dry savanna, coffee on the cooler upland, sweet potato) */
  farm: { cell: 24, crops: [{ crop: 'sugar cane', kind: 'field', w: 4, maxSlope: 0.12 }, { crop: 'cotton', kind: 'field', w: 3, maxSlope: 0.12 },
    { crop: 'coffee', kind: 'orchard', w: 3, minH: 180 }, { crop: 'sweet potato', kind: 'field', w: 1 }, { crop: 'coconut', kind: 'orchard', w: 1, maxH: 120 },
    { crop: 'banana', kind: 'orchard', w: 1 }] },
  aligned: [],
  fixed: [
    { marker: 'VILLAGE HALL', keys: ['ie-hall'], role: 'village hall' },
    { marker: 'MILITARY', keys: ['ie-barracks', 'ie-watchtower', 'ie-barracks'], role: 'garrison', spread: 30 },
    { district: 'Funerary 1', keys: ['ie-temple'], role: 'ancestor temple' }
  ],
  markets: { 'Market 1': { keys: ['ie-market', 'ie-trader', 'ie-chandler', 'ie-market', 'ie-kava-house'], gap: 14 } },
  rings: [], routes: [], gates: [],
  civic: [{ key: 'ie-school', near: 'res' }, { key: 'ie-healer', near: 'res' }, { key: 'ie-granary-great', near: 'fringe' }, { key: 'ie-windmill', near: 'fringe' }],
  harbours: [
    /* the harbour smelter (8b: bloomeries fired with charcoal; the ingots shipped to Kautoa): the kit has no bloomery yet,
       its smithy stands for one (KNOWN_ISSUES.md) */
    { district: 'harbor', shore: ['ie-quay', 'ie-fishdock', 'ie-canoeshed', 'ie-fishdock', 'ie-quay', 'ie-fishdock', 'ie-harbourmaster'],
      inland: [['ie-smithy', 'smelter'], ['ie-smithy', 'smelter'], ['ie-warehouse', 'ingot store']],
      vessels: [['islanderOruwa', 6], ['islanderLakatoi', 3], ['islanderDrua', 1], ['islanderKarakoa', 1]], use: 'civilian', landing: true }
  ],
  beyond: [
    { kind: 'iron mine camp', note: 'the iron mining settlement in the mountains 12-18 km south-west (8b), on a kits/resources iron node, grade x1 (the owner\'s call)',
      box: [[-13000, 9000], [-5000, 17000]], minH: 700, node: 'node-iron-medium' },
    { kind: 'cart road', note: 'the cart road down from the mine camp to the harbour smelter, about 15-20 km (8b)', from: 'iron mine camp', to: 'smelter' },
    { kind: 'farms', note: 'the farms beyond the suburbs, outside the planning square (8b, 8c: coffee upland, sugar cane, cotton)', ring: [1200, 3000], count: 25 }
  ]
};
