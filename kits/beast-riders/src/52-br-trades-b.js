// prefix: brt
/* ======================================================================
   The Beast Riders kit: the sedentary trades, part 2 of 3: the works, the stock and the water's edge. The helpers
   and the census table are src/51-br-trades.js's (brt*, BRT, BR_TRADES); the vocabulary the mounts' (brm*, BRM).
   What turns here turns by beast (brtWhim: the mill, the shaft, the landing's crane) or by water (the mill's wheel).

     br_bldg_storehouse    porters and warehousemen: the raised store; the tack and feed store
     br_bldg_granary       granary keepers: the rice barn on its rat-stones; the row of cribs
     br_bldg_mill          millers: the beast mill under its round roof; the water mill
     br_bldg_hauling_yard  industrial workers: the timber haulers' yard; the stone haulers' yard (threehorn draught)
     br_bldg_beast_stage   the carrier-beast stage on the forest road (Voth's elephant bug station, ridden)
     br_bldg_beetle_pen    beetle herders: the Staghorn's beetle house and run; the breeding shed
     br_bldg_fungus_house  mushroom growers: the dark fungus house (glow fungus among the caps); the fungus cellar
     br_bldg_mine_head     miners: the adit in its rock face; the shaft and its whim
     br_bldg_quarry        quarrymen and masons: the quarry face; the masons' yard
     br_bldg_canoe_shed    shipwrights, coast guard: the voyaging canoe's shed; the war-canoe shed
     br_bldg_river_landing dockers, bargemen, fishers, ferrymen: the cargo landing; the fishers'; the ferry
   ====================================================================== */

/* a raised floor on posts (the store, the barn): posts at the corners and mid-sides on stone pads, the rat-guard
   discs under the floor, the floor beams; returns nothing (the floor's top is y) */
function brtStilts(F, x0, x1, z0, z1, y, nx) {
  for (let i = 0; i <= nx; i++) for (const z of [z0 + 0.25, z1 - 0.25]) {
    const x = x0 + 0.25 + i * (x1 - x0 - 0.5) / nx;
    F.box(x, 0, z, 0.7, 0.35, 0.7, 0, BRM.rock, 'stone');
    F.cyl(x, 0.35, z, 0.2, y - 0.35, 0, BRM.timber[2], BRM_TIMBER);
    F.cyl(x, y - 0.75, z, 0.55, 0.1, 0, BRM.timber[3], BRM_TIMBER);
  }
  F.box((x0 + x1) / 2, y - 0.3, (z0 + z1) / 2, x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2, 0, BRM.timber[2], BRM_TIMBER);
}
/* a log sledge (the haulers'): two runners, the bolsters, its load of logs or a block */
function brtSledge(F, x, z, L, logs) {
  for (const s of [-0.7, 0.7]) F.beam(x - L / 2, 0.2, z + s, x + L / 2, 0.2, z + s, 0.18, 0.3, BRM.timber[2], BRM_TIMBER);
  for (const t of [-0.35, 0.35]) F.box(x + t * L, 0.35, z, 0.3, 0.2, 1.9, 0, BRM.timber[1], BRM_TIMBER);
  if (logs) for (let i = 0; i < 3; i++) F.rod(x - L / 2 - 0.4, 0.75 + (i === 2 ? 0.42 : 0), z + (i === 2 ? 0 : (i ? 0.4 : -0.4)), x + L / 2 + 0.4, 0.75 + (i === 2 ? 0.42 : 0), z + (i === 2 ? 0 : (i ? 0.4 : -0.4)), 0.22, BRM.timber[i % 2 ? 0 : 3], 'bark');
  else F.box(x, 0.55, z, L * 0.6, 1.0, 1.4, 0, BRT.sand, 'stone');
}

/* ================================ the store */
ASSET({
  key: 'br_bldg_storehouse', name: 'Storehouse (porters and warehousemen)', culture: 'beast-rider', job: 'warehousing',
  family: 'trade', types: ['industry', 'infrastructure'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 18.5, d: 13, h: 11, variants: 2, variantNames: ['the raised store', 'the tack and feed store'],
  variantDims: [{ w: 11.5, d: 13, h: 11 }, { w: 18.5, d: 10.5, h: 11 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* the tack and feed store: a stave hall, two wide doors, the saddles and harness on their racks, the hay in the
         loft under the roof (its loft door open on the end) */
      const y0 = 0.4, x0 = -8, x1 = 8, z0 = -3.5, z1 = 3.5, wh = 3.2;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: -3.5, w: 2.4, h: 2.6 }, { side: 'f', at: 3.5, w: 2.4, h: 2.6 }]);
      for (const s of ['l', 'r']) brtWin(F, s, x0, x1, z0, z1, 0, y0 + 2.0, 0.9, 0.6);
      brtStruts(F, x0, x1, z0, z1, y0 + wh, true, 3);
      F.box(0, y0 + wh - 0.1, 0, 2 * 8 - 0.4, 0.14, 2 * 3.5 - 0.4, 0, BRM.plank, 'wood');
      F.box(0, y0 + wh + 0.04, -0.6, 12, 1.0, 4.2, 0, BRM.straw, 'straw/cloth');
      brmHip(F, 0, 0, y0 + wh, 2 * 8 + 1.8, 5.4, 2 * 3.5 + 1.8, BRM.shingle[1], 1.1);
      F.furn('br_h_tack_rack', -4.4, y0, z0 + 0.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_tack_rack', 0.4, y0, z0 + 0.6, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_saddle_trestle', -5.0, y0, 0.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_court_saddle_stand', -1.0, y0, 0.6, Math.PI / 2, { v: 0, setting: 'indoor' });
      F.furn('br_h_hay_bales', 5.6, y0, -2.2, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_sack_pile', 6.6, y0, 1.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_feed_basket', 3.6, y0 + wh - 1.6, 0.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_hitching_rail', 0, 0, 5.6, 0, { v: 0 });
      brtLamp(F, -2.0, y0 + wh - 0.1, 0.4);
      return;
    }
    /* the raised store: the floor at 2 m on posts with their rat-guards, stave walls, a landing stage and steps at the
       front, a hoist beam out over it, a steep shingle hip */
    const y = 2.0, x0 = -4.5, x1 = 4.5, z0 = -3.5, z1 = 2.5, wh = 2.6;
    brtStilts(F, x0, x1, z0, z1 + 1.8, y, 3);
    F.box(0, y - 0.04, z1 + 0.9, x1 - x0 - 0.2, 0.08, 1.7, 0, BRM.plank, 'wood');
    brtWalls(F, x0, x1, z0, z1, y, wh, BRM.stave[1], [{ side: 'f', at: 0, w: 1.8, h: 2.1 }]);
    brtWin(F, 'l', x0, x1, z0, z1, 0, y + 1.7, 0.7, 0.5);
    for (let k = 0; k < 6; k++) F.box(3.0, (k + 1) * y / 7, z1 + 2.05 + (5 - k) * 0.4, 1.1, 0.12, 0.42, 0, BRM.plank, 'wood');
    for (const e of [-0.6, 0.6]) F.rod(3.0 + e, 0, z1 + 4.6, 3.0 + e, y, z1 + 1.8, 0.07, BRM.timber[2], BRM_TIMBER);
    brmHip(F, 0, -0.1, y + wh, x1 - x0 + 1.8, 4.6, z1 - z0 + 4.4, BRM.shingle[0], 1.0);
    F.beam(0, y + wh + 0.35, z1 - 0.5, 0, y + wh + 0.35, z1 + 3.4, 0.22, 0.24, BRM.timber[2], BRM_TIMBER);
    brmFinial(F, 0, y + wh + 0.2, z1 + 3.3, 0, 1, 0.5, BRM.deep);
    F.rod(0, y + wh + 0.25, z1 + 3.1, 0, 1.0, z1 + 3.1, 0.025, BRM.rope, 'rope');
    F.box(0, 0.6, z1 + 3.1, 0.7, 0.5, 0.7, 0, BRM.timber[3], BRM_TIMBER);
    F.furn('br_storehouse_goods', -2.0, y, -1.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_sack_pile', 2.6, y, -2.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_crate_stack', 2.4, y, 0.4, Math.PI / 2, { v: 1, setting: 'indoor' });
    F.furn('br_h_barrel_cluster', -2.0, 0, 0.8, 0, { v: 0 });
    F.furn('br_h_crate_stack', -2.2, 0, z1 + 3.6, 0, { v: 0 });
  }
});

/* ================================ the granary */
ASSET({
  key: 'br_bldg_granary', name: 'Granary (granary keepers)', culture: 'beast-rider', role: 'granary',
  family: 'trade', types: ['farm', 'infrastructure'], districts: ['ridertown'], wealth: [0.1, 0.7],
  w: 16, d: 8.5, h: 11, variants: 2, variantNames: ['the rice barn on its rat-stones', 'the row of cribs'],
  variantDims: [{ w: 9.5, d: 8.5, h: 11 }, { w: 16, d: 6.5, h: 7 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* three cribs on one platform: slatted cane walls on posts, each its own small thatch pyramid */
      const y = 1.4;
      brtStilts(F, -7.5, 7.5, -2.6, 2.6, y, 5);
      F.box(0, y - 0.02, 0, 15, 0.08, 5.0, 0, BRM.plank, 'wood');
      for (let i = 0; i < 3; i++) {
        const cx = -5 + i * 5;
        F.box(cx, y, -0.2, 3.6, 2.2, 3.4, 0, BRM.wall, 'reed');
        for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) F.box(cx + p[0] * 1.8, y, -0.2 + p[1] * 1.7, 0.2, 2.3, 0.2, 0, BRM.timber[2], BRM_TIMBER);
        F.box(cx, y + 0.1, 1.52, 1.0, 1.6, 0.08, 0, BRM.stave[0], BRM_STAVE);
        F.pyrRoof(cx, y + 2.2, -0.2, 4.6, 2.6, 4.4, 0, i === 1 ? BRM.thatch[0] : BRM.thatch[1], 'thatch');
        brtBand(F, cx, -0.2, y + 2.2, 4.6, 4.4);
        F.cyl(cx, y + 4.7, -0.2, 0.08, 0.7, 0, BRM.gilt, BRM_TIMBER);
      }
      F.furn('br_h_sack_pile', -5, y, -0.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_sack_pile', 0, y, -0.4, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_sack_pile', 5, y, -0.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_wall_ladder', -2.5, 0, 3.2, Math.PI, { v: 0 });
      return;
    }
    /* the rice barn (the lumbung): four posts on stone, broad rat-guard discs, the store box under a great steep
       thatch whose eaves come down over it; a sitting deck under the floor where the keeper works */
    const y = 2.4;
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      F.box(p[0] * 2.4, 0, p[1] * 1.9, 0.9, 0.5, 0.9, 0, BRM.rock, 'stone');
      F.cyl(p[0] * 2.4, 0.5, p[1] * 1.9, 0.24, y - 0.5, 0, BRM.timber[2], BRM_TIMBER);
      F.cyl(p[0] * 2.4, y - 0.7, p[1] * 1.9, 0.75, 0.12, 0, BRM.timber[3], BRM_TIMBER);
    }
    F.box(0, 0.5, 0, 5.4, 0.12, 4.4, 0, BRM.plank, 'wood');
    F.box(0, y - 0.3, 0, 5.6, 0.3, 4.6, 0, BRM.timber[2], BRM_TIMBER);
    F.box(0, y, 0, 5.0, 1.9, 4.0, 0, BRM.stave[0], BRM_STAVE);
    F.box(0, y + 0.4, 2.02, 1.0, 1.1, 0.06, 0, BRM.red, BRM_TIMBER);
    F.hipRoof(0, y + 1.6, 0, 8.6, 5.2, 7.6, 0, BRM.thatch[0], 'thatch');
    brtBand(F, 0, 0, y + 1.6, 8.6, 7.6);
    brmFinial(F, 0.5, y + 6.8, 0, 1, 0, 0.9, BRM.deep); brmFinial(F, -0.5, y + 6.8, 0, -1, 0, 0.9, BRM.deep);
    F.furn('br_h_sack_pile', -1.2, y, -0.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_sack_pile', 1.2, y, -0.4, 0, { v: 1, setting: 'indoor' });
    F.furn('br_bench', 0, 0.62, 1.0, 0, { v: 0 });
    F.furn('br_h_feed_basket', 1.4, 0.62, -0.8, 0, { v: 0 });
    F.furn('br_h_wall_ladder', 0, 0, 3.0, Math.PI, { v: 0 });
  }
});

/* ================================ the mill */
ASSET({
  key: 'br_bldg_mill', name: 'Mill (millers)', culture: 'beast-rider', job: 'milling',
  family: 'industrial', types: ['industry', 'farm'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 16, d: 16, h: 11.5, variants: 2, variantNames: ['the beast mill under its round roof', 'the water mill'],
  variantDims: [{ w: 16, d: 16, h: 11.5 }, { w: 13.5, d: 12.5, h: 9.5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* the water mill: a stave mill house on a stone footing beside the race, an undershot wheel in the race turning
         the stones inside through its axle */
      const y0 = 0.6, x0 = -6.5, x1 = 1.5, z0 = -4, z1 = 3, wh = 2.8;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[1], [{ side: 'f', at: -1.5, w: 1.6, h: 2.2 }]);
      brtWin(F, 'f', x0, x1, z0, z1, 2.0, y0 + 1.8, 0.9, 0.7);
      brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.8, 0.9, 0.7);
      brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 4.6, z1 - z0 + 1.6, BRM.shingle[1], 1.0);
      /* the race: stone walls, the water */
      const rx = 4.2;
      for (const s of [-1, 1]) F.box(rx + s * 1.25, 0, -0.5, 0.5, 0.7, 11, 0, BRM.rock, 'stone');
      F.box(rx, 0, -0.5, 2.0, 0.3, 11, 0, BRT.water, 'glass');
      /* the wheel: two rims of twelve, the spokes, the floats, the axle into the house */
      const hy = 2.7, R = 2.4, n = 12;
      for (const wx of [rx - 0.5, rx + 0.5]) for (let i = 0; i < n; i++) {
        const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
        F.beam(wx, hy + Math.sin(a0) * R, Math.cos(a0) * R, wx, hy + Math.sin(a1) * R, Math.cos(a1) * R, 0.14, 0.16, BRM.timber[2], BRM_TIMBER);
        if (i % 2 === 0) F.beam(wx, hy, 0, wx, hy + Math.sin(a0) * R, Math.cos(a0) * R, 0.12, 0.12, BRM.timber[1], BRM_TIMBER);
      }
      for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2; F.box(rx, hy + Math.sin(a) * R - 0.25, Math.cos(a) * R, 1.2, 0.5, 0.14, 0, BRM.timber[3], BRM_TIMBER); }
      F.rod(x1 - 0.2, hy, 0, rx + 0.8, hy, 0, 0.16, BRM.timber[2], BRM_TIMBER);
      /* the stones and the meal */
      F.cyl(-1.5, y0, -1.0, 1.1, 0.7, 0, BRM.rock, 'stone');
      F.cyl(-1.5, y0 + 0.7, -1.0, 1.0, 0.3, 0, shade(BRM.rock, 0.12), 'stone');
      F.frustum(-1.5, y0 + 1.3, -1.0, 0.25, 0.7, 0.8, 0, BRM.timber[1], BRM_TIMBER, 8);
      F.furn('br_h_sack_pile', -4.8, y0, -2.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_sack_pile', -4.8, y0, 1.6, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_workshop_shelves', -1.5, y0, z0 + 0.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_crate_stack', -3.0, 0, 4.8, 0, { v: 0 });
      brtLamp(F, -3.0, y0 + wh, 0);
      return;
    }
    /* the beast mill: an open round house of ten carved posts under a shingle cone; inside, the stones on their base,
       the hopper, the upright to the roof's crown, the sweep arm out to where the beast walks its ring */
    const R = 6.4, ph = 4.2;
    F.cyl(0, 0, 0, R + 0.9, 0.25, 0, BRM.rock, 'stone');
    F.cyl(0, 0.25, 0, R - 0.2, 0.04, 0, BRM.mud, 'yard/stone');
    for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * Math.PI * 2; brmPost(F, Math.cos(a) * R, 0.25, Math.sin(a) * R, ph, 0.34, i % 2 ? BRM.deep : BRM.red, BRM.gilt); }
    for (let i = 0; i < 10; i++) {
      const a0 = (i + 0.5) / 10 * Math.PI * 2, a1 = (i + 1.5) / 10 * Math.PI * 2;
      F.beam(Math.cos(a0) * R, 0.25 + ph, Math.sin(a0) * R, Math.cos(a1) * R, 0.25 + ph, Math.sin(a1) * R, 0.28, 0.32, BRM.red, BRM_TIMBER);
    }
    brmTier(F, 0.25 + ph + 0.2, R + 1.4, 0.6, 5.6, BRM.shingle[1], 10, BRM.verd);
    F.cyl(0, 0.25 + ph + 5.6, 0, 0.2, 1.0, 0, BRM.gilt, BRM_TIMBER);
    F.cyl(0, 0.29, 0, 1.3, 0.8, 0, BRM.rock, 'stone');
    F.cyl(0, 1.09, 0, 1.15, 0.35, 0, shade(BRM.rock, 0.12), 'stone');
    F.frustum(0, 1.6, 0, 0.3, 0.8, 0.9, 0, BRM.timber[1], BRM_TIMBER, 8);
    F.cyl(0, 1.44, 0, 0.22, ph + 0.8, 0, BRM.timber[2], BRM_TIMBER);
    const a = 0.5, ar = 5.0;
    F.beam(0, 1.9, 0, Math.cos(a) * ar, 1.6, Math.sin(a) * ar, 0.24, 0.28, BRM.timber[2], BRM_TIMBER);
    F.box(Math.cos(a) * ar, 1.1, Math.sin(a) * ar, 0.5, 0.5, 1.5, -a, BRM.red, BRM_TIMBER);
    F.furn('br_h_sack_pile', -2.6, 0.29, -2.4, 0, { v: 0 });
    F.furn('br_h_sack_pile', 2.6, 0.29, -2.6, 0, { v: 1 });
    F.furn('br_h_trough', -4.0, 0.29, 3.2, 0.6, { v: 0 });
    F.furn('br_h_feed_basket', 3.0, 0.25 + ph - 1.6, 3.0, 0, { v: 0 });
    F.furn('br_h_hanging_lantern', -2.0, 0.25 + ph - 2.3, 2.0, 0, { v: 0 });
  }
});

/* ================================ the haulers' yard */
ASSET({
  key: 'br_bldg_hauling_yard', name: 'Hauling yard (industrial workers)', culture: 'beast-rider', role: 'hauling',
  family: 'industrial', types: ['industry', 'infrastructure'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 25.5, d: 22.5, h: 11, variants: 2, variantNames: ['the timber haulers\' yard', 'the stone haulers\' yard'],
  variantDims: [{ w: 25.5, d: 22.5, h: 11 }, { w: 23.5, d: 21.5, h: 11 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, hw = v1 ? 6.5 : 8.0, hd = 4.5, zc = -5.5, ph = 4.4;
    F.box(0, 0, 0, v1 ? 23 : 25, 0.04, v1 ? 19 : 21, 0, BRM.mud, 'yard/stone');
    /* the draught beasts' shed: log posts under a thatch hip, straw, the troughs and harness */
    F.box(0, 0.04, zc, 2 * hw + 0.6, 0.06, 2 * hd + 0.6, 0, BRM.straw, 'straw/cloth');
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) brmPost(F, -hw + i * (2 * hw) / 3, 0, zc + s * hd, ph, 0.4, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    for (const s of [-1, 1]) F.beam(-hw, ph, zc + s * hd, hw, ph, zc + s * hd, 0.34, 0.38, BRM.red, BRM_TIMBER);
    F.box(0, 0.04, zc - hd + 0.1, 2 * hw, 2.0, 0.2, 0, BRM.stave[0], BRM_STAVE);
    brtJoglo(F, 0, zc, ph + 0.35, 2 * hw + 3.2, 2 * hd + 3.0, { crownH: 3.2, fin: 1.1 });
    F.furn('br_h_trough', -hw / 2, 0.1, zc - hd + 1.0, 0, { v: 2 });
    F.furn('br_h_trough', hw / 2, 0.1, zc - hd + 1.0, 0, { v: 0 });
    F.furn('br_h_tack_rack', -hw + 1.9, 0.1, zc + 0.4, Math.PI / 2, { v: 1 });
    F.furn('br_h_hay_bales', hw - 1.6, 0.1, zc + 1.0, 0, { v: 2 });
    F.furn('br_h_water_butt', hw + 1.6, 0, zc + hd + 1.4, 0, { v: 1 });
    if (!v1) {
      /* the timber: sledges of logs, the log pile, the shear legs that load them, the sawn stack */
      brtSledge(F, -4.5, 4.0, 5.0, true);
      brtSledge(F, 4.0, 6.5, 5.0, true);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) F.rod(-11.5, 0.25 + r * 0.42, 1.0 + i * 0.46 + r * 0.23, -6.5, 0.25 + r * 0.42, 1.0 + i * 0.46 + r * 0.23, 0.22, BRM.timber[(i + r) % 4], 'bark');
      brtShear(F, -9.0, 5.5, 6.0, 1.8, 0.3, 2.0);
      F.furn('br_h_plank_stack', 8.5, 0.04, 1.8, Math.PI / 2, { v: 0 });
      F.furn('br_h_rope_coils', 6.0, 0.04, 2.2, 0, { v: 0 });
      return;
    }
    /* the stone: a sledge with its block, dressed blocks in rows, the loading ramp and stage */
    brtSledge(F, -3.0, 4.0, 4.6, false);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) F.box(4.0 + i * 1.6, 0.04 + j * 0.8, 3.0, 1.4, 0.78, 1.0, 0, j ? BRT.sandL : BRT.sand, 'stone');
    F.box(-8.5, 0, 5.0, 3.0, 1.2, 4.0, 0, BRM.timber[2], BRM_TIMBER);
    F.beam(-8.5, 0, 9.2, -8.5, 1.2, 7.0, 2.6, 0.2, BRM.plank, 'wood');
    F.furn('br_h_rope_coils', -8.5, 1.2, 4.6, 0, { v: 1 });
  }
});

/* ================================ the carrier-beast stage */
ASSET({
  key: 'br_bldg_beast_stage', name: 'Carrier-beast stage (station hands)', culture: 'beast-rider', role: 'stage',
  family: 'civic', types: ['infrastructure'], districts: ['ridertown'], wealth: [0.2, 0.6],
  w: 22, d: 18, h: 10.5, variants: 2, variantNames: ['the mounting stage and its byre', 'the roadside stop'],
  variantDims: [{ w: 22, d: 18, h: 10.5 }, { w: 15.5, d: 9, h: 8.5 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, sh = v1 ? 2.6 : 3.4, hw = v1 ? 4.0 : 6.0, z0 = -2.5, z1 = 1.5;
    /* the road lane before it, where the great carrier beast stands to be loaded at its howdah's height */
    F.box(0, 0, v1 ? 3.5 : 4.5, 2 * hw + 6, 0.04, 4.0, 0, BRM.mud, 'yard/stone');
    /* the stage: a timber crib filled with stone, its deck, steps up the end, a red rail on the road side open at the
       loading gap; the waiting shelter on it */
    F.box(0, 0, (z0 + z1) / 2, 2 * hw, sh - 0.15, z1 - z0, 0, BRM.timber[2], BRM_TIMBER);
    for (let i = 0; i <= 4; i++) F.box(-hw + i * hw / 2, 0, z1 + 0.02, 0.18, sh - 0.15, 0.06, 0, BRM.timber[0], BRM_TIMBER);
    F.box(0, sh - 0.15, (z0 + z1) / 2, 2 * hw + 0.3, 0.15, z1 - z0 + 0.3, 0, BRM.plank, 'wood');
    const ns = Math.round(sh / 0.22);
    for (let k = 0; k < ns; k++) F.box(-hw - 0.6 - (ns - 1 - k) * 0.3, 0, (z0 + z1) / 2, 0.3, (k + 1) * sh / ns, 1.6, 0, BRM.rock, 'stone');
    for (const s of [-1, 1]) F.beam(s * hw, sh + 1.0, z1 + 0.1, s * 1.6, sh + 1.0, z1 + 0.1, 0.1, 0.1, BRM.red, BRM_TIMBER);
    for (const x of [-hw, -1.6, 1.6, hw]) F.box(x, sh, z1 + 0.1, 0.12, 1.0, 0.12, 0, BRM.red, BRM_TIMBER);
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) brmPost(F, p[0] * (hw - 0.6), sh, p[1] * 1.4 - 0.5, 2.6, 0.26, p[1] > 0 ? BRM.red : BRM.deep, BRM.gilt);
    brmHip(F, 0, -0.5, sh + 2.6, 2 * hw, 2.8, 4.4, BRM.shingle[1], v1 ? 0 : 0.9);
    F.furn('br_bench', -hw / 2, sh, -1.5, 0, { v: 0 });
    F.furn('br_bench', hw / 2, sh, -1.5, 0, { v: 0 });
    F.furn('br_h_crate_stack', hw - 1.6, sh, -0.4, 0, { v: 1 });
    F.furn('br_h_hanging_lantern', 0, sh + 2.6 - 2.3, 0.6, 0, { v: 1 });
    F.furn('br_h_water_butt', hw + 1.6, 0, 1.0, 0, { v: 0 });
    if (v1) { F.furn('br_h_trough', -1.5, 0, 4.6, 0, { v: 0 }); return; }
    /* the byre behind for the carrier beasts at rest: an open shed on log posts, troughs, the hay */
    const bz = -7.5, bw = 8.5, bd = 2.6;
    F.box(0, 0, bz, 2 * bw + 0.6, 0.06, 2 * bd + 0.6, 0, BRM.straw, 'straw/cloth');
    for (let i = 0; i < 4; i++) { brmPost(F, -bw + i * (2 * bw) / 3, 0, bz + bd, 4.2, 0.4, BRM.red, BRM.gilt); F.cyl(-bw + i * (2 * bw) / 3, 0, bz - bd, 0.24, 5.4, 0, BRM.timber[2], 'bark'); }
    brtShed(F, -bw - 0.7, bw + 0.7, bz - bd - 0.8, bz + bd + 0.9, 5.6, 4.2, BRM.shingle[2]);
    F.furn('br_h_trough', -4.0, 0.06, bz - bd + 0.9, 0, { v: 2 });
    F.furn('br_h_trough', 4.0, 0.06, bz - bd + 0.9, 0, { v: 1 });
    F.furn('br_h_hay_bales', 0, 0.06, bz - 0.8, 0, { v: 0 });
    F.furn('br_h_banner_pole', hw + 2.4, 0, 3.0, 0, { v: 0 });
    F.furn('br_h_hitching_rail', -hw - 4.2, 0, 4.4, 0, { v: 0 });
  }
});

/* ================================ the beetle pen */
ASSET({
  key: 'br_bldg_beetle_pen', name: 'Beetle house and run (beetle herders)', culture: 'beast-rider', job: 'herding',
  family: 'industrial', types: ['farm'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 21.5, d: 23.5, h: 7, variants: 2, variantNames: ['the beetle house and its run', 'the breeding shed and its grub beds'],
  variantDims: [{ w: 21.5, d: 23.5, h: 7 }, { w: 15, d: 16, h: 7 }],
  build: function (F) {
    brtCentre(F);
    /* the Staghorn tribe's beetles keep to the dark and the damp: a low house of stacked logs under a heavy thatch
       that comes down to the shoulder, wide doors for the horns, beds of rotting wood inside */
    const v1 = F.variant === 1, hw = v1 ? 6.0 : 8.0, z0 = -10.5, z1 = -3.0, wh = 1.9;
    const cz = v1 ? (z0 + z1) / 2 + 5.5 : (z0 + z1) / 2, Z0 = cz - (z1 - z0) / 2, Z1 = cz + (z1 - z0) / 2;
    F.box(0, 0, cz, 2 * hw + 0.8, 0.25, Z1 - Z0 + 0.8, 0, BRM.rock, 'stone');
    F.box(0, 0.25, cz, 2 * hw - 0.2, 0.08, Z1 - Z0 - 0.2, 0, BRT.mulch, 'straw/cloth');
    for (const s of [-1, 1]) for (let r = 0; r < 5; r++) F.rod(s * hw, 0.4 + r * 0.38, Z0, s * hw, 0.4 + r * 0.38, Z1, 0.2, BRM.timber[(r + (s > 0 ? 1 : 0)) % 4], 'bark');
    for (let r = 0; r < 5; r++) F.rod(-hw, 0.4 + r * 0.38, Z0, hw, 0.4 + r * 0.38, Z0, 0.2, BRM.timber[r % 4], 'bark');
    const gaps = v1 ? [-2.0] : [-4.0, 4.0];
    let xs = -hw;
    gaps.forEach(function (g) { for (let r = 0; r < 5; r++) F.rod(xs, 0.4 + r * 0.38, Z1, g - 1.7, 0.4 + r * 0.38, Z1, 0.2, BRM.timber[(r + 2) % 4], 'bark'); xs = g + 1.7; });
    for (let r = 0; r < 5; r++) F.rod(xs, 0.4 + r * 0.38, Z1, hw, 0.4 + r * 0.38, Z1, 0.2, BRM.timber[(r + 2) % 4], 'bark');
    gaps.forEach(function (g) { for (const e of [-1, 1]) brmPost(F, g + e * 1.75, 0.25, Z1, wh + 0.6, 0.3, BRM.red, BRM.gilt); F.beam(g - 1.9, wh + 0.75, Z1, g + 1.9, wh + 0.75, Z1, 0.26, 0.3, BRM.red, BRM_TIMBER); });
    brtThatch(F, 0, cz, wh + 0.8, 2 * hw + 2.4, 3.8, Z1 - Z0 + 2.4, shade(BRM.thatch[1], -0.2));
    if (!v1) for (let i = 0; i < 3; i++) F.rod(-hw + 2.0 + i * 4.8, 0.45, Z0 + 1.6, -hw + 4.6 + i * 4.8, 0.45, Z0 + 2.2, 0.32, BRT.mulch, 'bark');
    F.furn('br_h_straw_bedding', v1 ? 2.6 : 3.0, 0.3, Z0 + 3.0, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_feed_basket', -3.0, wh - 1.4, cz + 1.0, 0, { v: 0, setting: 'indoor' });
    if (v1) {
      /* the breeding shed's grub beds inside (boxes of mulch where the larvae grow), the keeper's hut before it */
      for (let i = 0; i < 4; i++) { const x = -4.3 + (i % 2) * 2.5, z = Z0 + 1.6 + Math.floor(i / 2) * 2.3; F.box(x, 0.33, z, 2.0, 0.6, 1.6, 0, BRM.timber[3], BRM_TIMBER); F.box(x, 0.93, z, 1.8, 0.1, 1.4, 0, BRT.mulch, 'straw/cloth'); }
      const kx0 = 1.5, kx1 = 6.5, kz0 = Z1 + 2.0, kz1 = Z1 + 6.0, y0 = 0.35;
      brtBase(F, kx0, kx1, kz0, kz1, y0);
      brtWalls(F, kx0, kx1, kz0, kz1, y0, 2.3, BRM.stave[1], [{ side: 'l', at: 0, w: 1.1 }]);
      brtWin(F, 'f', kx0, kx1, kz0, kz1, 0, y0 + 1.5, 0.8, 0.6);
      brmHip(F, (kx0 + kx1) / 2, (kz0 + kz1) / 2, y0 + 2.3, kx1 - kx0 + 1.2, 2.6, kz1 - kz0 + 1.2, BRM.shingle[0], 0.6);
      F.furn('generic_poor_straw_bed', kx1 - 0.8, y0, kz0 + 1.2, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_fire_pit', (kx0 + kx1) / 2 - 0.6, y0, (kz0 + kz1) / 2, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_water_butt', -4.0, 0, Z1 + 2.0, 0, { v: 0 });
      return;
    }
    /* the run before it: a fence of heavy rails, stumps to climb and gnaw, a mud wallow, the fruit troughs */
    const rz0 = -2.4, rz1 = 11.0, rw = 10.5;
    F.box(0, 0, (rz0 + rz1) / 2, 2 * rw, 0.04, rz1 - rz0, 0, BRM.mud, 'yard/stone');
    brmFence(F, -rw, rz0, -rw, rz1, 1.6); brmFence(F, rw, rz0, rw, rz1, 1.6);
    brmFence(F, -rw, rz1, -2.4, rz1, 1.6); brmFence(F, 2.4, rz1, rw, rz1, 1.6);
    for (const s of [-1, 1]) brmPost(F, s * 2.4, 0, rz1, 2.8, 0.3, BRM.red, BRM.gilt);
    for (const p of [[-6, 3, 0.7, 1.4], [-3.5, 7.5, 0.5, 0.9], [6.5, 6.0, 0.8, 1.7], [2.5, 2.8, 0.55, 1.1]]) F.cyl(p[0], 0.04, p[1], p[2], p[3], 0, BRM.timber[3], 'bark');
    F.box(5.0, 0.0, 1.4, 4.0, 0.08, 2.6, 0, shade(BRM.mud, -0.3), 'cloth');
    F.furn('br_h_trough', -6.5, 0.04, 8.6, 0, { v: 1 });
    F.furn('br_fruit_stack', -1.5, 0.04, 9.4, 0, { v: 0 });
    F.furn('br_h_water_butt', 8.8, 0.04, 9.6, 0, { v: 0 });
  }
});

/* ================================ the fungus house */
ASSET({
  key: 'br_bldg_fungus_house', name: 'Fungus house (mushroom growers)', culture: 'beast-rider', job: 'fungiculture',
  family: 'industrial', types: ['farm', 'industry'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 13, d: 12.5, h: 7.5, variants: 2, variantNames: ['the dark fungus house', 'the fungus cellar'],
  variantDims: [{ w: 13, d: 11, h: 7.5 }, { w: 12, d: 12.5, h: 6 }],
  build: function (F) {
    brtCentre(F);
    /* the caps want the dark: a house with no window, a heavy door, log racks inside with the caps on them, the glow
       fungus that lights the riders' lamps grown among them */
    const v1 = F.variant === 1, y0 = v1 ? -1.6 : 0.4, x0 = -5, x1 = 5, z0 = -3.5, z1 = 2.5, wh = v1 ? 3.2 : 2.6;
    function racks(x, z) {
      for (const dx of [-1.6, 1.6]) for (const dz of [-0.4, 0.4]) F.box(x + dx, y0, z + dz, 0.14, 2.1, 0.14, 0, BRM.timber[2], BRM_TIMBER);
      for (let t = 0; t < 3; t++) {
        const y = y0 + 0.5 + t * 0.65;
        for (const dz of [-0.2, 0.2]) F.rod(x - 1.6, y, z + dz, x + 1.6, y, z + dz, 0.13, BRM.timber[(t + 1) % 4], 'bark');
        for (let k = 0; k < 5; k++) {
          const cx = x - 1.3 + k * 0.65, glow = (k + t) % 3 === 0;
          F.dome(cx, y + 0.1, z + ((k % 2) ? 0.22 : -0.22), glow ? 0.11 : 0.14, 0.08, 0, glow ? BRT_GLOW.fungus : BRT.cap, glow ? 'glow' : 'fungus');
        }
      }
    }
    if (v1) {
      /* the cellar: half sunk, its earth banked over the walls, a low shingle roof standing out of the bank, a stone
         portal and stair down at the front, the vents */
      F.box(0, y0 - 0.06, (z0 + z1) / 2, x1 - x0, 0.06, z1 - z0, 0, BRT.mulch, 'stone');
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.rock, [{ side: 'f', at: 0, w: 1.2, h: 2.1 }], { fam: 'stone', t: 0.4 });
      F.box(0, 0, (z0 + z1) / 2, x1 - x0 + 1.6, 1.3, z1 - z0 + 1.6, 0, BRT.soil, 'yard/stone');
      for (let k = 0; k < 7; k++) F.box(0, -1.6, z1 + 0.5 + k * 0.55, 1.6, (k + 1) * 0.23, 0.55, 0, BRM.rock, 'stone');
      F.box(0, 1.3, z1 + 0.85, 2.8, 0.35, 0.5, 0, BRM.rock, 'stone');
      for (const s of [-1, 1]) F.box(s * 1.05, -1.6, z1 + 2.4, 0.5, 2.9, 4.4, 0, BRM.rock, 'stone');
      brmHip(F, 0, (z0 + z1) / 2, 1.3, x1 - x0 + 1.0, 2.4, z1 - z0 + 1.0, BRM.shingle[3], 0);
      for (const x of [-2.5, 2.5]) { F.cyl(x, 2.9, (z0 + z1) / 2, 0.22, 0.8, 0, BRT.clayD, 'clay'); }
      racks(-2.2, -2.4); racks(2.2, -2.4); racks(2.2, 0.2);
      F.furn('br_h_sack_pile', -3.6, y0, 0.9, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_work_counter', -2.2, y0, 0.3, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_water_butt', -3.4, 0, z1 + 2.8, 0, { v: 0 });
      F.furn('br_h_crate_stack', 3.6, 0, z1 + 3.4, Math.PI / 2, { v: 0 });
      return;
    }
    brtBase(F, x0, x1, z0, z1, y0, { floor: BRT.mulch, floorFam: 'straw/cloth' });
    brtWalls(F, x0, x1, z0, z1, y0, wh, shade(BRM.stave[1], -0.15), [{ side: 'f', at: -2.6, w: 1.2, h: 2.0 }], { leaf: BRM.deep });
    brtStruts(F, x0, x1, z0, z1, y0 + wh, true, 2);
    brtThatch(F, 0, (z0 + z1) / 2, y0 + wh, x1 - x0 + 2.0, 4.2, z1 - z0 + 2.0, shade(BRM.thatch[1], -0.35));
    racks(-1.4, -2.3); racks(2.6, -2.3); racks(2.6, 0.8);
    F.furn('br_h_work_counter', -2.6, y0, 0.0, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_sack_pile', -3.8, y0, -2.5, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_lamp_bracket', -0.6, y0, z1 - 0.3, Math.PI, { v: 0, setting: 'indoor' });
    /* the logs waiting to be seeded, the mulch heap, the water */
    for (let i = 0; i < 4; i++) F.rod(-4.5, 0.2 + (i > 2 ? 0.36 : 0), 4.3 + (i % 3) * 0.42 - (i > 2 ? 0.4 : 0), -0.5, 0.2 + (i > 2 ? 0.36 : 0), 4.3 + (i % 3) * 0.42 - (i > 2 ? 0.4 : 0), 0.2, BRM.timber[i % 4], 'bark');
    F.cone(3.2, 0, 4.4, 1.6, 1.0, 0, BRT.mulch, 'straw/cloth');
    F.furn('br_h_water_butt', 5.9, 0, 0.4, Math.PI / 2, { v: 0 });
  }
});

/* ================================ the mine head */
ASSET({
  key: 'br_bldg_mine_head', name: 'Mine head (miners)', culture: 'beast-rider', job: 'mining',
  family: 'industrial', types: ['industry'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 18.5, d: 17.5, h: 10.5, variants: 2, variantNames: ['the adit in its rock face', 'the shaft and its beast whim'],
  variantDims: [{ w: 17.5, d: 16.5, h: 10 }, { w: 18.5, d: 17.5, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 0) {
      /* the adit: cut into a face of rock (the rock drawn as the face it needs), framed in squared timber, a shingle
         lean-to over the mouth, the spoil heap, the ore sorted on the bench, a sledge for the ore */
      const rz = -5.0;
      F.box(0, 0, rz - 2.5, 17, 6.2, 5.0, 0, BRT.sand, 'stone');
      F.box(-5.0, 0, rz - 1.6, 6.5, 4.0, 3.4, 0.06, BRT.sandL, 'stone');
      F.box(5.8, 0, rz - 1.9, 5.0, 5.0, 3.6, -0.08, BRT.sandD, 'stone');
      F.box(-1.0, 6.2, rz - 3.0, 14, 1.8, 4.0, 0.04, BRT.sandD, 'stone');
      F.box(-4.0, 8.0, rz - 3.4, 7, 1.4, 3.2, -0.05, BRT.sandL, 'stone');
      F.box(4.5, 8.0, rz - 3.2, 4.5, 0.9, 3.4, 0.07, BRT.sand, 'stone');
      F.box(0, 0, rz + 0.01, 2.6, 2.6, 0.05, 0, BRT.charcoal, 'stone');
      for (let k = 0; k < 3; k++) {
        const z = rz + 0.3 - k * 0.7, s = 1 - k * 0.06;
        for (const e of [-1, 1]) F.box(e * 1.45 * s, 0, z, 0.32, 2.8 * s, 0.32, 0, BRM.timber[2], BRM_TIMBER);
        F.box(0, 2.8 * s, z, 3.3 * s, 0.34, 0.36, 0, BRM.timber[2], BRM_TIMBER);
      }
      for (const e of [-1, 1]) brmPost(F, e * 2.4, 0, rz + 3.0, 3.2, 0.3, BRM.red, BRM.gilt);
      brtShed(F, -3.2, 3.2, rz + 0.2, rz + 3.8, 4.4, 3.2, BRM.shingle[1]);
      F.cone(-5.5, 0, rz + 7.5, 3.2, 2.4, 0, BRT.ore, 'stone');
      brtSledge(F, 3.2, rz + 6.0, 3.6, false);
      F.box(3.2, 0.55, rz + 6.0, 2.0, 0.5, 1.2, 0, BRT.ore, 'stone');
      F.furn('br_table', 5.5, 0, rz + 9.5, 0, { v: 1 });
      F.furn('br_h_tool_wall', -4.0, 0, rz + 0.5, 0, { v: 0 });
      F.furn('br_h_sack_pile', 2.0, 0, rz + 9.6, 0, { v: 0 });
      F.furn('br_h_post_brazier', 1.8, 0, rz + 3.4, 0, { v: 0 });
      F.furn('br_h_water_butt', -7.2, 0, rz + 2.0, 0, { v: 0 });
      return;
    }
    /* the shaft: a log headframe with its sheave over the timbered collar, the whim the beast walks to wind the ore up,
       its rope to the sheave, the ore heap, the miners' hut */
    const sx = 4.5, sz = -2.0, top = 8.5;
    F.box(sx, 0, sz, 3.4, 0.7, 3.4, 0, BRM.timber[2], BRM_TIMBER);
    F.box(sx, 0.69, sz, 2.4, 0.02, 2.4, 0, BRT.charcoal, 'stone');
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) F.rod(sx + p[0] * 2.2, 0, sz + p[1] * 2.2, sx + p[0] * 0.5, top, sz + p[1] * 0.5, 0.17, BRM.timber[2], 'bark');
    for (const y of [3.0, 6.0]) { const r = 2.2 - 1.7 * y / top; F.box(sx, y, sz - r, 2 * r, 0.16, 0.16, 0, BRM.timber[0], BRM_TIMBER); F.box(sx, y, sz + r, 2 * r, 0.16, 0.16, 0, BRM.timber[0], BRM_TIMBER); }
    F.box(sx, top, sz, 1.4, 0.3, 1.4, 0, BRM.timber[2], BRM_TIMBER);
    F.ell(sx, top + 0.85, sz, 0.08, 0.8, 0.8, 0, BRM.timber[1], BRM_TIMBER);
    F.rod(sx, top + 0.85, sz + 0.8, sx, 1.4, sz + 0.8, 0.03, BRM.rope, 'rope');
    F.box(sx, 0.9, sz + 0.8, 0.9, 0.7, 0.9, 0, BRM.timber[3], BRM_TIMBER);
    brtWhim(F, -4.0, -3.5, 3.6, { a: 1.9 });
    F.rod(-4.0, 3.0, -3.5, sx, top + 0.85, sz - 0.8, 0.03, BRM.rope, 'rope');
    F.cone(5.5, 0, 5.5, 2.6, 2.0, 0, BRT.ore, 'stone');
    /* the miners' hut */
    const hx0 = -9.5, hx1 = -4.5, hz0 = 3.5, hz1 = 8.0, y0 = 0.35;
    brtBase(F, hx0, hx1, hz0, hz1, y0);
    brtWalls(F, hx0, hx1, hz0, hz1, y0, 2.3, BRM.stave[0], [{ side: 'r', at: 0, w: 1.1 }]);
    brmHip(F, (hx0 + hx1) / 2, (hz0 + hz1) / 2, y0 + 2.3, hx1 - hx0 + 1.2, 2.8, hz1 - hz0 + 1.2, BRM.shingle[0], 0.6);
    F.furn('generic_poor_straw_bed', hx0 + 0.8, y0, hz0 + 1.3, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_fire_pit', (hx0 + hx1) / 2 + 0.6, y0, (hz0 + hz1) / 2 + 0.4, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_tool_wall', (hx0 + hx1) / 2, y0, hz1 - 0.3, Math.PI, { v: 0, setting: 'indoor' });
    F.furn('br_h_sack_pile', 1.2, 0, 4.0, 0, { v: 1 });
    F.furn('br_h_trough', -4.0, 0, 2.8, 0, { v: 0 });
  }
});

/* ================================ the quarry */
ASSET({
  key: 'br_bldg_quarry', name: 'Quarry and masons\' yard (quarrymen and masons)', culture: 'beast-rider', job: 'masonry',
  family: 'industrial', types: ['industry'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 20.5, d: 18.5, h: 9.5, variants: 2, variantNames: ['the quarry face', 'the masons\' yard'],
  variantDims: [{ w: 20.5, d: 18.5, h: 9.5 }, { w: 17.5, d: 14.5, h: 9 }],
  build: function (F) {
    brtCentre(F);
    const cols = [BRT.sand, BRT.sandL, BRT.sandD];
    if (F.variant === 0) {
      /* the face: benches of red sandstone stepping back and up, the cut blocks waiting on the floor, the shear legs
         lifting one onto the sledge, the masons' lean-to */
      for (let b = 0; b < 4; b++) F.box(-1.0 + b * 0.5, 0, -8.0 + b * 1.8, 18 - b * 3.0, 9.0 - b * 2.3, 1.8, 0, cols[(b + 1) % 3], 'stone');
      for (let i = 0; i < 5; i++) F.box(-7.0 + i * 1.7, 0, 2.5 + (i % 2) * 0.3, 1.4, 0.8, 1.0, 0.1 * (i - 2), cols[i % 3], 'stone');
      for (let i = 0; i < 3; i++) F.box(-6.2 + i * 1.7, 0.8, 2.6, 1.4, 0.8, 1.0, 0, cols[(i + 1) % 3], 'stone');
      brtShear(F, 3.5, 0.5, 6.4, 1.8, 0, 2.4);
      F.box(3.5, 1.2, 1.7, 1.2, 0.8, 0.9, 0, BRT.sandL, 'stone');
      brtSledge(F, 6.5, 5.0, 4.0, false);
      const lx0 = -10, lx1 = -5;
      for (const x of [lx0 + 0.2, lx1 - 0.2]) { brmPost(F, x, 0, 8.6, 2.6, 0.26, BRM.red, BRM.gilt); F.cyl(x, 0, 5.4, 0.18, 3.6, 0, BRM.timber[2], 'bark'); }
      brtShed(F, lx0 - 0.4, lx1 + 0.4, 5.0, 9.2, 3.8, 2.6, BRM.shingle[2]);
      F.furn('br_table', -7.5, 0, 7.0, 0, { v: 1 });
      F.furn('br_h_tool_wall', -7.5, 0, 5.5, 0, { v: 0 });
      F.furn('br_h_water_butt', 9.0, 0, 8.6, 0, { v: 0 });
      F.furn('br_h_rope_coils', 0.5, 0, 6.5, 0, { v: 1 });
      return;
    }
    /* the masons' yard: an open shed on carved posts, the bankers where the stone is dressed, a beast-head finial
       half cut on its block, the blocks stacked, the crane */
    const hw = 6.0, z0 = -5.5, z1 = 0.5;
    F.box(0, 0, 0, 17, 0.04, 14, 0, BRM.mud, 'yard/stone');
    F.box(0, 0.04, (z0 + z1) / 2, 2 * hw + 0.6, 0.2, z1 - z0 + 0.6, 0, BRM.rock, 'stone');
    for (let i = 0; i < 4; i++) for (const z of [z0 + 0.2, z1 - 0.2]) brmPost(F, -hw + i * (2 * hw) / 3, 0.24, z, 3.0, 0.3, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    for (const z of [z0 + 0.2, z1 - 0.2]) F.beam(-hw, 3.2, z, hw, 3.2, z, 0.28, 0.32, BRM.red, BRM_TIMBER);
    brmHip(F, 0, (z0 + z1) / 2, 3.3, 2 * hw + 1.8, 3.8, z1 - z0 + 2.0, BRM.shingle[1], 1.0);
    F.furn('br_table', -3.0, 0.24, -2.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_table', 3.0, 0.24, -2.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_tool_wall', 0, 0.24, z0 + 0.45, 0, { v: 0, setting: 'indoor' });
    F.box(3.0, 1.34, -2.6, 0.9, 0.7, 0.9, 0, BRT.sandL, 'stone');
    brmFinial(F, 2.8, 2.0, -2.6, 1, 0, 0.55, BRT.sandL);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) F.box(-6.5 + i * 1.6, 0.04 + j * 0.8, 4.0, 1.4, 0.78, 1.0, 0, cols[(i + j) % 3], 'stone');
    brtShear(F, 4.5, 4.0, 5.6, 1.6, 0.4, 2.0);
    F.furn('br_h_water_butt', -7.4, 0.04, -0.4, 0, { v: 0 });
    F.furn('br_h_sack_pile', 6.8, 0.04, 1.6, 0, { v: 0 });
  }
});

/* ================================ the canoe shed */
/* a hull along x: a long ellipsoid, its gunwale strake, a carved prow post with the beast head at +x */
function brtHull(F, x, y, z, L, B, Hh, prow) {
  F.ell(x, y, z, L / 2, Hh, B / 2, 0, BRM.timber[3], BRM_TIMBER);
  F.beam(x - L * 0.42, y + Hh * 0.55, z, x + L * 0.42, y + Hh * 0.55, z, 0.14, B * 0.92, BRM.red, BRM_TIMBER);
  if (prow) { F.beam(x + L * 0.46, y, z, x + L * 0.52, y + Hh + 1.0, z, 0.2, 0.2, BRM.timber[2], BRM_TIMBER); brmFinial(F, x + L * 0.52, y + Hh + 1.0, z, 1, 0, prow, BRM.deep); }
}
ASSET({
  key: 'br_bldg_canoe_shed', name: 'Canoe shed (shipwrights, coast guard)', culture: 'beast-rider', job: 'carpentry',
  family: 'industrial', types: ['industry', 'infrastructure'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 24.5, d: 12, h: 11.5, variants: 2, variantNames: ['the voyaging canoe\'s shed', 'the war-canoe shed'],
  variantDims: [{ w: 24.5, d: 12, h: 11.5 }, { w: 24.5, d: 10.5, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, hw = 11, hd = v1 ? 3.8 : 4.6, ph = 3.6;
    /* a long shed on carved posts, open at the ends for the hull to come and go, a steep shingle hip */
    F.box(0, 0, 0, 2 * hw + 1.4, 0.15, 2 * hd + 1.4, 0, shade(BRM.rock, -0.08), 'stone');
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) brmPost(F, -hw + i * (2 * hw) / 5, 0.15, s * hd, ph, 0.34, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    for (const s of [-1, 1]) F.beam(-hw, 0.15 + ph, s * hd, hw, 0.15 + ph, s * hd, 0.3, 0.34, BRM.red, BRM_TIMBER);
    F.box(0, 0.15, -hd, 2 * hw, 1.8, 0.16, 0, BRM.stave[0], BRM_STAVE);
    brmHip(F, 0, 0, 0.15 + ph + 0.1, 2 * hw + 2.0, v1 ? 4.8 : 5.6, 2 * hd + 2.2, BRM.shingle[1], 1.2);
    for (const x of [-6.5, -1.5, 3.5, 8.0]) F.box(x, 0.15, 0, 0.5, 0.7, v1 ? 1.6 : 6.4, 0, BRM.timber[2], BRM_TIMBER);
    if (!v1) {
      /* the voyaging canoe (LORE 6.6): two hulls, the deck between them, the mast with the flyer's perch at its head */
      for (const z of [-2.3, 2.3]) brtHull(F, 1.0, 1.55, z, 17, 1.5, 0.75, z > 0 ? 0.7 : 0);
      for (const x of [-4.5, -0.5, 3.5, 7.0]) F.beam(x, 2.2, -2.9, x, 2.2, 2.9, 0.2, 0.22, BRM.timber[2], BRM_TIMBER);
      F.box(1.2, 2.3, 0, 6.0, 0.12, 3.6, 0, BRM.plank, 'wood');
      F.box(0.6, 2.42, 0, 2.4, 1.2, 2.2, 0, BRM.wall, 'reed');
      F.pyrRoof(0.6, 3.62, 0, 2.8, 0.8, 2.6, 0, BRM.thatch[0], 'thatch');
      F.rod(3.6, 2.4, 0, 3.6, 7.0, 0, 0.12, BRM.timber[1], BRM_TIMBER);
      F.beam(3.6, 6.7, -1.4, 3.6, 6.7, 1.4, 0.16, 0.16, BRM.timber[2], 'guano/wood');
      F.furn('br_table', -6.5, 0.15, -3.2, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_plank_stack', 7.0, 0.15, -3.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_rope_coils', -9.5, 0.15, 3.0, 0, { v: 0 });
      F.furn('br_tool_set', -6.5, 0.15 + 1.1, -3.2, 0, { v: 0 });
      F.furn('br_h_tool_wall', 1.0, 0.15, -hd + 0.3, 0, { v: 0, setting: 'indoor' });
      return;
    }
    /* the war canoe: one long hull, its high carved prow, the paddles racked, the shields and lances, the watch perch */
    brtHull(F, 0, 1.2, 0, 19, 1.3, 0.65, 0.9);
    F.furn('br_weapon_rack', -5.0, 0.15, -hd + 0.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_shield_rack', 2.5, 0.15, -hd + 0.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_arrow_barrel', 7.0, 0.15, -hd + 0.7, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_banner_pole', -hw - 0.6, 0, hd + 1.2, 0, { v: 1 });
    F.furn('br_h_rope_coils', 8.5, 0.15, 2.4, 0, { v: 1 });
  }
});

/* ================================ the river landing */
ASSET({
  key: 'br_bldg_river_landing', name: 'River landing (dockers, bargemen, fishers, ferrymen)', culture: 'beast-rider', role: 'landing',
  family: 'infrastructure', types: ['infrastructure'], districts: ['ridertown'], wealth: [0.1, 0.6],
  w: 23.5, d: 28, h: 9.5, variants: 3, variantNames: ['the cargo landing and its beast crane', 'the fishers\' landing', 'the ferry landing'],
  variantDims: [{ w: 23.5, d: 28, h: 9.5 }, { w: 17.5, d: 24.5, h: 7.5 }, { w: 18, d: 24.5, h: 8 }],
  build: function (F) {
    brtCentre(F);
    /* the islanders' frame for the water's edge (kits/islanders API.md, HARBOUR): the land at local z > 0, the jetty
       out over the water at z < 0; the water drawn to show it */
    const v = F.variant, L = v === 0 ? 12 : 9, jw = v === 0 ? 4.4 : 2.4;
    F.box(0, -0.38, -L / 2 - 1.5, v === 0 ? 23 : 17, 0.4, L + 3.0, 0, BRT.water, 'glass');
    F.box(0, 0, 6.0, v === 0 ? 23 : 17, 0.04, 12.0, 0, BRM.mud, 'yard/stone');
    for (let i = 0; i <= Math.round(L / 2); i++) for (const s of [-1, 1]) F.cyl(s * (jw / 2 - 0.2), -0.6, -i * 2.0, 0.17, 1.4, 0, BRM.timber[2], 'bark');
    F.box(0, 0.6, -L / 2 + 0.2, jw, 0.18, L + 0.6, 0, BRM.plank, 'wood');
    for (const s of [-1, 1]) F.box(s * (jw / 2 + 0.1), 0.45, -L / 2 + 0.2, 0.22, 0.3, L + 0.6, 0, BRM.timber[2], BRM_TIMBER);
    if (v === 0) {
      /* the cargo landing: the crane at the jetty head, its rope led back to the whim on the bank; a barge alongside;
         the cargo shed */
      brmPost(F, 0, 0.78, -L + 1.0, 5.4, 0.4, BRM.red, BRM.gilt);
      F.beam(0, 5.6, -L + 1.0, 0, 7.6, -L - 3.0, 0.24, 0.24, BRM.timber[2], BRM_TIMBER);
      F.beam(0, 1.2, -L + 1.0, 0, 7.5, -L - 2.8, 0.14, 0.14, BRM.timber[2], BRM_TIMBER);
      F.rod(0, 7.5, -L - 2.9, 0, 1.4, -L - 2.9, 0.03, BRM.rope, 'rope');
      F.box(0, 0.9, -L - 2.9, 1.2, 0.6, 1.0, 0, BRM.timber[3], BRM_TIMBER);
      brtWhim(F, 6.5, 7.5, 3.4, { a: 2.6 });
      F.rod(6.5, 2.9, 7.5, 0, 5.6, -L + 1.0, 0.03, BRM.rope, 'rope');
      F.box(5.0, -0.2, -6.0, 3.0, 0.8, 9.0, 0, BRM.timber[3], BRM_TIMBER);
      F.box(5.0, 0.6, -6.0, 2.6, 0.06, 8.6, 0, BRM.plank, 'wood');
      F.furn('br_h_crate_stack', 5.0, 0.66, -4.5, Math.PI / 2, { v: 1 });
      F.furn('br_h_barrel_cluster', 0, 0.78, -4.0, 0, { v: 1 });
      F.furn('br_h_sack_pile', -0.8, 0.78, -7.0, 0, { v: 0 });
      const x0 = -10.5, x1 = -3.0, z0 = 3.5, z1 = 9.5, y0 = 0.4;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, 2.8, BRM.stave[1], [{ side: 'r', at: -0.8, w: 2.2, h: 2.4 }]);
      brtWin(F, 'b', x0, x1, z0, z1, -2.0, y0 + 1.8, 0.9, 0.6);
      brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + 2.8, x1 - x0 + 1.6, 4.2, z1 - z0 + 1.6, BRM.shingle[1], 0.9);
      F.furn('br_storehouse_goods', -7.8, y0, 7.2, Math.PI, { v: 0, setting: 'indoor' });
      F.furn('br_h_crate_stack', -8.0, y0, 4.8, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_hitching_rail', 1.5, 0, 10.0, 0, { v: 0 });
      return;
    }
    if (v === 1) {
      /* the fishers' landing: the dugouts tied up, the fish racks, the fishers' hut with its smoke hood */
      for (const z of [-3.0, -7.0]) brtHull(F, 3.4, 0.0, z, 6.5, 0.9, 0.4, 0);
      brtHull(F, -3.4, 0.0, -5.0, 6.0, 0.9, 0.4, 0);
      F.furn('br_drying_rack', 3.5, 0, 3.5, 0, { v: 0 });
      F.furn('br_drying_rack', 6.5, 0, 3.5, 0, { v: 0 });
      F.furn('br_h_rope_coils', 0, 0.78, -6.5, 0, { v: 1 });
      const x0 = -7.5, x1 = -2.5, z0 = 3.0, z1 = 7.5, y0 = 0.35;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, 2.3, BRM.stave[0], [{ side: 'b', at: 0.8, w: 1.1 }]);
      brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + 2.3, x1 - x0 + 1.2, 3.0, z1 - z0 + 1.2, BRM.shingle[0], 0.6);
      brtSmoke(F, (x0 + x1) / 2, y0 + 2.3 + 3.0, (z0 + z1) / 2, false);
      F.furn('br_h_fire_pit', -5.0, y0, 5.2, 0, { v: 1, setting: 'indoor' });
      F.furn('generic_poor_straw_bed', -6.7, y0, 5.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_barrel_cluster', -1.2, 0, 8.2, 0, { v: 0 });
      return;
    }
    /* the ferry: a log raft hauled along a rope from the tall post on the bank, the ferryman's hut and its bell */
    const fx = 3.6;
    brmPost(F, fx, 0, 1.0, 7.0, 0.36, BRM.red, BRM.gilt);
    F.rod(fx, 6.6, 1.0, fx, 1.8, -12.0, 0.04, BRM.rope, 'rope');
    for (let i = 0; i < 9; i++) F.rod(fx - 1.8 + i * 0.45, 0.0, -9.6, fx - 1.8 + i * 0.45, 0.0, -5.4, 0.22, BRM.timber[i % 4], 'bark');
    F.box(fx, 0.18, -7.5, 4.0, 0.08, 4.4, 0, BRM.plank, 'wood');
    F.rod(fx, 0.26, -7.5, fx, 2.0, -7.5, 0.06, BRM.timber[2], BRM_TIMBER);
    F.box(fx, 0.26, -9.5, 3.6, 0.9, 0.08, 0, BRM.red, BRM_TIMBER);
    const x0 = -7.5, x1 = -2.5, z0 = 3.0, z1 = 7.0, y0 = 0.35;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, 2.3, BRM.stave[1], [{ side: 'r', at: 0, w: 1.1 }]);
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + 2.3, x1 - x0 + 1.2, 3.0, z1 - z0 + 1.2, BRM.shingle[3], 0.7);
    F.furn('generic_poor_straw_bed', -6.7, y0, 4.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_fire_pit', -4.6, y0, 5.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_bench', -1.0, 0, 4.0, Math.PI / 2, { v: 0 });
    F.furn('br_h_signal_mast', -1.2, 0, 1.8, 0, { v: 0 });
    F.furn('br_h_water_butt', -8.6, 0, 8.4, 0, { v: 0 });
  }
});

BRT_ROWS.push({ title: 'Trades: works, stock and the water (this kit)', keys: ['br_bldg_storehouse', 'br_bldg_granary', 'br_bldg_mill', 'br_bldg_hauling_yard',
  'br_bldg_beast_stage', 'br_bldg_beetle_pen', 'br_bldg_fungus_house', 'br_bldg_mine_head', 'br_bldg_quarry', 'br_bldg_canoe_shed', 'br_bldg_river_landing'] });
