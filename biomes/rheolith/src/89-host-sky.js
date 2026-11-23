// ================================================================= HOST — Krator's sky over the SE Throne Rift Graben (core/atmos)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: px 938, 902, +1,380 m, 1.18 atm),
// with the Throne's high summit cone rising NW and the lower SE slopes falling toward the Ring Sea.
const SKY=ATMOS.skyBiome({
 renderer,camera,scene,sun:sun,site:Array.isArray(SITE.sky)?{px:SITE.sky[0],py:SITE.sky[1]}:SITE.sky,
 preset:{
  air:{pressure:SITE.atm,humidity:0.54},
  clouds:{cover:0.28,cumulus:0.32,cirrus:0.28},
  fogDensity:0.00028,
  ridges:[
   {base:4.8,amp:1.9,cycles:28,octaves:3,seed:91,peaks:18,peakAmp:0.9,win:[315,75,2.0],floor:1.2,dist:38000,haze:0.42,forestH:0.65,rock:[0.38,0.34,0.32],snow:[0.92,0.92,0.94]},
   {base:1.6,amp:0.9,cycles:44,octaves:3,seed:92,peaks:20,peakAmp:0.4,win:[135,190,2.2],floor:0.2,dist:56000,haze:0.55,forestH:0.85,rock:[0.44,0.42,0.36],snow:[0.9,0.9,0.92]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
