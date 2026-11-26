// ================================================================= CORE TAGS — the vocabulary ([G data])
// The one table of the values core/tags knows (PROPOSAL.md, "Vocabularies" and "Decisions"). The catalog's lists
// are COPIED here, not read at run time: a build need not load kits/catalog to tag what it places. test-tags.js
// reads kits/catalog/krator-furniture-core.js and fails when a copied list no longer matches its source, so drift
// is a failing test, not a silent fork.
//
//   KTAGS.VOCAB.classes, cultures, cultureNames, cultureAlias, types, wealth, wealthAlias, wealthOf(0..1), tiers,
//               states, settings, jobs, koppen, doorStyles, lightKinds, keys (tag key -> its rule), prefix
(function(){
 'use strict';
 var K = typeof KTAGS !== 'undefined' ? KTAGS : globalThis.KTAGS;
 if (!K) throw new Error('52-core-tags-vocab: load 50-core-tags.js first');

 // ---- copied from core/catalog/krator-furniture-core.js (checked by test-tags.js) ----
 // FURN_CULTURES (the 36 the core file lists before any culture file registers itself)
 var CATALOG_CULTURES = ['ancient', 'ancients-salvage', 'yuni-court', 'yuni-common', 'yuni-poor', 'sahelian', 'order', 'nomad',
   'voth', 'iziz', 'beast-rider', 'generic', 'scrap', 'lizardmen', 'eastabyss', 'xanadu', 'screamer', 'islander', 'republican',
   'rustic', 'painted', 'reedlake', 'post-apoc', 'hykkousoi', 'scyvoi', 'zeijani', 'ashnomad', 'eternian',
   'khaayken', 'tungang', 'fellgang', 'talovolci', 'jimjam', 'dalab', 'pylon', 'talia'];
 // BUILDING_TYPES
 var CATALOG_TYPES = ['civic', 'market', 'shop', 'tavern', 'inn', 'industry', 'farm', 'dwelling-single', 'dwelling-multi',
   'infrastructure', 'religious', 'funerary'];
 // FURN_TIERS: a 0..1 wealth band per tier
 var CATALOG_TIERS = { poor: [0, 0.35], common: [0.3, 0.75], court: [0.7, 1] };
 // FURN_JOBS
 var CATALOG_JOBS = ['farming', 'fishing', 'salt', 'oil', 'smithing', 'milling', 'warehousing', 'brewing', 'weaving',
   'tanning', 'pottery', 'carpentry', 'mining', 'herding', 'trading',
   // the Zeijani trades (kits/zeijani, 2026-10-07): the alecap and cave-fungus farms, the fungal alchemists, the dyers,
   // the stonecutters, the lampwrights, the obsidian knappers and the rope and caving outfitters
   'fungiculture', 'alchemy', 'dyeing', 'masonry', 'lampmaking', 'knapping', 'ropemaking',
   // the trades audit of 2026-10-19: FK.ROLES.works and the culture files' bespoke work pieces
   'baking', 'butchery', 'healing', 'scribing', 'shipwrighting', 'quarrying', 'customs', 'worship', 'dairy'];
 // FURN_SETTINGS, plus core/furnish's 'room' (a piece the interiors place)
 var CATALOG_SETTINGS = ['indoor', 'outdoor', 'both'];

 // ---- the cultures, cleaned (PROPOSAL.md, "The culture list, cleaned"): 30 (Scyvoi added 2026-10-05, Zeijani and the Ash Nomads 2026-10-07, Jimjam and Dalab 2026-10-20, the Eternians 2026-10-20; the Khaayken, Tungangs, Fellgangs, Talovolci, Pylon and Talia 2026-11-03, kits/yeti/PLAN.md section 11) ----
 // Display names are FURN_CULTURE_INFO's (the core file and each culture file's FURN_CULTURE(key, { name })).
 var CULTURE_NAMES = {
   'ancient': 'Ancients', 'yuni': 'Yuni', 'order': 'The Order', 'nomad': 'Eastern Nomads', 'voth': 'Voth', 'iziz': 'Iziz',
   'beast-rider': 'Beast Riders', 'lizardmen': 'Lizardmen', 'eastabyss': 'East Abyss', 'xanadu': 'Xanadu', 'screamer': 'Screamers',
   'islander': 'Ring Sea Islanders', 'republican': 'Republicans', 'rustic': 'Rustic Highlanders', 'painted': 'Painted Men',
   'reedlake': 'Reed Lake', 'post-apoc': 'Post-Apoc salvage', 'hykkousoi': 'Hykkousoi', 'scyvoi': 'Scyvoi',
   'zeijani': 'Zeijani', 'ashnomad': 'Ash Nomads', 'eternian': 'Eternians',
   'jimjam': 'Jimjam', 'dalab': 'Dalab', 'khaayken': 'Khaayken', 'tungang': 'Tungangs', 'fellgang': 'Fellgangs',
   'talovolci': 'Talovolci', 'pylon': 'Pylon', 'talia': 'Talia'
 };
 // cultures of a settlement with no catalog furniture set (yet): not in FURN_CULTURES, so test-tags.js does not look for them there
 var NO_CATALOG = [];   // Jimjam and Dalab have their culture files since 2026-11-03
 var CULTURES = Object.keys(CULTURE_NAMES);
 // old spellings and catalog sets on input: the culture they become, and the tags they bring (never over a given one)
 var CULTURE_ALIAS = {
   'ancients-salvage': { culture: 'ancient', state: 'salvage' },
   'yuni-court': { culture: 'yuni', wealth: 'rich' },
   'yuni-common': { culture: 'yuni', wealth: 'middle' },
   'yuni-poor': { culture: 'yuni', wealth: 'poor' },
   'sahelian': { culture: 'yuni', style: 'sahelian' },
   'iziz-old': { culture: 'iziz' },
   // Iziz's REG (2026-10-05): its Ancients groups and its own vernacular
   'ancients': { culture: 'ancient' },
   'ancients-transplant': { culture: 'ancient', style: 'transplant' },   // whole Ancients buildings moved into the city
   'ancients-reclaimed': { culture: 'ancient', state: 'reclaimed' },    // Ancients buildings the Izani live in
   'iziz-vernacular': { culture: 'iziz', style: 'vernacular' },
   'yuni-order': { culture: 'order' },
   'generic': { culture: null, set: 'generic' },   // the poor-tier sets any culture draws on: a set, not a culture
   'scrap': { culture: null, set: 'scrap' }
 };

 // wealth: three names or null (civic is a type). The catalog's 0..1 maps by FURN_TIERS' poor and court floors.
 var WEALTH = ['poor', 'middle', 'rich'];
 var WEALTH_ALIAS = { common: 'middle', court: 'rich', civic: null };
 function wealthOf(v){ return v < CATALOG_TIERS.poor[1] ? 'poor' : v < CATALOG_TIERS.court[0] ? 'middle' : 'rich'; }

 K.VOCAB = {
   classes: ['building', 'part', 'fixture', 'furniture', 'prop', 'flora', 'life', 'landmark', 'infrastructure', 'feature'],
   cultures: CULTURES, noCatalog: NO_CATALOG, cultureNames: CULTURE_NAMES, cultureAlias: CULTURE_ALIAS,
   types: CATALOG_TYPES.concat(['park', 'military', 'statue', 'plaza', 'fountain']),   // + Yuni's park; Iziz's military, statue, plaza, fountain
   // older spellings of a type, on input (Iziz's REG): one becomes one or more
   typeAlias: { 'market/shop': ['market', 'shop'], 'tavern/inn': ['tavern', 'inn'], 'single-family dwelling': ['dwelling-single'],
     'multi-family dwelling': ['dwelling-multi'] },
   // older tag keys, on input: Iziz's type (a list) and place (indoor, outdoor)
   keyAlias: { type: 'types', place: 'setting' },
   stateAlias: { rehabilitated: 'rehab', destroyed: 'ruined' },
   wealth: WEALTH, wealthAlias: WEALTH_ALIAS, wealthOf: wealthOf,
   tiers: Object.keys(CATALOG_TIERS),
   states: ['intact', 'ruined', 'rehab', 'toppled', 'salvage', 'reclaimed'],   // reclaimed: lived in again, not rebuilt
   settings: CATALOG_SETTINGS.concat(['room']),
   jobs: CATALOG_JOBS,
   sets: ['generic', 'scrap'],
   // biomes/WORLD.md, plus Krator's X (abyssal) and H (hyperalpine). The biome kits (2026-10-12) add Cwb (shighlands)
   // and the scale model's own classes: XA (abyssal hypertropic jungle) and XV (abyssal savanna: geyser), HF (the
   // hyperalpine frost) and O (airless: ebadlands, the Throne's summit)
   koppen: ['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Cfa', 'Cfb', 'Cfc', 'Cwa', 'Cwb', 'Dfa', 'Dfb', 'Dfc', 'ET', 'EF',
     'X', 'H', 'XA', 'XV', 'HF', 'O'],
   // the root README's flora and fauna tags (biomes/README.md): the kits' TAGS and every species' and animal's tags.
   // climate and aridity take a name or a range of two ('arid..humid', 'tropic..cold': VOCAB.ranges)
   climates: ['hypertropic', 'tropic', 'subtropic', 'temperate', 'montane', 'cold', 'polar'],
   aridities: ['arid', 'semiarid', 'mild', 'subhumid', 'humid'],
   riparians: ['yes', 'no', 'both'],
   riparianAlias: { non: 'no', riparian: 'yes' },   // kits/fauna's spellings
   ranges: { climate: true, aridity: true },
   // Yuni's fixture vocabularies (settlements/yuni/src/51-fixtures.js DOOR_STYLES, LIGHT_KINDS)
   doorStyles: ['plank', 'double', 'carved', 'studded', 'mat', 'hatch', 'gate', 'open'],
   lightKinds: ['oil-lantern', 'electric-lantern', 'arc-standard', 'hearth', 'brazier', 'electric', 'flame', 'glow-fungus', 'daylight'],
   // each known tag key and its rule: a list name above, 'free' (any value), 'bool' or 'object'
   keys: { culture: 'cultures', types: 'types', wealth: 'wealth', tier: 'tiers', state: 'states', setting: 'settings',
     job: 'jobs', koppen: 'koppen', set: 'sets', door: 'doorStyles', light: 'lightKinds',
     style: 'free', room: 'free', biome: 'free', family: 'free', variant: 'free',
     role: 'free', quarter: 'free', part: 'free', finish: 'free', rock: 'free', level: 'free', district: 'free', destination: 'free', stalls: 'free', canopies: 'free',
     lit: 'bool', landmark: 'bool', market: 'bool', harvest: 'object',
     // flora and fauna (the biome kits, 2026-10-12): the climate band, aridity, abyssal, riparian; an animal's diet
     climate: 'climates', aridity: 'aridities', abyssal: 'bool', riparian: 'riparians', diet: 'free',
     // a kit's own trait on every species, free: crater-drylands' fire response (pyrophyte, seeder, resprouter...),
     // ehighlands' growth form, geyser's and the Throne's origin (earth, krator, native, dead), geyser's heat and the
     // Throne's plume (where it lives: against the springs; shoulder, seam, plume, vent), shighlands' spiral habit
     fire: 'free', form: 'free', origin: 'free', heat: 'free', plume: 'free', spiral: 'free',
     // necanyons (2026-10-19): where on the rock a plant lives (floor, foot, ledge, bench, cap, stack), and a carnivorous
     // plant's trap record (core/biome/37-core-traps.js: kind, mouth, preyMax, cycle, lure, danger)
     zone: 'free', trap: 'object',
     // what can hurt a walker (biomes/HAZARD-RESEARCH.md; PROPOSAL.md, "A hazard key"; 2026-10-26): the record core/hazard's
     // KHAZ reads ({kind, effect, danger, dose, shape, falloff, cycle, trigger, move, nav, tell, stateFn, seed}); its
     // kind is one of hazardKinds, whose row fills what the record leaves out
     hazard: 'object',
     // a place a people will not build in (biomes/outlands/PLAN.md C6, 2026-10-26): {of: null (every people) | [culture...],
     // why, shape (as a hazard's)}; KHAZ.forbids asks it, core/city's rules.groundOk and a scatter's accept take KHAZ.tabooOk
     taboo: 'object' },
   // the hazard kinds and their defaults (core/hazard/20-core-hazard.js KHAZ.make fills a record from its row). danger 0..1
   // as the traps use it (.3 hurts, .7 holds a person, 1 kills); dose: effect units a second at the core (a build-up meter
   // fills at it); falloff from the core to the shape's edge; nav in Godot's NavigationRegion3D terms: travel (a cost
   // multiplier on the path through it), enter (metres added on entering), avoid (never path through: the avoid layer);
   // tell: the readable warning, its colour (sRGB hex: the overlay's tint too), particles and sound
   hazardKinds: {
     heat:   { effect: 'burn',      danger: .5, dose: 1,  falloff: 'smooth', nav: { travel: 4, enter: 10, avoid: false }, tell: { colour: '#ff7a20', fx: 'shimmer', sound: 'hiss' } },
     cold:   { effect: 'freeze',    danger: .3, dose: .2, falloff: 'linear', nav: { travel: 2, enter: 0, avoid: false },  tell: { colour: '#bfe6ff', fx: 'frost', sound: 'wind' } },
     gas:    { effect: 'suffocate', danger: .8, dose: .5, falloff: 'smooth', nav: { travel: 8, enter: 20, avoid: true },  tell: { colour: '#c8d84a', fx: 'haze', sound: null } },
     acid:   { effect: 'corrode',   danger: .7, dose: 1,  falloff: 'none',   nav: { travel: 10, enter: 30, avoid: true }, tell: { colour: '#9cff3a', fx: 'fume', sound: 'fizz' } },
     poison: { effect: 'poison',    danger: .5, dose: .3, falloff: 'linear', nav: { travel: 4, enter: 5, avoid: false },  tell: { colour: '#a050c0', fx: 'spores', sound: null } },
     fall:   { effect: null,        danger: .8, dose: 0,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#e8e8e8', fx: 'edge', sound: null } },
     pit:    { effect: 'bleed',     danger: 1,  dose: 0,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#c03020', fx: 'litter', sound: null } },
     thorn:  { effect: 'bleed',     danger: .3, dose: .5, falloff: 'none',   nav: { travel: 3, enter: 2, avoid: false },  tell: { colour: '#80a040', fx: null, sound: 'rustle' } },
     grab:   { effect: 'hold',      danger: .8, dose: 0,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#d02060', fx: 'lure', sound: null } },
     drown:  { effect: 'drown',     danger: .8, dose: .3, falloff: 'none',   nav: { travel: 6, enter: 10, avoid: true },  tell: { colour: '#2050c0', fx: null, sound: null } },
     sink:   { effect: 'hold',      danger: .5, dose: 0,  falloff: 'linear', nav: { travel: 6, enter: 5, avoid: false },  tell: { colour: '#806040', fx: 'bubbles', sound: 'suck' } },
     slip:   { effect: null,        danger: .2, dose: 0,  falloff: 'none',   nav: { travel: 2, enter: 0, avoid: false },  tell: { colour: '#d0e8f0', fx: 'sheen', sound: null } },
     crush:  { effect: 'bleed',     danger: 1,  dose: 0,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#808080', fx: 'dust', sound: 'creak' } },
     hunter: { effect: 'bleed',     danger: .9, dose: 0,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#c00000', fx: 'ripple', sound: null } },
     // 2026-10-26: the Godthrone's lava (biomes/godthrone/PLAN.md), the live fire (core/biome KFIRE.run) and the Outlands'
     // luck (biomes/outlands/PLAN.md C6). radiant: heat by distance beyond the shape (reach m, its dose and danger at the
     // edge, falling to 0); soak: strength by time inside (from at entering, full after `full` s, forgotten over `out` s)
     lava:   { effect: 'burn',      danger: 1,  dose: 20, falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#ff5a10', fx: 'glow', sound: 'roar' },    radiant: { reach: 8, dose: 2, danger: .4 } },
     fire:   { effect: 'burn',      danger: .9, dose: 5,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#ff9a30', fx: 'flame', sound: 'crackle' }, radiant: { reach: 10, dose: 1, danger: .3 } },
     luck:   { effect: 'misfortune', danger: .3, dose: .05, falloff: 'none', nav: { travel: 1, enter: 0, avoid: false },  tell: { colour: '#c8a040', fx: null, sound: null },        soak: { full: 600, from: 0, out: 1200 } },
     // a made trap (the arcology ruins, later): set off by a trigger, it delivers one effect or several (effects:
     // [{effect, dose, danger}]: a shock and a paralysis); it resets after trigger.reset s, and can be disarmed
     // time slowed (or sped up) inside a field (LORE.md 6.15, the History Monks' Procrastinator: its seals hold the Order's
     // worst things at a ten-thousandth of our time). time.scale: how fast time runs at the core (1e-4 slow, 1 normal, above
     // 1 fast), easing to 1 at the edge by the falloff (in log scale). The harm is being held: stasis
     time:   { effect: 'stasis',    danger: .8, dose: 0,  falloff: 'smooth', nav: { travel: 1, enter: 0, avoid: true },   tell: { colour: '#b080ff', fx: 'stillness', sound: null }, time: { scale: .0001 } },
     // a land mine: a small trigger (shape) and a wider blast (mine.blast m, the dose falling off smoothly), one shot; armed
     // `arm` s after it is laid, a dud by its own hash at `dud`; hidden until found or exposed; paths avoid it only for
     // those who know it (its owner and mine.known: KHAZ.knows). KHAZ.deploy lays one, KHAZ.minefield lays a field by cell
     mine:   { effect: 'damage',    danger: 1,  dose: 40, falloff: 'smooth', nav: { travel: 1, enter: 0, avoid: false },  tell: { colour: '#d04020', fx: null, sound: 'click' }, trigger: { by: 'step', reset: null }, mine: { blast: 4, arm: 5, dud: 0 } },
     trap:   { effect: 'damage',    danger: .6, dose: 1,  falloff: 'none',   nav: { travel: 1, enter: 0, avoid: false },  tell: { colour: '#e0c040', fx: 'spark', sound: 'click' },  trigger: { by: 'step', reset: 30 } }
   },
   // the air and the cold everywhere (2026-10-26): not placed records but fields sampled at a point (core/hazard
   // KHAZ.provide(field, fn), KHAZ.ambient). Each row ramps its effect from `start` (k 0) to `worst` (k 1, the full dose);
   // pressure in atm (a person tires below .6, the death zone .33, the blood boils at .06: the Godthrone's rim is .07),
   // temperature in degrees C
   // rain in mm an hour (core/atmos weather: 0 under a roof), ph the rain's acidity (clean rain 5.6; a region's own)
   // dust and ash in mg per m3 (a dust storm, an ash storm or ashfall under a plume; clean air under .1, a haboob's wall
   // thousands), visibility in metres (when a page knows it outright: its fog, its smoke)
   // alkali: the share (0..1) of the dust that is caustic salt (the Catch's dry soda lake beds; Owens Lake's)
   ambientFields: ['pressure', 'temperature', 'rain', 'ph', 'dust', 'ash', 'alkali', 'visibility'],
   // how far one sees in dust and ash together (Chepil and Woodruff, 1957: C = c x V^-p, C mg/m3, V km): KHAZ.sight
   dustSight: { c: 56, p: 1.25 },
   // what is left of a target's contrast at a distance in that air (Koschmieder: exp(-3.912 d / V), the visibility V
   // where it falls to the threshold): KHAZ.seen and KHAZ.aim, a to-hit or spotting factor 1 point-blank, 0 at V
   sightContrast: { threshold: .02 },
   // a row with `times` needs both fields: k is the product of the two ramps (acid rain: how acid x how hard it falls)
   ambientKinds: {
     // a dust or ash storm: it chokes from 2 mg/m3 (a day of it harms) to 50 (a haboob's body: breathing through cloth)
     'dust':      { field: 'dust',      start: 2,  worst: 50,  effect: 'suffocate', dose: .3, danger: .4 },
     // volcanic ash is glass: it harms at half the load and worse (the Throne's ash desert under the plume, an eruption)
     'ash':       { field: 'ash',       start: 1,  worst: 25,  effect: 'suffocate', dose: .5, danger: .6 },
     // caustic dust (the Catch's black storms off its dry soda lakes, biomes/catch/PLAN.md): it burns the eyes and the
     // lungs and etches what lies open; how caustic (the alkali share, .05 to .5) times how thick (1 to 25 mg/m3). It is
     // dust too: the dust row chokes and sight dims on the same load
     'caustic-dust': { field: 'alkali', start: .05, worst: .5, times: { field: 'dust', start: 1, worst: 25 }, effect: 'corrode', dose: .4, danger: .5 },
     'acid-rain': { field: 'ph',        start: 4,  worst: 1,   times: { field: 'rain', start: 0, worst: 10 }, effect: 'corrode', dose: .5, danger: .6 },
     'thin-air': { field: 'pressure',    start: .6, worst: .06, effect: 'suffocate', dose: 1,  danger: 1 },
     'cold':     { field: 'temperature', start: 0,  worst: -40, effect: 'freeze',    dose: .5, danger: .7 },
     'hot':      { field: 'temperature', start: 45, worst: 70,  effect: 'burn',      dose: .5, danger: .6 }
   },
   hazardEffects: ['burn', 'freeze', 'suffocate', 'poison', 'corrode', 'bleed', 'hold', 'drown', 'misfortune', 'shock', 'paralysis', 'damage', 'stasis', 'emp'],
   hazardShapes: ['sphere', 'cyl', 'box', 'poly'],
   hazardFalloffs: ['none', 'linear', 'smooth'],
   hazardTriggers: ['step', 'weight', 'near', 'beam'],
   // the navigation layers a hazard's zone is on (Godot's navigation_layers bits): walk, the one every agent asks for; avoid,
   // the one no agent asks for (an avoid zone's polygons are cut out of the walk layer)
   navLayers: { walk: 1, avoid: 2 },
   // the order id's prefix per class; a fixture's per kind
   prefix: { building: 'bld', part: 'part', fixture: 'fix', furniture: 'furn', prop: 'prop', flora: 'flora', life: 'life',
     landmark: 'site', infrastructure: 'infra', feature: 'feat' },
   fixturePrefix: { door: 'door', window: 'window', light: 'light' },
   // what test-tags.js compares with the catalog
   catalog: { cultures: CATALOG_CULTURES, types: CATALOG_TYPES, tiers: CATALOG_TIERS, jobs: CATALOG_JOBS, settings: CATALOG_SETTINGS }
 };
})();
