// ================================================================= HOST — Krator's sky: the shared sky at the high ranges (core/atmos, SKY-PLAN.md section 9; station 3)
// ATMOS.skyBiome at the station's place on the scale model (ET's centre, old px 662,1205), on the host clock, in thin air (0.83 atm at ~5 km: the sky
// deeper blue, the haze thin, little fog). Ridges: the far ranges all round (snow from 5.2 km), lower to the north where the ground falls to the Vale.
// LANDMARKS: the two vent cones' plumes (old px 716,1128 at 10.7 km and 770,1168 at 8.4 km), bearing 35 and 71 degrees from the station, far off
// over the north-eastern ranges: two leaning columns of steam and ash, the higher one the taller. Behind them the Vale's own haze.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:662,py:1205},
 preset:{"air":{"pressure":0.83,"humidity":0.35},"clouds":{"cover":0.3},"fogDensity":0.00006,
  "ridges":[{"base":7.5,"amp":3.0,"cycles":9,"octaves":3,"seed":61,"peaks":18,"peakAmp":2.0,"win":[180,200,1.4],"floor":-1,"dist":22000,"haze":0.06,"snowH":5200,"forestH":0,"rock":[0.55,0.56,0.6],"snow":[0.94,0.95,0.97]},
   {"base":3.0,"amp":1.6,"cycles":13,"octaves":3,"seed":62,"peaks":24,"peakAmp":1.0,"win":[0,160,0.6],"floor":-1,"dist":26000,"haze":0.12,"snowH":5600,"forestH":0,"rock":[0.5,0.53,0.58],"snow":[0.93,0.94,0.96]}],
  "landmarks":[{"kind":"plume","from":[35,1.6],"via":[33,6],"to":[29,11],"width":[2.2,16],"lit":[0.96,0.94,0.92],"belly":[0.62,0.6,0.6],"alpha":0.55,"haze":0.18,"drift":0.04},
   {"kind":"plume","from":[71,1.1],"via":[69,4.5],"to":[66,8],"width":[1.8,12],"lit":[0.96,0.95,0.94],"belly":[0.66,0.64,0.64],"alpha":0.45,"haze":0.22,"drift":0.05}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene) */
