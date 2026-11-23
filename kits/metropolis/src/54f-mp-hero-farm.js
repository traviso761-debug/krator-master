// ================================================================= METROPOLIS — the farm belt: heroes  [draw]
// The builders of the eight farm families (46f: MP.FARM_DESIGN), each one short function on the massing kit DK (54) and the hero builder (50),
// added to MP.DESIGN_BUILD so MP.hero(key, state) draws them as it draws the fourteen designs: the intact hero here, its ruins cut from it by
// MP.ruinDesign (59b), its box shell and impostor baked from it by the stage. The glass of a growing house is the clear glass (glassClear: the
// beds show through it), so a gutted pod or vault keeps its ribs and mullions and loses its panes. No rng(): every figure is fixed or a hash.
//   MP.FARM_FIX.wall(B, a, b, y0, y1, o)  a straight wall from [x, z] a to b, banded as DK.slab bands a storey (a solid base, a recessed band of
//                                         glass or louvres, a head), piers every o.bay, gaps for doors; its outside away from o.c
(function () {
  const PI2 = Math.PI * 2, WALL = [.86, .84, .8], CON = [.8, .78, .74], RIB = [.92, .9, .86], BEDS = [.78, .95, .7];
  /* a quad whose normal is turned to `want` (a vector): DK.q takes its normal from its corners, so the order is flipped when it points away. A quad
     rising more than 4.5 m from its first edge (A B) to its last (D C) is split into bands of 4 m or less: a ruin's cut (59b) keeps a triangle only
     when all of it stands under the torn line, so one tall quad (a pier, a retaining wall) went whole where it should have been cut */
  const qf = (B, m, A, Bq, C, D, want, col) => { const ux = Bq[0] - A[0], uy = Bq[1] - A[1], uz = Bq[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const flip = nx * want[0] + ny * want[1] + nz * want[2] < 0, rise = Math.max(Math.abs(D[1] - A[1]), Math.abs(C[1] - Bq[1])), n = rise > 4.5 ? Math.ceil(rise / 4) : 1, L = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t, P[2] + (Q[2] - P[2]) * t];
    for (let i = 0; i < n; i++) { const a = L(A, D, i / n), b = L(Bq, C, i / n), c = L(Bq, C, (i + 1) / n), d = L(A, D, (i + 1) / n); if (flip) DK.q(B, m, a, d, c, b, { col }); else DK.q(B, m, a, b, c, d, { col }); } };
  /* a polygon's corners: n of them at radius R, the first at angle a0 */
  const poly = (n, R, a0) => { const P = []; for (let i = 0; i < n; i++) { const t = (a0 || 0) + i * PI2 / n; P.push([Math.cos(t) * R, Math.sin(t) * R]); } return P; };
  /* the outward normal of a run a -> b (away from the centre c) */
  const outN = (a, b, c) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; let n = [dz / L, -dx / L]; if ((a[0] + b[0]) / 2 * n[0] - c[0] * n[0] + ((a[1] + b[1]) / 2 - c[1]) * n[1] < 0) n = [-n[0], -n[1]]; return n; };
  /* a banded wall (see the head). o: c (the inside's centre, [x, z]), mat, band ('glass', 'glassClear', 'dark': the recessed band), sill, head (shares),
     dep (the recess), bay (a pier every bay metres; 0 none), doors [t, ...] (0..1 along the run: a gap DK.DOOR either side), top (the door's head), col */
  function wall(B, a, b, y0, y1, o) {
    o = o || {}; const c = o.c || [0, 0], n = outN(a, b, c), dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), m = o.mat || 'concrete', g = o.band || 'dark', dep = o.dep == null ? .4 : o.dep, col = o.col || WALL;
    const yS = y0 + (y1 - y0) * (o.sill == null ? .3 : o.sill), yT = y0 + (y1 - y0) * (o.head == null ? .78 : o.head), at = (t, e) => [a[0] + dx * t - n[0] * e, a[1] + dz * t - n[1] * e];
    const ht = DK.DOOR / L, cuts = [0]; (o.doors || []).slice().sort((p, q) => p - q).forEach(t => cuts.push(t - ht, t + ht)); cuts.push(1);
    const up = [0, 1, 0], dn = [0, -1, 0], out = [n[0], 0, n[1]], V = (p, y) => [p[0], y, p[1]];
    for (let i = 0; i + 1 < cuts.length; i += 2) { const t0 = cuts[i], t1 = cuts[i + 1]; if (t1 - t0 < 1e-3) continue; const p0 = at(t0, 0), p1 = at(t1, 0), q0 = at(t0, dep), q1 = at(t1, dep);
      qf(B, m, V(p0, y0), V(p1, y0), V(p1, yS), V(p0, yS), out, col); qf(B, m, V(p0, yS), V(p1, yS), V(q1, yS), V(q0, yS), up, col);
      qf(B, g, V(q0, yS), V(q1, yS), V(q1, yT), V(q0, yT), out, col); qf(B, m, V(p0, yT), V(p1, yT), V(q1, yT), V(q0, yT), dn, col); qf(B, m, V(p0, yT), V(p1, yT), V(p1, y1), V(p0, y1), out, col);
      if (o.bay) { const nb = Math.max(1, Math.round((t1 - t0) * L / o.bay)), yaw = Math.atan2(n[0], n[1]); for (let j = 0; j <= nb; j++) { const p = at(t0 + (t1 - t0) * j / nb, dep / 2); B.panel(p[0], (yS + yT) / 2, p[1], yaw, o.pier == null ? .35 : o.pier, yT - yS, dep, col); } } }
    /* the doors' screens, and over each its lintel to the band's head */
    const gaps = [];(o.doors || []).forEach(t => { const A = at(t - ht, .05), Bp = at(t + ht, .05), top = o.top == null ? Math.min(y1 - y0 - .4, 4) : o.top; gaps.push(DK.door(B, o.doorList, A, Bp, top, c[0], c[1], y0));
      const p0 = at(t - ht, 0), p1 = at(t + ht, 0); if (y0 + top < y1 - .05) qf(B, m, V(p0, y0 + top), V(p1, y0 + top), V(p1, y1), V(p0, y1), out, col); });
    return gaps;
  }
  /* a closed run of walls round a polygon P (corners anticlockwise or not), each with its doors [{i: edge, t}], and its outline for the walk's blocks */
  function walls(B, P, y0, y1, o, X) {
    const gaps = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], ds = (o.doors || []).filter(d => d.i === i).map(d => d.t);
      gaps.push(...wall(B, a, b, y0, y1, Object.assign({}, o, { doors: ds, doorList: X.doors }))); }
    const pts = []; for (let i = 0; i <= P.length; i++) { const a = P[i % P.length], b = P[(i + 1) % P.length]; for (let j = 0; j < 8; j++) pts.push([a[0] + (b[0] - a[0]) * j / 8, a[1] + (b[1] - a[1]) * j / 8]); }
    if (!o.noWalk) (B.walk = B.walk || []).push({ pts, doors: gaps, closed: true }); return gaps;
  }
  /* a flat polygon at y (its corners about the origin, faces up or down), and a ring of polygon between two radii (a terrace, a floor round a core) */
  const fan = (B, m, P, y, up, col) => { for (let i = 1; i + 1 < P.length; i++) qf(B, m, [P[0][0], y, P[0][1]], [P[i][0], y, P[i][1]], [P[i + 1][0], y, P[i + 1][1]], [P[i + 1][0], y, P[i + 1][1]], up ? [0, 1, 0] : [0, -1, 0], col); };
  const ringP = (B, m, Po, Pi, y, up, col) => { for (let i = 0; i < Po.length; i++) { const j = (i + 1) % Po.length; qf(B, m, [Po[i][0], y, Po[i][1]], [Po[j][0], y, Po[j][1]], [Pi[j][0], y, Pi[j][1]], [Pi[i][0], y, Pi[i][1]], up ? [0, 1, 0] : [0, -1, 0], col); } };
  /* a parapet round a polygon: its outer face, its inner face (to the terrace), its top */
  const parapet = (B, P, y, h, t, col) => { const Pi = P.map(p => { const l = Math.hypot(p[0], p[1]) || 1; return [p[0] * (l - t) / l, p[1] * (l - t) / l]; });
    for (let i = 0; i < P.length; i++) { const j = (i + 1) % P.length; qf(B, 'concrete', [P[i][0], y, P[i][1]], [P[j][0], y, P[j][1]], [P[j][0], y + h, P[j][1]], [P[i][0], y + h, P[i][1]], [P[i][0] + P[j][0], 0, P[i][1] + P[j][1]], col);
      qf(B, 'concrete', [Pi[i][0], y, Pi[i][1]], [Pi[j][0], y, Pi[j][1]], [Pi[j][0], y + h, Pi[j][1]], [Pi[i][0], y + h, Pi[i][1]], [-(Pi[i][0] + Pi[j][0]), 0, -(Pi[i][1] + Pi[j][1])], col); }
    ringP(B, 'concrete', P, Pi, y + h, true, col); };
  /* a round core drum r from y0 to y1, its door faces left to the plans (the walk's blocks come from the plans' walls) */
  const coreDrum = (B, r, y0, y1) => { B.lathe('concrete', col(r, y0, y1), 24, { uv: 4 }); B.lathe('concrete', [[r, y1], [0, y1]], 24, { uv: 3 }); };
  /* a vertical profile at radius r from y0 to y1 in bands of 4 m or less (the ruin cut, as qf's) */
  function col(r, y0, y1) { const n = Math.max(1, Math.ceil((y1 - y0) / 4)), P = []; for (let i = 0; i <= n; i++) P.push([r, y0 + (y1 - y0) * i / n]); return P; }
  /* a rect core shaft from y0 to y1: four faces and a roof */
  const coreBox = (B, cx, cz, hw, hd, y0, y1) => { const P = [[cx - hw, cz - hd], [cx + hw, cz - hd], [cx + hw, cz + hd], [cx - hw, cz + hd]];
    for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; qf(B, 'concrete', [a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], [(a[0] + b[0]) / 2 - cx, 0, (a[1] + b[1]) / 2 - cz], CON); } fan(B, 'concrete', P, y1, true, CON); };
  MP.FARM_FIX = { wall, walls, poly, qf, fan, ringP, parapet };

  Object.assign(MP.DESIGN_BUILD, {
    // ---- the growing pod: a hex plinth, a faceted hex glass dome, the beds and the mezzanine, the core, the lantern
    pod(F, B, X) {
      const H = F.hex, ph = F.plinth, R = F.dome.r, Hd = F.dome.h, Pl = poly(6, H, 0);
      /* the plinth: louvred walls, two doors mid-face (the faces between corners at 60 and 120 degrees, and its opposite) */
      walls(B, Pl, 0, ph, { mat: 'concrete', band: 'dark', sill: .34, head: .74, dep: .45, bay: 2.6, doors: [{ i: 1, t: .5 }, { i: 4, t: .5 }], top: 3.3, col: WALL }, X);
      fan(B, 'concrete', poly(6, H - .5, 0), .03, true, CON);
      /* the terrace round the dome: the plinth's roof, a parapet at its edge; the growing floor inside the dome's foot */
      const Pd = poly(6, R, 0); ringP(B, 'concrete', poly(6, H, 0), Pd, ph, true, CON); parapet(B, Pl, ph, .9, .35, CON);
      ringP(B, 'green', Pd, poly(6, 4.4, 0), ph + .02, true, BEDS); ringP(B, 'concrete', poly(6, H - .45, 0), poly(6, 4.4, 0), ph - .05, false, CON);
      /* the dome: hexagonal rows of glass, a rib on each corner and a band at each row; it stops at the lantern's ring */
      const N = 9, rowR = i => R * Math.cos(i / N * Math.PI / 2), rowY = i => ph + Hd * Math.sin(i / N * Math.PI / 2), lr = F.lantern, rows = [];
      for (let i = 0; i <= N; i++) { const r = rowR(i), y = rowY(i); if (r < lr) { rows.push([lr, ph + Hd * Math.sqrt(Math.max(0, 1 - (lr / R) * (lr / R)))]); break; } rows.push([r, y]); }
      for (let i = 0; i + 1 < rows.length; i++) { DK.strip(B, 'glassClear', rows[i][1], rows[i][0], rows[i + 1][1], rows[i + 1][0], { seg: 6, sides: 6 }); if (i) DK.strip(B, 'bronze', rows[i][1] - .18, rows[i][0] + .1, rows[i][1] + .18, rows[i][0] + .1, { seg: 6, sides: 6, col: RIB }); }
      for (let k = 0; k < 6; k++) { const t = k * PI2 / 6, c = Math.cos(t), s = Math.sin(t); for (let i = 0; i + 1 < rows.length; i++) DK.tube(B, 'white', [c * (rows[i][0] + .1), rows[i][1], s * (rows[i][0] + .1)], [c * (rows[i + 1][0] + .1), rows[i + 1][1], s * (rows[i + 1][0] + .1)], .32, 4, { col: RIB }); }
      DK.strip(B, 'white', ph, R + .2, ph + .5, R + .2, { seg: 6, sides: 6, col: RIB });
      /* the mezzanine of beds (the second growing storey, 46f), its edge a bronze rail and a ring of grow lamps under it */
      const ym = F.mezz, rm = 19 / Math.cos(Math.PI / 6); ringP(B, 'green', poly(6, rm, 0), poly(6, 4.4, 0), ym + .02, true, BEDS); ringP(B, 'concrete', poly(6, rm, 0), poly(6, 4.4, 0), ym - .3, false, CON);
      DK.strip(B, 'concrete', ym - .3, rm, ym + .02, rm, { seg: 6, sides: 6, col: CON }); DK.strip(B, 'bronze', ym + .02, rm - .05, ym + 1.05, rm - .05, { seg: 6, sides: 6, col: RIB });
      DK.strip(B, 'cyan', ym - .55, rm - 1.2, ym - .35, rm - 1.2, { seg: 6, sides: 6 });
      /* the core to the mezzanine's ceiling, then the lantern at the dome's top */
      coreDrum(B, 4.4, 0, ym + F.sh); const ly = rows[rows.length - 1][1]; B.lathe('glassClear', [[lr, ly], [lr, ly + 1.4]], 18, { uv: 4 }); DK.lathe(B, 'bronze', [[lr + .4, ly + 1.4], [.3, F.height.tip]], 18, { uv: 2, col: RIB });
      /* the lantern's mullions carry its cap (gutted, its glass gone, the cap stood on nothing: the kit page's floater check, 2026-11-10) */
      for (let k = 0; k < 6; k++) { const t = k * PI2 / 6; B.obox('bronze', Math.cos(t) * lr, ly + .75, Math.sin(t) * lr, Math.PI / 2 - t, .25, 1.6, .25, { uv: 2, col: RIB }); }
    },
    // ---- the vault house: an elongated hex plinth, a glazed barrel vault ribbed every 8 m, glazed ends, the beds, the gallery, the core
    vault(F, B, X) {
      const ph = F.plinth, r = F.vault.r, hl = F.len / 2, hw = F.half, tip = hl + F.tipX, Pl = [[tip, 0], [hl, hw], [-hl, hw], [-tip, 0], [-hl, -hw], [hl, -hw]];
      walls(B, Pl, 0, ph, { mat: 'concrete', band: 'dark', sill: .34, head: .74, dep: .45, bay: 2.6, doors: [{ i: 0, t: .5 }, { i: 3, t: .5 }], top: 3.3, col: WALL }, X);
      fan(B, 'concrete', Pl.map(p => [p[0] * .98, p[1] * .96]), .03, true, CON);
      /* the plinth's roof: a terrace round the vault's foot (its pointed ends planted), a parapet; the beds inside */
      const Pv = [[hl, -r], [hl, r], [-hl, r], [-hl, -r]];
      [[[tip, 0], [hl, hw], [hl, -hw]], [[-tip, 0], [-hl, -hw], [-hl, hw]]].forEach(T => fan(B, 'green', T, ph + .02, true, BEDS));
      [[[hl, hw], [-hl, hw], [-hl, r], [hl, r]], [[hl, -r], [-hl, -r], [-hl, -hw], [hl, -hw]]].forEach(Q => fan(B, 'concrete', Q, ph, true, CON));
      parapet(B, Pl, ph, .9, .35, CON); fan(B, 'green', Pv, ph + .02, true, BEDS); fan(B, 'concrete', Pl.map(p => [p[0] * .99, p[1] * .98]), ph - .05, false, CON);
      /* the vault: 12 rows round the half circle, in bays of the rib spacing along its length; ribs and a band at the haunch */
      const NA = 12, A = j => Math.PI * j / NA, P = (x, j, e) => [x, ph + (r + e) * Math.sin(A(j)), -(r + e) * Math.cos(A(j))], nb = Math.round(F.len / F.rib);
      for (let i = 0; i < nb; i++) { const x0 = -hl + i * F.len / nb, x1 = x0 + F.len / nb; for (let j = 0; j < NA; j++) { const m = (A(j) + A(j + 1)) / 2; qf(B, 'glassClear', P(x0, j, 0), P(x1, j, 0), P(x1, j + 1, 0), P(x0, j + 1, 0), [0, Math.sin(m), -Math.cos(m)]); } }
      for (let i = 0; i <= nb; i++) { const x = -hl + i * F.len / nb; for (let j = 0; j < NA; j++) DK.tube(B, 'white', P(x, j, .12), P(x, j + 1, .12), .3, 4, { col: RIB }); }
      [3, 6, 9].forEach(j => DK.tube(B, 'bronze', P(-hl, j, .1), P(hl, j, .1), .14, 4, { col: RIB }));
      /* the glazed ends: vertical strips from the floor to the arc, a mullion at each */
      [-1, 1].forEach(sx => { for (let j = 0; j < NA; j++) { const a = P(sx * hl, j, 0), b = P(sx * hl, j + 1, 0); qf(B, 'glassClear', [a[0], ph, a[2]], [b[0], ph, b[2]], b, a, [sx, 0, 0]); if (j) DK.tube(B, 'white', [a[0] + sx * .1, ph, a[2]], [a[0] + sx * .1, a[1], a[2]], .14, 4, { col: RIB }); } });
      /* the gallery floor (the second growing storey) and its beds; the core from the plinth to the gallery's ceiling */
      const yg = ph + F.sh, gw = Math.sqrt(r * r - F.sh * F.sh) - 1.4, Pg = [[hl - 1, -gw], [hl - 1, gw], [-hl + 1, gw], [-hl + 1, -gw]];
      fan(B, 'green', Pg, yg + .02, true, BEDS); fan(B, 'concrete', Pg, yg - .3, false, CON); B.box('cyan', -hl + 2, hl - 2, yg - .6, yg - .45, -.3, .3);
      coreBox(B, 0, 0, 4.2, 1.8, 0, yg + F.sh);
    },
    // ---- the growing stack: five tiers stepping back up the slope, glazed fronts, planted terraces, a blank back into the hill, the core at the back
    stack(F, B, X) {
      const hw = F.footprint.w / 2, back = -F.footprint.d / 2, n = F.tiers, th = F.tierH, front = k => F.footprint.d / 2 - k * F.step, c = [0, 0];
      /* the back: one retaining wall the whole height, buttressed */
      qf(B, 'concrete', [-hw, 0, back], [hw, 0, back], [hw, n * th, back], [-hw, n * th, back], [0, 0, -1], CON);
      for (let x = -hw + 8; x < hw; x += 16) B.panel(x, n * th / 2, back - .6, Math.PI, 1.6, n * th, 1.2, CON);
      for (let k = 0; k < n; k++) { const y0 = k * th, y1 = y0 + th, zf = front(k), ctr = [0, (zf + back) / 2];
        /* the sides: a ribbon of glass each storey; the front: the growing house's clear glass between mullions, doors on the foot tier */
        wall(B, [-hw, back], [-hw, zf], y0, y1, { c: ctr, band: 'glassClear', sill: .25, head: .82, dep: .3, bay: 4, col: WALL });
        wall(B, [hw, zf], [hw, back], y0, y1, { c: ctr, band: 'glassClear', sill: .25, head: .82, dep: .3, bay: 4, col: WALL });
        wall(B, [-hw, zf], [hw, zf], y0, y1, { c: ctr, band: 'glassClear', sill: .14, head: .9, dep: .8, bay: 4, pier: .3, col: WALL, doors: k ? [] : [.3, .7], doorList: X.doors, top: 3.6 });
        /* the floor slab inside, its beds; the tier's roof where the next stands back: a planted terrace behind a parapet */
        fan(B, k ? 'green' : 'concrete', [[-hw + .5, back + .5], [hw - .5, back + .5], [hw - .5, zf - .9], [-hw + .5, zf - .9]], y0 + .03, true, k ? BEDS : CON);
        const zr = k + 1 < n ? front(k + 1) : back; fan(B, 'concrete', [[-hw, back], [hw, back], [hw, zf], [-hw, zf]], y1 - .05, false, CON);
        fan(B, 'green',[[-hw + .4, zr], [hw - .4, zr], [hw - .4, zf - .4], [-hw + .4, zf - .4]], y1, true, BEDS);
        qf(B, 'concrete', [-hw, y1, zf], [hw, y1, zf], [hw, y1 + 1, zf], [-hw, y1 + 1, zf], [0, 0, 1], CON);
        qf(B, 'concrete', [-hw, y1, zf - .35], [hw, y1, zf - .35], [hw, y1 + 1, zf - .35], [-hw, y1 + 1, zf - .35], [0, 0, -1], CON); fan(B, 'concrete', [[-hw, zf - .35], [hw, zf - .35], [hw, zf], [-hw, zf]], y1 + 1, true, CON);
        [-1, 1].forEach(sx => qf(B, 'concrete', [sx * hw, y1, zr], [sx * hw, y1, zf], [sx * hw, y1 + 1, zf], [sx * hw, y1 + 1, zr], [sx, 0, 0], CON)); }
      (B.walk = B.walk || []).push({ pts: [[-hw, back], [hw, back], [hw, front(0)], [-hw, front(0)], [-hw, back]], doors: [], closed: true });
      /* the core at the back, a head-house over the top terrace; vent stacks */
      const Fc = MP.FAMILY.stack, zc = Fc ? Fc.core.shafts[0].z : -22; coreBox(B, 0, zc, 4.4, 2, 0, F.height.tip);
      [-20, 20].forEach(x => { B.lathe('concrete', [[1.2, n * th], [1.2, n * th + 2.4]], 10, { cx: x, cz: back + 6, uv: 2 }); B.lathe('dark', [[1.2, n * th + 2.4], [0, n * th + 2.4]], 10, { cx: x, cz: back + 6 }); });
    },
    // ---- the hub hall: a drum of two storeys under a ribbed shell dome with an oculus, the glazed apse arch on +z over the doors
    hall(F, B, X) {
      const r = F.r, H = F.height.roof, top = F.height.tip;
      DK.lobbyRing(B, { r: () => r, h: F.hall, seg: 64, doors: [Math.PI / 2], pier: .9, dep: .7, mat: 'white' }, X.doors);
      DK.ring(B, { r: () => r, y0: F.hall, y1: H, sh: F.sh, seg: 64, pier: .45, pierEvery: 2, sill: .3, head: .8, mat: 'white' });
      [F.hall, H].forEach(y => B.lathe('bronze', [[r + .05, y - .5], [r + .5, y - .4], [r + .5, y + .3], [r + .05, y + .4]], 64, { uv: 2 }));
      /* the shell: from the drum's head to the oculus, sixteen shallow ribs in its surface (a scallop) */
      const dp = []; for (let i = 0; i <= 12; i++) { const b = i / 12 * Math.PI / 2, rr = F.oculus + (r + .6 - F.oculus) * Math.cos(b); dp.push([rr, H + (top - 1.5 - H) * Math.sin(b)]); }
      DK.lathe(B, 'white', dp, 96, { mod: t => 1 - .03 * (1 - Math.abs(Math.cos(F.ribs / 2 * t))) }); DK.lathe(B, 'white', dp.slice().reverse().map(q => [q[0] - .45, q[1] - .3]), 48, {});
      B.lathe('bronze', [[F.oculus, top - 1.5], [F.oculus + .1, top], [F.oculus - .8, top], [F.oculus - .8, top - 1.6]], 24, { uv: 2 });
      /* the apse: a parabolic arch of white concrete on +z standing over the doors, its glass in the drum behind; a canopy under it */
      const ax = 15, ah = 21, zA = r + 3, arc = s => [ax * s, ah * (1 - s * s), zA]; for (let i = 0; i < 14; i++) { const s0 = -1 + 2 * i / 14, s1 = -1 + 2 * (i + 1) / 14; DK.tube(B, 'white', arc(s0), arc(s1), 1.1, 8, { col: RIB }); }
      B.box('concrete', -9, 9, 4.6, 5, r - .8, zA + 1, { uv: 3 }); [-8.4, 8.4].forEach(x => B.box('concrete', x - .3, x + .3, 0, 4.6, zA + .2, zA + .8, { uv: 2 }));   /* the canopy's posts (its glass gone, it stood on nothing) */
      coreDrum(B, 4.4, 0, H);
    },
    // ---- the market: a glass drum on piers, two storeys of stalls, a folded concrete umbrella of twelve petals on to a lantern
    market(F, B, X) {
      const r = F.r, H = F.height.roof, ro = r + 4, yl = H + 5.6;
      DK.lobbyRing(B, { r: () => r, h: F.sh, seg: 72, doors: [0, Math.PI / 2, Math.PI, -Math.PI / 2], pier: .7, dep: .9, mat: 'concrete' }, X.doors);
      DK.ring(B, { r: () => r, y0: F.sh, y1: H, sh: H - F.sh, seg: 72, pier: .5, sill: .2, head: .85, mat: 'concrete' });
      const mod = t => 1 - .07 * (1 - Math.abs(Math.cos(F.petals / 2 * t)));
      DK.lathe(B, 'concrete', [[ro, H], [r * .7, H + 3.2], [F.lantern, yl]], 96, { mod }); DK.lathe(B, 'concrete', [[F.lantern, yl - .3], [r * .7, H + 2.9], [ro, H - .3]], 96, { mod }); B.lathe('concrete', [[ro, H - .3], [ro, H]], 96, { mod, uv: 2 });
      B.lathe('glassClear', [[F.lantern, yl], [F.lantern, yl + 1.4]], 18, { uv: 4 }); DK.lathe(B, 'bronze', [[F.lantern + .5, yl + 1.4], [.3, F.height.tip]], 18, { uv: 2, col: RIB });
      for (let k = 0; k < 6; k++) { const t = k * PI2 / 6; B.obox('bronze', Math.cos(t) * F.lantern, yl + .75, Math.sin(t) * F.lantern, Math.PI / 2 - t, .3, 1.6, .3, { uv: 2, col: RIB }); }   /* the cap's mullions (as the pod's) */
      for (let k = 0; k < F.petals; k++) { const a = k / F.petals * PI2; B.panel(Math.cos(a) * (ro - 1.2), H / 2, Math.sin(a) * (ro - 1.2), Math.PI / 2 - a, .9, H, .9, CON); }
      coreDrum(B, 4.4, 0, H);
    },
    // ---- the water tower: the pump drum, the fluted shaft, the bowl and its gallery, the cap
    watertower(F, B, X) {
      const b = F.base, s = F.shaft, w = F.bowl;
      DK.lobbyRing(B, { r: () => b.r, h: b.h, seg: 32, doors: [Math.PI / 2], pier: .6, dep: .5, mat: 'concrete' }, X.doors);
      B.lathe('concrete', [[b.r + .05, b.h], [s.r, b.h]], 32, { uv: 3 });
      DK.lathe(B, 'concrete', col(s.r, b.h, w.y0), 48, { mod: t => 1 - .07 * Math.abs(Math.sin(s.flutes / 2 * t)) });
      /* the bowl: a cone from the shaft's neck to the drum, the drum of tanks with a slot of glass at the gallery, the cap */
      DK.lathe(B, 'concrete', [[s.r, w.y0], [w.r, w.y1]], 48, {});
      DK.lathe(B, 'white', col(w.r, w.y1, w.top), 48, {}); B.lathe('glass', [[w.r + .02, w.y1 + 1.2], [w.r + .02, w.y1 + 2.4]], 48, { uv: 4 });
      B.lathe('concrete', [[w.r + 2.4, w.y1], [w.r, w.y1]], 48, { uv: 3 }); B.lathe('concrete', [[w.r, w.y1 - .25], [w.r + 2.4, w.y1 - .25]], 48, { uv: 3 }); B.lathe('concrete', [[w.r + 2.4, w.y1 - .25], [w.r + 2.4, w.y1]], 48, { uv: 2 });
      for (let k = 0; k < 24; k++) { const a = k / 24 * PI2; B.panel(Math.cos(a) * (w.r + 2.3), w.y1 + .55, Math.sin(a) * (w.r + 2.3), Math.PI / 2 - a, .12, 1.1, .12, RIB); }
      B.lathe('bronze', [[w.r + 2.3, w.y1 + 1.05], [w.r + 2.3, w.y1 + 1.15]], 48, { uv: 2 });
      DK.lathe(B, 'concrete', [[w.r + .5, w.top], [1.6, F.height.tip - 1]], 48, {}); B.lathe('dark', [[1.6, F.height.tip - 1], [1.6, F.height.tip], [0, F.height.tip]], 12, { uv: 2 });
    },
    // ---- the aqueduct: three arches, half piers at the ends (two modules meet in one pier), spandrels, the soffits, the deck, a dry trough
    aqueduct(F, B, X) {
      const L = F.len / 2, sp = F.len / F.arches, pw = F.pier / 2, hz = F.footprint.d / 2, ys = F.spring, yd = F.deck, T = F.trough, ar = sp / 2 - pw, NS = 14;
      /* the piers: the two ends' halves and the inner ones; each a box from the ground to the deck, its faces into the arches only to the spring */
      for (let k = 0; k <= F.arches; k++) { const xc = -L + k * sp, x0 = Math.max(-L, xc - pw), x1 = Math.min(L, xc + pw);
        qf(B, 'concrete', [x0, 0, hz], [x1, 0, hz], [x1, yd, hz], [x0, yd, hz], [0, 0, 1], CON); qf(B, 'concrete', [x0, 0, -hz], [x1, 0, -hz], [x1, yd, -hz], [x0, yd, -hz], [0, 0, -1], CON);
        if (k > 0) qf(B, 'concrete', [x0, 0, -hz], [x0, 0, hz], [x0, ys, hz], [x0, ys, -hz], [-1, 0, 0], CON); else qf(B, 'concrete', [x0, 0, -hz], [x0, 0, hz], [x0, yd, hz], [x0, yd, -hz], [-1, 0, 0], CON);
        if (k < F.arches) qf(B, 'concrete', [x1, 0, -hz], [x1, 0, hz], [x1, ys, hz], [x1, ys, -hz], [1, 0, 0], CON); else qf(B, 'concrete', [x1, 0, -hz], [x1, 0, hz], [x1, yd, hz], [x1, yd, -hz], [1, 0, 0], CON);
        /* a cutwater course at the pier's foot */
        if (k > 0 && k < F.arches) B.panel(xc, .7, 0, 0, F.pier + .5, 1.4, F.footprint.d + .5, CON);
        DK.walkLine(B, [[x0, -hz], [x1, -hz], [x1, hz], [x0, hz]], true); }
      /* each arch: the spandrels on both faces (strips from the arch's curve to the deck), its soffit (the intrados, facing into the opening), a keystone band */
      for (let k = 0; k < F.arches; k++) { const c = -L + (k + .5) * sp;
        for (let i = 0; i < NS; i++) { const a0 = Math.PI * (1 - i / NS), a1 = Math.PI * (1 - (i + 1) / NS), p0 = [c + ar * Math.cos(a0), ys + ar * Math.sin(a0)], p1 = [c + ar * Math.cos(a1), ys + ar * Math.sin(a1)];
          [-1, 1].forEach(sz => qf(B, 'concrete', [p0[0], p0[1], sz * hz], [p1[0], p1[1], sz * hz], [p1[0], yd, sz * hz], [p0[0], yd, sz * hz], [0, 0, sz], CON));
          const m = (a0 + a1) / 2; qf(B, 'concrete', [p0[0], p0[1], -hz], [p1[0], p1[1], -hz], [p1[0], p1[1], hz], [p0[0], p0[1], hz], [-Math.cos(m), -Math.sin(m), 0], [.7, .68, .64]); }
        [-1, 1].forEach(sz => B.panel(c, ys + ar + .8, sz * (hz + .05), sz > 0 ? 0 : Math.PI, 1.4, 1.6, .2, RIB)); }
      /* the deck: its underside over nothing is the arches' (closed by the spandrels), a string course; the trough on it: floor, walls, a coping */
      [-1, 1].forEach(sz => B.panel(0, yd - .3, sz * (hz + .1), sz > 0 ? 0 : Math.PI, F.len, .6, .3, RIB));
      qf(B, 'concrete', [-L, yd, hz], [L, yd, hz], [L, T.y, hz], [-L, T.y, hz], [0, 0, 1], CON); qf(B, 'concrete', [-L, yd, -hz], [L, yd, -hz], [L, T.y, -hz], [-L, T.y, -hz], [0, 0, -1], CON);
      const wi = T.w / 2 - T.wall, wt = T.y + T.h; fan(B, 'concrete', [[-L, -wi], [L, -wi], [L, wi], [-L, wi]], T.y, true, [.55, .5, .45]);
      [-1, 1].forEach(sz => { qf(B, 'concrete', [-L, T.y, sz * hz], [L, T.y, sz * hz], [L, wt, sz * hz], [-L, wt, sz * hz], [0, 0, sz], CON); qf(B, 'concrete', [-L, T.y, sz * wi], [L, T.y, sz * wi], [L, wt, sz * wi], [-L, wt, sz * wi], [0, 0, -sz], CON);
        fan(B, 'concrete', [[-L, sz * wi], [L, sz * wi], [L, sz * hz], [-L, sz * hz]], wt, true, CON); });
      /* the ends: closed (a module with no neighbour shows its section), the trough's channel open between its walls */
      [-1, 1].forEach(sx => { qf(B, 'concrete', [sx * L, yd, -hz], [sx * L, yd, hz], [sx * L, T.y, hz], [sx * L, T.y, -hz], [sx, 0, 0], CON); [-1, 1].forEach(sz => qf(B, 'concrete', [sx * L, T.y, sz * wi], [sx * L, T.y, sz * hz], [sx * L, wt, sz * hz], [sx * L, wt, sz * wi], [sx, 0, 0], CON)); });
    },
    // ---- the pump house: an octagonal drum of two storeys, the eight-sided roof, the standpipe, the sluice channel
    pumphouse(F, B, X) {
      const r = F.r, H = F.height.roof, Po = poly(8, r, Math.PI / 8);
      walls(B, Po, 0, F.hall, { mat: 'concrete', band: 'glass', sill: .2, head: .86, dep: .5, bay: 3.4, doors: [{ i: 5, t: .5 }], top: 3.6, col: WALL }, X);
      walls(B, Po, F.hall, H, { mat: 'concrete', band: 'dark', sill: .4, head: .7, dep: .3, bay: 2.2, col: WALL, noWalk: true }, X);
      fan(B, 'concrete', poly(8, r - .5, Math.PI / 8), .03, true, CON); fan(B, 'concrete', poly(8, r - .5, Math.PI / 8), F.hall, true, CON); fan(B, 'concrete', poly(8, r - .5, Math.PI / 8), F.hall - .3, false, CON);
      /* the roof: an eave band, eight planes to a lantern */
      const Pe = poly(8, r + 1.2, Math.PI / 8); ringP(B, 'concrete', Pe, Po, H, false, CON); for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; qf(B, 'concrete', [Pe[i][0], H, Pe[i][1]], [Pe[j][0], H, Pe[j][1]], [Pe[j][0], H + .4, Pe[j][1]], [Pe[i][0], H + .4, Pe[i][1]], [Pe[i][0] + Pe[j][0], 0, Pe[i][1] + Pe[j][1]], CON); }
      DK.strip(B, 'concrete', H + .4, r + 1.2, F.roof, 1.8, { seg: 8, a0: Math.PI / 8, a1: Math.PI / 8 + PI2, col: CON }); B.lathe('dark', [[1.8, F.roof], [0, F.roof]], 8, { uv: 2, a0: Math.PI / 8, a1: Math.PI / 8 + PI2 });
      /* the standpipe: a column at the west face to 24 m, banded, a cowl */
      const p = F.pipe; DK.lathe(B, 'bronze', col(p.r, 0, p.h - .8), 12,{ cx: p.x - r, cz: 0, col: [.7, .62, .54] }); [6, 12, 18].forEach(y => B.lathe('concrete', [[p.r + .3, y], [p.r + .3, y + .5]], 12, { cx: p.x - r, cz: 0, uv: 2 }));
      DK.lathe(B, 'concrete', [[p.r + .6, p.h - .8], [p.r + .6, p.h], [0, p.h]], 12, { cx: p.x - r, cz: 0 });
      /* the sluice: a channel out of the east face (its floor, two walls), a gate's frame at its head */
      const sl = F.sluice, x0 = r * Math.cos(Math.PI / 8), x1 = x0 + sl.len, hw = sl.w / 2;
      fan(B, 'concrete', [[x0, -hw], [x1, -hw], [x1, hw], [x0, hw]], .2, true, [.5, .48, .44]);
      [-1, 1].forEach(sz => { const z = sz * (hw + .3); qf(B, 'concrete', [x0, 0, z + sz * .3], [x1, 0, z + sz * .3], [x1, 1.4, z + sz * .3], [x0, 1.4, z + sz * .3], [0, 0, sz], CON); qf(B, 'concrete', [x0, .2, sz * hw], [x1, .2, sz * hw], [x1, 1.4, sz * hw], [x0, 1.4, sz * hw], [0, 0, -sz], CON);
        fan(B, 'concrete', [[x0, sz * hw], [x1, sz * hw], [x1, sz * (hw + .6)], [x0, sz * (hw + .6)]], 1.4, true, CON); B.panel(x0 + 1.2, 2.4, sz * (hw + .3), 0, .5, 4.8, .5, RIB); });
      qf(B, 'concrete', [x1, 0, -hw - .6], [x1, 0, hw + .6], [x1, 1.4, hw + .6], [x1, 1.4, -hw - .6], [1, 0, 0], CON);
      B.panel(x0 + 1.2, 4.6, 0, Math.PI / 2, sl.w + 1.2, .5, .5, RIB); B.panel(x0 + 1.2, 1.6, 0, Math.PI / 2, sl.w, 2.6, .12, [.45, .42, .4]);
      coreDrum(B, 4.4, 0, H);
    }
  });
})();
