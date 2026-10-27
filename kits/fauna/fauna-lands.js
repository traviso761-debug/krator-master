/* ======================================================================
   Krator Fauna: fauna by land (kits/fauna/fauna-lands.js; H8, biomes/hyperjungle/PLAN-LANDS.md section 11) [G data]

   A biome kit places this kit's animals from their biome tags, with a size scale per land (the savage hyperjungle's
   beasts are 1.2 to 1.4 times their ridden size). Plain data and pure functions: no THREE, no DOM. It needs core/rand
   (KRAND) to place, and a core/tags registry to register; drawing is fauna-lands-host.js. It is NOT a krator-fauna-*.js
   file, so the bundle (fauna_bundle.py) and every page that takes it stay as they were: a build lists it by path.

     FAUNALANDS.LANDS                 { id: {biome, land, scale:[lo, hi], include:[keys], exclude:[keys], weight:{key: w},
                                        density:{role: groups a cell}, maxGroup} }
     FAUNALANDS.land(id, rec)         add or replace a land (rec as above; biome and land default from the id 'biome.land')
     FAUNALANDS.catalog(entries)      rows {key, name, biomes, habitat, locomotion, diet, feeding, domestic, herd, size:[w,d,h],
                                        sizeRange:[lo,hi], variants} from KratorFauna.entry(key) records (or that shape)
     FAUNALANDS.roleOf(row)           'water' | 'flyer' | 'predator' | 'grazer' | null
     FAUNALANDS.groupOf(row)          [min, max] in a group, read from data.herd ('alone', 'a pair', 'troops of twenty' ...)
     FAUNALANDS.pool(catalog, landId) {roles: {grazer: [{key, w}], ...}, missing: [keys]}: the wild animals tagged for the
                                        land's biome, plus its `include` (ridden or other biomes' animals wild here), less `exclude`
     FAUNALANDS.plan(o)               the placement as records (below)
     FAUNALANDS.register(T, plan, o)  every group a core/tags `life` record (kind 'herd', key the species), every animal its
                                        child (kind and key the species), before anything is drawn. Returns the plan with ids

   plan(o): o = { world (a seed), land (an id), catalog (rows), box [x0, z0, x1, z1], cell (metres, 400), density
   ({role: groups a cell}: the land's, then these), ground(x, z) -> y (0), where(role, x, z, key) -> bool (default: every
   role but water; a host that knows its water says where), height(role, x, z, key, y, u) -> y (a flyer's or swimmer's own
   height; default: a flyer 30 to 120 m over the ground, the rest on it), maxGroup (the land's, else 8) }
   -> { land, world, cell, groups: [{gid, key, role, at, r, n, scale, mode, animals: [index]}],
        animals: [{key, name, role, group, at, ry, scale, size, mode, phase, seed, variant}], missing: [keys] }

   Every number is KRAND.hash(world, cell x, cell z, index, salt): a cell's groups depend on nothing but the world, the cell
   and the land, so a streamed world and a single page agree, and a box only chooses which cells to read (a group belongs to
   the cell its centre falls in; one whose centre is outside the box is left out, never moved). An animal's scale is the
   land's range times its own data.sizeRange when it has one; its size is its box times that scale.
   ====================================================================== */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const ROLES = ['grazer', 'predator', 'flyer', 'water'];
  const SALT = { count: 0x4C41, group: 0x4C42, pick: 0x4C43, size: 0x4C44, member: 0x4C45, scale: 0x4C46, misc: 0x4C47 };
  const DENSITY = { grazer: 0.5, predator: 0.1, flyer: 0.2, water: 0.15 };
  const MODES = { grazer: ['graze', 'graze', 'idle', 'walk'], predator: ['idle', 'walk', 'rest'], flyer: ['fly'], water: ['swim'] };
  const LANDS = {};
  function KR() {
    if (typeof KRAND !== 'undefined') return KRAND;
    if (root.KRAND) return root.KRAND;
    throw new Error('fauna-lands needs core/rand (08-core-rand.js) loaded first');
  }
  const unit = (h) => (h >>> 0) / 4294967296;
  const num = (x, d) => (x == null ? d : x);
  const has = (a, v) => Array.isArray(a) && a.indexOf(v) >= 0;

  function land(id, rec) {
    rec = rec || {};
    const p = String(id).split('.');
    const L = { id: String(id), biome: num(rec.biome, p[0]), land: num(rec.land, p[1] || null), scale: (rec.scale || [1, 1]).slice(0, 2),
      include: (rec.include || []).slice(), exclude: (rec.exclude || []).slice(), weight: Object.assign({}, rec.weight),
      density: Object.assign({}, rec.density), maxGroup: rec.maxGroup, role: Object.assign({}, rec.role), note: rec.note || null };
    if (!(L.scale[0] > 0) || !(L.scale[1] >= L.scale[0])) throw new Error('fauna-lands: ' + id + ': scale must be [lo, hi], 0 < lo <= hi');
    LANDS[L.id] = L; return L;
  }

  /* the hyperjungle's three lands (PLAN-LANDS.md sections 1-3). The savage land's beasts are the Riders' (tagged domestic,
     ridden: included here as wild), at 1.2 to 1.4; longcrawler, wingclaw and nightwing are named by the plan and not drawn by
     the kit yet, so a plan lists them as missing. The kit's own striders, rays and sloths stay, rarer. */
  land('hyperjungle.pure', { scale: [1, 1] });
  land('hyperjungle.savage', { scale: [1.2, 1.4],
    include: ['threehorn', 'hardshell', 'jungle-mammoth', 'riding-raptor', 'staghorn-beetle', 'giant-spider', 'quetzalcoatlus',
      'giant-dragonfly', 'longcrawler', 'wingclaw', 'nightwing'],
    weight: { threehorn: 3, hardshell: 3, 'jungle-mammoth': 2, 'riding-raptor': 2, 'hyperjungle-strider': 0.4, 'sky-ray': 0.4, 'bough-sloth': 0.4 },
    density: { grazer: 0.7, predator: 0.15, flyer: 0.25 }, maxGroup: 10,
    note: 'the Riders\' beasts, wild, at savage size; the herds in the bais, mammoths on the trails, raptor packs' });
  land('hyperjungle.north', { scale: [1, 1], density: { grazer: 0.25, predator: 0.08, flyer: 0.05 },
    note: 'Screamer wood: hunted thin, few flyers; the vine boa and lattice mantis' });

  function catalog(entries) {
    return (entries || []).filter(Boolean).map(e => {
      const t = e.tags || {}, D = e.data || {};
      return { key: e.key, name: e.name || e.key, biomes: (t.biomes || []).slice(), habitat: (t.habitat || []).slice(),
        locomotion: (t.locomotion || []).slice(), diet: t.diet || null, feeding: t.feeding || null, domestic: !!t.domestic,
        herd: D.herd == null ? null : String(D.herd), size: [num(e.w, 1), num(e.d, 1), num(e.h, 1)],
        sizeRange: Array.isArray(D.sizeRange) ? D.sizeRange.slice(0, 2) : null, variants: Math.max(1, num(e.variants, 1) | 0) };
    });
  }

  function roleOf(c) {
    if (!c) return null;
    const H = c.habitat, M = c.locomotion;
    if (has(H, 'deep water') || (has(H, 'water') && !has(H, 'ground') && !has(M, 'flies'))) return 'water';
    if (has(M, 'flies') || (has(M, 'glides') && has(H, 'sky'))) return 'flyer';
    if (c.feeding === 'predator' || c.feeding === 'scavenger' || c.diet === 'carnivore') return 'predator';
    if (c.diet === 'herbivore' || c.diet === 'omnivore') return 'grazer';
    return null;
  }

  const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
    fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100, thousand: 1000, thousands: 1000, hundreds: 100, dozen: 12 };
  function groupOf(c) {
    const s = c && c.herd ? c.herd.toLowerCase() : '';
    if (!s) return [1, 2];
    let n = null;
    const d = /(\d+)/.exec(s); if (d) n = +d[1];
    if (n == null) for (const w of s.split(/[^a-z]+/)) if (WORDS[w] != null) { n = WORDS[w]; break; }
    if (n == null) return /\balone\b|solitary/.test(s) ? (/pair/.test(s) ? [1, 2] : [1, 1]) : /pair/.test(s) ? [2, 2] : [1, 3];
    if (/^\s*(alone|solitary)/.test(s)) return [1, Math.max(1, Math.min(2, n))];
    return [Math.max(1, Math.round(n / 2)), n];
  }

  function landOf(id) { const L = LANDS[id]; if (!L) throw new Error('fauna-lands: no land ' + id); return L; }
  function pool(cat, landId) {
    const L = landOf(landId), byKey = {}, roles = {}, missing = [];
    for (const c of cat) byKey[c.key] = c;
    ROLES.forEach(r => { roles[r] = []; });
    const add = (c) => { if (has(L.exclude, c.key)) return; const r = L.role[c.key] || roleOf(c); if (!r || !roles[r]) return;
      if (roles[r].some(p => p.key === c.key)) return; roles[r].push({ key: c.key, w: num(L.weight[c.key], 1) }); };
    for (const c of cat) if (!c.domestic && has(c.biomes, L.biome)) add(c);
    for (const k of L.include) { if (byKey[k]) add(byKey[k]); else missing.push(k); }
    ROLES.forEach(r => { roles[r] = roles[r].filter(p => p.w > 0).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)); });
    return { roles, missing };
  }
  function pick(list, u) { let s = 0; for (const p of list) s += p.w; let x = u * s; for (const p of list) { x -= p.w; if (x < 0) return p; } return list[list.length - 1]; }

  function plan(o) {
    const K = KR(), L = landOf(o.land), cat = o.catalog || [], byKey = {}, world = num(o.world, 0) >>> 0;
    for (const c of cat) byKey[c.key] = c;
    const P = pool(cat, o.land), C = num(o.cell, 400), box = o.box || [0, 0, C, C], dens = Object.assign({}, DENSITY, L.density, o.density);
    const maxG = num(o.maxGroup, num(L.maxGroup, 8)), ground = o.ground || (() => 0);
    const where = o.where || ((role) => role !== 'water');
    const H = (ix, iz, i, salt, j) => K.hash(world, ix, iz, i, num(j, 0), salt);
    const out = { land: L.id, world, cell: C, groups: [], animals: [], missing: P.missing.slice() };
    const ix0 = Math.floor(box[0] / C), ix1 = Math.floor((box[2] - 1e-9) / C), iz0 = Math.floor(box[1] / C), iz1 = Math.floor((box[3] - 1e-9) / C);
    for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
      ROLES.forEach((role, ri) => {
        const list = P.roles[role], d = Math.max(0, num(dens[role], 0));
        if (!list.length || !(d > 0)) return;
        const n = Math.floor(d) + (unit(H(ix, iz, ri, SALT.count)) < d - Math.floor(d) ? 1 : 0);
        for (let g = 0; g < n; g++) {
          const gi = ri * 64 + g, x = (ix + unit(H(ix, iz, gi, SALT.group, 0))) * C, z = (iz + unit(H(ix, iz, gi, SALT.group, 1))) * C;
          if (x < box[0] || x >= box[2] || z < box[1] || z >= box[3]) continue;
          const sp = pick(list, unit(H(ix, iz, gi, SALT.pick))), c = byKey[sp.key];
          if (!where(role, x, z, c.key)) continue;
          const gr = groupOf(c), lo = Math.min(gr[0], maxG), hi = Math.max(lo, Math.min(gr[1], maxG));
          const cnt = lo + Math.floor(unit(H(ix, iz, gi, SALT.size)) * (hi - lo + 1));
          const ls = L.scale[0] + (L.scale[1] - L.scale[0]) * unit(H(ix, iz, gi, SALT.scale));
          const reach = Math.max(c.size[0], c.size[1]) * ls, spread = cnt > 1 ? Math.max(8, 1.6 * reach * Math.sqrt(cnt)) : 0;
          const head = TAU * unit(H(ix, iz, gi, SALT.misc, 0)), modes = MODES[role];
          const G = { gid: ix + ',' + iz + ',' + role + ',' + g, key: c.key, role, at: [x, ground(x, z), z], r: Math.max(spread, reach / 2), n: 0,
            scale: ls, mode: modes[0], animals: [] };
          for (let m = 0; m < cnt; m++) {
            /* a square round the centre, no trig: +, -, * and sqrt are the same bits in every engine (Godot's uid included) */
            const ax = m === 0 ? x : x + (2 * unit(H(ix, iz, gi, SALT.member, m * 4)) - 1) * spread,
              az = m === 0 ? z : z + (2 * unit(H(ix, iz, gi, SALT.member, m * 4 + 1)) - 1) * spread;
            if (m > 0 && !where(role, ax, az, c.key)) continue;
            const sr = c.sizeRange, own = sr ? sr[0] + (sr[1] - sr[0]) * unit(H(ix, iz, gi, SALT.scale, m + 1)) : 1, s = ls * own;
            const gy = ground(ax, az), u = unit(H(ix, iz, gi, SALT.misc, m * 4 + 2));
            const y = o.height ? o.height(role, ax, az, c.key, gy, u) : role === 'flyer' ? gy + 30 + 90 * u : gy;
            const mode = modes[Math.floor(unit(H(ix, iz, gi, SALT.misc, m * 4 + 3)) * modes.length) % modes.length];
            const seed = H(ix, iz, gi, SALT.member, m * 4 + 2);
            out.animals.push({ key: c.key, name: c.name, role, group: out.groups.length, at: [ax, y, az],
              ry: head + (unit(H(ix, iz, gi, SALT.member, m * 4 + 3)) - 0.5) * 1.6, scale: s,
              size: [c.size[0] * s, c.size[1] * s, c.size[2] * s], mode, phase: 10 * unit(seed), seed: seed % 99999 + 1, variant: seed % c.variants });
            G.animals.push(out.animals.length - 1);
          }
          if (!G.animals.length) continue;
          G.n = G.animals.length; G.mode = out.animals[G.animals[0]].mode; out.groups.push(G);
        }
      });
    }
    return out;
  }

  function register(T, p, o) {
    o = o || {};
    if (!T || typeof T.add !== 'function') throw new Error('fauna-lands: register needs a core/tags registry (KTAGS.create)');
    const L = landOf(p.land), tags = { biome: L.biome }, frag = o.frag || 'kits/fauna/fauna-lands.js';
    for (const G of p.groups) {
      const A0 = p.animals[G.animals[0]];
      const rec = T.add({ 'class': 'life', kind: 'herd', key: G.key, name: A0.name + (G.n > 1 ? ' (' + G.n + ')' : ''), at: G.at, r: G.r,
        tags, note: 'land ' + L.id + ', ' + G.role + ', scale ' + G.scale.toFixed(3), frag });
      G.id = rec.id;
      for (const i of G.animals) {
        const A = p.animals[i];
        A.id = T.child(rec.id, { 'class': 'life', kind: A.key, key: A.key, name: A.name, at: A.at, ry: A.ry, size: A.size, tags, frag }).id;
      }
    }
    return p;
  }

  const API = { version: 1, ROLES, DENSITY, LANDS, land, catalog, roleOf, groupOf, pool, plan, register };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.FAUNALANDS = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
