// ================================================================= METROPOLIS — the yards' pieces: records  [G data]
// The owner, 2026-11-10: the Ancient's Valley needs an industrial district (biomes/ancientsvalley PLAN.md section 12, 2a: the Yards). The twelve
// industrial buildings are the kit's own (46b, 46e); what stands between them is new and is here, as plain records first: tank farms in bunds,
// pipe racks between the halls, the references' dish arrays, chimneys, conveyors, slag heaps, spill grounds and toxic pools, and a rail yard off
// a line (sidings fanning from it, a turntable with its roundhouse, loading gantries across the tracks). Each function takes numbers and returns
// records in the page's frame (x east, z south, y up; a yaw turns a piece's own frame u, v to the page: x = u cos - v sin, z = u sin + v cos);
// heights come from o.ground(x, z) where a piece meets the ground, or from o.y where it stands on a level pad. Every figure is fixed or a
// position hash (KRAND), never a stream: the same inputs give the same yard. No THREE, no DOM: 57y-mp-yards-draw.js draws them, the host
// places them and registers each before it is drawn. A record's `state` is its ruin, chosen here by o.damage (0..1) and the hash.
MP.yards = (function () {
  var U = function (seed, a, b, c) { return KRAND.unit(KRAND.hash(seed | 0, a | 0, b | 0, c | 0)); };
  var toW = function (cx, cz, yaw, u, v) { var c = Math.cos(yaw), s = Math.sin(yaw); return [cx + u * c - v * s, cz + u * s + v * c]; };
  var dmg = function (o) { return o.damage == null ? 0.5 : Math.max(0, Math.min(1, o.damage)); };
  var gr = function (o, x, z) { return o.y != null ? o.y : o.ground ? o.ground(x, z) : 0; };
  var Y = {};

  /* A TANK FARM in its bund: a rectangle w x d (its long side along u) walled 2.2 m high, the tanks in rows inside it at 2.5 radii apart, a
     manifold along the bund's south wall with a stub to each tank. Tanks: radius o.r (10 m) less up to a fifth by hash, height 1.0-1.5 r, a
     cone, a floating or a domed roof. Ruin by damage: whole, holed (a breach low in the shell), burnt (soot to the roof), collapsed (the shell
     buckled to a third of its height, the roof down inside it) or gone (only its ring footing) */
  Y.tankFarm = function (o) {
    var seed = o.seed | 0, D = dmg(o), r0 = o.r == null ? 10 : o.r, w = o.w, d = o.d, yaw = o.yaw == null ? 0 : o.yaw, wall = 1.2, pitch = r0 * 2.5;
    var nu = Math.max(1, Math.floor((w - 2 * wall - 4) / pitch)), nv = Math.max(1, Math.floor((d - 2 * wall - 10) / pitch)), tanks = [];
    for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
      var u = (i - (nu - 1) / 2) * pitch, v = (j - (nv - 1) / 2) * pitch - 3, k = i * 31 + j, r = r0 * (0.8 + 0.2 * U(seed, k, 1, 0)), p = toW(o.x, o.z, yaw, u, v), g = U(seed, k, 2, 0);
      var st = g < 0.12 + 0.5 * D * D ? (U(seed, k, 3, 0) < 0.35 ? 'gone' : 'collapsed') : g < 0.3 + 0.5 * D ? (U(seed, k, 4, 0) < 0.5 ? 'burnt' : 'holed') : 'whole';
      /* o.spheres (0..1): the share that are spheres on a ring of legs (the owner's references, 2026-11-10: the domed and spherical stores
         in the refinery's fog), the rest upright cylinders */
      var sph = U(seed, k, 8, 0) < (o.spheres == null ? 0 : o.spheres);
      tanks.push({ x: p[0], z: p[1], y: gr(o, p[0], p[1]), r: r, h: sph ? r * 2.3 : r * (1 + 0.5 * U(seed, k, 5, 0)), form: sph ? 'sphere' : 'cyl', roof: ['cone', 'float', 'dome'][Math.floor(U(seed, k, 6, 0) * 3)], state: sph && st === 'collapsed' ? 'holed' : st, breach: U(seed, k, 7, 0) * Math.PI * 2, u: u, v: v });
    }
    var cs = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(function (q) { return toW(o.x, o.z, yaw, q[0], q[1]); });
    var man = [toW(o.x, o.z, yaw, -w / 2 + wall + 2, d / 2 - wall - 3), toW(o.x, o.z, yaw, w / 2 - wall - 2, d / 2 - wall - 3)];
    return { kind: 'tankfarm', x: o.x, z: o.z, y: gr(o, o.x, o.z), yaw: yaw, w: w, d: d, bund: { h: 2.2, t: wall, corners: cs }, tanks: tanks, manifold: man, r: Math.hypot(w, d) / 2, h: Math.max.apply(null, tanks.map(function (t) { return t.h; }).concat([3])) + 4 };
  };

  /* A PIPE RACK along a polyline o.pts [[x, z]...]: bents (two legs and a beam, 6 m wide) every o.step (8 m) carrying o.n pipes (4) at o.h
     (7 m) on the beam and a second tier at o.h + 3 when o.tiers is 2; each bent on the ground under it (o.ground). Ruin: a run of bents down
     (state 'down', the pipes between sagging to the ground) where the hash falls under damage */
  Y.pipeRack = function (o) {
    var seed = o.seed | 0, D = dmg(o), step = o.step == null ? 8 : o.step, h = o.h == null ? 7 : o.h, n = o.n == null ? 4 : o.n, P = o.pts, bents = [], L = 0, k = 0;
    for (var i = 0; i + 1 < P.length; i++) {
      var a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), yaw = Math.atan2(dz, dx), m = Math.max(1, Math.round(l / step));
      /* o.skip(x, z): no bent there (a street, a track): the pipes span the gap from the bent before to the bent after */
      for (var q = i ? 1 : 0; q <= m; q++) { var t = q / m, x = a[0] + dx * t, z = a[1] + dz * t, kk = k++; if (o.skip && o.skip(x, z)) continue; bents.push({ x: x, z: z, y: gr(o, x, z), yaw: yaw, s: L + l * t, k: kk }); }
      L += l;
    }
    /* runs of bents down: a run starts where the hash falls under damage / 6 and goes on 2 to 5 bents */
    var left = 0;
    bents.forEach(function (B) { if (left > 0) { B.state = 'down'; left--; return; } if (U(seed, B.k, 1, 0) < D / 6) { B.state = 'down'; left = 1 + Math.floor(U(seed, B.k, 2, 0) * 4); } else B.state = 'standing'; });
    var pipes = []; for (var p = 0; p < n; p++) pipes.push({ r: 0.25 + 0.35 * U(seed, p, 3, 0), off: (p - (n - 1) / 2) * 1.35, tier: 0 });
    if (o.tiers === 2) for (var p2 = 0; p2 < Math.max(1, n - 1); p2++) pipes.push({ r: 0.2 + 0.25 * U(seed, p2, 4, 0), off: (p2 - (n - 2) / 2) * 1.6, tier: 1 });
    var xs = bents.map(function (B) { return B.x; }), zs = bents.map(function (B) { return B.z; }), cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, cz = (Math.min.apply(null, zs) + Math.max.apply(null, zs)) / 2;
    return { kind: 'piperack', pts: P.slice(), bents: bents, pipes: pipes, h: h, w: 6, tiers: o.tiers === 2 ? 2 : 1, length: L, x: cx, z: cz, y: Math.min.apply(null, bents.map(function (B) { return B.y; })), r: Math.hypot(Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, zs) - Math.min.apply(null, zs)) / 2 + 4 };
  };

  /* A DISH ARRAY (the references' dishes on the ridge): o.nu x o.nv dishes of radius o.r (9 m) on pedestals, o.gap apart, aimed at one point of
     the sky (o.az, o.el) with a little scatter. Ruin: a dish slumped on its mount (its face toward the ground) or fallen beside its pedestal */
  Y.dishArray = function (o) {
    var seed = o.seed | 0, D = dmg(o), r = o.r == null ? 9 : o.r, gap = o.gap == null ? r * 3.2 : o.gap, nu = o.nu == null ? 3 : o.nu, nv = o.nv == null ? 2 : o.nv, yaw = o.yaw == null ? 0 : o.yaw, dishes = [];
    for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
      var k = i * 17 + j, p = toW(o.x, o.z, yaw, (i - (nu - 1) / 2) * gap, (j - (nv - 1) / 2) * gap), g = U(seed, k, 1, 0);
      var st = g < 0.15 * D ? 'fallen' : g < 0.15 * D + 0.45 * D ? 'slumped' : 'aimed';
      dishes.push({ x: p[0], z: p[1], y: gr(o, p[0], p[1]), r: r * (0.9 + 0.2 * U(seed, k, 2, 0)), mount: r * 0.9, az: (o.az == null ? 0.6 : o.az) + (U(seed, k, 3, 0) - 0.5) * 0.3, el: (o.el == null ? 0.9 : o.el) + (U(seed, k, 4, 0) - 0.5) * 0.25, state: st, spin: U(seed, k, 5, 0) * Math.PI * 2 });
    }
    return { kind: 'disharray', x: o.x, z: o.z, y: gr(o, o.x, o.z), yaw: yaw, dishes: dishes, r: Math.hypot(nu, nv) * gap / 2 + r, h: r * 2.4 };
  };

  /* A CHIMNEY: a tapered stack from radius o.r (4 m) at the foot to 0.55 of it at the top, o.h tall (90 m), banded every 12 m; a ruin stands
     broken at a height by damage (never under a third) with its top torn */
  Y.chimney = function (o) {
    var seed = o.seed | 0, D = dmg(o), h = o.h == null ? 90 : o.h, r = o.r == null ? 4 : o.r, g = U(seed, 1, 1, 0), top = g < 0.55 * D ? h * (0.35 + 0.5 * U(seed, 1, 2, 0)) : h;
    var bands = []; for (var b = 12; b < top - 2; b += 12) bands.push(b);
    return { kind: 'chimney', x: o.x, z: o.z, y: gr(o, o.x, o.z), r0: r, r1: r * 0.55, h: h, top: top, bands: bands, state: top < h ? 'broken' : 'standing', r: r + 1, lean: top < h ? U(seed, 1, 3, 0) * 3 : 0, leanDir: U(seed, 1, 4, 0) * Math.PI * 2 };
  };

  /* A CONVEYOR: an enclosed truss gallery 3.2 m wide from a = [x, y, z] (the low end) to b (the high end), on trestles every 24 m from the
     ground (o.ground) to the gallery's underside. Ruin: one section between two trestles down (its gallery lying tilted on the ground) */
  Y.conveyor = function (a, b, o) {
    var seed = o.seed | 0, D = dmg(o), dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz), n = Math.max(1, Math.round(L / 24)), tr = [];
    for (var i = 1; i < n; i++) { var t = i / n, x = a[0] + dx * t, z = a[2] + dz * t; if (o.skip && o.skip(x, z)) continue; tr.push({ x: x, z: z, y: o.ground ? o.ground(x, z) : 0, top: a[1] + (b[1] - a[1]) * t - 1.8, t: t }); }
    var down = U(seed, 1, 1, 0) < D ? Math.floor(U(seed, 1, 2, 0) * n) : -1;
    return { kind: 'conveyor', a: a.slice(), b: b.slice(), w: 3.2, gh: 3, trestles: tr, sections: n, down: down, x: (a[0] + b[0]) / 2, z: (a[2] + b[2]) / 2, y: Math.min(a[1], b[1]) - 30, r: L / 2 + 4, h: Math.abs(b[1] - a[1]) + 36, yaw: Math.atan2(dz, dx), length: L };
  };

  /* A SLAG HEAP: a long mound rx x rz, o.h high (14 m), its crest along u, by hash; the host adds it to its ground (slagH) and paints it */
  Y.slagHeap = function (o) { return { kind: 'slag', x: o.x, z: o.z, rx: o.rx, rz: o.rz, h: o.h == null ? 14 : o.h, yaw: o.yaw == null ? 0 : o.yaw, seed: o.seed | 0, r: Math.max(o.rx, o.rz) }; };
  /* the heaps' height over the ground at (x, z): a smooth cap with lumps (KRAND value noise in the heap's frame), the highest heap winning */
  Y.slagH = function (list, x, z) {
    var h = 0;
    for (var i = 0; i < list.length; i++) {
      var S = list[i], dx = x - S.x, dz = z - S.z; if (Math.abs(dx) > S.r * 1.1 || Math.abs(dz) > S.r * 1.1) continue;
      var c = Math.cos(S.yaw), s = Math.sin(S.yaw), u = (dx * c + dz * s) / S.rx, v = (-dx * s + dz * c) / S.rz, q = u * u + v * v; if (q >= 1) continue;
      var f = 1 - q, lump = 0.75 + 0.5 * KRAND.vnoise(dx * 0.06, dz * 0.06, 2.3, S.seed), y = S.h * Math.pow(f, 0.7) * lump; if (y > h) h = y;
    }
    return h;
  };

  /* SPILL GROUNDS AND TOXIC POOLS: an ellipse of dead ground (the host's scar) and, for a pool, a still black surface sunk 0.4 m into it */
  Y.spill = function (o) { return { kind: o.pool ? 'pool' : 'spill', x: o.x, z: o.z, rx: o.rx, rz: o.rz, yaw: o.yaw == null ? 0 : o.yaw, y: gr(o, o.x, o.z), r: Math.max(o.rx, o.rz), h: 2, seed: o.seed | 0 }; };

  /* A TURNTABLE and its ROUNDHOUSE: a pit of radius o.r (13 m) with its bridge across, and a fan of o.stalls (12) stalls on the far side, each
     a road 5 m wide out to a half ring of shed 8 m high from r + 8 to r + 38. Ruin: the bridge off its pivot and the shed's roof in by damage */
  Y.turntable = function (o) {
    var seed = o.seed | 0, D = dmg(o), r = o.r == null ? 13 : o.r, n = o.stalls == null ? 12 : o.stalls, yaw = o.yaw == null ? 0 : o.yaw, step = Math.PI / 1.6 / n, stalls = [];
    for (var i = 0; i < n; i++) { var a = yaw + (i - (n - 1) / 2) * step; stalls.push({ a: a, roof: U(seed, i, 1, 0) < 0.25 + 0.6 * D ? 'in' : 'on', door: U(seed, i, 2, 0) < 0.5 }); }
    return { kind: 'turntable', x: o.x, z: o.z, y: gr(o, o.x, o.z), r: r, yaw: yaw, entry: o.entry == null ? yaw + Math.PI : o.entry, bridge: (o.bridge == null ? yaw + Math.PI : o.bridge) + (U(seed, 0, 3, 0) - 0.5) * 0.6, off: U(seed, 0, 4, 0) < D, shed: { r0: r + 8, r1: r + 38, h: 8, step: step }, stalls: stalls, h: 12 };
  };
  /* the turntable's footprint for a host's checks and pads: the pit and the fan of the shed */
  Y.turntableR = function (T) { return T.shed.r1 + 2; };

  /* A LOADING GANTRY across tracks: two leg frames o.span apart (the tracks between), a box girder at o.h (14 m) and a trolley on it, its axis
     along the tracks (yaw). Ruin: a leg frame buckled (the girder down at that end) by damage */
  Y.gantry = function (o) {
    var seed = o.seed | 0, D = dmg(o), g = U(seed, 1, 1, 0);
    return { kind: 'gantry', x: o.x, z: o.z, y: gr(o, o.x, o.z), yaw: o.yaw == null ? 0 : o.yaw, span: o.span, h: o.h == null ? 14 : o.h, len: o.len == null ? 10 : o.len, trolley: U(seed, 1, 2, 0) * 0.8 + 0.1, state: g < 0.4 * D ? 'down' : 'standing', downSide: U(seed, 1, 3, 0) < 0.5 ? -1 : 1, r: o.span / 2 + 4 };
  };

  /* THE RAIL YARD off a line: o.at(s) -> {x, z} along the line (its path), sidings on side o.side (+1 to the line's right, z+ for a line run
     east) from s0 to s1: o.n sidings (8) at o.spacing (5.5 m) between centres, each leaving the line on a turnout o.fan metres long (110), the
     next a ladder step (o.ladder, 26 m) further on, running parallel and ending at a buffer stop staggered back from s1. Returns the sidings
     as polylines (sampled every 20 m), the buffer stops, and the yard's outline (for the host's flat bench and its checks) */
  Y.railYard = function (o) {
    /* the turnout lengthens with each siding further out (o.fanStep, 0), and never leaves the line steeper than o.maxSlope (0.2: the smoothstep's
       steepest is 1.5 d / fan), so the outer sidings leave on a ladder at one angle, as a yard's do */
    var at = o.at, s0 = o.s0, s1 = o.s1, side = o.side == null ? 1 : o.side, n = o.n == null ? 8 : o.n, sp = o.spacing == null ? 5.5 : o.spacing, fan0 = o.fan == null ? 110 : o.fan, fstep = o.fanStep == null ? 0 : o.fanStep, lad = o.ladder == null ? 26 : o.ladder, seed = o.seed | 0;
    var frame = function (s) { var p = at(s), q = at(s + 1), dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz) || 1; return { x: p.x, z: p.z, tx: dx / l, tz: dz / l, nx: -dz / l * side, nz: dx / l * side }; };
    var off = function (s, d) { var F = frame(s); return [F.x + F.nx * d, F.z + F.nz * d]; };
    var sidings = [], stops = [];
    for (var k = 1; k <= n; k++) {
      var dk = k * sp, fan = Math.max(fan0 + (k - 1) * fstep, 1.5 * dk / (o.maxSlope == null ? 0.2 : o.maxSlope)), sw = s0 + (k - 1) * lad, e = s1 - Math.floor(U(seed, k, 1, 0) * 3) * 30, pts = [], d = k * sp;
      for (var s = sw; s <= e + 0.01; s += 20) { var t = Math.min(1, (s - sw) / fan), sm = t * t * (3 - 2 * t); pts.push(off(s, d * sm)); }
      if ((e - sw) % 20) pts.push(off(e, d));
      sidings.push({ id: 'siding' + k, k: k, s0: sw, s1: e, d: d, pts: pts }); stops.push({ x: pts[pts.length - 1][0], z: pts[pts.length - 1][1], yaw: Math.atan2(frame(e).tz, frame(e).tx), k: k });
    }
    var outline = [off(s0, -4), off(s1, -4), off(s1, (n + 1) * sp + 4), off(s0 + (n - 1) * lad, (n + 1) * sp + 4)];
    return { kind: 'railyard', sidings: sidings, stops: stops, outline: outline, n: n, spacing: sp, side: side, s0: s0, s1: s1, width: (n + 1) * sp + 8, frame: frame, off: off };
  };

  /* is (x, z) inside a convex outline [[x, z]...] (the yard's), grown by m metres */
  Y.inside = function (poly, x, z, m) {
    var mm = m == null ? 0 : m, n = poly.length, ar = 0, i;
    for (i = 0; i < n; i++) { var p = poly[i], q = poly[(i + 1) % n]; ar += p[0] * q[1] - q[0] * p[1]; }
    var sgn = ar >= 0 ? 1 : -1;
    for (i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], ex = b[0] - a[0], ez = b[1] - a[1], l = Math.hypot(ex, ez) || 1, c = (ex * (z - a[1]) - ez * (x - a[0])) / l;
      if (c * sgn < -mm) return false;
    }
    return true;
  };
  return Y;
})();
