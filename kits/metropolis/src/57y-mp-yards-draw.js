// ================================================================= METROPOLIS — the yards' pieces: drawn  [draw]
// MP.yardsDraw(records, o) -> Group: the records of 46f-mp-yards.js (tank farms, pipe racks, dish arrays, chimneys, conveyors, turntables,
// loading gantries, toxic pools) drawn into ONE builder, merged by material family and chunked, so a district of them costs a few draw calls a
// chunk, not one a piece. The builder is the transit kit's (o.kt = KTRANSIT: its `builder()`, `frame()` and library families: rust, steel,
// concrete, corrugated, white, paint), handed in by the host, so this kit needs nothing of it on its own sheet. A builder draws a record; it
// decides nothing: every position, height and ruin is the record's. o.chunk (metres, 0 none) is the finish's chunk; o.finish false returns the
// builder unfinished (a host that adds its own parts to it). Colours are the Ancients' work palette weathered: rust browns, a faded white,
// soot on what burnt.
MP.yardsDraw = function (recs, o) {
  const KT = o.kt, B = o.builder || KT.builder(), FR = (x, y, z, yaw, pitch, roll) => KT.frame(x, y, z, -(yaw || 0), pitch || 0, roll || 0);
  const RUST = [.48, .32, .22], RUST2 = [.38, .27, .2], STEEL = [.42, .4, .38], SOOT = [.1, .09, .08], CONC = [.62, .6, .56], WHITE = [.78, .76, .7], DARK = [.05, .05, .06];
  const tint = (c, k) => [c[0] * k, c[1] * k, c[2] * k], mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const tmp = new THREE.Mesh(new THREE.BufferGeometry());
  const geo = (g, fam, m, col) => { tmp.geometry = g; B.mesh(fam, tmp, m, { col }); };
  const GEO = {};
  const cone = (r, h) => GEO['c' + r + ',' + h] || (GEO['c' + r + ',' + h] = new THREE.ConeGeometry(r, h, 18, 1, true).translate(0, h / 2, 0));
  const frust = (r0, r1, h, seg) => new THREE.CylinderGeometry(r1, r0, h, seg || 18, 1, true).translate(0, h / 2, 0);
  const dish = r => GEO['d' + r] || (GEO['d' + r] = (() => { const P = []; for (let i = 0; i <= 6; i++) { const t = i / 6, rr = r * t; P.push(new THREE.Vector2(Math.max(.01, rr), rr * rr / (4 * r * .45))); } const g = new THREE.LatheGeometry(P, 20); return g; })());
  const disc = (fam, x, y, z, rx, rz, yaw, col, n) => { const N = n || 18, c = Math.cos(yaw), s = Math.sin(yaw), P = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, u = Math.cos(a) * rx, v = Math.sin(a) * rz; P.push([x + u * c - v * s, y, z + u * s + v * c]); }
    for (let i = 0; i < N; i++) B.tri(fam, [x, y, z], P[i], P[(i + 1) % N], col, { face: [0, 1, 0] }); };
  const n = { tanks: 0, bents: 0, dishes: 0, chimneys: 0, conveyors: 0, turntables: 0, gantries: 0, pools: 0 };
  recs.forEach(R => {
    if (R.kind === 'tankfarm') {
      const c = R.bund.corners, h = R.bund.h, t = R.bund.t;
      for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]), yw = Math.atan2(b[1] - a[1], b[0] - a[0]); B.box('concrete', FR((a[0] + b[0]) / 2, R.y - .5, (a[1] + b[1]) / 2, yw), l + t, h + .5, t, tint(CONC, .8)); }
      R.tanks.forEach(T => {
        n.tanks++; const col = T.state === 'burnt' ? mixc(RUST2, SOOT, .7) : (T.u + T.v) % 2 ? RUST : mixc(RUST, WHITE, .35);
        B.cyl('concrete', [T.x, T.y - .6, T.z], [T.x, T.y + .4, T.z], T.r + .8, CONC, 20);
        if (T.state === 'gone') return;
        if (T.form === 'sphere') {
          /* a sphere on a ring of eight legs, its equator at 1.15 r, a stair to its crown and a railed platform there */
          const cy = T.y + T.r * 1.15; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B.cyl('steel', [T.x + Math.cos(a) * T.r * .92, T.y, T.z + Math.sin(a) * T.r * .92], [T.x + Math.cos(a) * T.r * .98, cy, T.z + Math.sin(a) * T.r * .98], .45, STEEL, 6); }
          geo(GEO.sph || (GEO.sph = new THREE.SphereGeometry(1, 22, 14)), 'rust', new THREE.Matrix4().compose(new THREE.Vector3(T.x, cy, T.z), new THREE.Quaternion(), new THREE.Vector3(T.r, T.r, T.r)), col);
          B.cyl('steel', [T.x, cy + T.r - .2, T.z], [T.x, cy + T.r + .4, T.z], T.r * .25, STEEL, 12);
          if (T.state === 'holed') { const ca = Math.cos(T.breach), sa = Math.sin(T.breach); B.box('paint', FR(T.x + ca * T.r * .98, cy - T.r * .3, T.z + sa * T.r * .98, T.breach + Math.PI / 2), T.r * .5, T.r * .4, .6, DARK); }
          return;
        }
        const hh = T.state === 'collapsed' ? T.h * .32 : T.h;
        geo(frust(T.r, T.state === 'collapsed' ? T.r * 1.05 : T.r, hh, 20), 'rust', FR(T.x, T.y + .4, T.z, 0), col);
        if (T.state === 'collapsed') { geo(cone(T.r * 1.02, T.r * .25), 'rust', FR(T.x, T.y + hh * .6, T.z, T.breach, .35, .2), tint(col, .8)); return; }
        if (T.roof === 'cone') geo(cone(T.r * 1.02, T.r * .22), 'rust', FR(T.x, T.y + .4 + hh, T.z, 0), tint(col, .9));
        else if (T.roof === 'dome') B.dome('rust', FR(T.x, T.y + .4 + hh, T.z, 0), T.r, T.r * .3, tint(col, .95), 16);
        else B.cyl('steel', [T.x, T.y + hh - 1.6, T.z], [T.x, T.y + hh - 1.1, T.z], T.r * .97, STEEL, 20);
        if (T.state === 'holed') { const ca = Math.cos(T.breach), sa = Math.sin(T.breach); B.box('paint', FR(T.x + ca * T.r, T.y + 1, T.z + sa * T.r, T.breach + Math.PI / 2), T.r * .5, T.r * .45, .6, DARK); }
        /* a stair round the shell and a stub to the manifold */
        B.box('steel', FR(T.x + T.r + .6, T.y, T.z, 0), .8, hh * .9, 1.2, STEEL);
      });
      const m = R.manifold; B.cyl('steel', [m[0][0], R.y + 1.2, m[0][1]], [m[1][0], R.y + 1.2, m[1][1]], .55, RUST2, 8);
      return;
    }
    if (R.kind === 'piperack') {
      const bt = R.bents, top = B2 => B2.y + R.h;
      bt.forEach(Bn => {
        n.bents++; const c = Math.cos(Bn.yaw), s = Math.sin(Bn.yaw), lx = -s * 3, lz = c * 3;
        if (Bn.state === 'down') { B.box('steel', FR(Bn.x + lx * .3, Bn.y + .3, Bn.z + lz * .3, Bn.yaw + .4, 0, Math.PI / 2 - .05), .5, R.h, .5, tint(STEEL, .8)); return; }
        [-1, 1].forEach(k => B.box('steel', FR(Bn.x + lx * k, Bn.y, Bn.z + lz * k, Bn.yaw), .5, R.h + (R.tiers === 2 ? 3 : 0), .5, STEEL));
        B.box('steel', FR(Bn.x, top(Bn) - .6, Bn.z, Bn.yaw + Math.PI / 2), 6.8, .6, .6, STEEL);
        if (R.tiers === 2) B.box('steel', FR(Bn.x, top(Bn) + 2.4, Bn.z, Bn.yaw + Math.PI / 2), 6.8, .6, .6, STEEL);
      });
      for (let i = 0; i + 1 < bt.length; i++) {
        const a = bt[i], b = bt[i + 1], down = a.state === 'down' || b.state === 'down', c = Math.cos(a.yaw), s = Math.sin(a.yaw);
        R.pipes.forEach(P => {
          const ox = -s * P.off, oz = c * P.off, ya = top(a) + P.r + P.tier * 3, yb = top(b) + P.r + P.tier * 3, col = P.tier ? RUST2 : RUST;
          if (!down) { B.cyl('rust', [a.x + ox, ya, a.z + oz], [b.x + ox, yb, b.z + oz], P.r, col, 8); return; }
          const mx = (a.x + b.x) / 2 + ox, mz = (a.z + b.z) / 2 + oz, my = Math.min(a.y, b.y) + P.r + .3;
          B.cyl('rust', [a.x + ox, a.state === 'down' ? a.y + P.r : ya, a.z + oz], [mx, my, mz], P.r, col, 8); B.cyl('rust', [mx, my, mz], [b.x + ox, b.state === 'down' ? b.y + P.r : yb, b.z + oz], P.r, col, 8);
        });
      }
      return;
    }
    if (R.kind === 'disharray') {
      R.dishes.forEach(D => {
        n.dishes++; const ped = D.mount; B.cyl('concrete', [D.x, D.y - .5, D.z], [D.x, D.y + ped, D.z], D.r * .14, CONC, 12);
        B.box('steel', FR(D.x, D.y + ped, D.z, D.az), D.r * .5, D.r * .3, D.r * .35, STEEL);
        let x = D.x, y = D.y + ped + D.r * .25, z = D.z, el = D.el, roll = 0;
        if (D.state === 'slumped') el = -.35; else if (D.state === 'fallen') { x += Math.cos(D.spin) * D.r * 1.2; z += Math.sin(D.spin) * D.r * 1.2; y = D.y + D.r * .3; el = -1.25; roll = .3; }
        /* the dish's axis is local +y (the lathe's), tipped from the zenith toward its azimuth by the elevation's complement */
        const m = new THREE.Matrix4().makeRotationY(-D.az).multiply(new THREE.Matrix4().makeRotationZ(-(Math.PI / 2 - el))).multiply(new THREE.Matrix4().makeRotationX(roll)), M = new THREE.Matrix4().makeTranslation(x, y, z).multiply(m);
        geo(dish(Math.round(D.r)), 'white', M, D.state === 'aimed' ? WHITE : tint(WHITE, .8));
        const f = new THREE.Vector3(0, Math.round(D.r) * .9, 0).applyMatrix4(M); B.cyl('steel', [x, y, z], [f.x, f.y, f.z], .25, STEEL, 6);
      });
      return;
    }
    if (R.kind === 'chimney') {
      n.chimneys++; const k = R.top / R.h, rt = R.r0 + (R.r1 - R.r0) * k, m = FR(R.x, R.y - 1, R.z, R.leanDir, R.lean * Math.PI / 180, 0);
      geo(frust(R.r0, rt, R.top + 1, 20), 'concrete', m, mixc(CONC, SOOT, .25));
      R.bands.forEach(b => { const rb = R.r0 + (R.r1 - R.r0) * b / R.h + .25; geo(frust(rb, rb, 1.4, 20), 'paint', new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeTranslation(0, b + 1, 0)), (b / 12) % 2 ? [.55, .14, .1] : WHITE); });
      geo(frust(rt * 1.02, rt * 1.02, Math.min(8, R.top * .1), 20), 'paint', new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeTranslation(0, R.top + 1 - Math.min(8, R.top * .1), 0)), SOOT);
      return;
    }
    if (R.kind === 'conveyor') {
      n.conveyors++; const a = R.a, b = R.b, N = R.sections;
      for (let i = 0; i < N; i++) {
        const t0 = i / N, t1 = (i + 1) / N, p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1];
        const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]), pitch = Math.atan2(p1[1] - p0[1], Math.hypot(p1[0] - p0[0], p1[2] - p0[2]));
        if (i === R.down) { const mx = (p0[0] + p1[0]) / 2, mz = (p0[2] + p1[2]) / 2, g = R.trestles.length ? Math.min.apply(null, R.trestles.map(T => T.y)) : Math.min(a[1], b[1]); B.box('corrugated', FR(mx, g + .2, mz, R.yaw, .25, .3), L, R.gh, R.w, tint(RUST2, .85)); continue; }
        B.box('corrugated', FR((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - R.gh / 2, (p0[2] + p1[2]) / 2, R.yaw, pitch), L + .2, R.gh, R.w, mixc(RUST, WHITE, .2));
      }
      R.trestles.forEach(T => { const c = Math.cos(R.yaw), s = Math.sin(R.yaw), h = Math.max(1, T.top - T.y); [-1, 1].forEach(k => B.box('steel', FR(T.x - s * 2 * k, T.y, T.z + c * 2 * k, R.yaw), .5, h, .5, STEEL)); B.box('steel', FR(T.x, T.top - .4, T.z, R.yaw + Math.PI / 2), 4.6, .4, .5, STEEL); });
      return;
    }
    if (R.kind === 'turntable') {
      n.turntables++; disc('paint', R.x, R.y - 1.2, R.z, R.r, R.r, 0, [.12, .11, .1], 24);
      for (let i = 0; i < 24; i++) { const a0 = i / 24 * Math.PI * 2, a1 = (i + 1) / 24 * Math.PI * 2, x0 = R.x + Math.cos(a0) * R.r, z0 = R.z + Math.sin(a0) * R.r, x1 = R.x + Math.cos(a1) * R.r, z1 = R.z + Math.sin(a1) * R.r; B.box('concrete', FR((x0 + x1) / 2, R.y - 1.3, (z0 + z1) / 2, (a0 + a1) / 2 + Math.PI / 2), Math.hypot(x1 - x0, z1 - z0) + .1, 1.6, .8, CONC); }
      B.box('steel', FR(R.x, R.y - .5 + (R.off ? -.4 : 0), R.z, R.bridge, 0, R.off ? .06 : 0), R.r * 2 - .4, 1.4, 4.2, RUST2);
      const S = R.shed; R.stalls.forEach(st => { const rm = (S.r0 + S.r1) / 2, len = S.r1 - S.r0, w = rm * S.step, cx = R.x + Math.cos(st.a) * rm, cz = R.z + Math.sin(st.a) * rm, side = [Math.cos(st.a + Math.PI / 2), Math.sin(st.a + Math.PI / 2)];
        [-1, 1].forEach(k => B.box('concrete', FR(cx + side[0] * w / 2 * k, R.y, cz + side[1] * w / 2 * k, st.a), len, S.h, .6, CONC));
        B.box('concrete', FR(R.x + Math.cos(st.a) * S.r1, R.y, R.z + Math.sin(st.a) * S.r1, st.a + Math.PI / 2), w + .6, S.h, .6, CONC);
        if (st.roof === 'on') B.box('corrugated', FR(cx, R.y + S.h, cz, st.a, -.06), len + 1, .5, w + .6, mixc(RUST, CONC, .3));
        else B.box('corrugated', FR(cx, R.y + 1.2, cz, st.a, .2, .25), len * .8, .5, w * .9, tint(RUST2, .8)); });
      return;
    }
    if (R.kind === 'gantry') {
      n.gantries++; const c = Math.cos(R.yaw), s = Math.sin(R.yaw), across = [-s, c];
      [-1, 1].forEach(k => { const fx = R.x + across[0] * R.span / 2 * k, fz = R.z + across[1] * R.span / 2 * k, low = R.state === 'down' && k === R.downSide, h = low ? R.h * .35 : R.h;
        [-1, 1].forEach(q => B.box('steel', FR(fx + c * R.len / 2 * q, R.y, fz + s * R.len / 2 * q, R.yaw, 0, low ? .12 * q : 0), .9, h, .9, mixc(RUST, [.75, .6, .2], .4)));
        B.box('steel', FR(fx, R.y + h - 1, fz, R.yaw), R.len + 1, 1, 1, STEEL); });
      const tilt = R.state === 'down' ? Math.atan2(R.h * .65, R.span) * R.downSide : 0;
      B.box('steel', FR(R.x, R.y + R.h - (R.state === 'down' ? R.h * .33 : 0), R.z, R.yaw + Math.PI / 2, 0, tilt), R.span + 2, 1.8, 2.2, mixc(RUST, [.75, .6, .2], .5));
      if (R.state !== 'down') { const tx = R.x + across[0] * (R.trolley - .5) * R.span, tz = R.z + across[1] * (R.trolley - .5) * R.span; B.box('steel', FR(tx, R.y + R.h - 3.2, tz, R.yaw), 3, 2.6, 3, STEEL); B.cyl('steel', [tx, R.y + R.h - 3.2, tz], [tx, R.y + R.h * .45, tz], .08, DARK, 4); }
      return;
    }
    if (R.kind === 'pool') { n.pools++; disc('paint', R.x, R.y + .06, R.z, R.rx, R.rz, R.yaw, [.03, .035, .03], 22); }
  });
  if (o.finish === false) return { builder: B, n };
  const G = B.finish(o.name || 'the yards', { chunk: o.chunk == null ? 400 : o.chunk }); G.userData.n = n; return G;
};
