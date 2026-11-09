// ================================================================= ANCIENT TRANSIT — drawing the highway  [draw]
// KTRANSIT.highway's records as meshes: the deck (a swept slab with chamfered soffit, an asphalt top, lane paint, jersey barriers), the
// piers (column and cap; a stub with its rebar; nothing for fill or a culled one), the embankments under the low spans, the ramps and
// their landing roads, the lamp standards from the furniture bundle merged in, the rubble under a collapsed span as one instanced mesh.
// A collapsed span is the same deck built in its own frame and laid where its record's fall says; a cracked one is narrowed on the
// cracked side and its barrier there is gone; a gone span is nothing but its piers.
//
//   KTRANSIT.draw.highway(H, o) -> Group     o.furn: the furniture bundle (KratorTransitFurniture) for the lamps (none drawn without it),
//                                            o.shadow: a KSHADOW handle to cast; userData: {tris, spans, piers, lamps, rubble}
//   KTRANSIT.draw.line(B, L, o)              the spans, piers and lamps of one deck (a highway or a ramp) into a builder
//   KTRANSIT.draw.road(B, road, ground, o)   a road surface at grade along pts ([{x, z, y}] or [[x, z]]): asphalt in bands every 3 m, lines, o.pavement m of pave
//                                            each side; a KTRANSIT.road record (yAt, levelAt) is drawn at its graded level with embankment sides; road.shift
//                                            or o.shift carries its points (an earthquake's slip)
//   KTRANSIT.draw.rubble(list, o) -> InstancedMesh
//   KTRANSIT.draw.growth(B, S, M, L, o)      a span's soil, stand-in plants and creepers (S.growth, KTRANSIT.overgrow), in the span's matrix M;
//                                            o.plants false leaves the plants to the host
(function () {
  const T = KTRANSIT, C = () => T.COL;
  /* the deck's section: the top at up 0 across the width, a chamfered soffit DECK deep. crack: {side, depth} narrows it on that side */
  function deckProf(w, deck, crack) {
    const l = -w / 2 + (crack && crack.side < 0 ? crack.depth : 0), r = w / 2 - (crack && crack.side > 0 ? crack.depth : 0);
    return [[l, 0], [r, 0], [r, -0.45], [r - 1.1, -deck], [l + 1.1, -deck], [l, -0.45]];
  }
  const jersey = (x, h) => [[x - 0.3, 0], [x + 0.3, 0], [x + 0.3, 0.2], [x + 0.12, h], [x - 0.12, h], [x - 0.3, 0.2]].reverse();
  /* one deck span in its own frame (along z from 0 to len, the top at y 0), through the matrix M (the span's frame, or its fall) */
  function span(B, S, L, M, o) {
    const col = C(), w = S.width, deck = L.deck == null ? 1.4 : L.deck, f0 = M, f1 = M.clone().multiply(T.frame(0, 0, S.len, 0, 0, 0)), frames = [f0, f1];
    const capL = o && o.capL, capR = o && o.capR;
    B.sweep('concrete', deckProf(w, deck, S.crack), frames, col.concrete, { u0: S.s0, caps: capL || capR });
    /* the asphalt top, inside the barriers, and the lane paint */
    const l = -w / 2 + 0.35 + (S.crack && S.crack.side < 0 ? S.crack.depth : 0), r = w / 2 - 0.35 - (S.crack && S.crack.side > 0 ? S.crack.depth : 0), P = (x, y, z) => { const v = new THREE.Vector3(x, y, z).applyMatrix4(M); return [v.x, v.y, v.z]; };
    const up = new THREE.Vector3(0, 1, 0).transformDirection(M), UP = [up.x, up.y, up.z];
    B.quad('asphalt', P(l, 0.03, 0), P(r, 0.03, 0), P(r, 0.03, S.len), P(l, 0.03, S.len), S.state === 'cracked' ? col.asphaltOld : col.asphalt, { uv: [[S.s0, l], [S.s0, r], [S.s1, r], [S.s1, l]], face: UP });
    if (S.lanes > 0) {
      const lane = (w - 1.2 - 1.8 - 0.6) / S.lanes, lines = [];
      for (let k = 1; k < S.lanes / 2; k++) lines.push([0.6 + k * lane, true], [-0.6 - k * lane, true]);
      lines.push([0.6 + 0.1, false], [-0.6 - 0.1, false], [w / 2 - 1.3, false], [-w / 2 + 1.3, false]);
      lines.forEach(ln => { const x = ln[0]; if (x < l + 0.2 || x > r - 0.2) return; const cc = ln[1] ? col.lineWhite : col.lineYellow;
        if (!ln[1]) B.quad('line', P(x - 0.08, 0.045, 0), P(x + 0.08, 0.045, 0), P(x + 0.08, 0.045, S.len), P(x - 0.08, 0.045, S.len), cc, { face: UP });
        else for (let z = ((Math.ceil(S.s0 / 9) * 9) - S.s0); z < S.len; z += 9) { const z1 = Math.min(S.len, z + 3); if (z1 <= 0) continue; B.quad('line', P(x - 0.08, 0.045, Math.max(0, z)), P(x + 0.08, 0.045, Math.max(0, z)), P(x + 0.08, 0.045, z1), P(x - 0.08, 0.045, z1), cc, { face: UP }); } });
      /* the median barrier */
      B.sweep('concrete', jersey(0, 0.9), frames, col.concDark, { u0: S.s0, caps: true });
    }
    /* the edge barriers */
    [[-1, 0], [1, 1]].forEach(e => { if (!S.barriers[e[1]]) return; B.sweep('concrete', jersey(e[0] * (w / 2 - 0.3), 0.95), frames, col.concDark, { u0: S.s0, caps: true }); });
  }
  T.draw.growth = function (B, S, M, L, o) {
    const G = S.growth; if (!G) return;
    const col = C(), w = S.width, f = [M, M.clone().multiply(T.frame(0, 0, S.len, 0, 0, 0))], d = G.depth, e = w / 2 - 0.35, full = G.cover >= 0.85;
    let prof;
    if (full) prof = [[-e, 0.05], [-e + 1.4, d], [0, d * 1.15], [e - 1.4, d], [e, 0.05]];
    else { const mw = Math.max(1.2, G.cover * w * 0.42); prof = [[-e, 0.05], [-e + mw * 0.5, d], [-e + mw, 0.06], [e - mw, 0.06], [e - mw * 0.5, d], [e, 0.05]]; }
    B.sweep('soil', prof, f, full ? col.soil : col.soilDry, { u0: S.s0, open: true });
    const P = (x, y, z) => { const v = new THREE.Vector3(x, y, z).applyMatrix4(M); return [v.x, v.y, v.z]; };
    if (!(o && o.plants === false)) G.plants.forEach((p, k) => { const big = p.kind === 'bush', cc = big ? (k % 3 ? col.bush : col.bushDark) : col.grass; B.dome('plant', M.clone().multiply(T.frame(p.lat, p.up, p.along, 0, 0, 0)), p.r, p.h, cc, big ? 8 : 6); });
    G.creepers.forEach(cr => { const sx = cr.side * (w / 2 + 0.02), a0 = cr.along - cr.w / 2, a1 = cr.along + cr.w / 2, sd = new THREE.Vector3(cr.side, 0, 0).transformDirection(M);
      B.quad('plant', P(sx, 0.1, a0), P(sx, 0.1, a1), P(sx + cr.side * 0.25, -cr.len, a1), P(sx + cr.side * 0.25, -cr.len, a0), col.creeper, { face: [sd.x, sd.y, sd.z] }); });
  };
  function pier(B, p, L, w) {
    const col = C(), deck = L.deck == null ? 1.4 : L.deck;
    if (p.state === 'fill' || p.state === 'none') return;
    const capH = L.cap == null ? 0.9 : L.cap, colH = (p.state === 'stub' ? p.stub : p.h - capH) + 0.5, m = T.frame(p.x, p.yG - 0.5, p.z, p.yaw, 0, p.roll == null ? 0 : p.roll);
    B.box('concrete', m, Math.min(3.2, w * 0.2), colH, Math.min(2.4, w * 0.15), col.concrete, { noBottom: true });
    if (p.state === 'stub') { for (let k = 0; k < 4; k++) { const a = p.x + Math.cos(p.yaw) * (k % 2 ? 0.8 : -0.8) - Math.sin(p.yaw) * (k < 2 ? 0.6 : -0.6), c = p.z - Math.sin(p.yaw) * (k % 2 ? 0.8 : -0.8) - Math.cos(p.yaw) * (k < 2 ? 0.6 : -0.6); B.cyl('rust', [a, p.yG + p.stub - 0.2, c], [a + (k % 2 ? 0.3 : -0.2), p.yG + p.stub + 1.1 + 0.4 * (k % 3), c + (k < 2 ? 0.2 : -0.3)], 0.025, col.rust, 5); } return; }
    B.box('concrete', m.clone().multiply(T.frame(0, p.yTop - capH - (p.yG - 0.5), 0, 0, 0, 0)), w * 0.86, capH, Math.min(3.2, w * 0.18), col.concrete);
    void deck;
  }
  T.draw.line = function (B, L, o) {
    o = o || {}; const col = C(), deck = L.deck == null ? 1.4 : L.deck, down = S => !S || S.state === 'collapsed' || S.state === 'gone', furn = o.furn, M = L.piers ? null : null; void M;
    let lamps = 0;
    L.spans.forEach((S, i) => {
      if (S.state === 'gone') return;
      const fr = T.frame(S.x0, S.y0, S.z0, S.yaw, S.pitch, S.roll == null ? 0 : S.roll);
      if (S.state === 'collapsed') { const F = S.fall, m = T.frame(F.x, F.y + 0.4 + deck * 0.5 * Math.abs(Math.sin(F.roll)), F.z, F.yaw, F.pitch, F.roll).multiply(T.frame(0, 0, -S.len / 2, 0, 0, 0)); span(B, S, L, m, { capL: true, capR: true }); T.draw.growth(B, S, m, L, o); return; }
      span(B, S, L, fr, { capL: down(L.spans[i - 1]), capR: down(L.spans[i + 1]) });
      T.draw.growth(B, S, fr, L, o);
      /* the embankment under a low span: both its piers on fill */
      const pa = L.piers[i], pb = L.piers[i + 1];
      if (pa && pb && pa.state === 'fill' && pb.state === 'fill') { const g0 = pa.yG, g1 = pb.yG, w = S.width;
        B.sweep('rubble', k => { const h = (k ? S.y1 - g1 : S.y0 - g0) + 0.4; return [[w / 2 + 0.4, -deck + 0.2], [w / 2 + 0.4 + 1.5 * h, -h], [-w / 2 - 0.4 - 1.5 * h, -h], [-w / 2 - 0.4, -deck + 0.2]]; }, [fr, fr.clone().multiply(T.frame(0, 0, S.len, 0, 0, 0))], col.fill, { open: true, u0: S.s0 }); }
      if (furn) S.lamps.forEach(l => { const g = furn.build('tr_lamp', { state: l.state, variant: 0, seed: l.seed }); if (!g) return; const m = T.frame(l.x, l.y, l.z, l.yaw, 0, 0); g.children.forEach(ch => B.mesh(null, ch, m)); lamps++; });
    });
    L.piers.forEach(p => pier(B, p, L, L.width));
    return lamps;
  };
  T.draw.road = function (B, road, ground, o) {
    o = o || {}; const col = C(), w = road.width == null ? 11 : road.width, pave = o.pavement == null ? 0 : o.pavement, given = (road.pts || road.path.pts).map(p => Array.isArray(p) ? { x: p[0], z: p[1] } : { x: p.x, z: p.z });
    if (given.length < 2) return;
    /* resampled every o.step metres (3), so the surface follows the ground: its craters, its relief */
    const step = o.step == null ? 3 : o.step, pts = [], rd = road.yAt ? road : null, shift = road.pts ? (road.shift || o.shift) : null;   /* a road record's path already carries its shift */
    for (let i = 0; i + 1 < given.length; i++) { const a = given[i], b = given[i + 1], len = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.round(len / step)); for (let k = 0; k < n; k++) pts.push({ x: a.x + (b.x - a.x) * k / n, z: a.z + (b.z - a.z) * k / n }); }
    pts.push(given[given.length - 1]);
    /* the land carried (an earthquake's slip): every point goes where the land went; the level: the road's graded alignment where it has one (its
       surface still dips into a crater carved below its formation), the ground otherwise */
    if (shift) pts.forEach(p => { const sh = shift(p.x, p.z); p.x += sh[0]; p.z += sh[1]; });
    const lev = rd ? (x, z) => rd.levelAt(x, z) : (x, z) => ground(x, z);
    const L = [], R = [], PL = [], PR = [], KL = [], KR = [], CL = [], CR = [], EL = [], ER = [], yl = 0.06, bands = Math.max(2, Math.round(w / 3)), lanesL = [], pb = Math.max(1, Math.round(pave / 1.2)), paveL = [], paveR = []; for (let b = 0; b <= bands; b++) lanesL.push([]); for (let b = 0; b <= pb; b++) { paveL.push([]); paveR.push([]); }
    pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)], yaw = Math.atan2(q.x - r.x, q.z - r.z), cx = Math.cos(yaw), sz = -Math.sin(yaw), g = (x, z) => ground(x, z);
      const at = (off, lift) => [p.x + cx * off, lev(p.x + cx * off, p.z + sz * off) + lift, p.z + sz * off];
      L.push(at(-w / 2, yl)); R.push(at(w / 2, yl)); CL.push(at(-0.1, yl + 0.02)); CR.push(at(0.1, yl + 0.02));
      for (let b = 0; b <= bands; b++) lanesL[b].push(at(-w / 2 + w * b / bands, yl));
      /* a fill: the embankment's side from the formation's edge down to the ground at 1 : 1.5 */
      if (rd) { const e = w / 2 + pave + 0.5; [-1, 1].forEach((sd, si) => { const top = at(sd * e, -0.02), gy = g(top[0], top[2]), fh = top[1] - gy; const foot = fh > 0.15 ? [top[0] + cx * sd * fh * 1.5, g(top[0] + cx * sd * fh * 1.5, top[2] + sz * sd * fh * 1.5), top[2] + sz * sd * fh * 1.5] : [top[0], top[1] - 0.05, top[2]]; (si ? ER : EL).push([top, foot]); }); }
      if (pave > 0) { PL.push(at(-w / 2 - pave, 0.22)); PR.push(at(w / 2 + pave, 0.22)); KL.push(at(-w / 2 - 0.02, 0.22)); KR.push(at(w / 2 + 0.02, 0.22)); for (let b = 0; b <= pb; b++) { paveL[b].push(at(-w / 2 - 0.02 - (pave - 0.02) * b / pb, 0.22)); paveR[b].push(at(w / 2 + 0.02 + (pave - 0.02) * b / pb, 0.22)); } } });
    for (let b = 0; b < bands; b++) B.strip('asphalt', lanesL[b], lanesL[b + 1], col.asphalt);
    if (rd && EL.length) { B.strip('rubble', EL.map(e => e[1]), EL.map(e => e[0]), col.fill, { face: [0, 1, 0] }); B.strip('rubble', ER.map(e => e[0]), ER.map(e => e[1]), col.fill, { face: [0, 1, 0] }); }
    /* the drifts: a wedge of sand from a kerb across the carriageway, its crest at the kerb, rippled along, laid on the finished surface */
    if (rd && rd.drifts) rd.drifts.forEach(dft => { const n = Math.max(2, Math.round((dft.s1 - dft.s0) / 3)), rows = 5, grid = [];
      for (let i = 0; i <= n; i++) { const s = dft.s0 + (dft.s1 - dft.s0) * i / n, p = rd.path.at(s), cx = Math.cos(p.yaw), sz = -Math.sin(p.yaw), t = i / n, fade = Math.min(1, t * 4, (1 - t) * 4), row = [];
        for (let r = 0; r <= rows; r++) { const q = r / rows, off = dft.side * (w / 2 + 0.3 - dft.reach * q), x = p.x + cx * off, z = p.z + sz * off, hgt = dft.depth * fade * (1 - q) * (1 - q) * (1 + 0.15 * Math.sin(s / 2.1)) + 0.04; row.push([x, lev(x, z) + hgt, z]); }
        grid.push(row); }
      for (let r = 0; r < rows; r++) B.strip('soil', grid.map(row => row[dft.side > 0 ? r : rows - r]), grid.map(row => row[dft.side > 0 ? r + 1 : rows - r - 1]), col.sand, { face: [0, 1, 0] }); });
    B.strip('line', CL, CR, col.lineYellow);
    [[L, -1], [R, 1]].forEach(e => { const A = e[0].map((p, i) => { const q = e[0][Math.min(e[0].length - 1, i + 1)], r = e[0][Math.max(0, i - 1)], yaw = Math.atan2(q[0] - r[0], q[2] - r[2]); return [p[0] - Math.cos(yaw) * e[1] * 0.3, p[1] + 0.02, p[2] + Math.sin(yaw) * e[1] * 0.3]; }), Bb = e[0].map((p, i) => { const q = e[0][Math.min(e[0].length - 1, i + 1)], r = e[0][Math.max(0, i - 1)], yaw = Math.atan2(q[0] - r[0], q[2] - r[2]); return [p[0] - Math.cos(yaw) * e[1] * 0.45, p[1] + 0.02, p[2] + Math.sin(yaw) * e[1] * 0.45]; }); if (e[1] < 0) B.strip('line', Bb, A, col.lineWhite); else B.strip('line', A, Bb, col.lineWhite); });
    if (pave > 0) { for (let b = 0; b < pb; b++) { B.strip('pave', paveL[b + 1], paveL[b], col.pave); B.strip('pave', paveR[b], paveR[b + 1], col.pave); } B.strip('concrete', KL, L.map(p => [p[0], p[1], p[2]]), col.concDark); B.strip('concrete', R.map(p => [p[0], p[1], p[2]]), KR, col.concDark); }
  };
  T.draw.rubble = function (list, o) {
    if (!list || !list.length) return null;
    const g = new THREE.BoxGeometry(1, 1, 1), P = g.attributes.position, seed = o && o.seed == null ? 5 : (o ? o.seed : 5);
    for (let i = 0; i < P.count; i++) { const k = (Math.round(P.getX(i) * 2 + 1) * 9 + Math.round(P.getY(i) * 2 + 1) * 3 + Math.round(P.getZ(i) * 2 + 1)); P.setXYZ(i, P.getX(i) * (0.8 + 0.4 * T.u(seed, k, 1)), P.getY(i) * (0.8 + 0.4 * T.u(seed, k, 2)), P.getZ(i) * (0.8 + 0.4 * T.u(seed, k, 3))); }
    g.computeVertexNormals();
    const M = T.mats(), im = new THREE.InstancedMesh(g, M.rubble, list.length), m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color(), col = T.COL.rubble;
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
    list.forEach((r, i) => { e.set(r.tilt * 0.6, r.yaw, r.tilt, 'YXZ'); m4.compose(p.set(r.x, r.y + r.h * 0.3, r.z), q.setFromEuler(e), s.set(r.w, r.h, r.d)); im.setMatrixAt(i, m4); const k = 0.8 + 0.4 * T.u(seed, i, 7); im.setColorAt(i, c.setRGB(col[0] * k, col[1] * k, col[2] * k)); });
    im.frustumCulled = false; im.name = (o && o.name) || 'rubble'; im.userData.host = true; im.userData.inspectLabel = 'rubble';
    return im;
  };
  T.draw.highway = function (H, o) {
    o = o || {}; const B = T.builder(); let lamps = T.draw.line(B, H, o);
    H.ramps.forEach(R => { lamps += T.draw.line(B, R, o); T.draw.road(B, R.road, H.path.ground, { pavement: 0 }); });
    const G = B.finish('highway ' + H.id), rub = [].concat(H.rubble, ...H.ramps.map(R => R.rubble)), im = T.draw.rubble(rub, { seed: H.seed, name: 'highway ' + H.id + '.rubble' });
    if (im) { G.add(im); G.userData.tris += 12 * rub.length; }
    G.userData.spans = H.spans.length; G.userData.piers = H.piers.length; G.userData.lamps = lamps; G.userData.rubble = rub.length; G.userData.id = H.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
})();
