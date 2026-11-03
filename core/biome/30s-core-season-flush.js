// ================================================================= CORE — biome: the flush at the start of the rains (H7)  [G shader]
// The season's last open piece (core/biome/README.md, "The season"; biomes/hyperjungle/PLAN-LANDS.md section 11, H7): the copper
// flush. The rust miombo's new leaves come out copper-red as the rains begin, for a few weeks, then turn green, so it is a colour
// at the START of the wet, not in the dry. One page-wide uniform beside BIO.SEASON, BIO.FLUSH.value (0..1, how strong the flush
// is now: core/clock's KCLOCK.flush, core/clock/opt/21-core-clock-flush.js), read only by a leafMat whose season options carry `flush`:
//   season: {..., flush: {colour (hex: the new leaves' colour), k (1: how far at full flush), stagger (.5: spread by the
//            instance's hash, as the dry's; a stand flushes patchily)}}
//   BIO.setFlush(x)             a number or a record ({flush}); clamped to 0..1
//   BIO.bindFlush(clock, o)     every frame from a KCLOCK clock (default KHOST.host.clock), o being KCLOCK.flush's options
//                               (the season's, plus rise, hold, fade days); false without core/clock and its flush fragment
// Opt-in: load after 30-core-foliage.js. It wraps BIO.foliageHook, so a material without season.flush gets the very shader it
// got before, character for character (test-season-flush.js). The flush's colour step sits right after the dry's, before the
// alpha test, with the same instance hash (Hoskins', no sine). Godot: shaders/lib/season.gdshaderinc and foliage.gdshader read
// the global uniforms season_dry and season_flush, and krator/biome_import.gd sets a leaf's sn_* and fl_* from these options.
(function(root){
  'use strict';
  var BIO=root.BIO;if(!BIO||!BIO.foliageHook||!BIO.SEASON)throw new Error('core/biome 30s-core-season-flush.js: load 30-core-foliage.js first');
  if(BIO.FLUSH)return;
  BIO.FLUSH={value:0};
  BIO.setFlush=function(s){var d=s!=null&&typeof s==='object'?s.flush:s;BIO.FLUSH.value=Math.min(1,Math.max(0,+d||0));return BIO.FLUSH.value;};
  BIO.bindFlush=function(clock,o){var K=typeof KHOST!=='undefined'&&KHOST&&KHOST.host?KHOST.host.clock:null,C=clock||K,KC=root.KCLOCK;
    if(!KC||!KC.flush||!C){if(BIO.err)BIO.err('BIO.bindFlush: needs core/clock with opt/21-core-clock-flush.js, and a clock');return false;}
    var f=function(){BIO.setFlush(KC.flush(C.day,C.hour,o));};f();if(BIO.host)BIO.host.ticks(f);return true;};
  // a leaf's flush options: colour (hex, or null: none), k (1), stagger (.5)
  BIO._flushOpt=function(s){if(!s||typeof s!=='object'||!s.flush)return null;var f=s.flush===true?{}:s.flush;
    return {colour:f.colour==null?0xb0502a:f.colour,k:f.k==null?1:+f.k,stagger:f.stagger==null?.5:+f.stagger};};
  var hook0=BIO.foliageHook;
  BIO.foliageHook=function(o){var h=hook0(o),fl=o?BIO._flushOpt(o.season):null;if(!fl)return h;
    return function(sh){h.call(this,sh);var T=BIO.host.THREE,c=new T.Color(fl.colour).convertSRGBToLinear();
      sh.uniforms.uSeasonFlush=BIO.FLUSH;sh.uniforms.uFlK={value:new T.Vector2(fl.k,fl.stagger)};sh.uniforms.uFlC={value:new T.Vector3(c.r,c.g,c.b)};
      sh.fragmentShader=sh.fragmentShader.replace('uniform vec4 uSnK;\n','uniform vec4 uSnK;\nuniform float uSeasonFlush;\nuniform vec2 uFlK;\nuniform vec3 uFlC;\n')
        .replace('#include <alphamap_fragment>',['{ float _flH = vSnH < 0.0 ? bioSnHash(floor(vSnP / 3.0)) : vSnH;',
          '  float _flD = clamp(uSeasonFlush * (1.0 + uFlK.y * (2.0*_flH - 1.0)), 0.0, 1.0) * uFlK.x;','  vec3 _flC = uFlC * (0.88 + 0.24*_flH);',
          '#ifdef USE_COLOR','  diffuseColor.rgb *= mix(vec3(1.0), _flC / max(vColor, vec3(0.004)), _flD);','#else','  diffuseColor.rgb *= mix(vec3(1.0), _flC, _flD);','#endif',
          '}','#include <alphamap_fragment>'].join('\n'));};};
})(typeof window!=='undefined'?window:globalThis);
