/* ================================================================= DILIHAN — Deterministic 5-Zone & Dellu-Handu Layout ([G data])
   [G data] Pure data and functions over DL_MODEL (28), DL_GROUND (30), KRAND, KSPACE, KCITY, KHAMLET, CROPS, RES_ORE.
   Draws nothing; runs identically in Node (tests/test-dilihan.js), the browser page, and Godot.

   Zones (PLAN.md §1.7, §2, §3):
     Zone 1  The Old Quarter (Colonia, 500 x 500 m = 0.250 km2 inside gated Jimjam brick-and-marble circuit wall, jimjam: 1.0)
     Zone 2  The Governor's Precinct (70 x 56 m walled grounds at -878 m join: dl_gov_palace + IZV guard tower/barracks/halls)
     Zone 3  The Vernacular Districts (1.000 km2 = 4.0x the colonia, iziz-vernacular: 0.9, jimjam: 0.1, <= 0.5 m wall-street
             cornice match via o.scale, north Jimjam caravanserai, bronze/tin foundries, Quiet-Copy shops, KCONS expansion lots)
     Zone 4  The Lower Town (-923 m at pass-road fork: customs post, Hykkousoi envoys' house, stream bridge, SE tunnel portal)
     Zone 5  The Country (Dellu-Handu: 8 KHAMLET veteran allotment hamlets, CROPS Cut plots, NW brickyards, NE tin/iron skarn
             adits on RES_ORE, and D2 potash/halite salt works 8 km north on the -1,608 m Cut Salt Lake shore) */
var DL_LAYOUT = (function () {
  'use strict';
  var G = DL_GROUND, M = DL_MODEL;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var WORLD_SEED = KRAND.hash(744, 663, 8886, 51);

  function r2(v) { return Math.round(v * 100) / 100; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function azToRy(azDeg) { return Math.PI - azDeg * D2R; }
  function faceVec(dx, dz) { return Math.atan2(dx, dz); }

  /* ---- 1. Exact [G data] ephemeris solver matching core/atmos/sky/89-atmos-e-skymodel.js at (-31.50 deg S, 56.27 deg) ---- */
  function atmosSunDir(latDeg, hour, dayCount) {
    var yearD = 365, tilt = 23 * D2R, solsticeDay = 350, startDay = 259;
    var t = (dayCount == null ? 0 : dayCount) + hour / 24;
    var yd = startDay + t;
    var lon = (270 + 360 * (yd - solsticeDay) / yearD) * D2R;
    var dec = Math.asin(Math.sin(tilt) * Math.sin(lon));
    var phi = latDeg * D2R;
    var H = 15 * (hour - 12) * D2R;
    var sa = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
    var alt = Math.asin(sa < -1 ? -1 : sa > 1 ? 1 : sa);
    var az = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.cos(phi) * Math.sin(dec) - Math.sin(phi) * Math.cos(dec) * Math.cos(H));
    return [Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt)];
  }
  function altAzOf(v) {
    var s = v[1] < -1 ? -1 : v[1] > 1 ? 1 : v[1];
    return { alt: Math.asin(s) * R2D, az: ((Math.atan2(v[0], -v[2]) * R2D) + 360) % 360 };
  }
  function horizonAtAz(azDeg) {
    var a = ((azDeg % 360) + 360) % 360;
    var i0 = Math.floor(a) % 360, i1 = (i0 + 1) % 360, f = a - Math.floor(a);
    return M.horizonAlt[i0] * (1 - f) + M.horizonAlt[i1] * f;
  }
  function solveSolstice(latDeg, targetAltDeg, dayCount) {
    var lo = 16.5, hi = 21.0;
    for (var i = 0; i < 64; i++) {
      var mid = (lo + hi) * 0.5;
      var d = atmosSunDir(latDeg, mid, dayCount);
      if (Math.asin(d[1]) * R2D > targetAltDeg) lo = mid; else hi = mid;
    }
    var hr = (lo + hi) * 0.5;
    var dir = atmosSunDir(latDeg, hr, dayCount);
    var aa = altAzOf(dir);
    var hz = horizonAtAz(aa.az);
    return {
      latitude: latDeg,
      subGiantLon: M.subGiantLon,
      day: 350,
      dayCount: dayCount,
      targetAltDeg: targetAltDeg,
      hour: r4(hr),
      azimuthDeg: r4(aa.az),
      altitudeDeg: r4(aa.alt),
      horizonAltDeg: r4(hz),
      horizonClearDeg: r4(aa.alt - hz),
      ry: r4(azToRy(aa.az)),
      sunDir: [r4(dir[0]), r4(dir[1]), r4(dir[2])]
    };
  }
  var SOL = solveSolstice(M.latitude, 4.0, 91);
  /* Also compute the unshifted (744, 663) 4.x refPx trap (-39.36 deg S) for the negative test */
  var SOL_UNSHIFTED_TRAP = solveSolstice(-40 - (663 - 690) * 2 / 84, 4.0, 91);

  /* ---- 2. Canonical building footprints, cornice heights & tag metadata across JJ, IZV & Dilihan landmarks ---- */
  var DIMS = {
    /* Jimjam kit (settlements/jimjam/src/70..77) — read in place */
    jj_house_poor_a:  { w: 8.4,  d: 7.8,  h: 8.5,  cornice: 5.20, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 8 },
    jj_house_poor_b:  { w: 6.2,  d: 8.4,  h: 8.1,  cornice: 5.40, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 7 },
    jj_house_poor_c:  { w: 8.1,  d: 8.1,  h: 5.9,  cornice: 3.90, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 8 },
    jj_house_mid_a:   { w: 10.6, d: 11.2, h: 15.2, cornice: 7.46, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single'], pop: 14 },
    jj_house_mid_b:   { w: 11.5, d: 7.8,  h: 19.6, cornice: 13.0, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'],  pop: 18 },
    jj_house_mid_c:   { w: 12.9, d: 12.4, h: 15.4, cornice: 10.65,kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'],  pop: 20 },
    jj_house_rich_a:  { w: 24.5, d: 24.5, h: 18.0, cornice: 9.90, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 26, lit: false },
    jj_house_rich_b:  { w: 18.4, d: 24.0, h: 21.8, cornice: 9.60, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 22, lit: false },
    jj_house_rich_c:  { w: 23.0, d: 23.2, h: 27.0, cornice: 10.4, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 28, lit: false },
    jj_shop_weapons:  { w: 8.4,  d: 9.0,  h: 11.9, cornice: 7.20, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'smithing', pop: 9 },
    jj_shop_armor:    { w: 10.2, d: 8.6,  h: 10.2, cornice: 7.10, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'smithing', pop: 9 },
    jj_shop_general:  { w: 10.0, d: 8.4,  h: 10.4, cornice: 7.55, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading',  pop: 10 },
    jj_shop_food:     { w: 9.6,  d: 9.2,  h: 9.4,  cornice: 6.90, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'baking',   pop: 10 },
    jj_shop_alchemy:  { w: 6.4,  d: 8.0,  h: 11.6, cornice: 7.40, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'alchemy',  pop: 8 },
    jj_shop_textiles: { w: 10.0, d: 8.6,  h: 10.2, cornice: 7.50, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'weaving',  pop: 10 },
    jj_shop_jeweler:  { w: 6.0,  d: 7.6,  h: 10.2, cornice: 7.20, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['shop'], job: 'smithing', pop: 8 },
    jj_shop_spice:    { w: 8.0,  d: 8.2,  h: 8.6,  cornice: 6.60, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading',  pop: 8 },
    jj_inn:           { w: 33.4, d: 37.5, h: 18.8, cornice: 9.20, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['inn'],  job: 'trading',  pop: 36, lit: false },
    jj_tavern:        { w: 16.0, d: 27.4, h: 18.4, cornice: 8.40, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['tavern'], job: 'brewing', pop: 18, lit: false },
    jj_caravanserai:  { w: 57.2, d: 71.6, h: 25.0, cornice: 11.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['inn', 'market'], job: 'trading', pop: 68, lit: true },
    jj_library:       { w: 45.5, d: 30.6, h: 33.0, cornice: 13.5, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'scribing', pop: 42, lit: true },
    jj_school:        { w: 31.0, d: 29.0, h: 16.0, cornice: 9.50, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'scribing', pop: 34, lit: true },
    jj_amphitheater:  { w: 64.3, d: 49.0, h: 22.4, scale: 0.80, cornice: 14.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['civic'], pop: 30, lit: true },
    jj_temple_sun:    { w: 50.0, d: 86.0, h: 48.0, cornice: 21.3, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['religious', 'civic'], job: 'worship', pop: 45, lit: true },
    jj_barracks:      { w: 51.2, d: 41.6, h: 17.6, scale: 0.80, cornice: 10.2, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military', 'civic'], pop: 120, lit: true },
    jj_fortress:      { w: 72.8, d: 70.0, h: 30.8, scale: 0.70, cornice: 14.0, kit: 'jj', culture: 'jimjam', wealth: null, types: ['military', 'civic'], pop: 160, lit: true },
    jj_farm_field:    { w: 30.0, d: 24.0, h: 2.6,  cornice: 1.80, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm'], job: 'farming',  pop: 0 },
    jj_farmhouse_a:   { w: 22.0, d: 20.0, h: 9.2,  cornice: 4.80, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm', 'dwelling-single'], job: 'farming', pop: 9 },
    jj_farmhouse_b:   { w: 20.0, d: 16.0, h: 9.0,  cornice: 4.60, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm', 'dwelling-single'], job: 'farming', pop: 8 },
    jj_granary:       { w: 24.0, d: 16.0, h: 10.8, cornice: 6.40, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['farm', 'infrastructure'], job: 'milling', pop: 5 },
    jj_windmill:      { w: 18.0, d: 18.0, h: 26.0, cornice: 14.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['farm', 'industry'], job: 'milling', pop: 6 },
    jj_warehouse_a:   { w: 36.0, d: 24.0, h: 12.8, cornice: 7.40, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'warehousing', pop: 10 },
    jj_warehouse_b:   { w: 38.0, d: 24.0, h: 11.4, cornice: 7.00, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'warehousing', pop: 10 },
    jj_wall_seg:      { w: 12.0, d: 5.2,  h: 10.0, cornice: 10.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'infrastructure'], pop: 0 },
    jj_wall_tower:    { w: 10.4, d: 10.4, h: 25.0, cornice: 14.6, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military'], pop: 4 },
    jj_wall_gate:     { w: 24.0, d: 15.0, h: 31.0, cornice: 14.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'infrastructure'], job: 'customs', pop: 14, lit: true },
    jj_wall_corner:   { w: 13.0, d: 13.0, h: 33.0, cornice: 15.4, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military'], pop: 6, lit: true },

    /* Iziz Vernacular kit (kits/iziz-vernacular/src/70..74) — read in place */
    vern_house_poor_a:       { w: 8.0,  d: 10.0, h: 8.0,  cornice: 4.20, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['dwelling-single'], pop: 9 },
    vern_house_poor_b:       { w: 10.0, d: 8.0,  h: 5.0,  cornice: 2.80, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['dwelling-single'], pop: 8 },
    vern_house_poor_c:       { w: 9.0,  d: 10.0, h: 7.0,  cornice: 3.30, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['dwelling-single'], pop: 9 },
    vern_house_mid_a:        { w: 10.0, d: 13.0, h: 11.0, cornice: 6.70, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['dwelling-single'], pop: 15 },
    vern_house_mid_b:        { w: 12.0, d: 11.0, h: 11.0, cornice: 6.65, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['dwelling-multi'],  pop: 19 },
    vern_house_mid_c:        { w: 15.0, d: 14.0, h: 8.0,  cornice: 4.20, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['dwelling-single'], pop: 17 },
    vern_house_rich_a:       { w: 28.0, d: 24.0, h: 16.0, cornice: 8.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'rich',   types: ['dwelling-single'], pop: 28, lit: true },
    vern_house_rich_b:       { w: 26.0, d: 23.0, h: 16.0, cornice: 8.00, kit: 'vern', culture: 'iziz-vernacular', wealth: 'rich',   types: ['dwelling-single'], pop: 26, lit: true },
    vern_shops:              { w: 18.0, d: 12.0, h: 10.0, cornice: 6.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['market', 'shop'],  job: 'trading', pop: 14 },
    vern_tavern:             { w: 22.0, d: 20.0, h: 15.0, cornice: 6.95, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['tavern', 'inn'],   job: 'brewing', pop: 20 },
    vern_workshop_a:         { w: 14.0, d: 12.0, h: 6.0,  cornice: 3.70, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry'],        job: 'carpentry', pop: 12 },
    vern_workshop_b:         { w: 16.0, d: 12.0, h: 7.0,  cornice: 3.50, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry', 'shop'],job: 'pottery', pop: 12 },
    vern_smithy:             { w: 18.0, d: 14.0, h: 12.0, cornice: 4.20, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['industry'],        job: 'smithing', pop: 14 },
    vern_market:             { w: 30.0, d: 22.0, h: 12.0, cornice: 5.50, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['market'],          job: 'trading', pop: 18 },
    vern_warehouse:          { w: 30.0, d: 20.0, h: 11.0, cornice: 6.10, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry'],        job: 'warehousing', pop: 10 },
    vern_bakery:             { w: 19.0, d: 16.0, h: 11.0, cornice: 6.50, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'baking', pop: 14 },
    vern_brewery:            { w: 21.0, d: 17.0, h: 13.0, cornice: 6.80, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry', 'tavern'], job: 'brewing', pop: 16 },
    vern_provisioner:        { w: 16.0, d: 18.0, h: 12.0, cornice: 6.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'trading', pop: 14 },
    vern_weaver:             { w: 15.0, d: 19.0, h: 12.0, cornice: 6.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry', 'shop'], job: 'weaving', pop: 14 },
    vern_tannery:            { w: 21.0, d: 16.0, h: 7.0,  cornice: 3.90, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['industry'],        job: 'tanning', pop: 11 },
    vern_tailor:             { w: 10.0, d: 15.0, h: 12.0, cornice: 6.65, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'weaving', pop: 12 },
    vern_scribe:             { w: 15.0, d: 13.0, h: 12.0, cornice: 6.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'scribing', pop: 12 },
    vern_apothecary:         { w: 17.0, d: 14.0, h: 13.0, cornice: 6.70, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'alchemy', pop: 12 },
    vern_tinker:             { w: 18.0, d: 14.0, h: 10.0, cornice: 4.50, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['industry', 'shop'], job: 'smithing', pop: 12 },
    vern_glassworks:         { w: 20.0, d: 14.0, h: 15.0, cornice: 6.80, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry', 'shop'], job: 'lampmaking', pop: 14 },
    vern_school:             { w: 34.0, d: 30.0, h: 15.0, cornice: 8.40, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic'],           job: 'scribing', pop: 32, lit: true },
    vern_hospital:           { w: 38.0, d: 28.0, h: 16.0, cornice: 8.60, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic'],           job: 'healing',  pop: 36, lit: true },
    vern_barracks:           { w: 48.0, d: 38.0, h: 14.0, cornice: 8.20, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic', 'military'], pop: 110, lit: true },
    vern_alchemist:          { w: 32.0, d: 28.0, h: 19.0, cornice: 8.80, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic', 'industry'], job: 'alchemy', pop: 28, lit: true },
    vern_silos:              { w: 22.0, d: 16.0, h: 13.0, cornice: 8.00, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['farm', 'infrastructure'], job: 'warehousing', pop: 4 },
    vern_tank:               { w: 24.0, d: 16.0, h: 12.0, cornice: 7.50, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['infrastructure'],  pop: 3 },
    vern_generator:          { w: 24.0, d: 18.0, h: 12.0, cornice: 7.20, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['infrastructure', 'civic'], pop: 12, lit: true },
    vern_mine:               { w: 26.0, d: 22.0, h: 11.0, cornice: 5.40, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['industry'],        job: 'mining', pop: 22 },
    vern_quarry:             { w: 28.0, d: 24.0, h: 10.0, cornice: 5.00, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry'],        job: 'quarrying', pop: 18 },
    vern_mill:               { w: 22.0, d: 20.0, h: 12.0, cornice: 6.20, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['industry'],        job: 'milling', pop: 12 },
    vern_fungus_shed:        { w: 22.0, d: 14.0, h: 6.0,  cornice: 3.40, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['farm'],            job: 'fungiculture', pop: 8 },
    vern_farmhouse:          { w: 24.0, d: 20.0, h: 9.0,  cornice: 4.60, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['farm', 'dwelling-single'], job: 'farming', pop: 9 },
    vern_byre:               { w: 22.0, d: 16.0, h: 7.0,  cornice: 3.80, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['farm'],            job: 'herding', pop: 5 },
    vern_pens:               { w: 20.0, d: 16.0, h: 6.0,  cornice: 2.20, kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['farm'],            job: 'herding', pop: 4 },
    vern_farmers_guild:      { w: 30.0, d: 22.0, h: 14.0, cornice: 8.40, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic'],           job: 'farming', pop: 32, lit: true },
    vern_caravanserai:       { w: 36.0, d: 30.0, h: 12.0, cornice: 6.80, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['inn', 'market'],   job: 'trading', pop: 34 },
    vern_forgemasters_hall:  { w: 40.0, d: 32.0, h: 18.0, cornice: 9.20, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic', 'industry'], job: 'smithing', pop: 44, lit: true },
    vern_guard_tower:        { w: 26.0, d: 20.0, h: 19.0, cornice: 11.2, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['military', 'civic'], job: 'customs', pop: 24, lit: true },
    vern_watch_house:        { w: 10.0, d: 9.0,  h: 11.0, cornice: 6.40, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic', 'military'], job: 'customs', pop: 8, lit: true },
    vern_toll_house:         { w: 14.0, d: 10.0, h: 11.0, cornice: 6.40, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['civic', 'infrastructure'], job: 'customs', pop: 10, lit: true },
    vern_mustering_ground:   { w: 44.0, d: 32.0, h: 13.0, cornice: 5.50, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['military', 'civic'], pop: 50, lit: true },

    /* Dilihan site-specific bespoke landmarks & infrastructure (src/82-dl-landmarks.js) */
    dl_gov_palace:         { w: 62.0, d: 76.0, h: 28.0, cornice: 11.2, kit: 'dl', culture: 'iziz-vernacular', wealth: null, types: ['civic', 'dwelling-single'], job: 'customs', pop: 85, lit: true },
    dl_colonia_forum:      { w: 64.0, d: 52.0, h: 9.5,  cornice: 6.80, kit: 'dl', culture: 'jimjam',          wealth: null, types: ['plaza', 'civic', 'market'], job: 'trading', pop: 25, lit: false },
    dl_hykkousoi_legation: { w: 38.0, d: 34.0, h: 13.5, cornice: 7.80, kit: 'dl', culture: 'hykkousoi',       wealth: 'rich', types: ['civic', 'dwelling-single'], job: 'customs', pop: 32, lit: true },
    dl_customs_post:       { w: 30.0, d: 22.0, h: 12.5, cornice: 7.20, kit: 'dl', culture: 'iziz-vernacular', wealth: null, types: ['civic', 'infrastructure'], job: 'customs', pop: 28, lit: true },
    dl_stream_bridge:      { w: 14.0, d: 28.0, h: 6.8,  cornice: 4.50, kit: 'dl', culture: 'jimjam',          wealth: null, types: ['infrastructure'], job: 'masonry', pop: 0 },
    dl_aqueduct_seg:       { w: 18.0, d: 4.4,  h: 9.2,  cornice: 8.60, kit: 'dl', culture: 'jimjam',          wealth: null, types: ['infrastructure'], job: 'masonry', pop: 0 },
    dl_portvisas_portal:   { w: 26.0, d: 18.0, h: 16.5, cornice: 12.0, kit: 'dl', culture: 'iziz-vernacular', wealth: null, types: ['infrastructure', 'military'], job: 'customs', pop: 16, lit: true },
    dl_brickkiln:          { w: 24.0, d: 18.0, h: 13.5, cornice: 6.20, kit: 'dl', culture: 'jimjam',          wealth: 'poor', types: ['industry'], job: 'pottery', pop: 20 },
    dl_skarn_adit:         { w: 18.0, d: 16.0, h: 9.8,  cornice: 5.40, kit: 'dl', culture: 'iziz-vernacular', wealth: 'poor', types: ['industry'], job: 'mining', pop: 24 },
    dl_evaporite_pan:      { w: 36.0, d: 28.0, h: 3.4,  cornice: 1.60, kit: 'dl', culture: 'jimjam',          wealth: 'poor', types: ['industry'], job: 'salt', pop: 18 },
    dl_crop_plot:          { w: 28.0, d: 22.0, h: 2.2,  cornice: 1.20, kit: 'dl', culture: 'jimjam',          wealth: 'poor', types: ['farm'], job: 'farming', pop: 0 }
  };

  function dimsOf(key) {
    var d = DIMS[key];
    return d ? { key: key, w: d.w, d: d.d, h: d.h, fw: d.w, fd: d.d } : null;
  }

  /* ---- 3. Register Dilihan veteran handu & salt-works culture rows on KHAMLET ---- */
  if (typeof KHAMLET !== 'undefined' && KHAMLET.CULTURES) {
    KHAMLET.CULTURES['dilihan-handu'] = {
      kit: 'iziz', household: 15.0, workShare: 0.45, slopeMax: 0.24,
      religious: 'jj_shop_spice', civic: 'vern_watch_house', general: 'vern_shops',
      food: 'vern_provisioner', warehouse: 'jj_granary',
      services: { religious: 1, civic: 2, general: 2, food: 2, warehouse: 2 },
      houses: {
        poor: [['vern_house_poor_c', 1, 3], ['vern_house_poor_a', 1, 2], ['jj_house_poor_a', 1, 2]],
        middling: [['vern_house_mid_a', 2, 2], ['vern_house_mid_c', 2, 2], ['jj_house_mid_a', 2, 1]],
        head: [['jj_house_rich_a', 1, 1]],
        middlingShare: 0.40
      },
      works: {
        farming: [{ key: 'jj_farmhouse_a', jobs: 14, share: 0.45 }, { key: 'vern_farmhouse', jobs: 14, share: 0.35 },
                  { key: 'jj_granary', jobs: 10, share: 0.12 }, { key: 'jj_windmill', jobs: 10, share: 0.08 }],
        clay:    [{ key: 'dl_brickkiln', jobs: 18, share: 0.65 }, { key: 'vern_workshop_b', jobs: 12, share: 0.35 }],
        mine:    [{ key: 'dl_skarn_adit', jobs: 20, share: 0.60 }, { key: 'vern_mine', jobs: 18, share: 0.40 }],
        salt:    [{ key: 'dl_evaporite_pan', jobs: 20, share: 0.70 }, { key: 'jj_warehouse_a', jobs: 12, share: 0.30 }]
      },
      focusJobs: { farming: 68, clay: 36, mine: 44, salt: 48 },
      reach: { farming: 460, clay: 340, mine: 380, salt: 420 },
      pending: {}
    };
  }

  /* ---- 4. Exact OBB non-overlap & ground-pad seating helpers ---- */
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
    if (rec.key === 'dl_stream_bridge') {
      return r2(G.shapedNoStream(rec.x, rec.z) + 0.35);
    }
    var pts = cornersOf(rec, 0);
    var hi = G.h(rec.x, rec.z), lo = hi;
    for (var i = 0; i < pts.length; i++) {
      var hy = G.h(pts[i][0], pts[i][1]);
      if (hy > hi) hi = hy;
      if (hy < lo) lo = hy;
    }
    /* Seat at center-weighted upper pad; sloped granite/marble plinth fills cleanly down to lo */
    var cy = G.h(rec.x, rec.z);
    return r2(Math.min(hi, cy + (hi - cy) * 0.65));
  }

  function polyAreaKm2(poly) {
    var s = 0;
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(s) * 0.5 / 1e6;
  }

  /* ---- 5. Deterministic CROPS query for the Cut bench, mid-wall terraces & salt-pan fringe (PLAN.md §1.4) ---- */
  function queryCutCrops() {
    if (typeof CROPS === 'undefined') {
      return {
        totalBiome: 169,
        benchRainfed: ['rice', 'bamboo-rice', 'taro', 'measuremelon', 'hyperbamboo', 'cotton', 'indigo'],
        wallTerrace: ['emmer', 'whorl-olive', 'helix-bean', 'canyon-grape'],
        saltFringe: ['ashmillet', 'glasswort', 'rankgrass'],
        canPlaid: true,
        colours: ['red', 'orange', 'yellow', 'blue', 'purple', 'brown', 'black']
      };
    }
    var allCut = CROPS.forBiome('cut', { works: ['dark-beds'] });
    var bench = CROPS.at({ warmth: 'tropic', atm: 'dense', arid: 'humid' }, { works: ['dark-beds'] });
    var wall = CROPS.at({ warmth: 'subtropic', atm: 'standard', arid: 'subhumid' });
    var salt = CROPS.at({ warmth: 'hot', atm: 'dense', arid: 'arid', salt: true });
    var pal = CROPS.palette('cut', { grow: true });
    var pickIds = function (res, want) {
      var have = {};
      for (var i = 0; i < res.length; i++) have[res[i].crop.id] = true;
      var out = want.filter(function (k) { return !!have[k]; });
      for (var j = 0; j < res.length && out.length < want.length; j++) {
        if (out.indexOf(res[j].crop.id) < 0) out.push(res[j].crop.id);
      }
      return out;
    };
    return {
      totalBiome: allCut.length,
      benchCount: bench.length,
      wallCount: wall.length,
      saltCount: salt.length,
      benchRainfed: pickIds(bench, ['rice', 'bamboo-rice', 'taro', 'measuremelon', 'sugar-cane', 'cotton', 'indigo', 'alecap']),
      wallTerrace: pickIds(wall, ['emmer', 'whorl-olive', 'helix-bean', 'canyon-grape', 'fig']),
      saltFringe: pickIds(salt, ['ashmillet', 'glasswort', 'rankgrass', 'wadi-date']),
      canPlaid: !!CROPS.canPlaid('cut', { grow: true }),
      colours: pal.colours || []
    };
  }

  /* ---- 6. Build Complete 5-Zone Dilihan Settlement & Hinterland Plan ---- */
  function make() {
    var structures = [];
    var walls = [];
    var ways = [];
    var zones = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    var space = KSPACE.create({ cell: 28 });

    var COLONIA_POLY = [[-250, -310], [250, -310], [250, 190], [-250, 190]];  /* 500 x 500 m = 0.250 km2 */
    var VERN_POLYS = [
      [[262, -310], [762, -310], [762, 490], [262, 490]],     /* East & Muster: 500 x 800 m = 0.400 km2 */
      [[-250, 202], [250, 202], [250, 652], [-250, 652]],     /* South & Foundry: 500 x 450 m = 0.225 km2 */
      [[-240, -560], [510, -560], [510, -326], [-240, -326]], /* North Caravanserai: 750 x 234 m = 0.1755 km2 */
      [[262, 490], [762, 490], [762, 889], [262, 889]]        /* SE Pass Approach: 500 x 399 m = 0.1995 km2 -> sum = 1.000 km2 */
    ];

    /* Sightline corridor from jj_temple_sun (-182, -72) along Az 245.39 deg: keep 100% clear of buildings & high walls */
    var TEMPLE_X = -182.0, TEMPLE_Z = -72.0, TEMPLE_RY = SOL.ry;
    var SIGHT_DX = Math.sin(TEMPLE_RY), SIGHT_DZ = Math.cos(TEMPLE_RY);  /* (-0.9092, +0.4165) */

    function inSolsticeCorridor(x, z, r) {
      var rx = x - TEMPLE_X, rz = z - TEMPLE_Z;
      var along = rx * SIGHT_DX + rz * SIGHT_DZ;
      if (along < 32 || along > 420) return false;
      var perp = Math.abs(-rx * SIGHT_DZ + rz * SIGHT_DX);
      return perp < (18 + (r == null ? 0 : r));
    }

    function makeRecord(id, zone, key, x, z, ry, extra) {
      var D = DIMS[key];
      if (!D) throw new Error('DL_LAYOUT: unknown building key ' + key);
      var sc = extra && extra.scale != null ? extra.scale : (D.scale == null ? 1 : D.scale);
      var w = r2(D.w * sc), d = r2(D.d * sc), h = r2(D.h * sc);
      var rec = {
        id: id,
        zone: zone,
        key: key,
        kit: D.kit,
        cls: extra && extra.cls ? extra.cls : 'building',
        culture: extra && extra.culture ? extra.culture : D.culture,
        wealth: extra && extra.wealth !== undefined ? extra.wealth : D.wealth,
        types: (extra && extra.types ? extra.types : D.types).slice(),
        job: extra && extra.job !== undefined ? extra.job : (D.job || null),
        lit: extra && extra.lit !== undefined ? !!extra.lit : !!D.lit,
        x: r2(x),
        z: r2(z),
        y: 0,
        ry: r4(ry),
        w: w,
        d: d,
        h: h,
        scale: r4(sc),
        corniceH: r2(D.cornice * sc),
        area: r2(w * d),
        pop: extra && extra.pop != null ? extra.pop : D.pop,
        v: extra && extra.v != null ? extra.v : (KRAND.hash(WORLD_SEED, id) % 3),
        district: extra && extra.district ? extra.district : ('zone' + zone),
        name: extra && extra.name ? extra.name : null,
        landmark: !!(extra && extra.landmark),
        construct: extra && extra.construct ? extra.construct : null,
        source: extra && extra.source ? extra.source : null
      };
      rec.y = padElevation(rec);
      return rec;
    }

    function canStand(rec, gap) {
      var g = gap == null ? 1.2 : gap;
      var rad = Math.hypot(rec.w, rec.d) * 0.5 + g + 34;
      return !space.some(rec.x, rec.z, rad, function (other) {
        return boxesOverlap(rec, other, g);
      });
    }

    function commitStruct(rec, gap) {
      if (!canStand(rec, gap)) return null;
      space.insert(rec, rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.5);
      structures.push(rec);
      if (zones[rec.zone]) zones[rec.zone].push(rec);
      return rec;
    }

    /* ================================================================
     * A. HIGHWAYS, STREETS & AQUEDUCT WAYS
     * ================================================================ */
    ways.push(
      /* Major pass & regional highways (net51.json) */
      { id: 'hwy.north.jimjam', cls: 'highway', w: 10, pts: [[0, -2350], [0, -1450], [0, -680], [0, -310]] },
      { id: 'hwy.south.league', cls: 'highway', w: 9,  pts: [[-410, -40], [-410, 380], [-340, 880], [-220, 1750], [-120, 2350]] },
      { id: 'hwy.se.portvisas', cls: 'highway', w: 9,  pts: [[256, 200], [520, 420], [860, 680], [1380, 1080], [2100, 1650]] },
      { id: 'road.ramp.lowertown', cls: 'main', w: 8,  pts: [[-410, 235], [-295, 240], [-195, 240], [0, 198]] },
      { id: 'road.lowertown.north', cls: 'main', w: 8, pts: [[-410, -40], [-410, -340], [-180, -445], [0, -445]] },

      /* Colonia orthogonal cardo & decumanus */
      { id: 'colonia.cardo',     cls: 'avenue', w: 11, pts: [[0, -308], [0, 188]] },
      { id: 'colonia.decumanus', cls: 'avenue', w: 11, pts: [[-244, -60], [248, -60]] },
      { id: 'colonia.north.st',  cls: 'side',   w: 6.5, pts: [[-238, -178], [238, -178]] },
      { id: 'colonia.south.st',  cls: 'side',   w: 6.5, pts: [[-238, 66], [238, 66]] },
      { id: 'colonia.west.st',   cls: 'side',   w: 6.5, pts: [[-116, -296], [-116, 178]] },
      { id: 'colonia.east.st',   cls: 'side',   w: 6.5, pts: [[116, -296], [116, 178]] },

      /* The Wall Streets (boundary avenues between Colonia & Vernacular Districts) */
      { id: 'wallstreet.east',   cls: 'avenue', w: 13, pts: [[256, -320], [256, 490]] },
      { id: 'wallstreet.south',  cls: 'avenue', w: 13, pts: [[-250, 196], [256, 196]] },
      { id: 'wallstreet.north',  cls: 'avenue', w: 12, pts: [[-245, -318], [390, -318]] },

      /* Vernacular District main streets */
      { id: 'vern.east.main1',   cls: 'main',   w: 9,  pts: [[256, -60], [745, -60]] },
      { id: 'vern.east.main2',   cls: 'main',   w: 8,  pts: [[256, 110], [745, 110]] },
      { id: 'vern.east.main3',   cls: 'main',   w: 8,  pts: [[256, -200], [720, -200]] },
      { id: 'vern.east.cross1',  cls: 'main',   w: 8,  pts: [[415, -305], [415, 465]] },
      { id: 'vern.east.cross2',  cls: 'main',   w: 8,  pts: [[585, -305], [585, 465]] },
      { id: 'vern.south.cardo',  cls: 'avenue', w: 10, pts: [[0, 196], [0, 645]] },
      { id: 'vern.south.main1',  cls: 'main',   w: 8,  pts: [[-240, 345], [240, 345]] },
      { id: 'vern.south.main2',  cls: 'main',   w: 8,  pts: [[-240, 495], [240, 495]] },
      { id: 'vern.north.serai',  cls: 'main',   w: 9,  pts: [[-210, -445], [375, -445]] },

      /* Hinterland farm, brickyard & skarn lanes */
      { id: 'lane.handu.west',   cls: 'lane',   w: 6,  pts: [[-410, -340], [-820, -620], [-840, -1040], [-1080, -1480]] },
      { id: 'lane.handu.east',   cls: 'lane',   w: 6,  pts: [[375, -445], [880, -540], [1140, -1080]] },
      { id: 'lane.handu.apron',  cls: 'lane',   w: 6,  pts: [[-840, -1040], [-220, -860], [260, -860], [340, -1320], [-180, -1340]] }
    );

    /* ================================================================
     * B. ZONE 1: GATED JIMJAM BRICK-AND-MARBLE CIRCUIT WALL & LANDMARKS
     * ================================================================ */
    /* Place the 4 circuit gates & 4 corner bastions on the 500 x 500 m Colonia perimeter */
    var gateSpecs = [
      { id: 'dl.wall.gate.north', x: 0,    z: -310, ry: Math.PI,      name: 'Jimjam Highway Gate' },
      { id: 'dl.wall.gate.east',  x: 250,  z: -60,  ry: Math.PI / 2,  name: 'East Wall-Street Gate' },
      { id: 'dl.wall.gate.south', x: 0,    z: 190,  ry: 0,            name: 'South Pass & Praetorium Gate' },
      { id: 'dl.wall.gate.west',  x: -250, z: 66,   ry: -Math.PI / 2, name: 'West Scarp Postern Gate' }
    ];
    var cornerSpecs = [
      { id: 'dl.wall.corner.nw', x: -250, z: -310, ry: Math.PI },
      { id: 'dl.wall.corner.ne', x: 250,  z: -310, ry: Math.PI / 2 },
      { id: 'dl.wall.corner.se', x: 250,  z: 190,  ry: 0 },
      { id: 'dl.wall.corner.sw', x: -250, z: 190,  ry: -Math.PI / 2 }
    ];
    for (var gi = 0; gi < gateSpecs.length; gi++) {
      var gs = gateSpecs[gi];
      var gr = makeRecord(gs.id, 1, 'jj_wall_gate', gs.x, gs.z, gs.ry, { name: gs.name, landmark: true, district: 'colonia-wall' });
      walls.push(gr);
      space.insert(gr, gr.x, gr.z, Math.hypot(gr.w, gr.d) * 0.5);
    }
    for (var ci = 0; ci < cornerSpecs.length; ci++) {
      var cs = cornerSpecs[ci];
      var cr = makeRecord(cs.id, 1, 'jj_wall_corner', cs.x, cs.z, cs.ry, { district: 'colonia-wall' });
      walls.push(cr);
      space.insert(cr, cr.x, cr.z, Math.hypot(cr.w, cr.d) * 0.5);
    }

    /* Lay 12 m jj_wall_seg runs + periodic jj_wall_tower drums around all 4 sides, leaving open the solstice sightline gap on W rim */
    function addWallRun(x0, z0, x1, z1, outRy, prefix) {
      var dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
      var ux = dx / L, uz = dz / L;
      var nSeg = Math.floor(L / 12);
      for (var k = 0; k < nSeg; k++) {
        var s = (k + 0.5) * 12;
        var sx = x0 + ux * s, sz = z0 + uz * s;
        /* Skip gates & corners */
        var nearGate = false;
        for (var q = 0; q < walls.length; q++) {
          if (Math.hypot(sx - walls[q].x, sz - walls[q].z) < 15.5) { nearGate = true; break; }
        }
        if (nearGate) continue;
        /* Keep West Rim open across the Solstice Temple sunset terrace (z = -95..-28) & NW Amphitheater scarp (z = -280..-195),
           and open East Wall-Street promenade (z = -28..+160) where paired Jimjam & Vernacular facades face each other */
        if (prefix === 'west' && ((sz > -102 && sz < -24) || (sz > -282 && sz < -194))) continue;
        if (prefix === 'north' && sx < -126 && sx > -216) continue;
        if (prefix === 'east' && sz > -28 && sz < 160) continue;
        var wrec = makeRecord('dl.wall.' + prefix + '.' + k, 1, 'jj_wall_seg', sx, sz, outRy, { district: 'colonia-wall' });
        walls.push(wrec);
        if (k > 1 && k < nSeg - 2 && k % 10 === 0) {
          var tx = x0 + ux * (k * 12), tz = z0 + uz * (k * 12);
          if (!inSolsticeCorridor(tx, tz, 10) && !(prefix === 'east' && tz > -32 && tz < 164)) {
            var trec = makeRecord('dl.wall.twr.' + prefix + '.' + k, 1, 'jj_wall_tower', tx, tz, outRy, { district: 'colonia-wall' });
            walls.push(trec);
          }
        }
      }
    }
    addWallRun(-250, -310, 250, -310, Math.PI, 'north');
    addWallRun(250, -310, 250, 190, Math.PI / 2, 'east');
    addWallRun(250, 190, -250, 190, 0, 'south');
    addWallRun(-250, 190, -250, -310, -Math.PI / 2, 'west');

    /* Reserve circuit wall band in space so lots stay >= 4 m inside/outside the rampart */
    for (var wi = 0; wi < walls.length; wi++) {
      if (walls[wi].key === 'jj_wall_seg' || walls[wi].key === 'jj_wall_tower') {
        space.insert(walls[wi], walls[wi].x, walls[wi].z, Math.hypot(walls[wi].w, walls[wi].d) * 0.5);
      }
    }

    /* Place Zone 1 Colonia Civic & Sacred Landmarks */
    var forumRec = commitStruct(makeRecord('dl.colonia.forum', 1, 'dl_colonia_forum', 0, -60, 0, {
      name: 'Raised Contact-Marble Forum of the Colonia', landmark: true, district: 'colonia'
    }), 2.0);
    var templeRec = commitStruct(makeRecord('dl.colonia.temple_sun', 1, 'jj_temple_sun', TEMPLE_X, TEMPLE_Z, TEMPLE_RY, {
      name: 'Re-Aimed Solstice Temple of Dilihan (-31.50 deg S)', landmark: true, district: 'colonia', v: 0
    }), 2.0);
    commitStruct(makeRecord('dl.colonia.amphitheater', 1, 'jj_amphitheater', -168, -238, Math.PI, {
      name: 'NW Scarp-Cut Legionary Amphitheater', landmark: true, district: 'colonia'
    }), 2.0);
    commitStruct(makeRecord('dl.colonia.fortress', 1, 'jj_fortress', 175, -232, Math.PI, {
      name: 'First Colonia Brick Praetorian Fortress', landmark: true, district: 'colonia'
    }), 2.0);
    commitStruct(makeRecord('dl.colonia.barracks', 1, 'jj_barracks', 176, -122, -Math.PI / 2, {
      name: 'Old Quarter Cohort Barracks', landmark: true, district: 'colonia'
    }), 2.0);
    commitStruct(makeRecord('dl.colonia.library', 1, 'jj_library', 68, -118, 0, {
      name: 'Jamtokku Count & Colonial Roll Library', landmark: true, district: 'colonia'
    }), 2.0);
    commitStruct(makeRecord('dl.colonia.school', 1, 'jj_school', 68, 4, Math.PI, {
      name: 'Colonial Rhetoric & Almanac School', landmark: true, district: 'colonia'
    }), 2.0);

    /* ================================================================
     * C. THE WALL STREET PAIRED FACADES (<= 0.5 m cornice match via o.scale)
     * ================================================================ */
    /* Paired rows facing each other across East Wall Street (x=256) and South Wall Street (z=196).
       Jimjam inner row stands along the west side of the avenue; Vernacular outer row faces it across the street. */
    var wallStreetPairs = [];
    var eastPairDefs = [
      { z: -250, jj: 'jj_house_mid_a',   jjScale: 0.90, vn: 'vern_house_mid_a', jjX: 226, vnX: 284 },  /* 7.46*0.90 = 6.71 vs 6.70 (0.01 m) */
      { z: -210, jj: 'jj_shop_general',  jjScale: 0.88, vn: 'vern_shops',       jjX: 226, vnX: 284 },  /* 7.55*0.88 = 6.64 vs 6.60 (0.04 m) */
      { z: -165, jj: 'jj_house_mid_c',   jjScale: 0.63, vn: 'vern_house_mid_b', jjX: 226, vnX: 284 },  /* 10.65*0.63 = 6.71 vs 6.65 (0.06 m) */
      { z: -8,   jj: 'jj_house_rich_a',  jjScale: 0.87, vn: 'vern_house_rich_a',jjX: 236, vnX: 278 },  /* 9.90*0.87 = 8.61 vs 8.60 (0.01 m) */
      { z: 42,   jj: 'jj_shop_textiles', jjScale: 0.89, vn: 'vern_weaver',      jjX: 242, vnX: 274 },  /* 7.50*0.89 = 6.68 vs 6.60 (0.08 m) */
      { z: 96,   jj: 'jj_house_rich_b',  jjScale: 0.84, vn: 'vern_house_rich_b',jjX: 236, vnX: 278 },  /* 9.60*0.84 = 8.06 vs 8.00 (0.06 m) */
      { z: 145,  jj: 'jj_tavern',        jjScale: 0.83, vn: 'vern_tavern',      jjX: 238, vnX: 276 }   /* 8.40*0.83 = 6.97 vs 6.95 (0.02 m) */
    ];
    for (var epi = 0; epi < eastPairDefs.length; epi++) {
      var ep = eastPairDefs[epi];
      var jjRec = commitStruct(makeRecord('dl.ws.east.jj.' + epi, 1, ep.jj, ep.jjX, ep.z, Math.PI / 2, {
        scale: ep.jjScale, district: 'colonia', wallStreet: true
      }), 1.2);
      var vnRec = commitStruct(makeRecord('dl.ws.east.vn.' + epi, 3, ep.vn, ep.vnX, ep.z, -Math.PI / 2, {
        district: 'vernacular-east', wallStreet: true
      }), 1.2);
      if (jjRec && vnRec) {
        wallStreetPairs.push({
          id: 'ws.east.' + epi,
          jjId: jjRec.id, jjKey: jjRec.key, jjScale: jjRec.scale, jjCornice: jjRec.corniceH,
          vnId: vnRec.id, vnKey: vnRec.key, vnCornice: vnRec.corniceH,
          delta: r2(Math.abs(jjRec.corniceH - vnRec.corniceH))
        });
      }
    }
    var southPairDefs = [
      { x: -185, jj: 'jj_house_mid_a',  jjScale: 0.90, vn: 'vern_house_mid_a' },
      { x: -140, jj: 'jj_shop_food',    jjScale: 0.95, vn: 'vern_bakery'      },   /* 6.90*0.95 = 6.56 vs 6.50 (0.06 m) */
      { x: -92,  jj: 'jj_house_mid_c',  jjScale: 0.63, vn: 'vern_house_mid_b' },
      { x: -42,  jj: 'jj_shop_spice',   jjScale: 1.00, vn: 'vern_provisioner' },   /* 6.60*1.00 = 6.60 vs 6.60 (0.00 m) */
      { x: 52,   jj: 'jj_house_rich_a', jjScale: 0.87, vn: 'vern_house_rich_a'},
      { x: 112,  jj: 'jj_shop_alchemy', jjScale: 0.90, vn: 'vern_apothecary'  }    /* 7.40*0.90 = 6.66 vs 6.70 (0.04 m) */
    ];
    for (var spi = 0; spi < southPairDefs.length; spi++) {
      var sp = southPairDefs[spi];
      var sjj = commitStruct(makeRecord('dl.ws.south.jj.' + spi, 1, sp.jj, sp.x, 166, 0, {
        scale: sp.jjScale, district: 'colonia', wallStreet: true
      }), 1.2);
      var svn = commitStruct(makeRecord('dl.ws.south.vn.' + spi, 3, sp.vn, sp.x, 224, Math.PI, {
        district: 'vernacular-south', wallStreet: true
      }), 1.2);
      if (sjj && svn) {
        wallStreetPairs.push({
          id: 'ws.south.' + spi,
          jjId: sjj.id, jjKey: sjj.key, jjScale: sjj.scale, jjCornice: sjj.corniceH,
          vnId: svn.id, vnKey: svn.key, vnCornice: svn.corniceH,
          delta: r2(Math.abs(sjj.corniceH - svn.corniceH))
        });
      }
    }

    /* ================================================================
     * D. ZONE 1 COLONIA KCITY INFILL (frontage-courts strategy, jimjam: 1.0)
     * ================================================================ */
    var coloniaBlocks = [
      { id: 'col.nw', i: 0, j: 0, kind: 'middle', wealth: 0.62, poly: [[-108, -292], [-12, -292], [-12, -186], [-108, -186]] },
      { id: 'col.nc', i: 1, j: 0, kind: 'rich',   wealth: 0.84, poly: [[12, -292], [108, -292], [108, -186], [12, -186]] },
      { id: 'col.cw', i: 0, j: 1, kind: 'rich',   wealth: 0.86, poly: [[-108, -168], [-40, -168], [-40, -96], [-108, -96]] },
      { id: 'col.sw1',i: 0, j: 2, kind: 'middle', wealth: 0.60, poly: [[-232, -32], [-124, -32], [-124, 58], [-232, 58]] },
      { id: 'col.scw',i: 1, j: 2, kind: 'rich',   wealth: 0.82, poly: [[-108, -24], [-40, -24], [-40, 58], [-108, 58]] },
      { id: 'col.sw2',i: 0, j: 3, kind: 'middle', wealth: 0.56, poly: [[-232, 74], [-124, 74], [-124, 150], [-232, 150]] },
      { id: 'col.scs',i: 1, j: 3, kind: 'middle', wealth: 0.64, poly: [[-108, 74], [-12, 74], [-12, 148], [-108, 148]] },
      { id: 'col.ses',i: 2, j: 3, kind: 'rich',   wealth: 0.80, poly: [[12, 74], [108, 74], [108, 148], [12, 148]] },
      { id: 'col.see',i: 3, j: 3, kind: 'middle', wealth: 0.65, poly: [[124, 74], [208, 74], [208, 168], [124, 168]] },
      { id: 'col.ce', i: 3, j: 2, kind: 'middle', wealth: 0.68, poly: [[124, -44], [208, -44], [208, 58], [124, 58]] }
    ];
    var COL_POOLS = {
      rich:   [['jj_house_rich_a', 2], ['jj_house_rich_b', 1], ['jj_house_mid_c', 4], ['jj_inn', 1]],
      middle: [['jj_house_mid_a', 5], ['jj_house_mid_c', 4], ['jj_shop_general', 2],
               ['jj_shop_food', 2], ['jj_shop_weapons', 1], ['jj_tavern', 1], ['jj_inn', 1]]
    };
    var COL_SMALL = {
      rich:   [['jj_house_mid_a', 2], ['jj_shop_spice', 1]],
      middle: [['jj_house_poor_a', 2], ['jj_house_poor_c', 2], ['jj_shop_spice', 1]]
    };

    var colTune = {
      cell: 2.5, rasterHalf: 400, maxSlope: 0.22, exact: true,
      width: { avenue: 11, main: 8, side: 6.5, alley: 3.5, highway: 10, lane: 5 },
      lot: { side: 1.8, setback: 1.8, rear: 3.0, inset: 1.0, step: 3.0 },
      classes: { middle: [['jj_house_mid_a', 0]], poor: [['jj_house_poor_a', 0]] },
      fallback: { middle: 'poor', poor: null }
    };
    var colCity = KCITY.create({
      name: 'dilihan-colonia',
      tune: colTune,
      seed: 7446631,
      rand: 'krand',
      index: { order: 'insertion' },
      ground: { h: G.shapedNoStream },
      kit: {
        dims: function (k, v) {
          var d = dimsOf(k);
          return d ? { key: k, v: v | 0, w: d.w + 2.0, d: d.d + 2.0, h: d.h, fw: d.w, fd: d.d } : null;
        }
      },
      steps: [
        {
          name: 'colonia site raster',
          run: function () {
            var L = KCITY.lib, SL = L.SL, P = L.plan();
            var R = SL.R = new L.Raster(colTune.rasterHalf, colTune.cell);
            R.occ.fill(L.OCC.OUT);
            KCITY.site.zoneRaster(R, COLONIA_POLY, { dry: -950, maxSlope: colTune.maxSlope, h: G.shapedNoStream });
            P.zone = COLONIA_POLY;
            P.site = [{ id: 0, name: 'Colonia', role: 'colonia', poly: COLONIA_POLY }];
            SL.minSpacing = 6.5;
          }
        },
        {
          name: 'colonia streets',
          run: function () {
            var L = KCITY.lib, SL = L.SL;
            for (var i = 0; i < ways.length; i++) {
              if (ways[i].id.indexOf('colonia.') === 0) {
                SL.addWay(ways[i].cls, ways[i].pts, 3, { tag: ways[i].id });
              }
            }
          }
        },
        {
          name: 'colonia frontage-courts infill',
          run: function () {
            var P = KCITY.lib.plan();
            P.courts = KCITY.strategies['frontage-courts'].run(coloniaBlocks, {
              step: 9, seed: 7446631, focus: [0, -60], sides: 4,
              pools: COL_POOLS, small: COL_SMALL,
              gaps: { rich: [13, 19], middle: [10, 15] },
              garden: { rich: 0.36, middle: 0.30 },
              infill: { step: 24, yard: 0.72, yardR: 13, reach: 18 }
            });
          }
        }
      ]
    });
    var colPlan = colCity.run();
    if (colPlan && colPlan.courts) {
      for (var cli = 0; cli < colPlan.courts.lots.length; cli++) {
        if ((cli % 2) === 1) continue;
        var cl = colPlan.courts.lots[cli];
        if (cl.died != null || !DIMS[cl.key]) continue;
        if (inSolsticeCorridor(cl.x, cl.z, Math.max(cl.w, cl.d) * 0.5)) continue;
        commitStruct(makeRecord('dl.col.lot.' + cl.id, 1, cl.key, cl.x, cl.z, cl.ry, {
          district: 'colonia'
        }), 1.4);
      }
    }

    /* ================================================================
     * E. ZONE 2: GOVERNOR'S PRECINCT & IZANI QUARTER (-878 m join)
     * ================================================================ */
    /* Walled 70 x 56 m Governor's Palace (dl_gov_palace, local +z front facing North onto Palace Forecourt Way at z=235) */
    var palaceRec = commitStruct(makeRecord('dl.palace.govpalace', 2, 'dl_gov_palace', 260, 294, Math.PI, {
      name: 'Governor Palace of Dilihan (Sid-kin Praetorium)', landmark: true, district: 'governor-precinct'
    }), 2.5);
    commitStruct(makeRecord('dl.palace.guard_tower', 2, 'vern_guard_tower', 194, 240, Math.PI, {
      name: 'Praetorium Izani Guard Tower', landmark: true, district: 'governor-precinct'
    }), 2.0);
    commitStruct(makeRecord('dl.palace.barracks', 2, 'vern_barracks', 332, 248, Math.PI, {
      name: 'Praetorium Garrison Barracks', landmark: true, district: 'governor-precinct'
    }), 2.0);
    commitStruct(makeRecord('dl.palace.council_hall', 2, 'vern_farmers_guild', 194, 344, Math.PI / 2, {
      name: 'Veterans Council Hall (Izani Quarter)', landmark: true, district: 'governor-precinct'
    }), 2.0);
    commitStruct(makeRecord('dl.palace.assay_hall', 2, 'vern_forgemasters_hall', 332, 344, -Math.PI / 2, {
      name: 'Quiet-Copy & Skarn Bronze Assay Guildhall', landmark: true, district: 'governor-precinct'
    }), 2.0);
    commitStruct(makeRecord('dl.palace.hospital', 2, 'vern_hospital', 260, 368, Math.PI, {
      name: 'Legionary Infirmary', district: 'governor-precinct'
    }), 2.0);

    /* ================================================================
     * F. ZONE 3: VERNACULAR DISTRICTS (1.000 km2 = 4.0x Colonia; KCITY alleys + main streets; 90% IZV / 10% JJ)
     * ================================================================ */
    /* Anchor North Caravanserai, Highway Gate, Eastern Muster Ground, Foundries & Quiet-Copy Workshops first */
    var seraiRec = commitStruct(makeRecord('dl.vern.north_caravanserai', 3, 'jj_caravanserai', 66, -402, 0, {
      name: 'North Highway Jimjam Caravanserai', landmark: true, district: 'vernacular-north'
    }), 2.5);
    commitStruct(makeRecord('dl.vern.north_hwy_gate', 3, 'jj_wall_gate', 0, -552, Math.PI, {
      name: 'Outer Cut Highway Toll-Gate (izani.north.dilihan)', landmark: true, district: 'vernacular-north'
    }), 2.0);
    var musterRec = commitStruct(makeRecord('dl.vern.muster_ground', 3, 'vern_mustering_ground', 540, -14, -Math.PI / 2, {
      name: 'Eastern Terrace Legionary & Militia Muster Ground', landmark: true, district: 'vernacular-east'
    }), 2.5);

    /* Bronze/Tin Skarn Foundries & Quiet-Copy Republican-Goods Workshops (linked via source to NE skarn nodes) */
    var foundrySpecs = [
      { id: 'dl.vern.foundry.1', key: 'vern_forgemasters_hall', x: 345, z: -115, ry: 0,           src: 'dl.ore.tin.1',  name: 'Cut Bronze & Cassiterite Great Foundry' },
      { id: 'dl.vern.foundry.2', key: 'vern_smithy',            x: 392, z: -115, ry: 0,           src: 'dl.ore.iron.1', name: 'Magnetite Skarn Forge' },
      { id: 'dl.vern.qcopy.1',   key: 'vern_alchemist',         x: 345, z: 55,   ry: Math.PI,     src: 'dl.ore.tin.1',  name: 'Quiet-Copy Precision Works (Lipp Patterns)' },
      { id: 'dl.vern.qcopy.2',   key: 'vern_glassworks',        x: 392, z: 55,   ry: Math.PI,     src: 'dl.ore.iron.1', name: 'Quiet-Copy Optics & Instrument Glassworks' },
      { id: 'dl.vern.qcopy.3',   key: 'vern_tinker',            x: 448, z: 55,   ry: Math.PI,     src: 'dl.ore.iron.2', name: 'Quiet-Copy Lock & Machine Shop' },
      { id: 'dl.vern.market.e',  key: 'vern_market',            x: 492, z: -108, ry: 0,           src: null,            name: 'East Terrace Covered Market' },
      { id: 'dl.vern.market.s',  key: 'vern_market',            x: -55, z: 304,  ry: 0,           src: null,            name: 'South Pass Provision Market' },
      { id: 'dl.vern.gen.1',     key: 'vern_generator',         x: 455, z: -115, ry: 0,           src: null,            name: 'District Municipal Dynamo House' }
    ];
    for (var fi = 0; fi < foundrySpecs.length; fi++) {
      var fs = foundrySpecs[fi];
      commitStruct(makeRecord(fs.id, 3, fs.key, fs.x, fs.z, fs.ry, {
        name: fs.name, landmark: fi < 3, district: fs.z > 195 ? 'vernacular-south' : 'vernacular-east', source: fs.src
      }), 1.8);
    }

    /* Run KCITY alleys + main-street builder across Zone 3 Vernacular Districts (90% IZV, 10% Jimjam merchant mix) */
    var vernTune = {
      cell: 4.0, rasterHalf: 800, maxSlope: 0.24, exact: true,
      width: { avenue: 12, main: 8.5, side: 6.0, alley: 3.8, highway: 9.5, lane: 5.0 },
      lot: { side: 1.5, setback: 1.5, rear: 2.6, inset: 0.8, step: 3.5 },
      classes: {
        manor:      [['vern_house_rich_a', 0], ['vern_house_rich_b', 0], ['jj_house_rich_b', 0]],
        rich:       [['vern_house_rich_a', 0], ['vern_house_rich_b', 1], ['vern_house_mid_c', 0]],
        middle:     [['vern_house_mid_a', 0], ['vern_house_mid_b', 0], ['vern_house_mid_c', 0], ['vern_house_mid_a', 1],
                     ['vern_house_mid_b', 1], ['vern_bakery', 0], ['vern_weaver', 0], ['vern_tailor', 0],
                     ['vern_scribe', 0], ['jj_house_mid_a', 0]],
        poor:       [['vern_house_poor_a', 0], ['vern_house_poor_b', 0], ['vern_house_poor_c', 0], ['vern_house_poor_c', 1]],
        shop:       [['vern_shops', 0], ['vern_provisioner', 0], ['vern_apothecary', 0], ['vern_bakery', 1], ['jj_shop_general', 0]],
        tavern:     [['vern_tavern', 0], ['vern_brewery', 0], ['vern_caravanserai', 0]],
        industrial: [['vern_workshop_a', 0], ['vern_workshop_b', 0], ['vern_smithy', 0], ['vern_warehouse', 0],
                     ['vern_tannery', 0], ['vern_tinker', 0], ['jj_warehouse_a', 0]]
      },
      fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'middle', tavern: 'shop', industrial: 'poor', poor: null },
      civic: [
        { key: 'vern_school', v: 0, near: 'east_center' },
        { key: 'vern_hospital', v: 0, near: 'south_center' },
        { key: 'vern_caravanserai', v: 0, near: 'south_center' },
        { key: 'vern_warehouse', v: 0, near: 'north_serai' },
        { key: 'jj_warehouse_b', v: 0, near: 'north_serai' },
        { key: 'vern_silos', v: 0, near: 'east_center' },
        { key: 'vern_tank', v: 0, near: 'south_center' }
      ],
      civicSpacing: 44, civicJitter: 12,
      voidMax: 48, voidIters: 6, voidBatch: 8, sideSpacing: 52, sideMax: 185,
      alleyFrac: 0.24, blindMax: 65, interiorDepth: 11, interiorRounds: 1,
      avenueSnap: 38, ringGap: 8, verge: 5, mapHalf: 800,
      plazaArt: { rich: [], middle: [], poor: [], commerce: [] }
    };

    var vernSteps = [
      {
        name: 'vernacular districts raster',
        run: function () {
          var L = KCITY.lib, SL = L.SL, P = L.plan();
          var R = SL.R = new L.Raster(vernTune.rasterHalf, vernTune.cell);
          R.occ.fill(L.OCC.OUT);
          for (var pi = 0; pi < VERN_POLYS.length; pi++) {
            KCITY.site.zoneRaster(R, VERN_POLYS[pi], { dry: -950, maxSlope: vernTune.maxSlope, h: G.shapedNoStream });
          }
          /* Keep Governor's Precinct (x: 160..365, z: 192..396) reserved */
          var palExclude = [[160, 192], [365, 192], [365, 396], [160, 396]];
          R.stampPoly(palExclude, L.OCC.HARD, -50);
          /* Stamp already-placed Zone 3 anchors */
          for (var si = 0; si < structures.length; si++) {
            var st = structures[si];
            if (st.zone === 3) {
              var bo = L.obb([st.x, st.z], [Math.cos(st.ry), -Math.sin(st.ry)], st.w * 0.5 + 3.5, st.d * 0.5 + 3.5);
              R.stampPoly(L.obbCorners(bo), L.OCC.HARD, -60 - si);
            }
          }
          P.zone = VERN_POLYS[0];
          P.site = [
            { id: 1, name: 'East Terrace District', role: 'res', poly: VERN_POLYS[0] },
            { id: 2, name: 'South Foundry District', role: 'ind', poly: VERN_POLYS[1] },
            { id: 3, name: 'North Caravanserai Quarter', role: 'com', poly: VERN_POLYS[2] }
          ];
          SL.minSpacing = 6.0;
        }
      },
      { name: 'vernacular landmarks', run: function () { KCITY.lib.SL.note(1, 'vernacular district anchors'); } },
      { name: 'vernacular districts', run: function () { KCITY.lib.SL.note(2, 'east, south and north vernacular wards'); } },
      {
        name: 'vernacular main streets',
        run: function () {
          var SL = KCITY.lib.SL;
          for (var wi2 = 0; wi2 < ways.length; wi2++) {
            var w = ways[wi2];
            if (w.id.indexOf('vern.') === 0) {
              SL.addWay(w.cls, w.pts, 3, { tag: w.id });
            }
          }
        }
      },
      { name: 'vernacular highways', run: function () { KCITY.lib.SL.note(4, 'cut and pass highways'); } },
      { name: 'vernacular open boundary', run: function () { KCITY.lib.SL.note(5, 'open terraced growth beyond colonia wall'); } }
    ].concat(KCITY.defaultSteps().slice(6));

    var vernCity = KCITY.create({
      name: 'dilihan-vernacular',
      tune: vernTune,
      seed: 7446633,
      rand: 'krand',
      index: { order: 'insertion' },
      ground: { h: G.shapedNoStream },
      kit: {
        dims: function (k, v) {
          var d = dimsOf(k);
          return d ? { key: k, v: v | 0, w: d.w + 1.8, d: d.d + 1.8, h: d.h, fw: d.w, fd: d.d } : null;
        }
      },
      rules: {
        wealth: function (p) {
          var dPal = Math.hypot(p[0] - 260, p[1] - 294);
          var w = 0.56 - Math.max(0, p[0] - 320) / 900 - Math.max(0, p[1] - 280) / 950;
          if (dPal < 180) w += 0.24;
          if (p[1] < -330) w = 0.58;
          return w < 0.12 ? 0.12 : w > 0.90 ? 0.90 : w;
        },
        vacant: function (p, rs) {
          return rs.chance(p[0] > 640 || p[1] > 560 ? 0.22 : 0.08);
        },
        groundOk: function (bo) {
          if (!bo || !bo.c) return true;
          return !inSolsticeCorridor(bo.c[0], bo.c[1], 12);
        },
        near: {
          east_center:  function (c) { return Math.hypot(c.p[0] - 460, c.p[1] - 20); },
          south_center: function (c) { return Math.hypot(c.p[0] - 0,   c.p[1] - 380); },
          north_serai:  function (c) { return Math.hypot(c.p[0] - 66,  c.p[1] + 402); }
        }
      },
      steps: vernSteps
    });
    var vernPlan = vernCity.run();

    /* Collect side streets & alleys created by KCITY into ways[] for roadMask & KWALK */
    for (var vwi = 0; vwi < vernPlan.ways.length; vwi++) {
      var vw = vernPlan.ways[vwi];
      if (vw.died == null && vw.born >= 10 && vw.pts && vw.pts.length >= 2) {
        ways.push({ id: 'vern.auto.' + vw.id, cls: vw.cls, w: vw.w == null ? 5 : vw.w, pts: vw.pts });
      }
    }

    /* Target ~3.45:1 built lot area ratio (Zone 3 Vernacular Districts vs Zone 1 Colonia, inside [3.2, 4.8]) */
    var coloniaBuiltArea = 0;
    for (var z1i = 0; z1i < zones[1].length; z1i++) coloniaBuiltArea += zones[1][z1i].area;
    var targetVernArea = coloniaBuiltArea * 3.45;
    var curVernArea = 0;
    for (var z3i = 0; z3i < zones[3].length; z3i++) curVernArea += zones[3][z3i].area;

    /* Helper for culture draw: ~16% Jimjam merchant mix in North Caravanserai Quarter, ~8% elsewhere -> ~10% overall */
    var jjMerchantKeys = ['jj_house_mid_a', 'jj_shop_general', 'jj_shop_spice', 'jj_warehouse_a'];
    var vernFillPool = [
      'vern_warehouse', 'vern_market', 'vern_caravanserai', 'vern_house_mid_c',
      'vern_workshop_b', 'vern_workshop_a', 'vern_shops', 'vern_bakery',
      'vern_brewery', 'vern_tavern', 'vern_house_mid_a', 'vern_provisioner'
    ];

    for (var vli = 0; vli < vernPlan.lots.length; vli++) {
      if (curVernArea >= targetVernArea * 1.02) break;
      var vl = vernPlan.lots[vli];
      if (vl.died != null || !DIMS[vl.key]) continue;
      var distTag = vl.z < -320 ? 'vernacular-north' : vl.z > 198 ? 'vernacular-south' : 'vernacular-east';
      var chosenKey = vl.key;
      var uDraw = KRAND.unit(KRAND.hash(WORLD_SEED, 'vern-mix', vli, 17));
      var jjProb = distTag === 'vernacular-north' ? 0.22 : 0.06;
      if (DIMS[chosenKey].kit === 'vern' && uDraw < jjProb) {
        var mk = jjMerchantKeys[KRAND.hash(WORLD_SEED, 'jjm', vli) % jjMerchantKeys.length];
        if (DIMS[mk].w <= vl.w + 2.5 && DIMS[mk].d <= vl.d + 2.5) chosenKey = mk;
      }
      var vrec = makeRecord('dl.vern.lot.' + vl.id, 3, chosenKey, vl.x, vl.z, vl.ry, {
        district: distTag,
        scale: DIMS[chosenKey].kit === 'jj' && DIMS[chosenKey].cornice > 9.8 ? 0.85 : 1.0
      });
      if (commitStruct(vrec, 1.4)) {
        curVernArea += vrec.area;
      }
    }

    /* Deterministic terrace infill blocks if KCITY alleys left curVernArea below targetVernArea */
    var extraBlocks = [
      { id: 'eb.n1', dist: 'vernacular-north', x0: -205, z0: -535, x1: -25, z1: -345, jjShare: 0.24 },
      { id: 'eb.n2', dist: 'vernacular-north', x0: 135,  z0: -535, x1: 385, z1: -345, jjShare: 0.22 },
      { id: 'eb.e1', dist: 'vernacular-east',  x0: 305,  z0: -295, x1: 735, z1: 455,  jjShare: 0.07 },
      { id: 'eb.s1', dist: 'vernacular-south', x0: -230, z0: 245,  x1: 145, z1: 625,  jjShare: 0.07 },
      { id: 'eb.se', dist: 'vernacular-east',  x0: 385,  z0: 225,  x1: 725, z1: 585,  jjShare: 0.06 }
    ];
    for (var ebi = 0; ebi < extraBlocks.length && curVernArea < targetVernArea * 0.98; ebi++) {
      var eb = extraBlocks[ebi];
      for (var gz = eb.z0; gz <= eb.z1 && curVernArea < targetVernArea * 1.01; gz += 34) {
        for (var gx = eb.x0; gx <= eb.x1 && curVernArea < targetVernArea * 1.01; gx += 33) {
          /* Skip street corridors */
          var onWay = false;
          for (var wcheck = 0; wcheck < ways.length; wcheck++) {
            var wy = ways[wcheck];
            for (var wp = 0; wp + 1 < wy.pts.length; wp++) {
              if (G.stream.dist(gx, gz) < 18) { onWay = true; break; }
              var pa = wy.pts[wp], pb = wy.pts[wp + 1];
              var dxw = pb[0] - pa[0], dzw = pb[1] - pa[1], lw2 = dxw * dxw + dzw * dzw;
              var tw = lw2 > 0 ? Math.max(0, Math.min(1, ((gx - pa[0]) * dxw + (gz - pa[1]) * dzw) / lw2)) : 0;
              if (Math.hypot(gx - (pa[0] + dxw * tw), gz - (pa[1] + dzw * tw)) < (wy.w * 0.5 + 10.5)) {
                onWay = true; break;
              }
            }
            if (onWay) break;
          }
          if (onWay || inSolsticeCorridor(gx, gz, 15)) continue;
          /* Exclude Governor's Precinct */
          if (gx > 152 && gx < 372 && gz > 188 && gz < 402) continue;

          var hCell = KRAND.hash(WORLD_SEED, eb.id, gx, gz);
          var isJj = KRAND.unit(hCell) < eb.jjShare;
          var kPick = isJj
            ? jjMerchantKeys[(hCell >>> 4) % jjMerchantKeys.length]
            : vernFillPool[(hCell >>> 4) % vernFillPool.length];
          var jx = gx + (KRAND.unit(hCell ^ 0x51a3) - 0.5) * 4.0;
          var jz = gz + (KRAND.unit(hCell ^ 0x93c7) - 0.5) * 4.0;
          var jry = ((hCell >>> 9) & 3) * (Math.PI * 0.5);
          var scPick = DIMS[kPick].kit === 'jj' && DIMS[kPick].cornice > 9.8 ? 0.85 : 1.0;
          var fillRec = makeRecord('dl.vern.fill.' + eb.id + '.' + gx + '.' + gz, 3, kPick, jx, jz, jry, {
            district: eb.dist, scale: scPick
          });
          if (commitStruct(fillRec, 1.4)) {
            curVernArea += fillRec.area;
          }
        }
      }
    }

    /* Tag 8 outer Zone 3 Vernacular expansion lots as active KCONS + KCITY.constructMesh scaffolded sites (PLAN.md §0 & §3) */
    var constructSites = [];
    var consCands = zones[3].filter(function (r) {
      return r.kit === 'vern' && !r.landmark && !r.wallStreet && (r.x > 540 || r.z > 470 || r.z < -470);
    });
    for (var csi = 0; csi < Math.min(8, consCands.length); csi++) {
      var targetRec = consCands[Math.floor(csi * consCands.length / Math.min(8, consCands.length))];
      var prog = r2(0.32 + (csi % 4) * 0.14);   /* 0.32, 0.46, 0.60, 0.74 */
      var bills = [
        { timber: 3, brick: 4, lime: 2 },
        { timber: 4, planks: 3, stone: 2 },
        { brick: 4, stone: 3, tiles: 2 }
      ];
      targetRec.construct = {
        progress: prog,
        bill: bills[csi % bills.length]
      };
      constructSites.push({ id: targetRec.id, key: targetRec.key, x: targetRec.x, z: targetRec.z, progress: prog });
    }

    /* ================================================================
     * G. ZONE 4: THE LOWER TOWN (-923 m at Pass-Road Fork & Hykkousoi Legation)
     * ================================================================ */
    var bridgeRec = commitStruct(makeRecord('dl.low.stream_bridge', 4, 'dl_stream_bridge', -430, -40, Math.PI / 2, {
      name: 'Three-Arch Contact-Marble Spring Bridge', landmark: true, district: 'lowertown'
    }), 1.0);
    var customsRec = commitStruct(makeRecord('dl.low.customs_post', 4, 'dl_customs_post', -362, -44, -Math.PI / 2, {
      name: 'Lower-Town Pass Customs & Lipp-Seizure Assay Post', landmark: true, district: 'lowertown'
    }), 2.0);
    var legationRec = commitStruct(makeRecord('dl.low.hykkousoi_legation', 4, 'dl_hykkousoi_legation', -358, 84, -Math.PI / 2, {
      name: 'Walled Hykkousoi League Envoys House & Cistern Court', landmark: true, district: 'lowertown'
    }), 2.0);
    /* Aqueduct arcade carrying West-Wall contact-marble spring water along the lower road shelf */
    for (var aqi = 0; aqi < 4; aqi++) {
      commitStruct(makeRecord('dl.low.aqueduct.' + aqi, 4, 'dl_aqueduct_seg', -468, 170 - aqi * 24, Math.PI / 2, {
        district: 'lowertown'
      }), 0.8);
    }
    var lowTownBuildings = [
      { id: 'dl.low.inn.1',    key: 'jj_inn',            x: -362, z: -124, ry: -Math.PI / 2, name: 'Jimjam Drovers Inn' },
      { id: 'dl.low.serai.1',  key: 'vern_caravanserai', x: -362, z: 168,  ry: -Math.PI / 2, name: 'Trigon Karst-Road Caravanserai' },
      { id: 'dl.low.tavern.1', key: 'vern_tavern',       x: -482, z: 24,   ry: Math.PI / 2 },
      { id: 'dl.low.ware.1',   key: 'vern_warehouse',    x: -484, z: -112, ry: Math.PI / 2 },
      { id: 'dl.low.ware.2',   key: 'jj_warehouse_a',    x: -486, z: 112,  ry: Math.PI / 2 },
      { id: 'dl.low.stable.1', key: 'vern_byre',         x: -484, z: 178,  ry: Math.PI / 2 },
      { id: 'dl.low.toll.1',   key: 'vern_toll_house',   x: -386, z: 242,  ry: 0 },
      { id: 'dl.low.shops.1',  key: 'vern_shops',        x: -362, z: 22,   ry: -Math.PI / 2 },
      { id: 'dl.low.smithy.1', key: 'vern_smithy',       x: -482, z: -176, ry: Math.PI / 2 },
      { id: 'dl.low.house.1',  key: 'vern_house_mid_a',  x: -358, z: -178, ry: -Math.PI / 2 },
      { id: 'dl.low.house.2',  key: 'vern_house_mid_b',  x: -358, z: -214, ry: -Math.PI / 2 },
      { id: 'dl.low.house.3',  key: 'jj_house_mid_a',    x: -482, z: -222, ry: Math.PI / 2, scale: 0.90 }
    ];
    for (var lti = 0; lti < lowTownBuildings.length; lti++) {
      var ltb = lowTownBuildings[lti];
      commitStruct(makeRecord(ltb.id, 4, ltb.key, ltb.x, ltb.z, ltb.ry, {
        name: ltb.name || null, district: 'lowertown', scale: ltb.scale == null ? 1.0 : ltb.scale
      }), 1.4);
    }

    /* SE Port Visas Highway Rock-Cut Tunnel Portal (izani.dilihan-portvisas, 28 km of tunnels) */
    var portalRec = commitStruct(makeRecord('dl.low.portvisas_portal', 4, 'dl_portvisas_portal', 860, 680, faceVec(-340, -260), {
      name: 'Port Visas Highway Tunnel Portal (izani.dilihan-portvisas)', landmark: true, district: 'portvisas-road'
    }), 2.0);
    commitStruct(makeRecord('dl.low.portvisas_watch', 4, 'vern_watch_house', 822, 654, faceVec(-340, -260), {
      name: 'SE Tunnel Guard Watch-House', district: 'portvisas-road'
    }), 1.5);

    /* ================================================================
     * H. ZONE 5: THE COUNTRY (DELLU-HANDU: 8 KHAMLET Allotments, Crops, Clay, Skarn & Salt Pans)
     * ================================================================ */
    var cropsInfo = queryCutCrops();
    var oreNodes = [
      { id: 'dl.ore.tin.1',    kind: 'tin',    grade: 'rich', geologyVal: M.geologyPin.tin,         x: 1115, z: -1045, y: G.h(1115, -1045), r: 5.5, culture: 'iziz-vernacular' },
      { id: 'dl.ore.iron.1',   kind: 'iron',   grade: 'rich', geologyVal: M.geologyNear15km.iron,   x: 1175, z: -1095, y: G.h(1175, -1095), r: 6.0, culture: 'iziz-vernacular' },
      { id: 'dl.ore.iron.2',   kind: 'iron',   grade: 'good', geologyVal: M.geologyPin.iron,        x: 1135, z: -1148, y: G.h(1135, -1148), r: 5.0, culture: 'iziz-vernacular' },
      { id: 'dl.ore.copper.1', kind: 'copper', grade: 'rich', geologyVal: M.geologyNear15km.copper, x: 1192, z: -1038, y: G.h(1192, -1038), r: 5.0, culture: 'iziz-vernacular' }
    ];

    var hamlets = [];
    var cropPlots = [];
    var handuCropCycle = ['rice', 'bamboo-rice', 'measuremelon', 'taro', 'emmer', 'whorl-olive', 'cotton', 'indigo'];

    function runHamlet(id, name, focus, sx, sz, lx, lz, popMax, resPt, srcNodeId) {
      var v = KHAMLET.village({
        id: id,
        world: WORLD_SEED,
        culture: 'dilihan-handu',
        focus: focus,
        site: { x: sx, z: sz },
        link: { x: lx, z: lz },
        resource: resPt,
        popMax: popMax,
        dims: dimsOf,
        siteReach: 160,
        ground: {
          ok: function (qx, qz) {
            return G.slope(qx, qz, 6) < 0.24 && G.stream.dist(qx, qz) > 12;
          }
        }
      });
      var placedCount = 0;
      for (var ri = 0; ri < (v.records || []).length; ri++) {
        var hr = v.records[ri];
        if (!hr || !DIMS[hr.key]) continue;
        var hrec = makeRecord(hr.id, 5, hr.key, hr.x, hr.z, hr.ry, {
          district: id,
          source: hr.role === 'works' && srcNodeId ? srcNodeId : null,
          pop: Math.max(4, Math.round(v.census.pop / Math.max(1, v.records.length)))
        });
        if (commitStruct(hrec, 1.0)) placedCount++;
      }
      for (var lni = 0; lni < (v.lanes || []).length; lni++) {
        var ln = v.lanes[lni];
        if (ln.pts && ln.pts.length >= 2) {
          ways.push({ id: ln.id, cls: 'lane', w: ln.w == null ? 5.5 : ln.w, pts: ln.pts });
        }
      }
      hamlets.push({
        id: id,
        name: name,
        focus: focus,
        x: r2(v.site ? v.site.x : sx),
        z: r2(v.site ? v.site.z : sz),
        pop: v.census ? v.census.pop : 0,
        records: placedCount,
        lanes: (v.lanes || []).length,
        source: srcNodeId || null
      });
      return v;
    }

    /* 1. Eight contiguous Dellu-Handu veteran farming allotment hamlets (~500-person veteran cohorts) */
    for (var hi = 0; hi < G.handuPads.length; hi++) {
      var hp = G.handuPads[hi];
      var cropId = handuCropCycle[hi % handuCropCycle.length];
      runHamlet(hp.id, hp.name, 'farming', hp.x, hp.z, 0, -445, 220, { x: hp.x, z: hp.z - 90, workers: 58 }, null);

      /* Orthogonal handu field plots beside each veteran village */
      for (var pi2 = -1; pi2 <= 1; pi2 += 2) {
        var fx = hp.x + pi2 * 112, fz = hp.z - 68;
        var pCrop = handuCropCycle[(hi + (pi2 > 0 ? 1 : 0)) % handuCropCycle.length];
        var plotKey = pi2 < 0 ? 'jj_farm_field' : 'dl_crop_plot';
        var prec = commitStruct(makeRecord(hp.id + '.plot.' + (pi2 < 0 ? 'a' : 'b'), 5, plotKey, fx, fz, 0, {
          district: hp.id, pop: 0, name: 'Handu Allotment (' + pCrop + ')'
        }), 1.0);
        if (prec) {
          prec.crop = pCrop;
          cropPlots.push({ id: prec.id, hamlet: hp.id, crop: pCrop, x: prec.x, z: prec.z });
        }
      }
    }

    /* 2. NW Alluvial Clay Brickyards (-1080, -1480; clay = 230) */
    runHamlet('works.brick', 'NW Lake-Apron Clay Brickyards', 'clay', G.brickPad.x, G.brickPad.z, -840, -1040, 150,
              { x: G.brickPad.x - 60, z: G.brickPad.z - 50, workers: 38 }, null);

    /* 3. NE Granite-Contact Tin & Magnetite-Skarn Adits (+1140, -1080; tin = 200, iron = 255) */
    runHamlet('works.skarn', 'NE Contact-Skarn Tin & Iron Camp', 'mine', G.skarnPad.x - 55, G.skarnPad.z + 45, 880, -540, 170,
              { x: oreNodes[0].x, z: oreNodes[0].z, workers: 44 }, 'dl.ore.tin.1');
    /* Dedicated adits seated directly at the tin & iron skarn nodes with explicit resSource links */
    commitStruct(makeRecord('dl.skarn.adit.tin', 5, 'dl_skarn_adit', oreNodes[0].x - 16, oreNodes[0].z + 18, 0, {
      name: 'Cassiterite Greisen Adit (tin=200)', district: 'works.skarn', source: 'dl.ore.tin.1'
    }), 1.0);
    commitStruct(makeRecord('dl.skarn.adit.iron', 5, 'dl_skarn_adit', oreNodes[1].x - 16, oreNodes[1].z + 18, 0, {
      name: 'Magnetite Skarn Adit (iron=255)', district: 'works.skarn', source: 'dl.ore.iron.1'
    }), 1.0);

    /* 4. D2 Cut Salt Lake Shore Potash & Halite Works (8 km north at z = -7620, -1,608 m ASL shore; potash = 214) */
    runHamlet('d2.saltworks', 'Cut Salt Lake SE Brine & Potash Works', 'salt', G.saltPad.x, G.saltPad.z, 0, -2350, 190,
              { x: 0, z: -7820, workers: 48 }, null);
    for (var sxi = -2; sxi <= 2; sxi++) {
      commitStruct(makeRecord('dl.d2.pan.' + (sxi + 2), 5, 'dl_evaporite_pan', sxi * 56, -7810, 0, {
        name: 'Potash & Halite Evaporation Pan ' + (sxi + 3), district: 'd2.saltworks', pop: 8
      }), 1.2);
    }

    /* ================================================================
     * I. CENSUS, AREA RATIO & SOLSTICE SIGHTLINE SUMMARY
     * ================================================================ */
    var z1Area = 0, z3Area = 0, z3JjCount = 0, z3VnCount = 0;
    for (var i1 = 0; i1 < zones[1].length; i1++) z1Area += zones[1][i1].area;
    for (var i3 = 0; i3 < zones[3].length; i3++) {
      z3Area += zones[3][i3].area;
      if (zones[3][i3].culture === 'jimjam') z3JjCount++;
      else z3VnCount++;
    }
    var polyColKm2 = r4(polyAreaKm2(COLONIA_POLY));
    var polyVernKm2 = 0;
    for (var vp = 0; vp < VERN_POLYS.length; vp++) polyVernKm2 += polyAreaKm2(VERN_POLYS[vp]);
    polyVernKm2 = r4(polyVernKm2);

    /* Calibrate metropolitan census to PLAN.md §0 & §6 Q3: ~12,000 urban + ~4,000 rural handu = ~16,000 metropolitan */
    var rawUrbanPop = 0, rawRuralPop = 0;
    for (var si2 = 0; si2 < structures.length; si2++) {
      if (structures[si2].zone <= 4) rawUrbanPop += structures[si2].pop;
      else rawRuralPop += structures[si2].pop;
    }
    var urbanPop = 12000;
    var handuPop = 4000;
    for (var hi2 = 0; hi2 < 8; hi2++) {
      /* Record exact hamlet census alongside metropolitan allocation */
      hamlets[hi2].allotmentPop = 500;
    }

    /* Exact world-space Solstice Temple sanctuary eye & arch center for 74-jj-sacred.js (JJ_TEMPLE_K) */
    var csT = Math.cos(TEMPLE_RY), snT = Math.sin(TEMPLE_RY);
    var toTempleWorld = function (lx, ly, lz) {
      return [
        r4(TEMPLE_X + lx * csT + lz * snT),
        r4(templeRec.y + ly),
        r4(TEMPLE_Z - lx * snT + lz * csT)
      ];
    };
    var solsticeArch = {
      templeId: templeRec.id,
      x: templeRec.x,
      z: templeRec.z,
      y: templeRec.y,
      ry: TEMPLE_RY,
      eyeWorld: toTempleWorld(0, 13.7, -8.5),       /* PH(6) + SH(6) + eye(1.7) = 13.7 m at local z = -8.5 m */
      archBaseWorld: toTempleWorld(0, 6.0, 16.0),   /* Platform top PH(6) at local z = +16.0 m */
      archHalfW: 4.5,                               /* 9.0 m full arch opening; 4.0 x 7.0 m inner solstice target box */
      coreHalfW: 2.0,
      archSpringH: 12.0,
      archRadius: 4.5,
      archCrownH: 16.5,                             /* 6.0 + 16.5 = 22.5 m above temple base */
      archDepth: 4.5,
      ephemeris: SOL,
      unshiftedTrap: SOL_UNSHIFTED_TRAP
    };

    /* Governor's Palace architectural & floor-programme metadata (VASSAL-KITS.md §3 & PLAN.md §2.3) */
    var palaceMeta = {
      id: palaceRec.id,
      x: palaceRec.x,
      z: palaceRec.z,
      y: palaceRec.y,
      ry: palaceRec.ry,
      groundsM: [70, 56],
      terraceH: 1.2,
      hallBlockM: [36, 24],
      domeKind: 'gold-onion',
      lanternTopM: 27.0,
      pavilions: [
        { id: 'council',  u: -8, v: 18,  dM: 14, storeys: 2, dome: 'ribbed-slate', lantern: true, domain: 'city' },
        { id: 'chancery', u: -8, v: -18, dM: 14, storeys: 2, dome: 'ribbed-slate', lantern: true, domain: 'government' },
        { id: 'dining',   u: 24, v: -18, dM: 11, storeys: 2, dome: 'terracotta',   lantern: false, domain: 'residence' },
        { id: 'family',   u: 24, v: 18,  dM: 11, storeys: 2, dome: 'terracotta',   lantern: false, domain: 'residence' },
        { id: 'guard',    u: 8,  v: -22, dM: 8,  storeys: 2, dome: 'terracotta',   lantern: false, domain: 'government' },
        { id: 'shrine',   u: 8,  v: 22,  dM: 8,  storeys: 1, dome: 'terracotta',   lantern: false, domain: 'ceremony' },
        { id: 'kitchen',  u: 31, v: -6,  dM: 8,  storeys: 1, dome: 'vented-tudor', lantern: true,  domain: 'service' }
      ],
      floors: ['B', 'G', 'U', 'L'],
      orangeRestrictedTo: ['banners', 'forecourt-gate', 'window-arch-reveals'],
      catalogCulture: 'iziz'
    };

    /* Citizens, caravan & eastern muster cohorts ([G data] deterministic roster) */
    var citizens = [];
    var citizenGroups = [
      { group: 'forum-veterans',     culture: 'iziz',      cx: 0,    cz: -48,  r: 22, n: 26 },
      { group: 'forum-almanac',      culture: 'jimjam',    cx: -14,  cz: -66,  r: 16, n: 14 },
      { group: 'wallstreet-east',    culture: 'iziz',      cx: 256,  cz: -40,  r: 45, n: 24 },
      { group: 'wallstreet-jimjam',  culture: 'jimjam',    cx: 252,  cz: 35,   r: 36, n: 12 },
      { group: 'palace-forecourt',   culture: 'iziz',      cx: 260,  cz: 248,  r: 18, n: 18 },
      { group: 'eastern-muster',     culture: 'iziz',      cx: 540,  cz: -14,  r: 18, n: 36, formation: 'ranks' },
      { group: 'north-caravanserai', culture: 'jimjam',    cx: 48,   cz: -445, r: 28, n: 20 },
      { group: 'ardent-bronzesmiths',culture: 'rustic',    cx: 368,  cz: -82,  r: 20, n: 12 },
      { group: 'hykkousoi-legation', culture: 'hykkousoi', cx: -392, cz: 84,   r: 16, n: 14 },
      { group: 'customs-fork',       culture: 'iziz',      cx: -398, cz: -44,  r: 18, n: 14 }
    ];
    for (var cgi = 0; cgi < citizenGroups.length; cgi++) {
      var cg = citizenGroups[cgi];
      for (var ci3 = 0; ci3 < cg.n; ci3++) {
        var px, pz, pry;
        if (cg.formation === 'ranks') {
          var colIdx = ci3 % 9, rowIdx = Math.floor(ci3 / 9);
          px = cg.cx - 10 + colIdx * 2.4;
          pz = cg.cz - 5 + rowIdx * 2.8;
          pry = -Math.PI / 2;
        } else {
          var h1 = KRAND.hash(WORLD_SEED, cg.group, ci3, 1);
          var ang = KRAND.unit(h1) * Math.PI * 2;
          var rad = Math.sqrt(KRAND.unit(h1 ^ 0x7711)) * cg.r;
          px = cg.cx + Math.cos(ang) * rad;
          pz = cg.cz + Math.sin(ang) * rad;
          pry = KRAND.unit(h1 ^ 0x33aa) * Math.PI * 2;
        }
        citizens.push({
          id: 'dl.cit.' + cg.group + '.' + ci3,
          group: cg.group,
          culture: cg.culture,
          x: r2(px),
          z: r2(pz),
          y: r2(G.h(px, pz)),
          ry: r4(pry)
        });
      }
    }

    return {
      pin: {
        id: M.id,
        name: M.name,
        jamtokku: M.jamtokku,
        px: M.px,
        py: M.py,
        legacyPx: M.legacyPx.slice(),
        datum: M.datum,
        lakeAsl: M.lakeAsl,
        sillAsl: M.sillAsl,
        latitude: M.latitude,
        subGiantLon: M.subGiantLon,
        pressureAtm: M.pressureAtm,
        cutOffset: M.cutOffset.slice()
      },
      census: {
        urban: urbanPop,
        handuAllotments: handuPop,
        metropolitan: urbanPop + handuPop,
        provincial: 32000,
        rawBuildingCapacity: rawUrbanPop + rawRuralPop,
        vernacularDistrictsJjLots: z3JjCount,
        vernacularDistrictsIzvLots: z3VnCount,
        vernacularJjShare: r4(z3JjCount / Math.max(1, z3JjCount + z3VnCount))
      },
      areas: {
        coloniaPolyKm2: polyColKm2,
        vernacularPolyKm2: polyVernKm2,
        polyRatio: r4(polyVernKm2 / polyColKm2),
        coloniaBuiltM2: r2(z1Area),
        vernacularBuiltM2: r2(z3Area),
        builtRatio: r4(z3Area / Math.max(1, z1Area))
      },
      solstice: solsticeArch,
      palace: palaceMeta,
      wallStreetPairs: wallStreetPairs,
      constructSites: constructSites,
      crops: cropsInfo,
      oreNodes: oreNodes,
      hamlets: hamlets,
      cropPlots: cropPlots,
      landmarks: {
        forumId: forumRec.id,
        templeId: templeRec.id,
        palaceId: palaceRec.id,
        seraiId: seraiRec.id,
        musterId: musterRec.id,
        bridgeId: bridgeRec.id,
        customsId: customsRec.id,
        legationId: legationRec.id,
        portalId: portalRec.id
      },
      zones: zones,
      structures: structures,
      walls: walls,
      ways: ways,
      citizens: citizens
    };
  }

  var PLAN_INST = make();

  return {
    dims: DIMS,
    dimsOf: dimsOf,
    atmosSunDir: atmosSunDir,
    solveSolstice: solveSolstice,
    boxesOverlap: boxesOverlap,
    cornersOf: cornersOf,
    make: make,
    plan: PLAN_INST
  };
})();
