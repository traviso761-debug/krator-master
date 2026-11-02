// ================================================================= METROPOLIS — the records  [G data]
// Every building is a record first (PLAN.md): footprint, height, storeys, massing as simple primitives, crown, core, ruin
// states and what each storey is for. No THREE, no DOM: the plans (41), the facades (42) and the shell cages (43) read
// these; the drawing decides nothing. Frame: a building's own, origin at the foot's centre, y up, x east, z south, metres;
// theta = atan2(z, x). Choices are KRAND hashes of a building's id and a part's index, never of how many draws came before.
var MP = {};
MP.STOREY = 3.6;                       // floor to floor (PLAN.md section 2); the bays' module
MP.CLEAR = 2.9;
MP.SEED = 7311;
MP.u = function (a, b, c, d) { return KRAND.unit(KRAND.hash(MP.SEED, a | 0, b == null ? 0 : b | 0, c == null ? 0 : c | 0, d == null ? 0 : d | 0)); };
MP.idHash = function (s) { return KRAND.child(MP.SEED, s) >>> 0; };

// The ruin states every record answers (the brief's seven). keep: the top of what stands, a share of the roof height;
// bare: the share of the height above the stump that is steel; glass: what is left of it; the rest are per-building notes
MP.RUINS = ['intact', 'gutted', 'crown', 'broken', 'stump', 'skeleton', 'fallen'];

// ---- the zones: a run of storeys with one use. use names a plan (41) and a facade rule (42).
function mpLevels(zones) {
  var L = [], y = 0;
  zones.forEach(function (Z, zi) {
    for (var i = 0; i < Z.n; i++) { var h = Z.h == null ? MP.STOREY : Z.h; L.push({ k: L.length, y: Math.round(y * 100) / 100, h: h, use: Z.use, zone: zi, nth: i }); y += h; }
  });
  return L;
}

// ---- S1 THE SPINDLE (language 1): a concave rocket on a flared skirt, three root fins, a disc lamp and a needle
MP.spindleR = function (y) {
  if (y <= 21.6) { var t = 1 - y / 21.6; return 30 + 16 * t * t; }
  if (y <= 210.6) { var u = 1 - (y - 21.6) / 189; return 15 + 15 * Math.pow(u, 1.6); }
  if (y <= 222) return 15 - 4 * (y - 210.6) / 11.4;
  return 11;
};
MP.SPINDLE = (function () {
  var zones = [
    { use: 'lobby', n: 1, h: 7.2 }, { use: 'mezzanine', n: 1 }, { use: 'market', n: 1, h: 5.4 }, { use: 'clinic', n: 1, h: 5.4 },
    { use: 'plant', n: 1 }, { use: 'flatsA', n: 12 }, { use: 'school', n: 1 }, { use: 'plant', n: 1 }, { use: 'offices', n: 10 },
    { use: 'skylobby', n: 1, h: 5.4 }, { use: 'hydroponics', n: 4 }, { use: 'plant', n: 1 }, { use: 'flatsB', n: 12 },
    { use: 'records', n: 4 }, { use: 'plant', n: 1 }, { use: 'flatsC', n: 4 }, { use: 'tanks', n: 4 }, { use: 'lamp', n: 1 }, { use: 'roofpark', n: 1, h: 5.4 }];
  var levels = mpLevels(zones), roof = 234;
  var sky = levels.filter(function (l) { return l.use === 'skylobby'; })[0].k, last = levels.length - 1;
  return {
    id: 'spindle', name: 'The Spindle', kind: 'skyscraper', language: 1, culture: 'ancient', tris: 80000,
    footprint: { shape: 'circle', r: 46 }, height: { roof: roof, tip: 262 }, storeys: levels.length, levels: levels, zones: zones,
    // massing as primitives: the envelope a cage, an impostor's box and a far silhouette are made from
    massing: [{ k: 'lathe', fn: 'spindleR', y0: 0, y1: 222 }, { k: 'disc', y0: 222, y1: 234, r: 20 }, { k: 'dome', y0: 234, y1: 240, r: 13 }, { k: 'needle', y0: 240, y1: 262, r: 0.9 }],
    fins: { n: 3, a0: Math.PI / 3, y1: 84, out: 8, t: 2.2 },       // root fins at 60, 180, 300 degrees
    portals: [0, 2 * Math.PI / 3, 4 * Math.PI / 3],                // between the fins
    crown: { k: 'lamp', neck: [210.6, 222], disc: [222, 234], r: 20, dome: 6, needle: [240, 262] },
    // one spine: two stairs (north, south) the whole height, two lift banks (east, west). The low bank ends at the sky lobby; the
    // high bank expresses to it and carries on, the shaft narrower above (the core steps in once, at the sky lobby)
    core: {
      kind: 'round', r: 6.5, stepAt: sky, rUp: 5.2,
      shafts: [
        { id: 'stair.n', kind: 'stair', x: 0, z: -3, w: 3.2, d: 2.6, from: 0, to: last },
        { id: 'stair.s', kind: 'stair', x: 0, z: 3, w: 3.2, d: 2.6, from: 0, to: last },
        { id: 'lift.e', kind: 'lift', x: 3.2, z: 0, w: 2.4, d: 3, from: 0, to: sky },
        { id: 'lift.w', kind: 'lift', x: -3.2, z: 0, w: 2.4, d: 3, from: 0, to: last - 1 }]
    },
    bays: { low: 72, high: 48, split: sky },                       // bays a turn: below the sky lobby, and above it
    shell: { mode: 'polar', sides: 8, bands: 3, texel: 0.33 },
    ruins: {
      intact: { note: 'whole, as built' },
      gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, note: 'glass gone, cyan dead, bays burnt out, streaked; the lamp cut off at the top hoop (crown gone comes with it: the disc is the first thing to fall)', keep: 0.84 },
      crown: { keep: 0.84, note: 'cut at the records hoop, the neck and lamp in the mound' },
      broken: { keep: 0.59, note: 'cut at the flats B hoop, torn; the top third lies across the street' },
      stump: { keep: 0.11, core: 0.2, note: 'cut at the first plant floor with the fins standing, the core taller' },
      skeleton: { keep: 0.48, bare: 0.72, note: 'the skin gone above the first plant floor; rings and columns stand' },
      fallen: { keep: 0.05, along: 1, note: 'down along the fins: a 200 m mound with sections of shaft in it' }
    }
  };
})();

// ---- M1 THE LEDGER (languages 6 and 7): a long civic slab on a great arcade, flared buttresses, relief end walls, a roof hall
MP.LEDGER = (function () {
  var zones = [
    { use: 'arcade', n: 1, h: 7.2 }, { use: 'mezzanine', n: 1 }, { use: 'market', n: 1 }, { use: 'clinic', n: 1 }, { use: 'plant', n: 1 },
    { use: 'offices', n: 3 }, { use: 'records', n: 2 }, { use: 'ministries', n: 1 }, { use: 'council', n: 1, h: 5.4 }];
  var levels = mpLevels(zones), roof = levels[levels.length - 1].y + levels[levels.length - 1].h;
  return {
    id: 'ledger', name: 'The Ledger', kind: 'midrise', language: 6, culture: 'ancient', tris: 45000,
    footprint: { shape: 'rect', w: 126, d: 24 }, height: { roof: roof, tip: roof + 8.4 }, storeys: levels.length, levels: levels, zones: zones,
    massing: [{ k: 'box', w: 126, d: 24, y0: 0, y1: roof }, { k: 'stepped', w: 96, d: 18, y0: roof, y1: roof + 8.4, steps: 3 }],
    buttress: { every: 12, out: 3.6, y1: 14.4 },                   // bronze flares on the long faces, on the bays' grid
    arcade: { every: 12, depth: 3 },
    relief: 'concrete.block.relief',                               // the blind end walls: the fire stairs stand behind them
    crown: { k: 'stepped', steps: 3, y1: roof + 8.4 },
    core: {
      kind: 'rects',
      shafts: [
        { id: 'stair.w', kind: 'stair', x: -60, z: -6.5, w: 6, d: 8, from: 0, to: levels.length - 1 },
        { id: 'stair.e', kind: 'stair', x: 60, z: -6.5, w: 6, d: 8, from: 0, to: levels.length - 1 },
        { id: 'core.w', kind: 'lift', x: -22.5, z: 6.5, w: 9, d: 8, from: 0, to: levels.length - 1 },
        { id: 'core.e', kind: 'lift', x: 22.5, z: 6.5, w: 9, d: 8, from: 0, to: levels.length - 1 }]
    },
    bays: { width: 3, n: 42 },                                     // 42 bays of 3 m a long face
    shell: { mode: 'box', texel: 0.33, inset: 3.8 },               // the buttresses stand 3.6 m out of the box's plan
    ruins: {
      intact: { note: 'whole, as built' },
      gutted: { glass: 0, strips: 0, breach: 0.08, stain: 0.75, note: 'glass gone, the metal roof hall stripped', keep: 0.88 },
      crown: { keep: 0.88, note: 'the roof hall fallen in' },
      broken: { keep: 0.7, span: [-20, 20], note: 'the centre span down to the arcade: two wings left, a mound between' },
      stump: { keep: 0.28, note: 'the arcade and its mezzanine' },
      skeleton: { keep: 0.6, bare: 0.7, note: 'frame only above the plant floor' },
      fallen: { keep: 0.1, along: 0, note: 'pancaked floors: a long low mound, the end walls standing' }
    }
  };
})();

MP.FAMILY = { spindle: MP.SPINDLE, ledger: MP.LEDGER };
MP.families = function () { return Object.keys(MP.FAMILY).map(function (k) { return MP.FAMILY[k]; }); };

// the plain radius of a family's envelope at y (massing only): the cage's and the fit test's source
MP.envelope = function (F, y) {
  var r = 0;
  F.massing.forEach(function (m) {
    if (y < m.y0 || y > m.y1) return;
    if (m.k === 'lathe') r = Math.max(r, MP[m.fn](y));
    else if (m.k === 'disc') r = Math.max(r, m.r);
    else if (m.k === 'dome') { var t = (y - m.y0) / (m.y1 - m.y0); r = Math.max(r, m.r * Math.sqrt(Math.max(0, 1 - t * t))); }
    else if (m.k === 'needle') r = Math.max(r, m.r * (1 - (y - m.y0) / (m.y1 - m.y0)));
  });
  if (F.fins && y <= F.fins.y1) r = Math.max(r, MP.finR(F, y));
  return r;
};
// a root fin's outer edge: the skin at y plus a flare that dies at the fin's top
MP.finR = function (F, y) { var t = 1 - y / F.fins.y1; return MP.spindleR(y) + F.fins.out * Math.pow(t, 1.4); };
