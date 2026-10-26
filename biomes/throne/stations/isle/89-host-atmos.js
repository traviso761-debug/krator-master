// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the geyser isle
// core/atmos (its README.md). The isle takes only the open-water wave field (89-atmos-a-waves.js) for the sea: the
// module clock wrapped at a whole number of cycles, so the swell never steps. The frame loop (90) runs TICKS, which run
// the module's hooks; the hour is the light mode's.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:14,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90041,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
// the sea's wave field is core/water's (89w-host-water.js: WATER.open reads it from ATMOS); the page's own sea shader and its uniforms are gone (2026-10-26)
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: an inner isle of the Throne, its warm lagoon, rain and
// storms. The isle's mesh (GROUND_MATS[0]) takes the rain through its swash wetting (89w-host-water.js), so only the basin's patch is
// passed. It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:GROUND_MATS.slice(1)});
