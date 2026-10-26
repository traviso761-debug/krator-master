// ================================================================= ATMOS - the host binding every biome and station shares
// ATMOS.bindHost(o) is the one-time ATMOS.init for a page that is not a street (a biome kit, a Throne station): it takes the
// handles the page already has and turns them into the five things init needs, so each host fragment is one call and a
// biome streamed in the open world binds the same way (core/atmos/README.md, "Taking it into a build"). With init alone
// nothing is drawn: ATMOS.root is an empty group and the module's clock follows the host's frame ticks. What a page then
// takes is its own choice: ATMOS.waveUniforms / WATER.draw (the wave field), ATMOS.skylight (the sky's light), weather.
//   o.THREE, o.scene, o.camera, o.renderer          the page's own
//   o.ticks      the page's per-frame hook array (TICKS: fn(dt) in seconds), or o.onFrame(fn) instead
//   o.ground     (x,z) => ground height (default: terrainH when the page has one is passed by the host)
//   o.hour       () => 0..24, the module's clock (default 13: the page's sun is a fixed midday one); a page with a night
//                toggle passes () => night ? 0 : 13
//   o.seed       the module's own PRNG seed (default 1); o.err the message sink (default console.warn)
//   o.viewH      () => the view's height in CSS pixels (default 720); o.pixelRatio () => the renderer's pixel ratio
(function(){const A=ATMOS;
 A.bindHost=function(o){
  const onFrame=o.onFrame||(fn=>o.ticks.push(dt=>fn(dt)));
  A.init({THREE:o.THREE,scene:o.scene,camera:o.camera,hour:o.hour||(()=>13),onFrame,ground:o.ground||(()=>0),seed:o.seed==null?1:o.seed,
   err:o.err||(m=>console.warn(m)),viewH:o.viewH||(()=>720),pixelRatio:o.pixelRatio||(()=>o.renderer?o.renderer.getPixelRatio():1)});
  return A;};
})();
