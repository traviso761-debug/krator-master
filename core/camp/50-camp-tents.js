/* ==================== core/camp 50: tents by role and culture, and the caravan halt (plain data, [G data]) ==================== */
/* The Tents kit (kits/tents) draws a culture-neutral tent catalog: def keys 'tn-<form>-<size>' (ridge, bell, yurt, cone, black,
   marquee, wedge, fly, awning, roundend, wagon, screen; s m l) and a DRESS per people. This file is the plain-data side a
   camp asks: which tent a role takes in a culture, and the program and culture row KCAMP.pitch and KCAMP.census read, so a
   band of any people can pitch tents by role. Nothing here draws, and nothing reads a kit's globals: the host passes the
   kit's boxes in (dims), as for the Beast Riders' camp.
     KCAMP.TENTS                    the table: ROLES (each role's camp kind and its workers), CULTURES (per culture: its dress
                                    and the def each role takes; trades overrides by trade), ALIAS (culture spellings), SIZES
     KCAMP.tentFor(role, o)         o: {culture, size?, trade?} -> {key (the def), role, trade, dress, kind, pkey}; an unknown
                                    culture takes the 'generic' row (.fallback names what was asked); a size the form lacks
                                    takes the nearest it has
     KCAMP.tentKey(key, role, trade) -> the program key 'tn-yurt-m@family' ('@workshop:smith' for a trade);
     KCAMP.tentParse(pkey)          -> {key, role, trade}
     KCAMP.tentProgram(o)           o: {id?, culture, households, sleeping, chief, council, trades: [...], supply, guard, mess,
                                    stable, latrine} -> {culture: the row's key ('tents:<culture>'), program: {tents, pens},
                                    row}; the row is registered in KCAMP.CULTURES, so KCAMP.pitch and KCAMP.census take it.
                                    Stables and the latrine are pens: outside the ring, downwind
     KCAMP.tentDims(dims)           -> dims(pkey, v) for KCAMP.pitch from the kit's dims(key): the box of the def, grown by
                                    the yard a role works in (a smith's trough and grindstone, a hidemaker's frames)
     KCAMP.halt(o)                  a caravan's night halt (PLAN.md 4, 'laager' and 'line'; 6.2): o: {id, world, culture,
                                    wagons, site: {x, z}, way: [x, z] (the road), formation: 'laager' (the wagons in a square,
                                    a gate on the road) | 'line' (along the road), dims(pkey, v), ground: {ok}, gap?, wind?}
                                    -> {id, site, formation, gate, records: [{id, key, v, kind, role, trade, x, z, ry, w, d, h}],
                                    short: [ids not pitched]}: the wagons, the house's marquee, the trade awnings, the mess fly,
                                    the guards' wedges at the gate, the picket line's fly and the latrine screen downwind */
(function () {
  'use strict';
  var T = KCAMP.TENTS = {version: 1};
  /* kind: what KCAMP.pitch and census call it (chief council shrine dwelling sleep trade, or pen); work: who works there */
  T.ROLES = {
    family: {kind: 'dwelling', households: 1}, sleeping: {kind: 'sleep'}, chief: {kind: 'chief', households: 1}, council: {kind: 'council'},
    workshop: {kind: 'trade', work: {role: 'artisan', n: 1}}, supply: {kind: 'trade', work: {role: 'quartermaster', n: 1}},
    trade: {kind: 'trade', work: {role: 'trader', n: 1}}, guard: {kind: 'trade', work: {role: 'guard', n: 2}},
    mess: {kind: 'dwelling', work: {role: 'cook', n: 2}}, stable: {kind: 'pen', work: {role: 'herder', n: 1}}, latrine: {kind: 'pen'}
  };
  T.TRADES = {smith: {kind: 'trade', work: 'smith'}, hide: {kind: 'trade', work: 'hidemaker'}, seer: {kind: 'shrine', work: 'shaman'}, weaver: {kind: 'trade', work: 'weaver'}};
  /* the yard a role works in, metres added round its box when it is pitched (its gear stands there) */
  T.YARD = {workshop: 3, trade: 1, mess: 2.5, stable: 1, chief: 2, supply: 1.5, guard: 1.5};
  T.FORM_SIZES = {ridge: 'sml', bell: 'sml', yurt: 'sml', cone: 'sml', black: 'ml', marquee: 'ml', wedge: 'sm', fly: 'ml', awning: 'm', roundend: 'ml', wagon: 'm', screen: 's'};
  /* per culture (the dress keys of kits/tents/src/41-tn-dress.js): the def each role takes ('<form>-<size>') */
  var row = function (dress, r, trades) { return {dress: dress, roles: r, trades: trades || {}}; };
  var base = {family: 'bell-m', sleeping: 'ridge-s', chief: 'marquee-l', council: 'marquee-m', workshop: 'ridge-m', supply: 'ridge-l',
    trade: 'awning-m', guard: 'wedge-m', mess: 'roundend-m', stable: 'fly-l', latrine: 'screen-s'};
  var over = function (o) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in o) r[k] = o[k]; return r; };
  T.CULTURES = {
    generic: row('generic', over({})),
    scyvoi: row('scyvoi', over({family: 'yurt-m', sleeping: 'yurt-s', chief: 'yurt-l'}), {seer: 'yurt-m'}),
    desert: row('desert', over({family: 'black-m', sleeping: 'black-m', chief: 'black-l', workshop: 'black-m', mess: 'black-m'}), {seer: 'bell-m'}),
    ash: row('ash', over({family: 'cone-m', sleeping: 'cone-l', chief: 'cone-l', workshop: 'cone-m', supply: 'ridge-m', trade: 'fly-m', guard: 'wedge-s'}), {seer: 'cone-m'}),
    'beast-rider': row('beast-rider', over({family: 'cone-m', sleeping: 'cone-l', chief: 'cone-l', council: 'bell-l', supply: 'ridge-m', mess: 'fly-l'}), {seer: 'cone-m'}),
    iziz: row('iziz', over({family: 'ridge-m', supply: 'wagon-m', mess: 'fly-l'}), {seer: 'bell-m'}),
    republican: row('republican', over({family: 'ridge-m', sleeping: 'ridge-m', chief: 'ridge-l', mess: 'roundend-l'}), {seer: 'ridge-s'}),
    xanadu: row('xanadu', over({sleeping: 'bell-m', workshop: 'bell-m'}), {seer: 'bell-m'}),
    islander: row('islander', over({family: 'ridge-m', chief: 'roundend-l', council: 'roundend-m', workshop: 'fly-l', supply: 'ridge-m', guard: 'wedge-s', mess: 'fly-l', stable: 'fly-m'}), {seer: 'bell-m'}),
    postapoc: row('postapoc', over({family: 'ridge-m', chief: 'roundend-m', workshop: 'fly-l', mess: 'fly-l'}), {seer: 'ridge-s'}),
    eternian: row('eternian', over({family: 'ridge-m'}), {seer: 'bell-m'})
  };
  T.ALIAS = {nomad: 'desert', 'desert-nomad': 'desert', 'desert-nomads': 'desert', ashnomad: 'ash', 'ash-nomad': 'ash', 'ash-nomads': 'ash',
    republic: 'republican', highlands: 'republican', rustic: 'republican', 'ringsea-islander': 'islander', islanders: 'islander', hykkousoi: 'islander',
    'post-apoc': 'postapoc', scrap: 'postapoc', screamer: 'postapoc', 'beast-riders': 'beast-rider', beastriders: 'beast-rider', lizardmen: 'beast-rider',
    izani: 'iziz', talia: 'iziz', pylon: 'iziz', eternians: 'eternian', sultanate: 'xanadu'};
  var rowOf = function (c) { var k = c == null ? 'generic' : String(c); return T.CULTURES[k] ? k : T.CULTURES[T.ALIAS[k]] ? T.ALIAS[k] : null; };
  var nearSize = function (form, size) {
    var have = T.FORM_SIZES[form] || 'm';
    if (size && have.indexOf(size) >= 0) return size;
    var order = {s: ['s', 'm', 'l'], m: ['m', 's', 'l'], l: ['l', 'm', 's']}[size || 'm'] || ['m', 's', 'l'];
    for (var i = 0; i < order.length; i++) if (have.indexOf(order[i]) >= 0) return order[i];
    return have.charAt(0);
  };
  KCAMP.tentKey = function (key, role, trade) { return key + '@' + role + (trade ? ':' + trade : ''); };
  KCAMP.tentParse = function (pkey) {
    var m = /^([^@]+)@([a-z]+)(?::([a-z]+))?$/.exec(pkey || '');
    return m ? {key: m[1], role: m[2], trade: m[3] || null} : {key: pkey, role: null, trade: null};
  };
  KCAMP.tentFor = function (role, o) {
    o = o || {};
    var rk = rowOf(o.culture), R = T.CULTURES[rk || 'generic'], trade = o.trade || null;
    var fs = (trade && R.trades[trade]) || R.roles[role] || base[role];
    if (!fs) return null;
    var p = fs.split('-'), form = p[0], size = nearSize(form, o.size || p[1]), key = 'tn-' + form + '-' + size;
    var kind = trade && T.TRADES[trade] ? T.TRADES[trade].kind : (T.ROLES[role] || {}).kind || 'dwelling';
    var out = {key: key, role: role, trade: trade, dress: R.dress, kind: kind, pkey: KCAMP.tentKey(key, role, trade)};
    if (!rk) out.fallback = o.culture == null ? null : String(o.culture);
    return out;
  };
  KCAMP.tentProgram = function (o) {
    var c = rowOf(o.culture) || 'generic', rk = 'tents:' + c, tents = [], pens = [], add = function (L, role, n, trade) {
      if (!n) return;
      var t = KCAMP.tentFor(role, {culture: c, trade: trade, size: o.size && o.size[role]});
      for (var i = 0; i < L.length; i++) if (L[i].key === t.pkey) { L[i].n += n; return; }
      L.push({key: t.pkey, n: n, v: 0});
    };
    if (o.chief !== false) add(tents, 'chief', 1);
    if (o.council) add(tents, 'council', 1);
    add(tents, 'family', o.households == null ? 5 : o.households);
    add(tents, 'sleeping', o.sleeping == null ? 1 : o.sleeping);
    (o.trades || []).forEach(function (tr) { add(tents, 'workshop', 1, tr); });
    add(tents, 'supply', o.supply == null ? 1 : o.supply);
    add(tents, 'trade', o.trade == null ? 0 : o.trade);
    add(tents, 'guard', o.guard == null ? 1 : o.guard);
    add(tents, 'mess', o.mess == null ? 0 : o.mess);
    add(pens, 'stable', o.stable == null ? 1 : o.stable);
    add(pens, 'latrine', o.latrine == null ? 1 : o.latrine);
    var kindOf = function (pkey) {
      var q = KCAMP.tentParse(pkey);
      if (q.trade && T.TRADES[q.trade]) return T.TRADES[q.trade].kind;
      return T.ROLES[q.role] ? T.ROLES[q.role].kind : null;
    };
    var households = {}, work = {};
    tents.concat(pens).forEach(function (e) {
      var q = KCAMP.tentParse(e.key), R = T.ROLES[q.role];
      if (R && R.households) households[e.key] = R.households;
      if (q.trade && T.TRADES[q.trade]) work[e.key] = {role: T.TRADES[q.trade].work, n: 1};
      else if (R && R.work) work[e.key] = {role: R.work.role, n: R.work.n};
    });
    var rowRec = {kind: kindOf, households: households, household: [5, 8], chiefHousehold: [6, 9], sleepers: [6, 10], work: work,
      elderShare: 0.4, mountsPer: 1, wind: o.wind || [0.7071, 0.7071], formation: o.formation || 'ring', tents: c};
    KCAMP.CULTURES[rk] = rowRec;
    return {culture: rk, program: {tents: tents, pens: pens}, row: rowRec};
  };
  KCAMP.tentDims = function (dims) {
    return function (pkey, v) {
      var q = KCAMP.tentParse(pkey), D = dims(q.key, v);
      if (!D) return null;
      var y = T.YARD[q.role] == null ? 0 : T.YARD[q.role];
      return {w: D.w + y, d: D.d + y, h: D.h};
    };
  };

  /* ---- the caravan halt: wagons in a square round the house's marquee (a laager), or parked along the road (a line) */
  KCAMP.halt = function (o) {
    var c = rowOf(o.culture) || 'generic', id = o.id, GAP = o.gap == null ? 1.2 : o.gap, form = o.formation || 'laager';
    var ok = (o.ground && o.ground.ok) || function () { return true; }, site = {x: o.site.x, z: o.site.z};
    var way = o.way || [0, 1], L = Math.max(1e-9, Math.hypot(way[0], way[1])), u = [way[0] / L, way[1] / L], v = [-u[1], u[0]];
    var wind = o.wind || [0.7071, 0.7071], WL = Math.max(1e-9, Math.hypot(wind[0], wind[1])); wind = [wind[0] / WL, wind[1] / WL];
    var space = KSPACE.create({cell: 16}), placed = [], short = [], seen = {};
    var rec = function (role, trade, x, z, ry, tent) {
      var t = tent || (role === 'wagon' ? {key: 'tn-wagon-m', pkey: KCAMP.tentKey('tn-wagon-m', 'supply'), kind: 'trade'} : KCAMP.tentFor(role, {culture: c, trade: trade}));
      var D = o.dims(t.pkey, 0) || {w: 4, d: 4, h: 3}, j = seen[t.pkey] == null ? 0 : seen[t.pkey];
      return {id: id + ':' + t.pkey + ':' + j, key: t.pkey, def: t.key, v: 0, kind: t.kind, role: role === 'wagon' ? 'supply' : role, trade: trade || null,
        x: x, z: z, ry: ry, w: D.w, d: D.d, h: D.h};
    };
    var fits = function (r) {
      var B = KCAMP.box(r, 0);
      for (var i = 0; i < 4; i++) if (!ok(B[i][0], B[i][1])) return false;
      if (!ok(r.x, r.z)) return false;
      return !space.some(r.x, r.z, Math.hypot(r.w, r.d) / 2 + GAP + 12, function (q) { return KCAMP.overlaps(r, q, GAP); });
    };
    var put = function (r) { seen[r.key] = (seen[r.key] == null ? 0 : seen[r.key]) + 1; placed.push(r); space.insert(r, r.x, r.z, Math.hypot(r.w, r.d) / 2); return r; };
    /* try a record at its spot, then nudged outward from the site and along, in a fixed order (no draw decides) */
    var tryPut = function (role, trade, x, z, ry, out, tent) {
      var nud = [[0, 0], [1.5, 0], [0, 1.5], [0, -1.5], [3, 0], [3, 2], [3, -2], [5, 0], [7, 0], [9, 0]];
      out = out || [0, 1];
      for (var k = 0; k < nud.length; k++) {
        var r = rec(role, trade, x + out[0] * nud[k][0] - out[1] * nud[k][1], z + out[1] * nud[k][0] + out[0] * nud[k][1], ry, tent);
        if (fits(r)) return put(r);
      }
      var r0 = rec(role, trade, x, z, ry, tent); short.push(r0.id); seen[r0.key] = (seen[r0.key] == null ? 0 : seen[r0.key]) + 1; return null;
    };
    var tryPutT = function (t, x, z, ry, out) { return tryPut(t.role, t.trade, x, z, ry, out, t); };
    var at = function (a, b) { return [site.x + u[0] * a + v[0] * b, site.z + u[1] * a + v[1] * b]; };   /* a along the road (toward the way), b across */
    var yawOf = function (d) { return Math.atan2(d[0], d[1]); };   /* the ry that turns a record's +z (its front) to d */
    var mess = KCAMP.tentFor('mess', {culture: c, size: 'm'});
    var GD = o.dims(KCAMP.tentFor('guard', {culture: c}).pkey, 0) || {w: 4, d: 6};   /* the guards' tent's box */   /* a caravan's mess is a medium one, whatever its people's camp mess is */
    var nW = o.wagons == null ? 6 : o.wagons, W0 = o.dims(KCAMP.tentKey('tn-wagon-m', 'supply'), 0) || {w: 2.5, d: 6};
    var gate = null;
    if (form === 'line') {
      /* wagons nose to tail on the right of the road, their shafts toward the way; awnings across the road from every other one */
      var step = W0.d + GAP + 0.4, half = (nW - 1) / 2, side = 3 + W0.w / 2;
      for (var i = 0; i < nW; i++) { var p = at((i - half) * step, side); tryPut('wagon', null, p[0], p[1], yawOf(u), v); }
      for (var a = 0; a < Math.ceil(nW / 2); a++) { var q = at((a * 2 - half) * step, -6); tryPut('trade', null, q[0], q[1], yawOf(v), [-v[0], -v[1]]); }
      var hd = at((half + 1) * step + 6, side + 2); tryPut('chief', null, hd[0], hd[1], yawOf([-v[0], -v[1]]), u);
      var ms = at(0, side + W0.w / 2 + 9); tryPutT(mess, ms[0], ms[1], yawOf([-v[0], -v[1]]), v);
      [-1, 1].forEach(function (s) { var g = at(s * ((half + 1) * step + 2), -Math.max(5, GD.d / 2 + 1)); tryPut('guard', null, g[0], g[1], yawOf([s * u[0], s * u[1]]), [s * u[0], s * u[1]]); });
      gate = {x: site.x, z: site.z};
    } else {
      /* the laager: the wagons round a square, their long sides along it; the gate on the side toward the way */
      /* the square holds the wagons round it and the house's pavilion, the mess and the stalls inside */
      var HD = o.dims(KCAMP.tentFor('chief', {culture: c, size: 'm'}).pkey, 0) || {w: 10, d: 10};
      var lw = W0.d + GAP + 0.6, sideL = Math.max(16, Math.ceil((nW + 1.5) / 4) * lw + 4, Math.max(HD.w, HD.d) + 2 * W0.w + 16), hs = sideL / 2;
      var edges = [[u, v], [v, [-u[0], -u[1]]], [[-u[0], -u[1]], [-v[0], -v[1]]], [[-v[0], -v[1]], u]];   /* [outward normal, along] */
      var slots = [];
      edges.forEach(function (E, ei) {
        var n = E[0], t = E[1], cap = Math.floor((sideL - 3) / lw);
        for (var k = 0; k < cap; k++) {
          var off = (k - (cap - 1) / 2) * lw;
          if (ei === 0 && Math.abs(off) < lw * 0.75) continue;   /* the gate: the middle of the side toward the way */
          slots.push({x: site.x + n[0] * hs + t[0] * off, z: site.z + n[1] * hs + t[1] * off, ry: yawOf(t), n: n, ord: ei * 100 + k});
        }
      });
      /* filled side by side from the gate's side round, so a short train leaves the back open */
      for (var w = 0; w < nW; w++) {
        var S = slots[w];
        if (!S) { var r1 = rec('wagon', null, site.x, site.z, 0); short.push(r1.id); seen[r1.key] = (seen[r1.key] == null ? 0 : seen[r1.key]) + 1; continue; }
        tryPut('wagon', null, S.x, S.z, S.ry, S.n);
      }
      var g0 = at(hs, 0); gate = {x: g0[0], z: g0[1]};
      var hm = at(-hs + W0.w + HD.d / 2 + 1.5, 0); tryPutT(KCAMP.tentFor('chief', {culture: c, size: 'm'}), hm[0], hm[1], yawOf(u), [-u[0], -u[1]]);
      var mf = at(-hs * 0.15, -hs * 0.45); tryPutT(mess, mf[0], mf[1], yawOf(v), [-v[0], -v[1]]);
      [-1, 1].forEach(function (s) { var aw = at(hs * 0.6, s * hs * 0.4);   /* toward the gate: a long mess (a round-ended tent) clears them */ tryPut('trade', null, aw[0], aw[1], yawOf([-s * v[0], -s * v[1]]), [s * v[0], s * v[1]]); });
      /* the guards' tents either side of the gate, clear of each other and the wagons */
      [-1, 1].forEach(function (s) { var g = at(Math.max(hs + 4.5, hs + W0.w / 2 + GAP + GD.d / 2), s * Math.max(5, GD.w / 2 + GAP)); tryPut('guard', null, g[0], g[1], yawOf(u), u); });
      /* the picket line behind, the latrine downwind, both outside the wagons */
      var pk = at(-hs - 6, 0); tryPut('stable', null, pk[0], pk[1], yawOf([-u[0], -u[1]]), [-u[0], -u[1]]);
    }
    var lt = [site.x + wind[0] * (form === 'line' ? 22 : hs + 9), site.z + wind[1] * (form === 'line' ? 22 : hs + 9)];
    tryPut('latrine', null, lt[0], lt[1], yawOf([-wind[0], -wind[1]]), wind);
    return {id: id, site: site, formation: form, culture: c, gate: gate, way: u, wind: wind, records: placed, short: short};
  };
})();
