// ================================================================= HOST — Krator shared sky over Double Delta (core/atmos)
// ATMOS.skyBiome at the station's Scale Model 5.1 pixel (SITE.sky = px - [272, 330]), 1.58-1.60 atm tropical monsoon air (Am).
const SKY=ATMOS.skyBiome({
 renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{
  air:{pressure:SITE.atm,humidity:0.84},
  clouds:{cover:0.46,cumulus:0.58,cirrus:0.28},
  fogDensity:0.00017,
  ridges:SKEY==='throat'?[
   {base:0.55,amp:0.42,cycles:34,octaves:3,seed:91,peaks:16,peakAmp:0.32,win:[35,145,2.0],floor:0.05,dist:24000,haze:0.42,snowH:99,forestH:0.85,rock:[0.34,0.38,0.32],snow:[0.34,0.38,0.32]}
  ]:[
   {base:0.22,amp:0.18,cycles:28,octaves:2,seed:92,peaks:10,peakAmp:0.14,win:[45,135,2.2],floor:0.0,dist:28000,haze:0.55,snowH:99,forestH:0.9,rock:[0.34,0.40,0.36],snow:[0.34,0.40,0.36]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
