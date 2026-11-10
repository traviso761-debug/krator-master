/* ======================================================================
   Krator Extraplanar: the records (kits/extraplanar/xp-records.js)   [G data]

   The phenomena, the portals, the registry and the shared silhouettes as PLAIN DATA and pure functions on
   core/rand (KRAND) and core/space (KSPACE): no THREE, no DOM. tests/test-extraplanar.js runs this file in node;
   extraplanar_bundle.py wraps it in the kit's closure, where xp-draw.js draws what it describes and xp-runtime.js
   exposes it on KratorExtraplanar. PLAN.md section 4 is the design.

   A PHENOMENON  XP.phenomenon(key, o)  key 'void' | 'solid' | 'presence'; o {at, seed, r, drift, state, taint, ...}
     { id, class: 'feature', kind: 'phenomenon', key, at: [x, y, z], r, h, ry, seed, state: 'latent' | 'awake',
       drift: { mode: 'wander' | 'orbit' | 'still', r, speed, y: [lo, hi] },  the path XP.pose walks (KRAND.vnoise on the clock)
       weather: { fog, plume, tint: [r, g, b], tintR },                      what it lends the air round it
       hum: { hz, loud, reach },                                             the shared tell XP.humAt sums
       look: { eyes | facets | stars, halo, ... },                           what the seed drew
       taint: dose, tags: { origin: 'extraplanar', role: key, variant } }
   A PORTAL  XP.portal(key, o)  key 'door' | 'tear' | 'drowned'; o {at, ry, seed, size, state, leads, flicker, taint}
     { id, class: 'feature', kind: 'portal', key, at, ry, size: [w, h], seed, state: 'shut' | 'open' | 'flicker' | 'dead',
       leads: { station, at: [x, y, z] } | null, flicker: { period, duty }, taint, tags }
   XP.pose(rec, t, eye)      -> { at, ry, open, spin, pulse }  where a phenomenon is at module time t (seconds), its yaw
                                (a presence faces `eye` [x, z] when given), its eyes' openness 0..1, the solid's turn
   XP.openness(rec, t)       -> 0..1  a portal's openness now (shut 0, open 1, flicker a hashed square wave, dead .04)
   XP.through(rec)           -> rec.leads or null
   XP.humAt(x, z, t, R)      -> 0..1  the hums of the registry's phenomena in reach, summed and clamped
   XP.tintAt(x, z, R)        -> [r, g, b] | null  the cloud-mood tint of the nearest solid whose tintR holds (x, z)
   XP.registry.create({ tags, space, cell, build }) -> R
     R.add(rec)              files it in core/tags (tags.add: the record gets its id and uid) and core/space, stamps rec.seq
     R.near(x, z, pad)       the records whose square holds the point (KSPACE.query: exact, insertion order)
     R.all(), R.get(id), R.phenomena(), R.portals()
     R.markDrawn(rec)        the draw side calls it: a record with no seq (never registered) THROWS; else rec.drawnSeq
     R.check()               -> { ok, fails }: every drawn record was registered first (drawnSeq > seq)
   XP.SILHOUETTES            the four shared far-tier outlines (PLAN.md section 5); XP.silhouette(hunterKey) -> the set's name
   XP.u(seed, a, b, ...)     [0, 1) from KRAND.hash: every seeded choice in this kit goes through it
   ====================================================================== */
const XP = (function () {
  'use strict';
  const X = { version: 1 };
  function KR() { if (typeof KRAND === 'undefined' || !KRAND) throw new Error('kits/extraplanar needs core/rand (KRAND) on the page'); return KRAND; }
  function KS() { if (typeof KSPACE === 'undefined' || !KSPACE) throw new Error('kits/extraplanar needs core/space (KSPACE) on the page'); return KSPACE; }
  const clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  const ss = function (a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  /* [0, 1) from a seed and any int32 arguments (floats are floored by KRAND.hash) */
  X.u = function (seed) { const K = KR(); return K.unit(K.hash.apply(null, arguments)); };
  /* smooth noise in [0, 1] along the clock: KRAND.vnoise on a lattice of `period` seconds, lane `lane` */
  X.n = function (t, period, seed, lane) { return KR().vnoise(t / period, lane * 7.31 + 0.5, 0.5, seed); };

  X.VOCAB = {
    phenomena: ['void', 'solid', 'presence'],
    portals: ['door', 'tear', 'drowned'],
    phenomenonStates: ['latent', 'awake'],
    portalStates: ['shut', 'open', 'flicker', 'dead'],
    drifts: ['wander', 'orbit', 'still'],
    solids: ['octahedron', 'icosahedron', 'stellated'],
    silhouettes: ['tripod', 'tallwalker', 'giant', 'crawler']
  };
  /* the cloud-mood tints a solid may lend the sky over it (sRGB 0..1; ATMOS.MOOD_PALETTE has the smog's own) */
  X.TINTS = { bruise: [0.42, 0.3, 0.5], verdigris: [0.3, 0.5, 0.42], ember: [0.55, 0.3, 0.22], bone: [0.6, 0.58, 0.5] };

  /* ---------------------------------------------------------------- the phenomena */
  const PH = {
    void: { r: [1.0, 3.0], h: [1, 4], eyes: [3, 9], drift: 'wander', driftR: [12, 40], speed: [0.8, 1.4], hum: { hz: [38, 55], loud: [0.5, 0.8], reach: 60 },
      weather: { fog: 1, plume: 0, tint: null }, taint: 0.6 },
    solid: { r: [2.0, 5.0], h: [6, 14], facets: [8, 20], drift: 'orbit', driftR: [0, 18], speed: [0.3, 0.9], hum: { hz: [90, 140], loud: [0.8, 1], reach: 120 },
      weather: { fog: 0.4, plume: 1, tint: 'tints', tintR: [120, 260] }, taint: 0.3 },
    presence: { r: [0.9, 1.3], h: [0, 0], stars: [40, 90], drift: 'still', driftR: [0, 0], speed: [0, 0], hum: { hz: [58, 64], loud: [0.2, 0.4], reach: 40 },
      weather: { fog: 0.25, plume: 0.3, tint: null }, taint: 0.2 }
  };
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const pickRange = function (R, seed, salt) { return lerp(R[0], R[1], X.u(seed, salt)); };
  const pickInt = function (R, seed, salt) { return R[0] + Math.floor(X.u(seed, salt) * (R[1] - R[0] + 1)) % (R[1] - R[0] + 1); };
  X.phenomenon = function (key, o) {
    o = o || {};
    const P = PH[key];
    if (!P) throw new Error('XP.phenomenon: no such kind ' + key + ' (' + X.VOCAB.phenomena.join(', ') + ')');
    const seed = (o.seed == null ? 1 : o.seed) >>> 0, at = (o.at || [0, 0, 0]).slice();
    const r = o.r == null ? pickRange(P.r, seed, 1) : o.r;
    const hover = o.h == null ? pickRange(P.h, seed, 2) : o.h;        /* how high it hangs over `at` */
    const rec = {
      id: null, 'class': 'feature', kind: 'phenomenon', key: key, name: o.name || X.NAMES[key], at: at, r: Math.round(r * 100) / 100,
      h: Math.round((hover + r * 2) * 100) / 100, hover: Math.round(hover * 100) / 100, ry: o.ry == null ? X.u(seed, 3) * Math.PI * 2 : o.ry, seed: seed,
      state: o.state || 'awake',
      drift: { mode: o.drift || P.drift, r: o.driftR == null ? Math.round(pickRange(P.driftR, seed, 4)) : o.driftR, speed: o.speed == null ? Math.round(pickRange(P.speed, seed, 5) * 100) / 100 : o.speed,
        y: o.driftY || [Math.max(0.5, hover - 1.5), hover + 1.5] },
      weather: { fog: P.weather.fog, plume: P.weather.plume, tint: null, tintR: 0 },
      hum: { hz: Math.round(pickRange(P.hum.hz, seed, 6)), loud: Math.round(pickRange(P.hum.loud, seed, 7) * 100) / 100, reach: P.hum.reach },
      look: {},
      taint: o.taint == null ? P.taint : o.taint,
      tags: { origin: 'extraplanar', role: key, variant: String(seed % 1000) },
      src: 'kits/extraplanar'
    };
    if (X.VOCAB.drifts.indexOf(rec.drift.mode) < 0) throw new Error('XP.phenomenon: drift ' + rec.drift.mode);
    if (X.VOCAB.phenomenonStates.indexOf(rec.state) < 0) throw new Error('XP.phenomenon: state ' + rec.state);
    if (key === 'void') {
      /* the eyes: n of them, each at a bearing and a height on the sphere, its size; they open toward the eye of the viewer */
      const n = o.eyes == null ? pickInt(P.eyes, seed, 8) : o.eyes, eyes = [];
      for (let i = 0; i < n; i++) eyes.push({ az: X.u(seed, 9, i) * Math.PI * 2, el: (X.u(seed, 10, i) - 0.5) * 1.6, s: lerp(0.12, 0.3, X.u(seed, 11, i)) });
      rec.look = { eyes: eyes };
    } else if (key === 'solid') {
      const forms = X.VOCAB.solids, form = o.form || forms[Math.floor(X.u(seed, 8) * forms.length) % forms.length];
      rec.look = { form: form, facets: pickInt(P.facets, seed, 9), seams: lerp(0.3, 1, X.u(seed, 10)), axis: [X.u(seed, 11) - 0.5, 1, X.u(seed, 12) - 0.5], spin: lerp(0.05, 0.2, X.u(seed, 13)) };
      const names = Object.keys(X.TINTS), tn = o.tint || names[Math.floor(X.u(seed, 14) * names.length) % names.length];
      rec.weather.tint = (X.TINTS[tn] || tn).slice(); rec.weather.tintName = X.TINTS[tn] ? tn : 'own';
      rec.weather.tintR = o.tintR == null ? Math.round(pickRange(P.weather.tintR, seed, 15)) : o.tintR;
    } else {
      /* a figure of stars: n points in a standing figure's envelope (a torso, a head, two legs), a halo ring over it */
      const n = o.stars == null ? pickInt(P.stars, seed, 8) : o.stars, stars = [];
      for (let i = 0; i < n; i++) {
        const u = X.u(seed, 9, i), v = X.u(seed, 10, i), w = X.u(seed, 11, i), y = v * 2.2;
        const half = y < 1.0 ? 0.22 : y < 1.9 ? 0.42 : 0.2, side = y < 1.0 ? (u < 0.5 ? -0.17 : 0.17) : 0;
        stars.push([side + (u - 0.5) * half * (y < 1.0 ? 0.6 : 2), y, (w - 0.5) * 0.4, lerp(0.03, 0.08, X.u(seed, 12, i))]);
      }
      rec.look = { stars: stars, eye: [0, 2.0, 0.2], halo: { r: 0.55, y: 2.55, tilt: lerp(-0.3, 0.3, X.u(seed, 13)) } };
    }
    return rec;
  };
  X.NAMES = { void: 'a void with eyes', solid: 'a solid with its own weather', presence: 'a haloed presence', door: 'a door standing alone', tear: 'a tear', drowned: 'a drowned-hall portal' };

  /* where a phenomenon is at module time t: the drift path from (seed, t) alone */
  X.pose = function (rec, t, eye) {
    const D = rec.drift, s = rec.seed, at = rec.at, out = { at: [at[0], at[1] + rec.hover, at[2]], ry: rec.ry, open: 1, spin: 0, pulse: 1 };
    t = t || 0;
    if (D.mode === 'wander' && D.r > 0) {
      const per = Math.max(4, D.r * 2 / Math.max(0.05, D.speed));
      out.at[0] += (X.n(t, per, s, 1) - 0.5) * 2 * D.r;
      out.at[2] += (X.n(t, per * 1.13, s, 2) - 0.5) * 2 * D.r;
      out.at[1] = at[1] + lerp(D.y[0], D.y[1], X.n(t, per * 0.7, s, 3));
      out.ry = Math.atan2(X.n(t + 0.5, per, s, 1) - X.n(t, per, s, 1), X.n(t + 0.5, per * 1.13, s, 2) - X.n(t, per * 1.13, s, 2));
    } else if (D.mode === 'orbit' && D.r > 0) {
      const a = t * D.speed / D.r + X.u(s, 20) * Math.PI * 2;
      out.at[0] += Math.cos(a) * D.r; out.at[2] += Math.sin(a) * D.r; out.ry = -a;
      out.at[1] = at[1] + lerp(D.y[0], D.y[1], X.n(t, 23, s, 3));
    }
    if (eye) out.ry = Math.atan2(eye[0] - out.at[0], eye[1] - out.at[2]);
    /* the breath: the eyes open and close slowly, the glow pulses; a latent one keeps its eyes shut */
    out.open = rec.state === 'latent' ? 0 : ss(0.3, 0.7, X.n(t, 6.5, s, 4));
    out.pulse = 0.7 + 0.3 * X.n(t, 2.1, s, 5);
    if (rec.key === 'solid') out.spin = t * rec.look.spin;
    return out;
  };

  /* ---------------------------------------------------------------- the portals */
  const PO = { door: { size: [2.4, 3.6] }, tear: { size: [1.2, 5] }, drowned: { size: [5, 6.5] } };
  X.portal = function (key, o) {
    o = o || {};
    const P = PO[key];
    if (!P) throw new Error('XP.portal: no such kind ' + key + ' (' + X.VOCAB.portals.join(', ') + ')');
    const seed = (o.seed == null ? 1 : o.seed) >>> 0, size = (o.size || P.size).slice();
    if (key === 'tear' && !o.size) size[1] = Math.round(lerp(1, 8, X.u(seed, 1)) * 10) / 10;
    const rec = {
      id: null, 'class': 'feature', kind: 'portal', key: key, name: o.name || X.NAMES[key], at: (o.at || [0, 0, 0]).slice(), ry: o.ry == null ? 0 : o.ry,
      size: size, r: Math.round(Math.max(size[0], 1) * 0.6 * 100) / 100, h: size[1], seed: seed,
      state: o.state || 'shut', leads: o.leads || null,
      flicker: Object.assign({ period: Math.round(lerp(1.5, 6, X.u(seed, 2)) * 10) / 10, duty: Math.round(lerp(0.25, 0.7, X.u(seed, 3)) * 100) / 100 }, o.flicker || {}),
      taint: o.taint == null ? 0.5 : o.taint,
      tags: { origin: 'extraplanar', role: key, variant: String(seed % 1000) },
      src: 'kits/extraplanar'
    };
    if (X.VOCAB.portalStates.indexOf(rec.state) < 0) throw new Error('XP.portal: state ' + rec.state);
    if (rec.leads && (!rec.leads.station || !rec.leads.at || rec.leads.at.length !== 3)) throw new Error('XP.portal: leads needs { station, at: [x, y, z] }');
    return rec;
  };
  X.openness = function (rec, t) {
    if (rec.state === 'open') return 1;
    if (rec.state === 'dead') return 0.04;
    if (rec.state === 'flicker') {
      const F = rec.flicker, slot = Math.floor((t || 0) / F.period), on = X.u(rec.seed, 30, slot) < F.duty;
      const u = ((t || 0) - slot * F.period) / F.period;
      return on ? 0.65 + 0.35 * ss(0, 0.08, u) : 0.1 + 0.1 * (1 - ss(0, 0.2, u));
    }
    return 0;
  };
  X.through = function (rec) { return rec && rec.leads ? rec.leads : null; };

  /* ---------------------------------------------------------------- the shared tells: the hum and the tint */
  X.humAt = function (x, z, t, R) {
    let sum = 0;
    const list = R ? R.near(x, z, 130) : [];
    for (const rec of list) {
      if (rec.kind !== 'phenomenon' || rec.state === 'latent') continue;
      const p = X.pose(rec, t), d = Math.hypot(p.at[0] - x, p.at[2] - z), f = 1 - ss(0, rec.hum.reach, d);
      sum += rec.hum.loud * f * f * (0.7 + 0.3 * X.n(t, 1.7, rec.seed, 6));
    }
    return clamp(sum, 0, 1);
  };
  X.tintAt = function (x, z, R) {
    let best = null, bd = Infinity;
    for (const rec of (R ? R.near(x, z, 260) : [])) {
      if (rec.kind !== 'phenomenon' || !rec.weather.tint || !rec.weather.tintR) continue;
      const d = Math.hypot(rec.at[0] - x, rec.at[2] - z);
      if (d <= rec.weather.tintR && d < bd) { bd = d; best = rec.weather.tint; }
    }
    return best;
  };

  /* ---------------------------------------------------------------- the registry */
  X.registry = {
    create: function (o) {
      o = o || {};
      const T = o.tags && typeof o.tags.add === 'function' ? o.tags : (typeof KTAGS !== 'undefined' && KTAGS && typeof KTAGS.create === 'function' ? KTAGS.create({ build: o.build || 'extraplanar' }) : null);
      const S = o.space || KS().create({ cell: o.cell == null ? 32 : o.cell });
      const list = [], byId = {};
      let seq = 0;
      const R = { tags: T, space: S };
      R.add = function (rec) {
        if (!rec || !rec.kind) throw new Error('XP.registry.add: not a record');
        if (rec.seq) throw new Error('XP.registry.add: ' + rec.id + ' is registered already');
        if (T) {
          const stored = T.add({ 'class': 'feature', kind: rec.kind, key: rec.key, name: rec.name, at: rec.at.slice(), ry: rec.ry, r: rec.r, h: rec.h, tags: rec.tags, src: rec.src,
            note: rec.kind === 'portal' ? (rec.leads ? 'leads to ' + rec.leads.station : 'leads nowhere') : rec.drift.mode + ', hum ' + rec.hum.hz + ' Hz' });
          rec.id = stored.id; rec.uid = stored.uid; rec.tagRecord = stored;
        } else rec.id = rec.kind + '_' + String(list.length + 1).padStart(5, '0');
        /* a wanderer is filed under its whole range, so near() finds it wherever it has drifted */
        S.insert(rec, rec.at[0], rec.at[2], rec.r + (rec.drift ? rec.drift.r : 0));
        rec.seq = ++seq;
        list.push(rec); byId[rec.id] = rec;
        return rec;
      };
      R.near = function (x, z, pad) { return S.query(x, z, pad == null ? 0 : pad); };
      R.all = function () { return list.slice(); };
      R.get = function (id) { return byId[id] || null; };
      R.phenomena = function () { return list.filter(function (r) { return r.kind === 'phenomenon'; }); };
      R.portals = function () { return list.filter(function (r) { return r.kind === 'portal'; }); };
      R.markDrawn = function (rec) {
        if (!rec || !rec.seq || byId[rec.id] !== rec) throw new Error('kits/extraplanar: drawing a record that was never registered (' + (rec && rec.key) + '): register it first (XP.registry.add)');
        rec.drawnSeq = ++seq;
        return rec;
      };
      R.check = function () {
        const fails = [];
        for (const r of list) { if (r.drawnSeq != null && !(r.drawnSeq > r.seq)) fails.push(r.id + ': drawn before registered'); if (!r.id) fails.push('a record without an id'); }
        return { ok: !fails.length, fails: fails, records: list.length, drawn: list.filter(function (r) { return r.drawnSeq != null; }).length };
      };
      return R;
    }
  };

  /* ---------------------------------------------------------------- the shared silhouettes (PLAN.md section 5)
     Each set: a nominal height h (m) and `parts`, simple polygons [[x, y], ...] in metres (x across, y up from the ground)
     whose union is the shape; a card scales them to an entry's own h. Authored as limbs (quads) and blobs so a kit
     can read them in Godot too. */
  function limb(x0, y0, x1, y1, w0, w1) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    return [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]];
  }
  function blob(cx, cy, rx, ry, n) {
    const P = [];
    n = n || 12;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return P;
  }
  function ring(cx, cy, r, t, n) {   /* a ring as a strip of quads (n segments) */
    const out = [];
    n = n || 16;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
      out.push([[cx + Math.cos(a) * (r + t / 2), cy + Math.sin(a) * (r + t / 2)], [cx + Math.cos(b) * (r + t / 2), cy + Math.sin(b) * (r + t / 2)],
        [cx + Math.cos(b) * (r - t / 2), cy + Math.sin(b) * (r - t / 2)], [cx + Math.cos(a) * (r - t / 2), cy + Math.sin(a) * (r - t / 2)]]);
    }
    return out;
  }
  X.SILHOUETTES = {
    /* three splayed stilts under a small body with a crescent: the Stilter, the robots' an_tripod, the stilt-grafted */
    tripod: { h: 11, parts: [blob(0, 8.9, 0.9, 0.75, 10), limb(0.3, 9.5, 0.9, 11, 0.5, 0.12), limb(-0.6, 8.5, -3.4, 0.0, 0.34, 0.12), limb(0.6, 8.5, 3.3, 0.0, 0.34, 0.12),
      limb(0.1, 8.4, 0.5, 0.0, 0.3, 0.1), limb(-0.6, 5.2, -2.2, 5.4, 0.08, 0.06), limb(0.6, 5.2, 2.1, 5.3, 0.08, 0.06)] },
    /* a tall hooded taper on two long legs, a ring behind the head: the Haloed, a shrouded robot, a robed mutant */
    tallwalker: { h: 3.8, parts: [[[-0.75, 0.4], [0.75, 0.4], [0.3, 3.1], [0.08, 3.75], [-0.08, 3.75], [-0.3, 3.1]], limb(-0.2, 0.5, -0.22, 0.0, 0.16, 0.22), limb(0.2, 0.5, 0.22, 0.0, 0.16, 0.22),
      limb(-0.4, 2.7, -0.95, 1.3, 0.14, 0.08), limb(0.4, 2.7, 0.95, 1.3, 0.14, 0.08)].concat(ring(0, 3.2, 0.62, 0.1, 18)) },
    /* a hunched long-armed biped with a round head: the Sun-headed, the Giants, a giant mutant */
    giant: { h: 9, parts: [[[-1.3, 3.4], [1.3, 3.4], [1.5, 6.6], [0.5, 7.9], [-0.9, 7.6], [-1.6, 6.3]], blob(0.2, 8.1, 0.95, 0.9, 12), limb(-0.6, 3.6, -0.7, 0.0, 0.7, 0.5), limb(0.6, 3.6, 0.8, 0.0, 0.7, 0.5),
      limb(-1.4, 6.4, -2.5, 1.2, 0.5, 0.3), limb(1.3, 6.6, 2.6, 1.0, 0.5, 0.3)] },
    /* a low body slung between four long limbs, a ring over the back: the Crawler, a mutant on grafted legs, a quadruped robot */
    crawler: { h: 2.6, parts: [blob(0, 1.9, 1.2, 0.42, 12), blob(1.35, 2.0, 0.45, 0.28, 10), limb(-0.9, 1.9, -1.9, 0.0, 0.22, 0.1), limb(-0.6, 1.9, -0.9, 0.0, 0.22, 0.1),
      limb(0.6, 1.9, 0.9, 0.0, 0.22, 0.1), limb(0.9, 1.9, 1.9, 0.0, 0.22, 0.1)].concat(ring(0, 2.75, 0.5, 0.09, 16)) }
  };
  X.HUNTER_SILHOUETTE = { xp_stilter: 'tripod', xp_haloed: 'tallwalker', xp_sunhead: 'giant', xp_crawler: 'crawler' };
  X.silhouette = function (key) { return X.HUNTER_SILHOUETTE[key] || null; };
  X.silhouetteBox = function (set) {   /* the outline's extents: [x0, x1, y0, y1] */
    const S = X.SILHOUETTES[set];
    if (!S) return null;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const P of S.parts) for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    return [x0, x1, y0, y1];
  };
  return X;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = XP;
