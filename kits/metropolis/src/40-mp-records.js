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
// A look is a state, or a state with a variant: 'crown.wild' is the crown state overgrown (44b, 59e). MP.look splits a look into its
// base state and its variant, so every reader of a state (MP.ruin, the debris plan, the shell record, the heroes) takes a look too
MP.WILD = 'wild';
MP.look = function (s) {
  var i = s == null ? -1 : String(s).indexOf('.');
  if (i < 0) return { state: s, variant: null, wild: false };
  var v = String(s).slice(i + 1);
  return { state: String(s).slice(0, i), variant: v, wild: v === MP.WILD };
};

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
// the arcade's piers along a slab: as near `every` apart as fits a whole number of spans, end to end (a fixed 12 m on a 126 m slab put the last pier 6 m past the end)
MP.arcadePiers = function (F) { var hw = F.footprint.w / 2, n = Math.max(1, Math.round(2 * hw / F.arcade.every)), out = []; for (var i = 0; i <= n; i++) out.push(-hw + i * 2 * hw / n); return out; };

// ---- a ruin, as plain numbers (metres), from its record's state. cut: where the skin is cut; torn: how far the tear runs down under the cut (the edge steps by
// storeys, deeper here and there); skin: the top of the whole skin (a storey under it can open); frame: [y0, y1] of a skeleton's bare steel, patchy below it from
// the plant floor; top: the highest thing that stands (the shell's frame); core, fins, ends: what stands above the cut (a stump's core and fins, a fallen slab's end walls)
MP.ruin = function (F, state) {
  state = MP.look(state).state;
  var S = F.ruins[state], roof = F.height.roof, plant = F.levels.filter(function (L) { return L.use === 'plant'; })[0], plantTop = plant ? plant.y + plant.h : 0, round = F.core.kind === 'round';
  if (!S || state === 'intact') return { state: 'intact', cut: Infinity, torn: 0, skin: F.height.tip, top: F.height.tip, frame: null, patchy: null, core: 0, fins: F.fins ? F.fins.y1 : 0, ends: 0, span: null };
  var cut = S.keep * roof, torn = ({ gutted: 0, crown: 1.5, broken: 3, stump: 1, skeleton: 2, fallen: 1.5 })[state] * MP.STOREY, skin = cut - torn, frame = null, patchy = null;
  if (state === 'skeleton') { var fz = plantTop + (1 - (S.bare || 0)) * (cut - plantTop); patchy = [plantTop, fz]; frame = [fz, cut]; skin = plantTop; }
  /* a stump's fins stand above its cut, free of the skin: finsFree, the rubble's to draw (a polar shell fans a free blade into a sheet) */
  var core = S.core ? S.core * roof : 0, fins = F.fins ? Math.min(F.fins.y1, cut) : 0, finsFree = F.fins && state === 'stump' && F.fins.y1 > cut ? [cut, F.fins.y1] : null, ends = state === 'fallen' && !round ? 0.55 * roof : 0;
  if (state === 'fallen' && !round) skin = 0;
  return { state: state, cut: cut, torn: torn, skin: Math.max(0, skin), top: Math.max(cut + (round ? 8 : 1), core + 1, fins, ends), frame: frame, patchy: patchy, core: core, fins: fins, finsFree: finsFree, ends: ends, span: S.span || null };
};
// where the tear cuts the skin at u (a polar tower: the angle times 24, about metres; a slab: x): the cut, less up to `torn` by value noise (KRAND), so the edge steps
// storey by storey. A slab's broken span (the Ledger's) is cut to the arcade's top, blending to the tear over 4 m either side
MP.tearAt = function (F, R, u) {
  if (!R.torn && !R.span) return R.cut;
  var seed = MP.idHash(F.id + '.' + R.state) & 0xffff, f = (KRAND.vnoise(u / 9, 1.7, 0, seed) + 0.5 * KRAND.vnoise(u / 3.3, 4.1, 0, seed)) / 1.5, c = R.cut - R.torn * Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  if (R.span) { var a = F.levels[1].y - 0.01, d = Math.max(R.span[0] - u, u - R.span[1]); if (d < 0) return a; if (d < 4) return a + (c - a) * d / 4; }
  return c;
};
// the tear for a design or an Ancients building (59b): the same, its noise over the angle round the axis taken on a circle (continuous all round:
// by the angle alone it jumped where the angle wraps, behind the axis at -x, on the parts standing off it: the Organ's pipes, the Pods, the Long Curve)
MP.tearAtXZ = function (F, R, x, z) {
  if (!R.torn) return R.cut;
  var seed = MP.idHash(F.id + '.' + R.state) & 0xffff, t = Math.atan2(z, x), cx = Math.cos(t) * 24, sz = Math.sin(t) * 24;
  var f = (KRAND.vnoise(cx / 9, sz / 9, 1.7, seed) + 0.5 * KRAND.vnoise(cx / 3.3, sz / 3.3, 4.1, seed)) / 1.5;
  return R.cut - R.torn * Math.min(1, Math.max(0, (f - 0.2) / 0.6));
};
// what lies at a ruin's foot, as records (the tower's own frame; the stage turns it with the tower). mounds: KRUBBLE heaps (centre, half-lengths, strike, crest, a seed); pieces:
// a shaft's section lying (r, len, along the yaw ry, tipped by tilt), the lamp's disc on its side, a slab tipped up. A Spindle falls along a fin, the Ledger in on itself
MP.debrisPlan = function (F, state) {
  state = MP.look(state).state;
  var R = MP.ruin(F, state); if (R.state === 'intact' || state === 'gutted') return null;
  var seed = function (i) { return MP.idHash(F.id + '.' + state + '.' + i) >>> 0; }, M = [], P = [];
  /* a heap's crest from the old tiers' rise (hs: the plan's numbers), its loose blocks by its area */
  var heap = function (x, z, y0, ry, rx, rz, hs, i) { var h = hs.reduce(function (a, b) { return a + b; }, 0) * 0.8; return { x: x, z: z, y0: y0, ry: ry, rx: rx, rz: rz, h: Math.min(h, Math.min(rx, rz) * 0.7), rough: 0.35, lumps: 8, blocks: Math.min(24, Math.round(rx * rz / 60)), cover: 3, seed: seed('m' + i) }; };
  /* a design with plans (46c): its heaps scaled to it. A tall one falls along its record's fall line, drum sections lying in the mound; a squat
     one (the Cupola: wider than tall) falls in on itself, the dome into the hall */
  /* A design of several towers (F.towers: the Organ's pipes, the Pods' pods and dome, the Long Curve's runs) heaps each where it stood, along
     its own fall line; one the tear passes over (shorter than the cut) stands whole and drops nothing */
  if (F.design) (F.towers || [{ x: 0, z: 0, r: F.envR(0), h: F.height.roof, fall: F.fall }]).forEach(function (T, ti) {
    if (F.towers && T.h <= R.cut) return;
    var H = T.h, R0 = T.r, ph2 = T.fall == null ? 0 : T.fall, sq = T.squat || H < R0 * 1.2, s2 = Math.max(H, R0 * 2), d2 = [Math.cos(ph2), Math.sin(ph2)];
    var at2 = function (s, o) { return [T.x + d2[0] * s - d2[1] * o, T.z + d2[1] * s + d2[0] * o]; }, mnd = function (s, o, rx, rz, hs, i) { var c = at2(s, o); M.push(heap(c[0], c[1], 0, ph2, rx, rz, hs, i + ti * 10)); };
    /* a section lying: the shaft's radius where it broke (secR: the Stalk's stalk, not its saucers); a design's discs (the Stalk's saucers) fall as the Spindle's lamp does */
    var sec = function (s, o, y, len, ry, tilt) { var c = at2(s, o); if (F.footprint.shape === 'rect') { P.push({ kind: 'slab', x: c[0], y: 1.6, z: c[1], w: len, d: Math.min(F.footprint.w, F.footprint.d) * 0.55, t: 3.2, ry: ph2 + ry, tilt: tilt * 0.6 }); return; } P.push({ kind: 'shaft', x: c[0], z: c[1], r: Math.max(2, (T.sr != null ? T.sr : F.secR ? F.secR(y) : F.envR(y)) * 0.8), len: len, ry: ph2 + ry, tilt: tilt, mat: F.mat }); };
    var dsc = function (s, o, r, tilt) { var c = at2(s, o); P.push({ kind: 'disc', x: c[0], z: c[1], r: r, ry: ph2, tilt: tilt }); };
    if (sq) {
      if (state === 'crown') mnd(0, 0, R0 * 0.7, R0 * 0.7, [4, 3, 2.5], 0);
      if (state === 'broken') { mnd(R0 * 0.45, 0, R0 * 0.55, R0 * 0.4, [5, 4, 3], 0); mnd(R0 + 8, 0, R0 * 0.35, R0 * 0.2, [3, 2], 1); }
      if (state === 'stump') { mnd(0, 0, R0 * 0.8, R0 * 0.8, [6, 5, 4], 0); mnd(R0 + 6, R0 * 0.3, R0 * 0.3, R0 * 0.15, [3, 2], 1); }
      if (state === 'skeleton') mnd(0, 0, R0 * 0.45, R0 * 0.45, [3, 2], 0);
      if (state === 'fallen') { mnd(0, 0, R0 * 1.05, R0 * 1.05, [6, 5, 4], 0); mnd(R0 + 10, 0, R0 * 0.4, R0 * 0.2, [3, 2], 1); }
    } else {
      if (state === 'crown') { mnd(R0 + 0.06 * s2, 0, 0.1 * s2, 0.06 * s2, [3, 2.5, 2], 0); sec(R0 + 0.03 * s2, -0.04 * s2, H * 0.9, 0.06 * s2, 0.4, 0.1); if (F.discs) dsc(R0 + 0.12 * s2, 0.02 * s2, F.discs[F.discs.length - 1], 0.4); }
      if (state === 'broken') { mnd(R0 + 0.25 * s2, 0, 0.28 * s2, 0.1 * s2, [5, 4, 3], 0); sec(R0 + 0.12 * s2, 2, H * 0.65, 0.12 * s2, 0.08, 0.06); sec(R0 + 0.36 * s2, -4, H * 0.8, 0.1 * s2, -0.15, -0.05); if (F.discs) dsc(R0 + 0.5 * s2, 0, F.discs[F.discs.length - 1], 0.5); }
      if (state === 'stump') { mnd(R0 * 0.5, 0, R0 * 1.1, R0 * 0.9, [6, 5, 4], 0); mnd(R0 + 0.15 * s2, 0.1 * s2, 0.12 * s2, 0.07 * s2, [3, 2], 1); sec(R0 + 0.06 * s2, -0.08 * s2, H * 0.4, 0.1 * s2, 0.4, 0.05); }
      if (state === 'skeleton') { mnd(R0 + 4, 0, 0.08 * s2, 0.05 * s2, [3, 2], 0); mnd(R0 + 2, -0.12 * s2, 0.06 * s2, 0.04 * s2, [2.5, 2], 1); }
      if (state === 'fallen') { mnd(R0 + 0.35 * s2, 0, 0.4 * s2, Math.max(R0 * 0.7, 0.08 * s2), [7, 5, 4], 0); mnd(R0 * 0.3, 0, R0 * 0.9, R0 * 0.8, [5, 4], 1);
        [0.15, 0.35, 0.55].forEach(function (q, i) { sec(R0 + q * s2, (i % 2 ? 4 : -4), H * (0.3 + q), 0.11 * s2, (i % 2 ? 0.1 : -0.12), 0.05); }); if (F.discs) F.discs.forEach(function (r, i) { dsc(R0 + (0.45 + 0.25 * i) * s2, i ? 6 : -6, r, 0.35); }); }
    }
  });
  /* a design's skeleton keeps its frame in the hero (MP.ruinDesign), not the rubble */
  if (F.design) return { mounds: M, pieces: P };
  if (F.core.kind === 'round') {
    var ph = F.fins.a0, d = [Math.cos(ph), Math.sin(ph)], at = function (s, o) { return [d[0] * s - d[1] * o, d[1] * s + d[0] * o]; }, R0 = MP.spindleR(0), rAt = MP.spindleR;
    var mound = function (s, o, rx, rz, hs, i) { var c = at(s, o); M.push(heap(c[0], c[1], 0, ph, rx, rz, hs, i)); };
    var shaft = function (s, o, y, len, ry, tilt) { var c = at(s, o); P.push({ kind: 'shaft', x: c[0], z: c[1], r: rAt(y), len: len, ry: ph + ry, tilt: tilt }); };
    var disc = function (s, o, tilt) { var c = at(s, o); P.push({ kind: 'disc', x: c[0], z: c[1], r: F.crown.r, ry: ph, tilt: tilt }); };
    if (state === 'crown') { mound(R0 + 14, 0, 20, 12, [4, 3.5, 3], 0); disc(R0 + 26, 4, 0.42); shaft(R0 + 6, -14, 216, 14, 0.5, 0.1); }
    if (state === 'broken') { mound(R0 + 52, 0, 58, 22, [7, 6, 4], 0); shaft(R0 + 26, 2, 150, 24, 0.08, 0.06); shaft(R0 + 66, -5, 175, 22, -0.15, -0.05); shaft(R0 + 96, 6, 200, 18, 0.3, 0.08); disc(R0 + 118, 0, 0.5); }
    if (state === 'stump') { mound(R0 * 0.55, 0, 54, 42, [8, 6, 5], 0); mound(R0 + 40, 18, 24, 13, [4, 3], 1); shaft(R0 + 12, -16, 60, 24, 0.4, 0.05); shaft(R0 + 38, 14, 110, 20, -0.6, 0.08); }
    if (state === 'skeleton') { mound(R0 + 6, 0, 18, 11, [3.5, 3], 0); mound(R0 + 2, -28, 13, 9, [3, 2], 1); }
    if (state === 'fallen') { mound(R0 + 96, 0, 106, 28, [8, 6, 5], 0); mound(R0 * 0.4, 0, 42, 36, [7, 5], 1); [[30, 30], [80, 70], [130, 115], [180, 160]].forEach(function (q, i) { shaft(R0 + q[0], (i % 2 ? 4 : -4), q[1], 26, (i % 2 ? 0.1 : -0.12), 0.05); }); disc(R0 + 214, 0, 0.35); }
  } else {
    var hw = F.footprint.w / 2, hd = F.footprint.d / 2, mb = function (x, z, y0, rx, rz, hs, i) { M.push(heap(x, z, y0, 0, rx, rz, hs, i)); };
    var slab = function (x, y, z, w, dd, ry, tilt, i) { P.push({ kind: 'slab', x: x, y: y, z: z, w: w, d: dd, t: 0.4, ry: ry, tilt: tilt }); };
    if (state === 'crown') { mb(0, 0, R.skin, 40, 8, [1.6, 1.2], 0); mb(0, -(hd + 6), 0, 38, 6, [2, 1.5], 1); slab(-14, R.skin + 1.2, 1, 9, 6, 0.2, 0.3); slab(12, R.skin + 1, -2, 8, 7, -0.3, -0.25); }
    if (state === 'broken') { mb(0, 0, F.levels[1].y, 24, 11, [4, 3, 2], 0); mb(0, hd + 6, 0, 22, 7, [3, 2], 1); mb(0, -(hd + 6), 0, 22, 7, [3, 2], 2); slab(-8, 11, 4, 10, 8, 0.15, 0.45); slab(9, 10, -3, 9, 7, -0.2, -0.35); slab(2, 3, hd + 7, 8, 6, 0.6, 0.6); }
    if (state === 'stump') { mb(0, hd + 7, 0, 58, 7, [3, 2.5, 1.5], 0); mb(0, -(hd + 7), 0, 58, 7, [3, 2.5, 1.5], 1); slab(-30, 3, hd + 6, 10, 7, 0.1, 0.55); slab(25, 3, -(hd + 6), 9, 7, -0.2, -0.5); }
    if (state === 'skeleton') { mb(0, hd + 5, 0, 50, 5, [2, 1.5], 0); mb(0, -(hd + 5), 0, 50, 5, [2, 1.5], 1); }
    if (state === 'fallen') { mb(0, 0, 0, 66, 18, [5, 4, 3], 0); [[-40, 0.4], [-14, -0.3], [8, 0.5], [30, -0.45], [50, 0.3]].forEach(function (q, i) { slab(q[0], 7, (i % 2 ? 4 : -4), 12, 9, (i % 2 ? 0.2 : -0.15), q[1], i); }); }
  }
  if (R.finsFree) P.push({ kind: 'fins', y0: R.finsFree[0], y1: R.finsFree[1] });
  if (R.frame) P.push({ kind: 'frame' });
  return { mounds: M, pieces: P };
};
