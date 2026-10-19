// prefix: brt
/* ======================================================================
   The Beast Riders' tents (2): the band's TRADES, every trade the Scyvoi camp has (kits/scyvoi/src/48-tt-trade.js:
   the shaman, the smith, the hidemaker, the supply tent, the cartwright), as Beast Rider tents on the tent kit
   (70-br-tent-kit.js). The hide dome with its front cut away is the trader's and the healer's shop, the reference's
   two dome tents (a counter of planks inside, ledgers and a lamp; a potion seller's bottles); the smith works under a
   hide dome on an open lattice frame; the hidemaker under a ridge awning of hides; the tack-maker (the riders' cartwright:
   saddle trees, howdah frames, lance shafts) in a small barrel pavilion with an awning over a howdah on trestles.
   Each carries tags.job (the Scyvoi job it answers: verify.py checks every Scyvoi trade has one) and tags.role.
     br_tent_shaman      the shaman and healer (role shaman, job healing): (v1) a potion seller's
     br_tent_smithy      the smithy (job smithing): (v1) an armourer's
     br_tent_hidemaker   the hidemaker's awning (job tanning): (v1) closed at the back
     br_tent_trader      the trader's dome (job trading): ledgers and a lamp on a plank counter; (v1) the band's supply tent
     br_tent_tackmaker   the tack-maker's pavilion (job carpentry, role tack-maker): (v1) a harness-maker's
   ====================================================================== */

/* a counter of planks across a dome's cut-away front, a piece or two on it (surface pieces at the counter's top) */
function brtCounter(F, key, z, goods, v) {
  F.furn(key, 0, 0.04, z, 0, { v: (v == null ? 0 : v), setting: 'both' });
  const top = 0.04 + (FURN_BY_KEY[key] ? FURN_BY_KEY[key].h : 1.0);
  (goods || []).forEach(function (g, i) { F.furn(g[0], g[1], top, z + ((g[2] == null ? 0 : g[2])), (g[3] == null ? 0 : g[3]), { v: (g[4] == null ? 0 : g[4]), setting: 'both' }); });
}

ASSET({
  key: 'br_tent_shaman', name: "Shaman's and healer's dome", culture: 'beast-rider', family: 'religious',
  types: ['religious', 'shop'], districts: ['camp'], wealth: [0.3, 0.8], tags: { style: 'hide-dome', role: 'shaman', job: 'healing' },
  w: 12.6, d: 9.6, h: 6.4, variants: 2, variantNames: ['the healer: herbs, skulls, the still', "a potion seller's: coloured bottles, a sign board"],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = 3.0, F0 = BRT_FRONT;
    brtDome(F, B, { R: R, H: 4.0, gores: 10, courses: 4, open: { w: 3.1, h: 2.05 }, old: 0.2,
      crown: { kind: v ? 'ring' : 'star', mast: 1.3, sign: v ? 'board' : 'banner', mark: true, banner: BRT.ochre },
      guys: 8, floor: BRT.straw, sigils: [{ a: 1.1, y: 2.0, s: 1.1, kind: 'spiral' }, { a: -1.1, y: 2.0, s: 1.0, kind: 'claw' }] });
    brtCounter(F, 'br_common_counter', 1.45, v ? [['generic_spirits', -0.75, 0, 0, 1], ['generic_medicine', 0, 0, 0, 2], ['generic_spirits', 0.75, 0, 0.2, 2]]
      : [['generic_herb_bundles', -0.7, 0, 0, 0], ['generic_medicine', 0.1, 0, 0, 0], ['br_common_candle', 0.8, 0, 0]], v);
    brtIn(F, 'br_common_wall_shelves', 2.3, F0 + Math.PI * 0.82, 0, 0, {});
    brtIn(F, 'br_common_wall_shelves', 2.3, F0 + Math.PI * 1.18, 0, 0, {});
    brtIn(F, 'br_trade_still', 2.2, F0 + Math.PI * 1.5, 0, 0, {});
    brtIn(F, v ? 'br_trade_bin' : 'br_trade_altar', 2.35, F0 + Math.PI * 0.5, 0, 0, {});
    brtIn(F, 'br_common_art', 2.55, F0 + Math.PI, 0, 0, { v: v }, 1.75);
    F.furn('br_common_fire', 0.3, 0.04, -0.8, 0, {});
    F.furn('br_common_rug', -0.6, 0.04, -0.4, 0.3, { v: 1 });
    F.furn('br_h_hanging_gourds', 0.2, 4.0 - 0.45 - 1.22, -0.2, 0.6, { v: 1 });
    if (v) { for (let k = 0; k < 3; k++) F.furn('generic_bottle_crate', 2.0 + k * 0.1, k * 0.36, 2.7 - k * 0.05, 0.2 * k - 0.3, { v: k % 2 }); F.furn('generic_crate', -2.2, 0, 2.5, 0.4, { v: 1 }); F.furn('generic_crate', -2.3, 0.84, 2.45, 0.1, { v: 0 }); }
    else { F.furn('br_court_statue', 2.1, 0, 2.8, 0, {}); F.furn('br_h_offering_stone', -2.1, 0, 2.8, 0, {}); }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_smithy', name: 'Smithy (a hide dome on an open lattice)', culture: 'beast-rider', family: 'industrial',
  types: ['industry', 'shop'], districts: ['camp'], wealth: [0.3, 0.8], tags: { style: 'lattice-dome', job: 'smithing' },
  w: 8.4, d: 8.2, h: 7, variants: 2, variantNames: ['the smith: forge, anvil, quench trough', "an armourer's: hide-and-bone armour, lance rack"],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = 4.2, wallH = 1.75, open = 1.0, F0 = BRT_FRONT;
    /* the hides start over the lattice; the lattice walls the back and sides, the front open between two posts */
    brtDome(F, B, { R: R, H: 5.0, base: wallH, gores: 12, courses: 3, old: 0.35, skirt: false,
      crown: { kind: 'ring', mast: 1.0, sign: 'board', mark: true, bar: 1.1 }, sigils: [{ a: Math.PI, y: 3.0, s: 1.2, kind: 'claw' }] });
    const S = brtDomeSurf(0, 0, R, 5.0, 0.16 * R), rw = S.rAt(wallH) - 0.03;
    brtLattice(B, 0, 0, rw, wallH, F0 + open, F0 + Math.PI * 2 - open);
    for (let k = 0; k < 10; k++) { const a = F0 + open + (Math.PI * 2 - 2 * open) * k / 9, p = brtAt(rw + 0.04, a); B.stick(BRT.poleDark, BRT_LASH, [p[0], -0.1, p[1], p[0], wallH + 0.05, p[1], 0.07]); }
    for (const s of [-1, 1]) { const p = brtAt(rw + 0.04, F0 + s * open); B.stick(BRT.red, BRT_LASH, [p[0], -0.1, p[1], p[0], wallH + 0.25, p[1], 0.11, 0.1]); }
    /* a stone hearth wall behind the forge, an earth floor */
    for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { const x = -1.9 + i * 0.47 + (j % 2) * 0.2;
      F.ell(x, 0.24 + j * 0.4, -rw + 0.55, 0.26 + brtU(F, 71, i, j) * 0.08, 0.2 + brtU(F, 72, i, j) * 0.05, 0.24, (brtU(F, 73, i, j) - 0.5) * 0.4, BRM.rock, 'stone'); }
    F.cyl(0, 0, 0, rw - 0.05, 0.04, 0, BRT.earth, 'yard/stone');
    F.furn('br_trade_forge', 0, 0.04, -rw + 1.4, 0, {});
    F.furn('br_trade_anvil', 0.1, 0.04, -0.4, 0, {});
    F.furn('br_trade_trough', -1.4, 0.04, -0.9, Math.PI / 2, {});
    F.furn('br_trade_grindstone', 2.0, 0.04, 0.6, -Math.PI / 2, {});
    brtIn(F, v ? 'br_trade_armour_stand' : 'br_common_workbench', 3.25, F0 + Math.PI * 1.25, 0, 0, { v: 1 });
    brtIn(F, 'br_trade_weapon_rack', 3.4, F0 + Math.PI * 0.72, 0, 0, {});
    brtIn(F, v ? 'br_trade_armour_stand' : 'br_trade_bin', 3.3, F0 + Math.PI * 0.42, 0, 0, {});
    if (v) brtIn(F, 'br_h_shield_rack', 3.55, F0 + Math.PI * 1.62, 0, 0, { v: 1 });
    else brtIn(F, 'br_common_rack', 3.5, F0 + Math.PI * 1.62, 0, 0, {});
    F.furn('generic_fuel', 2.9, 0, 3.3, 0.3, { v: 1 }); F.furn('generic_fuel', 3.5, 0, 2.7, -0.4, { v: 2 });
    F.furn('br_trade_trough', -2.8, 0, 3.4, 0.4, {});
    B.flush();
  }
});

ASSET({
  key: 'br_tent_hidemaker', name: "Hidemaker's awning", culture: 'beast-rider', family: 'industrial',
  types: ['industry', 'shop'], districts: ['camp'], wealth: [0.2, 0.7], tags: { style: 'hide-awning', job: 'tanning' },
  w: 10.2, d: 10, h: 4.1, variants: 2, variantNames: ['open on all sides', 'hides walling the back, more frames'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), hw = 3.8, hd = 2.6, ridge = 3.4, eave = 1.95;
    /* a ridge awning of patched hides on forked posts: the ridge along x, the eaves on six posts each side */
    const nC = 5;
    for (let i = 0; i < nC; i++) for (const s of [-1, 1]) {
      const x0 = -hw - 0.3 + (2 * hw + 0.6) * i / nC, x1 = -hw - 0.3 + (2 * hw + 0.6) * (i + 1) / nC;
      const col = brtU(F, 81, i, s) < 0.3 ? brtPick(F, BRT.hideOld, 82, i, s) : brtPick(F, BRT.hide, 83, i, s);
      brtSurf(F, 3, 4, function (u, w) {
        const x = x0 + (x1 - x0) * u, z = s * (hd + 0.35) * w, sag = Math.sin(Math.PI * u) * 0.08;
        /* the eave's edge ragged: each column ends at its own reach */
        const k = Math.round(u * 3) + i * 3, rag = w > 0.99 ? (k % 2 ? 0.12 : 0) + brtU(F, 84, k, s) * 0.15 : 0;
        return [x, ridge + (eave - 0.1 - ridge) * w - sag * w - rag * 0.5, z - s * rag + ((i % 2) ? 0.012 : 0) * s];
      }, col, BRT_HIDE);
    }
    for (const x of [-hw, 0, hw]) { B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, 0, x, ridge + 0.05, 0, 0.09, 0.08]);
      B.stick(BRT.poleDark, BRT_LASH, [x, ridge - 0.05, 0, x - 0.2, ridge + 0.35, 0, 0.04]); B.stick(BRT.poleDark, BRT_LASH, [x, ridge - 0.05, 0, x + 0.2, ridge + 0.35, 0, 0.04]); }
    B.stick(BRT.pole, BRT_LASH, [-hw - 0.4, ridge + 0.08, 0, hw + 0.4, ridge + 0.08, 0, 0.07]);
    for (let i = 0; i <= 3; i++) for (const s of [-1, 1]) { const x = -hw + 2 * hw * i / 3;
      B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, s * hd, x, eave + 0.02, s * hd, 0.07, 0.06]);
      brtGuy(B, [x, eave, s * hd], x * 1.12, s * (hd + 2.2)); }
    for (const x of [-hw - 0.3, hw + 0.3]) for (const s of [-1, 1]) brtRope(B, [x, ridge, 0], [x * 1.15, 0.4, s * 0.9], 0.04, 0.014);
    if (v) {   /* hides hung to wall the back */
      for (let i = 0; i < 4; i++) { const x0 = -hw + 2 * hw * i / 4, x1 = -hw + 2 * hw * (i + 1) / 4;
        brtSurf(F, 2, 3, function (u, w) { return [x0 + (x1 - x0) * u, (eave - 0.05) * (1 - w) + (brtU(F, 85, i, Math.round(u * 2)) * 0.25) * w, -hd - 0.08 - (i % 2) * 0.014]; }, brtPick(F, BRT.hideOld, 86, i), BRT_HIDE); }
    }
    F.box(0, 0, 0, 2 * hw + 0.4, 0.03, 2 * hd + 0.4, 0, BRT.earth, 'yard/stone');
    F.furn('br_trade_vat', -2.2, 0.03, -1.2, 0, {}); F.furn('br_trade_vat', -0.7, 0.03, -1.35, 0.3, {});
    F.furn('br_h_hide_frame', 1.3, 0.03, -1.6, 0, {}); F.furn('br_h_hide_frame', 2.9, 0.03, -1.4, -0.2, {});
    F.furn('br_common_workbench', 1.9, 0.03, 1.2, Math.PI, {});
    F.furn('br_common_store', -2.6, 0.03, 1.4, Math.PI, {});
    F.furn('br_h_hung_hide', 0, ridge - 3.08 - 0.15, 0.1, 0, { v: v });
    F.furn('br_h_hide_frame', -1.6, 0, 4.4, 0.15, {}); F.furn('br_h_hide_frame', 0.6, 0, 4.6, -0.1, {});
    F.furn('br_trade_vat', 3.4, 0, 4.2, 0.4, {});
    if (v) { F.furn('br_h_hide_frame', -4.9, 0, 2.6, Math.PI / 2, {}); F.furn('br_h_hide_frame', -4.9, 0, 0.3, Math.PI / 2, {}); }
    else F.furn('br_h_hide_frame', 5.1, 0, -0.9, -Math.PI / 2, {});
    B.flush();
  }
});

ASSET({
  key: 'br_tent_trader', name: "Trader's dome (cut-away front)", culture: 'beast-rider', family: 'trade',
  types: ['market', 'shop'], districts: ['camp'], wealth: [0.3, 0.8], tags: { style: 'hide-dome', job: 'trading' },
  w: 14.4, d: 11.2, h: 6.8, variants: 2, variantNames: ['the trader: ledgers and a lamp on the plank counter, crates beside', "the band's supply tent: bolts, rope, sacks"],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = 3.3, F0 = BRT_FRONT;
    brtDome(F, B, { R: R, H: 4.3, gores: 11, courses: 4, open: { w: 3.5, h: 2.15 }, old: 0.25,
      crown: { kind: v ? 'star' : 'ring', mast: 1.4, sign: v ? 'banner' : 'board', mark: true, banner: BRT.ochre },
      guys: 9, floor: BRT.straw, sigils: [{ a: -1.05, y: 2.1, s: 1.15, kind: 'spiral' }] });
    brtCounter(F, 'br_h_work_counter', 1.55, v ? [['generic_rations', -1.0, 0, 0], ['generic_sewing', 0.2, 0, 0], ['generic_lamp_oil', 1.0, 0, 0]]
      : [['br_common_books', -1.0, 0, 0, 0.2], ['generic_writing_supplies', -0.2, 0, 0], ['br_common_candle', 0.65, 0, -0.1], ['generic_cured_meat', 1.15, 0, 0.1]], v);
    brtIn(F, 'br_h_workshop_shelves', 2.55, F0 + Math.PI * 0.82, 0, 0, {});
    brtIn(F, 'br_h_workshop_shelves', 2.55, F0 + Math.PI * 1.18, 0, 0, {});
    brtIn(F, 'br_common_chest', 2.6, F0 + Math.PI * 0.55, 0, 0, { v: 1 });
    brtIn(F, v ? 'br_h_cloth_bolts' : 'br_h_barrel_cluster', 2.0, F0 + Math.PI * 1.45, 0, 0, { v: 0 });
    F.furn('br_common_lamp', 1.5, 0.04, 0.7, 0, {});
    F.furn('br_common_stool', -0.2, 0.04, 0.6, Math.PI, {});
    F.furn('br_h_sack_pile', -1.5, 0.04, -0.6, 0.5, { v: v });
    if (v) { F.furn('br_h_rope_coils', 3.6, 0, 2.6, 0.3, { v: 1 }); F.furn('br_h_sack_pile', -3.4, 0, 2.8, 0, { v: 0 }); F.furn('generic_sack', -2.6, 0, 3.4, 0.5, { v: 1 }); }
    else { F.furn('br_h_crate_stack', 3.9, 0, 2.2, -0.5, { v: 1 }); F.furn('generic_crate', -2.9, 0, 3.0, 0.2, { v: 2 }); F.furn('generic_crate', -2.9, 0.84, 3.0, -0.1, { v: 0 }); F.furn('generic_barrel', -3.7, 0, 2.3, 0, { v: 1 }); }
    B.flush();
  }
});

/* a howdah frame on two trestles: the tack-maker's work in hand (lashed poles; local x along the frame) */
function brtHowdah(F, B, x, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry), P = function (lx, y, lz) { return [x + lx * c + lz * s, y, z - lx * s + lz * c]; };
  const L = function (a, b, r, col) { B.stick(col == null ? BRT.pole : col, BRT_LASH, [a[0], a[1], a[2], b[0], b[1], b[2], (r == null ? 0.035 : r)]); };
  for (const lx of [-1.0, 1.0]) { L(P(lx - 0.3, 0, -0.5), P(lx, 0.85, 0), 0.04, BRT.poleDark); L(P(lx + 0.3, 0, -0.5), P(lx, 0.85, 0), 0.04, BRT.poleDark);
    L(P(lx - 0.3, 0, 0.5), P(lx, 0.85, 0), 0.04, BRT.poleDark); L(P(lx + 0.3, 0, 0.5), P(lx, 0.85, 0), 0.04, BRT.poleDark); L(P(lx, 0.85, -0.6), P(lx, 0.85, 0.6), 0.05, BRT.poleDark); }
  const y0 = 0.9, w = 0.75, l = 1.15, ht = 0.75;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L(P(sx * l, y0, sz * w), P(sx * l * 0.95, y0 + ht, sz * w * 0.95), 0.04);
  for (const y of [y0, y0 + ht * 0.5, y0 + ht]) { const k = y === y0 ? 1 : 0.97;
    L(P(-l * k, y, -w * k), P(l * k, y, -w * k)); L(P(-l * k, y, w * k), P(l * k, y, w * k)); L(P(-l * k, y, -w * k), P(-l * k, y, w * k)); L(P(l * k, y, -w * k), P(l * k, y, w * k)); }
  for (let i = -3; i <= 3; i++) L(P(i * 0.3, y0 + 0.02, -w), P(i * 0.3, y0 + 0.02, w), 0.025, BRT.plank);
  for (const sx of [-1, 1]) { const p = P(sx * l * 0.95, y0 + ht, 0); L([p[0], p[1], p[2]], [p[0], p[1] + 0.6, p[2]], 0.035); }
  L(P(-l * 0.95, y0 + ht + 0.6, 0), P(l * 0.95, y0 + ht + 0.6, 0), 0.04, BRT.poleDark);
}

ASSET({
  key: 'br_tent_tackmaker', name: "Tack-maker's pavilion (saddle trees, howdahs, lances)", culture: 'beast-rider', family: 'industrial',
  types: ['industry', 'shop'], districts: ['camp'], wealth: [0.3, 0.8], tags: { style: 'barrel-pavilion', job: 'carpentry', role: 'tack-maker' },
  w: 15, d: 11.4, h: 7, variants: 2, variantNames: ['the saddle and howdah wright', "a harness-maker's: tack racks, hides, rope"],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), cx = -1.6;
    brtBarrel(F, B, { cx: cx, cz: -0.6, n: 10, r1: 3.3, h1: 2.7, hs: 0.8, r2: 2.2, h2: 1.1, mast: 1.1,
      panels: v ? [BRT.cream, BRT.ochre] : [BRT.orange[1], BRT.cream], upper: [BRT.orange[0], BRT.rust], door: { w: 1.5, h: 1.75 },
      awnings: [{ a: 1.0, w: 2.4, d: 1.8 }], ladders: [-Math.PI * 0.8], floor: BRT.hideOld[0] });
    /* the work yard on the east side under a lean-to of hides: a howdah frame on its trestles */
    brtLeanTo(F, B, 2.2, 6.4, 2.4, -2.6, 2.5, 2.1);
    F.box(4.3, 0, -0.1, 4.6, 0.03, 5.6, 0, BRT.earth, 'yard/stone');
    if (v) { F.furn('br_h_tack_rack', 4.3, 0.03, -2.0, 0, { v: 1 }); F.furn('br_h_hide_frame', 5.6, 0.03, 0.4, -Math.PI / 2, {}); F.furn('br_h_rope_coils', 3.4, 0.03, 0.8, 0.3, { v: 0 }); }
    else { brtHowdah(F, B, 4.3, -0.2, Math.PI / 2); F.furn('br_h_plank_stack', 5.7, 0.03, 1.4, Math.PI / 2, { v: 1 }); }
    /* inside: saddles, the bow lathe for lance shafts, the lance rack, the bench */
    const IN = function (key, r, a, o) { return brtIn(F, key, r, BRT_FRONT + a, cx, -0.6, o); };
    IN('br_trade_lathe', 2.65, Math.PI, {});
    IN('br_trade_weapon_rack', 2.75, Math.PI * 1.32, {});
    IN(v ? 'br_h_tack_rack' : 'br_common_workbench', v ? 1.75 : 2.6, Math.PI * 0.68, { v: 0 });
    IN('br_court_saddle_stand', 1.9, Math.PI * 1.65, {});
    F.furn('br_h_saddle_trestle', cx + 0.2, 0.04, -0.4, 0.4, {});
    F.furn('br_common_stool', cx - 0.9, 0.04, 0.3, 1.0, {});
    F.furn('br_h_saddle_trestle', cx - 2.8, 0, 3.6, 0.5, { setting: 'outdoor' });
    B.flush();
  }
});
