/* ======================== Ancients interiors: the hall recipes ========================
   The arcology's big rooms are not left to the placer: a hall is a recipe that sets its pieces out the way a ship
   would (refectory rows with an aisle, beds in ranks with paths, consoles in an arc along the glass). A recipe works
   in the room's own frame: origin at the floor's centre, x across (the width w), z along the depth d, +z the door
   side (the door is at (0, d/2) unless the recipe says otherwise), y up from the floor. It names roles, the dress
   (20-ai-dress.js) gives the keys, and the catalog adapter gives each piece's size.

     AI.recipe(name, { w, d, h, dress, seed }, cat) -> {
       name, kind, dress, w, d, h, outdoor, door: { x, z, w } | null,
       placements: [{ key, v, x, y, z, ry, role, flat, on }],   y from the floor; ry turns the piece's +z (its front)
       reserved: [{ x0, x1, z0, z1, what }],                    floor the host fills itself (the engines)
       skipped: [{ role, why }], missing: [role] }               what did not fit; roles whose key the catalog lacks

   Every put is FIT OR SKIP: a piece that would leave the room, stand in another, in the door's way or on reserved
   floor is skipped, not forced, so a recipe works at any size; AI.audit (40-ai-audit.js) checks the result again.
   `flat` pieces (rugs) are walked on and may lie under others; `on` is the index of the piece a surface piece
   stands on.
   ====================================================================== */
(function (AI) {
  'use strict';
  const PI = Math.PI, TAU = 2 * PI;
  const DOOR_DEPTH = 1.4, TOL = 0.02;

  /* ---------- geometry: a piece's footprint as an oriented box, as the catalog turns it (F.box's toWorld) */
  function corners(x, z, w, d, ry) {
    const c = Math.cos(ry), s = Math.sin(ry), out = [];
    for (const [lx, lz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) out.push([x + lx * c + lz * s, z - lx * s + lz * c]);
    return out;
  }
  function project(P, ax) { let lo = Infinity, hi = -Infinity; for (const p of P) { const t = p[0] * ax[0] + p[1] * ax[1]; if (t < lo) lo = t; if (t > hi) hi = t; } return [lo, hi]; }
  /* separating axes: two convex quads overlap (by more than eps) unless some edge normal separates them */
  function overlap(A, B, eps) {
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], ax = [q[1] - p[1], p[0] - q[0]], l = Math.hypot(ax[0], ax[1]) || 1;
      ax[0] /= l; ax[1] /= l;
      const a = project(A, ax), b = project(B, ax);
      if (a[1] <= b[0] + eps || b[1] <= a[0] + eps) return false;
    }
    return true;
  }
  function rectQuad(x0, x1, z0, z1) { return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; }
  function yOverlap(a, b) { return a.y < b.y + b.h - 1e-3 && b.y < a.y + a.h - 1e-3; }
  AI._geo = { corners, overlap, rectQuad, yOverlap };

  /* ---------- a seeded random (mulberry32), so a recipe is deterministic per seed */
  function rng(seed) { let a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- the context a recipe builds with */
  function context(R, o, cat) {
    const D = AI.dress(o.dress), w = o.w || R.w, d = o.d || R.d, h = o.h || R.h || 3.2;
    const known = {};
    for (const e of cat.list()) known[e.key] = true;
    const res = { name: R.name, kind: R.kind, dress: o.dress || 'ancient', w, d, h, outdoor: !!R.outdoor,
      door: R.outdoor || R.door === null ? null : Object.assign({ x: 0, z: d / 2, w: 1.6 }, R.door || {}),
      placements: [], reserved: [], skipped: [], missing: [] };
    const solid = [];   /* {quad, y, h} of every non-flat piece placed, and the reserved floor */
    const keyOf = role => D[role];
    function dims(role, v) {
      const key = keyOf(role);
      if (!key) return null;
      if (!known[key]) { if (res.missing.indexOf(role) < 0) res.missing.push(role); return null; }
      return cat.dims(key, v | 0);
    }
    function doorQuad() { const dr = res.door; return dr ? rectQuad(dr.x - dr.w / 2 - 0.2, dr.x + dr.w / 2 + 0.2, d / 2 - DOOR_DEPTH, d / 2 + 1) : null; }
    /* put a role's piece centred at (x, z) facing ry; o: { v, y (else the anchor's height), flat, on (a placement index) } */
    function put(role, x, z, ry, po) {
      po = po || {};
      const key = keyOf(role);
      if (!key) return null;
      const v = po.v | 0, dm = dims(role, v);
      if (!dm) return null;
      let y = po.y;
      if (y == null) y = cat.anchorY(key, v, { floorY: 0, ceilingY: h, surfaceY: po.on != null ? res.placements[po.on].y + res.placements[po.on].h : null });
      const q = corners(x, z, dm.w, dm.d, ry || 0), me = { y, h: dm.h };
      for (const p of q) if (Math.abs(p[0]) > w / 2 + TOL || Math.abs(p[1]) > d / 2 + TOL) { res.skipped.push({ role, why: 'outside' }); return null; }
      if (!po.flat) {
        const dq = doorQuad();
        if (dq && y < 2.0 && overlap(q, dq, 0.01)) { res.skipped.push({ role, why: 'door' }); return null; }
        for (const s of solid) if (s.idx !== po.on && yOverlap(me, s) && overlap(q, s.quad, 0.01)) { res.skipped.push({ role, why: s.what ? 'reserved ' + s.what : 'overlap ' + s.role }); return null; }
      }
      const idx = res.placements.length;
      res.placements.push({ key, v, x: +x.toFixed(3), y: +y.toFixed(3), z: +z.toFixed(3), ry: +(ry || 0).toFixed(4), role, h: dm.h, flat: !!po.flat, on: po.on == null ? null : po.on });
      if (!po.flat) solid.push({ quad: q, y, h: dm.h, role, idx });
      return idx;
    }
    /* against a wall: side 'back' (-z), 'front' (+z), 'left' (-x), 'right' (+x); u is the position along it, off the
       piece's back by `gap` */
    function wall(role, side, u, po) {
      po = po || {};
      const dm = dims(role, po.v);
      if (!dm) return null;
      const g = (po.gap || 0.04) + dm.d / 2;
      if (side === 'back') return put(role, u, -d / 2 + g, 0, po);
      if (side === 'front') return put(role, u, d / 2 - g, PI, po);
      if (side === 'left') return put(role, -w / 2 + g, u, PI / 2, po);
      return put(role, w / 2 - g, u, -PI / 2, po);
    }
    /* as many as fit along a wall between u0 and u1, `gap` apart */
    function wallRow(role, side, u0, u1, po) {
      po = po || {};
      const dm = dims(role, po.v);
      if (!dm) return [];
      const step = dm.w + (po.space == null ? 0.4 : po.space), n = Math.max(0, Math.floor((u1 - u0 + (po.space || 0.4)) / step)), out = [];
      const start = (u0 + u1) / 2 - (n - 1) * step / 2;
      for (let i = 0; i < n; i++) { const r = wall(role, side, start + i * step, Object.assign({}, po, { v: po.vf ? po.vf(i) : po.v })); if (r != null) out.push(r); }
      return out;
    }
    function reserve(x0, x1, z0, z1, what) { res.reserved.push({ x0, x1, z0, z1, what }); solid.push({ quad: rectQuad(x0, x1, z0, z1), y: 0, h: h, what, idx: -1 }); }
    return { w, d, h, PI, TAU, res, dims, put, wall, wallRow, reserve, rnd: rng(o.seed || 1), dress: D };
  }

  /* ---------- shared layouts */
  /* refectory rows: tables along x in two blocks either side of a centre aisle, a bench either side of each, a lamp
     over each; rows from z0 to z1 */
  function refectory(c, z0, z1, o) {
    o = o || {};
    const T = c.dims('table', o.tv), B = c.dims('bench', o.bv);
    if (!T || !B) return 0;
    const rowD = T.d + 2 * (B.d + 0.12), pitch = rowD + (o.walk || 1.1), aisle = o.aisle || 1.0;
    const span = c.w / 2 - 0.7 - aisle, n = Math.max(1, Math.floor((span + 0.7) / (T.w + 0.7)));
    let made = 0;
    for (let z = z0 + rowD / 2; z + rowD / 2 <= z1 + 1e-6; z += pitch)
      for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
        const x = s * (aisle + T.w / 2 + i * (T.w + 0.7));
        if (c.put('table', x, z, 0, { v: o.tv }) == null) continue;
        made++;
        c.put('bench', x, z - T.d / 2 - 0.12 - B.d / 2, 0, { v: o.bv });
        c.put('bench', x, z + T.d / 2 + 0.12 + B.d / 2, PI, { v: o.bv });
        c.put('ceilingLamp', x, z, 0, { v: o.lv });
      }
    return made;
  }
  /* a lounge group: a rug, a low table on it, a divan either side facing it */
  function lounge(c, x, z) {
    const L = c.dims('lowTable'), V = c.dims('divan');
    c.put('rug', x, z, 0, { flat: true });
    if (!L || !V) return;
    c.put('lowTable', x, z, 0);
    const off = L.d / 2 + 0.35 + V.d / 2;
    c.put('divan', x, z - off, 0);
    c.put('divan', x, z + off, PI);
  }

  /* ---------- the recipes: default size, kind, and the layout */
  AI.RECIPES = {
    'crew-mess': { name: 'Crew mess', kind: 'mess', w: 20, d: 14, h: 3.2, min: { table: 6, bench: 12 }, build(c) {
      const S = c.wall('servery', 'back', -c.w / 4), K = c.wall('stove', 'back', c.w / 4);
      const back = Math.max(c.dims('servery') ? c.dims('servery').d : 0, c.dims('stove') ? c.dims('stove').d : 0) + 1.4;
      refectory(c, -c.d / 2 + back, c.d / 2 - DOOR_DEPTH - 0.6);
      for (const s of [-1, 1]) { c.wall('water', 'back', s * (c.w / 2 - 0.9)); c.wall('barrel', 'front', s * (c.w / 2 - 0.7)); }
      return S != null && K != null;
    } },
    'dining-hall': { name: 'Grand dining hall', kind: 'dining', w: 26, d: 18, h: 3.6, min: { table: 8, headTable: 1, banner: 2 }, build(c) {
      /* the head table across the back, facing the hall, the officers' chairs behind it; banners over it */
      const H = c.dims('headTable', 1);
      if (H) {
        const z = -c.d / 2 + 1.2 + H.d / 2;
        for (const s of [-1, 1]) {
          const t = c.put('headTable', s * (H.w / 2 + 0.3), z, 0, { v: 1 });
          if (t == null) continue;
          for (const k of [-1, 0, 1]) c.put('chair', s * (H.w / 2 + 0.3) + k * H.w / 3.2, z - H.d / 2 - 0.35, 0);
        }
      }
      for (const s of [-1, 1]) c.wall('banner', 'back', s * (c.w / 2 - 3.5));
      c.wall('servery', 'left', 0); c.wall('stove', 'right', 0);
      refectory(c, -c.d / 2 + (H ? H.d : 1) + 3.2, c.d / 2 - DOOR_DEPTH - 0.6, { aisle: 1.4 });
      for (const s of [-1, 1]) c.wall('lampStem', 'front', s * (c.w / 2 - 0.8));
      return true;
    } },
    'greenhouse': { name: 'Greenhouse', kind: 'greenhouse', w: 22, d: 14, h: 4.2, min: { bed: 12 }, build(c) {
      const B = c.dims('bed');
      if (!B) return false;
      const px = B.w + 0.9, pz = B.d + 1.0;
      let i = 0;
      for (let z = -c.d / 2 + 0.8 + B.d / 2; z + B.d / 2 <= c.d / 2 - DOOR_DEPTH - 0.4; z += pz, i++)
        for (const s of [-1, 1]) for (let j = 0; ; j++) {
          const x = s * (0.9 + B.w / 2 + j * px);
          if (Math.abs(x) + B.w / 2 > c.w / 2 - 0.6) break;
          c.put('bed', x, z, 0, { v: (i + j + (s > 0 ? 1 : 0)) % 3 });
        }
      for (const s of [-1, 1]) c.put('water', s * (c.w / 2 - 0.75), c.d / 2 - 0.75, 0);
      c.put('scarecrow', 0, -c.d / 2 + 1.2, PI / 2);
      c.wall('coldFrame', 'front', -c.w / 4);
      c.wall('bench', 'front', c.w / 4);
      return true;
    } },
    'engine-room': { name: 'Engine room', kind: 'engine', w: 24, d: 16, h: 4.4, min: { control: 2, workbench: 1 }, build(c) {
      /* the engines are the host's: the middle of the room from the back, kept clear */
      const ew = c.w * 0.42;
      c.reserve(-ew / 2, ew / 2, -c.d / 2 + 0.8, c.d / 2 - 5.2, 'engines');
      for (const s of [-1, 1]) c.put('control', s * 1.4, c.d / 2 - 3.6, PI);
      c.wallRow('workbench', 'left', -c.d / 2 + 1, c.d / 2 - 2.5, { space: 1.2 });
      c.wallRow('toolRack', 'right', -c.d / 2 + 1, 0, { space: 0.8 });
      for (const s of [-1, 1]) c.wall('rack', 'back', s * (c.w / 2 - 2.0));
      c.put('drums', c.w / 2 - 2.0, c.d / 2 - 2.0, -PI / 2);
      c.put('drum', -c.w / 2 + 0.9, c.d / 2 - 0.9, 0); c.put('drum', -c.w / 2 + 1.7, c.d / 2 - 0.9, 0);
      for (const s of [-1, 1]) for (const z of [-c.d / 4, c.d / 4]) c.put('ceilingLamp', s * (ew / 2 + 2.2), z, 0);
      return true;
    } },
    'bridge': { name: 'Bridge', kind: 'bridge', w: 20, d: 13, h: 3.9, min: { station: 3, console: 3, helm: 1 }, build(c) {
      /* the glass is the back wall (-z): consoles in an arc along it, seats behind, the helm in the middle on a carpet,
         the chart table by the door */
      const zc = c.d / 2 - 1.0, R = c.d - 2.6;
      for (let i = -3; i <= 3; i++) {
        const a = i * 0.19, role = i % 2 ? 'station' : 'console';
        c.put(role, R * Math.sin(a), zc - R * Math.cos(a), PI - a);
      }
      for (let i = -2; i <= 2; i++) { const a = i * 0.22, r = R - 2.0; c.put('chair', r * Math.sin(a), zc - r * Math.cos(a), PI - a); }
      c.put('rug', 0, -c.d / 2 + 5.8, 0, { flat: true });
      c.put('helm', 0, -c.d / 2 + 5.8, PI);
      const T = c.put('headTable', -c.w / 2 + 2.4, c.d / 2 - 2.6, PI / 2, { v: 1 });
      if (T != null) { c.put('books', -c.w / 2 + 2.4, c.d / 2 - 2.6, PI / 2, { on: T }); for (const k of [-1, 1]) c.put('chair', -c.w / 2 + 2.4 + k * 1.2, c.d / 2 - 2.6, k > 0 ? -PI / 2 : PI / 2); }
      for (const z of [-c.d / 4, c.d / 4]) { c.wall('hanging', 'left', z - 1.5); c.wall('hanging', 'right', z); }
      const Dk = c.wall('desk', 'right', c.d / 2 - 2.4);
      if (Dk != null) c.put('radio', c.res.placements[Dk].x, c.res.placements[Dk].z, -PI / 2, { on: Dk });
      return true;
    } },
    'officers-hall': { name: "Officers' hall", kind: 'hall', w: 18, d: 14, h: 3.4, min: { divan: 6, bookcase: 2 }, build(c) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) lounge(c, sx * c.w / 4.2, sz * c.d / 5 - 0.6);
      c.wallRow('bookcase', 'back', -c.w / 2 + 1, -2.5); c.wallRow('bookcase', 'back', 2.5, c.w / 2 - 1);
      c.wall('statue', 'back', 0, { gap: 0.4 });
      for (const sx of [-1, 1]) { c.wall('banner', sx < 0 ? 'left' : 'right', 0); c.put('lampStem', sx * (c.w / 2 - 0.7), c.d / 2 - 0.7, 0); }
      return true;
    } },
    'chart-deck': { name: 'Chart deck', kind: 'chartroom', w: 16, d: 12, h: 3.2, min: { headTable: 2, bookcase: 4 }, build(c) {
      for (const x of [-c.w / 4, c.w / 4]) {
        const T = c.put('headTable', x, -0.4, 0, { v: 1 });
        if (T == null) continue;
        c.put('books', x - 0.3, -0.4, 0, { on: T });
        for (const s of [-1, 1]) c.put('chair', x + s * 0.9, 0.9, PI);
      }
      c.wallRow('bookcase', 'left', -c.d / 2 + 0.8, c.d / 2 - 2); c.wallRow('bookcase', 'right', -c.d / 2 + 0.8, c.d / 2 - 2);
      const Dk = c.wall('desk', 'back', 0);
      if (Dk != null) { c.put('radio', 0, c.res.placements[Dk].z, 0, { on: Dk }); c.put('chair', 0, c.res.placements[Dk].z + 1.1, PI); }
      for (const s of [-1, 1]) c.put('lampStem', s * (c.w / 2 - 2.6), -c.d / 2 + 0.7, 0);
      return true;
    } },
    'chain-locker': { name: 'Chain locker', kind: 'chainlocker', w: 10, d: 8, h: 3.4, min: { chain: 2, anchor: 1 }, build(c) {
      for (const s of [-1, 1]) c.put('chain', s * c.w / 4, -0.4, c.rnd() * TAU);
      c.wall('anchor', 'back', 0, { gap: 0.3 });
      c.put('lampStem', -c.w / 2 + 0.7, c.d / 2 - 0.7, 0);
      c.wall('crate', 'front', c.w / 2 - 1.2); c.wall('crate', 'front', c.w / 2 - 2.0, { v: 2 });
      c.wall('drum', 'right', -c.d / 2 + 0.8);
      return true;
    } },
    'store-hall': { name: 'Store hall', kind: 'store', w: 24, d: 16, h: 3.4, min: { drums: 2, pallet: 4 }, build(c) {
      const roles = ['drums', 'pallet', 'crate', 'sacks', 'barrel', 'pallet'], cw = 3.4, cd = 2.4;
      let k = 0;
      for (let z = -c.d / 2 + 0.6 + cd / 2; z + cd / 2 <= c.d / 2 - DOOR_DEPTH - 0.2; z += cd + 1.4)
        for (const s of [-1, 1]) for (let x = 1.0 + cw / 2; x + cw / 2 <= c.w / 2 - 0.3; x += cw + 0.6) {
          const role = roles[k++ % roles.length];
          if (role === 'crate' || role === 'barrel') { for (const dx of [-0.8, 0, 0.8]) c.put(role, s * x + dx, z, 0, { v: k % 3 }); }
          else c.put(role, s * x, z, 0, { v: k % 3 });
        }
      for (const s of [-1, 1]) c.put('lampStem', s * (c.w / 2 - 0.6), c.d / 2 - 0.6, 0);
      return true;
    } },
    'drill-hall': { name: 'Drill hall', kind: 'barracks', w: 22, d: 16, h: 3.6, min: { target: 3, weaponRack: 3 }, build(c) {
      for (const x of [-c.w / 3, 0, c.w / 3]) c.wall('target', 'back', x, { gap: 0.4 });
      c.wallRow('weaponRack', 'left', -c.d / 2 + 1.2, c.d / 2 - 1.5, { vf: i => i % 3 });
      c.wallRow('mannequin', 'right', -c.d / 2 + 1.2, c.d / 2 - 2.5, { space: 0.9, vf: i => i % 2 });
      for (const s of [-1, 1]) { c.put('spears', s * (c.w / 2 - 1.2), -c.d / 2 + 0.9, 0); c.put('bench', s * c.w / 4, c.d / 2 - DOOR_DEPTH - 1.2, PI); }
      for (const s of [-1, 1]) c.put('ceilingLamp', s * c.w / 4, 0, 0);
      return true;
    } },
    'gallery': { name: 'Gallery', kind: 'hall', w: 22, d: 10, h: 3.6, min: { statue: 3, banner: 3 }, build(c) {
      const n = Math.max(1, Math.floor((c.w - 4) / 5.5));
      for (let i = 0; i < n; i++) { const x = -((n - 1) * 5.5) / 2 + i * 5.5; c.put('statue', x, -0.8, 0); c.wall('banner', 'back', x); }
      for (let i = 0; i < n - 1; i++) { const x = -((n - 1) * 5.5) / 2 + (i + 0.5) * 5.5; c.put('bench', x, 1.4, PI); }
      for (const s of [-1, 1]) c.put('lampStem', s * (c.w / 2 - 0.7), c.d / 2 - 0.7, 0);
      return true;
    } },
    'stern-lounge': { name: 'Stern lounge', kind: 'hall', w: 16, d: 12, h: 3.4, min: { divan: 4, counter: 1 }, build(c) {
      const K = c.wall('counter', 'back', 0, { gap: 1.0 });
      for (const s of [-1, 1]) c.wall('barrel', 'back', s * 2.6, { v: 0 });
      for (const s of [-1, 1]) lounge(c, s * c.w / 4.2, 1.0);
      for (const s of [-1, 1]) { c.put('lampStem', s * (c.w / 2 - 0.7), -c.d / 2 + 0.7, 0); c.put('lampStem', s * (c.w / 2 - 0.7), c.d / 2 - 0.7, 0); }
      return K != null;
    } },
    'plaza': { name: 'Plaza', kind: 'plaza', w: 30, d: 24, h: 8, outdoor: true, min: { fountain: 1, bed: 4, lampStd: 6 }, build(c) {
      c.put('fountain', 0, 0, 0, { v: 0 });
      for (let i = 0; i < 4; i++) { const a = PI / 4 + i * PI / 2, r = 7.2; c.put('bed', r * Math.cos(a), r * Math.sin(a), -a + PI / 2, { v: i % 3 }); }
      for (let i = 0; i < 4; i++) { const a = i * PI / 2, r = 4.6; c.put('bench', r * Math.cos(a), r * Math.sin(a), -a - PI / 2); }
      for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4, r = 10.2; c.put('lampStd', r * Math.cos(a), r * Math.sin(a), 0, { v: 1 }); }
      for (const x of [-c.w / 3, 0, c.w / 3]) c.wall('stall', 'back', x, { v: 1 });
      for (const s of [-1, 1]) { c.put('vent', s * (c.w / 2 - 1.2), c.d / 2 - 1.2, 0); c.wall('marketTable', 'front', s * c.w / 3); }
      return true;
    } },
    'quay': { name: 'Quay', kind: 'quay', w: 40, d: 8, h: 8, outdoor: true, min: { bollard: 4, lampStd: 3 }, build(c) {
      /* +z is the water's edge */
      for (let x = -c.w / 2 + 3; x <= c.w / 2 - 3 + 1e-6; x += 8.5) c.put('bollard', x, c.d / 2 - 0.7, 0);
      for (const s of [-1, 1]) c.put('capstan', s * (c.w / 2 - 7.2), c.d / 2 - 1.6, 0);
      for (let x = -c.w / 2 + 6; x <= c.w / 2 - 6 + 1e-6; x += 12) c.put('lampStd', x, -c.d / 2 + 0.6, 0, { v: 1 });
      c.put('chain', -4, -0.6, c.rnd() * TAU); c.put('netPile', 6, -c.d / 2 + 1.4, 0);
      for (const dx of [0, 0.8, 1.6]) c.put('crate', 12 + dx, -c.d / 2 + 0.6, 0, { v: 0 });
      c.put('pallet', -11, -c.d / 2 + 1.0, 0, { v: 1 });
      for (const s of [-1, 1]) c.put('vent', s * (c.w / 2 - 1.0), -c.d / 2 + 1.0, 0);
      return true;
    } }
  };

  AI.recipe = function (name, o, cat) {
    const R = AI.RECIPES[name];
    if (!R) throw new Error('ancients-interiors: no recipe ' + name);
    const c = context(R, o || {}, cat);
    R.build(c);
    const res = c.res;
    res.counts = {};
    for (const p of res.placements) res.counts[p.role] = (res.counts[p.role] || 0) + 1;
    return res;
  };
})(KratorAncientsInteriors);
