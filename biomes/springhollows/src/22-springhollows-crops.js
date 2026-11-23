// ================================================================= SPRINGHOLLOWS — kits/crops registration ([G data])
// Registers CROPS.BIOMES.springhollows across all 4 karst-plateau microclimate zones (PLAN.md section 4.2):
//   springrun: +850..+1,250 m frost-mild 1.38-1.44 atm spring-runs & paddies (rice, wild-rice, water-cress, coffee)
//   terrace:   High-Ria dry-stone dolomite bench orchards & terraces (saffron, whorl-olive, tea, mulberry, persimmon)
//   glade:     Sunny upland red-porphyry & cherty-dolomite glades (juniper, acorn, canyon-grape, emmer, umbel-seed)
//   cavern:    tube_ozarks_15 dark-bed mushroom works (alecap, glow-mushroom, pale-fungi)
// Pure data ([G data]); zero edits to kits/crops/.
var SPRINGHOLLOWS_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:1,
  zones:{
   springrun:{warmth:[3,3],arid:[3,4],wet:true,atm:2},
   terrace:{warmth:[2,3],arid:[2,3],atm:2},
   glade:{warmth:[2,3],arid:[1,2],atm:1},
   cavern:{warmth:[2,2],arid:[3,3],dark:true,atm:2}
  }
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.springhollows=DEF;
 }
 var SIGNATURE=[
  'saffron','whorl-olive','rice','wild-rice','emmer','helix-bean','sweet-potato',
  'murnong','painted-camas','acorn','wingnut','persimmon','canyon-grape','juniper',
  'umbel-seed','tea','coffee','mulberry','alecap','glow-mushroom'
 ];
 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  if(!root.CROPS.BIOMES.springhollows)root.CROPS.BIOMES.springhollows=DEF;
  var o=opts||{works:['dark-beds'],nodes:['iron','copper']};
  return root.CROPS.forBiome('springhollows',o);
 }
 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  queryAll:queryAll
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.SPRINGHOLLOWS_CROPS=SPRINGHOLLOWS_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=SPRINGHOLLOWS_CROPS;
