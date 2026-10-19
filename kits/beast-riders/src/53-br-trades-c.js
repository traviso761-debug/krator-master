// prefix: brt
/* ======================================================================
   The Beast Riders kit: the sedentary trades, part 3 of 3: the inn, the Wings' barracks, the school, the temple,
   the toll house, the watch and the beacons. Helpers and the census table: src/51-br-trades.js; the vocabulary: the
   mounts' (src/50-br-mounts.js). The signals are fire and oil (the catalog's signal brazier and lantern mast).

     br_bldg_riders_inn    innkeepers and grooms (envoys' trains): the inn round its stable yard; the roadside inn
     br_bldg_barracks      soldiers: a Wing's barracks with its drill yard; the roost barracks with the flyers' perches
     br_bldg_school        teachers and scholars: the lore house; the riding school's ring
     br_bldg_temple        priests, shrine keepers, undertakers, monks: the hall of the five shrines; the funerary court
     br_bldg_toll_house    customs officers: the toll house and its boom; the tally hall
     br_bldg_watch_tower   town guard: the watch tower; the guard house and its lookout
     br_bldg_beacon_tower  lighthouse keepers: the fire beacon; the signal mast station
   ====================================================================== */

/* the claw (LORE 6.6: the riders' sign, three talon slashes, green) on a red board, facing +z at (x, y, z) */
function brtClaw(F, x, y, z, s) {
  F.box(x, y, z, 1.6 * s, 1.4 * s, 0.08, 0, BRM.deep, BRM_TIMBER);
  F.box(x, y - 0.08, z - 0.02, 1.8 * s, 0.1, 0.12, 0, BRM.gilt, BRM_TIMBER);
  for (let i = -1; i <= 1; i++) F.beam(x + i * 0.42 * s - 0.25 * s, y + 0.22 * s, z + 0.06, x + i * 0.42 * s + 0.25 * s, y + 1.18 * s, z + 0.06, 0.14 * s, 0.05, BRT.green, 'cloth');
}
/* a stair of n treads up the +x end or -x end of a raised floor: from ground at (x0, z) to height y at x1 */
function brtStair(F, x0, x1, z, y, w) {
  const n = Math.max(3, Math.round(y / 0.22));
  for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; F.box(x0 + (x1 - x0) * t, (k + 1) * y / n - 0.12, z, Math.abs(x1 - x0) / n + 0.05, 0.12, w, 0, BRM.plank, 'wood'); }
  for (const e of [-1, 1]) F.beam(x0, 0, z + e * w / 2, x1, y, z + e * w / 2, 0.08, 0.2, BRM.timber[2], BRM_TIMBER);
}
/* a gallery on brackets along the +z face of a storey at floor height y: x0..x1, out `out` m, a red rail */
function brtGallery(F, x0, x1, z, y, out, n) {
  F.box((x0 + x1) / 2, y - 0.12, z + out / 2, x1 - x0, 0.12, out, 0, BRM.plank, 'wood');
  for (let i = 0; i <= n; i++) { const x = x0 + i * (x1 - x0) / n; F.beam(x, y - 1.1, z + 0.05, x, y - 0.15, z + out - 0.1, 0.15, 0.15, BRM.timber[2], BRM_TIMBER); F.box(x, y, z + out - 0.05, 0.08, 1.0, 0.08, 0, BRM.red, BRM_TIMBER); }
  F.beam(x0, y + 1.0, z + out - 0.05, x1, y + 1.0, z + out - 0.05, 0.12, 0.12, BRM.red, BRM_TIMBER);
  F.beam(x0, y + 0.5, z + out - 0.05, x1, y + 0.5, z + out - 0.05, 0.06, 0.06, BRM.verd, BRM_TIMBER);
}

/* ================================ the riders' inn */
ASSET({
  key: 'br_bldg_riders_inn', name: 'Riders\' inn (innkeepers and grooms)', culture: 'beast-rider', role: 'inn',
  family: 'trade', types: ['inn', 'tavern'], districts: ['ridertown'], wealth: [0.3, 0.8],
  w: 20.5, d: 21.5, h: 14, variants: 2, variantNames: ['the inn round its stable yard', 'the roadside inn'],
  variantDims: [{ w: 20.5, d: 21.5, h: 14 }, { w: 19, d: 10.5, h: 9.5 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4;
    if (F.variant === 1) {
      /* the roadside inn: one hall (the common room and the beds behind a screen), a stable lean-to on its end */
      const x0 = -8, x1 = 3, z0 = -3.5, z1 = 3.0, wh = 2.7;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 1.5, w: 1.5 }]);
      for (const a of [-3.5, -1.0, 3.8]) brtWin(F, 'f', x0, x1, z0, z1, a, y0 + 1.7, 0.9, 0.7);
      brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.7, 0.9, 0.7);
      brtStruts(F, x0, x1, z0, z1, y0 + wh, true, 3);
      brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.8, 4.6, z1 - z0 + 1.8, BRM.shingle[1], 1.1);
      brtSmoke(F, (x0 + x1) / 2, y0 + wh + 4.6, (z0 + z1) / 2, true);
      F.box(-4.6, y0, -1.2, 0.12, 2.0, 4.4, 0, BRM.wall, 'reed');
      F.furn('generic_poor_straw_bed', -7.2, y0, -2.3, 0, { v: 0, setting: 'indoor' });
      F.furn('generic_poor_straw_bed', -5.6, y0, -2.3, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_fire_pit', -1.4, y0, -0.8, 0, { v: 1, setting: 'indoor' });
      F.furn('br_table', 0.6, y0, 1.3, 0, { v: 1, setting: 'indoor' });
      F.furn('br_bench', -2.3, y0, 1.9, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_barrel_cluster', 1.8, y0, -2.5, 0, { v: 0, setting: 'indoor' });
      /* the stable lean-to: posts, a shingle shed roof off the hall's end, straw, the trough */
      const sx0 = 3.6, sx1 = 9.0;
      F.box((sx0 + sx1) / 2, 0, (z0 + z1) / 2, sx1 - sx0, 0.06, z1 - z0, 0, BRM.straw, 'straw/cloth');
      for (const z of [z0 + 0.2, z1 - 0.2]) brmPost(F, sx1 - 0.2, 0, z, 2.6, 0.28, BRM.red, BRM.gilt);
      F.beam(sx1 - 0.2, 2.5, z0, sx1 - 0.2, 2.5, z1, 0.24, 0.28, BRM.red, BRM_TIMBER);
      F.beam(sx1 + 0.5, 2.4, (z0 + z1) / 2, x1 + 0.2, y0 + wh + 0.4, (z0 + z1) / 2, 0.2, z1 - z0 + 0.8, BRM.shingle[2], BRM_SHINGLE);
      F.furn('br_h_trough', (sx0 + sx1) / 2, 0.06, z0 + 0.8, 0, { v: 0 });
      F.furn('br_h_tack_rack', (sx0 + sx1) / 2 + 0.2, 0.06, z1 + 1.3, 0, { v: 0 });
      F.furn('br_h_hitching_rail', -4.0, 0, z1 + 2.6, 0, { v: 0 });
      return;
    }
    /* the inn round its yard: the guest hall at the back in two storeys (the common room under, the sleeping rooms
       over, a gallery on the yard), the stable range on the left, the grooms' and tack range on the right, a carved
       gate at the front; the well and the trough in the yard */
    const hx0 = -9, hx1 = 9, hz0 = -10, hz1 = -4, g = 2.8, u = y0 + g + 0.25;
    brtBase(F, hx0, hx1, hz0, hz1, y0);
    brtWalls(F, hx0, hx1, hz0, hz1, y0, g, BRM.stave[0], [{ side: 'f', at: 0, w: 1.8, h: 2.3 }]);
    for (const a of [-5.5, -2.5, 2.5, 5.5]) brtWin(F, 'f', hx0, hx1, hz0, hz1, a, y0 + 1.7, 0.9, 0.8);
    F.box(0, u - 0.25, (hz0 + hz1) / 2, hx1 - hx0 + 0.3, 0.25, hz1 - hz0 + 0.3, 0, BRM.timber[2], BRM_TIMBER);
    brtWalls(F, hx0, hx1, hz0, hz1, u, 2.4, BRM.stave[1], [{ side: 'f', at: -4.5, w: 1.1 }, { side: 'f', at: 4.5, w: 1.1 }]);
    for (const a of [-7, -1.5, 1.5, 7]) brtWin(F, 'f', hx0, hx1, hz0, hz1, a, u + 1.5, 0.8, 0.6);
    brtGallery(F, hx0, hx1, hz1, u, 1.3, 6);
    brtStair(F, hx1 - 4.6, hx1 - 1.0, hz1 + 2.2, u, 1.0);
    brmHip(F, 0, (hz0 + hz1) / 2 + 0.5, u + 2.4, hx1 - hx0 + 1.8, 5.6, hz1 - hz0 + 3.6, BRM.shingle[1], 1.3);
    brtSmoke(F, -3.5, u + 2.4 + 5.6, (hz0 + hz1) / 2 + 0.5, true);
    F.furn('br_tavern_bar', -5.5, y0, hz0 + 1.1, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_fire_pit', 0, y0, -7.2, 0, { v: 1, setting: 'indoor' });
    F.furn('br_table', 5.0, y0, -7.2, 0, { v: 0, setting: 'indoor' });
    for (const x of [-6.5, -2.0, 2.0, 6.5]) F.furn('generic_poor_straw_bed', x, u, hz0 + 1.3, Math.PI / 2, { v: 0, setting: 'indoor' });
    brtLamp(F, 0, u - 0.25, -5.5);
    /* the stable range (open to the yard, facing +x) and the grooms' range (stave, facing -x) */
    const sx0 = -9, sx1 = -4.5, sz0 = -3.0, sz1 = 7.0;
    F.box((sx0 + sx1) / 2, 0, (sz0 + sz1) / 2, sx1 - sx0 + 0.6, 0.3, sz1 - sz0, 0, BRM.rock, 'stone');
    F.box((sx0 + sx1) / 2, 0.3, (sz0 + sz1) / 2, sx1 - sx0 - 0.4, 0.05, sz1 - sz0 - 0.4, 0, BRM.straw, 'straw/cloth');
    F.box(sx0 + 0.1, 0.3, (sz0 + sz1) / 2, 0.2, 2.3, sz1 - sz0, 0, BRM.stave[1], BRM_STAVE);
    for (let i = 0; i < 4; i++) { const z = sz0 + 0.2 + i * (sz1 - sz0 - 0.4) / 3; brmPost(F, sx1 - 0.15, 0.3, z, 2.8, 0.28, i % 2 ? BRM.deep : BRM.red, BRM.gilt); if (i > 0 && i < 3) F.box((sx0 + sx1) / 2, 0.3, z, sx1 - sx0 - 0.3, 1.6, 0.1, 0, BRM.wall, 'reed'); }
    /* its shed roof falls to the yard (+x): one slab, the red band along its eave, the ribs up its ends */
    const scz = (sz0 + sz1) / 2;
    F.beam(sx0 - 0.5, 3.9, scz, sx1 + 0.9, 2.9, scz, 0.2, sz1 - sz0 + 0.6, BRM.shingle[1], BRM_SHINGLE);
    F.beam(sx1 + 0.9, 2.78, sz0 - 0.3, sx1 + 0.9, 2.78, sz1 + 0.3, 0.24, 0.3, BRM.red, BRM_TIMBER);
    for (const z of [sz0 - 0.3, sz1 + 0.3]) F.beam(sx0 - 0.5, 4.0, z, sx1 + 0.9, 3.0, z, 0.2, 0.2, BRM.verd, BRM_TIMBER);
    F.furn('br_h_trough', sx0 + 0.9, 0.3, 2.0, Math.PI / 2, { v: 1 });
    F.furn('br_h_hay_bales', sx0 + 1.2, 0.3, 5.6, 0, { v: 0 });
    const gx0 = 4.5, gx1 = 9, gz0 = -3.0, gz1 = 4.0;
    brtBase(F, gx0, gx1, gz0, gz1, y0);
    brtWalls(F, gx0, gx1, gz0, gz1, y0, 2.5, BRM.stave[0], [{ side: 'l', at: 1.0, w: 1.2 }]);
    brtWin(F, 'l', gx0, gx1, gz0, gz1, -1.8, y0 + 1.6, 0.8, 0.6);
    brmHip(F, (gx0 + gx1) / 2, (gz0 + gz1) / 2, y0 + 2.5, gx1 - gx0 + 1.4, 3.4, gz1 - gz0 + 1.4, BRM.shingle[0], 0.8);
    F.furn('br_h_tack_rack', (gx0 + gx1) / 2, y0, gz0 + 0.6, 0, { v: 0, setting: 'indoor' });
    F.furn('generic_poor_straw_bed', gx1 - 0.8, y0, gz1 - 1.3, 0, { v: 0, setting: 'indoor' });
    /* the yard and the gate */
    F.box(0, 0, 2.5, 8.8, 0.04, 12, 0, BRM.mud, 'yard/stone');
    F.furn('br_well', 0, 0.04, 1.0, 0, { v: 0 });
    F.furn('br_h_hitching_rail', 0, 0.04, -2.2, 0, { v: 1 });
    brmFence(F, -9, 8.5, -2.2, 8.5, 1.4); brmFence(F, 2.2, 8.5, 9, 8.5, 1.4);
    brmFence(F, 9, 4.6, 9, 8.5, 1.4); brmFence(F, -9, 7.4, -9, 8.5, 1.4);
    for (const s of [-1, 1]) brmPost(F, s * 2.2, 0, 8.5, 3.4, 0.34, BRM.red, BRM.gilt);
    F.beam(-2.6, 3.3, 8.5, 2.6, 3.3, 8.5, 0.28, 0.32, BRM.red, BRM_TIMBER);
    brmHip(F, 0, 8.5, 3.45, 6.4, 1.6, 1.8, BRM.shingle[3], 0.7);
    F.furn('br_h_hanging_lantern', 0, 3.3 - 2.3, 8.5, 0, { v: 2 });
  }
});

/* ================================ the barracks */
ASSET({
  key: 'br_bldg_barracks', name: 'Barracks of a Wing (soldiers)', culture: 'beast-rider', role: 'barracks',
  family: 'defensive', types: ['civic', 'dwelling-multi'], districts: ['ridertown'], wealth: [0.3, 0.7],
  w: 26, d: 21, h: 11, variants: 2, variantNames: ['the Wing\'s barracks and drill yard', 'the roost barracks with the flyers\' perches'],
  variantDims: [{ w: 22.5, d: 21, h: 11 }, { w: 26, d: 13, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    /* the hall (named by its Wing: LORE 6.6): a long stave hall with its struts, the claw over the door, beds down both
       long walls, the hearth, the racks of lances, bows and shields */
    const v1 = F.variant === 1, y0 = 0.4, hw = v1 ? 6.5 : 10, ox = v1 ? -5.0 : 0, x0 = ox - hw, x1 = ox + hw;
    const z0 = v1 ? -4 : -9, z1 = v1 ? 3.5 : -1.5, wh = 2.7, zc = (z0 + z1) / 2;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 0, w: 1.8, h: 2.3 }, { side: 'l', at: 0, w: 1.2 }]);
    for (const a of [-0.7, -0.35, 0.35, 0.7]) brtWin(F, 'f', x0, x1, z0, z1, a * hw, y0 + 1.75, 0.8, 0.6);
    brtStruts(F, x0, x1, z0, z1, y0 + wh, true, v1 ? 3 : 4);
    brmHip(F, ox, zc, y0 + wh, 2 * hw + 1.8, 5.4, z1 - z0 + 1.8, BRM.shingle[1], 1.3);
    brtSmoke(F, ox - hw * 0.4, y0 + wh + 5.4, zc, true); brtSmoke(F, ox + hw * 0.4, y0 + wh + 5.4, zc, true);
    brtClaw(F, ox, y0 + wh - 0.05, z1 + 0.16, 0.6);
    const nb = v1 ? 3 : 5;
    for (let i = 0; i < nb; i++) {
      const x = x0 + 1.4 + i * (2 * hw - 2.8) / (nb - 1);
      F.furn('generic_poor_straw_bed', x, y0, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
      if (Math.abs(x - ox) > 1.6) F.furn('generic_poor_straw_bed', x, y0, z1 - 1.2, 0, { v: 0, setting: 'indoor' });
    }
    F.furn('br_h_fire_pit', ox, y0, zc, 0, { v: 1, setting: 'indoor' });
    F.furn('br_weapon_rack', ox - 2.6, y0, z0 + 0.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_shield_rack', ox + 2.6, y0, z0 + 0.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_arrow_barrel', x1 - 0.7, y0, zc, 0, { v: 0, setting: 'indoor' });
    brtLamp(F, ox - 3, y0 + wh, zc); brtLamp(F, ox + 3, y0 + wh, zc);
    if (!v1) {
      /* the drill yard before it: training posts, the bow butt's lane, the Wing's banners at the gate */
      F.box(0, 0, 5.0, 2 * hw + 2, 0.04, 10.5, 0, BRM.mud, 'yard/stone');
      F.furn('br_h_training_post', -6.0, 0.04, 4.0, 0, { v: 0 });
      F.furn('br_h_training_post', -2.0, 0.04, 4.0, 0, { v: 1 });
      F.furn('br_h_bow_table', 5.5, 0.04, 3.2, 0, { v: 0 });
      F.furn('br_h_banner_pole', -2.2, 0, 9.6, 0, { v: 0 });
      F.furn('br_h_banner_pole', 2.2, 0, 9.6, 0, { v: 1 });
      F.furn('br_h_hitching_rail', 7.0, 0.04, 7.8, 0, { v: 0 });
      brmFence(F, -11, 9.6, -2.6, 9.6, 1.2); brmFence(F, 2.6, 9.6, 11, 9.6, 1.2);
      return;
    }
    /* the flyers' roost beside it: a raised deck on log posts, perch logs, the nests, a thatch canopy */
    const rx = 7.5, rw = 4.5, rd = 5.0, dy = 3.2;
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { F.cyl(rx + p[0] * rw, 0, p[1] * rd, 0.26, dy + 4.2, 0, BRM.timber[2], 'bark'); F.box(rx + p[0] * rw, 0, p[1] * rd, 0.8, 0.4, 0.8, 0, BRM.rock, 'stone'); }
    F.box(rx, dy - 0.3, 0, 2 * rw + 0.4, 0.3, 2 * rd + 0.4, 0, BRM.timber[2], BRM_TIMBER);
    F.box(rx, dy, 0, 2 * rw, 0.1, 2 * rd, 0, shade(BRM.plank, 0.05), 'guano/wood');
    F.furn('br_h_perch_bar', rx, dy + 0.1, rd - 0.6, 0, { v: 0 });
    F.furn('br_h_nest', rx - 1.8, dy + 0.1, -2.0, 0, { v: 0 });
    F.furn('br_h_feed_basket', rx + 3.0, dy + 0.1, -3.4, 0, { v: 0 });
    brtThatch(F, rx, 0, dy + 4.2, 2 * rw + 2.0, 2.6, 2 * rd + 2.0, BRM.thatch[0]);
    brtStair(F, rx - rw - 3.0, rx - rw, rd + 0.8, dy, 1.0);
  }
});

/* ================================ the school */
ASSET({
  key: 'br_bldg_school', name: 'Lore house and riding school (teachers)', culture: 'beast-rider', role: 'school',
  family: 'civic', types: ['civic'], districts: ['ridertown'], wealth: [0.3, 0.8],
  w: 21.5, d: 21.5, h: 11.5, variants: 2, variantNames: ['the lore house', 'the riding school\'s ring'],
  variantDims: [{ w: 16.5, d: 13.5, h: 11.5 }, { w: 21.5, d: 21.5, h: 5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* the ring where the young learn to sit a beast: a round pole fence, the viewing stand, the training posts, the
         tack shelter */
      const R = 10.5, n = 16;
      F.cyl(0, 0, 0, R, 0.04, 0, BRM.mud, 'yard/stone');
      for (let i = 0; i < n; i++) {
        const a0 = (i + 0.5) / n * Math.PI * 2, a1 = (i + 1.5) / n * Math.PI * 2;
        if (i === 3) continue;
        brmFence(F, Math.cos(a0) * R, Math.sin(a0) * R, Math.cos(a1) * R, Math.sin(a1) * R, 1.5);
      }
      F.furn('br_h_viewing_stand', 0, 0, -R + 2.6, 0, { v: 0 });
      F.furn('br_h_training_post', -3.0, 0.04, 2.0, 0, { v: 0 });
      F.furn('br_h_training_post', 3.5, 0.04, 1.0, 0.6, { v: 1 });
      F.furn('br_h_tack_rack', -6.0, 0.04, 5.0, -0.6, { v: 0 });
      F.furn('br_h_trough', 6.0, 0.04, 5.6, 0.7, { v: 0 });
      return;
    }
    /* the lore house: an open pendopo on carved posts over a raised floor, benches in rows, the teller's seat, the
       carved lore boards on the back wall where the tribes' stories are cut */
    const y0 = 0.7, hw = 6.0, hd = 4.5;
    brtBase(F, -hw, hw, -hd, hd, y0, { pad: 0.6 });
    for (let k = 0; k < 3; k++) F.box(0, 0, hd + 0.7 + k * 0.35, 3.0, y0 - k * 0.23, 0.36, 0, BRM.rock, 'stone');
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) brmPost(F, -hw + i * (2 * hw) / 3, y0, s * hd, 3.2, 0.32, (i + (s > 0 ? 1 : 0)) % 2 ? BRM.deep : BRM.red, BRM.gilt);
    for (const s of [-1, 1]) F.beam(-hw, y0 + 3.2, s * hd, hw, y0 + 3.2, s * hd, 0.3, 0.34, BRM.red, BRM_TIMBER);
    F.box(0, y0, -hd + 0.05, 2 * hw, 2.6, 0.2, 0, BRM.stave[0], BRM_STAVE);
    for (let i = 0; i < 5; i++) { F.box(-4.8 + i * 2.4, y0 + 0.8, -hd + 0.2, 1.8, 1.5, 0.08, 0, i % 2 ? BRM.timber[3] : BRM.timber[1], BRM_TIMBER); F.box(-4.8 + i * 2.4, y0 + 1.95, -hd + 0.25, 1.9, 0.1, 0.1, 0, BRM.gilt, BRM_TIMBER); }
    brtJoglo(F, 0, 0, y0 + 3.5, 2 * hw + 4.0, 2 * hd + 4.0, { fin: 1.2 });
    F.furn('br_h_council_seat', 0, y0, -hd + 1.3, 0, { v: 1, setting: 'indoor' });
    for (let r = 0; r < 3; r++) for (const s of [-1, 1]) F.furn('br_bench', s * 2.2, y0, -0.6 + r * 1.4, Math.PI, { v: 0, setting: 'indoor' });
    F.furn('br_h_speakers_hearth', 0, y0, -1.8, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_hanging_lantern', -3.0, y0 + 3.2 - 2.3, 0, 0, { v: 1 });
    F.furn('br_h_hanging_lantern', 3.0, y0 + 3.2 - 2.3, 0, 0, { v: 1 });
  }
});

/* ================================ the temple */
ASSET({
  key: 'br_bldg_temple', name: 'Temple of the five shrines (priests, shrine keepers)', culture: 'beast-rider', role: 'temple',
  family: 'religious', types: ['religious', 'funerary'], districts: ['ridertown'], wealth: [0.3, 1],
  w: 19, d: 20, h: 18.5, variants: 2, variantNames: ['the hall of the five shrines', 'the funerary court'],
  variantDims: [{ w: 16.5, d: 20, h: 18.5 }, { w: 19, d: 17, h: 7.5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* the funerary court: a paved court in a low wall, the pyre stone in the middle with its charred logs, the skull
         poles round it (LORE 6.6), the open pavilion where the dead lie in state, the offering stones */
      const R = 9.0;
      F.box(0, 0, 0, 2 * R, 0.12, 2 * R - 2, 0, shade(BRM.rock, 0.06), 'stone');
      for (const e of [[-R, -R + 1, R, -R + 1], [-R, -R + 1, -R, R - 1], [R, -R + 1, R, R - 1], [-R, R - 1, -2.0, R - 1], [2.0, R - 1, R, R - 1]])
        brtRun(F, e[0], e[1], e[2], e[3], 0.12, 1.1, 0.5, BRM.rock, 'stone', []);
      F.box(0, 0.12, 1.0, 4.2, 0.9, 2.6, 0, BRM.rock, 'stone');
      for (let i = 0; i < 5; i++) F.rod(-1.6, 1.15 + (i % 2) * 0.32, 0.2 + i * 0.4, 1.6, 1.15 + (i % 2) * 0.32, 0.2 + i * 0.4, 0.16, BRT.charcoal, 'bark');
      F.box(0, 1.02, 1.0, 3.6, 0.08, 2.0, 0, BRT.ash, 'stone');
      for (let i = 0; i < 8; i++) {
        const a = (i + 0.5) / 8 * Math.PI * 2, x = Math.cos(a) * 5.4, z = 1.0 + Math.sin(a) * 4.0;
        F.rod(x, 0.12, z, x, 3.4, z, 0.08, BRM.timber[2], BRM_TIMBER);
        F.beam(x - 0.5, 2.7, z, x + 0.5, 2.7, z, 0.06, 0.06, BRM.timber[2], BRM_TIMBER);
        F.ball(x, 3.55, z, 0.24, BRT.bone, 'stone');
        F.box(x - 0.08, 3.38, z + 0.18, 0.16, 0.12, 0.08, 0, BRT.charcoal, 'stone');
      }
      for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) brmPost(F, p[0] * 2.6, 0.12, -5.4 + p[1] * 1.8, 2.8, 0.3, BRM.red, BRM.gilt);
      brmHip(F, 0, -5.4, 2.95, 6.8, 3.0, 5.2, BRM.shingle[3], 0.8);
      F.furn('br_shrine_altar', 0, 0.12, -5.6, 0, { v: 1 });
      F.furn('br_h_shrine_drum', -5.5, 0.12, -6.0, 0, { v: 0 });
      F.furn('br_h_offering_stone', 4.6, 0.12, -6.0, 0, { v: 0 });
      F.furn('br_h_offering_stone', -2.6, 0.12, 6.5, 0, { v: 0 });
      F.furn('br_h_post_brazier', 2.6, 0.12, 6.5, 0, { v: 0 });
      return;
    }
    /* the hall of the five shrines (First Bough, Rain Mother, the Winged Ones, Deep Root, Green Silence): a square
       stave hall on a stepped stone plinth, a veranda of carved posts round it, a pyramid of shingle and the hall's
       crown over it (the tiers, the window drum, the gilt spire); the altar at the back, a shrine to each of the five */
    const y0 = 1.0, s = 4.5, vr = 6.6;
    F.box(0, 0, 0, 2 * vr + 2.6, 0.35, 2 * vr + 2.6, 0, shade(BRM.rock, -0.08), 'stone');
    F.box(0, 0.35, 0, 2 * vr + 1.6, 0.35, 2 * vr + 1.6, 0, BRM.rock, 'stone');
    F.box(0, 0.7, 0, 2 * vr + 0.6, y0 - 0.76, 2 * vr + 0.6, 0, shade(BRM.rock, 0.06), 'stone');
    F.box(0, y0 - 0.06, 0, 2 * vr, 0.06, 2 * vr, 0, BRM.plank, 'wood');
    for (let k = 0; k < 3; k++) F.box(0, 0, vr + 1.6 + k * 0.4, 3.2, y0 - k * 0.32, 0.42, 0, BRM.rock, 'stone');
    brtWalls(F, -s, s, -s, s, y0, 3.2, BRM.stave[0], [{ side: 'f', at: 0, w: 2.0, h: 2.6 }]);
    for (const sd of ['l', 'r']) brtWin(F, sd, -s, s, -s, s, 0, y0 + 2.0, 1.0, 1.0);
    for (let i = 0; i < 4; i++) for (const e of [-1, 1]) {
      const t = -vr + i * (2 * vr) / 3;
      brmPost(F, t, y0, e * vr, 3.4, 0.32, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
      if (i > 0 && i < 3) brmPost(F, e * vr, y0, t, 3.4, 0.32, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    }
    brtBand(F, 0, 0, y0 + 3.6, 2 * vr + 0.2, 2 * vr + 0.2);
    brmHip(F, 0, 0, y0 + 3.6, 2 * vr + 2.4, 3.4, 2 * vr + 2.4, BRM.shingle[1], 0);
    brtTierRoof(F, y0 + 6.6, 4.4, 8.8);
    F.furn('br_shrine_altar', 0, y0, -s + 1.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_shrine_drum', -3.0, y0, -3.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_shrine_drum', 3.0, y0, -3.2, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_shrine_sapling', -3.2, y0, 1.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_offering_stone', 3.2, y0, 1.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_offering_bowl', 0, y0 + 1.1, -s + 1.0, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_standing_stone', -5.0, 0, vr + 3.4, 0, { v: 0 });
    F.furn('br_h_standing_stone', 5.0, 0, vr + 3.4, 0, { v: 0 });
    brtLamp(F, 0, y0 + 3.2, 0);
  }
});

/* ================================ the toll house */
ASSET({
  key: 'br_bldg_toll_house', name: 'Toll house (customs officers)', culture: 'beast-rider', role: 'customs',
  family: 'civic', types: ['civic'], districts: ['ridertown'], wealth: [0.3, 0.7],
  w: 19, d: 12.5, h: 10.5, variants: 2, variantNames: ['the toll house and its boom', 'the tally hall'],
  variantDims: [{ w: 19, d: 10.5, h: 7.5 }, { w: 18.5, d: 12.5, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4, v1 = F.variant === 1;
    /* a weighing beam: a tall post, the balance arm, the two pans on their ropes */
    function scale(x, z) {
      brmPost(F, x, 0, z, 3.6, 0.26, BRM.red, BRM.gilt);
      F.beam(x - 1.6, 3.5, z, x + 1.6, 3.5, z, 0.12, 0.14, BRM.timber[2], BRM_TIMBER);
      for (const e of [-1, 1]) { F.rod(x + e * 1.5, 3.45, z, x + e * 1.5, 1.0, z, 0.02, BRM.rope, 'rope'); F.cyl(x + e * 1.5, 0.9, z, 0.5, 0.1, 0, BRT.iron, 'metal'); }
    }
    if (v1) {
      /* the tally hall: a hall with a veranda where loads are opened and counted, the counted goods held behind */
      const x0 = -7, x1 = 5, z0 = -4.5, z1 = 1.5, wh = 2.8;
      brtBase(F, x0, x1, z0, z1 + 2.6, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[1], [{ side: 'f', at: -2.0, w: 1.6 }, { side: 'f', at: 3.0, w: 2.2, h: 2.4 }]);
      brtWin(F, 'f', x0, x1, z0, z1, 0.8, y0 + 1.8, 1.0, 0.7);
      for (const sd of ['l', 'r']) brtWin(F, sd, x0, x1, z0, z1, 0, y0 + 1.8, 0.9, 0.7);
      brtPostRow(F, x0 + 0.3, z1 + 2.4, x1 - 0.3, z1 + 2.4, y0, wh + 0.1, 5);
      brtJoglo(F, -1, -0.8, y0 + wh + 0.4, x1 - x0 + 4.0, z1 - z0 + 6.0, {});
      brtClaw(F, -1, y0 + wh - 0.05, z1 + 0.16, 0.5);
      F.furn('br_table', -4.0, y0, -1.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_bench', -4.0, y0, 0.2, 0, { v: 0, setting: 'indoor' });
      F.furn('br_storehouse_goods', 2.6, y0, -2.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_workshop_shelves', -6.55, y0, -2.5, Math.PI / 2, { v: 0, setting: 'indoor' });
      F.furn('br_h_crate_stack', -2.0, y0, z1 + 1.3, 0, { v: 1 });
      F.furn('br_h_sack_pile', 2.6, y0, z1 + 1.2, 0, { v: 0 });
      scale(7.2, 1.0);
      brtLamp(F, -1, y0 + wh, -1.4);
      return;
    }
    /* the toll house: a small stave house with its hatch on the road under a little roof, the boom across the road
       on its pivot post with the stone counterweight, the weighing beam */
    const x0 = -8.5, x1 = -2.5, z0 = -4.5, z1 = 0.5, wh = 2.5;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'l', at: 0.6, w: 1.1 }]);
    brtWin(F, 'f', x0, x1, z0, z1, -1.4, y0 + 1.7, 0.8, 0.6);
    F.box(x1 + 0.07, y0 + 0.9, (z0 + z1) / 2, 0.14, 1.0, 1.6, 0, BRM.pane, 'wood');
    F.box(x1 + 0.2, y0 + 0.85, (z0 + z1) / 2, 0.5, 0.08, 1.9, 0, BRM.plank, 'wood');
    F.beam(x1 + 0.1, y0 + 2.2, (z0 + z1) / 2, x1 + 1.0, y0 + 1.95, (z0 + z1) / 2, 0.08, 2.2, BRM.shingle[2], BRM_SHINGLE);
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.4, 3.4, z1 - z0 + 1.4, BRM.shingle[1], 0.8);
    brtClaw(F, (x0 + x1) / 2 + 1.2, y0 + 1.05, z1 + 0.14, 0.45);
    F.furn('br_h_work_counter', x1 - 0.7, y0, (z0 + z1) / 2, Math.PI / 2, { v: 0, setting: 'indoor' });
    F.furn('br_table', -6.2, y0, -2.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_crate_stack', -6.2, y0, -0.3, 0, { v: 0, setting: 'indoor' });
    F.furn('br_bench', -4.2, y0, -0.7, 0, { v: 0, setting: 'indoor' });
    /* the road, the boom on its pivot post, the counterweight */
    F.box(4.5, 0, -1.5, 9.0, 0.04, 10.0, 0, BRM.mud, 'yard/stone');
    brmPost(F, 0.0, 0, 2.8, 1.6, 0.36, BRM.red, BRM.gilt);
    F.beam(-1.6, 1.5, 2.8, 9.0, 1.5, 2.8, 0.2, 0.2, BRM.red, BRM_TIMBER);
    for (let i = 1; i < 5; i++) F.box(i * 2.0, 1.4, 2.8, 0.5, 0.22, 0.22, 0, BRM.gilt, BRM_TIMBER);
    F.box(-1.2, 1.0, 2.8, 0.8, 0.7, 0.7, 0, BRM.rock, 'stone');
    F.box(9.0, 0, 2.8, 0.3, 1.4, 0.3, 0, BRM.timber[2], BRM_TIMBER);
    scale(6.0, -3.8);
    F.furn('br_h_post_brazier', 1.0, 0, -4.5, 0, { v: 0 });
  }
});

/* ================================ the watch tower */
/* a square log tower: four legs raked in from foot (b0) to top (b1), braced in stages, the lookout deck at `top` with
   a stave parapet and four carved posts carrying a steep shingle hip with beast heads; a ladder up the +z face */
function brtTower(F, x, z, top, b0, b1, o) {
  o = o || {};
  const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  legs.forEach(function (s) { F.rod(x + s[0] * b0, 0, z + s[1] * b0, x + s[0] * b1, top, z + s[1] * b1, 0.24, BRM.timber[2], 'bark'); F.box(x + s[0] * b0, 0, z + s[1] * b0, 0.9, 0.45, 0.9, 0, BRM.rock, 'stone'); });
  for (let y = 3.0; y < top - 1.5; y += 3.5) {
    const r = b0 + (b1 - b0) * y / top, r2 = b0 + (b1 - b0) * Math.min(top, y + 3.5) / top;
    for (let i = 0; i < 4; i++) { const a = legs[i], b = legs[(i + 1) % 4];
      F.rod(x + a[0] * r, y, z + a[1] * r, x + b[0] * r, y, z + b[1] * r, 0.09, BRM.timber[0], BRM_TIMBER);
      F.rod(x + a[0] * r, y, z + a[1] * r, x + b[0] * r2, Math.min(top, y + 3.5), z + b[1] * r2, 0.06, BRM.timber[0], BRM_TIMBER); }
  }
  const dk = b1 + 0.9;
  F.box(x, top - 0.4, z, 2 * dk, 0.4, 2 * dk, 0, BRM.timber[2], BRM_TIMBER);
  F.box(x, top, z, 2 * dk + 0.2, 0.12, 2 * dk + 0.2, 0, BRM.plank, 'wood');
  for (const sd of ['f', 'b', 'l', 'r']) { const S = brtSide(sd, x - dk, x + dk, z - dk, z + dk); brtRun(F, S.a[0], S.a[1], S.b[0], S.b[1], top + 0.12, 1.0, 0.12, BRM.stave[0], BRM_STAVE, sd === 'f' ? [{ at: dk, w: 1.0, h: 1.0 }] : []); }
  for (const p of legs) brmPost(F, x + p[0] * (dk - 0.1), top + 0.12, z + p[1] * (dk - 0.1), 2.4, 0.24, BRM.red, BRM.gilt);
  brmHip(F, x, z, top + 2.5, 2 * dk + 1.8, o.roofH == null ? 3.2 : o.roofH, 2 * dk + 1.8, BRM.shingle[1], 0);
  F.cyl(x, top + 2.5 + (o.roofH == null ? 3.2 : o.roofH) - 0.2, z, 0.1, 1.2, 0, BRM.gilt, BRM_TIMBER);
  for (const e of [-0.45, 0.45]) F.rod(x + e, 0, z + b0 + 0.3, x + e, top, z + b1 + 0.2, 0.05, BRM.timber[0], BRM_TIMBER);
  const nr = Math.round(top / 0.4);
  for (let k = 1; k < nr; k++) { const t = k / nr; F.rod(x - 0.45, top * t, z + b0 + 0.3 + (b1 - b0 - 0.1) * t, x + 0.45, top * t, z + b0 + 0.3 + (b1 - b0 - 0.1) * t, 0.03, BRM.timber[0], BRM_TIMBER); }
  return top + 0.12;
}
ASSET({
  key: 'br_bldg_watch_tower', name: 'Watch tower (town guard)', culture: 'beast-rider', role: 'guard',
  family: 'defensive', types: ['infrastructure'], districts: ['ridertown'], wealth: [0.2, 0.6],
  w: 18, d: 10.5, h: 17.5, variants: 2, variantNames: ['the watch tower', 'the guard house and its lookout'],
  variantDims: [{ w: 8.5, d: 8, h: 17.5 }, { w: 18, d: 10.5, h: 14.5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 0) {
      const dy = brtTower(F, 0, 0, 10.5, 3.0, 1.9, {});
      F.furn('br_h_signal_brazier', -1.4, dy, -1.4, 0, { v: 0 });
      F.furn('br_bench', 1.2, dy, -2.0, 0, { v: 0 });
      F.furn('br_weapon_rack', 1.6, dy, 1.9, Math.PI, { v: 0 });
      F.furn('br_h_guard_shelter', 0, 0, 0, 0, { v: 0 });
      F.furn('br_h_water_butt', -3.6, 0, 2.6, 0, { v: 0 });
      return;
    }
    /* the guard house: a stave guard room (bunks, the racks, the hearth), its lookout tower at the back corner */
    const y0 = 0.4, x0 = -6.5, x1 = 2.5, z0 = -3.0, z1 = 3.5, wh = 2.6;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[1], [{ side: 'f', at: 1.5, w: 1.4 }]);
    brtWin(F, 'f', x0, x1, z0, z1, -2.2, y0 + 1.7, 0.8, 0.6);
    brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.7, 0.8, 0.6);
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 4.0, z1 - z0 + 1.6, BRM.shingle[0], 1.0);
    brtClaw(F, (x0 + x1) / 2 - 2.0, y0 + wh - 0.6, z1 + 0.16, 0.45);
    F.furn('generic_poor_straw_bed', x0 + 0.9, y0, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
    F.furn('generic_poor_straw_bed', x0 + 2.2, y0, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_weapon_rack', -0.6, y0, z0 + 0.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_fire_pit', -2.4, y0, 1.0, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_arrow_barrel', x1 - 0.6, y0, 0.6, 0, { v: 0, setting: 'indoor' });
    const dy = brtTower(F, 6.5, -2.0, 8.0, 2.4, 1.6, { roofH: 2.6 });
    F.furn('br_h_signal_brazier', 6.5 - 1.0, dy, -3.0, 0, { v: 1 });
  }
});

/* ================================ the beacon */
ASSET({
  key: 'br_bldg_beacon_tower', name: 'Beacon (lighthouse keepers)', culture: 'beast-rider', role: 'beacon',
  family: 'infrastructure', types: ['infrastructure'], districts: ['ridertown'], wealth: [0.2, 0.6],
  w: 15, d: 12, h: 18, variants: 2, variantNames: ['the fire beacon', 'the signal mast station'],
  variantDims: [{ w: 15, d: 12, h: 18 }, { w: 13, d: 8.5, h: 7 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1;
    /* the keeper's hut, the stacked fuel */
    const hx0 = v1 ? 1.0 : -8.0, hx1 = hx0 + 5.0, hz0 = v1 ? -3.5 : 1.5, hz1 = hz0 + 4.0, y0 = 0.35;
    brtBase(F, hx0, hx1, hz0, hz1, y0);
    brtWalls(F, hx0, hx1, hz0, hz1, y0, 2.3, BRM.stave[0], [{ side: 'f', at: 1.0, w: 1.1 }]);
    brtWin(F, 'f', hx0, hx1, hz0, hz1, -1.2, y0 + 1.5, 0.7, 0.5);
    brmHip(F, (hx0 + hx1) / 2, (hz0 + hz1) / 2, y0 + 2.3, hx1 - hx0 + 1.2, 2.8, hz1 - hz0 + 1.2, BRM.shingle[0], 0.6);
    F.furn('generic_poor_straw_bed', hx0 + 0.8, y0, hz0 + 1.3, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_fire_pit', hx1 - 1.6, y0, hz0 + 1.6, 0, { v: 1, setting: 'indoor' });
    if (v1) {
      /* the signal station: a stone base, its lookout platform, the lantern mast (oil), the oil jars and the fuel */
      F.box(-3.0, 0, -0.5, 5.6, 1.4, 5.6, 0, BRM.rock, 'stone');
      F.box(-3.0, 1.4, -0.5, 5.8, 0.12, 5.8, 0, BRM.plank, 'wood');
      for (const e of [[-5.9, -3.4, -0.1, -3.4], [-5.9, 2.4, -0.1, 2.4], [-5.9, -3.4, -5.9, 2.4], [-0.1, -3.4, -0.1, 2.4]]) F.beam(e[0], 2.4, e[1], e[2], 2.4, e[3], 0.1, 0.1, BRM.red, BRM_TIMBER);
      for (const p of [[-5.9, -3.4], [-0.1, -3.4], [-5.9, 2.4], [-0.1, 2.4]]) F.box(p[0], 1.5, p[1], 0.14, 1.0, 0.14, 0, BRM.red, BRM_TIMBER);
      brtStair(F, -3.0 + 6.2, -3.0 + 2.9, 3.4, 1.4, 1.0);
      F.furn('br_h_signal_mast', -3.0, 1.52, -1.0, 0, { v: 0 });
      F.furn('br_h_signal_brazier', -4.6, 1.52, 1.0, 0, { v: 0 });
      F.furn('br_h_barrel_cluster', 3.4, 0, 2.6, 0, { v: 1 });
      return;
    }
    /* the fire beacon: four raked legs to a stone-lined fire deck, the fire laid in its stone bowl, the hoist for the
       wood, the ladder, the woodstack at the foot */
    const top = 14.5, b0 = 3.6, b1 = 1.8, legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    legs.forEach(function (s) { F.rod(s[0] * b0, 0, s[1] * b0, s[0] * b1, top, s[1] * b1, 0.26, BRM.timber[2], 'bark'); F.box(s[0] * b0, 0, s[1] * b0, 1.0, 0.5, 1.0, 0, BRM.rock, 'stone'); });
    for (const y of [3.5, 7.5, 11.0]) { const r = b0 + (b1 - b0) * y / top; for (let i = 0; i < 4; i++) { const a = legs[i], b = legs[(i + 1) % 4]; F.rod(a[0] * r, y, a[1] * r, b[0] * r, y, b[1] * r, 0.09, BRM.timber[0], BRM_TIMBER); } }
    F.box(0, top - 0.4, 0, 2 * b1 + 1.4, 0.4, 2 * b1 + 1.4, 0, BRM.timber[2], BRM_TIMBER);
    F.box(0, top, 0, 2 * b1 + 1.6, 0.3, 2 * b1 + 1.6, 0, BRM.rock, 'stone');
    F.frustum(0, top + 0.3, 0, 1.4, 1.8, 1.0, 0, BRM.rock, 'stone', 10);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; F.rod(Math.cos(a) * 1.3, top + 1.2 + (i % 2) * 0.25, Math.sin(a) * 1.3, -Math.cos(a) * 1.3, top + 1.2 + (i % 2) * 0.25, -Math.sin(a) * 1.3, 0.14, BRM.timber[i % 4], 'bark'); }
    F.cone(0, top + 1.3, 0, 1.0, 1.3, 0, BRT_GLOW.ember, 'glow');
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.4; F.cone(Math.cos(a) * 0.45, top + 1.4, Math.sin(a) * 0.45, 0.45, 1.5 - i * 0.2, 0, BRT_GLOW.fire, 'glow'); }
    for (const p of legs) F.box(p[0] * (b1 + 0.6), top + 0.3, p[1] * (b1 + 0.6), 0.2, 1.0, 0.2, 0, BRM.red, BRM_TIMBER);
    F.beam(0, top + 0.6, -b1 - 0.8, 0, top + 0.6, -b1 - 2.6, 0.16, 0.16, BRM.timber[2], BRM_TIMBER);
    F.rod(0, top + 0.5, -b1 - 2.5, 0, 1.2, -b1 - 2.5, 0.025, BRM.rope, 'rope');
    for (const e of [-0.45, 0.45]) F.rod(e, 0, b0 + 0.3, e, top, b1 + 0.3, 0.05, BRM.timber[0], BRM_TIMBER);
    const nr = Math.round(top / 0.4);
    for (let k = 1; k < nr; k++) { const t = k / nr; F.rod(-0.45, top * t, b0 + 0.3 + (b1 - b0) * t, 0.45, top * t, b0 + 0.3 + (b1 - b0) * t, 0.03, BRM.timber[0], BRM_TIMBER); }
    F.furn('br_woodpile', 4.8, 0, -4.4, 0, { v: 0 });
    F.furn('br_woodpile', 4.8, 0, -2.6, 0, { v: 0 });
    F.furn('br_h_water_butt', -5.6, 0, -3.8, 0, { v: 0 });
  }
});

BRT_ROWS.push({ title: 'Trades: civic, guard and signal (this kit)', keys: ['br_bldg_riders_inn', 'br_bldg_barracks', 'br_bldg_school', 'br_bldg_temple',
  'br_bldg_toll_house', 'br_bldg_watch_tower', 'br_bldg_beacon_tower'] });
