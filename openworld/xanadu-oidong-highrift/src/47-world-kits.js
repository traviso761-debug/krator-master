// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — the kits that grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name). The first stage grows the two kits under the region's three sites:
//   xanadu   on the 'xanadu' overlay (31,114 px of the cut: Erehwon and Qiblai stand in it): XANADU_WORLD
//            (49-world-xanadu.js), the kit's pass table as data
//   oidong   on the 'oidong valley' overlay (17,607 px: Longsong): its own pass table (OIDONG.PASSES)
// Not yet (they grow nothing: KNOWN_ISSUES.md): the High Rift (21,261 px; the rift kit has no pass table as data), the
// Godthrone's flank (608 px), the rift rim (259 px, another session's kit), the twins, Opal Valley and Godshearth (no kit).
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
return[{name:'xanadu',global:'XANADU_WORLD.xanadu',overlay:'xanadu',lod:LOD,floor:null},
 {name:'oidong',global:'OIDONG',overlay:'oidong valley',lod:LOD,floor:null}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
