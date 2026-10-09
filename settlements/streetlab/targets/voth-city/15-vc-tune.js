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
  harbour: { look: 700, share: 0.5, basin: 100, ship: { len: 68, beam: 16, clear: 8, spacing: 72,
            /* the Ring Sea ships moored along it (31-vc-voth.js VC.berthShips): the odds on each side, the junks' share
               (the rest are cargo hulks), how far in from the tip and off the deck */
            moored: 0.7, junk: 0.55, tipGap: 6, berth: 1.2,
            dims: { vothJunk: { L: 46, B: 16 }, vothHulk: { L: 36, B: 16 } } } },   /* kits/ringsea's RS_VESSEL L and B */   /* a pier takes at most this share of the open water ahead, and leaves this much clear beyond its tip */
  fishGap: 26, fishClear: 9,                          /* harbour: a fishing dock in each gap of this much quay between the long piers */
  riverDockGap: 58, bargeClear: 2, bridgeBand: 20,   /* elephant bugs keep this far off a bridge's line, except on its deck */   /* a barge moors this far off its pier's head */                     /* river port: a quay every this much bank (Voth's RPIERS: 58) */
  monastery: { compound: true, compoundMax: 0.65, grid: 8, edge: 9, gap: 5, relief: 7, gateW: 18, sideGateW: 7, sideGates: 2, dorms: 6, stores: 2, pens: 2, coops: 10, fields: 30, field: [26, 44] },
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
  /* the chinampas drawn again (31b-vc-chinampa.js): a bed's top over the water (a marsh bed's lower), stakes a side,
     crop rows, the crops' shares, maize and amaranth heights, the odds of a mature bed (with the biome's trees on its
     banks: up to `trees`, crown ferns or splay shrubs, heights), of a canoe and of a plank; reeds on a marsh bed, bank
     plants a bed; the stilt hut's kit piece and its height over the water */
  chin: { top: 1.45, marshTop: 0.55, stakes: 9, rows: 4, maizeH: 1.9, amaranthH: 1.5,
          crops: { maize: 0.3, beans: 0.16, squash: 0.14, amaranth: 0.09, marigold: 0.08, greens: 0.15, seedbed: 0.08 },
          mature: 0.36, trees: 3, fernShare: 0.6, treeH: [5.5, 9], canoe: 0.08, plank: 0.05, marshReeds: 5, bankPlants: 3,
          hut: ['voth_house_poor', 4], hutY: 0.35 },
  /* the cantons' interiors (40-vc-interiors.js): the tier wall's thickness, the least storey height, the slab, the
     core (its half-width, how far off the middle toward the main door: [least, share of the narrowest tier]), the stair
     well [half-width across, half-length along], the stair house's height, halls (width; an arm off the main axis is
     at most `arm` long above the ground storey), rooms (depth, width range, the gap between), the inner walls and doors,
     the tunnels, the share of residences, each canton's purposes (room kind -> share) and the cantons left solid. The
     Ancestry's catacombs: their height, gallery width and spacing, tomb chambers [length, depth] and their share. */
  interiors: { wall: 3.2, storeyMin: 4.6, slab: 0.4, core: 10, coreOff: [28, 0.55], well: [3.4, 7], houseH: 5.2, hall: 6, arm: 46,
               start: 16, room: { d: 12, w: [10, 15], gap: 0.6 }, wallT: 0.6, doorW: 1.8, tunnelW: 5, tunnelH: 5, residence: 0.12,
               skip: ['Palace', 'Temple'],
               purposes: {
                 Arsenal: { barracks: 4, smithy: 3, armoury: 3, workshop: 2, mess: 1, office: 1, store: 2 },
                 Guild: { workshop: 5, shop: 3, store: 2, guildhall: 1, office: 1, smithy: 1 },
                 Market: { shop: 6, store: 3, tavern: 1, workshop: 2, kitchen: 1 },
                 Granary: { bakery: 3, granary: 5, kitchen: 1, office: 1, store: 1 },
                 Arena: { training: 4, mess: 1, store: 1, shrine: 1, armoury: 1 },   /* its dorms and stables are the top storey's wings (gateway) */
                 Port: { warehouse: 6, office: 1, workshop: 2, tavern: 1 },
                 Fortress: { training: 3, barracks: 3, office: 2, armoury: 1, shrine: 1 },   /* its cells are all in its dungeon (TUNE.interiors.dungeon) */
                 Foreign: { office: 4, reception: 2, library: 1, living: 2, bedroom: 2 },
                 Ancestry: { catacomb: 1 }
               },
               cata: { h: 4.6, galleryW: 4, every: 24, tomb: [9, 8], tombShare: 0.7 },
               /* the placer's grid cell (kits/interiors furnishRoom), each canton's wealth (the pieces' tiers), the cut's height over a floor */
               cell: 0.2, wealth: { Arsenal: 0.45, Guild: 0.6, Market: 0.55, Granary: 0.35, Arena: 0.4, Port: 0.35, Fortress: 0.6, Foreign: 0.85, Ancestry: 0.5 }, cutAt: 2.6, lift: 0.05,
               /* a canton whose top has its own gateway: its core under it (offsets from the canton's middle, measured off Voth's
                  arena pit entrance, 65l: the building 54 x 17 m at z -54..-71, its barred gate on its -z..+z front), the way the
                  stair arrives (toward the field), the gate's mouth, the top storey's wings by arm (2: west, 3: east) and their colours */
               gateway: { Arena: { core: [0, -62.7], axis: [0, 1], gate: [0, -52.5], wings: { 2: 'barracks', 3: 'stable' }, colours: { barracks: 0x5d7391, stable: 0xa88f50 } } },
               /* the cantons with homes among their rooms: their residences' share, and how many top storeys are all homes */
               homes: { Guild: { share: 0.5, topStoreys: 3 }, Market: { share: 0.5, topStoreys: 3 }, Granary: { share: 0.5, topStoreys: 3 } },
               /* the beasts in a stable (kits/fauna's Voth group): the room kinds that keep them, which, the odds of two to a room */
               beasts: { rooms: ['stable'], keys: ['arena-tiger', 'pit-lizard', 'giant-beetle', 'staghorn-beetle'], pair: 0.45 },
               /* dungeons under a canton's ground storey: its height and its rooms; how much darker it is drawn */
               dungeon: { Fortress: { h: 5.2, purposes: { cell: 8, office: 1, store: 1, armoury: 1 } } }, dungeonDark: 0.55,
               /* the lamps (56-vc-interiors-host.js): how far under the ceiling, their spacing down a hall, their colour, and the pool of
                  point lights that follows the camera: how many, their reach and strength, how near a lamp must be to take one */
               lamps: { drop: 0.45, hallEvery: 10, color: 0xffc27a, pool: 8, range: 16, intensity: 1.6, reach: 120 } },
  /* the walker (58-vc-tools.js): the highest step it takes up, the greatest drop it steps off, its radius and height */
  walk: { step: 0.7, drop: 1.4, r: 0.35, h: 1.7 },
  /* the weather (core/atmos ATMOS.weather, with its ash modes; 55-vc-host.js VC.applyHour): the mode it opens in, how
     far each closes the fog in (fogK, rainK, ashK of the way to closeFar metres), how much each dims the sun, the ash
     haze and the lightning's colours and kick, and the volcano's odds of a large or small eruption each quarter hour */
  weather: { mode: 'clear', fogK: 0.93, rainK: 0.55, ashK: 0.97, closeFar: 420, rainSun: 0.55, fogSun: 0.3, ashSun: 0.8,
             ashFog: 0x6b5d49, flash: 0xffd8b8, flashHemi: 1.4, eruptLarge: 0.05, eruptSmall: 0.3 },
  /* a market pitch (30-vc-site.js VC.marketPitch): the share left as goods on the ground, the odds of stock on each side
     of a stall, how far out to the side and how far back and forth it sits, and the stock it draws from */
  market: { ground: 0.2, stock: 0.75, side: 3.1, back: 1.0, goods: ['generic_crate', 'generic_basket', 'generic_sack', 'generic_storage_jar', 'generic_barrel'] },
  /* the Temple's dressing (31-vc-voth.js VC.templeDress): Voth's temple colours (65d: blood red, its dark, matte gilt), how
     near a side a bridge or flight must come to cut the trim, banner drop and spacing, the fire pylons' height, the crown */
  /* gold on a canton's capture redrawn as metal (31-vc-voth.js VC.regild): its hue range, least saturation and value, the lift */
  regild: { hue: [36, 58], sat: 0.45, value: 0.5, colour: 0xc99a32 },   /* the gold: warm, a touch deeper than the Palace's 0xd0a53c */
  domeGap: 0.6,   /* air under a captured dome that earns it a drum (31-vc-voth.js VC.domeDrums) */
  dress: {
    Temple: { trim: true, banners: true, pylons: true, crown: true, red: 0xa8241c, dark: 0x4a0e0a, gold: 0xc9a227, banner: 0xa8241c, fire: [1.0, 0.45, 0.12], flame: 0xf07a1e,
              keepBand: 10, bannerH: 9, bannerEvery: 16, pylonH: 7.5, obeliskEvery: 14, obeliskH: 8 },
    /* the Fortress (owner, 2026-10-09): black and dark grey all over (grey: the linear range its colours map into), green
       and gold banners, a green fire on each corner tower at night */
    Fortress: { banners: true, towerFires: true, banner: 0x1e6b3c, gold: 0xc9a227, fire: [0.25, 1.0, 0.35], flame: 0x3cff6a, fireScale: 3, grey: [0.006, 0.09],
                keepBand: 10, bannerH: 10, bannerEvery: 18, cornerShare: 0.72 }
  },
  /* the house of healing (30-vc-site.js VC.placeHealing, 31-vc-voth.js VC.healingModel): its half-width with its plinth's
     steps, the margin kept round it, how far from its marker it may move, how far its wall may stand from the avenue it
     fronts, the steepest relief its plinth takes, the forecourt's width, the lanterns' and cots' spacing */
  healing: { half: 66, pad: 4, reach: 420, front: 60, relief: 5, forecourt: 12, lampEvery: 9, cotEvery: 3.4 },
  /* the Ring Sea vessels (55-vc-host.js): the model each ferry line runs (the moored ones are VC.MOOR's) */
  vessels: { ferry: 'vothFerry' },
  /* park and plaza furniture (39-vc-furnish.js): bench spacing and inset along a park's edges, the areas that earn a
     shrine, corner statues and an obelisk, the plaza's ring of benches round its fountain, the pocket greens' odds */
  parkFurn: { benchEvery: 24, benchInset: 4, shrineInset: 6, cornerInset: 9, statueArea: 20000, statues: 3, shrineArea: 8000, obeliskArea: 70000,
              gap: 1.5, fountain: 4, plazaR: 10, plazaBenches: 8, pocketBench: 0.7, pocketStatue: 0.25, plazaBench: 0.5, pocketInset: 1.4, pocketFountain: 2.2,
              /* the big parks' walks and groves (VC.parkWalks, VC.parkGroves): the area that earns them, the walk's width and
                 the clearance kept from it, the edges long enough to reach and how many, the ring round the middle (radius,
                 segments, benches), lantern, bench and avenue-tree spacing, the trees' offset from the walk and from each
                 other, the cherry's share, the grove lattice and its inset, and the mix of what stands at each lattice point */
              walkArea: 15000, walkW: 3.2, walkGap: 0.4, walkEdge: 30, walks: 4, ringR: 14, ringN: 16, ringBenches: 6,
              lampEvery: 20, walkBench: 26, treeEvery: 12, treeOff: 4.5, treeGap: 6, cherry: 0.6, groveEvery: 30, groveInset: 10,
              grove: { grove: 0.45, garden: 0.25, hearth: 0.14, well: 0.06 }, walkTone: '#b9aa86' },
  /* the swbay biome (38-vc-flora.js): its mask grid, the clearances round what is built, the LOD spine's spacing, the
     build's disc and quality, the climate a park and the environs hand the kit, how far the crowns follow the ceiling */
  flora: { half: 3900, cell: 4, lotPad: 2, roadPad: 2, landmarkClear: 18, spine: 700, spineCountry: 1000, R: 3900, quality: 0.4,
           park: { wet: 0.8, upland: 0.16 }, sav: { wet: 0.2, upland: 0.72 }, crownK: 0.6,
           /* the plants the city places itself (55-vc-host.js VC.floraPlace): tree heights by species, the share of
              Voth's bed-cover blobs that become a plant, and the mix of plants they become */
           placed: { H: { cherry: [5.5, 8.5], dragon: [6, 10], baobab: [11, 15] }, groundKeep: 0.7,
                     ground: { shrub: 0.4, fern: 0.22, moss: 0.14, blooms: 0.12, splaylet: 0.12 },
                     /* the parks' gardens and the beds round their groves (39-vc-furnish.js) */
                     garden: { blooms: 0.34, shrub: 0.28, fern: 0.16, rosette: 0.12, splaylet: 0.1 } } },
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
    moreFarms: { farmGrid: 210, trackReach: 700, fieldsPerFarm: [5, 9], fieldGrid: 75,
                 alignReach: 160,                        /* a field squares to the nearest road this close, else lies as it falls */
                 mush: { n: 6, apart: 140, edge: 30 } },  /* mushroom farms among them (TUNE.country.mush otherwise) */
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
    /* the canton interiors' rooms (36-vc-census.js): [workplaces, residents, kind of work] per room kind, and the kinds of
       work a canton calls by its own name */
    rooms: { barracks: [8, 8, 'soldiers'], smithy: [4, 0, 'smiths and craftsmen'], armoury: [3, 0, 'armourers and quartermasters'], workshop: [4, 0, 'smiths and craftsmen'],
             mess: [4, 0, 'cooks and bakers'], kitchen: [3, 0, 'cooks and bakers'], bakery: [4, 0, 'cooks and bakers'], office: [3, 0, 'clerks and officials'],
             store: [1, 0, 'porters and warehousemen'], warehouse: [3, 0, 'porters and warehousemen'], granary: [1, 0, 'granary keepers and millers'],
             shop: [3, 0, 'shopkeepers and assistants'], tavern: [5, 0, 'innkeepers and servers'], guildhall: [6, 0, 'guild masters and journeymen'],
             training: [3, 0, 'drill masters and trainers'], stable: [2, 0, 'grooms and beast keepers'], shrine: [1, 0, 'shrine keepers'], cell: [0.5, 1, 'jailers'],
             reception: [2, 0, 'envoys and embassy staff'], library: [2, 0, 'scribes and librarians'], living: [0, 6, ''], cottage: [0, 8, ''], bedroom: [0, 2, ''],   /* a canton home is a family's apartment, often three generations */
             catacomb: [0.3, 0, 'necropolis keepers'], tomb: [0.2, 0, 'necropolis keepers'],
             byCanton: { Arena: { barracks: 'gladiators and arena keepers', training: 'gladiators and arena keepers' }, Fortress: { barracks: 'Ordinator garrison', training: 'Ordinator garrison', office: 'Ordinator garrison' },
                         Foreign: { office: 'envoys and embassy staff' }, Guild: { workshop: 'guild masters and journeymen', smithy: 'guild masters and journeymen' }, Arsenal: { workshop: 'armourers and quartermasters' } } },
    jobs: { shop: 4, craft: 5, tavern: 6, warehouse: 10, industrial: 15, power: 130, rich: 2, manor: 8, clanService: 6, garrison: 240, barracks: 90, school: 8, guild: 14, customs: 22,
            healing: 45, funeraryTemple: 18, shrine: 3, lighthouse: 4, pier: 30, riverQuay: 14, fishDock: 10, stall: 2,
            mill: 3, watermill: 4, ranch: 8, mushFarm: 6, perHectare: 1.0, chinampaBed: 0.6, treesPerHand: 40, mine: 40, quarry: 50, granary: 5, embassy: 20, ferry: 3, ferryStop: 2, bug: 3, bugStation: 4 }
  },
  /* the rim cantons' decks (33-vc-country.js VC.cantonDecks): usable square inside the parapets, layout grid, gaps */
  decks: { capturedPad: 1.5, capturedH: 14, port: { cart: 6, deck: 40, quayDepth: 20 }, granaryMills: 3, mill: 13, use: 0.82, grid: 4, gap: 4, obelisk: 9, granaries: 9, yard: 0.3, square: 0.42, embassy: [30, 26], embassySize: { Hykkousoi: [27, 27], Iziz: [37, 35], Republic: [37, 35], Dalab: [31, 29], Yuni: [37, 35], Jimjam: [32, 30] },
           embassies: ['Hykkousoi', 'Iziz', 'Jimjam', 'Republic', 'Dalab', 'Yuni'], fill: { Granary: 6, Arsenal: 8, Market: 16, Foreign: 6 } },
  station: { roadReach: 160, gap: 2, laneHalf: 11, platGap: 2, layLen: 56, taper: 34, forecourt: 10 },   /* an elephant bug lay-by: 22 m wide, 56 m straight beside the platform */
  bugAwning: 0xd9792b, beaconOpacity: 0.55, navCell: 10, navHalf: 4200, navFree: 60, navFreeBug: 22, berthClear: 14, causewayClear: 8, bugWade: 4.5, bugSink: 2.5, bugScale: 0.5,   /* the elephant bug at half Voth's size (owner, 2026-10-09: it towered over the buildings); its wading depth and sink halved with it */ portEdge: 3900, timeScale: 6,
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
