/* ==================== core/camp 58 (opt-in): sea-nomad `fleet` bands, Deep-Ward roadstead & macrotidal careening (plain data, [G data]) ==================== */
/* arcoforte_tide_plan.md sections 2.2, 2.3 and 2.5; settlements/fleetborn-cove/PLAN.md; core/simulation/SCHEMA.md.
   OPT-IN: sits in core/camp/fleet/ so no unrelated page changes bytes unless its build lists this file after
   core/camp/10-camp-cultures.js. Pure [G data]: zero THREE, zero DOM, KRAND only, numeric defaults `x == null ? d : x`.

   Exports on KCAMP:
     KCAMP.FLEET_HULLS               vessel spec table for 89c..89h & semantic aliases (draft_m, crewCap, cargoCap, deepCareen)
     KCAMP.hullSpec(key)             resolves any vessel key ('89g', 'ark_ward', 'arkChainedWard', ...) to its spec
     KCAMP.CULTURES.fleetborn        pure cFlit-qBon sea-nomad fleet culture row
     KCAMP.CULTURES['fleetborn-whaler'] mixed Fleet-born + Hueru-Kuran whaler fleet culture row
     KCAMP.PORTS                     canonical scale-model port & roadstead table (arcoforte, deep_ward, farport, ...)
     KCAMP.portDistanceKm(a, b)      scale-model distance (km, 2 km/px) between two port ids or {px} records
     KCAMP.portBearingDeg(a, b)      compass bearing (0 = N, 90 = E, 180 = S, 270 = W) from port a to port b
     KCAMP.DEFAULT_FLEETS            the 5 canonical nomad fleets (~2,060 visiting citizens + ~420 caretakers at a moot)
     KCAMP.fleetMooring(spec)        deterministic non-overlapping harbour mooring ring / horseshoe ([G data])
     KCAMP.fleetWorld(opts)          world-level tidal fleet simulator state
     KCAMP.fleetTick(W, day)         advances one world day under Laws 1, 2 & 3
     KCAMP.fleetRun(W, d0, d1)       runs days d0 .. d1 - 1
     KCAMP.fleetsAt(W, portId, day)  fleets moored at portId on `day` (or current state if day is omitted) */
(function () {
  'use strict';
  if (typeof KCAMP === 'undefined' || !KCAMP.CULTURES) {
    throw new Error('core/camp/fleet: load core/camp 10 first');
  }

  var PX_KM = 2.0;
  var DEEP_DRAFT_LIMIT_M = 2.2;
  var DEEP_CRADLE_GATE_M = 5.6;
  var GREAT_CRADLE_GATE_M = 6.6;

  /* 1. Canonical vessel hulls (kits/ringsea 89c..89h): exact L/B/H footprints, drafts, capacities & deepCareen */
  var BASE_HULLS = [
    {
      key: '89g',
      alias: 'ark_ward',
      rsKey: 'arkChainedWard',
      name: 'Coupled 3-Hull Chained Ark-Ward',
      kind: 'chief',
      tier: 0,
      w: 32.0,
      d: 40.0,
      h: 20.0,
      draft_m: 5.4,
      crewCap: 120,
      cargoCap: 90,
      households: 16
    },
    {
      key: '89c',
      alias: 'ark_catamaran',
      rsKey: 'arkCatamaran',
      name: 'Great Moon-Pool Ark-Catamaran',
      kind: 'dwelling',
      tier: 1,
      w: 14.0,
      d: 36.0,
      h: 21.0,
      draft_m: 5.2,
      crewCap: 54,
      cargoCap: 45,
      households: 7
    },
    {
      key: '89d',
      alias: 'smelt_barge',
      rsKey: 'arkSmelter',
      name: 'Paktong Phytomining Smelt-Barge',
      kind: 'trade',
      tier: 1,
      w: 12.0,
      d: 28.0,
      h: 15.0,
      draft_m: 4.8,
      crewCap: 24,
      cargoCap: 65,
      households: 0
    },
    {
      key: '89e',
      alias: 'vent_tender',
      rsKey: 'arkDiveTender',
      altAlias: 'dive_tender',
      name: 'Deep-Trench Vent-Harvester Tender',
      kind: 'trade',
      tier: 2,
      w: 9.5,
      d: 22.0,
      h: 13.0,
      draft_m: 2.0,
      crewCap: 12,
      cargoCap: 18,
      households: 0
    },
    {
      key: '89f',
      alias: 'scout_trimaran',
      rsKey: 'arkScoutTri',
      name: 'Fast Crab-Claw Scout Trimaran',
      kind: 'sleep',
      tier: 2,
      w: 10.0,
      d: 17.0,
      h: 14.5,
      draft_m: 1.5,
      crewCap: 6,
      cargoCap: 8,
      households: 0
    },
    {
      key: '89h',
      alias: 'hk_whaler',
      rsKey: 'hkWhaleCat',
      name: 'Hueru-Kuran Whalebone Baidarka Whaler',
      kind: 'sleep',
      tier: 2,
      w: 8.5,
      d: 20.0,
      h: 11.5,
      draft_m: 1.9,
      crewCap: 12,
      cargoCap: 14,
      households: 0
    }
  ];

  var HULL_MAP = {};
  var PENDING = {};
  (function () {
    var i, b, rec, keys, j;
    for (i = 0; i < BASE_HULLS.length; i++) {
      b = BASE_HULLS[i];
      rec = Object.freeze({
        key: b.key,
        alias: b.alias,
        rsKey: b.rsKey,
        name: b.name,
        kind: b.kind,
        tier: b.tier,
        w: b.w,
        d: b.d,
        h: b.h,
        draft_m: b.draft_m,
        crewCap: b.crewCap,
        cargoCap: b.cargoCap,
        deepCareen: b.draft_m > DEEP_DRAFT_LIMIT_M,
        households: b.households
      });
      keys = [b.key, b.alias, b.rsKey];
      if (b.altAlias) keys.push(b.altAlias);
      for (j = 0; j < keys.length; j++) {
        HULL_MAP[keys[j]] = rec;
        PENDING[keys[j]] = {w: b.w, d: b.d, h: b.h, draft_m: b.draft_m, what: b.name};
      }
    }
  })();

  var hullSpec = function (k) {
    return k && HULL_MAP[k] ? HULL_MAP[k] : null;
  };

  var makeCultureRow = function (includeWhaler) {
    var households = {}, work = {}, hulls = {}, k, h;
    for (k in HULL_MAP) {
      h = HULL_MAP[k];
      if (!includeWhaler && h.key === '89h') continue;
      hulls[k] = h;
      if (h.households > 0) households[k] = h.households;
      if (h.key === '89d') work[k] = {role: 'smelter', n: 8};
      else if (h.key === '89e') work[k] = {role: 'diver', n: 6};
      else if (h.key === '89h') work[k] = {role: 'whaler', n: 8};
    }
    return {
      bandKind: 'fleet',
      kind: function (key) {
        var s = hullSpec(key);
        if (!s) return null;
        if (!includeWhaler && s.key === '89h') return null;
        return s.kind;
      },
      hull: function (key) {
        var s = hullSpec(key);
        if (!s || (!includeWhaler && s.key === '89h')) return null;
        return s;
      },
      hulls: hulls,
      households: households,
      household: [5, 7],
      chiefHousehold: [6, 8],
      sleepers: includeWhaler ? [4, 10] : [4, 6],
      work: work,
      elderShare: 0.32,
      mountsPer: 0,
      wind: [0.0, 1.0],
      formation: 'horseshoe',
      pending: Object.assign({}, PENDING)
    };
  };

  KCAMP.FLEET_HULLS = Object.freeze(Object.assign({}, HULL_MAP));
  KCAMP.hullSpec = hullSpec;
  KCAMP.CULTURES.fleetborn = makeCultureRow(false);
  KCAMP.CULTURES['fleetborn-whaler'] = makeCultureRow(true);

  /* 2. Canonical scale-model ports & roadsteads (2 km/px) */
  var PORTS = Object.freeze({
    arcoforte: Object.freeze({
      id: 'arcoforte',
      name: 'Arcoforte / Fleetborn Cove',
      settlementId: 'site:fleetborn-arcoforte',
      px: Object.freeze([236, 242]),
      distFromArcoforte_km: 0,
      bearing_deg: 0,
      tideRange_m: 11.0,
      springMax_m: 14.3,
      diurnal: false,
      canCareenDeep: true,
      role: 'spring_drydock_and_moot'
    }),
    deep_ward: Object.freeze({
      id: 'deep_ward',
      name: 'Deep-Ward Anchorage',
      settlementId: 'sdeepward1',
      px: Object.freeze([148, 492]),
      distFromArcoforte_km: 530,
      bearing_deg: 199,
      tideRange_m: 1.9,
      diurnal: true,
      canCareenDeep: false,
      role: 'home_storm_roadstead'
    }),
    farport: Object.freeze({
      id: 'farport',
      name: 'Farport Factorate',
      px: Object.freeze([294, 588]),
      tideRange_m: 2.1,
      diurnal: false,
      canCareenDeep: false,
      role: 'factorate_trade_port'
    }),
    copper_tarn_landing: Object.freeze({
      id: 'copper_tarn_landing',
      name: 'Crookshore / Copper Tarn Landing',
      px: Object.freeze([162, 820]),
      inlandFairPx: Object.freeze([146, 1147]),
      tideRange_m: 2.0,
      diurnal: false,
      canCareenDeep: false,
      role: 'ore_and_nephrite_landing'
    }),
    arch_trench: Object.freeze({
      id: 'arch_trench',
      name: 'Arch Outer Seamounts & Vents',
      px: Object.freeze([205, 198]),
      tideRange_m: 1.6,
      diurnal: false,
      canCareenDeep: false,
      role: 'pelagic_vent_dive_grounds'
    }),
    ria_sound: Object.freeze({
      id: 'ria_sound',
      name: 'Ria Sound (Floating City)',
      px: Object.freeze([635, 138]),
      tideRange_m: 8.6,
      diurnal: false,
      canCareenDeep: true,
      role: 'eastern_allied_anchorage'
    })
  });

  var resolvePort = function (ports, p) {
    if (!p) return null;
    if (typeof p === 'string') return (ports && ports[p]) || PORTS[p] || null;
    return p.px ? p : null;
  };

  var portDistanceKm = function (a, b, ports) {
    var pa = resolvePort(ports, a), pb = resolvePort(ports, b);
    if (!pa || !pb) throw new Error('KCAMP.portDistanceKm: unknown port');
    return Math.hypot(pb.px[0] - pa.px[0], pb.px[1] - pa.px[1]) * PX_KM;
  };

  var portBearingDeg = function (a, b, ports) {
    var pa = resolvePort(ports, a), pb = resolvePort(ports, b);
    if (!pa || !pb) throw new Error('KCAMP.portBearingDeg: unknown port');
    var dx = pb.px[0] - pa.px[0], dy = pb.px[1] - pa.px[1];
    if (dx === 0 && dy === 0) return 0;
    /* Scale-model y increases southward: compass 0 = N (-y), 90 = E (+x), 180 = S (+y), 270 = W (-x) */
    return ((Math.atan2(dx, -dy) * 180 / Math.PI) + 360) % 360;
  };

  KCAMP.PORTS = PORTS;
  KCAMP.portDistanceKm = portDistanceKm;
  KCAMP.portBearingDeg = portBearingDeg;

  /* 3. The 5 canonical sea-nomad fleets (~2,060 visiting citizens across 83 hulls + ~420 caretakers = ~2,480 at a moot) */
  var buildHullList = function (fleetId, groups) {
    var list = [], g, i, s, seq = {};
    for (g = 0; g < groups.length; g++) {
      var grp = groups[g], count = grp.n;
      s = hullSpec(grp.key);
      for (i = 0; i < count; i++) {
        var idx = seq[s.key] == null ? 0 : seq[s.key];
        seq[s.key] = idx + 1;
        list.push(Object.freeze({
          id: fleetId + ':' + s.key + ':' + idx,
          key: grp.key,
          name: s.name,
          draft_m: s.draft_m,
          deepCareen: s.deepCareen,
          pop: grp.pop,
          cargoCap: s.cargoCap,
          careenInterval_d: grp.careenInterval_d,
          initialDaysSinceCareen: grp.initAge == null ? 0 : grp.initAge
        }));
      }
    }
    return Object.freeze(list);
  };

  var makeFleetDef = function (spec) {
    var hulls = buildHullList(spec.id, spec.groups);
    var pop = 0, cargo = 0, i;
    for (i = 0; i < hulls.length; i++) {
      pop += hulls[i].pop;
      cargo += hulls[i].cargoCap;
    }
    return Object.freeze({
      id: spec.id,
      kind: 'fleet',
      name: spec.name,
      culture: spec.culture,
      homePort: 'deep_ward',
      people: pop,
      cargoCap: cargo,
      kmPerDay: spec.kmPerDay == null ? 210 : spec.kmPerDay,
      hulls: hulls,
      route: Object.freeze(spec.route.slice()),
      tradeProfile: Object.freeze({
        brings: Object.freeze(spec.brings.slice()),
        takes: Object.freeze(spec.takes.slice())
      })
    });
  };

  var DEFAULT_FLEETS = Object.freeze([
    makeFleetDef({
      id: 'ward_ring',
      name: 'The Ward-Ring',
      culture: 'fleetborn',
      kmPerDay: 205,
      groups: [
        {key: '89g', n: 2, pop: 115, careenInterval_d: 36, initAge: 15},
        {key: '89c', n: 4, pop: 50, careenInterval_d: 36, initAge: 15},
        {key: '89e', n: 4, pop: 12, careenInterval_d: 30, initAge: 12},
        {key: '89f', n: 4, pop: 5, careenInterval_d: 28, initAge: 10},
        {key: '89f', n: 2, pop: 6, careenInterval_d: 28, initAge: 10}
      ],
      route: ['deep_ward', 'farport', 'deep_ward', 'arcoforte'],
      brings: ['cured_kelp', 'pearl_shell', 'salt_fish', 'nephrite_fittings'],
      takes: ['paktong_ingots', 'araucaria_spars', 'cordage', 'caulking_pitch']
    }),
    makeFleetDef({
      id: 'smelt_fleet',
      name: 'The Smelt Fleet',
      culture: 'fleetborn',
      kmPerDay: 200,
      groups: [
        {key: '89g', n: 1, pop: 110, careenInterval_d: 32, initAge: 19},
        {key: '89c', n: 3, pop: 48, careenInterval_d: 32, initAge: 19},
        {key: '89d', n: 5, pop: 24, careenInterval_d: 32, initAge: 19},
        {key: '89e', n: 3, pop: 12, careenInterval_d: 28, initAge: 14},
        {key: '89f', n: 4, pop: 5, careenInterval_d: 26, initAge: 12}
      ],
      route: ['deep_ward', 'copper_tarn_landing', 'farport', 'arcoforte'],
      brings: ['copper_zinc_ore', 'nephrite_blanks', 'charcoal_flux'],
      takes: ['paktong_ingots', 'nickel_ash', 'cordage', 'araucaria_spars']
    }),
    makeFleetDef({
      id: 'trench_fleet',
      name: 'The Trench Fleet',
      culture: 'fleetborn',
      kmPerDay: 215,
      groups: [
        {key: '89g', n: 1, pop: 110, careenInterval_d: 33, initAge: 28},
        {key: '89c', n: 4, pop: 48, careenInterval_d: 33, initAge: 28},
        {key: '89e', n: 6, pop: 12, careenInterval_d: 26, initAge: 20},
        {key: '89f', n: 6, pop: 6, careenInterval_d: 26, initAge: 18}
      ],
      route: ['arch_trench', 'deep_ward', 'arch_trench', 'arcoforte'],
      brings: ['vent_sulfur', 'frost_coral', 'byssus_raw', 'ambergris'],
      takes: ['paktong_tools', 'cordage', 'salt_fish', 'caulking_pitch']
    }),
    makeFleetDef({
      id: 'outer_whalers',
      name: 'The Outer Whalers',
      culture: 'fleetborn-whaler',
      kmPerDay: 220,
      groups: [
        {key: '89g', n: 1, pop: 106, careenInterval_d: 39, initAge: 34},
        {key: '89c', n: 3, pop: 48, careenInterval_d: 39, initAge: 34},
        {key: '89h', n: 8, pop: 12, careenInterval_d: 28, initAge: 22},
        {key: '89e', n: 2, pop: 12, careenInterval_d: 28, initAge: 20},
        {key: '89f', n: 4, pop: 5, careenInterval_d: 26, initAge: 18}
      ],
      route: ['deep_ward', 'copper_tarn_landing', 'arch_trench', 'arcoforte'],
      brings: ['whale_oil', 'shark_ray_hide', 'whalebone', 'cured_blubber'],
      takes: ['paktong_harpoons', 'cordage', 'sea_salt', 'araucaria_spars']
    }),
    makeFleetDef({
      id: 'island_traders',
      name: 'The Island Traders',
      culture: 'fleetborn',
      kmPerDay: 225,
      groups: [
        {key: '89c', n: 4, pop: 50, careenInterval_d: 39, initAge: 33},
        {key: '89d', n: 2, pop: 22, careenInterval_d: 39, initAge: 33},
        {key: '89e', n: 4, pop: 11, careenInterval_d: 28, initAge: 20},
        {key: '89f', n: 4, pop: 5, careenInterval_d: 26, initAge: 18},
        {key: '89f', n: 2, pop: 6, careenInterval_d: 26, initAge: 18}
      ],
      route: ['deep_ward', 'farport', 'ria_sound', 'arcoforte'],
      brings: ['ria_grain', 'farport_cloth', 'tin_copper_ingots', 'spices'],
      takes: ['paktong_ingots', 'byssus_cloth', 'salt_fish', 'kauri_gum']
    })
  ]);

  KCAMP.DEFAULT_FLEETS = DEFAULT_FLEETS;

  /* 4. Deterministic harbour mooring ring / horseshoe: KCAMP.fleetMooring(spec) */
  var obbCorners = function (b, pad) {
    var p = pad == null ? 0 : pad;
    var c = Math.cos(b.rot), s = Math.sin(b.rot), hw = b.w * 0.5 + p, hd = b.d * 0.5 + p;
    return [
      [b.x - c * hw - s * hd, b.z + s * hw - c * hd],
      [b.x + c * hw - s * hd, b.z - s * hw - c * hd],
      [b.x + c * hw + s * hd, b.z - s * hw + c * hd],
      [b.x - c * hw + s * hd, b.z + s * hw + c * hd]
    ];
  };

  var sepOBB = function (A, B) {
    var Q, P, j, k, a, b, nx, nz, amin, amax, bmin, bmax, pa, pb;
    for (Q = 0; Q < 2; Q++) {
      P = Q ? B : A;
      for (j = 0; j < 4; j++) {
        a = P[j];
        b = P[(j + 1) % 4];
        nx = -(b[1] - a[1]);
        nz = b[0] - a[0];
        amin = 1e18; amax = -1e18; bmin = 1e18; bmax = -1e18;
        for (k = 0; k < 4; k++) {
          pa = A[k][0] * nx + A[k][1] * nz;
          pb = B[k][0] * nx + B[k][1] * nz;
          if (pa < amin) amin = pa;
          if (pa > amax) amax = pa;
          if (pb < bmin) bmin = pb;
          if (pb > bmax) bmax = pb;
        }
        if (amax <= bmin + 1e-6 || bmax <= amin + 1e-6) return true;
      }
    }
    return false;
  };

  var berthOverlaps = function (a, b, minClear) {
    var pad = (minClear == null ? 0 : minClear) * 0.5;
    return !sepOBB(obbCorners(a, pad), obbCorners(b, pad));
  };

  KCAMP.berthOverlaps = berthOverlaps;

  KCAMP.fleetMooring = function (spec) {
    var o = spec || {};
    var world = o.world == null ? 1 : (o.world >>> 0);
    var center = o.center || {x: 0, z: 0};
    var rx = o.rx == null ? 240 : o.rx;
    var rz = o.rz == null ? 240 : o.rz;
    var minClear = o.minClear_m == null ? 6.0 : o.minClear_m;
    var avoidFn = typeof o.avoidFn === 'function' ? o.avoidFn : null;
    var formation = o.formation || 'horseshoe';
    var way = o.way || [0, -1];

    if (!center || !isFinite(center.x) || !isFinite(center.z)) {
      throw new Error('KCAMP.fleetMooring: center {x, z} must be finite');
    }
    if (!isFinite(rx) || rx <= 0 || !isFinite(rz) || rz <= 0) {
      throw new Error('KCAMP.fleetMooring: rx and rz must be > 0');
    }
    if (!isFinite(minClear) || minClear < 0) {
      throw new Error('KCAMP.fleetMooring: minClear_m must be >= 0');
    }

    var fleetInput = o.fleets == null ? DEFAULT_FLEETS : o.fleets;
    if (!Array.isArray(fleetInput)) {
      throw new Error('KCAMP.fleetMooring: fleets must be an array');
    }

    var byId = {}, fi;
    for (fi = 0; fi < DEFAULT_FLEETS.length; fi++) byId[DEFAULT_FLEETS[fi].id] = DEFAULT_FLEETS[fi];

    var items = [];
    for (fi = 0; fi < fleetInput.length; fi++) {
      var f = typeof fleetInput[fi] === 'string' ? byId[fleetInput[fi]] : fleetInput[fi];
      if (!f || !Array.isArray(f.hulls)) throw new Error('KCAMP.fleetMooring: invalid fleet at index ' + fi);
      for (var hi = 0; hi < f.hulls.length; hi++) {
        var h = f.hulls[hi], hs = hullSpec(h.key);
        if (!hs) throw new Error('KCAMP.fleetMooring: unknown hull key ' + h.key);
        items.push({
          fleetId: f.id,
          hullId: h.id || (f.id + ':' + hs.key + ':' + hi),
          key: h.key,
          w: h.w == null ? hs.w : h.w,
          d: h.d == null ? hs.d : h.d,
          h: h.h == null ? hs.h : h.h,
          draft_m: h.draft_m == null ? hs.draft_m : h.draft_m,
          deepCareen: (h.draft_m == null ? hs.draft_m : h.draft_m) > DEEP_DRAFT_LIMIT_M,
          pop: h.pop == null ? hs.crewCap : h.pop,
          tier: hs.tier
        });
      }
    }

    /* Inner calm water -> outerward: Tier 0 (89g Ark-Wards) -> Tier 1 (89c/89d deep hulls) -> Tier 2 (tenders/trimarans/whalers) */
    items.sort(function (a, b) {
      return (a.tier - b.tier) || (b.draft_m - a.draft_m) || (b.w * b.d - a.w * a.d) ||
        (a.fleetId < b.fleetId ? -1 : a.fleetId > b.fleetId ? 1 : 0) ||
        (a.hullId < b.hullId ? -1 : a.hullId > b.hullId ? 1 : 0);
    });

    var seed = KRAND.child(world, 'fleet-mooring');
    var wl = Math.hypot(way[0], way[1]);
    if (!(wl > 0)) wl = 1;
    var mouthAng = Math.atan2(way[1] / wl, way[0] / wl);
    var headAng = mouthAng + Math.PI;
    var mouthHalf = formation === 'ring' ? 0 : 0.34;
    var minAxis = Math.min(rx, rz);

    var space = typeof KSPACE !== 'undefined' && KSPACE.create ? KSPACE.create({cell: 32}) : null;
    var berths = [], short = [];

    var isAvoided = function (cand) {
      if (!avoidFn) return false;
      var rad = Math.hypot(cand.w, cand.d) * 0.5;
      if (avoidFn(cand.x, cand.z, rad)) return true;
      var cs = obbCorners(cand, 0);
      for (var c = 0; c < 4; c++) {
        if (avoidFn(cs[c][0], cs[c][1], 0)) return true;
        var mx = 0.5 * (cs[c][0] + cs[(c + 1) % 4][0]), mz = 0.5 * (cs[c][1] + cs[(c + 1) % 4][1]);
        if (avoidFn(mx, mz, 0)) return true;
      }
      return false;
    };

    var fits = function (cand) {
      if (isAvoided(cand)) return false;
      var reach = Math.hypot(cand.w, cand.d) * 0.5 + minClear + 36;
      if (space) {
        return !space.some(cand.x, cand.z, reach, function (prev) {
          return berthOverlaps(cand, prev, minClear);
        });
      }
      for (var i = 0; i < berths.length; i++) {
        if (berthOverlaps(cand, berths[i], minClear)) return false;
      }
      return true;
    };

    var commit = function (cand) {
      berths.push(cand);
      if (space) space.insert(cand, cand.x, cand.z, Math.hypot(cand.w, cand.d) * 0.5);
    };

    var angDiff = function (a, b) {
      var d = (a - b) % (2 * Math.PI);
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      return Math.abs(d);
    };

    var curTier = -1, floorFrac = Math.max(0.16, 26 / minAxis), maxPlacedFrac = floorFrac;
    for (var idx = 0; idx < items.length; idx++) {
      var it = items[idx];
      if (it.tier !== curTier) {
        if (curTier >= 0 && berths.length > 0) {
          floorFrac = Math.max(floorFrac + 0.12, maxPlacedFrac + (22 + minClear) / minAxis);
        }
        curTier = it.tier;
      }
      var stepFrac = Math.max(0.055, (Math.min(it.w, it.d) * 0.5 + minClear * 0.6) / minAxis);
      var placed = false;
      for (var ring = 0; ring < 48 && !placed; ring++) {
        var s = floorFrac + ring * stepFrac;
        var perim = 2 * Math.PI * s * 0.5 * (rx + rz);
        var nSlots = Math.max(10, Math.floor(perim / Math.max(8, it.w + minClear)));
        var jitter = (KRAND.unit(KRAND.hash(seed, idx, ring, 1)) - 0.5) * (Math.PI / nSlots);
        for (var j = 0; j < nSlots && !placed; j++) {
          var side = j === 0 ? 0 : (j % 2 === 1 ? 1 : -1) * Math.ceil(j / 2);
          var ang = headAng + jitter + side * (2 * Math.PI / nSlots);
          if (mouthHalf > 0 && angDiff(ang, mouthAng) < mouthHalf) continue;
          var px = center.x + Math.cos(ang) * rx * s;
          var pz = center.z + Math.sin(ang) * rz * s;
          var yawJitter = (KRAND.unit(KRAND.hash(seed, idx, ring, j + 17)) - 0.5) * 0.08;
          var rot = Math.atan2(center.x - px, center.z - pz) + yawJitter;
          var cand = {
            fleetId: it.fleetId,
            hullId: it.hullId,
            key: it.key,
            x: +px.toFixed(3),
            z: +pz.toFixed(3),
            rot: +rot.toFixed(4),
            w: it.w,
            d: it.d,
            h: it.h,
            draft_m: it.draft_m,
            deepCareen: it.deepCareen,
            pop: it.pop,
            tier: it.tier
          };
          if (fits(cand)) {
            commit(cand);
            var usedFrac = Math.hypot((px - center.x) / rx, (pz - center.z) / rz);
            if (usedFrac > maxPlacedFrac) maxPlacedFrac = usedFrac;
            placed = true;
          }
        }
      }
      if (!placed) short.push(it.hullId);
    }

    var totalPop = 0;
    for (var bi = 0; bi < berths.length; bi++) totalPop += berths[bi].pop;

    return {
      berths: berths,
      short: short,
      totalHulls: berths.length,
      totalPop: totalPop,
      center: {x: center.x, z: center.z},
      rx: rx,
      rz: rz,
      minClear_m: minClear
    };
  };

  /* 5. Macrotidal Fleet World Simulator: KCAMP.fleetWorld, fleetTick, fleetRun, fleetsAt */
  var isMootDayMod = function (d) {
    var mod = ((Math.floor(d) % 91) + 91) % 91;
    return (mod >= 0 && mod <= 2) || (mod >= 43 && mod <= 46) || (mod >= 89 && mod <= 90);
  };

  /* Pure analytical Week (3.5 d, 0.28) + Thirteen (6.5 d, 0.17) fallback matching KTIDE epoch (-0.5 d) */
  var fallbackTideGate = function (day) {
    var di = Math.floor(day);
    var bestSp = 0;
    for (var h = 0; h <= 24; h += 2) {
      var td = di + h / 24 - (-0.5);
      var a1 = 2 * Math.PI * td / 3.5009, a2 = 2 * Math.PI * td / 6.4984;
      var re = 1 + 0.28 * Math.cos(a1) + 0.17 * Math.cos(a2);
      var im = 0.28 * Math.sin(a1) + 0.17 * Math.sin(a2);
      var sp = Math.hypot(re, im);
      if (sp > bestSp) bestSp = sp;
    }
    var range = +(9.85 * bestSp).toFixed(3);
    var highest = +(4.90 * bestSp).toFixed(3);
    return {
      day: di,
      dayRange: range,
      dayHighest: highest,
      deepCradleOpen: highest >= DEEP_CRADLE_GATE_M,
      greatCradleOpen: highest >= GREAT_CRADLE_GATE_M,
      isMoot: isMootDayMod(di)
    };
  };

  var makeDefaultTideGate = function (opts) {
    var o = opts || {};
    var ft = o.fcoveTide || null;
    if (!ft && typeof FCOVE_TIDE !== 'undefined' && FCOVE_TIDE && typeof FCOVE_TIDE.create === 'function' && o.tidesData) {
      ft = FCOVE_TIDE.create(o.tidesData, {ktide: o.ktide});
    }
    if (ft && typeof ft.daySummary === 'function') {
      return function (day) {
        var di = Math.floor(day), s = ft.daySummary(di);
        return {
          day: di,
          dayRange: s.range,
          dayHighest: s.highest,
          deepCradleOpen: !!(s.cradles && s.cradles.cradle_deep && s.cradles.cradle_deep.open),
          greatCradleOpen: !!(s.cradles && s.cradles.cradle_great && s.cradles.cradle_great.open),
          isMoot: isMootDayMod(di)
        };
      };
    }
    return fallbackTideGate;
  };

  var evalGate = function (W, day) {
    var di = Math.floor(day);
    if (W._gateCache[di]) return W._gateCache[di];
    var raw = W.tideGate(di);
    if (!raw || !isFinite(raw.dayHighest) || !isFinite(raw.dayRange)) {
      throw new Error('KCAMP.fleetTick: tideGate(' + di + ') must return finite {dayRange, dayHighest}');
    }
    var norm = {
      day: di,
      dayRange: raw.dayRange,
      dayHighest: raw.dayHighest,
      deepCradleOpen: raw.deepCradleOpen == null ? raw.dayHighest >= DEEP_CRADLE_GATE_M : !!raw.deepCradleOpen,
      greatCradleOpen: raw.greatCradleOpen == null ? raw.dayHighest >= GREAT_CRADLE_GATE_M : !!raw.greatCradleOpen,
      isMoot: raw.isMoot == null ? isMootDayMod(di) : !!raw.isMoot
    };
    W._gateCache[di] = norm;
    return norm;
  };

  var daysUntilNextMoot = function (W, day) {
    if (evalGate(W, day).isMoot) return 0;
    for (var k = 1; k <= 50; k++) {
      if (evalGate(W, day + k).isMoot) return k;
    }
    return Infinity;
  };

  var travelDays = function (W, f, fromId, toId) {
    if (fromId === toId) return 0;
    var km = portDistanceKm(fromId, toId, W.ports);
    var speed = f.kmPerDay == null ? 210 : f.kmPerDay;
    return Math.max(1, Math.ceil(km / speed));
  };

  var hasDeepDue = function (f, isMoot) {
    for (var i = 0; i < f.hulls.length; i++) {
      var h = f.hulls[i];
      if (!h.deepCareen) continue;
      var thresh = isMoot ? Math.ceil(h.careenInterval_d * 0.5) : h.careenInterval_d;
      if (h.daysSinceCareen >= thresh) return true;
    }
    return false;
  };

  var maxDeepOverdue = function (f) {
    var mx = -1e9;
    for (var i = 0; i < f.hulls.length; i++) {
      var h = f.hulls[i];
      if (h.deepCareen) {
        var ov = h.daysSinceCareen - h.careenInterval_d;
        if (ov > mx) mx = ov;
      }
    }
    return mx;
  };

  var setSail = function (W, f, toId, day, why) {
    var fromId = f.port;
    var days = travelDays(W, f, fromId, toId);
    f.state = 'sailing';
    f.port = null;
    f.leg = {
      from: fromId,
      to: toId,
      d0: day,
      d1: day + days,
      dist_km: +portDistanceKm(fromId, toId, W.ports).toFixed(1),
      why: why || 'route'
    };
    W.ops.push({day: day, fleetId: f.id, what: 'sail', from: fromId, to: toId, d1: day + days, why: f.leg.why});
  };

  var nextRoutePort = function (W, f, day, mootIn) {
    var R = f.route;
    for (var tries = 0; tries < R.length; tries++) {
      var idx = (f.routeIdx + tries) % R.length;
      var cand = R[idx];
      if (cand === f.port) continue;
      /* Outside moot / careenDue windows, skip routine calls at arcoforte so fleets range their trade/dive grounds */
      if (cand === 'arcoforte') continue;
      var legThere = travelDays(W, f, f.port, cand);
      var legToArco = travelDays(W, f, cand, 'arcoforte');
      if (legThere + legToArco + 1 <= mootIn) {
        f.routeIdx = (idx + 1) % R.length;
        return cand;
      }
    }
    /* If only a short hop fits before the moot, check homePort or arch_trench */
    var fallbacks = [f.homePort, 'arch_trench'];
    for (var k = 0; k < fallbacks.length; k++) {
      var fb = fallbacks[k];
      if (fb && fb !== f.port && W.ports[fb]) {
        var lt = travelDays(W, f, f.port, fb), la = travelDays(W, f, fb, 'arcoforte');
        if (lt + la + 1 <= mootIn) return fb;
      }
    }
    return null;
  };

  KCAMP.fleetWorld = function (opts) {
    var o = opts || {};
    var world = o.world == null ? 1 : (o.world >>> 0);
    if (o.tideGate != null && typeof o.tideGate !== 'function') {
      throw new Error('KCAMP.fleetWorld: tideGate must be a function');
    }

    var ports = {};
    var pk;
    for (pk in PORTS) ports[pk] = Object.assign({}, PORTS[pk], {px: PORTS[pk].px.slice()});
    if (o.ports) {
      for (pk in o.ports) {
        var ov = o.ports[pk];
        if (!ov || !Array.isArray(ov.px) || ov.px.length < 2) {
          throw new Error('KCAMP.fleetWorld: invalid port record ' + pk);
        }
        ports[pk] = Object.assign({}, ports[pk] || {}, ov, {px: ov.px.slice()});
      }
    }
    if (!ports.arcoforte || !ports.deep_ward) {
      throw new Error('KCAMP.fleetWorld: ports must include arcoforte and deep_ward');
    }

    var fleetDefs = o.fleets == null ? DEFAULT_FLEETS : o.fleets;
    if (!Array.isArray(fleetDefs) || fleetDefs.length === 0) {
      throw new Error('KCAMP.fleetWorld: fleets must be a non-empty array');
    }

    var tideGate = o.tideGate || makeDefaultTideGate(o);
    var caretakerPop = o.caretakerPop == null ? 420 : o.caretakerPop;
    if (!isFinite(caretakerPop) || caretakerPop < 0) {
      throw new Error('KCAMP.fleetWorld: caretakerPop must be >= 0');
    }

    var W = {
      world: world,
      caretakerPop: caretakerPop,
      ports: ports,
      fleets: {},
      order: [],
      tideGate: tideGate,
      _gateCache: {},
      day: null,
      careenLog: [],
      stretchLog: [],
      ops: [],
      history: {}
    };

    var g0 = evalGate(W, 0);
    for (var i = 0; i < fleetDefs.length; i++) {
      var fd = fleetDefs[i];
      if (!fd || !fd.id || !Array.isArray(fd.hulls) || fd.hulls.length === 0) {
        throw new Error('KCAMP.fleetWorld: invalid fleet definition at index ' + i);
      }
      var homePort = fd.homePort || 'deep_ward';
      if (!ports[homePort]) throw new Error('KCAMP.fleetWorld: unknown homePort ' + homePort);
      var startPort = fd.startPort || (o.startAtHome ? homePort : (g0.isMoot ? 'arcoforte' : homePort));
      if (!ports[startPort]) throw new Error('KCAMP.fleetWorld: unknown startPort ' + startPort);

      var hulls = [], pop = 0;
      for (var hi = 0; hi < fd.hulls.length; hi++) {
        var hd = fd.hulls[hi], hs = hullSpec(hd.key);
        var draft = hd.draft_m == null ? (hs ? hs.draft_m : 2.0) : hd.draft_m;
        if (!isFinite(draft) || draft <= 0) {
          throw new Error('KCAMP.fleetWorld: invalid hull draft_m on ' + fd.id);
        }
        var hPop = hd.pop == null ? (hs ? hs.crewCap : 10) : hd.pop;
        var interval = hd.careenInterval_d == null ? 35 : hd.careenInterval_d;
        var initAge = hd.initialDaysSinceCareen == null ? (hd.daysSinceCareen == null ? 0 : hd.daysSinceCareen) : hd.initialDaysSinceCareen;
        pop += hPop;
        hulls.push({
          id: hd.id || (fd.id + ':' + hd.key + ':' + hi),
          key: hd.key,
          name: hd.name || (hs ? hs.name : hd.key),
          draft_m: draft,
          deepCareen: draft > DEEP_DRAFT_LIMIT_M,
          pop: hPop,
          cargoCap: hd.cargoCap == null ? (hs ? hs.cargoCap : 20) : hd.cargoCap,
          careenInterval_d: interval,
          daysSinceCareen: initAge,
          careenCount: 0,
          lastCareenDay: null
        });
      }

      var fRec = {
        id: fd.id,
        kind: 'fleet',
        name: fd.name || fd.id,
        culture: fd.culture || 'fleetborn',
        homePort: homePort,
        people: fd.people == null ? pop : fd.people,
        kmPerDay: fd.kmPerDay == null ? 210 : fd.kmPerDay,
        hulls: hulls,
        route: (fd.route || [homePort, 'arcoforte']).slice(),
        routeIdx: i % Math.max(1, (fd.route || [homePort]).length),
        tradeProfile: fd.tradeProfile ? {
          brings: (fd.tradeProfile.brings || []).slice(),
          takes: (fd.tradeProfile.takes || []).slice()
        } : {brings: [], takes: []},
        state: 'moored',
        port: startPort,
        leg: null,
        arrivedDay: 0,
        stayUntil: 0,
        waitedNeapDays: 0,
        totalStretchedDays: 0
      };
      W.fleets[fRec.id] = fRec;
      W.order.push(fRec.id);
    }
    return W;
  };

  var snapshotDay = function (W, d, tg) {
    var byPort = {}, pk, i, f;
    for (pk in W.ports) byPort[pk] = [];
    for (i = 0; i < W.order.length; i++) {
      f = W.fleets[W.order[i]];
      if (f.state === 'moored' && f.port && byPort[f.port]) {
        byPort[f.port].push({
          id: f.id,
          name: f.name,
          culture: f.culture,
          people: f.people,
          port: f.port,
          state: f.state,
          careenDue: hasDeepDue(f, false),
          waitedNeapDays: f.waitedNeapDays
        });
      }
    }
    var arcoPop = 0;
    for (i = 0; i < byPort.arcoforte.length; i++) arcoPop += byPort.arcoforte[i].people;
    W.history[d] = {
      day: d,
      tide: tg,
      byPort: byPort,
      arcoforteVisitingPop: arcoPop,
      arcoforteTotalPop: arcoPop + W.caretakerPop
    };
  };

  KCAMP.fleetTick = function (W, day) {
    var d = Math.floor(day);
    W.day = d;
    var tg = evalGate(W, d);
    var mootIn = daysUntilNextMoot(W, d);
    var seed = KRAND.child(W.world, 'fleet-tick');

    var i, f, hi, h;
    /* Step 1: advance marine fouling & resolve arrivals */
    for (i = 0; i < W.order.length; i++) {
      f = W.fleets[W.order[i]];
      for (hi = 0; hi < f.hulls.length; hi++) {
        f.hulls[hi].daysSinceCareen += 1;
      }
      if (f.state === 'sailing' && f.leg && d >= f.leg.d1) {
        var dest = f.leg.to, why = f.leg.why;
        f.state = 'moored';
        f.port = dest;
        f.leg = null;
        f.arrivedDay = d;
        f.waitedNeapDays = 0;
        var stayD = dest === 'arcoforte' ? 1 : (4 + Math.floor(KRAND.unit(KRAND.hash(seed, i, d, 11)) * 4));
        f.stayUntil = d + stayD;
        W.ops.push({day: d, fleetId: f.id, what: 'arrive', port: dest, why: why});
      }
    }

    /* Step 2: careening laws at moored ports (Law 1 & Law 2) */
    for (i = 0; i < W.order.length; i++) {
      f = W.fleets[W.order[i]];
      if (f.state !== 'moored' || !f.port) continue;
      var port = W.ports[f.port];
      /* Law 1: non-careening ports (deep_ward 1.9 m diurnal tide, farport, copper_tarn_landing, arch_trench) CANNOT careen deep hulls */
      if (f.port === 'arcoforte' && port && port.canCareenDeep) {
        var anyDeepBlocked = false;
        for (hi = 0; hi < f.hulls.length; hi++) {
          h = f.hulls[hi];
          var thresh = tg.isMoot ? Math.ceil(h.careenInterval_d * 0.5) : h.careenInterval_d;
          if (h.daysSinceCareen < thresh) continue;
          if (h.deepCareen) {
            /* Law 2: deep hulls (draft_m > 2.2) careen ONLY when tideGate(day).deepCradleOpen === true */
            if (tg.deepCradleOpen === true) {
              W.careenLog.push({
                day: d,
                fleetId: f.id,
                hullId: h.id,
                key: h.key,
                draft_m: h.draft_m,
                deepCareen: true,
                dayHighest: tg.dayHighest,
                dayRange: tg.dayRange,
                waitedNeapDays: f.waitedNeapDays
              });
              h.daysSinceCareen = 0;
              h.careenCount += 1;
              h.lastCareenDay = d;
            } else {
              anyDeepBlocked = true;
            }
          } else {
            /* Shallow hulls (draft_m <= 2.2) careen on cradle_shallow any day at Arcoforte */
            W.careenLog.push({
              day: d,
              fleetId: f.id,
              hullId: h.id,
              key: h.key,
              draft_m: h.draft_m,
              deepCareen: false,
              dayHighest: tg.dayHighest,
              dayRange: tg.dayRange,
              waitedNeapDays: 0
            });
            h.daysSinceCareen = 0;
            h.careenCount += 1;
            h.lastCareenDay = d;
          }
        }
        if (anyDeepBlocked) {
          f.waitedNeapDays += 1;
          f.totalStretchedDays += 1;
          W.stretchLog.push({
            day: d,
            fleetId: f.id,
            dayHighest: tg.dayHighest,
            dayRange: tg.dayRange,
            maxOverdue_d: maxDeepOverdue(f)
          });
        } else {
          f.waitedNeapDays = 0;
        }
      }
    }

    /* Step 3: departures & moot convergence (Laws 1, 2 & 3) */
    for (i = 0; i < W.order.length; i++) {
      f = W.fleets[W.order[i]];
      if (f.state !== 'moored' || !f.port) continue;
      var deepDue = hasDeepDue(f, tg.isMoot);

      if (f.port === 'arcoforte') {
        /* Stay during Great Careening moots, or while waiting for spring deepCradleOpen to careen due deep hulls */
        if (tg.isMoot || deepDue || mootIn <= 3) continue;
        if (d >= f.stayUntil) {
          var outPort = nextRoutePort(W, f, d, mootIn);
          if (outPort) setSail(W, f, outPort, d, 'route');
        }
      } else {
        var daysToArco = travelDays(W, f, f.port, 'arcoforte');
        /* Law 3: converge on Arcoforte so every fleet arrives on or before the Great Careening moot */
        if (tg.isMoot || mootIn <= daysToArco) {
          setSail(W, f, 'arcoforte', d, 'moot');
        } else if (deepDue && !W.ports[f.port].canCareenDeep) {
          /* Law 1: Deep-Ward and outer ports cannot careen deep hulls -> sail to Arcoforte */
          setSail(W, f, 'arcoforte', d, 'careen');
        } else if (deepDue && f.port !== 'arcoforte') {
          setSail(W, f, 'arcoforte', d, 'careen');
        } else if (d >= f.stayUntil) {
          var nxt = nextRoutePort(W, f, d, mootIn);
          if (nxt) setSail(W, f, nxt, d, 'route');
        }
      }
    }

    snapshotDay(W, d, tg);
    return W.history[d];
  };

  KCAMP.fleetRun = function (W, d0, d1) {
    var start = Math.floor(d0), end = Math.floor(d1);
    if (!(end >= start)) throw new Error('KCAMP.fleetRun: requires d1 >= d0');
    for (var d = start; d < end; d++) {
      KCAMP.fleetTick(W, d);
    }
    return W;
  };

  KCAMP.fleetsAt = function (W, portId, day) {
    if (!W || !W.ports || !W.ports[portId]) {
      throw new Error('KCAMP.fleetsAt: unknown port ' + portId);
    }
    if (day != null) {
      var di = Math.floor(day);
      if (W.history && W.history[di] && W.history[di].byPort[portId]) {
        return W.history[di].byPort[portId].map(function (r) { return Object.assign({}, r); });
      }
    }
    var out = [];
    for (var i = 0; i < W.order.length; i++) {
      var f = W.fleets[W.order[i]];
      if (f.state === 'moored' && f.port === portId) {
        out.push({
          id: f.id,
          name: f.name,
          culture: f.culture,
          people: f.people,
          port: f.port,
          state: f.state,
          careenDue: hasDeepDue(f, false),
          waitedNeapDays: f.waitedNeapDays
        });
      }
    }
    return out;
  };
})();
