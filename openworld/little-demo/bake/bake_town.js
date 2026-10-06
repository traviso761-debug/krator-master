// The town bake, run inside a built settlement page (bake.py): the town's EXTERIORS and STREETS as one tile, in the
// town's own frame less its centre (metres, x east, z south, y up, its local heights).
//
// Kept: the kit's buckets (userData.kit, an InstancedMesh per shape and material family), its merged families
// (userData.merged), the Ancients sites' meshes (a site's Group), named kit items, water surfaces, and the ground (the
// build's terrainH on a grid, with the painted ground canvas: the streets, plazas, yards and fields).
// Left out: flora (the 'leafy'/'bark' families, the biome kit's meshes, the kit's trees, moss, vines, reeds), life and
// fauna (figures, the life layer's instanced meshes, anything instanced without a kit tag), interiors (userData.ifam),
// the LOD copies, the sky, the ground plane, the build's own highways outside the town, and the terrain mesh (the
// ground is rebuilt from the grid). Everything beyond the footprint (R from the centre) is cut: instances by position,
// merged meshes by triangle (a whole mesh for an Ancients site, by its middle).
//
// cfg: {centre:[x,z], R, site: an Ancients site's x (keep that site's Group and instances only), siteR,
//       ground:'canvas'|'flat', step (the tile's ground grid, m), hstep (the page's coarser grid, m),
//       exKit: [kit item names left out], exFam: [families left out], tex: max texture size}
// Returns {json, bin (base64)}: the tile's header and its arrays.
(cfg) => {
  const T0 = performance.now(), sc = scene, C = cfg.centre, R = cfg.R, out = {meshes: [], materials: [], textures: [], stats: {}};
  const EXK = new Set(cfg.exKit || []), EXF = new Set(cfg.exFam || []);
  const chunks = []; let off = 0;
  const put = (ta) => { const b = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength), o = off; chunks.push(b); off += b.byteLength;
    const pad = (4 - (off % 4)) % 4; if (pad) { chunks.push(new Uint8Array(pad)); off += pad; } return o; };
  const arr = (ta) => ({off: put(ta), n: ta.length, t: ta.constructor.name});
  // the kit item names (the Ancients and the reed kit keep their InstancedMeshes in KIT.meshes)
  const kitName = new Map();
  for (const K of [(typeof KIT !== 'undefined' ? KIT : null), (typeof REEDKIT !== 'undefined' && REEDKIT ? REEDKIT.KIT : null), (typeof IZV !== 'undefined' && IZV ? IZV.KIT : null)])
    if (K && K.meshes) for (const n in K.meshes) { const m = K.meshes[n]; (Array.isArray(m) ? m : [m]).forEach(x => x && kitName.set(x, n)); }
  // ---- materials and textures, each once
  const matIx = new Map(), texIx = new Map();
  function texOf(t) {
    if (!t || !t.image) return -1;
    if (texIx.has(t)) return texIx.get(t);
    const img = t.image, w0 = img.width || img.videoWidth, h0 = img.height || img.videoHeight;
    if (!w0 || !h0) return -1;
    const k = Math.min(1, (cfg.tex || 512) / Math.max(w0, h0)), cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w0 * k)); cv.height = Math.max(1, Math.round(h0 * k));
    const g = cv.getContext('2d');
    try { g.drawImage(img, 0, 0, cv.width, cv.height); } catch (e) { return -1; }
    let alpha = false; try { const d = g.getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 64) if (d[i] < 250) { alpha = true; break; } } catch (e) {}
    const ix = out.textures.length;
    out.textures.push({url: cv.toDataURL(alpha ? 'image/png' : 'image/jpeg', .85), wrapS: t.wrapS, wrapT: t.wrapT, repeat: [t.repeat.x, t.repeat.y], offset: [t.offset.x, t.offset.y], flipY: t.flipY, enc: t.encoding});
    texIx.set(t, ix); return ix;
  }
  function matOf(m) {
    if (matIx.has(m)) return matIx.get(m);
    const o = {type: m.type, color: m.color ? m.color.getHex() : 0xffffff, vc: !!m.vertexColors, side: m.side, transparent: !!m.transparent,
      opacity: m.opacity, alphaTest: m.alphaTest || 0, depthWrite: m.depthWrite !== false, flat: !!m.flatShading,
      rough: m.roughness != null ? m.roughness : 1, metal: m.metalness || 0, emissive: m.emissive ? m.emissive.getHex() : 0,
      ei: m.emissiveIntensity != null ? m.emissiveIntensity : 1, map: texOf(m.map), custom: !!(m.onBeforeCompile && m.onBeforeCompile.toString().length > 20)};
    const ix = out.materials.length; out.materials.push(o); matIx.set(m, ix); return ix;
  }
  // ---- geometry, quantised: positions Int16 over the geometry's box, normals Int8, uvs Int16 over their range,
  // colours Uint8; triangles kept by a test on their middle (keep(x,z) in the town's frame) when given
  const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  function geom(g, M, keep) {
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, Cc = g.attributes.color, I = g.index;
    const nTri = (I ? I.count : P.count) / 3;
    const tri = (t, k) => I ? I.getX(t * 3 + k) : t * 3 + k;
    // which triangles, then which vertices
    let triKeep = null;
    if (keep) { triKeep = new Uint8Array(nTri); let any = 0;
      for (let t = 0; t < nTri; t++) { let sx = 0, sz = 0; for (let k = 0; k < 3; k++) { v.fromBufferAttribute(P, tri(t, k)); if (M) v.applyMatrix4(M); sx += v.x; sz += v.z; }
        if (keep(sx / 3 - C[0], sz / 3 - C[1])) { triKeep[t] = 1; any++; } }
      if (!any) return null; }
    const remap = new Int32Array(P.count).fill(-1), vl = []; const idx = [];
    for (let t = 0; t < nTri; t++) { if (triKeep && !triKeep[t]) continue; for (let k = 0; k < 3; k++) { const a = tri(t, k); if (remap[a] < 0) { remap[a] = vl.length; vl.push(a); } idx.push(remap[a]); } }
    const n = vl.length, pos = new Float32Array(n * 3);
    if (M) nm.getNormalMatrix(M);
    let lo = [1e18, 1e18, 1e18], hi = [-1e18, -1e18, -1e18];
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(P, vl[i]); if (M) { v.applyMatrix4(M); v.x -= C[0]; v.z -= C[1]; }
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; for (let q = 0; q < 3; q++) { const c = pos[i * 3 + q]; if (c < lo[q]) lo[q] = c; if (c > hi[q]) hi[q] = c; } }
    const qp = new Int16Array(n * 3); const sc3 = [0, 1, 2].map(q => (hi[q] - lo[q]) || 1);
    for (let i = 0; i < n * 3; i++) { const q = i % 3; qp[i] = Math.round((pos[i] - lo[q]) / sc3[q] * 65534) - 32767; }
    const o = {n, pos: arr(qp), lo, sz: sc3};
    if (N && cfg.normals) { const qn = new Int8Array(n * 3); for (let i = 0; i < n; i++) { v.fromBufferAttribute(N, vl[i]); if (M) v.applyMatrix3(nm); v.normalize(); qn[i * 3] = Math.round(v.x * 127); qn[i * 3 + 1] = Math.round(v.y * 127); qn[i * 3 + 2] = Math.round(v.z * 127); } o.nor = arr(qn); }
    if (U) { let ul = [1e18, 1e18], uh = [-1e18, -1e18]; for (let i = 0; i < n; i++) for (let q = 0; q < 2; q++) { const c = q ? U.getY(vl[i]) : U.getX(vl[i]); if (c < ul[q]) ul[q] = c; if (c > uh[q]) uh[q] = c; }
      const us = [uh[0] - ul[0] || 1, uh[1] - ul[1] || 1], qu = new Int16Array(n * 2);
      for (let i = 0; i < n; i++) { qu[i * 2] = Math.round((U.getX(vl[i]) - ul[0]) / us[0] * 65534) - 32767; qu[i * 2 + 1] = Math.round((U.getY(vl[i]) - ul[1]) / us[1] * 65534) - 32767; }
      o.uv = arr(qu); o.ulo = ul; o.usz = us; }
    if (Cc) { const qc = new Uint8Array(n * 3); for (let i = 0; i < n; i++) { qc[i * 3] = Math.round(Math.min(1, Cc.getX(vl[i])) * 255); qc[i * 3 + 1] = Math.round(Math.min(1, Cc.getY(vl[i])) * 255); qc[i * 3 + 2] = Math.round(Math.min(1, Cc.getZ(vl[i])) * 255); } o.col = arr(qc); }
    // a geometry that had no index keeps none (its triangles are its vertices in order); normals are left to the page
    if (I) o.idx = arr(n < 65536 ? new Uint16Array(idx) : new Uint32Array(idx)); else o.tri = n / 3;
    return o;
  }
  // ---- what to keep
  const skipUD = ['probeSkip', 'isTerrain', 'biome', 'lifeLabel', 'inspectFn', 'lodCopy', 'ifam', 'noPickShadow', 'noPick', 'under', 'furniture', 'life'];
  // instanced meshes with no kit tag that are still the town's: the reed village's items (Mungo), the lit windows
  const keepLabel = /reed village|^window$/i;
  const isWater = (o) => o.userData.isWater || /river|canal|lake|pool|water|cataract|falls/i.test(o.userData.inspectLabel || '');
  // the build's own ground mesh, kept where the tile carries its ground as drawn (Verge: vertex colours, the streets painted in)
  const isGround = (o) => cfg.ground === 'mesh' && (o.name === 'ground' || o.userData.inspectLabel === 'The ground');
  const siteOf = (o) => { for (let p = o.parent; p && p !== sc; p = p.parent) if (p.isGroup) return p; return null; };
  const inR = (x, z, r) => x * x + z * z <= r * r;
  const why = {}; const tally = (k) => { why[k] = (why[k] || 0) + 1; };
  sc.updateMatrixWorld(true);
  const list = []; sc.traverse(o => { if (o.isMesh) list.push(o); });
  for (const o of list) {
    let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
    if (!vis) { tally('hidden'); continue; }
    const ud = o.userData, kn = kitName.get(o) || '';
    if (skipUD.some(k => ud[k]) && !isWater(o) && !isGround(o)) { tally('tagged:' + skipUD.find(k => ud[k])); continue; }
    if ((o.name || '').startsWith('biome:')) { tally('biome'); continue; }
    if (/highway|^road$/i.test(ud.inspectLabel || '')) { tally('highway'); continue; }
    if (ud.fam && EXF.has(ud.fam)) { tally('fam:' + ud.fam); continue; }
    if (kn && EXK.has(kn)) { tally('kit:' + kn); continue; }
    if (o.renderOrder >= 50) { tally('interior'); continue; }
    if (o.isInstancedMesh && !ud.kit && !kn && !keepLabel.test(ud.inspectLabel || '')) { tally('instanced, untagged'); continue; }
    if (/flora|living/i.test(ud.inspectLabel || '')) { tally('flora label'); continue; }
    if (o.geometry && (o.geometry.boundingSphere || o.geometry.computeBoundingSphere() || o.geometry.boundingSphere) && o.geometry.boundingSphere.radius > 6000 && !isWater(o)) { tally('huge plane'); continue; }
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!mat || mat.type === 'ShaderMaterial' || mat.type === 'RawShaderMaterial') { if (!isWater(o)) { tally('shader'); continue; } }
    const water = isWater(o);
    const site = cfg.site != null ? siteOf(o) : null;
    if (cfg.site != null && !o.isInstancedMesh) {
      // an Ancients site: a Group per site; keep the chosen one's meshes whole
      if (!site) { tally('no site'); continue; }
      const b = new THREE.Box3().setFromObject(site), c = b.getCenter(new THREE.Vector3());
      if (Math.abs(c.x - cfg.site) > (cfg.siteR || 1500)) { tally('other site'); continue; }
    }
    const rec = {ground: isGround(o), name: (o.name || ud.inspectLabel || kn || (ud.shape ? ud.shape + '|' + ud.fam : ud.fam) || o.type).slice(0, 60), kit: kn, fam: ud.fam || '', water, ro: o.renderOrder || 0,
      mat: water ? -1 : matOf(mat)};
    if (water) rec.wcol = mat && mat.color ? mat.color.getHex() : 0x3a6a7a;
    if (o.isInstancedMesh) {
      const M = new THREE.Matrix4(), keepI = [];
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M); M.premultiply(o.matrixWorld); const x = M.elements[12] - C[0], z = M.elements[14] - C[1];
        if (inR(x, z, cfg.site != null ? (cfg.siteR || R) : R)) keepI.push(i); }
      if (!keepI.length) { tally('instances outside'); continue; }
      const g = geom(o.geometry, null, null); if (!g) continue;
      const mats = new Float32Array(keepI.length * 12);
      keepI.forEach((i, k) => { o.getMatrixAt(i, M); M.premultiply(o.matrixWorld); const e = M.elements;
        mats.set([e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10], e[12] - C[0], e[13], e[14] - C[1]], k * 12); });
      rec.g = g; rec.inst = arr(mats); rec.count = keepI.length;
      if (o.instanceColor) { const ic = new Uint8Array(keepI.length * 3); keepI.forEach((i, k) => { for (let q = 0; q < 3; q++) ic[k * 3 + q] = Math.round(Math.min(1, o.instanceColor.array[i * 3 + q]) * 255); }); rec.icol = arr(ic); }
      tally('kept instanced'); out.stats.instances = (out.stats.instances || 0) + keepI.length;
    } else {
      const g = geom(o.geometry, o.matrixWorld, cfg.site != null ? null : (x, z) => inR(x, z, R));
      if (!g) { tally('outside'); continue; }
      rec.g = g; tally('kept mesh');
    }
    out.stats.tris = (out.stats.tris || 0) + ((rec.g.idx ? rec.g.idx.n / 3 : rec.g.tri) * (rec.count || 1));
    out.meshes.push(rec);
  }
  // ---- the ground: the build's terrainH on a grid round the centre, and the painted ground canvas over it
  const TH = (typeof terrainH === 'function') ? terrainH : (window._api && window._api.terrainH);
  function grid(step) {
    const n = Math.floor(2 * R / step) + 1, x0 = -R, z0 = -R, h = new Float32Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) h[j * n + i] = TH ? TH(C[0] + x0 + i * step, C[1] + z0 + j * step) : 0;
    return {n, step, x0, z0, h};
  }
  if ((cfg.ground === 'canvas' || cfg.ground === 'mesh') && TH) {
    const fine = grid(cfg.step || 4), coarse = grid(cfg.hstep || 10);
    // Int16 round the middle of the range, in steps of s m: 1 cm where the relief allows (+-327 m), coarser where it
    // does not (Verge's 934 m drop: a fixed cm step clipped its floor 48 m high and buried the lower city)
    const q = (G) => { let lo = 1e9, hi = -1e9; for (let i = 0; i < G.h.length; i++) { if (G.h[i] < lo) lo = G.h[i]; if (G.h[i] > hi) hi = G.h[i]; }
      const h0 = (lo + hi) / 2, s = Math.max(.01, Math.ceil((hi - lo) / 65000 * 1000) / 1000), a = new Int16Array(G.h.length);
      for (let i = 0; i < a.length; i++) a[i] = Math.max(-32767, Math.min(32767, Math.round((G.h[i] - h0) / s))); return {a, h0, s}; };
    const F = q(fine), Q = q(coarse);
    if (cfg.ground === 'canvas') out.ground = {n: fine.n, step: fine.step, x0: fine.x0, z0: fine.z0, h0: F.h0, s: F.s, h: arr(F.a)};
    // the page's grid (the land under the town in WORLD.H): Int16 steps of s round h0, as little-endian bytes in base64
    const b = new Uint8Array(Q.a.buffer); let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    out.hgrid = {n: coarse.n, step: coarse.step, x0: coarse.x0, z0: coarse.z0, h0: Q.h0, s: Q.s, h: btoa(s)};
    // the ground as the build draws it: its terrain mesh (isTerrain) photographed from straight above with its own
    // shader (the ground canvas is only the paint its shader mixes in: the streets' and the water's marks), north up,
    // no fog, everything else hidden, into an sRGB target; read back as the tile's ground texture
    const TM = list.find(o => o.userData.isTerrain), RN = (typeof renderer !== 'undefined') ? renderer : null;
    if (TM && RN && out.ground) {
      const N2 = cfg.groundTex || 2048, rt = new THREE.WebGLRenderTarget(N2, N2);
      rt.texture.encoding = THREE.sRGBEncoding;
      const cam = new THREE.OrthographicCamera(-R, R, R, -R, 1, 40000);
      cam.position.set(C[0], 20000, C[1]); cam.up.set(0, 0, -1); cam.lookAt(C[0], 0, C[1]); cam.updateMatrixWorld(true);
      const hidden = []; sc.traverse(o => { if ((o.isMesh || o.isSprite || o.isPoints || o.isLine) && o !== TM && o.visible) { o.visible = false; hidden.push(o); } });
      const fog = sc.fog, bg = sc.background; sc.fog = null; sc.background = new THREE.Color(0x7a6a58);
      let px = null;
      try { RN.setRenderTarget(rt); RN.clear(); RN.render(sc, cam); px = new Uint8Array(N2 * N2 * 4); RN.readRenderTargetPixels(rt, 0, 0, N2, N2, px); }
      finally { RN.setRenderTarget(null); sc.fog = fog; sc.background = bg; hidden.forEach(o => { o.visible = true; }); rt.dispose(); }
      const cv = document.createElement('canvas'); cv.width = cv.height = N2; const g = cv.getContext('2d'), id = g.createImageData(N2, N2);
      for (let y = 0; y < N2; y++) id.data.set(px.subarray((N2 - 1 - y) * N2 * 4, (N2 - y) * N2 * 4), y * N2 * 4);   // GL rows run bottom up
      g.putImageData(id, 0, 0);
      out.ground.tex = cv.toDataURL('image/jpeg', .86); out.ground.texNote = 'the terrain mesh rendered from above, ' + N2 + ' px over ' + (2 * R) + ' m';
    }
    // otherwise the ground canvas: the build paints it over +-CITY_EXT round its origin; the part over the footprint
    const GC = (cfg.ground === 'canvas' && typeof GROUND_CANVAS !== 'undefined') ? GROUND_CANVAS : null, EXT = (typeof CITY_EXT !== 'undefined') ? CITY_EXT : null;
    if (GC && EXT && out.ground && !out.ground.tex) {
      const px = GC.width / (2 * EXT), sx = (C[0] - R + EXT) * px, sz = (C[1] - R + EXT) * px, sw = 2 * R * px;
      const N2 = Math.min(cfg.groundTex || 2048, Math.round(sw)), cv = document.createElement('canvas'); cv.width = cv.height = N2;
      const g = cv.getContext('2d'); g.fillStyle = '#7a6a58'; g.fillRect(0, 0, N2, N2); g.drawImage(GC, sx, sz, sw, sw, 0, 0, N2, N2);
      out.ground.tex = cv.toDataURL('image/jpeg', .86); out.ground.texNote = 'GROUND_CANVAS ' + GC.width + ' px over +-' + EXT + ' m';
    }
    out.centreH = TH(C[0], C[1]);
  } else out.centreH = 0;
  out.why = why; out.bytes = off; out.ms = Math.round(performance.now() - T0);
  // join the arrays and hand them back as base64
  const all = new Uint8Array(off); let o2 = 0; for (const c of chunks) { all.set(c, o2); o2 += c.byteLength; }
  let s = ''; for (let i = 0; i < all.length; i += 8192) s += String.fromCharCode.apply(null, all.subarray(i, i + 8192));
  // kept on the page; bake.py reads it back in pieces (one huge string over the DevTools pipe is very slow)
  window.__bake = {json: JSON.stringify(out), bin: btoa(s)};
  return {jsonLen: window.__bake.json.length, binLen: window.__bake.bin.length, ms: out.ms};
}
