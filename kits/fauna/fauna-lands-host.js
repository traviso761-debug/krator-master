/* ======================================================================
   Krator Fauna: fauna by land, the draw (kits/fauna/fauna-lands-host.js; H8) [web]

   Draws a plan of fauna-lands.js (FAUNALANDS.plan, then FAUNALANDS.register: the records come first) with the bundle's
   KratorFauna, after fauna-lands.js:

     FAUNALANDS.draw(KF, scene, plan, o) -> { list: [{g, a}], tick(t) }
       KF: KratorFauna. Each animal is KF.build(key, {seed, variant}), scaled by its plan scale, placed at its record's `at`
       and `ry`, its group tagged with the record's id (userData.krator; the inspector reads the record) and left out of the
       probe's samples (userData.probeSkip, as the hosts' other fauna). tick(t) animates every one in its mode on the host's
       motion time, each at its own phase. o.err(msg) hears a build that throws (the rest are still drawn).
   ====================================================================== */
(function (root) {
  'use strict';
  const FL = root.FAUNALANDS;
  if (!FL) throw new Error('fauna-lands-host.js needs fauna-lands.js first');
  FL.draw = function (KF, scene, p, o) {
    o = o || {};
    const list = [];
    if (!KF || !p) return { list, tick: function () {} };
    for (const a of p.animals) {
      if (!KF.has(a.key)) continue;
      let g;
      try { g = KF.build(a.key, { seed: a.seed, variant: a.variant }); } catch (e) { if (o.err) o.err('fauna ' + a.key + ': ' + e.message); continue; }
      g.scale.multiplyScalar(a.scale); g.position.set(a.at[0], a.at[1], a.at[2]); g.rotation.y = a.ry;
      g.userData.fauna = true; g.userData.krator = a.id == null ? null : a.id; g.userData.land = p.land;
      g.traverse(m => { if (m.isMesh) m.userData.probeSkip = true; });
      scene.add(g); list.push({ g, a });
    }
    return { list, tick: function (t) { for (const it of list) KF.animate(it.g, t + it.a.phase, it.a.mode); } };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
