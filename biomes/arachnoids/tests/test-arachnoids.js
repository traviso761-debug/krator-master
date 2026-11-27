/* Node unit tests for biomes/arachnoids (ARACH_PHYS, ARACH_SITES own-polygon oracle, inverted thermal lapse,
   0.75 g catenary bridge-web pinning, 0.88 atm krummholz shear, fumaroles, CROPS & FAUNA) on tools/ktest.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const ROOT = path.join(__dirname, '..', '..', '..');
const loadGlobal = rel => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), {filename: rel});
global.window = global;

require('../../../core/rand/08-core-rand.js');
require('../../../core/mask/25-core-mask.js');
require('../../../core/mask/27-core-mask-distance.js');
fs.readdirSync(path.join(ROOT, 'kits', 'crops', 'src'))
  .filter(f => /^\d\d-crop-.*\.js$/.test(f))
  .sort()
  .forEach(f => loadGlobal('kits/crops/src/' + f));

const SITES = require('../src/41-biome-arach-sites.js');
const PHYS = require('../src/40-biome-arach-phys.js');

// 1. Strict Core Arachnoid Canyons Proper (`own`) polygon verification & rejection of (1055, 219)
{
  const stationKeys = ['nexus', 'fumarole', 'ledges', 'frostrim'];
  const allInsideOwn = stationKeys.every(k => {
    const s = SITES[k];
    return s && s.ownVerified === true && SITES.inOwnPolygon(s.px[0], s.px[1]) === true;
  });
  const skyShiftOk = stationKeys.every(k => {
    const s = SITES[k];
    return s.sky[0] === s.px[0] - 272 && s.sky[1] === s.px[1] - 330;
  });

  T.ok('all 4 verified stations (nexus 998,290; fumarole 1097,331; ledges 984,283; frostrim 919,281) lie strictly inside own',
    allInsideOwn && skyShiftOk);
  T.ok('neighboring overlap sites ((1055, 219) Compass Hills, (1272, 193) Spider Lake, (1210, 380) Korona) are excluded from own',
    SITES.EXCLUDED_NEIGHBORS.every(n => SITES.inOwnPolygon(n.px[0], n.px[1]) === false));
  T.neg('Compass Hills Ham-Tsek Silk Post (1055, 219) is rejected by own-polygon boundary check',
    pt => SITES.inOwnPolygon(pt[0], pt[1]) === true,
    [1055, 219],
    [998, 290]);
  T.neg('Spider Lake spillway (1272, 193) is rejected by own-polygon boundary check',
    pt => SITES.inOwnPolygon(pt[0], pt[1]) === true,
    [1272, 193],
    [1097, 331]);
}

// 2. Radial arch-rift-basalt dike boxwork & KMASK distance fields (fissureNetAt)
{
  const starCenter = PHYS.fissureNetAt(2, -4, SITES.nexus);
  const dikeMargin = PHYS.fissureNetAt(-148, -92, SITES.nexus);
  const farBench = PHYS.fissureNetAt(260, -240, SITES.nexus);
  const mf = PHYS.getFractureFields(SITES.nexus);

  T.ok('radial 3-spoke dike star-junction narrows slotWidthM into [32, 75] m and lifts nexusScore01 > 0.70',
    starCenter.slotWidthM >= 32.0 && starCenter.slotWidthM <= 75.0 && starCenter.nexusScore01 > 0.70);
  T.ok('chilled dike contact margin (< 6 m from spoke) elevates obsidian-vitrophyre index > 0.65 and KMASK hash is non-zero',
    dikeMargin.spokeDistM < 6.0 && dikeMargin.vitrophyre01 > 0.65 && !!mf && mf.spokeHash !== 0);
  T.neg('open plateau far from radial dike spokes fails chilled vitrophyre threshold (>= 0.35)',
    pt => PHYS.fissureNetAt(pt[0], pt[1], SITES.nexus).vitrophyre01 >= 0.35,
    [260, -240],
    [-148, -92]);
  T.ok('far bench widens slotWidthM relative to star-junction shut-in', farBench.slotWidthM > starCenter.slotWidthM + 15.0);
}

// 3. Inverted slot-canyon thermodynamics & vertical humidity/frost lapse (inversionAt)
{
  const checkInversion = key => {
    const s = SITES[key];
    const bed = PHYS.inversionAt(0, 0, s.bedY + 5.0, s);
    const rim = PHYS.inversionAt(160, 140, s.rimY, s);
    return (bed.tempC - rim.tempC >= 8.5) && (bed.rh01 > rim.rh01 + 0.30);
  };
  const nexBed = PHYS.inversionAt(0, 0, SITES.nexus.bedY + 5.0, SITES.nexus);
  const fumBed = PHYS.inversionAt(-45, 42, SITES.fumarole.bedY + 4.0, SITES.fumarole);
  const frostLip = PHYS.inversionAt(0, 80, SITES.frostrim.rimY, SITES.frostrim);

  T.ok('Stations 1-3 (nexus, fumarole, ledges) maintain >= +8.5 C warm-bottom thermal inversion and > +0.30 RH surplus over rims',
    checkInversion('nexus') && checkInversion('fumarole') && checkInversion('ledges'));
  T.ok('slot floors on nexus (1.47 atm) and fumarole (1.43 atm, +28 C trough) stay frost-free (frost01 === 0) and mist-rich',
    nexBed.frost01 === 0 && fumBed.frost01 === 0 && nexBed.mistDensity01 > 0.55 && fumBed.tempC >= 28.0);
  T.ok('Station 4 frostrim (+4,784.3 m, ~0.88 atm, ET) reaches frost01 >= 0.70 and sub-zero air',
    frostLip.frost01 >= 0.70 && frostLip.tempC < 0.0 && Math.abs(frostLip.pAtm - 0.88) < 0.03);
  T.neg('fumarolefern & bridgeweb frost-free requirement rejects high alpine frostrim (> +1,450 m / frost01 > 0)',
    inp => {
      const inv = PHYS.inversionAt(0, 0, inp.y, inp.site);
      return inv.frost01 === 0 && inv.aslM <= 1450.0 && inv.rh01 >= 0.82;
    },
    {y: SITES.frostrim.rimY, site: SITES.frostrim},
    {y: SITES.fumarole.bedY + 4.0, site: SITES.fumarole});
}

// 4. 0.75 g (7.4 m/s2) catenary bridge-web mechanics & ATMOS 0.000 m rock-anchor pinning
{
  const spans = SITES.nexus.webAnchors.map(w =>
    PHYS.webSpanAt(w.a, w.b, 7.4, {waterY: -13.0, updraftMs: 4.2, frost01: 0, aslM: 695.0, anchorGapAM: 0.02, anchorGapBM: 0.03})
  );
  const s0 = spans[0];
  const pinA = PHYS.silkPinWeight('bridgeweb', 0.0, 0.5);
  const pinB = PHYS.silkPinWeight('bridgeweb', 1.0, 0.5);
  const pinMid = PHYS.silkPinWeight('bridgeweb', 0.5, 0.5);
  const driftA = PHYS.displaceSilk(-28, 28, -18, 0, 0, 0, 9.4, 18.0, -8.5, 1.0);
  const driftMid = PHYS.displaceSilk(0, 27, -1, 0.45 * pinMid, 0.08 * pinMid, 0.75 * pinMid, 9.4, 8.0, -3.5, 0.7);

  T.ok('0.75 g Krator gravity cuts catenary sag ~24.5% shallower than 1 g Earth sag (sagRatio01 in [0.74, 0.77])',
    s0.sagRatio01 >= 0.74 && s0.sagRatio01 <= 0.77 && s0.tensionN > 2500.0);
  T.ok('all 5 nexus bridge-web spans satisfy [30, 92] m span, >= 12 m flood clearance, <= 0.15 m rock anchor gap, and validSpan',
    spans.every(s => s.validSpan && s.spanM >= 30.0 && s.spanM <= 92.0 && s.clearAboveWaterM >= 12.0 && s.anchorGapMaxM <= 0.15));
  T.ok('ATMOS silk pin weights lock both basalt-wall anchors to exact [0, 0, 0] drift while span belly sways',
    pinA === 0 && pinB === 0 && pinMid > 0.85 &&
    driftA[0] === 0 && driftA[1] === 0 && driftA[2] === 0 &&
    Math.hypot(driftMid[0], driftMid[1], driftMid[2]) > 0.4);
  T.neg('sky-floating unpinned web endpoint (anchorGap > 0.15 m) is rejected by webSpanAt',
    inp => PHYS.webSpanAt([-28, 28, -18], [28, 30, 16], 7.4, inp).validSpan === true,
    {waterY: -13.0, updraftMs: 4.0, frost01: 0, aslM: 690.0, anchorGapAM: 0.48, anchorGapBM: 0.02},
    {waterY: -13.0, updraftMs: 4.0, frost01: 0, aslM: 690.0, anchorGapAM: 0.02, anchorGapBM: 0.02});
  T.neg('over-wide (> 92 m) or frozen (frost01 > 0) span is rejected by webSpanAt',
    inp => PHYS.webSpanAt(inp.a, inp.b, 7.4, {waterY: -13.0, updraftMs: 4.0, frost01: inp.frost, aslM: inp.asl}).validSpan === true,
    {a: [-65, 30, 0], b: [65, 30, 0], frost: 0.75, asl: 4784.0},
    {a: [-28, 30, 0], b: [28, 30, 0], frost: 0.0, asl: 690.0});
}

// 5. Fumarole sinter/scalding zoning (Station 2) & 0.88 atm ET krummholz updraft shear (Station 4)
{
  const hotThroat = PHYS.fumaroleAt(-52, 46, SITES.fumarole);
  const warmApron = PHYS.fumaroleAt(-52, 22, SITES.fumarole);
  const coldWall = PHYS.fumaroleAt(220, -180, SITES.fumarole);
  const rimShear = PHYS.krummholzShearAt(10, 95, SITES.frostrim);

  T.ok('fumarole throat (>= 58 C) triggers scalding hazard & sulfur crust while warm apron (35..56 C) builds sinterRim01 > 0.65',
    hotThroat.groundTempC >= 58.0 && hotThroat.hazardScald === true && hotThroat.sulfurCrust01 > 0.5 &&
    warmApron.groundTempC >= 35.0 && warmApron.groundTempC < 58.0 && warmApron.sinterRim01 > 0.65 &&
    coldWall.hazardScald === false);
  T.ok('0.88 atm frostrim updraft (>= 3.5 m/s) shears rimkrummholz prostrate (<= 1.9 m) with radial away-from-lip banner (>= 1.8 m)',
    rimShear.flaggedOk === true && rimShear.pAtm < 0.92 && rimShear.updraftMs >= 3.5 &&
    rimShear.prostrateH <= 1.90 && rimShear.bannerLenM >= 1.80 && rimShear.lipNz < -0.7);
  T.neg('calm dense lowland floor fails alpine krummholz shear flagging',
    site => PHYS.krummholzShearAt(0, 0, site).flaggedOk === true,
    Object.assign({}, SITES.nexus, {wind: [0.5, 0.2], rimY: 20}),
    SITES.frostrim);
}

// 6. Botany / kits/crops registration & 6 native gorge fauna 24h schedules
{
  const fits = global.CROPS.forBiome('arachnoids', {works: ['dark-beds'], nodes: ['iron', 'copper', 'sulfur']});
  const byId = {};
  fits.forEach(r => { byId[r.crop.id] = r; });
  const sigPresent = ['rice', 'wild-rice', 'taro', 'steambed-yam', 'mulberry', 'tea', 'emmer', 'frostoat', 'pinyon', 'saffron', 'frostroot', 'glow-mushroom']
    .every(id => !!byId[id]);
  const frostOnly = global.CROPS.at({warmth: 0, atm: 0, arid: 1});
  const faunaOk = PHYS.FAUNA.length === 6 && PHYS.FAUNA.every(f => {
    const sc = f.schedule;
    return sc[0][0] === 0 && sc[sc.length - 1][1] === 24 && f.yields.length > 0;
  });

  T.ok('CROPS.BIOMES.arachnoids fits >= 93 crops across slotfloor, ledgewood, dryrim & frostrim including signature silk/thermal/rim crops',
    fits.length >= 93 && sigPresent && byId.rice.zone === 'slotfloor' && byId.frostroot.zone === 'frostrim');
  T.neg('warm slotfloor rice cannot grow in thin polar 0.88 atm frostrim zone',
    z => global.CROPS.at(z).some(r => r.crop.id === 'rice'),
    {warmth: 0, atm: 0, arid: 1},
    {warmth: 4, atm: 2, arid: 3, wet: true, heated: true});
  T.ok('all 6 Arachnoid Canyons fauna species carry continuous 0..24h schedules and resource yields',
    faunaOk && frostOnly.some(r => r.crop.id === 'frostroot'));
}

T.done();
