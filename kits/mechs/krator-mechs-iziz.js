/* ======================================================================
   Krator Mechs: the Iziz (kits/mechs/krator-mechs-iziz.js)

   The Izani Empire's walking machines (LORE.md 6.2 and "Ancient survivals"): Ancient
   industrial walkers dug out of the city's ruins (loaders, cranes, excavators, pile
   drivers, cargo striders) and kept going by the Forgemasters' Guild, refitted for a war
   fought mostly against people with swords. A pilot sits in the head or the chest; a
   weapon is what the machine already was (a shear, a grab, an auger, a saw) or a
   ballista bolted on. The legions dress them as they dress themselves: the sun of Iziz,
   bronze phalerae, horsehair crests, banners on a pole at the back (a vexillum, or a
   sashimono-like flag), and feathers taken from the jungle and from the Beast Riders.

   Livery: weathered steel and gunmetal, with Iziz orange (#e07a2a) on the armour, cream
   trim, a teal line, bronze and gilt fittings (core/sockets/80-cultures.js, the iziz pack).

   This file registers the culture and the dressing every Iziz mech shares (IZ below);
   one file per mech follows it (krator-mechs-iziz-<mech>.js).
   ====================================================================== */

MECH_CULTURE('iziz', {
  name: 'Iziz', sign: 'the sun (the palace emblem is the orb)', livery: 'steel and gunmetal, Iziz orange armour, cream trim, teal line, bronze',
  lore: 'Ancient industrial walkers from the ruins of Iziz, kept by the Forgemasters and fought by the legions',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    orange: 0xd06c26, orangeLt: 0xe58a3a, orangeDk: 0x9a4a1c, cream: 0xe2d2ac, creamDk: 0xc4b088,
    teal: 0x2f8f8a, tealDk: 0x226a66, red: 0x9c2d2d, crimson: 0x7e1c1c,
    steel: 0x7a776f, steelLt: 0x9c988e, steelDk: 0x4c4a45, gun: 0x363431, iron: 0x2a2826, chrome: 0xb4b0a6,
    bronze: 0xa87038, brass: 0xc29445, gold: 0xd4a640, copper: 0xb5683c, verdigris: 0x5a9a86,
    leather: 0x5b3b24, rope: 0x9a8458, skein: 0x8a7650, wood: 0x6b4c30, woodDk: 0x4a3420, canvas: 0xb9a37a, rubber: 0x262422,
    skin: 0xb98a62, tunic: 0xa33a24, trousers: 0x5a3a28,
    glass: 0x9cc6c4, glassAmber: 0xd99a50, lensWarm: 0xffd59a, lensRed: 0xd2401c, lensAmber: 0xffa040, eye: 0xffaa48,
    fGreen: 0x2e8a4c, fTeal: 0x237f86, fScarlet: 0xb53a20, fGold: 0xdba23a, fBlack: 0x1e1c1b, fWhite: 0xe6e0d0, fBlue: 0x2a5a9a,
    hazard: 0x1f1d1b
  }
});

const IZ = {};
/* the banner paints */
IZ.paint = function (F, kind, o) {
  o = o || {};
  const c = F.col;
  if (kind === 'legion') return { field: c('orange'), edge: c('teal'), band: c('cream'), ink: c('cream'), ink2: c('orange'), sym: 'numeral', numeral: o.numeral || 'III' };
  if (kind === 'orb') return { field: c('orange'), edge: c('red'), band: c('teal'), ink: c('cream'), sym: 'orb', pattern: true };
  if (kind === 'stripes') return { field: c('orange'), stripes: [c('orange'), c('cream'), c('teal'), c('cream')] };
  if (kind === 'teal') return { field: c('teal'), edge: c('orange'), band: c('cream'), ink: c('cream'), ink2: c('teal'), sym: 'sun' };
  return { field: c('orange'), edge: c('teal'), band: c('cream'), ink: c('cream'), ink2: c('orange'), sym: 'sun', pattern: 'sun' };
};

/* the sun of Iziz in gilt: a disc, a ring, a boss and sixteen rays, facing (nx, ny, nz), radius R */
IZ.sun = function (F, x, y, z, nx, ny, nz, R, disc, ray) {
  const B = MP.basis(nx, ny, nz), u = B[0], v = B[1], n = B[2];
  disc = disc == null ? F.col('gold') : disc; ray = ray == null ? disc : ray;
  F.disc(x, y, z, n.x, n.y, n.z, R * 0.62, 0.04, disc, 'gold', 14);
  F.ring(x + n.x * 0.025, y + n.y * 0.025, z + n.z * 0.025, n.x, n.y, n.z, R * 0.42, 0.025, F.col('orange'), 'paint', 14);
  F.knob(x + n.x * 0.04, y + n.y * 0.04, z + n.z * 0.04, R * 0.18, disc, 'gold');
  const o = 0.022;
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, r1 = R * 0.6, r2 = R * (k % 2 ? 0.86 : 1.0), da = 0.13;
    const P = function (r, aa) { return [x + (u.x * Math.cos(aa) + v.x * Math.sin(aa)) * r + n.x * o, y + (u.y * Math.cos(aa) + v.y * Math.sin(aa)) * r + n.y * o, z + (u.z * Math.cos(aa) + v.z * Math.sin(aa)) * r + n.z * o]; };
    F.poly([P(r1, a - da), P(r2, a), P(r1, a + da)], ray, 'gold');
  }
};
/* a phalera: a bronze disc with a raised ring and boss (a legion's decoration), facing n */
IZ.phalera = function (F, x, y, z, nx, ny, nz, r, col, boss) {
  const n = new THREE.Vector3(nx, ny, nz).normalize();
  col = col == null ? F.col('bronze') : col;
  F.disc(x, y, z, n.x, n.y, n.z, r, 0.03, col, 'bronze', 12);
  F.ring(x + n.x * 0.02, y + n.y * 0.02, z + n.z * 0.02, n.x, n.y, n.z, r * 0.7, r * 0.09, boss == null ? F.col('gold') : boss, 'gold', 12);
  F.knob(x + n.x * 0.03, y + n.y * 0.03, z + n.z * 0.03, r * 0.32, boss == null ? F.col('gold') : boss, 'gold');
};
/* a row of n phalerae running down from (x, y, z) along v (the plane's "down"), facing n */
IZ.phalerae = function (F, x, y, z, nx, ny, nz, cnt, gap, r) {
  for (let i = 0; i < cnt; i++) IZ.phalera(F, x, y - i * gap, z, nx, ny, nz, r);
};
/* a horsehair crest on a bronze ridge: length len, height h; 'across' (a centurion's) or 'along' */
IZ.crest = function (F, x, y, z, len, h, dir, col, ridge) {
  const pts = [], n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = Math.PI * t, rr = (i % 2 ? 0.94 : 1.0);
    pts.push([(-Math.cos(a)) * len / 2 * rr, Math.sin(a) * h * rr]);
  }
  pts.push([len / 2 * 0.92, -0.02]); pts.push([-len / 2 * 0.92, -0.02]);
  F.prism(x, y, z, pts, len * 0.07 + 0.04, col == null ? F.col('crimson') : col, 'hair', dir === 'along' ? 'x' : 'z');
  F.prism(x, y - 0.02, z, [[-len * 0.47, -0.06], [len * 0.47, -0.06], [len * 0.45, 0.05], [-len * 0.45, 0.05]], len * 0.07 + 0.08,
    ridge == null ? F.col('bronze') : ridge, 'bronze', dir === 'along' ? 'x' : 'z');
};
/* a bunch of feathers on a cord, hanging from (x, y, z) of parent on a swinging bone `name`.
   o: { n, len, cols:[...], spread, cord } */
IZ.feathers = function (F, R, name, parent, x, y, z, o) {
  o = o || {};
  const n = o.n || 5, L = o.len || 0.6, cols = o.cols || ['fScarlet', 'fGold', 'fGreen', 'fTeal', 'fBlack'], sp = o.spread == null ? 0.5 : o.spread;
  R.dangle(name, parent, x, y, z, { mode: 'hang', len: L + (o.cord || 0.15), k: o.k || 9, c: o.c || 1.6, wind: o.wind == null ? 0.05 : o.wind, max: 1.1 });
  R.on(name);
  const cd = o.cord || 0.15;
  F.rod(0, 0, 0, 0, -cd, 0, 0.012, F.col('rope'), 'rope');
  F.knob(0, -cd, 0, 0.04, F.col('gold'), 'gold');
  for (let i = 0; i < n; i++) {
    const a = (i - (n - 1) / 2) / Math.max(1, (n - 1) / 2) * sp, tw = (i % 2 ? 0.35 : -0.25);
    const dx = Math.sin(a), dy = -Math.cos(a), w = 0.07 + 0.015 * (i % 3);
    const tx = Math.cos(tw), tz = Math.sin(tw);
    const P0 = [0, -cd, 0], tip = [dx * L, -cd + dy * L, tz * 0.04 * i];
    const mid = function (t, side) { return [dx * L * t + side * tx * w * Math.sin(Math.PI * t) * 1.0, -cd + dy * L * t, side * tz * w * Math.sin(Math.PI * t)]; };
    const col = F.col(cols[i % cols.length]), tipCol = F.col(cols[(i + 2) % cols.length]);
    F.tri(P0, mid(0.55, 1), mid(0.55, -1), col, 'feather');
    F.tri(mid(0.55, 1), tip, mid(0.55, -1), tipCol, 'feather');
    F.rod(P0[0], P0[1], P0[2], tip[0] * 0.9, -cd + dy * L * 0.9, tip[2] * 0.9, 0.006, F.col('fWhite'), 'feather');
  }
};
/* a vexillum: a pole from (x, y, z) of parent, h tall, a crossbar, a banner hanging (and swinging) from it,
   phalerae down the pole, a gilt finial. o: { h, w, bh, paint, finial:'sun'|'orb'|'hand', discs } */
IZ.vexillum = function (F, R, name, parent, x, y, z, o) {
  const h = o.h || 2.6, w = o.w || 0.8, bh = o.bh || 0.9;
  R.dangle(name, parent, x, y, z, { mode: 'whip', len: h, k: 26, c: 3.2, wind: 0.015, max: 0.25 });
  R.on(name);
  F.cy(0, h / 2, 0, 0.045, 0.04, h, F.col('woodDk'), 'wood', 'y', 8);
  F.cy(0, 0.05, 0, 0.07, 0.07, 0.14, F.col('bronze'), 'bronze', 'y', 8);
  /* the crossbar, tassels at its ends */
  const cy = h - 0.35;
  F.cy(0, cy, 0.06, 0.03, 0.03, w + 0.2, F.col('wood'), 'wood', 'x', 6);
  for (const s of [-1, 1]) {
    F.knob(s * (w / 2 + 0.1), cy, 0.06, 0.045, F.col('gold'), 'gold');
    F.rod(s * (w / 2 + 0.1), cy, 0.06, s * (w / 2 + 0.1), cy - 0.3, 0.06, 0.008, F.col('rope'), 'rope');
    F.cy(s * (w / 2 + 0.1), cy - 0.36, 0.06, 0.025, 0.05, 0.12, F.col('crimson'), 'hair', 'y', 6);
  }
  /* phalerae down the pole, under the crossbar */
  for (let i = 0; i < (o.discs || 3); i++) IZ.phalera(F, 0, cy - bh - 0.25 - i * 0.24, 0.06, 0, 0, 1, 0.1);
  /* the finial */
  if (o.finial === 'orb') {
    F.knob(0, h + 0.12, 0, 0.14, F.col('gold'), 'gold');
    F.ring(0, h + 0.12, 0, 0, 0, 1, 0.17, 0.02, F.col('gold'), 'gold', 14);
    F.cy(0, h + 0.36, 0, 0.02, 0.02, 0.22, F.col('gold'), 'gold', 'y', 6);
  } else if (o.finial === 'hand') {
    F.cb(0, h + 0.14, 0, 0.16, 0.2, 0.06, F.col('gold'), 'gold');
    for (let k = 0; k < 4; k++) F.cb(-0.06 + k * 0.04, h + 0.3, 0, 0.03, 0.14, 0.05, F.col('gold'), 'gold');
  } else IZ.sun(F, 0, h + 0.16, 0, 0, 0, 1, 0.24);
  /* the banner swings from the crossbar */
  R.dangle(name + '_cloth', name, 0, cy, 0.06, { mode: 'hang', len: bh, k: 12, c: 2.2, wind: 0.03, max: 0.5 });
  R.banner({ bone: name + '_cloth', kind: 'hang', x: 0, y: -0.02, z: 0, w: w, h: bh, paint: o.paint || IZ.paint(F, 'sun'), flutter: 0.03 });
};
/* a sashimono: a springy pole from (x, y, z) of parent, h tall, with a short arm at the top from which a long
   flag hangs beside the pole. o: { h, w, bh, paint, side (+1 the arm reaches +x) } */
IZ.sashimono = function (F, R, name, parent, x, y, z, o) {
  const h = o.h || 2.4, w = o.w || 0.55, bh = o.bh || 1.6, s = o.side || 1;
  R.dangle(name, parent, x, y, z, { mode: 'whip', len: h, k: 20, c: 2.6, wind: 0.02, max: 0.3 });
  R.on(name);
  F.cy(0, h / 2, 0, 0.04, 0.032, h, F.col('woodDk'), 'wood', 'y', 8);
  F.cy(0, 0.05, 0, 0.065, 0.065, 0.14, F.col('bronze'), 'bronze', 'y', 8);
  F.cy(s * w / 2, h - 0.05, 0, 0.025, 0.025, w + 0.08, F.col('wood'), 'wood', 'x', 6);
  F.knob(s * (w + 0.05), h - 0.05, 0, 0.04, F.col('gold'), 'gold');
  F.cy(0, h + 0.1, 0, 0.05, 0.005, 0.22, F.col('gold'), 'gold', 'y', 6);
  R.banner({ bone: name, kind: 'hang', x: s * w / 2, y: h - 0.08, z: 0, w: w, h: bh, paint: o.paint || IZ.paint(F, 'sun'), flutter: 0.04 });
};
/* legion numerals in raised bars (I, V, X) on a plate facing +z, centred at (x, y, z), h tall */
IZ.numeral = function (F, x, y, z, s, h, col) {
  const cw = h * 0.6, bw = h * 0.17, x0 = x - (s.length * cw) / 2 + cw / 2;
  col = col == null ? F.col('cream') : col;
  for (let i = 0; i < s.length; i++) {
    const cx = x0 + i * cw, C = s[i];
    if (C === 'I') F.cb(cx, y, z, bw, h, 0.03, col, 'paint');
    else if (C === 'V') { for (const t of [-1, 1]) F.cb(cx + t * cw * 0.16, y, z, bw, h * 1.02, 0.03, col, 'paint', 0, 0, t * 0.33); }
    else if (C === 'X') { for (const t of [-1, 1]) F.cb(cx, y, z, bw, h * 1.1, 0.03, col, 'paint', 0, 0, t * 0.55); }
  }
  F.cb(x, y + h / 2 + bw * 0.8, z, s.length * cw, bw * 0.7, 0.03, col, 'paint');
  F.cb(x, y - h / 2 - bw * 0.8, z, s.length * cw, bw * 0.7, 0.03, col, 'paint');
};
/* a scutum: a tall curved shield (radius of curve rc) w wide and h tall, its face toward +z, centred at (x, y, z);
   orange face, bronze rim, a gilt boss with the sun's rays painted round it */
IZ.scutum = function (F, x, y, z, w, h, rc) {
  const th = w / rc, segs = 8;
  const mk = function (r, col, fam, inward) {
    const g = new THREE.CylinderGeometry(r, r, h, segs, 1, true, -th / 2, th);
    g.translate(0, 0, -rc);
    if (inward) {   /* the back face: wound the other way, normals turned in */
      const ix = g.index;
      for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); }
      const nr = g.attributes.normal;
      for (let i = 0; i < nr.count; i++) nr.setXYZ(i, -nr.getX(i), -nr.getY(i), -nr.getZ(i));
    }
    return _add(new THREE.Mesh(g, mat(col, fam)));
  };
  const front = mk(rc, F.col('orange'), 'paint'); front.position.set(x, y, z);
  const back = mk(rc - 0.06, F.col('steelDk'), 'metal', true); back.position.set(x, y, z);
  /* rim: top and bottom arcs, two edges */
  for (const sy of [-1, 1]) for (let i = 0; i < segs; i++) {
    const a0 = -th / 2 + th * i / segs, a1 = a0 + th / segs;
    F.rod(x + Math.sin(a0) * rc, y + sy * h / 2, z + Math.cos(a0) * rc - rc, x + Math.sin(a1) * rc, y + sy * h / 2, z + Math.cos(a1) * rc - rc, 0.04, F.col('bronze'), 'bronze');
  }
  for (const sx of [-1, 1]) F.cb(x + Math.sin(sx * th / 2) * rc, y, z + Math.cos(th / 2) * rc - rc, 0.07, h + 0.06, 0.08, F.col('bronze'), 'bronze', 0, sx * th / 2, 0);
  /* a cream band round the face, the boss, rays */
  for (const sy of [-1, 1]) for (let i = 0; i < segs; i++) {
    const a = -th / 2 + th * (i + 0.5) / segs;
    F.cb(x + Math.sin(a) * (rc + 0.005), y + sy * (h / 2 - 0.12), z + Math.cos(a) * (rc + 0.005) - rc, w / segs * 1.02, 0.07, 0.02, F.col('cream'), 'paint', 0, a, 0);
  }
  IZ.sun(F, x, y, z + 0.02, 0, 0, 1, Math.min(w, h) * 0.28);
  F.sph(x, y, z + 0.06, 0.13, 0.13, 0.09, F.col('gold'), 'gold', 10, 6);
};
/* livery: a cream-edged orange panel with a teal line, w x h, facing +z, t thick */
IZ.panel = function (F, x, y, z, w, h, t, rx, ry, rz) {
  F.cb(x, y, z, w, h, t, F.col('orange'), 'paint', rx, ry, rz);
  return F;
};
