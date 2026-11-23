// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   shore: px (123, 659) -> sky (-149, 329), 1.60 atm maritime air
//   wash:  px (116, 920) -> sky (-156, 590), 1.20 atm montane gorge air
//   head:  px (107, 1038) -> sky (-165, 708), 1.07 atm subalpine tarn & pass air
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='shore'?0.78:SKEY==='wash'?0.64:0.52},
  clouds:{cover:SKEY==='shore'?0.42:SKEY==='wash'?0.36:0.28,cumulus:0.38,cirrus:0.30},
  fogDensity:SKEY==='shore'?0.00026:SKEY==='wash'?0.00030:0.00022,
  ridges:[
   {base:SKEY==='shore'?3.2:5.4,amp:2.2,cycles:26,octaves:3,seed:91,peaks:18,peakAmp:1.1,win:[45,165,2.2],floor:0.8,dist:36000,haze:0.44,forestH:SKEY==='head'?0.18:0.75,rock:[0.36,0.38,0.40],snow:[0.92,0.94,0.96]},
   {base:SKEY==='shore'?0.4:3.6,amp:SKEY==='shore'?0.3:1.6,cycles:38,octaves:3,seed:92,peaks:16,peakAmp:0.6,win:[225,165,2.2],floor:0.1,dist:54000,haze:0.56,forestH:0.55,rock:[0.42,0.44,0.46],snow:[0.90,0.92,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
