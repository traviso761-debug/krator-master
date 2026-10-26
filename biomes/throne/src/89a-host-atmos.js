// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this page. Station 1 and the stations 2, 6 and 11 (station.json "atmosHost") share this fragment; the other stations bind in their
// own 89-host-atmos.js, with weather. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value.
// The hour is the page's sun, fixed: 13 by day, 0 in the night mode (the N key).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:9001,viewH:()=>innerHeight});
