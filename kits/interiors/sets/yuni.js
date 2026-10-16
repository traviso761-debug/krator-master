/* ======================== Interior set: Yuni (base kit, as built by Locus and Mungo) ========================
   The interiors of Yuni's middle-class houses (family 'mid') as the Locus engine builds them:
   settlements/locus/src/55-mid-example.js (mid_washed_house) and 56-mid.js "16b" (the other five), both
   forked from Yuni. One item per ASSET key for variant 0 and one `<key>#n` item for EVERY variant n > 0,
   so a world looks a placed house up as byKey[v ? key + '#' + v : key]. A variant whose rooms are the same
   as another's (only its colours, wash or roof dressing differ) is `like` that one.
   Local frame = the builder's F: origin at the plot centre on the ground, +x right, +z the front, metres.
   The walls are battered mud: `fr8` leans every face in to 84 % at its top, `rbody` (rounded corners rc)
   to k at its parapet top. A body is planned on ONE outline (the planner fits its stair along an exterior
   wall of every storey, so the storeys share it): the OUTER face at the house's mid-height, so the inner
   face stays inside the leaning shell from the ground floor to the top ceiling; the rounded bodies are
   octagons chamfered half way to the arcs (the inner corner stays 0.18 m inside the arc). Floor-to-floor 3.2 m (the windows' storeys) unless a note says otherwise.
   Furniture culture yuni-common (falls back through yuni-court, yuni-poor, sahelian, nomad, order,
   generic). Wealth = the middle of the ASSET's wealth band. Types = settlements/locus/src/64-locus-infra.js
   section 3 ('single-family dwelling'; Yuni's own tag is dwelling-single). sets/README.md says how an item
   is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const R3 = function (v) { return Math.round(v * 1000) / 1000; };
  const PI = Math.PI;
  const CULT = 'yuni-common', DW = ['single-family dwelling'];
  const WALL = 0.45;                                   /* the mud walls (the Locus still-house reads 0.5) */
  /* a steep mud-house stair (0.2 risers on 0.22 treads, 0.9 wide): 3.2 m rises in 3.3 m of run, so it fits along a
     house's side wall and the storey's cut does not have to run round it */
  const STEEP = { w: 0.9, riser: 0.2, tread: 0.22 };

  /* ---- the builders' bodies, read back as outlines ---------------------------------------------- */
  /* fr8(cx, 0, cz, W, H, D): the block leans in to 84 % at its top H; the outer face at height y */
  function fr8(W, D, cx, cz, H, y) { const s = 1 - 0.16 * y / H; return rect(R3(W * s), R3(D * s), cx, cz); }
  /* an octagon: half sizes a x b, corners chamfered by c */
  function oct(a, b, c, cx, cz) {
    return [[cx - a + c, cz - b], [cx + a - c, cz - b], [cx + a, cz - b + c], [cx + a, cz + b - c],
      [cx + a - c, cz + b], [cx - a + c, cz + b], [cx - a, cz + b - c], [cx - a, cz - b + c]].map(function (p) { return [R3(p[0]), R3(p[1])]; });
  }
  /* rbody({ x, z, W, D, H, par, rc, k }): rounded corners rc, leaning in to k at yt = H + par; the outer face at
     height y (chamfered half way to the arc: c = (2 - sqrt 2) rc / 2, which keeps the straight walls long enough
     for a stair while the inner corner stays inside the arc) */
  function rbody(W, D, cx, cz, rc, k, yt, y) {
    const s = 1 - (1 - k) * y / yt;
    return oct(W / 2 * s, D / 2 * s, (2 - Math.SQRT2) * rc * s / 2, cx, cz);
  }
  const frontZ = function (poly) { let z = -1e9; poly.forEach(function (p) { if (p[1] > z) z = p[1]; }); return R3(z); };
  /* a point on the edge of SH.circle(r, n, cx, cz) in direction a (radians from +z toward +x: the shape's own) */
  function onRing(r, n, cx, cz, a) {
    const step = 2 * PI / n, mid = Math.round(a / step) * step, d = r * Math.cos(PI / n) / Math.cos(a - mid);
    return [R3(cx + d * Math.sin(a)), R3(cz + d * Math.cos(a))];
  }
  /* mirror an outline in x (the builders' m = -1 variants), keeping its winding */
  function mirror(poly) { return poly.map(function (p) { return [R3(0 - p[0]), p[1]]; }).reverse(); }

  const items = [];

  /* =================================================================== 1. BLUE-WASH TOWNHOUSE (56-mid.js) */
  /* rbody x 0, z -0.7, D 7.2, rc 1.25, k 0.93, par 0.95; st = 3 on variants 1 and 3 (W 7.8), else 2 (W 8.6);
     H = st * 3.2 + 0.3; door at x = (v%2 ? 1 : -1) * W * 0.22 on the front (B.zf(1.4)) */
  function bluewash(v) {
    const st = (v === 1 || v === 3) ? 3 : 2, H = st * 3.2 + 0.3, W = st === 3 ? 7.8 : 8.6, D = 7.2, cz = -0.7, yt = H + 0.95;
    const dx = R3((v % 2 ? 1 : -1) * W * 0.22);
    const lv = [];
    for (let s = 0; s < st; s++) lv.push({ h: 2.95 });
    const foot = rbody(W, D, 0, cz, 1.25, 0.93, yt, H / 2);
    return {
      bodies: [{ id: 'house', poly: foot, y: 0, levels: lv, wall: WALL, roof: 'flat',
        doors: [{ at: [dx, frontZ(foot)], w: 1.3 }],
        stair: STEEP, program: st === 3 ? [['living', 'kitchen'], ['hall', 'bedroom'], ['bedroom', 'bedroom']] : [['living', 'kitchen'], ['bedroom', 'bedroom']] }]
    };
  }
  items.push(Object.assign({ key: 'mid_bluewash_townhouse', name: 'Blue-wash townhouse', culture: CULT, wealth: 0.55, types: DW, lot: [10, 10],
    note: 'variant 0: the rounded, battered body 8.6 x 7.2 (centre z -0.7), two storeys of 3.2 m under a roof terrace, the parabolic ' +
      'door at x -1.89 on the front. The mashrabiya bay on the first floor (2.3 x 1.1 on brackets) is not planned; the stair bulkhead on ' +
      'the terrace implies a stair from the top storey to the roof that the plan leaves out. Variant 2 (blue-grey, the wide bulkhead) is ' +
      'like variant 0; variants 1 and 3 (three storeys, W 7.8, door at x +1.72) are #1 and #3' }, bluewash(0)));
  items.push(Object.assign({ key: 'mid_bluewash_townhouse#1', name: 'Blue-wash townhouse (variant 2: three storeys, door right)', culture: CULT,
    wealth: 0.55, types: DW, lot: [10, 10],
    note: 'the body 7.8 x 7.2, three storeys of 3.2 m (H 9.9) under the roof terrace, the door at x +1.72; the first floor holds the ' +
      'reception room (hall) behind the mashrabiya bay (the bay itself is not planned)' }, bluewash(1)));
  items.push({ key: 'mid_bluewash_townhouse#2', name: 'Blue-wash townhouse (variant 3: blue-grey wash, wide stair bulkhead)', like: 'mid_bluewash_townhouse',
    note: 'variant 0\'s body and rooms; only the wash, the framed windows and the bigger roof bulkhead differ' });
  items.push({ key: 'mid_bluewash_townhouse#3', name: 'Blue-wash townhouse (variant 4: three storeys in adobe)', like: 'mid_bluewash_townhouse#1',
    note: '#1\'s body and rooms (three storeys, door right) in adobe with white trim' });

  /* =================================================================== 2. DJENNE-FRONT TOWN HOUSE (56-mid.js) */
  /* fr8(0, 0, -0.4, 9.4, H, 7.0), H = [6.4, 7.4, 4.3][v]; the potige panel stands 0.25 proud of the front with the
     door in it at x 0. H > 5: two storeys (windows at 2.0 and H - 2.2), else one */
  function djenne(v) {
    const H = [6.4, 7.4, 4.3][v], W = 9.4, D = 7.0, cz = -0.4;
    if (v === 2) {
      const foot = fr8(W, D, 0, cz, H, H / 2);
      return { bodies: [{ id: 'house', poly: foot, y: 0, levels: [{ h: 3.8 }], wall: WALL, roof: 'flat',
        doors: [{ at: [0, frontZ(foot)], w: 1.3 }], program: ['living', 'bedroom'] }] };
    }
    const ff = v === 1 ? 3.7 : 3.2, h0 = ff - 0.25, h1 = R3(H - ff - 0.3);
    const p0 = fr8(W, D, 0, cz, H, H / 2);
    return { bodies: [{ id: 'house', poly: p0, y: 0, levels: [{ h: h0 }, { h: h1 }], wall: WALL, roof: 'flat',
      doors: [{ at: [0, frontZ(p0)], w: 1.3 }], stair: STEEP, program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }] };
  }
  items.push(Object.assign({ key: 'mid_djenne_house', name: 'Djenne-front town house', culture: CULT, wealth: 0.5, types: DW, lot: [11, 9],
    note: 'variant 0: the battered adobe block 9.4 x 7.0 (centre z -0.4, H 6.4), two storeys of 3.2 m under a parapeted roof terrace, ' +
      'the door at x 0 in the potige panel (the panel and the pinnacled pilasters stand outside the wall). Variant 1 (red adobe, H 7.4, ' +
      'storeys of 3.7) is #1; variant 2 (one storey, H 4.3, white wash on a black base) is #2' }, djenne(0)));
  items.push(Object.assign({ key: 'mid_djenne_house#1', name: 'Djenne-front town house (variant 2: red adobe, tall storeys)', culture: CULT,
    wealth: 0.5, types: DW, lot: [11, 9],
    note: 'variant 0\'s block at H 7.4: the upper floor at 3.7 (windows at 2.0 and 5.2), the wide potige with five pinnacles' }, djenne(1)));
  items.push(Object.assign({ key: 'mid_djenne_house#2', name: 'Djenne-front town house (variant 3: one storey, white wash)', culture: CULT,
    wealth: 0.5, types: DW, lot: [11, 9],
    note: 'one storey (H 4.3, the roof deck at 4.26): a living room with the hearth and a bedroom (a third room does not fit beside them); the black base band is paint, not a plinth' }, djenne(2)));

  /* =================================================================== 3. STACKED-CUBE HOUSE, M'zab (56-mid.js) */
  /* ground cube fr8(0, 0, -0.6, 10.4, 3.7, 9.0), door at x = m * 2.6 (m = -1 on variant 1); the second cube (W1 6.6, or
     7.6 on variant 2) on its back corner at y 3.7: rooms 4.0 deep behind a 1.6 m arcaded loggia, the loggia's door at
     x1 - m; variants 1 and 2 add a small tower room fr8(x2, 7.0, z2, 3.6, H2, 3.6) on the second cube's roof, its door
     on its +-x side (x2 + m * 1.68). The builder draws a ladder from the ground roof to the second cube's roof; no stair
     from the ground floor to the terrace is drawn */
  function stacked(v) {
    const m = v === 1 ? -1 : 1, W0 = 10.4, D0 = 9.0, H0 = 3.7, z0 = -0.6, w0 = W0 * 0.84, d0 = D0 * 0.84;
    const W1 = v === 2 ? 7.6 : 6.6, D1 = 5.6, x1 = R3(-m * (w0 / 2 - W1 / 2 - 0.05)), z1 = z0 - d0 / 2 + D1 / 2 + 0.05;
    /* the ground storey on the cube's TOP face (84 %): the second cube's back and outer side stand on it (to 0.05 m), so
       the upper storey shares those two walls with it and the inside stair can rise along them */
    const foot = fr8(W0, D0, 0, z0, H0, H0);
    const fx = R3(-m * w0 / 2), ix = R3(x1 + m * W1 / 2), zb = R3(z0 - d0 / 2);
    const up = m > 0 ? [[fx, zb], [ix, zb], [ix, R3(z1 + D1 / 2 - 1.6)], [fx, R3(z1 + D1 / 2 - 1.6)]]
      : [[ix, zb], [fx, zb], [fx, R3(z1 + D1 / 2 - 1.6)], [ix, R3(z1 + D1 / 2 - 1.6)]];
    const out = { bodies: [{ id: 'house', poly: foot, y: 0, levels: [{ h: 3.45 }, { h: 2.95, poly: up }], wall: WALL, roof: 'flat',
      doors: [{ at: [R3(m * 2.6), frontZ(foot)], w: 1.3 }], stair: STEEP, program: [['living', 'kitchen'], ['bedroom']] }] };
    if (v > 0) {
      const W2 = 3.6, H2 = v === 2 ? 3.6 : 2.9, x2 = R3(x1 - m * (W1 / 2 - W2 / 2)), z2 = R3(z1 - D1 / 2 + W2 / 2);
      const tp = fr8(W2, W2, x2, z2, H2, H2 / 2);
      const half = (tp[1][0] - tp[0][0]) / 2;
      out.bodies.push({ id: 'tower-room', poly: tp, y: 7.0, levels: [{ h: R3(H2 - 0.3) }], wall: 0.3, roof: 'flat',
        doors: [{ at: [R3(x2 + m * half), z2], w: 0.8 }], program: ['study'] });
    }
    return out;
  }
  items.push(Object.assign({ key: 'mid_stacked_cubes', name: 'Stacked-cube house (M\'zab)', culture: CULT, wealth: 0.48, types: DW, lot: [12, 11],
    note: 'variant 0: the battered ground cube 10.4 x 9.0 (centre z -0.6, H 3.7), door at x +2.6; the second cube (6.6 wide) on the back ' +
      'left corner of its roof at 3.7, its rooms 6.6 x 4.0 behind the loggia (one bedroom), reached by the steep inside stair the planner fits along the walls the two cubes share; the ground storey is planned on the cube\'s top face (the door at z 3.18, in the wall), as living room and kitchen. ' +
      'The loggia, its door onto the terrace and the terrace are open; the little dome on the upper roof is solid. ASSUMED: the builder ' +
      'draws no stair from the ground floor to the terrace. Variant 1 (mirrored, a tower room) is #1; variant 2 (wider second cube, a ' +
      'taller tower room) is #2' }, stacked(0)));
  items.push(Object.assign({ key: 'mid_stacked_cubes#1', name: 'Stacked-cube house (variant 2: mirrored, a tower room on top)', culture: CULT,
    wealth: 0.48, types: DW, lot: [12, 11],
    note: 'variant 0 mirrored (door at x -2.6, the second cube on the back right) in adobe, plus the third cube: a 3.6 m tower room ' +
      '(H 2.9) on the second cube\'s roof at 7.0, its door on its -x side onto that roof (reached by the drawn ladder from the ground ' +
      'roof terrace): planned as a study' }, stacked(1)));
  items.push(Object.assign({ key: 'mid_stacked_cubes#2', name: 'Stacked-cube house (variant 3: wide upper cube, tall tower room)', culture: CULT,
    wealth: 0.48, types: DW, lot: [12, 11],
    note: 'variant 0\'s plan with the second cube 7.6 wide and a tower room (3.6 m, H 3.6) on its roof at 7.0, its door on its +x side' }, stacked(2)));

  /* =================================================================== 4. ROUND-TOWER HOUSE (56-mid.js) */
  /* the drum: lathe R 3.7 at (tx, tz) = (-m * 2.6, -0.5) leaning to 90 % at H (6.8, or 7.6 on variant 2), its door at the
     front; the lower wing rbody(x m * 2.9, z -0.9, 6.6 x 6.4, rc 0.9, k 0.95, H Hw 3.5 or 3.9, par 0.8) overlaps the drum
     by 1.5 m and has no door of its own; the terrace door from the drum onto the wing roof at height Hw. A round drum
     cannot take the planner's straight stair, so the rooms are explicit: the drum's two storeys joined by a spiral stair
     (a fixture), and the wing */
  function roundTower(v) {
    const m = v === 1 ? -1 : 1, R = 3.7, tx = R3(-m * 2.6), tz = -0.5, H = v === 2 ? 7.6 : 6.8, Hw = v === 2 ? 3.9 : 3.5, n = 16;
    const rr0 = function (y) { return R * (1 - 0.10 * y / H); };
    const r0 = R3(rr0(Hw) - WALL), r1 = R3(rr0(H) - WALL), h0 = R3(Hw - 0.3), h1 = R3(H - Hw - 0.3);
    /* the spiral stair, 1.5 m square, at m * 2.6 rad (back, wing side: clear of every door and window), facing the drum centre */
    const sa = m * 2.6, sd = 1.85, sx = R3(tx + sd * Math.sin(sa)), sz = R3(tz + sd * Math.cos(sa)), sry = R3(sa + PI);
    const win = function (r, a, sill) { return { at: onRing(r, n, tx, tz, a), w: 0.65, sill: sill, h: 0.95 }; };
    /* the wing's room: its inner face at the top of the storey, less the drum (its base radius 3.72) */
    const ws = 1 - 0.05 * Hw / (Hw + 0.8), wa = R3(3.3 * ws - WALL), wb = R3(3.2 * ws - WALL), wx = 2.9, wz = -0.9;
    const Rb = 3.72, ax = 2.6, xl = wx - wa, zb = wz - wb, zt = wz + wb;          /* built for m = 1, mirrored after */
    const phiT = Math.asin((zt - tz) / Rb), phiB = -Math.acos((xl + ax) / Rb);
    let wing = [[R3(xl), R3(zb)], [R3(wx + wa), R3(zb)], [R3(wx + wa), R3(zt)]];
    for (let i = 0; i <= 8; i++) { const ph = phiT + (phiB - phiT) * i / 8; wing.push([R3(-ax + Rb * Math.cos(ph)), R3(tz + Rb * Math.sin(ph))]); }
    wing = wing.filter(function (p, i, A) { return i === 0 || Math.hypot(p[0] - A[i - 1][0], p[1] - A[i - 1][1]) > 1e-3; });
    /* the arc passes phi 0 (the door) only when 8 steps land on it: put the door at the arc's own point nearest phi 0 */
    const wdoor = [R3(m * (-ax + Rb)), tz];
    const wwin = [[R3(m * (wx + 0.6)), R3(zt)], [R3(m * (wx + wa)), wz]];
    if (m < 0) wing = mirror(wing);
    return {
      rooms: [
        { id: 'drum', kind: 'living', poly: SH.circle(r0, n, tx, tz), y: 0, h: h0,
          doors: [{ at: onRing(r0, n, tx, tz, 0), w: 1.3 }, { at: onRing(r0, n, tx, tz, m * PI / 2), w: 0.9, swing: 'none' }],
          windows: [win(r0, -m * 0.85, 1.5), win(r0, -m * 2.9, 1.7)],
          fixtures: [{ id: 'spiral', kind: 'stair', x: sx, z: sz, ry: sry, w: 1.5, d: 1.5, h: h0, clearance: { front: 0.7 } }] },
        { id: 'drum-upper', kind: 'bedroom', level: 1, poly: SH.circle(r1, n, tx, tz), y: Hw, h: h1,
          doors: [{ at: onRing(r1, n, tx, tz, m * (PI / 2 - 0.18)), w: 0.95 }],
          windows: [win(r1, -0.55, 1.0), win(r1, 0.6, 1.0), win(r1, -m * 1.9, 1.0)],
          fixtures: [{ id: 'spiral-well', kind: 'stairwell', x: sx, z: sz, ry: sry, w: 1.5, d: 1.5, h: h1, clearance: { front: 0.7 } }] },
        { id: 'wing', kind: 'kitchen', poly: wing, y: 0, h: h0,
          doors: [{ at: wdoor, w: 0.9, swing: 'none' }],
          windows: [{ at: wwin[0], w: 0.7, sill: 1.55, h: 0.85 }, { at: wwin[1], w: 0.7, sill: 1.55, h: 0.85 }] }]
    };
  }
  items.push(Object.assign({ key: 'mid_round_tower_house', name: 'Round-tower house', culture: CULT, wealth: 0.55, types: DW, lot: [13, 10],
    note: 'variant 0: the domed drum (R 3.7, H 6.8) at x -2.6, two storeys: the living room on the ground (the street door at its front) ' +
      'and a bedroom at 3.5 whose door opens onto the wing\'s roof terrace; the lower wing (6.6 x 6.4, H 3.5) on the right is the ' +
      'kitchen. ASSUMED: the wing has no door of its own (it is entered through the drum wall, where the two overlap) and the drum ' +
      'has no stair drawn (a 1.5 m spiral stair is a fixture in both drum rooms). Variant 1 (mirrored, flat-capped with merlons) is #1; ' +
      'variant 2 (adobe, H 7.6, the wing 3.9) is #2' }, roundTower(0)));
  items.push(Object.assign({ key: 'mid_round_tower_house#1', name: 'Round-tower house (variant 2: mirrored, flat cap with merlons)', culture: CULT,
    wealth: 0.55, types: DW, lot: [13, 10],
    note: 'variant 0 mirrored: the drum at x +2.6 with a flat roof terrace inside merlons, the wing on the left' }, roundTower(1)));
  items.push(Object.assign({ key: 'mid_round_tower_house#2', name: 'Round-tower house (variant 3: adobe, tall drum)', culture: CULT,
    wealth: 0.55, types: DW, lot: [13, 10],
    note: 'variant 0\'s plan with the drum at H 7.6 (the upper floor at 3.9) and the wing 3.9 high' }, roundTower(2)));

  /* =================================================================== 5. COURTYARD HOUSE WITH CORNER TOWER (56-mid.js) */
  /* four ranges 3.5 deep round a 4 x 4 court (S 11, H 3.9) on the 0.7 m base band that also floors the court; the
     street door at x -m * 1.2 in the front range, dark doorways from the court into the front and back ranges at
     x 0; the side ranges show only windows. The corner tower (R 2.35 at (m * 3.5, 3.5), TH 7.6) stands on the front
     corner on the m side; its room above the roof has its door onto the roof at its back */
  function courtyard(v) {
    const m = v ? -1 : 1, H = 3.9, TH = 7.6, R = 2.35, tx = R3(m * 3.5), tz = 3.5, n = 14;
    /* built for m = 1, mirrored after: A = the front range up to the tower + the left range; B = the back range + the right range */
    let A = [[-5.5, -2], [-2, -2], [-2, 2], [1.15, 2], [1.15, 5.5], [-5.5, 5.5]];
    let B = [[-5.5, -5.5], [5.5, -5.5], [5.5, 1.15], [2, 1.15], [2, -2], [-5.5, -2]];
    if (m < 0) { A = mirror(A); B = mirror(B); }
    const rt = R3(R * (1 - 0.08 * TH / TH) - 0.35);
    return {
      bodies: [
        { id: 'front', poly: A, y: 0.7, levels: [{ h: 2.9 }], wall: 0.4, roof: 'flat',
          doors: [{ at: [R3(-m * 1.2), 5.5], w: 1.3 }, { at: [0, 2], w: 1.0 }], program: ['living', 'bedroom'] },
        { id: 'back', poly: B, y: 0.7, levels: [{ h: 2.9 }], wall: 0.4, roof: 'flat',
          doors: [{ at: [0, -2], w: 1.0 }], program: ['kitchen', 'store', 'bedroom'] }],
      rooms: [
        { id: 'tower-room', kind: 'study', poly: SH.circle(rt, n, tx, tz), y: H, h: R3(TH - H - 0.3), level: 1,
          doors: [{ at: onRing(rt, n, tx, tz, PI), w: 0.8 }],
          windows: [{ at: onRing(rt, n, tx, tz, 0), w: 0.65, sill: 1.0, h: 1.0 }, { at: onRing(rt, n, tx, tz, m * PI / 2), w: 0.65, sill: 1.0, h: 1.0 }] }]
    };
  }
  items.push(Object.assign({ key: 'mid_courtyard_house', name: 'Courtyard house with corner tower', culture: CULT, wealth: 0.58, types: DW, lot: [12, 12],
    note: 'variant 0: four ranges 3.5 deep round the 4 m court, floors at 0.7 (the base band), one storey to the walkable roof at 3.9. ' +
      'Planned as two L bodies: the front range (street door at x -1.2, the court doorway at x 0) with the left range, and the back ' +
      'range (its court doorway at x 0) with the right range; the corner tower\'s room above the roof (r 2.2, to 7.6) is a study, its ' +
      'door onto the roof. ASSUMED: the side ranges have no doors (entered from the front and back ranges), the tower\'s lower storey ' +
      '(inside the front-right corner) has no door and is left out, and no stair to the roof is drawn. Variant 1 (mirrored, adobe, the ' +
      'flat-topped tower) is #1' }, courtyard(0)));
  items.push(Object.assign({ key: 'mid_courtyard_house#1', name: 'Courtyard house with corner tower (variant 2: mirrored, adobe)', culture: CULT,
    wealth: 0.58, types: DW, lot: [12, 12],
    note: 'variant 0 mirrored: the street door at x +1.2, the tower on the front-left corner, crowned with merlons' }, courtyard(1)));

  /* =================================================================== 6. WASHED PINNACLE HOUSE (55-mid-example.js) */
  /* fr8(0, 0, 0, 10, H, 8): one storey (H 3.6) on variants 0 and 2, two (H 6.4) on 1 and 3; door at x = v%2 ? -0.5 : 0.5
     on the front; the buttress-pilasters and their pinnacles stand outside the wall */
  function washed(v) {
    const two = v % 2 === 1, H = two ? 6.4 : 3.6, W = 10, D = 8, dx = v % 2 ? -0.5 : 0.5;
    if (!two) {
      const foot = fr8(W, D, 0, 0, H, H / 2);
      return { bodies: [{ id: 'house', poly: foot, y: 0, levels: [{ h: 3.3 }], wall: WALL, roof: 'flat',
        doors: [{ at: [dx, frontZ(foot)], w: 1.1 }], program: ['living', 'kitchen', 'bedroom'] }] };
    }
    const p0 = fr8(W, D, 0, 0, H, H / 2);
    return { bodies: [{ id: 'house', poly: p0, y: 0, levels: [{ h: 2.95 }, { h: 2.9 }], wall: WALL, roof: 'flat',
      doors: [{ at: [dx, frontZ(p0)], w: 1.1 }], stair: STEEP, program: [['living', 'kitchen'], ['bedroom', 'bedroom']] }] };
  }
  items.push(Object.assign({ key: 'mid_washed_house', name: 'Washed pinnacle house', culture: CULT, wealth: 0.5, types: DW, lot: [11, 9],
    note: 'variant 0: the battered, lime-washed block 10 x 8 (H 3.6), one storey under the roof deck, the door at x +0.5; the ' +
      'buttress-pilasters and their pinnacles stand outside the wall. Variants 1 and 3 (two storeys, H 6.4, door at x -0.5) are #1 ' +
      'and #3; variant 2 (light blue wash) is like variant 0' }, washed(0)));
  items.push(Object.assign({ key: 'mid_washed_house#1', name: 'Washed pinnacle house (variant 2: two storeys)', culture: CULT,
    wealth: 0.5, types: DW, lot: [11, 9],
    note: 'two storeys (H 6.4, the upper floor at 3.2), the door at x -0.5' }, washed(1)));
  items.push({ key: 'mid_washed_house#2', name: 'Washed pinnacle house (variant 3: light blue wash)', like: 'mid_washed_house',
    note: 'variant 0\'s body and rooms in a light blue wash' });
  items.push({ key: 'mid_washed_house#3', name: 'Washed pinnacle house (variant 4: two storeys, dark blue wash)', like: 'mid_washed_house#1',
    note: '#1\'s body and rooms (two storeys) in a dark blue wash' });

  IX.sets.add({ set: 'yuni', title: 'Yuni (base kit, as built by Locus and Mungo)', culture: CULT, wealth: 0.5, items: items });
})(KratorInteriors);
