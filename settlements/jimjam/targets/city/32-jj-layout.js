/* ================================================================= JIMJAM — Deterministic 11-Zone Metropolis & Handu Layout ([G data])
   [G data] Pure data and functions over JJ_MODEL (28), JJ_GROUND (30), KRAND, KSPACE, KCITY, KHAMLET, CROPS:
   no THREE, no DOM, no Math.random, numeric defaults via x == null ? d : x.

   Implements settlements/jimjam/PLAN.md & SITE-BLUEPRINT.md (st5e01l76v, px 745, py 546, +486.2 m ASL, 50,000 urban + 8,500 handu):
     - Eight Celestial Districts (Sun, Companion, Giant, Two-Day, Week, Thirteen, Four-Day, Day)
     - Former Izani Occupation Enclave & Dilihan Factor Row (zone9.izani: ~42% dil_* & vern_* buildings round jj_izani_gov_ruin)
     - South Cut-Gate Suburb & Great Pilgrim's Market Fairground (zone10.pilgrim_gates, ~12% dil_* / vern_* caravan mix)
     - Separate White-Pass Trans-Rim Compound (jj_whitepass_compound at 340, -1380) for Khaayken Yeti & Yonni/Rian scholars,
       > 1,000 m east of the regulated Eternian Lotus Water-Gate (-680, -1580)
     - Full 18-variety Jimjam housing span (jj_house_poor_a..f, mid_a..f, rich_a..f) & all 29 trade/SIM.economy buildings
     - Six KHAMLET.village handu hinterland settlements + WSW Windmill Headland (outside Az 239..249 deg solstice keepout) */
var JJ_LAYOUT = (function () {
  'use strict';
  var G = JJ_GROUND, M = JJ_MODEL;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var WORLD_SEED = KRAND.hash(745, 546, 4862, 51);

  function r2(v) { return Math.round(v * 100) / 100; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function azToRy(azDeg) { return Math.PI - azDeg * D2R; }

  /* ---- 1. Exact [G data] Ephemeris Solver at (-34.34 deg S, subGiantLon 56.27 deg) ---- */
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
    var lo = 15.5, hi = 21.5;
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
  var SOL = solveSolstice(M.latitude, 3.0, 91);
  var SOL_PLACEHOLDER_40S = solveSolstice(-40.0, 3.0, 91);

  /* ---- 2. Complete Building Footprint, Culture & Tag Table (JJ + Dilihan + Iziz Vernacular) ---- */
  var DIMS = {
    /* Native Jimjam Housing — 18 distinct plans & rooflines (70 + 70b) */
    jj_house_poor_a:  { w: 8.4,  d: 7.8,  h: 8.5,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 18 },
    jj_house_poor_b:  { w: 6.2,  d: 8.4,  h: 8.1,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 16 },
    jj_house_poor_c:  { w: 8.1,  d: 8.1,  h: 5.9,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], pop: 18 },
    jj_house_poor_d:  { w: 9.2,  d: 8.6,  h: 9.6,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-multi'],  pop: 26 },
    jj_house_poor_e:  { w: 7.4,  d: 10.8, h: 11.4, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-multi'],  pop: 34 },
    jj_house_poor_f:  { w: 9.6,  d: 9.2,  h: 7.6,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['dwelling-single'], job: 'pottery', pop: 20 },
    jj_house_mid_a:   { w: 10.6, d: 11.2, h: 15.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single'], pop: 32, lit: true },
    jj_house_mid_b:   { w: 11.5, d: 7.8,  h: 19.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'],  pop: 40, lit: true },
    jj_house_mid_c:   { w: 12.9, d: 12.4, h: 15.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi', 'shop'], job: 'trading', pop: 44, lit: true },
    jj_house_mid_d:   { w: 13.6, d: 12.8, h: 16.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-multi'],  pop: 48, lit: true },
    jj_house_mid_e:   { w: 11.8, d: 11.4, h: 17.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single'], pop: 34, lit: true },
    jj_house_mid_f:   { w: 12.4, d: 10.2, h: 18.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['dwelling-single', 'shop'], job: 'scribing', pop: 36, lit: true },
    jj_house_rich_a:  { w: 24.5, d: 24.5, h: 18.0, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 46, lit: true },
    jj_house_rich_b:  { w: 18.4, d: 24.0, h: 21.8, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 42, lit: true },
    jj_house_rich_c:  { w: 23.0, d: 23.2, h: 27.0, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 50, lit: true },
    jj_house_rich_d:  { w: 26.0, d: 22.0, h: 20.5, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], pop: 48, lit: true },
    jj_house_rich_e:  { w: 22.0, d: 24.0, h: 24.2, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], job: 'scribing', pop: 44, lit: true },
    jj_house_rich_f:  { w: 24.0, d: 20.0, h: 22.6, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['dwelling-single'], job: 'trading',  pop: 46, lit: true },

    /* Shops, Hospitality, Trade, SIM.economy & Industry (71, 72, 73, 73b, 73c) */
    jj_shop_weapons:    { w: 8.4,  d: 9.0,  h: 11.9, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'smithing', pop: 18 },
    jj_shop_armor:      { w: 10.2, d: 8.6,  h: 10.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'smithing', pop: 18 },
    jj_shop_general:    { w: 10.0, d: 8.4,  h: 10.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading',  pop: 20 },
    jj_shop_food:       { w: 9.6,  d: 9.2,  h: 9.4,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'baking',   pop: 22 },
    jj_shop_alchemy:    { w: 6.4,  d: 8.0,  h: 11.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'alchemy',  pop: 16 },
    jj_shop_textiles:   { w: 10.0, d: 8.6,  h: 10.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'weaving',  pop: 20 },
    jj_shop_jeweler:    { w: 6.0,  d: 7.6,  h: 10.2, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['shop'], job: 'smithing', pop: 16, lit: true },
    jj_shop_spice:      { w: 8.0,  d: 8.2,  h: 8.6,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'trading',  pop: 18 },
    jj_butcher:         { w: 10.4, d: 9.6,  h: 10.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop'], job: 'butchery', pop: 20 },
    jj_tailor_cobbler:  { w: 12.4, d: 10.6, h: 11.2, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['shop', 'industry'], job: 'weaving', pop: 24, lit: true },
    jj_money_changer:   { w: 14.8, d: 12.6, h: 14.8, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['shop', 'civic'], job: 'trading', pop: 22, lit: true },
    jj_market_hall:     { w: 28.0, d: 20.0, h: 15.8, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['market', 'shop'], job: 'trading', pop: 40, lit: true },
    jj_weaver_dyer:     { w: 18.4, d: 16.6, h: 12.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'dyeing',    pop: 32 },
    jj_brewhouse:       { w: 16.8, d: 14.4, h: 15.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'brewing',   pop: 28 },
    jj_tannery:         { w: 17.6, d: 15.6, h: 10.8, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['industry'], job: 'tanning',   pop: 26 },
    jj_brick_kiln:      { w: 22.0, d: 18.0, h: 17.5, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['industry'], job: 'masonry',   pop: 36, lit: true },
    jj_glassworks:      { w: 18.0, d: 15.0, h: 16.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'lampmaking',pop: 30, lit: true },
    jj_almanac_press:   { w: 20.0, d: 16.0, h: 15.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'civic'], job: 'scribing', pop: 34, lit: true },
    jj_masons_yard:     { w: 18.0, d: 14.6, h: 10.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'masonry',   pop: 26 },
    jj_smithy_brass:    { w: 16.4, d: 14.2, h: 11.6, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'shop'], job: 'smithing', pop: 28, lit: true },
    jj_pottery:         { w: 16.0, d: 14.0, h: 9.8,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'shop'], job: 'pottery',  pop: 26, lit: true },
    jj_oil_press:       { w: 16.8, d: 14.8, h: 9.6,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'oil',       pop: 24 },
    jj_timber_yard:     { w: 22.0, d: 16.0, h: 9.2,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'carpentry', pop: 28 },
    jj_gypsum_works:    { w: 20.0, d: 16.0, h: 9.8,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry'], job: 'quarrying', pop: 28, lit: true },
    jj_saltpeter_ery:   { w: 20.0, d: 15.0, h: 10.4, kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['industry'], job: 'alchemy',   pop: 24 },
    jj_inn:             { w: 33.4, d: 37.5, h: 18.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['inn'],      job: 'trading',   pop: 64, lit: true },
    jj_tavern:          { w: 16.0, d: 27.4, h: 18.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['tavern'],   job: 'brewing',   pop: 32, lit: true },
    jj_caravanserai:    { w: 57.2, d: 71.6, h: 25.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['inn', 'market'], job: 'trading', pop: 110, lit: true },
    jj_whitepass_compound: { w: 52.0, d: 46.0, h: 19.0, kit: 'jj', culture: 'jimjam', wealth: null,  types: ['inn', 'market', 'civic'], job: 'customs', pop: 85, lit: true },

    /* Civic, Harbour, Vessels, Military, Walls & Agriculture */
    jj_library:         { w: 45.5, d: 30.6, h: 33.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'scribing', pop: 55, lit: true },
    jj_school:          { w: 31.0, d: 29.0, h: 16.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'scribing', pop: 48, lit: true },
    jj_amphitheater:    { w: 80.4, d: 61.2, h: 28.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], pop: 45, lit: true },
    jj_guild_hall:      { w: 26.0, d: 22.0, h: 21.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'trading',  pop: 44, lit: true },
    jj_customs_house:   { w: 24.0, d: 18.0, h: 17.6, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic', 'market'], job: 'customs', pop: 38, lit: true },
    jj_healing_house:   { w: 24.0, d: 22.0, h: 16.4, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'healing',  pop: 42, lit: true },
    jj_bathhouse:       { w: 22.0, d: 20.0, h: 15.6, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['civic'], job: 'healing',  pop: 36, lit: true },
    jj_funerary_ghat:   { w: 24.0, d: 20.0, h: 18.2, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['funerary', 'religious'], job: 'worship', pop: 20, lit: true },
    jj_boatyard:        { w: 26.0, d: 18.0, h: 11.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'shipwrighting', pop: 34 },
    jj_fish_quay:       { w: 22.0, d: 14.0, h: 9.8,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['industry', 'infrastructure'], job: 'fishing', pop: 28 },
    jj_barge_quay:      { w: 32.0, d: 16.0, h: 16.5, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['infrastructure', 'market'], job: 'customs', pop: 42, lit: true, electric: true },
    jj_lake_barge:      { w: 4.8,  d: 16.6, h: 10.6, kit: 'jj', cls: 'vessel', culture: 'jimjam', wealth: 'middle', types: ['cargo', 'barge'], propulsion: 'sail', hull: 'monohull', pop: 6 },
    jj_palace:          { w: 113.0,d: 90.0, h: 52.0, kit: 'jj', culture: 'jimjam', wealth: 'rich',   types: ['civic', 'dwelling-single'], pop: 260, lit: true, electric: true },
    jj_palace_plaza:    { w: 82.0, d: 71.0, h: 24.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['plaza', 'civic'], pop: 0, lit: true },
    jj_barracks:        { w: 64.0, d: 52.0, h: 22.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'civic'], pop: 180, lit: true },
    jj_fortress:        { w: 104.0,d: 100.0,h: 44.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'civic'], pop: 280, lit: true },
    jj_wall_seg:        { w: 12.0, d: 5.2,  h: 10.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'infrastructure'], pop: 0 },
    jj_wall_tower:      { w: 10.4, d: 10.4, h: 25.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military'], pop: 6 },
    jj_wall_gate:       { w: 24.0, d: 15.0, h: 31.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military', 'infrastructure'], job: 'customs', pop: 18, lit: true },
    jj_wall_corner:     { w: 13.0, d: 13.0, h: 33.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['military'], pop: 8, lit: true },
    jj_farm_field:      { w: 30.0, d: 24.0, h: 2.6,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm'], job: 'farming', pop: 0 },
    jj_farmhouse_a:     { w: 22.0, d: 20.0, h: 9.2,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm', 'dwelling-single'], job: 'farming', pop: 16 },
    jj_farmhouse_b:     { w: 20.0, d: 16.0, h: 9.0,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm', 'dwelling-single'], job: 'farming', pop: 14 },
    jj_orchard:         { w: 28.0, d: 24.0, h: 7.5,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['farm'], job: 'farming', pop: 8 },
    jj_dairy:           { w: 20.0, d: 16.0, h: 9.6,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['farm'], job: 'dairy',   pop: 14 },
    jj_clay_pit:        { w: 24.0, d: 20.0, h: 5.4,  kit: 'jj', culture: 'jimjam', wealth: 'poor',   types: ['industry'], job: 'pottery', pop: 18 },
    jj_carter_corral:   { w: 24.0, d: 18.0, h: 8.8,  kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['infrastructure', 'farm'], job: 'herding', pop: 22 },
    jj_granary:         { w: 24.0, d: 16.0, h: 10.8, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['farm', 'infrastructure'], job: 'milling', pop: 10 },
    jj_windmill:        { w: 18.0, d: 18.0, h: 26.0, kit: 'jj', culture: 'jimjam', wealth: null,     types: ['farm', 'industry'], job: 'milling', pop: 10 },
    jj_warehouse_a:     { w: 36.0, d: 24.0, h: 12.8, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'warehousing', pop: 18 },
    jj_warehouse_b:     { w: 38.0, d: 24.0, h: 11.4, kit: 'jj', culture: 'jimjam', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'warehousing', pop: 18 },

    /* Sacred & Celestial Landmarks (74 + 74b) */
    jj_temple_sun:        { w: 50.0, d: 86.0, h: 48.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious', 'civic'], job: 'worship', pop: 80, lit: true },
    jj_rajas_eye:         { w: 28.0, d: 28.0, h: 26.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['civic', 'religious'], job: 'scribing', pop: 28, lit: true, electric: true },
    jj_order_chapterhouse:{ w: 48.0, d: 42.0, h: 22.0, kit: 'jj', culture: 'order',  wealth: null,   types: ['civic', 'religious'], job: 'scribing', pop: 36, lit: true, electric: true },
    jj_izani_gov_ruin:    { w: 70.0, d: 56.0, h: 24.0, kit: 'jj', culture: 'iziz',   wealth: 'middle', state: 'reclaimed', types: ['civic', 'dwelling-multi'], job: 'customs', pop: 54, lit: true, electric: true },
    jj_temple_week:       { w: 56.0, d: 44.0, h: 32.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious', 'civic'], job: 'worship', pop: 52, lit: true },
    jj_temple_thirteen:   { w: 64.0, d: 84.0, h: 42.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 65, lit: true },
    jj_temple_companion:  { w: 42.0, d: 48.0, h: 36.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious', 'civic'], job: 'worship', pop: 46, lit: true },
    jj_temple_day:        { w: 58.0, d: 52.0, h: 29.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 48, lit: true },
    jj_temple_twoday:     { w: 48.0, d: 54.0, h: 24.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 44, lit: true },
    jj_temple_fourday:    { w: 68.0, d: 68.0, h: 28.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious', 'civic'], job: 'worship', pop: 50, lit: true },
    jj_shrine_veil:       { w: 24.0, d: 20.0, h: 18.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 14, lit: true },
    jj_shrine_crown:      { w: 22.0, d: 22.0, h: 21.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 16, lit: true },
    jj_shrine_rust_cinder:{ w: 26.0, d: 18.0, h: 19.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 14, lit: true },
    jj_shrine_ash:        { w: 16.0, d: 16.0, h: 14.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 10, lit: true },
    jj_shrine_frost:      { w: 20.0, d: 20.0, h: 17.0, kit: 'jj', culture: 'jimjam', wealth: null,   types: ['religious'],          job: 'worship', pop: 12, lit: true },
    jj_shrine_wanderer:   { w: 24.0, d: 24.0, h: 4.5,  kit: 'jj', culture: 'jimjam', wealth: 'poor', types: ['religious'],          job: 'worship', pop: 6,  lit: false },

    /* Dilihan Vassal-City Kit (kits/dilihan: red/orange brick passive-cooling courtyard buildings for Former Izani Enclave & Factor Row) */
    dil_house_poor_dogtrot:  { w: 9.0,  d: 10.0, h: 6.8,  kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'poor',   types: ['dwelling-single'], pop: 18 },
    dil_house_poor_yard:     { w: 10.0, d: 10.0, h: 6.5,  kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'poor',   types: ['dwelling-single'], pop: 18 },
    dil_house_mid_courtyard: { w: 14.0, d: 14.0, h: 10.6, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['dwelling-single'], pop: 30 },
    dil_house_mid_veranda:   { w: 13.0, d: 15.0, h: 10.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['dwelling-single'], pop: 30 },
    dil_tenement_windwell:   { w: 15.0, d: 16.0, h: 13.4, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['dwelling-multi'],  pop: 44 },
    dil_villa_impluvium:     { w: 24.0, d: 26.0, h: 15.6, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'rich',   types: ['dwelling-single'], pop: 46, lit: true },
    dil_manor_breezeway:     { w: 26.0, d: 24.0, h: 16.2, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'rich',   types: ['dwelling-single'], pop: 46, lit: true },
    dil_shop_arcade:         { w: 12.0, d: 14.0, h: 10.4, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['shop', 'market'],  job: 'trading',     pop: 24 },
    dil_bazaar_pavilion:     { w: 22.0, d: 18.0, h: 11.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['market'],          job: 'trading',     pop: 28 },
    dil_tavern_pergola:      { w: 15.0, d: 15.0, h: 10.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['tavern'],          job: 'brewing',     pop: 26 },
    dil_inn_courtyard:       { w: 22.0, d: 22.0, h: 12.2, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['inn'],             job: 'trading',     pop: 42 },
    dil_godown_ventilated:   { w: 18.0, d: 16.0, h: 10.6, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['industry', 'infrastructure'], job: 'warehousing', pop: 20 },
    dil_bakery_breezeway:    { w: 13.0, d: 13.0, h: 9.8,  kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['shop', 'industry'],job: 'baking',      pop: 22 },
    dil_smithy_monitor:      { w: 14.0, d: 14.0, h: 10.6, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['industry'],        job: 'smithing',    pop: 24 },
    dil_weaver_dyecourt:     { w: 15.0, d: 15.0, h: 10.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: 'middle', types: ['industry', 'shop'],job: 'weaving',     pop: 24 },
    dil_cooling_baths:       { w: 24.0, d: 22.0, h: 15.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['civic'],           job: 'healing',     pop: 36, lit: true },
    dil_customs_loggia:      { w: 24.0, d: 18.0, h: 14.8, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['civic', 'infrastructure'], job: 'customs', pop: 32, lit: true },
    dil_guildhall_peristyle: { w: 26.0, d: 24.0, h: 16.4, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['civic'],           job: 'trading',     pop: 36, lit: true },
    dil_wall_seg:            { w: 12.0, d: 5.2,  h: 11.4, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['military', 'infrastructure'], pop: 0 },
    dil_wall_tower:          { w: 10.0, d: 10.0, h: 19.5, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['military', 'infrastructure'], pop: 5,  lit: true },
    dil_wall_corner:         { w: 12.4, d: 12.4, h: 22.0, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['military', 'infrastructure'], pop: 6,  lit: true },
    dil_wall_gate:           { w: 24.0, d: 13.6, h: 23.5, kit: 'dil', culture: 'iziz', style: 'dilihan', wealth: null,     types: ['military', 'infrastructure'], job: 'customs', pop: 16, lit: true },

    /* Iziz Vernacular Kit (kits/iziz-vernacular: surviving occupation tenements, watch-posts & factor houses in zone9/zone10) */
    vern_house_poor_a:       { w: 8.0,  d: 10.0, h: 8.0,  kit: 'vern', culture: 'iziz-vernacular', wealth: 'poor',   types: ['dwelling-single'], pop: 16 },
    vern_house_mid_a:        { w: 10.0, d: 13.0, h: 11.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['dwelling-single'], pop: 26 },
    vern_house_mid_b:        { w: 12.0, d: 11.0, h: 11.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['dwelling-multi'],  pop: 32 },
    vern_house_rich_a:       { w: 28.0, d: 24.0, h: 16.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'rich',   types: ['dwelling-single'], pop: 42, lit: true },
    vern_scribe:             { w: 15.0, d: 13.0, h: 12.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'scribing', pop: 22 },
    vern_apothecary:         { w: 17.0, d: 14.0, h: 13.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'alchemy',  pop: 22 },
    vern_provisioner:        { w: 16.0, d: 18.0, h: 12.0, kit: 'vern', culture: 'iziz-vernacular', wealth: 'middle', types: ['shop', 'dwelling-single'], job: 'trading',  pop: 24 },
    vern_guard_tower:        { w: 26.0, d: 20.0, h: 19.0, kit: 'vern', culture: 'iziz-vernacular', wealth: null,     types: ['military', 'civic'],       job: 'customs',  pop: 28, lit: true },
    /* P2-P3 Civic, Water-Portal, Dockyard & Pilgrim Camp Additions */
    jj_wall_watergate:       { w: 24.0, d: 14.0, h: 27.0, kit: 'jj', cls: 'building', culture: 'jimjam', wealth: null,   types: ['military', 'infrastructure'], pop: 0,  lit: false },
    jj_court:                { w: 34.0, d: 26.0, h: 22.5, kit: 'jj', cls: 'building', culture: 'jimjam', wealth: null,   types: ['civic'],                     pop: 45, lit: true  },
    jj_dock_crane:           { w: 11.6, d: 10.4, h: 12.6, kit: 'jj', cls: 'building', culture: 'jimjam', wealth: null,   types: ['infrastructure', 'market'],  job: 'trading', pop: 8, lit: false },
    jj_harbour_skiff:        { w: 2.8,  d: 8.6,  h: 3.6,  kit: 'jj', cls: 'vessel',   culture: 'jimjam', wealth: 'poor', types: ['cargo', 'barge'], propulsion: 'oar', hull: 'monohull', pop: 2, lit: false },
    jj_pilgrim_tent:         { w: 9.2,  d: 7.8,  h: 5.6,  kit: 'jj', cls: 'building', culture: 'jimjam', wealth: 'poor', types: ['inn'],                       pop: 10, lit: true  }
  };

  function dimsOf(key) {
    var d = DIMS[key];
    return d ? { key: key, w: d.w, d: d.d, h: d.h, fw: d.w, fd: d.d } : null;
  }

  /* ---- 3. Register KHAMLET.CULTURES['jimjam-handu'] for the 6 Hinterland Villages ---- */
  if (typeof KHAMLET !== 'undefined' && KHAMLET.CULTURES) {
    KHAMLET.CULTURES['jimjam-handu'] = {
      kit: 'jimjam', household: 5.2, workShare: 0.46, slopeMax: 0.22,
      religious: 'jj_shrine_crown', civic: 'jj_school', general: 'jj_shop_general',
      food: 'jj_shop_food', warehouse: 'jj_granary',
      services: { religious: 1, civic: 2, general: 2, food: 2, warehouse: 3 },
      houses: {
        poor: [['jj_house_poor_a', 1, 3], ['jj_house_poor_c', 1, 3], ['jj_house_poor_d', 2, 2], ['jj_house_poor_f', 1, 2]],
        middling: [['jj_house_mid_a', 2, 3], ['jj_house_mid_e', 2, 2], ['jj_house_mid_c', 2, 1]],
        head: [['jj_house_rich_d', 1, 2], ['jj_house_rich_a', 1, 1]],
        middlingShare: 0.36
      },
      works: {
        farming: [{ key: 'jj_farmhouse_a', jobs: 14, share: 0.45 }, { key: 'jj_farmhouse_b', jobs: 12, share: 0.25 },
                  { key: 'jj_dairy', jobs: 10, share: 0.15 }, { key: 'jj_granary', jobs: 8, share: 0.15 }],
        orchard: [{ key: 'jj_orchard', jobs: 12, share: 0.45 }, { key: 'jj_oil_press', jobs: 14, share: 0.35 },
                  { key: 'jj_farmhouse_b', jobs: 10, share: 0.20 }],
        clay:    [{ key: 'jj_clay_pit', jobs: 18, share: 0.45 }, { key: 'jj_brick_kiln', jobs: 18, share: 0.35 },
                  { key: 'jj_pottery', jobs: 14, share: 0.20 }],
        quarry:  [{ key: 'jj_gypsum_works', jobs: 18, share: 0.55 }, { key: 'jj_masons_yard', jobs: 14, share: 0.30 },
                  { key: 'jj_saltpeter_ery', jobs: 12, share: 0.15 }],
        fishing: [{ key: 'jj_fish_quay', jobs: 16, share: 0.55 }, { key: 'jj_boatyard', jobs: 14, share: 0.25 },
                  { key: 'jj_warehouse_a', jobs: 10, share: 0.20 }]
      },
      focusJobs: { farming: 76, orchard: 58, clay: 54, quarry: 52, fishing: 56 },
      reach: { farming: 460, orchard: 420, clay: 360, quarry: 360, fishing: 320 },
      pending: {}
    };
  }

  /* ---- 4. Exact OBB Non-Overlap & Ground-Pad Seating Helpers ---- */
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
    if ((a.concentricPair && a.concentricPair === b.id) || (b.concentricPair && b.concentricPair === a.id)) {
      return false;
    }
    var g = gap == null ? 0 : gap;
    return !sepPoly(cornersOf(a, g * 0.5), cornersOf(b, g * 0.5));
  }
  function padElevation(rec) {
    if (rec.cls === 'vessel') return r2(G.lakeY);
    var pts = cornersOf(rec, 0);
    var hi = G.h(rec.x, rec.z);
    for (var i = 0; i < pts.length; i++) {
      var hy = G.h(pts[i][0], pts[i][1]);
      if (hy > hi) hi = hy;
    }
    var cy = G.h(rec.x, rec.z);
    return r2(Math.min(hi, cy + (hi - cy) * 0.60));
  }

  /* ---- 5. Legal Dense-Air (1.51 atm Am) Crop Query on CROPS ---- */
  function queryJimjamCrops() {
    if (typeof CROPS === 'undefined') {
      return {
        irrigatedStaples: ['rice', 'emmer', 'taro', 'sweet-potato', 'lotus-root', 'helix-bean'],
        fibresAndDyes: ['cotton', 'indigo', 'saffron', 'wineweed', 'bamboo', 'mat-reed'],
        orchardsAndOil: ['whorl-olive', 'citron', 'ironplum', 'pomegranate', 'fig']
      };
    }
    var wetRes = CROPS.at({ warmth: 'subtropic', atm: 'dense', arid: 'humid', wet: true });
    var dryRes = CROPS.at({ warmth: 'subtropic', atm: 'dense', arid: 'subhumid' });
    var pickIds = function (res, want) {
      var have = {};
      for (var i = 0; i < res.length; i++) have[res[i].crop.id] = true;
      var out = want.filter(function (k) { return !!have[k]; });
      for (var j = 0; j < res.length && out.length < want.length; j++) {
        var cid = res[j].crop.id;
        if (cid !== 'sugar-cane' && cid !== 'cacao' && cid !== 'coffee' && cid !== 'clove' && out.indexOf(cid) < 0) {
          out.push(cid);
        }
      }
      return out;
    };
    return {
      wetCount: wetRes.length,
      dryCount: dryRes.length,
      irrigatedStaples: pickIds(wetRes, ['rice', 'emmer', 'taro', 'sweet-potato', 'lotus-root', 'helix-bean']),
      fibresAndDyes: pickIds(wetRes.concat(dryRes), ['cotton', 'indigo', 'saffron', 'wineweed', 'bamboo', 'mat-reed']),
      orchardsAndOil: pickIds(dryRes, ['whorl-olive', 'citron', 'ironplum', 'pomegranate', 'fig'])
    };
  }

  /* ---- 6. Build Complete 11-Zone Jimjam Metropolis & Handu Hinterland Plan ---- */
  function make() {
    var structures = [];
    var walls = [];
    var ways = [];
    var marketStalls = [];
    var citizens = [];
    var hamlets = [];
    var constructSites = [];
    var byZone = {};
    var space = KSPACE.create({ cell: 32 });

    var ZONE_IDS = [
      'zone1.sun', 'zone2.companion', 'zone3.giant', 'zone4.twoday', 'zone5.week',
      'zone6.thirteen', 'zone7.fourday', 'zone8.day', 'zone9.izani', 'zone10.pilgrim_gates', 'zone11.handu'
    ];
    for (var zi = 0; zi < ZONE_IDS.length; zi++) byZone[ZONE_IDS[zi]] = [];

    /* Solstice sightline corridor from jj_temple_sun (-820, -80) along Az 244.04 deg (SOL.ry): 100% clear! */
    var TEMPLE_X = -820.0, TEMPLE_Z = -80.0, TEMPLE_RY = SOL.ry;
    var SIGHT_DX = Math.sin(TEMPLE_RY), SIGHT_DZ = Math.cos(TEMPLE_RY);

    function inSolsticeCorridor(x, z, r) {
      var rx = x - TEMPLE_X, rz = z - TEMPLE_Z;
      var along = rx * SIGHT_DX + rz * SIGHT_DZ;
      if (along < 26 || along > 1400) return false;
      var perp = Math.abs(-rx * SIGHT_DZ + rz * SIGHT_DX);
      return perp < (28 + (r == null ? 0 : r));
    }

    function inCanalKeepout(x, z, r) {
      return G.canal.dist(x, z) < (11.5 + (r == null ? 0 : r));
    }

    function ptSegDist(px, pz, ax, az, bx, bz) {
      var vx = bx - ax, vz = bz - az;
      var l2 = vx * vx + vz * vz;
      var t = l2 > 1e-6 ? ((px - ax) * vx + (pz - az) * vz) / l2 : 0;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      return Math.hypot(px - (ax + vx * t), pz - (az + vz * t));
    }

    function inWayKeepout(x, z, r) {
      var pad = r == null ? 0 : r;
      for (var wi = 0; wi < ways.length; wi++) {
        var w = ways[wi];
        var hw = (w.w == null ? 8.0 : w.w) * 0.5 + 1.4 + pad;
        var pts = w.pts;
        for (var k = 0; k + 1 < pts.length; k++) {
          if (ptSegDist(x, z, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]) < hw) return true;
        }
      }
      return false;
    }

    var WALL_RING = [
      { p: 'w.nnw', z: 'zone3.giant',    x0: -1080, z0: -1580, x1: -160,  z1: -1580, dil: false,
        gate: { id: 'gate.lotus_water', name: 'Lotus Water-Gate (Harbour Cove)', x: -680, z: -1580 },
        portals: [
          { id: 'gate.lotus_water',    kind: 'gate',      name: 'Lotus Water-Gate (Harbour Cove)',           x: -680, z: -1580 },
          { id: 'gate.harbour_sluice', kind: 'watergate', name: 'Lotus Harbour Canal Water-Portal & Sluice', x: -610, z: -1580 }
        ]
      },
      { p: 'w.nne', z: 'zone3.giant',    x0: -160,  z0: -1580, x1: 820,   z1: -1320, dil: false, gate: { id: 'gate.whitepass_north', name: 'White-Pass and Skywatch North Gate',             x: 380,  z: -1437 } },
      { p: 'w.ne',  z: 'zone8.day',      x0: 820,   z0: -1320, x1: 1380,  z1: -760,  dil: false, gate: { id: 'gate.giant_bluff',     name: 'Giant-Bluff North-East Gate',                    x: 1100, z: -1040 } },
      { p: 'w.e',   z: 'zone8.day',      x0: 1380,  z0: -760,  x1: 1380,  z1: 560,   dil: false,
        gate: { id: 'gate.serai_east', name: 'Serai and Ardent East Gate', x: 1380, z: 80 },
        portals: [
          { id: 'gate.serai_east',  kind: 'gate',      name: 'Serai and Ardent East Gate',               x: 1380, z: 80  },
          { id: 'gate.east_sluice', kind: 'watergate', name: 'Monsoon Feeder Canal East Water-Portal',   x: 1380, z: 320 }
        ]
      },
      { p: 'w.se',  z: 'zone9.izani',    x0: 1380,  z0: 560,   x1: 1080,  z1: 960,   dil: true,  gate: null },
      { p: 'w.izs', z: 'zone9.izani',    x0: 1080,  z0: 960,   x1: 540,   z1: 960,   dil: true,  gate: null },
      { p: 'w.s',   z: 'zone6.thirteen', x0: 540,   z0: 960,   x1: -1260, z1: 920,   dil: false, gate: { id: 'gate.cut_south',       name: 'Sun-Road and Cut South Gate',                    x: 60,   z: 949   } },
      { p: 'w.w',   z: 'zone5.week',     x0: -1260, z0: 920,   x1: -1240, z1: -1220, dil: false, gate: { id: 'gate.headland_west',   name: 'Veil-Headland West Gate',                        x: -1253,z: 420   } },
      { p: 'w.nw',  z: 'zone4.twoday',   x0: -1240, z0: -1220, x1: -1080, z1: -1580, dil: false, gate: { id: 'gate.twoday_postern',  name: 'Two-Day North-West Postern',                     x: -1160,z: -1400 } }
    ];

    /* Positive inside the convex 9-gon walled metropolis (in meters from nearest wall), negative outside */
    function wallSignedDist(x, z) {
      var minD = 1e9;
      for (var i = 0; i < WALL_RING.length; i++) {
        var wl = WALL_RING[i];
        var dx = wl.x1 - wl.x0, dz = wl.z1 - wl.z0;
        var len = Math.hypot(dx, dz);
        var d = (dx * (z - wl.z0) - dz * (x - wl.x0)) / len;
        if (d < minD) minD = d;
      }
      return minD;
    }

    /* Six Well-Defined, Curbed Urban Parks & Formal Royal/Temple Gardens (reserved against infill!) */
    var PARKS = [
      { id: 'park.royal_charbagh',     name: 'Royal Suriya Charbagh Garden',          zone: 'zone1.sun',       x0: 76,   z0: -92,  x1: 236,  z1: 88,   style: 'charbagh',  species: ['mistpalm', 'ginkgo', 'needlecypress'] },
      { id: 'park.acropolis_cloister', name: 'Kauntavan Ephemeris Cloister Garden',   zone: 'zone1.sun',       x0: -835, z0: -308, x1: -595, z1: -246, style: 'cloister',  species: ['ginkgo', 'needlecypress'] },
      { id: 'park.fourday_kulam',      name: 'Four-Day Lotus-Tank Promenade Park',    zone: 'zone7.fourday',   x0: 525,  z0: -635, x1: 622,  z1: -485, style: 'waterside', species: ['paperbark', 'mistpalm', 'glowwillow', 'treefern'] },
      { id: 'park.companion_terrace',  name: 'Companion Dial Stepped Terrace Garden', zone: 'zone2.companion', x0: -245, z0: -905, x1: -135, z1: -795, style: 'terrace',   species: ['birch', 'wattle', 'mistpalm'] },
      { id: 'park.twoday_grove',       name: 'Alabaster Sibyl Cloister Grove',        zone: 'zone4.twoday',    x0: -895, z0: -895, x1: -785, z1: -785, style: 'cloister',  species: ['paperbark', 'birch', 'treefern'] },
      { id: 'park.scholars_garden',    name: 'Order and Thirteen Concordance Garden', zone: 'zone6.thirteen',  x0: 238,  z0: 472,  x1: 362,  z1: 584,  style: 'cloister',  species: ['ginkgo', 'needlecypress', 'wattle'] }
    ];

    function inParkKeepout(x, z, r) {
      var pad = (r == null ? 0 : r) + 2.5;
      for (var pi = 0; pi < PARKS.length; pi++) {
        var pk = PARKS[pi];
        if (x > pk.x0 - pad && x < pk.x1 + pad && z > pk.z0 - pad && z < pk.z1 + pad) return true;
      }
      var kList = G.kulamBasins || [];
      for (var ki = 0; ki < kList.length; ki++) {
        var kb = kList[ki];
        var kw = kb.w * 0.5 + pad + 4.0, kd = kb.d * 0.5 + pad + 4.0;
        if (Math.abs(x - kb.x) < kw && Math.abs(z - kb.z) < kd) return true;
      }
      return false;
    }

    function inWallKeepout(x, z, r) {
      var pad = (r == null ? 0 : r) + 10.5;
      for (var i = 0; i < WALL_RING.length; i++) {
        var wl = WALL_RING[i];
        if (ptSegDist(x, z, wl.x0, wl.z0, wl.x1, wl.z1) < pad) return true;
      }
      return false;
    }

    function makeRecord(id, zone, key, x, z, ry, extra) {
      var D = DIMS[key];
      if (!D) throw new Error('JJ_LAYOUT: unknown building key ' + key);
      var sc = extra && extra.scale != null ? extra.scale : 1;
      var w = r2(D.w * sc), d = r2(D.d * sc), h = r2(D.h * sc);
      var rec = {
        id: id,
        zone: zone,
        key: key,
        kit: D.kit,
        cls: extra && extra.cls ? extra.cls : (D.cls || 'building'),
        culture: extra && extra.culture ? extra.culture : D.culture,
        style: extra && extra.style ? extra.style : (D.style || null),
        state: extra && extra.state ? extra.state : (D.state || null),
        wealth: extra && extra.wealth !== undefined ? extra.wealth : D.wealth,
        types: (extra && extra.types ? extra.types : D.types).slice(),
        job: extra && extra.job !== undefined ? extra.job : (D.job || null),
        propulsion: D.propulsion || null,
        hull: D.hull || null,
        lit: extra && extra.lit !== undefined ? !!extra.lit : !!D.lit,
        electric: !!(extra && extra.electric !== undefined ? extra.electric : D.electric),
        x: r2(x),
        z: r2(z),
        y: 0,
        ry: r4(ry),
        w: w,
        d: d,
        h: h,
        scale: r4(sc),
        area: r2(w * d),
        pop: extra && extra.pop != null ? extra.pop : D.pop,
        v: extra && extra.v != null ? extra.v : (KRAND.hash(WORLD_SEED, id) % 3),
        district: extra && extra.district ? extra.district : zone,
        name: extra && extra.name ? extra.name : null,
        landmark: !!(extra && extra.landmark),
        concentricPair: extra && extra.concentricPair ? extra.concentricPair : null,
        construct: extra && extra.construct ? extra.construct : null
      };
      if (rec.cls !== 'building') rec.area = 0;
      rec.y = extra && extra.yFixed != null ? r2(extra.yFixed) : padElevation(rec);
      return rec;
    }

    function canStand(rec, gap) {
      if (rec.cls === 'building' && rec.y < G.lakeY + 0.4) return false;
      if (rec.id !== 'lm.temple_sun' && inSolsticeCorridor(rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.5)) return false;
      if (!rec.landmark && inCanalKeepout(rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.45)) return false;
      if (!rec.landmark && rec.cls === 'building') {
        if (inParkKeepout(rec.x, rec.z, Math.max(rec.w, rec.d) * 0.48)) return false;
        if (inWallKeepout(rec.x, rec.z, Math.max(rec.w, rec.d) * 0.45)) return false;
        if (inWayKeepout(rec.x, rec.z, Math.min(rec.w, rec.d) * 0.44)) return false;
      }
      var g = gap == null ? 1.4 : gap;
      var rad = Math.hypot(rec.w, rec.d) * 0.5 + g + 68;
      return !space.some(rec.x, rec.z, rad, function (other) {
        return boxesOverlap(rec, other, g);
      });
    }

    function commitStruct(rec, gap) {
      if (!canStand(rec, gap)) return null;
      space.insert(rec, rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.5);
      structures.push(rec);
      if (byZone[rec.zone]) byZone[rec.zone].push(rec);
      return rec;
    }

    /* ================================================================
     * A. CEREMONIAL TREE-BOULEVARDS (w=20..22 m ROW), STREETS & HIGHWAYS
     * ================================================================ */
    ways.push(
      /* Wide Tree-Lined Ceremonial Boulevards (w=20..22 m so avenue trees have full crown clearance from facades!) */
      { id: 'ave.sunray_lotus',     cls: 'avenue', treeAve: true, w: 21, pts: [[60, 949], [0, 380], [0, 105], [-35, -45], [-320, -760], [-680, -1580], [-680, -1664]] },
      { id: 'ave.quayside_wharf',   cls: 'avenue', treeAve: false,w: 20, pts: [[-935, -1662], [-775, -1662], [-680, -1662], [-585, -1662], [-485, -1658]] },
      { id: 'ave.harbour_customs',  cls: 'avenue', treeAve: true, w: 18, pts: [[-920, -1604], [-680, -1604], [-485, -1604]] },
      { id: 'ave.solstice_spine',   cls: 'avenue', treeAve: true, w: 20, pts: [[-820, -80], [-420, -40], [-35, -40], [380, -280], [680, -560], [1060, -180], [1380, 80]] },
      { id: 'ave.moon_ring_north',  cls: 'avenue', treeAve: false,w: 13, pts: [[-1230, -840], [-960, -840], [-80, -860], [680, -560], [1060, -180]] },
      { id: 'ave.moon_ring_south',  cls: 'avenue', treeAve: true, w: 19, pts: [[-1253, 420], [-760, 560], [160, 560], [860, 740], [1140, 860]] },
      { id: 'ave.whitepass_link',   cls: 'avenue', treeAve: true, w: 19, pts: [[380, -1437], [340, -1240], [-80, -860], [0, -220]] },
      { id: 'ave.harbour_promenade',cls: 'avenue', treeAve: true, w: 20, pts: [[-1060, -1546], [-680, -1546], [-160, -1546], [380, -1404], [805, -1290]] },
      { id: 'ave.pomoerium_south',  cls: 'main',   treeAve: false,w: 9,  pts: [[-1230, 892], [60, 922], [540, 932], [1065, 932], [1350, 545]] },
      { id: 'ave.pomoerium_west',   cls: 'main',   treeAve: false,w: 9,  pts: [[-1230, 892], [-1212, -1208], [-1060, -1546]] },
      { id: 'ave.pomoerium_east',   cls: 'main',   treeAve: false,w: 9,  pts: [[805, -1290], [1350, -745], [1350, 545]] },
      { id: 'st.izani.factor_row',  cls: 'avenue', treeAve: true, w: 18, pts: [[560, 665], [860, 665], [1260, 665]] },
      { id: 'st.pilgrim.market',    cls: 'avenue', treeAve: true, w: 18, pts: [[-520, 1060], [60, 1060], [920, 1060]] },

      /* Overland Trunk Highways (Cut South, Serai/Ardent East, White-Pass/Veladiga North, Headland West) */
      { id: 'hwy.cut_dilihan',      cls: 'highway', w: 11, pts: [[60, 949], [60, 1520], [-40, 2240]] },
      { id: 'hwy.whitepass_north',  cls: 'highway', w: 10, pts: [[380, -1437], [520, -1950], [720, -2420]] },
      { id: 'hwy.serai_ardent_east',cls: 'highway', w: 10, pts: [[1380, 80], [1920, 150], [2540, 210]] },
      { id: 'hwy.vellai_west',      cls: 'highway', w: 9,  pts: [[-1253, 420], [-1820, 620], [-2480, 820]] },
      { id: 'lane.handu.sw',        cls: 'lane',    w: 6.5,pts: [[-520, 1060], [-1380, 1420], [-1960, 980]] },
      { id: 'lane.handu.se',        cls: 'lane',    w: 6.5,pts: [[920, 1060], [1840, 1180], [2040, -280], [1680, -1380]] }
    );

    /* ================================================================
     * B. THE 23 MONUMENTAL CELESTIAL, ROYAL & HISTORICAL LANDMARKS
     * ================================================================ */
    var PAL_RY = azToRy(336.0);
    var PAL_X = 0.0, PAL_Z = 40.0;
    var PLAZA_X = r2(PAL_X + 85.0 * Math.sin(PAL_RY));
    var PLAZA_Z = r2(PAL_Z + 85.0 * Math.cos(PAL_RY));

    commitStruct(makeRecord('lm.palace', 'zone1.sun', 'jj_palace', PAL_X, PAL_Z, PAL_RY, {
      name: 'Rajas Palace (Suriya-Kovil Aranmanai)', landmark: true, yFixed: 9.8, concentricPair: 'lm.palace_plaza'
    }), 0);
    commitStruct(makeRecord('lm.palace_plaza', 'zone1.sun', 'jj_palace_plaza', PLAZA_X, PLAZA_Z, PAL_RY, {
      name: 'Great Sunray Plaza (16-Ray Darbar Deck)', landmark: true, yFixed: 9.8, concentricPair: 'lm.palace'
    }), 0);

    var sunTemple = commitStruct(makeRecord('lm.temple_sun', 'zone1.sun', 'jj_temple_sun', TEMPLE_X, TEMPLE_Z, TEMPLE_RY, {
      name: 'Great Solstice Temple of the Sun', landmark: true, yFixed: 27.8
    }), 0);

    commitStruct(makeRecord('lm.rajas_eye', 'zone1.sun', 'jj_rajas_eye', -860.0, -340.0, azToRy(70.50), {
      name: 'The Rajas Eye Observatory Pavilion', landmark: true, yFixed: 31.8, electric: true
    }), 1.0);

    /* Four Rival Kauntavan Calendar Schools & Royal Library around the Solar Acropolis */
    commitStruct(makeRecord('lm.school_eye', 'zone1.sun', 'jj_school', -650.0, -160.0, Math.PI, {
      name: 'College of the Eye (Direct Sighting School)', landmark: true, yFixed: 27.8
    }), 1.2);
    commitStruct(makeRecord('lm.school_hand', 'zone1.sun', 'jj_school', -650.0, -40.0, 0, {
      name: 'College of the Hidden Hand (Perturbation School)', landmark: true, yFixed: 27.8
    }), 1.2);
    commitStruct(makeRecord('lm.school_outside', 'zone1.sun', 'jj_school', -730.0, -205.0, 0, {
      name: 'College of the Outside (Day-Outside Liturgists)', landmark: true, yFixed: 27.8
    }), 1.2);
    commitStruct(makeRecord('lm.school_eightyone', 'zone1.sun', 'jj_school', -730.0, 45.0, Math.PI, {
      name: 'Shuttered Annex of the Eighty-One', landmark: true, yFixed: 27.8, lit: false
    }), 1.2);
    commitStruct(makeRecord('lm.royal_library', 'zone1.sun', 'jj_library', -560.0, -100.0, -Math.PI * 0.5, {
      name: 'Royal Ephemeris & Concordance Library', landmark: true
    }), 1.2);

    /* All Six Astrologically Aligned Moon Temples (compacted onto dense urban benches) */
    commitStruct(makeRecord('lm.temple_week', 'zone5.week', 'jj_temple_week', -760.0, 560.0, azToRy(270.0), {
      name: 'Two-Faced Temple of the Week (Vikku-Kovil)', landmark: true, yFixed: 17.8
    }), 1.2);
    commitStruct(makeRecord('lm.temple_thirteen', 'zone6.thirteen', 'jj_temple_thirteen', 160.0, 560.0, azToRy(90.0), {
      name: 'Thirteen-Tier Temple of the Thirteen (Tartin-Metu)', landmark: true, yFixed: 23.8
    }), 1.2);
    commitStruct(makeRecord('lm.temple_companion', 'zone2.companion', 'jj_temple_companion', -80.0, -860.0, azToRy(353.30), {
      name: 'Octagonal Dial-Temple of Companion (Tunai-Mandapam)', landmark: true, yFixed: -10.2
    }), 1.2);
    commitStruct(makeRecord('lm.temple_day', 'zone8.day', 'jj_temple_day', 1060.0, -180.0, azToRy(70.50), {
      name: 'Pendulum Fan-Temple of Day (Pakal-Vasal)', landmark: true, yFixed: 9.8
    }), 1.2);
    commitStruct(makeRecord('lm.temple_twoday', 'zone4.twoday', 'jj_temple_twoday', -960.0, -840.0, azToRy(70.50), {
      name: 'Alabaster Occultation-Temple of Two-Day (Marai-Kovil)', landmark: true, yFixed: -4.2
    }), 1.2);
    commitStruct(makeRecord('lm.temple_fourday', 'zone7.fourday', 'jj_temple_fourday', 680.0, -560.0, azToRy(0.0), {
      name: 'Four-Basin Lotus-Tank Temple of Four-Day (Nalu-Kulam)', landmark: true, yFixed: -4.2
    }), 1.2);

    /* All Five Planetary Shrines + Uncounted Wanderer Circle */
    commitStruct(makeRecord('lm.shrine_veil', 'zone5.week', 'jj_shrine_veil', -1060.0, 440.0, azToRy(294.04), {
      name: 'Chapel of Veil (Velli-Mandapam)', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.shrine_crown', 'zone1.sun', 'jj_shrine_crown', 155.0, -155.0, Math.PI, {
      name: 'Royal Shrine of Crown (Karaunu-Kovil)', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.shrine_rust_cinder', 'zone8.day', 'jj_shrine_rust_cinder', 1180.0, 180.0, Math.PI, {
      name: 'Twin-Dome Shrine of Rust and Cinder', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.shrine_ash', 'zone8.day', 'jj_shrine_ash', 1240.0, 380.0, azToRy(270.0), {
      name: 'Clinker Twilight Cell of Ash', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.shrine_frost', 'zone6.thirteen', 'jj_shrine_frost', 380.0, 740.0, Math.PI, {
      name: 'Long-Reckoner Pavilion of Frost', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.shrine_wanderer', 'zone9.izani', 'jj_shrine_wanderer', 960.0, 780.0, azToRy(194.04), {
      name: 'Uncounted Open-Air Circle of the Wanderer', landmark: true
    }), 1.2);

    /* Historical, Scholarly, Military & Caravan Landmarks */
    commitStruct(makeRecord('lm.izani_gov_ruin', 'zone9.izani', 'jj_izani_gov_ruin', 860.0, 740.0, azToRy(336.0), {
      name: 'Decayed Izani Governors House (Sidkin-Palu)', landmark: true, yFixed: 37.8, electric: true
    }), 1.2);
    commitStruct(makeRecord('lm.order_chapterhouse', 'zone6.thirteen', 'jj_order_chapterhouse', 420.0, 520.0, azToRy(270.0), {
      name: 'Order of Historians Small Chapterhouse', landmark: true, yFixed: 25.8, electric: true
    }), 1.2);
    commitStruct(makeRecord('lm.fortress_crest', 'zone9.izani', 'jj_fortress', 1140.0, 860.0, Math.PI, {
      name: 'South Crest Citadel (Old Izani Castra Plinth)', landmark: true, yFixed: 49.8
    }), 1.2);
    commitStruct(makeRecord('lm.amphitheater', 'zone6.thirteen', 'jj_amphitheater', -180.0, 780.0, PAL_RY, {
      name: 'Lake-Vista Slope Amphitheater', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.caravanserai_cut', 'zone10.pilgrim_gates', 'jj_caravanserai', 175.0, 1045.0, azToRy(270.0), {
      name: 'Great Cut-Gate Caravanserai', landmark: true, yFixed: 40.2
    }), 1.2);
    commitStruct(makeRecord('lm.pilgrim_market_hall', 'zone10.pilgrim_gates', 'jj_market_hall', -160.0, 1060.0, Math.PI, {
      name: 'Great Pilgrims Market Central Chowk', landmark: true, yFixed: 40.2
    }), 1.2);
    commitStruct(makeRecord('lm.whitepass_compound', 'zone3.giant', 'jj_whitepass_compound', 340.0, -1380.0, azToRy(12.0), {
      name: 'White-Pass Trans-Rim Factor Compound (Yeti, Yonni and Rian Khan)', landmark: true, yFixed: -24.2
    }), 1.2);

    /* Civic Anchors in Sun, Companion & Giant Wards */
    commitStruct(makeRecord('lm.guild_three_wheels', 'zone1.sun', 'jj_guild_hall', 95.0, 145.0, -Math.PI * 0.5, {
      name: 'Hall of the Three Wheels and Merchant Guilds', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.court_sun', 'zone1.sun', 'jj_court', -148.0, 52.0, Math.PI * 0.5, {
      name: 'High Court of the Handu and Solar Standards', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.court_week', 'zone5.week', 'jj_court', -630.0, 445.0, Math.PI, {
      name: 'Two-Hemisphere High Docket Court of Week', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.republic_legation', 'zone1.sun', 'jj_almanac_press', -152.0, -48.0, Math.PI * 0.5, {
      name: 'Iron Republic Astronomers Guild Legation', culture: 'republican', landmark: true, electric: true
    }), 1.2);
    commitStruct(makeRecord('lm.sarraf_central', 'zone2.companion', 'jj_money_changer', 55.0, -760.0, Math.PI, {
      name: 'Central Sarraf Talent and Bullion Exchange', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.eternian_hostel', 'zone2.companion', 'jj_inn', -210.0, -980.0, 0, {
      name: 'Regulated Eternian Six-Ministries Hostel', culture: 'eternian', landmark: true
    }), 1.2);
    commitStruct(makeRecord('lm.royal_barracks', 'zone1.sun', 'jj_barracks', 205.0, 165.0, Math.PI, {
      name: 'Royal Gnomon Guard Barracks'
    }), 1.2);

    /* ================================================================
     * C. BUSTLING NNW LOTUS HARBOUR: BREAKWATER MOLES, SLEWING CRANES,
     *    QUAYS, STRAND BAZAAR, 15 LAKE BARGES & 16 HARBOUR SKIFFS (P2)
     * ================================================================ */
    var QUAY_Y = r2(G.lakeY + 2.22);
    commitStruct(makeRecord('harb.quay.west',   'zone3.giant', 'jj_barge_quay', -785.0, -1682.0, Math.PI, {
      name: 'West Bulk Alabaster & Timber Wharf', landmark: true, yFixed: QUAY_Y, electric: true
    }), 1.0);
    commitStruct(makeRecord('harb.quay.centre', 'zone3.giant', 'jj_barge_quay', -680.0, -1682.0, Math.PI, {
      name: 'Lotus Water-Gate Eternian & Serai Wharf', yFixed: QUAY_Y, electric: true
    }), 1.0);
    commitStruct(makeRecord('harb.quay.east',   'zone3.giant', 'jj_barge_quay', -558.0, -1682.0, Math.PI, {
      name: 'Barada-Quay Silica & Soda-Ash Wharf', yFixed: QUAY_Y, electric: true
    }), 1.0);
    /* West & East Breakwater Mole Head Wharves & Electric Leading-Beacon */
    commitStruct(makeRecord('harb.mole.west_beacon', 'zone3.giant', 'jj_barge_quay', -855.0, -1818.0, 0, {
      name: 'West Breakwater Mole Electric Leading-Beacon & Berth', landmark: true, yFixed: QUAY_Y, electric: true
    }), 0.8);
    commitStruct(makeRecord('harb.mole.west_shed',   'zone3.giant', 'jj_warehouse_a', -922.0, -1738.0, Math.PI * 0.5, {
      name: 'West Mole Bonded Transit Shed', yFixed: QUAY_Y + 0.12
    }), 0.8);
    commitStruct(makeRecord('harb.mole.east_watch',  'zone3.giant', 'jj_fish_quay',   -488.0, -1748.0, -Math.PI * 0.5, {
      name: 'East Breakwater Mole Watch & Salt-Curing Pier', yFixed: QUAY_Y + 0.12
    }), 0.8);

    /* Five 25-Ton Quay Slewing Cranes along the Quayside Edge & West Mole (landmark: true so they sit on the paved wharf apron!) */
    var CRANE_SPOTS = [
      [-824.0, -1665.0, Math.PI],
      [-734.0, -1665.0, Math.PI],
      [-636.0, -1665.0, Math.PI],
      [-516.0, -1665.0, Math.PI],
      [-898.0, -1796.0, Math.PI * 0.5]
    ];
    for (var cri = 0; cri < CRANE_SPOTS.length; cri++) {
      var cs = CRANE_SPOTS[cri];
      commitStruct(makeRecord('harb.crane.' + cri, 'zone3.giant', 'jj_dock_crane', cs[0], cs[1], cs[2], {
        name: 'Lotus Harbour 25t Quay Slewing Crane ' + (cri + 1), landmark: true, yFixed: QUAY_Y + 0.08
      }), 0.6);
    }

    /* Waterfront Customs, Boatyards, Godowns & Bustling Strand Bazaar Row (leaving x=-610 canal & x=-680 gate clear!) */
    commitStruct(makeRecord('harb.customs',     'zone3.giant', 'jj_customs_house', -680.0, -1632.0, Math.PI, {
      name: 'Great Trough Lake Harbour Assay Customs', landmark: true
    }), 1.0);
    commitStruct(makeRecord('harb.boatyard.1',  'zone3.giant', 'jj_boatyard', -868.0, -1665.0, Math.PI, { yFixed: QUAY_Y }), 0.8);
    commitStruct(makeRecord('harb.fishquay.1',  'zone3.giant', 'jj_fish_quay', -492.0, -1668.0, Math.PI, { yFixed: QUAY_Y }), 0.8);
    commitStruct(makeRecord('harb.fishquay.2',  'zone3.giant', 'jj_fish_quay', -922.0, -1652.0, Math.PI, { yFixed: QUAY_Y + 0.6 }), 0.8);
    commitStruct(makeRecord('harb.warehouse.1', 'zone3.giant', 'jj_warehouse_a', -785.0, -1626.0, Math.PI, {}), 1.0);
    commitStruct(makeRecord('harb.warehouse.2', 'zone3.giant', 'jj_warehouse_b', -558.0, -1626.0, Math.PI, {}), 1.0);
    commitStruct(makeRecord('harb.strand.mkt',  'zone3.giant', 'jj_market_hall', -842.0, -1624.0, Math.PI, {
      name: 'Lotus Strand Fish & Spice Chowk'
    }), 1.0);
    commitStruct(makeRecord('harb.strand.tav',  'zone3.giant', 'jj_tavern',      -734.0, -1626.0, Math.PI, {}), 1.0);
    commitStruct(makeRecord('harb.strand.spice','zone3.giant', 'jj_shop_spice',  -642.0, -1626.0, Math.PI, {}), 1.0);
    commitStruct(makeRecord('harb.strand.dil',  'zone3.giant', 'dil_customs_loggia', -518.0, -1624.0, Math.PI, {}), 1.0);
    commitStruct(makeRecord('harb.carters',     'zone3.giant', 'jj_carter_corral', -476.0, -1616.0, Math.PI, {}), 1.0);

    /* 15 Standalone 25t Great Trough Lake Barges + 16 Harbour Fishing/Ferry Skiffs afloat on +429.78 m ASL */
    var BARGE_SPOTS = [
      [-808, -1706, Math.PI * 0.5, 'Vellai-Kal Alabaster Block Barge'],
      [-762, -1708, Math.PI * 0.5, 'Palewharf Porcelain & Lacquer Barge'],
      [-654, -1706, Math.PI * 0.5, 'Eternian Six-Ministries Pilgrim Barge'],
      [-578, -1706, Math.PI * 0.5, 'Barada-Quay White Silica Sand Barge'],
      [-534, -1708, Math.PI * 0.5, 'Serai Soda-Ash & Salt Lighter'],
      [-888, -1748, 0.05,          'West-Mole Timber Raft Barge'],
      [-832, -1788, -Math.PI * 0.5,'Mole-Head Anchored Cargo Packet'],
      [-512, -1748, -0.10,         'East-Mole Cured-Fish Coaster'],
      [-740, -1752, 0.35,          'Palewharf Timber & Tea Barge'],
      [-645, -1768, -0.25,         'Serai Pilgrim Charter Barge'],
      [-560, -1754, 1.42,          'Barada-Quay Glass-Cullet Barge'],
      [-795, -1815, 0.85,          'Vellai-Kal Lime & Gypsum Lighter'],
      [-695, -1845, -0.55,         'Hykkousoi Tide-Clergy Barge'],
      [-615, -1885, 0.18,          'Inbound Great Trough Grain Barge'],
      [-430, -1950, 1.15,          'Cinna-Aru Copper-Ore Packet']
    ];
    for (var bgi = 0; bgi < BARGE_SPOTS.length; bgi++) {
      var bs = BARGE_SPOTS[bgi];
      commitStruct(makeRecord('vessel.barge.' + bgi, 'zone3.giant', 'jj_lake_barge', bs[0], bs[1], bs[2], {
        name: bs[3], yFixed: G.lakeY, v: bgi % 2
      }), 0.8);
    }

    var SKIFF_SPOTS = [
      [-722, -1684, 0.25], [-708, -1686, -0.15], [-696, -1684, 0.40], /* Moored at Stepped Ferry Ghat! */
      [-852, -1684, 1.45], [-836, -1688, 1.65],  [-504, -1685, -1.45],
      [-598, -1732, 0.12], [-624, -1742, -0.08], /* Gliding out from the Canal Mouth! */
      [-768, -1734, 0.95], [-712, -1728, -0.65], [-668, -1736, 0.52],
      [-545, -1735, -1.10],[-876, -1712, 0.30],  [-518, -1718, -0.35],
      [-748, -1788, -0.22],[-638, -1812, 0.78]
    ];
    for (var ski = 0; ski < SKIFF_SPOTS.length; ski++) {
      var sk = SKIFF_SPOTS[ski];
      commitStruct(makeRecord('vessel.skiff.' + ski, 'zone3.giant', 'jj_harbour_skiff', sk[0], sk[1], sk[2], {
        name: 'Lotus Cove Ferry & Fishing Skiff ' + (ski + 1), yFixed: G.lakeY, v: ski % 2
      }), 0.6);
    }

    /* ================================================================
     * D. CONTINUOUS, GAPLESS CIRCUIT WALL WITH REAL WATER-GATE PORTALS
     *    (jj_wall_* + jj_wall_watergate + dil_wall_*; 12 m segments tiled at <=11.6 m!)
     * ================================================================ */
    function addWallSpan(prefix, zone, x0, z0, ux, uz, outRy, ia, ib, segKey, twrKey, tagIdx) {
      var span = ib - ia;
      if (span <= 0.5) return;
      var nSeg = Math.max(1, Math.ceil(span / 11.6));
      var ds = span / nSeg;
      for (var m = 0; m < nSeg; m++) {
        var sm = ia + (m + 0.5) * ds;
        walls.push(makeRecord(prefix + '.s' + tagIdx + '.' + m, zone, segKey, x0 + ux * sm, z0 + uz * sm, outRy, {}));
        if (m > 0 && m % 6 === 0) {
          var sj = ia + m * ds;
          walls.push(makeRecord(prefix + '.t' + tagIdx + '.' + m, zone, twrKey, x0 + ux * sj, z0 + uz * sj, outRy, {}));
        }
      }
    }

    function addWallLeg(prefix, zone, x0, z0, x1, z1, useDil, portalsSpec) {
      var dx = x1 - x0, dz = z1 - z0;
      var L = Math.hypot(dx, dz);
      var ux = dx / L, uz = dz / L;
      var outRy = Math.atan2(uz, -ux);
      var segKey = useDil ? 'dil_wall_seg' : 'jj_wall_seg';
      var twrKey = useDil ? 'dil_wall_tower' : 'jj_wall_tower';
      var corKey = useDil ? 'dil_wall_corner' : 'jj_wall_corner';
      var gatKey = useDil ? 'dil_wall_gate' : 'jj_wall_gate';

      walls.push(makeRecord(prefix + '.corner', zone, corKey, x0, z0, outRy, {}));

      var pList = [];
      if (Array.isArray(portalsSpec)) pList = portalsSpec.slice();
      else if (portalsSpec) pList = [portalsSpec];

      if (pList.length) {
        var sorted = pList.map(function (gs) {
          var s = (gs.x - x0) * ux + (gs.z - z0) * uz;
          return { spec: gs, s: Math.max(24.0, Math.min(L - 24.0, s)) };
        }).sort(function (a, b) { return a.s - b.s; });

        var cursor = 3.4;
        for (var pi = 0; pi < sorted.length; pi++) {
          var item = sorted[pi];
          var gs = item.spec;
          var gx = x0 + ux * item.s, gz = z0 + uz * item.s;
          var isWater = gs.kind === 'watergate';
          var pKey = isWater ? 'jj_wall_watergate' : gatKey;
          var extra = { name: gs.name, landmark: true };
          if (isWater) extra.yFixed = r2(G.shapedNoCanal(gx, gz) - 0.15);
          walls.push(makeRecord(gs.id, zone, pKey, gx, gz, outRy, extra));
          addWallSpan(prefix, zone, x0, z0, ux, uz, outRy, cursor, item.s - 11.4, segKey, twrKey, String.fromCharCode(97 + pi));
          cursor = item.s + 11.4;
        }
        addWallSpan(prefix, zone, x0, z0, ux, uz, outRy, cursor, L - 3.4, segKey, twrKey, String.fromCharCode(97 + sorted.length));
      } else {
        addWallSpan(prefix, zone, x0, z0, ux, uz, outRy, 3.4, L - 3.4, segKey, twrKey, 'a');
      }
    }

    for (var wri = 0; wri < WALL_RING.length; wri++) {
      var wl = WALL_RING[wri];
      addWallLeg(wl.p, wl.z, wl.x0, wl.z0, wl.x1, wl.z1, wl.dil, wl.portals || wl.gate);
    }

    /* ================================================================
     * E. DETERMINISTIC URBAN STREET-FRONTAGE & COURTYARD BLOCK INFILL
     *    Covers all 18 housing varieties, all 29 trade/economy works, and
     *    explicit Dilihan (dil_*) + Iziz Vernacular (vern_*) mixing!
     * ================================================================ */
    var POOLS = {
      sun_noble: [
        'jj_house_rich_a', 'jj_house_rich_b', 'jj_house_rich_c', 'jj_house_rich_d', 'jj_house_rich_e', 'jj_house_rich_f',
        'jj_house_mid_d', 'jj_house_mid_f', 'jj_shop_jeweler', 'jj_money_changer', 'jj_almanac_press', 'jj_tailor_cobbler'
      ],
      companion_civic: [
        'jj_house_mid_a', 'jj_house_mid_b', 'jj_house_mid_c', 'jj_house_mid_d', 'jj_house_mid_f',
        'jj_house_rich_b', 'jj_house_rich_e', 'jj_money_changer', 'jj_shop_general', 'jj_shop_spice',
        'jj_shop_food', 'jj_inn', 'jj_tavern', 'jj_guild_hall', 'jj_bathhouse'
      ],
      giant_waterfront: [
        'jj_house_poor_a', 'jj_house_poor_b', 'jj_house_poor_d', 'jj_house_poor_e',
        'jj_house_mid_b', 'jj_house_mid_c', 'jj_warehouse_a', 'jj_warehouse_b', 'jj_inn', 'jj_tavern',
        'jj_shop_food', 'jj_butcher', 'jj_brewhouse', 'jj_timber_yard', 'jj_carter_corral', 'jj_customs_house'
      ],
      twoday_alabaster: [
        'jj_house_mid_e', 'jj_house_mid_e', 'jj_house_mid_a', 'jj_house_mid_d',
        'jj_house_rich_b', 'jj_house_rich_d', 'jj_house_poor_d', 'jj_shop_alchemy',
        'jj_shop_textiles', 'jj_healing_house', 'jj_bathhouse', 'jj_oil_press'
      ],
      week_law_mansions: [
        'jj_house_rich_a', 'jj_house_rich_c', 'jj_house_rich_d', 'jj_house_rich_e', 'jj_house_rich_f',
        'jj_house_mid_c', 'jj_house_mid_d', 'jj_house_mid_f', 'jj_money_changer', 'jj_guild_hall',
        'jj_shop_jeweler', 'jj_tailor_cobbler', 'jj_shop_spice', 'jj_market_hall', 'jj_funerary_ghat'
      ],
      thirteen_almanac: [
        'jj_almanac_press', 'jj_almanac_press', 'jj_house_mid_a', 'jj_house_mid_c', 'jj_house_mid_d', 'jj_house_mid_f',
        'jj_house_poor_d', 'jj_house_poor_e', 'jj_inn', 'jj_tavern', 'jj_shop_general', 'jj_shop_food',
        'jj_tailor_cobbler', 'jj_oil_press', 'dil_house_mid_courtyard', 'vern_scribe'
      ],
      fourday_humoral: [
        'jj_weaver_dyer', 'jj_weaver_dyer', 'jj_bathhouse', 'jj_healing_house', 'jj_tailor_cobbler',
        'jj_house_rich_d', 'jj_house_mid_d', 'jj_house_mid_e', 'jj_house_poor_d', 'jj_house_poor_c',
        'jj_shop_textiles', 'jj_shop_alchemy', 'jj_shop_spice', 'jj_butcher', 'jj_oil_press', 'jj_orchard'
      ],
      day_kilns: [
        'jj_brick_kiln', 'jj_brick_kiln', 'jj_pottery', 'jj_glassworks', 'jj_smithy_brass', 'jj_gypsum_works',
        'jj_masons_yard', 'jj_tannery', 'jj_brewhouse', 'jj_timber_yard', 'jj_saltpeter_ery',
        'jj_house_poor_a', 'jj_house_poor_b', 'jj_house_poor_c', 'jj_house_poor_e', 'jj_house_poor_f',
        'jj_house_mid_b', 'jj_shop_weapons', 'jj_shop_armor', 'jj_shop_food', 'dil_smithy_monitor'
      ],
      /* Former Izani Enclave & Dilihan Factor Row (~45% dil_* & vern_* mixed with Jimjam brick!) */
      izani_dilihan_mix: [
        'dil_house_mid_courtyard', 'dil_house_mid_veranda', 'dil_tenement_windwell', 'dil_villa_impluvium',
        'dil_manor_breezeway', 'dil_shop_arcade', 'dil_godown_ventilated', 'dil_customs_loggia',
        'dil_cooling_baths', 'dil_weaver_dyecourt', 'vern_house_mid_a', 'vern_house_mid_b',
        'vern_house_rich_a', 'vern_scribe', 'vern_apothecary', 'vern_guard_tower',
        'jj_house_mid_c', 'jj_house_mid_d', 'jj_house_poor_d', 'jj_house_poor_e',
        'jj_almanac_press', 'jj_masons_yard', 'jj_tavern', 'jj_shop_general', 'jj_carter_corral'
      ],
      /* South Cut-Gate Suburb & Pilgrim Market Approaches (~20% dil_* / vern_* caravan mix) */
      pilgrim_gate_mix: [
        'jj_inn', 'jj_tavern', 'jj_shop_food', 'jj_shop_general', 'jj_shop_spice', 'jj_butcher',
        'jj_tailor_cobbler', 'jj_money_changer', 'jj_carter_corral', 'jj_warehouse_a',
        'jj_house_mid_c', 'jj_house_poor_d', 'jj_house_poor_f',
        'dil_inn_courtyard', 'dil_tavern_pergola', 'dil_bazaar_pavilion', 'dil_bakery_breezeway',
        'dil_house_poor_dogtrot', 'dil_house_poor_yard', 'vern_provisioner', 'vern_house_poor_a'
      ]
    };

    var BLOCK_SECTORS = [
      { id: 'sec.giant.w',   zone: 'zone3.giant',         pool: 'giant_waterfront', x0: -1190, z0: -1535, x1: -20,  z1: -1230, pitchZ: 54, pitchX: 138 },
      { id: 'sec.giant.e',   zone: 'zone3.giant',         pool: 'giant_waterfront', x0: 20,    z0: -1485, x1: 960,  z1: -1200, pitchZ: 54, pitchX: 138 },
      { id: 'sec.twoday.n',  zone: 'zone4.twoday',        pool: 'twoday_alabaster', x0: -1215, z0: -1210, x1: -535, z1: -430,  pitchZ: 56, pitchX: 142 },
      { id: 'sec.twoday.s',  zone: 'zone4.twoday',        pool: 'twoday_alabaster', x0: -1215, z0: -415,  x1: -955, z1: -120,  pitchZ: 56, pitchX: 136 },
      { id: 'sec.acro.n',    zone: 'zone1.sun',           pool: 'sun_noble',        x0: -935,  z0: -420,  x1: -595, z1: -245,  pitchZ: 54, pitchX: 142 },
      { id: 'sec.acro.s',    zone: 'zone5.week',          pool: 'week_law_mansions',x0: -1215, z0: 85,    x1: -595, z1: 375,   pitchZ: 56, pitchX: 148 },
      { id: 'sec.comp',      zone: 'zone2.companion',     pool: 'companion_civic',  x0: -515,  z0: -1210, x1: 385,  z1: -360,  pitchZ: 54, pitchX: 140 },
      { id: 'sec.sun.core',  zone: 'zone1.sun',           pool: 'sun_noble',        x0: -585,  z0: -345,  x1: 385,  z1: 365,   pitchZ: 56, pitchX: 148 },
      { id: 'sec.fourday',   zone: 'zone7.fourday',       pool: 'fourday_humoral',  x0: 405,   z0: -1185, x1: 945,  z1: 145,   pitchZ: 56, pitchX: 142 },
      { id: 'sec.day.n',     zone: 'zone8.day',           pool: 'day_kilns',        x0: 965,   z0: -1020, x1: 1345, z1: 145,   pitchZ: 56, pitchX: 138 },
      { id: 'sec.day.s',     zone: 'zone8.day',           pool: 'day_kilns',        x0: 615,   z0: 165,   x1: 1345, z1: 545,   pitchZ: 56, pitchX: 138 },
      { id: 'sec.week',      zone: 'zone5.week',          pool: 'week_law_mansions',x0: -1220, z0: 395,   x1: -355, z1: 885,   pitchZ: 58, pitchX: 150 },
      { id: 'sec.thirteen',  zone: 'zone6.thirteen',      pool: 'thirteen_almanac', x0: -335,  z0: 385,   x1: 595,  z1: 905,   pitchZ: 56, pitchX: 142 },
      { id: 'sec.izani',     zone: 'zone9.izani',         pool: 'izani_dilihan_mix',x0: 615,   z0: 565,   x1: 1340, z1: 925,   pitchZ: 50, pitchX: 128 },
      { id: 'sec.pilgrim.w', zone: 'zone10.pilgrim_gates',pool: 'pilgrim_gate_mix', x0: -510,  z0: 985,   x1: -325, z1: 1215,  pitchZ: 54, pitchX: 132, extraMural: true },
      { id: 'sec.pilgrim.e', zone: 'zone10.pilgrim_gates',pool: 'pilgrim_gate_mix', x0: 85,    z0: 985,   x1: 855,  z1: 1225,  pitchZ: 54, pitchX: 136, extraMural: true }
    ];

    function validSectorStreetPt(sec, x, z) {
      if (sec.extraMural) {
        if (wallSignedDist(x, z) > -14.0) return false;
      } else {
        if (wallSignedDist(x, z) < 14.0) return false;
      }
      if (inParkKeepout(x, z, 1.5)) return false;
      if (inSolsticeCorridor(x, z, 2.0)) return false;
      /* Keep residential street grids out of monumental Acropolis, Palace/Sunray, White-Pass & Pilgrim Market courts */
      if (x > -885 && x < -610 && z > -245 && z < 75) return false;
      if (x > -115 && x < 72 && z > -80 && z < 115) return false;
      if (x > 282 && x < 398 && z > -1435 && z < -1320) return false;
      if (x > -318 && x < -10 && z > 990 && z < 1135) return false;
      return true;
    }

    function pushClippedStreet(idPrefix, cls, wM, x0, z0, x1, z1, sec) {
      var len = Math.hypot(x1 - x0, z1 - z0);
      var steps = Math.max(2, Math.ceil(len / 12.0));
      var segPts = [];
      var segIdx = 0;
      for (var s = 0; s <= steps; s++) {
        var t = s / steps;
        var px = r2(x0 + (x1 - x0) * t);
        var pz = r2(z0 + (z1 - z0) * t);
        if (validSectorStreetPt(sec, px, pz)) {
          if (!segPts.length) segPts.push([px, pz]);
          else segPts[segPts.length - 1] = [px, pz];
          if (segPts.length === 1) segPts.push([px, pz]);
        } else {
          if (segPts.length >= 2 && Math.hypot(segPts[1][0] - segPts[0][0], segPts[1][1] - segPts[0][1]) >= 18.0) {
            ways.push({ id: idPrefix + '.' + (++segIdx), cls: cls, w: wM, pts: segPts });
          }
          segPts = [];
        }
      }
      if (segPts.length >= 2 && Math.hypot(segPts[1][0] - segPts[0][0], segPts[1][1] - segPts[0][1]) >= 18.0) {
        ways.push({ id: idPrefix + '.' + (++segIdx), cls: cls, w: wM, pts: segPts });
      }
    }

    /* Register clipped paved EW & NS urban block streets into L.ways (stopping cleanly at parks, courts & walls) */
    for (var bsi = 0; bsi < BLOCK_SECTORS.length; bsi++) {
      var bs0 = BLOCK_SECTORS[bsi];
      var rIdx0 = 0;
      for (var sz0 = bs0.z0; sz0 <= bs0.z1 + 2; sz0 += bs0.pitchZ) {
        pushClippedStreet(bs0.id + '.ew.' + (++rIdx0), 'side', 7.5, bs0.x0 - 8, sz0, bs0.x1 + 8, sz0, bs0);
      }
      var cIdx0 = 0;
      for (var sx0 = bs0.x0 + 42; sx0 <= bs0.x1 - 24; sx0 += bs0.pitchX) {
        pushClippedStreet(bs0.id + '.ns.' + (++cIdx0), 'side', 7.5, sx0, bs0.z0 - 8, sx0, bs0.z1 + 8, bs0);
      }
    }
    /* Paved market cross-aisles across the Great Pilgrim's Market fairground (-310..-20, 995..1130) */
    ways.push(
      { id: 'st.pilgrim.aisle.w', cls: 'side', w: 8.5, pts: [[-260, 992], [-260, 1128]] },
      { id: 'st.pilgrim.aisle.c', cls: 'main', w: 10.5,pts: [[-160, 988], [-160, 1132]] },
      { id: 'st.pilgrim.aisle.e', cls: 'side', w: 8.5, pts: [[-60,  992], [-60,  1128]] }
    );

    /* Continuous Double-Row Street-Frontage Cursor Packing:
       Packs buildings shoulder-to-shoulder (1.6-3.2 m side-alleys & party walls) directly fronting both sides
       of every paved EW block street, leaving stone-flagged interior courtyards instead of sparse empty fields! */
    var lotSeq = 0;
    for (var si = 0; si < BLOCK_SECTORS.length; si++) {
      var sec = BLOCK_SECTORS[si];
      var pool = POOLS[sec.pool];
      var stripIdx = 0;
      for (var bzStrip = sec.z0; bzStrip + sec.pitchZ <= sec.z1 + 8; bzStrip += sec.pitchZ) {
        stripIdx++;
        for (var rowSide = 0; rowSide < 2; rowSide++) {
          var cx = sec.x0;
          var slotIdx = 0;
          while (cx <= sec.x1 - 8) {
            slotIdx++;
            var hCell = KRAND.hash(WORLD_SEED, sec.id, stripIdx * 313 + rowSide * 97 + slotIdx);
            /* Narrow courtyard arch/alley opening every ~9th frontage lot */
            if ((hCell % 100) < 9) {
              cx += 6.5;
              continue;
            }
            var pick0 = KRAND.hash(hCell, 3) % pool.length;
            var placedThisSlot = null;
            for (var tryK = 0; tryK < 2 && !placedThisSlot; tryK++) {
              var bKey = pool[(pick0 + tryK * 5) % pool.length];
              var bd = DIMS[bKey];
              if (!bd) continue;
              var bx = cx + bd.w * 0.5;
              if (bx + bd.w * 0.5 > sec.x1 + 4) break;
              var bz = (rowSide === 0)
                ? (bzStrip + 5.4 + bd.d * 0.5)
                : (bzStrip + sec.pitchZ - 5.4 - bd.d * 0.5);
              var wMargin = Math.max(bd.w, bd.d) * 0.5 + 13.5;
              var wallOk = sec.extraMural
                ? (wallSignedDist(bx, bz) <= -wMargin)
                : (wallSignedDist(bx, bz) >= wMargin);
              if (!wallOk) continue;
              if (bx > -318 && bx < -10 && bz > 990 && bz < 1135) continue;

              var cardRy = (rowSide === 0) ? Math.PI : 0;
              var rec = makeRecord('lot.' + (++lotSeq), sec.zone, bKey, bx, bz, cardRy, {});
              placedThisSlot = commitStruct(rec, 1.25);
            }
            if (placedThisSlot) {
              var alleyGap = 2.45 + (KRAND.hash(hCell, 7) % 5) * 0.45;
              cx += placedThisSlot.w + alleyGap;
            } else {
              cx += 6.0;
            }
          }
        }
      }
    }

    /* Guarantee every single one of the 18 housing varieties & 29 trade/economy keys is placed at least once on the map */
    var MUST_HAVE = [
      ['jj_house_poor_a', 'zone8.day', 1120, -420], ['jj_house_poor_b', 'zone8.day', 1160, -420],
      ['jj_house_poor_c', 'zone8.day', 1200, -420], ['jj_house_poor_d', 'zone4.twoday', -980, -680],
      ['jj_house_poor_e', 'zone3.giant', -340, -1420], ['jj_house_poor_f', 'zone8.day', 1240, -420],
      ['jj_house_mid_a', 'zone2.companion', -240, -680], ['jj_house_mid_b', 'zone2.companion', -200, -680],
      ['jj_house_mid_c', 'zone2.companion', -160, -680], ['jj_house_mid_d', 'zone6.thirteen', 40, 560],
      ['jj_house_mid_e', 'zone4.twoday', -920, -680], ['jj_house_mid_f', 'zone5.week', -680, 560],
      ['jj_house_rich_a', 'zone5.week', -1020, 560], ['jj_house_rich_b', 'zone4.twoday', -860, -680],
      ['jj_house_rich_c', 'zone1.sun', 90, -240], ['jj_house_rich_d', 'zone7.fourday', 680, -420],
      ['jj_house_rich_e', 'zone5.week', -960, 560], ['jj_house_rich_f', 'zone1.sun', 150, -240],
      ['jj_smithy_brass', 'zone8.day', 1120, -320], ['jj_pottery', 'zone8.day', 1160, -320],
      ['jj_oil_press', 'zone7.fourday', 620, -420], ['jj_timber_yard', 'zone3.giant', -420, -1480],
      ['jj_gypsum_works', 'zone8.day', 1210, -320], ['jj_tailor_cobbler', 'zone6.thirteen', 95, 560],
      ['jj_money_changer', 'zone5.week', -640, 560], ['jj_clay_pit', 'zone8.day', 1260, -220],
      ['jj_carter_corral', 'zone10.pilgrim_gates', 320, 1080], ['jj_saltpeter_ery', 'zone8.day', 1260, -160],
      ['jj_funerary_ghat', 'zone5.week', -1120, 760]
    ];
    var presentKeys = {};
    for (var pk = 0; pk < structures.length; pk++) presentKeys[structures[pk].key] = true;
    for (var mh = 0; mh < MUST_HAVE.length; mh++) {
      var mItem = MUST_HAVE[mh];
      if (!presentKeys[mItem[0]]) {
        for (var radTry = 0; radTry <= 220; radTry += 26) {
          for (var dzTry = -52; dzTry <= 52; dzTry += 52) {
            var placedMh = commitStruct(makeRecord('ensure.' + mItem[0], mItem[1], mItem[0], mItem[2] + radTry, mItem[3] + dzTry, Math.PI, {}), 1.4);
            if (placedMh) { presentKeys[mItem[0]] = true; break; }
          }
          if (presentKeys[mItem[0]]) break;
        }
      }
    }

    /* Mark 8 Dilihan/Vernacular expansion lots in zone9.izani & zone10.pilgrim_gates as active KCONS + KCITY.constructMesh scaffolds */
    var consProg = [0.34, 0.48, 0.56, 0.64, 0.42, 0.72, 0.52, 0.60];
    for (var ci = 0; ci < structures.length && constructSites.length < 8; ci++) {
      var sr = structures[ci];
      if ((sr.kit === 'dil' || sr.kit === 'vern') && !sr.landmark && (sr.zone === 'zone9.izani' || sr.zone === 'zone10.pilgrim_gates')) {
        var prg = consProg[constructSites.length];
        sr.construct = {
          progress: prg,
          bill: { brick: 18, timber: 8, plaster: 6 }
        };
        constructSites.push({ id: sr.id, key: sr.key, zone: sr.zone, progress: prg });
      }
    }

    /* ================================================================
     * F. GREAT PILGRIM'S MARKET STALLS, WATERFRONT STRAND STALLS,
     *    KCAMP PILGRIM TENT-MAIDANS (P3) & WSW HEADLAND WINDMILLS
     * ================================================================ */
    var STALL_STREAMS = ['hykkousoi', 'eternian', 'order', 'khaayken', 'yonni', 'ria', 'jimjam', 'iziz'];
    var stallIdx = 0;
    for (var sz = 1008; sz <= 1116; sz += 27) {
      for (var sx = -296; sx <= -40; sx += 23) {
        if (Math.abs(sx + 160) < 28 && Math.abs(sz - 1060) < 22) continue; /* leave central market hall clear */
        var scul = STALL_STREAMS[stallIdx % STALL_STREAMS.length];
        marketStalls.push({
          id: 'pm.stall.' + (++stallIdx),
          x: sx,
          z: sz,
          y: G.h(sx, sz),
          ry: (sz % 54 === 0) ? 0 : Math.PI,
          stream: scul
        });
      }
    }
    /* Bustling Lotus Harbour Quayside & Strand Bazaar Canopy Stalls (keeping canal x=-610 & gate x=-680 clear!) */
    var HARB_STALL_XS = [-895, -875, -812, -756, -714, -654, -588, -536, -502];
    for (var hsi = 0; hsi < HARB_STALL_XS.length; hsi++) {
      var hsx = HARB_STALL_XS[hsi], hsz = -1650.0;
      marketStalls.push({
        id: 'harb.stall.' + (hsi + 1),
        x: hsx,
        z: hsz,
        y: G.h(hsx, hsz),
        ry: Math.PI,
        stream: STALL_STREAMS[hsi % STALL_STREAMS.length]
      });
    }

    /* Seasonal Extramural Pilgrim Tent-Maidans via core/camp (KCAMP.pitch, PLAN.md §3.2A & P3) */
    var pilgrimCamps = [];
    if (typeof KCAMP !== 'undefined' && typeof KCAMP.pitch === 'function') {
      KCAMP.CULTURES['jimjam-pilgrim'] = {
        kind: function (k) {
          if (k === 'jj_shrine_wanderer') return 'shrine';
          if (k === 'jj_shop_food') return 'trade';
          if (k === 'jj_pilgrim_tent') return 'dwelling';
          return null;
        },
        households: { jj_pilgrim_tent: 1 },
        household: [5, 8],
        chiefHousehold: [6, 8],
        sleepers: [4, 6],
        work: { jj_shop_food: { role: 'cook', n: 2 }, jj_shrine_wanderer: { role: 'priest', n: 1 } },
        elderShare: 0.25,
        mountsPer: 0.5,
        wind: [0.7, 0.7],
        formation: 'horseshoe'
      };
      var MAIDAN_SPECS = [
        { id: 'camp.cut_maidan',   name: 'Cut-Gate Lotus Pilgrim Maidan',   zone: 'zone10.pilgrim_gates', x: -615, z: 1120, way: [60, 949],   formation: 'horseshoe', nTents: 14 },
        { id: 'camp.serai_maidan', name: 'Serai-Gate East Pilgrim Maidan',  zone: 'zone10.pilgrim_gates', x: 1515, z: 165,  way: [1380, 80],  formation: 'ring',      nTents: 12 }
      ];
      for (var mci = 0; mci < MAIDAN_SPECS.length; mci++) {
        var ms0 = MAIDAN_SPECS[mci];
        var campRes = KCAMP.pitch({
          id: ms0.id,
          world: WORLD_SEED,
          culture: 'jimjam-pilgrim',
          program: {
            tents: [
              { key: 'jj_pilgrim_tent', n: ms0.nTents, v: mci % 3 },
              { key: 'jj_shop_food', n: 1, v: 0 }
            ],
            pens: [],
            hedge: null,
            pasture: null
          },
          site: { x: ms0.x, z: ms0.z },
          dims: function (k) { return dimsOf(k) || { w: 9.2, d: 7.8, h: 5.6 }; },
          ground: { ok: function (x, z) { return G.h(x, z) > G.lakeY + 1.5 && wallSignedDist(x, z) < -24.0; } },
          way: ms0.way,
          formation: ms0.formation,
          gap: 2.2,
          common: 13.0
        });
        var cPlaced = 0;
        var cRecs = (campRes && campRes.records) ? campRes.records : [];
        for (var cri2 = 0; cri2 < cRecs.length; cri2++) {
          var cr = cRecs[cri2];
          if (DIMS[cr.key]) {
            var pRec = makeRecord(ms0.id + '.t.' + cri2, ms0.zone, cr.key, cr.x, cr.z, cr.ry, {
              v: (cri2 + mci) % 3
            });
            if (commitStruct(pRec, 1.2)) cPlaced++;
          }
        }
        pilgrimCamps.push({ id: ms0.id, name: ms0.name, x: ms0.x, z: ms0.z, hearth: campRes.hearth, tents: cPlaced });
      }
    }

    /* Six WSW Headland Windmills at (-1960, 980) — Azimuth ~227 deg from Solstice Temple (strictly outside 239..249 deg!) */
    for (var wmi = 0; wmi < 6; wmi++) {
      var wx = -2040 + (wmi % 3) * 78;
      var wz = 930 + Math.floor(wmi / 3) * 90;
      commitStruct(makeRecord('handu.windmill.' + wmi, 'zone11.handu', 'jj_windmill', wx, wz, azToRy(295), {
        name: 'Headland Monsoon Windmill ' + (wmi + 1)
      }), 2.0);
    }

    /* ================================================================
     * G. SIX KHAMLET.VILLAGE HANDU HINTERLAND SETTLEMENTS & SOLAR-GRIDDED
     *    IRRIGATED HANDU CROP ALLOTMENTS (P3)
     * ================================================================ */
    var JJ_HANDU_ROW = {
      kit: 'jimjam', household: 4.8, workShare: 0.46, slopeMax: 0.24,
      religious: 'jj_shrine_wanderer', civic: 'jj_guild_hall', general: 'jj_shop_general',
      food: 'jj_shop_food', warehouse: 'jj_granary',
      services: { religious: 2, civic: 3, general: 3, food: 3, warehouse: 3 },
      houses: {
        poor: [
          ['jj_house_poor_a', 1, 2], ['jj_house_poor_b', 1, 2], ['jj_house_poor_c', 1, 2],
          ['jj_house_poor_d', 1, 2], ['jj_house_poor_e', 1, 2], ['jj_house_poor_f', 1, 2]
        ],
        middling: [
          ['jj_house_mid_a', 2, 2], ['jj_house_mid_b', 2, 2], ['jj_house_mid_c', 2, 1],
          ['jj_house_mid_d', 2, 2], ['jj_house_mid_e', 2, 1]
        ],
        head: [['jj_house_rich_a', 1, 1]],
        middlingShare: 0.30
      },
      works: {
        farming: [{ key: 'jj_farmhouse_a', jobs: 10, share: 0.65 }, { key: 'jj_dairy', jobs: 6, share: 0.20 }, { key: 'jj_farmhouse_b', jobs: 8, share: 0.15 }],
        orchard: [{ key: 'jj_farmhouse_b', jobs: 10, share: 0.45 }, { key: 'jj_oil_press', jobs: 12, share: 0.35 }, { key: 'jj_orchard', jobs: 8, share: 0.20 }],
        clay:    [{ key: 'jj_pottery', jobs: 12, share: 0.45 }, { key: 'jj_brick_kiln', jobs: 14, share: 0.35 }, { key: 'jj_clay_pit', jobs: 8, share: 0.20 }],
        quarry:  [{ key: 'jj_gypsum_works', jobs: 14, share: 0.55 }, { key: 'jj_masons_yard', jobs: 12, share: 0.30 }, { key: 'jj_smithy_brass', jobs: 6, share: 0.15 }],
        fishing: [{ key: 'jj_fish_quay', jobs: 12, share: 0.55 }, { key: 'jj_boatyard', jobs: 10, share: 0.45 }]
      },
      focusJobs: { farming: 54, orchard: 50, clay: 46, quarry: 46, fishing: 46 },
      reach:     { farming: 360, orchard: 360, clay: 320, quarry: 320, fishing: 320 }
    };
    for (var hpi = 0; hpi < G.handuPads.length; hpi++) {
      var hp = G.handuPads[hpi];
      var hBuildings = [];
      if (typeof KHAMLET !== 'undefined' && typeof KHAMLET.village === 'function') {
        var vRes = KHAMLET.village({
          id: hp.id,
          world: WORLD_SEED,
          culture: JJ_HANDU_ROW,
          focus: hp.focus,
          site: { x: hp.x, z: hp.z },
          link: { x: 0, z: 0 },
          popMax: 230,
          ground: { ok: function (x, z) { return G.h(x, z) > G.lakeY + 1.2; } },
          dims: dimsOf
        });
        var bList = (vRes && vRes.records) ? vRes.records : [];
        for (var vbi = 0; vbi < bList.length; vbi++) {
          var vb = bList[vbi];
          if (DIMS[vb.key]) {
            var hRec = makeRecord(hp.id + '.b.' + vbi, 'zone11.handu', vb.key, vb.x, vb.z, vb.ry == null ? 0 : vb.ry, {});
            if (commitStruct(hRec, 1.4)) hBuildings.push(hRec.id);
          }
        }
      }
      /* Surround each handu hamlet with brick-walled irrigated paddy/cotton/orchard plots */
      var fKey = hp.focus === 'orchard' ? 'jj_orchard' : (hp.focus === 'clay' ? 'jj_clay_pit' : (hp.focus === 'quarry' ? 'jj_gypsum_works' : 'jj_farm_field'));
      var fieldOffsets = [[-135, -95], [135, -95], [-135, 95], [135, 95]];
      for (var foi = 0; foi < fieldOffsets.length; foi++) {
        var fo = fieldOffsets[foi];
        var fRec = makeRecord(hp.id + '.field.' + foi, 'zone11.handu', fKey, hp.x + fo[0], hp.z + fo[1], 0, {});
        if (commitStruct(fRec, 1.8)) hBuildings.push(fRec.id);
      }
      hamlets.push({ id: hp.id, name: hp.name, focus: hp.focus, x: hp.x, z: hp.z, placed: hBuildings.length });
    }

    /* Gridded Rectilinear Handu ("Hands of Land") Irrigated Paddy, Cotton, Indigo, Saffron & Orchard Allotments (P3) */
    var HANDU_GRIDS = [
      { id: 'hgrid.sw_tamarai', x0: -1120, z0: 1030, nx: 4, nz: 4, sx: 68, sz: 56, mix: ['jj_farm_field', 'jj_farm_field', 'jj_orchard', 'jj_farm_field'] },
      { id: 'hgrid.s_cut_saff', x0: 360,   z0: 1290, nx: 5, nz: 4, sx: 68, sz: 56, mix: ['jj_farm_field', 'jj_orchard', 'jj_farm_field', 'jj_farm_field'] },
      { id: 'hgrid.e_monsoon',  x0: 1470,  z0: -420, nx: 4, nz: 5, sx: 68, sz: 58, mix: ['jj_farm_field', 'jj_orchard', 'jj_farm_field', 'jj_orchard'] },
      { id: 'hgrid.ne_bench',   x0: 1080,  z0: -1460,nx: 4, nz: 3, sx: 68, sz: 56, mix: ['jj_farm_field', 'jj_farm_field', 'jj_orchard'] }
    ];
    var handuFieldCount = 24;
    for (var hgi = 0; hgi < HANDU_GRIDS.length; hgi++) {
      var hg = HANDU_GRIDS[hgi];
      var cellSeq = 0;
      for (var gz = 0; gz < hg.nz; gz++) {
        for (var gx2 = 0; gx2 < hg.nx; gx2++) {
          var fx = hg.x0 + gx2 * hg.sx;
          var fz = hg.z0 + gz * hg.sz;
          if (wallSignedDist(fx, fz) > -38.0) continue;
          var fk = hg.mix[(cellSeq++) % hg.mix.length];
          var fgRec = makeRecord(hg.id + '.' + gz + '.' + gx2, 'zone11.handu', fk, fx, fz, (gz % 2 === 0) ? 0 : Math.PI, {
            v: (gx2 + gz) % 3
          });
          if (commitStruct(fgRec, 2.0)) handuFieldCount++;
        }
      }
    }

    /* ================================================================
     * H. CITIZEN, DAY-KEEPER, STEVEDORE, SCHOLAR & PILGRIM COHORTS
     * ================================================================ */
    var COHORT_CENTRES = [
      { group: 'sunray-darbar',        culture: 'jimjam',    x: PLAZA_X, z: PLAZA_Z, n: 26, r: 28 },
      { group: 'solstice-kauntavan',   culture: 'jimjam',    x: -760,    z: -80,     n: 20, r: 24 },
      { group: 'lotus-watergate-eter', culture: 'eternian',  x: -680,    z: -1605,   n: 22, r: 18 },
      { group: 'harbour-hykkousoi',    culture: 'hykkousoi', x: -565,    z: -1655,   n: 24, r: 20 },
      { group: 'west-quay-stevedores', culture: 'jimjam',    x: -785,    z: -1656,   n: 26, r: 24 },
      { group: 'strand-bazaar-sailors',culture: 'jimjam',    x: -842,    z: -1648,   n: 22, r: 18 },
      { group: 'whitepass-yeti-yonni', culture: 'khaayken',  x: 340,     z: -1338,   n: 14, r: 18 },
      { group: 'whitepass-scholars',   culture: 'yonni',     x: 356,     z: -1344,   n: 8,  r: 12 },
      { group: 'whitepass-rians',      culture: 'ria',       x: 324,     z: -1344,   n: 8,  r: 12 },
      { group: 'order-monks',          culture: 'order',     x: 382,     z: 520,     n: 12, r: 14 },
      { group: 'dilihan-factors',      culture: 'iziz',      x: 845,     z: 695,     n: 16, r: 20 },
      { group: 'pilgrim-market-crowd', culture: 'jimjam',    x: -160,    z: 1085,    n: 34, r: 44 },
      { group: 'cut-maidan-pilgrims',  culture: 'hykkousoi', x: -615,    z: 1120,    n: 18, r: 22 },
      { group: 'serai-maidan-pilgrims',culture: 'jimjam',    x: 1515,    z: 165,     n: 18, r: 22 },
      { group: 'royal-charbagh-stroll',culture: 'jimjam',    x: 156,     z: -2,      n: 12, r: 32 }
    ];
    var citSeq = 0;
    for (var cgi = 0; cgi < COHORT_CENTRES.length; cgi++) {
      var cg = COHORT_CENTRES[cgi];
      for (var k = 0; k < cg.n; k++) {
        var h1 = KRAND.unit(KRAND.hash(WORLD_SEED, cg.group, k, 1));
        var h2 = KRAND.unit(KRAND.hash(WORLD_SEED, cg.group, k, 2));
        var ang = h1 * Math.PI * 2;
        var rad = Math.sqrt(h2) * cg.r;
        var cx = r2(cg.x + Math.cos(ang) * rad);
        var cz = r2(cg.z + Math.sin(ang) * rad);
        citizens.push({
          id: 'cit.' + (++citSeq),
          group: cg.group,
          culture: cg.culture,
          x: cx,
          z: cz,
          y: r2(G.h(cx, cz)),
          ry: r4(ang + Math.PI)
        });
      }
    }

    /* ================================================================
     * I. CENSUS, KIT-MIX & SOLSTICE SUMMARY METRICS
     * ================================================================ */
    var kitCounts = { jj: 0, dil: 0, vern: 0 };
    var izaniZoneCounts = { jj: 0, dil: 0, vern: 0, total: 0 };
    for (var si2 = 0; si2 < structures.length; si2++) {
      var st = structures[si2];
      kitCounts[st.kit] = (kitCounts[st.kit] || 0) + 1;
      if (st.zone === 'zone9.izani') {
        izaniZoneCounts[st.kit] = (izaniZoneCounts[st.kit] || 0) + 1;
        izaniZoneCounts.total++;
      }
    }
    var izaniForeignShare = izaniZoneCounts.total > 0
      ? r4((izaniZoneCounts.dil + izaniZoneCounts.vern) / izaniZoneCounts.total)
      : 0;

    /* World-space Solstice Sanctuary Eye & Portal Arch coordinates matching 74-jj-sacred.js (JJ_TEMPLE_K) */
    var tBaseY = sunTemple ? sunTemple.y : 27.8;
    var eyeWorld = [
      r2(TEMPLE_X + (-8.5) * SIGHT_DX),
      r2(tBaseY + 13.7),
      r2(TEMPLE_Z + (-8.5) * SIGHT_DZ)
    ];
    var archBaseWorld = [
      r2(TEMPLE_X + 16.0 * SIGHT_DX),
      r2(tBaseY + 6.0),
      r2(TEMPLE_Z + 16.0 * SIGHT_DZ)
    ];

    return {
      pin: {
        id: M.id,
        name: M.name,
        jamtokku: M.jamtokku,
        px: M.px,
        py: M.py,
        legacyPx: M.legacyPx,
        datum: M.datum,
        lakeAsl: M.lakeAsl,
        latitude: M.latitude,
        subGiantLon: M.subGiantLon,
        pressureAtm: M.pressureAtm
      },
      census: {
        urban: 50000,
        households: 10415,
        sliceHinterland: 8500,
        metropolitanSliceTotal: 58500,
        jj1ProvinceTotal: 79000,
        kingdomSingleCountedTotal: 103500,
        pilgrimDoubleDarkPeak: 8500,
        pilgrimSolsticePeak: 15000,
        placedStructures: structures.length,
        placedWalls: walls.length,
        kitCounts: kitCounts,
        izaniZoneCounts: izaniZoneCounts,
        izaniForeignShare: izaniForeignShare
      },
      solstice: {
        templeId: 'lm.temple_sun',
        x: TEMPLE_X,
        z: TEMPLE_Z,
        y: tBaseY,
        ry: TEMPLE_RY,
        eyeWorld: eyeWorld,
        archBaseWorld: archBaseWorld,
        archHalfW: 4.5,
        archSpring: 12.0,
        archR: 4.5,
        ephemeris: SOL,
        placeholder40STrap: SOL_PLACEHOLDER_40S
      },
      landmarks: {
        palaceId: 'lm.palace',
        palacePlazaId: 'lm.palace_plaza',
        templeSunId: 'lm.temple_sun',
        rajasEyeId: 'lm.rajas_eye',
        whitePassId: 'lm.whitepass_compound',
        lotusGateId: 'gate.lotus_water',
        harbourSluiceId: 'gate.harbour_sluice',
        eastSluiceId: 'gate.east_sluice',
        courtSunId: 'lm.court_sun',
        courtWeekId: 'lm.court_week',
        izaniRuinId: 'lm.izani_gov_ruin',
        chapterhouseId: 'lm.order_chapterhouse',
        pilgrimMarketId: 'lm.pilgrim_market_hall',
        caravanseraiId: 'lm.caravanserai_cut',
        amphitheaterId: 'lm.amphitheater',
        fortressId: 'lm.fortress_crest',
        moonTempleIds: [
          'lm.temple_week', 'lm.temple_thirteen', 'lm.temple_companion',
          'lm.temple_day', 'lm.temple_twoday', 'lm.temple_fourday'
        ],
        planetShrineIds: [
          'lm.shrine_veil', 'lm.shrine_crown', 'lm.shrine_rust_cinder',
          'lm.shrine_ash', 'lm.shrine_frost', 'lm.shrine_wanderer'
        ]
      },
      crops: queryJimjamCrops(),
      structures: structures,
      walls: walls,
      wallRing: WALL_RING,
      parks: PARKS,
      ways: ways,
      marketStalls: marketStalls,
      citizens: citizens,
      hamlets: hamlets,
      pilgrimCamps: pilgrimCamps,
      handuFieldCount: handuFieldCount,
      constructSites: constructSites,
      zones: byZone
    };
  }

  var PLAN = make();

  function wallSignedDist(x, z) {
    var ring = PLAN.wallRing;
    var minD = 1e9;
    for (var i = 0; i < ring.length; i++) {
      var wl = ring[i];
      var dx = wl.x1 - wl.x0, dz = wl.z1 - wl.z0;
      var len = Math.hypot(dx, dz);
      var d = (dx * (z - wl.z0) - dz * (x - wl.x0)) / len;
      if (d < minD) minD = d;
    }
    return minD;
  }

  return {
    DIMS: DIMS,
    dimsOf: dimsOf,
    boxesOverlap: boxesOverlap,
    solveSolstice: solveSolstice,
    wallSignedDist: wallSignedDist,
    plan: PLAN
  };
})();
