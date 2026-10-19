/* ======================================================================
   The Beast Riders kit's sheet: every building of the kit in rows, each variant beside the first, built by the
   catalog's buildAsset: the kit's own (the mounts: src/50-br-mounts.js), given the library's detail maps
   (krator-furniture-detail.js's detailize, over this kit's KF_TEX: materials.json), then Girder's and Mav's Refuge's
   PORTS (src/60-br-ports.js), which keep their towns' own materials. The probe is window._kit:
     {ready, keys, built: [{key, v, own, port, w, d, h (measured), decl, min, missing, town?, def?, fabric?, furn?}],
      errors, rows, detail: {families attached}, tris}
   A port's entry carries what verify.py needs to find the same building in its town (def: the mark, its frame and
   clip), its fabric's box measured here in its local frame (no furniture) and its furniture records.
   ====================================================================== */
(function () {
  if (/[?&]tex=0/.test(location.search)) KF_API.setTextures(false);
  const TENT_ROWS = typeof BR_SHEET_TENTS !== 'undefined' ? BR_SHEET_TENTS : [];   /* the tent set's rows (79-br-camp.js) */
  const OWN = ['br_bldg_raptor_stable', 'br_bldg_great_byre', 'br_bldg_rookery_tower'].concat([].concat.apply([], TENT_ROWS.map(function (R) { return R.keys; })));
  const PORT_KEYS = BR_PORTS.keys;
  const all = ASSETS.filter(function (A) { return A.culture === 'beast-rider'; });
  const rows = [{ title: 'The mounts (this kit)', list: all.filter(function (A) { return OWN.indexOf(A.key) >= 0 && OWN.indexOf(A.key) < 3; }) },
    { title: "Girder's own (ported from its builders)", list: all.filter(function (A) { return A.port && A.port.town === 'girder'; }) },
    { title: "Mav's Refuge's own (ported from its builders)", list: all.filter(function (A) { return A.port && A.port.town === 'mavs-refuge'; }) }]
    .concat(TENT_ROWS.map(function (R) { return { title: R.title, list: R.keys.map(function (k) { return ASSET_BY_KEY[k]; }).filter(Boolean) }; }));
  const out = { ready: false, keys: OWN.concat(PORT_KEYS), built: [], errors: BR_PORTS.errors.slice(), rows: [] };
  const _v = new THREE.Vector3();
  function fabricBox(g) {                    /* the port's fabric (its town's kit meshes, not the furniture), local */
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    g.traverse(function (m) {
      if (!m.isMesh || !m.userData.fabric) return;
      const p = m.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i);
        lo[0] = Math.min(lo[0], _v.x); lo[1] = Math.min(lo[1], _v.y); lo[2] = Math.min(lo[2], _v.z);
        hi[0] = Math.max(hi[0], _v.x); hi[1] = Math.max(hi[1], _v.y); hi[2] = Math.max(hi[2], _v.z); }
    });
    return { min: lo, max: hi };
  }
  let z = 0, tris = 0;
  rows.forEach(function (R) {
    let x = 0, depth = 0;
    R.list.forEach(function (A) {
      const nv = A.port ? A.variants : Math.min(3, A.variants || 1);
      for (let v = 0; v < nv; v++) {
        const dm = entryDims(A, v);
        let w = Math.max(dm.w, 6), d = Math.max(dm.d, 6), cx = x + w / 2, cz = z + d / 2;
        if (A.port) {                          /* a port stands where its own extent says, its frame's origin not its box's centre */
          const L = measureInstance(BR_PORTS.built[A.key][v].group);
          w = L.w; d = L.d; cx = x - L.min.x; cz = z - L.min.z;
        }
        let g = null;
        try { g = buildAsset(A.key, cx, cz, 0, { variant: v, seed: 1, y: 0 }); } catch (e) { out.errors.push(A.key + ': ' + (e && e.message || e)); }
        if (g && g.userData.error) out.errors.push(A.key + ': ' + g.userData.error);
        if (g) {
          if (!A.port) { g.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; }); KF_API.detailize(g); }
          const M = measureInstance(g);
          tris += M.tris;
          const e = { key: A.key, v: v, own: OWN.indexOf(A.key) >= 0, port: !!A.port, w: +M.w.toFixed(2), d: +M.d.toFixed(2), h: +M.h.toFixed(2),
            decl: { w: dm.w, d: dm.d, h: dm.h },
            min: M.min ? [+(M.min.x - cx).toFixed(2), +M.min.y.toFixed(2), +(M.min.z - cz).toFixed(2)] : null,
            max: M.max ? [+(M.max.x - cx).toFixed(2), +M.max.y.toFixed(2), +(M.max.z - cz).toFixed(2)] : null, missing: g.userData.missingFurniture || [] };
          if (A.port) {
            const V = BR_PORTS.built[A.key][v];
            e.town = A.port.town; e.name = V.name; e.def = V.def; e.fabric = fabricBox(V.group); e.tracker = { min: V.box.min, max: V.box.max, inst: V.box.inst, tris: V.box.tris };
            e.furn = V.furn;
          }
          out.built.push(e);
        }
        if (v === 0 || A.port) groundLabel(A.port ? (A.variantNames || [])[v] || A.name : A.name, cx, z + d + 4);
        x += w + 12; depth = Math.max(depth, d);
      }
    });
    out.rows.push({ title: R.title, z: z, x0: 0, x1: x });
    groundLabel(R.title, -18, z + depth / 2, true);
    z += depth + 30;
  });
  out.tris = tris;
  out.detail = KF_API.textureInfo();
  out.ports = { girder: BR_GIRDER.info, mavs: BR_MAVS.info };
  out.ready = true;
  window._kit = out;
  document.getElementById('count').textContent = out.keys.length + ' buildings · ' + out.built.length + ' built';
  const rs = document.getElementById('rowSel');
  out.rows.forEach(function (R, i) { const o = document.createElement('option'); o.value = i; o.textContent = R.title; rs.appendChild(o); });
  const goto = function (i) { const R = out.rows[i]; ctl.target.set((R.x0 + R.x1) / 2, 6, R.z + 12); ctl.dist = Math.max(80, (R.x1 - R.x0) * 0.6); updateCamera(); };
  rs.onchange = function () { if (rs.value !== '') goto(+rs.value); };
  goto(0);
  const tb = document.getElementById('texBtn');
  tb.classList.toggle('on', KF_API.textureInfo().on);
  tb.onclick = function () { location.search = KF_API.textureInfo().on ? '?tex=0' : ''; };
  window._ready = true;
})();
