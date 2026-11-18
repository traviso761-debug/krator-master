// ================================================================= EREWHON'S LAKE, THE NORTH SHORE — the kits that grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name). The cut is nearly all the 'xanadu' overlay (5,258 px); the Xanadu kit grows on it
// through XANADU_WORLD, its pass table as data (openworld/xanadu-oidong-highrift/src/49-world-xanadu.js, read in place).
// Not yet: the Godthrone's flank (46 px) and Godshearth's mouth (9 px) round Thalaba have no kit (KNOWN_ISSUES.md).
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
return[{name:'xanadu',global:'XANADU_WORLD.xanadu',overlay:'xanadu',lod:LOD,floor:null}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
