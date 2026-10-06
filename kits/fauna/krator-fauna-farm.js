/* ======================================================================
   Krator Fauna: farm (kits/fauna/krator-fauna-farm.js)
   The farmyard and pasture animals the settled peoples keep, ported from the static box-and-ball props the settlement
   kits drew (each entry's `source` lists every build that draws it): the water buffalo and ducks of the Reed Lake people,
   the Highlands' cattle (dairy cow, ox, the Painted Men's shaggy highland cow), sheep, pigs, hens and horses, the yak of
   Xanadu and the Dalab lizard. Silhouettes and palettes are the originals'; the legs now have elbows, knees, hocks and
   hooves, and ears, tails and wings are parts the runtime turns. Metres (every source build is in metres).
   (The goat is in krator-fauna-livestock.js.)
   ====================================================================== */

/* ---------------------------------------------------------------- shared helpers */
/* a smooth curve through points P (Catmull-Rom, by chord length) with radii R per point (a number or [half-width,
   half-height]), eased between points: returns [c(t), r(t)] for A.tube */
function faFmCurve(P, R) {
  const n = P.length, cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]));
  const T = cum[n - 1] || 1;
  const seg = t => { const d = Math.min(1, Math.max(0, t)) * T; let k = 0; while (k < n - 2 && cum[k + 1] < d) k++;
    return [k, Math.min(1, Math.max(0, (d - cum[k]) / Math.max(1e-9, cum[k + 1] - cum[k])))]; };
  const c = t => { const [k, f] = seg(t), p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(n - 1, k + 2)], f2 = f * f, f3 = f2 * f;
    const o = []; for (let j = 0; j < 3; j++) o.push(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * f + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * f2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * f3));
    return o; };
  const rr = q => Array.isArray(q) ? q : [q, q];
  const r = t => { const [k, f] = seg(t), e = f * f * (3 - 2 * f), a = rr(R[k]), b = rr(R[k + 1]); return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; };
  return [c, r];
}
/* a tube through points with radii; colf(p, t, angle) gets the centre-line point. Its ends are closed with a rounded
   cap (an ellipsoid along the curve's end) rather than A.tube's flat caps, whose faces wind inward (KNOWN_ISSUES) */
function faFmTube(A, fam, P, R, nt, ns, colf, caps) {
  const [c, r] = faFmCurve(P, R);
  A.tube(fam, c, r, nt, ns, null, { caps: false, colf: (t, a) => colf(c(t), t, a, r(t)) });
  if (caps !== false) for (const e of [0, 1]) faFmEnd(A, fam, c(e), c(e ? 0.97 : 0.03), r(e), colf(c(e), e, Math.PI / 2, r(e)));
  return [c, r];
}
/* an ellipsoid closing a tube's end at p (q: a point a little way back along it), its section [hw, hh] */
function faFmEnd(A, fam, p, q, hr, col) {
  if (hr[0] < 0.004) return;
  const tx = p[0] - q[0], ty = p[1] - q[1], tz = p[2] - q[2], L = Math.hypot(tx, ty, tz) || 1;
  A.ellip(fam, p[0], p[1], p[2], hr[0], hr[1], Math.min(hr[0], hr[1]) * 0.9, col, { rx: -Math.asin(Math.max(-1, Math.min(1, ty / L))), ry: Math.atan2(tx, tz), seg: 10 });
}
/* a jointed limb: a straight tapered tube per segment (so the section never twists where A.tube's frame would flip
   between a sloped and a near-vertical run) and a rounded joint at every point (elbow, knee, hock, fetlock);
   colf(p, t) with t from the first point (0) to the last (1) */
function faFmChain(A, fam, P, R, ns, colf, hidden0) {
  const n = P.length, rr = q => Array.isArray(q) ? q : [q, q];
  for (let i = 0; i < n; i++) { const q = rr(R[i]), t = i / (n - 1), p = P[i];
    if (i > 0 || hidden0 === false) A.ellip(fam, p[0], p[1], p[2], q[0], (q[0] + q[1]) / 2, q[1], colf(p, t), { seg: Math.max(q[0], q[1]) > 0.07 ? 8 : 6 });   /* the first joint is buried in the body; a slim joint needs fewer sides */
    if (i < n - 1) { const a = P[i], b = P[i + 1], qa = q, qb = rr(R[i + 1]);
      A.tube(fam, u => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], u => [qa[0] + (qb[0] - qa[0]) * u, qa[1] + (qb[1] - qa[1]) * u], 2, ns, null,
        { caps: false, colf: (u) => colf([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], (i + u) / (n - 1)) }); }
  }
}
/* sRGB [r,g,b] of a hex scaled by k, and a mix of two hexes */
function faFmShade(hex, k) { const c = new THREE.Color(hex); return [Math.min(1, c.r * k), Math.min(1, c.g * k), Math.min(1, c.b * k)]; }
function faFmMix(a, b, f) { const A = new THREE.Color(a), B = new THREE.Color(b); return [A.r + (B.r - A.r) * f, A.g + (B.g - A.g) * f, A.b + (B.b - A.b) * f]; }
/* a hoof on the ground under (x, z): 'cloven' (two claws), 'solid' (a horse's) */
function faFmHoof(A, x, z, type, r, h, col) {
  if (type === 'solid') { A.cone('hoof', [x, 0, z + r * 0.12], [x, h, z], r, r * 0.8, col, 10); return; }
  for (const d of [-1, 1]) A.ellip('hoof', x + d * r * 0.5, h / 2, z + r * 0.3, r * 0.5, h / 2, r * 0.95, col, { seg: 8, ry: d * 0.08 });
}

/* ---------------------------------------------------------------- the hoofed quadruped (cattle, buffalo, yak, horse,
   sheep, pig): one builder fed each species' numbers, at scale K (variant x breed). B:
     body   [[z, y, hw, hh] ...] rump to chest: the barrel, capped
     coat(x, y, z, a)  colour at a point (a: the section angle, 0 the top)
     neckPivot, neck {pts, rad}, head {pts, rad, col(p, t, a)}  the head part (neck and head turn together to graze)
     eyes [x, y, z, r], ears {piv, at, r, rx, ry, rz, col}, horn {pts, rad, col, tip} (left; mirrored)
     legs {F, FR, H, HR (left fore and hind chains: shoulder, elbow, knee, cannon, fetlock, pastern), hoof, hoofR,
           hoofH, hoofCol, col(p, t, front)}
     tail {pts, rad, col, tuft: {n, len, w, col}, smooth (one tube, not a jointed chain), fam}
     fam   the material family of the body, neck, head, ears and legs (default 'coat'); bodyFam, headFam, legFam, earFam
           override it part by part (a sheep's fleece is coat, its face and legs sleek)
     extraBody(P), extraHead(P)  species extras (udder, wool, mane, skirt) */
function faFmHoofed(A, B) {
  const K = B.K, P = p => [p[0] * K, p[1] * K, p[2] * K], PP = a => a.map(P), RR = a => a.map(q => Array.isArray(q) ? [q[0] * K, q[1] * K] : q * K);
  const coat = B.coat, mir = a => a.map(p => [-p[0], p[1], p[2]]), F0 = B.fam || 'coat';
  const FB = B.bodyFam || F0, FH = B.headFam || F0, FL = B.legFam || F0, FE = B.earFam || FH;
  /* the barrel */
  const bc = faFmTube(A, FB, PP(B.body.map(b => [0, b[1], b[0]])), RR(B.body.map(b => [b[2], b[3]])), B.bodyNt || 16, B.bodyNs || 14,
    (p, t, a, q) => coat(p[0] + Math.sin(a) * q[0], p[1] + Math.cos(a) * q[1], p[2], a), true);
  if (B.extraBody) B.extraBody(P, bc);
  /* the head with the neck */
  A.part('head', P(B.neckPivot), () => {
    const nc = faFmTube(A, B.neckFam || FB, PP(B.neck.pts), RR(B.neck.rad), B.neck.nt || 6, 12, (p, t, a, q) => coat(p[0] + Math.sin(a) * q[0], p[1] + Math.cos(a) * q[1], p[2], a), true);
    faFmTube(A, FH, PP(B.head.pts), RR(B.head.rad), B.head.nt || 9, 12, (p, t, a, q) => B.head.col ? B.head.col(p, t, a) : coat(p[0], p[1] + Math.cos(a) * q[1], p[2], a), true);
    if (B.eyes) for (const s of [-1, 1]) { const e = B.eyes;
      A.ellip('eye', s * e[0] * K, e[1] * K, e[2] * K, e[3] * K, e[3] * K * 0.85, e[3] * K, 0x2a1a0e, { seg: 8 });
      A.ellip('eye', s * (e[0] + e[3] * 0.45) * K, e[1] * K, (e[2] + e[3] * 0.3) * K, e[3] * 0.5 * K, e[3] * 0.55 * K, e[3] * 0.4 * K, 0x050403, { seg: 6 }); }
    if (B.horn) for (const s of [-1, 1]) { const h = B.horn;
      faFmTube(A, 'horn', PP(s > 0 ? h.pts : mir(h.pts)), RR(h.rad), h.nt || 12, 8, (p, t) => h.colf ? h.colf(t) : (t > 0.82 ? h.tip : h.col), true); }
    if (B.extraHead) B.extraHead(P, nc);
  });
  if (B.ears) for (const s of [-1, 1]) { const e = B.ears;
    A.part(s > 0 ? 'earL' : 'earR', P([s * e.piv[0], e.piv[1], e.piv[2]]), () => {
      A.ellip(FE, s * e.at[0] * K, e.at[1] * K, e.at[2] * K, e.r[0] * K, e.r[1] * K, e.r[2] * K, e.col, { rx: e.rx || 0, ry: s * (e.ry || 0), rz: s * (e.rz || 0), seg: 10 });
      if (e.inner) A.ellip('skin', s * (e.at[0] + 0.004) * K, (e.at[1] + e.r[1] * 0.35) * K, e.at[2] * K, e.r[0] * 0.8 * K, e.r[1] * 0.5 * K, e.r[2] * 0.7 * K, e.inner, { rx: e.rx || 0, ry: s * (e.ry || 0), rz: s * (e.rz || 0), seg: 8 });
    }); }
  /* the legs: leg0 fore left, leg1 fore right, leg2 hind left, leg3 hind right, each turning about its top */
  const L = B.legs;
  [[L.F, L.FR, 1, 0], [mir(L.F), L.FR, 1, 1], [L.H, L.HR, 0, 2], [mir(L.H), L.HR, 0, 3]].forEach(([ch, rad, front, i]) => {
    A.part('leg' + i, P(ch[0]), () => {
      faFmChain(A, FL, PP(ch), RR(rad), 9, (p, t) => L.col(p, t, front));
      const f = P(ch[ch.length - 1]);
      faFmHoof(A, f[0], f[2] + (L.hoofZ || 0) * K, L.hoof, L.hoofR * K, L.hoofH * K, L.hoofCol);
      if (L.extra) L.extra(P, ch, front, i);
    });
  });
  /* the tail */
  if (B.tail) A.part('tail', P(B.tail.pts[0]), () => {
    const T = B.tail, tp = PP(T.pts);
    if (T.curly || T.smooth) faFmTube(A, T.fam || FB, tp, RR(T.rad), T.nt || 8, T.ns || 7, (p, t) => T.colf ? T.colf(t) : T.col, true); else faFmChain(A, T.fam || FB, tp, RR(T.rad), 7, (p, t) => T.colf ? T.colf(t) : T.col);
    if (T.tuft) { const lk = [], e = tp[tp.length - 1], e0 = tp[Math.max(0, tp.length - 2)];
      for (let k = 0; k < T.tuft.n; k++) { const f = A.rnd() * (T.tuft.spread == null ? 0.5 : T.tuft.spread), sa = A.rnd() * TAU;   /* the hair rises from the last stretch of the tail, each strip turned its own way */
        lk.push({ at: [e[0] + (e0[0] - e[0]) * f + A.rr(-0.012, 0.012) * K, e[1] + (e0[1] - e[1]) * f, e[2] + (e0[2] - e[2]) * f], dir: T.tuft.dir || [A.rr(-0.25, 0.25), -1, A.rr(-0.3, 0.1)], side: [Math.cos(sa), 0, Math.sin(sa)],
          len: T.tuft.len * K * A.rr(0.75, 1.15), w: T.tuft.w * K, col: T.tuft.col, curl: T.tuft.curl || 0.1 }); }
      A.locks('hair', lk); }
  });
}

/* ======================================================================
   CATTLE: four variants. The Iron Republic's dairy cow and plough ox (Highlands 79-rep-land: a 1.85 m box body on
   0.74 m post legs, a darker head box, a dark muzzle, short cream horns), the Rustic Clansmen's brown cows (80-rus-dwell)
   and the Painted Men's shaggy red highland cow with its wide horns (84-tri-dwell).
   ====================================================================== */
const FA_FM_COW = [[-0.95, 1.2, .16, .18], [-0.82, 1.17, .31, .31], [-0.45, 1.08, .37, .4], [0.05, 1.07, .38, .43], [0.45, 1.1, .34, .4], [0.75, 1.12, .27, .33], [0.9, 1.15, .15, .2]];
ANIMAL({
  key: 'cattle', name: 'Cattle', group: 'farm',
  tags: { biomes: ['nhighlands', 'nwlowlands'], koppen: ['Cfb', 'Dfb', 'Dfc'], aridity: ['subhumid', 'humid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['republic', 'rustic', 'painted-men'], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs'] },
  size: { length: 2.6, height: 1.5 },
  source: [{ build: 'settlements/highlands', file: 'src/79-rep-land.js', lines: '23-30', note: 'hnRCBeast cow and ox: the Iron Republic\'s farms: the ox at the plough (125), the cattle paddock and shelter (156), a cow at the byre door (103)' },
    { build: 'settlements/highlands', file: 'src/80-rus-dwell.js', lines: '51-61', note: 'hnRUBeast cow: the Rustic Clansmen\'s brown cows: at the farmstead (206), the village byre and paddock (81-rus-village 265, 293), the salvage farm (81b-rus-salvage 56)' },
    { build: 'settlements/highlands', file: 'src/84-tri-dwell.js', lines: '99-107', note: 'hnTRBeast cow: the Painted Men\'s shaggy highland cow in pens and byres (85-tri-village 179, 222)' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: false, draught: true, eggs: false },
  yields: { meat: { amount: 230, note: 'a cow dressed; an ox 330' }, milk: { amount: 9, note: 'a dairy cow in milk, about 280 days a year; a highland cow 4' },
    hide: { amount: 1, hideM2: 4.2, note: 'leather: boots, harness, belts' }, horn: { amount: 0.8, note: 'an ox\'s or a highland cow\'s: cups, horn panes, combs' },
    hair: { amount: 0.4, note: 'the highland cow\'s long coat, combed in spring: rope and felt' } },
  life: { maturity: 1.5, lifespan: 20, litter: 1, gestation: 283 },
  variants: 4, variantNames: ['dairy cow, piebald (Republic)', 'cow, brown (Rustic)', 'ox (the Republic\'s plough ox)', 'highland cow, shaggy red (Painted Men)'],
  w: 0.8, d: 2.65, h: 1.65,
  variantDims: [{ w: 0.8, d: 2.65, h: 1.65 }, { w: 0.8, d: 2.65, h: 1.65 }, { w: 0.95, d: 2.95, h: 2.05 }, { w: 1.3, d: 2.45, h: 1.6 }],
  data: { mass: [550, 480, 800, 420], legs: 4, speed: { walk: 1.2, run: 7 }, gait: { type: 'quadruped', freq: 1.0, stride: 0.7 }, grazePitch: 1.2,
    herd: 'a farm\'s few cows and a team of oxen; the Painted Men keep two or three in the byre under the house', fleeDistance: 3, aggression: 0.1,
    /* an ox WORKs in place of the grazing hours: the plough, the cart */
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'MILK', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'MILK', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, ox = v === 2, hl = v === 3, K = (ox ? 1.1 : hl ? 0.9 : 1) * A.S;
    const base = [0xe8e0d4, 0x7a5238, 0x6a4a32, 0x8a4a2a][v], dark = [0x2e2622, 0x5a3a28, 0x4a3222, 0x6a3a22][v];
    const coat = (x, y, z, a) => {
      if (v === 0) return faNoise(x * 3.2 + 1.7, y * 3.2, z * 3.2) > 0.5 ? dark : base;
      if (v === 1) return a != null && Math.cos(a) < -0.6 ? 0x9a6a44 : base;
      if (ox) return z > 0.5 ? faFmMix(base, dark, 0.5) : base;
      return faFmMix(base, 0xa0602e, faNoise(x * 6, y * 6, z * 6) * 0.6);
    };
    const W = ox ? 1.06 : hl ? 1.06 : 1;
    const horn = ox ? { pts: [[.07, 1.42, 1.1], [.22, 1.46, 1.11], [.34, 1.56, 1.15], [.38, 1.7, 1.2], [.34, 1.8, 1.21]], rad: [.045, .04, .03, .02, .008] }
      : hl ? { pts: [[.07, 1.42, 1.1], [.25, 1.43, 1.11], [.45, 1.48, 1.12], [.6, 1.58, 1.1], [.66, 1.72, 1.06]], rad: [.046, .04, .03, .02, .008] }
      : { pts: [[.07, 1.42, 1.1], [.17, 1.45, 1.11], [.25, 1.52, 1.14], [.27, 1.6, 1.16]], rad: [.035, .03, .02, .008] };
    horn.col = hl ? 0xd8ccb0 : 0xe8e0cc; horn.tip = 0x3a3028;
    faFmHoofed(A, { K: K, coat: coat, fam: hl ? 'coat' : 'sleek',   /* short sleek hair; the highland cow's thick shaggy coat */
      body: FA_FM_COW.map(b => [b[0], b[1], b[2] * W, b[3]]),
      neckPivot: [0, 1.05, 0.55],
      neck: { pts: [[0, 1.15, .55], [0, 1.25, .8], [0, 1.3, 1.0], [0, 1.34, 1.1]], rad: [[.26 * W, .32], [.21 * W, .28], [.17, .22], [.15, .19]] },
      head: { pts: [[0, 1.4, 1.08], [0, 1.33, 1.22], [0, 1.2, 1.37], [0, 1.1, 1.47], [0, 1.07, 1.5]], rad: [[.14, .15], [.13, .145], [.11, .115], [.1, .085], [.08, .06]],
        col: (p, t) => t > 0.84 ? 0x3a2a24 : v === 0 ? (t < 0.35 ? coat(p[0], p[1], p[2]) : base) : t > 0.5 && !hl ? faFmShade(base, 0.85) : coat(p[0], p[1], p[2]) },
      eyes: [.12, 1.31, 1.25, .022],
      ears: { piv: [.12, 1.35, 1.12], at: [.2, 1.34, 1.12], r: [.09, .025, .045], rz: -0.3, col: v === 0 ? dark : base, inner: 0xc89a88 },
      horn: horn,
      legs: { F: [[.2, 1.0, .55], [.2, .7, .5], [.195, .55, .51], [.19, .38, .53], [.19, .22, .54], [.19, .1, .56], [.19, .065, .59]],
        FR: [[.13, .16], [.1, .115], [.08, .09], [.064, .07], [.05, .056], [.058, .062], [.05, .05]],
        H: [[.21, 1.08, -.62], [.215, .8, -.5], [.205, .62, -.64], [.2, .46, -.74], [.2, .28, -.7], [.2, .1, -.66], [.2, .065, -.63]],
        HR: [[.17, .21], [.13, .15], [.09, .11], [.064, .085], [.05, .056], [.058, .062], [.05, .05]],
        hoof: 'cloven', hoofR: .06, hoofH: .07, hoofCol: 0x2a2420,
        col: (p, t, front) => v === 0 ? (p[1] < 0.42 * K ? base : coat(p[0], p[1], p[2])) : faFmShade(base, p[1] < 0.4 * K ? 0.8 : 0.92) },
      tail: { pts: [[0, 1.42, -.95], [0, 1.38, -1.02], [0, 1.15, -1.06], [0, .85, -1.05], [0, .62, -1.03]], rad: [.035, .03, .024, .02, .016], col: v === 0 ? base : faFmShade(base, 0.9),
        tuft: { n: 8, len: 0.2, w: 0.04, col: faFmShade(dark, 0.8) } },
      extraBody: (P) => {
        if (v === 0 || v === 1) {   /* the udder between the hind legs: four quarters, a teat under each (the dairy cow's the fuller) */
          const u = v === 0 ? 1 : 0.8, uc = 0xd8aaa0;
          A.ellip('skin', 0, .7 * K, -.52 * K, .15 * u * K, .1 * K, .18 * u * K, uc, { seg: 14 });
          for (const tx of [-.065, .065]) for (const tz of [-.45, -.6]) {
            A.ellip('skin', tx * u * K, (.66 - .02 * (1 - u)) * K, tz * K, .085 * u * K, .085 * u * K, .085 * u * K, uc, { seg: 10 });
            A.cone('skin', P([tx * u, .6 + .04 * (1 - u), tz]), P([tx * u, .52 + .06 * (1 - u), tz + .01]), .017 * K, .013 * K, 0xc8968c, 7); }
        }
        if (v === 0) for (const s of [-1, 1]) A.ellip('sleek', s * .24 * K, 1.38 * K, -.72 * K, .06 * K, .05 * K, .08 * K, coat(s * .25, 1.4, -.72));   /* the hip bones */
        if (ox) A.ellip('sleek', 0, 1.36 * K, .55 * K, .2 * K, .14 * K, .22 * K, faFmMix(base, dark, 0.5));   /* the ox's heavy crest over the shoulders */
        if (hl) {   /* the highland cow's long coat: locks over back, sides and rump */
          const lk = [];
          for (let i = 0; i < 150; i++) { const zf = A.rnd(), a = (A.rnd() < 0.5 ? -1 : 1) * A.rr(0.5, 1.6), z = (-0.9 + 1.75 * zf) * K;   /* flanks and sides, not the spine */
            const row = FA_FM_COW[Math.min(FA_FM_COW.length - 1, Math.max(0, Math.round(zf * (FA_FM_COW.length - 1))))];
            const at = [Math.sin(a) * row[2] * W * K * 0.98, (row[1] + Math.cos(a) * row[3] * 0.98) * K, z];
            lk.push({ at: at, dir: [Math.sin(a) * 0.7, -1, A.rr(-0.2, 0.05)], len: A.rr(0.16, 0.32) * K, w: A.rr(0.05, 0.08) * K, col: coat(at[0], at[1], at[2]), curl: 0.25 }); }
          A.locks('hair', lk);
        }
      },
      extraHead: (P) => {
        A.ellip(hl ? 'coat' : 'sleek', 0, 1.0 * K, .78 * K, .045 * K, (ox ? .17 : .13) * K, .26 * K, coat(0, 1.0, .82), { rx: -0.45, seg: 10 });   /* the dewlap: a fold from the throat to the brisket */
        for (const s of [-1, 1]) A.ellip('mouth', s * .035 * K, 1.1 * K, 1.535 * K, .016 * K, .012 * K, .008 * K, 0x120c0a, { seg: 6 });
        if (hl) {   /* the fringe over the eyes and the hairy cheeks */
          const lk = [];
          for (let i = 0; i < 26; i++) { const x = A.rr(-0.11, 0.11);
            lk.push({ at: P([x, 1.43, 1.12 + A.rr(-0.03, 0.04)]), dir: [x * 2, -0.6, 1], len: A.rr(0.14, 0.24) * K, w: 0.05 * K, col: faFmMix(base, 0xa0602e, A.rnd() * 0.6), curl: 0.5 }); }
          for (let i = 0; i < 30; i++) { const s = A.rnd() < 0.5 ? -1 : 1, t = A.rnd();
            lk.push({ at: P([s * (0.12 + 0.06 * t), 1.38 - 0.25 * t, 0.62 + 0.45 * t]), dir: [s * 0.4, -1, 0.1], len: A.rr(0.15, 0.28) * K, w: 0.06 * K, col: faFmMix(base, 0xa0602e, A.rnd() * 0.6), curl: 0.3 }); }
          A.locks('hair', lk);
        }
      } });
    A.anchor('yoke', [0, 1.5 * K, 0.62 * K]); A.anchor('lead', [0, 1.1 * K, 1.5 * K]);
  }
});

/* ======================================================================
   WATER BUFFALO: the Reed Lake people's big dark beast (75-rl-helpers hnRLBeast 'buffalo': a 2.3 m body on 0.72 m legs,
   the head carried low and forward, sweeping crescent horns of four dark segments). It works the island farms and
   wallows in the shallows.
   ====================================================================== */
const FA_FM_BUF = [[-1.1, 1.24, .2, .24], [-0.9, 1.2, .4, .4], [-0.35, 1.14, .46, .47], [.25, 1.15, .46, .48], [.72, 1.18, .38, .44], [.98, 1.2, .26, .32], [1.08, 1.22, .14, .19]];
ANIMAL({
  key: 'water-buffalo', name: 'Water buffalo', group: 'farm',
  tags: { biomes: ['eastabyss'], koppen: ['Am', 'Aw', 'Af'], aridity: ['subhumid', 'humid'], climate: ['hypertropic', 'tropic'], riparian: 'riparian', abyssal: true,
    domestic: true, herdedBy: ['lake-people'], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'marsh', 'shallows', 'water', 'pen'], locomotion: ['walks', 'runs', 'wades', 'swims'] },
  size: { length: 3.0, height: 1.65 },
  source: [{ build: 'settlements/reedlake', file: 'src/75-rl-helpers.js', lines: '212-222', note: 'hnRLBeast buffalo: the Reed Lake people\'s farm island (79-rl-farm 17); LORE 6.10 "water buffalo"' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 300, note: 'dressed; eaten at feasts, the rest of the year it works' }, milk: { amount: 5, note: 'rich milk, about 250 days a year: curd and ghee' },
    hide: { amount: 1, hideM2: 5, note: 'thick leather: boat lashings, shields, sandals' }, horn: { amount: 2.5, note: 'a pair: bows, knife grips, the puma prows\' inlay' } },
  life: { maturity: 2.5, lifespan: 25, litter: 1, gestation: 315 },
  variants: 2, variantNames: ['cow, slate grey', 'bull, near-black, heavy horns'],
  w: 1.45, d: 3.05, h: 2.05,
  variantDims: [{ w: 1.45, d: 3.05, h: 2.05 }, { w: 1.7, d: 3.3, h: 2.3 }],
  data: { mass: [650, 850], legs: 4, speed: { walk: 1.1, run: 6 }, gait: { type: 'quadruped', freq: 0.9, stride: 0.75 }, grazePitch: 1.15,
    herd: 'one or two to an island farm; a child rides it down to the water', fleeDistance: 2, aggression: 0.15,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'MILK', 'WORK', 'WORK', 'WORK', 'SWIM', 'SWIM', 'SWIM', 'SWIM', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'MILK', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = (v ? 1.08 : 1) * A.S, hk = v ? 1.15 : 1;
    const base = v ? 0x3e3630 : 0x4a4038;
    const coat = (x, y, z) => faFmMix(base, 0x56483e, faNoise(x * 4, y * 4, z * 4) * 0.5);
    faFmHoofed(A, { K: K, coat: coat, body: FA_FM_BUF, fam: 'sleek',   /* near-hairless grey hide under a sparse sleek coat */
      neckPivot: [0, 1.12, 0.8],
      neck: { pts: [[0, 1.2, .8], [0, 1.28, 1.05], [0, 1.33, 1.22]], rad: [[.3, .36], [.24, .3], [.19, .23]] },
      head: { pts: [[0, 1.42, 1.24], [0, 1.34, 1.42], [0, 1.2, 1.6], [0, 1.1, 1.7], [0, 1.07, 1.73]], rad: [[.18, .18], [.17, .17], [.14, .14], [.125, .095], [.1, .07]],
        col: (p, t) => t > 0.86 ? 0x2a2420 : coat(p[0], p[1], p[2]) },
      eyes: [.15, 1.36, 1.46, .024],
      ears: { piv: [.16, 1.4, 1.3], at: [.25, 1.36, 1.3], r: [.1, .03, .05], rz: -0.25, col: base, inner: 0x6a5a54 },
      /* the crescent horns: out from the poll, then up and sweeping back (ridged) */
      horn: { pts: [[.1, 1.5, 1.3], [.36 * hk, 1.58, 1.24], [.58 * hk, 1.72, 1.06], [.66 * hk, 1.88, .84 - 0.05 * v], [.6 * hk, 1.98 + 0.08 * v, .66 - 0.08 * v]], rad: [.075, .065, .048, .03, .012], nt: 16,
        colf: t => t > 0.86 ? 0x1e1a18 : faFmShade(0x3a3230, 0.85 + 0.25 * (0.5 + 0.5 * Math.sin(t * 60))) },
      legs: { F: [[.27, 1.0, .75], [.27, .7, .7], [.265, .55, .71], [.26, .38, .73], [.26, .22, .74], [.26, .1, .75], [.26, .065, .78]],
        FR: [[.16, .19], [.12, .135], [.095, .105], [.075, .08], [.06, .066], [.066, .07], [.06, .06]],
        H: [[.27, 1.05, -.78], [.275, .8, -.66], [.265, .63, -.78], [.26, .46, -.88], [.26, .28, -.84], [.26, .1, -.8], [.26, .065, -.77]],
        HR: [[.19, .23], [.15, .17], [.105, .125], [.075, .095], [.06, .066], [.066, .07], [.06, .06]],
        hoof: 'cloven', hoofR: .068, hoofH: .07, hoofCol: 0x1e1a18,
        col: (p) => faFmShade(base, p[1] < 0.45 * K ? 0.8 : 0.92) },
      tail: { pts: [[0, 1.52, -1.1], [0, 1.45, -1.17], [0, 1.15, -1.2], [0, .85, -1.18], [0, .7, -1.16]], rad: [.04, .035, .028, .022, .018], col: base,
        tuft: { n: 7, len: 0.2, w: 0.045, col: 0x1e1a18 } },
      extraHead: (P) => { for (const s of [-1, 1]) A.ellip('mouth', s * .045 * K, 1.1 * K, 1.8 * K, .016 * K, .012 * K, .008 * K, 0x0c0a08, { seg: 6 }); } });
    A.anchor('yoke', [0, 1.6 * K, 0.85 * K]); A.anchor('saddle', [0, 1.62 * K, 0.1 * K]); A.anchor('lead', [0, 1.1 * K, 1.8 * K]);
  }
});

/* ======================================================================
   YAK: the beast of the Vale of Xanadu (72-xa-helpers xnYak: a shaggy 1.9 m box on 0.6 m legs, a low head, pale horns
   flung out sideways). Long skirt hair, the hump at the withers, a bushy tail.
   ====================================================================== */
const FA_FM_YAK = [[-0.95, 1.0, .2, .22], [-0.78, .98, .36, .38], [-0.3, 1.0, .41, .43], [.2, 1.05, .42, .47], [.55, 1.1, .37, .5], [.82, 1.02, .27, .38], [.95, .96, .15, .22]];
ANIMAL({
  key: 'yak', name: 'Yak', group: 'farm',
  tags: { biomes: ['xanadu'], koppen: ['Cfb', 'Dfb', 'ET'], aridity: ['semiarid', 'subhumid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['xanadu'], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'climbs'] },
  size: { length: 2.6, height: 1.6 },
  source: [{ build: 'settlements/xanadu', file: 'src/72-xa-helpers.js', lines: '283-288', note: 'xnYak: the valley\'s beast at the farmhouse (74-xa-dwell 30), the farm and its yard (76-xa-farm 32, 59), the Farmers\' guild yard (79-xa-guild 34) and the hill terraces (82-xa-hill 26)' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 160, note: 'dressed, dried in strips for winter' }, milk: { amount: 1.6, note: 'very rich: butter for the temple lamps and the tea' },
    hide: { amount: 1, hideM2: 3.6, note: 'boots, boat skins, the herders\' tents' }, hair: { amount: 1.5, note: 'the long skirt hair, cut each summer: tent cloth, rope, slings' },
    wool: { amount: 0.6, note: 'the soft down combed out in spring: the finest shawls of the valley' }, horn: { amount: 1.5, note: 'a pair' } },
  life: { maturity: 3, lifespan: 22, litter: 1, gestation: 258 },
  variants: 3, variantNames: ['black', 'brown', 'dun'],
  w: 1.5, d: 2.65, h: 1.65,
  data: { mass: [450, 420, 400], legs: 4, speed: { walk: 1.1, run: 7 }, gait: { type: 'quadruped', freq: 1.0, stride: 0.6 }, grazePitch: 0.9,
    herd: 'a family\'s few in the yard; the herds go up to the high pastures in summer', fleeDistance: 5, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'MILK', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'MILK', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = A.S, base = [0x2a221c, 0x4a3a2c, 0x6a5040][v], lite = [0x3a2c22, 0x6a5040, 0x8a6a50][v];
    const coat = (x, y, z) => faFmMix(base, lite, faNoise(x * 5 + v, y * 5, z * 5) * 0.55);
    faFmHoofed(A, { K: K, coat: coat, body: FA_FM_YAK,
      neckPivot: [0, 0.95, 0.75],
      neck: { pts: [[0, 1.0, .75], [0, .98, .95], [0, .96, 1.08]], rad: [[.26, .32], [.2, .26], [.16, .2]] },
      head: { pts: [[0, 1.02, 1.1], [0, .94, 1.24], [0, .8, 1.38], [0, .7, 1.46]], rad: [[.15, .16], [.14, .15], [.1, .11], [.09, .08]],
        col: (p, t) => t > 0.84 ? faFmShade(base, 0.7) : coat(p[0], p[1], p[2]) },
      eyes: [.125, .98, 1.24, .02],
      ears: { piv: [.14, 1.03, 1.12], at: [.2, 1.0, 1.13], r: [.07, .02, .04], rz: -0.3, col: base },
      horn: { pts: [[.08, 1.1, 1.12], [.28, 1.12, 1.12], [.45, 1.18, 1.14], [.55, 1.3, 1.18], [.56, 1.42, 1.2]], rad: [.045, .04, .03, .018, .008], col: 0xd8d0c0, tip: 0x4a4038 },
      legs: { F: [[.25, .95, .6], [.25, .68, .55], [.24, .38, .57], [.24, .22, .58], [.24, .1, .59], [.24, .065, .61]],
        FR: [[.13, .16], [.09, .11], [.06, .065], [.048, .052], [.055, .058], [.048, .048]],
        H: [[.25, 1.0, -.62], [.25, .75, -.52], [.24, .44, -.72], [.24, .27, -.69], [.24, .1, -.65], [.24, .065, -.62]],
        HR: [[.16, .2], [.12, .14], [.062, .075], [.048, .052], [.055, .058], [.048, .048]],
        hoof: 'cloven', hoofR: .055, hoofH: .07, hoofCol: 0x1a1612,
        col: (p) => faFmShade(base, p[1] < 0.4 * K ? 0.85 : 1) },
      /* the bushy tail: a short dock and a broom of long hair */
      tail: { pts: [[0, 1.3, -.95], [0, 1.25, -1.0], [0, 1.08, -1.05], [0, .86, -1.06], [0, .66, -1.04], [0, .5, -1.0]],
        rad: [[.05, .05], [.05, .05], [.065, .06], [.085, .075], [.08, .07], [.03, .03]], nt: 12, ns: 9, col: faFmShade(base, 0.9), smooth: true, fam: 'hair',
        tuft: { n: 22, len: 0.28, w: 0.07, col: faFmShade(base, 0.9), dir: [0, -1, -0.1], spread: 1 } },
      extraBody: (P, bc) => {
        /* the skirt: a ragged sheet of long hair down each side, and locks over it, the hump and the belly */
        const [c, r] = bc;
        for (const s of [-1, 1]) A.sheet('hair', (u, w) => { const t = 0.08 + 0.82 * u, p = c(t), q = r(t), hem = (0.3 + 0.04 * Math.sin(u * 17 + s) + 0.03 * Math.sin(u * 43)) * K;
          return [s * (q[0] * 0.97 + 0.05 * w * K), p[1] + (hem - p[1]) * w, p[2]]; }, 16, 4, null, { colf: (u, w) => faFmShade(base, 1 - 0.25 * w) });
        const lk = [];
        for (let i = 0; i < 150; i++) { const t = 0.06 + 0.88 * A.rnd(), p = c(t), q = r(t), a = (A.rnd() < 0.5 ? -1 : 1) * A.rr(0.55, 1.7);   /* not on the spine, where a hanging lock would stand into the back and show only its root */
          const at = [Math.sin(a) * q[0] * 1.01, p[1] + Math.cos(a) * q[1] * 1.01, p[2]];
          lk.push({ at: at, dir: [Math.sin(a) * 0.7, -1, A.rr(-0.15, 0.1)], len: A.rr(0.18, 0.4) * K * (Math.abs(a) > 1.1 ? 1.3 : 1), w: A.rr(0.05, 0.08) * K, col: coat(at[0], at[1], at[2]), curl: 0.18 }); }
        A.locks('hair', lk);
      },
      extraHead: (P) => {
        const lk = [];   /* the throat fringe and the forelock */
        for (let i = 0; i < 22; i++) { const t = A.rnd(), x = A.rr(-0.15, 0.15);
          lk.push({ at: P([x, 0.78 + 0.12 * t, 0.8 + 0.35 * t]), dir: [x, -1, -0.1], len: A.rr(0.2, 0.36) * K, w: 0.07 * K, col: coat(x, 0.8, 0.9), curl: 0.15 }); }
        for (let i = 0; i < 10; i++) lk.push({ at: P([A.rr(-0.1, 0.1), 1.12, 1.13]), dir: [0, -0.5, 1], len: A.rr(0.12, 0.2) * K, w: 0.05 * K, col: lite, curl: 0.5 });
        A.locks('hair', lk);
        for (const s of [-1, 1]) A.ellip('mouth', s * .035 * K, .72 * K, 1.53 * K, .014 * K, .01 * K, .008 * K, 0x0c0a08, { seg: 6 });
      } });
    A.anchor('pack', [0, 1.6 * K, 0.1 * K]); A.anchor('saddle', [0, 1.55 * K, -0.1 * K]); A.anchor('lead', [0, 0.8 * K, 1.5 * K]);
  }
});

/* ======================================================================
   HORSE: the Iron Republic's horse (75-rep-trade hnRAHorse: an ellipsoid barrel at 1.28 m on 1.12 m legs, a raised neck,
   a long head angled down, a dark mane and tail, dark hooves; HRA_HORSE its six coats) and the Rustic Clansmen's box
   horse (80-rus-dwell hnRUBeast 'horse').
   ====================================================================== */
/* a full barrel, the croup and withers level at about 1.65 m, the belly under 1 m, rounded hindquarters */
const FA_FM_HORSE = [[-0.86, 1.33, .12, .16], [-0.78, 1.35, .25, .28], [-0.56, 1.33, .3, .32], [-0.2, 1.29, .31, .35], [0.15, 1.3, .3, .35], [0.45, 1.34, .27, .32], [0.64, 1.37, .21, .26], [0.76, 1.39, .11, .15]];
ANIMAL({
  key: 'horse', name: 'Horse', group: 'farm',
  tags: { biomes: ['nhighlands', 'nwlowlands'], koppen: ['Cfb', 'Dfb', 'Dfc'], aridity: ['semiarid', 'subhumid', 'humid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['republic', 'rustic'], diet: 'herbivore', feeding: 'grazer', activity: 'cathemeral', temperament: 'wary',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps'] },
  size: { length: 2.5, height: 1.62 },
  source: [{ build: 'settlements/highlands', file: 'src/75-rep-trade.js', lines: '39-45', note: 'hnRAHorse: the Iron Republic\'s horses at the inn\'s hitching rail (142), the coaching yard (194), the stables (383, 393) and before the wagons (440)' },
    { build: 'settlements/highlands', file: 'src/80-rus-dwell.js', lines: '51-61', note: 'hnRUBeast horse: the Rustic Clansmen\'s stable lean-to (81-rus-village 153), the paddock (81-rus-village 293), the salvage farm (81b-rus-salvage 117)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 200, note: 'eaten only in hard winters, or an old horse at the end' }, hide: { amount: 1, hideM2: 3.6, note: 'strong leather: harness, belts' },
    hair: { amount: 0.3, note: 'mane and tail hair: bowstrings, fiddle bows, brushes, the Republic\'s horsehair upholstery' } },
  life: { maturity: 3, lifespan: 28, litter: 1, gestation: 340 },
  variants: 4, variantNames: ['bay, black points', 'black', 'dun', 'grey'],
  w: 0.7, d: 2.56, h: 2.2,
  data: { mass: 520, legs: 4, speed: { walk: 1.6, run: 13 }, gait: { type: 'quadruped', freq: 1.1, stride: 0.9 }, grazePitch: 1.5,
    herd: 'a team of two to a cart, four to a coach; the coaching inns stable a dozen', fleeDistance: 8, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'GRAZE', 'REST', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'REST'] },
  build: function (A) {
    const v = A.variant, K = A.S, base = [0x6a4a30, 0x2a2420, 0x8a6a4a, 0xa89880][v], mane = [0x1e1a16, 0x161210, 0x3a2a1e, 0x6a645a][v];
    const coat = (x, y, z) => v === 3 ? faFmMix(base, 0xd0c8b8, faNoise(x * 8, y * 8, z * 8) > 0.6 ? 0.5 : 0.1) : base;
    const points = v === 0 || v === 2;
    faFmHoofed(A, { K: K, coat: coat, body: FA_FM_HORSE, bodyNt: 18, fam: 'sleek',
      /* the neck: deep where it springs from the shoulder and chest, thinning to the throat */
      neckPivot: [0, 1.36, 0.5],
      neck: { pts: [[0, 1.4, .52], [0, 1.58, .74], [0, 1.78, .9], [0, 1.94, 1.0]], rad: [[.22, .34], [.16, .26], [.12, .19], [.1, .14]], nt: 10 },
      /* the head: broad at the jowls, a straight face to a soft muzzle */
      head: { pts: [[0, 1.99, 1.0], [0, 1.9, 1.1], [0, 1.74, 1.23], [0, 1.58, 1.34], [0, 1.51, 1.38]], rad: [[.085, .11], [.1, .14], [.085, .1], [.065, .075], [.06, .062]], nt: 10,
        col: (p, t) => t > 0.8 ? faFmShade(base, 0.55) : coat(p[0], p[1], p[2]) },
      eyes: [.092, 1.9, 1.1, .024],
      ears: { piv: [.05, 2.04, 1.0], at: [.055, 2.11, .99], r: [.025, .07, .032], rz: -0.15, col: base, inner: faFmShade(base, 0.6) },
      /* equine legs: (fore) point of shoulder, elbow, the muscled forearm, knee, the flat cannon, fetlock, sloped pastern;
         (hind) hip, stifle, the gaskin, hock, cannon, fetlock, pastern */
      legs: { F: [[.14, 1.22, .56], [.15, 1.0, .42], [.152, .84, .44], [.15, .53, .46], [.15, .46, .46], [.15, .2, .46], [.15, .16, .47], [.15, .07, .52]],
        FR: [[.1, .14], [.08, .1], [.068, .088], [.052, .064], [.038, .05], [.035, .047], [.05, .058], [.038, .042]],
        H: [[.14, 1.38, -.5], [.17, 1.02, -.36], [.165, .8, -.52], [.155, .56, -.7], [.15, .5, -.69], [.15, .2, -.67], [.15, .16, -.665], [.15, .07, -.61]],
        HR: [[.13, .2], [.09, .13], [.08, .11], [.05, .08], [.04, .055], [.036, .048], [.05, .058], [.038, .042]],
        hoof: 'solid', hoofR: .062, hoofH: .09, hoofCol: 0x2a2420, hoofZ: .02,
        col: (p) => points && p[1] < 0.55 * K ? mane : coat(p[0], p[1], p[2]) },
      /* the tail: the dock and a full fall of hair to the hocks */
      tail: { pts: [[0, 1.52, -.9], [0, 1.47, -.97], [0, 1.36, -1.02], [0, 1.15, -1.05], [0, .9, -1.04], [0, .7, -1.01]],
        rad: [[.05, .055], [.055, .058], [.062, .062], [.078, .066], [.072, .06], [.03, .03]], nt: 14, ns: 9, col: mane, smooth: true, fam: 'hair',
        tuft: { n: 30, len: 0.32, w: 0.07, col: mane, dir: [0, -1, -0.08], curl: 0.05, spread: 1 } },
      extraHead: (P, nc) => {
        /* the mane: a crest of hair along the top of the neck, falling to the left, and the forelock */
        const [c, r] = nc, lk = [], crest = [], cr = [];
        const top = t => { const p = c(t), a = c(Math.max(0, t - 0.01)), b = c(Math.min(1, t + 0.01)), dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dy, dz) || 1, q = r(t)[1] * 0.93;
          return [0, p[1] + dz / L * q, p[2] - dy / L * q]; };
        for (const t of [0.1, 0.35, 0.6, 0.85, 1]) { crest.push(top(t)); cr.push([0.03 * K, 0.045 * K]); }
        faFmTube(A, 'hair', crest, cr, 10, 7, () => mane, true);
        for (let i = 0; i < 56; i++) { const t = 0.1 + 0.9 * (i / 55), p = top(t), s = A.rnd() < 0.8 ? 1 : -1;
          lk.push({ at: [s * 0.015 * K, p[1], p[2]], dir: [s * 0.9, -1, 0.15], len: A.rr(0.16, 0.26) * K, w: 0.075 * K, col: mane, curl: 0.15 }); }
        for (let i = 0; i < 8; i++) lk.push({ at: P([A.rr(-0.02, 0.02), 2.06, 1.02]), dir: [0, -0.7, 1], len: A.rr(0.12, 0.18) * K, w: 0.04 * K, col: mane, curl: 0.3 });
        A.locks('hair', lk);
        /* the round cheeks (the jowls) and the nostrils, the mouth line */
        for (const s of [-1, 1]) A.ellip('sleek', s * .068 * K, 1.83 * K, 1.1 * K, .045 * K, .1 * K, .1 * K, coat(0, 1.83, 1.1), { rx: 0.9, seg: 10 });
        for (const s of [-1, 1]) A.ellip('mouth', s * .036 * K, 1.54 * K, 1.405 * K, .012 * K, .018 * K, .008 * K, 0x0c0a08, { seg: 6 });
        for (const s of [-1, 1]) A.cone('mouth', P([s * .045, 1.47, 1.39]), P([s * .06, 1.5, 1.3]), .005 * K, .005 * K, 0x1a1210, 4);
      } });
    A.anchor('saddle', [0, 1.66 * K, 0.05 * K]); A.anchor('bridle', [0, 1.75 * K, 1.25 * K]); A.anchor('harness', [0, 1.5 * K, 0.6 * K]);
  }
});

/* ======================================================================
   SHEEP: the Republic's sheepfold (79-rep-land hnRCBeast 'sheep': a woolly ball on four thin dark legs, a dark face) and
   the Rustic Clansmen's wattle fold (80-rus-dwell hnRUBeast 'sheep'). Fleece as lumps of wool over the barrel.
   ====================================================================== */
const FA_FM_SHEEP = [[-0.5, .66, .14, .15], [-0.42, .66, .27, .26], [-0.1, .65, .31, .29], [.2, .66, .3, .28], [.4, .68, .24, .24], [.5, .7, .13, .15]];
ANIMAL({
  key: 'sheep', name: 'Sheep', group: 'farm',
  tags: { biomes: ['nhighlands', 'nwlowlands'], koppen: ['Cfb', 'Dfb', 'Dfc'], aridity: ['semiarid', 'subhumid', 'humid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['republic', 'rustic'], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'leaps'] },
  size: { length: 1.3, height: 0.95 },
  source: [{ build: 'settlements/highlands', file: 'src/79-rep-land.js', lines: '31-32', note: 'hnRCBeast sheep: the Iron Republic\'s sheepfold (157)' },
    { build: 'settlements/highlands', file: 'src/80-rus-dwell.js', lines: '51-61', note: 'hnRUBeast sheep: the Rustic Clansmen\'s wattle fold, with goats (81-rus-village 301)' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 25, note: 'a ewe dressed; mutton and the winter\'s salt lamb' }, milk: { amount: 0.6, note: 'the Rustic Clansmen milk their ewes for cheese, about 150 days' },
    wool: { amount: 3, note: 'shorn each summer: the Republic\'s broadcloth, the clansmen\'s homespun' }, hide: { amount: 1, hideM2: 0.8, note: 'sheepskin coats, parchment' } },
  life: { maturity: 1, lifespan: 11, litter: 1.4, gestation: 150 },
  variants: 3, variantNames: ['ewe, white', 'ewe, black', 'lamb'],
  w: 0.75, d: 1.37, h: 0.98,
  variantDims: [{ w: 0.75, d: 1.37, h: 0.98 }, { w: 0.75, d: 1.37, h: 0.98 }, { w: 0.45, d: 0.82, h: 0.6 }],
  data: { mass: [65, 65, 18], legs: 4, speed: { walk: 1.0, run: 7 }, gait: { type: 'quadruped', freq: 1.6, stride: 0.4 }, grazePitch: 0.95,
    herd: 'a fold of 7 to 40 with a shepherd and a dog', fleeDistance: 6, aggression: 0.02,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'MILK', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = (v === 2 ? 0.6 : 1) * A.S, wool = v === 1 ? 0x4a4038 : 0xeae4d6, wool2 = v === 1 ? 0x3a322c : 0xdcd4c2, face = v === 1 ? 0x221e1a : 0x2e2a26;
    const coat = (x, y, z) => faFmMix(wool, wool2, faNoise(x * 9, y * 9, z * 9));
    faFmHoofed(A, { K: K, coat: coat, body: FA_FM_SHEEP, fam: 'coat', headFam: 'sleek', legFam: 'sleek',   /* the fleece thick wool; the bare face and legs short sleek hair */
      neckPivot: [0, 0.68, 0.36],
      neck: { pts: [[0, .7, .36], [0, .78, .48], [0, .83, .54]], rad: [[.13, .15], [.09, .1], [.07, .08]] },
      head: { pts: [[0, .86, .52], [0, .82, .6], [0, .74, .69], [0, .7, .72]], rad: [[.065, .075], [.06, .07], [.045, .05], [.035, .035]], col: () => face },
      eyes: [.052, .82, .6, .014],
      ears: { piv: [.07, .84, .55], at: [.11, .83, .55], r: [.06, .015, .028], rz: 0.35, col: face },
      legs: { F: [[.12, .55, .3], [.12, .4, .28], [.115, .24, .3], [.115, .12, .3], [.115, .05, .31], [.115, .04, .32]],
        FR: [[.07, .08], [.045, .05], [.03, .03], [.022, .024], [.026, .028], [.022, .022]],
        H: [[.12, .58, -.3], [.12, .42, -.24], [.115, .25, -.35], [.115, .13, -.33], [.115, .05, -.31], [.115, .04, -.3]],
        HR: [[.085, .1], [.06, .07], [.03, .035], [.022, .024], [.026, .028], [.022, .022]],
        hoof: 'cloven', hoofR: .026, hoofH: .04, hoofCol: 0x1a1612,
        col: (p, t) => t < 0.28 ? coat(p[0], p[1], p[2]) : face,
        extra: (P, ch, front) => { const q = P(ch[1]), q0 = P(ch[0]);   /* the fleece down over the forearm or the thigh */
          A.ellip('coat', (q[0] + q0[0]) / 2, (q[1] + q0[1]) / 2, (q[2] + q0[2]) / 2, (front ? .072 : .088) * K, .1 * K, (front ? .08 : .1) * K, null, { seg: 7, colf: (x, y, z) => coat(x, y, z) }); } },
      tail: { pts: [[0, .76, -.5], [0, .7, -.56], [0, .58, -.58]], rad: [.05, .045, .035], col: wool },
      extraBody: (P, bc) => {
        /* the fleece: low, close-set locks of wool over back, sides and rump, sunk so only their crowns show (a dense
           fleece with a crimped surface, not loose balls of cotton) */
        const [c, r] = bc;
        for (let i = 0; i < 44; i++) { const t = 0.05 + 0.9 * (i + A.rnd()) / 44, p = c(t), q = r(t), a = A.rr(-1, 1) * 2.1, s = A.rr(0.075, 0.1) * K;
          const nx = Math.sin(a) / q[0], ny = Math.cos(a) / q[1], nl = Math.hypot(nx, ny), dn = s * 0.2;   /* each a flat cushion lying on the barrel, turned to its normal */
          const x = Math.sin(a) * q[0] - nx / nl * dn, y = p[1] + Math.cos(a) * q[1] - ny / nl * dn;
          A.ellip('coat', x, y, p[2], s * 1.1, s * 0.55, s * 1.25, null, { seg: 6, rz: -Math.atan2(nx, ny), colf: (dx, dy, dz) => coat(x + dx, y + dy, p[2] + dz) }); }
      },
      extraHead: (P) => { A.ellip('coat', 0, .875 * K, .5 * K, .075 * K, .055 * K, .08 * K, null, { seg: 8, colf: (x, y, z) => coat(x, y + 0.87, z + 0.5) }); } });
    A.anchor('lead', [0, 0.75 * K, 0.5 * K]);
  }
});

/* ======================================================================
   PIG: the Republic's pigsty (79-rep-land hnRCBeast 'pig': a pink box on short posts, a snout box), the Rustic and
   Painted Men's dark hill pigs (80-rus-dwell, 84-tri-dwell) and the post-apoc pen's pink pigs (kits/post-apoc 50-farm).
   ====================================================================== */
/* a deep rounded barrel: full hams and shoulders, the back gently arched, the belly about 0.2 m off the ground */
const FA_FM_PIG = [[-0.55, .5, .1, .12], [-0.49, .5, .21, .23], [-0.36, .5, .28, .3], [-0.12, .5, .3, .32], [.12, .5, .3, .32], [.28, .5, .28, .31], [.4, .51, .22, .26], [.47, .52, .12, .16]];
ANIMAL({
  key: 'pig', name: 'Pig', group: 'farm',
  tags: { biomes: ['nhighlands', 'nwlowlands'], koppen: ['Cfb', 'Dfb', 'Cfa'], aridity: ['subhumid', 'humid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['republic', 'rustic', 'painted-men', 'post-apoc'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs'] },
  size: { length: 1.4, height: 0.82 },
  source: [{ build: 'settlements/highlands', file: 'src/79-rep-land.js', lines: '33-34', note: 'hnRCBeast pig: the Iron Republic\'s pigsty yard (157)' },
    { build: 'settlements/highlands', file: 'src/80-rus-dwell.js', lines: '51-61', note: 'hnRUBeast pig: the Rustic Clansmen\'s pig by the hearth (102) and the village pig pen (81-rus-village 308)' },
    { build: 'settlements/highlands', file: 'src/84-tri-dwell.js', lines: '99-107', note: 'hnTRBeast pig: the Painted Men\'s pens (85-tri-village 223)' },
    { build: 'kits/post-apoc', file: 'src/50-farm.js', lines: '53-61', note: 'fmPen: three pink pigs in the goat and pig pen (any settlement that takes the set)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 85, note: 'a baconer dressed: hams, sausage, lard; the autumn slaughter' }, hide: { amount: 1, hideM2: 1.3, note: 'pigskin: gloves, saddle seats' },
    hair: { amount: 0.2, note: 'the bristles: brushes' } },
  life: { maturity: 0.8, lifespan: 15, litter: 9, gestation: 114 },
  variants: 3, variantNames: ['sow, pink', 'hill pig, black (Rustic and Painted Men)', 'piglet'],
  w: 0.65, d: 1.56, h: 0.86,
  variantDims: [{ w: 0.65, d: 1.56, h: 0.86 }, { w: 0.65, d: 1.56, h: 0.9 }, { w: 0.3, d: 0.7, h: 0.4 }],
  data: { mass: [160, 140, 12], legs: 4, speed: { walk: 0.9, run: 5 }, gait: { type: 'quadruped', freq: 1.8, stride: 0.3 }, grazePitch: 0.8,
    herd: 'three or four in a sty; the Painted Men\'s pigs run loose under the houses', fleeDistance: 3, aggression: 0.12,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = (v === 2 ? 0.45 : 1) * A.S, base = [0xe0a898, 0x5a4a44, 0xe0b0a0][v], deep = [0xc88a7a, 0x3e322e, 0xd89888][v];
    const coat = (x, y, z, a) => a != null && Math.cos(a) < -0.5 ? faFmMix(base, deep, 0.35) : faFmMix(base, deep, faNoise(x * 6, y * 6, z * 6) * 0.2);
    const fam = v === 1 ? 'sleek' : 'skin', hoofCol = v === 1 ? 0x1e1a18 : 0x6a4a40;   /* the pink pigs: bare skin; the hill pig: a bristly coat */
    faFmHoofed(A, { K: K, coat: coat, body: FA_FM_PIG, fam: fam,
      /* no neck to speak of: the shoulders run straight into a heavy head */
      neckPivot: [0, 0.52, 0.36],
      neck: { pts: [[0, .52, .34], [0, .54, .45]], rad: [[.26, .28], [.22, .24]], nt: 3 },
      head: { pts: [[0, .56, .44], [0, .52, .55], [0, .47, .66], [0, .43, .75], [0, .415, .8]], rad: [[.18, .18], [.155, .16], [.11, .115], [.08, .08], [.072, .07]],
        col: (p, t) => t > 0.92 ? deep : faFmMix(base, deep, 0.15) },
      eyes: [.112, .6, .58, .014],
      ears: { piv: [.08, .68, .47], at: [.11, .69, .54], r: [.06, .012, .09], rx: 0.5, ry: 0.35, col: v === 1 ? base : deep },
      /* short sturdy legs, straight under the body, on small trotters */
      legs: { F: [[.14, .42, .26], [.14, .27, .22], [.135, .14, .25], [.135, .065, .26], [.135, .04, .28]],
        FR: [[.1, .11], [.075, .08], [.056, .06], [.046, .046], [.04, .04]],
        H: [[.14, .44, -.36], [.145, .29, -.28], [.135, .15, -.38], [.135, .065, -.36], [.135, .04, -.34]],
        HR: [[.13, .15], [.09, .1], [.056, .06], [.046, .046], [.04, .04]],
        hoof: 'cloven', hoofR: .036, hoofH: .045, hoofCol: hoofCol,
        col: (p) => p[1] < 0.1 * K ? faFmShade(base, 0.9) : base,
        extra: (P, ch) => { const f = P(ch[ch.length - 2]);   /* the dewclaws behind the pastern */
          for (const d of [-1, 1]) A.ellip('hoof', f[0] + d * .024 * K, .07 * K, f[2] - .04 * K, .012 * K, .018 * K, .012 * K, hoofCol, { seg: 6 }); } },
      /* the curly tail, high on the rump */
      tail: { pts: [[0, .6, -.56], [.02, .62, -.6], [0, .65, -.625], [-.025, .62, -.635], [0, .59, -.645], [.02, .61, -.665]], rad: [.014, .012, .011, .01, .009, .007], nt: 12, col: base, curly: true },
      extraBody: (P) => {
        if (v === 0) for (let k = 0; k < 6; k++) for (const s of [-1, 1]) {   /* the sow's two rows of teats */
          const z = -0.25 + k * 0.09; A.cone(fam, P([s * .07, .21, z]), P([s * .07, .17, z]), .012 * K, .008 * K, deep, 6); }
        if (v === 1) {   /* the hill pig's bristly crest */
          const lk = [];
          for (let i = 0; i < 30; i++) { const z = A.rr(-0.4, 0.4); lk.push({ at: P([A.rr(-0.02, 0.02), 0.8, z]), dir: [A.rr(-0.5, 0.5), 1, -0.3], len: A.rr(0.05, 0.09) * K, w: 0.025 * K, col: 0x2a221e, curl: 0.05 }); }
          A.locks('hair', lk);
        }
      },
      extraHead: (P) => {
        for (const s of [-1, 1]) A.ellip(fam, s * .08 * K, .42 * K, .52 * K, .08 * K, .08 * K, .11 * K, faFmMix(base, deep, 0.2), { seg: 10 });   /* the heavy jowls */
        A.ellip(fam, 0, .415 * K, .858 * K, .074 * K, .068 * K, .018 * K, deep, { seg: 14 });   /* the snout disc */
        for (const s of [-1, 1]) A.ellip('mouth', s * .024 * K, .418 * K, .874 * K, .011 * K, .016 * K, .006 * K, 0x2a1a16, { seg: 6 });
        for (const s of [-1, 1]) A.cone('mouth', P([s * .062, .375, .79]), P([s * .082, .39, .65]), 0.006 * K, 0.006 * K, 0x3a2420, 4);   /* the mouth line */
      } });
    A.anchor('lead', [0, 0.6 * K, 0.6 * K]);
  }
});

/* ---------------------------------------------------------------- the farmyard bird (hen, duck): two legs on the ground,
   the wings folded on the flanks as parts (wingL, wingR: a hen barely flies, a duck flies, but both walk: gait biped, so
   the runtime leaves the wings folded), the head with the neck, the tail */
function faFmBird(A, B) {
  const K = B.K, P = p => [p[0] * K, p[1] * K, p[2] * K];
  for (const e of B.body) A.ellip('feather', e[0] * K, e[1] * K, e[2] * K, e[3] * K, e[4] * K, e[5] * K, null, { rx: e[6] || 0, seg: 14, colf: (x, y, z) => B.coat(e[0] * K + x, e[1] * K + y, e[2] * K + z) });
  A.part('head', P(B.neckPivot), () => {
    faFmChain(A, 'feather', B.neck.pts.map(P), B.neck.rad.map(q => [q[0] * K, q[1] * K]), 10, (p) => B.neckCol ? B.neckCol(p) : B.coat(p[0], p[1], p[2]), false);
    const h = B.head; A.ellip('feather', h[0] * K, h[1] * K, h[2] * K, h[3] * K, h[4] * K, h[5] * K, null, { seg: 12, colf: (x, y, z) => B.headCol ? B.headCol(x, y, z) : B.coat(h[0] * K + x, h[1] * K + y, h[2] * K + z) });
    for (const s of [-1, 1]) { const e = B.eyes;
      A.ellip('eye', s * e[0] * K, e[1] * K, e[2] * K, e[3] * K, e[3] * K, e[3] * K, B.eyeCol || 0x2a1a0e, { seg: 8 });
      A.ellip('eye', s * (e[0] + e[3] * 0.5) * K, e[1] * K, e[2] * K, e[3] * 0.5 * K, e[3] * 0.5 * K, e[3] * 0.5 * K, 0x050403, { seg: 6 }); }
    B.extraHead(P);
  });
  for (const s of [-1, 1]) A.part(s > 0 ? 'wingL' : 'wingR', P([s * B.wing.piv[0], B.wing.piv[1], B.wing.piv[2]]), () => {
    for (const w of B.wing.parts) A.ellip('feather', s * w[0] * K, w[1] * K, w[2] * K, w[3] * K, w[4] * K, w[5] * K, null, { rx: w[6] || 0, ry: s * (w[7] || 0), seg: 12, colf: (x, y, z) => B.wingCol(y / (w[4] * K), z / (w[5] * K), w) });
  });
  A.part('tail', P(B.tailPivot), () => B.tail(P));
  for (const s of [-1, 1]) A.part(s > 0 ? 'leg0' : 'leg1', P([s * B.hip[0], B.hip[1], B.hip[2]]), () => B.leg(P, s));
}

/* ======================================================================
   HEN: the Republic's farmyard hens (79-rep-land hnRCBeast 'hen': a ball body, a red head ball) and the post-apoc coop's
   hens (kits/post-apoc 50-farm fmCoop), white, red-brown, dark brown; and the cock that keeps them.
   ====================================================================== */
ANIMAL({
  key: 'hen', name: 'Hen', group: 'farm',
  tags: { biomes: ['nhighlands', 'nwlowlands'], koppen: ['Cfb', 'Dfb', 'Cfa'], aridity: ['semiarid', 'subhumid', 'humid'], climate: ['temperate', 'cold'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['republic', 'post-apoc'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'flies'] },
  size: { length: 0.48, height: 0.46, span: 0.7 },
  source: [{ build: 'settlements/highlands', file: 'src/79-rep-land.js', lines: '35', note: 'hnRCBeast hen: the Iron Republic\'s farmyards (64, 103, 158)' },
    { build: 'kits/post-apoc', file: 'src/50-farm.js', lines: '50-52', note: 'fmCoop: four hens about the coop on wheels (any settlement that takes the set). Voth\'s monastery coops (settlements/voth src/61-monastery.js 79) draw a henhouse but no hens' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 1.2, note: 'a boiling fowl; a cock or a capon 2' }, eggs: { amount: 180, note: 'a laying hen, fewer in winter; none from the cock' },
    feathers: { amount: 0.1, note: 'pillows, fletching' } },
  life: { maturity: 0.5, lifespan: 8, litter: 10, gestation: 21, note: 'litter: a clutch; gestation: the days on the eggs' },
  variants: 4, variantNames: ['hen, white', 'hen, red-brown', 'hen, dark brown', 'cock'],
  w: 0.28, d: 0.5, h: 0.48,
  variantDims: [{ w: 0.28, d: 0.5, h: 0.48 }, { w: 0.28, d: 0.5, h: 0.48 }, { w: 0.28, d: 0.5, h: 0.48 }, { w: 0.32, d: 0.66, h: 0.66 }],
  data: { mass: [2, 2, 2, 3], legs: 2, wings: 1, speed: { walk: 0.5, run: 4 }, gait: { type: 'biped', freq: 2.2, stride: 0.12 }, grazePitch: 1.3,
    herd: 'a flock of 5 to 20 about a farmyard, with one cock', fleeDistance: 2, aggression: 0.05,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'GRAZE', 'GRAZE', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const v = A.variant, cock = v === 3, K = (cock ? 1.12 : 1) * A.S;
    const base = [0xf0ece0, 0xa05a30, 0x5a4030, 0xa05a30][v], hackle = cock ? 0xd89040 : base, red = 0xc23a2a, yel = 0xd8b040;
    const coat = (x, y, z) => v === 2 ? faFmMix(base, 0x8a6a48, faNoise(x * 60, y * 60, z * 60) > 0.6 ? 0.6 : 0) : base;
    faFmBird(A, { K: K, coat: coat,
      body: [[0, .25, -.01, .11, .1, .155, 0.28], [0, .23, .07, .095, .095, .09]],
      neckPivot: [0, .24, .06],
      neck: { pts: [[0, .27, .08], [0, .34, .11], [0, .39, .13]], rad: [[.05, .055], [.04, .042], [.033, .035]] }, neckCol: () => hackle,
      head: [0, .41, .145, .033, .034, .042], headCol: () => cock ? hackle : base, eyes: [.028, .418, .158, .007], eyeCol: 0xc08020,
      extraHead: (P) => {
        A.cone('horn', P([0, .405, .18]), P([0, .395, .215]), .012 * K, .002 * K, yel, 6);   /* the beak */
        const n = cock ? 6 : 4;   /* the comb and the wattles */
        for (let k = 0; k < n; k++) { const f = k / (n - 1), hgt = (cock ? 0.03 : 0.016) * (1 - Math.abs(f - 0.4) * 0.9);
          A.ellip('skin', 0, (.442 + hgt * 0.5) * K, (.165 - f * (cock ? .07 : .045)) * K, .005 * K, hgt * K, .01 * K, red, { seg: 6 }); }
        for (const s of [-1, 1]) A.ellip('skin', s * .008 * K, .372 * K, .172 * K, .008 * K, (cock ? .026 : .016) * K, .011 * K, red, { seg: 6 });
        if (cock) { const lk = []; for (let i = 0; i < 18; i++) { const a = A.rr(-1.6, 1.6); lk.push({ at: P([Math.sin(a) * .035, .37, .12 + Math.cos(a) * .03]), dir: [Math.sin(a) * 0.4, -1, -0.5], len: A.rr(0.07, 0.1) * K, w: 0.02 * K, col: hackle, curl: 0.2 }); } A.locks('feather', lk); }
      },
      wing: { piv: [.09, .29, .06], parts: [[.1, .25, -.02, .028, .07, .125, 0.25], [.09, .225, -.11, .02, .04, .07, 0.4, 0.1]] },
      wingCol: (vy, vz) => cock ? (vz < -0.3 ? 0x1a2420 : faFmShade(base, 0.85)) : faFmShade(base, vy < -0.5 ? 0.78 : 0.9),
      tailPivot: [0, .3, -.13],
      tail: (P) => {
        for (let k = -2; k <= 2; k++) A.ellip('feather', k * .014 * K, .36 * K, -.18 * K, .01 * K, .065 * K, .035 * K, cock ? 0x1a2420 : faFmShade(base, 0.85), { rx: -0.5, rz: k * 0.2, seg: 8 });
        if (cock) { const lk = []; for (let k = 0; k < 7; k++) lk.push({ at: P([A.rr(-0.02, 0.02), .38, -.17]), dir: [A.rr(-0.15, 0.15), 1.2, -0.7], len: A.rr(0.22, 0.32) * K, w: 0.035 * K, col: 0x1a2420, curl: 1.5 }); A.locks('feather', lk); }
      },
      hip: [.045, .18, 0],
      leg: (P, s) => {
        A.ellip('feather', s * .05 * K, .16 * K, -.005 * K, .035 * K, .05 * K, .04 * K, faFmShade(base, 0.95), { seg: 10 });   /* the thigh */
        A.cone('scale', P([s * .045, .125, .005]), P([s * .045, .02, .015]), .011 * K, .009 * K, yel, 6);
        for (const dx of [-0.025, 0, 0.025]) A.cone('scale', P([s * .045, .008, .015]), P([s * .045 + dx, .006, .075]), .007 * K, .003 * K, yel, 5);
        A.cone('scale', P([s * .045, .008, .015]), P([s * .045, .006, -.03]), .006 * K, .003 * K, yel, 5);
        if (cock) A.cone('horn', P([s * .045, .05, .0]), P([s * .045, .045, -.03]), .006 * K, .001 * K, 0xc8b890, 4);   /* the spur */
      } });
    A.anchor('roost', [0, 0.01, 0]);
  }
});

/* ======================================================================
   DUCK: the Reed Lake people's ducks on every island (75-rl-helpers hnRLBeast 'duck': a ball body, a ball head, an orange
   cone bill; white, brown, dun), and Mungo's duck run (its reed village is the Reed Lake kit's).
   ====================================================================== */
ANIMAL({
  key: 'duck', name: 'Duck', group: 'farm',
  tags: { biomes: ['eastabyss'], koppen: ['Am', 'Aw', 'Af'], aridity: ['subhumid', 'humid'], climate: ['hypertropic', 'tropic'], riparian: 'riparian', abyssal: true,
    domestic: true, herdedBy: ['lake-people'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'water', 'shallows', 'marsh', 'pen'], locomotion: ['walks', 'swims', 'flies'] },
  size: { length: 0.52, height: 0.44, span: 0.85 },
  source: [{ build: 'settlements/reedlake', file: 'src/75-rl-helpers.js', lines: '212-216', note: 'hnRLBeast duck: by the lake people\'s houses and island farms (76-rl-dwell 15, 27, 54, 79; 77-rl-village 24; 78-rl-work 48; 79-rl-farm 18, 53)' },
    { build: 'settlements/mungo', file: 'src/reed/90-mungo-reed-glue.js', lines: '43', note: 'ducks on the water round Mungo\'s floating reed village and its fish weir and duck run (the Reed Lake kit run inside the page)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 1.8, note: 'dressed; smoked over the reed fires' }, eggs: { amount: 150, note: 'laid in the reed nests on the islands' },
    feathers: { amount: 0.15, note: 'the down: quilts against the lake\'s night damp' } },
  life: { maturity: 0.6, lifespan: 10, litter: 10, gestation: 28, note: 'litter: a clutch; gestation: the days on the eggs' },
  variants: 3, variantNames: ['white', 'brown', 'dun'],
  w: 0.28, d: 0.58, h: 0.45,
  data: { mass: 2.6, legs: 2, wings: 1, speed: { walk: 0.4, run: 2.5 }, gait: { type: 'biped', freq: 2.0, stride: 0.1 }, grazePitch: 1.2,
    swim: { freq: 0.8, amp: 0.15 }, herd: 'a dozen to an island, driven out onto the water by day', fleeDistance: 3, aggression: 0.02,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'GRAZE', 'SWIM', 'SWIM', 'SWIM', 'SWIM', 'REST', 'REST', 'SWIM', 'SWIM', 'SWIM', 'SWIM', 'GRAZE', 'GRAZE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const v = A.variant, K = A.S, base = [0xf0ece0, 0x6a5a44, 0x9a8a70][v], belly = [0xe8e0d0, 0x8a7a60, 0xb8a888][v], orange = 0xd88a2a;
    const coat = (x, y, z) => y < 0.2 * K ? belly : v === 1 ? faFmMix(base, 0x4a3e30, faNoise(x * 50, y * 50, z * 50) > 0.6 ? 0.7 : 0) : base;
    faFmBird(A, { K: K, coat: coat,
      body: [[0, .22, -.01, .11, .095, .2, 0.05], [0, .21, .09, .095, .09, .1]],
      neckPivot: [0, .23, .12],
      neck: { pts: [[0, .26, .13], [0, .32, .16], [0, .37, .17]], rad: [[.048, .05], [.036, .038], [.032, .034]] },
      head: [0, .39, .18, .042, .042, .052], headCol: v === 1 ? () => 0x5a4a38 : null, eyes: [.034, .4, .195, .007],
      extraHead: (P) => {
        faFmTube(A, 'skin', [P([0, .385, .215]), P([0, .378, .25]), P([0, .372, .278])], [[.024 * K, .012 * K], [.026 * K, .008 * K], [.022 * K, .006 * K]], 5, 8, () => orange, true);   /* the bill */
      },
      wing: { piv: [.09, .25, .08], parts: [[.095, .24, -.03, .028, .06, .14, 0.1]] },
      wingCol: (vy, vz) => v === 1 && vz < -0.1 && vz > -0.55 && vy < -0.2 ? 0x3a4a8a : faFmShade(base, vy < -0.4 ? 0.85 : 0.95),
      tailPivot: [0, .24, -.18],
      tail: (P) => { A.ellip('feather', 0, .26 * K, -.225 * K, .05 * K, .025 * K, .065 * K, faFmShade(base, 0.9), { rx: -0.4, seg: 10 }); },
      hip: [.05, .15, -.05],
      leg: (P, s) => {
        A.ellip('feather', s * .055 * K, .15 * K, -.05 * K, .03 * K, .035 * K, .035 * K, belly, { seg: 8 });   /* the thigh, under the flank feathers */
        A.cone('scale', P([s * .05, .13, -.045]), P([s * .05, .02, -.02]), .011 * K, .01 * K, orange, 6);
        A.ellip('scale', s * .05 * K, .009 * K, .015 * K, .032 * K, .008 * K, .042 * K, orange, { seg: 8 });   /* the webbed foot */
      } });
    A.anchor('roost', [0, 0.01, 0]);
  }
});

/* ======================================================================
   DALAB LIZARD: the fat-bodied, banded ground lizard the Dalab farms keep for meat and hide, 2.4 m nose to tail
   (69e-dalab-helpers DFAUNA 'lizard': a squat ellipsoid body with four cross bands on the back, a two-cone tail, a
   round head, splayed box legs on flat feet, a crest of spines on a bull). The ranch's paddocks hold the meat herds
   (74-dalab-ranch); the travellers' inn tethers bigger, rust-brown riding lizards in its stalls (71c-dalab-town).
   ====================================================================== */
/* t from the tail tip (0) to the snout (1): [t, z, y of the centre line, half-width, half-height] */
const FA_FM_LIZ = [[0, -1.45, .16, .012, .012], [.14, -1.1, .2, .06, .06], [.28, -.72, .26, .14, .13], [.4, -.42, .33, .3, .24], [.52, -.08, .38, .44, .31],
  [.64, .28, .38, .42, .3], [.72, .52, .38, .3, .23], [.78, .66, .38, .22, .17], [.84, .78, .4, .24, .18], [.92, .98, .38, .21, .14], [1, 1.12, .34, .09, .06]];
const FA_FM_LIZ_TAIL = 0.4, FA_FM_LIZ_HEAD = 0.76;
function faFmLizKey(t, i) {
  for (let k = 0; k < FA_FM_LIZ.length - 1; k++) { const a = FA_FM_LIZ[k], b = FA_FM_LIZ[k + 1];
    if (t <= b[0]) { const f = (t - a[0]) / (b[0] - a[0]), e = f * f * (3 - 2 * f); return a[i] + (b[i] - a[i]) * (i >= 3 ? e : f); } }
  return FA_FM_LIZ[FA_FM_LIZ.length - 1][i];
}
/* t at a given z along the body (the table's z rises with t) */
function faFmLizT(z) { for (let k = 0; k < FA_FM_LIZ.length - 1; k++) { const a = FA_FM_LIZ[k], b = FA_FM_LIZ[k + 1]; if (z <= b[1]) return a[0] + (b[0] - a[0]) * Math.max(0, (z - a[1]) / (b[1] - a[1])); } return 1; }
ANIMAL({
  key: 'dalab-lizard', name: 'Dalab lizard', group: 'farm',
  tags: { biomes: ['swlowlands'], koppen: ['Cfa', 'Csa'], aridity: ['semiarid', 'subhumid'], climate: ['tropic', 'temperate'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['dalab'], diet: 'herbivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 2.55, height: 0.72 },
  source: [{ build: 'settlements/dalab', file: 'src/69e-dalab-helpers.js', lines: '222-238', note: 'DFAUNA lizard: the ranch\'s paddocks and herds (74-dalab-ranch 9, 23, 29, 36), and the riding lizards tethered in the travellers\' inn stalls (71c-dalab-town 104-106, scale 1.1-1.5)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: true },
  yields: { meat: { amount: 90, note: 'a meat cow dressed: the lowlands\' common meat' }, eggs: { amount: 24, note: 'one clutch a year, gathered from the paddock nests: a market food' },
    hide: { amount: 1, hideM2: 2.6, note: 'banded lizard leather: the Dalab boots, belts and saddlery' } },
  life: { maturity: 2, lifespan: 25, litter: 18, gestation: 70, note: 'litter: a clutch; gestation: the days to hatching; a product of the genepriests\' breeding program (Daranch)' },
  variants: 4, variantNames: ['cow, olive with ochre bands', 'bull, crested, red bands', 'cow, khaki with teal bands', 'riding lizard, rust-brown'],
  breeds: { meat: { scale: 1, mass: 240, role: 'the ranch\'s meat herd' }, riding: { scale: 1.3, mass: 520, role: 'the inn\'s riding and pack lizard' } },
  w: 1.57, d: 2.62, h: 0.75,
  variantDims: [{ w: 1.57, d: 2.62, h: 0.75 }, { w: 1.57, d: 2.62, h: 0.95 }, { w: 1.57, d: 2.62, h: 0.75 }, { w: 1.57, d: 2.62, h: 0.75 }],
  data: { mass: 240, legs: 4, speed: { walk: 1.0, run: 5 }, gait: { type: 'sprawl', freq: 0.9, stride: 0.6 }, grazePitch: 0.35, sizeRange: [0.7, 1.5],
    herd: 'a paddock of 4 to 8 with a crested bull', fleeDistance: 2, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, S = A.S, hide = [0x6a8a3a, 0x7a9a44, 0x9a8a4a, 0x8a4a2a][v], band = [0xd8a838, 0xa8382a, 0x3f9a88, 0xd8a838][v], belly = faFmMix(hide, 0xd8d0a0, 0.45);
    const BANDS = [-0.37, -0.12, 0.12, 0.37];
    const skin = (t, a) => { const z = faFmLizKey(t, 1), top = Math.cos(a);
      if (top < -0.55) return belly;
      if (top > 0.25 && BANDS.some(b => Math.abs(z - b) < 0.05)) return band;
      return faFmMix(hide, faFmShade(hide, 0.7), faNoise(t * 40, a * 3, 2.3) * 0.5); };
    const span = (t0, t1) => [t => { const tt = t0 + (t1 - t0) * t; return [0, faFmLizKey(tt, 2) * S, faFmLizKey(tt, 1) * S]; }, t => { const tt = t0 + (t1 - t0) * t; return [faFmLizKey(tt, 3) * S, faFmLizKey(tt, 4) * S]; }];
    const at = t => [0, faFmLizKey(t, 2) * S, faFmLizKey(t, 1) * S];
    { const [c, r] = span(FA_FM_LIZ_TAIL - 0.02, FA_FM_LIZ_HEAD + 0.02); A.tube('scale', c, r, 18, 16, null, { colf: (t, a) => skin(FA_FM_LIZ_TAIL - 0.02 + (FA_FM_LIZ_HEAD - FA_FM_LIZ_TAIL + 0.04) * t, a) }); }
    if (v === 1) for (let k = 0; k < 5; k++) { const z = 0.55 - k * 0.125, tz = faFmLizT(z), y = (faFmLizKey(tz, 2) + faFmLizKey(tz, 4)) * S;   /* the bull's crest of spines */
      A.cone('horn', [0, y - 0.04 * S, z * S], [0, y + 0.2 * S * (1 - Math.abs(k - 2) * 0.15), (z - 0.05) * S], 0.04 * S, 0.004 * S, band, 6); }
    A.part('tail', at(FA_FM_LIZ_TAIL), () => { const [c, r] = span(0, FA_FM_LIZ_TAIL + 0.02); A.tube('scale', c, r, 14, 12, null, { caps: false, colf: (t, a) => skin(t * (FA_FM_LIZ_TAIL + 0.02), a) }); });
    A.part('head', at(FA_FM_LIZ_HEAD), () => {
      const [c, r] = span(FA_FM_LIZ_HEAD, 1); A.tube('scale', c, r, 10, 14, null, { caps: false, colf: (t, a) => skin(FA_FM_LIZ_HEAD + (1 - FA_FM_LIZ_HEAD) * t, a) });
      faFmEnd(A, 'scale', c(1), c(0.95), r(1), hide);
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.17 * S, 0.46 * S, 0.93 * S, 0.045 * S, 0.04 * S, 0.045 * S, 0x1a1a10, { seg: 8 });
        A.ellip('eye', s * 0.195 * S, 0.47 * S, 0.94 * S, 0.02 * S, 0.02 * S, 0.02 * S, 0xb89040, { seg: 6 });
        const L = [[s * 0.2, -0.03, 0.82], [s * 0.19, -0.04, 0.98], [s * 0.09, -0.045, 1.1], [0, -0.045, 1.13]].map(q => [q[0] * S, (0.38 + q[1]) * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.01 * S, 0.01 * S, 0x2a1a10, 5);
        A.ellip('mouth', s * 0.04 * S, 0.385 * S, 1.11 * S, 0.01 * S, 0.008 * S, 0.006 * S, 0x0c0a08, { seg: 6 });
      }
    });
    /* the legs: splayed, each about its shoulder or hip: the upper limb out to the elbow or knee, the forearm down to a
       flat five-toed foot */
    const LEGS = [[0.43, 1, 1, 0], [0.43, 1, -1, 1], [-0.43, 0, 1, 2], [-0.43, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * 0.3 * S, 0.32 * S, z * S];
      A.part('leg' + i, b, () => {
        const kn = [s * 0.58 * S, 0.3 * S, (z + (front ? 0.05 : -0.08)) * S], ft = [s * 0.64 * S, 0.035 * S, (z + (front ? 0.14 : 0.02)) * S];
        const lerp3 = (p, q) => t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
        A.tube('scale', lerp3(b, kn), t => [(0.13 - 0.05 * t) * S, (0.12 - 0.04 * t) * S], 4, 10, null, { colf: (t, a) => Math.cos(a) < -0.5 ? belly : hide });
        A.ellip('scale', kn[0], kn[1], kn[2], 0.085 * S, 0.085 * S, 0.085 * S, hide, { seg: 10 });
        A.tube('scale', lerp3(kn, ft), t => [(0.08 - 0.02 * t) * S, (0.08 - 0.025 * t) * S], 4, 8, null, { caps: false, colf: () => hide });
        A.ellip('scale', ft[0], ft[1], ft[2] + 0.04 * S, 0.11 * S, 0.035 * S, 0.13 * S, faFmShade(hide, 0.85), { seg: 10 });
        for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.36 + s * 0.15;
          A.cone('scale', [ft[0], ft[1] - 0.01 * S, ft[2] + 0.06 * S], [ft[0] + Math.sin(a) * 0.15 * S, ft[1] - 0.02 * S, ft[2] + 0.06 * S + Math.cos(a) * 0.15 * S], 0.025 * S, 0.008 * S, faFmShade(hide, 0.8), 5);
          A.cone('horn', [ft[0] + Math.sin(a) * 0.14 * S, ft[1] - 0.02 * S, ft[2] + 0.06 * S + Math.cos(a) * 0.14 * S], [ft[0] + Math.sin(a) * 0.19 * S, ft[1] - 0.025 * S, ft[2] + 0.06 * S + Math.cos(a) * 0.19 * S], 0.008 * S, 0.002 * S, 0x2a2418, 4); }
      });
    }
    A.profile(t => ({ z: faFmLizKey(t, 1) * S, y: faFmLizKey(t, 2) * S, hw: faFmLizKey(t, 3) * S, hh: faFmLizKey(t, 4) * S }));
    A.anchor('saddle', [0, (0.38 + 0.31) * S, 0.0]); A.anchor('bridle', [0, 0.4 * S, 0.95 * S]); A.anchor('pack', [0, 0.69 * S, -0.1 * S]);
    A.anchor('tailRoot', at(FA_FM_LIZ_TAIL)); A.anchor('headRoot', at(FA_FM_LIZ_HEAD));
  }
});
