// ================================================================= HOST — STATION gills: the shared sky at Alph's head (core/atmos, SKY-PLAN.md section 9)
// The sky at the station's place on the scale model (old canvas px 666,1166) at ~0.73 atm: thin, dry, dark-blue air, the giant nodding once a day.
// THE BREATH'S HOUR (PLAN.md section 11: "set at the breath's hour so the fountain is seen to be forced"): the page opens at the middle of the out-breath
// on its day (GILLS.peakHour: the top of the giant's nod, ATMOS.libration's), unless #hour= asks for another. The ridges: the snow ranges round, near
// and far, no cataract notch (the Vale's sky has it; up here the Vale lies below the haze to the south-south-west).
if(!/[?&#]hour=/.test(location.search+location.hash)){const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1])||0:0;ATMOS.SKY.viewHour=GILLS.peakHour(d);}
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:666,py:1166},
 preset:{"air":{"pressure":0.73,"humidity":0.3},"clouds":{"cover":0.25},"fogDensity":0.00006,"ridges":[{"base":7.5,"amp":3.0,"cycles":9,"octaves":3,"seed":61,"peaks":20,"peakAmp":2.2,"win":[0,360,1.0],"floor":-1,"dist":22000,"haze":0.08,"snowH":4200,"forestH":0,"rock":[0.52,0.54,0.6],"snow":[0.95,0.96,0.98]},{"base":2.4,"amp":1.4,"cycles":15,"octaves":3,"seed":62,"peaks":30,"peakAmp":0.8,"win":[150,90,0.8],"floor":-3,"dist":12000,"haze":0.3,"forestH":2400,"rock":[0.42,0.44,0.44],"forest":[0.36,0.44,0.38]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene) */
