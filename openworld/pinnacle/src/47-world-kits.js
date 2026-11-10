// ================================================================= PINNACLE — the kits: which biome kits grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name). The cut is the NE rim's (abyssal-savannah: 930 of its 3,600 km2, the rock in it);
// its edges touch the savage hyperjungle (30 px), the painted highlands (1 px) and Korona (none in the cut), which grow
// nothing here yet (KNOWN_ISSUES.md). The eastern abyss's kit loads before it because the savannah kit borrows its species
// (its own page reads them in place: biomes/abyssal-savannah/build.py, 47a..47c); it grows on no overlay of its own here.
// No floor yet (floor null: the world's floor skips the kit).
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
/* the kit as the world reads it: ABSAV_WORLD (49-world-absav.js), its own trees and the eastern abyss's it borrows */
return[{name:'abyssal-savannah',global:'ABSAV_WORLD.absav',overlay:'ne rim',lod:LOD,floor:null},
 {name:'eastabyss',global:'ABSAV_WORLD.eastabyss',overlay:null,lod:LOD,floor:null}];})();
// a kit's export object by its expression (a top-level const is not on window: an indirect eval reaches it)
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
