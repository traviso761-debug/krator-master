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
/* a limb from straight segments with a knob at each inner joint (A.tube's section flips where a curve bends through the
   vertical, which pinched and gapped the bent hocks): J the joints, R[i] a radius or [lateral, fore-aft] at each joint,
   bulge[i] a muscle swell along segment i (a fraction of its start radius), colf(y) the colour by height */
function faDsLimb(A, fam, J, R, colf, o) {
  o = o || {}; const ns = o.ns || 9, bulge = o.bulge || [], knob = o.knob == null ? 1.04 : o.knob;
  const rr = i => Array.isArray(R[i]) ? R[i] : [R[i], R[i]];
  for (let i = 0; i < J.length - 1; i++) {
    const a = J[i], b = J[i + 1], r0 = rr(i), r1 = rr(i + 1), g = bulge[i] || 0;
    faDsTube(A, fam, t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
      t => { const k = 1 + g * Math.sin(Math.PI * Math.min(1, t * 1.25)); return [(r0[0] + (r1[0] - r0[0]) * t) * k, (r0[1] + (r1[1] - r0[1]) * t) * k]; },
      o.nt || 4, ns, null, { caps: true, round: [0.5, 0.5], colf: t => colf(a[1] + (b[1] - a[1]) * t) });
    if (i > 0 && knob) { const r = rr(i); A.ellip(fam, a[0], a[1], a[2], r[0] * knob, Math.max(r[0], r[1]) * knob, r[1] * knob, colf(a[1]), { seg: 8 }); }
  }
}
/* a wing on its own part, extending from the pivot along +x (left, s = 1) or -x (right): a flat lens along the span,
   [half-chord, half-thickness]; W: xs(t) the span, zc(t) the chord's middle, hc(t), dy(t), th(t) (metres
   from the pivot), top / under colours, fingers: [{x, z, a, len, w}] slotted primaries fanning from the tip */
function faDsWing(A, s, pv, W) {
  A.part(s > 0 ? 'wingL' : 'wingR', pv, () => {
    /* two double-sided feather sheets, the upper and the under surface, meeting at the leading and trailing edges and
       at the tip; a light camber (W.camber, a fraction of the half-chord) arches the chord, so the folded wing, its
       chord turned across the back, drapes a little over the flanks */
    const cam = W.camber || 0;
    for (const sd of [1, -1]) A.sheet('feather', (u, v) => {
      const c = 2 * v - 1, hc = W.hc(u), th = W.th(u) * Math.sqrt(Math.max(0, 1 - c * c)) * Math.min(1, (1 - u) * 10);
      return [pv[0] + s * W.xs(u), pv[1] + W.dy(u) + cam * hc * (1 - c * c) + sd * th, pv[2] + W.zc(u) - hc * c];
    }, W.nt || 12, W.nv || 8, null, { colf: (u) => sd > 0 ? (W.topf ? W.topf(u) : W.top) : W.under });
    for (const F of (W.fingers || [])) {
      const b = [pv[0] + s * F.x, pv[1] + F.y, pv[2] + F.z], d = [s * Math.cos(F.a), -0.04, Math.sin(F.a)];
      faDsTube(A, 'feather', t => [b[0] + d[0] * F.len * t, b[1] + d[1] * F.len * t * t, b[2] + d[2] * F.len * t], t => [F.w * (1 - 0.55 * t), F.th * (1 - 0.5 * t)], 3, 6, null,
        { caps: true, colf: (t, a) => Math.cos(a) >= 0 ? W.tip : W.under });
    }
  });
}
/* a bird's foot: three toes forward, one back, each with a dark claw */
function faDsToes(A, ft, toes, r, col, claw, fam) {
  for (const T of toes) {
    const e = [ft[0] + T[0], ft[1] + T[1], ft[2] + T[2]];
    faDsCone(A, fam || 'scale', ft, e, r, r * 0.6, col, 6);
    const L = Math.hypot(T[0], T[2]) || 1;
    faDsCone(A, 'horn', e, [e[0] + T[0] / L * r * 1.6, Math.max(0.001, e[1] - r * 0.9), e[2] + T[2] / L * r * 1.6], r * 0.55, r * 0.12, claw, 5);
  }
}

/* ---------------------------------------------------------------- the desert kite */
/* the biome's kites: big broad-winged raptors circling in the thermals over the mesas, the butte and the canyon, a few
   to a thermal, span 2.6-3.4 m (the G.bird spindle: dark above, pale beneath, 0x4a3a2c). Here at a 3 m span: the body
   and tail of the spindle's proportions (1.2 m nose to tail), a hooked bill, feathered legs and taloned feet; perched,
   its wings folded back over the back (flap.fold follows the body's slope, sweep turns them back, foldScale 0.52
   brings the tips to the tail), in 'fly' they beat slowly and glide */
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
    flap: { freq: 1.1, amp: 0.45, glide: 0.65, fold: 0.05, sweep: 1.5, foldScale: 0.52, roll: 0.75, tuck: 0.9 }, grazePitch: 0.5, sizeRange: [0.87, 1.13],
    herd: 'pairs; two to five birds share a thermal', fleeDistance: 40, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'IDLE', 'FLY', 'HUNT', 'FLY', 'FLY', 'FLY', 'HUNT', 'FLY', 'FLY', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_DS_KITE, yb = 0.36, P = 0.28, sp = Math.sin(P), cp = Math.cos(P);
    /* a point on the body's pitched axis: zp along it, up across it */
    const ax = (x, zp, up) => [x, yb + zp * sp + up * cp, zp * cp - up * sp];
    const under = (a) => Math.cos(a) < -0.25;
    /* the body: rump to chest along the pitched axis */
    const bz = [-0.42, -0.26, -0.05, 0.14, 0.3];
    faDsTube(A, 'feather', faDsSpline(bz.map(z => ax(0, z, 0))), faDsRad([[0.045, 0.05], [0.09, 0.1], [0.115, 0.13], [0.1, 0.12], [0.06, 0.07]]), 12, 12, null,
      { caps: true, colf: (t, a) => under(a) ? C.under : (Math.cos(a) > 0.6 ? C.top : C.body) });
    /* the head on its neck, held up; a hooked bill with a yellow cere */
    A.part('head', ax(0, 0.22, 0.04), () => {
      faDsTube(A, 'feather', faDsSpline([ax(0, 0.18, 0.02), ax(0, 0.3, 0.06), [0, 0.535, 0.345]]), faDsRad([[0.07, 0.075], [0.066, 0.07], [0.058, 0.06]]), 6, 10, null,
        { caps: true, colf: (t, a) => under(a) ? C.under : C.head });
      A.ellip('feather', 0, 0.55, 0.37, 0.062, 0.062, 0.085, C.head, { seg: 12 });
      faDsCone(A, 'skin', [0, 0.548, 0.43], [0, 0.545, 0.455], 0.028, 0.024, C.cere, 8);
      faDsTube(A, 'horn', faDsSpline([[0, 0.545, 0.45], [0, 0.545, 0.49], [0, 0.528, 0.515], [0, 0.505, 0.517]]), faDsRad([[0.02, 0.024], [0.014, 0.018], [0.008, 0.01], [0.002, 0.002]]), 8, 8, C.bill, { caps: true });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.05, 0.565, 0.405, 0.012, 0.014, 0.014, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.058, 0.566, 0.41, 0.005, 0.007, 0.007, 0x050403, { seg: 6 });
        A.ellip('feather', s * 0.045, 0.585, 0.4, 0.022, 0.01, 0.03, C.top, { seg: 8, rz: -s * 0.3 });   /* the brow */
      }
    });
    /* the wings: broad and long, the hand slotted into five primaries; a slight arch as in the spindle (mid .04, tip 0) */
    for (const s of [1, -1]) {
      const pv = [s * 0.07, 0.47, 0.08];   /* the shoulder high on the back, so the folded wing lies on it */
      faDsWing(A, s, pv, { xs: t => -0.03 + 1.2 * t, zc: t => -0.09 - 0.05 * t, dy: t => 0.03 + 0.03 * Math.sin(Math.PI * t * 0.85) - 0.02 * t, camber: 0.12,
        hc: t => (0.2 - 0.04 * t) * (t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2 * 0.45), th: t => 0.03 * (1 - 0.7 * t), nt: 14,
        top: C.top, under: C.under, tip: C.tip, topf: t => t > 0.85 ? C.tip : C.top,
        fingers: [0.14, -0.04, -0.2, -0.36, -0.52].map((a, k) => ({ x: 1.08 + 0.02 * k, y: 0.025, z: -0.04 - 0.05 * k, a: a, len: 0.34 - 0.03 * k, w: 0.034, th: 0.006 })) });
    }
    /* the tail: a broad fan behind the body, a dark terminal band */
    A.part('tail', ax(0, -0.38, 0), () => {
      faDsTube(A, 'feather', faDsSpline([ax(0, -0.36, 0), ax(0, -0.55, -0.01), ax(0, -0.74, -0.02)]), faDsRad([[0.06, 0.016], [0.12, 0.013], [0.17, 0.01]]), 6, 8, null,
        { caps: true, colf: (t, a) => t > 0.82 ? C.tip : (Math.cos(a) < 0 ? C.under : C.body) });
    });
    /* the legs: feathered trousers, a bare yellow tarsus, taloned toes */
    for (const s of [1, -1]) {
      const x = s * 0.06;
      A.part(s > 0 ? 'leg0' : 'leg1', [x, 0.3, 0.0], () => {
        /* straight segments: a curved tube flipped its section where it passed plumb (a dark pinched ring at the hock) */
        faDsLimb(A, 'feather', [[x, 0.3, 0.0], [x + s * 0.008, 0.19, 0.042], [x, 0.122, 0.024]], [0.05, 0.042, 0.03], () => C.under, { nt: 2, ns: 9 });
        faDsLimb(A, 'scale', [[x, 0.15, 0.022], [x, 0.022, 0.04]], [0.017, 0.015], () => C.feet, { nt: 2, ns: 7 });
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
  w: 0.72, d: 0.47, h: 0.1,
  data: { mass: 0.18, legs: 2, wings: 1, speed: { walk: 0.1, run: 0.3, fly: 24 }, gait: { type: 'flyer', freq: 2, stride: 0.02 },
    flap: { freq: 5.5, amp: 0.6, glide: 0.25, fold: 0.05, sweep: 1.25, foldScale: 0.66, roll: 0.75, tuck: 0.9 }, grazePitch: 0.3, sizeRange: [0.86, 1.14],
    herd: 'flocks of 14 to 30 over the water', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_DS_SWIFT;
    faDsTube(A, 'feather', faDsSpline([[0, 0.034, -0.1], [0, 0.034, -0.05], [0, 0.034, 0.02], [0, 0.038, 0.07]]), faDsRad([[0.012, 0.012], [0.024, 0.023], [0.027, 0.026], [0.02, 0.02]]), 9, 10, null,
      { caps: true, colf: (t, a) => Math.cos(a) < -0.3 ? C.under : C.body });
    A.part('head', [0, 0.04, 0.07], () => {
      A.ellip('feather', 0, 0.042, 0.095, 0.022, 0.02, 0.028, C.body, { seg: 10, colf: (x, y, z) => y < -0.004 && z > 0.004 ? C.throat : C.body });
      faDsCone(A, 'horn', [0, 0.039, 0.12], [0, 0.036, 0.132], 0.006, 0.001, C.bill, 5);
      for (const s of [-1, 1]) A.ellip('eye', s * 0.016, 0.047, 0.108, 0.005, 0.006, 0.006, 0x060504, { seg: 6 });
    });
    /* scythe wings: the arm short, the hand long and swept back to a point */
    for (const s of [1, -1]) faDsWing(A, s, [s * 0.018, 0.052, 0.025], { xs: t => -0.01 + 0.33 * t, zc: t => -0.012 - 0.11 * t * t, dy: t => 0.01 + 0.006 * Math.sin(Math.PI * t), camber: 0.15,
      hc: t => 0.034 * Math.pow(1 - t, 0.8) + 0.004, th: t => 0.006 * (1 - 0.6 * t), nt: 12, top: C.top, under: C.under, tip: C.top });
    /* the forked tail */
    A.part('tail', [0, 0.034, -0.095], () => {
      faDsTube(A, 'feather', t => [0, 0.034, -0.09 - 0.04 * t], t => [0.016 + 0.006 * t, 0.004], 2, 6, C.top, { caps: true });
      for (const s of [-1, 1]) faDsTube(A, 'feather', t => [s * 0.03 * t, 0.034 - 0.004 * t, -0.12 - 0.055 * t], t => [0.011 * (1 - 0.7 * t), 0.003], 3, 6, C.top, { caps: true });
    });
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', [s * 0.012, 0.018, 0.0], () => {
      faDsTube(A, 'scale', t => [s * 0.012, 0.018 - 0.012 * t, 0.004 * t], t => [0.0035, 0.0035], 2, 5, C.feet, { caps: true });
      faDsToes(A, [s * 0.012, 0.004, 0.004], [[-0.006 * s, -0.001, 0.012], [0.006 * s, -0.001, 0.012], [0, -0.001, 0.014], [0.002 * s, -0.001, -0.01]], 0.0025, C.feet, C.claw);
    });
  }
});

/* ---------------------------------------------------------------- the sand strider */
/* the biome's striders: long-legged flightless walkers in bands of 4-9 on the canyon floor and at the pond, pacing
   the river's way and back; sand-coloured (a pick of four tones), 2.0-2.7 (G.striderBody: a plump spindle, a long
   neck and a small head, scaled .62 H, on two rods). Here at H 2.4 (the spindle's own proportions: body 1.5 m long,
   the crown at 2.95 m), drawn as the ratite it is: an ostrich's egg of a body carried high, plumage hanging over the
   thighs, small plumed wings, the neck rising from the breast with a slight S to a small head with a broad bill, two
   long bird legs (the bare drumstick, the ankle bending back, the scaled tarsus, three toes), a drooping tail plume */
const FA_DS_STRIDER = [{ base: 0xa88858, mott: 0xb09060 }, { base: 0x8a6a40, mott: 0x987848 }];
ANIMAL({
  key: 'sand-strider', name: 'Sand strider', group: 'desert',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['tropic'], riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'shallows'], locomotion: ['walks', 'runs', 'wades'] },
  size: { length: 2.7, height: 2.95 },
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
  data: { mass: 130, legs: 2, speed: { walk: 1.2, run: 14 }, gait: { type: 'biped', freq: 0.9, stride: 1.3 }, grazePitch: 1.58, sizeRange: [0.83, 1.13],
    herd: 'bands of 4 to 9, pacing the river', fleeDistance: 30, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const V = FA_DS_STRIDER[A.variant % 2];
    const coat = (x, y, z, k) => { const n = faNoise(x * 6 + 1.3, y * 6, z * 6); return faDsShade(n > 0.6 ? V.mott : V.base, k * (0.94 + 0.12 * n)); };
    /* the body: an ostrich's egg, deepest under the wings, the back level, narrowing to the rump; the plumage darker
       above, paler below (the spindle's shades) */
    const BZ = [[-0.86, 1.56, 0.05, 0.06], [-0.72, 1.53, 0.2, 0.22], [-0.42, 1.5, 0.3, 0.32], [-0.05, 1.48, 0.33, 0.36], [0.3, 1.52, 0.31, 0.34], [0.55, 1.6, 0.22, 0.24], [0.7, 1.68, 0.07, 0.08]];
    const bc = faDsSpline(BZ.map(b => [0, b[1], b[0]])), br = faDsRad(BZ.map(b => [b[2], b[3]]));
    faDsTube(A, 'feather', bc, br, 16, 16, null, { caps: true, colf: (t, a) => { const p = bc(t); return coat(Math.sin(a) * 0.4, p[1] + Math.cos(a) * 0.4, p[2], Math.cos(a) < -0.3 ? 0.98 : 0.8); } });
    /* the plumage hanging over the thighs, and the small wings at the flanks with their pale plumes */
    const skirt = [];
    for (let i = 0; i < 40; i++) {
      const z = A.rr(-0.6, 0.45), s = A.rnd() < 0.5 ? -1 : 1, t = (z + 0.86) / 1.56, r = br(t), p = bc(t), a = A.rr(1.9, 2.5);
      const at = [s * Math.sin(a) * r[0] * 0.98, p[1] + Math.cos(a) * r[1] * 0.98, z];
      skirt.push({ at: at, dir: [s * 0.25, -1, A.rr(-0.25, 0.1)], side: [0, 0, 1], len: A.rr(0.16, 0.3), w: A.rr(0.1, 0.14), col: coat(at[0], at[1], at[2], 0.78), curl: 0.25 });
    }
    for (const s of [-1, 1]) {
      A.ellip('feather', s * 0.27, 1.56, -0.08, 0.075, 0.13, 0.34, null, { seg: 12, rx: -0.18, rz: s * 0.12, colf: (x, y, z) => coat(s * 0.3 + x, 1.56 + y, z, 0.66) });
      for (let k = 0; k < 7; k++) { const z = 0.1 - k * 0.075; skirt.push({ at: [s * 0.33, 1.47 + 0.02 * k, z], dir: [s * 0.2, -0.9, -0.5], side: [0, 0, 1], len: A.rr(0.26, 0.36), w: 0.13, col: faDsShade(V.mott, k % 2 ? 1.12 : 0.98), curl: 0.4 }); }
    }
    A.locks('feather', skirt);
    /* the neck rising from the breast, leaning a little forward with a slight S, thick and feathered at its root, then
       thin; a small flat head, big eyes, a broad ratite's bill. The pivot low in the breast: the neck's root stays in the
       body when it pecks */
    A.part('head', [0, 1.25, 0.4], () => {
      const nc = faDsSpline([[0, 1.3, 0.15], [0, 1.8, 0.6], [0, 2.2, 0.82], [0, 2.55, 0.99], [0, 2.76, 1.09]]);   /* never steeper than 23 degrees from plumb: A.tube's section flips there */
      faDsTube(A, 'feather', nc, faDsRad([[0.2, 0.22], [0.15, 0.16], [0.085, 0.09], [0.068, 0.07], [0.066, 0.068]]), 14, 10, null,
        { caps: true, colf: (t, a) => { const p = nc(t); return t < 0.3 ? coat(0, p[1], p[2], 0.78) : faDsShade(V.base, 0.95 - 0.1 * Math.max(0, Math.cos(a))); } });
      const ruff = [];
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, p = nc(0.32), r = 0.13; ruff.push({ at: [Math.sin(a) * r, p[1] + Math.cos(a) * r * 0.6, p[2] - Math.cos(a) * 0.04], dir: [Math.sin(a) * 0.6, -1, -Math.cos(a) * 0.5], len: 0.12, w: 0.07, col: coat(0, p[1], p[2], 0.8), curl: 0.2 }); }
      A.locks('feather', ruff);
      A.ellip('feather', 0, 2.85, 1.15, 0.09, 0.095, 0.13, null, { seg: 12, colf: (x, y, z) => faDsShade(V.base, y > 0.04 ? 0.8 : 0.95) });
      faDsTube(A, 'horn', t => [0, 2.835 - 0.04 * t * t, 1.23 + 0.26 * t], t => [0.06 - 0.022 * t, 0.032 - 0.014 * t], 6, 10, 0x5a4a38, { caps: true, round: [0.3, 0.7] });
      A.ellip('horn', 0, 2.81, 1.33, 0.05, 0.012, 0.11, 0x4a3c2e, { seg: 8 });   /* the gape line */
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.074, 2.875, 1.19, 0.026, 0.03, 0.032, 0x2a1a0a, { seg: 10 }); A.ellip('eye', s * 0.088, 2.877, 1.198, 0.011, 0.014, 0.014, 0x050403, { seg: 6 }); }
    });
    /* the tail plume: a drooping fan of soft plumes over the rump */
    A.part('tail', [0, 1.56, -0.8], () => {
      const pl = [];
      for (let k = 0; k < 30; k++) { const a = A.rr(-1, 1), at = [a * 0.12, 1.56 + A.rr(-0.06, 0.12), -0.8 + A.rr(-0.04, 0.06)];
        pl.push({ at: at, dir: [a * 0.6, A.rr(-0.7, 0.4), -1], side: k % 2 ? [1, 0, 0] : [0, 0, 1], len: A.rr(0.3, 0.48), w: A.rr(0.11, 0.16), col: k % 3 ? faDsShade(V.base, 0.62) : faDsShade(V.mott, 1.2), curl: 0.55 }); }
      A.locks('feather', pl);
    });
    /* the legs: the thigh in the plumage, the bare drumstick down and back to the ankle, the long scaled tarsus forward
       to the foot, three toes */
    const bare = faDsShade(V.base, 0.6), scl = faDsShade(V.base, 0.5);
    for (const s of [1, -1]) {
      const x = s * 0.19;
      A.part(s > 0 ? 'leg0' : 'leg1', [x, 1.38, 0.0], () => {
        faDsLimb(A, 'feather', [[x, 1.4, 0.0], [x * 1.08, 1.12, 0.1]], [[0.15, 0.17], [0.12, 0.13]], y => coat(x, y, 0.05, 0.78), { nt: 2, ns: 10 });
        faDsLimb(A, 'scale', [[x * 1.08, 1.12, 0.1], [x, 0.62, -0.12], [x, 0.07, 0.05]], [[0.1, 0.12], [0.06, 0.066], [0.045, 0.05]], () => bare, { bulge: [0.2, 0], nt: 2, ns: 10 });
        A.ellip('scale', x, 0.055, 0.08, 0.06, 0.045, 0.075, scl, { seg: 8 });
        faDsToes(A, [x, 0.035, 0.08], [[-0.09 * s, -0.008, 0.2], [0, -0.008, 0.25], [0.08 * s, -0.008, 0.19]], 0.032, scl, 0x2a241c, 'scale');
      });
    }
  }
});

/* ---------------------------------------------------------------- the rock lizard */
/* the biome's lizards: basking on the floor's boulders (SEDESERT.ROCKS), banded, still, 0.25-0.45 m (G.lizard: a flat
   body, a tapering tail, a wedge head, every third ring dark, four tones). Here at 0.4 m with the profile's widths and
   heights (a flat, chuckwalla-like lizard), a head, four sprawled legs with toes, a tail that sways */
const FA_DS_LIZ = [0x8a7a5a, 0x9a8a6a, 0x6a5a4a, 0xa0805a];
/* the profile along u from the snout (0) to the tail tip (1), unit length (G.lizard's flat chuckwalla body, refined): a
   wedge head with jowls, a neck, the wide flat body, the hips, a thick tail base tapering to a point. Knots [u, half-width,
   half-height], eased between */
const FA_DS_LIZP = [[0, 0.018, 0.016], [0.03, 0.04, 0.03], [0.07, 0.068, 0.045], [0.105, 0.078, 0.05], [0.14, 0.064, 0.045], [0.18, 0.1, 0.055],
  [0.28, 0.15, 0.064], [0.38, 0.15, 0.062], [0.45, 0.11, 0.055], [0.5, 0.075, 0.048], [0.62, 0.05, 0.036], [0.8, 0.026, 0.02], [1, 0.004, 0.004]];
function faDsLizK(u, k) {
  const P = FA_DS_LIZP; let i = 0; while (i < P.length - 2 && u > P[i + 1][0]) i++;
  const a = P[i], b = P[i + 1], f = Math.max(0, Math.min(1, (u - a[0]) / (b[0] - a[0]))), e = f * f * (3 - 2 * f);
  return a[k] + (b[k] - a[k]) * e;
}
function faDsLizW(u) { return faDsLizK(u, 1); }
function faDsLizH(u) { return faDsLizK(u, 2); }
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
  w: 0.2, d: 0.42, h: 0.05,
  data: { mass: 0.8, legs: 4, speed: { walk: 0.3, run: 3 }, gait: { type: 'sprawl', freq: 2.6, stride: 0.07 }, grazePitch: 0.12, sizeRange: [0.62, 1.13],
    herd: 'alone; one to a boulder', fleeDistance: 3, aggression: 0,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'REST', 'REST', 'HUNT', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = 0.4, base = FA_DS_LIZ[A.variant % 4];
    /* the chest propped up on the forelegs, the head raised (a basking lizard), the belly and tail on the rock */
    const cl = u => 0.006 + 0.012 * Math.max(0, (0.34 - u) / 0.34);
    const zOf = u => (0.45 - u) * K, hh = u => faDsLizH(u) * K * 0.8, yOf = u => cl(u) + hh(u);
    const span = (u0, u1) => [t => { const u = u0 + (u1 - u0) * t; return [0, yOf(u), zOf(u)]; }, t => { const u = u0 + (u1 - u0) * t; return [faDsLizW(u) * K, hh(u)]; }];
    /* the bands: every quarter of the length a dark band over the back and flanks (G.lizard: every third of twelve), a
       mottle between, the ridge lighter, the belly pale */
    const skin = (u, a) => { const c = Math.cos(a), f = (u * 4 + 0.04) % 1, band = c > -0.4 && f < 0.12 ? 0.55 : 1, m = 0.9 + 0.2 * faNoise(u * 60 + A.variant, Math.sin(a) * 3, c * 3);
      return faDsShade(base, (c < -0.5 ? 1.2 : c > 0.75 ? 1.1 : 1) * band * m); };
    { const [c, r] = span(0.12, 0.52); faDsTube(A, 'scale', c, r, 14, 14, null, { colf: (t, a) => skin(0.12 + 0.4 * t, a) }); }
    A.part('head', [0, yOf(0.15), zOf(0.15)], () => {
      const [c, r] = span(0, 0.17); faDsTube(A, 'scale', c, r, 9, 12, null, { caps: true, round: [0.5, 0.3], colf: (t, a) => skin(0.17 * t, a) });
      for (const s of [-1, 1]) {
        const u = 0.062, e = [s * faDsLizW(u) * K * 0.86, yOf(u) + hh(u) * 0.42, zOf(u)];
        A.ellip('scale', e[0], e[1], e[2], 0.0052, 0.0046, 0.0062, faDsShade(base, 0.6), { seg: 8 });   /* the lid */
        A.ellip('eye', e[0] + s * 0.0016, e[1], e[2] + 0.0004, 0.004, 0.0034, 0.0045, 0x1a1208, { seg: 6 });
      }
    });
    A.part('tail', [0, yOf(0.5), zOf(0.5)], () => {
      const [c, r] = span(0.48, 1); faDsTube(A, 'scale', c, r, 14, 10, null, { caps: true, colf: (t, a) => skin(0.48 + 0.52 * t, a) });
    });
    /* the legs: sprawled from the flanks, the upper limb out and the elbow (knee) high, the forearm down to a flat foot;
       five long splayed toes (the hind foot's fourth the longest) */
    const LEGS = [[0.22, 1, 1, 0], [0.22, 1, -1, 1], [0.44, 0, 1, 2], [0.44, 0, -1, 3]];
    for (const [u, front, s, i] of LEGS) {
      const z = zOf(u), w = faDsLizW(u) * K, y = yOf(u), b = [s * w * 0.55, y, z];
      A.part('leg' + i, b, () => {
        const el = [s * (w + 0.05 * K), y + 0.012, z + (front ? -0.01 : 0.015) * K], ft = [s * (w + 0.085 * K), 0.007, z + (front ? 0.03 : -0.04) * K];
        faDsLimb(A, 'scale', [b, el, ft], [[0.024 * K, 0.02 * K], [0.015 * K, 0.014 * K], [0.011 * K, 0.009 * K]], () => faDsShade(base, 0.95), { nt: 2, ns: 8 });
        A.ellip('scale', ft[0], 0.006, ft[2], 0.012 * K, 0.004, 0.014 * K, faDsShade(base, 0.85), { seg: 8 });
        const toe = faDsShade(base, 0.8);
        for (let k = 0; k < 5; k++) {
          const a = (front ? 0.15 : -0.35) * s + (k - 2) * 0.42 * s, L = (front ? [0.028, 0.04, 0.05, 0.048, 0.03] : [0.026, 0.04, 0.055, 0.07, 0.035])[k] * K;
          const dir = [Math.sin(a) * (front ? 1 : 1), Math.cos(a) * (front ? 1 : -1)];
          faDsCone(A, 'scale', [ft[0], 0.005, ft[2]], [ft[0] + dir[0] * L, 0.003, ft[2] + dir[1] * L], 0.0055 * K, 0.0022 * K, toe, 5);
        }
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
   pastern and the cloven hoof in front; the gaskin, the hock behind the hip, the cannon below. The neck is short and
   thick, carried forward at about 45 degrees, the head a little above the back plus a head length (the biome's
   pitched it 1.85 rad to browse from a giraffe's neck); grazing it pitches 1.42 about a pivot low in the chest so the
   muzzle reaches the ground (the face then tucked past plumb: one rigid neck bone) */
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
  w: 0.6, d: 1.7, h: 1.95,
  variantDims: [{ w: 0.6, d: 1.7, h: 1.95 }, { w: 0.47, d: 1.5, h: 1.45 }],
  data: { mass: [90, 60], legs: 4, speed: { walk: 0.7, run: 15 }, gait: { type: 'quadruped', freq: 1.4, stride: 0.55 }, grazePitch: 1.42, sizeRange: [0.86, 1.1],
    herd: 'herds of 3 to 8 in the riparian strip and at the pond', fleeDistance: 30, aggression: 0.05,
    schedule: ['REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_DS_DEER, buck = A.variant === 0, K = buck ? 1.05 : 0.92, P = p => faDsScale(p, K);
    const sk = (c, n) => [c[0] * n, c[1] * n, c[2] * n];
    /* the coat by place: tan with a faint grain; the belly pale; the white rump patch round the tail (seen from behind) */
    const coat = (x, y, z) => {
      const n = 0.94 + 0.12 * faNoise(x * 9 + 2, y * 9, z * 9);
      if (z < -0.47 && y > 0.7 && y < 1.02 && Math.abs(x) < 0.11 + 0.6 * (-0.47 - z)) return faDsShade(C.rump, n);
      return sk(faDsMix(C.tan, C.belly, Math.min(1, Math.max(0, (0.7 - y) / 0.05))), n);
    };
    /* the body: the haunch, the barrel, the deep chest (the brisket the lowest point), the withers a little above the croup */
    const BZ = [[-0.57, 0.88, 0.05, 0.07], [-0.5, 0.87, 0.14, 0.16], [-0.34, 0.86, 0.175, 0.19], [-0.12, 0.845, 0.18, 0.2],
      [0.1, 0.84, 0.19, 0.225], [0.3, 0.855, 0.17, 0.235], [0.45, 0.88, 0.13, 0.19], [0.54, 0.91, 0.05, 0.08]];
    const bc = faDsSpline(BZ.map(b => [0, b[1], b[0]])), br = faDsRad(BZ.map(b => [b[2], b[3]]));
    faDsTube(A, 'sleek', t => P(bc(t)), t => { const r = br(t); return [r[0] * K, r[1] * K]; }, 16, 14, null,
      { caps: true, colf: (t, a) => { const p = bc(t), r = br(t); return coat(Math.sin(a) * r[0], p[1] + Math.cos(a) * r[1], p[2]); } });
    /* the tail: a white rope, black-tipped, hanging over the rump patch */
    A.part('tail', P([0, 0.95, -0.55]), () => {
      faDsTube(A, 'sleek', t => P([0, 0.95 - 0.16 * t, -0.55 - 0.05 * t + 0.02 * t * t]), t => [0.027 * K * (1 - 0.3 * t), 0.022 * K * (1 - 0.25 * t)], 5, 8, null,
        { caps: true, colf: t => t > 0.7 ? C.dark : C.rump });
    });
    /* the head and the short thick neck, carried forward and up at about 45 degrees; the pivot low in the chest so
       the neck swings out of the brisket and the muzzle reaches the ground to graze */
    A.part('head', P([0, 0.62, 0.34]), () => {
      const nc = faDsSpline([[0, 0.8, 0.26], [0, 0.97, 0.42], [0, 1.12, 0.56], [0, 1.27, 0.68]]), nr = faDsRad([[0.1, 0.17], [0.095, 0.15], [0.075, 0.11], [0.06, 0.085]]);
      faDsTube(A, 'sleek', t => P(nc(t)), t => { const r = nr(t); return [r[0] * K, r[1] * K]; }, 8, 12, null,
        { caps: true, colf: (t, a) => { const p = nc(t), c = Math.cos(a); return t > 0.72 && c < -0.35 ? C.rump : c < -0.6 ? faDsMix(C.tan, C.belly, 0.3) : coat(Math.sin(a) * 0.1, p[1] + c * 0.12, p[2]); } });   /* the white throat patch */
      /* the skull to the muzzle: a grey-brown face, a darker brow, the pale muzzle with a dark chin band, the black nose */
      const hc = faDsSpline([[0, 1.335, 0.655], [0, 1.322, 0.74], [0, 1.262, 0.84], [0, 1.195, 0.925], [0, 1.168, 0.958]]);
      faDsTube(A, 'sleek', t => P(hc(t)), t => { const r = faDsRad([[0.055, 0.06], [0.07, 0.074], [0.05, 0.06], [0.036, 0.043], [0.026, 0.03]])(t); return [r[0] * K, r[1] * K]; }, 10, 12, null,
        { caps: true, round: [0.8, 0.5], colf: (t, a) => { const c = Math.cos(a);
          if (t > 0.6) return c < -0.2 && t < 0.8 ? faDsShade(C.face, 0.55) : C.muz;
          return c > 0.55 && t > 0.2 ? faDsShade(C.face, buck ? 0.62 : 0.8) : (c < -0.55 ? faDsMix(C.face, C.muz, 0.6) : C.face); } });
      const jp = P([0, 1.235, 0.79]); A.ellip('sleek', jp[0], jp[1], jp[2], 0.048 * K, 0.034 * K, 0.1 * K, faDsMix(C.face, C.belly, 0.4), { seg: 10, rx: 0.62 });
      const np = P([0, 1.17, 0.962]); A.ellip('skin', np[0], np[1], np[2], 0.024 * K, 0.019 * K, 0.014 * K, C.dark, { seg: 8, rx: 0.6 });
      for (const s of [-1, 1]) {
        const e = P([s * 0.064, 1.338, 0.772]);
        A.ellip('sleek', e[0], e[1], e[2], 0.012 * K, 0.019 * K, 0.022 * K, faDsMix(C.face, C.muz, 0.5), { seg: 8, rx: 0.5 });   /* the pale eye ring */
        A.ellip('eye', e[0] + s * 0.004 * K, e[1], e[2] + 0.002 * K, 0.011 * K, 0.014 * K, 0.017 * K, 0x0c0806, { seg: 8, rx: 0.5 });
      }
      if (buck) {
        /* the antlers (G.deerAntler): a beam that forks, and each fork forks again (a mule deer's bifurcate rack) */
        for (const s of [1, -1]) {
          const b = [[s * 0.035, 0.52, 0.33], [s * 0.12, 0.66, 0.3], [s * 0.2, 0.74, 0.37], [s * 0.16, 0.79, 0.24], [s * 0.25, 0.86, 0.43], [s * 0.23, 0.88, 0.33], [s * 0.19, 0.92, 0.21], [s * 0.13, 0.9, 0.27]]
            .map(q => P([q[0] + s * 0.008, q[1] + 0.95 - 0.09, q[2] + 0.36 + 0.03]));
          A.ellip('horn', ...b[0], 0.024 * K, 0.016 * K, 0.024 * K, faDsShade(C.antler, 0.62), { seg: 8 });
          for (const [i, j, r0, r1] of [[0, 1, 0.02, 0.016], [1, 2, 0.016, 0.012], [1, 3, 0.016, 0.012], [2, 4, 0.012, 0.005], [2, 5, 0.012, 0.005], [3, 6, 0.012, 0.005], [3, 7, 0.011, 0.005]])
            faDsCone(A, 'horn', b[i], b[j], r0 * K, r1 * K, i === 0 ? faDsShade(C.antler, 0.8) : C.antler, 6);
        }
      }
    });
    /* the big mule ears, held out to the sides and a little up, broad and cupped forward: pale inside, dark-rimmed */
    for (const s of [1, -1]) {
      const b = [s * 0.045, 1.372, 0.69], d = [s * 0.8, 0.5, -0.3], L = Math.hypot(d[0], d[1], d[2]), len = 0.24;
      A.part(s > 0 ? 'earL' : 'earR', P(b), () => {
        faDsTube(A, 'sleek', t => P([b[0] + d[0] / L * len * t, b[1] + d[1] / L * len * t - 0.02 * t * t, b[2] + d[2] / L * len * t]),
          t => [0.011 * K * (1 - 0.5 * t), K * (0.066 * Math.pow(Math.sin(Math.PI * (0.12 + 0.86 * t)), 0.75) + 0.004)], 8, 10, null,
          { caps: true, round: [0.3, 0.3], colf: (t, a) => t > 0.86 ? faDsShade(C.face, 0.5) : (s * Math.sin(a) < 0 ? C.ear : faDsShade(C.face, 0.95)) });
      });
    }
    /* the legs from straight segments: in front the shoulder, the elbow under the chest, the knee, the long cannon, the
       fetlock; behind the thigh, the stifle forward at the flank, the gaskin back to the hock, the cannon; cloven hooves */
    const LEGS = [[0.085, 0.34, 1, 0], [-0.085, 0.34, 1, 1], [0.1, -0.33, 0, 2], [-0.1, -0.33, 0, 3]];
    for (const [x, z, front, i] of LEGS) {
      const s = x > 0 ? 1 : -1;
      const J = front ? [[x, 0.86, z], [x * 1.08, 0.6, z - 0.05], [x, 0.33, z - 0.02], [x, 0.1, z - 0.01], [x, 0.04, z + 0.015]]
        : [[x, 0.9, z], [x * 1.04, 0.64, z + 0.1], [x, 0.44, z - 0.11], [x, 0.1, z - 0.05], [x, 0.04, z - 0.025]];
      const R = front ? [[0.075, 0.09], [0.05, 0.06], [0.03, 0.033], [0.021, 0.024], [0.018, 0.02]] : [[0.1, 0.14], [0.052, 0.062], [0.03, 0.04], [0.021, 0.024], [0.018, 0.02]];
      A.part('leg' + i, P(J[0]), () => {
        const col = y => { const c = faDsMix(C.low, C.tan, Math.max(0, Math.min(1, (y - 0.14) / 0.3))), n = 0.95 + 0.1 * faNoise(x * 9, y * 9, z * 9); return sk(c, n); };
        faDsLimb(A, 'sleek', J.map(P), R.map(r => [r[0] * K, r[1] * K]), y => col(y / K), { bulge: front ? [0.1, 0.25, 0, 0] : [0.12, 0.3, 0, 0], nt: 2, ns: 8 });
        const f = J[4];
        for (const c of [-1, 1]) {
          faDsCone(A, 'hoof', P([f[0] + c * 0.011, 0.05, f[2] - 0.005]), P([f[0] + c * 0.012, 0.008, f[2] + 0.025]), 0.012 * K, 0.015 * K, C.dark, 7);
          const dc = P([f[0] + c * 0.014, 0.085, f[2] - 0.028]); A.ellip('hoof', dc[0], dc[1], dc[2], 0.007 * K, 0.009 * K, 0.008 * K, C.dark, { seg: 6 });   /* the dew claws */
        }
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
      const sk = H([0, 0.15, 0.16]); A.ellip('sleek', sk[0], sk[1], sk[2], 0.07, 0.065, 0.09, null, { seg: 12, colf: (x, y, z) => y < -0.03 ? C.belly : C.grey });
      faDsTube(A, 'sleek', t => H([0, 0.13 - 0.025 * t, 0.22 + 0.125 * t]), t => [0.042 - 0.024 * t, 0.04 - 0.022 * t], 5, 10, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.2 ? C.belly : C.muz });
      const jw = H([0, 0.097, 0.27]); A.ellip('sleek', jw[0], jw[1], jw[2], 0.027, 0.017, 0.068, C.belly, { seg: 8, rx: 0.12 });   /* the lower jaw */
      const np = H([0, 0.104, 0.348]); A.ellip('skin', np[0], np[1], np[2], 0.016, 0.014, 0.014, C.dark, { seg: 8 });
      for (const s of [-1, 1]) { const e = H([s * 0.044, 0.172, 0.215]); A.ellip('eye', e[0], e[1], e[2], 0.01, 0.009, 0.01, C.eye, { seg: 8 }); A.ellip('eye', e[0] + s * 0.004, e[1], e[2] + 0.004, 0.004, 0.006, 0.005, 0x050403, { seg: 6 }); }
    });
    /* the ears: tall, pointed, broad at the base and thin, leaning out (G.coyHead's: .085 high, .032 at the base, tilted
       .25); pale inside, the back of the ear tawny, the tips dark */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', H([s * 0.034, 0.2, 0.13]), () => {
      const b = H([s * 0.034, 0.19, 0.13]), e = H([s * 0.062, 0.3, 0.112]);
      faDsTube(A, 'sleek', t => [b[0] + (e[0] - b[0]) * t, b[1] + (e[1] - b[1]) * t, b[2] + (e[2] - b[2]) * t - 0.012 * Math.sin(Math.PI * t)],
        t => [0.036 * Math.pow(1 - t, 0.8) + 0.002, 0.011 * (1 - 0.6 * t)], 6, 10, null,
        { caps: true, round: [0.3, 0.3], colf: (t, a) => t > 0.82 ? faDsShade(C.back, 0.6) : (Math.cos(a) > 0.2 ? faDsMix(C.belly, C.grey, 0.3) : faDsMix(C.back, 0xa07850, 0.45)) });
    });
    /* the legs: digitigrade, from straight segments (the shoulder and elbow, the wrist, the pastern; the thigh, the
       stifle, the hock and the long rear pastern), standing on oval paws with four toes and dark claws */
    const LEGS = [[0.06, 0.22, 1, 0], [-0.06, 0.22, 1, 1], [0.06, -0.24, 0, 2], [-0.06, -0.24, 0, 3]];
    for (const [x, z, front, i] of LEGS) {
      const J = front ? [[x, 0.5, z], [x * 1.08, 0.37, z - 0.05], [x, 0.12, z - 0.02], [x, 0.04, z + 0.005]]
        : [[x, 0.52, z], [x * 1.06, 0.37, z + 0.07], [x, 0.2, z - 0.08], [x, 0.04, z - 0.05]];
      const R = front ? [[0.045, 0.065], [0.03, 0.04], [0.017, 0.021], [0.016, 0.019]] : [[0.05, 0.095], [0.034, 0.048], [0.018, 0.024], [0.016, 0.019]];
      A.part('leg' + i, J[0], () => {
        const col = y => { const n = 0.94 + 0.12 * faNoise(x * 30, y * 30, z * 30); return faDsShade(y > 0.36 ? C.grey : y > 0.22 ? (front ? C.low : C.grey) : C.low, n); };
        faDsLimb(A, 'sleek', J, R, col, { bulge: front ? [0.1, 0.22, 0] : [0.1, 0.28, 0], nt: 2, ns: 10 });
        /* the paw: a pad, four toes in an arc in front, a claw on each */
        const p = J[3], pc = faDsMix(C.low, C.dark, 0.25);
        A.ellip('sleek', p[0], 0.022, p[2] + 0.008, 0.021, 0.02, 0.026, pc, { seg: 8 });
        for (let k = 0; k < 4; k++) {
          const a = (k - 1.5) * 0.42, tx = p[0] + Math.sin(a) * 0.02, tz = p[2] + 0.024 + Math.cos(a) * 0.012 - Math.abs(k - 1.5) * 0.004;
          A.ellip('sleek', tx, 0.013, tz, 0.0085, 0.012, 0.011, pc, { seg: 6 });
          faDsCone(A, 'horn', [tx, 0.012, tz + 0.008], [tx + Math.sin(a) * 0.003, 0.002, tz + 0.016], 0.003, 0.0008, C.dark, 4);
        }
      });
    }
  }
});
