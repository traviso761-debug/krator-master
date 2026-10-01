/* ======================== Page audit: plan + measured geometry ========================
   window._interiors.audit() is what verify.py --assert runs. For every demo room it runs
   IX.audit() (48-audit.js: declared footprints, doors, clearance, reach, required pieces,
   determinism by furnishing again), then measures the BUILT pieces:
     measured-inside   every vertex, taken into the piece's own frame, gives a box whose four
                       corners lie inside the room polygon (within TOL of its edges)
     measured-height   that box spans floor - TOL .. ceiling + TOL
     builds            the catalog built it without error, with at least one mesh, no NaN
   TOL = max(0.06 m, 4 % of the dimension): the catalog's own declared-size tolerance
   (kits/catalog verify.py) plus a centimetre.
   Then the planned buildings, the walkers and the light budget:
     building      IX.auditBuilding (48-audit.js): rooms inside the footprint and apart, doors,
                   stairs joining storeys, every room reachable from the street on the graph AND
                   walked to on the grids through doors and up stairs
     plan-determinism  planning every building again gives the same JSON
     walkers       IX.life.audit: every walker routes, reaches its target's use zone and dwells
                   there, never walks through a blocked cell; and the walkers made again from a
                   fresh nav stand at the same places at the same times
     lights        the scene holds at most the pool's point lights (the adapter strips the
                   catalog's), and the plans carry the stripped lights as data
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
  function audit() {
    const I = window._interiors, out = { rooms: 0, pieces: 0, usable: 0, reached: 0, fails: [], perRoom: [], fallbacks: 0, missing: [] };
    I.rooms.forEach(function (R, i) {
      const P = I.plans[i];
      const A = IX.audit(R, P, I.catalog);
      const fails = A.fails.slice();
      P.placements.forEach(function (p, k) {
        const g = P.objects && P.objects[k];
        if (!g || g.userData.error) { fails.push({ check: 'builds', msg: R.id + ': ' + p.id + ' ' + p.key + ' did not build' + (g ? ': ' + g.userData.error : '') }); return; }
        const B = localBox(g, p);
        if (!B.n || B.nan) { fails.push({ check: 'builds', msg: R.id + ': ' + p.id + ' ' + p.key + (B.nan ? ' has NaN geometry' : ' has no mesh') }); return; }
        const tw = Math.max(0.06, 0.04 * p.w / 2 * 2), td = Math.max(0.06, 0.04 * p.d), th = Math.max(0.06, 0.04 * p.h);
        if (p.anchor !== 'surface') {
          /* the measured box, shrunk by the tolerance, must sit inside the polygon */
          const r = G.localRect(p.x, p.z, p.ry, Math.min(0, B.x0 + tw), Math.max(0, B.x1 - tw), Math.min(0, B.z0 + td), Math.max(0, B.z1 - td));
          for (const c of G.corners(r)) if (!G.inside(R.poly, c[0], c[1]))
            fails.push({ check: 'measured-inside', msg: R.id + ': ' + p.id + ' ' + p.key + ' built geometry leaves the room near [' + c[0].toFixed(2) + ', ' + c[1].toFixed(2) + ']' });
        }
        if (B.y0 < R.y - th || B.y1 > R.y + R.h + th)
          fails.push({ check: 'measured-height', msg: R.id + ': ' + p.id + ' ' + p.key + ' built y ' + B.y0.toFixed(2) + '..' + B.y1.toFixed(2) + ' vs room ' + R.y + '..' + (R.y + R.h) });
      });
      out.rooms++; out.pieces += P.placements.length; out.usable += A.usable; out.reached += A.reached;
      out.fallbacks += P.report.fallbacks.length;
      P.report.missing.forEach(function (m) { out.missing.push(R.id + ': ' + m.need + ' (' + m.reason + ')'); });
      out.perRoom.push({ id: R.id, kind: R.kind, culture: R.culture, pieces: P.placements.length, usable: A.usable, reached: A.reached,
        required: P.report.required.map(function (q) { return q.need + ' ' + q.placed + '/' + q.n; }).join(', '),
        fallbacks: P.report.fallbacks.map(function (f) { return f.need + '<-' + f.used; }).join(', '),
        missing: P.report.missing.map(function (m) { return m.need + ':' + m.reason; }).join(', '),
        thin: P.report.thin, fails: fails.length });
      out.fails = out.fails.concat(fails);
    });
    /* planned buildings */
    const byRoom = {};
    I.rooms.forEach(function (R, i) { byRoom[R.id] = I.plans[i]; });
    out.buildings = I.buildings.map(function (B, bi) {
      const A = IX.auditBuilding(B, byRoom);
      A.fails.forEach(function (f) { out.fails.push({ check: 'building', msg: f.check + ': ' + f.msg }); });
      const sp = I.buildingSpecs[bi], again = IX.planBuilding(sp.shell, sp.program, {});
      if (JSON.stringify(IX.exportBuilding(again)) !== JSON.stringify(IX.exportBuilding(B)))
        out.fails.push({ check: 'plan-determinism', msg: B.id + ': planning again gives a different plan' });
      return { id: B.id, levels: B.levels.length, rooms: B.rooms.length, stairs: B.stairs.map(function (S) { return S.kind + ' ' + S.from + '>' + S.to; }).join(', '),
        doors: B.doors.length, walls: B.walls.length, partitions: B.walls.filter(function (w) { return w.kind === 'partition'; }).length,
        roof: B.roof.kind, routes: A.routes, dropped: B.report.dropped.length, fails: A.fails.length };
    });
    /* walkers */
    const W = I.walkers, wf = IX.life.audit(I.nav, W);
    wf.forEach(function (m) { out.fails.push({ check: 'walkers', msg: m }); });
    const W2 = I.makeWalkers(IX.life.nav({ rooms: I.rooms, plans: I.plans, stairs: I.stairs }));
    let same = W2.length === W.length;
    for (let t = 0; t <= 240 && same; t += 3.7) for (let i = 0; i < W.length && same; i++) if (JSON.stringify(W[i].at(t)) !== JSON.stringify(W2[i].at(t))) same = false;
    if (!same) out.fails.push({ check: 'walkers', msg: 'walkers made again stand elsewhere at the same time' });
    out.walkers = W.map(function (w) {
      return { id: w.id, ok: w.ok, target: w.target.placement, type: w.target.type, rooms: w.route.rooms ? w.route.rooms.length : 0,
        storeys: w.route.pts ? new Set(w.route.pts.filter(function (p) { return p.room; }).map(function (p) { return I.rooms.filter(function (R) { return R.id === p.room; })[0].level || 0; })).size : 0,
        len: w.route.len ? Math.round(w.route.len * 10) / 10 : 0, arrive: w.tArrive != null ? Math.round((w.tArrive - w.t0) * 10) / 10 : null };
    });
    /* lights */
    const nData = I.plans.reduce(function (a, P) { return a + (P.lights ? P.lights.length : 0); }, 0);
    const nReal = I.pointLights();
    out.lights = { budget: I.lightBudget, pointLights: nReal, data: nData, kept: I.keepLights };
    if (!I.keepLights && nReal > I.lightBudget) out.fails.push({ check: 'lights', msg: nReal + ' point lights in the scene, budget ' + I.lightBudget });
    if (!nData) out.fails.push({ check: 'lights', msg: 'no lamp light exported as data' });
    if (I.keepLights && nReal !== nData) out.fails.push({ check: 'lights', msg: 'kept ' + nReal + ' real lights but the plans carry ' + nData + ' as data' });
    out.ms = I.plans.reduce(function (a, P) { return a + (P.stats ? P.stats.ms : 0); }, 0);
    out.runs = I.plans.reduce(function (a, P) { return a + (P.stats ? P.stats.runs : 0); }, 0);
    out.backtracked = I.plans.filter(function (P) { return P.report.backtrack && P.report.backtrack.skips; }).map(function (P) { return P.room; });
    out.surface = I.plans.reduce(function (a, P) { return a + P.placements.filter(function (p) { return p.anchor === 'surface'; }).length; }, 0);
    return out;
  }
  window._interiors.audit = audit;
  window._interiors.localBox = localBox;
})();
