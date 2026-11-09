/* ======================================================================
   Krator Motor Vehicles: the Ancients (kits/motor-vehicles/krator-vehicles-ancient.js)

   The Ancients (LORE.md 4): the lost high civilisation whose works every culture lives in. Their house
   style is the metropolis kit's (kits/metropolis/PLAN.md 2, "The family": Cyclopean, Modernist, Organic;
   late Gaudi, Goldberg, Moebius, Soleri): white seamed panel, board-formed concrete at the root, a bronze
   band where the structure transfers, blue glass, cyan strips. On the road that is a smooth monocoque
   body (F.tub: stacked superellipse sections), the wheels under the sill in flared wheel wells, no exposed
   engine (Ancient cells: fuel 'battery'), a bronze belt band at the waist, a blue-glass canopy on bronze
   posts, a cyan strip along the sill and across the nose (a lamp family: it glows with lights()).

   Ten vehicles, for the Ancient's Valley's streets (biomes/ancientsvalley: a thousand-year-old war zone,
   every vehicle rusted, many burnt), where they are built in the kit's RUIN STATES (vehicles-core.js
   vehicleRuin; krator-vehicles-runtime.js: KV.build(key, { state: 'weathered' | 'burnt' | 'wreck' })):
     anc_pod       a two-seat pod car                       2.1 x 3.3 m
     anc_saloon    a long low four-seat saloon              2.4 x 6.0 m
     anc_police    the saloon as the watch's car            2.4 x 6.0 m
     anc_van       a delivery van: a cab pod, a box         2.5 x 6.0 m
     anc_utility   a six-wheeled utility, open bay          2.55 x 6.2 m
     anc_hauler    a flatbed hauler, six wheels, four loads 2.75 x 9.2 m
     anc_tram      a guideway tram-car, forty seats         2.95 x 13.4 m
     anc_tank      a tracked tank with an energy lance      3.6 x 11.6 m
     anc_heli      a helicopter on tricycle gear            10.6 x 14.2 m
     anc_jet       a passenger jet on tricycle gear         26 x 32 m

   THE CABINS ARE HOLLOW. A hull tub is open at the belt (no top cap); inside it an inward-facing liner
   (ancLiner: F.tub's `inside`) gives the cabin walls, a low floor sits between shelves over the wheels, and
   the seats, dash and yoke stand on that floor under the canopy, inside it. A cab pod on a deck (the
   utility, the hauler, the van) is the same without the shelves: its floor is the pod's pan. The tram's
   liner is two bands, below and above its window ribbon, so the car is open through its windows.
   Each build reads F.ruin: the glass is drawn only when F.ruin.glass (the runtime would drop it anyway;
   not drawing it saves the triangles), and when it is gone the frames stay and SHARDS of dark glass are
   left standing in them (ancGlass: the glazing reads as broken out, not as an opening onto a wall); the
   cabin's seats are charred frames when burnt or wrecked; a wreck's tank turret is knocked round and its
   lance droops (gone when exploded), a wrecked helicopter's blades droop and one is gone, a wrecked jet
   has one wing torn off and lying beside it. Nothing here draws from F.rnd, so the intact and the ruined
   builds of one seed are one vehicle. The rust, soot, sag and the wreck's shape are the runtime's general
   pass, the same for every culture. Frame: vehicles-core.js (+z forward, wheels on y = 0).

   The wheels sit under the sill and the clearance check (verify.py): a steered wheel's corner at full lock
   sweeps to x = |hub| + (w/2) cos(lock) + r sin(lock) at z = hub + r cos(lock), and inward to
   z = hub - r cos(lock) - (w/2) sin(lock); the skin, the floor's edge and its riser must pass 2 cm clear of
   those points, so the sills are boxy superellipses (n 4 and over), the locks modest (0.3 to 0.38 rad) and
   the floors end short of the wheels. Every wheel hangs from running gear (ancGear: a beam axle, a knuckle,
   an upright, a trailing link) and sits in a flared well on the skin (ancFlare) or under a mudguard
   (ancFender: the cab-over wheels, the aircraft). The aircraft, the tank and the tram steer nothing
   (maxSteer 0): a host places them.
   ====================================================================== */

VEHICLE_CULTURE('ancient', {
  name: 'the Ancients', sign: 'a cyan strip (no device: the Ancients signed nothing)',
  lore: 'the lost high civilisation; their ruined capital is the Ancient\'s Valley; white seamed panel, bronze bands, blue glass, cyan strips',
  /* DETAIL: palette key -> library detail family (vehicles-detail.js; materials.json); null: none (glass, lenses, the strips) */
  detail: {
    white: 'ancientWhite', whiteDark: 'ancientWhite', whiteShade: 'ancientWhite', bronze: 'bronze', bronzeDark: 'bronze',
    concrete: 'concrete', interior: 'metal', seat: 'canvas', tyre: 'rubber', crate: 'wood', drum: 'paintWorn', earth: 'concrete',
    blueGlass: null, shard: null, cyan: null, lensWarm: null, lensRed: null, lensAmber: null, glowBlue: null
  },
  /* PALETTE (sRGB; the runtime converts to linear). The metropolis kit's white (#e6e4dc) and bronze. shard: the
     dark glass left in a broken frame (the ruin pass neither rusts nor drops it: its key is not "glass") */
  palette: {
    white: 0xe6e4dc, whiteDark: 0xcfcdc3, whiteShade: 0xb4b2a8, bronze: 0x8a6a3c, bronzeDark: 0x5c4426,
    concrete: 0xa8a298, interior: 0x3c3e42, seat: 0x4a5c6c, tyre: 0x2a2826, crate: 0x8a7a5a, drum: 0x9aa0a4, earth: 0x5a4e40,
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
function ancGlass(F, secs, angles, big) {
  if (!F.ruin || F.ruin.glass) { F.tub(secs, ANC_SEG, F.col('blueGlass'), 'metal'); return; }
  if (!angles) return;
  const s0 = secs[0], s1 = secs[secs.length - 1], col = F.col('shard'), k = big ? 1.6 : 1;
  const at = function (th, t) {
    const p = ancPt(s0, th), q = ancPt(s1, th);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  };
  for (let i = 0; i < angles.length; i++) {
    const th = angles[i], w = (0.04 + 0.05 * ancH(i, 3)) / k, t = (0.12 + 0.3 * ancH(i, 5)) * k;
    if (i % 3 === 2) F.tri(at(th - w, 1), at(th + w, 1), at(th, 1 - t), col, 'metal');     /* hanging from the roof rail */
    else F.tri(at(th - w, 0), at(th, t), at(th + w, 0), col, 'metal');                     /* standing in the belt */
  }
}
/* shards along the bottom and top edges of a flat pane: a pane at z (facing +-z) spanning x0..x1, or at x (facing
   +-x) spanning z0..z1, from y0 to y1; n shards up from the bottom edge, every third down from the top */
function ancPaneShards(F, axis, pos, u0, u1, y0, y1, n) {
  if (!F.ruin || F.ruin.glass) return;
  const col = F.col('shard'), P = function (u, y) { return axis === 'z' ? [u, y, pos] : [pos, y, u]; };
  for (let i = 0; i < n; i++) {
    const u = u0 + (u1 - u0) * (i + 0.5) / n, w = (u1 - u0) / n * (0.25 + 0.2 * ancH(i, 7)), h = (y1 - y0) * (0.15 + 0.3 * ancH(i, 11));
    if (i % 3 === 2) F.tri(P(u - w, y1), P(u + w, y1), P(u, y1 - h), col, 'metal');
    else F.tri(P(u - w, y0), P(u, y0 + h), P(u + w, y0), col, 'metal');
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
/* a tank's road wheel: a rubber-tyred steel disc with a bronze cap */
function ancRoadWheel(F, W) {
  F.disc(0, 0, 0, 1, 0, 0, W.r, W.w * 0.7, F.col('tyre'), '', 16);
  F.disc(0, 0, 0, 1, 0, 0, W.r * 0.78, W.w * 0.76, F.col('whiteShade'), 'metal', 14);
  F.disc(W.side * W.w * 0.4, 0, 0, 1, 0, 0, W.r * 0.25, 0.04, F.col('bronzeDark'), 'metal', 8);
}
/* the arch over a wheel: a half-ring of bronze (the plane x = const, open downward), hub at (y, z) */
function ancArch(F, x, y, z, r) {
  const g = new THREE.TorusGeometry(r, 0.025, 4, 14, Math.PI);
  g.rotateY(Math.PI / 2);                                   /* the ring's plane XY -> ZY: it stands across the wheel */
  const m = new THREE.Mesh(g, mat(F.col('bronzeDark'), 'metal'));
  m.position.set(x, y, z);
  _add(m);
}
/* a half-cylinder shell over a wheel, axis along x, open downward, centred at x, `width` wide */
function ancShell(F, x, y, z, R, width, col) {
  const g = new THREE.CylinderGeometry(R, R, width, 16, 1, true, 0, Math.PI);
  g.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(g, mat(col, ''));
  m.position.set(x, y, z);
  _add(m);
}
/* a flared wheel well on the skin of a shrouded wheel: a short shell straddling the skin at xSkin, a bronze arch on
   its outer lip. The wheel stays well inboard of it (the clearance check) */
function ancFlare(F, W, xSkin) {
  const s = Math.sign(W.x), R = W.r + 0.1;
  ancShell(F, s * (xSkin + 0.02), W.r, W.z, R, 0.22, F.col('whiteDark'));
  ancArch(F, s * (xSkin + 0.125), W.r, W.z, R + 0.005);
}
/* a mudguard over an exposed wheel (the cab-over pods, the aircraft): a shell the wheel's width, arches each side */
function ancFender(F, W) {
  const R = W.r + 0.1;
  ancShell(F, W.x, W.r, W.z, R, W.w + 0.16, F.col('whiteDark'));
  for (const s of [-1, 1]) ancArch(F, W.x + s * (W.w / 2 + 0.08), W.r, W.z, R + 0.01);
}
/* the running gear: for each set of wheels at one z, an axle beam between them (ending 6 cm short of each wheel's
   inner face: a steered wheel swings about its hub, and the beam's end stays clear), and for each wheel a knuckle on
   the beam's end and an upright from it to the body above (floorAt(W): the shelf, pan or chassis over that wheel), so
   every wheel hangs from something. A single wheel (a nose wheel) gets a fork: uprights either side on a short axle */
function ancGear(F, floorAt) {
  const c = F.col, groups = {};
  for (const W of F.data.wheels) (groups[W.z.toFixed(3)] = groups[W.z.toFixed(3)] || []).push(W);
  for (const k of Object.keys(groups)) {
    const G = groups[k], W0 = G[0], r = W0.r, z = W0.z;
    if (G.length === 1) {
      const xf = W0.w / 2 + 0.06, top = floorAt(W0);
      F.rod(W0.x - xf, r, z, W0.x + xf, r, z, 0.03, c('bronzeDark'), 'metal');
      for (const s of [-1, 1]) F.rod(W0.x + s * xf, r - 0.03, z, W0.x + s * xf, top, z, 0.035, c('interior'), 'metal');
      continue;
    }
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
/* a cargo pod: a white cylinder along z with two bronze rings */
function ancPod(F, x, y, z, r, len) {
  F.disc(x, y, z, 0, 0, 1, r, len, F.col('white'), '', 14);
  for (const s of [-1, 1]) F.ring(x, y, z + s * len * 0.32, 0, 0, 1, r + 0.005, 0.02, F.col('bronze'), 'metal', 14);
  F.knob(x, y, z + len / 2 + 0.02, r * 0.3, F.col('bronzeDark'), 'metal');
}
/* a thin wing (or fin) between four corners: root leading, root trailing, tip trailing, tip leading edge
   ([x, y, z] each), `t0` thick at the root and `t1` at the tip; both skins and the edges, flat-shaded */
function ancWing(F, rl, rt, tt, tl, t0, t1, col) {
  const up = function (p, t) { return [p[0], p[1] + t / 2, p[2]]; }, dn = function (p, t) { return [p[0], p[1] - t / 2, p[2]]; };
  const a = up(rl, t0), b = up(rt, t0), cc = up(tt, t1), d = up(tl, t1), a2 = dn(rl, t0), b2 = dn(rt, t0), c2 = dn(tt, t1), d2 = dn(tl, t1);
  F.tri(a, b, cc, col); F.tri(a, cc, d, col);                 /* the skins (both faces each: F.tri is two-sided) */
  F.tri(a2, cc, b2, col); F.tri(a2, d2, cc, col);
  F.tri(a, d, d2, col); F.tri(a, d2, a2, col);                /* the leading edge */
  F.tri(b, b2, c2, col); F.tri(b, c2, cc, col);               /* the trailing edge */
  F.tri(d, cc, c2, col); F.tri(d, c2, d2, col);               /* the tip */
}
/* a skidded airframe's furrow and wreckage trail: it came down heading +z and slid to where it lies, so the furrow
   runs back from its tail (zTail) for `len`: a dark trough, a berm of thrown earth each side, and along it the gear
   it lost (wheels lying flat), panels, a fan or a rotor blade, seats. Everything by hash, nothing by F.rnd */
function ancFurrow(F, zTail, len, halfW, debris) {
  const c = F.col, z0 = zTail - len, zm = (zTail + z0) / 2;
  F.box(0, 0.0, zm, halfW * 2, 0.04, len, 0, c('earth'));
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6, z = z0 + len * t, r = 0.25 + 0.45 * t * (0.7 + 0.6 * ancH(i, 21 + s));
      F.blob(s * (halfW + r * 0.6), r * 0.35, z, r, r * 0.7, 0, c('earth'));
    }
  }
  for (let i = 0; i < debris.length; i++) {
    const d = debris[i], t = 0.1 + 0.85 * ancH(i, 41), z = z0 + len * t, x = (ancH(i, 43) - 0.5) * halfW * 2.6, ry = ancH(i, 47) * 6.28;
    if (d === 'wheel') { F.disc(x, 0.16, z, 0.2, 1, 0, 0.42, 0.3, c('tyre'), '', 14); F.disc(x, 0.16, z, 0.2, 1, 0, 0.26, 0.32, c('whiteDark'), 'metal', 12); }
    else if (d === 'panel') F.box(x, 0.02, z, 0.6 + ancH(i, 53), 0.05, 1.0 + ancH(i, 59), ry, c('whiteDark'));
    else if (d === 'fan') { F.disc(x, 0.6, z, 0.3, 0.2, 1, 0.75, 2.6, c('whiteDark'), '', 14); F.ring(x - 0.4, 0.6, z + 1.3, 0.3, 0.2, 1, 0.77, 0.04, c('bronze'), 'metal', 14); }
    else if (d === 'blade') F.box(x, 0.03, z, 0.36, 0.06, 3.5, ry, c('whiteDark'));
    else if (d === 'seat') { F.box(x, 0.0, z, 0.5, 0.16, 0.48, ry, c('seat')); F.box(x + 0.2 * Math.sin(ry), 0.16, z - 0.2 * Math.cos(ry), 0.5, 0.5, 0.1, ry, c('seat')); }
    else if (d === 'strut') F.rod(x, 0.05, z, x + 0.6, 0.3, z + 0.8, 0.035, c('interior'), 'metal');
    else F.box(x, 0.0, z, 0.3, 0.2, 0.3, ry, c('bronzeDark'), 'metal');
  }
}
/* a heap of wreckage at (x, z): torn panels leaning every way (beams), struts, thrown earth; radius `r`, height `h`.
   Under a piled airframe's crumpled nose, or all that is left of a gutted one */
function ancHeap(F, x, z, r, h, n, charred) {
  const c = F.col, panel = c(charred ? 'interior' : 'whiteDark');
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4, rr = r * (0.5 + 0.3 * ancH(i, 61)); F.blob(x + Math.cos(a) * rr, h * 0.12, z + Math.sin(a) * rr, r * 0.5, h * 0.3, 0, c('earth')); }
  F.blob(x, h * 0.2, z, r * 0.7, h * 0.5, 0, c(charred ? 'interior' : 'earth'));
  for (let i = 0; i < n; i++) {
    const a = ancH(i, 67) * 6.28, d = r * ancH(i, 71), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    const L = 0.6 + 1.6 * ancH(i, 73), b = ancH(i, 79) * 6.28, up = 0.2 + 0.8 * ancH(i, 83);
    const tx = px + Math.cos(b) * L * (1 - up), tz = pz + Math.sin(b) * L * (1 - up);
    if (i % 4 === 3) F.rod(px, 0.05, pz, tx, L * up * 0.6 + 0.05, tz, 0.03, c('interior'), 'metal');
    else F.beam(px, 0.02, pz, tx, h * up * 0.8 + 0.1, tz, 0.5 + 0.6 * ancH(i, 89), 0.05, panel, '');
  }
}
/* the canopies' shard angles: round the belt, more at the front and the sides */
const ANC_CANOPY_ANGLES = [0.25, 0.75, 1.3, 1.85, 2.4, 2.9, 3.4, 3.95, 4.5, 5.0, 5.55, 6.05];

/* ---------------------------------------------------------------- anc_pod: the two-seat pod car */
VEHICLE({
  key: 'anc_pod', name: 'Ancient pod car', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Civic', 'Hire'],
  /* overall box: 2.3 wide (the wells' lips), 3.3 long, 1.68 to the roof (the Hire's sign) */
  w: 2.3, d: 3.3, h: 1.68,
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
    for (const W of F.data.wheels) ancFlare(F, W, 1.0);
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

/* ---------------------------------------------------------------- anc_saloon and anc_police: the long low saloon */
const ANC_SALOON_WHEELS = [
  { name: 'wheel_fl', x: 0.7, z: 1.95, r: 0.36, w: 0.24, front: true, steer: true, drive: true },
  { name: 'wheel_fr', x: -0.7, z: 1.95, r: 0.36, w: 0.24, front: true, steer: true, drive: true },
  { name: 'wheel_rl', x: 0.7, z: -1.95, r: 0.36, w: 0.24, front: false, steer: false, drive: true },
  { name: 'wheel_rr', x: -0.7, z: -1.95, r: 0.36, w: 0.24, front: false, steer: false, drive: true }
];
/* the saloon's body: paint and roof keys, a bronze bonnet spine, and the watch's fittings (police: a lamp bar of
   blue cells and amber lamps on the roof, a bronze bull bar, a cyan stripe at the belt, a searchlight) */
function ancSaloonBody(F, o) {
  const c = F.col, paint = c(o.paint), roofCol = c(o.roof);
  const hull = [{ y: 0.18, a: 1.1, b: 2.82, n: 4.4 }, { y: 0.3, a: 1.14, b: 2.92, n: 4.6 }, { y: 0.66, a: 1.14, b: 2.94, n: 4.4 }, { y: 0.86, a: 1.06, b: 2.86, n: 3.6 }];
  F.tub(hull, ANC_SEG, paint, '');
  ancLiner(F, hull, 0.44, 0.86, 0.03);
  /* the cabin floor between the axles, risers, the bonnet and boot shelves over the wheels */
  F.tub([{ y: 0.4, a: 1.04, b: 0.98, n: 4.4, z: 0.05 }, { y: 0.44, a: 1.04, b: 0.98, n: 4.4, z: 0.05 }], ANC_SEG, c('whiteShade'), '', 'both');
  for (const s of [-1, 1]) {
    F.box(0, 0.44, 0.05 + s * 0.985, 2.06, 0.34, 0.03, 0, c('whiteShade'));
    F.tub([{ y: 0.76, a: 1.08, b: 0.9, n: 4.4, z: s * 1.95 }, { y: 0.8, a: 1.08, b: 0.9, n: 4.4, z: s * 1.95 }], 16, c('whiteShade'), '', 'both');
  }
  ancBand(F, hull, 0.84, 0.9, 0.015, c('bronze'));
  for (const W of F.data.wheels) ancFlare(F, W, 1.14);
  ancGear(F, function () { return 0.76; });
  const canopy = [{ y: 0.88, a: 0.95, b: 1.35, n: 3.2, z: 0.15 }, { y: 1.12, a: 0.86, b: 1.2, n: 3.2, z: 0.15 }, { y: 1.34, a: 0.7, b: 0.95, n: 3.2, z: 0.1 }, { y: 1.46, a: 0.55, b: 0.78, n: 3.2, z: 0.1 }];
  ancGlass(F, canopy, ANC_CANOPY_ANGLES);
  ancPosts(F, canopy[0], canopy[3], [0.5, 2.64, 3.64, 5.78, Math.PI / 2, -Math.PI / 2], 0.018, c('bronzeDark'));
  F.tub([{ y: 1.46, a: 0.56, b: 0.79, n: 3.2, z: 0.1 }, { y: 1.52, a: 0.5, b: 0.72, n: 3.2, z: 0.1 }], ANC_SEG, roofCol, o.roof === 'bronze' ? 'metal' : '', 'top');
  if (o.spine) F.box(0, 0.9, 1.9, 0.08, 0.015, 1.6, 0, c('bronze'), 'metal');                           /* a bronze spine down the bonnet */
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
  if (o.police) {
    /* the lamp bar: a bronze rail across the roof, three blue cells and two amber lamps on it */
    F.box(0, 1.52, 0.1, 1.1, 0.05, 0.14, 0, c('bronzeDark'), 'metal');
    for (const x of [-0.4, 0, 0.4]) F.lamp(x, 1.64, 0.18, 0, 0.25, 1, 0.06, 'cell', c('bronzeDark'), null);
    for (const s of [-1, 1]) F.lamp(s * 0.2, 1.64, 0.02, 0, 0.25, -1, 0.05, 'amber', c('bronzeDark'), null);
    /* the belt stripe, the bull bar, the searchlight on the left pillar */
    for (const s of [-1, 1]) ancStrip(F, s * 1.145, 0.7, 0, 0.02, 0.06, 4.8);
    F.rod(-0.75, 0.42, 3.0, 0.75, 0.42, 3.0, 0.035, c('bronze'), 'metal');
    F.rod(-0.75, 0.78, 3.0, 0.75, 0.78, 3.0, 0.035, c('bronze'), 'metal');
    for (const x of [-0.75, -0.25, 0.25, 0.75]) F.rod(x, 0.3, 3.0, x, 0.9, 3.0, 0.03, c('bronze'), 'metal');
    F.lamp(0.9, 1.1, 0.9, 0.3, 0.1, 1, 0.08, 'head', c('bronzeDark'), c('bronze'));
    F.rod(0.9, 1.0, 0.86, 0.95, 0.86, 1.0, 0.015, c('bronzeDark'), 'metal');
  }
}

VEHICLE({
  key: 'anc_saloon', name: 'Ancient saloon', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 4, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Saloon', 'Statesman'],
  /* overall box: 2.6 wide (the wells' lips), 6.0 long, 1.56 to the roof */
  w: 2.6, d: 6.0, h: 1.56,
  data: {
    speed: 38, accel: 3.5, turnRadius: 7.5, maxSteer: 0.32, seats: 4, cargo: 220, mass: 1650,
    fuel: 'battery', tank: 0, battery: 110, range: 600, drive: 'all four, hub motors', wheelbase: 3.9, track: 1.4, clearance: 0.18,
    engine: 'an Ancient cell and four hub motors',
    wheels: ANC_SALOON_WHEELS.map(function (W) { return Object.assign({}, W); })
  },
  variantData: [{}, { seats: 4, cargo: 180, mass: 1780, trade: 'state' }],
  wheel: function (F, W) { ancWheel(F, W, F.variant === 1 ? 'bronze' : 'whiteDark'); },
  build: function (F) { ancSaloonBody(F, F.variant === 1 ? { paint: 'white', roof: 'bronze', spine: true } : { paint: 'white', roof: 'white' }); }
});

VEHICLE({
  key: 'anc_police', name: 'Ancient watch car', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'patrol'], drive: 'wheeled', seats: 4, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor', guild: 'the watch' },
  variants: 2, variantNames: ['Patrol', 'Pursuit'],
  /* overall box: 2.6 wide, 6.1 long (the bull bar), 1.72 to the lamp bar */
  w: 2.6, d: 6.1, h: 1.72,
  data: {
    speed: 44, accel: 4.2, turnRadius: 7.5, maxSteer: 0.32, seats: 4, cargo: 160, mass: 1720,
    fuel: 'battery', tank: 0, battery: 120, range: 500, drive: 'all four, hub motors', wheelbase: 3.9, track: 1.4, clearance: 0.18,
    engine: 'an Ancient cell and four hub motors', armament: 'none; a lamp bar, a searchlight, a bull bar',
    wheels: ANC_SALOON_WHEELS.map(function (W) { return Object.assign({}, W); })
  },
  variantData: [{}, { speed: 50, accel: 4.8, mass: 1760 }],
  wheel: function (F, W) { ancWheel(F, W, F.variant === 1 ? 'bronze' : 'whiteDark'); },
  build: function (F) { ancSaloonBody(F, F.variant === 1 ? { paint: 'whiteDark', roof: 'bronze', spine: true, police: true } : { paint: 'white', roof: 'whiteDark', police: true }); }
});

/* ---------------------------------------------------------------- anc_van: the delivery van (a cab pod before a box) */
VEHICLE({
  key: 'anc_van', name: 'Ancient delivery van', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'cargo', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Van', 'Courier'],
  /* overall box: 2.7 wide (the wells' lips), 6.0 long (the cab pod's nose strip to the door ribs), 2.5 to the box's
     roof (the Courier's roof pod 2.75) */
  w: 2.7, d: 6.0, h: 2.8,
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
    for (const W of F.data.wheels) if (W.z < 0) ancFlare(F, W, 1.2); else ancFender(F, W);
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
      for (let i = 0; i < 3; i++) F.box(-0.5 + i * 0.5, 0.92, -1.9 + (i % 2) * 0.3, 0.42, 0.4, 0.42, 0, c('crate'));   /* crates aboard */
    }
  }
});

/* ---------------------------------------------------------------- anc_utility: the six-wheeled utility */
VEHICLE({
  key: 'anc_utility', name: 'Ancient six-wheeled utility', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'utility', 'patrol'], drive: 'wheeled', seats: 3, fuel: 'battery',
    terrain: ['road', 'track', 'rock'], setting: 'outdoor' },
  variants: 2, variantNames: ['Works', 'Patrol'],
  /* overall box: 2.8 wide (the wells' lips), 6.2 long, 2.6 to the Patrol's dish */
  w: 2.8, d: 6.2, h: 2.6,
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
    for (const W of F.data.wheels) ancFlare(F, W, 1.26);
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

/* ---------------------------------------------------------------- anc_hauler: the flatbed hauler, four loads */
VEHICLE({
  key: 'anc_hauler', name: 'Ancient flatbed hauler', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'cargo', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 4, variantNames: ['Flatbed', 'Pods', 'Crates', 'Container'],
  /* overall box: 2.75 wide, 9.2 long, 2.8 to the cab roof (the container 2.75) */
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
  variantData: [{}, { cargo: 2400, mass: 16400, load: 'four cargo pods and a crate' }, { cargo: 3000, mass: 15800, load: 'crates and drums' },
    { cargo: 1200, mass: 17600, load: 'one sealed container' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, cz = 3.1;
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
    /* the loads */
    if (v === 1) {
      for (const x of [-0.6, 0.6]) for (const z of [-0.2, -2.75]) ancPod(F, x, 1.78, z, 0.5, 1.9);
      F.box(0, 1.28, 1.3, 1.2, 0.6, 0.7, 0, c('crate'));
    } else if (v === 2) {
      /* crates in two tiers, lashed, and a row of drums at the back */
      const crate = function (x, y, z, w, h, d, ry) { F.box(x, y, z, w, h, d, ry, c('crate')); for (const e of [-1, 1]) F.box(x + e * (w / 2 - 0.04), y + h * 0.5, z, 0.03, 0.04, d + 0.02, ry, c('bronzeDark'), 'metal'); };
      crate(-0.55, 1.28, 0.8, 1.1, 0.9, 1.3, 0); crate(0.65, 1.28, 0.9, 1.0, 0.7, 1.1, 0.06);
      crate(-0.5, 1.28, -0.8, 1.2, 0.8, 1.4, -0.04); crate(0.7, 1.28, -0.7, 0.9, 0.9, 1.0, 0);
      crate(0, 2.18, 0.1, 1.3, 0.55, 1.2, 0.1);
      for (let i = 0; i < 4; i++) { const x = -0.9 + i * 0.6; F.cyl(x, 1.28, -3.2, 0.28, 0.9, 0, c('drum'), 'metal'); F.ring(x, 1.75, -3.2, 0, 1, 0, 0.285, 0.015, c('bronzeDark'), 'metal', 12); }
      for (const z of [0.1, -0.9]) F.rod(-1.27, 1.32, z, 1.27, 1.32, z, 0.012, c('bronzeDark'), 'metal');
    } else if (v === 3) {
      /* one sealed container: a rounded white box with bronze corner posts and a cyan seal strip */
      F.tub([{ y: 1.28, a: 1.15, b: 2.9, n: 5.0, z: -1.3 }, { y: 1.5, a: 1.2, b: 2.95, n: 5.0, z: -1.3 }, { y: 2.5, a: 1.2, b: 2.95, n: 5.0, z: -1.3 }, { y: 2.72, a: 1.1, b: 2.85, n: 4.5, z: -1.3 }], 20, c('white'), '', 'top');
      for (const s of [-1, 1]) for (const z of [1.5, -4.1]) F.box(s * 1.16, 1.28, z, 0.1, 1.44, 0.1, 0, c('bronze'), 'metal');
      for (const s of [-1, 1]) { F.box(s * 1.21, 1.95, -1.3, 0.02, 0.06, 5.6, 0, c('bronze'), 'metal'); ancStrip(F, s * 1.215, 2.3, -1.3, 0.02, 0.03, 4.0); }
      F.box(0, 1.6, 1.66, 1.6, 0.9, 0.03, 0, c('bronzeDark'), 'metal');                                /* the end door */
    }
  }
});

/* ---------------------------------------------------------------- anc_tram: the guideway tram-car */
VEHICLE({
  key: 'anc_tram', name: 'Ancient guideway tram-car', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 40, fuel: 'battery',
    terrain: ['road', 'track'], setting: 'outdoor' },
  variants: 1, variantNames: ['Tram-car'],
  /* overall box: 3.1 wide (the wells' lips), 13.4 long, 3.5 to the roof */
  w: 3.1, d: 13.4, h: 3.5,
  budget: { tris: 9000 },
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
    /* the saloon's walls and ceiling: a liner below the window ribbon and one above it, so the car is open through
       its windows */
    ancLiner(F, body, 1.08, 1.58, 0.03);
    ancLiner(F, body, 2.52, 3.3, 0.03);
    for (const W of F.data.wheels) ancFlare(F, W, 1.38);
    ancGear(F, function () { return 1.04; });
    /* the window ribbon all round, a hair proud of the skin, its bronze mullions and rails; big shards along both
       sides once it is gone */
    const ribbon = [{ y: 1.6, a: 1.392, b: 6.612, n: 5.0 }, { y: 2.5, a: 1.392, b: 6.612, n: 5.0 }];
    const shardAngles = [];
    for (const t of [0.004, 0.012, 0.025, 0.045, 0.075, 0.11, 0.16, 0.22, 0.3, 0.4, 0.52, 0.68, 0.9]) for (const s of [1, -1]) { shardAngles.push(s > 0 ? t : Math.PI - t); shardAngles.push(s > 0 ? -t : Math.PI + t); }
    ancGlass(F, ribbon, shardAngles, true);
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
    /* the saloon: ten rows of double seats either side of the aisle, grab poles */
    for (let i = 0; i < 10; i++) {
      const z = -4.95 + i * 1.1;
      for (const s of [-1, 1]) ancSeat(F, s * 0.78, 1.08, z, 0.9);
    }
    for (const z of [-3.3, 0, 3.3]) F.rod(0, 1.08, z, 0, 3.25, z, 0.02, c('bronzeDark'), 'metal');
  }
});

/* ---------------------------------------------------------------- anc_tank: the tracked tank with an energy lance */
const ANC_TANK_BELT = 0.08;
VEHICLE({
  key: 'anc_tank', name: 'Ancient lance tank', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'patrol'], drive: 'tracked', seats: 3, fuel: 'battery',
    terrain: ['road', 'track', 'sand', 'mud', 'rock', 'snow'], setting: 'outdoor' },
  variants: 2, variantNames: ['Line', 'Command'],
  /* overall box: 3.6 wide (the skirts), 11.6 long (the lance's emitter at 5.77), 2.7 to the aerial */
  w: 3.6, d: 11.6, h: 2.7,
  budget: { tris: 9000 },
  data: {
    speed: 14, accel: 0.8, turnRadius: 0, maxSteer: 0, steering: 'skid (tracks), turns on the spot', seats: 3, cargo: 0, mass: 42000,
    fuel: 'battery', tank: 0, battery: 900, range: 300, drive: 'tracked, hub motors on the sprockets', wheelbase: 3.2, track: 2.7, clearance: 0.45,
    belt: ANC_TANK_BELT, engine: 'an Ancient cell bank', armament: 'an energy lance in a low turret',
    wheels: [].concat.apply([], [1, -1].map(function (s) {
      return [0, 1, 2, 3, 4].map(function (i) {
        return { name: 'wheel_' + (s > 0 ? 'l' : 'r') + (i + 1), x: s * 1.35, z: 1.6 - i * 0.8, r: 0.34, w: 0.5, lift: ANC_TANK_BELT, front: i < 2, steer: false, drive: true };
      });
    }))
  },
  variantData: [{}, { seats: 4, armament: 'an energy lance in a low turret; a dish and a second aerial', mass: 42600 }],
  wheel: function (F, W) { ancRoadWheel(F, W); },
  build: function (F) {
    const c = F.col, v = F.variant, R = F.ruin, wreck = R && R.state === 'wreck', gone = wreck && R.form === 'exploded';
    /* the tracks: a belt round five road wheels, a sprocket and an idler each side, under a skirt */
    for (const s of [-1, 1]) {
      const x = s * 1.35, circ = [];
      for (let i = 0; i < 5; i++) circ.push([1.6 - i * 0.8, ANC_TANK_BELT + 0.34, 0.34]);
      circ.push([2.3, 0.62, 0.3]); circ.push([-2.3, 0.62, 0.3]);
      F.track(x, 0.5, ANC_TANK_BELT, circ, 0.2, c('interior'), 'metal');
      for (const e of [2.3, -2.3]) {
        F.disc(x, 0.62, e, 1, 0, 0, 0.27, 0.42, c('whiteShade'), 'metal', 14);
        F.disc(x + s * 0.23, 0.62, e, 1, 0, 0, 0.1, 0.04, c('bronzeDark'), 'metal', 8);
      }
      F.box(s * 1.68, 0.55, 0, 0.04, 0.5, 5.4, 0, c('white'));                                         /* the skirt */
      ancStrip(F, s * 1.7, 0.75, 0, 0.015, 0.03, 4.0);
    }
    /* the hull: a low tub between the tracks, the sponsons over them, a glacis and a tail plate */
    F.tub([{ y: 0.45, a: 1.05, b: 2.95, n: 4.5 }, { y: 1.05, a: 1.05, b: 2.95, n: 4.5 }], ANC_SEG, c('white'), '', 'bottom');
    const upper = [{ y: 1.05, a: 1.72, b: 3.0, n: 4.5 }, { y: 1.25, a: 1.74, b: 3.05, n: 4.5 }, { y: 1.45, a: 1.6, b: 2.9, n: 4.0 }];
    F.tub(upper, ANC_SEG, c('white'), '', 'top');
    ancBand(F, upper, 1.23, 1.28, 0.015, c('bronze'));
    F.slab([[2.9, 0.5, 1.0], [3.6, 0.95, 1.05], [3.3, 1.45, 1.3], [2.85, 1.45, 1.45]], c('white'), '');          /* the glacis */
    F.slab([[-2.9, 0.5, 1.0], [-3.4, 0.9, 1.05], [-3.2, 1.45, 1.3], [-2.85, 1.45, 1.45]], c('white'), '');       /* the tail plate */
    for (const s of [-1, 1]) {
      F.lamp(s * 0.7, 1.2, 3.42, 0, 0.3, 1, 0.065, 'head', c('bronzeDark'), c('bronze'));
      F.lamp(s * 0.9, 1.1, -3.3, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
      F.box(s * 1.2, 1.45, -1.6, 0.6, 0.25, 1.2, 0, c('whiteDark'));                                   /* stowage bins */
    }
    ancStrip(F, 0, 1.0, 3.55, 1.4, 0.03, 0.02);
    /* the turret: a low dome on a bronze ring, the lance in a mantlet; a wreck's is knocked round and the lance
       droops; an exploded wreck's is gone (the ring and the open hatch well stay) */
    const tz = 0.2 + (wreck ? -0.4 * R.side : 0), yaw = wreck ? R.side * 0.35 : 0;
    F.tub([{ y: 1.45, a: 1.06, b: 1.22, n: 3.2, z: 0.2 }, { y: 1.58, a: 1.06, b: 1.22, n: 3.2, z: 0.2 }], ANC_SEG, c('bronze'), 'metal');
    if (gone) {
      F.tub([{ y: 1.3, a: 0.9, b: 1.0, n: 3.0, z: 0.2 }, { y: 1.58, a: 0.95, b: 1.05, n: 3.0, z: 0.2 }], ANC_SEG, c('interior'), 'metal', 'bottom', true);
    } else {
      F.tub([{ y: 1.58, a: 1.0, b: 1.15, n: 3.2, z: tz }, { y: 1.85, a: 0.92, b: 1.05, n: 3.2, z: tz }, { y: 2.05, a: 0.55, b: 0.7, n: 3.0, z: tz }], ANC_SEG, c('white'), '', 'top');
      F.ring(0.35, 2.05, tz - 0.3, 0, 1, 0, 0.26, 0.03, c('bronzeDark'), 'metal', 14);                 /* the hatch ring */
      const gx = Math.sin(yaw), gz = Math.cos(yaw), droop = wreck ? -0.12 : 0.03;
      F.disc(gx * 1.3, 1.8, tz + gz * 1.3, gx, 0, gz, 0.3, 0.5, c('whiteDark'), 'metal', 12);          /* the mantlet */
      F.disc(gx * 3.4, 1.8 + droop * 2.1, tz + gz * 3.4, gx, droop, gz, 0.09, 4.2, c('bronze'), 'metal', 10);   /* the lance */
      F.ring(gx * 5.45, 1.8 + droop * 4.15, tz + gz * 5.45, gx, droop, gz, 0.11, 0.025, c('bronzeDark'), 'metal', 10);
      F.knob(gx * 5.5, 1.8 + droop * 4.2, tz + gz * 5.5, 0.07, c('cyan'), 'lampBlue');                /* the emitter */
      ancStrip(F, 0, 2.0, tz, 0.9, 0.02, 0.1);
      F.rod(-0.6, 2.05, tz - 0.5, -0.6, 2.65, tz - 0.5, 0.012, c('bronzeDark'), 'metal');              /* the aerial */
      if (v === 1) {
        F.rod(0.6, 2.05, tz - 0.6, 0.6, 2.45, tz - 0.6, 0.012, c('bronzeDark'), 'metal');
        F.taper(0.6, 2.45, tz - 0.6, 0, 0.7, -0.7, 0.03, 0.22, 0.1, c('whiteDark'), 'metal', 12);     /* the dish */
      }
    }
  }
});

/* ---------------------------------------------------------------- anc_heli: the helicopter */
VEHICLE({
  key: 'anc_heli', name: 'Ancient helicopter', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'patrol'], drive: 'wheeled', seats: 6, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 2, variantNames: ['Transport', 'Patrol'],
  /* overall box: 10.6 wide (the rotor), 14.2 long (the nose to the tail lamp), 4.2 to the rotor head. On the
     ground, on its wheels: an airframe a host places, it does not drive */
  w: 10.6, d: 14.2, h: 4.2,
  budget: { tris: 7500 },
  data: {
    speed: 70, accel: 3.0, turnRadius: 0, maxSteer: 0, steering: 'none on the ground (a castoring nose wheel)', seats: 6, cargo: 900, mass: 3800,
    fuel: 'battery', tank: 0, battery: 700, range: 600, drive: 'the rotor; the wheels are landing gear', wheelbase: 3.2, track: 2.2, clearance: 0.5,
    airframe: true, rotor: 5.2, engine: 'an Ancient cell bank on a rotor mast',
    wheels: [
      { name: 'wheel_nose', x: 0, z: 2.6, r: 0.3, w: 0.2, front: true, steer: false, drive: false },
      { name: 'wheel_ml', x: 1.1, z: -0.6, r: 0.36, w: 0.24, front: false, steer: false, drive: false },
      { name: 'wheel_mr', x: -1.1, z: -0.6, r: 0.36, w: 0.24, front: false, steer: false, drive: false }
    ]
  },
  variantData: [{}, { seats: 4, cargo: 400, armament: 'none; a searchlight and a lamp bar' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, v = F.variant, R = F.ruin, wreck = R && R.state === 'wreck', form = wreck ? R.form : null;
    if (form === 'gutted') {
      /* burnt to the ground: a charred heap where the cabin was, the mast and rotor head fallen across it with one
         blade bent up out of it, the boom lying apart */
      ancHeap(F, 0, 0.6, 3.6, 1.7, 18, true);
      F.rod(0.2, 1.1, 0.6, 2.4, 0.35, -1.0, 0.09, c('bronzeDark'), 'metal');                          /* the mast, down */
      F.disc(0.1, 1.2, 0.7, 0.3, 1, -0.2, 0.3, 0.18, c('bronze'), 'metal', 12);                        /* the rotor head */
      F.beam(0.3, 1.4, 0.6, 1.9, 2.7, -1.3, 0.36, 0.06, c('interior'), '');                            /* a blade, bent skyward */
      F.beam(1.9, 2.7, -1.3, 4.3, 1.4, -3.2, 0.36, 0.06, c('interior'), '');
      F.box(-2.6, 0.03, 1.5, 0.36, 0.06, 4.2, 0.5, c('interior'));                                     /* a blade, flat */
      F.taper(-1.8, 0.3, -2.2, -0.25, 0, -1, 0.42, 0.15, 5.0, c('interior'), '', 12);                  /* the boom, apart */
      F.lamp(-3.1, 0.5, -7.0, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
      return;
    }
    /* the fuselage pod: a belly from the nose to the boom root, a white cabin aft of the glazed nose */
    const belly = [{ y: 0.9, a: 1.05, b: 2.5, n: 3.4, z: 0.9 }, { y: 1.3, a: 1.25, b: 2.6, n: 3.6, z: 0.9 }, { y: 1.6, a: 1.2, b: 2.55, n: 3.4, z: 0.9 }];
    F.tub(belly, ANC_SEG, c('white'), '', 'bottom');
    ancLiner(F, belly, 1.0, 1.6, 0.03);
    F.tub([{ y: 1.0, a: 1.18, b: 2.45, n: 3.4, z: 0.9 }, { y: 1.04, a: 1.18, b: 2.45, n: 3.4, z: 0.9 }], ANC_SEG, c('whiteShade'), '', 'both');
    ancBand(F, belly, 1.58, 1.64, 0.015, c('bronze'));
    const cabin = [{ y: 1.62, a: 1.18, b: 1.5, n: 3.4, z: -0.1 }, { y: 2.2, a: 1.1, b: 1.4, n: 3.4, z: -0.1 }, { y: 2.55, a: 0.7, b: 1.0, n: 3.2, z: -0.1 }];
    F.tub(cabin, ANC_SEG, c('white'), '', 'top');
    ancLiner(F, cabin, 1.62, 2.4, 0.03);
    const canopy = [{ y: 1.62, a: 1.1, b: 0.95, n: 3.2, z: 2.4 }, { y: 2.0, a: 0.95, b: 0.85, n: 3.2, z: 2.4 }, { y: 2.35, a: 0.6, b: 0.6, n: 3.0, z: 2.45 }];
    ancGlass(F, canopy, ANC_CANOPY_ANGLES);
    ancPosts(F, canopy[0], canopy[2], [0.5, 1.3, 2.1, 4.2, 5.0, 5.8], 0.02, c('bronzeDark'));
    F.tub([{ y: 2.35, a: 0.61, b: 0.61, n: 3.0, z: 2.45 }, { y: 2.45, a: 0.5, b: 0.5, n: 3.0, z: 2.45 }], ANC_SEG, c('white'), '', 'top');
    for (const s of [-1, 1]) { ancSeat(F, s * 0.45, 1.04, 2.1, 0.5); ancSeat(F, s * 0.45, 1.04, 0.6, 0.5); ancSeat(F, s * 0.45, 1.04, -0.6, 0.5); }
    ancDash(F, 1.06, 2.8, 1.3);
    /* the gear: a nose fork and two mains on short legs, each under a mudguard; a downed helicopter lost them (a
       skidded one along a short furrow behind it, with a blade; a piled one into the heap at its nose) */
    if (form === 'skidded') {
      ancFurrow(F, -7, 12, 1.4, ['wheel', 'wheel', 'blade', 'panel', 'panel', 'seat', 'strut', 'bit']);
    } else if (form === 'piled') {
      ancHeap(F, 0, 3.0, 2.2, 1.6, 12, false);
    } else if (!(wreck && R.gearGone)) {
      for (const W of F.data.wheels) ancFender(F, W);
      ancGear(F, function () { return 0.92; });
    }
    /* the tail boom (kinked down in a wreck), the fin, the stabiliser, the tail rotor */
    const kink = wreck ? -0.1 : 0;
    F.taper(0, 1.95, -1.4, 0, kink, -1, 0.45, 0.16, 5.4, c('white'), '', 12);
    const tz = -6.8, ty = 1.95 + kink * 5.4;
    F.slab([[tz - 0.1, ty - 0.1, 0.05], [tz + 0.8, ty - 0.1, 0.05], [tz + 1.0, ty + 1.3, 0.04], [tz + 0.3, ty + 1.3, 0.04]], c('bronze'), 'metal');
    F.box(0, ty + 0.1, tz + 0.6, 1.8, 0.05, 0.4, 0, c('white'));
    F.rod(0, ty + 0.9, tz + 0.6, 0.2, ty + 0.9, tz + 0.6, 0.03, c('bronzeDark'), 'metal');
    for (const a of [0.4, 0.4 + Math.PI / 2]) {                                                       /* the tail rotor's two blades */
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.7, 0.14), mat(c('bronzeDark'), 'metal'));
      m.position.set(0.22, ty + 0.9, tz + 0.6); m.rotation.x = a; _add(m);
    }
    /* the rotor: the mast, the head, four blades (drooping and one gone in a wreck); sheared off an overturned one,
       which lies on its roof */
    if (form !== 'overturned') {
      F.rod(0, 2.5, 0.4, 0, 3.5, 0.4, 0.09, c('bronzeDark'), 'metal');
      F.disc(0, 3.5, 0.4, 0, 1, 0, 0.3, 0.18, c('bronze'), 'metal', 12);
      F.knob(0, 3.7, 0.4, 0.1, c('cyan'), 'lampBlue');
      for (let i = 0; i < 4; i++) {
        if (wreck && i === (((R.seed * 7) | 0) & 3)) continue;
        const a = i * Math.PI / 2 + 0.3, dx = Math.sin(a), dz = Math.cos(a), len = 4.9;
        const drop = R && R.state !== 'intact' ? (wreck ? 0.75 : 0.25) : 0.08;
        F.beam(dx * 0.3, 3.6, 0.4 + dz * 0.3, dx * len, 3.6 - drop, 0.4 + dz * len, 0.36, 0.06, c('whiteDark'), '');
      }
    } else {
      F.rod(0, 2.5, 0.4, 0, 2.7, 0.4, 0.09, c('bronzeDark'), 'metal');                                  /* the mast's stump */
    }
    /* the face: lamps on the nose, the tail lamp, a sill strip; the Patrol's searchlight and lamp bar */
    for (const s of [-1, 1]) {
      F.lamp(s * 0.5, 1.2, 3.36, 0, -0.2, 1, 0.07, 'head', c('bronzeDark'), c('bronze'));
      ancStrip(F, s * 1.26, 1.25, 0.9, 0.02, 0.03, 3.0);
    }
    F.lamp(0, ty + 0.4, tz - 0.08, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
    F.lamp(0, 0.88, 0.9, 0, -1, 0, 0.06, 'amber', c('bronzeDark'), null);
    if (v === 1) {
      F.taper(-0.9, 0.95, 2.2, 0, -0.6, 0.8, 0.04, 0.18, 0.3, c('bronzeDark'), 'metal', 10);
      F.lamp(-0.9, 0.78, 2.44, 0, -0.6, 0.8, 0.12, 'head', null, c('bronze'));
      for (const x of [-0.35, 0, 0.35]) F.lamp(x, 2.5, -1.0, 0, 0.3, 1, 0.05, 'cell', c('bronzeDark'), null);
    }
  }
});

/* ---------------------------------------------------------------- anc_jet: the passenger jet */
VEHICLE({
  key: 'anc_jet', name: 'Ancient passenger jet', culture: 'ancient',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 120, fuel: 'battery',
    terrain: ['road'], setting: 'outdoor' },
  variants: 1, variantNames: ['Liner'],
  /* overall box: 26 wide (the wings), 32 long, 7.6 to the fin. On the ground, on its gear: a host places it */
  w: 26, d: 32, h: 7.6,
  budget: { tris: 7500 },
  data: {
    speed: 250, accel: 4.0, turnRadius: 0, maxSteer: 0, steering: 'none on the ground (a castoring nose wheel)', seats: 120, cargo: 9000, mass: 48000,
    fuel: 'battery', tank: 0, battery: 9000, range: 4000, drive: 'two fans; the wheels are landing gear', wheelbase: 12.5, track: 4.8, clearance: 1.2,
    airframe: true, span: 25, engine: 'an Ancient cell bank, two ducted fans',
    wheels: [
      { name: 'wheel_nose', x: 0, z: 9, r: 0.45, w: 0.3, front: true, steer: false, drive: false },
      { name: 'wheel_ml', x: 2.4, z: -3.5, r: 0.55, w: 0.4, front: false, steer: false, drive: false },
      { name: 'wheel_mr', x: -2.4, z: -3.5, r: 0.55, w: 0.4, front: false, steer: false, drive: false }
    ]
  },
  variantData: [{}],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, R = F.ruin, wreck = R && R.state === 'wreck', yc = 3.0, r = 1.8, form = wreck ? R.form : null;
    const skid = form === 'skidded', piled = form === 'piled', gutted = form === 'gutted';
    const upright = wreck && ['skidded', 'broken', 'piled', 'gutted', 'crashed', 'torn', 'crushed', 'tboned', 'exploded'].indexOf(form) >= 0;
    /* the fuselage: a tube, a nose cone, an upswept tail cone; a bronze band at each pressure frame */
    F.disc(0, yc, -1, 0, 0, 1, r, 20, c('white'), '', 18);
    F.taper(0, yc, 9, 0, 0, 1, r, 0.35, 4.5, c('white'), '', 18);
    F.taper(0, yc, -11, 0, 0.14, -1, r, 0.45, 5.0, c('white'), '', 18);
    F.knob(0, yc, 13.5, 0.36, c('bronzeDark'), 'metal');
    for (const z of [8.9, 2, -4, -10.9]) F.ring(0, yc, z, 0, 0, 1, r + 0.01, 0.03, c('bronze'), 'metal', 18);
    /* the cockpit visor: a glass band round the nose cone; the cabin windows: a glass band each side */
    if (!R || R.glass) {
      F.disc(0, yc, 9.9, 0, 0, 1, r - 0.29 + 0.02, 0.7, c('blueGlass'), 'metal', 18);
      for (const s of [-1, 1]) F.box(s * (r - 0.01), yc + 0.35, -1.5, 0.06, 0.5, 17, 0, c('blueGlass'), 'metal');
    }
    for (const s of [-1, 1]) {
      ancPaneShards(F, 'x', s * (r + 0.02), -10, 7, yc + 0.35, yc + 0.85, 9);
      F.box(s * (r + 0.005), yc + 0.33, -1.5, 0.05, 0.02, 17, 0, c('bronzeDark'), 'metal');
      F.box(s * (r + 0.005), yc + 0.85, -1.5, 0.05, 0.02, 17, 0, c('bronzeDark'), 'metal');
      ancStrip(F, s * (r + 0.005), yc - 0.6, -1, 0.03, 0.04, 18);
    }
    /* the wings: swept, tapered, a fan under each; a wreck's wing on R.side is torn off and lies beside it */
    for (const s of [-1, 1]) {
      const torn = wreck && s === R.side;
      const rl = [s * 1.7, yc - 0.4, 2.0], rt = [s * 1.7, yc - 0.4, -5.5], tt = [s * 12.5, yc + 0.3, -8.6], tl = [s * 12.5, yc + 0.3, -6.6];
      if (!torn) {
        ancWing(F, rl, rt, tt, tl, 0.42, 0.1, c('white'));
        if (!(skid && s === -R.side)) {                                                                /* a skidded jet's other fan lies in the trail */
          F.disc(s * 4.6, yc - 1.1, -2.6, 0, 0, 1, 0.78, 3.4, c('white'), '', 16);
          F.ring(s * 4.6, yc - 1.1, -0.9, 0, 0, 1, 0.8, 0.04, c('bronze'), 'metal', 16);
          F.face(s * 4.6, yc - 1.1, -4.31, 0, 0, -1, 0.6, c('cyan'), 'lampBlue', 14);
        }
        F.rod(s * 4.6, yc - 0.4, -2.6, s * 4.6, yc - 1.1, -2.6, 0.2, c('whiteDark'), '');
        F.lamp(s * 12.3, yc + 0.3, -6.7, s, 0, 0, 0.06, s > 0 ? 'cell' : 'tail', null, c('bronzeDark'));
      } else {
        ancWing(F, rl, rt, [s * 3.2, yc - 0.4, -5.9], [s * 3.2, yc - 0.4, 1.4], 0.42, 0.3, c('interior'));   /* the stub */
        if (upright) {                                                                                 /* the wing lies beside it (not under a flipped body) */
          const ox = s * 3.3, oz = skid ? -20 : -9.5, k = 0.9;
          ancWing(F, [ox + s * 0.6, 0.25, oz + 3.5 * k], [ox + s * 0.6, 0.25, oz - 3.5 * k], [ox + s * 10.5, 0.4, oz - 5.5 * k], [ox + s * 10.5, 0.4, oz - 3.5 * k], 0.4, 0.1, c('white'));
          if (!skid) F.disc(ox + s * 3.4, 0.78, oz - 1.5, 0, 0, 1, 0.78, 3.4, c('white'), '', 16);
        }
      }
    }
    /* the tail: a swept fin on the tail cone, a stabiliser either side */
    F.slab([[-14.2, yc + 0.6, 0.12], [-11.6, yc + 0.6, 0.12], [-13.8, yc + 4.5, 0.06], [-15.2, yc + 4.5, 0.06]], c('white'), '');
    for (const s of [-1, 1]) ancWing(F, [s * 0.4, yc + 0.9, -11.8], [s * 0.4, yc + 0.9, -14.6], [s * 5.4, yc + 1.1, -15.6], [s * 5.4, yc + 1.1, -14.2], 0.24, 0.08, c('white'));
    ancStrip(F, 0, yc + 4.5, -14.5, 0.08, 0.04, 1.3);
    F.lamp(0, yc + 0.5, -15.95, 0, 0, -1, 0.05, 'tail', null, c('bronzeDark'));
    /* the gear: a nose fork under the forward fuselage, the mains under the wing roots, mudguards; a skidded jet
       lost it all in the furrow it ploughed, 30 m back from its tail, with a fan, panels and seats */
    if (skid) {
      ancFurrow(F, -16, 30, 2.6, ['wheel', 'wheel', 'wheel', 'fan', 'panel', 'panel', 'panel', 'panel', 'seat', 'seat', 'strut', 'strut', 'bit', 'bit', 'panel']);
    } else if (piled) {
      ancHeap(F, 0, 9.5, 4.5, 2.4, 22, false);                                                         /* what the nose became */
      ancFurrow(F, -16, 10, 2.4, ['wheel', 'wheel', 'panel', 'strut']);
    } else if (gutted) {
      ancHeap(F, 0, -2, 7, 2.6, 30, true);
    } else if (!(wreck && R.gearGone)) {
      for (const W of F.data.wheels) ancFender(F, W);
      ancGear(F, function (W) { return W.z > 0 ? 1.22 : yc - 0.6; });
      for (const W of F.data.wheels) if (W.z < 0) F.box(W.x, yc - 1.3, W.z, 0.5, 0.7, 0.6, 0, c('whiteDark'));   /* the gear bays */
    } else if (form === 'broken') {
      ancHeap(F, R.side * 2.5, -16 + 32 * R.cut, 2.5, 1.4, 10, false);                             /* what fell out at the break */
    }
    /* the doors and the nose lamps */
    for (const s of [-1, 1]) {
      for (const z of [6.5, -8.5]) F.box(s * (r + 0.006), yc - 0.9, z, 0.03, 1.9, 0.9, 0, c('bronzeDark'), 'metal');
      F.lamp(s * 0.5, yc - 0.6, 13.1, 0, -0.1, 1, 0.07, 'head', c('bronzeDark'), c('bronze'));
    }
  }
});
