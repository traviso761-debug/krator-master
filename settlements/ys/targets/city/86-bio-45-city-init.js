// ================================================================= YS CITY — the biome's host binding, the bootstrap
// FRAGMENT NUMBER IS LOAD-BEARING (biomes/nwbay/BIOME-API.md, "To bind it in Ys"): BIO.init must run after THREE exists
// and BEFORE 86-bio-50, because the north-west bay fragments build their textures and materials against BIO.host.THREE
// at load, and the two knobs (the canopy ceiling, the bay's hue) are read by fragment 50 at load too. The city's facts
// (its terrain, a mask that is zero wherever the city is, the climate fields, the hosts as obstacles) come in
// targets/city/89-city-biome.js, which binds the host again once the city stands: the biome fragments keep nothing of
// the host at load but THREE, and the foliage's wind tick, which this bootstrap routes into the scene's tick list.
// Prefixed 86-bio- so the build's lint treats it as part of the biome's closure (SCOPED_PREFIXES) and TARGET_ONLY
// keeps it, with the vendored fragments, out of the kit sheet and the mock.
var NWBAY_TEMPLE_H=110;      // the canopy ceiling (DESIGN §8: eastern-abyss sized, nothing Girder-sized)
var NWBAY_BAY={hue:.47};     // turquoise over limestone: the shore reeds' accent, the mosses' tinge, the mangrove's blue-green
window.YS_TICKS=window.YS_TICKS||[];
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:(x,z)=>0,obstacles:[],
 ticks:fn=>{window.YS_TICKS.push(fn);},seed:11,origin:[[0,0]],center:[0,0],
 fields:{wet:(x,z)=>0,salt:(x,z)=>0,upland:(x,z)=>0,flow:(x,z)=>0,karst:(x,z)=>0},
 err:m=>reportErr('biome: '+m)});
