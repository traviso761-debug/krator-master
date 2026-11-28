// ================================================================= SW OUTER WALL — kits/crops registration ([G data])
// Registers CROPS.BIOMES.swouterwall across the 4 altitudinal & atmospheric zones (PLAN.md section 1):
//   borealfen:   +2,800-3,750 m, 1.05-1.14 atm Veil-spill boreal lakes & sphagnum bogs (cloudberry, lingonberry, frostoat, turnip)
//   moraine:     +3,850-5,150 m, 0.81-0.95 atm cold subalpine moraine benches (hardy root pockets, stonepine, goldroot)
//   trigemini:   +5,680 m, 0.76 atm Trigemini Pass cold tarn floor (sparse subpolar lichen/root gather; zero open grain)
//   hypoxicvale: +5,900-6,450 m, 0.69-0.60 atm breath-vales (barren of open field crops above +5,800 m)
var SWOW_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:1,
  zones:{
   borealfen:{warmth:[1,2],arid:[3,4],wet:true,atm:1},
   moraine:{warmth:[0,1],arid:[2,3],atm:1},
   trigemini:{warmth:[0,0],arid:[1,2],atm:0},
   hypoxicvale:{warmth:[-1,-1],arid:[0,1],atm:0}
  }
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.swouterwall=DEF;
 }
 var SIGNATURE=[
  'cloudberry','crowberry','frostoat','turnip','sweetroot','snowpotato','goldroot','stonepine','alecap'
 ];
 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  if(!root.CROPS.BIOMES.swouterwall)root.CROPS.BIOMES.swouterwall=DEF;
  var o=opts||{works:['dark-beds'],nodes:['iron','copper']};
  return root.CROPS.forBiome('swouterwall',o);
 }
 function queryZone(zoneKey){
  if(!root.CROPS||typeof root.CROPS.at!=='function')return[];
  var z=DEF.zones[zoneKey];
  if(!z)return[];
  return root.CROPS.at({warmth:z.warmth[1],arid:z.arid[1],atm:z.atm==null?1:z.atm,wet:!!z.wet});
 }
 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  queryAll:queryAll,
  queryZone:queryZone
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.SWOW_CROPS=SWOW_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=SWOW_CROPS;
