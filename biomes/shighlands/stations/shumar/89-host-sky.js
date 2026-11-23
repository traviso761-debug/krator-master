// ================================================================= HOST — Krator's sky at Shumar (the shared sky, core/atmos, SKY-PLAN.md section 9)
// Map 5.1 px 737,1201 (old canvas px 465,871; PLAN-STATIONS.md): 3,308 m, Dsb, 424 mm/yr, 1.06 atm crisp dry highland air. Godthrone's dark
// massif and high plume rise to the south-east (az ~118 deg); the Inner Wall's dry ridges stand north-east and east, and the SW rim toward Greenstep.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:465,py:871},
 preset:{"air":{"pressure":1.06,"humidity":0.34},"clouds":{"cover":0.22,"cumulus":0.32,"cirrus":0.55},"fogDensity":0.00018,
  "ridges":[
   {"base":2.5,"amp":0.85,"cycles":22,"octaves":3,"peaks":20,"peakAmp":0.7,"seed":41,"win":[118,32,2.2],"floor":-0.25,"dist":110000,"haze":0.11,"forestH":0,"rock":[0.34,0.37,0.44]},
   {"base":0.45,"amp":1.55,"cycles":44,"octaves":3,"peaks":36,"peakAmp":0.95,"seed":42,"win":[52,72,2.8],"floor":-0.3,"dist":32000,"haze":0.14,"forestH":0,"rock":[0.56,0.54,0.48]},
   {"base":0.22,"amp":0.65,"cycles":36,"octaves":2,"seed":43,"win":[225,85,2.4],"floor":-0.28,"dist":38000,"haze":0.16,"forestH":0,"rock":[0.66,0.61,0.50]}
  ],
  "landmarks":[
   {"kind":"plume","from":[118,3.2],"via":[110,6.8],"to":[94,10.5],"width":[0.7,4.4],"lit":[0.86,0.85,0.83],"belly":[0.42,0.40,0.38],"alpha":0.36,"haze":0.28,"drift":0.02}
  ]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
