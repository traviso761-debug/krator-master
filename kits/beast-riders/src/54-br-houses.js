// prefix: brh
/* ======================================================================
   The Beast Riders kit: the larger houses and the farmhouse (owner, 2026-10-19: "we may want some larger housing
   options"; Pinnacle Rock's plan: clan great-houses, chiefs' compounds, rock-backed longhouse blocks where land is
   tight, and twelve farmhouses in the farm ring at the mesa's foot). Beyond the ports' round huts, joglo and stave
   longhouse (br_port_girder_house), in the same vocabulary (src/50-br-mounts.js, the helpers of src/51-br-trades.js).
   Frame: origin at the footprint's centre on the ground, +z the front.

     br_bldg_great_house     a clan's great-house: two storeys, the mounts stalled under, a gallery on the front
     br_bldg_chief_compound  a chief's compound: the hall-house round a court, the wings, the gate (envoys lodge here)
     br_bldg_rock_longhouse  a longhouse block built against rock: its back wall FLAT (`against: 'back'`: nothing is
                             drawn behind local z = -d/2), a shed roof falling from the rock, galleries; two or three storeys
     br_bldg_terrace_row     a terrace of narrow houses under one roof
     br_bldg_farmhouse       the farmhouse with its yard, crib and beast shed; the courtyard farm; the paddy farm
   ====================================================================== */

/* a house's upper storey floor: the joists' slab over x0..x1, z0..z1 at height u (its top) */
function brhFloor(F, x0, x1, z0, z1, u) {
  F.box((x0 + x1) / 2, u - 0.26, (z0 + z1) / 2, x1 - x0 + 0.3, 0.26, z1 - z0 + 0.3, 0, BRM.timber[2], BRM_TIMBER);
}
/* a pen of Girder's pole fence round x0..x1, z0..z1 with a gap of gw at the front's middle (gx) */
function brhPen(F, x0, x1, z0, z1, h, gx, gw) {
  brmFence(F, x0, z0, x1, z0, h); brmFence(F, x0, z0, x0, z1, h); brmFence(F, x1, z0, x1, z1, h);
  brmFence(F, x0, z1, gx - gw / 2, z1, h); brmFence(F, gx + gw / 2, z1, x1, z1, h);
}
/* a small raised crib (the farm's granary): four posts with their rat-guards, a slatted cane box, a thatch pyramid */
function brhCrib(F, x, z, s) {
  const y = 1.3 * s;
  for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { F.box(x + p[0] * 1.1 * s, 0, z + p[1] * 0.9 * s, 0.5, 0.3, 0.5, 0, BRM.rock, 'stone'); F.cyl(x + p[0] * 1.1 * s, 0.3, z + p[1] * 0.9 * s, 0.14, y - 0.3, 0, BRM.timber[2], BRM_TIMBER); F.cyl(x + p[0] * 1.1 * s, y - 0.5, z + p[1] * 0.9 * s, 0.4, 0.08, 0, BRM.timber[3], BRM_TIMBER); }
  F.box(x, y - 0.2, z, 2.6 * s, 0.2, 2.2 * s, 0, BRM.timber[2], BRM_TIMBER);
  F.box(x, y, z, 2.4 * s, 1.6 * s, 2.0 * s, 0, BRM.wall, 'reed');
  F.pyrRoof(x, y + 1.6 * s, z, 3.4 * s, 2.0 * s, 3.0 * s, 0, BRM.thatch[0], 'thatch');
  brtBand(F, x, z, y + 1.6 * s, 3.4 * s, 3.0 * s);
}
/* a lean-to beast shed on log posts: x0..x1 by z0..z1 open to +z, its shingle falling to the front, straw */
function brhBeastShed(F, x0, x1, z0, z1, h) {
  F.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, 0.06, z1 - z0, 0, BRM.straw, 'straw/cloth');
  const n = Math.max(2, Math.round((x1 - x0) / 3.5));
  for (let i = 0; i <= n; i++) { const x = x0 + 0.2 + i * (x1 - x0 - 0.4) / n; brmPost(F, x, 0, z1 - 0.2, h, 0.3, i % 2 ? BRM.deep : BRM.red, BRM.gilt); F.cyl(x, 0, z0 + 0.2, 0.2, h + 1.2, 0, BRM.timber[2], 'bark'); }
  F.box((x0 + x1) / 2, 0, z0 + 0.1, x1 - x0, 1.8, 0.16, 0, BRM.stave[1], BRM_STAVE);
  brtShed(F, x0 - 0.4, x1 + 0.4, z0 - 0.5, z1 + 0.7, h + 1.4, h, BRM.shingle[2]);
}

/* ================================ the clan great-house */
ASSET({
  key: 'br_bldg_great_house', name: 'Clan great-house', culture: 'beast-rider', role: 'house',
  family: 'housing', types: ['dwelling-multi'], districts: ['ridertown'], wealth: [0.5, 1],
  w: 26, d: 12.5, h: 15.5, variants: 2, variantNames: ['the great-house of four bays', 'the long great-house under its joglo roof'],
  variantDims: [{ w: 21, d: 11.5, h: 14.5 }, { w: 26, d: 12.5, h: 15.5 }],
  build: function (F) {
    brtCentre(F);
    /* the ground storey is the mounts': stalls on carved posts, a stave back wall, straw; the clan lives over them in
       a stave storey with a gallery on brackets along the front, the stair up the end; a steep roof over all */
    const v1 = F.variant === 1, nb = v1 ? 5 : 4, bw = 4.0, hw = nb * bw / 2, z0 = -4.5, z1 = 2.5, g = 3.0, u = g + 0.6, uh = 2.7;
    F.box(0, 0, (z0 + z1) / 2, 2 * hw + 0.8, 0.3, z1 - z0 + 0.8, 0, BRM.rock, 'stone');
    F.box(0, 0.3, (z0 + z1) / 2, 2 * hw - 0.2, 0.05, z1 - z0 - 0.2, 0, BRM.straw, 'straw/cloth');
    F.box(0, 0.3, z0 + 0.1, 2 * hw, g, 0.2, 0, BRM.stave[1], BRM_STAVE);
    for (const s of [-1, 1]) F.box(s * (hw - 0.1), 0.3, (z0 + z1) / 2 - 1.0, 0.2, g, z1 - z0 - 2.0, 0, BRM.stave[1], BRM_STAVE);
    for (let i = 0; i <= nb; i++) {
      const x = -hw + i * bw;
      for (const z of [z1 - 0.2, (z0 + z1) / 2]) brmPost(F, x, 0.3, z, u - 0.56, 0.36, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
      if (i > 0 && i < nb) F.box(x, 0.3, (z0 + z1) / 2 - 1.0, 0.1, 1.7, z1 - z0 - 2.2, 0, BRM.wall, 'reed');
    }
    for (let i = 0; i < nb; i++) {
      const x = -hw + (i + 0.5) * bw;
      F.furn(i % 2 ? 'br_h_trough' : 'br_h_hay_bales', x, 0.35, z0 + 0.9, 0, { v: i % 3, setting: 'indoor' });
    }
    F.furn('br_h_tack_rack', -hw + 2.0, 0.35, z1 + 1.4, 0, { v: 0 });
    /* the clan's storey */
    brhFloor(F, -hw, hw, z0, z1, u);
    brtWalls(F, -hw, hw, z0, z1, u, uh, BRM.stave[0], [{ side: 'f', at: -bw, w: 1.3 }, { side: 'f', at: bw, w: 1.3 }]);
    for (let i = 0; i < nb; i++) { const a = -hw + (i + 0.5) * bw; if (Math.abs(Math.abs(a) - bw) > 1.0) brtWin(F, 'f', -hw, hw, z0, z1, a, u + 1.55, 1.0, 0.8); }
    for (const sd of ['l', 'r']) brtWin(F, sd, -hw, hw, z0, z1, 0, u + 1.55, 1.0, 0.8);
    brtGallery(F, -hw, hw, z1, u, 1.6, nb * 2);
    brtStair(F, hw + 3.6, hw + 0.2, z1 + 0.9, u, 1.1);
    brtStruts(F, -hw, hw, z0, z1, u + uh, true, nb);
    const rz = (z0 + z1) / 2 + 0.5;
    if (v1) brtJoglo(F, 0, rz, u + uh + 0.3, 2 * hw + 3.4, z1 - z0 + 5.0, { crownH: 5.2, fin: 1.4 });
    else { brmHip(F, 0, rz, u + uh, 2 * hw + 2.0, 6.0, z1 - z0 + 4.0, BRM.shingle[1], 1.4); brtSmoke(F, -hw / 2, u + uh + 6.0, rz, true); brtSmoke(F, hw / 2, u + uh + 6.0, rz, true); }
    F.furn('br_h_fire_pit', -bw, u, -1.0, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_fire_pit', bw, u, -1.0, 0, { v: 1, setting: 'indoor' });
    F.furn('br_table', 0, u, -1.0, Math.PI / 2, { v: 1, setting: 'indoor' });
    for (let i = 0; i < nb; i++) F.furn('generic_poor_straw_bed', -hw + 1.2 + i * (2 * hw - 2.4) / (nb - 1), u, z0 + 1.2, Math.PI / 2, { v: 0, setting: 'indoor' });
    F.furn('br_h_hanging_gourds', -hw + 1.2, u + uh - 1.22, 1.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_bench', 0, u, 1.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_hanging_lantern', 0, u - 0.3 - 2.3, z1 + 0.6, 0, { v: 1 });
  }
});

/* ================================ the chief's compound */
ASSET({
  key: 'br_bldg_chief_compound', name: 'Chief\'s compound', culture: 'beast-rider', role: 'chief',
  family: 'housing', types: ['dwelling-multi', 'civic'], districts: ['ridertown'], wealth: [0.7, 1],
  w: 29.5, d: 30.5, h: 14.5, variants: 2, variantNames: ['the hall-house round its court', 'the smaller compound with its stable range'],
  variantDims: [{ w: 29.5, d: 30.5, h: 14.5 }, { w: 25.5, d: 26.5, h: 14.5 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, R = v1 ? 12.5 : 14.5, y0 = 1.1;
    /* the court and its fence, the gate pavilion at the front */
    F.box(0, 0, 0, 2 * R - 0.4, 0.04, 2 * R - 0.4, 0, BRM.mud, 'yard/stone');
    brmFence(F, -R, -R, R, -R, 1.6); brmFence(F, -R, -R, -R, R, 1.6); brmFence(F, R, -R, R, R, 1.6);
    brmFence(F, -R, R, -2.4, R, 1.6); brmFence(F, 2.4, R, R, R, 1.6);
    for (const s of [-1, 1]) { brmPost(F, s * 2.4, 0, R, 3.6, 0.38, BRM.red, BRM.gilt); brmPost(F, s * 2.4, 0, R - 2.2, 3.6, 0.38, BRM.deep, BRM.gilt); }
    for (const z of [R, R - 2.2]) F.beam(-2.8, 3.5, z, 2.8, 3.5, z, 0.28, 0.32, BRM.red, BRM_TIMBER);
    brmHip(F, 0, R - 1.1, 3.65, 7.0, 2.4, 3.8, BRM.shingle[1], 0.8);
    /* the hall-house at the back: a stave hall on a stepped plinth, an open front hall on carved posts (the pendopo),
       the joglo roof with a tall crown; the chief's seat inside, the clan's council benches */
    const hw = v1 ? 6.0 : 7.5, hz0 = -R + 1.5, hz1 = hz0 + 7.0, pz = hz1 + 3.5;
    F.box(0, 0, (hz0 + pz) / 2, 2 * hw + 1.6, y0 - 0.4, pz - hz0 + 1.2, 0, shade(BRM.rock, -0.06), 'stone');
    F.box(0, y0 - 0.4, (hz0 + pz) / 2, 2 * hw + 0.8, 0.34, pz - hz0 + 0.6, 0, BRM.rock, 'stone');
    F.box(0, y0 - 0.06, (hz0 + pz) / 2, 2 * hw, 0.06, pz - hz0, 0, BRM.plank, 'wood');
    for (let k = 0; k < 4; k++) F.box(0, 0, pz + 0.75 + k * 0.32, 3.4, y0 - k * 0.27, 0.34, 0, BRM.rock, 'stone');
    brtWalls(F, -hw, hw, hz0, hz1, y0, 3.0, BRM.stave[0], [{ side: 'f', at: 0, w: 2.0, h: 2.5 }]);
    for (const a of [-hw * 0.6, hw * 0.6]) brtWin(F, 'f', -hw, hw, hz0, hz1, a, y0 + 1.9, 1.1, 0.9);
    for (let i = 0; i < 4; i++) brmPost(F, -hw + 0.4 + i * (2 * hw - 0.8) / 3, y0, pz - 0.3, 3.3, 0.34, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    F.beam(-hw, y0 + 3.2, pz - 0.3, hw, y0 + 3.2, pz - 0.3, 0.28, 0.32, BRM.red, BRM_TIMBER);
    brtJoglo(F, 0, (hz0 + pz) / 2, y0 + 3.4, 2 * hw + 3.4, pz - hz0 + 3.0, { crownH: 6.0, fin: 1.6 });
    brtClaw(F, 0, y0 + 2.75, hz1 + 0.16, 0.5);
    F.furn('br_h_council_seat', 0, y0, hz0 + 1.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_ring_bench', -hw / 2 - 0.4, y0, hz0 + 4.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_ring_bench', hw / 2 + 0.4, y0, hz0 + 4.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_speakers_hearth', 0, y0, hz0 + 3.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_bench', -hw + 1.6, y0, pz - 1.4, 0, { v: 0 });
    F.furn('br_bench', hw - 1.6, y0, pz - 1.4, 0, { v: 0 });
    brtLamp(F, 0, y0 + 3.0, hz0 + 3.2);
    /* the wings down the court's sides: stave longhouses with their struts; the family's on the left, and on the right
       the guest wing (envoys) or, in the smaller compound, the stable range */
    function wing(sx, guest) {
      const wx0 = sx < 0 ? -R + 1.2 : R - 6.2, wx1 = wx0 + 5.0, wz0 = -R + 11.0, wz1 = wz0 + 12.0, wy = 0.45;
      brtBase(F, wx0, wx1, wz0, wz1, wy);
      brtWalls(F, wx0, wx1, wz0, wz1, wy, 2.5, BRM.stave[sx < 0 ? 1 : 2], [{ side: sx < 0 ? 'r' : 'l', at: -3.0, w: 1.2 }, { side: sx < 0 ? 'r' : 'l', at: 3.0, w: 1.2 }]);
      for (const a of [-5.0, 0, 5.0]) brtWin(F, sx < 0 ? 'r' : 'l', wx0, wx1, wz0, wz1, a, wy + 1.6, 0.8, 0.6);
      brtStruts(F, wx0, wx1, wz0, wz1, wy + 2.5, false, 3);
      brmHip(F, (wx0 + wx1) / 2, (wz0 + wz1) / 2, wy + 2.5, wx1 - wx0 + 1.6, 4.4, wz1 - wz0 + 1.6, BRM.shingle[guest ? 3 : 1], 1.1);
      const bx = sx < 0 ? wx0 + 0.9 : wx1 - 0.9;
      for (let i = 0; i < 3; i++) F.furn('generic_poor_straw_bed', bx, wy, wz0 + 1.6 + i * 2.4, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_fire_pit', (wx0 + wx1) / 2, wy, wz1 - 3.0, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_kitchen_hearth', (wx0 + wx1) / 2, wy, wz1 - 0.6, Math.PI, { v: 0, setting: 'indoor' });
    }
    wing(-1, false);
    if (!v1) wing(1, true);
    else {
      const sx0 = R - 6.0, sx1 = R - 0.6, sz0 = -R + 11.0, sz1 = sz0 + 11.0;
      F.box((sx0 + sx1) / 2, 0.04, (sz0 + sz1) / 2, sx1 - sx0, 0.06, sz1 - sz0, 0, BRM.straw, 'straw/cloth');
      F.box(sx1 - 0.1, 0.04, (sz0 + sz1) / 2, 0.2, 2.2, sz1 - sz0, 0, BRM.stave[1], BRM_STAVE);
      for (let i = 0; i < 4; i++) brmPost(F, sx0 + 0.2, 0.04, sz0 + 0.2 + i * (sz1 - sz0 - 0.4) / 3, 2.8, 0.3, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
      const scz = (sz0 + sz1) / 2;
      F.beam(sx1 + 0.5, 4.0, scz, sx0 - 0.9, 2.9, scz, 0.2, sz1 - sz0 + 0.6, BRM.shingle[2], BRM_SHINGLE);
      F.beam(sx0 - 0.9, 2.78, sz0 - 0.3, sx0 - 0.9, 2.78, sz1 + 0.3, 0.24, 0.3, BRM.red, BRM_TIMBER);
      F.furn('br_h_trough', sx1 - 0.9, 0.1, scz - 2.0, Math.PI / 2, { v: 0 });
      F.furn('br_h_tack_rack', sx1 - 0.6, 0.1, scz + 2.6, -Math.PI / 2, { v: 1 });
    }
    /* the court: the fire, the banners of the chief's tribe, a standing stone */
    F.furn('br_h_fire_pit', 0, 0.04, 4.0, 0, { v: 0 });
    F.furn('br_h_banner_pole', -4.0, 0, R - 3.4, 0, { v: 0 });
    F.furn('br_h_banner_pole', 4.0, 0, R - 3.4, 0, { v: 1 });
    F.furn('br_h_standing_stone', v1 ? -2.0 : -3.0, 0.04, 8.0, 0, { v: 0 });
    F.furn('br_well', v1 ? 4.5 : 5.0, 0.04, 6.5, 0, { v: 0 });
  }
});

/* ================================ the longhouse block against rock */
ASSET({
  key: 'br_bldg_rock_longhouse', name: 'Longhouse block against rock', culture: 'beast-rider', role: 'house', against: 'back',
  family: 'housing', types: ['dwelling-multi'], districts: ['ridertown'], wealth: [0.2, 0.6],
  w: 24, d: 9.3, h: 12.5, variants: 2, variantNames: ['two storeys, four households', 'three storeys, three households'],
  variantDims: [{ w: 24, d: 9.3, h: 9.5 }, { w: 19.5, d: 9.3, h: 12.5 }],
  build: function (F) {
    brtCentre(F);
    /* where land is tight on the mesa top, the houses are built against a stack: the back wall is flat against the
       rock (local z = -5, nothing behind it), the roof falls from the rock to the front, the households open on
       galleries along the front; a stair up the end */
    const v1 = F.variant === 1, n = v1 ? 3 : 4, hb = 4.6, hw = n * hb / 2, B = -5.0, z0 = B + 0.1, z1 = 1.6, y0 = 0.4, sh = 2.8;
    const storeys = v1 ? 3 : 2, gal = 1.6;
    F.box(0, 0, (B + z1 + 0.4) / 2, 2 * hw + 0.8, y0 - 0.06, z1 + 0.4 - B, 0, BRM.rock, 'stone');
    for (let s = 0; s < storeys; s++) {
      const y = y0 + s * (sh + 0.3);
      if (s) brhFloor(F, -hw, hw, z0 + 0.15, z1, y);
      const doors = [];
      for (let i = 0; i < n; i++) doors.push({ side: 'f', at: -hw + (i + 0.3) * hb, w: 1.1 });
      brtWalls(F, -hw, hw, z0, z1, y, sh, BRM.stave[s % 2 ? 1 : 0], doors, { sides: 'flr' });
      F.box(0, y, z0, 2 * hw, sh, 0.2, 0, BRM.stave[2], BRM_STAVE);
      for (let i = 0; i < n; i++) brtWin(F, 'f', -hw, hw, z0, z1, -hw + (i + 0.72) * hb, y + 1.7, 0.9, 0.7);
      for (let i = 1; i < n; i++) F.box(-hw + i * hb, y, (z0 + z1) / 2, 0.14, sh, z1 - z0 - 0.2, 0, BRM.stave[1], BRM_STAVE);
      if (s) brtGallery(F, -hw, hw, z1, y, gal, n * 2);
      for (let i = 0; i < n; i++) {
        const cx = -hw + (i + 0.5) * hb;
        F.furn('generic_poor_straw_bed', cx + 1.2, y, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
        F.furn(s === 0 ? 'br_h_fire_pit' : 'br_bench', cx - 0.8, y, s === 0 ? -1.6 : z0 + 0.6, 0, { v: 1, setting: 'indoor' });
      }
    }
    /* the posts carrying the galleries and the eave, from the ground */
    const top = y0 + storeys * (sh + 0.3) - 0.3;
    for (let i = 0; i <= n; i++) brmPost(F, -hw + i * hb, 0, z1 + gal - 0.15, top - 0.1, 0.28, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
    F.beam(-hw, top - 0.2, z1 + gal - 0.15, hw, top - 0.2, z1 + gal - 0.15, 0.26, 0.3, BRM.red, BRM_TIMBER);
    /* the shed roof from the rock: high at the back plane, down past the gallery */
    const yb = top + 2.4, yf = top + 0.2, zf = z1 + gal + 0.9;
    F.beam(0, yb, B + 0.12, 0, yf, zf, 2 * hw + 1.2, 0.2, BRM.shingle[1], BRM_SHINGLE);
    F.beam(-hw - 0.6, yf - 0.12, zf, hw + 0.6, yf - 0.12, zf, 0.24, 0.3, BRM.red, BRM_TIMBER);
    for (const x of [-hw - 0.6, hw + 0.6]) F.beam(x, yb + 0.06, B + 0.12, x, yf + 0.1, zf, 0.2, 0.2, BRM.verd, BRM_TIMBER);
    for (const s of [-1, 1]) F.box(s * hw, top, (B + z1) / 2 + 0.1, 0.2, 1.0, z1 - B - 0.2, 0, BRM.stave[0], BRM_STAVE);
    F.box(0, top, B + 0.1, 2 * hw, yb - top - 0.1, 0.2, 0, BRM.stave[2], BRM_STAVE);
    /* the stair up the right end, a landing at each floor */
    for (let s = 1; s < storeys; s++) brtStair(F, hw + 3.4, hw + 0.2, z1 + 0.9, y0 + s * (sh + 0.3), 1.0);
    F.furn('br_h_water_butt', -hw - 1.4, 0, z1 + 0.8, Math.PI / 2, { v: 0 });
    F.furn('br_h_window_box', -hw + 0.72 * hb, y0 + 0.8, z1 + 0.2, 0, { v: 0 });
  }
});

/* ================================ the terrace row */
ASSET({
  key: 'br_bldg_terrace_row', name: 'Terrace row', culture: 'beast-rider', role: 'house',
  family: 'housing', types: ['dwelling-multi'], districts: ['ridertown'], wealth: [0.2, 0.6],
  w: 21.5, d: 11.5, h: 12.5, variants: 2, variantNames: ['four houses under one roof', 'three houses of two storeys'],
  variantDims: [{ w: 21.5, d: 10.5, h: 10 }, { w: 21, d: 11.5, h: 12.5 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, n = v1 ? 3 : 4, hb = v1 ? 5.4 : 4.8, hw = n * hb / 2, z0 = -4.0, z1 = 3.0, y0 = 0.4, g = 2.6;
    brtBase(F, -hw, hw, z0, z1, y0);
    const doors = [], cols = [BRM.stave[0], BRM.stave[1], BRM.stave[2], BRM.stave[1]];
    for (let i = 0; i < n; i++) doors.push({ side: 'f', at: -hw + (i + 0.32) * hb, w: 1.1 });
    brtWalls(F, -hw, hw, z0, z1, y0, g, BRM.stave[0], doors);
    for (let i = 0; i < n; i++) {
      const cx = -hw + (i + 0.5) * hb;
      F.box(cx, y0, z1 - 0.02, hb - 0.3, g - 0.1, 0.06, 0, cols[i % 4], BRM_STAVE);
      if (i) F.box(-hw + i * hb, y0, (z0 + z1) / 2, 0.16, g, z1 - z0 - 0.2, 0, BRM.stave[1], BRM_STAVE);
      brtWin(F, 'f', -hw, hw, z0, z1, -hw + (i + 0.72) * hb, y0 + 1.6, 0.9, 0.7);
      for (const e of [-0.65, 0.65]) brmPost(F, -hw + (i + 0.32) * hb + e, 0, z1 + 1.2, 2.5, 0.2, BRM.red, BRM.gilt);
      F.beam(-hw + (i + 0.32) * hb - 0.85, 2.5, z1 + 1.2, -hw + (i + 0.32) * hb + 0.85, 2.5, z1 + 1.2, 0.18, 0.2, BRM.red, BRM_TIMBER);
      F.furn('br_h_fire_pit', cx + 0.6, y0, -1.0, 0, { v: 1, setting: 'indoor' });
      F.furn('generic_poor_straw_bed', cx + (v1 ? 1.4 : 1.2), y0, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
      F.furn('generic_poor_log_seat', cx - 0.9, y0, -0.4, 0, { v: 0, setting: 'indoor' });
    }
    let top = y0 + g;
    if (v1) {
      /* the upper storey over all three, a gallery on brackets with the stairs up each end */
      const u = top + 0.3;
      brhFloor(F, -hw, hw, z0, z1, u);
      const ud = []; for (let i = 0; i < n; i++) ud.push({ side: 'f', at: -hw + (i + 0.5) * hb, w: 1.0 });
      brtWalls(F, -hw, hw, z0, z1, u, 2.4, BRM.stave[1], ud);
      for (let i = 0; i < n; i++) {
        const cx = -hw + (i + 0.5) * hb;
        if (i) F.box(-hw + i * hb, u, (z0 + z1) / 2, 0.16, 2.4, z1 - z0 - 0.2, 0, BRM.stave[1], BRM_STAVE);
        F.furn('generic_poor_straw_bed', cx - 1.6, u, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
        F.furn('br_bench', cx + 0.9, u, z0 + 0.6, 0, { v: 0, setting: 'indoor' });
      }
      brtGallery(F, -hw, hw, z1, u, 1.3, n * 2);
      brtStair(F, -hw - 3.4, -hw - 0.2, z1 + 0.7, u, 1.0);
      top = u + 2.4;
    }
    brtStruts(F, -hw, hw, z0, z1, top, true, n);
    brmHip(F, 0, (z0 + z1) / 2 + 0.3, top, 2 * hw + 1.8, v1 ? 5.0 : 5.2, z1 - z0 + 2.4 + (v1 ? 1.2 : 0), BRM.shingle[1], 1.1);
    for (let i = 0; i < n; i++) brtSmoke(F, -hw + (i + 0.5) * hb, top + (v1 ? 5.0 : 5.2) - 0.05, (z0 + z1) / 2 + 0.3, true);
    for (let i = 0; i < n; i++) F.furn(i % 2 ? 'br_h_planter_box' : 'br_h_water_butt', -hw + (i + 0.78) * hb, 0, z1 + 1.6, 0, { v: i % 3 });
  }
});

/* ================================ the farmhouse */
ASSET({
  key: 'br_bldg_farmhouse', name: 'Farmhouse', culture: 'beast-rider', job: 'farming',
  family: 'housing', types: ['farm', 'dwelling-single'], districts: ['ridertown'], wealth: [0.1, 0.7],
  w: 29, d: 27, h: 10.5, variants: 3, variantNames: ['the farmhouse, its yard, crib and beast shed', 'the courtyard farm', 'the paddy farm on its piles'],
  variantDims: [{ w: 24.5, d: 20.5, h: 9.5 }, { w: 29, d: 27, h: 10.5 }, { w: 22, d: 19.5, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    const v = F.variant, y0 = 0.4;
    /* the farmhouse itself: a stave longhouse, struts down its long walls, a smoke hood, beast heads on the ridge */
    function house(cx, cz, hw, hd, yb, o) {
      o = o || {};
      const x0 = cx - hw, x1 = cx + hw, z0 = cz - hd, z1 = cz + hd, wh = 2.5;
      if (yb > 0.6) brtStilts(F, x0, x1, z0, z1 + 1.4, yb, 3); else brtBase(F, x0, x1, z0, z1, yb);
      if (yb > 0.6) F.box(cx, yb - 0.04, z1 + 0.7, 2 * hw - 0.2, 0.08, 1.3, 0, BRM.plank, 'wood');
      brtWalls(F, x0, x1, z0, z1, yb, wh, BRM.stave[o.c == null ? 0 : o.c], [{ side: 'f', at: -1.2, w: 1.3 }]);
      brtWin(F, 'f', x0, x1, z0, z1, hw * 0.5, yb + 1.6, 0.9, 0.7);
      for (const sd of ['l', 'r']) brtWin(F, sd, x0, x1, z0, z1, 0, yb + 1.6, 0.8, 0.6);
      if (yb <= 0.6) brtStruts(F, x0, x1, z0, z1, yb + wh, true, 2);
      brmHip(F, cx, cz + (yb > 0.6 ? 0.6 : 0), yb + wh, 2 * hw + 1.8, 4.8, 2 * hd + 1.8 + (yb > 0.6 ? 1.4 : 0), BRM.shingle[o.s == null ? 1 : o.s], 1.1);
      brtSmoke(F, cx, yb + wh + 4.8, cz + (yb > 0.6 ? 0.6 : 0), true);
      F.furn('br_h_kitchen_hearth', cx - hw + 2.0, yb, z0 + 0.7, 0, { v: 0, setting: 'indoor' });
      F.furn('br_table', cx + 1.4, yb, cz + 0.2, 0, { v: 1, setting: 'indoor' });
      F.furn('generic_poor_straw_bed', x1 - 0.8, yb, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
      F.furn('generic_poor_straw_bed', x1 - 2.0, yb, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_sack_pile', x0 + 0.9, yb, z1 - 1.0, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_hanging_gourds', cx - 1.0, yb + wh - 1.22, z1 - 0.4, Math.PI, { v: 1, setting: 'indoor' });
    }
    if (v === 0) {
      /* the farmhouse and its yard: the house at the back, the crib, the beast shed (a hardshell or a threehorn),
         the sty and the coop, the yard fenced, the kitchen garden */
      house(-4.0, -6.5, 5.5, 3.0, y0, {});
      F.box(0, 0, 2.0, 24.0, 0.04, 14.0, 0, BRM.mud, 'yard/stone');
      brhPen(F, -12.0, 12.0, -10.5, 9.5, 1.1, -3.0, 3.0);
      brhCrib(F, 7.5, -7.0, 1.0);
      brhBeastShed(F, 3.0, 11.0, -1.5, 4.5, 2.8);
      F.furn('br_h_trough', 7.0, 0.06, -0.6, 0, { v: 0 });
      F.furn('br_h_hay_bales', 9.4, 0.06, 2.6, 0, { v: 1 });
      /* the sty and the coop */
      brhPen(F, -11.0, -6.5, 1.0, 5.0, 0.9, -8.75, 0);
      F.box(-9.8, 0, 1.6, 2.2, 1.0, 1.4, 0, BRM.stave[1], BRM_STAVE);
      F.hipRoof(-9.8, 1.0, 1.6, 2.6, 0.8, 1.8, 0, BRM.thatch[1], 'thatch');
      for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) F.cyl(-4.0 + p[0] * 0.6, 0, 3.5 + p[1] * 0.5, 0.06, 0.9, 0, BRM.timber[2], BRM_TIMBER);
      F.box(-4.0, 0.9, 3.5, 1.5, 0.9, 1.2, 0, BRM.wall, 'reed');
      F.pyrRoof(-4.0, 1.8, 3.5, 1.9, 0.8, 1.6, 0, BRM.thatch[0], 'thatch');
      F.furn('br_h_bean_trellis', 2.0, 0.04, 7.8, 0, { v: 0 });
      F.furn('br_h_planter_box', 6.5, 0.04, 7.6, 0, { v: 1 });
      F.furn('br_h_scarecrow', 9.8, 0.04, 7.4, 0, { v: 0 });
      F.furn('br_woodpile', -10.0, 0.04, -3.0, Math.PI / 2, { v: 0 });
      F.furn('br_h_water_butt', 2.2, 0.04, -4.4, 0, { v: 0 });
      return;
    }
    if (v === 1) {
      /* the courtyard farm: the house at the back of a court, the great barn (a joglo shed full of hay) on the left,
         the cribs and the byre on the right, a gate at the front; a well in the court */
      const R = 14.0;
      F.box(0, 0, 0, 2 * R - 0.4, 0.04, 2 * R - 2.4, 0, BRM.mud, 'yard/stone');
      brhPen(F, -R, R, -R + 1, R - 1, 1.3, 0, 3.6);
      for (const s of [-1, 1]) brmPost(F, s * 1.8, 0, R - 1, 2.8, 0.3, BRM.red, BRM.gilt);
      F.beam(-2.1, 2.7, R - 1, 2.1, 2.7, R - 1, 0.24, 0.28, BRM.red, BRM_TIMBER);
      house(0, -R + 5.0, 6.5, 3.2, y0, { c: 1 });
      const bx0 = -R + 1.0, bx1 = -4.5, bz0 = -4.0, bz1 = 8.5;
      F.box((bx0 + bx1) / 2, 0.04, (bz0 + bz1) / 2, bx1 - bx0, 0.06, bz1 - bz0, 0, BRM.straw, 'straw/cloth');
      for (let i = 0; i < 4; i++) for (const x of [bx0 + 0.3, bx1 - 0.3]) brmPost(F, x, 0.04, bz0 + 0.3 + i * (bz1 - bz0 - 0.6) / 3, 3.6, 0.34, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
      F.box(bx0 + 0.1, 0.04, (bz0 + bz1) / 2, 0.2, 2.4, bz1 - bz0, 0, BRM.stave[0], BRM_STAVE);
      brtJoglo(F, (bx0 + bx1) / 2, (bz0 + bz1) / 2, 3.95, bx1 - bx0 + 2.6, bz1 - bz0 + 2.6, { crownH: 3.6, fin: 1.0 });
      F.box((bx0 + bx1) / 2, 0.1, bz0 + 3.0, bx1 - bx0 - 2.0, 1.8, 4.0, 0, BRM.straw, 'straw/cloth');
      F.furn('br_h_hay_bales', (bx0 + bx1) / 2, 0.1, bz1 - 2.0, 0, { v: 2 });
      F.furn('br_h_tack_rack', (bx0 + bx1) / 2 + 0.6, 0.1, bz1 - 4.6, 0, { v: 1 });
      brhCrib(F, 9.0, -3.5, 1.0);
      brhCrib(F, 9.0, 0.5, 0.85);
      brhBeastShed(F, 4.5, 13.0, 4.0, 9.0, 2.8);
      F.furn('br_h_trough', 8.5, 0.06, 4.9, 0, { v: 1 });
      F.furn('br_well', 1.0, 0.04, 3.0, 0, { v: 0 });
      F.furn('br_h_scarecrow', -R + 3.0, 0.04, R - 3.0, 0, { v: 0 });
      F.furn('br_woodpile', 7.0, 0.04, -R + 3.0, 0, { v: 0 });
      return;
    }
    /* the paddy farm: the house on low piles by the paddies, the rice barn, the duck pond and its pen, the sheaves on
       the drying rack */
    house(-3.5, -5.0, 5.0, 2.8, 1.4, { s: 3 });
    for (let k = 0; k < 6; k++) F.box(-3.5 + 2.6, (k + 1) * 1.4 / 7, -5.0 + 2.8 + 1.4 + 0.25 + (5 - k) * 0.36, 1.1, 0.12, 0.38, 0, BRM.plank, 'wood');
    F.box(-6.0, 0, 6.0, 12.0, 0.1, 8.0, 0, BRT.soil, 'yard/stone');
    for (let i = 0; i < 2; i++) { F.box(-9.0 + i * 6.0, 0.1, 6.0, 5.4, 0.12, 7.2, 0, BRT.water, 'glass'); for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) F.cone(-11.2 + i * 6.0 + c * 1.1, 0.2, 3.0 + r * 1.2, 0.18, 0.55, 0, BRT.leaf, 'leafy'); }
    for (const z of [2.2, 9.8]) F.box(-6.0, 0.1, z, 12.0, 0.3, 0.5, 0, BRT.soil, 'stone');
    brhCrib(F, 6.5, -6.0, 1.15);
    F.box(6.5, 0, 5.5, 5.0, 0.1, 3.6, 0, BRT.water, 'glass');
    brhPen(F, 3.6, 9.4, 3.2, 8.2, 0.8, 6.5, 0);
    F.box(8.4, 0, 3.8, 1.4, 0.9, 1.0, 0, BRM.stave[1], BRM_STAVE);
    F.hipRoof(8.4, 0.9, 3.8, 1.8, 0.6, 1.4, 0, BRM.thatch[1], 'thatch');
    F.furn('br_drying_rack', 3.0, 0, -1.0, 0, { v: 0 });
    F.furn('br_h_water_butt', -9.8, 0, -1.4, 0, { v: 0 });
    F.furn('br_h_sack_pile', 6.5, 0, -2.6, 0, { v: 0 });
  }
});

BRT_ROWS.push({ title: 'Houses: the larger houses and the farmhouse (this kit)', keys: ['br_bldg_great_house', 'br_bldg_chief_compound', 'br_bldg_rock_longhouse',
  'br_bldg_terrace_row', 'br_bldg_farmhouse'] });
