// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   spillway: (1272, 193) -> (1000, -137), 1.333 atm     fen:      (1328, 228) -> (1056, -102), 1.333 atm
//   narrows:  (1288, 220) -> (1016, -110), 1.333 atm     dolomite: (1256, 184) -> (984, -146),  1.326 atm
//   pavilion: (1308, 224) -> (1036, -106), 1.328 atm     rampart:  (1278, 166) -> (1006, -164), 1.240 atm
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='rampart'?0.58:SKEY==='fen'?0.82:0.74},
  clouds:{cover:SKEY==='rampart'?0.28:SKEY==='fen'?0.40:0.34,cumulus:0.36,cirrus:0.32},
  fogDensity:SKEY==='fen'?0.00030:SKEY==='rampart'?0.00018:0.00024,
  ridges:[
   {base:SKEY==='rampart'?2.4:4.2,amp:1.9,cycles:24,octaves:3,seed:191,peaks:16,peakAmp:0.95,win:[20,175,2.2],floor:0.6,dist:38000,haze:0.46,forestH:SKEY==='rampart'?0.45:0.82,rock:[0.52,0.50,0.46],snow:[0.93,0.94,0.96]},
   {base:SKEY==='rampart'?2.8:3.4,amp:1.5,cycles:34,octaves:3,seed:192,peaks:14,peakAmp:0.75,win:[200,175,2.2],floor:0.4,dist:56000,haze:0.58,forestH:0.68,rock:[0.48,0.47,0.45],snow:[0.92,0.93,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
