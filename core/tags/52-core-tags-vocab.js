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

 // ---- copied from kits/catalog/krator-furniture-core.js (checked by test-tags.js) ----
 // FURN_CULTURES (the 27 the core file lists before any culture file registers itself)
 var CATALOG_CULTURES = ['ancient', 'ancients-salvage', 'yuni-court', 'yuni-common', 'yuni-poor', 'sahelian', 'order', 'nomad',
   'voth', 'iziz', 'beast-rider', 'generic', 'scrap', 'lizardmen', 'eastabyss', 'xanadu', 'screamer', 'islander', 'republican',
   'rustic', 'painted', 'reedlake', 'post-apoc', 'hykkousoi', 'scyvoi', 'zeijani', 'ashnomad'];
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
   'fungiculture', 'alchemy', 'dyeing', 'masonry', 'lampmaking', 'knapping', 'ropemaking'];
 // FURN_SETTINGS, plus core/furnish's 'room' (a piece the interiors place)
 var CATALOG_SETTINGS = ['indoor', 'outdoor', 'both'];

 // ---- the cultures, cleaned (PROPOSAL.md, "The culture list, cleaned"): 21 (Scyvoi added 2026-10-05, Zeijani and the Ash Nomads 2026-10-07) ----
 // Display names are FURN_CULTURE_INFO's (the core file and each culture file's FURN_CULTURE(key, { name })).
 var CULTURE_NAMES = {
   'ancient': 'Ancients', 'yuni': 'Yuni', 'order': 'The Order', 'nomad': 'Eastern Nomads', 'voth': 'Voth', 'iziz': 'Iziz',
   'beast-rider': 'Beast Riders', 'lizardmen': 'Lizardmen', 'eastabyss': 'East Abyss', 'xanadu': 'Xanadu', 'screamer': 'Screamers',
   'islander': 'Ring Sea Islanders', 'republican': 'Republicans', 'rustic': 'Rustic Highlanders', 'painted': 'Painted Men',
   'reedlake': 'Reed Lake', 'post-apoc': 'Post-Apoc salvage', 'hykkousoi': 'Hykkousoi', 'scyvoi': 'Scyvoi',
   'zeijani': 'Zeijani', 'ashnomad': 'Ash Nomads'
 };
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
   cultures: CULTURES, cultureNames: CULTURE_NAMES, cultureAlias: CULTURE_ALIAS,
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
   // biomes/WORLD.md, plus Krator's X (abyssal) and H (hyperalpine)
   koppen: ['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Cfa', 'Cfb', 'Cfc', 'Dfa', 'Dfb', 'Dfc', 'ET', 'EF', 'X', 'H'],
   // Yuni's fixture vocabularies (settlements/yuni/src/51-fixtures.js DOOR_STYLES, LIGHT_KINDS)
   doorStyles: ['plank', 'double', 'carved', 'studded', 'mat', 'hatch', 'gate', 'open'],
   lightKinds: ['oil-lantern', 'electric-lantern', 'arc-standard', 'hearth', 'brazier', 'electric', 'flame', 'glow-fungus', 'daylight'],
   // each known tag key and its rule: a list name above, 'free' (any value), 'bool' or 'object'
   keys: { culture: 'cultures', types: 'types', wealth: 'wealth', tier: 'tiers', state: 'states', setting: 'settings',
     job: 'jobs', koppen: 'koppen', set: 'sets', door: 'doorStyles', light: 'lightKinds',
     style: 'free', room: 'free', biome: 'free', family: 'free', variant: 'free',
     role: 'free', quarter: 'free', part: 'free', finish: 'free', rock: 'free', level: 'free', district: 'free', destination: 'free', stalls: 'free', canopies: 'free',
     lit: 'bool', landmark: 'bool', market: 'bool', harvest: 'object' },
   // the order id's prefix per class; a fixture's per kind
   prefix: { building: 'bld', part: 'part', fixture: 'fix', furniture: 'furn', prop: 'prop', flora: 'flora', life: 'life',
     landmark: 'site', infrastructure: 'infra', feature: 'feat' },
   fixturePrefix: { door: 'door', window: 'window', light: 'light' },
   // what test-tags.js compares with the catalog
   catalog: { cultures: CATALOG_CULTURES, types: CATALOG_TYPES, tiers: CATALOG_TIERS, jobs: CATALOG_JOBS, settings: CATALOG_SETTINGS }
 };
})();
