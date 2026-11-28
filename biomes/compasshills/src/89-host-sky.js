// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome at exact Scale-Model 5.1 pixel shifted by (-272, -330) to the 1549x1393 sky frame:
//   foundry: px (1058, 224) -> sky (+786, -106), 1.43 atm Cfa cuesta upland
//   tors:    px (1128, 248) -> sky (+856,  -82), 1.34 atm Cfa high ironstone scarp
//   cuesta:  px (1046, 258) -> sky (+774,  -72), 1.42 atm Csa dry-summer dip-slope
//   gorge:   px (1055, 219) -> sky (+783, -111), 1.44 atm Cfa Ham-Tsek river narrows
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.pAtm,humidity:SKEY==='cuesta'?0.44:SKEY==='tors'?0.64:0.54},
  clouds:{cover:SKEY==='tors'?0.44:SKEY==='cuesta'?0.22:0.30,cumulus:SKEY==='tors'?0.52:0.34,cirrus:0.26},
  fogDensity:SKEY==='tors'?0.00024:SKEY==='gorge'?0.00026:0.00020,
  ridges:[
   {base:4.2,amp:1.9,cycles:28,octaves:3,seed:191,peaks:16,peakAmp:0.9,win:[35,175,2.2],floor:0.6,dist:38000,haze:0.46,forestH:0.65,rock:[0.44,0.38,0.34],snow:[0.92,0.93,0.95]},
   {base:2.8,amp:1.4,cycles:36,octaves:3,seed:192,peaks:14,peakAmp:0.6,win:[215,175,2.2],floor:0.3,dist:56000,haze:0.58,forestH:0.52,rock:[0.48,0.44,0.40],snow:[0.90,0.92,0.94]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
