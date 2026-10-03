/* ============================== MATERIAL LIBRARY HOST (core/materials/record) ==============================
   [web]: the browser half of the material records. Sets KMAT.mode from the URL (?mat=proc shows the procedural
   look the build had before the library), and turns a pack entry's data URLs into three.js textures. Moves into
   core/host/ with Phase 1 of GODOT-PLAN.md. ?breakup=0 turns the tiling break-up off, to compare.

     KMAT.textures(entry, {aniso})   {map, normalMap, roughnessMap} as THREE textures (repeat-wrapped; the colour
                                     map sRGB, the others linear). Each loads asynchronously: window._texPending
                                     counts the images still decoding, so a verifier waits for 0.
*/
(function(){
  'use strict';
  if(typeof KMAT === 'undefined') throw new Error('25-matlib-host: load 23-mat-record.js first');
  var q = (typeof location !== 'undefined') ? (location.search + location.hash) : '';
  KMAT.mode = /[?&#]mat=proc\b/.test(q) ? 'proc' : 'lib';
  KMAT.breakupOn = !/[?&#]breakup=0\b/.test(q);   /* ?breakup=0: the library maps without the tiling break-up, to compare */
  if(typeof window !== 'undefined') window._texPending = 0;
  var cache = {};
  function tex(url, srgb, aniso, flipY){
    var key = url.length + ':' + url.slice(-48) + (srgb ? 's' : 'l') + (flipY === false ? 'f' : '');
    if(cache[key]) return cache[key];
    var t = new THREE.Texture();
    if(flipY === false) t.flipY = false;
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
  /* 'breakup' (core/materials/PLAN.md "Repetition break-up"): a world-space value noise blends each map with a copy
     shifted by a fixed offset (the same scale and direction, so planks stay planks), and a slower noise varies the
     brightness. Colour, normal and roughness use the same mask, so they stay in register. b = {mix, macro, cell}. */
  KMAT.breakupHook = function(sh, b){
    if(!KMAT.breakupOn || !b || !(b.mix > 0 || b.macro > 0)) return;
    var cell = (b.cell || 8).toFixed(3), mx = (b.mix || 0).toFixed(3), mc = (b.macro || 0).toFixed(3);
    var noise = [
      'varying vec3 vKmWP;',
      'float kmH(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }',
      'float kmN(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);',
      '  return mix(mix(mix(kmH(i), kmH(i+vec3(1.,0.,0.)), f.x), mix(kmH(i+vec3(0.,1.,0.)), kmH(i+vec3(1.,1.,0.)), f.x), f.y),',
      '             mix(mix(kmH(i+vec3(0.,0.,1.)), kmH(i+vec3(1.,0.,1.)), f.x), mix(kmH(i+vec3(0.,1.,1.)), kmH(i+vec3(1.,1.,1.)), f.x), f.y), f.z); }',
      'const vec2 KM_OFF = vec2(0.371, 0.613);'].join('\n');
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vKmWP;')
      .replace('#include <project_vertex>', '#ifdef USE_INSTANCING\n  vKmWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n' +
               '#else\n  vKmWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif\n#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + noise)
      .replace('#include <map_fragment>', [
        'float kmM = smoothstep(0.3, 0.7, kmN(vKmWP / ' + cell + ')) * ' + mx + ';',
        '#ifdef USE_MAP',
        '  vec4 texelColor = mix(texture2D(map, vUv), texture2D(map, vUv + KM_OFF), kmM);',
        '  texelColor = mapTexelToLinear(texelColor);',
        '  diffuseColor *= texelColor;',
        '#endif',
        'diffuseColor.rgb *= 1.0 + ' + mc + ' * (kmN(vKmWP / (' + cell + ' * 2.7) + 19.1) * 2.0 - 1.0);'].join('\n'))
      .replace('#include <roughnessmap_fragment>', THREE.ShaderChunk.roughnessmap_fragment
        .split('texture2D( roughnessMap, vUv )').join('mix(texture2D( roughnessMap, vUv ), texture2D( roughnessMap, vUv + KM_OFF ), kmM)'))
      .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps
        .split('texture2D( normalMap, vUv ).xyz')   /* both branches (object and tangent space) */
        .join('(normalize(mix(texture2D( normalMap, vUv ).xyz * 2.0 - 1.0, texture2D( normalMap, vUv + KM_OFF ).xyz * 2.0 - 1.0, kmM)) * 0.5 + 0.5)'));
  };
  /* every hook a library material takes, in order; and the matching part of its program cache key */
  KMAT.libHooks = function(sh, L){ KMAT.specularHook(sh, L.specular); KMAT.breakupHook(sh, L.breakup); };
  KMAT.libKey = function(L){ var b = L.breakup; return '|lib' + (L.specular == null ? '' : L.specular) + (b ? '|bu' + [b.mix, b.macro, b.cell].join('_') : ''); };
  /* opt.flipY false: row 0 of the image is v = 0, as in a DataTexture or canvas texture a card replaces */
  KMAT.textures = function(entry, opt){
    var a = (opt && opt.aniso) || 1, fy = opt && opt.flipY;
    return { map: entry.map ? tex(entry.map, true, a, fy) : null,
             normalMap: entry.normalMap ? tex(entry.normalMap, false, a, fy) : null,
             roughnessMap: entry.roughnessMap ? tex(entry.roughnessMap, false, a, fy) : null };
  };
  /* a pack entry's colour map as a decoded Image, for a build that composes it into a canvas (an atlas):
     cb(img) once it has loaded; counted in window._texPending like the textures */
  KMAT.image = function(entry, cb){
    var img = new Image(); window._texPending++;
    img.onload = function(){ window._texPending--; cb(img); };
    img.onerror = function(){ window._texPending--; (typeof ERR === 'function' ? ERR : console.error)('KMAT: a packed image failed to decode'); };
    img.src = entry.map;
  };
})();
