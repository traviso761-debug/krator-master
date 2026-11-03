// ================================================================= HOST — Krator's sky at THE DESCENT (station 4; replaces src/89-host-sky.js)
// The shared sky (core/atmos SKY-PLAN.md section 9) at the cataract step on the scale model (old canvas px 652, 1248), on the host clock. The air of the
// abyss's edge: 1.9 atm and wet, the spray's haze thicker than the Vale's. The ridges: the Vale's rim standing north-west behind the step, the abyss's far walls
// low and blue to the south-east, the high ranges of the twin volcanoes east (az 60-100). No painted cataract: it is on the page (89w).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:652,py:1248},
 preset:{"air":{"pressure":1.9,"humidity":0.88},"clouds":{"cover":0.45},"fogDensity":0.00018,"ridges":[
  {"base":9.5,"amp":2.6,"cycles":9,"octaves":3,"seed":61,"peaks":18,"peakAmp":1.4,"win":[315,150,1.4],"floor":-1,"dist":16000,"haze":0.12,"snowH":2670,"forestH":0,"rock":[0.59,0.62,0.7],"snow":[0.93,0.94,0.96]},
  {"base":6.0,"amp":3.0,"cycles":7,"octaves":3,"seed":62,"peaks":12,"peakAmp":2.2,"win":[80,60,1.2],"floor":-1,"dist":30000,"haze":0.25,"snowH":2400,"forestH":0,"rock":[0.6,0.63,0.7],"snow":[0.94,0.95,0.97]},
  {"base":2.2,"amp":1.0,"cycles":13,"octaves":3,"seed":63,"peaks":20,"peakAmp":0.5,"win":[135,120,0.8],"floor":-1,"dist":24000,"haze":0.45,"forestH":0,"rock":[0.42,0.5,0.54]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene) */
