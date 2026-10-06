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
   head and a beak. The wings keep its stations: root x 0.12 (chord +0.16..-0.14), x 0.55 (+0.20..-0.10), tip x 1.0
   (+0.14..+0.02), rising 0.05; the tail its fork (root -0.28, tips +-0.14 at -0.50, the notch at -0.40). */
const FA_BY_BIRD = [[-0.30, 0.02, 0.03, 0.022], [-0.20, 0.016, 0.07, 0.05], [-0.06, 0.006, 0.11, 0.074], [0.05, 0, 0.12, 0.08],
  [0.15, 0.008, 0.085, 0.064], [0.22, 0.018, 0.062, 0.054], [0.29, 0.02, 0.055, 0.048], [0.35, 0.012, 0.03, 0.026], [0.42, 0.002, 0.004, 0.004]];
function faByBird(A, o) {
  const S = o.S, y0 = o.y0, K = faByCurve(FA_BY_BIRD), fam = 'plain', v = A.variant;
  const body = o.body[v % o.body.length], wing = o.wing[v % o.wing.length], tip = o.tip, under = faByShade(body, 1.3);
  const C = t => { const k = K(t); return [0, y0 + k[1] * S, k[0] * S]; }, R = t => { const k = K(t); return [k[2] * S, k[3] * S]; };
  const feather = (t, a) => faByMix(body, under, 0.6 * faBySmooth(0.3, 0.9, -Math.cos(a)));
  const TB = 0.57, TH = 0.47;   /* the body ends at TB; the head (and neck) starts at TH, inside it, so a turned head leaves no gap */
  A.tube(fam, t => C(TB * t), t => R(TB * t), 12, 12, null, { caps: true, colf: (t, a) => feather(TB * t, a) });
  /* feet: tucked under the tail in flight, or the perch's legs below */
  if (!o.perch) for (const s of [1, -1]) faByE(A, fam, [s * 0.035 * S, y0 - 0.055 * S, -0.17 * S], [0.022 * S, 0.016 * S, 0.06 * S], o.leg, { seg: 8 });
  A.part('head', C(0.5), () => {
    A.tube(fam, t => C(TH + (1 - TH) * t), t => { const tt = TH + (1 - TH) * t, r = R(tt), k = 1 - 0.08 * faBySmooth(TB, TH, tt); return [r[0] * k, r[1] * k]; }, 10, 12, null,
      { caps: true, colf: (t, a) => { const tt = TH + (1 - TH) * t; return tt > 0.84 ? (tt > 0.95 ? faByShade(o.beak, 0.7) : o.beak) : feather(tt, a); } });
    const ke = K(0.7);
    for (const s of [-1, 1]) {
      faByE(A, 'eye', [s * ke[2] * 0.8 * S, y0 + (ke[1] + ke[3] * 0.38) * S, ke[0] * S], [0.016 * S, 0.016 * S, 0.016 * S], o.eye || 0x0c0a08, { seg: 8 });
      faByE(A, 'eye', [s * ke[2] * 0.93 * S, y0 + (ke[1] + ke[3] * 0.42) * S, (ke[0] + 0.006) * S], [0.005 * S, 0.006 * S, 0.005 * S], 0x020202, { seg: 6 });
    }
  });
  /* the wings: each extends outward from its root along +x (left) or -x (right), and flaps about z there */
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.1 * S, y0, 0.02 * S], () => {
    faByPlate(A, fam, (u, w) => {
      const lead = faByLag(u, 0.16, 0.2, 0.14), trail = faByLag(u, -0.14, -0.1, 0.02), m = (lead + trail) / 2;
      const h = (lead - trail) / 2 * (u > 0.8 ? 1 - 0.5 * Math.pow((u - 0.8) / 0.2, 2) : 1);
      return [s * (0.1 + 0.9 * u) * S, y0 + (faByLag(u, 0, 0.02, 0.05) + 0.014 * Math.sin(Math.PI * w) * (1 - u)) * S, (m + h * (2 * w - 1)) * S];
    }, 12, 4, (u, w, sd) => { const c = faByMix(wing, tip, faBySmooth(0.5, 0.97, u) + (w < 0.2 ? 0.3 * faBySmooth(0.45, 0.8, u) : 0)); return sd < 0 ? faByShade(c, 1.12) : c; },
    (u, w) => 0.012 * S * Math.sin(Math.PI * w) * (1 - 0.6 * u) * Math.sqrt(Math.max(0, 1 - u * u)));
  });
  /* the forked tail */
  A.part('tail', [0, y0 + 0.02 * S, -0.27 * S], () => {
    faByPlate(A, fam, (u, w) => { const a = 2 * u - 1; return [a * (0.035 + 0.105 * w) * S, y0 + (0.02 - 0.006 * w) * S, (-0.25 - w * (0.13 + 0.1 * Math.abs(a))) * S]; }, 8, 4,
      (u, w, sd) => faByShade(faByMix(body, tip, 0.55 * w), sd < 0 ? 1.15 : 1), (u, w) => { const a = 2 * u - 1; return 0.011 * S * (1 - a * a) * (1 - 0.9 * w); });
  });
  /* the perch's legs: a bare shank to the ground, three toes forward and one back */
  if (o.perch) for (const s of [1, -1]) {
    const hip = [s * 0.04 * S, y0 - 0.045 * S, 0.0];
    A.part(s > 0 ? 'leg0' : 'leg1', hip, () => {
      const ft = [s * 0.05 * S, 0.006, 0.012 * S];
      A.tube(fam, t => [hip[0] + (ft[0] - hip[0]) * t, hip[1] + (ft[1] - hip[1]) * t, hip[2] + (ft[2] - hip[2]) * t], t => { const r = (0.013 - 0.004 * t) * S; return [r, r]; }, 3, 6, o.leg, { caps: true });
      for (const a of [-0.5, 0, 0.5, Math.PI]) { const L = (a === Math.PI ? 0.045 : 0.07) * S;
        A.cone(fam, [ft[0], 0.0045, ft[2]], [ft[0] + Math.sin(a + s * 0.1) * L, 0.0035, ft[2] + Math.cos(a) * L], 0.0075 * S, 0.0035 * S, o.leg, 5); }
    });
  }
}

/* ---------------------------------------------------------------- the moth and the glint (insects, hovering) */
function faByMoth(A, o) {
  const S = o.S, y0 = o.y0, v = A.variant, fur = o.body[v % o.body.length], wing = o.wing[v % o.wing.length], tip = o.tip, P = (x, y, z) => [x * S, y0 + y * S, z * S];
  /* the biome drew it with the bird's diamond; a moth's body here: a furred thorax and a banded, tapering abdomen */
  faByE(A, 'coat', P(0, 0, 0.06), [0.075 * S, 0.07 * S, 0.1 * S], fur, { seg: 12 });
  A.tube('coat', t => P(0, -0.008 - 0.025 * t, 0.0 - 0.33 * t), t => { const r = (0.012 + 0.055 * Math.sin(Math.PI * (0.3 + 0.7 * t))) * S; return [r, r * 0.95]; }, 10, 10, null,
    { caps: true, colf: t => t > 0.88 ? tip : (Math.sin(t * 36) > 0.55 ? faByShade(fur, 0.74) : fur) });
  const fuzz = [];
  for (let i = 0; i < 26; i++) { const a = A.rr(-1.4, 1.4), z = A.rr(0.0, 0.13); fuzz.push({ at: P(Math.sin(a) * 0.07, Math.cos(a) * 0.065, z), dir: [Math.sin(a) * 0.6, Math.cos(a) * 0.3, -0.7], len: A.rr(0.04, 0.07) * S, w: 0.03 * S, col: faByShade(fur, A.rr(0.9, 1.05)), curl: 0.3 }); }
  A.locks('hair', fuzz);
  /* six legs, drawn hanging (it hovers; no leg parts) */
  for (const s of [-1, 1]) for (const [z, dz] of [[0.11, 0.12], [0.06, 0.02], [0.01, -0.1]]) {
    const a = P(s * 0.03, -0.05, z), b = P(s * 0.1, -0.1, z + dz * 0.5), c = P(s * 0.12, -0.2, z + dz);
    A.cone('plain', a, b, 0.012 * S, 0.009 * S, faByShade(fur, 0.6), 5); A.cone('plain', b, c, 0.009 * S, 0.004 * S, faByShade(fur, 0.5), 5);
  }
  A.part('head', P(0, 0, 0.14), () => {
    faByE(A, 'coat', P(0, 0.005, 0.185), [0.045 * S, 0.042 * S, 0.04 * S], fur, { seg: 10 });
    for (const s of [-1, 1]) {
      faByE(A, 'eye', P(s * 0.034, 0.012, 0.205), [0.024 * S, 0.026 * S, 0.022 * S], 0x2a1e14, { seg: 8 });
      /* the feathered antennae: a shaft with short barbs either side */
      const a0 = P(s * 0.018, 0.035, 0.215), a1 = P(s * 0.13, 0.13, 0.36);
      A.cone('plain', a0, a1, 0.006 * S, 0.002 * S, tip, 4);
      for (let k = 1; k <= 6; k++) { const t = k / 7, p = [a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t, a0[2] + (a1[2] - a0[2]) * t], L = 0.035 * S * Math.sin(Math.PI * (0.15 + 0.7 * t));
        for (const q of [-1, 1]) A.cone('plain', p, [p[0] + s * q * L * 0.45, p[1] + q * L * 0.5, p[2] - L * 0.6], 0.0025 * S, 0.001 * S, tip, 3); }
    }
    faByE(A, 'mouth', P(0, -0.03, 0.2), [0.012 * S, 0.012 * S, 0.012 * S], 0x3a2a1a, { seg: 6 });
  });
  /* the wings: the forewing on the biome's planform (its tips the darker colour), the hindwing behind, coupled to it
     (a moth's wings beat as one: they share the part) */
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * 0.05, 0.02, 0.06), () => {
    faByPlate(A, 'plain', (u, w) => {
      const lead = faByLag(u, 0.16, 0.2, 0.14), trail = faByLag(u, -0.14, -0.1, 0.02), m = (lead + trail) / 2, h = (lead - trail) / 2 * (u > 0.8 ? 1 - 0.55 * Math.pow((u - 0.8) / 0.2, 2) : 1);
      return P(s * (0.05 + 0.92 * u), 0.02 + 0.04 * u, m + h * (2 * w - 1));
    }, 12, 5, (u, w, sd) => { const d = Math.hypot(u - 0.46, (w - 0.55) * 0.5); let c = faByMix(wing, tip, faBySmooth(0.55, 0.95, u));
      if (d < 0.05) c = faByShade(tip, 0.7); else if (Math.abs(u - 0.7) < 0.025) c = faByShade(c, 0.88); return sd < 0 ? faByShade(c, 0.94) : c; }, (u, w) => 0.004 * S * Math.sin(Math.PI * w) * (1 - u * u));
    faByPlate(A, 'plain', (u, w) => {
      const lead = faByLag(u, -0.04, -0.07, -0.14, 0.5), trail = faByLag(u, -0.2, -0.32, -0.22, 0.5), m = (lead + trail) / 2, h = (lead - trail) / 2 * Math.sqrt(Math.max(0.08, 1 - Math.pow(Math.max(0, u - 0.55) / 0.45, 2)));
      return P(s * (0.04 + 0.58 * u), 0.008 + 0.02 * u, m + h * (2 * w - 1));
    }, 10, 5, (u, w, sd) => { const d = Math.hypot(u - 0.5, (w - 0.45) * 0.6); let c = u > 0.82 || w < 0.12 ? faByMix(wing, tip, 0.7) : faByShade(wing, 0.96);
      if (d < 0.05) c = 0x3a2a1a; else if (d < 0.1) c = tip; return sd < 0 ? faByShade(c, 0.94) : c; }, (u, w) => 0.003 * S * Math.sin(Math.PI * w) * (1 - u * u));
  });
}
function faByGlint(A, o) {
  const y0 = o.y0, glow = o.col[A.variant % o.col.length], P = (x, y, z) => [x, y0 + y, z], dk = 0x2a2418;
  /* the biome's points: a glowing abdomen (the glint), a dark thorax and head, two clear wings */
  faByE(A, 'plain', P(0, 0, 0.004), [0.0065, 0.006, 0.008], dk, { seg: 8 });
  faByE(A, 'glow', P(0, -0.001, -0.014), [0.0075, 0.0068, 0.014], glow, { seg: 10 });
  for (const s of [-1, 1]) for (const z of [0.008, 0.003, -0.002]) A.cone('plain', P(s * 0.003, -0.004, z), P(s * 0.009, -0.012, z - 0.003), 0.0012, 0.0006, dk, 3);
  A.part('head', P(0, 0, 0.01), () => {
    faByE(A, 'plain', P(0, 0.001, 0.015), [0.0045, 0.0042, 0.004], dk, { seg: 8 });
    for (const s of [-1, 1]) { faByE(A, 'eye', P(s * 0.0032, 0.0015, 0.0165), [0.0022, 0.0026, 0.0022], 0x101010, { seg: 6 });
      A.cone('plain', P(s * 0.0015, 0.004, 0.018), P(s * 0.006, 0.01, 0.028), 0.0006, 0.0003, dk, 3); }
  });
  for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * 0.004, 0.004, 0.006), () => {
    faByPlate(A, 'plain', (u, w) => { const c = 0.004 - 0.008 * u, h = 0.0085 * Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.max(0, u - 0.5) / 0.5, 2))) * (0.7 + 0.3 * u);
      return P(s * (0.004 + 0.04 * u), 0.004 + 0.003 * u, c + h * (2 * w - 1)); }, 8, 3,
      (u, w, sd) => faByMix(0xe6eef0, glow, 0.15 + 0.1 * u), (u, w) => 0.0004 * Math.sin(Math.PI * w));
  });
}

/* ---------------------------------------------------------------- the grazer and the stalker (the biome's grazerGeo)
   Its unit (height 1 at the shoulder, head to -z; here +z): the barrel 0.46 x 0.44 x 1.1 at y 0.72 (the belly colour
   on its lower quarter), the neck 0.22 x 0.36 x 0.34 at z 0.62, the head 0.2 x 0.2 x 0.42 at y 1.12, z 0.86 (dark
   below), a dark tail 0.28 long at y 0.75, four legs 0.52 tall at x +-0.16, z +-0.4 (dark low). Scaled [x, y, z]. */
const FA_BY_BARREL = [[-0.58, 0.74, 0.1, 0.12], [-0.5, 0.745, 0.19, 0.19], [-0.32, 0.735, 0.23, 0.22], [0, 0.72, 0.235, 0.225], [0.3, 0.73, 0.235, 0.23], [0.47, 0.76, 0.2, 0.21], [0.56, 0.78, 0.11, 0.13]];
function faByQuad(A, q) {
  const v = A.variant, Kx = q.K[0], Ky = q.K[1], Kz = q.K[2], hide = q.hide[v % q.hide.length], belly = q.belly, dark = faByShade(hide, 0.6), pred = !!q.pred;
  const P = (x, y, z) => [x * Kx, y * Ky, z * Kz], B = faByCurve(FA_BY_BARREL);
  const mott = (x, y, z) => faByShade(hide, 0.92 + 0.16 * faNoise(x * 4 + v * 7, y * 4, z * 4));
  /* the barrel; a stalker's belly tucked up at the waist */
  A.tube('coat', t => { const k = B(t); return P(0, k[1] + (pred ? 0.03 * Math.exp(-Math.pow((t - 0.32) / 0.2, 2)) : 0), k[0]); },
    t => { const k = B(t), w = pred ? 1 - 0.16 * Math.exp(-Math.pow((t - 0.32) / 0.2, 2)) : 1; return [k[2] * Kx * (pred ? 0.94 : 1), k[3] * Ky * w]; }, 16, 14, null,
    { caps: true, colf: (t, a) => { const k = B(t); return faByMix(mott(Math.sin(a) * 0.2, k[1] + Math.cos(a) * 0.2, k[0]), belly, faBySmooth(0.5, 0.85, -Math.cos(a))); } });
  /* the head with the neck: it turns about the neck's root to graze */
  A.part('head', P(0, 0.86, 0.42), () => {
    const nk = faByCurve([[0.82, 0.36], [0.95, 0.55], [1.07, 0.7]]);
    A.tube('coat', t => { const k = nk(t); return P(0, k[0], k[1]); }, t => [(0.11 - 0.025 * t) * Kx, (0.18 - 0.075 * t) * Ky], 6, 12, null,
      { colf: (t, a) => faByMix(mott(Math.sin(a) * 0.1, 1, 0.55), belly, 0.55 * faBySmooth(0.45, 0.85, -Math.cos(a))) });
    const hd = pred ? faByCurve([[1.17, 0.63], [1.165, 0.86], [1.13, 1.07]]) : faByCurve([[1.15, 0.63], [1.14, 0.86], [1.09, 1.07]]);
    const hr = pred ? (t => [(0.1 - 0.05 * t * t) * Kx, (0.1 - 0.058 * t) * Ky]) : (t => [(0.095 - 0.042 * t * t) * Kx, (0.105 - 0.05 * t) * Ky]);
    A.tube('coat', t => { const k = hd(t); return P(0, k[0], k[1]); }, hr, 10, 12, null, { caps: true, colf: (t, a) => {
      const lo = -Math.cos(a); if (!pred && t > 0.86) return 0x2a2420; if (pred && t > 0.93) return 0x1a1412;
      return lo > (pred ? 0.3 : 0.6) ? (pred ? faByMix(dark, belly, 0.35) : dark) : faByMix(mott(0, 1.15, 0.86), dark, faBySmooth(0.75, 0.86, t) * 0.6); } });
    for (const s of [-1, 1]) {
      const e = pred ? P(s * 0.075, 1.19, 0.84) : P(s * 0.088, 1.17, 0.8);
      faByE(A, 'eye', e, [0.021 * Kx, 0.021 * Ky, 0.018 * Kz], pred ? 0xc89030 : 0x1a120c, { seg: 8 });
      if (pred) faByE(A, 'eye', [e[0] + s * 0.012 * Kx, e[1], e[2] + 0.004 * Kz], [0.008 * Kx, 0.014 * Ky, 0.008 * Kz], 0x050403, { seg: 6 });
      faByE(A, 'mouth', pred ? P(s * 0.022, 1.135, 1.075) : P(s * 0.03, 1.105, 1.07), [0.011 * Kx, 0.008 * Ky, 0.006 * Kz], 0x120c0a, { seg: 6 });
    }
    if (pred) for (const s of [-1, 1]) A.cone('horn', P(s * 0.03, 1.105, 1.03), P(s * 0.03, 1.06, 1.036), 0.009 * Kx, 0.002 * Kx, 0xe8e0c8, 5);
  });
  /* a stalker's lower jaw */
  if (pred) A.part('jaw', P(0, 1.1, 0.7), () => {
    A.tube('coat', t => P(0, 1.085 - 0.01 * t, 0.7 + 0.35 * t), t => [(0.07 - 0.035 * t) * Kx, (0.032 - 0.012 * t) * Ky], 6, 10, null, { caps: true, colf: (t, a) => faByMix(dark, belly, 0.45) });
    A.cone('horn', P(0.026, 1.07, 1.0), P(0.026, 1.1, 1.003), 0.007 * Kx, 0.002 * Kx, 0xe8e0c8, 5); A.cone('horn', P(-0.026, 1.07, 1.0), P(-0.026, 1.1, 1.003), 0.007 * Kx, 0.002 * Kx, 0xe8e0c8, 5);
  });
  /* the ears: a grazer's broad and drooping, a stalker's short and rounded, upright */
  for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', pred ? P(s * 0.06, 1.24, 0.69) : P(s * 0.07, 1.22, 0.7), () => {
    if (pred) faByE(A, 'coat', P(s * 0.075, 1.27, 0.69), [0.04 * Kx, 0.055 * Ky, 0.016 * Kz], faByShade(hide, 0.8), { rz: -s * 0.35, seg: 10 });
    else faByE(A, 'coat', P(s * 0.13, 1.23, 0.69), [0.075 * Kx, 0.022 * Ky, 0.036 * Kz], hide, { rz: s * 0.45, ry: -s * 0.3, seg: 10 });
  });
  /* the tail: a grazer's droops to a dark tuft; a stalker's is longer and hangs */
  A.part('tail', P(0, 0.77, -0.54), () => {
    const tl = pred ? faByCurve([[0.8, -0.54], [0.72, -0.72], [0.56, -0.84]]) : faByCurve([[0.77, -0.54], [0.72, -0.68], [0.62, -0.78]]);
    A.tube('coat', t => { const k = tl(t); return P(0, k[0], k[1]); }, t => [(0.045 - 0.018 * t) * Kx, (0.045 - 0.018 * t) * Ky], 6, 8, null, { caps: true, colf: t => pred && t < 0.6 ? mott(0, 0.7, -0.7) : dark });
    if (!pred) { const L = []; for (let i = 0; i < 7; i++) L.push({ at: P(A.rr(-0.012, 0.012), 0.64, -0.775), dir: [A.rr(-0.25, 0.25), -1, -0.35], len: A.rr(0.1, 0.15) * Ky, w: 0.028 * Kx, col: faByShade(dark, 0.7), curl: 0.1 }); A.locks('hair', L); }
  });
  /* the legs: each turns about its top; a grazer's end in hooves, a stalker's in broad clawed paws */
  const LEGS = [[0.15, 0.38, 1, 0], [-0.15, 0.38, 1, 1], [0.15, -0.38, 0, 2], [-0.15, -0.38, 0, 3]];
  for (const [x, z, front, i] of LEGS) A.part('leg' + i, P(x, 0.62, z), () => {
    const pts = pred ? (front ? [[x, 0.64, z], [x, 0.36, z - 0.02], [x, 0.12, z], [x, 0.05, z + 0.015]] : [[x, 0.66, z], [x, 0.45, z - 0.05], [x, 0.2, z - 0.1], [x, 0.05, z - 0.07]])
      : (front ? [[x, 0.64, z], [x, 0.36, z + 0.01], [x, 0.12, z + 0.02], [x, 0.03, z + 0.025]] : [[x, 0.66, z], [x, 0.4, z - 0.07], [x, 0.16, z - 0.03], [x, 0.03, z]]);
    const L = faByCurve(pts.map(p => P(p[0], p[1], p[2]))), r0 = front ? 0.068 : 0.085, r1 = pred ? 0.036 : 0.03;
    A.tube('coat', L, t => { const r = r0 + (r1 - r0) * Math.min(1, t * 1.5); return [r * Kx, r * Kz]; }, 8, 10, null, { colf: t => t > 0.74 ? dark : mott(x, 0.4, z) });
    const ft = pts[3];
    if (pred) {
      faByE(A, 'coat', P(x, 0.03, ft[2] + 0.03), [0.048 * Kx, 0.03 * Ky, 0.062 * Kz], dark, { seg: 10 });
      for (const dx of [-0.025, 0, 0.025]) A.cone('horn', P(x + dx, 0.022, ft[2] + 0.08), P(x + dx * 1.2, 0.008, ft[2] + 0.1), 0.007 * Kx, 0.002 * Kx, 0x2a2420, 4);
    } else A.cone('hoof', P(x, 0, ft[2] + 0.004), P(x, 0.05, ft[2]), 0.04 * (Kx + Kz) / 2, 0.033 * (Kx + Kz) / 2, 0x1e1a16, 8);
  });
  A.anchor('lead', P(0, 1.05, 0.72)); A.anchor('back', P(0, 0.96, 0));
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
  const skin = (t, a) => { const k = W(t); return faByMix(faByShade(back, 0.9 + 0.2 * faNoise(t * 16 + v * 3, a * 2.2, 1.3)), belly, faBySmooth(0.15, 0.75, -Math.cos(a))); };
  /* a stretch of the body; a part's stretch reaches into its neighbour (shrunk a little) so a turned joint shows no gap */
  const stretch = (t0, t1, nt, shrink) => A.tube('skin', t => C(t0 + (t1 - t0) * t), t => { const tt = t0 + (t1 - t0) * t, r = R(tt), k = shrink ? shrink(tt) : 1; return [r[0] * k, r[1] * k]; },
    nt, 18, null, { caps: true, colf: (t, a) => skin(t0 + (t1 - t0) * t, a) });
  const TT = 3 / 11, THd = 7.4 / 11;   /* the tail turns at z -1.6, the head at z 2.95 */
  stretch(TT, THd, 18);
  /* the dorsal fin (the biome's: base z -0.9 .. 1.44, apex z 0.18, 2.4 m over the back) */
  faByPlate(A, 'skin', (u, w) => { const z0 = -0.9 + 2.34 * u, top = 0.06 - 0.02 * Math.abs(u - 0.5); return [0, (top - 0.12) * (1 - w) + 2.5 * w, z0 + (0.18 - z0) * w - 0.35 * Math.sin(Math.PI * w) * u]; }, 8, 7,
    (u, w) => faByShade(fin, 1 - 0.15 * w), (u, w) => 0.14 * (1 - w) * Math.sqrt(Math.sin(Math.PI * u)), [1, 0, 0]);
  /* the flippers, and the blowhole */
  for (const s of [-1, 1]) faByPlate(A, 'skin', (u, w) => { const ch = 0.95 - 0.6 * u, zc = 2.1 - 1.0 * u * u; return [s * (1.35 + 1.35 * u), -1.15 - 0.55 * u, zc + ch * (w - 0.5)]; }, 8, 4,
    (u, w, sd) => sd > 0 ? faByShade(back, 0.95) : belly, (u, w) => 0.12 * Math.sin(Math.PI * w) * (1 - 0.7 * u) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 3))));
  faByE(A, 'mouth', [0, 0.02, 2.75], [0.13, 0.03, 0.07], 0x0c1216, { seg: 8 });
  A.part('tail', C(TT), () => {
    stretch(0, TT + 0.06, 12, tt => 1 - 0.06 * faBySmooth(TT, TT + 0.06, tt));
    /* the flukes: 3.2 m across, swept back, notched at the middle */
    faByPlate(A, 'skin', (u, w) => { const a = 2 * u - 1, b = Math.abs(a), lead = -3.66 - 0.62 * Math.pow(b, 1.6), trail = -3.9 - 0.52 * Math.pow(b, 0.7); return [a * 1.6, -0.66 + 0.06 * b, lead + (trail - lead) * w]; }, 12, 4,
      (u, w, sd) => sd > 0 ? faByShade(back, 0.85) : belly, (u, w) => { const b = Math.abs(2 * u - 1); return 0.1 * Math.sin(Math.PI * w) * Math.sqrt(Math.max(0, 1 - b * b)); });
  });
  A.part('head', C(THd), () => {
    stretch(THd - 0.05, 1, 12, tt => 1 - 0.05 * faBySmooth(THd, THd - 0.05, tt));
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
  build: function (A) { const o = FA_BY_SP.soarer; faByBird(A, { S: o.S, y0: 2.4, body: o.body, wing: o.wing, tip: o.tip, beak: 0x4a3c30, leg: 0x3a3028 }); }
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
  variants: 2, variantNames: ['blue', 'teal'],
  w: 1.12, d: 0.75, h: 0.2,
  data: { mass: 0.45, legs: 2, wings: 1, speed: { walk: 0.3, run: 1, fly: 14 }, gait: { type: 'flyer', freq: 1.43, stride: 0.04 },
    flap: { freq: 1.43, amp: 0.75, glide: 0, fold: 0.12, sweep: 1.3, tuck: 0.9 },
    herd: 'flocks of 8 to 16 in tight loops round the crowns', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'REST', 'REST', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  /* perched: standing on its toes; at rest its wings are held up over its back (fold), spread in flight */
  build: function (A) { const o = FA_BY_SP.darter; faByBird(A, { S: o.S, y0: 0.1, body: o.body, wing: o.wing, tip: o.tip, beak: 0x1a2a30, leg: 0x2a2a2a, perch: true }); }
});
ANIMAL({
  key: 'plains-grazer', name: 'Plains grazer', group: 'bay',
  tags: { biomes: ['swbay'], koppen: ['Aw'], aridity: ['semiarid', 'subhumid'], climate: ['tropic'], riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground'], locomotion: ['walks', 'runs'] },
  size: { length: 3.5, height: 2.3 },
  source: [{ build: 'biomes/swbay', file: 'src/75-biome-swbay-fauna.js', lines: '22-23, 58-67, 133-152', note: 'one herd of 14 to 24 wandering the savannah, heads down, turning away from trunks and the tower' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 330, note: 'a cow dressed: lean savannah game' }, hide: { amount: 1, hideM2: 4.5, note: 'a heavy hide: shields, sandals, tent covers' } },
  life: { maturity: 3, lifespan: 20, litter: 1, gestation: 270 },
  variants: 3, variantNames: ['tawny', 'sand', 'umber'],
  w: 0.9, d: 3.65, h: 2.42,
  data: { mass: 700, legs: 4, speed: { walk: 0.9, run: 14 }, gait: { type: 'quadruped', freq: 1.1, stride: 0.9 }, grazePitch: 1.35,
    herd: 'one herd of 14 to 24 wandering the savannah, a stalker or two trailing it', fleeDistance: 40, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) { const o = FA_BY_SP.grazer; faByQuad(A, { K: [1.9, 1.9, 1.9], hide: o.hide, belly: o.belly }); }
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
  w: 0.8, d: 3.9, h: 1.82,
  data: { mass: 320, legs: 4, speed: { walk: 1.3, run: 17 }, gait: { type: 'quadruped', freq: 1.2, stride: 1.1 }, grazePitch: 0.9,
    herd: 'one or two, trailing the grazer herd ninety metres back', fleeDistance: 0, aggression: 0.7,
    schedule: ['REST', 'REST', 'REST', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'PATROL', 'REST', 'REST', 'REST', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'REST', 'REST', 'REST'] },
  build: function (A) { const o = FA_BY_SP.stalker; faByQuad(A, { K: [1.6, 1.36, 2.0], hide: o.hide, belly: o.belly, pred: true }); }
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
  w: 13.1, d: 6.0, h: 5.5,
  data: { mass: 90, legs: 0, wings: 1, speed: { walk: 1, run: 3, fly: 9 }, gait: { type: 'flyer', freq: 0.056, stride: 0 },
    flap: { freq: 0.056, amp: 0.75, glide: 0.8, fold: 0 }, airborne: true,
    herd: 'alone or two to five, circling wide and slow in the thermals', fleeDistance: 50, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  /* seen only in the thermals: built gliding, 4.9 m up so a full downstroke clears the ground */
  build: function (A) { const o = FA_BY_SP.glider; faByBird(A, { S: o.S, y0: 4.9, body: o.body, wing: o.wing, tip: o.tip, beak: 0x6a5a48, leg: 0x4a3c30 }); }
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
