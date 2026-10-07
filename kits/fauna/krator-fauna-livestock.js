/* ======================================================================
   Krator Fauna: livestock (kits/fauna/krator-fauna-livestock.js)
   The herd animals the peoples keep. First: the long-haired goat of the crater drylands, whose combed guard hair is the
   Scyvoi's black tent cloth (core/materials library/cloth.tent.black) and whose undercoat is their felt.
   ====================================================================== */
ANIMAL({
  key: 'goat', name: 'Drylands goat', group: 'livestock',
  tags: { biomes: ['crater-drylands', 'sedesert', 'ebadlands', 'nhighlands'], koppen: ['BSk', 'BWk', 'BSh', 'Dfb'], aridity: ['arid', 'semiarid'],
    climate: ['temperate', 'cold'], riparian: 'non', abyssal: false, domestic: true, herdedBy: ['scyvoi', 'nomad'],
    diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] },
  size: { length: 1.2, height: 0.75 },
  source: [{ build: 'kits/fauna', file: 'krator-fauna-livestock.js', note: 'first drawn here for the Scyvoi (2026-10-06)' },
    { build: 'settlements/reedlake', file: 'src/75-rl-helpers.js', lines: '212-222', note: 'a static goat (L 0.9 m) among the lake farms\' livestock' },
    { build: 'settlements/highlands', file: 'src/80-rus-dwell.js', lines: '51-61', note: 'rustic and tribal goats, static (also src/84-tri-dwell.js 99-107)' },
    { build: 'kits/post-apoc', file: 'src/50-farm.js', lines: '53-64', note: 'a goat on a tyre in the pen' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 18, note: 'a nanny dressed; a billy 30' }, milk: { amount: 1.5, note: 'in milk, about 200 days a year' },
    hide: { amount: 1, hideM2: 0.7, note: 'goatskin: water skins, drum heads, saddle covers' },
    hair: { amount: 0.8, note: 'the long black guard hair, combed and shorn each spring: woven into the tent cloth and rope' },
    wool: { amount: 0.15, note: 'the fine undercoat, combed out: felt and the best yarn' },
    horn: { amount: 0.4, note: 'a billy: spoons, bows, handles' } },
  life: { maturity: 0.7, lifespan: 12, litter: 1.6, gestation: 150 },
  variants: 4, variantNames: ['billy, black', 'nanny, brown', 'kid', 'nanny, piebald'],
  w: 0.8, d: 1.3, h: 1.3,
  variantDims: [{ w: 0.8, d: 1.3, h: 1.3 }, { w: 0.55, d: 1.25, h: 1.15 }, { w: 0.34, d: 0.72, h: 0.66 }, { w: 0.55, d: 1.25, h: 1.15 }],
  data: { mass: [70, 45, 15, 45], legs: 4, speed: { walk: 1.1, run: 6 }, gait: { type: 'quadruped', freq: 1.7, stride: 0.42 }, grazePitch: 1.0,
    herd: 'a flock of 10 to 40 with a herder and dogs', fleeDistance: 4, aggression: 0.15,
    schedule: [ 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'MILK', 'REST', 'REST', 'REST', 'REST', 'REST' ] },
  build: function (A) {
    const v = A.variant, K = v === 2 ? 0.56 : v === 0 ? 1.08 : 1, hairLen = v === 2 ? 0.45 : 1;
    const base = [0x1c1916, 0x3a2a1e, 0x2a211b, 0xe6e0d2][v], patchCol = 0x1a1714, hornC = v === 0 ? 0x4a3c2c : 0x6a5a44;
    const P = p => [p[0] * K, p[1] * K, p[2] * K];
    const coat = (x, y, z) => v === 3 ? (faNoise(x * 5.5 + 3.1, y * 5.5, z * 5.5) > 0.55 ? patchCol : base) : base;
    const shade = (hex, k) => { const c = new THREE.Color(hex); return [c.r * k, c.g * k, c.b * k]; };
    /* ---- the body: a barrel from rump to chest, its coat colour by position */
    const bodyC = t => P([0, 0.6 + 0.02 * Math.sin(Math.PI * t), -0.46 + 0.84 * t]);
    const bodyR = t => { const s = Math.sin(Math.PI * Math.min(1, Math.max(0, t * 1.05 - 0.02))); return [K * (0.07 + 0.12 * Math.pow(s, 0.6)), K * (0.08 + 0.13 * Math.pow(s, 0.55))]; };
    A.tube('coat', bodyC, bodyR, 10, 12, null, { caps: true, colf: (t, a) => { const p = bodyC(t); return coat(p[0] + Math.sin(a) * 0.2, p[1] + Math.cos(a) * 0.2, p[2]); } });
    if (v === 1 || v === 3) A.ellip('skin', 0, 0.36 * K, -0.26 * K, 0.07 * K, 0.06 * K, 0.08 * K, 0xb09088);   // the udder
    /* ---- the long-hair skirt down each side, its hem ragged, and locks over the back, sides and rump */
    for (const s of [-1, 1]) A.sheet('hair', (u, w) => {
      const z = (-0.44 + 0.78 * u) * K, top = 0.6 * K, hem = (0.27 + 0.18 * (1 - hairLen) + 0.03 * Math.sin(u * 17 + s) + 0.02 * Math.sin(u * 41)) * K;
      const xr = (0.19 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.02 + 0.02)), 0.4) + 0.025) * K;
      return [s * (xr + 0.025 * w * K), top + (hem - top) * w, z];
    }, 14, 4, null, { colf: (u, w) => { const c = coat(s * 0.2, 0.62 - 0.32 * w, -0.44 + 0.78 * u); return shade(c, 1 - 0.3 * w); } });
    const locks = [];
    for (let i = 0; i < 110; i++) {
      const zf = A.rnd(), a = (A.rr(-1, 1)) * 1.45, z = (-0.44 + 0.8 * zf) * K, R = bodyR(zf), y0 = (0.61) * K;
      const at = [Math.sin(a) * R[0] * 1.02, y0 + Math.cos(a) * R[1] * 1.02, z];
      locks.push({ at: at, dir: [Math.sin(a) * 0.35, -1, A.rr(-0.15, 0.1)], len: A.rr(0.12, 0.3) * K * hairLen, w: A.rr(0.03, 0.05) * K, col: coat(at[0], at[1], at[2]), curl: 0.2 });
    }
    A.locks('hair', locks);
    /* ---- the head (with the neck): it turns about the base of the neck to graze */
    A.part('head', P([0, 0.74, 0.33]), () => {
      A.tube('coat', t => P([0, 0.7 + 0.25 * t, 0.3 + 0.15 * t]), t => [K * (0.08 - 0.02 * t), K * (0.09 - 0.02 * t)], 4, 10, null, { colf: () => coat(0, 0.8, 0.4) });
      A.tube('coat', t => P([0, 0.97 - 0.15 * t * t, 0.44 + 0.25 * t]), t => [K * (0.066 - 0.034 * t), K * (0.078 - 0.04 * t)], 5, 10, null, { caps: true, colf: (t) => t > 0.85 ? 0x3a3530 : coat(0, 0.9, 0.5) });
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.052 * K, 0.968 * K, 0.545 * K, 0.015 * K, 0.011 * K, 0.013 * K, 0x2a1a08, { seg: 8 }); A.ellip('eye', s * 0.059 * K, 0.97 * K, 0.549 * K, 0.007 * K, 0.009 * K, 0.004 * K, 0x050403, { seg: 6 }); }
      A.ellip('mouth', 0, 0.81 * K, 0.685 * K, 0.026 * K, 0.008 * K, 0.02 * K, 0x2a1e1a, { seg: 8 });
      /* the mane down the neck and, on the billy, the beard */
      const mane = [];
      for (let i = 0; i < 26; i++) { const t = A.rnd(), s = A.rnd() < 0.5 ? -1 : 1; const at = P([s * 0.05, 0.74 + 0.18 * t, 0.31 + 0.15 * t]); mane.push({ at: at, dir: [s * 0.5, -1, -0.1], len: A.rr(0.08, 0.2) * K * hairLen, w: 0.035 * K, col: coat(at[0], at[1], at[2]) }); }
      if (v === 0) for (let i = 0; i < 9; i++) mane.push({ at: P([A.rr(-0.02, 0.02), 0.82, 0.63 + A.rr(-0.02, 0.02)]), dir: [0, -1, -0.15], len: A.rr(0.12, 0.18) * K, w: 0.03 * K, col: shade(base, 0.8), curl: 0.05 });
      A.locks('hair', mane);
      /* the horns: the billy's corkscrews sweep out and back; a nanny's curve back; a kid's are buds */
      for (const s of [-1, 1]) {
        const b = P([s * 0.036, 1.03, 0.5]);
        if (v === 0) {
          const ax = new THREE.Vector3(s * 0.62, 0.42, -0.66).normalize(), u = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 1, 0)).normalize(), w2 = new THREE.Vector3().crossVectors(ax, u).normalize();
          A.tube('horn', t => { const ang = t * TAU * 1.6 * s, r = 0.055 * K * (1 - 0.35 * t), L = 0.46 * K * t;
            return [b[0] + ax.x * L + (Math.cos(ang) * u.x + Math.sin(ang) * w2.x) * r - u.x * 0.055 * K, b[1] + ax.y * L + (Math.cos(ang) * u.y + Math.sin(ang) * w2.y) * r - u.y * 0.055 * K, b[2] + ax.z * L + (Math.cos(ang) * u.z + Math.sin(ang) * w2.z) * r - u.z * 0.055 * K]; },
            t => { const r = K * (0.03 - 0.026 * t); return [r, r * 0.8]; }, 18, 8, null, { caps: true, colf: t => t > 0.8 ? 0x241c14 : hornC });
        } else if (v === 2) A.cone('horn', b, [b[0] + s * 0.01, b[1] + 0.035, b[2] - 0.015], 0.012, 0.004, hornC, 6);
        else A.tube('horn', t => [b[0] + s * 0.05 * K * t * t, b[1] + 0.13 * K * Math.sin(t * 1.4), b[2] - 0.2 * K * t * t - 0.03 * K * t], t => { const r = K * (0.022 - 0.019 * t); return [r, r]; }, 8, 7, null, { caps: true, colf: t => t > 0.8 ? 0x2a2018 : hornC });
      }
    });
    for (const s of [-1, 1]) A.part(s < 0 ? 'earR' : 'earL', P([s * 0.055, 0.995, 0.49]), () => {
      A.ellip('coat', s * 0.11 * K, 0.965 * K, 0.475 * K, 0.075 * K, 0.017 * K, 0.032 * K, coat(s * 0.1, 0.92, 0.47), { rz: s * 0.55, ry: s * 0.25 });
    });
    /* ---- the legs: each turns about its top; hair feathers the upper leg; dark hooves */
    const legs = [[0.085, 0.29, 1, 0], [-0.085, 0.29, 1, 1], [0.085, -0.33, 0, 2], [-0.085, -0.33, 0, 3]];
    for (const [x, z, front, i] of legs) A.part('leg' + i, P([x, 0.52, z]), () => {
      const pts = front ? [[x, 0.52, z], [x, 0.28, z + 0.01], [x, 0.07, z + 0.02], [x, 0.01, z + 0.025]] : [[x, 0.54, z], [x, 0.33, z - 0.06], [x, 0.16, z - 0.03], [x, 0.01, z + 0.0]];
      const at = t => { const f = t * 3, k = Math.min(2, Math.floor(f)), r = f - k; const a = pts[k], c = pts[k + 1]; return P([a[0] + (c[0] - a[0]) * r, a[1] + (c[1] - a[1]) * r, a[2] + (c[2] - a[2]) * r]); };
      A.tube('coat', at, t => { const r = K * (0.044 - 0.024 * Math.min(1, t * 1.3)); return [r, r * 1.1]; }, 6, 8, null, { colf: (t) => t > 0.85 ? 0x2a2420 : coat(x, 0.3, z) });
      const hf = at(1);
      A.cone('hoof', [hf[0], 0, hf[2] + 0.005], [hf[0], 0.045 * K, hf[2]], 0.026 * K, 0.021 * K, 0x1a1612, 8);
      const fl = [];
      for (let j = 0; j < 7; j++) { const t = A.rr(0.05, 0.4), p = at(t); fl.push({ at: p, dir: [A.rr(-0.3, 0.3), -1, front ? -0.3 : 0.2], len: A.rr(0.06, 0.14) * K * hairLen, w: 0.03 * K, col: coat(p[0], p[1], p[2]) }); }
      A.locks('hair', fl);
    });
    /* ---- the tail: a short upturned tuft */
    A.part('tail', P([0, 0.7, -0.45]), () => {
      A.tube('coat', t => P([0, 0.7 + 0.08 * t, -0.45 - 0.06 * t]), t => [K * 0.022, K * 0.026], 3, 6, null, { caps: true, colf: () => coat(0, 0.75, -0.48) });
      A.locks('hair', [{ at: P([0, 0.78, -0.51]), dir: [0, 0.5, -1], len: 0.1 * K * hairLen, w: 0.05 * K, col: coat(0, 0.78, -0.5), curl: 0.6 }]);
    });
    A.anchor('pack', P([0, 0.82, -0.05])); A.anchor('lead', P([0, 0.8, 0.42]));
  }
});
