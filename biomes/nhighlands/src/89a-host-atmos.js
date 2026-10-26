// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13 by day, 0 in the night mode); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:8102,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field: BIO.bindAtmosWind); R7: leaf and grass
// cut-outs by alpha-to-coverage when the canvas has MSAA (BIO.setA2C; the alpha test stays without it). Both before the first frame.
BIO.bindAtmosWind();BIO.setA2C(renderer);
