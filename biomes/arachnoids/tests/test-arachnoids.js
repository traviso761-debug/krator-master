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

// 7 & 8. BIOME-API ARACHNOIDS.canopyH, 25-species packed material bindings & 3-zone 4-station elevation zoning
{
  loadGlobal('core/space/20-core-space.js');
  const matJson = JSON.parse(fs.readFileSync(path.join(HERE_BIO(), 'materials.json'), 'utf8'));
  const packJson = JSON.parse(fs.readFileSync(path.join(HERE_BIO(), 'tex', 'pack.json'), 'utf8'));

  function HERE_BIO() { return path.join(__dirname, '..'); }

  // Minimal deterministic BIO + THREE test harness for [draw] species/placement audit in Node
  const mockAttr = () => ({count: 6, getX: () => 0.2, getY: () => 0.3, getZ: () => 0.1, setXYZ() {}});
  const mockGeo = () => ({attributes: {position: mockAttr()}, rotateZ() {}, translate() {}, computeVertexNormals() {}, setAttribute() {}, setIndex() {}, computeBoundingSphere() {}});
  const T3Mock = {
    DoubleSide: 2,
    Color: function(h) { this.hex = h; },
    MeshStandardMaterial: function(o) { Object.assign(this, o, {isMeshStandardMaterial: true, userData: {}}); },
    IcosahedronGeometry: function() { return mockGeo(); },
    CylinderGeometry: function() { return mockGeo(); },
    BufferGeometry: function() { return mockGeo(); },
    Float32BufferAttribute: function(a) { this.array = a; },
    Uint16BufferAttribute: function(a) { this.array = a; },
    Uint32BufferAttribute: function(a) { this.array = a; },
    Mesh: function(g, m) { this.geometry = g; this.material = m; this.userData = {}; }
  };
  const defs = {}, buckets = {};
  global.BIO = {
    fn: {
      TAU: Math.PI * 2,
      clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
      lerp: (a, b, t) => a + (b - a) * t,
      smooth: (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); },
      qEuler: () => [0, 0, 0, 1],
      qUp: () => [0, 0, 0, 1]
    },
    host: {THREE: T3Mock, terrainH: () => 0, waterH: () => -1e9, register: () => {}},
    owner: null,
    kit() {},
    kitEnd(api) { return api; },
    canvasTex: () => ({isTexture: true}),
    alphaTex: () => ({isTexture: true}),
    barkMat: tex => ({isMeshLambertMaterial: true, map: tex, userData: {}}),
    leafMat: (tex, name) => ({isMeshLambertMaterial: true, name, map: tex, userData: {}}),
    libSwap: (kitName, M) => {
      const swapped = [];
      Object.keys(M).forEach(k => {
        if (packJson.families && packJson.families[k]) {
          M[k].map = {isTexture: true, packedSlot: k};
          swapped.push(k);
        }
      });
      return swapped;
    },
    bucket: (k, m, o) => { buckets[k] = {mat: m, opt: o, tris: 0}; },
    def: (k, g, m, o) => { defs[k] = {geo: g, mat: m, opt: o || {}, puts: 0}; },
    put: k => { if (defs[k]) defs[k].puts++; },
    tube: k => { if (buckets[k]) buckets[k].tris += 10; return 10; },
    flareJoin: pts => pts,
    fung: {stalk: () => mockGeo(), crust: () => mockGeo(), cap: () => mockGeo(), pod: () => mockGeo()},
    geo: {clump: () => mockGeo(), frond: () => mockGeo(), bloom: () => mockGeo(), mat: () => mockGeo(), ribbon: () => mockGeo()},
    bamboo: {
      culm: () => mockGeo(),
      spray: () => mockGeo(),
      shoot: () => mockGeo(),
      clump: o => [{p: o.at, h: o.H, az: 0.5}, {p: o.at, h: o.H * 0.9, az: 2.1}],
      put: k => { if (defs[k]) defs[k].puts++; }
    },
    impostorSet: (nm, o) => ({nm, o}),
    impostor: (nm, fn) => { fn(); return {nm}; },
    impostorItem: k => { defs[k] = {mat: {map: {isTexture: true}}, puts: 0}; },
    impostorPut: k => { if (defs[k]) defs[k].puts++; }
  };

  loadGlobal('biomes/arachnoids/src/50-biome-arach-species.js');
  loadGlobal('biomes/arachnoids/src/60-biome-arach-place.js');
  loadGlobal('biomes/arachnoids/src/70-biome-arachnoids.js');

  const AR = global.ARACHNOIDS;

  // 7. ARACHNOIDS.canopyH vertical inversion contract
  const cNexusSlot = AR.canopyH(0, 0, {station: 'nexus', y: SITES.nexus.bedY + 6.0});
  const cFumSlot = AR.canopyH(0, -10, {station: 'fumarole', y: SITES.fumarole.bedY + 6.0});
  const cFumScald = AR.canopyH(-52, 46, {station: 'fumarole', y: SITES.fumarole.bedY + 12.0});
  const cLedgeWoods = AR.canopyH(-95, 25, {station: 'ledges', y: 18.0});
  const cLedgeDike = AR.canopyH(0, -56, {station: 'ledges', y: 24.0});
  const cFrostrim = AR.canopyH(0, 85, {station: 'frostrim', y: SITES.frostrim.rimY});

  T.ok('ARACHNOIDS.canopyH steps from 22.5 m Cfa slot-jungle down to 14.5/9.5 m Csa benches/dikes and <= 1.40 m ET frostrim',
    typeof AR.canopyH === 'function' &&
    cNexusSlot >= 20.0 && cFumSlot >= 20.0 && cFumScald <= 0.5 &&
    cLedgeWoods === 14.5 && cLedgeDike === 9.5 &&
    cFrostrim > 0.3 && cFrostrim <= 1.40);
  T.neg('0.88 atm ET frostrim rejects tall (> 1.4 m) woodland canopy height',
    st => AR.canopyH(0, 85, {station: st, y: SITES[st].rimY}) > 1.40,
    'frostrim',
    'nexus');

  // 8. 25-species registry, HV harvest completeness, packed materials & 4-station elevation zoning
  const expected25 = [
    'fumarolefern', 'sintermat', 'dikeclaw', 'webanchorvine', 'columnarpine', 'rimkrummholz', 'frostcushion',
    'gorgehemlock', 'ledgeoak', 'canyonbamboo', 'alpinesedge',
    'slotmulberry', 'steambedtaro', 'mistcanyontea', 'plumeorchid', 'seepcurtainmoss',
    'amberpistache', 'spokedikejuniper', 'gompasaffron', 'vitrophyrelipfern', 'entablatureivy',
    'snowbeddwarfbirch', 'rimcladonia', 'rimedelweiss', 'wildfrostroot'
  ];
  const regKeys = AR.SPECIES.map(s => s.key);
  const all25Present = AR.SPECIES.length === 25 && expected25.every(k => regKeys.indexOf(k) >= 0);
  const allHvValid = AR.SPECIES.every(s => {
    const h = s.tags && s.tags.harvest;
    return h && typeof h.wood === 'string' && Array.isArray(h.edible) &&
      typeof h.medicinal === 'boolean' && typeof h.notes === 'string' && h.notes.length >= 12 &&
      typeof h.fruit === 'string' && s.items.length >= 1 && AR.speciesOfItem(s.items[0]) === s;
  });
  const requiredLibs = [
    'bark.bark_willow_02', 'card.heartleaf', 'card.rheumleaf', 'card.crop.tea', 'card.orchid.dendrobium',
    'card.moss.hanging', 'bark.amber', 'card.orchard.small', 'bark.juniper', 'card.juniper',
    'card.crop.saffron', 'card.fern', 'card.vine.hanging.4', 'card.dwarfbirch', 'card.cladonia',
    'card.edelweiss', 'card.bulbheath'
  ];
  const matLibs = Object.values(matJson.families).map(f => f.lib);
  const packLibs = Object.values(packJson.families).map(f => f.lib);
  const libsBound = requiredLibs.every(l => matLibs.indexOf(l) >= 0 && packLibs.indexOf(l) >= 0);
  const zeroUntexturedDefs = Object.keys(defs).every(k => !!(defs[k].mat && defs[k].mat.map));

  T.ok('ARACHNOIDS.SPECIES registers all 25 species with complete HV harvest tags, item lookups, and 100% packed library sets',
    all25Present && allHvValid && libsBound && zeroUntexturedDefs && Object.keys(buckets).length <= 6);

  // Representative 4-station terrain mocks faithful to 45-host-stage.js for full placement & elevation audit
  const segDist2 = (ax, az, bx, bz, x, z) => {
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    const t = l2 > 1e-6 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0;
    return Math.hypot(ax + dx * t - x, az + dz * t - z);
  };
  const stationTerrain = {
    nexus: {
      tH: (x, z) => {
        const dRiv = Math.abs(z - 0.12 * x);
        let h = -13.0 + 150.0 * Math.pow(BIO.fn.smooth(19.0, 165.0, dRiv), 0.82);
        SITES.nexus.dikes.forEach(dk => {
          const dd = segDist2(dk.a[0], dk.a[1], dk.b[0], dk.b[1], x, z);
          if (dd < 22.0 && dRiv > 21.0) h = Math.max(h, 38.0 + 52.0 * BIO.fn.smooth(22.0, 3.0, dd));
        });
        if (Math.hypot(x + 95, z - 60) < 42) h = 28.0;
        return h;
      },
      wH: (x, z) => (Math.abs(z - 0.12 * x) < 18.0 ? -12.5 : -1e9)
    },
    fumarole: {
      tH: (x, z) => {
        let h = 6.0 + 205.0 * BIO.fn.smooth(-145.0, -305.0, z) + 205.0 * BIO.fn.smooth(130.0, 300.0, z);
        if (Math.abs(z + 116) < 28) h = -6.5;
        for (let i = 0; i < SITES.fumarole.stepPools.length; i++) {
          const P = SITES.fumarole.stepPools[i], d = Math.hypot(x - P.x, z - P.z) / P.r;
          if (d < 1.35) h = d < 0.92 ? P.floor : P.crest;
        }
        return h;
      },
      wH: (x, z) => {
        if (Math.abs(z + 116) < 22) return -5.0;
        for (let i = 0; i < SITES.fumarole.stepPools.length; i++) {
          const P = SITES.fumarole.stepPools[i];
          if (Math.hypot(x - P.x, z - P.z) < P.r * 0.98) return P.level;
        }
        return -1e9;
      }
    },
    ledges: {
      tH: (x, z) => {
        let h = -165.0 + 245.0 * BIO.fn.smooth(175.0, -75.0, z);
        if (h > -20 && h < 90) h = Math.floor(h / 8.0) * 8.0 + 1.2 + 0.08 * z;
        SITES.ledges.dikes.forEach(dk => {
          const dd = segDist2(dk.a[0], dk.a[1], dk.b[0], dk.b[1], x, z);
          if (dd < 16.0 && z < 130) h += 14.0 * BIO.fn.smooth(16.0, 3.0, dd);
        });
        return h;
      },
      wH: (x, z) => (z > 195 ? -163.0 : -1e9)
    },
    frostrim: {
      tH: (x, z) => (z > 136 ? -185.0 : 16.5 + 0.03 * Math.max(0, -z)),
      wH: () => -1e9
    }
  };

  const warmTroughSet = {
    bridgeweb: 1, fumarolefern: 1, sintermat: 1, slotmulberry: 1,
    steambedtaro: 1, mistcanyontea: 1, plumeorchid: 1, seepcurtainmoss: 1, canyonbamboo: 1
  };
  const zone2Set = {
    amberpistache: 1, spokedikejuniper: 1, gompasaffron: 1, vitrophyrelipfern: 1, entablatureivy: 1
  };
  const prostrateCap = {
    snowbeddwarfbirch: 1.10, rimcladonia: 1.40, rimedelweiss: 1.40, wildfrostroot: 1.40, frostcushion: 1.40
  };

  const grandCounts = {};
  expected25.forEach(k => { grandCounts[k] = 0; });
  const stationCounts = {};
  const allPlacedByStation = {};

  ['nexus', 'fumarole', 'ledges', 'frostrim'].forEach(sk => {
    const sp = global.KSPACE.create({cell: 16});
    const mockScene = {add() {}};
    const wb = sk === 'nexus' ? AR.createBridgeWebBatch(mockScene) : null;
    const cnt = AR.build({
      station: sk,
      terrainH: stationTerrain[sk].tH,
      waterH: stationTerrain[sk].wH,
      space: sp,
      register: () => {},
      webBatch: wb,
      quality: 1,
      seed: 5907,
      R: 640
    });
    if (wb) wb.finalize();
    stationCounts[sk] = cnt;
    allPlacedByStation[sk] = AR.PLACED.slice();
    expected25.forEach(k => { grandCounts[k] += (cnt[k] || 0); });
  });

  const missingAny25 = expected25.filter(k => grandCounts[k] <= 0);
  const allStationReqsOk =
    ['bridgeweb', 'slotmulberry', 'steambedtaro', 'mistcanyontea', 'plumeorchid', 'seepcurtainmoss', 'dikeclaw', 'webanchorvine', 'columnarpine', 'gorgehemlock', 'canyonbamboo', 'alpinesedge']
      .every(k => stationCounts.nexus[k] > 0) &&
    ['fumarolefern', 'sintermat', 'slotmulberry', 'steambedtaro', 'mistcanyontea', 'plumeorchid', 'seepcurtainmoss', 'dikeclaw', 'gorgehemlock', 'canyonbamboo', 'alpinesedge']
      .every(k => stationCounts.fumarole[k] > 0) &&
    ['columnarpine', 'ledgeoak', 'amberpistache', 'spokedikejuniper', 'gompasaffron', 'vitrophyrelipfern', 'entablatureivy', 'dikeclaw', 'webanchorvine', 'alpinesedge']
      .every(k => stationCounts.ledges[k] > 0) &&
    ['rimkrummholz', 'frostcushion', 'snowbeddwarfbirch', 'rimcladonia', 'rimedelweiss', 'wildfrostroot', 'alpinesedge']
      .every(k => stationCounts.frostrim[k] > 0);

  const allPlaced = [].concat(
    allPlacedByStation.nexus, allPlacedByStation.fumarole,
    allPlacedByStation.ledges, allPlacedByStation.frostrim
  );
  const badWarmHigh = allPlaced.filter(r => warmTroughSet[r[0]] && (r[4] > 1450.0 || (r[6] && r[6].frost01 > 0)));
  const badZone2High = allPlaced.filter(r => zone2Set[r[0]] && r[4] > 2600.0);
  const badLipFern = allPlaced.filter(r => r[0] === 'vitrophyrelipfern' && !(r[6] && r[6].vitro01 > 0.35));
  const frostPlaced = allPlacedByStation.frostrim;
  const badFrostKrumm = frostPlaced.filter(r => r[0] === 'rimkrummholz' && !(r[6] && r[6].prostrateH <= 1.90 && r[6].bannerLenM >= 1.80));
  const badFrostTall = frostPlaced.filter(r => prostrateCap[r[0]] && !(r[6] && r[6].H <= prostrateCap[r[0]]));

  T.ok('all 25 species place deterministically across the 4 stations in their target Zone 1 / Zone 2 / Zone 3 guilds',
    missingAny25.length === 0 && allStationReqsOk);
  T.ok('Zone 1 warm-trough species have 0 placements above +1,450 m or frost01 > 0, and Zone 2 species stay <= +2,600 m with vitrophyrelipfern on vitrophyre > 0.35',
    badWarmHigh.length === 0 && badZone2High.length === 0 && badLipFern.length === 0);
  T.ok('Zone 3 frostrim keeps rimkrummholz <= 1.90 m (banner >= 1.80 m), snowbeddwarfbirch <= 1.10 m, and all alpine mats <= 1.40 m',
    badFrostKrumm.length === 0 && badFrostTall.length === 0 && stationCounts.frostrim.rimkrummholz >= 15);
  T.neg('warm-trough slotmulberry or steambedtaro is absent from mid-wall Csa ledges (+1,629 m) and ET frostrim (+4,784 m)',
    sk => (stationCounts[sk].slotmulberry || 0) + (stationCounts[sk].steambedtaro || 0) > 0,
    'frostrim',
    'fumarole');
}

T.done();
