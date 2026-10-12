/* ============================== 6d. HOST: THE FLORA EDITOR ============================== */
/* [web] The editor's flora mode (owner, 2026-10-09: "add function so i can select flora as well and delete it when
   clipping into things", "and place new flora"):
   - select: a click picks the tree (the biome's own, or one the city or the owner planted) or the placed plant the
     ray passes nearest to; Delete (or the button) takes it out of the world at once;
   - plant: a click plants the chosen species or plant on whatever floor is under it (a canton's deck, a park), with
     the biome's own builders (SWBAY.treeAt, SWBAY.plantAt), and bakes it in at once.
   Both go into the edits file (site/voth-city-edits.json, `flora: {del, add}`) with the buildings and streets; on the
   next load the kit's veto (SWBAY.veto: a deleted tree keeps its place, index and seed in the pass, so every other
   tree is as it was) leaves the deleted ones unbuilt and VC.flAddSaved plants the added ones.
   Taking one out live: the kit brackets every tree and placed plant's writes (SWBAY.onFlora), this fragment notes
   which instances and triangles of the store they were, maps them to the baked meshes when the store is baked
   (VC.flBake, in place of BIO.bake), and hides exactly those: an instance scaled to nothing, a triangle collapsed.
   The ground cover the kit scatters by itself (ferns, moss under the trees) is not tracked: only trees and plants
   placed one by one can be picked. */

VC.FL = { list: [], pending: [], del: [], add: [], sel: null, mark: null, on: false };
/* the saved edits and the kit's hooks: before SWBAY.build */
VC.flInit = function () {
  var src = VC.edits(), F = (src && src.flora) || {}, L = VC.FL;
  L.del = (F.del || []).map(function (d) { return { kind: d.kind, key: d.key, x: d.x, z: d.z }; });
  L.add = (F.add || []).map(function (a) { return { kind: a.kind, key: a.key, x: a.x, z: a.z, y: a.y, H: a.H }; });
  if (typeof SWBAY === 'undefined') return;
  SWBAY.veto = function (kind, key, x, z) {
    for (var i = 0; i < L.del.length; i++) { var d = L.del[i]; if (d.kind === kind && d.key === key && Math.abs(d.x - x) < 0.3 && Math.abs(d.z - z) < 0.3) { d.hit = true; return true; } }
    return false;
  };
  SWBAY.onFlora = VC.flRecord;
};
/* the kit's store: every item's instance count and every bucket's triangle count */
VC.flCounts = function () {
  var R = BIO.kits.swbay, c = { i: {}, b: {} }; if (!R) return c;
  for (var n in R.items) c.i[n] = R.items[n].count;
  for (var f in R.buckets) c.b[f] = R.buckets[f].k.length;
  return c;
};
VC.flRecord = function (T, phase) {
  if (phase === 0) { T._c = VC.flCounts(); return; }
  var a = T._c, b = VC.flCounts(), r = []; delete T._c; if (!a) return;
  for (var n in b.i) { var i0 = a.i[n] || 0; if (b.i[n] > i0) r.push([0, n, i0, b.i[n]]); }
  for (var f in b.b) { var t0 = a.b[f] || 0; if (b.b[f] > t0) r.push([1, f, t0, b.b[f]]); }
  var e = { rec: T, kind: T.plant ? 'plant' : 'tree', key: T.plant || SWBAY.SPECIES[T.sp].key, store: r, hide: [] };
  VC.FL.pending.push(e); VC.FL.list.push(e);
};
/* bake the store, and turn every pending entry's store ranges into runs of the baked meshes: bake groups an item's
   instances (a bucket's triangles) by LOD key in store order, so a run of one key in the store is a run in its mesh */
VC.flBake = function () {
  var R = BIO.kits.swbay, P = VC.FL.pending, runs = [];
  if (R && P.length) {
    var need = { 0: {}, 1: {} }; P.forEach(function (e) { e.store.forEach(function (s) { need[s[0]][s[1]] = 1; }); });
    var pos = { 0: {}, 1: {} };
    [0, 1].forEach(function (kd) {
      Object.keys(need[kd]).forEach(function (n) {
        var K = kd ? R.buckets[n] && R.buckets[n].k : R.items[n] && R.items[n].k; if (!K) return;
        var j = new Int32Array(K.length), cnt = new Map();
        for (var i = 0; i < K.length; i++) { var k = K[i] || '', c = cnt.get(k) || 0; j[i] = c; cnt.set(k, c + 1); }
        pos[kd][n] = { k: K, j: j };
      });
    });
    P.forEach(function (e) {
      e.store.forEach(function (s) {
        var Q = pos[s[0]][s[1]]; if (!Q) return;
        for (var i = s[2]; i < s[3];) { var k = Q.k[i] || '', i1 = i; while (i1 < s[3] && (Q.k[i1] || '') === k) i1++; e.hide.push([s[0], s[1], k, Q.j[i], i1 - i]); i = i1; }
      });
      runs.push(e);
    });
  }
  var from = BIO.baked.length, out = BIO.bake(), M = {};
  for (var b = from; b < BIO.baked.length; b++) {
    var m = BIO.baked[b]; if (m.userData.kit !== 'swbay') continue;
    var L = m.userData.lod, key = L ? L.chunk + '|' + L.range + '|' + L.minRange : '';
    M[(m.isInstancedMesh ? 0 : 1) + '/' + m.name.slice(6) + '/' + key] = m;
  }
  runs.forEach(function (e) { e.hide = e.hide.map(function (h) { return { mesh: M[h[0] + '/' + h[1] + '/' + h[2]], j: h[3], n: h[4] }; }).filter(function (h) { return h.mesh; }); delete e.store; });
  VC.FL.pending = [];
  return out;
};
/* hide (or show again) one entry's instances and triangles */
VC.flShow = function (e, on) {
  var m4 = new THREE.Matrix4().makeScale(0, 0, 0);
  e.hide.forEach(function (h) {
    var m = h.mesh;
    if (m.isInstancedMesh) {
      var A = m.instanceMatrix.array;
      if (!on) { h.keep = A.slice(h.j * 16, (h.j + h.n) * 16); for (var i = 0; i < h.n; i++) m.setMatrixAt(h.j + i, m4); }
      else if (h.keep) A.set(h.keep, h.j * 16);
      m.instanceMatrix.needsUpdate = true;
    } else {
      var I = m.geometry.index; if (!I) return;
      if (!on) { h.keep = I.array.slice(h.j * 3, (h.j + h.n) * 3); for (var t = 0; t < h.n; t++) { var v = I.array[(h.j + t) * 3]; I.array[(h.j + t) * 3 + 1] = v; I.array[(h.j + t) * 3 + 2] = v; } }
      else if (h.keep) I.array.set(h.keep, h.j * 3);
      I.needsUpdate = true;
    }
  });
  e.gone = !on;
};
/* the saved additions, after the city's own plants and before the bake */
VC.flAddSaved = function () {
  var n = 0; if (typeof SWBAY === 'undefined' || !SWBAY.treeAt) return n;
  VC.FL.add.forEach(function (a) { if (VC.flPlantOne(a)) n++; });
  return n;
};
VC.flPlantOne = function (a) {
  var y = a.y == null ? VC.standY(a.x, a.z) : a.y, gr = function () { return y; };
  if (a.kind === 'tree') { var H = (TUNE.flora.placed.H[a.key]) || null, T = SWBAY.treeAt(a.key, a.x, y, a.z, { H: a.H || (H ? (H[0] + H[1]) / 2 : null), wet: 0.65, ground: gr }); if (T) T.edit = a; return T; }
  var P = SWBAY.plantAt(a.key, a.x, y, a.z, { ground: gr }); if (P) P.edit = a; return P;
};

/* picking: the tree whose trunk-and-crown cylinder, or the plant whose tuft, the ray passes nearest along it */
VC.flPick = function (ray) {
  var o = ray.origin, d = ray.direction, best = null, bt = Infinity;
  VC.FL.list.forEach(function (e) {
    if (e.gone) return;
    var T = e.rec, top = e.kind === 'tree' ? T.H : 1, r = e.kind === 'tree' ? Math.max(1.2, T.crownR * 0.6) : 1.0;
    /* the ray against the vertical axis: the closest approach in the horizontal plane, then the height there */
    var hx = d.x, hz = d.z, hh = hx * hx + hz * hz, t, px, pz, y;
    if (hh < 1e-6) { t = (T.y0 + top - o.y) / d.y; px = o.x - T.x; pz = o.z - T.z; y = T.y0 + top; }   /* looking straight down: the crown's top */
    else { t = ((T.x - o.x) * hx + (T.z - o.z) * hz) / hh; px = o.x + hx * t - T.x; pz = o.z + hz * t - T.z; y = o.y + d.y * t; }
    if (t < 0 || Math.hypot(px, pz) > r || y < T.y0 - 0.5 || y > T.y0 + top + 0.5) return;
    if (t < bt) { bt = t; best = e; }
  });
  return best;
};
VC.flMark = function () {
  var L = VC.FL; if (L.mark) { scene.remove(L.mark); L.mark.geometry.dispose(); L.mark = null; }
  var e = L.sel; if (!e) return VC.flPanel();
  var T = e.rec, h = e.kind === 'tree' ? T.H : 1.2, r = e.kind === 'tree' ? Math.max(1.2, T.crownR * 0.6) : 1;
  L.mark = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(r, r, h, 12, 1).translate(T.x, T.y0 + h / 2, T.z)),
    new THREE.LineBasicMaterial({ color: 0xffd04a, depthTest: false, transparent: true }));
  L.mark.renderOrder = 42; scene.add(L.mark);
  VC.flPanel();
};
VC.flPanel = function () {
  var e = VC.FL.sel, el = $('ed-fl-sel'); if (!el) return;
  el.textContent = e ? 'selected: ' + e.key + ' at ' + e.rec.x.toFixed(1) + ', ' + e.rec.z.toFixed(1) + (e.kind === 'tree' ? ' (' + e.rec.H.toFixed(1) + ' m)' : '') + ' · Delete removes it'
    : 'click a tree or a placed plant to select it';
};
VC.flKeys = function () {
  var t = (SWBAY.SPECIES || []).map(function (S) { return '<option value="tree:' + S.key + '">tree: ' + (S.name || S.key) + '</option>'; });
  var p = (SWBAY.plantKinds || []).map(function (k) { return '<option value="plant:' + k + '">plant: ' + k + '</option>'; });
  return t.concat(p).join('');
};

/* the actions, each with its undo on the editor's stack */
VC.flDelete = function () {
  var E = VC.ED, L = VC.FL, e = L.sel; if (!e || e.gone) return;
  VC.flShow(e, false);
  var a = e.rec.edit, ai = a ? L.add.indexOf(a) : -1, d = null;
  if (ai >= 0) L.add.splice(ai, 1);
  else { d = { kind: e.kind, key: e.key, x: +e.rec.x.toFixed(2), z: +e.rec.z.toFixed(2) }; L.del.push(d); }
  L.sel = null; VC.flMark();
  E.undo.push(function () { VC.flShow(e, true); if (ai >= 0) L.add.splice(ai, 0, a); if (d) L.del.splice(L.del.indexOf(d), 1); });
  VC.edDirty();
};
VC.flPlant = function (ray) {
  var E = VC.ED, L = VC.FL, at = VC.standPick(ray); if (!at) return;
  var v = $('ed-fl-key').value.split(':'), H = +$('ed-fl-h').value || null;
  var a = { kind: v[0], key: v[1], x: +at[0].toFixed(2), z: +at[1].toFixed(2), y: +at[2].toFixed(2) }; if (H && a.kind === 'tree') a.H = H;
  var r = VC.flPlantOne(a); if (!r) return;
  VC.flBake();
  L.add.push(a);
  var e = L.list[L.list.length - 1];
  E.undo.push(function () { if (e && e.rec === r) VC.flShow(e, false); L.add.splice(L.add.indexOf(a), 1); });
  VC.edDirty();
};
VC.flClick = function (ray) {
  if ($('ed-fl-mode').value === 'plant') return VC.flPlant(ray);
  VC.FL.sel = VC.flPick(ray); VC.flMark();
};
VC.flUI = function () {
  if (typeof SWBAY === 'undefined' || !$('ed-fl-key')) return;
  $('ed-fl-key').innerHTML = VC.flKeys(); $('ed-fl-key').value = 'tree:cherry';
  $('ed-fl-del').onclick = VC.flDelete;
  $('ed-fl-mode').onchange = function () { VC.FL.sel = null; VC.flMark(); $('ed-fl-plant').style.display = $('ed-fl-mode').value === 'plant' ? 'inline' : 'none'; };
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || !VC.ED.on || VC.ED.mode !== 'flora') return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && VC.FL.sel) { VC.flDelete(); e.preventDefault(); }
    if (e.key === 'Escape') { VC.FL.sel = null; VC.flMark(); }
  });
  VC.flPanel();
};
