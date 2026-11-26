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
 // THE GUST FIELD for any shader (R8: core/biome's leaf and grass sway, core/water's chop): stable names a shader can read
 // once the page is bound, the same travelling gust fronts the smoke, the rain and the cloth ride (89-atmos-0-core.js).
 //   ATMOS.windUniforms(uniforms)  adds atmWindV (the wind now, m/s-ish: A.U.wind, veering, times the weather's windScale),
 //                                 atmGustAmp (A.U.gustAmp: the weather raises it) and atmTime (the module clock, s): the
 //                                 shared uniform objects, so one update a frame moves every reader
 //   ATMOS.windGLSL()              their declarations and atmGust(t, xz, w), atmWind(t, xz, w, amp) (guarded: include it once
 //                                 or many times), plus atmGustHere(xz) (-1..1) and atmWindHere(xz) (the wind vector at xz now)
 // Godot: global shader parameters atm_wind, atm_gust_amp, atm_time and the same functions (GODOT.md, "The wind").
 A.windUniforms=u=>{u.atmWindV=A.U.wind;u.atmGustAmp=A.U.gustAmp;u.atmTime=A.U.time;return u;};
 A.windGLSL=()=>['#ifndef ATM_WIND_FIELD','#define ATM_WIND_FIELD','uniform vec2 atmWindV;uniform float atmGustAmp;uniform float atmTime;',A.GLSL_WIND,
  'float atmGustHere(vec2 xz){return atmGust(atmTime,xz,atmWindV);}','vec2 atmWindHere(vec2 xz){return atmWind(atmTime,xz,atmWindV,atmGustAmp);}','#endif'].join('\n');
})();
