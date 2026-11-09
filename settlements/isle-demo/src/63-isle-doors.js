/* ============================== 4d. THE DOORS: the Vernacular's leaves on core/door ============================== */
/* [web] TODO.md "Doors and glass": the city page took the Iziz Vernacular's openings (kits/iziz-vernacular 69e5, in the IZV
   bundle) but hosted no doors: every leaf was baked shut into its piece, and each piece built left its doors' records in
   KDOOR at the origin, where they meant nothing. Now (2026-11-09; Verge's 95-verge-doors.js and Highlands' 95-hl-doors.js
   are the pattern):
   - the pieces are built with their doors handed out (DRAW.doors: 58's isleProto passes IZV.proto o.doors): each Vernacular
     piece's door is a template in the piece's frame (P.doors) and its leaves are not in the piece's parts;
   - each lot drawn in full (60's DRAW.nearSet) registers its piece's doors in KDOOR, in the world, under a stable id: the
     lot's id and the door's number in the piece ('Kautoa.<lot>.d<n>'), so a save, a quest or an NPC names the same door
     every time the lot is drawn. A record stays when its lot leaves the near set (its state with it); only its leaves go;
   - the near doors' leaves are drawn here, one InstancedMesh per leaf style and part (core/door's KDOORLEAF: the frame in
     the kit's wood, tinted as the kit tinted it, the glass KGLASS 'clear', the hardware brass), each door handed to
     KDOORHOST.instanced, which poses its leaves as KDOOR eases it (IDOORS.frame, from 98's loop);
   - E opens or shuts the unlocked door nearest the view's target (the ground point the camera orbits), within 3 m; the
     "E: open the door" tip shows near one.
   What it does not do: the Vernacular's pieces are drawn with solid bodies here (no interiors on the city page), so the kit
   locks every door it draws on one (69e5: a door on a solid body is shut and locked) and only its gates and the doors it
   leaves unlocked open; the page has no core/walk (the camera orbits, nobody walks), so no door has walk blocks
   (KDOOR.walk is not called). The Islanders' and the Beast Riders' pieces keep their own doors (ISK fixtures; the ports'
   leaves drawn shut: kits/beast-riders KNOWN_ISSUES.md).
   window._doors -> {host, doors, locked, posed, lots, styles, leaves}; IDOORS.check() is verify.py's door case. */
var IDOORS = { on: typeof KDOOR !== 'undefined' && typeof KDOORHOST !== 'undefined' && typeof KDOORLEAF !== 'undefined' && typeof IZV !== 'undefined',
  lots: {}, meshes: [], last: 0, mats: null };
if (IDOORS.on) DRAW.doors = true;   /* before any piece is built: 58's cache reads it */
/* a template (the piece's frame) to the world, under the lot's placement as 60's DRAW.matOf draws it (rotation about y, then
   the lot's position) */
IDOORS.place = function (L, T, n) {
  var c = Math.cos(L.ry), s = Math.sin(L.ry), W = function (p) { return [L.x + p[0] * c + p[2] * s, L.y + p[1], L.z - p[0] * s + p[2] * c]; };
  return KDOOR.add({ id: (L.id || L.tag || 'lot') + '.d' + n, at: W(T.at), hinge: W(T.hinge), p0: W(T.p0), yaw: T.yaw + L.ry, sign: T.sign,
    w: T.w, h: T.h, t: T.t, locked: T.locked, kind: T.kind, pair: T.pair, both: T.both, spring: T.spring, swing: T.swing, roll: T.roll,
    walk: T.walk, style: T.style, drop: T.drop, rise: T.rise, rate: T.rate, key: L.key, lot: L.id || null, col: T.col, name: 'door' });
};
IDOORS.materials = function () {
  if (IDOORS.mats) return IDOORS.mats;
  var M = IZV.MAT || {}, wood = M.wood ? M.wood.clone() : new THREE.MeshLambertMaterial({ color: 0xffffff });
  if (M.wood && M.wood.onBeforeCompile) wood.onBeforeCompile = M.wood.onBeforeCompile;   /* Material.copy drops the hook (30-kit.js kbake) */
  return (IDOORS.mats = { frame: wood, glass: M.izGlass || KGLASS.material(THREE, 'clear'),
    hw: M.izBrass || new THREE.MeshStandardMaterial({ color: 0xb8913f, roughness: 0.32, metalness: 0.85 }) });
};
/* the near set changed (60 rebuilt it): register the new lots' doors, then draw every near door's leaves afresh */
IDOORS.sync = function () {
  if (!IDOORS.on) return;
  IDOORS.meshes.forEach(function (m) { scene.remove(m); m.dispose(); }); IDOORS.meshes = [];
  KDOOR.list.forEach(function (D) { if (D.lot !== undefined) D.draw = null; });   /* a far door keeps its record, not its leaves */
  var near = [];
  (DRAW.nearSet || []).forEach(function (L) {
    if (L.kit !== 'izv' || L.vacant || L.cls === 'wall') return;   /* a wall run is drawn stretched (60: sx): its doors are not hosted */
    var P = DRAW.proto(L.kit, L.key, L.v); if (!P || !P.doors || !P.doors.length) return;
    var id = L.id || L.tag || 'lot', rec = IDOORS.lots[id];
    if (!rec) rec = IDOORS.lots[id] = P.doors.map(function (T, n) { var D = KDOOR.get(id + '.d' + n); return D || IDOORS.place(L, T, n); });
    near.push.apply(near, rec);
  });
  var by = {}, mats = IDOORS.materials();
  near.forEach(function (D) { var st = D.style || 'flat'; (by[st] || (by[st] = { doors: [], n: 0 })).doors.push(D); by[st].n += KDOOR.leafCount(D); });
  var q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color(), leaves = 0;
  for (var st in by) {
    var B = by[st], ms = KDOORLEAF.meshes(THREE, st, mats, Math.max(1, B.n)), i = 0;
    B.doors.forEach(function (D) {
      var idx = []; for (var k = KDOOR.leafCount(D); k > 0; k--) { ms[0].setColorAt(i, col.setHex(D.col == null ? 0xffffff : D.col)); idx.push(i++); }
      KDOORHOST.instanced(D, ms, idx, q.setFromAxisAngle(up, D.yaw)); KDOORHOST.pose(D);
    });
    ms.forEach(function (m) { m.count = i; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.userData.isleDoors = st; scene.add(m); IDOORS.meshes.push(m); });
    leaves += i;
  }
  KDOORHOST.tick(0);   /* flush the poses' matrices */
  var all = KDOOR.list.filter(function (D) { return D.lot !== undefined; });
  window._doors = { host: true, doors: all.length, locked: all.filter(function (D) { return D.locked; }).length, near: near.length,
    posed: near.filter(function (D) { return !!D.draw; }).length, lots: Object.keys(IDOORS.lots).length, leaves: leaves,
    styles: all.reduce(function (o, D) { var k = D.style || 'flat'; o[k] = (o[k] || 0) + 1; return o; }, {}) };
};
/* 98's loop: ease the doors, pose the moved leaves; the tip */
IDOORS.at = function () { return { x: CAM.t[0], y: CAM.t[1] + 1.2, z: CAM.t[2] }; };
IDOORS.frame = function (now) {
  if (!IDOORS.on) return;
  var dt = IDOORS.last ? Math.min(0.1, (now - IDOORS.last) / 1000) : 0; IDOORS.last = now;
  KDOORHOST.tick(dt); if (IDOORS.tip) IDOORS.tip();
};
if (IDOORS.on) {
  IDOORS.near0 = DRAW.near;
  DRAW.near = function (at, force) { var was = DRAW.at; IDOORS.near0(at, force); if (DRAW.at !== was) IDOORS.sync(); };
  addEventListener('keydown', function (e) {
    if (e.key !== 'e' && e.key !== 'E') return; var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (typeof CAM !== 'undefined' && KDOORHOST.toggleNear(IDOORS.at(), false)) e.preventDefault();
  });
  setTimeout(function () { if (typeof CAM !== 'undefined') IDOORS.tip = KDOORHOST.tip(IDOORS.at, function () { return false; }); }, 0);
}
/* verify.py's case: the near doors are registered in the world (each within its lot's footprint, grown 1 m), every one posed
   in a leaf mesh, ids stable (the near set drawn again registers nothing new); an unlocked one opens (its leaves move)
   and shuts; a locked one does not open. neg 'origin': the records placed as the piece's frame (the bug this fixes) */
IDOORS.check = function (neg) {
  if (!IDOORS.on || !window._doors) return { ok: false, detail: 'no door host' };
  var near = [], bad = [], n0, gather = function () { near = []; for (var id in IDOORS.lots) IDOORS.lots[id].forEach(function (D) { if (D.draw) near.push(D); }); };
  gather();
  if (!near.length) {   /* none near the view: go to the first Vernacular lot of the town (Valapo's overview has none in reach) */
    var V = (DRAW.recs || []).filter(function (L) { return L.kit === 'izv' && !L.vacant && L.cls !== 'wall'; });
    if (!V.length) return { ok: neg !== 'origin', detail: 'no Vernacular piece in this town: no doors to host' };
    CAM.t = [V[0].x, 0, V[0].z]; DRAW.at = null; DRAW.near([CAM.t[0], CAM.t[2]], true); gather();
  }
  n0 = KDOOR.list.length;
  if (!near.length) return { ok: false, detail: window._doors.doors + ' doors, none near a Vernacular lot' };
  var lotOf = {}; (DRAW.nearSet || []).forEach(function (L) { lotOf[L.id] = L; });
  near.forEach(function (D) {
    var L = lotOf[D.lot], at = neg === 'origin' ? [D.at[0] - (L ? L.x : 0), D.at[1], D.at[2] - (L ? L.z : 0)] : D.at; if (!L) { bad.push(D.id + ': no lot'); return; }
    var dx = at[0] - L.x, dz = at[2] - L.z, c = Math.cos(L.ry), s = Math.sin(L.ry), lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) > L.w / 2 + 1 || Math.abs(lz) > L.d / 2 + 1) bad.push(D.id + ' off its lot (' + lx.toFixed(1) + ', ' + lz.toFixed(1) + ')');
  });
  DRAW.at = null; DRAW.near([CAM.t[0], CAM.t[2]], true);
  var again = KDOOR.list.length === n0;
  var m4 = new THREE.Matrix4(), moved = null, lockedHeld = null, M = function (D) { var g = D.draw, im = g && g.ims[0]; if (!im) return null; im.getMatrixAt(g.idx[0], m4); return m4.elements.slice(); };
  var un = near.filter(function (D) { return !D.locked && D.draw; })[0], lk = near.filter(function (D) { return D.locked && D.draw; })[0];
  if (un) { var a0 = M(un); KDOOR.open(un, { by: 'verify' }); for (var i = 0; i < 40; i++) KDOORHOST.tick(0.1); var a1 = M(un), op = un.open === 1;
    KDOOR.close(un); for (i = 0; i < 40; i++) KDOORHOST.tick(0.1); var a2 = M(un);
    moved = op && un.open === 0 && a0 && a1 && a2 && a1.some(function (v, k) { return Math.abs(v - a0[k]) > 1e-3; }) && a2.every(function (v, k) { return Math.abs(v - a0[k]) < 1e-4; }); }
  if (lk) { KDOOR.open(lk, { by: 'verify' }); for (i = 0; i < 20; i++) KDOORHOST.tick(0.1); lockedHeld = lk.open === 0 && lk.target === 0; }
  var ok = !bad.length && again && near.every(function (D) { return !!D.draw; }) && moved !== false && lockedHeld !== false && (un || lk);
  var d = window._doors;
  return { ok: !!ok, detail: d.doors + ' doors registered (' + d.locked + ' locked as the kit drew them) on ' + d.lots + ' lots, ' + near.length + ' near, ' + d.leaves +
    ' leaves posed (' + JSON.stringify(d.styles) + ')' + (bad.length ? '; OFF THEIR LOTS ' + bad.length + ': ' + bad.slice(0, 4).join('; ') : '; every one on its lot') +
    (again ? '; ids stable' : '; NEW RECORDS on a redraw') + (un ? '; an unlocked door ' + (moved ? 'opened and shut' : 'DID NOT open and shut') : '; no unlocked door near') +
    (lk ? '; a locked one ' + (lockedHeld ? 'held' : 'OPENED') : '') };
};
