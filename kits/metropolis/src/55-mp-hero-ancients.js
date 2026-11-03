// ================================================================= METROPOLIS — the Ancients kit's buildings as heroes  [draw]
// MP.heroAncient(A, state) -> a Group: the kit's builder (A.fn, read in place from kits/ancients/src) run once into a group of its own at the
// origin, intact, then the kit's instanced detail (windows, mullions, slabs: KIT, kput) baked into that same group. The kit keeps one
// list of instances for a whole page and bakes it once (its 90-scene.js); here every hero empties the lists first and bakes its own, so
// each hero carries only its own detail and can be cloned like any other. The group is centred on its plan (a builder that draws a second
// building beside the first, as the Library's reading hall or the Reliquary's reactor hut, is off its own origin), and its size is
// measured (`MP.ancientSize`, for the records' footprint and heights). No walk outline yet: these are the kit's shells, not storeys.
// The quality pass (the owner, 2026-11-03: floating or distorted pieces, room for a working plan):
//  - A.scale (46b) scales a building whose storeys are too low for a plan (the Honeycomb Block's 2.3 m) or that the owner wants bigger
//    (the Houses), uniformly, so its proportions hold.
//  - the kit's standing figures (figB, figH) are not baked: they are the kit's showcase people, and scaled they would be giants.
//  - a baked instance above the ground that touches nothing within half a metre is dropped (MP.ancientFloaters): the Crown Library's glass
//    finial stood 55 to 65 m up, 10 m off the crown's axis, over nothing.
MP.ANCIENT_SKIP = ['figB', 'figH'];
MP.heroAncient = function (A, state) {
  const fn = window[A.fn];
  if (typeof fn !== 'function') throw new Error('heroAncient: the Ancients kit has no ' + A.fn + ' on this page (kits/metropolis/build.py ANC_BUILDERS)');
  KIT.order.forEach(n => { KIT.items[n].length = 0; });
  KOFF = [0, 0, 0]; KXF = null;
  const holder = new THREE.Group(), G = new THREE.Group(), sc = A.scale == null ? 1 : A.scale;
  fn(holder, 0, 0, 0);
  MP.ANCIENT_SKIP.forEach(n => { if (KIT.items[n]) KIT.items[n].length = 0; });
  KOFF = [0, 0, 0]; KXF = null; kbake(holder);
  KIT.order.forEach(n => { KIT.items[n].length = 0; });
  const dropped = MP.ancientFloaters(holder, true);
  const seated = A.seat ? MP.ancientSeat(holder, A.seat) : 0;
  holder.scale.setScalar(sc);
  const S = MP.ancientSize(holder);
  holder.position.set(-S.cx, 0, -S.cz); G.add(holder);
  /* storeys and a core (59), from the drawn shape */
  const Fl = MP.floors(G, { sh: A.sh, top: A.height.roof, y0: A.floorsY0, floors: A.floors, maxY: A.floorsMaxY, roof: A.roof }); if (Fl) { G.add(Fl); G.userData.floors = Fl.userData; }
  G.userData.entrances = MP.ancientEntrances(G, A);
  G.name = A.id + '.' + (state == null ? 'intact' : state); G.userData.walk = []; G.userData.size = S; G.userData.dropped = dropped; G.userData.seated = seated;
  return G;
};
/* the kit items a record names (A.seat) that stand off the surface under them: each instance is lowered onto what a ray straight down
   from its foot's middle meets, when that is between 5 cm and 8 m below (the Honeycomb Block's roof units, plateW, stood 1.35 m over
   its roof in the kit's own units). Returns how many moved */
MP.ancientSeat = function (root, names) {
  const g2n = new Map(); KIT.order.forEach(n => g2n.set(KIT.defs[n].geo, n));
  root.updateMatrixWorld(true);
  const meshes = [], rc = new THREE.Raycaster(), m = new THREE.Matrix4(), inv = new THREE.Matrix4(), T = new THREE.Matrix4(); let n = 0;
  root.traverse(o => { if (o.isMesh && !o.isInstancedMesh) meshes.push(o); });
  root.traverse(o => {
    if (!o.isInstancedMesh || names.indexOf(g2n.get(o.geometry)) < 0) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    inv.copy(o.matrixWorld).invert();
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m);
      const b = o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld), c = b.getCenter(new THREE.Vector3());
      rc.set(new THREE.Vector3(c.x, b.min.y - 0.01, c.z), new THREE.Vector3(0, -1, 0)); rc.far = 8;
      const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue;
      const gap = b.min.y - h.point.y; if (gap < 0.05) continue;
      /* the drop in world units, carried into the instanced mesh's own frame */
      const p0 = c.clone().applyMatrix4(inv), p1 = c.clone().setY(c.y - gap).applyMatrix4(inv);
      T.makeTranslation(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z); m.premultiply(T); o.setMatrixAt(i, m); n++;
    }
    o.instanceMatrix.needsUpdate = true;
  });
  return n;
};
/* the pieces of a group: each instance by its box, each plain mesh split into its connected parts (vertices shared by triangles or by
   position) by theirs. The instances above the ground that touch no other piece within `gap` (0.5 m) float; with drop, each is scaled to
   nothing. Returns what floated: [kit item, min x, y, z, size x, y, z] */
MP.ancientFloaters = function (root, drop, gap) {
  const e = gap == null ? 0.5 : gap, boxes = [], v = new THREE.Vector3(), m = new THREE.Matrix4(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  const g2n = new Map(); KIT.order.forEach(n => g2n.set(KIT.defs[n].geo, n));
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const P = o.geometry.attributes.position, I = o.geometry.index;
    if (o.isInstancedMesh) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); boxes.push({ b: o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld), o, i }); }
      return;
    }
    const n = P.count, par = new Int32Array(n);
    for (let i = 0; i < n; i++) par[i] = i;
    const f = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, u = (a, b) => { a = f(a); b = f(b); if (a !== b) par[a] = b; };
    const key = new Map();
    for (let i = 0; i < n; i++) { const k = Math.round(P.getX(i) * 50) + ',' + Math.round(P.getY(i) * 50) + ',' + Math.round(P.getZ(i) * 50), j = key.get(k); if (j == null) key.set(k, i); else u(i, j); }
    const T = I ? I.count : n;
    for (let t = 0; t < T; t += 3) { const a = I ? I.getX(t) : t, b = I ? I.getX(t + 1) : t + 1, c = I ? I.getX(t + 2) : t + 2; u(a, b); u(b, c); }
    const comp = new Map();
    for (let i = 0; i < n; i++) { const r = f(i); let b = comp.get(r); if (!b) { b = new THREE.Box3(); comp.set(r, b); } v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); b.expandByPoint(v); }
    comp.forEach(b => boxes.push({ b, o: null }));
  });
  const out = [];
  boxes.forEach((B, i) => {
    if (!B.o || B.b.min.y < 0.4) return;
    const x = B.b.clone().expandByScalar(e);
    for (let j = 0; j < boxes.length; j++) if (j !== i && x.intersectsBox(boxes[j].b)) return;
    out.push([g2n.get(B.o.geometry) || '?', +B.b.min.x.toFixed(1), +B.b.min.y.toFixed(1), +B.b.min.z.toFixed(1), +(B.b.max.x - B.b.min.x).toFixed(1), +(B.b.max.y - B.b.min.y).toFixed(1), +(B.b.max.z - B.b.min.z).toFixed(1)]);
    if (drop) { B.o.setMatrixAt(B.i, Z); B.o.instanceMatrix.needsUpdate = true; }
  });
  return out;
};
/* the drawn extent: plain meshes by their geometry's box, instanced ones by each instance's box; a dropped (zero-scaled) instance is left out */
MP.ancientSize = function (root) {
  const b = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4();
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (o.isInstancedMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); if (m.determinant() === 0) continue; b.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld)); } return; }
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if (isFinite(bb.min.x)) b.union(bb);
  });
  let tris = 0;
  root.traverse(o => { if (o.isMesh && o.geometry) { const c = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count; tris += c / 3 * (o.isInstancedMesh ? o.count : 1); } });
  return { cx: (b.min.x + b.max.x) / 2, cz: (b.min.z + b.max.z) / 2, w: b.max.x - b.min.x, d: b.max.z - b.min.z, top: b.max.y, tris: Math.round(tris) };
};
/* the entrances (the owner, 2026-11-03: rational entrances on every imported building). A record's `entry`:
   'arch'  the kit's own arches near the ground (archOpen, sill at most 2.6 m; or any height with archAny, as the Redoubt's at the top of its
           ramp) each take a door: bronze posts and head, two glass leaves that part for a walker (MP.doorLeaves), at the arch's sill
   'auto'  no arches: from each side a ray at 1.5 m finds the building; when what it meets is low (a podium), the door goes on the wall that
           stands on the podium, at the podium's height; else on the wall met, at the ground
   'core'  on pilotis: the core's own ground door (MP.floors) is the entrance;  'open': open arcades, no door wanted
   A door standing 0.3 to 3 m over the ground in front of it takes steps down to it (0.17 m risers, 0.3 m treads; higher, the kit's own ramp or
   stair reaches it). At most A.doors (4) of the arches take doors, spread round. Returns the doors. */
MP.ancientEntrances = function (G, A) {
  const mode = A.entry == null ? 'auto' : A.entry;
  if (mode === 'core' || mode === 'open') return [];
  G.updateMatrixWorld(true);
  const ms = [], rc = new THREE.Raycaster(), V = (x, y, z) => new THREE.Vector3(x, y, z), out = [];
  G.traverse(o => { if (o.isMesh && !o.isInstancedMesh && !(o.parent && o.parent.name === 'floors')) ms.push(o); });
  const cast = (p, d, far) => { rc.set(p, d); rc.far = far == null ? 1e4 : far; return rc.intersectObjects(ms, false)[0] || null; };
  if (mode === 'arch' || mode === 'arch+auto') {
    const g2n = new Map(); KIT.order.forEach(n => g2n.set(KIT.defs[n].geo, n));
    const m = new THREE.Matrix4(), inv = new THREE.Matrix4().copy(G.matrixWorld).invert();
    G.traverse(o => {
      if (!o.isInstancedMesh || g2n.get(o.geometry) !== 'archOpen') return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m); if (m.determinant() === 0) continue;
        const b = o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld).applyMatrix4(inv), sx = b.max.x - b.min.x, sz = b.max.z - b.min.z;
        if (!A.archAny && b.min.y > 2.6) continue;
        const c = b.getCenter(V()), thinX = sx < sz, n = thinX ? [Math.sign(c.x) || 1, 0] : [0, Math.sign(c.z) || 1], w = Math.max(sx, sz);
        /* an arch inside the building (a partition's) is no entrance: the way out of it must be clear for 30 m, on one side or the other */
        const clear = q => !cast(V(c.x + q[0] * (thinX ? sx / 2 + 0.3 : 0), b.min.y + 1.2, c.z + q[1] * (thinX ? 0 : sz / 2 + 0.3)), V(q[0], 0, q[1]), 30);
        if (!clear(n)) { const m2 = [-n[0], -n[1]]; if (!clear(m2)) continue; n[0] = m2[0]; n[1] = m2[1]; }
        out.push({ x: thinX ? (n[0] > 0 ? b.max.x : b.min.x) : c.x, z: thinX ? c.z : (n[1] > 0 ? b.max.z : b.min.z), y: Math.max(0, b.min.y), yaw: Math.atan2(n[0], n[1]), w: Math.min(3.3, w - 0.6), h: Math.min(b.max.y - b.min.y - 0.6, 3.2) });
      }
    });
    /* at most A.doors (4) of them, spread round: one from each quarter of the compass, the nearest the quarter's middle */
    const most = A.doors == null ? 4 : A.doors;
    if (out.length > most) {
      const pick = [];
      for (let q = 0; q < most; q++) {
        const mid = -Math.PI + (q + 0.5) * 2 * Math.PI / most, ang = D => Math.atan2(D.z, D.x), dd = D => Math.abs(((ang(D) - mid) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
        const c = out.filter(D => pick.indexOf(D) < 0 && dd(D) < Math.PI / most).sort((a, b) => dd(a) - dd(b))[0]; if (c) pick.push(c);
      }
      out.length = 0; pick.forEach(D => out.push(D));
    }
  }
  if (mode === 'auto' || mode === 'arch+auto') {
    const S = G.userData.size || MP.ancientSize(G), far = Math.max(S.w, S.d) + 20;
    /* a wall, not a column: a ray 1.2 m to one side or the other meets a surface within 1.5 m of the same depth; past a column the ray goes on */
    const wallHit = (x, y, z, d) => {
      let p = V(x, y, z);
      for (let n = 0; n < 8; n++) {
        const h = cast(p, V(-d[0], 0, -d[1])); if (!h) return null;
        const side = [-1, 1].some(k => { const q = cast(V(p.x + d[1] * k * 1.2, y, p.z - d[0] * k * 1.2), V(-d[0], 0, -d[1])); return q && Math.abs(q.distance - h.distance) < 1.5; });
        if (side) return h;
        p = V(h.point.x - d[0] * 0.3, y, h.point.z - d[1] * 0.3);
      }
      return null;
    };
    /* from each side, in lanes 60 m apart along a long building (one lane, through the middle, on a short side) */
    const lanes = L => { const o = []; if (L < 90) return [0]; for (let u = -L / 2 + 25; u <= L / 2 - 25 + 1e-6; u += 60) o.push(u); return o; };
    [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(d => lanes(d[0] ? S.d : S.w).forEach(u => {
      const ox = d[0] ? 0 : u, oz = d[0] ? u : 0, h1 = wallHit(d[0] * far + ox, 1.5, d[1] * far + oz, d); if (!h1) return;
      /* what the ray met: its top just inside; a podium (a deck to stand on) when it is under 6 m */
      const top = cast(V(h1.point.x - d[0], 80, h1.point.z - d[1]), V(0, -1, 0)), ty = top ? top.point.y : 0;
      let p = h1.point, y = 0;
      /* on a podium, the wall that stands on it: straight on, else the nearest along the podium's edge (the Crown Library's crown stands off
         its plinth's middle), sweeping 5 m at a time up to 30 m either side */
      if (ty < 6) {
        let h2 = null;
        for (let o = 0; o <= 30 && !h2; o += 5) for (const sg of o ? [-1, 1] : [1]) { const q = wallHit(h1.point.x - d[0] * 0.5 + d[1] * sg * o, ty + 1.5, h1.point.z - d[1] * 0.5 - d[0] * sg * o, d); if (q && (!h2 || q.distance < h2.distance)) h2 = q; }
        if (!h2) return; p = h2.point; y = ty;
      }
      if (out.some(D => Math.hypot(D.x - p.x, D.z - p.z) < 6)) return;
      out.push({ x: p.x + d[0] * 0.05, z: p.z + d[1] * 0.05, y, yaw: Math.atan2(d[0], d[1]), w: 3.3, h: 2.9 });
    }));
  }
  if (!out.length) return out;
  const B = MP.builder(false);
  out.forEach(D => {
    const s = Math.sin(D.yaw), c = Math.cos(D.yaw), hw = D.w / 2;
    [-1, 1].forEach(k => B.obox('bronze', D.x + c * k * (hw + 0.12), D.y + D.h / 2, D.z - s * k * (hw + 0.12), D.yaw, 0.24, D.h, 0.3, { uv: 2 }));
    B.obox('bronze', D.x, D.y + D.h + 0.15, D.z, D.yaw, D.w + 0.48, 0.3, 0.3, { uv: 2 });
    /* steps down to the ground in front, when the sill stands over it */
    const g = cast(V(D.x + s * 1.2, D.y + 0.5, D.z + c * 1.2), V(0, -1, 0), 40), gy = g ? g.point.y : 0, rise = D.y - gy;
    if (rise > 0.3 && rise <= 3) { const n = Math.ceil(rise / 0.17), r = rise / n; for (let q = 0; q < n; q++) { const o = 0.15 + (q + 0.5) * 0.3; const ht = rise - q * r; B.obox('concrete', D.x + s * o, gy + ht / 2, D.z + c * o, D.yaw, D.w + 0.8, ht, 0.3, { uv: 2 }); } D.steps = n; }
  });
  const H = B.finish({ id: A.id }, 'entrances'); H.children.forEach(m => { m.name = 'entrance'; G.add(m); });
  MP.doorLeaves(G, out.map(D => ({ x: D.x, z: D.z, y: D.y, yaw: D.yaw, w: D.w, h: D.h })));
  return out;
};
