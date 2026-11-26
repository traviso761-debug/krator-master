// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the kits that grow here
// [G data] The open world's kit registry (core/world/41-world-fields.js reads it at init: each entry's overlay is the biome
// region it grows on, matched by name):
//   oidong     on the 'oidong valley' overlay (17,257 px of the cut: Longsong): its own pass table (OIDONG.PASSES)
//   highrift   on the 'high rift' overlay (21,261 px: the three houses): no trees; its floor (HRIFT_WORLD,
//              49-world-highrift.js): the rift's tussock, steam heath, opal cane, bead caps and Verdigris wort
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
/* the High Rift floor's four grounds, as field profiles (the nursery grows each patch under one; HRIFT.buildRift reads
   hrheat, hracid and hrgrass): cold tussock, the mild grabens, the vents' warm margins, their hot discs and run-off */
const HR_PROFILES={cold:{hrheat:2,hracid:0,hrgrass:.8,cold:.6,wet:.3},graben:{hrheat:6,hracid:0,hrgrass:1.2,cold:.25,wet:.5},
 warm:{hrheat:18,hracid:.15,hrgrass:.6,cold:.2,wet:.55,mist:.45},hot:{hrheat:42,hracid:.6,hrgrass:.2,cold:0,wet:.65,mist:.3}};
return[{name:'oidong',global:'OIDONG',overlay:'oidong valley',lod:LOD,floor:null},
 {name:'highrift',global:'HRIFT_WORLD.highrift',overlay:'high rift',lod:LOD,
  floor:{profiles:HR_PROFILES,pick:(x,z)=>HRIFT_WORLD.pick(x,z)}}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
