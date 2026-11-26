// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the NW bay, px 458, 452), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// The bay's air is thick (1.9 atm) and humid, as swbay's (the standard blue sky with cumulus kept: the owner, 2026-10-26); its fog
// is the old page's (.00016 at 1.9 atm). No painted ridges: the far country is real terrain and the bay opens to the sea.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,ticks:typeof TICKS!=='undefined'?TICKS:undefined,ground:typeof terrainH!=='undefined'?terrainH:undefined,
 site:{px:458,py:452},preset:{air:{pressure:1.9,humidity:.8},clouds:{cover:.45},fogDensity:.000135}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still builds from them (the water's skylight scene) */
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js; the final rebuild, 2026-10-27, swbay's numbers):
// the bay's thick air is the page's fog at the ground under the eye, thinning above it (the stacks' tops and the far slopes stand
// out of the haze); at dawn a mist pools over the bay, the lagoons and the lowland jungle (below 20 m). ?hfog=0 for the plain fog.
// THE SEA FOG (core/atmos ATMOS.fogBelt, BACKPORT.md nwbay's row): a low bank off the open water lying on the shore and the
// stacks' feet between 0 and 60 m, thicker on faces turned to the sea (the bay opens to the SE, the wind off it), thinning where
// the ground rises through it; the rain and the weather's fog thicken it. ?seafog=0 without it.
{const q=new URLSearchParams(location.search);
 if(q.get('hfog')!=='0'){
  ATMOS.heightFog({falloff:1/700,sun:.4,sky:.3,mist:{density:.0016,y:20,depth:26,noise:.65}});
  if(q.get('seafog')!=='0'&&ATMOS.fogBelt)NWBAY.SEAFOG=ATMOS.fogBelt({y0:0,y1:60,windward:[.71,.71],density:.0015,depth:40,lee:.35,rise:.5,
   centre:CENTER,radius:3600,res:128,steps:6});
  ATMOS.heightFogScene(scene);}}
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain and no wet ground under the canopy
ATMOS.rainCover({renderer});
