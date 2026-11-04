// ================================================================= METROPOLIS — the facades  [G data]
// The window pattern follows the rooms behind it: one source of truth. MP.facade(F, st) reads a storey's rooms and gives each
// bay of the skin a kind; MP.fenestrate writes the same bays back as the rooms' windows, so a room's glass and the drawn glass cannot differ.
// Bay kinds: pier (a party wall or solid), blank (no window), wide (a living room, a shop), window (a bedroom, a clinic room),
// slit (a store, a records stair), ribbon (an open office), tall (a hall, a school), louvre (plant), arcade (the ground).
(function () {
  var TAU = Math.PI * 2;
  var RULE = { living: 'wide', bedroom: 'window', office: 'ribbon', meeting: 'ribbon', classroom: 'tall', stall: 'wide', cafe: 'wide', concourse: 'tall',
    clinic: 'window', store: 'slit', plant: 'louvre', tank: 'blank', stack: 'blank', greenhouse: 'blank', core: 'blank', hall: 'tall', reception: 'tall' };
  var SIZE = { wide: [0.92, 0.9, 2.3], ribbon: [0.96, 0.9, 2.3], window: [0.62, 0.9, 1.9], tall: [0.9, 0.3, 2.9], slit: [0.2, 0.9, 1.9], louvre: [0.9, 0.6, 2.2], arcade: [0.9, 0, 5] };
  MP.BAYSIZE = SIZE;                   // share of the bay's width, sill, top of the window
  MP.isGlass = function (k) { return k === 'wide' || k === 'ribbon' || k === 'window' || k === 'tall' || k === 'slit'; };

  // the rooms on the skin, by angle (a ring) or by x (a slab)
  function polarRooms(st) {
    var n = st.n, o = [];
    st.rooms.forEach(function (Q) {
      if (Q.th0 != null) { if (!Q.blank) o.push({ t0: Q.th0, t1: Q.th1, Q: Q }); return; }
      var m = /\.r(\d+)$/.exec(Q.id); if (!m) return;
      o.push({ t0: TAU * m[1] / n, t1: TAU * (+m[1] + 1) / n, Q: Q });
    });
    return o;
  }
  function polar(F, st) {
    var N = st.level < F.bays.split ? F.bays.low : F.bays.high, R = polarRooms(st), out = [], W = TAU / N;
    for (var i = 0; i < N; i++) {
      var a = W * i, b = a + W, c = a + W / 2, hit = R.filter(function (e) { return c >= e.t0 && c < e.t1; })[0], edge = R.some(function (e) { return (e.t0 > a + 1e-6 && e.t0 < b - 1e-6) || (e.t1 > a + 1e-6 && e.t1 < b - 1e-6); });
      var kind = !hit ? 'blank' : RULE[hit.Q.mpKind] || 'blank';
      if (edge && kind !== 'blank' && kind !== 'louvre' && kind !== 'ribbon') kind = 'pier';
      out.push({ i: i, th: c, kind: kind, room: hit ? hit.Q.id : null });
    }
    if (st.use === 'lobby') F.portals.forEach(function (p) { for (var d = -2; d <= 1; d++) out[(Math.round(p / W) + d + N) % N].kind = 'arcade'; });
    return out;
  }
  function slabSide(F, st, side) {
    var n = F.bays.n, w = F.bays.width, x0 = -n * w / 2, R = st.rooms.filter(function (Q) { return Q.side === side && Q.kind !== 'corridor'; }), out = [];
    for (var i = 0; i < n; i++) {
      var a = x0 + i * w, b = a + w, c = a + w / 2, hit = R.filter(function (Q) { return c >= Q.x0 && c < Q.x1; })[0], kind = !hit ? 'blank' : RULE[hit.mpKind] || 'blank';
      if (hit && hit.mpKind === 'stack') kind = side === 'right' ? 'slit' : 'blank';     // records: slits on the north (side right is -z), blank to the sun
      if (st.use === 'arcade') kind = 'arcade';
      if (R.some(function (Q) { return Q.x0 > a + 0.01 && Q.x0 < b - 0.01; }) && kind !== 'blank' && kind !== 'arcade' && kind !== 'louvre') kind = 'pier';
      out.push({ i: i, x: c, kind: kind, room: hit ? hit.id : null });
    }
    return out;
  }
  MP.facade = function (F, st) {
    if (F.core.kind === 'round') return { ring: polar(F, st) };
    return { south: slabSide(F, st, 'left'), north: slabSide(F, st, 'right') };
  };
  MP.fenestrate = function (F, st) {
    /* a plan that sets its own windows (the Swell's lobes) keeps them; no facade of bays about the axis */
    if (st.windowsOwn) { st.facade = { ring: [] }; return st; }
    var fac = MP.facade(F, st), byId = {}; st.rooms.forEach(function (Q) { byId[Q.id] = Q; }); st.facade = fac;
    function win(b, at, wid) { var S = SIZE[b.kind]; if (!S || !MP.isGlass(b.kind) || !b.room) return; var Q = byId[b.room]; if (Q) Q.windows.push({ at: at, w: Math.round(wid * S[0] * 100) / 100, sill: S[1], h: S[2] - S[1] }); }
    if (fac.ring) { var Nn = fac.ring.length, r = st.R; fac.ring.forEach(function (b) { win(b, [r * Math.cos(b.th), r * Math.sin(b.th)], TAU * r / Nn); }); }
    else { var hz = F.footprint.d / 2 - 0.5; fac.south.forEach(function (b) { win(b, [b.x, hz], F.bays.width); }); fac.north.forEach(function (b) { win(b, [b.x, -hz], F.bays.width); }); }
    return st;
  };
  // the facade of a level, cached by zone: equal plans share one bay list (the draw instances them)
  MP.levelFacade = function (F, k) { var c = F._fac || (F._fac = {}); if (!c[k]) c[k] = MP.storey(F, k).facade; return c[k]; };
})();
