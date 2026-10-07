// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the geyser isle
// core/atmos (its README.md). The isle takes only the open-water wave field (89-atmos-a-waves.js) for the sea: the
// module clock wrapped at a whole number of cycles, so the swell never steps. The frame loop (90) runs TICKS, which run
// the module's hooks; the hour is the light mode's.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:14,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90041,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
ATMOS.waveUniforms(SEAU);
