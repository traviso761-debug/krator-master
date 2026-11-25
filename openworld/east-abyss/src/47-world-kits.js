// ================================================================= EAST ABYSS — the kits: which biome kits grow here
// [G data] Wires EASTABYSS_WORLD (49-world-eastabyss.js) onto the East Abyss basin and near-environs overlays
// (e abysss, e abyss, Yuni Valley, east rim) with octahedral far impostors for towering scale-trees so the dense
// Carboniferous canopy streams smoothly across the 300 x 1,000 km basin.
var WORLD_KITS=(function(){
const LOD={hero:[14,130,320],mid:[50,420,1200],far:[220,1200,3400]};
return[{
  name:'eastabyss',
  global:'EASTABYSS_WORLD',
  overlay:'e abysss',
  lod:LOD,
  floor:{
    profiles:{
      jungle:{jungle:1,marsh:0,flats:0,savannah:0,water:0},
      marsh:{jungle:0,marsh:1,flats:0,savannah:0,water:0},
      flats:{jungle:0,marsh:0,flats:1,savannah:0,water:0},
      savannah:{jungle:0,marsh:0,flats:0,savannah:1,water:0}
    },
    pick:(x,z)=>{
      const wd=typeof WORLD!=='undefined'&&WORLD.waterDist?WORLD.waterDist(x,z):80;
      const sl=typeof WORLD!=='undefined'&&WORLD.slope?WORLD.slope(x,z):0;
      const wet=typeof WORLD!=='undefined'&&WORLD.FIELDS&&WORLD.FIELDS.wet?WORLD.FIELDS.wet(x,z):0.45;
      const salt=typeof WORLD!=='undefined'&&WORLD.FIELDS&&WORLD.FIELDS.salt?WORLD.FIELDS.salt(x,z):0.2;
      if(wd<55&&sl<0.28) return {marsh:0.85,jungle:0.15};
      if(salt>0.55&&wd>40) return {flats:0.8,savannah:0.2};
      if(wet>0.32&&sl<0.38) return {jungle:0.75,marsh:0.25};
      return {savannah:0.65,flats:0.35};
    }
  }
}];})();
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
