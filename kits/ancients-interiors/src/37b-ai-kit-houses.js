/* ======================== Ancients interiors: the houses and the laboratory ========================
   Plans (37-ai-kit.js shape) for three of the original kit's types, in each builder's own frame (the group at the
   site, no rotation, x east, z south, y up). Houses are single-family dwellings: a living room, a kitchen and
   bedrooms as the volume allows. Small custom plates here (rooms cut by chords and partitions, every door listed in
   both rooms it joins) where a ring or a bar does not fit a 5 m drum.
   ====================================================================== */
(function (AI) {
  'use strict';
  const TAU = Math.PI * 2;
  const r3 = v => Math.round(v * 1000) / 1000, P = (x, z) => [r3(x), r3(z)];
  const cyc = list => (i => list[i % list.length]);
  /* an arc of n segments from t0 to t1 (n + 1 points) */
  const arc = (cx, cz, r, t0, t1, n) => { const o = []; for (let k = 0; k <= n; k++) { const t = t0 + (t1 - t0) * k / n; o.push(P(cx + r * Math.cos(t), cz + r * Math.sin(t))); } return o; };
  const rect = (x0, x1, z0, z1) => [P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1)];
  const mid = (a, b) => P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  const DR = (at, to, w) => ({ at: P(at[0], at[1]), w: w || 0.9, to });
  const RM = (id, kind, poly, y, h, lv, doors) => ({ id, kind, poly, y, h, level: lv, doors, windows: [], furnish: true });
  const WL = (id, pts, y, h, rooms, at, w) => ({ id, pts: pts.map(p => P(p[0], p[1])), y, h, rooms, door: at ? { at: P(at[0], at[1]), w: w || 0.9 } : null, broken: false });
  const ST = (id, lv, y, h, outline, rooms, walls) => ({ id, level: lv, y, h, rooms, walls, outline });
  const HOUSE = ['single-family dwelling'];

  /* a round floor (centre cx, radius r) cut by a chord at z = cz + zc (zc < 0): the front a living room with the
     street door at the front of the circle, the back split at x = cx into a bedroom (west) and a kitchen (east), each
     with a door onto the living room. Used by House A (a drum). */
  function chordDrum(id, cx, r, zc, y, h, streetW) {
    const xc = Math.sqrt(r * r - zc * zc), al = Math.asin(-zc / r);
    const liv = id + '.living', bed = id + '.bed', kit = id + '.kitchen';
    const dB = [cx - xc / 2, zc], dK = [cx + xc / 2, zc];
    const rooms = [
      RM(liv, 'living', arc(cx, 0, r, -al, Math.PI + al, 6).concat([P(cx, zc)]), y, h, 0,
        [DR([cx, r], 'street', streetW), DR(dB, bed), DR(dK, kit)]),
      RM(bed, 'bedroom', [P(cx, zc)].concat(arc(cx, 0, r, Math.PI + al, 1.5 * Math.PI, 8)), y, h, 0, [DR(dB, liv)]),
      RM(kit, 'kitchen', [P(cx, zc)].concat(arc(cx, 0, r, 1.5 * Math.PI, TAU - al, 8)), y, h, 0, [DR(dK, liv)])];
    const walls = [WL(bed + '.w', [[cx - xc, zc], [cx, zc]], y, h, [bed, liv], dB), WL(kit + '.w', [[cx, zc], [cx + xc, zc]], y, h, [kit, liv], dK),
      WL(bed + '.p', [[cx, zc], [cx, zc - r]], y, h, [bed, kit], null)];
    return { rooms, walls };
  }

  /* ---------------------------------------------------------------- HOUSES A, B, C (81-houses-abc.js buildHouses)
     The three sit at x = 30 (A, AX), 70 (B) and 110 (C, 140 + CX) on z = 0.
     A, the petal house: the drum lathe r 5 (nu 32), y 1..6.5, on a slab at y 1 (.4 thick: floor 1.2), the porch door
       (archOpen) at the front, +z; a glass dome on top when intact. One storey, y 1.2, h 5.2, rooms inside r 4.85:
       a living room at the front, a bedroom and a kitchen behind a chord at z -.5. The ruin draws a dark liner lathe
       r 3.4 (y 1..6.5) inside the drum: listed as a hollow cylinder for d > 0.
     B, the hypar-shell house: the room block boxW 9 x 6 x 7 at (70, 3.5, 0) holding a SOLID boxD 8.6 x 5.6 x 6.6
       (hollow; the boxW round it is a solid kit box too: the host shows it as a shell), on the plinth slab (top .75),
       door at the front gable (x 70). Rooms in x 65.75..74.25, z -3.25..3.25, y .75, h 5.5: the living room west
       (the door), a bedroom and a kitchen east. The ruin drops the front shell; the block stands.
     C, the lobed cluster house: a central tube r 2.6 (y 0..10; the entry archOpen at its west foot, a stair) and
       three lobes, lathes r 3.6 (3.42 at the top), y 3..10, centred 4.6 out at angles l/3 TAU + .5, each on a slab at
       y 3 (.5 thick: floor 3.25) and capped with a dome at y 10. Two rows of windows (y 4.5, 7.1), so two storeys:
       y 3.25, h 2.6 on the builder's slabs, and y 6.05, h 3.8 under the caps (no slab of the builder's: a second
       building with floors true). Each lobe room is the lobe's circle (r 3.35) less the tube (r 2.7), its door on the
       tube. Ground: living, kitchen, study; upper: three bedrooms. The ruin loses lobe 1 entirely (rubble, no slab):
       its rooms are dropped for d > 0; lobes 0 and 2 get dark liners r 2.3 (y 3..10), hollow for d > 0. */
  AI.KIT.house = { name: 'Houses A, B, C (petal, hypar-shell, lobed cluster)', frag: '81-houses-abc.js', culture: 'ancient', wealth: 0.65, types: HOUSE,
    buildings: function (d) {
      /* A */
      const A = chordDrum('house.a', 30, 4.85, -0.5, 1.2, 5.2, 1.4);
      const sA = ST('house.a', 0, 1.2, 5.2, arc(30, 0, 4.99, 0, TAU, 32).slice(0, 32), A.rooms, A.walls);
      /* B */
      const yB = 0.75, hB = 5.5, xm = 70.75;
      const bL = 'house.b.living', bB = 'house.b.bed', bK = 'house.b.kitchen';
      const sB = ST('house.b', 0, yB, hB, rect(65.5, 74.5, -3.5, 3.5), [
        RM(bL, 'living', [P(65.75, -3.25), P(xm, -3.25), P(xm, 0.25), P(xm, 3.25), P(70, 3.25), P(65.75, 3.25)], yB, hB, 0,
          [DR([70, 3.25], 'street', 1.2), DR([xm, -1.5], bB), DR([xm, 1.75], bK)]),
        RM(bB, 'bedroom', rect(xm, 74.25, -3.25, 0.25), yB, hB, 0, [DR([xm, -1.5], bL)]),
        RM(bK, 'kitchen', rect(xm, 74.25, 0.25, 3.25), yB, hB, 0, [DR([xm, 1.75], bL)])], [
        WL(bB + '.w', [[xm, -3.25], [xm, 0.25]], yB, hB, [bB, bL], [xm, -1.5]),
        WL(bK + '.w', [[xm, 0.25], [xm, 3.25]], yB, hB, [bK, bL], [xm, 1.75]),
        WL(bB + '.p', [[xm, 0.25], [74.25, 0.25]], yB, hB, [bB, bK], null)]);
      /* C */
      const CX = 110, rc = 2.7, rl = 3.35, dl = 4.6;
      const xi = (dl * dl + rc * rc - rl * rl) / (2 * dl), yi = Math.sqrt(rc * rc - xi * xi);
      const phC = Math.atan2(yi, xi), phL = Math.atan2(yi, xi - dl);
      const lobeA = l => l / 3 * TAU + 0.5;
      const keep = l => !(d > 0 && l === 1);
      function cStorey(sid, lv, y, h, kinds) {
        const rooms = [], walls = [], core = sid + '.core', cdoors = [];
        for (let l = 0; l < 3; l++) {
          if (!keep(l)) continue;
          const a = lobeA(l), lx = CX + dl * Math.cos(a), lz = dl * Math.sin(a);
          const ca = arc(CX, 0, rc, a + phC, a - phC, 4), door = ca[2];
          const poly = arc(lx, lz, rl, a - phL, a + phL, 6).concat(ca.slice(1, -1));
          const rid = sid + '.l' + l;
          rooms.push(RM(rid, kinds[l], poly, y, h, lv, [DR(door, core)]));
          walls.push(WL(rid + '.w', ca, y, h, [rid, core], door));
          cdoors.push(DR(door, rid));
        }
        rooms.push({ id: core, kind: 'core', poly: arc(CX, 0, 2.6, 0, TAU, 24).slice(0, 24), y, h, level: lv, doors: cdoors, windows: [], furnish: false });
        return ST(sid, lv, y, h, arc(CX, 0, 7.9, 0, TAU, 24).slice(0, 24), rooms, walls);
      }
      const sC0 = cStorey('house.c.g', 0, 3.25, 2.6, ['living', 'kitchen', 'study']);
      const sC1 = cStorey('house.c.u', 1, 6.05, 3.8, ['bedroom', 'bedroom', 'bedroom']);
      const insC = (x, z) => Math.hypot(x - CX, z) < 2.75 || [0, 1, 2].some(l => Math.hypot(x - CX - dl * Math.cos(lobeA(l)), z - dl * Math.sin(lobeA(l))) < 3.58);
      const linerC = (y0, y1) => d > 0 ? [0, 2].map(l => ({ cyl: [r3(CX + dl * Math.cos(lobeA(l))), r3(dl * Math.sin(lobeA(l))), 2.3, y0, y1] })) : [];
      return [
        { id: 'house-a', name: 'House A, the petal house', storeys: [sA], floors: false, hollow: d > 0 ? [{ cyl: [30, 0, 3.4, 1, 6.5] }] : [],
          inside: (x, z) => Math.hypot(x - 30, z) < 4.99 },
        { id: 'house-b', name: 'House B, the hypar-shell house', storeys: [sB], floors: false, hollow: [{ box: [65.7, 74.3, 0.7, 6.3, -3.3, 3.3] }],
          inside: (x, z) => x > 65.5 && x < 74.5 && z > -3.5 && z < 3.5 },
        { id: 'house-c', name: 'House C, the lobed cluster house (lobe floors)', storeys: [sC0], floors: false, hollow: linerC(3, 5.85), inside: insC },
        { id: 'house-c-up', name: 'House C, the lobed cluster house (upper floor)', storeys: [sC1], floors: true, hollow: linerC(5.85, 10), inside: insC }];
    } };

  /* ---------------------------------------------------------------- HOUSES D, E, F (64-houses-def.js buildHouses2)
     D, the apse house, at x 25 (DX): a quarter-sphere lathe R 9 from y .6, kept where sin th <= .05 (z <= 0), open to
       +z behind a glass front on mullions (.6 thick) at z 0; its dark liner (always drawn) is .94 R sqrt(1 - (y/R)^2),
       so at r 7.5 it stands 4.2 m above the floor. The floor slab top is .6; the door (archOpen) at x 28 in the front.
       One storey, y .6, h 3.6, rooms inside r 7.5 and z < -.4: the living room at the front (the glass), a bedroom
       (west) and a kitchen (east) behind a chord at z -3.5. No ruin collapse (holes only).
     E, the bridge house, at x 65: the floor box 26 x .7 x 8 at y 8.3 (top 8.65), the roof box at y 12.2 (underside
       11.85), panes at z +-4 and x 65 +- 12.5. One storey y 8.65, h 3.1, a bar (barPlate) along x 52.6..77.4: a 2 m
       corridor along the back (-z), five rooms on the front: two bedrooms, the kitchen, two living rooms; the door
       from the pier stair at (74, z 4.3) opens into the east living room. The ruin's span failed west of x 65 (the
       floor hinged down, the roof beside the house): collapse x < 65. The ruin's boxD 11 x 3 x 6 at (71, 10.2, 0)
       is hollow for d > 0.
     F, the terrace house, at x 105: three trays t, floor box at y 3.6t (top 3.6t + .6), centre z 6 - 5t, width
       16 - 3t, depth 9; roof underside 3.6t + 3.15; brick sides .5 thick inside x 105 +- (w/2 - .5); glass at
       z + 3.8. The rock behind is a hex lathe r 16 - 1.4y at (105, -8): its flat face (apothem .866 r) slopes through
       the back of every tray, so a tray's room starts in front of the face at floor level (z 5.3, .95, -3.45) and ends
       at z + 3.6. Tray 0: kitchen (west) and living room (east, the entry arch at x 109); tray 1: two bedrooms off the
       terrace on tray 0's roof (the outside stair arrives at its west end); tray 2: a bedroom. The ruin loses tray 2
       (its roof slumped onto tray 1): dropped for d > 0; the ruin's boxD in trays 0 and 1 are hollow for d > 0. */
  AI.KIT.house2 = { name: 'Houses D, E, F (apse, bridge, terrace)', frag: '64-houses-def.js', culture: 'ancient', wealth: 0.65, types: HOUSE,
    buildings: function (d) {
      /* D */
      const cD = 25, rD = 7.5, zf = -0.4, zc = -3.5, yD = 0.6, hD = 3.6;
      const be = Math.asin(-zf / rD), ga = Math.asin(-zc / rD), xcD = Math.sqrt(rD * rD - zc * zc);
      const dL = 'house.d.living', dB = 'house.d.bed', dK = 'house.d.kitchen', dbA = [cD - xcD / 2, zc], dkA = [cD + xcD / 2, zc];
      const sD = ST('house.d', 0, yD, hD, arc(cD, 0, 8.46, Math.PI, TAU, 24), [
        RM(dL, 'living', arc(cD, 0, rD, -be, -ga, 4).concat([P(cD, zc)], arc(cD, 0, rD, Math.PI + ga, Math.PI + be, 4), [P(28, zf)]), yD, hD, 0,
          [DR([28, zf], 'street', 1.2), DR(dbA, dB), DR(dkA, dK)]),
        RM(dB, 'bedroom', [P(cD, zc)].concat(arc(cD, 0, rD, Math.PI + ga, 1.5 * Math.PI, 8)), yD, hD, 0, [DR(dbA, dL)]),
        RM(dK, 'kitchen', [P(cD, zc)].concat(arc(cD, 0, rD, 1.5 * Math.PI, TAU - ga, 8)), yD, hD, 0, [DR(dkA, dL)])], [
        WL(dB + '.w', [[cD - xcD, zc], [cD, zc]], yD, hD, [dB, dL], dbA),
        WL(dK + '.w', [[cD, zc], [cD + xcD, zc]], yD, hD, [dK, dL], dkA),
        WL(dB + '.p', [[cD, zc], [cD, -rD]], yD, hD, [dB, dK], null)]);
      /* E */
      const sE = AI.barPlate({ id: 'house.e', level: 0, y: 8.65, h: 3.1, path: u => [52.6 + 24.8 * u, 0], len: 24.8, depth: 7.8, side: 'left', cw: 2.0,
        roomW: 4.96, kinds: cyc(['bedroom', 'bedroom', 'kitchen', 'living', 'living']), door: 0.9 });
      sE.rooms.filter(R => R.id === 'house.e.r4').forEach(R => R.doors.push(DR([74, 3.85], 'street', 1.0)));
      /* F */
      const fx = 105, tray = t => ({ y: t * 3.6 + 0.6, zc: 6 - 5 * t, w: 16 - 3 * t }), zBack = [5.3, 0.95, -3.45];
      const sF = [];
      for (let t = 0; t < 3; t++) {
        if (d > 0 && t === 2) continue;
        const T = tray(t), x0 = fx - (T.w / 2 - 0.55), x1 = fx + (T.w / 2 - 0.55), z0 = zBack[t], z1 = T.zc + 3.6, y = T.y, h = 2.5, sid = 'house.f.t' + t;
        let rooms, walls;
        if (t === 0) {
          const xm = 103, L = sid + '.living', K = sid + '.kitchen', dk = [xm, (z0 + z1) / 2];
          rooms = [RM(L, 'living', [P(xm, z0), P(x1, z0), P(x1, z1), P(109, z1), P(xm, z1), P(xm, dk[1])], y, h, t, [DR([109, z1], 'street', 1.2), DR(dk, K)]),
            RM(K, 'kitchen', [P(x0, z0), P(xm, z0), P(xm, dk[1]), P(xm, z1), P(x0, z1)], y, h, t, [DR(dk, L)])];
          walls = [WL(K + '.w', [[xm, z0], [xm, z1]], y, h, [K, L], dk)];
        } else if (t === 1) {
          const W = sid + '.bedW', E = sid + '.bedE', dw = [101.5, z1], de = [108.5, z1];
          rooms = [RM(W, 'bedroom', [P(x0, z0), P(fx, z0), P(fx, z1), P(dw[0], z1), P(x0, z1)], y, h, t, [DR(dw, 'terrace')]),
            RM(E, 'bedroom', [P(fx, z0), P(x1, z0), P(x1, z1), P(de[0], z1), P(fx, z1)], y, h, t, [DR(de, 'terrace')])];
          walls = [WL(W + '.p', [[fx, z0], [fx, z1]], y, h, [W, E], null)];
        } else {
          rooms = [RM(sid + '.bed', 'bedroom', [P(x0, z0), P(x1, z0), P(x1, z1), P(fx, z1), P(x0, z1)], y, h, t, [DR([fx, z1], 'terrace')])];
          walls = [];
        }
        sF.push(ST(sid, t, y, h, rect(fx - T.w / 2, fx + T.w / 2, T.zc - 4.5, T.zc + 4.5), rooms, walls));
      }
      const insF = (x, z, y) => { const t = Math.max(0, Math.min(2, Math.round((y - 0.6) / 3.6))), T = tray(t); return x > fx - T.w / 2 && x < fx + T.w / 2 && z > T.zc - 4.5 && z < T.zc + 4.5; };
      return [
        { id: 'house-d', name: 'House D, the apse house', storeys: [sD], floors: false, hollow: [],
          inside: (x, z) => z < 0.1 && Math.hypot(x - cD, z) < 8.46 },
        { id: 'house-e', name: 'House E, the bridge house', storeys: [sE], floors: false, hollow: d > 0 ? [{ box: [65.5, 76.5, 8.7, 11.7, -3, 3] }] : [],
          inside: (x, z) => x > 52.5 && x < 77.5 && z > -4 && z < 4, collapse: (x, z) => d > 0 && x < 65 },
        { id: 'house-f', name: 'House F, the terrace house', storeys: sF, floors: false,
          hollow: d > 0 ? [{ box: [98.5, 111.5, 0.6, 3.2, 4.5, 9.5] }, { box: [100, 110, 4.2, 6.8, -0.5, 4.5] }] : [], inside: insF }];
    } };

  /* ---------------------------------------------------------------- LABORATORY, the Reliquary (89-lab.js buildLab)
     The tower: six storeys of SH 4.4, each a skin gridSurface at r = rW(th, s) = 30 + 2.6 sin(7th + .55s) +
     1.1 sin(3th - .385s), from y 4.4s + .3 to 4.4(s + 1); the balcony annulus outside it at y 4.4s + .3. No floors
     inside (the ruin adds a band .9..985 rW and a dark liner at .9 rW), the roof slab at 26.7, the dome above it.
     Plan (floors true): storey s at y 4.4s + .3, h 4.0. The rooms' skin is .88 (28.9 + 2.6 sin(7th + .55s)), the
     seven-fold part of rW less the 3th term's amplitude, so it stays inside .88 rW everywhere and like rooms repeat
     every 2 pi / 7 (sym 7: furnishing templates shared). An outer ring of 21 rooms 8 deep (labs, every third a
     store; the ground floor's room 0, toward the porch at +x, is the lobby) on a 2.6 m corridor; an inner ring of 14
     sectors 5.5 deep (offices, studies) on a 2.4 m corridor round a stair and lift core (r 4.4), two of its sectors
     (0 and 7) left as passages between the two corridors. No collapse: the ruin's holes eat the skin, not floors.
     The reactor hut at x 104: a drum lathe r 10 (nu 40), y 0..5, a dome above to y 16, the door (archOpen) at x 94
     facing -x. One storey y 0, h 4.8 (floors true): nine rooms 3.6 deep round a 1.6 m corridor and the reactor core
     (r 4.3, unfurnished); room 4, at the door, the vestibule. */
  AI.KIT.lab = { name: 'Laboratory (the Reliquary)', frag: '89-lab.js', culture: 'ancient', wealth: 0.6, types: ['laboratory', 'research'],
    buildings: function () {
      const SH = 4.4, NS = 6;
      const rW = (th, s) => 30 + 2.6 * Math.sin(7 * th + 0.55 * s) + 1.1 * Math.sin(3 * th - 0.55 * s * 0.7);
      const storeys = [];
      for (let s = 0; s < NS; s++) {
        const y = r3(s * SH + 0.3), h = 4.0, sid = 'lab.s' + s;
        const rOut = th => 0.88 * (28.9 + 2.6 * Math.sin(7 * th + 0.55 * s));
        const outerK = cyc(['workshop', 'workshop', 'store']);
        const st = AI.ringPlate({ id: sid, level: s, y, h, rOut, depth: 8, cw: 2.6, n: 21, seg: 4, sym: 7,
          kinds: (i, n) => s === 0 && i === 0 ? 'antechamber' : outerK(i) });
        const rO2 = th => rOut(th) - 10.65, segI = 3, nI = 14, isPass = th => [0, 7].some(i => Math.abs(th - (i + 0.5) / nI * TAU) < 0.01);
        const inn = AI.ringPlate({ id: sid + '.in', level: s, y, h, rOut: rO2, depth: 5.5, cw: 2.4, n: nI, seg: segI, sym: 7,
          kinds: () => 'study', skip: isPass, core: { r: 4.4 } });
        /* each office's back (the outer arc) is a wall on the outer corridor */
        inn.rooms.filter(R => R.kind === 'study').forEach(function (R) {
          inn.walls.push(WL(R.id + '.ow', R.poly.slice(segI + 1).reverse(), y, h, [R.id, sid + '.corr'], null));
        });
        /* the two passages, and the wall that closes the office before each (its t1 is the passage's t0) */
        [0, 7].forEach(function (i) {
          const t0 = i / nI * TAU, t1 = (i + 1) / nI * TAU, pid = sid + '.in.pass' + i;
          const rIn = th => rO2(th) - 5.5, inner = [], outer = [];
          for (let k = 0; k <= segI; k++) { const th = t0 + (t1 - t0) * k / segI; inner.push(P(rIn(th) * Math.cos(th), rIn(th) * Math.sin(th))); outer.push(P((rO2(th) - 0.05) * Math.cos(th), (rO2(th) - 0.05) * Math.sin(th))); }
          inn.rooms.push({ id: pid, kind: 'corridor', poly: inner.concat(outer.reverse()), y, h, level: s, doors: [], windows: [], furnish: false });
          const tPrev = ((t0 - 0.5 / nI * TAU) + TAU) % TAU, prev = inn.rooms.find(R => R.th != null && Math.abs(R.th - tPrev) < 0.01);
          inn.walls.push(WL(pid + '.p', [[rIn(t0) * Math.cos(t0), rIn(t0) * Math.sin(t0)], [(rO2(t0) - 0.05) * Math.cos(t0), (rO2(t0) - 0.05) * Math.sin(t0)]], y, h, [prev ? prev.id : null, pid], null));
        });
        st.rooms = st.rooms.concat(inn.rooms); st.walls = st.walls.concat(inn.walls);
        storeys.push(st);
      }
      const hutK = ['workshop', 'study', 'workshop', 'store', 'antechamber', 'store', 'workshop', 'study', 'workshop'];
      const hut = AI.ringPlate({ id: 'lab.hut', level: 0, y: 0, h: 4.8, cx: 104, cz: 0, rOut: () => 9.55, depth: 3.6, cw: 1.6, n: 9, seg: 3,
        kinds: i => hutK[i], core: { r: 4.3 } });
      hut.rooms.filter(R => R.id === 'lab.hut.r4').forEach(function (R) { const o = R.poly.slice(4); R.doors.push(DR(mid(o[1], o[2]), 'street', 1.8)); });
      return [
        { id: 'lab', name: 'the Reliquary', storeys, floors: true, hollow: [],
          inside: (x, z, y) => { const s = Math.max(0, Math.min(NS - 1, Math.floor(y / SH))); return Math.hypot(x, z) < 0.9 * rW(Math.atan2(z, x), s); } },
        { id: 'lab-hut', name: 'the reactor hut', storeys: [hut], floors: true, hollow: [],
          inside: (x, z) => Math.hypot(x - 104, z) < 9.97 }];
    } };
})(KratorAncientsInteriors);
