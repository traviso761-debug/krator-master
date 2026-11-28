/* ======================================================================
   Shumari furniture: the high dry plateau kingdom of Shumar (kits/shumari/PLAN.md section 5;
   settlements/shumar/BUILD-OUT.md wave 0.3; LORE.md 6.23, 10-11).
   Kars / Ani highland dressed dark basalt and pale travertine ablaq masonry fused with Mamluk
   Cairo pointed spiral-fluted and star-carved stone domes, shurafat blade-merlons, pierced brass
   and bronze lamps and kursi stands, deep crimson lacquer, watered-steel notched service blades,
   Armenian-highland crimson and indigo geometric wool kilims, and incised Sumaru-kattu muster
   slips. Built across the mandatory castes:
     - Poor (-ko Ordeal-cadets, probationers and upland herders): flued basalt suffa sleeping
       bench, wooden practice-blade rack, dustmillet pithos, dung-fuel basket, iron-bound cadet
       chest, forged iron oil lamp, splayed felt-topped stool.
     - Middle (-ra Hearth-Commons artisans and orchardmen): crimson-lacquered low table, copper
       samovar brazier, wool kilim, carved apricot-and-cedar chest, ablaq masonry mass stove,
       baker's dough trough, upright kilim loom, cushioned divan.
     - Rich / Sword and Regimental Cult (-su human captains and 1.55x Gedu-su Free Giants):
       household ancestor blade-niche, regimental notched-blade and breath-thorn standard rack,
       Mamluk hexagonal pierced brass kursi, hanging pierced-bronze qubba lamp, Sword canopy bed,
       star-inlaid khizana cabinet, Giant-scale ablaq divan and feasting board, regimental ash
       cenotaph, Sumaru-kattu chancery lectern.
     - Plateau Trades: Mamluk-domed copper alembic still and stoneware Sunu-sikaru flask larder.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('shumari', { name: 'Shumari', pack: null,
  influences: 'Mamluk Cairo stone domes and brasswork; Kars and Ani Armenian-highland basalt ablaq; Japanese buke-yashiki crimson lacquer; 1.55x Free Giant Sword-brother scale',
  materials: 'dressed dark basalt, highland travertine, crimson lacquer, cast bronze, Mamluk brass, watered steel, apricot and cedar wood, crimson and indigo wool kilim, dark felt, stoneware',
  palette: {
    basalt: 0x36383e, basaltDark: 0x24262b, basaltLight: 0x4c4f57,
    travertine: 0xd8cdb8, travertinePale: 0xe6decb, travertineWarm: 0xc4b69c,
    ironstone: 0x7e2c28,
    lacquer: 0x9e2a2b, lacquerDeep: 0x6e1b1c, lacquerBright: 0xb83536,
    bronze: 0xb8861b, bronzeDark: 0x805c12, brass: 0xcfa032, gold: 0xdcb43c,
    copper: 0xb86236, copperDark: 0x844222,
    steel: 0x7c858e, steelBright: 0x9aa4ae, iron: 0x3b3e42,
    apricot: 0x6e4429, cedar: 0x56331d, poplar: 0x966b46,
    kilimCrimson: 0x8f2426, kilimIndigo: 0x283852, kilimOchre: 0xc6923a, woolCream: 0xe2d8c4,
    felt: 0x4a4642, feltBlack: 0x2e2c2a, leatherCrimson: 0x7a2224, hide: 0x8c6849,
    clay: 0xa66a46, stoneware: 0x6e7872, wicker: 0x9c8256,
    grain: 0xd4b66a, dough: 0xe4d6b5, dung: 0x5c4c38, ash: 0x8a8882,
    flame: 0xffa844, ember: 0xd96e28, glassAmber: 0xf2b857
  } });
if (typeof PAL === 'object' && PAL) PAL.shumari = FPAL.shumari;
/* END PALETTE */

const SMF_FX = {
  /* horizontal ablaq masonry courses alternating dark basalt and pale highland travertine */
  ablaq: function (F, x, y, z, w, h, d, n) {
    const cnt = n == null ? 4 : n, ch = h / cnt;
    for (let i = 0; i < cnt; i++) {
      const k = i % 2 === 0 ? 'basalt' : (i === cnt - 1 && cnt > 3 ? 'ironstone' : 'travertine');
      const inset = i % 2 === 0 ? 0 : 0.006;
      F.box(x, y + i * ch, z, w - inset, ch, d - inset, 0, F.col(k), 'stone');
    }
  },
  /* stepped Mamluk blade-shurafat merlon row along x */
  shurafat: function (F, x0, x1, y, z, h, d, n, col, fam) {
    const cnt = Math.max(2, n == null ? 5 : n), step = (x1 - x0) / cnt, mw = step * 0.68;
    for (let i = 0; i < cnt; i++) {
      const cx = x0 + (i + 0.5) * step;
      F.box(cx, y, z, mw, h * 0.48, d, 0, col, fam);
      F.box(cx, y + h * 0.48, z, mw * 0.62, h * 0.30, d * 0.9, 0, col, fam);
      F.box(cx, y + h * 0.78, z, mw * 0.28, h * 0.22, d * 0.8, 0, col, fam);
    }
  },
  /* burnished bronze Mamluk jamur finial: mast and three graduated spheres topping at y + h */
  jamur: function (F, x, y, z, h, col, fam) {
    F.rod(x, y, z, x, y + h * 0.94, z, Math.max(0.008, h * 0.04), col, fam);
    F.ball(x, y + h * 0.26, z, Math.max(0.02, h * 0.14), col, fam);
    F.ball(x, y + h * 0.56, z, Math.max(0.02, h * 0.10), col, fam);
    F.ball(x, y + h * 0.82, z, Math.max(0.02, h * 0.07), col, fam);
  },
  /* notched watered-steel blade (bare upright or in crimson shagreen scabbard) */
  swordUpright: function (F, x, y0, z, len, scabbard) {
    const hiltH = len * 0.20, bladeH = len - hiltH;
    F.cyl(x, y0, z, 0.024, 0.03, 0, F.col('bronze'), 'bronze');
    F.cyl(x, y0 + 0.03, z, 0.015, hiltH - 0.05, 0, F.col('leatherCrimson'), 'hide');
    F.box(x, y0 + hiltH - 0.02, z, 0.16, 0.024, 0.032, 0, F.col('bronze'), 'bronze');
    if (scabbard) {
      F.box(x, y0 + hiltH, z, 0.052, bladeH * 0.92, 0.026, 0, F.col('leatherCrimson'), 'hide');
      F.box(x, y0 + hiltH + bladeH * 0.84, z, 0.054, bladeH * 0.16, 0.028, 0, F.col('bronze'), 'bronze');
      F.box(x, y0 + hiltH + bladeH * 0.42, z, 0.056, 0.035, 0.03, 0, F.col('bronze'), 'bronze');
    } else {
      F.box(x, y0 + hiltH, z, 0.044, bladeH * 0.86, 0.018, 0, F.col('steel'), 'metal');
      F.cone(x, y0 + hiltH + bladeH * 0.86, z, 0.024, bladeH * 0.14, 0, F.col('steelBright'), 'metal');
      /* the Shumari caste notch near the fort of the blade */
      F.box(x + 0.018, y0 + hiltH + bladeH * 0.24, z, 0.02, 0.028, 0.022, 0, F.col('bronze'), 'bronze');
    }
  }
};

/* ================================================================
   POOR (-ko Ordeal-Cadets, Probationers & Upland Herders)
   ================================================================ */

FURN({
  key: 'shumari_suffa_bed', name: 'Flued basalt suffa sleeping bench', culture: 'shumari', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'dormitory', 'living', 'cottage', 'cell'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['stone', 'cloth', 'hide', 'metal'], w: 1.05, d: 2.0, h: 0.58, variants: 1,
  build: function (F) {
    const bas = F.col('basalt'), felt = F.col('felt');
    /* wall curb flush to z = -1.0 */
    F.box(0, 0, -0.96, 1.05, 0.58, 0.08, 0, F.shade(bas, -0.1), 'stone');
    /* flued basalt bench mass */
    F.box(0, 0, 0.02, 1.02, 0.34, 1.92, 0, bas, 'stone');
    F.box(0, 0.30, 0.03, 1.04, 0.05, 1.94, 0, F.col('travertineWarm'), 'stone');
    /* iron soot cleanout door on front face */
    F.box(-0.28, 0.06, 0.98, 0.22, 0.16, 0.02, 0, F.col('iron'), 'metal');
    F.box(0.28, 0.06, 0.98, 0.22, 0.16, 0.02, 0, F.col('iron'), 'metal');
    /* thick grey wool-felt pad and crimson-striped probationer blanket */
    F.box(0, 0.35, 0.04, 0.96, 0.08, 1.84, 0, felt, 'hide');
    F.box(0, 0.43, 0.26, 0.94, 0.04, 1.32, 0, F.col('feltBlack'), 'cloth');
    F.box(0, 0.47, -0.22, 0.94, 0.02, 0.10, 0, F.col('kilimCrimson'), 'cloth');
    F.bolster(0, 0.50, -0.74, 0.80, 0.08, 0, F.col('woolCream'), 'cloth');
  }
});

FURN({
  key: 'shumari_cadet_rack', name: 'Cadet wooden practice-blade rack', culture: 'shumari', tier: 'poor', type: 'rack', role: 'rack', setting: 'indoor',
  rooms: ['barracks', 'dormitory', 'hall', 'armoury', 'guard', 'cell', 'cottage'], anchor: 'wall', clearance: { front: 0.55 },
  materials: ['timber', 'metal', 'stone', 'hide'], w: 1.3, d: 0.36, h: 1.65, variants: 1,
  build: function (F) {
    const wd = F.col('apricot'), pop = F.col('poplar'), ir = F.col('iron');
    /* wall backplate rails flush on z = -0.18 */
    for (const sx of [-0.56, 0.56]) F.box(sx, 0, -0.155, 0.10, 1.62, 0.05, 0, wd, 'wood');
    F.box(0, 1.42, -0.15, 1.28, 0.10, 0.06, 0, wd, 'wood');
    F.box(0, 0.78, -0.15, 1.28, 0.08, 0.06, 0, wd, 'wood');
    /* basalt butt-shoe trough spanning full depth */
    F.box(0, 0, 0, 1.28, 0.10, 0.34, 0, F.col('basalt'), 'stone');
    F.box(0, 0.98, 0.02, 1.24, 0.05, 0.24, 0, F.shade(wd, -0.1), 'wood');
    /* five notched wooden Ordeal practice blades */
    for (let i = 0; i < 5; i++) {
      const x = -0.44 + i * 0.22;
      F.rod(x, 0.08, 0.02, x, 1.63, -0.04, 0.022, F.shade(pop, (i % 2) * -0.08), 'wood');
      F.box(x, 0.38, 0.01, 0.12, 0.024, 0.036, 0, ir, 'metal');
    }
    /* two leather-and-iron practice bucklers hung flat on front pegs */
    for (const sx of [-0.34, 0.34]) {
      F.box(sx, 0.44, 0.13, 0.24, 0.16, 0.024, 0, F.col('hide'), 'hide');
      F.box(sx, 0.40, 0.13, 0.16, 0.24, 0.024, 0, F.col('hide'), 'hide');
      F.ball(sx, 0.52, 0.145, 0.028, ir, 'metal');
    }
  }
});

FURN({
  key: 'shumari_millet_jar', name: 'Highland dustmillet storage pithos', culture: 'shumari', tier: 'poor', type: 'storage', role: 'store',
  surface: false, setting: 'both', rooms: ['kitchen', 'living', 'cottage', 'store', 'barracks', 'yard'],
  anchor: 'floor', clearance: { front: 0.45 }, materials: ['stone', 'terracotta', 'timber', 'rope', 'metal'],
  w: 0.68, d: 0.68, h: 0.88, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.25, 0.07, 0, F.col('basalt'), 'stone');
    F.lathe(0, 0.06, 0, [[0.20, 0], [0.31, 0.22], [0.33, 0.44], [0.24, 0.64], [0.18, 0.72], [0.21, 0.76]], 0, F.col('clay'), 'terracotta', { nu: 16 });
    F.cyl(0, 0.56, 0, 0.29, 0.03, 0, F.col('wicker'), 'rope');
    /* wooden stopper lid and iron ration tally ring */
    F.cyl(0, 0.81, 0, 0.20, 0.04, 0, F.col('apricot'), 'wood');
    F.box(0, 0.85, 0, 0.12, 0.03, 0.04, 0, F.col('iron'), 'metal');
  }
});

FURN({
  key: 'shumari_fuel_basket', name: 'Wicker dung-cake and kindling basket', culture: 'shumari', tier: 'poor', type: 'storage', role: 'basket',
  surface: false, setting: 'both', rooms: ['kitchen', 'living', 'cottage', 'store', 'yard', 'barracks'],
  anchor: 'floor', clearance: { front: 0.4 }, materials: ['wicker', 'rope', 'timber', 'stone'],
  w: 0.64, d: 0.64, h: 0.58, variants: 1,
  build: function (F) {
    const wk = F.col('wicker');
    F.lathe(0, 0, 0, [[0.21, 0], [0.26, 0.18], [0.30, 0.42], [0.31, 0.45]], 0, wk, 'wicker', { nu: 14 });
    F.cyl(0, 0.42, 0, 0.31, 0.035, 0, F.shade(wk, -0.16), 'rope');
    for (const sx of [-1, 1]) F.box(sx * 0.30, 0.42, 0, 0.04, 0.07, 0.12, 0, F.shade(wk, -0.2), 'rope');
    /* stacked dry dung fuel discs and split canyon-poplar sticks */
    for (let i = 0; i < 4; i++) {
      const a = i * 1.5 + 0.2;
      F.cyl(Math.cos(a) * 0.08, 0.38 + i * 0.035, Math.sin(a) * 0.08, 0.14, 0.04, 0, F.col('dung'), 'stone');
    }
    for (let i = 0; i < 3; i++) {
      const x = -0.09 + i * 0.09;
      F.rod(x, 0.36, -0.06, x + 0.03, 0.57, 0.05, 0.022, F.col('poplar'), 'wood');
    }
  }
});

FURN({
  key: 'shumari_cadet_chest', name: 'Iron-bound cadet footlocker', culture: 'shumari', tier: 'poor', type: 'storage', role: 'chest', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'dormitory', 'cottage', 'living', 'cell', 'store'], anchor: 'wall', clearance: { front: 0.55 },
  materials: ['timber', 'metal', 'stone'], w: 0.92, d: 0.48, h: 0.52, variants: 1,
  build: function (F) {
    const wd = F.col('apricot'), ir = F.col('iron');
    for (const sx of [-0.36, 0.36]) F.box(sx, 0, -0.005, 0.10, 0.06, 0.47, 0, F.col('basalt'), 'stone');
    /* chest box with rear flush at z = -0.24 */
    F.box(0, 0.06, -0.01, 0.90, 0.38, 0.46, 0, wd, 'wood');
    F.box(0, 0.44, -0.005, 0.92, 0.08, 0.47, 0, F.shade(wd, -0.08), 'wood');
    /* forged iron straps and front hasp */
    for (const sx of [-0.32, 0.32]) F.box(sx, 0.06, -0.005, 0.04, 0.465, 0.475, 0, ir, 'metal');
    F.box(0, 0.34, 0.23, 0.10, 0.13, 0.02, 0, ir, 'metal');
  }
});

FURN({
  key: 'shumari_iron_lamp', name: 'Forged iron kernel-oil cresset lamp', culture: 'shumari', tier: 'poor', wealth: [0, 0.45], type: 'lamp', setting: 'indoor',
  rooms: ['living', 'bedroom', 'barracks', 'dormitory', 'cottage', 'kitchen', 'cell', 'shrine'], anchor: 'surface', clearance: {},
  materials: ['metal', 'food', 'emissive'], w: 0.28, d: 0.28, h: 0.34, variants: 1,
  build: function (F) {
    const ir = F.col('iron');
    /* three flat forged feet standing right on y = 0 */
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.box(Math.sin(a) * 0.07, 0, Math.cos(a) * 0.07, 0.04, 0.022, 0.13, a, ir, 'metal');
    }
    F.cyl(0, 0, 0, 0.05, 0.03, 0, ir, 'metal');
    F.rod(0, 0.02, 0, 0, 0.16, 0, 0.014, ir, 'metal');
    /* pinched oil pan and spout */
    F.frustum(0, 0.15, 0, 0.07, 0.11, 0.05, 0, ir, 'metal', 8);
    F.box(0, 0.17, 0.09, 0.04, 0.03, 0.08, 0, ir, 'metal');
    F.cyl(0, 0.19, 0, 0.09, 0.012, 0, F.col('grain'), 'food');
    F.cone(0, 0.20, 0.10, 0.022, 0.07, 0, F.col('flame'), 'glow');
    /* arched iron carrying bail reaching h */
    F.rod(0, 0.17, -0.10, 0, 0.32, -0.06, 0.01, ir, 'metal');
    F.box(0, 0.315, -0.01, 0.024, 0.022, 0.12, 0, ir, 'metal');
    F.lamp(0, 0.24, 0.08, 0.65, 5.5);
  }
});

FURN({
  key: 'shumari_cadet_stool', name: 'Splayed apricot-wood and felt stool', culture: 'shumari', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'kitchen', 'cottage', 'barracks', 'dormitory', 'workshop', 'study', 'yard'], anchor: 'floor', clearance: { front: 0.45 },
  materials: ['timber', 'metal', 'hide'], w: 0.46, d: 0.46, h: 0.46, variants: 1,
  build: function (F) {
    const wd = F.col('apricot');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.beam(sx * 0.20, 0, sz * 0.20, sx * 0.15, 0.39, sz * 0.15, 0.045, 0.045, wd, 'wood');
    }
    F.rod(-0.18, 0.16, 0, 0.18, 0.16, 0, 0.014, F.col('iron'), 'metal');
    F.rod(0, 0.16, -0.18, 0, 0.16, 0.18, 0.014, F.col('iron'), 'metal');
    F.box(0, 0.38, 0, 0.42, 0.04, 0.42, 0, wd, 'wood');
    F.box(0, 0.42, 0, 0.39, 0.04, 0.39, 0, F.col('felt'), 'hide');
  }
});

/* ================================================================
   MIDDLE (-ra Hearth-Commons Artisans, Orchardmen & Merchants)
   ================================================================ */

FURN({
  key: 'shumari_hearth_bed', name: 'Crimson-lacquer and apricot bedstead', culture: 'shumari', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'cottage', 'dormitory'], anchor: 'wall', clearance: { front: 0.75, left: 0.4 },
  materials: ['timber', 'lacquer', 'stone', 'cloth', 'bronze'], w: 1.55, d: 2.1, h: 1.02, variants: 1,
  build: function (F) {
    const wd = F.col('apricot'), lac = F.col('lacquer'), brz = F.col('bronze');
    /* carved headboard flush on z = -1.05 */
    F.box(0, 0, -1.01, 1.53, 0.88, 0.08, 0, wd, 'wood');
    F.box(0, 0.56, -0.96, 1.32, 0.22, 0.03, 0, lac, 'lacquer');
    F.box(0, 0.62, -0.94, 0.90, 0.10, 0.02, 0, F.col('travertine'), 'stone');
    SMF_FX.shurafat(F, -0.68, 0.68, 0.88, -1.01, 0.12, 0.07, 5, lac, 'lacquer');
    for (const sx of [-0.73, 0.73]) {
      F.box(sx, 0, -1.00, 0.09, 0.95, 0.09, 0, lac, 'lacquer');
      F.ball(sx, 0.98, -1.00, 0.04, brz, 'bronze');
      F.box(sx, 0, 0.99, 0.09, 0.56, 0.09, 0, lac, 'lacquer');
      F.ball(sx, 0.59, 0.99, 0.035, brz, 'bronze');
    }
    /* side rails, mattress, geometric kilim coverlet and bolsters */
    F.box(0, 0.14, 0.01, 1.50, 0.22, 2.02, 0, wd, 'wood');
    F.box(0, 0.36, 0.02, 1.42, 0.16, 1.94, 0, F.col('woolCream'), 'cloth');
    F.box(0, 0.52, 0.26, 1.44, 0.04, 1.42, 0, F.col('kilimCrimson'), 'cloth');
    F.box(0, 0.56, 0.26, 0.92, 0.02, 0.86, 0, F.col('kilimIndigo'), 'cloth');
    for (const sx of [-0.35, 0.35]) F.bolster(sx, 0.60, -0.74, 0.60, 0.09, 0, F.col('kilimOchre'), 'cloth');
  }
});

FURN({
  key: 'shumari_lacquer_table', name: 'Crimson-lacquered Mamluk dining table', culture: 'shumari', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'hall', 'kitchen', 'tavern', 'cottage', 'shop'], anchor: 'floor', clearance: { front: 0.65, back: 0.65 },
  materials: ['lacquer', 'timber', 'bronze'], w: 1.45, d: 0.85, h: 0.72, variants: 1,
  build: function (F) {
    const lac = F.col('lacquer'), ced = F.col('cedar'), brz = F.col('bronze');
    F.box(0, 0.66, 0, 1.44, 0.06, 0.84, 0, lac, 'lacquer');
    F.box(0, 0.68, 0, 1.24, 0.042, 0.64, 0, F.col('lacquerDeep'), 'lacquer');
    /* cusped apron rails and bronze corner bosses */
    F.box(0, 0.56, 0, 1.34, 0.10, 0.74, 0, F.shade(lac, -0.14), 'lacquer');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.box(sx * 0.65, 0, sz * 0.35, 0.08, 0.66, 0.08, 0, ced, 'wood');
      F.box(sx * 0.65, 0, sz * 0.35, 0.10, 0.06, 0.10, 0, brz, 'bronze');
      F.ball(sx * 0.68, 0.69, sz * 0.38, 0.022, brz, 'bronze');
    }
    for (const sx of [-0.65, 0.65]) F.box(sx, 0.16, 0, 0.06, 0.05, 0.66, 0, ced, 'wood');
    F.box(0, 0.16, 0, 1.26, 0.05, 0.06, 0, ced, 'wood');
  }
});

FURN({
  key: 'shumari_samovar_brazier', name: 'Copper samovar and bronze charcoal brazier', culture: 'shumari', tier: 'common', wealth: [0.25, 1.0],
  type: 'brazier', role: 'hearth', surface: false, setting: 'both',
  rooms: ['living', 'hall', 'tavern', 'antechamber', 'cottage', 'court', 'yard'], anchor: 'floor',
  clearance: { front: 0.55, back: 0.55, left: 0.45, right: 0.45 }, materials: ['stone', 'bronze', 'metal', 'emissive'],
  w: 0.68, d: 0.68, h: 0.86, variants: 1,
  build: function (F) {
    const brz = F.col('bronze'), cop = F.col('copper');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + F.TAU / 8;
      F.box(Math.sin(a) * 0.24, 0, Math.cos(a) * 0.24, 0.08, 0.12, 0.08, a, F.col('basalt'), 'stone');
    }
    /* octagonal hammered bronze tray and fire bowl */
    F.frustum(0, 0.12, 0, 0.31, 0.33, 0.04, 0, brz, 'bronze', 8);
    F.frustum(0, 0.16, 0, 0.22, 0.27, 0.12, 0, F.col('bronzeDark'), 'bronze', 8);
    F.cyl(0, 0.26, 0, 0.23, 0.03, 0, F.col('ember'), 'glow');
    /* bulbous Mamluk copper samovar urn with spigot and crown teapot */
    F.lathe(0, 0.28, 0, [[0.09, 0], [0.07, 0.06], [0.16, 0.18], [0.17, 0.30], [0.10, 0.40], [0.12, 0.44]], 0, cop, 'metal', { nu: 16 });
    for (const sx of [-1, 1]) F.box(sx * 0.19, 0.48, 0, 0.04, 0.12, 0.03, 0, brz, 'bronze');
    F.rod(0, 0.38, 0.15, 0, 0.36, 0.23, 0.015, brz, 'bronze');
    /* little teapot perched on the samovar chimney */
    F.lathe(0, 0.72, 0, [[0.05, 0], [0.085, 0.05], [0.05, 0.10], [0.02, 0.13]], 0, F.col('brass'), 'bronze', { nu: 12 });
  }
});

FURN({
  key: 'shumari_kilim_rug', name: 'Highland geometric wool kilim', culture: 'shumari', tier: 'common', type: 'rug', surface: false, setting: 'indoor',
  rooms: ['living', 'hall', 'bedroom', 'antechamber', 'study', 'shrine', 'cottage'], anchor: 'floor', clearance: {},
  materials: ['cloth'], w: 2.4, d: 1.6, h: 0.03, variants: 2, variantNames: ['crimson medallion', 'indigo stepped'],
  build: function (F) {
    const v = F.variant | 0;
    const field = F.col(v === 0 ? 'kilimCrimson' : 'kilimIndigo');
    const med = F.col(v === 0 ? 'kilimIndigo' : 'kilimCrimson');
    const och = F.col('kilimOchre'), crm = F.col('woolCream');
    /* end fringes spanning full 2.4 m width */
    F.box(0, 0, 0, 2.38, 0.02, 1.52, 0, crm, 'cloth');
    F.box(0, 0.002, 0, 2.24, 0.022, 1.56, 0, och, 'cloth');
    F.box(0, 0.004, 0, 2.08, 0.022, 1.40, 0, field, 'cloth');
    for (const mx of [-0.62, 0, 0.62]) {
      F.box(mx, 0.006, 0, 0.44, 0.022, 0.64, F.TAU / 8, med, 'cloth');
      F.box(mx, 0.008, 0, 0.22, 0.022, 0.32, F.TAU / 8, crm, 'cloth');
      F.box(mx, 0.009, 0, 0.09, 0.021, 0.12, 0, och, 'cloth');
    }
  }
});

FURN({
  key: 'shumari_apricot_chest', name: 'Carved apricot-and-cedar star chest', culture: 'shumari', tier: 'common', type: 'storage', role: 'chest', setting: 'indoor',
  rooms: ['bedroom', 'living', 'cottage', 'store', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'lacquer', 'bronze'], w: 1.15, d: 0.56, h: 0.68, variants: 1,
  build: function (F) {
    const ap = F.col('apricot'), ced = F.col('cedar'), lac = F.col('lacquer'), brz = F.col('bronze');
    for (const sx of [-0.48, 0.48]) F.box(sx, 0, -0.01, 0.12, 0.08, 0.54, 0, ced, 'wood');
    /* carcase with rear face on z = -0.28 */
    F.box(0, 0.08, -0.01, 1.12, 0.48, 0.54, 0, ap, 'wood');
    F.box(0, 0.56, -0.005, 1.14, 0.08, 0.55, 0, lac, 'lacquer');
    F.box(0, 0.64, -0.005, 1.06, 0.04, 0.48, 0, ced, 'wood');
    /* front Mamluk star panels and bronze lock-plate */
    for (const sx of [-0.32, 0.32]) {
      F.box(sx, 0.18, 0.26, 0.30, 0.28, 0.02, 0, lac, 'lacquer');
      F.box(sx, 0.24, 0.27, 0.14, 0.14, 0.02, F.TAU / 8, brz, 'bronze');
    }
    for (const sx of [-0.54, 0.54]) F.box(sx, 0.08, -0.005, 0.05, 0.48, 0.55, 0, brz, 'bronze');
    F.box(0, 0.44, 0.27, 0.14, 0.14, 0.02, 0, brz, 'bronze');
  }
});

FURN({
  key: 'shumari_masonry_stove', name: 'Ablaq basalt-and-travertine mass stove', culture: 'shumari', tier: 'common', wealth: [0.15, 0.95],
  type: 'stove', role: 'hearth', surface: false, setting: 'indoor',
  rooms: ['kitchen', 'living', 'cottage', 'tavern'], anchor: 'wall', clearance: { front: 0.85 },
  materials: ['stone', 'metal', 'bronze', 'emissive'], w: 1.1, d: 0.78, h: 1.85, variants: 1,
  build: function (F) {
    /* hearth plinth and ablaq mass flush against z = -0.39 */
    F.box(0, 0, -0.01, 1.08, 0.12, 0.76, 0, F.col('basaltDark'), 'stone');
    SMF_FX.ablaq(F, 0, 0.12, -0.03, 1.04, 1.04, 0.72, 6);
    F.box(0, 1.16, -0.03, 1.08, 0.08, 0.74, 0, F.col('basalt'), 'stone');
    SMF_FX.shurafat(F, -0.52, 0.52, 1.24, -0.03, 0.10, 0.70, 5, F.col('travertine'), 'stone');
    /* firebox iron door, glowing pine-charcoal bed, and copper kettle shelf */
    F.box(-0.22, 0.20, 0.33, 0.38, 0.36, 0.04, 0, F.col('iron'), 'metal');
    F.box(-0.22, 0.25, 0.345, 0.26, 0.16, 0.02, 0, F.col('ember'), 'glow');
    F.box(0.28, 0.56, 0.26, 0.30, 0.36, 0.18, 0, F.col('basaltDark'), 'stone');
    F.lathe(0.28, 0.58, 0.26, [[0.06, 0], [0.10, 0.08], [0.07, 0.16], [0.03, 0.20]], 0, F.col('copper'), 'bronze', { nu: 12 });
    /* octagonal basalt flue chimney rising flush near rear wall */
    F.box(0, 1.24, -0.21, 0.48, 0.54, 0.34, 0, F.col('basalt'), 'stone');
    F.box(0, 1.78, -0.18, 0.54, 0.07, 0.40, 0, F.col('travertine'), 'stone');
  }
});

FURN({
  key: 'shumari_dough_trough', name: 'Apricot-wood baker dough trough and flour bin', culture: 'shumari', tier: 'common',
  type: 'storage', role: 'larder', surface: false, setting: 'indoor',
  rooms: ['kitchen', 'living', 'cottage', 'store'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['timber', 'bronze', 'food'], w: 1.2, d: 0.58, h: 0.86, variants: 1,
  build: function (F) {
    const ap = F.col('apricot'), pop = F.col('poplar');
    /* splashback board on z = -0.29 and twin lower flour-bin doors */
    F.box(0, 0, -0.265, 1.18, 0.86, 0.05, 0, F.shade(ap, -0.1), 'wood');
    F.box(0, 0.06, -0.01, 1.14, 0.44, 0.52, 0, ap, 'wood');
    for (const sx of [-0.52, 0.52]) F.box(sx, 0, -0.01, 0.08, 0.50, 0.54, 0, F.col('cedar'), 'wood');
    for (const sx of [-0.27, 0.27]) {
      F.box(sx, 0.12, 0.255, 0.44, 0.32, 0.02, 0, pop, 'wood');
      F.ball(sx * 0.35, 0.28, 0.27, 0.02, F.col('bronze'), 'bronze');
    }
    /* flared kneading trough walls and risen flatbread dough */
    F.box(0, 0.50, 0.0, 1.18, 0.06, 0.56, 0, ap, 'wood');
    for (const sx of [-0.56, 0.56]) F.box(sx, 0.56, 0.0, 0.06, 0.22, 0.56, 0, pop, 'wood');
    F.box(0, 0.56, 0.25, 1.18, 0.22, 0.06, 0, pop, 'wood');
    F.blob(-0.18, 0.62, 0.0, 0.24, 0.14, 0, F.col('dough'), 'food');
    F.blob(0.22, 0.60, 0.02, 0.18, 0.11, 0.3, F.col('dough'), 'food');
  }
});

FURN({
  key: 'shumari_kilim_loom', name: 'Upright highland wool kilim loom', culture: 'shumari', tier: 'common', type: 'loom',
  surface: false, setting: 'indoor', rooms: ['workshop', 'living', 'cottage'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'cloth', 'rope', 'stone'], w: 1.45, d: 0.65, h: 1.95, variants: 1,
  build: function (F) {
    const ap = F.col('apricot'), ced = F.col('cedar');
    /* rear wall posts and crossbeams flush to z = -0.325 */
    for (const sx of [-0.66, 0.66]) {
      F.box(sx, 0, -0.285, 0.09, 1.95, 0.08, 0, ced, 'wood');
      F.box(sx, 0, 0.0, 0.09, 0.08, 0.63, 0, ced, 'wood');
      F.beam(sx, 0.08, 0.27, sx, 1.82, -0.24, 0.07, 0.07, ap, 'wood');
    }
    F.box(0, 1.84, -0.26, 1.42, 0.09, 0.10, 0, ap, 'wood');
    F.box(0, 0.34, -0.10, 1.42, 0.08, 0.10, 0, ap, 'wood');
    /* vertical warp threads and half-woven crimson/indigo kilim */
    for (let i = 0; i < 11; i++) {
      const x = -0.50 + i * 0.10;
      F.rod(x, 0.38, -0.09, x, 1.84, -0.24, 0.006, F.col('woolCream'), 'rope');
    }
    F.box(0, 0.38, -0.13, 1.06, 0.68, 0.03, 0, F.col('kilimCrimson'), 'cloth');
    F.box(0, 0.56, -0.12, 0.68, 0.32, 0.035, 0, F.col('kilimIndigo'), 'cloth');
    F.box(0, 0.66, -0.115, 0.32, 0.14, 0.04, 0, F.col('kilimOchre'), 'cloth');
    /* heddle bar and hanging basalt warp weights */
    F.rod(-0.68, 1.24, -0.04, 0.68, 1.24, -0.04, 0.02, ced, 'wood');
    for (let i = 0; i < 5; i++) F.cyl(-0.44 + i * 0.22, 0.12, -0.08, 0.035, 0.09, 0, F.col('basalt'), 'stone');
  }
});

FURN({
  key: 'shumari_cushion_divan', name: 'Crimson-lacquer and kilim cushion divan', culture: 'shumari', tier: 'common', wealth: [0.3, 1.0],
  type: 'bench', setting: 'indoor', rooms: ['living', 'hall', 'tavern', 'antechamber', 'study', 'cottage'],
  anchor: 'wall', clearance: { front: 0.65 }, materials: ['timber', 'lacquer', 'cloth', 'bronze'],
  w: 1.75, d: 0.72, h: 0.82, variants: 2, variantNames: ['indigo hearth cushions', 'crimson sword cushions'],
  build: function (F) {
    const v = F.variant | 0;
    const ced = F.col('cedar'), lac = F.col('lacquer');
    const cMain = F.col(v === 0 ? 'kilimIndigo' : 'kilimCrimson');
    const cAlt = F.col(v === 0 ? 'kilimCrimson' : 'kilimOchre');
    /* carved back rail flush at z = -0.36 */
    F.box(0, 0, -0.325, 1.73, 0.82, 0.07, 0, ced, 'wood');
    F.box(0, 0.68, -0.285, 1.66, 0.10, 0.03, 0, lac, 'lacquer');
    /* seat deck and side arms */
    F.box(0, 0.10, 0.01, 1.71, 0.22, 0.68, 0, ced, 'wood');
    for (const sx of [-0.82, 0.82]) {
      F.box(sx, 0, 0.0, 0.09, 0.56, 0.70, 0, lac, 'lacquer');
      F.ball(sx, 0.59, 0.31, 0.03, F.col('bronze'), 'bronze');
    }
    /* mattress, three upright back cushions, and cylindrical arm bolsters turned along z */
    F.box(0, 0.32, 0.03, 1.54, 0.12, 0.62, 0, cMain, 'cloth');
    for (const cx of [-0.50, 0, 0.50]) {
      F.box(cx, 0.44, -0.20, 0.48, 0.30, 0.14, 0, cx === 0 ? cAlt : F.col('woolCream'), 'cloth');
      F.box(cx, 0.54, -0.125, 0.18, 0.10, 0.02, 0, cMain, 'cloth');
    }
    for (const sx of [-0.67, 0.67]) F.bolster(sx, 0.51, 0.05, 0.54, 0.08, F.TAU / 4, cAlt, 'cloth');
  }
});

/* ================================================================
   RICH / SWORD & REGIMENTAL CULT (-su Human & 1.55x Gedu-su Giant)
   ================================================================ */

FURN({
  key: 'shumari_ancestor_niche', name: 'Household ancestor blade-niche and kattu slips', culture: 'shumari', tier: 'court', wealth: [0.35, 1.0],
  type: 'shrine', surface: false, setting: 'indoor', rooms: ['shrine', 'hall', 'living', 'antechamber', 'audience', 'study'],
  anchor: 'wall', clearance: { front: 0.8 }, materials: ['stone', 'lacquer', 'bronze', 'gold', 'metal', 'hide', 'emissive'],
  w: 1.35, d: 0.52, h: 2.15, variants: 1,
  build: function (F) {
    const lac = F.col('lacquer'), brz = F.col('bronze'), gld = F.col('gold');
    /* stepped ablaq base and rear niche backplate flush on z = -0.26 */
    SMF_FX.ablaq(F, 0, 0, 0.0, 1.33, 0.72, 0.50, 4);
    F.box(0, 0.72, -0.22, 1.28, 1.16, 0.08, 0, F.col('basaltDark'), 'stone');
    /* flanking crimson-lacquer pilasters and pointed mihrab-butsudan hood */
    for (const sx of [-0.56, 0.56]) {
      F.box(sx, 0.72, -0.04, 0.14, 1.12, 0.36, 0, lac, 'lacquer');
      F.box(sx, 1.20, 0.145, 0.08, 0.36, 0.02, 0, brz, 'bronze');
    }
    F.box(0, 1.84, -0.03, 1.32, 0.12, 0.42, 0, lac, 'lacquer');
    SMF_FX.shurafat(F, -0.62, 0.62, 1.96, -0.03, 0.14, 0.36, 6, F.col('travertine'), 'stone');
    SMF_FX.jamur(F, 0, 1.96, 0.02, 0.19, brz, 'bronze');
    /* three vertical basalt Sumaru-kattu ancestor name-slips inlaid with gold and crimson caste-bars */
    for (const sx of [-0.26, 0, 0.26]) {
      F.box(sx, 1.26, -0.16, 0.14, 0.46, 0.03, 0, F.col('basalt'), 'stone');
      F.box(sx, 1.64, -0.14, 0.12, 0.03, 0.02, 0, lac, 'lacquer');
      F.box(sx, 1.34, -0.14, 0.04, 0.26, 0.02, 0, gld, 'gold');
    }
    /* two horizontally racked ancestral swords in crimson shagreen scabbards */
    for (let k = 0; k < 2; k++) {
      const y = 0.90 + k * 0.20;
      for (const sx of [-0.30, 0.30]) F.box(sx, y - 0.03, -0.06, 0.03, 0.06, 0.12, 0, brz, 'bronze');
      F.box(-0.04, y, -0.02, 0.74, 0.042, 0.03, 0, F.col('leatherCrimson'), 'hide');
      F.box(0.36, y, -0.02, 0.14, 0.034, 0.032, 0, brz, 'bronze');
      F.box(0.30, y, -0.02, 0.024, 0.14, 0.036, 0, brz, 'bronze');
      F.box(-0.38, y, -0.02, 0.10, 0.046, 0.032, 0, brz, 'bronze');
    }
    /* bronze votive oil lamp on the ablaq sill */
    F.cyl(0, 0.72, 0.14, 0.08, 0.04, 0, brz, 'bronze');
    F.cone(0, 0.76, 0.14, 0.024, 0.07, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.84, 0.16, 0.6, 5.0);
  }
});

FURN({
  key: 'shumari_standard_rack', name: 'Regimental notched-blade and breath-thorn standard rack', culture: 'shumari', tier: 'court',
  type: 'shrine', surface: false, setting: 'both',
  rooms: ['hall', 'shrine', 'barracks', 'armoury', 'audience', 'war_room', 'antechamber', 'court'], anchor: 'wall',
  clearance: { front: 0.65 }, materials: ['stone', 'lacquer', 'bronze', 'gold', 'metal', 'hide', 'cloth'],
  w: 1.5, d: 0.45, h: 2.35, variants: 1,
  build: function (F) {
    const lac = F.col('lacquer'), brz = F.col('bronze'), gld = F.col('gold');
    /* battered basalt plinth and crimson-lacquer wall frame flush on z = -0.225 */
    F.box(0, 0, -0.01, 1.46, 0.22, 0.43, 0, F.col('basalt'), 'stone');
    F.box(0, 0.22, -0.01, 1.40, 0.06, 0.39, 0, F.col('travertine'), 'stone');
    F.box(0, 0.28, -0.19, 1.38, 1.48, 0.07, 0, lac, 'lacquer');
    F.box(0, 1.12, -0.04, 1.32, 0.07, 0.28, 0, F.col('lacquerDeep'), 'lacquer');
    /* three point-up notched watered-steel regimental service blades in the centre */
    for (const sx of [-0.24, 0, 0.24]) SMF_FX.swordUpright(F, sx, 0.28, 0.02, 1.36, false);
    /* twin flanking bronze regimental standards with crimson cloth banners and golden breath-thorn finials */
    for (const sx of [-0.56, 0.56]) {
      F.rod(sx, 0.28, 0.04, sx, 2.26, 0.04, 0.022, brz, 'bronze');
      F.rod(sx - 0.18, 1.92, 0.05, sx + 0.18, 1.92, 0.05, 0.014, brz, 'bronze');
      F.box(sx, 1.24, 0.06, 0.32, 0.68, 0.02, 0, F.col('kilimCrimson'), 'cloth');
      F.box(sx, 1.52, 0.075, 0.26, 0.06, 0.02, 0, gld, 'gold');
      /* notched-blade and golden breath-thorn (ha-tonu) finial reaching h = 2.35 */
      F.cone(sx, 2.20, 0.04, 0.032, 0.15, 0, gld, 'gold');
      F.beam(sx, 2.18, 0.04, sx + (sx < 0 ? 0.09 : -0.09), 2.28, 0.04, 0.024, 0.02, gld, 'gold');
    }
  }
});

FURN({
  key: 'shumari_brass_kursi', name: 'Mamluk hexagonal pierced-brass kursi stand', culture: 'shumari', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'living', 'shrine', 'antechamber', 'study', 'audience', 'bedroom'], anchor: 'floor',
  clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 }, materials: ['bronze', 'gold', 'metal'],
  w: 0.76, d: 0.76, h: 0.78, variants: 1,
  build: function (F) {
    const brs = F.col('brass'), brz = F.col('bronzeDark'), gld = F.col('gold');
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6;
      F.box(Math.cos(a) * 0.31, 0, Math.sin(a) * 0.31, 0.07, 0.12, 0.07, -a, brz, 'bronze');
    }
    F.frustum(0, 0.10, 0, 0.33, 0.30, 0.10, 0, brs, 'bronze', 6);
    /* recessed dark pierced jali core framed by hexagonal brass corner posts */
    F.frustum(0, 0.20, 0, 0.27, 0.27, 0.44, 0, F.col('iron'), 'metal', 6);
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6;
      F.rod(Math.cos(a) * 0.30, 0.18, Math.sin(a) * 0.30, Math.cos(a) * 0.30, 0.66, Math.sin(a) * 0.30, 0.022, brs, 'bronze');
    }
    F.frustum(0, 0.40, 0, 0.305, 0.305, 0.04, 0, gld, 'gold', 6);
    /* overhanging hexagonal damascene tray top at h = 0.78 */
    F.frustum(0, 0.64, 0, 0.30, 0.36, 0.08, 0, brz, 'bronze', 6);
    F.frustum(0, 0.72, 0, 0.37, 0.37, 0.06, 0, brs, 'bronze', 6);
  }
});

FURN({
  key: 'shumari_qubba_lamp', name: 'Hanging pierced-bronze qubba mausoleum lamp', culture: 'shumari', tier: 'court', wealth: [0.35, 1.0],
  type: 'lamp', surface: false, setting: 'indoor',
  rooms: ['hall', 'shrine', 'living', 'antechamber', 'audience', 'study', 'library', 'tavern'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'glass', 'emissive'], w: 0.66, d: 0.66, h: 1.15, variants: 1,
  build: function (F) {
    const brz = F.col('bronze'), dk = F.col('bronzeDark');
    /* ceiling canopy rose reaching y = 1.15 exact */
    F.cyl(0, 1.11, 0, 0.11, 0.04, 0, brz, 'bronze');
    F.ball(0, 1.07, 0, 0.04, dk, 'bronze');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.rod(Math.cos(a) * 0.05, 1.07, Math.sin(a) * 0.05, Math.cos(a) * 0.19, 0.56, Math.sin(a) * 0.19, 0.008, dk, 'bronze');
    }
    /* Mamluk mosque-lamp flared neck and pierced bronze belly around glowing amber glass */
    F.lathe(0, 0.24, 0, [[0.06, 0], [0.20, 0.14], [0.21, 0.26], [0.12, 0.34], [0.17, 0.48]], 0, brz, 'bronze', { nu: 16 });
    F.cyl(0, 0.34, 0, 0.15, 0.22, 0, F.col('glassAmber'), 'glass');
    F.ball(0, 0.44, 0, 0.09, F.col('flame'), 'glow');
    /* six projecting bronze oil-wick cups spanning 0.64 m across */
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6;
      const rx = Math.cos(a), rz = Math.sin(a);
      F.rod(rx * 0.19, 0.44, rz * 0.19, rx * 0.29, 0.48, rz * 0.29, 0.01, dk, 'bronze');
      F.cyl(rx * 0.29, 0.48, rz * 0.29, 0.028, 0.03, 0, brz, 'bronze');
      F.cone(rx * 0.29, 0.51, rz * 0.29, 0.018, 0.05, 0, F.col('flame'), 'glow');
    }
    /* suspended bronze jamur sphere and finial reaching y = 0.01 */
    F.rod(0, 0.06, 0, 0, 0.24, 0, 0.008, dk, 'bronze');
    F.ball(0, 0.14, 0, 0.045, brz, 'bronze');
    F.cone(0, 0.01, 0, 0.025, 0.06, F.TAU / 2, brz, 'bronze');
    F.lamp(0, 0.44, 0, 1.0, 9.0);
  }
});

FURN({
  key: 'shumari_sword_bed', name: 'Sword-caste crimson-lacquer half-tester bed', culture: 'shumari', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.85, left: 0.5, right: 0.5 },
  materials: ['stone', 'lacquer', 'timber', 'bronze', 'gold', 'cloth'], w: 1.85, d: 2.25, h: 1.85, variants: 1,
  build: function (F) {
    const lac = F.col('lacquer'), ced = F.col('cedar'), brz = F.col('bronze');
    /* ablaq plinth step and tall carved headboard flush on z = -1.125 */
    SMF_FX.ablaq(F, 0, 0, 0.0, 1.83, 0.18, 2.23, 2);
    F.box(0, 0.18, -1.08, 1.78, 1.24, 0.09, 0, lac, 'lacquer');
    F.box(0, 0.78, -1.03, 1.36, 0.46, 0.03, 0, ced, 'wood');
    F.box(0, 0.94, -1.01, 0.34, 0.22, 0.02, F.TAU / 8, F.col('gold'), 'gold');
    /* four octagonal canopy posts and half-tester cornice at head */
    for (const sx of [-0.85, 0.85]) {
      F.box(sx, 0.18, -1.06, 0.10, 1.50, 0.10, 0, lac, 'lacquer');
      SMF_FX.jamur(F, sx, 1.68, -1.06, 0.17, brz, 'bronze');
      F.box(sx, 0.18, 1.05, 0.10, 0.88, 0.10, 0, lac, 'lacquer');
      SMF_FX.jamur(F, sx, 1.06, 1.05, 0.15, brz, 'bronze');
    }
    F.box(0, 1.60, -0.70, 1.82, 0.10, 0.84, 0, lac, 'lacquer');
    SMF_FX.shurafat(F, -0.84, 0.84, 1.70, -0.30, 0.12, 0.06, 7, brz, 'bronze');
    /* head drapes, bedframe, plush mattress and embroidered bolsters */
    for (const sx of [-0.76, 0.76]) F.box(sx, 0.56, -0.72, 0.10, 1.04, 0.68, 0, F.col('kilimCrimson'), 'cloth');
    F.box(0, 0.18, 0.0, 1.72, 0.24, 2.12, 0, ced, 'wood');
    F.box(0, 0.42, 0.02, 1.62, 0.18, 2.02, 0, F.col('woolCream'), 'cloth');
    F.box(0, 0.60, 0.28, 1.64, 0.05, 1.48, 0, F.col('kilimCrimson'), 'cloth');
    F.box(0, 0.65, 0.28, 1.12, 0.02, 0.96, 0, F.col('kilimIndigo'), 'cloth');
    for (const sx of [-0.40, 0.40]) F.bolster(sx, 0.69, -0.80, 0.68, 0.10, 0, F.col('kilimOchre'), 'cloth');
  }
});

FURN({
  key: 'shumari_sword_cabinet', name: 'Star-inlaid Mamluk khizana armour and robe cabinet', culture: 'shumari', tier: 'court',
  type: 'storage', role: 'cabinet', surface: false, setting: 'indoor',
  rooms: ['bedroom', 'hall', 'living', 'study', 'library', 'armoury', 'antechamber'], anchor: 'wall', clearance: { front: 0.75 },
  materials: ['stone', 'timber', 'lacquer', 'bronze'], w: 1.35, d: 0.58, h: 1.95, variants: 1,
  build: function (F) {
    const ced = F.col('cedar'), lac = F.col('lacquer'), brz = F.col('bronze'), trv = F.col('travertine');
    /* battered basalt plinth and cedar carcase flush on z = -0.29 */
    F.box(0, 0, -0.01, 1.33, 0.16, 0.56, 0, F.col('basalt'), 'stone');
    F.box(0, 0.16, -0.02, 1.29, 1.56, 0.54, 0, ced, 'wood');
    for (const sx of [-0.62, 0.62]) F.box(sx, 0.16, -0.01, 0.08, 1.60, 0.56, 0, lac, 'lacquer');
    /* twin doors inlaid with eight-pointed travertine and bronze Mamluk stars */
    for (const sx of [-0.30, 0.30]) {
      F.box(sx, 0.22, 0.255, 0.54, 1.18, 0.03, 0, lac, 'lacquer');
      for (const sy of [0.50, 1.00]) {
        F.box(sx, sy, 0.27, 0.20, 0.20, 0.014, 0, trv, 'stone');
        F.box(sx, sy + 0.04, 0.273, 0.26, 0.12, 0.014, 0, brz, 'bronze');
        F.box(sx, sy - 0.03, 0.273, 0.12, 0.26, 0.014, 0, brz, 'bronze');
        F.box(sx, sy + 0.06, 0.276, 0.08, 0.08, 0.014, 0, lac, 'lacquer');
      }
      F.box(sx * 0.24, 0.80, 0.276, 0.04, 0.14, 0.02, 0, brz, 'bronze');
    }
    /* upper pierced brass mashrabiya transom and shurafat crown reaching h = 1.95 */
    F.box(0, 1.46, 0.26, 1.12, 0.20, 0.03, 0, F.col('brass'), 'bronze');
    F.box(0, 1.72, -0.01, 1.34, 0.10, 0.56, 0, lac, 'lacquer');
    SMF_FX.shurafat(F, -0.62, 0.62, 1.82, -0.01, 0.13, 0.50, 6, trv, 'stone');
  }
});

FURN({
  key: 'shumari_giant_divan', name: 'Free Giant (Gedu-su) ablaq and kilim sleeping divan', culture: 'shumari', tier: 'court',
  type: 'bed', setting: 'indoor', rooms: ['bedroom', 'hall', 'living', 'barracks', 'dormitory', 'audience'],
  anchor: 'wall', clearance: { front: 1.0 }, materials: ['stone', 'lacquer', 'cloth', 'bronze'],
  w: 3.2, d: 1.5, h: 1.15, variants: 1,
  build: function (F) {
    const lac = F.col('lacquer'), brz = F.col('bronze');
    /* 1.55x Giant-scale ablaq stone dais and wall backplate flush on z = -0.75 */
    F.box(0, 0, -0.69, 3.18, 1.04, 0.12, 0, F.col('basalt'), 'stone');
    F.box(0, 0.72, -0.62, 3.08, 0.30, 0.04, 0, lac, 'lacquer');
    SMF_FX.shurafat(F, -1.52, 1.52, 1.04, -0.69, 0.11, 0.10, 9, F.col('travertine'), 'stone');
    SMF_FX.ablaq(F, 0, 0, 0.02, 3.16, 0.44, 1.46, 3);
    /* heavy stepped basalt and crimson-lacquer end arms */
    for (const sx of [-1.49, 1.49]) {
      F.box(sx, 0.44, 0.02, 0.18, 0.36, 1.42, 0, F.col('basaltDark'), 'stone');
      F.box(sx, 0.80, 0.02, 0.20, 0.07, 1.44, 0, lac, 'lacquer');
      F.ball(sx, 0.91, 0.66, 0.045, brz, 'bronze');
    }
    /* oversized Giant wool mattress, kilim spread, four back cushions and Giant bolsters */
    F.box(0, 0.44, 0.04, 2.78, 0.20, 1.36, 0, F.col('kilimCrimson'), 'cloth');
    F.box(0, 0.64, 0.12, 2.66, 0.04, 1.12, 0, F.col('kilimIndigo'), 'cloth');
    for (const cx of [-1.02, -0.34, 0.34, 1.02]) {
      F.box(cx, 0.64, -0.46, 0.62, 0.38, 0.20, 0, F.col('woolCream'), 'cloth');
      F.box(cx, 0.76, -0.35, 0.28, 0.14, 0.03, 0, F.col('kilimOchre'), 'cloth');
    }
    for (const sx of [-1.22, 1.22]) F.bolster(sx, 0.76, 0.08, 1.10, 0.12, F.TAU / 4, F.col('kilimOchre'), 'cloth');
  }
});

FURN({
  key: 'shumari_giant_board', name: 'Free Giant (Gedu-su) ablaq trestle feasting board', culture: 'shumari', tier: 'court',
  type: 'table', setting: 'indoor', rooms: ['hall', 'audience', 'living', 'barracks', 'tavern'],
  anchor: 'floor', clearance: { front: 0.95, back: 0.95 }, materials: ['stone', 'timber', 'lacquer', 'bronze'],
  w: 3.1, d: 1.35, h: 0.96, variants: 1,
  build: function (F) {
    const ap = F.col('apricot'), lac = F.col('lacquer'), brz = F.col('bronze');
    /* twin battered ablaq stone trestle piers */
    for (const sx of [-1.06, 1.06]) {
      F.box(sx, 0, 0, 0.34, 0.14, 1.18, 0, F.col('basaltDark'), 'stone');
      SMF_FX.ablaq(F, sx, 0.14, 0, 0.26, 0.70, 1.02, 4);
    }
    /* heavy bronze-wedged cedar tie-beam */
    F.box(0, 0.34, 0, 2.58, 0.14, 0.16, 0, F.col('cedar'), 'wood');
    for (const sx of [-1.24, 1.24]) F.box(sx, 0.30, 0, 0.06, 0.22, 0.22, 0, brz, 'bronze');
    /* massive 3.06 x 1.32 m slab top bound in crimson lacquer and cast-bronze corner straps at y = 0.96 */
    F.box(0, 0.84, 0, 3.06, 0.12, 1.32, 0, ap, 'wood');
    F.box(0, 0.85, 0, 3.08, 0.08, 1.34, 0, lac, 'lacquer');
    F.box(0, 0.86, 0, 2.94, 0.10, 1.20, 0, ap, 'wood');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.box(sx * 1.48, 0.84, sz * 0.61, 0.12, 0.122, 0.12, 0, brz, 'bronze');
    }
  }
});

FURN({
  key: 'shumari_ash_cenotaph', name: 'Regimental qubba ash-urn cenotaph', culture: 'shumari', tier: 'court',
  type: 'shrine', surface: false, setting: 'both', rooms: ['shrine', 'hall', 'court', 'antechamber', 'audience', 'plaza'],
  anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.6, right: 0.6 },
  materials: ['stone', 'lacquer', 'bronze'], w: 1.1, d: 1.75, h: 1.55, variants: 1,
  build: function (F) {
    const bas = F.col('basalt'), trv = F.col('travertine'), brz = F.col('bronze');
    /* stepped basalt and travertine ablaq sarcophagus plinth */
    F.box(0, 0, 0, 1.06, 0.14, 1.72, 0, F.col('basaltDark'), 'stone');
    SMF_FX.ablaq(F, 0, 0.14, 0, 0.92, 0.56, 1.56, 4);
    /* side columbarium niches holding small bronze cremation urns */
    for (const sx of [-0.42, 0.42]) for (const sz of [-0.42, 0, 0.42]) {
      F.box(sx, 0.28, sz, 0.10, 0.28, 0.24, 0, F.col('basaltDark'), 'stone');
      F.lathe(sx * 1.02, 0.29, sz, [[0.03, 0], [0.055, 0.08], [0.03, 0.16], [0.04, 0.19]], 0, brz, 'bronze', { nu: 10 });
    }
    F.box(0, 0.70, 0, 0.96, 0.10, 1.60, 0, F.col('lacquer'), 'lacquer');
    F.box(0, 0.80, 0.18, 0.72, 0.20, 1.12, 0, bas, 'stone');
    /* head-end miniature fluted Mamluk qubba dome on octagonal drum crowned with jamur */
    F.frustum(0, 0.80, -0.48, 0.26, 0.26, 0.20, 0, bas, 'stone', 8);
    F.lathe(0, 1.00, -0.48, [[0.26, 0], [0.27, 0.10], [0.22, 0.24], [0.11, 0.35], [0.02, 0.40]], 0, trv, 'stone',
      { nu: 16, flute: { n: 12, amp: 0.06, sharp: 2 } });
    SMF_FX.jamur(F, 0, 1.40, -0.48, 0.15, brz, 'bronze');
  }
});

FURN({
  key: 'shumari_kattu_lectern', name: 'Sumaru-kattu chancery muster lectern', culture: 'shumari', tier: 'court', wealth: [0.35, 1.0],
  type: 'desk', surface: false, setting: 'indoor',
  rooms: ['study', 'library', 'school', 'shrine', 'hall', 'office', 'chamber', 'war_room'],
  anchor: 'floor', clearance: { front: 0.8 }, materials: ['timber', 'lacquer', 'stone', 'bronze', 'gold'],
  w: 0.95, d: 0.72, h: 1.28, variants: 1,
  build: function (F) {
    const ced = F.col('cedar'), lac = F.col('lacquer'), brz = F.col('bronze');
    for (const sx of [-0.41, 0.41]) {
      F.box(sx, 0, 0, 0.09, 0.08, 0.68, 0, ced, 'wood');
      /* X-framed Mamluk rahla side supports */
      F.beam(sx, 0.08, -0.28, sx, 1.06, 0.24, 0.07, 0.07, ced, 'wood');
      F.beam(sx, 0.08, 0.28, sx, 1.18, -0.24, 0.07, 0.07, lac, 'lacquer');
      F.ball(sx, 0.60, 0, 0.035, brz, 'bronze');
      F.ball(sx, 1.24, -0.24, 0.038, brz, 'bronze');
    }
    /* lower archive shelf with rolled muster scrolls and basalt register tablets */
    F.box(0, 0.34, 0, 0.82, 0.05, 0.46, 0, ced, 'wood');
    for (let i = 0; i < 4; i++) F.cyl(-0.24 + i * 0.16, 0.39, -0.04, 0.035, 0.20, 0, F.col('travertinePale'), 'stone');
    /* sloped crimson-lacquered reading saddle holding an incised basalt kattu tablet */
    F.beam(0, 0.96, 0.24, 0, 1.18, -0.22, 0.88, 0.06, lac, 'lacquer');
    F.box(0, 0.94, 0.25, 0.90, 0.05, 0.06, 0, brz, 'bronze');
    F.beam(-0.06, 1.00, 0.18, -0.06, 1.16, -0.14, 0.50, 0.04, F.col('basaltDark'), 'stone');
    F.box(-0.06, 1.14, -0.10, 0.44, 0.03, 0.04, 0, lac, 'lacquer');
    F.box(-0.06, 1.08, 0.02, 0.36, 0.03, 0.04, 0, F.col('gold'), 'gold');
    /* bronze inkwell on side rest */
    F.cyl(0.32, 1.04, 0.04, 0.04, 0.07, 0, brz, 'bronze');
  }
});

/* ================================================================
   PLATEAU TRADES (Sunu-sikaru Copper Alembic & Stoneware Flask Larder)
   ================================================================ */

FURN({
  key: 'shumari_copper_alembic', name: 'Mamluk-domed copper alembic still for Sunu-sikaru', culture: 'shumari', tier: 'common', wealth: [0.25, 0.9],
  type: 'workstation', surface: false, setting: 'both', rooms: ['workshop', 'kitchen', 'tavern', 'store', 'yard'],
  anchor: 'floor', clearance: { front: 0.8, left: 0.4 }, materials: ['stone', 'metal', 'bronze', 'timber', 'ceramic', 'emissive'],
  w: 1.55, d: 0.95, h: 1.78, variants: 1,
  build: function (F) {
    const cop = F.col('copper'), dk = F.col('copperDark'), brz = F.col('bronze');
    /* dressed basalt hearth plinth spanning 1.50 x 0.90 m */
    F.box(0, 0, 0, 1.50, 0.10, 0.90, 0, F.col('basaltDark'), 'stone');
    /* left ablaq firebox furnace with iron grate and glowing embers */
    SMF_FX.ablaq(F, -0.36, 0.10, 0, 0.72, 0.62, 0.74, 4);
    F.box(-0.36, 0.18, 0.36, 0.30, 0.28, 0.04, 0, F.col('iron'), 'metal');
    F.box(-0.36, 0.22, 0.375, 0.20, 0.14, 0.02, 0, F.col('ember'), 'glow');
    /* riveted copper boiling pot and pointed Mamluk qubba alembic dome */
    F.cyl(-0.36, 0.72, 0, 0.30, 0.28, 0, dk, 'metal');
    F.cyl(-0.36, 0.98, 0, 0.32, 0.04, 0, brz, 'bronze');
    F.lathe(-0.36, 1.02, 0, [[0.28, 0], [0.31, 0.16], [0.24, 0.38], [0.11, 0.54], [0.05, 0.64]], 0, cop, 'metal', { nu: 16 });
    /* arching swan-neck copper vapour tube into right-hand snowmelt condenser barrel */
    F.tube([[-0.36, 1.64, 0], [-0.22, 1.75, 0], [0.12, 1.68, 0], [0.40, 1.26, 0], [0.40, 0.90, 0]], 0.032, cop, 'metal', { seg: 8 });
    F.box(0.40, 0.10, -0.04, 0.56, 0.28, 0.56, 0, F.col('basalt'), 'stone');
    F.cyl(0.40, 0.38, -0.04, 0.27, 0.68, 0, F.col('apricot'), 'wood');
    for (const y of [0.46, 0.72, 0.96]) F.cyl(0.40, y, -0.04, 0.28, 0.03, 0, brz, 'bronze');
    /* distillate spout and glazed stoneware spirit flask at front right */
    F.rod(0.40, 0.48, 0.22, 0.40, 0.44, 0.34, 0.016, cop, 'metal');
    F.lathe(0.40, 0.10, 0.32, [[0.07, 0], [0.11, 0.12], [0.10, 0.22], [0.04, 0.30], [0.05, 0.33]], 0, F.col('stoneware'), 'ceramic', { nu: 12 });
  }
});

FURN({
  key: 'shumari_spirit_flask_rack', name: 'Stoneware Sunu-sikaru flask and apricot-preserve larder', culture: 'shumari', tier: 'common', wealth: [0.3, 1.0],
  type: 'storage', role: 'larder', surface: false, setting: 'indoor',
  rooms: ['kitchen', 'living', 'hall', 'tavern', 'shop', 'store', 'cottage', 'bedroom'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'lacquer', 'ceramic', 'terracotta', 'stone'], w: 1.25, d: 0.48, h: 1.72, variants: 1,
  build: function (F) {
    const ap = F.col('apricot'), lac = F.col('lacquer'), stw = F.col('stoneware');
    /* basalt damp-proof feet and full timber backplate flush on z = -0.24 */
    for (const sx of [-0.54, 0.54]) F.box(sx, 0, -0.005, 0.10, 0.08, 0.47, 0, F.col('basalt'), 'stone');
    F.box(0, 0.08, -0.21, 1.22, 1.52, 0.06, 0, F.shade(ap, -0.1), 'wood');
    for (const sx of [-0.57, 0.57]) F.box(sx, 0.08, -0.005, 0.08, 1.54, 0.45, 0, ap, 'wood');
    /* three notched cradle shelves and crimson-lacquer shurafat crown at h = 1.72 */
    for (const sy of [0.12, 0.62, 1.12]) {
      F.box(0, sy, 0.0, 1.18, 0.05, 0.44, 0, ap, 'wood');
      F.box(0, sy + 0.05, 0.19, 1.18, 0.05, 0.04, 0, lac, 'lacquer');
    }
    F.box(0, 1.58, -0.01, 1.24, 0.06, 0.46, 0, lac, 'lacquer');
    SMF_FX.shurafat(F, -0.56, 0.56, 1.64, -0.01, 0.08, 0.40, 6, lac, 'lacquer');
    /* bottom shelf: three lidded terracotta dried-apricot preserve crocks */
    for (const sx of [-0.36, 0, 0.36]) {
      F.lathe(sx, 0.17, 0.0, [[0.09, 0], [0.13, 0.14], [0.12, 0.28], [0.08, 0.34]], 0, F.col('clay'), 'terracotta', { nu: 12 });
      F.cyl(sx, 0.51, 0.0, 0.09, 0.04, 0, lac, 'lacquer');
    }
    /* middle and upper shelves: glazed stoneware Sunu-sikaru spirit flasks sealed with crimson lacquer wax */
    for (const sy of [0.67, 1.17]) {
      for (let i = 0; i < 4; i++) {
        const sx = -0.39 + i * 0.26;
        F.lathe(sx, sy, 0.0, [[0.06, 0], [0.095, 0.12], [0.09, 0.24], [0.032, 0.34], [0.04, 0.37]], 0, stw, 'ceramic', { nu: 12 });
        F.cyl(sx, sy + 0.36, 0.0, 0.038, 0.04, 0, lac, 'lacquer');
      }
    }
  }
});
