// ================================================================= HOST — Krator's sky at THE RIFT FLOOR (station 5; replaces src/89-host-sky.js)
// The shared sky (core/atmos SKY-PLAN.md section 9) at the easternmost Rift lake on the scale model (old canvas px 637,1226), on the host clock. The air of the
// floor: 1.9 atm, hypertropic and wet, a thick haze. The ridges: the Vale's rim and the step high to the north-west and north, the twin volcanoes far east
// (az 60-100), the Rift's walls low and blue to the south and west. THE CATARACT on the skyline: the step at old px 635-670, 1230-1265 stands south-east
// of the lake (bearing ~146 degrees): its white fall and its plume of spray as the sky's landmark layer, as the Vale's page paints it at az 112.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:637,py:1226},
 preset:{"air":{"pressure":1.9,"humidity":0.92},"clouds":{"cover":0.5},"fogDensity":0.0002,"ridges":[
  {"base":10.5,"amp":2.4,"cycles":9,"octaves":3,"seed":71,"peaks":16,"peakAmp":1.4,"win":[330,110,1.4],"floor":-1,"dist":18000,"haze":0.18,"snowH":2600,"forestH":0,"rock":[0.56,0.6,0.66],"snow":[0.93,0.94,0.96]},
  {"base":5.5,"amp":3.0,"cycles":7,"octaves":3,"seed":72,"peaks":12,"peakAmp":2.2,"win":[80,60,1.2],"floor":-1,"dist":30000,"haze":0.3,"snowH":2300,"forestH":0,"rock":[0.6,0.63,0.7],"snow":[0.94,0.95,0.97]},
  {"base":3.2,"amp":1.2,"cycles":13,"octaves":3,"seed":73,"peaks":20,"peakAmp":0.6,"win":[146,40,1.0],"floor":-1,"dist":5200,"haze":0.3,"forestH":200,"rock":[0.4,0.42,0.38],"forest":[0.22,0.32,0.2]},
  {"base":2.0,"amp":1.0,"cycles":13,"octaves":3,"seed":74,"peaks":20,"peakAmp":0.5,"win":[220,100,0.8],"floor":-1,"dist":24000,"haze":0.5,"forestH":0,"rock":[0.42,0.5,0.54]}],
 "landmarks":[{"kind":"band","win":[146,1.6,1],"el":[-0.1,3.1],"lit":[1.15,1.15,1.15],"alpha":0.9,"noise":0,"haze":0.3},
  {"kind":"plume","from":[146,0],"via":[146,4.5],"to":[148,9],"width":[3,26],"lit":[1,1,1],"belly":[0.82,0.85,0.86],"alpha":0.42,"haze":0.35,"drift":0.05}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene) */
