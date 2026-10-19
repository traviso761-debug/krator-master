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
  var Q = {}; for (var k in P) Q[k] = P[k];      /* always a copy: the city fills in a centre and reach of its own */
  if (!sc || sc.factor === 1) return Q;
  var s = sc.factor, a = sc.anchor, pt = function (p) { return [a[0] + s * (p[0] - a[0]), a[1] + s * (p[1] - a[1])]; };
  if (P.centre) Q.centre = pt(P.centre); if (P.reach) Q.reach = P.reach * s; if (P.fringe != null) Q.fringe = P.fringe * s;
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
    [/^ridertown$/, 'riders'], [/^izanitown$/, 'izani'], [/^warrior's square$/, 'warriors'], [/^works quarter$/, 'works'], [/^park/, 'park'], [/^market/, 'market'], [/^plaza/, 'plaza'],
    [/^funerary/, 'funerary']], other: 'misc' });
/* (no district type is its own role: the names decide, so Warrior's Square, typed a plaza, is the warriors') */

ISLE.PROG.Kautoa = {
  /* the owner's redrawing at the town's size (2026-10-18): about 5,000 people, and at least two thirds of the build area
     buildings and streets, not farms, orchards or empty ground. So: every frontage built (no hug), and the houses stand in
     walled compounds (Sumba's: a yard behind and beside each house), which the census counts with their houses */
  cell: 2.5, half: 4400, gridCell: 5, wall: true, maxSlope: 0.34, maxDrop: 9,
  centre: null, reach: null,          /* the ceremonial park's middle; the build area's farthest corner from it */
  /* the works quarter by the harbour (owner, 2026-10-18; 8a: where Valapo's ingots land and are worked): inland of the
     harbour's eastern half, north of Avenue 1 and east of Izanitown */
  addDistricts: [{ id: 'w1', type: 'misc', name: 'works quarter', poly: [[1150, 960], [1610, 800], [1640, 985], [1190, 1175]] }],
  dens: { izani: 0.97, harbour: 0.95, riders: 0.9, res: [0.87, 0.74] },
  lot: { side: 7, setback: 3, rear: 10, inset: 1.0, step: 3 },
  /* the households: single houses in their compounds (a multi-family house would be three households) */
  classes: { poor: [['ie-hut-garden', 0], ['ie-hut-scrap', 0]], middle: [['ie-house-uma', 0], ['ie-house-cross', 0]],
    rich: [['ie-house-wealthy', 0]] },
  tune: { voidMax: 45, voidIters: 24, sideSpacing: 50, interiorDepth: 7, interiorRounds: 3 },
  /* what open ground is left is cultivated: kitchen orchards and taro (8c) */
  farm: { cell: 24, crops: [{ crop: 'cloves', kind: 'orchard', w: 3 }, { crop: 'cacao', kind: 'orchard', w: 2 }, { crop: 'banana', kind: 'orchard', w: 2 },
    { crop: 'coconut', kind: 'orchard', w: 1, maxH: 250 }, { crop: 'taro', kind: 'field', w: 1, maxSlope: 0.12 }] },
  /* the ceremonial centre (owner's note on the park: "civic buildings should orient to this park and it should have at
     least 4 envoy houses around it"): the palace, the square and the Governor's House at their markers, each facing the
     park, its front parallel to the nearest side of the ring; then the envoy houses and the civic buildings round the ring
     wherever they fit, facing it too */
  ring: { district: 'ceremonial park', gap: 8 },
  aligned: [
    { marker: 'PALACE', key: 'ip-palace', role: 'palace', name: 'Palace of Kautoa' },
    { marker: 'CEREMONIAL SQUARE', key: 'ie-square', role: 'ceremonial square', name: 'Ceremonial square', ringed: true, over: 'auto' },
    { marker: 'GOVERNOR HOUSE', key: 'vern_governor_palace', role: 'governor', name: "Governor's House (the old)" }
  ],
  ringAround: [{ key: 'ie-envoy', role: 'envoy', count: 5 }, { key: 'ie-hall', role: 'council hall', count: 1 }, { key: 'ie-school', role: 'school', count: 1 },
    { key: 'ie-healer', role: 'healer', count: 1 }, { key: 'ie-house-chief', role: "chief's house", count: 2 }],
  fixed: [
    { marker: 'QUARRIES', keys: ['ie-quarry', 'ie-quarry'], role: 'quarry', spread: 40 },
    { marker: 'SALT WORKS', keys: ['ie-saltworks', 'ie-saltworks', 'ie-saltworks'], role: 'salt works', spread: 40 },
    { district: 'Funerary 1', keys: ['ie-temple'], role: 'ancestor temple' },
    /* the caravanserai by Ridertown (owner, 2026-10-18), inside it near the west gate where Avenue 8 leaves the town: the
       Islanders have none, so the guest house (an inn), a warehouse, the stock pens and a byre stand for it */
    { at: [-110, 1185], keys: ['ie-guesthouse', 'ie-warehouse', 'ie-pens', 'ie-byre'], role: 'caravanserai', name: 'Caravanserai', spread: 35 }
  ],
  markets: { 'Market 1': { keys: ['ie-market', 'ie-market', 'ie-trader', 'ie-chandler', 'ie-kava-house'], gap: 10 },
    'Market 2': { keys: ['ie-market', 'ie-trader', 'ie-weaver', 'ie-potter'], gap: 10 } },
  rings: [], routes: [],
  /* a gate where an avenue ends at the build area's edge, a spur out through the wall (named by its side) */
  gates: 'auto',
  civic: [{ key: 'ie-granary-great', near: 'res' }, { key: 'ie-windmill', near: 'res' }, { key: 'ie-healer', near: 'harbour' }, { key: 'ie-bakehouse', near: 'res' }],
  /* the harbour (the owner's note: "military east, trade middle, fishing west"): its shore in thirds, west to east */
  harbours: [
    { district: 'harbor', part: [0, 1 / 3], shore: ['ie-fishdock', 'ie-fishdock', 'ie-ferry', 'ie-fishdock'],
      vessels: [['islanderOruwa', 8], ['islanderLakatoi', 4]], use: 'fishing' },
    { district: 'harbor', part: [1 / 3, 2 / 3], shore: ['ie-quay', 'ie-harbourmaster', 'ie-quay', 'ie-beacon', 'ie-quay'],
      inland: [['ie-warehouse', 'cargo shed'], ['ie-warehouse', 'cargo shed'], ['ie-smithy', 'iron works'], ['ie-smithy', 'iron works']],
      vessels: [['vothDhow', 2], ['vothJunk', 1], ['vothHulk', 1], ['vothBarge', 1], ['hykCorbita', 1], ['hykGalley', 1], ['hykPearl', 1],
        ['izizDhoni', 2], ['izizLighter', 1], ['izizTurtle', 1], ['beastWaa', 2], ['beastRookery', 1], ['salvageTug', 1], ['islanderLakatoi', 2]], use: 'civilian', landing: true },
    { district: 'harbor', part: [2 / 3, 1], shore: ['ie-canoeshed', 'ie-canoeshed', 'ie-dockyard', 'ie-canoeshed'],
      inland: [['ie-barracks', 'barracks'], ['ie-barracks', 'barracks'], ['ie-watchtower', 'watch tower']],
      vessels: [['islanderDrua', 3], ['islanderKorakora', 2], ['islanderKarakoa', 2], ['islanderLanong', 2]], use: 'naval' }
  ],
  beyond: [
    { kind: 'farm ring', note: 'farms and orchards round the wall (8c: rice paddies, cloves, cacao)', ring: [300, 1800], count: 40 },
    { kind: 'fishing village', note: 'small fishing villages along the coast highways (8a), placed in a later step', count: 4 },
    { kind: 'highway', note: 'the roads beyond the gates: west and east along the coast, north to beast rider territory (8a)', from: 'the gates' }
  ]
};

ISLE.PROG.Valapo = {
  /* the owner's redrawing (2026-10-18): no build area drawn. Buildings keep close to the shore and the avenues and infill
     outward from the village's centre (the village hall) until the village holds about a third of Kautoa (about 2,000):
     the zone is the drawing's outline grown by `zonePad`, the frontage thinning from the centre out (`dens.res` over
     `reach`) and away from the shore, the avenues and the landmarks (the hug). Its parks are white sand beaches */
  cell: 2.5, half: 4400, gridCell: 5, wall: false, maxSlope: 0.34, maxDrop: 8,
  zoneFrom: 'drawing', zonePad: 420, centreMarker: 'VILLAGE HALL', reach: 900,
  parksAre: 'beach',
  addDistricts: [],
  /* the village grows from the centre: built ground within grow.R of the village hall, or near the shore and the avenues */
  grow: { R: 270, hug: 65 },
  dens: { harbour: 0.9, res: [0.95, 0.7] },
  lot: { side: 5, setback: 2.5, rear: 7, inset: 1.0, step: 3 },
  classes: { poor: [['ie-hut-garden', 0], ['ie-hut-scrap', 0]], middle: [['ie-house-uma', 0], ['ie-house-cross', 0]], rich: [['ie-house-wealthy', 0]] },
  tune: { voidMax: 45, voidIters: 18, sideSpacing: 50, interiorDepth: 9, interiorRounds: 2 },
  /* the farmland on what open ground is left (8c: sugar cane and cotton on the dry savanna, coffee upland, sweet potato) */
  farm: { cell: 24, crops: [{ crop: 'sugar cane', kind: 'field', w: 4, maxSlope: 0.12 }, { crop: 'cotton', kind: 'field', w: 3, maxSlope: 0.12 },
    { crop: 'coffee', kind: 'orchard', w: 3, minH: 180 }, { crop: 'sweet potato', kind: 'field', w: 1 }, { crop: 'coconut', kind: 'orchard', w: 1, maxH: 120 },
    { crop: 'banana', kind: 'orchard', w: 1 }] },
  aligned: [],
  fixed: [
    { marker: 'VILLAGE HALL', keys: ['ie-hall'], role: 'village hall' },
    { district: 'Funerary 1', keys: ['ie-temple'], role: 'ancestor temple' },
    /* marker A, the owner's note "caravanserai": the Islanders have none, so the guest house, a warehouse and pens */
    { marker: 'A', keys: ['ie-guesthouse', 'ie-warehouse', 'ie-pens'], role: 'caravanserai', name: 'Caravanserai', spread: 30 }
  ],
  markets: { 'Market 1': { keys: ['ie-market', 'ie-trader', 'ie-chandler', 'ie-kava-house'], gap: 8 },
    'Market 2': { keys: ['ie-market', 'ie-trader', 'ie-potter'], gap: 8 } },
  rings: [], routes: [], gates: [],
  civic: [{ key: 'ie-school', near: 'res' }, { key: 'ie-healer', near: 'res' }, { key: 'ie-granary-great', near: 'res' }, { key: 'ie-windmill', near: 'res' }],
  harbours: [
    /* the west harbour: the fishing fleet, the trade landing and the garrison's war-canoe shed */
    { district: 'harbor', shore: ['ie-quay', 'ie-fishdock', 'ie-canoeshed', 'ie-fishdock', 'ie-harbourmaster'],
      inland: [['ie-barracks', 'garrison'], ['ie-watchtower', 'garrison']],
      vessels: [['islanderOruwa', 6], ['islanderLakatoi', 2], ['islanderKarakoa', 1]], use: 'civilian', landing: true },
    /* the south harbour by Market 2: the smelter (8b: bloomeries fired with charcoal; the ingots shipped to Kautoa; the kit
       has no bloomery yet, its smithy stands for one) and the ingot store */
    { district: 'harbor 2', shore: ['ie-quay', 'ie-fishdock', 'ie-quay'],
      inland: [['ie-smithy', 'smelter'], ['ie-smithy', 'smelter'], ['ie-warehouse', 'ingot store']],
      vessels: [['islanderLakatoi', 3], ['islanderOruwa', 3], ['islanderDrua', 1]], use: 'civilian' }
  ],
  beyond: [
    { kind: 'iron mine camp', note: "the iron mining settlement in the mountains 12-18 km south-west (8b), on a kits/resources iron node, grade x1, the owner's call",
      box: [[-13000, 9000], [-5000, 17000]], minH: 700, node: 'node-iron-medium' },
    { kind: 'cart road', note: 'the cart road down from the mine camp to the harbour smelter, about 15-20 km (8b)', from: 'iron mine camp', to: 'smelter' },
    { kind: 'farms', note: 'the farms beyond the village (8b, 8c: coffee upland, sugar cane, cotton)', ring: [300, 2500], count: 25 }
  ]
};
