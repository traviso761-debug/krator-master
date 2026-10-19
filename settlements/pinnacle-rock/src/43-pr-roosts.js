// ================================================================= PINNACLE ROCK — the roosts (P2: the rings, the stalls, the bridges, the lifts, the Stair)  [G data]
// PLAN.md sections 2 and 3, P2. The roost decks are timber rings bracketed into a stack's beds: each ring's inner edge
// follows the stack's outline at its height (so no two are alike), its outer edge is that outline's hull pushed out by the
// deck's width; the stalls stand along the outer edge where it runs straight and the way out is clear of rock, other decks
// and the bridges. The records keep Girder's shapes (settlements/girder/API.md: PLATS, ROOSTS, BRIDGES, LIFTS) so the
// flyers' code reads them: a perch point 1.4 m inside the outer edge, open stalls 9.2 m deep, a perch beam 3.4 m out.
// Plain data and pure functions on KSTACKS bodies (core/terrain/37-core-stacks.js): no THREE, no DOM.
//
//   PRR.plan({rock, K, PR, ground, footD})   ground(x, z): the floor's height off the rock (the talus counted); footD(x, z):
//                the distance past the nearest rock's foot (the debris slope's measure). Returns
//     decks[]    {id, kind:'roostdeck', level:'stall'|'look', stack, wing, group, x, z (the ring's centre), y (the deck's
//                top), W, inner:[[x,z]], outer:[[x,z]] (the same N angles about x,z), R (outer bounding radius), hatch
//                (the climb's last metres: [i0, i1] angle samples left open in the inner band), feet:[[x,y,z,r]] (where
//                each angle's bracket meets the rock under the deck: r the rock's reach there, 0 none)}
//     roosts[]   Girder's ROOSTS {id, plat (deck id), x, y, z (the perch point), ox, oz (outward), ang, H, w, side
//                ('out' away from the mesa's middle, 'in' over the town), fx, fz (the stall's front centre on the edge), quad
//                (its footprint: the front corners on the edge, the back corners 9.2 m in along the edge's normals there)}
//     shelters[] {id, deck, x, y, z, ry, w, d}  the keeper's shelter on each stall deck (Girder's feed and tack store)
//     climbs[]   {id, deck, from ('foot' | a deck id), pts:[[x,y,z, fx,fy,fz]] (the stair's centre line, 0.5 m a step, its
//                inner edge .1 m off the rock; every fourth step a bracket's foot on the rock under it, else null), w}
//     bridges[]  Girder's BRIDGES {id, a:{x,y,z,deck}, b:{...}, L, w, sag}; PRR.bridgeY(br, t)
//     lifts[]    {id, name, a (the line's angle from the mesa's middle), root, tip:{x,y,z} (the boom over the edge),
//                foot:{x,y,z} (the landing under the tip), capstan:{x,y,z,r}, clear (the cable's least distance from the rock)}
//     stair      {id, pts:[[x,y,z,r,k,rf]] (the head down the shoulder (k -1), then the flights: centre line, r its distance
//                from the mesa's middle, k the flight, rf the rock's reach under it: the cut flights' support, the built-out
//                ones' brackets), a0, a1 (the span of the face it takes), ground:[[x,y,z]] (the path down the debris slope
//                to the fair ground), gates:[{id, x, y, z, ry, w, name}], w}
//     roads[]    {id, name, pts:[[x,y,z]] (3 m apart: from the beast lift's landing cut along the debris slope round the
//                mesa's north-west, then over the floor to the palisade), w, bench (the points on the slope: [0, i]), gate}
//     ways[]     {id, name, pts:[[x,z]], w}: the ground the Stair's path and the roads take, for PR.addWay (cleared)
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
  // ---------------------------------------------------------------- the DRAWN wall
  // KSTACKS.mesh draws a bed's wall as rows of a ring of at most 160 segments (core/terrain/37-core-stacks.js): on the
  // 1.2 km mesa its corners stand ~25 m apart and the flutes and the beds' weathering between them are cut straight
  // across, so the drawn face stands up to 12 m inside the outline KSTACKS' queries give (measured, 2026-10-19). What hangs
  // on a wall (the Stair, its landings and supports, the climbs and every bracket's foot) follows the wall AS DRAWN: the
  // mesh's own wall rows, bed by bed, and where a ray from a middle crosses a row's polygon, between the rows linearly.
  // WALL.step {big, small}: the page's wall steps (47-host-land.js: LAND.wallStep for the mesas, 2.5 m for the stacks)
  const WALL = { step: { big: 6, small: 2.5 }, cache: new Map() };
  const SMALL = { spire: 1, fin: 1, balanced: 1 };
  function wallOf(K, B) { let W = WALL.cache.get(B); if (W) return W;
    const m = K.mesh(B, { step: SMALL[B.kind] ? WALL.step.small : WALL.step.big }), n = m.part.length, beds = []; let i = 0;
    while (i < n) { if (m.part[i] !== 0) { i++; continue; } const k = m.bed[i]; let j = i; while (j < n && m.part[j] === 0 && m.bed[j] === k) j++;
      const seg = (j - i) / 7 - 1, rows = [];
      for (let r = 0; r < 7; r++) { const pts = []; let ys = 0; for (let s = 0; s <= seg; s++) { const v = i + r * (seg + 1) + s; pts.push([m.pos[3 * v], m.pos[3 * v + 2]]); ys += m.pos[3 * v + 1]; } rows.push({ y: ys / (seg + 1), pts }); }
      beds.push({ k, rows, y0: rows[0].y, y1: rows[6].y }); i = j; }
    W = { beds }; WALL.cache.set(B, W); return W; }
  // the outermost crossing of a ray from (cx, cz) at angle a with an open polyline (0 if none)
  function rayLine(pts, cx, cz, a) { const dx = Math.cos(a), dz = Math.sin(a); let best = 0;
    for (let i = 0; i + 1 < pts.length; i++) { const p = pts[i], q = pts[i + 1], ex = q[0] - p[0], ez = q[1] - p[1], den = dx * ez - dz * ex; if (Math.abs(den) < 1e-12) continue;
      const wx = p[0] - cx, wz = p[1] - cz, t = (wx * ez - wz * ex) / den, u = (wx * dz - wz * dx) / den; if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t > best) best = t; } return best; }
  // the drawn wall's distance from (cx, cz) along angle a at height y (the bed whose rows span y), 0 off the body
  function wallR(K, B, cx, cz, a, y) { const W = wallOf(K, B); let bb = null, bd = 1e9;
    for (const b of W.beds) { const d = y < b.y0 ? b.y0 - y : y > b.y1 ? y - b.y1 : 0; if (d < bd) { bd = d; bb = b; } }
    if (!bb || bd > .5) return 0;   // off the body (a sliver between two beds' drawn rows counts as the nearer)
    const R = bb.rows; let r = 0; while (r < 5 && y > R[r + 1].y) r++;
    const t0 = rayLine(R[r].pts, cx, cz, a), t1 = rayLine(R[r + 1].pts, cx, cz, a), u = (y - R[r].y) / Math.max(1e-6, R[r + 1].y - R[r].y); return t0 + (t1 - t0) * Math.max(0, Math.min(1, u)); }
  // the drawn top under a point along angle a, t out: the highest bed whose drawn top edge reaches past t (-Infinity none)
  function drawnTop(K, B, cx, cz, a, t) { const W = wallOf(K, B); let best = -Infinity; for (const b of W.beds) if (rayLine(b.rows[6].pts, cx, cz, a) >= t) best = Math.max(best, b.y1); return best; }
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
    // the brackets' feet: where each angle's strut meets the rock, .38 W under the deck (let .3 m into the bed)
    const fy = y - 1 - .38 * W, feet = [];
    for (let i = 0; i < N; i++) { const a = i / N * TAU, rf = wallR(K, S, cx, cz, a, fy), t = Math.max(0, rf - .3); feet.push([cx + Math.cos(a) * t, fy, cz + Math.sin(a) * t, rf]); }   // the drawn wall's
    return Object.assign({ id: 'deck-' + S.id + (level === 'look' ? '-look' : ''), kind: 'roostdeck', level, stack: S.id, x: cx, z: cz, y, W, inner, outer, R, hatch: null, rin: r, cut, feet }, extra || {}); }
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
  const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / Math.max(1e-9, dx * dx + dz * dz), 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };

  // ---------------------------------------------------------------- a climb round a stack: a stair hugging the rock
  // from the ground at its foot (or a lower deck) up to the deck, rising TREAD per metre, its inner edge .2 m into the DRAWN rock at
  // the tread's height (or off a bed standing proud over it, for headroom); every fourth step a bracket's foot, let into the
  // rock 1.6 m under the tread
  function climb(rock, K, S, D, from, y0, a0, dir) {
    const pts = []; let a = a0, y = y0, n = 0, cy = null, c = null;
    // round the stack's middle at each height (a leaning stack's middle walks), the rock's reach there and 2.6 m over the tread
    const rAt = (a, y) => { if (cy === null || Math.abs(y - cy) > 2) { c = centreAt(K, S, y); cy = y; }
      // the drawn wall of the bed under the tread, and of any bed jutting out within 2.2 m over it (the tread stands out at
      // that one's face, its bracket on the rock under it): the inner edge .2 m into the wall, never under rock
      return Math.max(wallR(K, S, c[0], c[1], a, y - .2), wallR(K, S, c[0], c[1], a, y + .8), wallR(K, S, c[0], c[1], a, y + 1.6), wallR(K, S, c[0], c[1], a, y + 2.2)) + .7; };
    while (y < D.y && n++ < 4000) { const r = rAt(a, y), p = [c[0] + Math.cos(a) * r, y, c[1] + Math.sin(a) * r];
      if (pts.length % 4 === 0) { const rf = wallR(K, S, c[0], c[1], a, y - 1.6); if (rf > 0) p.push(c[0] + Math.cos(a) * (rf - .3), y - 1.6, c[1] + Math.sin(a) * (rf - .3)); }
      pts.push(p);
      // the next tread .5 m on (a taper or a walking middle shortens an angle's step: lengthen it until the run is whole)
      const y2 = Math.min(D.y, y + .5 * TREAD); let da = .5 / Math.max(4, r), k = 0;
      for (; k < 8; k++) { const r2 = rAt(a + dir * da, y2), q = [c[0] + Math.cos(a + dir * da) * r2, c[1] + Math.sin(a + dir * da) * r2]; if (Math.hypot(q[0] - p[0], q[1] - p[2]) >= .49) break; da *= 1.2; }
      a += dir * da; y = y2; }
    const r = rAt(a, D.y); pts.push([c[0] + Math.cos(a) * r, D.y, c[1] + Math.sin(a) * r]);   // the last tread on the wall at the deck's own height
    return { id: 'climb-' + D.id, deck: D.id, from, pts, w: 1.8, a1: a }; }

  // ---------------------------------------------------------------- the plan
  function plan(o) {
    const rock = o.rock, K = o.K, P = o.PR, ground = o.ground, mesa = rock[0];
    WALL.cache.clear(); if (o.wallStep) Object.assign(WALL.step, o.wallStep);
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
      let face = edge; for (let y = 10; y < mesa.top; y += 3) face = Math.max(face, reach([mesa], K, mesa.x, mesa.z, a, y, Rm), wallR(K, mesa, mesa.x, mesa.z, a, y));
      const tipT = face + 4, rootT = edge - 10, yb = mesa.top + 6, tip = { x: mesa.x + ca * tipT, y: yb, z: mesa.z + sa * tipT };
      const root = { x: mesa.x + ca * rootT, y: K.topAt([mesa], mesa.x + ca * rootT, mesa.z + sa * rootT), z: mesa.z + sa * rootT };
      const foot = { x: tip.x, y: ground(tip.x, tip.z), z: tip.z };
      let clear = 1e9; for (let y = foot.y + 2; y < mesa.top; y += 2) clear = Math.min(clear, tipT - Math.max(reach([mesa], K, mesa.x, mesa.z, a, y, Rm), wallR(K, mesa, mesa.x, mesa.z, a, y)));
      const cT = rootT - 9; lifts.push({ id, name, a, root, tip, foot, clear, len: tipT - rootT,
        capstan: { x: mesa.x + ca * cT, y: K.topAt([mesa], mesa.x + ca * cT, mesa.z + sa * cT), z: mesa.z + sa * cT, r: 3.6 } }); }
    lift('lift-north', 'The beast lift (down the gorge face, between the Wingclaw\'s fins)', P.TOP.liftTop.x, P.TOP.liftTop.z);
    lift('lift-south', 'The capstan lift (loads up the south nose, beside the Stair)', P.TOP.capstan.x, P.TOP.capstan.z);

    // THE STALLS: along each stall deck's outer edge, w apart, following it round its bends (a stall's footprint, roof and
    // partitions, must not overlap the next one's and must stand on the deck, clear of the rock), clear of the bridges'
    // heads, the lifts and the keeper's shelter, and where the way out is open: 150 m straight out, 6 m either side, no rock
    // within 10 m below, no deck, bridge or lift across the flight's height band (the deck to 12 m over it)
    const L2 = lifts.map(l => [[l.root.x, l.root.z], [l.tip.x, l.tip.z], l.tip.y]);
    function wayOut(D, x, z, nx, nz, tx, tz) {
      const near = D.near || (D.near = rock.filter(B => B.top > D.y - CLEAR.under && Math.hypot(B.x - D.x, B.z - D.z) < B.R + D.R + CLEAR.far + 10));   // the bodies that could stand in the way
      for (let e = 4; e <= CLEAR.far; e += 6) for (const q of [-CLEAR.lat, 0, CLEAR.lat]) { const px = x + nx * e + tx * q, pz = z + nz * e + tz * q;
        if (near.length && K.topAt(near, px, pz) > D.y - CLEAR.under) return 'rock';
        for (const E of decks) if (E !== D && E.y - 2.5 < D.y + 12 && E.y + (E.level === 'stall' ? 9 : 4) > D.y - 1 && Math.hypot(px - E.x, pz - E.z) < E.R + 4) return 'deck';
        for (const B of bridges) if (Math.abs((B.a.y + B.b.y) / 2 - D.y) < 15 && segD(px, pz, [B.a.x, B.a.z], [B.b.x, B.b.z]) < 6) return 'bridge';
        for (const l of L2) if (Math.abs(l[2] - D.y) < 20 && segD(px, pz, l[0], l[1]) < 8) return 'lift'; }
      return null; }
    // a stall's footprint: its front corners on the edge (w apart along it), each side running in along the edge's normal
    // there, so round a bend a stall is a wedge and its neighbours' partitions stay parallel; two footprints meet when the
    // convex quads overlap (separating axes)
    function quadsMeet(Pq, Qq) { for (const poly of [Pq, Qq]) for (let i = 0; i < 4; i++) { const a = poly[i], b = poly[(i + 1) % 4], nx = b[1] - a[1], nz = a[0] - b[0];
        let p0 = 1e9, p1 = -1e9, q0 = 1e9, q1 = -1e9; for (const v of Pq) { const d = v[0] * nx + v[1] * nz; p0 = Math.min(p0, d); p1 = Math.max(p1, d); }
        for (const v of Qq) { const d = v[0] * nx + v[1] * nz; q0 = Math.min(q0, d); q1 = Math.max(q1, d); }
        const L = Math.hypot(nx, nz) || 1; if (p1 < q0 + .05 * L || q1 < p0 + .05 * L) return false; } return true; }
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    function convex(q) { let sg = 0; for (let i = 0; i < 4; i++) { const c = cross(q[i], q[(i + 1) % 4], q[(i + 2) % 4]); if (Math.abs(c) < 1e-6) continue; const t = Math.sign(c); if (sg && t !== sg) return false; sg = t; } return true; }
    // the deck's inner edge's distance from its middle at an angle (between the samples)
    const rinAt = (D, a) => { const f = ((a / TAU * N) % N + N) % N, i = Math.floor(f), j = (i + 1) % N, u = f - i, p = D.inner[i], q = D.inner[j];
      return Math.hypot(p[0] - D.x, p[1] - D.z) * (1 - u) + Math.hypot(q[0] - D.x, q[1] - D.z) * u; };
    function onDeck(D, q) { for (const v of q) if (Math.hypot(v[0] - D.x, v[1] - D.z) < rinAt(D, Math.atan2(v[1] - D.z, v[0] - D.x)) + .3) return false; return true; }
    const why = { rock: 0, deck: 0, bridge: 0, lift: 0, bend: 0, head: 0, crowd: 0, shelter: 0 };
    decks.filter(D => D.level === 'stall').forEach(D => { const A = arcOf(D), w = STALL.w, rects = [];
      const hd = (heads[D.id] || []).map(p => arcNear(A, p[0], p[1]));
      const overlaps = (s0, s1, t0, t1) => { for (const k of [-A.per, 0, A.per]) if (s0 < t1 + k && t0 + k < s1) return true; return false; };
      // the keeper's shelter first: on a fin, where the edge bends hardest (a fin's end, where stalls crowd); in the Garden,
      // facing the Garden's middle; 4.6 m in from the edge, its stretch of edge kept for it
      let sb = 0, best = -1e9;
      for (let s = 0; s < A.per; s += 1) { if (hd.some(h => overlaps(s - 4, s + 4, h - 3.5, h + 3.5))) continue; const p = arcAt(A, s - 4), q = arcAt(A, s + 4), m = normAt(A, s, D);
        const sc = D.group === 'garden' ? -(m.nx * (m.x - P.GARDEN_MESA.x) + m.nz * (m.z - P.GARDEN_MESA.z)) / Math.hypot(m.x - P.GARDEN_MESA.x, m.z - P.GARDEN_MESA.z)
          : Math.abs(Math.atan2(p.tx * q.tz - p.tz * q.tx, p.tx * q.tx + p.tz * q.tz));
        if (sc > best) { best = sc; sb = s; } }
      { const m = normAt(A, sb, D); shelters.push({ id: 'shelter-' + D.stack, deck: D.id, x: m.x - m.nx * 4.6, y: D.y, z: m.z - m.nz * 4.6, ry: Math.atan2(m.nx, m.nz), w: 5.2, d: 4 }); }
      const shR = [sb - 3.8, sb + 3.8];
      let k = 0;
      for (let s = 0; s + w <= A.per + .01; ) {
        const s0 = s - .25, s1 = s + w + .25, a = arcAt(A, s), b = arcAt(A, s + w), turn = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz));
        let bad = turn > 1.2 ? 'bend' : null;
        if (!bad) for (const h of hd) if (overlaps(s0, s1, h - 3.5, h + 3.5)) { bad = 'head'; break; }
        if (!bad && overlaps(s0, s1, shR[0], shR[1])) bad = 'shelter';
        const m = normAt(A, s + w / 2, D), pa = normAt(A, s, D), pb = normAt(A, s + w, D);
        const R = [[pa.x, pa.z], [pb.x, pb.z], [pb.x - pb.nx * STALL.d, pb.z - pb.nz * STALL.d], [pa.x - pa.nx * STALL.d, pa.z - pa.nz * STALL.d]];
        if (!bad && (!convex(R) || Math.hypot(R[2][0] - R[3][0], R[2][1] - R[3][1]) < 5)) bad = 'bend';   // a bend so tight the back would pinch
        if (!bad) for (const Q of rects) if (quadsMeet(R, Q)) { bad = 'crowd'; break; }
        if (!bad && !onDeck(D, R)) bad = 'deck';
        if (!bad) bad = wayOut(D, m.x, m.z, m.nx, m.nz, m.tx, m.tz);
        if (bad) { why[bad]++; s += .5; continue; }
        const px = m.x - m.nx * STALL.perchIn, pz = m.z - m.nz * STALL.perchIn, out = m.nx * m.x + m.nz * m.z > 0;   // facing away from the mesa's middle
        const side = D.group === 'garden' ? 'garden' : out ? 'out' : 'in';
        roosts.push({ id: D.id.replace(/^deck-/, 'roost-') + '-' + (k++), plat: D.id, x: px, y: D.y, z: pz, ox: m.nx, oz: m.nz, ang: Math.atan2(m.nx, m.nz), H: STALL.H, w,
          side, fx: m.x, fz: m.z, wing: D.wing, quad: R });
        rects.push(R); s += w + STALL.gap; } });

    // THE CLIMBS: from the stack's foot on the town's side up to its first deck; from the stall deck on round to the lookout
    decks.forEach(D => { const S = byId(D.stack), t = town(S, P.GARDEN_MESA.x, P.GARDEN_MESA.z);
      let C; if (D.below) { const B0 = deckOf(D.below), c0 = climbs.find(c => c.deck === B0.id); C = climb(rock, K, S, D, B0.id, B0.y, (c0 ? c0.a1 : 0) + Math.PI * .6, 1); }
      else {
        // the climb's start: from the town's side by preference, but its first quarter-turn clear of every other body's rock
        // (a Garden pinnacle beside the Heart starts away from the Heart's wall, not into it)
        const others = rock.filter(B => B !== S && B.top > D.foot && Math.hypot(B.x - S.x, B.z - S.z) < B.R + S.R + 10), pref = Math.atan2(t[1] - S.z, t[0] - S.x) - .5;
        let a0 = pref, bestS = 1e9;
        for (let k = 0; k < 16; k++) { const s0 = pref + k / 16 * TAU; let hit = 0;
          for (let u = 0; u <= 1.2; u += .1) { const a = s0 + u, c = centreAt(K, S, D.foot + 2), r = wallR(K, S, c[0], c[1], a, D.foot + 1) + 1.6, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r;
            if (others.length && K.topAt(others, x, z) > D.foot + .5) hit++; }
          const sc = hit * 10 + Math.min(k, 16 - k) * .01; if (sc < bestS) { bestS = sc; a0 = s0; } }
        C = climb(rock, K, S, D, 'foot', D.foot, a0, 1); }
      climbs.push(C);
      // the hatch: the deck's inner band left open over the climb's last 5 m of run
      const n = C.pts.length, i1 = Math.round(((Math.atan2(C.pts[n - 1][2] - D.z, C.pts[n - 1][0] - D.x) / TAU * N) % N + N) % N), span = Math.ceil(5 / (TAU * (D.R - D.W) / N)) + 1;
      D.hatch = [i1 - span, i1 + 1]; });

    // THE STAIR down the south nose, on the smoothest stretch of the face there (the span between the nose and .3 rad west
    // of it whose face stands least in and out, bed to bed and flute to flute: no gully), the capstan lift east of it.
    // The head 6 m in from the top's edge; straight down the shoulder's ledges to the cliff's lip, cut down into them (never
    // over a ledge's surface, never steeper than 45 degrees); then flights along the face, falling TREAD, each following the
    // face bed by bed, on the wall as drawn, never under rock over it: the flights cut half their width (4.5 m for the top
    // flight and the head, 3 m the rest) into the face over masonry down to the rock; each return flight a timber gallery
    // off the face beyond them on brackets let into the rock 3.6 m under it, so no flight turns under the one before it; a
    // landing platform at each turn. Where it meets the debris slope, a path of steps down the slope to the fair ground. Gated at
    // the head and the foot (the owner removed the middle gate, 2026-10-19)
    const stair = (function () { const Rm = mesa.R, cx = mesa.x, cz = mesa.z, OUT = 3.2, SPAN = .145;
      const rch = (a, y) => wallR(K, mesa, cx, cz, a, y);   // the DRAWN wall
      // a tread's middle: on the drawn wall of the bed under it, and NEVER UNDER ROCK OVER IT: where a bed juts out within
      // 2.2 m over the tread, the tread stands out at that bed's face, carried on masonry down to the bed under it
      const above = (a, y) => { let m = 0; for (const h of [.4, 1, 1.6, 2.2]) m = Math.max(m, rch(a, y + h)); return m; };
      const face = (a, y) => Math.max(rch(a, y - .2), above(a, y));
      // the flights' widths (owner, 2026-10-19: the last switchback up was tight): the head and the top flight 4.5 m, the
      // others 3 m; a point carries its flight's width
      const WK = k => k <= 0 ? 4.5 : 3, WE = 4.5, WO = 3;
      const at = (a, r, y, k, rf) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, r, k, rf, WK(k)];
      const lipY = mesa.top - P.MESA.shoulder.h - .5, capA = Math.atan2(P.TOP.capstan.z - cz, P.TOP.capstan.x - cx);
      // the span: the least rough, a little cost for straying from the nose
      let a0 = Math.PI / 2, best = 1e9;
      for (let s = Math.max(capA + .035, Math.PI / 2 - .04); s <= Math.PI / 2 + .3; s += .01) { let rough = 0;
        for (let y = 30; y <= lipY; y += 15) { let lo = 1e9, hi = -1e9; for (let a = s; a <= s + SPAN; a += .006) { const r = rch(a, y); lo = Math.min(lo, r); hi = Math.max(hi, r); } rough = Math.max(rough, hi - lo); }
        const cost = rough + 30 * Math.abs(s - Math.PI / 2); if (cost < best) { best = cost; a0 = s; } }
      const aE = a0, aW = a0 + SPAN, edge = rch(aE, mesa.top - .6);
      // the shoulder: the ledges' surface along the ray, the stair cut under it, 45 degrees at most (from its foot up)
      // the head starts 6 m in from the top's edge, and further in by as much as the cut would otherwise sink under the top
      // there (a ledge's riser steeper than 45 degrees close after the edge pulls the whole head down): it starts on the top
      const lipT = face(aE, lipY); let t0 = edge - 6, sh = [], shY = [];
      for (let it = 0; it < 5; it++) { sh = []; for (let t = t0; t < lipT; t += .5) sh.push([t, Math.min(mesa.top, drawnTop(K, mesa, cx, cz, aE, t) - .15)]);   // .15 m into the drawn ledge (its surface is a little rough)
        sh.push([lipT, lipY]); shY = sh.map(p => p[1]); shY[shY.length - 1] = lipY;
        for (let i = sh.length - 2; i >= 0; i--) shY[i] = Math.min(sh[i][1], shY[i + 1] + (sh[i + 1][0] - sh[i][0]));
        const sink = mesa.top - .15 - shY[0]; if (sink <= .05) break; t0 -= sink + 1; }
      const pts = sh.map((p, i) => at(aE, p[0], shY[i], -1, 0)), nSh = pts.length;
      // the flights
      const raw = []; let a = aE, y = lipY, dir = 1, k = 0, guard = 0;
      // a flight's centre from the face: cut (k even) on it, built out (k odd) clear of the widest cut flight's outer edge
      const cOf = (f, k) => k % 2 ? f + WE / 2 + .2 + WO / 2 : f;
      const gw = (a, y, k) => { const r = cOf(face(a, y), k) + WK(k) / 2; return ground(cx + Math.cos(a) * r, cz + Math.sin(a) * r); };
      while (guard++ < 8000) { raw.push([a, y, k, face(a, y)]); if (y <= gw(a, y, k) + .6) break;
        let na = a + dir * .5 / Math.max(50, raw[raw.length - 1][3]);
        if (na > aW || na < aE) { k++; dir = -dir; raw.push([a, y, k, face(a, y)]); na = a + dir * .5 / Math.max(50, raw[raw.length - 1][3]); }
        a = na; y -= .5 * TREAD; }
      // eased: within a flight the middle moves in no faster than .35 m a tread, either way along it, so the flight steps out
      // to an overhang over the treads before it and back in over the treads after it instead of jogging; never inside the
      // face rule (it only ever moves out from it)
      const rr = raw.map(p => p[3]);
      for (let i = 1; i < raw.length; i++) if (raw[i][2] === raw[i - 1][2]) rr[i] = Math.max(rr[i], rr[i - 1] - .35);
      for (let i = raw.length - 2; i >= 0; i--) if (raw[i][2] === raw[i + 1][2]) rr[i] = Math.max(rr[i], rr[i + 1] - .35);
      const landings = [];
      // rf: the drawn wall under the tread where its support meets the rock: a cut flight's masonry 2.7 m down, a gallery's
      // brackets 3.6 m down
      raw.forEach((p, i) => { if (i && raw[i - 1][2] !== p[2]) landings.push(pts.length);
        pts.push(at(p[0], cOf(rr[i], p[2]), p[1], p[2], rch(p[0], p[1] - (p[2] % 2 ? 3.6 : 2.7)))); });
      // THE LANDINGS: a platform at each turn, from the cut flight's inner edge (fitted to the wall at its ends and middle by
      // the tread's rule: half the flight into the face, never under rock over it) out past the gallery's outer edge, running
      // on 4.5 m past the turn the way the flight above came (room to turn), on masonry down to the rock 3 m under it. sg: the way (+1/-1 in angle);
      // edge: the line between the two flights
      const slabs = landings.map(li => { const p = pts[li], q = pts[li - 1], q2 = pts[li - 2] || q, a = Math.atan2(p[2] - cz, p[0] - cx), y = p[1];
        const sg = Math.sign(Math.atan2(q[2] - cz, q[0] - cx) - Math.atan2(q2[2] - cz, q2[0] - cx)) || 1, ev = p[4] % 2 ? q : p, od = p[4] % 2 ? p : q, r = ev[3];
        return { li, a, y, sg, out: p[4] % 2 === 1, ends: [-.5, 2, 4.5].map(t => { const aa = a + sg * t / r; return { a: aa, t, inner: face(aa, y) - WK(ev[4]) / 2 }; }),
          outer: od[3] + WO / 2, edge: ev[3] + WK(ev[4]) / 2 + .1, rf: rch(a + sg * 2 / r, y - 3) }; });
      const foot = pts[pts.length - 1], g = [], fair = [P.FAIR.x - 30, P.FAIR.z - P.FAIR.rz + 8], dx = fair[0] - foot[0], dz = fair[1] - foot[2], Lg = Math.hypot(dx, dz);
      for (let s = 0; s <= Lg; s += 1) { const x = foot[0] + dx * s / Lg, z = foot[2] + dz * s / Lg; g.push([x, ground(x, z), z]); }
      const ryOf = (p, q) => Math.atan2(q[0] - p[0], q[2] - p[2]);
      // two gates (owner, 2026-10-19: the middle one stood in the walk; removed): the head and the foot
      const gates = [{ id: 'gate-head', name: 'The Stair\'s head gate', x: pts[0][0], y: pts[0][1], z: pts[0][2], ry: ryOf(pts[0], pts[1]), w: 3.6 },
        { id: 'gate-foot', name: 'The Stair\'s foot gate', x: g[2][0], y: g[2][1], z: g[2][2], ry: ryOf(g[2], g[Math.min(8, g.length - 1)]), w: 3.6 }];
      return { id: 'stair', name: 'The Stair (the one walking way up, cut in the south nose)', pts, shoulder: nSh, flights: k + 1, landings, slabs, ground: g, gates, w: 3, out: OUT, a0: aE, a1: aW, rough: best }; })();

    // THE LIFT ROAD: the beast lift's landing on the debris slope reached by a road (owner, 2026-10-19). Laid out as a road
    // on a slope is: its grade set first, 1 in 9 down from the landing's height (it reaches the slope's toe north of the seep pond), then the road put where the slope stands
    // at that height, going round the mesa's north-west (the first point out from the rock's feet, along each ray from the
    // mesa's middle, where the ground falls to the road's height: round the spurs, on the slope's side of the gorge), so
    // its bench is level across with little cut or fill; at the slope's toe it goes over the floor west of the seep pond
    // (PR.LIFT_ROAD) to the palisade, where the north-west gate will stand
    const roads = [];
    (function () { const L = lifts.find(l => l.id === 'lift-north'), fD = o.footD; if (!L || !fD) return;
      const cx = mesa.x, cz = mesa.z, aL = Math.atan2(L.foot.z - cz, L.foot.x - cx), TW = o.talusW == null ? 125 : o.talusW, GRADE = 1 / 9;
      // the first point out along the ray, past the rock's feet, where the ground is at h or below
      const at = (a, h) => { const ca = Math.cos(a), sa = Math.sin(a); let t = 10; while (t < mesa.R + 400 && fD(cx + ca * t, cz + sa * t) < 1) t += 4;
        const t0 = t; while (t < t0 + 400 && ground(cx + ca * t, cz + sa * t) > h) t += 1;
        return [cx + ca * t, cz + sa * t]; };
      const P2 = [[L.foot.x, L.foot.z, L.foot.y]];
      let a = aL, h = L.foot.y, prev = P2[0], toe = false, guard = 0;
      while (!toe && guard++ < 2000 && a > aL - 2.2) {
        // the next point 3 m on round the slope: an angle step sized to the radius, the height down by the grade over it
        const r = Math.hypot(prev[0] - cx, prev[1] - cz), na = a - 3 / Math.max(50, r), p = at(na, h - 3 * GRADE), run = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        h -= run * GRADE; a = na; const q = [p[0], p[1], h]; P2.push(q); prev = q;
        if (fD(p[0], p[1]) > TW || h <= ground(cx + Math.cos(a) * (Math.hypot(p[0] - cx, p[1] - cz) + 30), cz + Math.sin(a) * (Math.hypot(p[0] - cx, p[1] - cz) + 30)) + .5) toe = true; }
      const benchEnd = P2.length;
      (P.LIFT_ROAD || []).forEach(p => P2.push([p[0], p[1], null]));
      // the gate: the palisade's point nearest the last waypoint
      const last = P2[P2.length - 1]; let gi = 0, gd = 1e9; P.PALISADE.forEach((p, i) => { const d = Math.hypot(p[0] - last[0], p[1] - last[1]); if (d < gd) { gd = d; gi = i; } });
      const G = P.PALISADE[gi]; P2.push([G[0], G[1], null]);
      // resampled 3 m apart; on the slope its laid-out height, over the floor the ground's smoothed over 12 m either way
      const R3 = [P2[0]]; for (let i = 1; i < P2.length; i++) { const p = R3[R3.length - 1], q = P2[i], d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < 1.5 && i < P2.length - 1) continue;
        const n = Math.max(1, Math.round(d / 3)); for (let s = 1; s <= n; s++) R3.push([p[0] + (q[0] - p[0]) * s / n, p[1] + (q[1] - p[1]) * s / n, q[2] == null || p[2] == null ? null : p[2] + (q[2] - p[2]) * s / n]); }
      const gy = R3.map(p => ground(p[0], p[1])), sm = gy.map((v, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - 4); j <= Math.min(gy.length - 1, i + 4); j++) { s += gy[j]; n++; } return s / n; });
      let firstFloor = R3.findIndex(p => p[2] == null); if (firstFloor < 0) firstFloor = R3.length;
      const y = R3.map((p, i) => p[2] != null ? p[2] : sm[i]);
      // the join from the slope's last laid-out point to the floor: eased over 30 m
      for (let i = firstFloor; i < Math.min(R3.length, firstFloor + 10); i++) { const u = (i - firstFloor + 1) / 11; y[i] = y[firstFloor - 1] * (1 - u) + sm[i] * u; }
      // and never steeper than 1 in 8 anywhere (over a spur's debris slope the floor's line would be): held to it both ways
      // from the landing; on the slope the ground is cut or built up to it (47b), on the floor its walls and cuts show it
      for (let i = 1; i < y.length; i++) { const run = Math.hypot(R3[i][0] - R3[i - 1][0], R3[i][1] - R3[i - 1][1]); y[i] = Math.max(y[i - 1] - run / 8, Math.min(y[i - 1] + run / 8, y[i])); }
      for (let i = y.length - 2; i >= 1; i--) { const run = Math.hypot(R3[i + 1][0] - R3[i][0], R3[i + 1][1] - R3[i][1]); y[i] = Math.max(y[i + 1] - run / 8, Math.min(y[i + 1] + run / 8, y[i])); }
      let bench = 0; R3.forEach((p, i) => { if (fD(p[0], p[1]) < TW) bench = i; });
      const pts = R3.map((p, i) => [p[0], y[i], p[1]]), gate = { id: 'gate-nw', name: 'The north-west gate (the palisade, P3)', x: G[0], y: ground(G[0], G[1]), z: G[1] };
      roads.push({ id: 'road-lift', name: 'The lift road (from the beast lift\'s landing, cut along the debris slope to the north-west gate)', pts, w: 5, bench: [0, bench], benchEnd, gate, grade: GRADE });
    })();
    const ways = [{ id: 'way-stair', name: 'The Stair\'s path down the debris slope', pts: stair.ground.map(p => [p[0], p[2]]), w: 3.4 }]
      .concat(roads.map(R => ({ id: 'way-' + R.id, name: R.name, pts: R.pts.map(p => [p[0], p[2]]), w: R.w + 1 })));

    decks.forEach(D => { delete D.near; });
    return { decks, roosts, shelters, climbs, bridges, lifts, stair, roads, ways, why };
  }
  const bridgeY = (br, t) => br.a.y + (br.b.y - br.a.y) * t - br.sag * 4 * t * (1 - t);
  return { plan, reach, wallR, bridgeY, STALL, DECK, N, WALL };
})();
if (typeof module !== 'undefined') module.exports = PRR;
