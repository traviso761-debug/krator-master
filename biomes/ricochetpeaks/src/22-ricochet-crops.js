// ================================================================= RICOCHET PEAKS — kits/crops registration ([G data])
// Registers CROPS.BIOMES.ricochetpeaks across all 4 Ricochet crater microclimate zones (PLAN.md section 1):
//   cratertaiga:   +2,800..+3,450 m, ~1.06-1.14 atm thermal-belt Dfc/Dfb benches (rye, barley, frostoat, turnip, potato, flax)
//   thermalfloor:  East Hearth hydrothermally warmed Dfb hot-spring oases & stone-channel gardens (cabbage, herb, berry, hop)
//   suevitebarren: Shocked impact-melt & shatter-cone boulder aprons (hardy berries, pine nuts, medicinal herbs)
//   rimtundra:     High +3,800..+5,100 m notch passes & cryofumarole rims (sparse alpine roots; dark-beds fungi in caves)
var RICOCHET_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:1,
  zones:{
   cratertaiga:{warmth:[1,2],arid:[2,3]},
   thermalfloor:{warmth:[2,3],arid:[3,4],wet:true},
   suevitebarren:{warmth:[1,2],arid:[1,2]},
   rimtundra:{warmth:[0,1],arid:[1,2],atm:0}
  }
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.ricochetpeaks=DEF;
 }
 var SIGNATURE=[
  'rye','barley','frostoat','turnip','potato','cabbage','flax','cranberry','alecap','glow-mushroom'
 ];
 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  if(!root.CROPS.BIOMES.ricochetpeaks)root.CROPS.BIOMES.ricochetpeaks=DEF;
  var o=opts||{works:['dark-beds'],nodes:['iron','nickel','gold']};
  return root.CROPS.forBiome('ricochetpeaks',o);
 }
 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  queryAll:queryAll
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.RICOCHET_CROPS=RICOCHET_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=RICOCHET_CROPS;
