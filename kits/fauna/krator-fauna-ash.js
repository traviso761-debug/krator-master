/* ======================================================================
   Krator Fauna: ash (kits/fauna/krator-fauna-ash.js)
   The beasts of the Ash Nomads, who wander the ash plains round the great volcano (kits/catalog's ashnomad culture). They
   ride staghorn beetles (krator-fauna-voth.js, beside the giant beetle it derives from), herd the draught millipede's ash
   herd (krator-fauna-crawlers.js, variant 2) and keep the ash runner drawn here. First drawn 2026-10-07; metres.
   No ash-plain biome exists yet: the animals take the nearest keys, the southwest bay (biomes/swbay, which holds the
   volcano) and the crater drylands (biomes/crater-drylands, a burnt and ashen steppe). Retag them when the biome exists.
   ====================================================================== */
/* a colour mix of two sRGB hexes -> [r, g, b] */
function faAsMix(a, b, f) { const c = new THREE.Color(a).lerp(new THREE.Color(b), f); return [c.r, c.g, c.b]; }
/* a Catmull-Rom curve through points, t 0..1 */
function faAsSpline(pts) {
  const n = pts.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)], o = [];
    for (let k = 0; k < 3; k++) o.push(0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u));
    return o;
  };
}
function faAsLerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* ---------------------------------------------------------------- the ash runner
   A pig-sized, six-legged theropod: the body held level over the legs and balanced by a long stiff tail, a short-snouted
   toothy head with a small crest, three pairs of legs: the hind pair strong and bird-like (thigh, shin, the long upright
   metatarsus, three toes forward and a dewclaw), the middle and front pairs smaller, bent at the elbow, walking too.
   1.3 m from the snout to the root of the tail, the tail another 0.8 m; 0.7 m at the hip. Grey-brown scales banded ochre
   or rust across the back; the belly pale. The Ash Nomads keep it for its hide, its eggs and its meat. */
const FA_AS_RUN = [{ base: 0x6a6052, band: 0xb07a30, belly: 0xb8ab92, crest: 0xc0802e },
  { base: 0x7a7670, band: 0x9a4a28, belly: 0xbab4a6, crest: 0xa84a26 },
  { base: 0x4c3e30, band: 0xc08a3a, belly: 0xa89878, crest: 0xc8902e },
  { base: 0x8a7c68, band: 0x5a4a38, belly: 0xc8bea8, crest: 0xa08050 }];
ANIMAL({
  key: 'ash-runner', name: 'Ash runner', group: 'ash',
  tags: { biomes: ['swbay', 'crater-drylands'], koppen: ['BSh', 'BSk', 'BWh'], aridity: ['semiarid', 'arid'], climate: ['tropic', 'temperate'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['ashnomad'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'leaps'] },
  size: { length: 2.1, height: 0.75 },
  source: [{ build: 'kits/fauna', file: 'krator-fauna-ash.js', note: 'first drawn here (2026-10-07) for the Ash Nomads (kits/catalog krator-master-furniture-ashnomad.js: "a pig-sized six-legged runner (hides, eggs, meat)"); no ash-plain biome yet: swbay and crater-drylands stand in' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 32, note: 'dressed: dark, lean; smoked over the dung fire' },
    eggs: { amount: 30, note: 'two or three clutches a year in a scrape of warm ash; the leathery eggs keep for weeks' },
    hide: { amount: 1, hideM2: 1.1, note: 'fine scaled leather: boots, belts, water bags, the banded strips sewn into the tent hangings' } },
  life: { maturity: 1.5, lifespan: 14, litter: 10, gestation: 45, note: 'eggs buried in warm ash; gestation: incubation; the young run with the herd from the first day' },
  variants: 4, variantNames: ['grey-brown, ochre bands', 'ash-grey, rust bands', 'dark brown, ochre bands', 'juvenile: pale, dark-banded'],
  w: 0.48, d: 2.17, h: 0.85,
  variantDims: [{ w: 0.48, d: 2.17, h: 0.85 }, { w: 0.48, d: 2.17, h: 0.85 }, { w: 0.48, d: 2.17, h: 0.85 }, { w: 0.26, d: 1.15, h: 0.45 }],
  data: { mass: [60, 55, 65, 9], legs: 6, speed: { walk: 1.4, run: 9 }, gait: { type: 'hexapod', freq: 1.8, stride: 0.35 }, grazePitch: 0.7,
    herd: 'a band drives a flock of thirty to a hundred with its beetles, dogs and boys; they sleep in a ring of thorn round the tents', fleeDistance: 6, aggression: 0.15,
    idle: { headYaw: 0.45, headPitch: 0.08, tailYaw: 0.06 },
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, juv = v === 3, K = (juv ? 0.53 : 1) * A.S, C = FA_AS_RUN[v] || FA_AS_RUN[0];
    const P = p => [p[0] * K, p[1] * K, p[2] * K];
    /* the hide: bands across the back (by z), the pale belly, a mottle */
    const hide = (z, a) => { const top = Math.cos(a);
      if (top < -0.45) return faAsMix(C.belly, C.base, 0.15 * faNoise(z * 20, a, 1));
      const band = Math.sin(z / K * 26) > 0.35 && top > -0.2, n = faNoise(z / K * 14, a * 3, 2);
      return band ? faAsMix(C.band, C.base, 0.2 * n) : faAsMix(C.base, juv ? 0xffffff : 0x2a2420, 0.18 * n); };
    const tubeAlong = (pts, rad, nt, ns, fam, colf, caps) => { const c = faAsSpline(pts.map(P)); A.tube(fam || 'scale', c, t => { const r = rad(t); return [r[0] * K, r[1] * K]; }, nt, ns, null, { caps: caps !== false, colf: (t, a) => colf(c(t), t, a) }); return c; };
    /* the body: level, deepest at the hips and chest */
    tubeAlong([[0, .6, -.47], [0, .58, -.25], [0, .54, .05], [0, .5, .3], [0, .52, .38]],
      t => { const k = Math.sin(Math.PI * Math.min(1, t * 1.05)); return [0.07 + 0.12 * k, 0.07 + 0.12 * k]; }, 14, 14, 'scale', (p, t, a) => hide(p[2], a), true);
    A.ellip('scale', 0, .58 * K, -.25 * K, .17 * K, .17 * K, .2 * K, null, { seg: 12, colf: (x, y, z) => hide(-.25 * K + z, Math.atan2(x, y)) });   /* the haunches */
    /* the tail: long and stiff, rising a little, tapering to a point */
    A.part('tail', P([0, .6, -.42]), () => {
      tubeAlong([[0, .6, -.42], [0, .62, -.7], [0, .64, -1.0], [0, .65, -1.27]], t => [0.1 * (1 - t) + 0.008, 0.11 * (1 - t) + 0.008], 12, 10, 'scale', (p, t, a) => hide(p[2], a), true);
    });
    /* the head with the neck: a short S-curved neck, a deep short skull, the jaws lined with teeth, a small crest */
    A.part('head', P([0, .54, .32]), () => {
      tubeAlong([[0, .52, .3], [0, .6, .46], [0, .67, .56]], t => [0.1 - 0.025 * t, 0.11 - 0.03 * t], 6, 12, 'scale', (p, t, a) => hide(p[2] - 0.5 * K, a), true);
      tubeAlong([[0, .7, .54], [0, .7, .64], [0, .66, .76], [0, .62, .86]], t => [0.085 - 0.04 * t, 0.09 - 0.045 * t], 9, 12, 'scale',
        (p, t, a) => Math.cos(a) < -0.4 ? C.belly : faAsMix(C.base, 0x1e1a16, 0.1 * t), true);
      A.ellip('scale', 0, .62 * K, .66 * K, .06 * K, .035 * K, .12 * K, C.belly, { seg: 10, rx: -0.2 });   /* the lower jaw */
      for (const s of [-1, 1]) {
        A.ellip('eye', s * .066 * K, .725 * K, .66 * K, .022 * K, .02 * K, .022 * K, 0x1a1208, { seg: 8 });
        A.ellip('eye', s * .078 * K, .728 * K, .668 * K, .009 * K, .009 * K, .009 * K, 0xd8a030, { seg: 6 });
        /* the mouth line and the teeth along it */
        const m0 = P([s * .062, .64, .6]), m1 = P([s * .03, .615, .86]);
        A.cone('mouth', m0, m1, .006 * K, .005 * K, 0x1a0e0a, 4);
        for (let k = 0; k < 6; k++) { const p = faAsLerp(m0, m1, 0.1 + k * 0.16); A.cone('horn', p, [p[0] + s * 0.004 * K, p[1] - 0.022 * K, p[2] + 0.004 * K], 0.007 * K, 0.001, 0xe8e0c8, 4); }
      }
      /* the crest: a low ridge along the top of the skull with a row of short spines */
      for (let k = 0; k < 5; k++) { const z = .56 + k * .045, y = .765 - k * .012, h = .03 + .025 * Math.sin(Math.PI * (k + .5) / 5);
        A.cone('scale', P([0, y - .01, z]), P([0, y + h, z - .025]), .014 * K, .002, C.crest, 5); }
      A.ellip('scale', 0, .74 * K, .64 * K, .02 * K, .04 * K, .11 * K, C.crest, { seg: 8 });
    });
    /* the legs, front pair to hind (leg0, leg1 front; leg2, leg3 middle; leg4, leg5 hind), each turning about its root */
    const toe = (f, dir, len, r, col) => { const a = Math.atan2(dir[0], dir[2]); A.cone('scale', f, [f[0] + Math.sin(a) * len, 0.008 * K, f[2] + Math.cos(a) * len], r, r * 0.5, col, 5);
      A.cone('horn', [f[0] + Math.sin(a) * len * 0.95, 0.008 * K, f[2] + Math.cos(a) * len * 0.95], [f[0] + Math.sin(a) * (len + 0.02 * K), 0.002, f[2] + Math.cos(a) * (len + 0.02 * K)], r * 0.5, 0.001, 0x2a2420, 4); };
    const legCol = faAsMix(C.base, 0x1e1a16, 0.25);
    const limb = (pts, rad) => { for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], b = pts[k + 1], ra = rad[k] * K, rb = rad[k + 1] * K;
      A.tube('scale', u => faAsLerp(a, b, u), u => { const r = ra + (rb - ra) * u; return [r, r]; }, 2, 8, legCol); if (k > 0) A.ellip('scale', a[0], a[1], a[2], ra, ra, ra, legCol, { seg: 8 }); } };
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, pair = i >> 1, X = q => P([s * q[0], q[1], q[2]]);
      if (pair < 2) {   /* the front and middle pairs: shoulder, elbow out and down, the forearm to a small four-toed foot */
        const z = pair ? 0.04 : 0.28, sh = X([.11, .46, z]), el = X([.2, .27, z + .03]), ft = X([.17, .035, z + .1]);
        A.part('leg' + i, sh, () => {
          limb([sh, el, ft], [.055, .04, .026]);
          for (const d of [-0.5, -0.15, 0.2, 0.55]) toe(ft, [Math.sin(d + s * 0.2) * s, 0, Math.cos(d)], 0.06 * K, 0.011 * K, legCol);
        });
      } else {   /* the hind pair: hip, knee forward, the shin back to the ankle, the long metatarsus down to three forward toes */
        const hp = X([.13, .55, -.25]), kn = X([.16, .36, -.1]), an = X([.15, .15, -.33]), ft = X([.15, .03, -.25]);
        A.part('leg' + i, hp, () => {
          A.ellip('scale', hp[0], hp[1] - 0.06 * K, hp[2] + 0.03 * K, .09 * K, .14 * K, .12 * K, null, { seg: 10, rx: 0.4, colf: (x, y, z) => hide(hp[2] + z, y > 0 ? 0 : 2.5) });   /* the drumstick */
          limb([hp, kn, an, ft], [.075, .05, .032, .026]);
          for (const d of [-0.4, 0, 0.4]) toe(ft, [Math.sin(d), 0, Math.cos(d)], (d ? 0.1 : 0.13) * K, 0.016 * K, legCol);
          toe(ft, [0, 0, -1], 0.05 * K, 0.01 * K, legCol);   /* the dewclaw */
        });
      }
    }
    A.anchor('lead', P([0, .6, .45])); A.anchor('headRoot', P([0, .54, .32])); A.anchor('tailRoot', P([0, .6, -.42]));
  }
});
