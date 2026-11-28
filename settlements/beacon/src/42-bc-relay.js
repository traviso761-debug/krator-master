/* ================================================================= THE BEACON: the signal line's relay posts, as data  [G data]
   settlements/beacon/PLAN.md section 7, step P4 (the owner, 2026-11-23: "have them build to stage 4"; "Rim Post relay"). The
   Rim Post (the fort asset's watch post, XFORT.post()) on the middle volcano's summit, 17 km north-north-east of the lamp,
   carries the lamp's signals to the Eye Post, which the lamp cannot see (30-bc-layout.js lamp.relays). Pure functions of the
   layout, the lamp's night (40-bc-lamp.js) and a ground function: the page, the tests, the sim and Godot read the same posts.
   No THREE, no DOM, no randomness.

     BEACON_RELAY.posts                   [{id, name, to, at: [x, z] page metres, ground, h, km, bearing}]
     BEACON_RELAY.answering(id, t, env)   -> {lit, why}: the post shows its light while the lamp's signal slot is to it
     BEACON_RELAY.sight(a, b, ground, o)  -> {clear, at, D}: the least gap in metres between the line a -> b ([x, y, z]) and
                                             ground(x, z) over the line's middle (o.from .. o.to of its length, o.n samples),
                                             with Earth's curve and refraction (R 6,371 km, k 0.13: the layout's sights) */
const BEACON_RELAY = (function () {
  'use strict';
  const L = typeof BEACON_LAYOUT !== 'undefined' ? BEACON_LAYOUT : require('./30-bc-layout.js');
  const LAMP = typeof BEACON_LAMP !== 'undefined' ? BEACON_LAMP : require('./40-bc-lamp.js');
  const R = 6371000, K = 0.13, F = L.frame, M = F.kmPerPx * 1000;

  /* a scale-model pixel to the page: x east (v), z south (u), the lamp at 0,0 */
  const toPage = px => [(px[0] - F.px[0]) * M, (px[1] - F.px[1]) * M];
  const posts = L.lamp.relays.map(r => {
    const at = toPage(r.px), b = (Math.atan2(at[0], -at[1]) * 180 / Math.PI + 360) % 360;
    return { id: r.id, name: r.name, to: r.to, at, ground: r.ground, h: r.h, km: Math.hypot(at[0], at[1]) / 1000, bearing: b };
  });

  /* the post's light: lit while the lamp's signal hour stops on it (its slot), so the post's watch reads the message and sends
     it on; dark by day, on the sweep and on the other stations' slots */
  function answering(id, t, env) {
    const s = LAMP.state(t, env || {});
    if (!s.lit) return { lit: false, why: 'the lamp dark' };
    if (s.mode === 'signal' && s.station === id) return { lit: true, why: 'the lamp\'s slot to it' };
    return { lit: false, why: s.mode === 'signal' ? 'the slot to ' + s.station : 'the lamp on its ' + s.mode };
  }

  function sight(a, b, ground, o) {
    o = o || {};
    const n = o.n == null ? 400 : o.n, f0 = o.from == null ? 0.02 : o.from, f1 = o.to == null ? 0.98 : o.to;
    const D = Math.hypot(b[0] - a[0], b[2] - a[2]);
    let clear = Infinity, at = null;
    for (let i = 0; i <= n; i++) {
      const f = f0 + (f1 - f0) * i / n, x = a[0] + (b[0] - a[0]) * f, z = a[2] + (b[2] - a[2]) * f, d1 = D * f;
      const g = ground(x, z);
      if (g == null) continue;
      const c = a[1] + (b[1] - a[1]) * f - d1 * (D - d1) / (2 * R) * (1 - K) - g;
      if (c < clear) { clear = c; at = [x, z, f]; }
    }
    return { clear, at, D };
  }

  return { posts, answering, sight, toPage, R, K };
})();
if (typeof module !== 'undefined') module.exports = BEACON_RELAY;
