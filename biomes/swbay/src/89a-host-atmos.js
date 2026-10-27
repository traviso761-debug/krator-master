// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the host clock's (the shared sky reads it too: 89s-host-sky.js, 2026-10-26); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:8103,viewH:()=>innerHeight});
// ================================================================= the final rebuild's air and wet (2026-10-27; nhighlands' and nwbay's lines)
// R8: the foliage sways in core/atmos's wind and its travelling gusts (BIO.bindAtmosWind); R7: leaf and grass cut-outs by
// alpha-to-coverage when the canvas has MSAA (BIO.setA2C; the alpha test stays without it). Both before the first frame.
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows): in the rain the ground darkens and glosses and the
// local dips hold puddles ringed by the drops; the mask is baked from terrainH over the map (512 cells of 9.8 m; a 25 m blur finds
// the hollows, not the bay), none under water nor in the river's channel. The weather's own wetGround (bindWeather, 89s) then only
// fills in its options (it is idempotent). ?wet=0 for the old ground
const SWBAY_BOX=[CENTER[0]-TERR.R,CENTER[1]-TERR.R,CENTER[0]+TERR.R,CENTER[1]+TERR.R];
if(new URLSearchParams(location.search).get('wet')!=='0'){
 const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:SWBAY_BOX,cell:(SWBAY_BOX[2]-SWBAY_BOX[0])/512,blur:25,depth:.6,
  mask:(x,z)=>terrainH(x,z)<.8||riverD(x,z)<40?0:1});
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WET_HOLLOWS});}
