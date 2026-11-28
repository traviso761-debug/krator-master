// ================================================================= DOUBLEDELTA — tsunami drag, hydro-elasticity, estuarine mixing & amber scour (PLAN.md §3)  [G data]
// Pure functions on plain records: zero THREE, zero DOM, zero Math.random, zero sin-hash. Every seeded draw comes from core/rand (KRAND).
// Runs identically in Node (tests/test-doubledelta.js), on the browser showcase pages, and transliterated in Godot 4.7.2.
//
//   DDELTA_PHYS.boreAt(c)        tsunami bore hydraulics across the shallow < +25 m delta bowl (tier 1 | 2 | 3)
//   DDELTA_PHYS.trimlineAt(c)    minimum woody-tree elevation and permanent-settlement bluff elevation
//   DDELTA_PHYS.salinityAt(c)    estuarine salinity (PSU), dissolved biogenic silica (mg/L), alkalinity, plankton, silt
//   DDELTA_PHYS.elasticity(c)    Vogel hydrodynamic reconfiguration & structural survival under tsunami bore load
//   DDELTA_PHYS.scourExpose(c)   tsunami backwash incision exposing blue-clay ria-amber lags, lignite seams, bitumen seeps & mire
//   DDELTA_PHYS.ecotoneAt(c)     Earthly + Kratorian ecotone guild permissions and share weights
//   DDELTA_PHYS.CROPS_BIOME      kits/crops zone definition for doubledelta (1.60 atm Am marsh & Ria Sound bluffs)
//   DDELTA_PHYS.FAUNA            six vertebrate-grade hexapod, benthic ray, mudfish & wading bird records with 24h schedules
var DDELTA_PHYS = (function () {
  'use strict';

  function cl(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ss(a, b, x) {
    var t = (x - a) / (b - a);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  }
  function dflt(v, d) { return v == null ? d : v; }

  /* Krator surface gravity (7.4 m/s^2 = 0.75 g) and dense seawater density (kg/m^3) */
  var G_KRATOR = 7.4;
  var RHO_WATER = 1024;

  /* Tsunami tiers (CROOK-RIA-DECISIONS.md §1.5, PLAN.md §3.2):
     1 = Minor Surtseyan / Shield bench-slump (3-7 yr return, 6.5 m nominal outer crest)
     2 = Generational Farside Shield "Ghost Bore" (20-35 yr return, 21 m nominal outer crest)
     3 = 15 km-edifice Hilina mega-collapse (150-300 yr return, 48 m nominal outer crest) */
  var TIERS = {
    1: { crest0: 6.5, drawdown0: 3.5, returnYrs: 5, decayKm: 38 },
    2: { crest0: 21.0, drawdown0: 14.0, returnYrs: 27, decayKm: 62 },
    3: { crest0: 48.0, drawdown0: 22.0, returnYrs: 220, decayKm: 95 }
  };

  function trimlineAt(c) {
    c = c || {};
    var distKm = Math.max(0, dflt(c.oceanDistKm, 20));
    var exp = cl(dflt(c.wnwExposure01, 0.7), 0, 1);
    /* Inner Ria Sound throat requires >= 25 m (rising to 38-58 m on WNW-exposed spurs and outer headlands);
       permanent towns sit safely above unshadowed WNW Shield mega-swells at +45..+65 m (Ria Sound: +65 m+) */
    var atten = Math.exp(-distKm / 75);
    var minWoody = 25.0 + 33.0 * exp * atten;
    var safeTown = Math.max(45.0, 45.0 + 20.0 * (0.4 + 0.6 * exp));
    return {
      minWoodyElevM: +minWoody.toFixed(2),
      safeTownElevM: +safeTown.toFixed(2)
    };
  }

  function boreAt(c) {
    c = c || {};
    var tier = dflt(c.tier, 2);
    var T = TIERS[tier] || TIERS[2];
    var elevM = dflt(c.elevM, 3.0);
    var distKm = Math.max(0, dflt(c.oceanDistKm, 22));
    var exp = cl(dflt(c.wnwExposure01, 0.75), 0, 1);
    var atten = Math.exp(-distKm / T.decayKm) * (0.52 + 0.48 * exp);
    var crestM = T.crest0 * atten;
    /* Runup amplification on steep bluff faces adds up to 18% local splash height */
    var runupM = crestM * (1.0 + 0.18 * ss(5, 35, elevM));
    var depthM = Math.max(0, runupM - elevM);
    /* Shallow-water Froude bore front speed u ~ 1.18 * sqrt(g * h) in 0.75 g */
    var velMs = depthM > 0.05 ? 1.18 * Math.sqrt(G_KRATOR * depthM) * (0.72 + 0.28 * exp) : 0;
    /* Bed shear stress tau = 0.5 * rho * Cf * u^2 with alluvial friction Cf ~ 0.0085 */
    var shearPa = 0.5 * RHO_WATER * 0.0085 * velMs * velMs;
    var drawdownM = T.drawdown0 * Math.exp(-distKm / 55) * (0.45 + 0.55 * exp);
    var trim = trimlineAt({ oceanDistKm: distKm, wnwExposure01: exp });
    var woodySurvival = elevM >= trim.minWoodyElevM && depthM < 2.5 && shearPa < 180;
    return {
      tier: tier,
      crestM: +crestM.toFixed(3),
      depthM: +depthM.toFixed(3),
      velMs: +velMs.toFixed(3),
      shearPa: +shearPa.toFixed(2),
      drawdownM: +drawdownM.toFixed(2),
      returnYrs: T.returnYrs,
      woodySurvival: woodySurvival
    };
  }

  function salinityAt(c) {
    c = c || {};
    var q = Math.max(0, dflt(c.qLocalM3s, 4850));
    var distKm = Math.max(0, dflt(c.oceanDistKm, 24));
    var chanM = Math.max(0, dflt(c.channelDistM, 80));
    var tide = cl(dflt(c.tide01, 0.5), 0, 1);
    var monsoon = cl(dflt(c.monsoon01, 0.5), 0, 1);
    /* Freshwater dilution scales with discharge Q and inland distance, pushed seaward during monsoon peaks */
    var freshPush = (q / 4850) * (0.75 + 0.55 * monsoon);
    var saltFrontKm = 18 * Math.max(0.25, 1.35 - 0.55 * freshPush) + 8 * tide;
    var marineFrac = Math.exp(-Math.max(0, distKm - 2) / Math.max(4, saltFrontKm));
    /* Back-marsh evaporation vs channel flushing */
    var marshHold = ss(40, 450, chanM) * 0.14 * (1 - 0.5 * monsoon);
    var psu = cl(34.5 * cl(marineFrac + marshHold, 0, 1), 0.2, 34.5);
    /* Biogenic orthosilicic acid H4SiO4 (18-28 mg/L in Riwa-Wata & Mere-Upe river load, consumed gradually toward 34 PSU sea) */
    var riverFrac = 1 - psu / 34.5;
    var silicaMgL = cl(3.5 + 23.5 * Math.pow(riverFrac, 0.65) * (0.82 + 0.18 * ss(600, 3000, q)), 2.5, 28.0);
    var carbonateAlk = cl(1.9 + 1.4 * riverFrac, 1.8, 3.4);
    /* Estuarine turbidity maximum & picoplankton bloom peak in mesohaline 4-22 PSU mixing zone */
    var mixPeak = Math.sin(cl(psu / 34.5, 0, 1) * Math.PI);
    var plankton01 = cl(0.32 + 0.68 * mixPeak, 0, 1);
    var silt01 = cl((0.25 + 0.75 * riverFrac) * (1 - 0.35 * ss(80, 600, chanM)), 0.05, 1);
    return {
      psu: +psu.toFixed(2),
      silicaMgL: +silicaMgL.toFixed(2),
      carbonateAlk: +carbonateAlk.toFixed(2),
      plankton01: +plankton01.toFixed(3),
      silt01: +silt01.toFixed(3)
    };
  }

  function elasticity(c) {
    c = c || {};
    var form = c.form || 'sponge-bioherm';
    var h = Math.max(0.1, dflt(c.heightM, 2.5));
    var spongin = cl(dflt(c.spongin01, 0.65), 0, 1);
    var spicule = cl(dflt(c.spiculeSi01, 0.6), 0, 1);
    var tether = Math.max(0, dflt(c.tetherLenM, 22));
    var depth = Math.max(0, dflt(c.depthM, 16));
    var vel = Math.max(0, dflt(c.velMs, 10));
    var dynP = 0.5 * RHO_WATER * vel * vel;

    if (form === 'woody-tree') {
      /* Rigid trunk (Vogel B ~ -0.18): drag rises nearly as v^2; snaps or liquefies under vel >= 5.5 m/s & depth >= 2.5 m */
      var dragRatioW = vel > 0 ? Math.pow(vel / Math.max(1, vel), -0.18) * 0.88 : 1;
      var bendW = cl(vel * 2.4, 0, 38);
      var mom = dynP * h * Math.min(h, depth);
      var intactW = depth < 2.5 || (vel < 5.2 && mom < 38000);
      return { bendDeg: +bendW.toFixed(1), compress01: 0, dragRatio: +dragRatioW.toFixed(3), intact: intactW, recoverMin: intactW ? 4 : -1 };
    }
    if (form === 'sponge-bioherm') {
      /* Elastomeric spongin + opal-A megasclere lattice compresses 35-52% and vents pore pressure via oscula */
      var comp = cl((dynP / 95000) * (0.42 + 0.28 * spongin - 0.14 * spicule), 0, 0.56);
      var dragS = cl(1 - 0.68 * comp, 0.24, 1);
      var bendS = cl(vel * 1.3 * spongin, 0, 22);
      var intactS = spongin >= 0.25 && spicule >= 0.2 && vel <= 18;
      return { bendDeg: +bendS.toFixed(1), compress01: +comp.toFixed(3), dragRatio: +dragS.toFixed(3), intact: intactS, recoverMin: 12 };
    }
    if (form === 'seapen-whip') {
      /* Calcified calcite-gorgonin axial rod bends 82-88 deg flush into silt boundary layer (drag ratio < 0.12) */
      var bendP = vel <= 0.2 ? 4 : cl(82 + 6 * ss(3, 14, vel), 15, 88.5);
      var dragP = vel <= 0.2 ? 1 : cl(0.065 + 0.045 * Math.exp(-vel / 5), 0.06, 0.115);
      var intactP = vel <= 20 && h <= 4.5;
      return { bendDeg: +bendP.toFixed(1), compress01: 0.18, dragRatio: +dragP.toFixed(3), intact: intactP, recoverMin: 3 };
    }
    if (form === 'tethered-mat') {
      /* Helical tap-rhizome uncoils up to tetherLenM so floating peat-mat rides the bore surface */
      var intactM = tether >= depth && vel <= 17;
      var dragM = intactM ? 0.16 : 0.95;
      return { bendDeg: 78, compress01: 0.12, dragRatio: dragM, intact: intactM, recoverMin: intactM ? 18 : -1 };
    }
    if (form === 'byssus-bivalve') {
      /* Buried 2/3 in cobble lag with 300-800 sacrificial-loop golden keratin cables */
      var intactB = vel <= 16.5;
      return { bendDeg: +cl(vel * 1.1, 0, 16).toFixed(1), compress01: 0.05, dragRatio: 0.14, intact: intactB, recoverMin: 1 };
    }
    return { bendDeg: 0, compress01: 0, dragRatio: 1, intact: false, recoverMin: -1 };
  }

  function scourExpose(c) {
    c = c || {};
    var elevM = dflt(c.elevM, 1.5);
    var slope = Math.max(0, dflt(c.backwashSlope, 0.04));
    var yrs = Math.max(0, dflt(c.yearsSinceMega, 18));
    var coal = cl(dflt(c.coalByte, 228), 0, 255) / 255;
    var clay = cl(dflt(c.clayByte, 255), 0, 255) / 255;
    var oil = cl(dflt(c.oilByte, 118), 0, 255) / 255;
    var amb = cl(dflt(c.amberByte, 120), 0, 255) / 255;

    /* Backwash trenches (-4.5 to +3.2 m) strip peat/lignite and expose Oligocene-style slate-blue glauconitic clay */
    var fresh = Math.exp(-yrs / 95);
    var trench = ss(4.2, -1.8, elevM) * (0.45 + 0.55 * ss(0.01, 0.14, slope));
    var blueClay01 = cl(clay * trench * (0.55 + 0.45 * fresh), 0, 1);
    /* Buoyant ria-amber (SG 1.06) concentrates in scoured blue-clay hydraulic eddy bars */
    var amberLag01 = cl(blueClay01 * (amb / 0.47) * ss(3.0, -0.8, elevM) * 0.92, 0, 1);
    /* Bedded black lignite crops out on steep cut-bank walls between +0.5 and +5.0 m */
    var ligniteLedge01 = cl(coal * ss(0.03, 0.18, slope) * ss(-1.0, 1.2, elevM) * ss(6.5, 3.5, elevM), 0, 1);
    /* Natural asphalt / bitumen seeps vent along compacted differential-compaction benches (+0.8 to +5.5 m) */
    var bitumenSeep01 = cl((oil / 0.58) * ss(-0.5, 1.2, elevM) * ss(7.0, 3.8, elevM) * (1 - 0.5 * ss(0.12, 0.3, slope)), 0, 1);
    /* Thixotropic glauconite quicksand in freshly scoured wet gully floors */
    var mireDanger01 = cl(blueClay01 * ss(1.6, -1.5, elevM) * (1 - ss(0.08, 0.22, slope)) * fresh, 0, 1);

    return {
      blueClay01: +blueClay01.toFixed(3),
      amberLag01: +amberLag01.toFixed(3),
      ligniteLedge01: +ligniteLedge01.toFixed(3),
      bitumenSeep01: +bitumenSeep01.toFixed(3),
      mireDanger01: +mireDanger01.toFixed(3)
    };
  }

  function ecotoneAt(c) {
    c = c || {};
    var elevM = dflt(c.elevM, 3.0);
    var psu = cl(dflt(c.psu, 12), 0, 35);
    var niPpm = Math.max(0, dflt(c.niPpm, 18));
    var shear = Math.max(0, dflt(c.boreShearPa, 420));
    var silica = Math.max(0, dflt(c.silicaMgL, 20));
    var minWoody = dflt(c.minWoodyElevM, 25.0);

    var woodyOk = elevM >= minWoody && shear < 180;
    var archUltramaficOk = niPpm >= 600 && elevM >= 1.5;
    var spongeOk = !archUltramaficOk && elevM >= -1.2 && elevM <= 16.0 && psu >= 1.5 && psu <= 28.0 && silica >= 14.0;
    var seapenOk = !archUltramaficOk && elevM >= -3.5 && elevM <= 4.2 && psu >= 6.0 && psu <= 34.5;
    var byssusOk = !archUltramaficOk && elevM >= -2.5 && elevM <= 4.8 && psu >= 16.0;

    var zone = 'spongebraid';
    if (elevM >= minWoody) zone = 'riabluff';
    else if (archUltramaficOk) zone = 'serpentlip';
    else if (dflt(c.amberLag01, 0) > 0.3 || dflt(c.bitumenSeep01, 0) > 0.35) zone = 'scourseep';
    else if (psu >= 20 && elevM <= 4.5) zone = 'surfbar';
    else if (elevM <= 2.2 && psu >= 9) zone = 'seapenflat';
    else if (psu < 8.5 && elevM >= 1.8) zone = 'peatmat';

    var kratorShare = cl(0.68 * ss(28, 6, elevM) + 0.22 * ss(4, 24, psu) - 0.45 * (woodyOk ? 1 : 0), 0.08, 0.92);
    var earthShare = +(1 - kratorShare).toFixed(3);
    return {
      zone: zone,
      woodyOk: woodyOk,
      spongeOk: spongeOk,
      seapenOk: seapenOk,
      byssusOk: byssusOk,
      archUltramaficOk: archUltramaficOk,
      earthShare: earthShare,
      kratorShare: +kratorShare.toFixed(3)
    };
  }

  function coconutStrandAt(c) {
    c = c || {};
    var elevM = dflt(c.elevM, 3.2);
    var waterM = dflt(c.waterM, -1e9);
    var refWaterM = waterM > -1e8 ? waterM : dflt(c.nearWaterM, 1.2);
    var clearM = elevM - refWaterM;
    var chenier01 = cl(dflt(c.chenier01, 0.4), 0, 1);
    var bitumen01 = cl(dflt(c.bitumen01, 0), 0, 1);
    var mire01 = cl(dflt(c.mire01, 0), 0, 1);
    var slope = Math.max(0, dflt(c.slope, 0.05));
    var psu = cl(dflt(c.psu, 14), 0, 35);
    /* Drift-sown Cocos nucifera roots on elevated shell-and-sand chenier beach ridges,
       natural distributary levee crests & coastal strand pockets (> water + 1.2 m, never submerged or in tar/mire) */
    var strandOk = waterM < -1e8 && clearM > 1.2 && elevM >= 2.45 && elevM <= 22.0 &&
      chenier01 >= 0.16 && bitumen01 < 0.10 && mire01 < 0.10 && slope <= 0.38 && psu <= 34.5;
    var suitability01 = strandOk
      ? cl((0.35 + 0.65 * chenier01) * ss(1.2, 2.4, clearM) * (1 - 0.5 * ss(0.18, 0.38, slope)), 0, 1)
      : 0;
    return {
      strandOk: strandOk,
      clearM: +clearM.toFixed(2),
      suitability01: +suitability01.toFixed(3)
    };
  }

  /* kits/crops integration (PLAN.md §7.1): 1.60 atm (atm: 2), +28..+31 degC, 2,243-2,557 mm/yr */
  var CROPS_BIOME = {
    atm: 2,
    zones: {
      braid:   { warmth: [4, 4], arid: [4, 4], wet: true },
      marsh:   { warmth: [4, 4], arid: [4, 4], wet: true, salt: true },
      surfbar: { warmth: [4, 5], arid: [4, 4], wet: true, salt: true },
      chenier: { warmth: [4, 5], arid: [3, 4], salt: true },
      bluff:   { warmth: [3, 4], arid: [3, 3] }
    }
  };
  if (typeof CROPS !== 'undefined' && CROPS && CROPS.BIOMES) {
    CROPS.BIOMES.doubledelta = CROPS_BIOME;
    if (CROPS.BY_ID && CROPS.BY_ID.coconut && Array.isArray(CROPS.BY_ID.coconut.home) && CROPS.BY_ID.coconut.home.indexOf('doubledelta') < 0) {
      CROPS.BY_ID.coconut.home.push('doubledelta');
    }
  }

  /* Six vertebrate-grade hexapod, benthic ray, amphibious fish & wading-bird records (PLAN.md §6) */
  var FAUNA = [
    {
      key: 'amberskimmer', name: 'Stilt Amber-Skimmer', clade: 'hexapod', sizeM: 1.4,
      biome: 'doubledelta', diet: 'carnivore-scavenger',
      yields: ['chitin', 'skimmer-meat', 'ria-amber'],
      schedule: [[0, 5, 'SLEEP_MAT'], [5, 11, 'FORAGE_SCOUR'], [11, 15, 'ROOST_SPONGE'], [15, 20, 'FORAGE_SCOUR'], [20, 24, 'SLEEP_MAT']]
    },
    {
      key: 'oscularcrab', name: 'Oscular Sponge-Symbiote', clade: 'hexapod', sizeM: 0.5,
      biome: 'doubledelta', diet: 'detritivore',
      yields: ['shell-meat', 'sponge-pearl'],
      schedule: [[0, 6, 'GROOM_OSTIA'], [6, 18, 'SHELTER_CHIMNEY'], [18, 24, 'FILTER_TIDE']]
    },
    {
      key: 'byssusray', name: 'Shell-Cracker Plume Ray', clade: 'chondrichthyes', sizeM: 1.8,
      biome: 'doubledelta', diet: 'durophage',
      yields: ['ray-wing', 'shagreen', 'barbed-spine'],
      schedule: [[0, 4, 'DRIFT_DEEP'], [4, 10, 'FEED_BAR'], [10, 16, 'BURY_SILT'], [16, 22, 'FEED_PLUME'], [22, 24, 'DRIFT_DEEP']]
    },
    {
      key: 'tarstrider', name: 'Bitumen-Seep Scavenger', clade: 'hexapod', sizeM: 0.8,
      biome: 'doubledelta', diet: 'scavenger',
      yields: ['seep-wax', 'hide'],
      schedule: [[0, 8, 'PATROL_SEEP'], [8, 17, 'SHADE_LEDGE'], [17, 24, 'PATROL_SEEP']]
    },
    {
      key: 'mudfish', name: 'Delta Mudfish', clade: 'osteichthyes', sizeM: 0.35,
      biome: 'doubledelta', diet: 'omnivore',
      yields: ['fish'],
      schedule: [[0, 6, 'BURROW_MUD'], [6, 18, 'BASK_FORAGE'], [18, 24, 'BURROW_MUD']]
    },
    {
      key: 'riaheron', name: 'Plume-Stalker Spoonbill', clade: 'aves', sizeM: 1.1,
      biome: 'doubledelta', diet: 'piscivore',
      yields: ['eggs', 'feathers', 'fowl'],
      schedule: [[0, 6, 'ROOST_BLUFF'], [6, 18, 'HUNT_BRAID'], [18, 24, 'ROOST_BLUFF']]
    }
  ];

  return {
    G_KRATOR: G_KRATOR,
    RHO_WATER: RHO_WATER,
    TIERS: TIERS,
    boreAt: boreAt,
    trimlineAt: trimlineAt,
    salinityAt: salinityAt,
    elasticity: elasticity,
    scourExpose: scourExpose,
    ecotoneAt: ecotoneAt,
    coconutStrandAt: coconutStrandAt,
    CROPS_BIOME: CROPS_BIOME,
    FAUNA: FAUNA
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DDELTA_PHYS;
