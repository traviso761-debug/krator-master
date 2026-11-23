/* ================================================================= URUNDASHI RING HAMLETS (CORE/HAMLET), HIGHWAYS & FLORA MASK
   [G data] Places all 5 Urundashi town-ring hamlets from SHUMAR_TUNE.rings (990 people: 2 farming, 1 salt-evaporator, 2 ranch)
   via KHAMLET.village + KHAMLET.shumariRow(), connects overland highways (Amaro 92-km spine, Iziz/Longsong east caravan road,
   Yamu-Qappu lake road, Ordeal supply road), and builds UR_RING.floraClear. Plain records only: no THREE, no DOM. */

var UR_RING = (function () {
  'use strict';

  var FALLBACK_RINGS = [
    { id: 'urundashi.ring.farm-1',  seat: 'srbp1bvh1r', province: 'S4', focus: 'farming', px: 776, py: 1151, people: 240 },
    { id: 'urundashi.ring.farm-2',  seat: 'srbp1bvh1r', province: 'S4', focus: 'farming', px: 782, py: 1155, people: 240 },
    { id: 'urundashi.ring.salt-1',  seat: 'srbp1bvh1r', province: 'S4', focus: 'salt',    px: 774, py: 1156, people: 190 },
    { id: 'urundashi.ring.ranch-1', seat: 'srbp1bvh1r', province: 'S4', focus: 'ranch',   px: 781, py: 1150, people: 160 },
    { id: 'urundashi.ring.ranch-2', seat: 'srbp1bvh1r', province: 'S4', focus: 'ranch',   px: 777, py: 1158, people: 160 }
  ];

  function getRingSpecs() {
    if (typeof SHUMAR_TUNE !== 'undefined' && SHUMAR_TUNE && Array.isArray(SHUMAR_TUNE.rings)) {
      return SHUMAR_TUNE.rings.filter(function (r) { return r.seat === 'srbp1bvh1r'; });
    }
    return FALLBACK_RINGS.slice();
  }

  function runRing() {
    var city = UR_CITY.get();
    var specs = getRingSpecs();
    var row = KHAMLET.shumariRow({ shrine: true, camp: false });

    var groundOk = function (x, z) {
      if (urundashiWater(x, z).wet) return false;
      if (UR.inMoat(x, z, 15)) return false;
      if (urundashiSlope(x, z, 8) > 0.24) return false;
      if (Math.hypot(x, z) < 1200) return false;
      return true;
    };

    var gateMap = {};
    for (var gi = 0; gi < city.grid.gates.length; gi++) {
      var gt = city.grid.gates[gi];
      gateMap[gt.side] = gt;
    }

    var villages = [];
    var ringLots = [];
    var ringWays = [];
    var ringPeople = 0;

    ringWays.push(
      {
        cls: 'highway',
        w: 10,
        tag: 'supp.ssgsv5zbd2 (92 km Royal Steppe Highway W toward Sorun-Manzil & Amaro)',
        pts: [[-660, 40], [-1850, -320], [-4200, -1100], [-7800, -1950], [-12500, -2800]]
      },
      {
        cls: 'highway',
        w: 10,
        tag: 'gate.east-foothills (Eastern Caravan Road toward Iziz & Longsong)',
        pts: [[630, -40], [1850, -210], [4500, -520], [8800, -1050], [13000, -1450]]
      },
      {
        cls: 'highway',
        w: 9.5,
        tag: 'road.urundashi-yamu (52 km Silver-Water Road NE toward Yamu-Qappu & Siru-Yamu)',
        pts: [[40, -360], [650, -1850], [1950, -4800], [3800, -8900], [5600, -12500]]
      },
      {
        cls: 'highway',
        w: 9.0,
        tag: 'Tariq al-Urudiru (Ordeal Supply Road S toward Dubnu-Yayla & Urudiru-Qappu)',
        pts: [[-40, 680], [-480, 2100], [-1100, 5200], [-1800, 9200], [-2400, 12800]]
      }
    );

    for (var i = 0; i < specs.length; i++) {
      var sp = specs[i];
      var sx = (sp.px - UR.PIN[0]) * 2000;
      var sz = (sp.py - UR.PIN[1]) * 2000;
      var linkGate = Math.abs(sx) > Math.abs(sz)
        ? (sx < 0 ? gateMap['u-'] : gateMap['u+'])
        : (sz < 0 ? gateMap['v-'] : gateMap['v+']);
      var linkPt = linkGate ? { x: linkGate.x, z: linkGate.z } : { x: 0, z: 0 };

      var v = KHAMLET.village({
        id: sp.id,
        world: UR.SEED,
        culture: row,
        focus: sp.focus,
        site: { x: sx, z: sz },
        link: linkPt,
        popMax: sp.people,
        resource: { x: sx + 130, z: sz + 85, workers: Math.round(sp.people * 0.44) },
        dims: UR_CITY.dims,
        ground: { ok: groundOk },
        siteReach: 1200,
        vacant: 0
      });
      villages.push(v);
      ringPeople += v.census ? v.census.pop : sp.people;

      var midX = (v.site.x + linkPt.x) * 0.5 + ((KRAND.hash(UR.SEED, i, 81) % 320) - 160);
      var midZ = (v.site.z + linkPt.z) * 0.5 + ((KRAND.hash(UR.SEED, i, 83) % 320) - 160);
      ringWays.push({
        cls: 'side',
        w: 6.5,
        tag: sp.id + ' feeder track',
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
        var D = UR_CITY.dims(r.key, 0);
        var nVar = D ? D.variants : 1;
        var vr = nVar > 1 ? (KRAND.hash(UR.SEED, i + 200, ri, 47) % nVar) : 0;
        var u = [Math.cos(r.ry), -Math.sin(r.ry)];
        var wbo = { c: [r.x, r.z], u: u, v: [-u[1], u[0]], hw: r.w * 0.5, hd: r.d * 0.5 };
        var gy = urundashiH(r.x, r.z);
        var st = KCITY.stance(wbo, urundashiH, { maxDrop: 8 });
        var rec = {
          id: r.id,
          district: 'ring',
          hamletId: sp.id,
          simId: sp.id,
          focus: sp.focus,
          caste: D && D.giant ? 'sword' : 'hearth',
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
      if (urundashiWater(x, z).wet || UR.inMoat(x, z, 3.0)) return false;
      if (Math.abs(x) < 18 && Math.abs(z) < 18) return false;
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
  globalThis.UR_RING = UR_RING;
}
