/* ============================== 4b. KIT PIECES BUILT ONCE, FLATTENED FOR INSTANCING ============================== */
/* [web] A kit piece (ISK.proto, IZV.proto, CAT.proto: the bundles, bundles.py) built once at the origin and flattened into one
   geometry per material, ready to draw as InstancedMeshes. The city page (60-isle-draw.js DRAW) and the open world's
   hamlets (openworld/isle-demo/src/88h-world-hamlets.js) both read this file in place.
   isleProto(kit, key, v, C) -> {id, parts: [{geo, mat, tris}], tris, ms, w, d, h} or null; C is the caller's cache
   {protos, failed, built}. */
function isleDenorm(a) {
  if (!a.normalized) return 1;
  var r = a.array;
  return r instanceof Uint8Array || r instanceof Uint8ClampedArray ? 1 / 255 : r instanceof Uint16Array ? 1 / 65535 : r instanceof Int8Array ? 1 / 127 : r instanceof Int16Array ? 1 / 32767 : 1;
}
function isleFlatten(G) {
  G.updateMatrixWorld(true);
  var groups = {}, M = new THREE.Matrix4(), IM = new THREE.Matrix4();
  G.traverse(function (o) {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    var mats = Array.isArray(o.material) ? null : o.material; if (!mats) return;
    var g = o.geometry, sig = mats.uuid + '|' + Object.keys(g.attributes).sort().join(','), list = groups[sig] || (groups[sig] = { mat: mats, parts: [] });
    if (o.isInstancedMesh) for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, IM); list.parts.push({ g: g, m: new THREE.Matrix4().multiplyMatrices(o.matrixWorld, IM) }); }
    else list.parts.push({ g: g, m: M.copy(o.matrixWorld).clone() });
  });
  var out = [];
  for (var s in groups) {
    var Q = groups[s], names = Object.keys(Q.parts[0].g.attributes), total = 0, itotal = 0;
    Q.parts.forEach(function (p) { total += p.g.attributes.position.count; itotal += p.g.index ? p.g.index.count : p.g.attributes.position.count; });
    var A = {}; names.forEach(function (nm) { A[nm] = new Float32Array(total * Q.parts[0].g.attributes[nm].itemSize); });
    var I = total > 65535 ? new Uint32Array(itotal) : new Uint16Array(itotal), vo = 0, io = 0, v3 = new THREE.Vector3(), nm3 = new THREE.Matrix3();
    Q.parts.forEach(function (p) {
      var g = p.g, cnt = g.attributes.position.count; nm3.getNormalMatrix(p.m);
      names.forEach(function (nm) {
        var src = g.attributes[nm], sz = src.itemSize, dst = A[nm], sc = isleDenorm(src);
        for (var i = 0; i < cnt; i++) {
          if (nm === 'position') { v3.fromBufferAttribute(src, i).applyMatrix4(p.m); dst[(vo + i) * 3] = v3.x; dst[(vo + i) * 3 + 1] = v3.y; dst[(vo + i) * 3 + 2] = v3.z; }
          else if (nm === 'normal') { v3.fromBufferAttribute(src, i).applyMatrix3(nm3).normalize(); dst[(vo + i) * 3] = v3.x; dst[(vo + i) * 3 + 1] = v3.y; dst[(vo + i) * 3 + 2] = v3.z; }
          else for (var c = 0; c < sz; c++) dst[(vo + i) * sz + c] = src.array[i * sz + c] * sc;
        }
      });
      if (g.index) for (var k = 0; k < g.index.count; k++) I[io + k] = g.index.array[k] + vo; else for (var k2 = 0; k2 < cnt; k2++) I[io + k2] = vo + k2;
      io += g.index ? g.index.count : cnt; vo += cnt;
    });
    var geo = new THREE.BufferGeometry(); names.forEach(function (nm) { geo.setAttribute(nm, new THREE.BufferAttribute(A[nm], Q.parts[0].g.attributes[nm].itemSize)); });
    geo.setIndex(new THREE.BufferAttribute(I, 1)); geo.computeBoundingSphere();
    out.push({ geo: geo, mat: Q.mat, tris: itotal / 3 });
  }
  return out;
}
/* a port's materials (kits/beast-riders br_port_*: the towns' own MeshStandardMaterial, library maps bound by the town's
   KMAT) drawn instanced as the town draws them plain. The hook (kits/beast-riders/towns/hook.js) made every shape a plain
   mesh with its world UVs, colours and normals baked, but kept the town's shader hooks (45-kit.js applyWorldUV,
   applyClothSway, applyContactAO, applyNightGlow; the furniture's detail hooks), which take an instanced draw's branch
   under USE_INSTANCING: drawn here as InstancedMeshes they would tile the baked UVs again, sway and shade by the
   instance. Before the includes are expanded, every USE_INSTANCING in the shader text is a hook's, so each is renamed to
   a macro never defined: the hooks take their plain branch, three.js's own instancing stays. Each material once (shared
   by a port's variants and copies); its program keyed on the town's hook and key */
function islePortMats(G) {
  G.traverse(function (o) {
    var m = o.isMesh && o.material; if (!m || Array.isArray(m) || m.userData.islePlain) return;
    m.userData.islePlain = true;
    var hook = m.onBeforeCompile, key = m.customProgramCacheKey, src = String(hook);
    if (!hook) return;
    m.onBeforeCompile = function (sh, r) {
      hook.call(this, sh, r);
      sh.vertexShader = sh.vertexShader.replace(/\bUSE_INSTANCING\b/g, 'ISLE_PORT_PLAIN');
      sh.fragmentShader = sh.fragmentShader.replace(/\bUSE_INSTANCING\b/g, 'ISLE_PORT_PLAIN');
    };
    m.customProgramCacheKey = function () { return 'isle-port|' + src + '|' + (key ? key.call(m) : ''); };
    m.needsUpdate = true;
  });
}
function isleProto(kit, key, v, C) {
  var id = kit + ':' + key + '#' + (v | 0); if (C.protos[id] !== undefined) return C.protos[id];
  var G = null, t0 = performance.now();
  try { G = kit === 'isk' ? ISK.proto(key, v) : kit === 'izv' ? IZV.proto(key, v, 1) : kit === 'cat' ? CAT.proto(key, v) : null; } catch (e) { C.failed[id] = String(e && e.message || e); }
  if (!G) { C.failed[id] = C.failed[id] || 'no build'; return (C.protos[id] = null); }
  if (G.userData.port) islePortMats(G);
  var parts = isleFlatten(G), tris = parts.reduce(function (a, p) { return a + p.tris; }, 0);
  C.built++;
  return (C.protos[id] = { id: id, parts: parts, tris: tris, ms: Math.round(performance.now() - t0), w: G.userData.w, d: G.userData.d, h: G.userData.h });
}
