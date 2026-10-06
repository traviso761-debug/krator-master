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
