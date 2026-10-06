/* kits/fauna bundle (fauna_bundle.py): fauna-core.js, krator-fauna-abyss.js, krator-fauna-bay.js, krator-fauna-crawlers.js, krator-fauna-desert.js, krator-fauna-farm.js, krator-fauna-flyers.js, krator-fauna-hyperjungle.js, krator-fauna-livestock.js, krator-fauna-mounts.js, krator-fauna-voth.js, krator-fauna-runtime.js. GENERATED; edit the kit files. */
var KratorFauna = (function () {
/* ---- kits/fauna/fauna-core.js ---- */
/* ======================================================================
   Krator Fauna: the kit core (kits/fauna/fauna-core.js)

   ONE kit for every animal of Krator (biomes/README.md, "a fauna kit": the owner's call, 2026-10), the way furniture
   is one catalog. An animal is an ANIMAL({...}) entry: data first (tags by biome and climate, harvest and edibility,
   the life layer's numbers), then a build(A) that draws it as PARTS a host can move (body, head, tail, legs), each
   with its own pivot. fauna_bundle.py wraps this file, the species files (krator-fauna-<group>.js) and
   krator-fauna-runtime.js in ONE closure exposing only `KratorFauna`; nothing here meets a host's globals.
   It needs only a global THREE (r128).

   The entry:
     ANIMAL({
       key, name, group,                    group: the species file's group (livestock, mounts ...)
       tags: { biomes:[...], koppen:[...], aridity:[...], climate:[...], riparian:'non'|'riparian'|'both', abyssal:false,
               domestic:true|false, herdedBy:[cultures],
               diet:'herbivore'|'carnivore'|'omnivore', feeding:'grazer'|'browser'|'mixed'|'predator'|'scavenger'|'insectivore'|...,
               activity:'diurnal'|'nocturnal'|'crepuscular'|'cathemeral',
               temperament:'skittish'|'wary'|'docile'|'defensive'|'aggressive' },   (README: tag by biome, harvest, edibility)
       traits: { edible, milkable, tameable, rideable, draught, eggs },   booleans: what a people can do with it (eggs: edible eggs)
       yields: { meat, milk, eggs, hide, hair, wool, feathers, ivory, horn },   amounts per adult, the unit in the key's rule
               (FAUNA_YIELDS): meat kg dressed; milk L a day in milk; eggs a year; hide count a year (the animal's own: 1
               when slaughtered) and its area in m2 as hideM2; hair, wool, feathers kg a year (shorn or moulted); ivory,
               horn kg each animal. 0 or absent: none. A value may be an object { amount, note }.
       life: { maturity (years to breeding age), lifespan (years), litter (young per birth), gestation (days) },
       tags.habitat: [ground, rock, canopy, trunks, sky, water, shallows, deep water, marsh, burrow, pen],
       tags.locomotion: [walks, runs, climbs, flies, glides, swims, wades, burrows, leaps],
       size: { length, height, span } metres of an adult (span for a flyer); data.sizeRange [min, max] scale a world may vary
       source: [{ build, file, lines, note }]   where the animal came from (the build that first drew it), for the port
       data.gait: { type (FAUNA_VOCAB.gait), freq, stride }; data.legs (number of leg parts, default 4); data.wings (pairs);
       data.flap: { freq, amp, glide }; data.swim: { freq, amp }
       temperament: also data: fleeDistance (m: a skittish animal bolts at this range), aggression 0..1,
       variants, variantNames, variantDims: [{w,d,h}],               per variant (a kid is smaller)
       breeds: { name: { scale, ...data } },                         optional: one build at several sizes (salamanders)
       w, d, h,                              the overall box (metres) of variant 0 / breed 1.0
       data: { mass, speed:{walk,run}, gait:{type:'quadruped'|'sprawl', stride, freq}, herd, activity, schedule[24] },
       build(A)                              A: the animal frame (below); A.variant, A.breed, A.S (scale), A.pose, A.rnd
     })

   The animal frame: origin on the ground under the middle of the body, +z FORWARD (the snout), y up, x its left
   (three.js yaw). Metres. Colours are sRGB hex or [r,g,b] 0..1 sRGB; the builder writes LINEAR floats.
     A.part(name, pivot[x,y,z], fn)     geometry drawn inside fn belongs to part `name`, which turns about `pivot`.
                                        Names the runtime animates: body, head, tail, jaw, earL, earR; legs leg0..legN
                                        (pairs front to back, left then right: 0 front left, 1 front right, 2 next left ...);
                                        wings wingL, wingR (a second pair wing2L, wing2R), flapping about z at their roots;
                                        body segments seg0..segN (a millipede, a swimmer's tail), weaving about y. Unnamed: body.
     A.tube(fam, c(t)->[x,y,z], rad(t)->[hw,hh], nt, ns, col, o)   a skin along a curve (o.caps, o.colf(t, angle))
     A.ellip(fam, x,y,z, rx,ry,rz, col, o)   o.rx/o.ry/o.rz: rotation (YXZ); o.seg
     A.cone(fam, a, b, r0, r1, col, seg)     a tapered rod from a to b
     A.locks(fam, list)                      hanging hair: list of {at:[x,y,z], dir:[x,y,z], len, w, col}: each a tapered
                                             double-sided strip that curls a little at its tip
     A.sheet(fam, f(u,v)->[x,y,z], nu, nv, col, o)   a free surface (a coat's skirt), o.colf(u,v)
     A.anchor(name, [x,y,z])                 a point a host fits tack to (saddle, bridle ...), in the animal frame
     A.profile(fn)                           a body profile function a host reads (the salamander's, for its saddles)
   Families (materials): coat (short fur), hair (long hair, double-sided), skin, horn, hoof, eye, mouth, plain.
   ====================================================================== */
const TAU = Math.PI * 2;
const FAUNA_FAMILIES = ['coat', 'hair', 'skin', 'horn', 'hoof', 'eye', 'mouth', 'plain', 'chitin', 'membrane', 'glow', 'scale', 'sleek', 'feather', 'shag'];
/* the vocabularies a tag is checked against (verify.py --assert) */
const FAUNA_VOCAB = {
  aridity: ['arid', 'semiarid', 'subhumid', 'humid'],
  climate: ['hypertropic', 'tropic', 'temperate', 'cold'],
  riparian: ['non', 'riparian', 'both'],
  diet: ['herbivore', 'carnivore', 'omnivore'],
  feeding: ['grazer', 'browser', 'mixed', 'frugivore', 'predator', 'scavenger', 'insectivore', 'filter feeder', 'detritivore'],
  activity: ['diurnal', 'nocturnal', 'crepuscular', 'cathemeral'],
  temperament: ['skittish', 'wary', 'docile', 'defensive', 'aggressive'],   /* from bolting first to attacking first */
  habitat: ['ground', 'rock', 'canopy', 'trunks', 'sky', 'water', 'shallows', 'deep water', 'marsh', 'burrow', 'pen'],
  locomotion: ['walks', 'runs', 'climbs', 'flies', 'glides', 'swims', 'wades', 'burrows', 'leaps'],
  gait: ['quadruped', 'sprawl', 'biped', 'hexapod', 'octopod', 'multipede', 'flyer', 'insect', 'swimmer', 'climber', 'none'],
  traits: ['edible', 'milkable', 'tameable', 'rideable', 'draught', 'eggs'],
  koppen: ['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Cfa', 'Cfb', 'Cfc', 'Dfa', 'Dfb', 'Dfc', 'ET', 'EF', 'X', 'H']
};
/* the yields and their units (per adult animal) */
const FAUNA_YIELDS = { meat: 'kg', milk: 'L/day', eggs: '/year', hide: 'count', hair: 'kg/year', wool: 'kg/year', feathers: 'kg/year', ivory: 'kg', horn: 'kg', silk: 'kg/year', chitin: 'kg' };
const ANIMALS = [], ANIMAL_BY_KEY = {};
function ANIMAL(o) {
  if (!o.key || ANIMAL_BY_KEY[o.key]) throw new Error('ANIMAL: a unique key, please (' + o.key + ')');
  const e = Object.assign({ variants: 1, variantNames: [], tags: {}, traits: {}, yields: {}, life: {}, data: {}, breeds: null, size: {}, source: [] }, o);
  ANIMALS.push(e); ANIMAL_BY_KEY[e.key] = e; return e;
}

/* a hash and a value noise in 0..1 for coats and markings (no stream: the same animal gives the same patches) */
function faHash(x, y, z) { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); }
function faNoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a, b, t) => a + (b - a) * t, h = (i, j, k) => faHash(xi + i, yi + j, zi + k);
  return L(L(L(h(0, 0, 0), h(1, 0, 0), u), L(h(0, 1, 0), h(1, 1, 0), u), v), L(L(h(0, 0, 1), h(1, 0, 1), u), L(h(0, 1, 1), h(1, 1, 1), u), v), w);
}
/* ---------------------------------------------------------------- the builder */
const _c = new THREE.Color();
function linCol(c) {
  if (c && c.isColor) return [c.r, c.g, c.b];
  if (Array.isArray(c)) { _c.setRGB(c[0], c[1], c[2]).convertSRGBToLinear(); return [_c.r, _c.g, _c.b]; }
  _c.setHex(c == null ? 0xffffff : c).convertSRGBToLinear(); return [_c.r, _c.g, _c.b];
}
function faunaFrame(entry, opt) {
  opt = opt || {};
  const parts = {}, anchors = {}, A = { entry: entry, variant: opt.variant | 0, breed: opt.breed || null, pose: opt.pose || 'stand',
    S: 1, parts: parts, anchors: anchors, profileFn: null };
  if (entry.breeds && opt.breed && entry.breeds[opt.breed]) A.S = entry.breeds[opt.breed].scale || 1;
  let st = ((opt.seed || 1) * 2654435761) >>> 0;
  A.rnd = () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
  A.rr = (a, b) => a + (b - a) * A.rnd();
  let cur = null;
  function partOf(name, pivot) {
    if (!parts[name]) parts[name] = { name: name, pivot: pivot || [0, 0, 0], buckets: {} };
    return parts[name];
  }
  cur = partOf('body', [0, 0, 0]);
  A.part = function (name, pivot, fn) { const keep = cur; cur = partOf(name, pivot); try { fn(); } finally { cur = keep; } };
  function bucket(fam) {
    if (FAUNA_FAMILIES.indexOf(fam) < 0) throw new Error('fauna: unknown family ' + fam);
    return cur.buckets[fam] || (cur.buckets[fam] = { pos: [], col: [], idx: [] });
  }
  /* push a grid of points (rows of n+1) with per-point colours; faces wound so their normals point away from `inside`
     (a point inside the shape) or, for sheets, as given */
  function grid(fam, P, C, nu, nv, closedU) {
    const b = bucket(fam), base = b.pos.length / 3, pv = cur.pivot;
    for (let i = 0; i < P.length; i++) { b.pos.push(P[i][0] - pv[0], P[i][1] - pv[1], P[i][2] - pv[2]); b.col.push(C[i][0], C[i][1], C[i][2]); }
    const W = nu + 1;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = base + j * W + i, c = a + 1, d = a + W, e = d + 1;
      b.idx.push(a, d, c, c, d, e);
    }
    return base;
  }
  /* a tube along c(t), t 0..1; section an ellipse rad(t) = [half-width, half-height] in the plane across the curve, with the
     section's 'up' as near world +y as the curve allows (a near-vertical curve uses +z) */
  A.tube = function (fam, c, rad, nt, ns, col, o) {
    o = o || {}; const P = [], C = [], pts = [], T = [], B = [], N = [];
    for (let i = 0; i <= nt; i++) pts.push(c(i / nt));
    const up = new THREE.Vector3(), t = new THREE.Vector3(), s = new THREE.Vector3(), n = new THREE.Vector3();
    for (let i = 0; i <= nt; i++) {
      const a = pts[Math.max(0, i - 1)], b2 = pts[Math.min(nt, i + 1)];
      t.set(b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]).normalize();
      up.set(0, 1, 0); if (Math.abs(t.y) > 0.92) up.set(0, 0, 1);
      s.crossVectors(up, t).normalize(); n.crossVectors(t, s).normalize();
      T.push(t.clone()); B.push(s.clone()); N.push(n.clone());
    }
    const fixed = o.colf ? null : linCol(col);
    for (let i = 0; i <= nt; i++) {
      const p = pts[i], r = rad(i / nt);
      for (let k = 0; k <= ns; k++) {
        const ang = k / ns * TAU, sx = Math.sin(ang) * r[0], ny = Math.cos(ang) * r[1];
        P.push([p[0] + B[i].x * sx + N[i].x * ny, p[1] + B[i].y * sx + N[i].y * ny, p[2] + B[i].z * sx + N[i].z * ny]);
        C.push(fixed || linCol(o.colf(i / nt, ang)));
      }
    }
    const base = grid(fam, P, C, ns, nt);
    orient(fam, base, pts, true);
    if (o.caps) for (const [i, sg] of [[0, -1], [nt, 1]]) {
      const r = rad(i / nt); if (r[0] < 0.003) continue;
      const b = bucket(fam), p = pts[i], pv = cur.pivot, cc = fixed || linCol(o.colf(i / nt, Math.PI / 2)), c0 = b.pos.length / 3;
      b.pos.push(p[0] - pv[0], p[1] - pv[1], p[2] - pv[2]); b.col.push(cc[0], cc[1], cc[2]);
      for (let k = 0; k < ns; k++) {
        const ang = k / ns * TAU, sx = Math.sin(ang) * r[0], ny = Math.cos(ang) * r[1];
        b.pos.push(p[0] + B[i].x * sx + N[i].x * ny - pv[0], p[1] + B[i].y * sx + N[i].y * ny - pv[1], p[2] + B[i].z * sx + N[i].z * ny - pv[2]);
        b.col.push(cc[0], cc[1], cc[2]);
      }
      for (let k = 0; k < ns; k++) { if (sg < 0) b.idx.push(c0, c0 + 1 + k, c0 + 1 + (k + 1) % ns); else b.idx.push(c0, c0 + 1 + (k + 1) % ns, c0 + 1 + k); }
    }
  };
  /* after a tube, turn its faces outward: a face whose normal points toward the curve at its row is flipped */
  function orient(fam, base, pts, tube) {
    const b = bucket(fam), pv = cur.pivot, I = b.idx, Pp = b.pos;
    for (let k = I.length - 1; k >= 0; k -= 3) {
      const ia = I[k - 2], ib = I[k - 1], ic = I[k];
      if (ia < base) break;
      const ax = Pp[ia * 3], ay = Pp[ia * 3 + 1], az = Pp[ia * 3 + 2];
      const ux = Pp[ib * 3] - ax, uy = Pp[ib * 3 + 1] - ay, uz = Pp[ib * 3 + 2] - az, vx = Pp[ic * 3] - ax, vy = Pp[ic * 3 + 1] - ay, vz = Pp[ic * 3 + 2] - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      /* the nearest centre-line point to this vertex */
      let best = 1e9, q = pts[0];
      for (const p of pts) { const d = (p[0] - pv[0] - ax) ** 2 + (p[1] - pv[1] - ay) ** 2 + (p[2] - pv[2] - az) ** 2; if (d < best) { best = d; q = p; } }
      const ox = ax - (q[0] - pv[0]), oy = ay - (q[1] - pv[1]), oz = az - (q[2] - pv[2]);
      if (nx * ox + ny * oy + nz * oz < 0) { I[k - 1] = ic; I[k] = ib; }
    }
  }
  A.ellip = function (fam, x, y, z, rx, ry, rz, col, o) {
    o = o || {}; const nu = o.seg || 12, nv = Math.max(6, (nu * 2 / 3) | 0), P = [], C = [], cc = o.colf ? null : linCol(col);
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ')), v = new THREE.Vector3();
    for (let j = 0; j <= nv; j++) { const ph = Math.PI * j / nv; for (let i = 0; i <= nu; i++) { const th = TAU * i / nu;
      v.set(Math.sin(ph) * Math.cos(th) * rx, Math.cos(ph) * ry, Math.sin(ph) * Math.sin(th) * rz).applyMatrix4(m);
      P.push([x + v.x, y + v.y, z + v.z]); C.push(cc || linCol(o.colf(v.x, v.y, v.z))); } }
    const base = grid(fam, P, C, nu, nv);
    orient(fam, base, [[x, y, z]], false);
  };
  A.cone = function (fam, a, b, r0, r1, col, seg) {
    A.tube(fam, t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], t => { const r = r0 + (r1 - r0) * t; return [r, r]; }, 2, seg || 6, col, { caps: true });
  };
  A.sheet = function (fam, f, nu, nv, col, o) {
    o = o || {}; const P = [], C = [], cc = o.colf ? null : linCol(col);
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { P.push(f(i / nu, j / nv)); C.push(cc || linCol(o.colf(i / nu, j / nv))); }
    grid(fam, P, C, nu, nv);
  };
  /* hair: a tapered strip from `at` along `dir` (unit-ish), width w, length len, drooping and curling at its tip; the
     strip faces across its own sideways vector so it reads from the side (hair is double-sided) */
  A.locks = function (fam, list) {
    for (const L of list) {
      const d = new THREE.Vector3(L.dir[0], L.dir[1], L.dir[2]).normalize(), side = new THREE.Vector3(L.side ? L.side[0] : -d.z, 0, L.side ? L.side[2] : d.x);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0); side.normalize();
      const cc = linCol(L.col), dk = [cc[0] * 0.55, cc[1] * 0.55, cc[2] * 0.55], P = [], C = [];
      for (let j = 0; j <= 3; j++) {
        const t = j / 3, w = L.w * (1 - 0.75 * t), droop = t * t * (L.curl || 0.12) * L.len;
        const cx = L.at[0] + d.x * L.len * t, cy = L.at[1] + d.y * L.len * t - droop, cz = L.at[2] + d.z * L.len * t;
        P.push([cx - side.x * w / 2, cy, cz - side.z * w / 2], [cx + side.x * w / 2, cy, cz + side.z * w / 2]);
        C.push(j === 0 ? dk : cc, j === 0 ? dk : cc);
      }
      grid(fam, P, C, 1, 3);
    }
  };
  A.anchor = function (name, p) { anchors[name] = p.slice(); };
  A.profile = function (fn) { A.profileFn = fn; };
  return A;
}

/* ---- kits/fauna/krator-fauna-abyss.js ---- */
/* ======================================================================
   Krator Fauna: the eastern abyss and its caravan beasts (kits/fauna/krator-fauna-abyss.js)
   The abyss floor's wild animals (the salt-lake flamingo, the frilled lizard, the marsh emu: biomes/eastabyss and Locus) and
   the beasts the abyss's and the high desert's peoples keep: the pack lizard (the Locus and Mungo caravans), the riding lizard
   (Locus, Lower Verge, the Mungo nomads) and the dromedary (Upper Verge's caravans and porters, Yuni's caravanserai). Ported
   2026-10-06 from each build's own builder (listed in `source`, the richest copy drawn); the tack (saddles, packs, bales,
   blankets) stays with the cultures, which fit it to the anchors and the lizards' body profiles.
   ====================================================================== */

/* ---------------------------------------------------------------- helpers (private to this file: the faAb prefix) */
/* a Catmull-Rom curve through rows of numbers (any width), t 0..1 by row index */
function faAbCR(P) {
  const n = P.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i, out = [];
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    for (let k = 0; k < p1.length; k++) {
      const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      out.push(0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u));
    }
    return out;
  };
}
/* a smooth skin along a curve f(t) -> [x, y, z, hw, hh], t 0..1: its section carried along by parallel transport, so it never
   flips or pinches where the curve turns steep (A.tube swaps its 'up' near vertical); the seam runs along the underside.
   o.round [a, b]: the radius closes in a dome over the first a and the last b of t (a snout, a tail tip: no flat caps);
   o.bump(t, angle) adds to the radius (a hump); o.colf(t, angle), angle 0 the top; o.up the first section's up */
function faAbTube(A, fam, f, nt, ns, col, o) {
  o = o || {};
  const P = [], T = [], B = [], N = [];
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (let i = 0; i <= nt; i++) P.push(f(i / nt));
  for (let i = 0; i <= nt; i++) { const a = P[Math.max(0, i - 1)], c = P[Math.min(nt, i + 1)]; T.push(nrm([c[0] - a[0], c[1] - a[1], c[2] - a[2]])); }
  let up = o.up || [0, 1, 0]; if (Math.abs(dot(up, T[0])) > 0.95) up = [0, 0, 1];
  let b = nrm(cross(up, T[0]));
  for (let i = 0; i <= nt; i++) {
    if (i) { const d = dot(b, T[i]); b = nrm([b[0] - d * T[i][0], b[1] - d * T[i][1], b[2] - d * T[i][2]]); }
    B.push(b); N.push(cross(T[i], b));
  }
  const rd = o.round || [0, 0], dome = t => { let k = 1;
    if (rd[0] > 0 && t < rd[0]) k = Math.sqrt(Math.max(0, 1 - Math.pow((rd[0] - t) / rd[0], 2)));
    if (rd[1] > 0 && t > 1 - rd[1]) k = Math.min(k, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + rd[1]) / rd[1], 2))));
    return Math.max(0.03, k); };
  const ang = u => (u + 0.5) * 2 * Math.PI;
  A.sheet(fam, (u, v) => { const i = Math.round(v * nt), p = P[i], a = ang(u), k = dome(v), bu = o.bump ? o.bump(v, a) : 0;
      const sx = Math.sin(a) * (p[3] * k + bu), ny = Math.cos(a) * ((p[4] == null ? p[3] : p[4]) * k + bu);
      return [p[0] + B[i][0] * sx + N[i][0] * ny, p[1] + B[i][1] * sx + N[i][1] * ny, p[2] + B[i][2] * sx + N[i][2] * ny]; },
    ns, nt, col, o.colf ? { colf: (u, v) => o.colf(v, ang(u)) } : {});
}
/* a tube along part of a curve of rows [x, y, z, hw, hh]: global t0..t1; o.colf(T, angle) and o.bump(T, angle) get the global
   T; o.inset [below, above]: the radius shrinks a little outside that span (so an overlapped seam between parts never
   z-fights); o.round as faAbTube (o.caps: both ends domed) */
function faAbSpan(A, fam, f, t0, t1, nt, ns, col, o) {
  o = o || {};
  const ins = o.inset, k = T => ins && (T < ins[0] || T > ins[1]) ? 0.965 : 1, G = t => t0 + (t1 - t0) * t;
  faAbTube(A, fam, t => { const T = G(t), q = f(T), m = k(T); return [q[0], q[1], q[2], Math.max(0.002, q[3] * m), Math.max(0.002, (q[4] == null ? q[3] : q[4]) * m)]; }, nt, ns, col,
    { round: o.round || (o.caps ? [0.08, 0.08] : null), colf: o.colf ? (t, a) => o.colf(G(t), a) : null, bump: o.bump ? (t, a) => o.bump(G(t), a) : null });
}
/* a limb as one smooth skin through joint points [x, y, z, r] (shoulder to foot): each inner joint keeps a short rounded
   bend (rows either side of it, o.sharp of the way along), the radius following the points; o.round as faAbTube */
function faAbLeg(A, fam, pts, ns, col, o) {
  o = o || {}; const rows = [], k = o.sharp == null ? 0.2 : o.sharp;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i > 0 && i < pts.length - 1) { const a = pts[i - 1], c = pts[i + 1];
      rows.push(p.map((v, j) => v + (a[j] - v) * k), p.slice(), p.map((v, j) => v + (c[j] - v) * k)); }
    else rows.push(p.slice());
  }
  faAbTube(A, fam, faAbCR(rows.map(r => [r[0], r[1], r[2], r[3], r[3]])), o.nt || rows.length * 4, ns, col, { round: o.round, colf: o.colf });
}
/* a monitor's sprawled leg (the pack and riding lizards): one skin from the shoulder or hip through the elbow or knee held
   out wide, down to the wrist or ankle and the pad; pts [shoulder, elbow, wrist, pad] as [x, y, z, r]; then the broad pad and
   five toes splayed (forward and out in front, out and a little back behind), each with a dark claw. s: the side (+1 left) */
function faAbSprawlLeg(A, fam, pts, front, s, col, padCol, claw) {
  faAbLeg(A, fam, pts, 12, col, { sharp: 0.22, nt: 30 });
  const p = pts[3], r = pts[2][3], aim = s * (front ? 0.3 : 0.75);
  A.ellip(fam, p[0], r * 0.5, p[2] + Math.cos(aim) * r * 0.3, r * 1.45, r * 0.55, r * 1.7, padCol, { seg: 12, ry: aim });
  for (let k = 0; k < 5; k++) {
    const a = (k - 2) * 0.36 + aim, L = r * (1.7 + (k === 3 ? 0.55 : k === 2 ? 0.35 : k === 0 ? -0.4 : 0)), dx = Math.sin(a), dz = Math.cos(a);
    const b = [p[0] + dx * r * 0.9, r * 0.42, p[2] + dz * r * 0.9], t = [b[0] + dx * L, r * 0.24, b[2] + dz * L];
    A.cone(fam, b, t, r * 0.36, r * 0.22, padCol, 7);
    A.cone('horn', t, [t[0] + dx * r * 0.55, r * 0.04, t[2] + dz * r * 0.55], r * 0.2, r * 0.03, claw, 6);
  }
}
/* a limb (or a bending neck): straight segments through [x, y, z, r] points, each its own tube so a section never twists
   where the curve turns steep, with a ball at each inner joint; col(i, joint) a segment's or a joint's colour;
   o.knob(i) the joint ball's size against the segment's radius */
function faAbLimb(A, fam, pts, ns, col, o) {
  o = o || {};
  const cf = typeof col === 'function' ? col : () => col, kn = typeof o.knob === 'function' ? o.knob : () => (o.knob || 1.02);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    A.tube(fam, t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], t => { const r = a[3] + (b[3] - a[3]) * t; return [r, r]; }, 1, ns, cf(i, false),
      { caps: (i === 0 && !!o.cap0) || (i === pts.length - 2 && o.cap1 !== false) });
    if (i > 0) { const r = a[3] * kn(i); A.ellip(fam, a[0], a[1], a[2], r, r, r, cf(i, true), { seg: ns }); }
  }
}
/* a sheet seen from both sides (a frill, a web): the same surface twice, wound both ways (hair is already two-sided) */
function faAbSheet2(A, fam, f, nu, nv, col, colf) {
  A.sheet(fam, f, nu, nv, col, colf ? { colf: colf } : {});
  if (fam !== 'hair') A.sheet(fam, (u, v) => f(1 - u, v), nu, nv, col, colf ? { colf: (u, v) => colf(1 - u, v) } : {});
}
function faAbRGB(c) { if (Array.isArray(c)) return c; const k = new THREE.Color(c); return [k.r, k.g, k.b]; }
function faAbShade(c, k) { const p = faAbRGB(c); return [Math.min(1, p[0] * k), Math.min(1, p[1] * k), Math.min(1, p[2] * k)]; }
function faAbMix(a, b, t, k) {
  const p = faAbRGB(a), q = faAbRGB(b), m = k == null ? 1 : k;
  return [Math.min(1, (p[0] + (q[0] - p[0]) * t) * m), Math.min(1, (p[1] + (q[1] - p[1]) * t) * m), Math.min(1, (p[2] + (q[2] - p[2]) * t) * m)];
}
function faAbLerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
/* a body table [z, y, hw, hh] (tail tip first) as curve rows [x, y, z, hw, hh] at scale S, lifted by dy */
function faAbRows(T, S, dy) { return T.map(r => [0, (r[1] + (dy || 0)) * S, r[0] * S, r[2] * S, r[3] * S]); }

/* ================================================================ the salt-lake flamingo
   biomes/eastabyss (the richer rig: an S-neck in two pieces, the bent bill with its black tip, the ankle band, black
   flight feathers), first drawn in Locus. Origin under the body; the neck's root at (0, .85, .2). The wings are built
   spread to the real 1.5 m span; perched, flap.foldScale and flap.sweep fold each back inside the body, and the folded
   wing that shows (coverts, tertials) is drawn on the flanks. Pose 'fly' stretches the neck out ahead (the legs trail
   by flap.tuck). Body and wings are the feather family, the legs scale. */
const FA_AB_FLA = [
  { body: 0xf2909e, deep: 0xe4687e, cov: 0xdc4a64, black: 0x1c1818, leg: 0xdc7c8a, band: 0xc85a6c, bill: 0xe6d6cc, tip: 0x1a1414, eye: 0xf0d060, K: 1 },
  { body: 0xccc4bc, deep: 0xaaa098, cov: 0xb0948e, black: 0x3a3430, leg: 0x6e6862, band: 0x5a5450, bill: 0x9a9490, tip: 0x1a1414, eye: 0xb8a878, K: 0.82 }];
ANIMAL({
  key: 'flamingo', name: 'Salt-lake flamingo', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['humid', 'subhumid'], climate: ['hypertropic', 'tropic'], riparian: 'both', abyssal: true,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'filter feeder', activity: 'diurnal', temperament: 'skittish',
    habitat: ['shallows', 'water', 'marsh', 'sky'], locomotion: ['walks', 'wades', 'flies', 'swims'] },
  size: { length: 1.25, height: 1.45, span: 1.5 },
  source: [{ build: 'biomes/eastabyss', file: 'src/75-biome-eastabyss-fauna.js', lines: '21, 71-87, 102, 169-180', note: 'ported from here (the richer): flocks of 12 to 60 wading the salt lake\'s margin, the channels and the delta, heads down to feed, and skeins in V formation over the lake; Verge (Lower Verge) and openworld/little-demo take it from this kit' },
    { build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '16-17, 35-48', note: 'the first flamingo: static standing, feeding and flying meshes (a taller bird, 1.9 m), flocks at the delta mouths and along the lake shore, two skeins between the lake and the delta' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 1.6, note: 'a bird dressed; dark and salty from the lake' },
    eggs: { amount: 1, note: 'one egg a year on a mud mound in the colony; taken from the colonies\' edges' },
    feathers: { amount: 0.05, note: 'moulted: the crimson coverts and black primaries, prized for fans and headdresses' } },
  life: { maturity: 4, lifespan: 40, litter: 1, gestation: 29, note: 'gestation: the egg\'s incubation in days; the young are grey for two or three years' },
  variants: 2, variantNames: ['adult', 'juvenile, grey'],
  w: 1.56, d: 0.92, h: 1.46,
  variantDims: [{ w: 1.56, d: 0.92, h: 1.46 }, { w: 1.28, d: 0.76, h: 1.2 }],
  poses: ['stand', 'fly'],
  data: { mass: [3.2, 2.4], legs: 2, wings: 1, speed: { walk: 0.6, run: 4, fly: 15 }, gait: { type: 'flyer', freq: 1.1, stride: 0.5 },
    flap: { freq: 0.9, amp: 0.5, glide: 0.1, fold: 0.12, sweep: 1.5, foldScale: 0.28, tuck: 1.45 }, grazePitch: 2.7,
    herd: 'flocks of 12 to 60 in the shallows; skeins of 10 to 15 in V formation between the lakes', fleeDistance: 30, aggression: 0.02,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'FLY', 'GRAZE', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_AB_FLA[A.variant] || FA_AB_FLA[0], K = C.K, fly = A.pose === 'fly', P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    const RK = T => T.map(r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K, (r[4] == null ? r[3] : r[4]) * K]);
    /* ---- the body: a smooth teardrop, the breast full and forward, tapering back to the short tail */
    const bf = faAbCR(RK([[0, .866, -.37, .01, .01], [0, .858, -.315, .048, .042], [0, .842, -.23, .096, .088], [0, .826, -.13, .133, .128], [0, .816, -.03, .151, .146],
      [0, .816, .07, .152, .149], [0, .826, .16, .137, .142], [0, .846, .235, .105, .114], [0, .864, .285, .06, .07], [0, .872, .312, .018, .022]]));
    faAbTube(A, 'feather', bf, 26, 16, null, { round: [0.04, 0.06], colf: (t, a) => { const top = Math.max(0, Math.cos(a));
      return faAbShade(faAbMix(C.body, C.deep, top * (t > 0.12 && t < 0.8 ? 0.35 : 0.15)), 0.95 + 0.08 * faNoise(t * 18, a * 3, 1.7)); } });
    /* the folded wings as they show on a standing bird: the crimson coverts laid along each upper flank, the long pink
       tertials over the tail, the black flight feathers only a line at the lower back edge (the flying wing folds away
       inside the body: wingL/wingR below) */
    if (!fly) for (const s of [1, -1]) A.ellip('feather', s * 0.086 * K, 0.872 * K, -0.12 * K, 0.042 * K, 0.075 * K, 0.27 * K, null, { seg: 16, rx: -0.12, ry: s * 0.2,
      colf: (x, y, z) => { const yy = y / (0.075 * K), zz = z / (0.27 * K);
        return zz < -0.62 && yy < 0 ? C.black : faAbMix(C.body, C.cov, Math.max(0.15, Math.min(0.8, 0.42 - 0.3 * yy - 0.25 * zz))); } });
    /* ---- the head with the neck: the S-neck turns about its root (graze: the head goes down to the water, upside down);
       in the 'fly' pose the neck is stretched straight out ahead */
    A.part('head', P(0, .85, .2), () => {
      const nk = fly ? [[0, .80, .17, .072], [0, .84, .27, .052], [0, .85, .38, .037], [0, .845, .5, .03], [0, .838, .62, .027], [0, .832, .71, .027], [0, .83, .745, .029], [0, .83, .76, .03]]
        : [[0, .80, .17, .072], [0, .86, .235, .056], [0, .95, .295, .041], [0, 1.06, .343, .033], [0, 1.17, .36, .029], [0, 1.27, .338, .027], [0, 1.34, .3, .026], [0, 1.383, .27, .028], [0, 1.4, .262, .03]];
      faAbTube(A, 'feather', faAbCR(RK(nk)), 30, 10, C.body);
      /* the head and the bill are drawn in the standing pose's frame and set on the neck's end (pitched a little down in flight) */
      const HC = fly ? [.83, .76] : [1.4, .262], HP = fly ? 0.15 : 0, cp = Math.cos(HP), sp = Math.sin(HP);
      const hp = (x, y, z) => { const dy = y - 1.4, dz = z - .262; return [x * K, (HC[0] + dy * cp - dz * sp) * K, (HC[1] + dy * sp + dz * cp) * K]; };
      { const q = hp(0, 1.402, .264); A.ellip('feather', q[0], q[1], q[2], 0.037 * K, 0.04 * K, 0.058 * K, C.body, { seg: 12, rx: HP }); }
      /* the bill: pale, deep at the face, bending sharply down at its middle, the black tip */
      const bl = [[0, 1.398, .292, .022, .021], [0, 1.396, .325, .02, .019], [0, 1.386, .355, .017, .016], [0, 1.368, .377, .013, .012], [0, 1.345, .39, .009, .009], [0, 1.322, .394, .006, .006]]
        .map(r => { const q = hp(r[0], r[1], r[2]); return [q[0], q[1], q[2], r[3] * K, r[4] * K]; });
      faAbTube(A, 'horn', faAbCR(bl), 12, 10, null, { round: [0, 0.18], colf: t => t > 0.5 ? C.tip : C.bill });
      for (const s of [-1, 1]) {
        const e = hp(s * 0.031, 1.41, .274), p = hp(s * 0.037, 1.41, .277);
        A.ellip('eye', e[0], e[1], e[2], 0.009 * K, 0.009 * K, 0.009 * K, C.eye, { seg: 8 });
        A.ellip('eye', p[0], p[1], p[2], 0.004 * K, 0.004 * K, 0.004 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the wings, built spread (1.5 m tip to tip): from the shoulder out along +x (left), the crimson coverts on the
       leading half, the flight feathers black, the primaries' tips fingered. Perched, the runtime shortens each along its
       span (flap.foldScale) and turns it back along the flank (flap.sweep): folded so, it lies inside the body. */
    const LE = faAbCR([[.1, .17], [.3, .19], [.49, .17], [.645, .1], [.78, -.01]]), TE = faAbCR([[.1, -.02], [.3, -.035], [.49, -.05], [.645, -.035], [.78, -.01]]);
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * .1, .85, .17), () => {
      A.sheet('feather', (u, v) => { const a = LE(u), b = TE(u), prim = Math.max(0, (u - 0.45) / 0.55);
          const serr = (prim > 0 ? 0.03 * Math.abs(Math.sin(prim * Math.PI * 4.5)) * (1 - 0.6 * prim) : 0.008 * Math.abs(Math.sin(u * Math.PI * 9))) * v * v;
          return [s * (a[0] + (b[0] - a[0]) * v) * K, (0.85 + 0.03 * u + 0.02 * Math.sin(Math.PI * Math.min(1, v * 1.4)) * (1 - 0.6 * u)) * K, (a[1] + (b[1] - a[1]) * v - serr) * K]; },
        22, 6, null, { colf: (u, v) => v < 0.12 ? C.body : (u > 0.55 ? (v < 0.22 ? C.cov : C.black) : (v < 0.5 ? C.cov : C.black)) });
      /* the leading edge: the arm's thickness under the coverts */
      faAbTube(A, 'feather', t => { const u = t * 0.92, a = LE(u); return [s * a[0] * K, (0.852 + 0.03 * u) * K, (a[1] - 0.012) * K, (0.016 - 0.011 * t) * K, (0.011 - 0.007 * t) * K]; }, 12, 6, C.cov, { round: [0, 0.1] });
    });
    /* ---- the legs: long and thin, scaled, the ankle (the 'knee' that bends back) a darker knob; webbed feet, three toes */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .06, .69, -.02), () => {
      const x = s * 0.06;
      faAbLimb(A, 'scale', [[x, .74, -.02, .02], [x, .38, -.045, .0135], [x, .03, -.008, .011]].map(PR), 8, (j, jt) => jt ? C.band : C.leg, { knob: 1.45 });
      const heel = P(x, .012, -.008), toes = [-1, 0, 1].map(k => P(x + k * 0.034, 0.006, 0.075 - Math.abs(k) * 0.012));
      for (const tp of toes) A.cone('scale', heel, tp, 0.008 * K, 0.004 * K, C.leg, 5);
      faAbSheet2(A, 'scale', (u, v) => { const e = u < 0.5 ? faAbLerp3(toes[0], toes[1], u * 2) : faAbLerp3(toes[1], toes[2], u * 2 - 1); const p = faAbLerp3(heel, e, v * 0.92); return [p[0], 0.008 * K, p[2]]; }, 4, 2, C.leg);
    });
    A.anchor('perch', P(0, 0, 0)); A.anchor('back', P(0, .95, -.05));
  }
});

/* ================================================================ the frilled lizard
   biomes/eastabyss (shaded back and belly, a banded tail, the frill's two colours), first drawn in Locus; 0.95 m nose to
   tail. Variant 1 (or pose 'display') has the frill open, the way it faces a threat; otherwise it lies folded on the
   neck like a pleated cape. The eastern abyss's frill opens with the viewer's distance: a host swaps the variant. */
const FA_AB_FL = [[-.68, .035, .006, .006], [-.5, .044, .012, .011], [-.32, .054, .02, .018], [-.17, .067, .031, .027], [-.07, .077, .05, .04], [.03, .082, .062, .048],
  [.12, .085, .056, .045], [.18, .092, .04, .035], [.215, .1, .04, .036], [.25, .099, .035, .03], [.28, .094, .025, .021], [.305, .088, .013, .011]];
const FA_AB_FLC = { liz: 0x7c6444, dark: 0x56442e, belly: 0xb8a482, frill: 0xd2502c, frillC: 0xe8a848 };
ANIMAL({
  key: 'frilled-lizard', name: 'Frilled lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'Aw', 'BSh'], aridity: ['semiarid', 'subhumid'], climate: ['hypertropic', 'tropic'], riparian: 'both', abyssal: true,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'trunks', 'rock'], locomotion: ['walks', 'runs', 'climbs'] },
  size: { length: 0.95, height: 0.12 },
  source: [{ build: 'biomes/eastabyss', file: 'src/75-biome-eastabyss-fauna.js', lines: '22, 88-94, 143-151, 183-190', note: 'ported from here (the richer): singles on dry ground near the rivers and the salt flats\' damp edges; they bask, dash on the hind legs, and inside ~25 m of the viewer open the frill, rear and turn to face it' },
    { build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '18, 55-58', note: 'singles on dry open ground at the town\'s edge; box body, the frill its own mesh, raised when the camera comes close' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 0.25, note: 'roasted whole; little on it' } },
  life: { maturity: 1.5, lifespan: 12, litter: 12, gestation: 80, note: 'a clutch of 8 to 20 eggs buried in warm soil; gestation: incubation days' },
  variants: 2, variantNames: ['basking, frill folded', 'display, frill open'],
  w: 0.3, d: 1.0, h: 0.16,
  variantDims: [{ w: 0.3, d: 1.0, h: 0.16 }, { w: 0.42, d: 1.0, h: 0.32 }],
  data: { mass: 0.6, legs: 4, speed: { walk: 0.5, run: 4 }, gait: { type: 'sprawl', freq: 2.2, stride: 0.12 }, grazePitch: 0.15,
    herd: 'solitary; a male holds a few trees and the ground between', fleeDistance: 6, aggression: 0.2, display: 'opens the frill, gapes and hisses inside ~25 m, then dashes off upright on its hind legs',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const F = FA_AB_FLC, open = A.variant === 1 || A.pose === 'display', R = faAbRows(FA_AB_FL, 1, 0), f = faAbCR(R), n = R.length - 1;
    const skin = (T, a) => { const top = Math.cos(a), q = f(T);
      if (T < 4.2 / n) return Math.floor(-q[2] * 14) % 2 ? F.dark : (top < -0.5 ? F.belly : F.liz);
      if (top < -0.45) return F.belly;
      const sp = faNoise(q[2] * 40, a * 3, 2.3);
      return top > 0.5 ? (sp > 0.68 ? F.liz : F.dark) : (sp > 0.72 ? F.dark : F.liz); };
    /* the trunk; the tail sways about the hips; the head (with the frill) turns about the neck */
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 14, 14, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 18, 10, null, { round: [0.05, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.5 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      /* the head: a wedge from the neck to a rounded snout, the eyes high on its sides, the long mouth line */
      faAbSpan(A, 'scale', f, 7.5 / n, 1, 12, 14, null, { round: [0, 0.22], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.029, 0.113, 0.248, 0.0085, 0.0085, 0.0085, 0x1a1208, { seg: 8 });
        A.ellip('eye', s * 0.034, 0.114, 0.25, 0.0035, 0.0035, 0.0035, 0xd8a040, { seg: 6 });
        A.cone('mouth', [s * 0.036, 0.089, 0.215], [s * 0.012, 0.083, 0.296], 0.0022, 0.0022, 0x2a1a12, 4);
      }
      /* the frill: a ruff on cartilage spines round the neck, the inner face saffron, the rim red */
      const NY = 0.1, NZ = 0.17, A0 = -0.4, A1 = Math.PI + 0.8;
      const fr = open ? (u, v) => { const a = A0 + A1 * u, r = (0.035 + 0.165 * v) * (1 + 0.06 * Math.sin(u * Math.PI * 13) * v * v), y = Math.sin(a) * r;
          return [Math.cos(a) * r, NY + y * Math.cos(0.15), NZ - y * Math.sin(0.15) - 0.045 * v * v]; }
        : (u, v) => { const a = A0 + A1 * u, pl = 1 + 0.12 * Math.sin(u * Math.PI * 13) * v;
          return [Math.cos(a) * (0.042 + 0.03 * v) * pl, NY - 0.015 * v + Math.sin(a) * (0.038 + 0.022 * v) * pl, NZ - 0.1 * v]; };
      faAbSheet2(A, 'scale', fr, 26, 4, null, (u, v) => { const rib = Math.abs(((u * 13) % 1) - 0.5) > 0.4;
        if (!open) return faAbMix(F.liz, F.frill, 0.3 + 0.2 * v, rib ? 0.8 : 1);
        return v > 0.52 ? (rib ? faAbShade(F.frill, 0.78) : F.frill) : (rib ? faAbShade(F.frillC, 0.8) : F.frillC); });
    });
    /* the legs, sprawled: the upper arm and the thigh out level from the body, the elbow and the knee out wide (the knee
       forward), the forearm and the shin down to the wrist and the ankle; a flat palm and five long thin toes */
    const LEGS = [[.1, 1, 1, 0], [.1, 1, -1, 1], [-.1, 0, 1, 2], [-.1, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * 0.03, 0.072, z];
      A.part('leg' + i, b, () => {
        const pts = front ? [[s * .02, .075, z, .015], [s * .074, .066, z - .014, .0105], [s * .094, .026, z + .008, .0075], [s * .1, .008, z + .026, .006]]
          : [[s * .022, .075, z, .018], [s * .084, .07, z + .024, .0125], [s * .112, .026, z - .022, .0085], [s * .12, .008, z - .042, .006]];
        faAbLeg(A, 'scale', pts, 8, null, { colf: (t, a) => Math.cos(a) < -0.4 ? faAbMix(F.dark, F.belly, 0.4) : F.dark });
        const ft = pts[3];
        A.ellip('scale', ft[0], 0.006, ft[2], 0.011, 0.005, 0.012, F.dark, { seg: 8, ry: front ? s * 0.35 : s * 0.75 });
        for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.38 + s * (front ? 0.35 : 0.75), L = (front ? 0.022 : 0.028) + (k === 3 ? 0.01 : k === 2 ? 0.006 : 0);
          A.cone('scale', [ft[0], 0.006, ft[2]], [ft[0] + Math.sin(a) * L, 0.0025, ft[2] + Math.cos(a) * L], 0.0042, 0.0014, F.dark, 5); }
      });
    }
  }
});

/* ================================================================ the marsh emu
   Locus (its only drawer): a shaggy grey-brown body, the long neck dark below and blue-grey bare skin above, stout legs.
   The plumage is drooping locks over a smaller body (the original's 0.76 m-wide ellipsoid, slimmed: the locks make up
   the bulk); the chick is striped. */
const FA_AB_EMU = [
  { body: 0x5e5446, dark: 0x4a4238, skin: 0x6a7a8a, crown: 0x3a3430, leg: 0x6a6050, bill: 0x2a2622, eye: 0x8a4a1a, K: 1, hair: 1 },
  { body: 0xcdb98e, dark: 0x3e3226, skin: 0xb8a684, crown: 0x3e3226, leg: 0x8a7a68, bill: 0x4a4038, eye: 0x3a2a1a, K: 0.42, hair: 0.45, stripes: true }];
ANIMAL({
  key: 'marsh-emu', name: 'Marsh emu', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'Aw', 'BSh'], aridity: ['subhumid', 'semiarid'], climate: ['tropic'], riparian: 'non', abyssal: true,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'marsh'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 1.3, height: 1.95 },
  source: [{ build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '17, 50-53', note: 'small mobs on the dry hummocks and ridges of the marsh, clear of the town; a static mesh (body, rear shag, neck, blue-grey head, two legs)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 14, note: 'a bird dressed: lean red meat; the fat rendered for oil' },
    eggs: { amount: 10, note: 'a clutch of 5 to 15 dark green eggs a year, sat by the cock; taken from wild nests' },
    feathers: { amount: 0.3, note: 'moulted: the double-shafted body feathers, for fletching, brushes and capes' },
    hide: { amount: 1, hideM2: 0.7, note: 'a thin, pitted leather' } },
  life: { maturity: 2, lifespan: 15, litter: 9, gestation: 52, note: 'gestation: the clutch\'s incubation in days; the cock rears the striped chicks' },
  variants: 2, variantNames: ['adult', 'chick, striped'],
  w: 0.92, d: 1.42, h: 1.98,
  variantDims: [{ w: 0.92, d: 1.42, h: 1.98 }, { w: 0.36, d: 0.58, h: 0.84 }],
  data: { mass: [42, 4], legs: 2, speed: { walk: 1.2, run: 13 }, gait: { type: 'biped', freq: 1.4, stride: 0.6 }, grazePitch: 1.0,
    herd: 'mobs of 3 to 8 on the marsh hummocks; a cock alone with his chicks', fleeDistance: 25, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_EMU[A.variant] || FA_AB_EMU[0], K = C.K, H = C.hair, P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    const plume = (a, z) => C.stripes ? (Math.sin(a * 4.5) > 0.15 ? C.body : C.dark) : faAbMix(C.body, C.dark, faHash(a * 7, z * 13, 1.3) * 0.7);
    /* ---- the body under its plumage: highest over the hips, the rump falling away behind, the breast forward */
    const bf = faAbCR([[-.52, 1.0, .03, .03], [-.44, 1.06, .19, .22], [-.28, 1.12, .27, .29], [-.06, 1.14, .3, .3], [.14, 1.13, .28, .28], [.3, 1.15, .21, .22], [.4, 1.19, .12, .13], [.44, 1.21, .03, .03]]
      .map(r => [0, r[1] * K, r[0] * K, r[2] * K, r[3] * K]));
    faAbTube(A, 'feather', bf, 18, 16, null, { round: [0.06, 0.06], colf: (t, a) => plume(a, t) });
    /* the plumage: broad drooping locks laid along the body (down round its sides and a little back), overlapping like a
       thatch, longest at the rump; the strips lie flat on the plumage (their width along the body), not edge-on */
    const lay = (q, t, a, len, w, cl) => { const ca = Math.cos(a), sa = Math.sin(a), sg = a < 0 ? -1 : 1;
      const at = [sa * q[3] * 0.97, q[1] + ca * q[4] * 0.97, q[2]], dn = [sg * ca * q[3], -sg * sa * q[4], 0], l = Math.hypot(dn[0], dn[1]) || 1;
      return { at: at, dir: [dn[0] / l + 0.18 * sa, dn[1] / l + 0.18 * ca, -0.4], side: [0, 0, 1], len: len, w: w, col: plume(a, at[2] / K), curl: cl }; };
    const locks = [];
    /* (a chick is in striped down: its body's own stripes, no locks) */
    if (!C.stripes) for (let i = 0; i < 260; i++) { const t = A.rr(0.1, 0.95), a = A.rr(-1, 1) * 2.05;
      locks.push(lay(bf(t), t, a, A.rr(0.17, 0.3) * K * H * (t < 0.4 ? 1.25 : 1), A.rr(0.07, 0.1) * K, 0.15)); }
    if (locks.length) A.locks('feather', locks);
    /* ---- the rump's shag: the long feathers that hang off the back end (they sway as the tail does) */
    A.part('tail', P(0, 1.08, -.42), () => {
      const rl = [];
      for (let i = 0; i < 40; i++) { const t = A.rr(0, 0.22), a = A.rr(-1, 1) * 2.1, L = lay(bf(t), t, a, A.rr(0.24, 0.4) * K * H, 0.075 * K, 0.18);
        L.dir = [L.dir[0] * 0.8, L.dir[1], -0.7]; rl.push(L); }
      A.locks('feather', rl);
    });
    /* ---- the neck and head: a long neck rising from the breast with a slight forward lean, feathered dark below and the
       blue-grey bare skin above, a dark crown, the flat bill */
    A.part('head', P(0, 1.22, .36), () => {
      const nf = faAbCR([[0, 1.1, .26, .12, .13], [0, 1.32, .345, .082, .088], [0, 1.52, .385, .06, .062], [0, 1.7, .41, .05, .05], [0, 1.83, .44, .046, .046], [0, 1.9, .475, .045, .045]]
        .map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbTube(A, 'feather', nf, 20, 12, null, { colf: (t, a) => C.stripes ? (Math.sin(a * 3) > 0.1 ? C.body : C.dark) : (t < 0.45 ? C.dark : faAbMix(C.dark, C.skin, Math.min(1, (t - 0.45) * 4))) });
      const nl = [];
      for (let i = 0; i < 36; i++) { const t = A.rr(0, 0.5), a = A.rr(-1, 1) * Math.PI, q = nf(t), at = [Math.sin(a) * q[3] * 0.97, q[1] + Math.cos(a) * q[4] * 0.97, q[2]];
        nl.push({ at: at, dir: [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.25 - 0.1], len: A.rr(0.07, 0.13) * K * H, w: 0.04 * K, col: C.stripes ? plume(a, 0) : C.dark, curl: 0.1 }); }
      A.locks('feather', nl);
      A.ellip('feather', 0, 1.9 * K, 0.485 * K, 0.055 * K, 0.058 * K, 0.085 * K, C.skin, { seg: 12 });
      A.ellip('feather', 0, 1.935 * K, 0.47 * K, 0.046 * K, 0.03 * K, 0.062 * K, C.crown, { seg: 10 });
      const bl = faAbCR([[0, 1.888, .54, .027, .017], [0, 1.88, .6, .021, .012], [0, 1.866, .638, .012, .008]].map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbTube(A, 'horn', bl, 8, 10, C.bill, { round: [0, 0.3] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.047 * K, 1.912 * K, 0.505 * K, 0.011 * K, 0.011 * K, 0.011 * K, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.054 * K, 1.913 * K, 0.508 * K, 0.005 * K, 0.005 * K, 0.005 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the legs: the thigh's plumage up in the body's skirt, the bare shank (scaled, thick at the top), the ankle that
       bends back, the long scaled tarsus, three stout toes with claws */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .12, .95, .02), () => {
      const x = s * 0.13;
      A.ellip('feather', x * K, 0.96 * K, 0.02 * K, 0.1 * K, 0.15 * K, 0.14 * K, C.stripes ? C.body : C.dark, { seg: 12 });
      faAbLeg(A, 'scale', [[x, .9, .05, .058], [x, .47, -.04, .036], [x, .08, .012, .029]].map(PR), 10, C.leg, { sharp: 0.14 });
      A.ellip('scale', x * K, 0.47 * K, -0.045 * K, 0.042 * K, 0.046 * K, 0.044 * K, faAbShade(C.leg, 0.92), { seg: 10 });
      A.ellip('scale', x * K, 0.06 * K, 0.03 * K, 0.04 * K, 0.03 * K, 0.05 * K, C.leg, { seg: 10 });
      for (const k of [-1, 0, 1]) { const a = k * 0.42, L = k ? 0.13 : 0.155, tip = P(x + Math.sin(a) * L, .014, .03 + Math.cos(a) * L);
        A.cone('scale', P(x, .035, .035), tip, 0.022 * K, 0.012 * K, C.leg, 7);
        A.cone('horn', tip, P(x + Math.sin(a) * (L + 0.035), .006, .03 + Math.cos(a) * (L + 0.035)), 0.011 * K, 0.002 * K, C.bill, 5); }
    });
    A.anchor('back', P(0, 1.42, 0));
  }
});

/* ================================================================ the pack lizard
   Locus's and Mungo's caravan beast (gBeast): a long heavy body on four splayed legs, a thick tail, a blunt head; olive.
   Kept by the Locus carters and the caravans that stop at Mungo: it pulls the carts and carries the bales (the pack is
   tack: not drawn here; fit it to the anchors or the profile). The originals' boxes are rounded into a table body;
   the tail now droops to the ground (theirs rose). */
const FA_AB_PL = [[-2.8, .3, .035, .03], [-2.3, .5, .1, .09], [-1.8, .68, .17, .15], [-1.3, .83, .27, .23], [-.85, .93, .40, .32], [-.3, .97, .46, .36], [.3, .98, .46, .36],
  [.78, .99, .40, .31], [1.08, 1.02, .28, .23], [1.33, 1.08, .275, .225], [1.58, 1.12, .25, .19], [1.8, 1.13, .19, .13]];
const FA_AB_PLC = [{ back: 0x6a6a4a, tail: 0x5e5e40, leg: 0x55553a, belly: 0x8c8664 }, { back: 0x6e6450, tail: 0x625844, leg: 0x564e3c, belly: 0x9a8e70 }];
ANIMAL({
  key: 'pack-lizard', name: 'Pack lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['semiarid', 'subhumid', 'arid'], climate: ['tropic', 'hypertropic'], riparian: 'both', abyssal: true,
    domestic: true, herdedBy: ['locus', 'mungo'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'swims'] },
  size: { length: 4.6, height: 1.33 },
  source: [{ build: 'settlements/locus', file: 'src/84-life.js', lines: '427-430', note: 'the life layer\'s pack lizard: in the caravans\' columns and before the carts, a load lashed on its back (tack, not ported); kept by the Locus carters and caravans' },
    { build: 'settlements/mungo', file: 'src/84-mungo-life.js', lines: '34, 38-40', note: 'the caravans\' pack lizards, a little bigger (2.4 m body), bales lashed on: walking in the column, stabled in the caravanserai\'s court while the caravan stays' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 300, note: 'an old beast dressed; tough, eaten smoked or stewed' },
    eggs: { amount: 15, note: 'a clutch a year in a warm sand pit in the yard; most are left to hatch' },
    hide: { amount: 1, hideM2: 6, note: 'heavy scaled leather: harness, sandals, shields' } },
  life: { maturity: 6, lifespan: 50, litter: 10, gestation: 90, note: 'gestation: the clutch\'s incubation in days; worked from its eighth year' },
  variants: 2, variantNames: ['olive', 'dun'],
  w: 2.05, d: 4.7, h: 1.36,
  data: { mass: 800, legs: 4, speed: { walk: 1.2, run: 4 }, gait: { type: 'quadruped', freq: 0.75, stride: 0.6 }, grazePitch: 0.4,
    herd: 'worked singly before a cart or in a string of 2 to 6 in a caravan', fleeDistance: 0, aggression: 0.05, load: 'about 250 kg on its back; a two-wheeled cart',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_PLC[A.variant] || FA_AB_PLC[0], S = A.S, R = faAbRows(FA_AB_PL, S, 0), f = faAbCR(R), n = R.length - 1;
    const skin = (T, a) => { const top = Math.cos(a), q = f(T), base = T < 3.8 / n ? faAbMix(C.tail, C.back, Math.max(0, (T - 2 / n) / (1.8 / n))) : C.back;
      const mot = 0.86 + 0.22 * faNoise(q[2] * 3.1, a * 2.2, 5.1), band = top > 0.25 && Math.sin(q[2] / S * 5.2) > 0.72 ? 0.82 : 1;
      return faAbMix(base, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.2)), mot * band); };
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 22, 18, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 18, 14, null, { round: [0.04, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.6 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'scale', f, 7.6 / n, 1, 14, 16, null, { round: [0, 0.16], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.245 * S, 1.17 * S, 1.38 * S, 0.045 * S, 0.04 * S, 0.045 * S, 0x16100a, { seg: 8 });
        A.ellip('eye', s * 0.27 * S, 1.175 * S, 1.385 * S, 0.018 * S, 0.018 * S, 0.018 * S, 0xc89a3a, { seg: 6 });
        const L = [[s * .262, 1.04, 1.2], [s * .225, 1.02, 1.58], [s * .1, 1.05, 1.74]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.012 * S, 0.012 * S, 0x24200e, 5);
        A.ellip('mouth', s * 0.055 * S, 1.16 * S, 1.755 * S, 0.014 * S, 0.01 * S, 0.01 * S, 0x1a160c, { seg: 6 });
      }
    });
    /* the legs, a monitor's: the upper arm and the thigh out and down from the body, the elbow and the knee held wide (the
       knee forward), the forearm and the shin down to the wrist and the ankle, broad pads, five splayed clawed toes */
    const LEGS = [[.72, 1, 1, 0], [.72, 1, -1, 1], [-.72, 0, 1, 2], [-.72, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const top = [s * 0.36 * S, (front ? 0.86 : 0.9) * S, z * S];
      A.part('leg' + i, top, () => {
        const pts = (front ? [[.3, .88, .72, .2], [.62, .62, .64, .15], [.66, .2, .78, .115], [.67, .08, .85, .1]]
          : [[.32, .92, -.72, .24], [.66, .7, -.56, .17], [.71, .2, -.8, .12], [.72, .08, -.86, .105]]).map(q => [s * q[0] * S, q[1] * S, q[2] * S, q[3] * S]);
        faAbSprawlLeg(A, 'scale', pts, front, s, C.leg, C.leg, 0x2a2a20);
      });
    }
    A.profile(t => { const q = f(t); return { z: q[2], y: q[1], hw: q[3], hh: q[4] }; });
    A.anchor('saddle', [0, 1.33 * S, 0]); A.anchor('pack', [0, 1.33 * S, -0.05 * S]); A.anchor('bridle', [0, 1.12 * S, 1.62 * S]);
    A.anchor('chest', [0, 0.95 * S, 0.95 * S]); A.anchor('tailRoot', [R[4][0], R[4][1], R[4][2]]); A.anchor('headRoot', [hp[0], hp[1], hp[2]]);
  }
});

/* ================================================================ the riding lizard
   Verge's rig (the richer: the trunk, the neck and head, the two-piece tail, the flared frill, the splayed two-joint legs,
   the pale belly and the mottled back): the abyss's mount, 3 m and 0.9 m at the back. Locus and Mungo draw a much bigger
   upright beast (6 m, 1.8 m at the back): that is the 'great' breed here. The saddle and blanket are tack (not drawn). */
const FA_AB_RL = [[-1.68, .13, .012, .012], [-1.35, .30, .06, .055], [-1.0, .45, .105, .09], [-.65, .52, .155, .13], [-.4, .58, .24, .2], [-.15, .60, .36, .26],
  [.2, .62, .40, .27], [.48, .60, .32, .23], [.7, .62, .2, .165], [.9, .645, .17, .14], [1.08, .635, .155, .12], [1.24, .60, .11, .085], [1.36, .565, .045, .038]];
const FA_AB_RLC = [{ skin: 0x4a4e44, belly: 0xb8a888, frill: 0xb84a2a }, { skin: 0x3a4048, belly: 0x9a8a6a, frill: 0xd0902a }, { skin: 0x6a5a48, belly: 0xc0b090, frill: 0x3a7a6a }];
ANIMAL({
  key: 'riding-lizard', name: 'Riding lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['semiarid', 'subhumid', 'arid'], climate: ['tropic', 'hypertropic'], riparian: 'both', abyssal: true,
    domestic: true, herdedBy: ['locus', 'verge', 'mungo'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen', 'marsh'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 3.05, height: 0.9 },
  source: [{ build: 'settlements/verge', file: 'src/77-verge-rigs.js', lines: '311-364', note: 'ported from here (the richer): ridden by Lower Verge\'s people and the nomad squads below the descent (camels above); four looks (skin, belly, frill), a saddle (tack)' },
    { build: 'settlements/locus', file: 'src/84-life.js', lines: '431-434', note: 'the life layer\'s riding lizard: a big upright beast (back 1.8 m, 6 m long) with a raised frill and a saddle; ridden by Locus\'s people (the great breed)' },
    { build: 'settlements/mungo', file: 'src/84-mungo-life.js', lines: '34-37', note: 'the nomads\' riding lizards, the Locus beast again: ridden in, left in the caravanserai\'s court for the night (the great breed)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: true },
  yields: { meat: { amount: 120, note: 'a riding beast dressed (the great breed about 800); eaten only when old or lamed' },
    eggs: { amount: 14, note: 'a clutch a year in the stable yard\'s warm sand; most are left to hatch' },
    hide: { amount: 1, hideM2: 2.4, note: 'supple scaled leather: boots, belts, the saddles themselves' } },
  life: { maturity: 4, lifespan: 35, litter: 14, gestation: 75, note: 'gestation: the clutch\'s incubation in days; broken to the saddle in its fifth year' },
  variants: 3, variantNames: ['olive, red frill', 'slate, saffron frill', 'sand, teal frill'],
  breeds: { riding: { scale: 1, mass: 340, role: 'riding mount (Verge)' }, great: { scale: 1.9, mass: 2300, role: 'the great riding lizard of Locus and Mungo' } },
  w: 1.65, d: 3.1, h: 1.1,
  data: { mass: 340, legs: 4, speed: { walk: 1.5, run: 8 }, gait: { type: 'sprawl', freq: 1.2, stride: 0.6 }, grazePitch: 0.3,
    herd: 'kept singly by its rider; a string in a nomad squad', fleeDistance: 0, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_RLC[A.variant] || FA_AB_RLC[0], S = A.S, R = faAbRows(FA_AB_RL, S, 0), f = faAbCR(R), n = R.length - 1, edge = faAbMix(C.frill, 0x1a1410, 0.55);
    const skin = (T, a) => { const top = Math.cos(a), mot = 0.82 + 0.26 * faHash(Math.floor(T * 90), Math.floor((a + 7) * 3.2), 3.3);
      return faAbMix(C.skin, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.15)), mot); };
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 20, 18, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 20, 14, null, { round: [0.04, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.4 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'scale', f, 7.4 / n, 1, 16, 16, null, { round: [0, 0.14], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.128 * S, 0.69 * S, 0.97 * S, 0.032 * S, 0.03 * S, 0.032 * S, 0x120c08, { seg: 8 });
        A.ellip('eye', s * 0.146 * S, 0.695 * S, 0.975 * S, 0.013 * S, 0.013 * S, 0.013 * S, 0xd8a040, { seg: 6 });
        const L = [[s * .15, .6, .92], [s * .12, .585, 1.18], [s * .05, .57, 1.3]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.008 * S, 0.008 * S, 0x2a1a12, 5);
        A.ellip('mouth', s * 0.03 * S, 0.6 * S, 1.31 * S, 0.009 * S, 0.007 * S, 0.007 * S, 0x140e0a, { seg: 6 });
      }
      /* the frill: a collar flaring back over the shoulders like a shallow cone, open underneath, ribbed, its rim dark */
      faAbSheet2(A, 'scale', (u, v) => { const a = -0.22 * Math.PI + 1.44 * Math.PI * u, sc = 1 + 0.07 * Math.sin(u * Math.PI * 11) * v * v;
          return [Math.cos(a) * (0.16 + 0.3 * v) * sc * S, (0.63 + 0.03 * v + Math.sin(a) * (0.14 + 0.25 * v) * sc) * S, (0.83 - 0.2 * v - 0.04 * v * v) * S]; },
        22, 4, null, (u, v) => { const rib = Math.abs(((u * 11) % 1) - 0.5) > 0.4; return v > 0.8 ? edge : faAbShade(C.frill, (rib ? 0.72 : 0.9) + 0.1 * (1 - v)); });
    });
    /* the legs, sprawled as a monitor's: the upper limb out and a little down from the shoulder and the hip, the elbow and
       the knee wide (the knee forward), then down to the wrist and the ankle, a broad pad and five splayed clawed toes */
    const LEGS = [[.27, .42, 1, 1, 0], [.27, .42, 1, -1, 1], [.28, -.26, 0, 1, 2], [.28, -.26, 0, -1, 3]];
    for (const [x, z, front, s, i] of LEGS) {
      const jt = [s * x * S, 0.55 * S, z * S];
      A.part('leg' + i, jt, () => {
        const pts = (front ? [[.2, .57, .42, .13], [.5, .42, .37, .09], [.55, .13, .47, .066], [.56, .055, .51, .062]]
          : [[.21, .57, -.26, .15], [.53, .46, -.15, .105], [.58, .13, -.35, .072], [.59, .055, -.39, .068]]).map(q => [s * q[0] * S, q[1] * S, q[2] * S, q[3] * S]);
        faAbSprawlLeg(A, 'scale', pts, front, s, C.skin, faAbMix(C.skin, C.belly, 0.25), 0x1e1a14);
      });
    }
    A.profile(t => { const q = f(t); return { z: q[2], y: q[1], hw: q[3], hh: q[4] }; });
    A.anchor('saddle', [0, 0.89 * S, 0.04 * S]); A.anchor('bridle', [0, 0.6 * S, 1.25 * S]); A.anchor('chest', [0, 0.6 * S, 0.6 * S]);
    A.anchor('tailRoot', [R[4][0], R[4][1], R[4][2]]); A.anchor('headRoot', [hp[0], hp[1], hp[2]]);
  }
});

/* ================================================================ the dromedary
   Verge's camel rig (the richer: the deep barrel and the hump, the arched neck dropping before it rises, the darker
   muzzle, the callused knees, the broad dark pads, the tail's tuft); Yuni's caravanserai draws a simpler pack camel.
   Shoulder 1.9 m, hump 2.31 m, 3 m long. The legs bend as a camel's do: the front leg's knee (the wrist) a callused knob
   with the cannon below it; the hind leg's stifle low under the belly, the gaskin running back to the hock. */
const FA_AB_DROM = [0xc8a878, 0x9a7048, 0xd8c4a0];
ANIMAL({
  key: 'dromedary', name: 'Dromedary', group: 'abyss',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh', 'BWk'], aridity: ['arid', 'semiarid'], climate: ['tropic', 'temperate'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['iziz', 'verge', 'yuni'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs'] },
  size: { length: 2.9, height: 2.31 },
  source: [{ build: 'settlements/verge', file: 'src/77-verge-rigs.js', lines: '240-309', note: 'ported from here (the richer): Upper Verge\'s caravans (3 to 5 laden camels, each with its driver) and porters, who lead them down the trail to Lower Verge; ridden by the nomads above the descent; bales, crates and a riding saddle (tack)' },
    { build: 'settlements/yuni', file: 'src/56-mid.js', lines: '452-465, 523', note: 'a static pack camel (swept body, hump, arched neck, a load) at the caravanserai of the desert road' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 260, note: 'dressed; the hump\'s fat rendered' },
    milk: { amount: 5, note: 'in milk about a year after each calf' },
    hide: { amount: 1, hideM2: 4, note: 'thick leather: water bags, saddlery, sandals' },
    hair: { amount: 2, note: 'shed and combed out each spring: rope, cloth and tent felt' } },
  life: { maturity: 4, lifespan: 40, litter: 1, gestation: 390 },
  variants: 3, variantNames: ['sand', 'brown', 'cream'],
  w: 0.88, d: 2.95, h: 2.34,
  data: { mass: 520, legs: 4, speed: { walk: 1.4, run: 11 }, gait: { type: 'quadruped', freq: 0.8, stride: 0.75 }, grazePitch: 1.2,
    herd: 'a caravan string of 3 to 5, each with its driver; a porter leads 1 or 2', fleeDistance: 0, aggression: 0.1, load: 'about 180 kg: bales, crates, or a rider',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'WORK', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const coat = FA_AB_DROM[A.variant] || FA_AB_DROM[0], muzzle = faAbMix(coat, 0x3a2a1e, 0.35), pad = faAbShade(coat, 0.45), call = faAbShade(coat, 0.62);
    const fur = (k) => (t, a) => faAbMix(coat, faAbShade(coat, 1.12), Math.max(0, -Math.cos(a)) * 0.5, k * (0.94 + 0.1 * faNoise(t * 9, a * 1.7, 4.2)));
    /* ---- the barrel, the chest deep, the belly tucked up to the narrow loins; the hump grows out of the back in one skin
       (a swelling of the barrel's section, not a separate piece), high and rounded over the middle; the chest's callus */
    const bf = faAbCR([[0, 1.52, -1.0, .03, .03], [0, 1.5, -.94, .18, .26], [0, 1.48, -.82, .26, .35], [0, 1.46, -.56, .29, .39], [0, 1.44, -.2, .315, .44],
      [0, 1.43, .15, .325, .47], [0, 1.44, .45, .3, .44], [0, 1.47, .65, .24, .35], [0, 1.52, .8, .12, .19], [0, 1.55, .86, .03, .04]]);
    const hump = (t, a) => { const q = bf(t), u = (q[2] + 0.16) / 0.45, v = Math.sin(a) * q[3] / 0.23; if (Math.abs(u) >= 1 || Math.abs(v) >= 1 || Math.cos(a) <= 0) return 0;
      return 0.43 * Math.pow(1 - u * u, 1.05) * Math.pow(1 - v * v, 1.2); };
    faAbTube(A, 'sleek', bf, 30, 22, null, { round: [0.05, 0.05], bump: hump, colf: fur(1) });
    A.ellip('skin', 0, 0.99, 0.3, 0.13, 0.06, 0.17, call, { seg: 10 });
    /* ---- the tail, a dark tuft at its end */
    A.part('tail', [0, 1.6, -.95], () => {
      faAbLeg(A, 'sleek', [[0, 1.62, -.93, .05], [0, 1.3, -1.025, .036], [0, 1.02, -1.035, .024]], 8, coat, { sharp: 0.3, round: [0, 0.1] });
      const tl = [];
      for (let i = 0; i < 7; i++) tl.push({ at: [A.rr(-0.015, 0.015), 1.06, -1.035], dir: [A.rr(-0.2, 0.2), -1, A.rr(-0.2, 0.1)], len: A.rr(0.1, 0.16), w: 0.035, col: faAbShade(coat, 0.35), curl: 0.05 });
      A.locks('hair', tl);
    });
    /* ---- the neck (deep at the withers, down from the shoulders, then up) and the head, the muzzle darker, the heavy lower lip */
    A.part('head', [0, 1.6, .62], () => {
      const nf = faAbCR([[0, 1.6, .52, .19, .26], [0, 1.555, .68, .16, .22], [0, 1.51, .9, .13, .16], [0, 1.51, 1.08, .118, .135], [0, 1.6, 1.25, .105, .12], [0, 1.8, 1.37, .1, .11], [0, 1.95, 1.45, .095, .1]]);
      faAbTube(A, 'sleek', nf, 24, 14, null, { round: [0.12, 0], colf: fur(1.02) });
      const hd = faAbCR([[0, 2.02, 1.28, .04, .05], [0, 2.01, 1.34, .1, .12], [0, 2.0, 1.55, .085, .105], [0, 1.96, 1.74, .064, .084], [0, 1.93, 1.83, .035, .045]]);
      faAbTube(A, 'sleek', hd, 16, 14, null, { round: [0.12, 0.14], colf: (t, a) => t > 0.62 ? muzzle : faAbMix(coat, muzzle, Math.max(0, t - 0.4) * 2) });
      A.ellip('sleek', 0, 1.875, 1.77, 0.05, 0.03, 0.07, muzzle, { seg: 10 });
      for (const s of [-1, 1]) {
        A.ellip('sleek', s * 0.08, 2.09, 1.42, 0.04, 0.02, 0.05, faAbShade(coat, 0.9), { seg: 8 });
        A.ellip('eye', s * 0.088, 2.06, 1.42, 0.028, 0.028, 0.028, 0x1a120c, { seg: 8 });
        A.ellip('mouth', s * 0.03, 1.965, 1.815, 0.008, 0.012, 0.008, 0x1a120c, { seg: 6 });
      }
    });
    for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.08, 2.08, 1.36], () => A.cone('sleek', [s * 0.075, 2.07, 1.37], [s * 0.12, 2.17, 1.33], 0.03, 0.006, coat, 7));
    /* ---- the legs, each one smooth skin turning about its top; front: the elbow free of the chest, the long forearm, the
       callused knee (the wrist), the thin cannon, the fetlock and the pastern; hind: the thigh, the low stifle, the gaskin
       back to the hock, the cannon; then the broad dark pad and its two nails */
    const LEGS = [[.2, .5, 1, 0], [-.2, .5, 1, 1], [.21, -.66, 0, 2], [-.21, -.66, 0, 3]];
    for (const [x, z, front, i] of LEGS) A.part('leg' + i, [x, 1.32, z], () => {
      const s = Math.sign(x), X = q => x + s * q;
      const pts = front ? [[X(-.06), 1.4, z + .02, .13], [x, 1.12, z - .06, .1], [x, .73, z + .02, .062], [x, .2, z + .02, .044], [x, .075, z + .07, .052]]
        : [[X(-.07), 1.42, z, .16], [x, 1.0, z + .15, .1], [x, .74, z - .12, .058], [x, .2, z - .07, .044], [x, .075, z - .02, .052]];
      faAbLeg(A, 'sleek', pts, 12, null, { sharp: 0.16, nt: 30, round: [0.08, 0.04], colf: fur(0.98) });
      const kn = pts[2];
      if (front) A.ellip('skin', kn[0], kn[1], kn[2] + 0.028, 0.05, 0.06, 0.04, faAbMix(coat, call, 0.6), { seg: 10 });
      else A.ellip('sleek', kn[0], kn[1] + 0.01, kn[2] - 0.025, 0.05, 0.07, 0.05, coat, { seg: 10 });
      const fz = pts[4][2];
      A.ellip('skin', x, 0.045, fz + 0.04, 0.1, 0.045, 0.13, pad, { seg: 12 });
      for (const k of [-1, 1]) A.ellip('hoof', x + k * 0.04, 0.03, fz + 0.13, 0.035, 0.025, 0.04, 0x2a2018, { seg: 8 });
    });
    A.anchor('saddle', [0, 2.31, -0.13]); A.anchor('pack', [0, 2.27, -0.13]); A.anchor('bridle', [0, 1.98, 1.62]);
    A.anchor('lead', [0, 1.95, 1.75]); A.anchor('chest', [0, 1.5, 0.7]);
  }
});

/* ---- kits/fauna/krator-fauna-bay.js ---- */
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

/* ---- kits/fauna/krator-fauna-crawlers.js ---- */
/* ======================================================================
   Krator Fauna: crawlers (kits/fauna/krator-fauna-crawlers.js)
   The many-legged beasts of the hyperjungle: the draught millipede that walks the beast lifts' capstans (Girder, Mav's
   Refuge) and is ranched by the Screamers, and the giant riding spider of Mav's Refuge. Ported 2026-10-06 from the
   settlements' own builders (the sources below); metres throughout (the source builds are already in metres).
   ====================================================================== */
/* a colour lerp the way Girder's and Mav's shade() does it: toward white (f > 0) or toward 0x120f0a (f < 0), sRGB hex */
function faCrShade(hex, f) {
  const to = f >= 0 ? 0xffffff : 0x120f0a, k = Math.abs(f);
  const ch = (h, s) => (h >> s) & 255, mix = s => Math.round(ch(hex, s) + (ch(to, s) - ch(hex, s)) * k);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}
function faCrLerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* ---------------------------------------------------------------- the draught millipede
   Girder's builder (78-life.js): 13 segments 0.56 m apart, each a 1.25 x 0.62 m chitin barrel (dark brown) under a wider,
   paler tergite plate (1.42 m, the paranota), an ochre collar on its front face and one leg pair (an ochre femur angled down
   and out, a darker tibia to the ground at x 1.12); the first segment carries the antennae and mandibles, the fourth the
   harness blanket and the capstan-bar block. Mav's Refuge draws the same segment. The Screamers' ranch herd (94-life.js) is
   a cruder chain of spheres, tapering to both ends, every third segment ochre: variant 1 keeps that taper and banding. */
const FA_CR_MIL = { body: 0x4a2e22, accent: 0xb8683e, plate: faCrShade(0x4a2e22, 0.10), tibia: faCrShade(0xb8683e, -0.25),
  mand: faCrShade(0xb8683e, -0.15), leg2: 0x3a241c, cloth: 0x7a2028, timber: 0x4e3a28, eye: 0x120c08 };
const FA_CR_MIL_N = 13, FA_CR_MIL_D = 0.56;
ANIMAL({
  key: 'draught-millipede', name: 'Draught millipede', group: 'crawlers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af', 'Am'], aridity: ['humid'], climate: ['hypertropic', 'tropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders', 'screamers'], diet: 'herbivore', feeding: 'detritivore', activity: 'cathemeral', temperament: 'docile',
    habitat: ['ground', 'trunks', 'pen'], locomotion: ['walks', 'climbs'] },
  size: { length: 7.3, height: 1.05 },
  source: [
    { build: 'settlements/girder', file: 'src/78-life.js', lines: '221-234', note: 'the segment (body, tergite, collar, leg pair; head and saddle bits): the richer model, ported here. Lines 480-498 and 553-558: one beast of 13 segments (0.56 m) per beast lift, walking the capstan round with a Millipede handler (the Beast Riders of Girder); src/55-arch.js 507-515: the millipede pen (shelter, trough, leaf-litter heaps, wallow)' },
    { build: 'settlements/mavs-refuge', file: 'src/78-life.js', lines: '188-203', note: 'the same segment (a saddle blanket on segment 4); lines 462-508: the beast lifts\' millipedes of the Refuge, each with a handler' },
    { build: 'settlements/screamers', file: 'src/94-life.js', lines: '152-207', note: 'the Screamers\' ranch herd: eight beasts of 13 sphere segments (radius to len x 0.085, len 13-25), tapering to both ends, every third segment ochre, box legs 0x3a241c, wandering at 2.2-4.6 m/s inside the stockade (variant 1 here). src/71-village.js 437-458: the millipede ranch (a double stockade, "because they climb"; troughs, shelter) and an unused static builder' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: false },
  yields: { meat: { amount: 900, note: 'the Screamers ranch them for it: the pale flesh inside the rings, smoked in strips' },
    hide: { amount: 1, hideM2: 9, note: 'the tergite plates, taken off ring by ring: shields, shingles, bowls and scoops' } },
  life: { maturity: 3, lifespan: 30, litter: 60, gestation: 40, note: 'eggs in a nest of chewed litter; a young beast adds rings (and legs) at each moult' },
  variants: 2, variantNames: ['Girder draught beast: harnessed for the capstan, ochre collars', 'Screamer ranch beast: tapering, every third ring ochre'],
  w: 2.35, d: 8.3, h: 1.4,
  variantDims: [{ w: 2.35, d: 8.3, h: 1.4 }, { w: 3.55, d: 12.4, h: 1.6 }],
  data: { mass: [4000, 13000], legs: 26, segs: 12, speed: { walk: 1.0, run: 4.0 }, gait: { type: 'multipede', freq: 1.1, stride: 0.35 }, chain: { amp: 0.22, wave: 7 }, grazePitch: 0.25,
    budget: 9000,
    herd: 'Girder and Mav\'s Refuge: one to a beast lift, walked round its capstan by a handler and penned at night; the Screamers ranch herds of eight behind a double stockade',
    fleeDistance: 0, aggression: 0.05,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = (v === 1 ? 1.5 : 1) * A.S, C = FA_CR_MIL, N = FA_CR_MIL_N;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1), f = v === 1 ? 1 - 0.45 * Math.abs(t * 2 - 1) : 1, zk = (6 - k) * FA_CR_MIL_D;
      /* a point of segment k: x and y shrink with the Screamer taper, z (the ring's depth) does not */
      const P = (x, y, dz) => [x * f * K, y * f * K, (zk + dz) * K];
      const band = v === 1 && k % 3 === 0;
      const bodyC = band ? C.accent : C.body, plateC = band ? faCrShade(C.accent, 0.08) : C.plate, collarC = band ? faCrShade(C.accent, -0.2) : C.accent;
      const femC = v === 1 ? C.leg2 : C.accent, tibC = v === 1 ? faCrShade(C.leg2, -0.2) : C.tibia;
      const ring = () => {
        /* the barrel, slightly swollen at its middle; its rear tucks under the ring behind */
        A.tube('chitin', u => P(0, 0.62, -0.32 + 0.64 * u), u => { const s = 0.9 + 0.1 * Math.sin(Math.PI * u); return [0.625 * f * K * s, 0.31 * f * K * s]; }, 5, 14, bodyC,
          { colf: (u, a) => Math.cos(a) < -0.6 ? faCrShade(bodyC, 0.08) : bodyC });
        /* the collar: the ochre band on the ring's front face, its upper half */
        A.tube('chitin', u => P(0, 0.63, 0.2 + 0.1 * u), () => [0.655 * f * K, 0.325 * f * K], 1, 14, null,
          { colf: (u, a) => Math.cos(a) > -0.25 ? collarC : bodyC });
        /* the tergite: a wide, paler lens of a plate over the back, overhanging the sides */
        A.tube('chitin', u => P(0, 0.955, -0.25 + 0.5 * u), u => [0.71 * f * K, 0.075 * f * K * (0.75 + 0.25 * Math.sin(Math.PI * u))], 2, 12, plateC, { caps: true });
      };
      const name = k === 0 ? 'head' : 'seg' + (k - 1), pivot = k === 0 ? P(0, 0.62, -0.3) : P(0, 0.62, 0);
      A.part(name, pivot, () => {
        ring();
        if (k === 0) {
          /* the head capsule under the first ring, with its ocelli, and the antennae (Girder: 1.1 m, up, out and forward) */
          A.ellip('chitin', 0, 0.54 * f * K, (zk + 0.33) * K, 0.44 * f * K, 0.26 * f * K, 0.2 * K, faCrShade(C.body, -0.15), { seg: 14 });
          for (const s of [-1, 1]) {
            A.ellip('eye', s * 0.31 * f * K, 0.62 * f * K, (zk + 0.43) * K, 0.045 * f * K, 0.04 * f * K, 0.04 * K, C.eye, { seg: 6 });
            const a0 = P(s * 0.18, 0.74, 0.4), a1 = P(s * 0.3, 1.08, 0.72), a2 = P(s * 0.47, 1.34, 1.0);
            A.tube('chitin', u => u < 0.5 ? faCrLerp(a0, a1, u * 2) : faCrLerp(a1, a2, u * 2 - 1), u => { const r = (0.032 - 0.018 * u) * f * K; return [r, r]; }, 6, 6, null,
              { caps: true, colf: u => (Math.floor(u * 6 + 0.01) % 2) ? C.accent : C.tibia });
          }
          /* the mandibles: the jaw, turning with the head */
          A.part('jaw', P(0, 0.45, 0.3), () => {
            for (const s of [-1, 1]) A.tube('chitin', u => faCrLerp(P(s * 0.38, 0.45, 0.24), P(s * 0.2, 0.43, 0.62), u), u => [(0.075 - 0.04 * u) * f * K, (0.08 - 0.045 * u) * f * K], 3, 8, C.mand, { caps: true });
          });
        }
        if (k === 3 && v === 0) {
          /* the harness: a blanket over the fourth ring and the block the capstan bar pegs into */
          A.tube('plain', u => P(0, 1.06, -0.31 + 0.62 * u), () => [0.42 * K, 0.1 * K], 2, 12, C.cloth, { caps: true, colf: (u, a) => Math.abs(Math.sin(a)) > 0.93 ? 0xc2a24e : C.cloth });
          A.tube('plain', u => P(-0.25 + 0.5 * u, 1.26, -0.22), () => [0.05 * K, 0.12 * K], 1, 6, C.timber, { caps: true });
          A.anchor('harness', P(0, 1.26, -0.22));
        }
      });
      if (k === N - 1) A.part('tail', P(0, 0.62, -0.3), () => {
        /* the last ring's anal valves */
        A.ellip('chitin', 0, 0.6 * f * K, (zk - 0.36) * K, 0.4 * f * K, 0.24 * f * K, 0.13 * K, faCrShade(bodyC, -0.1), { seg: 12 });
      });
      /* the leg pair: each leg its own part, swinging at its hip (the multipede gait's wave runs down them) */
      for (const s of [1, -1]) {
        const hip = P(s * 0.58, 0.55, 0), knee = P(s * 1.1, 0.38, 0.03), foot = P(s * 1.14, 0, 0.07);
        A.part('leg' + (2 * k + (s > 0 ? 0 : 1)), hip, () => {
          A.tube('chitin', u => faCrLerp(hip, knee, u), u => { const r = (0.065 - 0.012 * u) * f * K; return [r, r]; }, 2, 6, femC, { caps: true });
          A.tube('chitin', u => faCrLerp(knee, foot, u), u => { const r = (0.055 - 0.028 * u) * f * K; return [r, r]; }, 3, 6, tibC, { caps: true });
        });
      }
    }
    /* the ventral strip the rings ride on (the body part: what a port binds as the root) */
    A.tube('chitin', u => [0, 0.36 * K, (-3.5 + 7.0 * u) * K], u => { const f = v === 1 ? 1 - 0.45 * Math.abs(u * 2 - 1) : 1; return [0.3 * f * K, 0.06 * f * K]; }, 12, 8, faCrShade(C.body, 0.15));
    A.anchor('headRoot', [0, 0.62 * K, 3.06 * K]);
  }
});

/* ---------------------------------------------------------------- the giant spider
   Mav's Refuge (79-spiders.js): the cephalothorax an ellipsoid 1.0 x 0.55 x 1.3 m with a red stripe and paler flanks, the
   abdomen 1.3 x 1.05 x 1.85 m with a red dorsal stripe, gold chevrons and a spinneret; red chelicerae with gold fangs, eight
   eyes, pedipalps; eight legs of three segments (femur, patella-tibia, tarsus), each dark with a red band at its far end,
   laid out by the build's own table (hips on the cephalothorax, home feet on the ground) and bent by its own two-bone IK
   with the body 1.25 m up. Its frame has the origin at the pedicel; here the origin is under the middle of the body (the
   pedicel 0.85 m behind it). The rider and the tack (saddle, panniers, reins) stay with the Beast Riders: anchor 'saddle'. */
const FA_CR_SPI = { dark: 0x2a2622, red: 0x7a2028, gold: 0xc2a24e };
const FA_CR_SPI_LEG = { hipx: [0.80, 0.92, 0.92, 0.78], hipz: [1.85, 1.35, 0.85, 0.35], homeA: [0.60, 1.22, 1.88, 2.55], homeR: [5.0, 4.6, 4.5, 5.1],
  l1: [2.9, 2.6, 2.55, 2.95], l2: [3.3, 2.9, 2.85, 3.35] };
const FA_CR_SPI_H = 1.25, FA_CR_SPI_Z = 0.85;
/* the build's IK at rest on flat ground (79-spiders.js, 'ankle, then 2-bone IK with the knee lifted along body-up'), in its
   body frame (origin the pedicel, y up): hip, knee, ankle and foot of leg row r on side s */
function faCrSpiderLeg(r, s) {
  const L = FA_CR_SPI_LEG, H = [s * L.hipx[r], 0, L.hipz[r]], F = [s * Math.sin(L.homeA[r]) * L.homeR[r], -FA_CR_SPI_H + 0.02, Math.cos(L.homeA[r]) * L.homeR[r] + 1.0];
  let tox = H[0] - F[0], toz = H[2] - F[2]; const tl = Math.hypot(tox, toz) || 1;
  const k = [F[0] + tox / tl * 0.32, F[1] + 0.62, F[2] + toz / tl * 0.32];
  const l1 = L.l1[r], l2 = L.l2[r]; let dx = k[0] - H[0], dy = k[1] - H[1], dz = k[2] - H[2], D = Math.hypot(dx, dy, dz) || 1e-4;
  dx /= D; dy /= D; dz /= D; D = Math.min(D, (l1 + l2) * 0.985); D = Math.max(D, Math.abs(l2 - l1) + 0.05);
  const aa = (l1 * l1 - l2 * l2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
  let px = -dx * dy, py = 1 - dy * dy, pz = -dz * dy; const pl = Math.hypot(px, py, pz) || 1;
  const K = [H[0] + dx * aa + px / pl * hh, H[1] + dy * aa + py / pl * hh, H[2] + dz * aa + pz / pl * hh];
  return { hip: H, knee: K, ankle: [H[0] + dx * D, H[1] + dy * D, H[2] + dz * D], foot: F };
}
ANIMAL({
  key: 'giant-spider', name: 'Giant riding spider', group: 'crawlers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'cathemeral', temperament: 'defensive',
    habitat: ['canopy', 'trunks', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] },
  size: { length: 6.6, height: 3.7 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/79-spiders.js', lines: '434-508', note: 'the geometry (cephalothorax, abdomen, leg segment, tack); lines 557-560 the leg layout and 764-812 the leg IK. Ridden by the Refuge\'s spider-riders (the Spider tribe of the Beast Riders) on patrols that climb the hypertrees\' trunks, walk the limbs and leap on draglines; nest spiders and juveniles (scale 0.45-0.55) live on and around the Silk Loft, some led by handlers' }],
  traits: { edible: false, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { silk: { amount: 2, note: 'dragline silk drawn from a kept nest spider: for the Silk Loft looms' }, hide: { amount: 1, hideM2: 4, note: 'a moulted or dead beast\'s chitin: lamellar plates, bowls, lamp shades; the dragline silk (the Silk Loft\'s, about 2 kg a year a nest spider) has no yield kind yet' } },
  life: { maturity: 4, lifespan: 25, litter: 300, gestation: 45, note: 'an egg sac of a few hundred in the Silk Loft; the handlers raise a few spiderlings, the rest are let go into the canopy' },
  variants: 2, variantNames: ['adult (patrol and nest spiders)', 'juvenile (half size, paler)'],
  w: 8.8, d: 9.4, h: 3.7,
  variantDims: [{ w: 8.8, d: 9.4, h: 3.7 }, { w: 4.4, d: 4.7, h: 1.85 }],
  data: { mass: [700, 90], legs: 8, legSpan: 8.7, silk: 'draglines and the Silk Loft\'s looms', speed: { walk: 2.8, run: 5.6 }, gait: { type: 'octopod', freq: 0.8, stride: 3.2 }, grazePitch: 0.12,
    herd: 'patrols of riders, one rider to a spider; nest spiders in a colony at the Silk Loft', fleeDistance: 0, aggression: 0.4, leap: 'ballistic leaps between limbs at g 7.4 m/s2, trailing a dragline',
    schedule: ['REST', 'REST', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'PATROL', 'IDLE', 'PATROL', 'PATROL', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'IDLE', 'PATROL', 'PATROL', 'HUNT', 'HUNT', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, S = (v === 1 ? 0.5 : 1) * A.S, C = FA_CR_SPI, H0 = FA_CR_SPI_H, Z0 = FA_CR_SPI_Z;
    /* the build's instance tint: adults darkened a little (0.78-1.0), juveniles full and a touch warmer */
    const tint = hex => { const r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255; return v === 1 ? [r, g, b * 0.9] : [r * 0.9, g * 0.9, b * 0.9]; };
    const DARK = tint(C.dark), RED = tint(C.red), GOLD = tint(C.gold), DARK2 = tint(faCrShade(C.dark, 0.1)), EYE = tint(faCrShade(C.dark, -0.55));
    const M = p => [p[0] * S, (p[1] + H0) * S, (p[2] + Z0) * S];   /* the build's body frame (pedicel origin) -> this frame */
    /* the cephalothorax: the red stripe down the middle, paler flanks */
    A.ellip('chitin', 0, H0 * S, (1.15 + Z0) * S, 1.0 * S, 0.55 * S, 1.3 * S, null, { seg: 20, colf: (x, y, z) => {
      x /= S; y /= S; z = z / S + 1.15;
      return (Math.abs(x) < 0.26 && y > 0.25 && z < 1.9) ? RED : (y > 0.1 && Math.abs(x) > 0.55 && Math.abs(z - 1.15) < 0.8 ? DARK2 : DARK); } });
    /* eight eyes */
    for (const e of [[-0.17, 0.30, 2.30, 0.15], [0.17, 0.30, 2.30, 0.15], [-0.42, 0.33, 2.12, 0.10], [0.42, 0.33, 2.12, 0.10], [-0.30, 0.45, 1.95, 0.08], [0.30, 0.45, 1.95, 0.08], [-0.55, 0.36, 1.85, 0.08], [0.55, 0.36, 1.85, 0.08]]) {
      const p = M(e); A.ellip('eye', p[0], p[1], p[2], e[3] * S, e[3] * S, e[3] * S, EYE, { seg: 6 });
    }
    /* the abdomen: red dorsal stripe, gold chevrons along its shoulders, a paler belly; the spinneret behind */
    A.ellip('chitin', 0, (0.28 + H0) * S, (-1.9 + Z0) * S, 1.3 * S, 1.05 * S, 1.85 * S, null, { seg: 24, colf: (x, y, z) => {
      x /= S; y = y / S + 0.28; z = z / S - 1.9;
      if (Math.abs(x) < 0.34 && y > 0.75) return RED;
      if (y > 0.55 && Math.abs(x) > 0.45 && Math.abs(x) < 1.0 && Math.sin(z * 3.3) > 0.35) return GOLD;
      return y < -0.2 ? DARK2 : DARK; } });
    A.cone('chitin', M([0, 0.05, -3.55]), M([0, 0.05, -4.15]), 0.22 * S, 0.03 * S, DARK2, 8);
    /* the pedicel, the narrow waist between the two */
    A.tube('chitin', u => M([0, 0.02, -0.3 + 0.4 * u]), () => [0.36 * S, 0.3 * S], 1, 10, DARK2);
    /* a leg segment as the build draws it: radius r at its root, 0.7 r at its end, the last quarter red (the knee band) */
    const U = [0, 0.37, 0.73, 0.75, 1], seg = (a, b, r, ns) => A.tube('chitin', u => faCrLerp(a, b, U[Math.round(u * 4)]),
      u => { const w = r * (1 - 0.3 * U[Math.round(u * 4)]); return [w, w]; }, 4, ns || 8, null, { caps: true, colf: u => U[Math.round(u * 4)] > 0.74 ? RED : DARK });
    /* the mouthparts (the head part): red chelicerae, the pedipalps; the gold fangs are the jaw */
    A.part('head', M([0, -0.1, 2.2]), () => {
      for (const s of [-1, 1]) {
        A.cone('chitin', M([s * 0.27, -0.069, 2.51]), M([s * 0.27, -0.77, 2.13]), 0.24 * S, 0.13 * S, RED, 8);
        const b0 = M([s * 0.34, -0.12, 2.2]), m1 = M([s * 0.52, 0.10, 2.95]), t1 = M([s * 0.40, -0.50, 3.35]);
        seg(b0, m1, 0.15 * S, 6); seg(m1, t1, 0.11 * S, 6);
      }
      A.part('jaw', M([0, -0.72, 2.29]), () => {
        for (const s of [-1, 1]) A.cone('chitin', M([s * 0.24, -0.72, 2.29]), M([s * 0.24, -1.12, 2.43]), 0.08 * S, 0.012 * S, GOLD, 6);
      });
    });
    /* the legs: pairs front to back, left (+x) then right; each turns about its hip */
    for (let r = 0; r < 4; r++) for (const s of [1, -1]) {
      const L = faCrSpiderLeg(r, s), hip = M(L.hip), knee = M(L.knee), ankle = M(L.ankle), foot = M(L.foot);
      A.part('leg' + (2 * r + (s > 0 ? 0 : 1)), hip, () => {
        A.ellip('chitin', hip[0], hip[1], hip[2], 0.26 * S, 0.24 * S, 0.26 * S, DARK, { seg: 8 });
        seg(hip, knee, 0.23 * S);
        A.ellip('chitin', knee[0], knee[1], knee[2], 0.17 * S, 0.17 * S, 0.17 * S, RED, { seg: 8 });
        seg(knee, ankle, 0.17 * S);
        seg(ankle, foot, 0.11 * S, 6);
      });
    }
    A.anchor('saddle', M([0, 0.68, 0.78]));
    A.anchor('bridle', M([0, 0.2, 2.2]));
    A.anchor('pedicel', M([0, 0, 0]));
  }
});

/* ---- kits/fauna/krator-fauna-desert.js ---- */
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

/* ---- kits/fauna/krator-fauna-farm.js ---- */
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

/* ---- kits/fauna/krator-fauna-flyers.js ---- */
/* ======================================================================
   Krator Fauna: flyers (kits/fauna/krator-fauna-flyers.js)
   The riding flyers of the Beast Riders (LORE 6.6: the Quetzal, Wingclaw, Dragonfly and Nightwing tribes): the
   quetzalcoatlus, the giant bat, the giant archaeopteryx and the giant dragonfly. Ported from Mav's Refuge and Girder
   (src/84-flyers.js, "the models"): the same points, proportions and palette, in metres (the originals were already).

   The originals were one merged mesh each, posed in a vertex shader by a small skeleton (FLY bones: pivot, axis,
   parent; flyFold, the perched angles). Here the same skeleton poses the points at BUILD time (faFlRig): the default
   build is perched (pose 'perch' or anything but 'fly'), A.pose 'fly' builds the rest pose of the original, wings spread
   flat and legs trailing, for a host that flies the animal. The fauna runtime only turns parts, so a perched build
   flaps its folded wings in mode 'fly' (data.flap.fold is 0: the fold is in the geometry); build pose 'fly' to fly one.
   Perched stances: the quetzalcoatlus stands as azhdarchids did, on its hind feet and the hands of its folded wings;
   the bat stands on its wrists and feet with the fingers folded back along the forearm (the original hung it from a
   perch beam); the archaeopteryx stands on its feet, wings folded back along its flanks; the dragonfly rests on its
   six legs with its wings flat.
   ====================================================================== */
function faFlRot(q, a, th) {   /* q turned about the unit axis a by th (right hand, Rodrigues) */
  if (!th) return [q[0], q[1], q[2]];
  const c = Math.cos(th), s = Math.sin(th), d = a[0] * q[0] + a[1] * q[1] + a[2] * q[2];
  return [q[0] * c + (a[1] * q[2] - a[2] * q[1]) * s + a[0] * d * (1 - c), q[1] * c + (a[2] * q[0] - a[0] * q[2]) * s + a[1] * d * (1 - c),
    q[2] * c + (a[0] * q[1] - a[1] * q[0]) * s + a[2] * d * (1 - c)];
}
const faFlAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], faFlSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  faFlMul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], faFlLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  faFlCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  faFlLen = a => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),
  faFlNorm = a => { const l = faFlLen(a); return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : null; };
/* the original's shade(): toward white (f > 0) or toward a warm black (f < 0), in sRGB */
function faFlShade(hex, f) {
  const c = new THREE.Color(hex);
  if (f >= 0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x120f0a), -f);
  return c.getHex();
}
/* the skeleton of an original (bones [{p, a, par}], one angle per bone), then the animal's own placing: pitched nose-up
   by `pitch` about the shoulders (the original's perchPitch), lifted by stand, slid back by z0 (origin under the body).
   R.P(p, bone, side) poses a LEFT-side point and mirrors it for side -1 (the original's mirrored bones do the same). */
function faFlRig(bones, F, pitch) {
  const R = { stand: 0, z0: 0 };
  const pose = (p, b) => {
    let q = [p[0], p[1], p[2]];
    while (b != null && b >= 0) { const B = bones[b], v = faFlRot(faFlSub(q, B.p), B.a, F[b] || 0); q = faFlAdd(B.p, v); b = B.par; }
    return q;
  };
  R.raw = (p, b) => faFlRot(pose(p, b), [1, 0, 0], -pitch);
  R.P = (p, b, s) => { const q = R.raw(p, b); return [q[0] * (s || 1), q[1] + R.stand, q[2] - R.z0]; };
  return R;
}
/* a membrane or feather vane: the polygon fanned from its first point, as two sheets a hair apart facing away from each
   other (the families' materials are one-sided; hair is double-sided but carries the hair grain) */
function faFlFan(A, fam, pts, col, col2, off) {
  off = off == null ? 0.006 : off; const p0 = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], n = faFlNorm(faFlCross(faFlSub(a, p0), faFlSub(b, p0)));
    if (!n) continue;
    for (const sd of [1, -1]) {   /* sd 1: the face toward +n, laid a hair toward +n */
      const o = faFlMul(n, off * sd), q0 = faFlAdd(p0, o), qa = faFlAdd(a, o), qb = faFlAdd(b, o);
      A.sheet(fam, (u, v) => { const w = sd > 0 ? 1 - v : v, e = faFlLerp(qa, qb, w); return faFlLerp(q0, e, u); }, 1, 1, sd > 0 ? col : (col2 == null ? col : col2));
    }
  }
}
/* a vane of a double-sided family (membrane, feather): the same fan as ONE sheet, its triangles paired into quads
   (pi, pi+1, p0) and (p0, pi+1, pi+2), half the triangles of faFlFan's two sheets and none of them degenerate but an odd
   last one; one colour for both faces */
function faFlVane(A, fam, pts, col) {
  const p0 = pts[0];
  for (let i = 1; i < pts.length - 1; i += 2) {
    const a = pts[i], b = pts[i + 1], c = pts[i + 2] || b;
    A.sheet(fam, (u, v) => u ? (v ? c : p0) : (v ? b : a), 1, 1, col);
  }
}
function faFlRod(A, fam, a, b, r0, r1, col, seg) { A.cone(fam, a, b, r0, r1, col, seg || 6); }

/* ================================================================ QUETZALCOATLUS: span 12 m
   The original (84-flyers.js, "QUETZALCOATLUS"): bones neck, headP, headY, wing sweep, flap, twist at the shoulder S,
   outer sweep and flap at the wrist W, the legs at the hip H. Perched: the original's fold (neck up, head down, the
   arm down, the wing finger folded back up at the wrist) with the arm swung on down to the ground and the pitch eased
   from 0.35 to 0.15, so it stands on its feet and the three small fingers of each hand; the hand membrane is furled
   toward the wing finger. */
const FA_FL_Q = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], NK = [0, 0.12, 0.5], HD = [0, 0.30, 3.3], S = [0.35, 0.10, 0.25], W = [2.55, 0.10, 0.80], H = [0.22, -0.15, -1.05];
  return { NK: NK, HD: HD, S: S, W: W, H: H,
    bones: [{ p: NK, a: X, par: -1 }, { p: HD, a: X, par: 0 }, { p: HD, a: Y, par: 1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: W, a: Y, par: 5 }, { p: W, a: Z, par: 6 }, { p: H, a: X, par: -1 }],
    /*                 neck  headP headY wSw  wFlap wTw  oSw  oFlap leg */
    perch: { F: [-0.85, 1.05, 0, 0.30, -1.50, -0.30, -0.20, 2.60, -1.00], pitch: 0.15 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.6 } };
})();
ANIMAL({
  key: 'quetzalcoatlus', name: 'Quetzalcoatlus', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'defensive',
    habitat: ['sky', 'canopy', 'ground', 'shallows'], locomotion: ['flies', 'glides', 'walks'] },
  size: { length: 7.5, height: 5.6, span: 12 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '129-162, 335-340', note: 'first drawn here (FLY_Q): the Quetzal tribe\'s mount, kept in the Rookery and the hold roosts; ridden on circuits and patrols, roost traffic in the hypertrees' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '133-167, 349-354', note: 'the same model ported 2026-10-01 (plus the detail-atlas slots): 68 roost stalls on the four tower roof decks' },
    { build: 'kits/ringsea', file: 'src/75-rs-beast-rookery.js', lines: '12-19, 38-39', note: 'rsFlyer, "a great crested flyer" (10 m span, long beak, red crest): a teal-green stand-in for this animal on the Rookery Raft, three folded on the roost tower and one with wings open' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 90, note: 'dressed; the riders never eat a flyer, the jungle\'s other peoples do' },
    hide: { amount: 1, hideM2: 7, note: 'the wing membranes, tanned thin: kite and drum skins' },
    horn: { amount: 4, note: 'the beak sheath and crest' },
    eggs: { amount: 2, note: 'a clutch of two a year, laid, not eaten: the rookeries hatch every egg' } },
  life: { maturity: 6, lifespan: 45, litter: 2, gestation: 80, note: 'eggs (gestation: days of incubation); a chick is ridden from its sixth year' },
  poses: ['perch', 'fly'],
  w: 2.3, d: 6.3, h: 5.8,
  data: { mass: 280, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.6, run: 4, fly: [18, 24] }, gait: { type: 'flyer', freq: 0.8, stride: 1.4 },
    flap: { freq: 0.7, amp: 0.62, glide: 0.6, fold: 0 }, grazePitch: 1.0,
    herd: 'a pair in the wild; a rookery keeps 20 to 70 in stalls', fleeDistance: 12, aggression: 0.35,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'FLY', 'HUNT', 'PATROL', 'FLY', 'REST', 'REST', 'REST', 'PATROL', 'FLY', 'HUNT', 'FLY', 'IDLE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const Q = FA_FL_Q, fly = A.pose === 'fly', pz = fly ? Q.fly : Q.perch, F = pz.F, R = faFlRig(Q.bones, F, pz.pitch);
    R.stand = fly ? pz.stand : 0.16 - R.raw([0.27, -0.20, -2.92], 8)[1];
    R.z0 = R.raw([0, -0.05, -0.35], -1)[2];
    const P = R.P, C = [0xc8b48a, 0x8a5a3a, 0xd86a3a], body = C[0], belly = faFlShade(C[0], 0.25), dark = faFlShade(C[0], -0.35),
      mem = C[1], mem2 = faFlShade(C[1], -0.18), crest = C[2], beak = faFlShade(C[0], 0.35), eye = 0x181410;
    /* ---- the body: a fuzzed barrel, its belly paler */
    const bc = P([0, -0.05, -0.35], -1);
    A.ellip('coat', bc[0], bc[1], bc[2], 0.42, 0.40, 0.98, null, { rx: -pz.pitch, seg: 16, colf: (x, y) => y < -0.12 ? belly : body });
    A.part('tail', P([0, -0.05, -1.25], -1), () => faFlRod(A, 'coat', P([0, -0.05, -1.25], -1), P([0, -0.02, -1.75], -1), 0.12, 0.01, body, 8));
    /* ---- the head with its long neck, the dagger beak and the crest */
    const hx = F[0] + F[1] - pz.pitch;
    A.part('head', P(Q.NK, 0), () => {
      A.tube('coat', t => P(faFlLerp([0, 0.12, 0.40], [0, 0.30, 3.32], t), 0), t => { const r = 0.21 - 0.08 * t; return [r, r * 1.05]; }, 6, 10, body);
      const hc = P([0, 0.37, 3.62], 2);
      A.ellip('coat', hc[0], hc[1], hc[2], 0.17, 0.21, 0.45, body, { rx: hx, seg: 12 });
      faFlRod(A, 'horn', P([0, 0.40, 3.90], 2), P([0, 0.30, 5.75], 2), 0.15, 0.005, beak, 8);
      faFlFan(A, 'skin', [[0, 0.52, 3.35], [0, 1.12, 3.05], [0, 1.00, 3.80], [0, 0.56, 4.15]].map(p => P(p, 2)), crest, crest, 0.012);
      for (const s of [1, -1]) { const e = P([0.15, 0.42, 3.72], 2, s); A.ellip('eye', e[0], e[1], e[2], 0.035, 0.035, 0.05, eye, { rx: hx, seg: 8 }); }
    });
    A.part('jaw', P([0, 0.26, 3.70], 2), () => faFlRod(A, 'horn', P([0, 0.24, 3.85], 2), P([0, 0.24, 5.55], 2), 0.09, 0.005, beak, 7));
    /* ---- the wings: the arm (humerus to the hand) with the brachial membrane, then the great wing finger */
    const tipLine = [Q.W, [6.0, 0.10, -0.50]];
    const furl = p => {   /* perched: the hand membrane drawn in toward the wing finger */
      if (fly) return p;
      const d = faFlNorm(faFlSub(tipLine[1], tipLine[0])), q = faFlSub(p, tipLine[0]), k = q[0] * d[0] + q[1] * d[1] + q[2] * d[2], f = faFlAdd(tipLine[0], faFlMul(d, k));
      return faFlAdd(f, faFlMul(faFlSub(p, f), 0.14));
    };
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(Q.S, 5, s), () => {
      const Wp = P(Q.W, 5, s);
      faFlRod(A, 'coat', P(Q.S, 5, s), Wp, 0.13, 0.085, body, 8);
      /* the brachial membrane; perched, its body edge stays on the flank and its trailing edge is furled to the arm */
      const arm = p => { if (fly) return P(p, 5, s); const d = faFlNorm(faFlSub(Q.W, Q.S)), q = faFlSub(p, Q.S), k = q[0] * d[0] + q[1] * d[1] + q[2] * d[2], f = faFlAdd(Q.S, faFlMul(d, k));
        return P(faFlAdd(f, faFlMul(faFlSub(p, f), 0.14)), 5, s); };
      faFlVane(A, 'membrane', [fly ? P([0.35, 0.06, 0.30], 5, s) : P([0.33, 0.0, 0.25], -1, s), Wp, arm([2.62, 0.06, -0.78]), arm([1.55, 0.06, -0.95]),
        fly ? P([0.30, 0.02, -1.25], 5, s) : P([0.36, -0.02, 0.04], -1, s)], mem);
      faFlVane(A, 'membrane', [[0.35, 0.06, 0.30], [0.25, 0.10, 0.65], Q.W].map(p => P(p, 5, s)), mem2);
      /* the hand: three small clawed fingers (on the ground when perched) */
      if (fly) for (const c of [[2.62, 0.10, 1.12], [2.80, 0.10, 0.78], [2.72, 0.10, 0.95]]) faFlRod(A, 'horn', Wp, P(c, 5, s), 0.035, 0.008, dark, 5);
      else for (const o of [[-0.06, 0.30], [0.05, 0.27], [0.14, 0.18]]) faFlRod(A, 'horn', Wp, [Wp[0] + s * o[0], 0.02, Wp[2] + o[1]], 0.04, 0.012, dark, 5);
      faFlRod(A, 'coat', P(Q.W, 7, s), P(tipLine[1], 7, s), 0.075, 0.015, body, 7);
      faFlVane(A, 'membrane', [Q.W, [4.3, 0.07, 0.18], [4.75, 0.06, -0.72], [3.60, 0.06, -0.88], [2.62, 0.06, -0.78]].map(p => P(furl(p), 7, s)), mem);
      faFlVane(A, 'membrane', [[4.3, 0.07, 0.18], tipLine[1], [4.75, 0.06, -0.72]].map(p => P(furl(p), 7, s)), mem2);
    });
    /* ---- the legs: thigh and shank on one bone; the foot flat on the ground when perched */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(Q.H, 8, s), () => {
      const kn = P([0.27, -0.18, -2.05], 8, s), an = P([0.27, -0.20, -2.92], 8, s);
      faFlRod(A, 'coat', P(Q.H, 8, s), kn, 0.12, 0.07, body, 8);
      faFlRod(A, 'skin', kn, an, 0.07, 0.04, dark, 7);
      if (fly) faFlRod(A, 'skin', an, P([0.27, -0.12, -3.3], 8, s), 0.05, 0.01, dark, 5);
      else { faFlRod(A, 'skin', an, [an[0], 0.03, an[2] - 0.05], 0.045, 0.04, dark, 6);
        for (const o of [[-0.08, 0.32], [0, 0.38], [0.08, 0.32]]) faFlRod(A, 'horn', [an[0], 0.04, an[2] - 0.02], [an[0] + s * o[0], 0.015, an[2] + o[1]], 0.035, 0.01, dark, 5); }
    });
    A.anchor('saddle', P([0, 0.40, 0.10], -1)); A.anchor('bridle', P([0, 0.30, 3.3], 0));
  }
});

/* ================================================================ GIANT BAT: span 9 m
   The original ("GIANT BAT"): the arm in three (humerus S-E, forearm E-W, the three long fingers at the wrist W), the
   leg at H, ears on the head. Flight (pose 'fly'): the original's rest pose. Perched: the original hung it from a beam
   (perchPitch -90 degrees); here it stands as a bat crawls, on its wrists and feet, the elbows high, the fingers
   folded back along the forearm and down the flank with the membrane furled between them. */
const FA_FL_B = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], S = [0.40, 0.10, 0.20], E = [1.50, 0.10, -0.10], W = [2.60, 0.10, 0.60], H = [0.20, -0.10, -1.0], HD = [0, 0.10, 0.65];
  return { S: S, E: E, W: W, H: H, HD: HD, T: [[4.5, 0.10, -0.10], [3.95, 0.10, -1.35], [3.05, 0.10, -1.75]], K: [2.72, 0.06, -1.62], J: [1.40, 0.04, -1.50],
    bones: [{ p: HD, a: X, par: -1 }, { p: HD, a: Y, par: 0 }, { p: HD, a: X, par: -1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: E, a: Z, par: 5 }, { p: W, a: Y, par: 6 }, { p: W, a: Z, par: 7 }, { p: H, a: X, par: -1 }],
    perch: { F: [0.12, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0.15, stand: 0.70 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.3 } };
})();
ANIMAL({
  key: 'giant-bat', name: 'Giant bat', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'insectivore', activity: 'nocturnal', temperament: 'wary',
    habitat: ['sky', 'canopy', 'trunks'], locomotion: ['flies', 'climbs', 'walks'] },
  size: { length: 2.6, height: 2.2, span: 9 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '164-199, 335-340', note: 'first drawn here (FLY_B): the Nightwing tribe\'s mount; hangs from the roost beams by day, hunts through the night on sim-time timers and comes home staggered' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '169-205, 349-354', note: 'the same model (plus the detail-atlas slots) on Girder\'s roof-deck roosts' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 45, note: 'dressed; not eaten by the riders' },
    hide: { amount: 1, hideM2: 5, note: 'the dark fur pelt with the wing membranes: night cloaks' },
    hair: { amount: 0.4, note: 'the soft underfur, moulted at the end of the rains: felt' } },
  life: { maturity: 3, lifespan: 30, litter: 1, gestation: 160, note: 'one pup a year, carried in flight for its first month' },
  poses: ['perch', 'fly'],
  w: 2.5, d: 3.4, h: 2.0,
  data: { mass: 140, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.0, run: 2.5, fly: [12, 16] }, gait: { type: 'flyer', freq: 1.2, stride: 0.6 },
    flap: { freq: 2.0, amp: 0.78, glide: 0.1, fold: 0 }, grazePitch: 0.5,
    herd: 'a colony of 30 to 200 in a hollow trunk; the riders keep them on roost beams', fleeDistance: 10, aggression: 0.2,
    schedule: ['HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'FLY', 'HUNT', 'HUNT', 'PATROL', 'HUNT', 'HUNT'] },
  build: function (A) {
    const B = FA_FL_B, fly = A.pose === 'fly', pz = fly ? B.fly : B.perch, F = pz.F, R = faFlRig(B.bones, F, pz.pitch);
    R.stand = pz.stand;
    R.z0 = R.raw([0, 0, -0.10], -1)[2];
    const P = R.P, C = [0x3a2e2a, 0x5a4238, 0x8a6a5a], fur = C[0], fur2 = C[1], mem = faFlShade(C[1], -0.1), mem2 = faFlShade(C[1], -0.3), bone = C[2], ear = faFlShade(C[2], -0.3), eye = 0x0c0a08;
    /* ---- the body: the barrel and the deep chest */
    let c = P([0, 0, -0.30], -1); A.ellip('coat', c[0], c[1], c[2], 0.45, 0.42, 0.88, fur, { rx: -pz.pitch, seg: 14 });
    c = P([0, 0.06, 0.28], -1); A.ellip('coat', c[0], c[1], c[2], 0.54, 0.47, 0.46, fur2, { rx: -pz.pitch, seg: 14 });
    /* ---- the head: a fox face, the ears its own parts */
    const hx = F[0] - pz.pitch;
    A.part('head', P(B.HD, 0), () => {
      const h = P([0, 0.20, 0.98], 1); A.ellip('coat', h[0], h[1], h[2], 0.28, 0.27, 0.36, fur, { rx: hx, seg: 12 });
      faFlRod(A, 'coat', P([0, 0.13, 1.20], 1), P([0, 0.10, 1.55], 1), 0.14, 0.07, fur2, 8);
      const n = P([0, 0.11, 1.56], 1); A.ellip('skin', n[0], n[1], n[2], 0.06, 0.045, 0.03, 0x1a1412, { rx: hx, seg: 8 });
      for (const s of [1, -1]) { const e = P([0.19, 0.25, 1.22], 1, s); A.ellip('eye', e[0], e[1], e[2], 0.04, 0.035, 0.03, eye, { rx: hx, seg: 8 }); }
    });
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', P([0.2, 0.38, 0.95], 1, s), () => {
      faFlVane(A, 'membrane', [[0.10, 0.36, 0.92], [0.46, 1.12, 0.84], [0.32, 0.40, 1.10]].map(p => P(p, 1, s)), ear);
      faFlFan(A, 'coat', [[0.12, 0.36, 0.90], [0.44, 1.02, 0.82], [0.30, 0.38, 0.86]].map(p => P(p, 1, s)), fur, fur, 0.012);
    });
    /* ---- the wings (membrane: the wing skin, one double-sided sheet per panel) */
    const Ln = B.T.map(t => faFlLen(faFlSub(t, B.W)));
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(B.S, 5, s), () => {
      const M = p => [p[0] * s, p[1], p[2]];
      if (fly) {
        const S = P(B.S, 5, s), E = P(B.E, 6, s), W = P(B.W, 8, s), T = B.T.map(t => P(t, 8, s)), K = P(B.K, 6, s), J = P(B.J, 5, s), F1 = P([1.9, 0.09, 0.42], 5, s);
        faFlRod(A, 'coat', S, E, 0.11, 0.08, fur2, 7);
        faFlVane(A, 'membrane', [P([0.40, 0.06, 0.15], 5, s), E, J, P([0.30, 0.0, -1.15], 5, s)], mem);
        faFlVane(A, 'membrane', [P([0.40, 0.08, 0.30], 5, s), F1, E], mem2);
        faFlRod(A, 'coat', E, W, 0.08, 0.06, fur2, 7);
        faFlVane(A, 'membrane', [E, W, K, J], mem);
        faFlVane(A, 'membrane', [E, F1, W], mem2);
        faFlRod(A, 'horn', W, P([2.70, 0.13, 0.98], 8, s), 0.045, 0.01, bone, 5);
        for (let i = 0; i < 3; i++) faFlRod(A, 'skin', W, T[i], 0.045, 0.012, bone, 5);
        faFlVane(A, 'membrane', [W, T[0], P([4.0, 0.07, -0.62], 8, s), T[1]], mem);
        faFlVane(A, 'membrane', [W, T[1], P([3.38, 0.07, -1.38], 8, s), T[2]], mem2);
        faFlVane(A, 'membrane', [W, T[2], K], mem);
        return;
      }
      /* grounded, as a bat crawls: the humerus up and back to an elbow just over the back line, the forearm angled
         down and forward to the wrist beside the chest, the thumb claw planted ahead of it; each finger folded in a Z
         tight along the back of the forearm (metacarpal up to the elbow, the phalanges back down toward the wrist), the
         membrane furled between them; the flank membrane draped from the arm to the knee against the body */
      const S = P(B.S, -1, s), E = M([0.98, 1.22, -0.36]), W = M([1.02, 0.20, 0.42]),
        up = faFlNorm(faFlSub(E, W)), out = M([1, 0, 0]), Jn = [], Tp = [];
      faFlRod(A, 'coat', S, E, 0.11, 0.08, fur2, 7);
      faFlRod(A, 'coat', E, W, 0.08, 0.06, fur2, 7);
      faFlRod(A, 'horn', W, M([1.07, 0.015, 0.70]), 0.05, 0.012, bone, 5);
      for (let i = 0; i < 3; i++) {
        const o = faFlAdd(faFlMul(out, 0.05 + 0.04 * i), [0, -0.015 * i, -0.04 - 0.035 * i]);
        const j = faFlAdd(faFlAdd(W, faFlMul(up, Math.min(0.55 * Ln[i], 1.18))), o);
        const t = faFlAdd(faFlAdd(j, faFlMul(up, -0.42 * Ln[i])), faFlAdd(faFlMul(out, 0.035), [0, 0, -0.03]));
        faFlRod(A, 'skin', W, j, 0.04, 0.028, bone, 5); faFlRod(A, 'skin', j, t, 0.028, 0.01, bone, 5);
        Jn.push(j); Tp.push(t);
      }
      for (let i = 0; i < 2; i++) { faFlVane(A, 'membrane', [W, Jn[i], Jn[i + 1]], i ? mem2 : mem); faFlVane(A, 'membrane', [Jn[i], Tp[i], Tp[i + 1], Jn[i + 1]], i ? mem2 : mem); }
      faFlVane(A, 'membrane', [W, faFlLerp(W, E, 0.92), Jn[0]], mem2);
      /* the flank membrane: from the shoulder along the humerus to the elbow, then drawn in against the flank (a slack
         fold a hand outside the body) and back to the thigh */
      const kn = FA_FL_B.knee(P, s), an = FA_FL_B.ankle(P, s);
      faFlVane(A, 'membrane', [P([0.42, 0.04, 0.10], -1, s), E, M([0.50, 0.66, -0.72]), faFlLerp(P(B.H, 9, s), kn, 0.55), P([0.36, 0.0, -0.95], -1, s)], mem);
      faFlVane(A, 'membrane', [P([0.40, 0.08, 0.30], -1, s), faFlLerp(S, E, 0.55), E], mem2);
    });
    /* ---- the legs: perched, knees up and out, the feet turned back (a bat's are) */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(B.H, 9, s), () => {
      const Hp = P(B.H, 9, s);
      if (fly) {
        const an = P([0.32, -0.10, -1.95], 9, s);
        faFlRod(A, 'coat', Hp, an, 0.08, 0.04, fur2, 7);
        for (const x of [0.25, 0.32, 0.39]) faFlRod(A, 'horn', an, P([x, -0.06, -2.22], 9, s), 0.025, 0.006, bone, 4);
        return;
      }
      const kn = FA_FL_B.knee(P, s), an = FA_FL_B.ankle(P, s);
      faFlRod(A, 'coat', Hp, kn, 0.09, 0.06, fur2, 7); faFlRod(A, 'coat', kn, an, 0.06, 0.04, fur2, 7);
      for (const x of [-0.06, 0, 0.06]) faFlRod(A, 'horn', an, [an[0] + s * x, 0.012, an[2] - 0.2], 0.03, 0.008, bone, 4);
    });
    /* ---- the tail membrane between the legs */
    for (const s of [1, -1]) {
      if (fly) faFlVane(A, 'membrane', [[0, -0.04, -1.0], [0.30, 0.0, -1.15], [0.32, -0.06, -1.9], [0, -0.06, -1.55]].map(p => P(p, 9, s)), mem2);
      else { const an = FA_FL_B.ankle(P, s), kn = FA_FL_B.knee(P, s), m = P([0, -0.06, -1.15], -1);
        faFlVane(A, 'membrane', [m, P([0.22, -0.06, -1.05], -1, s), faFlLerp(kn, an, 0.4), an, [0, an[1] + 0.22, an[2] - 0.12]], mem2); }
    }
    A.anchor('saddle', P([0, 0.44, -0.15], -1));
  }
});
/* the perched bat's knee and ankle (shared by the leg, the flank membrane and the tail membrane) */
FA_FL_B.knee = (P, s) => { const h = P(FA_FL_B.H, 9, s); return [h[0] + s * 0.42, h[1] + 0.12, h[2] - 0.30]; };
FA_FL_B.ankle = (P, s) => { const k = FA_FL_B.knee(P, s); return [k[0] + s * 0.06, 0.07, k[2] - 0.32]; };

/* ================================================================ GIANT ARCHAEOPTERYX: span 7 m
   The original ("GIANT ARCHAEOPTERYX"): a feathered raptor-bird, blue with rust flight feathers and a cream belly, a
   toothed snout and the long feathered tail of the real animal; three claws on each wing. Perched: the original's fold
   (wings swept back along the flanks, the tail raised, pitched up 0.5), standing on bird's feet. */
const FA_FL_A = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], S = [0.35, 0.15, 0.20], W = [1.70, 0.15, 0.52], H = [0.22, -0.20, -0.70], NK = [0, 0.15, 0.40], HD = [0, 0.58, 1.15], TL = [0, 0.0, -1.15];
  return { S: S, W: W, H: H, NK: NK, HD: HD, TL: TL,
    bones: [{ p: NK, a: X, par: -1 }, { p: HD, a: Y, par: 10 }, { p: TL, a: X, par: -1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: W, a: Y, par: 5 }, { p: W, a: Z, par: 6 }, { p: H, a: X, par: -1 }, { p: TL, a: Y, par: 2 }, { p: HD, a: X, par: 0 }],
    /* bone 10 (not in the original): the head pitched down on the neck when perched, so the snout looks ahead, not up
                       neck headY tailP wSw  wFlap  wTw  oSw   oFlap leg   tailY */
    perch: { F: [-0.05, 0, 0.20, 1.25, -0.38, 0.15, 0.22, 0.10, -1.27, 0, 0.45], pitch: 0.30 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.2 } };
})();
ANIMAL({
  key: 'giant-archaeopteryx', name: 'Giant archaeopteryx', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['sky', 'canopy', 'trunks', 'ground'], locomotion: ['flies', 'glides', 'climbs', 'walks', 'runs'] },
  size: { length: 7.5, height: 3.7, span: 7 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '201-246, 335-340', note: 'first drawn here (FLY_A): the Wingclaw tribe\'s mount; roost traffic and Rookery training circuits' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '207-249, 349-354', note: 'the same model (plus the detail-atlas slots: feathers, scaled skin) on Girder\'s roof-deck roosts' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 55, note: 'dressed; not eaten by the riders' },
    hide: { amount: 1, hideM2: 2.5, note: 'the scaled leg and snout skin is the only leather' },
    feathers: { amount: 1.6, note: 'the moult of flight and tail feathers: fletching, the riders\' plumes (library card.feather.archae)' },
    eggs: { amount: 3, note: 'a clutch of three a year, hatched in the rookeries, not eaten' } },
  life: { maturity: 3, lifespan: 22, litter: 3, gestation: 50, note: 'eggs (gestation: days of incubation)' },
  poses: ['perch', 'fly'],
  w: 2.8, d: 7.2, h: 3.5,
  data: { mass: 160, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.5, run: 7, fly: [14, 20] }, gait: { type: 'flyer', freq: 1.2, stride: 0.9 },
    flap: { freq: 1.4, amp: 0.8, glide: 0.35, fold: 0 }, grazePitch: 0.85,
    herd: 'alone or a mated pair; the rookeries keep them in single stalls, apart', fleeDistance: 6, aggression: 0.55,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'HUNT', 'FLY', 'PATROL', 'HUNT', 'REST', 'REST', 'IDLE', 'PATROL', 'FLY', 'HUNT', 'HUNT', 'IDLE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const Q = FA_FL_A, fly = A.pose === 'fly', pz = fly ? Q.fly : Q.perch, F = pz.F, R = faFlRig(Q.bones, F, pz.pitch);
    R.stand = fly ? pz.stand : 0.12 - R.raw([0.26, -0.30, -2.20], 8)[1];
    R.z0 = R.raw([0, 0, -0.80], -1)[2];
    const P = R.P, C = [0x2a4a7a, 0xb8683e, 0xe8d8a0], blue = C[0], blue2 = faFlShade(C[0], 0.22), rust = C[1], rust2 = faFlShade(C[1], -0.22), cream = C[2],
      eye = 0x100c08, skin = faFlShade(C[2], -0.35);
    const bc = P([0, 0, -0.35], -1);
    A.ellip('feather', bc[0], bc[1], bc[2], 0.40, 0.42, 0.92, null, { rx: -pz.pitch, seg: 16, colf: (x, y) => y < -0.12 ? cream : blue });
    /* ---- the head and neck: a toothed snout, a rust crest. The neck an arc: up from the shoulders, then forward into the
       head, thicker (the original's straight rod, held near upright perched, read as a long thin stalk) */
    const hx = F[0] + F[10] - pz.pitch;
    A.part('head', P(Q.NK, 0), () => {
      A.tube('feather', t => P(faFlLerp(faFlLerp([0, 0.10, 0.30], [0, 0.50, 0.78], t), faFlLerp([0, 0.50, 0.78], [0, 0.62, 1.22], t), t), 0),
        t => { const r = 0.27 - 0.11 * t; return [r, r * 1.1]; }, 6, 10, blue, { caps: true });
      const h = P([0, 0.64, 1.36], 1); A.ellip('feather', h[0], h[1], h[2], 0.19, 0.19, 0.31, blue2, { rx: hx, seg: 12 });
      faFlRod(A, 'scale', P([0, 0.64, 1.52], 1), P([0, 0.57, 2.20], 1), 0.11, 0.035, skin, 8);
      faFlVane(A, 'feather', [[0, 0.78, 1.30], [0, 1.02, 0.95], [0, 0.80, 1.05]].map(p => P(p, 1)), rust);
      for (const s of [1, -1]) {
        const e = P([0.15, 0.68, 1.46], 1, s); A.ellip('eye', e[0], e[1], e[2], 0.035, 0.035, 0.045, eye, { rx: hx, seg: 8 });
        for (let t = 0; t < 3; t++) { const tz = 1.68 + t * 0.16; faFlRod(A, 'horn', P([0.06, 0.56, tz + 0.05], 1, s), P([0.05, 0.47, tz + 0.05], 1, s), 0.022, 0.003, cream, 4); }
      }
    });
    A.part('jaw', P([0, 0.53, 1.45], 1), () => faFlRod(A, 'scale', P([0, 0.53, 1.50], 1), P([0, 0.50, 2.10], 1), 0.07, 0.025, skin, 7));
    /* ---- the tail: a bony rod fringed with six pairs of feathers and a fan at the tip */
    A.part('tail', P(Q.TL, 9), () => {
      faFlRod(A, 'feather', P(Q.TL, 9), P([0, 0, -4.35], 9), 0.13, 0.02, blue, 8);
      /* each pair a hair above the one before, so the overlaps do not fight */
      for (const s of [1, -1]) {
        for (let i = 0; i < 6; i++) { const zb = -1.45 - i * 0.52, w = 0.50 + i * 0.05, y = 0.004 + 0.008 * i;
          faFlVane(A, 'feather', [[0.02, y, zb], [w, y, zb - 0.62], [w - 0.05, y, zb - 0.95], [0.02, y, zb - 0.34]].map(p => P(p, 9, s)), (i % 2) ? rust : blue2); }
        faFlVane(A, 'feather', [[0.02, 0.056, -4.3], [0.34, 0.056, -5.05], [0.12, 0.056, -5.35], [0, 0.056, -4.6]].map(p => P(p, 9, s)), rust2);
      }
    });
    /* ---- the wings: the arm with the secondaries and coverts, the hand with three claws and five primaries */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(Q.S, 5, s), () => {
      faFlRod(A, 'feather', P(Q.S, 5, s), P(Q.W, 5, s), 0.12, 0.07, blue, 7);
      faFlVane(A, 'feather', [[0.35, 0.12, 0.22], Q.W, [1.82, 0.12, -0.98], [1.10, 0.12, -1.08], [0.40, 0.10, -1.0]].map(p => P(p, 5, s)), rust);
      faFlVane(A, 'feather', [[0.35, 0.17, 0.24], [1.70, 0.17, 0.50], [1.74, 0.17, -0.30], [0.40, 0.17, -0.38]].map(p => P(p, 5, s)), blue);
      faFlRod(A, 'feather', P(Q.W, 7, s), P([2.65, 0.15, 0.22], 7, s), 0.06, 0.03, blue, 6);
      for (let c = 0; c < 3; c++) faFlRod(A, 'horn', P([1.78 + c * 0.12, 0.15, 0.49 - c * 0.03], 7, s), P([1.86 + c * 0.12, 0.13, 0.86 - c * 0.05], 7, s), 0.03, 0.004, cream, 4);
      const tips = [[3.5, 0.15, -0.42], [3.38, 0.14, -1.02], [3.02, 0.13, -1.38], [2.60, 0.12, -1.52], [2.18, 0.11, -1.46]];
      for (let f = 0; f < 5; f++) { const k = f / 5 * 0.72, r0 = [Q.W[0] + (2.65 - Q.W[0]) * k, 0.15 - f * 0.008, Q.W[2] + (0.22 - Q.W[2]) * k], r1 = [r0[0] - 0.22, r0[1], r0[2] - 0.12], tp = tips[f];
        faFlVane(A, 'feather', [r0, [tp[0] + 0.10, tp[1], tp[2] + 0.16], [tp[0] - 0.12, tp[1], tp[2] - 0.10], r1].map(p => P(p, 7, s)), (f % 2) ? rust2 : rust); }
      faFlVane(A, 'feather', [[1.70, 0.19, 0.50], [2.65, 0.19, 0.22], [2.45, 0.19, -0.38], [1.74, 0.19, -0.30]].map(p => P(p, 7, s)), blue2);
    });
    /* ---- the legs: feathered thighs, scaled shanks; three toes forward and one back on the ground */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(Q.H, 8, s), () => {
      const kn = P([0.26, -0.30, -1.48], 8, s), an = P([0.26, -0.30, -2.20], 8, s);
      A.tube('feather', t => faFlLerp(P(Q.H, 8, s), kn, t), t => { const r = 0.25 - 0.15 * t; return [r * 0.8, r]; }, 3, 10, blue, { caps: true });
      faFlRod(A, 'scale', kn, an, 0.07, 0.045, cream, 7);
      if (fly) { faFlRod(A, 'horn', an, P([0.26, -0.24, -2.55], 8, s), 0.045, 0.008, cream, 5); return; }
      const g = [an[0], 0.05, an[2]];
      faFlRod(A, 'scale', an, g, 0.045, 0.04, skin, 6);
      for (const o of [[-0.12, 0.34], [0, 0.42], [0.12, 0.34], [0.02, -0.2]]) faFlRod(A, 'horn', g, [g[0] + s * o[0], 0.012, g[2] + o[1]], 0.035, 0.008, cream, 5);
    });
    A.anchor('saddle', P([0, 0.45, -0.15], -1));
  }
});

/* ================================================================ GIANT DRAGONFLY: 6 m body, 4 wings
   The original ("GIANT DRAGONFLY"): a teal and blue thorax and seven-ring abdomen, great compound eyes, six bristled
   legs, and four wings on a separate translucent mesh with veins and a pterostigma (a second, opposite-phase wing set
   drew the motion blur). Here each wing is one opaque double-sided membrane sheet (the fauna families have no
   transparent one; membrane takes the library's wing skin) and the blur set is left out; the forewings are wingL/wingR, the hindwings wing2L/wing2R. Perched: wings flat, the legs splayed. */
const FA_FL_D = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], AB = [0, 0, -0.45], AB2 = [0, 0, -2.55], LG = [0.30, -0.35, 0.45], FW = [0.28, 0.50, 0.78], HW = [0.28, 0.50, 0.12];
  return { AB: AB, AB2: AB2, LG: LG, FW: FW, HW: HW, HDP: [0, 0, 1.0],
    bones: [{ p: AB, a: X, par: -1 }, { p: AB2, a: X, par: 0 }, { p: LG, a: Z, par: -1 }, { p: FW, a: Z, par: -1 }, { p: HW, a: Z, par: -1 },
      { p: FW, a: Z, par: -1 }, { p: HW, a: Z, par: -1 }, { p: [0, 0, 1.0], a: Y, par: -1 }],
    /*                abd   abd2   legs  fw    hw */
    perch: { F: [-0.12, -0.10, -0.25, 0.04, -0.04, 0, 0, 0], pitch: 0 },
    fly: { F: [-0.04, -0.04, 0.45, 0, 0, 0, 0, 0], pitch: 0, stand: 1.6 } };
})();
ANIMAL({
  key: 'giant-dragonfly', name: 'Giant dragonfly', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'riparian', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'skittish',
    habitat: ['sky', 'marsh', 'shallows', 'canopy'], locomotion: ['flies'] },
  size: { length: 6.9, height: 1.9, span: 7.3 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '248-294, 335-340', note: 'first drawn here (FLY_D, the wings flyWingGeom): the Dragonfly tribe\'s mount, the fastest of the four; patrols and transients over the canopy and the water' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '251-307, 349-354', note: 'the same model; Girder adds the library wing sheet (materials.json family flywing, wing.dragonfly) on the wing cards' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 22, note: 'the flight muscle of the thorax, roasted in the shell; not eaten by the riders' } },
  life: { maturity: 2, lifespan: 5, litter: 300, gestation: 25, note: 'eggs laid in still water (gestation: days to hatch); two years a nymph in the marsh pools, then three on the wing' },
  poses: ['perch', 'fly'],
  w: 7.3, d: 7.0, h: 1.9,
  data: { mass: 90, legs: 6, wings: 2, budget: 9000, speed: { walk: 0.5, run: 1, fly: [25, 35] }, gait: { type: 'flyer', freq: 1.5, stride: 0.3 },
    flap: { freq: 9, amp: 0.5, glide: 0, fold: 0 }, grazePitch: 0.3,
    herd: 'alone, holding a stretch of water; the riders keep them in open stalls by the pools', fleeDistance: 15, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'REST', 'HUNT', 'FLY', 'HUNT', 'PATROL', 'HUNT', 'FLY', 'PATROL', 'HUNT', 'HUNT', 'REST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const D = FA_FL_D, fly = A.pose === 'fly', pz = fly ? D.fly : D.perch, F = pz.F, R = faFlRig(D.bones, F, pz.pitch);
    const legTip = l => { const z0 = 0.85 - l * 0.4, kx = 0.80 + l * 0.06; return [kx - 0.1, -1.12, z0 + 0.12 - l * 0.22]; };
    R.stand = fly ? pz.stand : 0.02 - Math.min(R.raw(legTip(0), 2)[1], R.raw(legTip(1), 2)[1], R.raw(legTip(2), 2)[1]);
    R.z0 = R.raw([0, 0, -1.2], -1)[2];
    const P = R.P, C = [0x2f8a7a, 0x3a5a9a, 0xd8f0f0], teal = C[0], teal2 = faFlShade(C[0], -0.3), blu = C[1], blu2 = faFlShade(C[1], 0.3), wing = C[2], vein = faFlShade(C[1], -0.45), legc = 0x1c1a16;
    /* ---- the thorax */
    const th = P([0, 0, 0.30], -1);
    A.ellip('chitin', th[0], th[1], th[2], 0.50, 0.56, 0.82, null, { rx: -pz.pitch, seg: 14, colf: (x, y) => y < -0.18 ? blu : teal });
    /* ---- the head: the great compound eyes meet over it */
    A.part('head', P(D.HDP, 7), () => {
      const h = P([0, 0.05, 1.28], 7); A.ellip('chitin', h[0], h[1], h[2], 0.36, 0.32, 0.30, teal2, { rx: -pz.pitch, seg: 12 });
      faFlRod(A, 'chitin', P([0, -0.10, 1.5], 7), P([0, -0.18, 1.78], 7), 0.16, 0.06, legc, 7);
      for (const s of [1, -1]) { const e = P([0.30, 0.13, 1.38], 7, s); A.ellip('eye', e[0], e[1], e[2], 0.30, 0.29, 0.30, blu2, { rx: -pz.pitch, seg: 12 }); }
    });
    /* ---- the abdomen: seven rings, the claspers at its tip */
    A.part('tail', P(D.AB, 0), () => {
      const zs = [-0.45, -1.2, -1.9, -2.6, -3.3, -4.0, -4.7], rs = [0.30, 0.24, 0.21, 0.19, 0.17, 0.15, 0.11];
      for (let i = 0; i < 6; i++) { const b = i < 3 ? 0 : 1;
        A.tube('chitin', t => P([0, 0, zs[i] + (zs[i + 1] + 0.06 - zs[i]) * t], b), t => { const r = rs[i] + (rs[i + 1] - rs[i]) * t, k = 1 - 0.12 * Math.sin(Math.PI * t); return [r * k, r * k]; }, 3, 8, (i % 2) ? blu : teal, { caps: true }); }
      for (const s of [1, -1]) faFlRod(A, 'chitin', P([0.05, 0, -4.66], 1, s), P([0.12, 0, -5.15], 1, s), 0.04, 0.008, legc, 4);
    });
    /* ---- the legs: three pairs, femur out and down, tibia down */
    for (let l = 0; l < 3; l++) for (const s of [1, -1]) {
      const z0 = 0.85 - l * 0.4, kx = 0.80 + l * 0.06, root = [0.30, -0.35, z0];
      A.part('leg' + (l * 2 + (s > 0 ? 0 : 1)), P(root, 2, s), () => {
        const kn = P([kx, -0.62, z0 - 0.18], 2, s);
        faFlRod(A, 'chitin', P(root, 2, s), kn, 0.06, 0.04, legc, 5);
        faFlRod(A, 'chitin', kn, P(legTip(l), 2, s), 0.04, 0.015, legc, 5);
      });
    }
    /* ---- the wings: fore and hind, each a seven-point vane with its veins and the dark pterostigma near the tip */
    const vane = (root, len, sweep, y) => {
      const z = root[2], dx = u => root[0] + len * u, dz = (u, o) => z + sweep * u + o;
      return [[root[0], y, z + 0.05], [dx(0.35), y, dz(0.35, 0.40)], [dx(0.85), y, dz(0.85, 0.36)], [dx(1.0), y, dz(1.0, 0.05)], [dx(0.88), y, dz(0.88, -0.36)], [dx(0.30), y, dz(0.30, -0.30)], [root[0], y, z - 0.08]];
    };
    const veins = { 3: [[[0.28, 0.52, 0.86], [3.2, 0.52, 1.42], [3.2, 0.52, 1.34], [0.28, 0.52, 0.78]], [[0.28, 0.52, 0.74], [3.3, 0.52, 0.92], [3.3, 0.52, 0.86], [0.28, 0.52, 0.68]]],
      4: [[[0.28, 0.52, 0.20], [3.0, 0.52, -0.02], [3.0, 0.52, -0.10], [0.28, 0.52, 0.12]], [[0.28, 0.52, 0.06], [3.1, 0.52, -0.42], [3.1, 0.52, -0.48], [0.28, 0.52, 0.0]]] };
    const stig = { 3: [[2.75, 0.52, 1.36], [3.15, 0.52, 1.42], [3.15, 0.52, 1.24], [2.75, 0.52, 1.18]], 4: [[2.6, 0.52, 0.02], [3.0, 0.52, -0.04], [3.0, 0.52, -0.22], [2.6, 0.52, -0.16]] };
    for (const [b, nm, root, len, sweep] of [[3, 'wing', D.FW, 3.35, 0.35], [4, 'wing2', D.HW, 3.15, -0.45]]) for (const s of [1, -1]) A.part(nm + (s > 0 ? 'L' : 'R'), P(root, b, s), () => {
      /* one double-sided membrane sheet; the veins and the pterostigma laid a hair above it and a hair below */
      faFlVane(A, 'membrane', vane(root, len, sweep, 0.50).map(p => P(p, b, s)), wing);
      for (const y of [0.508, 0.492]) {
        for (const v of veins[b]) faFlVane(A, 'membrane', v.map(p => P([p[0], y, p[2]], b, s)), vein);
        faFlVane(A, 'membrane', stig[b].map(p => P([p[0], y + (y > 0.5 ? 0.004 : -0.004), p[2]], b, s)), 0x2a2420);
      }
    });
    A.anchor('saddle', P([0, 0.58, 0.25], -1));
  }
});

/* ---- kits/fauna/krator-fauna-hyperjungle.js ---- */
/* ======================================================================
   Krator Fauna: the hyperjungle (kits/fauna/krator-fauna-hyperjungle.js)
   The animals of the central hyperjungle belt, ported from biomes/hyperjungle/src/58-biome-hyperjungle-fauna.js
   (2026-10-06): the sky ray, the canopy dart, the jungle butterfly, the strider and the bough sloth. The kit drew
   each as one vertex-coloured instanced body in a unit frame (+x forward), scaled per instance (the scale is metres:
   the kit is in metres) and tinted per instance; here each is drawn at its typical scale, the instance tints are the
   variants, and the colour is the kit's vertex colour times the tint (both linear, as the kit's shader did).
   The quality pass (2026-10-06) kept each kit body's plan and palette and gave it anatomy: the strider jointed,
   muscled legs, a neck that thickens into the chest, a head with a jaw and muzzle, plates with thickness; the sloth
   jointed shaggy limbs with long claws hooked over its bough; the butterfly a butterfly's body; the dart and the
   ray a bird's and a ray's shape, feathers and wing membrane.
   The spore motes of the same pass are not ported: they are additive billboard discs of drifting spores, not animals
   (no body, no life); they belong with a particle or flora pass, not here.
   ====================================================================== */
/* the vertex colour times the instance tint, both sRGB hex, multiplied in linear (as the kit's instanced shader did),
   times k; a THREE.Color in linear, which the builder takes as it is */
function faHjLin(hex, tint, k) {
  const a = new THREE.Color(hex).convertSRGBToLinear();
  if (tint != null) { const b = new THREE.Color(tint).convertSRGBToLinear(); a.r *= b.r; a.g *= b.g; a.b *= b.b; }
  if (k) { a.r = Math.min(1, a.r * k); a.g = Math.min(1, a.g * k); a.b = Math.min(1, a.b * k); }
  return a;
}
/* linear colours: a mix, a scale, and a smooth step (e0 may be above e1: the step then falls) */
function faHjMix(a, b, t) { t = Math.max(0, Math.min(1, t)); return new THREE.Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t); }
function faHjK(a, k) { return new THREE.Color(Math.min(1, a.r * k), Math.min(1, a.g * k), Math.min(1, a.b * k)); }
function faHjSm(e0, e1, x) { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
/* a polyline as a curve t 0..1 */
function faHjPath(pts) {
  const n = pts.length - 1;
  return t => { const f = Math.min(n - 1e-6, Math.max(0, t * n)), k = Math.floor(f), r = f - k, a = pts[k], b = pts[k + 1];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; };
}
/* a Catmull-Rom curve through rows of numbers (any width), t 0..1 by row index */
function faHjCR(P) {
  const n = P.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i, out = [];
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    for (let k = 0; k < p1.length; k++) { const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      out.push(0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u)); }
    return out;
  };
}
/* a skin along a curve, its section frames carried along the curve (parallel transport), so a leg that runs near
   vertical or bends back and forth never twists or pinches (A.tube flips its section's 'up' there). c(t) -> [x, y, z],
   rad(t) -> [half-width, half-height]; o.up the first section's 'up' (default +y, +z where the curve starts near
   vertical); o.colf(t, angle, p) (angle 0 on the 'up' side); o.round [w0, w1]: each end closes in a dome over that
   much of t; o.shag [amp, freq]: the radius roughened by noise (a shaggy coat). Faces wound outward. */
function faHjTube(A, fam, c, rad, nt, ns, col, o) {
  o = o || {};
  const pts = [], T = [], N = [], B = [];
  for (let i = 0; i <= nt; i++) pts.push(c(i / nt));
  for (let i = 0; i <= nt; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(nt, i + 1)];
    T.push(new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize()); }
  const up = o.up ? new THREE.Vector3(o.up[0], o.up[1], o.up[2]) : (Math.abs(T[0].y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0));
  const n = up.clone().addScaledVector(T[0], -up.dot(T[0])).normalize();
  for (let i = 0; i <= nt; i++) { if (i) n.addScaledVector(T[i], -n.dot(T[i])).normalize(); N.push(n.clone()); B.push(new THREE.Vector3().crossVectors(T[i], n)); }
  const rw = o.round || [0, 0], G = [], CC = [];
  const dome = t => { let k = 1;
    if (rw[0] > 0 && t < rw[0]) k = Math.sqrt(Math.max(0, 1 - Math.pow((rw[0] - t) / rw[0], 2)));
    if (rw[1] > 0 && t > 1 - rw[1]) k = Math.min(k, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + rw[1]) / rw[1], 2))));
    return k; };
  for (let i = 0; i <= nt; i++) {
    const t = i / nt, r = rad(t), k = dome(t), p = pts[i], row = [], crow = [];
    for (let j = 0; j <= ns; j++) {
      const f = (j % ns) / ns * TAU, ca = Math.cos(f), sa = Math.sin(f), a = r[0] * k, b = r[1] * k;
      let q = [p[0] + b * ca * N[i].x - a * sa * B[i].x, p[1] + b * ca * N[i].y - a * sa * B[i].y, p[2] + b * ca * N[i].z - a * sa * B[i].z];
      if (o.shag) { const F = o.shag[1], d = 1 + o.shag[0] * 2 * (faNoise(q[0] * F + 7.1, q[1] * F + 1.3, q[2] * F) - 0.5);
        q = [p[0] + (q[0] - p[0]) * d, p[1] + (q[1] - p[1]) * d, p[2] + (q[2] - p[2]) * d]; }
      row.push(q); crow.push(o.colf ? o.colf(t, f, q) : col);
    }
    G.push(row); CC.push(crow);
  }
  A.sheet(fam, (u, v) => G[Math.round(v * nt)][Math.round(u * ns)], ns, nt, null, { colf: (u, v) => CC[Math.round(v * nt)][Math.round(u * ns)] });
}
/* a tube through rows [x, y, z, half-width, half-height] (a Catmull-Rom curve) */
function faHjRows(A, fam, rows, nt, ns, col, o) {
  const f = faHjCR(rows);
  faHjTube(A, fam, t => { const q = f(t); return [q[0], q[1], q[2]]; }, t => { const q = f(t); return [Math.max(0.0005, q[3]), Math.max(0.0005, q[4])]; }, nt, ns, col, o);
  return f;
}
/* a thin plate (a wing, a fin, a tail fan) for the two-sided families (membrane, feather): P(u, v) its mid surface,
   th(u, v) [up, down] its thickness either side; the top and the underside, colf(u, v, side) (side 1 top, -1 under) */
function faHjPlate(A, fam, P, th, nu, nv, colf) {
  for (const sd of [1, -1]) A.sheet(fam, (u, v) => { const p = P(u, v), h = th(u, v); return [p[0], p[1] + (sd > 0 ? h[0] : -h[1]), p[2]]; }, nu, nv, null, { colf: (u, v) => colf(u, v, sd) });
}
/* the instance tints of the kit's pass (the variants) */
const FA_HJ_RAY_TINT = [0x6a6e74, 0x7a7060, 0x5e6672, 0x8a8070];
const FA_HJ_DART_TINT = [0x6a7a62, 0x7a6a4a, 0x5a7a7a, 0x8a7a5a, 0x4a6a5a];
const FA_HJ_FLY_TINT = [0xc4566a, 0xc98d2e, 0xa85ab8, 0xbe4632, 0xd0a848, 0x8e5ea0, 0x4a8ae0, 0xe8d040, 0xf0f0e8];   /* PAL.bloom, then blue, yellow, white */
const FA_HJ_STRIDER_TINT = [0x9a9e86, 0xa8987a, 0x8e9682, 0xb0a48c];
const FA_HJ_SLOTH_TINT = [0x5a4a38, 0x6a5a44, 0x4a4034];
const FA_HJ_BIOME = { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], abyssal: false };
const FA_HJ_SRC = { build: 'biomes/hyperjungle', file: 'src/58-biome-hyperjungle-fauna.js' };

/* ---------------------------------------------------------------- the sky ray */
ANIMAL({
  key: 'sky-ray', name: 'Sky ray', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'omnivore', feeding: 'filter feeder', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky'], locomotion: ['flies', 'glides'] }),
  size: { length: 11.2, height: 1.5, span: 18.9 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '28-34, 133-139', note: 'rayGeo (body, head, tail, two wing pairs) and the flocks: 5 to 12 rays wheeling 30-120 m above the canopy of the hero disc on banked orbits, a slow glide-flap; scale 6.5-11.5 per ray (LORE.md: "6-12 m soarers"; the drawn span is 2.1x the scale)' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 150, note: 'only from a ray brought down or found fallen; lean and dark' },
    hide: { amount: 1, hideM2: 60, note: 'the wing membrane, thin and tough: prized for sails, awnings and roofing' } },
  life: { maturity: 8, lifespan: 60, litter: 1, gestation: 360, note: 'invented: a single pup born on the wing, as a manta' },
  variants: 4, variantNames: ['slate', 'dun', 'blue-grey', 'sand'],
  w: 19.2, d: 11.4, h: 1.6,
  data: { mass: 380, legs: 0, wings: 2, sizeRange: [0.72, 1.28], speed: { walk: 14, run: 26, fly: 18, note: 'never lands: walk is its slowest soar, run a dive' },
    gait: { type: 'flyer', freq: 0.18, stride: 0 }, flap: { freq: 0.18, amp: 0.12, glide: 0.4, fold: 0 },
    herd: 'flocks of 5 to 12 wheeling together over the canopy', fleeDistance: 30, aggression: 0.05, neverLands: true,
    schedule: ['FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY'],
    scheduleNote: 'aloft day and night; it sieves the drifting insects and spores over the canopy by day and soars slow and high by night' },
  build: function (A) {
    /* in flight pose (it never lands): the kit's body at scale 9 (head, body and tail one flattened, countershaded
       skin), the great wings and the hind fins as membrane with a thick, muscled leading edge, lifted so the belly
       clears y = 0 */
    const v = A.variant, tint = FA_HJ_RAY_TINT[v], M = A.S, K = 9 * M, Y = y => (y + 0.09) * K, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x5a5e62), belly = col(0x5a5e62, 1.55), headC = col(0x50545a), tailC = col(0x44484c), wingC = col(0x62666a), finC = col(0x50545a);
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const mott = (c, q) => faHjK(c, 0.9 + 0.2 * faNoise(q[0] * 0.9 + 3.3, q[1] * 0.9, q[2] * 0.9));
    const skinCol = base => (t, f, q) => mott(faHjMix(base, belly, faHjSm(-0.1, -0.6, Math.cos(f))), q);
    /* the body: broad and flat, from the tail root to the head's root */
    faHjRows(A, 'skin', R([[0, 0.81, -2.4, 0.22, 0.18], [0, 0.81, -1.7, 0.7, 0.48], [0, 0.81, -0.6, 0.97, 0.66], [0, 0.82, 0.6, 0.98, 0.68],
      [0, 0.83, 1.7, 0.84, 0.6], [0, 0.85, 2.6, 0.62, 0.5]]), 18, 18, null, { round: [0.08, 0], colf: skinCol(bodyC) });
    /* the gill slits under the fore body */
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) A.ellip('mouth', s * (0.42 - 0.02 * i) * M, 0.3 * M, (1.55 + i * 0.2) * M, 0.2 * M, 0.025 * M, 0.03 * M, 0x1c1c1e, { seg: 8, ry: s * 0.15 });
    A.part('head', [0, Y(0.01), 0.27 * K], () => {
      faHjRows(A, 'skin', R([[0, 0.86, 2.3, 0.6, 0.48], [0, 0.89, 3.0, 0.66, 0.5], [0, 0.9, 3.6, 0.6, 0.43], [0, 0.9, 4.05, 0.48, 0.3], [0, 0.88, 4.32, 0.3, 0.16]]),
        12, 18, null, { round: [0, 0.22], colf: skinCol(headC) });
      /* the wide filter mouth, and the two head fins that funnel the drift into it */
      A.ellip('mouth', 0, 0.74 * M, 4.12 * M, 0.34 * M, 0.06 * M, 0.14 * M, 0x18181a, { seg: 14 });
      for (const s of [-1, 1]) {
        A.ellip('skin', s * 0.5 * M, 0.8 * M, 4.12 * M, 0.08 * M, 0.17 * M, 0.3 * M, headC, { seg: 10, rz: -s * 0.35, rx: -0.25 });
        A.ellip('eye', s * 0.6 * M, 0.98 * M, 3.55 * M, 0.1 * M, 0.1 * M, 0.11 * M, 0x0c0c0e, { seg: 10 });
      }
    });
    /* the tail: a long flattened whip */
    A.part('tail', [0, Y(0.01), -0.215 * K], () => faHjRows(A, 'skin', R([[0, 0.82, -2.1, 0.2, 0.16], [0, 0.84, -3.4, 0.12, 0.09], [0, 0.88, -5.2, 0.06, 0.045], [0, 0.92, -6.97, 0.02, 0.016]]),
      14, 8, null, { round: [0, 0.06], colf: skinCol(tailC) }));
    /* the great wings (root chord 3.8 m, tip 2 m swept back, a little dihedral, the tip rounded) and the hind fins: the
       leading edge thick and muscled, the trailing edge a thin membrane; dark above, pale beneath */
    const wing = (s, y0, rootX, tipX, z0, z1, c0, c1, dih, th, base) => faHjPlate(A, 'membrane', (u, w) => {
      const e = Math.sqrt(Math.max(0, 1 - Math.pow(u, 6))), ch = (c0 + (c1 - c0) * u) * Math.max(0.04, e), zc = z0 + (z1 - z0) * u - 0.05 * (c0 - c1) * u * u;
      return [s * (rootX + (tipX - rootX) * u), y0 + dih * u, zc + ch * (0.5 - w)];
    }, (u, w) => { const k = th * (1 - 0.7 * u) * Math.sin(Math.PI * Math.pow(Math.max(0.0001, w), 0.5)) * Math.sqrt(Math.max(0.05, 1 - Math.pow(u, 6))); return [k, 0.4 * k]; },
      22, 8, (u, w, sd) => sd > 0 ? faHjK(base, (w > 0.85 ? 0.72 : 1) * (u > 0.9 ? 0.8 : 1)) : faHjMix(base, belly, 0.75));
    for (const s of [1, -1]) {
      A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.07 * K, Y(0), -0.03 * K], () => wing(s, Y(0), 0.07 * K, 1.05 * K, -0.03 * K, -0.12 * K, 0.42 * K, 0.22 * K, 0.06 * K, 0.03 * K, wingC));
      A.part(s > 0 ? 'wing2L' : 'wing2R', [s * 0.01 * K, Y(0.005), -0.28 * K], () => wing(s, Y(0.005), 0.01 * K, 0.28 * K, -0.28 * K, -0.40 * K, 0.12 * K, 0.10 * K, 0.02 * K, 0.012 * K, finC));
    }
  }
});

/* ---------------------------------------------------------------- the canopy dart */
ANIMAL({
  key: 'canopy-dart', name: 'Canopy dart', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['canopy', 'trunks'], locomotion: ['flies', 'leaps'] }),
  size: { length: 1.0, height: 0.36, span: 1.39 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '35-41, 140-146', note: 'dartGeo (body, head, beak, wings, a fanned tail) and the groups: 2 to 6 flitting through the openings 10-45 m up under the canopy; scale 1.2-2.1. The kit never lands them: the legs here are new, for the perch' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 0.6, note: 'netted in the openings; a mouthful' },
    eggs: { amount: 6, note: 'two clutches of three in a bark hollow; taken by climbers' },
    feathers: { amount: 0.04, note: 'the green and teal flight feathers, for fletching and finery' } },
  life: { maturity: 1, lifespan: 8, litter: 3, gestation: 18, note: 'gestation here is the incubation' },
  variants: 5, variantNames: ['moss', 'umber', 'teal', 'ochre', 'jade'],
  w: 1.42, d: 1.17, h: 0.38,
  data: { mass: 1.5, legs: 2, wings: 1, sizeRange: [0.73, 1.27], speed: { walk: 0.3, run: 0.8, fly: 12 },
    gait: { type: 'flyer', freq: 1.75, stride: 0.1 }, flap: { freq: 1.75, amp: 0.32, glide: 0.15, fold: 0.05, sweep: 1.3, foldScale: 0.6, roll: 0.75, tuck: 0.9 },
    herd: 'loose groups of 2 to 6', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'REST', 'REST', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    /* the kit's body at scale 1.65 (in metres here), feathered, standing on two new legs (the kit's darts never perch).
       Perched, the runtime folds each wing back along the flank (flap.sweep, foldScale): its chord is kept narrow at the
       root so the folded wing stays in the body, and the folded wing's colour is laid on the upper flank */
    const v = A.variant, tint = FA_HJ_DART_TINT[v], M = A.S, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a7a62), belly = col(0x6a7a62, 1.45), headC = col(0x5a6a56), beakC = col(0x3a3a30), wingC = col(0x5e6e58), tailC = col(0x4e5e4a);
    const tipC = faHjK(wingC, 0.55), legC = col(0x4a4a3e), clawC = 0x1c1a16;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const plum = (t, f, q) => { const up = Math.cos(f), z = q[2] / M;
      let c = faHjMix(bodyC, belly, faHjSm(-0.05, -0.6, up));
      /* the folded wing's coverts on the upper flank (and the back's darker mantle) */
      c = faHjMix(c, faHjK(wingC, 0.92), faHjSm(0.05, 0.3, up) * faHjSm(0.85, 0.6, up) * faHjSm(0.14, 0.04, z) * faHjSm(-0.34, -0.2, z));
      return faHjK(c, 0.94 + 0.12 * faNoise(q[0] * 40, q[1] * 40, q[2] * 40)); };
    faHjRows(A, 'feather', R([[0, 0.236, -0.31, 0.025, 0.02], [0, 0.228, -0.24, 0.062, 0.056], [0, 0.218, -0.13, 0.097, 0.095], [0, 0.212, -0.01, 0.118, 0.118],
      [0, 0.222, 0.1, 0.112, 0.115], [0, 0.245, 0.18, 0.085, 0.09], [0, 0.27, 0.23, 0.064, 0.068]]), 16, 14, null, { round: [0.1, 0], colf: plum });
    /* the head: rounded, merging into the neck, a pale eye ring, a fine slightly hooked beak */
    A.part('head', [0, 0.26 * M, 0.2 * M], () => {
      faHjRows(A, 'feather', R([[0, 0.262, 0.18, 0.062, 0.066], [0, 0.284, 0.25, 0.08, 0.078], [0, 0.29, 0.31, 0.082, 0.078], [0, 0.285, 0.36, 0.064, 0.058], [0, 0.28, 0.395, 0.034, 0.03]]),
        12, 14, null, { round: [0, 0.22], colf: (t, f) => faHjMix(headC, belly, 0.7 * faHjSm(-0.2, -0.8, Math.cos(f))) });
      faHjTube(A, 'horn', faHjPath([[0, 0.29 * M, 0.37 * M], [0, 0.285 * M, 0.43 * M], [0, 0.27 * M, 0.49 * M]]), t => [0.024 * M * (1 - 0.9 * t), 0.017 * M * (1 - 0.85 * t)], 8, 8, beakC, { round: [0, 0.08] });
      faHjTube(A, 'horn', faHjPath([[0, 0.27 * M, 0.37 * M], [0, 0.264 * M, 0.46 * M]]), t => [0.019 * M * (1 - 0.9 * t), 0.009 * M * (1 - 0.8 * t)], 6, 8, faHjK(beakC, 1.25), { round: [0, 0.1] });
      for (const s of [-1, 1]) {
        A.ellip('feather', s * 0.066 * M, 0.3 * M, 0.315 * M, 0.02 * M, 0.02 * M, 0.019 * M, faHjK(belly, 1.5), { seg: 10 });
        A.ellip('eye', s * 0.075 * M, 0.301 * M, 0.317 * M, 0.014 * M, 0.014 * M, 0.014 * M, 0x0a0806, { seg: 8 });
      }
    });
    /* the fanned tail: a dozen feathers' tips notch its edge, a dark band at the end */
    A.part('tail', [0, 0.232 * M, -0.27 * M], () => faHjPlate(A, 'feather', (u, w) => {
      const a = 2 * u - 1, L = 0.25 + 0.03 * (1 - a * a) - 0.012 * Math.abs(Math.sin(u * Math.PI * 6)) * w;
      return [a * (0.028 + 0.11 * w) * M, (0.236 + 0.012 * w) * M, (-0.27 - L * w) * M];
    }, (u, w) => [0.005 * M * (1 - 0.8 * w), 0.002 * M * (1 - w)], 12, 5, (u, w, sd) => faHjK(faHjMix(tailC, tipC, faHjSm(0.72, 0.9, w)), sd > 0 ? 1 : 1.2)));
    /* the wings: broad at the wrist, pointed primaries with notched tips, coverts paler than the flight feathers; built
       spread (flight), folded by the runtime when perched */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.075 * M, 0.27 * M, 0.07 * M], () => faHjPlate(A, 'feather', (u, w) => {
      const le = 0.09 - 0.12 * Math.pow(u, 1.4);
      let ch = u < 0.35 ? 0.17 + 0.03 * u / 0.35 : 0.2 * (1 - Math.pow((u - 0.35) / 0.65, 1.3)) + 0.03;
      if (u > 0.4) ch *= 1 - 0.07 * Math.abs(Math.sin(u * Math.PI * 7)) * w;
      return [s * (0.075 + 0.64 * u) * M, (0.27 + 0.035 * u) * M, (le - ch * w) * M];
    }, (u, w) => [0.014 * M * (1 - 0.6 * u) * Math.sin(Math.PI * Math.pow(Math.max(0.0001, w), 0.6)), 0.004 * M * Math.sin(Math.PI * w)], 20, 6, (u, w, sd) => {
      let c = w < 0.4 ? faHjK(wingC, 1.12) : faHjK(wingC, 0.85);
      if (u > 0.55 && w > 0.45) c = faHjMix(c, tipC, faHjSm(0.55, 0.9, u));
      return sd > 0 ? c : faHjMix(c, belly, 0.5); }));
    /* the legs: a feathered thigh, a scaled shank, three toes forward and one back, each with its claw */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', [s * 0.045 * M, 0.13 * M, -0.01 * M], () => {
      A.ellip('feather', s * 0.05 * M, 0.135 * M, -0.01 * M, 0.034 * M, 0.042 * M, 0.045 * M, belly, { seg: 10 });
      const ank = [s * 0.056 * M, 0.018 * M, 0.006 * M];
      A.cone('scale', [s * 0.05 * M, 0.12 * M, -0.02 * M], ank, 0.0095 * M, 0.0075 * M, legC, 7);
      for (const a of [-0.45, 0, 0.45, Math.PI]) { const L = (a === Math.PI ? 0.04 : 0.058) * M, tip = [ank[0] + Math.sin(a) * L, 0.005 * M, ank[2] + Math.cos(a) * L];
        A.cone('scale', [ank[0], 0.008 * M, ank[2]], tip, 0.0058 * M, 0.0042 * M, legC, 5);
        A.cone('horn', tip, [tip[0] + Math.sin(a) * 0.016 * M, 0.002 * M, tip[2] + Math.cos(a) * 0.016 * M], 0.0035 * M, 0.0008 * M, clawC, 5); }
    });
  }
});

/* ---------------------------------------------------------------- the jungle butterfly */
/* one wing's outline (the kit's painted wing texture, WINGTEX): four quadratic curves in the wing's (u, v), u 0 the
   body root to 1 the tip, v 0 the fore edge to 1 the aft; and its eye spots [u, v, radius] */
const FA_HJ_FLY_OUT = [[[0.016, 0.5], [0.35, 0.02], [0.96, 0.10]], [[0.96, 0.10], [0.98, 0.55], [0.80, 0.72]], [[0.80, 0.72], [0.55, 0.98], [0.20, 0.90]], [[0.20, 0.90], [0.04, 0.75], [0.016, 0.5]]];
const FA_HJ_FLY_SPOT = [[0.62, 0.32, 0.086], [0.55, 0.68, 0.0625], [0.80, 0.50, 0.047]];
function faHjFlyOutline(s) {
  const f = Math.min(3.99999, Math.max(0, s * 4)), k = Math.floor(f), t = f - k, q = FA_HJ_FLY_OUT[k], m = 1 - t;
  return [m * m * q[0][0] + 2 * m * t * q[1][0] + t * t * q[2][0], m * m * q[0][1] + 2 * m * t * q[1][1] + t * t * q[2][1]];
}
ANIMAL({
  key: 'jungle-butterfly', name: 'Jungle butterfly', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'both', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'frugivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'canopy'], locomotion: ['flies', 'walks'] }),
  size: { length: 0.45, height: 0.4, span: 1.0 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '42-45, 69-73, 147-151', note: 'flyGeo (a thread body, two painted wing quads) and WINGTEX (dark rim, veins, three eye spots); 1 to 4 drifting 1-4 m up in the openings and round the blooms of the near floor; scale 0.8-1.6, tinted from the bloom palette. Head, antennae and legs are new' })],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 0.25, lifespan: 0.6, litter: 200, gestation: 7, note: 'egg, caterpillar and chrysalis in the first quarter year; litter the eggs a female lays; gestation the egg to hatching' },
  variants: 9, variantNames: ['rose', 'amber', 'violet', 'scarlet', 'gold', 'plum', 'blue', 'yellow', 'white'],
  w: 0.78, d: 0.64, h: 0.4,
  data: { mass: 0.4, legs: 6, wings: 1, sizeRange: [0.67, 1.33], speed: { walk: 0.05, run: 0.1, fly: 4 },
    gait: { type: 'insect', freq: 1.1, stride: 0.03 }, flap: { freq: 1.1, amp: 0.6, glide: 0 },
    herd: 'alone or 2 to 4 round a bloom', fleeDistance: 3, aggression: 0,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'FLY', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
    scheduleNote: 'BROWSE: at the blooms (nectar) and the fallen fruit' },
  build: function (A) {
    /* perched on six short legs, the wings half raised (they beat about this). A butterfly's proportions: a furred
       thorax that carries the wings, a big-eyed head with clubbed antennae and a coiled tongue, a banded abdomen */
    const v = A.variant, tint = FA_HJ_FLY_TINT[v], M = A.S, K = 1.2 * M, yb = 0.075 * M, RAISE = 0.7;
    const bodyC = faHjLin(0x2a2420, tint), furC = faHjLin(0x4a3e34, tint, 1.2), bandC = faHjLin(0x2a2420, tint, 0.55);
    const wingC = faHjLin(0xffffff, tint, 0.68), rimC = faHjLin(0xffffff, tint, 0.045), spotC = faHjLin(0xffffff, tint, 0.021), paleC = faHjLin(0xffffff, tint, 0.79), veinC = faHjLin(0xffffff, tint, 0.3);
    /* the thorax, furred, and the abdomen, banded, its tip drooping a little */
    A.ellip('coat', 0, yb, 0.024 * M, 0.04 * M, 0.043 * M, 0.07 * M, null, { seg: 12, colf: (x, y, z) => faHjK(furC, 0.85 + 0.3 * faNoise(x * 300, y * 300, z * 300)) });
    faHjTube(A, 'plain', faHjPath([[0, yb + 0.004 * M, -0.03 * M], [0, yb - 0.004 * M, -0.15 * M], [0, yb - 0.016 * M, -0.27 * M]]),
      t => { const k = t < 0.25 ? 0.8 + 0.8 * t : 1 - 0.75 * Math.pow((t - 0.25) / 0.75, 1.5); return [0.029 * M * k, 0.031 * M * k]; }, 14, 10, null,
      { round: [0, 0.1], colf: t => Math.sin(t * Math.PI * 9) > 0.55 ? bandC : bodyC });
    A.part('head', [0, yb, 0.08 * M], () => {
      A.ellip('coat', 0, yb + 0.004 * M, 0.11 * M, 0.034 * M, 0.033 * M, 0.03 * M, furC, { seg: 10 });
      A.ellip('plain', 0, yb - 0.014 * M, 0.132 * M, 0.011 * M, 0.017 * M, 0.018 * M, furC, { seg: 8, rx: 0.5 });
      /* the tongue, coiled under the head */
      faHjTube(A, 'plain', t => { const a = t * Math.PI * 3.2, r = (0.016 - 0.011 * t) * M; return [0, yb - 0.034 * M + r * Math.cos(a), 0.13 * M + r * Math.sin(a)]; },
        () => [0.0028 * M, 0.0028 * M], 18, 5, bodyC, { up: [1, 0, 0] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.026 * M, yb + 0.01 * M, 0.122 * M, 0.022 * M, 0.024 * M, 0.022 * M, 0x1c1e14, { seg: 10 });
        const tip = [s * 0.075 * M, yb + 0.15 * M, 0.33 * M];
        faHjTube(A, 'plain', faHjCR([[s * 0.01 * M, yb + 0.025 * M, 0.125 * M], [s * 0.035 * M, yb + 0.1 * M, 0.22 * M], tip]), () => [0.0035 * M, 0.0035 * M], 10, 5, bodyC);
        A.ellip('plain', tip[0], tip[1], tip[2], 0.009 * M, 0.009 * M, 0.018 * M, bodyC, { seg: 8, rx: -0.5 });
      }
    });
    /* the wings: one outline (the kit's painted wing) fanned from a point near its root, raised by RAISE about the body's
       long axis; membrane (seen from both sides); the texture's dark rim, veins and eye spots */
    const C0 = [0.12, 0.5], jr = j => 1 - Math.pow(1 - j, 1.5), NU = 48;
    const uvAt = (i, j) => { const o = faHjFlyOutline(i), r = jr(j); return [C0[0] + (o[0] - C0[0]) * r, C0[1] + (o[1] - C0[1]) * r]; };
    const wcol = (i, j) => {
      const r = jr(j);
      if (r > 0.955) return rimC;
      let c = wingC;
      if (Math.round(i * NU) % 6 === 3 && r > 0.12) c = faHjMix(c, veinC, 0.55);
      return faHjMix(c, bodyC, 0.5 * faHjSm(0.25, 0.0, r));
    };
    const x0 = 0.02 * M, y0 = yb + 0.03 * M, cw = Math.cos(RAISE), sw = Math.sin(RAISE);
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * x0, y0, 0.024 * M], () => {
      const at = (i, j) => { const p = uvAt(i, j), u = p[0], w = p[1];
        const fore = (0.16 - 0.32 * w) * (1 - u) + (0.13 - 0.30 * w) * u, lat = 0.40 * u * K;
        return [s * (x0 + lat * cw), y0 + lat * sw, 0.024 * M + fore * K]; };
      A.sheet('membrane', at, NU, 12, null, { colf: wcol });
      /* the eye spots: a dark disc with a pale centre, laid in the wing's plane through both faces */
      for (const e of FA_HJ_FLY_SPOT) { const lat = 0.40 * e[0] * K, c = [s * (x0 + lat * cw), y0 + lat * sw, 0.024 * M + ((0.16 - 0.32 * e[1]) * (1 - e[0]) + (0.13 - 0.30 * e[1]) * e[0]) * K];
        A.ellip('membrane', c[0], c[1], c[2], e[2] * 0.40 * K, 0.0016 * K, e[2] * 0.31 * K, spotC, { seg: 12, rz: s * RAISE });
        A.ellip('membrane', c[0], c[1], c[2], e[2] * 0.18 * K, 0.0024 * K, e[2] * 0.14 * K, paleC, { seg: 10, rz: s * RAISE }); }
    });
    /* six legs, short and jointed: pairs front to back, left then right; the thigh out and up, the shin down to the foot */
    [[0.055, 0.065], [0.025, 0.005], [-0.005, -0.06]].forEach(([z, dz], k) => { for (const s of [1, -1]) {
      const hip = [s * 0.012 * M, yb - 0.03 * M, z * M], knee = [s * 0.052 * M, yb + 0.002 * M, (z + dz * 0.45) * M], ft = [s * 0.072 * M, 0.0035 * M, (z + dz) * M];
      A.part('leg' + (2 * k + (s > 0 ? 0 : 1)), hip, () => {
        A.cone('plain', hip, knee, 0.0068 * M, 0.0056 * M, bodyC, 6);
        A.ellip('plain', knee[0], knee[1], knee[2], 0.0062 * M, 0.0062 * M, 0.0062 * M, bodyC, { seg: 6 });
        A.cone('plain', knee, ft, 0.0052 * M, 0.0034 * M, bodyC, 6);
      });
    } });
  }
});

/* ---------------------------------------------------------------- the strider */
ANIMAL({
  key: 'hyperjungle-strider', name: 'Hyperjungle strider', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground'], locomotion: ['walks', 'runs'] }),
  size: { length: 9.0, height: 6.5 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '47-59, 103-127, 157-167', note: 'striderGeo (body, rump, neck, head, ears, tail, three dorsal plates, four legs and hooves) and the herds: 4 to 9 walking between waypoints on the open floor between the boles, grazing between legs; scale 4.6-6.4, legs swung in the shader' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 6500, note: 'a living hill: one feeds a village for a season, smoked' },
    hide: { amount: 1, hideM2: 70, note: 'thick grey-green hide: boots, shields, boat skins' },
    horn: { amount: 25, note: 'the three dorsal plates: cut for bowls, scrapers and tiles' } },
  life: { maturity: 6, lifespan: 45, litter: 1, gestation: 480 },
  variants: 4, variantNames: ['sage', 'fawn', 'grey-green', 'pale'],
  w: 2.4, d: 8.8, h: 6.6,
  data: { mass: 15000, legs: 4, sizeRange: [0.84, 1.16], speed: { walk: 1.7, run: 6 }, gait: { type: 'quadruped', freq: 0.3, stride: 2.8 }, grazePitch: 1.25,
    herd: 'herds of 4 to 9 on the open floor', fleeDistance: 40, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    /* the kit's plan at scale 5.5, in metres: a deep barrel and a heavy rump on long legs, a neck that rises from the
       chest to a long head, three horny plates on the spine. Sleek hide (the library's strider hide), countershaded */
    const v = A.variant, tint = FA_HJ_STRIDER_TINT[v], M = A.S, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a6e5a), belly = col(0x6a6e5a, 1.28), rumpC = col(0x646852), neckC = col(0x62665a), headC = col(0x5c6054), darkC = col(0x4a4e44), plateC = col(0x8a7a58), legC = col(0x4e5246), hoofC = col(0x2e3028);
    const muzC = faHjK(darkC, 0.8), eyeC = 0x2a1c10;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const mott = (c, q) => faHjK(c, 0.93 + 0.14 * faNoise(q[0] * 1.6 + 2.1, q[1] * 1.6, q[2] * 1.6));
    const hide = base => (t, f, q) => { const up = Math.cos(f), z = q[2] / M;
      let c = faHjMix(base, rumpC, faHjSm(-1.2, -2.2, z));
      c = faHjMix(c, belly, faHjSm(-0.15, -0.7, up));
      c = faHjMix(c, darkC, 0.45 * faHjSm(0.86, 0.97, up));
      return mott(c, q); };
    /* the barrel, rump to chest */
    const BODY = faHjRows(A, 'sleek', R([[0, 3.62, -2.95, 0.1, 0.1], [0, 3.66, -2.72, 0.58, 0.64], [0, 3.68, -2.3, 0.88, 0.98], [0, 3.62, -1.5, 1.02, 1.12], [0, 3.56, -0.5, 1.13, 1.24],
      [0, 3.62, 0.5, 1.12, 1.26], [0, 3.78, 1.35, 1.0, 1.22], [0, 3.88, 2.0, 0.8, 1.04], [0, 3.9, 2.4, 0.44, 0.62], [0, 3.9, 2.56, 0.06, 0.06]]), 22, 16, null, { round: [0.05, 0.06], colf: hide(bodyC) });
    const spineY = z => { let best = 1e9, y = 0; for (let i = 0; i <= 200; i++) { const q = BODY(i / 200); if (Math.abs(q[2] - z) < best) { best = Math.abs(q[2] - z); y = q[1] + q[4]; } } return y; };
    /* the shoulder blades and the haunches, under the hide */
    for (const s of [1, -1]) {
      A.ellip('sleek', s * 0.64 * M, 3.6 * M, 1.62 * M, 0.3 * M, 0.95 * M, 0.6 * M, null, { seg: 12, rx: -0.35, colf: (x, y, z) => mott(y < -0.3 * M ? faHjMix(bodyC, belly, 0.4) : bodyC, [x, y, z]) });
      A.ellip('sleek', s * 0.68 * M, 3.55 * M, -1.85 * M, 0.36 * M, 1.0 * M, 0.85 * M, null, { seg: 12, rx: 0.2, colf: (x, y, z) => mott(rumpC, [x, y, z]) });
    }
    /* the dorsal ridge: three horny plates, thick at the root, leaning back, rounded to a point */
    for (let k = 0; k < 3; k++) { const z = (0.77 - k * 0.88) * M, ys = spineY(z), hgt = (0.82 - 0.06 * k) * M;
      faHjTube(A, 'horn', faHjPath([[0, ys - 0.25 * M, z], [0, ys + hgt, z - 0.22 * M]]), t => [0.1 * M * (1 - 0.65 * t), 0.42 * M * Math.pow(Math.max(0, 1 - t), 0.7) * (0.85 + 0.15 * Math.sin(Math.PI * Math.min(1, t * 2)))],
        10, 10, null, { up: [0, 0, 1], round: [0, 0.12], colf: t => t < 0.22 ? faHjMix(bodyC, plateC, t / 0.22) : faHjK(plateC, 1 + 0.25 * faHjSm(0.6, 1, t)) }); }
    /* the head with the neck: the neck thick where it leaves the chest, the head long, the lower jaw its own part */
    A.part('head', [0, 4.05 * M, 1.7 * M], () => {
      faHjRows(A, 'sleek', R([[0, 3.7, 1.2, 0.74, 0.97], [0, 4.1, 1.8, 0.62, 0.86], [0, 4.6, 2.35, 0.47, 0.62], [0, 5.1, 2.8, 0.37, 0.47], [0, 5.5, 3.12, 0.32, 0.4], [0, 5.72, 3.3, 0.3, 0.36]]),
        14, 14, null, { colf: (t, f, q) => { const up = Math.cos(f); return mott(faHjMix(faHjMix(neckC, belly, 0.6 * faHjSm(-0.2, -0.8, up)), darkC, 0.5 * faHjSm(0.82, 0.97, up)), q); } });
      faHjRows(A, 'sleek', R([[0, 5.74, 3.0, 0.29, 0.34], [0, 5.8, 3.3, 0.35, 0.37], [0, 5.74, 3.62, 0.32, 0.33], [0, 5.6, 3.98, 0.24, 0.26], [0, 5.48, 4.28, 0.2, 0.22], [0, 5.42, 4.48, 0.18, 0.2], [0, 5.4, 4.6, 0.12, 0.14]]),
        14, 14, null, { round: [0, 0.12], colf: (t, f, q) => mott(faHjMix(headC, muzC, faHjSm(4.0, 4.4, q[2] / M)), q) });
      for (const s of [-1, 1]) {
        /* the brow over each eye, the eye (an iris and a pupil), the nostrils, the line of the mouth */
        A.ellip('sleek', s * 0.27 * M, 5.98 * M, 3.45 * M, 0.12 * M, 0.07 * M, 0.17 * M, headC, { seg: 10 });
        A.ellip('eye', s * 0.315 * M, 5.86 * M, 3.47 * M, 0.06 * M, 0.07 * M, 0.08 * M, eyeC, { seg: 10 });
        A.ellip('eye', s * 0.36 * M, 5.87 * M, 3.48 * M, 0.02 * M, 0.04 * M, 0.035 * M, 0x050403, { seg: 8 });
        A.ellip('mouth', s * 0.09 * M, 5.46 * M, 4.57 * M, 0.04 * M, 0.03 * M, 0.035 * M, 0x14140f, { seg: 8, ry: s * 0.4 });
        faHjTube(A, 'mouth', faHjPath([[s * 0.15 * M, 5.3 * M, 4.5 * M], [s * 0.2 * M, 5.31 * M, 4.1 * M], [s * 0.23 * M, 5.36 * M, 3.8 * M]]), () => [0.02 * M, 0.016 * M], 6, 6, 0x1c1a14, { round: [0.15, 0.15] });
      }
    });
    A.part('jaw', [0, 5.52 * M, 3.3 * M], () => faHjRows(A, 'sleek', R([[0, 5.5, 3.15, 0.27, 0.2], [0, 5.38, 3.55, 0.22, 0.15], [0, 5.27, 3.95, 0.16, 0.1], [0, 5.22, 4.3, 0.13, 0.08], [0, 5.24, 4.5, 0.1, 0.06]]),
      10, 12, null, { round: [0.15, 0.2], colf: (t, f, q) => mott(faHjMix(faHjMix(headC, belly, 0.45 * faHjSm(0, -0.8, Math.cos(f))), muzC, faHjSm(4.0, 4.4, q[2] / M)), q) }));
    /* the ears: long leaves, tipped out, darker inside */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.27 * M, 6.0 * M, 3.2 * M], () => {
      A.ellip('sleek', s * 0.39 * M, 6.22 * M, 3.17 * M, 0.06 * M, 0.28 * M, 0.13 * M, darkC, { seg: 10, rz: -s * 0.55 });
      A.ellip('skin', s * 0.38 * M, 6.2 * M, 3.22 * M, 0.025 * M, 0.2 * M, 0.08 * M, faHjK(darkC, 0.6), { seg: 8, rz: -s * 0.55 });
    });
    /* the tail: hanging from the top of the rump, a dark tuft at the end */
    A.part('tail', [0, 3.9 * M, -2.72 * M], () => {
      const f = faHjRows(A, 'sleek', R([[0, 3.95, -2.55, 0.17, 0.17], [0, 3.85, -2.95, 0.15, 0.15], [0, 3.45, -3.4, 0.11, 0.11], [0, 2.95, -3.75, 0.08, 0.08], [0, 2.45, -3.95, 0.06, 0.06]]),
        12, 10, darkC, { round: [0, 0.08] });
      const tuft = [];
      for (let i = 0; i < 14; i++) { const q = f(0.82 + 0.18 * A.rnd()); tuft.push({ at: [q[0] + A.rr(-0.04, 0.04) * M, q[1], q[2] + A.rr(-0.04, 0.04) * M], dir: [A.rr(-0.25, 0.25), -1, A.rr(-0.35, 0.05)], len: A.rr(0.35, 0.6) * M, w: 0.09 * M, col: faHjK(darkC, 0.7), curl: 0.1 }); }
      A.locks('hair', tuft);
    });
    /* the legs: each turns about its shoulder or hip joint. The muscle at the top (the upper arm, the thigh) narrows to
       bony joints (elbow and knee in front, stifle and hock behind), a lean cannon, the fetlock, a pastern and the hoof */
    const legCol = (t, f, q) => { const y = q[1] / M; let c = faHjMix(legC, bodyC, faHjSm(1.5, 2.7, y)); if (y < 0.45) c = faHjMix(c, faHjK(darkC, 0.75), faHjSm(0.45, 0.3, y)); return mott(c, q); };
    for (const [front, s, i] of [[1, 1, 0], [1, -1, 1], [0, 1, 2], [0, -1, 3]]) {
      const pv = front ? [s * 0.66 * M, 3.3 * M, 1.75 * M] : [s * 0.72 * M, 3.5 * M, -1.75 * M];
      A.part('leg' + i, pv, () => {
        const rows = front
          ? [[0.66, 3.6, 1.85, 0.3, 0.42], [0.66, 3.1, 1.72, 0.3, 0.44], [0.63, 2.45, 1.42, 0.22, 0.32], [0.62, 2.0, 1.48, 0.2, 0.27], [0.6, 1.2, 1.55, 0.12, 0.14],
            [0.6, 0.85, 1.57, 0.09, 0.115], [0.6, 0.52, 1.58, 0.085, 0.11], [0.6, 0.3, 1.6, 0.1, 0.12], [0.6, 0.16, 1.72, 0.1, 0.1]]
          : [[0.72, 3.8, -1.8, 0.36, 0.6], [0.74, 3.2, -1.62, 0.38, 0.62], [0.72, 2.45, -1.3, 0.25, 0.36], [0.68, 1.95, -1.6, 0.2, 0.33], [0.66, 1.4, -2.0, 0.11, 0.17],
            [0.65, 0.95, -1.95, 0.09, 0.12], [0.64, 0.55, -1.88, 0.085, 0.11], [0.64, 0.3, -1.85, 0.1, 0.12], [0.64, 0.16, -1.74, 0.1, 0.1]];
        faHjRows(A, 'sleek', R(rows.map(r => [s * r[0], r[1], r[2], r[3], r[4]])), 18, 10, null, { up: [0, 0, 1], colf: legCol });
        const knob = (x, y, z, rx, ry, rz) => A.ellip('sleek', s * x * M, y * M, z * M, rx * M, ry * M, rz * M, null, { seg: 8, colf: (a, b, c) => legCol(0, 0, [s * x * M + a, y * M + b, z * M + c]) });
        if (front) {
          A.ellip('sleek', s * 0.66 * M, 2.85 * M, 1.5 * M, 0.26 * M, 0.5 * M, 0.3 * M, null, { seg: 10, rx: -0.3, colf: (a, b, c) => mott(bodyC, [a, b, c]) });   /* the triceps */
          knob(0.63, 2.42, 1.33, 0.15, 0.17, 0.15); knob(0.6, 1.17, 1.57, 0.13, 0.15, 0.13); knob(0.6, 0.31, 1.59, 0.115, 0.12, 0.13);
        } else {
          knob(0.73, 2.45, -1.22, 0.2, 0.22, 0.19); knob(0.66, 1.48, -2.12, 0.09, 0.15, 0.11); knob(0.64, 0.31, -1.86, 0.115, 0.12, 0.13);
        }
        const hz = (front ? 1.75 : -1.71) * M, hx = s * (front ? 0.6 : 0.64) * M;
        A.cone('hoof', [hx, 0.03 * M, hz + 0.035 * M], [hx, 0.26 * M, hz - 0.02 * M], 0.2 * M, 0.14 * M, hoofC, 12);
        A.ellip('hoof', hx, 0.03 * M, hz + 0.035 * M, 0.2 * M, 0.03 * M, 0.2 * M, faHjK(hoofC, 0.7), { seg: 12 });
      });
    }
  }
});

/* ---------------------------------------------------------------- the bough sloth */
ANIMAL({
  key: 'bough-sloth', name: 'Bough sloth', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'browser', activity: 'cathemeral', temperament: 'docile',
    habitat: ['canopy', 'trunks'], locomotion: ['climbs'] }),
  size: { length: 1.5, height: 1.7 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '60-65, 168-171', note: 'slothGeo (body, head, four limbs reaching up) hung under the big limbs (r >= 1.5 m, 40 m up or more) of the near hero hypertrees, static; scale 2-3.4; drawn in the instance tint alone (its material took no vertex colour)' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 160, note: 'a climber\'s prize, brought down with ropes' },
    hide: { amount: 1, hideM2: 4, note: 'the long coarse fur: rugs, bedding, rain capes' } },
  life: { maturity: 3, lifespan: 30, litter: 1, gestation: 300, note: 'the young rides its mother\'s belly for its first year' },
  variants: 3, variantNames: ['brown', 'tawny', 'dark'], poses: ['hang'],
  w: 1.38, d: 1.72, h: 1.9,
  data: { mass: 400, legs: 4, sizeRange: [0.74, 1.26], speed: { walk: 0.1, run: 0.25 }, gait: { type: 'climber', freq: 0.2, stride: 0.3 }, grazePitch: -0.45,
    idle: { headYaw: 0.3, headPitch: 0.06, tailYaw: 0 },
    herd: 'alone; a mother with one young', fleeDistance: 0, aggression: 0.1, hangs: true,
    schedule: ['REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'BROWSE', 'REST', 'REST'] },
  build: function (A) {
    /* the one pose, 'hang': as the kit hung it, back down and belly up, the four limbs reaching up to a bough that runs
       across it; the hands and feet meet under the bough and the long claws hook over it (round a 0.11 m bar, the
       sheet's; on a hero bough they sink into the bark). Built with its back's hair on y = 0, so a host hangs it by
       its 'grip' anchor (the bough's underside). Grazing (browsing) lifts the head to the leaves */
    const v = A.variant, tint = FA_HJ_SLOTH_TINT[v], M = A.S, G = 1.62 * M, BY = G + 0.114 * M, RHO = 0.132 * M;
    const fur = faHjLin(tint), furD = faHjLin(tint, null, 0.7), headC = faHjLin(tint, null, 1.3), faceC = faHjLin(tint, null, 1.9), limbC = faHjLin(tint, null, 0.8), maskC = faHjLin(tint, null, 0.3), clawC = 0x2a241c;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const coat = base => (t, f, q) => { const n = faNoise(q[0] * 7 + 1.3, q[1] * 7, q[2] * 7); return faHjK(n > 0.6 ? faHjMix(base, furD, 0.8) : base, 0.92 + 0.16 * faNoise(q[0] * 23, q[1] * 23, q[2] * 23)); };
    /* the body: shaggy, slung low between the limbs */
    const BODY = faHjRows(A, 'shag', R([[0, 0.6, -0.74, 0.12, 0.12], [0, 0.58, -0.6, 0.36, 0.34], [0, 0.55, -0.3, 0.5, 0.42], [0, 0.56, 0.05, 0.52, 0.44],
      [0, 0.6, 0.35, 0.46, 0.4], [0, 0.66, 0.55, 0.32, 0.3], [0, 0.7, 0.66, 0.2, 0.2]]), 18, 20, null, { round: [0.12, 0], shag: [0.1, 6], colf: coat(fur) });
    /* the long coat hangs from the sides and the back toward the ground (a sloth's hair parts on its belly) */
    const hair = [];
    for (let i = 0; i < 170; i++) {
      /* each lock lies along the coat, down the flank toward the back, and only the lowest hang free */
      const t = A.rr(0.06, 0.84), f = A.rr(Math.PI * 0.35, Math.PI * 1.65), q = BODY(t), sn = Math.sin(f), cs = Math.cos(f);
      const at = [q[3] * sn * 0.96, q[1] + q[4] * cs * 0.96, q[2]], sd = f < Math.PI ? 1 : -1;
      const tang = [sd * cs, -sd * sn], dir = [0.65 * tang[0] + 0.25 * sn, 0.65 * tang[1] - 0.55 + 0.25 * cs, A.rr(-0.3, 0.05)];
      const len = Math.min(A.rr(0.09, 0.16) * M, Math.max(0.02 * M, (at[1] - 0.01 * M) / 1.15));
      hair.push({ at: at, dir: dir, len: len, w: A.rr(0.12, 0.17) * M, col: faHjK(A.rnd() < 0.45 ? furD : fur, 0.85), curl: 0.12 });
    }
    A.locks('hair', hair);
    /* the head: round, the pale face mask with a dark band through each eye, the dark nose */
    A.part('head', [0, 0.68 * M, 0.45 * M], () => {
      A.ellip('shag', 0, 0.72 * M, 0.62 * M, 0.28 * M, 0.27 * M, 0.26 * M, null, { seg: 16, colf: (x, y, z) => coat(headC)(0, 0, [x, y, z]) });
      A.ellip('shag', 0, 0.71 * M, 0.79 * M, 0.2 * M, 0.18 * M, 0.1 * M, faceC, { seg: 14 });
      for (const s of [-1, 1]) {
        A.ellip('shag', s * 0.085 * M, 0.745 * M, 0.865 * M, 0.08 * M, 0.034 * M, 0.03 * M, maskC, { seg: 10, rz: -s * 0.35, ry: s * 0.45 });
        A.ellip('eye', s * 0.072 * M, 0.755 * M, 0.89 * M, 0.024 * M, 0.024 * M, 0.018 * M, 0x0a0806, { seg: 8 });
      }
      A.ellip('mouth', 0, 0.69 * M, 0.9 * M, 0.048 * M, 0.032 * M, 0.026 * M, 0x1a1410, { seg: 10 });
      faHjTube(A, 'mouth', faHjCR([[-0.045 * M, 0.648 * M, 0.865 * M], [0, 0.64 * M, 0.882 * M], [0.045 * M, 0.648 * M, 0.865 * M]]), () => [0.006 * M, 0.006 * M], 8, 5, 0x1a1410, { round: [0.2, 0.2] });
    });
    /* the limbs: leg0/1 the arms (front), leg2/3 the legs, each turning at the shoulder or hip: a shaggy upper limb, the
       elbow or knee bent out, the forearm or shin, a padded hand or foot under the bough, three long hooked claws over it */
    const LIMBS = [
      [1, 1, [[0.34, 0.62, 0.36, 0.17], [0.46, 0.9, 0.3, 0.16], [0.53, 1.13, 0.22, 0.13], [0.48, 1.36, 0.1, 0.11], [0.43, 1.52, 0.02, 0.085]], [0.42, 1.575, 0.0], -1],
      [1, -1, null, null, -1],
      [0, 1, [[0.3, 0.56, -0.42, 0.17], [0.4, 0.84, -0.4, 0.16], [0.44, 1.0, -0.33, 0.13], [0.34, 1.32, -0.14, 0.1], [0.24, 1.53, -0.03, 0.08]], [0.22, 1.575, -0.01], 1],
      [0, -1, null, null, 1]];
    LIMBS.forEach((L, i) => {
      const src = L[2] || LIMBS[i - 1][2], hand = L[3] || LIMBS[i - 1][3], s = L[1], wrap = L[4];
      const pts = src.map(p => [s * p[0] * M, p[1] * M, p[2] * M, p[3] * M]);
      A.part('leg' + i, [pts[0][0], pts[0][1], pts[0][2]], () => {
        faHjRows(A, 'shag', pts.map(p => [p[0], p[1], p[2], p[3], p[3]]), 16, 12, null, { up: [0, 0, 1], round: [0, 0.06], shag: [0.24, 8], colf: coat(limbC) });
        /* the hair drapes down off the bent elbow or knee */
        const el = pts[2], drape = [];
        for (let k = 0; k < 9; k++) drape.push({ at: [el[0] + s * A.rr(0.02, 0.1) * M, el[1] + A.rr(-0.12, 0.08) * M, el[2] + A.rr(-0.06, 0.06) * M], dir: [s * 0.4, -1, A.rr(-0.2, 0.2)], len: A.rr(0.1, 0.16) * M, w: 0.1 * M, col: faHjK(k % 3 ? limbC : furD, 0.85), curl: 0.2 });
        A.locks('hair', drape);
        const hx = s * hand[0] * M, hy = hand[1] * M, hz = hand[2] * M;
        A.ellip('shag', hx, hy, hz, 0.075 * M, 0.05 * M, 0.1 * M, faHjK(limbC, 0.85), { seg: 10 });
        /* three claws round the bough (it runs along x, its centre BY above the grip): arms over its back side, feet its front */
        for (const dx of [-0.038, 0, 0.038]) faHjTube(A, 'horn', t => { const th = -0.25 + 2.95 * t; return [hx + dx * M, BY - RHO * Math.cos(th), hz + wrap * RHO * Math.sin(th) * (th < 0 ? 0.5 : 1)]; },
          t => [0.017 * M * (1 - 0.75 * t), 0.021 * M * (1 - 0.75 * t)], 12, 6, clawC, { up: [1, 0, 0], round: [0, 0.06] });
      });
    });
    A.anchor('grip', [0, G, 0]);
  }
});

/* ---- kits/fauna/krator-fauna-livestock.js ---- */
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

/* ---- kits/fauna/krator-fauna-mounts.js ---- */
/* ======================================================================
   Krator Fauna: mounts (kits/fauna/krator-fauna-mounts.js)
   Animals the peoples ride and drive. First: the fire salamander of the crater drylands, the Scyvoi's mount (moved here
   from kits/scyvoi, 2026-10-06; the Scyvoi kit keeps the tack and fits it with KratorFauna.profile).
   ====================================================================== */
/* the salamander's body: t from the tail tip (0) to the snout (1), at scale 1: [t, z along, y of the centre line,
   half-width, half-height] (a heavy, low beast); the tail is t < FA_SAL_TAIL, the head t > 0.84 */
const FA_SAL = [[0, -2.55, .24, .015, .015], [.12, -2.05, .32, .1, .11], [.28, -1.35, .48, .24, .25], [.4, -.75, .66, .44, .37], [.5, -.3, .76, .56, .43],
  [.62, .3, .8, .6, .45], [.72, .85, .79, .53, .42], [.8, 1.25, .77, .39, .33], [.87, 1.62, .77, .46, .26], [.94, 2.0, .73, .43, .2], [1, 2.28, .69, .21, .11]];
const FA_SAL_TAIL = 0.36;
function faSalKey(t, i) {
  for (let k = 0; k < FA_SAL.length - 1; k++) { const a = FA_SAL[k], b = FA_SAL[k + 1];
    if (t <= b[0]) { const f = (t - a[0]) / (b[0] - a[0]), e = f * f * (3 - 2 * f); return a[i] + (b[i] - a[i]) * (i >= 3 ? e : f); } }
  return FA_SAL[FA_SAL.length - 1][i];
}
/* the markings (sRGB hex): 0 fire-black with ember blotches, 1 dun-red with saffron bands; t along, a round (0 the spine) */
function faSalSkin(v) {
  const base = v ? 0x5a2414 : 0x161414, spot = v ? 0xd8a028 : 0xf07418, spot2 = v ? 0xe8c040 : 0xf4a020, belly = v ? 0xc87a3a : 0xd8843a;
  return function (t, a) {
    const top = Math.cos(a);
    if (top < -0.55) return top < -0.75 ? belly : (faHash(t * 30, a, 1) < 0.5 ? belly : base);
    if (v) return Math.sin(t * 44) > 0.55 && top > -0.3 ? (faHash(Math.floor(t * 20), 1, 2) < 0.5 ? spot : spot2) : base;
    const n = faNoise(t * 22, a * 2.2, 3.7) * 0.74 + 0.26 * faNoise(t * 50, a * 5, 9.1);
    return n > 0.62 && top > -0.4 ? (n > 0.7 ? spot2 : spot) : base;
  };
}
ANIMAL({
  key: 'salamander', name: 'Fire salamander', group: 'mounts',
  tags: { biomes: ['crater-drylands'], koppen: ['BSk', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['temperate', 'tropic'], riparian: 'both',
    abyssal: false, domestic: true, herdedBy: ['scyvoi'], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'defensive',
    habitat: ['ground', 'marsh', 'shallows'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 4.8, height: 1.5 },
  source: [{ build: 'kits/scyvoi', file: 'src/56-sa-beasts.js', note: 'first drawn in the Scyvoi kit (2026-10-05), moved here 2026-10-06; the Scyvoi kit keeps the tack' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: true },
  yields: { meat: { amount: 140, note: 'a riding beast dressed; tough, eaten smoked' },
    eggs: { amount: 40, note: 'one clutch a year in a seep after the rains; a delicacy' },
    hide: { amount: 1, hideM2: 3.5, note: 'thick, slick and slow to burn: fire cloaks, shields, bellows; a beast also sheds its skin in strips each spring' } },
  life: { maturity: 4, lifespan: 40, litter: 40, gestation: 60, note: 'eggs, then an aquatic larva for a year in the seeps; it regrows a lost limb in a season (so, the riders say, do they)' },
  variants: 2, variantNames: ['ember: fire-black with ember blotches', 'dun: dun-red with saffron bands'],
  breeds: { riding: { scale: 1, mass: 420, role: 'riding mount' }, war: { scale: 1.08, mass: 540, role: 'war mount' }, draught: { scale: 1.28, mass: 860, role: 'draught' } },
  w: 2.2, d: 5.0, h: 1.6,
  data: { mass: 420, speed: { walk: 1.6, run: 9 }, gait: { type: 'sprawl', freq: 0.9, stride: 0.9 }, grazePitch: 0.32,
    herd: 'kept singly or in a band\'s string; wild ones lie up alone in the seeps', fleeDistance: 0, aggression: 0.35, regrows: true,
    schedule: ['REST', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, S = A.S, rest = A.pose === 'rest', dy = rest ? -0.42 : 0, skin = faSalSkin(v);
    const span = (t0, t1, curl) => [t => { const tt = t0 + (t1 - t0) * t; return [Math.sin((1 - tt) * 3) * (curl || 0) * Math.pow(1 - tt, 2) * S, (faSalKey(tt, 2) + dy) * S, faSalKey(tt, 1) * S]; },
      t => { const tt = t0 + (t1 - t0) * t; return [faSalKey(tt, 3) * S, faSalKey(tt, 4) * S]; }];
    const at = t => [0, (faSalKey(t, 2) + dy) * S, faSalKey(t, 1) * S];
    /* the trunk */
    { const [c, r] = span(FA_SAL_TAIL - 0.02, 0.86); A.tube('skin', c, r, 26, 16, null, { colf: (t, a) => skin(FA_SAL_TAIL - 0.02 + (0.88 - FA_SAL_TAIL) * t, a) }); }
    /* the tail: it sways about its root */
    A.part('tail', at(FA_SAL_TAIL), () => { const [c, r] = span(0, FA_SAL_TAIL + 0.02, 0.25 + 0.3 * (v % 2)); A.tube('skin', c, r, 14, 14, null, { caps: true, colf: (t, a) => skin(t * (FA_SAL_TAIL + 0.02), a) }); });
    /* the head: a broad flat skull, eyes on top, the long mouth line */
    A.part('head', at(0.84), () => {
      const [c, r] = span(0.84, 1); A.tube('skin', c, r, 10, 16, null, { caps: true, colf: (t, a) => skin(0.84 + 0.16 * t, a) });
      const hy = (faSalKey(0.95, 2) + dy) * S, hz = 1.98 * S;
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.22 * S, hy + 0.11 * S, hz - 0.06 * S, 0.075 * S, 0.075 * S, 0.075 * S, 0x120c08, { seg: 10 });
        A.ellip('eye', s * 0.24 * S, hy + 0.135 * S, hz - 0.03 * S, 0.03 * S, 0.03 * S, 0.03 * S, 0xe8b040, { seg: 6 });
        const L = [[s * 0.31, -0.05, -0.35], [s * 0.3, -0.06, 0], [s * 0.17, -0.07, 0.28], [0, -0.07, 0.34]].map(q => [q[0] * S, hy + q[1] * S, hz + q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.012 * S, 0.012 * S, 0x2a0e08, 5);
      }
    });
    /* the legs: splayed, each turning about its shoulder or hip; the feet flat with four toes */
    const LEGS = [[0.92, 1, 1, 0], [0.92, 1, -1, 1], [-0.42, 0, 1, 2], [-0.42, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * 0.42 * S, (0.66 + dy) * S, z * S];
      A.part('leg' + i, b, () => {
        const kn = rest ? [s * 0.82 * S, 0.3 * S, (z + (front ? 0.2 : -0.1)) * S] : [s * 0.76 * S, 0.46 * S, (z + (front ? 0.08 : -0.1)) * S];
        const ft = rest ? [s * 0.98 * S, 0.07 * S, (z + (front ? 0.48 : 0.12)) * S] : [s * 0.74 * S, 0.06 * S, (z + (front ? 0.26 : 0.04)) * S];
        const lerp3 = (p, q) => t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
        A.tube('skin', lerp3(b, kn), t => [(0.24 - 0.09 * t) * S, (0.26 - 0.1 * t) * S], 4, 10, null, { colf: (t, a) => skin(0.6, a) });
        A.ellip('skin', kn[0], kn[1], kn[2], 0.155 * S, 0.155 * S, 0.155 * S, skin(0.6, 0), { seg: 10 });
        A.tube('skin', lerp3(kn, ft), t => [(0.15 - 0.04 * t) * S, (0.16 - 0.06 * t) * S], 4, 8, null, { caps: true, colf: (t, a) => skin(0.6, a) });
        A.ellip('skin', ft[0], ft[1], ft[2] + 0.06 * S, 0.17 * S, 0.06 * S, 0.2 * S, skin(0.6, 0), { seg: 10 });
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.38 + (front ? 0 : 0.1) * s;
          A.cone('skin', [ft[0], ft[1] - 0.02 * S, ft[2] + 0.08 * S], [ft[0] + Math.sin(a) * 0.24 * S, ft[1] - 0.025 * S, ft[2] + 0.08 * S + Math.cos(a) * 0.24 * S], 0.04 * S, 0.018 * S, skin(0.6, 0), 6); }
      });
    }
    /* for the tack a people fits: the body's profile (t from tail to snout -> centre line and half sizes) and anchors */
    A.profile(t => ({ z: faSalKey(t, 1) * S, y: (faSalKey(t, 2) + dy) * S, hw: faSalKey(t, 3) * S, hh: faSalKey(t, 4) * S }));
    A.anchor('saddle', [0, (faSalKey(0.62, 2) + faSalKey(0.62, 4) + dy) * S, 0.25 * S]);
    A.anchor('bridle', [0, (faSalKey(0.95, 2) + dy) * S, 1.98 * S]);
    A.anchor('chest', [0, (faSalKey(0.78, 2) + dy) * S, 1.18 * S]);
    A.anchor('tailRoot', at(FA_SAL_TAIL)); A.anchor('headRoot', at(0.84));
  }
});

/* ---- kits/fauna/krator-fauna-voth.js ---- */
/* ======================================================================
   Krator Fauna: Voth (kits/fauna/krator-fauna-voth.js)
   The animals of the Vothic city on the southwest bay of the Ring Sea (settlements/voth), ported from its own builders:
   the ambient seagulls and cliff racers (src/84-fauna.js), the silt strider the strider guild rides (src/79c-strider-model.js:
   the animal only; the howdah, the handler's deck and the hollows carved in the shell are the culture's, left as anchors),
   the arena's tiger and pit lizard (src/78j-life-arena.js) and the giant beetle the ranches keep (src/65k-granary-mills-ranch.js,
   also fought in the arena).
   UNITS: Voth's world units are not metres. A citizen is 2.94 units = 1.75 m, so one unit is 0.595 m (FA_VO_U); every
   coordinate below is written in the original's units and scaled by it, so a number can be checked against the source.
   Biome: settlement-only animals take the nearest biome, the southwest bay (biomes/swbay: tropic, semiarid to humid).
   ====================================================================== */
const FA_VO_U = 1.75 / 2.94;
const FA_VO_KOPPEN = ['Aw', 'Cfa'], FA_VO_CLIMATE = ['tropic', 'temperate'];
/* colour helpers: Voth's own shade() (45-kit.js: toward white, or toward 0x1a1712 for a negative f), and a multiply */
function faVoShade(hex, f) { const c = new THREE.Color(hex); if (f >= 0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x1a1712), -f); return c.getHex(); }
function faVoMul(hex, k) { const c = new THREE.Color(hex); return [Math.min(1, c.r * k), Math.min(1, c.g * k), Math.min(1, c.b * k)]; }
function faVoMix(a, b, f) { const c = new THREE.Color(a).lerp(new THREE.Color(b), f); return [c.r, c.g, c.b]; }
/* a Catmull-Rom curve through points, t 0..1 */
function faVoSpline(pts) {
  const n = pts.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)], o = [];
    for (let k = 0; k < 3; k++) o.push(0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u));
    return o;
  };
}
/* a profile: keys [[t, a, b ...]] -> f(t) = [a, b ...], smoothstepped between keys */
function faVoProf(keys) {
  return function (t) {
    for (let k = 0; k < keys.length - 1; k++) { const a = keys[k], b = keys[k + 1];
      if (t <= b[0]) { const f = Math.max(0, (t - a[0]) / (b[0] - a[0])), e = f * f * (3 - 2 * f); return a.slice(1).map((v, i) => v + (b[i + 1] - v) * e); } }
    return keys[keys.length - 1].slice(1);
  };
}
/* the upper half of an ellipsoid (Voth's DOME shape: a hemisphere on its rim), faces outward: u runs the polar angle,
   v the azimuth; o.under adds the flat underside (the shell's lining) facing down */
function faVoDome(A, fam, c, r, col, nu, nv, o) {
  o = o || {};
  A.sheet(fam, (u, v) => { const ph = u * Math.PI / 2, th = v * TAU; return [c[0] + Math.sin(ph) * Math.cos(th) * r[0], c[1] + Math.cos(ph) * r[1], c[2] + Math.sin(ph) * Math.sin(th) * r[2]]; },
    nu, nv, col, o.colf ? { colf: o.colf } : null);
  if (o.under != null) A.sheet(fam, (u, v) => { const th = u * TAU, k = v * 0.995; return [c[0] + k * Math.cos(th) * r[0], c[1] + 0.002, c[2] + k * Math.sin(th) * r[2]]; }, nv, 3, o.under);
}
/* a flying wing from its root, along +x for side 1 (the left), -x for side -1: a flattened tube whose section is the
   chord; a straight swept leading edge, the chord tapering to a rounded tip; dihedral lifts it, droop bends the hand */
function faVoWing(A, fam, side, root, o) {
  const L = o.len, ch = o.chord, cd = Math.cos(o.dihedral), sd = Math.sin(o.dihedral), sw = Math.sin(o.sweep);
  const cAt = t => ch * (1 - (o.taper == null ? 0.25 : o.taper) * t) * Math.sqrt(Math.max(0.03, 1 - Math.pow(t, o.tipPow || 4)));
  const c = t => [root[0] + side * L * cd * t, root[1] + L * sd * t - (o.droop || 0) * t * t, root[2] + ch / 2 - L * sw * t - cAt(t) / 2];
  A.tube(fam, c, t => [cAt(t) / 2, o.thick * (1 - 0.7 * t)], o.nt || 12, o.ns || 8, null, { caps: true, colf: o.colf || (() => o.col) });
  return c;
}

/* ====================================================================== the seagull (84-fauna.js 62-73)
   The original: a box body 0.40 x 0.16 x 1.05 units and two box wings 1.15 long, 0.36 chord, raised 0.34 rad and swept
   0.22 rad, body 0xdcd7c8, wings 0xb2ab99. Kept: the size (a 0.62 m bird, 1.4 m span), the dihedral and sweep, both colours;
   added a head and beak, the grey mantle, dark wing tips and the legs it never needed in the air. */
const FA_VO_GULL = { body: 0xdcd7c8, wing: 0xb2ab99, tip: 0x4a4640, beak: 0xe8c040, leg: 0xd89a84 };
ANIMAL({
  key: 'seagull', name: 'Bay seagull', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'scavenger', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'water', 'shallows', 'rock'], locomotion: ['flies', 'glides', 'swims', 'walks'] },
  size: { length: 0.62, height: 0.34, span: 1.4 },
  source: [{ build: 'settlements/voth', file: 'src/84-fauna.js', lines: '62-73, 91-163', note: 'ambient: 20 gulls in 5 loose flocks wheeling 16-30 units over the bay\'s open water (WATER\'s three bay circles), an InstancedMesh of boxes' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 0.4, note: 'a lean, fishy bird; eaten by the poor of the cantons' },
    eggs: { amount: 3, note: 'one clutch a year, gathered from the roost ledges' },
    feathers: { amount: 0.05, note: 'moulted down for stuffing' } },
  life: { maturity: 4, lifespan: 20, litter: 3, gestation: 27, note: 'gestation: incubation of the clutch' },
  w: 1.45, d: 0.99, h: 0.52,
  data: { mass: 1.1, legs: 2, wings: 1, speed: { walk: 0.8, run: 2.5, fly: 11 }, gait: { type: 'flyer', freq: 1.6, stride: 0.1 },
    flap: { freq: 2.6, amp: 0.55, glide: 0.45, fold: 0.38, sweep: 1.3, foldScale: 0.6, tuck: 0.9 }, grazePitch: 0.6,
    herd: 'loose flocks of four wheeling over the bay; hundreds at the harbour roosts', fleeDistance: 6, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'FLY', 'FLY', 'HUNT', 'HUNT', 'FLY', 'IDLE', 'REST', 'REST', 'FLY', 'FLY', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_VO_GULL;
    /* the body: tail root to breast; the mantle (the back between the wings) takes the wing grey */
    const bc = faVoSpline([[0, 0.228, -0.27], [0, 0.214, -0.13], [0, 0.205, 0.02], [0, 0.215, 0.13], [0, 0.238, 0.19]]);
    const br = faVoProf([[0, 0.022, 0.018], [0.25, 0.062, 0.052], [0.55, 0.08, 0.07], [0.85, 0.07, 0.066], [1, 0.035, 0.04]]);
    A.tube('feather', bc, br, 12, 12, null, { caps: true, colf: (t, a) => Math.cos(a) > 0.45 && t > 0.15 && t < 0.85 ? C.wing : C.body });
    /* the head and neck */
    A.part('head', [0, 0.235, 0.17], () => {
      A.tube('feather', faVoSpline([[0, 0.228, 0.15], [0, 0.262, 0.2], [0, 0.295, 0.235]]), t => [0.042 - 0.008 * t, 0.045 - 0.008 * t], 4, 10, C.body);
      A.ellip('feather', 0, 0.305, 0.248, 0.04, 0.039, 0.05, C.body, { seg: 12 });
      A.tube('horn', t => [0, 0.299 - 0.012 * t * t, 0.288 + 0.062 * t], t => [0.011 * (1 - 0.65 * t), 0.013 * (1 - 0.45 * t)], 4, 8, C.beak, { caps: true });
      A.ellip('plain', 0, 0.284, 0.336, 0.005, 0.005, 0.007, 0xc83a28, { seg: 6 });   /* the red spot on the bill */
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.031, 0.315, 0.264, 0.008, 0.008, 0.008, 0xe8e0a0, { seg: 8 }); A.ellip('eye', s * 0.036, 0.316, 0.266, 0.004, 0.004, 0.004, 0x080605, { seg: 6 }); }
    });
    /* the tail: a short white fan */
    A.part('tail', [0, 0.226, -0.25], () => {
      A.tube('feather', t => [0, 0.226 - 0.006 * t, -0.25 - 0.1 * t], t => [0.03 + 0.03 * t, 0.012 - 0.008 * t], 4, 8, C.body, { caps: true });
    });
    /* the wings: root on the shoulder; 0.68 m from the body's centre as in the original (1.15 units), raised and swept */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.045, 0.246, 0.05], () => {
      faVoWing(A, 'feather', s, [s * 0.045, 0.246, 0.05], { len: 0.66, chord: 0.21, thick: 0.014, dihedral: 0.34, sweep: 0.22, droop: 0.05, tipPow: 3,
        colf: t => t > 0.8 ? C.tip : C.wing });
    });
    /* the legs: pink, webbed feet */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, [s * 0.032, 0.165, -0.02], () => {
      A.tube('feather', t => [s * 0.032, 0.165 - 0.05 * t, -0.02 + 0.01 * t], t => [0.016 - 0.006 * t, 0.018 - 0.006 * t], 3, 6, C.body);
      A.cone('scale', [s * 0.033, 0.12, -0.012], [s * 0.035, 0.012, 0.0], 0.0065, 0.005, C.leg, 6);
      for (const a of [-0.45, 0, 0.45]) A.cone('scale', [s * 0.035, 0.008, 0.0], [s * 0.035 + Math.sin(a) * 0.045, 0.006, Math.cos(a) * 0.045], 0.004, 0.0025, C.leg, 4);
      A.ellip('scale', s * 0.035, 0.005, 0.024, 0.024, 0.004, 0.022, C.leg, { seg: 8 });   /* the web */
    });
    A.anchor('perch', [0, 0, 0]);
  }
});

/* ====================================================================== the cliff racer (84-fauna.js 75-88)
   The original: a box body 0.55 x 0.42 x 2.6 units, a tail box 0.16 x 0.14 x 1.3 behind it, wings 2.2 long, 0.85 chord,
   raised 0.22 and swept 0.30, body 0x5c6a49, wings 0x3e4a34. Kept: its size (2.3 m nose to tail, 2.6 m span), the long
   tail, the broad swept wings and both colours; given a toothed snout, a paler belly, wing fingers and hind legs to perch on
   the ridges it hunts over. */
const FA_VO_RACER = { body: 0x5c6a49, wing: 0x3e4a34, belly: 0x8a9068, dark: 0x2a3222, tooth: 0xd8d0b8 };
ANIMAL({
  key: 'cliff-racer', name: 'Cliff racer', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid'], climate: FA_VO_CLIMATE, riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['sky', 'rock'], locomotion: ['flies', 'glides', 'walks', 'climbs'] },
  size: { length: 2.35, height: 0.85, span: 2.65 },
  source: [{ build: 'settlements/voth', file: 'src/84-fauna.js', lines: '75-88, 91-163', note: 'ambient: 12 racers in 3 flocks circling 65-140 units over the inland ridges (RIDGES, the near ranges) on wide predatory circles' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 3, note: 'stringy; hunters eat it to spite it' },
    hide: { amount: 1, hideM2: 1.6, note: 'the wing leather: thin, tough, for drumheads and kites' } },
  life: { maturity: 2, lifespan: 18, litter: 2, gestation: 45, note: 'two eggs on a cliff ledge, guarded by both; gestation: incubation' },
  w: 2.8, d: 2.6, h: 0.92,
  data: { mass: 14, legs: 2, wings: 1, speed: { walk: 0.6, run: 2, fly: 16 }, gait: { type: 'flyer', freq: 1.2, stride: 0.2 },
    flap: { freq: 1.3, amp: 0.45, glide: 0.6, fold: 0.3, sweep: 1.3, foldScale: 0.6, tuck: 0.9 }, grazePitch: 0.5,
    herd: 'hunting packs of four over the ridges', fleeDistance: 0, aggression: 0.75,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_VO_RACER, Y = 0.48;
    const skin = (t, a) => { const top = Math.cos(a); return top < -0.5 ? C.belly : top > 0.7 ? faVoMul(C.body, 0.85) : C.body; };
    /* the body: rump to the base of the neck (the original box ran -0.77..0.77 m with the head in it) */
    const bc = faVoSpline([[0, Y - 0.02, -0.76], [0, Y, -0.45], [0, Y + 0.01, -0.05], [0, Y + 0.02, 0.22], [0, Y + 0.04, 0.42]]);
    const br = faVoProf([[0, 0.05, 0.05], [0.3, 0.12, 0.11], [0.62, 0.165, 0.13], [0.85, 0.12, 0.11], [1, 0.07, 0.07]]);
    A.tube('scale', bc, br, 14, 12, null, { caps: true, colf: (t, a) => skin(t, a) });
    /* the head: a long neck and a narrow toothed snout */
    A.part('head', [0, Y + 0.04, 0.38], () => {
      A.tube('scale', faVoSpline([[0, Y + 0.03, 0.36], [0, Y + 0.08, 0.48], [0, Y + 0.11, 0.56]]), t => [0.065 - 0.012 * t, 0.07 - 0.01 * t], 5, 10, null, { colf: (t, a) => skin(t, a) });
      A.ellip('scale', 0, Y + 0.12, 0.6, 0.065, 0.06, 0.08, C.body, { seg: 12 });
      A.tube('scale', t => [0, Y + 0.115 - 0.03 * t, 0.62 + 0.26 * t], t => [0.042 * (1 - 0.8 * t) + 0.004, 0.035 * (1 - 0.75 * t) + 0.004], 6, 8, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.3 ? C.belly : C.body });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.05, Y + 0.145, 0.625, 0.016, 0.014, 0.018, 0xd8a028, { seg: 8 });
        A.ellip('eye', s * 0.058, Y + 0.146, 0.628, 0.008, 0.01, 0.008, 0x0a0806, { seg: 6 });
        for (let k = 0; k < 4; k++) A.cone('horn', [s * 0.028 * (1 - 0.15 * k), Y + 0.095 - 0.006 * k, 0.68 + 0.05 * k], [s * 0.03 * (1 - 0.15 * k), Y + 0.07 - 0.006 * k, 0.685 + 0.05 * k], 0.006, 0.001, C.tooth, 4);
      }
    });
    /* the tail: long and thin (the original's 1.3-unit box), ending in a small diamond vane */
    A.part('tail', [0, Y - 0.02, -0.74], () => {
      const tc = faVoSpline([[0, Y - 0.02, -0.74], [0, Y - 0.06, -1.05], [0, Y - 0.1, -1.35], [0, Y - 0.12, -1.55]]);
      A.tube('scale', tc, t => [0.05 * (1 - 0.8 * t) + 0.006, 0.045 * (1 - 0.8 * t) + 0.006], 10, 8, null, { caps: true, colf: (t, a) => skin(t, a) });
      A.tube('scale', t => [0, Y - 0.115, -1.43 - 0.16 * t], t => [0.07 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)) + 0.004, 0.008], 5, 6, C.wing, { caps: true });
    });
    /* the wings: 1.31 m from the body's centre (2.2 units), chord 0.5 m; darker fingers run out along the membrane */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.11, Y + 0.08, 0.1], () => {
      const W = { len: 1.22, chord: 0.5, thick: 0.022, dihedral: 0.22, sweep: 0.30, droop: 0.06, taper: 0.45, tipPow: 3, nt: 14, ns: 8,
        colf: (t, a) => (Math.sin(t * 9) > 0.8 ? C.dark : C.wing) };
      const c = faVoWing(A, 'membrane', s, [s * 0.11, Y + 0.08, 0.1], W);
      /* the arm and its three fingers, along the leading edge and out across the membrane */
      const le = t => { const p = c(t); return [p[0], p[1] + 0.012, p[2] + 0.5 * (1 - 0.45 * t) * Math.sqrt(Math.max(0.03, 1 - t * t * t)) / 2 - 0.02]; };
      A.tube('scale', le, t => [0.025 * (1 - 0.6 * t), 0.022 * (1 - 0.6 * t)], 10, 6, C.body, { caps: true });
      for (const [t0, back] of [[0.45, 0.32], [0.6, 0.26], [0.75, 0.18]]) { const p = le(t0); A.cone('scale', p, [p[0] + s * 0.06, p[1] - 0.004, p[2] - back], 0.012, 0.004, C.dark, 4); }
    });
    /* the hind legs, to perch: thigh, shank, and three claws */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, [s * 0.09, Y - 0.07, -0.1], () => {
      const pts = [[s * 0.09, Y - 0.07, -0.1], [s * 0.13, 0.26, 0.04], [s * 0.12, 0.06, -0.06]];
      /* straight thigh and shank with a knee knob (a spline here turned the tube's frame mid-leg and pinched a band at the ankle) */
      const L3 = (p, q) => t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
      A.tube('scale', L3(pts[0], pts[1]), t => [0.05 - 0.012 * t, 0.055 - 0.014 * t], 3, 8, C.body);
      A.ellip('scale', pts[1][0], pts[1][1], pts[1][2], 0.039, 0.039, 0.039, C.body, { seg: 8 });
      A.tube('scale', L3(pts[1], pts[2]), t => [0.03 - 0.01 * t, 0.032 - 0.01 * t], 3, 8, C.wing, { caps: true });
      for (const a of [-0.5, 0, 0.5]) A.cone('horn', [s * 0.12, 0.05, -0.06], [s * 0.12 + Math.sin(a) * 0.09, 0.006, -0.06 + Math.cos(a) * 0.09], 0.012, 0.004, C.dark, 5);
      A.cone('horn', [s * 0.12, 0.05, -0.06], [s * 0.12, 0.006, -0.13], 0.01, 0.004, C.dark, 5);
    });
    A.anchor('perch', [0, 0, -0.06]);
  }
});

/* ====================================================================== the silt strider (79c-strider-model.js 37-182, 437-574)
   The original: a 40-unit, six-legged colossus (25 m, 15 m to its crest): a segmented thorax barrel with a keeled belly and
   five chitin ribs, an abdomen cone, a tall arched carapace with a crest and four ridge spikes, a head with two eyes and
   swept antennae, a long four-segment proboscis with joint collars, a hip nub per leg, and spindly two-segment legs with
   a high bent knee (hip, knee pushed 3.6 out and 3.9 up from the hip-foot midpoint, feet splayed to 9.9). Its baked
   colours are the chitin's (bone, mid, dark, light). Kept: every one of those parts at its own place and radius, the
   palette (taken 12% darker: the source bakes it light under a per-instance tint) and the leg geometry; the crest and
   spikes now follow the dome instead of floating off its ends, the ribs stand proud of the barrel all round, the shell gets
   its lining underneath. LEFT OUT (the culture's, not the animal's): the howdah, the handler's deck and the dark hollows
   carved into the shell's flanks: anchors 'howdah', 'handler', 'hollowL', 'hollowR' mark where they go. */
const FA_VO_STR = { chit: 0xd2b888, mid: 0xae9068, dark: 0x866848, lite: 0xf0dcb4, lining: 0x4a3a2c, eye: 0x2a2118, leg: 0x4a3a28 };
const FA_VO_STR_HIPZ = [6.0, 0.4, -5.6], FA_VO_STR_DOME = { c: [0, 14.6, 0.2], r: [5.9, 9.4, 8.6] };
function faVoStrCol(hex) { return faVoMul(hex, 0.88); }
function faVoStrDomeTop(z) { const D = FA_VO_STR_DOME, q = (z - D.c[2]) / D.r[2]; return D.c[1] + D.r[1] * Math.sqrt(Math.max(0, 1 - q * q)); }
ANIMAL({
  key: 'silt-strider', name: 'Silt strider', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['voth'], diet: 'omnivore', feeding: 'detritivore', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'shallows', 'marsh'], locomotion: ['walks', 'wades'] },
  size: { length: 25, height: 15.8 },
  source: [{ build: 'settlements/voth', file: 'src/79c-strider-model.js', lines: '37-182, 437-574', note: 'domestic: the strider guild\'s passenger (jade-tinted) and cargo (grey) convoys walking STRIDER_ROUTES between the stations (src/66-striders.js, routing src/79a-convoys.js, src/79b-strider-nav.js); a howdah on the back, a handler on a deck at the neck' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 6000, note: 'only when one dies: the guild sells the flesh in the cantons for a week' },
    hide: { amount: 1, hideM2: 450, note: 'the carapace chitin: armour plates, roof shells, a shell-house\'s hull' } },
  life: { maturity: 30, lifespan: 250, litter: 1, gestation: 540, note: 'invented: a strider is older than the guild that drives it' },
  w: 14.2, d: 25.6, h: 16.6,
  data: { mass: 30000, legs: 6, speed: { walk: 2.4, run: 4.5 }, gait: { type: 'hexapod', freq: 0.22, stride: 4.5 }, idle: { headYaw: 0.07, headPitch: 0.02 }, grazePitch: 0.3,
    herd: 'kept singly by the strider guild; walked in convoys of two or three', fleeDistance: 0, aggression: 0.02,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const U = FA_VO_U, P = p => [p[0] * U, p[1] * U, p[2] * U], C = {};
    for (const k in FA_VO_STR) C[k] = k === 'leg' ? FA_VO_STR[k] : faVoStrCol(FA_VO_STR[k]);
    const grain = (base, x, y, z, amp) => { const n = faNoise(x * 0.6, y * 0.6, z * 0.6) - 0.5; const c = new THREE.Color().setRGB(base[0], base[1], base[2]); return [c.r * (1 + amp * n), c.g * (1 + amp * n), c.b * (1 + amp * n)]; };
    /* the thorax barrel: r 5.0 behind to 4.4 in front, z -11.5..5.5, centre 14.2; the keeled underbelly below it */
    const thR = z => 5.0 + (4.4 - 5.0) * (z + 11.5) / 17;
    A.tube('chitin', t => P([0, 14.2, -11.5 + 17 * t]), t => { const r = thR(-11.5 + 17 * t) * U; return [r, r]; }, 16, 18, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.55 ? C.dark : grain(C.mid, 0, a * 4, t * 17, 0.12) });
    A.tube('chitin', t => P([0, 11.7, -10.5 + 15 * t]), t => { const r = (3.7 + (3.3 - 3.7) * t) * U; return [r * 0.95, r]; }, 10, 14, C.dark, { caps: true });
    /* five chitin ribs, proud of the barrel all round (the source's rearmost two sat inside it) */
    for (const [z, r0] of [[5.2, 4.6], [1.6, 5.3], [-2.2, 5.6], [-6.2, 5.3], [-9.8, 4.4]]) {
      const r = Math.max(r0, thR(z) + 0.3) * U;
      A.tube('chitin', t => P([0, 14.2, z - 0.55 + 1.1 * t]), () => [r, r], 1, 18, C.lite, { caps: true });
    }
    /* the abdomen, tapering to a point behind, its segments banded */
    A.tube('chitin', t => P([0, 14.0 + 0.4 * t, -11.2 - 6.65 * t]), t => { const r = 4.3 * U * Math.pow(1 - t, 0.75) + 0.02; return [r, r * 0.95]; }, 12, 16, null,
      { caps: true, colf: (t, a) => (Math.sin(t * 26) > 0.7 ? C.dark : Math.cos(a) < -0.6 ? C.dark : C.mid) });
    /* the tall arched carapace: the upper half of an ellipsoid on its rim, lined beneath */
    const D = FA_VO_STR_DOME;
    faVoDome(A, 'chitin', P(D.c), P(D.r), null, 14, 30, { under: C.lining, colf: (u, v) => { const ph = u * Math.PI / 2; return Math.sin(ph * 22) > 0.88 && u > 0.25 ? C.lite : grain(C.chit, v * 20, u * 8, 0, 0.14); } });
    /* the crest spine along the dome's top, and four ridge spikes on it */
    A.tube('chitin', t => { const z = -6.55 + 13.5 * t; return P([0, faVoStrDomeTop(z) - 0.2, z]); }, t => [0.55 * U, (0.6 + 0.4 * Math.sin(Math.PI * t)) * U], 12, 8, C.lite, { caps: true });
    for (const z of [3.8, 0.6, -2.6, -5.6]) { const y = faVoStrDomeTop(z) + 0.2 + 0.4 * Math.sin(Math.PI * (z + 6.55) / 13.5); A.cone('chitin', P([0, y, z]), P([0, y + 2.4, z - 0.3]), 0.85 * U, 0.04, C.lite, 8); }
    /* hip sockets: a nub per leg, so the legs come out of something */
    for (const hz of FA_VO_STR_HIPZ) for (const s of [1, -1]) A.ellip('chitin', s * 4.7 * U, 12.6 * U, hz * U, 1.55 * U, 1.55 * U, 1.55 * U, C.dark, { seg: 10 });
    /* the head, eyes, antennae and the long segmented proboscis: one part, turning about the back of the head */
    A.part('head', P([0, 14.6, 5.2]), () => {
      A.ellip('chitin', 0, 14.6 * U, 7.8 * U, 3.4 * U, 3.2 * U, 3.6 * U, null, { seg: 16, colf: (x, y, z) => y < -1.2 ? C.dark : grain(C.chit, x, y, z, 0.12) });
      for (const s of [1, -1]) {
        A.ellip('eye', s * 2.2 * U, 16.3 * U, 9.4 * U, 0.95 * U, 0.95 * U, 0.95 * U, C.eye, { seg: 10 });
        /* the antenna, sweeping up and forward (the source's rotated cylinder: base and tip worked out) */
        A.tube('chitin', faVoSpline([P([s * 1.31, 15.74, 8.74]), P([s * 1.95, 17.6, 11.5]), P([s * 2.49, 19.06, 14.06])]), t => { const r = (0.3 - 0.19 * t) * U; return [r, r]; }, 8, 6, C.dark, { caps: true });
      }
      /* four tapering tubes on one line, nose-down, with a collar at each joint (the owner's trimmed proboscis) */
      const z0 = 10.9, y0 = 13.9, dz = 3.3, dy = -1.07, r = [2.35, 1.92, 1.50, 1.02, 0.38];
      for (let i = 0; i < 4; i++) {
        A.tube('chitin', t => P([0, y0 + dy * (i + t * 1.02 - 0.01), z0 + dz * (i + t * 1.02 - 0.01)]), t => { const q = (r[i] + (r[i + 1] - r[i]) * t) * U; return [q, q]; }, 3, 12, i % 2 ? C.mid : C.dark, { caps: i === 3 });
        if (i < 3) { const jz = z0 + dz * (i + 1), jy = y0 + dy * (i + 1), q = r[i + 1] * 1.16 * U, n = 0.45 / Math.hypot(dz, dy);
          A.tube('chitin', t => P([0, jy + dy * n * (2 * t - 1), jz + dz * n * (2 * t - 1)]), () => [q, q], 1, 12, C.lite, { caps: true }); }
      }
      A.ellip('mouth', 0, (y0 + dy * 4) * U, (z0 + dz * 4 + 0.15) * U, 0.3 * U, 0.3 * U, 0.2 * U, 0x2a1810, { seg: 8 });
    });
    /* the six legs: hip, a high knee pushed out and up from the hip-foot midpoint, a foot splayed wide; femur and tibia taper
       as the source's bar (0.62 -> 0.42 of its width: femur 1.15, tibia 0.78). Standing, the front feet reach forward and the
       hind feet back (the source's stride is 7.5 units; this stance takes 1.5 of it) */
    for (let i = 0; i < 6; i++) {
      const pair = i >> 1, s = (i & 1) ? -1 : 1, hz = FA_VO_STR_HIPZ[pair], fz = hz + [1.5, 0, -1.5][pair];
      const hip = [s * 4.7, 12.6, hz], foot = [s * 9.9, 0.25, fz], knee = [(hip[0] + foot[0]) / 2 + s * 3.6, (hip[1] + 0) / 2 + 3.9, (hz + fz) / 2];
      A.part('leg' + i, P(hip), () => {
        const lc = (t, a) => faVoMix(C.leg, 0x2a2016, 0.25 * (1 - Math.cos(a)) / 2);
        A.tube('chitin', t => P([hip[0] + (knee[0] - hip[0]) * t, hip[1] + (knee[1] - hip[1]) * t, hip[2] + (knee[2] - hip[2]) * t]), t => { const q = (0.62 - 0.2 * t) * 1.15 * U; return [q, q]; }, 4, 10, null, { colf: lc });
        A.ellip('chitin', knee[0] * U, knee[1] * U, knee[2] * U, 0.62 * U, 0.62 * U, 0.62 * U, C.leg, { seg: 10 });
        A.tube('chitin', t => P([knee[0] + (foot[0] - knee[0]) * t, knee[1] + (foot[1] - knee[1]) * t, knee[2] + (foot[2] - knee[2]) * t]), t => { const q = (0.62 - 0.2 * t) * 0.78 * U; return [q, q]; }, 6, 10, null, { colf: lc });
        A.cone('chitin', P([foot[0], 0.6, foot[2]]), [foot[0] * U, 0.0, foot[2] * U], 0.4 * U, 0.06 * U, 0x2a2016, 8);   /* the foot's point */
        A.cone('chitin', P([knee[0], knee[1] + 0.3, knee[2]]), P([knee[0] + s * 0.6, knee[1] + 1.6, knee[2]]), 0.22 * U, 0.03, C.leg, 5);   /* a knee spur */
      });
    }
    /* where a people's riding gear goes (the source's howdah floor, handler's deck and the hollows in the flanks) */
    A.anchor('howdah', P([0, 20.2, -7.8])); A.anchor('handler', P([0, 20.4, 7.2]));
    A.anchor('hollowL', P([5.35, 15.6, -0.6])); A.anchor('hollowR', P([-5.35, 15.6, -0.6]));
    A.anchor('lead', P([0, 13.9, 10.9]));
  }
});

/* ====================================================================== the arena tiger (78j-life-arena.js 187-223, 533-535)
   The original: one pit-beast silhouette for tiger and lizard, told apart by instance colour and scale: the tiger is
   0xbe7530 at 1.15. A barrel body (r 0.75 front, 0.90 behind, 3.6 long), a box head with a paler snout, shoulder and haunch
   masses over four leg posts, paler paws and ears, a tail behind. At 1.15 x 0.595 m it is a big beast: 4.8 m nose to tail
   tip, 1.64 m at the shoulder (a real tiger at 1.6x). Kept: that size, the orange, the pale parts. Redrawn as a big cat
   (quality pass 2026-10-06; the boxy masses read as a toy): a long torso tapering from a deep chest to a tucked waist and up
   to the haunch; the scapula riding up into a hump at the withers, the elbow tucked behind the chest; the hind leg
   digitigrade with a high hock; big round paws; a broad, short-muzzled head with a rounded skull, whisker pads and small
   rounded ears (black backs with the white spot); a tiger's stripes, thinning toward the cream belly and inner legs; the
   long tail ringed to a black tip. Written in metres. */
const FA_VO_TIGER = { base: 0xbe7530, pale: 0xeee2cc, stripe: 0x24160c, nose: 0x3a2420, eye: 0xd8a830 };
/* smoothstep */
function faVoSm(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
/* the tiger's coat at a point (metres) whose surface faces up by `top` (1 the back, -1 the belly) */
function faVoTigerCoat(x, y, z, top) {
  const C = FA_VO_TIGER, pale = faVoSm(-0.42, -0.75, top);
  let col = faVoMix(top > 0.75 ? faVoShade(C.base, -0.1) : C.base, C.pale, pale);
  /* the stripes: bands across the body, warped and forked by noise, thinning down the flank and gone on the belly */
  const q = z * 4.4 + 1.6 * (faNoise(z * 1.7 + 3, y * 2.1, Math.abs(x) * 1.4 + 7) - 0.5) + 0.35 * Math.sin(y * 5 + Math.abs(x) * 3);
  const d = Math.abs(q - Math.round(q)), w = 0.17 * faVoSm(-0.4, 0.45, top);
  if (w > 0.01 && faNoise(z * 3.3 + 11, y * 3.1, Math.abs(x) * 2 + 1) < 0.72) { const k = faVoSm(w, w * 0.45, d); if (k > 0) col = faVoMix(new THREE.Color().setRGB(col[0], col[1], col[2]).getHex(), C.stripe, k); }
  return col;
}
ANIMAL({
  key: 'arena-tiger', name: 'Arena tiger', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'aggressive',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps', 'swims'] },
  size: { length: 4.8, height: 1.7 },
  source: [{ build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '187-223, 525-536', note: 'captive: caught for the arena\'s afternoon bouts (12:00-18:00), loosed from the gate against the condemned and the armed (ARENA_STR tiger 1.8); drawn at 1.15x the pit-beast mesh, tinted 0xbe7530' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { hide: { amount: 1, hideM2: 5, note: 'the striped pelt: a victor\'s cloak, sold at the arena gate' } },
  life: { maturity: 3.5, lifespan: 18, litter: 3, gestation: 105 },
  w: 0.95, d: 5.0, h: 1.85,
  data: { mass: 650, legs: 4, speed: { walk: 1.5, run: 15 }, gait: { type: 'quadruped', freq: 0.9, stride: 1.2 }, grazePitch: 0.6,
    idle: { headYaw: 0.3, headPitch: 0.04, tailYaw: 0.18 },
    herd: 'solitary; the arena keeps a few in its pits', fleeDistance: 0, aggression: 0.85,
    schedule: ['REST', 'REST', 'REST', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_VO_TIGER, coat = faVoTigerCoat, F = 'sleek';
    const L3 = (a, b) => t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    /* the side a tube's section angle faces (the core's frame: +x along sin(angle) when this is +1) */
    const bx = (a, b) => { const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); return Math.abs(v.y) > 0.92 ? Math.sign(-v.y) : Math.sign(v.z) || 1; };
    /* ---- the torso: [z, top, bottom, half-width] from rump to the base of the neck: a deep chest, the waist tucked up,
       the back dipping behind the withers and rising a little over the loins */
    const Z0 = -1.42, Z1 = 1.22, key = faVoProf([[0, 1.30, 1.12, 0.07], [0.04, 1.40, 0.94, 0.23], [0.12, 1.47, 0.87, 0.30], [0.245, 1.50, 1.02, 0.29],
      [0.39, 1.49, 1.08, 0.27], [0.555, 1.51, 0.95, 0.30], [0.70, 1.56, 0.81, 0.33], [0.83, 1.64, 0.75, 0.35], [0.92, 1.61, 0.8, 0.33], [1, 1.50, 0.98, 0.22]]);
    const bc = t => { const k = key(t); return [0, (k[0] + k[1]) / 2, Z0 + (Z1 - Z0) * t]; }, br = t => { const k = key(t); return [k[2], (k[0] - k[1]) / 2]; };
    A.tube(F, bc, br, 48, 20, null, { caps: true, colf: (t, a) => { const p = bc(t), r = br(t); return coat(Math.sin(a) * r[0], p[1] + Math.cos(a) * r[1], p[2], Math.cos(a)); } });
    /* ---- the head (with the neck): a rounded skull, broad cheeks, a short muzzle with whisker pads; ears and jaw ride on it */
    A.part('head', [0, 1.38, 1.08], () => {
      A.tube(F, faVoSpline([[0, 1.3, 0.98], [0, 1.37, 1.22], [0, 1.43, 1.42]]), t => [0.25 - 0.05 * t, 0.3 - 0.07 * t], 6, 16, null,
        { colf: (t, a) => coat(Math.sin(a) * 0.22, 1.36 + Math.cos(a) * 0.26, 1.0 + 0.4 * t, Math.cos(a) * (Math.cos(a) < 0 ? 1.4 : 1)) });
      const head = (cx, cy, cz) => (x, y, z) => {
        const X = cx + x, Y = cy + y, Z = cz + z, ax = Math.abs(X);
        if (Y < 1.39 - 0.25 * Math.max(0, Z - 1.6) || (ax > 0.19 && Y < 1.42)) return Y < 1.36 || ax > 0.2 ? C.pale : faVoMix(C.base, C.pale, 0.55);   /* the cream cheeks, muzzle and chin */
        if (Y > 1.52 && ax < 0.14 && Z < 1.7 && Math.sin(ax * 60 + Z * 9) > 0.55) return C.stripe;   /* the forehead's marks */
        if (ax > 0.15 && Math.sin(Z * 26 - Y * 16) > 0.72) return C.stripe;   /* the cheek stripes */
        return Y > 1.62 ? faVoShade(C.base, -0.08) : C.base;
      };
      A.ellip(F, 0, 1.47, 1.5, 0.235, 0.215, 0.25, null, { seg: 16, colf: head(0, 1.47, 1.5) });   /* the cranium */
      for (const s of [-1, 1]) A.ellip(F, s * 0.15, 1.4, 1.54, 0.13, 0.15, 0.17, null, { seg: 10, rz: s * 0.25, colf: head(s * 0.15, 1.4, 1.54) });   /* cheeks and ruff */
      A.ellip(F, 0, 1.5, 1.7, 0.095, 0.075, 0.16, null, { seg: 10, rx: 0.12, colf: head(0, 1.5, 1.7) });   /* the bridge of the nose */
      A.ellip(F, 0, 1.4, 1.73, 0.15, 0.115, 0.14, null, { seg: 10, colf: head(0, 1.4, 1.73) });   /* the muzzle */
      for (const s of [-1, 1]) {
        A.ellip(F, s * 0.07, 1.365, 1.815, 0.08, 0.062, 0.066, null, { seg: 10, colf: (x, y, z) => (y > 0 && x * s > 0.02 && Math.sin(z * 120) > 0.6 && Math.sin(y * 140) > 0.3 ? C.stripe : C.pale) });   /* the whisker pads */
        A.ellip('eye', s * 0.112, 1.535, 1.7, 0.029, 0.026, 0.026, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.118, 1.537, 1.726, 0.015, 0.015, 0.008, 0x080605, { seg: 6 });
        A.ellip(F, s * 0.112, 1.592, 1.685, 0.04, 0.016, 0.03, C.pale, { seg: 8 });   /* the white brow spot */
        A.ellip(F, s * 0.155, 1.535, 1.695, 0.02, 0.04, 0.02, C.stripe, { seg: 6, rz: s * 0.4 });   /* the dark line from the eye's outer corner */
      }
      A.ellip('skin', 0, 1.432, 1.875, 0.055, 0.032, 0.032, C.nose, { seg: 8, rx: -0.3 });
      A.cone('mouth', [0, 1.41, 1.885], [0, 1.355, 1.865], 0.007, 0.007, 0x2a1a16, 4);   /* the philtrum */
      /* whiskers: white, fanning out of the pads */
      const wh = [];
      for (const s of [-1, 1]) for (let k = 0; k < 6; k++) wh.push({ at: [s * 0.12, 1.33 + 0.012 * k, 1.8 + 0.008 * (k % 3)], dir: [s, 0.08 * (k - 2.5) - 0.1, -0.25 - 0.06 * (k % 2)], len: 0.2 + 0.03 * (k % 3), w: 0.007, col: 0xf2eee4, curl: 0.15 });
      A.locks('hair', wh);
    });
    /* the lower jaw: a pale chin behind the muzzle, the dark lip line along it */
    A.part('jaw', [0, 1.33, 1.52], () => {
      A.ellip(F, 0, 1.285, 1.72, 0.1, 0.055, 0.13, C.pale, { seg: 10 });
      A.ellip('mouth', 0, 1.322, 1.76, 0.115, 0.012, 0.1, 0x2a1a16, { seg: 10 });
    });
    /* small rounded ears, set wide: pale inside, black behind with the white spot */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.15, 1.64, 1.43], () => {
      A.ellip(F, s * 0.17, 1.705, 1.41, 0.07, 0.075, 0.026, null, { seg: 10, ry: -s * 0.3, rz: -s * 0.35,
        colf: (x, y, z) => z > 0.004 ? (Math.hypot(x, y) > 0.042 ? C.base : faVoMix(C.base, C.pale, 0.7)) : (Math.hypot(x, y + 0.008) < 0.03 ? C.pale : C.stripe) });
    });
    /* ---- the tail: from the rump it falls and hangs in a long curve, lifting at the tip; ringed, the tip black */
    A.part('tail', [0, 1.37, -1.32], () => {
      const tc = faVoSpline([[0, 1.37, -1.32], [0, 1.2, -1.7], [0, 0.9, -2.1], [0, 0.66, -2.5], [0.04, 0.55, -2.8], [0.08, 0.6, -3.02]]);
      A.tube(F, tc, t => { const r = 0.095 - 0.035 * t; return [r, r]; }, 18, 10, null, { caps: true,
        colf: (t, a) => t > 0.9 || (t > 0.42 && Math.sin(t * 46) > 0.45) ? C.stripe : (Math.cos(a) < -0.4 ? faVoMix(C.base, C.pale, 0.6) : (t < 0.42 && Math.sin(t * 40) > 0.6 ? C.stripe : C.base)) });
    });
    /* ---- the legs: each swings about its shoulder or hip. The upper masses (scapula, arm, thigh) take the flank's stripes
       and sit mostly inside the torso, proud only where a cat's are (the hump at the withers, the haunch); the lower leg is
       orange outside with a few thin bars, cream inside */
    const legCol = (s, side, x, y, z) => {
      if (side < -0.35) return faVoMix(C.base, C.pale, 0.6);
      const st = faVoSm(0.35, 0.7, y), q = y * 6 + 0.9 * (faNoise(x * 2 + 4, y * 2.2, z * 2.2) - 0.5), d = Math.abs(q - Math.round(q));
      return st > 0 && d < 0.08 * st && faNoise(x * 3, y * 4, z * 3 + 2) < 0.7 ? C.stripe : (y < 0.3 ? faVoMix(C.base, C.pale, 0.2) : C.base);
    };
    const seg = (s, a, b, ra, rb, nt) => { const sg = bx(a, b), c = L3(a, b);
      A.tube(F, c, t => [ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t], nt || 4, 12, null, { colf: (t, ang) => { const p = c(t); return legCol(s, Math.sin(ang) * sg * s, p[0], p[1], p[2]); } }); };
    const mass = (s, c, r, rx, seg2) => A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], null, { seg: seg2 || 10, rx: rx, colf: (x, y, z) => legCol(s, x * s / r[0], c[0] + x, c[1] + y, c[2] + z) });
    const flank = (s, c, r, rx, seg2) => A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], null, { seg: seg2 || 10, rx: rx,
      colf: (x, y, z) => x * s / r[0] < -0.5 ? faVoMix(C.base, C.pale, 0.6) : coat(c[0] + x, c[1] + y, c[2] + z, Math.max(-1, Math.min(1, 1.2 * y / r[1] + 0.2))) });
    const paw = (s, c, r) => {
      A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], faVoMix(C.base, C.pale, 0.3), { seg: 10 });
      for (const k of [-1.5, -0.5, 0.5, 1.5]) A.ellip(F, c[0] + k * r[0] * 0.44, 0.045, c[2] + r[2] * (0.72 - 0.1 * Math.abs(k)), r[0] * 0.34, 0.045, r[2] * 0.36, faVoMix(C.base, C.pale, 0.4), { seg: 5 });
    };
    for (const [front, s, i] of [[1, 1, 0], [1, -1, 1], [0, 1, 2], [0, -1, 3]]) {
      const X = v => [s * v[0], v[1], v[2]];
      if (front) A.part('leg' + i, X([0.24, 1.42, 0.82]), () => {
        const EL = X([0.25, 0.82, 0.69]), WR = X([0.24, 0.21, 0.77]), PS = X([0.24, 0.1, 0.83]);
        flank(s, X([0.22, 1.33, 0.86]), [0.12, 0.3, 0.19], -0.45);   /* the scapula, under the hump at the withers */
        flank(s, X([0.235, 1.0, 0.84]), [0.1, 0.25, 0.16], 0.78);   /* the upper arm, down and back to the elbow */
        mass(s, X([0.24, 0.82, 0.67]), [0.085, 0.085, 0.08], 0, 8);   /* the point of the elbow, behind the chest */
        seg(s, EL, WR, [0.12, 0.13], [0.085, 0.08], 4);
        mass(s, X([0.25, 0.6, 0.735]), [0.12, 0.22, 0.13], -0.12);   /* the forearm's muscle */
        seg(s, WR, PS, [0.085, 0.08], [0.085, 0.08], 2);
        paw(s, X([0.24, 0.075, 0.86]), [0.125, 0.075, 0.14]);
      });
      else A.part('leg' + i, X([0.25, 1.25, -0.95]), () => {
        const ST = X([0.28, 0.8, -0.68]), HK = X([0.25, 0.5, -1.1]), MT = X([0.24, 0.1, -0.98]);
        flank(s, X([0.24, 1.06, -0.9]), [0.15, 0.36, 0.3], -0.54, 12);   /* the thigh and haunch */
        seg(s, ST, HK, [0.12, 0.15], [0.07, 0.075], 4);
        mass(s, X([0.25, 0.72, -0.89]), [0.1, 0.19, 0.12], 0.95);   /* the calf */
        mass(s, X([0.25, 0.52, -1.135]), [0.065, 0.075, 0.085], 0, 8);   /* the hock, high off the ground */
        seg(s, HK, MT, [0.07, 0.075], [0.075, 0.075], 3);
        paw(s, X([0.24, 0.07, -0.91]), [0.115, 0.07, 0.13]);
      });
    }
  }
});

/* ====================================================================== the pit lizard (78j-life-arena.js 187-223, 533-535)
   The original: the same pit-beast silhouette as the tiger at 0.92, tinted 0x6d8a4b (the caravans' draught "lizard" is a
   data field on a generic quadruped, 78i-life-trade.js). Kept: its length (3.9 m nose to tail at 0.92 x 0.595 m), the barrel
   body, the boxy head with a paler jaw, the shoulder and haunch masses and the green; refined into a lizard: the legs
   splay out at the elbow and knee onto clawed feet (a semi-sprawl, so its back is lower than the source's), the tail is
   thick at the root and tapers (the source's thickened toward the tip), a row of scutes runs down the back and it is banded. */
const FA_VO_LIZ = { base: 0x6d8a4b, belly: 0xc4c48a, band: 0x3e5228, scute: 0x4a5c32, eye: 0xc89a28, claw: 0x2a2a20 };
ANIMAL({
  key: 'pit-lizard', name: 'Pit lizard', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 3.9, height: 1.05 },
  source: [{ build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '187-223, 525-536', note: 'captive: an arena beast, hunted by two armed men in the pit (ARENA_STR lizard 1.2); drawn at 0.92x the pit-beast mesh, tinted 0x6d8a4b' },
    { build: 'settlements/voth', file: 'src/78i-life-trade.js', lines: '195-206, 372', note: 'domestic: a merchant caravan\'s draught animal (ox, lizard or beetle, a data field on one generic quadruped)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 70, note: 'white, tail meat the best' }, eggs: { amount: 18, note: 'one clutch a year, buried in warm sand' },
    hide: { amount: 1, hideM2: 3, note: 'scaled hide: boots, shield facings' } },
  life: { maturity: 3, lifespan: 30, litter: 18, gestation: 70, note: 'eggs; gestation: incubation in the sand' },
  w: 2.0, d: 4.2, h: 1.15,
  data: { mass: 300, legs: 4, speed: { walk: 1.0, run: 6 }, gait: { type: 'sprawl', freq: 1.0, stride: 0.7 }, grazePitch: 0.35,
    herd: 'solitary wild; caravans keep one to a cart', fleeDistance: 2, aggression: 0.5,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = 0.92 * FA_VO_U, P = p => [p[0] * K, p[1] * K, p[2] * K], C = FA_VO_LIZ;
    const skin = (z, a) => { const top = Math.cos(a); if (top < -0.5) return C.belly;
      const n = faNoise(z * 3.1, a * 2.0, 4.4); return (Math.sin(z * 4.2 + 1.3) > 0.55 && top > -0.3) || n > 0.72 ? C.band : C.base; };   /* the phase keeps a band off the neck (it read as a collar) */
    /* the body: low and broad (the source's barrel, r 0.9 behind and 0.75 in front) */
    const bc = faVoSpline([P([0, 1.22, -1.75]), P([0, 1.3, -1.1]), P([0, 1.32, 0.2]), P([0, 1.34, 1.3]), P([0, 1.38, 1.95])]);
    const br = faVoProf([[0, 0.55, 0.45], [0.15, 0.82, 0.62], [0.5, 0.9, 0.66], [0.82, 0.78, 0.6], [1, 0.52, 0.44]]);
    A.tube('scale', bc, t => br(t).map(v => v * K), 16, 14, null, { caps: true, colf: (t, a) => skin(bc(t)[2] / K, a) });
    /* scutes down the spine */
    for (let k = 0; k < 9; k++) { const t = 0.08 + k * 0.105, p = bc(t), h = br(t)[1] * K; A.cone('horn', [0, p[1] + h - 0.02, p[2]], [0, p[1] + h + 0.07 * K + 0.04, p[2] - 0.06], 0.07 * K, 0.008, C.scute, 5); }
    /* the head: a wedge from the neck to the snout, eyes on its sides; the paler jaw beneath it */
    A.part('head', P([0, 1.38, 1.8]), () => {
      const hc = t => P([0, 1.42 - 0.12 * t, 1.75 + 1.55 * t]), hr = faVoProf([[0, 0.5, 0.42], [0.35, 0.52, 0.4], [0.8, 0.34, 0.24], [1, 0.2, 0.14]]);
      A.tube('scale', hc, t => hr(t).map(v => v * K), 10, 12, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.4 ? C.belly : (t > 0.2 && Math.cos(a) > 0.6 && faNoise(t * 9, a * 3, 1) > 0.6 ? C.band : C.base) });
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.4 * K, 1.58 * K, 2.42 * K, 0.1 * K, 0.08 * K, 0.1 * K, C.eye, { seg: 8 }); A.ellip('eye', s * 0.44 * K, 1.58 * K, 2.44 * K, 0.03 * K, 0.07 * K, 0.04 * K, 0x080605, { seg: 6 });
        A.ellip('mouth', s * 0.1 * K, 1.4 * K, 3.24 * K, 0.035 * K, 0.025 * K, 0.03 * K, 0x1a1410, { seg: 6 }); }
    });
    A.part('jaw', P([0, 1.15, 1.95]), () => {
      A.tube('scale', t => P([0, 1.12 - 0.03 * t, 1.85 + 1.35 * t]), t => [(0.42 - 0.24 * t) * K, (0.13 - 0.06 * t) * K], 6, 10, C.belly, { caps: true });
    });
    /* the tail: thick at the root, tapering to a whip that rests near the ground */
    A.part('tail', P([0, 1.2, -1.65]), () => {
      const tc = faVoSpline([P([0, 1.2, -1.65]), P([0, 0.95, -2.5]), P([0.12, 0.6, -3.2]), P([0.32, 0.36, -3.85])]);
      A.tube('scale', tc, t => { const r = (0.55 * Math.pow(1 - t, 0.9) + 0.04) * K; return [r, r * 0.85]; }, 14, 10, null, { caps: true, colf: (t, a) => skin(-1.65 - t * 2.2, a) });
    });
    /* the legs: shoulder and haunch masses at the source's places, the limb splaying out to an elbow (knee) and down onto a
       clawed foot */
    for (const [z, front, s, i] of [[1.2, 1, 1, 0], [1.2, 1, -1, 1], [-1.2, 0, 1, 2], [-1.2, 0, -1, 3]]) A.part('leg' + i, P([s * 0.6, 1.2, z]), () => {
      const m = front ? [0.48, 0.44, 0.6] : [0.55, 0.5, 0.68];
      A.ellip('scale', s * 0.6 * K, 1.2 * K, z * K, m[0] * K, m[1] * K, m[2] * K, null, { seg: 12, colf: (x, y) => y < -0.25 * K ? C.belly : C.base });
      const el = [s * 1.4, 0.84, z + (front ? -0.12 : 0.18)], ft = [s * 1.34, 0.12, z + (front ? 0.25 : -0.08)];   /* the elbow out and back, the knee out and forward: a sprawl */
      A.tube('scale', faVoSpline([P([s * 0.75, 1.15, z]), P([(s * 0.75 + el[0]) / 2, 1.06, (z + el[2]) / 2]), P(el)]), t => { const r = (0.3 - 0.06 * t) * K; return [r, r]; }, 5, 10, null, { colf: (t, a) => Math.cos(a) < -0.3 ? C.belly : C.base });
      A.ellip('scale', el[0] * K, el[1] * K, el[2] * K, 0.24 * K, 0.24 * K, 0.24 * K, C.base, { seg: 10 });
      A.tube('scale', faVoSpline([P(el), P([(el[0] + ft[0]) / 2 + s * 0.05, 0.48, (el[2] + ft[2]) / 2]), P(ft)]), t => { const r = (0.22 - 0.06 * t) * K; return [r, r]; }, 6, 10, null, { colf: (t, a) => skin(z + t, a) });
      A.ellip('scale', ft[0] * K, 0.1 * K, (ft[2] + 0.1) * K, 0.24 * K, 0.1 * K, 0.3 * K, C.base, { seg: 10 });
      for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.38 + s * (front ? 0.35 : 0.5);
        A.cone('horn', [ft[0] * K, 0.06 * K, (ft[2] + 0.2) * K], [(ft[0] + Math.sin(a) * 0.42) * K, 0.02, (ft[2] + 0.2 + Math.cos(a) * 0.42) * K], 0.05 * K, 0.012, C.claw, 4); }
    });
  }
});

/* ====================================================================== the giant beetle (65k-granary-mills-ranch.js 435-476; 78j-life-arena.js 225-251)
   The ranch's beetleModel() is the richer original (the arena's copy lifts its proportions): an abdomen, thorax and head,
   each a dome (r 1.5, 1.0, 0.55 units; 0.88, 0.94, 0.86 as tall) on a body raised by its own legs (0.95 of the abdomen's
   radius); the thorax a shade lighter, the head a shade darker, the legs darker still (shade -0.24); two antennae forward
   and out; six legs in three pairs. Its shell colour is a bark or a leaf tone shaded -0.22; the arena's is 0x4b4034 at
   1.15. Kept: every dome at its place and size, the shades, all three shell colours (variants) and both sizes (breeds);
   refined: the domes get an underside, the elytra a seam, the antennae rise, and the six stub posts become a beetle's legs.
   Quality pass (2026-10-06): the posts held the body high on stilts; now the body sits low (the rim at 0.95 units, not
   1.425) and each leg leaves it sideways under the shell's edge (coxa), the femur rises up and out to a knee past the rim,
   the tibia comes down to the ground well outside the body and the tarsus lies on the ground, front legs forward, hind back. */
const FA_VO_BEETLE_SHELL = [faVoShade(0x5d5140, -0.22), faVoShade(0x4e5a34, -0.22), 0x4b4034];
ANIMAL({
  key: 'giant-beetle', name: 'Giant beetle', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['voth'], diet: 'herbivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'marsh', 'pen'], locomotion: ['walks', 'burrows'] },
  size: { length: 3.6, height: 1.35 },
  source: [{ build: 'settlements/voth', file: 'src/65k-granary-mills-ranch.js', lines: '435-476, 556-561', note: 'domestic livestock: a scatter of static beetles in beetleRanch()\'s fenced corral with a byre and feed troughs (defined; not yet placed in the city)' },
    { build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '225-251, 525-530', note: 'captive: an arena pit beast ("one blade against a shell", ARENA_STR beetle 1.45), drawn at 1.15, tinted 0x4b4034' },
    { build: 'settlements/voth', file: 'src/78i-life-trade.js', lines: '195-206, 372', note: 'draught: a merchant caravan\'s beetle (a data field on one generic quadruped)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 150, note: 'pale, sweet; boiled in the shell' }, eggs: { amount: 40, note: 'laid in the byre\'s litter; eaten pickled' },
    hide: { amount: 1, hideM2: 5, note: 'the shell: chitin plates for armour, bowls and roofing' } },
  life: { maturity: 1.5, lifespan: 12, litter: 40, gestation: 18, note: 'eggs, then a grub a season in the byre\'s dung; gestation: incubation' },
  variants: 3, variantNames: ['ranch: bark-brown', 'ranch: moss-green', 'arena: umber'],
  breeds: { ranch: { scale: 1, mass: 900, role: 'livestock and draught' }, pit: { scale: 1.15, mass: 1370, role: 'arena pit beetle' } },
  w: 3.4, d: 3.8, h: 1.45,
  data: { mass: 900, legs: 6, speed: { walk: 0.8, run: 2.5 }, gait: { type: 'hexapod', freq: 1.2, stride: 0.45 }, grazePitch: 0.3,
    herd: 'a ranch herd of six to twelve in a corral; caravans keep one to a cart', fleeDistance: 1, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = FA_VO_U * A.S, P = p => [p[0] * K, p[1] * K, p[2] * K];
    const shell = FA_VO_BEETLE_SHELL[A.variant] || FA_VO_BEETLE_SHELL[0], leg = faVoShade(shell, -0.24), under = faVoShade(shell, -0.4);
    const LH = 0.95, bodyLen = 4.6;   /* the shell's rim: the source's 1.425 held the body high on stilts */
    const sheen = (hex, u, v, k) => { const c = new THREE.Color(hex), n = 1 + 0.18 * (faNoise(u * 6, v * 30, k) - 0.5) + 0.12 * Math.pow(Math.max(0, 1 - u * 1.6), 3); return [c.r * n, c.g * n, c.b * n]; };
    /* the abdomen, thorax and head domes on the leg-top plane; each has an underside */
    const abd = [0, LH, -bodyLen * 0.30], thx = [0, LH, bodyLen * 0.06], hd = [0, LH + 0.15, bodyLen * 0.40];
    faVoDome(A, 'chitin', P(abd), P([1.5, 1.32, 1.5]), null, 10, 24, { colf: (u, v) => Math.abs(Math.cos(v * TAU)) < 0.025 && Math.sin(v * TAU) < 0.3 ? under : sheen(shell, u, v, 1) });
    A.ellip('chitin', abd[0] * K, LH * K, abd[2] * K, 1.42 * K, 0.34 * K, 1.42 * K, under, { seg: 16 });
    const thc = faVoShade(shell, 0.05);
    faVoDome(A, 'chitin', P(thx), P([1.0, 0.94, 1.0]), null, 8, 20, { colf: (u, v) => sheen(thc, u, v, 2) });
    A.ellip('chitin', thx[0] * K, LH * K, thx[2] * K, 0.94 * K, 0.3 * K, 0.94 * K, under, { seg: 14 });
    /* the head, with its antennae: it turns about the thorax's front */
    A.part('head', P([0, LH + 0.1, bodyLen * 0.30]), () => {
      const hc = faVoShade(shell, -0.05);
      faVoDome(A, 'chitin', P(hd), P([0.55, 0.473, 0.55]), null, 6, 16, { colf: (u, v) => sheen(hc, u, v, 3) });
      A.ellip('chitin', hd[0] * K, hd[1] * K, hd[2] * K, 0.5 * K, 0.2 * K, 0.5 * K, under, { seg: 10 });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.4 * K, (hd[1] + 0.18) * K, (hd[2] + 0.22) * K, 0.12 * K, 0.1 * K, 0.12 * K, 0x0e0c0a, { seg: 8 });
        /* the antenna: from the head's front, forward, out and up (the source's 1.1-unit bar at 0.4 rad out) */
        A.tube('chitin', faVoSpline([P([s * 0.2, hd[1] + 0.3, hd[2] + 0.42]), P([s * 0.42, hd[1] + 0.62, hd[2] + 0.9]), P([s * 0.62, hd[1] + 0.72, hd[2] + 1.38])]),
          () => [0.05 * K, 0.05 * K], 6, 5, leg, { caps: true });
        A.cone('chitin', P([s * 0.12, hd[1] - 0.1, hd[2] + 0.5]), P([s * 0.05, hd[1] - 0.22, hd[2] + 0.75]), 0.08 * K, 0.01, under, 5);   /* the mandibles */
      }
    });
    /* six legs, as a beetle's: the coxa under the shell's edge, the femur rising up and out past the rim to a high knee, the
       tibia (spurred) down to the ground well outside the body, the tarsus (three beads and a pair of claws) on the ground;
       the front pair reach forward, the middle out, the hind back. [coxa, knee, tibia's end, tarsus tip] in source units */
    const LEGS = [[[0.7, LH - 0.32, 0.6], [1.45, LH + 0.3, 1.05], [1.9, 0.1, 1.5], [2.05, 0.03, 2.05]],
      [[0.85, LH - 0.32, -0.3], [1.95, LH + 0.4, -0.22], [2.3, 0.1, -0.1], [2.62, 0.03, 0.08]],
      [[0.9, LH - 0.35, -0.8], [1.9, LH + 0.25, -1.35], [2.2, 0.1, -2.0], [2.32, 0.03, -2.55]]];
    const L3 = (a, b) => t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, X = v => P([s * v[0], v[1], v[2]]), [cx, kn, tb, ts] = LEGS[i >> 1].map(X);
      A.part('leg' + i, cx, () => {
        A.ellip('chitin', cx[0], cx[1], cx[2], 0.22 * K, 0.17 * K, 0.2 * K, under, { seg: 8 });   /* the coxa */
        A.tube('chitin', L3(cx, kn), t => [(0.15 - 0.03 * t) * K, (0.2 - 0.04 * t) * K], 4, 8, null, { colf: (t, a) => Math.cos(a) < -0.3 ? under : leg });   /* the femur */
        A.ellip('chitin', kn[0], kn[1], kn[2], 0.14 * K, 0.14 * K, 0.14 * K, leg, { seg: 8 });
        A.tube('chitin', L3(kn, tb), t => { const r = (0.115 - 0.04 * t) * K; return [r, r]; }, 4, 8, leg);   /* the tibia */
        for (const f of [0.35, 0.6, 0.85]) { const p = L3(kn, tb)(f); A.cone('chitin', p, [p[0], p[1] - 0.05 * K, p[2] - 0.15 * K], 0.03 * K, 0.004, under, 4); }
        /* the tarsus: three beads along the ground and the claws */
        const tr = L3(tb, ts);
        for (const [f, r] of [[0.12, 0.085], [0.42, 0.075], [0.72, 0.065]]) { const p = tr(f); A.ellip('chitin', p[0], Math.max(p[1], r * K * 0.75), p[2], r * K, r * K * 0.75, r * K * 1.6, leg, { seg: 6, ry: Math.atan2(ts[0] - tb[0], ts[2] - tb[2]) }); }
        const tip = tr(0.92), dx = ts[0] - tb[0], dz = ts[2] - tb[2], dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl;
        for (const k of [-1, 1]) A.cone('chitin', tip, [ts[0] + (ux * 0.12 - uz * k * 0.08) * K, 0.0, ts[2] + (uz * 0.12 + ux * k * 0.08) * K], 0.03 * K, 0.004, under, 4);
      });
    }
    A.anchor('pack', P([0, LH + 1.32, abd[2]])); A.anchor('yoke', P([0, LH + 0.6, thx[2]])); A.anchor('lead', P([0, LH, hd[2] + 0.5]));
  }
});

/* ---- the packed detail maps (tex/) ---- */
const FA_TEX = {"chitin": {"lib": "organic.chitin", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.35}, "coat": {"lib": "fur.bat", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.22}, "hair": {"lib": "hair.crest", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.25}, "horn": {"lib": "bone.horn", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.12}, "membrane": {"lib": "membrane.bat", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.5}, "scale": {"lib": "organic.scale", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.12}, "shag": {"lib": "fur.sloth", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.35}, "skin": {"lib": "hide.leather033c", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.6}, "sleek": {"lib": "hide.strider", "map": "data:image/webp;base64,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", "mean": 0.6, "scale": 0.3}};
/* ---- kits/fauna/krator-fauna-runtime.js ---- */
/* ======================================================================
   Krator Fauna: the runtime (kits/fauna/krator-fauna-runtime.js), the only thing the bundle exposes:

     KratorFauna.list()                      every entry: { key, name, group, variants, variantNames, w, d, h, breeds }
     KratorFauna.entry(key)                  the entry (data: tags, traits, yields, life, data)
     KratorFauna.build(key, { variant, breed, pose, seed })   -> a THREE.Group: one child group per PART turned about its
                                             pivot (userData.parts: { body, head, tail, jaw, earL, earR, legs:[4] }),
                                             userData { key, name, variant, breed, tags, traits, yields, life, data,
                                             anchors, tris, w, d, h }. Origin under the body on the ground, +z the snout.
     KratorFauna.animate(group, t, mode, o)  mode 'idle' | 'graze' | 'walk' | 'rest'; t seconds; o.phase offsets the herd.
                                             It only turns the part groups (and bobs the body): the geometry never changes.
     KratorFauna.profile(key, breed, pose)   the body profile a host fits tack to (the salamander's: at(t) -> {z,y,hw,hh})
     KratorFauna.lifeOf(key)                 the life layer's record: faction-free data a world gives a faction and a job
     KratorFauna.setTextures(on), textures() the library detail maps (FA_TEX, packed by fauna_bundle.py): { pending, families }
     KratorFauna.warm()                      start every detail map decoding now
   Materials are shared per family across every animal on a page (one program each). A family with a packed map gets
   it as a triplanar DETAIL map in the part's own frame (the pattern rides on a moving leg); the vertex colour keeps
   the animal's colour and the set's mean brightness is divided back out. Colours are linear (the renderer's sRGB
   output converts them).
   ====================================================================== */
const KratorFaunaAPI = (function () {
  'use strict';
  /* per family: [roughness, metalness, detail strength (0 the vertex colour alone, 1 the full map)] */
  const LOOK = { coat: [0.95, 0, 0.6], hair: [0.9, 0, 0.8], skin: [0.45, 0, 0.75], horn: [0.5, 0, 0.8], hoof: [0.6, 0, 1], eye: [0.12, 0, 1], mouth: [0.6, 0, 1], plain: [0.8, 0, 1],
    chitin: [0.35, 0.05, 0.8], membrane: [0.88, 0, 0.7], glow: [1, 0, 0], scale: [0.55, 0, 0.85], sleek: [0.7, 0, 0.55], feather: [0.85, 0, 0.7], shag: [0.95, 0, 0.75] };
  const MATS = {}, TEXST = { on: typeof FA_TEX !== 'undefined' && !!FA_TEX, pending: 0, families: [] }, TEXC = {};
  function detail(fam) {
    if (!TEXST.on || typeof FA_TEX === 'undefined' || !FA_TEX || !FA_TEX[fam]) return null;
    if (TEXC[fam]) return TEXC[fam];
    const L = FA_TEX[fam], t = new THREE.Texture(), img = new Image();
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    TEXST.pending++; img.onload = function () { t.image = img; t.needsUpdate = true; TEXST.pending--; }; img.onerror = function () { TEXST.pending--; };
    img.src = L.map; TEXST.families.push(fam);
    return (TEXC[fam] = { map: t, tile: 1 / (L.scale || 0.3), gain: 1 / Math.max(0.05, Math.pow(L.mean == null ? 0.5 : L.mean, 2.2)) });
  }
  function material(fam) {
    if (MATS[fam]) return MATS[fam];
    const lk = LOOK[fam] || LOOK.plain;
    /* glow: unlit, its vertex colour is its light (a glint's abdomen); membrane and hair: seen from both sides (wings, locks) */
    if (fam === 'glow') return (MATS[fam] = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: lk[0], metalness: lk[1], side: fam === 'hair' || fam === 'membrane' || fam === 'feather' ? THREE.DoubleSide : THREE.FrontSide });
    if (fam === 'eye') m.emissive = new THREE.Color(0x050403);
    const D = detail(fam);
    if (D) {
      m.map = D.map;
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uDetTile = { value: D.tile }; sh.uniforms.uDetGain = { value: D.gain }; sh.uniforms.uDetMix = { value: lk[2] == null ? 1 : lk[2] };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFaP;varying vec3 vFaN;')
          .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFaP=position;vFaN=normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vFaP;varying vec3 vFaN;uniform float uDetTile;uniform float uDetGain;uniform float uDetMix;')
          .replace('#include <map_fragment>', ['#ifdef USE_MAP', 'vec3 fW=pow(abs(normalize(vFaN))+1e-4,vec3(4.0));fW/=(fW.x+fW.y+fW.z);vec3 fP=vFaP*uDetTile;',
            'vec4 texelColor=texture2D(map,fP.zy)*fW.x+texture2D(map,fP.xz)*fW.y+texture2D(map,fP.xy)*fW.z;texelColor=mapTexelToLinear(texelColor);',
            'diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*uDetGain,uDetMix);', '#endif'].join('\n'));
      };
      m.customProgramCacheKey = function () { return 'fauna-det-' + fam; };
    }
    return (MATS[fam] = m);
  }
  function mesh(b, fam) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    g.setIndex(b.pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.idx, 1) : new THREE.Uint16BufferAttribute(b.idx, 1));
    g.computeVertexNormals(); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, material(fam)); m.castShadow = fam !== 'eye'; m.receiveShadow = true; m.userData.family = fam;
    return m;
  }
  function build(key, opt) {
    const E = ANIMAL_BY_KEY[key]; if (!E) throw new Error('KratorFauna.build: no animal ' + key);
    opt = opt || {};
    const A = faunaFrame(E, opt);
    E.build(A);
    const root = new THREE.Group(); root.name = 'fauna:' + key;
    const P = { legs: [] }; let tris = 0;
    const order = Object.keys(A.parts).sort((a, b) => (a === 'body' ? -1 : b === 'body' ? 1 : 0));
    for (const name of order) {
      const part = A.parts[name], grp = new THREE.Group();
      grp.name = name; grp.position.set(part.pivot[0], part.pivot[1], part.pivot[2]); grp.userData.rest = { x: part.pivot[0], y: part.pivot[1], z: part.pivot[2] };
      for (const fam in part.buckets) { const b = part.buckets[fam]; if (!b.idx.length) continue; grp.add(mesh(b, fam)); tris += b.idx.length / 3; }
      root.add(grp);
      const m = /^leg(\d+)$/.exec(name), sg = /^seg(\d+)$/.exec(name);
      if (m) P.legs[+m[1]] = grp; else if (sg) (P.segs || (P.segs = []))[+sg[1]] = grp; else P[name] = grp;
    }
    /* parts that hang off the head (ears, the jaw) turn with it: reparent them into the head, keeping their place */
    for (const n of ['earL', 'earR', 'jaw', 'beard', 'crest']) if (P[n] && P.head) { const g = P[n]; g.position.sub(P.head.position); P.head.add(g); }
    const vd = (E.variantDims && E.variantDims[A.variant]) || { w: E.w, d: E.d, h: E.h };
    root.userData = { key: key, name: E.name, variant: A.variant, variantName: E.variantNames[A.variant] || '', breed: A.breed, S: A.S,
      tags: E.tags, traits: E.traits, yields: E.yields, life: E.life, data: E.data, size: E.size, source: E.source, anchors: A.anchors, parts: P, tris: Math.round(tris),
      w: vd.w * A.S, d: vd.d * A.S, h: vd.h * A.S, fauna: true };
    animate(root, 0, 'idle');   /* a bare build stands in its rest pose (a flyer's wings folded) */
    return root;
  }
  /* ---- animation: turns only, by the animal's gait (data.gait.type):
       quadruped  diagonal pairs swing about x (front left with hind right)      biped   two legs alternate, the head bobs
       sprawl     legs swing about y, body and tail weave (salamanders, lizards)  hexapod tripods alternate (0,3,4 / 1,2,5)
       octopod    alternating fours swing about y (spiders)                       multipede  a wave runs down the legs and segments
       flyer      wings flap about z (mode 'fly'; folded at 'idle'/'rest'), legs tucked in flight (flap.tuck); a flyer with legs
                  walks as a biped (2 legs), a quadruped (4) or a hexapod (6), and so does an insect
       insect     wings beat fast (any mode but 'rest')                            swimmer  tail and segments sweep side to side
       climber    hangs from a bough (a 'grip' anchor); walks hand over hand along it (limbs swing about z)
       none       nothing moves
     modes: idle, graze, walk, rest, fly, swim. The geometry never changes; only the part groups turn (and the body bobs).
     Opt-in data, read only when an animal sets it:
       flap.sweep  perched, the wings also turn back about y by this much (left +, right -): a fold along the flanks
       flap.foldScale  perched, the wing is shortened along its span to this fraction (a folded wing is about half its spread)
       flap.roll   perched, the wing turns about its own span first (radians; ~1.3 hangs it down the flank, not across the back)
       flap.tuck   in flight the legs swing back about x by this much
       flap.sync   the second wing pair beats with the first (a moth), not against it (a dragonfly)
       swim.axis   'x': the tail beats up and down (flukes), not side to side
       chain       { amp, wave } metres: the head, segments, legs and tail ride one travelling side-to-side wave (a body
                   that snakes) in 'walk' and 'swim', not each segment yawing in place
       idle        { headYaw, headPitch, tailYaw } radians: how far the head looks about and the tail sways at idle */
  function animate(g, t, mode, o) {
    o = o || {}; const u = g.userData, P = u.parts, D = u.data || {}, gait = D.gait || { type: 'quadruped', freq: 1.5, stride: 0.4 };
    const ph = (o.phase || 0), f = gait.freq || 1.5, w = TAU * f * t + ph, type = gait.type || 'quadruped';
    const set = (p, x, y, z) => { if (p) p.rotation.set(x || 0, y || 0, z || 0); };
    const legs = P.legs.filter(Boolean), body = P.body, segs = P.segs || [];
    if (body) body.position.y = body.userData.rest ? body.userData.rest.y : 0;
    legs.forEach(L => set(L)); segs.forEach(S => set(S)); set(body); set(P.head); set(P.tail); set(P.jaw);   /* every frame starts from rest (a mode leaves nothing behind) */
    const CH = D.chain, chained = CH ? [P.head, P.tail, P.jaw && P.jaw.parent === g ? P.jaw : null].concat(segs, legs).filter(Boolean) : null;
    if (chained) chained.forEach(q => { if (q.userData.rest) q.position.x = q.userData.rest.x; });
    const snake = (ph2, amp) => { const k = TAU / (CH.wave || 3);
      for (const q of chained) { const z0 = q.userData.rest ? q.userData.rest.z : 0, a = ph2 + k * z0;
        q.position.x = (q.userData.rest ? q.userData.rest.x : 0) + amp * Math.sin(a);
        if (legs.indexOf(q) < 0) q.rotation.y = Math.atan(amp * k * Math.cos(a)); } };
    /* wings: a flyer flaps in 'fly' (with glides), holds them folded otherwise; an insect beats them unless resting */
    const fl = D.flap || { freq: 2, amp: 0.7, glide: 0 }, wf = TAU * (fl.freq || 2) * t + ph;
    const flying = (type === 'flyer' && mode === 'fly') || (type === 'insect' && mode !== 'rest');
    const glide = fl.glide ? (Math.sin(TAU * 0.07 * t + ph) > 1 - 2 * fl.glide ? 0.15 : 1) : 1;
    const flapA = flying ? (fl.amp || 0.7) * glide * Math.sin(wf) : (type === 'flyer' ? -(fl.fold || 0) : 0);
    const sweep = flying || type !== 'flyer' ? 0 : (fl.sweep || 0), fsc = flying || type !== 'flyer' ? 1 : (fl.foldScale || 1);
    for (const n of ['wingL', 'wingR', 'wing2L', 'wing2R']) if (P[n]) P[n].scale.x = fsc;
    /* roll (perched): the wing turns about its own span first (rotation order YZX), so a folded wing hangs down the flank */
    const roll = flying || type !== 'flyer' ? 0 : (fl.roll || 0);
    for (const [n, s] of [['wingL', 1], ['wingR', -1], ['wing2L', 1], ['wing2R', -1]]) if (P[n]) {
      if (fl.roll && P[n].rotation.order !== 'YZX') P[n].rotation.order = 'YZX';
      set(P[n], -roll, s * sweep, s * (n.indexOf('2') > 0 && !fl.sync ? -flapA : flapA)); }
    if (flying && type === 'flyer' && fl.tuck) legs.forEach(L => set(L, fl.tuck, 0, 0));
    if (type === 'flyer' && mode === 'fly' && body) body.position.y = 0.04 * (u.S || 1) * Math.sin(wf + 1);
    const wt = (type === 'flyer' || type === 'insect') ? (legs.length === 2 ? 'biped' : legs.length === 4 ? 'quadruped' : legs.length === 6 ? 'hexapod' : type) : type;
    if (mode === 'walk' && !(flying && type === 'flyer')) {
      if (wt === 'sprawl') {
        const a = 0.45;
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, 0, s * a * Math.sin(w), (i % 2 ? -1 : 1) * 0.18 * Math.max(0, s * Math.cos(w))); });
        set(body, 0, 0.06 * Math.sin(w), 0); set(P.tail, 0, -0.32 * Math.sin(w - 0.8), 0); set(P.head, 0, -0.12 * Math.sin(w + 0.4), 0);
      } else if (wt === 'biped') {
        legs.forEach((L, i) => set(L, (i % 2 ? -1 : 1) * 0.5 * Math.sin(w), 0, 0));
        set(P.head, 0.08 * Math.sin(2 * w), 0, 0); set(P.tail, 0.1 * Math.sin(2 * w), 0, 0);
        if (body) body.position.y = 0.015 * Math.abs(Math.sin(w)) * (u.S || 1);
      } else if (wt === 'hexapod' || wt === 'octopod') {
        const group = i => wt === 'hexapod' ? ([0, 3, 4].indexOf(i) >= 0 ? 1 : -1) : ((Math.floor(i / 2) + i) % 2 ? -1 : 1);
        legs.forEach((L, i) => { const s = group(i); set(L, 0, s * 0.35 * Math.sin(w), (i % 2 ? -1 : 1) * 0.15 * Math.max(0, s * Math.cos(w))); });
      } else if (type === 'multipede') {
        legs.forEach((L, i) => { const k = Math.floor(i / 2); set(L, 0.45 * Math.sin(w - k * 0.6 + (i % 2) * Math.PI), 0, 0); });
        if (chained) snake(w * 0.5, CH.amp || 0.15); else segs.forEach((S, i) => set(S, 0, 0.08 * Math.sin(w * 0.5 - i * 0.5), 0));
      } else if (wt === 'climber') {   /* hanging hand over hand along a bough (along x): diagonal pairs swing about z */
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, 0, 0, s * 0.35 * Math.sin(w)); });
        set(P.head, 0, 0.1 * Math.sin(w), 0);
      } else if (wt === 'quadruped') {
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, s * 0.42 * Math.sin(w), 0, 0); });
        if (body) body.position.y = 0.012 * Math.abs(Math.sin(w)) * (u.S || 1);
        set(P.head, 0.06 * Math.sin(2 * w), 0, 0); set(P.tail, 0.15 * Math.sin(2 * w), 0, 0);
      }
    } else if (mode === 'swim' || type === 'swimmer') {
      const sw = D.swim || { freq: 0.6, amp: 0.25 }, s = TAU * (sw.freq || 0.6) * t + ph;
      if (sw.axis === 'x') { set(P.tail, (sw.amp || 0.25) * Math.sin(s), 0, 0); if (body) body.rotation.x = -0.03 * Math.sin(s - 1); set(P.head, 0.04 * Math.sin(s + 0.6), 0, 0); }
      else if (chained) snake(s, CH.amp || 0.15);
      else { set(P.tail, 0, (sw.amp || 0.25) * Math.sin(s), 0); segs.forEach((S, i) => set(S, 0, (sw.amp || 0.25) * 0.4 * Math.sin(s - i * 0.7), 0)); set(P.head, 0, -0.05 * Math.sin(s), 0); }
    } else if (mode === 'graze') {
      const nod = 0.06 * Math.sin(TAU * 0.7 * t + ph);
      set(P.head, (D.grazePitch == null ? 0.95 : D.grazePitch) + nod, 0.15 * Math.sin(TAU * 0.11 * t + ph), 0);
      set(P.tail, 0.25 * Math.max(0, Math.sin(TAU * 0.6 * t + ph * 2)), 0, 0);
      if (P.jaw) set(P.jaw, 0.12 * Math.max(0, Math.sin(TAU * 1.6 * t + ph)), 0, 0);
    } else if (mode !== 'fly') {   /* idle and rest: breathing, a slow look about, the tail */
      const k = mode === 'rest' ? 0.4 : 1, I = D.idle || {};
      if (type === 'sprawl' || type === 'octopod' || type === 'multipede') { set(P.tail, 0, (I.tailYaw == null ? 0.16 : I.tailYaw) * k * Math.sin(TAU * 0.11 * t + ph), 0); set(P.head, (I.headPitch == null ? 0.03 : I.headPitch) * Math.sin(TAU * 0.09 * t + ph), (I.headYaw == null ? 0.12 : I.headYaw) * k * Math.sin(TAU * 0.05 * t + ph * 1.7), 0); }
      else if (type !== 'none') { set(P.tail, 0.2 * k * Math.max(0, Math.sin(TAU * 0.5 * t + ph)), (I.tailYaw == null ? 0.1 : I.tailYaw) * Math.sin(TAU * 0.3 * t), 0); set(P.head, -0.05 + (I.headPitch == null ? 0.05 : I.headPitch) * Math.sin(TAU * 0.07 * t + ph), (I.headYaw == null ? 0.35 : I.headYaw) * k * Math.sin(TAU * 0.04 * t + ph * 1.3), 0); }
    }
    for (const n of ['earL', 'earR']) if (P[n]) set(P[n], 0, 0, (n === 'earL' ? 1 : -1) * 0.18 * Math.max(0, Math.sin(TAU * 0.23 * t + ph * 3)) ** 8);
  }
  function profile(key, breed, pose) {
    const E = ANIMAL_BY_KEY[key]; if (!E) return null;
    const A = faunaFrame(E, { breed: breed, pose: pose }); E.build(A);
    return A.profileFn ? { at: A.profileFn, S: A.S, anchors: A.anchors } : null;
  }
  function lifeOf(key) {
    const E = ANIMAL_BY_KEY[key]; if (!E) return null;
    return { kind: key, name: E.name, habitat: E.tags.habitat, locomotion: E.tags.locomotion, diet: E.tags.diet, feeding: E.tags.feeding, activity: E.tags.activity, temperament: E.tags.temperament,
      fleeDistance: E.data.fleeDistance || 0, aggression: E.data.aggression || 0, herd: E.data.herd || null,
      speed: E.data.speed || null, schedule: (E.data.schedule || new Array(24).fill(E.tags.activity === 'nocturnal' ? 'REST' : 'GRAZE')).slice(),
      traits: Object.assign({}, E.traits), yields: Object.assign({}, E.yields), life: Object.assign({}, E.life) };
  }
  return {
    version: 1, FAMILIES: FAUNA_FAMILIES, VOCAB: FAUNA_VOCAB, YIELDS: FAUNA_YIELDS,
    list: function () { return ANIMALS.map(e => ({ key: e.key, name: e.name, group: e.group, variants: e.variants, variantNames: e.variantNames.slice(),
      w: e.w, d: e.d, h: e.h, breeds: e.breeds ? Object.keys(e.breeds) : null, variantDims: e.variantDims || null, poses: e.poses || null })); },
    entry: function (key) { return ANIMAL_BY_KEY[key] || null; },
    has: function (key) { return !!ANIMAL_BY_KEY[key]; },
    build: build, animate: animate, profile: profile, lifeOf: lifeOf,
    setTextures: function (on) { TEXST.on = !!on && typeof FA_TEX !== 'undefined' && !!FA_TEX; },
    textures: function () { return { pending: TEXST.pending, families: TEXST.families.slice(), on: TEXST.on }; },
    /* start every packed detail map decoding now (a host that will build later, or builds only a few animals) */
    warm: function () { if (TEXST.on && typeof FA_TEX !== 'undefined' && FA_TEX) for (const f in FA_TEX) detail(f); }
  };
})();


return KratorFaunaAPI;
})();
