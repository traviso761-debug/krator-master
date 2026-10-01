/* ======================== Sets page audit: plan + measured geometry + residences ========================
   window._interiors.audit() is what verify.py --sets --assert runs. For every room of every set
   it runs IX.audit() (48-audit.js: footprints inside, doors, clearance, reach, required pieces,
   determinism) and measures the BUILT pieces (measured-inside, measured-height, builds: the same
   checks as the demo's 75-audit.js), then every planned building (IX.auditBuilding, plan
   determinism), then the RESIDENCE check (IX.sets.auditResidence): per unit a bed, a food
   container and an item container, and the light budget.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors, G = IX.geom;
  const v = new THREE.Vector3();
  function localBox(g, p) {
    g.updateMatrixWorld(true);
    const c = Math.cos(p.ry), s = Math.sin(p.ry);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity, n = 0, nan = false;
    g.traverse(function (o) {
      const geo = o.geometry;
      if (!geo || !geo.attributes || !geo.attributes.position || o.isPoints || o.isLine) return;
      n++;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (!isFinite(v.x) || !isFinite(v.y) || !isFinite(v.z)) { nan = true; continue; }
        const dx = v.x - p.x, dz = v.z - p.z, lx = dx * c - dz * s, lz = dx * s + dz * c;
        if (lx < x0) x0 = lx; if (lx > x1) x1 = lx; if (lz < z0) z0 = lz; if (lz > z1) z1 = lz;
        if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
      }
    });
    return { n: n, nan: nan, x0: x0, x1: x1, z0: z0, z1: z1, y0: y0, y1: y1 };
  }
  function audit(opt) {
    opt = opt || {};
    const I = window._interiors, out = { rooms: 0, pieces: 0, usable: 0, reached: 0, fails: [], perRoom: [], fallbacks: 0, missing: [], thin: 0 };
    I.rooms.forEach(function (R, i) {
      const P = I.plans[i];
      const A = IX.audit(R, P, I.catalog);
      const fails = A.fails.slice();
      P.placements.forEach(function (p, k) {
        const g = P.objects && P.objects[k];
        if (!g || g.userData.error) { fails.push({ check: 'builds', msg: R.id + ': ' + p.id + ' ' + p.key + ' did not build' + (g ? ': ' + g.userData.error : '') }); return; }
        if (opt.measure === false) return;
        const B = localBox(g, p);
        if (!B.n || B.nan) { fails.push({ check: 'builds', msg: R.id + ': ' + p.id + ' ' + p.key + (B.nan ? ' has NaN geometry' : ' has no mesh') }); return; }
        const tw = Math.max(0.06, 0.04 * p.w), td = Math.max(0.06, 0.04 * p.d), th = Math.max(0.06, 0.04 * p.h);
        if (p.anchor !== 'surface') {
          const r = G.localRect(p.x, p.z, p.ry, Math.min(0, B.x0 + tw), Math.max(0, B.x1 - tw), Math.min(0, B.z0 + td), Math.max(0, B.z1 - td));
          for (const c of G.corners(r)) if (!G.inside(R.poly, c[0], c[1]))
            fails.push({ check: 'measured-inside', msg: R.id + ': ' + p.id + ' ' + p.key + ' built geometry leaves the room near [' + c[0].toFixed(2) + ', ' + c[1].toFixed(2) + ']' });
        }
        if (B.y0 < R.y - th || B.y1 > R.y + R.h + th)
          fails.push({ check: 'measured-height', msg: R.id + ': ' + p.id + ' ' + p.key + ' built y ' + B.y0.toFixed(2) + '..' + B.y1.toFixed(2) + ' vs room ' + R.y + '..' + (R.y + R.h) });
      });
      out.rooms++; out.pieces += P.placements.length; out.usable += A.usable; out.reached += A.reached;
      out.fallbacks += P.report.fallbacks.length; if (P.report.thin) out.thin++;
      P.report.missing.forEach(function (m) { out.missing.push(R.id + ': ' + m.need + ' (' + m.reason + ')'); });
      out.perRoom.push({ id: R.id, kind: R.kind, culture: R.culture, pieces: P.placements.length, usable: A.usable, reached: A.reached,
        required: P.report.required.map(function (q) { return q.need + ' ' + q.placed + '/' + q.n; }).join(', '),
        fallbacks: P.report.fallbacks.map(function (f) { return f.need + '<-' + f.used; }).join(', '),
        missing: P.report.missing.map(function (m) { return m.need + ':' + m.reason; }).join(', '),
        thin: P.report.thin, fails: fails.length });
      out.fails = out.fails.concat(fails);
    });
    /* planned buildings */
    const byRoom = I.plansById;
    out.buildings = I.buildings.map(function (B, bi) {
      const A = IX.auditBuilding(B, byRoom);
      A.fails.forEach(function (f) { out.fails.push({ check: 'building', msg: B.id + ' ' + f.check + ': ' + f.msg }); });
      const sp = I.buildingSpecs[bi], again = IX.planBuilding(sp.shell, sp.program, Object.assign({}, sp.opts, { register: false }));
      if (JSON.stringify(IX.exportBuilding(again)) !== JSON.stringify(IX.exportBuilding(B)))
        out.fails.push({ check: 'plan-determinism', msg: B.id + ': planning again gives a different plan' });
      return { id: B.id, levels: B.levels.length, rooms: B.rooms.length, stairs: B.stairs.length, doors: B.doors.length,
        partitions: B.walls.filter(function (w) { return w.kind === 'partition'; }).length, roof: B.roof.kind, routes: A.routes,
        dropped: B.report.dropped.length, warnings: B.report.warnings.length, fails: A.fails.length };
    });
    /* residences, per set */
    out.sets = I.sets.map(function (S) {
      const Es = I.items.filter(function (E) { return E.set === S; });
      const res = I.residences.filter(function (r) { return r.set === S.set; });
      res.forEach(function (r) { r.fails.forEach(function (m) { out.fails.push({ check: 'residence', msg: m }); }); });
      return { set: S.set, title: S.title, items: Es.length, skipped: Es.filter(function (E) { return E.item.skip; }).length,
        bodies: Es.reduce(function (a, E) { return a + E.inst.buildings.length; }, 0), rooms: Es.reduce(function (a, E) { return a + E.inst.rooms.length; }, 0),
        residences: res.filter(function (r) { return r.residence; }).length, residenceFails: res.filter(function (r) { return r.fails.length; }).length,
        pieces: Es.reduce(function (a, E) { return a + E.inst.rooms.reduce(function (b, R) { return b + (byRoom[R.id] ? byRoom[R.id].placements.length : 0); }, 0); }, 0) };
    });
    out.residences = I.residences.map(function (r) { return { set: r.set, key: r.key, residence: r.residence, units: r.units, beds: r.beds, food: r.food, items: r.items, fails: r.fails.length }; });
    out.skipped = I.skipped();
    /* lights */
    const nData = I.plans.reduce(function (a, P) { return a + (P.lights ? P.lights.length : 0); }, 0);
    const nReal = I.pointLights();
    out.lights = { budget: I.lightBudget, pointLights: nReal, data: nData, kept: I.keepLights };
    if (!I.keepLights && nReal > I.lightBudget) out.fails.push({ check: 'lights', msg: nReal + ' point lights in the scene, budget ' + I.lightBudget });
    out.ms = I.plans.reduce(function (a, P) { return a + (P.stats ? P.stats.ms : 0); }, 0);
    out.runs = I.plans.reduce(function (a, P) { return a + (P.stats ? P.stats.runs : 0); }, 0);
    out.backtracked = I.plans.filter(function (P) { return P.report.backtrack && P.report.backtrack.skips; }).map(function (P) { return P.room; });
    out.surface = I.plans.reduce(function (a, P) { return a + P.placements.filter(function (p) { return p.anchor === 'surface'; }).length; }, 0);
    return out;
  }
  window._interiors.audit = audit;
  window._interiors.localBox = localBox;
})();
