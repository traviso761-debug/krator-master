// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   spring:   (1144, 168) -> (872, -162), 1.41 atm      fenestre: (1212, 174) -> (940, -156), 1.37 atm
//   shutin:   (1224, 158) -> (952, -172), 1.33 atm      glade:    (1176, 184) -> (904, -146), 1.39 atm
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='spring'?0.80:SKEY==='glade'?0.68:0.74},
  clouds:{cover:SKEY==='spring'?0.34:0.30,cumulus:0.36,cirrus:0.30},
  fogDensity:SKEY==='spring'?0.00026:SKEY==='fenestre'?0.00024:0.00020,
  ridges:[
   {base:3.4,amp:1.6,cycles:24,octaves:3,seed:291,peaks:14,peakAmp:0.82,win:[25,175,2.2],floor:0.5,dist:36000,haze:0.46,forestH:0.84,rock:[0.58,0.48,0.48],snow:[0.93,0.94,0.95]},
   {base:2.9,amp:1.3,cycles:32,octaves:3,seed:292,peaks:12,peakAmp:0.68,win:[205,175,2.2],floor:0.4,dist:54000,haze:0.58,forestH:0.74,rock:[0.54,0.50,0.48],snow:[0.92,0.93,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
