/* ============================== 2. TUNING: THE VOTH CITY ============================== */
/* [G data] The street method of the toy (src/), run on the owner's site (site/voth-site.json) over Voth's own ground.
   Every number the passes read. x east, z south (north is -z), metres, Voth's frame. */
var TUNE = {
  cell: 2.5, rasterHalf: 2480,          /* the raster covers the build zone: +-2.48 km at 2.5 m */
  groundCell: 10,                       /* the edited ground, sampled once for the street passes */
  maxSlope: 0.4,                        /* steeper ground (about 22 degrees) is left open: no lots, no streets */
  width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
  lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 },
  ringGap: 8,                           /* park / market edge to its encircling avenue's kerb */
  avenueSnap: 90,                       /* an avenue end this close to another avenue joins it */
  causewaySnap: 170,                    /* ...or this close to a causeway's landing */
  /* highways (owner, 2026-10-08): bearing in degrees anticlockwise from east, as seen on the map (north up) */
  highways: [
    { name: 'E-NE', deg: 22.5 },
    { name: 'E along the river', deg: -12, river: true },
    { name: 'NW along the bay', deg: 135, shore: true, via: 'S10' },
    { name: 'S', deg: -90 },
    { name: 'SW', deg: -135, via: 'S11' }
  ],
  highwayReach: 5000,
  verge: 7,                             /* open ground either side of a highway: no lot stands on it */
  viaNear: [36, 60],                    /* a highway passes this far (m) from a station it must come by */
  bridgeApproach: 26, bridgeSnap: 260,  /* a river bridge's end runs on this far, then to an avenue this close */
  embank: { top: 1.3, deepest: -5, core: 10, feather: 10, slope: 0.45 },   /* an avenue drawn into shallow water gets a bank */
  wall: { towerGap: 125, clear: 28, gateFind: 170, thick: 7, gateTower: 14, gatePass: 4, padMargin: 3, padSpread: 1.5, padSlope: 0.6 },   /* pad*: a gate on a slope gets a level pad (VC.levelGate) */
  civic: [
    { key: 'voth_school', v: 0, near: 'res' },
    { key: 'voth_school', v: 1, near: 'res' },
    { key: 'voth_bldg_guild_hall', v: 0, near: 'industry' },
    { key: 'voth_city_customs_house', v: 0, near: 'harbor' },
    { key: 'voth_barracks', v: 0, near: 'garrison' },
    { key: 'voth_barracks', v: 1, near: 'gate' },
    { key: 'voth_tavern_b', v: 1, near: 'riverport' }
  ],
  civicSpacing: 160,
  voidMax: 46, voidIters: 70, voidBatch: 16,
  sideSpacing: 48, sideMax: 240, alleyFrac: 0.25, blindMax: 110,
  interiorDepth: 9, interiorRounds: 8,
  suburbVacancy: 0.4,                   /* outside the wall: this share of frontage is left open */
  harbour: { look: 700, share: 0.5, basin: 100, ship: { len: 68, beam: 16, clear: 8, spacing: 72 } },   /* a pier takes at most this share of the open water ahead, and leaves this much clear beyond its tip */
  fishGap: 26, fishClear: 9,                          /* harbour: a fishing dock in each gap of this much quay between the long piers */
  riverDockGap: 58, bargeClear: 2, bridgeBand: 20,   /* elephant bugs keep this far off a bridge's line, except on its deck */   /* a barge moors this far off its pier's head */                     /* river port: a quay every this much bank (Voth's RPIERS: 58) */
  monastery: { grid: 8, edge: 9, gap: 5, relief: 7, gateW: 18, sideGateW: 7, sideGates: 2, dorms: 6, stores: 2, pens: 2, coops: 10, fields: 30, field: [26, 44] },
  /* power and light (37-vc-light.js; owner, 2026-10-09): Voth's power houses stand in the industry district; electric light
     reaches the industry district, the guilds, the clan compounds and wealthy houses within `reach` of a power house, and
     the Palace and Temple interiors, and little else. Everywhere else is lit by lanterns and torches: a fancy lantern
     post in the wealthy streets and on the cantons, a plain lantern post elsewhere, torches in the alleys and poor quarters. */
  power: { houses: [['voth_generator', 0], ['voth_generator', 1]], gap: 90, look: 60, reach: 650 },
  light: {
    every: { avenue: 30, main: 34, side: 40, alley: 26 },   /* a socket every this many metres of street, sides alternating */
    /* the evening (core/atmos glows): each lamp's on and off hours, drawn in these windows (off past 24 is next morning):
       electric switched at once, lanterns lit one by one, torches burnt out before dawn */
    hours: { electric: [[18, 18], [30, 30]], fancy: [[17.6, 18.3], [29.6, 30.3]], lantern: [[17.8, 18.8], [29.2, 30.2]], torch: [[18, 19.2], [28.4, 29.8]] },
    halo: { electric: 9, fancy: 7, lantern: 6, torch: 6 },
    curb: 0.7, junction: 4, slide: [0, 4, -4, 8, -8, 12, -12], fancy: 0.62, torch: 0.25, deckEvery: 24, deckInset: 2.5,
    glow: { electric: 0xe9f1ff, fancy: 0xffd27a, lantern: 0xffc060, torch: 0xff8a2c }
  },
  /* the clock (core/clock KCLOCK, a 72-minute day): the hour it opens at, whether it runs, the speeds offered, the
     day of the year for the sun (Voth's equinox) */
  clock: { hour: 10, running: true, speeds: [1, 2, 4, 8], doy: 80 },
  /* park and plaza furniture (39-vc-furnish.js): bench spacing and inset along a park's edges, the areas that earn a
     shrine, corner statues and an obelisk, the plaza's ring of benches round its fountain, the pocket greens' odds */
  parkFurn: { benchEvery: 24, benchInset: 4, shrineInset: 6, cornerInset: 9, statueArea: 20000, statues: 3, shrineArea: 8000, obeliskArea: 70000,
              gap: 1.5, fountain: 4, plazaR: 10, plazaBenches: 8, pocketBench: 0.7, pocketStatue: 0.25, plazaBench: 0.5, pocketInset: 1.4, pocketFountain: 2.2 },
  /* the swbay biome (38-vc-flora.js): its mask grid, the clearances round what is built, the LOD spine's spacing, the
     build's disc and quality, the climate a park and the environs hand the kit, how far the crowns follow the ceiling */
  flora: { half: 3900, cell: 4, lotPad: 2, roadPad: 2, landmarkClear: 18, spine: 700, spineCountry: 1000, R: 3900, quality: 0.4,
           park: { wet: 0.8, upland: 0.16 }, sav: { wet: 0.2, upland: 0.72 }, crownK: 0.6 },
  /* clan compounds (33-vc-country.js, after the avenues): one per `per` square metres of their districts, fronting the avenues first */
  clan: { keys: ['voth_clan_compound_b', 'voth_bldg_clan_compound'], per: 14000, perMin: 7, max: 40, grid: 10, front: 14, setback: 2, spill: 6, gap: 8, relief: 7 },
  country: {
    relief: 5, fieldRelief: 9, bigFarm: 0.35, laneSlope: 0.22, stationClear: 34,
    suburbDirs: [-90, -45, 45], suburbSpread: 40, fade: 1100, suburbMin: 0.08, suburbBoost: 1.3,
    laneEvery: [45, 85], laneLen: [110, 260], houseGap: [3, 9], vacancy: 0.15, garden: 0.45,
    suburbMix: { poor: 0.5, middle: 0.26, craft: 0.12, shop: 0.06, tavern: 0.02, industrial: 0.04 },
    farmEvery: [70, 140], track: [40, 220], fieldsPerFarm: [4, 8], trackFields: 7, field: [55, 140],
    mills: { perFarm: 0.33, near: [25, 55], village: [70, 160], clear: 14 },   /* windmills: share of farmsteads with one, how far off, clear circle */
    mush: { n: 12, grid: 30, half: 26, edge: 10, slope: 0.32, relief: 9, apart: 60, trackReach: 700 },   /* mushroom farms in the 'mush farm' polygon */
    watermills: { n: 8, start: 600, every: 320, back: 10, trackReach: 700 },   /* along the river beyond the city */
    ranches: { perFarm: 0.2, near: [40, 80] },                                    /* beetle ranches beside farmsteads */
    roadsFor: ['S12'], roadReach: 2400, fishReach: 420,
    mines: { n: 8, grid: 40, minH: 25, slope: [0.3, 1.3], apart: 230, trackReach: 900, houses: 4 },
    quarries: { n: 4, grid: 30, rim: 60, slope: [0.05, 0.32], apart: 240, trackReach: 900, houses: 4 },
    moreFarms: { farmGrid: 210, trackReach: 700, fieldsPerFarm: [5, 9], fieldGrid: 75 },
    village: { at: [{ id: 'S10', lanes: 8, laneLen: [110, 210], gap: [2, 5], fish: 4 }, 'S11', 'S12'], greenFrom: 64, green: 16, laneOff: 70, lanes: 5, laneLen: [80, 150], gap: [2, 7], vacancy: 0.12, fields: 18, fieldRing: [150, 380],
               mix: { poor: 0.6, middle: 0.24, craft: 0.1, shop: 0.04, tavern: 0.02 } },
    /* the ridge west of the city (top ~230 m at -2400, 200, running south to -1800, 1300): its slopes toward the city */
    orchard: { poly: [[-2650, -650], [-1750, -650], [-1550, 600], [-1300, 1550], [-1900, 1750], [-2350, 1200], [-2650, 500]], step: 4, space: 10, terrace: 7.5, minH: 6, maxH: 215, slope: [0.08, 0.6], maxTrees: 12000 }
  },
  /* the lines' timetables: a vehicle per `headway` seconds of the round, `berths` at a stop, queue spacing */
  transit: { strider: { headway: 480, berths: 1, berthSide: 0, queueGap: 50 }, ferry: { headway: 240, berths: 2, berthSide: 7, queueGap: 30 } },
  ferryBerth: 6, ferryPierMin: 34, landingReach: 160, ferrySnap: 140, ferryPierMax: 320, cantonPierInset: 14,
  /* the census (36-vc-census.js): residents per home and institution, jobs per workplace, the share of residents
     who work (a pre-industrial city: children, the old and the sick are about half) */
  census: {
    workingShare: 0.5,
    /* the Voth cantons' staffs: [workplaces, kind of work] */
    cantons: { Palace: [150, 'palace household and officials'], Temple: [100, 'temple priests and servants'], Guild: [400, 'guild masters and journeymen'],
               Arena: [60, 'arena keepers and fighters'], Fortress: [300, 'Ordinator garrison'], Ancestry: [30, 'necropolis keepers'], Port: [80, 'dockers and stevedores'] },
    live: { poor: 7, middle: 5, rich: 6, manor: 14, shop: 5, craft: 6, tavern: 4, clan: 40, farm: 8, bigFarm: 18, garrison: 220, barracks: 90, monkPerDorm: 30 },
    jobs: { shop: 4, craft: 5, tavern: 6, warehouse: 10, industrial: 15, power: 130, rich: 2, manor: 8, clanService: 6, garrison: 240, barracks: 90, school: 8, guild: 14, customs: 22,
            healing: 45, funeraryTemple: 18, shrine: 3, lighthouse: 4, pier: 30, riverQuay: 14, fishDock: 10, stall: 2,
            mill: 3, watermill: 4, ranch: 8, mushFarm: 6, perHectare: 1.0, chinampaBed: 0.6, treesPerHand: 40, mine: 40, quarry: 50, granary: 5, embassy: 20, ferry: 3, ferryStop: 2, bug: 3, bugStation: 4 }
  },
  /* the rim cantons' decks (33-vc-country.js VC.cantonDecks): usable square inside the parapets, layout grid, gaps */
  decks: { port: { cart: 6, deck: 40, quayDepth: 20 }, granaryMills: 3, mill: 13, use: 0.82, grid: 4, gap: 4, obelisk: 9, granaries: 9, yard: 0.3, square: 0.42, embassy: [30, 26], embassySize: { Hykkousoi: [27, 27], Iziz: [37, 35], Republic: [37, 35], Dalab: [31, 29], Yuni: [37, 35], Jimjam: [32, 30] },
           embassies: ['Hykkousoi', 'Iziz', 'Jimjam', 'Republic', 'Dalab', 'Yuni'], fill: { Granary: 6, Arsenal: 8, Market: 16, Foreign: 6 } },
  station: { roadReach: 160, gap: 2, laneHalf: 11, platGap: 2, layLen: 56, taper: 34, forecourt: 10 },   /* an elephant bug lay-by: 22 m wide, 56 m straight beside the platform */
  bugAwning: 0xd9792b, beaconOpacity: 0.55, navCell: 10, navHalf: 4200, navFree: 60, navFreeBug: 22, berthClear: 14, bugWade: 9, bugSink: 5, portEdge: 3900, timeScale: 6,
  classes: {
    rich:   [['voth_house_rich', 0], ['voth_house_rich', 1], ['voth_house_rich', 2], ['voth_house_rich', 3], ['voth_house_rich', 4], ['voth_bldg_townhouse', 0], ['voth_bldg_townhouse', 2]],
    manor:  [['voth_manor', 0], ['voth_manor', 1], ['voth_manor', 2]],
    middle: [['voth_house_middle', 0], ['voth_house_middle', 1], ['voth_house_middle', 2], ['voth_house_middle', 3], ['voth_house_middle', 4], ['voth_bldg_townhouse', 1], ['voth_bldg_townhouse', 3]],
    poor:   [['voth_house_poor', 0], ['voth_house_poor', 1], ['voth_house_poor', 2], ['voth_house_poor', 3], ['voth_house_poor', 4]],
    shop:   [['voth_shop_alchemist', 0], ['voth_shop_alchemist', 1], ['voth_shop_clothier', 0], ['voth_shop_clothier', 1], ['voth_shop_trader', 0], ['voth_shop_trader', 1],
             ['voth_shop_scribe', 0], ['voth_shop_scribe', 1], ['voth_shop_enchanter', 0], ['voth_shop_enchanter', 1], ['voth_shop_provisioner', 0], ['voth_shop_provisioner', 1]],
    craft:  [['voth_shop_smithy', 0], ['voth_shop_smithy', 1], ['voth_shop_smithy', 0], ['voth_shop_smithy', 1], ['voth_shop_potter', 0], ['voth_shop_potter', 1], ['voth_shop_clothier', 0], ['voth_shop_enchanter', 1]],
    tavern: [['voth_tavern_b', 0], ['voth_tavern_b', 1], ['voth_tavern_b', 2], ['voth_bldg_tavern', 0]],
    /* not voth_city_shed (owner, 2026-10-09: the old orange-roofed warehouse has no doors or windows) */
    /* not voth_generator: the power houses are placed on purpose in the industry district (TUNE.power, 37-vc-light.js) */
    industrial: [['voth_warehouse_b', 0], ['voth_warehouse_b', 1], ['voth_bldg_warehouse', 0]],
    warehouse:  [['voth_warehouse_b', 0], ['voth_warehouse_b', 1], ['voth_bldg_warehouse', 0]],
    farm:       [['voth_city_farmstead', 0], ['voth_farmhouse', 0], ['voth_farmhouse', 1]]
  },
  fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', craft: 'poor', tavern: 'shop', industrial: 'poor', warehouse: 'industrial', poor: null },
  plazaArt: { rich: ['voth_city_statue', 'voth_city_obelisk'], middle: ['fountain'], poor: ['voth_city_monastery_well', 'fountain'], commerce: ['fountain', 'voth_city_statue'] }
};

OCC.VERGE = 8;                          /* a highway's verge: streets cross it, lots do not stand on it */

/* kit footprints (core/city: SL.KIT, SL.dims) */
SL.KIT = {};
SL.dims = function (key, v) {
  var k = key + '|' + (v || 0);
  if (SL.KIT[k]) return SL.KIT[k];
  var A = (typeof ASSET_BY_KEY !== 'undefined') ? ASSET_BY_KEY[key] : null;
  if (!A) return null;
  var d = entryDims(A, v || 0);
  return (SL.KIT[k] = { key: key, v: v || 0, w: d.w, d: d.d, h: d.h, family: A.family });
};

/* the ground the street passes read: the site's edited ground (Voth's terrainH + the owner's strokes), sampled
   once on a groundCell grid (SL.ground, 30-vc-site.js) and read bilinearly; Voth's analytic ground beyond it */
SL.pads = [];
function baseH(x, z) {
  var G = SL.ground;
  if (!G) return TERR.h(x, z);
  var fx = (x + G.half) / G.c, fz = (z + G.half) / G.c, i = Math.floor(fx), j = Math.floor(fz);
  if (i < 0 || j < 0 || i >= G.n - 1 || j >= G.n - 1) return TERR.h(x, z);
  var u = fx - i, v = fz - j, H = G.h, k = j * G.n + i;
  return (H[k] * (1 - u) + H[k + 1] * u) * (1 - v) + (H[k + G.n] * (1 - u) + H[k + G.n + 1] * u) * v;
}
function terrainH(x, z) { return baseH(x, z); }
function addPad(o) { var C = obbCorners(o), h = baseH(o.c[0], o.c[1]); C.forEach(function (p) { h += baseH(p[0], p[1]); }); return h / 5; }
function baseY(o) { var C = obbCorners(o), y = terrainH(o.c[0], o.c[1]); C.forEach(function (p) { y = Math.min(y, terrainH(p[0], p[1])); }); return y - 0.15; }
