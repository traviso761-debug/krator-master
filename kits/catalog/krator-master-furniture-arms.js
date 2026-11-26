/* ======================================================================
   krator-master-furniture-arms.js — WEAPON RACKS and ARMOUR STANDS, a pair for every culture (the Arms category, 2026-10-22)
   Not a culture file. Like -jobs.js its name is a category: a bundle carries it only when a build names 'arms'
   (furniture_bundle.bundle([..., 'arms'])); the catalog page loads it like every krator-master-furniture-*.js.
   Every entry keeps its real `culture` and is military furniture for barracks, guardrooms, armouries and watch
   houses (the owner, 2026-10-22: the catalog had no weapon racks for those rooms). The trade sets' weapon_rack and
   armour_stand (FK.ROLES.trade, <culture>_trade_*) are a smith's wares and stay as they are; these are the garrison's.
   Each culture gets <prefix>_<tier>_weapon_rack (on the wall: variant 0 its polearms or long arms standing in a butt
   sill, variant 1 its blades hung from pegs under two shields) and <prefix>_<tier>_armour_stand (on the floor:
   variant 0 its battle armour and helm, variant 1 the lighter kit), drawn by ARMS_rack and ARMS_stand from a row of
   ARMS below: the culture's own palette keys, frame (post, pipe, lashed, bamboo, reed, stone), polearm, blades,
   shield, armour and helm. The Eternians' weapon rack is their glaive rack (kits/eternian, the frontier fort's
   armoury, eternian_common_arms_rack): only their armour stand is here.
   Not placed in any build yet: placing them is a todo for the next round that rebuilds the builds
   (kits/catalog/KNOWN_ISSUES.md, "Arms: not placed yet").
   The file adds the colours its pieces need to each culture's palette through its own PALETTE block, as DEFAULTS at
   the culture file's own values (the culture's own palette wins for a key both define), plus a few new keys where a
   culture had no colour for a blade or a strap. Pieces draw only through F, so a bundle may carry it alone.
   ====================================================================== */
/* PALETTE */
/* every key a piece here names, as a DEFAULT at the culture's own value: the culture's own palette wins */
FURN_CULTURE('ancient', { palette: Object.assign({ steel: 0x5a5f62, blackIron: 0x1c1c1c, steelLight: 0x6e7376, alloy: 0xe6e4dc, electric: 0x6fd0ff, clothSlate: 0x5e6b78, clothTeal: 0x3d7a80, blackIronLight: 0x2a2a2a, stoneGraphite: 0x3a3f3e }, FPAL['ancient'] || {}) });
FURN_CULTURE('ancients-salvage', { palette: Object.assign({ blackIron: 0x2a2a2a, timberOak: 0x8a6a4e, steel: 0x6e7376, rustRusset: 0x7a3b22, redCopper: 0x8a3a2a, clothTan: 0xb08a5a, clothOchre: 0xc9a24a, clothBone: 0xe8dcc0 }, FPAL['ancients-salvage'] || {}) });
FURN_CULTURE('yuni-court', { palette: Object.assign({ timberTeak: 0x9a7a4e, timberWalnut: 0x5c432c, iron: 0x4a4038, blackIron: 0x1c1c1c, gilt: 0xc9a227, clothCrimson: 0x9c3024, clothSaffron: 0xd8a030, clothIndigo: 0x2e5a8a }, FPAL['yuni-court'] || {}) });
FURN_CULTURE('yuni-common', { palette: Object.assign({ timberOak: 0x8a6a4e, timberChestnut: 0x7a5a3c, silver: 0xb4b0a2, brass: 0xb08432, clothMadder: 0xb83a2e, clothIndigo: 0x2e5a8a, clothOchre: 0xc9a24a }, FPAL['yuni-common'] || {}) });
FURN_CULTURE('yuni-poor', { palette: Object.assign({
  timberWalnut: 0x5c432c, clothIvory: 0xf0ece0, clothMadder: 0xb83a2e, clothIndigo: 0x2e5a8a, clothSaffron: 0xd8a030,
  /* new: the poor garrison's dull iron (spear heads, axe heads, bosses) and flax cord for the lashings (yuni-common's ropeFlax) */
  ironDull: 0x5a5652, ropeFlax: 0xb8a262
}, FPAL['yuni-poor'] || {}) });
FURN_CULTURE('sahelian', { palette: Object.assign({
  timberSepia: 0x4a3624, timberTeak: 0x9a7a4e, clothIndigo: 0x2e5a8a, clothIvory: 0xf0ece0,
  /* new: the takouba's dull iron and the red-dyed leather of grips, belts and hide shields (the nomads' leatherRed) */
  ironDull: 0x5a5652, leatherRed: 0x8c3e2c
}, FPAL['sahelian'] || {}) });
FURN_CULTURE('order', { palette: Object.assign({
  timberOak: 0x8a6a4e, timberWalnut: 0x5c432c, brass: 0xb08432, clothWine: 0x5a2a2a, clothBone: 0xe8dcc0, clothWalnut: 0x6a3a2a,
  /* new: bright steel for the Order's plate, blades and great helms */
  steelPale: 0xb4b8bc
}, FPAL['order'] || {}) });
FURN_CULTURE('nomad', { palette: Object.assign({ timberTamarisk: 0x7a6248, timberPoplar: 0xb09a6a, blackIron: 0x2a2622, brassDull: 0x9c8048, saduIndigo: 0x2f3a58, saduRust: 0x8a3524, leatherRed: 0x8c3e2c, ropeGoat: 0x3a322a }, FPAL['nomad'] || {}) });
FURN_CULTURE('voth', { palette: Object.assign({ timberWalnut: 0x5a4028, timberUmber: 0x5a4a38, steelLight: 0x7a6f5c, lacquerBlack: 0x1e1a1a, brass: 0xa88a3c, clothVothPurple: 0x4b2a6e, clothVothMauve: 0x6a4a8f, stoneGraphite: 0x3c362c }, FPAL['voth'] || {}) });
FURN_CULTURE('iziz', { palette: Object.assign({ mahoganyRed: 0x6a2a1e, timberChestnut: 0x6a4a2a, zincGrey: 0xa9aeb0, bronze: 0x8a6a3a, bronzeLight: 0x9a7a3c, clothOrange: 0xe07a2a, clothCrimson: 0x9c2d2d, mahoganyDark: 0x44190f }, FPAL['iziz'] || {}) });
FURN_CULTURE('beast-rider', { palette: Object.assign({ timberUmber: 0x6a5c48, timberWalnut: 0x6a3a2a, iron: 0x3a362e, leatherBrown: 0x5a4630, boneIvory: 0xe8e0cc, clothVermilion: 0xc9442a, clothSaffron: 0xd8a23a, hideOak: 0x8a6a48, ropeHemp: 0xa8966a }, FPAL['beast-rider'] || {}) });
FURN_CULTURE('generic', { palette: Object.assign({ timberOak: 0x8a6a4e, timberWalnut: 0x5e3f2a, pewter: 0x8a8f92, copper: 0xb06a3a, clothHessian: 0xa8885a, clothOchre: 0xc9a24a, timberDark: 0x3e2c20 }, FPAL['generic'] || {}) });
FURN_CULTURE('scrap', { palette: Object.assign({ rustPipe: 0x8a5a3a, timberGrey: 0x8a8070, steelBlade: 0xb8b8b0, rustPlate: 0x7a4a3a, hubcap: 0xdcd8cc, ragOlive: 0x6a6a4a, ragGrey: 0x8a8478, tyreBlack: 0x232120, cordOrange: 0x9a5a2a, helmetCopper: 0xb87a4a }, FPAL['scrap'] || {}) });
FURN_CULTURE('lizardmen', { palette: Object.assign({ timberSwamp: 0x4e5436, timberDrift: 0x8a8468, stoneBasalt: 0x3c3c38, scaleJade: 0x3a7a5a, boneIvory: 0xe6dec6, clothMoss: 0x4a6a3a, clothRust: 0x8a4a2a, scaleJadeDark: 0x245a40, reedPale: 0xb8a870, scaleTurquoise: 0x2c8a8a }, FPAL['lizardmen'] || {}) });
FURN_CULTURE('eastabyss', { palette: Object.assign({ timberCedar: 0x8a5a38, timberCedarDark: 0x5a3a24, steelGrey: 0x565250, brass: 0xb08432, clothIndigo: 0x2a4a8a, clothSaffron: 0xd8a030, bindingBrown: 0x6a4a2a }, FPAL['eastabyss'] || {}) });
FURN_CULTURE('xanadu', { palette: Object.assign({ lacquerRed: 0x9a2020, timberRoseDark: 0x5a2e24, iron: 0x3a3630, lacquerBlack: 0x1e1a1a, gold: 0xd4af37, clothSaffron: 0xe89a2a, clothMaroon: 0x7a1a24, stoneSlate: 0x5a5e62 }, FPAL['xanadu'] || {}) });
FURN_CULTURE('screamer', { palette: Object.assign({ timberGreen: 0x5a6a3a, timberBark: 0x6a5238, steelDull: 0x55595c, boneIvory: 0xe6dcc6, featherRed: 0xc8342a, clothRag: 0x7a7060, clothBlack: 0x2a2622, hideTan: 0x9a7a52, ropeVine: 0x7a8a4a }, FPAL['screamer'] || {}) });
FURN_CULTURE('islander', { palette: Object.assign({ timberKoa: 0x7a4a2a, timberKoaDark: 0x4a2a14, shellWhite: 0xe8e4d8, ropeCoir: 0xa08050, shellPearl: 0xdcdde6, tapaBark: 0x8a5a32, clothRedEarth: 0x9a3a2a, pandanus: 0xb09050 }, FPAL['islander'] || {}) });
FURN_CULTURE('republican', { palette: Object.assign({ bambooStraw: 0xc8b070, timberBirchDark: 0x8a6a48, ironBlack: 0x2a2a2a, steelOlive: 0x6a6a5a, brass: 0xb08432, clothRepublicRed: 0x7a2028, clothCream: 0xf0e6cc, leatherBrown: 0x6a4a30 }, FPAL['republican'] || {}) });
FURN_CULTURE('rustic', { palette: Object.assign({ timberLarch: 0xa07850, timberPine: 0xc08850, steelGrey: 0x9a9aa0, iron: 0x3a3630, pewter: 0x8a8f92, clothLoden: 0x4a5a3a, clothRedCheck: 0x8a2a2a, hideBrown: 0x6a4a30, paintFalu: 0x8a2e22 }, FPAL['rustic'] || {}) });
FURN_CULTURE('painted', { palette: Object.assign({ timberCedarRed: 0x8a4a30, timberCedarDark: 0x5a3020, ironSpear: 0x5a5650, timberCedarPale: 0xb08060, formRed: 0xb3322a, clothWoolWhite: 0xe8e0cc, hideElk: 0x9a7a52, ropeCedar: 0x9a7a4a, formBlack: 0x171311 }, FPAL['painted'] || {}) });
FURN_CULTURE('reedlake', { palette: Object.assign({ reedGold: 0xc8b060, timberDrift: 0x9a8a70, boneIvory: 0xe8e0cc, reedPale: 0xd8c888, shellWhite: 0xe8e4d8, clothLakeBlue: 0x3a6a8a, clothRush: 0xb8a060, reedDark: 0x8a7a40, ropeRush: 0xb8a868 }, FPAL['reedlake'] || {}) });
FURN_CULTURE('post-apoc', { palette: Object.assign({ alloyGrey: 0xb4b0a2, plasticBlack: 0x2a2a2a, steelLight: 0x6e7376, alloyWhite: 0xe6e4dc, electric: 0x6fd0ff, clothSynthBlack: 0x1e2024, clothSynthTeal: 0x2a8a8a }, FPAL['post-apoc'] || {}) });
FURN_CULTURE('hykkousoi', { palette: Object.assign({ timberOlive: 0x9a8a5a, timberOliveDark: 0x6a5e3a, bronze: 0x8a6a3a, gold: 0xd8a640, clothSeaGreen: 0x4a9a8a, clothLinen: 0xe4eff0, marbleWhite: 0xeae6de }, FPAL['hykkousoi'] || {}) });
FURN_CULTURE('scyvoi', { palette: Object.assign({ timberPoplar: 0xc2a878, timberRed: 0xa02a1e, ironBlack: 0x2a2824, brass: 0xb8913a, gold: 0xd4a83a, madder: 0xa8322a, indigo: 0x2a3266, leatherTan: 0xa87a4a, ropeHemp: 0xb09a6a, wicker: 0xb48a52 }, FPAL['scyvoi'] || {}) });
FURN_CULTURE('zeijani', { palette: Object.assign({ tuff: 0xd9c8a6, timber: 0x7a5a3a, timberDark: 0x4a3424, obsidian: 0x1a181c, copper: 0xa8683a, bronze: 0x9a7a3a, mauve: 0x9a6a86, teal: 0x4a9490, hide: 0xa87a4a, hideDark: 0x5a3a22 }, FPAL['zeijani'] || {}) });
FURN_CULTURE('ashnomad', { palette: Object.assign({ timberAsh: 0x6a5a48, timberDark: 0x3e3226, chitinAmber: 0x8a5a24, chitin: 0x4a3a2a, chitinDark: 0x2a2018, clothBlack: 0x24221f, clothAsh: 0x77736c, hide: 0x8a6444, ropeHemp: 0xa8926a }, FPAL['ashnomad'] || {}) });
FURN_CULTURE('eternian', { palette: Object.assign({ timber: 0x4a3426, stone: 0xb8b0a0, bronze: 0x9c7a3c, gold: 0xd8b24a, linen: 0xe6dfcf, green: 0x3f8a5a, black: 0x141416 }, FPAL['eternian'] || {}) });
FURN_CULTURE('pylon', { palette: Object.assign({ gunmetal: 0x4a5058, walnutDark: 0x4a2616, orangeLeather: 0xd8702a, linenWhite: 0xece6da, walnut: 0x6e3a22, concrete: 0x8e8b86 }, FPAL['pylon'] || {}) });
FURN_CULTURE('talia', { palette: Object.assign({ walnut: 0x6e3a22, walnutDark: 0x4a2616, brass: 0xc89a48, orange: 0xe07a2a, linen: 0xece6da, marble: 0xe8dcc6, cobalt: 0x2f5fb8 }, FPAL['talia'] || {}) });
/* END PALETTE */

/* the rooms a garrison's racks stand in (the room kinds of kits/interiors and the sets) */
const ARMS_ROOMS = ['armoury', 'barracks', 'guardroom', 'watch'];
/* a slot's family when its row names none; a slot a row leaves out falls back (ARMS_FALL) to another */
const ARMS_FAM = { fr: 'wood', sh: 'wood', me: 'metal', pl: 'metal', ac: 'metal', cl: 'cloth', cl2: 'cloth', le: 'hide', ro: 'rope', st: 'stone', sd: 'wood', gl: 'glow', hm: 'metal', pm: 'cloth' };
const ARMS_FALL = { sd: 'fr', hm: 'pl', pm: 'ac', ro: 'le', st: 'fr', gl: 'ac', cl2: 'cl' };
const ARMS_SLOTS = ['fr', 'sh', 'me', 'pl', 'ac', 'cl', 'cl2', 'le', 'ro', 'st', 'sd', 'gl', 'hm', 'pm'];
/* the polearm heads' heights (variant 0 of the rack): the shaft stops this far under the rack's top */
const ARMS_HEAD = { spear: 0.32, pike: 0.38, lance: 0.32, glaive: 0.44, halberd: 0.44, trident: 0.34, harpoon: 0.3, pilum: 0.54 };

/* ARMS: a row per culture.
     c culture, p key prefix, tier; frame: post | pipe | lashed | bamboo | reed | stone (a back slab);
     base (the stand's foot): cross | tripod | disc | block;
     k: palette keys by slot (fr frame, sh shafts and grips, me blades and heads, pl armour, ac fittings and bosses,
        cl/cl2 cloth (variant 1 swaps them), le straps and hide, ro lashings, st stone, sd shield face, gl a glow,
        hm helm, pm plume or crest) and <slot>F a family for a slot whose family is not ARMS_FAM's;
     pole: the polearm (spear pike lance glaive halberd trident harpoon pilum) or rifle; blades: the hung blades, in
     turn (sword gladius scimitar talwar khopesh machete axe club paddle baton bow); shield: round | oval | tower | kite
     | none (a helmet shelf); armour and helm: [variant 0, variant 1]; court: a valance, finials and a cloak;
     tabard: a cloth tabard over mail; rooms: rooms beyond ARMS_ROOMS; noRack: the culture's rack is elsewhere;
     n: [rack name, its two variant names, stand name, its two variant names] */
const ARMS = [
  { c: 'ancient', p: 'ancient', tier: 'common', frame: 'pipe', base: 'disc', pole: 'rifle', blades: ['baton', 'machete', 'baton'], shield: 'tower', armour: ['ancient', 'quilted'], helm: ['visor', 'cap'],
    k: { fr: 'steel', frF: 'metal', sh: 'blackIron', shF: 'metal', me: 'steelLight', pl: 'alloy', ac: 'blackIronLight', cl: 'clothSlate', cl2: 'clothTeal', le: 'blackIron', leF: 'metal', sd: 'stoneGraphite', sdF: 'stone', gl: 'electric', st: 'steel', stF: 'metal' },
    n: ['Ancients arms rack', ['rifles', 'stun batons and riot shields'], 'Ancients armour on a stand', ['white plate and visor', 'fatigues']] },
  { c: 'ancients-salvage', p: 'salvage', tier: 'poor', frame: 'pipe', base: 'tripod', pole: 'pike', blades: ['machete', 'axe', 'machete'], shield: 'tower', armour: ['scrap', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'blackIron', frF: 'metal', sh: 'timberOak', me: 'steel', pl: 'rustRusset', plF: 'rust', ac: 'redCopper', cl: 'clothTan', cl2: 'clothOchre', le: 'clothBone', leF: 'cloth', sd: 'rustRusset', sdF: 'rust' },
    n: ['Salvage arms rack', ['rebar pikes', 'machetes and plate shields'], 'Salvaged armour on a stand', ['patched plate', 'padded jack']] },
  { c: 'yuni-court', p: 'yuni', tier: 'court', frame: 'post', base: 'cross', pole: 'spear', blades: ['talwar', 'talwar', 'axe'], shield: 'round', armour: ['lamellar', 'mail'], helm: ['spike', 'plume'], court: true, tabard: true,
    k: { fr: 'timberTeak', sh: 'timberWalnut', me: 'iron', pl: 'blackIron', ac: 'gilt', acF: 'gold', cl: 'clothCrimson', cl2: 'clothSaffron', le: 'clothIndigo', leF: 'cloth', sd: 'blackIron', sdF: 'metal', pm: 'clothCrimson', pmF: 'cloth' }, rooms: ['hall', 'antechamber'],
    n: ['Court arms rack', ['tasselled spears', 'talwars and gilt-bossed shields'], 'Court armour on a stand', ['gilt lamellar', 'mail and brocade']] },
  { c: 'yuni-common', p: 'yuni', tier: 'common', frame: 'post', base: 'cross', pole: 'spear', blades: ['talwar', 'sword', 'talwar'], shield: 'round', armour: ['quilted', 'mail'], helm: ['spike', 'hood'],
    k: { fr: 'timberOak', sh: 'timberChestnut', me: 'silver', pl: 'silver', ac: 'brass', cl: 'clothMadder', cl2: 'clothIndigo', le: 'clothOchre', leF: 'cloth', sd: 'timberChestnut' },
    n: ['Guard arms rack', ['spears', 'talwars and round shields'], 'Guard armour on a stand', ['quilted coat and spiked helm', 'mail shirt']] },
  { c: 'yuni-poor', p: 'yuni', tier: 'poor', frame: 'lashed', base: 'tripod', pole: 'spear', blades: ['club', 'axe', 'club'], shield: 'oval', armour: ['quilted', 'quilted'], helm: ['hood', 'none'],
    k: { fr: 'timberWalnut', sh: 'timberWalnut', me: 'ironDull', pl: 'clothIvory', plF: 'cloth', ac: 'ironDull', cl: 'clothMadder', cl2: 'clothIndigo', le: 'clothSaffron', leF: 'cloth', ro: 'ropeFlax', sd: 'clothIvory', sdF: 'cloth' },
    n: ['Lashed arms rack', ['spears', 'clubs, axes and wicker shields'], 'Padded jack on a tripod', ['quilted jack and wrap', 'quilted jack']] },
  { c: 'sahelian', p: 'sahelian', tier: 'common', frame: 'post', base: 'cross', pole: 'spear', blades: ['sword', 'sword', 'axe'], shield: 'oval', armour: ['quilted', 'mail'], helm: ['hood', 'pot'],
    k: { fr: 'timberSepia', sh: 'timberTeak', me: 'ironDull', pl: 'ironDull', ac: 'ironDull', cl: 'clothIndigo', cl2: 'clothIvory', le: 'leatherRed', sd: 'leatherRed', sdF: 'hide' },
    n: ['Sahelian arms rack', ['long spears', 'takoubas and hide shields'], 'Sahelian armour on a stand', ['quilted indigo coat', 'mail and a cap']] },
  { c: 'order', p: 'order', tier: 'common', frame: 'post', base: 'cross', pole: 'halberd', blades: ['sword', 'sword', 'axe'], shield: 'kite', armour: ['plate', 'mail'], helm: ['great', 'pot'], tabard: true,
    k: { fr: 'timberOak', sh: 'timberWalnut', me: 'steelPale', pl: 'steelPale', ac: 'brass', cl: 'clothWine', cl2: 'clothBone', le: 'clothWalnut', leF: 'hide', sd: 'clothBone', sdF: 'wood' },
    n: ["Order's arms rack", ['halberds', 'swords and kite shields'], "Order's armour on a stand", ['plate and great helm', 'mail and tabard']] },
  { c: 'nomad', p: 'nomad', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'lance', blades: ['scimitar', 'scimitar', 'bow'], shield: 'round', armour: ['mail', 'quilted'], helm: ['spike', 'hood'],
    k: { fr: 'timberTamarisk', sh: 'timberPoplar', me: 'blackIron', pl: 'blackIron', ac: 'brassDull', cl: 'saduIndigo', cl2: 'saduRust', le: 'leatherRed', ro: 'ropeGoat', sd: 'leatherRed', sdF: 'hide' },
    n: ['Nomad arms rack', ['lances', 'scimitars, bows and leather shields'], 'Nomad armour on a tripod', ['mail and spiked helm', 'quilted coat']] },
  { c: 'voth', p: 'voth', tier: 'common', frame: 'post', base: 'block', pole: 'glaive', blades: ['sword', 'sword', 'axe'], shield: 'tower', armour: ['lamellar', 'mail'], helm: ['crest', 'pot'],
    k: { fr: 'timberWalnut', sh: 'timberUmber', me: 'steelLight', pl: 'lacquerBlack', plF: 'lacquer', ac: 'brass', cl: 'clothVothPurple', cl2: 'clothVothMauve', le: 'clothVothMauve', leF: 'cloth', st: 'stoneGraphite', sd: 'lacquerBlack', sdF: 'lacquer', hm: 'steelLight', pm: 'clothVothPurple', pmF: 'cloth' },
    n: ['Voth arms rack', ['glaives', 'swords and lacquered tower shields'], 'Voth armour on a stand', ['black lamellar and crested helm', 'mail']] },
  { c: 'iziz', p: 'iziz', tier: 'common', frame: 'post', base: 'cross', pole: 'pilum', blades: ['gladius', 'gladius', 'gladius'], shield: 'tower', armour: ['segmentata', 'mail'], helm: ['crest', 'pot'],
    k: { fr: 'mahoganyRed', sh: 'timberChestnut', me: 'zincGrey', pl: 'zincGrey', ac: 'bronze', acF: 'bronze', cl: 'clothCrimson', cl2: 'clothOrange', le: 'mahoganyDark', sd: 'clothOrange', sdF: 'wood', hm: 'bronzeLight', hmF: 'bronze', pm: 'clothOrange', pmF: 'cloth' }, rooms: ['pal_armoury', 'pal_guard'],
    n: ['Iziz arms rack', ['pila', 'gladii and orange scuta'], 'Iziz armour on a stand', ['banded plate and crested helm', 'mail']] },
  { c: 'beast-rider', p: 'br', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'lance', blades: ['axe', 'bow', 'axe'], shield: 'oval', armour: ['hide', 'quilted'], helm: ['horn', 'hood'],
    k: { fr: 'timberUmber', sh: 'timberWalnut', me: 'iron', pl: 'boneIvory', plF: 'bone', ac: 'boneIvory', acF: 'bone', cl: 'clothVermilion', cl2: 'clothSaffron', le: 'leatherBrown', ro: 'ropeHemp', sd: 'hideOak', sdF: 'hide', hm: 'leatherBrown', hmF: 'hide' },
    n: ["Riders' arms rack", ['lances', 'axes, bows and hide shields'], "Rider's armour on a tripod", ['hide and bone with a horned cap', 'quilted coat']] },
  { c: 'generic', p: 'generic', tier: 'poor', frame: 'post', base: 'cross', pole: 'spear', blades: ['axe', 'club', 'sword'], shield: 'round', armour: ['quilted', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'timberOak', sh: 'timberWalnut', me: 'pewter', pl: 'clothHessian', plF: 'cloth', ac: 'copper', cl: 'clothHessian', cl2: 'clothOchre', le: 'timberDark', sd: 'timberOak', hm: 'pewter', hmF: 'metal' },
    n: ['Plank arms rack', ['spears', 'axes, clubs and plank shields'], 'Gambeson on a stand', ['gambeson and pot helm', 'gambeson and hood']] },
  { c: 'scrap', p: 'scrap', tier: 'poor', frame: 'pipe', base: 'tripod', pole: 'pike', blades: ['machete', 'club', 'machete'], shield: 'round', armour: ['scrap', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'rustPipe', frF: 'rust', sh: 'timberGrey', me: 'steelBlade', pl: 'rustPlate', plF: 'rust', ac: 'hubcap', cl: 'ragOlive', cl2: 'ragGrey', le: 'tyreBlack', leF: 'plastic', ro: 'cordOrange', sd: 'hubcap', sdF: 'metal', hm: 'helmetCopper' },
    n: ['Scrap arms rack', ['rebar pikes', 'machetes, pipe clubs and hubcap shields'], 'Scrap armour on a tripod', ['plate and tyre pads', 'rag jack']] },
  { c: 'lizardmen', p: 'lizardmen', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'trident', blades: ['paddle', 'club', 'paddle'], shield: 'oval', armour: ['scale', 'hide'], helm: ['crest', 'hood'],
    k: { fr: 'timberSwamp', sh: 'timberDrift', me: 'stoneBasalt', meF: 'stone', pl: 'scaleJade', plF: 'skin', ac: 'boneIvory', acF: 'bone', cl: 'clothMoss', cl2: 'clothRust', le: 'scaleJadeDark', leF: 'skin', ro: 'reedPale', sd: 'scaleTurquoise', sdF: 'skin', hm: 'boneIvory', hmF: 'bone' },
    n: ['Lizardmen arms rack', ['basalt-tipped tridents', 'basalt-edged clubs and scale shields'], 'Scale armour on a tripod', ['jade scale and bone crest', 'hide']] },
  { c: 'eastabyss', p: 'eastabyss', tier: 'common', frame: 'post', base: 'cross', pole: 'spear', blades: ['scimitar', 'scimitar', 'axe'], shield: 'round', armour: ['mail', 'quilted'], helm: ['spike', 'hood'],
    k: { fr: 'timberCedar', sh: 'timberCedarDark', me: 'steelGrey', pl: 'steelGrey', ac: 'brass', cl: 'clothIndigo', cl2: 'clothSaffron', le: 'bindingBrown', sd: 'brass', sdF: 'metal' },
    n: ['Cedar arms rack', ['spears', 'scimitars and brass shields'], 'Abyss armour on a stand', ['mail and spiked helm', 'quilted coat']] },
  { c: 'xanadu', p: 'xanadu', tier: 'common', frame: 'post', base: 'block', pole: 'glaive', blades: ['sword', 'sword', 'sword'], shield: 'round', armour: ['lamellar', 'quilted'], helm: ['plume', 'hood'],
    k: { fr: 'lacquerRed', frF: 'lacquer', sh: 'timberRoseDark', me: 'iron', pl: 'lacquerBlack', plF: 'lacquer', ac: 'gold', acF: 'gold', cl: 'clothSaffron', cl2: 'clothMaroon', le: 'timberRoseDark', st: 'stoneSlate', sd: 'lacquerRed', sdF: 'lacquer', hm: 'iron', pm: 'clothMaroon', pmF: 'cloth' },
    n: ['Lacquered arms rack', ['glaives', 'jian and lacquered shields'], 'Lacquered armour on a stand', ['black lamellar and plumed helm', 'quilted coat']] },
  { c: 'screamer', p: 'screamer', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'spear', blades: ['club', 'machete', 'club'], shield: 'oval', armour: ['bone', 'scrap'], helm: ['plume', 'none'],
    k: { fr: 'timberGreen', sh: 'timberBark', me: 'steelDull', pl: 'boneIvory', plF: 'bone', ac: 'boneIvory', acF: 'bone', cl: 'clothRag', cl2: 'clothBlack', le: 'hideTan', ro: 'ropeVine', sd: 'hideTan', sdF: 'hide', hm: 'boneIvory', hmF: 'bone', pm: 'featherRed', pmF: 'hide' },
    n: ['Screamer arms rack', ['feathered spears', 'clubs, machetes and hide shields'], 'Bone armour on a tripod', ['bone ribs and a feather crown', 'scrap and rags']] },
  { c: 'islander', p: 'islander', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'spear', blades: ['paddle', 'club', 'paddle'], shield: 'oval', armour: ['woven', 'woven'], helm: ['hood', 'none'],
    k: { fr: 'timberKoa', sh: 'timberKoaDark', me: 'shellWhite', meF: 'shell', pl: 'ropeCoir', plF: 'rope', ac: 'shellPearl', acF: 'shell', cl: 'tapaBark', cl2: 'clothRedEarth', le: 'ropeCoir', leF: 'rope', sd: 'pandanus', sdF: 'wicker' },
    n: ['Koa arms rack', ['spears', "shark-tooth clubs and pandanus shields"], 'Coir armour on a tripod', ['coir armour and woven hood', 'coir armour']] },
  { c: 'republican', p: 'republican', tier: 'common', frame: 'bamboo', base: 'cross', pole: 'rifle', blades: ['scimitar', 'sword', 'scimitar'], shield: 'none', armour: ['plate', 'quilted'], helm: ['pot', 'cap'],
    k: { fr: 'bambooStraw', frF: 'bamboo', sh: 'timberBirchDark', me: 'ironBlack', pl: 'steelOlive', ac: 'brass', cl: 'clothRepublicRed', cl2: 'clothCream', le: 'leatherBrown' },
    n: ['Republic rifle rack', ['rifles', 'sabres and helmets'], 'Republic armour on a stand', ['steel cuirass and kettle helm', 'tunic and cap']] },
  { c: 'rustic', p: 'rustic', tier: 'common', frame: 'post', base: 'cross', pole: 'halberd', blades: ['axe', 'sword', 'axe'], shield: 'round', armour: ['mail', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'timberLarch', sh: 'timberPine', me: 'steelGrey', pl: 'iron', ac: 'pewter', cl: 'clothLoden', cl2: 'clothRedCheck', le: 'hideBrown', sd: 'paintFalu' },
    n: ['Larch arms rack', ['halberds', 'axes, swords and painted shields'], 'Mail on a stand', ['mail and pot helm', 'loden gambeson']] },
  { c: 'painted', p: 'painted', tier: 'common', frame: 'post', base: 'cross', pole: 'spear', blades: ['club', 'paddle', 'club'], shield: 'oval', armour: ['slat', 'hide'], helm: ['mask', 'none'],
    k: { fr: 'timberCedarRed', sh: 'timberCedarDark', me: 'ironSpear', pl: 'timberCedarPale', plF: 'wood', ac: 'formRed', acF: 'wood', cl: 'clothWoolWhite', cl2: 'clothWoolWhite', le: 'hideElk', ro: 'ropeCedar', sd: 'hideElk', sdF: 'hide', hm: 'timberCedarPale', hmF: 'wood' },
    n: ['Cedar arms rack', ['spears', 'clubs and painted hide shields'], 'Slat armour on a stand', ['cedar slats and carved helm', 'elk-hide tunic']] },
  { c: 'reedlake', p: 'reedlake', tier: 'common', frame: 'reed', base: 'tripod', pole: 'harpoon', blades: ['club', 'club', 'paddle'], shield: 'oval', armour: ['woven', 'quilted'], helm: ['hood', 'none'],
    k: { fr: 'reedGold', frF: 'reed', sh: 'timberDrift', me: 'boneIvory', meF: 'bone', pl: 'reedPale', plF: 'reed', ac: 'shellWhite', acF: 'shell', cl: 'clothLakeBlue', cl2: 'clothRush', le: 'reedDark', leF: 'reed', ro: 'ropeRush', sd: 'reedPale', sdF: 'reed' },
    n: ['Reed arms rack', ['bone harpoons', 'clubs and reed shields'], 'Reed armour on a tripod', ['woven reed and hood', 'quilted coat']] },
  { c: 'post-apoc', p: 'post-apoc', tier: 'common', frame: 'pipe', base: 'disc', pole: 'rifle', blades: ['machete', 'baton', 'machete'], shield: 'tower', armour: ['ancient', 'quilted'], helm: ['visor', 'cap'],
    k: { fr: 'alloyGrey', frF: 'metal', sh: 'plasticBlack', shF: 'plastic', me: 'steelLight', pl: 'alloyWhite', ac: 'alloyGrey', cl: 'clothSynthBlack', cl2: 'clothSynthTeal', le: 'plasticBlack', leF: 'plastic', sd: 'plasticBlack', sdF: 'plastic', gl: 'electric' },
    n: ['Salvager arms rack', ['Ancients rifles', 'machetes, batons and riot shields'], 'Ancients plate on a stand', ['white plate and visor', 'synthetic fatigues']] },
  { c: 'hykkousoi', p: 'hykkousoi', tier: 'common', frame: 'post', base: 'block', pole: 'spear', blades: ['gladius', 'scimitar', 'gladius'], shield: 'round', armour: ['muscle', 'linen'], helm: ['crest', 'crest'],
    k: { fr: 'timberOlive', sh: 'timberOliveDark', me: 'bronze', meF: 'bronze', pl: 'bronze', plF: 'bronze', ac: 'gold', acF: 'gold', cl: 'clothSeaGreen', cl2: 'clothLinen', le: 'clothLinen', leF: 'cloth', st: 'marbleWhite', sd: 'bronze', sdF: 'bronze', pm: 'clothSeaGreen', pmF: 'cloth' },
    n: ['Hykkousoi arms rack', ['spears', 'swords and bronze shields'], 'Hykkousoi armour on a stand', ['bronze cuirass and crested helm', 'linen corslet']] },
  { c: 'scyvoi', p: 'scyvoi', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'spear', blades: ['gladius', 'bow', 'axe'], shield: 'round', armour: ['scale', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'timberPoplar', sh: 'timberRed', me: 'ironBlack', pl: 'brass', ac: 'gold', acF: 'gold', cl: 'madder', cl2: 'indigo', le: 'leatherTan', ro: 'ropeHemp', sd: 'wicker', sdF: 'wicker' },
    n: ['Scyvoi arms rack', ['spears', 'akinakes, bows and wicker shields'], 'Scyvoi armour on a tripod', ['scale coat and helm', 'felt coat and hood']] },
  { c: 'zeijani', p: 'zeijani', tier: 'common', frame: 'stone', base: 'block', pole: 'spear', blades: ['khopesh', 'axe', 'khopesh'], shield: 'oval', armour: ['hide', 'quilted'], helm: ['pot', 'hood'],
    k: { fr: 'timber', sh: 'timberDark', me: 'obsidian', meF: 'obsidian', pl: 'copper', ac: 'bronze', acF: 'bronze', cl: 'mauve', cl2: 'teal', le: 'hide', st: 'tuff', sd: 'hideDark', sdF: 'hide', hm: 'copper' },
    n: ['Tuff arms niche', ['obsidian spears', 'khopeshes, axes and hide shields'], 'Zeijani armour on a stand', ['hide and copper plates', 'quilted coat']] },
  { c: 'ashnomad', p: 'ashnomad', tier: 'common', frame: 'lashed', base: 'tripod', pole: 'spear', blades: ['machete', 'machete', 'axe'], shield: 'oval', armour: ['chitin', 'quilted'], helm: ['mask', 'hood'],
    k: { fr: 'timberAsh', sh: 'timberDark', me: 'chitinAmber', meF: 'lacquer', pl: 'chitin', plF: 'lacquer', ac: 'chitinDark', acF: 'lacquer', cl: 'clothBlack', cl2: 'clothAsh', le: 'hide', ro: 'ropeHemp', sd: 'chitinDark', sdF: 'lacquer' },
    n: ['Ash arms rack', ['chitin spears', 'chitin blades and shields'], 'Chitin armour on a tripod', ['chitin plates and mask', 'black quilted coat']] },
  { c: 'eternian', p: 'eternian', tier: 'common', frame: 'post', base: 'block', armour: ['scale', 'quilted'], helm: ['mask', 'pot'], noRack: true,
    k: { fr: 'timber', sh: 'timber', me: 'bronze', meF: 'bronze', pl: 'bronze', plF: 'bronze', ac: 'gold', acF: 'gold', cl: 'linen', cl2: 'green', le: 'black', leF: 'lacquer', st: 'stone' },
    n: [null, null, 'Eternian armour on a stand', ['bronze scale and gold face', 'quilted coat and bronze cap']] },
  { c: 'pylon', p: 'pylon', tier: 'common', frame: 'pipe', base: 'block', pole: 'rifle', blades: ['baton', 'baton', 'machete'], shield: 'tower', armour: ['plate', 'quilted'], helm: ['visor', 'cap'],
    k: { fr: 'gunmetal', frF: 'metal', sh: 'walnutDark', me: 'gunmetal', pl: 'orangeLeather', plF: 'hide', ac: 'gunmetal', cl: 'linenWhite', cl2: 'walnut', le: 'walnutDark', st: 'concrete', sd: 'gunmetal', sdF: 'metal', hm: 'gunmetal', gl: 'linenWhite', glF: 'cloth' },
    n: ['Pylon arms rack', ['rifles', 'batons and riot shields'], 'Pylon armour on a stand', ['orange leather and visor', 'walnut fatigues']] },
  { c: 'talia', p: 'talia', tier: 'common', frame: 'post', base: 'block', pole: 'spear', blades: ['gladius', 'scimitar', 'gladius'], shield: 'round', armour: ['muscle', 'linen'], helm: ['crest', 'none'],
    k: { fr: 'walnut', sh: 'walnutDark', me: 'brass', pl: 'brass', ac: 'brass', cl: 'orange', cl2: 'linen', le: 'walnutDark', st: 'marble', sd: 'cobalt', pm: 'orange', pmF: 'cloth' },
    n: ["Talia guard's arms rack", ['spears', 'swords and cobalt shields'], "Talia guard's armour on a stand", ['brass cuirass and orange crest', 'linen corslet']] }
];

/* a slot's palette key and family, through ARMS_FALL when the row leaves the slot out */
function ARMS_slot(S, s) { while (S.k[s] == null && ARMS_FALL[s]) s = ARMS_FALL[s]; return s; }
function ARMS_fam(S, s) { const r = ARMS_slot(S, s); return S.k[r + 'F'] || ARMS_FAM[r]; }
/* the colours of every slot for one build; variant 1 swaps the two cloths */
function ARMS_P(F, S, v) {
  const P = {};
  for (const s of ARMS_SLOTS) { P[s] = F.col(S.k[ARMS_slot(S, s)]); P[s + 'F'] = ARMS_fam(S, s); }
  if (v === 1) { const c = P.cl; P.cl = P.cl2; P.cl2 = c; }
  return P;
}
/* the canonical materials a row can touch (every slot's family; a lashed or reed frame its rope too) */
function ARMS_materials(S) {
  const out = new Set();
  for (const s of ARMS_SLOTS) out.add(FAMILY_TO_MATERIAL[ARMS_fam(S, s)] || 'unassigned');
  return Array.from(out);
}

/* ---------------- the weapon rack: uprights and rails on the wall, a butt sill on the floor ---------------- */
function ARMS_head(F, P, kind, x, y, z) {
  const me = P.me, mf = P.meF, dk = F.shade(P.me, -0.2);
  if (kind === 'spear' || kind === 'pike' || kind === 'lance') {
    const r = kind === 'lance' ? 0.04 : kind === 'pike' ? 0.026 : 0.035, h = ARMS_HEAD[kind] - 0.04;
    F.cyl(x, y - 0.05, z, 0.021, 0.07, 0, dk, mf);                                         /* the socket */
    F.cone(x, y + 0.02, z, r, h, 0, me, mf);
  } else if (kind === 'glaive') {
    F.cyl(x, y - 0.05, z, 0.021, 0.08, 0, dk, mf);
    F.box(x + 0.022, y + 0.02, z, 0.075, 0.36, 0.014, 0, me, mf);                          /* the blade */
    F.beam(x + 0.06, y + 0.38, z, x + 0.01, y + 0.42, z, 0.03, 0.012, me, mf);             /* its swept point */
    F.box(x - 0.04, y + 0.1, z, 0.04, 0.05, 0.012, 0, dk, mf);                             /* the back spur */
  } else if (kind === 'halberd') {
    F.cyl(x, y - 0.05, z, 0.021, 0.08, 0, dk, mf);
    F.cone(x, y + 0.02, z, 0.02, 0.4, 0, me, mf);                                          /* the spike */
    F.box(x + 0.08, y + 0.08, z, 0.13, 0.17, 0.014, 0, me, mf);                            /* the axe blade */
    F.box(x - 0.055, y + 0.13, z, 0.07, 0.04, 0.012, 0, dk, mf);                           /* the back fluke */
  } else if (kind === 'trident') {
    F.rod(x - 0.085, y + 0.04, z, x + 0.085, y + 0.04, z, 0.012, dk, mf);                  /* the crossbar */
    for (const dx of [-0.075, 0, 0.075]) {
      F.rod(x + dx, y + 0.03, z, x + dx, y + 0.24, z, 0.01, me, mf);
      F.cone(x + dx, y + 0.24, z, 0.016, 0.06, 0, me, mf);
    }
  } else if (kind === 'harpoon') {
    F.cone(x, y + 0.02, z, 0.025, 0.24, 0, me, mf);
    for (const s of [-1, 1]) F.beam(x, y + 0.1, z, x + s * 0.05, y + 0.03, z, 0.014, 0.01, me, mf);   /* the barbs */
  } else if (kind === 'pilum') {
    F.ball(x, y + 0.01, z, 0.03, P.ac, P.acF);                                             /* the weight at the joint */
    F.rod(x, y, z, x, y + 0.44, z, 0.007, dk, mf);                                         /* the long iron shank */
    F.cone(x, y + 0.43, z, 0.017, 0.07, 0, me, mf);
  }
}
/* a rifle standing in the sill, muzzle up: stock, receiver, barrel, foregrip and sling */
function ARMS_rifle(F, P, x, zb) {
  const z0 = zb + 0.28;
  F.beam(x, 0.1, z0, x, 0.48, z0 - 0.03, 0.05, 0.11, P.sh, P.shF);                         /* the stock */
  F.beam(x, 0.48, z0 - 0.03, x, 0.74, z0 - 0.06, 0.045, 0.07, P.me, P.meF);                /* the receiver */
  F.beam(x, 0.74, z0 - 0.06, x, 1.12, z0 - 0.1, 0.04, 0.05, P.sh, P.shF);                  /* the foregrip */
  F.rod(x, 0.74, z0 - 0.07, x, 1.5, z0 - 0.15, 0.012, P.me, P.meF);                        /* the barrel */
  F.rod(x, 0.3, z0 + 0.03, x, 1.08, z0 - 0.05, 0.006, P.le, P.leF);                        /* the sling */
}
/* the hung blades of variant 1: each hangs from its peg at yT, point down, at depth z */
function ARMS_blade(F, P, kind, x, yT, z) {
  const me = P.me, mf = P.meF, sh = P.sh, sf = P.shF, le = P.le, lf = P.leF, ac = P.ac, af = P.acF;
  const hilt = (len) => {
    F.ball(x, yT - 0.01, z, 0.026, ac, af);                                                /* the pommel */
    F.cyl(x, yT - 0.03 - len, z, 0.016, len, 0, le, lf);                                   /* the grip */
    F.box(x, yT - 0.065 - len, z, 0.16, 0.035, 0.036, 0, ac, af);                          /* the guard */
    return yT - 0.065 - len;
  };
  const curve = (y0, pts) => { let px = x, py = y0; for (const [dx, dy] of pts) { F.beam(px, py, z, x + dx, y0 - dy, z, 0.052, 0.012, me, mf); px = x + dx; py = y0 - dy; } };
  if (kind === 'sword' || kind === 'gladius') {
    const y = hilt(0.16), L = kind === 'gladius' ? 0.46 : 0.68, bw = kind === 'gladius' ? 0.06 : 0.048;
    F.box(x, y - L, z, bw, L, 0.012, 0, me, mf);
    F.beam(x - bw / 2 + 0.006, y - L, z, x, y - L - 0.08, z, 0.014, 0.012, me, mf);        /* the point */
    F.beam(x + bw / 2 - 0.006, y - L, z, x, y - L - 0.08, z, 0.014, 0.012, me, mf);
  } else if (kind === 'scimitar' || kind === 'talwar') {
    if (kind === 'talwar') F.cyl(x, yT - 0.02, z, 0.034, 0.014, 0, ac, af);               /* the disc pommel */
    const y = hilt(0.15);
    curve(y, [[0.008, 0.24], [0.035, 0.46], [0.085, 0.63], [0.15, 0.74]]);
  } else if (kind === 'khopesh') {
    const y = hilt(0.2);
    curve(y, [[0, 0.24], [0.04, 0.38], [0.12, 0.45], [0.17, 0.4]]);
  } else if (kind === 'machete') {
    const y = hilt(0.14);
    F.box(x + 0.012, y - 0.46, z, 0.08, 0.46, 0.012, 0, me, mf);
    F.beam(x + 0.052, y - 0.46, z, x - 0.02, y - 0.54, z, 0.03, 0.012, me, mf);            /* the clipped tip */
  } else if (kind === 'axe') {
    F.rod(x, yT + 0.03, z, x, yT - 0.78, z, 0.016, sh, sf);                                /* the haft, head up */
    F.box(x + 0.065, yT - 0.24, z, 0.13, 0.15, 0.022, 0, me, mf);                          /* the head */
    F.box(x - 0.025, yT - 0.21, z, 0.04, 0.09, 0.03, 0, F.shade(me, -0.2), mf);            /* the poll */
  } else if (kind === 'club') {
    F.rod(x, yT, z, x, yT - 0.44, z, 0.018, sh, sf);
    F.blob(x, yT - 0.62, z, 0.06, 0.32, 0, F.shade(sh, 0.1), sf);                         /* the head, hung down */
    F.cyl(x, yT - 0.47, z, 0.03, 0.03, 0, ac, af);                                         /* its collar */
  } else if (kind === 'paddle') {
    F.rod(x, yT, z, x, yT - 0.42, z, 0.018, sh, sf);
    F.box(x, yT - 0.96, z, 0.11, 0.54, 0.03, 0, F.shade(sh, 0.08), sf);                    /* the blade-club */
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) F.box(x + s * 0.062, yT - 0.92 + i * 0.12, z, 0.016, 0.04, 0.012, 0, me, mf);   /* teeth or stone edges */
  } else if (kind === 'baton') {
    F.cyl(x, yT - 0.2, z, 0.018, 0.18, 0, le, lf);
    F.rod(x, yT - 0.2, z, x, yT - 0.74, z, 0.02, F.shade(me, -0.25), mf);
    F.box(x, yT - 0.8, z, 0.036, 0.07, 0.036, 0, P.gl, P.glF);                             /* the tip */
  } else if (kind === 'bow') {
    const pts = [[0, 0], [0.085, 0.28], [0.11, 0.55], [0.085, 0.82], [0, 1.1]];
    for (let i = 1; i < pts.length; i++) F.beam(x + pts[i - 1][0], yT - pts[i - 1][1], z, x + pts[i][0], yT - pts[i][1], z, 0.028, 0.024, sh, sf);
    F.rod(x, yT, z, x, yT - 1.1, z, 0.004, P.ro, P.roF);                                   /* the string */
  }
}
/* the shields of variant 1, on their pegs (centre at x, yc; their backs at depth z) */
function ARMS_shield(F, P, kind, x, yc, z) {
  const sd = P.sd, sf = P.sdF, ac = P.ac, af = P.acF;
  if (kind === 'round') {
    F.rod(x, yc, z, x, yc, z + 0.03, 0.29, F.shade(sd, -0.22), sf);                       /* the rim */
    F.rod(x, yc, z + 0.004, x, yc, z + 0.036, 0.27, sd, sf);                               /* the face */
    F.rod(x, yc, z + 0.036, x, yc, z + 0.042, 0.16, P.cl, P.clF);                          /* its painted field */
    F.ball(x, yc, z + 0.045, 0.055, ac, af);                                               /* the boss */
  } else if (kind === 'oval') {
    F.ell(x, yc, z + 0.025, 0.2, 0.3, 0.025, 0, sd, sf);
    F.box(x, yc - 0.27, z + 0.04, 0.04, 0.54, 0.016, 0, P.le, P.leF);                      /* the spine */
    F.ball(x, yc, z + 0.05, 0.045, ac, af);
  } else if (kind === 'tower') {
    F.box(x, yc - 0.4, z, 0.46, 0.78, 0.04, 0, sd, sf);
    for (const s of [-1, 1]) F.box(x, yc + (s > 0 ? 0.36 : -0.42), z + 0.04, 0.46, 0.03, 0.01, 0, ac, af);   /* the rim bars */
    F.ball(x, yc - 0.01, z + 0.04, 0.07, ac, af);
  } else if (kind === 'kite') {
    F.box(x, yc - 0.12, z, 0.4, 0.4, 0.035, 0, sd, sf);
    F.box(x, yc - 0.32, z, 0.28, 0.2, 0.035, 0, sd, sf);
    F.box(x, yc - 0.44, z, 0.14, 0.12, 0.035, 0, sd, sf);
    F.box(x, yc - 0.42, z + 0.035, 0.06, 0.6, 0.006, 0, P.cl, P.clF);                      /* the cross */
    F.box(x, yc + 0.08, z + 0.035, 0.36, 0.06, 0.006, 0, P.cl, P.clF);
  }
}
function ARMS_rack(F, S, o) {
  const v = o.variant || 0, W = o.w, D = o.d, H = o.h, P = ARMS_P(F, S, v);
  const f = S.frame, fr = P.fr, frD = F.shade(P.fr, -0.18), ff = P.frF, xs = W / 2 - 0.07;
  const zb = -D / 2 + (f === 'stone' ? 0.1 : 0), round = f !== 'post' && f !== 'stone';
  const r = f === 'pipe' ? 0.03 : f === 'reed' ? 0.06 : 0.045, top = S.court ? H - 0.1 : H - 0.02;
  /* the uprights against the wall (the stone frame: a back slab of the culture's stone, the rails on it) */
  if (f === 'stone') F.box(0, 0, -D / 2 + 0.05, W, H, 0.1, 0, P.st, P.stF);
  for (const s of [-1, 1]) {
    if (f === 'stone') continue;
    if (round) F.rod(s * xs, 0, -D / 2 + r + 0.005, s * xs, top, -D / 2 + r + 0.005, r, fr, ff);
    else F.box(s * xs, 0, -D / 2 + 0.05, 0.1, top, 0.1, 0, fr, ff);
    if (f === 'bamboo') for (let y = 0.42; y < top - 0.1; y += 0.46) F.cyl(s * xs, y, -D / 2 + r + 0.005, r + 0.008, 0.025, 0, frD, ff);   /* the nodes */
  }
  const rail = (y, z, d, c) => {
    if (round) F.rod(-xs - r, y, z, xs + r, y, z, Math.min(r, 0.032), c, ff);
    else F.box(0, y, z, 2 * xs + 0.1, 0.09, d, 0, c, ff);
  };
  const lash = (y) => { const z = -D / 2 + r + 0.015; if (f === 'lashed' || f === 'reed' || f === 'bamboo') for (const s of [-1, 1]) F.rod(s * xs - 0.06, y, z, s * xs + 0.06, y, z, r + 0.012, P.ro, P.roF); };
  rail(H - 0.32, zb + 0.035, 0.07, frD); lash(H - 0.32);
  rail(0.95, zb + 0.035, 0.07, frD); lash(0.95);
  /* the butt sill on the floor and the arms that tie it to the uprights */
  F.box(0, 0, zb + 0.28, 2 * xs, 0.14, 0.18, 0, frD, ff);
  for (const s of [-1, 1]) F.box(s * xs, 0, zb + 0.185, 0.08, 0.14, 0.37, 0, frD, ff);
  if (S.court) {
    F.box(0, H - 0.56, zb + 0.08, 2 * xs - 0.12, 0.22, 0.02, 0, P.cl, P.clF);              /* the valance */
    F.box(0, H - 0.58, zb + 0.092, 2 * xs - 0.12, 0.03, 0.01, 0, P.ac, P.acF);             /* its trim */
    for (const s of [-1, 1]) F.ball(s * xs, H - 0.06, -D / 2 + 0.05, 0.05, P.ac, P.acF);   /* the finials */
  }
  if (v === 0) {
    const n = 6, x0 = -xs + 0.2, dx = (2 * xs - 0.4) / (n - 1);
    if (S.pole === 'rifle') {
      rail(1.3, zb + 0.13, 0.06, frD);                                                     /* the rail the muzzles lean on */
      for (const s of [-1, 1]) F.box(s * xs, 1.3, zb + 0.09, 0.07, 0.09, 0.12, 0, frD, ff);
      for (let i = 0; i < n; i++) ARMS_rifle(F, P, x0 + i * dx, zb);
      return;
    }
    const yh = H - 0.62, ys = H - 0.04 - ARMS_HEAD[S.pole], zt = zb + 0.13;
    rail(yh, zb + 0.16, 0.06, frD);                                                        /* the holder rail the shafts pass */
    for (const s of [-1, 1]) F.box(s * xs, yh, zb + 0.1, 0.07, 0.09, 0.14, 0, frD, ff);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * dx;
      F.rod(x, 0.12, zb + 0.28, x, ys, zt, 0.017, P.sh, P.shF);
      if (S.pole === 'lance') F.frustum(x, 1.0, zb + 0.24, 0.085, 0.022, 0.2, 0, P.ac, P.acF);   /* the vamplate */
      if (S.court) F.blob(x, ys - 0.05, zt, 0.03, 0.12, 0, P.cl, P.clF);                   /* the tassel */
      ARMS_head(F, P, S.pole, x, ys, zt);
    }
  } else {
    const yT = 1.45, zi = zb + 0.18, slots = [-0.64, -0.32, 0, 0.32, 0.64].map(x => x * (2 * xs) / 1.66);
    rail(1.42, zb + 0.07, 0.06, frD);                                                      /* the peg rail */
    slots.forEach((x, i) => {
      F.rod(x, yT + 0.02, zb + 0.05, x, yT + 0.02, zb + 0.17, 0.012, frD, ff);             /* the peg */
      ARMS_blade(F, P, S.blades[i % S.blades.length], x, yT, zi);
    });
    if (S.shield === 'none') {
      F.box(0, 1.9, zb + 0.15, 2 * xs, 0.04, 0.26, 0, frD, ff);                            /* the helmet shelf */
      for (const s of [-1, 1]) {
        F.dome(s * 0.42, 1.94, zb + 0.17, 0.13, 0.15, 0, P.hm, P.hmF);
        F.cyl(s * 0.42, 1.94, zb + 0.17, 0.16, 0.012, 0, F.shade(P.hm, -0.1), P.hmF);       /* the brim */
      }
    } else for (const s of [-1, 1]) {
      F.rod(s * 0.42, 1.98, zb + 0.05, s * 0.42, 1.98, zb + 0.12, 0.014, frD, ff);
      ARMS_shield(F, P, S.shield, s * 0.42, 1.95, zb + 0.12);
    }
  }
}

/* ---------------- the armour stand: a foot, a post with a shoulder bar, the armour, the helm ---------------- */
function ARMS_torso(F, S, P, kind) {
  const pl = P.pl, pf = P.plF, cl = P.cl, cf = P.clF, le = P.le, lf = P.leF, ac = P.ac, af = P.acF;
  const pauldrons = (c, f) => { for (const s of [-1, 1]) F.ell(s * 0.24, 1.4, 0, 0.11, 0.07, 0.12, 0, c, f); };
  const pteruges = (y, n) => { for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * F.TAU; F.box(0.21 * Math.sin(a), y, 0.155 * Math.cos(a), 0.07, 0.3, 0.015, a, le, lf); } };
  const rings = (y0, h, r0, r1, n, c, f) => { for (let i = 1; i < n; i++) { const t = i / n, r = r0 + (r1 - r0) * t; F.frustum(0, y0 + h * t - 0.006, 0, r + 0.006, r + 0.004, 0.012, 0, c, f); } };
  if (kind === 'plate') {
    F.frustum(0, 0.6, 0, 0.2, 0.19, 0.3, 0, cl, cf);                                       /* the arming coat below */
    for (let i = 0; i < 3; i++) F.frustum(0, 0.64 + i * 0.075, 0, 0.225 - i * 0.008, 0.215 - i * 0.008, 0.07, 0, i % 2 ? F.shade(pl, -0.1) : pl, pf);   /* the faulds */
    F.ell(0, 1.17, 0.01, 0.2, 0.3, 0.15, 0, pl, pf);                                       /* the breastplate */
    F.ell(0, 0.95, 0.025, 0.18, 0.13, 0.13, 0, F.shade(pl, -0.08), pf);                    /* the plackart */
    F.cyl(0, 1.4, 0, 0.09, 0.07, 0, F.shade(pl, 0.1), pf);                                 /* the gorget */
    pauldrons(pl, pf);
    F.box(0, 1.12, 0.155, 0.04, 0.2, 0.012, 0, ac, af);                                    /* the ridge strap */
  } else if (kind === 'muscle') {
    F.ell(0, 1.15, 0, 0.2, 0.3, 0.15, 0, pl, pf);
    for (const s of [-1, 1]) F.ell(s * 0.08, 1.27, 0.1, 0.08, 0.06, 0.05, 0, F.shade(pl, 0.1), pf);   /* the chest */
    F.ell(0, 1.03, 0.1, 0.1, 0.12, 0.05, 0, F.shade(pl, 0.06), pf);
    F.frustum(0, 0.83, 0, 0.21, 0.2, 0.05, 0, ac, af);                                     /* the belt */
    pteruges(0.53, 10);
    for (const s of [-1, 1]) F.box(s * 0.12, 1.36, 0, 0.12, 0.04, 0.3, 0, le, lf);         /* the shoulder flaps */
  } else if (kind === 'linen') {
    F.box(0, 0.84, 0, 0.42, 0.56, 0.3, 0, cl, cf);                                         /* the corslet */
    F.box(0, 0.84, 0, 0.43, 0.06, 0.31, 0, ac, af);                                        /* its belt */
    for (const s of [-1, 1]) F.box(s * 0.12, 1.38, 0, 0.12, 0.04, 0.3, 0, cl, cf);         /* the shoulder flaps */
    for (const s of [-1, 1]) F.ball(s * 0.12, 1.37, 0.14, 0.02, ac, af);                   /* their studs */
    pteruges(0.54, 10);
  } else if (kind === 'segmentata') {
    F.frustum(0, 0.5, 0, 0.22, 0.2, 0.32, 0, cl, cf);                                      /* the tunic's skirt */
    for (let i = 0; i < 7; i++) F.box(0, 0.8 + i * 0.085, 0, 0.42 - Math.abs(i - 3) * 0.012, 0.078, 0.3 - Math.abs(i - 3) * 0.01, 0, i % 2 ? F.shade(pl, -0.12) : pl, pf);   /* the hoops */
    for (const s of [-1, 1]) { F.ell(s * 0.23, 1.42, 0, 0.12, 0.06, 0.13, 0, pl, pf); F.ell(s * 0.25, 1.36, 0, 0.11, 0.05, 0.12, 0, F.shade(pl, -0.1), pf); }
    for (const s of [-1, 1]) F.box(s * 0.08, 1.15, 0.155, 0.04, 0.03, 0.01, 0, ac, af);   /* the fittings */
    pteruges(0.52, 8);
  } else if (kind === 'lamellar') {
    for (let i = 0; i < 7; i++) F.box(0, 0.72 + i * 0.1, 0, 0.44 - (i === 6 ? 0.06 : 0), 0.095, 0.31, 0, i % 2 ? F.shade(pl, 0.1) : pl, pf);   /* the rows of lames */
    for (let k = -2; k <= 2; k++) F.box(k * 0.085, 0.72, 0.156, 0.012, 0.68, 0.006, 0, le, lf);   /* the lacing */
    for (const s of [-1, 1]) F.box(s * 0.11, 0.42, 0.01, 0.2, 0.3, 0.29, 0, F.shade(pl, -0.05), pf);   /* the split skirt */
    for (const s of [-1, 1]) F.box(s * 0.25, 1.3, 0, 0.12, 0.14, 0.28, 0, pl, pf);         /* the shoulder guards */
    F.box(0, 0.8, 0, 0.45, 0.05, 0.32, 0, ac, af);                                          /* the belt */
  } else if (kind === 'scale') {
    for (let i = 0; i < 9; i++) { const r = 0.245 - i * 0.005; F.frustum(0, 0.6 + i * 0.095, 0, r + 0.01, r - 0.004, 0.095, 0, i % 2 ? F.shade(pl, -0.14) : pl, pf); }
    for (const s of [-1, 1]) F.ell(s * 0.24, 1.38, 0, 0.12, 0.07, 0.13, 0, F.shade(pl, 0.06), pf);
    F.frustum(0, 0.86, 0, 0.25, 0.25, 0.04, 0, le, lf);                                    /* the belt */
  } else if (kind === 'mail') {
    F.frustum(0, 0.55, 0, 0.25, 0.2, 0.9, 0, pl, pf);                                      /* the hauberk */
    for (const s of [-1, 1]) F.ell(s * 0.22, 1.3, 0, 0.09, 0.15, 0.1, 0, F.shade(pl, -0.08), pf);   /* the sleeves */
    F.frustum(0, 0.9, 0, 0.228, 0.226, 0.04, 0, le, lf);                                   /* the belt */
    if (S.tabard) for (const s of [-1, 1]) F.box(0, 0.6, s * 0.236, 0.3, 0.82, 0.016, 0, cl, cf);   /* the tabard */
  } else if (kind === 'quilted') {
    F.frustum(0, 0.5, 0, 0.26, 0.21, 0.95, 0, cl, cf);
    rings(0.5, 0.95, 0.26, 0.21, 8, F.shade(cl, -0.16), cf);                               /* the quilting */
    for (const s of [-1, 1]) F.ell(s * 0.22, 1.3, 0, 0.09, 0.15, 0.1, 0, cl, cf);
    F.cyl(0, 1.43, 0, 0.1, 0.06, 0, F.shade(cl, -0.08), cf);                               /* the collar */
  } else if (kind === 'hide' || kind === 'bone') {
    F.frustum(0, 0.55, 0, 0.25, 0.21, 0.9, 0, le, lf);
    if (kind === 'hide') for (let i = 0; i < 4; i++) F.ell(0, 0.8 + i * 0.15, 0.2, 0.15, 0.07, 0.04, 0, i % 2 ? F.shade(pl, -0.1) : pl, pf);   /* the plates */
    else for (let i = 0; i < 6; i++) F.box(0, 0.84 + i * 0.09, 0.19, 0.34 - i * 0.02, 0.04, 0.04, 0, pl, pf);   /* the ribs */
    pauldrons(pl, pf);
    F.blob(0, 1.42, 0, 0.16, 0.12, 0, F.shade(le, -0.1), lf);                              /* the collar */
  } else if (kind === 'chitin') {
    F.frustum(0, 0.5, 0, 0.21, 0.2, 0.3, 0, le, lf);
    for (let i = 0; i < 5; i++) F.ell(0, 0.78 + i * 0.15, 0, 0.23 - i * 0.008, 0.1, 0.17, 0, i % 2 ? F.shade(pl, -0.12) : pl, pf);   /* the plates */
    for (const s of [-1, 1]) F.ell(s * 0.24, 1.38, 0, 0.13, 0.08, 0.14, 0, ac, af);
    F.ell(0, 0.6, 0.02, 0.22, 0.1, 0.16, 0, ac, af);                                        /* the tasset */
  } else if (kind === 'woven') {
    F.frustum(0, 0.5, 0, 0.25, 0.22, 0.95, 0, pl, pf);
    rings(0.5, 0.95, 0.25, 0.22, 7, F.shade(pl, -0.18), pf);                               /* the weave's bands */
    F.box(0, 1.22, -0.2, 0.4, 0.4, 0.04, 0, pl, pf);                                        /* the high back */
  } else if (kind === 'slat') {
    for (let i = 0; i < 14; i++) { const a = i / 14 * F.TAU; F.box(0.21 * Math.sin(a), 0.7, 0.16 * Math.cos(a), 0.075, 0.64, 0.025, a, i % 2 ? F.shade(pl, -0.08) : pl, pf); }
    for (const y of [0.8, 1.02, 1.24]) F.ell(0, y, 0, 0.23, 0.014, 0.18, 0, P.ro, P.roF);  /* the bindings */
    F.box(0, 1.15, 0.17, 0.12, 0.12, 0.012, 0, ac, af);                                     /* the painted crest */
    F.cyl(0, 1.34, 0, 0.12, 0.1, 0, le, lf);                                                /* the collar */
  } else if (kind === 'ancient') {
    F.frustum(0, 0.55, 0, 0.22, 0.2, 0.4, 0, cl, cf);                                      /* the undersuit */
    F.ell(0, 1.17, 0, 0.2, 0.3, 0.15, 0, pl, pf);
    for (let i = 0; i < 3; i++) F.box(0, 0.68 + i * 0.07, 0, 0.36 - i * 0.02, 0.06, 0.27, 0, i % 2 ? F.shade(pl, -0.1) : pl, pf);   /* the abdomen */
    F.box(0, 1.0, 0.148, 0.03, 0.26, 0.01, 0, P.gl, P.glF);                                 /* the light strips */
    F.box(0, 1.32, 0.13, 0.24, 0.02, 0.01, 0, P.gl, P.glF);
    pauldrons(pl, pf);
  } else if (kind === 'scrap') {
    F.frustum(0, 0.5, 0, 0.25, 0.21, 0.95, 0, cl, cf);
    F.box(-0.06, 1.0, 0.18, 0.22, 0.3, 0.03, F.rr(-0.25, 0.25), pl, pf);                   /* the mismatched plates */
    F.box(0.08, 0.78, 0.17, 0.2, 0.22, 0.03, F.rr(-0.25, 0.25), F.shade(pl, -0.12), pf);
    F.box(0.05, 1.18, 0.15, 0.16, 0.16, 0.03, F.rr(-0.3, 0.3), P.ac, P.acF);
    for (const s of [-1, 1]) F.ell(s * 0.24, 1.38, 0, 0.12, 0.07, 0.12, 0, le, lf);        /* the shoulder pads */
    F.frustum(0, 0.86, 0, 0.255, 0.252, 0.04, 0, P.ro, P.roF);                             /* the cord belt */
  }
}
function ARMS_helm(F, P, kind) {
  const hm = P.hm, hf = P.hmF;
  if (kind === 'pot') {
    F.dome(0, 1.55, 0, 0.13, 0.16, 0, hm, hf);
    F.cyl(0, 1.55, 0, 0.136, 0.03, 0, P.ac, P.acF);
  } else if (kind === 'spike') {
    F.frustum(0, 1.42, 0, 0.145, 0.13, 0.13, 0, F.shade(hm, -0.1), hf);                    /* the aventail */
    F.dome(0, 1.55, 0, 0.13, 0.18, 0, hm, hf);
    F.cone(0, 1.7, 0, 0.022, 0.16, 0, P.ac, P.acF);
  } else if (kind === 'crest' || kind === 'plume') {
    F.dome(0, 1.55, 0, 0.13, 0.17, 0, hm, hf);
    for (const s of [-1, 1]) F.box(s * 0.11, 1.45, 0.04, 0.025, 0.12, 0.1, 0, hm, hf);     /* the cheek guards */
    if (kind === 'crest') { F.box(0, 1.7, 0, 0.02, 0.04, 0.04, 0, P.ac, P.acF); F.box(0, 1.73, 0, 0.035, 0.11, 0.34, 0, P.pm, P.pmF); }
    else { F.cone(0, 1.7, 0, 0.02, 0.06, 0, P.ac, P.acF); F.blob(0, 1.82, 0, 0.05, 0.18, 0, P.pm, P.pmF); }
  } else if (kind === 'horn') {
    F.dome(0, 1.55, 0, 0.13, 0.16, 0, hm, hf);
    for (const s of [-1, 1]) { F.rod(s * 0.1, 1.62, 0, s * 0.2, 1.8, 0, 0.022, P.ac, P.acF); F.cone(s * 0.2, 1.79, 0, 0.02, 0.08, 0, P.ac, P.acF); }
  } else if (kind === 'mask') {
    F.ell(0, 1.66, 0, 0.12, 0.14, 0.12, 0, hm, hf);
    F.box(0, 1.55, 0.1, 0.17, 0.22, 0.03, 0, P.ac, P.acF);                                 /* the face */
    for (const s of [-1, 1]) F.box(s * 0.04, 1.68, 0.128, 0.05, 0.008, 0.006, 0, F.shade(P.ac, -0.45), P.acF);   /* its closed eyes */
    F.box(0, 1.73, 0.1, 0.18, 0.025, 0.035, 0, F.shade(P.ac, 0.1), P.acF);                 /* the brow */
  } else if (kind === 'great') {
    F.cyl(0, 1.5, 0, 0.13, 0.26, 0, hm, hf);
    F.dome(0, 1.76, 0, 0.13, 0.04, 0, hm, hf);
    F.box(0, 1.63, 0.124, 0.2, 0.014, 0.012, 0, F.shade(hm, -0.6), hf);                    /* the sight */
    F.box(0, 1.5, 0.126, 0.03, 0.12, 0.01, 0, P.ac, P.acF);                                /* the breaths' cross */
  } else if (kind === 'visor') {
    F.ell(0, 1.65, 0, 0.13, 0.15, 0.14, 0, hm, hf);
    F.box(0, 1.62, 0.1, 0.2, 0.06, 0.05, 0, P.gl, P.glF);
  } else if (kind === 'cap') {
    F.dome(0, 1.55, 0, 0.12, 0.1, 0, P.cl, P.clF);
    F.box(0, 1.555, 0.13, 0.14, 0.012, 0.08, 0, P.le, P.leF);                              /* the peak */
  } else if (kind === 'hood') {
    F.blob(0, 1.68, 0, 0.13, 0.3, 0, P.cl, P.clF);
  }
}
function ARMS_stand(F, S, o) {
  const v = o.variant || 0, P = ARMS_P(F, S, v), fr = P.fr, frD = F.shade(P.fr, -0.18), ff = P.frF;
  let y0 = 0;
  if (S.base === 'cross') { F.box(0, 0, 0, 0.66, 0.07, 0.12, 0, frD, ff); F.box(0, 0, 0, 0.12, 0.07, 0.5, 0, frD, ff); y0 = 0.07; }
  else if (S.base === 'disc') { F.cyl(0, 0, 0, 0.26, 0.05, 0, frD, ff); y0 = 0.05; }
  else if (S.base === 'block') { F.box(0, 0, 0, 0.56, 0.14, 0.46, 0, P.st, P.stF); y0 = 0.14; }
  else {
    for (let i = 0; i < 3; i++) { const a = (i + 0.5) / 3 * F.TAU; F.rod(0.04 * Math.sin(a), 0.62, 0.04 * Math.cos(a), 0.26 * Math.sin(a), 0, 0.26 * Math.cos(a), 0.022, fr, ff); }
    F.cyl(0, 0.55, 0, 0.06, 0.1, 0, P.ro, P.roF);                                           /* the lashing */
  }
  F.cyl(0, y0, 0, 0.03, 1.55 - y0, 0, fr, ff);                                              /* the post */
  F.rod(-0.3, 1.43, 0, 0.3, 1.43, 0, 0.022, fr, ff);                                        /* the shoulder bar */
  if (S.court) {
    F.box(0, 0.4, -0.215, 0.5, 1.05, 0.03, 0, P.cl2, P.cl2F);                               /* the cloak */
    for (const s of [-1, 1]) F.ball(s * 0.2, 1.42, -0.19, 0.03, P.ac, P.acF);               /* its clasps */
  }
  ARMS_torso(F, S, P, S.armour[v]);
  ARMS_helm(F, P, S.helm[v]);
}

/* ---------------- the pieces: a weapon rack and an armour stand for every row ---------------- */
for (const S of ARMS) {
  const rooms = ARMS_ROOMS.concat(S.rooms || []), mats = ARMS_materials(S);
  if (!S.noRack) FURN({
    key: S.p + '_' + S.tier + '_weapon_rack', name: S.n[0], culture: S.c, tier: S.tier, type: 'weapon', role: 'weapon_rack', setting: 'indoor',
    rooms: rooms, anchor: 'wall', clearance: { front: 0.8 }, materials: mats,
    w: 1.8, d: 0.5, h: 2.4, variants: 2, variantNames: S.n[1],
    build: function (F) { ARMS_rack(F, S, { variant: F.variant, w: 1.8, d: 0.5, h: 2.4 }); }
  });
  FURN({
    key: S.p + '_' + S.tier + '_armour_stand', name: S.n[2], culture: S.c, tier: S.tier, type: 'rack', role: 'armour_stand', setting: 'indoor',
    rooms: rooms, anchor: 'floor', clearance: { front: 0.6, left: 0.2, right: 0.2 }, materials: mats,
    w: 0.8, d: 0.6, h: 1.95, variants: 2, variantNames: S.n[3],
    build: function (F) { ARMS_stand(F, S, { variant: F.variant }); }
  });
}
