/* ================================================================= THE FLASHING EYE: its people, as data  [G data]
   settlements/flashing-eye/PLAN.md sections 1.2, 1.3 and 2.1 (the owner, 2026-11-16: about 320, 280 on the bench and 40 at the Foot
   House; the Rim Watch; the Station's passes). Everything here is *proposed*: the offices' numbers, the hours of the day, the walks,
   the Station's nights (one in eight), the pilgrims' day and the vigil.

   Pure functions of a clock t (seconds; the people's day d runs from 04:00 to 04:00, so a night belongs to one day) and the host's
   `env` (FE_WATCH's: day(t); station(t), FE_PEOPLE.stationAt unless given), on FE_LAYOUT (the census, the parts, the ways), FE_WATCH
   (the Rim Watch's rota, the post's mode, the kora flag) and core/rand. No THREE, no DOM: the page, test-people.js, the sim and Godot
   read the same people at the same places.

     FE_PEOPLE.people              the residents: {id, i, group, office, home, look, professed, watch (0-5: the Rim Watch), seed},
                                   from FE_LAYOUT.census (prismarch 10, chapter 130, school 30, novices 50, lay 60, foot 40)
     FE_PEOPLE.pilgrims(d)         the pilgrims who come on day d: {id, i, d, look, seed, arrive (h)}: 20-40, or 420-500 when the
                                   Station passes that night
     FE_PEOPLE.stationNight(d)     the Station passes over the Eye on the night of day d (one night in eight: d mod 8 = 5)
     FE_PEOPLE.stationAt(t)        env.station for FE_WATCH.state: the night t falls in is a Station's night
     FE_PEOPLE.pose(P, t, env)     where P is at t: {u, v, y (the layout's height there: a hint, or null for the ground), lift (m over
                                   what it stands on), h (heading: three's rotation.y on the page, where x = v and z = u), act ('walk' |
                                   'stand' | 'sit' | 'work'), way ('shrines', with f 0-1 along it, for the page's drawn Way of Shrines),
                                   where}, or {hidden: true, where} (indoors or away)
     FE_PEOPLE.at(t, env)          every resident's, and today's and yesterday's pilgrims', poses: [[P, pose], ...]
     FE_PEOPLE.paths               the walked lines in the layout's frame: kora (the lower kora), open (the rim's circle), breath (the
                                   Way of Breath from inside its gate), shrines, stair, mule; FE_PEOPLE.route(a, b) a line between two
                                   places of the bench by its lanes (FE_PEOPLE.N the nodes, FE_PEOPLE.PLACES the doors)
     FE_PEOPLE.H                   the hours of the day: the offices, the meals, the procession

   The day (*proposed*): the morning office 04:30-06:10, the meals at 06:20, 11:00 and 17:00, the midday office at 12:00, the evening
   office 17:45-18:50; between them each to his office: the readers in the Mirror Hall (a pair on its balcony for the day line's
   slots each hour), the Rift Watch on the balcony in turns, by day and night (the Master of the Rift's office, the owner, 2026-11-23:
   the Lizardmen on the Rift floor; its watchers at the gallery's windows and in the Lip's towers are indoors, so not drawn), the chapter at study, debating in pairs in the Monastery Court or walking the lower kora clockwise, the novices at
   lessons in their yard, the lay brothers in the kitchen, the granary, the upper terraces, the byres and the woodlot, the porters at
   the Mule Gate, a mule train up the Stair and the mule road each morning. The Rim Watch (FE_WATCH.watch) keeps the post: of the two
   awake, one on the platform (by day, and by night in the fire basket's slots: FE_WATCH.state's mode), the other walking the rim by
   day and at the post's door by night; the other two asleep in the hut; a new watch walks up the evening before its week and the
   old walks down after midnight. Pilgrims come up the Way of Shrines, walk the lower kora three times clockwise, climb the Way of
   Breath to the Threshold Chorten and stop there (no further: the rim is the professed's), rest in the Pilgrims' Court and sleep in
   the guest house; next morning they go down. On a Station's night (FE_WATCH.state's kora) the professed walk in procession from the
   monastery up the Way of Breath and three times round the rim clockwise with eyes open, and back; the year's novices keep the
   vigil at the Threshold Chorten; the pilgrims fill the Pilgrims' Court and the chorten's ring, and go down after the kora. */
const FE_PEOPLE = (function () {
  'use strict';
  const R = typeof KRAND !== 'undefined' ? KRAND : (require('../../../core/rand/08-core-rand.js'), globalThis.KRAND);
  const L = typeof FE_LAYOUT !== 'undefined' ? FE_LAYOUT : require('./30-fe-layout.js');
  const W = typeof FE_WATCH !== 'undefined' ? FE_WATCH : require('./40-fe-watch.js');
  const SEED = R.child(34400, 'flashing-eye.people'), HR = 3600, DAY = 86400, D0 = 4 * HR;
  const U = (...a) => R.unit(R.hash(SEED, ...a));
  const part = id => L.parts.find(p => p.id === id);
  const mid = b => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2];
  /* the page's day (FE_ENV.day) when the host gives none */
  const DAYF = t => { const h = ((t % DAY) + DAY) % DAY / HR; return h >= 6.2 && h < 18.4; };

  /* ---- lines: points [u, v, y] (y null: on the ground), lengths along, a point at d (wrapped when closed) offset to its left */
  function path(pts, closed) {
    const P = pts.map(p => [p[0], p[1], p[2] == null ? null : p[2]]);
    if (closed && (P[0][0] !== P[P.length - 1][0] || P[0][1] !== P[P.length - 1][1])) P.push(P[0].slice());
    const s = [0]; for (let i = 1; i < P.length; i++) s.push(s[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { P, s, L: s[s.length - 1], closed: !!closed };
  }
  function at(T, d, off) {
    d = T.closed ? ((d % T.L) + T.L) % T.L : Math.max(0, Math.min(T.L, d));
    let lo = 0, hi = T.s.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T.s[m] <= d) lo = m; else hi = m; }
    const a = T.P[lo], b = T.P[hi], len = T.s[hi] - T.s[lo], k = len > 0 ? (d - T.s[lo]) / len : 0, du = b[0] - a[0], dv = b[1] - a[1], n = Math.hypot(du, dv) > 0 ? Math.hypot(du, dv) : 1, o = off == null ? 0 : off;
    return { u: a[0] + du * k - dv / n * o, v: a[1] + dv * k + du / n * o, y: a[2] == null || b[2] == null ? null : a[2] + (b[2] - a[2]) * k, du: du / n, dv: dv / n };
  }
  const near = (T, p) => { let best = 0, bd = 1e18; for (let i = 0; i + 1 < T.P.length; i++) { const a = T.P[i], b = T.P[i + 1], du = b[0] - a[0], dv = b[1] - a[1], L2 = du * du + dv * dv;
    const k = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * du + (p[1] - a[1]) * dv) / L2)) : 0, d = Math.hypot(p[0] - a[0] - du * k, p[1] - a[1] - dv * k);
    if (d < bd) { bd = d; best = T.s[i] + k * Math.sqrt(L2); } } return best; };
  const way = id => L.ways.find(w => w.id === id);
  const C = L.crater, RIM = C.r + 12, THR = mid(part('threshold').box), POST = mid(part('post').box), HUT = mid(part('hut').box);
  const paths = {
    kora: path(way('kora.lower').pts, true),   /* its points run counter-clockwise: walked with d falling */
    open: path(way('kora.open').pts.map(p => [p[0], p[1], null]), true),   /* the rim's circle from its south point, counter-clockwise: d falls */
    breath: path([[-139, 0, 9]].concat(way('breath').pts.map(p => [p[0], p[1], null]))),
    shrines: path(way('bridges').pts),
    stair: path(way('stair').pts.map(p => [p[0], p[1], null])),
    mule: path(way('mule').pts.map(p => [p[0], p[1], null])),
    /* at the rim: from the Way of Breath's end round the chorten's west side to the circle; to the post's door; to the hut's */
    toRim: path([[THR[0] + 4, 0, null], [THR[0] - 2, -6.5, null], [THR[0] - 13, -4, null], [C.centre[0] + RIM, 0, null]]),
    toPost: path([[THR[0] + 4, 0, null], [THR[0] + 6.5, 2, null], [THR[0] - 1, 7.5, null], [-1885, 7, null], [POST[0] + 4.6, POST[1] + 1.5, null]]),
    toHut: path([[THR[0] + 4, 0, null], [THR[0] + 6.5, 2, null], [THR[0] - 1, 7.5, null], [HUT[0] + 4.6, HUT[1], null]])
  };
  /* the Way of Shrines is longer walked than its points (the stair up the nose, a stair round each crown: 90fi); the page maps f
     along its drawn line, and the time it takes is this */
  const SHRINES_M = Math.round(paths.shrines.L + 6 * 2 * Math.PI * 16 * (25 / 24) + 120);
  const OPEN0 = near(paths.open, [C.centre[0] + RIM, 0]);

  /* ---- the bench's lanes (the layout's frame, y the level walked): the lane behind the Lip Range, the courts, the stairs (the axis
     and the kora's four), the Mule Court's lane, the upper terrace's lanes to the granary, the infirmary, the Mirror School and the
     Gate of Breath. A place is a door off a node; a route runs door, nodes, door */
  const N = {
    rift: [-9, -80, 0], l80w: [-17, -80, 0], l68w: [-17, -68, 0], l45w: [-17, -45, 0], l28w: [-17, -28, 0], l15w: [-17, -15, 0], l0: [-17, 0, 0],
    l15e: [-17, 15, 0], l28e: [-17, 28, 0], l45e: [-17, 45, 0], l68e: [-17, 68, 0], l82e: [-17, 82, 0], court: [-26, 0, 0], pil: [-30, 58, 0],
    axf: [-32.3, 0, 0], axh: [-46.4, 0, 4], klwf: [-32.3, -28, 0], klwh: [-46.4, -28, 4], klef: [-32.3, 28, 0], kleh: [-46.4, 28, 4],
    ref: [-74, -28, 4], mul: [-90, -28, 4], kit: [-90, -38, 4], mc: [-90, -62, 4], bth: [-66, -77, 4], wst: [-64, -57, 4], mgi: [-87, -86, 4], mgo: [-87, -91, 4],
    kuwf: [-98.3, -28, 4], kuwh: [-114.3, -28, 9], chap: [-80, 28, 4], kuef: [-98.3, 28, 4], kueh: [-114.3, 28, 9],
    ne1: [-51, 31, 4], ne2: [-51, 67, 4], nvg: [-62, 67, 4], nvy: [-70, 67, 4.5],
    u28w: [-115.5, -28, 9], u48: [-115.5, -48, 9], u74: [-115.5, -74, 9], u0: [-115.5, 0, 9], u12: [-115.5, 12, 9], u28e: [-115.5, 28, 9],
    u40: [-120, 40, 9], u66: [-120, 66, 9], g12: [-139, 12, 9], gin: [-139, 0, 9]
  };
  const E = [['rift', 'l80w'], ['l80w', 'l68w'], ['l68w', 'l45w'], ['l45w', 'l28w'], ['l28w', 'l15w'], ['l15w', 'l0'], ['l0', 'l15e'], ['l15e', 'l28e'], ['l28e', 'l45e'],
    ['l45e', 'l68e'], ['l68e', 'l82e'], ['l0', 'court'], ['l45e', 'pil'], ['court', 'axf'], ['axf', 'axh'], ['l28w', 'klwf'], ['klwf', 'klwh'], ['l28e', 'klef'], ['klef', 'kleh'],
    ['axh', 'klwh'], ['axh', 'kleh'], ['klwh', 'ref'], ['ref', 'mul'], ['mul', 'kuwf'], ['kuwf', 'kuwh'], ['kuwh', 'u28w'], ['mul', 'kit'], ['kit', 'mc'], ['mc', 'bth'],
    ['mc', 'wst'], ['mc', 'mgi'], ['mgi', 'mgo'], ['kleh', 'chap'], ['chap', 'kuef'], ['kuef', 'kueh'], ['kueh', 'u28e'], ['kleh', 'ne1'], ['ne1', 'ne2'], ['ne2', 'nvg'], ['nvg', 'nvy'],
    ['u28w', 'u48'], ['u48', 'u74'], ['u28w', 'u0'], ['u0', 'u12'], ['u12', 'u28e'], ['u28e', 'u40'], ['u40', 'u66'], ['u12', 'g12'], ['g12', 'gin']];
  const adj = {}; for (const k in N) adj[k] = [];
  for (const [a, b] of E) { const d = Math.hypot(N[a][0] - N[b][0], N[a][1] - N[b][1]); adj[a].push([b, d]); adj[b].push([a, d]); }
  const PLACES = {
    'lip.mirror': ['l45w', [-14.3, -45, 0]], 'lip.books': ['l15w', [-14.3, -15, 0]], 'lip.guests': ['l15e', [-14.3, 15, 0]], 'lip.labrang': ['l45e', [-14.3, 45, 0]],
    'tw.mirror': ['l68w', [-14.3, -68, 0]], 'tw.labrang': ['l68e', [-14.3, 68, 0]], monastery: ['axh', [-48.3, 0, 4]], refectory: ['ref', [-74, -30.3, 4]],
    kitchen: ['kit', [-92.3, -38, 4]], chapter: ['chap', [-80, 33.7, 4]], novices: ['nvy', [-71.5, 59.8, 4.5]], school: ['u66', [-129.7, 66, 9]], ember: ['u0', [-116.3, 0, 9]],
    granary: ['u74', [-118.3, -74, 9]], infirmary: ['u48', [-118.3, -48, 9]], bath: ['bth', [-62.3, -77, 4]], woodstore: ['wst', [-60.3, -57, 4]], 'g.mule': ['mgi', [-86, -87, 4]],
    'gate.rift': ['rift', [-3, -80, 0]], court: ['court', null], pilgrims: ['pil', null], gate: ['gin', null], mulecourt: ['mc', null], 'mule.road': ['mgo', null]
  };
  const ncache = new Map();
  function nodes(a, b) {   /* the shortest run of nodes from a to b (Dijkstra over the lanes) */
    const k = a + '>' + b; if (ncache.has(k)) return ncache.get(k);
    if (!adj[a] || !adj[b]) throw new Error('FE_PEOPLE: no lane node ' + (adj[a] ? b : a));
    const dist = { [a]: 0 }, prev = {}, done = new Set(), q = [a];
    while (q.length) { q.sort((x, y) => dist[x] - dist[y]); const x = q.shift(); if (done.has(x)) continue; done.add(x); if (x === b) break;
      for (const [y, d] of adj[x]) { const nd = dist[x] + d; if (dist[y] == null || nd < dist[y]) { dist[y] = nd; prev[y] = x; q.push(y); } } }
    const out = []; for (let x = b; x != null; x = prev[x]) { out.unshift(x); if (x === a) break; }
    if (out[0] !== a) throw new Error('FE_PEOPLE: no lane from ' + a + ' to ' + b);
    ncache.set(k, out); return out;
  }
  const nodeOf = p => PLACES[p] ? PLACES[p][0] : p;
  function route(a, b) {
    const pts = [], da = PLACES[a] && PLACES[a][1], db = PLACES[b] && PLACES[b][1];
    if (da) pts.push(da); for (const n of nodes(nodeOf(a), nodeOf(b))) pts.push(N[n]); if (db) pts.push(db);
    return path(pts.length > 1 ? pts : pts.concat([pts[0]]));
  }
  /* the k-th of a box's grid slots `step` apart, `m` in from its edges (those within `clear` of `avoid` left out), jittered */
  const scache = new Map();
  function slot(box, k, step, m, j, avoid, clear) {
    const key = box.join() + '|' + step + '|' + m + '|' + (avoid || ''); let S = scache.get(key);
    if (!S) { S = []; for (let v = box[2] + m; v <= box[3] - m + 1e-9; v += step) for (let u = box[0] + m; u <= box[1] - m + 1e-9; u += step)
      if (!avoid || Math.hypot(u - avoid[0], v - avoid[1]) >= clear) S.push([u, v]); scache.set(key, S); }
    const p = S[k % S.length]; return [p[0] + (j[0] - 0.5) * step * 0.3, p[1] + (j[1] - 0.5) * step * 0.3];
  }
  const face = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
  /* the k-th place in the rings round the Threshold Chorten, facing it: its south half (the pilgrims'), or the north (the vigil's) */
  function ring(k, north) { let r = 6, n = 0; for (;;) { const c = Math.floor(Math.PI * r / 1.1); if (k < n + c) { const a = (k - n + 0.5) / c * Math.PI - Math.PI / 2 + (north ? Math.PI : 0);
    const p = [THR[0] + Math.cos(a) * r, THR[1] + Math.sin(a) * r, null]; return { p, h: face(p, THR) }; } n += c; r += 1.3; } }
  const BAL = [2.2, -58, -32];   /* the Mirror Hall's balcony: u, v from, v to (90fk: the floor in front of L0) */
  const KJOIN = 'klwh', koraAt = n => near(paths.kora, N[n]);

  /* ---- the residents, from the census: each group's offices in order (*proposed*), the lay brothers by where they sleep */
  const OFFICES = {
    prismarch: [['prismarch', 1, 'elder'], ['secretary', 1, 'elder'], ['chamberlain', 1, 'elder'], ['attendant', 4, 'monk'], ['cook', 3, 'lay']],
    chapter: [['rimwatch', L.rota.watch, 'monk'], ['riftwatch', 12, 'monk'], ['reader', 20, 'monk'], ['librarian', 6, 'monk'], ['prior', 1, 'elder'], ['master', 5, 'elder'], ['monk', 1e9, 'monk']],
    school: [['schoolmaster', 3, 'elder'], ['student', 1e9, 'monk']], novices: [['novice', 1e9, 'novice']],
    foot: [['hosteller', 1, 'lay'], ['muleteer', 14, 'lay'], ['storeman', 10, 'lay'], ['hand', 1e9, 'lay']]
  };
  const LAY = { 'lip.guests': 'server', ember: 'tender', granary: 'granary', infirmary: 'infirmarian', kitchen: 'cook', bath: 'bathkeeper', 'g.mule': 'porter', byres: 'herdsman', woodlot: 'woodman' };
  const people = [];
  for (const g of Object.keys(L.census)) {
    const n = L.census[g], hs = L.parts.filter(p => p.sleeps && p.sleeps[g]).map(p => [p.id, p.sleeps[g]]);
    const homeAt = k => { let a = 0; for (const [id, c] of hs) { a += c; if (k < a) return id; } return hs.length ? hs[hs.length - 1][0] : 'monastery'; };
    let k = 0;
    if (g === 'lay') { for (const [id, c] of hs) for (let j = 0; j < c; j++, k++) people.push({ group: g, office: LAY[id] || 'lay', home: id, look: 'lay', k, j }); continue; }
    for (const [office, c, look] of OFFICES[g]) for (let j = 0; j < c && k < n; j++, k++) people.push({ group: g, office, home: homeAt(k), look, k, j });
  }
  people.forEach((P, i) => { P.i = i; P.id = 'fe.' + P.group + '.' + String(P.k).padStart(3, '0'); P.seed = R.hash(SEED, 1, i);
    P.professed = P.group === 'chapter' || P.group === 'school' || (P.group === 'prismarch' && P.look !== 'lay');
    if (P.office === 'rimwatch') P.watch = Math.floor(P.j / L.rota.perWatch); });
  /* the procession's order: the Prismarch first, then the elders, the chapter and the school */
  const PROC = people.filter(P => P.professed).sort((a, b) => (a.office === 'prismarch' ? 0 : 1) - (b.office === 'prismarch' ? 0 : 1) || (a.look === 'elder' ? 0 : 1) - (b.look === 'elder' ? 0 : 1) || a.i - b.i);
  PROC.forEach((P, k) => { P.proc = k; });

  /* ---- the Station's nights and the pilgrims */
  const stationNight = d => ((d % 8) + 8) % 8 === 5;
  const dayOf = t => Math.floor((t - D0) / DAY);
  const stationAt = t => stationNight(dayOf(t));
  const pilCache = new Map();
  function pilgrims(d) {
    if (pilCache.has(d)) return pilCache.get(d);
    const st = stationNight(d), n = st ? 420 + Math.floor(U(2, d, 1) * 81) : 20 + Math.floor(U(2, d, 1) * 21), out = [];
    for (let i = 0; i < n; i++) out.push({ id: 'fe.pilgrim.' + d + '.' + String(i).padStart(3, '0'), i, d, group: 'pilgrim', office: 'pilgrim', station: st,
      look: U(3, d, i, 4) < 0.16 ? 'pilgrim.rich' : 'pilgrim', seed: R.hash(SEED, 3, d, i), arrive: st ? 8.5 + 8.5 * U(3, d, i, 1) : 8 + 5 * U(3, d, i, 1) });
    if (pilCache.size > 6) pilCache.delete(pilCache.keys().next().value);
    pilCache.set(d, out); return out;
  }

  /* ---- the hours (*proposed*) */
  const H = { office: [4.5, 6.15], meal1: [6.3, 6.95], meal2: [11.0, 11.7], midday: [12.0, 12.5], meal3: [17.0, 17.6], evening: [17.75, 18.85],
    proc: 19.5, rounds: 3, procSpeed: 1.0, gap: 2.4, vigilTo: 27.2, watchUp: 22.6, trainOut: 5.5, pilgrimDown: 22.4 };

  /* ---- a plan: legs in time, each {t0, t1} and one of: {T, d0, sp (m/s, signed), off} a walk; {at: [u,v,y], h, act, lift} a stand;
     {hide: where}; {duty: role} the Rim Watch's, resolved at t on FE_WATCH.state */
  function Plan(d) {
    const legs = [], base = d * DAY; let t = base + D0;
    const B = {
      legs, where: null, get t() { return t; },
      at: h => base + h * HR,
      hide(where, until) { if (until > t) legs.push({ t0: t, t1: until, hide: where }); t = Math.max(t, until); return B; },
      walk(T, d0, d1, sp, off, extra) { const dur = Math.abs(d1 - d0) / sp; if (dur > 0) legs.push(Object.assign({ t0: t, t1: t + dur, T, d0, sp: d1 >= d0 ? sp : -sp, off: off == null ? 0 : off }, extra || {})); t += dur; return B; },
      go(a, b, sp, off) { if (a === b) return B; const T = route(a, b); return B.walk(T, 0, T.L, sp, off); },
      stand(p, h, until, act, lift) { if (until > t) legs.push({ t0: t, t1: until, at: p, h, act: act || 'stand', lift: lift == null ? 0 : lift }); t = Math.max(t, until); return B; },
      to(p, sp) { const a = B.last(); if (!a) return B; const T = path([a, p]); return B.walk(T, 0, T.L, sp); },   /* straight on from where the last leg ended */
      last() { const g = legs[legs.length - 1]; if (!g) return null; if (g.T) { const q = at(g.T, g.d0 + g.sp * (g.t1 - g.t0)); return [q.u, q.v, q.y]; } return g.at || null; },
      duty(role, until) { if (until > t) legs.push({ t0: t, t1: until, duty: role }); t = Math.max(t, until); return B; }
    };
    return B;
  }

  /* ---- a resident's day d (04:00 to 04:00) */
  const caches = new WeakMap(), DEFENV = {};
  const cacheOf = env => { let c = caches.get(env); if (!c) { c = new Map(); caches.set(env, c); } return c; };
  function plan(P, d, env) {
    const cache = cacheOf(env), key = P.i + ':' + d; if (cache.has(key)) return cache.get(key);
    const B = Plan(d), J = k => U(4, P.i, d, k), sp = 1.0 + 0.25 * J(1), home = P.home, h = B.at, jit = k => (J(k) - 0.5) * 0.06;
    const e = { day: env.day || DAYF, station: env.station || stationAt, clear: env.clear, message: env.message };
    const kora = !!W.state(h(21), e).kora, procT = h(H.proc) + (P.proc == null ? 0 : P.proc * H.gap);
    const onW = P.watch != null ? [W.watch(d).watch === P.watch, W.watch(d + 1).watch === P.watch] : [false, false];
    const homeOf = home === 'tw.labrang' ? 'tw.labrang' : home;
    function procession() {   /* the Open Kora: up the Way of Breath, three times round the rim clockwise, and down */
      B.hide('the monastery', procT); const s = H.procSpeed; B.go('monastery', 'gate', s); B.walk(paths.breath, 0, paths.breath.L, s);
      B.walk(paths.toRim, 0, paths.toRim.L, s); B.walk(paths.open, OPEN0, OPEN0 - H.rounds * paths.open.L, s * 1.1); B.walk(paths.toRim, paths.toRim.L, 0, s);
      B.walk(paths.breath, paths.breath.L, 0, s); B.go('gate', home === 'tw.labrang' ? 'tw.labrang' : 'monastery', s);
    }
    /* the offices and the meals, with `work(from, to)` between them; stay: end in the monastery after the evening office */
    function officeDay(stay) {
      if (home !== 'monastery') { B.hide(home, h(H.office[0] - 0.15 + jit(2))); B.go(home, 'monastery', sp); }
      B.hide('the morning office', h(H.office[1] + jit(3)));
      if (J(4) < 0.3) { const k0 = koraAt(KJOIN); B.go('monastery', KJOIN, sp); B.walk(paths.kora, k0, k0 - paths.kora.L, sp * 0.95, (J(5) - 0.5) * 1.2); B.go(KJOIN, 'refectory', sp); }
      else B.go('monastery', 'refectory', sp);
      B.hide('the refectory', h(H.meal1[1] + jit(6))); B.where = 'refectory'; work(B.t, h(H.meal2[0] - 0.12));
      B.go(B.where, 'refectory', sp); B.hide('the refectory', h(H.meal2[1] + jit(7))); B.go('refectory', 'monastery', sp); B.hide('the midday office', h(H.midday[1] + jit(8)));
      B.where = 'monastery'; work(B.t, h(H.meal3[0] - 0.12)); B.go(B.where, 'refectory', sp); B.hide('the refectory', h(H.meal3[1] + jit(9))); B.go('refectory', 'monastery', sp);
      B.hide('the evening office', h(H.evening[1] + jit(10)));
      if (kora && P.professed && !onW[0] && P.office !== 'riftwatch') return procession();   /* the Rift Watch keeps its post */
      if (!stay) B.go('monastery', homeOf, sp);
    }
    /* each office's work between the meals, from where B.where says to where it leaves it */
    function work(from, to) {
      const o = P.office, mor = from < h(10), hr0 = Math.ceil((from - d * DAY) / HR - 1e-9);
      if (o === 'reader') {   /* a pair of the twenty at the balcony's mirror for the day line's slots each hour, the rest in the hall */
        B.go(B.where, 'lip.mirror', sp); const pair = Math.floor(P.j / 2), v = BAL[1] + 4 + (P.j % 2) * 3;
        for (let hr = hr0; h(hr) + W.DAY_LINE <= to; hr++) { if ((hr + d) % 10 !== pair) continue; B.hide('the Mirror Hall', h(hr)); B.stand([BAL[0], v, 0], 0, h(hr) + W.DAY_LINE, 'stand'); }
        B.hide('the Mirror Hall', to); B.where = 'lip.mirror'; return;
      }
      if (o === 'riftwatch') {   /* the Rift Watch: four on the balcony in turn, two hours each, glasses on the Rift floor */
        B.go(B.where, 'lip.mirror', sp);
        for (let hr = hr0; h(hr) + 900 <= to; hr++) { if ((Math.floor(hr / 2) + d) % 3 !== P.j % 3) continue; B.hide('the readers\' gallery', h(hr)); B.stand([BAL[0] + 0.3, BAL[2] - 1.5 - (P.j % 4) * 2.4, 0], 0, Math.min(to, h(hr + 1)), 'stand'); }
        B.hide('the readers\' gallery', to); B.where = 'lip.mirror'; return;
      }
      if (o === 'prismarch' || o === 'secretary') {   /* the council by mirror at ten: to the Mirror Hall and back */
        B.go(B.where, 'tw.labrang', sp * 0.85); if (mor) { B.hide('the Labrang', h(9.75)); B.go('tw.labrang', 'lip.mirror', sp * 0.85); B.hide('the council by mirror', h(10.9)); B.go('lip.mirror', 'tw.labrang', sp * 0.85); }
        B.hide('the Labrang', to); B.where = 'tw.labrang'; return;
      }
      if (o === 'librarian') { B.go(B.where, 'lip.books', sp); B.hide('the Book House', to); B.where = 'lip.books'; return; }
      if (o === 'student' || o === 'schoolmaster') { B.go(B.where, 'school', sp); B.hide('the Mirror School', to); B.where = 'school'; return; }
      if (o === 'novice') {   /* lessons in the yard, five rows facing south; in the afternoon debate in pairs there, clear of its chorten */
        B.go(B.where, 'novices', sp);
        if (mor) { B.hide('the novices\' court', h(7.5)); const r = P.k % 5, c = Math.floor(P.k / 5); B.stand([-94.5 + r * 1.5, 61.5 + c * 1.22, 4.5], 0, Math.min(to, h(10.5)), 'sit'); }
        else { B.hide('the novices\' court', h(13)); const pr = Math.floor(P.k / 2), p = slot([-95, -74, 60, 74], pr, 2.7, 1, [J(17), J(18)], [-84, 67], 3.5);
          B.stand([p[0] + (P.k % 2 ? 1.3 : 0), p[1], 4.5], P.k % 2 ? Math.PI : 0, Math.min(to, h(15)), 'stand'); }
        B.hide('the novices\' court', to); B.where = 'novices'; return;
      }
      if (P.group === 'chapter' || P.group === 'prismarch') {   /* the chapter: debate in pairs in the Monastery Court, the kora's rounds, or study */
        const pr = Math.floor(P.k / 2), deb = P.office === 'monk' && U(6, d, pr, mor ? 1 : 2) < 0.3, c = J(mor ? 11 : 12);
        if (deb) {   /* the questioner standing and his answerer facing him, a pair to a slot */
          const st = h(mor ? 9 : 14) + jit(13) * 10, en = Math.min(to, h(mor ? 10.8 : 16.4)), p = slot([-34, -18, -22, 22], pr, 3.2, 1.5, [U(6, d, pr, 3), U(6, d, pr, 4)]);
          B.go(B.where, 'monastery', sp); B.hide('the monastery', st); B.go('monastery', 'court', sp); B.to([p[0] + (P.k % 2 ? 1.4 : 0), p[1], 0], sp);
          B.stand([p[0] + (P.k % 2 ? 1.4 : 0), p[1], 0], P.k % 2 ? Math.PI : 0, en, 'stand'); B.to(N.court, sp); B.go('court', 'monastery', sp);
          B.hide('the monastery', to); B.where = 'monastery'; return;
        }
        if (c < 0.25) {   /* the kora's rounds, clockwise */
          const st = mor ? h(8.2 + J(14)) : h(13 + 2 * J(14)), k0 = koraAt(KJOIN), n = 1 + Math.floor(J(15) * 3);
          B.go(B.where, 'monastery', sp); B.hide('the monastery', st); B.go('monastery', KJOIN, sp); B.walk(paths.kora, k0, k0 - n * paths.kora.L, sp * 0.9, (J(16) - 0.5) * 1.4);
          B.go(KJOIN, homeOf, sp); B.hide('a cell', to); B.where = homeOf; return;
        }
        B.go(B.where, homeOf, sp); B.hide('study', to); B.where = homeOf; return;
      }
    }
    /* ---- the groups */
    if (P.office === 'rimwatch' && (onW[0] || onW[1])) {   /* the Rim Watch on its week */
      const role = t => { const sh = Math.floor((((t / DAY) % 1) + 1) % 1 * 4) % 2, k = P.j % 4; return (sh ? k >= 2 : k < 2) ? (k % 2 ? 'patrol' : 'platform') : 'asleep'; };
      const dutyTo = until => { while (B.t < until - 1) { const nt = Math.min(until, (Math.floor(B.t / (6 * HR) + 1e-9) + 1) * 6 * HR); B.duty(role(B.t + 1), nt); } };
      if (onW[0]) {
        dutyTo(h(24));
        if (onW[1]) dutyTo(h(28));
        else { B.walk(paths.toPost, paths.toPost.L, 0, sp); B.walk(paths.breath, paths.breath.L, 0, sp, 0.8); B.go('gate', 'monastery', sp); }
      } else {
        officeDay(true); B.hide('the monastery', h(H.watchUp) + (P.j % 4) * 4); B.go('monastery', 'gate', sp); B.walk(paths.breath, 0, paths.breath.L, sp);
        B.walk(paths.toHut, 0, paths.toHut.L, sp); B.hide('the Watch\'s hut', h(24)); dutyTo(h(28));
      }
    } else if (P.group === 'novices') {
      officeDay(true);
      const k = ((P.k + d * 7) % 50 + 50) % 50, vow = kora && k < 8;   /* the year's novices take their vows: a night's vigil at the Threshold Chorten */
      if (vow) { B.hide('the monastery', h(H.proc) + (PROC.length + k) * H.gap); B.go('monastery', 'gate', H.procSpeed); B.walk(paths.breath, 0, paths.breath.L, H.procSpeed);
        const r = ring(k, true); B.to(r.p, H.procSpeed); B.stand(r.p, r.h, h(H.vigilTo), 'stand'); B.to(paths.breath.P[paths.breath.P.length - 1], sp);
        B.walk(paths.breath, paths.breath.L, 0, sp); B.go('gate', 'monastery', sp); }
      else B.go('monastery', 'novices', sp);
    } else if (P.office === 'riftwatch') {   /* the Rift Watch by night too: a third of it on the balcony in each three-hour turn */
      officeDay(true); let at = 'monastery';
      for (let hr = 19; hr < 28; hr += 3) { if ((Math.floor(hr / 3) + d) % 3 !== P.j % 3) continue;
        if (at !== 'lip.mirror') { B.go(at, 'lip.mirror', sp); at = 'lip.mirror'; }
        B.hide('the readers\' gallery', h(hr)); B.stand([BAL[0] + 0.3, BAL[2] - 1.5 - (P.j % 4) * 2.4, 0], 0, h(hr + 3), 'stand'); }
    } else if (P.professed) {
      officeDay(false);
    } else if (P.group === 'foot') {
      const FH = mid(part('foothouse').box), door = [FH[0] + 30.6, FH[1], null], yard = [FH[0] - 21, FH[0] + 21, FH[1] - 31, FH[1] + 31];
      if (P.office === 'muleteer' && (P.k + d) % 2 === 0) {   /* today's mule train: up the Stair and the mule road, an hour unloading, and back */
        B.hide('the Foot House', h(H.trainOut) + (P.k % 7) * 9); B.walk(paths.stair, 0, paths.stair.L, 0.95, 0.6); B.walk(paths.mule, 0, paths.mule.L, 0.95, 0.6);
        B.go('mule.road', 'mulecourt', 0.95); const p = slot([-110, -66, -84, -52], P.k, 2.5, 3, [J(20), J(21)]); B.to([p[0], p[1], 4], 0.95); B.stand([p[0], p[1], 4], J(22) * 6.28, B.t + 3600, 'work');
        B.to(N.mc, 0.95); B.go('mulecourt', 'mule.road', 0.95); B.walk(paths.mule, paths.mule.L, 0, 0.95, 0.6); B.walk(paths.stair, paths.stair.L, 0, 0.95, 0.6);
      } else if (P.office === 'hosteller') { B.hide('the Foot House', h(7)); B.stand(door, 0, h(11), 'stand'); B.hide('the Foot House', h(12)); B.stand(door, 0, h(18), 'stand'); }
      else if (P.office === 'hand') { const tb = part('footterr').box, p = slot(tb, (P.k * 37) % 400, 9, 6, [J(23), J(24)]);
        B.hide('the Foot House', h(7.2)); B.stand([p[0], p[1], null], J(25) * 6.28, h(11.5), 'work'); B.hide('the Foot House', h(13)); B.stand([p[0], p[1], null], J(25) * 6.28, h(17), 'work'); }
      else if (J(28) < 0.5) { const p = slot(yard, P.k, 3, 3, [J(26), J(27)]); B.hide('the Foot House', h(8)); B.stand([p[0], p[1], null], J(29) * 6.28, h(15.5), 'work', 0.5); }
    } else {   /* the lay brothers, the Prismarch's cooks among them */
      const o = P.office;
      if (o === 'herdsman') { const p = [-298 + 33 * J(32), -70 + 60 * J(33), null]; B.hide('the byres', h(9)); B.stand(p, J(34) * 6.28, h(16.5), 'stand'); }
      else if (o === 'woodman') { const a = J(35) * 6.28, r = 21 + 7 * J(36), p = [-288 + Math.cos(a) * r, -125 + Math.sin(a) * r, null];
        B.hide('the woodlot', h(7.5)); B.stand(p, J(37) * 6.28, h(12), 'work'); B.hide('the woodlot', h(13)); B.stand(p, J(37) * 6.28, h(17), 'work'); }
      else if (o === 'granary' && P.j >= 4) {   /* the upper terraces' barley and buckwheat */
        const tb = part(P.j % 2 ? 'terr.e' : 'terr.w').box, q = slot(tb, (P.j * 13 + d) % 200, 11, 6, [J(30), J(31)]), p = [q[0], q[1], null], T = path([[-145, 0, null], p]);
        B.hide('the granary', h(7.2)); B.go('granary', 'gate', sp); B.walk(paths.breath, 0, 6, sp); B.walk(T, 0, T.L, sp); B.stand(p, J(38) * 6.28, h(11.3), 'work');
        B.walk(T, T.L, 0, sp); B.walk(paths.breath, 6, 0, sp); B.go('gate', 'refectory', sp); B.hide('the refectory', h(12.6));
        B.go('refectory', 'gate', sp); B.walk(paths.breath, 0, 6, sp); B.walk(T, 0, T.L, sp); B.stand(p, J(38) * 6.28, h(16.8), 'work'); B.walk(T, T.L, 0, sp); B.walk(paths.breath, 6, 0, sp); B.go('gate', 'granary', sp);
      } else if (o === 'porter') { if (P.j < 2) { B.hide('the porters\' loft', h(7)); B.stand([-88.5 + P.j * 3, -83.5, 4], -Math.PI / 2, h(18), 'stand'); }
        else { B.hide('the porters\' loft', h(10.9)); const p = slot([-110, -66, -84, -52], 20 + P.j, 2.5, 3, [J(39), J(40)]); B.go('g.mule', 'mulecourt', sp); B.to([p[0], p[1], 4], sp); B.stand([p[0], p[1], 4], J(41) * 6.28, h(12), 'work'); B.to(N.mc, sp); B.go('mulecourt', 'g.mule', sp); } }
      else if (o === 'cook' && P.group === 'lay' && P.j % 3 === 0) {   /* wood from the store, morning and afternoon */
        for (const hr of [9.2, 15.2]) { B.hide('the kitchen', h(hr + J(42) * 0.5)); B.go('kitchen', 'woodstore', sp); B.hide('the wood store', B.t + 240); B.go('woodstore', 'kitchen', sp * 0.8); }
      }
    }
    B.hide(home, h(28));
    cache.set(key, B.legs); if (cache.size > 4000) cache.delete(cache.keys().next().value);
    return B.legs;
  }

  /* ---- a pilgrim's day: up the Way of Shrines, three times round the lower kora, up to the Threshold Chorten and back, the
     Pilgrims' Court, the guest house; down the next morning. On the Station's day they fill the court and the chorten's ring */
  const qcache = new Map();
  function pplan(Q) {
    if (qcache.has(Q.id)) return qcache.get(Q.id);
    const d = Q.d, B = Plan(d), J = k => U(5, d, Q.i, k), sp = 0.8 + 0.3 * J(1), h = B.at, kE = koraAt('l28w'), shr = paths.shrines.L / SHRINES_M * sp * 0.75;
    const court = k => { const p = slot([-42.5, -19.5, 36, 84.5], k, 1.15, 1.2, [J(4), J(5)]); return [p[0], p[1], 0]; };
    const up = Q.station ? J(3) < 0.34 : J(3) < 0.75, END = paths.breath.P[paths.breath.P.length - 1];
    B.hide('the Stair of the Eye', h(Q.arrive)); B.walk(paths.shrines, 0, paths.shrines.L, shr, 0, { way: 'shrines' });
    B.go('gate.rift', 'l28w', sp); B.walk(paths.kora, kE, kE - H.rounds * paths.kora.L, sp * 0.9, (J(2) - 0.5) * 1.6);
    const toChorten = (stay) => { B.go('l28w', 'gate', sp); B.walk(paths.breath, 0, paths.breath.L, sp * 0.85); const r = ring(Q.i);
      B.to(r.p, sp); B.stand(r.p, r.h, stay(), J(7) < 0.3 ? 'sit' : 'stand'); B.to(END, sp); B.walk(paths.breath, paths.breath.L, 0, sp * 0.9); };
    if (Q.station) {
      if (up) { toChorten(() => h(H.pilgrimDown - 0.6) + J(6) * 600); B.go('gate', 'gate.rift', sp); }
      else { const p = court(Q.i); B.go('l28w', 'pilgrims', sp); B.to(p, sp); B.stand(p, Math.PI, h(H.pilgrimDown) + J(8) * 3600, J(9) < 0.4 ? 'sit' : 'stand'); B.to(N.pil, sp); B.go('pilgrims', 'gate.rift', sp); }
      if (Q.i < 60) { B.go('gate.rift', 'lip.guests', sp); B.hide('the guest house', h(31 + 2 * J(10))); B.go('lip.guests', 'gate.rift', sp); }
    } else {
      if (up) { toChorten(() => B.t + (15 + 10 * J(6)) * 60); B.go('gate', 'pilgrims', sp); } else B.go('l28w', 'pilgrims', sp);
      const p = court(Q.i * 11 % 600); B.to(p, sp); B.stand(p, Math.PI, Math.max(B.t + 600, h(16.5 + J(11))), J(12) < 0.5 ? 'sit' : 'stand'); B.to(N.pil, sp);
      B.go('pilgrims', 'lip.guests', sp); B.hide('the guest house', h(31 + 2 * J(10))); B.go('lip.guests', 'gate.rift', sp);
    }
    B.walk(paths.shrines, paths.shrines.L, 0, shr, 0, { way: 'shrines' });
    qcache.set(Q.id, B.legs); if (qcache.size > 2000) qcache.delete(qcache.keys().next().value);
    return B.legs;
  }

  /* ---- where, at t */
  function resolve(g, t, env) {
    if (g.hide) return { hidden: true, where: g.hide };
    if (g.T) { const s = g.d0 + g.sp * (t - g.t0), p = at(g.T, s, g.off), dir = g.sp < 0 ? -1 : 1;
      const out = { u: p.u, v: p.v, y: p.y, lift: 0, h: Math.atan2(p.dv * dir, p.du * dir), dir, act: 'walk', speed: Math.abs(g.sp) };
      if (g.way) { out.way = g.way; out.f = Math.max(0, Math.min(1, s / g.T.L)); }
      return out; }
    if (g.at) return { u: g.at[0], v: g.at[1], y: g.at[2], lift: g.lift == null ? 0 : g.lift, h: g.h, act: g.act };
    if (g.duty) {   /* the Rim Watch: the platform by day and in the basket's and the Opening's slots, else the watch room; the rim walked by day */
      const e = { day: env.day || DAYF, station: env.station || stationAt, clear: env.clear, message: env.message }, day = !!e.day(t);
      if (g.duty === 'asleep') return { hidden: true, where: 'the Watch\'s hut' };
      if (g.duty === 'platform') { const st = W.state(t, e), b = st.bearing == null ? 180 : st.bearing, a = b * Math.PI / 180;
        return day || st.mode === 'basket' || st.mode === 'opening' ? { u: POST[0] + 1.6, v: POST[1] - 1.2, y: null, lift: 12.5, h: Math.atan2(Math.sin(a), -Math.cos(a)), act: 'stand', where: 'the platform' } : { hidden: true, where: 'the watch room' }; }
      if (day) { const span = 260, m = ((t * 0.8) % (2 * span) + 2 * span) % (2 * span), out = m < span, s = OPEN0 - span / 2 + (out ? m : 2 * span - m), p = at(paths.open, s, 0), dir = out ? 1 : -1;
        return { u: p.u, v: p.v, y: null, lift: 0, h: Math.atan2(p.dv * dir, p.du * dir), act: 'walk', speed: 0.8, where: 'the rim' }; }
      return { u: POST[0] + 4.6, v: POST[1] + 1.5, y: null, lift: 0, h: 0, act: 'stand', where: 'the post\'s door' };
    }
    return { hidden: true, where: '?' };
  }
  function legAt(legs, t) { if (!legs.length || t < legs[0].t0 || t >= legs[legs.length - 1].t1) return null; let lo = 0, hi = legs.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (legs[m].t0 <= t) lo = m; else hi = m - 1; } return legs[lo].t1 > t ? legs[lo] : null; }
  function pose(P, t, env) {
    env = env || DEFENV; const legs = P.group === 'pilgrim' ? pplan(P) : plan(P, dayOf(t), env), g = legAt(legs, t);
    if (!g) return { hidden: true, where: P.group === 'pilgrim' ? 'away' : P.home };
    const o = resolve(g, t, env); if (o.where == null) o.where = null; return o;
  }
  function all(t, env) { const d = dayOf(t), out = []; for (const P of people) out.push([P, pose(P, t, env)]);
    for (const dd of [d - 1, d]) for (const Q of pilgrims(dd)) out.push([Q, pose(Q, t, env)]); return out; }

  return { people, pilgrims, stationNight, stationAt, dayOf, pose, at: all, plan, pplan, paths, route, N, PLACES, H, SHRINES_M, PROC, THR, POST, HUT, ring, OPEN0, BAL, path, pathAt: at, slot };
})();
if (typeof module !== 'undefined') module.exports = FE_PEOPLE;
