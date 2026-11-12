// ================================================================= ANCIENT TRANSIT — drawing the subway  [draw]
// KTRANSIT.subway's records as meshes: the bored tunnel's lining (a sweep of the bore's section facing inward, two-sided so a sinkhole shows its
// outside too), ring beams, the floor slab with its two tracks on plinths, a cable tray and a dead lamp strip along the crown; a cracked section
// with soil fallen onto its floor, a collapsed one as the lower half of the bore under a mound of rubble (the sinkhole above is the host's
// ground), a silted one with its floor buried; the stations: a hall with side platforms, columns, a roof (whole, holed, or fallen in slabs),
// the kit's benches, bins and signs on the platforms, the stair entrances up to the street with their canopies, the passages into the hall;
// the vent heads at the surface.
//
//   KTRANSIT.draw.subway(SW, {furn, shadow}) -> Group     userData {tris, sections, stations, sinkholes}
(function () {
  var T = KTRANSIT, C = function () { return T.COL; };
  function frames(SW, s0, s1, step, up, offFn) {
    var out = [], n = Math.max(1, Math.round((s1 - s0) / step));
    for (var i = 0; i <= n; i++) { var s = s0 + (s1 - s0) * i / n, p = SW.path.at(s), y = SW.floorAt(s), s2 = Math.min(SW.L, s + 2), pitch = s2 > s ? Math.atan2(SW.floorAt(s2) - y, 2) : 0, off = offFn ? offFn(s, i / n) : 0;
      out.push(T.frame(p.x + Math.cos(p.yaw) * off, y + up, p.z - Math.sin(p.yaw) * off, p.yaw, pitch, 0)); }
    return out;
  }
  /* the bore's section, counter-clockwise so the lining faces inward: the floor from -w to +w, up the right wall over the crown and down the left.
     lower: only the walls to `lower` high and the floor (an open polyline) */
  function bore(R, lower) {
    var c = R * 0.62, w = Math.sqrt(R * R - c * c), a0 = Math.atan2(-c, w), pts = [], n = 18;
    if (lower == null) { pts.push([-w, 0], [w, 0]); for (var i = 1; i < n; i++) { var t = a0 + (Math.PI * 2 - 2 * Math.abs(a0)) * i / n; var ang = a0 + (2 * Math.PI + 2 * a0 * -1 - 2 * Math.abs(a0)) * 0; void t; void ang; } }
    var start = a0, end = Math.PI - a0, out = [];
    if (lower == null) { out.push([-w, 0], [w, 0]); for (var k = 1; k < n; k++) { var th = start + (end - start) * k / n; out.push([R * Math.cos(th), c + R * Math.sin(th)]); } return out; }
    /* the open lower profile: left wall top, down to the floor, across, up the right wall */
    var up = []; for (var q = 0; q <= 6; q++) { var th2 = start + (end - start) * q / (n * 1.0) ; if (c + R * Math.sin(th2) > lower) break; up.push([R * Math.cos(th2), c + R * Math.sin(th2)]); }
    var left = up.map(function (p) { return [-p[0], p[1]]; }).reverse();
    return left.concat([[-w, 0], [w, 0]], up.slice(1));
  }
  var RAIL = [[-0.07, 0], [0.07, 0], [0.07, 0.03], [0.035, 0.03], [0.035, 0.13], [0.045, 0.16], [-0.045, 0.16], [-0.035, 0.13], [-0.035, 0.03], [-0.07, 0.03]].reverse();
  function tunnel(B, SW, S, M) {
    var col = C(), R = SW.radius, f = [M, M.clone().multiply(T.frame(0, 0, S.len, 0, 0, 0))], dark = function (c, k) { return [c[0] * k, c[1] * k, c[2] * k]; };
    if (S.inStation) return;
    if (S.state === 'collapsed') {
      B.sweep('tunnel', bore(R, 2.4), f, dark(col.concrete, 0.7), { u0: S.s0, open: true });
      B.sweep('soil', [[-SW.width / 2, 0.1], [-SW.width / 2 + 1.5, 2.2], [0, 3.0], [SW.width / 2 - 1.5, 2.2], [SW.width / 2, 0.1]], f, col.soil, { u0: S.s0, open: true });
      return;
    }
    B.sweep('tunnel', bore(R), f, dark(col.concrete, S.state === 'intact' ? 0.85 : 0.65), { u0: S.s0 });
    /* ring beams every 10 m, the floor slab, the plinths, the cable tray, the dead lamp strip */
    for (var a = 5; a < S.len; a += 10) { var fr = M.clone().multiply(T.frame(0, 0, a, 0, 0, 0)); B.sweep('concrete', bore(R - 0.18), [fr, fr.clone().multiply(T.frame(0, 0, 0.35, 0, 0, 0))], dark(col.concDark, 0.8), { u0: S.s0 + a }); }
    B.sweep('concrete', [[-SW.width / 2 + 0.2, 0.2], [SW.width / 2 - 0.2, 0.2], [SW.width / 2 - 0.2, 0.02], [-SW.width / 2 + 0.2, 0.02]], f, dark(col.concDark, 0.9), { u0: S.s0 });
    SW.tracks.forEach(function (off) { [-1, 1].forEach(function (sd) { var x = off + sd * SW.gauge / 2; B.sweep('concrete', [[x - 0.3, 0.2], [x - 0.3, 0.38], [x + 0.3, 0.38], [x + 0.3, 0.2]].reverse(), f, dark(col.concDark, 0.8), { u0: S.s0 }); }); });
    B.sweep('rust', [[SW.width / 2 - 0.45, 1.6], [SW.width / 2 - 0.05, 1.6], [SW.width / 2 - 0.05, 1.5], [SW.width / 2 - 0.45, 1.5]], f, col.rust, { u0: S.s0 });
    B.sweep('glass', [[-0.3, R * 0.62 + R - 0.12], [0.3, R * 0.62 + R - 0.12], [0.3, R * 0.62 + R - 0.16], [-0.3, R * 0.62 + R - 0.16]].reverse(), f, col.glassDark, { u0: S.s0 });
    if (S.silt > 0) B.sweep('soil', [[-SW.width / 2 + 0.1, 0.25], [-SW.width / 2 + 1.2, S.silt], [SW.width / 2 - 1.2, S.silt], [SW.width / 2 - 0.1, 0.25]], f, S.state === 'silted' ? dark(col.soil, 0.7) : col.soilDry, { u0: S.s0, open: true });
  }
  function station(B, SW, S, o) {
    var col = C(), W = S.hallW, H = S.hallH, fr = frames(SW, S.s0, S.s1, 10, 0), dark = function (c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }, down = S.state === 'collapsed', ruined = S.state !== 'intact';
    /* the hall: floor, walls (two-sided), the roof whole or holed; collapsed: no roof, its slabs lying on the platforms */
    var prof = down ? [[-W / 2, H], [-W / 2, 0], [W / 2, 0], [W / 2, H]] : [[-W / 2, 0], [W / 2, 0], [W / 2, H], [-W / 2, H]];
    if (ruined && !down) { var f1 = fr.slice(0, Math.ceil(fr.length * 0.45)), f2 = fr.slice(Math.floor(fr.length * 0.65)); B.sweep('tunnel', prof, f1, dark(col.white, 0.8), { u0: S.s0, caps: true }); B.sweep('tunnel', prof, f2, dark(col.white, 0.8), { u0: S.s0, caps: true }); B.sweep('tunnel', [[-W / 2, H], [-W / 2, 0], [W / 2, 0], [W / 2, H]], fr.slice(Math.ceil(fr.length * 0.45) - 1, Math.floor(fr.length * 0.65) + 1), dark(col.white, 0.8), { u0: S.s0, open: true }); }
    else B.sweep('tunnel', prof, fr, dark(col.white, 0.8), { u0: S.s0, open: down, caps: !down });
    B.sweep('concrete', [[-W / 2 - 0.4, H], [W / 2 + 0.4, H], [W / 2 + 0.4, H + 0.6], [-W / 2 - 0.4, H + 0.6]], down ? fr.slice(0, 2) : fr, col.concrete, { u0: S.s0, caps: true });
    S.platforms.forEach(function (P) { var lo = Math.min(P.from, P.to), hi = Math.max(P.from, P.to); B.sweep('concrete', [[lo, 1.0], [hi, 1.0], [hi, 0], [lo, 0]], fr, col.concrete, { u0: S.s0, caps: true }); B.sweep('pave', [[lo, 1.04], [hi, 1.04], [hi, 1.01], [lo, 1.01]], fr, col.pave, { u0: S.s0 }); B.sweep('line', [[P.side * 4.6, 1.045], [P.side * 4.2 + (P.side > 0 ? 0.0 : 0.0), 1.045], [P.side * 4.2, 1.035], [P.side * 4.6, 1.035]], fr, col.lineYellow, { u0: S.s0 }); });
    /* the tracks' slab and plinths through the hall */
    B.sweep('concrete', [[-4.0, 0.2], [4.0, 0.2], [4.0, 0.02], [-4.0, 0.02]], fr, dark(col.concDark, 0.9), { u0: S.s0 });
    SW.tracks.forEach(function (off) { [-1, 1].forEach(function (sd) { var x = off + sd * SW.gauge / 2; B.sweep('concrete', [[x - 0.3, 0.2], [x - 0.3, 0.38], [x + 0.3, 0.38], [x + 0.3, 0.2]].reverse(), fr, dark(col.concDark, 0.8), { u0: S.s0 }); }); });
    S.columns.forEach(function (c) { var m = fr[0].clone().multiply(T.frame(c.lat, 1.0, c.along, 0, 0, 0)); if (c.state === 'fallen') B.box('concrete', m.clone().multiply(T.frame(c.side * 1.5, 0.3, 0, 0.2, 0, Math.PI / 2 * 0.9)), 0.7, H - 1.0, 0.7, col.concDark); else B.box('concrete', m, 0.7, H - 1.0, 0.7, col.concrete); });
    if (down) for (var k = 0; k < 7; k++) { var ak = 8 + k * 10, sd = k % 2 ? 1 : -1, m2 = fr[0].clone().multiply(T.frame(sd * 4.5, 1.1 + (k % 3) * 0.4, ak, 0.3 * (k % 2 ? 1 : -1), 0.15, sd * 0.35)); B.box('concrete', m2, 7, 0.6, 8, col.concrete); }
    else if (!ruined) B.sweep('glass', [[-0.4, H - 0.1], [0.4, H - 0.1], [0.4, H - 0.14], [-0.4, H - 0.14]].reverse(), fr, col.glassDark, { u0: S.s0 });
    /* the furniture on the platforms */
    if (o.furn) S.furniture.forEach(function (p) { var g = o.furn.build(p.kind, { state: p.state, variant: p.variant, seed: p.seed }); if (!g) return; var m = T.frame(p.x, p.y, p.z, p.yaw, 0, 0); g.children.forEach(function (ch) { B.mesh(null, ch, m); }); });
    /* the entrances: a stair pit at the street under a canopy, the flight down, the passage into the hall */
    S.entrances.forEach(function (E) {
      var m = T.frame(E.x, E.y, E.z, E.yaw, 0, 0), fw = E.flight.w, run = E.flight.run, rise = E.rise, choked = E.state === 'choked', along = E.end ? -1 : 1;
      /* the pit's walls and the flight: steps from the street end down toward the hall's end of the station */
      B.box('concrete', m.clone().multiply(T.frame(0, -rise - 0.5, along * run / 2, 0, 0, 0)), fw + 1.2, 0.5, run + 1.2, col.concDark);
      [-1, 1].forEach(function (sd) { B.box('tunnel', m.clone().multiply(T.frame(sd * (fw / 2 + 0.3), -rise, along * run / 2, 0, 0, 0)), 0.6, rise + 0.3, run + 1.2, dark(col.white, 0.8)); });
      B.box('concrete', m.clone().multiply(T.frame(0, -rise, along * (run + 0.3), 0, 0, 0)), fw + 1.2, rise + 0.3, 0.6, col.concDark);
      if (!choked) { var steps = Math.max(6, Math.round(rise / 0.2)); for (var q = 0; q < steps; q++) { var t = (q + 0.5) / steps; B.box('pave', m.clone().multiply(T.frame(0, -rise * t - 0.2, along * run * t, 0, 0, 0)), fw, 0.22, run / steps + 0.05, col.pave); } }
      else { B.box('soil', m.clone().multiply(T.frame(0, -1.2, along * run * 0.45, 0, 0, 0)), fw, 1.6, run * 0.8, col.soil); for (var r2 = 0; r2 < 5; r2++) B.box('concrete', m.clone().multiply(T.frame((r2 % 2 ? 0.8 : -0.8), -0.4 + 0.15 * r2, along * (2 + r2 * 2.2), 0.4 * r2, 0, 0.3)), 1.4, 0.3, 1.1, col.concDark); }
      [-1, 1].forEach(function (sd) { B.box('concrete', m.clone().multiply(T.frame(sd * (fw / 2 + 0.55), 0, along * run / 2, 0, 0, 0)), 0.5, 0.35, run + 1.6, col.concDark, { noBottom: true }); }); B.box('concrete', m.clone().multiply(T.frame(0, 0, along * (run + 0.55), 0, 0, 0)), fw + 1.6, 0.35, 0.5, col.concDark, { noBottom: true }); /* the kerb round the pit */
      if (E.state === 'intact') { [[-1, 0.5], [1, 0.5], [-1, run - 0.5], [1, run - 0.5]].forEach(function (p) { B.box('steel', m.clone().multiply(T.frame(p[0] * (fw / 2 + 0.4), 0.35, along * p[1], 0, 0, 0)), 0.2, 3.0, 0.2, col.steelDark); }); B.box('white', m.clone().multiply(T.frame(0, 3.35, along * run / 2, 0, 0, 0)), fw + 1.6, 0.25, run + 0.6, col.white); B.box('glass', m.clone().multiply(T.frame(0, 2.6, along * run / 2, 0, 0, 0)), fw + 1.4, 0.5, 0.1, col.glassDark); }
      else if (E.state === 'ruined') { [[-1, 0.5], [1, run - 0.5]].forEach(function (p) { B.box('rust', m.clone().multiply(T.frame(p[0] * (fw / 2 + 0.4), 0.35, along * p[1], 0.3, 0, 0.2)), 0.2, 2.2, 0.2, col.rust); }); B.box('rust', m.clone().multiply(T.frame(1.5, 0.35, along * run / 2, 0.1, 0, 0.5)), fw + 1.6, 0.25, run * 0.6, dark(col.white, 0.6)); }
      /* the passage from the stair's foot to the hall's wall, under the ground */
      var pm = T.frame(E.x, E.y - rise, E.z, E.yaw, 0, 0), plen = Math.abs(E.passage.from - E.passage.to) + 0.6, pmid = -E.side * (plen / 2 + fw / 2);
      B.sweep('tunnel', [[-E.passage.w / 2, 0], [E.passage.w / 2, 0], [E.passage.w / 2, E.passage.h], [-E.passage.w / 2, E.passage.h]], [pm.clone().multiply(T.frame(0, 0, along * (run + 0.6), -E.side * Math.PI / 2, 0, 0)), pm.clone().multiply(T.frame(0, 0, along * (run + 0.6), -E.side * Math.PI / 2, 0, 0)).multiply(T.frame(0, 0, plen + fw / 2, 0, 0, 0))], dark(col.white, 0.75), { u0: 0 });
      void pmid;
    });
  }
  T.draw.subway = function (SW, o) {
    o = o || {}; var B = T.builder(), col = C(), M = T.mats();
    if (!M.tunnel) { M.tunnel = M.concrete.clone(); M.tunnel.side = THREE.DoubleSide; M.tunnel.name = 'tr.tunnel'; }
    SW.sections.forEach(function (S) { tunnel(B, SW, S, T.frame(S.x0, S.y0, S.z0, S.yaw, S.pitch, 0)); });
    /* the rails: both tracks, by section */
    SW.rails.forEach(function (sec) { if (sec.state === 'gone') return; var bent = sec.state === 'bent';
      [-1, 1].forEach(function (s, k) { var f = frames(SW, sec.s0, sec.s1, 6, 0.38, function (q, t) { return sec.off + s * SW.gauge / 2 + (bent && k === 0 ? sec.bend * Math.sin(Math.PI * t) : 0); }); B.sweep(bent ? 'rust' : 'steel', RAIL, f, bent ? col.rust : col.steel, { u0: sec.s0, caps: true }); }); });
    SW.stations.forEach(function (S) { station(B, SW, S, o); });
    SW.vents.forEach(function (V) { var m = T.frame(V.x, V.y, V.z, V.yaw, 0, 0); if (V.state === 'fallen') { B.box('concrete', m.clone().multiply(T.frame(0.6, 0, 0, 0.5, 0, Math.PI / 2 * 0.95)), 2.4, 2.2, 1.6, col.concDark); return; } B.box('concrete', m, 2.4, V.state === 'intact' ? 2.2 : 1.4, 1.6, col.concrete); B.box(V.state === 'intact' ? 'steel' : 'rust', m.clone().multiply(T.frame(0, V.state === 'intact' ? 2.2 : 1.4, 0, 0, 0, 0)), 2.5, 0.12, 1.7, col.steelDark); });
    var G = B.finish('subway ' + SW.id); G.userData.sections = SW.sections.length; G.userData.stations = SW.stations.length; G.userData.sinkholes = SW.sinkholes.length; G.userData.id = SW.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
})();
