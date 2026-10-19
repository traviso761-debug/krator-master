/* ======================================================================
   The Beast Riders kit's sheet: every building of the culture ('beast-rider'), the kit's own (the mounts:
   src/50-br-mounts.js) in the first row and Girder's and Mav's Refuge's (kits/catalog, read in place) after, each
   variant beside the first, built by the catalog's buildAsset and given the library's detail maps
   (krator-furniture-detail.js's detailize, over this kit's KF_TEX: materials.json). The probe is window._kit:
     {ready, keys, built: [{key, v, w, d, h (measured), decl}], errors, detail: {families attached}, tris}
   ====================================================================== */
(function () {
  if (/[?&]tex=0/.test(location.search)) KF_API.setTextures(false);
  const OWN = ['br_bldg_raptor_stable', 'br_bldg_great_byre', 'br_bldg_rookery_tower'];
  const all = ASSETS.filter(function (A) { return A.culture === 'beast-rider'; });
  const rows = [{ title: 'The mounts (this kit)', list: all.filter(function (A) { return OWN.indexOf(A.key) >= 0; }) },
    { title: "Girder's and Mav's Refuge's (kits/catalog)", list: all.filter(function (A) { return OWN.indexOf(A.key) < 0; }) }];
  const out = { ready: false, keys: all.map(function (A) { return A.key; }), built: [], errors: [], rows: [] };
  let z = 0, tris = 0;
  rows.forEach(function (R, ri) {
    let x = 0, depth = 0;
    const startX = x;
    R.list.forEach(function (A) {
      const nv = Math.min(3, A.variants || 1);
      for (let v = 0; v < nv; v++) {
        const w = A.w, d = A.d;
        const cx = x + w / 2, cz = z + d / 2;
        let g = null;
        try { g = buildAsset(A.key, cx, cz, 0, { variant: v, seed: 1, y: 0 }); } catch (e) { out.errors.push(A.key + ': ' + (e && e.message || e)); }
        if (g && g.userData.error) out.errors.push(A.key + ': ' + g.userData.error);
        if (g) {
          g.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; });
          KF_API.detailize(g);
          const M = measureInstance(g);
          tris += M.tris;
          out.built.push({ key: A.key, v: v, own: OWN.indexOf(A.key) >= 0, w: +M.w.toFixed(2), d: +M.d.toFixed(2), h: +M.h.toFixed(2), decl: { w: A.w, d: A.d, h: A.h },
            min: M.min ? [+(M.min.x - cx).toFixed(2), +M.min.y.toFixed(2), +(M.min.z - cz).toFixed(2)] : null, missing: g.userData.missingFurniture || [] });
        }
        if (v === 0) groundLabel(A.name, cx, z + d + 4);
        x += w + 10; depth = Math.max(depth, d);
      }
    });
    out.rows.push({ title: R.title, z: z, x0: startX, x1: x });
    groundLabel(R.title, -18, z + depth / 2, true);
    z += depth + 26;
  });
  out.tris = tris;
  out.detail = KF_API.textureInfo();
  out.ready = true;
  window._kit = out;
  document.getElementById('count').textContent = all.length + ' buildings · ' + out.built.length + ' built';
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
