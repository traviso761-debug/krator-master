// prefix: tr
// ================================================================= TRANSIT KIT — Canal Vessel Registry & Eternian Barges ([draw])
// Modelled directly on kits/ringsea/API.md's RS_VESSEL contract:
//   - Vessel frame: origin amidships ON THE WATERLINE (y = 0), bow +x, starboard +z, port -z.
//   - build(opt) opens with reseed(N) and returns { group, anims, deckY, walkRect, solids }.
//   - Registered in KTAGS (core/tags) as class 'vessel' with valid 52-core-tags-vocab.js tags.
var TR_VESSELS = { defs: {}, order: [] };

function TR_VESSEL(def) {
  TR_VESSELS.defs[def.key] = def;
  if (TR_VESSELS.order.indexOf(def.key) < 0) TR_VESSELS.order.push(def.key);
  return def;
}

(function (K) {
  'use strict';

  var PI = Math.PI;
  var G = K.geom;

  /* Bluff-bowed flat-bottomed canal hull in Ring Sea vessel frame (bow +x, starboard +z, waterline y = 0):
     xHull0..xHull1 along X, half-beam hb along +-Z, sole at -draft, deck at +fb (+sheer at ends). */
  function trCanalHull(B, st, cfg) {
    var x0 = cfg.x0, x1 = cfg.x1;
    var hb = cfg.hb;
    var draft = cfg.draft;
    var fb = cfg.fb;
    var sheerF = cfg.sheerF == null ? 0.20 : +cfg.sheerF;
    var sheerA = cfg.sheerA == null ? 0.14 : +cfg.sheerA;
    var midX = 0.5 * (x0 + x1), halfL = 0.5 * (x1 - x0);

    function beamScale(x) {
      var u = (x - midX) / halfL; /* -1 stern .. +1 bow */
      if (u > 0.48) {
        /* Bluff Eternian spoon-scow bow rounding smoothly to stem */
        var f = (u - 0.48) / 0.52;
        return Math.max(0.18, Math.pow(Math.max(0, 1 - f * f), 0.58));
      }
      if (u < -0.56) {
        /* Tapered canal run aft toward rudder post */
        var a = (-0.56 - u) / 0.44;
        return Math.max(0.26, Math.pow(Math.max(0, 1 - a * a * 0.92), 0.65));
      }
      return 1.0;
    }

    function sheerAt(x) {
      var u = (x - midX) / halfL;
      return u >= 0 ? sheerF * u * u : sheerA * u * u;
    }

    function rakeBottom(x) {
      var u = (x - midX) / halfL;
      /* Spoon swim-head rises at bow (+x) and counter rises at stern (-x) so barge glides over lock sills */
      if (u > 0.62) return draft * (1 - 0.58 * Math.pow((u - 0.62) / 0.38, 1.6));
      if (u < -0.68) return draft * (1 - 0.52 * Math.pow((-0.68 - u) / 0.32, 1.5));
      return draft;
    }

    /* Hull shell: u in [0..1] wraps port gunwale (-z) -> sole (-y) -> starboard gunwale (+z); v in [0..1] stern->bow */
    G.psurf(B, 'timber', function (u, v) {
      var x = K.lerp(x0, x1, v);
      var bS = beamScale(x);
      var sh = sheerAt(x);
      var dep = rakeBottom(x);
      var a = (u - 0.5) * PI; /* -PI/2 port .. 0 bottom .. +PI/2 starboard */
      var sa = Math.sin(a), ca = Math.cos(a);
      var z = Math.sign(sa) * Math.pow(Math.abs(sa), 0.52) * hb * bS;
      var y = -dep + (dep + fb + sh) * (1 - Math.pow(ca, 1.75));
      return [x, y, z];
    }, 18, 24, st.timber, false, function (u) {
      var h = Math.abs(u - 0.5) * 2.0;
      return h < 0.45 ? 0x261c15 : (h > 0.88 ? st.timberL : st.timber);
    });

    /* Bow & stern transom end-closures */
    var ends = [[x0, true], [x1, false]];
    for (var ei = 0; ei < 2; ei++) {
      var ex = ends[ei][0], isStern = ends[ei][1];
      var eb = hb * beamScale(ex), esh = sheerAt(ex), edep = rakeBottom(ex);
      G.poly(B, 'timber', [
        [ex, fb + esh, -eb],
        [ex, -edep * 0.75, -eb * 0.65],
        [ex, -edep, 0],
        [ex, -edep * 0.75, eb * 0.65],
        [ex, fb + esh, eb]
      ], st.timber, true);
      if (isStern) {
        G.box(B, 'bronze', ex - 0.02, fb + esh - 0.14, 0, 0.08, 0.16, eb * 1.85, st.bronze);
      }
    }

    /* Cambered planked main deck */
    G.psurf(B, 'planks', function (u, v) {
      var x = K.lerp(x0 + 0.12, x1 - 0.12, v);
      var bS = beamScale(x);
      var sh = sheerAt(x);
      var s = u * 2 - 1;
      var z = s * hb * 0.96 * bS;
      var camber = 0.05 * (1 - s * s);
      return [x, fb + sh + camber, z];
    }, 8, 20, st.planks, true);

    /* Heavy gunwale rubbing wales reaching exact +-B/2 along parallel middle body (protecting hull in masonry locks!) */
    var rubHalf = cfg.rubHalf == null ? hb + 0.06 : +cfg.rubHalf;
    var pLen0 = midX - halfL * 0.52, pLen1 = midX + halfL * 0.46;
    var sides = [-1, 1];
    for (var si = 0; si < 2; si++) {
      var sz = sides[si];
      G.box(B, 'bronze', 0.5 * (pLen0 + pLen1), fb * 0.62, sz * (rubHalf - 0.045), pLen1 - pLen0, 0.13, 0.09, st.bronze);
      G.box(B, 'timber', 0.5 * (pLen0 + pLen1), fb + 0.01, sz * (hb * 0.95), pLen1 - pLen0, 0.10, 0.10, st.timberL);
    }

    return {
      deckAt: function (x) { return fb + sheerAt(x) + 0.04; },
      beamAt: function (x) { return hb * beamScale(x); }
    };
  }

  /* ================================================================
     1. FEATURED VESSEL: et_canal_barge — Eternian Canal Cargo Barge
        L = 16.50 m, B = 3.60 m, H = 1.88 m air-draft, draft = 1.05 m
     ================================================================ */
  function buildEtCanalBarge(opt) {
    var v = (opt && (opt.v != null ? opt.v : opt.variant)) | 0;
    K.reseed(75100 + v * 17);
    var st = K.getStyle('eternian');
    var B = G.bucket();

    /* Hull shell: x in [-7.35, +8.16], hb = 1.74, rubHalf = 1.80 -> exact B = 3.60 m; sole at -1.05 m -> exact draft = 1.05 m */
    var H = trCanalHull(B, st, {
      x0: -7.35, x1: 8.16,
      hb: 1.74, rubHalf: 1.80,
      draft: 1.05, fb: 0.54,
      sheerF: 0.20, sheerA: 0.14
    });

    /* Spoon-bow curved cast-bronze stem-band & closed-eye Eternian State prow medallion (reaches x = +8.25 m exact!) */
    G.box(B, 'bronze', 8.19, -0.45, 0, 0.12, 1.26, 0.20, st.bronze);
    G.sph(B, 'bronze', 8.17, 0.46, 0, 0.16, st.gold, [0.50, 1.15, 0.95], 8);
    /* Rope/reed bow bumper bolster for lock miter gates */
    for (var fz = -0.85; fz <= 0.85; fz += 0.425) {
      G.sph(B, 'reed', 8.05, 0.56, fz, 0.15, st.reed, [0.75, 0.75, 1.35], 8);
    }

    /* Long stern sweep-rudder over heavy ironwood rudder post (aft blade reaches x = -8.25 m exact -> L = 16.50 m!) */
    G.box(B, 'timber', -7.46, -0.92, 0, 0.20, 1.78, 0.18, st.timber);
    G.box(B, 'bronze', -7.46, 0.42, 0, 0.24, 0.10, 0.22, st.bronze);
    G.box(B, 'bronze', -7.46, -0.35, 0, 0.24, 0.10, 0.22, st.bronze);
    /* Wide canal rudder blade (-8.25 .. -7.50) & curved wooden tiller sweeping forward to helmsman stand */
    G.box(B, 'timber', -7.875, -0.82, 0, 0.75, 1.08, 0.09, st.timberL);
    G.box(B, 'bronze', -7.875, 0.16, 0, 0.75, 0.08, 0.11, st.bronze);
    G.beam(B, 'timber', [-7.46, 0.92, 0], [-6.58, 1.06, 0], 0.055, st.timberL, 8);

    /* Aft White-Plaster & Dark-Timber Low Deckhouse (x in [-6.55, -3.55], z in [-1.30, +1.30])
       with green-glazed Eternian celadon roof & sliding shutter windows */
    var cabX = -5.05, cabW = 3.00, cabD = 2.52, cabY = 0.58, cabH = 0.92;
    G.box(B, 'lime', cabX, cabY, 0, cabW - 0.08, cabH, cabD - 0.08, st.lime);
    /* Dark ironwood corner posts, sill & eave ring-beam */
    var cxOff = [-cabW * 0.5 + 0.06, cabW * 0.5 - 0.06];
    var czOff = [-cabD * 0.5 + 0.06, cabD * 0.5 - 0.06];
    for (var ci = 0; ci < 2; ci++) {
      for (var cj = 0; cj < 2; cj++) {
        G.box(B, 'timber', cabX + cxOff[ci], cabY, czOff[cj], 0.13, cabH + 0.04, 0.13, st.timber);
      }
    }
    G.box(B, 'timber', cabX, cabY + cabH - 0.06, 0, cabW + 0.02, 0.08, cabD + 0.02, st.timber);
    /* Port & starboard sliding celadon-shutter windows + lit amber cabin panes */
    var winXs = [cabX - 0.72, cabX + 0.68];
    for (var wi = 0; wi < 2; wi++) {
      for (var si = -1; si <= 1; si += 2) {
        var wz = si * (cabD * 0.5 - 0.02);
        G.box(B, 'glass', winXs[wi], cabY + 0.34, wz, 0.54, 0.36, 0.06, st.glassLit);
        G.box(B, 'celadon', winXs[wi] + 0.32, cabY + 0.32, wz + si * 0.02, 0.28, 0.40, 0.05, st.celadon);
        G.box(B, 'timber', winXs[wi] + 0.06, cabY + 0.28, wz, 0.88, 0.05, 0.08, st.timber);
      }
    }
    /* Forward companionway hatch door facing cargo well (+x) */
    G.box(B, 'timber', cabX + cabW * 0.5 - 0.02, cabY + 0.06, 0, 0.08, 0.78, 0.66, st.timberL);
    /* Green-glazed Eternian celadon flared hip roof (ridge at y = 0.58 + 0.92 + 0.32 = 1.82 m < 1.88 m!) */
    G.hipRoof(B, 'celadon', cabX, cabY + cabH, 0, cabW, cabD, 0.32, st.celadon, 0.16, 0.12);

    /* Midships Cargo Coaming & Removable Cambered Hatch-Boards (x in [-3.25, +4.45], z in [-1.32, +1.32]) */
    var holdX = 0.60, holdL = 7.60, holdW = 2.64;
    G.box(B, 'timber', holdX, 0.54, -holdW * 0.5 + 0.07, holdL, 0.34, 0.14, st.timber);
    G.box(B, 'timber', holdX, 0.54, +holdW * 0.5 - 0.07, holdL, 0.34, 0.14, st.timber);
    G.box(B, 'timber', holdX - holdL * 0.5 + 0.07, 0.54, 0, 0.14, 0.34, holdW, st.timber);
    G.box(B, 'timber', holdX + holdL * 0.5 - 0.07, 0.54, 0, 0.14, 0.34, holdW, st.timber);
    G.box(B, 'planks', holdX, 0.54, 0, holdL - 0.24, 0.18, holdW - 0.24, 0x342519);

    /* Two removable cambered timber hatch-board sections covering forward & aft ends of hold, open freight amidships */
    var hSecs = [-2.55, 3.72];
    for (var hi = 0; hi < hSecs.length; hi++) {
      var hx = hSecs[hi];
      G.box(B, 'planks', hx, 0.86, 0, 1.16, 0.09, holdW - 0.08, st.timberL);
      G.box(B, 'bronze', hx, 0.91, 0, 1.18, 0.04, 0.14, st.bronze);
    }

    /* Freight payload variants (v = 0..3):
       0 = stacked state rice sacks + bound celadon porcelain crates (signature Eternian canal cargo!)
       1 = corded celadon & alabaster porcelain kiln crates
       2 = anthracite coal bulk load
       3 = bronze-bound Valley salvage assay chests */
    if (v === 0) {
      for (var rx = -1.65; rx <= 0.85; rx += 1.22) {
        for (var rz = -0.68; rz <= 0.68; rz += 0.68) {
          G.sph(B, 'reed', rx, 0.95, rz, 0.38, st.reed, [1.35, 0.62, 0.85], 8);
          G.sph(B, 'reed', rx + 0.08, 1.28, rz * 0.82, 0.35, st.silt, [1.28, 0.58, 0.80], 8);
        }
      }
      for (var cx = 1.65; cx <= 2.75; cx += 1.08) {
        for (var cz = -0.56; cz <= 0.56; cz += 1.12) {
          G.box(B, 'timber', cx, 0.72, cz, 0.94, 0.68, 0.96, st.timberL);
          G.box(B, 'celadon', cx, 1.40, cz, 0.76, 0.12, 0.78, st.celadon);
          G.box(B, 'bronze', cx, 1.04, cz, 0.98, 0.05, 1.00, st.bronze);
        }
      }
    } else if (v === 1) {
      for (var px = -1.65; px <= 2.75; px += 1.44) {
        for (var pz = -0.56; pz <= 0.56; pz += 1.12) {
          G.box(B, 'timber', px, 0.72, pz, 1.22, 0.72, 0.98, st.timberL);
          G.box(B, 'celadon', px, 1.44, pz, 0.92, 0.14, 0.78, st.celadon);
        }
      }
    } else if (v === 2) {
      G.psurf(B, 'stone', function (u, vv) {
        var x = K.lerp(-1.90, 3.05, vv);
        var z = (u * 2 - 1) * 1.14;
        var mound = Math.sin(u * PI) * Math.sin(vv * PI);
        return [x, 0.78 + 0.72 * mound, z];
      }, 6, 10, 0x22252a, true);
    } else {
      for (var sx = -1.45; sx <= 2.55; sx += 1.95) {
        G.box(B, 'lead', sx, 0.72, 0, 1.55, 0.68, 1.92, st.lead);
        G.box(B, 'bronze', sx, 1.40, 0, 1.62, 0.08, 1.98, st.bronze);
        G.ring(B, 'gold', sx, 1.50, 0, 0.24, 0.035, st.gold);
      }
    }

    /* Folding Tow-Mast in Cast-Bronze Tabernacle Forward (x = +4.95 m) + Aft Crutch (top of mast at y = +1.88 m exact H!) */
    G.box(B, 'bronze', 4.95, 0.58, 0, 0.34, 1.06, 0.32, st.bronze);
    G.box(B, 'timber', -3.38, 0.88, 0, 0.14, 0.88, 0.26, st.timber);
    /* Mast spar raked from tabernacle (y=1.62) to crutch above cabin eave (peak y=1.80 + rad 0.08 = 1.88 m exact!) */
    G.beam(B, 'timber', [5.15, 1.62, 0], [-3.48, 1.80, 0], 0.08, st.timberL, 8);
    G.ring(B, 'bronze', 2.20, 1.70, 0, 0.10, 0.025, st.bronze, 0, PI * 0.5);

    /* Twin Cast-Bronze Towing Bollard Bitts Forward, Coiled Hemp Hawser, Racked Quanting Poles & Verdigris Bow Lantern */
    G.box(B, 'timber', 6.55, 0.62, 0, 0.38, 0.14, 1.56, st.timber);
    G.cyl(B, 'bronze', 6.55, 0.76, -0.52, 0.10, 0.11, 0.44, st.bronze, 8);
    G.cyl(B, 'bronze', 6.55, 0.76, +0.52, 0.10, 0.11, 0.44, st.bronze, 8);
    G.beam(B, 'bronze', [6.55, 1.06, -0.68], [6.55, 1.06, +0.68], 0.045, st.bronze, 6);
    G.ring(B, 'reed', 5.85, 0.68, 0.62, 0.32, 0.08, st.reed);
    /* Racked bamboo quanting poles along port & starboard side-decks */
    G.beam(B, 'reed', [-3.10, 0.90, -1.48], [4.35, 0.92, -1.48], 0.035, st.reed, 6);
    G.beam(B, 'reed', [-3.10, 0.90, +1.48], [4.35, 0.92, +1.48], 0.035, st.reed, 6);
    /* Verdigris bow navigation lantern (top at y = 1.56 m < 1.88 m) */
    G.cyl(B, 'verdigris', 7.42, 0.68, 0, 0.045, 0.055, 0.52, st.verdigris, 6);
    G.box(B, 'glass', 7.42, 1.20, 0, 0.19, 0.24, 0.19, st.glassLit);
    G.cone(B, 'verdigris', 7.42, 1.44, 0, 0.16, 0.18, st.verdigris, 4);
    B.lights.push([7.42, 1.32, 0]);

    var grp = G.bake(B, null, 'et_canal_barge');
    var solids = [{ min: [cabX - cabW * 0.5, cabY, -cabD * 0.5], max: [cabX + cabW * 0.5, cabY + cabH + 0.32, cabD * 0.5] }];
    grp.userData.solids = solids;
    return {
      group: grp,
      anims: [],
      deckY: H.deckAt(0),
      walkRect: [-7.10, 7.60, -1.52, 1.52],
      solids: solids
    };
  }

  TR_VESSEL({
    key: 'et_canal_barge',
    name: 'Eternian Canal Cargo Barge',
    culture: 'eternian',
    kind: 'barge',
    L: 16.5,
    B: 3.6,
    H: 1.88,
    draft: 1.05,
    tags: {
      type: ['cargo', 'barge'],
      propulsion: ['tow', 'pole'],
      hull: 'monohull',
      wealth: 'middle',
      crew: 4,
      role: 'canal-barge'
    },
    blurb: '16.5 x 3.6 m Eternian state canal cargo barge sized for 22-27 m miter locks and 2.6 m bridges: spoon-scow bow with bronze stem-band, white-plaster & dark-timber aft deckhouse under green-glazed celadon tile, cambered hatch-boards over rice & porcelain freight, folding tabernacle tow-mast and stern sweep-rudder.',
    build: buildEtCanalBarge
  });

  /* ================================================================
     2. et_tow_scow — Eternian Ward Lighter / Clay & Coal Scow
        L = 11.60 m, B = 3.00 m, H = 1.32 m air-draft, draft = 0.72 m
     ================================================================ */
  function buildEtTowScow(opt) {
    var v = (opt && (opt.v != null ? opt.v : opt.variant)) | 0;
    K.reseed(75200 + v * 13);
    var st = K.getStyle('eternian');
    var B = G.bucket();

    var H = trCanalHull(B, st, {
      x0: -5.45, x1: 5.74,
      hb: 1.44, rubHalf: 1.50,
      draft: 0.72, fb: 0.42,
      sheerF: 0.14, sheerA: 0.10
    });
    /* Bow stem-cap (+5.80) & stern rudder (-5.80) -> exact L = 11.60 m */
    G.box(B, 'bronze', 5.76, -0.28, 0, 0.08, 0.86, 0.16, st.bronze);
    G.box(B, 'timber', -5.625, -0.56, 0, 0.35, 0.88, 0.08, st.timberL);
    G.beam(B, 'timber', [-5.45, 0.68, 0], [-4.65, 0.82, 0], 0.045, st.timberL, 6);

    /* Open cargo well + kaolin / coal mound + bow lamp post reaching y = 1.32 m exact H */
    G.box(B, 'timber', 0.15, 0.40, 0, 6.80, 0.34, 2.18, st.timber);
    var mc = v === 0 ? st.alabaster : 0x26282c;
    G.psurf(B, 'earth', function (u, vv) {
      var x = 0.15 + (vv * 2 - 1) * 3.10;
      var z = (u * 2 - 1) * 0.96;
      return [x, 0.72 + 0.44 * Math.sin(u * PI) * Math.sin(vv * PI), z];
    }, 5, 8, mc, true);

    G.beam(B, 'reed', [-3.6, 0.78, 1.18], [3.9, 0.80, 1.18], 0.04, st.reed, 6);
    G.cyl(B, 'bronze', 4.75, 0.50, 0, 0.085, 0.095, 0.38, st.bronze, 8);
    G.cyl(B, 'verdigris', 5.20, 0.52, 0, 0.04, 0.05, 0.44, st.verdigris, 6);
    G.box(B, 'glass', 5.20, 0.96, 0, 0.16, 0.20, 0.16, st.glassLit);
    G.cone(B, 'verdigris', 5.20, 1.16, 0, 0.13, 0.16, st.verdigris, 4);
    B.lights.push([5.20, 1.06, 0]);

    var grp = G.bake(B, null, 'et_tow_scow');
    return {
      group: grp,
      anims: [],
      deckY: H.deckAt(0),
      walkRect: [-5.10, 5.30, -1.24, 1.24],
      solids: []
    };
  }

  TR_VESSEL({
    key: 'et_tow_scow',
    name: 'Eternian Canal Tow Scow',
    culture: 'eternian',
    kind: 'scow',
    L: 11.6,
    B: 3.0,
    H: 1.32,
    draft: 0.72,
    tags: {
      type: ['barge', 'cargo'],
      propulsion: ['pole', 'tow'],
      hull: 'monohull',
      wealth: 'poor',
      crew: 2,
      role: 'ward-scow'
    },
    blurb: '11.6 x 3.0 m flat-bottomed ward scow poled and towed along kiln and market laterals with kaolin clay or coal.',
    build: buildEtTowScow
  });

  /* ================================================================
     3. et_inspection_launch — Canal Intendancy Inspection Launch
        L = 10.20 m, B = 2.40 m, H = 1.72 m air-draft, draft = 0.65 m
     ================================================================ */
  function buildEtInspectionLaunch(opt) {
    var v = (opt && (opt.v != null ? opt.v : opt.variant)) | 0;
    K.reseed(75300 + v * 11);
    var st = K.getStyle('eternian');
    var B = G.bucket();

    var H = trCanalHull(B, st, {
      x0: -4.82, x1: 5.04,
      hb: 1.14, rubHalf: 1.20,
      draft: 0.65, fb: 0.44,
      sheerF: 0.18, sheerA: 0.12
    });
    /* Prow emblem (+5.10) & rudder (-5.10) -> exact L = 10.20 m */
    G.box(B, 'bronze', 5.06, -0.22, 0, 0.08, 0.84, 0.14, st.bronze);
    G.reliefEmblem(B, st, 4.96, 0.58, 0, 0.36, PI * 0.5);
    G.box(B, 'timber', -4.96, -0.48, 0, 0.28, 0.78, 0.07, st.timberL);

    /* Bronze stanchions + low celadon canopy (ridge at y = 1.46 + 0.26 = 1.72 m exact H!) */
    var pxList = [-2.15, 0.0, 2.15], pzList = [-0.82, 0.82];
    for (var i = 0; i < pxList.length; i++) {
      for (var j = 0; j < pzList.length; j++) {
        G.cyl(B, 'bronze', pxList[i], 0.46, pzList[j], 0.032, 0.035, 1.00, st.bronze, 6);
      }
    }
    G.hipRoof(B, 'celadon', 0.0, 1.46, 0.0, 4.85, 1.88, 0.26, st.celadon, 0.14, 0.10);
    G.box(B, 'timber', -1.15, 0.46, 0, 0.52, 0.34, 1.42, st.timberL);
    G.box(B, 'timber', +1.15, 0.46, 0, 0.52, 0.34, 1.42, st.timberL);
    G.cyl(B, 'verdigris', 4.30, 0.54, 0, 0.04, 0.05, 0.54, st.verdigris, 6);
    G.box(B, 'glass', 4.30, 1.08, 0, 0.17, 0.22, 0.17, st.glassLit);
    G.cone(B, 'verdigris', 4.30, 1.30, 0, 0.14, 0.16, st.verdigris, 4);
    B.lights.push([4.30, 1.19, 0]);

    var grp = G.bake(B, null, 'et_inspection_launch');
    return {
      group: grp,
      anims: [],
      deckY: H.deckAt(0),
      walkRect: [-4.50, 4.65, -0.98, 0.98],
      solids: []
    };
  }

  TR_VESSEL({
    key: 'et_inspection_launch',
    name: 'Canal Intendancy Inspection Launch',
    culture: 'eternian',
    kind: 'launch',
    L: 10.2,
    B: 2.4,
    H: 1.72,
    draft: 0.65,
    tags: {
      type: ['patrol', 'state'],
      propulsion: ['oar', 'pole'],
      hull: 'monohull',
      wealth: 'rich',
      crew: 4,
      role: 'inspection-launch'
    },
    blurb: '10.2 x 2.4 m brass-trimmed official Canal Intendancy launch with celadon awning and closed-eye bronze prow emblem.',
    build: buildEtInspectionLaunch
  });

  /* ---- Registry, KTAGS Registration, KWALK Deck Helper & Bounding-Box Verifier ---- */
  function buildVessel(key, opt) {
    var def = TR_VESSELS.defs[key];
    if (!def) return null;
    var built = def.build(opt || {});
    built.def = def;
    return built;
  }

  /* Registers a placed canal vessel in a KTAGS instance (`tagsReg`) as class `'vessel'` with Ring Sea-compatible tags! */
  function registerVesselTag(tagsReg, keyOrDef, pose, opt) {
    if (!tagsReg || typeof tagsReg.add !== 'function') return null;
    var def = typeof keyOrDef === 'string' ? TR_VESSELS.defs[keyOrDef] : keyOrDef;
    if (!def) return null;
    opt = opt || {};
    var px = pose.x == null ? 0 : +pose.x;
    var py = pose.y == null ? 0 : +pose.y;
    var pz = pose.z == null ? 0 : +pose.z;
    var yaw = pose.yaw == null ? (pose.ry == null ? 0 : +pose.ry) : +pose.yaw;
    var mergedTags = Object.assign({ culture: def.culture }, def.tags, opt.extraTags || {});
    var rec = {
      'class': 'vessel',
      kind: def.kind || 'barge',
      key: def.key,
      name: opt.name || def.name,
      at: [px, py - def.draft, pz],
      ry: yaw,
      size: [def.L, def.B, +(def.H + def.draft).toFixed(3)],
      tags: mergedTags,
      note: def.blurb || '',
      frag: opt.frag || 'kits/transit/src/72-tr-canal-vessels.js'
    };
    if (opt.id != null) rec.id = opt.id;
    return tagsReg.add(rec);
  }

  /* Registers a moored vessel's main deck in KWALK so walkers (F) can step aboard from the quay */
  function registerVesselWalk(walkMod, built, pose, name) {
    if (!walkMod || typeof walkMod.strip !== 'function' || !built || !built.walkRect) return;
    var wr = built.walkRect;
    var yaw = pose.yaw == null ? (pose.ry || 0) : pose.yaw;
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var deckWorldY = (pose.y == null ? 0 : pose.y) + built.deckY;
    var ax = pose.x + wr[0] * cy, az = pose.z - wr[0] * sy;
    var bx = pose.x + wr[1] * cy, bz = pose.z - wr[1] * sy;
    walkMod.strip({
      a: [ax, az, deckWorldY],
      b: [bx, bz, deckWorldY],
      w: Math.max(1.2, wr[3] - wr[2]),
      name: name || (built.def ? built.def.key : 'vessel_deck'),
      tag: 'vessel:deck'
    });
  }

  /* Measures the built THREE.Box3 of a vessel against its declared { L, B, H, draft } */
  function auditVesselDims(key, v, tol) {
    var def = TR_VESSELS.defs[key];
    if (!def) return { ok: false, key: key, reason: 'missing_def' };
    var built = def.build({ v: v | 0 });
    var bb = new THREE.Box3().setFromObject(built.group);
    var bL = +(bb.max.x - bb.min.x).toFixed(3);
    var bB = +(bb.max.z - bb.min.z).toFixed(3);
    var bAir = +bb.max.y.toFixed(3);
    var bDraft = +(-bb.min.y).toFixed(3);
    var eps = tol == null ? 0.18 : +tol;
    var ok = Math.abs(bL - def.L) <= eps &&
             Math.abs(bB - def.B) <= eps &&
             Math.abs(bAir - def.H) <= eps &&
             bAir <= def.H + 0.03 &&
             Math.abs(bDraft - def.draft) <= eps;
    /* Dispose temporary audit geometries */
    built.group.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    return {
      ok: ok,
      key: key,
      declared: { L: def.L, B: def.B, H: def.H, draft: def.draft },
      built: { L: bL, B: bB, H: bAir, draft: bDraft }
    };
  }

  K.vessels = TR_VESSELS;
  K.defVessel = TR_VESSEL;
  K.buildVessel = buildVessel;
  K.registerVesselTag = registerVesselTag;
  K.registerVesselWalk = registerVesselWalk;
  K.auditVesselDims = auditVesselDims;
})(KCANAL);
