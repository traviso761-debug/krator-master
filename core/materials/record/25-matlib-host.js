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
    /* t._onImage: clones of this texture (BIO.libSwap's per-cell cards) take the image when it lands (r128 textures have no userData) */
    img.onload = function(){ t.image = img; t.needsUpdate = true; (t._onImage || []).forEach(function(f){ f(img); }); window._texPending--; };
    img.onerror = function(){ window._texPending--; (typeof ERR === 'function' ? ERR : console.error)('KMAT: a packed texture failed to decode'); };
    img.src = url;
    return (cache[key] = t);
  }
  /* THE PROGRAM KEY (K1, GRAPHICS-TERRAIN-PROPOSAL.md 12d; TODO.md "Fewer shader programs"). The hooks' numbers are
     uniforms set per material (sh.uniforms is the material's own), so their GLSL text varies only with WHICH hooks are on;
     KMAT.libKey(L) keys on that alone and every library material of one kind shares one program. The uniforms hold the
     values the text used to print (toFixed(3)), so a page draws the same pixels. KMAT.libId(L) is the old value-bearing
     key, kept for ids (26-matlib-bind.js). */
  var r3 = function(x){ return +(+x).toFixed(3); };
  var specK = function(specular){ return (specular == null ? 0.5 : specular) / 0.5; };
  var specOn = function(specular){ return Math.abs(specK(specular) - 1) >= 1e-6; };
  var breakOn = function(b){ return !!(KMAT.breakupOn && b && (b.mix > 0 || b.macro > 0)); };
  /* Godot's `specular` in three.js r128: scale the direct specular term (0.5 leaves it as it is). A shader hook:
     call it from the material's onBeforeCompile. uKmSpec holds the scale. */
  KMAT.specularHook = function(sh, specular){
    if(!specOn(specular)) return;
    sh.uniforms = sh.uniforms || {};
    sh.uniforms.uKmSpec = { value: r3(specK(specular)) };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uKmSpec;')
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n  reflectedLight.directSpecular *= uKmSpec;');
  };
  /* 'breakup' (core/materials/PLAN.md "Repetition break-up"): a world-space value noise blends each map with a copy
     shifted by a fixed offset (the same scale and direction, so planks stay planks), and a slower noise varies the
     brightness. Colour, normal and roughness use the same mask, so they stay in register. b = {mix, macro, cell};
     uKmBreak = (mix, macro, cell). */
  KMAT.breakupHook = function(sh, b){
    if(!breakOn(b)) return;
    sh.uniforms = sh.uniforms || {};
    sh.uniforms.uKmBreak = { value: [r3(b.mix || 0), r3(b.macro || 0), r3(b.cell || 8)] };
    var noise = [
      'uniform vec3 uKmBreak;',
      'varying vec3 vKmWP;',
      /* sine-free (Hoskins' hash13): the same on every GPU, where fract(sin(large)) is not (godot/shaders/lib/breakup.gdshaderinc km_h) */
      'float kmH(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }',
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
        'float kmM = smoothstep(0.3, 0.7, kmN(vKmWP / uKmBreak.z)) * uKmBreak.x;',
        '#ifdef USE_MAP',
        '  vec4 texelColor = mix(texture2D(map, vUv), texture2D(map, vUv + KM_OFF), kmM);',
        '  texelColor = mapTexelToLinear(texelColor);',
        '  diffuseColor *= texelColor;',
        '#endif',
        'diffuseColor.rgb *= 1.0 + uKmBreak.y * (kmN(vKmWP / (uKmBreak.z * 2.7) + 19.1) * 2.0 - 1.0);'].join('\n'))
      .replace('#include <roughnessmap_fragment>', THREE.ShaderChunk.roughnessmap_fragment
        .split('texture2D( roughnessMap, vUv )').join('mix(texture2D( roughnessMap, vUv ), texture2D( roughnessMap, vUv + KM_OFF ), kmM)'))
      .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps
        .split('texture2D( normalMap, vUv ).xyz')   /* both branches (object and tangent space) */
        .join('(normalize(mix(texture2D( normalMap, vUv ).xyz * 2.0 - 1.0, texture2D( normalMap, vUv + KM_OFF ).xyz * 2.0 - 1.0, kmM)) * 0.5 + 0.5)'));
  };
  /* M2 SPECULAR ANTI-ALIASING (GRAPHICS-TERRAIN-PROPOSAL.md M2): pack.py's "specAA" writes the normal map's variance per mip
     level (L.mipVariance, from the float normals before quantising); the shader finds the mip it samples from the UV
     derivatives and adds that level's variance to the roughness, so a glossy surface does not sparkle as it recedes. The
     same table as Godot's library.gdshader m1_rough_aa. WebGL 2 only (textureSize); a WebGL 1 context keeps the roughness. */
  var aaOn = function(L){ return !!(L.mipVariance && L.mipVariance.length >= 8 && L.normalMap); };
  KMAT.specAAHook = function(sh, L){
    if(!aaOn(L)) return;
    var v = L.mipVariance;
    sh.uniforms.uKmVar = { value: [new THREE.Vector4(v[0], v[1], v[2], v[3]), new THREE.Vector4(v[4], v[5], v[6], v[7])] };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec4 uKmVar[2];')
      .replace('#include <normal_fragment_begin>', ['#if __VERSION__ >= 300 && defined( USE_NORMALMAP )',
        '{ vec2 kmDx = dFdx(vUv), kmDy = dFdy(vUv); float kmTs = float(textureSize(normalMap, 0).x);',
        '  float kmMip = clamp(0.5 * log2(max(max(dot(kmDx, kmDx), dot(kmDy, kmDy)) * kmTs * kmTs, 1.0)), 0.0, 7.0);',
        '  int kmI0 = int(floor(kmMip)); float kmF = kmMip - float(kmI0); int kmI1 = min(kmI0 + 1, 7);',
        '  float kmV0 = kmI0 < 4 ? uKmVar[0][kmI0] : uKmVar[1][kmI0 - 4], kmV1 = kmI1 < 4 ? uKmVar[0][kmI1] : uKmVar[1][kmI1 - 4];',
        '  roughnessFactor = sqrt(clamp(roughnessFactor * roughnessFactor + min(mix(kmV0, kmV1, kmF) * 1.5, 0.45), 0.0004, 1.0)); }',
        '#endif', '#include <normal_fragment_begin>'].join('\n'));
  };
  /* M4 CAVITY AND WEAR, two masks (pack.py "m4": L.cwMap, R concave pores and joints, G worn convex edges): the cavity darkens
     the colour into the joints, the wear lifts it and polishes it a little on the arrises. Sampled on the colour map's UVs. */
  var m4On = function(L){ return !!L.cwMap; };
  KMAT.cavityHook = function(sh, L){
    if(!m4On(L)) return;
    sh.uniforms.uKmCW = { value: tex(L.cwMap, false, 4) };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uKmCW;')
      .replace('#include <normal_fragment_begin>', ['#ifdef USE_UV',
        '{ vec2 kmCw = texture2D(uKmCW, vUv).rg;',
        '  diffuseColor.rgb *= mix(1.0, kmCw.r, 0.85) * (1.0 + 0.14 * kmCw.g);',
        '  roughnessFactor = clamp(roughnessFactor * (1.0 - 0.18 * kmCw.g), 0.04, 1.0); }',
        '#endif', '#include <normal_fragment_begin>'].join('\n'));
  };
  /* M3 PARALLAX OCCLUSION on masonry (pack.py "pom": the height in the colour map's alpha, L.pomDepth metres deep). The
     frame comes from the screen derivatives of the position and the UVs (no tangents: any planar mapping, a world-UV box's
     faces included), taken before the loop; the march is 8 linear steps and one linear refinement with explicit gradients.
     Every map is then read at the shifted UVs (kmUv in place of vUv in main). Hero surfaces only: a family names it. */
  var pomOn = function(L){ return !!(L.pomDepth > 0 && L.map); };
  KMAT.pomHook = function(sh, L){
    if(!pomOn(L)) return;
    sh.uniforms.uKmPom = { value: +L.pomDepth };
    /* the chunks that read the maps, written out so their UVs can be rewritten (a hook before this one may have already) */
    ['map_fragment', 'roughnessmap_fragment', 'metalnessmap_fragment', 'normal_fragment_maps', 'emissivemap_fragment'].forEach(function(c){
      sh.fragmentShader = sh.fragmentShader.replace('#include <' + c + '>', THREE.ShaderChunk[c]); });
    var i = sh.fragmentShader.indexOf('void main() {');
    if(i < 0) return;
    var head = sh.fragmentShader.slice(0, i), body = sh.fragmentShader.slice(i + 'void main() {'.length);
    var march = ['void main() {', 'vec2 kmUv = vUv;',
      '#if __VERSION__ >= 300 && defined( USE_MAP )',
      '{ vec3 kmP = -vViewPosition, kmQ0 = dFdx(kmP), kmQ1 = dFdy(kmP); vec2 kmS0 = dFdx(vUv), kmS1 = dFdy(vUv);',
      '  vec3 kmN = normalize(cross(kmQ0, kmQ1)); vec3 kmV = normalize(vViewPosition); if(dot(kmN, kmV) < 0.0) kmN = -kmN;',
      '  vec3 kmR1 = cross(kmQ1, kmN), kmR0 = cross(kmN, kmQ0); float kmDet = dot(kmQ0, kmR1);',
      '  if(abs(kmDet) > 1e-12){',
      '    vec3 kmGu = (kmR1 * kmS0.x + kmR0 * kmS1.x) / kmDet, kmGv = (kmR1 * kmS0.y + kmR0 * kmS1.y) / kmDet;',
      '    float kmVn = max(dot(kmV, kmN), 0.18); vec3 kmVt = kmV - kmN * dot(kmV, kmN);',
      '    vec2 kmD = -vec2(dot(kmVt, kmGu), dot(kmVt, kmGv)) * uKmPom / kmVn;',
      '    vec2 kmCur = vUv, kmPrev = vUv; float kmL = 0.0, kmPL = 0.0, kmH = 1.0 - textureGrad(map, vUv, kmS0, kmS1).a, kmPH = kmH;',
      '    for(int kmK = 0; kmK < 8; kmK++){ if(kmL >= kmH) break; kmPrev = kmCur; kmPH = kmH; kmPL = kmL;',
      '      kmL += 0.125; kmCur = vUv + kmD * kmL; kmH = 1.0 - textureGrad(map, kmCur, kmS0, kmS1).a; }',
      '    float kmA = kmH - kmL, kmB = kmPH - kmPL, kmW = abs(kmA - kmB) > 1e-5 ? clamp(kmA / (kmA - kmB), 0.0, 1.0) : 0.0;',
      '    kmUv = mix(kmCur, kmPrev, kmW); } }',
      '#endif'].join('\n');
    sh.fragmentShader = head + '\nuniform float uKmPom;\n' + march + body.replace(/\bvUv\b/g, 'kmUv');
  };
  /* M4 WET MARGINS: a quay wall, a breakwater or a hull is dark and glossy where its water laps it. The water is the LOCAL
     body's (waterAt(x, z): WORLD.water in core/world; -1e9 where there is none), sampled per vertex, never one global level.
     KMAT.wetTag(meshes, waterAt, {band, below}) writes aWet per vertex (1 from below the surface up to it, fading to 0 at
     band metres over it); KMAT.wetHook(sh) darkens the colour to 0.55 and lowers the roughness to 0.35 of itself by it.
     A page tags the meshes that stand in water and hooks their materials; a mesh without aWet reads 0 (dry). */
  KMAT.wetTag = function(meshes, waterAt, o){
    o = o || {};
    var band = o.band == null ? 0.6 : o.band, v = new THREE.Vector3(), out = { vertices:0, wet:0 };
    meshes.forEach(function(m){
      if(!m || !m.isMesh || m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position) return;
      m.updateMatrixWorld(true);
      var P = m.geometry.attributes.position, W = new Float32Array(P.count);
      for(var i = 0; i < P.count; i++){
        v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld);
        var lv = waterAt(v.x, v.z); if(!(lv > -1e8)) continue;
        var h = v.y - lv; W[i] = h <= 0 ? 1 : h >= band ? 0 : 1 - h / band;
        if(W[i] > 0) out.wet++;
      }
      m.geometry.setAttribute('aWet', new THREE.BufferAttribute(W, 1)); out.vertices += P.count;
    });
    return out;
  };
  KMAT.wetHook = function(sh){
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aWet;\nvarying float vKmWet;')
      .replace('#include <project_vertex>', 'vKmWet = aWet;\n#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vKmWet;')
      .replace('#include <normal_fragment_begin>', 'diffuseColor.rgb *= mix(1.0, 0.55, vKmWet);\nroughnessFactor *= mix(1.0, 0.35, vKmWet);\n#include <normal_fragment_begin>');
  };
  /* every hook a library material takes, in order (parallax last: it rewrites the UVs every map before it reads); and the
     matching part of its program cache key (the hooks' kind, never a value) */
  KMAT.libHooks = function(sh, L){ KMAT.specularHook(sh, L.specular); KMAT.breakupHook(sh, L.breakup); KMAT.specAAHook(sh, L); KMAT.cavityHook(sh, L); KMAT.pomHook(sh, L); };
  KMAT.libKey = function(L){ return '|lib' + (specOn(L.specular) ? 's' : '') + (breakOn(L.breakup) ? '|bu' : '') + (aaOn(L) ? '|aa' : '') + (m4On(L) ? '|m4' : '') + (pomOn(L) ? '|pom' : ''); };
  KMAT.libId = function(L){ var b = L.breakup; return '|lib' + (L.specular == null ? '' : L.specular) + (b ? '|bu' + [b.mix, b.macro, b.cell].join('_') : ''); };
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
