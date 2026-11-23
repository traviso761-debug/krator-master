// ================================================================= BATTERED ISLE — worn extinct cinder-cone & asymmetric tsunami physics [G data]
// Pure data and deterministic functions (biomes/batteredisle/PLAN.md section 1.2, 2, 4.2, 5):
//   - Zero THREE, zero DOM, zero Math.random, zero Math.sin hashes (100% KRAND integer hashes)
//   - Models the deeply denuded skeletal core of an extinct cinder & scoria cone (rmwetgzft4x9d):
//       1. BATTER_PHYS.cinderConeAt(o)     radial erosion profile, 18 exhumed feeder-dike ribs, columnar olivine-basalt neck,
//                                          and upturned ESE/SSE coal = 201 sedimentary vent collar
//       2. BATTER_PHYS.tsunamiShadowAt(o)  WNW/WSW direct Steaming Seamounts & Farside Shield bore run-up (+55..+62 m trimline)
//                                          vs. ESE/SSE island wave-shadow (+14..+22 m leeward cove trimline)
//       3. BATTER_PHYS.blowholeAt(o)       pneumatic wave-compression inside fractured dike-palagonite sea-caves (0 volcanic vents!)
//       4. BATTER_PHYS.springLineAt(o)     basal freshwater tuff-contact aquitard springs on a riverless scoria island
//       5. BATTER_PHYS.windShearAt(o)      aerodynamic 1.44-1.60 atm salt-shear canopy lean & ship-knee reaction wood
//   - Registers CROPS.BIOMES.batteredisle when CROPS is present, and exports BATTER_FAUNA (6 species with 24h schedules).

var BATTER_PHYS = (function(){
 'use strict';

 var SEED = 0x42415452; /* 'BATR' */
 var PLUG_PX = [474, 248];

 function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
 function smooth(a, b, x){
  var t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
 }
 function wrapDeg(d){
  var a = d % 360;
  return a < 0 ? a + 360 : a;
 }
 function angDiffDeg(a, b){
  var d = Math.abs(wrapDeg(a) - wrapDeg(b));
  return d > 180 ? 360 - d : d;
 }

 /* 18 deterministic radial vertical olivine-basalt feeder dikes striking outward from the central plug (474, 248) */
 var DIKE_AZ = (function(){
  var out = [];
  for (var i = 0; i < 18; i++) {
   var h = KRAND.hash(SEED, i, 101);
   var jit = (KRAND.unit(h) - 0.5) * 9.0;
   var w = 2.0 + 4.4 * KRAND.unit(KRAND.hash(SEED, i, 102));
   out.push({ idx: i, azDeg: wrapDeg(i * 20.0 + jit), widthM: +w.toFixed(2) });
  }
  return out;
 })();

 /* 1. Worn cinder-cone radial lithology, scoria stripping, palagonite aquitard, dike ribs & upturned coal=201 collar */
 function cinderConeAt(o){
  o = o || {};
  var px = o.px == null ? 438 : o.px;
  var py = o.py == null ? 258 : o.py;
  var lx = o.localX == null ? 0 : o.localX;
  var lz = o.localZ == null ? 0 : o.localZ;
  var elevM = o.elevM == null ? 40 : o.elevM;

  var dxKm = (px - PLUG_PX[0]) * 2.0 + lx * 0.001;
  var dzKm = (py - PLUG_PX[1]) * 2.0 + lz * 0.001;
  var distPlugKm = o.distPlugKm == null ? Math.hypot(dxKm, dzKm) : o.distPlugKm;
  /* Bearing in compass degrees clockwise from North (0 = N = -Z, 90 = E = +X, 180 = S = +Z, 270 = W = -X) */
  var computedAz = wrapDeg(Math.atan2(dxKm, -dzKm) * 180 / Math.PI);
  var azDeg = o.azDeg == null ? computedAz : wrapDeg(o.azDeg);

  /* Southeastern upturned country-rock collar (azDeg 78..200 deg from plug, distPlugKm >= 14 km) */
  var collarSector = smooth(72, 90, azDeg) * (1 - smooth(192, 210, azDeg));
  var collarDist = smooth(11.0, 20.0, distPlugKm);
  var sedWeight = o.forceLithology === 'sedimentary' ? 1.0 :
                  (o.forceLithology === 'ultramafic' ? 0.0 : collarSector * collarDist);
  var lithology = sedWeight >= 0.5 ? 'sedimentary' : 'ultramafic';

  /* Exhumed central columnar olivine-basalt volcanic neck (+650..+868.8 m near 474, 248) */
  var plugCore = (1 - smooth(0.42, 1.85, distPlugKm)) * smooth(560, 720, elevM);
  var plugColumnar01 = clamp(plugCore, 0, 1);

  /* Radial feeder-dike wall intensity (onshore hogbacks + coastal reef-jaws & sea-stacks) */
  var bestDike = 0;
  for (var i = 0; i < DIKE_AZ.length; i++) {
   var dk = DIKE_AZ[i];
   var arcM = angDiffDeg(azDeg, dk.azDeg) * (Math.PI / 180) * Math.max(320, distPlugKm * 1000);
   var rib = 1 - smooth(dk.widthM * 0.65, dk.widthM * 3.4, arcM);
   if (rib > bestDike) bestDike = rib;
  }
  /* Local station dike ribs when localX/localZ cross station feeder-dike strikes */
  if (o.localDikeDistM != null) {
   var localRib = 1 - smooth(2.6, 11.5, Math.abs(o.localDikeDistM));
   if (localRib > bestDike) bestDike = localRib;
  }
  var dikeRib01 = clamp(bestDike, 0, 1);

  /* Tsunamis strip loose scoria to 0 m below trimline; summit crags (>660 m) are rain-stripped to bare basalt plug */
  var ts = tsunamiShadowAt({ azFromCenterDeg: azDeg });
  var aboveTrim = smooth(ts.trimElevM - 2.0, ts.trimElevM + 16.0, elevM);
  var belowPlug = 1 - smooth(640, 760, elevM);
  var pocket = 0.5 + 0.5 * KRAND.fbm(lx * 0.0045 + px * 0.7, 0.5, lz * 0.0045 + py * 0.7, 2, SEED ^ 0x5343);
  var scoriaDepthM = +(4.4 * aboveTrim * belowPlug * (1 - 0.85 * dikeRib01) * (0.22 + 0.78 * pocket)).toFixed(3);
  if (elevM < ts.trimElevM - 1.5) scoriaDepthM = 0;

  /* Consolidated hydrovolcanic palagonite tuff outcrops along +4..+145 m coastal benches, arches & spring contacts */
  var palBand = smooth(-6, 10, elevM) * (1 - smooth(125, 220, elevM));
  var palagonite01 = clamp(palBand * (1 - 0.65 * dikeRib01) * (1 - 0.55 * plugColumnar01), 0, 1);

  /* Upturned contact-coked coal = 201 collar byte & gully incision depth */
  var coalPeak = sedWeight * smooth(2, 18, elevM) * (1 - smooth(95, 175, elevM));
  var coalCollarByte = lithology === 'sedimentary' ? Math.round(clamp(88 + 113 * coalPeak, 0, 201)) : 0;
  var nickelByte = lithology === 'ultramafic' ? 180 : 0;
  var gullyWave = 0.5 + 0.5 * KRAND.fbm(lx * 0.012 + px, 1.3, lz * 0.012 + py, 2, SEED ^ 0x4755);
  var gullyDepthM = +(aboveTrim * (1 - dikeRib01) * (1 - plugColumnar01) * (1.2 + 5.6 * gullyWave)).toFixed(3);

  return {
   lithology: lithology,
   scoriaDepthM: scoriaDepthM,
   palagonite01: +palagonite01.toFixed(4),
   dikeRib01: +dikeRib01.toFixed(4),
   plugColumnar01: +plugColumnar01.toFixed(4),
   coalCollarByte: coalCollarByte,
   nickelByte: nickelByte,
   gullyDepthM: gullyDepthM,
   trimElevM: ts.trimElevM
  };
 }

 /* 2. Bimodal WNW tsunami-bore rampart (+55..+62 m trimline) vs. ESE/SSE island wave-shadow (+14..+22 m) */
 function tsunamiShadowAt(o){
  o = o || {};
  var az = wrapDeg(o.azFromCenterDeg == null ? 275 : o.azFromCenterDeg);
  var slope = clamp(o.coastSlope == null ? 0.14 : o.coastSlope, 0.02, 0.85);
  var shoal = clamp(o.shoalDepthM == null ? 65 : Math.abs(o.shoalDepthM), 6, 220);
  var tier = o.tier == null ? 3 : o.tier;

  /* Direct WNW/WSW exposure toward Steaming Seamounts (254-256 deg) & Farside Shields (287-294 deg) */
  var dWNW = angDiffDeg(az, 275);
  var wnwFactor = 1 - smooth(48, 125, dWNW);
  var leeFactor = 1 - smooth(42, 96, angDiffDeg(az, 132));
  var exposedWNW = dWNW <= 62;

  var shoalAmp = 0.84 + 0.26 * smooth(18, 140, shoal);
  var slopeAmp = 0.88 + 0.20 * smooth(0.05, 0.35, slope);
  var tierScale = tier === 1 ? 0.42 : (tier === 2 ? 0.72 : 1.0);

  var rawTrim = (15.5 + 41.5 * wnwFactor - 2.0 * leeFactor) * shoalAmp * (0.94 + 0.06 * slopeAmp);
  var trimElevM = +(exposedWNW ? clamp(rawTrim, 55.2, 62.0) : clamp(rawTrim, 14.0, 22.0)).toFixed(2);
  var boreCrestM = +(trimElevM * 0.84 * tierScale).toFixed(2);
  var boulderMaxM = +(exposedWNW ? clamp(2.1 + 2.8 * wnwFactor * tierScale, 1.8, 5.0) : clamp(0.45 + 0.55 * tierScale, 0.3, 1.2)).toFixed(2);
  var drawdownM = +(exposedWNW ? -12.0 * tierScale : -3.4 * tierScale).toFixed(2);

  return {
   exposedWNW: exposedWNW,
   boreCrestM: boreCrestM,
   trimElevM: trimElevM,
   boulderMaxM: boulderMaxM,
   drawdownM: drawdownM
  };
 }

 /* 3. Pneumatic wave-compression blowhole physics along fractured WNW dike-palagonite sea-caves (ZERO volcanic heat!) */
 function blowholeAt(o){
  o = o || {};
  var dikeRib01 = o.dikeRib01 == null ? 0 : o.dikeRib01;
  var palagonite01 = o.palagonite01 == null ? 0 : o.palagonite01;
  var elevM = o.elevM == null ? 12 : o.elevM;
  var coastDistM = o.coastDistM == null ? 24 : o.coastDistM;
  var waveEnergy = o.waveEnergy == null ? 1.0 : o.waveEnergy;
  var swellPhase = o.swellPhase == null ? 0.25 : o.swellPhase;
  var exposedWNW = o.exposedWNW == null ? true : !!o.exposedWNW;
  var drawdown = o.drawdownM == null ? 0 : o.drawdownM;

  /* Blowholes form strictly on WNW wave-exposed dike-tuff contacts (+4..+28 m, < 65 m inland) and silence under drawdown */
  var geomOk = exposedWNW && dikeRib01 > 0.6 && palagonite01 > 0.25 && elevM >= 4.0 && elevM <= 28.0 && coastDistM < 65.0;
  var active = geomOk && waveEnergy > 0.15 && drawdown > -6.0;
  if (!active) {
   return {
    active: false,
    volcanic: false,
    tubeRadiusM: 0,
    jetHeightM: 0,
    pulseJetM: 0,
    airVelMs: 0,
    sprayMist01: 0,
    boomHz: 0
   };
  }

  var rTube = clamp(0.95 + 1.65 * (1 - coastDistM / 75.0) * dikeRib01, 0.9, 2.8);
  /* 1.60 atm roller piston boosted 1.33x in 0.75 g gravity -> [12, 34] m peak spray geyser */
  var baseJet = (13.5 + 13.5 * clamp(waveEnergy, 0.4, 1.8) * dikeRib01) * 1.12;
  var jetHeightM = +clamp(baseJet, 12.0, 34.0).toFixed(2);
  var pulse = Math.max(0, Math.sin(swellPhase * Math.PI * 2));
  var pulseSharp = Math.pow(pulse, 2.4);
  var airVelMs = +(18.0 + 16.5 * clamp(waveEnergy, 0.3, 1.6)).toFixed(2);
  var sprayMist01 = +clamp(0.24 + 0.76 * pulseSharp * clamp(waveEnergy, 0.4, 1.5), 0, 1).toFixed(3);
  var boomHz = +(54.0 - 9.2 * rTube).toFixed(1);

  return {
   active: true,
   volcanic: false,
   tubeRadiusM: +rTube.toFixed(2),
   jetHeightM: jetHeightM,
   pulseJetM: +(jetHeightM * (0.18 + 0.82 * pulseSharp)).toFixed(2),
   airVelMs: airVelMs,
   sprayMist01: sprayMist01,
   boomHz: boomHz
  };
 }

 /* 4. Basal freshwater tuff-contact spring discharge (sponge scoria over consolidated palagonite aquitards) */
 function springLineAt(o){
  o = o || {};
  var elevM = o.elevM == null ? 42 : o.elevM;
  var scoriaDepthM = o.scoriaDepthM == null ? 2.2 : o.scoriaDepthM;
  var palagonite01 = o.palagonite01 == null ? 0.7 : o.palagonite01;
  var catchKm2 = clamp(o.upslopeCatchKm2 == null ? 1.8 : o.upslopeCatchKm2, 0, 12);

  /* Contact window (+22..+112 m) where permeable upper lapilli meets consolidated palagonite tuff */
  var band = smooth(18, 30, elevM) * (1 - smooth(98, 122, elevM));
  var head = smooth(0.35, 2.4, scoriaDepthM) * smooth(0.25, 0.72, palagonite01);
  var seepFlowLs = +(band * head * catchKm2 * 8.6).toFixed(3);
  var moisture01 = +clamp(0.22 + 0.78 * smooth(0.2, 6.5, seepFlowLs), 0, 1).toFixed(3);
  var fernPocket01 = +clamp(smooth(0.5, 4.2, seepFlowLs), 0, 1).toFixed(3);

  return {
   seepFlowLs: seepFlowLs,
   moisture01: moisture01,
   fernPocket01: fernPocket01
  };
 }

 /* 5. Persistent 1.44-1.60 atm WNW gale canopy shear & curved reaction-wood ship-knee index */
 function windShearAt(o){
  o = o || {};
  var elevM = o.elevM == null ? 90 : o.elevM;
  var azDeg = wrapDeg(o.azFromCenterDeg == null ? 275 : o.azFromCenterDeg);
  var shelter01 = clamp(o.gullyShelter01 == null ? 0 : o.gullyShelter01, 0, 1);
  var wnw = 1 - smooth(35, 145, angDiffDeg(azDeg, 282));
  var alt = smooth(12, 180, elevM) * (0.75 + 0.25 * smooth(200, 820, elevM));
  var shear01 = clamp((0.36 + 0.64 * wnw) * alt * (1 - 0.68 * shelter01), 0, 1);
  var leanRad = +(0.12 + 0.44 * shear01).toFixed(4); /* up to ~32 deg aerodynamic wedge */
  return {
   shear01: +shear01.toFixed(4),
   leanRad: leanRad,
   leanDirAzDeg: 102, /* sheared ESE downwind away from 282 deg WNW ocean gales */
   shipKneeGrade01: +clamp(smooth(0.35, 0.85, shear01), 0, 1).toFixed(3)
  };
 }

 return {
  SEED: SEED,
  PLUG_PX: PLUG_PX,
  DIKE_AZ: DIKE_AZ,
  cinderConeAt: cinderConeAt,
  tsunamiShadowAt: tsunamiShadowAt,
  blowholeAt: blowholeAt,
  springLineAt: springLineAt,
  windShearAt: windShearAt
 };
})();

/* Register CROPS.BIOMES.batteredisle across all 4 ecological zones when kits/crops is loaded */
if (typeof CROPS !== 'undefined' && CROPS && CROPS.BIOMES) {
 CROPS.BIOMES.batteredisle = {
  atm: 2,
  zones: {
   rampart:     { warmth: [4, 4], arid: [3, 4], wet: true, salt: true },
   leecove:     { warmth: [4, 4], arid: [3, 4], salt: true },
   cinderslope: { warmth: [3, 4], arid: [2, 3] },
   plugcrest:   { warmth: [3, 3], arid: [3, 4], atm: 1 }
  }
 };
}

/* 6 Canonical Coastal Rookery, Kelp-Sound & Cinder-Burrowing Fauna Records ([G data], PLAN.md section 5) */
var BATTER_FAUNA = [
 {
  key: 'stackpetrel',
  name: 'Scoria-Burrow Storm-Petrel',
  clade: 'pelagic burrow-nesting seabird',
  scaleM: 0.42,
  spanM: 1.05,
  zones: ['craterwood', 'plugcrown'],
  stations: ['cove', 'plug'],
  minElevM: 58.0,
  diet: 'pelagic crustacea and lanternfish',
  yields: ['eggs', 'petrel-oil', 'guano'],
  schedule: [
   { from: 5, to: 19, state: 'FORAGE_SEA' },
   { from: 19, to: 5, state: 'BURROW_RIM' }
  ]
 },
 {
  key: 'dikechiton',
  name: 'Basalt-Prow Giant Chiton',
  clade: 'armoured intertidal mollusc',
  scaleM: 0.32,
  zones: ['dikerampart'],
  stations: ['rampart'],
  minElevM: 0.2,
  maxElevM: 14.0,
  diet: 'encrusting coralline algae scraped with magnetite radulae',
  yields: ['chiton-meat', 'radula-grit'],
  schedule: [
   { from: 0, to: 12, state: 'CLING_BENCH' },
   { from: 12, to: 24, state: 'GRAZE_CORALLINE' }
  ]
 },
 {
  key: 'archcormorant',
  name: 'Sound-Arch Shag',
  clade: 'diving coastal bird',
  scaleM: 0.85,
  zones: ['coalarch'],
  stations: ['cove', 'strait'],
  minElevM: 3.5,
  diet: 'soundkelp-lane herring and squid',
  yields: ['guano', 'feathers', 'meat'],
  schedule: [
   { from: 6, to: 17, state: 'DIVE_KELP' },
   { from: 17, to: 6, state: 'ROOST_ARCH' }
  ]
 },
 {
  key: 'cindergecko',
  name: 'Garnierite Crag-Skink',
  clade: 'viviparous volcanic lizard',
  scaleM: 0.38,
  zones: ['cinderbarren', 'plugcrown'],
  stations: ['cove', 'plug'],
  minElevM: 24.0,
  aggression: 0,
  diet: 'sea-slaters and cinder moths',
  yields: ['pest-control'],
  schedule: [
   { from: 7, to: 18, state: 'BASK_DIKE' },
   { from: 18, to: 7, state: 'CREVICE_SLEEP' }
  ]
 },
 {
  key: 'soundseal',
  name: 'Kelp-Cove Eared Seal',
  clade: 'pinniped',
  scaleM: 2.1,
  zones: ['coalarch'],
  stations: ['cove', 'strait'],
  minElevM: 0.4,
  maxElevM: 6.5,
  diet: 'strait schooling fish and octopus',
  yields: ['seal-oil', 'waterproof-hide', 'meat'],
  schedule: [
   { from: 6, to: 15, state: 'HUNT_STRAIT' },
   { from: 15, to: 6, state: 'HAUL_CAVE' }
  ]
 },
 {
  key: 'feralcliffgoat',
  name: 'Farside Escape Crag-Goat',
  clade: 'introduced caprine',
  scaleM: 0.85,
  zones: ['cinderbarren', 'coalarch'],
  stations: ['cove', 'rampart', 'strait'],
  minElevM: 12.0,
  diet: 'cindersedge tussocks and beachcast stormwrack',
  yields: ['milk', 'chevon', 'goat-horn', 'hide'],
  schedule: [
   { from: 5, to: 11, state: 'GRAZE_WRACK' },
   { from: 11, to: 16, state: 'SHADE_TUFF' },
   { from: 16, to: 5, state: 'ROOST_DIKE' }
  ]
 }
];

if (typeof window !== 'undefined') {
 window.BATTER_PHYS = BATTER_PHYS;
 window.BATTER_FAUNA = BATTER_FAUNA;
}
if (typeof module !== 'undefined' && module.exports) {
 module.exports = { BATTER_PHYS: BATTER_PHYS, BATTER_FAUNA: BATTER_FAUNA };
}
