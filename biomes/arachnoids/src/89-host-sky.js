// ================================================================= HOST — standard Krator sky dome (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   nexus:    px (998, 290)  -> sky (726, -40),  1.47 atm slot-gorge air
//   fumarole: px (1097, 331) -> sky (825, 1),    1.43 atm hydrothermal cauldron air
//   ledges:   px (984, 283)  -> sky (712, -47),  1.31 atm Csa mid-wall colonnade air
//   frostrim: px (919, 281)  -> sky (647, -49),  0.88 atm ET high alpine frost-rim air
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.pAtm,humidity:SKEY==='fumarole'?0.84:SKEY==='nexus'?0.76:SKEY==='ledges'?0.46:0.38},
  clouds:{cover:SKEY==='fumarole'?0.42:SKEY==='nexus'?0.36:SKEY==='ledges'?0.24:0.28,cumulus:0.36,cirrus:0.32},
  fogDensity:SKEY==='fumarole'?0.00034:SKEY==='nexus'?0.00030:SKEY==='ledges'?0.00020:0.00018,
  ridges:[
   {base:SKEY==='frostrim'?5.8:4.6,amp:2.4,cycles:28,octaves:3,seed:93,peaks:18,peakAmp:1.2,win:[45,165,2.2],floor:0.8,dist:36000,haze:0.44,forestH:SKEY==='frostrim'?0.10:0.68,rock:[0.34,0.36,0.40],snow:[0.92,0.94,0.96]},
   {base:3.8,amp:1.8,cycles:38,octaves:3,seed:94,peaks:16,peakAmp:0.7,win:[225,165,2.2],floor:0.2,dist:54000,haze:0.56,forestH:0.48,rock:[0.40,0.42,0.46],snow:[0.90,0.92,0.95]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
