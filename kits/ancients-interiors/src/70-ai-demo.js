/* ======================== Demo sheet: the Ancients' ship interiors ========================
   The demo, not the kit. Rows on one sheet, the camera at +z:
     1. the halls as the Ancients fitted them (dress 'ancient'), each recipe at its default size
     2. the same halls as the pirates hold them (dress 'occupied')
     3. the ship's rooms (AI.SHIP_ROOMS), trapezoids off a corridor, furnished by kits/interiors' placer with the
        ship's programmes (AI.install)
     4. cabins: a bedroom, a bunkroom and a store at each class width
   Halls stand in kits/interiors shells (IX.view.shell) with the cut-away; the plaza and the quay are open decks.
   The engine room's reserved floor holds a stand-in machinery block (a host draws its own engines there).
   Exposes window._ancientsInteriors (halls, rooms, gotoHall, gotoRoom) and sets window._ready.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors, AI = KratorAncientsInteriors;
  AI.install(IX);
  const catalog = IX.catalogAdapter({ lights: 'strip' });
  const FLOOR_Y = 0.2, GAP = 7, ROW_GAP = 12;
  const halls = [], rooms = [], plans = [], labels = [];

  /* ---------- a label on the ground */
  function label(text, sub, x, z, w) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const g = cv.getContext('2d');
    g.fillStyle = 'rgba(40,36,26,0.86)'; g.fillRect(0, 0, 512, 128);
    g.fillStyle = '#f3ecd8'; g.font = 'bold 44px Georgia'; g.fillText(text, 18, 56);
    g.fillStyle = '#d8c89a'; g.font = '30px Georgia'; g.fillText(sub || '', 18, 102);
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); scene.add(m); labels.push(m);
  }
  function slab(x, z, w, d, col) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, FLOOR_Y, d), new THREE.MeshLambertMaterial({ color: col }));
    m.position.set(x, FLOOR_Y / 2, z); scene.add(m); return m;
  }
  function rect(cx, cz, w, d) { return [[cx - w / 2, cz - d / 2], [cx + w / 2, cz - d / 2], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]]; }

  /* ---------- rows 1-2: the halls */
  const NAMES = Object.keys(AI.RECIPES);
  let z = 0;
  for (const dress of ['ancient', 'occupied']) {
    const deep = Math.max.apply(null, NAMES.map(n => AI.RECIPES[n].d));
    let x = 0;
    label(dress === 'ancient' ? 'Halls as built' : 'Halls as held', dress === 'ancient' ? "the Ancients' fit" : "the pirates' fit", -16, z, 24);
    NAMES.forEach(function (name, i) {
      const R = AI.RECIPES[name], res = AI.recipe(name, { dress, seed: 7 + i }, catalog);
      const cx = x + res.w / 2, cz = z - (deep - res.d) / 2;
      if (res.outdoor) slab(cx, cz, res.w, res.d, 0xcfc9bb);
      else {
        const room = ROOM({ id: 'hall.' + dress + '.' + name, kind: 'hall', culture: 'ancient', wealth: 0.5, y: FLOOR_Y, h: res.h, poly: rect(cx, cz, res.w, res.d),
          doors: [{ at: [cx + res.door.x, cz + res.d / 2], w: res.door.w }], windows: name === 'bridge' ? [{ at: [cx, cz - res.d / 2], w: res.w - 2, sill: 0.9, h: 2.4 }] : [] });
        const s = IX.view.shell(room); scene.add(s); IX.view.cutaway.add(s);
      }
      for (const r of res.reserved) {
        const m = slab(cx + (r.x0 + r.x1) / 2, cz + (r.z0 + r.z1) / 2, r.x1 - r.x0 - 0.4, r.z1 - r.z0 - 0.4, 0x4a5056);
        m.scale.y = 14; m.position.y = FLOOR_Y * 7;   /* the stand-in engines: a 2.8 m block */
      }
      const objs = [];
      res.placements.forEach(function (p, k) {
        const g = catalog.build({ key: p.key, x: cx + p.x, z: cz + p.z, ry: p.ry, variant: p.v, seed: 11 + k, y: FLOOR_Y + p.y, id: name + '.' + k }, { id: name, wealth: 0.5 });
        if (g) objs.push(g);
      });
      const audit = AI.audit(res, catalog);
      halls.push({ name, dress, title: R.name, x: cx, z: cz, res, audit, objects: objs.length });
      label(R.name, res.placements.length + ' pieces' + (audit.ok ? '' : ' · AUDIT FAILS'), cx, cz + res.d / 2 + 2.6, Math.min(14, res.w));
      x += res.w + GAP;
    });
    z -= deep + ROW_GAP;
  }

  /* ---------- row 3: the ship's rooms, furnished by the placer */
  {
    let x = 0;
    const depth = 6.4;
    label("Ship's rooms", 'the placer, with the ship programmes', -16, z, 24);
    AI.SHIP_ROOMS.forEach(function (S) {
      const spec = AI.shipRoom(S, { depth, y: FLOOR_Y }), wb = spec.poly[1][0] - spec.poly[0][0], cx = x + wb / 2;
      spec.id = 'ship.' + S.id;
      spec.poly = spec.poly.map(p => [p[0] + cx, p[1] + z]);
      spec.doors = spec.doors.map(dr => Object.assign({}, dr, { at: [dr.at[0] + cx, dr.at[1] + z] }));
      spec.windows = spec.windows.map(wn => Object.assign({}, wn, { at: [wn.at[0] + cx, wn.at[1] + z] }));
      const R = ROOM(spec), s = IX.view.shell(R); scene.add(s); IX.view.cutaway.add(s);
      const P = furnishRoom(R, catalog, { seed: 5 }); IX.buildRoom(P, catalog, R);
      rooms.push({ id: S.id, name: S.name, kind: S.kind, room: R, plan: P, audit: IX.audit(R, P, catalog) });
      label(S.name, P.placements.length + ' pieces', cx, z + depth / 2 + 2.4, Math.min(12, wb));
      x += wb + 3;
    });
    z -= 6.4 + ROW_GAP;
  }

  /* ---------- row 4: cabins */
  {
    let x = 0;
    label('Cabins', 'by kind and class width', -16, z, 24);
    for (const kind of ['bedroom', 'bunkroom', 'store']) for (const w of AI.CABIN_CLASSES) {
      const spec = AI.cabin(kind, w, 6.0, { y: FLOOR_Y, id: 'cabin.' + kind + '.' + w }), cx = x + w / 2;
      spec.poly = spec.poly.map(p => [p[0] + cx, p[1] + z]);
      spec.doors = spec.doors.map(dr => Object.assign({}, dr, { at: [dr.at[0] + cx, dr.at[1] + z] }));
      spec.windows = spec.windows.map(wn => Object.assign({}, wn, { at: [wn.at[0] + cx, wn.at[1] + z] }));
      const R = ROOM(spec), s = IX.view.shell(R); scene.add(s); IX.view.cutaway.add(s);
      const P = furnishRoom(R, catalog, { seed: 3 }); IX.buildRoom(P, catalog, R);
      rooms.push({ id: spec.id, name: kind + ' ' + w + ' m', kind, room: R, plan: P, audit: IX.audit(R, P, catalog) });
      label(kind, w + ' m · ' + P.placements.length + ' pieces', cx, z + 5.4, 6);
      x += w + 2;
    }
  }

  /* ---------- the bar, the camera, the frame hook */
  const $ = id => document.getElementById(id);
  const sel = $('hallSel');
  halls.forEach((H, i) => { const o = document.createElement('option'); o.value = 'h' + i; o.textContent = H.title + ' · ' + H.dress; sel.appendChild(o); });
  rooms.forEach((R, i) => { const o = document.createElement('option'); o.value = 'r' + i; o.textContent = R.name; sel.appendChild(o); });
  function look(x, zz, span) { if (ctl.walk) window._setWalk(false); ctl.target.set(x, 1, zz); ctl.dist = Math.max(10, span * 1.25); ctl.az = 0.3; ctl.el = 0.85; updateCamera(); }
  function gotoHall(i) { const H = halls[i]; if (H) { look(H.x, H.z, Math.max(H.res.w, H.res.d)); report(H); } }
  function gotoRoom(i) { const R = rooms[i]; if (!R) return; const b = R.room.bbox; look((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, Math.max(b[2] - b[0], b[3] - b[1]) + 4); report(null, R); }
  function overview() { look(150, -40, 260); report(); }
  sel.onchange = function () { const v = sel.value; if (!v) overview(); else if (v[0] === 'h') gotoHall(+v.slice(1)); else gotoRoom(+v.slice(1)); };
  $('cutBtn').onclick = function () { IX.view.cutaway.next(); $('cutBtn').textContent = 'Cut-away: ' + IX.view.cutaway.mode + ' (C)'; };
  addEventListener('keydown', function (e) { if (e.key === 'c' || e.key === 'C') $('cutBtn').onclick(); });
  function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
  function report(H, R) {
    const bad = halls.filter(h => !h.audit.ok).length + rooms.filter(r => !r.audit.ok).length;
    const n = halls.reduce((a, h) => a + h.res.placements.length, 0) + rooms.reduce((a, r) => a + r.plan.placements.length, 0);
    let s = '<span class="' + (bad ? 'miss' : 'ok') + '">' + halls.length + ' halls, ' + rooms.length + ' rooms, ' + n + ' pieces · ' + (bad ? bad + ' fail the audit' : 'every audit passes') + '</span>';
    if (H) s += '<br><b>' + esc(H.title) + '</b> (' + H.dress + ', ' + H.res.w + ' × ' + H.res.d + ' m): ' + esc(Object.keys(H.res.counts).map(k => k + ' ' + H.res.counts[k]).join(', ')) +
      (H.audit.ok ? '' : '<br><span class="miss">' + esc(H.audit.fails.join('; ')) + '</span>');
    if (R) s += '<br><b>' + esc(R.name) + '</b> (' + R.kind + '): ' + esc(R.plan.placements.map(p => p.key).join(', ')) +
      (R.audit.ok ? '' : '<br><span class="miss">' + esc(R.audit.fails.map(f => f.msg || f).join('; ')) + '</span>');
    $('rep').innerHTML = s;
  }
  (window._frameHooks = window._frameHooks || []).push(function () { IX.view.cutaway.update(camera); });
  $('count').textContent = halls.length + ' halls · ' + rooms.length + ' rooms';
  overview();
  window._ancientsInteriors = { halls, rooms, gotoHall, gotoRoom, overview, AI };
  window._ready = true;
})();
