/* ======================================================================
   Krator Furniture Detail: the material library's maps on the catalog's furniture.
   Joins the bundle only for furniture_bundle.bundle(..., tex=True), after krator-furniture-runtime.js, and extends its API:

     KF.detailize(group)    give every merged furniture mesh in `group` its library detail map (a batch's flush does it)
     KF.setTextures(on)     false: the vertex colours alone, as before (default true); applies to meshes made after
     KF.textureInfo()      { on, pending, families: [...maps attached so far] }

   The batch's meshes are vertex-coloured, merged in WORLD space and carry no UVs, so a set reaches them as a DETAIL map
   sampled by TRIPLANAR projection of the world position (three planar lookups blended by the normal): no UVs, no shear.
   KF_TEX (packed from materials.json by tools/textures/pack.py kits/catalog, inlined by furniture_bundle.py) holds per
   family the colour map as a data URL, its tile size in metres and the mean brightness the packer normalised it to; the
   shader divides that mean back out, so a piece keeps its palette colour and gains the grain, weave or tooling.
   A mesh looks its set up by texture family (userData.texFamily, krator-furniture-core.js FAMILY_SPLITS) then render
   family. Unlit (glow) meshes and painted panels (they carry a map already) are left alone. Godot: StandardMaterial3D's
   triplanar mode, one detail texture per family. Same shader as kits/fauna's detail maps.
   ====================================================================== */
(function () {
  const ST = { on: true, pending: 0, families: [] }, CACHE = {};
  function lookup(name) {
    if (!name || typeof KF_TEX === 'undefined' || !KF_TEX || !KF_TEX[name]) return null;
    if (CACHE[name]) return CACHE[name];
    const L = KF_TEX[name], t = new THREE.Texture(), img = new Image();
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    ST.pending++; img.onload = function () { t.image = img; t.needsUpdate = true; ST.pending--; }; img.onerror = function () { ST.pending--; };
    img.src = L.map; ST.families.push(name);
    return (CACHE[name] = { map: t, tile: 1 / (L.scale || 0.5), gain: 1 / Math.max(0.05, Math.pow(L.mean == null ? 0.5 : L.mean, 2.2)) });
  }
  function hook(mt, D) {
    mt.map = D.map;
    mt.onBeforeCompile = function (sh) {
      sh.uniforms.uDetTile = { value: D.tile }; sh.uniforms.uDetGain = { value: D.gain };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vKfP;varying vec3 vKfN;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvKfP=position;vKfN=normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vKfP;varying vec3 vKfN;uniform float uDetTile;uniform float uDetGain;')
        .replace('#include <map_fragment>', ['#ifdef USE_MAP', 'vec3 kW=pow(abs(normalize(vKfN))+1e-4,vec3(4.0));kW/=(kW.x+kW.y+kW.z);vec3 kP=vKfP*uDetTile;',
          'vec4 texelColor=texture2D(map,kP.zy)*kW.x+texture2D(map,kP.xz)*kW.y+texture2D(map,kP.xy)*kW.z;texelColor=mapTexelToLinear(texelColor);',
          'diffuseColor.rgb*=texelColor.rgb*uDetGain;', '#endif'].join('\n'));
    };
    mt.customProgramCacheKey = function () { return 'kf-detail'; };
    mt.needsUpdate = true;
  }
  KF_API.detailize = function (group) {
    if (!ST.on || typeof KF_TEX === 'undefined' || !KF_TEX) return group;
    group.traverse(function (m) {
      if (!m.isMesh || !m.userData.furniture || m.material.map || m.material.isMeshBasicMaterial) return;
      const u = m.material.userData, D = lookup(u.texFamily) || lookup(u.family);
      if (D) hook(m.material, D);
    });
    return group;
  };
  KF_API.setTextures = function (on) { ST.on = !!on; return ST.on; };
  KF_API.textureInfo = function () { return { on: ST.on, pending: ST.pending, families: ST.families.slice() }; };
  const mk = KF_API.batch;
  KF_API.batch = function (opt) {
    const b = mk(opt), flush = b.flush;
    b.flush = function (parent) { return KF_API.detailize(flush.call(b, parent)); };
    return b;
  };
})();
