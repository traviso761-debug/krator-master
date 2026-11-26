// ================================================================= HOST — Krator's sky (STATION 2, THE WINDING LAKES: the sky at px 1041,493; else as src/89)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the eastern abyss, px 1011, 525), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the far shelf rim, the abyssal shelf wall in the east and the canopy lines (ridges, drawn in front of
// the giant as the old overlay dome did); its humid veils and the wall's talus apron are not drawn.
// the abyss wall is ground now (83-host-far.js, 2026-10-27): its painted ridge (the second, 15 degrees high in the east) is drawn
// only when the far field is not (?wall=0)
function SKY_RIDGES(p){if(FAR)p.ridges=p.ridges.filter(r=>!(r.base>10&&r.win&&r.win[0]===90));return p;}
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:1041,py:493},
 preset:SKY_RIDGES({"air":{"pressure":1.9,"humidity":0.8},"clouds":{"cover":0.45},"fogDensity":0.0001768,"ridges":[{"base":1.1,"amp":0.6,"cycles":23,"octaves":4,"seed":61,"dist":30000,"haze":0.1415,"rock":[0.59,0.64,0.67]},{"base":15.2,"amp":1.8,"cycles":23,"octaves":4,"seed":62,"peaks":14,"peakAmp":-2.6,"win":[90,90,1.6],"floor":0.57,"dist":7000,"haze":0.3363,"rock":[0.31,0.35,0.37]},{"base":0.5,"amp":0.8,"cycles":57,"octaves":3,"seed":17,"peaks":20,"peakAmp":0.5,"dist":8000,"haze":0.3451,"rock":[0.5,0.57,0.52]},{"base":0.3,"amp":0.5,"cycles":88,"octaves":3,"seed":41,"peaks":30,"peakAmp":0.3,"dist":4000,"haze":0.4947,"rock":[0.38,0.45,0.39]}]})});
const {sky,giant}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
