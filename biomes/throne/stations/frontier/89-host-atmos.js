// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the frontier
// core/atmos (its README.md). The frontier takes the open-water wave field (89-atmos-a-waves.js) for the sea (core/water draws it: 89w-host-sea.js): the
// module clock wrapped at a whole number of cycles, so the swell never steps. The frame loop (90) runs TICKS, which run
// the module's hooks; the hour is the light mode's.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:14,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90041,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the windward jungle coast, rain most days and storms. The
// ground (MAT_GROUND) takes the rain through its swash wetting (89w-host-sea.js: WATER.wetGround with the surface), so none is passed
// here twice. It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[]});
