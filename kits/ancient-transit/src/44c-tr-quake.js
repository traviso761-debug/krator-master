// ================================================================= ANCIENT TRANSIT — the earthquake  [G data]
// The owner (2026-11-08): "some road and train sections where it looks like there has been uplift or torsion of the land during an earthquake".
// A fault across the page as a record: a THROW (one side lifted over a narrow scarp), a strike-slip SLIP (the lifted side carried along the
// fault), a TWIST (the land turned about the fault, dying out with distance) and BUCKLES (ridges the land folded into beside it). The host adds
// the rise to its ground and hands the shift to every line, street and surface it draws there, so roads and rails bend and break at the fault,
// kerbs kink, spans and piers lean (KTRANSIT.highway and rail take o.quake and o.shift; KTRANSIT.path takes o.shift).
//
//   KTRANSIT.quake(o) -> Q         o.id ('q'), o.pts (the fault's polyline [[x, z], ...]), o.throw (m, the side +1 of the fault's heading lifted, 3),
//                                  o.width (the scarp's ramp, 6), o.slip (m along the fault, 5), o.twist (rad at the fault, 0.05), o.reach (120),
//                                  o.buckle {amp 0.8, wavelength 32, reach 90, seed}
//   KTRANSIT.quakeH(Q, x, z)       the rise of the land at (x, z): the throw's smooth step across the scarp, the buckles beside it
//   KTRANSIT.quakeShift(Q, x, z)   [dx, dz]: where the land at (x, z) was carried: the slip along the fault on the lifted side (blended over the
//                                  scarp) and the twist about the nearest point of the fault, both dying out by o.reach
//   KTRANSIT.quakeRoll(Q, x, z)    the roll (rad) a structure standing at (x, z) takes from the twist: positive on the lifted side
//   KTRANSIT.quakeAt(Q, x, z)      {s, off, side, t (0 on the low side, 1 on the lifted, across the scarp), fall (1 at the fault, 0 past reach)}
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  var sm = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  T.quake = function (o) {
    o = o || {};
    if (!o.pts || o.pts.length < 2) throw new Error('KTRANSIT.quake: o.pts, the fault\'s polyline, please');
    var P = T.path(o.pts, { ground: function () { return 0; }, step: 8 }), b = o.buckle || {};
    return { id: o.id == null ? 'q' : String(o.id), kind: 'quake', path: P, L: P.L, throw: num(o.throw, 3), width: num(o.width, 6), slip: num(o.slip, 5), twist: num(o.twist, 0.05), reach: num(o.reach, 120),
      buckle: { amp: num(b.amp, 0.8), wavelength: num(b.wavelength, 32), reach: num(b.reach, 90), seed: num(b.seed, 7) } };
  };
  T.quakeAt = function (Q, x, z) {
    var pr = Q.path.project(x, z), off = pr.off, side = off >= 0 ? 1 : -1, t = sm(off / Q.width + 0.5), fall = 1 - sm(Math.abs(off) / Q.reach);
    return { s: pr.s, off: off, side: side, t: t, fall: fall, yaw: Q.path.at(pr.s).yaw };
  };
  T.quakeH = function (Q, x, z) {
    var a = T.quakeAt(Q, x, z), h = Q.throw * a.t, B = Q.buckle;
    if (!Q.path.near(x, z, Math.max(B.reach, Q.reach))) return h;
    if (B.amp > 0 && Math.abs(a.off) < B.reach) { var w = 1 - sm(Math.abs(a.off) / B.reach), near = sm((Math.abs(a.off) - Q.width * 0.5) / (Q.width * 1.5)); h += B.amp * w * near * Math.sin(a.s / B.wavelength * Math.PI * 2 + a.off / (B.wavelength * 0.6) + KRAND.vnoise(a.s / 60, 0, B.seed, B.seed) * 2); }
    return h;
  };
  T.quakeShift = function (Q, x, z) {
    if (!Q.path.near(x, z, Q.reach)) return [0, 0];
    var a = T.quakeAt(Q, x, z), dx = Math.sin(a.yaw), dz = Math.cos(a.yaw), slipK = Q.slip * a.t * a.fall, sx = dx * slipK, sz = dz * slipK;   /* the slip dies out by reach: the block's whole shift would move nothing visible */
    /* the twist: the point turned about the fault's nearest point by twist * fall (the lifted side one way, the low side the other) */
    var ang = Q.twist * a.fall * a.side, p = Q.path.at(a.s), rx = x - p.x, rz = z - p.z, c = Math.cos(ang), s = Math.sin(ang);
    return [sx + (rx * c - rz * s) - rx, sz + (rx * s + rz * c) - rz];
  };
  T.quakeRoll = function (Q, x, z) { if (!Q.path.near(x, z, Q.reach)) return 0; var a = T.quakeAt(Q, x, z); return Q.twist * 2.2 * a.fall * a.side * (1 - Math.abs(a.t - 0.5) * 0.6); };
})();
