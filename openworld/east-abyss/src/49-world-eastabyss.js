// ================================================================= EAST ABYSS — streaming biome adapter (biomes/eastabyss)
// [G data] Adapts EASTABYSS (biomes/eastabyss/src/50..75) to core/world's streaming flora contract
// { SPECIES, PASSES, zones, make, grow }, incorporating the Catch-Bowl open-world lesson:
//   - Flora clusters into water-driven groves and riparian galleries along rivers, salt-lake margins, and moist
//     basin floors rather than scattering uniformly; dry salt crusts and steep cliff faces stay bare rock/evaporite.
//   - All 20 Carboniferous-tropical species (0..19) are zoned by elevation above water, slope, moisture, and grove mask.
var EASTABYSS_WORLD=(function(){'use strict';
const EA=typeof EASTABYSS!=='undefined'&&EASTABYSS.make&&EASTABYSS.grow?EASTABYSS:null;
const SP=EA?EA.SPECIES.slice(0,20):[];
function groveMask(x,z){
  if(typeof BIO!=='undefined'&&BIO.standAt){
    const s=BIO.standAt(x,z,1400)/1400;
    return s;
  }
  return KRAND.unit(KRAND.hash(Math.floor(x/600),Math.floor(z/600),41));
}
function zones(x,z,y){
  const sl=typeof WORLD!=='undefined'&&WORLD.slope?WORLD.slope(x,z):0;
  const wet=typeof WORLD!=='undefined'&&WORLD.FIELDS&&WORLD.FIELDS.wet?WORLD.FIELDS.wet(x,z):0.45;
  const salt=typeof WORLD!=='undefined'&&WORLD.FIELDS&&WORLD.FIELDS.salt?WORLD.FIELDS.salt(x,z):0.2;
  const wd=typeof WORLD!=='undefined'&&WORLD.waterDist?WORLD.waterDist(x,z):80;
  const grove=groveMask(x,z);
  const flat=sl<0.36;
  const shore=wd<75&&sl<0.30;
  const waterline=wd<38&&sl<0.24;
  const humid=wet>0.26&&sl<0.42&&salt<0.68;
  const canopy=humid&&grove>0.30&&y<-300;
  const rim=sl>=0.22&&sl<0.62;
  return{sl,wet,salt,wd,grove,flat,shore,waterline,humid,canopy,rim,y};
}
const PASSES=[
  /* Towering emergent Carboniferous canopy in dense humid basin groves (skyscale 0, forktree 1, bellbark 2, araucaria 17) */
  {sp:0, cell:68, accept:(Z)=>Z.canopy&&Z.flat&&Z.grove>0.48?0.72:0, opt:{pad:10,patch:0.55,patchScale:850}},
  {sp:1, cell:48, accept:(Z)=>Z.canopy&&Z.flat?0.78:0, opt:{pad:7,patch:0.50,patchScale:720}},
  {sp:2, cell:54, accept:(Z)=>Z.canopy&&Z.sl<0.34?0.68:0, opt:{pad:8,patch:0.48,patchScale:760}},
  {sp:17,cell:56, accept:(Z)=>Z.humid&&Z.grove>0.38&&Z.sl<0.45?0.62:0, opt:{pad:7,patch:0.48,patchScale:800}},
  /* Lush shoreline riparian gallery right to the salt-lake waterline (waterpalm 19, kneetree 6, stiltwood 7, beardoak 18, cordaite 15, tidelycopsid 11) */
  {sp:19,cell:18, accept:(Z)=>Z.waterline?0.92:(Z.shore?0.55:0), opt:{pad:2,patch:0.25,patchScale:260}},
  {sp:7, cell:24, accept:(Z)=>Z.waterline?0.85:(Z.shore?0.65:0), opt:{pad:3,patch:0.28,patchScale:320}},
  {sp:6, cell:32, accept:(Z)=>Z.shore?0.82:(Z.humid&&Z.wd<200?0.48:0), opt:{pad:5,patch:0.35,patchScale:420}},
  {sp:18,cell:40, accept:(Z)=>Z.shore||Z.canopy?0.70:0, opt:{pad:6,patch:0.42,patchScale:560}},
  {sp:15,cell:30, accept:(Z)=>Z.shore||Z.canopy?0.66:0, opt:{pad:4,patch:0.35,patchScale:460}},
  {sp:11,cell:22, accept:(Z)=>Z.waterline?0.82:(Z.shore&&Z.salt>0.12?0.70:0), opt:{pad:2.5,patch:0.3,patchScale:340}},
  /* Rich Carboniferous mid-story & fern understory inside groves (treefern 3, horsetail 5, sigillaria 14, seedfern 16, sanfordacaulis 13, calamophyton 12) */
  {sp:3, cell:26, accept:(Z)=>Z.humid&&Z.grove>0.28?0.76:0, opt:{pad:3,patch:0.38,patchScale:480}},
  {sp:5, cell:20, accept:(Z)=>Z.waterline?0.84:(Z.shore?0.68:0), opt:{pad:2,patch:0.3,patchScale:300}},
  {sp:14,cell:36, accept:(Z)=>Z.canopy?0.64:0, opt:{pad:4,patch:0.42,patchScale:560}},
  {sp:16,cell:24, accept:(Z)=>Z.humid&&Z.grove>0.32?0.70:0, opt:{pad:3,patch:0.38,patchScale:440}},
  {sp:13,cell:34, accept:(Z)=>Z.humid&&Z.grove>0.36?0.56:0, opt:{pad:3.5,patch:0.4,patchScale:500}},
  {sp:12,cell:24, accept:(Z)=>Z.humid&&Z.grove>0.30?0.60:0, opt:{pad:2.5,patch:0.36,patchScale:400}},
  /* Dry salt-bench, open glade margins, and escarpment scrub (cycad 4, fanpalm 8, umbrella 9, jade 10) */
  {sp:4, cell:28, accept:(Z)=>Z.sl<0.45&&Z.salt<0.85?0.54:0, opt:{pad:2.5,patch:0.42,patchScale:480}},
  {sp:8, cell:30, accept:(Z)=>Z.sl<0.42&&Z.wet>0.18?0.56:0, opt:{pad:2.5,patch:0.36,patchScale:460}},
  {sp:9, cell:38, accept:(Z)=>Z.rim||(!Z.canopy&&Z.sl<0.48)?0.52:0, opt:{pad:4,patch:0.45,patchScale:620}},
  {sp:10,cell:20, accept:(Z)=>Z.sl<0.55&&Z.salt<0.90?0.50:0, opt:{pad:2,patch:0.4,patchScale:380}}
];
/* Ensure EASTABYSS grows across the entire cut (e abysss, Yuni Valley, east rim) */
if(typeof WORLD!=='undefined'&&WORLD.kitW){
  const origKW=WORLD.kitW;
  WORLD.kitW=(k,x,z)=>k===0?Math.max(0.85,origKW(k,x,z)):origKW(k,x,z);
}
return{
  name:'eastabyss',
  SPECIES:SP,
  PASSES:PASSES,
  zones:zones,
  buildFloor:EA&&EA.buildFloor?EA.buildFloor:null,
  make:(sp,x,y,z)=>EA?EA.make(sp,x,y,z):null,
  grow:(T,lv)=>EA?EA.grow(T,lv):null
};})();
