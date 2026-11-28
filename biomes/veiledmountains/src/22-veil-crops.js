// ================================================================= VEILED MOUNTAINS — kits/crops registration ([G data])
// Registers CROPS.BIOMES.veiledmountains across all 5 altitudinal microclimate zones (PLAN.md section 6) and binds the
// biome's native wild mountain-rainforest dyes, fibres, berries, tubers, greens & endemic crimson-chalice / mire-sporespike
// records in memory so CROPS.forBiome('veiledmountains') and CROPS.canPlaid('veiledmountains') pass cleanly.
var VEIL_CROPS=(function(root){
 'use strict';
 var DEF={
  atm:1,
  zones:{
   mistfloor:{warmth:[2,2],arid:[3,4],wet:true},
   gorge:{warmth:[1,2],arid:[3,4],wet:true},
   cloudbelt:{warmth:[1,2],arid:[3,4]},
   alderchute:{warmth:[0,1],arid:[2,3]},
   highcol:{warmth:[0,0],arid:[1,2],atm:0}
  }
 };

 function addHome(C,id){
  var rec=C.BY_ID&&C.BY_ID[id];
  if(rec&&Array.isArray(rec.home)&&rec.home.indexOf('veiledmountains')<0){
   rec.home.push('veiledmountains');
  }
 }

 function ensureEndemic(C,rec){
  if(!C.LIST||!C.BY_ID||C.BY_ID[rec.id])return;
  C.LIST.push(rec);
  C.BY_ID[rec.id]=rec;
 }

 function bind(C){
  if(!C||!C.BIOMES)return;
  C.BIOMES.veiledmountains=DEF;
  // Native Hoh/Yakushima/subalpine plants shared with nhighlands, shighlands & nwouterwall
  var sharedWild=['alder-bark','lichen','birch-tar','larch-bark','sphagnum','cottongrass','woolly-willow','beard-lichen','cairn-nettle'];
  for(var i=0;i<sharedWild.length;i++)addHome(C,sharedWild[i]);

  // Endemic Veiled Mountains epiphyte dye/gel & mire flash-spore reagent (PLAN.md section 6)
  ensureEndemic(C,{
   id:'crimson-chalice',
   name:'Crimson crown-chalice dye & tank-gel',
   bucket:'dye',
   also:['medicine','reagent'],
   form:'herb',
   grown:'field',
   warmth:[1,2],
   arid:[3,4],
   atm:[1,2],
   reach:0,
   water:'rain',
   needs:null,
   home:['veiledmountains'],
   homeOnly:true,
   stores:['dried','pressed'],
   yield:1,
   card:'card.fogcomber',
   src:'veiledmountains',
   colour:'purple',
   node:null,
   works:null,
   hazard:null,
   note:'Crimson-magenta-violet structural-tinted canopy tank-epiphyte yielding prized Timpar-Kuran purple-crimson dye and antiseptic gel.'
  });
  ensureEndemic(C,{
   id:'mire-sporespike',
   name:'Mire spore-column flash-dust',
   bucket:'reagent',
   also:[],
   form:'herb',
   grown:'field',
   warmth:[1,2],
   arid:[3,4],
   atm:[1,2],
   reach:0,
   water:'aquatic',
   needs:null,
   home:['veiledmountains'],
   homeOnly:true,
   stores:['dried'],
   yield:1,
   card:'card.flowerspike',
   src:'veiledmountains',
   colour:null,
   node:null,
   works:null,
   hazard:null,
   note:'Water-repellent golden-bronze lycopod spore dust cast onto irori hearth coals by Timpar-Kuran shamans for blinding raid signals.'
  });
 }

 if(root.CROPS)bind(root.CROPS);

 var SIGNATURE=[
  'crimson-chalice','mire-sporespike','alder-bark','lichen','birch-tar','cairn-nettle','sphagnum','alecap','glow-mushroom'
 ];

 function queryAll(opts){
  if(!root.CROPS||typeof root.CROPS.forBiome!=='function')return[];
  bind(root.CROPS);
  var o=opts||{works:['dark-beds'],nodes:['copper','iron']};
  return root.CROPS.forBiome('veiledmountains',o);
 }

 return{
  BIOME:DEF,
  SIGNATURE:SIGNATURE,
  bind:bind,
  queryAll:queryAll
 };
})(typeof window!=='undefined'?window:globalThis);

if(typeof window!=='undefined')window.VEIL_CROPS=VEIL_CROPS;
if(typeof module!=='undefined'&&module.exports)module.exports=VEIL_CROPS;
