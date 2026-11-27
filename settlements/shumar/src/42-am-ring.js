/* ================================================================= AMARO RING HAMLETS (CORE/HAMLET), OVERLAND HIGHWAYS & FLORA MASK (Step A1)
   [G data] Places all 6 Amaro town-ring hamlets from SHUMAR_TUNE.rings (1,310 people) via KHAMLET.village + KHAMLET.shumariRow(),
   lays out the plateau trunk highways (dirt.amaro, supp.ssgsv5zbd2, Way of Blades) and ring feeder roads, and builds a unified
   KSPACE clearance index (AM_RING.floraClear) so biomes/shighlands flora never spawns inside a building, street, plaza or river.
   Plain records only: no THREE, no DOM. */

var AM_RING = (function () {
  'use strict';

  var FALLBACK_RINGS = [
    { id: 'amaro.ring.farm-1',    seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 735, py: 1188, people: 240 },
    { id: 'amaro.ring.farm-2',    seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 728, py: 1189, people: 240 },
    { id: 'amaro.ring.farm-3',    seat: 'ssgsv5zbd2', province: 'S1', focus: 'farming', px: 734, py: 1194, people: 240 },
    { id: 'amaro.ring.orchard-1', seat: 'ssgsv5zbd2', province: 'S1', focus: 'orchard', px: 729, py: 1195, people: 240 },
    { id: 'amaro.ring.quarry-1',  seat: 'ssgsv5zbd2', province: 'S1', focus: 'quarry',  px: 737, py: 1195, people: 190 },
    { id: 'amaro.ring.ranch-1',   seat: 'ssgsv5zbd2', province: 'S1', focus: 'ranch',   px: 726, py: 1191, people: 160 }
  ];

  function getRingSpecs() {
    if (typeof SHUMAR_TUNE !== 'undefined' && SHUMAR_TUNE && Array.isArray(SHUMAR_TUNE.rings)) {
      return SHUMAR_TUNE.rings.filter(function (r) { return r.seat === 'ssgsv5zbd2'; });
    }
    return FALLBACK_RINGS.slice();
  }

  function runRing() {
    var city = AM_CITY.get();
    var specs = getRingSpecs();
    var row = KHAMLET.shumariRow({ shrine: true, camp: false });

    var groundOk = function (x, z) {
      var w = amaroWater(x, z);
      if (w.wet) return false;
      var sl = amaroSlope(x, z, 8);
      if (sl > 0.22) return false;
      /* Stay clear of main gorge rims */
      if (Math.hypot(x, z) < 1550) return false;
      return true;
    };

    var villages = [];
    var ringLots = [];
    var ringWays = [];
    var ringPeople = 0;

    /* Overland plateau trunk highways converging on Amaro's gates & Payaru-Gisr bridge */
    ringWays.push(
      {
        cls: 'highway',
        w: 10,
        tag: 'dirt.amaro (Western Trunk Highway toward Betun-Babu & Dalab)',
        pts: [[60, -1108], [-180, -1420], [-950, -2100], [-3200, -3900], [-6000, -6000], [-11500, -9800]]
      },
      {
        cls: 'highway',
        w: 10,
        tag: 'supp.ssgsv5zbd2 (Eastern Steppe Highway toward Urundashi)',
        pts: [[0, 444], [520, 880], [1850, 1250], [4600, 620], [8000, -8000], [13500, -12000]]
      },
      {
        cls: 'highway',
        w: 9.5,
        tag: 'Tariq al-Suyuf (The Way of Blades south toward Qubbat al-Qappu & Urudiru Ordeal)',
        pts: [[0, 444], [140, 1180], [920, 2650], [2800, 5200], [6000, 9500], [11200, 14500]]
      }
    );

    for (var i = 0; i < specs.length; i++) {
      var sp = specs[i];
      var sx = (sp.px - AM.PIN[0]) * 2000;
      var sz = (sp.py - AM.PIN[1]) * 2000;
      /* North-of-gorge hamlets link via Payaru-Gisr North Bridgehead (60, -1108); south plateau hamlets link via South Gate (0, 444) */
      var linkPt = sz < -1100 ? { x: 60, z: -1108 } : { x: 0, z: 444 };
      var v = KHAMLET.village({
        id: sp.id,
        world: AM.SEED,
        culture: row,
        focus: sp.focus,
        site: { x: sx, z: sz },
        link: linkPt,
        popMax: sp.people,
        resource: { x: sx + 140, z: sz + 90, workers: Math.round(sp.people * 0.42) },
        dims: AM_CITY.dims,
        ground: { ok: groundOk },
        siteReach: 1200,
        vacant: 0.08
      });
      villages.push(v);
      ringPeople += v.census ? v.census.pop : sp.people;

      /* Feeder track from village green toward Amaro trunk network */
      var midX = (v.site.x + linkPt.x) * 0.5 + ((KRAND.hash(AM.SEED, i, 71) % 360) - 180);
      var midZ = (v.site.z + linkPt.z) * 0.5 + ((KRAND.hash(AM.SEED, i, 73) % 360) - 180);
      ringWays.push({
        cls: 'side',
        w: 6.5,
        tag: sp.id + ' feeder road',
        pts: [[v.site.x, v.site.z], [midX, midZ], [linkPt.x, linkPt.z]]
      });

      for (var li = 0; li < v.lanes.length; li++) {
        var ln = v.lanes[li];
        ringWays.push({
          cls: 'lane',
          w: ln.w,
          tag: ln.id,
          district: sp.id,
          pts: ln.pts
        });
      }

      for (var ri = 0; ri < v.records.length; ri++) {
        var r = v.records[ri];
        var D = AM_CITY.dims(r.key, 0);
        var nVar = D ? D.variants : 1;
        var vr = nVar > 1 ? (KRAND.hash(AM.SEED, i + 100, ri, 43) % nVar) : 0;
        var u = [Math.cos(r.ry), -Math.sin(r.ry)];
        var wbo = { c: [r.x, r.z], u: u, v: [-u[1], u[0]], hw: r.w * 0.5, hd: r.d * 0.5 };
        var gy = amaroH(r.x, r.z);
        var st = KCITY.stance(wbo, amaroH, { maxDrop: 10 });
        var rec = {
          id: r.id,
          district: 'ring',
          hamletId: sp.id,
          simId: sp.id,
          focus: sp.focus,
          key: r.key,
          v: vr,
          x: r.x,
          z: r.z,
          y: st ? st.y : gy,
          ry: r.ry,
          w: r.w,
          d: r.d,
          h: r.h,
          giant: D ? D.giant : false,
          kind: r.role === 'house' ? 'house' : 'civic',
          hero: false,
          skyline: false,
          vacant: !!r.vacant,
          progress: r.vacant ? 0.35 : 1.0,
          workId: null,
          people: r.vacant ? 0 : (r.households ? Math.round(r.households * 5.2) : 0),
          drop: st ? st.drop : 0,
          why: sp.id + ' (' + sp.focus + '): ' + r.role,
          bo: wbo
        };
        ringLots.push(rec);
      }
    }

    /* Build unified KSPACE clearance index for flora & rock scattering (buildings + street samples) */
    var mask = KSPACE.create({ cell: 32 });
    var allBuildings = city.lots.concat(ringLots);
    for (var bi = 0; bi < allBuildings.length; bi++) {
      var b = allBuildings[bi];
      var rad = Math.hypot(b.w * 0.5, b.d * 0.5) + 3.5;
      mask.insert({ kind: 'lot', x: b.x, z: b.z, r: rad }, b.x, b.z, rad);
    }
    var allWays = city.ways.concat(ringWays);
    for (var wi = 0; wi < allWays.length; wi++) {
      var w = allWays[wi];
      var hr = (w.w == null ? 6 : w.w) * 0.5 + 2.5;
      for (var pi = 1; pi < w.pts.length; pi++) {
        var a = w.pts[pi - 1], c = w.pts[pi];
        var segL = Math.hypot(c[0] - a[0], c[1] - a[1]);
        var steps = Math.max(1, Math.ceil(segL / 14));
        for (var s = 0; s <= steps; s++) {
          var t = s / steps;
          var sxp = a[0] + (c[0] - a[0]) * t;
          var szp = a[1] + (c[1] - a[1]) * t;
          mask.insert({ kind: 'way', x: sxp, z: szp, r: hr }, sxp, szp, hr);
        }
      }
    }

    var floraClear = function (x, z, extraPad) {
      var pad = extraPad == null ? 0 : extraPad;
      if (amaroWater(x, z).wet) return false;
      /* Lip Meydan kept clear */
      if (x > -62 && x < 62 && z > -436 && z < -340) return false;
      var hits = mask.query(x, z, 28 + pad);
      for (var hi = 0; hi < hits.length; hi++) {
        if (Math.hypot(x - hits[hi].x, z - hits[hi].z) < hits[hi].r + pad) return false;
      }
      return true;
    };

    return {
      specs: specs,
      villages: villages,
      lots: ringLots,
      ways: ringWays,
      people: ringPeople,
      mask: mask,
      floraClear: floraClear
    };
  }

  var built = null;
  function get() {
    if (!built) built = runRing();
    return built;
  }

  return {
    run: runRing,
    get: get
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.AM_RING = AM_RING;
}
