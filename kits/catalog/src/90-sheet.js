/* ======================== Catalog contact sheet ========================
   Catalog contact sheet
   Lays out every registered FURN / PLANT / ASSET entry, every variant, in
   labelled rows on the engine's own scene. The catalog registers furniture only, so
   the page is the furniture sheet; ?sheet=plants|buildings lay out those registries
   for a page that loads them. Furniture rows are one per culture and tier; ?cultures=a,b
   shows only those cultures' furniture. The furniture sheet is split into PAGES, one page at a
   time, chosen by ?page= or the location hash (#indoor, #outdoor, #both, #rugs, #jobs, #all; a
   hosted page sees only the hash); the default is indoor. Every piece is on exactly ONE page
   (pageOf): a work item (a jobs-file entry, A.job, or a culture's FK trade piece, A.roleSet
   'trade') on Jobs, a rug (type 'rug') on Rugs, the rest by setting: Indoor, Outdoor, Indoor &
   outdoor ('both'). The setting pages hold household and civic furniture, a row per culture
   and tier; Rugs a row per culture; Jobs a row per job, then the trade pieces a row per culture.
   All of it on one page is too heavy to build: ~2200 instances. Each instance is built at ry = 0, so local axes are world
   axes and verify.py can audit it against its declared box directly.
   Exposes window._catalog (rows, sections, audit()) and sets window._ready.
   ====================================================================== */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  /* the catalog is the furniture sheet (2026-10): plants went to their biome kits, the Voth and Beast
     Rider buildings to their own sheets. The plant and building layouts below still work for a page
     that registers them, with ?sheet=plants or ?sheet=buildings. */
  const SHEETS = ['furniture', 'plants', 'buildings'];
  let sheet = (qs.get('sheet') || 'furniture').toLowerCase();
  if (sheet === 'all') sheet = 'furniture';
  if (SHEETS.indexOf(sheet) < 0) sheet = 'furniture';
  /* ?cultures=xanadu,voth lays out only those cultures' furniture: a light page for one set */
  const onlyCultures = (qs.get('cultures') || '').split(',').map(function (c) { return c.trim().toLowerCase(); }).filter(Boolean);
  const cultureShown = function (c) { return !onlyCultures.length || onlyCultures.indexOf(c) >= 0; };
  /* the page: one setting's furniture (indoor | outdoor | both), the rugs, the work items (jobs), or all of
     it (?page=all, for a partial run). pageOf() puts every piece on exactly one page. */
  const PAGES = [['indoor', 'Indoor'], ['outdoor', 'Outdoor'], ['both', 'Indoor & outdoor'], ['rugs', 'Rugs'], ['jobs', 'Jobs']];
  const pageOf = function (A) { return A.job || A.roleSet === 'trade' ? 'jobs' : A.type === 'rug' ? 'rugs' : (A.setting || 'both'); };
  let page = (qs.get('page') || location.hash.replace(/^#/, '') || (qs.get('cultures') || qs.get('keys') ? 'all' : 'indoor')).toLowerCase();
  if (page !== 'all' && !PAGES.some(function (p) { return p[0] === page; })) page = 'indoor';
  /* ?keys=_trade_,forge lays out only the pieces whose key holds one of these strings */
  const onlyKeys = (qs.get('keys') || '').split(',').map(function (c) { return c.trim().toLowerCase(); }).filter(Boolean);
  const keyShown = function (k) { return !onlyKeys.length || onlyKeys.some(function (s) { return k.toLowerCase().indexOf(s) >= 0; }); };

  /* --- labels: a ground plane sized to its slot, readable from the default orbit */
  const _labelCache = new Map();
  function labelTex(text, sub, dark) {
    const k = text + '|' + (sub || '') + '|' + (dark ? 1 : 0);
    if (_labelCache.has(k)) return _labelCache.get(k);
    const c = document.createElement('canvas');
    c.width = 512; c.height = sub ? 112 : 72;
    const g = c.getContext('2d');
    g.fillStyle = dark ? 'rgba(30,26,18,0.94)' : 'rgba(58,52,40,0.86)';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = dark ? '#e0c98a' : '#f5efdd';
    g.textAlign = 'center';
    let fs = 40;
    g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 490 && fs > 14) { fs -= 2; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif'; }
    g.fillText(text, 256, 50);
    if (sub) { g.font = '26px Georgia, serif'; g.globalAlpha = 0.7; g.fillText(sub, 256, 92); }
    const t = new THREE.CanvasTexture(c);
    _labelCache.set(k, t);
    return t;
  }
  function label(text, sub, x, z, w, dark) {
    const tex = labelTex(text, sub, dark);
    const aspect = tex.image.height / tex.image.width;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * aspect),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    m.userData.label = true;
    scene.add(m);
    return m;
  }

  /* --- grouping */
  /* the furniture rows of one page (pg; 'all': every page's rows in turn). every: ignore ?cultures and ?keys
     (verify.py's page-coverage check reads every page's rows through window._catalog.pageRows) */
  const TIER_ORDER = { poor: 0, common: 1, court: 2 };
  const byType = (a, b) => (a.type || '').localeCompare(b.type || '') || a.key.localeCompare(b.key);
  function furnGroups(pg, every) {
    const out = [], shown = function (A) { return every || (cultureShown(A.culture) && keyShown(A.key)); };
    const on = function (p) { return pg === 'all' || pg === p; };
    /* the setting pages: one row per culture and tier (poor, common, court), sorted by type */
    for (const p of ['indoor', 'outdoor', 'both']) if (on(p)) for (const c of FURN_CULTURES) {
      const mine = FURNS.filter(A => A.culture === c && pageOf(A) === p && shown(A));
      const tiers = new Set(mine.map(A => A.tier));
      for (const tier of ['poor', 'common', 'court']) {
        const list = mine.filter(A => A.tier === tier).sort(byType);
        if (list.length) out.push({ page: p, title: 'Furniture · ' + c + (tiers.size > 1 ? ' · ' + tier : ''), items: list });
      }
    }
    /* Rugs: one row per culture, every tier and setting, by tier then key */
    if (on('rugs')) for (const c of FURN_CULTURES) {
      const list = FURNS.filter(A => A.culture === c && pageOf(A) === 'rugs' && shown(A))
        .sort((a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0) || a.key.localeCompare(b.key));
      if (list.length) out.push({ page: 'rugs', title: 'Rugs · ' + c, items: list });
    }
    /* Jobs: one row per job (FURN_JOBS order), then a culture's trade pieces (FK.ROLES.trade) a row per culture */
    if (on('jobs')) {
      for (const j of FURN_JOBS) {
        const list = FURNS.filter(A => A.job === j && shown(A)).sort(byType);
        if (list.length) out.push({ page: 'jobs', title: 'Jobs · ' + j, items: list });
      }
      for (const c of FURN_CULTURES) {
        const list = FURNS.filter(A => A.culture === c && !A.job && A.roleSet === 'trade' && shown(A)).sort(byType);
        if (list.length) out.push({ page: 'jobs', title: 'Jobs · trade · ' + c, items: list });
      }
    }
    return out;
  }
  function groups(kind) {
    const out = [];
    if (kind === 'furniture') {
      return furnGroups(page, false);
    } else if (kind === 'plants') {
      for (const c of PLANT_CLIMATES) for (const a of PLANT_ARIDITY) {
        const list = PLANTS.filter(A => A.climate === c && A.aridity === a).sort((x, y) => x.key.localeCompare(y.key));
        if (list.length) out.push({ title: 'Plants · ' + c + ' / ' + a, items: list });
      }
    } else {
      for (const c of ASSET_CULTURES) {
        const list = ASSETS.filter(A => A.culture === c)
          .sort((x, y) => (x.family || '').localeCompare(y.family || '') || x.key.localeCompare(y.key));
        if (list.length) out.push({ title: 'Buildings · ' + c, items: list });
      }
    }
    return out;
  }
  const BUILD = { furniture: buildFurn, plants: buildPlant, buildings: buildAsset };
  const GAP = { furniture: 1.6, plants: 2.5, buildings: 6 };
  function subLine(kind, A) {
    if (kind === 'furniture') return [A.job, A.type, A.setting, A.tier].filter(Boolean).join(' · ');
    if (kind === 'plants') return A.climate + ' / ' + A.aridity;
    return (A.types && A.types.length ? A.types.join(' + ') : (A.family || ''));
  }

  /* --- lay out: rows run along +x from x = 0; sections stack toward -z */
  const rows = [], sections = [];
  let z = 0, maxW = 0;
  const kinds = [sheet];
  for (const kind of kinds) {
    const sec = { kind: kind, z0: z, rows: [] };
    for (const grp of groups(kind)) {
      let x = 0, depth = 0;
      const placed = [];
      for (const A of grp.items) {
        for (let v = 0; v < (A.variants || 1); v++) {
          const d = entryDims(A, v);
          const slot = Math.max(d.w, kind === 'furniture' ? 1.4 : 2.5);
          const cx = x + slot / 2, cz = z - d.d / 2;
          const g = BUILD[kind](A.key, cx, cz, 0, { variant: v, seed: 1 });
          if (g) placed.push(g);
          const nm = A.name + (A.variants > 1 ? ' #' + (v + 1) + (A.variantNames && A.variantNames[v] ? ' ' + A.variantNames[v] : '') : '');
          label(nm, subLine(kind, A), cx, z + 0.25 + Math.min(slot, 8) * 0.07, Math.min(slot, 8), false);
          x += slot + GAP[kind];
          depth = Math.max(depth, d.d);
        }
      }
      const row = { kind: kind, title: grp.title, z: z, width: x, depth: depth, instances: placed };
      label(grp.title, grp.items.length + ' entries', -8, z - Math.max(depth, 1) / 2, 12, true);
      rows.push(row); sec.rows.push(row);
      maxW = Math.max(maxW, x);
      z -= Math.max(depth, 2.6) + (kind === 'buildings' ? 10 : 4);
    }
    sec.z1 = z;
    sections.push(sec);
    z -= 12;
  }

  /* --- the standard Krator sky (vendored 81-sky.js), fixed at mid-morning */
  if (window.KratorSky) {
    KratorSky.attach(scene, 4200);
    KratorSky.update(camera.position, 10.5, 200, 1.6);
    const L = KratorSky.lighting();
    scene.fog.color.copy(L.fog);
    (window._frameHooks = window._frameHooks || []).push(function () {
      KratorSky.update(camera.position, 10.5, 200, 1.6);
    });
  }

  /* --- toolbar */
  const count = document.getElementById('count');
  const per = {};
  for (const g of INSTANCES) per[g.userData.kind] = (per[g.userData.kind] || 0) + 1;
  count.textContent = FURNS.length + ' furniture' + (PLANTS.length ? ' · ' + PLANTS.length + ' plants' : '') +
    (ASSETS.length ? ' · ' + ASSETS.length + ' buildings' : '') + ' — ' + INSTANCES.length + ' instances';
  const ss = document.getElementById('sheetSel');
  const have = { furniture: FURNS.length, plants: PLANTS.length, buildings: ASSETS.length };
  for (const s of SHEETS) {
    if (!have[s]) continue;
    const o = document.createElement('option'); o.value = s; o.textContent = 'sheet: ' + s;
    if (s === sheet) o.selected = true; ss.appendChild(o);
  }
  if (ss.options.length < 2) ss.style.display = 'none';
  ss.onchange = function () { location.search = ss.value === 'furniture' ? '' : '?sheet=' + ss.value; };
  /* the page switcher: a hash change rebuilds the page (the sheet is built once, at load) */
  if (sheet === 'furniture') {
    const pb = document.getElementById('pageBtns');
    for (const p of PAGES.concat(page === 'all' ? [['all', 'All']] : [])) {
      const n = FURNS.filter(function (A) { return p[0] === 'all' || pageOf(A) === p[0]; }).length;
      const b = document.createElement('button'); b.textContent = p[1] + ' ' + n; b.className = p[0] === page ? 'on' : '';
      b.onclick = function () { if (p[0] === page) return; location.hash = p[0]; location.reload(); };
      pb.appendChild(b);
    }
    window.addEventListener('hashchange', function () { if (location.hash.replace(/^#/, '') !== page) location.reload(); });
  }
  const rs = document.getElementById('rowSel');
  rows.forEach(function (r, i) {
    const o = document.createElement('option'); o.value = String(i); o.textContent = r.title; rs.appendChild(o);
  });
  /* frame the first stretch of a row, close enough to read its pieces */
  function gotoRow(i) {
    const r = rows[i];
    if (!r) return;
    if (ctl.walk) window._setWalk(false);
    const span = Math.min(r.width, r.kind === 'furniture' ? 40 : 120);
    ctl.target.set(span / 2, Math.min(r.depth, 8) * 0.3, r.z - r.depth / 2);
    ctl.dist = Math.max(10, span * 0.75);
    ctl.az = 0.18; ctl.el = 0.42;
    updateCamera();
  }
  rs.onchange = function () { gotoRow(+rs.value); };

  /* --- start on the first row */
  if (rows.length) gotoRow(0);

  window._catalog = { sheet: sheet, page: page, pages: PAGES.map(function (p) { return p[0]; }), pageOf: pageOf,
    /* every page's rows, ignoring ?cultures and ?keys, as { page, title, keys }: verify.py's page-coverage check */
    pageRows: function () { return furnGroups('all', true).map(function (g) { return { page: g.page, title: g.title, keys: g.items.map(function (A) { return A.key; }) }; }); },
    rows: rows, sections: sections, width: maxW, perKind: per, gotoRow: gotoRow };
  window._ready = true;
})();
