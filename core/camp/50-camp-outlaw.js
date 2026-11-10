/* ==================== core/camp 50: outlaw bands, their size and their lookouts (plain data, [G data]) ==================== */
/* Mid Basin's Yuni outlaws (biomes/midbasin/PLAN.md section 5, amendment 4) and the north-western bandits (PLAN.md section
   3: a war-camp row each): small bands of 10-30 that camp out of sight of the road they prey on, with a lookout that sees
   it. Opt-in: the census is wrapped only for a row with `band`; every other row answers bit for bit as before (the
   wrapper hands it to the census of 20-camp-census.js, kept as KCAMP.census.base).
     KCAMP.CULTURES.outlaw        a generic war-camp row: a leader's tent, a few family tents, sleeping tents and lean-tos,
                                  a loot cache, a mount line; band [10, 30]; every key pending with a box (no Yuni camp kit
                                  exists: a kit's row names the same keys, or its own with the same kinds)
     row.band [min, max]          the band's people, drawn once from its seed (KRAND.hash of the band's seed, never draw
                                  order); the program's dwellings are dealt as the census deals them, a household dropped
                                  from the end while the band is too big, sleepers dealt round the sleeping tents (then the
                                  leader's household) until it is big enough. `empty` lists the tents no one sleeps in
     row.idle [[role, share]...]  what the adults with no workshop do (default the census's hunter / gatherer)
     KCAMP.dimsOf(culture, dims)  a dims(key, v) that answers from the host's boxes, then the row's pending ones
     KCAMP.lookout(o) -> ranked lookout records {id, kind 'lookout', band, x, z, y, sees, seen, skyline, cover, score}
       o: {road [[x, z]...], ground (x, z) -> h, cover? (x, z) -> 0..1 (brush, rocks at the spot), box {x0, z0, x1, z1} or
           candidates [[x, z]...], ok? (x, z) -> bool, eye (1.6), target (1.6: a rider's eye on the road), reach (600 m),
           grid (20 m), step (10 m along the road), roadGap (30 m), minGap (80 m between those returned), n (3), world, id}
       sees     the share of the road's samples the lookout's eye sees within reach (ray-marched over the heightfield)
       seen     the share of them from which a watcher on the road would pick it out: in sight, and against the sky (the
                ground beyond it, along the line from the road, never rises above that line: skylined) or, against the
                ground behind it, by T.ground x (1 - cover): a man with ground behind him is half as easy to see, and one
                in full cover not at all
       score    sees x (1 - seen): it sees most of the road and is not seen from it. Line of sight is symmetric; the
                asymmetry is the cover at the lookout and the sky behind it
     KCAMP.lookoutAt(o, x, z)     the same record for one point
     KCAMP.outlawCamp(o) -> {id, culture, census, lookouts, site, camp, error?}: the band's census (its row's band), its
       lookouts, a hidden site (no line of sight from the road to a tent's top at the site or round it, T.campGap from the
       road, within T.lookReach of the best lookout, nearest it; o.water [{x, z}] pulls it toward water) and KCAMP.pitch
       there with no pasture and no hedge, its way in toward the lookout; the census's empty tents left unpitched; two
       of the band's idle adults posted to each lookout (role 'lookout', work its id) */
(function () {
  'use strict';
  KCAMP.CULTURES.outlaw = {
    kind: function (k) {
      if (/^ol_tent_chief/.test(k)) return 'chief';
      if (/^ol_tent_family/.test(k)) return 'dwelling';
      if (/^ol_(tent|leanto)$/.test(k)) return 'sleep';
      if (/^ol_cache/.test(k)) return 'council';        /* the loot cache, kept by the leader's tent (pitch's council slot) */
      if (/^ol_forge/.test(k)) return 'trade';
      if (/^ol_(pen|mount_line)/.test(k)) return 'pen';
      return null;
    },
    households: {ol_tent_chief: 1, ol_tent_family: 1},
    household: [3, 5], chiefHousehold: [3, 6], sleepers: [2, 3],
    work: {ol_cache: {role: 'quartermaster', n: 1}, ol_forge: {role: 'smith', n: 1}, ol_pen: {role: 'horseboy', n: 1}, ol_mount_line: {role: 'horseboy', n: 1}},
    elderShare: 0.08, mountsPer: 0.6, wind: [0.7071, 0.7071], formation: 'ring',
    band: [10, 30], idle: [['raider', 0.75], ['scout', 0.25]],
    program: {tents: [{key: 'ol_tent_chief', n: 1}, {key: 'ol_tent_family', n: 2}, {key: 'ol_tent', n: 3}, {key: 'ol_leanto', n: 5}, {key: 'ol_cache', n: 1}],
              pens: [{key: 'ol_mount_line', n: 1}]},
    pending: {
      ol_tent_chief: {w: 6, d: 5, h: 3, what: 'the leader\'s tent'},
      ol_tent_family: {w: 4.5, d: 4.5, h: 2.6, what: 'a family\'s tent'},
      ol_tent: {w: 3.5, d: 3, h: 2.2, what: 'a sleeping tent'},
      ol_leanto: {w: 3.2, d: 2.4, h: 1.8, what: 'a lean-to over bedrolls'},
      ol_cache: {w: 3, d: 3, h: 1.6, what: 'the loot cache under hides'},
      ol_forge: {w: 4, d: 4, h: 2.6, what: 'a field forge'},
      ol_pen: {w: 14, d: 10, h: 1.4, what: 'a brush pen'},
      ol_mount_line: {w: 14, d: 6, h: 1.6, what: 'a picket line for the mounts'}
    }
  };
  KCAMP.LOOKOUT_TUNE = {eye: 1.6, target: 1.6, reach: 600, grid: 20, step: 10, march: 4, behind: 1500, ground: 0.5, roadGap: 30, minGap: 80, n: 3,
                        campH: 3, campR: 18, campGap: 150, lookReach: 500};

  KCAMP.dimsOf = function (culture, dims) {
    return function (key, v) {
      var d = dims ? dims(key, v) : null;
      if (d) return d;
      var C = KCAMP.CULTURES[culture];
      return C && C.pending && C.pending[key] ? C.pending[key] : null;
    };
  };

  /* ---------------------------------------------------------------- the census, sized by the row's band */
  var bandCensus = function (o, C) {
    var seed = KCAMP.seedOf(o.world, o.id), u = function () { return KRAND.unit(KRAND.hash.apply(null, [seed].concat([].slice.call(arguments)))); };
    var span = function (r, a, b) { return r[0] + Math.floor(u(a, b) * (r[1] - r[0] + 1)); };
    var lo = C.band[0], hi = C.band[1], target = lo + Math.floor(u(7, 0x0B) * (hi - lo + 1));
    var T = KCAMP.tentIds(o.id, o.program), H = [];
    T.forEach(function (t, ti) {
      var k = C.kind(t.key), nh = C.households[t.key];
      if ((k !== 'dwelling' && k !== 'chief') || !nh) return;
      for (var h = 0; h < nh; h++) {
        var chief = k === 'chief';
        H.push({tent: t.id, ti: ti, h: h, chief: chief, size: span(chief ? C.chiefHousehold : C.household, 1, ti * 4 + h)});
      }
    });
    H.sort(function (a, b) { return (b.chief - a.chief) || a.ti - b.ti || a.h - b.h; });
    var total = function () { return H.reduce(function (s, x) { return s + x.size; }, 0); };
    /* too many: drop households from the end (never the leader's), then shrink the leader's to fit */
    while (total() > target && H.length > 1) H.pop();
    if (total() > target && H.length) H[0].size = Math.max(1, target);
    /* too few: sleepers round the sleeping tents (to their cap, then over it), else into the leader's household */
    var sleepT = T.filter(function (t) { return C.kind(t.key) === 'sleep'; }), slept = sleepT.map(function () { return 0; }), left = target - total();
    for (var pass = 0; left > 0 && sleepT.length && pass < 100; pass++) {
      for (var s = 0; s < sleepT.length && left > 0; s++) if (pass > 0 || slept[s] < C.sleepers[1]) { slept[s]++; left--; }
    }
    if (left > 0 && H.length) H[0].size += left;
    var households = [], people = [];
    var person = function (hh, tent, age) { var p = {id: o.id + ':p' + people.length, household: hh, tent: tent, age: age, role: null, work: null}; people.push(p); return p; };
    H.forEach(function (x) {
      var hid = o.id + ':h' + households.length, elder = u(2, x.ti * 4 + x.h) < C.elderShare ? 1 : 0;
      households.push({id: hid, tent: x.tent, size: x.size, chief: x.chief});
      for (var m = 0; m < x.size; m++) {
        var p = person(hid, x.tent, m < 2 ? 'adult' : m < 2 + elder ? 'elder' : (m === x.size - 1 && u(3, x.ti * 4 + x.h) < 0.5) ? 'adult' : 'child');
        if (x.chief && m === 0) p.role = 'chief';
      }
    });
    sleepT.forEach(function (t, s) { for (var m = 0; m < slept[s]; m++) person(null, t.id, 'adult'); });
    var free = function () { return people.filter(function (p) { return p.age === 'adult' && !p.role; }); };
    T.forEach(function (t, ti) {
      var w = C.work[t.key];
      if (!w) return;
      for (var m = 0; m < w.n; m++) { var F = free(); if (!F.length) return; var p = F[Math.floor(u(5, ti, m) * F.length)]; p.role = w.role; p.work = t.id; }
    });
    var idle = C.idle, tot = idle ? idle.reduce(function (s2, r) { return s2 + r[1]; }, 0) : 0;
    people.forEach(function (p, i) {
      if (p.role) return;
      if (p.age !== 'adult') { p.role = p.age; return; }
      if (!idle) { p.role = u(6, i) < 0.55 ? 'hunter' : 'gatherer'; return; }
      var r = u(6, i) * tot;
      for (var k = 0; k < idle.length; k++) { r -= idle[k][1]; if (r < 0 || k === idle.length - 1) { p.role = idle[k][0]; break; } }
    });
    var lived = {}; people.forEach(function (p) { lived[p.tent] = true; });
    var empty = T.filter(function (t) { var k = C.kind(t.key); return (k === 'chief' || k === 'dwelling' || k === 'sleep') && !lived[t.id]; }).map(function (t) { return t.id; });
    var adults = people.filter(function (p) { return p.age === 'adult'; }).length, riders = people.filter(function (p) { return p.age === 'adult' && p.role !== 'shaman'; }).length;
    return {pop: people.length, adults: adults, children: people.filter(function (p) { return p.age === 'child'; }).length,
      elders: people.filter(function (p) { return p.age === 'elder'; }).length, riders: riders, mounts: Math.round(riders * C.mountsPer),
      households: households, people: people, band: [lo, hi], target: target, empty: empty};
  };
  if (!KCAMP.census.base) {
    var base = KCAMP.census;
    KCAMP.census = function (o) {
      var C = KCAMP.CULTURES[o.culture];
      return C && C.band != null ? bandCensus(o, C) : base(o);
    };
    KCAMP.census.base = base;
  }

  /* ---------------------------------------------------------------- sight over the heightfield */
  var T = KCAMP.LOOKOUT_TUNE;
  var sight = function (g, ax, az, ay, bx, bz, by, march) {
    var d = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(d / march));
    for (var k = 1; k < n; k++) { var t = k / n; if (g(ax + (bx - ax) * t, az + (bz - az) * t) > ay + (by - ay) * t) return false; }
    return true;
  };
  /* from the road's eye through the lookout's head: does the ground beyond it rise above the line (no: against the sky) */
  var skylined = function (g, rx, rz, ry, lx, lz, ly, behind, march) {
    var d = Math.hypot(lx - rx, lz - rz) || 1, ux = (lx - rx) / d, uz = (lz - rz) / d, slope = (ly - ry) / d;
    for (var s = march; s <= behind; s += march * (s < 200 ? 1 : 4)) if (g(lx + ux * s, lz + uz * s) >= ly + slope * s) return false;
    return true;
  };
  var resample = function (road, step) {
    var out = [];
    for (var i = 0; i + 1 < road.length; i++) {
      var a = road[i], b = road[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step - 1e-9));
      for (var k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    if (road.length) out.push(road[road.length - 1]);
    return out;
  };
  var roadDist = function (road, x, z) {
    var best = 1e18;
    for (var i = 0; i + 1 < road.length; i++) {
      var a = road[i], b = road[i + 1], ex = b[0] - a[0], ez = b[1] - a[1], L2 = ex * ex + ez * ez || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * ex + (z - a[1]) * ez) / L2));
      best = Math.min(best, Math.hypot(x - a[0] - ex * t, z - a[1] - ez * t));
    }
    return road.length === 1 ? Math.hypot(x - road[0][0], z - road[0][1]) : best;
  };
  var opt = function (o, k) { return o[k] == null ? T[k] : o[k]; };
  var candidatesOf = function (o, grid) {
    if (o.candidates) return o.candidates.map(function (c) { return Array.isArray(c) ? [c[0], c[1]] : [c.x, c.z]; });
    var B = o.box, out = [];
    if (!B) return out;
    for (var x = B.x0; x <= B.x1 + 1e-9; x += grid) for (var z = B.z0; z <= B.z1 + 1e-9; z += grid) out.push([x, z]);
    return out;
  };

  KCAMP.lookoutAt = function (o, x, z, samples) {
    var g = o.ground, eye = opt(o, 'eye'), tgt = opt(o, 'target'), reach = opt(o, 'reach'), march = opt(o, 'march'), behind = opt(o, 'behind');
    var R = samples || resample(o.road, opt(o, 'step')), y = g(x, z), ly = y + eye, cov = o.cover ? Math.max(0, Math.min(1, +o.cover(x, z))) : 0;
    var sees = 0, seen = 0, sky = 0;
    for (var i = 0; i < R.length; i++) {
      var rx = R[i][0], rz = R[i][1];
      if (Math.hypot(rx - x, rz - z) > reach) continue;
      var ry = g(rx, rz) + tgt;
      if (!sight(g, x, z, ly, rx, rz, ry, march)) continue;
      sees++;
      if (skylined(g, rx, rz, ry, x, z, ly, behind, march)) { sky++; seen += 1; } else seen += T.ground * (1 - cov);
    }
    var n = R.length || 1;
    return {id: (o.id == null ? 'lookout' : o.id) + ':lookout:' + Math.round(x) + ':' + Math.round(z), kind: 'lookout', band: o.id == null ? null : o.id,
            x: x, z: z, y: y, sees: sees / n, seen: seen / n, skyline: sees ? sky / sees : 0, cover: cov, score: (sees / n) * (1 - seen / n)};
  };
  KCAMP.lookout = function (o) {
    var R = resample(o.road, opt(o, 'step')), gapR = opt(o, 'roadGap'), seed = KRAND.child(o.world == null ? 0 : o.world, 'lookout:' + (o.id == null ? '' : o.id));
    var all = [];
    candidatesOf(o, opt(o, 'grid')).forEach(function (c) {
      if (o.ok && !o.ok(c[0], c[1])) return;
      if (roadDist(o.road, c[0], c[1]) < gapR) return;
      var L = KCAMP.lookoutAt(o, c[0], c[1], R);
      if (L.sees > 0) { L.tie = KRAND.hash(seed, Math.round(c[0]), Math.round(c[1])); all.push(L); }
    });
    /* ranked by score (to 1e-9, so a moved world ranks the same), then by a hash of the spot, never by scan order */
    all.sort(function (a, b) { return (Math.round(b.score * 1e9) - Math.round(a.score * 1e9)) || (a.tie - b.tie) || a.x - b.x || a.z - b.z; });
    var out = [], n = opt(o, 'n'), mg = opt(o, 'minGap');
    for (var i = 0; i < all.length && out.length < n; i++) {
      var L = all[i];
      if (out.some(function (q) { return Math.hypot(q.x - L.x, q.z - L.z) < mg; })) continue;
      delete L.tie; out.push(L);
    }
    return out;
  };

  /* ---------------------------------------------------------------- the camp: out of sight, near its lookout */
  var hiddenFrom = function (o, R, x, z) {
    var g = o.ground, tgt = opt(o, 'target'), h = opt(o, 'campH'), rr = opt(o, 'campR'), reach = opt(o, 'reach') * 1.5, march = opt(o, 'march');
    var pts = [[x, z], [x + rr, z], [x - rr, z], [x, z + rr], [x, z - rr]];
    for (var p = 0; p < pts.length; p++) {
      var top = g(pts[p][0], pts[p][1]) + h;
      for (var i = 0; i < R.length; i++) {
        if (Math.hypot(R[i][0] - pts[p][0], R[i][1] - pts[p][1]) > reach) continue;
        if (sight(g, R[i][0], R[i][1], g(R[i][0], R[i][1]) + tgt, pts[p][0], pts[p][1], top, march)) return false;
      }
    }
    return true;
  };
  KCAMP.outlawCamp = function (o) {
    var culture = o.culture == null ? 'outlaw' : o.culture, C = KCAMP.CULTURES[culture];
    if (!C) return {id: o.id, error: 'no culture row ' + culture};
    var program = o.program || C.program, ok = (o.ground && o.ground.ok) || function () { return true; };
    var hfn = o.ground && o.ground.h ? o.ground.h : o.groundH;
    if (typeof hfn !== 'function') return {id: o.id, error: 'an outlaw camp needs ground.h(x, z)'};
    var census = KCAMP.census({id: o.id, world: o.world, culture: culture, program: program});
    var lo = Object.assign({}, o, {ground: hfn, ok: ok, n: o.lookouts == null ? 2 : o.lookouts});
    var looks = KCAMP.lookout(lo);
    if (!looks.length) return {id: o.id, culture: culture, census: census, lookouts: [], error: 'no lookout in the box sees the road'};
    var R = resample(o.road, opt(o, 'step')), L0 = looks[0], seed = KCAMP.seedOf(o.world, o.id), best = null;
    candidatesOf(o, opt(o, 'grid')).forEach(function (c) {
      var x = c[0], z = c[1], dl = Math.hypot(x - L0.x, z - L0.z);
      if (dl > opt(o, 'lookReach') || !ok(x, z) || roadDist(o.road, x, z) < opt(o, 'campGap')) return;
      if (!hiddenFrom(lo, R, x, z)) return;
      var dw = o.water && o.water.length ? Math.min.apply(null, o.water.map(function (w) { return Math.hypot(w.x - x, w.z - z); })) : 0;
      var sc = Math.round((dl + 0.5 * dw) * 1000), tie = KRAND.hash(seed, Math.round(x), Math.round(z));
      if (!best || sc < best.sc || (sc === best.sc && tie < best.tie)) best = {x: x, z: z, sc: sc, tie: tie};
    });
    if (!best) return {id: o.id, culture: culture, census: census, lookouts: looks, error: 'no ground out of sight of the road within reach of a lookout'};
    var way = [L0.x - best.x, L0.z - best.z], dims = KCAMP.dimsOf(culture, o.dims);
    var prog = {tents: program.tents, pens: program.pens || []};
    var camp = KCAMP.pitch({id: o.id, world: o.world, culture: culture, program: prog, site: {x: best.x, z: best.z}, dims: dims, ground: {ok: ok}, way: way});
    var empty = {}; (census.empty || []).forEach(function (id) { empty[id] = true; });
    camp.unpitched = camp.records.filter(function (r) { return empty[r.id]; }).map(function (r) { return r.id; });
    camp.records = camp.records.filter(function (r) { return !empty[r.id]; });
    camp.records.forEach(function (r) { r.pending = !!(C.pending && C.pending[r.key] && !(o.dims && o.dims(r.key, r.v))); });
    /* the watch: two idle adults a lookout, drawn by hash */
    var idleRoles = (C.idle || [['hunter'], ['gatherer']]).map(function (r) { return r[0]; });
    var pool = census.people.filter(function (p) { return idleRoles.indexOf(p.role) >= 0; })
      .map(function (p, i) { return {p: p, k: KRAND.hash(seed, 9, i)}; }).sort(function (a, b) { return a.k - b.k; });
    looks.forEach(function (L, li) { for (var m = 0; m < 2; m++) { var q = pool[li * 2 + m]; if (q) { q.p.role = 'lookout'; q.p.work = L.id; } } });
    return {id: o.id, culture: culture, census: census, lookouts: looks, site: {x: best.x, z: best.z, y: hfn(best.x, best.z)}, camp: camp};
  };
})();
