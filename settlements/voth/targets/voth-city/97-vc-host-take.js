/* ============================== 6z. HOST: VOTH ON core/host ============================== */
/* [web] ROADMAP.md section 10, steps 6a and 6b: Voth's city plan takes core/host's whole interface (core/host/README.md,
   "Voth onto core/host"). 6a, the shell: the camera (orbit, right-drag pan, W A S D fly, F walk on the KWALK floors with
   Voth's ledge guard, the pin: double-click, G flies to it, F walks from it, Esc lifts it; inside a canton the pin lands on
   the floor under the interior, VC.pickInterior), the frame loop, the panel's time row and the probe. The catalog engine
   (krator-asset-engine.js) keeps the scene, the camera and the renderer and leaves its controls and loop to the host
   (window.KRATOR_HOST, set in 00-head.html). What the page reads by name is kept: the engine's ctl becomes a view of the
   host's (az is the host's theta, el is PI/2 - phi, dist its radius, walk the host's walking flag as the engine's was, one
   target vector), updateCamera() is the host's apply, window._setWalk its walk. The clock is Voth's own (VC.clock,
   55-vc-host.js VC.dayNight), adopted by the host's loop, which steps it; the hour slider jumps the simulation (SIM.jump).
   Every window._frameHooks entry runs as the engine ran it, after the camera is placed, handed performance.now().
   6b, the tools, each the host's over Voth's data:
   - the records (core/tags, KTAGS.page): the cantons' bridges, stairs and doors (CANT.tag), every standing lot, every
     tree and plant placed one by one (59 VC.FL), the painted streets; VC.REC maps a record to what it is;
   - the inspector and the hover tip (93, I): Voth's own words (55 VC.describe: a lot, a piece of furniture, the ground; 56d a
     citizen's card; 58 the room under a cut) by Voth's own ray tests (o.inspectRay: no raycast of the city's batches);
   - what things hold and the stocks (93-host-stocks, O): KHOST.simHolds(SIM) with a lot's places (56e VC.lotPlaces), a
     container's place, a citizen's card (56d VC.actorHTML);
   - the marks (94, P): settlements/voth/marks.json (the owner's, carried over from site/voth-city-marks.json);
   - the picture menu (96): the Voth kit buildings, the swbay kit's trees and plants;
   - the editor (98, B): place a kit building (aligned to the nearest street, its variant), paint a street, plant, move,
     turn, remove a lot, a placed building, a tree or a painted street; every edit a core/edits op in
     settlements/voth/edits.json, which the layout applies as the page is made (35-vc-steps.js VC.editsFromLog);
   - the cutaway (99, X): the cantons by their storeys, and the lot buildings in view (56b's height grid, VC.CUTB).
   Still Voth's own: the citizens' pause (K), the paths view, the density overlay (N), the interiors report. */

/* ---------------------------------------------------------------- the records (core/tags) */
VC.REC = { lot: new Map(), byLot: new Map(), fl: new Map(), byFl: new Map(), live: new Map(), way: new Map(), gone: new Map() };
VC.recLot = function (L) {
  var A = ASSET_BY_KEY[L.key] || {}, r = KTAGS.page.add({ 'class': 'building', kind: L.role || L.cls, key: L.key, name: A.name || L.key, at: [L.x, L.y || 0, L.z], ry: L.ry || 0,
    size: [L.w || 8, L.d || 8, L.h || 6], tags: { culture: 'voth' }, frag: '97-vc-host-take.js' });
  VC.REC.lot.set(r.id, L); VC.REC.byLot.set(L, r); return r;
};
VC.recFlora = function (e) {
  var T = e.rec, tree = e.kind === 'tree', r = KTAGS.page.add({ 'class': 'flora', kind: e.kind, key: e.key, name: e.key + ' (' + e.kind + ')', at: [T.x, T.y0 || 0, T.z],
    r: tree ? Math.max(1.2, (T.crownR || 2) * 0.6) : 1, h: tree ? T.H || 4 : 1.2, frag: '97-vc-host-take.js' });
  VC.REC.fl.set(r.id, e); VC.REC.byFl.set(e, r); return r;
};
/* a painted street: a live one (put down in the editor, its line drawn) or one of the plan's (painted before, laid by the
   layout: removing it takes effect when the page is next made) */
VC.recWay = function (cls, pts, y, line) {
  var r = KTAGS.page.add({ 'class': 'infrastructure', kind: 'way', key: cls, name: cls + ' street (painted)', at: [pts[0][0], y || 0, pts[0][1]], r: 3, h: 1, tags: { culture: 'voth' }, frag: '97-vc-host-take.js' });
  VC.REC.way.set(r.id, { cls: cls, pts: pts, line: line || null }); return r;
};
VC.hostRecords = function () {
  var T = KTAGS.page = CANT.tags || KTAGS.page || KTAGS.create({ build: 'voth-city' });
  PLAN.lots.forEach(function (L) { if (L.died == null) VC.recLot(L); });
  VC.FL.list.forEach(function (e) { if (!e.gone) VC.recFlora(e); });
  PLAN.ways.forEach(function (w) { if (w.tag === 'painted street') VC.recWay(w.cls, w.pts, VIEW.surf(w.pts[0][0], w.pts[0][1])); });
  return T;
};

/* ---------------------------------------------------------------- picking for the editor: a painted street, a placed building */
VC.wayPick = function (ray) {
  var g = VIEW.pick(ray); if (!g) return null;
  var best = null, bd = Infinity;
  VC.REC.way.forEach(function (W, id) { var P = W.pts; for (var i = 1; i < P.length; i++) { var d = segDist(g, P[i - 1], P[i]); if (d < bd && d < (TUNE.width[W.cls] || 6) / 2 + 3) { bd = d; best = id; } } });
  return best ? KTAGS.page.get(best) : null;
};
VC.livePick = function (ray) {
  var best = null, bt = Infinity, o = ray.origin, d = ray.direction;
  VC.REC.live.forEach(function (Lv, id) {
    var r = KTAGS.page.get(id); if (!r || r.removed) return;
    var c = Math.cos(r.ry), s = Math.sin(r.ry), ox = o.x - r.at[0], oz = o.z - r.at[2];
    var O = [ox * c - oz * s, o.y, ox * s + oz * c], D = [d.x * c - d.z * s, d.y, d.x * s + d.z * c], lo = [-r.size[0] / 2, r.at[1], -r.size[1] / 2], hi = [r.size[0] / 2, r.at[1] + r.size[2], r.size[1] / 2], t0 = 0, t1 = bt;
    for (var a = 0; a < 3; a++) {
      if (Math.abs(D[a]) < 1e-9) { if (O[a] < lo[a] || O[a] > hi[a]) return; continue; }
      var ta = (lo[a] - O[a]) / D[a], tb = (hi[a] - O[a]) / D[a]; if (ta > tb) { var tt = ta; ta = tb; tb = tt; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return;
    }
    if (t0 < bt) { bt = t0; best = r; }
  });
  return best;
};

/* ---------------------------------------------------------------- the inspector's words, by Voth's own ray tests */
VC.inspectRay = function (ray) {
  var E = KHOST.edit, X = VC.INSP, r;
  if (E && E.on) {   /* editing: a placed building, a painted street, a tree or a plant under the cursor first */
    if ((r = VC.livePick(ray))) { X.a = null; return { html: '<b>' + r.name + '</b> <span class="k">' + r.key + '</span><br>placed in the editor (' + r.id + ')', rec: r }; }
    if ((r = VC.wayPick(ray))) { X.a = null; return { html: '<b>A painted ' + r.key + ' street</b><br>' + (VC.REC.way.get(r.id).line ? 'painted now' : 'laid by the plan; removing it takes effect when the page is next made') + ' (' + r.id + ')', rec: r }; }
    var f = VC.flPick(ray);
    if (f && (r = VC.REC.byFl.get(f)) && !r.removed) { X.a = null; return { html: '<b>' + f.key + '</b> <span class="k">' + f.kind + '</span><br>' + f.rec.x.toFixed(1) + ', ' + f.rec.z.toFixed(1) + (f.kind === 'tree' ? ' &middot; ' + f.rec.H.toFixed(1) + ' m' : '') + ' (' + r.id + ')', rec: r }; }
  }
  var html = VC.describe(ray), D = VC.DESC, rec = null, point = null;
  if (!html) return null;
  if (!X.a && D) {
    if (D.kind === 'lot') rec = VC.REC.byLot.get(D.lot) || null;
    else if (D.kind === 'furn') {   /* a piece of furniture: a record of the moment (its place's store, a mark round it) */
      var Fd = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[D.furn.key]) || {}, p = ray.at(D.furn.d, new THREE.Vector3());
      rec = { id: 'furniture:' + D.furn.key, 'class': 'furniture', key: D.furn.key, name: Fd.name || D.furn.key, at: [p.x, p.y - (Fd.h || 1) / 2, p.z], r: Math.max(0.4, Math.max(Fd.w || 1, Fd.d || 1) / 2), h: Fd.h || 1, place: D.furn.place };
    } else if (D.kind === 'ground') point = new THREE.Vector3(D.at[0], VIEW.surf(D.at[0], D.at[1]), D.at[1]);
  }
  return { html: html, rec: rec, point: point };
};

/* ---------------------------------------------------------------- the editor's world (core/edits ops, previewed live) */
VC.edVariant = function () { var s = $('vc-ed-var'); return s ? +s.value || 0 : 0; };
VC.edAligning = function () { var c = $('vc-ed-align'); return !c || c.checked; };
VC.edLive = function (b) { return VC.edBuild(b); };
VC.editWorld = {
  find: function (t, tol) { return KEDITS.match(t, KTAGS.page.records.filter(function (r) { return !r.removed; }), tol); },
  add: function (rec, op) {
    var R = VC.REC, c = rec['class'], G = rec.uid != null ? R.gone.get(rec.uid) : null, r;
    if (G) {   /* an undo of a removal: the same thing back */
      R.gone.delete(rec.uid);
      if (G.lot) { G.lot.died = G.was; HOST.updateBuildings(true); return VC.recLot(G.lot); }
      if (G.fl) { VC.flShow(G.fl, true); return VC.recFlora(G.fl); }
      if (G.way) { var ln = G.way.line ? VC.drapeLine(G.way.pts, VC.PATHCOL[G.way.cls] || 0xffffff, 2.2) : null; if (ln) ln.userData.probeSkip = true; if (G.way.cross) { scene.remove(G.way.cross); G.way.cross = null; } return VC.recWay(G.way.cls, G.way.pts, rec.at[1], ln); }
      if (G.live) rec = Object.assign({}, rec, { variant: G.live.b.v });
    }
    if (c === 'building') {
      var b = { key: rec.key, v: rec.variant || 0, x: rec.at[0], z: rec.at[2], ry: rec.ry || 0 }, g = VC.edLive(b); if (!g) return null;
      var Dm = SL.dims(b.key, b.v) || { w: 10, d: 10, h: 8 };
      r = KTAGS.page.add({ 'class': 'building', kind: 'placed', key: b.key, name: rec.name || (ASSET_BY_KEY[b.key] || {}).name || b.key, at: [b.x, rec.at[1] || 0, b.z], ry: b.ry, size: [Dm.w, Dm.d, Dm.h || 8], tags: { culture: 'voth' }, frag: '97-vc-host-take.js (edit)' });
      R.live.set(r.id, { b: b, g: g }); return r;
    }
    if (c === 'infrastructure' && rec.kind === 'way') {
      var line = VC.drapeLine(rec.pts, VC.PATHCOL[rec.key] || 0xffffff, 2.2); line.userData.probeSkip = true;
      return VC.recWay(rec.key, rec.pts, rec.at[1], line);
    }
    if (c === 'flora') {
      var a = { kind: rec.kind || 'tree', key: rec.key, x: rec.at[0], z: rec.at[2], y: rec.at[1] }; if (rec.H != null) a.H = rec.H;
      var n0 = VC.FL.list.length; if (!VC.flPlantOne(a)) return null; VC.flBake();
      var e = VC.FL.list[VC.FL.list.length - 1]; if (VC.FL.list.length === n0 || !e) return null;
      return VC.recFlora(e);
    }
    return null;
  },
  move: function (h, at, ry, op) {
    var R = VC.REC, L = R.lot.get(h.id), Lv = R.live.get(h.id), W = R.way.get(h.id), e = R.fl.get(h.id);
    if (ry == null) ry = h.ry;
    if (L) {   /* a building of the plan: hidden where it stood, drawn on its own where it went (its variant on the op for the layout) */
      op.v = L.v || 0; L.was = L.died; L.died = L.born; HOST.updateBuildings(true);
      R.lot.delete(h.id); R.byLot.delete(L);
      var b = { key: L.key, v: L.v || 0, x: at[0], z: at[2], ry: ry }; R.live.set(h.id, { b: b, g: VC.edLive(b), lot: L });
    } else if (Lv) {
      VC.edDrop(Lv.g); Lv.b.x = at[0]; Lv.b.z = at[2]; Lv.b.ry = ry;
      if (Lv.lot && Math.hypot(at[0] - Lv.lot.x, at[2] - Lv.lot.z) < 0.05 && Math.abs(ry - (Lv.lot.ry || 0)) < 1e-4) {   /* moved back where it stood: the plan's again */
        Lv.lot.died = Lv.lot.was; HOST.updateBuildings(true); R.live.delete(h.id); R.lot.set(h.id, Lv.lot); R.byLot.set(Lv.lot, h);
      } else Lv.g = VC.edLive(Lv.b);
    } else if (W) {
      var dx = at[0] - h.at[0], dz = at[2] - h.at[2]; W.pts = W.pts.map(function (p) { return [+(p[0] + dx).toFixed(2), +(p[1] + dz).toFixed(2)]; });
      if (W.line) { scene.remove(W.line); W.line = VC.drapeLine(W.pts, VC.PATHCOL[W.cls] || 0xffffff, 2.2); W.line.userData.probeSkip = true; }
    } else if (e) {   /* a plant: taken out where it stood and planted where it went */
      op.kind = e.kind; VC.flShow(e, false);
      var a = { kind: e.kind, key: e.key, x: at[0], z: at[2], y: at[1] }; if (e.kind === 'tree' && e.rec.H) a.H = e.rec.H;
      if (VC.flPlantOne(a)) { VC.flBake(); var e2 = VC.FL.list[VC.FL.list.length - 1]; R.fl.delete(h.id); R.byFl.delete(e); R.fl.set(h.id, e2); R.byFl.set(e2, h); }
    }
    h.at = at.slice(); h.ry = ry;
  },
  set: function (h, path, value) { h[path] = value; },
  remove: function (h) {
    var R = VC.REC, L = R.lot.get(h.id), Lv = R.live.get(h.id), W = R.way.get(h.id), e = R.fl.get(h.id);
    if (L) { R.gone.set(h.uid, { lot: L, was: L.died }); L.died = L.born; HOST.updateBuildings(true); R.lot.delete(h.id); R.byLot.delete(L); }
    else if (Lv) { VC.edDrop(Lv.g); R.gone.set(h.uid, { live: Lv }); R.live.delete(h.id); }
    else if (W) {
      if (W.line) scene.remove(W.line);
      else { W.cross = VC.drapeLine(W.pts, 0xff4a3a, 2.4); W.cross.userData.probeSkip = true; }   /* the plan's: it goes when the page is next made */
      R.gone.set(h.uid, { way: W }); R.way.delete(h.id);
    } else if (e) { VC.flShow(e, false); R.gone.set(h.uid, { fl: e }); R.fl.delete(h.id); R.byFl.delete(e); }
    KTAGS.page.remove(h.id);
  }
};
VC.edPalette = function () {
  var items = VC.edKits().map(function (A) { return { key: A.key, name: A.name || A.key, family: A.family || 'other', cls: 'building', variants: A.variants || 1, tags: { culture: 'voth' } }; });
  if (typeof SWBAY !== 'undefined') {
    (SWBAY.SPECIES || []).forEach(function (S) { items.push({ key: 'tree:' + S.key, name: S.name || S.key, family: 'trees', cls: 'flora' }); });
    (SWBAY.plantKinds || []).forEach(function (k) { items.push({ key: 'plant:' + k, name: k, family: 'plants', cls: 'flora' }); });
  }
  return {
    items: items,
    build: function (key, v) {   /* a kit building off screen, its nearest level (58-vc-tools.js's pictures did the same); the kit's trees have no picture */
      if (/^(tree|plant):/.test(key)) return null;
      var g = buildAsset(key, 0, 0, 0, { variant: v || 0, seed: 7, wealth: 0.6 }); if (!g) return null;
      scene.remove(g); var ix = INSTANCES.indexOf(g); if (ix >= 0) INSTANCES.splice(ix, 1);
      var lod = g.userData.lod; if (lod && lod.levels) lod.levels.forEach(function (L, i) { L.object.visible = i === 0; });
      return g;
    }
  };
};
VC.edTemplate = function (it, at, ry) {
  if (it.cls === 'flora') { var kv = it.key.split(':'); return { 'class': 'flora', kind: kv[0], key: kv[1], name: kv[1] + ' (' + kv[0] + ')', at: at, ry: 0 }; }
  var b = { key: it.key, v: Math.min(VC.edVariant(), (it.variants || 1) - 1), x: +at[0].toFixed(1), z: +at[2].toFixed(1), ry: ry };
  if (VC.edAligning()) VC.edAlign(b);
  return { 'class': 'building', key: b.key, name: it.name, variant: b.v, at: [b.x, +at[1].toFixed(2), b.z], ry: b.ry, tags: { culture: 'voth' } };
};
/* Voth's own rows in the host's editor panel: align to the nearest street, the variant of the building chosen */
VC.edControls = function () {
  var P = $('edit'); if (!P || !KHOST.edit) return;
  var row = document.createElement('div'); row.className = 'row';
  row.innerHTML = '<label class="k"><input type="checkbox" id="vc-ed-align" checked> align to the nearest street</label> <select id="vc-ed-var" title="the variant"></select>';
  P.insertBefore(row, $('khost-edit-info'));
  var vars = function (it) {
    var A = it && ASSET_BY_KEY[it.key], n = A ? A.variants || 1 : 1, s = $('vc-ed-var');
    s.innerHTML = Array.from({ length: n }, function (_, i) { return '<option value="' + i + '">' + ((A && A.variantNames && A.variantNames[i]) || 'variant ' + i) + '</option>'; }).join('');
    s.style.display = A ? '' : 'none';
  };
  vars(null);
  if (KHOST.pictures) { var pk = KHOST.pictures.pick; KHOST.pictures.pick = function (it) { if (pk) pk(it); vars(it); }; }
};

/* ---------------------------------------------------------------- the take */
VC.hostTake = function () {
  var H, toCam = function (tx, ty, tz, dist, el, az) { return [tx + dist * Math.cos(el) * Math.sin(az), ty + dist * Math.sin(el), tz + dist * Math.cos(el) * Math.cos(az), tx, ty, tz]; };
  VC.hostRecords();
  var cut = Object.keys(VC.INT.cantons).map(function (cn) {
    var P = VC.INT.cantons[cn], M = P.M, r = M.apron ? M.apron.ro : M.r;
    return { id: cn, name: cn + ' canton', x: M.x, z: M.z, w: 2 * r, d: 2 * r, levels: P.storeys.map(function (S) { return { y: S.y, h: S.h, name: S.dungeon ? 'the dungeon' : null }; }) };
  });
  VC.cutLevelsN(TUNE.ix.maxStoreys);
  H = KHOST.take({
    build: 'voth-city', title: 'Voth · city plan',
    hint: 'The street method on the owner\'s site, over Voth\'s own ground. K pauses everything; I the hover tip (a citizen under the cursor too), a click inspects; X cuts open the canton or the buildings in view; O lists the stocks; P marks; B edits',
    scene: scene, camera: camera, renderer: renderer, ground: function (x, z) { return VIEW.surf(x, z); },
    walk: typeof KWALK !== 'undefined' ? KWALK : null, walker: { step: TUNE.walk.step, drop: TUNE.walk.drop, r: TUNE.walk.r, h: TUNE.walk.h }, eye: ctl.eyeHeight,
    minR: 3, maxR: 12000,
    views: { 'the city': toCam(900, 0, 400, 2600, 0.7, 0.5), 'the map': toCam(300, 0, 200, 6200, 1.45, 0) }, start: 'the city',
    clock: { obj: VC.clock, maxStep: Infinity, speeds: TUNE.clock.speeds, onSet: function () { if (SIM.jump) SIM.jump(); VC.applyHour(VC.clock.hour); } },
    /* inside a canton (58-vc-tools.js VC.pickInterior): the pin on the floor under the interior hit (the host's own pick
       skips the interior's meshes, probeSkip, and met the shell or the sea) */
    pick: function (ray) { var h = VC.pickInterior(ray); return h ? VC.interiorStand(h.point) : null; },
    records: function () { return KTAGS.page.records.filter(function (r) { var L = VC.REC.lot.get(r.id); return !L || HOST.alive(L); }); },
    inspectRay: VC.inspectRay,
    holds: KHOST.simHolds(SIM, {
      idOf: function (rec) { var L = rec && VC.REC.lot.get(rec.id); return L ? VC.lotPlaces(L) : []; },
      containerOf: function (rec) { return rec && rec['class'] === 'furniture' && rec.place && SIM.R.place[rec.place] && VC.isContainer(rec.key) ? rec.place : null; },
      card: function (id) { var A = SIM.R.actor[id]; return A ? VC.actorHTML(A, A.cart ? 'cart' : A.animal ? 'animal' : 'citizen') : null; },
      placeName: VC.placeName, itemName: VC.itemName,
      paused: function () { return !!(VC.PAUSE && VC.PAUSE.on); }
    }),
    marksUrl: '../marks.json',
    palette: VC.edPalette(),
    edits: { world: VC.editWorld, log: typeof KHOST_EDITS !== 'undefined' ? KHOST_EDITS : null,
      deferred: function () { return false; },   /* every edit is drawn at once; the layout applies the log when the page is made */
      template: VC.edTemplate,
      canEdit: function (r) { var R = VC.REC; return R.lot.has(r.id) || R.live.has(r.id) || R.fl.has(r.id) || R.way.has(r.id); },
      ways: { classes: ['avenue', 'main', 'side', 'alley', 'lane'], start: 'main', label: 'paint street' } },
    cutaway: { units: cut.concat([VC.CUTB]), cutAt: TUNE.interiors.cutAt, margin: 20, show: VC.cutShow, pick: VC.cutPickUnit, bar: VC.cutBarHTML },
    exporters: { plan: function () { return SL.exportPlan(); } },
    api: { vc: function () { return window._vc; } }
  });
  /* the engine's ctl, as a view of the host's camera (Voth's views, the stocks and the cutaway write it) */
  var C = H.ctl; C.target = ctl.target;
  Object.defineProperty(ctl, 'az', { get: function () { return C.theta; }, set: function (v) { C.theta = v; }, configurable: true });
  Object.defineProperty(ctl, 'el', { get: function () { return Math.PI / 2 - C.phi; }, set: function (v) { C.phi = Math.PI / 2 - v; }, configurable: true });
  Object.defineProperty(ctl, 'dist', { get: function () { return C.radius; }, set: function (v) { C.radius = v; }, configurable: true });
  Object.defineProperty(ctl, 'walk', { get: function () { return C.walk; }, set: function (v) { C.walk = !!v; KHOST.cam.walkAt = null; }, configurable: true });
  Object.defineProperty(VC, 'walkAt', { get: function () { return C.walk ? KHOST.cam.walkAt : null; }, set: function () { }, configurable: true });   /* the walker's feet, [x, z, y] (56, 56b walk into an interior) */
  KHOST.onWalk = function (on) { if (window._onWalkChange) window._onWalkChange(on); };
  /* Voth's frame hooks, as the engine ran them: after the camera, on the page's time */
  KHOST.on(function vothHooks() { var now = performance.now(); if (window._inspectorTick) window._inspectorTick(); var F = window._frameHooks || []; for (var i = 0; i < F.length; i++) F[i](now); }, 'view');
  VC.edControls();
  var lg = $('legend'); if (lg && lg.innerHTML) lg.style.display = 'block';   /* VC.ui wrote the lots' and roles' colours into the host's legend */
  return H;
};
