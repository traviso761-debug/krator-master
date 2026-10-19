// ================================================================= PINNACLE ROCK — the Deep Root cavern (P3d)  [G data]
// PRD.plan(o) lays out the Riders' holiest site (PLAN.md section 1, "The Deep Root cavern"; the owner, 2026-10-19: "open
// from the mesa wall, spiral its passageway down, around, and backward, then have the light well and chamber under the
// surface of the first mesa"). The door is cut in the Garden's mesa's wall on the side toward the precinct, the kit's
// carved face round it (the twelve tribes' beasts under the claw); the passage goes in level, turns down round a newel of
// rock one and a half times inside the Garden's mesa, comes back out under its own door heading the way it came, and runs
// down under the first mesa's top as the passage of the tribes (a niche for each tribe) to the hall (44 by 26 m, 15 m
// to its vault's crown): the five shrines' lamp niches, ledges of offerings, the altar stone left standing at its west
// end, a rain pool under the light well; over the well, on the first mesa's top, a stack fig whose roots hang down it, in
// a ring of twelve standing stones with nothing built inside. The voids are a KCAVERN plan (core/terrain/39-core-cavern.js,
// its ground the first mesa's top and the Garden's mesa as one heightfield): stairs (every leg of the passage), a room
// (the hall, vaulted) and a shaft (the light well), a door opening in the wall and a well opening through the cap. The
// dressing is the Beast Riders kit's rock-cut pieces (BR_ROCK: _cavern_door (its open variant), _tribe_niche,
// _lamp_niche, _offering_ledge, _altar), each against its wall (the kit's frame: its back the plane z = -d/2, the wall's
// face 0.5 m in front of it). Plain records.
//
//   o = {PR, KC (KCAVERN), ground(x, z) (the tops: the first mesa's and the Garden's), top (the first mesa's height),
//        garden (the Garden's mesa), wallR(S, cx, cz, a, y) (a body's DRAWN wall's radius: PRR.wallR), dims(key, v),
//        tribes (the twelve in the lore's order), wayEnd ([x, z]: where the town's processional ends), tags, seed}
//   -> {C (the cavern, built), axis {c, u, v}, door, path (the passage's floor, [x, y, z, w] a point), passage, hall, well,
//       wellA, openings, dress, stones, fig, pool, way, apron, y}
const PRD = (function () {
  'use strict';
  const PASS = { w: 3.6, h: 5.4, tribes: 5 }, SPIRAL = { R: 10, turns: 1.5, inL: 12, drop: 12.5 }, HALL = { L: 44, W: 26, h: 10, rise: 5, depth: 18 }, WELL_R = 3.5, EMBED = 0.5;
  function plan(o) {
    const PR = o.PR, T = PR.TOP, top = o.top, tags = o.tags || null, G = o.garden;
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-cavern') >>> 0;
    // the hall's frame (the settled precinct: from the court's old place toward the light well)
    const u0 = [T.well.x - T.court.x, T.well.z - T.court.z], ul = Math.hypot(u0[0], u0[1]), u = [u0[0] / ul, u0[1] / ul], v = [-u[1], u[0]];
    const C0 = [T.court.x, T.court.z], at = (a, b) => [C0[0] + u[0] * a + v[0] * b, C0[1] + u[1] * a + v[1] * b];
    const rect = (a0, a1, b0, b1) => [at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)].map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]);
    const yH = top - HALL.depth, h0 = T.deepRoot.hallAt, h1 = h0 + HALL.L, E = at(h0, 0);
    const hall = { id: 'hall', poly: rect(h0, h1, -HALL.W / 2, HALL.W / 2), y: yH, h: HALL.h, ceil: 'vault', rise: HALL.rise, r: 3 };
    const W = [T.well.x, T.well.z], wellA = (W[0] - C0[0]) * u[0] + (W[1] - C0[1]) * u[1];
    const well = { id: 'light-well', c: W, y0: yH + HALL.h - 1, y1: top + 1, r0: WELL_R, r1: WELL_R + 0.4 };
    // THE DOOR: on the Garden's mesa's drawn wall where it faces the hall's door end; the wall's outward normal there from
    // the drawn wall's own run either side
    // the flattest stretch of the weathered wall within 0.12 rad of the bearing, over the carved face's width (17 m): a
    // line fitted through the drawn wall there, its normal the door's, the face set at the proudest point (so the face's
    // back is in the rock all along, and the deepest point lies least behind it)
    const yW = top + 2, wp = a => { const r = o.wallR(G, G.x, G.z, a, yW); return [G.x + Math.cos(a) * r, G.z + Math.sin(a) * r]; };
    let best = null;
    for (let aa = T.deepRoot.a - 0.12; aa <= T.deepRoot.a + 0.12001; aa += 0.01) { const c = wp(aa), R0 = Math.hypot(c[0] - G.x, c[1] - G.z), Q = [];
      for (let s = -8.5; s <= 8.501; s += 1.7) Q.push(wp(aa + s / R0));
      const mx = Q.reduce((s, q) => s + q[0], 0) / Q.length, mz = Q.reduce((s, q) => s + q[1], 0) / Q.length;
      let sxx = 0, sxz = 0, szz = 0; Q.forEach(q => { const dx = q[0] - mx, dz = q[1] - mz; sxx += dx * dx; sxz += dx * dz; szz += dz * dz; });
      const th = 0.5 * Math.atan2(2 * sxz, sxx - szz), tv = [Math.cos(th), Math.sin(th)];
      let nv = [-tv[1], tv[0]]; if (nv[0] * (mx - G.x) + nv[1] * (mz - G.z) < 0) nv = [-nv[0], -nv[1]];
      const dn = Q.map(q => (q[0] - mx) * nv[0] + (q[1] - mz) * nv[1]), proud = Math.max(...dn), spread = proud - Math.min(...dn);
      if (!best || spread < best.spread - 1e-6) best = { a: aa, spread, n: nv, p: [mx + nv[0] * proud, mz + nv[1] * proud] }; }
    const aD = best.a, n = best.n, Dp = best.p;
    const t = [-n[1], n[0]], yS = top + 0.3, door = { x: +Dp[0].toFixed(3), z: +Dp[1].toFixed(3), y: top, n, a: aD, spread: +best.spread.toFixed(2) };
    // THE PASSAGE: in level from 4 m outside the face to SPIRAL.inL inside it, then round a newel (centre beside the
    // entry, so the turn starts along it) one and a half turns, down SPIRAL.drop, coming out heading back the way it came
    // (2 R to the side of the entry and under it), on out beyond the wall and down under the first mesa's top to the hall
    const L = (p, d, s) => [p[0] + n[0] * d + t[0] * s, p[1] + n[1] * d + t[1] * s];
    const P0 = L(Dp, 4, 0), P1 = L(Dp, -SPIRAL.inL, 0), R = SPIRAL.R, S = [P1[0] + t[0] * R, P1[1] + t[1] * R], path = [];
    path.push([P0[0], yS, P0[1], PASS.w], [P1[0], yS, P1[1], PASS.w]);
    const TH = SPIRAL.turns * 2 * Math.PI, K = 36;
    for (let k = 1; k <= K; k++) { const th = TH * k / K, y = yS - SPIRAL.drop * k / K;
      // p(th) = S + R(-t cos th - n sin th): th 0 is the entry's end, heading -n; th 3 pi is 2R across, heading +n
      path.push([S[0] + R * (-t[0] * Math.cos(th) - n[0] * Math.sin(th)), y, S[1] + R * (-t[1] * Math.cos(th) - n[1] * Math.sin(th)), PASS.w]); }
    const X = path[path.length - 1], yX = X[1], Y = L([X[0], X[2]], SPIRAL.inL + 10, 0), yY = yX - 1;
    path.push([Y[0], yY, Y[1], PASS.w + 1.4]);
    const E1 = at(h0 + 1.5, 0); path.push([E1[0], yH, E1[1], PASS.w + 1.4]);
    const passage = { id: 'passage', legs: path.length - 1, spiral: { c: S, R, turns: SPIRAL.turns } };
    const openings = [{ id: 'door-open', kind: 'door', c: [Dp[0] + n[0] * 1.5, Dp[1] + n[1] * 1.5], y: yS, r: 6, h: PASS.h + 0.6 }, { id: 'well-open', c: W, r: WELL_R + 0.5, rim: 2, kind: 'well' }];
    // the cavern
    const C = o.KC.create({ ground: o.ground, cell: 0.5, chunk: 16, seed, walk: o.walk || null, minRock: 0.8 });   // its floors into core/walk
    for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i];
      C.stair({ id: 'passage-' + i, owner: 'passage', rock: 'tuff', finish: 'hewn', a: [a[0], a[1], a[2]], b: [b[0], b[1], b[2]], w: Math.max(a[3], b[3]), h: PASS.h }); }
    C.room(Object.assign({ owner: 'hall', rock: 'tuff', finish: 'hewn' }, hall));
    C.shaft(Object.assign({ owner: 'hall', rock: 'tuff', finish: 'raw' }, well));
    openings.forEach(q => C.opening(q));
    C.build();
    // ---------------------------------------------------------------- the dressing: each piece against its wall
    const dress = [];
    // a piece against a wall at world point (wx, wz), its front along (nx, nz) (out of the rock), its floor y, scaled s
    const putW = (key, vv, wx, wz, nx, nz, y, s, name) => { const D = o.dims(key, vv); if (!D) return null; s = s == null ? 1 : s; const off = (D.d / 2 - EMBED) * s;
      const rec = { key, v: vv, x: +(wx + nx * off).toFixed(3), z: +(wz + nz * off).toFixed(3), y: +y.toFixed(3), ry: +Math.atan2(nx, nz).toFixed(4), s, w: D.w * s, d: D.d * s, h: D.h * s, name, tag: null };
      dress.push(rec); return rec; };
    const put = (key, vv, a, b, na, nb, y, s, name) => { const p = at(a, b); return putW(key, vv, p[0], p[1], u[0] * na + v[0] * nb, u[1] * na + v[1] * nb, y, s, name); };
    // the carved face round the door, full size (its doorway open: the kit's v1), on the Garden's mesa's drawn wall
    putW('br_bldg_rock_cavern_door', 1, Dp[0], Dp[1], n[0], n[1], top, 1, 'the carved face round the Deep Root\'s door');
    // the passage of the tribes: on its last leg (under the first mesa's top), six niches each side in the lore's order
    // down the left wall and back up the right
    const tribes = o.tribes || [], A = path[path.length - 2], B = path[path.length - 1], lx = B[0] - A[0], lz = B[2] - A[2], ll = Math.hypot(lx, lz), ux = lx / ll, uz = lz / ll, wq = B[3];
    for (let i = 0; i < 12; i++) { const side = i < 6 ? 1 : -1, k = i < 6 ? i : 11 - i, f = 0.18 + 0.5 * (k + 0.5) / 6, cx = A[0] + lx * f, cz = A[2] + lz * f, y = A[1] + (B[1] - A[1]) * f;
      const sx = -uz * side, sz = ux * side;   // the side's outward (into the rock) direction
      putW('br_bldg_rock_tribe_niche', i, cx + sx * wq / 2, cz + sz * wq / 2, -sx, -sz, y, 1, 'the ' + (tribes[i] || 'tribe ' + (i + 1)) + ' niche (the passage of the tribes)'); }
    // the hall: the five shrines' lamp niches down its north wall, two ledges of offerings on its south wall, the altar at
    // its west end
    const SHR = ['the First Bough', 'the Rain Mother', 'the Winged Ones', 'the Deep Root', 'the Green Silence'];
    for (let i = 0; i < 5; i++) put('br_bldg_rock_lamp_niche', i, h0 + 6 + (HALL.L - 12) * i / 4, HALL.W / 2, 0, -1, yH, 1, 'the lamp niche of ' + SHR[i]);
    put('br_bldg_rock_offering_ledge', 0, h0 + 12, -HALL.W / 2, 0, 1, yH, 1, 'a ledge of offerings');
    put('br_bldg_rock_offering_ledge', 1, h0 + 30, -HALL.W / 2, 0, 1, yH, 1, 'a ledge of offerings');
    put('br_bldg_rock_altar', 0, h1, 0, -1, 0, yH, 1, 'the altar stone of the Deep Root');
    // ---------------------------------------------------------------- the surface: the ring of stones, the fig, the ways
    const stones = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.13, r = 14, x = W[0] + Math.cos(a) * r, z = W[1] + Math.sin(a) * r, hs = KRAND.unit(KRAND.hash(seed, 5, i));
      stones.push({ x: +x.toFixed(3), z: +z.toFixed(3), y: +o.ground(x, z).toFixed(3), h: +(3.2 + 1.6 * hs).toFixed(2), w: +(1.1 + 0.5 * KRAND.unit(KRAND.hash(seed, 6, i))).toFixed(2), d: 0.7,
        ry: +(a + Math.PI / 2 + (KRAND.unit(KRAND.hash(seed, 7, i)) - 0.5) * 0.3).toFixed(4), name: 'a standing stone of the Deep Root\'s ring (' + (tribes[i] || i + 1) + ')', tag: null }); }
    // the stack fig on the well's lip, on the side toward the hall's door, its roots down the well to the rain pool
    const fx = W[0] - u[0] * (WELL_R + 1.2), fz = W[1] - u[1] * (WELL_R + 1.2), fig = { x: +fx.toFixed(3), z: +fz.toFixed(3), y: +o.ground(fx, fz).toFixed(3), roots: top - yH - 1, H: 16, name: 'the stack fig over the light well', tag: null };
    const pool = { c: W, r: WELL_R - 0.3, y: yH + 0.12, name: 'the rain pool under the light well' };
    // the processional to the ring of stones (from the town's avenue of that name), and the apron before the door
    const toRing = (() => { if (!o.wayEnd) return null; const dx = W[0] - o.wayEnd[0], dz = W[1] - o.wayEnd[1], dl = Math.hypot(dx, dz) || 1; return [W[0] - dx / dl * 17, W[1] - dz / dl * 17]; })();
    const way = toRing ? { id: 'way-processional', name: 'the processional (the Crown to the Deep Root\'s ring of stones)', pts: [o.wayEnd, toRing].map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]), w: 6 } : null;
    const apron = { id: 'way-deep-root-door', name: 'the apron before the Deep Root\'s door', pts: [L(Dp, 3.2, 0), L(Dp, 22, 0)].map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]), w: 9 };
    // ---------------------------------------------------------------- core/tags: every record before anything draws it
    if (tags) {
      { const P = hall.poly, cx = P.reduce((s, p) => s + p[0], 0) / 4, cz = P.reduce((s, p) => s + p[1], 0) / 4;
        tags.add({ 'class': 'feature', kind: 'cavern', key: 'cavern:hall', at: [cx, yH, cz], ry: 0, size: [HALL.L, HALL.W, HALL.h + HALL.rise], note: 'the hall of the Deep Root', src: 'pinnacle-rock' }); }
      tags.add({ 'class': 'feature', kind: 'cavern', key: 'cavern:passage', at: [S[0], yS - SPIRAL.drop / 2, S[1]], ry: 0, size: [2 * R, 2 * R, SPIRAL.drop], note: 'the passage of the Deep Root (its spiral, then the passage of the tribes)', src: 'pinnacle-rock' });
      dress.forEach(d => { const T2 = tags.add({ 'class': 'fixture', kind: 'rock-cut', key: d.key, at: [d.x, d.y, d.z], ry: d.ry, size: [d.w, d.d, d.h], note: d.name, src: 'pinnacle-rock' }); if (T2) d.tag = T2.id; });
      stones.forEach(st => { const T2 = tags.add({ 'class': 'landmark', kind: 'standing stone', key: 'standing-stone', at: [st.x, st.y, st.z], ry: st.ry, size: [st.w, st.d, st.h], note: st.name, src: 'pinnacle-rock' }); if (T2) st.tag = T2.id; });
      { const T2 = tags.add({ 'class': 'flora', kind: 'tree', key: 'tree:stack fig', at: [fig.x, fig.y, fig.z], ry: 0, size: [12, 12, fig.H], note: fig.name, src: 'pinnacle-rock' }); if (T2) fig.tag = T2.id; }
    }
    return { C, axis: { c: C0, u, v }, door, path, passage, hall, well, wellA, openings, dress, stones, fig, pool, way, apron, y: { door: yS, hall: yH, top } };
  }
  return { plan, PASS, SPIRAL, HALL, WELL_R };
})();
