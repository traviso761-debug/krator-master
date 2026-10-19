// prefix: brt
/* ======================================================================
   The Beast Riders' tents (1): the band's DWELLINGS, poor to rich, its CHIEF, its COUNCIL and its SHRINE, on the tent
   kit (70-br-tent-kit.js). Catalog ASSETs, culture 'beast-rider', district 'camp'; furnished from the catalog's
   beast-rider and generic pieces (F.furn), as the kit's other buildings are.
     br_tent_dome_small    a small hide dome: a rider and a mate (poor)
     br_tent_dome_family   the family dome: a star cap, a banner on its mast (common)
     br_tent_dome_double   two domes joined by a vestibule: a household of two hearths (well-off)
     br_tent_chief         the chief's barrel pavilion: awnings, pennants, ladders; the skull throne inside (rich)
     br_tent_council       the band's council pavilion: a ring of seats round the speaker's hearth (civic)
     br_tent_shrine        the band's shrine: a small pavilion, skull poles at its door, the beast-spirit altar
   Each variant's box is declared (variantDims) and holds its guy ropes and stakes.
   ====================================================================== */

/* a catalog piece at radius r and angle a (absolute) about (cx, cz), turned to face that centre (wall pieces stand
   with their backs to the tent's wall) */
function brtIn(F, key, r, a, cx, cz, o, ly) {
  const p = brtAt(r, a, cx, cz);
  return F.furn(key, p[0], ly == null ? 0.04 : ly, p[1], brtFace(p[0], p[1], cx, cz), o);
}

ASSET({
  key: 'br_tent_dome_small', name: 'Hide dome, small', culture: 'beast-rider', family: 'housing',
  types: ['dwelling-single'], districts: ['camp'], wealth: [0, 0.4], tags: { style: 'hide-dome', role: 'dwelling' },
  w: 10, d: 9, h: 4.1, variants: 3, variantNames: ['plain, a claw on its flank', "a hunter's: a mast, a hide frame outside", 'old hides, a drying line'],
  variantDims: [{ w: 10, d: 9, h: 3.4 }, { w: 10, d: 9, h: 4.1 }, { w: 10, d: 9, h: 3.4 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = 2.1, F0 = BRT_FRONT;
    brtDome(F, B, { R: R, H: 2.85, gores: 9, courses: 3, door: { w: 0.95, h: 1.35 }, old: v === 2 ? 0.6 : 0.12,
      crown: { kind: 'ring', mast: v === 1 ? 0.5 : 0, finial: false }, guys: 6, floor: BRTN.straw,
      sigils: [{ a: 1.0, y: 1.45, s: 0.75, kind: v === 1 ? 'spiral' : 'claw' }] });
    brtIn(F, v === 2 ? 'generic_poor_straw_bed' : 'br_common_bed', 1.25, F0 + Math.PI, 0, 0, { v: 1 });
    F.furn('br_common_fire', 0.35, 0.04, 0.45, 0, {});
    F.furn('br_common_rug', -0.55, 0.04, 0.2, Math.PI / 2, { v: v % 2 });
    brtIn(F, 'br_common_chest', 1.5, F0 + Math.PI * 0.62, 0, 0, { v: 0 });
    brtIn(F, 'br_common_store', 1.55, F0 - Math.PI * 0.62, 0, 0, {});
    F.furn('br_common_stool', 0.9, 0.04, -0.2, -0.6, {});
    if (v === 1) { F.furn('br_h_hide_frame', 2.6, 0, 2.6, -0.7, {}); F.furn('br_common_rack', -1.35, 0.04, -0.75, brtFace(-1.35, -0.75), {}); }
    if (v === 2) F.furn('br_h_cloth_line', 0.3, 0, 3.35, 0, { v: 1 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_dome_family', name: 'Hide dome, family', culture: 'beast-rider', family: 'housing',
  types: ['dwelling-single'], districts: ['camp'], wealth: [0.25, 0.7], tags: { style: 'hide-dome', role: 'dwelling' },
  w: 14, d: 12.6, h: 6.4, variants: 3, variantNames: ['the star cap, a banner on the mast', 'the ring crown, a sign board', 'the spiral claw, an outdoor hearth'],
  variantDims: [{ w: 14, d: 11, h: 6.4 }, { w: 14, d: 11, h: 6.4 }, { w: 14, d: 12.6, h: 6.4 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = 3.2, F0 = BRT_FRONT;
    brtDome(F, B, { R: R, H: 4.1, gores: 11, courses: 4, door: { w: 1.15, h: 1.6 }, old: 0.18,
      crown: { kind: v === 1 ? 'ring' : 'star', mast: 1.35, sign: v === 1 ? 'board' : 'banner', mark: true, banner: v === 2 ? BRTN.green : BRTN.ochre },
      guys: 9, floor: BRTN.straw,
      sigils: [{ a: 0.95, y: 2.0, s: 1.0, kind: v === 2 ? 'spiral' : 'claw' }, { a: -2.2, y: 1.9, s: 0.9, kind: 'claw' }] });
    F.furn('br_common_fire', 0, 0.04, 0, 0, {});
    F.furn('br_court_carpet', 0, 0.04, -1.25, 0, { v: v % 2 });
    for (const a of [Math.PI * 0.78, Math.PI * 1.22]) brtIn(F, 'br_common_bed', 2.15, F0 + a, 0, 0, { v: 1 });
    brtIn(F, 'br_common_chest', 2.55, F0 + Math.PI * 0.42, 0, 0, { v: 1 });
    brtIn(F, 'br_common_wall_shelves', 2.85, F0 - Math.PI * 0.45, 0, 0, {});
    brtIn(F, 'br_common_store', 2.65, F0 - Math.PI * 0.62, 0, 0, {});
    F.furn('br_common_low_table', 1.2, 0.04, 0.35, 0.4, {});
    for (const p of [[1.9, 0.9], [0.55, 1.2], [1.9, -0.3]]) F.furn('br_common_stool', p[0], 0.04, p[1], brtFace(p[0], p[1], 1.2, 0.35), {});
    brtIn(F, 'br_common_loom', 2.75, F0 + Math.PI * 0.25, 0, 0, {});
    F.furn('br_h_hanging_gourds', -0.9, 4.1 - 0.5 - 1.22, -0.6, 0.4, { v: 0 });
    if (v === 2) { F.furn('br_h_fire_pit', 2.2, 0, 4.6, 0, { v: 0 }); F.furn('generic_poor_log_seat', 3.3, 0, 4.4, -1.2, {}); }
    else F.furn('br_h_water_butt', 3.6, 0, 2.1, -0.6, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_dome_double', name: 'Hide domes, a pair joined by a vestibule', culture: 'beast-rider', family: 'housing',
  types: ['dwelling-multi'], districts: ['camp'], wealth: [0.5, 0.9], tags: { style: 'hide-dome', role: 'dwelling' },
  w: 19, d: 12.4, h: 6.2, variants: 2, variantNames: ['the hall and the sleeping dome', 'a dyer\'s household: a loom and vats'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), ax = -3.6, bx = 3.4;
    brtDome(F, B, { cx: ax, cz: 0, R: 2.9, H: 3.9, front: 0, gores: 10, courses: 4, open: { w: 2.0, h: 1.95 }, old: 0.15,
      crown: { kind: 'star', mast: 1.25, sign: 'banner', banner: v ? BRTN.rust : BRTN.ochre }, guys: 8, floor: BRTN.straw,
      sigils: [{ a: Math.PI * 0.5 + 0.9, y: 1.9, s: 0.95, kind: 'spiral' }, { a: -Math.PI * 0.5 - 0.9, y: 1.9, s: 0.9, kind: 'claw' }] });
    brtDome(F, B, { cx: bx, cz: 0, R: 2.5, H: 3.4, front: Math.PI, gores: 9, courses: 3, open: { w: 1.9, h: 1.85 }, old: 0.25,
      crown: { kind: 'ring', mast: 0 }, guys: 7, floor: BRTN.straw, sigils: [{ a: -Math.PI * 0.5 - 0.7, y: 1.6, s: 0.85, kind: 'claw' }] });
    /* the vestibule: a hooped hide tunnel between them, its door on the front */
    brtVault(F, B, [-1.0, 0], [1.2, 0], 2.5, 2.25, 3, { door: { s0: 0.45, s1: 1.75, h: 1.75 } });
    F.cyl(0.1, 0, 0, 1.0, 0.04, 0, BRTN.straw, 'straw/cloth');
    /* the hall (west): the hearth, the great hide, low table and stools, chests and shelves round the wall */
    F.furn('br_common_fire', ax - 0.2, 0.04, 0, 0, {});
    F.furn('br_court_carpet', ax - 0.4, 0.04, 1.1, 0, { v: 0 });
    F.furn('br_common_low_table', ax - 0.5, 0.04, -1.05, 0, {});
    for (const p of [[-1.4, -0.4], [0.5, -1.1], [-1.5, -1.6]]) F.furn('br_common_stool', ax + p[0], 0.04, p[1], brtFace(p[0], p[1], -0.5, -1.05), {});
    brtIn(F, 'br_common_chest', 2.3, Math.PI * 0.62, ax, 0, { v: 1 });
    brtIn(F, 'br_common_wall_shelves', 2.5, Math.PI * 1.05, ax, 0, {});
    brtIn(F, v ? 'br_trade_vat' : 'br_common_store', 2.2, Math.PI * 1.38, ax, 0, {});
    brtIn(F, v ? 'br_common_loom' : 'br_common_rack', 2.5, Math.PI * 1.7, ax, 0, {});
    /* the sleeping dome (east): two beds, a chest, a hide screen */
    brtIn(F, 'br_common_bed', 1.45, Math.PI * 0.5, bx, 0, { v: 1 });
    brtIn(F, 'br_common_bed', 1.45, -Math.PI * 0.5, bx, 0, { v: 0 });
    brtIn(F, 'br_common_chest', 2.0, 0.05, bx, 0, { v: 0 });
    F.furn('br_common_rug', bx + 0.2, 0.04, 0, Math.PI / 2, { v: 1 });
    /* the vestibule: saddle and tack */
    F.furn('br_h_saddle_trestle', 0.15, 0.04, -0.55, 0, {});
    F.furn(v ? 'br_trade_vat' : 'br_h_water_butt', -1.9, 0, 3.0, 0.3, { v: 1 });
    B.flush();
  }
});

/* the chief's barrel pavilion: the band's richest tent; the throne at the back facing the door, the great hide before
   it, the iron fire-bowl, the chief's bed behind a carved screen, hangings on the panels, chests and cabinets */
ASSET({
  key: 'br_tent_chief', name: "Chief's barrel pavilion", culture: 'beast-rider', family: 'civic',
  types: ['civic', 'dwelling-single'], districts: ['camp'], wealth: [0.8, 1], tags: { style: 'barrel-pavilion', role: 'chief' },
  w: 18.4, d: 15.8, h: 9, variants: 2, variantNames: ['ochre and rust, four awnings', 'rust and cream, two awnings and the claw band'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    const T = brtBarrel(F, B, { n: 14, r1: 5.2, h1: 3.4, hs: 1.0, r2: 3.5, h2: 1.6, mast: 1.8,
      panels: v ? [BRTN.rust, BRTN.cream] : [BRTN.orange[0], BRTN.orange[1]], upper: v ? [BRTN.cream, BRTN.orange[1]] : [BRTN.orange[2], BRTN.orange[0]],
      band: v ? { base: BRTN.ochre, rim: BRTN.brown, motif: BRTN.cream, motif2: BRTN.red } : {},
      door: { w: 1.6, h: 2.0 }, awnings: v ? [{ a: 1.2, w: 2.8, d: 2.1 }, { a: -1.2, w: 2.8, d: 2.1 }] : [{ a: 1.05, w: 2.6, d: 2.0 }, { a: -1.05, w: 2.6, d: 2.0 }, { a: 2.3, w: 2.6, d: 2.0 }, { a: -2.3, w: 2.6, d: 2.0 }],
      ladders: [Math.PI * 0.72, -Math.PI * 0.82], floor: BRTN.hideOld[0] });
    const drum = brtDrumSurf(0, 0, T.r1 + 0.02);
    brtSigil(F, B, drum, BRT_FRONT + 0.62, 1.7, 1.3, 'claw', BRTN.sigil);
    brtSigil(F, B, drum, BRT_FRONT - 0.62, 1.7, 1.3, 'claw', BRTN.sigil);
    F.furn('br_court_throne', 0, 0.04, -3.9, 0, {});
    F.furn('br_court_carpet', 0, 0.04, -2.1, 0, { v: v });
    F.furn('br_court_fire', 0, 0.04, 1.9, 0, {});
    F.furn('br_court_screen', -2.4, 0.04, -2.2, 0.9, {});
    brtIn(F, 'br_court_bed', 3.55, Math.PI * 1.2, 0, 0, { v: v });
    brtIn(F, 'br_court_cabinet', 4.55, Math.PI * 0.95, 0, 0, {});
    brtIn(F, 'br_court_bookcase', 4.6, Math.PI * 1.85, 0, 0, {});
    for (const a of [Math.PI * 1.38, Math.PI * 1.62]) brtIn(F, 'br_court_tapestry', 4.85, a, 0, 0, { v: a > Math.PI * 1.5 ? 1 : 0 }, 0.5);
    F.furn('br_court_divan', 3.0, 0.04, 0.4, -Math.PI / 2, {});
    F.furn('br_court_low_table', 1.95, 0.04, 0.4, Math.PI / 2, {});
    brtIn(F, 'br_common_chest', 4.4, Math.PI * 0.2, 0, 0, { v: 1 });
    brtIn(F, 'br_court_saddle_stand', 4.0, Math.PI * 0.05, 0, 0, {});
    brtIn(F, 'br_court_statue', 4.55, Math.PI * 1.5 - 0.42, 0, 0, {});
    brtIn(F, 'br_court_statue', 4.55, Math.PI * 1.5 + 0.42, 0, 0, {});
    F.furn('br_court_hanging', 0, 6.0 - 1.2, -2.0, 0, {});
    F.furn('br_court_statue', -1.3, 0, 6.3, 0, {}); F.furn('br_court_statue', 1.3, 0, 6.3, 0, {});
    B.flush();
  }
});

/* the council pavilion: the band's elders and the Wing captains sit in a ring round the speaker's hearth; no centre
   pole (the hearth is there), the clerestory over it */
ASSET({
  key: 'br_tent_council', name: 'Council pavilion', culture: 'beast-rider', family: 'civic',
  types: ['civic'], districts: ['camp'], wealth: [0.5, 1], tags: { style: 'barrel-pavilion', role: 'council' },
  w: 22, d: 19.4, h: 9.4, variants: 2, variantNames: ['sixteen panels, two awnings', 'the claw band, banners at the door'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    const T = brtBarrel(F, B, { n: 16, r1: 6.8, h1: 3.6, hs: 1.1, r2: 4.4, h2: 1.8, mast: 1.6, centre: false,
      panels: v ? [BRTN.orange[1], BRTN.rust] : [BRTN.orange[0], BRTN.orange[2]], upper: [BRTN.orange[2], BRTN.orange[1]],
      band: v ? { base: BRTN.cream, rim: BRTN.brown, motif: BRTN.green, motif2: BRTN.red } : {},
      door: { w: 1.9, h: 2.1 }, awnings: [{ a: 1.35, w: 3.0, d: 2.2 }, { a: -1.35, w: 3.0, d: 2.2 }], ladders: [Math.PI * 0.85], floor: BRTN.hideOld[1] });
    F.furn('br_h_speakers_hearth', 0, 0.04, 0, 0, {});
    for (let k = 0; k < 10; k++) { const a = BRT_FRONT + Math.PI * 2 * (k + 0.5) / 10; if (Math.abs(Math.sin((a - BRT_FRONT) / 2)) < 0.2) continue; brtIn(F, 'br_h_council_seat', 3.9, a, 0, 0, { v: k % 2 }); }
    brtIn(F, 'br_h_council_seat', 3.9, BRT_FRONT + Math.PI, 0, 0, { v: 1 });
    for (const a of [Math.PI * 0.85, Math.PI * 1.15, Math.PI * 1.85, Math.PI * 0.15]) brtIn(F, 'br_court_banner', 6.45, BRT_FRONT + a, 0, 0, { v: 0 }, 0.6);
    brtIn(F, 'br_court_tapestry', 6.4, BRT_FRONT + Math.PI, 0, 0, { v: 2 }, 0.6);
    for (const a of [Math.PI * 0.62, Math.PI * 1.38]) brtIn(F, 'br_court_lamp', 5.2, BRT_FRONT + a, 0, 0, {});
    F.furn('br_court_hanging', 0, 6.5 - 1.2, 0, 0, {});
    if (v) for (const s of [-1, 1]) F.furn('br_h_banner_pole', s * 1.9, 0, 8.4, 0, { v: s > 0 ? 1 : 0 });
    else for (const s of [-1, 1]) F.furn('br_h_post_brazier', s * 1.8, 0, 7.9, 0, {});
    B.flush();
  }
});

/* the band's shrine: a small barrel pavilion; the beast-spirit altar at the back, offering bowls, a shrine drum; skull
   poles either side of the door; (v1) the Deep Root's: a shrine sapling before it, offering stones */
ASSET({
  key: 'br_tent_shrine', name: 'Band shrine', culture: 'beast-rider', family: 'religious',
  types: ['religious'], districts: ['camp'], wealth: [0, 1], tags: { style: 'barrel-pavilion', role: 'shrine' },
  w: 10.4, d: 11.8, h: 6.6, variants: 2, variantNames: ['the Winged Ones: skull poles at the door', 'the Deep Root: a sapling and offering stones'],
  variantDims: [{ w: 10.4, d: 11, h: 6.6 }, { w: 10.4, d: 11.8, h: 6.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    brtBarrel(F, B, { n: 8, r1: 2.4, h1: 2.6, hs: 0.7, r2: 1.6, h2: 1.0, mast: 1.0, centre: false,
      panels: v ? [BRTN.green, BRTN.cream] : [BRTN.cream, BRTN.ochre], upper: [BRTN.red, BRTN.cream],
      band: { base: BRTN.brown, rim: BRTN.red, motif: BRTN.cream, motif2: BRTN.ochre }, door: { w: 1.2, h: 1.5 }, pennantN: 8,
      floor: BRTN.hideOld[2] });
    F.furn('br_trade_altar', 0, 0.04, -1.25, 0, {});
    F.furn('br_h_offering_bowl', -0.45, 1.25 + 0.04, -1.25, 0, { v: 0 });
    F.furn('br_h_offering_bowl', 0.45, 1.25 + 0.04, -1.25, 0, { v: 1 });
    F.furn('br_h_shrine_drum', 1.25, 0.04, -0.3, -1.2, { v: v });
    F.furn('br_common_rug', 0, 0.04, 0.35, 0, { v: 0 });
    for (const s of [-1, 1]) F.furn('br_court_statue', s * 1.3, 0, 3.4, 0, {});
    if (v) { F.furn('br_h_shrine_sapling', 0, 0, 5.2, 0, { v: 1 }); for (const s of [-1, 1]) F.furn('br_h_offering_stone', s * 2.4, 0, 4.6, 0, {}); }
    else F.furn('br_h_post_brazier', 0, 0, 5.0, 0, {});
    B.flush();
  }
});
