// ================================================================= ANCIENT TRANSIT — the street dress  [G data]
// A street's furniture as records: along both kerbs of a street polyline, lamp standards at a fixed step and the other kinds by weight, each
// in a ruin state by the shares; gantries and a footbridge across it; rubble heaps on the carriageway. KSPACE keeps the pieces apart and off
// what a host has filed in the same index (its pads, its towers' plinths); a host may also hand a blocked(x, z, r) of its own.
//
//   KTRANSIT.dress(street, o) -> D
//     street {id, pts: [[x, z], ...], width, ground(x, z)}
//     o.seed, o.space (a KSPACE index; made here when absent), o.blocked(x, z, r) -> bool, o.network and o.road (a KTRANSIT.network and this
//     street's index in it: the pieces keep off the junctions, signals stand on their pavement corners), o.war (a KTRANSIT.war: its craters and pieces are
//     kept off), o.damage (0..1 or a function of s: the furniture's shares slide toward fallen, burnt and crushed), o.step (a slot every 8 m), o.ruin (furniture
//     shares), o.kinds ({kind: weight} over KTRANSIT.KINDS' defaults), o.rubble (heaps per 100 m of street, 1.5), o.across (true: a gantry
//     or a footbridge across the street every 120 m or so), o.pavement (the pavement's width, 3.5), o.only (a list of kinds to lay)
//     D = {id, pieces: [{id, kind, state, variant, seed, x, z, y, yaw, side, s, r}], length, slots, skipped}
//   KTRANSIT.dressGrid(o)     the demo's block: every kind in every state it has, on a grid: {pieces: [...], cols, rows}
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  T.dress = function (street, o) {
    o = o || {};
    if (!street || !street.pts) throw new Error('KTRANSIT.dress: a street {pts, width, ground}, please');
    var id = street.id == null ? 'street' : String(street.id), seed = o.seed == null ? T.idHash(id) : (o.seed >>> 0), W = num(street.width, 11), pave = num(o.pavement, 3.5);
    var P = T.path(street.pts, { ground: street.ground, step: 4, shift: street.shift }), S = o.space || (typeof KSPACE !== 'undefined' ? KSPACE.create({ cell: 12 }) : null), step = num(o.step, 8);
    var shares0 = o.ruin || T.RUIN.furniture, weights = {}, keys = [], pieces = [], skipped = 0, slots = 0, n = 0, shares = shares0;
    var dmgAt = typeof o.damage === 'function' ? o.damage : function () { return o.damage == null ? 0 : +o.damage; };
    var sharesAt = function (s) { var d = Math.max(0, Math.min(1, dmgAt(s))); if (d <= 0) return shares0; var w = T.RUIN.wreckage, out = {}; T.STATES.forEach(function (k) { out[k] = (shares0[k] == null ? 0 : shares0[k]) * (1 - d) + (w[k] == null ? 0 : w[k]) * d; }); return out; };
    T.KIND_KEYS.forEach(function (k) { var K = T.KINDS[k], w = o.kinds && o.kinds[k] != null ? o.kinds[k] : K.weight; if (o.only && o.only.indexOf(k) < 0) w = 0; if (w > 0 && (K.where === 'kerb' || K.where === 'median')) { weights[k] = w; keys.push(k); } });
    var wsum = keys.reduce(function (a, k) { return a + weights[k]; }, 0);
    function free(x, z, r) {
      if (o.blocked && o.blocked(x, z, r)) return false;
      if (o.war && (T.inCrater(o.war, x, z, r + 0.5) || o.war.pieces.some(function (q) { return Math.hypot(x - q.x, z - q.z) < r + q.r; }) || (o.war.blockades || []).some(function (bk) { return Math.hypot(x - bk.x, z - bk.z) < r + bk.r; }))) return false;
      if (o.network && T.junctionAt(o.network, x, z, r + 0.5)) return false;
      if (S && S.some(x, z, r, function (it) { var d = Math.hypot(x - it.x, z - it.z); return d < r + (it.r == null ? 0 : it.r); })) return false;
      return true;
    }
    function lay(kind, state, s, side, off, yawExtra, salt, span) {
      var K = T.KINDS[kind], pk = T.pick(KRAND.hash(seed, n, salt), kind, state, sharesAt(s)), p = P.at(s), x = p.x + Math.cos(p.yaw) * off, z = p.z - Math.sin(p.yaw) * off, r = K.where === 'carriageway' ? K.d / 2 + 1 : Math.max(span == null ? K.w : span, K.d) / 2 + 0.3;   /* a piece across the street keeps only its own depth clear: the kerb's pieces stand under it */
      slots++;
      if (!free(x, z, r)) { skipped++; return null; }
      var rec = { id: id + '.f' + n, kind: kind, state: pk.state, variant: pk.variant, seed: pk.seed, x: x, z: z, y: street.ground(x, z), yaw: p.yaw + yawExtra, side: side, s: s, r: r };
      if (span != null) rec.span = span;
      n++; pieces.push(rec); if (S) S.insert(rec, x, z, r);
      /* a piece across the street stands on two legs, one on each pavement: each keeps 1.1 m clear, so no kerb piece lands under a leg */
      if (span != null && S) [-1, 1].forEach(function (sd) { var lx = x + Math.cos(p.yaw) * sd * span / 2, lz = z - Math.sin(p.yaw) * sd * span / 2; S.insert({ id: rec.id + (sd > 0 ? '.legR' : '.legL'), x: lx, z: lz, r: 1.1, leg: rec.id }, lx, lz, 1.1); });
      return rec;
    }
    /* across the street first: a gantry or a footbridge every 120 m or so, by hash, its length (its x) across the street from pavement to pavement
       (the owner, 2026-11-08): the piece's x is the path's side axis at yaw, so no turn. Laid before the kerb pieces, so those keep off its legs */
    if (o.across !== false) for (var sa = 60 + 60 * T.u(seed, 0, 3, 0); sa < P.L - 40; sa += 110 + 60 * T.u(seed, Math.round(sa), 3, 1)) {
      var ak = T.u(seed, Math.round(sa), 3, 2) < 0.7 ? 'tr_gantry' : 'tr_footbridge';
      if (o.only && o.only.indexOf(ak) < 0) continue;
      if (o.network && o.road != null && T.nearJunction(o.network, o.road, sa, 4)) continue;
      lay(ak, null, sa, 0, 0, 0, 3, Math.min(T.KINDS[ak].w, W + 2.4));
    }
    var lampStep = T.KINDS.tr_lamp.step, k = 0;
    for (var s = step / 2; s < P.L; s += step, k++) {
      var side = k % 2 ? 1 : -1, kerb = side * (W / 2 + 0.9), u = T.u(seed, k, 1, 0);
      if (o.network && o.road != null && T.nearJunction(o.network, o.road, s, 1)) continue;
      /* a lamp standard every lampStep, alternating sides, its arm (its +z) turned toward the carriageway: side +1 stands at (cos yaw, -sin yaw),
         so its front turns to -(cos yaw, -sin yaw), which is yaw - pi/2 */
      if (Math.floor(s / lampStep) !== Math.floor((s - step) / lampStep)) { lay('tr_lamp', null, s, side, kerb, side > 0 ? -Math.PI / 2 : Math.PI / 2, 1); continue; }
      if (!keys.length || u < 0.3) continue;
      var pickU = T.u(seed, k, 2, 0) * wsum, kind = keys[keys.length - 1], acc = 0;
      for (var q = 0; q < keys.length; q++) { acc += weights[keys[q]]; if (pickU < acc) { kind = keys[q]; break; } }
      var K = T.KINDS[kind], off = K.where === 'median' ? 0 : side * (W / 2 + 0.6 + Math.min(pave - 0.6, K.d / 2 + 0.3));
      /* a kerb piece faces the street (its front +z toward the carriageway); a median piece runs along it */
      lay(kind, null, s, side, off, K.where === 'median' ? 0 : (side > 0 ? -Math.PI / 2 : Math.PI / 2), 2);
    }
    /* the junctions' corners (o.network): a traffic signal on each pavement corner of a junction of three arms or more, facing the junction, and a
       street sign on a corner of a smaller one */
    if (o.network && o.road != null) o.network.junctions.forEach(function (J, ji) { if (!J.arms.some(function (a) { return a.road === o.road; })) return; var home = J.arms.filter(function (a) { return a.road === o.road; })[0];
      J.corners.forEach(function (c, ci) { if ((c.straight && J.n < 3) || Math.min(J.arms[c.between[0]].road, J.arms[c.between[1]].road) !== o.road) return;   /* a T's straight side has its signal too, facing the stem */ var am = c.yaw, x = c.x, z = c.z, kind = J.n >= 3 ? 'tr_signal' : 'tr_sign', K = T.KINDS[kind], pk = T.pick(KRAND.hash(seed, ji, 900 + ci), kind, null, sharesAt(home.s));
        if (o.blocked && o.blocked(x, z, 1)) return;
        var rec = { id: id + '.f' + n, kind: kind, state: pk.state, variant: pk.variant, seed: pk.seed, x: x, z: z, y: street.ground(x, z), yaw: am, side: 0, s: home.s, r: Math.max(K.w, K.d) / 2 + 0.3, junction: J.id }; n++; pieces.push(rec); if (S) S.insert(rec, x, z, rec.r); }); });
    /* the rubble heaps on the carriageway */
    var heaps = Math.round(num(o.rubble, 1.5) * P.L / 100);
    for (var h = 0; h < heaps; h++) { var hs = T.u(seed, h, 4, 0) * P.L, hoff = (T.u(seed, h, 4, 1) - 0.5) * (W - 3), hk = ['tr_rubble_pave', 'tr_rubble_pave', 'tr_rubble_glass', 'tr_rubble_cable'][Math.floor(T.u(seed, h, 4, 2) * 4) % 4];
      if (o.only && o.only.indexOf(hk) < 0) continue;
      lay(hk, 'intact', hs, 0, hoff, T.u(seed, h, 4, 3) * Math.PI, 4); }
    return { id: id, pieces: pieces, length: P.L, slots: slots, skipped: skipped, path: P };
  };
  /* the demo's block: every kind in every state it has, a column a kind, a row a state, big pieces given room */
  T.dressGrid = function (o) {
    o = o || {};
    var ground = o.ground || function () { return 0; }, seed = o.seed == null ? 91 : o.seed, x0 = num(o.x, 0), z0 = num(o.z, 0), pieces = [], col = 0, maxRows = T.STATES.length;
    var pitch = num(o.pitch, 9), x = x0;
    T.KIND_KEYS.forEach(function (k) {
      var K = T.KINDS[k], w = Math.max(pitch, K.w + 4);
      x += w / 2;
      K.states.forEach(function (st, r) {
        var pk = T.pick(KRAND.hash(seed, col, r), k, st), z = z0 + r * Math.max(pitch, K.d + 5) + (K.where === 'carriageway' ? 2 : 0);
        pieces.push({ id: 'grid.' + k + '.' + st, kind: k, state: st, variant: o.variant == null ? pk.variant : o.variant, seed: pk.seed, x: x, z: z, y: ground(x, z), yaw: 0, side: 0, s: 0, r: Math.max(K.w, K.d) / 2 });
      });
      x += w / 2; col++;
    });
    return { pieces: pieces, cols: col, rows: maxRows, w: x - x0 };
  };
})();
