// ================================================================= HOST — the atmosphere (core/atmos), bound: the clock, the weather, the snow
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so core/water and the open world's one
// clock can take this biome. The hour is the host clock's (the shared sky reads it too: 89s-host-sky.js).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:(SITE.hour==null?10:SITE.hour),seed:6147,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field: BIO.bindAtmosWind), before the first frame; R7, the
// cut-outs by alpha-to-coverage, is set after the bake (89z)
BIO.bindAtmosWind();
// SNOW THAT LIES (core/atmos/fx/89-atmos-fx-snowcover.js): the cauldron's rim takes snow most of the year and the hollow in winter (a wet
// country: 2.5 m, snow from autumn to spring on the walls). The season's base cover, before any weather: in autumn the first snow on the
// rim's slopes (SITE.snow), in winter down to the water, in spring the winter's last on the walls, in summer none under the far crest.
// THE SPRINGS' GROUND STAYS BARE: KTHERM's snow mask (core/terrain 47, its 0 °C ground line; ATMOS.snowBare) over the apron, so the
// warm ground round the springs, the stair and the mats is never under snow. Snow that falls from the weather builds on the rest and
// melts by day. window._snowDepth(d) adds fresh snow (a winter view).
const SNOW={autumn:{base:.55,line:SITE.snow&&SITE.snow.autumn},winter:{base:.95,line:SITE.snow&&SITE.snow.winter},spring:{base:.42,line:SITE.snow&&SITE.snow.spring},summer:{base:.6,line:SITE.snow&&SITE.snow.summer}}[SEASON];
ATMOS.snowCover({base:SNOW.base,line:SNOW.line||[900,1400],frozen:SEASON==='winter'});   /* winter's air never thaws the snow by day */
const SNOW_BARE=(function(){if(!THERM||!ATMOS.snowBare||!SITE_SPRINGS.length)return null;const xs=SITE_SPRINGS.map(S=>S.x).concat(SITE_STAIR?[SITE_STAIR.a[0],SITE_STAIR.b[0]]:[]),
  zs=SITE_SPRINGS.map(S=>S.z).concat(SITE_STAIR?[SITE_STAIR.a[1],SITE_STAIR.b[1]]:[]),p=90,box=[Math.min(...xs)-p,Math.min(...zs)-p,Math.max(...xs)+p,Math.max(...zs)+p];
 try{const M=THERM.snowMask({box,cell:2,t0:2,soft:3});ATMOS.snowBare(M);return {box,n:M.data.length};}catch(e){reportErr('snow bare: '+e.stack);return null;}})();
window._snowDepth=d=>{ATMOS.snow.depth=d;};
// THE WEATHER, the clouds' shade, height fog, the rain cover and the snow on the scene are bound in 89z-host-build.js, after the bake
