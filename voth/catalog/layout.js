/* ======================================================================
   Voth catalog layout + shot API
   Lays every ASSET out in rows (one row per entry, its variants side by
   side), grouped by source file then family, with a label under each row.

   URL parameters
     ?only=key1,key2   build just these entries
     ?src=housing      only entries whose source matches
     ?fam=military     only entries of this family
     ?lod=off|auto|0|1|2   merge/LOD off, automatic, or pinned (default auto)
     ?shot=1           headless mode: build nothing, wait for window._shot*()

   Headless shot API (used by shoot.py)
     _shotQuad(key, variant, opt) -> dataURL of a 2x2 sheet:
         front 3/4 | back 3/4
         side      | high oblique
     _shotLOD(key, variant) -> dataURL of L0 | L1 | L2 at one framing
     _auditAll() -> per entry/variant: declared vs measured size, tris per
         level, build errors
   ====================================================================== */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const lodQ = Q.get('lod') || 'auto';
  KratorLOD.enabled = lodQ !== 'off';
  if (/^[012]$/.test(lodQ)) KratorLOD.force = +lodQ;

  const srcOf = (A) => A.source || 'voth-registry-v1';
  /* sheet order: the new work first, the first-generation registry, then
     the structures captured from the city */
  const ORDER = ['voth-housing', 'voth-manors', 'voth-shops', 'voth-taverns', 'voth-warehouses',
    'voth-civic', 'voth-military', 'voth-registry-v1', 'voth-city-captured'];
  const srcRank = (A) => { const i = ORDER.indexOf(srcOf(A)); return i < 0 ? ORDER.length : i; };
  const only = Q.get('only') ? Q.get('only').split(',') : null;
  const srcF = Q.get('src'), famF = Q.get('fam');
  const list = ASSETS.filter((A) =>
    (!only || only.indexOf(A.key) >= 0) &&
    (!srcF || srcOf(A).indexOf(srcF) >= 0) &&
    (!famF || A.family === famF));

  /* ------------------------------------------------------------ sheet */
  const ROWS = [];
  function layoutSheet(entries) {
    let z = 0;
    let lastSrc = null;
    entries.sort((a, b) => srcRank(a) - srcRank(b) ||
      (a.family < b.family ? -1 : a.family > b.family ? 1 : 0) || (a.key < b.key ? -1 : 1));
    for (const A of entries) {
      if (srcOf(A) !== lastSrc) {
        lastSrc = srcOf(A);
        groundLabel(lastSrc.toUpperCase(), 0, z + 6, true);
        z -= 14;
      }
      let x = 0, deep = 0;
      for (let v = 0; v < A.variants; v++) {
        const d = entryDims(A, v);
        x += d.w / 2;
        buildAsset(A.key, x, z - d.d / 2, 0, { variant: v, seed: 7 + v * 13, wealth: 0.5 });
        x += d.w / 2 + Math.max(8, d.w * 0.25);
        deep = Math.max(deep, d.d);
      }
      groundLabel(A.name + '  ·  ' + A.key + (A.variants > 1 ? '  ·  ' + A.variants + ' variants' : ''), Math.min(x, 60) / 2, z + 4);
      ROWS.push({ key: A.key, name: A.name, z: z - deep / 2, width: x, deep: deep });
      z -= deep + 22;
    }
  }

  /* orbit camera onto a whole row: its variants side by side */
  function frameRow(r) {
    if (ctl.walk) window._setWalk(false);
    const w = Math.min(r.width, 420);
    ctl.target.set(w / 2, Math.min(r.deep, 40) * 0.25, r.z);
    ctl.dist = Math.max(w * 0.85, r.deep * 1.6, 30);
    ctl.az = 0.55; ctl.el = 0.42;
    updateCamera();
  }

  /* ------------------------------------------------------------ UI */
  function ui() {
    const fam = document.getElementById('fam'), src = document.getElementById('src');
    const fams = [...new Set(ASSETS.map((A) => A.family))].sort();
    const srcs = [...new Set(ASSETS.map(srcOf))].sort();
    fams.forEach((f) => fam.add(new Option(f, f, false, f === famF)));
    srcs.forEach((s) => src.add(new Option(s, s, false, s === srcF)));
    const go = () => {
      const p = new URLSearchParams();
      if (fam.value) p.set('fam', fam.value);
      if (src.value) p.set('src', src.value);
      if (lodQ !== 'auto') p.set('lod', lodQ);
      location.search = p.toString();
    };
    fam.onchange = go; src.onchange = go;
    const lb = document.getElementById('lodBtn');
    const modes = ['auto', '0', '1', '2'];
    let mi = Math.max(0, modes.indexOf(lodQ));
    lb.textContent = 'LOD: ' + (KratorLOD.enabled ? modes[mi] : 'off');
    lb.onclick = () => {
      if (!KratorLOD.enabled) return;
      mi = (mi + 1) % modes.length;
      KratorLOD.setForce(modes[mi] === 'auto' ? -1 : +modes[mi]);
      lb.textContent = 'LOD: ' + modes[mi];
    };
    let ri = 1;
    const gb = document.getElementById('goBtn');
    gb.textContent = 'next row';
    gb.onclick = () => {
      if (!ROWS.length) return;
      const r = ROWS[ri++ % ROWS.length];
      frameRow(r);
    };
    document.getElementById('count').textContent =
      list.length + ' entries · ' + list.reduce((n, A) => n + A.variants, 0) + ' builds';
  }

  /* ------------------------------------------------------------ shots */
  function clearInstances() {
    while (INSTANCES.length) {
      const g = INSTANCES.pop();
      scene.remove(g);
      g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    }
  }
  function frame(g) {
    const m = measureInstance(g);
    const c = m.box.getCenter(new THREE.Vector3());
    const R = Math.max(m.w, m.d, m.h) * 0.5;
    return { m, c, R };
  }
  function renderView(c, R, az, el, k) {
    const dist = R * (k || 2.35) / Math.tan(camera.fov * Math.PI / 360) * 0.62;
    camera.position.set(c.x + dist * Math.cos(el) * Math.sin(az), c.y + dist * Math.sin(el), c.z + dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(c);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
    renderer.render(scene, camera);
  }
  function sheet(views, cols, W, H) {
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const out = document.createElement('canvas');
    const rows = Math.ceil(views.length / cols);
    out.width = W * cols; out.height = H * rows;
    const ctx = out.getContext('2d');
    views.forEach((fn, i) => {
      const label = fn();
      ctx.drawImage(renderer.domElement, (i % cols) * W, Math.floor(i / cols) * H, W, H);
      if (label) {
        ctx.fillStyle = 'rgba(20,18,12,0.75)'; ctx.fillRect((i % cols) * W, Math.floor(i / cols) * H, W, 26);
        ctx.fillStyle = '#f3ecd8'; ctx.font = '15px Georgia'; ctx.fillText(label, (i % cols) * W + 8, Math.floor(i / cols) * H + 18);
      }
    });
    return out.toDataURL('image/png');
  }
  window._shotQuad = function (key, variant, opt) {
    opt = opt || {};
    clearInstances();
    KratorLOD.force = 0;
    const g = buildAsset(key, 0, 0, 0, { variant: variant || 0, seed: opt.seed || 7, wealth: opt.wealth == null ? 0.5 : opt.wealth });
    if (!g) return null;
    if (g.userData.lod) { g.userData.lod.autoUpdate = false; g.userData.lod.levels.forEach((L, i) => { L.object.visible = i === 0; }); }
    const { m, c, R } = frame(g);
    const A = ASSET_BY_KEY[key];
    const hdr = A.name + ' (' + key + ' v' + (variant || 0) + ')  ' + m.w.toFixed(1) + ' x ' + m.d.toFixed(1) + ' x ' + m.h.toFixed(1) + ' m' + (g.userData.error ? '  ERROR: ' + g.userData.error : '');
    return sheet([
      () => { renderView(c, R, 0.62, 0.32); return hdr; },
      () => { renderView(c, R, 0.62 + Math.PI, 0.32); return 'back 3/4'; },
      () => { renderView(c, R, Math.PI / 2 + 0.05, 0.1); return 'side'; },
      () => { renderView(c, R, -0.5, 0.95); return 'high oblique'; }
    ], 2, opt.w || 800, opt.h || 560);
  };
  window._shotLOD = function (key, variant) {
    clearInstances();
    const g = buildAsset(key, 0, 0, 0, { variant: variant || 0, seed: 7, wealth: 0.5 });
    if (!g || !g.userData.lod) return null;
    const lod = g.userData.lod; lod.autoUpdate = false;
    const { c, R } = frame(g);
    const lv = (i) => () => { lod.levels.forEach((L, j) => { L.object.visible = j === i; }); renderView(c, R, 0.62, 0.3); return 'L' + i + '  tris ' + Math.round(lod.levels[i].object.children.reduce((n, m) => n + m.geometry.attributes.position.count / 3, 0)); };
    return sheet([lv(0), lv(1), lv(2)], 3, 520, 400);
  };
  window._auditAll = function () {
    const rows = [];
    for (const A of list) for (let v = 0; v < A.variants; v++) {
      clearInstances();
      const t0 = performance.now();
      const g = buildAsset(A.key, 0, 0, 0, { variant: v, seed: 7, wealth: 0.5 });
      const ms = performance.now() - t0;
      const m = measureInstance(g);
      const d = entryDims(A, v);
      const lod = g.userData.lod;
      const tris = lod ? lod.levels.map((L) => Math.round(L.object.children.reduce((n, mm) => n + mm.geometry.attributes.position.count / 3, 0))) : [m.tris];
      rows.push({ key: A.key, v, src: srcOf(A), fam: A.family, err: g.userData.error, empty: m.empty,
        decl: [d.w, d.d, d.h], meas: [+m.w.toFixed(1), +m.d.toFixed(1), +m.h.toFixed(1)], tris, ms: Math.round(ms) });
    }
    clearInstances();
    return rows;
  };

  if (Q.get('shot')) { window._catalogReady = true; return; }
  layoutSheet(list);
  ui();
  if (ROWS.length) frameRow(ROWS[0]);
  window._catalogReady = true;
})();
