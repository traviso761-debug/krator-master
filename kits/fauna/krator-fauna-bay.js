/* ======================================================================
   Krator Fauna: the bays (kits/fauna/krator-fauna-bay.js)
   The southwest bay's fauna (biomes/swbay/src/75-biome-swbay-fauna.js), of which the north-west bay (and Ys, which
   builds the north-west bay) draws the bay-side kinds: bay soarers wheeling over the water, canopy darters round the
   crowns, the plains grazers' herd and the savannah stalker that trails it, pods of bay swimmers, savannah gliders in
   the thermals, cap moths under the cap-trees and the bloom glints' swarms.
   The biome drew them as instanced unit shapes scaled per species: ONE bird (a flattened diamond body, a forked tail,
   two-panel wings with dark tips) for all four flyers, ONE box-built grazer for the grazer and the stalker (the
   stalker scaled 1 : 0.85 : 1.25, longer and lower), a hump and a fin for the swimmer, and points for the glints.
   Here each is drawn at its real size from those shapes, the proportions and palettes kept, rounded into bodies.
   Sizes: the biome's bird has its wing tips at x = +-1 and is scaled by the species' `span`, so the span seen in the
   world (and drawn here) is twice that number: the soarer 6.4 m, the darter 1.1 m, the glider 13 m, the cap moth 0.9 m.
   The flap rates are the biome's (its `flap` is radians a second: freq = flap / 2 pi).
   ====================================================================== */
/* the biome's palettes (SWBAY.FAUNA.species), sRGB hex; a variant takes one of each list */
const FA_BY_SP = {
  soarer: { S: 3.2, body: [0x3a2e26, 0x4a3a2e], wing: [0x6a5a48, 0x8a7a62], tip: 0x2a2420 },
  darter: { S: 0.55, body: [0x2a6a8a, 0x3a8a7a], wing: [0x4ab0c8, 0x60c8b0], tip: 0x1a3a4a },
  glider: { S: 6.5, body: [0x5a4a3a, 0x6a5a48], wing: [0x9a8a70, 0xb0a088], tip: 0x3a2e24 },
  capmoth: { S: 0.45, body: [0xd8c8a0, 0xc8b890], wing: [0xe8dcc0, 0xf0e0c8], tip: 0xb08a60 },
  grazer: { hide: [0x8a7048, 0x9a8058, 0x7a6440], belly: 0xc8b898 },
  stalker: { hide: [0x4a3a30, 0x3e3028, 0x56463a], belly: 0x8a7a68 },
  swimmer: { back: [0x2a3a44, 0x33434c, 0x1e2e38], fin: 0x18242c },
  glint: { col: [0xffd070, 0xff9a60, 0xe070ff] }
};
/* ---------------------------------------------------------------- helpers */
function faByRgb(c) { return Array.isArray(c) ? c : [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255]; }
function faByMix(a, b, t) { const p = faByRgb(a), q = faByRgb(b), k = Math.max(0, Math.min(1, t)); return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k]; }
function faByShade(c, k) { const p = faByRgb(c); return [Math.min(1, p[0] * k), Math.min(1, p[1] * k), Math.min(1, p[2] * k)]; }
function faBySmooth(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
/* a smooth curve (Catmull-Rom) through rows of numbers, t 0..1 spread evenly over the rows */
function faByCurve(K) {
  const n = K.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-9, Math.max(0, t * n)), i = Math.floor(f), u = f - i, u2 = u * u, u3 = u2 * u;
    const p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n, i + 2)], o = [];
    for (let k = 0; k < p1.length; k++) o.push(0.5 * (2 * p1[k] + (p2[k] - p0[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u3));
    return o;
  };
}
/* the quadratic through (0, a), (m, b), (1, c): the biome's wing panels have their stations at root, x 0.55 and tip */
function faByLag(u, a, b, c, m) { m = m == null ? 0.494 : m; return a * (u - m) * (u - 1) / m + b * u * (u - 1) / (m * (m - 1)) + c * u * (u - m) / (1 - m); }
/* a thin plate seen from both faces (a wing, a fin, a fluke): f(u, v) the mid surface, th(u, v) its half thickness along
   nrm (default +y), colf(u, v, side) its colour (side +1 the nrm face); each face is wound to face outward */
function faByPlate(A, fam, f, nu, nv, colf, th, nrm) {
  nrm = nrm || [0, 1, 0];
  const e = 1e-3, p = f(0.5, 0.5), pu = f(0.5 + e, 0.5), pv = f(0.5, 0.5 + e);
  const du = [pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]], dv = [pv[0] - p[0], pv[1] - p[1], pv[2] - p[2]];
  const n = [dv[1] * du[2] - dv[2] * du[1], dv[2] * du[0] - dv[0] * du[2], dv[0] * du[1] - dv[1] * du[0]];
  const up = n[0] * nrm[0] + n[1] * nrm[1] + n[2] * nrm[2] > 0;
  for (const sd of [1, -1]) {
    const flip = (sd > 0) !== up;
    A.sheet(fam, (u, v) => { const uu = flip ? 1 - u : u, q = f(uu, v), h = th ? th(uu, v) * sd : 0; return [q[0] + nrm[0] * h, q[1] + nrm[1] * h, q[2] + nrm[2] * h]; },
      nu, nv, null, { colf: (u, v) => colf(flip ? 1 - u : u, v, sd) });
  }
}
const faByE = (A, fam, p, r, col, o) => A.ellip(fam, p[0], p[1], p[2], r[0], r[1], r[2], col, o);

/* ---------------------------------------------------------------- the bird (soarer, darter, glider)
   The biome's unit bird (birdGeo) with its nose turned to +z: [z, y, half-width, half-height] from the tail root to the
   beak tip (its diamond: nose 0.42, tail root -0.30, widest 0.12 at z 0.05, 0.16 deep), rounded into a body, a neck, a
   head and a beak. The wings keep its stations (root x 0.12 to tip x 1.0, the root chord +0.16..-0.14) but each species
   has its own planform (FA_BY_WINGS): the soarer's long, narrow and pointed, bent up to the wrist and down to the tip (a
   sea bird's); the glider's broad, its hand spread in six fingers (a vulture's); the darter's a swift's scythe. Feathered
   surfaces are `feather` (double-sided), the beak `horn`, the legs and feet `scale`. Wings are thin plates with a
   rounded leading edge, countershaded (pale below, the flight feathers' trailing edge and the tips dark).
   The perched darter (any pose but 'fly') is built with its wings closed along its flanks, their tips over the tail,
   its body tilted up on its legs (the runtime turns a rigid wing back but cannot stand it against the flank); pose
   'fly' builds it with its wings spread. */
const FA_BY_BIRD = [[-0.30, 0.02, 0.03, 0.022], [-0.20, 0.016, 0.07, 0.05], [-0.06, 0.006, 0.11, 0.074], [0.05, 0, 0.12, 0.08],
  [0.15, 0.008, 0.085, 0.064], [0.22, 0.018, 0.062, 0.054], [0.29, 0.02, 0.055, 0.048], [0.35, 0.012, 0.03, 0.026], [0.42, 0.002, 0.004, 0.004]];
/* wing planforms: rows at u = 0, .25, .5, .75, 1 (root to the plate's end) of [leading edge z, trailing edge z, y];
   x = 0.1 + reach * u; th the plate's thickness at the root; fingers: the glider's spread primaries past the plate */
const FA_BY_WINGS = {
  soarer: { reach: 0.9, th: 0.013, fork: 1, rows: [[0.14, -0.14, 0], [0.165, -0.085, 0.03], [0.17, -0.052, 0.046], [0.11, -0.036, 0.03], [0.014, -0.004, 0.002]] },
  darter: { reach: 0.9, th: 0.014, fork: 1, rows: [[0.15, -0.12, 0], [0.17, -0.07, 0.01], [0.15, -0.042, 0.016], [0.09, -0.03, 0.01], [0.012, -0.004, 0.002]] },
  glider: { reach: 0.72, th: 0.016, fork: 0.35, fingers: [0.17, 0.19, 0.19, 0.18, 0.16, 0.13],
    rows: [[0.17, -0.16, 0], [0.19, -0.155, 0.02], [0.19, -0.135, 0.045], [0.18, -0.105, 0.07], [0.165, -0.05, 0.085]] }
};
function faByBird(A, o) {
  const S = o.S, y0 = o.y0, K = faByCurve(FA_BY_BIRD), fam = 'feather', v = A.variant, W = FA_BY_WINGS[o.kind];
  const body = o.body[v % o.body.length], wing = o.wing[v % o.wing.length], tip = o.tip, under = faByShade(body, 1.3);
  const perch = !!o.perch && A.pose !== 'fly';
  /* perched, the whole bird is tilted nose-up about the middle of its body */
  const pitch = perch ? 0.28 : 0, cp = Math.cos(pitch), sp = Math.sin(pitch);
  const X = p => pitch ? [p[0], y0 + (p[1] - y0) * cp + p[2] * sp, p[2] * cp - (p[1] - y0) * sp] : p;
  const C = t => { const k = K(t); return X([0, y0 + k[1] * S, k[0] * S]); }, R = t => { const k = K(t); return [k[2] * S, k[3] * S]; };
  const feather = (t, a) => faByMix(body, under, 0.6 * faBySmooth(0.3, 0.9, -Math.cos(a)));
  /* the body ends at TB, narrowing under the head; the head (and neck) starts at TH inside it, so a turned head leaves no gap */
  const TB = 0.57, TH = 0.45;
  A.tube(fam, t => C(TB * t), t => { const r = R(TB * t), k = 1 - 0.14 * faBySmooth(TH, TB, TB * t); return [r[0] * k, r[1] * k]; }, 14, 14, null,
    { caps: true, colf: (t, a) => feather(TB * t, a) });
  /* feet: tucked under the tail in flight, or the perch's legs below */
  if (!o.perch) for (const s of [1, -1]) faByE(A, 'scale', X([s * 0.035 * S, y0 - 0.05 * S, -0.17 * S]), [0.02 * S, 0.014 * S, 0.06 * S], o.leg, { seg: 8 });
  A.part('head', C(0.5), () => {
    A.tube(fam, t => C(TH + (0.9 - TH) * t), t => { const tt = TH + (0.9 - TH) * t, r = R(tt), k = 1 - 0.16 * faBySmooth(TB, TH, tt); return [r[0] * k, r[1] * k]; }, 12, 14, null,
      { caps: true, colf: (t, a) => feather(TH + (0.9 - TH) * t, a) });
    /* the beak: from inside the face to the tip, hooked at the end on the soarer and the glider */
    const hook = o.kind === 'darter' ? 0 : 0.014;
    A.tube('horn', t => { const tt = 0.83 + 0.17 * t, c = C(tt); return [c[0], c[1] - hook * S * faBySmooth(0.55, 1, t) * cp, c[2]]; },
      t => { const r = R(0.83 + 0.17 * t), k = 0.97 - 0.1 * t; return [Math.max(0.002 * S, r[0] * k), Math.max(0.002 * S, r[1] * (k + 0.15 * faBySmooth(0.5, 0.9, t) * (hook ? 1 : 0)))]; }, 8, 10, null,
      { caps: true, colf: t => t > 0.85 ? faByShade(o.beak, 0.7) : o.beak });
    const ke = K(0.7);
    for (const s of [-1, 1]) {
      faByE(A, 'eye', X([s * ke[2] * 0.8 * S, y0 + (ke[1] + ke[3] * 0.38) * S, ke[0] * S]), [0.016 * S, 0.016 * S, 0.016 * S], o.eye || 0x0c0a08, { seg: 8 });
      faByE(A, 'eye', X([s * ke[2] * 0.93 * S, y0 + (ke[1] + ke[3] * 0.42) * S, (ke[0] + 0.006) * S]), [0.005 * S, 0.006 * S, 0.005 * S], 0x020202, { seg: 6 });
    }
  });
  /* the wings: each extends outward from its root along +x (left) or -x (right), and flaps about z there */
  const wingCol = (u, w, sd, fing) => {
    const band = Math.floor(u * 11) % 2 ? 0.93 : 1;
    let c = faByMix(wing, tip, fing ? 0.55 + 0.4 * u : faBySmooth(0.55, 0.98, u) * (W.fingers ? 0.6 : 1));
    if (sd > 0) { if (w > 0.72 && !fing) c = faByMix(c, body, 0.45 * (1 - u)); if (w < 0.45) c = faByShade(c, band * (0.9 + 0.1 * w / 0.45)); }
    else { c = faByMix(faByShade(wing, 1.22), tip, fing ? 0.5 + 0.4 * u : faBySmooth(0.6, 1, u) * 0.85); if (w < 0.16 && !fing) c = faByMix(c, tip, 0.5); }
    return c;
  };
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', X([s * 0.1 * S, y0, 0.02 * S]), () => {
    if (perch) {
      /* closed: a curved plate over the flank from the shoulder to past the tail root, narrowing to the tips over the tail */
      const BT = []; for (let i = 0; i <= 48; i++) BT.push(K(i / 48));
      const bodyAt = z => { if (z <= BT[0][0]) return [BT[0][1], BT[0][2], BT[0][3]];
        for (let i = 1; i < BT.length; i++) if (BT[i][0] >= z) { const a = BT[i - 1], b = BT[i], f = (z - a[0]) / ((b[0] - a[0]) || 1); return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f]; }
        const L = BT[BT.length - 1]; return [L[1], L[2], L[3]]; };
      faByPlate(A, fam, (u, w) => {
        const z = 0.1 - 0.64 * u, b = bodyAt(Math.max(z, -0.24)), tf = faBySmooth(0.5, 1, u), sh = 1 - 0.65 * faBySmooth(0.55, 1, u);
        const phi = (1.25 - 0.35 * tf) + ((-0.2 + 0.75 * tf) - (1.25 - 0.35 * tf)) * w, g = 0.012;
        return X([s * (b[1] * 1.1 * sh + g) * Math.cos(phi) * S, y0 + (b[0] + (b[2] * 1.1 * sh + g) * Math.sin(phi)) * S, z * S]);
      }, 14, 5, (u, w, sd) => { let c = faByMix(wing, tip, faBySmooth(0.5, 1, u)); if (w < 0.3) c = faByMix(c, body, 0.35 * (1 - u));
        else if (Math.floor(u * 9) % 2) c = faByShade(c, 0.93); return sd > 0 ? c : faByShade(c, 0.8); }, (u, w) => 0.003 * S, [s, 0, 0]);
      return;
    }
    const RW = faByCurve(W.rows), xe = 0.1 + W.reach;
    faByPlate(A, fam, (u, w) => { const r = RW(u); return [s * (0.1 + W.reach * u) * S, y0 + (r[2] + 0.012 * Math.sin(Math.PI * w) * (1 - u)) * S, (r[1] + (r[0] - r[1]) * w) * S]; }, 20, 6,
      (u, w, sd) => wingCol(u, w, sd, false), (u, w) => { const q = 1 - w; return S * (0.0015 + W.th * (1 - 0.7 * u) * 2.6 * Math.sqrt(q) * (1 - q)); });
    /* the glider's fingers: the outer primaries, spread and curled up at their tips */
    if (W.fingers) {
      const re = RW(1), n = W.fingers.length;
      for (let i = 0; i < n; i++) {
        const zr = re[0] - (i + 0.5) / n * (re[0] - re[1]), ang = 0.28 - 0.74 * i / (n - 1), L = W.fingers[i], wd = 0.034 - 0.003 * i;
        faByPlate(A, fam, (u, w) => { const x = xe - 0.03 + L * u * Math.cos(ang), zc = zr + L * u * Math.sin(ang), hw = wd * (1 - 0.55 * u) * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, u - 0.85) / 0.15, 2)) || 0.02);
          return [s * x * S, y0 + (re[2] + 0.03 * u * u + 0.004 * i) * S, (zc + hw * (2 * w - 1)) * S]; }, 6, 2,
          (u, w, sd) => wingCol(u, w, sd, true), (u, w) => S * (0.0015 + 0.004 * (1 - u) * Math.sin(Math.PI * w)));
      }
    }
  });
  /* the forked tail (the glider's fork shallow) */
  A.part('tail', X([0, y0 + 0.02 * S, -0.27 * S]), () => {
    faByPlate(A, fam, (u, w) => { const a = 2 * u - 1; return X([a * (0.035 + 0.105 * w) * S, y0 + (0.02 - 0.006 * w) * S, (-0.25 - w * (0.13 + 0.1 * W.fork * Math.abs(a) + 0.04 * (1 - W.fork))) * S]); }, 10, 4,
      (u, w, sd) => { const a = Math.abs(2 * u - 1); return faByShade(faByMix(body, tip, 0.55 * w), (sd < 0 ? 1.15 : 1) * (Math.floor(a * 4) % 2 ? 0.94 : 1)); },
      (u, w) => { const a = 2 * u - 1; return S * (0.0012 + 0.011 * (1 - a * a) * (1 - 0.9 * w)); });
  });
  /* the perch's legs: a scaled shank to the ground, three toes forward and one back */
  if (o.perch) for (const s of [1, -1]) {
    const hip = X([s * 0.04 * S, y0 - 0.045 * S, -0.01 * S]);
    A.part(s > 0 ? 'leg0' : 'leg1', hip, () => {
      const ft = [s * 0.05 * S, 0.006, hip[2] + 0.01 * S];
      faByE(A, fam, [hip[0], hip[1] + 0.005 * S, hip[2]], [0.022 * S, 0.026 * S, 0.03 * S], faByShade(body, 1.1), { seg: 8 });   /* the feathered thigh */
      A.tube('scale', t => [hip[0] + (ft[0] - hip[0]) * t, hip[1] + (ft[1] - hip[1]) * t, hip[2] + (ft[2] - hip[2]) * t], t => { const r = (0.012 - 0.004 * t) * S; return [r, r]; }, 3, 6, o.leg, { caps: true });
      for (const a of [-0.5, 0, 0.5, Math.PI]) { const L = (a === Math.PI ? 0.045 : 0.07) * S;
        A.cone('scale', [ft[0], 0.0045, ft[2]], [ft[0] + Math.sin(a + s * 0.1) * L, 0.0035, ft[2] + Math.cos(a) * L], 0.0075 * S, 0.0035 * S, o.leg, 5); }
    });
  }
}

/* ---------------------------------------------------------------- the moth and the glint (insects, hovering) */
function faByMoth(A, o) {
  const S = o.S, y0 = o.y0, v = A.variant, fur = o.body[v % o.body.length], wing = o.wing[v % o.wing.length], tip = o.tip, P = (x, y, z) => [x * S, y0 + y * S, z * S];
  /* the biome drew it with the bird's diamond; a moth's body here: a big furred thorax and a stout, banded, tapering abdomen */
  faByE(A, 'coat', P(0, 0, 0.06), [0.085 * S, 0.08 * S, 0.11 * S], fur, { seg: 12 });
  A.tube('coat', t => P(0, -0.012 - 0.03 * t, 0.0 - 0.3 * t), t => { const r = (0.016 + 0.062 * Math.sin(Math.PI * (0.25 + 0.75 * t))) * S; return [r, r * 0.95]; }, 10, 12, null,
    { caps: true, colf: t => t > 0.9 ? tip : (Math.sin(t * 30) > 0.6 ? faByShade(fur, 0.8) : fur) });
  const fuzz = [];
  for (let i = 0; i < 30; i++) { const a = A.rr(-1.5, 1.5), z = A.rr(-0.02, 0.15); fuzz.push({ at: P(Math.sin(a) * 0.08, Math.cos(a) * 0.075, z), dir: [Math.sin(a) * 0.6, Math.cos(a) * 0.3, -0.7], len: A.rr(0.04, 0.07) * S, w: 0.035 * S, col: faByShade(fur, A.rr(0.9, 1.05)), curl: 0.3 }); }
  A.locks('hair', fuzz);
  /* six legs, drawn hanging (it hovers; no leg parts): a furred femur, a bare tibia */
  for (const s of [-1, 1]) for (const [z, dz] of [[0.11, 0.12], [0.06, 0.02], [0.01, -0.1]]) {
    const a = P(s * 0.03, -0.05, z), b = P(s * 0.1, -0.1, z + dz * 0.5), c = P(s * 0.12, -0.2, z + dz);
    A.cone('coat', a, b, 0.014 * S, 0.01 * S, faByShade(fur, 0.8), 5); A.cone('chitin', b, c, 0.008 * S, 0.004 * S, faByShade(fur, 0.5), 5);
  }
  A.part('head', P(0, 0, 0.14), () => {
    faByE(A, 'coat', P(0, 0.005, 0.185), [0.048 * S, 0.044 * S, 0.042 * S], fur, { seg: 10 });
    for (const s of [-1, 1]) {
      faByE(A, 'eye', P(s * 0.036, 0.012, 0.205), [0.026 * S, 0.028 * S, 0.024 * S], 0x2a1e14, { seg: 8 });
      /* the feathered antennae: a shaft with short barbs either side */
      const a0 = P(s * 0.018, 0.035, 0.215), a1 = P(s * 0.13, 0.13, 0.36);
      A.cone('chitin', a0, a1, 0.006 * S, 0.002 * S, tip, 4);
      for (let k = 1; k <= 6; k++) { const t = k / 7, p = [a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t, a0[2] + (a1[2] - a0[2]) * t], L = 0.035 * S * Math.sin(Math.PI * (0.15 + 0.7 * t));
        for (const q of [-1, 1]) A.cone('chitin', p, [p[0] + s * q * L * 0.45, p[1] + q * L * 0.5, p[2] - L * 0.6], 0.0025 * S, 0.001 * S, tip, 3); }
    }
    faByE(A, 'mouth', P(0, -0.03, 0.2), [0.012, 0.012, 0.012], 0x3a2a1a, { seg: 6 });
  });
  /* the wings (membrane): a triangular forewing, its outer margin slanting from the apex back to the tornus, crossed by two
     darker lines, an eyespot, the margin in the tip colour; behind it a rounded hindwing with a larger eyespot. A moth's
     wings beat as one: they share the part. Paler beneath. */
  const lines = (u, c) => (Math.abs(u - 0.36) < 0.022 || Math.abs(u - 0.68) < 0.022) ? faByShade(c, 0.82) : c;
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * 0.05, 0.02, 0.06), () => {
    faByPlate(A, 'membrane', (u, w) => {
      const lead = 0.12 + 0.04 * u - 0.06 * Math.pow(u, 4), trail = 0.08 - 0.34 * Math.pow(u, 0.8);
      return P(s * (0.05 + 0.92 * u * (0.7 + 0.3 * w)), 0.02 + 0.04 * u, trail + (lead - trail) * w);
    }, 14, 6, (u, w, sd) => { const d = Math.hypot(u - 0.52, (w - 0.55) * 0.6);
      let c = lines(u, faByMix(wing, tip, faBySmooth(0.82, 0.97, u * (0.7 + 0.3 * w) / 0.85)));
      if (d < 0.04) c = 0x2a1e14; else if (d < 0.075) c = tip;
      return sd < 0 ? faByMix(c, wing, 0.5) : c; }, (u, w) => S * (0.0008 + 0.003 * Math.sin(Math.PI * w) * (1 - u * u)));
    faByPlate(A, 'membrane', (u, w) => {
      const lead = 0.03 - 0.1 * u, trail = -0.04 - 0.26 * Math.sqrt(u) * (1 - 0.25 * u);
      return P(s * (0.04 + 0.6 * u * (0.75 + 0.25 * Math.sin(Math.PI * w))), 0.006 + 0.02 * u, trail + (lead - trail) * w);
    }, 10, 6, (u, w, sd) => { const d = Math.hypot(u - 0.55, (w - 0.45) * 0.7);
      let c = u > 0.86 ? faByMix(wing, tip, 0.75) : faByShade(wing, 0.97);
      if (d < 0.06) c = 0x2a1e14; else if (d < 0.11) c = tip; else if (d < 0.135) c = faByShade(wing, 1.05);
      return sd < 0 ? faByMix(c, wing, 0.5) : c; }, (u, w) => S * (0.0008 + 0.002 * Math.sin(Math.PI * w) * (1 - u * u)));
  });
}
function faByGlint(A, o) {
  const y0 = o.y0, glow = o.col[A.variant % o.col.length], P = (x, y, z) => [x, y0 + y, z], dk = 0x2a2418, shield = faByMix(dk, glow, 0.3);
  /* the biome's points: a glowing abdomen (the glint) under a dark thorax and head, a shield over the head, two clear wings */
  faByE(A, 'chitin', P(0, 0, 0.004), [0.0065, 0.006, 0.008], dk, { seg: 8 });
  faByE(A, 'glow', P(0, -0.001, -0.014), [0.0075, 0.0068, 0.014], glow, { seg: 10 });
  for (const s of [-1, 1]) for (const z of [0.008, 0.003, -0.002]) {
    const a = P(s * 0.003, -0.004, z), b = P(s * 0.008, -0.007, z - 0.001), c = P(s * 0.01, -0.013, z - 0.003);
    A.cone('chitin', a, b, 0.0009, 0.0007, dk, 3); A.cone('chitin', b, c, 0.0007, 0.0004, dk, 3);
  }
  A.part('head', P(0, 0, 0.01), () => {
    faByE(A, 'chitin', P(0, 0.001, 0.015), [0.0045, 0.0042, 0.004], dk, { seg: 8 });
    faByE(A, 'chitin', P(0, 0.0035, 0.0135), [0.0058, 0.0022, 0.0058], shield, { seg: 8 });
    for (const s of [-1, 1]) { faByE(A, 'eye', P(s * 0.0032, 0.0012, 0.0168), [0.0022, 0.0026, 0.0022], 0x101010, { seg: 6 });
      A.cone('chitin', P(s * 0.0015, 0.003, 0.0185), P(s * 0.006, 0.009, 0.028), 0.0005, 0.0003, dk, 3); }
  });
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * 0.004, 0.004, 0.006), () => {
    /* the wing case, held up and out */
    faByE(A, 'chitin', P(s * 0.006, 0.0055, -0.002), [0.0035, 0.0012, 0.011], dk, { rz: s * 0.5, ry: s * 0.25, seg: 8 });
    faByPlate(A, 'membrane', (u, w) => { const c = 0.002 - 0.01 * u, h = 0.0085 * Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.max(0, u - 0.45) / 0.55, 2))) * (0.6 + 0.4 * u);
      return P(s * (0.004 + 0.04 * u), 0.004 + 0.003 * u, c + h * (2 * w - 1)); }, 8, 3,
      (u, w, sd) => { const vein = Math.abs(w - 0.62) < 0.08 || u < 0.08; return faByMix(0xe6eef0, vein ? dk : glow, vein ? 0.35 : 0.12 + 0.1 * u); }, (u, w) => 0.00008 + 0.0003 * Math.sin(Math.PI * w));
  });
}

/* ---------------------------------------------------------------- the grazer and the stalker (the biome's grazerGeo)
   The biome drew both from one box grazer (unit height 1 at the shoulder: a barrel 0.46 x 0.44 x 1.1, a neck block, a
   head block 0.42 long, a dark tail, four legs dark low), the grazer scaled 1.9 and the stalker 1 : 0.85 : 1.25 of it.
   Here each is its own animal at those sizes, in metres, in `sleek` hide: the grazer a big plains antelope (withers
   over the rump, a deep neck rising from the shoulders, a long grazing head with a broad nose, broad drooping ears, a
   tufted tail); the stalker a heavy savannah cat (deep chest, tucked waist, a short thick neck, a broad short-muzzled
   head with forward eyes, canines and a jaw that opens, rounded ears, broad paws, a long low tail). */
/* bodies: [z, y, half-width, half-height] rump to chest */
const FA_BY_GRAZER_BODY = [[-1.2, 1.54, 0.03, 0.03], [-1.14, 1.52, 0.2, 0.22], [-0.98, 1.48, 0.34, 0.36], [-0.62, 1.43, 0.42, 0.41], [-0.15, 1.41, 0.45, 0.43],
  [0.35, 1.44, 0.45, 0.46], [0.72, 1.46, 0.38, 0.47], [0.96, 1.5, 0.24, 0.34], [1.06, 1.52, 0.04, 0.05]];
const FA_BY_STALKER_BODY = [[-1.12, 1.07, 0.03, 0.03], [-1.06, 1.06, 0.18, 0.2], [-0.86, 1.03, 0.28, 0.27], [-0.52, 1.0, 0.25, 0.22], [-0.12, 0.97, 0.29, 0.28],
  [0.32, 0.96, 0.33, 0.34], [0.7, 1.0, 0.32, 0.36], [0.95, 1.06, 0.23, 0.28], [1.07, 1.09, 0.04, 0.05]];
/* a limb: a smooth tube through rows [y, z, r] in the plane at x (its frame is fixed by that plane, so it never twists);
   joints are rows with a larger r; colf(v), v 0 at the top */
function faByLimb(A, fam, x, rows, colf) {
  const Cv = faByCurve(rows), e = 1e-3;
  A.sheet(fam, (u, v) => { const c = Cv(v), c0 = Cv(Math.max(0, v - e)), c1 = Cv(Math.min(1, v + e)); let ty = c1[0] - c0[0], tz = c1[1] - c0[1]; const l = Math.hypot(ty, tz) || 1; ty /= l; tz /= l;
    const a = u * TAU + Math.PI, r = c[2]; return [x + Math.sin(a) * r, c[0] + tz * Math.cos(a) * r, c[1] - ty * Math.cos(a) * r]; }, 10, rows.length > 7 ? 20 : 16, null, { colf: (u, v) => colf(v) });
}
/* a body along z from its rows, mottled above and pale below */
function faByTrunk(A, rows, mott, belly, lo) {
  const BR = faByCurve(rows);
  A.tube('sleek', t => { const k = BR(t); return [0, k[1], k[0]]; }, t => { const k = BR(t); return [k[2], k[3]]; }, 22, 16, null,
    { caps: true, colf: (t, a) => { const k = BR(t); return faByMix(mott(Math.sin(a) * k[2], k[1] + Math.cos(a) * k[3], k[0]), belly, faBySmooth(lo, 0.9, -Math.cos(a))); } });
}
/* a head's frame: s metres along its axis from p0 toward p1, h up off the axis, x to the side */
function faByHeadFrame(p0, p1) {
  const dy = p1[1] - p0[1], dz = p1[2] - p0[2], L = Math.hypot(dy, dz), ay = dy / L, az = dz / L;
  const H = (s, h, x) => [x || 0, p0[1] + ay * s + az * h, p0[2] + az * s - ay * h];
  H.L = L; return H;
}
function faByGrazer(A) {
  const v = A.variant, sp = FA_BY_SP.grazer, hide = sp.hide[v % sp.hide.length], belly = sp.belly, dark = faByShade(hide, 0.6), F = 'sleek';
  const mott = (x, y, z) => faByShade(hide, 0.9 + 0.18 * faNoise(x * 2.1 + v * 7, y * 2.1, z * 2.1));
  faByTrunk(A, FA_BY_GRAZER_BODY, mott, belly, 0.45);
  /* the shoulder blades under the withers and the haunches: the leg tops' masses */
  for (const s of [-1, 1]) {
    faByE(A, F, [s * 0.19, 1.58, 0.6], [0.15, 0.32, 0.24], null, { rx: -0.4, seg: 16, colf: (x, y, z) => mott(s * 0.24 + x, 1.58 + y, 0.6 + z) });
    faByE(A, F, [s * 0.2, 1.52, -0.8], [0.15, 0.32, 0.28], null, { rx: -0.25, seg: 16, colf: (x, y, z) => mott(s * 0.24 + x, 1.52 + y, -0.8 + z) });
  }
  /* the neck and head: they turn about the base of the neck to graze */
  A.part('head', [0, 1.5, 0.72], () => {
    const NK = faByCurve([[1.38, 0.5, 0.18, 0.28], [1.72, 0.94, 0.15, 0.23], [2.02, 1.24, 0.115, 0.16], [2.2, 1.42, 0.1, 0.13]]);
    A.tube(F, t => { const k = NK(t); return [0, k[0], k[1]]; }, t => { const k = NK(t); return [k[2], k[3]]; }, 10, 14, null,
      { caps: true, colf: (t, a) => faByMix(mott(Math.sin(a) * 0.15, 1.8 + 0.3 * t, 0.9 + 0.4 * t), belly, 0.7 * faBySmooth(0.35, 0.9, -Math.cos(a))) });
    /* a short upright dark mane along the crest */
    A.tube('hair', t => { const k = NK(0.14 + 0.84 * t); return [0, k[0] + k[3] * 0.92, k[1] - 0.02]; }, t => [0.022, 0.05 + 0.015 * Math.sin(Math.PI * t)], 10, 8, null,
      { caps: true, colf: (t, a) => faByShade(dark, Math.cos(a) > 0.3 ? 0.75 : 0.95) });
    const H = faByHeadFrame([0, 2.3, 1.4], [0, 1.84, 1.94]), L = H.L;
    const HR = faByCurve([[0.1, 0.12], [0.13, 0.15], [0.125, 0.155], [0.11, 0.145], [0.095, 0.12], [0.083, 0.1], [0.074, 0.088], [0.085, 0.086], [0.05, 0.05]]);
    A.tube(F, t => H(L * t, 0), HR, 16, 16, null, { caps: true, colf: (t, a) => {
      if (t > 0.9) return 0x2a2420;
      const lo = -Math.cos(a), c = faByMix(mott(Math.sin(a) * 0.1, 2.1, 1.6 + t), dark, 0.5 * faBySmooth(0.45, 0.85, t));
      return lo > 0.55 ? faByMix(c, dark, 0.5) : c; } });
    /* the lower jaw: deep at the cheek, a clean line to the chin */
    const JW = faByCurve([[0.12, -0.085, 0.1, 0.07], [0.3, -0.085, 0.082, 0.055], [0.5, -0.05, 0.05, 0.03]]);
    A.tube(F, t => { const k = JW(t); return H(k[0], k[1]); }, t => { const k = JW(t); return [k[2], k[3]]; }, 8, 12, null,
      { caps: true, colf: (t, a) => faByMix(mott(0, 1.9, 1.7), dark, 0.25 + 0.25 * faBySmooth(-0.2, 0.6, -Math.cos(a))) });
    for (const s of [-1, 1]) {
      /* the eye high on the side of the skull under a brow; a horizontal pupil */
      faByE(A, F, H(0.17, 0.078, s * 0.106), [0.032, 0.016, 0.048], mott(0, 2.2, 1.5), { seg: 10 });
      faByE(A, 'eye', H(0.175, 0.05, s * 0.118), [0.03, 0.03, 0.032], 0x2a1a0c, { seg: 10 });
      faByE(A, 'eye', H(0.178, 0.05, s * 0.146), [0.005, 0.009, 0.018], 0x050403, { seg: 6 });
      /* the nostrils on the broad nose, the line of the mouth */
      faByE(A, 'mouth', H(0.665, 0.02, s * 0.055), [0.016, 0.03, 0.012], 0x0e0a08, { ry: s * 0.5, seg: 8 });
    }
  });
  /* the ears: broad and drooping */
  for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', faByHeadFrame([0, 2.3, 1.4], [0, 1.84, 1.94])(0.03, 0.12, s * 0.085), () => {
    const H = faByHeadFrame([0, 2.3, 1.4], [0, 1.84, 1.94]);
    faByE(A, F, H(0.02, 0.13, s * 0.18), [0.1, 0.026, 0.055], null, { rz: s * 0.45, ry: -s * 0.3, seg: 12, colf: (x, y, z) => y < 0 ? faByMix(hide, belly, 0.5) : faByShade(hide, 0.95) });
  });
  /* the tail: drooping to a dark tuft */
  A.part('tail', [0, 1.68, -1.12], () => {
    const TL = faByCurve([[1.68, -1.12], [1.58, -1.24], [1.32, -1.3], [1.06, -1.31]]);
    A.tube(F, t => { const k = TL(t); return [0, k[0], k[1]]; }, t => { const r = 0.055 - 0.027 * t; return [r, r]; }, 8, 8, null, { caps: true, colf: t => t > 0.7 ? dark : mott(0, 1.5, -1.2) });
    const T = []; for (let i = 0; i < 9; i++) T.push({ at: [A.rr(-0.015, 0.015), 1.1 + A.rr(0, 0.06), -1.31], dir: [A.rr(-0.2, 0.2), -1, A.rr(-0.25, 0.05)], len: A.rr(0.2, 0.3), w: 0.05, col: faByShade(dark, 0.7), curl: 0.1 });
    A.locks('hair', T);
  });
  /* the legs: forearm and gaskin muscled, knees and hocks knobbed, slim cannons, dark socks, hooves */
  for (const [x, z, front, i] of [[0.27, 0.72, 1, 0], [-0.27, 0.72, 1, 1], [0.27, -0.74, 0, 2], [-0.27, -0.74, 0, 3]]) A.part('leg' + i, [x, 1.22, z], () => {
    const rows = front ? [[1.3, z, 0.12], [1.0, z + 0.01, 0.105], [0.8, z + 0.015, 0.075], [0.64, z + 0.025, 0.07], [0.5, z + 0.03, 0.05], [0.32, z + 0.04, 0.046], [0.19, z + 0.05, 0.055], [0.12, z + 0.07, 0.045], [0.07, z + 0.1, 0.045]]
      : [[1.35, z, 0.16], [1.1, z - 0.07, 0.13], [0.88, z - 0.14, 0.09], [0.72, z - 0.2, 0.07], [0.55, z - 0.18, 0.05], [0.33, z - 0.16, 0.046], [0.19, z - 0.14, 0.055], [0.12, z - 0.12, 0.045], [0.07, z - 0.1, 0.045]];
    faByLimb(A, F, x, rows, vv => { const y = 1.3 - 1.23 * vv; return y < 0.5 ? faByMix(mott(x, y, z), dark, faBySmooth(0.5, 0.3, y)) : mott(x, y, z); });
    if (!front) faByE(A, F, [x, 0.75, z - 0.25], [0.035, 0.06, 0.04], mott(x, 0.7, z), { seg: 8 });   /* the point of the hock */
    const hz = rows[8][1];
    A.cone('hoof', [x, 0, hz + 0.012], [x, 0.1, hz + 0.012], 0.075, 0.058, 0x1e1a16, 10);
  });
  A.anchor('lead', [0, 2.02, 1.42]); A.anchor('back', [0, 1.86, 0]);
}
function faByStalker(A) {
  const v = A.variant, sp = FA_BY_SP.stalker, hide = sp.hide[v % sp.hide.length], belly = sp.belly, dark = faByShade(hide, 0.6), F = 'sleek', pale = faByMix(hide, belly, 0.7);
  const mott = (x, y, z) => faByShade(hide, 0.9 + 0.18 * faNoise(x * 2.4 + v * 7, y * 2.4, z * 2.4));
  faByTrunk(A, FA_BY_STALKER_BODY, mott, belly, 0.4);
  for (const s of [-1, 1]) {
    faByE(A, F, [s * 0.17, 1.1, 0.64], [0.11, 0.22, 0.17], null, { rx: -0.35, seg: 12, colf: (x, y, z) => mott(s * 0.17 + x, 1.1 + y, 0.64 + z) });
    faByE(A, F, [s * 0.16, 1.04, -0.82], [0.12, 0.23, 0.22], null, { rx: -0.2, seg: 12, colf: (x, y, z) => mott(s * 0.17 + x, 1.06 + y, -0.82 + z) });
  }
  const H0 = faByHeadFrame([0, 1.46, 1.22], [0, 1.37, 1.68]), L = H0.L, H = (f, h, x) => H0(f * L, h, x), hc = t => 0.02 * Math.sin(Math.PI * t);
  A.part('head', [0, 1.15, 0.84], () => {
    const NK = faByCurve([[0.95, 0.62, 0.19, 0.21], [1.19, 1.0, 0.2, 0.24], [1.42, 1.32, 0.14, 0.15]]);
    A.tube(F, t => { const k = NK(t); return [0, k[0], k[1]]; }, t => { const k = NK(t); return [k[2], k[3]]; }, 8, 14, null,
      { caps: true, colf: (t, a) => faByMix(mott(Math.sin(a) * 0.15, 1.2 + 0.2 * t, 0.9 + 0.3 * t), belly, 0.75 * faBySmooth(0.35, 0.9, -Math.cos(a))) });
    /* the skull: broad at the cheekbones, a domed brow, a short broad muzzle */
    const HR = faByCurve([[0.07, 0.08], [0.17, 0.17], [0.205, 0.19], [0.2, 0.18], [0.165, 0.16], [0.14, 0.14], [0.13, 0.13], [0.115, 0.115], [0.05, 0.05]]);
    A.tube(F, t => H(t, hc(t)), HR, 16, 18, null, { caps: true, colf: (t, a) => {
      const lo = -Math.cos(a); if (t > 0.94) return 0x1a1412;
      const c = mott(Math.sin(a) * 0.15, 1.45, 1.3 + t * 0.5);
      return lo > 0.2 ? faByMix(c, pale, faBySmooth(0.2, 0.6, lo)) : (t > 0.55 && lo > -0.5 ? faByMix(c, pale, 0.4 * faBySmooth(0.55, 0.8, t)) : c); } });
    for (const s of [-1, 1]) {
      /* whisker pads, the nostrils, the upper canines and the line of the lip */
      faByE(A, F, H(0.8, -0.045, s * 0.06), [0.07, 0.064, 0.075], null, { seg: 10, colf: () => faByMix(hide, pale, 0.6) });
      faByE(A, 'mouth', H(0.975, 0.014, s * 0.022), [0.012, 0.01, 0.01], 0x0a0806, { seg: 6 });
      A.cone('horn', H(0.86, -0.06, s * 0.05), H(0.865, -0.15, s * 0.05), 0.014, 0.003, 0xe8e0c8, 6);
      /* the eyes: set forward under a heavy brow, amber with a slit pupil; a dark tear line under each */
      faByE(A, F, H(0.47, 0.135, s * 0.1), [0.05, 0.018, 0.055], null, { seg: 10, colf: () => mott(0, 1.5, 1.5) });
      faByE(A, 'eye', H(0.52, 0.085, s * 0.128), [0.028, 0.026, 0.026], 0xc89030, { seg: 10 });
      faByE(A, 'eye', H(0.565, 0.085, s * 0.142), [0.006, 0.017, 0.006], 0x050403, { seg: 6 });
      faByE(A, 'mouth', H(0.6, 0.055, s * 0.122), [0.01, 0.007, 0.032], 0x16100c, { ry: s * 0.5, seg: 6 });
    }
    faByE(A, 'mouth', H(0.99, 0.035, 0), [0.05, 0.03, 0.026], 0x1a1412, { seg: 10 });
  });
  /* the lower jaw: it opens when the head is down */
  A.part('jaw', H(0.2, -0.08), () => {
    const JW = faByCurve([[0.2, -0.085, 0.11, 0.065], [0.62, -0.105, 0.08, 0.045], [0.94, -0.095, 0.055, 0.032]]);
    A.tube(F, t => { const k = JW(t); return H(k[0], k[1]); }, t => { const k = JW(t); return [k[2], k[3]]; }, 8, 12, null, { caps: true, colf: (t, a) => faByMix(faByMix(dark, pale, 0.45), pale, 0.4 * faBySmooth(0.3, 0.9, -Math.cos(a))) });
    for (const s of [-1, 1]) A.cone('horn', H(0.88, -0.09, s * 0.042), H(0.885, -0.035, s * 0.044), 0.011, 0.003, 0xe8e0c8, 6);
  });
  /* the ears: short, rounded, upright, dark behind and pale inside */
  for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', H(0.2, 0.16, s * 0.13), () => {
    faByE(A, F, H(0.2, 0.2, s * 0.15), [0.055, 0.062, 0.022], faByShade(hide, 0.7), { rz: -s * 0.55, seg: 12 });
    faByE(A, F, H(0.222, 0.196, s * 0.148), [0.038, 0.045, 0.012], pale, { rz: -s * 0.55, seg: 10 });
  });
  /* the tail: long and low, curling up at a dark tip */
  A.part('tail', [0, 1.12, -1.08], () => {
    const TL = faByCurve([[1.12, -1.08], [1.0, -1.28], [0.8, -1.46], [0.64, -1.66], [0.66, -1.88]]);
    A.tube(F, t => { const k = TL(t); return [0, k[0], k[1]]; }, t => { const r = 0.065 - 0.025 * t; return [r, r]; }, 12, 10, null, { caps: true, colf: t => t > 0.85 ? dark : mott(0, 1, -1.4) });
    faByE(A, F, [0, 0.665, -1.9], [0.048, 0.05, 0.09], dark, { rx: 0.3, seg: 10 });
  });
  /* the legs: heavy forearms and thighs, broad paws with dark claws */
  for (const [x, z, front, i] of [[0.21, 0.7, 1, 0], [-0.21, 0.7, 1, 1], [0.21, -0.82, 0, 2], [-0.21, -0.82, 0, 3]]) A.part('leg' + i, [x, 1.0, z], () => {
    const rows = front ? [[1.15, z, 0.11], [0.85, z, 0.125], [0.65, z, 0.1], [0.45, z + 0.01, 0.08], [0.28, z + 0.025, 0.07], [0.17, z + 0.04, 0.07], [0.1, z + 0.07, 0.066]]
      : [[1.15, z - 0.03, 0.13], [0.88, z + 0.08, 0.15], [0.7, z + 0.14, 0.11], [0.52, z + 0.02, 0.085], [0.34, z - 0.12, 0.066], [0.22, z - 0.11, 0.058], [0.1, z - 0.08, 0.058]];
    faByLimb(A, F, x, rows, vv => faByMix(mott(x, 1 - vv, z), pale, 0.25 * vv));
    const pts = [null, null, null, [x, 0.1, rows[6][1]]];
    const pz = pts[3][2] + 0.04;
    faByE(A, F, [x, 0.055, pz], [0.085, 0.055, 0.11], null, { seg: 10, colf: () => faByMix(mott(x, 0.1, z), pale, 0.3) });
    for (const dx of [-0.045, -0.015, 0.015, 0.045]) {
      faByE(A, F, [x + dx, 0.035, pz + 0.085], [0.025, 0.033, 0.03], null, { seg: 6, colf: () => faByMix(mott(x, 0.1, z), pale, 0.3) });
      A.cone('horn', [x + dx * 1.05, 0.03, pz + 0.105], [x + dx * 1.1, 0.006, pz + 0.13], 0.008, 0.002, 0x2a2420, 4);
    }
  });
  A.anchor('lead', [0, 1.3, 1.2]); A.anchor('back', [0, 1.3, 0]);
}

/* ---------------------------------------------------------------- the swimmer
   The biome showed only its back breaking the surface (a hump 9 m long and half as wide, a dorsal fin 2.7 m tall a
   little ahead of the middle); here the whole animal, its back at the waterline (y 0.1): [z, y of the top, half-width,
   half-height] from the tail stock to the blunt snout. */
const FA_BY_WHALE = [[-3.8, -0.6, 0.1, 0.08], [-3.3, -0.45, 0.25, 0.28], [-2.5, -0.24, 0.58, 0.6], [-1.6, -0.04, 1.08, 0.95], [-0.6, 0.07, 1.6, 1.28], [0.5, 0.1, 1.88, 1.42],
  [1.6, 0.1, 1.85, 1.38], [2.6, 0.05, 1.62, 1.2], [3.5, -0.06, 1.2, 0.96], [4.1, -0.18, 0.76, 0.7], [4.45, -0.3, 0.4, 0.38], [4.6, -0.6, 0.05, 0.06]];
function faBySwimmer(A) {
  const v = A.variant, back = FA_BY_SP.swimmer.back[v % 3], fin = FA_BY_SP.swimmer.fin, belly = faByMix(back, 0x9aa4a8, 0.7), W = faByCurve(FA_BY_WHALE);
  const C = t => { const k = W(t); return [0, k[1] - k[3], k[0]]; }, R = t => { const k = W(t); return [k[2], k[3]]; };
  const skin = (t, a) => { const k = W(t), lo = -Math.cos(a);
    const c = faByMix(faByShade(back, 0.9 + 0.2 * faNoise(t * 16 + v * 3, a * 2.2, 1.3)), belly, faBySmooth(0.15, 0.75, lo));
    /* the throat pleats: grooves along the belly from the chin back past the flippers */
    return lo > 0.6 && k[0] > 0.6 && k[0] < 3.9 && Math.sin(a * 46) > 0.55 ? faByShade(c, 0.8 + 0.12 * faBySmooth(0.6, 3.9, k[0])) : c; };
  /* a stretch of the body; a part's stretch reaches into its neighbour (shrunk a little) so a turned joint shows no gap */
  const stretch = (t0, t1, nt, shrink) => A.tube('skin', t => C(t0 + (t1 - t0) * t), t => { const tt = t0 + (t1 - t0) * t, r = R(tt), k = shrink ? shrink(tt) : 1; return [r[0] * k, r[1] * k]; },
    nt, 18, null, { caps: true, colf: (t, a) => skin(t0 + (t1 - t0) * t, a) });
  const TT = 3 / 11, THd = 7.4 / 11;   /* the tail turns at z -1.6, the head at z 2.95 */
  stretch(TT, THd, 18, tt => 1 - 0.035 * faBySmooth(THd - 0.09, THd, tt) - 0.04 * faBySmooth(TT + 0.06, TT, tt));
  /* the dorsal fin (the biome's: base z -0.9 .. 1.44, apex z 0.18, 2.4 m over the back) */
  faByPlate(A, 'skin', (u, w) => { const z0 = -0.9 + 2.34 * u, top = 0.06 - 0.02 * Math.abs(u - 0.5); return [0, (top - 0.12) * (1 - w) + 2.5 * w, z0 + (0.18 - z0) * w - 0.35 * Math.sin(Math.PI * w) * u]; }, 8, 7,
    (u, w) => faByShade(fin, 1 - 0.15 * w), (u, w) => 0.14 * (1 - w) * Math.sqrt(Math.sin(Math.PI * u)), [1, 0, 0]);
  /* the flippers, and the blowhole */
  for (const s of [-1, 1]) faByPlate(A, 'skin', (u, w) => { const ch = 0.95 - 0.6 * u, zc = 2.1 - 1.0 * u * u; return [s * (1.35 + 1.35 * u), -1.15 - 0.55 * u, zc + ch * (w - 0.5)]; }, 8, 4,
    (u, w, sd) => sd > 0 ? faByShade(back, 0.95) : belly, (u, w) => 0.12 * Math.sin(Math.PI * w) * (1 - 0.7 * u) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 3))));
  /* the blowholes: a pair of slits behind a raised splash guard, on the crown of the back */
  const topAt = z => { let best = 0, d = 1e9; for (let i = 0; i <= 80; i++) { const k = W(i / 80); if (Math.abs(k[0] - z) < d) { d = Math.abs(k[0] - z); best = k[1]; } } return best; };
  const yb = topAt(2.45);
  faByE(A, 'skin', [0, yb - 0.035, 2.62], [0.26, 0.06, 0.2], null, { seg: 10, colf: () => faByShade(back, 0.95) });
  for (const s of [-1, 1]) faByE(A, 'mouth', [s * 0.07, yb - 0.004, 2.42], [0.035, 0.016, 0.15], 0x0a0e12, { ry: -s * 0.22, seg: 8 });
  A.part('tail', C(TT), () => {
    stretch(0, TT + 0.07, 12, tt => 1 - 0.045 * faBySmooth(TT, TT + 0.07, tt));
    /* the flukes: 3.2 m across, swept back, notched at the middle */
    faByPlate(A, 'skin', (u, w) => { const a = 2 * u - 1, b = Math.abs(a), lead = -3.66 - 0.62 * Math.pow(b, 1.6), trail = -3.9 - 0.52 * Math.pow(b, 0.7); return [a * 1.6, -0.66 + 0.06 * b, lead + (trail - lead) * w]; }, 12, 4,
      (u, w, sd) => sd > 0 ? faByShade(back, 0.85) : belly, (u, w) => { const b = Math.abs(2 * u - 1); return 0.1 * Math.sin(Math.PI * w) * Math.sqrt(Math.max(0, 1 - b * b)); });
  });
  A.part('head', C(THd), () => {
    stretch(THd - 0.1, 1, 14, tt => 1 - 0.035 * faBySmooth(THd, THd - 0.1, tt));
    for (const s of [-1, 1]) {
      const k = W(9.6 / 11), y = k[1] - k[3];
      faByE(A, 'eye', [s * k[2] * 0.93, y - 0.12, k[0]], [0.07, 0.06, 0.08], 0x0a0c0e, { seg: 8 });
      const ml = []; for (let i = 0; i <= 5; i++) { const kk = W((8.4 + 2.5 * i / 5) / 11), yy = kk[1] - kk[3]; ml.push([s * kk[2] * 0.985, yy - 0.3 * kk[3], kk[0]]); }
      for (let i = 0; i < 5; i++) A.cone('mouth', ml[i], ml[i + 1], 0.03, 0.03, 0x10161a, 4);
    }
  });
}

/* ---------------------------------------------------------------- the entries */
ANIMAL({
  key: 'bay-soarer', name: 'Bay soarer', group: 'bay',
  tags: { biomes: ['swbay', 'nwbay'], koppen: ['Af', 'Am', 'Aw'], aridity: ['humid', 'subhumid'], climate: ['tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'water', 'rock'], locomotion: ['flies', 'glides'] },
  size: { length: 2.94, height: 0.5, span: 6.4 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '18-19, 42-55, 110-117', note: 'flocks of 7 to 12 wheeling in loops 90-220 m across, 40-120 m up over the bay and the shore, clear of the canopy and the tower' },
    { build: 'biomes/nwbay', file: 'src/75-biome-nwbay-fauna.js', lines: '18-19, 34-45, 84-90', note: 'the same flocks over the north-west bay, clear of the karst stacks\' tops' },
    { build: 'settlements/ys', file: 'src/86-bio-75-biome-nwbay-fauna.js', lines: '18-19, 34-45, 84-90', note: 'vendored nwbay fauna: Ys builds the north-west bay with fauna on (targets/city/89-city-biome.js)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 14, note: 'dark and fishy, eaten smoked by the bay\'s boat people' },
    eggs: { amount: 2, note: 'a clutch of one or two on the karst stacks\' ledges, taken by climbers' },
    feathers: { amount: 0.6, note: 'the moulted flight feathers: fletching and fans' } },
  life: { maturity: 5, lifespan: 45, litter: 1.5, gestation: 60, note: 'eggs (incubation days), nesting in colonies on the sea stacks' },
  variants: 2, variantNames: ['umber', 'dun'],
  w: 6.45, d: 2.95, h: 2.7,
  data: { mass: 38, legs: 0, wings: 1, speed: { walk: 0, run: 0, fly: 11 }, gait: { type: 'flyer', freq: 0.25, stride: 0 },
    flap: { freq: 0.25, amp: 0.75, glide: 0.35, fold: 0 }, airborne: true,
    herd: 'flocks of 7 to 12 wheeling in loops over the bay and the shore', fleeDistance: 30, aggression: 0.05,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'FLY', 'FLY', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  /* never lands in the biome: built gliding, its body 2.4 m up so a full downstroke clears the ground */
  build: function (A) { const o = FA_BY_SP.soarer; faByBird(A, { kind: 'soarer', S: o.S, y0: 2.4, body: o.body, wing: o.wing, tip: o.tip, beak: 0x4a3c30, leg: 0x3a3028 }); }
});
ANIMAL({
  key: 'canopy-darter', name: 'Canopy darter', group: 'bay',
  tags: { biomes: ['swbay', 'nwbay'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic', 'tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['canopy', 'trunks'], locomotion: ['flies', 'walks'] },
  size: { length: 0.5, height: 0.16, span: 1.1 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '20-21, 42-55, 118-123', note: 'flocks of 8 to 16 flickering in tight loops beside the crowns of the jungle canopy' },
    { build: 'biomes/nwbay', file: 'src/75-biome-nwbay-fauna.js', lines: '20-21, 34-45, 92-97', note: 'round the prism gums, fan-crowns, ironbarks and figs' },
    { build: 'settlements/ys', file: 'src/86-bio-75-biome-nwbay-fauna.js', lines: '20-21, 34-45, 92-97', note: 'vendored nwbay fauna (Ys)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 0.2, note: 'a mouthful; snared by children' }, feathers: { amount: 0.03, note: 'the teal and blue feathers, prized for ornament' } },
  life: { maturity: 1, lifespan: 8, litter: 3, gestation: 16, note: 'eggs in a hole high in a bole' },
  variants: 2, variantNames: ['blue', 'teal'], poses: ['perch', 'fly'],
  w: 1.12, d: 0.56, h: 0.21,
  data: { mass: 0.45, legs: 2, wings: 1, speed: { walk: 0.3, run: 1, fly: 14 }, gait: { type: 'flyer', freq: 1.43, stride: 0.04 },
    flap: { freq: 1.43, amp: 0.75, glide: 0, tuck: 0.9 },
    herd: 'flocks of 8 to 16 in tight loops round the crowns', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'REST', 'REST', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  /* perched (the default build): on its toes, tilted up, its wings closed along its flanks; pose 'fly' spreads them */
  build: function (A) { const o = FA_BY_SP.darter; faByBird(A, { kind: 'darter', S: o.S, y0: 0.11, body: o.body, wing: o.wing, tip: o.tip, beak: 0x1a2a30, leg: 0x2a2a2a, perch: true }); }
});
ANIMAL({
  key: 'plains-grazer', name: 'Plains grazer', group: 'bay',
  tags: { biomes: ['swbay'], koppen: ['Aw'], aridity: ['semiarid', 'subhumid'], climate: ['tropic'], riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground'], locomotion: ['walks', 'runs'] },
  size: { length: 3.4, height: 2.3 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '22-23, 58-67, 133-152', note: 'one herd of 14 to 24 wandering the savannah, heads down, turning away from trunks and the tower' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 330, note: 'a cow dressed: lean savannah game' }, hide: { amount: 1, hideM2: 4.5, note: 'a heavy hide: shields, sandals, tent covers' } },
  life: { maturity: 3, lifespan: 20, litter: 1, gestation: 270 },
  variants: 3, variantNames: ['tawny', 'sand', 'umber'],
  w: 0.93, d: 3.4, h: 2.5,
  data: { mass: 700, legs: 4, speed: { walk: 0.9, run: 14 }, gait: { type: 'quadruped', freq: 1.1, stride: 0.9 }, grazePitch: 1.35,
    herd: 'one herd of 14 to 24 wandering the savannah, a stalker or two trailing it', fleeDistance: 40, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) { faByGrazer(A); }
});
ANIMAL({
  key: 'savannah-stalker', name: 'Savannah stalker', group: 'bay',
  tags: { biomes: ['swbay'], koppen: ['Aw'], aridity: ['semiarid', 'subhumid'], climate: ['tropic'], riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'aggressive',
    habitat: ['ground'], locomotion: ['walks', 'runs', 'leaps'] },
  size: { length: 3.7, height: 1.7 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '26-27, 58-67, 141-148', note: 'one or two trailing the grazer herd ninety metres back: the grazer\'s shape scaled 1 : 0.85 : 1.25, longer and lower' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { hide: { amount: 1, hideM2: 3.2, note: 'the dark pelt, a hunter\'s trophy' } },
  life: { maturity: 3, lifespan: 16, litter: 2, gestation: 105 },
  variants: 3, variantNames: ['dusk', 'char', 'umber'],
  w: 0.72, d: 3.75, h: 1.75,
  data: { mass: 320, legs: 4, speed: { walk: 1.3, run: 17 }, gait: { type: 'quadruped', freq: 1.2, stride: 1.1 }, grazePitch: 0.9,
    herd: 'one or two, trailing the grazer herd ninety metres back', fleeDistance: 0, aggression: 0.7,
    schedule: ['REST', 'REST', 'REST', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'PATROL', 'REST', 'REST', 'REST', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'REST', 'REST', 'REST'] },
  build: function (A) { faByStalker(A); }
});
ANIMAL({
  key: 'bay-swimmer', name: 'Bay swimmer', group: 'bay',
  tags: { biomes: ['swbay', 'nwbay'], koppen: ['Af', 'Am'], aridity: ['humid'], climate: ['tropic'], riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'cathemeral', temperament: 'wary',
    habitat: ['deep water', 'water'], locomotion: ['swims'] },
  size: { length: 9, height: 2.8 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '28-29, 70-75, 153-167', note: 'pods of 3 to 6 cruising the deep water in slow arcs, backs and fins breaking the surface' },
    { build: 'biomes/nwbay', file: 'src/75-biome-nwbay-fauna.js', lines: '22-23, 46-55, 98-112', note: 'the same pods in the north-west bay' },
    { build: 'settlements/ys', file: 'src/86-bio-75-biome-nwbay-fauna.js', lines: '22-23, 46-55, 98-112', note: 'vendored nwbay fauna (Ys)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 9000, note: 'meat and blubber (lamp oil), taken, if ever, by the bay\'s boldest boats' },
    hide: { amount: 1, hideM2: 60, note: 'thick skin: boot soles, buckets' } },
  life: { maturity: 8, lifespan: 70, litter: 1, gestation: 400 },
  variants: 3, variantNames: ['slate', 'grey', 'dark'],
  w: 5.5, d: 9.1, h: 2.55,
  data: { mass: 25000, legs: 0, speed: { walk: 2.2, run: 8 }, gait: { type: 'swimmer', freq: 0.17, stride: 0 }, swim: { freq: 0.17, amp: 0.2, axis: 'x' },
    herd: 'pods of 3 to 6 cruising the deep water in slow arcs', fleeDistance: 15, aggression: 0.05,
    schedule: ['SWIM', 'SWIM', 'SWIM', 'REST', 'REST', 'SWIM', 'HUNT', 'HUNT', 'SWIM', 'SWIM', 'SWIM', 'SWIM', 'REST', 'SWIM', 'SWIM', 'SWIM', 'HUNT', 'HUNT', 'HUNT', 'SWIM', 'SWIM', 'SWIM', 'SWIM', 'SWIM'] },
  /* built at the waterline: its back at y 0.1, the fin above, the rest below */
  build: function (A) { faBySwimmer(A); }
});
ANIMAL({
  key: 'savannah-glider', name: 'Savannah glider', group: 'bay',
  tags: { biomes: ['swbay'], koppen: ['Aw'], aridity: ['semiarid', 'subhumid'], climate: ['tropic'], riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'scavenger', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'ground'], locomotion: ['flies', 'glides'] },
  size: { length: 6.0, height: 1.05, span: 13 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '30-31, 42-55, 124-127', note: 'twos to fives in wide slow circles (150-300 m) in the thermals 130-230 m over the savannah, barely a wingbeat' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { feathers: { amount: 1.5, note: 'the long flight feathers, a chief\'s fan or a cloak\'s fringe' } },
  life: { maturity: 7, lifespan: 50, litter: 1, gestation: 70, note: 'eggs (incubation days); it comes down only to a carcass' },
  variants: 2, variantNames: ['umber', 'buff'],
  w: 12.8, d: 5.65, h: 5.85,
  data: { mass: 90, legs: 0, wings: 1, speed: { walk: 1, run: 3, fly: 9 }, gait: { type: 'flyer', freq: 0.056, stride: 0 },
    flap: { freq: 0.056, amp: 0.75, glide: 0.8, fold: 0 }, airborne: true,
    herd: 'alone or two to five, circling wide and slow in the thermals', fleeDistance: 50, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  /* seen only in the thermals: built gliding, 4.9 m up so a full downstroke clears the ground */
  build: function (A) { const o = FA_BY_SP.glider; faByBird(A, { kind: 'glider', S: o.S, y0: 4.9, body: o.body, wing: o.wing, tip: o.tip, beak: 0x6a5a48, leg: 0x4a3c30 }); }
});
ANIMAL({
  key: 'cap-moth', name: 'Cap moth', group: 'bay',
  tags: { biomes: ['swbay'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'herbivore', feeding: 'frugivore', activity: 'crepuscular', temperament: 'skittish',
    habitat: ['canopy', 'trunks'], locomotion: ['flies'] },
  size: { length: 0.42, height: 0.12, span: 0.9 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '32-33, 42-55, 128-132', note: 'clouds of 10 to 18 under the caps of the cap-trees, where the spores fall (the biome drew it with the bird shape)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 0.08, note: 'the fat abdomen, roasted on a stick' } },
  life: { maturity: 0.3, lifespan: 1, litter: 200, gestation: 12, note: 'eggs on the cap-tree\'s gills; the larva bores in the cap' },
  variants: 2, variantNames: ['cream', 'buff'],
  w: 0.9, d: 0.34, h: 0.42,
  data: { mass: 0.3, legs: 0, wings: 1, speed: { walk: 0.05, run: 0, fly: 5 }, gait: { type: 'insect', freq: 2.23, stride: 0 },
    flap: { freq: 2.23, amp: 0.75 }, feeds: 'the cap-trees\' falling spores',
    herd: 'clouds of 10 to 18 under the caps of the cap-trees', fleeDistance: 2, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'FLY', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST'] },
  /* hovering (the biome has it only in its clouds): 0.34 m up so a downstroke clears the ground; its legs hang */
  build: function (A) { const o = FA_BY_SP.capmoth; faByMoth(A, { S: o.S, y0: 0.34, body: o.body, wing: o.wing, tip: o.tip }); }
});
ANIMAL({
  key: 'bloom-glint', name: 'Bloom glint', group: 'bay',
  tags: { biomes: ['swbay', 'nwbay'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'herbivore', feeding: 'frugivore', activity: 'crepuscular', temperament: 'skittish',
    habitat: ['canopy'], locomotion: ['flies'] },
  size: { length: 0.05, height: 0.02, span: 0.09 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '24-25, 168-178', note: 'swarms of 36 glinting points orbiting under the epiphyte-laden crowns' },
    { build: 'biomes/nwbay', file: 'src/75-biome-nwbay-fauna.js', lines: '24-25, 113-123', note: 'the same swarms in the north-west bay' },
    { build: 'settlements/ys', file: 'src/86-bio-75-biome-nwbay-fauna.js', lines: '24-25, 113-123', note: 'vendored nwbay fauna (Ys)' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 0.1, lifespan: 0.5, litter: 60, gestation: 7 },
  variants: 3, variantNames: ['gold', 'coral', 'violet'],
  w: 0.09, d: 0.06, h: 0.075,
  data: { mass: 0.002, legs: 0, wings: 1, speed: { walk: 0, run: 0, fly: 1.5 }, gait: { type: 'insect', freq: 12, stride: 0 },
    flap: { freq: 12, amp: 0.8 }, feeds: 'the epiphytes\' nectar', glow: true,
    herd: 'swarms of about 36 orbiting under the flowering crowns', fleeDistance: 0.5, aggression: 0,
    schedule: ['FLY', 'FLY', 'FLY', 'ROOST', 'ROOST', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY'] },
  /* hovering: its abdomen is the glint (the runtime has no emissive family: drawn bright) */
  build: function (A) { faByGlint(A, { y0: 0.06, col: FA_BY_SP.glint.col }); }
});
