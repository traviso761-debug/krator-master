// ================================================================= HOST — standard Krator sky (core/atmos; [G native])
// ATMOS.skyBiome (which automatically runs ATMOS.cloudShadeScene on every lit material!) at exact Scale-Model 5.1 pixel
// shifted by (-272, -330) to the 1549x1393 sky frame:
//   hall:      (252, 668) -> (-20, 338), 1.21 atm    veilpass:  (278, 842) -> (  6, 512), 1.05 atm
//   gorge:     (214, 742) -> (-58, 412), 1.18 atm    southvale: (228, 948) -> (-44, 618), 1.14 atm
//   kanopi:    (242, 752) -> (-30, 422), 1.17 atm
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{
  air:{pressure:SITE.atm,humidity:SKEY==='veilpass'?0.82:0.94},
  clouds:{cover:SKEY==='southvale'?0.76:0.64,cumulus:0.54,cirrus:0.38},
  fogDensity:SKEY==='southvale'?0.0022:SKEY==='kanopi'?0.0015:SKEY==='gorge'?0.0016:SKEY==='veilpass'?0.0010:0.0014,
  ridges:[
   {base:5.2,amp:2.4,cycles:18,octaves:3,seed:491,peaks:14,peakAmp:1.15,win:[20,180,2.2],floor:0.6,dist:26000,haze:0.56,forestH:0.68,rock:[0.34,0.40,0.42],snow:[0.93,0.95,0.97]},
   {base:4.4,amp:2.0,cycles:26,octaves:3,seed:492,peaks:12,peakAmp:0.95,win:[200,180,2.2],floor:0.5,dist:44000,haze:0.68,forestH:0.54,rock:[0.40,0.44,0.46],snow:[0.94,0.96,0.98]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
