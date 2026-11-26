// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8101,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the north-west bay, a rainy coast. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// ================================================================= the final rebuild's air and wet (2026-10-27; nhighlands' and swbay's lines)
// R8: the foliage sways in core/atmos's wind and its travelling gusts (BIO.bindAtmosWind); R7: leaf and grass cut-outs by
// alpha-to-coverage when the canvas has MSAA (BIO.setA2C; the alpha test stays without it). Both before the first frame.
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows): in the rain the ground darkens and glosses and the
// local dips hold puddles ringed by the drops; the mask is baked from terrainH over the map (512 cells of 9.8 m; a 25 m blur finds
// the hollows, not the bay), none under water, in the river's channel, on the karst, in a sinkhole or among the tsingy's blades.
// The binding's own wetGround (bindWeather, above) then only fills in its options (it is idempotent). ?wet=0 for the old ground
const NWBAY_BOX=[CENTER[0]-TERR.R,CENTER[1]-TERR.R,CENTER[0]+TERR.R,CENTER[1]+TERR.R];
if(new URLSearchParams(location.search).get('wet')!=='0'){
 const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:NWBAY_BOX,cell:(NWBAY_BOX[2]-NWBAY_BOX[0])/512,blur:25,depth:.6,
  mask:(x,z)=>{if(groundH(x,z)<.8||riverD(x,z)<40||karstAt(x,z)>.03||tsingyK(x,z)>.05)return 0;const Q=sinkAt(x,z);return Q&&Q.d<8?0:1;}});
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WET_HOLLOWS});}
