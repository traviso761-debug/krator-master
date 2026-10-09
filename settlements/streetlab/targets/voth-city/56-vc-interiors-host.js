/* ============================== 6b. HOST: THE CANTONS' INTERIORS AND THE CUTAWAY ============================== */
/* [draw] The interiors (40-vc-interiors.js VC.INT) are drawn on demand: the first time a canton is cut away or walked
   into, its shell (floors, walls, ceilings, the core's steps) is drawn as one InstancedMesh of boxes, and its rooms are
   furnished by kits/interiors (furnishRoom over the catalog: IX.catalogAdapter) and drawn instanced, one InstancedMesh
   per piece and part. The room kinds the cantons need and kits/interiors does not have are added to its programs here.

   THE CUTAWAY (owner: "Add cutaway mode to city viewer"): X (or the cutaway button) cuts the canton nearest the view's
   middle open: a section through it at a storey (PageUp/PageDown, or [ and ], step the storey), so its rooms show from
   above. Five clipping planes, intersected, on every material in the scene clip what is above the cut inside the
   canton's square only; the planes are set once and moved, so nothing recompiles as the storey changes. */
VC.INTD = { built: {}, groups: {}, furnished: {}, cut: { on: false, canton: null, storey: 0 }, planes: null, programs: false };

/* ---------------------------------------------------------------- the room kinds the cantons add to kits/interiors */
VC.intPrograms = function () {
  var IX = window.KratorInteriors; if (!IX || VC.INTD.programs) return IX; VC.INTD.programs = true;
  var SEATS = IX.SEAT_TYPES, SURF = IX.SURFACE_GROUP;
  var P = IX.PROGRAMS;
  P.armoury = { require: [{ need: 'racks', types: ['weapon', 'rack'], n: 2 }], optional: [{ types: ['weapon', 'rack'], max: 4 }, { types: ['storage'], max: 2 }, { types: ['workstation'], max: 1 }, { types: ['lamp'], max: 1 }], extra: 5 };
  P.mess = { require: [{ need: 'tables', types: ['table'], n: 2 }, { need: 'seats', types: SEATS, n: 4 }], optional: [{ types: ['table'], max: 2 }, { types: SEATS, max: 6 }, { types: ['storage', 'stack'], max: 2 }, { types: ['lamp', 'brazier'], max: 2 }, SURF], extra: 5 };
  P.office = { require: [{ need: 'desk', types: ['desk'], n: 1 }, { need: 'seat', types: ['chair'], n: 1 }], optional: [{ types: ['shelf', 'storage'], max: 2 }, { types: ['desk', 'table'], max: 1 }, { types: SEATS, max: 2 }, { types: ['lamp'], max: 1 }, { types: ['art', 'banner'], max: 1 }, SURF], extra: 6 };
  P.guildhall = { require: [{ need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: SEATS, n: 4 }], optional: [{ types: ['banner', 'art', 'statue'], max: 3 }, { types: ['shelf', 'storage'], max: 2 }, { types: ['lamp', 'brazier'], max: 2 }, SURF], extra: 6 };
  P.reception = { require: [{ need: 'seats', types: SEATS, n: 3 }, { need: 'table', types: ['table'], n: 1 }], optional: [{ types: ['art', 'banner', 'statue', 'screen'], max: 4 }, { types: ['rug'], max: 1 }, { types: ['lamp'], max: 2 }, SURF], extra: 6 };
  P.bakery = { require: [{ need: 'oven', types: ['stove'], n: 1 }, { need: 'table', types: ['table', 'workstation', 'counter'], n: 1 }, { need: 'food', types: ['storage', 'vessel', 'stack'], roles: IX.FOOD_ROLES, n: 1 }],
               optional: [{ types: ['stove'], max: 1 }, { types: ['storage', 'stack', 'shelf'], max: 3 }, SURF], extra: 5 };
  P.granary = { require: [{ need: 'bins', types: ['storage', 'stack'], n: 3 }], optional: [{ types: ['storage', 'stack'], max: 8 }, { types: ['rack'], max: 1 }], extra: 4 };
  P.warehouse = { require: [{ need: 'goods', types: ['storage', 'stack'], n: 3 }], optional: [{ types: ['storage', 'stack', 'rack', 'shelf'], max: 10 }, { types: ['desk'], max: 1 }], extra: 4 };
  P.training = { require: [{ need: 'dummies', types: ['tool'], n: 2 }, { need: 'racks', types: ['weapon', 'rack'], n: 1 }], optional: [{ types: ['tool'], max: 3 }, { types: ['weapon', 'rack'], max: 2 }, { types: ['bench'], max: 2 }], extra: 8 };
  P.cell = { require: [{ need: 'grate', types: ['screen'], n: 1 }, { need: 'cot', types: ['bed'], n: 1 }], optional: [{ types: ['vessel'], max: 1 }], extra: 30 };
  P.catacomb = { require: [{ need: 'niches', types: ['shelf'], n: 4 }], optional: [{ types: ['shelf'], max: 40 }, { types: ['shrine', 'lamp'], max: 6 }], extra: 6 };
  P.tomb = { require: [{ need: 'sarcophagus', types: ['tomb'], n: 1 }], optional: [{ types: ['tomb'], max: 2 }, { types: ['shelf', 'shrine'], max: 3 }, { types: ['lamp'], max: 1 }], extra: 9 };
  var A = IX.KIND_ALIAS;
  A.armoury = ['barracks', 'smithy', 'shop', 'store']; A.mess = ['hall', 'tavern', 'barracks', 'kitchen']; A.office = ['study']; A.guildhall = ['hall', 'court'];
  A.reception = ['hall', 'antechamber', 'court']; A.bakery = ['kitchen']; A.granary = ['store', 'kitchen']; A.warehouse = ['store', 'shop', 'market'];
  A.training = ['barracks', 'yard', 'court']; A.cell = ['jail', 'barracks', 'dormitory', 'bedroom']; A.catacomb = ['tomb', 'shrine']; A.tomb = ['catacomb', 'shrine'];
  Object.keys(P).forEach(function (k) { if (IX.KIND_WEIGHT[k] == null) IX.KIND_WEIGHT[k] = 1.4; });
  return IX;
};

/* ---------------------------------------------------------------- furnishing a canton's rooms (kits/interiors) */
VC.intFurnish = function (cn) {
  if (VC.INTD.furnished[cn]) return VC.INTD.furnished[cn];
  var IX = VC.intPrograms(), P = VC.INT.cantons[cn], out = { placements: [], rooms: 0, missing: 0, ms: 0 };
  if (!IX || !P || typeof ROOM === 'undefined') return out;
  var t0 = performance.now(), cat = VC.INTD.catalog || (VC.INTD.catalog = IX.catalogAdapter()), T = TUNE.interiors;
  P.rooms.forEach(function (r, i) {
    var poly = [[r.x0 + 0.3, r.z0 + 0.3], [r.x1 - 0.3, r.z0 + 0.3], [r.x1 - 0.3, r.z1 - 0.3], [r.x0 + 0.3, r.z1 - 0.3]];
    var doors = r.door ? [{ at: [CANT.cl(r.door.x, r.x0 + 0.3, r.x1 - 0.3), CANT.cl(r.door.z, r.z0 + 0.3, r.z1 - 0.3)], w: r.door.w, to: 'hall' }] : [];
    try {
      var R = ROOM({ building: 'voth_canton_' + cn.toLowerCase(), kind: r.kind, poly: poly, y: r.y, h: r.h, doors: doors, culture: 'voth', wealth: T.wealth[cn] == null ? 0.5 : T.wealth[cn],
                     id: r.id, seed: KRAND.hash(7401, Math.round(r.x0 * 10), Math.round(r.z0 * 10), r.storey) });
      var plan = furnishRoom(R, cat, { seed: 0, cell: T.cell, backtrack: 6, passes: 2 });
      plan.placements.forEach(function (p) { p.room = r.id; out.placements.push(p); });
      out.missing += (plan.report && plan.report.missing ? plan.report.missing.length : 0); out.rooms++;
    } catch (e) { out.errors = (out.errors || 0) + 1; if (!out.firstError) out.firstError = r.id + ': ' + e.message; }
  });
  out.ms = Math.round(performance.now() - t0);
  return (VC.INTD.furnished[cn] = out);
};

/* ---------------------------------------------------------------- drawing one canton's interior */
VC.intMat = function () {
  if (VC.INTD.mat) return VC.INTD.mat;
  /* a faint warm glow of its own: lamplight, so the rooms read inside the canton's shadow */
  return (VC.INTD.mat = new THREE.MeshStandardMaterial({ roughness: 0.92, emissive: new THREE.Color(0x1c160e), emissiveIntensity: 1 }));
};
VC.drawInterior = function (cn) {
  if (VC.INTD.groups[cn]) return VC.INTD.groups[cn];
  var P = VC.INT.cantons[cn]; if (!P) return null;
  var g = new THREE.Group(); g.userData = { kind: 'interior', canton: cn }; g.visible = false; scene.add(g);
  var M = P.M, tone = new THREE.Color(M.tone), wall = tone.clone().lerp(new THREE.Color(0xc9b58f), 0.4).multiplyScalar(0.82), floor = tone.clone().lerp(new THREE.Color(0x7a5a3e), 0.55), ceil = tone.clone().multiplyScalar(0.5), step = new THREE.Color(0xa79b82);
  /* the boxes, by storey (so the cutaway can hide the storeys above its cut) */
  var byS = {};
  var add = function (si, b, col) { (byS[si] = byS[si] || []).push([b, col]); };
  P.boxes.forEach(function (b) { add(b.storey, [b.x0, b.x1, b.z0, b.z1, b.y0, b.y1], wall); });
  P.floors.forEach(function (f) { add(f.storey, [f.x0, f.x1, f.z0, f.z1, f.y - 0.3, f.y], f.kind === 'hall' || f.kind === 'tunnel' || f.kind === 'passage' ? floor.clone().multiplyScalar(1.1) : floor); });
  (P.ceilings || []).forEach(function (c) { add(c.storey, [c.x0, c.x1, c.z0, c.z1, c.y, c.y + 0.3], ceil); });
  P.flights.forEach(function (f) {
    var n = Math.max(2, Math.round((f.y1 - f.y0) / 0.3)), L = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), u = [(f.b[0] - f.a[0]) / L, (f.b[1] - f.a[1]) / L], alongX = Math.abs(u[0]) > 0.5;
    for (var s = 0; s < n; s++) { var t = (s + 0.5) / n, x = f.a[0] + u[0] * L * t, z = f.a[1] + u[1] * L * t, top = f.y0 + (f.y1 - f.y0) * (s + 1) / n, d = L / n / 2 * 1.02, w = f.w / 2;
      add(f.storey, alongX ? [x - d, x + d, z - w, z + w, f.base, top] : [x - w, x + w, z - d, z + d, f.base, top], step); }
  });
  var geo = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5), m4 = new THREE.Matrix4(), mat = VC.intMat();
  g.userData.storeys = {};
  Object.keys(byS).forEach(function (si) {
    var L = byS[si], IM = new THREE.InstancedMesh(geo, mat, L.length);
    L.forEach(function (e, i) { var b = e[0]; m4.makeScale(Math.max(0.01, b[1] - b[0]), Math.max(0.01, b[5] - b[4]), Math.max(0.01, b[3] - b[2])); m4.setPosition(b[0], b[4], b[2]); IM.setMatrixAt(i, m4); IM.setColorAt(i, e[1]); });
    IM.castShadow = true; IM.receiveShadow = true; IM.userData = { kind: 'interior', canton: cn, storey: +si, probeSkip: true };
    g.add(IM); g.userData.storeys[si] = [IM];
  });
  /* the furniture: kits/interiors' placements, one InstancedMesh per piece (key and variant) and part */
  var F = VC.intFurnish(cn), protos = {};
  F.placements.forEach(function (p) {
    var pk = p.key + '|' + (p.variant || 0), Pr = protos[pk];
    if (!Pr) {
      var fg = buildFurn(p.key, 0, 0, 0, { variant: p.variant || 0, seed: 11, y: 0, wealth: TUNE.interiors.wealth[cn] == null ? 0.5 : TUNE.interiors.wealth[cn] });
      if (!fg || fg.userData.error) { protos[pk] = { bad: true }; if (fg) { scene.remove(fg); var i0 = INSTANCES.indexOf(fg); if (i0 >= 0) INSTANCES.splice(i0, 1); } return; }
      var parts = []; fg.updateMatrixWorld(true);
      var lights = []; fg.traverse(function (o) { if (o.isPointLight) lights.push(o); }); lights.forEach(function (l) { if (l.parent) l.parent.remove(l); });
      fg.traverse(function (o) { if (o.isMesh) parts.push({ geo: o.geometry.clone().applyMatrix4(o.matrixWorld), mat: o.material }); });
      scene.remove(fg); var i1 = INSTANCES.indexOf(fg); if (i1 >= 0) INSTANCES.splice(i1, 1);
      Pr = protos[pk] = { parts: parts, items: [] };
    }
    if (!Pr.bad) Pr.items.push(p);
  });
  var q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3(), storeyOf = {};
  P.rooms.forEach(function (r) { storeyOf[r.id] = r.storey; });
  var nFurn = 0;
  Object.keys(protos).forEach(function (pk) {
    var Pr = protos[pk]; if (Pr.bad || !Pr.items.length) return;
    /* one InstancedMesh per part and storey, so a storey hides as a whole */
    var bySt = {}; Pr.items.forEach(function (p) { var s = storeyOf[p.room] || 0; (bySt[s] = bySt[s] || []).push(p); });
    Object.keys(bySt).forEach(function (si) {
      var items = bySt[si];
      Pr.parts.forEach(function (part) {
        var IM = new THREE.InstancedMesh(part.geo, part.mat, items.length);
        items.forEach(function (p, i) { q.setFromAxisAngle(Y, p.ry || 0); pos.set(p.x, p.y, p.z); m4.compose(pos, q, one); IM.setMatrixAt(i, m4); });
        IM.castShadow = false; IM.receiveShadow = true; IM.userData = { kind: 'furniture', canton: cn, storey: +si, probeSkip: true };
        g.add(IM); (g.userData.storeys[si] = g.userData.storeys[si] || []).push(IM);
      });
      nFurn += items.length;
    });
  });
  g.userData.stats = { boxes: Object.keys(byS).reduce(function (s, k) { return s + byS[k].length; }, 0), furniture: nFurn, rooms: P.rooms.length, furnishMs: F.ms, missing: F.missing, errors: F.errors || 0, firstError: F.firstError || null };
  VC.INTD.groups[cn] = g;
  return g;
};
/* show a canton's interior up to (and including) a storey (null: all of it), or hide it */
VC.showInterior = function (cn, on, upTo) {
  var g = on ? VC.drawInterior(cn) : VC.INTD.groups[cn]; if (!g) return;
  g.visible = !!on;
  if (on) Object.keys(g.userData.storeys).forEach(function (si) { g.userData.storeys[si].forEach(function (m) { m.visible = upTo == null || +si <= upTo; }); });
};

/* ---------------------------------------------------------------- the cutaway */
VC.cutPlanes = function () {
  if (VC.INTD.planes) return VC.INTD.planes;
  var P = VC.INTD.planes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
                            new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];
  renderer.localClippingEnabled = true;
  VC.cutBox(null);
  /* every material in the scene takes the planes, intersected (clipped only where it is above the cut AND inside the box) */
  var seen = new Set();
  scene.traverse(function (o) { var ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(function (m) { if (seen.has(m) || m.isShaderMaterial && !m.clipping) return; seen.add(m); m.clippingPlanes = P; m.clipIntersection = true; m.clipShadows = true; m.needsUpdate = true; }); });
  VC.INTD.clipMats = seen.size;
  return P;
};
/* the box the cut opens: [x0, x1, z0, z1, y] (null: nowhere) */
VC.cutBox = function (b) {
  var P = VC.INTD.planes; if (!P) return;
  if (!b) b = [1e7, 1e7 + 1, 1e7, 1e7 + 1, 1e7];
  P[0].constant = b[4]; P[1].constant = b[0]; P[2].constant = -b[1]; P[3].constant = b[2]; P[4].constant = -b[3];
};
VC.cutTo = function (cn, storey) {
  var C = VC.INTD.cut, P = VC.INT.cantons[cn]; if (!P) return;
  if (C.canton && C.canton !== cn) VC.showInterior(C.canton, false);
  var S = P.storeys[Math.max(0, Math.min(P.storeys.length - 1, storey))];
  C.canton = cn; C.storey = S.i; C.on = true;
  var g = VC.drawInterior(cn); VC.cutPlanes();
  /* furniture made after the planes were set takes them too */
  g.traverse(function (o) { var ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(function (m) { if (m.clippingPlanes !== VC.INTD.planes) { m.clippingPlanes = VC.INTD.planes; m.clipIntersection = true; m.clipShadows = true; m.needsUpdate = true; } }); });
  var M = P.M, r = (M.apron ? M.apron.ro : M.r) + 20;
  VC.cutBox([M.x - r, M.x + r, M.z - r, M.z + r, S.y + TUNE.interiors.cutAt]);
  VC.showInterior(cn, true, S.i);
  var e = $('cut-status'); if (e) e.textContent = cn + ' canton, storey ' + (S.i + 1) + ' of ' + P.storeys.length + ' (floor ' + S.y.toFixed(1) + ' m)' + (g.userData.stats ? ', ' + g.userData.stats.rooms + ' rooms, ' + g.userData.stats.furniture + ' pieces' : '');
};
VC.cutOff = function () {
  var C = VC.INTD.cut; if (C.canton && !VC.INTD.walkIn) VC.showInterior(C.canton, false);
  C.on = false; C.canton = null; VC.cutBox(null);
  var e = $('cut-status'); if (e) e.textContent = '';
};
/* the canton nearest the middle of the view (the orbit's target) */
VC.cutPick = function () {
  var t = ctl.target, best = null, bd = Infinity;
  Object.keys(VC.INT.cantons).forEach(function (cn) { var M = VC.INT.cantons[cn].M, d = Math.hypot(M.x - t.x, M.z - t.z); if (d < bd) { bd = d; best = cn; } });
  return best;
};
VC.cutUI = function () {
  var b = $('ly-cut'); if (!b) return;
  b.onclick = function () { if (VC.INTD.cut.on) VC.cutOff(); else { var cn = VC.cutPick(); if (cn) VC.cutTo(cn, 0); } b.classList.toggle('on', VC.INTD.cut.on); };
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || e.ctrlKey || e.metaKey) return;
    var C = VC.INTD.cut, k = e.key;
    if (k === 'x' || k === 'X') { b.onclick(); e.preventDefault(); }
    else if (C.on && (k === 'PageUp' || k === ']')) { VC.cutTo(C.canton, C.storey + 1); e.preventDefault(); }
    else if (C.on && (k === 'PageDown' || k === '[')) { VC.cutTo(C.canton, C.storey - 1); e.preventDefault(); }
  });
  /* walking into a canton shows its interior (and walking out hides it) */
  (window._frameHooks = window._frameHooks || []).push(function () {
    var A = ctl.walk && VC.walkAt, inside = null;
    if (A) Object.keys(VC.INT.cantons).some(function (cn) {
      var P = VC.INT.cantons[cn], M = P.M; if (CANT.sq(M, A[0], A[1]) > (M.apron ? M.apron.ro : M.r)) return false;
      var lo = P.storeys[0].y - 0.5, hi = P.storeys[P.storeys.length - 1].y + P.storeys[P.storeys.length - 1].h + 1;
      if (A[2] >= lo && A[2] <= hi && P.floors.some(function (f) { return A[0] >= f.x0 && A[0] <= f.x1 && A[1] >= f.z0 && A[1] <= f.z1 && Math.abs(A[2] - f.y) < 3; })) { inside = cn; return true; }
      return false;
    });
    if (inside !== VC.INTD.walkIn) {
      if (VC.INTD.walkIn && VC.INTD.walkIn !== VC.INTD.cut.canton) VC.showInterior(VC.INTD.walkIn, false);
      VC.INTD.walkIn = inside; if (inside) VC.showInterior(inside, true, null);
    }
  });
};
