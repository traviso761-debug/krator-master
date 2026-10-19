// ================================================================= PINNACLE ROCK — the Deep Root cavern (P3d)  [G data]
// PRD.plan(o) lays out the Riders' holiest site (PLAN.md section 1, "The Deep Root cavern"): under the precinct north-west
// of the Crown, a court sunk 8 m into the beds with a stair down into it, the carved face round the door in its west wall
// (the twelve tribes' beasts under the claw), the passage of the tribes going down from it (a niche for each tribe), and
// the hall (44 by 26 m, 15 m to its vault's crown): the five shrines' lamp niches, ledges of offerings, the altar stone
// left standing at its west end, a rain pool under the light well; over the well a stack fig whose roots hang 12 m down
// it, in a ring of twelve standing stones with nothing built inside. The voids are a KCAVERN plan (core/terrain/
// 39-core-cavern.js): a trench (the court), two stairs (into the court; the passage), a room (the hall, vaulted) and a
// shaft (the light well), with two well openings through the cap (the court's and the light well's). The dressing is the
// Beast Riders kit's rock-cut pieces (BR_ROCK: _cavern_door, _tribe_niche, _lamp_niche, _offering_ledge, _altar), each
// against its wall (the kit's frame: its back the plane z = -d/2, the wall's face 0.5 m in front of it). Plain records.
//
//   o = {PR, KC (KCAVERN), ground(x, z) (the cap's top), top (the cap's height), dims(key, v) -> {w, d, h}, tribes (the
//        twelve in the lore's order: BR_CAMP_TRIBES), wayEnd ([x, z]: where the town's processional ends), tags, seed}
//   -> {C (the cavern, built), axis {c, u, v}, court, stair, passage, hall, well, openings, dress, stones, fig, pool, way}
const PRD = (function () {
  'use strict';
  const DEPTH = 8, COURT = [24, 20], PASS = { L: 22, w: 5, h: 5.4, drop: 10 }, HALL = { L: 44, W: 26, h: 10, rise: 5 }, WELL_R = 3.5, EMBED = 0.5;
  function plan(o) {
    const PR = o.PR, T = PR.TOP, top = o.top, tags = o.tags || null;
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-cavern') >>> 0;
    const u0 = [T.well.x - T.court.x, T.well.z - T.court.z], ul = Math.hypot(u0[0], u0[1]), u = [u0[0] / ul, u0[1] / ul], v = [-u[1], u[0]];
    const C0 = [T.court.x, T.court.z], at = (a, b) => [C0[0] + u[0] * a + v[0] * b, C0[1] + u[1] * a + v[1] * b];
    const rect = (a0, a1, b0, b1) => [at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)].map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]);
    const yC = top - DEPTH, yH = yC - PASS.drop;
    // the voids
    const court = { id: 'court', poly: rect(-COURT[0] / 2, COURT[0] / 2, -COURT[1] / 2, COURT[1] / 2), y0: yC, y1: top + 1 };
    const sA = at(-COURT[0] / 2 - DEPTH * 1.45, 0), sB = at(-COURT[0] / 2 + 0.6, 0);
    // cut open to the sky (its clear height over the ground all the way down: no roof)
    const stair = { id: 'court-stair', a: [sA[0], top + 0.3, sA[1]], b: [sB[0], yC, sB[1]], w: 4, h: DEPTH + 3 };
    const p0 = COURT[0] / 2 - 0.6, p1 = COURT[0] / 2 + PASS.L, pA = at(p0, 0), pB = at(p1, 0);
    const passage = { id: 'passage', a: [pA[0], yC, pA[1]], b: [pB[0], yH, pB[1]], w: PASS.w, h: PASS.h };
    const h0 = p1 - 0.6, h1 = h0 + HALL.L;
    const hall = { id: 'hall', poly: rect(h0, h1, -HALL.W / 2, HALL.W / 2), y: yH, h: HALL.h, ceil: 'vault', rise: HALL.rise, r: 3 };
    const W = [T.well.x, T.well.z], wellA = (W[0] - C0[0]) * u[0] + (W[1] - C0[1]) * u[1];
    const well = { id: 'light-well', c: W, y0: yH + HALL.h - 1, y1: top + 1, r0: WELL_R, r1: WELL_R + 0.4 };
    const courtC = at(-7, 0), openings = [{ id: 'court-open', c: courtC, r: 22, rim: 3, kind: 'well' }, { id: 'well-open', c: W, r: WELL_R + 0.5, rim: 2, kind: 'well' }];
    // the cavern
    const C = o.KC.create({ ground: o.ground, cell: 0.5, chunk: 16, seed, walk: null, minRock: 0.8 });
    C.trench(Object.assign({ owner: 'court', rock: 'tuff', finish: 'hewn' }, court));
    C.stair(Object.assign({ owner: 'court', rock: 'tuff', finish: 'hewn' }, stair));
    C.stair(Object.assign({ owner: 'passage', rock: 'tuff', finish: 'hewn' }, passage));
    C.room(Object.assign({ owner: 'hall', rock: 'tuff', finish: 'hewn' }, hall));
    C.shaft(Object.assign({ owner: 'hall', rock: 'tuff', finish: 'raw' }, well));
    openings.forEach(q => C.opening(q));
    C.build();
    // ---------------------------------------------------------------- the dressing: each piece against its wall
    // a piece at wall point (a, b) of the axis frame, its front along (na, nb) (into the void), its floor y, scaled s
    const dress = [];
    const put = (key, vv, a, b, na, nb, y, s, name) => { const D = o.dims(key, vv); if (!D) return null; s = s == null ? 1 : s;
      const n = [u[0] * na + v[0] * nb, u[1] * na + v[1] * nb], wp = at(a, b), off = (D.d / 2 - EMBED) * s;
      const rec = { key, v: vv, x: +(wp[0] + n[0] * off).toFixed(3), z: +(wp[1] + n[1] * off).toFixed(3), y: +y.toFixed(3), ry: +Math.atan2(n[0], n[1]).toFixed(4), s,
        w: D.w * s, d: D.d * s, h: D.h * s, name, tag: null }; dress.push(rec); return rec; };
    // the carved face round the door, on the court's west wall, scaled to the court's depth (the kit's is 14.8 m high)
    { const D = o.dims('br_bldg_rock_cavern_door', 0); if (D) put('br_bldg_rock_cavern_door', 0, COURT[0] / 2, 0, -1, 0, yC, Math.min(1, (DEPTH - 0.2) / D.h), 'the carved face round the Deep Root\'s door'); }
    // the passage of the tribes: six niches each side, in the lore's order down the left wall and back up the right
    const tribes = o.tribes || [];
    for (let i = 0; i < 12; i++) { const side = i < 6 ? 1 : -1, k = i < 6 ? i : 11 - i, a = p0 + 3 + (PASS.L - 4) * (k + 0.5) / 6, y = yC + (yH - yC) * (a - p0) / (p1 - p0);
      put('br_bldg_rock_tribe_niche', i, a, side * PASS.w / 2, 0, -side, y, 1, 'the ' + (tribes[i] || 'tribe ' + (i + 1)) + ' niche (the passage of the tribes)'); }
    // the hall: the five shrines' lamp niches down its north wall, two ledges of offerings on its south wall, the altar at
    // its west end
    const SHR = ['the First Bough', 'the Rain Mother', 'the Winged Ones', 'the Deep Root', 'the Green Silence'];
    for (let i = 0; i < 5; i++) put('br_bldg_rock_lamp_niche', i, h0 + 6 + (HALL.L - 12) * i / 4, HALL.W / 2, 0, -1, yH, 1, 'the lamp niche of ' + SHR[i]);
    put('br_bldg_rock_offering_ledge', 0, h0 + 12, -HALL.W / 2, 0, 1, yH, 1, 'a ledge of offerings');
    put('br_bldg_rock_offering_ledge', 1, h0 + 30, -HALL.W / 2, 0, 1, yH, 1, 'a ledge of offerings');
    put('br_bldg_rock_altar', 0, h1, 0, -1, 0, yH, 1, 'the altar stone of the Deep Root');
    // ---------------------------------------------------------------- the surface: the ring of stones, the fig, the way
    const stones = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.13, r = 14, x = W[0] + Math.cos(a) * r, z = W[1] + Math.sin(a) * r, hs = KRAND.unit(KRAND.hash(seed, 5, i));
      stones.push({ x: +x.toFixed(3), z: +z.toFixed(3), y: +o.ground(x, z).toFixed(3), h: +(3.2 + 1.6 * hs).toFixed(2), w: +(1.1 + 0.5 * KRAND.unit(KRAND.hash(seed, 6, i))).toFixed(2), d: 0.7,
        ry: +(a + Math.PI / 2 + (KRAND.unit(KRAND.hash(seed, 7, i)) - 0.5) * 0.3).toFixed(4), name: 'a standing stone of the Deep Root\'s ring (' + (tribes[i] || i + 1) + ')', tag: null }); }
    // the stack fig on the well's lip, on the side toward the hall's door, its roots down the well 12 m
    const fx = W[0] - u[0] * (WELL_R + 1.2), fz = W[1] - u[1] * (WELL_R + 1.2), fig = { x: +fx.toFixed(3), z: +fz.toFixed(3), y: +o.ground(fx, fz).toFixed(3), roots: 12, H: 16, name: 'the stack fig over the light well', tag: null };
    const pool = { c: W, r: WELL_R - 0.3, y: yH + 0.12, name: 'the rain pool under the light well' };
    const sTop = [sA[0], sA[1]], way = o.wayEnd ? { id: 'way-processional', name: 'the processional (the Crown to the Deep Root\'s court)', pts: [o.wayEnd, at(-COURT[0] / 2 - DEPTH * 1.45 - 6, 0)].map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]), w: 6 } : null;
    // ---------------------------------------------------------------- core/tags: every record before anything draws it
    if (tags) {
      [['court', court.poly, yC, 'the Deep Root\'s sunken court'], ['hall', hall.poly, yH, 'the hall of the Deep Root']].forEach(q => { const P = q[1], cx = P.reduce((s, p) => s + p[0], 0) / 4, cz = P.reduce((s, p) => s + p[1], 0) / 4;
        tags.add({ 'class': 'feature', kind: 'cavern', key: 'cavern:' + q[0], at: [cx, q[2], cz], ry: 0, size: [0, 0, 0], note: q[3], src: 'pinnacle-rock' }); });
      dress.forEach(d => { const T2 = tags.add({ 'class': 'fixture', kind: 'rock-cut', key: d.key, at: [d.x, d.y, d.z], ry: d.ry, size: [d.w, d.d, d.h], note: d.name, src: 'pinnacle-rock' }); if (T2) d.tag = T2.id; });
      stones.forEach(st => { const T2 = tags.add({ 'class': 'landmark', kind: 'standing stone', key: 'standing-stone', at: [st.x, st.y, st.z], ry: st.ry, size: [st.w, st.d, st.h], note: st.name, src: 'pinnacle-rock' }); if (T2) st.tag = T2.id; });
      { const T2 = tags.add({ 'class': 'flora', kind: 'tree', key: 'tree:stack fig', at: [fig.x, fig.y, fig.z], ry: 0, size: [12, 12, fig.H], note: fig.name, src: 'pinnacle-rock' }); if (T2) fig.tag = T2.id; }
    }
    return { C, axis: { c: C0, u, v }, court, stair, passage, hall, well, wellA, openings, dress, stones, fig, pool, way, y: { court: yC, hall: yH, top } };
  }
  return { plan, DEPTH, COURT, PASS, HALL, WELL_R };
})();
