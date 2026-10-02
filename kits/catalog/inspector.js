/* ======================================================================
   Krator Catalog Inspector
   Click any object to select it, then measure it, isolate it, cycle its
   variants, re-seed it, or audit the whole sheet for entries whose real
   geometry disagrees with the size they declare.
   Depends on the engine's globals: scene, camera, renderer, ctl, updateCamera,
   INSTANCES, measureInstance, rebuildInstance, entryDims, _matCache.
   ====================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- styles */
  const css = document.createElement('style');
  css.textContent = `
  #insp{position:fixed;left:14px;bottom:14px;z-index:20;width:330px;max-height:calc(100vh - 220px);
        background:rgba(24,21,15,0.90);color:#f3ecd8;border-radius:9px;font-family:Georgia,'Times New Roman',serif;
        font-size:12.5px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 24px rgba(0,0,0,0.3);}
  #insp .hd{padding:9px 12px;background:rgba(255,255,255,0.07);display:flex;align-items:center;gap:8px;cursor:pointer;}
  #insp .hd b{font-size:12px;letter-spacing:0.09em;text-transform:uppercase;opacity:0.85;flex:1;}
  #insp .hd span{font-size:11px;opacity:0.5;}
  #insp .bd{padding:10px 12px;overflow-y:auto;}
  #insp.collapsed .bd{display:none;}
  #insp h3{margin:0 0 2px;font-size:15px;line-height:1.25;}
  #insp .key{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;opacity:0.55;word-break:break-all;margin-bottom:7px;}
  #insp .meta{opacity:0.75;font-size:11.5px;margin-bottom:8px;line-height:1.5;}
  #insp table{width:100%;border-collapse:collapse;font-size:11.5px;margin-bottom:9px;}
  #insp td{padding:2px 0;}
  #insp td.l{opacity:0.6;width:74px;}
  #insp td.n{font-family:ui-monospace,Menlo,Consolas,monospace;}
  #insp .ok{color:#8fca7a;} #insp .warn{color:#e3b55e;} #insp .bad{color:#e88a7a;}
  #insp .row{display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap;}
  #insp button{background:rgba(255,255,255,0.09);color:#f3ecd8;border:none;border-radius:5px;
        padding:5px 9px;font-size:11.5px;font-family:inherit;cursor:pointer;}
  #insp button:hover{background:rgba(255,255,255,0.2);}
  #insp button.on{background:#c9a227;color:#2a2416;}
  #insp input[type=range]{width:100%;}
  #insp input[type=search]{width:100%;box-sizing:border-box;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.16);
        color:#f3ecd8;border-radius:5px;padding:5px 7px;font-family:inherit;font-size:12px;margin-bottom:7px;}
  #insp .hint{opacity:0.45;font-size:11px;line-height:1.55;}
  #insp .list{max-height:210px;overflow-y:auto;margin-top:4px;}
  #insp .list div{padding:4px 6px;border-radius:4px;cursor:pointer;font-size:11px;display:flex;gap:6px;}
  #insp .list div:hover{background:rgba(255,255,255,0.12);}
  #insp .list span.g{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  #insp .list span.v{font-family:ui-monospace,Menlo,Consolas,monospace;}
  #insp::-webkit-scrollbar,#insp .bd::-webkit-scrollbar,#insp .list::-webkit-scrollbar{width:7px;}
  #insp .bd::-webkit-scrollbar-thumb,#insp .list::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.22);border-radius:4px;}
  #nav{position:fixed;right:14px;bottom:14px;z-index:20;background:rgba(24,21,15,0.86);color:#f3ecd8;
       border-radius:8px;padding:8px 11px;font-family:Georgia,serif;font-size:11.5px;line-height:1.6;max-width:230px;}
  #nav b{color:#e0c98a;}
  #nav .mode{display:inline-block;padding:1px 6px;border-radius:4px;background:#c9a227;color:#2a2416;font-size:10.5px;}
  `;
  document.head.appendChild(css);

  const panel = document.createElement('div');
  panel.id = 'insp';
  panel.innerHTML = '<div class="hd"><b>Inspector</b><span>click an object</span></div><div class="bd"></div>';
  document.body.appendChild(panel);
  const body = panel.querySelector('.bd');
  const hdNote = panel.querySelector('.hd span');
  panel.querySelector('.hd').onclick = () => panel.classList.toggle('collapsed');

  const nav = document.createElement('div');
  nav.id = 'nav';
  document.body.appendChild(nav);

  /* -------------------------------------------------------------- state */
  const S = {
    sel: null,          /* selected instance group */
    measured: null,
    boxHelper: null,
    footprint: null,
    ruler: null,
    isolate: false,
    wireframe: false,
    showBox: true,
    hidden: [],         /* objects hidden by isolate */
    auditRows: null
  };

  /* ------------------------------------------------------------ helpers */
  function kindLabel(g) {
    const A = g.userData.asset;
    if (g.userData.kind === 'plant') return A.climate + ' / ' + A.aridity;
    if (g.userData.kind === 'building') return (A.culture || '') + ' · ' + (A.family || '');
    return A.culture + (A.type ? ' · ' + A.type : '') + (A.setting ? ' · ' + A.setting : '') +
      (A.rooms ? '<br>rooms: ' + A.rooms.join(', ') : (A.room ? ' · ' + A.room : '')) +
      (A.anchor ? '<br>anchor: ' + A.anchor : '') + (A.materials ? '<br>materials: ' + A.materials.join(', ') : '');
  }
  function pctClass(p) { const a = Math.abs(p); return a < 10 ? 'ok' : (a < 25 ? 'warn' : 'bad'); }
  function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2); }

  function clearHelpers() {
    for (const k of ['boxHelper', 'footprint', 'ruler']) {
      if (S[k]) { scene.remove(S[k]); S[k] = null; }
    }
  }

  /* the measured bounding box, and the box the entry SAYS it occupies, drawn
     together on the ground so a mismatch is visible rather than theoretical */
  function drawHelpers() {
    clearHelpers();
    if (!S.sel || !S.showBox) return;
    const m = S.measured;
    if (!m || m.empty) return;

    S.boxHelper = new THREE.Box3Helper(m.box, new THREE.Color(0xffcf4a));
    if (S.boxHelper.material) { S.boxHelper.material.depthTest = false; S.boxHelper.material.transparent = true; }
    scene.add(S.boxHelper);

    const u = S.sel.userData;
    const dims = entryDims(u.asset, u.opt.variant);
    const hw = dims.w / 2, hd = dims.d / 2, y = 0.05;
    const c = Math.cos(u.ry), s = Math.sin(u.ry);
    const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [-hw, -hd]].map(p => {
      /* same local->world mapping the build frame uses */
      const x = u.x + p[0] * c + p[1] * s;
      const z = u.z - p[0] * s + p[1] * c;
      return new THREE.Vector3(x, y, z);
    });
    const geo = new THREE.BufferGeometry().setFromPoints(corners);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x5ab0e0, depthTest: false, transparent: true }));
    S.footprint = line;
    scene.add(line);

    /* a 10 m graduated pole beside the selection, so height reads honestly */
    const ruler = new THREE.Group();
    const rx = m.max.x + 1.2, rz = m.min.z;
    for (let i = 0; i < 10; i++) {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 1, 0.16),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf0efe6 : 0x2b2721 })
      );
      band.position.set(rx, i + 0.5, rz);
      ruler.add(band);
    }
    S.ruler = ruler;
    scene.add(ruler);
  }

  /* ----------------------------------------------------------- selection */
  function select(g, focusIt) {
    if (S.isolate) setIsolate(false);
    S.sel = g;
    S.measured = g ? measureInstance(g) : null;
    drawHelpers();
    render();
    if (g && focusIt) focus();
  }

  function focus() {
    if (!S.sel || !S.measured || S.measured.empty) return;
    const m = S.measured;
    const c = m.box.getCenter(new THREE.Vector3());
    const size = Math.max(m.w, m.d, m.h);
    if (ctl.walk) {
      /* stand back from it at eye height rather than flying to the centre */
      ctl.target.set(c.x, ctl.eyeHeight, c.z + size * 1.1 + 3);
      ctl.az = 0; ctl.el = 0.1;
    } else {
      ctl.target.copy(c);
      ctl.dist = Math.max(size * 2.0, 6);
    }
    updateCamera();
  }

  function setIsolate(on) {
    if (on === S.isolate) return;
    S.isolate = on;
    if (on && S.sel) {
      S.hidden = [];
      for (const o of scene.children) {
        if (o === S.sel || o === S.boxHelper || o === S.footprint || o === S.ruler) continue;
        if (o.isLight || o === ground || o === grid) continue;
        if (o.visible) { o.visible = false; S.hidden.push(o); }
      }
    } else {
      for (const o of S.hidden) o.visible = true;
      S.hidden = [];
    }
    render();
  }

  function setWireframe(on) {
    S.wireframe = on;
    _matCache.forEach((m) => { m.wireframe = on; });
    render();
  }

  function rebuild(changes) {
    if (!S.sel) return;
    const wasIsolated = S.isolate;
    if (wasIsolated) setIsolate(false);
    const g = rebuildInstance(S.sel, changes);
    S.sel = g;
    S.measured = measureInstance(g);
    drawHelpers();
    if (wasIsolated) setIsolate(true);
    render();
  }

  /* --------------------------------------------------------------- audit */
  function runAudit() {
    const rows = [];
    for (const g of INSTANCES) {
      const u = g.userData;
      const m = measureInstance(g);
      const d = entryDims(u.asset, u.opt.variant);
      const dw = d.w ? (m.w / d.w - 1) * 100 : 0;
      const dd = d.d ? (m.d / d.d - 1) * 100 : 0;
      const dh = d.h ? (m.h / d.h - 1) * 100 : 0;
      const worst = [dw, dd, dh].reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0);
      rows.push({ g: g, name: u.asset.name, variant: u.opt.variant, variants: u.asset.variants || 1,
                  worst: worst, dw: dw, dd: dd, dh: dh, meshes: m.meshes });
    }
    rows.sort((a, b) => Math.abs(b.worst) - Math.abs(a.worst));
    S.auditRows = rows;
    render();
    const off = rows.filter(r => Math.abs(r.worst) > 25).length;
    const sparse = rows.filter(r => r.meshes < 8).length;
    console.log('[audit] ' + rows.length + ' instances, ' + off + ' over 25% off declared size, ' + sparse + ' under 8 meshes');
    return rows;
  }

  /* --------------------------------------------------------------- render */
  function render() {
    const sparkle = [];
    if (!S.sel) {
      hdNote.textContent = 'click an object';
      body.innerHTML =
        '<input type="search" id="inspq" placeholder="Search by name or key…">' +
        '<div class="row"><button data-act="audit">Audit sizes</button>' +
        '<button data-act="wire" class="' + (S.wireframe ? 'on' : '') + '">Wireframe</button></div>' +
        (S.auditRows ? auditHtml() : '<div class="hint">Click any object in the sheet to inspect it: its declared size against what it actually builds, its variants, and its mesh count.<br><br>' +
          '<b>WASD</b> move · <b>Q/E</b> down/up · <b>Shift</b> sprint · <b>F</b> walk mode<br>' +
          'Drag orbit · right-drag pan · scroll zoom</div>');
      wire();
      return;
    }
    const u = S.sel.userData, A = u.asset, m = S.measured;
    const d = entryDims(A, u.opt.variant);
    const dw = d.w ? (m.w / d.w - 1) * 100 : 0;
    const dd = d.d ? (m.d / d.d - 1) * 100 : 0;
    const dh = d.h ? (m.h / d.h - 1) * 100 : 0;
    hdNote.textContent = u.kind;

    body.innerHTML =
      '<h3>' + A.name + (A.variants > 1 ? ' <span style="opacity:.55;font-size:12px">' + (u.opt.variant + 1) + '/' + A.variants + '</span>' : '') + '</h3>' +
      '<div class="key">' + u.key + '</div>' +
      '<div class="meta">' + kindLabel(S.sel) +
        (A.districts && A.districts.length ? '<br>districts: ' + A.districts.join(', ') : '') +
        (A.wealth ? '<br>wealth band: ' + A.wealth[0] + '–' + A.wealth[1] : '') + '</div>' +
      '<table>' +
        '<tr><td class="l">declared</td><td class="n">' + d.w + ' × ' + d.d + ' × ' + d.h + ' m</td></tr>' +
        '<tr><td class="l">measured</td><td class="n">' + fmt(m.w) + ' × ' + fmt(m.d) + ' × ' + fmt(m.h) + ' m</td></tr>' +
        '<tr><td class="l">difference</td><td class="n">' +
          '<span class="' + pctClass(dw) + '">' + (dw >= 0 ? '+' : '') + dw.toFixed(0) + '%</span> ' +
          '<span class="' + pctClass(dd) + '">' + (dd >= 0 ? '+' : '') + dd.toFixed(0) + '%</span> ' +
          '<span class="' + pctClass(dh) + '">' + (dh >= 0 ? '+' : '') + dh.toFixed(0) + '%</span></td></tr>' +
        '<tr><td class="l">meshes</td><td class="n">' + m.meshes + ' <span style="opacity:.5">(' + m.tris.toLocaleString() + ' tris)</span></td></tr>' +
        '<tr><td class="l">sits at</td><td class="n">y = ' + fmt(m.min.y) + '</td></tr>' +
        '<tr><td class="l">seed</td><td class="n">' + u.opt.seed + '</td></tr>' +
      '</table>' +
      '<div class="row">' +
        (A.variants > 1 ? '<button data-act="prev">‹ variant</button><button data-act="next">variant ›</button>' : '') +
        '<button data-act="reseed">Re-seed</button>' +
      '</div>' +
      (u.kind === 'building' ? '<div style="margin-bottom:8px"><div style="opacity:.6;font-size:11px;margin-bottom:2px">wealth ' +
        u.opt.wealth.toFixed(2) + '</div><input type="range" id="inspw" min="0" max="1" step="0.05" value="' + u.opt.wealth + '"></div>' : '') +
      '<div class="row">' +
        '<button data-act="focus">Zoom to</button>' +
        '<button data-act="iso" class="' + (S.isolate ? 'on' : '') + '">Isolate</button>' +
        '<button data-act="box" class="' + (S.showBox ? 'on' : '') + '">Bounds</button>' +
        '<button data-act="wire" class="' + (S.wireframe ? 'on' : '') + '">Wireframe</button>' +
      '</div>' +
      '<div class="row">' +
        '<button data-act="v1">Front</button><button data-act="v2">Side</button>' +
        '<button data-act="v3">Top</button><button data-act="v4">Iso</button>' +
        '<button data-act="walkto">Walk here</button>' +
      '</div>' +
      '<div class="row"><button data-act="clear">Deselect</button><button data-act="audit">Audit sizes</button></div>' +
      (S.auditRows ? auditHtml() : '');
    wire();
  }

  function auditHtml() {
    const rows = S.auditRows.slice(0, 60);
    return '<div style="opacity:.6;font-size:11px;margin-top:6px">worst size mismatches — click to inspect</div><div class="list">' +
      rows.map((r, i) =>
        '<div data-audit="' + i + '"><span class="g">' + r.name + (r.variants > 1 ? ' #' + (r.variant + 1) : '') + '</span>' +
        '<span class="v ' + pctClass(r.worst) + '">' + (r.worst >= 0 ? '+' : '') + r.worst.toFixed(0) + '%</span>' +
        '<span class="v" style="opacity:.45">' + r.meshes + 'm</span></div>').join('') +
      '</div>';
  }

  function setView(az, el) {
    ctl.walk = false;
    ctl.az = az; ctl.el = el;
    if (window._onWalkChange) window._onWalkChange(false);
    focus(); updateCamera(); navRender();
  }

  function wire() {
    body.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        const a = b.getAttribute('data-act');
        const u = S.sel && S.sel.userData;
        if (a === 'prev') rebuild({ variant: (u.opt.variant - 1 + u.asset.variants) % u.asset.variants });
        else if (a === 'next') rebuild({ variant: (u.opt.variant + 1) % u.asset.variants });
        else if (a === 'reseed') rebuild({ seed: Math.floor(Math.random() * 9999) + 1 });
        else if (a === 'focus') focus();
        else if (a === 'iso') setIsolate(!S.isolate);
        else if (a === 'box') { S.showBox = !S.showBox; drawHelpers(); render(); }
        else if (a === 'wire') setWireframe(!S.wireframe);
        else if (a === 'v1') setView(0, 0.08);
        else if (a === 'v2') setView(Math.PI / 2, 0.08);
        else if (a === 'v3') setView(0, 1.44);
        else if (a === 'v4') setView(0.75, 0.55);
        else if (a === 'walkto') { if (!ctl.walk) window._setWalk(true); focus(); navRender(); }
        else if (a === 'clear') select(null);
        else if (a === 'audit') runAudit();
      };
    });
    body.querySelectorAll('[data-audit]').forEach(el => {
      el.onclick = (e) => { e.stopPropagation(); select(S.auditRows[+el.getAttribute('data-audit')].g, true); };
    });
    const w = body.querySelector('#inspw');
    if (w) w.oninput = () => rebuild({ wealth: parseFloat(w.value) });
    const q = body.querySelector('#inspq');
    if (q) {
      q.oninput = () => {
        const t = q.value.trim().toLowerCase();
        if (t.length < 2) return;
        const hit = INSTANCES.find(g => g.userData.key.toLowerCase().includes(t) ||
          (g.userData.asset.name || '').toLowerCase().includes(t));
        if (hit) { const keep = q.value; select(hit, true); const q2 = body.querySelector('#inspq'); if (q2) { q2.value = keep; q2.focus(); } }
      };
    }
  }

  function navRender() {
    nav.innerHTML = ctl.walk
      ? '<span class="mode">WALK</span> eye 1.7 m<br><b>WASD</b> walk · <b>Q/E</b> down/up<br><b>Shift</b> run · <b>scroll</b> speed<br>drag to look · <b>F</b> back to orbit'
      : '<span class="mode">ORBIT</span><br><b>WASD</b> pan · <b>Q/E</b> down/up<br><b>Shift</b> fast · <b>scroll</b> zoom<br>drag orbit · right-drag pan · <b>F</b> walk';
  }
  window._onWalkChange = navRender;
  navRender();

  /* ----------------------------------------------------------- picking */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downX = 0, downY = 0;
  renderer.domElement.addEventListener('mousedown', (e) => { downX = e.clientX; downY = e.clientY; });
  renderer.domElement.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) return; /* was a drag */
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(INSTANCES, true);
    if (!hits.length) { select(null); return; }
    let o = hits[0].object;
    while (o && INSTANCES.indexOf(o) < 0) o = o.parent;
    if (o) select(o, e.detail > 1);
  });

  /* ------------------------------------------------------------- keys */
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') select(null);
    else if (k === 'i') setIsolate(!S.isolate);
    else if (k === 'g') setWireframe(!S.wireframe);
    else if (k === 'b') { S.showBox = !S.showBox; drawHelpers(); render(); }
    else if (k === 'z') focus();
    else if (k === 'r' && S.sel) rebuild({ seed: Math.floor(Math.random() * 9999) + 1 });
    else if (k === '[' && S.sel && S.sel.userData.asset.variants > 1) {
      const u = S.sel.userData; rebuild({ variant: (u.opt.variant - 1 + u.asset.variants) % u.asset.variants });
    } else if (k === ']' && S.sel && S.sel.userData.asset.variants > 1) {
      const u = S.sel.userData; rebuild({ variant: (u.opt.variant + 1) % u.asset.variants });
    } else if (k === '1') setView(0, 0.08);
    else if (k === '2') setView(Math.PI / 2, 0.08);
    else if (k === '3') setView(0, 1.44);
    else if (k === '4') setView(0.75, 0.55);
    else if (k === 'h') { panel.classList.toggle('collapsed'); nav.style.display = nav.style.display === 'none' ? '' : 'none'; }
  });

  /* keep the selection highlight pinned to the object if it moves/rebuilds */
  window._inspectorTick = function () { /* helpers are static; hook kept for future use */ };

  window._inspect = { select: select, audit: runAudit, state: S };
  render();
})();
