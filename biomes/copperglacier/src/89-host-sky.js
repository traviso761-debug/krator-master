// ================================================================= HOST — Krator's sky over Copper Glacier (every station, at its own site)
// ATMOS.skyBiome draws the standard sky (core/atmos/SKY-PLAN.md section 9) at the station's place on the scale model (the old canvas px: 5.1 px less
// 272, 330; SITE.old), on the host clock, with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fill,
// the fog and the exposure from the colour script. The site's air (SITE.sky: pressure, humidity, cloud). Local detail: the Crook's snow ranges round the
// horizon (two ridge bands: near walls and the far ranges), no plume (no volcano is in sight of the Crook).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:SITE.old.px,py:SITE.old.py},
 preset:{air:SITE.sky.air,clouds:SITE.sky.clouds,fogDensity:scene.fog.density,
  ridges:[{base:3.4,amp:3.2,cycles:48,octaves:3,seed:71,peaks:40,peakAmp:.9,win:null,floor:1.0,dist:26000,haze:.16,snowH:900,forestH:0,rock:[.62,.66,.74],snow:[.93,.95,.97]},
   {base:2.2,amp:2.2,cycles:48,octaves:3,seed:72,peaks:40,peakAmp:.6,win:null,floor:.1,dist:9000,haze:.26,snowH:300,forestH:0,rock:[.46,.52,.6],snow:[.93,.94,.96]}],
  landmarks:[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
