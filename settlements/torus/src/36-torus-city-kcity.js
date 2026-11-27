// ================================================================= TORUS — 36: KCITY Instance & SIM Export Adapter ([G data])
// Stage 6 engine-neutral adapters for core/city (KCITY) and core/export ('city' and 'sim' sections).
// Zero THREE, zero DOM. Runs identically in browser and Node tests.

(function (root) {
  'use strict';

  var TORUS = root.TORUS = root.TORUS || {};
  var DEG = Math.PI / 180;

  function num(v, d) {
    return v == null ? d : v;
  }

  function roadPolyline(rd) {
    var pts = [];
    if (rd.kind === 'ring') {
      var segs = 72;
      for (var k = 0; k <= segs; k++) {
        var a = (360 * k / segs) * DEG;
        pts.push([+(rd.r * Math.cos(a)).toFixed(2), +(rd.r * Math.sin(a)).toFixed(2)]);
      }
    } else {
      var rad = rd.deg * DEG;
      var steps = Math.max(2, Math.ceil((rd.r1 - rd.r0) / 48));
      for (var s = 0; s <= steps; s++) {
        var rr = rd.r0 + (rd.r1 - rd.r0) * (s / steps);
        pts.push([+(rr * Math.cos(rad)).toFixed(2), +(rr * Math.sin(rad)).toFixed(2)]);
      }
    }
    return pts;
  }

  function buildKCity(plan, tags) {
    if (typeof KCITY === 'undefined' || !KCITY || !KCITY.create) return null;
    var L = KCITY.lib;
    var obb = L.obb;
    var plFrame = L.plFrame;

    var tune = {
      half: 1200,
      cell: 6,
      exact: false,
      width: { highway: 14, avenue: 10, main: 8, side: 6, alley: 4 },
      lot: { setback: 0.8, rear: 1.2, side: 0.6, step: 4, inset: 0.2 },
      blindMax: 60
    };

    var inst = KCITY.create({
      name: 'torus',
      seed: plan.seed,
      rand: 'krand',
      tune: tune,
      ground: { h: function (x, z) { return TORUS.groundAt ? TORUS.groundAt(x, z) : 0; } },
      steps: [
        {
          name: 'torus 10-terrace cascade, customs wall, ways and lots',
          run: function (C) {
            var P = L.plan();
            var deg = DEG;
            var wallR = plan.site.customsWallR;

            // 1. Torus Light Customs & Granary Wall (r = 1140 m) + 6 Gates
            var wallLine = [];
            var wallSegs = [];
            for (var i = 0; i <= 72; i++) {
              var a = (360 * i / 72) * deg;
              wallLine.push([+(wallR * Math.cos(a)).toFixed(2), +(wallR * Math.sin(a)).toFixed(2)]);
              if (i > 0) {
                wallSegs.push({
                  ax: wallLine[i - 1][0], az: wallLine[i - 1][1],
                  bx: wallLine[i][0], bz: wallLine[i][1],
                  health: 0.88
                });
              }
            }
            var wallNodes = [];
            for (var g = 0; g < plan.gates.length; g++) {
              var gt = plan.gates[g];
              wallNodes.push({
                kind: 'gate', name: gt.name, named: true,
                x: gt.x, z: gt.z, ry: gt.ry,
                health: 0.90
              });
              P.gates.push({ id: gt.id, name: gt.name, p: [gt.x, gt.z], wall: 'customs_wall', born: 0 });
            }
            P.wall = { line: wallLine, nodes: wallNodes, segs: wallSegs };

            // 2. Multi-Altitude & Stepped Terrace Districts
            P.districts = [
              { id: 'forest_ring_core', role: 'civic', r0: 0, r1: 280 },
              { id: 'outer_wheel', role: 'trade', r0: 560, r1: 720, y: 300 },
              { id: 'botanical_crown', role: 'civic', r0: 140, r1: 280, y: 640 },
              { id: 'upper_terraces', role: 'rich', r0: 284, r1: 540 },
              { id: 'mid_terraces', role: 'res', r0: 540, r1: 820 },
              { id: 'lower_terraces', role: 'farm', r0: 820, r1: 1126 },
              { id: 'se_voth_extension', role: 'military', r0: 660, r1: 1120, deg0: 28, deg1: 66 },
              { id: 'soleri_hinterland', role: 'ruin', r0: 1180, r1: 2950 }
            ];

            // 3. Terrace Ring Ways & Radial Stair/Ramp Spokes
            for (var ri = 0; ri < plan.roads.length; ri++) {
              var rd = plan.roads[ri];
              var pts = roadPolyline(rd);
              var cls = rd.width >= 10 ? 'avenue' : (rd.width >= 8 ? 'main' : 'side');
              var closed = rd.kind === 'ring';
              var way = {
                id: P.ways.length,
                cls: cls,
                w: rd.width,
                pts: pts,
                closed: closed,
                born: 0,
                F: plFrame(pts),
                tag: rd.id
              };
              P.ways.push(way);
              C.index.roads.addWay(way);
            }

            // 4. Landmarks (Board Hall, Emissary, Ordinator Palace, Cider-Press, Surviving & Feral Ag-Domes) + 1,803 Terrace/Voth Lots
            for (var li = 0; li < plan.landmarks.length; li++) {
              var lm = plan.landmarks[li];
              if (lm.id === 'forest_ring_arcology') continue;
              var lu = [Math.cos(lm.ry), -Math.sin(lm.ry)];
              var lbo = obb([lm.x, lm.z], lu, lm.w * 0.5, lm.d * 0.5);
              var lRec = {
                id: P.lots.length,
                cls: 'landmark',
                key: lm.id,
                v: 0,
                slot: 0,
                wealth: lm.wealth === 'high' ? 0.86 : 0.62,
                x: lm.x,
                z: lm.z,
                y: lm.y,
                ry: lm.ry,
                w: lm.w,
                d: lm.d,
                h: lm.h,
                lot: lbo,
                bo: lbo,
                way: 0,
                side: 1,
                s: 0,
                born: 0,
                died: null,
                civic: true,
                tag: lm.tagId == null ? null : lm.tagId
              };
              P.lots.push(lRec);
              C.index.lots.add(lRec);
            }

            var allLots = plan.buildings.concat(plan.skyBuildings || [], (plan.hinterland && plan.hinterland.farmOutbuildings) || []);
            for (var bi = 0; bi < allLots.length; bi++) {
              var b = allLots[bi];
              var bu = [Math.cos(b.ry), -Math.sin(b.ry)];
              var bbo = obb([b.x, b.z], bu, b.w * 0.5, b.d * 0.5);
              var blot = obb([b.x, b.z], bu, b.w * 0.5 + 0.3, b.d * 0.5 + 0.5);
              var wVal = b.wealth === 'high' ? 0.80 : (b.wealth === 'middle' ? 0.56 : 0.34);
              var bCls = b.district === 'se_voth_extension' ? 'civic' : (b.job ? 'trade' : 'res');
              var bRec = {
                id: P.lots.length,
                cls: bCls,
                key: b.key,
                v: bi % 3,
                slot: 0,
                wealth: wVal,
                x: b.x,
                z: b.z,
                y: b.y,
                ry: b.ry,
                w: b.w,
                d: b.d,
                h: b.h,
                lot: blot,
                bo: bbo,
                way: bi % Math.max(1, P.ways.length),
                side: bi % 2 === 0 ? 1 : -1,
                s: 0,
                born: 0,
                died: null,
                civic: false,
                tag: b.tagId == null ? null : b.tagId
              };
              P.lots.push(bRec);
              C.index.lots.add(bRec);
            }
          }
        }
      ]
    });

    inst.run();
    if (typeof KCITY.registerExport === 'function') KCITY.registerExport();
    return inst;
  }

  function simExport(opt) {
    var o = opt || {};
    if (typeof SIM === 'undefined' || !SIM || typeof SIM.export !== 'function') return null;
    var doc = SIM.export({ log: 0, nav: false });
    doc.profile = 'torus';

    var E = (typeof SIM.econ === 'function' ? SIM.econ() : null) || SIM.ECON;
    var goods = {};
    if (E && E.goods) {
      var gKeys = Object.keys(E.goods);
      for (var gi = 0; gi < gKeys.length; gi++) {
        var g = gKeys[gi];
        var wh = 0, si = 0, ct = 0;
        for (var wi = 0; wi < E.warehouses.length; wi++) wh += num(E.warehouses[wi].stock[g], 0);
        for (var sIdx = 0; sIdx < E.sites.length; sIdx++) si += num(E.sites[sIdx].stock[g], 0);
        for (var ci = 0; ci < E.carts.length; ci++) {
          var ld = E.carts[ci].cart && E.carts[ci].cart.load;
          if (ld && ld.good === g) ct += num(ld.n, 0);
        }
        goods[g] = {
          warehouses: wh,
          sites: si,
          carts: ct,
          total: wh + si + ct,
          made: num(E.made[g], 0),
          used: num(E.used[g], 0),
          imported: num(E.imported[g], 0),
          exported: num(E.exported[g], 0),
          short: num(E.short[g], 0)
        };
      }
    }

    var residentCount = 0;
    var workerCount = 0;
    for (var ai = 0; ai < doc.actors.length; ai++) {
      var a = doc.actors[ai];
      var liveA = SIM.R && SIM.R.actor ? SIM.R.actor[a.id] : null;
      a.settlement = 'torus';
      if (liveA && liveA.driven) a.driven = true;
      else {
        residentCount++;
        if (a.work != null) workerCount++;
      }
    }

    var producers = [];
    if (E && E.recipes) {
      var rKeys = Object.keys(E.recipes);
      for (var rk = 0; rk < rKeys.length; rk++) {
        var pid = rKeys[rk];
        var rec = E.recipes[pid];
        producers.push({ place: pid, out: Array.isArray(rec.out) ? rec.out.slice() : [], rate: rec.rate });
      }
    }

    doc.settlements = [
      {
        id: 'torus',
        name: 'Torus (Tors / Rinkvolk)',
        level: 'presented',
        people: residentCount,
        workers: workerCount,
        warehouses: E ? E.warehouses.map(function (p) { return p.id; }) : [],
        sites: E ? E.sites.map(function (p) { return p.id; }) : [],
        carts: E ? E.carts.map(function (c) { return c.id; }) : [],
        goods: goods,
        producers: producers
      }
    ];

    if (o.box && typeof SIM.exportMotion === 'function') {
      var b = o.box;
      var inB = function (P) {
        return !!P && P.x >= b[0] && P.x < b[2] && P.z >= b[1] && P.z < b[3];
      };
      var acts = SIM.all('actor').filter(function (ac) {
        if (ac.driven) return false;
        var ph = ac.home ? SIM.R.place[ac.home] : null;
        var pw = ac.work ? SIM.R.place[ac.work] : null;
        return inB(ph) || inB(pw);
      });
      if (acts.length > 240) acts = acts.slice(0, 240);
      for (var mi = 0; mi < acts.length; mi++) {
        var tk = acts[mi].task;
        if (tk && Array.isArray(tk.legs)) {
          for (var li2 = 0; li2 < tk.legs.length; li2++) {
            var leg = tk.legs[li2];
            if (!leg.route && leg.lazy && typeof SIM.legRoute === 'function') SIM.legRoute(leg);
          }
        }
      }
      var M = SIM.exportMotion({ actors: acts });
      doc.motion = {
        box: b.slice(),
        town: 'torus',
        t: M.t,
        times: M.times,
        actors: M.actors,
        routes: M.routes,
        rows: M.rows
      };
    }

    return JSON.parse(JSON.stringify(doc));
  }

  function simExportChecks(doc) {
    var out = [];
    if (!doc || doc.format !== 'krator-sim' || !Array.isArray(doc.settlements) || doc.settlements.length !== 1) {
      out.push({ name: 'sim export: krator-sim container with Torus settlement', ok: false, detail: doc ? String(doc.format) : 'null' });
      return out;
    }
    var P = {};
    for (var i = 0; i < doc.places.length; i++) P[doc.places[i].id] = doc.places[i];
    var T = doc.settlements[0];
    var badRef = [];
    for (var w = 0; w < T.warehouses.length; w++) {
      if (!P[T.warehouses[w]]) badRef.push('wh:' + T.warehouses[w]);
    }
    for (var a = 0; a < doc.actors.length; a++) {
      var ac = doc.actors[a];
      if (ac.home != null && !P[ac.home]) badRef.push(ac.id + '.home:' + ac.home);
      if (ac.work != null && !P[ac.work]) badRef.push(ac.id + '.work:' + ac.work);
    }
    out.push({
      name: 'sim export: all warehouses, homes & workplaces resolve in krator-sim places',
      ok: badRef.length === 0 && doc.actors.length >= 8500 && T.people >= 8450,
      detail: 'places=' + doc.places.length + ', actors=' + doc.actors.length + ', people=' + T.people + ', bad=' + badRef.length
    });

    var gKeys = Object.keys(T.goods);
    var stockMismatch = [];
    for (var gk = 0; gk < gKeys.length; gk++) {
      var g = gKeys[gk];
      var sum = 0;
      for (var wi = 0; wi < T.warehouses.length; wi++) {
        var wp = P[T.warehouses[wi]];
        sum += (wp && wp.stock && wp.stock[g] != null) ? wp.stock[g] : 0;
      }
      if (Math.abs(sum - T.goods[g].warehouses) > 1e-6) stockMismatch.push(g);
    }
    out.push({
      name: 'sim export: warehouse good books match exported place stocks',
      ok: gKeys.length >= 10 && stockMismatch.length === 0,
      detail: 'goods=' + gKeys.length + ', mismatch=' + stockMismatch.length
    });
    return out;
  }

  function simExportRegister() {
    var fn = function (ctx) { return simExport({ box: ctx && ctx.box }); };
    var opt = { by: 'torus-sim' };
    if (typeof EXPORT !== 'undefined' && EXPORT && typeof EXPORT.register === 'function') {
      TORUS._simExportOff = EXPORT.register('sim', fn, opt);
      return true;
    }
    var q = root.EXPORT_QUEUE = root.EXPORT_QUEUE || [];
    q.push(['sim', fn, opt]);
    return false;
  }

  TORUS.buildKCity = buildKCity;
  TORUS.simExport = simExport;
  TORUS.simExportChecks = simExportChecks;
  TORUS.simExportRegister = simExportRegister;
  simExportRegister();
})(typeof window !== 'undefined' ? window : globalThis);
