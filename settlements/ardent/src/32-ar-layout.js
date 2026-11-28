/* ================================================================= ARDENT — Walled Narrow-Cobbled Capital on KCITY, Nine Clans & Silk-Trail
   [G data] Pure data and functions over AR_GROUND, KRAND, KSPACE, KCITY, KCAMP, KHAMLET and RES_ORE: zero THREE, zero DOM.
   Builds (~500+ structures, 4.5-5x clan-seat scale):
     - Zone I   Walled Narrow-Cobbled Capital on KCITY (570 x 570 m circuit, 6x6 organic wards, narrow 3.5-7.4 m cobbled wynds,
                4 paved squares, ~350+ Baronial-Caucasus & Rustic buildings + full curtain-wall, tower, bastion & 4-gate circuit)
     - Zone II  Upper Thing-Crag Citadel: Nine-Stones Thing-Stead, Darbazi Winter Law-Hall, Dilihan Envoy Lodge,
                and all Nine Clans' Svaneti-style Koshki Peel-Towers + Clan Retinue Halls
     - Zone III East Silk-Trail Muster Green: Artillery Muster Yard, Tollhouse, Drovers Inn & 3 KCAMP Free-Company camps
     - Zone IV  Ardent Burn, 3 Humpback Cobbled Brigs & 30+ building North-Bank Reverberatory Bronze Foundry Suburb
     - Zone V   North Copper & Cassiterite Tin Ore Hills (4 mines + 8 RES_ORE nodes <= 400 m) & 16 West Valley Crofts */
var AR_LAYOUT = (function () {
  'use strict';
  var G = AR_GROUND;
  var SEED = KRAND.hash(830, 553, 2026, 1127);

  function r2(v) { return Math.round(v * 100) / 100; }
  function r4(v) { return Math.round(v * 10000) / 10000; }

  /* Canonical Nine Clans of the Clanthing across the 42,668 km2 Free Clans polygon (LORE.md §6.4; FREE-CLANS-SCOPE.md) */
  var NINE_CLANS = [
    { idx: 0, id: 'clan.bjelsmidt',  name: 'Cin Bjelsmidt',  gloss: 'Bell-Smith',   valley: 'FC1', seat: 'Ardent Bowl',  px: 830, py: 553, elevM: 2802, pop: 2800, crest: 'Bronze Bell and Crossed Hammers', specialty: 'foundry_artillery',     greatDistillery: null },
    { idx: 1, id: 'clan.hjartstajn', name: 'Cin Hjartstajn', gloss: 'Hearth-Stone', valley: 'FC1', seat: 'Ardent Burgh', px: 830, py: 553, elevM: 2802, pop: 5200, crest: 'Crowned Fir and Stepped Gable',   specialty: 'peat_scotch_and_peace', greatDistillery: { name: 'Hjart-Branneriet Great Peat Single-Malt Distillery', spirit: 'Ardent Hearth-Peat Single-Malt Scotch', corridor: 'Ardent -> Jimjam / Roketstad' } },
    { idx: 2, id: 'clan.torgovulf',  name: 'Cin Torgo-Vulf', gloss: 'Market-Wolf',  valley: 'FC1', seat: 'Malmdal',      px: 825, py: 561, elevM: 3088, pop: 4500, crest: 'Leaping Wolf and Balance',        specialty: 'silk_brocade_captains', greatDistillery: null },
    { idx: 3, id: 'clan.sjelkvac',   name: 'Cin Sjelk-Vac',  gloss: 'Silk-Watch',   valley: 'FC2', seat: 'Osterbank',    px: 858, py: 497, elevM: 2203, pop: 2750, crest: 'Spindle and Crossed Lances',      specialty: 'silk_cask_whiskey',     greatDistillery: { name: 'Oster-Branneriet Great Silk-Cask Whiskey Distillery', spirit: 'Osterbank Caravan-Cask Gold Whiskey', corridor: 'Osterbank -> Serai / Silkhead / Korona' } },
    { idx: 4, id: 'clan.kopardal',   name: 'Cin Kopardal',   gloss: 'Copper-Dale',  valley: 'FC2', seat: 'Koppardal',    px: 870, py: 476, elevM: 1804, pop: 1950, crest: 'Boar Head and Verdigris Shield',  specialty: 'copper_drovers',        greatDistillery: null },
    { idx: 5, id: 'clan.klipcip',    name: 'Cin Klip-Cip',   gloss: 'Cliff-Keep',   valley: 'FC3', seat: 'Klippeport',   px: 744, py: 596, elevM: 818,  pop: 4400, crest: 'Peel-Tower and Pickaxe',          specialty: 'cut_tin_and_scotch',    greatDistillery: { name: 'Klippe-Branneriet Great Cut-Glen Scotch Distillery', spirit: 'Klippeport Smoked-Oak Highland Scotch', corridor: 'Klippeport -> Dilihan / Tethis / Iziz' } },
    { idx: 6, id: 'clan.fajrvakt',   name: 'Cin Fajr-Vakt',  gloss: 'Fire-Watch',   valley: 'FC3', seat: 'Vaktberg',     px: 816, py: 616, elevM: 4250, pop: 2300, crest: 'Blazing Cresset and Stag Antlers',specialty: 'screamer_rim_watch',    greatDistillery: null },
    { idx: 7, id: 'clan.jernhors',   name: 'Cin Jern-Hors',  gloss: 'Iron-Horse',   valley: 'FC4', seat: 'Jarnhold',     px: 860, py: 562, elevM: 2989, pop: 1850, crest: 'Rearing Charger and Gun-Wheel',   specialty: 'horse_outriders',       greatDistillery: null },
    { idx: 8, id: 'clan.rjetkling',  name: 'Cin Rjet-Kling', gloss: 'Red-Blade',    valley: 'FC4', seat: 'Salpetervik',  px: 866, py: 526, elevM: 2460, pop: 1450, crest: 'Curved Cindzal and Saltpeter Star',specialty: 'powder_and_reivers',    greatDistillery: null }
  ];

  /* Footprint catalogue (branch: 'rustic' strictly enforced by AR_RULES across all 26 Baronial-Caucasus + Rustic defs) */
  var DIMS = {
    hl_rus_wynd_house_a:       { w: 8.8,  d: 8.4,  h: 11, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'middle' },
    hl_rus_wynd_house_b:       { w: 8.8,  d: 8.6,  h: 13, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'middle' },
    hl_rus_wynd_house_c:       { w: 7.4,  d: 8.0,  h: 15, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'middle' },
    hl_rus_close_row:          { w: 13.0, d: 8.2,  h: 14, branch: 'rustic', cls: 'building', types: ['dwelling-multi'],  wealth: 'middle' },
    hl_rus_pend_tenement:      { w: 11.8, d: 9.2,  h: 14, branch: 'rustic', cls: 'building', types: ['dwelling-multi'],  wealth: 'middle' },
    hl_rus_tower_house:        { w: 11.8, d: 10.6, h: 17, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'rich' },
    hl_rus_marani_tavern:      { w: 11.8, d: 9.8,  h: 14, branch: 'rustic', cls: 'building', types: ['tavern', 'inn'],   wealth: 'middle' },
    hl_rus_wynd_armourer:      { w: 10.6, d: 9.2,  h: 11, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'smithing' },
    hl_rus_silk_factor:        { w: 11.4, d: 9.6,  h: 12, branch: 'rustic', cls: 'building', types: ['shop', 'civic'],   wealth: 'rich',   job: 'trading' },
    hl_rus_cooperage:          { w: 14.0, d: 11.0, h: 13, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'carpentry' },
    hl_rus_saltpeter_mill:     { w: 15.0, d: 12.0, h: 12, branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'middle', job: 'smithing' },
    hl_rus_caravan_stables:    { w: 16.0, d: 13.2, h: 12, branch: 'rustic', cls: 'building', types: ['inn', 'infrastructure'], wealth: 'middle', job: 'trading' },
    hl_rus_apothecary:         { w: 9.0,  d: 8.8,  h: 13, branch: 'rustic', cls: 'building', types: ['shop', 'civic'],   wealth: 'middle', job: 'healing' },
    hl_rus_plaid_dyer:         { w: 12.2, d: 10.2, h: 13, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'weaving' },
    hl_rus_clan_koshki:        { w: 14.2, d: 12.4, h: 18, branch: 'rustic', cls: 'building', types: ['civic', 'dwelling-single'], wealth: 'rich' },
    hl_rus_mercenary_bourse:   { w: 17.6, d: 14.0, h: 23, branch: 'rustic', cls: 'building', types: ['civic', 'military'], wealth: 'rich' },
    hl_rus_law_darbazi:        { w: 19.0, d: 15.0, h: 17, branch: 'rustic', cls: 'building', types: ['civic'],           wealth: 'rich' },
    hl_rus_thing_ring:         { w: 22.0, d: 22.0, h: 8,  branch: 'rustic', cls: 'building', types: ['civic', 'religious'] },
    hl_rus_bronze_foundry:     { w: 18.8, d: 14.0, h: 14, branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'middle', job: 'smithing' },
    hl_rus_great_distillery:   { w: 21.6, d: 15.6, h: 20, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'rich',   job: 'brewing' },
    hl_rus_capital_distillery: { w: 25.4, d: 17.6, h: 22, branch: 'rustic', cls: 'building', types: ['industry', 'civic', 'shop'], wealth: 'rich', job: 'brewing' },
    hl_rus_burgh_gate:         { w: 18.0, d: 10.6, h: 19, branch: 'rustic', cls: 'building', types: ['military', 'infrastructure'], job: 'customs' },
    hl_rus_cobbled_bridge:     { w: 14.8, d: 7.0,  h: 5,  branch: 'rustic', cls: 'building', types: ['infrastructure'] },
    hl_rus_burgh_wall:         { w: 14.0, d: 4.8,  h: 10, branch: 'rustic', cls: 'building', types: ['military', 'infrastructure'] },
    hl_rus_wall_tower:         { w: 8.8,  d: 8.8,  h: 20, branch: 'rustic', cls: 'building', types: ['military'] },
    hl_rus_wall_bastion:       { w: 11.8, d: 11.8, h: 21, branch: 'rustic', cls: 'building', types: ['military'] },
    hl_rus_temple:           { w: 16.0, d: 18.0, h: 19, branch: 'rustic', cls: 'building', types: ['religious'] },
    hl_rus_pogost:           { w: 16.0, d: 16.0, h: 17, branch: 'rustic', cls: 'building', types: ['religious'] },
    hl_rus_shrine:           { w: 8.5,  d: 8.5,  h: 10, branch: 'rustic', cls: 'building', types: ['religious'] },
    hl_rus_envoy_lodge:      { w: 18.0, d: 16.0, h: 15, branch: 'rustic', cls: 'building', types: ['civic'],           wealth: 'rich' },
    hl_rus_hall:             { w: 18.0, d: 24.0, h: 13, branch: 'rustic', cls: 'building', types: ['civic', 'military'], wealth: 'rich' },
    hl_rus_guild_lodge:      { w: 16.0, d: 14.0, h: 13, branch: 'rustic', cls: 'building', types: ['civic'],           wealth: 'rich',   job: 'trading' },
    hl_rus_barracks:         { w: 18.0, d: 15.0, h: 11, branch: 'rustic', cls: 'building', types: ['military'] },
    hl_rus_market:           { w: 18.0, d: 16.0, h: 10, branch: 'rustic', cls: 'building', types: ['market', 'shop'],  wealth: 'middle', job: 'trading' },
    hl_rus_inn:              { w: 18.0, d: 16.0, h: 12, branch: 'rustic', cls: 'building', types: ['inn', 'tavern'],   wealth: 'middle' },
    hl_rus_tollhouse:        { w: 13.0, d: 11.0, h: 10, branch: 'rustic', cls: 'building', types: ['civic', 'infrastructure'], job: 'customs' },
    hl_rus_bakehouse:        { w: 13.0, d: 11.5, h: 9,  branch: 'rustic', cls: 'building', types: ['shop', 'industry'],wealth: 'middle', job: 'baking' },
    hl_rus_butcher:          { w: 13.0, d: 11.5, h: 9,  branch: 'rustic', cls: 'building', types: ['shop', 'industry'],wealth: 'middle', job: 'butchery' },
    hl_rus_weaver:           { w: 14.0, d: 12.0, h: 10, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'weaving' },
    hl_rus_woodcarver:       { w: 13.0, d: 11.5, h: 9,  branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'carpentry' },
    hl_rus_tannery:          { w: 16.0, d: 14.0, h: 9,  branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'poor',   job: 'tanning' },
    hl_rus_warehouse:        { w: 16.0, d: 13.0, h: 10, branch: 'rustic', cls: 'building', types: ['infrastructure'],  wealth: 'middle', job: 'warehousing' },
    hl_rus_healer:           { w: 14.0, d: 12.5, h: 9,  branch: 'rustic', cls: 'building', types: ['civic'],           wealth: 'middle', job: 'healing' },
    hl_rus_school:           { w: 13.5, d: 11.5, h: 11, branch: 'rustic', cls: 'building', types: ['civic'],           job: 'scribing' },
    hl_rus_shops:            { w: 14.0, d: 12.0, h: 8,  branch: 'rustic', cls: 'building', types: ['shop', 'market'],  wealth: 'middle', job: 'trading' },
    hl_rus_smithy:           { w: 14.0, d: 10.5, h: 8,  branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'middle', job: 'smithing' },
    hl_rus_distillery:       { w: 18.0, d: 15.0, h: 12, branch: 'rustic', cls: 'building', types: ['industry', 'shop'],wealth: 'middle', job: 'brewing' },
    hl_rus_mill:             { w: 16.0, d: 14.0, h: 10, branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'middle', job: 'milling' },
    hl_rus_charcoal_works:   { w: 18.0, d: 15.0, h: 9,  branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'poor',   job: 'smithing' },
    hl_rus_mine:             { w: 18.0, d: 16.0, h: 10, branch: 'rustic', cls: 'building', types: ['industry'],        wealth: 'poor',   job: 'mining' },
    hl_rus_muster:           { w: 18.0, d: 16.0, h: 8,  branch: 'rustic', cls: 'building', types: ['military', 'civic'] },
    hl_rus_house_mid_a:      { w: 12.5, d: 11.5, h: 10, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'middle' },
    hl_rus_house_mid_b:      { w: 13.5, d: 12.0, h: 9,  branch: 'rustic', cls: 'building', types: ['dwelling-multi'],  wealth: 'middle' },
    hl_rus_house_rich_a:     { w: 16.0, d: 18.0, h: 14, branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'rich' },
    hl_rus_house_poor_a:     { w: 10.5, d: 9.5,  h: 6,  branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'poor' },
    hl_rus_house_poor_b:     { w: 10.0, d: 9.0,  h: 5,  branch: 'rustic', cls: 'building', types: ['dwelling-single'], wealth: 'poor' },
    hl_rus_farmhouse:        { w: 16.0, d: 14.0, h: 9,  branch: 'rustic', cls: 'building', types: ['dwelling-single', 'farm'], wealth: 'poor', job: 'farming' },
    hl_rus_farm:             { w: 20.0, d: 18.0, h: 4,  branch: 'rustic', cls: 'building', types: ['farm'],            wealth: 'poor',   job: 'farming' },
    hl_rus_dairy:            { w: 16.0, d: 15.0, h: 9,  branch: 'rustic', cls: 'building', types: ['farm', 'industry'],wealth: 'middle', job: 'dairy' },
    hl_rus_pens:             { w: 16.0, d: 14.0, h: 5,  branch: 'rustic', cls: 'building', types: ['farm'],            wealth: 'poor',   job: 'herding' },
    hl_rus_granary:          { w: 11.0, d: 11.0, h: 8,  branch: 'rustic', cls: 'building', types: ['farm', 'industry'],wealth: 'middle', job: 'milling' }
  };

  function obbOverlap(a, b, pad) {
    var p = pad == null ? 0.35 : pad;
    var axes = [a.ry, a.ry + Math.PI * 0.5, b.ry, b.ry + Math.PI * 0.5];
    for (var i = 0; i < 4; i++) {
      var ang = axes[i], ux = Math.cos(ang), uz = -Math.sin(ang);
      var proj = function (r) {
        var cx = Math.cos(r.ry), sx = Math.sin(r.ry);
        var hw = Math.max(0.8, r.w * 0.5 - p), hd = Math.max(0.8, r.d * 0.5 - p);
        var c = r.x * ux + r.z * uz;
        var ext = Math.abs(ux * cx - uz * sx) * hw + Math.abs(ux * sx + uz * cx) * hd;
        return [c - ext, c + ext];
      };
      var pa = proj(a), pb = proj(b);
      if (pa[1] <= pb[0] || pb[1] <= pa[0]) return false;
    }
    return true;
  }

  function make() {
    var structures = [];
    var walls = [];
    var space = KSPACE.create({ cell: 24 });

    function makeRec(id, key, x, z, ry, extra) {
      var dm = DIMS[key];
      if (!dm) throw new Error('AR_LAYOUT: unknown building key ' + key);
      var ex = extra || {};
      var w = ex.w == null ? dm.w : ex.w;
      var d = ex.d == null ? dm.d : ex.d;
      var y = ex.y == null ? G.h(x, z) : ex.y;
      return {
        id: id,
        key: key,
        name: ex.name || id,
        zone: ex.zone || 'burgh',
        branch: dm.branch,
        cls: dm.cls,
        types: dm.types.slice(),
        wealth: ex.wealth || dm.wealth || null,
        job: ex.job || dm.job || null,
        lit: false,
        x: r2(x),
        y: r2(y),
        z: r2(z),
        ry: r4(ry == null ? 0 : ry),
        w: r2(w),
        d: r2(d),
        h: dm.h,
        v: ex.v == null ? (KRAND.hash(SEED, id) % 4) : ex.v,
        clanId: ex.clanId || null,
        wallRun: !!ex.wallRun,
        ringIdx: ex.ringIdx,
        spanIdx: ex.spanIdx,
        segIdx: ex.segIdx,
        segCount: ex.segCount,
        nodeA: ex.nodeA || null,
        nodeB: ex.nodeB || null
      };
    }

    function addStruct(id, key, x, z, ry, extra) {
      var ex = extra || {};
      var rec = makeRec(id, key, x, z, ry, ex);
      if (!ex.allowTouch) {
        var reach = Math.hypot(rec.w, rec.d) * 0.5 + 20;
        var pad = ex.pad == null ? -0.35 : ex.pad;
        /* pad in obbOverlap shrinks half-extents by p when positive; pass negative to enforce clearance!
           Wait: in obbOverlap above, hw = r.w*0.5 - p, so p = -0.45 GROWS each box by +0.45 m (0.9 m gap)! */
        var hits = space.query(rec.x, rec.z, reach);
        for (var i = 0; i < hits.length; i++) {
          if (obbOverlap(rec, hits[i], pad)) {
            if (ex.optional) return null;
            throw new Error('AR_LAYOUT overlap: ' + rec.id + ' vs ' + hits[i].id);
          }
        }
      }
      space.insert(rec, rec.x, rec.z, Math.hypot(rec.w, rec.d) * 0.5);
      if (rec.wallRun) walls.push(rec);
      else structures.push(rec);
      return rec;
    }

    /* ================================================================
       1. ZONE I — WALLED NARROW-COBBLED CAPITAL ON KCITY (~500 x 500 m, ~80% AREA, HIGH DENSITY)
       ================================================================ */
    var KL = KCITY.lib, SL = KL.SL, OCC = KL.OCC, Raster = KL.Raster, obb = KL.obb, obbCorners = KL.obbCorners, segDist = KL.segDist, inPoly = KL.inPoly;
    var SQ = {
      id: 'ar.grid', seed: 83055,
      c: [0, 0], u: [1, 0], v: [0, 1],
      half: 236, cells: 8, avenues: { u: 4, v: 4 },
      drop: 0.14, bend: 0.48, jitter: 0.15,
      wallGap: 14, out: 40, zoneIn: 5
    };
    var GR = KCITY.grid.plan(SQ);
    var GATE_NAMES = {
      'v-': 'North Burn and Foundry Gate',
      'v+': 'South Thing-Crag Citadel Gate',
      'u+': 'East Silk-Trail Gate',
      'u-': 'West Jimjam and Cut Gate'
    };

    var cityDims = function (k, v) {
      var d = DIMS[k];
      if (!d) return null;
      return { key: k, v: v | 0, w: d.w + 0.28, d: d.d + 0.28, h: d.h, fw: d.w, fd: d.d };
    };

    var xing = GR.nodes[4][4];
    var cellCenter = function (ci, cj) {
      var found = GR.cells.find(function (c) { return c.i === ci && c.j === cj; });
      return found ? found.c : [0, 0];
    };

    /* Five paved cobbled squares inside the Walled Capital + Thing-Crag Citadel Court */
    var pCapDist = cellCenter(2, 1);
    var pSilk    = cellCenter(6, 3);
    var pStave   = cellCenter(1, 6);
    var pGuild   = cellCenter(6, 6);
    var PLAZAS = [
      { id: 'plaza.tolbooth',           name: 'Tolbooth and First-Blood Dueling Square',   x0: xing.x - 21,       z0: xing.z - 25,       x1: xing.x + 21,       z1: xing.z + 18 },
      { id: 'plaza.capital_distillery', name: 'Capital Quadruple-Pagoda Maltings Yard',    x0: pCapDist[0] - 23,  z0: pCapDist[1] - 20,  x1: pCapDist[0] + 23,  z1: pCapDist[1] + 18 },
      { id: 'plaza.silk_bourse',        name: 'Silk-Factors and Brocade Square',           x0: pSilk[0] - 17,     z0: pSilk[1] - 16,     x1: pSilk[0] + 17,     z1: pSilk[1] + 16 },
      { id: 'plaza.stave_garth',        name: 'Fir-Sign Stave Sanctuary Garth',            x0: pStave[0] - 17,    z0: pStave[1] - 17,    x1: pStave[0] + 17,    z1: pStave[1] + 17 },
      { id: 'plaza.guild_court',        name: 'Bell-Smiths and Armourers Guild Court',     x0: pGuild[0] - 17,    z0: pGuild[1] - 16,    x1: pGuild[0] + 17,    z1: pGuild[1] + 16 },
      { id: 'plaza.thing_crag',         name: 'Nine-Stones Thing-Crag Citadel Court',      x0: G.thingCrag.x - 28,z0: G.thingCrag.z - 28,x1: G.thingCrag.x + 28,z1: G.thingCrag.z + 44 }
    ];

    function inBurghPlaza(x, z, pad) {
      var p = pad == null ? 0 : pad;
      for (var i = 0; i < 5; i++) {
        var q = PLAZAS[i];
        if (x >= q.x0 - p && x <= q.x1 + p && z >= q.z0 - p && z <= q.z1 + p) return true;
      }
      return false;
    }

    var cityTune = {
      cell: 2.0, rasterHalf: 340, maxSlope: 0.26, exact: true,
      /* Quaint narrow cobblestone wynds & closes (3.0 - 5.8 m) */
      width: { avenue: 5.8, main: 4.5, side: 3.6, alley: 3.0, highway: 6.4, lane: 3.6 },
      lot: { side: 0.18, setback: 0.25, rear: 0.60, inset: 0.22, step: 1.35 },
      classes: {
        manor:      [['hl_rus_tower_house', 0], ['hl_rus_tower_house', 1], ['hl_rus_silk_factor', 0], ['hl_rus_close_row', 0]],
        rich:       [['hl_rus_tower_house', 2], ['hl_rus_silk_factor', 1], ['hl_rus_close_row', 1], ['hl_rus_pend_tenement', 0],
                     ['hl_rus_wynd_house_b', 0], ['hl_rus_wynd_house_c', 0], ['hl_rus_apothecary', 0]],
        middle:     [['hl_rus_wynd_house_a', 0], ['hl_rus_wynd_house_a', 1], ['hl_rus_wynd_house_b', 1], ['hl_rus_wynd_house_b', 2],
                     ['hl_rus_wynd_house_c', 1], ['hl_rus_wynd_house_c', 2], ['hl_rus_close_row', 2], ['hl_rus_close_row', 3],
                     ['hl_rus_pend_tenement', 1], ['hl_rus_pend_tenement', 2], ['hl_rus_wynd_house_a', 2], ['hl_rus_house_mid_a', 0]],
        poor:       [['hl_rus_wynd_house_c', 3], ['hl_rus_wynd_house_a', 3], ['hl_rus_house_poor_a', 0], ['hl_rus_house_poor_b', 0]],
        shop:       [['hl_rus_silk_factor', 2], ['hl_rus_apothecary', 1], ['hl_rus_plaid_dyer', 0], ['hl_rus_cooperage', 0],
                     ['hl_rus_wynd_armourer', 0], ['hl_rus_bakehouse', 0], ['hl_rus_butcher', 0], ['hl_rus_woodcarver', 0], ['hl_rus_shops', 0]],
        tavern:     [['hl_rus_marani_tavern', 0], ['hl_rus_marani_tavern', 1], ['hl_rus_caravan_stables', 0]],
        industrial: [['hl_rus_cooperage', 1], ['hl_rus_plaid_dyer', 1], ['hl_rus_saltpeter_mill', 0], ['hl_rus_wynd_armourer', 1], ['hl_rus_smithy', 0]]
      },
      fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'middle', tavern: 'shop', industrial: 'middle', poor: null },
      civic: [
        { key: 'hl_rus_cooperage',       v: 0, near: 'cap_dist' },
        { key: 'hl_rus_caravan_stables', v: 0, near: 'east_gate' },
        { key: 'hl_rus_caravan_stables', v: 1, near: 'west_gate' },
        { key: 'hl_rus_apothecary',      v: 0, near: 'tolbooth' },
        { key: 'hl_rus_plaid_dyer',      v: 0, near: 'silk' },
        { key: 'hl_rus_saltpeter_mill',  v: 0, near: 'north_gate' },
        { key: 'hl_rus_healer',          v: 0, near: 'stave' },
        { key: 'hl_rus_school',          v: 0, near: 'tolbooth' },
        { key: 'hl_rus_pogost',          v: 0, near: 'stave' },
        { key: 'hl_rus_shrine',          v: 0, near: 'north_gate' },
        { key: 'hl_rus_shrine',          v: 1, near: 'east_gate' },
        { key: 'hl_rus_barracks',        v: 0, near: 'guild' },
        { key: 'hl_rus_barracks',        v: 1, near: 'south_gate' },
        { key: 'hl_rus_warehouse',       v: 0, near: 'cap_dist' },
        { key: 'hl_rus_hall',            v: 0, near: 'tolbooth' }
      ],
      civicSpacing: 24, civicJitter: 6,
      voidMax: 20, voidIters: 20, voidBatch: 14, sideSpacing: 19, sideMax: 240,
      alleyFrac: 0.34, blindMax: 95, interiorDepth: 4.0, interiorRounds: 4,
      avenueSnap: 26, ringGap: 6, verge: 3.5, mapHalf: 340,
      plazaArt: { rich: [], middle: [], poor: [], commerce: [] }
    };

    var steps = [
      {
        name: 'the site and its ground',
        run: function () {
          var R = SL.R = new Raster(KL.tune().rasterHalf, KL.tune().cell);
          R.occ.fill(OCC.OUT);
          var P = KL.plan();
          P.site = [{ id: 0, name: 'Ardent Walled Capital Burgh', role: 'zone', poly: GR.zone }];
          P.zone = GR.zone;
          KCITY.site.zoneRaster(R, GR.zone, { dry: -80, maxSlope: KL.tune().maxSlope, h: G.hNoBurn });
          SL.minSpacing = KCITY.site.minSpacing();
        }
      },
      {
        name: 'capital squares and landmarks',
        run: function () {
          for (var qi = 0; qi < 5; qi++) {
            var q = PLAZAS[qi];
            var poly = [[q.x0, q.z0], [q.x1, q.z0], [q.x1, q.z1], [q.x0, q.z1]];
            var cx = 0.5 * (q.x0 + q.x1), cz = 0.5 * (q.z0 + q.z1);
            var gn = SL.addGreen('plaza', poly, 1, 0.8, 'civic', obb([cx, cz], [1, 0], 0.5 * (q.x1 - q.x0), 0.5 * (q.z1 - q.z0)));
            gn.name = q.name;
            SL.R.stampPoly(poly, OCC.HARD, -10 - qi);
          }
        }
      },
      { name: 'districts', run: function () { SL.note(2, 'upper citadel-side rich clan wards, central silk/tolbooth wards, north maltings & smith wards'); } },
      {
        name: 'avenues and cobbled wynds',
        run: function () {
          for (var wi = 0; wi < GR.ways.length; wi++) {
            var w = GR.ways[wi];
            var tag = w.role === 'avenue' ? (w.line === 'v' ? 'Briggate Royal Wynd' : 'High Silk Wynd') :
                      w.role === 'ring' ? 'Wall-Walk Vennel' : 'Tbilisi Close';
            SL.addWay(w.kind, w.pts, 3, { tag: tag });
          }
        }
      },
      { name: 'highways', run: function () { SL.note(4, 'external high-roads join the four twin-koshki gates'); } },
      {
        name: 'the curtain wall, bastions and gates',
        run: function () {
          var P = KL.plan();
          var avs = P.ways.filter(function (w) { return w.cls === 'avenue'; });
          var named = GR.gates.map(function (g) { return { x: g.x, z: g.z, marker: g.side, name: GATE_NAMES[g.side] }; });
          var Wr = P.wallRec = KCITY.grid.wall(GR, avs, { towerGap: 62, clear: 14, gateFind: 42, named: named, side: 1, health: 2 });
          Wr.nodes.forEach(function (n) { n.gx = n.x; n.gz = n.z; });
          Wr.corners = GR.corners;
          Wr.segs = KCITY.site.wallSegs(Wr.nodes.filter(function (n) { return !n.skip; }));
          KCITY.site.stampWall(Wr, { thick: 5.0, step: 5, gateTower: 6 });
          for (var k = 0; k < GR.corners.length; k++) {
            var cn = GR.corners[k];
            SL.R.eachNearSeg([cn.x, cn.z], [cn.x, cn.z], 12, function (idx) {
              if (SL.R.occ[idx] === OCC.FREE || SL.R.occ[idx] === OCC.LOT) SL.R.occ[idx] = OCC.OUT;
            });
          }
          P.gates = Wr.gates.map(function (g) { return { p: [g.x, g.z], dir: g.name, side: g.marker }; });
        }
      }
    ].concat(KCITY.defaultSteps().slice(6));

    var gatePt = function (sd) {
      var g = GR.gates.find(function (q) { return q.side === sd; });
      return g ? [g.x, g.z] : [0, 0];
    };
    var pNorth = gatePt('v-'), pSouth = gatePt('v+'), pEast = gatePt('u+'), pWest = gatePt('u-');

    var cityRules = {
      wealth: function (p) {
        var w = 0.56 + p[1] / 540 + p[0] / 820;
        if (Math.hypot(p[0] - xing.x, p[1] - xing.z) < 85) w += 0.22;
        if (Math.hypot(p[0] - pSilk[0], p[1] - pSilk[1]) < 75) w += 0.18;
        return w < 0.12 ? 0.12 : w > 0.92 ? 0.92 : w;
      },
      vacant: function () { return false; },
      groundOk: function (bo) {
        if (!bo || !bo.c) return true;
        return !inBurghPlaza(bo.c[0], bo.c[1], 2.5);
      },
      near: {
        tolbooth:   function (c) { return Math.hypot(c.p[0] - xing.x, c.p[1] - xing.z); },
        cap_dist:   function (c) { return Math.hypot(c.p[0] - pCapDist[0], c.p[1] - pCapDist[1]); },
        silk:       function (c) { return Math.hypot(c.p[0] - pSilk[0], c.p[1] - pSilk[1]); },
        stave:      function (c) { return Math.hypot(c.p[0] - pStave[0], c.p[1] - pStave[1]); },
        guild:      function (c) { return Math.hypot(c.p[0] - pGuild[0], c.p[1] - pGuild[1]); },
        north_gate: function (c) { return Math.hypot(c.p[0] - pNorth[0], c.p[1] - pNorth[1]); },
        south_gate: function (c) { return Math.hypot(c.p[0] - pSouth[0], c.p[1] - pSouth[1]); },
        east_gate:  function (c) { return Math.hypot(c.p[0] - pEast[0], c.p[1] - pEast[1]); },
        west_gate:  function (c) { return Math.hypot(c.p[0] - pWest[0], c.p[1] - pWest[1]); }
      }
    };

    var finishCity = [function (Ci) {
      var P = Ci.plan;
      for (var li = 0; li < P.lots.length; li++) {
        var Lt = P.lots[li];
        if (Lt.died != null || !Lt.bo || !Lt.key) continue;
        if (inBurghPlaza(Lt.x, Lt.z, 4.5)) { Lt.died = 'plaza-clear'; continue; }
        var D0 = DIMS[Lt.key];
        var hw = (D0 ? D0.w : Lt.w) * 0.5, hd = (D0 ? D0.d : Lt.d) * 0.5, B = Lt.bo;
        var hitRoad = P.ways.some(function (w) {
          if (w.died != null) return false;
          var m = w.w * 0.5 + 0.12;
          return w.pts.some(function (pt) {
            var dx = pt[0] - B.c[0], dz = pt[1] - B.c[1];
            return Math.abs(dx * B.u[0] + dz * B.u[1]) < hw + m && Math.abs(dx * B.v[0] + dz * B.v[1]) < hd + m;
          });
        });
        if (hitRoad) Lt.died = 'street-clear';
      }
    }];

    var cityInst = KCITY.create({
      name: 'ardent',
      tune: cityTune,
      seed: 83055,
      rand: 'krand',
      index: { order: 'insertion' },
      ground: { h: G.hNoBurn },
      kit: { dims: cityDims },
      rules: cityRules,
      steps: steps,
      finish: finishCity
    });
    cityInst.run();
    var PL = cityInst.plan;

    /* ---- 1A. Build Seamless Fortified Curtain-Wall Ring (4 Gates, 4 Corner Bastions, Interval Towers & Wall Spans) ---- */
    var Wr = PL.wallRec;
    var gateCoords = {};
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
        if (kind === 'gate') return 8.15;
        if (kind === 'corner') return 4.20;
        return 3.25;
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
          var gSide = nd.marker || String(curN.origIdx);
          gateCoords[gSide] = [curN.wx, curN.wz];
          nRec = addStruct('ar.wall.gate.' + gSide, 'hl_rus_burgh_gate', curN.wx, curN.wz, outRy, {
            name: nd.name || ('Burgh Gate ' + curN.origIdx), zone: 'walls', v: ni2 % 4, wallRun: true, ringIdx: ni2, allowTouch: true
          });
        } else if (curN.kind === 'corner') {
          bastionCount++;
          nRec = addStruct('ar.wall.bastion.' + bastionCount, 'hl_rus_wall_bastion', curN.wx, curN.wz, outRy, {
            name: 'Pepperpot Corner Bastion ' + bastionCount, zone: 'walls', v: bastionCount - 1, wallRun: true, ringIdx: ni2, allowTouch: true
          });
        } else {
          nRec = addStruct('ar.wall.tower.' + curN.origIdx, 'hl_rus_wall_tower', curN.wx, curN.wz, outRy, {
            name: 'Svaneti Curtain Watchtower ' + curN.origIdx, zone: 'walls', v: ni2 % 4, wallRun: true, ringIdx: ni2, allowTouch: true
          });
        }
        nodeRecs.push(nRec);
      }

      var targetSegLen = 14.0;
      var mortise = 0.06;
      for (var si = 0; si < nRing; si++) {
        var nA = rawRing[si], nB = rawRing[(si + 1) % nRing];
        var recA = nodeRecs[si], recB = nodeRecs[(si + 1) % nRing];
        var sp = spanOutNorm(nA, nB);
        var offA = endSetback(nA.kind), offB = endSetback(nB.kind);
        var usable = sp.L - offA - offB;
        if (usable <= 1.0) continue;
        var nSeg = Math.max(1, Math.round(usable / targetSegLen));
        var stepL = usable / nSeg;
        var sry = Math.atan2(sp.nx, sp.nz);
        for (var sj = 0; sj < nSeg; sj++) {
          var d0 = sj === 0 ? offA : (offA + sj * stepL - mortise);
          var d1 = sj === nSeg - 1 ? (sp.L - offB) : (offA + (sj + 1) * stepL + mortise);
          var dMid = 0.5 * (d0 + d1);
          var segW = d1 - d0;
          var sx = nA.wx + sp.ux * dMid, sz = nA.wz + sp.uz * dMid;
          addStruct('ar.wall.seg.' + si + '.' + sj, 'hl_rus_burgh_wall', sx, sz, sry, {
            w: r2(segW),
            zone: 'walls',
            v: (si + sj) % 3,
            wallRun: true,
            spanIdx: si,
            segIdx: sj,
            segCount: nSeg,
            nodeA: recA.id,
            nodeB: recB.id,
            allowTouch: true
          });
        }
      }
    }

    /* ---- 1B. Place Anchors on the Five Capital Squares (incl. Grand Capital Scotch Distillery!) ---- */
    addStruct('ar.tolbooth', 'hl_rus_mercenary_bourse', xing.x, xing.z - 16.5, 0, {
      name: 'Free-Company Tolbooth and Silk-Trail Bourse', zone: 'burgh', v: 0, pad: -0.15
    });
    var capDistRec = addStruct('ar.capital_distillery', 'hl_rus_capital_distillery', pCapDist[0], pCapDist[1] - 11.5, 0, {
      name: 'Ardent Stor-Branneriet — Capital Quadruple-Pagoda Maltings and Clanthing Spirit Vault',
      zone: 'burgh',
      v: 0,
      pad: -0.15
    });
    addStruct('ar.silk_bourse_hall', 'hl_rus_market', pSilk[0], pSilk[1] - 9.5, 0, {
      name: 'Grand Silk-Trail Brocade Exchange', zone: 'burgh', v: 0, pad: -0.15
    });
    addStruct('ar.stave_sanctuary', 'hl_rus_temple', pStave[0], pStave[1] + 8.5, Math.PI, {
      name: 'Great Fir-Sign Stave Sanctuary', zone: 'burgh', v: 0, pad: -0.15
    });
    addStruct('ar.guild_artel', 'hl_rus_guild_lodge', pGuild[0], pGuild[1] - 8.5, 0, {
      name: 'Bell-Smiths and Armourers Guild Artel', zone: 'burgh', v: 0, pad: -0.15
    });

    /* ---- 1C. Accept KCITY Burgh Lots (Tight Party-Wall Clearance pad: -0.06 => Dense Street Canyons!) ---- */
    var rawLots = PL.lots.filter(function (Lt) { return Lt.died == null && Lt.bo && Lt.key; });
    rawLots.sort(function (a, b) {
      var ra = a.cls === 'landmark' ? 0 : a.civic ? 1 : 2;
      var rb = b.cls === 'landmark' ? 0 : b.civic ? 1 : 2;
      return ra - rb || a.id - b.id;
    });
    for (var li2 = 0; li2 < rawLots.length; li2++) {
      var Lt2 = rawLots[li2];
      addStruct('ar.burgh.lot.' + Lt2.id, Lt2.key, Lt2.x, Lt2.z, Lt2.ry, {
        zone: 'burgh',
        v: Lt2.v | 0,
        optional: true,
        pad: -0.06
      });
    }

    /* ---- 1D. Courtyard & Close House Infill Pass (Packs Any Remaining Open Block Pockets with Narrow Houses & Closes) ---- */
    var activeWays = PL.ways.filter(function (w) { return w.died == null && w.pts && w.pts.length >= 2; });
    var infillPool = [
      'hl_rus_wynd_house_c', 'hl_rus_wynd_house_a', 'hl_rus_wynd_house_b', 'hl_rus_wynd_house_c',
      'hl_rus_pend_tenement', 'hl_rus_close_row', 'hl_rus_apothecary', 'hl_rus_plaid_dyer', 'hl_rus_cooperage'
    ];
    var infillCloses = [];
    var infIdx = 0;
    for (var gz = -222; gz <= 222; gz += 9.4) {
      for (var gx = -222; gx <= 222; gx += 9.4) {
        var jx = gx + (KRAND.unit(KRAND.hash(SEED, 'infx', gx, gz)) - 0.5) * 2.2;
        var jz = gz + (KRAND.unit(KRAND.hash(SEED, 'infz', gx, gz)) - 0.5) * 2.2;
        if (!inPoly(GR.zone, jx, jz)) continue;
        if (inBurghPlaza(jx, jz, 5.5)) continue;
        /* Keep clear of every street/alley carriageway while finding nearest street point for orientation */
        var bestD = 1e9, nearPt = null, tooCloseRoad = false;
        for (var aw = 0; aw < activeWays.length; aw++) {
          var wy = activeWays[aw], wpts = wy.pts, halfRoad = (wy.w == null ? 3.6 : wy.w) * 0.5 + 4.9;
          for (var sp2 = 0; sp2 + 1 < wpts.length; sp2++) {
            var dSeg = segDist([jx, jz], wpts[sp2], wpts[sp2 + 1]);
            if (dSeg < halfRoad) { tooCloseRoad = true; break; }
            if (dSeg < bestD) {
              bestD = dSeg;
              nearPt = [0.5 * (wpts[sp2][0] + wpts[sp2 + 1][0]), 0.5 * (wpts[sp2][1] + wpts[sp2 + 1][1])];
            }
          }
          if (tooCloseRoad) break;
        }
        if (tooCloseRoad) continue;
        var ikey = infillPool[KRAND.hash(SEED, 'infk', infIdx) % infillPool.length];
        var iry = nearPt ? Math.atan2(nearPt[0] - jx, nearPt[1] - jz) : 0;
        var placedInf = addStruct('ar.burgh.infill.' + (++infIdx), ikey, jx, jz, iry, {
          zone: 'burgh',
          v: infIdx % 4,
          optional: true,
          pad: -0.14
        });
        if (placedInf && nearPt && bestD > 9.0 && bestD < 26.0) {
          infillCloses.push({
            id: 'wynd.infill_close_' + infIdx,
            kind: 'cobble_close',
            cls: 'alley',
            w: 3.0,
            pts: [[r2(nearPt[0]), r2(nearPt[1])], [r2(jx + Math.sin(iry) * 4.6), r2(jz + Math.cos(iry) * 4.6)]]
          });
        }
      }
    }

    /* ================================================================
       2. ZONE II — UPPER THING-CRAG CITADEL & NINE-CLAN KOSHKI CROWN
       ================================================================ */
    var tcX = G.thingCrag.x, tcZ = G.thingCrag.z;
    addStruct('ar.thing_ring', 'hl_rus_thing_ring', tcX, tcZ, 0, {
      name: 'Nine-Stones Thing-Stead and Bronze Oath-Anvil', zone: 'thing_crag', v: 0
    });
    addStruct('ar.law_hall', 'hl_rus_law_darbazi', tcX, tcZ + 34, Math.PI, {
      name: 'Darbazi Winter Law-Hall of the Clanthing', zone: 'thing_crag', v: 0
    });
    addStruct('ar.dilihan_envoy', 'hl_rus_envoy_lodge', tcX - 38, tcZ + 22, Math.PI * 0.68, {
      name: 'Dilihan Veterans Envoy Lodge', zone: 'thing_crag', v: 0
    });
    addStruct('ar.citadel_speaker_hall', 'hl_rus_hall', tcX + 40, tcZ + 22, -Math.PI * 0.68, {
      name: 'Law-Speakers Feast and Oath Hall', zone: 'thing_crag', v: 0
    });

    /* Semicircular crown of all Nine Clans' Koshki Peel-Towers + 3 Chartered Clan-Seat Great Scotch/Whiskey Distilleries
       (Cin Hjartstajn FC1, Cin Sjelk-Vac FC2, Cin Klip-Cip FC3) + 6 Clan Retinue Houses! */
    var clanTowers = [];
    var clanDistilleries = [];
    var distVariant = 0;
    for (var ci = 0; ci < NINE_CLANS.length; ci++) {
      var cl = NINE_CLANS[ci];
      var u = (ci / (NINE_CLANS.length - 1)) * 2 - 1;
      var ang = u * 2.15;
      var rad = 72.0 + (ci % 2) * 7.0;
      var kx = tcX + Math.sin(ang) * rad;
      var kz = tcZ + Math.cos(ang) * rad;
      if (Math.abs(u) < 0.16) kz += 10.0;
      var faceCenter = Math.atan2(tcX - kx, tcZ - kz);
      var kRec = addStruct('ar.koshki.' + cl.idx, 'hl_rus_clan_koshki', kx, kz, faceCenter, {
        name: cl.name + ' Koshki Keep (' + cl.gloss + ')',
        zone: 'thing_crag',
        v: cl.idx,
        clanId: cl.id
      });
      var dRec = null;
      if (cl.greatDistillery) {
        var drad = rad + 28.0;
        var dx2 = tcX + Math.sin(ang) * drad;
        var dz2 = tcZ + Math.cos(ang) * drad;
        dRec = addStruct('ar.clan_distillery.' + cl.idx, 'hl_rus_great_distillery', dx2, dz2, faceCenter, {
          name: cl.greatDistillery.name + ' (' + cl.name + ', ' + cl.seat + ')',
          zone: 'thing_crag',
          v: distVariant++,
          clanId: cl.id,
          pad: -0.35
        });
        clanDistilleries.push({
          id: dRec.id,
          clanId: cl.id,
          clanName: cl.name,
          valley: cl.valley,
          seat: cl.seat,
          name: cl.greatDistillery.name,
          spirit: cl.greatDistillery.spirit,
          corridor: cl.greatDistillery.corridor,
          x: dRec.x,
          y: dRec.y,
          z: dRec.z,
          ry: dRec.ry
        });
      } else {
        var rx2 = tcX + Math.sin(ang + 0.08) * (rad + 22.0);
        var rz2 = tcZ + Math.cos(ang + 0.08) * (rad + 22.0);
        addStruct('ar.clan_retinue.' + cl.idx, (ci % 2 === 0 ? 'hl_rus_tower_house' : 'hl_rus_wynd_house_b'), rx2, rz2, faceCenter, {
          name: cl.name + ' Retinue House',
          zone: 'thing_crag',
          v: cl.idx % 4,
          clanId: cl.id,
          optional: true
        });
      }
      clanTowers.push(Object.assign({}, cl, {
        buildingId: kRec.id,
        distilleryId: dRec ? dRec.id : null,
        x: kRec.x,
        y: kRec.y,
        z: kRec.z,
        ry: kRec.ry
      }));
    }

    /* ================================================================
       3. ZONE IV — ARDENT BURN, 3 HUMPBACK BRIGS & NORTH FOUNDRY SUBURB
       ================================================================ */
    var brigXs = [
      { id: 'ar.brig.west',   name: 'West Cut Humpback Brig',         x: -145, v: 0 },
      { id: 'ar.brig.center', name: 'Central Tolbooth Brig o Bronze', x: (gateCoords['v-'] ? gateCoords['v-'][0] : 0), v: 1 },
      { id: 'ar.brig.east',   name: 'East Foundry Humpback Brig',     x:  145, v: 2 }
    ];
    for (var bi = 0; bi < brigXs.length; bi++) {
      var bx0 = brigXs[bi].x;
      var bz0 = G.burnZ(bx0);
      var tanB = G.burnTangent(bx0);
      var acrossB = [-tanB[1], tanB[0]];
      addStruct(brigXs[bi].id, 'hl_rus_cobbled_bridge', bx0, bz0, Math.atan2(-acrossB[1], acrossB[0]), {
        name: brigXs[bi].name, zone: 'burn', y: G.burnWaterY(bx0) - 0.15, v: brigXs[bi].v, allowTouch: true
      });
    }

    /* North-Bank Industrial Foundry, Powder, Cooperage & Distillery Suburb (30+ structures along z = -356..-432) */
    var foundryLandmarks = [
      ['ar.foundry.central',  'hl_rus_bronze_foundry',  26, -358, 0,       'Great Bell-Smith Reverberatory Bronze Foundry'],
      ['ar.foundry.east',     'hl_rus_bronze_foundry', 132, -360, 0,       'East Field-Gun and Cannon Bronze Foundry'],
      ['ar.foundry.west',     'hl_rus_bronze_foundry',-128, -358, 0,       'West Clan-Shield and Ingot Bronze Foundry'],
      ['ar.burn_mill.w',      'hl_rus_mill',           -64, -348, 0,       'West Ore-Stamp and Grist Watermill'],
      ['ar.burn_mill.e',      'hl_rus_mill',            82, -348, 0,       'East Bellows-Wheel Watermill'],
      ['ar.scotch_still.w',   'hl_rus_distillery',    -182, -364, 0,       'Glen-Mekam Peat Pot-Still Scotch Distillery'],
      ['ar.scotch_still.e',   'hl_rus_distillery',     188, -366, 0,       'Red-Blade Highland Malt Distillery'],
      ['ar.foundry.powder',   'hl_rus_saltpeter_mill', 124, -408, Math.PI, 'Red-Blade Saltpeter Leaching and Bronze-Mortar Powder Mill'],
      ['ar.foundry.cooper',   'hl_rus_cooperage',     -138, -408, Math.PI, 'Burnside Whisky Hogshead Cooperage and Cask-Char Yard'],
      ['ar.charcoal.w',       'hl_rus_charcoal_works',-212, -408, 0,       'West Birch-Charcoal and Tar Clamps'],
      ['ar.charcoal.e',       'hl_rus_charcoal_works', 216, -410, 0,       'East Pine-Charcoal Retort Works'],
      ['ar.foundry.tannery',  'hl_rus_tannery',        -86, -408, Math.PI, 'Gun-Harness and Buff-Coat Tannery'],
      ['ar.foundry.ware_w',   'hl_rus_warehouse',      -22, -408, Math.PI, 'Bonded Copper and Cassiterite Ingot Store'],
      ['ar.foundry.ware_e',   'hl_rus_warehouse',       64, -408, Math.PI, 'Artillery Limber and Powder Magazine'],
      ['ar.foundry.tavern',   'hl_rus_marani_tavern',    0, -358, 0,       'The Smelters Ladle Marani Tavern']
    ];
    for (var fi = 0; fi < foundryLandmarks.length; fi++) {
      var fl = foundryLandmarks[fi];
      addStruct(fl[0], fl[1], fl[2], fl[3], fl[4], { name: fl[5], zone: 'foundry', v: fi % 3, optional: true });
    }
    var foundryPool = ['hl_rus_wynd_armourer', 'hl_rus_wynd_house_a', 'hl_rus_wynd_house_b', 'hl_rus_wynd_house_c', 'hl_rus_cooperage', 'hl_rus_plaid_dyer', 'hl_rus_close_row'];
    var fIdx = 0;
    for (var fx = -195; fx <= 195; fx += 13.5) {
      var fKey = foundryPool[KRAND.hash(SEED, 'fnd', fIdx) % foundryPool.length];
      addStruct('ar.foundry.row.' + (++fIdx), fKey, fx, -432, 0, { zone: 'foundry', optional: true, pad: -0.25 });
    }

    /* ================================================================
       4. ZONE V — NORTH COPPER & TIN ORE HILLS (RES_ORE) & WEST CROFTS
       ================================================================ */
    var mineSpecs = [
      { id: 'ar.mine.copper_w', name: 'West Malachite Copper Adit', mx: -182, mz: -496, ores: [
        { id: 'ar.ore.cu1', kind: 'copper', ore: 'copper_ore', grade: 'high',   x: -206, z: -532 },
        { id: 'ar.ore.sn1', kind: 'tin',    ore: 'tin_ore',    grade: 'medium', x: -160, z: -538 }
      ]},
      { id: 'ar.mine.cassit_m', name: 'Great Cassiterite Tin Lode Adit', mx: -58, mz: -504, ores: [
        { id: 'ar.ore.sn2', kind: 'tin',    ore: 'tin_ore',    grade: 'high',   x:  -80, z: -544 },
        { id: 'ar.ore.cu2', kind: 'copper', ore: 'copper_ore', grade: 'high',   x:  -34, z: -540 }
      ]},
      { id: 'ar.mine.bronze_c', name: 'Bell-Smith Deep Tin and Copper Adit', mx: 64, mz: -502, ores: [
        { id: 'ar.ore.sn3', kind: 'tin',    ore: 'tin_ore',    grade: 'high',   x:   44, z: -540 },
        { id: 'ar.ore.cu3', kind: 'copper', ore: 'copper_ore', grade: 'medium', x:   88, z: -538 }
      ]},
      { id: 'ar.mine.copper_e', name: 'East Gossan Copper Adit', mx: 184, mz: -494, ores: [
        { id: 'ar.ore.cu4', kind: 'copper', ore: 'copper_ore', grade: 'high',   x:  164, z: -530 },
        { id: 'ar.ore.sn4', kind: 'tin',    ore: 'tin_ore',    grade: 'high',   x:  210, z: -532 }
      ]}
    ];
    var oreNodes = [];
    var mineRecs = [];
    for (var mi = 0; mi < mineSpecs.length; mi++) {
      var ms = mineSpecs[mi];
      var mRec = addStruct(ms.id, 'hl_rus_mine', ms.mx, ms.mz, 0, { name: ms.name, zone: 'mines', v: mi });
      mRec.works = 'mine';
      mineRecs.push(mRec);
      for (var oi = 0; oi < ms.ores.length; oi++) {
        var oSpec = ms.ores[oi];
        var oy = G.h(oSpec.x, oSpec.z);
        var dist = Math.hypot(oSpec.x - mRec.x, oSpec.z - mRec.z);
        oreNodes.push({
          id: oSpec.id,
          kind: oSpec.kind,
          ore: oSpec.ore,
          grade: oSpec.grade,
          yieldMul: RES_ORE.grades[oSpec.grade].yield,
          size: RES_ORE.grades[oSpec.grade].size,
          x: oSpec.x,
          y: r2(oy),
          z: oSpec.z,
          mineId: mRec.id,
          mineDistM: Math.round(dist * 10) / 10
        });
      }
    }
    for (var mri = 0; mri < mineRecs.length; mri++) {
      mineRecs[mri].source = resSource(mineRecs[mri], oreNodes, { radius: 400 });
    }

    /* West Valley Frostoat, Flax & Koliba Sheep-Cheese Crofts (16 structures outside West Gate) */
    var croftSpecs = [
      ['ar.croft.toll',    'hl_rus_tollhouse',   -298,  -16,  Math.PI * 0.5, 'West Cut Road Tollhouse'],
      ['ar.croft.inn',     'hl_rus_caravan_stables', -318, 26, 0,            'Cut-Road Mount-Drover Caravan Stables'],
      ['ar.croft.house1',  'hl_rus_farmhouse',   -358,  -54,  0.14,          'North-Glen Frostoat Farmhouse'],
      ['ar.croft.farm1',   'hl_rus_farm',        -394,  -60,  0.10,          'North Frostoat and Flax Strip-Field'],
      ['ar.croft.house2',  'hl_rus_farmhouse',   -366,   66, -0.16,          'South-Glen Flax Farmhouse'],
      ['ar.croft.farm2',   'hl_rus_farm',        -404,   72, -0.12,          'South Frostoat and Woad Field'],
      ['ar.croft.house3',  'hl_rus_farmhouse',   -452,  -18,  0.08,          'Lower-Glen ClanSteading'],
      ['ar.croft.farm3',   'hl_rus_farm',        -492,  -22,  0.05,          'Lower-Glen Barley and Oat Field'],
      ['ar.croft.dairy1',  'hl_rus_dairy',       -354,  114, -0.18,          'Upper Koliba Sheep-Cheese Dairy'],
      ['ar.croft.pens1',   'hl_rus_pens',        -390,  120, -0.14,          'Clan Pack-Mule and Sheep Fold'],
      ['ar.croft.dairy2',  'hl_rus_dairy',       -442, -100,  0.20,          'Meadow Koliba Smoked-Cheese Shed'],
      ['ar.croft.pens2',   'hl_rus_pens',        -478, -104,  0.15,          'West Highland Cattle Fold'],
      ['ar.croft.granary1','hl_rus_granary',     -330,  -50,  0.05,          'Staddle Frostoat Granary I'],
      ['ar.croft.granary2','hl_rus_granary',     -334,   62, -0.05,          'Staddle Frostoat Granary II'],
      ['ar.croft.poor1',   'hl_rus_house_poor_a',-424,   34, -0.22,          'Shepherd Turf-Roofed Arestue I'],
      ['ar.croft.poor2',   'hl_rus_house_poor_b',-430,  -62,  0.22,          'Shepherd Turf-Roofed Arestue II']
    ];
    for (var cri = 0; cri < croftSpecs.length; cri++) {
      var cr = croftSpecs[cri];
      addStruct(cr[0], cr[1], cr[2], cr[3], cr[4], { name: cr[5], zone: 'crofts', v: cri % 3, optional: true });
    }

    /* ================================================================
       5. ZONE III — EAST SILK-TRAIL MUSTER GREEN (KCAMP + CARAVAN STABLES)
       ================================================================ */
    addStruct('ar.silk_tollhouse',   'hl_rus_tollhouse',       298,  18, -Math.PI * 0.5, { name: 'Silk-Trail Caravan Weigh and Toll House', zone: 'muster_green', v: 0 });
    addStruct('ar.silk_muster_yard', 'hl_rus_muster',          316, -34, -Math.PI * 0.5, { name: 'Silk-Trail Free-Company Artillery Muster Yard', zone: 'muster_green', v: 0 });
    addStruct('ar.silk_stables',     'hl_rus_caravan_stables', 324,  54,  Math.PI,       { name: 'Iron-Horse Mount-Drover and Gun-Limber Stables', zone: 'muster_green', v: 0 });
    addStruct('ar.silk_drover_inn',  'hl_rus_inn',             352,  54,  Math.PI,       { name: 'The Golden Spindle Caravan Inn', zone: 'muster_green', v: 1, optional: true });

    if (typeof KCAMP !== 'undefined' && KCAMP.CULTURES) {
      KCAMP.CULTURES['ardent-free-company'] = {
        kind: function (k) {
          if (k === 'ar_tog_captain') return 'chief';
          if (k === 'ar_tog_tent') return 'dwelling';
          if (k === 'ar_tog_watch') return 'sleep';
          if (k === 'ar_tog_limber') return 'trade';
          if (k === 'ar_tog_picket') return 'pen';
          return null;
        },
        households: { ar_tog_captain: 1, ar_tog_tent: 1 },
        household: [5, 7], chiefHousehold: [6, 8], sleepers: [4, 6],
        work: {
          ar_tog_limber: { role: 'artillerist', n: 2 },
          ar_tog_picket: { role: 'drover', n: 2 }
        },
        elderShare: 0.12, mountsPer: 1.4, wind: [0.82, 0.57], formation: 'ring'
      };
    }

    var campTentDims = {
      ar_tog_captain: { w: 4.6, d: 5.0, h: 2.8 },
      ar_tog_tent:    { w: 3.6, d: 4.0, h: 2.2 },
      ar_tog_watch:   { w: 3.2, d: 3.6, h: 2.0 },
      ar_tog_limber:  { w: 3.8, d: 4.2, h: 2.2 },
      ar_tog_picket:  { w: 5.0, d: 4.4, h: 1.8 }
    };

    var campSpecs = [
      {
        id: 'merc.sjelk_tog',
        name: '1st Silk-Watch Brons-Tog (MC-06)',
        clanId: 'clan.sjelkvac',
        cx: 392, cz: 46, seed: 8301,
        way: [-0.95, -0.30],
        route: 'Silkhead <-> Serai <-> Ardent Silk Trail',
        unpaidDays: 3, silkCaravanIndex: 0.78, harvestIndex: 0.72,
        bronzeGuns: 2,
        program: {
          tents: [
            { key: 'ar_tog_captain', n: 1 },
            { key: 'ar_tog_tent', n: 4 },
            { key: 'ar_tog_watch', n: 2 },
            { key: 'ar_tog_limber', n: 1 }
          ],
          pens: [{ key: 'ar_tog_picket', n: 1 }]
        }
      },
      {
        id: 'merc.jern_tog',
        name: 'Iron-Horse Bronze-Gun Battery (MC-06)',
        clanId: 'clan.jernhors',
        cx: 448, cz: 6, seed: 8303,
        way: [-0.98, 0.05],
        route: 'Ardent <-> Jarnhold <-> Silkhead Escort',
        unpaidDays: 0, silkCaravanIndex: 0.82, harvestIndex: 0.74,
        bronzeGuns: 3,
        program: {
          tents: [
            { key: 'ar_tog_captain', n: 1 },
            { key: 'ar_tog_tent', n: 4 },
            { key: 'ar_tog_limber', n: 2 }
          ],
          pens: [{ key: 'ar_tog_picket', n: 1 }]
        }
      },
      {
        id: 'merc.rjet_bant',
        name: 'Red-Blade Free-Bant (MC-06 / BF-04 Edge)',
        clanId: 'clan.rjetkling',
        cx: 398, cz: -56, seed: 8302,
        way: [-0.92, 0.38],
        route: 'Ham-Tsek <-> Korona K10 <-> Silkhead Silk Trail',
        unpaidDays: 11, silkCaravanIndex: 0.52, harvestIndex: 0.58,
        bronzeGuns: 2,
        program: {
          tents: [
            { key: 'ar_tog_captain', n: 1 },
            { key: 'ar_tog_tent', n: 3 },
            { key: 'ar_tog_watch', n: 2 }
          ],
          pens: [{ key: 'ar_tog_picket', n: 1 }]
        }
      }
    ];
    var camps = [];
    for (var cpi = 0; cpi < campSpecs.length; cpi++) {
      var cs = campSpecs[cpi];
      var cen = KCAMP.census({
        id: cs.id,
        world: cs.seed,
        culture: 'ardent-free-company',
        program: cs.program
      });
      var pitched = KCAMP.pitch({
        id: cs.id,
        world: cs.seed,
        culture: 'ardent-free-company',
        program: cs.program,
        site: { x: cs.cx, z: cs.cz },
        dims: function (k) { return campTentDims[k] || { w: 3.6, d: 4.0, h: 2.2 }; },
        ground: { ok: function (x, z) { return G.slope(x, z, 6) < 0.28; } },
        way: cs.way,
        common: 8.5,
        gap: 1.8
      });
      var hx = pitched.hearth && pitched.hearth.x != null ? pitched.hearth.x : cs.cx;
      var hz = pitched.hearth && pitched.hearth.z != null ? pitched.hearth.z : cs.cz;
      var campTents = [];
      for (var ti = 0; ti < (pitched.records || []).length; ti++) {
        var tr = pitched.records[ti];
        if (tr.kind === 'pen') continue;
        campTents.push({
          id: tr.id,
          key: tr.key,
          kind: tr.kind === 'chief' ? 'leader' : tr.kind,
          x: r2(tr.x),
          z: r2(tr.z),
          ry: r4(tr.ry)
        });
      }
      camps.push({
        id: cs.id,
        name: cs.name,
        clanId: cs.clanId,
        code: 'MC-06',
        banditFallbackCode: 'BF-04',
        center: [cs.cx, cs.cz],
        hearth: [r2(hx), r2(hz)],
        route: cs.route,
        unpaidDays: cs.unpaidDays,
        silkCaravanIndex: cs.silkCaravanIndex,
        harvestIndex: cs.harvestIndex,
        bronzeGuns: cs.bronzeGuns,
        headcount: cen.people ? cen.people.length : 36,
        tents: campTents
      });
    }

    /* ================================================================
       6. COMPLETE STREET & EXTERNAL ROAD NETWORK (FOR TERRAIN-DRAPED COBBLES & KWALK)
       ================================================================ */
    var ways = [];
    for (var kw = 0; kw < PL.ways.length; kw++) {
      var cw = PL.ways[kw];
      if (cw.died != null || !cw.pts || cw.pts.length < 2) continue;
      ways.push({
        id: 'wynd.' + cw.id,
        kind: cw.cls === 'alley' ? 'cobble_close' : 'cobble_wynd',
        cls: cw.cls,
        w: cw.w,
        pts: cw.pts.map(function (p) { return [r2(p[0]), r2(p[1])]; })
      });
    }
    for (var ic = 0; ic < infillCloses.length; ic++) ways.push(infillCloses[ic]);

    var gnPt = gateCoords['v-'] || [0, -250];
    var gsPt = gateCoords['v+'] || [0, 250];
    var gePt = gateCoords['u+'] || [250, 0];
    var gwPt = gateCoords['u-'] || [-250, 0];
    var bzW = G.burnZ(-145), bzC = G.burnZ(gnPt[0]), bzE = G.burnZ(145);

    var extWays = [
      { id: 'wynd.citadel_ascent', kind: 'cobble_wynd',   w: 5.6, pts: [[gsPt[0], gsPt[1] - 6], [gsPt[0], gsPt[1] + 22], [tcX, tcZ - 26]] },
      { id: 'wynd.north_brig',     kind: 'cobble_wynd',   w: 5.4, pts: [[gnPt[0], gnPt[1] + 6], [gnPt[0], bzC + 8], [gnPt[0], bzC - 8], [gnPt[0], -384]] },
      { id: 'wynd.west_brig',      kind: 'cobble_wynd',   w: 4.8, pts: [[-145, -254], [-145, bzW + 8], [-145, bzW - 8], [-145, -384]] },
      { id: 'wynd.east_brig',      kind: 'cobble_wynd',   w: 4.8, pts: [[ 145, -254], [ 145, bzE + 8], [ 145, bzE - 8], [ 145, -384]] },
      { id: 'wynd.foundry_row',    kind: 'cobble_wynd',   w: 5.0, pts: [[-215, -386], [-110, -384], [0, -382], [110, -384], [215, -386]] },
      { id: 'road.silk_trail',     kind: 'mountain_road', w: 6.4, pts: [[gePt[0] - 6, gePt[1]], [312, 2], [405, 6], [530, 14], [760, 32]] },
      { id: 'road.jimjam_cut',     kind: 'mountain_road', w: 6.4, pts: [[gwPt[0] + 6, gwPt[1]], [-315, -2], [-430, -6], [-610, -18], [-800, -30]] },
      { id: 'road.ore_hills',      kind: 'mountain_road', w: 4.8, pts: [[0, -382], [0, -468], [-182, -486], [-58, -494], [64, -492], [184, -484]] }
    ];
    for (var di = 0; di < clanDistilleries.length; di++) {
      var cdRec = clanDistilleries[di];
      extWays.push({
        id: 'wynd.distillery_' + di,
        kind: 'cobble_close',
        w: 4.2,
        pts: [[tcX + (cdRec.x - tcX) * 0.34, tcZ + (cdRec.z - tcZ) * 0.34], [r2(cdRec.x * 0.88), r2(tcZ + (cdRec.z - tcZ) * 0.86)]]
      });
    }
    for (var ei = 0; ei < extWays.length; ei++) ways.push(extWays[ei]);

    /* ---------------- 7. SCHEDULED CITIZENS & FREE-COMPANY FIGHTERS ([G data]) ---------------- */
    var JOBS = ['smithing', 'trading', 'brewing', 'baking', 'weaving', 'mining', 'farming', 'customs', 'healing', 'carpentry', 'tanning', 'warehousing'];
    var citizens = [];
    for (var pi = 0; pi < 54; pi++) {
      var clan = NINE_CLANS[pi % NINE_CLANS.length];
      var job = JOBS[pi % JOBS.length];
      var isSeasonVet = (pi % 4 !== 0);
      citizens.push({
        id: 'ar.cit.' + (pi + 1),
        faction: 'Free Clans',
        subfaction: clan.name,
        clanId: clan.id,
        job: job,
        foreignSeasonsRidden: isSeasonVet ? 2 + (pi % 4) : 0,
        thingVoteEligible: isSeasonVet,
        schedule: {
          0: 'SLEEP', 6: 'EAT', 8: 'WORK', 13: 'EAT', 14: 'WORK',
          19: (pi % 3 === 0 ? 'DUEL_RING_OR_MUSTER' : 'TAVERN_MARANI'), 22: 'SLEEP'
        }
      });
    }

    var burnPts = [];
    for (var bx2 = 760; bx2 >= -760; bx2 -= 16) {
      burnPts.push([bx2, r2(G.burnZ(bx2)), r2(G.burnWaterY(bx2))]);
    }

    /* ---------------- 8. FULL FREE CLANS POLYGON SCOPE (rmumc5ov15a8k + Upper Cut Sill = 42,668 km2) ---------------- */
    var polityScope = {
      polygonId: 'rmumc5ov15a8k',
      name: 'Free Clans of Ardent',
      polygonKm2: 41844,
      upperCutSillKm2: 824,
      totalDryKm2: 42668,
      singleCountedPop: 27200,
      verticesPx: [
        [745, 586], [762, 610], [773, 643], [829, 621], [874, 620], [897, 593],
        [887, 566], [859, 557], [875, 482], [868, 474], [860, 487], [839, 546],
        [813, 565], [797, 553], [793, 526], [783, 551], [769, 579]
      ],
      provinces: [
        { id: 'FC1', name: 'Ardent Hearth-Bowl', km2: 6380, pop: 12500, clans: ['clan.bjelsmidt', 'clan.hjartstajn', 'clan.torgovulf'], seats: ['Ardent', 'Malmdal'] },
        { id: 'FC2', name: 'North-Bench & Mekam-aru Escarpment', km2: 3396, pop: 4700, clans: ['clan.sjelkvac', 'clan.kopardal'], seats: ['Osterbank', 'Koppardal'] },
        { id: 'FC3', name: 'Upper Cut Gorge, West-Lode & Screamer-Rim Watch', km2: 21100, pop: 6700, clans: ['clan.klipcip', 'clan.fajrvakt'], seats: ['Kopparberg', 'Stannvik', 'Klippeport', 'Vaktberg'] },
        { id: 'FC4', name: 'East-Rim Saltpeter & Silk-Trail Foothill March', km2: 11792, pop: 3300, clans: ['clan.jernhors', 'clan.rjetkling'], seats: ['Jarnhold', 'Salpetervik'] }
      ],
      majorExports: [
        { good: 'tin-bronze', role: 'cast bells, mountain field-guns, bucklers, azimuth rings & bronze ingots (copper:120-130 + tin:200)' },
        { good: 'scotch-and-whiskey', role: 'peated frostoat single-malt scotch & wine-cask highland whiskey from the Capital Quadruple-Pagoda Maltings + 3 Clan-Seat Great Distilleries (~460 t/yr)' },
        { good: 'silk-trail-mercenaries', role: 'chartered MC-06 Free-Company caravan escorts along Silk Trail (flipping to BF-04 Brokn-Cin reivers on >14d arrears)' },
        { good: 'mounts-wool-saltpeter', role: 'hardy highland mounts (154 head/yr), clan tartan woollens, juniper/sky-poppy botanicals & leached FC4 saltpeter' }
      ]
    };

    return {
      pin: { id: AR_MODEL.id, name: 'Ardent', polity: 'Free Clans', px: AR_MODEL.px, py: AR_MODEL.py, datumAsl: AR_MODEL.datum },
      walledAreaM2: Math.round((SQ.half * 2 + SQ.wallGap * 2) * (SQ.half * 2 + SQ.wallGap * 2)),
      census: { onScreenPop: 8000, polityTotal: 27200, clans: 9, capitalDistilleries: 1, greatDistilleries: clanDistilleries.length, burghBuildings: structures.length, wallPieces: walls.length },
      polityScope: polityScope,
      capitalDistillery: { id: capDistRec.id, name: capDistRec.name, x: capDistRec.x, y: capDistRec.y, z: capDistRec.z },
      clans: clanTowers,
      clanDistilleries: clanDistilleries,
      plazas: PLAZAS,
      gates: gateCoords,
      ways: ways,
      structures: structures,
      walls: walls,
      oreNodes: oreNodes,
      camps: camps,
      citizens: citizens,
      burn: { name: 'Ardent Burn (Mekam-aru Headwater)', width: 8.4, speed: 1.65, pts: burnPts }
    };
  }

  return {
    dims: DIMS,
    clans: NINE_CLANS,
    obbOverlap: obbOverlap,
    make: make,
    plan: make()
  };
})();
