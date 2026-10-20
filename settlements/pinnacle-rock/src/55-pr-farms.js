// ================================================================= PINNACLE ROCK — the farms on the floor (P3b)  [G data]
// PRF.plan(o) lays the farm ring out inside the palisade (PLAN.md section 1: "the farms inside the palisade south and
// west as six contour terraces cut into field cells (no parcel overlaps another; orchards on the two outer terraces,
// paddies by the south spring, twelve farmhouses in field cells)"). Plain records only: no THREE, no DOM.
//
//   o = {PR, c ([x, z]: the mesa's middle), footR(a) (the mesa's foot radius at angle a about it), h(x, z) (the ground),
//        talus(x, z) (the debris slope's height there), liftEnd ([x, z]: where the lift road meets the palisade),
//        dims(key, v) -> {w, d, h}, tags (a core/tags registry), seed}
//   -> {terraces, cells, houses, palisade: {runs, posts, gates}, tracks, log}
//
// THE RING. Every point of the farms is (a, r): its angle a about the mesa's middle (0 east, a quarter turn south) and r
// metres out from the mesa's foot along that ray. Per half degree the ring runs from the debris slope's toe (t: the slope
// under half a metre) to the palisade (p); six terraces split it evenly (a terrace follows the foot round, the ground
// falling away from the mesa across it: the contour terraces of the plan), each in rows of about 40 m, each row cut
// into cells of about 34 m along it; a cell is the quad between its angles and radii, inset 1.5 m for the bunds. A cell
// stands only where every corner, edge middle and its centre is farmland (PR.zoneAt: not the road, the fair ground, a
// way, the pond, a band's hedge), off the debris slope, clear of the farm tracks and the spring.
// THE TRACKS: the terrace way round the ring between the third and fourth terraces, and a spur from each gate in to it;
// the forest road (PR.ROAD) crosses the ring from the forest gate to the fair ground.
// THE GATES: the forest gate on the road, the north-west gate where the lift road comes in, a west gate and an east gate
// toward the bands' grounds. The palisade's run is the plan's line (PR.PALISADE), broken by the gates' houses (Girder's
// gatehouse) and a watch post (Girder's stretch with its post) about every 220 m, ending where the debris slope rises.
const PRF = (function () {
  'use strict';
  const DEG = Math.PI / 180, TERR = 6, ROW = 40, CELL = 34, BUND = 1.5, TRACK = 6;
  // what a cell grows (Girder's PLOTS kinds; the crops after the plan: fonio on the sand terraces, the paddies by the
  // spring, stack figs and ember plums in the orchards)
  const CROPS = [['fonio', 0.42], ['millet', 0.2], ['pigeon pea', 0.14], ['gourd', 0.1], ['garden', 0.07], ['pen', 0.07]];
  const FRUIT = ['stack fig', 'ember plum'];

  function plan(o) {
    const PR = o.PR, c = o.c, LOG = {}, tags = o.tags || null;
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-farms') >>> 0;
    const u = (...k) => KRAND.unit(KRAND.hash(seed, ...k));
    // the foot's radius smoothed over 12 degrees (its lobes and frets would make the terraces' edges jagged, and a cell's
    // straight edges cross a jagged neighbour's), read between half-degree samples
    const A0 = -10, A1 = 200, ST = 0.5, W6 = 12, FS = [];
    for (let g = A0 - 6; g <= A1 + 6.01; g += ST) { let sm = 0, n = 0; for (let d = -6; d <= 6; d += 1) { sm += o.footR((g + d) * DEG); n++; } FS.push(sm / n); }
    const foot = a => { const f = (a / DEG - (A0 - 6)) / ST, i = Math.max(0, Math.min(FS.length - 2, Math.floor(f))), t = Math.max(0, Math.min(1, f - i)); return FS[i] + (FS[i + 1] - FS[i]) * t; };
    const P = (a, r) => { const R = foot(a) + r; return [c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]; };
    // ---------------------------------------------------------------- the ring, every half degree
    const ring = [];
    for (let g = A0; g <= A1; g += ST) {
      const a = g * DEG; let t = null, p = null;
      for (let r = 10; r < 1000; r += 2.5) { const q = P(a, r);
        if (t == null && o.talus(q[0], q[1]) < 0.5) t = r;
        if (PR.inFarms(q[0], q[1])) p = r; }
      ring.push({ g, a, t0: t, p0: p, t, p });
    }
    // the toe and the palisade smoothed over the same 12 degrees: the toe at the farthest of its neighbours (the terraces
    // keep off the slope), the palisade at the nearest (they keep inside it)
    ring.forEach((E, i) => { let tm = -1, pm = 1e9, any = true;
      for (let d = -W6; d <= W6; d++) { const F = ring[i + d]; if (!F) continue; if (F.t0 == null || F.p0 == null) { any = false; break; } tm = Math.max(tm, F.t0); pm = Math.min(pm, F.p0); }
      E.t = any ? tm : null; E.p = any ? pm : null; E.ok = any && E.p - E.t > 70; });
    const at = g => ring[Math.max(0, Math.min(ring.length - 1, Math.round((g - A0) / ST)))];
    // a terrace's radii at a ring entry: k 0..6 (the toe 8 m out, the palisade 14 m in)
    const rk = (E, k) => E.t + 8 + (E.p - 14 - E.t - 8) * k / TERR;
    // ---------------------------------------------------------------- the gates and the tracks
    const angOf = q => Math.atan2(q[1] - c[1], q[0] - c[0]) / DEG;
    const onPal = (g, name, key) => { const E = at(g); return E.p0 == null ? null : { name, g: E.g, x: P(E.a, E.p0 + 6)[0], z: P(E.a, E.p0 + 6)[1], key }; };   // the palisade's own line there (not the smoothed)
    const GATES = [{ name: PR.GATE.name, g: angOf([PR.GATE.x, PR.GATE.z]), x: PR.GATE.x, z: PR.GATE.z, road: true }];
    { const g = angOf(o.liftEnd), G = onPal(g, 'the north-west gate (the lift road)'); if (G) { G.x = o.liftEnd[0]; G.z = o.liftEnd[1]; GATES.push(G); } }
    { const G = onPal(150, 'the west gate (to the western bands\' grounds)'); if (G) GATES.push(G); }
    { const G = onPal(32, 'the east gate (to the eastern bands\' grounds)'); if (G) GATES.push(G); }
    const TRACKS = [];
    // the terrace way: the ring at the fourth terrace's inner edge, wherever the ring is wide enough
    { let run = [];
      ring.forEach(E => { if (E.ok) run.push(P(E.a, rk(E, 3))); else if (run.length) { if (run.length > 8) TRACKS.push({ name: 'the terrace way', pts: run, w: TRACK }); run = []; } });
      if (run.length > 8) TRACKS.push({ name: 'the terrace way', pts: run, w: TRACK }); }
    // a spur from each gate but the forest gate (the road is its way) in to the terrace way
    // where the ring is too narrow at a gate's angle (the north-west gate, near the ring's end) the spur runs straight to
    // the terrace way at the nearest angle where it is wide enough
    GATES.forEach(G => { if (G.road) return; let E = at(G.g);
      if (!E.ok) { const dir = G.g > 90 ? -1 : 1; for (let g = G.g; g >= A0 && g <= A1; g += dir * ST) { const F = at(g); if (F.ok) { E = F; break; } } }
      if (!E.ok) return; const end = P(E.a, rk(E, 3)), pts = [[G.x, G.z]], L = Math.hypot(end[0] - G.x, end[1] - G.z), n = Math.max(1, Math.ceil(L / 5));
      for (let k = 1; k <= n; k++) pts.push([G.x + (end[0] - G.x) * k / n, G.z + (end[1] - G.z) * k / n]);
      TRACKS.push({ name: 'the track from ' + G.name.replace(/ \(.*/, ''), pts, w: TRACK - 1 }); });
    const segD = (q, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = Math.max(1e-9, dx * dx + dz * dz), t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dz) / L2));
      return Math.hypot(q[0] - a[0] - dx * t, q[1] - a[1] - dz * t); };
    const trackD = q => { let d = 1e9; TRACKS.forEach(T => { for (let i = 1; i < T.pts.length; i++) d = Math.min(d, segD(q, T.pts[i - 1], T.pts[i]) - T.w / 2); }); return d; };
    const SP = PR.SPRING, inSpring = q => ((q[0] - SP.x) / (SP.rx + 6)) ** 2 + ((q[1] - SP.z) / (SP.rz + 6)) ** 2 < 1;
    // ---------------------------------------------------------------- the cells
    const cells = [], terraces = [], GRID = new Map();
    // two convex quads overlap unless an edge's normal separates them; the cells so far are kept in a 40 m grid
    const sep = (A, B) => { for (const Q of [A, B]) for (let j = 0; j < 4; j++) { const a = Q[j], b = Q[(j + 1) % 4], n = [-(b[1] - a[1]), b[0] - a[0]];
      const pa = A.map(q => q[0] * n[0] + q[1] * n[1]), pb = B.map(q => q[0] * n[0] + q[1] * n[1]);
      if (Math.max(...pa) <= Math.min(...pb) + 0.05 || Math.max(...pb) <= Math.min(...pa) + 0.05) return true; } return false; };
    const gk = (x, z) => Math.floor(x / 40) + ',' + Math.floor(z / 40);
    const clash = Q => { const cx = (Q[0][0] + Q[2][0]) / 2, cz = (Q[0][1] + Q[2][1]) / 2;
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (const D of (GRID.get(gk(cx + a * 40, cz + b * 40)) || [])) if (!sep(Q, D)) return true; return false; };
    for (let k = 0; k < TERR; k++) {
      // the terrace's rows: as many as its width at the ring's widest takes at ROW metres
      const wide = Math.max(...ring.filter(E => E.ok).map(E => rk(E, k + 1) - rk(E, k))), rows = Math.max(1, Math.round(wide / ROW));
      terraces.push({ k, rows, name: 'terrace ' + (k + 1) + (k >= 4 ? ' (orchards)' : '') });
      for (let rw = 0; rw < rows; rw++) {
        const r0 = E => rk(E, k) + (rk(E, k + 1) - rk(E, k)) * rw / rows + (k === 3 && rw === 0 ? TRACK / 2 + 1 : 0);
        const r1 = E => rk(E, k) + (rk(E, k + 1) - rk(E, k)) * (rw + 1) / rows - (k === 2 && rw === rows - 1 ? TRACK / 2 + 1 : 0);
        let i0 = null, len = 0, n = 0;
        for (let i = 0; i < ring.length; i++) {
          const E = ring[i];
          if (!E.ok) { i0 = null; len = 0; continue; }
          if (i0 == null) { i0 = i; len = 0; continue; }
          const rm = (r0(E) + r1(E)) / 2; len += (foot(E.a) + rm) * ST * DEG;
          if (len < CELL) continue;
          // the cell from ring[i0] to ring[i]: its quad inset by the bund
          const Ea = ring[i0], Eb = E, da = BUND / (foot(Ea.a) + rm), db = BUND / (foot(Eb.a) + rm);
          const C = [P(Ea.a + da, r0(Ea) + BUND), P(Eb.a - db, r0(Eb) + BUND), P(Eb.a - db, r1(Eb) - BUND), P(Ea.a + da, r1(Ea) - BUND)];
          i0 = i; len = 0;
          const cx = (C[0][0] + C[1][0] + C[2][0] + C[3][0]) / 4, cz = (C[0][1] + C[1][1] + C[2][1] + C[3][1]) / 4;
          const pts = C.concat(C.map((q, j) => [(q[0] + C[(j + 1) % 4][0]) / 2, (q[1] + C[(j + 1) % 4][1]) / 2]), [[cx, cz]]);
          if (pts.some(q => PR.zoneAt(q[0], q[1]).zone !== 'farms' || o.talus(q[0], q[1]) > 0.5 || trackD(q) < 1 || inSpring(q))) continue;
          if (clash(C)) continue;
          const hs = C.map(q => o.h(q[0], q[1])), lo = Math.min(...hs), hi = Math.max(...hs);
          const id = 'farm.' + k + '.' + rw + '.' + n++;
          { const k2 = gk(cx, cz); (GRID.get(k2) || GRID.set(k2, []).get(k2)).push(C); }
          cells.push({ id, k, row: rw, g: (Ea.g + Eb.g) / 2, corners: C.map(q => [+q[0].toFixed(2), +q[1].toFixed(2)]), x: +cx.toFixed(2), z: +cz.toFixed(2),
            y: +(hi + 0.15).toFixed(2), lo: +lo.toFixed(2), along: +Math.hypot(C[1][0] - C[0][0], C[1][1] - C[0][1]).toFixed(1),
            across: +Math.hypot(C[3][0] - C[0][0], C[3][1] - C[0][1]).toFixed(1), kind: null, crop: null, tag: null });
        }
      }
    }
    // what each grows: the orchards on the two outer terraces, the paddies by the spring, the rest drawn by the cell
    cells.forEach((C, i) => {
      const ds = Math.hypot(C.x - SP.x, C.z - SP.z), h1 = u(11, C.k, C.row, Math.round(C.g * 4));
      if (C.k >= 4) { C.kind = 'orchard'; C.crop = FRUIT[Math.floor(u(12, C.k, Math.round(C.g / 9)) * FRUIT.length)]; }
      else if (ds < 280 && C.k <= 3) { C.kind = 'paddy'; C.crop = 'rice'; }
      else { let t = 0, pick = CROPS[0][0]; for (const q of CROPS) { t += q[1]; if (h1 <= t) { pick = q[0]; break; } }
        C.kind = pick === 'garden' ? 'garden' : pick === 'pen' ? 'pen' : 'crop'; C.crop = pick === 'garden' ? 'kitchen garden' : pick === 'pen' ? 'beetle pen' : pick; }
    });
    // ---------------------------------------------------------------- the twelve farmhouses, each in a field cell
    const houses = [];
    const inQuad = (q, Q) => { for (let j = 0; j < 4; j++) { const a = Q[j], b = Q[(j + 1) % 4]; if ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]) < -0.01) return false; } return true; };
    const ccw = Q => { let s = 0; for (let j = 0; j < 4; j++) { const a = Q[j], b = Q[(j + 1) % 4]; s += a[0] * b[1] - b[0] * a[1]; } return s > 0 ? Q : Q.slice().reverse(); };
    // a farmhouse fitted to a cell, its front to the terrace way (the cell's inner edge on the outer terraces, its outer
    // edge on the inner): null when its footprint is not wholly inside the cell
    const vOf = C => C.kind === 'paddy' ? 2 : (u(14, Math.round(C.g * 2)) < 0.5 ? 0 : 1);
    const fit = C => {
      const v = vOf(C), D = o.dims('br_bldg_farmhouse', v); if (!D) return null;
      const Q = ccw(C.corners), ea = C.k >= 3 ? [C.corners[0], C.corners[1]] : [C.corners[3], C.corners[2]];
      const mx = (ea[0][0] + ea[1][0]) / 2, mz = (ea[0][1] + ea[1][1]) / 2, fx = mx - C.x, fz = mz - C.z, fl = Math.max(1e-9, Math.hypot(fx, fz)), ry = Math.atan2(fx / fl, fz / fl);
      const ux = Math.cos(ry), uz = -Math.sin(ry), vx = Math.sin(ry), vz = Math.cos(ry);
      const fp = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(q => [C.x + ux * D.w / 2 * q[0] + vx * D.d / 2 * q[1], C.z + uz * D.w / 2 * q[0] + vz * D.d / 2 * q[1]]);
      return fp.every(q => inQuad(q, Q)) ? { v, D, ry, fp } : null; };
    // the cells one fits, by angle round the ring; twelve taken at even steps through them, the middle terraces first,
    // none within 60 m of another farmhouse
    const fits = cells.filter(C => C.k >= 1 && C.k <= 3 && C.kind !== 'orchard').map(C => ({ C, F: fit(C) })).filter(f => f.F).sort((a, b) => a.C.g - b.C.g);
    for (let s = 0; s < 12 && fits.length; s++) {
      const want = fits[Math.min(fits.length - 1, Math.floor((s + 0.5) / 12 * fits.length))].C.g, score = f => Math.abs(f.C.g - want) + 2 * Math.abs(f.C.k - 2);
      const pick = fits.filter(f => !f.C.house && !houses.some(Hs => Math.hypot(Hs.x - f.C.x, Hs.z - f.C.z) < 60)).sort((a, b) => score(a) - score(b))[0];
      if (!pick) { LOG.farmhousesShort = 12 - s; break; }
      const C = pick.C, F = pick.F, hs = F.fp.map(q => o.h(q[0], q[1]));
      C.house = true; C.kind = 'farmstead';
      houses.push({ id: 'farmhouse.' + s, key: 'br_bldg_farmhouse', v: F.v, x: C.x, z: C.z, y: +Math.max(...hs).toFixed(2), ry: +F.ry.toFixed(4), w: F.D.w, d: F.D.d, h: F.D.h, cell: C.id,
        name: ['the farmhouse and its yard', 'the courtyard farm', 'the paddy farm on its piles'][F.v] + ' (' + (s + 1) + ' of 12)', tag: null });
    }
    // ---------------------------------------------------------------- the palisade: its line cut at the gates and the posts
    const L = PR.PALISADE, S = [0]; for (let i = 1; i < L.length; i++) S.push(S[i - 1] + Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]));
    const at_s = s => { let i = 1; while (i < L.length - 1 && S[i] < s) i++; const t = (s - S[i - 1]) / Math.max(1e-9, S[i] - S[i - 1]); return [L[i - 1][0] + (L[i][0] - L[i - 1][0]) * t, L[i - 1][1] + (L[i][1] - L[i - 1][1]) * t]; };
    const sOf = q => { let best = 0, bd = 1e9; for (let s = 0; s <= S[S.length - 1]; s += 1) { const p = at_s(s), d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; best = s; } } return best; };
    const ryAt = s => { const a = at_s(s - 5), b = at_s(s + 5), dx = b[0] - a[0], dz = b[1] - a[1], ry = Math.atan2(-dz, dx);
      // the piece's front (+z) out, away from the mesa
      const m = at_s(s), fz = [Math.sin(ry), Math.cos(ry)]; return (fz[0] * (m[0] - c[0]) + fz[1] * (m[1] - c[1]) < 0) ? ry + Math.PI : ry; };
    const total = S[S.length - 1], cuts = [];
    // where the debris slope rises at the two ends: the run stops there (the cliff is the wall)
    let s0 = 0, s1 = total; while (s0 < total && o.talus(...at_s(s0)) > 1) s0 += 2; while (s1 > 0 && o.talus(...at_s(s1)) > 1) s1 -= 2;
    const gates = GATES.map(G => { const s = sOf([G.x, G.z]), p = at_s(s), D = o.dims('br_port_girder_palisade', 1); cuts.push([s - D.w / 2, s + D.w / 2]);
      return { name: G.name, key: 'br_port_girder_palisade', v: 1, s: +s.toFixed(1), x: +p[0].toFixed(2), z: +p[1].toFixed(2), y: +o.h(p[0], p[1]).toFixed(2), ry: +ryAt(s).toFixed(4), w: D.w, d: D.d, h: D.h, road: !!G.road, tag: null }; });
    const posts = [], Dp = o.dims('br_port_girder_palisade', 0);
    for (let s = s0 + 120; s < s1 - 60; s += 220) { if (cuts.some(q => s + Dp.w / 2 > q[0] - 30 && s - Dp.w / 2 < q[1] + 30)) continue; const p = at_s(s); cuts.push([s - Dp.w / 2, s + Dp.w / 2]);
      posts.push({ name: 'a watch post on the palisade', key: 'br_port_girder_palisade', v: 0, s: +s.toFixed(1), x: +p[0].toFixed(2), z: +p[1].toFixed(2), y: +o.h(p[0], p[1]).toFixed(2), ry: +ryAt(s).toFixed(4), w: Dp.w, d: Dp.d, h: Dp.h, tag: null }); }
    cuts.sort((a, b) => a[0] - b[0]);
    const runs = []; { let s = s0; cuts.forEach(q => { if (q[0] > s + 2) runs.push([s, q[0]]); s = Math.max(s, q[1]); }); if (s1 > s + 2) runs.push([s, s1]); }
    const runRecs = runs.map((R, i) => { const pts = []; for (let s = R[0]; s <= R[1] + 0.01; s += Math.min(4, R[1] - R[0])) pts.push(at_s(Math.min(s, R[1])).map(v => +v.toFixed(2)));
      return { id: 'palisade.' + i, s0: +R[0].toFixed(1), s1: +R[1].toFixed(1), pts, tag: null }; });
    // ---------------------------------------------------------------- core/tags: every record before anything draws it
    if (tags) {
      cells.forEach(C => { const T = tags.add({ 'class': 'feature', kind: 'field', key: 'field:' + C.crop, at: [C.x, C.y, C.z], ry: 0, size: [C.along, C.across, 0], note: C.kind + ' of ' + C.crop + ' on terrace ' + (C.k + 1), src: 'pinnacle-rock' }); if (T) C.tag = T.id; });
      houses.forEach(Hs => { const T = tags.add({ 'class': 'building', kind: 'farmhouse', key: Hs.key, at: [Hs.x, Hs.y, Hs.z], ry: Hs.ry, size: [Hs.w, Hs.d, Hs.h], note: Hs.name, src: 'pinnacle-rock' }); if (T) Hs.tag = T.id; });
      gates.concat(posts).forEach(G => { const T = tags.add({ 'class': 'infrastructure', kind: G.v ? 'gate' : 'watch post', key: G.key, at: [G.x, G.y, G.z], ry: G.ry, size: [G.w, G.d, G.h], note: G.name, src: 'pinnacle-rock' }); if (T) G.tag = T.id; });
      runRecs.forEach(Rr => { const m = Rr.pts[Rr.pts.length >> 1], T = tags.add({ 'class': 'infrastructure', kind: 'palisade', key: 'palisade', at: [m[0], o.h(m[0], m[1]), m[1]], ry: 0, size: [Rr.s1 - Rr.s0, 0.5, 5.5], note: 'the palisade (' + Math.round(Rr.s1 - Rr.s0) + ' m)', src: 'pinnacle-rock' }); if (T) Rr.tag = T.id; });
      TRACKS.forEach(Tk => { const m = Tk.pts[Tk.pts.length >> 1], T = tags.add({ 'class': 'infrastructure', kind: 'track', key: 'track', at: [m[0], o.h(m[0], m[1]), m[1]], ry: 0, size: [Tk.w, 0, 0], note: Tk.name, src: 'pinnacle-rock' }); if (T) Tk.tag = T.id; });
    }
    const by = {}; cells.forEach(C => { by[C.kind] = (by[C.kind] || 0) + 1; });
    LOG.cells = cells.length + ' cells (' + Object.keys(by).map(k => by[k] + ' ' + k).join(', ') + ')';
    LOG.houses = houses.length + ' farmhouses'; LOG.palisade = Math.round(runs.reduce((s, R) => s + R[1] - R[0], 0)) + ' m of run, ' + gates.length + ' gates, ' + posts.length + ' posts';
    LOG.tracks = TRACKS.length + ' tracks';
    return { terraces, cells, houses, palisade: { runs: runRecs, posts, gates, s0, s1, total }, tracks: TRACKS, ring, log: LOG };
  }
  return { plan, TERR, CELL, ROW, BUND, TRACK, CROPS, FRUIT };
})();
