/* ======================================================================
   Krator Motor Vehicles: detail maps (kits/motor-vehicles/vehicles-detail.js)

   The library textures on the vehicles. A vehicle is merged vertex-coloured meshes with NO texture
   coordinates, so a library set reaches it as a DETAIL map (as on Girder's catalog furniture,
   settlements/girder/src/48-detail.js): the shader samples it by triplanar projection of the mesh's own
   position (three planar maps blended by the normal), so it needs no UVs and never shears, and the
   pattern rides on a wheel as it turns. Each family is a grey map normalised to a known mean that the
   shader divides back out, so the palettes keep their brightness and the set adds its grain: chipped
   paint, rust, corrugation, canvas, tarp, planks.

   ONE ATLAS for the whole kit: the families of materials.json in a 4-wide grid (slot order = atlas order; 2 rows,
   4 once a ninth family is delivered; at most 16),
   colour, normal and roughness each one texture. Every vertex carries its slot (attribute aDetS, -1 =
   none), so a vehicle draws exactly the meshes it drew before textures: body:matte, body:metal and the
   wheels sample the same atlas. The maps come from tex/ (tools/textures/pack.py kits/motor-vehicles),
   inlined by vehicle_bundle.py as KV_TEX (data URLs; only the families the bundled cultures name).

   Which slot a vertex gets, first match wins:
     1. a lamp family (lamp, lampTail ...)            -> none (the lens glows; no grain)
     2. the primitive's family IS a slot name          -> that slot (F.box(..., col, 'corrugated')); not 'metal',
                                                          which is the metal bucket's family: glass passes it too
     3. the culture's detail table, by palette key     -> VEHICLE_CULTURE(key, { detail: { canvas:'canvas', glass:null } })
     4. by family: metal-ish -> 'metal'; 'rubber' -> 'rubber' (no set yet: none); '' -> 'paint'; else none
   Godot: the atlas quadrant is a CUSTOM0 value and the projection StandardMaterial3D's triplanar mode.
   ====================================================================== */
const VEHICLE_DETAIL = (function () {
  const T = (typeof KV_TEX !== 'undefined' && KV_TEX) || null;
  const SLOT = {};
  if (T) T.slots.forEach(function (s, i) { if (T.fam[s]) SLOT[s] = i; });
  const METALISH = { metal: 1, gold: 1, bronze: 1, rust: 1, brass: 1, steel: 1, chrome: 1 };
  const rev = {};
  let enabled = !!T, atlas = null, pending = 0;

  /* palette colour -> key, per culture (only the vehicle palette the culture registered: no furniture keys) */
  function keyOf(culture, hex) {
    let r = rev[culture];
    if (!r) {
      r = rev[culture] = {};
      const C = VEHICLE_CULTURES[culture], P = (C && C.palette) || {};
      for (const k of Object.keys(P)) if (r[P[k]] == null) r[P[k]] = k;
    }
    return r[hex];
  }
  function slotOf(name) { return name != null && SLOT[name] != null ? SLOT[name] : -1; }
  /* the slot a mesh's vertices get: its material's family and colour, in its vehicle's culture */
  function resolve(culture, fam, hex) {
    fam = fam || '';
    if (VEHICLE_LAMP_FAMILIES[fam]) return -1;
    if (!METALISH[fam] && (SLOT[fam] != null || (T && T.slots.indexOf(fam) >= 0))) return slotOf(fam);   /* 'metal' is a family first */
    const C = VEHICLE_CULTURES[culture], D = (C && C.detail) || {}, k = keyOf(culture, hex);
    if (k != null && Object.prototype.hasOwnProperty.call(D, k)) return D[k] === null ? -1 : slotOf(D[k]);
    if (METALISH[fam]) return slotOf('metal');
    if (fam === 'rubber') return slotOf('rubber');
    if (fam === '') return slotOf('paint');
    return -1;
  }

  /* the atlas: three canvases (colour, normal, roughness) the packed maps are drawn into as they decode */
  function textures() {
    if (atlas !== null) return atlas;
    if (!T || typeof document === 'undefined' || typeof Image === 'undefined') return (atlas = false);
    const S = T.size, W = T.cols * S, H = T.rows * S;
    const mk = function (fill, srgb) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d'); g.fillStyle = fill; g.fillRect(0, 0, W, H);
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
      t.anisotropy = 4;
      return { g: g, t: t };
    };
    const A = { map: mk('rgb(188,188,188)'), normalMap: mk('rgb(128,128,255)'), roughnessMap: mk('rgb(128,128,128)') };
    T.slots.forEach(function (s, i) {
      const f = T.fam[s];
      if (!f) return;
      for (const k of ['map', 'normalMap', 'roughnessMap']) {
        if (!f[k]) continue;
        const img = new Image(), dst = A[k];
        pending++;
        img.onload = function () { dst.g.drawImage(img, (i % T.cols) * S, Math.floor(i / T.cols) * S, S, S); dst.t.needsUpdate = true; pending--; };
        img.onerror = function () { pending--; };
        img.src = f[k];
      }
    });
    const n = T.slots.length, P = function (key, def) { const a = []; for (let i = 0; i < 16; i++) { const f = T.fam[T.slots[i]]; a.push(i < n && f ? f[key] : def); } return a; };
    atlas = { map: A.map.t, normalMap: A.normalMap.t, roughnessMap: A.roughnessMap.t, grid: new THREE.Vector2(T.cols, T.rows),
      tile: P('tile', 1).map(function (x) { return 1 / x; }), gain: P('gain', 1), ns: P('ns', 0) };
    return atlas;
  }

  const GLSL_V_DECL = '\nattribute float aDetS;\nvarying float vDetS;\nvarying vec3 vDetP;\nvarying vec3 vDetN;\nvarying vec3 vDetM0;\nvarying vec3 vDetM1;\nvarying vec3 vDetM2;\n';
  const GLSL_V_BODY = '\n  vDetS = aDetS; vDetP = position; vDetN = normal;\n  vDetM0 = normalMatrix[0]; vDetM1 = normalMatrix[1]; vDetM2 = normalMatrix[2];\n';
  const GLSL_F_DECL = [
    'varying float vDetS;', 'varying vec3 vDetP;', 'varying vec3 vDetN;', 'varying vec3 vDetM0;', 'varying vec3 vDetM1;', 'varying vec3 vDetM2;',
    'uniform sampler2D uDetC;', 'uniform sampler2D uDetN;', 'uniform sampler2D uDetR;',
    'uniform float uDetTile[16];', 'uniform float uDetGain[16];', 'uniform float uDetNS[16];', 'uniform vec2 uDetGrid;',
    '#if __VERSION__ >= 300',
    '#define DET_TEX(t, c, w) textureGrad(t, c, dFdx(w), dFdy(w))',
    '#else',
    '#define DET_TEX(t, c, w) texture2D(t, c)',
    '#endif',
    /* one cell of the atlas (cols x rows) at base, repeating; inset 3% so mipmaps do not pull in the neighbours, and
       the gradient of the unwrapped coordinate so the wrap does not pick the smallest mip */
    'vec4 detQ(sampler2D t, vec2 base, vec2 w){ vec2 cell = 1.0 / uDetGrid, k = cell * 0.94; return DET_TEX(t, base + cell * 0.03 + fract(w) * k, w * k); }',
    'vec3 detTri(sampler2D t, vec2 base, vec3 p, vec3 wt){ return detQ(t, base, p.zy).xyz * wt.x + detQ(t, base, p.xz).xyz * wt.y + detQ(t, base, p.xy).xyz * wt.z; }',
    'vec3 vDetNrm = vec3(0.0); float vDetRough = -1.0;', ''].join('\n');
  const GLSL_F_COLOUR = [
    '',
    '  float detS = floor(vDetS + 0.5);',
    '  if(detS > -0.5){',
    '    float tl = 1.0, gn = 1.0, ns = 0.0;',
    '    for(int i = 0; i < 16; i++){ if(float(i) == detS){ tl = uDetTile[i]; gn = uDetGain[i]; ns = uDetNS[i]; } }',
    '    vec2 base = vec2(mod(detS, uDetGrid.x) / uDetGrid.x, 1.0 - (floor(detS / uDetGrid.x) + 1.0) / uDetGrid.y);',
    '    vec3 N0 = normalize(vDetN);',
    '    vec3 wt = pow(abs(N0) + 1e-4, vec3(4.0)); wt /= (wt.x + wt.y + wt.z);',
    '    vec3 p = vDetP * tl;',
    '    diffuseColor.rgb *= sRGBToLinear(vec4(detTri(uDetC, base, p, wt), 1.0)).rgb * gn;',
    '    vec3 nx = detQ(uDetN, base, p.zy).xyz * 2.0 - 1.0, ny = detQ(uDetN, base, p.xz).xyz * 2.0 - 1.0, nz = detQ(uDetN, base, p.xy).xyz * 2.0 - 1.0;',
    '    vDetNrm = (vec3(0.0, nx.y, nx.x) * wt.x + vec3(ny.x, 0.0, ny.y) * wt.y + vec3(nz.x, nz.y, 0.0) * wt.z) * ns;',
    '    vDetRough = detTri(uDetR, base, p, wt).r;',
    '  }', ''].join('\n');

  /* the onBeforeCompile hook a vehicle material takes (the same source for every material, so one program) */
  function hook(mat) {
    const A = textures();
    if (!A) return mat;
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uDetC = { value: A.map }; sh.uniforms.uDetN = { value: A.normalMap }; sh.uniforms.uDetR = { value: A.roughnessMap };
      sh.uniforms.uDetTile = { value: A.tile }; sh.uniforms.uDetGain = { value: A.gain }; sh.uniforms.uDetNS = { value: A.ns };
      sh.uniforms.uDetGrid = { value: A.grid };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>' + GLSL_V_DECL)
        .replace('#include <begin_vertex>', '#include <begin_vertex>' + GLSL_V_BODY);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\n' + GLSL_F_DECL)
        .replace('#include <color_fragment>', '#include <color_fragment>' + GLSL_F_COLOUR)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  if(vDetRough >= 0.0) roughnessFactor = clamp(roughnessFactor * (0.55 + 0.9 * vDetRough), 0.04, 1.0);\n')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = normalize(normal + mat3(vDetM0, vDetM1, vDetM2) * vDetNrm);\n');
    };
    mat.customProgramCacheKey = function () { return 'krator-vehicles-detail-2'; };
    mat.userData.detail = true;
    return mat;
  }

  return {
    resolve: resolve, hook: hook, textures: textures,
    on: function () { return enabled && !!T; },
    set: function (on) { enabled = !!on && !!T; return enabled; },
    pending: function () { return pending; },
    slots: function () { return T ? T.slots.filter(function (s) { return !!T.fam[s]; }) : []; },
    info: function () { return T ? T.slots.map(function (s, i) { const f = T.fam[s]; return { slot: i, family: s, lib: f ? f.lib : null, tile: f ? f.tile : null }; }) : []; }
  };
})();
