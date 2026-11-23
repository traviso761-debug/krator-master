/* ==================== DROWN_SITES: 4 surveyed Scale-Model 5.1 stations ([G data]) ==================== */
/* Plain station records for biomes/drownlands (PLAN.md section 3). Zero THREE, zero DOM. */

var DROWN_SITES = {
  shoal: {
    key: 'shoal',
    name: 'Brucite-Chimney Shoal and Nickel-Mangrove Gut',
    region: 'Central Drownlands Ultramafic Shoal',
    px: [145, 520],
    world: [290000, 1040000],
    sky: { px: -127, py: 190 },
    atm: 1.60,
    koppen: 'Am',
    rain: 1710,
    temp: { mean: 27, warm: 32, cold: 22, low: 18 },
    soil: 27,
    lithology: 'ultramafic',
    ultramaficByte: 255,
    niByte: 180,
    coalByte: 0,
    jadeByte: 120,
    silicaByte: 150,
    tideRangeM: 1.4,
    trimElevM: 48.0,
    trenchDepthM: -84.0,
    trenchX: -260,
    trenchDistM: 380,
    waveShearPa: 95,
    strataStack: 'serpentinite-detachment',
    kin: ['arch'],
    skerries: [
      { x: 42, z: -18, rx: 115, rz: 84, top: 14.8, rot: 0.32 },
      { x: 185, z: 95, rx: 96, rz: 74, top: 11.6, rot: -0.45 },
      { x: -58, z: 155, rx: 88, rz: 66, top: 9.4, rot: 0.62 },
      { x: 155, z: -165, rx: 108, rz: 78, top: 15.6, rot: 0.18 },
      { x: -75, z: -145, rx: 72, rz: 58, top: 7.8, rot: -0.28 },
      { x: 295, z: -35, rx: 82, rz: 64, top: 10.5, rot: 0.51 },
      { x: -12, z: 310, rx: 94, rz: 70, top: 12.2, rot: -0.19 }
    ],
    brucitePools: [
      { key: 'bp0', name: 'North Brucite Alkali Pool (pH 11.4)', x: -136, z: -48, r: 15.0, level: 0.36, rimH: 0.58, pH: 11.45 },
      { key: 'bp1', name: 'Fault-Step Saponifying Basin (pH 11.5)', x: -148, z: 24, r: 18.0, level: 0.42, rimH: 0.66, pH: 11.52 },
      { key: 'bp2', name: 'South Celadon Seep Pool (pH 11.2)', x: -128, z: 96, r: 13.5, level: 0.32, rimH: 0.54, pH: 11.24 }
    ],
    tidalChute: {
      name: 'Skerry-Gap Tidal Race Chute',
      pts: [[155, 22], [105, 58], [35, 92], [-30, 92], [-105, 78]],
      width: 24,
      speed: 3.4
    },
    reserves: [
      { id: 'site:ark-ward-trench', name: 'cFlit-qBon Ark-Ward Trench Mooring Reserve', x: -230, z: 120, r: 85, depthM: 84 }
    ],
    audio: {
      hydro: 'gentle-shoal-wash-and-chimney-gurgle',
      wind: 'monsoon-trade-and-cable-root-creak',
      bio: 'clickporpoise-echolocation-codas',
      geo: 'alkaline-seep-bubble-and-260hz-hydrophone'
    },
    modes: ['Low Water', 'Drawdown', 'Swell', 'Mean Tide'],
    seed: 0x5D10A1
  },

  bar: {
    key: 'bar',
    name: 'Megatsunami Serpentinite-Jade Boulder-Bar and Sponge Flat',
    region: 'Northern Drownlands Seamount-Facing Margin',
    px: [195, 420],
    world: [390000, 840000],
    sky: { px: -77, py: 90 },
    seamountDistKm: 174.0,
    atm: 1.60,
    koppen: 'Am',
    rain: 1663,
    temp: { mean: 28, warm: 32, cold: 23, low: 19 },
    soil: 28,
    lithology: 'ultramafic',
    ultramaficByte: 255,
    niByte: 180,
    coalByte: 0,
    jadeByte: 200,
    silicaByte: 150,
    tideRangeM: 1.6,
    trimElevM: 52.0,
    trenchDepthM: -69.0,
    trenchDistM: 2150,
    waveShearPa: 310,
    strataStack: 'ophiolite-serpentinite',
    kin: ['arch'],
    chevron: {
      apex: [-18, -135],
      westArm: [-320, 145],
      eastArm: [295, 130],
      crestH: 24.5,
      halfW: 72
    },
    headlands: [
      { x: -410, z: 210, rx: 165, rz: 145, top: 92.0, rot: 0.25 },
      { x: 390, z: 195, rx: 175, rz: 150, top: 104.0, rot: -0.31 }
    ],
    spongeFlat: { x: -8, z: 38, rx: 210, rz: 135 },
    coppiceBench: { x: 145, z: 148, rx: 110, rz: 78, elev: 18.5 },
    reserves: [
      { id: 'site:prou-torre-north', name: 'Prou-Torre Streamlined Basalt Inundation Keep Reserve', x: 108, z: 96, r: 45, elevM: 14.5 }
    ],
    audio: {
      hydro: 'heavy-1.6atm-outer-bar-surf-thunder',
      wind: 'monsoon-squall-and-wrack-rattle',
      bio: 'sealed-sponge-hiss-and-gannet-cry',
      geo: 'distant-35hz-steaming-seamounts-surtseyan-roll'
    },
    modes: ['Low Water', 'Drawdown', 'Swell', 'Mean Tide'],
    seed: 0x5D10B2
  },

  drowned: {
    key: 'drowned',
    name: 'Subsiding Drowned-Valley Snag Lagoon and Coal Contact',
    region: 'Southeastern Drownlands Sedimentary Graben',
    px: [95, 545],
    world: [190000, 1090000],
    sky: { px: -177, py: 215 },
    atm: 1.60,
    koppen: 'Am',
    rain: 1678,
    temp: { mean: 27, warm: 31, cold: 22, low: 18 },
    soil: 27,
    lithology: 'sedimentary',
    ultramaficByte: 0,
    niByte: 0,
    coalByte: 214,
    clayByte: 255,
    peatByte: 157,
    jadeByte: 160,
    silicaByte: 150,
    tideRangeM: 1.5,
    trimElevM: 47.0,
    trenchDepthM: -18.0,
    trenchDistM: 1680,
    waveShearPa: 55,
    subsidenceM: 6.2,
    strataStack: 'drowned-coal-measure',
    kin: [],
    lagoon: { x: -15, z: 10, rx: 245, rz: 195, floorY: -3.4 },
    necks: [
      { x: -255, z: -85, rx: 145, rz: 190, top: 28.5, rot: 0.22 },
      { x: 245, z: -65, rx: 135, rz: 185, top: 31.0, rot: -0.18 },
      { x: -165, z: 245, rx: 155, rz: 120, top: 24.0, rot: 0.44 },
      { x: 230, z: 220, rx: 140, rz: 115, top: 26.8, rot: -0.36 }
    ],
    coalBench: { x: -172, z: -42, r: 58 },
    detachmentGut: {
      name: 'Eastern Detachment Fault Tidal Gut',
      pts: [[125, -230], [112, -95], [108, 35], [115, 165]],
      width: 26,
      speed: 3.1
    },
    boomZone: { x: 48, z: -112, r: 52 },
    reserves: [],
    audio: {
      hydro: 'sheltered-lagoon-lap-and-detachment-gut-current',
      wind: 'hollow-mineralized-snag-whistle',
      bio: 'visoroyster-valve-snap-and-shoaldugong-breath',
      geo: 'subsided-coal-seam-bubble'
    },
    modes: ['Low Water', 'Drawdown', 'Swell', 'Mean Tide'],
    seed: 0x5D10C3
  },

  skerry: {
    key: 'skerry',
    name: 'High +196 m Horst Skerry and +48 m Tsunami Trimline',
    region: 'North-Central Drownlands Horst Refuge',
    px: [145, 495],
    world: [290000, 990000],
    sky: { px: -127, py: 165 },
    atm: 1.59,
    koppen: 'Am',
    rain: 1616,
    temp: { mean: 26, warm: 31, cold: 21, low: 16 },
    soil: 26,
    lithology: 'ultramafic',
    ultramaficByte: 255,
    niByte: 180,
    coalByte: 0,
    jadeByte: 140,
    silicaByte: 150,
    tideRangeM: 1.5,
    trimElevM: 48.0,
    summitM: 196.0,
    cuirasseBaseM: 72.0,
    trenchDepthM: -86.0,
    trenchDistM: 520,
    waveShearPa: 145,
    strataStack: 'serpentinite-laterite-horst',
    kin: ['arch'],
    horst: {
      x: 18,
      z: -12,
      rx: 285,
      rz: 235,
      summitM: 196.0,
      trimM: 48.0,
      benchM: 22.0,
      rot: 0.28
    },
    coves: [
      { x: -205, z: 138, r: 85, elev: 2.5 },
      { x: 218, z: -132, r: 78, elev: 3.2 }
    ],
    leeChannel: {
      name: 'Whaler Lee Sound Tidal Race',
      pts: [[-340, -180], [-285, -15], [-265, 145], [-295, 290]],
      width: 26,
      speed: 3.2
    },
    reserves: [],
    audio: {
      hydro: 'deep-sound-swell-against-scoured-serpentinite-scarp',
      wind: 'dense-air-ridge-updraft-through-araucaria-crowns',
      bio: 'snagbooby-soaring-calls-and-distant-whale-blow',
      geo: 'trimline-cliff-spray-echo'
    },
    modes: ['Low Water', 'Drawdown', 'Swell', 'Mean Tide'],
    seed: 0x5D10D4
  }
};
