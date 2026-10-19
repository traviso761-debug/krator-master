// ================================================================= PINNACLE ROCK — the roosts (P2: the rings, the stalls, the bridges, the lifts, the Stair)  [G data]
// PLAN.md sections 2 and 3, P2. The roost decks are timber rings bracketed into a stack's beds: each ring's inner edge
// follows the stack's outline at its height (so no two are alike), its outer edge is that outline's hull pushed out by the
// deck's width; the stalls stand along the outer edge where it runs straight and the way out is clear of rock, other decks
// and the bridges. The records keep Girder's shapes (settlements/girder/API.md: PLATS, ROOSTS, BRIDGES, LIFTS) so the
// flyers' code reads them: a perch point 1.4 m inside the outer edge, open stalls 9.2 m deep, a perch beam 3.4 m out.
// Plain data and pure functions on KSTACKS bodies (core/terrain/37-core-stacks.js): no THREE, no DOM.
//
//   PRR.plan({rock, K, PR, ground})   ground(x, z): the floor's height off the rock (the talus counted). Returns
//     decks[]    {id, kind:'roostdeck', level:'stall'|'look', stack, wing, group, x, z (the ring's centre), y (the deck's
//                top), W, inner:[[x,z]], outer:[[x,z]] (the same N angles about x,z), R (outer bounding radius), hatch
//                (the climb's last metres: [i0, i1] angle samples left open in the inner band)}
//     roosts[]   Girder's ROOSTS {id, plat (deck id), x, y, z (the perch point), ox, oz (outward), ang, H, w, side
//                ('out' away from the mesa's middle, 'in' over the town), fx, fz (the stall's front centre on the edge)}
//     shelters[] {id, deck, x, y, z, ry, w, d}  the keeper's shelter on each stall deck (Girder's feed and tack store)
//     climbs[]   {id, deck, from ('foot' | a deck id), pts:[[x,y,z]] (the stair's centre line, 0.5 m a step), w}
//     bridges[]  Girder's BRIDGES {id, a:{x,y,z,deck}, b:{...}, L, w, sag}; PRR.bridgeY(br, t)
//     lifts[]    {id, name, a (the line's angle from the mesa's middle), root, tip:{x,y,z} (the boom over the edge),
//                foot:{x,y,z} (the landing under the tip), capstan:{x,y,z,r}, clear (the cable's least distance from the rock)}
//     stair      {id, pts:[[x,y,z,r]] (the cut flights: centre line, r its distance from the mesa's middle), ground:[[x,y,z]]
//                (the path down the debris slope to the fair ground), gates:[{id, x, y, z, ry, w, name}], w}
//   PRR.reach(L, K, cx, cz, a, y, tMax)   how far out from cx,cz along angle a the rock stands at height y (0: none)
//   PRR.STALL, PRR.DECK              the frame's numbers
const PRR = (function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  // Girder's stall frame (84a-flyers-routes.js, "roost bays"): the front posts .2 m inside the edge at +-w/2 (w less than a
  // quetzal's 12.4 m span), 2.2 m partitions, the lean-to's eave 5.8 m up at the edge and 7.4 m at the back, the perch beam
  // from 1.5 m inside the edge to 3.4 m out, its top .48 m over the deck
  const STALL = { w: 11.1, d: 9.2, H: 7, perchIn: 1.4, beamIn: 1.5, beamOut: 3.4, beamTop: .48, eave: 5.8, back: 7.4, part: 2.2, gap: .5 };
  // a stall deck: 14 m (the walkway's 4.8 inside the stalls); a lookout ring: 4.2 m; GAP the deck's inner edge off the rock
  const DECK = { stall: { W: 14, walk: 4.8 }, look: { W: 4.2 } }, GAP = .8, N = 96;
  const TREAD = .62;          // a climb's rise per metre of run (32 degrees)
  const CLEAR = { far: 150, lat: 6, under: 10 };   // a stall's way out: 150 m straight out, 6 m either side, rock 10 m below

  // ---------------------------------------------------------------- the rock's reach
  // the rock stands at (x, y, z) when the highest bed top over (x, z) is at y or above (the beds narrow upward: a stack's
  // taper, a mesa's shoulder); the outermost such point along the ray, to a few centimetres
  function reach(L, K, cx, cz, a, y, tMax) {
    // a mesa's or a butte's beds stand on one centre (no lean, no taper): there the reach is each bed's footprint radius
    // (KSTACKS.footR, less its chamfer), the widest of those whose top is at y or above
    if (L.length === 1 && L[0].beds.every(b => !b.tx && !b.tz && (b.tp == null || b.tp === 1) && Math.abs(b.cx - cx) < 1e-6 && Math.abs(b.cz - cz) < 1e-6)) {
      let m = 0; for (const b of L[0].beds) if (b.y + b.h >= y) m = Math.max(m, K.footR(b, a) * (1 - b.ch)); return m; }
    const ca = Math.cos(a), sa = Math.sin(a), on = t => K.topAt(L, cx + ca * t, cz + sa * t) >= y;
    let t = tMax; while (t > 0 && !on(t)) t -= 1.2; if (t <= 0) return on(0) ? .1 : 0;   // 1.2 m steps: a fin's crest is a few metres thick
    let lo = t, hi = t + 1.2; for (let i = 0; i < 6; i++) { const m = (lo + hi) / 2; if (on(m)) lo = m; else hi = m; } return lo; }
  // a stack's middle at height y (a leaning stack's beds walk off its foot): the centroid of its outline there, or its foot's
  function centreAt(K, S, y) { const R = K.ring(S, Math.min(y, S.top - .3), 24); if (!R) return [S.x, S.z]; let x = 0, z = 0; R.forEach(p => { x += p[0]; z += p[1]; }); return [x / R.length, z / R.length]; }
  // the reach over a band of heights, round N angles, dilated then smoothed (never inside the rock)
  function outline(L, K, cx, cz, ys, tMax) {
    const r = []; for (let i = 0; i < N; i++) { let m = 0; for (const y of ys) m = Math.max(m, reach(L, K, cx, cz, i / N * TAU, y, tMax)); r.push(m); }
    const dil = r.map((v, i) => Math.max(r[(i + N - 2) % N], r[(i + N - 1) % N], v, r[(i + 1) % N], r[(i + 2) % N]));
    return dil.map((v, i) => (dil[(i + N - 2) % N] + dil[(i + N - 1) % N] + v + dil[(i + 1) % N] + dil[(i + 2) % N]) / 5); }
  function hull(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); }
  // where a ray from (cx, cz) at angle a leaves a convex polygon
  function rayOut(P, cx, cz, a) { const dx = Math.cos(a), dz = Math.sin(a); let best = 0;
    for (let i = 0, n = P.length; i < n; i++) { const p = P[i], q = P[(i + 1) % n], ex = q[0] - p[0], ez = q[1] - p[1], den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue; const wx = p[0] - cx, wz = p[1] - cz, t = (wx * ez - wz * ex) / den, u = (wx * dz - wz * dx) / den;
      if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6 && t > best) best = t; } return best; }

  // ---------------------------------------------------------------- a deck round a stack
  function deck(o, rock, K, S, level, y, extra) {
    const W = DECK[level].W, c = centreAt(K, S, y + 2), cx = c[0], cz = c[1], top = S.top;
    const r = outline([S], K, cx, cz, [y - 1, y + 2, y + 5, Math.min(y + 8, top - .5)], S.R);
    const inner = r.map((v, i) => [cx + Math.cos(i / N * TAU) * (v + GAP), cz + Math.sin(i / N * TAU) * (v + GAP)]);
    const H0 = hull(inner), mk = []; H0.forEach(p => { for (let k = 0; k < 24; k++) mk.push([p[0] + Math.cos(k / 24 * TAU) * W, p[1] + Math.sin(k / 24 * TAU) * W]); });
    // the outer edge: the hull pushed out by W, cut back 1.5 m short of any other stack standing at the deck's height (the
    // Garden's pinnacles stand 25-60 m apart), never narrower than a 2.4 m walk
    const H1 = hull(mk), outer = []; let R = 0, cut = 0;
    const near = rock.filter(B => B !== S && B.top > y - 2 && Math.hypot(B.x - cx, B.z - cz) < B.R + S.R + W + 4);
    for (let i = 0; i < N; i++) { const a = i / N * TAU, ca = Math.cos(a), sa = Math.sin(a), t0 = r[i] + GAP; let t = rayOut(H1, cx, cz, a);
      if (near.length) for (let u = t0; u <= t + 1.5; u += 1) if (K.topAt(near, cx + ca * u, cz + sa * u) > y - 2) { const tc = Math.max(t0 + 2.4, u - 1.5); if (tc < t) { t = tc; cut++; } break; }
      outer.push([cx + ca * t, cz + sa * t]); R = Math.max(R, t); }
    return Object.assign({ id: 'deck-' + S.id + (level === 'look' ? '-look' : ''), kind: 'roostdeck', level, stack: S.id, x: cx, z: cz, y, W, inner, outer, R, hatch: null, rin: r, cut }, extra || {}); }
  // the outer edge resampled by arc length (a closed polyline): {pts, cum, per}
  function arcOf(D) { const P = D.outer.concat([D.outer[0]]), cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { P, cum, per: cum[cum.length - 1] }; }
  function arcAt(A, s) { s = ((s % A.per) + A.per) % A.per; let i = 1; while (i < A.cum.length - 1 && A.cum[i] < s) i++;
    const a = A.P[i - 1], b = A.P[i], t = (s - A.cum[i - 1]) / Math.max(1e-9, A.cum[i] - A.cum[i - 1]), tx = b[0] - a[0], tz = b[1] - a[1], L = Math.hypot(tx, tz) || 1;
    return { x: a[0] + tx * t, z: a[1] + tz * t, tx: tx / L, tz: tz / L }; }
  // the outward normal of the edge at s (away from the ring's centre)
  function normAt(A, s, D) { const p = arcAt(A, s); let nx = p.tz, nz = -p.tx; if (nx * (p.x - D.x) + nz * (p.z - D.z) < 0) { nx = -nx; nz = -nz; } return { x: p.x, z: p.z, nx, nz, tx: p.tx, tz: p.tz }; }
  // the arc position of the outer edge nearest a point
  function arcNear(A, x, z) { let best = 0, bd = 1e9; for (let s = 0; s < A.per; s += .5) { const p = arcAt(A, s), d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; best = s; } } return best; }
  const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };

  // ---------------------------------------------------------------- a climb round a stack: a stair hugging the rock
  // from the ground at its foot (or a lower deck) up to the deck, rising TREAD per metre, its centre line 1.1 m off the rock
  function climb(rock, K, S, D, from, y0, a0, dir) {
    const pts = []; let a = a0, y = y0, n = 0, cy = null, c = null;
    // round the stack's middle at each height (a leaning stack's middle walks), the rock's reach there and 2.6 m over the tread
    const rAt = (a, y) => { if (cy === null || Math.abs(y - cy) > 2) { c = centreAt(K, S, y); cy = y; }
      return Math.max(reach([S], K, c[0], c[1], a, y + 2.6, S.R), reach([S], K, c[0], c[1], a, y, S.R)) + GAP + 1.1; };
    while (y < D.y && n++ < 4000) { const r = rAt(a, y), p = [c[0] + Math.cos(a) * r, y, c[1] + Math.sin(a) * r]; pts.push(p);
      // the next tread .5 m on (a taper or a walking middle shortens an angle's step: lengthen it until the run is whole)
      const y2 = Math.min(D.y, y + .5 * TREAD); let da = .5 / Math.max(4, r), k = 0;
      for (; k < 8; k++) { const r2 = rAt(a + dir * da, y2), q = [c[0] + Math.cos(a + dir * da) * r2, c[1] + Math.sin(a + dir * da) * r2]; if (Math.hypot(q[0] - p[0], q[1] - p[2]) >= .49) break; da *= 1.2; }
      a += dir * da; y = y2; }
    const r = rAt(a, D.y - 2.6); pts.push([c[0] + Math.cos(a) * r, D.y, c[1] + Math.sin(a) * r]);
    return { id: 'climb-' + D.id, deck: D.id, from, pts, w: 1.8, a1: a }; }

  // ---------------------------------------------------------------- the plan
  function plan(o) {
    const rock = o.rock, K = o.K, P = o.PR, ground = o.ground, mesa = rock[0];
    const byId = id => rock.find(B => B.id === id);
    const decks = [], roosts = [], shelters = [], climbs = [], bridges = [], lifts = [];
    const town = (B, x, z) => B.garden || B.heart ? [x, z] : [0, 0];   // the side a stack's climb starts from: the town's
    // THE RINGS: a stall deck and a lookout on each Wing's fin; a lookout on the lookout fins; a stall deck and a lookout on
    // the four ringed pinnacles of the Garden. A deck stands at least 14 m clear of the next ring up on its stack
    const carriers = [];
    P.FINS.forEach(F => { const S = byId(F.id); if (S) carriers.push({ S, wing: F.wing, group: F.group, foot: S.y0 + 1.5 }); });
    P.GARDEN.forEach(G => { if (!G.ring) return; const S = byId(G.id); if (S) carriers.push({ S, wing: 'garden', group: 'garden', foot: S.y0 + 1.5 }); });
    carriers.forEach(C => { const S = C.S, h = S.top - C.foot, garden = C.group === 'garden';
      const look = { y: S.top - (garden ? 12 : 8) };
      if (C.wing) { const y = C.foot + (garden ? clamp(.42 * h, 60, 100) : clamp(.55 * h, 24, 52));
        const D = deck(o, rock, K, S, 'stall', y, { wing: C.wing, group: C.group }); D.foot = C.foot; decks.push(D);
        if (look.y - y >= 16) decks.push(Object.assign(deck(o, rock, K, S, 'look', look.y, { wing: C.wing, group: C.group }), { below: D.id })); }
      else decks.push(Object.assign(deck(o, rock, K, S, 'look', look.y, { wing: null, group: C.group }), { foot: C.foot })); });
    const deckOf = id => decks.find(D => D.id === id);

    // THE BRIDGES: between the stall decks of a group's fins (the north pair, the east three, the west pair), at the nearest
    // points of their outer edges, each end 1.5 m in on its deck
    const sd = decks.filter(D => D.level === 'stall' && D.group !== 'garden');
    const pairs = []; ['north', 'east', 'west'].forEach(g => { const L = sd.filter(D => D.group === g).sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
      for (let i = 1; i < L.length; i++) pairs.push([L[i - 1], L[i]]); });
    const heads = {};   // arc positions on a deck's edge taken by a bridge's head
    pairs.forEach(([A, B]) => { let bi = 0, bj = 0, bd = 1e9; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const d = Math.hypot(A.outer[i][0] - B.outer[j][0], A.outer[i][1] - B.outer[j][1]); if (d < bd) { bd = d; bi = i; bj = j; } }
      const pa = A.outer[bi], pb = B.outer[bj], ux = (pb[0] - pa[0]) / bd, uz = (pb[1] - pa[1]) / bd;
      const a = { x: pa[0] - ux * 1.5, y: A.y, z: pa[1] - uz * 1.5, deck: A.id }, b = { x: pb[0] + ux * 1.5, y: B.y, z: pb[1] + uz * 1.5, deck: B.id };
      const L = Math.hypot(b.x - a.x, b.z - a.z);
      bridges.push({ id: 'bridge-' + A.stack.replace(/^fin-/, '') + '-' + B.stack.replace(/^fin-/, ''), a, b, L, w: 2.4, sag: L * .045 });
      (heads[A.id] = heads[A.id] || []).push([pa[0], pa[1]]); (heads[B.id] = heads[B.id] || []).push([pb[0], pb[1]]); });

    // THE LIFTS: a boom over the edge on a line from the mesa's middle, its tip 4 m clear of the wall at every height below
    // it (the shoulder's ledges and the cliff's flutes), the cage's cable straight down to the landing on the debris slope
    function lift(id, name, x, z) { const a = Math.atan2(z, x), ca = Math.cos(a), sa = Math.sin(a), Rm = mesa.R;
      const edge = reach([mesa], K, mesa.x, mesa.z, a, mesa.top - .6, Rm);
      let face = edge; for (let y = 10; y < mesa.top; y += 3) face = Math.max(face, reach([mesa], K, mesa.x, mesa.z, a, y, Rm));
      const tipT = face + 4, rootT = edge - 10, yb = mesa.top + 6, tip = { x: mesa.x + ca * tipT, y: yb, z: mesa.z + sa * tipT };
      const root = { x: mesa.x + ca * rootT, y: K.topAt([mesa], mesa.x + ca * rootT, mesa.z + sa * rootT), z: mesa.z + sa * rootT };
      const foot = { x: tip.x, y: ground(tip.x, tip.z), z: tip.z };
      let clear = 1e9; for (let y = foot.y + 2; y < mesa.top; y += 2) clear = Math.min(clear, tipT - reach([mesa], K, mesa.x, mesa.z, a, y, Rm));
      const cT = rootT - 9; lifts.push({ id, name, a, root, tip, foot, clear, len: tipT - rootT,
        capstan: { x: mesa.x + ca * cT, y: K.topAt([mesa], mesa.x + ca * cT, mesa.z + sa * cT), z: mesa.z + sa * cT, r: 3.6 } }); }
    lift('lift-north', 'The beast lift (down the gorge face, between the Wingclaw\'s fins)', P.TOP.liftTop.x, P.TOP.liftTop.z);
    lift('lift-south', 'The capstan lift (loads up the south nose, beside the Stair)', P.TOP.capstan.x, P.TOP.capstan.z);

    // THE STALLS: along each stall deck's outer edge, w apart, where the edge runs straight (turning less than .5 rad over
    // a stall), clear of the bridges' heads and the lifts, and where the way out is open: 150 m straight out, 6 m either
    // side, no rock within 10 m below, no other deck within 25 m of its height, no bridge
    const L2 = lifts.map(l => [[l.root.x, l.root.z], [l.tip.x, l.tip.z], l.tip.y]);
    function wayOut(D, x, z, nx, nz, tx, tz) {
      const near = D.near || (D.near = rock.filter(B => B.top > D.y - CLEAR.under && Math.hypot(B.x - D.x, B.z - D.z) < B.R + D.R + CLEAR.far + 10));   // the bodies that could stand in the way
      for (let e = 4; e <= CLEAR.far; e += 6) for (const q of [-CLEAR.lat, 0, CLEAR.lat]) { const px = x + nx * e + tx * q, pz = z + nz * e + tz * q;
        if (near.length && K.topAt(near, px, pz) > D.y - CLEAR.under) return 'rock';
        for (const E of decks) if (E !== D && Math.abs(E.y - D.y) < 25 && Math.hypot(px - E.x, pz - E.z) < E.R + 4) return 'deck';
        for (const B of bridges) if (Math.abs((B.a.y + B.b.y) / 2 - D.y) < 15 && segD(px, pz, [B.a.x, B.a.z], [B.b.x, B.b.z]) < 6) return 'bridge';
        for (const l of L2) if (Math.abs(l[2] - D.y) < 20 && segD(px, pz, l[0], l[1]) < 8) return 'lift'; }
      return null; }
    const why = { rock: 0, deck: 0, bridge: 0, lift: 0, bend: 0, head: 0 };
    decks.filter(D => D.level === 'stall').forEach(D => { const A = arcOf(D), w = STALL.w, taken = [];
      const hd = (heads[D.id] || []).map(p => arcNear(A, p[0], p[1]));
      const overlaps = (s0, s1, t0, t1) => { for (const k of [-A.per, 0, A.per]) if (s0 < t1 + k && t0 + k < s1) return true; return false; };
      let k = 0;
      for (let s = 0; s + w <= A.per + .01; ) {
        const s0 = s - .25, s1 = s + w + .25, a = arcAt(A, s), b = arcAt(A, s + w), turn = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz));
        let bad = turn > .5 ? 'bend' : null;
        if (!bad) for (const h of hd) if (overlaps(s0, s1, h - 3.5, h + 3.5)) { bad = 'head'; break; }
        if (!bad) for (const t of taken) if (overlaps(s0, s1, t[0], t[1])) { bad = 'head'; break; }
        const m = normAt(A, s + w / 2, D);
        if (!bad) bad = wayOut(D, m.x, m.z, m.nx, m.nz, m.tx, m.tz);
        if (bad) { why[bad]++; s += 1; continue; }
        const px = m.x - m.nx * STALL.perchIn, pz = m.z - m.nz * STALL.perchIn, out = m.nx * m.x + m.nz * m.z > 0;   // facing away from the mesa's middle
        const side = D.group === 'garden' ? 'garden' : out ? 'out' : 'in';
        roosts.push({ id: D.id.replace(/^deck-/, 'roost-') + '-' + (k++), plat: D.id, x: px, y: D.y, z: pz, ox: m.nx, oz: m.nz, ang: Math.atan2(m.nx, m.nz), H: STALL.H, w,
          side, fx: m.x, fz: m.z, wing: D.wing });
        taken.push([s0, s1]); s += w + STALL.gap; }
      // the keeper's shelter: in the middle of the longest stretch of edge without a stall or a bridge's head, 4.5 m in from it
      const occ = taken.map(t => [t[0], t[1]]).concat(hd.map(h => [h - 3.5, h + 3.5])).sort((a, b) => a[0] - b[0]);
      let gs = 0, gl = A.per; if (occ.length) { gl = 0; for (let i = 0; i < occ.length; i++) { const e0 = occ[i][1], e1 = i + 1 < occ.length ? occ[i + 1][0] : occ[0][0] + A.per; if (e1 - e0 > gl) { gl = e1 - e0; gs = e0; } } }
      const m = normAt(A, gs + gl / 2, D);
      shelters.push({ id: 'shelter-' + D.stack, deck: D.id, x: m.x - m.nx * 4.6, y: D.y, z: m.z - m.nz * 4.6, ry: Math.atan2(m.nx, m.nz), w: 5.2, d: 4 }); });

    // THE CLIMBS: from the stack's foot on the town's side up to its first deck; from the stall deck on round to the lookout
    decks.forEach(D => { const S = byId(D.stack), t = town(S, P.GARDEN_MESA.x, P.GARDEN_MESA.z);
      let C; if (D.below) { const B0 = deckOf(D.below), c0 = climbs.find(c => c.deck === B0.id); C = climb(rock, K, S, D, B0.id, B0.y, (c0 ? c0.a1 : 0) + Math.PI * .6, 1); }
      else { const a0 = Math.atan2(t[1] - S.z, t[0] - S.x) - .5; C = climb(rock, K, S, D, 'foot', D.foot, a0, 1); }
      climbs.push(C);
      // the hatch: the deck's inner band left open over the climb's last 5 m of run
      const n = C.pts.length, i1 = Math.round(((Math.atan2(C.pts[n - 1][2] - D.z, C.pts[n - 1][0] - D.x) / TAU * N) % N + N) % N), span = Math.ceil(5 / (TAU * (D.R - D.W) / N)) + 1;
      D.hatch = [i1 - span, i1 + 1]; });

    // THE STAIR down the south nose: the head 6 m in from the top's edge; straight down the shoulder's ledges to the cliff's
    // lip; then flights along the face between the nose and .13 rad west of it (the capstan lift is east), falling TREAD:
    // the flights cut 3 m wide into the face (the inner edge .3 m into the rock), each return flight built out 3.2 m beyond
    // them, so no flight turns under the one before it (two flights apart, 100 m of rock between), a landing at each turn; where it meets the debris
    // slope, a path of steps down the slope to the fair ground. Gated three times: the head, the middle landing, the foot
    const stair = (function () { const aE = Math.PI / 2 - .015, aW = Math.PI / 2 + .13, Rm = mesa.R, cx = mesa.x, cz = mesa.z, OUT = 3.2;
      const face = (a, y) => Math.max(reach([mesa], K, cx, cz, a, y, Rm), reach([mesa], K, cx, cz, a, y + 3, Rm));
      const at = (a, r, y, k) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, r, k];
      const edge = reach([mesa], K, cx, cz, aE, mesa.top - .6, Rm), pts = [at(aE, edge - 6, mesa.top, -1)];
      // the shoulder (the plan's: P.MESA.shoulder.h of ledges over the cliff), down to the cliff's lip
      const lipY = mesa.top - P.MESA.shoulder.h - .5, lipT = face(aE, lipY);
      const n0 = Math.max(2, Math.round((lipT - edge + 6) / 1.2)); for (let i = 1; i <= n0; i++) { const u = i / n0; pts.push(at(aE, edge - 6 + (lipT + 1.2 - edge + 6) * u, mesa.top + (lipY - mesa.top) * u, -1)); }
      // the flights: the face's reach along them, then each flight's line smoothed (a moving maximum over 9 m: the flutes)
      const raw = []; let a = aE, y = lipY, dir = 1, k = 0, guard = 0;
      const gw = (a, y, k) => { const r = face(a, y) + 2.7 + (k % 2) * OUT; return ground(cx + Math.cos(a) * r, cz + Math.sin(a) * r); };
      while (guard++ < 8000) { raw.push([a, y, k, face(a, y)]); if (y <= gw(a, y, k) + .6) break;
        let na = a + dir * .5 / Math.max(50, raw[raw.length - 1][3]);
        if (na > aW || na < aE) { k++; dir = -dir; raw.push([a, y, k, face(a, y)]); na = a + dir * .5 / Math.max(50, raw[raw.length - 1][3]); }
        a = na; y -= .5 * TREAD; }
      const landings = [];
      raw.forEach((p, i) => { let m = 0; for (let j = Math.max(0, i - 18); j <= Math.min(raw.length - 1, i + 18); j++) if (raw[j][2] === p[2]) m = Math.max(m, raw[j][3]);
        if (i && raw[i - 1][2] !== p[2]) landings.push(pts.length);
        pts.push(at(p[0], m + 1.2 + (p[2] % 2) * OUT, p[1], p[2])); });
      const foot = pts[pts.length - 1], g = [], fair = [P.FAIR.x - 30, P.FAIR.z - P.FAIR.rz + 8], dx = fair[0] - foot[0], dz = fair[1] - foot[2], Lg = Math.hypot(dx, dz);
      for (let s = 0; s <= Lg; s += 1) { const x = foot[0] + dx * s / Lg, z = foot[2] + dz * s / Lg; g.push([x, ground(x, z), z]); }
      const mid = landings.length ? pts[landings[Math.floor((landings.length - 1) / 2)]] : pts[Math.floor(pts.length / 2)], ryOf = (p, q) => Math.atan2(q[0] - p[0], q[2] - p[2]);
      const gates = [{ id: 'gate-head', name: 'The Stair\'s head gate', x: pts[0][0], y: pts[0][1], z: pts[0][2], ry: ryOf(pts[0], pts[1]), w: 3.6 },
        { id: 'gate-mid', name: 'The Stair\'s middle gate', x: mid[0], y: mid[1], z: mid[2], ry: ryOf(mid, [cx, mid[1], cz]), w: 3.6 },
        { id: 'gate-foot', name: 'The Stair\'s foot gate', x: g[2][0], y: g[2][1], z: g[2][2], ry: ryOf(g[2], g[Math.min(8, g.length - 1)]), w: 3.6 }];
      return { id: 'stair', name: 'The Stair (the one walking way up, cut in the south nose)', pts, shoulder: n0 + 1, flights: k + 1, landings, ground: g, gates, w: 3, out: OUT }; })();

    decks.forEach(D => { delete D.near; });
    return { decks, roosts, shelters, climbs, bridges, lifts, stair, why };
  }
  const bridgeY = (br, t) => br.a.y + (br.b.y - br.a.y) * t - br.sag * 4 * t * (1 - t);
  return { plan, reach, bridgeY, STALL, DECK, N };
})();
if (typeof module !== 'undefined') module.exports = PRR;
