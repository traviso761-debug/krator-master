/* ======================================================================
   Krator Ancient Transit: the street furniture (kits/ancient-transit/krator-transit-furniture.js)

   The Ancients' street furniture as catalog ASSETs of culture `ancient` on the catalog core (core/catalog/
   krator-furniture-core.js: makeFrame, F.box/cyl/beam/rod/frustum/dome/tube, F.col over FPAL). The kinds, their
   boxes, their states and their ruin numbers are KTRANSIT.KINDS (src/40-tr-records.js, [G data]); this file is
   only how each is drawn, intact, and what it does differently in a ruin state when the generic pass
   (transit-furnish.js: lean, kink, fall, crush, soot, rust, glass gone) is not the whole story: a lamp's cable
   out when it is down, a cabinet's doors off and lying beside it when gutted, a planter's dead bush, a kiosk's
   shutter, a signal's lenses dark. Every piece reads F.ruin: {state, glass, soot, rust, ...} (KTRANSIT.ruinOf).

   Frame: the catalog's floor frame. Origin at the footprint's centre on the ground, +z the piece's front (a
   bench faces +z, a shelter opens on +z, a lamp's arm reaches over the carriageway at +z), y up. Colours are
   palette keys (F.col), never literals outside the PALETTE block; the family names the material the assembler
   merges by and the host skins with the library: '' (paint), 'metal', 'rust', 'concrete', 'pave', 'white',
   'glass', 'glow', 'corrugated', 'rubble', 'soil'. Nothing here draws from F.rnd: the intact and the ruined builds
   of one seed are one piece (the wreckage heaps draw from it, since they have one state).
   ====================================================================== */

if (ASSET_CULTURES.indexOf('ancient') < 0) ASSET_CULTURES.push('ancient');
FURN_CULTURE('ancient', {
  name: 'the Ancients',
  lore: 'the lost high civilisation; their ruined capital is the Ancient\'s Valley; white seamed panel, bronze bands, blue glass, cyan strips',
  /* PALETTE (sRGB; the assembler converts to linear). The metropolis kit's white and bronze, the vehicles kit's blue glass and cyan */
  palette: {
    whitePanel: 0xe6e4dc, paintGrey: 0x9aa0a4, paintTeal: 0x3f8f8a, paintSafety: 0xd9a12c, paintDark: 0x4a4e52,
    steelGrey: 0x8c9094, steelDark: 0x55585c, rustBrown: 0x7a4630, bronze: 0x8a6a3c,
    concGrey: 0xa8a298, concDark: 0x7e7a72, paveGrey: 0x9a948a,
    glassBlue: 0x2c4c70, glassDark: 0x22364a, glowCyan: 0x5ee0f0, glowRed: 0xd83a2a, glowAmber: 0xe0a030, glowGreen: 0x4ad07a,
    soot: 0x1c1a18, plantGreen: 0x5a7a42, plantDead: 0x6a5a3c, soil: 0x4a3c30, cable: 0x2a2a2e,
    sand: 0x9a8a6a, sandDark: 0x7a6a50, olive: 0x5a5e3c
  }
  /* END PALETTE */
});

/* the ASSET entry of a kind: its box and variants from KTRANSIT.KINDS, the catalog's fields filled in */
function TR_ASSET(key, build) {
  const K = KTRANSIT.KINDS[key];
  if (!K) throw new Error('krator-transit-furniture: no kind ' + key + ' in KTRANSIT.KINDS');
  ASSET({ key: key, name: K.name, culture: 'ancient', family: 'infrastructure', types: ['infrastructure'], districts: ['street'], wealth: [0, 1],
    w: K.w, d: K.d, h: K.h, variants: K.variants, states: K.states, build: build });
}
/* a lens or a strip that glows while the piece is intact and is dark glass after */
function trLens(F, lx, ly, lz, w, h, d, key) { const on = F.ruin.state === 'intact'; F.box(lx, ly, lz, w, h, d, 0, F.col(on ? key : 'glassDark'), on ? 'glow' : 'glass'); }
function trRuined(F) { return F.ruin.state !== 'intact'; }
/* a pole sheared at its foot (its `crushed`; the owner, 2026-11-08: never a pole squashed short): a stump of the standard with its torn top
   and the cable out of it */
function trStump(F, r, y0, h, key) { const c = F.col; F.frustum(0, y0, 0, r, r * 0.9, h, 0, c(key), 'metal', 10); F.rod(0, y0 + h - 0.05, 0, 0.12, y0 + h + 0.35, 0.08, r * 0.3, c('steelDark'), 'rust'); F.rod(0, y0 + h - 0.05, 0, -0.1, y0 + h + 0.2, -0.1, r * 0.25, c('steelDark'), 'rust'); F.rod(0, y0 + h, 0, 0.3, 0.02, 1.4, 0.02, c('cable'), 'rust'); }

/* ---- the lamp standard: a concrete base, a tapering steel standard, an arm over the carriageway (+z), a head with a cyan strip; v1 two arms */
TR_ASSET('tr_lamp', function (F) {
  const c = F.col, two = F.variant === 1;
  F.cyl(0, 0, 0, 0.32, 0.5, 0, c('concGrey'), 'concrete');
  if (F.ruin.state === 'crushed') { trStump(F, 0.17, 0.5, 0.9 + 1.2 * F.ruin.crush, 'paintGrey'); return; }
  F.frustum(0, 0.5, 0, 0.17, 0.1, 7.6, 0, c('paintGrey'), 'metal', 10);
  [1].concat(two ? [-1] : []).forEach(function (s) {
    F.beam(0, 8.0, 0, 0, 8.55, s * 2.5, 0.13, 0.13, c('paintGrey'), 'metal');
    F.box(0, 8.4, s * 2.55, 0.5, 0.26, 0.95, 0, c('paintDark'), 'metal');
    trLens(F, 0, 8.36, s * 2.55, 0.4, 0.05, 0.75, 'glowCyan');
  });
  /* down or leaning, the head's cable hangs out */
  if (F.ruin.state === 'fallen') F.rod(0, 8.5, 2.9, 0.2, 8.35, 4.6, 0.025, c('cable'), 'rust');
  else if (F.ruin.state === 'bent') F.rod(0, 8.45, 2.9, 0.1, 7.5, 3.1, 0.025, c('cable'), 'rust');
});

/* ---- the traffic signal: a pole, a mast arm, three heads hung from it, each three lenses; v1 adds a pedestrian head on the pole */
TR_ASSET('tr_signal', function (F) {
  const c = F.col;
  F.cyl(0, 0, 0, 0.26, 0.35, 0, c('concGrey'), 'concrete');
  if (F.ruin.state === 'crushed') { trStump(F, 0.14, 0.35, 0.6 + 1.0 * F.ruin.crush, 'paintGrey'); return; }
  F.frustum(0, 0.35, 0, 0.14, 0.1, 5.9, 0, c('paintGrey'), 'metal', 10);
  F.beam(0, 6.0, 0, 0, 5.75, 5.6, 0.16, 0.16, c('paintGrey'), 'metal');
  F.rod(0, 6.2, 0, 0, 5.9, 3.2, 0.03, c('cable'), 'metal');
  [1.6, 3.4, 5.1].forEach(function (z) {
    F.box(0, 4.55, z, 0.36, 1.15, 0.32, 0, c('paintDark'), 'metal');
    trLens(F, 0, 5.4, z + 0.12, 0.26, 0.26, 0.1, 'glowRed'); trLens(F, 0, 5.05, z + 0.12, 0.26, 0.26, 0.1, 'glowAmber'); trLens(F, 0, 4.7, z + 0.12, 0.26, 0.26, 0.1, 'glowGreen');
  });
  if (F.variant === 1) { F.box(0.28, 2.4, 0, 0.3, 0.6, 0.3, 0, c('paintDark'), 'metal'); trLens(F, 0.28, 2.75, 0.12, 0.2, 0.2, 0.1, 'glowRed'); trLens(F, 0.28, 2.5, 0.12, 0.2, 0.2, 0.1, 'glowGreen'); }
});

/* ---- the overhead sign gantry across a road: two trussed legs, a box beam, sign boards hung from it; v1 three smaller boards and a lamp rail */
TR_ASSET('tr_gantry', function (F) {
  const c = F.col, sp = F.span > 0 ? F.span : KTRANSIT.KINDS.tr_gantry.span, half = sp / 2 - 0.7;
  [-1, 1].forEach(function (s) {
    F.box(s * half, 0, 0, 1.2, 0.5, 1.4, 0, c('concGrey'), 'concrete');
    [[-0.35, -0.45], [0.35, -0.45], [-0.35, 0.45], [0.35, 0.45]].forEach(function (p) { F.box(s * half + p[0], 0.5, p[1], 0.18, 6.3, 0.18, 0, c('paintGrey'), 'metal'); });
    for (let y = 1.2; y < 6.5; y += 1.3) { F.beam(s * half - 0.35, y, -0.45, s * half + 0.35, y + 1.1, 0.45, 0.07, 0.07, c('paintGrey'), 'metal'); F.beam(s * half + 0.35, y, -0.45, s * half - 0.35, y + 1.1, 0.45, 0.07, 0.07, c('paintGrey'), 'metal'); }
  });
  F.box(0, 6.5, 0, 2 * half + 1.0, 0.7, 0.7, 0, c('paintGrey'), 'metal');
  const bw = Math.min(5.2, sp * 0.36), bx = Math.min(half - bw / 2 - 0.6, sp * 0.24);
  if (F.variant === 0) [-bx, bx].forEach(function (x) { F.box(x, 6.9, 0.3, bw, 1.9, 0.1, 0, c('paintTeal'), ''); F.box(x, 6.95, 0.42, bw * 0.85, 0.5, 0.03, 0, c('whitePanel'), 'white'); F.box(x, 7.7, 0.42, bw * 0.77, 0.35, 0.03, 0, c('whitePanel'), 'white'); });
  else { const b3 = Math.min(3.4, sp * 0.24); [-sp * 0.3, 0, sp * 0.3].forEach(function (x) { F.box(x, 6.9, 0.3, b3, 1.5, 0.1, 0, c('paintTeal'), ''); F.box(x, 7.1, 0.42, b3 * 0.82, 0.6, 0.03, 0, c('whitePanel'), 'white'); }); F.box(0, 5.9, 0.6, sp - 2, 0.14, 0.2, 0, c('paintDark'), 'metal'); for (let x = -sp * 0.36; x <= sp * 0.36; x += 2.5) trLens(F, x, 5.78, 0.6, 0.6, 0.06, 0.22, 'glowCyan'); }
});

/* ---- a street sign: a thin pole and one to three plates (v: one teal plate, a stack of two, a safety plate and a small one) */
TR_ASSET('tr_sign', function (F) {
  const c = F.col;
  if (F.ruin.state === 'crushed') { trStump(F, 0.055, 0, 0.3 + 0.8 * F.ruin.crush, 'paintGrey'); F.box(0.4, 0, 0.3, 1.1, 0.04, 0.32, 0.7, c('paintTeal'), ''); return; }
  F.cyl(0, 0, 0, 0.055, 3.3, 0, c('paintGrey'), 'metal');
  if (F.variant === 0) { F.box(0, 2.6, 0.04, 1.15, 0.32, 0.04, 0, c('paintTeal'), ''); F.box(0, 2.66, 0.07, 0.9, 0.1, 0.01, 0, c('whitePanel'), 'white'); }
  else if (F.variant === 1) { F.box(0, 2.75, 0.04, 1.1, 0.3, 0.04, 0, c('paintTeal'), ''); F.box(0, 2.35, 0.04, 0.95, 0.3, 0.04, 0, c('paintTeal'), ''); F.box(0, 2.8, 0.07, 0.8, 0.1, 0.01, 0, c('whitePanel'), 'white'); F.box(0, 2.4, 0.07, 0.7, 0.1, 0.01, 0, c('whitePanel'), 'white'); }
  else { F.box(0, 2.5, 0.04, 0.6, 0.6, 0.04, 0, c('paintSafety'), ''); F.box(0, 2.7, 0.07, 0.36, 0.2, 0.01, 0, c('soot'), ''); F.box(0, 1.9, 0.04, 0.5, 0.3, 0.04, 0, c('whitePanel'), 'white'); }
});

/* ---- a bench: v0 a white slab on two concrete blocks; v1 steel slats on a frame with a back */
TR_ASSET('tr_bench', function (F) {
  const c = F.col;
  if (F.variant === 0) { [-0.8, 0.8].forEach(function (x) { F.box(x, 0, 0, 0.36, 0.42, 0.72, 0, c('concGrey'), 'concrete'); }); F.box(0, 0.42, 0, 2.2, 0.09, 0.62, 0, c('whitePanel'), 'white'); F.box(0, 0.51, -0.26, 2.2, 0.42, 0.06, 0, c('whitePanel'), 'white'); }
  else {
    [[-1.0, -0.3], [1.0, -0.3], [-1.0, 0.3], [1.0, 0.3]].forEach(function (p) { F.rod(p[0], 0, p[1], p[0], 0.44, p[1], 0.03, c('steelDark'), 'metal'); });
    [-0.26, -0.09, 0.08, 0.25].forEach(function (z) { F.box(0, 0.44, z, 2.15, 0.05, 0.13, 0, c('paintTeal'), ''); });
    [-1.0, 1.0].forEach(function (x) { F.beam(x, 0.44, -0.3, x, 0.95, -0.42, 0.05, 0.05, c('steelDark'), 'metal'); });
    [0.62, 0.8].forEach(function (y) { F.box(0, y, -0.36, 2.15, 0.13, 0.05, 0, c('paintTeal'), ''); });
  }
});

/* ---- a bollard: v0 a steel post with a cyan band; v1 a concrete block with a cap */
TR_ASSET('tr_bollard', function (F) {
  const c = F.col;
  if (F.variant === 0) { F.cyl(0, 0, 0, 0.14, 1.0, 0, c('paintDark'), 'metal'); F.dome(0, 1.0, 0, 0.14, 0.09, 0, c('paintDark'), 'metal'); trLens(F, 0, 0.78, 0, 0.29, 0.06, 0.29, 'glowCyan'); }
  else { F.box(0, 0, 0, 0.3, 0.95, 0.3, 0, c('concGrey'), 'concrete'); F.frustum(0, 0.95, 0, 0.21, 0.12, 0.15, 0, c('concDark'), 'concrete', 4); }
});

/* ---- a litter bin: v0 a drum with a domed lid; v1 a square bin with a slot */
TR_ASSET('tr_bin', function (F) {
  const c = F.col;
  if (F.variant === 0) { F.cyl(0, 0, 0, 0.3, 0.95, 0, c('paintGrey'), 'metal'); F.dome(0, 0.95, 0, 0.31, 0.15, 0, c('paintDark'), 'metal'); F.box(0, 0.7, 0.3, 0.3, 0.14, 0.04, 0, c('soot'), ''); }
  else { F.box(0, 0, 0, 0.6, 1.05, 0.6, 0, c('paintTeal'), ''); F.box(0, 1.05, 0, 0.64, 0.06, 0.64, 0, c('paintDark'), 'metal'); F.box(0, 0.78, 0.3, 0.36, 0.1, 0.03, 0, c('soot'), ''); }
});

/* ---- a hydrant: a safety-yellow barrel, two side caps, a top nut */
TR_ASSET('tr_hydrant', function (F) {
  const c = F.col;
  F.cyl(0, 0, 0, 0.16, 0.12, 0, c('steelDark'), 'metal'); F.cyl(0, 0.12, 0, 0.13, 0.62, 0, c('paintSafety'), 'metal'); F.dome(0, 0.74, 0, 0.14, 0.13, 0, c('paintSafety'), 'metal');
  F.beam(-0.25, 0.5, 0, 0.25, 0.5, 0, 0.14, 0.14, c('paintSafety'), 'metal'); F.cyl(0, 0.86, 0, 0.05, 0.09, 0, c('steelDark'), 'metal');
  F.beam(0, 0.42, 0, 0, 0.42, 0.24, 0.12, 0.12, c('steelDark'), 'metal');
});

/* ---- a planter: a concrete trough, soil, a bush (dead when the piece is ruined); v1 a long white trough */
TR_ASSET('tr_planter', function (F) {
  const c = F.col, dead = trRuined(F);
  if (F.variant === 0) { F.box(0, 0, 0, 1.4, 0.62, 0.9, 0, c('concGrey'), 'concrete'); F.box(0, 0.55, 0, 1.25, 0.1, 0.75, 0, c('soil'), 'soil'); F.dome(0, 0.6, 0, 0.55, 0.7, 0, c(dead ? 'plantDead' : 'plantGreen'), ''); }
  else { F.box(0, 0, 0, 1.8, 0.5, 0.7, 0, c('whitePanel'), 'white'); F.box(0, 0.44, 0, 1.65, 0.08, 0.55, 0, c('soil'), 'soil'); [-0.5, 0.5].forEach(function (x) { F.dome(x, 0.5, 0, 0.4, 0.55, 0, c(dead ? 'plantDead' : 'plantGreen'), ''); }); if (!dead) F.dome(0, 0.5, 0, 0.3, 0.8, 0, c('plantGreen'), ''); }
});

/* ---- a kiosk: a white panelled box, a counter window under a shutter, a roof slab, a lit sign, an awning; v1 a round one */
TR_ASSET('tr_kiosk', function (F) {
  const c = F.col, ruined = trRuined(F);
  if (F.variant === 0) {
    F.box(0, 0, -0.1, 3.0, 2.3, 2.3, 0, c('whitePanel'), 'white'); F.box(0, 2.3, 0, 3.2, 0.2, 2.6, 0, c('concDark'), 'concrete');
    F.box(0, 1.05, 1.06, 2.6, 1.0, 0.06, 0, c('glassBlue'), 'glass'); F.box(0, ruined ? 1.05 : 2.05, 1.08, 2.6, ruined ? 1.0 : 0.25, 0.05, 0, c('steelGrey'), 'corrugated');
    F.box(0, 0.95, 1.1, 2.7, 0.1, 0.3, 0, c('bronze'), 'metal');
    F.beam(0, 2.25, 1.15, 0, 2.05, 1.95, 3.0, 0.06, c('paintTeal'), '');
    trLens(F, 0, 2.5, 1.32, 2.2, 0.4, 0.06, 'glowCyan');
  } else {
    F.cyl(0, 0, 0, 1.3, 2.4, 0, c('whitePanel'), 'white'); F.cyl(0, 2.4, 0, 1.45, 0.18, 0, c('concDark'), 'concrete'); F.dome(0, 2.58, 0, 1.3, 0.5, 0, c('bronze'), 'metal');
    F.box(0, 1.0, 1.28, 1.6, 0.9, 0.06, 0, c('glassBlue'), 'glass'); F.box(0, 0.9, 1.3, 1.7, 0.1, 0.25, 0, c('bronze'), 'metal');
    trLens(F, 0, 2.0, 1.3, 1.4, 0.3, 0.05, 'glowCyan');
  }
});

/* ---- a tram shelter: four posts, a thin white roof, a glass back and sides, a bench; v1 a longer open-sided one on two posts */
TR_ASSET('tr_shelter', function (F) {
  const c = F.col, two = F.variant === 1;
  (two ? [[-1.9, -0.9], [1.9, -0.9]] : [[-2.4, -0.95], [2.4, -0.95], [-2.4, 0.95], [2.4, 0.95]]).forEach(function (p) { F.cyl(p[0], 0, p[1], 0.08, 2.75, 0, c('steelGrey'), 'metal'); });
  F.box(0, 2.75, 0, 5.2, 0.14, 2.2, 0, c('whitePanel'), 'white'); F.box(0, 2.6, 0, 5.0, 0.15, 0.3, 0, c('bronze'), 'metal');
  F.box(0, 0.4, -1.02, two ? 3.6 : 4.7, 2.3, 0.04, 0, c('glassBlue'), 'glass');
  if (!two) [-2.45, 2.45].forEach(function (x) { F.box(x, 0.4, 0, 0.04, 2.3, 1.85, 0, c('glassBlue'), 'glass'); });
  [-1.3, 1.3].forEach(function (x) { F.box(x, 0, -0.55, 0.3, 0.45, 0.4, 0, c('concGrey'), 'concrete'); }); F.box(0, 0.45, -0.55, 3.6, 0.08, 0.5, 0, c('paintTeal'), '');
  F.box(two ? -1.6 : -2.1, 1.3, -0.9, 0.5, 1.1, 0.08, 0, c('paintTeal'), ''); trLens(F, two ? -1.6 : -2.1, 2.1, -0.85, 0.4, 0.15, 0.04, 'glowCyan');
});

/* ---- a utility cabinet: a plinth, a steel box, two doors (off and lying beside it when gutted), vents; v1 a transformer with fins */
TR_ASSET('tr_cabinet', function (F) {
  const c = F.col, gutted = F.ruin.state === 'burnt' || F.ruin.state === 'crushed';
  F.box(0, 0, 0, 1.6, 0.15, 0.8, 0, c('concGrey'), 'concrete');
  F.box(0, 0.15, -0.02, 1.5, 1.5, 0.68, 0, c('paintGrey'), 'metal');
  if (!gutted) [-0.37, 0.37].forEach(function (x) { F.box(x, 0.22, 0.34, 0.7, 1.36, 0.04, 0, c('paintGrey'), 'metal'); F.box(x + 0.25, 0.9, 0.37, 0.04, 0.12, 0.03, 0, c('steelDark'), 'metal'); });
  else { F.box(0, 0.22, 0.3, 1.3, 1.3, 0.1, 0, c('soot'), ''); for (let y = 0.4; y < 1.4; y += 0.3) F.box(0, y, 0.3, 1.2, 0.05, 0.14, 0, c('steelDark'), 'rust'); [-1.1, 1.15].forEach(function (x, i) { F.box(x, 0, 0.6, 0.7, 0.04, 1.36, i ? 0.4 : -0.3, c('paintGrey'), 'metal'); }); }
  if (F.variant === 1) { for (let x = -0.6; x <= 0.6; x += 0.15) F.box(x, 0.3, -0.42, 0.04, 1.1, 0.16, 0, c('steelDark'), 'metal'); F.cyl(-0.4, 1.65, 0, 0.08, 0.35, 0, c('bronze'), 'metal'); F.cyl(0.4, 1.65, 0, 0.08, 0.35, 0, c('bronze'), 'metal'); }
  else { F.box(0, 1.25, -0.37, 1.1, 0.25, 0.03, 0, c('steelDark'), 'metal'); trLens(F, 0.55, 1.5, 0.37, 0.08, 0.08, 0.03, 'glowCyan'); }
});

/* ---- a crash barrier: a jersey profile in three steps */
TR_ASSET('tr_barrier', function (F) {
  const c = F.col;
  F.box(0, 0, 0, 3.0, 0.22, 0.6, 0, c('concGrey'), 'concrete'); F.box(0, 0.22, 0, 3.0, 0.3, 0.42, 0, c('concGrey'), 'concrete'); F.box(0, 0.52, 0, 3.0, 0.33, 0.26, 0, c('concGrey'), 'concrete');
  F.box(0, 0.6, 0.14, 2.6, 0.1, 0.02, 0, c('paintSafety'), ''); F.box(0, 0.6, -0.14, 2.6, 0.1, 0.02, 0, c('paintSafety'), '');
});

/* ---- a guardrail: posts and a W-beam along x */
TR_ASSET('tr_guardrail', function (F) {
  const c = F.col;
  [-2.5, -0.5, 1.5].forEach(function (x) { F.box(x + 0.5, 0, 0, 0.12, 0.72, 0.16, 0, c('steelDark'), 'metal'); });
  F.box(0, 0.47, 0.1, 6.0, 0.31, 0.08, 0, c('steelGrey'), 'metal'); F.box(0, 0.52, 0.15, 6.0, 0.08, 0.03, 0, c('steelDark'), 'metal');
});

/* ---- a pedestrian bridge across a street: four columns, a deck, parapets (v1 glass screens), a stair down at each end toward +z */
TR_ASSET('tr_footbridge', function (F) {
  const c = F.col, glass = F.variant === 1, down = F.ruin.state === 'fallen', sp = F.span > 0 ? F.span : KTRANSIT.KINDS.tr_footbridge.span, hx = sp / 2 - 1.5, hs = sp / 2;
  /* fallen: the +x columns are stumps and the deck lies from the standing pair down to the road, its parapet torn */
  [[-hx, -1.1], [hx, -1.1], [-hx, 1.1], [hx, 1.1]].forEach(function (p) { F.box(p[0], 0, p[1], 0.6, down && p[0] > 0 ? 1.1 + 0.6 * Math.abs(p[1]) : 5.4, 0.6, 0, c('concGrey'), 'concrete'); });
  if (down) {
    F.beam(-hx - 0.3, 5.4, 0, hx + 0.3, 1.0, 0.8, 2.6, 0.5, c('concGrey'), 'concrete'); F.beam(-hx, 5.9, 0, hx, 1.5, 0.8, 2.3, 0.06, c('paveGrey'), 'pave');
    F.beam(-hx - 1.1, 6.0, -1.3, -hx * 0.2, 4.0, -1.1, 0.1, 0.1, c('steelGrey'), 'metal'); for (let x = -hx - 1.0; x <= -hx * 0.2; x += 1.15) { const t = (x + hx + 1.1) / (hx * 0.8 + 1.1); F.rod(x, 5.9 - 2.0 * t, -1.3, x + 0.3, 6.9 - 2.4 * t, -1.3, 0.02, c('steelGrey'), 'metal'); }
    for (let i = 0; i < 6; i++) F.box(hx * 0.2 + i * hx * 0.13, 0, -2.2 + (i % 3) * 1.6, 1.2, 0.3 + 0.1 * (i % 2), 0.9, i * 0.5, c('concGrey'), 'concrete');
  } else {
    F.box(0, 5.4, 0, sp, 0.5, 2.6, 0, c('concGrey'), 'concrete'); F.box(0, 5.9, 0, sp - 0.4, 0.06, 2.3, 0, c('paveGrey'), 'pave');
    [-1.3, 1.3].forEach(function (z) { if (glass) F.box(0, 5.9, z, sp - 0.4, 1.2, 0.05, 0, c('glassBlue'), 'glass'); else { F.box(0, 6.9, z, sp - 0.2, 0.1, 0.1, 0, c('steelGrey'), 'metal'); for (let x = -hs + 0.5; x <= hs - 0.5; x += 1.15) F.rod(x, 5.9, z, x, 6.9, z, 0.02, c('steelGrey'), 'metal'); } });
  }
  [-1, 1].forEach(function (s) {
    if (down && s > 0) return;
    const x0 = s * hs, x1 = s * (hs - 1.6);
    F.beam(x0 * 0.98, 5.4, 1.3, x1, 0.0, 10.6, 2.2, 0.4, c('concGrey'), 'concrete');
    for (let t = 0.08; t < 1; t += 0.085) F.box(x0 * 0.98 + (x1 - x0 * 0.98) * t, 5.4 * (1 - t), 1.3 + 9.3 * t, 2.2, 0.15, 0.6, 0, c('paveGrey'), 'pave');
    F.beam(x0 * 0.98 + s * 1.15, 6.4, 1.3, x1 + s * 1.15, 1.0, 10.6, 0.08, 0.08, c('steelGrey'), 'metal');
    F.box(x1, 0, 10.8, 2.4, 0.3, 1.2, 0, c('concGrey'), 'concrete');
  });
});

/* ---- the military positions (the owner, 2026-11-08). A sandbag wall (v0 a straight wall, v1 a U emplacement open on +z), a sentry post (v0 a
   concrete hut with a slit, v1 a watchtower on legs), a checkpoint boom, a tank trap of three crossed beams, a coil of razor wire (v1 two) */
function trBagRow(F, x0, z0, x1, z1, rows, zig) {
  const c = F.col, L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.55)), ux = (x1 - x0) / L, uz = (z1 - z0) / L, ry = Math.atan2(ux, uz) + Math.PI / 2;
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const t = (i + (r % 2 ? 0.5 : 0) + 0.5) / n; if (t > 1) continue; const x = x0 + (x1 - x0) * t + (zig ? -uz * 0.05 * (i % 2) : 0), z = z0 + (z1 - z0) * t + (zig ? ux * 0.05 * (i % 2) : 0);
    F.box(x, r * 0.26, z, 0.55, 0.27, 0.34, ry + F.rr(-0.1, 0.1), c(F.chance(0.7) ? 'sand' : 'sandDark'), 'soil'); }
}
TR_ASSET('tr_sandbags', function (F) {
  if (F.variant === 0) trBagRow(F, -2, 0, 2, 0, 4, true);
  else { trBagRow(F, -2, -1.3, 2, -1.3, 4, true); trBagRow(F, -1.9, -1.0, -1.9, 1.3, 4, true); trBagRow(F, 1.9, -1.0, 1.9, 1.3, 4, true); F.box(0, 0, -0.5, 1.2, 0.3, 0.8, 0, F.col('olive'), ''); }
});
TR_ASSET('tr_sentry', function (F) {
  const c = F.col;
  if (F.variant === 0) { F.box(0, 0, 0, 2.4, 2.5, 2.4, 0, c('concGrey'), 'concrete'); F.box(0, 1.5, 1.2, 1.4, 0.3, 0.06, 0, c('soot'), ''); F.box(1.2, 0.1, 0.4, 0.06, 2.0, 0.9, 0, c('soot'), ''); F.box(0, 2.5, 0, 2.7, 0.2, 2.7, 0, c('concDark'), 'concrete'); F.box(-0.9, 2.7, -0.9, 0.3, 0.6, 0.3, 0, c('steelDark'), 'rust'); }
  else {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.rod(p[0] * 1.2, 0, p[1] * 1.2, p[0] * 0.95, 4.4, p[1] * 0.95, 0.07, c('steelDark'), 'metal'); });
    for (let y = 1.0; y < 4.2; y += 1.5) { F.beam(-1.15 + y * 0.05, y, -1.15 + y * 0.05, 1.15 - y * 0.05, y + 1.3, 1.15 - y * 0.05, 0.05, 0.05, c('steelDark'), 'metal'); F.beam(1.15 - y * 0.05, y, -1.15 + y * 0.05, -1.15 + y * 0.05, y + 1.3, 1.15 - y * 0.05, 0.05, 0.05, c('steelDark'), 'metal'); }
    F.box(0, 4.4, 0, 2.8, 0.18, 2.8, 0, c('paintGrey'), 'metal'); [[0, -1.3], [0, 1.3], [-1.3, 0], [1.3, 0]].forEach(function (p, i) { F.box(p[0], 4.58, p[1], i < 2 ? 2.8 : 0.1, 1.0, i < 2 ? 0.1 : 2.8, 0, c('olive'), ''); });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.rod(p[0] * 1.3, 5.58, p[1] * 1.3, p[0] * 1.3, 6.3, p[1] * 1.3, 0.04, c('steelDark'), 'metal'); }); F.box(0, 6.3, 0, 3.0, 0.12, 3.0, 0, c('paintGrey'), 'metal');
    for (let y = 0.3; y < 4.2; y += 0.35) F.box(0, y, 1.3, 0.5, 0.04, 0.05, 0, c('steelDark'), 'metal'); F.rod(-0.27, 0, 1.3, -0.27, 4.4, 1.3, 0.025, c('steelDark'), 'metal'); F.rod(0.27, 0, 1.3, 0.27, 4.4, 1.3, 0.025, c('steelDark'), 'metal');
  }
});
TR_ASSET('tr_boom', function (F) {
  const c = F.col, down = F.ruin.state !== 'intact';
  F.box(-3.2, 0, 0, 0.7, 0.3, 0.9, 0, c('concGrey'), 'concrete'); F.box(-3.2, 0.3, 0, 0.3, 1.0, 0.3, 0, c('paintGrey'), 'metal'); F.box(-3.5, 0.6, 0, 0.5, 0.5, 0.5, 0, c('paintDark'), 'metal');
  const y1 = down ? 0.45 : 1.05, x1 = 3.5;
  F.beam(-3.0, 1.05, 0, x1, y1, 0, 0.12, 0.16, c('paintSafety'), '');
  for (let x = -2.2; x < 3.2; x += 1.3) { const t = (x + 3.0) / (x1 + 3.0); F.box(x, 1.05 + (y1 - 1.05) * t - 0.06, 0, 0.5, 0.17, 0.18, 0, c('whitePanel'), 'white'); }
  F.box(3.4, 0, 0, 0.3, down ? 0.3 : 0.95, 0.3, 0, c('paintGrey'), 'metal'); trLens(F, -3.2, 1.35, 0.16, 0.2, 0.2, 0.06, 'glowRed');
});
TR_ASSET('tr_hedgehog', function (F) {
  const c = F.col;
  F.beam(-0.9, 0.02, 0.55, 0.9, 1.5, -0.55, 0.16, 0.16, c('steelDark'), 'metal'); F.beam(0.9, 0.02, 0.55, -0.9, 1.5, -0.55, 0.16, 0.16, c('steelDark'), 'metal'); F.beam(0, 0.05, 1.0, 0, 1.1, -1.0, 0.16, 0.16, c('steelDark'), 'metal');
  F.box(0, 0.6, 0, 0.5, 0.5, 0.5, 0.6, c('steelDark'), 'metal');
});
TR_ASSET('tr_wire', function (F) {
  const c = F.col, coils = F.variant ? 2 : 1;
  for (let k = 0; k < coils; k++) { const pts = [], n = 44, zc = (k - (coils - 1) / 2) * 0.9; for (let i = 0; i <= n; i++) { const t = i / n, a = t * Math.PI * 2 * 7; pts.push([-1.95 + 3.9 * t, 0.46 + 0.44 * Math.sin(a), zc + 0.44 * Math.cos(a)]); } F.tube(pts, 0.018, c('steelDark'), 'metal'); }
  [-1.9, 1.9].forEach(function (x) { F.rod(x, 0, 0, x, 1.05, 0, 0.03, c('steelDark'), 'metal'); });
});

/* ---- the wreckage: a heap of pavement slabs on a mound; a heap of glass; a tangle of cable round a torn junction box. Drawn from F.rnd: one
   state, so the seed is the whole piece */
TR_ASSET('tr_rubble_pave', function (F) {
  const c = F.col, n = F.variant ? 9 : 6;
  F.frustum(0, -0.1, 0, F.variant ? 1.3 : 1.0, F.variant ? 0.55 : 0.42, 0.55, F.rr(0, 1), c('concDark'), 'rubble', 7);   /* a seven-sided mound (a dome cost 250 triangles; a war lays hundreds of heaps) */
  for (let i = 0; i < n; i++) { const a = F.rr(0, F.TAU), r = F.rr(0.1, 0.9), x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85, y0 = F.rr(0.02, 0.4), dx = F.rr(-0.6, 0.6), dz = F.rr(-0.5, 0.5), dy = F.rr(0.05, 0.5);
    F.beam(x, y0, z, x + dx, y0 + dy, z + dz, F.rr(0.5, 1.0), 0.12, c(F.chance(0.6) ? 'paveGrey' : 'concGrey'), F.chance(0.6) ? 'pave' : 'concrete'); }
  for (let i = 0; i < 2; i++) { const a = F.rr(0, F.TAU); F.rod(Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.5, Math.cos(a) * 0.5 + F.rr(-0.6, 0.6), F.rr(0.6, 0.95), Math.sin(a) * 0.5 + F.rr(-0.6, 0.6), 0.02, c('rustBrown'), 'rust'); }
});
TR_ASSET('tr_rubble_glass', function (F) {
  const c = F.col, n = F.variant ? 26 : 16;
  F.dome(0, -0.05, 0, 0.85, 0.3, 0, c('glassDark'), 'glass');
  for (let i = 0; i < n; i++) { const a = F.rr(0, F.TAU), r = F.rr(0, 0.85), x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9; F.beam(x, F.rr(0, 0.12), z, x + F.rr(-0.3, 0.3), F.rr(0.05, 0.3), z + F.rr(-0.3, 0.3), F.rr(0.1, 0.3), 0.015, c('glassDark'), 'glass'); }
  F.box(F.rr(-0.4, 0.4), 0, F.rr(-0.4, 0.4), 0.5, 0.06, 0.4, F.rr(0, 3), c('steelDark'), 'rust');
});
TR_ASSET('tr_rubble_cable', function (F) {
  const c = F.col, loops = F.variant ? 4 : 3;
  for (let k = 0; k < loops; k++) { const pts = [], cx = F.rr(-0.5, 0.5), cz = F.rr(-0.4, 0.4), r = F.rr(0.4, 1.0), n = 10, a0 = F.rr(0, F.TAU);
    for (let i = 0; i <= n; i++) { const a = a0 + i / n * F.rr(3, 6.2); pts.push([cx + Math.cos(a) * r * F.rr(0.8, 1.2), 0.04 + 0.12 * Math.abs(Math.sin(i * 1.7 + k)), cz + Math.sin(a) * r * F.rr(0.7, 1.1)]); }
    F.tube(pts, 0.035, c('cable'), 'rust'); }
  F.box(F.rr(-0.3, 0.3), 0, F.rr(-0.3, 0.3), 0.5, 0.35, 0.3, F.rr(0, 3), c('steelDark'), 'rust'); F.rod(0, 0.3, 0, F.rr(-0.8, 0.8), 0.55, F.rr(-0.8, 0.8), 0.03, c('cable'), 'rust');
});
