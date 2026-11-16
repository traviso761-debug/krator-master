// ================================================================= HOST — station 2, the dry-summer montane: the SITE (read by 45-host-stage.js)
// PLAN-STATIONS.md station 2 (Dsb, Csb). Scale model 5.1: the densest Dsb/Csb ground near the plateau is round px 610,710 (tools/scale-model's climate raster,
// read 2026-11-09), a few km from Roketstad (px 609,684). The geology bake (kits/resources/data/geology.json) puts it on SEDIMENTARY ground, so the plan's
// granite domes and slabs are drawn as SANDSTONE domes and slabs (the owner's call: PLAN-STATIONS.md). The look: open forest of big pines and firs over a
// golden bunchgrass floor, fire-kept and park-like; the red giants in the moist draws; black oaks low and on the sunny (north-facing) slopes; meadows of
// corn lilies where the water gathers; the kit's trumpets thinned to the draws. Heights in the kit's page scale (station 1: 0-1400 m for 2.3-3 km): a bench
// at ~950-1100 m rising to the SE.
const SITE={
 name:'The dry-summer montane (station 2)',R:2400,breccia:false,
 ramp:s=>990+110*(s/3394)+18*Math.sin(s*.0011),
 farNW:d=>-d*.09-200*smooth(0,6000,d),farSE:d=>d*.12+600*smooth(2000,14000,d),
 relief:{spur:[34,60],swell:46,grain:12},
 // sandstone domes (an exfoliation dome's steep-sided cap), and the rounded rises the wood stands on
 domes:[{x:900,z:-700,R:300,h:95,p:.55},{x:-1200,z:1100,R:240,h:70,p:.6},{x:1700,z:900,R:200,h:55,p:.6},{x:-500,z:-1700,R:170,h:40,p:.7}],
 knolls:[{x:300,z:600,R:500,h:28},{x:-1700,z:-400,R:420,h:22}],
 // one sandstone step across the slope: the stream drops over it (a fall)
 scarps:[{s0:-600,amp:22,a:140,f:.0015,ph:.7,seed:73}],
 stream:{name:'The creek',src:2700,end:-3300,t0:-80,a1:220,f1:.001,p1:.9,a2:80,f2:.0031,p2:.4,halfW:[1.6,3.8],dep:[.35,.7],Wv:[70,60],Vd:[10,18]},
 tarn:{name:'The meadow pond',r:30,depth:2.6,gradient:{centre:0x26342e,rim:0x6a6a48,power:1.5}},
 // the climate in the kit's terms: the montane band (cold .4-.55), the dry summer (wet .3-.6: higher in the draws and by the water, lowest on the sunny
 // north-facing slopes), the domes and steps bare rock
 climate:F=>({cold:.42+.12*smooth(850,1250,F.h)+.06*F.valley-.05*Math.max(0,F.north)+.05*F.n2,
  wet:.34+.22*F.valley+.3*F.flow-.12*Math.max(0,F.north)+.08*F.n1,
  rock:Math.max(smooth(.55,1.0,F.slope),F.dome*.92),mist:.25*F.valley*smooth(-.2,.2,F.n2)+.15*F.flow}),
 // the station's own fields: MEADOW (flat and wet: the draws' floors and round the pond), DRAW (the moist ravines: the red giants), FIRE (old burns: snags,
 // fireweed), OPEN (the park's openness: fewer trees where it is dry and sunny)
 extra:{names:['meadow','draw','fire','open'],at:(F,c)=>{const fl=smooth(.16,.04,F.slope),wt=c.wet;
  return{meadow:fl*smooth(.5,.72,wt)*(1-F.dome)*smooth(-.08,.1,F.n1),draw:F.valley*smooth(.45,.25,F.slope)*(1-F.dome),
   fire:smooth(.62,.7,fbm(F.x*.0015+71,F.z*.0015-17,4471,2))*(1-F.valley*.6),open:clamp(.35+.5*Math.max(0,F.north)+.3*(fbm(F.x*.0024-9,F.z*.0024+5,4472,2)-.5),0,1)};}},
 spine:[[1100,200],[-200,-500],[2000,-600],[-2200,300]]};
// the sky: the place (5.1 px), the air (the plan's ~3.4 km: about 1 atm on Krator's scale, as the plateau's 1.06), a dry summer's few clouds
SITE.sky={px:610,py:710,pressure:1.02,humidity:.42,clouds:{cover:.18,cumulus:.6,cirrus:.35}};
