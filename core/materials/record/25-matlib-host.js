/* ============================== MATERIAL LIBRARY HOST (core/materials/record) ==============================
   [web]: the browser half of the material records. Sets KMAT.mode from the URL (?mat=proc shows the procedural
   look the build had before the library), and turns a pack entry's data URLs into three.js textures. Moves into
   core/host/ with Phase 1 of GODOT-PLAN.md.

     KMAT.textures(entry, {aniso})   {map, normalMap, roughnessMap} as THREE textures (repeat-wrapped; the colour
                                     map sRGB, the others linear). Each loads asynchronously: window._texPending
                                     counts the images still decoding, so a verifier waits for 0.
*/
(function(){
  'use strict';
  if(typeof KMAT === 'undefined') throw new Error('25-matlib-host: load 23-mat-record.js first');
  var q = (typeof location !== 'undefined') ? (location.search + location.hash) : '';
  KMAT.mode = /[?&#]mat=proc\b/.test(q) ? 'proc' : 'lib';
  if(typeof window !== 'undefined') window._texPending = 0;
  var cache = {};
  function tex(url, srgb, aniso){
    var key = url.length + ':' + url.slice(-48) + (srgb ? 's' : 'l');
    if(cache[key]) return cache[key];
    var t = new THREE.Texture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso || 1;
    t.encoding = srgb ? THREE.sRGBEncoding : THREE.LinearEncoding;
    var img = new Image(); window._texPending++;
    img.onload = function(){ t.image = img; t.needsUpdate = true; window._texPending--; };
    img.onerror = function(){ window._texPending--; (typeof ERR === 'function' ? ERR : console.error)('KMAT: a packed texture failed to decode'); };
    img.src = url;
    return (cache[key] = t);
  }
  /* Godot's `specular` in three.js r128: scale the direct specular term (0.5 leaves it as it is). A shader hook:
     call it from the material's onBeforeCompile. */
  KMAT.specularHook = function(sh, specular){
    var k = (specular == null ? 0.5 : specular) / 0.5;
    if(Math.abs(k - 1) < 1e-6) return;
    sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>',
      '#include <lights_fragment_end>\n  reflectedLight.directSpecular *= ' + k.toFixed(3) + ';');
  };
  KMAT.textures = function(entry, opt){
    var a = (opt && opt.aniso) || 1;
    return { map: entry.map ? tex(entry.map, true, a) : null,
             normalMap: entry.normalMap ? tex(entry.normalMap, false, a) : null,
             roughnessMap: entry.roughnessMap ? tex(entry.roughnessMap, false, a) : null };
  };
})();
