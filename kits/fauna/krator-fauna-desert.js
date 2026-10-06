/* ======================================================================
   Krator Fauna: the eastern high desert (kits/fauna/krator-fauna-desert.js)
   The six kinds of the sedesert biome's fauna layer (biomes/sedesert/src/75-biome-sedesert-fauna.js), moved here
   2026-10-06: the desert kite and the wadi swift (flyers: perched by default, the wings flap in 'fly'), the sand
   strider (a flightless walker), the rock lizard (a sprawler on the boulders), the canyon mule deer and the coyote
   (quadrupeds). The biome drew them as unit instanced meshes (a gliding-bird spindle, rods for legs); here each is
   at real size in metres with jointed legs (knee, hock, fetlock) that stand bent the way the animal stands, the
   biome's own palette, sizes and tags (SEDESERT.FAUNA: climate tropic, the aridity and riparian of each).
   ====================================================================== */
const FA_DS_SRC = 'src/75-biome-sedesert-fauna.js';
/* a Catmull-Rom curve through joint points, t 0..1 split evenly between the spans (for limbs, necks, tails) */
function faDsSpline(pts) {
  const n = pts.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), k = Math.floor(f), u = f - k, u2 = u * u, u3 = u2 * u;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(n, k + 2)], o = [0, 0, 0];
    for (let i = 0; i < 3; i++) o[i] = 0.5 * (2 * p1[i] + (p2[i] - p0[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u2 + (3 * p1[i] - p0[i] - 3 * p2[i] + p3[i]) * u3);
    return o;
  };
}
/* the section along the same joints: rs[k] a radius or [half-width, half-height], eased between joints */
function faDsRad(rs) {
  const n = rs.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), k = Math.floor(f), u = f - k, e = u * u * (3 - 2 * u);
    const a = Array.isArray(rs[k]) ? rs[k] : [rs[k], rs[k]], b = Array.isArray(rs[k + 1]) ? rs[k + 1] : [rs[k + 1], rs[k + 1]];
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
  };
}
/* sRGB hex -> [r,g,b] scaled; and a blend of two hexes */
function faDsShade(hex, k) { const c = new THREE.Color(hex); return [Math.min(1, c.r * k), Math.min(1, c.g * k), Math.min(1, c.b * k)]; }
function faDsMix(a, b, t) { const c = new THREE.Color(a), d = new THREE.Color(b); return [c.r + (d.r - c.r) * t, c.g + (d.g - c.g) * t, c.b + (d.b - c.b) * t]; }
function faDsScale(p, K) { return [p[0] * K, p[1] * K, p[2] * K]; }
/* A.tube with ROUNDED ends in place of the builder's flat caps (whose discs face into the tube, so an end in view
   reads as a hole): o.caps closes each end with m rings stepping out along the end's tangent to a point, a dome
   o.round[0|1] times the end's radius deep (default 0.6). Without o.caps it is A.tube as it stands. */
function faDsTube(A, fam, c, rad, nt, ns, col, o) {
  o = o || {};
  if (!o.caps) return A.tube(fam, c, rad, nt, ns, col, o);
  const m = 3, N = nt + 2 * m, rd = o.round || [0.6, 0.6], ends = [];
  for (const [u, v] of [[0, 0.01], [1, 0.99]]) {
    const p = c(u), q = c(v), d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]], L = Math.hypot(d[0], d[1], d[2]) || 1, r = rad(u);
    ends.push({ p: p, T: [d[0] / L, d[1] / L, d[2] / L], r: r, D: rd[u ? 1 : 0] * (r[0] + r[1]) / 2 });
  }
  /* ring i of N: the dome's rings at either end, the curve's own between */
  const map = function (x) {
    const i = Math.round(x * N);
    if (i > m && i < N - m) return { u: (i - m) / nt };
    const E = i <= m ? ends[0] : ends[1], j = i <= m ? m - i : i - (N - m), ph = j / m * Math.PI / 2, off = Math.max(1e-4, E.D * Math.sin(ph)) * (j ? 1 : 0.02);
    return { u: i <= m ? 0 : 1, p: [E.p[0] + E.T[0] * off, E.p[1] + E.T[1] * off, E.p[2] + E.T[2] * off], k: Math.cos(ph) };
  };
  const o2 = Object.assign({}, o, { caps: false });
  if (o.colf) o2.colf = (x, a) => o.colf(map(x).u, a);
  A.tube(fam, x => { const R = map(x); return R.p || c(R.u); }, x => { const R = map(x), r = rad(R.u), k = R.k == null ? 1 : R.k; return [r[0] * k, r[1] * k]; }, N, ns, col, o2);
}
/* A.cone with rounded ends (faDsTube) */
function faDsCone(A, fam, a, b, r0, r1, col, seg, rd) {
  faDsTube(A, fam, t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], t => { const r = r0 + (r1 - r0) * t; return [r, r]; }, 2, seg || 6, col, { caps: true, round: rd || [0.4, 0.4] });
}
/* a wing on its own part, extending from the pivot along +x (left, s = 1) or -x (right): a flat tube along the span,
   its section [half-chord, half-thickness]; W: xs(t) the span, zc(t) the chord's middle, hc(t), dy(t), th(t) (metres
   from the pivot), top / under colours, fingers: [{x, z, a, len, w}] slotted primaries fanning from the tip */
function faDsWing(A, s, pv, W) {
  A.part(s > 0 ? 'wingL' : 'wingR', pv, () => {
    const colf = (t, a) => Math.cos(a) >= 0 ? (W.topf ? W.topf(t) : W.top) : W.under;
    faDsTube(A, 'plain', t => [pv[0] + s * W.xs(t), pv[1] + W.dy(t), pv[2] + W.zc(t)], t => [W.hc(t), W.th(t)], W.nt || 12, 8, null, { caps: true, colf: colf });
    for (const F of (W.fingers || [])) {
      const b = [pv[0] + s * F.x, pv[1] + F.y, pv[2] + F.z], d = [s * Math.cos(F.a), -0.04, Math.sin(F.a)];
      faDsTube(A, 'plain', t => [b[0] + d[0] * F.len * t, b[1] + d[1] * F.len * t * t, b[2] + d[2] * F.len * t], t => [F.w * (1 - 0.55 * t), F.th * (1 - 0.5 * t)], 3, 6, null,
        { caps: true, colf: (t, a) => Math.cos(a) >= 0 ? W.tip : W.under });
    }
  });
}
/* a bird's foot: three toes forward, one back, each with a dark claw */
function faDsToes(A, ft, toes, r, col, claw) {
  for (const T of toes) {
    const e = [ft[0] + T[0], ft[1] + T[1], ft[2] + T[2]];
    faDsCone(A, 'skin', ft, e, r, r * 0.6, col, 6);
    const L = Math.hypot(T[0], T[2]) || 1;
    faDsCone(A, 'horn', e, [e[0] + T[0] / L * r * 1.6, Math.max(0.001, e[1] - r * 0.9), e[2] + T[2] / L * r * 1.6], r * 0.55, r * 0.12, claw, 5);
  }
}

/* ---------------------------------------------------------------- the desert kite */
/* the biome's kites: big broad-winged raptors circling in the thermals over the mesas, the butte and the canyon, a few
   to a thermal, span 2.6-3.4 m (the G.bird spindle: dark above, pale beneath, 0x4a3a2c). Here at a 3 m span: the body
   and tail of the spindle's proportions (1.2 m nose to tail), a hooked bill, feathered legs and taloned feet; perched,
   its wings let down and half open (a raptor sunning: fold 0.3), in 'fly' they beat slowly and glide */
const FA_DS_KITE = { top: 0x2a2118, body: 0x433428, under: 0x4d3c2c, head: 0x54422f, tip: 0x1c1712, bill: 0x2e2a26, cere: 0xb09a50, feet: 0xb09a58, claw: 0x161310, eye: 0x9a6a1a };
ANIMAL({
  key: 'desert-kite', name: 'Desert kite', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['arid', 'semiarid'], climate: ['tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'rock'], locomotion: ['flies', 'glides', 'walks'] },
  size: { length: 1.2, height: 0.62, span: 3.0 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '35-46, 182-187, 211-213', note: 'G.bird (the gliding spindle, span 1, scaled 2.6-3.4) circling the thermals over the rim, the badland and the high ground; key kite' },
    { build: 'settlements/shade', file: FA_DS_SRC, lines: '26-37, 70-75', note: 'the vendored older copy of the biome\'s fauna: kites over the basin rim' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit (biomes/sedesert/src) with its fauna round the upper city' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { feathers: { amount: 0.25, note: 'moulted flight feathers gathered under the roost cliffs: fletching and headdresses' } },
  life: { maturity: 5, lifespan: 30, litter: 1.5, gestation: 55, note: 'a clutch of one or two on a cliff ledge; gestation is the incubation' },
  w: 3.05, d: 1.95, h: 0.66,
  data: { mass: 6.5, legs: 2, wings: 1, speed: { walk: 0.6, run: 2, fly: 16 }, gait: { type: 'flyer', freq: 1.2, stride: 0.2 },
    flap: { freq: 1.1, amp: 0.45, glide: 0.65, fold: 0.12, sweep: 1.3, tuck: 0.9 }, grazePitch: 0.5, sizeRange: [0.87, 1.13],
    herd: 'pairs; two to five birds share a thermal', fleeDistance: 40, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'IDLE', 'FLY', 'HUNT', 'FLY', 'FLY', 'FLY', 'HUNT', 'FLY', 'FLY', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_DS_KITE, yb = 0.36, P = 0.28, sp = Math.sin(P), cp = Math.cos(P);
    /* a point on the body's pitched axis: zp along it, up across it */
    const ax = (x, zp, up) => [x, yb + zp * sp + up * cp, zp * cp - up * sp];
    const under = (a) => Math.cos(a) < -0.25;
    /* the body: rump to chest along the pitched axis */
    const bz = [-0.42, -0.26, -0.05, 0.14, 0.3];
    faDsTube(A, 'coat', faDsSpline(bz.map(z => ax(0, z, 0))), faDsRad([[0.045, 0.05], [0.09, 0.1], [0.115, 0.13], [0.1, 0.12], [0.06, 0.07]]), 12, 12, null,
      { caps: true, colf: (t, a) => under(a) ? C.under : (Math.cos(a) > 0.6 ? C.top : C.body) });
    /* the head on its neck, held up; a hooked bill with a yellow cere */
    A.part('head', ax(0, 0.22, 0.04), () => {
      faDsTube(A, 'coat', faDsSpline([ax(0, 0.18, 0.02), ax(0, 0.3, 0.06), [0, 0.535, 0.345]]), faDsRad([[0.07, 0.075], [0.066, 0.07], [0.058, 0.06]]), 6, 10, null,
        { caps: true, colf: (t, a) => under(a) ? C.under : C.head });
      A.ellip('coat', 0, 0.55, 0.37, 0.062, 0.062, 0.085, C.head, { seg: 12 });
      faDsCone(A, 'skin', [0, 0.548, 0.43], [0, 0.545, 0.455], 0.028, 0.024, C.cere, 8);
      faDsTube(A, 'horn', faDsSpline([[0, 0.545, 0.45], [0, 0.545, 0.49], [0, 0.528, 0.515], [0, 0.505, 0.517]]), faDsRad([[0.02, 0.024], [0.014, 0.018], [0.008, 0.01], [0.002, 0.002]]), 8, 8, C.bill, { caps: true });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.05, 0.565, 0.405, 0.012, 0.014, 0.014, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.058, 0.566, 0.41, 0.005, 0.007, 0.007, 0x050403, { seg: 6 });
        A.ellip('coat', s * 0.045, 0.585, 0.4, 0.022, 0.01, 0.03, C.top, { seg: 8, rz: -s * 0.3 });   /* the brow */
      }
    });
    /* the wings: broad and long, the hand slotted into five primaries; a slight arch as in the spindle (mid .04, tip 0) */
    for (const s of [1, -1]) {
      const pv = [s * 0.07, 0.455, 0.08];
      faDsWing(A, s, pv, { xs: t => -0.03 + 1.2 * t, zc: t => -0.09 - 0.05 * t, dy: t => 0.06 * Math.sin(Math.PI * t * 0.85) - 0.02 * t,
        hc: t => (0.2 - 0.04 * t) * (t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2 * 0.45), th: t => 0.034 * (1 - 0.7 * t), nt: 14,
        top: C.top, under: C.under, tip: C.tip, topf: t => t > 0.85 ? C.tip : C.top,
        fingers: [0.18, -0.02, -0.22, -0.42, -0.62].map((a, k) => ({ x: 1.08 + 0.02 * k, y: 0.0, z: -0.04 - 0.05 * k, a: a, len: 0.34 - 0.03 * k, w: 0.034, th: 0.006 })) });
    }
    /* the tail: a broad fan behind the body, a dark terminal band */
    A.part('tail', ax(0, -0.38, 0), () => {
      faDsTube(A, 'plain', faDsSpline([ax(0, -0.36, 0), ax(0, -0.55, -0.01), ax(0, -0.74, -0.02)]), faDsRad([[0.06, 0.016], [0.12, 0.013], [0.17, 0.01]]), 6, 8, null,
        { caps: true, colf: (t, a) => t > 0.82 ? C.tip : (Math.cos(a) < 0 ? C.under : C.body) });
    });
    /* the legs: feathered trousers, a bare yellow tarsus, taloned toes */
    for (const s of [1, -1]) {
      const x = s * 0.06;
      A.part(s > 0 ? 'leg0' : 'leg1', [x, 0.3, 0.0], () => {
        faDsTube(A, 'coat', faDsSpline([[x, 0.3, 0.0], [x + s * 0.008, 0.2, 0.045], [x, 0.125, 0.02]]), faDsRad([0.048, 0.042, 0.026]), 5, 8, null, { caps: true, colf: () => C.under });
        faDsTube(A, 'skin', faDsSpline([[x, 0.14, 0.02], [x, 0.07, 0.03], [x, 0.022, 0.04]]), faDsRad([0.017, 0.016, 0.015]), 4, 7, C.feet, { caps: true });
        faDsToes(A, [x, 0.014, 0.04], [[-0.028 * s, -0.002, 0.07], [0, -0.002, 0.085], [0.028 * s, -0.002, 0.065], [0, -0.002, -0.05]], 0.011, C.feet, C.claw);
      });
    }
  }
});

/* ---------------------------------------------------------------- the wadi swift */
/* the biome's swifts: flocks of small fast birds over the pond and the canyon's water, span 0.6-0.8 m (the same G.bird
   spindle, 0x3a3a3c). Here at 0.7 m: a short body, scythe wings swept back, a forked tail, a pale throat; perched on
   its tiny legs it holds its wings raised (fold -1.0: a swift barely settles), in 'fly' they beat fast */
const FA_DS_SWIFT = { top: 0x2a2a2c, body: 0x343436, under: 0x3c3c3e, throat: 0x8e8c84, bill: 0x1a1a1a, feet: 0x3a3430, claw: 0x121212 };
ANIMAL({
  key: 'wadi-swift', name: 'Wadi swift', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['tropic'], riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['sky', 'water', 'rock'], locomotion: ['flies', 'glides'] },
  size: { length: 0.31, height: 0.07, span: 0.7 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '35-46, 188-192, 214-216', note: 'G.bird scaled 0.6-0.8, flocks of 14-30 in a Lissajous swarm over the pond and the river; key swift' },
    { build: 'settlements/shade', file: FA_DS_SRC, lines: '26-37, 76-81', note: 'the vendored older copy: swifts over the basin\'s pool' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit with its fauna (over its water)' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 2, lifespan: 10, litter: 2.5, gestation: 20, note: 'nests in the canyon walls; gestation is the incubation' },
  w: 0.72, d: 0.47, h: 0.075,
  data: { mass: 0.18, legs: 2, wings: 1, speed: { walk: 0.1, run: 0.3, fly: 24 }, gait: { type: 'flyer', freq: 2, stride: 0.02 },
    flap: { freq: 5.5, amp: 0.6, glide: 0.25, fold: 0.12, sweep: 1.3, tuck: 0.9 }, grazePitch: 0.3, sizeRange: [0.86, 1.14],
    herd: 'flocks of 14 to 30 over the water', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_DS_SWIFT;
    faDsTube(A, 'coat', faDsSpline([[0, 0.034, -0.1], [0, 0.034, -0.05], [0, 0.034, 0.02], [0, 0.038, 0.07]]), faDsRad([[0.012, 0.012], [0.024, 0.023], [0.027, 0.026], [0.02, 0.02]]), 9, 10, null,
      { caps: true, colf: (t, a) => Math.cos(a) < -0.3 ? C.under : C.body });
    A.part('head', [0, 0.04, 0.07], () => {
      A.ellip('coat', 0, 0.042, 0.095, 0.022, 0.02, 0.028, C.body, { seg: 10, colf: (x, y, z) => y < -0.004 && z > 0.004 ? C.throat : C.body });
      faDsCone(A, 'horn', [0, 0.039, 0.12], [0, 0.036, 0.132], 0.006, 0.001, C.bill, 5);
      for (const s of [-1, 1]) A.ellip('eye', s * 0.016, 0.047, 0.108, 0.005, 0.006, 0.006, 0x060504, { seg: 6 });
    });
    /* scythe wings: the arm short, the hand long and swept back to a point */
    for (const s of [1, -1]) faDsWing(A, s, [s * 0.018, 0.048, 0.025], { xs: t => -0.01 + 0.33 * t, zc: t => -0.012 - 0.11 * t * t, dy: t => 0.01 * Math.sin(Math.PI * t),
      hc: t => 0.034 * Math.pow(1 - t, 0.8) + 0.004, th: t => 0.006 * (1 - 0.6 * t), nt: 12, top: C.top, under: C.under, tip: C.top });
    /* the forked tail */
    A.part('tail', [0, 0.034, -0.095], () => {
      faDsTube(A, 'plain', t => [0, 0.034, -0.09 - 0.04 * t], t => [0.016 + 0.006 * t, 0.004], 2, 6, C.top, { caps: true });
      for (const s of [-1, 1]) faDsTube(A, 'plain', t => [s * 0.03 * t, 0.034 - 0.004 * t, -0.12 - 0.055 * t], t => [0.011 * (1 - 0.7 * t), 0.003], 3, 6, C.top, { caps: true });
    });
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', [s * 0.012, 0.018, 0.0], () => {
      faDsTube(A, 'skin', t => [s * 0.012, 0.018 - 0.012 * t, 0.004 * t], t => [0.0035, 0.0035], 2, 5, C.feet, { caps: true });
      faDsToes(A, [s * 0.012, 0.004, 0.004], [[-0.006 * s, -0.001, 0.012], [0.006 * s, -0.001, 0.012], [0, -0.001, 0.014], [0.002 * s, -0.001, -0.01]], 0.0025, C.feet, C.claw);
    });
  }
});

/* ---------------------------------------------------------------- the sand strider */
/* the biome's striders: long-legged flightless walkers in bands of 4-9 on the canyon floor and at the pond, pacing
   the river's way and back; sand-coloured (a pick of four tones), 2.0-2.7 (G.striderBody: a plump spindle, a long
   neck and a small head, scaled .62 H, on two rods). Here at H 2.4 (the spindle's own proportions: body 1.5 m long,
   the crown at 2.95 m): the neck runs forward up to the head the spindle placed (its neck leaned back, a slip), a
   ratite's bill, two bird legs (the drumstick under the body, the ankle bending back, three toes), a drooping plume */
const FA_DS_STRIDER = [{ base: 0xa88858, mott: 0xb09060 }, { base: 0x8a6a40, mott: 0x987848 }];
ANIMAL({
  key: 'sand-strider', name: 'Sand strider', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'shallows'], locomotion: ['walks', 'runs', 'wades'] },
  size: { length: 2.9, height: 2.95 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '47-53, 194-198, 217-223', note: 'G.striderBody (scaled .62 H) on two rod legs (BIO.geo.rod), bands pacing the canyon floor and the pond; key strider' },
    { build: 'settlements/shade', file: FA_DS_SRC, lines: '38-44, 82-86', note: 'the vendored older copy: striders on the basin floor' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit with its fauna' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 45, note: 'mostly the thighs; lean and dark' },
    eggs: { amount: 14, note: 'a clutch laid in a scrape near the water; one egg feeds a family (about 1.4 kg)' },
    hide: { amount: 1, hideM2: 1.4, note: 'a pebbled leather: bags and sandals' },
    feathers: { amount: 0.4, note: 'the soft plumes, plucked at the moult: fans and stuffing' } },
  life: { maturity: 3, lifespan: 35, litter: 12, gestation: 42, note: 'eggs; gestation is the incubation (the cock sits by night)' },
  variants: 2, variantNames: ['sand', 'dun'],
  w: 0.9, d: 3.0, h: 3.0,
  data: { mass: 130, legs: 2, speed: { walk: 1.2, run: 14 }, gait: { type: 'biped', freq: 0.9, stride: 1.3 }, grazePitch: 1.38, sizeRange: [0.83, 1.13],
    herd: 'bands of 4 to 9, pacing the river', fleeDistance: 30, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const V = FA_DS_STRIDER[A.variant % 2];
    const coat = (x, y, z, k) => { const n = faNoise(x * 6 + 1.3, y * 6, z * 6); return faDsShade(n > 0.6 ? V.mott : V.base, k * (0.94 + 0.12 * n)); };
    /* the body: the spindle (half .41 x .45 x .74 about (0, 1.2, 0)), top .8, belly .98 (the spindle's shades) */
    const bc = faDsSpline([[0, 1.3, -0.84], [0, 1.24, -0.6], [0, 1.2, -0.2], [0, 1.2, 0.2], [0, 1.24, 0.55], [0, 1.33, 0.75]]);
    const br = faDsRad([[0.08, 0.1], [0.3, 0.33], [0.41, 0.45], [0.4, 0.44], [0.3, 0.34], [0.1, 0.12]]);
    faDsTube(A, 'coat', bc, br, 16, 14, null, { caps: true, colf: (t, a) => { const p = bc(t); return coat(Math.sin(a) * 0.4, p[1] + Math.cos(a) * 0.4, p[2], Math.cos(a) < -0.3 ? 0.98 : 0.8); } });
    /* the neck forward and up to the small head; the bill */
    A.part('head', [0, 1.25, 0.38], () => {   /* the pivot deep in the breast: the neck's root stays inside when it pecks */
      const nc = faDsSpline([[0, 1.24, 0.36], [0, 1.75, 0.8], [0, 2.25, 1.1], [0, 2.7, 1.36]]);
      faDsTube(A, 'coat', nc, faDsRad([[0.18, 0.2], [0.13, 0.14], [0.1, 0.105], [0.09, 0.095]]), 12, 10, null, { caps: true, colf: (t, a) => { const p = nc(t); return coat(0, p[1], p[2], 0.75); } });
      A.ellip('coat', 0, 2.82, 1.5, 0.13, 0.13, 0.2, null, { seg: 12, colf: (x, y, z) => coat(x, 2.82 + y, 1.5 + z, 0.75) });
      faDsTube(A, 'horn', t => [0, 2.8 - 0.07 * t * t, 1.6 + 0.3 * t], t => [0.075 - 0.062 * t, 0.055 - 0.045 * t], 6, 8, 0x5a4a38, { caps: true });
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.105, 2.86, 1.57, 0.022, 0.026, 0.026, 0x2a1a0a, { seg: 8 }); A.ellip('eye', s * 0.118, 2.862, 1.578, 0.009, 0.012, 0.012, 0x050403, { seg: 6 }); }
    });
    /* the plume: the tail's feathers drooping over the rump */
    A.part('tail', [0, 1.3, -0.8], () => {
      faDsTube(A, 'coat', faDsSpline([[0, 1.32, -0.76], [0, 1.28, -0.92], [0, 1.12, -1.02]]), faDsRad([[0.16, 0.08], [0.17, 0.06], [0.07, 0.03]]), 6, 10, null, { caps: true, colf: () => faDsShade(V.base, 0.62) });
    });
    /* the legs: the hip in the body, the knee at its belly, the drumstick down and back to the ankle, the bare tarsus
       forward to the foot */
    const bare = faDsShade(V.base, 0.6);
    for (const s of [1, -1]) {
      const x = s * 0.2;
      A.part(s > 0 ? 'leg0' : 'leg1', [x, 1.05, 0.02], () => {
        faDsTube(A, 'coat', faDsSpline([[x, 1.05, 0.02], [x * 1.05, 0.83, 0.14], [x, 0.53, -0.05]]), faDsRad([0.15, 0.11, 0.065]), 8, 10, null,
          { caps: true, colf: t => t < 0.62 ? coat(x, 0.9, 0.1, 0.8) : bare });
        A.ellip('skin', x, 0.53, -0.05, 0.068, 0.072, 0.07, bare, { seg: 8 });
        faDsTube(A, 'skin', faDsSpline([[x, 0.53, -0.05], [x, 0.3, 0.0], [x, 0.08, 0.06]]), faDsRad([0.058, 0.05, 0.046]), 6, 8, bare, { caps: true });
        A.ellip('skin', x, 0.06, 0.08, 0.055, 0.04, 0.06, bare, { seg: 8 });
        faDsToes(A, [x, 0.035, 0.08], [[-0.09 * s, -0.008, 0.2], [0, -0.008, 0.24], [0.08 * s, -0.008, 0.19]], 0.03, bare, 0x2a241c);
      });
    }
  }
});

/* ---------------------------------------------------------------- the rock lizard */
/* the biome's lizards: basking on the floor's boulders (SEDESERT.ROCKS), banded, still, 0.25-0.45 m (G.lizard: a flat
   body, a tapering tail, a wedge head, every third ring dark, four tones). Here at 0.4 m with the profile's widths and
   heights (a flat, chuckwalla-like lizard), a head, four sprawled legs with toes, a tail that sways */
const FA_DS_LIZ = [0x8a7a5a, 0x9a8a6a, 0x6a5a4a, 0xa0805a];
/* the profile along u from the snout (0) to the tail tip (1), unit length: half-width W, height H (G.lizard's) */
function faDsLizW(u) { return u < 0.35 ? 0.16 * Math.sin(u / 0.35 * Math.PI * 0.5 + 0.4) : u < 0.62 ? 0.16 : Math.max(0.006, 0.16 * (1 - (u - 0.62) / 0.38)); }
function faDsLizH(u) { return u < 0.62 ? 0.07 : 0.07 * (1 - (u - 0.62) / 0.38) + 0.005; }
ANIMAL({
  key: 'rock-lizard', name: 'Rock lizard', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['arid'], climate: ['tropic'], riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['rock', 'ground'], locomotion: ['walks', 'runs', 'climbs'] },
  size: { length: 0.4, height: 0.05 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '54-61, 178-181', note: 'G.lizard (unit length, scaled 0.25-0.45), put static on the boulders the floor left; key lizard' },
    { build: 'settlements/shade', file: FA_DS_SRC, lines: '45-52, 66-69', note: 'the vendored older copy: lizards on the basin\'s boulders' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit with its fauna' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 0.3, note: 'roasted whole in the coals, a herder\'s snack' } },
  life: { maturity: 2, lifespan: 15, litter: 8, gestation: 60, note: 'a clutch buried in sand under a boulder; gestation is the incubation' },
  variants: 4, variantNames: ['ochre', 'pale', 'dark', 'rust'],
  w: 0.27, d: 0.42, h: 0.05,
  data: { mass: 0.8, legs: 4, speed: { walk: 0.3, run: 3 }, gait: { type: 'sprawl', freq: 2.6, stride: 0.07 }, grazePitch: 0.15, sizeRange: [0.62, 1.13],
    herd: 'alone; one to a boulder', fleeDistance: 3, aggression: 0,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'REST', 'REST', 'HUNT', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = 0.4, base = FA_DS_LIZ[A.variant % 4], cl = 0.006;
    const zOf = u => (0.45 - u) * K, hh = u => faDsLizH(u) * K * 0.55, yOf = u => cl + hh(u);
    const span = (u0, u1) => [t => { const u = u0 + (u1 - u0) * t; return [0, yOf(u), zOf(u)]; }, t => { const u = u0 + (u1 - u0) * t; return [faDsLizW(u) * K, hh(u)]; }];
    /* the bands: every quarter of the length a dark ring (G.lizard: every third of twelve), the ridge lighter, the belly pale */
    const skin = (u, a) => { const c = Math.cos(a), f = (u * 4 + 0.04) % 1, band = f < 0.12 ? 0.55 : 1; return faDsShade(base, (c < -0.5 ? 1.18 : c > 0.7 ? 1.1 : 1) * (c < -0.5 ? 1 : band)); };
    { const [c, r] = span(0.2, 0.64); faDsTube(A, 'skin', c, r, 10, 12, null, { colf: (t, a) => skin(0.2 + 0.44 * t, a) }); }
    A.part('head', [0, yOf(0.22), zOf(0.22)], () => {
      const [c, r] = span(0, 0.24); faDsTube(A, 'skin', c, r, 7, 12, null, { caps: true, colf: (t, a) => skin(0.24 * t, a) });
      for (const s of [-1, 1]) A.ellip('eye', s * faDsLizW(0.12) * K * 0.78, yOf(0.12) + hh(0.12) * 0.6, zOf(0.12), 0.0045, 0.004, 0.005, 0x1a1208, { seg: 6 });
    });
    A.part('tail', [0, yOf(0.62), zOf(0.62)], () => {
      const [c, r] = span(0.6, 1); faDsTube(A, 'skin', c, r, 10, 10, null, { caps: true, colf: (t, a) => skin(0.6 + 0.4 * t, a) });
    });
    /* the legs: sprawled out from the flanks, the elbow high, the foot flat with four short toes */
    const LEGS = [[0.25, 1, 1, 0], [0.25, 1, -1, 1], [0.55, 0, 1, 2], [0.55, 0, -1, 3]];
    for (const [u, front, s, i] of LEGS) {
      const z = zOf(u), w = faDsLizW(u) * K, y = yOf(u), b = [s * w * 0.6, y, z];
      A.part('leg' + i, b, () => {
        const el = [s * (w + 0.06 * K), y + 0.012, z + (front ? 0.01 : -0.02) * K], ft = [s * (w + 0.12 * K), 0.006, z + (front ? 0.06 : -0.05) * K];
        faDsTube(A, 'skin', faDsSpline([b, el, ft]), faDsRad([[0.022 * K, 0.018 * K], 0.015 * K, 0.011 * K]), 6, 7, null, { caps: true, colf: (t, a) => skin(u, a) });
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.45 + (front ? 0.2 : -0.5) * s;
          faDsCone(A, 'skin', ft, [ft[0] + s * Math.abs(Math.sin(a)) * 0.05 * K + s * 0.01 * K, 0.003, ft[2] + Math.cos(a) * 0.05 * K * (front ? 1 : -1)], 0.006 * K, 0.0025 * K, faDsShade(base, 0.85), 5); }
      });
    }
  }
});

/* ---------------------------------------------------------------- the canyon mule deer */
/* the biome's deer: herds of 3-8 in the riparian strip and at the pond, browsing between points in the bosque and the
   scrub, 1 m at the shoulder; bucks carry forked antlers (G.deerBody, deerHead, deerAntler, deerLeg and the rig DEER:
   hips, the neck's root at (0, .95, .36); a doe at .86-.97, a buck 1.0-1.1). The colours are the biome's (DEER_C: tan,
   a pale belly, the white rump and the black-tipped tail, a grey-brown face, a pale muzzle, the big mule ears).
   The single tapered rod of each leg is now a jointed leg: the forearm, the knee, the cannon, the fetlock, the
   pastern and the cloven hoof in front; the gaskin, the hock behind the hip, the cannon below. The head browses at
   the biome's pitch (1.85 rad from the alert pose) */
const FA_DS_DEER = { tan: 0x8a6c4c, belly: 0xd2c2a2, rump: 0xe4dac6, face: 0x75604a, muz: 0xcfc4b0, dark: 0x18130f, antler: 0xd6cab0, low: 0x6e5840, ear: 0xc8b89a };
ANIMAL({
  key: 'mule-deer', name: 'Canyon mule deer', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['tropic'], riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'herbivore', feeding: 'browser', activity: 'crepuscular', temperament: 'skittish',
    habitat: ['ground', 'shallows'], locomotion: ['walks', 'runs', 'leaps', 'swims'] },
  size: { length: 1.55, height: 1.0 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '130-143, 154, 236-252, 270-285', note: 'herds of 3-8 walking their loops between browse points in the bosque (walkers: walkAt, rigPose); key deer' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit (with the deer) round the upper city' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 35, note: 'a doe dressed; a buck 48' },
    hide: { amount: 1, hideM2: 1.6, note: 'buckskin: soft, smoked: shirts, bags, the hunters\' leggings' },
    horn: { amount: 1.6, note: 'a buck\'s antlers, cast each winter and gathered: handles, flakers for stone' } },
  life: { maturity: 1.5, lifespan: 12, litter: 1.6, gestation: 200 },
  variants: 2, variantNames: ['buck', 'doe'],
  w: 0.6, d: 1.65, h: 2.0,
  variantDims: [{ w: 0.6, d: 1.65, h: 2.0 }, { w: 0.4, d: 1.45, h: 1.45 }],
  data: { mass: [90, 60], legs: 4, speed: { walk: 0.7, run: 15 }, gait: { type: 'quadruped', freq: 1.4, stride: 0.55 }, grazePitch: 1.85, sizeRange: [0.86, 1.1],
    herd: 'herds of 3 to 8 in the riparian strip and at the pond', fleeDistance: 30, aggression: 0.05,
    schedule: ['REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_DS_DEER, buck = A.variant === 0, K = buck ? 1.05 : 0.92, P = p => faDsScale(p, K), N = [0, 0.95, 0.36];
    const H = p => P([N[0] + p[0], N[1] + p[1], N[2] + p[2]]);
    /* the coat by place (DEER_C's rule: the white rump, the pale belly, tan), with a faint grain */
    const coat = (x, y, z) => { const n = 0.94 + 0.12 * faNoise(x * 9 + 2, y * 9, z * 9); return faDsShade(z < -0.36 && y > 0.66 ? C.rump : y < 0.69 ? C.belly : C.tan, n); };
    /* the body: the barrel and the chest of the two ellipsoids as one skin */
    const bc = faDsSpline([[0, 0.87, -0.53], [0, 0.86, -0.4], [0, 0.83, -0.15], [0, 0.84, 0.1], [0, 0.87, 0.3], [0, 0.91, 0.46], [0, 0.93, 0.52]]);
    const br = faDsRad([[0.07, 0.09], [0.165, 0.19], [0.19, 0.21], [0.185, 0.21], [0.16, 0.195], [0.12, 0.15], [0.05, 0.07]]);
    faDsTube(A, 'coat', t => P(bc(t)), t => { const r = br(t); return [r[0] * K, r[1] * K]; }, 16, 14, null,
      { caps: true, colf: (t, a) => { const p = bc(t), r = br(t); return coat(Math.sin(a) * r[0], p[1] + Math.cos(a) * r[1], p[2]); } });
    /* the tail: white, rope-thin, black-tipped */
    A.part('tail', P([0, 0.9, -0.47]), () => {
      faDsTube(A, 'coat', t => P([0, 0.9 - 0.11 * t, -0.47 - 0.13 * t]), t => [0.04 * K * (1 - 0.3 * t), 0.042 * K * (1 - 0.3 * t)], 4, 8, null, { caps: true, colf: t => t > 0.62 ? C.dark : C.rump });
    });
    /* the head on its neck, the neck's root its pivot */
    A.part('head', H([0, -0.12, -0.08]), () => {   /* the pivot low in the chest, so the neck's root stays inside it when the head goes down */
      const nc = faDsSpline([[0, -0.13, -0.12], [0, 0.17, 0.1], [0, 0.4, 0.27]]);
      faDsTube(A, 'coat', t => H(nc(t)), t => { const r = faDsRad([[0.085, 0.115], [0.072, 0.09], [0.058, 0.07]])(t); return [r[0] * K, r[1] * K]; }, 8, 12, null,
        { caps: true, colf: (t, a) => Math.cos(a) < -0.5 ? C.belly : C.tan });
      const hp = H([0, 0.44, 0.36]);
      A.ellip('coat', hp[0], hp[1], hp[2], 0.07 * K, 0.08 * K, 0.13 * K, null, { seg: 12, rx: 0.5, colf: (x, y, z) => y > 0.035 * K ? faDsShade(C.face, 0.82) : C.face });
      const mp = H([0, 0.385, 0.46]); A.ellip('coat', mp[0], mp[1], mp[2], 0.045 * K, 0.05 * K, 0.08 * K, C.muz, { seg: 10, rx: 0.5 });
      const np = H([0, 0.355, 0.525]); A.ellip('skin', np[0], np[1], np[2], 0.024 * K, 0.02 * K, 0.02 * K, C.dark, { seg: 8 });
      for (const s of [-1, 1]) { const e = H([s * 0.058, 0.47, 0.38]); A.ellip('eye', e[0], e[1], e[2], 0.013 * K, 0.014 * K, 0.016 * K, 0x0c0806, { seg: 8 }); }
      if (buck) {
        /* the antlers (G.deerAntler): a beam that forks, and forks again */
        for (const s of [1, -1]) {
          const b = [[s * 0.035, 0.52, 0.33], [s * 0.12, 0.66, 0.3], [s * 0.2, 0.74, 0.37], [s * 0.16, 0.79, 0.24], [s * 0.25, 0.86, 0.43], [s * 0.23, 0.88, 0.33], [s * 0.19, 0.92, 0.21], [s * 0.13, 0.9, 0.27]];
          A.ellip('horn', ...H(b[0]), 0.024 * K, 0.016 * K, 0.024 * K, faDsShade(C.antler, 0.7), { seg: 8 });
          for (const [i, j, r0, r1] of [[0, 1, 0.02, 0.016], [1, 2, 0.016, 0.012], [1, 3, 0.016, 0.012], [2, 4, 0.012, 0.005], [2, 5, 0.012, 0.005], [3, 6, 0.012, 0.005], [3, 7, 0.011, 0.005]])
            faDsCone(A, 'horn', H(b[i]), H(b[j]), r0 * K, r1 * K, C.antler, 6);
        }
      }
    });
    /* the big mule ears, out to the sides and up (G.deerHead's ear: .17 long, tilted .45) */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', H([s * 0.025, 0.495, 0.3]), () => {
      const c = H([s * 0.1, 0.53, 0.3]);
      A.ellip('coat', c[0], c[1], c[2], 0.085 * K, 0.045 * K, 0.014 * K, null, { seg: 10, rz: s * 0.45, colf: (x, y, z) => z > 0.004 * K ? C.ear : C.tan });
    });
    /* the legs: front from the shoulder (the elbow under the chest, the knee, the cannon), hind from the hip (the
       stifle at the flank, the hock out behind, the cannon nearly plumb); the cloven hoof */
    const LEGS = [[0.085, 0.33, 1, 0], [-0.085, 0.33, 1, 1], [0.085, -0.34, 0, 2], [-0.085, -0.34, 0, 3]];
    for (const [x, z, front, i] of LEGS) {
      const s = x > 0 ? 1 : -1;
      const J = front ? [[x, 0.8, z], [x * 1.05, 0.6, z - 0.05], [x, 0.35, z - 0.01], [x, 0.11, z + 0.005], [x, 0.045, z + 0.03]]
        : [[x, 0.82, z], [x * 1.12, 0.6, z + 0.12], [x, 0.44, z - 0.08], [x, 0.11, z - 0.03], [x, 0.045, z - 0.005]];
      const R = front ? [0.05, 0.042, 0.027, 0.019, 0.017] : [0.07, 0.052, 0.03, 0.019, 0.017];
      A.part('leg' + i, P(J[0]), () => {
        faDsTube(A, 'coat', t => P(faDsSpline(J)(t)), t => { const r = faDsRad(R)(t); return [r[0] * K, r[1] * K * 1.08]; }, 16, 9, null,
          { caps: true, colf: t => t < 0.44 ? coat(x, 0.72, z) : C.low });
        const k = J[2], f = J[3];
        A.ellip('coat', ...P(k), 0.03 * K, 0.034 * K, 0.032 * K, C.low, { seg: 8 });   /* the knee or the hock */
        A.ellip('coat', ...P(f), 0.022 * K, 0.024 * K, 0.026 * K, C.low, { seg: 8 });  /* the fetlock */
        for (const c of [-1, 1]) faDsCone(A, 'hoof', P([J[4][0] + c * 0.011, 0.05, J[4][2] - 0.005]), P([J[4][0] + c * 0.012, 0.008, J[4][2] + 0.025]), 0.012 * K, 0.015 * K, C.dark, 7);
      });
    }
  }
});

/* ---------------------------------------------------------------- the coyote */
/* the biome's coyotes: singly or in pairs (in file), trotting long loops through the scrub and the canyon floor, pausing
   to sniff or look round; 0.6 m at the shoulder (G.coyBody, coyHead, coyLeg and the rig COY: hips, the neck's root at
   (0, .56, .27); COY_C: grey, a darker back, a pale belly and muzzle, the black tail tip). The rod legs are now a
   dog's: the elbow, the wrist and the pastern in front; the stifle, the hock and the long rear pastern behind; paws.
   The bushy tail hangs low, the head is carried low (the sniff pitch 1.1) */
const FA_DS_COY = { grey: 0x8e7e68, back: 0x5c5042, belly: 0xcfc1a6, muz: 0xbcad92, dark: 0x1c1814, low: 0x9a8a72, eye: 0x8a6a20 };
ANIMAL({
  key: 'coyote', name: 'Coyote', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['arid', 'semiarid'], climate: ['tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'wary',
    habitat: ['ground', 'rock'], locomotion: ['walks', 'runs', 'leaps', 'swims'] },
  size: { length: 1.2, height: 0.6 },
  source: [{ build: 'biomes/sedesert', file: FA_DS_SRC, lines: '144-151, 155, 254-268, 286-288', note: 'singly or a pair in file, trotting loops of 140-1000 m through the scrub (walkers); key coyote' },
    { build: 'settlements/verge', file: 'src/88-verge-build.js', lines: '12-15', note: 'builds the sedesert kit (with the coyotes) round the upper city' }],
  traits: { edible: false, milkable: false, tameable: true, rideable: false, draught: false, eggs: false },
  yields: { hide: { amount: 1, hideM2: 0.55, note: 'a winter pelt: a hood or a collar' } },
  life: { maturity: 1, lifespan: 12, litter: 6, gestation: 63 },
  w: 0.3, d: 1.25, h: 0.9,
  data: { mass: 13, legs: 4, speed: { walk: 2.4, run: 17 }, gait: { type: 'quadruped', freq: 2.1, stride: 0.6 }, grazePitch: 1.1, sizeRange: [0.92, 1.06],
    herd: 'alone or a pair travelling in file', fleeDistance: 20, aggression: 0.25,
    schedule: ['HUNT', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'PATROL', 'PATROL', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'PATROL', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT'] },
  build: function (A) {
    const C = FA_DS_COY, N = [0, 0.56, 0.27], H = p => [N[0] + p[0], N[1] + p[1], N[2] + p[2]];
    /* the coat by height (COY_C's rule: the darker back, the pale belly, grey), grizzled */
    const coat = (x, y, z) => { const n = faNoise(x * 30 + 5, y * 30, z * 30); return faDsShade(y > 0.6 ? C.back : y < 0.43 ? C.belly : C.grey, 0.9 + 0.2 * n); };
    const bc = faDsSpline([[0, 0.53, -0.37], [0, 0.51, -0.28], [0, 0.5, -0.1], [0, 0.505, 0.1], [0, 0.52, 0.24], [0, 0.55, 0.34]]);
    const br = faDsRad([[0.05, 0.06], [0.105, 0.125], [0.12, 0.14], [0.115, 0.14], [0.11, 0.14], [0.06, 0.08]]);
    faDsTube(A, 'coat', bc, br, 14, 12, null, { caps: true, colf: (t, a) => { const p = bc(t), r = br(t); return coat(Math.sin(a) * r[0], p[1] + Math.cos(a) * r[1], p[2]); } });
    /* the bushy tail, hanging low, black-tipped */
    A.part('tail', [0, 0.54, -0.31], () => {
      const tc = faDsSpline([[0, 0.54, -0.31], [0, 0.45, -0.39], [0, 0.35, -0.46], [0, 0.27, -0.5]]);
      faDsTube(A, 'coat', tc, faDsRad([[0.035, 0.035], [0.055, 0.058], [0.066, 0.066], [0.032, 0.03]]), 9, 10, null, { caps: true, colf: (t, a) => t > 0.8 ? C.dark : (Math.cos(a) > 0.3 ? C.back : C.grey) });
    });
    /* the head on its neck: the skull, the long muzzle, the black nose, amber eyes */
    A.part('head', H([0, -0.06, -0.05]), () => {   /* the pivot in the chest: the neck's root stays inside when it sniffs */
      faDsTube(A, 'coat', faDsSpline([H([0, -0.1, -0.1]), H([0, 0.03, 0.04]), H([0, 0.12, 0.12])]), faDsRad([[0.075, 0.09], [0.068, 0.08], [0.056, 0.062]]), 6, 12, null,
        { caps: true, colf: (t, a) => Math.cos(a) < -0.4 ? C.belly : C.grey });
      const sk = H([0, 0.15, 0.16]); A.ellip('coat', sk[0], sk[1], sk[2], 0.07, 0.065, 0.09, null, { seg: 12, colf: (x, y, z) => y < -0.03 ? C.belly : C.grey });
      faDsTube(A, 'coat', t => H([0, 0.13 - 0.025 * t, 0.22 + 0.125 * t]), t => [0.042 - 0.024 * t, 0.04 - 0.022 * t], 5, 10, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.2 ? C.belly : C.muz });
      const np = H([0, 0.104, 0.348]); A.ellip('skin', np[0], np[1], np[2], 0.016, 0.014, 0.014, C.dark, { seg: 8 });
      for (const s of [-1, 1]) { const e = H([s * 0.044, 0.172, 0.215]); A.ellip('eye', e[0], e[1], e[2], 0.01, 0.009, 0.01, C.eye, { seg: 8 }); A.ellip('eye', e[0] + s * 0.004, e[1], e[2] + 0.004, 0.004, 0.006, 0.005, 0x050403, { seg: 6 }); }
    });
    /* the ears: tall cones leaning out (G.coyHead's: .085 high, .032 at the base, tilted .25) */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', H([s * 0.032, 0.205, 0.13]), () => {
      faDsCone(A, 'coat', H([s * 0.032, 0.2, 0.13]), H([s * 0.055, 0.29, 0.125]), 0.032, 0.003, C.back, 6);
    });
    /* the legs: digitigrade, standing on the toes */
    const LEGS = [[0.06, 0.22, 1, 0], [-0.06, 0.22, 1, 1], [0.06, -0.24, 0, 2], [-0.06, -0.24, 0, 3]];
    for (const [x, z, front, i] of LEGS) {
      const J = front ? [[x, 0.49, z], [x * 1.1, 0.36, z - 0.05], [x, 0.12, z - 0.005], [x, 0.04, z + 0.022]]
        : [[x, 0.5, z], [x * 1.15, 0.34, z + 0.08], [x, 0.2, z - 0.07], [x, 0.04, z - 0.035]];
      const R = front ? [0.042, 0.03, 0.018, 0.015] : [0.058, 0.036, 0.02, 0.015];
      A.part('leg' + i, J[0], () => {
        faDsTube(A, 'coat', faDsSpline(J), faDsRad(R), 12, 9, null, { caps: true, colf: t => t < 0.42 ? coat(x, 0.45, z) : C.low });
        A.ellip('coat', ...J[2], R[2] * 1.15, R[2] * 1.2, R[2] * 1.2, C.low, { seg: 8 });   /* the wrist or the hock */
        /* the muscle of the upper arm or the thigh, below the flank, swinging with the leg */
        if (front) A.ellip('coat', x * 1.25, 0.41, z - 0.015, 0.04, 0.075, 0.055, null, { seg: 10, rx: 0.25, colf: (px, py, pz) => coat(x, 0.41 + py, z + pz) });
        else A.ellip('coat', x * 1.3, 0.42, z + 0.01, 0.048, 0.09, 0.075, null, { seg: 10, rx: -0.35, colf: (px, py, pz) => coat(x, 0.42 + py, z + pz) });
        A.ellip('skin', J[3][0], 0.018, J[3][2] + 0.016, 0.022, 0.017, 0.035, faDsMix(C.low, C.dark, 0.6), { seg: 10 });   /* the paw */
      });
    }
  }
});
