// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at this station's place on the scale model (5.1 px 1096, 526: the old canvas's 824, 196, the frame the
// kit's other stations give), on the host clock, with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the
// hemisphere, the fills, the fog and the exposure from the colour script. Station 7's air: the rim's (0.99 atm, the camera's) with a wet
// haze (the trench's 1.86 atm and its golden haze are the height fog's, 89a: thick at the floor, thinning up the 4.8 km of wall).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:824,py:196},
 preset:{"air":{"pressure":0.99,"humidity":0.8},"clouds":{"cover":0.35},"fogDensity":0.00012,"ridges":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
