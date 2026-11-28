// ================================================================= HOST — thin-air outer-wall sky (core/atmos; [G native])
// ATMOS.skyBiome across the SW Outer Wall's north-to-south barometric gradient (PLAN.md sections 1 & 3):
//   boreallakes: (264,  904) -> sky (-8,  574), 1.10 atm Veil-mist boreal sky
//   morainetarn: (276, 1024) -> sky ( 4,  694), 0.91 atm crisp alpine sky
//   trigemini:   (279, 1120) -> sky ( 7,  790), 0.76 atm deep sapphire thin-air pass sky
//   breathvale:  (410, 1213) -> sky (138, 883), 0.62 atm stark cobalt-violet threshold sky
const SKY=ATMOS.skyBiome({
 renderer:renderer,camera:camera,scene:scene,sun:sun,
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 shade:{biome:0.42,host:0.65},
 preset:{
  air:{
   pressure:SKEY==='breathvale'?0.62:SITE.atm,
   humidity:SKEY==='boreallakes'?0.78:SKEY==='morainetarn'?0.54:SKEY==='trigemini'?0.34:0.20
  },
  clouds:{
   cover:SKEY==='boreallakes'?0.44:SKEY==='morainetarn'?0.30:SKEY==='trigemini'?0.22:0.12,
   cumulus:SKEY==='boreallakes'?0.42:0.24,
   cirrus:0.38
  },
  fogDensity:SKEY==='boreallakes'?0.00026:SKEY==='morainetarn'?0.00019:SKEY==='trigemini'?0.00014:0.00009,
  ridges:[
   {base:3.6,amp:1.8,cycles:20,octaves:3,seed:931,peaks:14,peakAmp:0.86,win:[20,180,2.2],floor:0.4,dist:36000,haze:0.38,forestH:SKEY==='boreallakes'?0.72:0.12,rock:[0.40,0.38,0.38],snow:[0.93,0.95,0.97]},
   {base:3.2,amp:1.6,cycles:28,octaves:3,seed:932,peaks:12,peakAmp:0.78,win:[200,180,2.2],floor:0.3,dist:54000,haze:0.52,forestH:0.10,rock:[0.44,0.42,0.44],snow:[0.94,0.95,0.98]}
  ],
  landmarks:[]
 }
});
const {sky,giant,giantRing}=SKY.legacy;
