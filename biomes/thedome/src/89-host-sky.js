/* ================================================================= HOST — standard Krator sky (core/atmos; [G native])
   ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
     apron: (1336, 128) -> (1064, -202), 1.20 atm    crown: (1328, 150) -> (1056, -180), 1.11 atm
     moat:  (1317, 117) -> (1045, -213), 1.29 atm    cleft: (1372, 148) -> (1100, -182), 1.17 atm
*/
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.skyOffset[0],py:SITE.skyOffset[1]},
 preset:{
  air:{pressure:SITE.pAtm,humidity:SKEY==='crown'?0.86:SKEY==='moat'?0.78:0.68},
  clouds:{cover:SKEY==='crown'?0.48:SKEY==='moat'?0.36:0.28,cumulus:0.38,cirrus:0.34},
  fogDensity:SKEY==='crown'?0.00032:SKEY==='moat'?0.00026:0.00020,
  ridges:[
   {base:SKEY==='crown'?1.8:3.6,amp:1.7,cycles:22,octaves:3,seed:291,peaks:14,peakAmp:0.85,win:[25,180,2.2],floor:0.4,dist:42000,haze:0.48,forestH:0.62,rock:[0.56,0.50,0.48],snow:[0.93,0.94,0.96]},
   {base:SKEY==='crown'?2.2:3.1,amp:1.4,cycles:32,octaves:3,seed:292,peaks:12,peakAmp:0.70,win:[205,180,2.2],floor:0.3,dist:60000,haze:0.60,forestH:0.55,rock:[0.50,0.47,0.46],snow:[0.92,0.93,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
