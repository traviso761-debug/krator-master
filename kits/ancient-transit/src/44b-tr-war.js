// ================================================================= ANCIENT TRANSIT — the war along a street  [G data]
// The owner (2026-11-08): "various levels of cratering and strewn wreckage, ranging from 'bombed to smithereens' to 'a riot broke out here'
// and points in between; also a version with abandoned military positions: sandbags, sentry posts, etc." along the roads. One number,
// `damage` 0..1 (or a function of s along the street), sets the level: 0.1 to 0.3 a riot (scorch marks of fires, glass and cable, bins and
// benches overturned and burnt, barricades of street furniture dragged across the road), 0.3 to 0.7 shelled (craters in the road and the
// pavement with rims of rubble and slabs thrown, more of everything), 0.7 to 1 bombed to smithereens (craters overlapping, the road torn,
// rubble everywhere, nothing standing). `military` adds abandoned positions: checkpoints (barriers staggered across the road, a boom, a sentry
// hut, sandbags, wire), emplacements (a sandbag U facing the road, tank traps, wire) and posts (a watchtower, sandbags, wire), in the kit's
// ruin states. The craters are records the host carves into its ground (KTRANSIT.craterH); the dress reads the war to keep off them.
//
//   KTRANSIT.war(street, o) -> W     street {id, pts, width, ground}; o.damage (0..1 or fn(s)), o.military (false | true | a share of the slots),
//                                    o.blockades (true: every 250-400 m; or [s...]): barricades of wrecked vehicles across the road (W.blockades,
//                                    KTRANSIT.blockade: {id, s, x, z, yaw, y, wide, r, rows, vehicles: [{id, key, variant, seed, state, x, z, y, yaw, roll, lat, ext (half its
//                                    extent across the way), along, row, across (turned side-on), w, d, h}]}),
//                                    o.positions [s...] (positions here, a checkpoint each: a crossing), o.network and o.road (a KTRANSIT.network and this
//                                    street's index in it: no piece inside a junction, no barricade or position drawn by hash near one), o.seed, o.step (a slot every 10 m)
//     W = {id, path, damageAt(s), craters: [{id, s, x, z, r, depth}], scorch: [{id, x, z, r}], pieces: [{id, kind, state, variant, seed, x, z,
//          y, yaw, s, r, role}], rubble: [{id, x, z, y, yaw, w, h, d, tilt}], positions: [{id, kind, s, x, z, yaw, side, pieces: [ids]}]}
//   KTRANSIT.craterH(W, x, z)        the depression at (x, z): a bowl inside each crater (the deepest wins), a low rim round it
//   KTRANSIT.inCrater(W, x, z, pad)  true inside a crater (grown by pad)
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  T.MILITARY_KINDS = ['tr_sandbags', 'tr_sentry', 'tr_boom', 'tr_hedgehog', 'tr_wire'];
  T.RUIN.military = { intact: 0.4, bent: 0.1, fallen: 0.15, burnt: 0.2, crushed: 0.15 };
  T.RUIN.wreckage = { intact: 0, bent: 0.1, fallen: 0.4, burnt: 0.3, crushed: 0.2 };
  T.war = function (street, o) {
    o = o || {};
    if (!street || !street.pts || typeof street.ground !== 'function') throw new Error('KTRANSIT.war: a street {pts, width, ground}, please');
    var id = street.id == null ? 'street' : String(street.id), seed = o.seed == null ? T.idHash(id + '.war') : (o.seed >>> 0), W = num(street.width, 11), ground = street.ground;
    var P = T.path(street.pts, { ground: ground, step: 4, shift: street.shift }), dmg = typeof o.damage === 'function' ? o.damage : function () { return o.damage == null ? 0 : +o.damage; }, step = num(o.step, 10);
    var out = { id: id, kind: 'war', seed: seed, path: P, damageAt: dmg, craters: [], scorch: [], pieces: [], rubble: [], positions: [] }, n = 0;
    var u = function (k, a, b) { return T.u(seed, k, a, b); };
    var at = function (s, off) { var p = P.at(s); return { x: p.x + Math.cos(p.yaw) * off, z: p.z - Math.sin(p.yaw) * off, yaw: p.yaw }; };
    function piece(kind, state, s, off, yawExtra, role, salt, shares) {
      var K = T.KINDS[kind];
      if (state != null && K.states.indexOf(state) < 0) state = ['crushed', 'burnt', 'fallen', 'bent', 'intact'].filter(function (st) { return K.states.indexOf(st) >= 0; })[0];   /* a kind without that state takes the nearest ruin it has */
      var pk = T.pick(KRAND.hash(seed, n, salt), kind, state, shares), q = at(s, off);
      if (T.inCrater(out, q.x, q.z, 0.5)) return null;
      if (o.network && T.junctionAt(o.network, q.x, q.z, Math.max(K.w, K.d) / 2)) return null;
      var rec = { id: id + '.w' + n, kind: kind, state: pk.state, variant: pk.variant, seed: pk.seed, x: q.x, z: q.z, y: ground(q.x, q.z), yaw: q.yaw + yawExtra, s: s, r: Math.max(K.w, K.d) / 2 + 0.3, role: role };
      n++; out.pieces.push(rec); return rec;
    }
    /* the craters first (the pieces keep off them), then the scorch, the heaps, the strewn pieces and the barricades, slot by slot */
    var k = 0, s;
    for (s = step / 2; s < P.L; s += step, k++) {
      var d = Math.max(0, Math.min(1, dmg(s))), p = d < 0.3 ? 0 : (d - 0.3) / 0.7;
      if (p > 0 && u(k, 1, 0) < p * 0.55) { var r = 2 + 9 * p * (0.4 + 0.6 * u(k, 1, 1)), off = (u(k, 1, 2) - 0.5) * (W + 4), c = at(s, off), depth = Math.min(4, 0.5 + 0.35 * r);
        out.craters.push({ id: id + '.c' + out.craters.length, s: s, x: c.x, z: c.z, r: r, depth: depth });
        var rim = 6 + Math.floor(u(k, 1, 3) * 9); for (var j = 0; j < rim; j++) { var a = u(k, 2, j) * Math.PI * 2, rr = r * (1.05 + 0.4 * u(k, 3, j)), cx = c.x + Math.cos(a) * rr, cz = c.z + Math.sin(a) * rr; out.rubble.push({ id: id + '.rb' + out.rubble.length, x: cx, z: cz, y: 0, yaw: u(k, 4, j) * Math.PI, w: 0.5 + 1.4 * u(k, 5, j), h: 0.3 + 0.7 * u(k, 6, j), d: 0.5 + 1.2 * u(k, 7, j), tilt: (u(k, 8, j) - 0.5) * 0.9 }); }
        var thrown = 2 + Math.floor(u(k, 1, 4) * 4 * p); for (var t = 0; t < thrown; t++) { var a2 = u(k, 9, t) * Math.PI * 2, r2 = r * (1.6 + 1.8 * u(k, 10, t)), tx = c.x + Math.cos(a2) * r2, tz = c.z + Math.sin(a2) * r2; out.rubble.push({ id: id + '.rb' + out.rubble.length, x: tx, z: tz, y: 0, yaw: u(k, 11, t) * Math.PI, w: 1.2 + 2.6 * u(k, 12, t), h: 0.3 + 0.4 * u(k, 13, t), d: 1 + 2 * u(k, 14, t), tilt: (u(k, 15, t) - 0.5) * 0.7 }); } }
    }
    out.rubble.forEach(function (c) { c.y = ground(c.x, c.z); });
    for (s = step / 2, k = 0; s < P.L; s += step, k++) {
      var d2 = Math.max(0, Math.min(1, dmg(s))); if (d2 <= 0.02) continue;
      if (u(k, 20, 0) < 0.9 * d2) { var so = (u(k, 20, 1) - 0.5) * W, sq = at(s, so); if (!T.inCrater(out, sq.x, sq.z, -1)) out.scorch.push({ id: id + '.sc' + out.scorch.length, x: sq.x, z: sq.z, r: 1.5 + 3.5 * d2 * (0.5 + u(k, 20, 2)) }); }
      var heaps = Math.floor(d2 * 1.7 + u(k, 21, 0)); for (var h = 0; h < heaps; h++) piece(['tr_rubble_pave', 'tr_rubble_glass', 'tr_rubble_cable', 'tr_rubble_pave'][Math.floor(u(k, 22, h) * 4) % 4], 'intact', s + (u(k, 23, h) - 0.5) * step, (u(k, 24, h) - 0.5) * (W + 2), u(k, 25, h) * Math.PI, 'heap', 30 + h);
      if (u(k, 26, 0) < 0.6 * d2) piece(['tr_bench', 'tr_bin', 'tr_barrier', 'tr_cabinet', 'tr_sign', 'tr_bollard', 'tr_planter'][Math.floor(u(k, 26, 1) * 7) % 7], null, s + (u(k, 26, 2) - 0.5) * step, (u(k, 26, 3) - 0.5) * (W - 1), u(k, 26, 4) * Math.PI * 2, 'strewn', 40, T.RUIN.wreckage);
      /* a barricade: a line of furniture dragged across most of the road, a riot's work (less of it once the shells came) */
      if (k % 8 === 3 && u(k, 27, 0) < (d2 < 0.6 ? 0.7 : 0.25) && d2 > 0.08) { var nb = 3 + Math.floor(u(k, 27, 1) * 3), span = W * 0.6, start = (u(k, 27, 2) - 0.5) * (W - span);
        for (var b = 0; b < nb; b++) { var bk = ['tr_barrier', 'tr_bench', 'tr_cabinet', 'tr_bin', 'tr_planter', 'tr_barrier'][Math.floor(u(k, 28, b) * 6) % 6], bs = u(k, 29, b); piece(bk, bs < 0.35 ? 'intact' : bs < 0.6 ? 'fallen' : 'burnt', s, start - span / 2 + span * (b + 0.5) / nb, Math.PI / 2 + (u(k, 30, b) - 0.5) * 0.5, 'barricade', 50 + b); } }
    }
    /* the military positions: at the s given (a crossing: a checkpoint), then every 180 to 300 m by hash when asked */
    var mil = o.military === true ? 1 : (o.military ? +o.military : 0), posAt = [];
    (o.positions || []).forEach(function (ps) { posAt.push([ps, 'checkpoint']); });
    if (mil > 0) for (var ms = 90 + 120 * u(0, 60, 0), mk = 0; ms < P.L - 40; ms += 180 + 120 * u(mk, 60, 1), mk++) { if (u(mk, 60, 2) > mil) continue; if (posAt.some(function (q) { return Math.abs(q[0] - ms) < 60; })) continue; if (o.network && o.road != null && T.nearJunction(o.network, o.road, ms, 14)) continue; var ku = u(mk, 60, 3); posAt.push([ms, ku < 0.4 ? 'checkpoint' : ku < 0.75 ? 'emplacement' : 'post']); }
    /* the blockades (the owner, 2026-11-09): improvised barricades of wrecked vehicles across the road, where o.blockades says (s values), or, when
       true, every 250 to 400 m by hash, each with heaps and sandbags round it */
    out.blockades = [];
    var bkAt = Array.isArray(o.blockades) ? o.blockades.slice() : [];
    if (o.blockades === true) for (var bs = 120 + 200 * u(0, 62, 0), bk = 0; bs < P.L - 40; bs += 250 + 150 * u(bk, 62, 1), bk++) { if (o.network && o.road != null && T.nearJunction(o.network, o.road, bs, 14)) continue; bkAt.push(bs); }
    bkAt.forEach(function (bs2, bi) { if (bs2 < 10 || bs2 > P.L - 10) throw new Error('KTRANSIT.war: blockade ' + bi + ' is off the street'); var B = T.blockade(P, bs2, W - 0.6, null, KRAND.hash(seed, bi, 600) >>> 0, id + '.bk' + bi, false);
      B.vehicles.forEach(function (v) { v.y = ground(v.x, v.z); });
      [-1, 1].forEach(function (sd) { piece('tr_sandbags', null, bs2 + sd * 4, sd * (W / 2 + 1.4), 0, 'barricade', 110 + bi * 2 + (sd > 0 ? 1 : 0), T.RUIN.military); piece('tr_rubble_pave', 'intact', bs2 + sd * 2.5, sd * (W / 2 - 2.5), u(bi, 63, sd + 1) * 3, 'heap', 112 + bi * 2 + (sd > 0 ? 1 : 0)); });
      piece('tr_barrier', null, bs2 - 6, (u(bi, 63, 5) - 0.5) * W * 0.5, Math.PI / 2, 'barricade', 114 + bi, T.RUIN.military);
      out.blockades.push(B); });
    posAt.forEach(function (q, pi) {
      var ps = q[0], kind = q[1], side = u(pi, 61, 0) < 0.5 ? -1 : 1, kerb = W / 2 + 1.6, ids = [], add = function (r) { if (r) ids.push(r.id); }, M = T.RUIN.military, pq = at(ps, 0);
      if (kind === 'checkpoint') {
        add(piece('tr_barrier', null, ps - 7, -W * 0.22, Math.PI / 2 + 0.3, 'position', 70, M)); add(piece('tr_barrier', null, ps - 7, -W * 0.22 + 3.2, Math.PI / 2 + 0.3, 'position', 71, M));
        add(piece('tr_barrier', null, ps + 7, W * 0.22, Math.PI / 2 - 0.3, 'position', 72, M)); add(piece('tr_barrier', null, ps + 7, W * 0.22 - 3.2, Math.PI / 2 - 0.3, 'position', 73, M));
        add(piece('tr_boom', null, ps, side * (W / 2 - 3.6), side > 0 ? Math.PI : 0, 'position', 74, M));
        var hut = piece('tr_sentry', 'intact', ps + 2, side * kerb, side > 0 ? -Math.PI / 2 : Math.PI / 2, 'position', 75, M); add(hut); if (hut) hut.variant = 0;
        add(piece('tr_sandbags', null, ps - 4, side * (kerb + 0.4), 0, 'position', 76, M)); add(piece('tr_sandbags', null, ps + 8, side * (kerb + 0.4), 0, 'position', 77, M));
        add(piece('tr_wire', null, ps, -side * kerb, 0, 'position', 78, M));
      } else if (kind === 'emplacement') {
        var e = piece('tr_sandbags', null, ps, side * (kerb - 0.2), side > 0 ? -Math.PI / 2 : Math.PI / 2, 'position', 80, M); add(e); if (e) e.variant = 1;
        add(piece('tr_hedgehog', null, ps - 5, side * (W / 2 - 2.5), u(pi, 61, 1) * 3, 'position', 81, M)); add(piece('tr_hedgehog', null, ps + 4, side * (W / 2 - 5), u(pi, 61, 2) * 3, 'position', 82, M));
        add(piece('tr_wire', null, ps + 6, side * (W / 2 - 1.5), 0, 'position', 83, M));
      } else {
        var w = piece('tr_sentry', null, ps, side * (kerb + 0.6), side > 0 ? -Math.PI / 2 : Math.PI / 2, 'position', 90, M); add(w); if (w) w.variant = 1;
        add(piece('tr_sandbags', null, ps - 4.5, side * (kerb - 0.4), 0, 'position', 91, M)); add(piece('tr_sandbags', null, ps + 4.5, side * (kerb - 0.4), 0, 'position', 92, M));
        add(piece('tr_wire', null, ps - 3, side * (W / 2 - 1.2), 0, 'position', 93, M)); add(piece('tr_wire', null, ps + 3, side * (W / 2 - 1.2), 0, 'position', 94, M));
      }
      out.positions.push({ id: id + '.pos' + pi, kind: kind, s: ps, x: pq.x, z: pq.z, yaw: pq.yaw, side: side, pieces: ids });
    });
    return out;
  };
  /* THE ANCIENT VEHICLES the barricades are built from (kits/motor-vehicles, culture `ancient`): keys and footprints (w across, d along), so the
     records lay them nose to tail without the bundle; the draw takes the bundle's own geometry when the host has it (KratorVehicles), a burnt hulk when not */
  T.VEHICLES = { anc_pod: { w: 2.3, d: 3.3, h: 1.6 }, anc_saloon: { w: 2.6, d: 6.0, h: 1.5 }, anc_police: { w: 2.6, d: 6.0, h: 1.9 }, anc_van: { w: 2.7, d: 6.0, h: 2.6 }, anc_utility: { w: 2.8, d: 6.2, h: 2.4 }, anc_hauler: { w: 2.75, d: 9.2, h: 3.0 } };
  T.VEHICLE_KEYS = Object.keys(T.VEHICLES);
  /* an improvised barricade: wrecked vehicles nose to tail across a way at s (their +z along the way's lateral, turned a little each; one turned
     side-on where only its width fits), the line broken by a gap where a vehicle burnt out or was dragged, a second row on a wide way (a deck),
     sandbags and a barrier or two at its ends. wide: the width across; y: the surface's height (a deck's; null: the host's ground at each); fallen:
     the way is down there, so the vehicles lie fallen with it (state 'wreck', rolled) */
  T.blockade = function (P, s, wide, y, seed, id, fallen) {
    var p = P.at(s), u = function (k, a) { return T.u(seed, k, 700, a); }, vehicles = [], k = 0, skew = (u(0, 0) - 0.5) * 0.5, rows = wide > 14 ? 2 : 1;
    for (var row = 0; row < rows; row++) {
      var lat = -wide / 2 + 0.6, base = (row - 0.5 * (rows - 1)) * 6.5 * (u(row, 11) < 0.5 ? 1 : -1);
      while (lat < wide / 2 - 1.5 && k < 12) {
        /* the room left across the way; a vehicle that fits it lengthwise (the first leaving room for a second), else one turned side-on */
        var room = wide / 2 - 0.4 - lat, keysFit = T.VEHICLE_KEYS.filter(function (kk) { return T.VEHICLES[kk].d <= room - (lat < -wide / 2 + 1 ? 2.9 : 0); }), across = false, key, V, len;
        if (keysFit.length) { key = keysFit[Math.floor(u(k, 1) * keysFit.length) % keysFit.length]; V = T.VEHICLES[key]; len = V.d; }
        else { var side = T.VEHICLE_KEYS.filter(function (kk) { return T.VEHICLES[kk].w <= room; }); if (!side.length) break; key = side[Math.floor(u(k, 1) * side.length) % side.length]; V = T.VEHICLES[key]; len = V.w; across = true; }
        var gap = u(k, 2) < 0.22 ? 2.5 + 3 * u(k, 3) : 0.4 + 0.6 * u(k, 3); if (gap > room - len - 3.3) gap = 0.4 + 0.6 * u(k, 3);
        var c = lat + len / 2, along = base + (u(k, 5) - 0.5) * 2.2, yaw = p.yaw + (across ? (u(k, 6) < 0.5 ? 0 : Math.PI) : Math.PI / 2 * (u(k, 6) < 0.5 ? 1 : -1)) + skew + (u(k, 7) - 0.5) * 0.5, x = p.x + Math.cos(p.yaw) * c + Math.sin(p.yaw) * along, z = p.z - Math.sin(p.yaw) * c + Math.cos(p.yaw) * along;
        var st = u(k, 8) < 0.55 ? 'burnt' : u(k, 8) < 0.85 ? 'wreck' : 'weathered';
        vehicles.push({ id: id + '.v' + k, key: key, variant: Math.floor(u(k, 9) * 2), seed: KRAND.hash(seed, k, 701) >>> 0, state: fallen ? 'wreck' : st, x: x, z: z, y: y, yaw: yaw, roll: fallen ? (u(k, 10) - 0.5) * 1.2 : 0, lat: c, ext: len / 2, along: along, row: row, across: across, w: V.w, d: V.d, h: V.h });
        lat += len + gap; k++;
      }
    }
    return { id: id, s: s, x: p.x, z: p.z, yaw: p.yaw, y: y, wide: wide, r: wide / 2 + 2.5 + (rows - 1) * 3, vehicles: vehicles, fallen: !!fallen, rows: rows };
  };
  T.inCrater = function (W, x, z, pad) { pad = pad == null ? 0 : pad; var C = W.craters; for (var i = 0; i < C.length; i++) if (Math.hypot(x - C[i].x, z - C[i].z) < C[i].r + pad) return true; return false; };
  /* a bowl (1 - q^2)^2 deep inside the radius, and a rim: a smooth bump peaking AT the edge and dying out by 0.65 r inside and 1.6 r outside, so
     the ground is continuous across the edge (a step there drew a ring of facets). The deepest bowl and the highest rim win where craters overlap */
  T.craterH = function (W, x, z) {
    var h = 0, rim = 0, C = W.craters;
    for (var i = 0; i < C.length; i++) { var c = C[i], d = Math.hypot(x - c.x, z - c.z); if (d >= c.r * 1.6) continue;
      if (d < c.r) { var q = d / c.r, t = 1 - q * q, v = -c.depth * t * t; if (v < h) h = v; }
      var u = d < c.r ? (d - c.r) / (0.35 * c.r) : (d - c.r) / (0.6 * c.r), w = Math.max(0, 1 - u * u), b = 0.16 * c.depth * w * w; if (b > rim) rim = b; }
    return h + rim;
  };
})();
