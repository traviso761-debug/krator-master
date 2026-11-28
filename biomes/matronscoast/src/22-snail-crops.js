// ================================================================= MATRONSCOAST — kits/crops registration ([G data])
// Registers CROPS.BIOMES.matronscoast across all 4 Kande-Sakhil / Snail Coast zones (PLAN.md sections 1 & 5.1):
//   skerry_strand:  1.59 atm salt-sprayed coquina & storm-wrack benches (eelgrass, wineweed, coral-lime, kelp-ash, bay-purple)
//   browse_plain:   1.56 atm humid Af/Cfa lowland inside silica-thorn & stone-wall enclosures (taro, yam, ramie, flax, rice)
//   midden_terrace: pH 8.1 crushed-shell limed gardens around Yonni plinths (cabbage, helix-bean, mulberry, apple)
//   cloud_slope:    1.22 atm +2,150 m Cfb cool montane rainforest benches (frostoat, turnip, cairn-nettle, lichen)
// Also links Matron's Coast endemic royal Tyrian/Murex snail-purple (bay-purple), wineweed crimson, and murexwort/lichen brown
// so CROPS.canPlaid('matronscoast') passes natively!
var SNAIL_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:2,
  zones:{
   skerry_strand:{warmth:[3,4],arid:[3,4],wet:true,salt:true},
   browse_plain:{warmth:[3,4],arid:[3,4],wet:true},
   midden_terrace:{warmth:[2,3],arid:[2,3]},
   cloud_slope:{warmth:[1,2],arid:[3,4],atm:1}
  }
 };

 var HOME_IDS=['bay-purple','wineweed','lichen','coral-lime','kelp-ash','eelgrass','ramie','flax'];

 function install(){
  if(!root.CROPS)return false;
  if(root.CROPS.BIOMES){
   root.CROPS.BIOMES.matronscoast=DEF;
  }
  if(Array.isArray(root.CROPS.LIST)){
   for(var i=0;i<root.CROPS.LIST.length;i++){
    var c=root.CROPS.LIST[i];
    if(c&&HOME_IDS.indexOf(c.id)>=0&&Array.isArray(c.home)&&c.home.indexOf('matronscoast')<0){
     c.home.push('matronscoast');
    }
   }
  }
  return true;
 }
 install();

 var SIGNATURE=[
  'bay-purple','wineweed','lichen','coral-lime','kelp-ash','eelgrass','ramie','flax','lotus-root','bamboo'
 ];

 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  install();
  var o=opts||{works:['dark-beds'],nodes:['iron','tin']};
  return root.CROPS.forBiome('matronscoast',o);
 }

 function canPlaid(opts){
  if(!root.CROPS||typeof root.CROPS.canPlaid!=='function')return false;
  install();
  return root.CROPS.canPlaid('matronscoast',opts||{wool:false});
 }

 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  HOME_IDS:HOME_IDS,
  install:install,
  queryAll:queryAll,
  canPlaid:canPlaid
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.SNAIL_CROPS=SNAIL_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=SNAIL_CROPS;
