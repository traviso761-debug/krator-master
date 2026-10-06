/* ============================== MATERIAL LIBRARY BIND (core/materials/record) ==============================
   [web]: for the builds whose materials already exist as a table of three.js MeshStandardMaterials (the Ancients
   lineage's MAT, the shared vernacular 69b-vern-mat.js): bind the build's packed library families onto them IN PLACE,
   before the first frame, as Ys's 79z-ys-matlib.js does by hand. Nothing is rebuilt; ?mat=proc binds nothing.

     KMAT.bindMat(build, MAT, opt)   for every key of MAT that the build's pack has a family of the same name, swap in
                                     the set's colour, normal and roughness maps, repeated so one tile of the old map
                                     (1/K metres, K from vWorldUV's userData.uvK, or opt.tile[key] in metres) becomes
                                     the set's own tile; add the library hooks (specular, tiling break-up) after the
                                     material's own hook (vWorldUV). opt.alias = {matKey: packFamily} binds a key to
                                     another key's family (woodV takes wood). opt.tile = KMAT.ANCIENT_TILES for the Ancients lineage.
                                     A material bound already is skipped. Returns {key: lib} for the bound ones.

   THE PROGRAM KEY. three.js keys a compiled program on onBeforeCompile.toString(), and kbake's Material.clone() keeps
   onBeforeCompile but drops customProgramCacheKey (core/materials/opt/69a-world-uv.js). So the wrapper is built with
   Function() and carries the material's id (build, key, world-UV K, library key) in its SOURCE TEXT; it reaches the
   material's old hook and its pack entry through KMAT.bound[id], which a clone shares (userData would not keep a
   function: clone() JSON-copies it). */
(function(){
  'use strict';
  if(typeof KMAT === 'undefined') throw new Error('26-matlib-bind: load 23-mat-record.js and 25-matlib-host.js first');
  var BOUND = KMAT.bound = KMAT.bound || {};
  /* the Ancients lineage's MAT (core/materials 22-materials.js, kits/ancients 54, 69, 69w, 34): metres per UV unit, so a set
     keeps the procedural map's feature size (the panel sheet is 4 x 8 panels of 2 x 1 m, the concrete 12 boards of 0.65 m).
     A material with a world-UV K (vWorldUV) uses that instead. */
  KMAT.ANCIENT_TILES = { white: 8, rust: 8, verdigris: 4, whiteWorn: 4.8, concrete: 7.8, concreteR: 7.8, paving: 7.8, ringPave: 7.8,
    brick: 1.2, corrugate: 2, timber: 2, tarp: 2, rubbleK: 2 };
  KMAT.bindMat = function(build, MAT, opt){
    opt = opt || {};
    var out = {};
    if(KMAT.mode !== 'lib' || !MAT) return out;
    Object.keys(MAT).forEach(function(key){
      var m = MAT[key];
      if(!m || !m.isMeshStandardMaterial || m.userData.lib) return;   /* bound already (a second call binds only what is new) */
      var fam = (opt.alias && opt.alias[key]) || key, L = KMAT.packed(build, fam);
      if(!L) return;
      var tile = m.userData.uvK ? 1 / m.userData.uvK : (opt.tile && opt.tile[key]) || null;
      var rep = tile ? [tile / L.scale[0], tile / L.scale[1]] : [1, 1];
      var T = KMAT.textures(L, { aniso: opt.aniso || 8 });
      [T.map, T.normalMap, T.roughnessMap].forEach(function(t){ if(t) t.repeat.set(rep[0], rep[1]); });
      m.map = T.map;
      if(T.normalMap){ m.normalMap = T.normalMap; m.normalScale = new THREE.Vector2(L.normalScale || 1, L.normalScale || 1); }
      if(T.roughnessMap){ m.roughnessMap = T.roughnessMap; m.roughness = 1; }
      m.metalnessMap = null; m.metalness = L.metal || 0;
      var id = build + '|' + key + '|' + (m.userData.uvK || 0).toFixed(4) + KMAT.libKey(L);
      BOUND[id] = { prev: m.onBeforeCompile || null, lib: L };   /* by id, not on userData: clone() JSON-copies userData */
      m.onBeforeCompile = new Function('sh', 'r', 'var b = KMAT.bound[' + JSON.stringify(id) + '];\n' +
        'if(b.prev) b.prev.call(this, sh, r); KMAT.libHooks(sh, b.lib);');
      var prevKey = m.customProgramCacheKey && m.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey ? m.customProgramCacheKey() : '';
      m.customProgramCacheKey = function(){ return prevKey + '|km|' + id; };
      m.userData.lib = L.lib;
      m.needsUpdate = true;
      out[key] = L.lib;
    });
    return out;
  };
})();
