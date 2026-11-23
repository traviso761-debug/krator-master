/* ==================== HOST — Krator shared sky over The Drownlands (core/atmos) ==================== */
/* ATMOS.skyBiome at each station's surveyed Scale Model 5.1 pixel (SITE.sky = px - [272, 330]), 1.59-1.60 atm Am monsoon air. */

const SKY=ATMOS.skyBiome({
 renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{
  air:{pressure:SITE.atm,humidity:0.85},
  clouds:{cover:0.44,cumulus:0.56,cirrus:0.26},
  fogDensity:0.00022,
  ridges:[
   {base:0.18,amp:0.22,cycles:30,octaves:3,seed:73,peaks:12,peakAmp:0.18,win:[35,150,2.1],floor:0.0,dist:26000,haze:0.52,snowH:99,forestH:0.88,rock:[0.28,0.38,0.36],snow:[0.28,0.38,0.36]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
