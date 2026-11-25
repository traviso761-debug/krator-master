// ================================================================= ARCVILLAGE — interior floor plans, dresses & settlement slots  [G data]
// Plans all 14 representative deck levels (L0..L13) across Living, Work, Recreation, and Civic uses on
// KratorAncientsInteriors (AI.ringPlate, AI.barPlate, AI.hallPlate), registers the Iron Republic hall dress
// (AV.DRESS.republican), and computes AV.settlementSlots(P) so any host settlement can plug Arcvillage straight into SIM.
// No THREE, no DOM.
var AV = typeof AV !== 'undefined' ? AV : {};
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function r3(v) { return Math.round(v * 1000) / 1000; }

  // Iron Republic ('republican') dress for KratorAncientsInteriors hall recipes:
  // maps recipe roles onto catalog pieces from krator-master-furniture-republican.js, post-apoc, and generic-goods.
  AV.DRESS = {
    republican: {
      table: 'hl_rep_trestle_table',
      bench: 'republican_common_bench',
      servery: 'hl_rep_produce_counter',
      stove: 'republican_common_hearth',
      headTable: 'republican_court_table',
      chair: 'republican_common_chair',
      water: 'hl_rep_cistern',
      barrel: 'hl_rep_barrel_stack',
      ceilingLamp: 'republican_common_hanging',
      lampStem: 'republican_common_lamp',
      lampStd: 'hl_rep_lamp_standard',
      console: 'republican_court_terminal',
      station: 'republican_common_workbench',
      control: 'republican_court_terminal',
      helm: 'republican_court_throne',
      rack: 'hl_rep_bar_rack',
      cells: 'republican_trade_locker',
      workbench: 'hl_rep_workbench',
      toolRack: 'hl_rep_tool_rail',
      radio: 'republican_court_terminal',
      rug: 'republican_court_carpet',
      divan: 'republican_court_divan',
      lowTable: 'republican_court_low_table',
      bookcase: 'republican_court_bookcase',
      books: 'republican_common_books',
      desk: 'republican_court_desk',
      board: 'hl_rep_notice_board',
      statue: 'republican_court_statue',
      banner: 'republican_court_tapestry',
      hanging: 'republican_court_tapestry',
      counter: 'hl_rep_market_counter',
      drums: 'hl_rep_barrel_stack',
      drum: 'hl_rep_barrel_lying',
      crate: 'hl_rep_tool_chest',
      pallet: 'hl_rep_plate_stack',
      sacks: 'republican_trade_bin',
      bed: 'ancients_planting_bed',
      coldFrame: 'pa_cold_frame',
      fountain: 'hl_rep_fountain',
      scarecrow: 'hl_rep_scarecrow',
      stall: 'hl_rep_market_stall',
      marketTable: 'hl_rep_market_counter',
      bollard: 'hl_rep_winch',
      capstan: 'hl_rep_winch',
      vent: 'hl_rep_salvage_forge',
      chain: 'hl_rep_scrap_heap',
      anchor: 'hl_rep_giant_anvil',
      netPile: 'hl_rep_timber_stack',
      target: 'hl_rep_training_butt',
      weaponRack: 'hl_rep_weapon_rack',
      mannequin: 'republican_trade_armour_stand',
      spears: 'hl_rep_rocket_rack'
    }
  };

  AV.installDress = function (AI) {
    if (!AI || !AI.DRESS) return;
    if (!AI.DRESS.republican) {
      AI.DRESS.republican = Object.assign({}, AI.DRESS.ancient, AV.DRESS.republican);
    }
  };

  // Room metadata helper: tags category ('living'|'work'|'rec'|'civic') and job (KTAGS.VOCAB.jobs)
  var KIND_META = {
    cottage: { category: 'living', beds: 2, job: null, wealth: 0.48 },
    living: { category: 'living', beds: 2, job: null, wealth: 0.58 },
    bedroom: { category: 'living', beds: 2, job: null, wealth: 0.58 },
    dormitory: { category: 'living', beds: 6, job: null, wealth: 0.35 },
    kitchen: { category: 'living', beds: 0, job: 'baking', wealth: 0.50 },
    bath: { category: 'rec', beds: 0, job: null, wealth: 0.55 },
    smithy: { category: 'work', beds: 0, job: 'smithing', wealth: 0.50 },
    workshop: { category: 'work', beds: 0, job: 'carpentry', wealth: 0.52 },
    shop: { category: 'work', beds: 0, job: 'trading', wealth: 0.55 },
    store: { category: 'work', beds: 0, job: 'warehousing', wealth: 0.45 },
    study: { category: 'work', beds: 0, job: 'scribing', wealth: 0.65 },
    library: { category: 'civic', beds: 0, job: 'scribing', wealth: 0.72 },
    sickbay: { category: 'civic', beds: 0, job: 'healing', wealth: 0.62 },
    antechamber: { category: 'civic', beds: 0, job: 'customs', wealth: 0.65 },
    hall: { category: 'rec', beds: 0, job: null, wealth: 0.65 },
    tavern: { category: 'rec', beds: 0, job: 'brewing', wealth: 0.52 },
    greenhouse: { category: 'work', beds: 0, job: 'farming', wealth: 0.55 }
  };

  function rectPoly(cx, cz, w, d, yaw) {
    var c = Math.cos(yaw == null ? 0 : yaw), s = Math.sin(yaw == null ? 0 : yaw);
    var hw = w * 0.5, hd = d * 0.5;
    var corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    return corners.map(function (q) {
      return [r3(cx + q[0] * c - q[1] * s), r3(cz + q[0] * s + q[1] * c)];
    });
  }

  function addHallPart(AI, parts, walls, rooms, o) {
    var poly = rectPoly(o.cx, o.cz, o.w, o.hDepth, o.yaw);
    var st = AI.hallPlate({
      id: o.id, level: o.level, y: o.y, h: o.h,
      poly: poly, kind: o.kind, doorEdge: o.doorEdge == null ? 2 : o.doorEdge,
      doorW: o.doorW == null ? 1.8 : o.doorW, furnish: o.furnish !== false, recipe: o.recipe || null
    });
    var R = st.rooms[0];
    R.category = o.category || (KIND_META[o.kind] ? KIND_META[o.kind].category : 'civic');
    R.job = o.job !== undefined ? o.job : (KIND_META[o.kind] ? KIND_META[o.kind].job : null);
    R.wealth = o.wealth == null ? 0.62 : o.wealth;
    R.label = o.label || o.id;
    rooms.push(R);
    var door = R.doors[0] ? { at: R.doors[0].at, w: R.doors[0].w } : null;
    walls.push({ id: o.id + '.wall', pts: poly.concat([poly[0]]), y: o.y, h: o.h, rooms: [R.id, null], door: door, broken: false });
    parts.push({ id: o.id + '.slab', outline: poly });
  }

  function addBarPart(AI, parts, walls, rooms, o) {
    var c = Math.cos(o.yaw), s = Math.sin(o.yaw), halfL = o.len * 0.5;
    var ax = o.cx - halfL * c, az = o.cz - halfL * s;
    var bx = o.cx + halfL * c, bz = o.cz + halfL * s;
    var st = AI.barPlate({
      id: o.id, level: o.level, y: o.y, h: o.h,
      path: function (u) { return [ax + (bx - ax) * u, az + (bz - az) * u]; },
      depth: o.depth, side: o.side || 'both', cw: o.cw == null ? 2.2 : o.cw,
      roomW: o.roomW == null ? 6.4 : o.roomW,
      kinds: o.kinds, ends: o.ends || null, door: o.doorW == null ? 1.0 : o.doorW
    });
    st.rooms.forEach(function (R) {
      var m = KIND_META[R.kind];
      R.category = o.categoryOf ? o.categoryOf(R.kind) : (m ? m.category : 'living');
      R.job = o.jobOf ? o.jobOf(R.kind) : (m ? m.job : null);
      R.wealth = o.wealth == null ? (m ? m.wealth : 0.55) : o.wealth;
      R.label = o.label || o.id;
      rooms.push(R);
    });
    st.walls.forEach(function (W) { walls.push(W); });
    parts.push({ id: o.id + '.slab', outline: st.outline });
  }

  function mergeStorey(id, L, parts, rooms, walls) {
    return {
      id: id,
      level: L.k,
      y: L.y,
      h: L.h,
      zone: L.zone,
      name: L.name,
      categories: L.categories.slice(),
      outline: parts.length ? parts[0].outline : AV.octPoly(0.85),
      parts: parts,
      rooms: rooms,
      walls: walls
    };
  }

  // ---- Build one deck's complete multi-wing STOREY ----
  AV.storey = function (P, deckIdx, AI_arg) {
    var AI = AI_arg || (typeof KratorAncientsInteriors !== 'undefined' ? KratorAncientsInteriors : null);
    if (!AI) throw new Error('AV.storey requires KratorAncientsInteriors');
    AV.installDress(AI);
    var L = AV.DECK_DEFS[deckIdx];
    if (!L) throw new Error('AV.storey: unknown deck index ' + deckIdx);
    var id = P.id + '.d' + L.k;
    var parts = [], rooms = [], walls = [];
    var isRep = P.culture === 'republican';

    if (L.zone === 'quay') {
      // L0 (y = 0.4 m): Tailrace Turbine Vaults, Stamp Mills, Ore Crushers, Barge Warehouses & Quay Alehouse (Work + Rec)
      var qSpots = [
        { sfx: 'turbine.se', cx: 38, cz: 78, w: 26, d: 16, yaw: 0, kind: 'hall', recipe: 'engine-room', cat: 'work', job: 'smithing', label: 'South-East Tailrace Turbine Vault' },
        { sfx: 'store.sw', cx: -38, cz: 78, w: 26, d: 16, yaw: 0, kind: 'hall', recipe: 'store-hall', cat: 'work', job: 'warehousing', label: 'South-West Ore and Coal Barge Store' },
        { sfx: 'stamp.e', cx: 78, cz: 36, w: 24, d: 15, yaw: Math.PI / 2, kind: 'hall', recipe: 'engine-room', cat: 'work', job: 'milling', label: 'East Tailrace Stamp and Sluice Mill' },
        { sfx: 'alehouse.w', cx: -78, cz: -36, w: 24, d: 15, yaw: -Math.PI / 2, kind: 'hall', recipe: 'crew-mess', cat: 'rec', job: 'brewing', label: 'West Barge Boatmens Alehouse' },
        { sfx: 'drill.n', cx: 0, cz: -82, w: 28, d: 20, yaw: Math.PI, kind: 'hall', recipe: 'drill-hall', cat: 'rec', job: null, label: 'North Foundrymens Recreation Court' }
      ];
      qSpots.forEach(function (q) {
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.' + q.sfx, level: L.k, y: L.y, h: L.h, cx: q.cx, cz: q.cz, w: q.w, hDepth: q.d, yaw: q.yaw,
          kind: q.kind, recipe: q.recipe, category: q.cat, job: q.job, label: q.label
        });
      });
      [-1, 1].forEach(function (sgn, bi) {
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.smithbar.' + bi, level: L.k, y: L.y, h: L.h,
          cx: sgn * 84, cz: sgn > 0 ? -36 : 36, len: 38, depth: 14.4, yaw: Math.PI / 2,
          side: 'both', cw: 2.4, roomW: 7.2,
          kinds: function (i) { return ['smithy', 'workshop', 'store'][i % 3]; },
          label: (sgn > 0 ? 'East' : 'West') + ' Tailrace Crusher and Smithy Row'
        });
      });
    } else if (L.zone === 'hydro_hall') {
      // L1 (y = 6.0 m): Great Central Assembly & Industrial Hall Ring around the Failed Ancient Prime Dynamo & Hydropower Retrofit
      var hallWings = [
        { sfx: 'rolling.n', cx: 0, cz: -72, w: 34, d: 16, yaw: 0, rec: 'engine-room', job: 'smithing', label: isRep ? 'North Great Rolling Mill and Trip-Hammer Hall' : 'North Ancient Field-Coil Auxiliary Hall' },
        { sfx: 'dynamo.e', cx: 72, cz: 0, w: 34, d: 16, yaw: Math.PI / 2, rec: 'engine-room', job: 'machining', label: isRep ? 'East Hydro-Dynamo and Ancient Busbar Splice Hall' : 'East Ancient Superconducting Bus Hall' },
        { sfx: 'foundry.w', cx: -72, cz: 0, w: 34, d: 16, yaw: -Math.PI / 2, rec: 'engine-room', job: 'smithing', label: isRep ? 'West Cupola Foundry and Ancient Stator Salvage Hall' : 'West Ancient Harmonic Regulator Hall' },
        { sfx: 'ingot.se', cx: 46, cz: 74, w: 26, d: 15, yaw: Math.PI, rec: 'store-hall', job: 'warehousing', label: isRep ? 'South-East Ingot and Relic Core Store Hall' : 'South-East Ancient Cryo-Cell Store' },
        { sfx: 'ingot.sw', cx: -46, cz: 74, w: 26, d: 15, yaw: Math.PI, rec: 'store-hall', job: 'warehousing', label: isRep ? 'South-West Timber Cribbing and Coke Store Hall' : 'South-West Ancient Conduit Spares Vault' }
      ];
      hallWings.forEach(function (hw) {
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.' + hw.sfx, level: L.k, y: L.y, h: L.h, cx: hw.cx, cz: hw.cz, w: hw.w, hDepth: hw.d, yaw: hw.yaw,
          kind: 'hall', recipe: hw.rec, category: 'work', job: hw.job, label: hw.label
        });
      });
      // Outer cardinal apse Tier-0 heavy artisan workshops (E, W, N full; S split clear of aqueduct piers)
      [0, 4, 6].forEach(function (ak) {
        var ath = AV.faceAngle(ak), rMid = AV.apothemAt(ak, 1) - 15.0;
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.apse0.' + ak, level: L.k, y: L.y, h: 4.2,
          cx: r3(rMid * Math.cos(ath)), cz: r3(rMid * Math.sin(ath)),
          len: 44, depth: 12.0, yaw: ath + Math.PI / 2,
          side: 'left', cw: 2.2, roomW: 7.0,
          kinds: function (i) { return ['smithy', 'workshop', 'store'][i % 3]; },
          label: P.apses[ak].face + ' Apse Millwright Terrace'
        });
      });
    } else if (L.zone === 'hydro_gallery') {
      // L2 (y = 16.2 m): Line-Shaft Machine Galleries overlooking the Central Cataract + Apse Tier-1 Worker Terraces
      [
        { sfx: 'mach.e', cx: 52, cz: -6, yaw: Math.PI / 2, label: 'East Belt-Driven Machine Gallery' },
        { sfx: 'mach.w', cx: -52, cz: -6, yaw: -Math.PI / 2, label: 'West Belt-Driven Machine Gallery' },
        { sfx: 'mach.n', cx: 0, cz: -52, yaw: 0, label: 'North Patternmakers and Gear-Cutting Loft' }
      ].forEach(function (mg) {
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.' + mg.sfx, level: L.k, y: L.y, h: L.h,
          cx: mg.cx, cz: mg.cz, len: 38, depth: 13.6, yaw: mg.yaw,
          side: 'both', cw: 2.2, roomW: 6.8,
          kinds: function (i) { return ['workshop', 'smithy', 'study', 'store'][i % 4]; },
          label: mg.label
        });
      });
      for (var k2 = 0; k2 < 8; k2++) {
        var ap2 = P.apses[k2], tr2 = ap2.tiers[L.tier];
        if (ap2.breached && L.tier >= 3) continue;
        var th2 = ap2.th, rm2 = (tr2.rFront + tr2.rBack) * 0.5;
        if (tr2.aqueductNotch > 0) {
          /* Split South Apse around the y = 31.8 m Headrace Aqueduct canyon! */
          [-1, 1].forEach(function (sgn, si) {
            var uOff = sgn * (tr2.aqueductNotch + 10.5);
            addBarPart(AI, parts, walls, rooms, {
              id: id + '.apse.' + k2 + '.' + si, level: L.k, y: L.y, h: L.h,
              cx: r3(rm2 * Math.cos(th2) - uOff * Math.sin(th2)),
              cz: r3(rm2 * Math.sin(th2) + uOff * Math.cos(th2)),
              len: 16.5, depth: 11.2, yaw: th2 + Math.PI / 2,
              side: 'left', cw: 2.0, roomW: 6.4,
              kinds: function (i) { return ['workshop', 'living', 'bedroom'][i % 3]; },
              wealth: 0.52,
              label: 'South Aqueduct Flanking Terrace ' + (sgn < 0 ? 'West' : 'East')
            });
          });
        } else {
          addBarPart(AI, parts, walls, rooms, {
            id: id + '.apse.' + k2, level: L.k, y: L.y, h: L.h,
            cx: r3(rm2 * Math.cos(th2)), cz: r3(rm2 * Math.sin(th2)),
            len: Math.max(28, tr2.w - 8), depth: 11.2, yaw: th2 + Math.PI / 2,
            side: 'left', cw: 2.0, roomW: 6.4,
            kinds: function (i) { return ['living', 'bedroom', 'kitchen', 'workshop', 'cottage'][i % 5]; },
            wealth: 0.52,
            label: ap2.face + ' Apse Worker Terrace T2'
          });
        }
      }
    } else if (L.zone === 'apse' || L.zone === 'apse_civic') {
      // L3 (Headrace Level Mills & Apse Flats) & L4 (Elevated Civic Market Ring & Upper Belvederes)
      if (L.zone === 'apse') {
        [-1, 1].forEach(function (sgn, hi) {
          addHallPart(AI, parts, walls, rooms, {
            id: id + '.headmill.' + hi, level: L.k, y: L.y, h: L.h,
            cx: sgn * 48, cz: 72, w: 26, hDepth: 15, yaw: 0,
            kind: 'hall', recipe: 'engine-room', category: 'work', job: 'milling',
            label: (sgn < 0 ? 'West' : 'East') + ' Headrace Sluice and Grain Mill'
          });
        });
      } else {
        // L4 (y = 52.2 m): Elevated Civic Exchange, Refectory & Market Arcades buffered cleanly above the Industrial Hall
        [
          { sfx: 'north', cx: 0, cz: -76, yaw: 0, rec: 'reception', cat: 'civic', job: 'customs', label: 'Civic Customs and Guild Registry' },
          { sfx: 'south', cx: 0, cz: 76, yaw: Math.PI, rec: 'dining-hall', cat: 'rec', job: 'baking', label: 'Upper Cataract Overlook Refectory' }
        ].forEach(function (fb) {
          addHallPart(AI, parts, walls, rooms, {
            id: id + '.civic.' + fb.sfx, level: L.k, y: L.y, h: L.h, cx: fb.cx, cz: fb.cz, w: 34, hDepth: 15, yaw: fb.yaw,
            kind: 'hall', recipe: fb.rec, category: fb.cat, job: fb.job, label: fb.label
          });
        });
        [-1, 1].forEach(function (sgn, idx) {
          addBarPart(AI, parts, walls, rooms, {
            id: id + '.market.' + idx, level: L.k, y: L.y, h: L.h,
            cx: sgn * 76, cz: 0, len: 42, depth: 15.0, yaw: Math.PI / 2,
            side: 'both', cw: 2.6, roomW: 6.8,
            kinds: function (i) { return i % 4 === 3 ? 'sickbay' : 'shop'; },
            label: (sgn > 0 ? 'East' : 'West') + ' Elevated Market Arcade'
          });
        });
      }
      var tIdx = L.tier;
      for (var k = 0; k < 8; k++) {
        var ap = P.apses[k], tr = ap.tiers[tIdx];
        if (ap.breached && tIdx >= 3) continue;
        var th = ap.th, rm = (tr.rFront + tr.rBack) * 0.5;
        if (tr.aqueductNotch > 0) {
          [-1, 1].forEach(function (sgn, si) {
            var uOff = sgn * (tr.aqueductNotch + 10.0);
            addBarPart(AI, parts, walls, rooms, {
              id: id + '.apse.' + k + '.' + si, level: L.k, y: L.y, h: L.h,
              cx: r3(rm * Math.cos(th) - uOff * Math.sin(th)),
              cz: r3(rm * Math.sin(th) + uOff * Math.cos(th)),
              len: 15.5, depth: 11.2, yaw: th + Math.PI / 2,
              side: 'left', cw: 2.0, roomW: 6.4,
              kinds: function (i) { return ['living', 'bedroom', 'kitchen'][i % 3]; },
              wealth: 0.54,
              label: 'South Aqueduct Gate Terrace ' + (sgn < 0 ? 'West' : 'East')
            });
          });
          continue;
        }
        var barLen = Math.max(28, tr.w - 8);
        var kindCycle = L.k === 3
          ? (k % 2 === 1 && isRep ? ['dormitory', 'bedroom', 'living', 'kitchen'] : ['living', 'bedroom', 'bedroom', 'kitchen', 'cottage'])
          : ['cottage', 'living', 'bedroom', 'tavern'];
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.apse.' + k, level: L.k, y: L.y, h: L.h,
          cx: r3(rm * Math.cos(th)), cz: r3(rm * Math.sin(th)),
          len: barLen, depth: 11.2, yaw: th + Math.PI / 2,
          side: 'left', cw: 2.0, roomW: 6.4,
          kinds: function (i) { return kindCycle[i % kindCycle.length]; },
          wealth: L.k === 4 ? 0.64 : 0.52,
          label: ap.face + ' Apse Stepped Terrace T' + (tIdx + 1)
        });
      }
    } else if (L.zone === 'waist') {
      // L5 (y = 72.0 m): Recessed Arched Circulation Waist — Drill Halls, Baths/Lounges, Commons Mess (Rec + Work)
      var wHalls = [
        { sfx: 'drill.e', cx: 124, cz: 0, yaw: Math.PI / 2, rec: 'drill-hall', cat: 'rec', job: null, label: 'East Arched Belvedere Drill Hall' },
        { sfx: 'drill.w', cx: -124, cz: 0, yaw: -Math.PI / 2, rec: 'drill-hall', cat: 'rec', job: null, label: 'West Arched Gymnasium and Bath Hall' },
        { sfx: 'mess.s', cx: 0, cz: 124, yaw: Math.PI, rec: 'crew-mess', cat: 'rec', job: 'baking', label: 'South Transfer Belvedere Commons' },
        { sfx: 'gallery.n', cx: 0, cz: -124, yaw: 0, rec: 'gallery', cat: 'rec', job: null, label: 'North Belvedere Promenade Gallery' }
      ];
      wHalls.forEach(function (wh) {
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.' + wh.sfx, level: L.k, y: L.y, h: L.h, cx: wh.cx, cz: wh.cz, w: 36, hDepth: 18, yaw: wh.yaw,
          kind: 'hall', recipe: wh.rec, category: wh.cat, job: wh.job, label: wh.label
        });
      });
      for (var diag = 1; diag < 8; diag += 2) {
        var dth = AV.faceAngle(diag), dr = 124.0;
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.waistbar.' + diag, level: L.k, y: L.y, h: L.h,
          cx: r3(dr * Math.cos(dth)), cz: r3(dr * Math.sin(dth)),
          len: 36, depth: 15.0, yaw: dth + Math.PI / 2,
          side: 'both', cw: 2.4, roomW: 6.5,
          kinds: function (i) { return ['bath', 'tavern', 'workshop', 'store'][i % 4]; },
          label: P.apses[diag].face + ' Waist Bath and Plant Wing'
        });
      }
    } else if (L.zone === 'mid_work' || L.zone === 'mid_mix' || L.zone === 'mid_res') {
      // L6, L7, L8 (y = 93.6, 108.0, 122.4 m): Soleri Sheet 2 #1 Midlevel Plan!
      // Inner concentric ring around the 66 x 66 m LIGHT WELL + 8 outer octagonal ring segments!
      var innerKinds = L.zone === 'mid_work'
        ? ['study', 'shop', 'antechamber', 'study']
        : L.zone === 'mid_mix'
          ? ['library', 'study', 'shop', 'hall']
          : ['hall', 'tavern', 'kitchen', 'sickbay'];
      for (var ik = 0; ik < 4; ik++) {
        var ia = ik * (Math.PI / 2), ir = 46.0;
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.inner.' + ik, level: L.k, y: L.y, h: L.h,
          cx: r3(ir * Math.cos(ia)), cz: r3(ir * Math.sin(ia)),
          len: 44, depth: 14.0, yaw: ia + Math.PI / 2,
          side: 'both', cw: 2.2, roomW: 6.6,
          kinds: function (i) { return innerKinds[i % innerKinds.length]; },
          wealth: 0.62,
          label: 'Light-Well Inner Gallery ' + (ik + 1)
        });
      }
      var outerKinds = L.zone === 'mid_work'
        ? ['workshop', 'smithy', 'study', 'store', 'shop']
        : L.zone === 'mid_mix'
          ? ['workshop', 'cottage', 'living', 'bedroom', 'kitchen', 'study']
          : ['living', 'bedroom', 'bedroom', 'kitchen', 'bath', 'cottage', 'dormitory'];
      for (var ok = 0; ok < 8; ok++) {
        if (P.state === 'ruined' && ok === 5 && L.k >= 8) continue;
        var oth = AV.faceAngle(ok), orad = 133.0;
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.outer.' + ok, level: L.k, y: L.y, h: L.h,
          cx: r3(orad * Math.cos(oth)), cz: r3(orad * Math.sin(oth)),
          len: 58, depth: 18.0, yaw: oth + Math.PI / 2,
          side: 'both', cw: 2.6, roomW: 6.6,
          kinds: function (i, n, sideName) {
            /* Outer promenade side gets living/light rooms; inner side gets workshops/kitchens/baths */
            if (L.zone === 'mid_mix') return sideName === 'right' ? (i % 2 === 0 ? 'living' : 'bedroom') : (i % 2 === 0 ? 'workshop' : 'kitchen');
            return outerKinds[(i + ok) % outerKinds.length];
          },
          wealth: L.zone === 'mid_res' ? 0.58 : 0.54,
          label: P.apses[ok].face + ' Midlevel Promenade Wing'
        });
      }
      // Spoke bridge lounges on the 4 diagonal axes at L6 & L7
      if (L.k === 6 || L.k === 7) {
        for (var sb = 0; sb < 8; sb += 2) {
          var bth = P.bridges[sb].th, br = 86.0;
          addHallPart(AI, parts, walls, rooms, {
            id: id + '.spoke.' + sb, level: L.k, y: L.y, h: L.h,
            cx: r3(br * Math.cos(bth)), cz: r3(br * Math.sin(bth)), w: 9.2, hDepth: 26.0, yaw: bth,
            kind: 'hall', recipe: null, category: 'rec', job: null, label: 'Radial Spoke Bridge Lounge ' + (sb + 1)
          });
        }
      }
    } else if (L.zone === 'collar_work' || L.zone === 'collar_court') {
      // L9 (y = 144.0 m) & L10 (y = 158.4 m): Inverted-Pyramid Cantilevered Upper Collar
      var crad = L.zone === 'collar_work' ? 132.0 : 138.0;
      var hallSet = L.zone === 'collar_work'
        ? [
          { k: 0, rec: 'officers-hall', cat: 'civic', job: 'customs', label: 'East Guildmasters Chamber' },
          { k: 2, rec: 'reception', cat: 'civic', job: 'scribing', label: 'South Mint and Chancery Hall' },
          { k: 4, rec: 'store-hall', cat: 'work', job: 'warehousing', label: 'West Guild Assay Reserve' },
          { k: 6, rec: 'engine-room', cat: 'work', job: 'smithing', label: 'North Salvage Terminal Laboratory' }
        ]
        : [
          { k: 0, rec: 'dining-hall', cat: 'rec', job: null, label: 'East Burghers Banquet Hall' },
          { k: 2, rec: 'officers-hall', cat: 'civic', job: null, label: 'South Consular Salon' },
          { k: 4, rec: 'gallery', cat: 'rec', job: null, label: 'West Lyceum Lecture Gallery' },
          { k: 6, rec: 'reception', cat: 'civic', job: 'scribing', label: 'North High Registry' }
        ];
      hallSet.forEach(function (hs) {
        var hth = AV.faceAngle(hs.k);
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.hall.' + hs.k, level: L.k, y: L.y, h: L.h,
          cx: r3(crad * Math.cos(hth)), cz: r3(crad * Math.sin(hth)), w: 38, hDepth: 18, yaw: hth + Math.PI / 2,
          kind: 'hall', recipe: hs.rec, category: hs.cat, job: hs.job, wealth: 0.82, label: hs.label
        });
      });
      var barKinds = L.zone === 'collar_work'
        ? ['workshop', 'study', 'library', 'shop']
        : ['living', 'bedroom', 'bedroom', 'kitchen', 'bath', 'study'];
      for (var ck = 1; ck < 8; ck += 2) {
        if (P.state === 'ruined' && (ck === 1 || ck === 5)) continue;
        var cth = AV.faceAngle(ck);
        addBarPart(AI, parts, walls, rooms, {
          id: id + '.bar.' + ck, level: L.k, y: L.y, h: L.h,
          cx: r3(crad * Math.cos(cth)), cz: r3(crad * Math.sin(cth)),
          len: 54, depth: 18.0, yaw: cth + Math.PI / 2,
          side: 'both', cw: 2.6, roomW: 7.0,
          kinds: function (i) { return barKinds[i % barKinds.length]; },
          wealth: L.zone === 'collar_court' ? 0.85 : 0.68,
          label: P.apses[ck].face + (L.zone === 'collar_court' ? ' Court Suites' : ' Collar Guild Works')
        });
      }
    } else if (L.zone === 'roof') {
      // L11 (y = 172.8 m): Sheet 2 #3 Roof Plan — Cultural Center (S), Playgrounds (E/W), Sky-Pad Control (N)
      var RF = AV.DIM.ROOF;
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.assembly', level: L.k, y: L.y, h: 7.2,
        cx: 0, cz: RF.cultural.cz, w: 34, hDepth: 28, yaw: Math.PI,
        kind: 'hall', recipe: 'officers-hall', category: 'civic', job: 'customs', wealth: 0.9,
        label: 'Cultural Center Peoples Assembly Hall'
      });
      [-1, 1].forEach(function (sgn, li) {
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.lyceum.' + li, level: L.k, y: L.y, h: 6.0,
          cx: sgn * 33, cz: RF.cultural.cz, w: 26, hDepth: 22, yaw: Math.PI,
          kind: 'library', recipe: 'gallery', category: 'civic', job: 'scribing', wealth: 0.82,
          label: sgn < 0 ? 'Cultural Center West Archive' : 'Cultural Center East Lyceum'
        });
      });
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.play.west', level: L.k, y: L.y, h: 5.6,
        cx: RF.playWest.cx, cz: 0, w: 26, hDepth: 24, yaw: Math.PI / 2,
        kind: 'hall', recipe: 'drill-hall', category: 'rec', job: null, wealth: 0.65,
        label: 'West Roof Playground Athletic Hall'
      });
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.play.east', level: L.k, y: L.y, h: 5.6,
        cx: RF.playEast.cx, cz: 0, w: 26, hDepth: 24, yaw: -Math.PI / 2,
        kind: 'hall', recipe: 'crew-mess', category: 'rec', job: 'brewing', wealth: 0.65,
        label: 'East Roof Recreation Clubhouse'
      });
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.skypad', level: L.k, y: L.y + RF.skypad.h, h: 4.8,
        cx: 0, cz: RF.skypad.cz, w: 24, hDepth: 18, yaw: 0,
        kind: 'study', recipe: 'bridge', category: 'work', job: 'warehousing', wealth: 0.72,
        label: 'North Sky-Pad Semaphore and Crane House'
      });
    } else if (L.zone === 'crown_farm') {
      // L12 (y = 187.2 m): Faceted Pyramidal Crown — 4 Hydroponic & Botanical Conservatory Wings
      for (var gk = 0; gk < 4; gk++) {
        var gth = gk * (Math.PI / 2) + (Math.PI / 4), gr = 48.0;
        addHallPart(AI, parts, walls, rooms, {
          id: id + '.conservatory.' + gk, level: L.k, y: L.y, h: L.h,
          cx: r3(gr * Math.cos(gth)), cz: r3(gr * Math.sin(gth)), w: 24, hDepth: 18, yaw: gth + Math.PI,
          kind: 'greenhouse', recipe: 'greenhouse', category: 'work', job: 'farming', wealth: 0.70,
          label: 'Pyramidal Crown Conservatory Wing ' + (gk + 1)
        });
      }
    } else if (L.zone === 'crown_obs') {
      // L13 (y = 201.6 m): Faceted Pyramidal Crown — Consuls High Observatory & Signal Bridge
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.observatory.n', level: L.k, y: L.y, h: L.h,
        cx: 0, cz: -19, w: 24, hDepth: 18, yaw: 0,
        kind: 'study', recipe: 'bridge', category: 'civic', job: 'scribing', wealth: 0.90,
        label: 'Consuls High Observatory and Signal Bridge'
      });
      addHallPart(AI, parts, walls, rooms, {
        id: id + '.council.s', level: L.k, y: L.y, h: L.h,
        cx: 0, cz: 19, w: 24, hDepth: 16, yaw: Math.PI,
        kind: 'hall', recipe: 'reception', category: 'civic', job: 'customs', wealth: 0.90,
        label: 'High Beacon Chamber'
      });
    }

    // Ruin decay on damaged upper decks
    if (P.state === 'ruined' && L.k >= 8 && AI.ruinStorey) {
      var st0 = mergeStorey(id, L, parts, rooms, walls);
      AI.ruinStorey(st0, P.id + '|' + L.k, { frac: 0.42 });
      return st0;
    }
    return mergeStorey(id, L, parts, rooms, walls);
  };

  // ---- Settlement simulation hand-over summary: housing, jobs, rec, civic, and portals ----
  // Scales the 14 modelled representative decks by the full 46-storey vertical stack so SIM gets both exact
  // per-room records AND total arcology capacity (~8,400-9,000 people at full occupancy, matching Soleri's 9,000!).
  AV.settlementSlots = function (P, AI_arg) {
    var plan = P || AV.plan({ state: 'refurbished' });
    var AI = AI_arg || (typeof KratorAncientsInteriors !== 'undefined' ? KratorAncientsInteriors : null);
    var catCounts = { living: 0, work: 0, rec: 0, civic: 0 };
    var jobs = {}, directBeds = 0, directRooms = 0;
    plan.decks.forEach(function (D) {
      if (D.ruined) return;
      var st = AV.storey(plan, D.k, AI);
      st.rooms.forEach(function (R) {
        if (R.kind === 'corridor' || R.kind === 'core' || R.open) return;
        directRooms++;
        var cat = R.category || 'civic';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
        var m = KIND_META[R.kind];
        if (m && m.beds) directBeds += m.beds;
        if (R.job) jobs[R.job] = (jobs[R.job] || 0) + (R.recipe ? 8 : 3);
      });
    });
    /* Full-stack multiplier: 14 modelled decks represent the 46 physical storeys of the 220 m complex (~3.25x) */
    var stackMul = plan.state === 'ruined' ? 1.2 : 3.25;
    var totalBeds = Math.round(directBeds * stackMul);
    return {
      id: plan.id,
      state: plan.state,
      culture: plan.culture,
      modelledDecks: plan.decks.length,
      modelledRooms: directRooms,
      categories: catCounts,
      directBeds: directBeds,
      capacityPopulation: Math.round(totalBeds * 3.2),
      households: Math.round(totalBeds / 2.4),
      jobs: jobs,
      recVenues: catCounts.rec,
      civicVenues: catCounts.civic,
      portals: AV.portals(plan)
    };
  };
})();
