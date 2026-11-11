// ================================================================= HOST — station 3, the Mediterranean foothills: the SITE (read by station 2's 45-host-stage.js, the base)
// PLAN-STATIONS.md station 3 (Csa). Scale model 5.1: the densest Csa ground near the plateau is round px 590,630 (the climate raster, read 2026-11-09);
// the geology bake puts it on sedimentary ground. The look: oak woodland and savanna on golden summer grass, chaparral on the steep SUNNY slopes (north-
// facing here, near 40 S), a creek lined with sycamore and alder. Heights in the kit's page scale: rolling hills at ~380-560 m (station 1's temperate band).
const SITE={
 name:'The Mediterranean foothills (station 3)',R:2400,breccia:false,
 ramp:s=>460+90*(s/3394)+14*Math.sin(s*.0013),
 farNW:d=>-d*.05-120*smooth(0,5000,d),farSE:d=>d*.16+700*smooth(2000,14000,d),
 relief:{spur:[60,70],swell:40,grain:10},
 domes:[],knolls:[{x:-900,z:-600,R:520,h:46},{x:1200,z:900,R:600,h:52},{x:-1600,z:1300,R:450,h:38},{x:1500,z:-1500,R:480,h:44}],
 scarps:[],
 stream:{name:'The creek',src:2900,end:-3300,t0:40,a1:260,f1:.0012,p1:.3,a2:90,f2:.0037,p2:1.2,halfW:[1.4,3.2],dep:[.3,.6],Wv:[90,70],Vd:[12,20]},
 tarn:{name:'The stock pond',r:22,depth:2,gradient:{centre:0x3a4434,rim:0x7a7050,power:1.4}},
 // the climate in the kit's terms: warm temperate (cold .12-.28), dry (wet .2-.5: the creek's banks wetter, the sunny slopes driest)
 climate:F=>({cold:.18+.08*smooth(380,600,F.h)+.06*F.valley-.06*Math.max(0,F.north)+.04*F.n2,
  wet:.24+.25*F.valley+.35*F.flow-.14*Math.max(0,F.north)+.08*F.n1,
  rock:smooth(.6,1.1,F.slope)*.7,mist:.15*F.flow}),
 // CHAPARRAL (the steep sunny slopes), SAVANNA (the open rolling grass with lone oaks), SHADE (the shaded, south-facing slopes: oak woodland), GROVE (a cork
 // grove's patch)
 extra:{names:['chaparral','savanna','shade','grove'],at:(F,c)=>({chaparral:smooth(.12,.3,F.slope)*smooth(-.1,.4,F.north)*(1-F.valley*.8),
  savanna:smooth(.22,.08,F.slope)*(1-F.valley*.7)*smooth(-.15,.1,F.north+.1),shade:smooth(-.05,-.4,F.north)*smooth(.06,.2,F.slope),
  grove:smooth(.68,.74,fbm(F.x*.0018+33,F.z*.0018-7,4481,2))*(1-F.valley)})},
 spine:[[1200,100],[-600,-400],[-2000,500],[2200,-700]]};
SITE.sky={px:590,py:630,pressure:1.18,humidity:.4,clouds:{cover:.12,cumulus:.5,cirrus:.3}};
