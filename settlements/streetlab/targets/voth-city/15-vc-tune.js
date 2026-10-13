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
  power: { houses: [['voth_generator', 0], ['voth_bldg_power_station', 0]],   /* the small fumarole house (voth_generator v1) gave way to the power station (owner, 2026-10-12: "make a larger power house") */
           gap: 90, look: 60, reach: 650 },
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
  clock: { hour: 10, running: true, speeds: [1, 2, 4, 8, 20, 60], doy: 80 },   /* 20x and 60x: the test clock (phase C: a day in 3.6 or 1.2 minutes) */
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
  /* every building's interior (41-vc-building-interiors.js VC.IX, phase A of SIM-ROADMAP.md): the residence rule (per `per`
     residents one bed, one item store and one food store; a bunk counts as two beds), the storey height a shell is cut into
     and the most storeys, how a shell is read off a kit model (the main block: spans head height `head`, at least `minArea`
     m2 and `minSide` m thick, standing within `base` m of the ground (a hut on piles, a farmhouse on its yard's platform); else a fallback `fallback` of the model's footprint),
     the placer's cell, the programmes (lot class -> room kinds per storey, the last repeated upward; `key` matches a kit
     key first), the room kinds that are homes and the ones that are work, the density overlay's cell, and the overrides
     of shells the reading gets wrong ({ key|v|slot: { poly: [[x, z], ...] local, y, h } or { skip: why } }) */
  ix: { per: 2, storeyH: 3.3, maxStoreys: 4, head: 2.6, minArea: 12, minSide: 3, base: 2.5, fallback: 0.6, wall: 0.25, cell: 0.25, slab: 0.25,
        wealth: { poor: 0.15, middle: 0.45, rich: 0.75, manor: 0.9, shop: 0.5, craft: 0.5, tavern: 0.5, clan: 0.9, farm: 0.3, civic: 0.6,
                             warehouse: 0.35, industrial: 0.3, landmark: 0.6, monastery: 0.3, shrine: 0.55, lighthouse: 0.4, funerary: 0.7, 'chinampa hut': 0.15, healing: 0.5 },
        /* a home's bedrooms are `chamber`s (VC.ixPrograms): a bed and a chest, and as many more beds and stores as the room holds */
        programmes: {
          poor:       [['cottage', 'chamber'], ['chamber', 'chamber']],
          middle:     [['living', 'kitchen'], ['chamber', 'chamber']],
          rich:       [['hall', 'kitchen', 'living'], ['chamber', 'chamber', 'study']],
          manor:      [['hall', 'kitchen', 'living', 'study'], ['chamber', 'chamber', 'chamber']],
          clan:       [['clanshrine', 'hall', 'kitchen', 'living'], ['chamber', 'chamber', 'chamber']],   /* the clan's own shrine (owner, 2026-10-12) */
          farm:       [['living', 'kitchen', 'store'], ['chamber', 'chamber']],
          shop:       [['shop', 'store'], ['living', 'chamber']],
          craft:      [['workshop', 'store'], ['living', 'chamber']],
          tavern:     [['alehouse', 'kitchen'], ['chamber', 'chamber']],
          warehouse:  [['warehouse', 'office'], ['warehouse']],
          industrial: [['factory', 'store'], ['factory']],
          civic:      [['hall', 'office'], ['office', 'store']],
          landmark:   [['drillhall', 'mess', 'armoury'], ['dormitory', 'dormitory']]
        },
        /* a one-storey building of a class: its programme in one (the family's rooms behind the shop, as Mav's Refuge's) */
        single: {
          poor: ['cottage', 'chamber'], middle: ['living', 'chamber', 'kitchen'], rich: ['hall', 'chamber', 'kitchen', 'chamber'], manor: ['hall', 'chamber', 'kitchen', 'chamber', 'study', 'chamber'],
          clan: ['clanshrine', 'chamber', 'kitchen', 'chamber', 'chamber'],   /* the small compound: its hall is its shrine room */ farm: ['living', 'chamber', 'kitchen', 'store'], shop: ['shop', 'cottage'], craft: ['workshop', 'cottage'],
          tavern: ['alehouse', 'kitchen', 'chamber'], voth_shop_smithy: ['smithy', 'cottage']
        },
        chamber: { beds: 4, stores: 2 },
        byKey: {
          voth_bldg_temple_ash: [['nave', 'shrine', 'store']], voth_bldg_temple_tide: [['nave', 'shrine', 'store']], voth_bldg_village_chapel: [['nave']], voth_bldg_village_shrine: [['nave']],
          voth_shop_smithy: [['smithy', 'store'], ['living', 'chamber']],
          voth_barracks: [['drillhall', 'mess', 'armoury'], ['dormitory', 'dormitory']],
          voth_garrison: [['drillhall', 'mess', 'armoury'], ['dormitory', 'dormitory']],
          voth_school: [['school', 'office'], ['library', 'study']],
          voth_bldg_guild_hall: [['guildhall', 'counting'], ['counting', 'store']],
          voth_city_customs_house: [['counting', 'warehouse'], ['counting', 'store']],
          voth_tavern_b: [['alehouse', 'kitchen'], ['chamber', 'chamber']],
          voth_generator: [['enginehall', 'store'], ['enginehall']],
          voth_bldg_power_station: [['enginehall', 'enginehall', 'store'], ['enginehall', 'enginehall']],
          voth_mustering_grounds: null,
          /* the citizen simulation's buildings (kits/catalog/krator-master-buildings-voth.js, each with its own `ix` shell) */
          voth_bldg_watchhouse: [['guardroom', 'armoury'], ['guardroom', 'dormitory']],
          voth_bldg_caravanserai: [['alehouse', 'kitchen', 'stable'], ['chamber', 'chamber', 'chamber', 'chamber']],
          voth_bldg_coastguard_berth: [['guardroom', 'armoury', 'store'], ['guardroom', 'office']],
          voth_bldg_weaver: [['weaving', 'store'], ['living', 'chamber']],
          voth_bldg_tannery: [['tanyard', 'store']],
          voth_bldg_brewery: [['brewhouse', 'store', 'tavern'], ['store', 'office']],
          voth_bldg_butcher: [['shop', 'butchery'], ['living', 'chamber']],
          voth_bldg_bakery: [['bakery', 'shop'], ['living', 'chamber']]
        },
        /* the kit models no lot draws yet, planned as [key, lot class] so the report shows what each holds (VC.ixKitCheck) */
        kitCheck: [['voth_bldg_watchhouse', 'civic'], ['voth_bldg_caravanserai', 'tavern'], ['voth_bldg_coastguard_berth', 'civic'], ['voth_bldg_weaver', 'craft'],
                   ['voth_bldg_tannery', 'industrial'], ['voth_bldg_brewery', 'industrial'], ['voth_bldg_butcher', 'shop'], ['voth_bldg_bakery', 'shop']],
        home: ['cottage', 'bedroom', 'chamber', 'living', 'dormitory', 'hall', 'kitchen'],
        /* a work post (the job table's posts): a piece of these kinds in a work room, and these in rooms of a kind (a store's shelves,
           a ward's cots, a shrine's altar, a tomb's sarcophagus) */
        posts: ['counter', 'workstation', 'loom', 'desk', 'stove', 'rack', 'anvil', 'forge', 'stall', 'tool'],
        postsIn: { store: ['storage', 'stack'], warehouse: ['storage', 'stack'], ward: ['bed', 'table'], shrine: ['altar', 'shrine'], tomb: ['tomb'],
                   brewhouse: ['storage'], tanyard: ['storage'], weaving: ['storage'], butchery: ['table', 'food'], alehouse: ['table'], stable: ['pen', 'rack'], drillhall: ['weapon'], guardroom: ['weapon', 'table'] },
        /* the buildings off the lots (VC.ixSites): programme per storey, storeys (else from the height), class, residents (a
           TUNE.census.live key) and kind of work [label, TUNE.census.jobs or .live key] as the census counts them. The chinampa
           huts' growers are not housed by the census (it counts their jobs only): the huts' beds are reported as room to spare */
        sites: {
          dorm:       { prog: [['dormitory', 'dormitory'], ['dormitory', 'dormitory']], storeys: 2, cls: 'monastery', live: 'monkPerDorm', job: ['monks and lay brothers (chapel, fields, coops)', 'monkPerDorm'] },
          chapel:     { prog: [['shrine']], storeys: 1, cls: 'monastery' },
          hall:       { prog: [['mess', 'kitchen'], ['library', 'study'], ['study', 'store']], storeys: 3, cls: 'monastery' },
          shrine:     { prog: [['shrine']], storeys: 1, cls: 'shrine', job: ['shrine keepers', 'shrine'] },
          lighthouse: { prog: [['store', 'office'], ['store'], ['study'], ['store']], cls: 'lighthouse', job: ['lighthouse keepers', 'lighthouse'] },
          keeper:     { prog: [['cottage']], storeys: 1, cls: 'lighthouse' },
          funerary:   { prog: [['shrine', 'tomb', 'store'], ['office', 'tomb', 'shrine']], storeys: 2, cls: 'funerary', job: ['priests and undertakers', 'funeraryTemple'] },
          hut:        { prog: [['cottage']], storeys: 1, cls: 'chinampa hut' }
        },
        dining: ['living', 'hall', 'kitchen', 'cottage', 'tavern', 'mess', 'clanshrine'],
        work: ['shop', 'workshop', 'smithy', 'store', 'warehouse', 'office', 'tavern', 'kitchen', 'mess', 'armoury', 'barracks', 'school', 'library', 'guildhall', 'study', 'ward', 'shrine', 'nave', 'clanshrine', 'tomb', 'bakery', 'brewhouse', 'weaving', 'tanyard', 'butchery',
               'factory', 'enginehall', 'drillhall', 'guardroom', 'alehouse', 'counting', 'stable'],
        density: { cell: 50, hatch: '#d24b3a' },
        shells: {} },
  /* phase B of SIM-ROADMAP.md (42-vc-sim-places.js): the buildings the simulation needs placed, the wells, every building
     and open place as a core/simulation place.
     - place: the new kit models (kits/catalog/krator-master-buildings-voth.js) on the plan. A trade takes `n` lots of the
       `from` classes whose plot holds its model, spread over the city (the farthest from those already taken first);
       `cls` is the class it becomes. The watchhouses take a house near the east, west and south of the city (`at`, a
       fraction of the way from the city's middle to its edge); the central one is the Fortress's armoury. The
       caravanserai stands at step 3 (before the streets) on the free ground nearest the River Gate's site marker within
       `reach` m: `pad` m round it clear, rising no more than `slope` m, `wallClear` m inside the wall's line, fronting an
       avenue within `front` m (owner, 2026-10-12: "closer to the river gate, at post-avenue stage"); the coast-guard berth on the water `off` m from the
       Fortress's apron, `clear` radians from its bridges and docks, its deck `deckY` over the sea on a stone footing.
     - wells: on every plaza and market square, every `street` m along the residential streets (`side` m off the kerb, at
       least `gap` m from another well), and one in the yard of every manor and clan compound.
     - furnAct: the city's activity vocabulary over core/simulation's SIM.FURN_ACT (a piece's job, type or catalog role).
     - pull: how strongly a place draws someone choosing what to do with free time, by place kind and activity (phase C
       reads it: the activity whose unmet need x pull is highest wins).
     - hours: when a place of a kind is open (the home and the well always); posts: work posts a piece gives (the job
       table's posts: a counter takes two, a warehouse's bay half a porter); outdoor: the work that has no furniture (the
       fields, the docks, the mines, the walls): its posts are the census's workplaces there. */
  sim: {
    place: {
      trades: [
        { key: 'voth_bldg_bakery', n: 14, from: ['shop', 'craft'], cls: 'craft', plural: 'bakeries' },
        { key: 'voth_bldg_butcher', n: 10, from: ['shop', 'craft'], cls: 'craft', plural: 'butchers' },
        { key: 'voth_bldg_weaver', n: 8, from: ['craft', 'shop'], cls: 'craft', plural: 'weavers' },
        { key: 'voth_bldg_brewery', n: 4, from: ['industrial', 'warehouse'], cls: 'industrial', plural: 'breweries' },
        { key: 'voth_bldg_tannery', n: 3, from: ['industrial', 'warehouse'], cls: 'industrial', plural: 'tanneries' }
      ],
      watch: { key: 'voth_bldg_watchhouse', at: 0.55, dirs: { east: [1, 0], west: [-1, 0], south: [0, 1] }, from: ['middle', 'poor', 'shop', 'craft'] },
      caravanserai: { key: 'voth_bldg_caravanserai', gate: 'River Gate', marker: 'H', reach: 500, pad: 3, slope: 6, front: 30, wallClear: 40 },
      /* the rest day's two great temples (owner, 2026-10-12), placed at step 5 (after the wall, before the streets) as the
         caravanserai is at step 3: searched for out
         from the point `at` of the way from the city's middle to its edge toward `side`, on free ground off an avenue */
      temples: [{ key: 'voth_bldg_temple_ash', side: 'W', at: 0.4, reach: 1200, pad: 6, slope: 12, front: 40, wallClear: 40 },
                { key: 'voth_bldg_temple_tide', side: 'SE', at: 0.5, reach: 900, pad: 6, slope: 8, front: 40, wallClear: 40 }],
      /* a house-sized chapel in each village: the house nearest its green */
      chapel: { key: 'voth_bldg_village_chapel' },
      /* the small shrines (kits/catalog voth_shrine_*): along the big parks' walks every `walkEvery` m, set `off` m beside
         them; one in each pocket park of at least `minArea` m2, clear of its benches by `clear` m */
      shrines: { keys: ['voth_shrine_stele', 'voth_shrine_lantern', 'voth_shrine_urn'], walkEvery: 60, off: 3, minArea: 120, clear: 2.5 },
      /* the benched squares by the cantons whose people found nowhere to sit with company (VC.simSquares): [canton, how
         many], each `w` x `d` m on cleared house lots of `from`, out from the canton's apron to `reach` m in rings of `ring`
         m (and from the land end of each causeway it has), fronting a way of `ways` within `front` m, `gap` m apart, no
         steeper than `slope` m; benches `edge` m in from
         its sides every `sideEvery` m and in a ring every `ringEvery` m round its middle */
      squares: { cantons: [['Fortress', 3], ['Market', 3], ['Guild', 2], ['Granary', 2], ['Arsenal', 1], ['Foreign', 1]], w: 34, d: 24, reach: 320, ring: 10,
                 ways: ['avenue', 'main', 'side', 'alley', 'lane'], front: 6, gap: 70, slope: 2.5, from: ['poor', 'middle', 'shop', 'craft', 'rich'], edge: 2, ringEvery: 4.2, sideEvery: 4 },
      /* the village shrines (VC.simVillageShrines; owner, 2026-10-12: two, then "Put in 6 more"): `n`, each where the most of the busiest service's worshippers find no
         room: a household's `attend` share of its people (`homes` by class) given to the nearest place of worship within
         `walk` m with room left (a temple's or a chapel's nave by its floor, a canton, the funerary temple and the
         landmark shrines, the monastery's chapel and the pocket parks' small ones `holds`; the clan compounds keep their own), the leftovers summed
         within `r` m on a `cell` m grid; then the nearest ground within `reach` m (`pad` m round the model, cleared house
         lots of `from`), fronting a way of `ways` within `front` m, `gap` m from another; a spot with no ground is skipped
         (up to `retries` times) */
      villageShrine: { key: 'voth_bldg_village_shrine', n: 8, retries: 8, pad: 2, attend: 0.16, walk: 1500, holds: { canton: 250, funerary: 500, shrine: 100, monastery: 350, small: 3 },
                       homes: { poor: 7, middle: 5, rich: 6, shop: 5, craft: 6, farm: 10 }, cell: 100, r: 400,
                       reach: 400, ring: 10, ways: ['avenue', 'main', 'side', 'alley', 'lane'], front: 14, gap: 600, slope: 3.5, from: ['poor', 'middle', 'shop', 'craft', 'rich', 'farm'] },
      berth: { key: 'voth_bldg_coastguard_berth', canton: 'Fortress', off: 30, clear: 0.45, deckY: 1.2, depth: 2 }
    },
    wells: { key: 'voth_well', street: 150, side: 2.6, gap: 90, classes: ['main', 'side'], yard: ['manor', 'clan'] },
    furnAct: { rack: 'DRAW_TOOLS', weapon: 'DRAW_TOOLS', well: 'DRINK', stall: 'SELL', counter: 'KEEP_SHOP', altar: 'WORSHIP', shrine: 'WORSHIP',
               tomb: 'HONOUR', bench: 'RELAX', seating: 'SOCIALIZE', chair: 'EAT', stool: 'DRINK', loom: 'WEAVE', workstation: 'CRAFT', stove: 'COOK',
               desk: 'STUDY', bed: 'SLEEP', larder: 'STORE_FOOD', store: 'STORE_FOOD', chest: 'STORE', tool: 'TRAIN' },
    /* what a piece offers besides (owner, 2026-10-12: "items like chairs, stools could be a good target for idle and
       beds etc for rest"): a seat takes someone idling (a chair or a bench seat also someone relaxing), a bed someone
       resting; at home first (the roles pin IDLE and REST to the home), else the nearest */
    /* the canton rooms that are someone's home (private: their own people only) */
    privateRooms: ['cottage', 'bedroom', 'living', 'cell'],
    alsoAct: { chair: ['IDLE', 'RELAX', 'VISIT'], stool: ['IDLE', 'VISIT'], bench: ['IDLE', 'VISIT'], seating: ['IDLE', 'RELAX', 'VISIT'], table: ['VISIT'], bed: ['REST'], bunk: ['REST'], mat: ['REST'] },
    /* company at home (owner, 2026-10-12: "maybe people can socialize at home with housemates and neighbors too"): a
       house's seats and table places take VISIT, its own people and the neighbours whose home is within `visitR` m;
       someone who finds no room out (SOCIALIZE) visits instead (TUNE.sim.week.fallback) */
    visitR: 60,
    /* more places to socialize (owner, 2026-10-12): every plaza and pocket park of the plan is a place, its room by its
       area: one person per `m2` square metres for its activities' shares (a plaza's SOCIALIZE takes one per 4 m2) */
    greens: { plaza: { m2: 4, SOCIALIZE: 1, RELAX: 0.4, IDLE: 0.3 }, park: { m2: 8, SOCIALIZE: 0.6, RELAX: 1, IDLE: 0.5 }, min: 2, wander: 0.35 },
    /* a shrine's, a chapel's, the funerary temple's and a canton shrine room's congregation by its ground floor: one
       worshipper per `m2` square metres (standing), whatever its altars hold; `need` the rest day's worship sizing:
       how many come (share of everyone) and in how many services */
    worship: { m2: 2.5, kinds: ['shrine', 'chapel', 'funerary', 'canton-shrine', 'temple'], services: [1, 3], attend: [1, 0.5], holds: 4,
               /* the rest day (owner, 2026-10-12: "3 with half"): three services, each citizen dealt one of them or none,
                  so `attend` of the city comes */
               at: [8, 11, 17], share: 0.5 },
    pull: {
      home: { EAT: 1, SLEEP: 1, RELAX: 0.8, SOCIALIZE: 0.6 }, tavern: { EAT: 1.2, DRINK: 1.5, SOCIALIZE: 1.5, RELAX: 1 }, shop: { BUY: 1 }, market: { BUY: 1.3, SOCIALIZE: 0.8 },
      shrine: { WORSHIP: 1.4, CONTEMPLATE: 1.2 }, chapel: { WORSHIP: 1.2, CONTEMPLATE: 1.4 }, temple: { WORSHIP: 1.6, CONTEMPLATE: 1.4 }, funerary: { HONOUR: 1.5, CONTEMPLATE: 1 }, park: { RELAX: 1.4, SOCIALIZE: 0.8 },
      plaza: { SOCIALIZE: 1.1, RELAX: 0.6 }, well: { DRINK: 1, SOCIALIZE: 0.5 }, healing: { HEAL: 1.5 }
    },
    hours: { home: null, well: null, shop: [7, 19], craft: [6, 19], tavern: [10, 2], warehouse: [6, 18], industrial: [6, 18], civic: [7, 18], market: [6, 19],
             shrine: [5, 22], chapel: [4, 22], temple: [5, 22], funerary: [6, 20], park: [5, 23], plaza: null, watch: null, healing: null, lighthouse: null },
    posts: { counter: 2, workstation: 1, loom: 1, desk: 1, stove: 2, rack: 1, anvil: 2, forge: 2, stall: 1, tool: 1, storage: 0.5, stack: 0.5, bed: 0.5, table: 1, altar: 3, shrine: 2, tomb: 1, food: 0.5, pen: 1, weapon: 1 },
    /* a piece's posts in a room of a kind, over `posts` (a tavern's table is half a server, a drill hall's dummy one soldier) */
    postsIn: { alehouse: { table: 0.5 }, guardroom: { table: 1 }, stable: { pen: 1, rack: 0.5 } },
    target: 0.9,
    /* the soldiers' posts on the wall: at each standing tower and each gate */
    wallPost: { tower: 4, gate: 12 },
    /* the mustering ground's drill: a soldier at drill for every so many m2 */
    musterPerPost: 10,
    /* session 2: capacity by size, the metres of a piece's width one person takes (a workbench of 4.4 m takes two), seats
       round a table (metres of its edge a sitter takes), where people stand (a step before a piece; the kinds whose
       spots are listed, the work ones first; at most so many a place), an outdoor place's reach by its kind */
    postWidth: { counter: 1.6, workstation: 2.2, stall: 1.8, loom: 2.4, desk: 1.6, table: 1.4 },
    seatWidth: { table: 0.8, bench: 0.6, seating: 0.6 },
    spotStep: 0.45, spotsMax: 48,
    spotTypes: ['counter', 'workstation', 'loom', 'desk', 'stove', 'rack', 'weapon', 'tool', 'stall', 'pen', 'altar', 'shrine', 'tomb', 'table', 'chair', 'bench', 'seating', 'stool', 'bed'],
    outdoorR: { fishdock: 20, quay: 20, pier: 30, mine: 22, quarry: 30, mushfarm: 20, mill: 10, granary: 8, tower: 6, gate: 14, field: 20, ferry: 10, station: 14, chinampa: 25, ranch: 18 },
    /* phase C: the pedestrian layer (43-vc-sim-nav.js). A street is a node every `step` m; a street's end joins the street
       it meets when it stops within that street's half-width + `snap` m; crossings share a node. A canton terrace is a
       ring of nodes every `ring` m, a top deck a grid every `deck` m; a park walk's loose end joins a street within
       `walkSnap` m, a causeway's land end within `landSnap` m. `yWeight`: a point's height counts that many times its
       horizontal distance when it finds its node (a room on the third terrace is not walked to from the street under
       it). An alley's or a lane's end still dead joins another street within `reach` m; a park walk joins a street it passes
       within `walkTouch` m; each plaza is a hub joined to the street nodes round it. A place whose door stands more than
       `far` m (past an open place's reach) from its node is listed as off the network. The buildings' outside stairs and
       ladders (their models' walk records): a foot within `stairGround` m of its lot's ground joins the nearest street
       node within `stairSnap` m; two ends of one lot within `stairLevelDy` m of height and `stairLevel` m apart (a
       landing, a roof both reach) join; a ladder costs `cost.ladder` times its length. A foot up on a gallery or roof no other stair of its lot reaches
       is reached through the house (an `indoor` edge to the lot's ground stair, else the street within `stairFar` m) */
    nav: { step: 20, snap: 6, reach: 18, ring: 25, deck: 25, walkSnap: 25, walkTouch: 6, landSnap: 60, yWeight: 3, far: 40, cost: { stairs: 1.6, ladder: 3, indoor: 1.5 },
           stairGround: 1.2, stairSnap: 40, stairFar: 400, stairLevel: 25, stairLevelDy: 0.6 },
    /* phase C: the citizens (44-vc-sim-people.js). Every home's census residents become actors; TUNE.census.workingShare
       of them work (all of them where the home is a barracks or a dorm: its workplaces cover its residents). Jobs are
       dealt: a home that is also a workplace (a shop, a tavern, a garrison) fills its own first; `liveAt` gives a kind
       of home its trade (a chinampa hut's workers grow its beds); `slaveShare` of the `slaveJobs` workplaces go to slaves
       (the owner's Q5: 70% of farm and mine labour), housed at the site and counted apart from the census; the rest
       go to the nearest free worker by the walk (the pedestrian layer, at most `rounds` searches), never past `walkMax`
       metres walked. `gentry` classes take only `gentryJobs` outside their own house. `wealth` is the owner's Q6
       recommendation (still open). `sample`: the commutes walked on the pedestrian layer for the report. `sched`: a
       plain day until session 2 brings the week, the rota and the shifts */
    people: {
      walkMax: 3000, rounds: 400,
      liveAt: { 'chinampa hut': 'chinampa growers' }, notLiveIn: ['household service'],
      slaveShare: 0.7, slaveJobs: ['farmhands and ploughmen', 'miners', 'quarrymen and masons'],
      gentry: ['rich', 'manor', 'clan'],
      gentryJobs: ['guild officers and clerks', 'customs officers and clerks', 'teachers and scholars', 'clerks and officials', 'envoys and embassy staff',
                   'guild masters and journeymen', 'palace household and officials', 'healers and nurses', 'priests and undertakers', 'temple priests and servants',
                   'scribes and librarians', 'Ordinator garrison'],
      wealth: { slave: 0, poor: 0.2, middle: 0.45, shop: 0.5, craft: 0.5, tavern: 0.5, rich: 0.75, manor: 0.9, clan: 0.9, canton: 0.45, other: 0.35 },
      sample: 600,
      sched: { dependant: [[0, 'SLEEP'], [7, 'EAT'], [8, 'IDLE'], [12, 'EAT'], [13, 'SOCIALIZE'], [18, 'EAT'], [19, 'RELAX'], [22, 'SLEEP']] }
    },
    /* phase C session 2: the week (owner's Q8). Days 0-6, `rest` the rest day (the brief's day 7): all but the
       `essential` kinds of work (and the market) have it off; every worker also has a rota day off among the other six
       (dealt by its index, so a sixth of the workforce is off on any workday). A shift: [start hour, hours] by kind of
       work (`default` for the rest); `night`: the share of a kind's workers on the night shift [start, hours]. A day's
       schedule is built from the shift: 8 hours' sleep ending an hour before it, a meal then, the shift, a meal, the
       rest free (SOCIALIZE, then RELAX from `relaxFrom`); an off or rest day keeps the sleep and frees the day; on the rest
       day a share goes to one of the services (TUNE.sim.worship.at, share). Slaves: the farm shift, the rest day off, no rota (`slaveRota`) */
    week: {
      rest: 6, rota: true, slaveRota: false, relaxFrom: 20,
      /* free time with no place to go: sit at home (IDLE: its chairs), not to bed */
      fallback: { SOCIALIZE: 'VISIT', RELAX: 'IDLE', WORSHIP: 'IDLE', DRINK: 'IDLE' },
      /* slaves: the rest day is a half shift (owner, 2026-10-12: "slaves work a half shift on rest day") */
      slaveRest: 'half',
      shifts: { default: [7, 10], 'farmhands and ploughmen': [6, 12], miners: [6, 12], 'quarrymen and masons': [6, 12], 'mushroom growers': [6, 12],
                'chinampa growers': [6, 11], orchardmen: [6, 11], 'beetle herders': [6, 11], fishers: [5, 10], bakers: [4, 10], 'cooks and bakers': [5, 11],
                'innkeepers and servers': [10, 12], 'innkeepers and grooms': [8, 12], 'market traders': [7, 11], 'dockers and stevedores': [6, 11],
                'monks and lay brothers (chapel, fields, coops)': [5, 11], 'household service': [6, 12] },
      night: { 'town guard': [0.34, 20, 8], soldiers: [0.34, 20, 8], 'Ordinator garrison': [0.34, 20, 8], 'coast guard': [0.34, 20, 8], 'power-house stokers and engineers': [0.34, 20, 8],
               jailers: [0.34, 20, 8], 'lighthouse keepers': [0.5, 20, 8] },
      essential: ['soldiers', 'town guard', 'Ordinator garrison', 'coast guard', 'power-house stokers and engineers', 'innkeepers and servers', 'innkeepers and grooms',
                  'market traders', 'healers and nurses', 'ferrymen', 'elephant bug handlers and station hands', 'household service', 'cooks and bakers', 'bakers',
                  'temple priests and servants', 'shrine keepers', 'priests and undertakers', 'jailers', 'lighthouse keepers', 'palace household and officials',
                  'monks and lay brothers (chapel, fields, coops)', 'gladiators and arena keepers', 'beetle herders'],
      slaveShift: [6, 12]
    },
    /* running the simulation in the page (56c-vc-citizens-host.js): the pedestrian layer is lazy (a leg is decided from
       the straight line times `detour`, its path found when it is drawn); at most `stepMax` decisions a simulated minute;
       a frame steps at most `catchUp` minutes behind the clock; a jump of more than `jumpGap` minutes (the hour slider)
       re-places everyone (SIM.jump); nobody looks farther than `reach` m for a place to spend free time (SIM.REACH). The census is sampled at `samples` hours each day (the fast clock's stability check) */
    run: { detour: 1.35, stepMax: 6000, catchUp: 4, jumpGap: 90, samples: [3, 10, 15, 20], reach: 1500 },
    /* the bodies drawn: the nearest `max` within `r` m of the view's centre, picked again every `every` ms, when the
       orbit is closer than `dist` m (or walking); the tunic by activity (`moving` while walking) */
    embody: { r: 220, max: 1500, every: 400, dist: 600,
              colours: { moving: 0xd8d0c0, WORK: 0xb8873a, SOCIALIZE: 0x3a7ab8, VISIT: 0x6a8ac8, RELAX: 0x5a9a5a, EAT: 0xc0a060, WORSHIP: 0x9a50a0, DRINK: 0x4ab0b0, IDLE: 0x8a8a8a, SLEEP: 0x404060, CONTEMPLATE: 0xb070c0, REST: 0x50607a, other: 0x8a7a6a } },
    /* needs, happiness, efficiency, loyalty (phase C session 3; SIM-ROADMAP.md 1.4, 2.4 items 4 and 5; core/simulation
       77-sim-6-needs.js). A meter per need, 0 met to 100 desperate: it rises `rate` a world hour (times the trade's
       `byTrade`), falls by the activity's `fill` an hour (at home, sitting, resting or with guests, there is water; asleep,
       hunger and thirst come slower; every workplace has a drink, a labourer's thirst outruns it); WORK adds `work` times the trade's `labour` (heavy labour:
       thirst, some hunger; the slaves `slaveLabour`). Material waits for phase D's items (rate 0). In the hours the
       schedule gives to one of `free`, the citizen does what its meters ask (fills times meters times weights) that an
       open place within reach offers, the scheduled one favoured by `keep`, held `dwell` minutes (and up to `jitter` more,
       by the citizen, so the choices do not all fall due in one minute). A labourer whose
       thirst reaches `interrupt.drink.at` at work walks to the nearest drink (a well) until it is down to `until`
       (at most `max` minutes, not again for `cool`). Happiness: 100 less the weighted mean pain of the meters
       (pain = 100 (m/100)^`pain`), a trait (dealt by hash, `traits`) weighing a need more or less; its band gives the
       efficiency at work (`bands`); loyalty drifts toward it over `loyalty.tau` minutes. The meters start at a hashed
       `init` [lo, hi] each */
    needs: {
      list: ['eat', 'drink', 'socialize', 'relax', 'contemplate', 'sleep', 'material'],
      rate: { eat: 4, drink: 5, socialize: 2, relax: 2, contemplate: 0.5, sleep: 4.2, material: 0 },
      fill: { SLEEP: { sleep: 14, relax: 2, eat: 2, drink: 3 }, WORK: { drink: 3 }, REST: { sleep: 6, relax: 10, drink: 8 }, EAT: { eat: 70, drink: 35, socialize: 3 }, DRINK: { drink: 150, socialize: 8, relax: 3 },
              SOCIALIZE: { socialize: 24, relax: 4 }, VISIT: { socialize: 18, relax: 5, drink: 6 }, RELAX: { relax: 18, socialize: 2, drink: 10 }, IDLE: { relax: 7, drink: 8 },
              CONTEMPLATE: { contemplate: 30, relax: 6 }, WORSHIP: { contemplate: 45, socialize: 5 }, HONOUR: { contemplate: 25 }, LODGE: { sleep: 12 } },
      work: { drink: 4, eat: 1.5, relax: 1 },
      labour: { 'farmhands and ploughmen': 1, miners: 1, 'quarrymen and masons': 1, 'dockers and stevedores': 1, 'porters and warehousemen': 0.8, fishers: 0.8,
                'river bargemen and quay hands': 0.8, 'chinampa growers': 0.8, 'mushroom growers': 0.7, orchardmen: 0.7, 'beetle herders': 0.6, 'industrial workers': 0.7,
                'smiths and craftsmen': 0.6, tanners: 0.7, soldiers: 0.6, 'gladiators and arena keepers': 1, 'monks and lay brothers (chapel, fields, coops)': 0.5 },
      slaveLabour: 1,
      byTrade: { soldiers: { material: 0.5 }, 'Ordinator garrison': { material: 0.5, contemplate: 1.3 }, 'town guard': { material: 0.7 },
                 'monks and lay brothers (chapel, fields, coops)': { contemplate: 2, socialize: 0.6, material: 0.5 }, 'temple priests and servants': { contemplate: 1.5 },
                 'shrine keepers': { contemplate: 1.5 } },
      weight: { eat: 1.5, drink: 1.5, sleep: 1.3, socialize: 1, relax: 1, contemplate: 0.8, material: 1 },
      traits: { chatty: { socialize: 1.33 }, loner: { socialize: 0.67 }, pious: { contemplate: 1.33 }, worldly: { contemplate: 0.67 }, glutton: { eat: 1.33 },
                ascetic: { eat: 0.67, material: 0.67 }, restless: { relax: 1.33 }, steady: { relax: 0.67 } },
      free: ['SOCIALIZE', 'RELAX', 'DRINK', 'CONTEMPLATE', 'REST', 'IDLE'], dwell: 60, jitter: 30, keep: 1.25, done: 12,
      interrupt: { drink: { at: 75, act: 'DRINK', until: 25, max: 40, cool: 90 } },
      bands: [{ label: 'content', min: 70, eff: 1 }, { label: 'uneasy', min: 50, eff: 0.92 }, { label: 'unhappy', min: 30, eff: 0.8 }, { label: 'restless', min: 0, eff: 0.65 }],
      loyalty: { tau: 4320, bands: [{ label: 'loyal', min: 60 }, { label: 'wavering', min: 40 }, { label: 'disloyal', min: 0 }] },
      /* the outdoor work in the country keeps a water barrel (`barrel`: a drink for every so many posts), the slaves'
         quarters their rations and water */
      barrel: { kinds: ['field', 'mine', 'quarry', 'mushfarm'], per: 2 },
      pain: 1.5, init: { eat: [10, 40], drink: [10, 40], socialize: [10, 40], relax: [10, 40], contemplate: [0, 15], sleep: [0, 20] }, high: 70
    }
  },
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
    /* the citizen simulation's buildings (phase B, 42-vc-sim-places.js), by kit key: residents, workplaces, the kind of work
       and where; a converted lot counts as its new building, not its old one */
    byKey: { voth_bldg_watchhouse: { job: 'town guard', jobs: 24, where: 'watchhouses' },
             voth_bldg_temple_ash: { job: 'temple priests and servants', jobs: 16, where: 'temples' }, voth_bldg_temple_tide: { job: 'temple priests and servants', jobs: 16, where: 'temples' },
             voth_bldg_village_chapel: { job: 'shrine keepers', jobs: 1, live: 1, where: 'village chapels' },
             voth_bldg_village_shrine: { job: 'shrine keepers', jobs: 2, live: 1, where: 'village shrines' },
             voth_bldg_caravanserai: { job: 'innkeepers and grooms', jobs: 14, live: 6, where: 'caravanserai' },
             voth_bldg_coastguard_berth: { job: 'coast guard', jobs: 40, where: 'coast-guard berth' },
             voth_bldg_bakery: { job: 'bakers', jobs: 5, live: 5, where: 'bakeries' },
             voth_bldg_butcher: { job: 'butchers', jobs: 4, live: 5, where: 'butchers' },
             voth_bldg_weaver: { job: 'weavers and dyers', jobs: 5, live: 6, where: 'weavers' },
             voth_bldg_brewery: { job: 'brewers', jobs: 10, where: 'breweries' },
             voth_bldg_tannery: { job: 'tanners', jobs: 8, where: 'tanneries' } },
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
