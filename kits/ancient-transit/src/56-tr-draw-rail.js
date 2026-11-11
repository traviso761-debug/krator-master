// ================================================================= ANCIENT TRANSIT — drawing the train lines and the trains  [draw]
// KTRANSIT.rail's records as meshes. At grade: the ballast bed on its fill (one swept body a bed segment), the sleepers (one instanced
// mesh, burnt ones dark, gone ones missing), the rails in sections (steel while intact, rust and bowed when bent, missing when gone), the
// level crossings (an asphalt panel between the rails, gate posts with arms up, down or broken, warning lights), signals and catenary masts
// with the wire between standing neighbours. Elevated: the guideway (a slab with parapets and rail plinths) on its piers, the stations
// (platforms, glass screens, columns, a canopy, stair towers), each in its ruin state. The trains: a car at a time in its own frame, laid
// where its record says (standing, derailed, overturned, fallen), burnt ones sooted.
//
//   KTRANSIT.draw.rail(R, o) -> Group       o.shadow; userData: {tris, ties, rails, crossings, stations}
//   KTRANSIT.draw.train(Tn, o) -> Group     userData: {tris, cars}
(function () {
  const T = KTRANSIT, C = () => T.COL, RAIL_PROF = [[-0.07, 0], [0.07, 0], [0.04, 0.05], [0.045, 0.16], [-0.045, 0.16], [-0.04, 0.05]].reverse();   /* foot, web, head: six points (ten cost a third more and read the same at 2 m) */
  const jersey = (x, h, t) => [[x - t, 0], [x + t, 0], [x + t, h], [x - t, h]].reverse();
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k], scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  /* frames along a line from s0 to s1 every `step`, at the deck height plus `up` */
  function frames(R, s0, s1, step, up, offFn) {
    const out = [], n = Math.max(1, Math.round((s1 - s0) / step));
    for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n, p = R.path.at(s), y = R.deckAt(s), s2 = Math.min(R.L, s + 2), p2 = R.path.at(s2), pitch = s2 > s ? Math.atan2(R.deckAt(s2) - y, 2) : 0, off = offFn ? offFn(s, i / n) : 0;
      out.push(T.frame(p.x + Math.cos(p.yaw) * off, y + up, p.z - Math.sin(p.yaw) * off, p.yaw, pitch, 0)); }
    return out;
  }
  function post(B, x, y, z, yaw, h, r, col, lean, fallen) {
    const m = fallen ? T.frame(x, y + 0.12, z, yaw, 0, 0).multiply(T.frame(0, 0, 0, 0, 0, Math.PI / 2 * 0.97)) : T.frame(x, y, z, yaw, lean ? lean : 0, lean ? lean * 0.4 : 0);
    B.box(fallen || lean ? 'rust' : 'steel', m, r * 2, h, r * 2, col); return m;
  }
  function signal(B, S, R) {
    const col = C(), lean = S.state === 'bent' ? 0.25 : 0, m = post(B, S.x, S.y, S.z, S.yaw, 4.6, 0.09, col.steelDark, lean, S.state === 'fallen');
    const P = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(m);
    B.box(S.state === 'intact' ? 'paint' : 'rust', m.clone().multiply(T.frame(0, 3.5, -0.2, 0, 0, 0)), 0.5, 1.1, 0.3, col.paintDark);
    [[4.3, col.red], [3.8, col.green]].forEach(e => { const v = P(0, e[0], 0.0); B.box(S.state === 'intact' ? 'glow' : 'glass', m.clone().multiply(T.frame(0, e[0] - 0.14, -0.04, 0, 0, 0)), 0.26, 0.26, 0.1, S.state === 'intact' ? e[1] : col.glassDark); void v; });
    void R;
  }
  function mast(B, M, R, next) {
    const col = C(), bent = M.state === 'bent', fallen = M.state === 'fallen', lean = bent ? -0.3 * M.side : 0, m = post(B, M.x, M.y, M.z, M.yaw, 7.2, 0.14, col.steelDark, lean, fallen);
    const reach = R.width / 2 + 0.6; B.box(fallen ? 'rust' : 'steel', m.clone().multiply(T.frame(0, 6.6, 0, 0, 0, 0)).multiply(T.frame(0, 0, 0, M.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0)), 0.12, 0.12, reach, col.steelDark);
    if (!fallen && next && next.state !== 'fallen') { const a = new THREE.Vector3(-M.side * reach, 6.4, 0).applyMatrix4(m), nm = T.frame(next.x, next.y, next.z, next.yaw, 0, 0), b = new THREE.Vector3(-next.side * (R.width / 2 + 0.6), 6.4 + (next.state === 'bent' ? -0.6 : 0), 0).applyMatrix4(nm);
      const mid = mix([a.x, a.y, a.z], [b.x, b.y, b.z], 0.5); mid[1] -= 0.5; B.cyl('rust', [a.x, a.y, a.z], mid, 0.02, col.cable, 4, { caps: false }); B.cyl('rust', mid, [b.x, b.y, b.z], 0.02, col.cable, 4, { caps: false }); }
  }
  function crossing(B, X, R) {
    const col = C(), m = T.frame(X.x, X.y, X.z, X.streetYaw, 0, 0);
    B.box('asphalt', m.clone().multiply(T.frame(0, 0.0, 0, 0, 0, 0)), X.width, 0.2, R.width + 1.6, X.state === 'intact' ? col.asphalt : col.asphaltOld);
    [-1, 1].forEach(s => B.box('concrete', m.clone().multiply(T.frame(0, 0.0, s * (R.width / 2 + 0.95), 0, 0, 0)), X.width, 0.26, 0.3, col.concDark));
    X.gates.forEach((g, i) => {
      const gm = T.frame(g.x, R.path.ground(g.x, g.z), g.z, g.yaw, 0, 0), bad = X.state !== 'intact' && i === 0;
      B.box(bad ? 'rust' : 'steel', gm, 0.5, 1.3, 0.5, col.paintDark); B.box('paint', gm.clone().multiply(T.frame(0, 1.3, 0, 0, 0, 0)), 0.3, 0.9, 0.3, col.paintSafety);
      const armL = X.width / 2 - 1.5, arm = g.arm === 'down' ? T.frame(0, 1.2, 0, g.side > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0) : g.arm === 'up' ? T.frame(0, 1.2, 0, 0, Math.PI / 2 * 0.95, 0) : T.frame(0.6 * g.side, 0.1, 0.4, g.side > 0 ? Math.PI / 2 : -Math.PI / 2, 0.08, 0.3);
      B.box(g.arm === 'broken' ? 'rust' : 'paint', gm.clone().multiply(arm).multiply(T.frame(0, 0, armL / 2, 0, 0, 0)), 0.1, 0.14, armL, col.paintSafety, { centred: true });
      [[-0.3, col.red], [0.3, col.red]].forEach(e => B.box(X.state === 'intact' ? 'glow' : 'glass', gm.clone().multiply(T.frame(e[0], 1.9, 0.18, 0, 0, 0)), 0.22, 0.22, 0.08, X.state === 'intact' ? e[1] : col.glassDark));
    });
  }
  function station(B, S, R) {
    /* the platforms stand PL above the guideway's top: a coach's floor height, so a passenger steps across */
    const col = C(), w = R.width, pw = 3.5, PL = 1.0, step = 10, fr = frames(R, S.s0, S.s1, step, 0), ruined = S.state !== 'intact', down = S.state === 'collapsed';
    S.platforms.forEach(P => { const s = P.side, a = s * (w / 2 + 0.1), b = s * (w / 2 + pw);
      const lo = Math.min(a, b), hi = Math.max(a, b);
      B.sweep('concrete', [[lo, PL], [hi, PL], [hi, -1.1], [lo, -1.1]], fr, col.concrete, { u0: S.s0, caps: true });
      B.sweep('pave', [[lo, PL + 0.05], [hi, PL + 0.05], [hi, PL + 0.02], [lo, PL + 0.02]], fr, col.pave, { u0: S.s0, caps: true });
      if (!ruined) B.sweep('glass', [[b - 0.02, PL + 0.05], [b + 0.02, PL + 0.05], [b + 0.02, PL + 2.1], [b - 0.02, PL + 2.1]].reverse(), fr, col.glass, { u0: S.s0 });
      fr.forEach((m, i) => { if (down && i % 2) return; B.box(ruined ? 'rust' : 'steel', m.clone().multiply(T.frame(s * (w / 2 + pw - 0.4), PL + 0.05, 0, 0, 0, 0)), 0.35, S.canopy.h - PL - 0.05, 0.35, col.steelDark); }); });
    /* the canopy: whole, half (ruined), or down on the platforms, tilted (collapsed) */
    const cw = S.canopy.w, h = S.canopy.h, prof = [[-cw / 2, h], [cw / 2, h], [cw / 2, h - 0.3], [-cw / 2, h - 0.3]];
    if (!down) { const f2 = ruined ? fr.slice(0, Math.ceil(fr.length / 2)) : fr; B.sweep('white', prof, f2, col.white, { u0: S.s0, caps: true }); if (!ruined) { B.sweep('glass', [[-1.2, h + 0.33], [1.2, h + 0.33], [1.2, h + 0.3], [-1.2, h + 0.3]], fr, col.glass, { u0: S.s0 }); } }
    else { const a = fr[Math.floor(fr.length * 0.3)].clone().multiply(T.frame(0, -h + 1.0, 0, 0, 0, 0.22)), b = fr[Math.floor(fr.length * 0.7)].clone().multiply(T.frame(2.0, -h + 0.3, 0, 0.2, 0, 0.18)); B.sweep('white', prof, [a, b], col.white, { u0: S.s0, caps: true }); }
    /* the stair towers and their bridges to the platform */
    S.stairs.forEach(st => { const tm = T.frame(st.x, st.yG, st.z, st.yaw, 0, 0), th = st.y + PL - st.yG, dead = st.state === 'collapsed';
      B.box('concrete', tm, 5, dead ? Math.min(th, 2.2) : th + 0.6, 5, col.concrete);
      if (!dead) { B.box('concrete', tm.clone().multiply(T.frame(-st.side * 3.6, th - 0.5, 0, 0, 0, 0)), 2.6, 0.5, 3, col.concrete); B.box('pave', tm.clone().multiply(T.frame(-st.side * 3.6, th, 0, 0, 0, 0)), 2.4, 0.06, 2.8, col.pave); B.box('white', tm.clone().multiply(T.frame(0, th + 0.6, 0, 0, 0, 0)), 5.4, 0.25, 5.4, col.white);
        for (let k = 0; k < 4; k++) B.box(st.state === 'intact' ? 'glass' : 'concrete', tm.clone().multiply(T.frame(0, 1.5 + k * (th - 2.5) / 4, 2.5, 0, 0, 0)), 3.6, 0.9, 0.04, st.state === 'intact' ? col.glass : col.concDark); }
      else B.box('concrete', tm.clone().multiply(T.frame(1.8 * st.side, 2.1, 1.2, 0.4, 0, 0.5)), 4.6, 0.6, 4.2, col.concrete); });
  }
  T.draw.rail = function (R, o) {
    o = o || {}; const B = T.builder(), col = C(), down = S => !S || S.state === 'collapsed' || S.state === 'gone';
    if (R.elevated) {
      const w = R.width, deck = R.deck == null ? 1.0 : R.deck, prof = [[-w / 2, 0], [w / 2, 0], [w / 2, -deck], [-w / 2, -deck]];
      R.spans.forEach((S, i) => {
        if (S.state === 'gone') return;
        let M = T.frame(S.x0, S.y0, S.z0, S.yaw, S.pitch, S.roll == null ? 0 : S.roll);
        if (S.state === 'collapsed') { const F = S.fall; M = T.frame(F.x, F.y + 0.3 + deck * 0.5 * Math.abs(Math.sin(F.roll)), F.z, F.yaw, F.pitch, F.roll).multiply(T.frame(0, 0, -S.len / 2, 0, 0, 0)); }
        const f = [M, M.clone().multiply(T.frame(0, 0, S.len, 0, 0, 0))];
        B.sweep('concrete', prof, f, col.concrete, { u0: S.s0, caps: S.state === 'collapsed' || down(R.spans[i - 1]) || down(R.spans[i + 1]) });
        B.sweep('pave', [[-w / 2 + 0.35, 0.04], [w / 2 - 0.35, 0.04], [w / 2 - 0.35, 0.02], [-w / 2 + 0.35, 0.02]], f, col.pave, { u0: S.s0 });
        [[-1, 0], [1, 1]].forEach(e => { if (!S.barriers[e[1]]) return; B.sweep('concrete', jersey(e[0] * (w / 2 - 0.18), 0.7, 0.16), f, col.concDark, { u0: S.s0, caps: true }); });
        [-1, 1].forEach(s => B.sweep('concrete', jersey(s * R.gauge / 2, 0.2, 0.3), f, col.concDark, { u0: S.s0 }));
        T.draw.growth(B, S, M, R, o);
      });
      R.piers.forEach(p => { if (p.state === 'fill' || p.state === 'none') return; const colH = (p.state === 'stub' ? p.stub : p.h - 0.8) + 0.5;
        const pm = T.frame(p.x, p.yG - 0.5, p.z, p.yaw, 0, p.roll == null ? 0 : p.roll); B.box('concrete', pm, 1.7, colH, 1.7, col.concrete, { noBottom: true });
        if (p.state === 'stub') { for (let k = 0; k < 3; k++) B.cyl('rust', [p.x + 0.4 * (k - 1), p.yG + p.stub - 0.2, p.z], [p.x + 0.5 * (k - 1), p.yG + p.stub + 0.9 + 0.3 * k, p.z + 0.2 * (k - 1)], 0.02, col.rust, 5); return; }
        B.box('concrete', pm.clone().multiply(T.frame(0, p.yTop - 0.8 - (p.yG - 0.5), 0, 0, 0, 0)), w * 0.9, 0.8, 1.9, col.concrete); });
      R.stations.forEach(S => station(B, S, R));
    } else {
      R.beds.forEach(bd => { if (bd.state === 'cut') return; const w = R.width, g0 = R.path.ground(bd.x0, bd.z0), g1 = R.path.ground(bd.x1, bd.z1), f = [T.frame(bd.x0, bd.y0, bd.z0, bd.yaw, Math.atan2(bd.y1 - bd.y0, bd.len), 0)]; f.push(f[0].clone().multiply(T.frame(0, 0, bd.len, 0, 0, 0)));
        B.sweep('ballast', k => { const h = Math.max(0.45, (k ? bd.y1 - g1 : bd.y0 - g0) + 0.35); return [[-w / 2 - 1.4 * h, -h], [-w / 2, 0], [w / 2, 0], [w / 2 + 1.4 * h, -h]]; }, f, col.ballast, { u0: bd.s0, open: true }); });
      R.crossings.forEach(X => crossing(B, X, R));
    }
    /* the rails: both, each section its own sweep; a bent section bows one rail out by its bend */
    R.rails.forEach(sec => { if (sec.state === 'gone') return; const bent = sec.state === 'bent';
      [-1, 1].forEach((s, k) => { const f = frames(R, sec.s0, sec.s1, 6, R.elevated ? 0.2 : 0.16, (q, t) => s * R.gauge / 2 + (bent && k === 0 ? sec.bend * Math.sin(Math.PI * t) : 0));
        B.sweep(bent ? 'rust' : 'steel', RAIL_PROF, f, bent ? col.rust : col.steel, { u0: sec.s0, caps: true }); }); });
    /* the sleepers */
    /* a sleeper: its top and its two long sides (six triangles; a box's ends and bottom are in the ballast) */
    let tieN = 0; const tieG = (() => { const hw = 1.3, hh = 0.07, hd = 0.13, P = [], Nn = [], U = [], q = (a, b, c, d, nx, ny, nz) => { [a, b, c, a, c, d].forEach(v => { P.push(v[0], v[1], v[2]); Nn.push(nx, ny, nz); U.push(v[0], v[2] + v[1]); }); };
      q([-hw, hh, -hd], [-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], 0, 1, 0); q([-hw, -hh, hd], [-hw, hh, hd], [hw, hh, hd], [hw, -hh, hd], 0, 0, 1); q([hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd], [-hw, -hh, -hd], 0, 0, -1);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); return g; })(), live = R.ties.filter(t => t[1] !== 1);
    if (live.length) { const im = new THREE.InstancedMesh(tieG, T.mats().concrete, live.length), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), c3 = new THREE.Color(); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(live.length * 3), 3);
      live.forEach((t, i) => { const p = R.path.at(t[0]), y = R.deckAt(t[0]) + (R.elevated ? 0.1 : 0.08); e.set(0, p.yaw, 0, 'YXZ'); m4.compose(p3.set(p.x, y, p.z), q4.setFromEuler(e), s3); im.setMatrixAt(i, m4); const cc = t[1] === 2 ? col.soot : col.concDark, k = 0.85 + 0.3 * T.u(R.seed, i, 77); im.setColorAt(i, c3.setRGB(cc[0] * k, cc[1] * k, cc[2] * k)); });
      im.frustumCulled = false; im.name = 'rail ' + R.id + '.ties'; im.userData.host = true; im.userData.inspectLabel = 'sleepers'; B.ties = im; tieN = live.length; }
    R.signals.forEach(S => signal(B, S, R));
    R.catenary.forEach((M, i) => mast(B, M, R, R.catenary[i + 1]));
    const G = B.finish('rail ' + R.id); if (B.ties) { G.add(B.ties); G.userData.tris += tieN * 6; }
    const im = T.draw.rubble(R.rubble, { seed: R.seed, name: 'rail ' + R.id + '.rubble' }); if (im) { G.add(im); G.userData.tris += 12 * R.rubble.length; }
    G.userData.ties = tieN; G.userData.rails = R.rails.filter(r => r.state !== 'gone').length; G.userData.crossings = R.crossings.length; G.userData.stations = R.stations.length; G.userData.id = R.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
  /* ---- the trains: one car in its own frame (origin at rail level under the car's middle, +z forward), then its record's matrix */
  function car(B, c, gauge, trainState) {
    /* every car a thousand years rusted; a wrecked train's cars rusted through, the standing ones a little less (the owner, 2026-11-08: more wrecked) */
    const col = C(), ruined = c.state !== 'ok', wreck = trainState !== 'standing', soot = c.burnt ? 0.2 : (ruined ? 0.75 : 0.9), tint = (a) => { let v = mix(a, col.rust, ruined ? 0.68 : wreck ? 0.45 : 0.32); return scale(v, soot); };
    const M = T.frame(c.x, c.y, c.z, c.yaw, c.pitch, c.roll), at = (x, y, z, yaw) => M.clone().multiply(T.frame(x, y, z, yaw == null ? 0 : yaw, 0, 0)), metal = ruined || wreck ? 'rust' : 'steel', paint = c.burnt || ruined ? 'rust' : 'paint', glassOk = c.state === 'ok' && !wreck;
    const L = c.len, W = c.w, half = L / 2;
    /* two bogies, four wheels each, the underframe */
    [-half + 2.6, half - 2.6].forEach(z => { B.box(metal, at(0, 0.35, z), 2.4, 0.5, 2.2, tint(col.steelDark)); [-0.85, 0.85].forEach(dz => [-1, 1].forEach(s => { const a = new THREE.Vector3(s * gauge / 2 - 0.08, 0.48, z + dz).applyMatrix4(M), b = new THREE.Vector3(s * gauge / 2 + 0.08, 0.48, z + dz).applyMatrix4(M); B.cyl(metal, [a.x, a.y, a.z], [b.x, b.y, b.z], 0.46, tint(col.steelDark), 10); })); });
    B.box(metal, at(0, 0.85, 0), W, 0.3, L - 0.3, tint(col.steelDark));
    [-1, 1].forEach(s => B.box(metal, at(0, 0.95, s * (half + 0.35)), 0.3, 0.3, 0.7, tint(col.steelDark)));
    if (c.kind === 'loco') {
      B.box(paint, at(0, 1.15, -L * 0.12), W, 2.5, L * 0.72, tint(col.paintTeal)); B.box(paint, at(0, 1.15, L * 0.3), W, 2.8, L * 0.26, tint(col.paintTeal));
      B.box('glass', at(0, 2.5, L * 0.3 + 0.02), W - 0.4, 0.9, L * 0.26 + 0.1, glassOk ? col.glass : col.glassDark);
      B.box(paint, at(0, 3.65, -L * 0.12), W - 0.5, 0.35, L * 0.6, tint(col.paintDark));
      B.box(glassOk ? 'glow' : 'glass', at(0, 1.4, half - 0.05), W - 0.3, 0.1, 0.12, glassOk ? col.cyan : col.glassDark);
      [[-0.5, 1], [0.5, 1]].forEach(e => B.box(glassOk ? 'glow' : 'glass', at(e[0], 1.9, half + 0.02), 0.3, 0.3, 0.1, glassOk ? col.glassDark : col.glassDark));
      if (!c.burnt) { const a = new THREE.Vector3(0, 3.95, -L * 0.12).applyMatrix4(M), b = new THREE.Vector3(0, 4.7, -L * 0.12 - 0.9).applyMatrix4(M); B.cyl(metal, [a.x, a.y, a.z], [b.x, b.y, b.z], 0.04, tint(col.steelDark), 6); B.box(metal, at(0, 4.6, -L * 0.12 - 0.9), 1.6, 0.08, 0.3, tint(col.steelDark)); }
    } else if (c.kind === 'box') {
      B.box(c.burnt ? 'rust' : 'corrugated', at(0, 1.15, 0), W, 2.5, L - 0.6, tint(col.corrugated)); B.box(paint, at(0, 3.65, 0), W - 0.3, 0.25, L - 0.8, tint(col.paintGrey));
      [-1, 1].forEach(s => B.box(paint, at(s * (W / 2), 1.4, 0), 0.06, 2.0, 2.2, tint(col.paintDark)));
    } else if (c.kind === 'tank') {
      [-1, 1].forEach(s => B.box(metal, at(0, 1.15, s * (half - 3)), W - 0.6, 0.8, 1.2, tint(col.steelDark)));
      const a = new THREE.Vector3(0, 2.3, -half + 0.9).applyMatrix4(M), b = new THREE.Vector3(0, 2.3, half - 0.9).applyMatrix4(M); B.cyl(paint, [a.x, a.y, a.z], [b.x, b.y, b.z], 1.3, tint(col.tank), 16);
      B.box(metal, at(0, 3.55, 0), 1.0, 0.1, L - 4, tint(col.steelDark)); const d0 = new THREE.Vector3(0, 3.4, 0).applyMatrix4(M), d1 = new THREE.Vector3(0, 3.95, 0).applyMatrix4(M); B.cyl(metal, [d0.x, d0.y, d0.z], [d1.x, d1.y, d1.z], 0.35, tint(col.steelDark), 10);
    } else if (c.kind === 'flat') {
      B.box(paint, at(0, 1.15, 0), W, 0.3, L - 0.4, tint(col.paintDark));
      if (c.load === 'containers') { const cl = (L - 1.2) / 2; [-1, 1].forEach((s, i) => B.box(c.burnt ? 'rust' : 'corrugated', at(0, 1.45, s * (cl / 2 + 0.2)), W - 0.5, 2.6, cl - 0.2, tint(i ? col.paintTeal : col.paintSafety))); }
      else if (c.load === 'slabs') for (let k = 0; k < 3; k++) B.box('concrete', at((k - 1) * 0.15, 1.45 + k * 0.45, 0), W - 0.6 - k * 0.2, 0.45, L * 0.6, scale(col.concrete, soot));
    } else {
      B.box(c.burnt ? 'rust' : 'white', at(0, 1.15, 0), W, 2.4, L - 0.8, tint(col.coach)); B.box(paint, at(0, 3.55, 0), W - 0.4, 0.3, L - 1.2, tint(col.paintGrey));
      [-1, 1].forEach(s => { B.box('glass', at(s * (W / 2), 2.25, 0), 0.06, 0.95, L - 2.4, glassOk ? col.glass : col.glassDark); [-1, 1].forEach(e => B.box(paint, at(s * (W / 2), 1.25, e * (half - 1.4)), 0.05, 2.1, 1.3, tint(col.paintDark))); });
      B.box(glassOk ? 'glow' : 'glass', at(0, 1.3, 0), W + 0.02, 0.08, L - 1.0, glassOk ? col.cyan : col.glassDark);
    }
  }
  T.draw.train = function (Tn, o) {
    o = o || {}; const B = T.builder(), gauge = o.gauge == null ? 1.6 : o.gauge;
    Tn.cars.forEach(c => car(B, c, gauge, Tn.state));
    const G = B.finish('train ' + Tn.id); G.userData.cars = Tn.cars.length; G.userData.id = Tn.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
})();
