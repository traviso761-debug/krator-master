/* ======================================================================
   Krator Fauna: the wild (kits/fauna/krator-fauna-wild.js)
   The biome pass of 2026-10-13: every biome gets two grazers, a predator, a flyer and a water creature of its own
   (BIOME-FAUNA-PLAN.md). This first wave is the biomes that had the fewest animals: the north-west lowlands, the
   south-west lowlands (Dalab), Xanadu, the Rift, the eastern badlands and the Throne (with the geyser fields).
   Procedural, from a few shared builders: faWdQuad (a land animal from a spec: body, neck, head, horns or antlers,
   ears, tail, four jointed legs or two, a sprawl stance, a shell), faWdFish, faWdSerpent (an eel, a slug, a snake
   as a chain of segments); birds and flyers reuse faHiBird of krator-fauna-hyperjungle.js, so a bundle that takes
   `wild` must also take `hyperjungle`. Dimensions are the measured boxes of the builds (verify.py --assert).
   ====================================================================== */
const FA_WD_SRC = { build: 'kits/fauna', file: 'krator-fauna-wild.js', lines: '-' };
const FA_WD_SCH = {
  graze: ['REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
  hunt: ['HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT'],
  fly: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'FLY', 'FLY', 'HUNT', 'FLY', 'FLY', 'REST', 'FLY', 'HUNT', 'FLY', 'FLY', 'HUNT', 'FLY', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
  swim: ['SWIM', 'SWIM', 'REST', 'REST', 'REST', 'SWIM', 'SWIM', 'HUNT', 'SWIM', 'SWIM', 'REST', 'REST', 'SWIM', 'SWIM', 'HUNT', 'SWIM', 'SWIM', 'REST', 'REST', 'REST', 'SWIM', 'SWIM', 'SWIM', 'SWIM']
};
/* an animal from a definition: the tags and the yields default sensibly; d.spec is the builder's spec, d.kind its builder */
function faWdAnimal(d) {
  const T = d.tags || {};
  ANIMAL({
    key: d.key, name: d.name, group: 'wild',
    tags: { biomes: d.biomes, koppen: d.koppen, aridity: d.aridity, climate: d.climate, riparian: T.riparian || 'non', abyssal: false, domestic: false, herdedBy: [],
      diet: T.diet || 'herbivore', feeding: T.feeding || 'grazer', activity: T.activity || 'diurnal', temperament: T.temperament || 'skittish', habitat: T.habitat || ['ground'], locomotion: T.locomotion || ['walks', 'runs'] },
    size: { length: d.dim[1], height: d.dim[2] },
    source: [Object.assign({}, FA_WD_SRC, { note: 'first drawn here (2026-10-13), the biome fauna pass (BIOME-FAUNA-PLAN.md): ' + d.note })],
    traits: { edible: !!d.meat, milkable: false, tameable: false, rideable: false, draught: false, eggs: !!d.eggs },
    yields: Object.assign({}, d.meat ? { meat: { amount: d.meat, note: d.meatNote || 'dressed' } } : {}, d.eggs ? { eggs: { amount: d.eggs, note: 'a clutch a year' } } : {}, d.hide ? { hide: { amount: 1, hideM2: d.hide, note: d.hideNote || 'a tough hide' } } : {}, d.extra || {}),
    life: { maturity: d.life[0], lifespan: d.life[1], litter: d.life[2], gestation: d.life[3], note: d.lifeNote || '' },
    variants: d.variants.length, variantNames: d.variants.map(v => v[0]),
    w: d.dim[0], d: d.dim[1], h: d.dim[2],
    data: Object.assign({ mass: d.mass, legs: d.legs == null ? 4 : d.legs, sizeRange: [0.8, 1.2], speed: d.speed || { walk: 1, run: 6 }, gait: d.gait || { type: 'quadruped', freq: 1.4, stride: 0.5 }, grazePitch: d.grazePitch == null ? 0.7 : d.grazePitch,
      herd: d.herd, fleeDistance: d.flee || 8, aggression: d.aggr == null ? 0.1 : d.aggr, schedule: FA_WD_SCH[d.sch || 'graze'] }, d.data || {}),
    build: function (A) { d.kind(A, Object.assign({}, d.spec, { c: d.variants[A.variant][1] })); }
  });
}
const faWdM = faHiMix;
/* a land animal. o: L body length, bh/bw body half-height/width, legH leg length, c colours {a b m d h f (hoof)}, pat(z, angle, q) -> colour or null,
   nk {len, rise}, hd {len, hh, hw, sn, drop}, tl {kind: whip|brush|stub|long|flat|none, len, w}, ear {kind: round|long|point|none, s},
   hn {kind: curve|antlers|straight|three|frill|fork|none, s}, lt leg thickness, foot hoof|paw|claw, stance upright|sprawl, biped, shell, hump, fam */
function faWdQuad(A, o) {
  const S = A.S, c = o.c, mix = faWdM, fam = o.fam || 'coat', L = o.L, bh = o.bh, bw = o.bw, yc = o.legH + bh, lt = o.lt || 0.05, sp = o.stance === 'sprawl';
  const R = rows => rows.map(r => r.map(x => x * S)), e = (x, y, z, rx, ry, rz, col, op) => A.ellip(fam, x * S, y * S, z * S, rx * S, ry * S, rz * S, col, op || { seg: 10 });
  const co = (a, b, r0, r1, col, f) => A.cone(f || fam, [a[0] * S, a[1] * S, a[2] * S], [b[0] * S, b[1] * S, b[2] * S], r0 * S, r1 * S, col, 6);
  const colf = (t, a, q) => { const z = q[2] / S, up = Math.cos(a), p = o.pat ? o.pat(z, a, q, t) : null; return p || mix(c.a, c.b, faHjSm(0.1, -0.6, up)); };
  const nk = o.nk || { len: 0.25, rise: 0.15 }, hd = o.hd || { len: 0.3, hh: 0.1, hw: 0.08, sn: 0.5, drop: 0.08 };
  const nb = [0, yc + bh * 0.5, L / 2 - 0.05], hb = [0, nb[1] + nk.rise, nb[2] + nk.len];      /* the neck's root and the head's base */
  const hump = o.hump || 0;
  faHjRows(A, fam, R([[0, yc + 0.02, -L / 2, bw * 0.7, bh * 0.75], [0, yc + 0.02 + hump * 0.3, -L * 0.3, bw * 0.95, bh * 0.98], [0, yc + 0.03 + hump, L * 0.12, bw, bh * 1.05], [0, yc + hump * 0.5, L * 0.4, bw * 0.92, bh], [0, yc - 0.01, L / 2, bw * 0.8, bh * 0.9]]), 14, 16, null, { round: [0.06, 0], colf: colf });
  faHjRows(A, fam, R([[0, nb[1], nb[2] - 0.12, bw * 0.75, bh * 0.85], [0, (nb[1] + hb[1]) / 2, (nb[2] + hb[2]) / 2, bw * 0.5, bh * 0.6], [0, hb[1], hb[2], hd.hw * 1.1, hd.hh * 1.15]]), 8, 12, null, { colf: colf });
  if (o.shell) e(0, yc + bh * 0.55, 0, bw * 1.25, bh * 1.05, L * 0.52, null, { seg: 18, colf: (x, y, z) => { const g = Math.sin(x / S * 22) * Math.sin(z / S * 18) > 0.1; return g ? mix(c.d, c.b, 0.18) : c.d; } });
  A.part('head', [0, hb[1] * S, hb[2] * S], () => {
    const hy = hb[1], hz = hb[2];
    faHjRows(A, fam, R([[0, hy, hz - 0.02, hd.hw * 1.1, hd.hh * 1.15], [0, hy - hd.drop * 0.3, hz + hd.len * 0.4, hd.hw, hd.hh], [0, hy - hd.drop * 0.8, hz + hd.len * 0.8, hd.hw * hd.sn, hd.hh * hd.sn * 1.1], [0, hy - hd.drop, hz + hd.len, hd.hw * hd.sn * 0.8, hd.hh * hd.sn * 0.8]]), 10, 12, null,
      { round: [0, 0.18], colf: (t, a) => o.hpat ? o.hpat(t, a) : mix(c.a, c.b, 0.6 * faHjSm(0.0, -0.8, Math.cos(a)) + (t > 0.8 ? 0.2 : 0)) });
    e(0, hy - hd.drop, hz + hd.len + 0.005, Math.min(hd.hw * hd.sn * 0.7, 0.05), Math.min(hd.hh * hd.sn * 0.6, 0.04), 0.03, 0x1a1412, { seg: 8 });
    for (const s of [-1, 1]) { e(s * hd.hw * 0.95, hy + hd.hh * 0.3, hz + hd.len * 0.3, 0.018, 0.02, 0.018, 0x0a0806, { seg: 6 }); if (o.eyeC) e(s * hd.hw * 0.99, hy + hd.hh * 0.3, hz + hd.len * 0.3, 0.012, 0.014, 0.012, o.eyeC, { seg: 5 }); }
    const hn = o.hn || { kind: 'none' };
    for (const s of [-1, 1]) {
      const bx = s * hd.hw * 0.7, by = hy + hd.hh * 0.8, bz = hz + hd.len * 0.1, sz = hn.s || 1;
      if (hn.kind === 'curve') faHjRows(A, 'horn', R([[bx, by, bz, .03 * sz, .03 * sz], [bx + s * .1 * sz, by + .1 * sz, bz - .02, .024 * sz, .024 * sz], [bx + s * .16 * sz, by + .2 * sz, bz + .08 * sz, .014 * sz, .014 * sz], [bx + s * .1 * sz, by + .26 * sz, bz + .2 * sz, .004 * sz, .004 * sz]]), 10, 8, c.h, { round: [0, 0.1] });
      else if (hn.kind === 'curl') faHjRows(A, 'horn', R([[bx, by, bz, .04 * sz, .04 * sz], [bx + s * .12 * sz, by + .1 * sz, bz - .06, .035 * sz, .035 * sz], [bx + s * .2 * sz, by - .02 * sz, bz - .04 * sz, .026 * sz, .026 * sz], [bx + s * .17 * sz, by - .12 * sz, bz + .08 * sz, .014 * sz, .014 * sz], [bx + s * .08 * sz, by - .08 * sz, bz + .12 * sz, .004 * sz, .004 * sz]]), 12, 10, c.h, { round: [0, 0.1] });
      else if (hn.kind === 'straight') co([bx, by, bz], [bx + s * .03 * sz, by + .32 * sz, bz - .06 * sz], .022 * sz, .004, c.h, 'horn');
      else if (hn.kind === 'fork') { co([bx, by, bz], [bx + s * .04, by + .22 * sz, bz - .04], .018 * sz, .01, c.h, 'horn'); co([bx + s * .04, by + .22 * sz, bz - .04], [bx + s * .02, by + .34 * sz, bz - .12 * sz], .01, .003, c.h, 'horn'); co([bx + s * .04, by + .22 * sz, bz - .04], [bx + s * .06, by + .3 * sz, bz + .06 * sz], .01, .003, c.h, 'horn'); }
      else if (hn.kind === 'antlers') { const pts = [[bx, by, bz], [bx + s * .08 * sz, by + .18 * sz, bz - .06], [bx + s * .16 * sz, by + .34 * sz, bz - .04], [bx + s * .2 * sz, by + .5 * sz, bz + .08]];
        for (let k = 0; k < 3; k++) co(pts[k], pts[k + 1], .016 * sz * (1 - k * .2), .012 * sz * (1 - k * .2), c.h, 'horn');
        for (let k = 1; k <= 3; k++) co(pts[k], [pts[k][0] + s * .02, pts[k][1] + .12 * sz, pts[k][2] + .1 * sz], .01 * sz, .002, c.h, 'horn'); }
      else if (hn.kind === 'three') { if (s > 0) { co([0, hy + hd.hh * 0.5, hz + hd.len * 0.78], [0, hy + hd.hh * 0.5 + .16 * sz, hz + hd.len * 0.9], .03 * sz, .005, c.h, 'horn'); }
        co([bx * 1.2, by + .01, bz + hd.len * 0.3], [bx * 1.5, by + .1 * sz, bz + hd.len * 0.9 + .22 * sz], .028 * sz, .004, c.h, 'horn'); }
    }
    if (o.frill) faHjPlate(A, 'horn', (u, w) => { const a = 2 * u - 1; return [a * (hd.hw * 1.1 + 0.3 * w * o.frill) * S, (hy + hd.hh * 0.7 + 0.3 * w * o.frill * (1 - a * a * 0.5)) * S, (hz - 0.04 - 0.04 * w) * S]; }, () => [0.01 * S, 0.01 * S], 12, 5, (u, w) => mix(c.m || c.a, c.h, w));
    if (o.crest) for (let k = 0; k < 5; k++) co([0, hy + hd.hh, hz + 0.02 + k * 0.045], [0, hy + hd.hh + o.crest * (1 - k * 0.12), hz - 0.02 + k * 0.045], .012, .002, c.m || c.d, 'horn');
    if (o.bill) faHjPlate(A, fam, (u, w) => { const a = 2 * u - 1; return [a * (hd.hw * 0.7 + 0.04 * w) * S, (hy - hd.drop - 0.02) * S, (hz + hd.len * 0.9 + 0.2 * w) * S]; }, () => [0.02 * S, 0.012 * S], 8, 4, (u, w) => mix(c.a, c.m || c.d, 0.5 * w));   /* a duck-bill */
  });
  if (o.ear && o.ear.kind !== 'none') for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', [s * hd.hw * 0.7 * S, (hb[1] + hd.hh * 0.9) * S, (hb[2] + hd.len * 0.05) * S], () => {
    const es = o.ear.s || 1, k = o.ear.kind;
    e(s * hd.hw * (k === 'long' ? 0.8 : 1.0), hb[1] + hd.hh * 0.9 + (k === 'long' ? 0.1 : 0.04) * es, hb[2] + hd.len * 0.05, (k === 'long' ? 0.025 : 0.04) * es, (k === 'long' ? 0.12 : k === 'point' ? 0.07 : 0.045) * es, 0.016 * es, mix(c.a, c.b, 0.3), { seg: 8, rz: s * (k === 'long' ? 0.35 : 0.2) });
  });
  const tl = o.tl || { kind: 'stub', len: 0.2, w: 0.04 }, tb = [0, yc + 0.02, -L / 2 + 0.02];
  if (tl.kind !== 'none') A.part('tail', [tb[0] * S, tb[1] * S, tb[2] * S], () => {
    if (tl.kind === 'flat') e(0, tb[1] - 0.03, tb[2] - tl.len * 0.5, tl.w * 2.2, 0.018, tl.len * 0.55, c.d, { seg: 12 });
    else if (tl.kind === 'long') faHjRows(A, fam, R([[0, tb[1], tb[2], tl.w, tl.w * 0.9], [0, tb[1] - 0.04, tb[2] - tl.len * 0.4, tl.w * 0.7, tl.w * 0.6], [0, tb[1] - 0.1, tb[2] - tl.len * 0.75, tl.w * 0.35, tl.w * 0.3], [0, tb[1] - 0.12, tb[2] - tl.len, tl.w * 0.06, tl.w * 0.06]]), 12, 10, null, { colf: colf });
    else if (tl.kind === 'brush') faHjRows(A, 'shag', R([[0, tb[1], tb[2], tl.w * 0.5, tl.w * 0.5], [0, tb[1] - 0.06, tb[2] - tl.len * 0.5, tl.w, tl.w], [0, tb[1] - 0.12, tb[2] - tl.len, tl.w * 0.5, tl.w * 0.5]]), 8, 10, mix(c.a, c.b, 0.3), { shag: [0.15, 6], round: [0, 0.2] });
    else if (tl.kind === 'whip') { co([0, tb[1], tb[2]], [0, tb[1] - 0.05, tb[2] - tl.len], tl.w, tl.w * 0.3, c.a); e(0, tb[1] - 0.05, tb[2] - tl.len, tl.w * 1.2, tl.w * 1.2, 0.05, c.d, { seg: 6 }); }
    else co([0, tb[1], tb[2]], [0, tb[1] - 0.04, tb[2] - tl.len], tl.w, tl.w * 0.3, c.a);
  });
  const nl = o.biped ? 2 : 4, fz = L / 2 - 0.15 * L, hz2 = -L / 2 + 0.2 * L;
  for (let i = 0; i < nl; i++) {
    const s = (i & 1) ? -1 : 1, hind = o.biped ? 1 : i >> 1, z = hind ? (o.biped ? -0.05 * L : hz2) : fz, x0 = bw * (sp ? 0.85 : 0.7);
    let pts;
    if (sp) { const lg = Math.max(o.legH, 0.12); pts = [[s * x0, yc - bh * 0.2, z], [s * (bw + lg * 0.9), yc - bh * 0.2 - 0.02, z + (hind ? -0.04 : 0.04)], [s * (bw + lg * 1.0), 0.03, z + (hind ? -0.1 : 0.1)]]; }
    else if (hind) pts = [[s * x0, yc - bh * 0.4, z], [s * x0, o.legH * 0.55, z + 0.1 * o.legH + (o.biped ? 0.08 : 0)], [s * x0, o.legH * 0.28, z - 0.08 * o.legH], [s * x0, 0.03, z + 0.02 * o.legH]];
    else pts = [[s * x0, yc - bh * 0.4, z], [s * x0, o.legH * 0.5, z - 0.01], [s * x0, 0.03, z + 0.02 * o.legH]];
    A.part('leg' + i, [pts[0][0] * S, pts[0][1] * S, pts[0][2] * S], () => {
      const rs = (hind ? [lt * 1.4, lt * 1.0, lt * 0.7, lt * 0.55] : [lt * 1.2, lt * 0.8, lt * 0.55]).map(x => x * 1.35);
      for (let k = 0; k < pts.length - 1; k++) { co(pts[k], pts[k + 1], rs[k], rs[k + 1], k === pts.length - 2 && o.footC ? o.footC : mix(c.a, c.d, k * 0.18)); if (k) e(pts[k][0], pts[k][1], pts[k][2], rs[k] * 1.1, rs[k] * 1.1, rs[k] * 1.1, c.a, { seg: 6 }); }
      const f = pts[pts.length - 1], fc = c.f || 0x1c1814;
      if (o.foot === 'paw') e(f[0], 0.025, f[2] + 0.03, lt * 0.9, 0.03, lt * 1.3, mix(c.a, c.d, 0.3), { seg: 8 });
      else if (o.foot === 'claw') for (let d = -1; d <= 1; d++) co([f[0] + d * lt * 0.5, 0.02, f[2] + 0.01], [f[0] + d * lt * 0.9, 0.006, f[2] + 0.1 + lt * 0.5], lt * 0.35, lt * 0.12, fc, 'horn');
      else for (let d = -1; d <= 1; d += 2) e(f[0] + d * lt * 0.4, 0.02, f[2] + 0.025, lt * 0.5, 0.025, lt * 0.8, fc, { seg: 6 });
    });
  }
  if (o.biped) for (const s of [-1, 1]) co([s * bw * 0.6, yc + bh * 0.2, L / 2 - 0.12 * L], [s * bw * 0.7, yc - bh * 0.5, L / 2 - 0.02 * L], 0.025, 0.014, c.a);   /* the small arms, held in */
  A.anchor('lead', [0, hb[1] * S, (hb[2] + hd.len) * S]); A.anchor('headRoot', [0, hb[1] * S, hb[2] * S]); A.anchor('tailRoot', [0, yc * S, -L / 2 * S]);
}
/* a fish at the waterline: o L length, hh body half-height, hw half-width, c {a b m d}, fins, a forked or lunate tail; the tail turns */
function faWdFish(A, o) {
  const S = A.S, c = o.c, mix = faWdM, L = o.L, hh = o.hh, hw = o.hw || hh * 0.55, R = rows => rows.map(r => r.map(x => x * S));
  const prof = t => hh * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.12 + 0.82 * t)), 0.7) * (t > 0.75 ? 1 - (t - 0.75) * 1.5 : 1);
  const rows = []; for (let i = 0; i <= 6; i++) { const t = i / 6; rows.push([0, 0, (-L * 0.5 + L * t), prof(t) * hw / hh, prof(t)]); }
  faHjRows(A, 'sleek', R(rows), 14, 14, null, { round: [0.05, 0.1], colf: (t, a) => { const up = Math.cos(a); return o.pat ? o.pat(t, a) : mix(c.a, c.b, faHjSm(0.2, -0.5, up)); } });
  A.part('head', [0, 0, L * 0.38 * S], () => { A.ellip('eye', 0.3 * hw * S * 1.0, hh * 0.35 * S, L * 0.4 * S, 0.02 * L * S, 0.02 * L * S, 0.02 * L * S, 0x0a0806, { seg: 6 }); A.ellip('eye', -0.3 * hw * S, hh * 0.35 * S, L * 0.4 * S, 0.02 * L * S, 0.02 * L * S, 0.02 * L * S, 0x0a0806, { seg: 6 });
    A.ellip('sleek', 0, -hh * 0.2 * S, L * 0.46 * S, hw * 0.5 * S, hh * 0.25 * S, L * 0.05 * S, c.d, { seg: 8 }); });
  A.part('tail', [0, 0, -L * 0.36 * S], () => faHjPlate(A, 'membrane', (u, w) => { const a = 2 * u - 1, fork = o.fork == null ? 0.4 : o.fork; return [0, a * hh * (0.3 + 1.5 * w) * S * (o.tailH || 1), (-L * 0.36 - L * 0.16 * w - fork * L * 0.12 * Math.abs(a) * w) * S]; }, () => [0.004 * S, 0.004 * S], 8, 4, (u, w) => mix(c.m || c.a, c.d, w)));
  for (const s of [-1, 1]) faHjPlate(A, 'membrane', (u, w) => [s * (hw * 0.9 + L * 0.12 * u) * S, (-hh * 0.3 - L * 0.05 * u) * S, (L * 0.2 - L * 0.12 * w - L * 0.1 * u) * S], () => [0.004 * S, 0.004 * S], 6, 3, () => mix(c.m || c.a, c.b, 0.4));
  faHjPlate(A, 'membrane', (u, w) => [0, (hh * 0.85 + o.fin * hh * Math.sin(Math.PI * u) * w) * S, (L * 0.12 - L * 0.28 * u) * S], () => [0.004 * S, 0.004 * S], 8, 3, (u, w) => mix(c.d, c.m || c.a, w));
  A.anchor('lead', [0, 0, L * 0.5 * S]); A.anchor('headRoot', [0, 0, L * 0.38 * S]); A.anchor('tailRoot', [0, 0, -L * 0.36 * S]);
}
/* a chain of segments with a head: an eel, a slug, a snake. o L length, rmax, kind eel|slug, c {a b m d}, stalks (eyes on stalks), fin */
function faWdSerpent(A, o) {
  const S = A.S, c = o.c, mix = faWdM, N = o.N || 12, Z0 = -o.L * 0.55, Z1 = o.L * 0.45, L = (Z1 - Z0) / N, rm = o.rmax, y0 = o.y0 == null ? rm : o.y0;
  const r = z => { const t = (z - Z0) / (Z1 - Z0); return Math.max(0.012, rm * Math.pow(Math.sin(Math.PI * Math.min(1, 0.05 + t * 0.95)), o.kind === 'slug' ? 0.4 : 0.5) * (t > 0.88 ? 1 - (t - 0.88) * 1.6 : 1)); };
  for (let k = 0; k < N; k++) {
    const z0 = Z0 + k * L, z1 = z0 + L, zm = (z0 + z1) / 2;
    A.part('seg' + k, [0, y0 * S, zm * S], () => faHjRows(A, o.fam || 'scale', [z0, zm, z1].map(z => [0, y0 * S, z * S, r(z) * S * (o.wide || 1), r(z) * S * (o.kind === 'slug' ? 0.75 : 0.9)]), 4, 14, null,
      { round: [k === 0 ? 0.6 : 0, 0], colf: (t, a, q) => { const z = q[2] / S, p = o.pat ? o.pat(z, a, k) : null; return p || (Math.cos(a) < -0.5 ? c.b : mix(c.a, c.d, 0.15 * faNoise(z * 8, a, 3))); } }));
    if (o.fin && k > 0 && k < N - 1) A.part('seg' + k, [0, y0 * S, zm * S], () => A.cone('membrane', [0, (y0 + r(zm) * 0.8) * S, z0 * S], [0, (y0 + r(zm) * 0.8 + o.fin) * S, zm * S], 0.006 * S, 0.002 * S, c.m || c.d, 4));
  }
  const hz = Z1;
  A.part('head', [0, y0 * S, (hz - 0.04) * S], () => {
    if (o.kind === 'slug') { A.ellip('skin', 0, y0 * S, (hz + 0.04) * S, rm * 0.7 * S * (o.wide || 1), rm * 0.6 * S, 0.1 * S, c.a, { seg: 10 });
      for (const s of [-1, 1]) { A.cone('skin', [s * rm * 0.3 * S, (y0 + rm * 0.4) * S, (hz + 0.05) * S], [s * rm * 0.45 * S, (y0 + rm * 1.3) * S, (hz + 0.12) * S], 0.012 * S, 0.006 * S, c.a, 5); A.ellip('eye', s * rm * 0.45 * S, (y0 + rm * 1.35) * S, (hz + 0.12) * S, 0.02 * S, 0.02 * S, 0.02 * S, o.eyeC || 0xe8e8a0, { seg: 6 }); } }
    else { faHjRows(A, 'scale', [[0, y0, hz - 0.04, rm * 0.7, rm * 0.65], [0, y0, hz + 0.05, rm * 0.75, rm * 0.65], [0, y0 - 0.005, hz + 0.16, rm * 0.5, rm * 0.4], [0, y0 - 0.01, hz + 0.24, rm * 0.3, rm * 0.25]].map(q => q.map(x => x * S)), 8, 12, c.a, { round: [0, 0.2] });
      for (const s of [-1, 1]) A.ellip('eye', s * rm * 0.6 * S, (y0 + rm * 0.25) * S, (hz + 0.1) * S, 0.012 * S, 0.014 * S, 0.014 * S, o.eyeC || 0xe8b81a, { seg: 6 }); }
  });
  A.ellip('skin', 0, 0.004 * S, 0, 0.002 * S, 0.002 * S, 0.002 * S, c.a, { seg: 4 });
  A.anchor('lead', [0, y0 * S, (hz + 0.2) * S]); A.anchor('headRoot', [0, y0 * S, (hz - 0.04) * S]); A.anchor('tailRoot', [0, y0 * S, Z0 * S]);
}

/* the climates of the biomes of this wave */
const FA_WD_NWL = { biomes: ['nwlowlands'], koppen: ['Cfb', 'Cfa'], aridity: ['subhumid', 'humid'], climate: ['temperate'] };
const FA_WD_SWL = { biomes: ['swlowlands'], koppen: ['Af', 'Am'], aridity: ['humid'], climate: ['tropic'] };
const FA_WD_XAN = { biomes: ['xanadu'], koppen: ['ET', 'Dfc', 'BSk'], aridity: ['semiarid', 'arid'], climate: ['cold'] };
const FA_WD_RIFT = { biomes: ['rift'], koppen: ['X'], aridity: ['arid', 'semiarid'], climate: ['temperate'] };
const FA_WD_EBAD = { biomes: ['ebadlands'], koppen: ['BSk', 'BWk'], aridity: ['arid', 'semiarid'], climate: ['temperate', 'cold'] };
const FA_WD_THR = { biomes: ['throne'], koppen: ['Aw', 'BSh', 'Csa', 'H'], aridity: ['subhumid', 'semiarid'], climate: ['tropic', 'temperate'] };
const FA_WD_BIRD = (A, o) => faHiBird(A, Object.assign({}, o, o.c));
const FA_WD_FLAP = { freq: 2.4, amp: 0.4, glide: 0.15, fold: 0.05, sweep: 1.3, foldScale: 0.6, roll: 0.75, tuck: 0.9 };
const FA_WD_NOISE = (a, b, s) => (z, ang, q) => faNoise(q[0] * s, q[1] * s, q[2] * s) > 0.62 ? b : null;

/* ---------------------------------------------------------------- the north-west lowlands */
faWdAnimal(Object.assign({}, FA_WD_NWL, { key: 'lowland-aurochs', name: 'Lowland aurochs', kind: faWdQuad, dim: [0.84, 4.00, 2.32], mass: 900, meat: 450, hide: 5, hideNote: 'thick, dark: coats and tent skins',
  note: 'the wild ox of the north-west lowlands, ancestor of the herds: a tall black bull with forward-curved horns, a pale saddle stripe, and a hump of shoulder', herd: 'herds of twenty, a bull to six cows', life: [4, 25, 1, 280], speed: { walk: 1.2, run: 11 }, aggr: 0.3, flee: 12, temperament: 'defensive', grazePitch: 0.9,
  tags: { temperament: 'defensive' },
  spec: { L: 2.2, bh: 0.42, bw: 0.34, legH: 0.9, hump: 0.12, nk: { len: 0.35, rise: 0.12 }, hd: { len: 0.55, hh: 0.2, hw: 0.17, sn: 0.55, drop: 0.12 }, tl: { kind: 'whip', len: 0.8, w: 0.025 }, ear: { kind: 'round', s: 1.1 }, hn: { kind: 'curve', s: 1.7 }, lt: 0.075, pat: (z, a) => (Math.abs(Math.cos(a)) < 0.2 ? null : (Math.cos(a) > 0.5 && z > -0.5 && z < 0.5 ? 0xb8a888 : null)) },
  variants: [['bull, black with a pale saddle stripe', { a: 0x2a2018, b: 0x4a3a2a, d: 0x1a140e, h: 0xe0d8b8, f: 0x1c1814 }], ['cow, dark brown', { a: 0x4a3222, b: 0x6a5238, d: 0x2a1c12, h: 0xd8d0b0, f: 0x1c1814 }], ['red', { a: 0x8a3a1c, b: 0xb87850, d: 0x4a2010, h: 0xe0d8b8, f: 0x1c1814 }]] }));
faWdAnimal(Object.assign({}, FA_WD_NWL, { key: 'swift-pronghorn', name: 'Swift pronghorn', kind: faWdQuad, dim: [0.32, 1.91, 1.86], mass: 55, meat: 28, hide: 0.8,
  note: 'a slender, forking-horned antelope of the open lowland; it outruns everything on the plain, flashing a white rump patch as it flees', herd: 'bands of a dozen, a buck with his does', life: [2, 11, 1, 250], speed: { walk: 1.5, run: 20 }, flee: 25,
  spec: { L: 1.2, bh: 0.2, bw: 0.15, legH: 0.8, nk: { len: 0.3, rise: 0.3 }, hd: { len: 0.3, hh: 0.09, hw: 0.07, sn: 0.5, drop: 0.06 }, tl: { kind: 'stub', len: 0.1, w: 0.03 }, ear: { kind: 'point', s: 1 }, hn: { kind: 'fork', s: 1 }, lt: 0.03, eyeC: 0x2a1c10,
    pat: (z, a) => (z < -0.35 && Math.cos(a) > -0.2 ? 0xf0ead8 : (Math.cos(a) < -0.3 ? 0xf0ead8 : null)) },
  variants: [['tawny', { a: 0xb08850, b: 0xf0ead8, d: 0x6a4a28, h: 0x2a2018, f: 0x2a2018 }], ['russet', { a: 0x9a5a30, b: 0xf0ead8, d: 0x5a3018, h: 0x2a2018, f: 0x2a2018 }], ['pale', { a: 0xc8a878, b: 0xf6f0e0, d: 0x8a6a40, h: 0x2a2018, f: 0x2a2018 }]] }));
faWdAnimal(Object.assign({}, FA_WD_NWL, { key: 'red-dire-fox', name: 'Red dire-fox', kind: faWdQuad, dim: [0.32, 2.34, 1.21], mass: 40, meat: 14, hide: 0.5, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'wary', activity: 'crepuscular' }, sch: 'hunt',
  note: 'a fox grown to the size of a wolf, the lowlands\' pack hunter of the pronghorn and the calf; it hunts in family parties at dusk and digs great dens', herd: 'a pair and their young', life: [2, 12, 5, 55], speed: { walk: 1.0, run: 13 }, aggr: 0.5, flee: 10, grazePitch: 0.3,
  spec: { L: 1.1, bh: 0.2, bw: 0.14, legH: 0.55, nk: { len: 0.2, rise: 0.1 }, hd: { len: 0.32, hh: 0.09, hw: 0.08, sn: 0.4, drop: 0.04 }, tl: { kind: 'brush', len: 0.7, w: 0.1 }, ear: { kind: 'point', s: 1.4 }, lt: 0.035, foot: 'paw', eyeC: 0xe8c040, pat: (z, a) => (Math.cos(a) < -0.3 ? 0xf0e4d0 : null) },
  variants: [['rust red', { a: 0xb8501e, b: 0xf0e4d0, d: 0x2a1c14, f: 0x2a1c14 }], ['grey', { a: 0x8a8a84, b: 0xe8e4dc, d: 0x2a2a28, f: 0x2a2a28 }], ['dark red', { a: 0x8a3818, b: 0xd8c8b0, d: 0x1a1210, f: 0x1a1210 }]] }));
faWdAnimal(Object.assign({}, FA_WD_NWL, { key: 'marsh-harrier', name: 'Marsh harrier', kind: FA_WD_BIRD, legs: 2, dim: [1.50, 1.00, 0.50], mass: 0.9, meat: 0.3, eggs: 4, sch: 'fly', tags: { diet: 'carnivore', feeding: 'predator', temperament: 'wary', habitat: ['canopy', 'ground', 'marsh'], locomotion: ['flies'], riparian: 'both' },
  note: 'a long-winged hawk that quarters the lowland reedbeds low and slow, taking voles, frogs and nestlings', herd: 'alone, or a pair', life: [2, 14, 4, 32], speed: { walk: 0.4, run: 1, fly: 13 }, gait: { type: 'flyer', freq: 2.2, stride: 0.1 }, data: { wings: 1, flap: FA_WD_FLAP },
  spec: { k: 0.85, bw: 0.9, tailL: 0.42, tailW: 0.05, beakL: 0.08, hook: 0.05, beakW: 0.03, span: 0.75, chord: 1.0 },
  variants: [['female, brown', { body: 0x5a4430, belly: 0xc8a878, head: 0xd8c8a0, wing: 0x4a3a2a, tip: 0x2a2018, tail: 0x6a5a48, beak: 0x2a2a2a, leg: 0xd8c040 }], ['male, grey and brown', { body: 0x6a4a30, belly: 0xe0d8c8, head: 0xb8b8b0, wing: 0x8a8a88, tip: 0x1a1a1a, tail: 0x9a9a98, beak: 0x2a2a2a, leg: 0xd8c040 }]] }));
faWdAnimal(Object.assign({}, FA_WD_NWL, { key: 'giant-beaver', name: 'Giant beaver', kind: faWdQuad, dim: [0.59, 2.09, 0.88], mass: 90, meat: 40, hide: 1.2, hideNote: 'dense fur: hats and collars', tags: { riparian: 'riparian', habitat: ['water', 'shallows', 'marsh'], locomotion: ['swims', 'walks'], feeding: 'browser', temperament: 'defensive' },
  note: 'a beaver as big as a pig, which dams the lowland streams into chains of ponds and fells trees as thick as a man; its flat tail slaps the water as an alarm', herd: 'a lodge of a pair and their young', life: [3, 18, 3, 105], speed: { walk: 0.6, run: 3 }, sch: 'swim', swim: { freq: 0.8, amp: 0.2, axis: 'x' }, data: { swim: { freq: 0.8, amp: 0.2, axis: 'x' } }, grazePitch: 0.4,
  spec: { L: 1.1, bh: 0.3, bw: 0.26, legH: 0.15, nk: { len: 0.12, rise: 0.0 }, hd: { len: 0.32, hh: 0.13, hw: 0.11, sn: 0.7, drop: 0.04 }, tl: { kind: 'flat', len: 0.5, w: 0.13 }, ear: { kind: 'round', s: 0.6 }, lt: 0.06, foot: 'paw', eyeC: 0x1a1008 },
  variants: [['brown', { a: 0x6a4a2a, b: 0x8a6a42, d: 0x2a1c10, f: 0x2a1c10 }], ['dark', { a: 0x3a2a1c, b: 0x5a4430, d: 0x1a120a, f: 0x1a120a }], ['tawny', { a: 0x9a7a4a, b: 0xb89a68, d: 0x4a3a20, f: 0x3a2c18 }]] }));

/* ---------------------------------------------------------------- the south-west lowlands (Dalab) */
faWdAnimal(Object.assign({}, FA_WD_SWL, { key: 'duckbill-browser', name: 'Duckbill browser', kind: faWdQuad, dim: [0.79, 5.59, 2.71], mass: 1800, meat: 700, hide: 8, hideNote: 'pebbled, tough: the Dalab saddlers\' second choice', tags: { feeding: 'browser', habitat: ['ground', 'marsh'], temperament: 'wary' },
  note: 'a big crested, flat-billed saurian of the Dalab marshes and river forest, browsing ferns and leaves; it calls with the crest like a horn', herd: 'herds of thirty on the river flats', life: [6, 40, 20, 80], speed: { walk: 1.4, run: 8 }, flee: 15, gait: { type: 'quadruped', freq: 1.0, stride: 0.6 },
  spec: { fam: 'scale', L: 2.6, bh: 0.5, bw: 0.34, legH: 1.0, nk: { len: 0.55, rise: 0.5 }, hd: { len: 0.55, hh: 0.14, hw: 0.11, sn: 0.8, drop: 0.08 }, bill: true, crest: 0.25, tl: { kind: 'long', len: 1.7, w: 0.22 }, ear: { kind: 'none' }, lt: 0.09, eyeC: 0xe8b81a,
    pat: (z, a) => (Math.sin(z * 14) > 0.7 && Math.cos(a) > 0 ? 0x9a8a38 : null) },
  variants: [['green, banded', { a: 0x5a7a3a, b: 0x9ab070, m: 0xc8a030, d: 0x3a4a22, h: 0xe0d0a0, f: 0x2a2a1a }], ['olive', { a: 0x6a6a38, b: 0xa8a868, m: 0xb86a28, d: 0x3a3a1c, h: 0xe0d0a0, f: 0x2a2a1a }], ['blue-grey', { a: 0x5a6a7a, b: 0xa0aab0, m: 0xd8d0b0, d: 0x2a3440, h: 0xe0d8c0, f: 0x2a2a28 }]] }));
faWdAnimal(Object.assign({}, FA_WD_SWL, { key: 'tricorn', name: 'Tricorn', kind: faWdQuad, dim: [1.61, 4.50, 2.41], mass: 3000, meat: 900, hide: 12, hideNote: 'plates and frill: shields', tags: { temperament: 'aggressive', feeding: 'grazer' },
  note: 'a three-horned, frilled saurian of the Dalab flats, grazing the rank ferns; a bull will charge a cart', herd: 'herds of a dozen with a bull', life: [8, 50, 15, 90], speed: { walk: 1.0, run: 7 }, aggr: 0.6, flee: 6, grazePitch: 0.8,
  spec: { fam: 'scale', L: 2.6, bh: 0.55, bw: 0.45, legH: 0.7, nk: { len: 0.2, rise: 0.04 }, hd: { len: 0.65, hh: 0.2, hw: 0.17, sn: 0.55, drop: 0.12 }, hn: { kind: 'three', s: 1.5 }, frill: 2.0, tl: { kind: 'stub', len: 0.7, w: 0.18 }, ear: { kind: 'none' }, lt: 0.12, eyeC: 0xe87a1a, pat: (z, a) => (Math.cos(a) > 0.6 && z < 0.2 ? 0x8a7a58 : null) },
  variants: [['grey-brown', { a: 0x7a6a50, b: 0xa89878, m: 0xb86a38, d: 0x4a3c28, h: 0xe0d0a8, f: 0x2a2018 }], ['slate', { a: 0x5a626a, b: 0x8a9298, m: 0xc84a2a, d: 0x2a3036, h: 0xe0d8c0, f: 0x2a2a28 }], ['sand', { a: 0xa8905a, b: 0xd0c090, m: 0x8a3a1c, d: 0x6a5430, h: 0xe8e0c0, f: 0x3a2c18 }]] }));
faWdAnimal(Object.assign({}, FA_WD_SWL, { key: 'ridge-raptor', name: 'Ridge raptor', kind: faWdQuad, legs: 2, dim: [0.44, 4.05, 1.95], mass: 160, meat: 60, hide: 1.5, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'aggressive', locomotion: ['walks', 'runs', 'leaps'] }, sch: 'hunt',
  note: 'a two-legged hunter of the Dalab forest edge, running down the duckbills\' young; it hunts in packs and clears a fence', herd: 'a pack of five or six', life: [3, 20, 8, 70], speed: { walk: 1.6, run: 14 }, aggr: 0.8, flee: 3, grazePitch: 0.2, gait: { type: 'biped', freq: 1.8, stride: 0.7 },
  spec: { fam: 'scale', biped: true, L: 1.6, bh: 0.26, bw: 0.17, legH: 0.9, nk: { len: 0.4, rise: 0.4 }, hd: { len: 0.5, hh: 0.13, hw: 0.1, sn: 0.55, drop: 0.04 }, crest: 0.08, tl: { kind: 'long', len: 1.5, w: 0.13 }, ear: { kind: 'none' }, lt: 0.06, foot: 'claw', eyeC: 0xe8c81a, pat: (z, a) => (Math.sin(z * 18) > 0.4 && Math.cos(a) > 0.1 ? 0x2a1a10 : null) },
  variants: [['rust, striped', { a: 0x8a4a2a, b: 0xd8c8a0, m: 0xc86a20, d: 0x2a1a10, f: 0x1c1410 }], ['green, striped', { a: 0x4a6a3a, b: 0xc8d0a0, m: 0xc8a030, d: 0x1a2a14, f: 0x1c1410 }], ['grey', { a: 0x6a6a68, b: 0xc8c8c0, m: 0xa83a2a, d: 0x2a2a28, f: 0x1c1410 }]] }));
faWdAnimal(Object.assign({}, FA_WD_SWL, { key: 'sail-wing', name: 'Sail-wing pterosaur', kind: FA_WD_BIRD, legs: 2, dim: [3.40, 2.20, 1.25], mass: 14, meat: 5, eggs: 2, sch: 'fly', tags: { diet: 'carnivore', feeding: 'predator', habitat: ['sky', 'rock', 'canopy'], locomotion: ['flies', 'glides'], temperament: 'wary' },
  note: 'a leather-winged glider of the Dalab coast and river gorges, fishing from the air; a great crest steers it, and a flock roosts on the cliffs', herd: 'colonies on the sea cliffs', life: [3, 25, 2, 40], speed: { walk: 0.4, run: 1, fly: 14 }, gait: { type: 'flyer', freq: 1.4, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 1.4, glide: 0.4 }) },
  spec: { k: 1.65, bw: 0.7, bodyFam: 'skin', wingFam: 'membrane', crest: 0.4, tailL: 0.1, tailW: 0.02, beakL: 0.38, hook: 0.03, beakW: 0.03, span: 0.95, chord: 0.8 },
  variants: [['grey, orange crest', { body: 0x7a7468, belly: 0xc8c0a8, head: 0xc8c0a8, wing: 0x8a6a4a, tip: 0x4a3a28, tail: 0xc86a2a, beak: 0xd8c898, leg: 0x4a4038 }], ['green', { body: 0x5a7a58, belly: 0xc8d0a8, head: 0xa8b888, wing: 0x6a8a58, tip: 0x2a3a28, tail: 0xe8b81a, beak: 0xd8c898, leg: 0x4a4038 }]] }));
faWdAnimal(Object.assign({}, FA_WD_SWL, { key: 'long-snout-gharial', name: 'Long-snout gharial', kind: faWdQuad, dim: [0.78, 6.15, 0.48], mass: 450, meat: 120, hide: 4, hideNote: 'bellies and flanks: the finest scale leather', tags: { riparian: 'riparian', diet: 'carnivore', feeding: 'predator', habitat: ['water', 'shallows', 'marsh'], locomotion: ['swims', 'walks'], temperament: 'wary', activity: 'cathemeral' },
  note: 'a river crocodilian with a long, narrow, tooth-studded snout, taking fish and the careless drinker; it basks on the sandbars', herd: 'basking rafts of a dozen', life: [8, 50, 40, 85], speed: { walk: 0.5, run: 3 }, sch: 'swim', swim: { freq: 0.5, amp: 0.2, axis: 'x' }, data: { swim: { freq: 0.5, amp: 0.2, axis: 'x' } }, aggr: 0.4, flee: 5, gait: { type: 'sprawl', freq: 0.8, stride: 0.4 }, grazePitch: 0.1,
  spec: { fam: 'scale', stance: 'sprawl', L: 2.6, bh: 0.15, bw: 0.2, legH: 0.12, nk: { len: 0.05, rise: 0.0 }, hd: { len: 1.2, hh: 0.07, hw: 0.1, sn: 0.4, drop: 0.0 }, tl: { kind: 'long', len: 2.2, w: 0.17 }, ear: { kind: 'none' }, lt: 0.05, foot: 'claw', eyeC: 0xe8b81a, pat: (z, a) => (Math.sin(z * 16) > 0.6 && Math.cos(a) > 0 ? 0x2a3418 : null) },
  variants: [['olive', { a: 0x4a5a30, b: 0xc8c8a0, d: 0x2a3418, f: 0x2a3418 }], ['grey-green', { a: 0x5a6a58, b: 0xd0d0b8, d: 0x2a3a2c, f: 0x2a3a2c }], ['brown', { a: 0x6a5a38, b: 0xd8cca0, d: 0x3a2e18, f: 0x3a2e18 }]] }));

/* ---------------------------------------------------------------- Xanadu (the East Rift Highlands) */
faWdAnimal(Object.assign({}, FA_WD_XAN, { key: 'plateau-kiang', name: 'Plateau kiang', kind: faWdQuad, dim: [0.47, 3.41, 2.19], mass: 350, meat: 150, hide: 2,
  note: 'a wild ass of the high plateau, chestnut with a dark dorsal stripe and white belly; it gallops in the thin air for hours', herd: 'bands of forty led by a mare', life: [3, 25, 1, 340], speed: { walk: 1.3, run: 18 }, flee: 30, aggr: 0.2,
  spec: { L: 1.7, bh: 0.3, bw: 0.2, legH: 0.85, nk: { len: 0.42, rise: 0.32 }, hd: { len: 0.46, hh: 0.14, hw: 0.1, sn: 0.5, drop: 0.12 }, tl: { kind: 'whip', len: 0.55, w: 0.025 }, ear: { kind: 'long', s: 1.3 }, lt: 0.045, eyeC: 0x2a1c10,
    pat: (z, a) => (Math.cos(a) > 0.92 ? 0x3a2a1c : (Math.cos(a) < -0.25 ? 0xf0ead8 : null)) },
  variants: [['chestnut', { a: 0x9a6a3a, b: 0xf0ead8, d: 0x4a3018, f: 0x2a2018 }], ['sandy', { a: 0xb89860, b: 0xf4eedc, d: 0x6a5230, f: 0x2a2018 }], ['grey-brown', { a: 0x8a7a68, b: 0xeee8d8, d: 0x4a4034, f: 0x2a2018 }]] }));
faWdAnimal(Object.assign({}, FA_WD_XAN, { key: 'cloud-leopard', name: 'Cloud leopard', kind: faWdQuad, dim: [0.38, 2.88, 0.96], mass: 60, meat: 22, hide: 1.2, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'wary', activity: 'crepuscular', habitat: ['ground', 'rock'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] }, sch: 'hunt',
  note: 'a pale, cloud-blotched hunter of the Xanadu crags, taking the kiang\'s foals and the cliff goats; it stalks from above', herd: 'alone', life: [3, 14, 2, 95], speed: { walk: 1.2, run: 15 }, aggr: 0.7, flee: 4, grazePitch: 0.2,
  spec: { L: 1.3, bh: 0.2, bw: 0.15, legH: 0.38, nk: { len: 0.18, rise: 0.08 }, hd: { len: 0.27, hh: 0.1, hw: 0.09, sn: 0.62, drop: 0.04 }, tl: { kind: 'long', len: 1.1, w: 0.06 }, ear: { kind: 'round', s: 1 }, lt: 0.05, foot: 'paw', eyeC: 0xe8d040, pat: FA_WD_NOISE(0, 0x2a2824, 9) },
  variants: [['grey cloud', { a: 0xa8a49a, b: 0xe0dcd0, d: 0x2a2824, f: 0x2a2824 }], ['tawny cloud', { a: 0xb89a68, b: 0xe8dcc0, d: 0x3a2c1c, f: 0x3a2c1c }], ['dark', { a: 0x5a5650, b: 0x9a968a, d: 0x1a1816, f: 0x1a1816 }]] }));
faWdAnimal(Object.assign({}, FA_WD_XAN, { key: 'bone-eater', name: 'Bone-eater', kind: FA_WD_BIRD, legs: 2, dim: [2.50, 1.70, 0.90], mass: 6, meat: 2, eggs: 2, sch: 'fly', tags: { diet: 'carnivore', feeding: 'scavenger', habitat: ['rock', 'sky', 'ground'], locomotion: ['flies', 'glides'], temperament: 'wary' },
  note: 'a vulture-sized bearded raptor of the plateau cliffs, which carries bones aloft and drops them on the rocks to reach the marrow', herd: 'a pair at a cliff eyrie', life: [5, 35, 1, 54], speed: { walk: 0.4, run: 1, fly: 15 }, gait: { type: 'flyer', freq: 1.8, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 1.8, glide: 0.4 }) },
  spec: { k: 1.45, bw: 0.9, tailL: 0.5, tailW: 0.04, beakL: 0.1, hook: 0.07, beakW: 0.035, span: 0.8, chord: 0.9 },
  variants: [['grey-brown, buff head', { body: 0xe0b878, belly: 0xe8c898, head: 0xe8dcc0, wing: 0x4a4440, tip: 0x2a2624, tail: 0x5a5450, beak: 0x6a6a68, leg: 0x4a4440 }], ['dark', { body: 0xc8883a, belly: 0xd8a860, head: 0xd8c8a8, wing: 0x3a3430, tip: 0x1a1816, tail: 0x4a4440, beak: 0x6a6a68, leg: 0x4a4440 }]] }));
faWdAnimal(Object.assign({}, FA_WD_XAN, { key: 'ice-lake-char', name: 'Ice-lake char', kind: faWdFish, legs: 0, dim: [0.40, 1.20, 0.25], mass: 12, meat: 8, sch: 'swim', tags: { riparian: 'riparian', habitat: ['water', 'deep water'], locomotion: ['swims'], diet: 'carnivore', feeding: 'predator', temperament: 'skittish' },
  note: 'a big, cold-water char of the Xanadu lakes, red-bellied and spotted, which runs up the glacier streams to spawn', herd: 'shoals', life: [4, 20, 3000, 120], speed: { walk: 0.6, run: 3 }, gait: { type: 'swimmer', freq: 0.8, stride: 0 }, data: { swim: { freq: 0.8, amp: 0.3 } }, grazePitch: 0,
  spec: { L: 1.1, hh: 0.13, fin: 0.5, fork: 0.3, pat: (t, a) => (Math.cos(a) > -0.4 && faNoise(t * 30, a * 3, 2) > 0.7 ? 0xe8d8a8 : null) },
  variants: [['red-bellied', { a: 0x3a4a3a, b: 0xe85a2a, m: 0xc8883a, d: 0x2a3a2a }], ['silver', { a: 0x5a6a68, b: 0xe0e4dc, m: 0xa8b0a8, d: 0x3a4a48 }]] }));

/* ---------------------------------------------------------------- the Rift (alien) */
faWdAnimal(Object.assign({}, FA_WD_RIFT, { key: 'lichen-cropper', name: 'Lichen-cropper', kind: faWdQuad, dim: [1.02, 2.74, 1.41], mass: 400, meat: 120, hide: 3, hideNote: 'plated: stiff, mottled', tags: { feeding: 'grazer', habitat: ['ground', 'rock'], temperament: 'docile' },
  note: 'a squat, domed, plated browser of the Rift floor that shaves the crust\'s lichen mats with a horny beak; the lichen grows back over its own shell', herd: 'slow bands of twenty, grazing in a line', life: [5, 40, 2, 200], speed: { walk: 0.5, run: 2.5 }, flee: 4,
  spec: { fam: 'chitin', shell: true, L: 1.8, bh: 0.34, bw: 0.4, legH: 0.5, nk: { len: 0.2, rise: 0.0 }, hd: { len: 0.4, hh: 0.14, hw: 0.16, sn: 0.5, drop: 0.1 }, tl: { kind: 'stub', len: 0.3, w: 0.1 }, ear: { kind: 'none' }, lt: 0.1, foot: 'claw', eyeC: 0xa8ff88 },
  variants: [['grey-green', { a: 0x6a7a62, b: 0x8a9a7a, d: 0x4a5a48, h: 0xc8c8a8, f: 0x2a2a28 }], ['violet', { a: 0x6a5a7a, b: 0x8a7a9a, d: 0x4a3a58, h: 0xc8b8d0, f: 0x2a2630 }], ['ochre', { a: 0x8a7a48, b: 0xa89a68, d: 0x5a4a28, h: 0xd8c8a0, f: 0x2a2418 }]] }));
faWdAnimal(Object.assign({}, FA_WD_RIFT, { key: 'slime-grazer', name: 'Slime-grazer', kind: faWdSerpent, legs: 0, dim: [1.2, 2.2, 0.8], mass: 200, meat: 0, tags: { feeding: 'detritivore', habitat: ['ground', 'rock', 'marsh'], locomotion: ['walks'], temperament: 'docile' }, gait: { type: 'multipede', freq: 0.5, stride: 0.1 },
  note: 'a vast, translucent slug-like mat-eater of the Rift floor, grazing the luminous slime films; its eyes ride on stalks and it glides on a tide of mucus', herd: 'drifts of a dozen on a wet slope', life: [2, 20, 40, 60], speed: { walk: 0.3, run: 1 }, data: { segs: 8, chain: { amp: 0.06, wave: 1.2 } }, grazePitch: 0.2,
  spec: { kind: 'slug', fam: 'skin', N: 8, L: 2.0, rmax: 0.34, wide: 1.25, eyeC: 0xe8ff88, pat: (z, a, k) => (Math.cos(a) > 0.4 && faNoise(z * 9, a * 2, 5) > 0.55 ? 0xa8ffd0 : null) },
  variants: [['green, glowing', { a: 0x6ad88a, b: 0xb8f0c8, d: 0x3a9a58 }], ['blue', { a: 0x5a9ad8, b: 0xb0d0f0, d: 0x2a5a98 }], ['amber', { a: 0xd8a85a, b: 0xf0d8a8, d: 0x98682a }]] }));
faWdAnimal(Object.assign({}, FA_WD_RIFT, { key: 'rift-stalker', name: 'Rift stalker', kind: faWdQuad, dim: [0.33, 3.74, 2.09], mass: 120, meat: 30, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'aggressive', activity: 'nocturnal', habitat: ['ground', 'rock'] }, sch: 'hunt',
  note: 'a tall, thin-legged, bioluminescent hunter of the Rift, running down the croppers; its long jaw glows to draw moth-things, and it keeps to the dark', herd: 'alone', life: [3, 20, 2, 90], speed: { walk: 1.4, run: 14 }, aggr: 0.8, flee: 3, grazePitch: 0.2,
  spec: { fam: 'chitin', L: 1.4, bh: 0.2, bw: 0.12, legH: 1.0, nk: { len: 0.5, rise: 0.5 }, hd: { len: 0.55, hh: 0.09, hw: 0.08, sn: 0.3, drop: 0.12 }, tl: { kind: 'whip', len: 1.0, w: 0.03 }, ear: { kind: 'none' }, lt: 0.04, foot: 'claw', eyeC: 0x6aff9a, pat: (z, a, q) => (faNoise(q[0] * 14, q[1] * 14, q[2] * 14) > 0.7 ? 0x6aff9a : null) },
  variants: [['violet, green-lit', { a: 0x2a1a3a, b: 0x4a3a5a, d: 0x120a1a, f: 0x120a1a }], ['black, blue-lit', { a: 0x161820, b: 0x2a2e3a, d: 0x0a0a10, f: 0x0a0a10 }]] }));
faWdAnimal(Object.assign({}, FA_WD_RIFT, { key: 'glow-wing', name: 'Glow-wing', kind: FA_WD_BIRD, legs: 2, dim: [2.00, 1.10, 0.55], mass: 2, sch: 'fly', tags: { diet: 'carnivore', feeding: 'insectivore', activity: 'nocturnal', habitat: ['sky', 'rock'], locomotion: ['flies', 'glides'], temperament: 'skittish' },
  note: 'a bat-like leather-winged flyer of the Rift\'s dark, its wing veins and crest glowing; it feeds on the moth-things that the stalkers draw', herd: 'swarms at the cave mouths', life: [1, 8, 1, 60], speed: { walk: 0.3, run: 0.6, fly: 11 }, gait: { type: 'flyer', freq: 2.8, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 2.8 }) },
  spec: { k: 1.0, bw: 0.7, bodyFam: 'skin', wingFam: 'membrane', crest: 0.25, tailL: 0.2, tailW: 0.03, beakL: 0.14, hook: 0, beakW: 0.025, span: 0.9, chord: 0.7 },
  variants: [['violet, green veins', { body: 0x2a1a3a, belly: 0x4a3a5a, head: 0x3a2a4a, wing: 0x3a2a5a, tip: 0x6aff9a, tail: 0x6aff9a, wingBand: 0x6aff9a, beak: 0x1a1020, leg: 0x1a1020 }], ['black, blue veins', { body: 0x161820, belly: 0x2a2e3a, head: 0x1a1c24, wing: 0x1a2a4a, tip: 0x6ab8ff, tail: 0x6ab8ff, wingBand: 0x6ab8ff, beak: 0x0a0a10, leg: 0x0a0a10 }]] }));
faWdAnimal(Object.assign({}, FA_WD_RIFT, { key: 'acid-pool-eel', name: 'Acid-pool eel', kind: faWdSerpent, legs: 0, dim: [0.28, 2.20, 0.33], mass: 20, meat: 0, tags: { riparian: 'riparian', diet: 'carnivore', feeding: 'predator', habitat: ['water', 'shallows'], locomotion: ['swims'], temperament: 'defensive', activity: 'nocturnal' }, sch: 'swim', gait: { type: 'multipede', freq: 0.8, stride: 0.1 },
  note: 'a long, acid-proof eel of the Rift\'s hot, sour pools, striped in warning, which strikes at anything that wades; it glows faintly', herd: 'a tangle in each pool', life: [2, 15, 30, 40], speed: { walk: 0.4, run: 2 }, data: { segs: 10, chain: { amp: 0.1, wave: 1.0 }, swim: { freq: 0.8, amp: 0.2 } }, grazePitch: 0.1,
  spec: { kind: 'eel', N: 10, L: 1.9, rmax: 0.08, y0: 0.06, fin: 0.1, eyeC: 0xffffff, pat: (z, a) => (Math.sin(z * 22) > 0.4 ? 0xc8ff3a : null) },
  variants: [['green, yellow-striped', { a: 0x3a5a2a, b: 0xa8c870, m: 0xc8ff3a, d: 0x1a2a14 }], ['red, black-striped', { a: 0xa83a2a, b: 0xe8a888, m: 0x2a1010, d: 0x5a1a10 }]] }));

/* ---------------------------------------------------------------- the eastern badlands */
faWdAnimal(Object.assign({}, FA_WD_EBAD, { key: 'badland-bighorn', name: 'Badland bighorn', kind: faWdQuad, dim: [0.79, 1.84, 1.47], mass: 110, meat: 55, hide: 1.2, tags: { feeding: 'grazer', habitat: ['rock', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'], temperament: 'wary' },
  note: 'a thick-set mountain sheep of the badland scarps, the ram\'s great spiral horns clashing at the rut; it crosses a cliff a goat would balk at', herd: 'bands of fifteen, rams apart', life: [3, 14, 1, 175], speed: { walk: 1.2, run: 12 }, flee: 20, aggr: 0.3,
  spec: { L: 1.1, bh: 0.26, bw: 0.19, legH: 0.6, nk: { len: 0.28, rise: 0.16 }, hd: { len: 0.34, hh: 0.12, hw: 0.1, sn: 0.5, drop: 0.08 }, tl: { kind: 'stub', len: 0.1, w: 0.04 }, ear: { kind: 'point', s: 0.7 }, hn: { kind: 'curl', s: 1.4 }, lt: 0.045, eyeC: 0xc8a030, pat: (z, a) => (z < -0.35 && Math.cos(a) > -0.4 ? 0xf0e8d8 : null) },
  variants: [['tan, white rump', { a: 0x9a7a52, b: 0xf0e8d8, d: 0x5a4a2c, h: 0xb8a070, f: 0x2a2018 }], ['grey-brown', { a: 0x7a6a58, b: 0xe8e0d0, d: 0x4a3e30, h: 0xa89870, f: 0x2a2018 }], ['rust', { a: 0x8a5a38, b: 0xe8d8c0, d: 0x4a2c18, h: 0xb89868, f: 0x2a2018 }]] }));
faWdAnimal(Object.assign({}, FA_WD_EBAD, { key: 'badland-cougar', name: 'Badland cougar', kind: faWdQuad, dim: [0.38, 2.80, 1.00], mass: 70, meat: 25, hide: 1.3, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'wary', activity: 'crepuscular', habitat: ['rock', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] }, sch: 'hunt',
  note: 'a tawny, lean mountain cat of the badlands, which ambushes the bighorn from the ledges and drags its kills into the rocks', herd: 'alone', life: [3, 13, 3, 92], speed: { walk: 1.2, run: 16 }, aggr: 0.7, flee: 4, grazePitch: 0.2,
  spec: { L: 1.3, bh: 0.2, bw: 0.15, legH: 0.42, nk: { len: 0.2, rise: 0.08 }, hd: { len: 0.27, hh: 0.1, hw: 0.09, sn: 0.62, drop: 0.04 }, tl: { kind: 'long', len: 1.0, w: 0.055 }, ear: { kind: 'round', s: 1 }, lt: 0.05, foot: 'paw', eyeC: 0xc8c840, pat: (z, a) => (Math.cos(a) < -0.4 ? 0xe8dcc0 : null) },
  variants: [['tawny', { a: 0xb89860, b: 0xe8dcc0, d: 0x3a2c1c, f: 0x3a2c1c }], ['grey', { a: 0x8a8678, b: 0xd8d4c4, d: 0x2a2824, f: 0x2a2824 }]] }));
faWdAnimal(Object.assign({}, FA_WD_EBAD, { key: 'carrion-condor', name: 'Carrion condor', kind: FA_WD_BIRD, legs: 2, dim: [3.00, 1.60, 0.90], mass: 12, meat: 3, eggs: 1, sch: 'fly', tags: { diet: 'carnivore', feeding: 'scavenger', habitat: ['sky', 'rock', 'ground'], locomotion: ['flies', 'glides'], temperament: 'wary' },
  note: 'a huge bald-headed scavenger that rides the badland thermals for days, finding the dead by sight and circling', herd: 'kettles of a dozen over a carcass', life: [6, 50, 1, 56], speed: { walk: 0.5, run: 1, fly: 14 }, gait: { type: 'flyer', freq: 1.4, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 1.4, glide: 0.5 }) },
  spec: { k: 1.6, bw: 1.0, tailL: 0.3, tailW: 0.05, beakL: 0.1, hook: 0.08, beakW: 0.04, span: 0.85, chord: 1.0 },
  variants: [['black, pale ruff', { body: 0x1e1c1a, belly: 0x2a2826, head: 0xc8886a, wing: 0x2a2826, tip: 0xc8c8c0, tail: 0x1e1c1a, beak: 0xd8d0b8, leg: 0xc8c0b0 }], ['dark brown', { body: 0x3a2e24, belly: 0x4a3c30, head: 0xd89888, wing: 0x4a3c30, tip: 0xe0d8c8, tail: 0x2a2018, beak: 0xd8d0b8, leg: 0xc8c0b0 }]] }));
faWdAnimal(Object.assign({}, FA_WD_EBAD, { key: 'giant-spadefoot', name: 'Giant spadefoot toad', kind: faWdQuad, dim: [0.82, 0.77, 0.54], mass: 8, meat: 3, tags: { riparian: 'both', diet: 'carnivore', feeding: 'insectivore', habitat: ['burrow', 'marsh', 'shallows', 'ground'], locomotion: ['walks', 'leaps', 'burrows'], temperament: 'skittish', activity: 'nocturnal' }, sch: 'swim', gait: { type: 'sprawl', freq: 1.0, stride: 0.3 },
  note: 'a dinner-plate toad that sleeps buried in the badland clay for years and surfaces with the flash-flood, to breed in an afternoon in the temporary pools; its spade feet dig it in again', herd: 'thousands at a storm pool, solitary the rest of the time', life: [3, 25, 3000, 5], speed: { walk: 0.3, run: 1.5 }, grazePitch: 0.1,
  spec: { fam: 'skin', stance: 'sprawl', L: 0.5, bh: 0.18, bw: 0.22, legH: 0.1, nk: { len: 0.02, rise: 0.0 }, hd: { len: 0.2, hh: 0.12, hw: 0.17, sn: 0.9, drop: 0.02 }, tl: { kind: 'none' }, ear: { kind: 'none' }, lt: 0.05, eyeC: 0xe8b81a, pat: (z, a, q) => (faNoise(q[0] * 25, q[1] * 25, q[2] * 25) > 0.66 ? 0x5a4a28 : null) },
  variants: [['clay brown', { a: 0x8a7a4a, b: 0xd8d0a0, d: 0x4a3c20, f: 0x4a3c20 }], ['olive', { a: 0x6a7a42, b: 0xd0d8a8, d: 0x3a4a22, f: 0x3a4a22 }], ['red clay', { a: 0x9a5a3a, b: 0xe0c8a0, d: 0x5a2c1a, f: 0x5a2c1a }]] }));

/* ---------------------------------------------------------------- the Throne and the geyser fields */
faWdAnimal(Object.assign({}, FA_WD_THR, { key: 'kipuka-tortoise', name: 'Kipuka tortoise', kind: faWdQuad, dim: [0.67, 1.58, 0.72], mass: 260, meat: 80, hide: 1, hideNote: 'the shell: bowls and shields', tags: { feeding: 'grazer', habitat: ['ground', 'rock'], temperament: 'docile', locomotion: ['walks'] },
  note: 'a domed tortoise of the Throne\'s kipukas, the islands of old forest in the lava fields, where it grazes the green and sleeps through the ash-falls under its shell', herd: 'a few to a kipuka', life: [20, 150, 20, 130], speed: { walk: 0.25, run: 0.8 }, flee: 2,
  spec: { fam: 'scale', shell: true, L: 1.0, bh: 0.2, bw: 0.26, legH: 0.18, nk: { len: 0.2, rise: 0.02 }, hd: { len: 0.25, hh: 0.09, hw: 0.07, sn: 0.65, drop: 0.0 }, tl: { kind: 'stub', len: 0.12, w: 0.05 }, ear: { kind: 'none' }, lt: 0.07, foot: 'claw', eyeC: 0x2a1c10 },
  variants: [['ash grey', { a: 0x7a7a60, b: 0x9a9a78, d: 0x4a4640, h: 0xc8c0a8, f: 0x2a2820 }], ['black', { a: 0x4a4a40, b: 0x6a6a58, d: 0x24221e, h: 0xb8b0a0, f: 0x1a1816 }], ['pale', { a: 0x9a9a78, b: 0xb8b890, d: 0x8a826a, h: 0xd8d0b8, f: 0x3a3828 }]] }));
faWdAnimal(Object.assign({}, FA_WD_THR, { key: 'ash-goat', name: 'Ash goat', kind: faWdQuad, dim: [0.64, 1.67, 1.55], mass: 60, meat: 28, hide: 0.9, tags: { feeding: 'mixed', habitat: ['rock', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'], temperament: 'wary' },
  note: 'a wild goat of the Throne\'s ash slopes, grey as the ash it browses, with long scimitar horns; it climbs the cinder cones and crosses the lava', herd: 'bands of twenty on a flank', life: [2, 14, 2, 150], speed: { walk: 1.1, run: 11 }, flee: 15,
  spec: { L: 1.0, bh: 0.22, bw: 0.16, legH: 0.55, nk: { len: 0.25, rise: 0.14 }, hd: { len: 0.3, hh: 0.1, hw: 0.08, sn: 0.55, drop: 0.08 }, tl: { kind: 'stub', len: 0.1, w: 0.04 }, ear: { kind: 'point', s: 0.9 }, hn: { kind: 'curve', s: 1.5 }, lt: 0.04, eyeC: 0xc8a030, pat: (z, a) => (Math.cos(a) < -0.3 ? 0xd8d4cc : null) },
  variants: [['ash grey', { a: 0x8a8680, b: 0xd8d4cc, d: 0x4a4640, h: 0x2a2824, f: 0x1a1816 }], ['dun', { a: 0x9a8a6a, b: 0xe0d8c0, d: 0x5a4c30, h: 0x3a3028, f: 0x2a2018 }], ['black', { a: 0x3a3836, b: 0x6a6866, d: 0x1a1816, h: 0x6a6258, f: 0x0a0a08 }]] }));
faWdAnimal(Object.assign({}, FA_WD_THR, { key: 'vent-hunter', name: 'Vent hunter', kind: faWdQuad, dim: [0.96, 3.80, 0.68], mass: 200, meat: 0, hide: 3, tags: { diet: 'carnivore', feeding: 'predator', temperament: 'aggressive', activity: 'cathemeral', habitat: ['rock', 'ground'], locomotion: ['walks', 'runs'] }, sch: 'hunt',
  note: 'a heavy black lava-lizard of the Throne\'s vent country, its cracks glowing orange from the heat it basks in; it ambushes the goats at the geyser pools', herd: 'alone', life: [6, 35, 10, 90], speed: { walk: 0.8, run: 7 }, aggr: 0.8, flee: 3, gait: { type: 'sprawl', freq: 1.0, stride: 0.5 }, grazePitch: 0.2,
  spec: { fam: 'scale', stance: 'sprawl', L: 1.7, bh: 0.2, bw: 0.22, legH: 0.18, nk: { len: 0.15, rise: 0.04 }, hd: { len: 0.5, hh: 0.12, hw: 0.11, sn: 0.5, drop: 0.03 }, tl: { kind: 'long', len: 1.4, w: 0.17 }, ear: { kind: 'none' }, lt: 0.06, foot: 'claw', eyeC: 0xff8a1a, pat: (z, a, q) => (faNoise(q[0] * 12, q[1] * 12, q[2] * 12) > 0.64 ? 0xff7a2a : null) },
  variants: [['black, orange-cracked', { a: 0x2a2420, b: 0x4a3c34, d: 0x120e0c, f: 0x120e0c }], ['grey, red-cracked', { a: 0x4a4644, b: 0x6a6460, d: 0x1c1a18, f: 0x1c1a18 }]] }));
faWdAnimal(Object.assign({}, FA_WD_THR, { biomes: ['throne', 'ringsea', 'geyser'], key: 'pumice-petrel', name: 'Pumice petrel', kind: FA_WD_BIRD, legs: 2, dim: [1.70, 0.90, 0.50], mass: 1.5, meat: 0.5, eggs: 1, sch: 'fly', tags: { diet: 'carnivore', feeding: 'predator', habitat: ['sky', 'rock', 'water'], locomotion: ['flies', 'glides', 'swims'], temperament: 'skittish', riparian: 'both' },
  note: 'a pale grey seabird that nests in the pumice banks of the Throne\'s coast and fishes the Ring Sea; it skims the ash-clouds without fear', herd: 'colonies of thousands on the pumice cliffs', life: [4, 30, 1, 52], speed: { walk: 0.4, run: 1, fly: 16 }, gait: { type: 'flyer', freq: 2.0, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 2.0, glide: 0.4 }) },
  spec: { k: 0.88, bw: 0.85, tailL: 0.22, tailW: 0.04, beakL: 0.1, hook: 0.04, beakW: 0.028, span: 0.9, chord: 0.8 },
  variants: [['pale grey', { body: 0xb8bcc0, belly: 0xf0f0ee, head: 0xe8e8e6, wing: 0x8a9096, tip: 0x2a2e32, tail: 0x8a9096, beak: 0xd8a830, leg: 0xc87a5a }], ['dark phase', { body: 0x5a5e62, belly: 0xa8acb0, head: 0x8a8e92, wing: 0x4a4e52, tip: 0x1a1e22, tail: 0x4a4e52, beak: 0x3a3a38, leg: 0x3a3a38 }]] }));
faWdAnimal(Object.assign({}, FA_WD_THR, { biomes: ['geyser', 'throne'], key: 'steam-kite', name: 'Steam kite', kind: FA_WD_BIRD, legs: 2, dim: [2.00, 1.20, 0.60], mass: 1.2, meat: 0.4, eggs: 2, sch: 'fly', tags: { diet: 'carnivore', feeding: 'predator', habitat: ['sky', 'rock'], locomotion: ['flies', 'glides'], temperament: 'wary' },
  note: 'a long-winged kite that rides the geyser plumes, climbing the warm air and stooping on the stunned insects and fish the vents throw up', herd: 'a pair to a vent', life: [3, 20, 2, 36], speed: { walk: 0.4, run: 1, fly: 14 }, gait: { type: 'flyer', freq: 1.6, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_WD_FLAP, { freq: 1.6, glide: 0.5 }) },
  spec: { k: 1.1, bw: 0.8, tailL: 0.4, tailW: 0.06, beakL: 0.08, hook: 0.06, beakW: 0.03, span: 0.85, chord: 0.8 },
  variants: [['white and grey', { body: 0xe8e8e4, belly: 0xf8f8f4, head: 0xf0f0ec, wing: 0x9a9a98, tip: 0x1a1a1a, tail: 0xe0e0dc, beak: 0x2a2a2a, leg: 0xd8b840 }], ['rust-washed', { body: 0xd8c8b0, belly: 0xf0e0c8, head: 0xe8dcc8, wing: 0x8a6a4a, tip: 0x2a1c10, tail: 0xb8683a, beak: 0x2a2a2a, leg: 0xd8b840 }]] }));
faWdAnimal(Object.assign({}, FA_WD_THR, { biomes: ['geyser', 'throne'], key: 'steam-newt', name: 'Steam newt', kind: faWdQuad, dim: [0.47, 1.04, 0.26], mass: 4, meat: 0, tags: { riparian: 'riparian', diet: 'carnivore', feeding: 'insectivore', habitat: ['water', 'shallows', 'marsh'], locomotion: ['swims', 'walks'], temperament: 'skittish', activity: 'cathemeral' }, sch: 'swim', gait: { type: 'sprawl', freq: 1.2, stride: 0.2 },
  note: 'a red-orange newt as long as a forearm that lives in the warm margins of the geyser pools, tolerating water too hot for its prey; it bleeds a bitter fluid when handled', herd: 'dozens in a pool', life: [2, 15, 80, 40], speed: { walk: 0.3, run: 1.2 }, data: { swim: { freq: 1.0, amp: 0.25 } }, grazePitch: 0.1,
  spec: { fam: 'skin', stance: 'sprawl', L: 0.4, bh: 0.08, bw: 0.09, legH: 0.06, nk: { len: 0.05, rise: 0.0 }, hd: { len: 0.14, hh: 0.06, hw: 0.07, sn: 0.8, drop: 0.0 }, tl: { kind: 'long', len: 0.45, w: 0.05 }, ear: { kind: 'none' }, lt: 0.02, foot: 'claw', eyeC: 0x1a1008, pat: (z, a, q) => (faNoise(q[0] * 30, q[1] * 30, q[2] * 30) > 0.68 ? 0x2a1010 : null) },
  variants: [['orange', { a: 0xe8502a, b: 0xf0c870, d: 0x8a2a14, f: 0x8a2a14 }], ['yellow', { a: 0xe8c02a, b: 0xf8e8a0, d: 0xa8801a, f: 0xa8801a }], ['crimson', { a: 0xb82a1a, b: 0xe89a68, d: 0x5a1210, f: 0x5a1210 }]] }));
