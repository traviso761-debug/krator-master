/* ======================================================================
   Krator Master Furniture Registry — 84 pieces
   Harvested from Voth, Iziz, Mav's Refuge, Girder, Yuni and the Ancients kit.
   Requires krator-asset-engine.js to be loaded first (defines FURN(), F.*, etc).
   Every piece is tagged with culture: one of ancient, ancients-salvage,
   yuni-court, yuni-common, yuni-poor, sahelian, order, voth, iziz, beast-rider.
   Build any instance with: buildFurn(key, x, z, ry, {variant, seed, y, wealth})

   Every entry carries the kits/furniture/SPEC.md fields: type, setting
   (indoor|outdoor|both), rooms [...], anchor (floor|wall|ceiling|surface),
   clearance {front,back,left,right} in metres, materials [...] (canonical
   names, CATALOG_MATERIALS in the engine). verify.py --assert checks them,
   and that the built geometry fits w x d x h centred on the origin.
   ====================================================================== */

/* ================= Voth (25 pieces) ================= */

FURN({
  key: 'voth_bench', name: 'Street Bench', culture: 'voth', type: 'bench', setting: 'outdoor',
  rooms: ['street', 'plaza', 'yard'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber'],
  w: 3.4, d: 1.0, h: 1.2, variants: 2,
  variantDims: [{ w: 3.4, d: 1.0, h: 0.66 }, { w: 3.4, d: 1.0, h: 1.2 }],
  build: function (F) {
    const backed = F.variant === 1;
    const c = F.pick(['timberTaupeLight', 'timberGrey', 'timberTaupe']);
    const legC = F.shade(c, -0.25), pegC = F.shade(c, -0.42);
    const seatH = 0.5, seatT = 0.12;
    /* two trestle ends: slab leg, splayed foot, knee brace up to the seat */
    for (let s = -1; s <= 1; s += 2) {
      const lx = s * 1.45 + F.rr(-0.03, 0.03);
      F.box(lx, 0.08, 0, 0.26, seatH - 0.08, 0.76, 0, legC, 'wood');
      F.box(lx, 0, 0, 0.34, 0.1, 0.96, 0, F.shade(legC, -0.14), 'wood');
      F.beam(lx - s * 0.1, seatH - 0.07, 0, lx + s * 0.34, 0.24, 0, 0.09, 0.5, legC, 'wood');
    }
    /* aprons front and back, one low stretcher tying the ends */
    F.box(0, seatH - 0.17, -0.34, 3.02, 0.15, 0.08, 0, F.shade(c, -0.15), 'wood');
    F.box(0, seatH - 0.17, 0.34, 3.02, 0.15, 0.08, 0, F.shade(c, -0.15), 'wood');
    F.box(0, 0.21, 0, 2.86, 0.11, 0.13, 0, F.shade(c, -0.2), 'wood');
    /* seat: three planks, each laid a hair differently */
    for (let i = 0; i < 3; i++) {
      F.box(0, seatH + F.rr(0, 0.012), -0.3 + i * 0.3, 3.4, seatT, 0.28, 0,
        F.shade(c, F.rr(-0.05, 0.05)), 'wood');
    }
    /* draw-pegs through the seat into the leg tenons, both ends */
    for (let s = -1; s <= 1; s += 2) F.cyl(s * 1.45, seatH + seatT - 0.01, 0.27, 0.032, 0.035, 0, pegC, 'wood');
    F.blob(F.rr(-0.9, 0.9), seatH + seatT, F.rr(-0.2, 0.2), 0.11, 0.022, F.rr(0, F.TAU), F.shade(c, -0.3), 'wood');
    if (backed) {
      for (let s = -1; s <= 1; s += 2) {
        F.box(s * 1.45, seatH + seatT, -0.34, 0.13, 0.46, 0.12, 0, legC, 'wood');
        F.cone(s * 1.45, seatH + seatT + 0.46, -0.34, 0.09, 0.1, 0, F.shade(legC, 0.1), 'wood');
      }
      F.box(0, 1.02, -0.34, 3.06, 0.14, 0.09, 0, c, 'wood');
      F.box(0, 0.74, -0.34, 2.96, 0.09, 0.07, 0, F.shade(c, -0.1), 'wood');
      for (let i = 0; i < 3; i++) {
        F.box(-1.0 + i * 1.0, 0.73, -0.34, 0.24, 0.3, 0.05, F.rr(-0.02, 0.02), F.shade(c, -0.06), 'wood');
      }
    }
  }
});

FURN({
  key: 'voth_street_brazier', name: 'Street Brazier', culture: 'voth', type: 'brazier', setting: 'outdoor',
  rooms: ['street', 'plaza'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['stone', 'metal', 'emissive'],
  w: 1.45, d: 1.45, h: 2.1, variants: 2,
  variantDims: [{ w: 1.3, d: 1.3, h: 1.45 }, { w: 1.45, d: 1.45, h: 2.1 }],
  build: function (F) {
    const ornate = F.variant === 1;
    const iron = F.col('iron'), bowlC = ornate ? F.col('steelLight') : F.col('steel');
    const coalC = F.cols(['ember', 'amber', 'coal']);
    let bowlTop;
    if (!ornate) {
      /* forged stand: four splayed legs to a hub, tied by a mid ring */
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        const fx = Math.cos(a) * 0.55, fz = Math.sin(a) * 0.55;
        F.rod(fx, 0.04, fz, Math.cos(a) * 0.14, 0.72, Math.sin(a) * 0.14, 0.045, iron, 'metal');
        F.box(fx, 0, fz, 0.19, 0.06, 0.19, a, F.shade(iron, -0.15), 'metal');
        const b = (i + 1) % 4 * F.TAU / 4;
        F.rod(Math.cos(a) * 0.36, 0.33, Math.sin(a) * 0.36,
          Math.cos(b) * 0.36, 0.33, Math.sin(b) * 0.36, 0.022, F.shade(iron, 0.08), 'metal');
      }
      F.frustum(0, 0.6, 0, 0.26, 0.5, 0.3, 0, bowlC, 'metal', 10);
      F.cyl(0, 0.9, 0, 0.52, 0.07, 0, F.shade(bowlC, 0.1), 'metal');
      F.cyl(0, 0.84, 0, 0.44, 0.06, 0, F.col('stoneSoot'), 'stone');
      bowlTop = 0.94;
    } else {
      /* guild brazier: stepped stone foot, fluted column, chased brass bowl */
      F.box(0, 0, 0, 1.2, 0.16, 1.2, 0, F.col('stoneTaupe'), 'stone');
      F.frustum(0, 0.16, 0, 0.5, 0.34, 0.2, 0, F.col('stoneGrey'), 'stone', 8);
      F.cyl(0, 0.36, 0, 0.19, 0.78, 0, F.shade(bowlC, -0.2), 'metal');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4 + 0.78;
        F.rod(Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2, Math.cos(a) * 0.2, 1.1, Math.sin(a) * 0.2, 0.026, F.shade(bowlC, 0.12), 'metal');
      }
      F.cyl(0, 1.14, 0, 0.24, 0.08, 0, F.shade(bowlC, -0.1), 'metal');
      F.frustum(0, 1.22, 0, 0.24, 0.56, 0.32, 0, bowlC, 'metal', 12);
      F.cyl(0, 1.5, 0, 0.6, 0.08, 0, F.shade(bowlC, 0.12), 'metal');
      F.cyl(0, 1.44, 0, 0.5, 0.06, 0, F.col('stoneSoot'), 'stone');
      /* four cast lugs, one to each side, so it reads from every angle */
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.rod(Math.cos(a) * 0.56, 1.46, Math.sin(a) * 0.56, Math.cos(a) * 0.69, 1.34, Math.sin(a) * 0.69, 0.035, F.shade(bowlC, -0.15), 'metal');
      }
      bowlTop = 1.56;
    }
    const sc = ornate ? 1.25 : 1;
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, F.TAU), r = F.rr(0, 0.3 * sc);
      F.blob(Math.cos(a) * r, bowlTop - 0.02, Math.sin(a) * r, F.rr(0.07, 0.11), 0.09, 0, F.pick(coalC), 'glow');
    }
    F.cone(0, bowlTop - 0.04, 0, 0.24 * sc, 0.32 * sc, 0, F.col('ember'), 'glow');
    F.cone(0, bowlTop + 0.1, 0, 0.13 * sc, 0.3 * sc, 0, F.col('flame'), 'glow');
    F.ball(F.rr(-0.05, 0.05), bowlTop + (ornate ? 0.5 : 0.44), F.rr(-0.05, 0.05), 0.05, F.col('candle'), 'glow');
    F.lamp(0, bowlTop + 0.2, 0, 1.0, 10);
  }
});

FURN({
  key: 'voth_wayside_shrine', name: 'Wayside Shrine (Triptych)', culture: 'voth', type: 'shrine', setting: 'outdoor',
  rooms: ['street', 'plaza'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['stone', 'plaster', 'emissive'],
  w: 8, d: 3.2, h: 4.2, variants: 1,
  build: function (F) {
    const stone = F.col('stoneKhakiLight'), dark = F.shade(stone, -0.1), deep = F.col('stoneGraphite');
    F.box(0, 0, 0, 8, 0.34, 3.2, 0, dark, 'stone');
    F.box(0, 0.34, 0, 7.4, 0.17, 2.8, 0, F.shade(stone, -0.02), 'stone');
    const bays = [[-2.4, 0.7, 2.0], [0, 0.82, 3.1], [2.4, 0.7, 2.0]];
    for (let i = 0; i < bays.length; i++) {
      const bx = bays[i][0], hw = bays[i][1], hh = bays[i][2];
      /* jambs plus a back slab, so the niche is a real void seen from the front */
      F.box(bx - hw + 0.16, 0.51, 0, 0.32, hh, 0.66, 0, stone, 'stone');
      F.box(bx + hw - 0.16, 0.51, 0, 0.32, hh, 0.66, 0, stone, 'stone');
      F.box(bx, 0.51, -0.26, 2 * hw - 0.3, hh, 0.14, 0, F.shade(stone, -0.14), 'stone');
      F.box(bx, 0.51 + hh, 0, 2 * hw + 0.24, 0.2, 0.92, 0, dark, 'stone');
      F.cone(bx, 0.51 + hh + 0.2, 0, hw + 0.06, i === 1 ? 0.36 : 0.3, 0, F.shade(stone, 0.06), 'stone');
      /* idol standing clear of the back slab */
      F.frustum(bx, 0.62, 0.02, 0.2, 0.12, hh * 0.58, 0, F.shade(stone, 0.08), 'stone', 8);
      F.ball(bx, 0.62 + hh * 0.58 + 0.12, 0.02, 0.13, F.shade(stone, 0.12), 'stone');
      /* offering ledge out in front, with a stub candle on it */
      F.box(bx, 0.51, 0.36, 2 * hw - 0.2, 0.11, 0.26, 0, F.shade(stone, -0.06), 'stone');
      if (i === 1) {
        F.cyl(bx + hw * 0.55, 0.62, 0.36, 0.05, 0.12, 0, F.col('plasterBone'), 'plaster');
        F.ball(bx + hw * 0.55, 0.76, 0.36, 0.035, F.col('flame'), 'glow');
      }
      /* carved band on the rear face, so the back is not a blank wall */
      F.box(bx, 0.51 + hh * 0.55, -0.36, 2 * hw - 0.5, 0.16, 0.05, 0, deep, 'stone');
    }
    F.lamp(0, 1.1, 0.5, 0.7, 9);
  }
});

FURN({
  key: 'voth_statue', name: 'Abstract Robed Statue', culture: 'voth', type: 'statue', setting: 'outdoor',
  rooms: ['plaza', 'court', 'garden'], anchor: 'floor', clearance: { front: 1 },
  materials: ['stone', 'metal', 'foliage', 'emissive'],
  w: 1.8, d: 1.8, h: 5.5, variants: 2,
  variantDims: [{ w: 1.8, d: 1.8, h: 5.5 }, { w: 1.28, d: 1.28, h: 3.8 }],
  build: function (F) {
    const stone = F.col('stoneGrey');
    const garden = F.variant === 1;
    const s = (v) => v * (garden ? (3.8 / 5.5) : 1);
    const body = garden ? F.shade(stone, 0.05) : stone;
    /* stepped plinth: base course, chamfer, die and a cyma moulding */
    F.box(0, 0, 0, s(1.8), s(0.34), s(1.8), 0, F.shade(stone, -0.15), 'stone');
    F.frustum(0, s(0.34), 0, s(0.88), s(0.68), s(0.14), 0, F.shade(stone, -0.08), 'stone', 4);
    F.box(0, s(0.48), 0, s(1.3), s(0.34), s(1.3), 0, stone, 'stone');
    F.cyl(0, s(0.82), 0, s(0.72), s(0.1), 0, F.shade(stone, 0.06), 'stone');
    /* an inscription block on each of the four faces of the die */
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      F.box(Math.sin(a) * s(0.67), s(0.56), Math.cos(a) * s(0.67), s(0.72), s(0.18), s(0.06), a, F.col('stoneUmber'), 'stone');
    }
    /* robe: a tapering column with vertical folds laid over it */
    F.frustum(0, s(0.92), 0, s(0.62), s(0.34), s(3.1), 0, body, 'stone', 12);
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + 0.3;
      F.rod(Math.cos(a) * s(0.6), s(1.0), Math.sin(a) * s(0.6),
        Math.cos(a) * s(0.34), s(3.9), Math.sin(a) * s(0.34), s(0.07), F.shade(body, -0.08), 'stone');
    }
    /* mantle, neck, hooded head */
    F.frustum(0, s(4.02), 0, s(0.44), s(0.24), s(0.34), 0, F.shade(body, 0.04), 'stone', 10);
    F.cyl(0, s(4.36), 0, s(0.13), s(0.16), 0, F.shade(body, -0.05), 'stone');
    F.dome(0, s(4.52), 0, s(0.3), s(0.46), 0, body, 'stone');
    F.cone(0, s(4.9), 0, s(0.34), s(0.6), 0, F.shade(body, 0.06), 'stone');
    /* arms folded across the front, hands, and a clasp at the back of the mantle */
    F.rod(s(-0.38), s(3.5), s(0.16), s(-0.06), s(3.02), s(0.36), s(0.09), body, 'stone');
    F.rod(s(0.38), s(3.5), s(0.16), s(0.06), s(3.05), s(0.36), s(0.09), body, 'stone');
    F.ball(s(-0.05), s(3.02), s(0.38), s(0.1), F.shade(body, 0.08), 'stone');
    F.ball(s(0.06), s(3.05), s(0.38), s(0.1), F.shade(body, 0.08), 'stone');
    F.ball(0, s(3.96), s(-0.38), s(0.11), F.shade(stone, -0.18), 'stone');
    if (garden) {
      F.blob(s(0.52), s(1.0), s(0.5), s(0.2), s(0.5), F.rr(0, F.TAU), F.col('leafMossLight'), 'leafy');
      F.blob(s(-0.55), s(0.9), s(-0.42), s(0.18), s(0.4), F.rr(0, F.TAU), F.col('leafMoss'), 'leafy');
    } else {
      for (let t = -1; t <= 1; t += 2) {
        F.cyl(s(t * 0.7), s(0.92), s(0.7), s(0.14), s(0.16), 0, F.col('steel'), 'metal');
        F.ball(s(t * 0.7), s(1.1), s(0.7), s(0.07), F.col('flame'), 'glow');
      }
      F.lamp(0, s(1.2), s(0.8), 0.6, 8);
    }
  }
});

FURN({
  key: 'voth_obelisk', name: 'Obelisk', culture: 'voth', type: 'monument', setting: 'outdoor',
  rooms: ['plaza'], anchor: 'floor', clearance: { front: 2, back: 2, left: 2, right: 2 },
  materials: ['stone', 'metal'],
  w: 4, d: 4, h: 16, variants: 1,
  build: function (F) {
    const stone = F.col('stoneGrey'), cut = F.col('stoneUmber');
    F.box(0, 0, 0, 4, 0.6, 4, 0, F.shade(stone, -0.1), 'stone');
    F.frustum(0, 0.6, 0, 1.9, 1.55, 0.18, 0, F.shade(stone, -0.04), 'stone', 4);
    F.box(0, 0.78, 0, 3, 0.32, 3, 0, stone, 'stone');
    F.box(0, 1.1, 0, 1.8, 7, 1.8, 0, stone, 'stone');
    /* corner pilasters standing proud of the shaft on all four corners */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4;
      F.box(Math.cos(a) * 0.9, 1.1, Math.sin(a) * 0.9, 0.3, 7, 0.3, 0, F.shade(stone, 0.08), 'stone');
    }
    /* an inscription band cut into every face, not just the front */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 0.92, 3.4, Math.cos(a) * 0.92, 1.1, 1.8, 0.06, a, cut, 'stone');
    }
    F.cyl(0, 8.1, 0, 1.05, 0.22, 0, F.shade(stone, -0.06), 'stone');
    F.box(0, 8.32, 0, 1.1, 6.18, 1.1, 0, F.shade(stone, 0.05), 'stone');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 0.57, 10.4, Math.cos(a) * 0.57, 0.6, 2.6, 0.05, a, cut, 'stone');
    }
    F.cyl(0, 14.5, 0, 0.78, 0.2, 0, F.shade(stone, -0.05), 'stone');
    F.cone(0, 14.7, 0, 0.72, 1.18, 0, F.shade(stone, 0.12), 'stone');
    F.ball(0, 15.96, 0, 0.11, F.col('gilt'), 'metal');
    /* offering bowls on the plinth step, one at each corner */
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + Math.PI / 4;
      F.cyl(Math.cos(a) * 1.18, 1.1, Math.sin(a) * 1.18, 0.17, 0.2, 0, F.shade(stone, -0.14), 'stone');
    }
  }
});

FURN({
  key: 'voth_strider_station', name: "Silt Strider Transit Station", culture: 'voth', type: 'shelter', setting: 'outdoor',
  rooms: ['street', 'plaza'], anchor: 'floor', clearance: { front: 3 },
  materials: ['timber', 'cloth'],
  w: 10, d: 16, h: 5.6, variants: 1,
  build: function (F) {
    F.shift(0, -0.83); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberWalnut'), deckC = F.col('timberMud'), roofC = F.col('timberWalnut'), rail = F.col('timberUmberLight');
    const posts = [[-4, -6], [4, -6], [-4, 0], [4, 0], [-4, 6], [4, 6]];
    for (const p of posts) {
      F.cyl(p[0], 0, p[1], 0.25, 2.2, 0, wood, 'wood');
      F.beam(p[0], 2.1, p[1], p[0] + (p[0] < 0 ? 0.85 : -0.85), 1.25, p[1], 0.14, 0.14, wood, 'wood');
    }
    F.beam(-4, 1.75, -6, -4, 1.75, 6, 0.16, 0.16, wood, 'wood');
    F.beam(4, 1.75, -6, 4, 1.75, 6, 0.16, 0.16, wood, 'wood');
    F.box(0, 2.2, 0, 10, 0.4, 14, 0, deckC, 'wood');
    /* railings on the back and both flanks, with stanchions */
    F.box(0, 3.22, -7, 10, 0.12, 0.12, 0, rail, 'wood');
    F.box(-5, 3.22, 0, 0.12, 0.12, 14, 0, rail, 'wood');
    F.box(5, 3.22, 0, 0.12, 0.12, 14, 0, rail, 'wood');
    for (let s = -1; s <= 1; s += 2) {
      F.cyl(s * 5, 2.6, -5.6, 0.06, 0.62, 0, rail, 'wood');
      F.cyl(s * 5, 2.6, 5.6, 0.06, 0.62, 0, rail, 'wood');
    }
    /* boarding stair with treads and hand ropes */
    F.box(0, 0, 8.2, 3, 0.5, 1.2, 0, deckC, 'wood');
    F.box(0, 0.5, 7.6, 3, 0.5, 1.0, 0, deckC, 'wood');
    F.box(0, 1.0, 7.0, 3, 0.6, 1.0, 0, deckC, 'wood');
    F.box(0, 1.6, 6.5, 3, 0.6, 1.0, 0, deckC, 'wood');
    F.rod(-1.5, 1.1, 8.6, -1.5, 3.0, 6.2, 0.04, F.col('clothMud'), 'cloth');
    F.rod(1.5, 1.1, 8.6, 1.5, 3.0, 6.2, 0.04, F.col('clothMud'), 'cloth');
    /* shelter over the waiting end */
    const shH = 2.0;
    const sp = [[-2.5, -3], [2.5, -3], [-2.5, -6.5], [2.5, -6.5]];
    for (const p of sp) F.cyl(p[0], 2.6, p[1], 0.15, shH, 0, wood, 'wood');
    F.box(0, 2.6 + shH, -4.75, 5.6, 0.22, 4.2, 0, roofC, 'wood');
    F.pyrRoof(0, 2.82 + shH, -4.75, 6.2, 0.75, 4.8, 0, F.shade(roofC, 0.06), 'wood');
    F.box(0, 2.6 + shH - 0.55, -6.6, 5.2, 0.55, 0.1, 0, F.col('clothMud'), 'cloth');
    /* bench, freight and a mooring bollard on the deck */
    F.box(-2.4, 2.6, -5.6, 3.6, 0.42, 0.5, 0, deckC, 'wood');
    F.box(2.0, 2.6, -4.6, 0.9, 0.8, 0.9, 0.2, F.col('timberMud'), 'wood');
    F.cyl(3.6, 2.6, 4.4, 0.18, 0.7, 0, F.col('timberWalnut'), 'wood');
  }
});

FURN({
  key: 'voth_canoe', name: 'Canoe', culture: 'voth', type: 'vessel', setting: 'outdoor',
  rooms: ['dock'], anchor: 'floor', clearance: { left: 0.6, right: 0.6 },
  materials: ['timber', 'cloth'],
  w: 1.3, d: 5.5, h: 1.6, variants: 1,
  build: function (F) {
    const hull = F.col('timberUmberLight'), trim = F.shade(hull, -0.15), pale = F.shade(hull, 0.12);
    /* keel and a tapering shell of five strakes */
    F.rod(0, 0.09, -2.55, 0, 0.09, 2.55, 0.1, trim, 'wood');
    const seg = [[-2.1, 0.62, 0.36], [-1.15, 1.05, 0.5], [0, 1.24, 0.56], [1.15, 1.05, 0.5], [2.1, 0.62, 0.36]];
    for (const g of seg) F.box(0, 0.06, g[0], g[1], g[2], 1.1, 0, hull, 'wood');
    /* stem and stern posts rising out of the ends */
    F.beam(0, 0.12, -2.5, 0, 0.9, -2.7, 0.16, 0.3, trim, 'wood');
    F.beam(0, 0.12, 2.5, 0, 0.9, 2.7, 0.16, 0.3, trim, 'wood');
    /* gunwale strakes down both flanks, in three runs so they follow the sheer */
    for (let s = -1; s <= 1; s += 2) {
      F.rod(s * 0.3, 0.62, -2.55, s * 0.55, 0.58, 0, 0.055, pale, 'wood');
      F.rod(s * 0.55, 0.58, 0, s * 0.3, 0.62, 2.55, 0.055, pale, 'wood');
    }
    /* ribs across the bilge and three thwarts */
    for (let i = 0; i < 3; i++) {
      F.box(0, 0.1, -1.5 + i * 1.5, 1.06, 0.05, 0.08, 0, F.shade(hull, -0.08), 'wood');
    }
    for (let i = 0; i < 3; i++) {
      F.box(0, 0.5, -1.2 + i * 1.2, 1.12, 0.07, 0.2, 0, pale, 'wood');
    }
    /* short mast with a furled sail, lashed amidships */
    F.rod(0, 0.55, 0.1, 0.05, 1.55, 0.05, 0.05, F.col('timberUmber'), 'wood');
    F.box(0.03, 0.85, 0.06, 0.24, 0.62, 0.22, 0.3, F.col('clothLinenLight'), 'cloth');
    F.rod(-0.1, 0.56, -0.2, 0.18, 0.56, 0.3, 0.02, F.col('clothMud'), 'cloth');
    /* paddle stowed along the port side, and a coil of line aft */
    F.rod(-0.42, 0.44, -1.6, -0.5, 0.48, 0.5, 0.03, F.col('timberMud'), 'wood');
    F.box(-0.5, 0.42, 0.85, 0.16, 0.04, 0.55, 0, F.col('clothMud'), 'wood');
    F.blob(0.34, 0.24, 1.9, 0.16, 0.12, 0, F.col('clothKhaki'), 'cloth');
  }
});

FURN({
  key: 'voth_ferry', name: 'Ferry', culture: 'voth', type: 'vessel', setting: 'outdoor',
  rooms: ['dock'], anchor: 'floor', clearance: { left: 1, right: 1 },
  materials: ['timber', 'metal', 'glass', 'cloth'],
  w: 6, d: 16, h: 5, variants: 1,
  build: function (F) {
    const hull = F.col('timberUmberLight'), deckC = F.col('clothMud'), cabinC = F.col('timberUmber'), trim = F.col('timberWalnut');
    F.box(0, 0, 0, 6, 1.6, 14.8, 0, hull, 'wood');
    /* raked stem and stern, wale strakes down both flanks */
    F.beam(0, 0.2, -7.3, 0, 1.75, -7.95, 1.0, 0.7, hull, 'wood');
    F.beam(0, 0.2, 7.3, 0, 1.9, 7.95, 1.0, 0.7, hull, 'wood');
    for (let s = -1; s <= 1; s += 2) F.box(s * 3.0, 1.15, 0, 0.14, 0.2, 14.4, 0, trim, 'wood');
    F.box(0, 1.6, 0, 5.6, 0.3, 15.4, 0, deckC, 'wood');
    /* bulwark rail all the way round, with stanchions */
    F.box(-2.85, 1.9, 0, 0.14, 0.55, 15.2, 0, trim, 'wood');
    F.box(2.85, 1.9, 0, 0.14, 0.55, 15.2, 0, trim, 'wood');
    F.box(0, 1.9, 7.6, 5.7, 0.55, 0.14, 0, trim, 'wood');
    F.box(0, 1.9, -7.6, 5.7, 0.55, 0.14, 0, trim, 'wood');
    for (let s = -1; s <= 1; s += 2) {
      F.cyl(-2.85, 2.45, s * 5.2, 0.07, 0.42, 0, trim, 'wood');
      F.cyl(2.85, 2.45, s * 5.2, 0.07, 0.42, 0, trim, 'wood');
    }
    /* deckhouse: walls, door, lights on three sides, roof and a stove pipe */
    F.box(-1, 1.9, -4, 3, 1.7, 4, 0, cabinC, 'wood');
    F.box(-1, 3.6, -4, 3.3, 0.16, 4.3, 0, trim, 'wood');
    F.box(-1, 1.95, -1.94, 0.8, 1.35, 0.1, 0, F.shade(cabinC, -0.2), 'wood');
    F.cyl(-0.68, 2.6, -1.92, 0.05, 0.08, 0, F.col('brass'), 'metal');
    for (let s = -1; s <= 1; s += 2) F.box(-1 + s * 1.52, 2.75, -4, 0.06, 0.45, 0.6, 0, F.col('glassMist'), 'glass');
    F.box(-1, 2.75, -2.03, 0.9, 0.45, 0.06, 0, F.col('glassMist'), 'glass');
    F.box(-1, 2.75, -6.03, 1.6, 0.45, 0.06, 0, F.col('glassMist'), 'glass');
    F.cyl(0.1, 3.76, -5.2, 0.12, 0.9, 0, F.col('ironDark'), 'metal');
    F.cyl(0.1, 4.66, -5.2, 0.16, 0.1, 0, F.col('blackIron'), 'metal');
    /* mast, yard and a brailed sail */
    F.rod(1.5, 1.9, 2, 1.5, 4.9, 2, 0.1, trim, 'wood');
    F.rod(0.3, 4.35, 2, 2.7, 4.35, 2, 0.06, trim, 'wood');
    F.box(1.5, 3.05, 2.06, 1.9, 1.3, 0.09, 0, F.col('clothLinenDark'), 'cloth');
    F.rod(1.5, 4.85, 2, 2.6, 2.3, 4.6, 0.02, F.col('clothMud'), 'cloth');
    /* tiller aft, bench, bollards and freight */
    F.rod(0, 2.1, 6.9, 0, 2.9, 5.6, 0.06, trim, 'wood');
    F.box(-1.6, 1.9, 5.4, 2.4, 0.42, 0.45, 0, deckC, 'wood');
    for (let s = -1; s <= 1; s += 2) F.cyl(s * 2.3, 1.9, 7.0, 0.14, 0.55, 0, trim, 'wood');
    const crateColors = F.cols(['timberMud', 'timberMudLight', 'timberUmberLight']);
    for (let i = 0; i < 2; i++) {
      F.box(1.5 + F.rr(-0.4, 0.4), 1.9, 3.4 + i * 1.8, F.rr(0.7, 0.95), F.rr(0.6, 0.85), 0.85,
        F.rr(0, F.TAU), F.pick(crateColors), 'wood');
    }
    F.blob(-1.9, 2.15, 3.2, 0.36, 0.5, F.rr(0, F.TAU), F.col('clothSand'), 'cloth');
  }
});

FURN({
  key: 'voth_market_stall', name: 'Market Stall (Produce)', culture: 'voth', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'metal', 'cloth', 'foliage'],
  w: 4.5, d: 4.5, h: 3.45, variants: 2,
  build: function (F) {
    const exotic = F.variant === 1;
    const counterC = F.col('timberMud'), postC = F.col('timberUmber');
    /* counter: top, front boards, four legs, rails and a shelf beneath */
    F.box(0, 0.8, 0.6, 3.6, 0.12, 1.0, 0, counterC, 'wood');
    F.box(0, 0.16, 1.06, 3.5, 0.66, 0.07, 0, F.shade(counterC, -0.15), 'wood');
    F.box(0, 0.4, 0.6, 3.3, 0.06, 0.8, 0, F.shade(counterC, -0.1), 'wood');
    for (let s = -1; s <= 1; s += 2) {
      for (let t = -1; t <= 1; t += 2) {
        F.box(s * 1.65, 0, 0.6 + t * 0.4, 0.13, 0.8, 0.13, 0, F.shade(counterC, -0.22), 'wood');
      }
    }
    const posts = [[-2, -1.8], [2, -1.8], [-2, 1.8], [2, 1.8]];
    for (const p of posts) {
      F.cyl(p[0], 0, p[1], 0.1, 2.5, 0, postC, 'wood');
      F.beam(p[0], 2.42, p[1], p[0] * 0.72, 2.0, p[1] * 0.72, 0.07, 0.07, postC, 'wood');
    }
    const clothC = exotic ? F.col('clothJade') : F.pick(['clothOrange', 'clothCrimson', 'clothTeal']);
    F.box(0, 2.5, 0, 4.4, 0.16, 4.4, 0, clothC, 'cloth');
    F.cone(0, 2.66, 0, 2.2, 0.68, 0, F.shade(clothC, -0.1), 'cloth');
    /* valance on all four sides so the canopy reads from behind too */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 2.14, 2.24, Math.cos(a) * 2.14, 4.3, 0.26, 0.05, a, F.shade(clothC, -0.18), 'cloth');
    }
    /* back shelf with stock, visible from the rear */
    F.box(0, 1.2, -1.75, 3.4, 0.08, 0.4, 0, counterC, 'wood');
    for (let i = 0; i < 2; i++) {
      F.cyl(-0.9 + i * 1.8, 1.28, -1.75, 0.13, 0.32, 0, F.pick(['timberTeakLight', 'steel', 'timberTeak']), 'wood');
    }
    /* produce trays on the counter */
    for (let i = 0; i < 2; i++) {
      const x = -0.9 + i * 1.6;
      F.cyl(x, 0.92, 0.6, 0.28, 0.1, 0, F.shade(counterC, 0.08), 'wood');
      for (let j = 0; j < 2; j++) {
        F.blob(x + F.rr(-0.16, 0.16), 1.06, 0.6 + F.rr(-0.16, 0.16), 0.1, 0.12, 0,
          F.pick(['leafMadder', 'leaf', 'leafOchre']), 'leafy');
      }
    }
    F.cyl(1.4, 0.92, 0.3, 0.09, 0.2, 0, F.col('steel'), 'metal');
    if (exotic) {
      F.box(-1.5, 0.92, 1.1, 0.5, 0.5, 0.45, 0.2, F.col('clothPlum'), 'cloth');
      F.box(1.5, 0.92, 1.1, 0.4, 0.42, 0.38, -0.15, F.col('clothIndigo'), 'cloth');
      F.box(0, 0.92, 1.1, 0.3, 0.2, 0.28, 0, F.col('stoneMist'), 'stone');
      F.cyl(-1.95, 0, 1.2, 0.3, 1.2, 0, F.col('stoneKhaki'), 'stone');
      F.cone(-1.95, 1.2, 1.2, 0.26, 0.22, 0, F.col('stoneMud'), 'stone');
      F.box(-2.02, 1.7, -1.75, 0.04, 0.5, 0.9, 0, F.col('clothGold'), 'cloth');
      F.box(2.02, 1.7, -1.75, 0.04, 0.5, 0.9, 0, F.col('clothCrimson'), 'cloth');
    }
  }
});

FURN({
  key: 'voth_forge_station', name: "Blacksmith Forge Station", culture: 'voth', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'metal', 'glass', 'emissive'],
  w: 4, d: 3, h: 2.6, variants: 1,
  build: function (F) {
    const soot = F.col('blackIron'), metal = F.col('ironDark'), brick = F.col('stoneUmberLight'), wood = F.col('timberUmber');
    /* hearth: brick mass, fire bed, flue hood and chimney */
    F.box(-1.3, 0, -0.1, 1.5, 0.85, 1.3, 0, brick, 'stone');
    F.box(-1.3, 0.85, -0.1, 1.6, 0.12, 1.4, 0, F.shade(brick, -0.15), 'stone');
    F.cyl(-1.3, 0.97, -0.1, 0.42, 0.1, 0, F.col('stoneSoot'), 'stone');
    for (let i = 0; i < 3; i++) {
      F.blob(-1.3 + F.rr(-0.25, 0.25), 1.06, -0.1 + F.rr(-0.25, 0.25), 0.1, 0.09, 0,
        F.pick(['fireDark', 'flameDark', 'ember']), 'glow');
    }
    F.frustum(-1.3, 1.16, -0.1, 0.55, 0.26, 0.68, 0, soot, 'metal', 8);
    F.cyl(-1.3, 1.84, -0.1, 0.24, 0.62, 0, F.shade(soot, 0.1), 'metal');
    F.cyl(-1.3, 2.46, -0.1, 0.3, 0.12, 0, F.shade(soot, 0.16), 'metal');
    F.lamp(-1.3, 1.1, -0.1, 0.9, 9);
    /* bellows behind the hearth */
    F.box(-1.3, 0.5, -1.05, 0.5, 0.36, 0.7, 0, F.col('timberChestnut'), 'wood');
    F.rod(-1.3, 0.86, -1.05, -1.3, 1.5, -1.25, 0.04, wood, 'wood');
    /* anvil on a stump */
    F.cyl(0.4, 0, 0.35, 0.28, 0.55, 0, F.col('timberWalnut'), 'wood');
    F.box(0.4, 0.55, 0.35, 0.34, 0.1, 0.24, 0, metal, 'metal');
    F.box(0.4, 0.65, 0.35, 0.9, 0.16, 0.3, 0, F.shade(metal, 0.1), 'metal');
    F.rod(0.95, 0.73, 0.35, 1.22, 0.73, 0.35, 0.09, F.shade(metal, 0.1), 'metal');
    F.cyl(0.25, 0.81, 0.35, 0.07, 0.07, 0, F.col('fireDark'), 'glow');
    /* quench trough and slack tub */
    F.box(1.45, 0, -0.85, 0.9, 0.45, 0.6, 0, wood, 'wood');
    F.box(1.45, 0.4, -0.85, 0.82, 0.06, 0.52, 0, F.col('glassSlate'), 'glass');
    F.cyl(1.5, 0, 1.05, 0.3, 0.5, 0, F.col('timberWalnut'), 'wood');
    F.cyl(1.5, 0.46, 1.05, 0.27, 0.05, 0, F.col('glassSlate'), 'glass');
    F.blob(0.2, 0.14, 1.15, 0.34, 0.28, F.rr(0, F.TAU), F.col('stoneSoot'), 'stone');
    /* tool wall behind, so the back face carries something */
    F.cyl(0.1, 0, -1.3, 0.07, 1.9, 0, wood, 'wood');
    F.cyl(1.7, 0, -1.3, 0.07, 1.9, 0, wood, 'wood');
    F.beam(0.1, 1.82, -1.3, 1.7, 1.82, -1.3, 0.07, 0.07, wood, 'wood');
    for (let i = 0; i < 3; i++) {
      const x = 0.3 + i * 0.55;
      F.rod(x, 1.78, -1.3, x + F.rr(-0.06, 0.06), 1.05, -1.3, 0.025, metal, 'metal');
      if (i === 1) F.box(x, 0.95, -1.3, 0.13, 0.12, 0.09, 0, F.shade(metal, 0.15), 'metal');
    }
  }
});

FURN({
  key: 'voth_still_cluster', name: "Alchemist's Still Cluster", culture: 'voth', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'glass', 'cloth', 'emissive'],
  w: 2.5, d: 1.2, h: 1.45, variants: 1,
  build: function (F) {
    const stone = F.col('stoneGrey'), jade = F.col('stoneJade'), metal = F.col('steel'), glass = F.col('glassMist');
    /* bench: top slab, apron and four stub legs */
    F.box(0, 0.36, 0, 2.5, 0.14, 1.2, 0, stone, 'stone');
    F.box(0, 0.24, 0, 2.3, 0.12, 1.0, 0, F.shade(stone, -0.12), 'stone');
    for (let s = -1; s <= 1; s += 2) {
      for (let t = -1; t <= 1; t += 2) F.box(s * 1.05, 0, t * 0.44, 0.2, 0.24, 0.2, 0, F.shade(stone, -0.18), 'stone');
    }
    /* big retort: body, neck, condenser arm down into a receiver */
    F.frustum(-0.72, 0.5, 0, 0.32, 0.2, 0.52, 0, jade, 'stone', 10);
    F.cyl(-0.72, 1.02, 0, 0.11, 0.16, 0, F.shade(jade, -0.12), 'stone');
    F.cone(-0.72, 1.18, 0, 0.18, 0.24, 0, F.shade(jade, -0.1), 'stone');
    F.rod(-0.6, 1.24, 0, -0.18, 1.0, 0.14, 0.035, metal, 'metal');
    F.rod(-0.18, 1.0, 0.14, -0.12, 0.64, 0.32, 0.035, metal, 'metal');
    F.cyl(-0.12, 0.5, 0.32, 0.1, 0.16, 0, glass, 'glass');
    /* charcoal burner under the retort, flame licking the belly */
    F.cyl(-0.72, 0.5, 0, 0.2, 0.06, 0, F.col('stoneEbony'), 'stone');
    F.cone(-0.72, 0.5, 0, 0.13, 0.16, 0, F.col('fire'), 'glow');
    F.lamp(-0.72, 0.6, 0, 0.5, 6);
    /* copper alembic with a worm coil */
    F.cyl(0.3, 0.5, 0, 0.24, 0.42, 0, metal, 'metal');
    F.dome(0.3, 0.92, 0, 0.24, 0.24, 0, F.shade(metal, 0.12), 'metal');
    for (let i = 0; i < 3; i++) {
      const a0 = i * 1.6, a1 = (i + 1) * 1.6;
      F.rod(0.3 + Math.cos(a0) * 0.17, 1.16 - i * 0.02, Math.sin(a0) * 0.17,
        0.3 + Math.cos(a1) * 0.17, 1.14 - i * 0.02, Math.sin(a1) * 0.17, 0.022, F.shade(metal, 0.2), 'metal');
    }
    /* small still, a rack of phials and a stacked sack */
    F.cyl(1.0, 0.5, -0.14, 0.17, 0.32, 0, jade, 'stone');
    F.cone(1.0, 0.82, -0.14, 0.13, 0.2, 0, F.shade(jade, -0.1), 'stone');
    F.box(0.9, 0.5, 0.36, 0.6, 0.05, 0.24, 0, F.col('timberUmber'), 'wood');
    for (let i = 0; i < 2; i++) {
      F.cyl(0.76 + i * 0.28, 0.55, 0.36, 0.05, 0.16, 0, F.pick(['clothCrimson', 'clothTeal', 'clothGold']), 'glass');
    }
    F.blob(-1.12, 0.48, -0.36, 0.14, 0.16, F.rr(0, F.TAU), F.col('timberUmberLight'), 'cloth');
  }
});

FURN({
  key: 'voth_mason_yard', name: "Mason's Yard", culture: 'voth', type: 'workstation', setting: 'outdoor',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 5, d: 5, h: 4, variants: 1,
  build: function (F) {
    const stoneC = F.col('stoneLinen'), wood = F.col('timberUmber');
    /* dressed and rough blocks scattered across the yard */
    for (let i = 0; i < 6; i++) {
      const x = F.rr(-2.0, 2.0), z = F.rr(-2.0, 2.0);
      const w = F.rr(0.4, 0.8), h = F.rr(0.3, 0.55);
      F.box(x, 0, z, w, h, F.rr(0.4, 0.8), F.rr(0, F.TAU), F.shade(stoneC, F.rr(-0.08, 0.06)), 'stone');
      if (i < 2) F.box(x, h, z, w * 0.7, 0.28, w * 0.7, F.rr(0, F.TAU), F.shade(stoneC, 0.04), 'stone');
    }
    /* banker bench with a half-cut block, mallet and chisels */
    F.box(-1.3, 0, 1.5, 1.5, 0.6, 0.7, 0, wood, 'wood');
    F.box(-1.3, 0.6, 1.5, 1.6, 0.1, 0.8, 0, F.shade(wood, 0.1), 'wood');
    F.box(-1.3, 0.7, 1.5, 0.6, 0.45, 0.5, 0.2, F.shade(stoneC, 0.05), 'stone');
    F.rod(-0.7, 0.72, 1.7, -0.45, 0.78, 1.9, 0.04, F.col('timberUmberLight'), 'wood');
    for (let i = 0; i < 2; i++) F.rod(-1.9 + i * 0.2, 0.7, 1.75, -1.9 + i * 0.2, 0.92, 1.75, 0.018, F.col('iron'), 'metal');
    F.blob(-1.3, 0.05, 2.1, 0.3, 0.1, F.rr(0, F.TAU), F.col('stoneLinenLight'), 'stone');
    /* sheerlegs: three raking spars, a head lashing and a tackle with a block slung */
    F.rod(-1.8, 0, -1.8, -0.12, 3.7, -1.5, 0.12, wood, 'wood');
    F.rod(1.8, 0, -1.8, 0.12, 3.7, -1.5, 0.12, wood, 'wood');
    F.rod(0, 0, -2.3, 0, 3.7, -1.55, 0.11, wood, 'wood');
    F.ball(0, 3.72, -1.52, 0.16, F.col('clothMud'), 'cloth');
    F.rod(0, 3.62, -1.52, 0, 2.05, -1.2, 0.02, F.col('clothMud'), 'cloth');
    F.box(0, 1.55, -1.2, 0.5, 0.5, 0.5, 0.3, F.shade(stoneC, -0.05), 'stone');
    F.rod(-1.8, 1.7, -1.8, 1.8, 1.7, -1.8, 0.05, wood, 'wood');
    /* hoist post and jib on the other flank */
    F.cyl(1.9, 0, 1.7, 0.11, 2.6, 0, wood, 'wood');
    F.beam(1.9, 2.55, 1.7, 1.9, 2.55, 0.5, 0.1, 0.1, wood, 'wood');
    F.beam(1.9, 1.7, 1.7, 1.9, 2.5, 0.75, 0.07, 0.07, wood, 'wood');
    F.rod(1.9, 2.5, 0.55, 1.9, 1.6, 0.55, 0.018, F.col('clothMud'), 'cloth');
  }
});

FURN({
  key: 'voth_guild_banners', name: "Warrior's Guild Banners & Rack", culture: 'voth', type: 'rack', setting: 'both',
  rooms: ['street', 'hall', 'barracks'], anchor: 'wall', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 3, d: 1, h: 2.8, variants: 1,
  build: function (F) {
    F.shift(0, -0.13); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberWalnut'), iron = F.col('iron');
    for (let s = -1; s <= 1; s += 2) {
      const px = s * 1.2;
      F.box(px, 0, 0, 0.3, 0.14, 0.42, 0, F.col('stoneTaupe'), 'stone');
      F.cyl(px, 0.14, 0, 0.08, 2.46, 0, wood, 'wood');
      F.beam(px, 2.3, 0, px - s * 0.34, 2.3, 0, 0.05, 0.05, iron, 'metal');
      F.cone(px, 2.6, 0, 0.09, 0.2, 0, F.col('clothGold'), 'metal');
      /* banner off the crossarm, with a weighted hem bar and tassels */
      const col = s < 0 ? F.col('clothCrimson') : F.col('clothGold');
      F.box(px - s * 0.17, 1.12, 0, 0.34, 1.18, 0.05, 0, col, 'cloth');
      F.box(px - s * 0.17, 1.06, 0, 0.38, 0.07, 0.07, 0, iron, 'metal');
      F.cone(px - s * 0.17, 0.94, 0, 0.04, 0.14, 0, F.col('clothGold'), 'metal');
      /* shield hung on the back of the post — a disc standing in the x-y plane */
      F.rod(px, 1.95, -0.14, px, 1.95, -0.24, 0.21, F.col('steel'), 'metal');
      F.ball(px, 1.95, -0.26, 0.06, F.shade('steel', 0.25), 'metal');
    }
    /* spear rack across the front: base sill, top bar, and the spears in it */
    F.box(0, 0, 0.42, 1.3, 0.16, 0.3, 0, wood, 'wood');
    F.box(0, 0.9, 0.42, 1.3, 0.1, 0.12, 0, wood, 'wood');
    for (let i = 0; i < 3; i++) {
      const x = -0.4 + i * 0.4;
      F.rod(x, 0.14, 0.42, x + F.rr(-0.04, 0.04), 2.24, 0.42, 0.028, F.col('timberUmber'), 'wood');
      F.cone(x, 2.24, 0.42, 0.055, 0.2, 0, F.col('blackIron'), 'metal');
    }
  }
});

FURN({
  key: 'voth_sawyer_yard', name: "Carpenter's Sawyer Yard", culture: 'voth', type: 'workstation', setting: 'outdoor',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { front: 1.2, left: 0.8, right: 0.8 },
  materials: ['timber', 'bark', 'metal'],
  w: 4, d: 3, h: 1.8, variants: 1,
  build: function (F) {
    const wood = F.col('timberUmberLight'), legC = F.col('timberUmber');
    /* stack of sawn boards, stickered between courses */
    for (let i = 0; i < 6; i++) {
      const ry = i % 2 === 0 ? 0 : Math.PI / 2;
      F.box(-1.2, i * 0.3, 0, 1.8, 0.26, 0.5, ry, F.shade(wood, F.rr(-0.05, 0.05)), 'wood');
      if (i % 2 === 1) F.box(-1.2, i * 0.3 + 0.26, 0, 1.9, 0.04, 0.08, ry, F.shade(wood, -0.15), 'wood');
    }
    /* two sawhorse trestles with splayed legs, and a log across them */
    for (let t = -1; t <= 1; t += 2) {
      const tz = t * 1.0;
      F.beam(0.75, 0.68, tz, 0.42, 0, tz - 0.28, 0.1, 0.1, legC, 'wood');
      F.beam(0.75, 0.68, tz, 1.08, 0, tz + 0.28, 0.1, 0.1, legC, 'wood');
      F.beam(0.75, 0.68, tz, 0.9, 0, tz - 0.28, 0.1, 0.1, legC, 'wood');
      F.box(0.75, 0.3, tz, 0.9, 0.06, 0.08, 0, F.shade(legC, -0.1), 'wood');
    }
    F.rod(0.75, 0.85, -1.4, 0.75, 0.85, 1.4, 0.17, F.shade(wood, -0.08), 'bark');
    /* pit saw resting in the kerf, wedges, sawdust and a chopping block */
    F.box(0.75, 1.02, 0.18, 0.09, 0.3, 1.3, 0.06, F.col('pewter'), 'metal');
    F.rod(0.75, 1.3, -0.5, 0.75, 1.55, -0.62, 0.05, legC, 'wood');
    for (let i = 0; i < 4; i++) F.blob(F.rr(-1.8, 1.8), 0.04, F.rr(-1.2, 1.2), F.rr(0.14, 0.24), 0.08, F.rr(0, F.TAU), F.col('timberSand'), 'wood');
    F.box(1.55, 0, 1.1, 0.36, 0.18, 0.5, F.rr(0, F.TAU), wood, 'wood');
    F.box(-1.75, 0, 1.2, 0.5, 0.42, 0.5, 0.2, legC, 'wood');
    F.rod(-1.75, 0.42, 1.2, -1.55, 0.86, 1.3, 0.04, legC, 'wood');
  }
});

FURN({
  key: 'voth_loom_display', name: "Weaver's Loom & Cloth Display", culture: 'voth', type: 'loom', setting: 'both',
  rooms: ['workshop', 'market'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'cloth'],
  w: 3.4, d: 3, h: 2.2, variants: 1,
  build: function (F) {
    F.shift(0, -0.36); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberUmber'), warm = F.shade(wood, 0.15);
    const hues = F.cols(['clothOrange', 'clothCrimson', 'clothTeal', 'clothGold']);
    /* upright loom: two side frames set apart in z, cross members between them */
    for (let t = 0; t < 2; t++) {
      const z = -0.95 + t * 0.75;
      F.cyl(-1.5, 0, z, 0.1, 2.0, 0, wood, 'wood');
      F.cyl(1.5, 0, z, 0.1, 2.0, 0, wood, 'wood');
      F.box(0, 1.94, z, 3.2, 0.13, 0.13, 0, wood, 'wood');
      F.box(0, 0.1, z, 3.0, 0.11, 0.11, 0, F.shade(wood, -0.12), 'wood');
    }
    F.beam(-1.5, 1.9, -0.95, -1.5, 1.9, -0.2, 0.09, 0.09, wood, 'wood');
    F.beam(1.5, 1.9, -0.95, 1.5, 1.9, -0.2, 0.09, 0.09, wood, 'wood');
    /* warp, breast beam, heddle rod and a shuttle parked on it */
    F.box(0, 0.55, -0.58, 2.6, 1.3, 0.26, 0, F.col('clothLinen'), 'cloth');
    F.rod(-1.45, 1.55, -0.58, 1.45, 1.55, -0.58, 0.06, warm, 'wood');
    F.rod(-1.45, 0.95, -0.4, 1.45, 0.95, -0.4, 0.045, warm, 'wood');
    F.box(0, 0.24, -0.58, 2.7, 0.3, 0.32, 0, F.pick(hues), 'cloth');
    F.box(0.3, 0.98, -0.34, 0.3, 0.06, 0.07, 0.1, warm, 'wood');
    /* weaver's bench in front of the loom */
    F.box(0, 0.42, 0.15, 1.5, 0.09, 0.34, 0, warm, 'wood');
    F.box(-0.6, 0, 0.15, 0.12, 0.42, 0.3, 0, F.shade(warm, -0.15), 'wood');
    F.box(0.6, 0, 0.15, 0.12, 0.42, 0.3, 0, F.shade(warm, -0.15), 'wood');
    /* cloth display rack at the front: posts, rail, hanging bolts, a folded pile */
    F.cyl(-1.2, 0, 1.3, 0.08, 1.75, 0, wood, 'wood');
    F.cyl(1.2, 0, 1.3, 0.08, 1.75, 0, wood, 'wood');
    F.rod(-1.2, 1.72, 1.3, 1.2, 1.72, 1.3, 0.05, warm, 'wood');
    for (let i = 0; i < 3; i++) {
      F.box(-0.8 + i * 0.8, 0.62, 1.3, 0.42, 1.1, 0.07, F.rr(-0.04, 0.04), hues[i], 'cloth');
    }
    F.box(0, 0, 1.5, 1.1, 0.22, 0.5, 0, F.pick(hues), 'cloth');
    F.box(0, 0.22, 1.5, 0.95, 0.18, 0.44, 0.1, F.pick(hues), 'cloth');
  }
});

FURN({
  key: 'voth_craft_fisher', name: 'Guild-row Craft Yard - Fisher', culture: 'voth', type: 'workstation', setting: 'outdoor',
  rooms: ['yard', 'dock', 'street'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'cloth'],
  w: 3.5, d: 3, h: 2.2, variants: 1,
  build: function (F) {
    F.shift(0, -0.26); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberUmber');
    /* net drying frame at the back, with cords hung off the rail */
    F.cyl(-1.4, 0, -1.2, 0.09, 2.1, 0, wood, 'wood');
    F.cyl(1.4, 0, -1.2, 0.09, 2.1, 0, wood, 'wood');
    F.rod(-1.4, 2.06, -1.2, 1.4, 2.06, -1.2, 0.05, wood, 'wood');
    F.box(0, 1.2, -1.2, 2.8, 0.85, 0.05, 0, F.col('clothTaupe'), 'cloth');
    for (let i = 0; i < 3; i++) {
      F.rod(-1.0 + i * 1.0, 2.02, -1.2, -1.1 + i * 1.0, 0.55, -1.16, 0.015, F.col('clothGrey'), 'cloth');
      F.ball(-1.1 + i * 1.0, 0.6, -1.16, 0.07, F.col('timberBirch'), 'wood');
    }
    /* line of split fish drying across the front */
    F.cyl(-1.0, 0, 0.9, 0.08, 1.7, 0, wood, 'wood');
    F.cyl(1.0, 0, 0.9, 0.08, 1.7, 0, wood, 'wood');
    F.rod(-1.0, 1.66, 0.9, 1.0, 1.66, 0.9, 0.025, F.col('clothGrey'), 'cloth');
    for (let i = 0; i < 3; i++) {
      F.box(-0.6 + i * 0.6, 1.05, 0.9, 0.14, 0.52, 0.04, F.rr(-0.1, 0.1), F.col('timberBirch'), 'cloth');
    }
    /* salting barrels, a creel and a lobster pot */
    const barrel = F.col('timberUmberLight');
    F.cyl(0.2, 0, 1.5, 0.3, 0.6, 0, barrel, 'wood');
    F.cyl(0.2, 0.6, 1.5, 0.28, 0.05, 0, F.shade(barrel, -0.2), 'wood');
    F.cyl(-0.55, 0, 1.5, 0.3, 0.6, 0, barrel, 'wood');
    F.cyl(-0.2, 0.6, 1.5, 0.3, 0.55, 0, F.shade(barrel, 0.05), 'wood');
    for (let i = 0; i < 2; i++) {
      F.rod(-0.2 + Math.cos(i * 3.1) * 0.3, 1.15, 1.5 + Math.sin(i * 3.1) * 0.3, -0.2, 1.5, 1.5, 0.02, F.shade(barrel, -0.1), 'wood');
    }
    F.dome(1.35, 0, 0.9, 0.38, 0.4, 0, F.col('timberKhaki'), 'wood');
    F.rod(-1.5, 0.05, 1.1, -1.0, 1.9, -0.4, 0.045, wood, 'wood');
    F.box(-1.5, 0.02, 1.15, 0.16, 0.05, 0.4, 0.2, F.col('clothMud'), 'wood');
  }
});

FURN({
  key: 'voth_craft_miner', name: 'Guild-row Craft Yard - Miner', culture: 'voth', type: 'workstation', setting: 'outdoor',
  rooms: ['yard', 'street'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 3.5, d: 3, h: 2.2, variants: 1,
  build: function (F) {
    F.shift(0, -0.28); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberUmber'), metal = F.col('steel');
    /* headframe with a hoist wheel and a rope down to a kibble */
    F.cyl(-1.2, 0, -1.1, 0.1, 2.05, 0, wood, 'wood');
    F.cyl(1.2, 0, -1.1, 0.1, 2.05, 0, wood, 'wood');
    F.box(0, 2.02, -1.1, 2.6, 0.14, 0.14, 0, wood, 'wood');
    F.beam(-1.2, 1.4, -1.1, -0.45, 1.98, -1.1, 0.08, 0.08, wood, 'wood');
    F.beam(1.2, 1.4, -1.1, 0.45, 1.98, -1.1, 0.08, 0.08, wood, 'wood');
    F.rod(0, 1.45, -1.22, 0, 1.45, -0.98, 0.32, metal, 'metal');
    F.rod(0, 1.45, -1.1, 0, 0.58, -1.1, 0.015, F.col('clothMud'), 'cloth');
    F.cyl(0, 0.2, -1.1, 0.24, 0.38, 0, F.shade(metal, -0.1), 'metal');
    for (let i = 0; i < 2; i++) F.blob(F.rr(-0.14, 0.14), 0.56, -1.1 + F.rr(-0.14, 0.14), 0.09, 0.08, 0, F.col('stoneTaupe'), 'stone');
    /* sorting table with ore, and a sledge leaning on it */
    F.box(0, 0.5, 0.5, 1.3, 0.12, 0.85, 0, F.col('clothMud'), 'wood');
    for (let s = -1; s <= 1; s += 2) {
      for (let t = -1; t <= 1; t += 2) F.box(s * 0.55, 0, 0.5 + t * 0.33, 0.1, 0.5, 0.1, 0, F.shade(wood, -0.1), 'wood');
    }
    for (let i = 0; i < 3; i++) F.box(-0.4 + i * 0.4, 0.62, 0.4 + F.rr(-0.2, 0.2), 0.18, 0.14, 0.18, F.rr(0, F.TAU), F.col('stoneGrey'), 'stone');
    F.rod(0.65, 0.64, 0.9, 0.95, 1.25, 1.1, 0.035, wood, 'wood');
    F.box(0.65, 0.6, 0.9, 0.22, 0.1, 0.1, 0, F.col('iron'), 'metal');
    /* ore cart on its rails */
    F.box(1.25, 0.3, 1.25, 0.72, 0.42, 0.52, 0, F.col('timberUmber'), 'wood');
    F.box(1.25, 0.72, 1.25, 0.66, 0.06, 0.46, 0, F.col('pewter'), 'stone');
    F.rod(0.95, 0.15, 1.05, 0.95, 0.15, 1.45, 0.15, F.col('blackIron'), 'metal');
    F.rod(1.55, 0.15, 1.05, 1.55, 0.15, 1.45, 0.15, F.col('blackIron'), 'metal');
    F.rod(0.6, 0.03, 1.08, 1.7, 0.03, 1.08, 0.03, F.col('iron'), 'metal');
    F.rod(0.6, 0.03, 1.42, 1.7, 0.03, 1.42, 0.03, F.col('iron'), 'metal');
    /* pit props and a spoil heap on the flank */
    F.rod(-1.5, 0, 1.1, -1.05, 1.9, 0.85, 0.055, wood, 'wood');
    F.rod(-1.6, 0, 0.85, -1.2, 1.7, 1.3, 0.05, wood, 'wood');
    F.blob(-1.3, 0.14, 1.55, 0.35, 0.28, F.rr(0, F.TAU), F.col('stoneGranite'), 'stone');
  }
});

FURN({
  key: 'voth_craft_brewer', name: 'Guild-row Craft Yard - Brewer', culture: 'voth', type: 'workstation', setting: 'both',
  rooms: ['yard', 'workshop', 'street'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'glass', 'emissive'],
  w: 3.5, d: 3, h: 2.4, variants: 1,
  build: function (F) {
    const wood = F.col('timberUmber'), copper = F.col('copper'), barrel = F.col('timberUmberLight');
    /* penthouse roof over the copper */
    F.cyl(-1.3, 0, -1.05, 0.09, 2.15, 0, wood, 'wood');
    F.cyl(1.3, 0, -1.05, 0.09, 2.15, 0, wood, 'wood');
    F.box(0, 2.12, -0.85, 2.9, 0.14, 1.5, 0, F.col('timberMud'), 'wood');
    for (let i = 0; i < 2; i++) F.box(-0.7 + i * 1.4, 2.26, -0.85, 0.1, 0.06, 1.5, 0, F.shade('timberMud', -0.15), 'wood');
    F.beam(-1.3, 1.5, -1.05, -0.65, 2.08, -1.05, 0.07, 0.07, wood, 'wood');
    F.beam(1.3, 1.5, -1.05, 0.65, 2.08, -1.05, 0.07, 0.07, wood, 'wood');
    /* the copper: hearth, body, hoop bands, domed hat and a swan neck */
    F.cyl(0, 0, -0.6, 0.55, 0.34, 0, F.col('stoneUmberLight'), 'stone');
    F.cone(0, 0.2, -0.6, 0.18, 0.2, 0, F.col('fire'), 'glow');
    F.cyl(0, 0.34, -0.6, 0.48, 0.78, 0, copper, 'metal');
    F.cyl(0, 0.52, -0.6, 0.5, 0.06, 0, F.shade(copper, -0.2), 'metal');
    F.cyl(0, 0.92, -0.6, 0.5, 0.06, 0, F.shade(copper, -0.2), 'metal');
    F.dome(0, 1.12, -0.6, 0.42, 0.3, 0, F.shade(copper, 0.12), 'metal');
    F.rod(0.2, 1.4, -0.6, 0.72, 1.18, -0.3, 0.05, F.shade(copper, 0.06), 'metal');
    F.rod(0.72, 1.18, -0.3, 0.78, 0.78, 0.05, 0.05, F.shade(copper, 0.06), 'metal');
    F.lamp(0, 0.4, -0.6, 0.6, 7);
    /* barrel stack with iron hoops, a mash tun and a shovel */
    const bp = [[-1.0, 1.05], [0, 1.15], [1.0, 1.05]];
    for (const p of bp) {
      F.cyl(p[0], 0, p[1], 0.3, 0.62, 0, barrel, 'wood');
      F.cyl(p[0], 0.45, p[1], 0.31, 0.05, 0, F.col('iron'), 'metal');
    }
    F.cyl(-0.5, 0.62, 1.1, 0.3, 0.6, 0, F.shade(barrel, 0.04), 'wood');
    F.cyl(0.5, 0.62, 1.1, 0.3, 0.6, 0, F.shade(barrel, -0.04), 'wood');
    F.cyl(0, 1.22, 1.1, 0.3, 0.58, 0, F.shade(barrel, 0.02), 'wood');
    F.cyl(-1.42, 0, 0.15, 0.34, 0.66, 0, F.shade(barrel, -0.08), 'wood');
    F.cyl(-1.42, 0.66, 0.15, 0.3, 0.04, 0, F.col('clothMud'), 'glass');
    F.rod(1.45, 0.05, 0.25, 1.6, 1.2, 0.1, 0.04, wood, 'wood');
    F.box(1.45, 0.02, 0.28, 0.2, 0.06, 0.26, 0.15, F.col('pewter'), 'metal');
  }
});

FURN({
  key: 'voth_craft_tanner', name: 'Guild-row Craft Yard - Tanner', culture: 'voth', type: 'workstation', setting: 'outdoor',
  rooms: ['yard', 'street'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'glass', 'cloth'],
  w: 3.5, d: 3.3, h: 1.8, variants: 1,
  build: function (F) {
    const dark = F.col('stoneEbony'), rim = F.col('stoneGrey'), wood = F.col('timberUmber');
    /* two sunken lime pits with kerbs and scummed liquor */
    for (let s = -1; s <= 1; s += 2) {
      F.cyl(s * 1.0, 0, -0.85, 0.7, 0.22, 0, rim, 'stone');
      F.cyl(s * 1.0, 0.1, -0.85, 0.58, 0.14, 0, dark, 'stone');
      F.cyl(s * 1.0, 0.2, -0.85, 0.54, 0.04, 0, s < 0 ? F.col('glassGranite') : F.col('glassMud'), 'glass');
      F.blob(s * 1.0 + F.rr(-0.2, 0.2), 0.25, -0.85 + F.rr(-0.2, 0.2), 0.16, 0.05, F.rr(0, F.TAU), F.col('stoneTaupe'), 'cloth');
    }
    /* beam-and-knife stand between the pits */
    F.beam(0, 0.9, -0.5, 0, 0.25, 0.25, 0.3, 0.3, F.shade(wood, 0.1), 'wood');
    F.box(0, 0, 0.25, 0.3, 0.26, 0.3, 0, wood, 'wood');
    F.box(0, 0.76, -0.38, 0.34, 0.04, 0.26, 0, F.col('clothGreyDark'), 'cloth');
    /* hide-stretching frame at the front, laced along both edges */
    F.cyl(-1.3, 0, 0.9, 0.09, 1.7, 0, wood, 'wood');
    F.cyl(1.3, 0, 0.9, 0.09, 1.7, 0, wood, 'wood');
    F.rod(-1.3, 1.66, 0.9, 1.3, 1.66, 0.9, 0.05, wood, 'wood');
    F.rod(-1.3, 0.3, 0.9, 1.3, 0.3, 0.9, 0.04, wood, 'wood');
    F.box(0, 0.5, 0.9, 2.2, 1.06, 0.06, 0, F.col('clothBirch'), 'cloth');
    for (let i = 0; i < 3; i++) {
      const x = -1.0 + i * 1.0;
      F.rod(x, 1.62, 0.87, x - 0.06, 1.56, 0.93, 0.012, F.col('clothMud'), 'cloth');
      F.rod(x, 0.34, 0.87, x - 0.06, 0.42, 0.93, 0.012, F.col('clothMud'), 'cloth');
    }
    /* dye tubs and a stack of finished skins */
    const dyes = F.cols(['clothCrimson', 'clothTeal', 'clothGold']);
    for (let i = 0; i < 2; i++) {
      const x = -0.3 + i * 0.7;
      F.cyl(x, 0, 1.4, 0.22, 0.48, 0, F.col('steel'), 'metal');
      F.cyl(x, 0.12, 1.4, 0.23, 0.04, 0, F.shade('steel', -0.2), 'metal');
      F.cyl(x, 0.48, 1.4, 0.2, 0.05, 0, dyes[i], 'glass');
    }
    F.box(1.3, 0, 1.35, 0.6, 0.12, 0.5, 0.1, F.col('clothPine'), 'cloth');
    F.box(1.3, 0.12, 1.35, 0.56, 0.1, 0.46, -0.15, F.col('clothPine'), 'cloth');
  }
});

FURN({
  key: 'voth_craft_scribe', name: 'Guild-row Craft Yard - Scribe', culture: 'voth', type: 'workstation', setting: 'both',
  rooms: ['yard', 'study', 'street'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'cloth'],
  w: 3, d: 2.5, h: 1.8, variants: 1,
  build: function (F) {
    const wood = F.col('timberUmber'), pale = F.col('clothBone');
    /* drying line of sheets under a light awning */
    F.cyl(-1.35, 0, -0.95, 0.08, 1.75, 0, wood, 'wood');
    F.cyl(1.35, 0, -0.95, 0.08, 1.75, 0, wood, 'wood');
    F.box(0, 1.72, -0.95, 2.8, 0.1, 0.1, 0, wood, 'wood');
    F.box(0, 1.6, -0.6, 2.7, 0.06, 0.8, 0.08, F.col('clothLinen'), 'cloth');
    for (let i = 0; i < 3; i++) {
      F.box(-0.85 + i * 0.85, 1.02, -0.95, 0.38, 0.62, 0.03, F.rr(-0.06, 0.06), pale, 'cloth');
      F.rod(-0.85 + i * 0.85, 1.7, -0.95, -0.85 + i * 0.85, 1.62, -0.95, 0.012, F.col('clothMud'), 'cloth');
    }
    /* writing desk: top, four legs, stretcher, and a sloped board on it */
    F.box(0, 0.6, 0.68, 1.5, 0.08, 0.7, 0, F.col('timberMud'), 'wood');
    for (let s = -1; s <= 1; s += 2) {
      for (let t = -1; t <= 1; t += 2) F.box(s * 0.62, 0, 0.68 + t * 0.26, 0.1, 0.6, 0.1, 0, F.shade(wood, 0.05), 'wood');
    }
    F.box(0, 0.24, 0.68, 1.3, 0.07, 0.08, 0, F.shade(wood, -0.1), 'wood');
    F.beam(0, 0.86, 0.44, 0, 0.7, 0.95, 1.4, 0.05, F.col('clothMud'), 'wood');
    F.box(0, 0.68, 0.42, 1.45, 0.06, 0.07, 0, F.shade(wood, 0.1), 'wood');
    F.beam(-0.25, 0.9, 0.5, -0.25, 0.79, 0.85, 0.42, 0.02, pale, 'cloth');
    F.cyl(0.45, 0.68, 0.5, 0.07, 0.1, 0, F.col('stoneEbony'), 'stone');
    F.rod(0.45, 0.78, 0.5, 0.58, 1.04, 0.6, 0.014, F.col('clothBone'), 'cloth');
    /* scroll chest and a rack of cases, so the flanks read too */
    F.box(-1.15, 0, 0.9, 0.55, 0.42, 0.6, 0.12, F.col('timberMud'), 'wood');
    F.box(-1.15, 0.42, 0.9, 0.58, 0.08, 0.63, 0.12, F.shade('timberMud', -0.15), 'wood');
    for (let i = 0; i < 3; i++) F.rod(1.1, 0.06 + i * 0.13, 0.75, 1.1, 0.06 + i * 0.13, 1.25, 0.06, F.col('clothLinen'), 'cloth');
  }
});

FURN({
  key: 'voth_sacrifice_altar', name: 'Temple Sacrifice Altar', culture: 'voth', type: 'altar', setting: 'both',
  rooms: ['temple', 'shrine', 'court'], anchor: 'floor', clearance: { front: 2 },
  materials: ['timber', 'stone', 'metal', 'glass', 'emissive'],
  w: 6, d: 5, h: 3.5, variants: 1,
  build: function (F) {
    F.shift(0, -0.35); /* centre the footprint on the origin (verify.py declared-size) */
    const stone = F.col('stoneGrey'), cut = F.col('stoneUmber'), wood = F.col('timberWalnut'), gold = F.col('clothGold');
    /* three-step approach at the front */
    F.box(0, 0, 2.6, 4.2, 0.3, 0.6, 0, F.shade(stone, -0.05), 'stone');
    F.box(0, 0.3, 2.2, 3.8, 0.3, 0.5, 0, F.shade(stone, -0.05), 'stone');
    /* altar mass: base course, die, cornice and a channelled mensa */
    F.box(0, 0, 0.5, 4.2, 0.35, 3.2, 0, F.shade(stone, -0.12), 'stone');
    F.box(0, 0.35, 0.5, 3.8, 1.75, 2.8, 0, stone, 'stone');
    F.box(0, 2.1, 0.5, 4.2, 0.22, 3.2, 0, F.shade(stone, 0.05), 'stone');
    F.box(0, 2.32, 0.5, 3.9, 0.12, 2.9, 0, F.shade(stone, -0.02), 'stone');
    F.box(0, 2.42, 0.5, 3.2, 0.05, 0.22, 0, F.col('stoneWine'), 'stone');
    F.cyl(0, 2.42, 0.5, 0.42, 0.24, 0, F.col('stoneWine'), 'stone');
    F.cyl(0, 2.6, 0.5, 0.34, 0.06, 0, F.col('glassCrimson'), 'glass');
    /* carved panels on every face of the die */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      const rx = Math.sin(a) * (i % 2 === 0 ? 1.42 : 1.92);
      const rz = Math.cos(a) * (i % 2 === 0 ? 1.42 : 1.92);
      if (i % 2 === 0) F.box(rx, 0.75, 0.5 + rz, 2.4, 0.95, 0.06, a, cut, 'stone');
    }
    /* four tall torch posts with pans and flame */
    const corners = [[-2.6, -1.9], [2.6, -1.9], [-2.6, 1.5], [2.6, 1.5]];
    for (const c of corners) {
      F.box(c[0], 0, c[1], 0.36, 0.14, 0.36, 0, F.shade(stone, -0.1), 'stone');
      F.cyl(c[0], 0.14, c[1], 0.09, 2.4, 0, wood, 'wood');
      F.frustum(c[0], 2.54, c[1], 0.13, 0.3, 0.18, 0, gold, 'metal', 8);
      F.cone(c[0], 2.68, c[1], 0.2, 0.62, 0, F.col('fire'), 'glow');
      F.lamp(c[0], 2.9, c[1], 1.0, 10);
    }
  }
});

FURN({
  key: 'voth_grave_tomb', name: 'Grave Marker / Family Tomb', culture: 'voth', type: 'tomb', setting: 'outdoor',
  rooms: ['graveyard'], anchor: 'floor', clearance: { front: 1 },
  materials: ['stone', 'plaster', 'glass', 'foliage', 'emissive'],
  w: 6, d: 6, h: 5, variants: 2,
  variantDims: [{ w: 1.7, d: 1.7, h: 1.45 }, { w: 6, d: 6, h: 5 }],
  build: function (F) {
    const stone = F.col('stoneGrey'), cut = F.col('stoneGraphite');
    if (F.variant === 0) {
      /* a single grave: kerbed plot, headstone, footstone and offerings */
      F.box(0, 0, 0, 1.6, 0.1, 1.6, 0, F.shade(stone, -0.2), 'stone');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.box(Math.sin(a) * 0.74, 0.1, Math.cos(a) * 0.74, 1.6, 0.14, 0.14, a, F.shade(stone, -0.05), 'stone');
      }
      F.blob(0, 0.2, 0.1, 0.58, 0.2, 0, F.col('timberUmber'), 'plaster');
      /* headstone: base, shouldered slab, moulded cap, inscription on both faces */
      F.box(0, 0.1, -0.56, 0.72, 0.18, 0.3, 0, F.shade(stone, -0.12), 'stone');
      F.box(0, 0.28, -0.56, 0.54, 0.82, 0.14, 0, F.shade(stone, 0.02), 'stone');
      F.dome(0, 1.1, -0.56, 0.27, 0.2, 0, F.shade(stone, 0.06), 'stone');
      F.box(0, 0.44, -0.47, 0.38, 0.5, 0.05, 0, cut, 'stone');
      F.box(0, 0.5, -0.65, 0.34, 0.34, 0.04, 0, cut, 'stone');
      F.cyl(0, 1.3, -0.56, 0.07, 0.1, 0, F.shade(stone, 0.1), 'stone');
      /* footstone, an offering bowl with a candle, and creeping growth */
      F.box(0, 0.1, 0.62, 0.34, 0.26, 0.1, 0, F.shade(stone, -0.08), 'stone');
      F.cyl(0.42, 0.1, -0.1, 0.16, 0.12, 0, F.shade(stone, -0.05), 'stone');
      F.cyl(0.42, 0.2, -0.1, 0.13, 0.04, 0, F.col('glassGranite'), 'glass');
      F.cyl(-0.42, 0.1, -0.12, 0.1, 0.2, 0, F.col('plasterBone'), 'plaster');
      F.ball(-0.42, 0.33, -0.12, 0.045, F.col('flame'), 'glow');
      F.blob(0.2, 0.24, 0.34, 0.16, 0.18, F.rr(0, F.TAU), F.col('leafOlive'), 'leafy');
      F.blob(-0.25, 0.2, 0.42, 0.13, 0.12, F.rr(0, F.TAU), F.col('leafOliveLight'), 'leafy');
      F.lamp(0, 0.4, 0, 0.35, 4);
    } else {
      /* family tomb: stepped podium, sarcophagus body, ribbed dome */
      F.box(0, 0, 0, 6, 0.4, 6, 0, F.shade(stone, -0.15), 'stone');
      F.box(0, 0.4, 0, 5.6, 0.3, 5.6, 0, F.shade(stone, -0.05), 'stone');
      F.box(0, 0.7, 0, 5.1, 2.3, 5.1, 0, stone, 'stone');
      F.box(0, 3.0, 0, 5.7, 0.36, 5.7, 0, F.shade(stone, -0.05), 'stone');
      F.box(0, 3.36, 0, 5.1, 0.18, 5.1, 0, F.shade(stone, 0.04), 'stone');
      /* doorway: jambs, lintel, recessed leaf and a threshold */
      F.box(-0.85, 0.7, 2.56, 0.5, 2.3, 0.14, 0, F.shade(stone, 0.06), 'stone');
      F.box(0.85, 0.7, 2.56, 0.5, 2.3, 0.14, 0, F.shade(stone, 0.06), 'stone');
      F.box(0, 2.6, 2.56, 2.2, 0.4, 0.16, 0, F.shade(stone, 0.08), 'stone');
      F.box(0, 0.7, 2.52, 1.2, 1.9, 0.06, 0, F.col('stoneEbony'), 'stone');
      F.box(0, 0.62, 2.74, 1.8, 0.1, 0.5, 0, F.shade(stone, -0.1), 'stone');
      /* inscription band and pilasters on the three blind faces */
      for (let i = 1; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.box(Math.sin(a) * 2.58, 1.9, Math.cos(a) * 2.58, 3.6, 0.5, 0.06, a, cut, 'stone');
        F.box(Math.sin(a) * 2.58 + Math.cos(a) * 1.7, 0.7, Math.cos(a) * 2.58 - Math.sin(a) * 1.7, 0.4, 2.3, 0.14, a, F.shade(stone, 0.06), 'stone');
        F.box(Math.sin(a) * 2.58 - Math.cos(a) * 1.7, 0.7, Math.cos(a) * 2.58 + Math.sin(a) * 1.7, 0.4, 2.3, 0.14, a, F.shade(stone, 0.06), 'stone');
      }
      F.dome(0, 3.54, 0, 2.3, 1.16, 0, F.shade(stone, 0.05), 'stone');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.rod(Math.cos(a) * 2.26, 3.6, Math.sin(a) * 2.26, Math.cos(a) * 0.5, 4.64, Math.sin(a) * 0.5, 0.07, F.shade(stone, -0.06), 'stone');
      }
      F.cyl(0, 4.62, 0, 0.26, 0.16, 0, F.shade(stone, -0.05), 'stone');
      F.cone(0, 4.78, 0, 0.22, 0.22, 0, F.shade(stone, 0.12), 'stone');
      /* corner acroteria and offerings at the step */
      F.cyl(-1.6, 0.7, 2.75, 0.22, 0.34, 0, F.shade(stone, -0.08), 'stone');
      F.ball(-1.6, 1.12, 2.75, 0.09, F.col('flame'), 'glow');
      F.blob(1.6, 0.9, 2.75, 0.26, 0.34, F.rr(0, F.TAU), F.col('leafOlive'), 'leafy');
      F.lamp(0, 1.4, 3.0, 0.6, 9);
    }
  }
});

FURN({
  key: 'voth_well', name: 'Well (Monastery/Canton)', culture: 'voth', type: 'well', setting: 'outdoor',
  rooms: ['court', 'yard', 'plaza'], anchor: 'floor', clearance: { front: 1, back: 1, left: 1, right: 1 },
  materials: ['timber', 'stone', 'metal', 'glass', 'cloth'],
  w: 3, d: 3, h: 3, variants: 1,
  build: function (F) {
    const stone = F.col('stoneGrey'), wood = F.col('timberWalnut'), iron = F.col('iron');
    /* kerb: base course, drum of coursed stone, moulded coping */
    F.cyl(0, 0, 0, 1.38, 0.16, 0, F.shade(stone, -0.15), 'stone');
    F.cyl(0, 0.16, 0, 1.18, 0.42, 0, stone, 'stone');
    F.cyl(0, 0.58, 0, 1.22, 0.06, 0, F.shade(stone, -0.12), 'stone');
    F.cyl(0, 0.64, 0, 1.16, 0.36, 0, F.shade(stone, 0.03), 'stone');
    F.cyl(0, 1.0, 0, 1.36, 0.16, 0, F.shade(stone, -0.05), 'stone');
    F.cyl(0, 1.1, 0, 0.98, 0.06, 0, F.col('glassCharcoal'), 'glass');
    /* eight facing stones round the drum, so the kerb reads from any angle */
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6;
      F.box(Math.cos(a) * 1.2, 0.2 + (i % 2) * 0.34, Math.sin(a) * 1.2, 0.4, 0.3, 0.08, -a - Math.PI / 2, F.shade(stone, i % 2 ? 0.06 : -0.06), 'stone');
    }
    /* windlass frame: two posts, braces, a barrel with a crank, and a bucket */
    for (let s = -1; s <= 1; s += 2) {
      F.cyl(s * 1.05, 1.16, 0, 0.09, 1.1, 0, wood, 'wood');
      F.beam(s * 1.05, 2.0, 0, s * 0.62, 2.26, 0, 0.07, 0.07, wood, 'wood');
    }
    F.box(0, 2.26, 0, 2.4, 0.12, 0.12, 0, wood, 'wood');
    F.rod(-0.72, 1.88, 0, 0.72, 1.88, 0, 0.13, F.shade(wood, 0.1), 'wood');
    F.rod(0.78, 1.88, 0, 0.98, 1.88, 0, 0.04, iron, 'metal');
    F.rod(0.98, 1.88, 0, 0.98, 1.66, 0.14, 0.035, iron, 'metal');
    F.rod(0, 1.82, 0, 0, 1.3, 0.02, 0.016, F.col('clothMud'), 'cloth');
    F.cyl(0, 1.02, 0.02, 0.17, 0.26, 0, F.col('timberUmberLight'), 'wood');
    F.cyl(0, 1.08, 0.02, 0.18, 0.04, 0, iron, 'metal');
    /* shingled roof with a plate and a finial */
    F.box(0, 2.3, 0, 2.5, 0.06, 2.4, 0, F.shade('timberUmberLight', -0.18), 'wood');
    F.pyrRoof(0, 2.34, 0, 2.9, 0.52, 2.8, 0, F.col('timberUmberLight'), 'wood');
    F.cone(0, 2.86, 0, 0.12, 0.14, 0, F.shade('timberUmberLight', 0.15), 'wood');
  }
});

FURN({
  key: 'voth_pen_coop', name: 'Animal Pen & Chicken Coop', culture: 'voth', type: 'pen', setting: 'outdoor',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'stone', 'plaster', 'foliage'],
  w: 5, d: 5, h: 2.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut');
    const half = 2.2;
    const corners = [[-half, -half], [half, -half], [-half, half], [half, half]];
    for (const c of corners) {
      F.cyl(c[0], 0, c[1], 0.09, 1.27, 0, wood, 'wood');
    }
    /* three rails a side, on all four runs, plus intermediate stakes */
    for (let r = 0; r < 2; r++) {
      const y = 0.34 + r * 0.46;
      F.box(0, y, -half, 4.4, 0.11, 0.06, 0, F.shade(wood, r % 2 ? 0.04 : -0.04), 'wood');
      F.box(0, y, half, 4.4, 0.11, 0.06, 0, F.shade(wood, r % 2 ? 0.04 : -0.04), 'wood');
      F.box(-half, y, 0, 0.06, 0.11, 4.4, 0, F.shade(wood, r % 2 ? -0.04 : 0.04), 'wood');
      F.box(half, y, 0, 0.06, 0.11, 4.4, 0, F.shade(wood, r % 2 ? -0.04 : 0.04), 'wood');
    }
    /* gate on the front run: two tall posts, a lintel and a braced leaf */
    F.cyl(-0.8, 0, half, 0.11, 1.9, 0, F.shade(wood, 0.06), 'wood');
    F.cyl(0.8, 0, half, 0.11, 1.9, 0, F.shade(wood, 0.06), 'wood');
    F.box(0, 1.9, half, 1.9, 0.14, 0.14, 0, F.shade(wood, 0.06), 'wood');
    F.box(0, 0.94, half, 1.5, 0.1, 0.06, 0, wood, 'wood');
    F.beam(-0.7, 0.28, half, 0.7, 1.0, half, 0.08, 0.05, F.shade(wood, -0.06), 'wood');
    F.blob(0, 2.1, half, 0.16, 0.2, 0, F.col('leafMustard'), 'leafy');
    /* lean-to shelter in the far corner */
    F.box(-1.6, 1.1, -1.6, 1.5, 0.08, 1.3, 0.15, F.shade(wood, -0.1), 'wood');
    F.box(-1.6, 0.3, -1.6, 1.0, 0.3, 0.4, 0, wood, 'wood');
    F.cyl(-2.1, 0, -1.1, 0.06, 1.1, 0, wood, 'wood');
    F.blob(-1.6, 0.1, -1.0, 0.4, 0.16, F.rr(0, F.TAU), F.col('leafOchreDark'), 'leafy');
    /* raised coop: legs, floor, body, door, hatch, roof, ramp and a perch */
    const legC = F.col('timberUmber'), plaster = F.col('clothLinen');
    const hp = [[1.2, 1.2], [1.7, 1.2], [1.2, 1.7], [1.7, 1.7]];
    for (const p of hp) F.cyl(p[0], 0, p[1], 0.05, 0.5, 0, legC, 'wood');
    F.box(1.45, 0.46, 1.45, 1.1, 0.07, 1.1, 0, legC, 'wood');
    F.box(1.45, 0.53, 1.45, 1.0, 0.68, 1.0, 0, plaster, 'plaster');
    F.box(1.45, 0.62, 1.96, 0.36, 0.42, 0.06, 0, F.shade(legC, -0.1), 'wood');
    F.box(0.94, 0.75, 1.45, 0.05, 0.2, 0.24, 0, F.col('stoneEbony'), 'stone');
    F.pyrRoof(1.45, 1.21, 1.45, 1.24, 0.34, 1.24, 0, F.shade(plaster, -0.28), 'wood');
    F.cone(1.45, 1.55, 1.45, 0.08, 0.14, 0, F.shade(legC, 0.1), 'wood');
    F.box(1.45, 0.1, 2.1, 0.4, 0.06, 0.95, -0.5, wood, 'wood');
    F.cyl(0.6, 0, 1.45, 0.05, 0.85, 0, legC, 'wood');
    F.rod(0.6, 0.86, 1.45, 1.0, 0.86, 1.45, 0.045, F.shade(wood, 0.15), 'wood');
  }
});

FURN({
  key: 'voth_lantern_fixture', name: 'Static Lantern Fixture', culture: 'voth', type: 'lamp', setting: 'both',
  rooms: ['street', 'court', 'hall'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'stone', 'metal', 'glass', 'emissive'],
  /* one variant: the post lantern. The wall bracket that was variant 2 is now its own
     key, voth_lantern_bracket (anchor: 'wall'). variantDims[1] and variant: 1 still
     build the bracket, so old callers keep working; the sheet shows variant 1 only. */
  w: 0.6, d: 0.6, h: 2.4, variants: 1, variantNames: ['post'],
  variantDims: [{ w: 0.6, d: 0.6, h: 2.4 }, { w: 0.55, d: 0.9, h: 2.05 }],
  build: function (F) {
    if (F.variant === 1) F.shift(0, -0.39); /* centre the footprint on the origin (verify.py declared-size) */
    const iron = F.col('ironDark'), wood = F.col('timberWalnut'), brass = F.col('brass');
    /* the lantern proper: pan, corner bars, glazed panels, flame, cap and finial */
    const cage = function (cx, cy, cz, r, hh) {
      F.box(cx, cy, cz, r * 2.1, 0.05, r * 2.1, 0, iron, 'metal');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4 + Math.PI / 4;
        F.rod(cx + Math.cos(a) * r, cy + 0.04, cz + Math.sin(a) * r,
          cx + Math.cos(a) * r, cy + hh, cz + Math.sin(a) * r, 0.018, iron, 'metal');
      }
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.box(cx + Math.sin(a) * r * 0.99, cy + 0.05, cz + Math.cos(a) * r * 0.99,
          r * 1.4, hh - 0.08, 0.02, a, F.col('glassChalk'), 'glass');
      }
      F.cyl(cx, cy + 0.07, cz, r * 0.5, 0.05, 0, F.shade(brass, -0.2), 'metal');
      F.cone(cx, cy + 0.1, cz, r * 0.4, hh * 0.6, 0, F.col('amberLight'), 'glow');
      F.cone(cx, cy + hh * 0.4, cz, r * 0.2, hh * 0.3, 0, F.col('candle'), 'glow');
      F.pyrRoof(cx, cy + hh, cz, r * 2.3, 0.16, r * 2.3, 0, iron, 'metal');
      F.ball(cx, cy + hh + 0.2, cz, 0.05, brass, 'metal');
      F.lamp(cx, cy + hh * 0.5, cz, 1.0, 10);
    };
    if (F.variant === 0) {
      /* free-standing post lantern */
      F.box(0, 0, 0, 0.58, 0.14, 0.58, 0, F.col('stoneTaupe'), 'stone');
      F.frustum(0, 0.14, 0, 0.26, 0.15, 0.18, 0, F.shade(wood, -0.1), 'wood', 8);
      F.cyl(0, 0.32, 0, 0.075, 1.36, 0, wood, 'wood');
      for (let i = 0; i < 2; i++) F.cyl(0, 0.6 + i * 0.8, 0, 0.09, 0.05, 0, iron, 'metal');
      F.cyl(0, 1.68, 0, 0.11, 0.07, 0, iron, 'metal');
      /* four scroll brackets under the lantern, one to each side */
      for (let i = 0; i < 2; i++) {
        const a = i * Math.PI;
        F.rod(Math.cos(a) * 0.05, 1.54, Math.sin(a) * 0.05, Math.cos(a) * 0.2, 1.76, Math.sin(a) * 0.2, 0.016, iron, 'metal');
      }
      cage(0, 1.75, 0, 0.2, 0.4);
    } else {
      /* wall bracket: backplate, bolts, raking arm and a hung lantern */
      F.box(0, 1.35, -0.02, 0.28, 0.65, 0.05, 0, iron, 'metal');
      F.box(0, 1.5, -0.03, 0.52, 0.1, 0.04, 0, F.shade(iron, 0.15), 'metal');
      for (let s = -1; s <= 1; s += 2) F.ball(s * 0.09, 1.9, 0.02, 0.035, brass, 'metal');
      F.beam(0, 1.94, 0.02, 0, 1.94, 0.6, 0.06, 0.06, iron, 'metal');
      F.beam(0, 1.45, 0.04, 0, 1.9, 0.48, 0.04, 0.04, iron, 'metal');
      F.rod(0, 1.92, 0.6, 0, 1.76, 0.6, 0.014, iron, 'metal');
      F.cone(0, 1.94, 0.1, 0.05, 0.1, 0, brass, 'metal');
      cage(0, 1.36, 0.6, 0.2, 0.4);
    }
  }
});

FURN({
  key: 'voth_lantern_bracket', name: 'Wall Lantern Bracket', culture: 'voth', type: 'lamp', setting: 'both',
  rooms: ['street', 'court', 'hall', 'tavern'], anchor: 'wall', clearance: {},
  materials: ['metal', 'glass', 'emissive'],
  w: 0.55, d: 0.9, h: 2.05, variants: 1,
  /* the wall bracket split out of voth_lantern_fixture (its variant 2): backplate at
     local z = -d/2, arm and hung lantern out to the front. Same code, same look. */
  build: function (F) { F.variant = 1; FURN_BY_KEY.voth_lantern_fixture.build(F); }
});

/* ---------- interior additions (2026-10): tavern furniture, shrine furniture, surface pieces ---------- */

FURN({
  key: 'voth_tavern_table', name: 'Tavern Trestle Table', culture: 'voth', type: 'table', setting: 'indoor',
  rooms: ['tavern', 'hall', 'barracks'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['timber', 'metal'],
  w: 2.0, d: 0.9, h: 0.8, variants: 2, variantNames: ['plain', 'scarred and ringed'],
  build: function (F) {
    const c = F.pick(['timberUmberLight', 'timberMud', 'timberUmber']), iron = F.col('iron');
    const legC = F.shade(c, -0.2);
    /* two splayed trestles, a through-tenoned stretcher wedged at each end */
    for (const s of [-1, 1]) {
      const x = s * 0.74;
      F.beam(x, 0, -0.3, x, 0.72, -0.08, 0.11, 0.09, legC, 'wood');
      F.beam(x, 0, 0.3, x, 0.72, 0.08, 0.11, 0.09, legC, 'wood');
      F.box(x, 0, 0, 0.13, 0.08, 0.76, 0, F.shade(legC, -0.1), 'wood');
      F.box(x, 0.64, 0, 0.12, 0.08, 0.7, 0, legC, 'wood');
      F.box(s * 0.86, 0.24, 0, 0.05, 0.14, 0.05, 0, F.shade(legC, 0.12), 'wood');   /* wedge */
    }
    F.box(0, 0.26, 0, 1.68, 0.1, 0.08, 0, F.shade(c, -0.15), 'wood');
    /* top: three thick planks, iron dogs across the joints */
    for (let i = 0; i < 3; i++) F.box(0, 0.72 + F.rr(0, 0.008), -0.29 + i * 0.29, 2.0, 0.07, 0.28, 0, F.shade(c, F.rr(-0.06, 0.06)), 'wood');
    for (const x of [-0.6, 0.6]) for (const z of [-0.145, 0.145]) F.box(x, 0.792, z, 0.12, 0.006, 0.03, 0, iron, 'metal');
    if (F.variant === 1) {
      for (let i = 0; i < 4; i++) F.cyl(F.rr(-0.8, 0.8), 0.793, F.rr(-0.3, 0.3), F.rr(0.04, 0.06), 0.003, 0, F.shade(c, -0.3), 'wood');
      F.box(F.rr(-0.5, 0.5), 0.793, F.rr(-0.2, 0.2), 0.3, 0.003, 0.012, F.rr(-0.5, 0.5), F.shade(c, -0.35), 'wood');
    }
  }
});

FURN({
  key: 'voth_tavern_bench', name: 'Tavern Bench', culture: 'voth', type: 'bench', setting: 'indoor',
  rooms: ['tavern', 'hall', 'barracks'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber'],
  w: 1.8, d: 0.36, h: 0.47, variants: 1,
  build: function (F) {
    const c = F.pick(['timberUmberLight', 'timberMud', 'timberUmber']);
    /* a thick plank on two slab legs, a stretcher between, worn at the middle */
    F.box(0, 0.4, 0, 1.8, 0.07, 0.34, 0, c, 'wood');
    F.box(0, 0.468, 0, 0.9, 0.002, 0.24, 0, F.shade(c, 0.08), 'wood');
    for (const s of [-1, 1]) {
      F.box(s * 0.68, 0, 0, 0.08, 0.4, 0.3, 0, F.shade(c, -0.2), 'wood');
      F.box(s * 0.68, 0, 0, 0.1, 0.05, 0.34, 0, F.shade(c, -0.28), 'wood');
    }
    F.box(0, 0.14, 0, 1.28, 0.07, 0.05, 0, F.shade(c, -0.15), 'wood');
  }
});

FURN({
  key: 'voth_tavern_stool', name: 'Three-legged Stool', culture: 'voth', type: 'chair', setting: 'indoor',
  rooms: ['tavern', 'workshop', 'kitchen'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber'],
  w: 0.46, d: 0.46, h: 0.7, variants: 2, variantNames: ['tall', 'low'],
  variantDims: [{ w: 0.46, d: 0.46, h: 0.7 }, { w: 0.42, d: 0.42, h: 0.46 }],
  build: function (F) {
    const c = F.pick(['timberUmberLight', 'timberMud', 'clothMud']);
    const H = F.variant === 1 ? 0.46 : 0.7, R = F.variant === 1 ? 0.19 : 0.21;
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.3;
      F.rod(Math.cos(a) * R, 0.02, Math.sin(a) * R, Math.cos(a) * 0.09, H - 0.06, Math.sin(a) * 0.09, 0.022, F.shade(c, -0.18), 'wood');
      const b = a + F.TAU / 3, rr = R * 0.62;
      F.rod(Math.cos(a) * rr, H * 0.3, Math.sin(a) * rr, Math.cos(b) * rr, H * 0.3, Math.sin(b) * rr, 0.012, F.shade(c, -0.25), 'wood');
    }
    F.cyl(0, H - 0.06, 0, 0.17, 0.06, 0, c, 'wood');
    F.cyl(0, H - 0.008, 0, 0.15, 0.008, 0, F.shade(c, 0.1), 'wood');
  }
});

FURN({
  key: 'voth_tavern_bar', name: 'Tavern Bar', culture: 'voth', type: 'counter', setting: 'indoor',
  rooms: ['tavern'], anchor: 'floor', clearance: { front: 1.1, back: 0.9 },
  materials: ['timber', 'stone', 'metal'],
  w: 3.0, d: 0.9, h: 1.6, variants: 2, variantNames: ['plain', 'with kegs'],
  variantDims: [{ w: 3.0, d: 0.9, h: 1.12 }, { w: 3.0, d: 0.9, h: 1.6 }],
  build: function (F) {
    const wood = F.col('timberUmber'), top = F.col('timberMud'), stone = F.col('stoneTaupe'), brass = F.col('brass'), iron = F.col('iron');
    /* stone plinth, a panelled timber front, a thick top with a rounded lip */
    F.box(0, 0, -0.02, 2.9, 0.14, 0.7, 0, stone, 'stone');
    F.box(0, 0.14, -0.04, 2.86, 0.86, 0.64, 0, wood, 'wood');
    for (let i = 0; i < 4; i++) {
      const x = -1.05 + i * 0.7;
      F.box(x, 0.24, 0.285, 0.56, 0.64, 0.03, 0, F.shade(wood, 0.08), 'wood');
      F.box(x, 0.3, 0.3, 0.44, 0.52, 0.01, 0, F.shade(wood, -0.08), 'wood');
    }
    F.box(0, 1.0, 0, 3.0, 0.08, 0.84, 0, top, 'wood');
    F.rod(-1.5, 1.04, 0.42, 1.5, 1.04, 0.42, 0.04, F.shade(top, 0.06), 'wood');
    /* brass foot rail on knees */
    F.rod(-1.4, 0.18, 0.38, 1.4, 0.18, 0.38, 0.025, brass, 'metal');
    for (const x of [-1.2, 0, 1.2]) F.rod(x, 0.18, 0.38, x, 0.3, 0.3, 0.018, F.shade(brass, -0.15), 'metal');
    /* the keeper's side: a sunk shelf and a drip trough */
    F.box(0, 0.55, -0.34, 2.7, 0.04, 0.12, 0, F.shade(wood, -0.1), 'wood');
    F.box(0.9, 1.08, -0.25, 0.6, 0.03, 0.2, 0, iron, 'metal');
    if (F.variant === 1) {
      /* two kegs in a cradle at the left end, spigots to the front */
      F.box(-1.15, 1.08, -0.05, 0.62, 0.08, 0.5, 0, F.shade(wood, -0.15), 'wood');
      for (const z of [-0.18, 0.08]) {
        F.rod(-1.42, 1.32, z, -0.88, 1.32, z, 0.17, F.shade(top, -0.05), 'wood');
        for (const x of [-1.32, -0.98]) F.rod(x, 1.32, z, x + 0.03, 1.32, z, 0.178, iron, 'metal');
        F.rod(-0.88, 1.28, z, -0.8, 1.28, z, 0.02, brass, 'metal');
      }
    }
  }
});

FURN({
  key: 'voth_offering_table', name: 'Shrine Offering Table', culture: 'voth', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'temple', 'hall'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'metal', 'cloth', 'foliage', 'emissive'],
  w: 1.4, d: 0.6, h: 1.05, variants: 2, variantNames: ['bowls and lamps', 'cloth and figure'],
  build: function (F) {
    const stone = F.col('stoneGrey'), cut = F.col('stoneUmber'), brass = F.col('brass'), cloth = F.col('clothCrimson'), gold = F.col('clothGold');
    /* a stone slab on two carved pedestals, a low step to kneel at */
    F.box(0, 0, 0.22, 1.3, 0.1, 0.16, 0, F.shade(stone, -0.1), 'stone');
    for (const s of [-1, 1]) {
      F.box(s * 0.5, 0, -0.04, 0.24, 0.76, 0.36, 0, stone, 'stone');
      F.box(s * 0.5, 0.2, 0.141, 0.16, 0.36, 0.01, 0, cut, 'stone');
    }
    F.box(0, 0.76, -0.04, 1.4, 0.08, 0.52, 0, F.shade(stone, 0.06), 'stone');
    F.box(0, 0.62, 0.21, 1.3, 0.14, 0.02, 0, cloth, 'cloth');               /* hanging runner */
    for (let i = 0; i < 5; i++) F.box(-0.52 + i * 0.26, 0.6, 0.222, 0.05, 0.03, 0.005, 0, gold, 'cloth');
    if (F.variant === 0) {
      for (const x of [-0.42, 0, 0.42]) {
        F.frustum(x, 0.84, -0.05, 0.06, 0.11, 0.06, 0, brass, 'metal', 12);
        F.ball(x + 0.02, 0.9, -0.05, 0.035, F.pick(['leafOlive', 'leafMadder', 'leafOchre']), 'leafy');
      }
      for (const x of [-0.6, 0.6]) {
        F.cyl(x, 0.84, -0.2, 0.04, 0.02, 0, brass, 'metal');
        F.cyl(x, 0.86, -0.2, 0.022, 0.12, 0, F.col('clothBone'), 'cloth');
        F.cone(x, 0.98, -0.2, 0.012, 0.05, 0, F.col('flame'), 'glow');
      }
      F.lamp(0, 1.0, -0.1, 0.4, 3);
    } else {
      F.box(0, 0.84, -0.06, 1.1, 0.01, 0.44, 0, F.shade(cloth, 0.1), 'cloth');
      F.cyl(0, 0.85, -0.12, 0.08, 0.04, 0, cut, 'stone');
      F.frustum(0, 0.89, -0.12, 0.06, 0.035, 0.12, 0, gold, 'metal', 8);
      F.ball(0, 1.02, -0.12, 0.03, gold, 'metal');
    }
  }
});

FURN({
  key: 'voth_candle_stand', name: 'Votive Candle Stand', culture: 'voth', type: 'lamp', setting: 'indoor',
  rooms: ['shrine', 'temple', 'hall'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'cloth', 'emissive'],
  w: 0.6, d: 0.6, h: 1.5, variants: 2, variantNames: ['tiered', 'single pricket'],
  variantDims: [{ w: 0.6, d: 0.6, h: 1.25 }, { w: 0.6, d: 0.6, h: 1.5 }],
  build: function (F) {
    const iron = F.col('ironDark'), wax = F.col('clothBone');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.5;
      F.rod(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26, Math.cos(a) * 0.04, 0.2, Math.sin(a) * 0.04, 0.016, iron, 'metal');
      F.ball(Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.26, 0.025, F.shade(iron, 0.1), 'metal');
    }
    const top = F.variant === 0 ? 1.0 : 1.32;
    F.cyl(0, 0.18, 0, 0.022, top - 0.18, 0, iron, 'metal');
    const candle = function (x, y, z, h) {
      F.cyl(x, y, z, 0.018, h, 0, wax, 'cloth');
      F.cone(x, y + h, z, 0.009, 0.035, 0, F.col('flame'), 'glow');
    };
    if (F.variant === 0) {
      /* three dished rings stepping up, candles round each */
      const rings = [[0.6, 0.27, 7], [0.82, 0.19, 5], [1.0, 0.1, 3]];
      for (const [y, r, n] of rings) {
        F.cyl(0, y, 0, r + 0.02, 0.02, 0, F.shade(iron, 0.08), 'metal');
        for (let i = 0; i < n; i++) {
          const a = i * F.TAU / n + y;
          candle(Math.cos(a) * r, y + 0.02, Math.sin(a) * r, F.rr(0.06, 0.16));
        }
      }
      F.lamp(0, 1.15, 0, 0.6, 4);
    } else {
      F.cyl(0, top, 0, 0.1, 0.02, 0, F.shade(iron, 0.08), 'metal');
      F.cyl(0, top + 0.02, 0, 0.04, 0.1, 0, wax, 'cloth');
      F.cone(0, top + 0.12, 0, 0.016, 0.05, 0, F.col('flame'), 'glow');
      F.lamp(0, top + 0.15, 0, 0.4, 3);
    }
  }
});

FURN({
  key: 'voth_prayer_mat', name: 'Prayer Mat and Kneeler', culture: 'voth', type: 'rug', setting: 'indoor',
  rooms: ['shrine', 'temple', 'bedroom'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['cloth'],
  w: 0.8, d: 1.3, h: 0.14, variants: 2, variantNames: ['with kneeler', 'mat only'],
  variantDims: [{ w: 0.8, d: 1.3, h: 0.14 }, { w: 0.8, d: 1.3, h: 0.02 }],
  build: function (F) {
    const field = F.pick(['clothCrimson', 'clothTeal', 'clothPlum']), edge = F.col('clothLinen'), gold = F.col('clothGold');
    F.box(0, 0, 0, 0.8, 0.01, 1.3, 0, edge, 'cloth');
    F.box(0, 0.01, 0, 0.66, 0.006, 1.16, 0, field, 'cloth');
    /* a pointed niche worked at the head end */
    F.box(0, 0.016, -0.2, 0.36, 0.003, 0.5, 0, F.shade(field, -0.25), 'cloth');
    F.box(0, 0.016, -0.48, 0.25, 0.003, 0.25, Math.PI / 4, F.shade(field, -0.25), 'cloth');
    F.box(0, 0.016, 0.36, 0.5, 0.003, 0.03, 0, gold, 'cloth');
    if (F.variant === 0) {
      F.box(0, 0.016, 0.38, 0.6, 0.1, 0.32, 0, F.shade(field, 0.1), 'cloth');   /* kneeling cushion */
      F.box(0, 0.11, 0.38, 0.56, 0.03, 0.28, 0, F.shade(field, 0.18), 'cloth');
    }
  }
});

FURN({
  key: 'voth_tableware', name: 'Jug and Tankards', culture: 'voth', type: 'vessel', setting: 'indoor',
  rooms: ['tavern', 'hall', 'kitchen'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'metal', 'foliage'],
  w: 0.6, d: 0.3, h: 0.3, variants: 2, variantNames: ['jug and tankards', 'bread board'],
  variantDims: [{ w: 0.6, d: 0.3, h: 0.3 }, { w: 0.52, d: 0.3, h: 0.13 }],
  build: function (F) {
    const clay = F.col('stoneMud'), wood = F.col('timberMud'), iron = F.col('iron'), pewter = F.col('pewter');
    if (F.variant === 0) {
      /* a stoneware jug, belly to lip, and two hooped tankards */
      F.frustum(-0.14, 0, 0, 0.07, 0.1, 0.12, 0, clay, 'stone', 12);
      F.frustum(-0.14, 0.12, 0, 0.1, 0.055, 0.1, 0, F.shade(clay, 0.06), 'stone', 12);
      F.cyl(-0.14, 0.22, 0, 0.045, 0.06, 0, F.shade(clay, -0.06), 'stone');
      F.cone(-0.14, 0.27, 0.035, 0.03, 0.03, 0, F.shade(clay, -0.1), 'stone');
      F.beam(-0.14, 0.25, -0.05, -0.14, 0.12, -0.11, 0.025, 0.012, F.shade(clay, -0.1), 'stone');
      for (const [x, z] of [[0.08, 0.07], [0.2, -0.06]]) {
        F.cyl(x, 0, z, 0.05, 0.13, 0, wood, 'wood');
        for (const y of [0.02, 0.1]) F.cyl(x, y, z, 0.053, 0.012, 0, iron, 'metal');
        F.box(x + 0.065, 0.03, z, 0.02, 0.08, 0.02, 0, F.shade(wood, -0.15), 'wood');
      }
    } else {
      F.box(0, 0, 0, 0.5, 0.025, 0.3, 0, wood, 'wood');
      F.blob(-0.08, 0.07, 0, 0.13, 0.09, 0.2, F.col('timberBirch'), 'plant');
      F.box(0.15, 0.025, 0.05, 0.12, 0.05, 0.08, 0.3, F.col('timberSand'), 'plant');
      F.box(0.14, 0.03, -0.08, 0.16, 0.005, 0.025, -0.2, pewter, 'metal');
    }
  }
});

FURN({
  key: 'voth_candles', name: 'Candles on a Dish', culture: 'voth', type: 'lamp', setting: 'indoor',
  rooms: ['shrine', 'hall', 'tavern', 'bedroom', 'study'], anchor: 'surface', clearance: {},
  materials: ['metal', 'cloth', 'emissive'],
  w: 0.26, d: 0.26, h: 0.26, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), wax = F.col('clothBone');
    F.cyl(0, 0, 0, 0.12, 0.015, 0, brass, 'metal');
    F.cyl(0, 0.015, 0, 0.11, 0.01, 0, F.shade(brass, 0.12), 'metal');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.4, h = [0.18, 0.12, 0.08][i];
      F.cyl(Math.cos(a) * 0.05, 0.02, Math.sin(a) * 0.05, 0.022, h, 0, F.shade(wax, -i * 0.04), 'cloth');
      F.blob(Math.cos(a) * 0.05, 0.02 + h, Math.sin(a) * 0.05, 0.026, 0.012, 0, F.shade(wax, -0.05), 'cloth');
      F.cone(Math.cos(a) * 0.05, 0.022 + h, Math.sin(a) * 0.05, 0.01, 0.04, 0, F.col('flame'), 'glow');
    }
    F.lamp(0, 0.25, 0, 0.35, 3);
  }
});

/* ================= Iziz (9 pieces) ================= */

FURN({
  key: 'iziz_lamp_boulevard',
  name: 'Boulevard Lamp Post',
  culture: 'iziz',
  type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza'], anchor: 'floor', clearance: { front: 0.4, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['timber', 'stone', 'metal', 'glass', 'emissive'],
  w: 0.8, d: 0.8, h: 6,
  variants: 1,
  build: function (F) {
    const shaft = F.col('timberSepia'), band = F.col('bronze'), gilt = F.col('gilt');
    /* stepped stone foot */
    F.box(0, 0, 0, 0.78, 0.16, 0.78, 0, F.col('stoneKhaki'), 'stone');
    F.frustum(0, 0.16, 0, 0.33, 0.24, 0.22, 0, F.col('stoneMud'), 'stone', 4);
    F.box(0, 0.38, 0, 0.46, 0.22, 0.46, 0, F.shade(shaft, 0.08), 'wood');
    /* tapering post with pilaster strips on all four faces and collar bands */
    F.frustum(0, 0.6, 0, 0.21, 0.15, 4.25, 0, shaft, 'wood', 4);
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      F.box(Math.sin(a) * 0.19, 0.7, Math.cos(a) * 0.19, 0.12, 4.0, 0.05, a, F.shade(shaft, 0.12), 'wood');
    }
    for (let i = 0; i < 2; i++) {
      F.cyl(0, 1.6 + i * 2.0, 0, 0.21 - i * 0.02, 0.07, 0, band, 'metal');
    }
    F.cyl(0, 4.85, 0, 0.19, 0.1, 0, band, 'metal');
    /* four scroll brackets carrying the housing */
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      F.rod(Math.cos(a) * 0.07, 4.72, Math.sin(a) * 0.07, Math.cos(a) * 0.26, 5.0, Math.sin(a) * 0.26, 0.025, band, 'metal');
    }
    /* housing: pan, corner bars, glazed panels, a glow core, vented cap and finial */
    F.box(0, 4.95, 0, 0.56, 0.07, 0.56, 0, band, 'metal');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4;
      F.rod(Math.cos(a) * 0.26, 5.02, Math.sin(a) * 0.26, Math.cos(a) * 0.26, 5.62, Math.sin(a) * 0.26, 0.022, band, 'metal');
    }
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 0.255, 5.04, Math.cos(a) * 0.255, 0.36, 0.56, 0.02, a, F.col('glassChalk'), 'glass');
    }
    F.box(0, 5.14, 0, 0.26, 0.34, 0.26, 0, F.col('flame'), 'glow');
    F.ball(0, 5.5, 0, 0.11, F.col('candle'), 'glow');
    F.pyrRoof(0, 5.62, 0, 0.66, 0.24, 0.66, 0, F.shade(band, -0.15), 'metal');
    F.cyl(0, 5.86, 0, 0.05, 0.06, 0, gilt, 'metal');
    F.cone(0, 5.9, 0, 0.07, 0.1, 0, gilt, 'metal');
    F.lamp(0, 5.25, 0, 1.0, 12);
  }
});

FURN({
  key: 'iziz_lamp_rooftop',
  name: 'Rooftop Beacon Lamp',
  culture: 'iziz',
  type: 'lamp', setting: 'outdoor',
  rooms: ['rooftop'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['metal', 'glass', 'emissive'],
  w: 1.2, d: 1.2, h: 0.7,
  variants: 1,
  build: function (F) {
    const frame = F.col('bronze'), dark = F.col('timberSepia'), gilt = F.col('gilt');
    /* cast base pan on four stub feet, with tie-down rings at the corners */
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + Math.PI / 4;
      F.box(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46, 0.16, 0.06, 0.16, a, dark, 'metal');
      F.rod(Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5, Math.cos(a) * 0.58, 0.1, Math.sin(a) * 0.58, 0.025, dark, 'metal');
    }
    F.box(0, 0.06, 0, 1.12, 0.08, 1.12, 0, dark, 'metal');
    F.box(0, 0.14, 0, 0.96, 0.04, 0.96, 0, F.shade(frame, -0.1), 'metal');
    /* corner mullions and four glazed panels round a glow core */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4;
      F.box(Math.cos(a) * 0.46, 0.18, Math.sin(a) * 0.46, 0.1, 0.34, 0.1, a, frame, 'metal');
    }
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 0.46, 0.19, Math.cos(a) * 0.46, 0.78, 0.32, 0.02, a, F.col('glassChalk'), 'glass');
    }
    F.cyl(0, 0.2, 0, 0.3, 0.3, 0, F.col('candleDark'), 'glow');
    F.ball(0, 0.36, 0, 0.16, F.col('whiteHot'), 'glow');
    /* vented cap and finial */
    F.box(0, 0.52, 0, 1.2, 0.05, 1.2, 0, F.shade(frame, -0.2), 'metal');
    F.pyrRoof(0, 0.57, 0, 1.0, 0.09, 1.0, 0, frame, 'metal');
    F.cyl(0, 0.63, 0, 0.07, 0.04, 0, gilt, 'metal');
    F.cone(0, 0.63, 0, 0.055, 0.07, 0, gilt, 'metal');
    F.lamp(0, 0.35, 0, 0.8, 10);
  }
});

FURN({
  key: 'iziz_banner',
  name: 'Street Banner',
  culture: 'iziz',
  type: 'banner', setting: 'outdoor',
  rooms: ['street', 'plaza'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 2.5, d: 0.6, h: 11.5,
  variants: 3,
  build: function (F) {
    F.shift(-0.92, 0); /* centre the footprint on the origin (verify.py declared-size) */
    const pole = F.col('timberSepia'), gilt = F.col('gilt');
    const colors = F.cols(['clothOrange', 'clothCrimson', 'clothTeal']);
    const col = colors[F.variant] !== undefined ? colors[F.variant] : colors[0];
    /* stepped base and a tapering pole in three stages */
    F.box(0, 0, 0, 0.62, 0.2, 0.62, 0, F.col('stoneKhaki'), 'stone');
    F.frustum(0, 0.2, 0, 0.27, 0.2, 0.24, 0, F.col('stoneMud'), 'stone', 4);
    F.frustum(0, 0.44, 0, 0.2, 0.17, 3.6, 0, pole, 'wood', 6);
    F.frustum(0, 4.04, 0, 0.17, 0.14, 3.6, 0, F.shade(pole, 0.05), 'wood', 6);
    F.frustum(0, 7.64, 0, 0.14, 0.11, 3.2, 0, F.shade(pole, 0.1), 'wood', 6);
    for (let i = 0; i < 2; i++) F.cyl(0, 3.9 + i * 3.6, 0, 0.19 - i * 0.02, 0.08, 0, gilt, 'metal');
    /* crossarm reaching out over the street, with a knee brace */
    F.rod(0, 8.6, 0, 2.05, 8.6, 0, 0.055, F.shade(pole, 0.08), 'wood');
    F.rod(0, 7.7, 0, 1.4, 8.56, 0, 0.04, F.shade(pole, -0.05), 'wood');
    F.ball(2.08, 8.6, 0, 0.07, gilt, 'metal');
    /* banner hanging from the crossarm: three drops, a hem bar and tassels */
    for (let i = 0; i < 2; i++) {
      const x = 0.62 + i * 0.94;
      F.box(x, 5.55, F.rr(-0.04, 0.04), 0.88, 3.0, 0.05, 0, F.shade(col, (i - 0.5) * 0.08), 'cloth');
      F.cone(x, 5.35, 0, 0.05, 0.2, 0, gilt, 'metal');
    }
    F.box(1.15, 8.3, 0, 1.9, 0.12, 0.09, 0, gilt, 'metal');
    F.box(1.15, 5.45, 0, 1.9, 0.1, 0.09, 0, F.shade(gilt, -0.2), 'metal');
    /* device panel on the pole itself, and the finial */
    F.box(0, 6.4, 0.16, 0.34, 0.9, 0.05, 0, F.shade(col, -0.15), 'cloth');
    F.ball(0, 10.9, 0, 0.2, gilt, 'metal');
    F.cone(0, 11.0, 0, 0.15, 0.5, 0, gilt, 'metal');
  }
});

FURN({
  key: 'iziz_planter',
  name: 'Terracotta Planter',
  culture: 'iziz',
  type: 'planter', setting: 'both',
  rooms: ['street', 'court', 'plaza'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['stone', 'plaster', 'foliage'],
  w: 2.2, d: 1.4, h: 1.2,
  variants: 1,
  build: function (F) {
    const clay = F.col('bronze'), dark = F.shade(clay, -0.16), light = F.shade(clay, 0.12);
    /* plinth on four stub feet so it stands clear of the paving */
    for (let s = -1; s <= 1; s += 2) {
      for (let t = -1; t <= 1; t += 2) F.box(s * 0.82, 0, t * 0.48, 0.28, 0.08, 0.28, 0, dark, 'plaster');
    }
    F.box(0, 0.08, 0, 2.06, 0.14, 1.26, 0, dark, 'plaster');
    /* trough body, battered outward in two courses, with a moulded top rail */
    F.box(0, 0.22, 0, 1.9, 0.4, 1.16, 0, clay, 'plaster');
    F.box(0, 0.62, 0, 2.04, 0.38, 1.26, 0, F.shade(clay, 0.04), 'plaster');
    F.box(0, 1.0, 0, 2.2, 0.12, 1.4, 0, light, 'plaster');
    F.box(0, 0.94, 0, 2.06, 0.06, 1.26, 0, dark, 'plaster');
    /* corner pilasters and a relief band on every face */
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 1.01, 0.22, 0, 0.16, 0.78, 1.16, 0, light, 'plaster');
      F.box(0, 0.5, s * 0.68, 1.6, 0.26, 0.06, 0, dark, 'plaster');
    }
    /* soil, a mulch of stones and a little planted growth */
    F.box(0, 0.94, 0, 1.94, 0.06, 1.14, 0, F.col('timberSepia'), 'stone');
    for (let i = 0; i < 2; i++) {
      F.blob(F.rr(-0.85, 0.85), 1.0, F.rr(-0.45, 0.45), F.rr(0.07, 0.13), 0.07, F.rr(0, F.TAU), F.col('stoneKhaki'), 'stone');
    }
    F.blob(-0.55, 1.08, 0.05, 0.28, 0.24, F.rr(0, F.TAU), F.col('leaf'), 'leafy');
    F.blob(0.5, 1.06, -0.1, 0.24, 0.2, F.rr(0, F.TAU), F.col('leafOlive'), 'leafy');
  }
});

FURN({
  key: 'iziz_market_stall',
  name: 'Market Stall',
  culture: 'iziz',
  type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'metal', 'cloth', 'foliage'],
  w: 5.5, d: 4, h: 4.2,
  variants: 2,
  build: function (F) {
    const timber = F.col('timberSepia');
    const postX = 2.55, postZ = 1.85;
    const corners = [[postX, postZ], [postX, -postZ], [-postX, postZ], [-postX, -postZ]];
    /* a valance sized to the side it hangs on, rather than one length all round */
    const valance = function (y, hx, hz, lx, lz, col) {
      F.box(0, y, hz, lx, 0.28, 0.05, 0, col, 'cloth');
      F.box(0, y, -hz, lx, 0.28, 0.05, 0, col, 'cloth');
      F.box(hx, y, 0, 0.05, 0.28, lz, 0, col, 'cloth');
      F.box(-hx, y, 0, 0.05, 0.28, lz, 0, col, 'cloth');
    };

    if (F.variant === 0) {
      /* simple booth under a conical cloth */
      corners.forEach(function (c) {
        F.box(c[0], 0, c[1], 0.2, 0.12, 0.2, 0, F.col('stoneKhaki'), 'stone');
        F.box(c[0], 0.12, c[1], 0.25, 2.68, 0.25, 0, timber, 'wood');
        F.beam(c[0], 2.7, c[1], c[0] * 0.7, 2.25, c[1] * 0.7, 0.08, 0.08, timber, 'wood');
      });
      F.box(0, 2.72, 0, 5.2, 0.12, 3.9, 0, F.shade(timber, 0.1), 'wood');
      F.cone(0, 2.84, 0, 2.0, 1.2, 0, F.col('leafVermilion'), 'cloth');
      F.ball(0, 4.06, 0, 0.1, F.col('clothGold'), 'cloth');
      valance(2.48, 2.56, 1.9, 5.1, 3.8, F.shade('leafVermilion', -0.18));
      /* counter with legs and a front board, plus a back shelf */
      F.box(0, 0.98, 1.6, 4.4, 0.12, 0.6, 0, F.shade(timber, 0.22), 'wood');
      F.box(0, 0.2, 1.88, 4.3, 0.78, 0.08, 0, F.shade(timber, 0.05), 'wood');
      for (let s = -1; s <= 1; s += 2) F.box(s * 2.0, 0, 1.6, 0.14, 0.98, 0.5, 0, F.shade(timber, 0.05), 'wood');
      F.box(0, 1.3, -1.6, 4.0, 0.08, 0.4, 0, F.shade(timber, 0.22), 'wood');
      for (let i = 0; i < 3; i++) {
        F.cyl(-1.4 + i * 1.4, 1.38, -1.6, 0.14, 0.32, 0, F.pick(['leafVermilion', 'leaf', 'clothGold', 'clothTeal']), 'wood');
        F.blob(-1.2 + i * 1.2, 1.14, 1.6, 0.16, 0.16, F.rr(0, F.TAU), F.pick(['leafVermilion', 'leaf', 'clothGold']), 'leafy');
      }
    } else {
      /* canopy stall */
      const postH = 3.7;
      corners.forEach(function (c) {
        F.box(c[0], 0, c[1], 0.2, 0.12, 0.2, 0, F.col('stoneKhaki'), 'stone');
        F.box(c[0], 0.12, c[1], 0.22, postH, 0.22, 0, timber, 'wood');
        F.beam(c[0], postH + 0.08, c[1], c[0] * 0.72, postH - 0.5, c[1] * 0.72, 0.07, 0.07, timber, 'wood');
      });
      const canopyColors = F.cols(['clothOrange', 'clothGold', 'clothTeal', 'clothViolet', 'clothBone', 'clothCobalt']);
      const canopyCol = F.pick(canopyColors);
      F.beam(-postX, postH + 0.14, 0, postX, postH + 0.14, 0, 0.1, 0.1, timber, 'wood');
      F.box(0, postH + 0.2, 0, 5.3, 0.18, 3.9, F.rr(-0.03, 0.03), canopyCol, 'cloth');
      F.ball(-2.5, postH + 0.32, 0, 0.09, F.col('clothGold'), 'cloth');
      F.ball(2.5, postH + 0.32, 0, 0.09, F.col('clothGold'), 'cloth');
      valance(postH - 0.12, 2.58, 1.92, 5.2, 3.8, F.shade(canopyCol, -0.16));
      /* counter, legs, front board, and crates of goods on it */
      F.box(0, 0.98, 1.5, 4.4, 0.12, 0.6, 0, F.shade(timber, 0.22), 'wood');
      F.box(0, 0.2, 1.78, 4.3, 0.78, 0.08, 0, F.shade(timber, 0.05), 'wood');
      for (let s = -1; s <= 1; s += 2) F.box(s * 2.0, 0, 1.5, 0.14, 0.98, 0.5, 0, F.shade(timber, 0.05), 'wood');
      const crateColors = F.cols(['leafVermilion', 'leaf', 'clothGold', 'clothTeal', 'clothCrimson']);
      for (let i = 0; i < 2; i++) {
        const cx = -1.4 + i * 2.8;
        F.box(cx, 1.1, 1.5, 0.4, 0.32, 0.32, F.rr(-0.15, 0.15), crateColors[i % crateColors.length], 'wood');
        F.blob(cx, 1.46, 1.5, 0.14, 0.12, F.rr(0, F.TAU), F.shade(crateColors[(i + 2) % crateColors.length], 0.12), 'leafy');
      }
      /* stock stacked behind, and hanging bundles off the canopy frame */
      F.box(-1.4, 0, -1.2, 1.0, 1.0, 1.0, 0, F.col('timberFlax'), 'wood');
      F.cyl(1.2, 0, -1.3, 0.38, 0.9, 0, F.shade(timber, 0.15), 'wood');
      F.cyl(1.2, 0.9, -1.3, 0.34, 0.06, 0, F.shade(timber, -0.1), 'wood');
      F.rod(0, postH + 0.1, -0.2, 0, postH - 0.55, -0.2, 0.012, F.col('blackIron'), 'metal');
      F.blob(0, postH - 0.72, -0.2, 0.18, 0.4, F.rr(0, F.TAU), F.pick(['leaf', 'clothGold', 'leafVermilion']), 'leafy');
    }
  }
});

FURN({
  key: 'iziz_fountain',
  name: 'Fountain',
  culture: 'iziz',
  type: 'fountain', setting: 'outdoor',
  rooms: ['plaza'], anchor: 'floor', clearance: { front: 2, back: 2, left: 2, right: 2 },
  materials: ['stone', 'emissive'],
  w: 20, d: 20, h: 11,
  variants: 2,
  variantDims: [{ w: 8.4, d: 8.4, h: 4.4 }, { w: 20, d: 20, h: 11 }],
  build: function (F) {
    const stone = F.col('stoneKhaki');
    const water = F.col('electricDark');

    if (F.variant === 0) {
      /* plaza fountain: octagonal basin, coping, spouts and a central jet */
      F.cyl(0, 0, 0, 3.5, 0.78, 0, stone, 'stone');
      for (let i = 0; i < 8; i++) {
        const a = i * F.TAU / 8;
        F.box(Math.cos(a) * 3.56, 0.06, Math.sin(a) * 3.56, 2.7, 0.66, 0.16, -a - Math.PI / 2, F.shade(stone, i % 2 ? 0.05 : -0.05), 'stone');
        /* lion-mask spout over the rim, on every other facet */
        if (i % 2 === 0) F.rod(Math.cos(a) * 3.3, 1.02, Math.sin(a) * 3.3, Math.cos(a) * 3.62, 1.02, Math.sin(a) * 3.62, 0.11, F.shade(stone, 0.1), 'stone');
      }
      F.cyl(0, 0.78, 0, 3.72, 0.3, 0, F.shade(stone, 0.06), 'stone');
      F.cyl(0, 0.74, 0, 3.3, 0.16, 0, water, 'glow');
      /* pedestal with mouldings, an upper bowl and a plume */
      F.cyl(0, 0.9, 0, 0.82, 0.22, 0, F.shade(stone, -0.05), 'stone');
      F.frustum(0, 1.12, 0, 0.48, 0.3, 1.5, 0, stone, 'stone', 8);
      F.cyl(0, 2.62, 0, 0.42, 0.14, 0, F.shade(stone, -0.05), 'stone');
      F.frustum(0, 2.76, 0, 0.32, 1.0, 0.36, 0, F.shade(stone, 0.08), 'stone', 12);
      F.cyl(0, 3.06, 0, 0.96, 0.1, 0, water, 'glow');
      F.rod(0, 3.1, 0, 0, 3.95, 0, 0.09, F.col('iceDark'), 'glow');
      F.ball(0, 4.1, 0, 0.3, F.col('electric'), 'glow');
      /* four kerb steps on the approaches, and a couple of worn patches */
      for (let i = 0; i < 2; i++) {
        const a = i * Math.PI;
        F.box(Math.sin(a) * 3.95, 0, Math.cos(a) * 3.95, 1.9, 0.18, 0.5, a, F.shade(stone, -0.12), 'stone');
      }
      F.lamp(0, 2.2, 0, 0.6, 12);
    } else {
      /* grand park fountain, three stacked tiers */
      const r1 = 9.6, r2 = 5.2, r3 = 2.6;
      const h1 = 1.2, h2 = 1.0, h3 = 0.9;
      let y = 0;
      F.cyl(0, y, 0, r1, h1, 0, stone, 'stone');
      F.cyl(0, y + h1, 0, r1 * 1.02, 0.22, 0, F.shade(stone, -0.06), 'stone');
      F.cyl(0, y + h1 - 0.15, 0, r1 * 0.96, 0.15, 0, water, 'glow');
      y += h1;
      F.cyl(0, y, 0, r2, h2, 0, F.shade(stone, 0.04), 'stone');
      F.cyl(0, y + h2, 0, r2 * 1.03, 0.2, 0, F.shade(stone, -0.04), 'stone');
      F.cyl(0, y + h2 - 0.12, 0, r2 * 0.95, 0.12, 0, water, 'glow');
      y += h2;
      F.cyl(0, y, 0, r3, h3, 0, F.shade(stone, 0.08), 'stone');
      F.cyl(0, y + h3, 0, r3 * 1.05, 0.18, 0, F.shade(stone, 0), 'stone');
      F.cyl(0, y + h3 - 0.1, 0, r3 * 0.94, 0.1, 0, water, 'glow');
      y += h3;
      /* central column: base, shaft, collar and a crowning orb with a plume */
      F.frustum(0, y, 0, 0.9, 0.62, 0.5, 0, F.shade(stone, -0.05), 'stone', 8);
      F.cyl(0, y + 0.5, 0, 0.6, 5.4, 0, stone, 'stone');
      for (let i = 0; i < 3; i++) {
        const a = i * F.TAU / 3;
        F.rod(Math.cos(a) * 0.57, y + 0.7, Math.sin(a) * 0.57, Math.cos(a) * 0.57, y + 5.6, Math.sin(a) * 0.57, 0.07, F.shade(stone, 0.1), 'stone');
      }
      F.cyl(0, y + 5.9, 0, 0.84, 0.24, 0, F.shade(stone, 0.06), 'stone');
      F.ball(0, y + 6.8, 0, 0.9, F.col('electric'), 'glow');
      F.rod(0, y + 6.14, 0, 0, y + 6.3, 0, 0.3, stone, 'stone');
      F.cone(0, y + 7.5, 0, 0.3, 0.4, 0, F.col('ice'), 'glow');

      const jetCount = 4;
      for (let i = 0; i < jetCount; i++) {
        const ang = (i / jetCount) * F.TAU;
        const jx = Math.cos(ang) * (r1 - 0.9);
        const jz = Math.sin(ang) * (r1 - 0.9);
        F.rod(jx, h1, jz, jx, h1 + 1.8, jz, 0.08, F.col('iceDark'), 'glow');
        F.ball(jx, h1 + 1.85, jz, 0.14, F.col('ice'), 'glow');
      }
      /* kerb blocks and approach steps around the outer basin */
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4 + F.TAU / 8;
        F.box(Math.sin(a) * (r1 + 0.32), 0, Math.cos(a) * (r1 + 0.32), 3.4, 0.22, 0.8, a, F.shade(stone, -0.12), 'stone');
      }
      F.lamp(0, 4.0, 0, 0.8, 20);
    }
  }
});

FURN({
  key: 'iziz_statue',
  name: 'Statue',
  culture: 'iziz',
  type: 'statue', setting: 'outdoor',
  rooms: ['plaza'], anchor: 'floor', clearance: { front: 2, back: 1, left: 1, right: 1 },
  materials: ['stone', 'metal', 'emissive'],
  w: 6, d: 6, h: 22,
  variants: 3,
  variantDims: [{ w: 6, d: 6, h: 20.2 }, { w: 6, d: 6, h: 16.3 }, { w: 6, d: 6, h: 18.6 }],
  build: function (F) {
    const sandy = F.col('stoneLinen');
    const bronze = F.col('bronzeLight');
    const bronzeDark = F.col('bronzeDark');

    /* stepped plinth, with a dedication panel on each of the four faces */
    F.box(0, 0, 0, 5.7, 1.5, 5.7, 0, sandy, 'stone');
    F.box(0, 1.5, 0, 4.6, 0.9, 4.6, 0, F.shade(sandy, -0.06), 'stone');
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      F.box(Math.sin(a) * 2.87, 0.3, Math.cos(a) * 2.87, 3.2, 0.9, 0.08, a, F.col('stoneGranite'), 'stone');
    }
    F.box(0, 2.4, 0, 3.4, 1.8, 3.4, 0, bronze, 'metal');
    F.cyl(0, 4.2, 0, 1.9, 0.22, 0, bronzeDark, 'metal');

    const baseY = 4.42;
    /* legs, with a drapery panel between them so the mass reads from behind too */
    F.cyl(-0.5, baseY, 0, 0.36, 4.4, 0, bronze, 'metal');
    F.cyl(0.5, baseY, 0, 0.36, 4.4, 0, bronze, 'metal');
    F.box(0, baseY, -0.34, 1.3, 4.0, 0.3, 0, bronzeDark, 'metal');
    F.box(0, baseY, 0, 1.6, 1.1, 0.7, 0, bronzeDark, 'metal');
    const torsoY = baseY + 4.4;
    F.frustum(0, torsoY, 0, 1.0, 0.8, 4.6, 0, bronze, 'metal', 10);
    F.box(0, torsoY + 1.2, 0, 2.3, 0.4, 2.3, 0, bronzeDark, 'metal');
    F.box(0, torsoY + 3.5, 0, 2.6, 0.45, 1.0, 0, bronzeDark, 'metal');
    const headY = torsoY + 4.6 + 0.6;
    F.cyl(0, torsoY + 4.6, 0, 0.26, 0.24, 0, bronzeDark, 'metal');
    F.ball(0, headY, 0, 0.62, bronze, 'metal');
    F.cone(0, headY + 0.5, 0, 0.42, 1.3, 0, bronzeDark, 'metal');
    F.ball(0, headY + 1.9, 0, 0.16, F.col('giltLight'), 'metal');

    if (F.variant === 0) {
      /* herald — raised arm with a lit staff */
      F.rod(0.9, torsoY + 3.6, 0, 2.0, torsoY + 6.0, 0.3, 0.19, bronze, 'metal');
      F.rod(-0.9, torsoY + 3.6, 0, -1.1, torsoY + 0.6, 0.2, 0.19, bronze, 'metal');
      F.ball(-1.1, torsoY + 0.5, 0.2, 0.22, bronzeDark, 'metal');
      F.rod(2.0, torsoY + 1.5, 0.3, 2.0, torsoY + 10.2, 0.3, 0.14, bronzeDark, 'metal');
      F.cyl(2.0, torsoY + 9.4, 0.3, 0.3, 0.14, 0, F.col('giltLight'), 'metal');
      F.cone(2.0, torsoY + 10.2, 0.3, 0.45, 0.95, 0, F.col('ice'), 'glow');
      F.lamp(2.0, torsoY + 10.6, 0.3, 1.0, 16);
    } else if (F.variant === 1) {
      /* winged guardian — crossed arms, swept wings, reads from every side */
      F.rod(0.7, torsoY + 3.4, 0.2, -0.5, torsoY + 2.3, 0.7, 0.18, bronze, 'metal');
      F.rod(-0.7, torsoY + 3.4, 0.3, 0.5, torsoY + 2.1, 0.75, 0.18, bronze, 'metal');
      for (let s = -1; s <= 1; s += 2) {
        F.box(s * 1.9, torsoY + 2.4, -0.5, 0.22, 3.8, 2.8, s * 0.35, bronzeDark, 'metal');
        F.box(s * 2.5, torsoY + 3.4, -1.1, 0.16, 2.6, 2.0, s * 0.5, F.shade(bronzeDark, -0.1), 'metal');
        F.rod(s * 1.2, torsoY + 4.6, -0.3, s * 2.6, torsoY + 6.0, -1.2, 0.12, bronze, 'metal');
      }
      F.box(0, torsoY + 2.0, 0.85, 1.4, 2.6, 0.2, 0, F.shade(bronze, 0.08), 'metal');
    } else {
      /* orb bearer — both arms raised holding a glowing orb */
      F.rod(-0.8, torsoY + 2.6, 0, -0.45, torsoY + 7.0, 0, 0.19, bronze, 'metal');
      F.rod(0.8, torsoY + 2.6, 0, 0.45, torsoY + 7.0, 0, 0.19, bronze, 'metal');
      F.cyl(0, torsoY + 6.9, 0, 1.1, 0.16, 0, bronzeDark, 'metal');
      F.ball(0, torsoY + 7.8, 0, 0.9, F.col('electric'), 'glow');
      F.rod(0, torsoY + 8.7, 0, 0, torsoY + 9.6, 0, 0.12, F.col('ice'), 'glow');
      F.lamp(0, torsoY + 7.8, 0, 1.1, 16);
    }
  }
});

FURN({
  key: 'iziz_obelisk',
  name: 'Obelisk',
  culture: 'iziz',
  type: 'monument', setting: 'outdoor',
  rooms: ['plaza'], anchor: 'floor', clearance: { front: 2, back: 2, left: 2, right: 2 },
  materials: ['timber', 'stone', 'metal', 'emissive'],
  w: 10, d: 10, h: 34,
  variants: 1,
  build: function (F) {
    const sandy = F.col('stoneLinen'), cut = F.col('stoneGranite');
    F.box(0, 0, 0, 9, 2.4, 9, 0, sandy, 'stone');
    F.frustum(0, 2.4, 0, 4.2, 3.4, 0.4, 0, F.shade(sandy, -0.03), 'stone', 4);
    F.box(0, 2.8, 0, 6.5, 1.4, 6.5, 0, F.shade(sandy, -0.05), 'stone');

    let y = 4.2;
    F.box(0, y, 0, 3.2, 10, 3.2, 0, F.shade(sandy, -0.1), 'stone');
    /* corner pilasters standing proud of the lowest stage */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4;
      F.box(Math.cos(a) * 1.6, y, Math.sin(a) * 1.6, 0.6, 10, 0.6, 0, F.shade(sandy, 0.04), 'stone');
    }
    /* a carved register on every face of the first stage */
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      if (i % 2 === 0) F.box(Math.sin(a) * 1.64, y + 2.0, Math.cos(a) * 1.64, 2.0, 6.0, 0.1, a, cut, 'stone');
    }
    y += 10;
    F.cyl(0, y, 0, 1.9, 0.3, 0, F.shade(sandy, -0.02), 'stone');
    F.box(0, y + 0.3, 0, 2.6, 8.7, 2.6, 0, F.shade(sandy, -0.12), 'stone');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      if (i % 2 === 1) F.box(Math.sin(a) * 1.34, y + 2.0, Math.cos(a) * 1.34, 1.6, 4.6, 0.1, a, cut, 'stone');
    }
    y += 9;
    F.cyl(0, y, 0, 1.55, 0.26, 0, F.shade(sandy, -0.02), 'stone');
    F.box(0, y + 0.26, 0, 2.0, 6.74, 2.0, 0, F.shade(sandy, -0.14), 'stone');
    y += 7;
    F.cyl(0, y, 0, 1.7, 0.24, 0, F.shade(sandy, 0.04), 'stone');
    F.cone(0, y + 0.24, 0, 1.6, 2.76, 0, F.col('giltLight'), 'metal');
    y += 3.0;
    F.ball(0, y + 0.3, 0, 0.4, F.col('candle'), 'glow');
    F.lamp(0, y + 0.3, 0, 0.8, 20);

    /* four corner offering benches with braziers on them */
    const corners = [[1, 1], [-1, -1]];
    corners.forEach(function (c) {
      const cx = c[0] * 4.2, cz = c[1] * 4.2;
      const ry = Math.atan2(-cx, -cz);
      F.box(cx, 0, cz, 1.6, 0.45, 0.6, ry, sandy, 'stone');
      const bx = cx - Math.sin(ry) * 0.35;
      const bz = cz - Math.cos(ry) * 0.35;
      F.box(bx, 0.45, bz, 1.5, 0.55, 0.12, ry, F.col('timberChestnut'), 'wood');
      F.cone(cx, 0.45, cz, 0.2, 0.42, 0, F.col('amber'), 'glow');
    });
  }
});

FURN({
  key: 'iziz_bench',
  name: 'Plaza Bench',
  culture: 'iziz',
  type: 'bench', setting: 'outdoor',
  rooms: ['plaza', 'street', 'garden'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'stone'],
  w: 3.5, d: 1, h: 1,
  variants: 1,
  build: function (F) {
    const stone = F.col('stoneLinen'), dark = F.shade(stone, -0.14), wood = F.col('timberChestnut');
    /* two carved end supports on a shared kerb, with a stretcher between them */
    F.box(0, 0, 0, 3.1, 0.1, 0.82, 0, dark, 'stone');
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 1.35, 0.1, 0, 0.34, 0.32, 0.86, 0, stone, 'stone');
      F.frustum(s * 1.35, 0.42, 0, 0.15, 0.2, 0.06, 0, F.shade(stone, 0.07), 'stone', 4);
      F.box(s * 1.35, 0.1, 0.44, 0.24, 0.3, 0.05, 0, dark, 'stone');
    }
    F.box(0, 0.2, 0, 2.5, 0.12, 0.2, 0, dark, 'stone');
    /* seat slab in two courses, with a joint line and a moulded front edge */
    F.box(0, 0.48, -0.16, 3.5, 0.14, 0.42, 0, stone, 'stone');
    F.box(0, 0.48, 0.24, 3.5, 0.14, 0.4, 0, F.shade(stone, 0.04), 'stone');
    F.box(0, 0.44, 0.44, 3.5, 0.1, 0.08, 0, F.shade(stone, 0.08), 'stone');
    /* timber back: two posts, a top rail and slats, plus armrests */
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 1.3, 0.62, -0.32, 0.12, 0.4, 0.1, 0, wood, 'wood');
      F.rod(s * 1.36, 0.72, -0.3, s * 1.36, 0.74, 0.32, 0.055, F.shade(wood, 0.12), 'wood');
      F.cyl(s * 1.36, 0.62, 0.3, 0.05, 0.14, 0, wood, 'wood');
    }
    F.box(0, 0.94, -0.32, 3.2, 0.1, 0.1, 0, F.shade(wood, 0.1), 'wood');
    for (let i = 0; i < 3; i++) {
      F.box(-0.85 + i * 0.85, 0.64, -0.32, 0.5, 0.3, 0.06, 0, wood, 'wood');
    }
    F.blob(F.rr(-1.0, 1.0), 0.62, F.rr(-0.1, 0.2), 0.13, 0.03, F.rr(0, F.TAU), F.shade(stone, -0.2), 'stone');
  }
});

/* ================= Beast-Rider (Mav's Refuge / Girder) (15 pieces) ================= */

FURN({
  key: 'br_market_stall', name: 'Market Stall', culture: 'beast-rider', type: 'stall', setting: 'outdoor',
  rooms: ['market'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'metal', 'cloth', 'foliage', 'emissive'],
  w: 3.6, d: 2.2, h: 2.6, variants: 1,
  build: function (F) {
    F.shift(0.04, -0.14); /* centre the footprint on the origin (verify.py declared-size) */
    const postColor = F.col('timberUmber');
    const counterColor = F.pick(['timberMudDark', 'timberMud', 'timberUmber']);
    const awningColors = F.cols(['clothVermilion', 'clothSaffron', 'clothTeal']);
    const postH = 2.15, postR = 0.07, px = 1.55, pz = 0.9;
    /* four posts, each pegged into a stone pad and braced back to the frame */
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        F.box(sx * px, 0, sz * pz, 0.22, 0.05, 0.22, 0, F.col('stoneTaupe'), 'stone');
        F.cyl(sx * px, 0.05, sz * pz, postR, postH, 0, postColor, 'wood');
        if (sz > 0) F.beam(sx * px, postH, sz * pz, sx * (px - 0.32), postH - 0.36, sz * pz, 0.05, 0.05, F.shade(postColor, -0.08), 'wood');
      }
      /* lashing where the front rail crosses the post */
      F.cyl(sx * px, 1.9, pz, postR + 0.02, 0.06, 0, F.col('iron'), 'cloth');
    }
    F.beam(-px, 1.95, -pz, px, 1.95, -pz, 0.07, 0.07, postColor, 'wood');
    F.beam(-px, 1.95, pz, px, 1.95, pz, 0.07, 0.07, postColor, 'wood');
    /* sign board on the ridge, so the stall reads at height */
    F.beam(-px, 2.45, 0, px, 2.45, 0, 0.07, 0.07, F.shade(postColor, 0.08), 'wood');
    F.box(0, 2.18, -0.06, 1.5, 0.34, 0.05, 0, F.pick(awningColors), 'cloth');
    /* counter: top, front boards, legs and a low shelf */
    F.box(0, 0.68, 0, 3.0, 0.1, 0.6, 0, counterColor, 'wood');
    F.box(0, 0.12, 0.31, 2.9, 0.56, 0.06, 0, F.shade(counterColor, -0.15), 'wood');
    F.box(0, 0.12, -0.31, 2.9, 0.56, 0.06, 0, F.shade(counterColor, -0.18), 'wood');
    for (let s = -1; s <= 1; s += 2) F.box(s * 1.35, 0, 0, 0.1, 0.68, 0.5, 0, F.shade(counterColor, -0.22), 'wood');
    /* awning panels overlapping down the front */
    for (let i = 0; i < 2; i++) {
      const lx = -0.78 + i * 1.56;
      F.box(lx, 1.95, -0.35, 1.6, 0.06, 0.9, 0.14, awningColors[i], 'cloth');
    }
    /* stock: fruit, a wrapped bale, a measure, a crate and a barrel */
    for (let i = 0; i < 3; i++) {
      F.blob(-0.95 + F.rr(-0.25, 0.25), 0.82 + F.rr(0, 0.06), F.rr(-0.15, 0.15), 0.09, 0.09, 0,
        F.pick(['leafVermilion', 'clothSaffron', 'leafMadderLight']), 'leafy');
    }
    F.box(0.15, 0.78, 0.05, 0.4, 0.12, 0.3, 0.08, F.pick(['clothVermilion', 'clothTeal']), 'cloth');
    F.cyl(0.75, 0.78, -0.05, 0.09, 0.22, 0, F.col('timberMud'), 'wood');
    F.cyl(0.75, 1.0, -0.05, 0.1, 0.03, 0, F.col('iron'), 'metal');
    F.box(-1.55, 0, 0.95, 0.6, 0.6, 0.6, 0.15, counterColor, 'wood');
    F.cyl(1.5, 0, 0.85, 0.32, 0.75, 0, F.col('timberUmber'), 'wood');
    F.ball(0, 1.78, 0.15, 0.08, F.col('amber'), 'glow');
    F.lamp(0, 1.78, 0.15, 0.8, 10);
  }
});

FURN({
  key: 'br_shopfront_display', name: 'Shopfront Goods Display', culture: 'beast-rider', type: 'stall', setting: 'both',
  rooms: ['market', 'street'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['timber', 'metal', 'cloth', 'foliage', 'emissive'],
  w: 3.0, d: 1.0, h: 2.8, variants: 1,
  build: function (F) {
    F.shift(0, -0.09); /* centre the footprint on the origin (verify.py declared-size) */
    const frameColor = F.col('timberUmber');
    const shelfColor = F.pick(['timberMudDark', 'timberMud', 'timberUmber']);
    const stackShelves = function (sx) {
      F.box(sx - 0.35, 0, -0.26, 0.07, 2.0, 0.07, 0, frameColor, 'wood');
      F.box(sx + 0.35, 0, -0.26, 0.07, 2.0, 0.07, 0, frameColor, 'wood');
      F.box(sx - 0.35, 0, 0.26, 0.07, 1.9, 0.07, 0, frameColor, 'wood');
      F.box(sx + 0.35, 0, 0.26, 0.07, 1.9, 0.07, 0, frameColor, 'wood');
      F.beam(sx - 0.35, 0.18, -0.26, sx - 0.35, 0.18, 0.26, 0.05, 0.05, F.shade(frameColor, -0.1), 'wood');
      F.beam(sx + 0.35, 0.18, -0.26, sx + 0.35, 0.18, 0.26, 0.05, 0.05, F.shade(frameColor, -0.1), 'wood');
      const shelfYs = [0.62, 1.5];
      for (let i = 0; i < shelfYs.length; i++) {
        const sy = shelfYs[i];
        F.box(sx, sy, 0, 0.84, 0.06, 0.66, 0, shelfColor, 'wood');
        if (i === 1) F.box(sx, sy + 0.06, 0.32, 0.84, 0.07, 0.03, 0, F.shade(shelfColor, -0.2), 'wood');
        for (let g = 0; g < 1; g++) {
          if (F.chance(0.55)) {
            F.blob(sx + F.rr(-0.25, 0.25), sy + 0.15, F.rr(-0.18, 0.18), 0.08, 0.08, 0,
              F.pick(['leafVermilion', 'clothSaffron', 'clothSand']), 'leafy');
          } else {
            F.box(sx + F.rr(-0.25, 0.25), sy + 0.06, F.rr(-0.18, 0.18), 0.2, 0.1, 0.16, F.rr(0, 0.3),
              F.pick(['clothVermilion', 'clothTeal', 'clothIvory']), 'cloth');
          }
        }
      }
    };
    stackShelves(-1.0);
    stackShelves(1.0);
    /* head beam, awning valance and a hanging lamp between the stacks */
    F.beam(-1.35, 2.05, -0.26, 1.35, 2.05, -0.26, 0.08, 0.08, frameColor, 'wood');
    F.box(0, 2.2, -0.15, 3.0, 0.1, 0.55, 0, F.pick(['clothVermilion', 'clothSaffron', 'clothTeal']), 'cloth');
    F.box(0, 2.42, -0.15, 2.8, 0.22, 0.05, 0, F.pick(['clothSaffron', 'clothTeal']), 'cloth');
    F.rod(0, 2.2, 0.2, 0, 1.9, 0.2, 0.015, F.col('iron'), 'metal');
    F.ball(0, 1.85, 0.2, 0.08, F.col('amber'), 'glow');
    F.lamp(0, 1.85, 0.2, 0.8, 9);
    /* goods stood out on the pavement in front */
    F.box(0, 0, 0.36, 0.9, 0.36, 0.4, F.rr(-0.1, 0.1), F.shade(shelfColor, -0.08), 'wood');
    for (let i = 0; i < 3; i++) {
      F.blob(-0.28 + i * 0.28, 0.44, 0.36, 0.11, 0.12, F.rr(0, F.TAU), F.pick(['leafVermilion', 'clothSaffron']), 'leafy');
    }
    F.cyl(-1.3, 0, 0.36, 0.2, 0.5, 0, F.shade(shelfColor, -0.12), 'wood');
    for (let i = 0; i < 2; i++) {
      F.rod(-1.3 + F.rr(-0.06, 0.06), 0.5, 0.36, -1.3 + F.rr(-0.2, 0.2), 1.1, 0.36 + F.rr(-0.12, 0.12), 0.02, F.col('timberMud'), 'wood');
    }
  }
});

FURN({
  key: 'br_tavern_bar', name: 'Tavern Bar Counter', culture: 'beast-rider', type: 'counter', setting: 'indoor',
  rooms: ['tavern'], anchor: 'floor', clearance: { front: 1.2, back: 0.9 },
  materials: ['timber', 'metal', 'glass', 'cloth', 'emissive'],
  w: 3.8, d: 1.5, h: 2.6, variants: 2,
  build: function (F) {
    const plank = F.col('timberMud');
    const railColor = F.col('timberUmber');
    /* counter body: kick board, front panels, top slab with a bullnose lip */
    F.box(0, 0, 0, 3.4, 0.12, 0.55, 0, F.shade(plank, -0.3), 'wood');
    F.box(0, 0.12, 0, 3.5, 0.78, 0.6, 0, plank, 'wood');
    for (let i = 0; i < 2; i++) {
      F.box(-0.9 + i * 1.8, 0.2, 0.31, 1.0, 0.6, 0.04, 0, F.shade(plank, -0.14), 'wood');
    }
    F.box(0, 0.9, 0, 3.6, 0.09, 0.72, 0, F.shade(plank, 0.1), 'wood');
    F.rod(0, 0.94, 0.36, 0, 0.94, 0.36, 0.05, F.shade(plank, 0.14), 'wood');
    /* back gantry: uprights, shelves, bottles and a chalked board */
    F.box(0, 0, -0.62, 3.2, 1.9, 0.09, 0, F.shade(plank, -0.18), 'wood');
    for (let s = -1; s <= 1; s += 2) F.box(s * 1.5, 0, -0.55, 0.1, 2.05, 0.1, 0, railColor, 'wood');
    F.beam(-1.5, 2.0, -0.55, 1.5, 2.0, -0.55, 0.08, 0.08, railColor, 'wood');
    for (let i = 0; i < 2; i++) {
      F.box(0, 1.1 + i * 0.5, -0.5, 3.0, 0.06, 0.22, 0, F.shade(plank, -0.06), 'wood');
      for (let j = 0; j < 2; j++) {
        F.cyl(-1.0 + j * 2.0, 1.16 + i * 0.5, -0.5, 0.06, F.rr(0.16, 0.26), 0,
          F.pick(['clothTeal', 'clothVermilion', 'clothSaffron', 'glassLeaf']), 'glass');
      }
    }
    F.box(0, 2.08, -0.5, 1.2, 0.5, 0.05, 0, F.col('timberEbony'), 'wood');
    /* foot rail on stub posts along the customer side */
    F.beam(-1.65, 0.28, 0.45, 1.65, 0.28, 0.45, 0.06, 0.06, railColor, 'wood');
    for (let s = -1; s <= 1; s += 2) F.box(s * 1.5, 0, 0.45, 0.06, 0.28, 0.06, 0, railColor, 'wood');
    F.lamp(-1.5, 2.2, 0.1, 0.7, 9);
    F.lamp(1.5, 2.2, 0.1, 0.7, 9);
    F.ball(-1.5, 2.16, 0.1, 0.07, F.col('amber'), 'glow');
    F.ball(1.5, 2.16, 0.1, 0.07, F.col('amber'), 'glow');
    F.rod(-1.5, 2.36, 0.1, -1.5, 2.24, 0.1, 0.012, F.col('iron'), 'metal');
    F.rod(1.5, 2.36, 0.1, 1.5, 2.24, 0.1, 0.012, F.col('iron'), 'metal');
    F.beam(-1.62, 2.4, -0.5, 1.62, 2.4, 0.15, 0.07, 0.07, railColor, 'wood');
    if (F.variant === 1) {
      /* service flap and a run of casks on the customer side */
      F.box(-1.0, 0.99, 0.62, 1.5, 0.08, 0.36, 0, plank, 'wood');
      F.box(-1.68, 0, 0.62, 0.09, 0.99, 0.3, 0, F.shade(plank, -0.2), 'wood');
      F.box(-0.32, 0, 0.62, 0.09, 0.99, 0.3, 0, F.shade(plank, -0.2), 'wood');
      F.cyl(1.15, 0, 0.5, 0.28, 0.66, 0, F.col('timberUmber'), 'wood');
      F.cyl(1.15, 0.1, 0.5, 0.29, 0.05, 0, F.col('iron'), 'metal');
      F.cyl(1.15, 0.66, 0.5, 0.28, 0.6, 0, F.shade('timberUmber', 0.05), 'wood');
      F.cyl(1.15, 1.22, 0.5, 0.26, 0.04, 0, F.shade('timberUmber', -0.2), 'wood');
      F.rod(0.9, 0.9, 0.5, 0.82, 0.82, 0.62, 0.02, F.col('iron'), 'metal');
    } else {
      /* bracket sign out over the room, and a stool at the counter */
      F.beam(1.4, 2.2, -0.2, 1.82, 2.2, 0.3, 0.08, 0.08, railColor, 'wood');
      F.box(1.74, 1.62, 0.3, 0.46, 0.5, 0.05, 0, F.pick(['clothVermilion', 'clothTeal', 'clothSaffron']), 'cloth');
      F.rod(1.74, 2.18, 0.3, 1.74, 2.1, 0.3, 0.012, F.col('iron'), 'metal');
      F.cyl(-1.4, 0, 0.5, 0.22, 0.6, 0, F.col('timberUmber'), 'wood');
      F.cyl(-1.4, 0.6, 0.5, 0.26, 0.06, 0, F.shade('timberUmber', 0.1), 'wood');
      for (let i = 0; i < 3; i++) {
        const a = i * F.TAU / 3;
        F.rod(-1.4 + Math.cos(a) * 0.19, 0.04, 0.5 + Math.sin(a) * 0.19,
          -1.4 + Math.cos(a) * 0.09, 0.6, 0.5 + Math.sin(a) * 0.09, 0.03, F.shade('timberUmber', -0.12), 'wood');
      }
    }
  }
});

FURN({
  key: 'br_storehouse_goods', name: 'Storehouse Crates, Barrels & Hoist', culture: 'beast-rider', type: 'storage', setting: 'both',
  rooms: ['store', 'yard'], anchor: 'floor', clearance: { front: 1 },
  materials: ['timber', 'metal', 'cloth'],
  w: 3.5, d: 3.9, h: 3.5, variants: 1,
  build: function (F) {
    F.shift(0.07, -0.37); /* centre the footprint on the origin (verify.py declared-size) */
    const crateTones = F.cols(['timberMudDark', 'timberMud', 'timberUmber']);
    const barrelColor = F.col('timberUmber');
    const sackColor = F.col('clothSand');
    const n = Math.floor(F.rr(5, 8.999));
    for (let i = 0; i < n; i++) {
      const s = F.rr(0.55, 1.2);
      const px = -1.1 + F.rr(0, 1.6);
      const pz = -1.1 + F.rr(0, 1.8);
      const py = F.chance(0.3) ? s * 0.9 : 0;
      const ry = F.rr(0, 0.4);
      const tone = F.pick(crateTones);
      F.box(px, py, pz, s, s * 0.85, s, ry, tone, 'wood');
      /* crate battens, so the boxes read as boarded up rather than solid */
      F.box(px, py + s * 0.62, pz, s * 1.02, 0.05, s * 1.02, ry, F.shade(tone, -0.22), 'wood');
    }
    /* barrels with hoops and heads */
    for (let i = 0; i < 2; i++) {
      const bx = i ? 1.15 : 1.0, bz = i ? -0.3 : 0.9;
      const br = F.rr(0.3, 0.5), bh = F.rr(0.7, 1.2);
      F.cyl(bx, 0, bz, br, bh, 0, F.shade(barrelColor, i ? -0.05 : 0), 'wood');
      F.cyl(bx, bh * 0.72, bz, br + 0.02, 0.05, 0, F.col('iron'), 'metal');
      F.cyl(bx, bh, bz, br - 0.03, 0.04, 0, F.shade(barrelColor, -0.2), 'wood');
    }
    F.blob(-0.6, 0.28, 1.05, 0.35, 0.5, 0.2, sackColor, 'cloth');
    F.blob(0.1, 0.25, 1.2, 0.3, 0.45, -0.2, F.shade(sackColor, -0.05), 'cloth');
    F.cyl(-0.6, 0.5, 1.05, 0.08, 0.06, 0, F.col('timberMud'), 'cloth');
    /* hoist: a post, a jib beam, a knee brace, a block and a slung crate */
    const hoistY = 3.2;
    F.cyl(0, 0, -1.2, 0.13, hoistY, 0, F.col('timberUmber'), 'wood');
    F.beam(0, hoistY, -1.2, 0, hoistY, 1.9, 0.14, 0.14, F.col('timberUmber'), 'wood');
    F.beam(0, hoistY - 0.9, -1.15, 0, hoistY - 0.06, 0.65, 0.09, 0.09, F.shade('timberUmber', -0.08), 'wood');
    F.ball(0, hoistY - 0.06, 1.85, 0.1, F.col('iron'), 'metal');
    F.rod(0, hoistY - 0.1, 1.85, 0, 1.6, 1.85, 0.02, F.col('timberSepia'), 'wood');
    F.box(0, 1.35, 1.85, 0.45, 0.4, 0.45, 0.1, F.pick(crateTones), 'wood');
    F.rod(0, hoistY - 0.06, -1.1, 0, 1.2, -1.15, 0.018, F.col('timberSepia'), 'wood');
  }
});

FURN({
  key: 'br_weapon_rack', name: 'Weapon Rack & Shield', culture: 'beast-rider', type: 'rack', setting: 'indoor',
  rooms: ['barracks', 'hall'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'metal'],
  w: 2.6, d: 0.55, h: 1.6, variants: 1,
  build: function (F) {
    const timber = F.col('timberSepia'), pale = F.shade(timber, 0.2);
    /* spear rack: sill with sockets, two uprights and a slotted top bar */
    F.box(-0.72, 0, 0.05, 1.1, 0.14, 0.34, 0, F.shade(timber, 0.08), 'wood');
    F.box(-1.1, 0, -0.12, 0.08, 1.5, 0.08, 0, timber, 'wood');
    F.box(-0.35, 0, -0.12, 0.08, 1.5, 0.08, 0, timber, 'wood');
    F.beam(-1.1, 1.45, -0.12, -0.35, 1.45, -0.12, 0.06, 0.06, timber, 'wood');
    F.beam(-1.1, 0.95, -0.12, -0.35, 0.95, -0.12, 0.05, 0.05, timber, 'wood');
    F.beam(-1.1, 0.16, -0.12, -1.1, 1.4, 0.14, 0.05, 0.05, F.shade(timber, -0.1), 'wood');
    const spearN = Math.floor(F.rr(4, 6.999));
    for (let i = 0; i < spearN; i++) {
      const bx = -1.05 + i * (0.65 / (spearN - 1 || 1));
      F.rod(bx, 0.05, 0.12, bx - 0.15, 1.42, -0.1, F.rr(0.02, 0.035), pale, 'wood');
      F.cone(bx - 0.16, 1.42, -0.11, 0.045, 0.16, 0, F.col('pewter'), 'metal');
    }
    /* shield hung on its own peg — a disc standing in the x-y plane */
    F.box(0.6, 0, -0.16, 0.08, 1.4, 0.08, 0, timber, 'wood');
    F.rod(0.6, 0.7, -0.1, 0.6, 0.7, -0.02, 0.36, F.col('redCopper'), 'metal');
    F.rod(0.6, 0.7, -0.02, 0.6, 0.7, 0.03, 0.15, F.shade('redCopper', 0.18), 'metal');
    F.ball(0.6, 0.7, 0.05, 0.08, F.col('pewter'), 'metal');
    /* axes and a quiver leaning at the far end */
    F.rod(1.15, 0, 0.12, 1.28, 1.15, -0.06, 0.03, pale, 'wood');
    F.box(1.28, 1.05, -0.06, 0.09, 0.26, 0.16, 0.2, F.col('pewter'), 'metal');
    F.cyl(1.2, 0, -0.18, 0.11, 0.55, 0, F.shade(timber, 0.1), 'wood');
    for (let i = 0; i < 2; i++) F.rod(1.2 + F.rr(-0.05, 0.05), 0.5, -0.18, 1.2 + F.rr(-0.12, 0.12), 1.0, -0.18 + F.rr(-0.06, 0.06), 0.015, pale, 'wood');
  }
});

FURN({
  key: 'br_loom_frame', name: 'Silk-House Loom Frame', culture: 'beast-rider', type: 'loom', setting: 'indoor',
  rooms: ['workshop'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'stone', 'cloth'],
  w: 2.6, d: 1.4, h: 2.4, variants: 1,
  build: function (F) {
    const timber = F.col('timberUmber');
    const silkTone = F.col('clothIvory');
    const awningColors = F.cols(['clothVermilion', 'clothSaffron', 'clothTeal']);
    /* four uprights on pads, tied by head beams and low sills on both flanks */
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        F.box(sx * 1.2, 0, sz * 0.6, 0.22, 0.05, 0.22, 0, F.col('stoneTaupe'), 'stone');
        F.rod(sx * 1.2, 0.05, sz * 0.6, sx * 1.2, 2.3, sz * 0.6, 0.07, timber, 'wood');
      }
      F.beam(sx * 1.2, 2.26, -0.6, sx * 1.2, 2.26, 0.6, 0.09, 0.09, timber, 'wood');
      F.beam(sx * 1.2, 0.22, -0.6, sx * 1.2, 0.22, 0.6, 0.08, 0.08, F.shade(timber, -0.1), 'wood');
      F.beam(sx * 1.2, 1.7, 0.6, sx * (1.2 - 0.34), 2.24, 0.6, 0.05, 0.05, timber, 'wood');
    }
    F.beam(-1.2, 2.25, 0, 1.2, 2.25, 0, 0.1, 0.1, timber, 'wood');
    /* warp beam, cloth beam, heddle rod and a treadle bar */
    F.rod(-1.24, 2.18, -0.42, 1.24, 2.18, -0.42, 0.075, F.shade(timber, 0.14), 'wood');
    F.rod(-1.24, 0.55, 0.42, 1.24, 0.55, 0.42, 0.09, F.shade(timber, 0.14), 'wood');
    F.rod(-1.24, 1.45, 0, 1.24, 1.45, 0, 0.05, F.shade(timber, 0.2), 'wood');
    F.rod(-1.0, 0.22, 0.2, 1.0, 0.22, 0.2, 0.04, F.shade(timber, -0.08), 'wood');
    /* cloth hanging DOWN off the beams, on both flanks */
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 2; i++) {
        const lz = side * (0.58 - i * 0.03);
        const col = i % 2 === 0 ? silkTone : F.pick(awningColors);
        F.box(-0.6 + i * 1.2, 1.05, lz, 0.7, 1.1, 0.03, 0, col, 'cloth');
      }
    }
    /* the web itself, rising from the cloth beam to the warp beam */
    F.beam(0, 0.6, 0.4, 0, 2.14, -0.4, 2.3, 0.03, silkTone, 'cloth');
    F.box(0.35, 1.5, 0.06, 0.3, 0.06, 0.07, 0.12, F.shade(timber, 0.2), 'wood');
    F.cyl(-1.0, 0, 0.5, 0.24, 0.42, 0, F.shade(timber, -0.05), 'wood');
    for (let i = 0; i < 2; i++) {
      F.blob(-1.0 + F.rr(-0.14, 0.14), 0.5, 0.5 + F.rr(-0.12, 0.12), 0.11, 0.14, F.rr(0, F.TAU),
        F.pick([silkTone, F.col('clothSaffron'), F.col('clothTeal')]), 'cloth');
    }
  }
});

FURN({
  key: 'br_shrine_altar', name: 'Shrine Altar / Idol', culture: 'beast-rider', type: 'altar', setting: 'both',
  rooms: ['shrine'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'plaster', 'cloth', 'foliage', 'emissive'],
  w: 2.2, d: 2.2, h: 2.3, variants: 2,
  variantDims: [{ w: 2.2, d: 2.2, h: 1.9 }, { w: 2.2, d: 2.2, h: 2.3 }],
  build: function (F) {
    if (F.variant === 1) {
      const red = F.col('redCopper'), gold = F.col('clothSaffron');
      const corners = [[-0.9, -0.9], [0.9, -0.9], [0.9, 0.9], [-0.9, 0.9]];
      for (let i = 0; i < corners.length; i++) {
        const c = corners[i];
        F.box(c[0], 0, c[1], 0.2, 0.08, 0.2, 0, F.col('stoneTaupe'), 'stone');
        F.box(c[0], 0.08, c[1], 0.14, 1.52, 0.14, 0, red, 'wood');
        F.box(c[0], 1.55, c[1], 0.18, 0.08, 0.18, 0, gold, 'wood');
      }
      F.box(0, 0, 0, 1.4, 1.1, 1.4, 0, F.shade(red, -0.1), 'plaster');
      F.box(0, 1.1, 0, 1.55, 0.1, 1.55, 0, gold, 'wood');
      F.box(0, 0.25, 0.71, 0.9, 0.6, 0.05, 0, gold, 'wood');
      F.box(0, 0.25, -0.71, 0.9, 0.6, 0.05, 0, F.shade(gold, -0.15), 'wood');
      F.box(0.71, 0.25, 0, 0.05, 0.6, 0.9, 0, F.shade(gold, -0.15), 'wood');
      F.box(-0.71, 0.25, 0, 0.05, 0.6, 0.9, 0, F.shade(gold, -0.15), 'wood');
      /* the idol standing on the altar block */
      F.frustum(0, 1.2, 0, 0.22, 0.14, 0.38, 0, F.shade(red, 0.1), 'wood', 8);
      F.ball(0, 1.66, 0, 0.14, gold, 'wood');
      F.cone(0, 1.72, 0, 0.18, 0.26, 0, F.shade(gold, 0.1), 'wood');
      /* tiered canopy over the whole thing */
      F.cone(0, 1.63, 0, 1.1, 0.42, 0.2, red, 'wood');
      F.cone(0, 1.95, 0, 0.7, 0.3, -0.15, gold, 'wood');
      F.cone(0, 2.15, 0, 0.16, 0.15, 0, F.shade(gold, 0.15), 'wood');
      /* pennant cords between the posts, all four sides */
      const flagColors = F.cols(['clothVermilion', 'clothSaffron', 'clothTeal']);
      for (let i = 0; i < 2; i++) {
        const a = corners[i * 2], b = corners[i * 2 + 1];
        F.rod(a[0], 1.35, a[1], b[0], 1.35, b[1], 0.012, F.col('timberMud'), 'wood');
        const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        F.box(mx, 1.18, mz, 0.2, 0.16, 0.02, F.rr(0, F.TAU), F.pick(flagColors), 'cloth');
      }
      F.ball(0, 2.26, 0, 0.05, F.col('amber'), 'glow');
      F.lamp(0, 1.4, 0, 0.8, 9);
    } else {
      const woodColor = F.col('timberWalnut');
      /* carved stump idol on a stone kerb, with bowls all round it */
      F.cyl(0, 0, 0, 0.78, 0.12, 0, F.col('stoneTaupe'), 'stone');
      F.cyl(0, 0.12, 0, 0.55, 0.78, 0, woodColor, 'wood');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.rod(Math.cos(a) * 0.53, 0.2, Math.sin(a) * 0.53, Math.cos(a) * 0.53, 0.85, Math.sin(a) * 0.53, 0.05, F.shade(woodColor, -0.12), 'wood');
      }
      F.cyl(0, 0.9, 0, 0.42, 0.34, 0, F.shade(woodColor, 0.08), 'wood');
      F.ball(0, 1.32, 0, 0.22, F.shade(woodColor, 0.16), 'wood');
      F.cone(0, 1.4, 0, 0.26, 0.4, 0, F.shade(woodColor, -0.06), 'wood');
      /* offering bowls and votive lamps front and back */
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        const bx = Math.cos(a) * 0.82, bz = Math.sin(a) * 0.82;
        F.cyl(bx, 0, bz, 0.26, 0.32, 0, F.shade(woodColor, -0.1), 'wood');
        F.cyl(bx, 0.3, bz, 0.22, 0.05, 0, F.shade(woodColor, -0.25), 'wood');
        if (i % 2 === 0) F.blob(bx, 0.38, bz, 0.13, 0.1, 0, F.col('ice'), 'glow');
        else F.blob(bx, 0.38, bz, 0.13, 0.12, F.rr(0, F.TAU), F.pick(['leafVermilion', 'clothSaffron']), 'leafy');
      }
      F.rod(0, 1.6, 0, 0, 1.75, 0, 0.03, F.shade(woodColor, 0.1), 'wood');
      F.blob(0, 1.78, 0, 0.16, 0.2, 0, F.col('leafMoss'), 'leafy');
      F.lamp(0, 0.6, 0.7, 0.9, 10);
    }
  }
});

FURN({
  key: 'br_roost_fittings', name: 'Roost Fittings', culture: 'beast-rider', type: 'rack', setting: 'outdoor',
  rooms: ['roost'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'stone', 'plaster', 'metal', 'cloth', 'foliage'],
  w: 4, d: 3.35, h: 2.8, variants: 1,
  build: function (F) {
    F.shift(0.10, 0.24); /* centre the footprint on the origin (verify.py declared-size) */
    const timber = F.col('timberUmber');
    const strawTone = F.col('leafOchre');
    /* perch gantry: two posts, a cross head and the roost bar itself */
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 1.7, 0, -0.9, 0.3, 0.08, 0.3, 0, F.col('stoneTaupe'), 'stone');
      F.cyl(s * 1.7, 0.08, -0.9, 0.12, 2.5, 0, timber, 'wood');
      F.beam(s * 1.7, 2.1, -0.9, s * 1.7, 2.5, -0.35, 0.08, 0.08, F.shade(timber, -0.08), 'wood');
      F.beam(s * 1.7, 2.2, -0.9, s * (1.7 - 0.45), 2.54, -0.9, 0.07, 0.07, timber, 'wood');
    }
    F.beam(-1.7, 2.58, -0.9, 1.7, 2.58, -0.9, 0.12, 0.12, timber, 'wood');
    F.rod(-1.7, 2.3, -0.4, 1.7, 2.3, -0.4, 0.09, F.shade(timber, 0.14), 'wood');
    for (let i = 0; i < 2; i++) {
      F.rod(-1.0 + i * 2.0, 2.54, -0.9, -1.0 + i * 2.0, 2.34, -0.4, 0.015, F.col('timberSepia'), 'wood');
    }
    /* mounting block and a step up to the perch */
    F.box(-1.6, 0, -1.2, 0.9, 0.25, 0.6, 0, timber, 'wood');
    F.box(-1.6, 0.25, -1.2, 0.75, 0.22, 0.5, 0, F.shade(timber, 0.08), 'wood');
    F.rod(-1.2, 0.25, -1.2, -1.9, 0.35, -1.5, 0.1, F.shade(timber, -0.05), 'wood');
    /* nest pan of straw */
    F.cyl(-0.3, 0, -1.2, 0.7, 0.06, 0, F.shade(strawTone, -0.1), 'wood');
    F.cone(-0.3, 0.06, -1.2, 0.65, 0.7, 0.2, strawTone, 'leafy');
    /* feed trough and water pan */
    F.box(1.0, 0, -1.2, 1.4, 0.35, 0.7, 0, F.shade(timber, 0.05), 'wood');
    F.box(1.0, 0.3, -1.2, 1.2, 0.06, 0.55, 0, F.col('plasterSlate'), 'plaster');
    F.box(1.68, 0, -1.2, 0.12, 0.42, 0.7, 0, F.shade(timber, -0.12), 'wood');
    /* tack rail with harness and blankets, at the front */
    F.box(0.5, 0, 0.9, 0.09, 1.7, 0.09, 0, timber, 'wood');
    F.box(1.6, 0, 0.9, 0.09, 1.7, 0.09, 0, timber, 'wood');
    F.beam(0.5, 1.65, 0.9, 1.6, 1.65, 0.9, 0.06, 0.06, timber, 'wood');
    F.beam(0.5, 0.9, 0.9, 0.5, 0.9, 0.45, 0.05, 0.05, F.shade(timber, -0.1), 'wood');
    F.box(0.75, 0.9, 0.9, 0.35, 0.6, 0.05, F.rr(-0.1, 0.1), F.pick(['clothVermilion', 'clothTeal']), 'cloth');
    F.rod(1.05, 1.6, 0.9, 1.05, 0.5, 1.15, 0.025, F.shade(timber, -0.1), 'wood');
    F.ball(1.05, 0.46, 1.16, 0.07, F.col('pewter'), 'metal');
    /* straw bales stacked at the back of the stall */
    for (let i = 0; i < 2; i++) {
      F.box(-1.3 + i * 0.9, 0, 1.15, 0.6, 0.4, 0.45, F.rr(-0.15, 0.15), strawTone, 'leafy');
    }
    F.box(-1.1, 0.4, 1.15, 0.6, 0.38, 0.45, F.rr(-0.15, 0.15), F.shade(strawTone, -0.06), 'leafy');
  }
});

FURN({
  key: 'br_bench', name: 'Bench', culture: 'beast-rider', type: 'bench', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'street'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  w: 1.8, d: 0.6, h: 0.45, variants: 1,
  build: function (F) {
    const plank = F.col('timberMud'), legC = F.shade(plank, -0.14), pegC = F.shade(plank, -0.3);
    /* two slab ends with cut-out feet, an apron each side and a stretcher */
    for (let s = -1; s <= 1; s += 2) {
      const lx = s * 0.68 + F.rr(-0.02, 0.02);
      F.box(lx, 0.05, 0, 0.13, 0.33, 0.42, 0, legC, 'wood');
      F.box(lx, 0, -0.17, 0.16, 0.06, 0.18, 0, F.shade(legC, -0.12), 'wood');
      F.box(lx, 0, 0.17, 0.16, 0.06, 0.18, 0, F.shade(legC, -0.12), 'wood');
      F.beam(lx - s * 0.04, 0.36, 0, lx + s * 0.13, 0.16, 0, 0.06, 0.34, legC, 'wood');
    }
    F.box(0, 0.24, -0.2, 1.3, 0.09, 0.05, 0, F.shade(plank, -0.2), 'wood');
    F.box(0, 0.24, 0.2, 1.3, 0.09, 0.05, 0, F.shade(plank, -0.2), 'wood');
    F.box(0, 0.14, 0, 1.28, 0.07, 0.08, 0, F.shade(plank, -0.24), 'wood');
    /* seat: two planks with a visible seam, slightly out of true */
    F.box(0, 0.38, -0.14, 1.8, 0.07, 0.26, 0, plank, 'wood');
    F.box(0, 0.38 + F.rr(0, 0.008), 0.14, 1.8, 0.07, 0.26, 0, F.shade(plank, 0.04), 'wood');
    for (let s = -1; s <= 1; s += 2) {
      F.cyl(s * 0.68, 0.44, 0.14, 0.025, 0.02, 0, pegC, 'wood');
    }
    F.blob(F.rr(-0.5, 0.5), 0.45, F.rr(-0.1, 0.1), 0.08, 0.016, F.rr(0, F.TAU), F.shade(plank, -0.24), 'wood');
  }
});

FURN({
  key: 'br_table', name: 'Table', culture: 'beast-rider', type: 'table', setting: 'both',
  rooms: ['hall', 'tavern', 'yard'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.5, right: 0.5 },
  materials: ['timber', 'foliage'],
  w: 4.2, d: 2.7, h: 1.1, variants: 2,
  variantDims: [{ w: 1.6, d: 0.9, h: 0.82 }, { w: 4.2, d: 2.7, h: 1.1 }],
  build: function (F) {
    const plank = F.col('timberMud'), legC = F.shade(plank, -0.12), pegC = F.shade(plank, -0.3);
    if (F.variant === 1) {
      /* long refectory table: two trestle ends plus a centre horse */
      const len = 4.2, legH = 0.8;
      const ends = [[-len / 2 + 0.4, 0], [len / 2 - 0.4, 0], [0, -0.9], [0, 0.9]];
      for (let i = 0; i < ends.length; i++) {
        const ex = ends[i][0], ez = ends[i][1];
        F.box(ex, 0.06, ez, 0.2, legH - 0.06, 0.72, 0, legC, 'wood');
        F.box(ex, 0, ez, 0.3, 0.08, 0.9, 0, F.shade(legC, -0.14), 'wood');
        F.beam(ex, legH - 0.06, ez, ex, 0.2, ez + 0.42, 0.14, 0.07, legC, 'wood');
      }
      F.box(0, 0.36, 0, len - 0.6, 0.09, 0.14, 0, F.shade(plank, -0.2), 'wood');
      F.box(0, 0.62, -0.42, len - 0.5, 0.11, 0.07, 0, F.shade(plank, -0.16), 'wood');
      F.box(0, 0.62, 0.42, len - 0.5, 0.11, 0.07, 0, F.shade(plank, -0.16), 'wood');
      for (let i = 0; i < 3; i++) {
        F.box(0, legH + F.rr(0, 0.01), -0.33 + i * 0.33, len, 0.09, 0.32, 0, F.shade(plank, F.rr(-0.05, 0.05)), 'wood');
      }
      F.box(0, legH, 0, len + 0.04, 0.05, 1.04, 0, F.shade(plank, -0.12), 'wood');
      for (let i = 0; i < 2; i++) {
        F.cyl(ends[i][0], legH + 0.09, 0.3, 0.03, 0.03, 0, pegC, 'wood');
      }
      /* benches drawn up along both flanks, giving the piece its real footprint */
      for (let s = -1; s <= 1; s += 2) {
        F.box(0, 0.4, s * 1.1, 3.4, 0.08, 0.34, 0, F.shade(plank, 0.04), 'wood');
        for (let t = -1; t <= 1; t += 2) {
          F.box(t * 1.4, 0, s * 1.1, 0.12, 0.4, 0.3, 0, legC, 'wood');
        }
        F.box(0, 0.2, s * 1.1, 3.0, 0.06, 0.07, 0, F.shade(legC, -0.1), 'wood');
      }
      F.cyl(0.9, 0.89, 0, 0.11, 0.2, 0, F.col('timberUmber'), 'wood');
      F.blob(-0.8, 0.95, 0.1, 0.16, 0.12, F.rr(0, F.TAU), F.col('leafVermilion'), 'leafy');
    } else {
      /* four-square table: legs with feet, apron, stretchers and plank top */
      const legH = 0.72;
      for (let s = -1; s <= 1; s += 2) {
        for (let t = -1; t <= 1; t += 2) {
          F.box(s * 0.64, 0.05, t * 0.32, 0.11, legH - 0.05, 0.11, 0, legC, 'wood');
          F.box(s * 0.64, 0, t * 0.32, 0.16, 0.06, 0.16, 0, F.shade(legC, -0.14), 'wood');
        }
        F.box(s * 0.64, 0.24, 0, 0.07, 0.07, 0.56, 0, F.shade(plank, -0.22), 'wood');
      }
      F.box(0, 0.24, 0, 1.2, 0.07, 0.07, 0, F.shade(plank, -0.22), 'wood');
      F.box(0, legH - 0.16, -0.32, 1.2, 0.12, 0.06, 0, F.shade(plank, -0.16), 'wood');
      F.box(0, legH - 0.16, 0.32, 1.2, 0.12, 0.06, 0, F.shade(plank, -0.16), 'wood');
      for (let i = 0; i < 3; i++) {
        F.box(0, legH + F.rr(0, 0.008), -0.3 + i * 0.3, 1.6, 0.08, 0.28, 0, F.shade(plank, F.rr(-0.05, 0.05)), 'wood');
      }
      F.box(0, legH, 0, 1.64, 0.04, 0.94, 0, F.shade(plank, -0.12), 'wood');
      for (let s = -1; s <= 1; s += 2) {
        F.cyl(s * 0.64, legH + 0.08, 0.32, 0.028, 0.025, 0, pegC, 'wood');
      }
      F.blob(F.rr(-0.4, 0.4), 0.81, F.rr(-0.2, 0.2), 0.1, 0.02, F.rr(0, F.TAU), F.shade(plank, -0.26), 'wood');
    }
  }
});

FURN({
  key: 'br_well', name: 'Village Well', culture: 'beast-rider', type: 'well', setting: 'outdoor',
  rooms: ['street', 'yard', 'plaza'], anchor: 'floor', clearance: { front: 1, back: 1, left: 1, right: 1 },
  materials: ['timber', 'stone', 'metal', 'foliage'],
  w: 2.85, d: 2.6, h: 2.6, variants: 1,
  build: function (F) {
    const timber = F.col('timberUmber');
    /* stave-built kerb: barrel drum, hoops, and a boarded rim */
    F.cyl(0, 0, 0, 1.05, 0.85, 0, timber, 'wood');
    for (let i = 0; i < 7; i++) {
      const a = i * F.TAU / 7;
      F.box(Math.cos(a) * 1.06, 0.05, Math.sin(a) * 1.06, 0.2, 0.78, 0.06, -a - Math.PI / 2, F.shade(timber, i % 2 ? 0.07 : -0.07), 'wood');
    }
    F.cyl(0, 0.16, 0, 1.11, 0.07, 0, F.col('iron'), 'metal');
    F.cyl(0, 0.62, 0, 1.11, 0.07, 0, F.col('iron'), 'metal');
    F.cyl(0, 0.85, 0, 1.16, 0.08, 0, F.shade(timber, 0.12), 'wood');
    F.cyl(0, 0.84, 0, 0.95, 0.04, 0, F.col('stoneCharcoal'), 'stone');
    /* windlass frame: posts on pads, braces, barrel with a crank, bucket on the line */
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 0.95, 0.93, -0.6, 0.12, 1.42, 0.12, 0, timber, 'wood');
      F.beam(s * 0.95, 1.9, -0.6, s * 0.58, 2.28, -0.6, 0.07, 0.07, timber, 'wood');
      F.beam(s * 0.95, 1.6, -0.6, s * 0.95, 2.3, -0.16, 0.06, 0.06, F.shade(timber, -0.1), 'wood');
    }
    F.beam(-0.95, 2.34, -0.6, 0.95, 2.34, -0.6, 0.1, 0.1, timber, 'wood');
    F.rod(-0.66, 2.02, -0.6, 0.66, 2.02, -0.6, 0.12, F.shade(timber, 0.12), 'wood');
    F.rod(0.7, 2.02, -0.6, 0.92, 2.02, -0.6, 0.035, F.col('iron'), 'metal');
    F.rod(0.92, 2.02, -0.6, 0.92, 1.8, -0.44, 0.03, F.col('iron'), 'metal');
    F.rod(0, 1.96, -0.6, 0, 1.1, -0.1, 0.015, F.col('timberSepia'), 'wood');
    F.cyl(0, 0.9, -0.05, 0.16, 0.24, 0, F.shade(timber, -0.08), 'wood');
    F.cyl(0, 0.95, -0.05, 0.17, 0.04, 0, F.col('iron'), 'metal');
    /* thatched hood on rafters */
    F.beam(-0.95, 2.38, -0.6, 0, 2.5, 0.1, 0.07, 0.07, timber, 'wood');
    F.beam(0.95, 2.38, -0.6, 0, 2.5, 0.1, 0.07, 0.07, timber, 'wood');
    F.box(-0.6, 2.2, -0.6, 1.45, 0.08, 0.95, 0.24, F.shade('leafOchre', -0.05), 'leafy');
    F.box(0.6, 2.2, -0.6, 1.45, 0.08, 0.95, -0.24, F.shade('leafOchre', -0.05), 'leafy');
    F.box(0, 2.46, -0.6, 2.1, 0.12, 0.28, 0, F.col('leafOchre'), 'leafy');
    F.blob(0.8, 0.25, 0.9, 0.3, 0.42, F.rr(0, F.TAU), F.shade(timber, 0.05), 'wood');
  }
});

FURN({
  key: 'br_lamppost', name: 'Lantern Post', culture: 'beast-rider', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'yard'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'stone', 'glass', 'cloth', 'foliage', 'emissive'],
  w: 0.6, d: 0.6, h: 2.4, variants: 1,
  build: function (F) {
    const timber = F.col('timberUmber'), dark = F.col('timberSepia');
    /* stone foot, a post with a collar, and lashed knee brackets to the head */
    F.box(0, 0, 0, 0.55, 0.12, 0.55, 0, F.col('stoneTaupe'), 'stone');
    F.frustum(0, 0.12, 0, 0.19, 0.11, 0.16, 0, F.shade(timber, -0.12), 'wood', 6);
    F.cyl(0, 0.28, 0, 0.08, 1.6, 0, timber, 'wood');
    F.cyl(0, 0.75, 0, 0.1, 0.05, 0, dark, 'cloth');
    F.cyl(0, 1.88, 0, 0.1, 0.05, 0, dark, 'cloth');
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      F.rod(Math.cos(a) * 0.06, 1.72, Math.sin(a) * 0.06, Math.cos(a) * 0.2, 1.94, Math.sin(a) * 0.2, 0.018, dark, 'wood');
    }
    /* lantern: pan, corner bars, paper panels, flame, thatched cap and finial */
    F.box(0, 1.93, 0, 0.44, 0.05, 0.44, 0, dark, 'wood');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4;
      F.rod(Math.cos(a) * 0.19, 1.98, Math.sin(a) * 0.19, Math.cos(a) * 0.19, 2.32, Math.sin(a) * 0.19, 0.016, dark, 'wood');
    }
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4;
      F.box(Math.sin(a) * 0.185, 2.0, Math.cos(a) * 0.185, 0.28, 0.3, 0.02, a, F.col('clothIvory'), 'glass');
    }
    F.ball(0, 2.14, 0, 0.1, F.col('amber'), 'glow');
    F.cone(0, 1.99, 0, 0.07, 0.16, 0, F.col('candle'), 'glow');
    F.pyrRoof(0, 2.32, 0, 0.52, 0.16, 0.52, 0, F.shade('leafOchre', -0.08), 'leafy');
    F.cone(0, 2.28, 0, 0.09, 0.12, 0, dark, 'wood');
    F.lamp(0, 2.14, 0, 1.1, 14);
  }
});

FURN({
  key: 'br_drying_rack', name: 'Drying Rack', culture: 'beast-rider', type: 'rack', setting: 'outdoor',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['timber', 'stone', 'cloth', 'foliage'],
  w: 2.2, d: 0.8, h: 2.0, variants: 1,
  build: function (F) {
    const timber = F.col('timberUmber'), lash = F.col('iron');
    /* two A-frames, splayed in z, lashed at the apex and tied at the foot */
    for (let s = -1; s <= 1; s += 2) {
      const lx = s * 1.0;
      F.box(lx, 0, -0.34, 0.2, 0.06, 0.2, 0, F.col('stoneTaupe'), 'stone');
      F.box(lx, 0, 0.34, 0.2, 0.06, 0.2, 0, F.col('stoneTaupe'), 'stone');
      F.rod(lx, 0.04, -0.34, lx, 1.8, -0.04, 0.055, timber, 'wood');
      F.rod(lx, 0.04, 0.34, lx, 1.8, 0.04, 0.055, timber, 'wood');
      F.rod(lx, 1.15, -0.16, lx, 1.15, 0.16, 0.03, F.shade(timber, -0.08), 'wood');
      F.cyl(lx, 1.74, 0, 0.09, 0.09, 0, lash, 'cloth');
    }
    /* ridge pole and two lower rails running the length */
    F.rod(-1.06, 1.78, 0, 1.06, 1.78, 0, 0.05, F.shade(timber, 0.1), 'wood');
    F.rod(-1.02, 1.15, -0.16, 1.02, 1.15, -0.16, 0.035, F.shade(timber, 0.06), 'wood');
    F.rod(-1.02, 1.15, 0.16, 1.02, 1.15, 0.16, 0.035, F.shade(timber, 0.06), 'wood');
    F.rod(-1.02, 0.45, 0, 1.02, 0.45, 0, 0.035, F.shade(timber, -0.04), 'wood');
    /* split fish hung off the ridge, front and back */
    const fish = F.cols(['clothGrey', 'clothTaupe', 'clothGrey']);
    for (let i = 0; i < 3; i++) {
      const lx = -0.7 + i * 0.7;
      const lz = (i % 2 === 0 ? -1 : 1) * 0.06;
      F.rod(lx, 1.76, lz, lx, 1.62, lz, 0.008, lash, 'cloth');
      F.box(lx, 1.14, lz, 0.16, 0.48, 0.06, F.rr(-0.12, 0.12), fish[i % 3], 'cloth');
    }
    /* herb bundles on the lower rails, and a cloth over the front rail */
    for (let i = 0; i < 2; i++) {
      const hx = -0.7 + i * 1.4;
      F.blob(hx, 1.0, -0.16, 0.11, 0.34, F.rr(0, F.TAU), F.pick(['glassLeaf', 'leaf']), 'leafy');
      F.cyl(hx, 1.12, -0.16, 0.05, 0.06, 0, lash, 'cloth');
    }
    F.box(0.2, 0.6, 0.16, 0.7, 0.62, 0.04, F.rr(-0.06, 0.06), F.pick(['clothVermilion', 'clothTeal', 'clothSaffron']), 'cloth');
    F.box(-0.7, 0.66, 0.16, 0.5, 0.5, 0.04, F.rr(-0.06, 0.06), F.col('clothIvory'), 'cloth');
    /* a basket on the ground under the rack */
    F.cyl(0.75, 0, 0.02, 0.24, 0.3, 0, F.shade(timber, 0.1), 'wood');
    F.cyl(0.75, 0.3, 0.02, 0.22, 0.04, 0, F.shade(timber, -0.12), 'wood');
    F.blob(0.75, 0.36, 0.02, 0.15, 0.12, F.rr(0, F.TAU), F.col('clothGrey'), 'cloth');
  }
});

FURN({
  key: 'br_fruit_stack', name: 'Fruit Stack', culture: 'beast-rider', type: 'stack', setting: 'both',
  rooms: ['market', 'store'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'cloth', 'foliage'],
  w: 2.05, d: 1.85, h: 1.2, variants: 1,
  build: function (F) {
    const plinthTone = F.col('clothSand');
    const crate = F.col('timberMudDark');
    const fruitTones = F.cols(['leafVermilion', 'leafMadder', 'clothSaffron']);
    /* a mat under the whole display */
    F.box(0, 0, 0.1, 1.9, 0.03, 1.4, 0, F.shade(plinthTone, -0.25), 'cloth');
    /* three coiled baskets, each heaped with fruit */
    const spots = [[-0.7, -0.35], [0.0, 0.05], [0.7, -0.35]];
    for (let i = 0; i < spots.length; i++) {
      const sx = spots[i][0], sz = spots[i][1];
      F.cyl(sx, 0.02, sz, 0.3, 0.32, 0, plinthTone, 'wood');
      F.cyl(sx, 0.34, sz, 0.32, 0.05, 0, F.shade(plinthTone, 0.1), 'wood');
      for (let j = 0; j < 2; j++) {
        F.blob(sx + F.rr(-0.15, 0.15), 0.42 + F.rr(0, 0.12), sz + F.rr(-0.15, 0.15), 0.14, 0.14, 0,
          F.pick(fruitTones), 'leafy');
      }
    }
    /* loose fruit spilled onto the mat at the front */
    for (let j = 0; j < 3; j++) {
      F.blob(-0.2 + F.rr(-0.3, 0.3), 0.12, 0.62 + F.rr(-0.15, 0.15), 0.1, 0.1, 0, F.pick(fruitTones), 'leafy');
    }
    /* stacked crates behind, taking the display up to full height */
    F.box(0.62, 0, -0.62, 0.62, 0.42, 0.52, 0.12, crate, 'wood');
    F.box(0.62, 0.42, -0.62, 0.58, 0.4, 0.48, -0.18, F.shade(crate, 0.07), 'wood');
    F.box(0.6, 0.82, -0.6, 0.54, 0.24, 0.44, 0.22, F.shade(crate, -0.07), 'wood');
    for (let j = 0; j < 4; j++) {
      F.blob(0.6 + F.rr(-0.18, 0.18), 1.08, -0.6 + F.rr(-0.14, 0.14), 0.1, 0.1, 0, F.pick(fruitTones), 'leafy');
    }
    /* a hanging bunch off a stake, and leafy tops on the baskets */
    F.cyl(-0.85, 0, -0.62, 0.05, 1.05, 0, F.col('timberUmber'), 'wood');
    F.rod(-0.85, 1.02, -0.62, -0.5, 1.02, -0.62, 0.025, F.col('timberUmber'), 'wood');
    for (let j = 0; j < 2; j++) {
      F.rod(-0.75 + j * 0.2, 1.0, -0.62, -0.75 + j * 0.2, 0.82, -0.62, 0.008, F.col('iron'), 'cloth');
      F.blob(-0.75 + j * 0.2, 0.72, -0.62, 0.1, 0.24, F.rr(0, F.TAU), F.pick(fruitTones), 'leafy');
    }
    F.blob(-0.7, 0.58, -0.35, 0.16, 0.16, F.rr(0, F.TAU), F.col('leafOlive'), 'leafy');
    F.blob(0.7, 0.58, -0.35, 0.16, 0.16, F.rr(0, F.TAU), F.col('leafMoss'), 'leafy');
  }
});

FURN({
  key: 'br_woodpile', name: 'Woodpile', culture: 'beast-rider', type: 'stack', setting: 'outdoor',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'bark', 'cloth'],
  w: 2.0, d: 1.4, h: 1.3, variants: 1,
  build: function (F) {
    const logColor = F.col('barkUmber'), cut = F.col('timberStraw');
    /* end stakes holding the stack in, one pair each side */
    for (let s = -1; s <= 1; s += 2) {
      F.rod(s * 0.96, 0, -0.5, s * 1.02, 1.1, -0.52, 0.05, F.shade(logColor, 0.08), 'bark');
      F.rod(s * 0.96, 0, 0.5, s * 1.02, 1.1, 0.52, 0.05, F.shade(logColor, 0.08), 'bark');
      F.rod(s * 0.99, 0.6, -0.5, s * 0.99, 0.6, 0.5, 0.025, F.col('iron'), 'cloth');
    }
    /* the stack itself: individual logs laid along z, in tapering courses */
    const rows = [
      { n: 4, y: 0.0, half: 0.82 },
      { n: 4, y: 0.29, half: 0.76 },
      { n: 3, y: 0.58, half: 0.56 },
      { n: 2, y: 0.86, half: 0.3 }
    ];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let i = 0; i < row.n; i++) {
        const lx = -row.half + (2 * row.half / Math.max(row.n - 1, 1)) * i;
        const lr = 0.135;
        const z0 = -0.58 + F.rr(-0.04, 0.06), z1 = 0.58 + F.rr(-0.06, 0.04);
        const wob = F.rr(-0.03, 0.03);
        F.rod(lx, row.y + lr, z0, lx + wob, row.y + lr + F.rr(-0.02, 0.02), z1, lr,
          F.shade(logColor, F.rr(-0.08, 0.08)), 'bark');
        if (r === 3) F.cyl(lx, row.y + lr - 0.11, z1 + 0.01, lr * 0.8, 0.02, 0, F.shade(cut, F.rr(-0.1, 0.1)), 'wood');
      }
    }
    /* a couple of logs laid crossways on top, and kindling round the base */
    F.rod(-0.5, 1.12, 0.1, 0.5, 1.1, -0.1, 0.12, F.shade(logColor, 0.05), 'bark');
    F.rod(-0.25, 1.1, -0.42, 0.35, 1.14, 0.45, 0.1, F.shade(logColor, -0.06), 'bark');
    for (let i = 0; i < 3; i++) {
      F.rod(F.rr(-1.0, 1.0), 0.04, F.rr(-0.68, 0.68), F.rr(-1.0, 1.0), 0.04, F.rr(-0.68, 0.68), 0.035,
        F.shade(logColor, F.rr(-0.1, 0.12)), 'bark');
      F.blob(F.rr(-0.9, 0.9), 0.03, F.rr(-0.66, 0.66), F.rr(0.07, 0.13), 0.05, F.rr(0, F.TAU), cut, 'wood');
    }
  }
});

/* ---------- interior additions (2026-10): a surface piece ---------- */

FURN({
  key: 'br_tool_set', name: 'Tool Roll', culture: 'beast-rider', type: 'tool', setting: 'both',
  rooms: ['workshop', 'roost', 'store'], anchor: 'surface', clearance: {},
  materials: ['skin', 'timber', 'metal'],
  w: 0.62, d: 0.36, h: 0.08, variants: 2, variantNames: ['carpenter', 'harness-maker'],
  variantDims: [{ w: 0.62, d: 0.36, h: 0.08 }, { w: 0.62, d: 0.36, h: 0.06 }],
  build: function (F) {
    const hide = F.col('hideOak'), wood = F.col('timberUmber'), iron = F.col('steel');
    /* an unrolled leather tool roll, its loops along the back edge */
    F.box(0, 0, 0, 0.6, 0.008, 0.34, 0, hide, 'skin');
    F.rod(-0.3, 0.025, -0.15, 0.3, 0.025, -0.15, 0.022, F.shade(hide, -0.15), 'skin');
    if (F.variant === 0) {
      /* mallet, two chisels, a drawknife */
      F.box(-0.2, 0.008, 0.02, 0.06, 0.06, 0.12, 0, F.shade(wood, 0.1), 'wood');
      F.rod(-0.2, 0.035, 0.08, -0.2, 0.035, 0.16, 0.012, wood, 'wood');
      for (const x of [-0.07, 0.0]) {
        F.box(x, 0.008, 0.08, 0.02, 0.02, 0.09, 0, wood, 'wood');
        F.box(x, 0.008, -0.03, 0.016, 0.008, 0.13, 0, iron, 'metal');
      }
      F.box(0.15, 0.008, 0.04, 0.2, 0.006, 0.025, 0, iron, 'metal');
      for (const s of [-1, 1]) F.rod(0.15 + s * 0.1, 0.02, 0.04, 0.15 + s * 0.12, 0.02, 0.12, 0.012, wood, 'wood');
    } else {
      /* awl, round knife, a coil of thong, a buckle */
      F.rod(-0.18, 0.02, -0.02, -0.18, 0.02, 0.12, 0.014, wood, 'wood');
      F.rod(-0.18, 0.02, -0.08, -0.18, 0.02, -0.02, 0.004, iron, 'metal');
      F.dome(0.0, 0.008, 0.04, 0.06, 0.02, 0, iron, 'metal');
      F.box(0.0, 0.008, 0.12, 0.02, 0.02, 0.06, 0, wood, 'wood');
      F.cyl(0.18, 0.008, 0.04, 0.07, 0.03, 0, F.shade(hide, -0.25), 'skin');
      F.cyl(0.18, 0.009, 0.04, 0.04, 0.03, 0, F.shade(hide, 0.1), 'skin');
      F.box(0.24, 0.008, -0.08, 0.05, 0.006, 0.04, 0, F.col('brass'), 'metal');
    }
  }
});

/* ================= Yuni (32 pieces) ================= */

FURN({
  key: 'yuni_common_low_table', name: 'Low round table', culture: 'yuni-common', type: 'table', setting: 'indoor',
  rooms: ['hall'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'plaster'],
  w: 1.12, d: 1.12, h: 0.47, variants: 2,
  variantDims: [
    { w: 1.12, d: 1.12, h: 0.43 },
    { w: 1.12, d: 1.12, h: 0.47 }
  ],
  build: function (F) {
    const wood = F.col('timberTeak');
    /* three splayed feet under a turned pedestal */
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.4;
      F.beam(0, 0.05, 0, Math.cos(a) * 0.30, 0.02, Math.sin(a) * 0.30, 0.075, 0.05, F.shade(wood, -0.2), 'wood');
      F.box(Math.cos(a) * 0.30, 0, Math.sin(a) * 0.30, 0.09, 0.035, 0.09, a, F.shade(wood, -0.28), 'wood');
    }
    F.cyl(0, 0.02, 0, 0.135, 0.05, 0, F.shade(wood, -0.18), 'wood');   /* collar over the feet */
    F.cyl(0, 0.07, 0, 0.085, 0.23, 0, F.shade(wood, -0.10), 'wood');   /* turned shaft */
    F.cyl(0, 0.155, 0, 0.11, 0.035, 0, F.shade(wood, -0.16), 'wood');  /* astragal */
    F.cyl(0, 0.29, 0, 0.14, 0.04, 0, F.shade(wood, -0.12), 'wood');    /* capital */
    F.cyl(0, 0.325, 0, 0.555, 0.022, 0, F.shade(wood, -0.08), 'wood'); /* rim moulding */
    F.cyl(0, 0.33, 0, 0.545, 0.05, 0, wood, 'wood');                 /* top */
    F.cyl(0, 0.38, 0, 0.525, 0.02, 0, F.shade(wood, 0.08), 'wood');    /* worn upper face */
    if (F.variant === 1) {
      F.cyl(0, 0.40, 0, 0.32, 0.028, 0, F.shade('plasterMadder', -0.15), 'plaster');  /* painted tray */
      F.cyl(0, 0.41, 0, 0.29, 0.02, 0, F.col('plasterMadder'), 'plaster');
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4;
        F.box(Math.cos(a) * 0.21, 0.428, Math.sin(a) * 0.21, 0.055, 0.006, 0.055, a, F.col('plasterBone'), 'plaster');
      }
    }
  }
});

FURN({
  key: 'yuni_common_floor_seating', name: 'Floor mat and cushions', culture: 'yuni-common', type: 'seating', setting: 'indoor',
  rooms: ['hall'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth'],
  w: 2.35, d: 1.55, h: 0.34, variants: 2,
  build: function (F) {
    const matA = F.col('clothTan'), matB = F.col('clothMustard');
    /* the mat is woven in strips, not one slab, and bound at the edges */
    for (let i = 0; i < 5; i++) {
      const z = -0.56 + i * 0.28;
      F.box(0, 0, z, 2.2, 0.03, 0.26, 0, i % 2 ? matA : F.shade(matA, -0.07), 'cloth');
    }
    F.box(0, 0, 0.72, 2.32, 0.035, 0.06, 0, matB, 'cloth');
    F.box(0, 0, -0.72, 2.32, 0.035, 0.06, 0, matB, 'cloth');
    F.box(-1.13, 0, 0, 0.06, 0.035, 1.5, 0, matB, 'cloth');
    F.box(1.13, 0, 0, 0.06, 0.035, 1.5, 0, matB, 'cloth');
    const cush = F.cols(['plasterMadder', 'clothOchre', 'clothTurquoise']);
    const pos = [[-0.6, 0.05], [0.05, 0.15], [0.6, -0.1]];
    for (let i = 0; i < 3; i++) {
      F.blob(pos[i][0], 0.19, pos[i][1], 0.35, 0.22, F.rr(-0.35, 0.35), cush[i], 'cloth');
      F.box(pos[i][0] + F.rr(-0.05, 0.05), 0.29, pos[i][1], 0.09, 0.02, 0.09, F.rr(-0.4, 0.4), F.shade(cush[i], 0.2), 'cloth');
    }
    if (F.variant === 1) {
      F.rod(-0.82, 0.17, -0.6, 0.82, 0.17, -0.6, 0.155, F.col('clothOchre'), 'cloth');   /* bolster */
      F.ball(-0.84, 0.17, -0.6, 0.155, F.shade('clothOchre', -0.12), 'cloth');
      F.ball(0.84, 0.17, -0.6, 0.155, F.shade('clothOchre', -0.12), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_common_storage_chest', name: 'Banded storage chest', culture: 'yuni-common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'store'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'metal'],
  w: 1.28, d: 0.68, h: 0.72, variants: 2,
  build: function (F) {
    const wood = F.col('timberOak');
    const legXs = [-0.5, 0.5], legZs = [-0.25, 0.25];
    for (const x of legXs) for (const z of legZs) {
      F.box(x, 0, z, 0.08, 0.12, 0.08, 0, F.shade(wood, -0.2), 'wood');
    }
    F.box(0, 0.12, 0, 1.2, 0.42, 0.62, 0, wood, 'wood');
    F.box(0, 0.54, 0, 1.28, 0.14, 0.68, 0, F.shade(wood, 0.05), 'wood');
    const brass = F.col('gilt');
    const strips = F.variant === 1 ? [-0.4, 0, 0.4] : [0];
    for (const x of strips) {
      F.box(x, 0.12, 0.315, 0.06, 0.42, 0.02, 0, brass, 'metal');
      F.box(x, 0.54, 0, 0.05, 0.14, 0.69, 0, F.shade(brass, -0.08), 'metal');   /* band over the lid */
    }
    /* hinges, lock plate and a lifting handle each end */
    F.box(-0.34, 0.52, -0.345, 0.12, 0.05, 0.03, 0, F.shade(brass, -0.15), 'metal');
    F.box(0.34, 0.52, -0.345, 0.12, 0.05, 0.03, 0, F.shade(brass, -0.15), 'metal');
    F.box(0, 0.40, 0.315, 0.14, 0.16, 0.025, 0, brass, 'metal');
    F.ball(0, 0.46, 0.34, 0.025, F.shade(brass, 0.15), 'metal');
    F.rod(-0.62, 0.36, -0.1, -0.62, 0.36, 0.1, 0.018, F.shade(brass, -0.1), 'metal');
    F.rod(0.62, 0.36, -0.1, 0.62, 0.36, 0.1, 0.018, F.shade(brass, -0.1), 'metal');
  }
});

FURN({
  key: 'yuni_common_water_jars', name: 'Water jar stand', culture: 'yuni-common', type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'court'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'stone'],
  w: 1.0, d: 0.7, h: 1.25, variants: 2,
  build: function (F) {
    const wood = F.col('timberOak'), standY = 0.75;
    F.box(0, standY, 0, 1.0, 0.06, 0.7, 0, wood, 'wood');
    const legXs = [-0.4, 0.4], legZs = [-0.28, 0.28];
    for (const x of legXs) for (const z of legZs) {
      F.rod(x, 0, z, x, standY, z, 0.025, F.shade(wood, -0.15), 'wood');
    }
    const terra = F.col('stoneClay');
    const jar = (lx, lz, scale) => {
      F.cyl(lx, standY, lz, 0.16 * scale, 0.34 * scale, 0, terra, 'stone');
      F.cyl(lx, standY + 0.34 * scale, lz, 0.09 * scale, 0.15 * scale, 0, F.shade(terra, -0.05), 'stone');
    };
    if (F.variant === 0) {
      jar(-0.2, 0, 1.0);
      jar(0.2, 0, 0.85);
    } else {
      jar(-0.22, 0.02, 0.85);
      jar(0.02, -0.05, 1.0);
      jar(0.24, 0.03, 0.75);
    }
  }
});

FURN({
  key: 'yuni_court_mosaic_divan', name: 'Mosaic divan', culture: 'yuni-court', type: 'seating', setting: 'both',
  rooms: ['court', 'hall'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'cloth'],
  w: 2.6, d: 1.0, h: 0.95, variants: 2,
  build: function (F) {
    const base = F.col('stoneOchre');
    F.box(0, 0, 0, 2.6, 0.55, 0.85, 0, base, 'stone');
    const tileColors = F.cols(['stoneTurquoiseLight', 'clothMadder', 'stoneBone', 'stoneMoss']);
    for (let i = 0; i < 11; i++) {
      const x = F.rr(-1.2, 1.2), y = F.rr(0.05, 0.45);
      F.box(x, y, 0.44, F.rr(0.05, 0.12), F.rr(0.05, 0.12), 0.02, 0, F.pick(tileColors), 'stone');
    }
    F.box(0, 0.55, 0, 2.5, 0.08, 0.8, 0, F.col('clothMadder'), 'cloth');
    const cush = F.cols(['stoneTurquoiseLight', 'stoneBone', 'clothMadder']);
    const xs = [-0.9, 0, 0.9];
    for (let i = 0; i < 3; i++) {
      F.blob(xs[i], 0.78, F.rr(-0.1, 0.1), 0.28, 0.15, 0, cush[i], 'cloth');
    }
    if (F.variant === 1) {
      F.box(0, 0.55, -0.42, 2.5, 0.4, 0.12, 0, base, 'stone');
      for (let i = 0; i < 4; i++) {
        const x = F.rr(-1.2, 1.2), y = F.rr(0.6, 0.9);
        F.box(x, y, -0.46, F.rr(0.06, 0.12), F.rr(0.06, 0.12), 0.02, 0, F.pick(tileColors), 'stone');
      }
    }
  }
});

FURN({
  key: 'yuni_court_brass_brazier', name: 'Standing brazier', culture: 'yuni-court', type: 'brazier', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['metal', 'emissive'],
  w: 0.84, d: 0.84, h: 1.15, variants: 2,
  build: function (F) {
    const brass = F.col('gilt'), iron = F.col('blackIron');
    const pts = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      const fx = Math.cos(a) * 0.37, fz = Math.sin(a) * 0.37;
      pts.push([fx, fz]);
      F.rod(fx, 0.03, fz, 0, 0.66, 0, 0.035, brass, 'metal');
      F.box(fx, 0, fz, 0.11, 0.035, 0.11, a, F.shade(brass, -0.28), 'metal');   /* pad foot */
    }
    /* the hoop that ties the legs, as three cast chords */
    for (let i = 0; i < 3; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % 3];
      F.rod(p0[0] * 0.62, 0.22, p0[1] * 0.62, p1[0] * 0.62, 0.22, p1[1] * 0.62, 0.016, F.shade(brass, -0.12), 'metal');
    }
    F.dome(0, 0.62, 0, 0.32, 0.22, 0, brass, 'metal');
    F.cyl(0, 0.61, 0, 0.34, 0.03, 0, F.shade(brass, 0.1), 'metal');
    F.cyl(0, 0.645, 0, 0.345, 0.022, 0, F.shade(brass, -0.14), 'metal');        /* rolled rim */
    F.cyl(0, 0.70, 0, 0.26, 0.05, 0, F.col('iron'), 'metal');                      /* ash bed */
    for (let i = 0; i < 2; i++) {
      F.box(F.rr(-0.15, 0.15), 0.74, F.rr(-0.15, 0.15), 0.12, 0.05, 0.05, F.rnd() * F.TAU, iron, 'metal');
    }
    F.blob(0, 0.90, 0, 0.16, 0.30, 0, F.col('fire'), 'glow');
    F.ball(0, 1.09, 0, 0.055, F.col('whiteHot'), 'glow');
    F.lamp(0, 1.0, 0, 0.9, 10);
    if (F.variant === 1) {
      const n = 5;
      for (let i = 0; i < n; i++) {
        const a = i * F.TAU / n;
        F.box(Math.cos(a) * 0.30, 0.68, Math.sin(a) * 0.30, 0.04, 0.05, 0.02, a, F.col('blackIron'), 'metal');
      }
    }
  }
});

FURN({
  key: 'yuni_court_writing_desk', name: 'Curved writing desk', culture: 'yuni-court', type: 'desk', setting: 'indoor',
  rooms: ['study'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber'],
  w: 1.7, d: 1.1, h: 0.78, variants: 1,
  build: function (F) {
    const wood = F.col('timberTeak');
    F.box(0, 0.7, 0, 1.7, 0.06, 0.85, 0, wood, 'wood');
    F.box(0, 0.35, 0.36, 1.5, 0.35, 0.04, 0, F.shade(wood, -0.1), 'wood');
    const xs = [-0.75, 0.75];
    for (const x of xs) {
      const midX = x * 1.03;
      F.beam(x, 0.7, 0.36, midX, 0.35, 0.5, 0.05, 0.05, F.shade(wood, -0.05), 'wood');
      F.beam(midX, 0.35, 0.5, x * 1.06, 0, 0.42, 0.05, 0.05, F.shade(wood, -0.05), 'wood');
      F.beam(x, 0.7, -0.36, midX, 0.35, -0.5, 0.05, 0.05, F.shade(wood, -0.05), 'wood');
      F.beam(midX, 0.35, -0.5, x * 1.06, 0, -0.42, 0.05, 0.05, F.shade(wood, -0.05), 'wood');
    }
    F.box(0, 0.55, 0.32, 0.4, 0.12, 0.28, 0, F.shade(wood, 0.05), 'wood');
  }
});

FURN({
  key: 'yuni_sahelian_carved_stool', name: 'Carved stool', culture: 'sahelian', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'plaster'],
  w: 0.5, d: 0.5, h: 0.46, variants: 3,
  build: function (F) {
    const wood = F.col('timberTeak');
    /* a dished seat: disc, rim, hollowed centre, bevelled underside */
    F.cyl(0, 0.36, 0, 0.235, 0.055, 0, wood, 'wood');
    F.cyl(0, 0.415, 0, 0.235, 0.025, 0, F.shade(wood, -0.08), 'wood');
    F.cyl(0, 0.425, 0, 0.165, 0.02, 0, F.shade(wood, 0.12), 'wood');
    F.cyl(0, 0.335, 0, 0.20, 0.03, 0, F.shade(wood, -0.14), 'wood');
    if (F.variant === 1) {
      /* cut from one block: a waisted hourglass, chisel marks still on it */
      F.cyl(0, 0, 0, 0.17, 0.055, 0, F.shade(wood, -0.12), 'wood');
      F.frustum(0, 0.055, 0, 0.165, 0.075, 0.135, 0, F.shade(wood, -0.05), 'wood', 12);
      F.cyl(0, 0.19, 0, 0.072, 0.055, 0, F.shade(wood, -0.17), 'wood');
      F.frustum(0, 0.245, 0, 0.075, 0.16, 0.115, 0, F.shade(wood, -0.05), 'wood', 12);
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4 + 0.3;
        F.box(Math.cos(a) * 0.075, 0.195, Math.sin(a) * 0.075, 0.03, 0.045, 0.02, a, F.shade(wood, -0.26), 'wood');
      }
    } else {
      for (let k = 0; k < 4; k++) {
        const a = (k + 0.5) * F.TAU / 4;
        const cx = Math.cos(a), cz = Math.sin(a);
        F.rod(cx * 0.14, 0.36, cz * 0.14, cx * 0.21, 0.02, cz * 0.21, 0.026, F.shade(wood, -0.15), 'wood');
        F.box(cx * 0.21, 0, cz * 0.21, 0.06, 0.025, 0.06, a, F.shade(wood, -0.3), 'wood');
      }
      /* low stretchers between opposite legs — the joinery that keeps it square */
      F.rod(-0.16, 0.10, -0.16, 0.16, 0.10, 0.16, 0.016, F.shade(wood, -0.22), 'wood');
      F.rod(0.16, 0.13, -0.16, -0.16, 0.13, 0.16, 0.016, F.shade(wood, -0.22), 'wood');
    }
    if (F.variant === 2) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = i * F.TAU / n;
        F.box(Math.cos(a) * 0.222, 0.375, Math.sin(a) * 0.222, 0.05, 0.05, 0.025, a, i % 2 ? F.col('plasterMadder') : F.col('plasterSoot'), 'plaster');
      }
    }
  }
});

FURN({
  key: 'yuni_sahelian_loom', name: 'Narrow-strip loom', culture: 'sahelian', type: 'loom', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'cloth'],
  w: 1.4, d: 2.6, h: 1.5, variants: 1,
  build: function (F) {
    const wood = F.col('timberOak');
    const xs = [-0.6, 0.6], zs = [-1.1, 1.1];
    for (const x of xs) for (const z of zs) {
      F.box(x, 0, z, 0.08, 1.5, 0.08, 0, wood, 'wood');
    }
    F.beam(-0.6, 1.45, -1.1, 0.6, 1.45, -1.1, 0.08, 0.08, F.shade(wood, -0.05), 'wood');
    F.beam(-0.6, 0.9, 1.1, 0.6, 0.9, 1.1, 0.08, 0.08, F.shade(wood, -0.05), 'wood');
    const cloth = F.col('clothBone');
    for (let i = 0; i < 7; i++) {
      const x = -0.55 + i * (1.1 / 6);
      F.rod(x, 1.45, -1.1, x, 0.9, 1.1, 0.01, cloth, 'cloth');
    }
    F.box(0, 0, 1.0, 0.9, 0.28, 0.35, 0, F.shade(wood, 0.05), 'wood');
  }
});

FURN({
  key: 'yuni_order_reading_desk', name: 'Reading desk', culture: 'order', type: 'desk', setting: 'indoor',
  rooms: ['study', 'library'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'cloth', 'emissive'],
  w: 1.3, d: 0.86, h: 1.45, variants: 2,
  variantDims: [
    { w: 1.3, d: 0.86, h: 1.15 },
    { w: 1.3, d: 0.86, h: 1.45 }
  ],
  build: function (F) {
    const wood = F.col('timberOak'), top = F.col('timberTeak'), brass = F.col('gilt');
    /* cross-foot with pads, a turned column, then the sloped box on top */
    F.box(0, 0.02, 0, 0.86, 0.055, 0.17, 0, F.shade(wood, -0.2), 'wood');
    F.box(0, 0.02, 0, 0.17, 0.055, 0.64, 0, F.shade(wood, -0.2), 'wood');
    F.box(-0.40, 0, 0, 0.13, 0.03, 0.13, 0, F.shade(wood, -0.3), 'wood');
    F.box(0.40, 0, 0, 0.13, 0.03, 0.13, 0, F.shade(wood, -0.3), 'wood');
    F.cyl(0, 0.075, 0, 0.115, 0.06, 0, F.shade(wood, -0.12), 'wood');
    F.cyl(0, 0.135, 0, 0.075, 0.72, 0, F.shade(wood, -0.06), 'wood');
    F.cyl(0, 0.40, 0, 0.10, 0.05, 0, F.shade(wood, -0.16), 'wood');
    F.cyl(0, 0.84, 0, 0.125, 0.05, 0, F.shade(wood, -0.12), 'wood');
    F.box(0, 0.89, 0, 1.12, 0.05, 0.72, 0, F.shade(wood, -0.18), 'wood');   /* underframe */
    F.box(0, 1.06, -0.20, 1.25, 0.07, 0.40, 0, top, 'wood');              /* back leaf */
    F.box(0, 0.91, 0.20, 1.25, 0.07, 0.40, 0, top, 'wood');               /* front leaf */
    F.box(0, 1.00, 0, 1.25, 0.09, 0.07, 0, F.shade(top, -0.1), 'wood');     /* ridge */
    F.box(0, 1.00, 0.40, 1.28, 0.08, 0.05, 0, F.shade(top, 0.1), 'wood');   /* book ledge */
    F.box(-0.13, 1.00, 0.16, 0.36, 0.04, 0.28, 0, F.col('clothBone'), 'cloth');     /* open volume */
    F.box(0.15, 1.00, 0.16, 0.34, 0.035, 0.28, 0, F.shade('clothBone', -0.08), 'cloth');
    F.box(0.56, 1.005, 0.2, 0.06, 0.02, 0.11, 0, brass, 'metal');         /* page clip */
    if (F.variant === 1) {
      F.rod(0.55, 1.03, -0.14, 0.55, 1.34, -0.22, 0.02, brass, 'metal');
      F.cyl(0.55, 1.30, -0.22, 0.085, 0.06, 0, F.shade(brass, 0.1), 'metal');
      F.ball(0.55, 1.36, -0.22, 0.055, F.col('whiteHot'), 'glow');
      F.lamp(0.55, 1.32, -0.22, 0.8, 8);
    }
  }
});

FURN({
  key: 'yuni_order_shelf_run', name: 'Archive shelf run', culture: 'order', type: 'shelf', setting: 'indoor',
  rooms: ['library', 'store'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth'],
  w: 2.2, d: 0.55, h: 2.4, variants: 2,
  build: function (F) {
    const wood = F.col('timberOak');
    F.box(0, 0, -0.245, 2.2, 2.4, 0.06, 0, wood, 'wood');
    F.box(-1.07, 0, 0, 0.06, 2.4, 0.55, 0, wood, 'wood');
    F.box(1.07, 0, 0, 0.06, 2.4, 0.55, 0, wood, 'wood');
    F.box(0, 2.34, 0, 2.2, 0.06, 0.55, 0, F.shade(wood, 0.05), 'wood');
    const shelfYs = [0.3, 0.75, 1.2, 1.65, 2.1];
    const bookColors = F.cols(['clothMadder', 'clothTurquoise', 'clothMoss', 'stoneOchre', 'clothRusset']);
    for (const y of shelfYs) {
      F.box(0, y, 0, 2.1, 0.04, 0.5, 0, wood, 'wood');
      for (let i = 0; i < 4; i++) {
        const x = -0.9 + i * 0.52 + F.rr(-0.08, 0.08);
        if (F.variant === 0) {
          F.cyl(x, y + 0.04, F.rr(-0.1, 0.1), 0.025, F.rr(0.12, 0.18), 0, F.pick(bookColors), 'cloth');
        } else {
          F.box(x, y + 0.04, F.rr(-0.1, 0.1), 0.08, F.rr(0.15, 0.28), 0.18, 0, F.pick(bookColors), 'wood');
        }
      }
    }
  }
});

FURN({
  key: 'yuni_order_lectern', name: 'Reading lectern', culture: 'order', type: 'desk', setting: 'indoor',
  rooms: ['library', 'shrine'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'cloth'],
  w: 0.92, d: 0.94, h: 1.42, variants: 2,
  variantDims: [
    { w: 0.92, d: 0.94, h: 1.32 },
    { w: 0.92, d: 0.94, h: 1.42 }
  ],
  build: function (F) {
    const wood = F.col('timberOak'), gold = F.col('gilt');
    /* three splayed feet off a low plinth */
    F.cyl(0, 0.05, 0, 0.20, 0.07, 0, F.shade(wood, -0.14), 'wood');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.5;
      const fx = Math.cos(a) * 0.38, fz = Math.sin(a) * 0.38;
      F.beam(0, 0.08, 0, fx, 0.04, fz, 0.10, 0.07, F.shade(wood, -0.1), 'wood');
      F.box(fx, 0, fz, 0.13, 0.045, 0.13, a, F.shade(wood, -0.26), 'wood');
    }
    F.cyl(0, 0.12, 0, 0.085, 0.95, 0, wood, 'wood');                  /* shaft */
    F.cyl(0, 0.40, 0, 0.115, 0.05, 0, F.shade(wood, -0.1), 'wood');     /* astragal */
    F.cyl(0, 0.80, 0, 0.115, 0.05, 0, F.shade(wood, -0.1), 'wood');
    F.cyl(0, 1.03, 0, 0.15, 0.06, 0, F.shade(wood, 0.05), 'wood');      /* capital */
    /* the raked desk: two boards, cheeks either side, a ledge along the foot */
    F.box(0, 1.09, 0.02, 0.88, 0.05, 0.42, 0, F.shade(wood, 0.05), 'wood');
    F.box(0, 1.22, 0.22, 0.88, 0.05, 0.36, 0, F.shade(wood, 0.05), 'wood');
    F.box(0, 1.14, 0.40, 0.90, 0.07, 0.045, 0, F.shade(wood, 0.1), 'wood');
    F.box(-0.41, 1.09, 0.12, 0.04, 0.17, 0.38, 0, F.shade(wood, -0.05), 'wood');
    F.box(0.41, 1.09, 0.12, 0.04, 0.17, 0.38, 0, F.shade(wood, -0.05), 'wood');
    /* the volume lying open on it */
    F.box(-0.17, 1.25, 0.2, 0.34, 0.05, 0.3, 0, F.col('clothBone'), 'cloth');
    F.box(0.17, 1.25, 0.2, 0.34, 0.05, 0.3, 0, F.shade('clothBone', -0.07), 'cloth');
    F.blob(0.02, 1.27, 0.11, 0.09, 0.05, 0.4, F.col('clothMadder'), 'cloth');     /* marker ribbons */
    if (F.variant === 1) {
      F.box(0, 1.30, 0.12, 0.52, 0.05, 0.05, 0, gold, 'metal');
      F.ball(0, 1.35, 0.12, 0.07, gold, 'metal');
      F.rod(-0.24, 1.30, 0.12, -0.24, 1.38, 0.12, 0.012, gold, 'metal');
      F.rod(0.24, 1.30, 0.12, 0.24, 1.38, 0.12, 0.012, gold, 'metal');
    }
  }
});

FURN({
  key: 'yuni_order_library_ladder', name: 'Library ladder', culture: 'order', type: 'ladder', setting: 'indoor',
  rooms: ['library'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber'],
  w: 0.75, d: 1.15, h: 4.20, variants: 1,
  build: function (F) {
    const wood = F.col('timberOak');
    const baseL = [-0.35, 0, 0.5], baseR = [0.35, 0, 0.5];
    const topL = [-0.1, 4.15, -0.55], topR = [0.1, 4.15, -0.55];
    F.rod(baseL[0], baseL[1], baseL[2], topL[0], topL[1], topL[2], 0.035, wood, 'wood');
    F.rod(baseR[0], baseR[1], baseR[2], topR[0], topR[1], topR[2], 0.035, wood, 'wood');
    const rungs = 9;
    for (let i = 1; i <= rungs; i++) {
      const t = i / (rungs + 1);
      const xL = baseL[0] + (topL[0] - baseL[0]) * t;
      const yL = baseL[1] + (topL[1] - baseL[1]) * t;
      const zL = baseL[2] + (topL[2] - baseL[2]) * t;
      const xR = baseR[0] + (topR[0] - baseR[0]) * t;
      const yR = baseR[1] + (topR[1] - baseR[1]) * t;
      const zR = baseR[2] + (topR[2] - baseR[2]) * t;
      F.rod(xL, yL, zL, xR, yR, zR, 0.02, F.shade(wood, -0.05), 'wood');
    }
    F.beam(topL[0], topL[1], topL[2], topR[0], topR[1], topR[2], 0.06, 0.06, F.shade(wood, 0.05), 'wood');
  }
});

FURN({
  key: 'yuni_order_globe_stand', name: 'Gilded globe on its pedestal', culture: 'order', type: 'statue', setting: 'indoor',
  rooms: ['library', 'study'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['timber', 'stone', 'metal'],
  w: 2.2, d: 2.2, h: 3.85, variants: 2,
  build: function (F) {
    const wood = F.col('timberOak'), gold = F.col('gilt'), mosaic = F.col('stoneOchre');
    F.cyl(0, 0, 0, 0.55, 0.1, 0, F.shade(wood, -0.1), 'wood');
    F.cyl(0, 0.10, 0, 0.44, 0.07, 0, F.shade(wood, -0.02), 'wood');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.4;
      F.box(Math.cos(a) * 0.49, 0, Math.sin(a) * 0.49, 0.17, 0.055, 0.17, a, F.shade(wood, -0.24), 'wood');
    }
    F.cyl(0, 0.17, 0, 0.35, 2.05, 0, wood, 'wood');
    F.cyl(0, 0.42, 0, 0.40, 0.07, 0, F.shade(wood, -0.12), 'wood');
    F.cyl(0, 1.95, 0, 0.40, 0.07, 0, F.shade(wood, -0.12), 'wood');
    F.cyl(0, 2.22, 0, 0.55, 0.12, 0, mosaic, 'stone');
    /* three gilt struts lifting the armature clear of the table */
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.rod(Math.cos(a) * 0.48, 2.34, Math.sin(a) * 0.48, Math.cos(a) * 0.96, 2.98, Math.sin(a) * 0.96, 0.035, gold, 'metal');
    }
    if (F.variant === 0) {
      /* the solid gilt globe, hung in its meridian */
      F.ball(0, 3.0, 0, 0.85, gold, 'metal');
      F.cyl(0, 2.97, 0, 1.06, 0.05, 0, F.shade(mosaic, 0.1), 'stone');
      F.cyl(0, 2.66, 0, 0.92, 0.035, 0, F.shade(mosaic, 0.05), 'stone');
      F.cyl(0, 3.30, 0, 0.92, 0.035, 0, F.shade(mosaic, 0.05), 'stone');
    } else {
      /* the armillary: open rings on a polar axis, no globe to speak of */
      F.ball(0, 3.0, 0, 0.28, gold, 'metal');
      F.rod(0, 2.45, 0, 0, 3.78, 0, 0.022, gold, 'metal');
      F.ball(0, 3.82, 0, 0.055, F.shade(gold, 0.15), 'metal');
      F.cyl(0, 2.97, 0, 1.06, 0.05, 0, gold, 'metal');
      F.cyl(0, 2.78, 0, 0.90, 0.04, F.TAU / 6, F.shade(gold, -0.05), 'metal');
      F.cyl(0, 3.20, 0, 0.90, 0.04, F.TAU / 3, F.shade(gold, -0.05), 'metal');
      for (let i = 0; i < 3; i++) {
        const a = i * F.TAU / 3 + 0.5;
        F.ball(Math.cos(a) * 1.02, 3.0, Math.sin(a) * 1.02, 0.07, F.shade(gold, 0.15), 'metal');
      }
    }
  }
});

FURN({
  key: 'yuni_order_pupil_desk', name: "Pupils' bench-desk", culture: 'order', type: 'desk', setting: 'indoor',
  rooms: ['school'], anchor: 'floor', clearance: { front: 0.5, back: 0.7 },
  materials: ['timber', 'stone', 'cloth'],
  w: 2.45, d: 1.0, h: 0.78, variants: 2,
  build: function (F) {
    const wood = F.col('timberTeak');
    F.box(-1.1, 0, 0.15, 0.15, 0.65, 0.6, 0, F.shade(wood, -0.05), 'wood');
    F.box(1.1, 0, 0.15, 0.15, 0.65, 0.6, 0, F.shade(wood, -0.05), 'wood');
    F.box(0, 0.65, 0.15, 2.4, 0.06, 0.55, 0, wood, 'wood');
    F.box(0, 0.5, 0.42, 2.2, 0.15, 0.04, 0, wood, 'wood');
    F.box(-1.1, 0, -0.35, 0.12, 0.42, 0.3, 0, F.shade(wood, -0.1), 'wood');
    F.box(1.1, 0, -0.35, 0.12, 0.42, 0.3, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.42, -0.35, 2.4, 0.08, 0.35, 0, wood, 'wood');
    const n = F.variant === 1 ? 4 : 2;
    const xs = n === 2 ? [-0.6, 0.6] : [-0.9, -0.3, 0.3, 0.9];
    for (const x of xs) {
      F.box(x, 0.71, 0.2, 0.18, 0.05, 0.13, 0, F.pick(['clothMadder', 'clothTurquoise', 'clothMoss']), 'cloth');
      if (F.chance(0.5)) {
        F.box(x + 0.14, 0.71, 0.2, 0.12, 0.015, 0.1, 0, F.col('stoneChalk'), 'stone');
      }
    }
  }
});

FURN({
  key: 'yuni_order_master_chair', name: "Master's chair", culture: 'order', type: 'chair', setting: 'indoor',
  rooms: ['school', 'study'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'stone', 'metal'],
  w: 0.85, d: 0.95, h: 1.45, variants: 1,
  build: function (F) {
    const wood = F.col('timberOak');
    const xs = [-0.35, 0.35], zs = [-0.4, 0.4];
    for (const x of xs) for (const z of zs) {
      F.cyl(x, 0, z, 0.03, 0.45, 0, wood, 'wood');
    }
    F.box(0, 0.45, 0, 0.8, 0.06, 0.8, 0, wood, 'wood');
    F.box(0, 0.51, -0.38, 0.7, 0.85, 0.06, 0, wood, 'wood');
    F.box(0, 0.9, -0.35, 0.3, 0.35, 0.02, 0, F.col('stoneOchre'), 'stone');
    F.box(0, 1.36, -0.38, 0.75, 0.08, 0.08, 0, F.shade(wood, 0.1), 'wood');
    F.ball(0, 1.44, -0.38, 0.05, F.col('gilt'), 'metal');
    F.box(-0.42, 0.51, 0, 0.05, 0.25, 0.7, 0, wood, 'wood');
    F.box(0.42, 0.51, 0, 0.05, 0.25, 0.7, 0, wood, 'wood');
  }
});

FURN({
  key: 'yuni_order_writing_board', name: 'Slate writing board', culture: 'order', type: 'board', setting: 'indoor',
  rooms: ['school'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['timber', 'stone'],
  w: 2.3, d: 0.75, h: 1.95, variants: 2,
  build: function (F) {
    const wood = F.col('timberOak');
    F.rod(-1.0, 0, 0.3, 0, 1.9, 0, 0.04, wood, 'wood');
    F.rod(1.0, 0, 0.3, 0, 1.9, 0, 0.04, wood, 'wood');
    F.rod(-1.0, 0, -0.3, 0, 1.9, 0, 0.04, wood, 'wood');
    F.rod(1.0, 0, -0.3, 0, 1.9, 0, 0.04, wood, 'wood');
    F.box(0, 0.55, 0.05, 2.0, 1.3, 0.05, 0, F.col('stoneSoot'), 'stone');
    F.box(0, 0.55, 0.08, 2.05, 0.06, 0.03, 0, wood, 'wood');
    F.box(0, 1.83, 0.08, 2.05, 0.06, 0.03, 0, wood, 'wood');
    F.box(0, 0.5, 0.15, 2.0, 0.05, 0.1, 0, wood, 'wood');
    for (let i = 0; i < 3; i++) {
      F.box(-0.5 + i * 0.5, 0.53, 0.15, 0.06, 0.03, 0.03, 0, F.col('stoneChalk'), 'stone');
    }
    if (F.variant === 1) {
      const rodYs = [0.75, 0.98, 1.21];
      const beadColors = F.cols(['clothMadder', 'stoneOchre', 'clothTurquoise', 'clothMoss', 'clothBone', 'clothRusset']);
      for (const y of rodYs) {
        F.rod(-0.9, y, 0.1, 0.9, y, 0.1, 0.015, wood, 'wood');
        for (let i = 0; i < 5; i++) {
          F.ball(-0.72 + i * 0.36, y, 0.1, 0.04, beadColors[i], 'stone');
        }
      }
    }
  }
});

FURN({
  key: 'yuni_order_mat_rack', name: 'Rack of rolled mats', culture: 'order', type: 'rack', setting: 'indoor',
  rooms: ['school', 'store'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'cloth'],
  w: 2.1, d: 0.70, h: 1.52, variants: 2,
  variantDims: [
    { w: 1.75, d: 0.70, h: 1.52 },
    { w: 2.1, d: 0.70, h: 1.52 }
  ],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.19, -0.05); /* centre the footprint on the origin (verify.py declared-size) */
    const wood = F.col('timberOak');
    F.box(-0.8, 0, 0, 0.1, 1.4, 0.5, 0, wood, 'wood');
    F.box(0.8, 0, 0, 0.1, 1.4, 0.5, 0, wood, 'wood');
    F.box(0, 0.7, 0, 1.7, 0.05, 0.5, 0, wood, 'wood');
    F.box(0, 1.35, 0, 1.7, 0.05, 0.55, 0, F.shade(wood, 0.05), 'wood');
    const cloth = F.cols(['stoneOchre', 'clothMadder', 'clothBone']);
    const n = F.variant === 1 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const zLo = -0.15 + (i % 2) * 0.3;
      F.rod(-0.75, 0.12, zLo, 0.75, 0.12, zLo, 0.12, F.pick(cloth), 'cloth');
    }
    for (let i = 0; i < n; i++) {
      const zHi = -0.15 + ((i + 1) % 2) * 0.3;
      F.rod(-0.75, 0.87, zHi, 0.75, 0.87, zHi, 0.12, F.pick(cloth), 'cloth');
    }
    F.box(0, 0, -0.2, 1.6, 0.07, 0.06, 0, F.shade(wood, -0.12), 'wood');        /* floor rail */
    F.box(0, 1.05, -0.2, 1.6, 0.05, 0.05, 0, F.shade(wood, -0.06), 'wood');     /* back brace */
    for (let i = 0; i < 3; i++) {
      F.rod(-0.55 + i * 0.55, 1.38, 0.18, -0.55 + i * 0.55, 1.5, 0.24, 0.018, F.shade(wood, 0.08), 'wood');
    }
    if (F.variant === 1) {
      F.cyl(1.05, 0, 0.2, 0.18, 0.22, 0, F.col('timberStraw'), 'wood');
      F.rod(-0.3, 0.87, -0.15, -0.3, 0.87, 0.16, 0.012, F.col('clothRusset'), 'cloth');   /* tie round a roll */
    }
  }
});

FURN({
  key: 'yuni_order_bookcase', name: 'Library bookcase', culture: 'order', type: 'shelf', setting: 'indoor',
  rooms: ['library'], anchor: 'wall', clearance: { front: 1 },
  materials: ['timber', 'stone'],
  w: 3.4, d: 0.85, h: 5.45, variants: 2,
  variantDims: [
    { w: 3.4, d: 0.85, h: 5.45 },
    { w: 3.4, d: 0.85, h: 2.7 }
  ],
  build: function (F) {
    const wood = F.col('timberOak');
    const H = F.variant === 1 ? 2.6 : 5.05;
    F.box(-1.65, 0, 0, 0.1, H, 0.85, 0, wood, 'wood');
    F.box(1.65, 0, 0, 0.1, H, 0.85, 0, wood, 'wood');
    F.box(0, 0, -0.38, 3.3, H, 0.08, 0, F.shade(wood, -0.05), 'wood');
    F.box(0, H, 0, 3.4, 0.1, 0.85, 0, F.shade(wood, 0.05), 'wood');
    const shelves = F.variant === 1 ? 2 : 4;
    const bookColors = F.cols(['clothMadder', 'clothTurquoise', 'clothMoss', 'stoneOchre', 'clothRusset', 'clothBone']);
    for (let s = 1; s <= shelves; s++) {
      const y = (H / (shelves + 1)) * s;
      F.box(0, y, 0, 3.25, 0.05, 0.75, 0, wood, 'wood');
      let x = -1.5;
      while (x < 1.5) {
        const w = F.rr(0.16, 0.28);
        F.box(x + w / 2, y + 0.05, F.rr(-0.1, 0.1), w, F.rr(0.2, 0.35), 0.18, 0, F.pick(bookColors), 'wood');
        x += w + 0.015;
      }
    }
    if (F.variant === 0) {
      F.box(0, H + 0.1, 0, 3.3, 0.3, 0.1, 0, F.col('stoneOchre'), 'stone');
    }
  }
});

FURN({
  key: 'yuni_order_reading_table', name: 'Reading table and benches', culture: 'order', type: 'table', setting: 'indoor',
  rooms: ['library'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'metal', 'emissive'],
  w: 2.65, d: 2.7, h: 1.02, variants: 2,
  variantDims: [
    { w: 2.65, d: 2.7, h: 0.82 },
    { w: 2.65, d: 2.7, h: 1.02 }
  ],
  build: function (F) {
    const wood = F.col('timberTeak');
    F.box(-1.0, 0, 0, 0.1, 0.75, 0.7, 0, F.shade(wood, -0.1), 'wood');
    F.box(1.0, 0, 0, 0.1, 0.75, 0.7, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.2, 0, 2.2, 0.05, 0.5, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.75, 0, 2.6, 0.06, 1.0, 0, wood, 'wood');
    const zs = [1.15, -1.15];
    for (const z of zs) {
      F.box(0, 0.42, z, 2.4, 0.05, 0.35, 0, F.shade(wood, -0.05), 'wood');
      F.box(-0.9, 0, z, 0.08, 0.42, 0.3, 0, F.shade(wood, -0.1), 'wood');
      F.box(0.9, 0, z, 0.08, 0.42, 0.3, 0, F.shade(wood, -0.1), 'wood');
    }
    const bookColors = F.cols(['clothMadder', 'clothTurquoise', 'clothMoss', 'stoneOchre']);
    const count = F.variant === 1 ? 3 : 4;
    for (let i = 0; i < count; i++) {
      const x = -0.9 + i * 0.6;
      F.box(x, 0.79, F.rr(-0.2, 0.2), 0.22, 0.03, 0.16, F.rr(-0.3, 0.3), F.pick(bookColors), 'wood');
    }
    if (F.variant === 1) {
      const gold = F.col('gilt');
      F.cyl(0.9, 0.78, 0, 0.02, 0.15, 0, gold, 'metal');
      F.lamp(0.9, 0.98, 0, 0.6, 8);
      F.ball(0.9, 0.98, 0, 0.03, F.col('whiteHot'), 'glow');
    }
  }
});

FURN({
  key: 'yuni_ancient_moulded_bench', name: 'Moulded seating pod', culture: 'ancient', type: 'bench', setting: 'indoor',
  rooms: ['hall'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['metal', 'cloth'],
  w: 2.0, d: 1.05, h: 0.92, variants: 2,
  variantDims: [
    { w: 2.0, d: 1.05, h: 0.72 },
    { w: 2.0, d: 1.05, h: 0.92 }
  ],
  build: function (F) {
    const metal = F.col('pewter');
    F.blob(-0.45, 0.35, 0, 0.55, 0.5, 0, metal, 'metal');
    F.blob(0.45, 0.35, 0, 0.55, 0.5, 0, metal, 'metal');
    F.rod(-0.85, 0.6, -0.3, 0, 0.68, -0.36, 0.03, F.shade(metal, 0.1), 'metal');
    F.rod(0, 0.68, -0.36, 0.85, 0.6, -0.3, 0.03, F.shade(metal, 0.1), 'metal');
    for (let x = -0.7; x <= 0.7; x += 0.35) {
      F.box(x, 0, 0, 0.05, 0.3, 0.85, 0, F.shade(metal, -0.05), 'metal');
    }
    for (let i = 0; i < 2; i++) {
      F.box(F.rr(-0.8, 0.8), 0, F.rr(-0.4, 0.4), 0.03, 0.4, 0.03, 0, F.col('redCopper'), 'metal');
    }
    if (F.variant === 1) {
      F.blob(-0.4, 0.65, 0, 0.3, 0.15, 0, F.col('clothMadder'), 'cloth');
      F.blob(0.4, 0.65, 0, 0.3, 0.15, 0, F.col('clothTurquoise'), 'cloth');
      F.box(0, 0.85, 0, 1.6, 0.05, 0.9, 0, F.col('clothOchre'), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_ancient_glass_console', name: 'Glass-topped console', culture: 'ancient', type: 'table', setting: 'indoor',
  rooms: ['study', 'hall'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'metal', 'glass', 'cloth', 'emissive'],
  w: 1.6, d: 0.72, h: 0.9, variants: 2,
  variantDims: [
    { w: 1.6, d: 0.72, h: 0.78 },
    { w: 1.6, d: 0.72, h: 0.9 }
  ],
  build: function (F) {
    const metal = F.col('pewter');
    for (const sx of [-0.6, 0.6]) {
      F.box(sx, 0.04, 0, 0.25, 0.56, 0.50, 0, metal, 'metal');
      F.box(sx, 0, 0, 0.33, 0.04, 0.58, 0, F.shade(metal, -0.15), 'metal');   /* foot plate */
      F.box(sx, 0.14, 0.26, 0.18, 0.30, 0.02, 0, F.col('blackIron'), 'metal');        /* recessed panel */
    }
    F.box(0, 0.32, -0.20, 1.0, 0.05, 0.05, 0, F.shade(metal, -0.1), 'metal'); /* stretcher */
    F.box(0, 0.60, 0, 1.6, 0.11, 0.60, 0, F.shade(metal, 0.05), 'metal');     /* carcass */
    F.box(0, 0.63, 0.29, 1.42, 0.05, 0.03, 0, F.col('blackIron'), 'metal');           /* dark reveal */
    F.box(0, 0.63, -0.30, 1.50, 0.06, 0.03, 0, F.shade(metal, -0.12), 'metal');
    F.box(0, 0.72, 0, 1.55, 0.05, 0.64, 0, F.col('glassSky'), 'glass');              /* glass top */
    F.box(0, 0.715, 0.325, 1.55, 0.06, 0.02, 0, F.shade('glassSky', -0.2), 'glass');
    F.box(0, 0.715, -0.325, 1.55, 0.06, 0.02, 0, F.shade('glassSky', -0.2), 'glass');
    if (F.variant === 1) {
      F.box(-0.3, 0.77, 0, 0.5, 0.02, 0.4, 0, F.col('timberOak'), 'wood');
      F.box(-0.3, 0.79, 0, 0.42, 0.02, 0.32, 0, F.col('clothBone'), 'cloth');
      F.cyl(0.42, 0.77, 0, 0.06, 0.07, 0, F.shade(metal, 0.1), 'metal');
      F.ball(0.42, 0.86, 0, 0.04, F.col('whiteHot'), 'glow');
      F.lamp(0.42, 0.84, 0, 0.7, 8);
    }
  }
});

FURN({
  key: 'yuni_ancient_cell_wall', name: 'Wall of storage cells', culture: 'ancient', type: 'storage', setting: 'indoor',
  rooms: ['store'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'cloth'],
  w: 2.2, d: 0.46, h: 2.05, variants: 2,
  build: function (F) {
    const metal = F.col('pewter');
    /* a carcass with real depth to it — the cells are boxes, not a painted face */
    F.box(0, 0.05, -0.06, 2.2, 2.0, 0.38, 0, metal, 'metal');
    F.box(0, 0, -0.06, 2.24, 0.05, 0.40, 0, F.shade(metal, -0.14), 'metal');   /* plinth */
    const xs = [-0.75, -0.25, 0.25, 0.75], ys = [0.18, 0.66, 1.14, 1.60];
    for (const y of ys) for (const x of xs) {
      if (F.chance(0.6)) {
        F.box(x, y, 0.13, 0.42, 0.42, 0.06, 0, F.shade(metal, F.rr(-0.1, 0.1)), 'metal');
        F.ball(x, y + 0.2, 0.20, 0.022, F.col('steelLight'), 'metal');
      } else {
        F.box(x, y, 0.10, 0.4, 0.4, 0.03, 0, F.col('blackIron'), 'metal');   /* an open, emptied cell */
      }
    }
    for (let i = 0; i < 3; i++) {
      F.box(F.rr(-0.9, 0.9), 1.9, 0.14, 0.04, 0.15, 0.05, 0, F.col('redCopper'), 'metal');
    }
    F.box(0, 2.0, -0.06, 2.2, 0.05, 0.42, 0, F.shade(metal, 0.05), 'metal');
    if (F.variant === 1) {
      F.box(-0.75, 0.4, 0.18, 0.5, 0.9, 0.03, 0, F.col('clothOchre'), 'cloth');
      F.lamp(1.1, 1.8, 0.2, 0.6, 8);
    }
  }
});

FURN({
  key: 'yuni_ancient_berth', name: 'Sleeping berth shell', culture: 'ancient', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['metal', 'cloth'],
  w: 2.3, d: 1.15, h: 1.1, variants: 2,
  build: function (F) {
    const metal = F.col('pewter');
    F.box(-0.1, 0.06, 0, 2.0, 0.30, 1.0, 0, metal, 'metal');
    F.box(-0.1, 0, 0, 2.1, 0.06, 1.08, 0, F.shade(metal, -0.14), 'metal');      /* skirt */
    F.box(-0.1, 0.36, -0.46, 2.0, 0.16, 0.07, 0, F.shade(metal, 0.05), 'metal');
    F.box(-0.1, 0.36, 0.46, 2.0, 0.16, 0.07, 0, F.shade(metal, 0.05), 'metal');
    F.box(0.86, 0.36, 0, 0.09, 0.22, 1.0, 0, F.shade(metal, 0.05), 'metal');    /* foot coaming */
    F.dome(-0.72, 0.50, 0, 0.50, 0.58, 0, F.shade(metal, -0.05), 'metal');      /* head hood */
    F.cyl(-0.72, 0.46, 0, 0.52, 0.04, 0, F.shade(metal, 0.08), 'metal');
    for (let i = 0; i < 3; i++) {
      F.box(-0.1 + i * 0.5, 0.30, 0.50, 0.07, 0.10, 0.03, 0, F.col('blackIron'), 'metal');  /* berth plates */
    }
    F.box(F.rr(-0.5, 0.5), 0, 0.42, 0.03, 0.34, 0.03, 0, F.col('redCopper'), 'metal');
    if (F.variant === 1) {
      F.box(0.0, 0.36, 0, 1.76, 0.12, 0.88, 0, F.col('clothBirch'), 'cloth');            /* pallet */
      F.box(-0.60, 0.48, 0, 0.44, 0.10, 0.50, 0, F.col('clothBone'), 'cloth');          /* pillow */
      F.box(0.18, 0.48, 0, 1.40, 0.04, 0.92, 0, F.col('clothOchre'), 'cloth');           /* blanket */
      F.box(0.18, 0.40, 0.45, 1.40, 0.10, 0.04, 0, F.shade('clothOchre', -0.1), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_ancient_light_stem', name: 'Luminous ring on a stem', culture: 'ancient', type: 'lamp', setting: 'indoor',
  rooms: ['antechamber', 'hall'], anchor: 'floor', clearance: { front: 0.3, back: 0.3, left: 0.3, right: 0.3 },
  materials: ['metal', 'emissive'],
  w: 0.86, d: 0.86, h: 2.30, variants: 2,
  build: function (F) {
    const metal = F.col('pewter');
    F.dome(0, 0, 0, 0.3, 0.15, 0, metal, 'metal');
    F.cyl(0, 0.15, 0, 0.055, 0.06, 0, F.shade(metal, -0.12), 'metal');
    F.cyl(0, 0.21, 0, 0.06, 1.92, 0, F.shade(metal, 0.03), 'metal');
    const ringR = 0.41, n = 6, ringY = 2.25;
    const ringPts = [];
    for (let i = 0; i < n; i++) {
      const a = i * F.TAU / n;
      ringPts.push([Math.cos(a) * ringR, Math.sin(a) * ringR]);
    }
    for (let i = 0; i < n; i++) {
      const p0 = ringPts[i], p1 = ringPts[(i + 1) % n];
      F.rod(p0[0], ringY, p0[1], p1[0], ringY, p1[1], 0.022, F.shade(metal, 0.1), 'metal');
    }
    const innerColor = F.variant === 1 ? F.col('ice') : F.shade(metal, 0.1);
    const innerFam = F.variant === 1 ? 'glow' : 'metal';
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      const op = ringPts[Math.round((a / F.TAU) * n) % n];
      F.rod(op[0], ringY, op[1], Math.cos(a) * 0.18, 2.06, Math.sin(a) * 0.18, 0.015, F.shade(metal, 0.05), 'metal');
    }
    F.cyl(0, 2.04, 0, 0.19, 0.03, 0, innerColor, innerFam);
    if (F.variant === 0) {
      F.box(0, 2.25, 0.36, 0.15, 0.03, 0.03, 0, F.col('blackIronLight'), 'metal');
    } else {
      F.lamp(0, 2.04, 0, 0.8, 10);
    }
  }
});

FURN({
  key: 'yuni_ancient_refectory_run', name: 'Fixed refectory run', culture: 'ancient', type: 'table', setting: 'indoor',
  rooms: ['hall'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['stone', 'metal', 'glass', 'cloth'],
  w: 3.2, d: 1.70, h: 0.95, variants: 2,
  variantDims: [
    { w: 3.2, d: 1.70, h: 0.78 },
    { w: 3.2, d: 1.70, h: 0.95 }
  ],
  build: function (F) {
    const metal = F.col('pewter');
    /* two moulded pedestals, the top fixed to them at proper table height */
    for (const px of [-1.0, 1.0]) {
      F.frustum(px, 0.04, 0, 0.34, 0.20, 0.58, 0, metal, 'metal', 8);
      F.box(px, 0, 0, 0.82, 0.04, 0.52, 0, F.shade(metal, -0.12), 'metal');
      F.box(px, 0.62, 0, 0.55, 0.05, 0.62, 0, F.shade(metal, 0.03), 'metal');
    }
    F.box(0, 0.62, 0, 2.96, 0.05, 0.72, 0, F.shade(metal, -0.08), 'metal');   /* apron */
    F.box(0, 0.67, 0, 3.0, 0.08, 0.85, 0, F.shade(metal, 0.05), 'metal');     /* top */
    F.box(0, 0.75, 0, 2.86, 0.02, 0.06, 0, F.col('glassSky'), 'glass');              /* inset strip */
    for (const z of [0.66, -0.66]) {
      F.box(0, 0.40, z, 2.8, 0.05, 0.34, 0, F.shade(metal, 0.03), 'metal');
      F.box(0, 0.44, z + (z > 0 ? 0.15 : -0.15), 2.7, 0.02, 0.04, 0, F.shade(metal, -0.08), 'metal');
      for (const x of [-1.0, 0, 1.0]) F.cyl(x, 0, z, 0.035, 0.40, 0, metal, 'metal');
    }
    for (let i = 0; i < 2; i++) {
      F.box(F.rr(-1.4, 1.4), 0, F.rr(-0.55, 0.55), 0.03, 0.3, 0.03, 0, F.col('redCopper'), 'metal');
    }
    if (F.variant === 1) {
      F.box(0, 0.77, 0, 2.6, 0.02, 0.30, 0, F.col('clothMadder'), 'cloth');
      F.cyl(-0.6, 0.77, 0, 0.06, 0.16, 0, F.col('stoneClay'), 'stone');
      F.cyl(0.6, 0.77, 0, 0.06, 0.13, 0, F.col('stoneClay'), 'stone');
      F.box(0.05, 0.79, 0.15, 0.3, 0.02, 0.22, 0.3, F.col('clothBone'), 'cloth');
      F.lamp(1.3, 0.9, 0, 0.6, 8);
    }
  }
});

FURN({
  key: 'yuni_ancient_socket_rack', name: 'Instrument rack of sockets', culture: 'ancient', type: 'rack', setting: 'indoor',
  rooms: ['workshop'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'glass'],
  w: 1.9, d: 0.9, h: 1.95, variants: 2,
  variantDims: [
    { w: 1.45, d: 0.62, h: 1.95 },
    { w: 1.9, d: 0.9, h: 1.95 }
  ],
  build: function (F) {
    if (F.variant === 0) F.shift(0, 0.17); else F.shift(-0.23, 0); /* centre the footprint on the origin (verify.py declared-size) */
    const metal = F.col('pewter');
    F.box(-0.65, 0, -0.2, 0.12, 1.95, 0.5, 0, metal, 'metal');
    F.box(0.65, 0, -0.2, 0.12, 1.95, 0.5, 0, metal, 'metal');
    F.box(0, 0, -0.2, 1.4, 1.95, 0.08, 0, F.shade(metal, -0.05), 'metal');
    const rowYs = [0.3, 0.75, 1.2, 1.6], xs = [-0.5, -0.17, 0.17, 0.5];
    for (let r = 0; r < rowYs.length; r++) {
      const y = rowYs[r];
      const skip = F.variant === 1 && r > 0;
      if (!skip) {
        for (const x of xs) {
          if (F.chance(0.3)) {
            F.cyl(x, y, 0.05, 0.06, 0.04, 0, F.col('glassSky'), 'glass');
          } else {
            F.box(x, y, 0.05, 0.14, 0.14, 0.05, 0, F.col('blackIron'), 'metal');
          }
        }
      }
    }
    F.box(0, 1.8, 0.05, 0.5, 0.15, 0.05, 0, F.col('glassSky'), 'glass');
    if (F.variant === 1) {
      F.box(1.0, 0, 0.3, 0.35, 0.3, 0.3, 0, F.col('timberOak'), 'wood');
      F.ball(0.9, 0.35, 0.3, 0.05, metal, 'metal');
      F.ball(1.1, 0.35, 0.35, 0.045, metal, 'metal');
    }
  }
});

FURN({
  key: 'yuni_salvage_strut_bed', name: 'Bed frame of strut stock', culture: 'ancients-salvage', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'floor', clearance: { front: 0.6, left: 0.5 },
  materials: ['timber', 'metal', 'cloth'],
  w: 2.1, d: 1.3, h: 0.72, variants: 2,
  variantDims: [
    { w: 2.1, d: 1.3, h: 0.66 },
    { w: 2.1, d: 1.3, h: 0.72 }
  ],
  build: function (F) {
    const metal = F.col('steel'), wood = F.col('timberOak');
    F.rod(-1.0, 0.5, -0.6, 1.0, 0.5, -0.6, 0.03, metal, 'metal');
    F.rod(-1.0, 0.5, 0.6, 1.0, 0.5, 0.6, 0.03, metal, 'metal');
    F.rod(-1.0, 0.5, -0.6, -1.0, 0.5, 0.6, 0.03, metal, 'metal');
    F.rod(1.0, 0.5, -0.6, 1.0, 0.5, 0.6, 0.03, metal, 'metal');
    const cx = [-1.0, 1.0], cz = [-0.6, 0.6];
    for (const x of cx) for (const z of cz) {
      F.box(x, 0, z, 0.08, 0.5, 0.08, F.rr(-0.15, 0.15), F.shade(metal, -0.05), 'metal');
    }
    const plankZs = [-0.45, -0.15, 0.15, 0.45];
    for (const z of plankZs) {
      F.box(0, 0.52, z, 1.9, 0.03, 0.18, 0, wood, 'wood');
    }
    F.box(0, 0.52, -0.58, 1.9, 0.12, 0.04, 0, F.shade(metal, 0.02), 'metal');
    F.box(-0.6, 0.55, -0.58, 0.03, 0.03, 0.02, 0, F.col('blackIron'), 'metal');
    F.box(0.6, 0.55, -0.58, 0.03, 0.03, 0.02, 0, F.col('blackIron'), 'metal');
    if (F.variant === 1) {
      F.box(0, 0.55, 0, 1.85, 0.10, 1.04, 0, F.col('stoneBirch'), 'cloth');            /* pallet */
      F.box(-0.62, 0.65, 0, 0.45, 0.09, 0.50, 0, F.col('clothBone'), 'cloth');        /* pillow */
      F.box(0.15, 0.65, 0, 1.50, 0.04, 1.08, 0, F.col('clothOchre'), 'cloth');         /* blanket */
      F.box(0.15, 0.56, 0.56, 1.50, 0.10, 0.04, 0, F.shade('clothOchre', -0.1), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_salvage_panel_screen', name: 'Room screen of cut panel', culture: 'ancients-salvage', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'bedroom'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 1.85, d: 0.40, h: 2.0, variants: 2,
  variantDims: [
    { w: 1.85, d: 0.40, h: 1.72 },
    { w: 1.85, d: 0.40, h: 2.0 }
  ],
  build: function (F) {
    const metal = F.col('pewter'), wood = F.col('timberOak'), foot = F.col('stoneGrey');
    const leaves = [
      { x: -0.62, ry: 0.35, tone: F.shade(metal, -0.02) },
      { x: 0, ry: 0, tone: F.shade(metal, 0.08) },
      { x: 0.62, ry: -0.35, tone: F.shade(metal, -0.02) }
    ];
    for (const leaf of leaves) {
      F.box(leaf.x, 0.1, 0, 0.6, 1.55, 0.04, leaf.ry, leaf.tone, 'metal');
      F.box(leaf.x, 0, 0, 0.3, 0.1, 0.3, leaf.ry, foot, 'stone');
      for (let i = 0; i < 2; i++) {
        F.box(leaf.x + F.rr(-0.2, 0.2), F.rr(0.3, 1.3), 0.021, 0.03, 0.03, 0.01, leaf.ry, F.col('redCopper'), 'metal');
      }
    }
    F.box(-0.62, 0.9, 0.021, 0.15, 0.35, 0.01, leaves[0].ry, F.col('blackIronDark'), 'metal');
    F.box(0.62, 0.9, 0.021, 0.15, 0.35, 0.01, leaves[2].ry, F.col('blackIronDark'), 'metal');
    F.box(0, 1.62, 0, 1.85, 0.06, 0.06, 0, wood, 'wood');
    if (F.variant === 1) {
      F.box(0.62, 0.8, 0.1, 0.5, 1.2, 0.03, 0, F.col('clothOchre'), 'cloth');
      F.rod(0.35, 1.6, 0.1, 0.9, 1.6, 0.1, 0.02, wood, 'wood');
    }
  }
});

FURN({
  key: 'yuni_salvage_locker_press', name: 'Storage press on a mud plinth', culture: 'ancients-salvage', type: 'storage', setting: 'indoor',
  rooms: ['store', 'bedroom'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'stone', 'metal', 'cloth'],
  w: 1.50, d: 0.62, h: 1.80, variants: 2,
  build: function (F) {
    const adobe = F.col('stoneBirch'), metal = F.col('pewter'), wood = F.col('timberOak');
    F.box(0, 0, 0, 1.5, 0.25, 0.62, 0, adobe, 'stone');
    F.box(0, 0.25, 0, 1.4, 1.3, 0.5, 0, metal, 'metal');
    const rowYs = [0.5, 0.95, 1.4], xs = [-0.45, 0, 0.45];
    for (const y of rowYs) for (const x of xs) {
      F.box(x, y, 0.26, 0.35, 0.35, 0.03, 0, F.shade(metal, F.rr(-0.08, 0.08)), 'metal');
      F.ball(x + 0.11, y, 0.28, 0.022, F.col('gilt'), 'metal');
    }
    F.box(0, 1.55, 0, 1.55, 0.05, 0.62, 0, wood, 'wood');
    F.rod(0.6, 1.6, 0.2, 0.6, 1.75, 0.15, 0.008, F.col('redCopper'), 'metal');
    F.rod(-0.6, 1.6, 0.2, -0.6, 1.72, 0.12, 0.008, F.col('redCopper'), 'metal');
    if (F.variant === 1) {
      F.box(0, 1.65, 0, 1.5, 0.04, 0.55, 0, wood, 'wood');
      const terra = F.col('stoneClay');
      const jarXs = [-0.5, -0.17, 0.17, 0.5];
      for (const x of jarXs) {
        F.cyl(x, 1.69, F.rr(-0.1, 0.1), 0.05, 0.12, 0, terra, 'stone');
      }
      F.box(0.5, 1.65, 0.15, 0.25, 0.06, 0.15, 0, F.col('clothTan'), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_salvage_hearth_hood', name: 'Hearth hood of ducting', culture: 'ancients-salvage', type: 'stove', setting: 'indoor',
  rooms: ['kitchen'], anchor: 'wall', clearance: { front: 1 },
  materials: ['timber', 'stone', 'metal', 'emissive'],
  w: 1.45, d: 1.15, h: 2.25, variants: 2,
  build: function (F) {
    F.shift(-0.17, 0); /* centre the footprint on the origin (verify.py declared-size) */
    const adobe = F.col('stoneBirch'), metal = F.col('pewter'), rust = F.col('redCopper'), wood = F.col('timberOak');
    F.cyl(0, 0, 0, 0.55, 0.08, 0, adobe, 'stone');
    F.cyl(0, 0.08, 0, 0.5, 0.04, 0, F.shade(adobe, -0.05), 'stone');
    const legPts = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      legPts.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]);
      F.rod(Math.cos(a) * 0.5, 0.12, Math.sin(a) * 0.5, 0, 1.5, 0, 0.04, rust, 'metal');
    }
    for (let i = 0; i < 3; i++) {
      const p0 = legPts[i], p1 = legPts[(i + 1) % 3];
      F.rod(p0[0] * 0.55, 0.7, p0[1] * 0.55, p1[0] * 0.55, 0.7, p1[1] * 0.55, 0.02, rust, 'metal');
    }
    F.dome(0, 1.5, 0, 0.55, 0.5, 0, metal, 'metal');
    F.cyl(0, 2.0, 0, 0.15, 0.25, 0, F.shade(metal, 0.05), 'metal');
    F.box(0.75, 0.9, 0, 0.3, 0.04, 0.35, 0, wood, 'wood');
    if (F.variant === 1) {
      F.blob(0, 0.1, 0, 0.35, 0.06, 0, F.col('fire'), 'glow');
      F.lamp(0, 0.2, 0, 0.9, 10);
      F.cyl(0.5, 0, 0.3, 0.08, 0.18, 0, F.col('stoneClay'), 'stone');
    }
  }
});

FURN({
  key: 'yuni_salvage_lamp_stand', name: 'Lamp stand from a light stem', culture: 'ancients-salvage', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['stone', 'metal', 'emissive'],
  w: 0.58, d: 0.58, h: 1.92, variants: 2,
  variantDims: [
    { w: 0.58, d: 0.58, h: 1.75 },
    { w: 0.58, d: 0.58, h: 1.92 }
  ],
  build: function (F) {
    const stone = F.col('stoneGrey'), rust = F.col('redCopper'), metal = F.col('steel'), brass = F.col('gilt');
    /* the cut-off stem is set in a block of rubble, packed square with shims */
    F.box(0, 0, 0, 0.56, 0.10, 0.56, 0, stone, 'stone');
    F.box(0, 0.10, 0, 0.42, 0.07, 0.42, 0, F.shade(stone, -0.08), 'stone');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + 0.4;
      F.box(Math.cos(a) * 0.23, 0.10, Math.sin(a) * 0.23, 0.10, 0.055, 0.10, a, F.shade(stone, 0.08), 'stone');
    }
    F.box(0.08, 0.17, 0.08, 0.07, 0.07, 0.07, 0.4, rust, 'metal');       /* a bracket left on it */
    F.cyl(0, 0.17, 0, 0.045, 1.36, 0, metal, 'metal');
    F.cyl(0, 0.62, 0, 0.062, 0.05, 0, F.shade(metal, -0.14), 'metal');     /* splice collar */
    F.rod(0.05, 0.22, 0.05, 0.05, 1.50, 0.05, 0.008, rust, 'metal');     /* the old cable */
    for (let i = 0; i < 3; i++) {
      F.box(0.05, 0.45 + i * 0.35, 0.05, 0.035, 0.03, 0.035, 0, F.col('blackIron'), 'metal');  /* tape */
    }
    F.cyl(0, 1.50, 0, 0.12, 0.03, 0, F.shade(brass, -0.16), 'metal');
    F.cyl(0, 1.53, 0, 0.10, 0.11, 0, brass, 'metal');
    F.ball(0, 1.68, 0, 0.055, F.col('whiteHot'), 'glow');
    F.lamp(0, 1.68, 0, 0.8, 10);
    if (F.variant === 1) {
      F.box(0, 1.55, -0.16, 0.26, 0.30, 0.03, 0.3, F.shade(metal, 0.15), 'metal');   /* salvaged reflector */
      F.rod(0, 1.42, -0.05, 0, 1.56, -0.16, 0.015, metal, 'metal');
      F.box(0, 1.86, -0.16, 0.28, 0.03, 0.05, 0.3, F.shade(metal, 0.05), 'metal');
    }
  }
});

/* ---------- harvested from Yuni src/64-interiors.js "NEW PIECES" and src/63-furniture.js (2026-10) ----------
   Yuni's own lathe/edome/fr5 helpers became stacked frustums, blobs and boxes; the
   Yuni palette arrays became this catalog's palette keys. Pieces that overran their
   declared height in Yuni (jars on the counter, a jug on the tavern table) lost the
   loose items: those are surface pieces now (yuni_common_jug_cups, yuni_common_bowl). */

FURN({
  key: 'yuni_common_rope_bed', name: 'Rope-strung bed', culture: 'yuni-common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'floor', clearance: { front: 0.6, left: 0.5 },
  materials: ['timber', 'rope', 'cloth'],
  w: 1.1, d: 2.0, h: 0.62, variants: 2, variantNames: ['plain', 'with blanket'],
  build: function (F) {
    const wood = F.col('timberChestnutDark'), rail = F.col('timberWalnut'), rope = F.col('ropeFlax');
    const cloths = F.cols(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothJade', 'clothViolet', 'clothOrange']);
    /* four turned legs with knob tops, rails mortised between them */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.cyl(sx * 0.48, 0, sz * 0.93, 0.05, 0.42, 0, wood, 'wood');
      F.cyl(sx * 0.48, 0.1, sz * 0.93, 0.06, 0.04, 0, F.shade(wood, -0.15), 'wood');
      F.ball(sx * 0.48, 0.44, sz * 0.93, 0.055, F.shade(wood, 0.08), 'wood');
    }
    for (const s of [-1, 1]) {
      F.box(s * 0.48, 0.28, 0, 0.07, 0.1, 1.8, 0, rail, 'wood');
      F.box(0, 0.28, s * 0.93, 0.9, 0.1, 0.07, 0, rail, 'wood');
    }
    /* the rope lattice the mattress lies on */
    for (let i = 0; i < 8; i++) {
      const z = -0.82 + i * 0.235;
      F.rod(-0.44, 0.35, z, 0.44, 0.35, z, 0.012, rope, 'rope');
    }
    for (let i = 0; i < 4; i++) {
      const x = -0.33 + i * 0.22;
      F.rod(x, 0.345, -0.88, x, 0.345, 0.88, 0.012, F.shade(rope, -0.1), 'rope');
    }
    F.box(0, 0.37, 0.02, 0.92, 0.1, 1.78, 0, F.pick(cloths), 'cloth');
    F.blob(0, 0.52, -0.64, 0.3, 0.13, 0, F.col('clothIvory'), 'cloth');
    if (F.variant === 1) {
      const b = F.pick(cloths);
      F.box(0, 0.47, 0.3, 1.0, 0.05, 1.2, 0, b, 'cloth');
      for (const s of [-1, 1]) F.box(s * 0.51, 0.25, 0.3, 0.02, 0.27, 1.2, 0, F.shade(b, -0.1), 'cloth');
      F.box(0, 0.52, -0.22, 1.0, 0.04, 0.12, 0, F.shade(b, 0.12), 'cloth');   /* turned-down edge */
    }
  }
});

FURN({
  key: 'yuni_court_canopy_bed', name: 'Canopied bed', culture: 'yuni-court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'floor', clearance: { front: 0.8, left: 0.6, right: 0.6 },
  materials: ['timber', 'metal', 'cloth'],
  w: 1.7, d: 2.2, h: 2.3, variants: 1,
  build: function (F) {
    const plank = F.col('timberTeak'), brass = F.col('brass');
    const cloths = F.cols(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothJade', 'clothViolet']);
    const hang = F.pick(cloths), cover = F.pick(cloths);
    /* panelled base, a plinth under it and a moulded lip */
    F.box(0, 0, 0, 1.6, 0.08, 2.1, 0, F.shade(plank, -0.25), 'wood');
    F.box(0, 0.08, 0, 1.64, 0.32, 2.14, 0, plank, 'wood');
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      F.box(s * 0.825, 0.13, -0.66 + i * 0.66, 0.01, 0.22, 0.5, 0, F.shade(plank, -0.12), 'wood');
    }
    F.box(0, 0.4, 0, 1.66, 0.04, 2.16, 0, F.shade(plank, 0.1), 'wood');
    F.box(0, 0.44, 0, 1.54, 0.15, 2.04, 0, F.col('clothIvory'), 'cloth');
    F.box(0, 0.59, 0.22, 1.56, 0.04, 1.5, 0, cover, 'cloth');
    for (let k = 0; k < 3; k++) F.blob((k - 1) * 0.48, 0.66, -0.8, 0.22, 0.16, F.rr(-0.2, 0.2), F.pick(cloths), 'cloth');
    /* brass posts with collars and ball finials, and a cornice frame on top */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.cyl(sx * 0.78, 0, sz * 1.03, 0.045, 2.14, 0, brass, 'metal');
      for (const y of [0.42, 1.2]) F.cyl(sx * 0.78, y, sz * 1.03, 0.06, 0.05, 0, F.shade(brass, -0.15), 'metal');
      F.ball(sx * 0.78, 2.24, sz * 1.03, 0.055, F.shade(brass, 0.15), 'metal');
    }
    F.box(0, 2.1, 0, 1.66, 0.08, 2.16, 0, F.shade(plank, -0.1), 'wood');
    F.box(0, 2.18, 0, 1.6, 0.04, 2.1, 0, hang, 'cloth');
    /* valance all round, a headcloth, and the side curtains drawn back to the posts */
    for (const s of [-1, 1]) {
      F.box(s * 0.83, 1.86, 0, 0.02, 0.24, 2.14, 0, F.shade(hang, -0.1), 'cloth');
      F.box(0, 1.86, s * 1.08, 1.64, 0.24, 0.02, 0, F.shade(hang, -0.1), 'cloth');
    }
    F.box(0, 0.62, -1.06, 1.5, 1.24, 0.03, 0, hang, 'cloth');
    for (const sx of [-1, 1]) {
      F.box(sx * 0.7, 0.5, 1.0, 0.14, 1.36, 0.06, 0, F.shade(hang, 0.05), 'cloth');
      F.blob(sx * 0.72, 1.15, 1.0, 0.09, 0.12, 0, F.shade(brass, -0.1), 'metal');   /* tie-back */
    }
  }
});

FURN({
  key: 'yuni_common_cooking_hearth', name: 'Raised cooking hearth', culture: 'yuni-common', type: 'stove', setting: 'indoor',
  rooms: ['kitchen'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['plaster', 'stone', 'emissive'],
  w: 1.6, d: 0.9, h: 1.9, variants: 1,
  build: function (F) {
    const adobe = F.col('plasterTan'), adobeHi = F.col('plasterBirch'), tile = F.col('stoneLaterite'), soot = F.col('stoneBlack');
    /* the raised mud bench, its front lip, a fire-hole and a pot-hole */
    F.box(0, 0, 0, 1.6, 0.72, 0.9, 0, adobe, 'plaster');
    F.box(0, 0.72, 0.02, 1.58, 0.05, 0.86, 0, adobeHi, 'plaster');
    F.box(-0.35, 0.08, 0.42, 0.42, 0.34, 0.04, 0, soot, 'stone');          /* stoke mouth */
    F.box(-0.35, 0.77, 0.05, 0.46, 0.03, 0.46, 0, soot, 'stone');
    F.ball(-0.35, 0.83, 0.05, 0.11, F.col('amber'), 'glow');
    F.blob(-0.35, 0.8, 0.05, 0.2, 0.06, 0, F.col('ember'), 'glow');
    /* terracotta cook-pot on the fire, a second resting cold */
    const pot = function (x, z, s, c) {
      F.frustum(x, 0.8, z, 0.15 * s, 0.24 * s, 0.12 * s, 0, c, 'stone', 10);
      F.frustum(x, 0.8 + 0.12 * s, z, 0.24 * s, 0.2 * s, 0.14 * s, 0, F.shade(c, 0.06), 'stone', 10);
      F.cyl(x, 0.8 + 0.26 * s, z, 0.16 * s, 0.04 * s, 0, F.shade(c, -0.12), 'stone');
    };
    pot(-0.35, 0.05, 1, tile);
    pot(0.42, 0.12, 0.8, F.col('stoneClay'));
    /* the hood: a mud funnel stepping in to a flue against the wall */
    F.box(0, 0.77, -0.3, 1.3, 0.5, 0.3, 0, adobe, 'plaster');
    F.box(0, 1.27, -0.33, 1.0, 0.25, 0.24, 0, F.shade(adobe, 0.04), 'plaster');
    F.box(0, 1.52, -0.36, 0.6, 0.38, 0.18, 0, F.shade(adobe, 0.08), 'plaster');
    F.box(0, 1.08, -0.15, 1.36, 0.06, 0.04, 0, adobeHi, 'plaster');     /* drip ledge */
    F.box(0, 0.77, -0.16, 1.2, 0.3, 0.02, 0, F.shade(soot, 0.12), 'stone'); /* soot on the back */
    F.lamp(-0.35, 1.0, 0.1, 0.8, 6);
  }
});

FURN({
  key: 'yuni_common_wall_shelves', name: 'Plank wall shelves', culture: 'yuni-common', type: 'shelf', setting: 'indoor',
  rooms: ['store', 'kitchen', 'workshop'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'stone', 'cloth'],
  w: 1.8, d: 0.4, h: 1.9, variants: 2, variantNames: ['pots', 'bolts of cloth'],
  build: function (F) {
    const timber = F.col('timberChestnut'), plank = F.col('timberOak');
    const tiles = F.cols(['stoneClay', 'stoneLaterite', 'stoneClayLight', 'stoneLaterite']);
    const cloths = F.cols(['clothIndigo', 'clothMadder', 'clothSaffron', 'stoneIvory', 'clothJade', 'clothViolet', 'clothOrange']);
    for (const s of [-1, 1]) F.box(s * 0.87, 0, 0, 0.06, 1.9, 0.38, 0, timber, 'wood');
    for (const y of [0.55, 1.35]) F.box(0, y, -0.185, 1.68, 0.12, 0.03, 0, F.shade(timber, -0.12), 'wood');   /* back battens */
    const ys = [0.1, 0.58, 1.06, 1.5];
    for (let k = 0; k < 4; k++) {
      const y = ys[k], top = k === 3 ? 1.9 : ys[k + 1];
      F.box(0, y, 0, 1.68, 0.04, 0.38, 0, F.shade(plank, F.rr(-0.04, 0.04)), 'wood');
      for (let j = 0; j < 3; j++) {
        const x = -0.55 + j * 0.55 + F.rr(-0.08, 0.08), y0 = y + 0.04;
        if (F.variant === 0) {
          const s = Math.min(1, (top - y0 - 0.04) / 0.34) * F.rr(0.8, 1);
          const c = F.pick(tiles);
          F.frustum(x, y0, 0, 0.07 * s, 0.13 * s, 0.12 * s, 0, c, 'stone', 9);
          F.frustum(x, y0 + 0.12 * s, 0, 0.13 * s, 0.09 * s, 0.14 * s, 0, F.shade(c, 0.05), 'stone', 9);
          F.cyl(x, y0 + 0.26 * s, 0, 0.06 * s, 0.06 * s, 0, F.shade(c, -0.1), 'stone');
          F.cyl(x, y0 + 0.3 * s, 0, 0.075 * s, 0.03 * s, 0, F.shade(c, -0.05), 'stone');
        } else {
          const c = F.pick(cloths), r = Math.min(0.12, (top - y0 - 0.04) / 2);
          F.rod(x, y0 + r, -0.15, x, y0 + r, 0.15, r, c, 'cloth');
          F.rod(x, y0 + r, 0.149, x, y0 + r, 0.16, r * 0.35, F.shade(c, -0.25), 'cloth');
        }
      }
    }
  }
});

FURN({
  key: 'yuni_common_shop_counter', name: 'Shop counter', culture: 'yuni-common', type: 'counter', setting: 'both',
  rooms: ['market', 'tavern', 'store'], anchor: 'floor', clearance: { front: 1.0, back: 0.8 },
  materials: ['timber', 'plaster', 'stone'],
  w: 2.4, d: 0.8, h: 1.05, variants: 2, variantNames: ['plain', 'tiled front'],
  build: function (F) {
    const adobe = F.col('plasterTanLight'), plank = F.col('timberTeak');
    const blues = F.cols(['stoneCobalt', 'stoneAzure', 'stoneNavy', 'stoneSky', 'stoneTurquoise']);
    F.box(0, 0, 0.02, 2.36, 0.1, 0.68, 0, F.shade(adobe, -0.15), 'plaster');   /* kick plinth */
    F.box(0, 0.1, 0, 2.3, 0.86, 0.66, 0, adobe, 'plaster');
    for (let i = 0; i < 4; i++) F.box(-1.05 + i * 0.7, 0.1, 0.33, 0.12, 0.86, 0.03, 0, F.shade(adobe, 0.08), 'plaster');
    /* plank top with a front nosing, a shelf for the keeper behind */
    F.box(0, 0.96, 0, 2.4, 0.07, 0.8, 0, plank, 'wood');
    F.box(0, 0.92, 0.38, 2.4, 0.04, 0.04, 0, F.shade(plank, -0.15), 'wood');
    F.box(0, 0.5, -0.34, 2.2, 0.04, 0.1, 0, F.shade(plank, -0.08), 'wood');
    if (F.variant === 1) {
      /* the front faced in blue tesserae, in a grid of small tiles */
      for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
        F.box(-0.92 + c * 0.23, 0.18 + r * 0.17, 0.335, 0.2, 0.15, 0.02, 0, F.pick(blues), 'stone');
      }
    }
  }
});

FURN({
  key: 'yuni_common_tavern_table', name: 'Tavern table and benches', culture: 'yuni-common', type: 'table', setting: 'both',
  rooms: ['tavern', 'hall', 'yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber'],
  w: 1.8, d: 1.9, h: 0.8, variants: 1,
  build: function (F) {
    const timber = F.col('timberChestnutDark'), plankA = F.col('timberPine'), plankB = F.col('timberOak');
    /* board top of three planks on a pair of trestles */
    for (let i = 0; i < 3; i++) F.box(0, 0.72 + F.rr(0, 0.006), -0.26 + i * 0.26, 1.8, 0.07, 0.25, 0, F.shade(plankA, F.rr(-0.05, 0.05)), 'wood');
    for (const s of [-1, 1]) {
      F.box(s * 0.72, 0, 0, 0.1, 0.72, 0.1, 0, F.shade(timber, -0.05), 'wood');
      F.box(s * 0.72, 0, 0, 0.12, 0.06, 0.62, 0, timber, 'wood');
      F.box(s * 0.72, 0.64, 0, 0.1, 0.08, 0.66, 0, timber, 'wood');
    }
    F.box(0, 0.2, 0, 1.44, 0.08, 0.08, 0, F.shade(timber, -0.1), 'wood');
    /* a bench each side */
    for (const s of [-1, 1]) {
      F.box(0, 0.42, s * 0.75, 1.7, 0.06, 0.3, 0, plankB, 'wood');
      for (const x of [-0.7, 0.7]) F.box(x, 0, s * 0.75, 0.08, 0.42, 0.26, 0, timber, 'wood');
      F.box(0, 0.14, s * 0.75, 1.32, 0.06, 0.05, 0, F.shade(timber, -0.12), 'wood');
    }
  }
});

FURN({
  key: 'yuni_common_workbench', name: 'Workbench with tools', culture: 'yuni-common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'metal'],
  w: 2.2, d: 0.9, h: 1.0, variants: 1,
  build: function (F) {
    const timber = F.col('timberChestnut'), plank = F.col('timberChestnut'), plankLo = F.col('timberPine'), iron = F.col('silver');
    F.box(0, 0.82, 0, 2.2, 0.12, 0.85, 0, plank, 'wood');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.98, 0, sz * 0.33, 0.12, 0.82, 0.12, 0, timber, 'wood');
    F.box(0, 0.12, 0, 1.9, 0.05, 0.6, 0, plankLo, 'wood');                 /* low shelf */
    for (let i = 0; i < 3; i++) F.box(-0.5 + i * 0.5, 0.17, F.rr(-0.1, 0.1), 0.3, 0.12, 0.2, F.rr(-0.3, 0.3), F.shade(plankLo, -0.1), 'wood');
    /* a wooden vice at the front left, an iron blade and a mallet on the top */
    F.box(-0.85, 0.5, 0.41, 0.22, 0.44, 0.04, 0, F.shade(timber, 0.08), 'wood');
    F.rod(-0.85, 0.78, 0.44, -0.85, 0.78, 0.34, 0.02, iron, 'metal');
    F.box(-0.35, 0.94, 0.12, 0.5, 0.02, 0.1, 0.3, iron, 'metal');
    F.box(-0.18, 0.94, 0.08, 0.14, 0.03, 0.05, 0.3, F.shade(timber, -0.1), 'wood');
    F.box(0.45, 0.94, -0.1, 0.07, 0.05, 0.38, 0, F.shade(timber, -0.05), 'wood');
    F.box(0.45, 0.94, -0.32, 0.16, 0.05, 0.08, 0, F.shade(timber, -0.15), 'wood');
    /* shavings */
    for (let i = 0; i < 4; i++) F.blob(F.rr(0.1, 0.9), 0.95, F.rr(-0.3, 0.3), 0.05, 0.02, F.rr(0, F.TAU), F.col('clothStraw'), 'wood');
  }
});

FURN({
  key: 'yuni_common_grain_sacks', name: 'Stacked grain sacks', culture: 'yuni-common', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth', 'rope'],
  w: 1.4, d: 0.9, h: 0.9, variants: 1,
  build: function (F) {
    const sacking = F.cols(['ropeFlax', 'clothFlax', 'clothStraw', 'clothMustard']);
    for (let k = 0; k < 4; k++) {
      const top = k >> 1, x = -0.36 + (k % 2) * 0.72 + (top ? F.rr(-0.04, 0.04) : 0), z = top ? -0.04 : 0.06;
      const y = top * 0.4, c = F.pick(sacking);
      F.blob(x, y + 0.2, z, 0.32, 0.42, F.rr(-0.3, 0.3), c, 'cloth');
      F.cyl(x, y + 0.36, z, 0.08, 0.06, 0, F.shade(c, -0.08), 'cloth');   /* gathered neck */
      F.cyl(x, y + 0.38, z, 0.085, 0.02, 0, F.col('ropeMustard'), 'rope');
      F.blob(x, y + 0.44, z, 0.09, 0.06, 0, F.shade(c, 0.05), 'cloth');     /* the tuft above the tie */
    }
  }
});

FURN({
  key: 'yuni_court_carpet', name: 'Knotted carpet', culture: 'yuni-court', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.8, d: 2.0, h: 0.03, variants: 2, variantNames: ['red field', 'blue field'],
  build: function (F) {
    const border = F.pick(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothViolet']);
    const field = F.variant ? F.col('stoneAzure') : F.col('clothCrimson'), ivory = F.col('clothIvory'), gold = F.col('clothSaffron');
    F.box(0, 0, 0, 2.6, 0.012, 2.0, 0, border, 'cloth');
    F.box(0, 0.012, 0, 2.3, 0.006, 1.7, 0, ivory, 'cloth');               /* guard stripe */
    F.box(0, 0.018, 0, 2.2, 0.006, 1.6, 0, field, 'cloth');
    F.cyl(0, 0.024, 0, 0.45, 0.004, 0, gold, 'cloth');                    /* medallion */
    F.cyl(0, 0.026, 0, 0.3, 0.004, 0, F.shade(field, -0.25), 'cloth');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.box(sx * 0.85, 0.024, sz * 0.55, 0.3, 0.004, 0.3, Math.PI / 4, gold, 'cloth');   /* corner lozenges */
    }
    /* knotted fringe at both ends */
    for (const s of [-1, 1]) for (let i = 0; i < 14; i++) {
      F.box(s * 1.35, 0, -0.91 + i * 0.14, 0.1, 0.006, 0.05, 0, ivory, 'cloth');
    }
  }
});

FURN({
  key: 'yuni_poor_clay_pots', name: 'Clay storage pots', culture: 'yuni-poor', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['stone'],
  w: 1.1, d: 0.7, h: 0.9, variants: 1,
  build: function (F) {
    const reds = F.cols(['stoneClay', 'stoneLaterite', 'stoneClayLight', 'stoneLaterite']);
    for (let k = 0; k < 3; k++) {
      const x = -0.32 + k * 0.32, z = F.rr(-0.12, 0.12), s = F.rr(0.8, 1.08), c = F.pick(reds);
      F.frustum(x, 0, z, 0.08 * s, 0.17 * s, 0.25 * s, 0, F.shade(c, -0.06), 'stone', 10);
      F.frustum(x, 0.25 * s, z, 0.17 * s, 0.16 * s, 0.3 * s, 0, c, 'stone', 10);
      F.frustum(x, 0.55 * s, z, 0.16 * s, 0.08 * s, 0.2 * s, 0, F.shade(c, 0.05), 'stone', 10);
      F.cyl(x, 0.75 * s, z, 0.1 * s, 0.07 * s, 0, F.shade(c, -0.1), 'stone');
      F.cyl(x, 0.47 * s, z, 0.165 * s, 0.02, 0, F.shade(c, -0.18), 'stone');   /* incised band */
    }
  }
});

FURN({
  key: 'yuni_nomad_rug_pile', name: 'Pile of rugs and saddle-bags', culture: 'nomad', type: 'seating', setting: 'both',
  rooms: ['hall', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth', 'skin'],
  w: 2.2, d: 1.6, h: 0.6, variants: 1,
  build: function (F) {
    const cloths = F.cols(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothJade', 'clothViolet', 'clothOrange']);
    for (let k = 0; k < 3; k++) {
      const c = F.pick(cloths), w = 2.0 - k * 0.2, d = 1.4 - k * 0.15, r = F.rr(-0.06, 0.06);
      F.box(F.rr(-0.05, 0.05), k * 0.07, F.rr(-0.05, 0.05), w, 0.07, d, r, c, 'cloth');
      F.box(0, k * 0.07 + 0.071, 0, w * 0.7, 0.004, d * 0.6, r, F.shade(c, 0.25), 'cloth');   /* field stripe */
    }
    /* two leather saddle-bags and a bolster against the back */
    F.blob(-0.6, 0.36, -0.42, 0.3, 0.3, 0.2, F.col('hideOak'), 'skin');
    F.blob(0.5, 0.35, -0.45, 0.27, 0.26, -0.15, F.col('hideChestnut'), 'skin');
    F.rod(-0.3, 0.3, -0.5, 0.3, 0.3, -0.5, 0.06, F.col('hideWalnut'), 'skin');
    F.rod(-0.85, 0.3, 0.2, 0.85, 0.3, 0.25, 0.1, F.pick(cloths), 'cloth');
  }
});

FURN({
  key: 'yuni_poor_reed_mat_bed', name: 'Reed sleeping platform', culture: 'yuni-poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['plaster', 'thatch', 'cloth'],
  w: 1.9, d: 1.0, h: 0.4, variants: 2, variantNames: ['bare', 'blanket'],
  build: function (F) {
    const adobe = F.col('plasterTan'), reed = F.col('thatchStraw'), reedDark = F.col('thatchFlax');
    for (const s of [-1, 1]) {
      F.box(s * 0.86, 0, 0, 0.14, 0.28, 0.92, 0, adobe, 'plaster');
      F.box(s * 0.86, 0.26, 0, 0.16, 0.03, 0.96, 0, F.shade(adobe, 0.08), 'plaster');
    }
    for (let i = 0; i < 9; i++) F.rod(-0.9, 0.31, -0.44 + i * 0.11, 0.9, 0.31, -0.44 + i * 0.11, 0.035, F.shade(reed, F.rr(-0.06, 0.06)), 'thatch');
    F.box(0, 0.33, 0, 1.76, 0.04, 0.9, 0, reedDark, 'thatch');
    if (F.variant === 1) {
      F.box(0, 0.37, 0.08, 1.6, 0.03, 0.7, 0, F.pick(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothOrange']), 'cloth');
      F.rod(-0.6, 0.39, -0.33, 0.6, 0.39, -0.33, 0.04, F.col('clothIvory'), 'cloth');   /* rolled headcloth */
    }
  }
});

FURN({
  key: 'yuni_poor_hearth_stones', name: 'Three-stone hearth', culture: 'yuni-poor', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['plaster', 'stone', 'timber', 'emissive'],
  w: 1.0, d: 1.0, h: 0.55, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.44, 0.05, 0, F.col('plasterTan'), 'plaster');
    F.cyl(0, 0.05, 0, 0.3, 0.015, 0, F.col('stoneBlack'), 'stone');                    /* ash bed */
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * F.TAU + 0.5;
      F.blob(Math.cos(a) * 0.27, 0.13, Math.sin(a) * 0.27, 0.13, 0.24, a, F.col('stoneGranite'), 'stone');
    }
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, F.TAU);
      F.rod(Math.cos(a) * 0.38, 0.07, Math.sin(a) * 0.38, Math.cos(a) * 0.06, 0.1, Math.sin(a) * 0.06, 0.025, F.col('timberWalnut'), 'wood');
    }
    F.blob(0, 0.1, 0, 0.12, 0.08, 0, F.col('ember'), 'glow');
    /* the pot sits on the three stones */
    F.frustum(0, 0.24, 0, 0.16, 0.24, 0.1, 0, F.col('stoneLaterite'), 'stone', 10);
    F.frustum(0, 0.34, 0, 0.24, 0.22, 0.12, 0, F.col('stoneClay'), 'stone', 10);
    F.frustum(0, 0.46, 0, 0.22, 0.15, 0.06, 0, F.col('stoneLaterite'), 'stone', 10);
    F.cyl(0, 0.52, 0, 0.16, 0.03, 0, F.col('stoneLaterite'), 'stone');
    F.lamp(0, 0.2, 0, 0.42, 3.2);
  }
});

FURN({
  key: 'yuni_salvage_panel_table', name: 'Salvaged panel table', culture: 'ancients-salvage', type: 'table', setting: 'indoor',
  rooms: ['workshop', 'hall'], anchor: 'floor', clearance: { front: 0.7, back: 0.5 },
  materials: ['metal', 'rustSteel', 'plaster'],
  w: 1.8, d: 0.9, h: 0.8, variants: 2, variantNames: ['on struts', 'on masonry'],
  build: function (F) {
    const tarn = F.col('silver'), rust = F.col('rustRusset');
    F.box(0, 0.74, 0, 1.76, 0.06, 0.86, 0, tarn, 'metal');
    F.box(0.3, 0.799, 0.1, 0.5, 0.002, 0.3, 0.2, F.shade(rust, -0.2), 'rust');  /* a rust bloom on the panel */
    for (let i = 0; i < 4; i++) F.box(-0.66 + i * 0.44, 0.69, 0, 0.04, 0.05, 0.86, 0, rust, 'rust');
    if (F.variant === 1) {
      for (const s of [-1, 1]) {
        F.box(s * 0.72, 0, 0, 0.26, 0.69, 0.74, 0, F.pick(['plasterTanLight2', 'plasterTanLight', 'plasterBirch']), 'plaster');
        F.box(s * 0.72, 0.66, 0, 0.3, 0.03, 0.78, 0, F.col('plasterTan'), 'plaster');
      }
    } else {
      for (let k = 0; k < 4; k++) {
        const sx = k < 2 ? -1 : 1, sz = k % 2 ? -1 : 1;
        F.rod(sx * 0.8, 0, sz * 0.38, sx * 0.64, 0.72, sz * 0.28, 0.045, F.col('silverLight'), 'metal');
      }
      for (const s of [-1, 1]) F.rod(s * 0.72, 0.3, -0.33, s * 0.72, 0.3, 0.33, 0.025, rust, 'rust');
    }
  }
});

/* ---------- gap fill (2026-10): beds and hearths for the Yuni cultures that had none, a court table ---------- */

FURN({
  key: 'yuni_sahelian_banco_bed', name: 'Banco sleeping bench', culture: 'sahelian', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['plaster', 'thatch', 'cloth', 'timber'],
  w: 2.0, d: 1.0, h: 0.75, variants: 2, variantNames: ['mat', 'strip-cloth cover'],
  build: function (F) {
    const banco = F.col('plasterLaterite'), bancoHi = F.col('plasterClay'), mat = F.col('thatchStraw'), wood = F.col('timberSepia');
    /* a mud bench built out from the wall, rounded at the front edge, with a raised head */
    F.box(0, 0, -0.05, 2.0, 0.42, 0.9, 0, banco, 'plaster');
    F.rod(-0.98, 0.36, 0.38, 0.98, 0.36, 0.38, 0.07, bancoHi, 'plaster');
    F.box(-0.84, 0.42, -0.05, 0.32, 0.18, 0.9, 0, bancoHi, 'plaster');
    F.box(0, 0.42, -0.48, 2.0, 0.33, 0.04, 0, F.shade(banco, -0.08), 'plaster');   /* the wall-side lip */
    F.box(0.15, 0.42, -0.05, 1.36, 0.03, 0.82, 0, mat, 'thatch');
    for (let i = 0; i < 6; i++) F.box(-0.45 + i * 0.24, 0.451, -0.05, 0.015, 0.004, 0.8, 0, F.shade(mat, -0.2), 'thatch');
    if (F.variant === 1) {
      /* narrow-strip cloth, indigo and white, laid crosswise */
      for (let i = 0; i < 6; i++) F.box(0.15, 0.455, -0.4 + i * 0.13, 1.3, 0.02, 0.13, 0, i % 2 ? F.col('clothIvory') : F.col('clothIndigo'), 'cloth');
    }
    /* a carved headrest on the raised end */
    F.box(-0.84, 0.6, -0.05, 0.12, 0.05, 0.3, 0, wood, 'wood');
    F.box(-0.84, 0.65, -0.05, 0.06, 0.06, 0.1, 0, wood, 'wood');
    F.box(-0.84, 0.71, -0.05, 0.14, 0.04, 0.36, 0, F.shade(wood, 0.1), 'wood');
  }
});

FURN({
  key: 'yuni_order_cell_cot', name: 'Cell cot', culture: 'order', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks'], anchor: 'floor', clearance: { front: 0.6, left: 0.4 },
  materials: ['timber', 'cloth'],
  w: 0.95, d: 2.0, h: 0.95, variants: 2, variantNames: ['made', 'habit folded'],
  build: function (F) {
    const wood = F.col('timberWalnut'), blanket = F.col('clothGranite'), linen = F.col('clothIvory');
    /* plain frame, a taller headboard with a cross-rail, a lower footboard */
    for (const sx of [-1, 1]) {
      F.box(sx * 0.43, 0, -0.95, 0.07, 0.95, 0.07, 0, wood, 'wood');
      F.box(sx * 0.43, 0, 0.95, 0.07, 0.6, 0.07, 0, wood, 'wood');
      F.box(sx * 0.43, 0.3, 0, 0.05, 0.12, 1.84, 0, F.shade(wood, 0.06), 'wood');
    }
    F.box(0, 0.62, -0.95, 0.8, 0.26, 0.04, 0, F.shade(wood, 0.04), 'wood');
    F.box(0, 0.88, -0.95, 0.94, 0.06, 0.08, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.4, 0.95, 0.8, 0.16, 0.04, 0, F.shade(wood, 0.04), 'wood');
    for (let i = 0; i < 7; i++) F.box(0, 0.36, -0.81 + i * 0.27, 0.82, 0.03, 0.12, 0, F.shade(wood, 0.12), 'wood');   /* slats */
    F.box(0, 0.39, 0, 0.82, 0.08, 1.82, 0, linen, 'cloth');
    F.box(0, 0.47, 0.18, 0.86, 0.04, 1.44, 0, blanket, 'cloth');
    for (const sx of [-1, 1]) F.box(sx * 0.43, 0.27, 0.18, 0.02, 0.24, 1.44, 0, F.shade(blanket, -0.08), 'cloth');
    F.box(0, 0.47, -0.72, 0.56, 0.1, 0.3, 0, linen, 'cloth');
    if (F.variant === 1) F.box(0.05, 0.51, 0.66, 0.42, 0.1, 0.34, 0.08, F.col('clothGraphite'), 'cloth');   /* the folded habit */
  }
});

FURN({
  key: 'yuni_nomad_bedroll', name: 'Bedroll on felt', culture: 'nomad', type: 'bed', setting: 'both',
  rooms: ['bedroom', 'hall', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth', 'skin', 'rope'],
  w: 1.1, d: 2.1, h: 0.4, variants: 2, variantNames: ['laid out', 'rolled'],
  build: function (F) {
    const felt = F.col('clothMud'), hide = F.col('hideOak'), cloths = F.cols(['clothIndigo', 'clothMadder', 'clothSaffron', 'clothViolet', 'clothOrange']);
    F.box(0, 0, 0, 1.1, 0.03, 2.1, 0, felt, 'cloth');
    F.box(0, 0.002, 0, 0.9, 0.03, 1.9, 0, F.shade(felt, 0.1), 'cloth');
    if (F.variant === 0) {
      const c = F.pick(cloths);
      F.box(0, 0.03, 0.1, 0.8, 0.07, 1.7, 0, c, 'cloth');
      F.box(0, 0.1, 0.35, 0.82, 0.04, 1.1, 0, F.pick(cloths), 'cloth');
      F.box(0, 0.14, -0.15, 0.82, 0.05, 0.14, 0, F.shade(c, 0.15), 'cloth');
      F.blob(0, 0.2, -0.82, 0.3, 0.2, 0, hide, 'skin');                       /* saddle for a pillow */
      F.rod(-0.25, 0.25, -0.82, 0.25, 0.25, -0.82, 0.03, F.shade(hide, -0.25), 'skin');
    } else {
      const c = F.pick(cloths);
      F.rod(-0.45, 0.2, -0.6, 0.45, 0.2, -0.6, 0.18, c, 'cloth');
      for (const x of [-0.25, 0.25]) F.rod(x, 0.2, -0.79, x, 0.2, -0.41, 0.19, F.col('ropeMustard'), 'rope');
      F.blob(0.1, 0.12, 0.5, 0.35, 0.22, 0.3, hide, 'skin');
    }
  }
});

FURN({
  key: 'yuni_court_tiled_stove', name: 'Tiled cooking range', culture: 'yuni-court', type: 'stove', setting: 'indoor',
  rooms: ['kitchen'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['plaster', 'stone', 'metal', 'emissive'],
  w: 1.8, d: 0.95, h: 2.4, variants: 1,
  build: function (F) {
    const white = F.col('plasterIvory'), blues = F.cols(['stoneCobalt', 'stoneAzure', 'stoneNavy', 'stoneSky']), copper = F.col('copper'), soot = F.col('stoneBlack');
    /* a whitewashed range faced in blue tile, two fire-holes, an arched stoke-hole each */
    F.box(0, 0, 0, 1.8, 0.82, 0.95, 0, white, 'plaster');
    for (let c = 0; c < 8; c++) for (let r = 0; r < 2; r++) {
      F.box(-0.79 + c * 0.226, 0.46 + r * 0.17, 0.476, 0.21, 0.15, 0.01, 0, F.pick(blues), 'stone');
    }
    for (const x of [-0.45, 0.45]) {
      F.box(x, 0.08, 0.46, 0.34, 0.28, 0.03, 0, soot, 'stone');
      F.blob(x, 0.16, 0.4, 0.08, 0.06, 0, F.col('ember'), 'glow');
      F.cyl(x, 0.82, 0.05, 0.22, 0.02, 0, soot, 'stone');
    }
    F.box(0, 0.82, 0, 1.84, 0.05, 0.97, 0, F.col('stoneTurquoise'), 'stone');               /* tiled top edge */
    /* copper pots on the fire-holes */
    F.cyl(-0.45, 0.87, 0.05, 0.2, 0.22, 0, copper, 'metal');
    F.cyl(-0.45, 1.09, 0.05, 0.21, 0.02, 0, F.shade(copper, 0.15), 'metal');
    F.frustum(0.45, 0.87, 0.05, 0.14, 0.2, 0.14, 0, F.shade(copper, -0.1), 'metal', 12);
    F.rod(0.45, 1.01, 0.25, 0.45, 1.05, 0.42, 0.015, F.shade(copper, -0.2), 'metal');
    /* the hood: a whitewashed funnel on the wall, a blue tile band, the flue to the top */
    F.box(0, 1.45, -0.2, 1.8, 0.35, 0.55, 0, white, 'plaster');
    F.box(0, 1.45, 0.075, 1.82, 0.08, 0.02, 0, F.pick(blues), 'stone');
    F.box(0, 1.8, -0.27, 1.3, 0.3, 0.41, 0, F.shade(white, -0.03), 'plaster');
    F.box(0, 2.1, -0.33, 0.7, 0.3, 0.29, 0, F.shade(white, -0.05), 'plaster');
    F.box(0, 0.87, -0.455, 1.8, 0.6, 0.04, 0, F.shade(white, -0.06), 'plaster');   /* splashback up to the hood */
    F.box(0, 0.95, -0.43, 1.5, 0.45, 0.02, 0, F.shade(soot, 0.15), 'stone');
    F.lamp(0, 1.0, 0.2, 0.7, 6);
  }
});

FURN({
  key: 'yuni_sahelian_clay_oven', name: 'Domed clay oven', culture: 'sahelian', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['plaster', 'stone', 'timber', 'emissive'],
  w: 1.3, d: 1.3, h: 1.35, variants: 1,
  build: function (F) {
    const banco = F.col('plasterClayDark'), bancoHi = F.col('plasterClay'), soot = F.col('stoneBlack');
    F.cyl(0, 0, 0, 0.64, 0.4, 0, F.shade(banco, -0.08), 'plaster');          /* plinth */
    F.cyl(0, 0.38, 0, 0.66, 0.04, 0, bancoHi, 'plaster');
    F.dome(0, 0.42, 0, 0.55, 0.78, 0, banco, 'plaster');
    F.cyl(0, 1.12, 0, 0.1, 0.18, 0, bancoHi, 'plaster');                     /* smoke hole collar */
    F.cyl(0, 1.29, 0, 0.12, 0.03, 0, F.shade(bancoHi, 0.05), 'plaster');
    /* the mouth: an arch of soot, embers inside, a hearth-stone sill and a board door leaning by */
    F.box(0, 0.42, 0.46, 0.4, 0.32, 0.12, 0, soot, 'stone');
    F.dome(0, 0.74, 0.46, 0.2, 0.12, 0, soot, 'stone');
    F.blob(0, 0.46, 0.38, 0.14, 0.06, 0, F.col('ember'), 'glow');
    F.box(0, 0.38, 0.56, 0.5, 0.05, 0.14, 0, F.col('stoneTaupe'), 'stone');
    F.beam(0.42, 0.0, 0.58, 0.4, 0.62, 0.48, 0.32, 0.03, F.col('timberSepia'), 'wood');
    F.lamp(0, 0.6, 0.4, 0.5, 4);
  }
});

FURN({
  key: 'yuni_order_kitchen_range', name: 'Refectory kitchen range', culture: 'order', type: 'stove', setting: 'indoor',
  rooms: ['kitchen'], anchor: 'wall', clearance: { front: 1.1 },
  materials: ['stone', 'metal', 'emissive'],
  w: 1.9, d: 0.85, h: 2.2, variants: 1,
  build: function (F) {
    const stone = F.col('stoneGrey'), iron = F.col('blackIron'), brass = F.col('brass'), soot = F.col('stoneSoot');
    /* dressed-stone range with an iron cooktop, an oven door, an ash pit */
    F.box(0, 0, 0, 1.9, 0.86, 0.85, 0, stone, 'stone');
    for (let i = 0; i < 3; i++) F.box(0, 0.28 * i + 0.27, 0.426, 1.9, 0.015, 0.01, 0, F.shade(stone, -0.15), 'stone');
    F.box(0, 0.86, 0.02, 1.86, 0.06, 0.82, 0, iron, 'metal');
    for (const x of [-0.5, 0, 0.5]) {
      F.cyl(x, 0.92, 0.08, 0.17, 0.012, 0, F.shade(iron, 0.1), 'metal');
      F.cyl(x, 0.925, 0.08, 0.1, 0.01, 0, F.shade(iron, 0.2), 'metal');
    }
    F.box(-0.45, 0.3, 0.43, 0.6, 0.42, 0.03, 0, iron, 'metal');                /* oven door */
    F.rod(-0.68, 0.62, 0.452, -0.22, 0.62, 0.452, 0.014, brass, 'metal');
    F.box(0.45, 0.08, 0.43, 0.5, 0.18, 0.03, 0, soot, 'stone');                /* ash pit */
    F.blob(0.45, 0.14, 0.34, 0.12, 0.05, 0, F.col('ember'), 'glow');
    F.rod(-0.9, 0.82, 0.445, 0.9, 0.82, 0.445, 0.016, brass, 'metal');           /* towel rail */
    /* chimney breast with a mantel shelf and a hanging ladle */
    F.box(0, 0.92, -0.25, 1.5, 1.28, 0.35, 0, F.shade(stone, 0.05), 'stone');
    F.box(0, 1.5, -0.05, 1.7, 0.06, 0.3, 0, F.shade(stone, -0.08), 'stone');
    F.rod(0.62, 1.48, 0.06, 0.62, 1.2, 0.06, 0.012, iron, 'metal');
    F.blob(0.62, 1.18, 0.06, 0.06, 0.05, 0, F.shade(iron, 0.1), 'metal');
    F.lamp(0.45, 0.3, 0.6, 0.4, 3);
  }
});

FURN({
  key: 'yuni_nomad_fire_ring', name: 'Fire ring and tripod', culture: 'nomad', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'yard', 'hall'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 },
  materials: ['stone', 'timber', 'metal', 'rope', 'emissive'],
  w: 1.3, d: 1.3, h: 1.5, variants: 1,
  build: function (F) {
    const rock = F.col('stoneGranite'), pole = F.col('timberUmber'), iron = F.col('blackIron');
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * F.TAU + F.rr(-0.1, 0.1), r = 0.46;
      F.blob(Math.cos(a) * r, 0.07, Math.sin(a) * r, F.rr(0.09, 0.13), 0.15, a, F.shade(rock, F.rr(-0.08, 0.08)), 'stone');
    }
    F.cyl(0, 0, 0, 0.36, 0.02, 0, F.col('stoneBlack'), 'stone');
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * F.TAU + 0.3;
      F.rod(Math.cos(a) * 0.5, 0.06, Math.sin(a) * 0.5, -Math.cos(a) * 0.05, 0.12, -Math.sin(a) * 0.05, 0.03, F.col('timberSepia'), 'wood');
    }
    F.blob(0, 0.1, 0, 0.18, 0.1, 0, F.col('ember'), 'glow');
    F.cone(0, 0.08, 0, 0.12, 0.26, 0, F.col('amber'), 'glow');
    /* three poles lashed at the top, a chain, a pot */
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * F.TAU + 1.0;
      F.rod(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6, 0, 1.42, 0, 0.028, pole, 'wood');
    }
    F.cyl(0, 1.3, 0, 0.05, 0.08, 0, F.col('ropeMustard'), 'rope');
    F.rod(0, 1.3, 0, 0, 0.7, 0, 0.008, iron, 'metal');
    F.frustum(0, 0.44, 0, 0.13, 0.19, 0.12, 0, iron, 'metal', 12);
    F.frustum(0, 0.56, 0, 0.19, 0.17, 0.1, 0, F.shade(iron, 0.06), 'metal', 12);
    F.rod(-0.17, 0.66, 0, 0, 0.72, 0, 0.007, iron, 'metal');
    F.rod(0.17, 0.66, 0, 0, 0.72, 0, 0.007, iron, 'metal');
    F.lamp(0, 0.4, 0, 0.6, 5);
  }
});

FURN({
  key: 'yuni_court_low_table', name: 'Inlaid low table', culture: 'yuni-court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'study'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.5, right: 0.5 },
  materials: ['timber', 'stone', 'metal'],
  w: 1.6, d: 0.95, h: 0.45, variants: 2, variantNames: ['inlaid', 'with brass tray'],
  build: function (F) {
    const wood = F.col('timberWalnut'), brass = F.col('brass'), ivory = F.col('clothIvory');
    const tess = F.cols(['stoneCobalt', 'stoneAzure', 'clothSaffron', 'stoneTurquoise']);
    /* cusped apron on four turned legs */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.cyl(sx * 0.68, 0, sz * 0.36, 0.045, 0.36, 0, wood, 'wood');
      F.ball(sx * 0.68, 0.14, sz * 0.36, 0.06, F.shade(wood, 0.1), 'wood');
      F.cyl(sx * 0.68, 0, sz * 0.36, 0.06, 0.03, 0, brass, 'metal');
    }
    for (const s of [-1, 1]) {
      F.box(0, 0.28, s * 0.4, 1.36, 0.08, 0.04, 0, F.shade(wood, 0.05), 'wood');
      F.box(s * 0.72, 0.28, 0, 0.04, 0.08, 0.72, 0, F.shade(wood, 0.05), 'wood');
    }
    F.box(0, 0.36, 0, 1.6, 0.05, 0.95, 0, wood, 'wood');
    /* inlay: an ivory border, a field of tesserae, brass corner plates */
    F.box(0, 0.41, 0, 1.4, 0.006, 0.76, 0, ivory, 'stone');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      F.box(-0.595 + c * 0.17, 0.416, -0.255 + r * 0.17, 0.15, 0.006, 0.15, 0, F.pick(tess), 'stone');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.74, 0.41, sz * 0.42, 0.1, 0.006, 0.1, 0, brass, 'metal');
    if (F.variant === 1) {
      F.cyl(0, 0.422, 0, 0.32, 0.015, 0, brass, 'metal');
      F.cyl(0, 0.437, 0, 0.3, 0.008, 0, F.shade(brass, 0.12), 'metal');
    }
  }
});

/* ---------- surface pieces (anchor: 'surface'): stand on a table, counter or shelf top ---------- */

FURN({
  key: 'yuni_common_bowl', name: 'Bowl of fruit', culture: 'yuni-common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['stone', 'foliage'],
  w: 0.36, d: 0.36, h: 0.2, variants: 2, variantNames: ['fruit', 'flatbread'],
  build: function (F) {
    const clay = F.col('stoneClay'), slip = F.col('stoneIvory');
    F.cyl(0, 0, 0, 0.08, 0.02, 0, F.shade(clay, -0.12), 'stone');
    F.frustum(0, 0.02, 0, 0.1, 0.17, 0.08, 0, clay, 'stone', 14);
    F.cyl(0, 0.095, 0, 0.175, 0.012, 0, slip, 'stone');
    if (F.variant === 0) {
      const fruit = F.cols(['clothSaffron', 'clothOrange', 'produceLeaf', 'clothMadder']);
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * F.TAU + F.rr(-0.2, 0.2), r = i ? 0.075 : 0;
        F.ball(Math.cos(a) * r, 0.12 + (i ? 0 : 0.04), Math.sin(a) * r, 0.04, F.pick(fruit), 'plant');
      }
    } else {
      for (let i = 0; i < 3; i++) F.cyl(F.rr(-0.02, 0.02), 0.1 + i * 0.02, F.rr(-0.02, 0.02), 0.13, 0.018, 0, F.shade('plasterBirch', F.rr(-0.06, 0.06)), 'plant');
    }
  }
});

FURN({
  key: 'yuni_common_jug_cups', name: 'Water jug and cups', culture: 'yuni-common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'tavern', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['stone', 'metal'],
  w: 0.5, d: 0.32, h: 0.36, variants: 2, variantNames: ['on a tray', 'bare'],
  variantDims: [{ w: 0.5, d: 0.32, h: 0.36 }, { w: 0.42, d: 0.24, h: 0.34 }],
  build: function (F) {
    const clay = F.col('stoneClay'), brass = F.col('brass');
    let y = 0;
    if (F.variant === 0) { F.cyl(0, 0, 0, 0.155, 0.015, 0, brass, 'metal'); y = 0.015; }
    /* the jug: belly, shoulder, neck, lip and a strap handle */
    F.frustum(-0.08, y, 0, 0.06, 0.1, 0.1, 0, clay, 'stone', 12);
    F.frustum(-0.08, y + 0.1, 0, 0.1, 0.05, 0.1, 0, F.shade(clay, 0.05), 'stone', 12);
    F.cyl(-0.08, y + 0.2, 0, 0.045, 0.1, 0, F.shade(clay, -0.05), 'stone');
    F.cyl(-0.08, y + 0.3, 0, 0.055, 0.025, 0, F.shade(clay, -0.12), 'stone');
    F.beam(-0.08, y + 0.28, -0.05, -0.08, y + 0.14, -0.105, 0.025, 0.012, F.shade(clay, -0.08), 'stone');
    /* two cups */
    for (const [x, z] of [[0.1, 0.06], [0.17, -0.07]]) {
      F.frustum(x, y, z, 0.03, 0.042, 0.075, 0, F.shade(clay, 0.1), 'stone', 10);
    }
  }
});

FURN({
  key: 'yuni_order_book_stack', name: 'Books and a reading slope', culture: 'order', type: 'book', setting: 'indoor',
  rooms: ['library', 'study', 'school'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'plaster', 'timber'],
  w: 0.5, d: 0.36, h: 0.3, variants: 2, variantNames: ['stack', 'open on a slope'],
  variantDims: [{ w: 0.5, d: 0.36, h: 0.3 }, { w: 0.5, d: 0.32, h: 0.18 }],
  build: function (F) {
    const covers = F.cols(['clothWalnut', 'clothForest', 'clothDusk', 'clothTeak', 'clothWine']), page = F.col('clothBone');
    if (F.variant === 0) {
      let y = 0;
      for (let i = 0; i < 5; i++) {
        const w = F.rr(0.28, 0.4), d = F.rr(0.2, 0.28), t = F.rr(0.035, 0.06), r = F.rr(-0.25, 0.25), c = F.pick(covers);
        F.box(0, y, 0, w, t, d, r, c, 'cloth');
        F.box(0, y + 0.005, 0.006, w - 0.02, t - 0.01, d - 0.005, r, page, 'plaster');
        y += t;
      }
    } else {
      /* a small slope with an open folio on it, and one closed book beside */
      F.beam(-0.05, 0.0, -0.13, -0.05, 0.13, -0.13, 0.36, 0.04, F.col('timberWalnut'), 'wood');
      F.box(-0.05, 0, 0, 0.36, 0.02, 0.3, 0, F.col('timberWalnut'), 'wood');
      F.beam(-0.05, 0.02, 0.12, -0.05, 0.13, -0.11, 0.34, 0.015, F.shade('timberWalnut', 0.1), 'wood');
      for (const s of [-1, 1]) F.beam(-0.05 + s * 0.085, 0.04, 0.1, -0.05 + s * 0.085, 0.15, -0.1, 0.16, 0.012, page, 'plaster');
      F.box(0.2, 0, 0.06, 0.1, 0.04, 0.22, 0.1, F.pick(covers), 'cloth');
    }
  }
});

FURN({
  key: 'yuni_court_candlestick', name: 'Brass candlestick', culture: 'yuni-court', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'study', 'shrine'], anchor: 'surface', clearance: {},
  materials: ['metal', 'plaster', 'emissive'],
  w: 0.2, d: 0.2, h: 0.48, variants: 1,
  build: function (F) {
    const brass = F.col('brass');
    F.frustum(0, 0, 0, 0.09, 0.05, 0.03, 0, F.shade(brass, -0.1), 'metal', 12);
    F.cyl(0, 0.03, 0, 0.018, 0.22, 0, brass, 'metal');
    for (const y of [0.08, 0.17]) F.ball(0, y, 0, 0.03, F.shade(brass, 0.1), 'metal');
    F.frustum(0, 0.25, 0, 0.02, 0.06, 0.03, 0, brass, 'metal', 12);           /* drip pan */
    F.cyl(0, 0.28, 0, 0.022, 0.14, 0, F.col('plasterIvory'), 'plaster');
    F.cone(0, 0.42, 0, 0.012, 0.05, 0, F.col('amber'), 'glow');
    F.lamp(0, 0.45, 0, 0.3, 3);
  }
});

/* ================= Ancients kit extras (3 pieces) ================= */

FURN({
  key: 'ancients_light_strip_ring', name: 'Corridor light-strip ring', culture: 'ancient', type: 'lamp', setting: 'indoor',
  rooms: ['antechamber', 'hall'], anchor: 'ceiling', clearance: {},
  materials: ['stone', 'metal', 'emissive'],
  w: 2.6, d: 2.6, h: 0.3, variants: 2,
  build: function (F) {
    const CYAN = F.col('verdigris'), DEAD = F.col('unlit'), RIM = F.col('pewter'), CASE = F.col('steel');
    const lit = F.variant === 1;
    const r = 1.1, n = 8;
    /* housing channel under the strip, then the emitter segments in it */
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * F.TAU, a1 = ((i + 0.96) / n) * F.TAU;
      const x0 = Math.cos(a0) * r, z0 = Math.sin(a0) * r;
      const x1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
      F.beam(x0, 0.06, z0, x1, 0.06, z1, 0.18, 0.1, CASE, 'metal');
      const on = lit && F.chance(0.85);
      F.beam(x0, 0.17, z0, x1, 0.17, z1, 0.12, 0.09, on ? CYAN : DEAD, on ? 'glow' : 'metal');
    }
    /* floor plate, inner kerb and an outer rim bead */
    F.cyl(0, 0, 0, r + 0.2, 0.04, 0, RIM, 'metal');
    F.cyl(0, 0.04, 0, r - 0.2, 0.05, 0, F.shade(RIM, -0.2), 'metal');
    F.cyl(0, 0.04, 0, r + 0.19, 0.11, 0, F.shade(RIM, -0.08), 'metal');
    F.cyl(0, 0.15, 0, r + 0.16, 0.04, 0, F.shade(RIM, 0.08), 'metal');
    /* four mounting brackets and conduit stubs, evenly round the ring */
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + 0.22;
      const bx = Math.cos(a) * (r + 0.02), bz = Math.sin(a) * (r + 0.02);
      F.box(bx, 0.04, bz, 0.22, 0.16, 0.22, -a, F.shade(CASE, 0.12), 'metal');
      F.rod(bx, 0.1, bz, Math.cos(a) * (r + 0.16), 0.1, Math.sin(a) * (r + 0.16), 0.035, F.shade(CASE, -0.1), 'metal');
      F.ball(Math.cos(a) * (r + 0.18), 0.1, Math.sin(a) * (r + 0.18), 0.05, F.shade(RIM, -0.15), 'metal');
    }
    /* grime and a shed cover fragment on the plate */
    for (let i = 0; i < 2; i++) {
      const a = F.rnd() * F.TAU, rr2 = F.rr(0.2, 0.85);
      F.blob(Math.cos(a) * rr2, 0.05, Math.sin(a) * rr2, F.rr(0.08, 0.16), 0.03, F.rnd() * F.TAU, F.col('stoneGraphite'), 'stone');
    }
    F.box(F.rr(-0.5, 0.5), 0.04, F.rr(-0.5, 0.5), 0.3, 0.02, 0.2, F.rnd() * F.TAU, F.shade(RIM, -0.3), 'metal');
    if (lit) F.lamp(0, 0.2, 0, 0.6, 8);
  }
});

FURN({
  key: 'ancients_aa_battery', name: 'Rooftop AA gun battery', culture: 'ancient', type: 'weapon', setting: 'outdoor',
  rooms: ['rooftop'], anchor: 'floor', clearance: { front: 1, back: 1, left: 1, right: 1 },
  materials: ['metal', 'glass', 'emissive'],
  w: 2.7, d: 2.9, h: 2.6, variants: 2,
  build: function (F) {
    F.shift(0, -0.37); /* centre the footprint on the origin (verify.py declared-size) */
    const TARN = F.col('pewter'), DARK = F.col('steel'), RUST = F.col('redCopper'), GLASS = F.col('verdigris');
    const ruined = F.variant === 1;
    const skin = ruined ? F.shade(TARN, -0.25) : TARN;
    /* deck plate, hold-down bolts and the slew ring it turns on */
    F.box(0, 0, 0, 2.1, 0.22, 2.1, 0, DARK, 'metal');
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + Math.PI / 4;
      F.box(Math.cos(a) * 0.92, 0.22, Math.sin(a) * 0.92, 0.28, 0.09, 0.28, -a, F.shade(DARK, 0.15), 'metal');
      F.cyl(Math.cos(a) * 0.92, 0.31, Math.sin(a) * 0.92, 0.055, 0.07, 0, F.shade(TARN, -0.1), 'metal');
    }
    F.cyl(0, 0.22, 0, 0.72, 0.16, 0, F.shade(DARK, 0.1), 'metal');
    F.cyl(0, 0.38, 0, 0.66, 0.08, 0, F.shade(TARN, -0.2), 'metal');
    /* turret drum, ribs and a curved shield */
    const yaw = F.rr(-0.6, 0.6);
    F.frustum(0, 0.46, 0, 0.6, 0.5, 0.92, yaw, skin, 'metal', 10);
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + yaw + 0.4;
      F.rod(Math.cos(a) * 0.56, 0.5, Math.sin(a) * 0.56, Math.cos(a) * 0.47, 1.34, Math.sin(a) * 0.47, 0.045, F.shade(skin, -0.12), 'metal');
    }
    F.box(Math.sin(yaw) * 0.62, 0.62, Math.cos(yaw) * 0.62, 1.5, 0.95, 0.12, yaw, ruined ? RUST : F.shade(TARN, 0.08), 'metal');
    F.box(Math.sin(yaw) * 0.62, 1.18, Math.cos(yaw) * 0.62, 0.5, 0.22, 0.06, yaw, ruined ? F.shade(RUST, -0.2) : GLASS, ruined ? 'metal' : 'glass');
    F.cyl(0, 1.38, 0, 0.5, 0.12, 0, F.shade(skin, 0.06), 'metal');
    /* trunnion cradle and the twin barrel bank */
    const pitch = ruined ? -0.5 : 0.5;
    const hx = Math.sin(yaw) * 0.85, hz = Math.cos(yaw) * 0.85;
    const my = 1.5;
    for (let s = -1; s <= 1; s += 2) {
      const tx = Math.cos(yaw) * s * 0.42, tz = -Math.sin(yaw) * s * 0.42;
      F.box(tx, 1.14, tz, 0.2, 0.42, 0.2, yaw, F.shade(skin, -0.08), 'metal');
    }
    F.beam(0, my, 0, hx, my + Math.sin(pitch) * 1.0, hz, 0.72, 0.6, skin, 'metal');
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * 0.2;
        const bx = hx + Math.cos(yaw) * off, bz = hz - Math.sin(yaw) * off;
        const by = my + Math.sin(pitch) * 1.0 + row * 0.16 - 0.08;
        const tx = bx + Math.sin(yaw) * Math.cos(pitch) * 1.05;
        const tz = bz + Math.cos(yaw) * Math.cos(pitch) * 1.05;
        const ty = by + Math.sin(pitch) * 1.05;
        F.rod(bx, by, bz, tx, ty, tz, 0.05, ruined ? RUST : F.shade(TARN, -0.15), 'metal');
      }
    }
    /* sight mast, ready-use ammo lockers and a gunner's step */
    F.rod(-Math.sin(yaw) * 0.3, 1.5, -Math.cos(yaw) * 0.3, -Math.sin(yaw) * 0.34, 2.46, -Math.cos(yaw) * 0.34, 0.035, F.shade(TARN, -0.1), 'metal');
    F.box(-Math.sin(yaw) * 0.34, 2.46, -Math.cos(yaw) * 0.34, 0.2, 0.12, 0.14, yaw, ruined ? RUST : F.shade(TARN, 0.1), 'metal');
    F.ball(-Math.sin(yaw) * 0.34, 2.54, -Math.cos(yaw) * 0.34, 0.06, ruined ? RUST : GLASS, ruined ? 'metal' : 'glow');
    for (let s = -1; s <= 1; s += 2) {
      F.box(s * 1.0, 0.22, -0.78, 0.5, 0.3, 0.4, s * 0.2, DARK, 'metal');
      F.box(s * 1.0, 0.52, -0.78, 0.52, 0.05, 0.42, s * 0.2, F.shade(DARK, 0.2), 'metal');
    }
    F.box(0, 0.22, 1.0, 0.7, 0.14, 0.34, 0, F.shade(DARK, 0.12), 'metal');
    if (ruined) {
      F.blob(0.4, 0.4, 0.5, 0.35, 0.3, F.rnd() * F.TAU, RUST, 'metal');
      F.box(-0.9, 0.22, 0.7, 0.5, 0.06, 0.4, F.rnd() * F.TAU, F.shade(RUST, -0.15), 'metal');
      F.rod(0.6, 0.3, -0.4, 1.25, 0.12, -0.9, 0.04, F.shade(TARN, -0.3), 'metal');
    }
  }
});

FURN({
  key: 'ancients_rubble_pile', name: 'Rubble and debris pile', culture: 'ancient', type: 'debris', setting: 'outdoor',
  rooms: ['street', 'yard', 'plaza'], anchor: 'floor', clearance: {},
  materials: ['stone', 'metal'],
  w: 3.15, d: 3.1, h: 0.85, variants: 1,
  build: function (F) {
    const tones = F.cols(['stoneTaupe', 'stoneGranite', 'stoneTaupe', 'stoneGranite']);
    const metal = F.cols(['pewter', 'steel', 'redCopper']);
    /* a spread of broken masonry, densest toward the middle of the heap */
    for (let i = 0; i < 10; i++) {
      const a = F.rnd() * F.TAU, r = F.rr(0.15, 1.18), s = F.rr(0.16, 0.44), bh = s * F.rr(0.7, 1.15);
      /* a blob is centred at y: keep its underside at the ground, not below it */
      const y = Math.max(bh / 2 - 0.03, 0.44 * (1 - r / 1.25));
      F.blob(Math.cos(a) * r, y, Math.sin(a) * r, s, bh, F.rnd() * F.TAU, F.pick(tones), 'stone');
    }
    /* angular slabs and snapped-off block corners */
    for (let i = 0; i < 5; i++) {
      const a = F.rnd() * F.TAU, r = F.rr(0.1, 1.1);
      const y = Math.max(0, 0.34 * (1 - r / 1.25));
      F.box(Math.cos(a) * r, y, Math.sin(a) * r, F.rr(0.22, 0.52), F.rr(0.1, 0.26), F.rr(0.22, 0.5),
        F.rnd() * F.TAU, F.pick(tones), 'stone');
    }
    /* a couple of larger tilted slabs propped against the heap */
    for (let i = 0; i < 2; i++) {
      const a = F.rnd() * F.TAU, sw = F.rr(0.4, 0.6);
      /* the slab rests on its lower corner: lift its foot so no corner goes under the ground */
      F.beam(Math.cos(a) * 0.95, 0.04 + sw * 0.45, Math.sin(a) * 0.95, Math.cos(a) * 0.25, 0.44 + sw * 0.2, Math.sin(a) * 0.25,
        sw, 0.09, F.pick(tones), 'stone');
    }
    /* bent reinforcement and torn panel scrap poking out of it */
    for (let i = 0; i < 3; i++) {
      const a = F.rnd() * F.TAU, r = F.rr(0.2, 0.8);
      F.rod(Math.cos(a) * r, 0.05, Math.sin(a) * r,
        Math.cos(a) * (r + F.rr(0.1, 0.4)), F.rr(0.38, 0.62), Math.sin(a) * (r + F.rr(0.1, 0.4)), 0.022,
        F.pick(metal), 'metal');
    }
    F.box(F.rr(-0.7, 0.7), 0.3, F.rr(-0.7, 0.7), F.rr(0.3, 0.55), 0.03, F.rr(0.25, 0.45), F.rnd() * F.TAU, F.col('steel'), 'metal');
    /* dust and grit skirting the pile */
    for (let i = 0; i < 3; i++) {
      const a = F.rnd() * F.TAU, r = F.rr(0.8, 1.25);
      F.blob(Math.cos(a) * r, 0.03, Math.sin(a) * r, F.rr(0.12, 0.25), 0.05, F.rnd() * F.TAU, F.shade(F.pick(tones), 0.1), 'stone');
    }
  }
});

/* ---------- interior additions (2026-10) ---------- */

FURN({
  key: 'ancients_workstation', name: 'Moulded workstation', culture: 'ancient', type: 'workstation', setting: 'indoor',
  rooms: ['workshop', 'study', 'antechamber'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'glass', 'concrete', 'emissive'],
  w: 1.6, d: 0.85, h: 1.55, variants: 2, variantNames: ['lit', 'dead'],
  build: function (F) {
    const white = F.col('alloy'), tarn = F.col('silver'), dark = F.col('glassBlack'), glow = F.col('electric');
    const lit = F.variant === 0;
    /* one moulded shell: a pedestal, a desk wing, a sloped display spine against the wall */
    F.box(0, 0, -0.15, 1.5, 0.06, 0.55, 0, F.shade(tarn, -0.15), 'concrete');
    F.box(-0.55, 0.06, -0.12, 0.38, 0.66, 0.6, 0, white, 'metal');
    for (let i = 0; i < 3; i++) F.box(-0.55, 0.14 + i * 0.2, 0.181, 0.32, 0.005, 0.01, 0, tarn, 'metal');
    F.box(0.6, 0.06, -0.12, 0.12, 0.66, 0.5, 0, white, 'metal');
    F.box(0, 0.72, 0.0, 1.6, 0.05, 0.85, 0, white, 'metal');
    F.rod(-0.8, 0.745, 0.425, 0.8, 0.745, 0.425, 0.025, F.shade(white, -0.05), 'metal');
    F.box(0, 0.77, -0.36, 1.5, 0.1, 0.13, 0, tarn, 'metal');
    F.beam(0, 0.82, -0.36, 0, 1.5, -0.4, 1.4, 0.05, white, 'metal');
    F.beam(0, 0.86, -0.33, 0, 1.46, -0.37, 1.22, 0.01, lit ? glow : dark, lit ? 'glow' : 'glass');
    F.box(0, 0.77, 0.08, 0.7, 0.012, 0.22, 0, dark, 'glass');                  /* touch slab */
    if (lit) {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        if (F.chance(0.7)) F.box(-0.29 + c * 0.116, 0.783, 0.02 + r * 0.06, 0.08, 0.002, 0.04, 0, F.chance(0.3) ? F.col('amber') : glow, 'glow');
      }
      F.lamp(0, 1.15, 0, 0.5, 4);
    }
    F.rod(0.62, 0.0, -0.4, 0.62, 0.8, -0.4, 0.03, F.shade(tarn, -0.2), 'metal');   /* cable trunk */
  }
});
