/* ============================== 11b. DETAIL MAPS: the library on meshes without UVs ==============================
   The catalog furniture, the flyers, the draught millipedes and the tree pods are vertex-coloured meshes with no
   texture coordinates. A library set reaches them as a DETAIL map that the shader samples by triplanar projection
   of the mesh's own position (three planar maps blended by the normal), so it needs no UVs and does not shear.
   Each is a packed family (materials.json, tools/textures/pack.py) whose brightness is normalised to `mean`; the
   shader divides that mean back out, so the vertex colours keep their brightness and the set adds its grain,
   weave, fur or chitin. The flyers use an ATLAS: four families in one 2x2 texture and a quadrant per vertex
   (attribute aDetS: 0..3, -1 = none), so a species stays one draw call. Geometry positions are taken BEFORE any
   skinning, so the pattern rides on the animal. ?mat=proc: nothing is attached (the old look).
     GDET.family(fam)           -> { map, gain, tile } or null
     GDET.hook(fam, mat)        -> a shader hook for mat's onBeforeCompile (it also puts the map on mat), or null
     GDET.atlas(fams)           -> { map, gain[4], tile[4] } or null: a canvas the packed maps are drawn into
     GDET.atlasHook(atlas, mat) -> the hook for a material whose geometry carries aDetS
   Godot: the same projection is a few lines of a .gdshader (triplanar is built into StandardMaterial3D). */
var GDET = (function(){
  var ON = (typeof KMAT !== 'undefined' && KMAT.mode === 'lib'), cache = {}, stats = { families:0, atlases:0, attached:[] };
  function gainOf(L){ var m = (L && L.mean != null) ? L.mean : 0.5; return 1 / Math.max(0.05, Math.pow(m, 2.2)); }
  function family(fam){
    if(!ON) return null;
    if(cache[fam] !== undefined) return cache[fam];
    var L = KMAT.packed('girder', fam);
    if(!L || !L.map) return (cache[fam] = null);
    var t = KMAT.textures(L, { aniso: FAST ? 1 : 4 }).map;
    stats.families++;
    return (cache[fam] = { map:t, gain:gainOf(L), tile:(L.scale && L.scale[0]) || 1, lib:L.lib });
  }
  var DECL = '\nvarying vec3 vDetP;\nvarying vec3 vDetN;\n';
  function vertex(sh, extra){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>' + DECL + (extra ? extra.decl : ''))
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vDetP = position;\n  vDetN = normal;\n' + (extra ? extra.body : ''));
  }
  /* one triplanar sample of `map` at p, through `fn` (a quadrant remap for the atlas) */
  var GRAD = [
    '#if __VERSION__ >= 300',
    '#define DET_TEX(c, w) textureGrad(map, c, dFdx(w), dFdy(w))',
    '#else',
    '#define DET_TEX(c, w) texture2D(map, c)',
    '#endif'].join('\n');
  function hook(fam, mat){
    var F = family(fam);
    if(!F) return null;
    mat.map = F.map; mat.needsUpdate = true;
    stats.attached.push(fam);
    return function(sh){
      sh.uniforms.uDetTile = { value: 1 / F.tile };
      sh.uniforms.uDetGain = { value: F.gain };
      vertex(sh);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>' + DECL + 'uniform float uDetTile;\nuniform float uDetGain;\n')
        .replace('#include <map_fragment>', [
          '#ifdef USE_MAP',
          '  vec3 dW = pow(abs(normalize(vDetN)) + 1e-4, vec3(4.0)); dW /= (dW.x + dW.y + dW.z);',
          '  vec3 dP = vDetP * uDetTile;',
          '  vec4 texelColor = texture2D(map, dP.zy) * dW.x + texture2D(map, dP.xz) * dW.y + texture2D(map, dP.xy) * dW.z;',
          '  texelColor = mapTexelToLinear(texelColor);',
          '  diffuseColor.rgb *= texelColor.rgb * uDetGain;',
          '#endif'].join('\n'));
    };
  }
  /* four families into one 1024 canvas, quadrant i at column i%2, row floor(i/2) from the top */
  function atlas(fams){
    if(!ON) return null;
    var Ls = fams.map(function(f){ return f ? KMAT.packed('girder', f) : null; });
    if(!Ls.some(function(L){ return L && L.map; })) return null;
    var S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S;
    var g = cv.getContext('2d'); g.fillStyle = 'rgb(188,188,188)'; g.fillRect(0, 0, S, S);
    var t = new THREE.CanvasTexture(cv);
    t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = FAST ? 1 : 4;
    var A = { map:t, gain:[1,1,1,1], tile:[1,1,1,1], fams:fams.slice() };
    Ls.forEach(function(L, i){
      if(!L || !L.map) return;
      A.gain[i] = gainOf(L); A.tile[i] = (L.scale && L.scale[0]) || 1;
      KMAT.image(L, function(img){ g.drawImage(img, (i % 2) * S/2, Math.floor(i / 2) * S/2, S/2, S/2); t.needsUpdate = true; });
    });
    stats.atlases++;
    return A;
  }
  function atlasHook(A, mat){
    if(!A) return null;
    mat.map = A.map; mat.needsUpdate = true;
    return function(sh){
      sh.uniforms.uDetTileA = { value: new THREE.Vector4(1/A.tile[0], 1/A.tile[1], 1/A.tile[2], 1/A.tile[3]) };
      sh.uniforms.uDetGainA = { value: new THREE.Vector4(A.gain[0], A.gain[1], A.gain[2], A.gain[3]) };
      vertex(sh, { decl:'attribute float aDetS;\nvarying float vDetS;\n', body:'  vDetS = aDetS;\n' });
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>' + DECL + 'varying float vDetS;\nuniform vec4 uDetTileA;\nuniform vec4 uDetGainA;\n')
        .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\n' + GRAD + '\n' +      /* after `map` is declared */
          'vec4 detQ(vec2 base, vec2 w){ return DET_TEX(base + 0.012 + fract(w) * 0.476, w * 0.476); }\n')
        .replace('#include <map_fragment>', [
          '#ifdef USE_MAP',
          '  if(vDetS > -0.5){',
          '    float s = floor(vDetS + 0.5);',
          '    float tl = s < 0.5 ? uDetTileA.x : (s < 1.5 ? uDetTileA.y : (s < 2.5 ? uDetTileA.z : uDetTileA.w));',
          '    float gn = s < 0.5 ? uDetGainA.x : (s < 1.5 ? uDetGainA.y : (s < 2.5 ? uDetGainA.z : uDetGainA.w));',
          '    vec2 base = vec2(mod(s, 2.0), 1.0 - floor(s / 2.0)) * 0.5;',
          '    vec3 dW = pow(abs(normalize(vDetN)) + 1e-4, vec3(4.0)); dW /= (dW.x + dW.y + dW.z);',
          '    vec3 dP = vDetP * tl;',
          '    vec4 texelColor = detQ(base, dP.zy) * dW.x + detQ(base, dP.xz) * dW.y + detQ(base, dP.xy) * dW.z;',
          '    texelColor = mapTexelToLinear(texelColor);',
          '    diffuseColor.rgb *= texelColor.rgb * gn;',
          '  }',
          '#endif'].join('\n'));
    };
  }
  return { family:family, hook:hook, atlas:atlas, atlasHook:atlasHook, stats:stats, on:ON };
})();
window._detail = GDET.stats;
