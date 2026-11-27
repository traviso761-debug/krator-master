// ================================================================= ANCIENT TRANSIT — drawing the deep line  [draw]
// KTRANSIT.line's records as meshes (a whole line or a window of one: KTRANSIT.lineWindow). By 20 m section, one sweep of two frames where the
// line runs straight at one pitch, every 4 m where the heading, the grade or a track's offset bends (the owner, 2026-11-09: triangles):
//   the lining (KTRANSIT.draw.lining: the section's profile facing inward, two-sided), a ring rib a section (12 arcs, end faces), the invert; spalled, darker with
//   spalls on the floor; fallen, no lining and a mound of rubble; flooded, the water's face at a metre. A junction section is the wider cavern
//   (o.junction over the gallery widened 9 m west and 6.5 m east, 11 m to the springing, 20 m to the vault, its splits the section's) and a skirt
//   (when the two profiles have as many points) closes the step between
//   them. The shallow form is lined as the gallery; the open form has no vault, a retaining wall where the ground stands over the invert; the
//   elevated form stands on a deck and its piers.
//   The guideways along every run of every track but a cut one (at its offset: a track that splays into a station), their slots, buffer stops
//   where a run meets a cut, a blocked run's stop; the crossovers' beams; the central strip, the walkway and its rail, the access road, its barrier
//   and footway, the crown's light strip (lit with o.lit) out of junctions and stations; the refuge niches (a dark recess and an enamel plate),
//   a shaft's mouth in the vault, a branch's portal, a door (shut: a bulkhead across; open: its frame); the stations' platforms (concrete to the car
//   floor, paving, the yellow edge on the track's side) and their furniture (o.furn.build, as the subway's).
//
//   A host that draws its own window more closely passes o.host: {sectionsAt(s) -> [S...] (several where bores run side by side), profileAt(s, S)
//   -> [[lat, up], ...], cut(ring s, i, P, S) (a profile segment gone), openings [{s0, s1, wall 'e' | 'w', y0, y1, kind, sec}], works(s) (the
//   gallery's works here), lit(s), ribs}: the lining is laid by it (hostedLining) and the works only where it says; o.niches, o.shafts, o.branches,
//   o.doors, o.stations false leave those to the host; o.mats its own materials by family (B.finish's), o.liningFam the lining's family.
//   KTRANSIT.draw.line(LN, {furn, lit, junction, shadow, host, mats, liningFam, niches, shafts, branches, doors, stations}) -> Group
//                                                         userData {tris, sections, stations, id}
(function () {
  const T = KTRANSIT, C = () => T.COL, dk = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  /* a box profile clockwise in (lat, up) (up the west side, across the top, down the east), a ribbon facing up (toward +lat) */
  const boxP = (x0, x1, y0, y1) => [[x0, y0], [x0, y1], [x1, y1], [x1, y0]];
  const ribbon = (x0, x1, y) => [[x0, y], [x1, y]];
  const sm = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  /* the frames of a stretch: two where it runs straight at one pitch and offset, else every 4 m (the bends test, as draw.road's) */
  function bends(LN, s0, s1, offFn) {
    const P = LN.path, a = P.at(s0), b = P.at(s1), m = P.at((s0 + s1) / 2);
    if (Math.abs(a.yaw - b.yaw) > 1e-3 || Math.abs(a.yaw - m.yaw) > 1e-3) return true;
    if (Math.abs((LN.floorAt(s0) + LN.floorAt(s1)) / 2 - LN.floorAt((s0 + s1) / 2)) > 0.01) return true;
    if (offFn && Math.abs((offFn(s0, 0) + offFn(s1, 1)) / 2 - offFn((s0 + s1) / 2, 0.5)) > 0.01) return true;
    return false;
  }
  const fr = (LN, s0, s1, up, offFn) => T.draw.frames(LN, s0, s1, bends(LN, s0, s1, offFn) ? 4 : Math.max(1e-3, s1 - s0), up, offFn);
  const at = (LN, s, lat, up) => { const p = LN.path.at(s); return T.frame(p.x + Math.cos(p.yaw) * lat, LN.floorAt(s) + (up == null ? 0 : up), p.z - Math.sin(p.yaw) * lat, p.yaw, 0, 0); };
  /* THE HOSTED LINING (o.host): a host that knows its window better than the forms do (a station cavern, twin bores, a fall, doors in the wall)
     gives its sections and profile by s, the lining it has lost (cut) and its openings; the lining is laid in 2 m rings, merged into one sweep
     wherever nothing changes from ring to ring (sections, cuts, openings): the end walls where the sections change (one into several), the
     openings' jambs through the lining's thickness, a niche's enamel plate, a rib every 10 m where a ring is whole */
  function hostedLining(B, LN, o, col) {
    const H = o.host, L = LN.L, ops = (H.openings || []).filter(O => O.s1 > 0 && O.s0 < L), lin = S => S.lining == null ? LN.sec.lining : S.lining;
    const P3 = (s, lat, up) => { const p = LN.path.at(s); return [p.x + Math.cos(p.yaw) * lat, LN.floorAt(s) + up, p.z - Math.sin(p.yaw) * lat]; };
    const cuts = [0, L]; for (let s = 2; s < L; s += 2) cuts.push(s); ops.forEach(O => { if (O.s0 > 0) cuts.push(O.s0); if (O.s1 < L) cuts.push(O.s1); });
    const xs = cuts.sort((a, b) => a - b).filter((v, i, A) => !i || v - A[i - 1] > 1e-6);
    const wallOf = (O, S) => O.sec ? (O.sec.key === S.key) : true;
    const pieces = [];
    for (let k = 0; k + 1 < xs.length; k++) {
      const a = xs[k], b = xs[k + 1], ring = Math.floor((a + 1e-6) / 2) * 2, SS = H.sectionsAt(ring + 1), parts = SS.map(S => {
        const P = H.profileAt(ring + 1, S), mask = [];
        for (let i = 0; i + 1 < P.length; i++) { const p = P[i], q = P[i + 1];
          const shut = H.cut && H.cut(ring, i, P, S), hole = ops.some(O => { const wx = O.wall === 'e' ? S.x1 : S.x0; return wallOf(O, S) && p[0] === wx && q[0] === wx && O.s0 <= a + 1e-6 && O.s1 >= b - 1e-6 && Math.min(p[1], q[1]) >= O.y0 - 1e-6 && Math.max(p[1], q[1]) <= O.y1 + 1e-6; });
          mask.push(shut || hole ? 0 : 1); }
        return { S, P, mask }; });
      pieces.push({ a, b, ring, parts, key: parts.map(x => x.S.key + ':' + x.mask.join('')).join('|'), set: parts.map(x => x.S.key).join('+') });
    }
    /* merge runs of equal pieces (at most 20 m, on the 20 m grid) and sweep each kept stretch of each profile */
    let run = null;
    const flush = () => { if (!run) return; const F = [T.frame(...P3(run.a, 0, 0), LN.path.at(run.a).yaw, 0, 0), T.frame(...P3(run.b, 0, 0), LN.path.at(run.b).yaw, 0, 0)], h = T.u(LN.seed, Math.round(run.a), 70, 1), tone = dk(col.concrete, 0.85 * (0.93 + 0.12 * h));
      run.parts.forEach(pt => { let i0 = -1; for (let i = 0; i <= pt.mask.length; i++) { const on = i < pt.mask.length && pt.mask[i]; if (on && i0 < 0) i0 = i; if (!on && i0 >= 0) { T.draw.lining(B, pt.P.slice(i0, i + 1).map(p => [p[0], p[1]]), F, tone, { u0: run.a, fam: o.liningFam }); i0 = -1; } } }); run = null; };
    pieces.forEach(pc => { const grid = Math.floor((pc.a + 1e-6) / 20); if (run && run.key === pc.key && run.grid === grid) run.b = pc.b; else { flush(); run = { a: pc.a, b: pc.b, key: pc.key, parts: pc.parts, grid }; } });
    flush();
    /* the end walls: where one section gives way to several (or the reverse), the single ring outside, the others its holes */
    const V2 = v => new THREE.Vector2(v[0], v[1]);
    for (let k = 1; k < pieces.length; k++) { const A = pieces[k - 1], Bp = pieces[k]; if (A.set === Bp.set || !A.parts.length || !Bp.parts.length) continue;
      if (A.parts.length > 1 && Bp.parts.length > 1) continue;
      const span = L2 => Math.max(...L2.map(x => x.S.x1)) - Math.min(...L2.map(x => x.S.x0)), one = A.parts.length === 1 && (Bp.parts.length > 1 || span(A.parts) > span(Bp.parts)) ? A : Bp, other = one === A ? Bp : A;
      const outer = one.parts[0].P.map(V2), holes = other.parts.map(x => x.P.map(V2)), all = outer.concat(...holes), s = Bp.a;
      try { THREE.ShapeUtils.triangulateShape(outer, holes).forEach(t => { const q = t.map(j => P3(s, all[j].x, all[j].y)); B.tri(o.liningFam || 'tunnel', q[0], q[1], q[2], dk(col.concrete, 0.78)); }); } catch (e) { void e; } }
    /* the openings' jambs, their head and sill through the lining; a niche's enamel plate beside it */
    ops.forEach(O => { const S = O.sec || H.sectionsAt((O.s0 + O.s1) / 2)[0]; if (!S) return; const sx = O.wall === 'e' ? 1 : -1, x0 = O.wall === 'e' ? S.x1 : S.x0, x1 = x0 + sx * lin(S), c = dk(col.concDark, 0.9), s0 = Math.max(0, O.s0), s1 = Math.min(L, O.s1);
      B.quad(o.liningFam || 'tunnel', P3(s0, x0, O.y0), P3(s0, x1, O.y0), P3(s0, x1, O.y1), P3(s0, x0, O.y1), c); B.quad(o.liningFam || 'tunnel', P3(s1, x0, O.y0), P3(s1, x0, O.y1), P3(s1, x1, O.y1), P3(s1, x1, O.y0), c);
      B.quad(o.liningFam || 'tunnel', P3(s0, x0, O.y1), P3(s0, x1, O.y1), P3(s1, x1, O.y1), P3(s1, x0, O.y1), c); if (O.y0 > 0.05) B.quad(o.liningFam || 'tunnel', P3(s0, x0, O.y0), P3(s1, x0, O.y0), P3(s1, x1, O.y0), P3(s0, x1, O.y0), c);
      if (O.kind === 'niche') { const m = T.frame(...P3(s1 + 0.425, x0 - sx * 0.02, O.y1 - 0.55), LN.path.at(s1).yaw, 0, 0); B.box('paint', m, 0.03, 0.35, 0.45, col.red); B.box('paint', m.clone().multiply(T.frame(-sx * 0.012, 0.03, 0, 0, 0, 0)), 0.01, 0.29, 0.39, col.white); } });
    /* a rib every 10 m where the ring is whole and single */
    const prof12 = S => T.lineProfile(S, 12).map(p => [p[0], p[1]]), ins = S => Object.assign({}, S, { x0: S.x0 + 0.15, x1: S.x1 - 0.15, crown: S.crown - 0.15 });
    if (H.ribs !== false) for (let s = 5; s < L - 1; s += 10) { const pc = pieces.find(p => s >= p.a && s < p.b); if (!pc || pc.parts.length !== 1 || pc.parts[0].mask.some(m => !m)) continue;
      const S = pc.parts[0].S; if (!(S.x1 > S.x0)) continue; const wall = prof12(S), rib = prof12(ins(S)), f0 = T.frame(...P3(s, 0, 0), LN.path.at(s).yaw, 0, 0), f1 = T.frame(...P3(s + 0.3, 0, 0), LN.path.at(s).yaw, 0, 0), rc = dk(col.concDark, 0.8);
      T.draw.lining(B, rib, [f0, f1], rc, { fam: o.liningFam }); T.draw.lining(B, i => i ? rib : wall, [f0, f0], rc, { fam: o.liningFam }); T.draw.lining(B, i => i ? wall : rib, [f1, f1], rc, { fam: o.liningFam }); }
  }
  T.draw.line = function (LN, o) {
    o = o || {}; const B = T.builder(), col = C(), S = LN.sec, u = (a, b, c) => T.u(LN.seed, a, b, c);
    const J = Object.assign({ x0: S.x0 - 9, x1: S.x1 + 6.5, spring: 11, crown: 20, wsplit: S.wsplit, esplit: S.esplit }, o.junction || {});
    const prof = (Q, n) => T.lineProfile(Q, n == null ? 24 : n).map(p => [p[0], p[1]]), inset = Q => Object.assign({}, Q, { x0: Q.x0 + 0.15, x1: Q.x1 - 0.15, crown: Q.crown - 0.15 });
    const PG = prof(S), PJ = prof(J), WG = prof(S, 12), WJ = prof(J, 12), RG = prof(inset(S), 12), RJ = prof(inset(J), 12), skirt = PG.length === PJ.length, lined = f => f !== 'open' && f !== 'elevated';
    const inSt = s => LN.stations.some(st => s >= st.s0 && s <= st.s1), secAt = s => LN.formAt(s) === 'junction' ? J : S;
    T.draw.tunnelMat();
    /* THE SECTIONS (a host's own lining, or the forms') */
    let prev = null;
    if (o.host) { hostedLining(B, LN, o, col);
      LN.sections.forEach(Sc => { const mid = (Sc.s0 + Sc.s1) / 2; if (!o.host.works || !o.host.works(mid)) return; const F = fr(LN, Sc.s0, Sc.s1, 0), w = S.walk, r = S.road, lit = o.host.lit ? o.host.lit(mid) : !!o.lit;
        B.sweep('concrete', ribbon(S.x0, S.x1, 0), F, dk(col.concDark, 0.75), { u0: Sc.s0, open: true });
        B.sweep('concrete', boxP(S.strip.x0, S.strip.x1, 0, S.strip.y), F, col.concrete, { u0: Sc.s0 });
        B.sweep('concrete', boxP(w.x0, w.x1, 0, w.y), F, dk(col.concrete, 0.9), { u0: Sc.s0 });
        B.sweep('steel', boxP(w.x0 + 0.02, w.x0 + 0.08, w.y + 1.0, w.y + 1.08), F, col.steelDark, { u0: Sc.s0 });
        B.sweep('concrete', boxP(r.foot[0], r.foot[1], 0, r.footY), F, dk(col.concrete, 0.9), { u0: Sc.s0 });
        B.sweep('asphalt', boxP(r.x0, r.x1, 0, r.y), F, col.asphalt, { u0: Sc.s0 });
        B.sweep('line', ribbon(r.lane - 0.08, r.lane + 0.08, r.y + 0.01), F, col.lineWhite, { u0: Sc.s0, open: true });
        B.sweep('concrete', boxP(r.barrier[0], r.barrier[1], 0, r.barrierH), F, col.concrete, { u0: Sc.s0 });
        if (o.host.sectionsAt(mid).length) { const yc = T.lineCeil(S, 0) - 0.06; B.sweep(lit ? 'glow' : 'glass', [[0.4, yc], [-0.4, yc]], F, lit ? col.cyan : col.glassDark, { u0: Sc.s0, open: true }); } }); }
    else LN.sections.forEach(Sc => {
      const Q = Sc.form === 'junction' ? J : S, P = Q === J ? PJ : PG, F = fr(LN, Sc.s0, Sc.s1, 0), mid = (Sc.s0 + Sc.s1) / 2, len = Sc.s1 - Sc.s0;
      /* the skirt where the gallery and a junction meet: two rings at one frame, one each profile */
      if (skirt && prev && lined(Sc.form) && lined(prev.form) && (prev.form === 'junction') !== (Sc.form === 'junction')) { const A = prev.form === 'junction' ? PJ : PG; T.draw.lining(B, i => i ? P : A, [F[0], F[0]], dk(col.concrete, 0.8), {}); }
      prev = Sc;
      if (lined(Sc.form) && Sc.state !== 'fallen') {
        T.draw.lining(B, P, F, dk(col.concrete, Sc.state === 'spalled' ? 0.68 : 0.85), { u0: Sc.s0 });
        /* one ring rib a section (12 arcs: it reads the same as 24): its inner face and its two end faces, 0.15 m proud of the lining */
        if (len > 1) { const a = Math.min(len - 0.4, 10), R0 = T.draw.frames(LN, Sc.s0 + a, Sc.s0 + a + 0.3, 1, 0), f0 = R0[0], f1 = R0[R0.length - 1], wall = Q === J ? WJ : WG, rib = Q === J ? RJ : RG, rc = dk(col.concDark, 0.8);
          T.draw.lining(B, rib, [f0, f1], rc, { u0: Sc.s0 + a, fam: 'tunnel' }); T.draw.lining(B, i => i ? rib : wall, [f0, f0], rc, {}); T.draw.lining(B, i => i ? wall : rib, [f1, f1], rc, {}); }
        if (Sc.state === 'spalled') for (let k = 0; k < 4; k++) { const side = u(Sc.i, 61, k) < 0.5 ? -1 : 1, lat = side > 0 ? Q.x1 - 0.8 - u(Sc.i, 62, k) * 1.5 : Q.x0 + 0.8 + u(Sc.i, 62, k) * 1.5, sz = 0.3 + 0.6 * u(Sc.i, 63, k);
          B.box('rubble', at(LN, Sc.s0 + len * u(Sc.i, 64, k), lat, 0).multiply(T.frame(0, 0, 0, u(Sc.i, 65, k) * 3, 0.2, 0.3)), sz * 1.6, sz, sz * 1.2, dk(col.concrete, 0.6)); }
      }
      if (lined(Sc.form) && Sc.state === 'fallen') {
        const m0 = (Q.x0 + Q.x1) / 2; B.sweep('rubble', [[Q.x0, 0.1], [Q.x0 + 4, 3.6], [m0, 5.4], [Q.x1 - 4, 3.6], [Q.x1, 0.1]], F, col.rubble, { u0: Sc.s0, open: true });
        for (let k = 0; k < 3; k++) B.box('concrete', at(LN, Sc.s0 + len * u(Sc.i, 66, k), Q.x0 + (Q.x1 - Q.x0) * u(Sc.i, 67, k), 2 + 2 * u(Sc.i, 68, k)).multiply(T.frame(0, 0, 0, u(Sc.i, 69, k) * 3, 0.5, 0.4)), 4, 0.6, 2, dk(col.concrete, 0.75));
      } else B.sweep('concrete', ribbon(Q.x0, Q.x1, 0), F, dk(col.concDark, 0.75), { u0: Sc.s0, open: true });
      if (Sc.state === 'flooded') B.sweep('glass', ribbon(Q.x0, Q.x1, 1.0), F, col.glassDark, { open: true });
      /* the open form's retaining walls, where the ground stands over the invert; the elevated form's deck and piers */
      if (Sc.form === 'open') [[S.x0 - 0.6, S.x0, -1], [S.x1, S.x1 + 0.6, 1]].forEach(w => { const Fw = T.draw.frames(LN, Sc.s0, Sc.s1, 10, 0), hs = Fw.map((m, i) => { const s = Sc.s0 + len * i / (Fw.length - 1), q = LN.path.lateral(s, w[2] > 0 ? S.x1 + 0.3 : S.x0 - 0.3); return Math.max(1, LN.path.ground(q[0], q[1]) - LN.floorAt(s) + 0.5); });
        B.sweep('concrete', i => boxP(w[0], w[1], 0, hs[i]), Fw, col.concrete, { u0: Sc.s0, caps: true }); });
      if (Sc.form === 'elevated') { B.sweep('concrete', boxP(S.x0, S.x1, -1.4, 0), F, col.concrete, { u0: Sc.s0, caps: true });
        for (let a = 0; a < len - 1e-6; a += 20) { const s = Sc.s0 + a; [-12, 8].forEach(lat => { const q = LN.path.lateral(s, lat), g = LN.path.ground(q[0], q[1]), top = LN.floorAt(s) - 1.4; if (top - g > 0.5) B.box('concrete', T.frame(q[0], g - 0.5, q[1], LN.path.at(s).yaw, 0, 0), 3, top - g + 0.5, 2.4, dk(col.concrete, 0.9)); }); } }
      /* the gallery's works, out of junctions and stations and off a fallen section */
      if (Sc.form !== 'junction' && !inSt(mid) && Sc.state !== 'fallen') {
        const w = S.walk, r = S.road;
        B.sweep('concrete', boxP(S.strip.x0, S.strip.x1, 0, S.strip.y), F, col.concrete, { u0: Sc.s0 });
        B.sweep('concrete', boxP(w.x0, w.x1, 0, w.y), F, dk(col.concrete, 0.9), { u0: Sc.s0 });
        B.sweep('steel', boxP(w.x0 + 0.02, w.x0 + 0.08, w.y + 1.0, w.y + 1.08), F, col.steelDark, { u0: Sc.s0 });
        B.sweep('concrete', boxP(r.foot[0], r.foot[1], 0, r.footY), F, dk(col.concrete, 0.9), { u0: Sc.s0 });
        B.sweep('asphalt', boxP(r.x0, r.x1, 0, r.y), F, col.asphalt, { u0: Sc.s0 });
        B.sweep('line', ribbon(r.lane - 0.08, r.lane + 0.08, r.y + 0.01), F, col.lineWhite, { u0: Sc.s0, open: true });
        B.sweep('concrete', boxP(r.barrier[0], r.barrier[1], 0, r.barrierH), F, col.concrete, { u0: Sc.s0 });
        if (lined(Sc.form)) { const yc = T.lineCeil(S, 0) - 0.06; B.sweep(o.lit ? 'glow' : 'glass', [[0.4, yc], [-0.4, yc]], F, o.lit ? col.cyan : col.glassDark, { u0: Sc.s0, open: true }); }
      }
    });
    /* THE GUIDEWAYS: each run of each track but a cut one, in pieces on the 20 m grid; a buffer stop where a run meets a cut, a blocked run's stop */
    const G = S.guide, beam = boxP(-G.w / 2, G.w / 2, 0, G.h), slot = ribbon(-G.slot / 2, G.slot / 2, G.h + 0.004);
    const shade = { built: 1, kept: 0.95, worn: 0.75, blocked: 0.7, flooded: 0.8 };
    const stop = (tid, s, dir) => B.box('paint', at(LN, s, LN.offAt(tid, s), G.h).multiply(T.frame(0, 0, -dir * 0.5, 0, 0, 0)), 2.4, 1.1, 0.8, col.paintSafety);
    LN.tracks.forEach(tr => { const runs = LN.cond[tr.id], offFn = s => LN.offAt(tr.id, s);
      runs.forEach((r, k) => { if (r.state === 'cut') return;
        for (let a = r.s0; a < r.s1 - 1e-6;) { const b = Math.min(r.s1, (Math.floor(a / 20 + 1e-9) + 1) * 20), F = fr(LN, a, b, 0, offFn);
          B.sweep('concrete', beam, F, dk(col.concrete, shade[r.state] == null ? 1 : shade[r.state]), { u0: a }); B.sweep('steel', slot, F, col.steelDark, { u0: a, open: true }); a = b; }
        if (k > 0 && runs[k - 1].state === 'cut') stop(tr.id, r.s0 + 0.5, -1);
        if (k + 1 < runs.length && runs[k + 1].state === 'cut') stop(tr.id, r.s1 - 0.5, 1);
        if (r.state === 'blocked' && r.s0 > 0.5) stop(tr.id, r.s0 + 0.5, -1); }); });
    /* THE CROSSOVERS: a beam from track a to track b over the crossover's length */
    LN.crossovers.forEach(X => { if (X.state === 'gone') return; const offFn = s => { const t = sm((s - X.s0) / X.len); return LN.offAt(X.a, s) + (LN.offAt(X.b, s) - LN.offAt(X.a, s)) * t; };
      B.sweep('concrete', beam, T.draw.frames(LN, Math.max(0, X.s0), Math.min(LN.L, X.s1), 4, 0, offFn), dk(col.concrete, X.state === 'frozen' ? 0.7 : 0.95), { u0: X.s0 }); });
    /* THE NICHES: a dark recess on the wall and the enamel plate beside it */
    if (o.niches !== false) LN.niches.forEach(N => { const Q = secAt(N.s), lat = N.side > 0 ? Q.x1 - 0.03 : Q.x0 + 0.03, m = at(LN, N.s, lat, N.y);
      B.box('paint', m, 0.04, N.h, N.w, col.soot); B.box('paint', m.clone().multiply(T.frame(0, N.h - 0.5, N.w / 2 + 0.45, 0, 0, 0)), 0.05, 0.35, 0.45, col.red); });
    /* THE SHAFTS' mouths in the vault, the BRANCHES' portals, the DOORS */
    if (o.shafts !== false) LN.shafts.forEach(H => { if (H.s < 0 || H.s > LN.L) return; const Q = secAt(H.s); B.box('paint', at(LN, H.s, H.off, T.lineCeil(Q, H.off) - 0.08), 2 * H.r, 0.05, 2 * H.r, col.soot); });
    if (o.branches !== false) LN.branches.forEach(Bn => { const Q = secAt(Bn.s), lat = Bn.side > 0 ? Q.x1 - 0.03 : Q.x0 + 0.03, m = at(LN, Bn.s, lat, S.platformY);
      B.box('paint', m, 0.04, Bn.h, Bn.w, col.soot); B.box('steel', m.clone().multiply(T.frame(0, Bn.h, 0, 0, 0, 0)), 0.2, 0.4, Bn.w + 0.8, col.bronze);
      [-1, 1].forEach(e => B.box('steel', m.clone().multiply(T.frame(0, 0, e * (Bn.w / 2 + 0.2), 0, 0, 0)), 0.2, Bn.h, 0.4, col.bronze)); });
    if (o.doors !== false) LN.doors.forEach(D => { const Q = secAt(D.s), F = T.draw.frames(LN, Math.max(0, D.s - 0.5), Math.min(LN.L, D.s + 0.5), 1, 0);
      if (D.state === 'shut') B.sweep('steel', prof(inset(Q)), [F[0], F[F.length - 1]], dk(col.steelDark, 0.9), { caps: true });
      else T.draw.lining(B, prof(Object.assign({}, Q, { x0: Q.x0 + 0.6, x1: Q.x1 - 0.6, crown: Q.crown - 0.6 })), [F[0], F[F.length - 1]], col.steelDark, { fam: 'steel' }); });
    /* THE STATIONS: the platforms beside their tracks, their paving and yellow edges, the furniture */
    if (o.stations !== false) LN.stations.forEach(st => { st.platforms.forEach(pl => { const a = Math.max(0, pl.s0), b = Math.min(LN.L, pl.s1); if (b - a < 1) return;
      const offFn = s => LN.offAt(pl.track, s) + pl.side * (pl.edge + pl.w / 2), F = T.draw.frames(LN, a, b, bends(LN, a, b, offFn) ? 4 : b - a, 0, offFn), hw = pl.w / 2, e0 = -pl.side * hw, e1 = -pl.side * (hw - 0.4);
      B.sweep('concrete', boxP(-hw, hw, 0, pl.y), F, col.concrete, { u0: a, caps: true });
      B.sweep('pave', ribbon(-hw, hw, pl.y + 0.01), F, col.pave, { u0: a, open: true });
      B.sweep('line', ribbon(Math.min(e0, e1), Math.max(e0, e1), pl.y + 0.015), F, col.lineYellow, { u0: a, open: true }); });
      if (o.furn) st.furniture.forEach(p => { if (p.s < 0 || p.s > LN.L) return; const g = o.furn.build(p.kind, { state: p.state, variant: p.variant, seed: p.seed }); if (!g) return; const m = T.frame(p.x, p.y, p.z, p.yaw, 0, 0); g.children.forEach(ch => B.mesh(null, ch, m)); }); });
    const Gp = B.finish('line ' + LN.id, o.mats ? { mats: o.mats } : undefined); Gp.userData.sections = LN.sections.length; Gp.userData.stations = LN.stations.length; Gp.userData.id = LN.id;
    if (o.shadow) o.shadow.cast(Gp);
    return Gp;
  };
})();
