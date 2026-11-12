// ================================================================= THE SHOWCASE: a row per kind, low to high grade (front +z toward the camera)
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Iron ore',keys:['node-iron-low','node-iron-medium','node-iron-high']},
 {name:'Copper ore',keys:['node-copper-low','node-copper-medium','node-copper-high']},
 {name:'Gold ore',keys:['node-gold-low','node-gold-medium','node-gold-high']},
 {name:'Tin ore',keys:['node-tin-low','node-tin-medium','node-tin-high']},
 {name:'Silver ore',keys:['node-silver-low','node-silver-medium','node-silver-high']},
 {name:'Rare earth',keys:['node-rare-earth-low','node-rare-earth-medium','node-rare-earth-high']},
 {name:'Coal',keys:['node-coal-low','node-coal-medium','node-coal-high']},
 {name:'Sulfur',keys:['node-sulfur-low','node-sulfur-medium','node-sulfur-high']},
 {name:'Saltpeter',keys:['node-saltpeter-low','node-saltpeter-medium','node-saltpeter-high']},
 {name:'Potash (the Catch)',keys:['node-potash-low','node-potash-medium','node-potash-high']},
 {name:'Alkali salts (the Catch)',keys:['node-alkali-low','node-alkali-medium','node-alkali-high']},
 {name:'Oil (a derrick works it)',keys:['node-oil-low','node-oil-medium','node-oil-high']}
];
/* the geology bake's evaporite rings (2026-10-26): gypsum at a closed basin's rim, rock salt inside it */
FAMILIES.push({name:'Gypsum (a salt basin rim)',keys:['node-gypsum-low','node-gypsum-medium','node-gypsum-high']},
 {name:'Rock salt (halite)',keys:['node-halite-low','node-halite-medium','node-halite-high']});
/* the new rocks' kinds (2026-11-03, REBAKE-PLAN.md R3) */
FAMILIES.push({name:'Nickel ore (the melt sheet\'s margin)',keys:['node-nickel-low','node-nickel-medium','node-nickel-high']},
 {name:'Marble (a quarry)',keys:['node-marble-low','node-marble-medium','node-marble-high']});
/* zinc (2026-11-12, biomes/galvanic) */
FAMILIES.push({name:'Zinc ore (sphalerite)',keys:['node-zinc-low','node-zinc-medium','node-zinc-high']});
