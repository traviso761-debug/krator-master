// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   ringlake:   (1205, 1482) -> (933, 1152), 1.07 atm    notch:      (1285, 1508) -> (1013, 1178), 0.99 atm
//   vents:      (1450, 1558) -> (1178, 1228), 1.08 atm   glasssheet: (1158, 1522) -> (886, 1192), 1.02 atm
//   highbowl:   (1375, 1525) -> (1103, 1195), 0.82 atm
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 shade:false,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='vents'?0.76:SKEY==='highbowl'?0.42:0.58},
  clouds:{cover:SKEY==='highbowl'?0.22:0.32,cumulus:0.34,cirrus:0.36},
  fogDensity:SKEY==='vents'?0.00022:SKEY==='highbowl'?0.00020:0.00016,
  ridges:[
   {base:5.2,amp:2.4,cycles:20,octaves:3,seed:491,peaks:14,peakAmp:1.15,win:[20,180,2.2],floor:0.6,dist:26000,haze:0.38,forestH:0.52,rock:[0.34,0.35,0.38],snow:[0.94,0.96,0.98]},
   {base:4.8,amp:2.1,cycles:28,octaves:3,seed:492,peaks:12,peakAmp:0.98,win:[200,180,2.2],floor:0.5,dist:44000,haze:0.52,forestH:0.44,rock:[0.38,0.37,0.40],snow:[0.94,0.95,0.98]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
