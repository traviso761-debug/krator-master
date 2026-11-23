// ================================================================= DOUBLEDELTA — station site records on Scale Model 5.1 (PLAN.md §2, §8)  [G data]
// Plain data records: zero THREE, zero DOM. Coordinates on Scale Model 5.1 (1821 x 1723, 2 km/px); sky pixel = 5.1 px minus [272, 330].
// Explicit locked geological & settlement rule (CROOK-RIA-DECISIONS.md §2.1):
//   - Flat, island-less 95.3% sedimentary alluvial delta bowl (< +25 m): ZERO artificial basalt island chains, ZERO permanent settlements in the bowl.
//   - Permanent settlement reserve sits exclusively on Ria Sound's safe loess-capped carbonate bluff (626, 140, +65..+145 m) above Ghost-Tsunami runup.
var DDELTA_SITES = (function () {
  'use strict';

  var bioherm = {
    key: 'bioherm',
    alias: 'braid',
    name: 'Outer-Mid Ghost-Tsunami Sponge-Bioherm and Sea-Pen Delta Flats',
    px: [556, 160],
    world: [1112000, 320000],
    sky: { px: 284, py: -170 },
    base: 3.8,
    elevBand: [0, 18],
    atm: 1.60,
    koppen: 'Am',
    rain: 2557,
    temp: { mean: 31, warm: 40, cold: 22, low: 19 },
    soil: 30,
    lat: -19.5,
    province: 'sedimentary',
    oceanDistKm: 18,
    wnwExposure01: 0.78,
    qLocalM3s: 4850,
    geology: { clay: 255, coal: 228, peat: 158, silica: 150, amber: 120, bitumen: 64, ultramafic: 0, nickel: 0 },
    channels: [
      { key: 'maria-main', a: [2400, -320], b: [-2450, 260], w: 190, depth: 5.2, wigA: 170, wigK: 0.0022, speed: 0.65 },
      { key: 'tongma-north', a: [2350, -1420], b: [-2400, -760], w: 135, depth: 4.1, wigA: 140, wigK: 0.0027, speed: 0.52 },
      { key: 'pakma-south', a: [2300, 980], b: [-2380, 1340], w: 125, depth: 3.8, wigA: 130, wigK: 0.0025, speed: 0.48 }
    ],
    ponds: [
      { x: 520, z: -640, r: 165, level: 1.35 },
      { x: -340, z: 740, r: 190, level: 1.15 },
      { x: 1180, z: 360, r: 145, level: 1.65 }
    ],
    biohermMounds: [
      { x: -160, z: -140, r: 145, lift: 5.4 },
      { x: 340, z: 210, r: 130, lift: 4.8 },
      { x: -690, z: -360, r: 155, lift: 5.9 },
      { x: 860, z: -260, r: 125, lift: 4.6 },
      { x: -580, z: 340, r: 135, lift: 4.9 },
      { x: 190, z: -980, r: 120, lift: 4.4 }
    ],
    wrackLines: [
      { a: [-1120, -1520], b: [-760, 1520], w: 46 },
      { a: [-320, -1480], b: [40, 1460], w: 38 }
    ],
    seed: 0x5D1A01
  };

  var bitumen = {
    key: 'bitumen',
    alias: 'scour',
    name: 'Bitumen Tar-Seeps and Blue-Clay Ria-Amber Scour-Channels',
    px: [572, 130],
    world: [1144000, 260000],
    sky: { px: 300, py: -200 },
    base: 3.4,
    elevBand: [-3.5, 9.5],
    atm: 1.60,
    koppen: 'Am',
    rain: 2463,
    temp: { mean: 31, warm: 40, cold: 22, low: 19 },
    soil: 31,
    lat: -18.8,
    province: 'sedimentary',
    oceanDistKm: 26,
    wnwExposure01: 0.72,
    qLocalM3s: 1940,
    geology: { clay: 255, coal: 228, peat: 158, silica: 150, amber: 120, bitumen: 118, oil: 146, ultramafic: 0, nickel: 0 },
    scours: [
      { key: 'main-chute', a: [2100, -680], b: [-2250, 520], w: 96, depth: 5.4, wigA: 95, wigK: 0.0031, speed: 0.42 },
      { key: 'north-gully', a: [1750, -1580], b: [-1950, -520], w: 68, depth: 4.4, wigA: 72, wigK: 0.0038, speed: 0.35 }
    ],
    tarSeeps: [
      { key: 'seep-alpha', x: -120, z: -180, r: 44, rim: 0.65 },
      { key: 'seep-beta', x: 310, z: 140, r: 36, rim: 0.55 },
      { key: 'seep-gamma', x: -540, z: 360, r: 52, rim: 0.72 },
      { key: 'seep-delta', x: 740, z: -340, r: 32, rim: 0.50 },
      { key: 'seep-epsilon', x: -860, z: -680, r: 38, rim: 0.58 }
    ],
    amberPockets: [
      { key: 'amber-eddy-1', x: -290, z: -20, r: 58 },
      { key: 'amber-eddy-2', x: 420, z: -230, r: 54 },
      { key: 'amber-eddy-3', x: -980, z: 190, r: 62 },
      { key: 'amber-eddy-4', x: 120, z: -1020, r: 48 }
    ],
    mires: [
      { key: 'mire-west', x: -640, z: 95, r: 42 },
      { key: 'mire-east', x: 690, z: -310, r: 38 }
    ],
    seed: 0x5D1A02
  };

  var throat = {
    key: 'throat',
    name: 'Ria Sound Inner Bluff Gate and Delta Throat Overlook',
    px: [626, 140],
    world: [1252000, 280000],
    sky: { px: 354, py: -190 },
    base: 41.3,
    elevBand: [0, 145],
    atm: 1.58,
    koppen: 'Am',
    rain: 2259,
    temp: { mean: 28, warm: 37, cold: 19, low: 15 },
    soil: 27,
    lat: -19.1,
    province: 'sedimentary',
    oceanDistKm: 58,
    wnwExposure01: 0.52,
    qLocalM3s: 6230,
    geology: { clay: 255, coal: 169, peat: 112, silica: 150, amber: 108, bitumen: 52, oil: 102, ultramafic: 0, nickel: 0 },
    /* Bluff geometry: eastern half (x > 260) steps from 0 m oyster-notched shore to +41 m lower slipway bench,
       then rises sharply across carbonate-shelf limestone to +72..+142 m loess-capped Ria Sound reserve plateau */
    bluffX0: 240,
    slipwayBench: { x: 460, z: -120, r: 190, elevM: 41.3 },
    settlementReserve: {
      id: 'site:ria-sound',
      name: 'Ria Sound Permanent Settlement Reserve (+65..+140 m Safe Bluff)',
      x: 1180,
      z: -160,
      r: 320,
      minElevM: 65.0,
      maxElevM: 140.0
    },
    channels: [
      { key: 'ria-throat-main', a: [2450, 560], b: [-2480, 180], w: 240, depth: 6.8, wigA: 120, wigK: 0.0019, speed: 0.78 },
      { key: 'pakma-throat', a: [180, -2350], b: [-2420, -680], w: 165, depth: 5.1, wigA: 135, wigK: 0.0023, speed: 0.62 }
    ],
    seed: 0x5D1A04
  };

  var bar = {
    key: 'bar',
    name: 'Outer Surf-Bar and Sea-Byssus Shell-Lag Mouth',
    px: [516, 172],
    world: [1032000, 344000],
    sky: { px: 244, py: -158 },
    base: 2.6,
    elevBand: [-6.5, 4.8],
    atm: 1.60,
    koppen: 'Am',
    rain: 2384,
    temp: { mean: 30, warm: 37, cold: 22, low: 19 },
    soil: 29,
    lat: -19.8,
    province: 'sedimentary',
    oceanDistKm: 2,
    wnwExposure01: 0.96,
    qLocalM3s: 4850,
    geology: { clay: 255, coal: 205, silica: 150, ultramafic: 0, nickel: 0 },
    seed: 0x5D1A03
  };

  var lip = {
    key: 'lip',
    name: 'Western Serpentinite Fault-Lip Contact Cove',
    px: [512, 160],
    world: [1024000, 320000],
    sky: { px: 240, py: -170 },
    base: 6.1,
    elevBand: [0, 26.4],
    atm: 1.60,
    koppen: 'Am',
    rain: 2369,
    temp: { mean: 30, warm: 36, cold: 23, low: 19 },
    soil: 29,
    lat: -19.5,
    province: 'ultramafic',
    oceanDistKm: 4,
    wnwExposure01: 0.88,
    qLocalM3s: 1420,
    geology: { clay: 255, ultramafic: 255, nickel: 180, jade: 150 },
    seed: 0x5D1A05
  };

  return {
    bioherm: bioherm,
    braid: bioherm,
    bitumen: bitumen,
    scour: bitumen,
    throat: throat,
    bar: bar,
    lip: lip
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DDELTA_SITES;
