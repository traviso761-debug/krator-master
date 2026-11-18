// ================================================================= HOST — Krator's sky at the Ordeal ramp (the shared sky, core/atmos, SKY-PLAN.md section 9)
// Map 5.1 px 782,1194 (old canvas px 510,864; PLAN-STATIONS.md): 4,426 m, ET / Dsc, 0.92 atm thin cold air. Directly south-east (az ~135 deg, ~28 km)
// looms Godthrone's colossal 9.5 km dark titanium-basalt flank (~10.5 deg above the horizon) and its high plume, flanked by the Inner Wall's high
// dark shoulders to the east and south-south-west.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:510,py:864},
 preset:{"air":{"pressure":0.92,"humidity":0.28},"clouds":{"cover":0.24,"cumulus":0.28,"cirrus":0.58},"fogDensity":0.00015,
  "ridges":[
   {"base":7.2,"amp":2.8,"cycles":18,"octaves":3,"peaks":26,"peakAmp":1.9,"seed":51,"win":[135,42,2.1],"floor":-0.3,"dist":28000,"haze":0.085,"forestH":0,"rock":[0.19,0.21,0.26]},
   {"base":1.8,"amp":2.1,"cycles":34,"octaves":3,"peaks":32,"peakAmp":1.2,"seed":52,"win":[[82,58,2.4],[188,58,2.4]],"floor":-0.3,"dist":34000,"haze":0.13,"forestH":0,"rock":[0.34,0.36,0.42]},
   {"base":0.15,"amp":0.7,"cycles":38,"octaves":2,"seed":53,"win":[315,95,2.2],"floor":-0.28,"dist":45000,"haze":0.17,"forestH":0,"rock":[0.56,0.53,0.46]}
  ],
  "landmarks":[
   {"kind":"plume","from":[135,10.2],"via":[124,14.2],"to":[104,18.0],"width":[1.1,6.2],"lit":[0.86,0.85,0.83],"belly":[0.38,0.36,0.35],"alpha":0.44,"haze":0.22,"drift":0.02}
  ]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
