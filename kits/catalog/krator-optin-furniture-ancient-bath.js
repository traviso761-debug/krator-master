/* ======================================================================
   The Ancients' bath fixtures (2026-11-03): OPT-IN ONLY.

   OPT-IN UNTIL THE NEXT TIME THE CATALOG IS TOUCHED. This file is NOT a krator-master-furniture-*.js culture file on purpose,
   so nothing that globs those (the catalog page, kits/interiors, kits/ancients-interiors, furniture_bundle.bundle(None))
   picks it up, and every page built before it stays byte-identical. A build takes it only by asking:
       furniture_bundle.bundle([...], optin=['ancient-bath'])      (joins after the runtime, before the detail maps)
       python3 build.py --opt-in                                   (the catalog sheet with it: dist/catalog-optin.html)
   The next time kits/catalog is touched (and every build that takes the catalog is rebuilt anyway), MAKE IT PERMANENT:
   move these FURN blocks into the Ancients section of krator-master-furniture.js ("the intact buildings' interiors"),
   the palette keys into FPAL['ancient'] (krator-furniture-core.js), the `bath` programme into kits/interiors
   src/30-programs.js (IX.PROGRAMS.bath, IX.KIND_WEIGHT.bath), drop the optin argument from every caller, delete this
   file, and rebuild every build that takes the catalog (TODO.md, "Ride along with the next all-builds rebuild").

   What it holds: seven pieces for a bath room (room kind `bath`, the kind kits/metropolis's flats give their bathrooms),
   in the house rules of the Ancients' intact interiors (krator-master-furniture.js, ancients_*): metres; glazed white
   porcelain and white render, pale stone, bronze and brass fittings, rounded forms. Each lists only `bath` in its rooms,
   so taking the file changes no other room's furnishing. Roles (the catalog's `role`, what the programme's require
   slots read; IX.guessRole returns a declared role as is):
     ancients_bath_tub         vessel  wall   role bathtub     a moulded tub, drawn or dry (variants)
     ancients_bath_shower      vessel  wall   role shower      a glass-screened stall on a pale stone tray, or a wet room
     ancients_bath_toilet      vessel  wall   role toilet      a moulded bowl with a wall cistern, or wall-hung off a duct
     ancients_bath_basin       vessel  wall   role washbasin   a pedestal basin, or a slim one on brackets; an oval mirror over it
     ancients_bath_mirror      art     wall   role mirror      an oval mirror in a bronze ring (hung at eye height)
     ancients_bath_towel_rail  rack    wall   role towel_rail  a bronze towel ladder, with towels or bare (variants)
     ancients_bath_bench       bench   floor  role bench       a pale stone bench with a folded towel
   No bath mat: a rug blocks the placer's walk grid (kits/interiors 45-placer.js stamps every floor piece), and a bath
   is small enough that a mat would cut the way to the basin.

   The PROGRAMME. kits/interiors has no `bath` programme (a kind with none takes IX.DEFAULT_PROGRAM: tables, storage and
   lamps, and about nothing in a 4 m2 room), so a bath room fills only once one is installed. This file carries it and,
   in a bundle, hands it to the host on the API (it loads after krator-furniture-runtime.js, so KF_API exists):
       KratorFurniture.ancientBath = { keys, PROGRAM, install(IX) }
       KratorFurniture.ancientBath.install(KratorInteriors)        once, before furnishing (an existing PROGRAMS.bath is kept)
   PROGRAM: require a bathtub or a shower, a toilet and a basin (in that order: the big piece first; the placer reorders
   a slot that finds no fit), then up to one towel rail, one mirror and one bench while there is room (one optional
   piece per 1.5 m2 at wealth 0.5). The adapter must offer the culture `ancient` (AI.furnishPlan's cultures filter).
   ====================================================================== */

/* PALETTE */
FURN_CULTURE('ancient', { palette: {
  /* glazed porcelain, white render and pale stone; bronze and brass fittings; a tin-backed mirror; drawn water; a towel */
  porcelain: 0xf3f1ea, renderWhite: 0xebe7dc, stonePale: 0xd8d0bf,
  bronze: 0xa87a3e, brass: 0xc8a050, tinMirror: 0xc4ccd0,
  waterClear: 0x8fb8c0, clothTowel: 0xe4ddcf
} });
/* END PALETTE */

FURN({
  key: 'ancients_bath_tub', name: 'Moulded bathtub', culture: 'ancient', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['bath'], role: 'bathtub', task: [],
  anchor: 'wall', clearance: { front: 0.6 }, materials: ['ceramic', 'plaster', 'bronze', 'glass'],
  w: 1.75, d: 0.82, h: 0.95, variants: 2, variantNames: ['drawn', 'dry'],
  build: function (F) {
    const P = F.col('porcelain'), B = F.col('bronze'), dry = F.variant === 1;
    /* a long side to the wall: the plinth of white render set back a toe, the shell a rounded oblong (two half-round ends on a
       straight middle), its rim a lip proud of it */
    F.box(0, 0, 0.02, 1.6, 0.08, 0.7, 0, F.shade('renderWhite', -0.12), 'plaster');
    for (const s of [-1, 1]) F.cyl(s * 0.47, 0.08, 0, 0.4, 0.44, 0, P, 'ceramic');
    F.box(0, 0.08, 0, 0.94, 0.44, 0.8, 0, P, 'ceramic');
    for (const s of [-1, 1]) F.cyl(s * 0.47, 0.52, 0, 0.405, 0.05, 0, F.shade(P, 0.03), 'ceramic');
    F.box(0, 0.52, 0, 0.94, 0.05, 0.81, 0, F.shade(P, 0.03), 'ceramic');
    /* the hollow: drawn water a hand under the rim, or the dry porcelain in shadow */
    const inner = dry ? F.shade(P, -0.24) : F.col('waterClear'), fam = dry ? 'ceramic' : 'glass';
    for (const s of [-1, 1]) F.cyl(s * 0.47, 0.555, 0, 0.32, 0.02, 0, inner, fam);
    F.box(0, 0.555, 0, 0.94, 0.02, 0.64, 0, inner, fam);
    /* the bronze mixer on the wall: its plate, the spout over the water, two brass wheels; the hand shower on its hook */
    F.box(0, 0.62, -0.395, 0.34, 0.12, 0.03, 0, B, 'bronze');
    F.rod(0, 0.68, -0.38, 0, 0.66, -0.22, 0.022, B, 'bronze');
    F.ball(0, 0.655, -0.22, 0.03, B, 'bronze');
    for (const s of [-1, 1]) F.ball(s * 0.13, 0.68, -0.365, 0.035, F.col('brass'), 'bronze');
    F.rod(0.34, 0.74, -0.395, 0.34, 0.9, -0.395, 0.012, B, 'bronze');
    F.cyl(0.34, 0.86, -0.36, 0.035, 0.08, 0, F.col('brass'), 'bronze');
  }
});

/* the shower, the toilet and the basin each have a COMPACT variant (1) for a narrow bath: kits/metropolis's flats give theirs
   strips 0.55 to 1.05 m wide, and a wall piece needs its depth, a 3 cm gap and its front clearance across the room. The
   placer tries the wealth-picked variant first, then the others smallest first, so a strip takes the compact ones */
FURN({
  key: 'ancients_bath_shower', name: 'Glass-screened shower', culture: 'ancient', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['bath'], role: 'shower', task: [],
  anchor: 'wall', clearance: { front: 0.5 }, materials: ['stone', 'plaster', 'glass', 'bronze'],
  w: 0.95, d: 0.95, h: 2.1, variants: 2, variantNames: ['stall on a stone tray', 'wet room'],
  variantDims: [{ w: 0.95, d: 0.95, h: 2.1 }, { w: 0.9, d: 0.32, h: 2.1 }],
  build: function (F) {
    const S = F.col('stonePale'), B = F.col('bronze'), G = F.col('glassSky'), wet = F.variant === 1;
    const hw = wet ? 0.45 : 0.475, hd = wet ? 0.16 : 0.475, bz = -hd + 0.025;
    /* the floor: a pale stone tray with its round drain, or (a wet room) a stone strip at the wall with a bronze channel drain;
       the back of white render lapped up the wall, a stone niche shelf on it */
    if (wet) { F.box(0, 0, 0, hw * 2, 0.02, hd * 2, 0, S, 'stone'); F.box(0, 0.02, hd - 0.05, hw * 2 - 0.1, 0.01, 0.05, 0, B, 'bronze'); }
    else { F.box(0, 0, 0, hw * 2, 0.07, hd * 2, 0, S, 'stone'); F.cyl(0, 0.07, 0.08, 0.05, 0.02, 0, B, 'bronze'); }
    const y0 = wet ? 0.02 : 0.07;
    F.box(0, y0, bz, hw * 2, 2.07 - y0, 0.05, 0, F.col('renderWhite'), 'plaster');
    F.box(0.22, 1.2, bz + 0.07, 0.4, 0.03, 0.1, 0, S, 'stone');
    /* the glass: the stall's side screen on the left and half its front (the right half open), a bronze rail over them, a post
       at the opening; the wet room's one fin on the left, its rail to the wall */
    if (wet) {
      F.box(-hw + 0.015, y0, 0.01, 0.02, 1.95, hd * 2 - 0.06, 0, G, 'glass');
      F.rod(-hw + 0.015, 2.02, bz + 0.03, -hw + 0.015, 2.02, hd - 0.02, 0.015, B, 'bronze');
      F.rod(-hw + 0.015, y0, hd - 0.02, -hw + 0.015, 2.02, hd - 0.02, 0.015, B, 'bronze');
    } else {
      F.box(-hw + 0.01, y0, 0.01, 0.02, 1.95, 0.9, 0, G, 'glass');
      F.box(-0.22, y0, hd - 0.01, 0.5, 1.95, 0.02, 0, G, 'glass');
      F.rod(-hw + 0.01, 2.02, bz + 0.03, -hw + 0.01, 2.02, hd - 0.01, 0.015, B, 'bronze');
      F.rod(-hw + 0.01, 2.02, hd - 0.01, 0.03, 2.02, hd - 0.01, 0.015, B, 'bronze');
      F.rod(0.03, y0, hd - 0.01, 0.03, 2.02, hd - 0.01, 0.015, B, 'bronze');
    }
    /* the riser up the back, its arm out, the round brass rose; the mixer plate and its wheel at hand height */
    const rz = bz + 0.04, rose = wet ? 0.02 : -0.2;
    F.rod(0.15, 1.0, rz, 0.15, 1.95, rz, 0.014, B, 'bronze');
    F.rod(0.15, 1.95, rz, 0.15, 1.96, rose - 0.04, 0.014, B, 'bronze');
    F.cyl(0.15, 1.93, rose, 0.11, 0.025, 0, F.col('brass'), 'bronze');
    F.box(0.15, 1.0, bz + 0.035, 0.16, 0.12, 0.02, 0, B, 'bronze');
    F.ball(0.15, 1.06, bz + 0.06, 0.035, F.col('brass'), 'bronze');
  }
});

FURN({
  key: 'ancients_bath_toilet', name: 'Moulded toilet', culture: 'ancient', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['bath'], role: 'toilet', task: [],
  anchor: 'wall', clearance: { front: 0.45 }, materials: ['ceramic', 'metal', 'bronze', 'plaster'],
  w: 0.42, d: 0.66, h: 0.86, variants: 2, variantNames: ['wall cistern', 'wall-hung'],
  variantDims: [{ w: 0.42, d: 0.66, h: 0.86 }, { w: 0.4, d: 0.52, h: 1.0 }],
  build: function (F) {
    const P = F.col('porcelain'), A = F.col('alloy'), hung = F.variant === 1;
    if (hung) {
      /* the cistern hidden in a duct of white render up the wall, the bronze flush plate on its face; the bowl hung off it */
      F.box(0, 0, -0.2, 0.4, 1.0, 0.12, 0, F.col('renderWhite'), 'plaster');
      F.box(0, 0.86, -0.135, 0.14, 0.09, 0.012, 0, F.col('bronze'), 'bronze');
      F.box(0, 0.28, -0.16, 0.22, 0.16, 0.14, 0, P, 'ceramic');
      F.ell(0, 0.36, 0.02, 0.18, 0.1, 0.24, 0, P, 'ceramic');
      F.ell(0, 0.465, 0.02, 0.19, 0.018, 0.245, 0, A, 'metal');
      F.ell(0, 0.477, 0.03, 0.11, 0.012, 0.15, 0, F.shade(P, -0.32), 'ceramic');
      F.beam(0, 0.48, -0.127, 0, 0.84, -0.122, 0.34, 0.025, A, 'metal');
      return;
    }
    /* the cistern on the wall: a block with a rounded top, the bronze flush plate on its face; the neck down to the bowl */
    F.box(0, 0.44, -0.255, 0.4, 0.34, 0.15, 0, P, 'ceramic');
    F.rod(-0.2, 0.78, -0.255, 0.2, 0.78, -0.255, 0.075, P, 'ceramic');
    F.box(0, 0.64, -0.178, 0.12, 0.08, 0.012, 0, F.col('bronze'), 'bronze');
    F.box(0, 0.12, -0.24, 0.24, 0.32, 0.18, 0, P, 'ceramic');
    /* the foot, the oval bowl, the alloy seat ring with the dark of the bowl inside it, the lid stood up against the cistern */
    F.frustum(0, 0, -0.03, 0.15, 0.12, 0.26, 0, P, 'ceramic', 16);
    F.ell(0, 0.33, 0.04, 0.19, 0.1, 0.27, 0, P, 'ceramic');
    F.ell(0, 0.435, 0.04, 0.2, 0.018, 0.28, 0, A, 'metal');
    F.ell(0, 0.447, 0.05, 0.12, 0.012, 0.17, 0, F.shade(P, -0.32), 'ceramic');
    F.beam(0, 0.45, -0.162, 0, 0.82, -0.15, 0.36, 0.025, A, 'metal');
  }
});

FURN({
  key: 'ancients_bath_basin', name: 'Washbasin under an oval mirror', culture: 'ancient', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['bath'], role: 'washbasin', task: [],
  anchor: 'wall', clearance: { front: 0.5 }, materials: ['ceramic', 'stone', 'bronze', 'metal'],
  w: 0.64, d: 0.5, h: 1.85, variants: 2, variantNames: ['pedestal', 'slim, on brackets'],
  variantDims: [{ w: 0.64, d: 0.5, h: 1.85 }, { w: 0.5, d: 0.34, h: 1.8 }],
  build: function (F) {
    const P = F.col('porcelain'), B = F.col('bronze'), slim = F.variant === 1;
    const hw = slim ? 0.25 : 0.32, hd = slim ? 0.17 : 0.25, bz = -hd + 0.015, k = slim ? 0.68 : 1;
    /* the pale stone splashback on the wall; over it the oval mirror in its bronze ring */
    F.box(0, 0.8, bz, hw * 2, 0.3, 0.03, 0, F.col('stonePale'), 'stone');
    F.ell(0, slim ? 1.42 : 1.45, bz + 0.003, 0.25 * (slim ? 0.8 : 1), 0.36, 0.012, 0, B, 'bronze');
    F.ell(0, slim ? 1.42 : 1.45, bz + 0.013, 0.22 * (slim ? 0.8 : 1), 0.33, 0.012, 0, F.col('tinMirror'), 'metal');
    /* the stand: a flared porcelain pedestal, or two bronze brackets from the wall; the bowl turned out to a rolled rim, the
       shadow of its hollow inside */
    const by = slim ? 0.68 : 0.62;
    if (slim) for (const s of [-1, 1]) F.rod(s * 0.1, 0.62, -hd, s * 0.1, by + 0.04, -0.02, 0.012, B, 'bronze');
    else F.lathe(0, 0, -0.06, [[0.15, 0], [0.11, 0.06], [0.085, 0.4], [0.12, 0.64]], 0, P, 'ceramic', { nu: 20 });
    F.lathe(0, by, 0, [[0.1 * k, 0], [0.19 * k, 0.07 * k], [0.24 * k, 0.16 * k], [0.25 * k, 0.215 * k], [0.235 * k, 0.235 * k]], 0, P, 'ceramic', { nu: 28 });
    F.cyl(0, by + 0.235 * k - 0.055, 0, 0.22 * k, 0.04, 0, F.shade(P, -0.26), 'ceramic');
    /* the bronze spout from the splashback, two brass wheels */
    F.rod(0, 0.96, bz + 0.015, 0, 0.94, bz + 0.13, 0.018, B, 'bronze');
    F.ball(0, 0.935, bz + 0.13, 0.025, B, 'bronze');
    for (const s of [-1, 1]) F.ball(s * (slim ? 0.12 : 0.15), 0.96, bz + 0.03, 0.03, F.col('brass'), 'bronze');
  }
});

FURN({
  key: 'ancients_bath_mirror', name: 'Oval mirror in a bronze ring', culture: 'ancient', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['bath'], role: 'mirror', task: [],
  anchor: 'wall', clearance: {}, materials: ['bronze', 'metal', 'stone'],
  w: 0.6, d: 0.05, h: 0.86, variants: 1,
  build: function (F) {
    /* the bronze ring flat to the wall, the tin-backed glass in it, a pale stone ledge under it */
    F.ell(0, 0.43, -0.013, 0.3, 0.43, 0.012, 0, F.col('bronze'), 'bronze');
    F.ell(0, 0.43, -0.002, 0.27, 0.4, 0.012, 0, F.col('tinMirror'), 'metal');
    F.box(0, 0, -0.005, 0.36, 0.025, 0.04, 0, F.col('stonePale'), 'stone');
  }
});

FURN({
  key: 'ancients_bath_towel_rail', name: 'Bronze towel ladder', culture: 'ancient', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['bath'], role: 'towel_rail', task: [],
  anchor: 'wall', clearance: { front: 0.35 }, materials: ['bronze', 'cloth'],
  w: 0.62, d: 0.16, h: 1.2, variants: 2, variantNames: ['towels', 'bare'],
  build: function (F) {
    const B = F.col('bronze');
    /* two uprights on round feet, brass finials, each held off the wall by two brackets on plates; five rungs */
    for (const s of [-1, 1]) {
      const x = s * 0.28;
      F.cyl(x, 0, -0.02, 0.03, 0.02, 0, B, 'bronze');
      F.rod(x, 0.02, -0.02, x, 1.15, -0.02, 0.016, B, 'bronze');
      F.ball(x, 1.16, -0.02, 0.025, F.col('brass'), 'bronze');
      for (const y of [0.3, 1.0]) { F.rod(x, y, -0.074, x, y, -0.02, 0.012, B, 'bronze'); F.box(x, y - 0.03, -0.075, 0.06, 0.06, 0.01, 0, B, 'bronze'); }
    }
    for (let k = 0; k < 5; k++) F.rod(-0.28, 0.25 + k * 0.22, -0.02, 0.28, 0.25 + k * 0.22, -0.02, 0.012, B, 'bronze');
    if (F.variant === 1) return;
    /* towels folded over the two top rungs, each a fold over the rung and two hanging leaves */
    for (const y of [0.91, 0.69]) {
      const C = F.pick(['clothTowel', 'clothTeal', 'clothSlate', 'clothDove']), x = F.rr(-0.04, 0.04);
      F.box(x, y - 0.005, -0.02, 0.44, 0.03, 0.06, 0, C, 'cloth');
      F.box(x, y - 0.36, 0.022, 0.44, 0.36, 0.02, 0, C, 'cloth');
      F.box(x, y - 0.28, -0.062, 0.44, 0.28, 0.02, 0, F.shade(C, -0.08), 'cloth');
    }
  }
});

FURN({
  key: 'ancients_bath_bench', name: 'Pale stone bath bench', culture: 'ancient', tier: 'common', type: 'bench', setting: 'indoor',
  rooms: ['bath'], role: 'bench',
  anchor: 'floor', clearance: { front: 0.45 }, materials: ['stone', 'cloth'],
  w: 1.1, d: 0.42, h: 0.5, variants: 1,
  build: function (F) {
    const S = F.col('stonePale');
    /* the slab with rounded ends on two turned feet; a folded towel left at one end */
    F.box(0, 0.38, 0, 0.7, 0.07, 0.42, 0, S, 'stone');
    for (const s of [-1, 1]) F.cyl(s * 0.35, 0.38, 0, 0.2, 0.07, 0, S, 'stone');
    for (const s of [-1, 1]) F.lathe(s * 0.34, 0, 0, [[0.14, 0], [0.1, 0.08], [0.085, 0.3], [0.13, 0.38]], 0, F.shade(S, -0.06), 'stone', { nu: 16 });
    F.box(0.3, 0.45, 0.02, 0.3, 0.04, 0.26, 0.1, F.col('clothTowel'), 'cloth');
  }
});

/* the programme a bath room is furnished by (header), and its hand-off to a host that bundles the runtime */
(function () {
  const PROGRAM = {
    require: [{ need: 'bath or shower', types: ['vessel'], roles: ['bathtub', 'shower'], n: 1 },
      { need: 'toilet', types: ['vessel'], roles: ['toilet'], n: 1 },
      { need: 'basin', types: ['vessel'], roles: ['washbasin'], n: 1 }],
    optional: [{ types: ['rack'], max: 1 }, { types: ['art'], max: 1 }, { types: ['bench'], max: 1 }],
    extra: 1.5
  };
  const KEYS = ['ancients_bath_tub', 'ancients_bath_shower', 'ancients_bath_toilet', 'ancients_bath_basin', 'ancients_bath_mirror',
    'ancients_bath_towel_rail', 'ancients_bath_bench'];
  function install(IX) {
    if (!IX || !IX.PROGRAMS) return IX;
    if (!IX.PROGRAMS.bath) IX.PROGRAMS.bath = JSON.parse(JSON.stringify(PROGRAM));
    if (IX.KIND_WEIGHT && IX.KIND_WEIGHT.bath == null) IX.KIND_WEIGHT.bath = 0.5;
    return IX;
  }
  if (typeof KF_API !== 'undefined') KF_API.ancientBath = { keys: KEYS.slice(), PROGRAM: PROGRAM, install: install };
})();
