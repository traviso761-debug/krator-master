// ================================================================= ARCFLOW — kits/crops registration ([G data])
// Registers CROPS.BIOMES.arcflow across all 4 Kulaneva microclimate zones (PLAN.md section 5.2):
//   foredeep: 1.48-1.58 atm neutral Ca/Mg > 1 kukersite-marl & loess benches (flax, hemp, emmer, cabbage, apple, hop, woad)
//   levee:    Suur-Neva & Mere-Upe alluvial flood-benches (wild-rice, helix-bean, turnip)
//   fen:      Musta-Jogi humic peat margins (cranberry, bog-myrtle, frostoat)
//   augerdisc: 1.37 atm NE upland 45 m lime-phosphate neutralized oasis discs (barley, clover, turnip)
var ARCFLOW_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:2,
  zones:{
   foredeep:{warmth:[2,3],arid:[3,4]},
   levee:{warmth:[3,3],arid:[3,4],wet:true},
   fen:{warmth:[2,3],arid:[3,4],wet:true},
   augerdisc:{warmth:[2,2],arid:[2,3],atm:1}
  }
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.arcflow=DEF;
 }
 var SIGNATURE=[
  'flax','hemp','emmer','frostoat','wild-rice','helix-bean','turnip','cabbage','apple','woad','alecap'
 ];
 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  if(!root.CROPS.BIOMES.arcflow)root.CROPS.BIOMES.arcflow=DEF;
  var o=opts||{works:['dark-beds'],nodes:['iron','copper']};
  return root.CROPS.forBiome('arcflow',o);
 }
 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  queryAll:queryAll
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.ARCFLOW_CROPS=ARCFLOW_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=ARCFLOW_CROPS;
