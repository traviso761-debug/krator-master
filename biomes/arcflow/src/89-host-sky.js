// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   klint: (638, 136) -> (366, -194), 1.57 atm    seep:  (518, 118) -> (246, -212), 1.58 atm
//   koski: (556,  96) -> (284, -234), 1.51 atm    neva:  (648, 130) -> (376, -200), 1.55 atm
//   auger: (885, 108) -> (613, -222), 1.37 atm
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='auger'?0.58:SKEY==='seep'?0.84:0.78},
  clouds:{cover:SKEY==='auger'?0.26:0.36,cumulus:0.38,cirrus:0.32},
  fogDensity:SKEY==='klint'?0.00026:SKEY==='neva'?0.00024:0.00019,
  ridges:[
   {base:3.0,amp:1.4,cycles:22,octaves:3,seed:391,peaks:12,peakAmp:0.72,win:[20,180,2.2],floor:0.4,dist:38000,haze:0.48,forestH:0.82,rock:[0.38,0.46,0.42],snow:[0.92,0.94,0.95]},
   {base:2.6,amp:1.2,cycles:30,octaves:3,seed:392,peaks:10,peakAmp:0.62,win:[200,180,2.2],floor:0.3,dist:56000,haze:0.60,forestH:0.72,rock:[0.48,0.44,0.44],snow:[0.92,0.93,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
