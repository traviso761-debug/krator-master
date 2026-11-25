// ================================================================= EAST ABYSS — the kits: which biome kits grow here
// [G data] Wires EASTABYSS_WORLD (49-world-eastabyss.js) onto the East Abyss basin and near-environs overlays
// (e abysss, e abyss, Yuni Valley, east rim) with octahedral far impostors for towering scale-trees so the dense
// Carboniferous canopy streams smoothly across the 300 x 1,000 km basin.
var WORLD_KITS=(function(){
const LOD={hero:[14,110,280],mid:[50,380,1050],far:[220,1100,3200]};
return[{
  name:'eastabyss',
  global:'EASTABYSS_WORLD',
  overlay:'e abysss',
  lod:LOD,
  floor:null
}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
