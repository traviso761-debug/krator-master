/* ======================================================================
   Krator Motor Vehicles: the Ancients (kits/motor-vehicles/krator-vehicles-ancient.js)

   The Ancients (LORE.md 4): the lost high civilisation whose works every culture lives in. Their house
   style is the metropolis kit's (kits/metropolis/PLAN.md 2, "The family": Cyclopean, Modernist, Organic;
   late Gaudi, Goldberg, Moebius, Soleri): white seamed panel, board-formed concrete at the root, a bronze
   band where the structure transfers, blue glass, cyan strips. On the road that is a smooth monocoque
   body (F.tub: stacked superellipse sections), the wheels under the sill behind a bronze arch, no exposed
   engine (Ancient cells: fuel 'battery'), a bronze belt band at the waist, a blue-glass canopy on bronze
   posts, a cyan strip along the sill and across the nose (a lamp family: it glows with lights()).

   Six vehicles, for the Ancient's Valley's streets (biomes/ancientsvalley: a thousand-year-old war zone,
   every vehicle rusted, many burnt), where they are built in the kit's RUIN STATES (vehicles-core.js
   vehicleRuin; krator-vehicles-runtime.js: KV.build(key, { state: 'weathered' | 'burnt' | 'wreck' })):
     anc_pod       a two-seat pod car                 2.1 x 3.3 m
     anc_saloon    a long low four-seat saloon        2.4 x 6.0 m
     anc_van       a delivery van: a cab pod, a box   2.5 x 6.0 m
     anc_utility   a six-wheeled utility, open bay    2.55 x 6.2 m
     anc_hauler    a flatbed hauler, six wheels       2.75 x 9.2 m
     anc_tram      a guideway tram-car, forty seats   2.95 x 13.4 m

   THE CABINS ARE HOLLOW. A hull tub is open at the belt (no top cap); inside it an inward-facing liner
   (ancLiner: F.tub's `inside`) gives the cabin walls, a low floor sits between shelves over the wheels, and
   the seats, dash and yoke stand on that floor under the canopy, inside it (ancCabin). A cab pod on a deck
   (the utility, the hauler, the van) is the same without the shelves: its floor is the pod's pan.
   Each build reads F.ruin: the glass is drawn only when F.ruin.glass (the runtime would drop it anyway;
   not drawing it saves the triangles), and when it is gone the frames stay and SHARDS of dark glass are
   left standing in them (ancGlass: the glazing reads as broken out, not as an opening onto a wall); the
   cabin's seats are charred frames when burnt or wrecked; nothing here draws from F.rnd, so the intact and
   the ruined builds of one seed are one vehicle. The rust, soot, sag and the wreck's shape are the
   runtime's general pass, the same for every culture. Frame: vehicles-core.js (+z forward, wheels on y = 0).

   The wheels sit under the sill and the clearance check (verify.py): a steered wheel's corner at full lock
   sweeps to x = |hub| + (w/2) cos(lock) + r sin(lock) at z = hub + r cos(lock), and inward to
   z = hub - r cos(lock) - (w/2) sin(lock); the skin, the floor's edge and its riser must pass 2 cm clear of
   those points, so the sills are boxy superellipses (n 4 and over), the locks modest (0.3 to 0.38 rad) and
   the floors end short of the wheels. Every wheel has a bronze arch on the skin round it (ancArch), so it
   reads as hung from the body and not as standing under it.
   ====================================================================== */

VEHICLE_CULTURE('ancient', {
  name: 'the Ancients', sign: 'a cyan strip (no device: the Ancients signed nothing)',
  lore: 'the lost high civilisation; their ruined capital is the Ancient\'s Valley; white seamed panel, bronze bands, blue glass, cyan strips',
  /* DETAIL: palette key -> library detail family (vehicles-detail.js; materials.json); null: none (glass, lenses, the strips) */
  detail: {
    white: 'ancientWhite', whiteDark: 'ancientWhite', whiteShade: 'ancientWhite', bronze: 'bronze', bronzeDark: 'bronze',
    concrete: 'concrete', interior: 'metal', seat: 'canvas', tyre: 'rubber',
    blueGlass: null, shard: null, cyan: null, lensWarm: null, lensRed: null, lensAmber: null, glowBlue: null
  },
  /* PALETTE (sRGB; the runtime converts to linear). The metropolis kit's white (#e6e4dc) and bronze. shard: the
     dark glass left in a broken frame (the ruin pass neither rusts nor drops it: its key is not "glass") */
  palette: {
    white: 0xe6e4dc, whiteDark: 0xcfcdc3, whiteShade: 0xb4b2a8, bronze: 0x8a6a3c, bronzeDark: 0x5c4426,
    concrete: 0xa8a298, interior: 0x3c3e42, seat: 0x4a5c6c, tyre: 0x2a2826,
    blueGlass: 0x2c4c70, shard: 0x22364a, cyan: 0x5ee0f0,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, glowBlue: 0x8fd8ff
  }
});

/* ---- the Ancients' shared pieces (top-level names are private to the bundle's closure; ANC_ keeps them apart) */
const ANC_SEG = 24;
/* a small integer hash to [0, 1) for the shards' sizes (not F.rnd: the same in every state) */
function ancH(i, j) {
  let h = (Math.imul(i | 0, 73856093) ^ Math.imul((j | 0) + 1, 19349663)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/* the skin of a tub body at height y: the section interpolated between its neighbours (a, b, n, z) */
function ancSkin(secs, y) {
  if (y <= secs[0].y) return Object.assign({ z: 0 }, secs[0]);
  for (let i = 1; i < secs.length; i++) {
    const p = secs[i - 1], q = secs[i];
    if (y <= q.y) {
      const t = (y - p.y) / Math.max(1e-6, q.y - p.y);
      return { y: y, a: p.a + (q.a - p.a) * t, b: p.b + (q.b - p.b) * t, n: p.n + (q.n - p.n) * t, z: (p.z || 0) + ((q.z || 0) - (p.z || 0)) * t };
    }
  }
  return Object.assign({ z: 0 }, secs[secs.length - 1]);
}
/* a point on a section's superellipse at angle th (as F.tub lays its vertices) */
function ancPt(s, th) {
  const c = Math.cos(th), sn = Math.sin(th), e = 2 / (s.n || 2);
  return [s.a * Math.sign(c) * Math.pow(Math.abs(c), e), s.y, (s.z || 0) + s.b * Math.sign(sn) * Math.pow(Math.abs(sn), e)];
}
/* a bronze band round a tub body from y0 to y1, `out` proud of the skin */
function ancBand(F, secs, y0, y1, out, col) {
  const s0 = ancSkin(secs, y0), s1 = ancSkin(secs, y1);
  F.tub([{ y: y0, a: s0.a + out, b: s0.b + out, n: s0.n, z: s0.z }, { y: y1, a: s1.a + out, b: s1.b + out, n: s1.n, z: s1.z }], ANC_SEG, col, 'metal');
}
/* the cabin's liner: the hull's sections from y0 to y1, inset, with the faces turned inward (the interior's walls) */
function ancLiner(F, secs, y0, y1, inset) {
  const L = [ancSkin(secs, y0)];
  for (const s of secs) if (s.y > y0 + 1e-6 && s.y < y1 - 1e-6) L.push(Object.assign({ z: 0 }, s));
  L.push(ancSkin(secs, y1));
  F.tub(L.map(function (s) { return { y: s.y, a: s.a - inset, b: s.b - inset, n: s.n, z: s.z }; }), ANC_SEG, F.col('interior'), 'metal', '', true);
}
/* the canopy's posts: bronze rods from the belt section to the roof section at the angles given (so a canopy
   without its glass still reads as a cabin) */
function ancPosts(F, s0, s1, angles, r, col) {
  for (const th of angles) {
    const p = ancPt(s0, th), q = ancPt(s1, th);
    F.rod(p[0], p[1], p[2], q[0], q[1], q[2], r, col, 'metal');
  }
}
/* a glass canopy: a tub of blueGlass on the shiny material while the ruin keeps its glass; once it is gone,
   shards of dark glass standing up from the belt section and hanging from the roof section at `angles` */
function ancGlass(F, secs, angles) {
  if (!F.ruin || F.ruin.glass) { F.tub(secs, ANC_SEG, F.col('blueGlass'), 'metal'); return; }
  if (!angles) return;
  const s0 = secs[0], s1 = secs[secs.length - 1], col = F.col('shard');
  const at = function (th, t) {
    const p = ancPt(s0, th), q = ancPt(s1, th);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  };
  for (let i = 0; i < angles.length; i++) {
    const th = angles[i], w = 0.04 + 0.05 * ancH(i, 3), t = 0.12 + 0.3 * ancH(i, 5);
    if (i % 3 === 2) F.tri(at(th - w, 1), at(th + w, 1), at(th, 1 - t), col, 'metal');     /* hanging from the roof rail */
    else F.tri(at(th - w, 0), at(th, t), at(th + w, 0), col, 'metal');                     /* standing in the belt */
  }
}
/* a cyan strip (box, bottom at y): the lamp family lampBlue glows with lights(); dead in a ruin */
function ancStrip(F, x, y, z, w, h, d) { F.box(x, y, z, w, h, d, 0, F.col('cyan'), 'lampBlue'); }
/* a seat facing +z (the back at the rear): upholstered, or a charred frame when the cabin burnt */
function ancSeat(F, x, y, z, w) {
  const c = F.col, charred = F.ruin && (F.ruin.state === 'burnt' || F.ruin.state === 'wreck');
  if (charred) {
    F.box(x, y, z, w, 0.05, 0.48, 0, c('interior'), 'metal');
    F.box(x, y, z - 0.24, w, 0.5, 0.05, 0, c('interior'), 'metal');
    for (const s of [-1, 1]) F.rod(x + s * (w / 2 - 0.03), y, z + 0.2, x + s * (w / 2 - 0.03), y - 0.08, z + 0.2, 0.015, c('interior'), 'metal');
  } else {
    F.box(x, y, z, w, 0.16, 0.48, 0, c('seat'));
    F.box(x, y + 0.16, z - 0.2, w, 0.5, 0.1, 0, c('seat'));
  }
}
/* a dash across the cabin at z (bottom at y), and a yoke before the left seat */
function ancDash(F, y, z, w) {
  F.box(0, y, z, w, 0.2, 0.3, 0, F.col('whiteShade'));
  F.ring(w * 0.27, y + 0.3, z - 0.14, 0, 0.4, -1, 0.13, 0.015, F.col('bronzeDark'), 'metal', 12);
}
/* the wheel: a slick tyre, a white dish, a bronze hub */
function ancWheel(F, W, rimKey) {
  vehicleBalloonTyre({ r: W.r, w: W.w, lugs: 0, rim: W.r * 0.62, side: W.side, segs: 20,
    tyre: F.col('tyre'), rimCol: F.col(rimKey || 'whiteDark'), hubCol: F.col('bronze') });
  F.disc(W.side * W.w * 0.42, 0, 0, 1, 0, 0, W.r * 0.2, 0.03, F.col('bronzeDark'), 'metal', 10);
}
/* the arch over a wheel: a half-ring of bronze on the skin (the plane x = const, open downward), hub at (y, z) */
function ancArch(F, x, y, z, r) {
  const g = new THREE.TorusGeometry(r, 0.025, 4, 14, Math.PI);
  g.rotateY(Math.PI / 2);                                   /* the ring's plane XY -> ZY: it stands across the wheel */
  const m = new THREE.Mesh(g, mat(F.col('bronzeDark'), 'metal'));
  m.position.set(x, y, z);
  _add(m);
}
/* the running gear: for each pair of wheels at one z, an axle beam between them (ending 6 cm short of each wheel's
   inner face: a steered wheel swings about its hub, and the beam's end stays clear), and for each wheel a knuckle on
   the beam's end and an upright from it to the body above (floorAt(W): the shelf, pan or chassis over that wheel), so
   every wheel hangs from something */
function ancGear(F, floorAt) {
  const c = F.col, groups = {};
  for (const W of F.data.wheels) (groups[W.z.toFixed(3)] = groups[W.z.toFixed(3)] || []).push(W);
  for (const k of Object.keys(groups)) {
    const G = groups[k], W0 = G[0], r = W0.r, z = W0.z;
    const xin = Math.min.apply(null, G.map(function (W) { return Math.abs(W.x) - W.w / 2; })) - 0.06;
    F.rod(-xin, r, z, xin, r, z, 0.04, c('interior'), 'metal');
    for (const W of G) {
      const s = Math.sign(W.x), xk = Math.abs(W.x) - W.w / 2 - 0.06, top = floorAt(W);
      F.knob(s * xk, r, z, 0.065, c('bronzeDark'), 'metal');
      F.rod(s * xk, r - 0.04, z, s * xk, top, z, 0.035, c('interior'), 'metal');
      F.rod(s * (xk - 0.18), top, z + 0.22, s * xk, r + 0.02, z, 0.02, c('bronzeDark'), 'metal');      /* a trailing link */
    }
  }
}
/* a mudguard over an exposed wheel (the cab-over pods): a half-cylinder shell, axis along x, open downward */
function ancFender(F, W) {
  const R = W.r + 0.1, g = new THREE.CylinderGeometry(R, R, W.w + 0.16, 16, 1, true, 0, Math.PI);
  g.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(g, mat(F.col('whiteDark'), ''));
  m.position.set(W.x, W.r, W.z);
  _add(m);
  for (const s of [-1, 1]) ancArch(F, W.x + s * (W.w / 2 + 0.08), W.r, W.z, R + 0.01);
}
/* a cargo pod: a white cylinder along z with two bronze rings */
function ancPod(F, x, y, z, r, len) {
  F.disc(x, y, z, 0, 0, 1, r, len, F.col('white'), '', 14);
  for (const s of [-1, 1]) F.ring(x, y, z + s * len * 0.32, 0, 0, 1, r + 0.005, 0.02, F.col('bronze'), 'metal', 14);
  F.knob(x, y, z + len / 2 + 0.02, r * 0.3, F.col('bronzeDark'), 'metal');
}
/* the canopies' shard angles: round the belt, more at the front and the sides */
const ANC_CANOPY_ANGLES = [0.25, 0.75, 1.3, 1.85, 2.4, 2.9, 3.4, 3.95, 4.5, 5.0, 5.55, 6.05];

/* ---------------------------------------------------------------- anc_pod: the two-seat pod car */
VEHICLE({
  key: 'anc_pod', name: 'Ancient pod car', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Civic', 'Hire'],
  /* overall box: 2.1 wide (the arches), 3.3 long, 1.68 to the roof (the Hire's sign) */
  w: 2.1, d: 3.3, h: 1.68,
  /* data, not code (units: m, m/s, m/s^2, kg, kWh, km, rad) */
  data: {
    speed: 25, accel: 3.0, turnRadius: 4.2, maxSteer: 0.38, seats: 2, cargo: 80, mass: 760,
    fuel: 'battery', tank: 0, battery: 40, range: 300, drive: 'rear, hub motors', wheelbase: 1.9, track: 1.32, clearance: 0.2,
    engine: 'an Ancient cell and two hub motors',
    wheels: [
      { name: 'wheel_fl', x: 0.64, z: 0.95, r: 0.32, w: 0.2, front: true, steer: true, drive: false },
      { name: 'wheel_fr', x: -0.64, z: 0.95, r: 0.32, w: 0.2, front: true, steer: true, drive: false },
      { name: 'wheel_rl', x: 0.68, z: -0.95, r: 0.32, w: 0.2, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.68, z: -0.95, r: 0.32, w: 0.2, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}, { cargo: 60, mass: 790, trade: 'hire' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, hire = v === 1;
    const hull = [{ y: 0.22, a: 1.0, b: 1.56, n: 4.2 }, { y: 0.34, a: 1.0, b: 1.6, n: 4.2 }, { y: 0.66, a: 1.0, b: 1.62, n: 4.0 }, { y: 0.9, a: 0.9, b: 1.52, n: 3.2 }];
    F.tub(hull, ANC_SEG, c('white'), '');                                                              /* the hull, open at the belt */
    ancLiner(F, hull, 0.42, 0.9, 0.03);
    /* the cabin floor between the wheels, a riser each end, a shelf over each pair of wheels */
    F.tub([{ y: 0.38, a: 0.9, b: 0.54, n: 4.0, z: 0.01 }, { y: 0.42, a: 0.9, b: 0.54, n: 4.0, z: 0.01 }], ANC_SEG, c('whiteShade'), '', 'both');
    for (const s of [-1, 1]) {
      F.box(0, 0.42, s * 0.545, 1.78, 0.28, 0.03, 0, c('whiteShade'));
      F.tub([{ y: 0.68, a: 0.95, b: 0.52, n: 4.0, z: s * 1.08 }, { y: 0.72, a: 0.95, b: 0.52, n: 4.0, z: s * 1.08 }], 16, c('whiteShade'), '', 'both');
    }
    ancBand(F, hull, 0.88, 0.94, 0.015, c('bronze'));
    for (const W of F.data.wheels) ancArch(F, Math.sign(W.x) * 1.02, W.r, W.z, W.r + 0.08);
    ancGear(F, function () { return 0.68; });
    const canopy = [{ y: 0.92, a: 0.86, b: 1.46, n: 3.0 }, { y: 1.17, a: 0.74, b: 1.22, n: 3.0 }, { y: 1.42, a: 0.5, b: 0.84, n: 3.0 }, { y: 1.54, a: 0.3, b: 0.5, n: 3.0 }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[3], [0.6, 2.54, 3.74, 5.68, Math.PI / 2, -Math.PI / 2], 0.018, c('bronzeDark'));
    F.tub([{ y: 1.54, a: 0.31, b: 0.51, n: 3.0 }, { y: 1.62, a: 0.26, b: 0.44, n: 3.0 }], ANC_SEG, c(hire ? 'bronze' : 'white'), hire ? 'metal' : '', 'top');   /* the roof */
    if (hire) F.box(0, 1.62, 0, 0.42, 0.04, 0.22, 0, c('cyan'), 'lampBlue');                             /* the hire sign */
    /* the cabin: two seats on the low floor, the dash on the front shelf */
    for (const s of [-1, 1]) ancSeat(F, s * 0.38, 0.42, 0.1, 0.5);
    ancDash(F, 0.72, 0.92, 1.1);
    /* the face: a cyan strip across the nose, slit headlamps, tail lamps; the sill strips */
    ancStrip(F, 0, 0.5, 1.63, 0.9, 0.03, 0.02);
    for (const s of [-1, 1]) {
      F.lamp(s * 0.5, 0.64, 1.6, 0, 0, 1, 0.06, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 0.55, 0.62, -1.56, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
      ancStrip(F, s * 1.012, 0.38, 0, 0.02, 0.03, 1.1);
    }
  }
});

/* ---------------------------------------------------------------- anc_saloon: the long low saloon */
VEHICLE({
  key: 'anc_saloon', name: 'Ancient saloon', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 4, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Saloon', 'Statesman'],
  /* overall box: 2.4 wide (the arches), 6.0 long, 1.56 to the roof */
  w: 2.4, d: 6.0, h: 1.56,
  data: {
    speed: 38, accel: 3.5, turnRadius: 7.5, maxSteer: 0.32, seats: 4, cargo: 220, mass: 1650,
    fuel: 'battery', tank: 0, battery: 110, range: 600, drive: 'all four, hub motors', wheelbase: 3.9, track: 1.4, clearance: 0.18,
    engine: 'an Ancient cell and four hub motors',
    wheels: [
      { name: 'wheel_fl', x: 0.7, z: 1.95, r: 0.36, w: 0.24, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -0.7, z: 1.95, r: 0.36, w: 0.24, front: true, steer: true, drive: true },
      { name: 'wheel_rl', x: 0.7, z: -1.95, r: 0.36, w: 0.24, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.7, z: -1.95, r: 0.36, w: 0.24, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}, { seats: 4, cargo: 180, mass: 1780, trade: 'state' }],
  wheel: function (F, W) { ancWheel(F, W, F.variant === 1 ? 'bronze' : 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, states = v === 1;
    const hull = [{ y: 0.18, a: 1.1, b: 2.82, n: 4.4 }, { y: 0.3, a: 1.14, b: 2.92, n: 4.6 }, { y: 0.66, a: 1.14, b: 2.94, n: 4.4 }, { y: 0.86, a: 1.06, b: 2.86, n: 3.6 }];
    F.tub(hull, ANC_SEG, c('white'), '');
    ancLiner(F, hull, 0.44, 0.86, 0.03);
    /* the cabin floor between the axles, risers, the bonnet and boot shelves over the wheels */
    F.tub([{ y: 0.4, a: 1.04, b: 0.98, n: 4.4, z: 0.05 }, { y: 0.44, a: 1.04, b: 0.98, n: 4.4, z: 0.05 }], ANC_SEG, c('whiteShade'), '', 'both');
    for (const s of [-1, 1]) {
      F.box(0, 0.44, 0.05 + s * 0.985, 2.06, 0.34, 0.03, 0, c('whiteShade'));
      F.tub([{ y: 0.76, a: 1.08, b: 0.9, n: 4.4, z: s * 1.95 }, { y: 0.8, a: 1.08, b: 0.9, n: 4.4, z: s * 1.95 }], 16, c('whiteShade'), '', 'both');
    }
    ancBand(F, hull, 0.84, 0.9, 0.015, c('bronze'));
    for (const W of F.data.wheels) ancArch(F, Math.sign(W.x) * 1.16, W.r, W.z, W.r + 0.08);
    ancGear(F, function () { return 0.76; });
    const canopy = [{ y: 0.88, a: 0.95, b: 1.35, n: 3.2, z: 0.15 }, { y: 1.12, a: 0.86, b: 1.2, n: 3.2, z: 0.15 }, { y: 1.34, a: 0.7, b: 0.95, n: 3.2, z: 0.1 }, { y: 1.46, a: 0.55, b: 0.78, n: 3.2, z: 0.1 }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[3], [0.5, 2.64, 3.64, 5.78, Math.PI / 2, -Math.PI / 2], 0.018, c('bronzeDark'));
    F.tub([{ y: 1.46, a: 0.56, b: 0.79, n: 3.2, z: 0.1 }, { y: 1.52, a: 0.5, b: 0.72, n: 3.2, z: 0.1 }], ANC_SEG, c(states ? 'bronze' : 'white'), states ? 'metal' : '', 'top');
    if (states) F.box(0, 0.9, 1.9, 0.08, 0.015, 1.6, 0, c('bronze'), 'metal');                        /* a bronze spine down the bonnet */
    /* the cabin: two rows on the low floor, the dash on the bonnet shelf */
    for (const s of [-1, 1]) { ancSeat(F, s * 0.4, 0.44, 0.5, 0.5); ancSeat(F, s * 0.4, 0.44, -0.45, 0.5); }
    ancDash(F, 0.8, 1.22, 1.3);
    /* the fins and the face */
    for (const s of [-1, 1]) {
      F.box(s * 0.94, 0.86, -2.55, 0.05, 0.2, 0.6, 0, c('bronze'), 'metal');
      F.lamp(s * 0.94, 0.96, -2.86, 0, 0, -1, 0.045, 'tail', null, c('bronzeDark'));
      F.lamp(s * 0.6, 0.62, 2.95, 0, 0, 1, 0.06, 'head', c('bronzeDark'), c('bronze'));
      ancStrip(F, s * 1.155, 0.34, 0, 0.02, 0.03, 2.6);
    }
    ancStrip(F, 0, 0.5, 2.97, 1.3, 0.03, 0.02);
  }
});

/* ---------------------------------------------------------------- anc_van: the delivery van (a cab pod before a box) */
VEHICLE({
  key: 'anc_van', name: 'Ancient delivery van', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'cargo', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Van', 'Courier'],
  /* overall box: 2.5 wide (the arches), 6.0 long (the cab pod's nose strip to the door ribs), 2.5 to the box's roof (the
     Courier's roof pod 2.75) */
  w: 2.5, d: 6.0, h: 2.8,
  data: {
    speed: 28, accel: 2.0, turnRadius: 7.2, maxSteer: 0.35, seats: 2, cargo: 1600, mass: 2600,
    fuel: 'battery', tank: 0, battery: 160, range: 450, drive: 'rear, hub motors', wheelbase: 3.5, track: 1.44, clearance: 0.25,
    engine: 'an Ancient cell and two hub motors',
    wheels: [
      { name: 'wheel_fl', x: 0.72, z: 1.75, r: 0.42, w: 0.24, front: true, steer: true, drive: false },
      { name: 'wheel_fr', x: -0.72, z: 1.75, r: 0.42, w: 0.24, front: true, steer: true, drive: false },
      { name: 'wheel_rl', x: 0.72, z: -1.75, r: 0.42, w: 0.24, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.72, z: -1.75, r: 0.42, w: 0.24, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}, { cargo: 1200, mass: 2750, trade: 'courier' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, courier = v === 1, bz = -0.9, cz = 1.95;
    /* the box: a tall rounded body over the rear wheels, closed; its front wall is the cab's bulkhead */
    const box = [{ y: 0.25, a: 1.14, b: 1.85, n: 4.4, z: bz }, { y: 0.5, a: 1.2, b: 1.85, n: 4.6, z: bz }, { y: 1.7, a: 1.2, b: 1.85, n: 4.6, z: bz }, { y: 2.25, a: 1.1, b: 1.78, n: 4.2, z: bz }, { y: 2.5, a: 0.9, b: 1.6, n: 4.0, z: bz }];
    F.tub(box, ANC_SEG, c('white'), '', 'top');
    F.tub([{ y: 0.88, a: 1.16, b: 1.8, n: 4.6, z: bz }, { y: 0.92, a: 1.16, b: 1.8, n: 4.6, z: bz }], ANC_SEG, c('whiteShade'), '', 'both');
    ancBand(F, box, 1.18, 1.24, 0.015, c('bronze'));
    ancBand(F, box, 2.24, 2.28, 0.012, c('bronzeDark'));
    /* the cab pod before it, over the front wheels (a cab-over), hollow: a floor, a liner, the seats under the canopy */
    const cab = [{ y: 0.9, a: 1.14, b: 1.0, n: 3.6, z: cz }, { y: 1.2, a: 1.18, b: 1.02, n: 3.6, z: cz }, { y: 1.45, a: 1.12, b: 0.98, n: 3.4, z: cz }];
    F.tub(cab, ANC_SEG, c('white'), '');
    F.tub([{ y: 0.88, a: 1.1, b: 0.96, n: 3.6, z: cz }, { y: 0.92, a: 1.1, b: 0.96, n: 3.6, z: cz }], ANC_SEG, c('whiteShade'), '', 'both');
    ancLiner(F, cab, 0.92, 1.45, 0.03);
    ancBand(F, cab, 1.43, 1.49, 0.015, c('bronze'));
    const canopy = [{ y: 1.47, a: 1.1, b: 0.96, n: 3.4, z: cz }, { y: 1.8, a: 0.95, b: 0.82, n: 3.4, z: cz }, { y: 2.1, a: 0.7, b: 0.6, n: 3.4, z: cz }, { y: 2.22, a: 0.45, b: 0.4, n: 3.4, z: cz }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[3], [0.6, 2.54, 3.74, 5.68, Math.PI / 2, -Math.PI / 2], 0.02, c('bronzeDark'));
    F.tub([{ y: 2.22, a: 0.46, b: 0.41, n: 3.4, z: cz }, { y: 2.3, a: 0.4, b: 0.35, n: 3.4, z: cz }], ANC_SEG, c('white'), '', 'top');
    for (const s of [-1, 1]) ancSeat(F, s * 0.5, 0.92, cz - 0.15, 0.5);
    ancDash(F, 0.94, cz + 0.6, 1.5);
    for (const W of F.data.wheels) if (W.z < 0) ancArch(F, Math.sign(W.x) * 1.21, W.r, W.z, W.r + 0.08); else ancFender(F, W);
    ancGear(F, function () { return 0.88; });
    for (const s of [-1, 1]) F.rod(s * 0.5, 0.8, 0.95, s * 0.5, 0.8, 2.4, 0.04, c('interior'), 'metal');   /* the frame rails under the cab */
    /* the roller door at the back: bronze ribs */
    for (let i = 0; i < 10; i++) F.box(0, 1.05 + i * 0.135, bz - 1.855, 1.5, 0.1, 0.02, 0, i % 2 ? c('bronzeDark') : c('bronze'), 'metal');
    F.box(0, 1.0, bz - 1.86, 1.6, 0.04, 0.03, 0, c('bronzeDark'), 'metal');
    /* the face and the sills */
    for (const s of [-1, 1]) {
      F.lamp(s * 0.7, 1.1, cz + 0.99, 0, 0, 1, 0.065, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 0.82, 1.0, bz - 1.86, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
      ancStrip(F, s * 1.205, 0.42, bz, 0.02, 0.03, 2.2);
      ancStrip(F, s * 1.185, 0.96, cz, 0.02, 0.03, 1.2);
    }
    ancStrip(F, 0, 0.98, cz + 1.01, 1.4, 0.03, 0.02);
    if (courier) {                                                                                      /* the Courier's roof pod and its cyan band */
      F.tub([{ y: 2.5, a: 0.5, b: 1.0, n: 3.0, z: bz }, { y: 2.65, a: 0.46, b: 0.9, n: 3.0, z: bz }, { y: 2.74, a: 0.3, b: 0.6, n: 3.0, z: bz }], 16, c('white'), '', 'top');
      ancStrip(F, 0, 2.54, bz + 1.02, 0.6, 0.03, 0.02);
    } else {
      for (let i = 0; i < 3; i++) F.box(-0.5 + i * 0.5, 0.92, -1.9 + (i % 2) * 0.3, 0.42, 0.4, 0.42, 0, c('whiteDark'));   /* crates aboard */
    }
  }
});

/* ---------------------------------------------------------------- anc_utility: the six-wheeled utility */
VEHICLE({
  key: 'anc_utility', name: 'Ancient six-wheeled utility', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'utility', 'patrol'], drive: 'wheeled', seats: 3, fuel: 'battery',
    terrain: ['road', 'track', 'rock'], setting: 'outdoor' },
  variants: 2, variantNames: ['Works', 'Patrol'],
  /* overall box: 2.55 wide, 6.2 long, 2.6 to the Patrol's dish */
  w: 2.55, d: 6.2, h: 2.6,
  data: {
    speed: 24, accel: 1.8, turnRadius: 8.5, maxSteer: 0.3, seats: 3, cargo: 1800, mass: 4200,
    fuel: 'battery', tank: 0, battery: 260, range: 500, drive: 'all six, hub motors', wheelbase: 3.85, track: 1.6, clearance: 0.3,
    engine: 'an Ancient cell and six hub motors',
    wheels: [
      { name: 'wheel_fl', x: 0.8, z: 1.95, r: 0.48, w: 0.28, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -0.8, z: 1.95, r: 0.48, w: 0.28, front: true, steer: true, drive: true },
      { name: 'wheel_l2', x: 0.8, z: -0.3, r: 0.48, w: 0.28, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -0.8, z: -0.3, r: 0.48, w: 0.28, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 0.8, z: -1.9, r: 0.48, w: 0.28, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.8, z: -1.9, r: 0.48, w: 0.28, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}, { cargo: 900, mass: 4400, armament: 'none; a lamp bar and a dish' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, patrol = v === 1;
    const hull = [{ y: 0.3, a: 1.22, b: 2.95, n: 4.8 }, { y: 0.55, a: 1.26, b: 3.05, n: 4.8 }, { y: 1.0, a: 1.26, b: 3.05, n: 4.6 }, { y: 1.2, a: 1.18, b: 2.96, n: 3.8 }];
    F.tub(hull, ANC_SEG, c('white'), '', 'top');                                                      /* the hull; its cap is the deck */
    F.tub([{ y: 1.0, a: 1.22, b: 3.0, n: 4.6 }, { y: 1.04, a: 1.22, b: 3.0, n: 4.6 }], ANC_SEG, c('whiteShade'), '', 'bottom');
    ancBand(F, hull, 1.18, 1.24, 0.015, c('bronze'));
    for (const W of F.data.wheels) ancArch(F, Math.sign(W.x) * 1.27, W.r, W.z, W.r + 0.08);
    ancGear(F, function () { return 1.0; });
    /* the cab pod forward on the deck, hollow */
    const cab = [{ y: 1.2, a: 1.0, b: 1.0, n: 3.4, z: 1.75 }, { y: 1.55, a: 1.0, b: 0.98, n: 3.4, z: 1.75 }];
    F.tub(cab, ANC_SEG, c('white'), '');
    ancLiner(F, cab, 1.2, 1.55, 0.03);
    const canopy = [{ y: 1.55, a: 0.98, b: 0.96, n: 3.4, z: 1.75 }, { y: 1.9, a: 0.82, b: 0.8, n: 3.4, z: 1.75 }, { y: 2.1, a: 0.6, b: 0.6, n: 3.4, z: 1.75 }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[2], [0.7, 2.44, 3.84, 5.58], 0.02, c('bronzeDark'));
    F.tub([{ y: 2.1, a: 0.61, b: 0.61, n: 3.4, z: 1.75 }, { y: 2.2, a: 0.52, b: 0.52, n: 3.4, z: 1.75 }], ANC_SEG, c('white'), '', 'top');
    ancBand(F, cab, 1.53, 1.57, 0.012, c('bronzeDark'));
    for (const s of [-1, 1]) ancSeat(F, s * 0.36, 1.2, 1.65, 0.42);
    ancSeat(F, 0, 1.2, 1.2, 0.42);
    ancDash(F, 1.22, 2.3, 1.3);
    /* the open bay behind the cab: a bronze cage, two tanks, a locker */
    const px = 1.0, pz0 = 0.55, pz1 = -2.65, py = 1.2, ph = 1.95;
    for (const s of [-1, 1]) {
      for (const z of [pz0, pz1]) F.rod(s * px, py, z, s * px, ph, z, 0.03, c('bronze'), 'metal');
      F.rod(s * px, ph, pz0, s * px, ph, pz1, 0.03, c('bronze'), 'metal');
      F.rod(s * px, py + 0.4, pz0, s * px, py + 0.4, pz1, 0.02, c('bronzeDark'), 'metal');
    }
    for (const z of [pz0, pz1, (pz0 + pz1) / 2]) F.rod(-px, ph, z, px, ph, z, 0.03, c('bronze'), 'metal');
    for (const s of [-1, 1]) {
      F.disc(s * 0.52, 1.55, -1.1, 0, 0, 1, 0.34, 2.2, c('white'), '', 14);
      for (const z of [-1.9, -0.3]) F.ring(s * 0.52, 1.55, z, 0, 0, 1, 0.345, 0.02, c('bronze'), 'metal', 14);
      F.knob(s * 0.52, 1.55, 0.02, 0.1, c('bronzeDark'), 'metal');
    }
    F.box(0, 1.2, -2.35, 1.6, 0.5, 0.5, 0, c('whiteDark'));
    /* the face, the sills, the Patrol's bar and dish */
    for (const s of [-1, 1]) {
      F.lamp(s * 0.7, 1.45, 2.72, 0, 0, 1, 0.065, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 0.8, 0.8, -2.95, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
      ancStrip(F, s * 1.265, 0.62, -1.1, 0.02, 0.03, 1.2);
    }
    ancStrip(F, 0, 1.25, 2.76, 1.3, 0.03, 0.02);
    if (patrol) {
      F.rod(-0.5, 2.2, 1.75, 0.5, 2.2, 1.75, 0.02, c('bronzeDark'), 'metal');
      for (const x of [-0.36, 0, 0.36]) F.lamp(x, 2.31, 1.78, 0, 0.15, 1, 0.055, 'amber', c('bronzeDark'), null);
      F.rod(0.6, 1.95, -2.4, 0.6, 2.25, -2.4, 0.015, c('bronzeDark'), 'metal');
      F.taper(0.6, 2.25, -2.4, 0, 0.6, 0.8, 0.04, 0.3, 0.12, c('whiteDark'), 'metal', 12);
    }
  }
});

/* ---------------------------------------------------------------- anc_hauler: the flatbed hauler */
VEHICLE({
  key: 'anc_hauler', name: 'Ancient flatbed hauler', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'cargo', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Flatbed', 'Laden'],
  /* overall box: 2.75 wide, 9.2 long, 2.8 to the cab roof */
  w: 2.75, d: 9.2, h: 2.8,
  budget: { tris: 7500 },
  data: {
    speed: 22, accel: 1.2, turnRadius: 9.5, maxSteer: 0.38, seats: 2, cargo: 9000, mass: 9800,
    fuel: 'battery', tank: 0, battery: 420, range: 420, drive: 'rear four, hub motors', wheelbase: 5.45, track: 2.1, clearance: 0.45,
    engine: 'an Ancient cell and four hub motors',
    wheels: [
      { name: 'wheel_fl', x: 0.95, z: 3.3, r: 0.5, w: 0.3, front: true, steer: true, drive: false },
      { name: 'wheel_fr', x: -0.95, z: 3.3, r: 0.5, w: 0.3, front: true, steer: true, drive: false },
      { name: 'wheel_l2', x: 1.05, z: -1.5, r: 0.55, w: 0.32, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -1.05, z: -1.5, r: 0.55, w: 0.32, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 1.05, z: -2.8, r: 0.55, w: 0.32, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.05, z: -2.8, r: 0.55, w: 0.32, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}, { cargo: 2400, mass: 16400, load: 'four cargo pods and a crate' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, laden = v === 1, cz = 3.1;
    /* the cab pod over the front wheels (its sill above them: a cab-over), hollow: a floor, a liner, seats under the canopy */
    const cab = [{ y: 1.05, a: 1.28, b: 1.15, n: 3.4, z: cz }, { y: 1.45, a: 1.32, b: 1.2, n: 3.6, z: cz }, { y: 1.9, a: 1.22, b: 1.1, n: 3.6, z: cz }];
    F.tub(cab, ANC_SEG, c('white'), '');
    F.tub([{ y: 1.04, a: 1.2, b: 1.1, n: 3.4, z: cz }, { y: 1.08, a: 1.2, b: 1.1, n: 3.4, z: cz }], ANC_SEG, c('whiteShade'), '', 'both');
    ancLiner(F, cab, 1.08, 1.9, 0.03);
    ancBand(F, cab, 1.88, 1.94, 0.015, c('bronze'));
    for (const W of F.data.wheels.slice(0, 2)) ancFender(F, W);
    ancGear(F, function (W) { return W.z > 0 ? 1.04 : 0.62; });
    const canopy = [{ y: 1.92, a: 1.18, b: 1.08, n: 3.4, z: cz }, { y: 2.25, a: 1.05, b: 0.95, n: 3.4, z: cz }, { y: 2.5, a: 0.85, b: 0.78, n: 3.4, z: cz }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[2], [0.7, 2.44, 3.84, 5.58, Math.PI / 2, -Math.PI / 2], 0.02, c('bronzeDark'));
    F.tub([{ y: 2.5, a: 0.86, b: 0.79, n: 3.4, z: cz }, { y: 2.6, a: 0.78, b: 0.7, n: 3.4, z: cz }], ANC_SEG, c('white'), '', 'top');
    for (const s of [-1, 1]) ancSeat(F, s * 0.45, 1.08, cz - 0.15, 0.5);
    ancDash(F, 1.1, cz + 0.62, 1.6);
    /* the chassis and the bed: a board-formed composite deck on a white spine, bronze rails and stakes, a skirt
       over the rear wheels */
    F.tub([{ y: 0.6, a: 0.78, b: 3.45, n: 4.0, z: -0.85 }, { y: 1.14, a: 0.8, b: 3.5, n: 4.0, z: -0.85 }], 16, c('white'), '', 'bottom');   /* the spine, under the cab too */
    F.box(0, 1.14, -1.35, 2.5, 0.14, 6.3, 0, c('concrete'));
    for (const s of [-1, 1]) {
      F.box(s * 1.27, 1.28, -1.35, 0.06, 0.08, 6.3, 0, c('bronze'), 'metal');
      for (const z of [1.5, -0.4, -2.3, -4.2]) F.box(s * 1.25, 1.28, z, 0.08, 0.5, 0.08, 0, c('bronze'), 'metal');
      F.box(s * 1.28, 0.6, -2.15, 0.04, 0.54, 2.5, 0, c('white'));                                   /* the skirt over the rear wheels */
      for (const W of F.data.wheels.slice(2)) if (Math.sign(W.x) === s) ancArch(F, s * 1.305, W.r, W.z, W.r + 0.08);
      ancStrip(F, s * 1.3, 1.18, -1.35, 0.02, 0.03, 5.8);
      ancStrip(F, s * 1.305, 1.12, cz, 0.02, 0.03, 1.6);
      F.lamp(s * 0.85, 1.45, cz + 1.18, 0, 0, 1, 0.07, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 1.0, 1.0, -4.52, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
    }
    F.box(0, 0.95, -4.5, 2.4, 0.12, 0.08, 0, c('bronzeDark'), 'metal');                                /* the rear sill */
    ancStrip(F, 0, 1.3, cz + 1.2, 1.6, 0.03, 0.02);
    if (laden) {
      for (const x of [-0.6, 0.6]) for (const z of [-0.2, -2.75]) ancPod(F, x, 1.78, z, 0.5, 1.9);
      F.box(0, 1.28, 1.3, 1.2, 0.6, 0.7, 0, c('whiteDark'));
    }
  }
});

/* ---------------------------------------------------------------- anc_tram: the guideway tram-car */
VEHICLE({
  key: 'anc_tram', name: 'Ancient guideway tram-car', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 40, fuel: 'battery',
    terrain: ['road', 'track'], setting: 'outdoor' },
  variants: 1, variantNames: ['Tram-car'],
  /* overall box: 2.95 wide (the hoops stand proud), 13.4 long, 3.5 to the roof */
  w: 2.95, d: 13.4, h: 3.5,
  budget: { tris: 7500 },
  data: {
    speed: 20, accel: 1.0, turnRadius: 0, maxSteer: 0, steering: 'guided (the viaduct guideway); no wheel steers', seats: 40, standing: 30, cargo: 0, mass: 18000,
    fuel: 'battery', tank: 0, battery: 600, range: 0, drive: 'all eight, hub motors; the guideway feeds it', wheelbase: 9.6, track: 2.0, clearance: 0.3,
    engine: 'eight hub motors on the guideway\'s power',
    wheels: [
      { name: 'wheel_fl', x: 1.0, z: 5.6, r: 0.5, w: 0.24, front: true, steer: false, drive: true },
      { name: 'wheel_fr', x: -1.0, z: 5.6, r: 0.5, w: 0.24, front: true, steer: false, drive: true },
      { name: 'wheel_l2', x: 1.0, z: 4.0, r: 0.5, w: 0.24, front: true, steer: false, drive: true },
      { name: 'wheel_r2', x: -1.0, z: 4.0, r: 0.5, w: 0.24, front: true, steer: false, drive: true },
      { name: 'wheel_l3', x: 1.0, z: -4.0, r: 0.5, w: 0.24, front: false, steer: false, drive: true },
      { name: 'wheel_r3', x: -1.0, z: -4.0, r: 0.5, w: 0.24, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 1.0, z: -5.6, r: 0.5, w: 0.24, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.0, z: -5.6, r: 0.5, w: 0.24, front: false, steer: false, drive: true }
    ]
  },
  variantData: [{}],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col;
    const body = [{ y: 0.55, a: 1.3, b: 6.5, n: 4.5 }, { y: 0.95, a: 1.38, b: 6.6, n: 5.0 }, { y: 2.4, a: 1.38, b: 6.6, n: 5.0 }, { y: 3.05, a: 1.28, b: 6.45, n: 4.5 }, { y: 3.4, a: 0.95, b: 6.0, n: 4.0 }];
    F.tub(body, ANC_SEG, c('white'), '', 'top');
    F.tub([{ y: 1.04, a: 1.34, b: 6.55, n: 5.0 }, { y: 1.08, a: 1.34, b: 6.55, n: 5.0 }], ANC_SEG, c('whiteShade'), '', 'both');
    ancLiner(F, body, 1.08, 3.3, 0.03);                                                                  /* the saloon's walls and ceiling */
    for (const W of F.data.wheels) ancArch(F, Math.sign(W.x) * 1.39, W.r, W.z, W.r + 0.08);
    ancGear(F, function () { return 1.04; });
    /* the window ribbon all round, a hair proud of the skin, its bronze mullions and rails; shards along both
       sides once it is gone */
    const ribbon = [{ y: 1.6, a: 1.392, b: 6.612, n: 5.0 }, { y: 2.5, a: 1.392, b: 6.612, n: 5.0 }];
    const shardAngles = [];
    for (const t of [0.006, 0.02, 0.05, 0.1, 0.18, 0.3, 0.45, 0.65, 0.9]) for (const s of [1, -1]) { shardAngles.push(s > 0 ? t : Math.PI - t); shardAngles.push(s > 0 ? -t : Math.PI + t); }
    ancGlass(F, ribbon, shardAngles);
    for (const s of [-1, 1]) {
      for (let z = -6.0; z <= 6.01; z += 1.2) F.rod(s * 1.396, 1.6, z, s * 1.396, 2.5, z, 0.015, c('bronzeDark'), 'metal');
      for (const x of [-0.5, 0.5]) F.rod(x, 1.6, s * 6.62, x, 2.5, s * 6.62, 0.015, c('bronzeDark'), 'metal');
    }
    ancBand(F, body, 1.56, 1.6, 0.014, c('bronzeDark'));
    ancBand(F, body, 2.5, 2.54, 0.014, c('bronzeDark'));
    /* the hoops where the structure transfers (one every 3.6 m, the towers' storey), following the shoulder */
    for (const z of [-5.4, -1.8, 1.8, 5.4]) {
      for (const s of [-1, 1]) {
        F.beam(s * 1.41, 0.52, z, s * 1.41, 3.02, z, 0.1, 0.08, c('bronze'), 'metal');
        F.beam(s * 1.41, 3.02, z, s * 1.3, 3.1, z, 0.1, 0.08, c('bronze'), 'metal');
        F.beam(s * 1.3, 3.1, z, s * 0.97, 3.44, z, 0.1, 0.08, c('bronze'), 'metal');
      }
      F.beam(-0.97, 3.44, z, 0.97, 3.44, z, 0.1, 0.08, c('bronze'), 'metal');
      F.beam(-1.41, 0.52, z, 1.41, 0.52, z, 0.1, 0.08, c('bronze'), 'metal');
    }
    /* the doors (two a side) with a cyan edge, the sill and roof strips, the guide skids under the floor */
    for (const s of [-1, 1]) {
      for (const z of [-2.8, 2.8]) {
        F.box(s * 1.385, 1.1, z, 0.02, 1.95, 1.3, 0, c('bronzeDark'), 'metal');
        ancStrip(F, s * 1.392, 1.12, z, 0.012, 1.9, 0.04);
      }
      ancStrip(F, s * 1.395, 0.65, 0, 0.02, 0.03, 11.0);
      ancStrip(F, s * 1.3, 3.1, 0, 0.03, 0.03, 11.0);
      F.lamp(s * 0.7, 1.2, 6.62, 0, 0, 1, 0.07, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 0.7, 1.2, -6.62, 0, 0, -1, 0.07, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 1.0, 0.85, 6.6, 0, 0, 1, 0.045, 'tail', null, c('bronzeDark'));
      F.lamp(s * 1.0, 0.85, -6.6, 0, 0, -1, 0.045, 'tail', null, c('bronzeDark'));
    }
    for (const z of [-4.8, 4.8]) F.box(0, 0.3, z, 0.5, 0.42, 0.5, 0, c('bronzeDark'), 'metal');
    /* the saloon: ten rows of double seats either side of the aisle */
    for (let i = 0; i < 10; i++) {
      const z = -4.95 + i * 1.1;
      for (const s of [-1, 1]) ancSeat(F, s * 0.78, 1.08, z, 0.9);
    }
  }
});
