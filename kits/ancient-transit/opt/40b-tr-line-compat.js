// ================================================================= ANCIENT TRANSIT — opt-in deep-line compatibility shim  [G data]
// Adds KTRANSIT's deep-line state vocabularies (40), KTRANSIT.profile's 'given' mode (41), and KTRANSIT.draw's shared frame/lining
// helpers (46) when kits/ancient-transit/opt/43c-tr-line.js and 56c-tr-draw-line.js are loaded onto main's KTRANSIT without
// changing kits/ancient-transit/src/ or its own sheet's bytes.
(function () {
  var T = KTRANSIT;
  T.LINE_FORMS = ['gallery', 'twin', 'junction', 'shallow', 'open', 'elevated'];
  T.LINE_SECTION_STATES = ['intact', 'spalled', 'fallen', 'flooded'];
  T.LINE_COND_STATES = ['built', 'kept', 'worn', 'blocked', 'cut', 'flooded'];
  T.CROSSOVER_STATES = ['built', 'kept', 'frozen', 'gone'];
  T.LINE_STATION_STATES = ['built', 'kept', 'abandoned', 'sealed'];
  if (T.RUIN && !T.RUIN.line) T.RUIN.line = { intact: 0.88, spalled: 0.12, fallen: 0, flooded: 0 };

  var prof0 = T.profile;
  T.profile = function (P, o) {
    if (o && o.mode === 'given') {
      var G = o.ys;
      if (!Array.isArray(G) || !G.length) throw new Error('KTRANSIT.profile: the given mode needs o.ys [[s, y], ...]');
      var yAt = function (s) {
        if (s <= G[0][0]) return G[0][1];
        for (var q = 1; q < G.length; q++) {
          if (s <= G[q][0]) {
            var d = G[q][0] - G[q - 1][0];
            return d > 1e-9 ? G[q - 1][1] + (G[q][1] - G[q - 1][1]) * (s - G[q - 1][0]) / d : G[q][1];
          }
        }
        return G[G.length - 1][1];
      };
      return { Y: P.S.map(yAt), at: function (s) { return yAt(Math.max(0, Math.min(P.L, s))); }, mode: 'given' };
    }
    return prof0.call(this, P, o);
  };

  T.bindLineDraw = function () {
    if (!T.draw || T.draw.lining) return;
    T.draw.frames = function (R, s0, s1, step, up, offFn) {
      var out = [], n = Math.max(1, Math.round((s1 - s0) / step));
      for (var i = 0; i <= n; i++) {
        var s = s0 + (s1 - s0) * i / n, p = R.path.at(s), y = R.deckAt(s), s2 = Math.min(R.L, s + 2);
        var pitch = s2 > s ? Math.atan2(R.deckAt(s2) - y, 2) : 0, off = offFn ? offFn(s, i / n) : 0;
        out.push(T.frame(p.x + Math.cos(p.yaw) * off, y + up, p.z - Math.sin(p.yaw) * off, p.yaw, pitch, 0));
      }
      return out;
    };
    T.draw.tunnelMat = function () {
      var M = T.mats();
      if (!M.tunnel) { M.tunnel = M.concrete.clone(); M.tunnel.side = THREE.DoubleSide; M.tunnel.name = 'tr.tunnel'; }
      return M.tunnel;
    };
    T.draw.lining = function (B, profile, frames, col, o) {
      o = o || {};
      T.draw.tunnelMat();
      var rev = typeof profile === 'function' ? function (i) { return profile(i).slice().reverse(); } : profile.slice().reverse();
      B.sweep(o.fam == null ? 'tunnel' : o.fam, rev, frames, col, { u0: o.u0, open: o.open == null ? true : o.open, caps: !!o.caps });
    };
  };
})();
