// ================================================================= EREWHON'S LAKE, THE LAKE SHORE — the kits that grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name). The cut's land is the 'xanadu' overlay (1,396 of its px); the Xanadu kit grows on
// it through XANADU_WORLD, its pass table as data (openworld/xanadu-oidong-highrift/src/49-world-xanadu.js, read in place).
// The box's corner holds a little of the rift overlay, outside every polygon of the cut, so no rift kit is listed.
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
return[{name:'xanadu',global:'XANADU_WORLD.xanadu',overlay:'xanadu',lod:LOD,floor:null}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
