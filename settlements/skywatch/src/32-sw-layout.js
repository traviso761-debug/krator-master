/* ================================================================= SKYWATCH — deterministic 5-tier layout ([G data])
   [G data] Pure data and functions over SW_MODEL (28), SW_GROUND (30), KRAND, KSPACE, KCITY, KHAMLET, KCAMP, RES_ORE.
   Draws nothing; runs identically in Node (tests/test-skywatch.js), the browser page, and Godot.

   Tiers (PLAN.md §3):
     Tier I    Upper Observatory Crag (Solstice Sanctuary on JJ_SOLSTICE Az 242.17 deg / Alt +3.00 deg, Raja's Eye dome
               hl_rep_guild_astro, 360-deg basalt Horizon Ring, Watchers' Lodge, South Relay Beacon -> 780,498, North Beacon)
     Tier II   Pass-Gate Citadel & Sunny North-Slope Switchback Town on KCITY.grid + KCITY.create (North Matok Gate,
               South Cempu Gate, East Caravanserai Postern, West Crag Gate, Citadel, Barracks, Free-Clan Hall & Muster,
               Scriptorium Library & Kauntavan School, two vaulted Step-Cisterns, ~35% JJ / ~65% HL rustic infill, KHAMLET)
     Tier III  Leeward Caravanserai, Royal Salt & Grain Vaults, KRUINS Salvage Assay Yard, Yak Pens & KCAMP Convoy Laagers
     Tier IV   Copper-Zinc Skarn Adits (RES_ORE copper=120, zinc=96, iron=60, saltpeter=83, turquoise=45), Katabatic
               Wind-Furnaces, Brass Foundry & Spent-Adit Mushroom Dark-Beds
     Tier V    The Silent Moot (13 frost-split basalt monoliths on R=14 m circle sighting Equinox Sunrise Az 90.00 deg,
               North & South stone barter tables, cast-brass Truce-Gong, boundary cairns & 3 KCAMP Sasquatch 1.35x camps) */
var SW_LAYOUT = (function () {
  'use strict';
  var G = SW_GROUND, M = SW_MODEL;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var WORLD_SEED = KRAND.hash(776, 470, 8921, 51);

  function r2(v) { return Math.round(v * 100) / 100; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function azToRy(azDeg) { return Math.PI - azDeg * D2R; }
  function faceVec(dx, dz) { return Math.atan2(dx, dz); }

  /* ---- 1. Pure [G data] solar solver matching core/atmos/placeholder/81-sky.js (LAT -40 deg, OBL 23 deg, YEAR 360) ---- */
  function sunDirAt(hour, day) {
    var lat = -40 * D2R, obl = 23 * D2R;
    var dec = obl * Math.sin(2 * Math.PI * (day - 80) / 360);
    var H = (hour - 12) * 15 * D2R;
    var e = -Math.cos(dec) * Math.sin(H);
    var n = Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(H);
    var u = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
    var L = Math.hypot(e, u, n);
    var inv = L > 0 ? 1 / L : 1;
    return [e * inv, u * inv, -n * inv];
  }
  function altAzOf(v) {
    return { alt: Math.asin(v[1]) * R2D, az: ((Math.atan2(v[0], -v[2]) * R2D) + 360) % 360 };
  }
  function solveSolstice() {
    var day = 350, targetAlt = 3.0;
    var y0 = Math.sin(targetAlt * D2R), a = 12, b = 24;
    for (var i = 0; i < 60; i++) {
      var mid = (a + b) * 0.5;
      if (sunDirAt(mid, day)[1] > y0) a = mid; else b = mid;
    }
    var hr = (a + b) * 0.5, dir = sunDirAt(hr, day), aa = altAzOf(dir);
    /* Also solve Equinox Sunrise (day 80, morning alt = 0 deg -> exact Az 90.00 deg) */
    var ea = 0, eb = 12;
    for (var j = 0; j < 60; j++) {
      var em = (ea + eb) * 0.5;
      if (sunDirAt(em, 80)[1] < 0) ea = em; else eb = em;
    }
    var eqHr = (ea + eb) * 0.5, eqDir = sunDirAt(eqHr, 80), eqAA = altAzOf(eqDir);
    return {
      day: day,
      targetAltDeg: targetAlt,
      hour: r4(hr),
      azimuthDeg: r4(aa.az),
      altitudeDeg: r4(aa.alt),
      ry: r4(azToRy(aa.az)),
      sunDir: [r4(dir[0]), r4(dir[1]), r4(dir[2])],
      equinoxDay: 80,
      equinoxHour: r4(eqHr),
      equinoxSunriseAzDeg: r4(eqAA.az),
      giantAzDeg: 66,
      giantAltDeg: 25
    };
  }
  var SOL = solveSolstice();

  /* ---- 2. Canonical building footprints (w x d x h in metres, local +z front) across JJ, HL & SW landmarks ---- */
  var DIMS = {
    /* Jimjam kit (settlements/jimjam/src/70..77) */
    jj_house_poor_a: { w: 8.4, d: 7.8, h: 8.5, kit: 'jj', culture: 'jimjam', wealth: 'poor', types: ['dwelling-single'], pop: 5 },
    jj_house_poor_b: { w: 6.2, d: 8.4, h: 8.1, kit: 'jj', culture: 'jimjam', wealth: 'poor', types: ['dwelling-single'], pop: 4 },
    jj_house_poor_c: { w: 8.1, d: 8.1, h: 5.9, kit: 'jj', culture: 'jimjam', wealth: 'poor', types: ['dwelling-single'], pop: 5 },
    jj_house_mid_a:  { w: 10.6, d: 11.2, h: 15.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single'], pop: 7 },
    jj_house_mid_b:  { w: 11.5, d: 7.8, h: 19.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'], pop: 9 },
    jj_house_mid_c:  { w: 12.9, d: 12.4, h: 15.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'], pop: 10 },
    jj_house_rich_a: { w: 24.5, d: 24.5, h: 18.0, kit: 'jj', culture: 'jimjam', wealth: 'rich', types: ['dwelling-single'], pop: 14, lit: true },
    jj_house_rich_b: { w: 18.4, d: 24.0, h: 21.8, kit: 'jj', culture: 'jimjam', wealth: 'rich', types: ['dwelling-single'], pop: 12, lit: true },
    jj_shop_general: { w: 10.0, d: 8.4, h: 10.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading', pop: 5 },
    jj_shop_food:    { w: 9.6, d: 9.2, h: 9.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'baking', pop: 5 },
    jj_shop_alchemy: { w: 6.4, d: 8.0, h: 11.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'alchemy', pop: 4 },
    jj_shop_spice:   { w: 8.0, d: 8.2, h: 8.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading', pop: 4 },
    jj_shop_textiles:{ w: 10.0, d: 8.6, h: 10.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'weaving', pop: 5 },
    jj_shop_weapons: { w: 8.4, d: 9.0, h: 11.9, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'smithing', pop: 4 },
    jj_tavern:       { w: 16.0, d: 27.4, h: 18.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['tavern'], job: 'brewing', pop: 8, lit: true },
    jj_inn:          { w: 33.4, d: 37.5, h: 18.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['inn'], job: 'trading', pop: 18, lit: true },
    jj_caravanserai: { w: 57.2, d: 71.6, h: 25.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['inn', 'market'], job: 'trading', pop: 42, lit: true },
    jj_library:      { w: 36.4, d: 24.5, h: 26.4, scale: 0.8, kit: 'jj', culture: 'jimjam', wealth: null, types: ['civic'], job: 'scribing', pop: 36, lit: true },
    jj_school:       { w: 26.4, d: 24.7, h: 13.6, scale: 0.85, kit: 'jj', culture: 'jimjam', wealth: null, types: ['civic'], job: 'scribing', pop: 28, lit: true },
    jj_barracks:     { w: 41.6, d: 33.8, h: 14.3, scale: 0.65, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military'], job: 'customs', pop: 75, lit: true },
    jj_fortress:     { w: 60.4, d: 58.0, h: 25.5, scale: 0.58, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military', 'civic'], job: 'customs', pop: 95, lit: true },
    jj_granary:      { w: 24.0, d: 16.0, h: 10.8, kit: 'jj', culture: 'jimjam', wealth: null, types: ['infrastructure'], job: 'warehousing', pop: 4 },
    jj_warehouse_a:  { w: 36.0, d: 24.0, h: 12.8, kit: 'jj', culture: 'jimjam', wealth: null, types: ['infrastructure'], job: 'warehousing', pop: 6 },
    jj_warehouse_b:  { w: 38.0, d: 24.0, h: 11.4, kit: 'jj', culture: 'jimjam', wealth: null, types: ['infrastructure'], job: 'warehousing', pop: 6 },
    jj_wall_seg:     { w: 12.0, d: 5.2, h: 10.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military', 'infrastructure'], pop: 0 },
    jj_wall_gate:    { w: 24.0, d: 15.0, h: 31.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military', 'infrastructure'], job: 'customs', pop: 12, lit: true },
    jj_wall_tower:   { w: 10.4, d: 10.4, h: 25.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military'], pop: 2 },
    jj_wall_corner:  { w: 13.0, d: 13.0, h: 33.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military'], pop: 4, lit: true },

    /* Highlands kit (kits/highlands: rustic + selected republican landmarks) */
    hl_rus_house_poor_a: { w: 14.0, d: 14.0, h: 7.0, kit: 'vern', culture: 'rustic', wealth: 'poor', types: ['dwelling-single'], pop: 6 },
    hl_rus_house_poor_b: { w: 12.0, d: 10.0, h: 5.0, kit: 'vern', culture: 'rustic', wealth: 'poor', types: ['dwelling-single'], pop: 5 },
    hl_rus_house_mid_a:  { w: 15.0, d: 14.0, h: 10.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['dwelling-single'], pop: 7 },
    hl_rus_house_mid_b:  { w: 17.0, d: 15.0, h: 9.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['dwelling-multi'], pop: 9 },
    hl_rus_house_rich_a: { w: 22.0, d: 30.0, h: 14.0, kit: 'vern', culture: 'rustic', wealth: 'rich', types: ['dwelling-single'], pop: 12, lit: true },
    hl_rus_tank_stue:    { w: 18.0, d: 16.0, h: 11.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['dwelling-single'], pop: 8 },
    hl_rus_cont_chalet:  { w: 20.0, d: 16.0, h: 10.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['dwelling-multi'], pop: 10 },
    hl_rus_hall:         { w: 22.0, d: 40.0, h: 13.0, kit: 'vern', culture: 'rustic', wealth: null, types: ['civic', 'military'], job: 'customs', pop: 45, lit: true },
    hl_rus_muster:       { w: 34.0, d: 26.0, h: 9.0, kit: 'vern', culture: 'rustic', wealth: null, types: ['military'], job: 'customs', pop: 24 },
    hl_rus_shops:        { w: 18.0, d: 16.0, h: 7.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['shop', 'market'], job: 'trading', pop: 6 },
    hl_rus_tavern:       { w: 22.0, d: 20.0, h: 14.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['tavern', 'inn'], job: 'brewing', pop: 10, lit: true },
    hl_rus_smithy:       { w: 18.0, d: 10.0, h: 7.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['industry'], job: 'smithing', pop: 6 },
    hl_rus_granary:      { w: 8.0, d: 10.0, h: 8.0, kit: 'vern', culture: 'rustic', wealth: 'poor', types: ['farm'], job: 'warehousing', pop: 2 },
    hl_rus_silo_stabbur: { w: 16.0, d: 14.0, h: 15.0, kit: 'vern', culture: 'rustic', wealth: null, types: ['infrastructure'], job: 'warehousing', pop: 3 },
    hl_rus_pens:         { w: 27.0, d: 19.0, h: 4.5, kit: 'vern', culture: 'rustic', wealth: 'poor', types: ['farm'], job: 'herding', pop: 4 },
    hl_rus_scrap_market: { w: 20.0, d: 20.0, h: 9.0, kit: 'vern', culture: 'rustic', wealth: 'middle', types: ['market'], job: 'trading', pop: 8 },
    hl_rep_guild_astro:  { w: 38.0, d: 22.0, h: 24.0, kit: 'vern', culture: 'republican', wealth: null, types: ['civic'], job: 'scribing', pop: 24, lit: true },
    hl_rep_smelter:      { w: 24.0, d: 18.0, h: 18.0, kit: 'vern', culture: 'republican', wealth: null, types: ['industry'], job: 'smithing', pop: 18, lit: true },

    /* Skywatch site-specific landmarks & structures (82-sw-landmarks.js) */
    sw_solstice_sanctuary: { w: 28.0, d: 44.0, h: 25.0, kit: 'sw', culture: 'jimjam', wealth: null, types: ['religious', 'civic'], job: 'worship', pop: 28, lit: true },
    sw_horizon_ring:       { w: 34.0, d: 34.0, h: 5.5, kit: 'sw', culture: 'jimjam', wealth: null, types: ['civic', 'plaza'], job: 'scribing', pop: 6 },
    sw_beacon_tower:       { w: 12.0, d: 12.0, h: 25.0, kit: 'sw', culture: 'jimjam', wealth: null, types: ['military', 'infrastructure'], job: 'customs', pop: 6, lit: true },
    sw_step_cistern:       { w: 22.0, d: 30.0, h: 8.5, kit: 'sw', culture: 'jimjam', wealth: null, types: ['infrastructure'], job: 'masonry', pop: 4 },
    sw_wind_furnace:       { w: 18.0, d: 22.0, h: 15.5, kit: 'sw', culture: 'rustic', wealth: null, types: ['industry'], job: 'smithing', pop: 14, lit: true },
    sw_skarn_adit:         { w: 15.0, d: 16.0, h: 9.5, kit: 'sw', culture: 'rustic', wealth: 'poor', types: ['industry'], job: 'mining', pop: 16 },
    sw_salvage_assay:      { w: 24.0, d: 22.0, h: 9.0, kit: 'sw', culture: 'ancient', state: 'salvage', wealth: null, types: ['market'], job: 'trading', pop: 4 },
    sw_moot_monolith:      { w: 2.8, d: 2.2, h: 6.4, kit: 'sw', culture: 'jimjam', wealth: null, types: ['statue', 'religious'], pop: 0 },
    sw_moot_table:         { w: 8.4, d: 3.6, h: 1.8, kit: 'sw', culture: 'rustic', wealth: null, types: ['market'], job: 'trading', pop: 0 },
    sw_truce_gong:         { w: 5.2, d: 3.4, h: 5.8, kit: 'sw', culture: 'jimjam', wealth: null, types: ['civic'], job: 'customs', pop: 0 },
    sw_boundary_cairn:     { w: 3.2, d: 3.2, h: 3.8, kit: 'sw', culture: 'rustic', wealth: null, types: ['infrastructure'], pop: 0 },

    /* KCAMP tents & pens (convoy laagers + 1.35x Sasquatch equinox camps) */
    sw_convoy_pavilion: { w: 9.0, d: 7.5, h: 4.8, kit: 'sw', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single'], pop: 0 },
    sw_convoy_tent:     { w: 6.4, d: 5.4, h: 3.6, kit: 'sw', culture: 'rustic', wealth: 'poor', types: ['dwelling-single'], pop: 0 },
    sw_convoy_guard:    { w: 5.6, d: 5.0, h: 3.4, kit: 'sw', culture: 'rustic', wealth: 'poor', types: ['military'], pop: 0 },
    sw_convoy_wagon:    { w: 7.2, d: 4.2, h: 3.5, kit: 'sw', culture: 'jimjam', wealth: 'middle', types: ['market'], pop: 0 },
    sw_convoy_picket:   { w: 12.0, d: 8.0, h: 2.6, kit: 'sw', culture: 'rustic', wealth: 'poor', types: ['farm'], pop: 0 },
    sw_sq_elder_lodge:  { w: 10.8, d: 9.8, h: 6.2, kit: 'sw', culture: 'talovolci', wealth: 'poor', types: ['dwelling-single'], pop: 0 },
    sw_sq_hide_lodge:   { w: 8.6, d: 8.2, h: 5.2, kit: 'sw', culture: 'talovolci', wealth: 'poor', types: ['dwelling-single'], pop: 0 },
    sw_sq_drying_rack:  { w: 7.4, d: 4.6, h: 4.2, kit: 'sw', culture: 'talovolci', wealth: 'poor', types: ['industry'], pop: 0 },
    sw_sq_yak_tether:   { w: 11.5, d: 8.5, h: 3.0, kit: 'sw', culture: 'talovolci', wealth: 'poor', types: ['farm'], pop: 0 }
  };

  function dimsOf(key) {
    var d = DIMS[key];
    return d ? { key: key, w: d.w, d: d.d, h: d.h, fw: d.w, fd: d.d } : null;
  }

  /* ---- 3. Register Skywatch camp & hamlet culture rows on KCAMP and KHAMLET ---- */
  if (typeof KCAMP !== 'undefined' && KCAMP.CULTURES) {
    KCAMP.CULTURES['skywatch-convoy'] = {
      kind: function (k) {
        if (k === 'sw_convoy_pavilion') return 'chief';
        if (k === 'sw_convoy_tent') return 'dwelling';
        if (k === 'sw_convoy_guard') return 'sleep';
        if (k === 'sw_convoy_wagon') return 'trade';
        if (k === 'sw_convoy_picket') return 'pen';
        return null;
      },
      households: { sw_convoy_pavilion: 1, sw_convoy_tent: 1 },
      household: [4, 6], chiefHousehold: [5, 7], sleepers: [4, 6],
      work: {
        sw_convoy_wagon: { role: 'factor', n: 2 },
        sw_convoy_picket: { role: 'drover', n: 2 }
      },
      elderShare: 0.15, mountsPer: 1.6, wind: [0.85, 0.52], formation: 'ring'
    };
    KCAMP.CULTURES.sasquatch = {
      kind: function (k) {
        if (k === 'sw_sq_elder_lodge') return 'chief';
        if (k === 'sw_sq_hide_lodge') return 'dwelling';
        if (k === 'sw_sq_drying_rack') return 'trade';
        if (k === 'sw_sq_yak_tether') return 'pen';
        return null;
      },
      households: { sw_sq_elder_lodge: 1, sw_sq_hide_lodge: 1 },
      household: [4, 6], chiefHousehold: [5, 7], sleepers: [2, 3],
      work: {
        sw_sq_drying_rack: { role: 'curer', n: 2 },
        sw_sq_yak_tether: { role: 'herder', n: 2 }
      },
      elderShare: 0.4, mountsPer: 0.6, wind: [0.6, 0.8], formation: 'horseshoe'
    };
  }

  if (typeof KHAMLET !== 'undefined' && KHAMLET.CULTURES) {
    KHAMLET.CULTURES['skywatch-pass'] = {
      kit: 'highlands', household: 5.5, workShare: 0.46, slopeMax: 0.28,
      religious: 'jj_shop_alchemy', civic: 'hl_rus_hall', general: 'hl_rus_shops',
      food: 'hl_rus_tavern', warehouse: 'hl_rus_silo_stabbur',
      services: { religious: 2, civic: 4, general: 3, food: 4, warehouse: 3 },
      houses: {
        poor: [['hl_rus_house_poor_a', 1, 3], ['hl_rus_house_poor_b', 1, 3], ['jj_house_poor_a', 1, 2]],
        middling: [['hl_rus_house_mid_a', 2, 2], ['hl_rus_tank_stue', 2, 2], ['jj_house_mid_a', 2, 1]],
        head: [['hl_rus_house_rich_a', 1, 1]],
        middlingShare: 0.36
      },
      works: {
        mine: [{ key: 'sw_skarn_adit', jobs: 16, share: 0.6 }, { key: 'hl_rus_smithy', jobs: 8, share: 0.4 }],
        ranch: [{ key: 'hl_rus_pens', jobs: 6, share: 0.65 }, { key: 'hl_rus_granary', jobs: 3, share: 0.35 }],
        lumber: [{ key: 'hl_rus_smithy', jobs: 8, share: 0.5 }, { key: 'hl_rus_granary', jobs: 4, share: 0.5 }]
      },
      focusJobs: { mine: 96, ranch: 54, lumber: 48 },
      reach: { mine: 400, ranch: 600, lumber: 500 },
      pending: {}
    };
  }

  /* ---- 4. Footprint OBB helpers for guaranteed non-overlap across all 5 tiers ---- */
  function cornersOf(rec, pad) {
    var p = pad == null ? 0 : pad;
    var c = Math.cos(rec.ry), s = Math.sin(rec.ry);
    var hw = rec.w * 0.5 + p, hd = rec.d * 0.5 + p;
    return [
      [rec.x - c * hw - s * hd, rec.z + s * hw - c * hd],
      [rec.x + c * hw - s * hd, rec.z - s * hw - c * hd],
      [rec.x + c * hw + s * hd, rec.z - s * hw + c * hd],
      [rec.x - c * hw + s * hd, rec.z + s * hw + c * hd]
    ];
  }
  function sepPoly(A, B) {
    for (var q = 0; q < 2; q++) {
      var P = q ? B : A;
      for (var i = 0; i < 4; i++) {
        var a = P[i], b = P[(i + 1) % 4];
        var nx = -(b[1] - a[1]), nz = b[0] - a[0];
        var amin = 1e18, amax = -1e18, bmin = 1e18, bmax = -1e18;
        for (var k = 0; k < 4; k++) {
          var pa = A[k][0] * nx + A[k][1] * nz;
          var pb = B[k][0] * nx + B[k][1] * nz;
          if (pa < amin) amin = pa;
          if (pa > amax) amax = pa;
          if (pb < bmin) bmin = pb;
          if (pb > bmax) bmax = pb;
        }
        if (amax <= bmin + 1e-5 || bmax <= amin + 1e-5) return true;
      }
    }
    return false;
  }
  function boxesOverlap(a, b, gap) {
    var g = gap == null ? 0 : gap;
    return !sepPoly(cornersOf(a, g * 0.5), cornersOf(b, g * 0.5));
  }
  function padElevation(rec) {
    /* Seat building at the highest corner/center ground so roofs/doors never bury on sloped ground; plinth fills beneath */
    var pts = cornersOf(rec, 0);
    var hi = G.h(rec.x, rec.z), lo = hi;
    for (var i = 0; i < pts.length; i++) {
      var hy = G.h(pts[i][0], pts[i][1]);
      if (hy > hi) hi = hy;
      if (hy < lo) lo = hy;
    }
    return { y: r2(hi), minY: r2(lo), drop: r2(hi - lo) };
  }

  function makeRecord(id, tier, key, x, z, ry, extra) {
    var d = DIMS[key];
    if (!d) throw new Error('SW_LAYOUT: unknown key ' + key);
    var base = {
      id: id, tier: tier, key: key, kit: d.kit,
      x: r2(x), z: r2(z), ry: r4(ry),
      w: d.w, d: d.d, h: d.h,
      scale: d.scale == null ? 1 : d.scale,
      v: KRAND.hash(WORLD_SEED, id.length, Math.round(x * 10), Math.round(z * 10)) % 3,
      culture: d.culture,
      wealth: d.wealth,
      types: d.types.slice(),
      job: d.job == null ? null : d.job,
      state: d.state == null ? 'intact' : d.state,
      lit: !!d.lit,
      pop: d.pop == null ? 0 : d.pop
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k) && extra[k] !== undefined) base[k] = extra[k];
      }
    }
    var pe = padElevation(base);
    if (extra && extra.y != null) {
      base.y = r2(extra.y);
      base.minGroundY = pe.minY;
      base.plinthH = r2(Math.max(0.4, base.y - pe.minY + 0.8));
    } else {
      base.y = pe.y;
      base.minGroundY = pe.minY;
      base.plinthH = r2(Math.max(0.35, pe.drop + 0.75));
    }
    return base;
  }

  /* ---- 5. Build the complete 5-tier layout ---- */
  function buildLayout() {
    var space = KSPACE.create({ cell: 24 });
    var allStructures = [];
    var wallParts = [];

    function registerPlaced(rec) {
      allStructures.push(rec);
      space.insert(rec, rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.5);
      return rec;
    }

    /* ================================================================
       TIER I — Upper Observatory Crag, Solstice Sanctuary, Raja's Eye & Beacons
       ================================================================ */
    var tier1 = [];
    /* Sanctuary geometry in local frame (+z toward JJ_SOLSTICE Az 242.17 deg):
       Podium top at local y = +5.2 m, observer door at local z = -11.0 m (eye at +6.9 m),
       Solstice gate arch centered at local z = +15.0 m (opening width 7.6 m, spring +9.8 m, crown +13.6 m ->
       deltaZ = 26.0 m, deltaY at +3.00 deg = 26 * tan(3 deg) = +1.363 m -> ray hits local y = 6.9 + 1.363 = +8.26 m,
       dead-center inside the arch opening [5.2..13.6 m]!) */
    var sanc = makeRecord('sw.crag.sanctuary', 1, 'sw_solstice_sanctuary', -654, -246, SOL.ry, {
      name: 'Sanctuary of the Three Wheels & Solstice Arch',
      landmark: true, quarter: 'crag', role: 'observatory'
    });
    var cs = Math.cos(sanc.ry), ss = Math.sin(sanc.ry);
    var obsLocalZ = -11.0, archLocalZ = 15.0, podH = 5.2, eyeLocalY = podH + 1.7;
    var solsticeGeom = {
      sanctuaryId: sanc.id,
      day: SOL.day,
      hour: SOL.hour,
      azimuthDeg: SOL.azimuthDeg,
      altitudeDeg: SOL.altitudeDeg,
      ry: sanc.ry,
      sunDir: SOL.sunDir,
      eye: [
        r4(sanc.x + ss * obsLocalZ),
        r4(sanc.y + eyeLocalY),
        r4(sanc.z + cs * obsLocalZ)
      ],
      archCenter: [
        r4(sanc.x + ss * archLocalZ),
        r4(sanc.y + podH),
        r4(sanc.z + cs * archLocalZ)
      ],
      archHalfW: 3.8,
      archFloorY: r4(sanc.y + podH),
      archCrownY: r4(sanc.y + podH + 7.8),
      archDepth: 3.6
    };
    tier1.push(registerPlaced(sanc));

    /* The Raja's Eye Dome & Orrery Belvedere (hl_rep_guild_astro adapted to Skywatch crag, facing NNE Outer Wall window) */
    tier1.push(registerPlaced(makeRecord('sw.crag.rajas_eye', 1, 'hl_rep_guild_astro', -594, -322, azToRy(24), {
      name: 'The Rajas Eye Brass Dome & Orrery Pavilion',
      landmark: true, quarter: 'crag', role: 'observatory', v: 0
    })));

    /* 360-degree incised basalt Horizon Ring (R = 16 m, 24 azimuth piers + NNE 15-30 deg & Az 66 deg Giant sight forks) */
    tier1.push(registerPlaced(makeRecord('sw.crag.horizon_ring', 1, 'sw_horizon_ring', -550, -264, 0, {
      name: 'The 360-Degree Basalt Horizon Ring',
      landmark: true, quarter: 'crag', role: 'observatory'
    })));

    /* Chief Kauntavan & Guild Minder's Winterised Residence */
    tier1.push(registerPlaced(makeRecord('sw.crag.watchers_lodge', 1, 'jj_house_rich_b', -672, -324, azToRy(112), {
      name: 'House of the Four Schools (Watchers Lodge)',
      quarter: 'crag', pop: 24
    })));

    /* South Relay Beacon & Heliograph Tower aimed Az 174 deg at (780, 498) -> Jimjam */
    tier1.push(registerPlaced(makeRecord('sw.crag.beacon_south', 1, 'sw_beacon_tower', G.beaconSouth.x, G.beaconSouth.z, azToRy(174), {
      name: 'South Relay Beacon & Heliograph Tower',
      landmark: true, quarter: 'crag', role: 'beacon', aimAzDeg: 174, targetPin: '780,498 -> Jimjam'
    })));

    /* North Storm-Lantern & Dam-Approach Watch Post aimed Az 6 deg toward East Dam Breach */
    tier1.push(registerPlaced(makeRecord('sw.crag.beacon_north', 1, 'sw_beacon_tower', G.beaconNorth.x, G.beaconNorth.z, azToRy(6), {
      name: 'North Storm-Lantern & Boatmurder Watch',
      landmark: true, quarter: 'crag', role: 'beacon', aimAzDeg: 6, targetPin: 'East Dam Breach'
    })));

    /* ================================================================
       TIER II — Pass-Gate Citadel & Sunny North-Slope Switchback Town on KCITY
       ================================================================ */
    var L = KCITY.lib, SL = L.SL, OCC = L.OCC, Raster = L.Raster, obb = L.obb, obbCorners = L.obbCorners;
    var SQ = {
      id: 'sw.grid', seed: 77647,
      c: [10, -70], u: [1, 0], v: [0, 1],
      half: 235, cells: 4, avenues: { u: 2, v: 2 },
      wallGap: 16, out: 48, zoneIn: 7
    };
    var GR = KCITY.grid.plan(SQ);
    var GATE_NAMES = {
      'v-': 'North Matok Gate',
      'v+': 'South Cempu Royal Gate',
      'u+': 'East Caravanserai Postern',
      'u-': 'West Crag Observatory Gate'
    };

    var cityDims = function (k, v) {
      var d = dimsOf(k);
      if (!d) return null;
      /* Give each KCITY lot 2.4 m plot breathing room around its building footprint so roofs and eaves never touch */
      return { key: k, v: v | 0, w: d.w + 2.4, d: d.d + 2.4, h: d.h, fw: d.w, fd: d.d };
    };

    var cellCenter = function (ci, cj) {
      var found = GR.cells.find(function (c) { return c.i === ci && c.j === cj; });
      return found ? found.c : [10, -70];
    };

    /* Anchors inside the walled town: Citadel [0,1], Barracks [0,2], Clan Hall [1,0], Clan Muster [2,0],
       Scriptorium Library [1,2], Kauntavan School [2,2] */
    var ANCHORS = [
      { id: 'citadel',     key: 'jj_fortress',   cell: [0, 1], face: [1, 0],  name: 'Pass-Gate Royal Citadel' },
      { id: 'barracks',    key: 'jj_barracks',   cell: [0, 2], face: [1, 0],  name: 'Royal Pass-Warden Barracks' },
      { id: 'clan_hall',   key: 'hl_rus_hall',   cell: [1, 0], face: [0, 1],  name: 'Free-Clan Auxiliary Ranger Hall' },
      { id: 'clan_muster', key: 'hl_rus_muster', cell: [2, 0], face: [0, 1],  name: 'Highland Escort Muster Yard' },
      { id: 'library',     key: 'jj_library',    cell: [1, 2], face: [0, -1], name: 'Long-Count Scriptorium & Almanac Archive' },
      { id: 'school',      key: 'jj_school',     cell: [2, 2], face: [0, -1], name: 'Apprentice Kauntavan Hall' }
    ];

    /* ~35% Jimjam frost-adapted brick/marble & ~65% Highlands rustic snow-shedding stone/timber */
    var cityTune = {
      cell: 2.5, rasterHalf: 420, maxSlope: 0.25, exact: true,
      width: { avenue: 10, main: 7, side: 5, alley: 3.5, highway: 9, lane: 4.5 },
      lot: { side: 2.2, setback: 1.8, rear: 3.5, inset: 1.0, step: 3.5 },
      classes: {
        manor:      [['jj_house_rich_a', 0], ['hl_rus_house_rich_a', 0]],
        rich:       [['jj_house_rich_b', 0], ['jj_house_mid_c', 0], ['hl_rus_house_rich_a', 1]],
        middle:     [['hl_rus_house_mid_a', 0], ['hl_rus_house_mid_b', 0], ['hl_rus_tank_stue', 0],
                     ['hl_rus_cont_chalet', 0], ['hl_rus_house_mid_a', 1], ['jj_house_mid_a', 0]],
        poor:       [['hl_rus_house_poor_a', 0], ['hl_rus_house_poor_b', 0], ['hl_rus_house_poor_b', 1],
                     ['hl_rus_granary', 0]],
        shop:       [['hl_rus_shops', 0], ['hl_rus_shops', 1], ['jj_shop_general', 0],
                     ['jj_shop_alchemy', 0], ['jj_shop_spice', 0]],
        tavern:     [['hl_rus_tavern', 0], ['jj_tavern', 0]],
        industrial: [['hl_rus_smithy', 0], ['hl_rus_granary', 0], ['hl_rus_silo_stabbur', 0]]
      },
      fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'middle', tavern: 'shop', industrial: 'poor', poor: null },
      civic: [
        { key: 'jj_shop_alchemy', v: 0, near: 'scriptorium' },
        { key: 'jj_shop_spice', v: 0, near: 'crossroad' },
        { key: 'jj_shop_food', v: 0, near: 'crossroad' },
        { key: 'hl_rus_tavern', v: 0, near: 'north_gate' },
        { key: 'jj_tavern', v: 0, near: 'south_gate' },
        { key: 'hl_rus_shops', v: 0, near: 'crossroad' },
        { key: 'hl_rus_silo_stabbur', v: 0, near: 'east_gate' },
        { key: 'jj_granary', v: 0, near: 'citadel' },
        { key: 'hl_rus_smithy', v: 0, near: 'north_gate' }
      ],
      civicSpacing: 34, civicJitter: 10,
      voidMax: 42, voidIters: 10, voidBatch: 8, sideSpacing: 52, sideMax: 155,
      alleyFrac: 0.14, blindMax: 70, interiorDepth: 9, interiorRounds: 1,
      avenueSnap: 36, ringGap: 8, verge: 5, mapHalf: 420,
      plazaArt: { rich: [], middle: [], poor: [], commerce: [] }
    };

    var boxAt = function (c, ry, w, d, m) {
      var pad = m == null ? 0 : m;
      return obb(c, [Math.cos(ry), -Math.sin(ry)], w * 0.5 + pad, d * 0.5 + pad);
    };

    var steps = [
      {
        name: 'the site and its ground',
        run: function () {
          var R = SL.R = new Raster(L.tune().rasterHalf, L.tune().cell);
          R.occ.fill(OCC.OUT);
          var P = L.plan();
          P.site = [{ id: 0, name: 'Skywatch Walled Town', role: 'zone', poly: GR.zone }];
          P.zone = GR.zone;
          KCITY.site.zoneRaster(R, GR.zone, { dry: -50, maxSlope: L.tune().maxSlope, h: G.shapedNoCistern });
          SL.minSpacing = KCITY.site.minSpacing();
        }
      },
      {
        name: 'landmarks and step-cistern courts',
        run: function () {
          var P = L.plan(), CG = L.cg();
          /* Reserve the two vaulted step-cistern flagstone courts so streets and lots flow around them */
          for (var ci = 0; ci < G.cisterns.length; ci++) {
            var cs0 = G.cisterns[ci];
            var cw = cs0.rimW * 0.5 + 8, cd = cs0.rimD * 0.5 + 8;
            var cpoly = [[cs0.x - cw, cs0.z - cd], [cs0.x + cw, cs0.z - cd], [cs0.x + cw, cs0.z + cd], [cs0.x - cw, cs0.z + cd]];
            var gn = SL.addGreen('plaza', cpoly, 1, 0.7, 'civic', obb([cs0.x, cs0.z], [1, 0], cw, cd));
            gn.name = cs0.name;
            SL.R.stampPoly(cpoly, OCC.HARD, -2 - gn.id);
          }
          /* Reserve central Pass Toll Square at the avenues crossing */
          var xing = GR.nodes[2][2];
          var sqPoly = [[xing.x - 20, xing.z - 20], [xing.x + 20, xing.z - 20], [xing.x + 20, xing.z + 20], [xing.x - 20, xing.z + 20]];
          SL.R.stampPoly(sqPoly, OCC.HARD, -99);

          /* Place the 6 town anchors */
          for (var ai = 0; ai < ANCHORS.length; ai++) {
            var A = ANCHORS[ai], D0 = dimsOf(A.key);
            var cc = cellCenter(A.cell[0], A.cell[1]);
            var ry = faceVec(A.face[0], A.face[1]);
            var bo = boxAt(cc, ry, D0.w, D0.d, 0);
            var Lt = {
              id: P.lots.length, cls: 'landmark', role: A.id, key: A.key, v: 0, slot: 0, wealth: 0.85,
              x: cc[0], z: cc[1], y: CG.pad(bo), ry: ry, w: D0.w, d: D0.d, h: D0.h,
              lot: bo, bo: bo, way: -1, side: 0, s: 0, born: 1, died: null, civic: true,
              swId: 'sw.town.' + A.id, swName: A.name
            };
            P.lots.push(Lt);
            SL.hashLot(Lt);
            SL.register(Lt);
            P.landmarks.push(Lt);
            SL.R.stampPoly(obbCorners(boxAt(cc, ry, D0.w, D0.d, 4.5)), OCC.HARD, Lt.id);
          }
        }
      },
      { name: 'districts', run: function () { SL.note(2, 'north-slope sunny terraces by wealth'); } },
      {
        name: 'avenues and switchback streets',
        run: function () {
          for (var wi = 0; wi < GR.ways.length; wi++) {
            var w = GR.ways[wi];
            /* Skip any inner grid edge that passes directly through a cistern court */
            var hitsCistern = false;
            if (w.role === 'grid') {
              for (var pi = 0; pi < w.pts.length; pi++) {
                if (G.inCistern(w.pts[pi][0], w.pts[pi][1], 10)) hitsCistern = true;
              }
            }
            if (hitsCistern) continue;
            var tag = w.role === 'avenue' ? (w.line === 'v' ? 'Pass Royal Road' : 'Crag-to-Serai Way') :
                      w.role === 'ring' ? 'Rampart Switchback' : 'Terrace Street';
            SL.addWay(w.kind, w.pts, 3, { tag: tag });
          }
        }
      },
      { name: 'highways', run: function () { SL.note(4, 'external pass roads join the four gates'); } },
      {
        name: 'the wall and its gates',
        run: function () {
          var P = L.plan();
          var avs = P.ways.filter(function (w) { return w.cls === 'avenue'; });
          var named = GR.gates.map(function (g) { return { x: g.x, z: g.z, marker: g.side, name: GATE_NAMES[g.side] }; });
          var Wr = P.wallRec = KCITY.grid.wall(GR, avs, { towerGap: 72, clear: 14, gateFind: 42, named: named, side: 1, health: 2 });
          Wr.nodes.forEach(function (n) { n.gx = n.x; n.gz = n.z; });
          Wr.corners = GR.corners;
          Wr.segs = KCITY.site.wallSegs(Wr.nodes.filter(function (n) { return !n.skip; }));
          KCITY.site.stampWall(Wr, { thick: 5.4, step: 5, gateTower: 6 });
          for (var k = 0; k < GR.corners.length; k++) {
            var cn = GR.corners[k];
            SL.R.eachNearSeg([cn.x, cn.z], [cn.x, cn.z], 13, function (idx) {
              if (SL.R.occ[idx] === OCC.FREE || SL.R.occ[idx] === OCC.LOT) SL.R.occ[idx] = OCC.OUT;
            });
          }
          P.gates = Wr.gates.map(function (g) { return { p: [g.x, g.z], dir: g.name, side: g.marker }; });
        }
      }
    ].concat(KCITY.defaultSteps().slice(6).filter(function (st) {
      return st.name !== 'alleys and alley lots';
    }));

    var gatePt = function (sd) {
      var g = GR.gates.find(function (q) { return q.side === sd; });
      return g ? [g.x, g.z] : [10, -70];
    };
    var pNorth = gatePt('v-'), pSouth = gatePt('v+'), pEast = gatePt('u+'), pWest = gatePt('u-');
    var pCross = [GR.nodes[2][2].x, GR.nodes[2][2].z];
    var pCit = cellCenter(0, 1), pScrip = cellCenter(1, 2);

    var cityRules = {
      wealth: function (p) {
        /* North-facing upper west terraces near Observatory Gate & Scriptorium are richest; south/east edges poorer */
        var w = 0.54 - (p[0] - 10) / 680 - (p[1] + 70) / 820;
        if (Math.hypot(p[0] - pScrip[0], p[1] - pScrip[1]) < 120) w += 0.24;
        if (Math.hypot(p[0] - pEast[0], p[1] - pEast[1]) < 110) w -= 0.16;
        return w < 0.08 ? 0.08 : w > 0.92 ? 0.92 : w;
      },
      vacant: function (p, rs) {
        /* Keep generous alpine snow-yards so permanent town census lands near 1,600 (1,450..1,750) */
        return rs.chance(p[0] > 90 ? 0.44 : 0.34);
      },
      groundOk: function (bo) {
        if (!bo || !bo.c) return true;
        return !G.inCistern(bo.c[0], bo.c[1], 10);
      },
      near: {
        scriptorium: function (c) { return Math.hypot(c.p[0] - pScrip[0], c.p[1] - pScrip[1]); },
        crossroad:   function (c) { return Math.hypot(c.p[0] - pCross[0], c.p[1] - pCross[1]); },
        north_gate:  function (c) { return Math.hypot(c.p[0] - pNorth[0], c.p[1] - pNorth[1]); },
        south_gate:  function (c) { return Math.hypot(c.p[0] - pSouth[0], c.p[1] - pSouth[1]); },
        east_gate:   function (c) { return Math.hypot(c.p[0] - pEast[0], c.p[1] - pEast[1]); },
        citadel:     function (c) { return Math.hypot(c.p[0] - pCit[0], c.p[1] - pCit[1]); }
      }
    };

    var finishCity = [function (Ci) {
      var P = Ci.plan;
      for (var li = 0; li < P.lots.length; li++) {
        var Lt = P.lots[li];
        if (Lt.died != null || !Lt.bo || !Lt.key) continue;
        if (G.inCistern(Lt.x, Lt.z, 9)) { Lt.died = 'cistern'; continue; }
        /* Drop any non-landmark lot whose building box grazes a live street */
        if (Lt.cls !== 'landmark') {
          var D0 = dimsOf(Lt.key);
          var hw = (D0 ? D0.w : Lt.w) * 0.5, hd = (D0 ? D0.d : Lt.d) * 0.5, B = Lt.bo;
          var hitRoad = P.ways.some(function (w) {
            if (w.died != null) return false;
            var m = w.w * 0.5 - 0.3;
            return w.pts.some(function (pt) {
              var dx = pt[0] - B.c[0], dz = pt[1] - B.c[1];
              return Math.abs(dx * B.u[0] + dz * B.u[1]) < hw + m && Math.abs(dx * B.v[0] + dz * B.v[1]) < hd + m;
            });
          });
          if (hitRoad) Lt.died = 'street-clear';
        }
      }
    }];

    var cityInst = KCITY.create({
      name: 'skywatch',
      tune: cityTune,
      seed: 77647,
      rand: 'krand',
      index: { order: 'insertion' },
      ground: { h: G.shapedNoCistern },
      kit: { dims: cityDims },
      rules: cityRules,
      steps: steps,
      finish: finishCity
    });
    cityInst.run();
    var PL = cityInst.plan;

    /* Extract Curtain Wall nodes & segments first so town lots never collide with gates/towers.
       Jimjam wall pieces (76-jj-military.js) run their length along local +x, outer parapet/spires on +z,
       gate passage along local z, tower/gate walkway doors on +-x, and corner bastion outward bisector on (+x, +z). */
    var Wr = PL.wallRec;
    if (Wr) {
      var rawRing = [];
      for (var ci2 = 0; ci2 < Wr.nodes.length; ci2++) {
        var nd0 = Wr.nodes[ci2];
        if (nd0.skip || nd0.deleted || nd0.closing) continue;
        var rx0 = nd0.gx == null ? nd0.x : nd0.gx;
        var rz0 = nd0.gz == null ? nd0.z : nd0.gz;
        if (rawRing.length && Math.hypot(rx0 - rawRing[rawRing.length - 1].wx, rz0 - rawRing[rawRing.length - 1].wz) < 1.0) continue;
        rawRing.push({ src: nd0, origIdx: ci2, kind: nd0.kind, wx: rx0, wz: rz0 });
      }
      if (rawRing.length > 2 && Math.hypot(rawRing[0].wx - rawRing[rawRing.length - 1].wx, rawRing[0].wz - rawRing[rawRing.length - 1].wz) < 1.0) {
        rawRing.pop();
      }
      var nRing = rawRing.length;
      var spanOutNorm = function (a, b) {
        var dx = b.wx - a.wx, dz = b.wz - a.wz, L = Math.hypot(dx, dz);
        var inv = L > 1e-6 ? 1 / L : 1;
        var ux = dx * inv, uz = dz * inv;
        var mx = 0.5 * (a.wx + b.wx) - SQ.c[0], mz = 0.5 * (a.wz + b.wz) - SQ.c[1];
        var sgn = (mx * uz - mz * ux) >= 0 ? 1 : -1;
        return { ux: ux, uz: uz, L: L, nx: sgn * uz, nz: -sgn * ux };
      };
      var endSetback = function (kind) {
        /* Exact distance from node center where curtain-wall masonry ends so its 5.0 m brick faces
           embed 0.55-0.60 m (inside [0.35, 0.75] m) into the solid masonry body with zero wedge gap:
             - gate:   solid brick end wall at 12.00 m -> 11.45 m gives 0.55 m embed across full width
             - corner: solid drum R=5.35 m (4.73 m at |z|=2.5 m) -> 4.15 m gives 0.58 m face / 0.51 m corner embed
             - tower:  solid drum R=4.38 m (3.60 m at |z|=2.5 m) -> 3.00 m gives 0.60 m face / 0.48 m corner embed */
        if (kind === 'gate') return 11.45;
        if (kind === 'corner') return 4.15;
        return 3.00;
      };
      var nodeRecs = [];
      var bastionCount = 0;
      for (var ni2 = 0; ni2 < nRing; ni2++) {
        var curN = rawRing[ni2];
        var prevN = rawRing[(ni2 - 1 + nRing) % nRing];
        var nextN = rawRing[(ni2 + 1) % nRing];
        var spIn = spanOutNorm(prevN, curN);
        var spOut = spanOutNorm(curN, nextN);
        var bx = spIn.nx + spOut.nx, bz = spIn.nz + spOut.nz;
        var bL = Math.hypot(bx, bz);
        if (bL < 1e-6) { bx = spOut.nx; bz = spOut.nz; bL = 1; }
        bx /= bL; bz /= bL;
        var outRy = Math.atan2(bx, bz);
        var nd = curN.src;
        var nRec = null;
        if (curN.kind === 'gate') {
          nRec = makeRecord('sw.wall.gate.' + (nd.marker || curN.origIdx), 2, 'jj_wall_gate', curN.wx, curN.wz, outRy, {
            name: nd.name || ('Pass Gate ' + curN.origIdx), landmark: true, quarter: 'walls', wallRun: true, ringIdx: ni2
          });
        } else if (curN.kind === 'corner') {
          bastionCount++;
          nRec = makeRecord('sw.wall.corner.' + curN.origIdx, 2, 'jj_wall_corner', curN.wx, curN.wz, outRy - Math.PI * 0.25, {
            name: 'Pass Bastion ' + bastionCount, quarter: 'walls', wallRun: true, ringIdx: ni2
          });
        } else {
          nRec = makeRecord('sw.wall.tower.' + curN.origIdx, 2, 'jj_wall_tower', curN.wx, curN.wz, outRy, {
            name: 'Curtain Watchtower ' + curN.origIdx, quarter: 'walls', wallRun: true, ringIdx: ni2
          });
        }
        wallParts.push(nRec);
        nodeRecs.push(nRec);
        space.insert(nRec, nRec.x, nRec.z, Math.hypot(nRec.w, nRec.d) * 0.5);
      }

      var targetSegLen = 12.0;
      var mortise = 0.04;
      for (var si = 0; si < nRing; si++) {
        var nA = rawRing[si], nB = rawRing[(si + 1) % nRing];
        var recA = nodeRecs[si], recB = nodeRecs[(si + 1) % nRing];
        var sp = spanOutNorm(nA, nB);
        var offA = endSetback(nA.kind), offB = endSetback(nB.kind);
        var usable = sp.L - offA - offB;
        if (usable <= 1.0) continue;
        var nSeg = Math.max(1, Math.round(usable / targetSegLen));
        var stepL = usable / nSeg;
        /* Local +z points outward along (sp.nx, sp.nz), local +-x runs along the span chord */
        var sry = Math.atan2(sp.nx, sp.nz);
        for (var sj = 0; sj < nSeg; sj++) {
          var d0 = sj === 0 ? offA : (offA + sj * stepL - mortise);
          var d1 = sj === nSeg - 1 ? (sp.L - offB) : (offA + (sj + 1) * stepL + mortise);
          var dMid = 0.5 * (d0 + d1);
          var segW = d1 - d0;
          var sx = nA.wx + sp.ux * dMid, sz = nA.wz + sp.uz * dMid;
          var segRec = makeRecord('sw.wall.seg.' + si + '.' + sj, 2, 'jj_wall_seg', sx, sz, sry, {
            w: r4(segW),
            quarter: 'walls',
            wallRun: true,
            spanIdx: si,
            segIdx: sj,
            segCount: nSeg,
            nodeA: recA.id,
            nodeB: recB.id,
            segScaleX: r4(segW / targetSegLen)
          });
          wallParts.push(segRec);
          space.insert(segRec, segRec.x, segRec.z, Math.hypot(segRec.w, segRec.d) * 0.5);
        }
      }
    }

    /* Place the two vaulted rock-cut Step-Cisterns */
    var tier2 = [];
    for (var csi = 0; csi < G.cisterns.length; csi++) {
      var cdef = G.cisterns[csi];
      tier2.push(registerPlaced(makeRecord(cdef.id, 2, 'sw_step_cistern', cdef.x, cdef.z, 0, {
        name: cdef.name, y: cdef.rimY, landmark: true, quarter: 'town',
        cistern: cdef
      })));
    }

    /* Filter and accept KCITY lots with strict exact-OBB 1.2 m gap check so overlaps === 0 always */
    var rawLots = PL.lots.filter(function (Lt) { return Lt.died == null && Lt.bo && Lt.key; });
    /* Landmarks first, then civic, then residential/shops */
    rawLots.sort(function (a, b) {
      var ra = a.cls === 'landmark' ? 0 : a.civic ? 1 : 2;
      var rb = b.cls === 'landmark' ? 0 : b.civic ? 1 : 2;
      return ra - rb || a.id - b.id;
    });
    for (var li2 = 0; li2 < rawLots.length; li2++) {
      var Lt2 = rawLots[li2];
      var lid = Lt2.swId || ('sw.town.lot.' + Lt2.id);
      var rec = makeRecord(lid, 2, Lt2.key, Lt2.x, Lt2.z, Lt2.ry, {
        name: Lt2.swName || undefined,
        v: Lt2.v | 0,
        landmark: Lt2.cls === 'landmark',
        civic: !!Lt2.civic,
        quarter: 'town',
        lotCls: Lt2.cls
      });
      var reach = Math.hypot(rec.w, rec.d) * 0.5 + 24;
      var clash = space.some(rec.x, rec.z, reach, function (other) {
        return boxesOverlap(rec, other, 1.2);
      });
      if (!clash) {
        tier2.push(registerPlaced(rec));
      }
    }

    /* Regional JJ4 Hamlets via KHAMLET.village (Cempu-malai skarn relay & Gete-Watch ridge post) */
    var hamlets = [];
    if (typeof KHAMLET !== 'undefined' && KHAMLET.village) {
      var hSpecs = [
        { id: 'sw.hamlet.cempu_step', name: 'Cempu-Step Lower Relay', focus: 'mine', site: { x: -820, z: 980 }, link: { x: pSouth[0], z: pSouth[1] }, popMax: 180 },
        { id: 'sw.hamlet.gete_post', name: 'Gete-Ridge Herder Steading', focus: 'ranch', site: { x: -1180, z: -560 }, link: { x: pWest[0], z: pWest[1] }, popMax: 140 }
      ];
      for (var hi = 0; hi < hSpecs.length; hi++) {
        var hs = hSpecs[hi];
        var hv = KHAMLET.village({
          id: hs.id,
          world: WORLD_SEED,
          culture: 'skywatch-pass',
          focus: hs.focus,
          site: hs.site,
          link: hs.link,
          popMax: hs.popMax,
          dims: dimsOf,
          ground: { ok: function (x, z) { return G.slope(x, z, 8) < 0.28; } }
        });
        hv.title = hs.name;
        hamlets.push(hv);
      }
    }

    /* ================================================================
       TIER III — Leeward Caravanserai, Royal Salt Vaults, Assay Yard & KCAMP Convoys
       ================================================================ */
    var tier3 = [];
    var leeSpecs = [
      ['sw.lee.caravanserai', 'jj_caravanserai', 462, 185, azToRy(285), { name: 'Royal Pass Caravanserai', landmark: true, quarter: 'caravanserai' }],
      ['sw.lee.salt_vault_a', 'jj_warehouse_a',  548, 150, azToRy(200), { name: 'Royal Bonded Halite Vault West', quarter: 'caravanserai', job: 'warehousing' }],
      ['sw.lee.salt_vault_b', 'jj_warehouse_b',  602, 162, azToRy(200), { name: 'Royal Bonded Halite Vault East', quarter: 'caravanserai', job: 'warehousing' }],
      ['sw.lee.grain_vault',  'jj_granary',      545, 226, azToRy(20),  { name: 'Back-Haul Parched Grain Granary', quarter: 'caravanserai' }],
      ['sw.lee.stabbur_a',    'hl_rus_silo_stabbur', 586, 232, azToRy(15), { name: 'Highland Winter Provision Stabbur I', quarter: 'caravanserai' }],
      ['sw.lee.stabbur_b',    'hl_rus_silo_stabbur', 614, 236, azToRy(15), { name: 'Highland Winter Provision Stabbur II', quarter: 'caravanserai' }],
      ['sw.lee.assay_market', 'hl_rus_scrap_market', 402, 258, azToRy(30), { name: 'Rivet-Token & Barter Tally Hall', quarter: 'caravanserai' }],
      ['sw.lee.salvage_yard', 'sw_salvage_assay', 446, 286, azToRy(12), { name: 'Veladiga Optical & Alloy Salvage Assay Yard', landmark: true, quarter: 'caravanserai', ruinWatch: true }],
      ['sw.lee.yak_pens_a',   'hl_rus_pens',     522, 294, azToRy(350), { name: 'Upper Yak & Pack-Mule Re-Teaming Corral', quarter: 'caravanserai' }],
      ['sw.lee.yak_pens_b',   'hl_rus_pens',     568, 304, azToRy(350), { name: 'Lower Caravan Ox-Swap Corral', quarter: 'caravanserai' }],
      ['sw.lee.teamster_inn', 'jj_inn',          392, 138, azToRy(165), { name: 'The Three Wheels Drovers Inn', quarter: 'caravanserai' }]
    ];
    for (var l3 = 0; l3 < leeSpecs.length; l3++) {
      var s3 = leeSpecs[l3];
      tier3.push(registerPlaced(makeRecord(s3[0], 3, s3[1], s3[2], s3[3], s3[4], s3[5])));
    }

    /* Armed Merchant Convoy Laagers pitched via KCAMP.pitch on the sheltered ESE lee shoulder */
    var camps = [];
    var convoySites = [
      {
        id: 'sw.camp.convoy_serai', name: 'Serai Salt-Train Armed Laager',
        culture: 'skywatch-convoy', tagCulture: 'rustic',
        site: { x: 648, z: 348 }, way: [-0.8, -0.6], common: 13,
        program: {
          tents: [
            { key: 'sw_convoy_pavilion', n: 1 },
            { key: 'sw_convoy_tent', n: 4 },
            { key: 'sw_convoy_guard', n: 3 },
            { key: 'sw_convoy_wagon', n: 2 }
          ],
          pens: [{ key: 'sw_convoy_picket', n: 2 }]
        }
      },
      {
        id: 'sw.camp.convoy_jimjam', name: 'Royal Stipend & Brick Convoy Camp',
        culture: 'skywatch-convoy', tagCulture: 'jimjam',
        site: { x: 472, z: 412 }, way: [-0.4, -0.9], common: 12,
        program: {
          tents: [
            { key: 'sw_convoy_pavilion', n: 1 },
            { key: 'sw_convoy_tent', n: 3 },
            { key: 'sw_convoy_guard', n: 3 },
            { key: 'sw_convoy_wagon', n: 2 }
          ],
          pens: [{ key: 'sw_convoy_picket', n: 1 }]
        }
      }
    ];

    /* ================================================================
       TIER IV — Copper-Zinc Skarn Adits (RES_ORE) & Katabatic Wind-Furnace Brass Works
       ================================================================ */
    var oreNodes = [
      { id: 'sw.node.copper_hi',   kind: 'copper',    grade: 'high',   x: 786, z: -268 },
      { id: 'sw.node.copper_med',  kind: 'copper',    grade: 'medium', x: 848, z: -182 },
      { id: 'sw.node.zinc_hi',     kind: 'zinc',      grade: 'high',   x: 742, z: -318 },
      { id: 'sw.node.zinc_med',    kind: 'zinc',      grade: 'medium', x: 882, z: -244 },
      { id: 'sw.node.iron_med',    kind: 'iron',      grade: 'medium', x: 834, z: -112 },
      { id: 'sw.node.saltpeter',   kind: 'saltpeter', grade: 'medium', x: 912, z: -156 },
      { id: 'sw.node.turquoise',   kind: 'turquoise', grade: 'low',    x: 716, z: -356 }
    ];
    for (var ni = 0; ni < oreNodes.length; ni++) {
      var nd0 = oreNodes[ni];
      nd0.y = r2(G.h(nd0.x, nd0.z));
      nd0.size = RES_ORE.grades[nd0.grade].size;
    }

    var tier4 = [];
    var skarnSpecs = [
      ['sw.skarn.adit_copper',  'sw_skarn_adit',   764, -252, azToRy(235), { name: 'Upper Chalcopyrite Skarn Adit', works: 'mine', quarter: 'skarn', aditKind: 'copper' }],
      ['sw.skarn.adit_zinc',    'sw_skarn_adit',   724, -300, azToRy(220), { name: 'Calamine & Sphalerite Skarn Adit', works: 'mine', quarter: 'skarn', aditKind: 'zinc' }],
      ['sw.skarn.adit_iron',    'sw_skarn_adit',   812, -124, azToRy(250), { name: 'Magnetite Contact Adit', works: 'mine', quarter: 'skarn', aditKind: 'iron' }],
      ['sw.skarn.adit_fungi',   'sw_skarn_adit',   654, -278, azToRy(195), { name: 'Spent-Adit Alecap & Pale-Fungi Dark-Beds', quarter: 'skarn', job: 'fungiculture', aditKind: 'fungi' }],
      ['sw.skarn.wind_furnace_a','sw_wind_furnace', 694, -196, azToRy(285), { name: 'North Katabatic Brass Wind-Furnace', landmark: true, quarter: 'skarn' }],
      ['sw.skarn.wind_furnace_b','sw_wind_furnace', 726, -152, azToRy(285), { name: 'South Katabatic Brass Wind-Furnace', quarter: 'skarn' }],
      ['sw.skarn.brass_foundry','hl_rep_smelter',  646, -162, azToRy(260), { name: 'Skywatch Brass Ring & Astrolabe Foundry', landmark: true, quarter: 'skarn' }],
      ['sw.skarn.smithy_a',     'hl_rus_smithy',   632, -218, azToRy(185), { name: 'Telescope Mount & Bell-Casters Smithy', quarter: 'skarn' }],
      ['sw.skarn.smithy_b',     'hl_rus_smithy',   676, -118, azToRy(355), { name: 'Caravan Tyre & Frost-Gear Smithy', quarter: 'skarn' }],
      ['sw.skarn.ore_store',    'hl_rus_granary',  754, -198, azToRy(270), { name: 'Charcoal & Crushed Calamine Shed', quarter: 'skarn' }]
    ];
    for (var s4 = 0; s4 < skarnSpecs.length; s4++) {
      var sp4 = skarnSpecs[s4];
      var r4rec = registerPlaced(makeRecord(sp4[0], 4, sp4[1], sp4[2], sp4[3], sp4[4], sp4[5]));
      if (r4rec.works === 'mine') {
        /* Link each mine adit to its nearest node via kits/resources resSource() */
        var targetPool = r4rec.aditKind === 'copper' ? oreNodes.filter(function (n) { return n.kind === 'copper'; }) :
                         r4rec.aditKind === 'zinc'   ? oreNodes.filter(function (n) { return n.kind === 'zinc'; }) : oreNodes;
        r4rec.source = resSource(r4rec, targetPool, { radius: 400 });
      }
      tier4.push(r4rec);
    }

    /* ================================================================
       TIER V — The Silent Moot (13-Monolith Equinox Ring) & Sasquatch Camps
       ================================================================ */
    var tier5 = [];
    var mootX = G.moot.x, mootZ = G.moot.z, mootR = 14.0;
    var monoliths = [];
    /* 13 frost-split columnar-basalt monoliths for the Thirteen moon on R = 14.0 m:
       Placed symmetrically around the Equinox Sunrise axis (Az 90.00 deg -> +x direction, angle 0 rad in (cos a, sin a)):
       Stones k = 0..12 sit at angles a_k = (k + 0.5) * (2*PI / 13), so stones k=0 (+13.85 deg) and k=12 (-13.85 deg)
       frame an exact symmetrical east portal centered on Az 90.00 deg! Zero Painted-Men totems. */
    for (var mi = 0; mi < 13; mi++) {
      var ang = (mi + 0.5) * (2 * Math.PI / 13);
      var mx = mootX + Math.cos(ang) * mootR;
      var mz = mootZ + Math.sin(ang) * mootR;
      /* Broad face tangent to the circle, facing inward toward the Truce-Gong */
      var mry = faceVec(mootX - mx, mootZ - mz);
      var mono = registerPlaced(makeRecord(
        'sw.moot.monolith.' + (mi < 9 ? '0' + (mi + 1) : String(mi + 1)),
        5, 'sw_moot_monolith', mx, mz, mry,
        {
          name: 'Thirteen-Moon Basalt Monolith ' + (mi + 1),
          quarter: 'silent-moot',
          monolithIndex: mi + 1,
          ringAngleDeg: r2(((Math.atan2(mx - mootX, -(mz - mootZ)) * R2D) + 360) % 360),
          portalPair: mi === 0 || mi === 12
        }
      ));
      monoliths.push(mono);
      tier5.push(mono);
    }

    /* Central Cast-Brass Truce-Gong on Basalt Arch, aligned so its portal faces East Equinox Sunrise (Az 90 deg) */
    var gong = registerPlaced(makeRecord('sw.moot.truce_gong', 5, 'sw_truce_gong', mootX, mootZ, azToRy(90), {
      name: 'The Cast-Brass Equinox Truce-Gong',
      landmark: true, quarter: 'silent-moot'
    }));
    tier5.push(gong);

    /* Twin Stone Barter Slabs: North Slab (Sasquatch qiviut, pelts, goldroot) & South Slab (Skywatch halite, iron kettles, grain) */
    var northSlab = registerPlaced(makeRecord('sw.moot.table_north', 5, 'sw_moot_table', mootX, mootZ - 6.8, 0, {
      name: 'North Barter Slab (Qiviut, Pelts & Goldroot)',
      quarter: 'silent-moot', side: 'north', culture: 'talovolci', family: 'sasquatch'
    }));
    var southSlab = registerPlaced(makeRecord('sw.moot.table_south', 5, 'sw_moot_table', mootX, mootZ + 6.8, Math.PI, {
      name: 'South Barter Slab (Block Halite, Iron Kettles & Grain)',
      quarter: 'silent-moot', side: 'south', culture: 'jimjam'
    }));
    tier5.push(northSlab, southSlab);

    /* Four No-Steel Boundary Truce Cairns at R = 38 m around the Silent Moot */
    var cairnAz = [0, 90, 180, 270];
    for (var bi = 0; bi < cairnAz.length; bi++) {
      var caz = cairnAz[bi] * D2R;
      var cx0 = mootX + Math.sin(caz) * 38, cz0 = mootZ - Math.cos(caz) * 38;
      tier5.push(registerPlaced(makeRecord('sw.moot.cairn.' + bi, 5, 'sw_boundary_cairn', cx0, cz0, 0, {
        name: 'Truce Boundary Cairn (' + cairnAz[bi] + ' deg)',
        quarter: 'silent-moot'
      })));
    }

    /* Seasonal Sasquatch Equinox Bands (SQ1 Frost-Jaw, SQ2 Bone-Larch, SQ3 Hoar-Wind) pitched via KCAMP.pitch at 1.35x scale */
    var sqSpecs = [
      { id: 'sw.camp.sq1', pad: G.sqPads[0], clan: 'Frost-Jaw (SQ1)', way: [0.42, 0.91] },
      { id: 'sw.camp.sq2', pad: G.sqPads[1], clan: 'Bone-Larch (SQ2)', way: [-0.05, 0.99] },
      { id: 'sw.camp.sq3', pad: G.sqPads[2], clan: 'Hoar-Wind (SQ3)', way: [-0.46, 0.89] }
    ];
    for (var qi = 0; qi < sqSpecs.length; qi++) {
      var qs = sqSpecs[qi];
      convoySites.push({
        id: qs.id, name: qs.clan + ' Equinox Barter Camp',
        culture: 'sasquatch', tagCulture: 'talovolci', family: 'sasquatch',
        tier: 5, scaleRig: 1.35,
        site: { x: qs.pad.x, z: qs.pad.z }, way: qs.way, common: 11,
        program: {
          tents: [
            { key: 'sw_sq_elder_lodge', n: 1 },
            { key: 'sw_sq_hide_lodge', n: 3 },
            { key: 'sw_sq_drying_rack', n: 2 }
          ],
          pens: [{ key: 'sw_sq_yak_tether', n: 1 }]
        }
      });
    }

    /* Execute KCAMP.pitch + KCAMP.census for all 5 camps (2 convoy laagers + 3 Sasquatch bands) */
    for (var cpi = 0; cpi < convoySites.length; cpi++) {
      var csSpec = convoySites[cpi];
      var campTier = csSpec.tier == null ? 3 : csSpec.tier;
      var pitched = KCAMP.pitch({
        id: csSpec.id,
        world: WORLD_SEED,
        culture: csSpec.culture,
        program: csSpec.program,
        site: csSpec.site,
        dims: dimsOf,
        ground: { ok: function (x, z) { return G.slope(x, z, 6) < 0.26; } },
        way: csSpec.way,
        common: csSpec.common,
        gap: 2.2
      });
      var campCensus = KCAMP.census({
        id: csSpec.id,
        world: WORLD_SEED,
        culture: csSpec.culture,
        program: csSpec.program
      });
      var campRecs = [];
      for (var tri = 0; tri < pitched.records.length; tri++) {
        var tr = pitched.records[tri];
        var trec = makeRecord(tr.id, campTier, tr.key, tr.x, tr.z, tr.ry, {
          culture: csSpec.tagCulture,
          family: csSpec.family || undefined,
          quarter: campTier === 5 ? 'silent-moot' : 'caravanserai',
          campId: csSpec.id,
          campKind: tr.kind
        });
        var tClash = space.some(trec.x, trec.z, Math.hypot(trec.w, trec.d) * 0.5 + 16, function (other) {
          return boxesOverlap(trec, other, 1.0);
        });
        if (!tClash) {
          registerPlaced(trec);
          campRecs.push(trec);
          if (campTier === 5) tier5.push(trec); else tier3.push(trec);
        }
      }
      camps.push({
        id: csSpec.id,
        name: csSpec.name,
        tier: campTier,
        culture: csSpec.culture,
        tagCulture: csSpec.tagCulture,
        scaleRig: csSpec.scaleRig == null ? 1.0 : csSpec.scaleRig,
        site: csSpec.site,
        hearth: pitched.hearth,
        R: r2(pitched.R),
        census: campCensus,
        records: campRecs,
        short: pitched.short
      });
    }

    /* ================================================================
       ROADS & PATHWAYS (linking Crag, Gates, Caravanserai, Skarn & Silent Moot)
       ================================================================ */
    var ways = PL.ways.filter(function (w) { return w.died == null; }).map(function (w) {
      return { id: 'sw.way.' + w.id, cls: w.cls, w: w.w, tag: w.tag || 'street', pts: w.pts };
    });
    var extRoads = [
      {
        id: 'sw.road.crag_switchback', cls: 'main', w: 6.5, tag: 'Observatory Crag Switchback',
        pts: [pWest, [-310, -95], [-395, -165], [-465, -210], [-528, -252], [-566, -278]]
      },
      {
        id: 'sw.road.south_royal', cls: 'highway', w: 8.5, tag: 'Cempu-malai & Jimjam Royal Pass Road',
        pts: [pSouth, [28, 255], [75, 395], [140, 620], [185, 950]]
      },
      {
        id: 'sw.road.beacon_spur', cls: 'side', w: 4.5, tag: 'South Beacon Trail',
        pts: [[-245, 110], [-355, 240], [-450, 345], [G.beaconSouth.x + 12, G.beaconSouth.z - 8]]
      },
      {
        id: 'sw.road.lee_serai', cls: 'highway', w: 8.5, tag: 'Leeward Caravanserai & Serai Descent Road',
        pts: [pEast, [335, 35], [405, 98], [468, 132], [545, 112], [740, 90], [980, 75]]
      },
      {
        id: 'sw.road.skarn_track', cls: 'main', w: 6.0, tag: 'Skarn Adits & Wind-Furnace Haul Road',
        pts: [[335, 35], [465, -55], [585, -135], [665, -178], [748, -226]]
      },
      {
        id: 'sw.road.north_moot', cls: 'highway', w: 7.5, tag: 'North Matok Road & Silent Moot Track',
        pts: [pNorth, [42, -420], [125, -620], [235, -850], [335, -1045], [mootX, mootZ + 44]]
      }
    ];
    for (var ri = 0; ri < extRoads.length; ri++) ways.push(extRoads[ri]);

    /* Snowmelt Stone Channels feeding the two Step-Cisterns off the +3,817 m WNW Crag */
    var channels = [
      {
        id: 'sw.channel.upper_melt', name: 'Crag Snowmelt Aqueduct',
        pts: [[-515, -248], [-380, -210], [-245, -172], [-135, -146], [G.cisterns[0].x - 11, G.cisterns[0].z]]
      },
      {
        id: 'sw.channel.lower_overflow', name: 'Lower Cistern Overflow Conduit',
        pts: [[G.cisterns[0].x + 11, G.cisterns[0].z + 8], [45, -92], [118, -48], [G.cisterns[1].x - 11, G.cisterns[1].z]]
      }
    ];

    /* Permanent Town Census vs Transient Convoy & Equinox Barter Census */
    var permanentPop = 0, jjCount = 0, hlCount = 0;
    for (var pi2 = 0; pi2 < allStructures.length; pi2++) {
      var st = allStructures[pi2];
      permanentPop += st.pop;
      if (st.tier === 2 && !st.wallRun) {
        if (st.kit === 'jj') jjCount++;
        else if (st.kit === 'vern') hlCount++;
      }
    }
    /* Include garrisoned gatehouse wardens in permanentPop */
    for (var wpi = 0; wpi < wallParts.length; wpi++) permanentPop += wallParts[wpi].pop;

    var convoyPop = 0, sasquatchPop = 0;
    for (var ci3 = 0; ci3 < camps.length; ci3++) {
      if (camps[ci3].culture === 'sasquatch') sasquatchPop += camps[ci3].census.pop;
      else convoyPop += camps[ci3].census.pop;
    }

    return {
      id: M.id,
      name: M.name,
      polity: M.polity,
      pin: { px: M.px, py: M.py, datum: M.datum, cragAsl: M.cragAsl, pressureAtm: M.pressureAtm },
      seed: WORLD_SEED,
      solstice: solsticeGeom,
      solar: SOL,
      grid: { c: SQ.c, half: SQ.half, cells: SQ.cells, zone: GR.zone, gates: PL.gates },
      tiers: {
        1: tier1,
        2: tier2,
        3: tier3,
        4: tier4,
        5: tier5
      },
      structures: allStructures,
      walls: wallParts,
      cisterns: G.cisterns,
      oreNodes: oreNodes,
      moot: {
        x: mootX, z: mootZ, y: G.moot.y, R: mootR,
        equinoxAzDeg: SOL.equinoxSunriseAzDeg,
        monoliths: monoliths,
        gong: gong,
        northSlab: northSlab,
        southSlab: southSlab
      },
      camps: camps,
      hamlets: hamlets,
      ways: ways,
      channels: channels,
      census: {
        permanent: permanentPop,
        transientConvoy: convoyPop,
        equinoxSasquatch: sasquatchPop,
        townJjBuildings: jjCount,
        townHlBuildings: hlCount,
        townJjShare: r2(jjCount / Math.max(1, jjCount + hlCount))
      }
    };
  }

  var INSTANCE = buildLayout();
  return {
    DIMS: DIMS,
    dimsOf: dimsOf,
    cornersOf: cornersOf,
    boxesOverlap: boxesOverlap,
    sunDirAt: sunDirAt,
    altAzOf: altAzOf,
    make: buildLayout,
    plan: INSTANCE
  };
})();
