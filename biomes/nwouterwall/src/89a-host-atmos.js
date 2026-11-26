// ================================================================= HOST — the atmosphere (core/atmos), bound: the clock, the weather, the snow
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so core/water and the open world's one
// clock can take this biome. The hour is the host clock's (the shared sky reads it too: 89s-host-sky.js).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10,seed:4747,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field: BIO.bindAtmosWind), before the first frame; R7, the
// cut-outs by alpha-to-coverage, is set after the bake (89z)
BIO.bindAtmosWind();
// SNOW THAT LIES (core/atmos/fx/89-atmos-fx-snowcover.js): a cold, dry country. The season's base cover, before any weather: in
// autumn the first snow lies above a line on the high ground (the mid ground's ridges and the plateau's tops, SITE.snow), in spring
// the winter's last patches lie everywhere the slope lets them (the shaded faces hold it longest: the module's drifts and normals),
// in summer none below the far ranges. Snow that falls from the weather builds on it and melts by day (o.frozen only in the Yeti
// Valley's spring). window._snowDepth(d) adds fresh snow (a winter view).
const SNOW={autumn:{base:.55,line:SITE.snow&&SITE.snow.autumn},winter:{base:.95,line:SITE.snow&&SITE.snow.winter},spring:{base:.42,line:SITE.snow&&SITE.snow.spring},summer:{base:.6,line:SITE.snow&&SITE.snow.summer}}[SEASON];
ATMOS.snowCover({base:SNOW.base,line:SNOW.line||[900,1400],frozen:SEASON==='winter'||!!(SITE.snow&&SITE.snow.frozen&&SEASON==='spring')});   /* winter's air never thaws the snow by day */
window._snowDepth=d=>{ATMOS.snow.depth=d;};
// THE WEATHER, the clouds' shade, height fog, the rain cover and the snow on the scene are bound in 89z-host-build.js, after the bake
