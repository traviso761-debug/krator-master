// prefix: brt
/* ======================================================================
   The Beast Riders kit: the sedentary trades (owner, 2026-10-19: "sedentary beast rider versions of the current
   islander trades; although the beast riders do not have electricity"), part 1 of 3, with the helpers the three
   trade fragments and the houses (src/54-br-houses.js) share and BR_TRADES, the census table.

   The same vocabulary as the mounts' buildings (src/50-br-mounts.js: BRM, brmPost, brmHip, brmFence, brmWin, read
   from there): Girder's palette turned linear, tarred stave walls on a stone footing, steep shingle hips with
   verdigris ribs and a red eave band, red and gilt carved posts, beast-head finials, the joglo's thatch skirt under a
   shingle crown, raking struts down the long walls. No electricity: fire is wood and charcoal, light is oil and
   tallow (the catalog's lanterns) or glow fungus, and what turns, turns by beast or water (brtWhim, the mill's
   wheel). Catalog ASSETs (culture 'beast-rider'); frame: origin at the footprint's centre on the ground, +z the
   front; each variant's declared box (variantDims) holds everything it draws (verify.py measures it). Furniture is
   the catalog's (beast-rider and generic files) through F.furn, never drawn here. Each building carries `job` (the
   catalog's FURN_JOBS) where one fits, else `role`.

     br_bldg_bakehouse     bakers: a bake house and its clay ovens
     br_bldg_butcher       butchers: the shop and smokehouse; the slaughter yard with its hoist
     br_bldg_mead_hall     brewers, innkeepers and servers: the mead hall; the brewhouse
     br_bldg_tannery       tanners: the pit shed; with a beast-turned bark mill
     br_bldg_weaver        weavers and dyers: the weaving house; the dye works
     br_bldg_smithy        smiths: the forge; the great forge, its bellows worked by a beast
     br_bldg_potter        craftsmen: the potter's workshop and kiln shed; the two-kiln yard
     br_bldg_ropewalk      craftsmen: the rope walk (the roost rings and bridges are hung on its ropes)
     br_bldg_healer        healers: the house of healing; the beast-healer's with its sling stall
     br_bldg_shophouse     shopkeepers: the shop under a home; the double shophouse
     br_bldg_market_hall   market traders: the market hall; the market pavilion
   ====================================================================== */

/* a few colours the mounts' palette has no name for (sRGB, turned linear as BRM is) */
const BRT_SRGB = { clay: 0x9a6a48, clayD: 0x7a5038, ash: 0x4a4440, iron: 0x3a3836, water: 0x2e4a4c, leaf: 0x3e5a2a,
  indigo: 0x2a3a6a, madder: 0x8a2a2a, saffron: 0xc8a030, bone: 0xd8cfb8, sand: 0xa8553a, sandL: 0xbf6e4c, sandD: 0x8a4430,
  meat: 0x7a2a24, brine: 0x5a4a30, green: 0x3a7a3a, ore: 0x5a4a44, charcoal: 0x2a2624, soil: 0x4a3a2a, mulch: 0x3a2c20,
  cap: 0xb8a078, hemp: 0xb8a070 };
const BRT = {}; for (const k in BRT_SRGB) BRT[k] = brmLin(BRT_SRGB[k]);
/* 'glow' is the catalog's unlit material: fire and the glow fungus, given as seen */
const BRT_GLOW = { fire: 0xf06a14, ember: 0xd0400c, fungus: 0x7fe8c8 };
/* the sheet's rows for the trades and the houses (src/90-br-sheet.js reads it after the mounts) */
const BRT_ROWS = [];
/* each variant's footprint centred on the frame's origin: where the measured centre (x, z) of what a variant draws is
   off by more than 0.3 m, the build shifts its frame back by it before it draws (F.shift). Measured on the sheet
   (window._kit.built, min and max); remeasure after a change that moves a builder's extent */
const BRT_CENTRE = {
  br_bldg_bakehouse: [[0, -1.4], null],
  br_bldg_barracks: [null, [0.3, 0]],
  br_bldg_beacon_tower: [[-1.4, 0.5], [0.4, 0]],
  br_bldg_beast_stage: [[-1.6, -2.2], [-0.5, 1.3]],
  br_bldg_beetle_pen: [null, [0, 1.4]],
  br_bldg_butcher: [[0.6, 0], [0, 0.6]],
  br_bldg_chief_compound: [[0, 0.4], [0, 0.4]],
  br_bldg_farmhouse: [[0, -0.5], null, [-1.3, 0.5]],
  br_bldg_fungus_house: [[0, 0.7], [0, 1.6]],
  br_bldg_great_house: [[1.2, -0.5], [0.9, -0.5]],
  br_bldg_hauling_yard: [[0, -0.6], [0, -1.1]],
  br_bldg_healer: [[0, 1.1], [0, -0.5]],
  br_bldg_market_hall: [[0, 1], null],
  br_bldg_mead_hall: [[0, 0.8], [0, -0.5]],
  br_bldg_mill: [null, [-0.9, 0]],
  br_bldg_mine_head: [[0, -2.2], [-1.1, 0]],
  br_bldg_potter: [[-1, 0], [0.5, 0]],
  br_bldg_quarry: [[-0.5, 0], null],
  br_bldg_riders_inn: [[0, -1], [0, 0.6]],
  br_bldg_river_landing: [[0, -1.6], null, null],
  br_bldg_longhouse_block: [[0.8, -0.4], [0.8, -0.4]],
  br_bldg_ropewalk: [null, [0, -0.4]],
  br_bldg_shophouse: [[0, -0.4], [0, -0.4]],
  br_bldg_smithy: [[0, 0.4], [0.8, 0]],
  br_bldg_storehouse: [[0, 0.9], [0, 0.6]],
  br_bldg_tannery: [[-0.5, -0.3], [0, -0.3]],
  br_bldg_temple: [[0, 1.7], null],
  br_bldg_terrace_row: [null, [-1.2, 0]],
  br_bldg_toll_house: [[0, -1.5], [0, -0.8]],
  br_bldg_watch_tower: [null, [1.3, -0.6]]
};
function brtCentre(F) { const c = (BRT_CENTRE[F.asset.key] || [])[F.variant]; if (c) F.shift(-c[0], -c[1]); }

/* ---------------------------------------------------------------- BR_TRADES
   Every trade of the Voth city's census (the list IS_TRADES carries: kits/islanders/src/68-is-trades.js), and the
   Beast Rider buildings that carry it, or `na` and why a rider town has none. Plain data: verify.py --assert checks
   that every census trade has a row, that every row names buildings of this kit (culture beast-rider) or gives a
   reason, and that a row stripped of both is caught. */
const BR_TRADES = [
  { trade: 'bakers', keys: ['br_bldg_bakehouse'] },
  { trade: 'butchers', keys: ['br_bldg_butcher'] },
  { trade: 'weavers and dyers', keys: ['br_bldg_weaver', 'br_port_mavs_room_front'], note: 'the weaving house and the dye works; Mav\'s silk rooms' },
  { trade: 'brewers', keys: ['br_bldg_mead_hall'], note: 'the brewhouse (variant 2)' },
  { trade: 'tanners', keys: ['br_bldg_tannery'] },
  { trade: 'shipwrights and boatbuilders', keys: ['br_bldg_canoe_shed'], note: 'the double-hulled voyaging canoe with its flyer\'s perch (LORE 6.6)' },
  { trade: 'innkeepers and grooms', keys: ['br_bldg_riders_inn'], note: 'an inn round a stable yard: the grooms keep the guests\' mounts' },
  { trade: 'town guard', keys: ['br_bldg_watch_tower', 'br_port_girder_palisade'] },
  { trade: 'coast guard', keys: ['br_bldg_canoe_shed', 'br_bldg_rookery_tower'], note: 'the war-canoe shed (variant 2); the Wings patrol the shore from the air' },
  { trade: 'temple priests and servants', keys: ['br_bldg_temple'], note: 'the hall of the five nature shrines' },
  { trade: 'shrine keepers', keys: ['br_bldg_temple', 'br_port_mavs_shrine'] },
  { trade: 'shopkeepers and assistants', keys: ['br_bldg_shophouse'] },
  { trade: 'smiths and craftsmen', keys: ['br_bldg_smithy', 'br_bldg_potter', 'br_bldg_ropewalk'] },
  { trade: 'innkeepers and servers', keys: ['br_bldg_mead_hall'] },
  { trade: 'porters and warehousemen', keys: ['br_bldg_storehouse'], note: 'the raised store and the tack and feed store' },
  { trade: 'industrial workers', keys: ['br_bldg_hauling_yard', 'br_bldg_ropewalk'], note: 'no works with engines: the beast-hauled timber and stone yards' },
  { trade: 'power-house stokers and engineers', na: 'the Beast Riders have no electricity: no power house, no stokers; what turns is turned by a beast or by water (the mills, the whims)' },
  { trade: 'household service', keys: ['br_bldg_great_house', 'br_bldg_chief_compound'] },
  { trade: 'soldiers', keys: ['br_bldg_barracks'], note: 'a Wing\'s barracks, named by its Wing (LORE 6.6)' },
  { trade: 'teachers and scholars', keys: ['br_bldg_school'], note: 'the lore house and the riding school' },
  { trade: 'guild officers and clerks', keys: ['br_port_girder_hall', 'br_port_mavs_council'], note: 'no guilds: the tribes\' councils and their tally-keepers sit in the assembly halls' },
  { trade: 'customs officers and clerks', keys: ['br_bldg_toll_house'], note: 'the toll house at the gate or the stair foot, where strangers\' loads are tallied' },
  { trade: 'healers and nurses', keys: ['br_bldg_healer'] },
  { trade: 'priests and undertakers', keys: ['br_bldg_temple'], note: 'the funerary court with its skull poles and pyre stone (variant 2)' },
  { trade: 'lighthouse keepers', keys: ['br_bldg_beacon_tower'], note: 'a fire beacon and a signal mast: wood and oil, no lamp-house' },
  { trade: 'dockers and stevedores', keys: ['br_bldg_river_landing'], note: 'the cargo landing, its crane worked by a beast' },
  { trade: 'river bargemen and quay hands', keys: ['br_bldg_river_landing'] },
  { trade: 'fishers', keys: ['br_bldg_river_landing'], note: 'the fishers\' landing (variant 2)' },
  { trade: 'market traders', keys: ['br_bldg_market_hall', 'br_port_girder_stall'] },
  { trade: 'farmhands and ploughmen', keys: ['br_bldg_farmhouse'], note: 'the fields are ploughed by the ground tribes\' beasts' },
  { trade: 'chinampa growers', keys: ['br_bldg_farmhouse'], note: 'the paddy farm (variant 3): the paddies by the spring' },
  { trade: 'orchardmen', keys: ['br_bldg_farmhouse'], note: 'the farmhouses of the orchard terraces' },
  { trade: 'miners', keys: ['br_bldg_mine_head'], note: 'the adit and the shaft with its beast whim' },
  { trade: 'quarrymen and masons', keys: ['br_bldg_quarry'] },
  { trade: 'granary keepers and millers', keys: ['br_bldg_granary', 'br_bldg_mill'], note: 'the mills turn by beast or by water' },
  { trade: 'beetle herders', keys: ['br_bldg_beetle_pen'], note: 'the Staghorn tribe\'s beetles (LORE 6.6)' },
  { trade: 'dairymen', keys: ['br_bldg_farmhouse', 'br_bldg_great_byre'], note: 'the farms\' milk stock in the beast shed; the mammoth cows in the great byre' },
  { trade: 'swineherds and duck keepers', keys: ['br_bldg_farmhouse'], note: 'the farmhouses\' sties and coops' },
  { trade: 'mushroom growers', keys: ['br_bldg_fungus_house'], note: 'the dark-grown fungus (kits/crops: a works, not a climate), the glow fungus for lamps among it' },
  { trade: 'envoys and embassy staff', keys: ['br_bldg_chief_compound', 'br_bldg_riders_inn'], note: 'envoys are lodged in a chief\'s guest wing, their train at the inn' },
  { trade: 'ferrymen', keys: ['br_bldg_river_landing'], note: 'the ferry landing (variant 3): a raft on a rope' },
  { trade: 'elephant bug handlers and station hands', keys: ['br_bldg_beast_stage'], note: 'no elephant bugs, but the riders run carrier beasts on the forest roads: the mounting stage is their station' },
  { trade: 'monks and lay brothers', keys: ['br_bldg_temple'], note: 'the keepers of the Green Silence live in the temple\'s precinct' },
  { trade: 'palace and canton staffs', keys: ['br_bldg_chief_compound', 'br_port_girder_hall', 'br_port_mavs_council'] }
];

/* ================================ helpers */
/* a wall run a -> b (thickness t) from y up h, with openings gaps [{at (from a, metres), w, h}]: the wall stands over
   each opening from y + h' up */
function brtRun(F, ax, az, bx, bz, y, h, t, col, fam, gaps) {
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, ry = Math.atan2(-uz, ux);
  const seg = function (a, b, y0, hh) { if (b - a < 0.04 || hh < 0.04) return; const m = (a + b) / 2; F.box(ax + ux * m, y0, az + uz * m, b - a, hh, t, ry, col, fam); };
  let s = 0;
  (gaps || []).map(function (g) { return [g.at - g.w / 2, g.at + g.w / 2, g.h]; }).sort(function (p, q) { return p[0] - q[0]; })
    .forEach(function (c) { seg(s, c[0], y, h); seg(c[0], c[1], y + c[2], h - c[2]); s = c[1]; });
  seg(s, L, y, h);
}
/* a side of the rectangle x0..x1, z0..z1: its run a -> b and the inward normal */
function brtSide(side, x0, x1, z0, z1) {
  return side === 'f' ? { a: [x0, z1], b: [x1, z1], n: [0, -1] } : side === 'b' ? { a: [x0, z0], b: [x1, z0], n: [0, 1] } :
    side === 'l' ? { a: [x0, z0], b: [x0, z1], n: [1, 0] } : { a: [x1, z0], b: [x1, z1], n: [-1, 0] };
}
/* four walls round x0..x1, z0..z1 from y up h: doors [{side f|b|l|r, at (from the side's middle, along +x or +z), w, h}],
   each framed in red with its plank leaf standing open, swung in; o.sides: the sides to draw (default 'fblr'), o.t the
   thickness, o.fam the family */
function brtWalls(F, x0, x1, z0, z1, y, h, col, doors, o) {
  o = o || {};
  const t = o.t == null ? 0.2 : o.t, fam = o.fam == null ? BRM_STAVE : o.fam, sides = o.sides == null ? 'fblr' : o.sides;
  for (const sd of sides) {
    const S = brtSide(sd, x0, x1, z0, z1), L = Math.hypot(S.b[0] - S.a[0], S.b[1] - S.a[1]);
    const ux = (S.b[0] - S.a[0]) / L, uz = (S.b[1] - S.a[1]) / L, ry = Math.atan2(-uz, ux);
    const ds = (doors || []).filter(function (d) { return d.side === sd; }).map(function (d) { return { at: L / 2 + d.at, w: d.w == null ? 1.3 : d.w, h: d.h == null ? 2.1 : d.h }; });
    brtRun(F, S.a[0], S.a[1], S.b[0], S.b[1], y, h, t, col, fam, ds);
    ds.forEach(function (d) {
      const px = S.a[0] + ux * d.at, pz = S.a[1] + uz * d.at;
      for (const e of [-1, 1]) F.box(px + ux * e * (d.w / 2 + 0.08), y, pz + uz * e * (d.w / 2 + 0.08), 0.18, d.h + 0.06, t + 0.12, ry, BRM.red, BRM_TIMBER);
      F.box(px, y + d.h, pz, d.w + 0.5, 0.24, t + 0.16, ry, BRM.red, BRM_TIMBER);
      F.box(px, y + d.h + 0.24, pz, d.w + 0.7, 0.08, t + 0.22, ry, BRM.gilt, BRM_TIMBER);
      /* the leaf, hinged at the gap's near end and swung 70 degrees in */
      const a = 1.22, hx = px - ux * d.w / 2 + S.n[0] * t / 2, hz = pz - uz * d.w / 2 + S.n[1] * t / 2;
      const dx = ux * Math.cos(a) + S.n[0] * Math.sin(a), dz = uz * Math.cos(a) + S.n[1] * Math.sin(a), lw = d.w * 0.92;
      F.box(hx + dx * lw / 2, y + 0.02, hz + dz * lw / 2, lw, d.h - 0.06, 0.07, Math.atan2(-dz, dx), o.leaf == null ? BRM.stave[2] : o.leaf, BRM_STAVE);
    });
  }
}
/* a window on side f|b|l|r of x0..x1, z0..z1 at `at` from the side's middle, centred at height yc (brmWin, set just
   proud of the wall) */
function brtWin(F, side, x0, x1, z0, z1, at, yc, w, h) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (side === 'f') brmWin(F, cx + at, yc, z1 + 0.07, w, h, false);
  else if (side === 'b') brmWin(F, cx + at, yc, z0 - 0.07, w, h, false);
  else if (side === 'l') brmWin(F, x0 - 0.07, yc, cz + at, w, h, true);
  else brmWin(F, x1 + 0.07, yc, cz + at, w, h, true);
}
/* the footing: a stone plinth 0.4 m past the walls up to y0 - 0.06, a plank floor inside them to y0 */
function brtBase(F, x0, x1, z0, z1, y0, o) {
  o = o || {};
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, p = o.pad == null ? 0.4 : o.pad;
  F.box(cx, 0, cz, x1 - x0 + 2 * p, y0 - 0.06, z1 - z0 + 2 * p, 0, o.rock == null ? BRM.rock : o.rock, 'stone');
  F.box(cx, y0 - 0.06, cz, x1 - x0 - 0.1, 0.06, z1 - z0 - 0.1, 0, o.floor == null ? BRM.plank : o.floor, o.floorFam == null ? 'wood' : o.floorFam);
}
/* Girder's raking struts down the long walls (the stave longhouse): n per side, foot 1 m out */
function brtStruts(F, x0, x1, z0, z1, y, along, n) {
  for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : (i + 0.5) / n;
    if (along) { const x = x0 + (x1 - x0) * t, z = s < 0 ? z0 : z1; F.beam(x, 0, z + s * 1.0, x, y, z + s * 0.08, 0.22, 0.22, BRM.timber[2], BRM_TIMBER); }
    else { const z = z0 + (z1 - z0) * t, x = s < 0 ? x0 : x1; F.beam(x + s * 1.0, 0, z, x + s * 0.08, y, z, 0.22, 0.22, BRM.timber[2], BRM_TIMBER); }
  }
}
/* a smoke hood on a ridge (the longhouse's): a stave box and its little shingle cap */
function brtSmoke(F, x, y, z, along) {
  F.box(x, y - 0.3, z, along ? 1.6 : 0.9, 0.6, along ? 0.9 : 1.6, 0, BRM.stave[1], BRM_STAVE);
  F.pyrRoof(x, y + 0.3, z, along ? 2.2 : 1.4, 0.6, along ? 1.4 : 2.2, 0, BRM.shingle[3], BRM_SHINGLE);
}
/* the red eave band round a roof's foot, W x D centred (cx, cz) at y */
function brtBand(F, cx, cz, y, W, D) {
  const e = [[-W / 2, -D / 2, W / 2, -D / 2], [-W / 2, D / 2, W / 2, D / 2], [-W / 2, -D / 2, -W / 2, D / 2], [W / 2, -D / 2, W / 2, D / 2]];
  for (const q of e) F.beam(cx + q[0], y - 0.2, cz + q[1], cx + q[2], y - 0.2, cz + q[3], 0.26, 0.34, BRM.red, BRM_TIMBER);
}
/* the joglo roof (Girder's 55-arch.js; the byre's): a shallow hipped skirt of thatch, then a steep shingle crown with
   beast heads; returns the ridge's height */
function brtJoglo(F, cx, cz, y, W, D, o) {
  o = o || {};
  F.hipRoof(cx, y, cz, W, 1.5, D, 0, o.skirt == null ? shade(BRM.thatch[1], -0.3) : o.skirt, 'thatch');
  brtBand(F, cx, cz, y, W, D);
  const cw = W * 0.56, cd = D * 0.5, ch = o.crownH == null ? Math.min(cw, cd) * 0.62 : o.crownH;
  brmHip(F, cx, cz, y + 1.2, cw, ch, cd, o.crown == null ? BRM.shingle[1] : o.crown, o.fin == null ? 1.1 : o.fin);
  return y + 1.2 + ch;
}
/* a thatch hip with the red band (the sheds' roof) */
function brtThatch(F, cx, cz, y, W, h, D, col) {
  F.hipRoof(cx, y, cz, W, h, D, 0, col == null ? BRM.thatch[0] : col, 'thatch');
  brtBand(F, cx, cz, y, W, D);
}
/* a mono-pitch roof x0..x1 from (zb, yb) down to (zf, yf): one shingle slab, a red band along its eave, verdigris
   ribs up its ends */
function brtShed(F, x0, x1, zb, zf, yb, yf, col, fam) {
  const cx = (x0 + x1) / 2;
  F.beam(cx, yb, zb, cx, yf, zf, x1 - x0, 0.2, col == null ? BRM.shingle[1] : col, fam == null ? BRM_SHINGLE : fam);
  F.beam(x0, yf - 0.12, zf, x1, yf - 0.12, zf, 0.24, 0.3, BRM.red, BRM_TIMBER);
  for (const x of [x0, x1]) F.beam(x, yb + 0.1, zb, x, yf + 0.1, zf, 0.2, 0.2, BRM.verd, BRM_TIMBER);
}
/* a row of carved posts carrying a beam: from (ax, az) to (bx, bz), n posts, h tall */
function brtPostRow(F, ax, az, bx, bz, y, h, n, s) {
  for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); brmPost(F, ax + (bx - ax) * t, y, az + (bz - az) * t, h, s == null ? 0.28 : s, i % 2 ? BRM.deep : BRM.red, BRM.gilt); }
  F.beam(ax, y + h - 0.05, az, bx, y + h - 0.05, bz, 0.26, 0.3, BRM.red, BRM_TIMBER);
}
/* a beast whim (the riders' engine): a trodden ring of radius r round a pivot, the upright and its crown wheel under a
   shingle cap, a sweep arm out to the yoke where the beast is put to; o.a the arm's angle, o.to [x, y, z] a drive
   shaft out to the works */
function brtWhim(F, x, z, r, o) {
  o = o || {};
  const a = o.a == null ? 0.6 : o.a;
  F.cyl(x, 0, z, r + 1.3, 0.04, 0, BRM.mud, 'yard/stone');
  F.cyl(x, 0.04, z, 0.9, 0.5, 0, BRM.rock, 'stone');
  F.cyl(x, 0.5, z, 0.3, 3.0, 0, BRM.timber[2], BRM_TIMBER);
  F.frustum(x, 2.7, z, 1.15, 1.15, 0.4, 0, BRM.timber[1], BRM_TIMBER, 8);
  for (let i = 0; i < 8; i++) { const b = i / 8 * Math.PI * 2; F.box(x + Math.cos(b) * 1.15, 2.75, z + Math.sin(b) * 1.15, 0.16, 0.3, 0.16, -b, BRM.timber[2], BRM_TIMBER); }
  F.cone(x, 3.45, z, 1.5, 1.1, 0, BRM.shingle[3], BRM_SHINGLE);
  const ex = x + Math.cos(a) * r, ez = z + Math.sin(a) * r;
  F.beam(x, 2.0, z, ex, 1.5, ez, 0.24, 0.28, BRM.timber[2], BRM_TIMBER);
  F.beam(x, 2.0, z, x - Math.cos(a) * 1.6, 1.9, z - Math.sin(a) * 1.6, 0.24, 0.28, BRM.timber[2], BRM_TIMBER);
  F.box(ex, 1.0, ez, 0.5, 0.5, 1.5, -a, BRM.red, BRM_TIMBER);
  if (o.to) F.rod(x, 2.9, z, o.to[0], o.to[1], o.to[2], 0.11, BRM.timber[2], BRM_TIMBER);
}
/* a domed clay oven facing +z (the bakers', the potters' smaller): a clay block, the dome, a dark mouth with its
   embers, a flue at the back */
function brtOven(F, x, y, z, s) {
  F.box(x, y, z, 2.0 * s, 0.8 * s, 2.0 * s, 0, BRT.clayD, 'clay');
  F.dome(x, y + 0.8 * s, z, 0.92 * s, 0.85 * s, 0, BRT.clay, 'clay');
  F.box(x, y + 0.8 * s, z + 0.82 * s, 0.6 * s, 0.45 * s, 0.2, 0, BRT.charcoal, 'stone');
  F.box(x, y + 0.82 * s, z + 0.7 * s, 0.45 * s, 0.14 * s, 0.2, 0, BRT_GLOW.ember, 'glow');
  F.cyl(x, y + 1.2 * s, z - 0.55 * s, 0.16 * s, 0.9 * s, 0, BRT.clayD, 'clay');
}
/* a hoop-bound vat (brewer, dyer, tanner): r, h, its liquor's colour on top */
function brtVat(F, x, y, z, r, h, top) {
  F.cyl(x, y, z, r, h, 0, BRM.timber[1], BRM_TIMBER);
  for (const t of [0.18, 0.78]) F.cyl(x, y + h * t, z, r + 0.03, 0.08, 0, BRT.iron, 'metal');
  F.cyl(x, y + h - 0.06, z, r - 0.06, 0.04, 0, top, 'cloth');
}
/* shear legs (the hoist of the slaughter yard, the quarry, the landing): two raked legs, a rope and its block */
function brtShear(F, x, z, h, sp, ry, hang) {
  const c = Math.cos(ry), s = Math.sin(ry), tx = x + s * 1.2, tz = z + c * 1.2;
  for (const e of [-1, 1]) F.rod(x + c * e * sp, 0, z - s * e * sp, tx, h, tz, 0.12, BRM.timber[2], 'bark');
  F.rod(x - s * 1.0, 0, z - c * 1.0, tx, h, tz, 0.09, BRM.timber[2], 'bark');
  F.rod(tx, h - 0.1, tz, tx, hang, tz, 0.03, BRM.rope, 'rope');
  F.box(tx, hang - 0.3, tz, 0.25, 0.3, 0.2, ry, BRT.iron, 'metal');
}
/* the catalog's hanging lantern (oil) hung from a ceiling or beam at height y */
function brtLamp(F, x, y, z) { F.furn('br_h_hanging_lantern', x, y - 2.3, z, 0, { v: 1, setting: 'indoor' }); }

/* ================================ the bake house */
ASSET({
  key: 'br_bldg_bakehouse', name: 'Bake house (bakers)', culture: 'beast-rider', role: 'bakery',
  family: 'trade', types: ['shop', 'industry'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 18.5, d: 13, h: 10.5, variants: 2, variantNames: ['the bake house and its oven shed', 'the bakers\' hall, three ovens'],
  variantDims: [{ w: 16.5, d: 10.5, h: 8.5 }, { w: 18.5, d: 13, h: 10.5 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4;
    if (F.variant === 1) {
      /* the bakers' hall: three ovens along the back inside, their flues through the roof; an open pendopo front
         where the bread is sold */
      const x0 = -7, x1 = 7, z0 = -5.5, z1 = 2.5, wh = 2.8;
      brtBase(F, x0, x1, z0, z1 + 3.0, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: -3.5, w: 1.6 }, { side: 'f', at: 3.5, w: 1.6 }]);
      for (const s of [-1, 1]) brtWin(F, s < 0 ? 'l' : 'r', x0, x1, z0, z1, 0, y0 + 1.7, 0.9, 0.7);
      brtWin(F, 'f', x0, x1, z0, z1, 0, y0 + 1.7, 1.4, 0.8);
      brtPostRow(F, x0 + 0.3, z1 + 2.7, x1 - 0.3, z1 + 2.7, y0, wh + 0.1, 5);
      for (let i = 0; i < 3; i++) brtOven(F, -4.4 + i * 4.4, y0, z0 + 1.4, 1.0);
      const top = brtJoglo(F, 0, -0.1, y0 + wh + 0.4, 17.4, 12.4, {});
      for (let i = 0; i < 3; i++) F.cyl(-4.4 + i * 4.4, y0 + 2.0, z0 + 0.85, 0.22, top - y0 - 2.6, 0, BRT.clayD, 'clay');
      F.furn('br_table', 0, y0, -0.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_sack_pile', -6.0, y0, 1.6, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_sack_pile', 6.0, y0, 1.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_workshop_shelves', -6.55, y0, -1.2, Math.PI / 2, { v: 0, setting: 'indoor' });
      F.furn('br_h_work_counter', -3.5, y0, z1 + 1.2, 0, { v: 1 });
      F.furn('br_h_work_counter', 3.5, y0, z1 + 1.2, 0, { v: 0 });
      F.furn('br_h_stall_goods', -3.5, y0 + 1.08, z1 + 1.2, 0, { v: 0 });
      F.furn('br_h_stall_goods', 3.5, y0 + 1.08, z1 + 1.2, 0, { v: 2 });
      F.furn('br_woodpile', 8.6, 0, -3.0, Math.PI / 2, { v: 0 });
      brtLamp(F, 0, y0 + wh + 0.05, 0.8);
      return;
    }
    /* the bake house: a small stave house (the dough room, the flour) and an oven shed beside it under a lean-to */
    const x0 = -7, x1 = 1.5, z0 = -4.5, z1 = 1.5, wh = 2.4;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[1], [{ side: 'f', at: 1.6, w: 1.3 }]);
    brtWin(F, 'f', x0, x1, z0, z1, -2.0, y0 + 1.6, 1.0, 0.7);
    brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.6, 0.8, 0.6);
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 4.0, z1 - z0 + 1.6, BRM.shingle[0], 0.9);
    brtSmoke(F, (x0 + x1) / 2, y0 + wh + 4.0, (z0 + z1) / 2, true);
    F.furn('br_h_kitchen_hearth', -4.5, y0, z0 + 0.7, 0, { v: 0, setting: 'indoor' });
    F.furn('br_table', -3.4, y0, -0.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_sack_pile', 0.4, y0, -3.5, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_workshop_shelves', -6.55, y0, -2.6, Math.PI / 2, { v: 0, setting: 'indoor' });
    /* the oven shed: two ovens under a shingle lean-to on red posts, the wood stacked behind */
    const sx0 = 2.0, sx1 = 7.6, sz0 = -4.5, sz1 = 1.5;
    F.box((sx0 + sx1) / 2, 0, (sz0 + sz1) / 2, sx1 - sx0 + 0.4, 0.3, sz1 - sz0 + 0.4, 0, shade(BRM.rock, -0.06), 'stone');
    for (const x of [sx0 + 0.3, sx1 - 0.3]) { brmPost(F, x, 0.3, sz1 - 0.2, 2.6, 0.26, BRM.red, BRM.gilt); brmPost(F, x, 0.3, sz0 + 0.2, 3.8, 0.26, BRM.deep, BRM.gilt); }
    brtShed(F, sx0 - 0.2, sx1 + 0.3, sz0 - 0.4, sz1 + 0.8, 0.3 + 4.0, 0.3 + 2.6, BRM.shingle[2]);
    brtOven(F, 3.5, 0.3, -2.4, 0.95); brtOven(F, 6.2, 0.3, -2.4, 0.95);
    F.furn('br_woodpile', 4.8, 0, -5.8, 0, { v: 0 });
    F.furn('br_h_work_counter', -4.0, 0, 3.2, 0, { v: 0 });
    F.furn('br_h_stall_goods', -4.0, 1.08, 3.2, 0, { v: 1 });
    F.furn('br_h_water_butt', 0.6, 0, 3.0, 0, { v: 0 });
    F.furn('br_h_hanging_lantern', 4.8, 0.3 + 2.4 - 2.3, 1.0, 0, { v: 1 });
  }
});

/* ================================ the butcher's */
ASSET({
  key: 'br_bldg_butcher', name: 'Butcher\'s and smokehouse (butchers)', culture: 'beast-rider', role: 'butcher',
  family: 'trade', types: ['shop', 'industry'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 21.5, d: 15.5, h: 8, variants: 2, variantNames: ['the shop and smokehouse', 'the slaughter yard and its hoist'],
  variantDims: [{ w: 14.5, d: 9, h: 8 }, { w: 21.5, d: 15.5, h: 8 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4, v1 = F.variant === 1, ox = v1 ? -3.5 : 0, oz = v1 ? -2.5 : 0;
    /* the shop: open to the street over a counter, the meat rail under the eave, the block and the salt barrels */
    const x0 = ox - 5.5, x1 = ox + 2.5, z0 = oz - 3.5, z1 = oz + 2.5, wh = 2.5;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'l', at: -1.0, w: 1.2 }], { sides: 'blr' });
    for (const x of [x0 + 0.15, x1 - 0.15]) brmPost(F, x, y0, z1, wh + 0.2, 0.26, BRM.red, BRM.gilt);
    F.box((x0 + x1) / 2, y0 + wh - 0.05, z1, x1 - x0 + 0.3, 0.26, 0.26, 0, BRM.red, BRM_TIMBER);
    F.furn('br_h_work_counter', ox - 1.5, y0, z1 - 0.65, 0, { v: 0, setting: 'indoor' });
    F.beam(x0 + 0.5, y0 + wh - 0.4, z1 + 0.5, x1 - 0.5, y0 + wh - 0.4, z1 + 0.5, 0.1, 0.1, BRT.iron, 'metal');
    for (let i = 0; i < 5; i++) { const x = x0 + 1.1 + i * (x1 - x0 - 2.2) / 4; F.rod(x, y0 + wh - 0.9, z1 + 0.5, x, y0 + wh - 0.4, z1 + 0.5, 0.02, BRT.iron, 'metal'); F.ell(x, y0 + wh - 1.25, z1 + 0.5, 0.22, 0.42, 0.16, 0, i % 2 ? BRT.meat : shade(BRT.meat, 0.12), 'hide'); }
    F.furn('br_table', ox - 1.5, y0, oz - 1.0, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_barrel_cluster', x1 - 1.2, y0, z0 + 1.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_tool_wall', ox - 1.5, y0, z0 + 0.3, 0, { v: 0, setting: 'indoor' });
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2 + 0.4, y0 + wh + 0.1, x1 - x0 + 1.6, 3.6, z1 - z0 + 2.4, BRM.shingle[1], 0.8);
    /* the smokehouse: a tight stave hut, no window, a smoke hood under its pyramid, the racks inside */
    const hx = ox + 5.0, hz = oz - 1.0, hs = 2.0;
    brtBase(F, hx - hs, hx + hs, hz - hs, hz + hs, 0.3, { pad: 0.2 });
    brtWalls(F, hx - hs, hx + hs, hz - hs, hz + hs, 0.3, 2.3, BRM.stave[1], [{ side: 'f', at: 0, w: 1.0, h: 1.8 }], { leaf: BRM.stave[0] });
    brmHip(F, hx, hz, 2.6, 2 * hs + 1.0, 2.8, 2 * hs + 1.0, BRM.shingle[3], 0);
    brtSmoke(F, hx, 2.6 + 2.8, hz, false);
    F.furn('br_drying_rack', hx, 0.3, hz - 0.8, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_fire_pit', hx, 0.3, hz + 0.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_woodpile', hx + 0.2, 0, hz + hs + 1.5, 0, { v: 0 });
    if (!v1) return;
    /* the slaughter yard behind and beside: a great beast is brought in through the gate, hung from the shear legs and
       cut on the block; the trough, the hide frame */
    const gx0 = -10.5, gx1 = 10.5, gz0 = -8.0, gz1 = 8.0;
    F.box(0, 0, (gz0 + gz1) / 2 + 2.5, gx1 - gx0 - 0.4, 0.04, 9.0, 0, BRM.mud, 'yard/stone');
    brmFence(F, gx0, gz0 + 4, gx0, gz1, 1.4); brmFence(F, gx1, gz0 + 4, gx1, gz1, 1.4);
    brmFence(F, gx0, gz1, -2.2, gz1, 1.4); brmFence(F, 2.2, gz1, gx1, gz1, 1.4);
    for (const s of [-1, 1]) brmPost(F, s * 2.2, 0, gz1, 2.6, 0.26, BRM.red, BRM.gilt);
    brtShear(F, 5.0, 4.5, 6.2, 1.8, 0, 2.6);
    F.ell(5.0, 1.65, 5.7, 0.7, 1.0, 0.5, 0, BRT.meat, 'hide');
    F.box(5.0, 0.04, 5.7, 3.0, 0.08, 2.4, 0, shade(BRM.rock, -0.15), 'stone');
    F.furn('br_h_trough', -5.5, 0.04, 5.5, 0, { v: 1 });
    F.furn('br_h_hide_frame', 8.6, 0.04, 2.6, -Math.PI / 2, { v: 0 });
    F.furn('br_h_hitching_rail', -5.5, 0.04, 2.8, 0, { v: 0 });
    F.furn('br_h_water_butt', 9.2, 0.04, 6.6, 0, { v: 1 });
  }
});

/* ================================ the mead hall and the brewhouse */
ASSET({
  key: 'br_bldg_mead_hall', name: 'Mead hall and brewhouse (brewers, innkeepers)', culture: 'beast-rider', job: 'brewing',
  family: 'trade', types: ['tavern', 'industry'], districts: ['ridertown'], wealth: [0.3, 0.8],
  w: 21, d: 17, h: 11.5, variants: 2, variantNames: ['the mead hall', 'the brewhouse'],
  variantDims: [{ w: 21, d: 17, h: 11.5 }, { w: 17.5, d: 10.5, h: 10 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.45;
    if (F.variant === 1) {
      /* the brewhouse: a stave hall with a louvre on the ridge, the mash tun over its fire, three vats, the casks */
      const x0 = -6.5, x1 = 6.5, z0 = -4.5, z1 = 3.5, wh = 3.0;
      brtBase(F, x0, x1, z0, z1, y0);
      brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[2], [{ side: 'f', at: 3.2, w: 2.2, h: 2.4 }]);
      brtWin(F, 'f', x0, x1, z0, z1, -2.5, y0 + 1.9, 1.0, 0.8);
      for (const s of ['l', 'r']) brtWin(F, s, x0, x1, z0, z1, 0, y0 + 1.9, 0.9, 0.7);
      brtStruts(F, x0, x1, z0, z1, y0 + wh, true, 3);
      brmHip(F, 0, -0.5, y0 + wh, x1 - x0 + 1.8, 4.6, z1 - z0 + 1.8, BRM.shingle[1], 1.1);
      brtSmoke(F, 0, y0 + wh + 4.6, -0.5, true);
      F.box(-4.0, y0, -2.6, 2.4, 0.5, 2.4, 0, BRM.rock, 'stone');
      F.box(-4.0, y0 + 0.1, -1.38, 0.8, 0.3, 0.08, 0, BRT_GLOW.ember, 'glow');
      brtVat(F, -4.0, y0 + 0.5, -2.6, 0.95, 1.1, BRT.brine);
      for (let i = 0; i < 3; i++) brtVat(F, -0.6 + i * 2.3, y0, -3.0, 0.85, 1.5, i === 1 ? BRT.saffron : BRT.brine);
      F.furn('br_h_barrel_cluster', 4.6, y0, 1.6, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_barrel_cluster', -4.8, y0, 1.7, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_sack_pile', -1.0, y0, 2.4, 0, { v: 1, setting: 'indoor' });
      F.furn('br_h_workshop_shelves', 5.9, y0, -2.6, -Math.PI / 2, { v: 0, setting: 'indoor' });
      F.furn('br_h_water_butt', -7.9, 0, 2.0, Math.PI / 2, { v: 0 });
      F.furn('br_woodpile', 7.9, 0, -2.0, Math.PI / 2, { v: 0 });
      brtLamp(F, 0, y0 + wh, 0);
      return;
    }
    /* the mead hall: a long stave hall under a joglo roof whose skirt covers the veranda; the bar at the back, the
       hearth in the middle, long tables, benches on the veranda */
    const x0 = -8, x1 = 8, z0 = -5, z1 = 3.5, wh = 2.9;
    brtBase(F, x0, x1, z0, z1 + 3.2, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 0, w: 1.8, h: 2.3 }, { side: 'l', at: -1.5, w: 1.1 }]);
    for (const a of [-5, -2.6, 2.6, 5]) brtWin(F, 'f', x0, x1, z0, z1, a, y0 + 1.7, 0.9, 0.8);
    brtWin(F, 'r', x0, x1, z0, z1, 0, y0 + 1.7, 0.9, 0.8);
    brtPostRow(F, x0 + 0.3, z1 + 2.9, x1 - 0.3, z1 + 2.9, y0, wh + 0.1, 6);
    brtJoglo(F, 0, 0.2, y0 + wh + 0.4, 20.4, 15.0, { fin: 1.3 });
    F.furn('br_tavern_bar', 4.4, y0, z0 + 1.3, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_barrel_cluster', 7.0, y0, -3.7, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_fire_pit', 0, y0, -0.7, 0, { v: 1, setting: 'indoor' });
    F.furn('br_table', -4.4, y0, -2.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_table', -4.4, y0, 1.4, 0, { v: 1, setting: 'indoor' });
    F.furn('br_bench', 3.6, y0, 1.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_bench', 3.6, y0, 2.6, Math.PI, { v: 0, setting: 'indoor' });
    F.furn('br_bench', -4.5, y0, z1 + 1.4, 0, { v: 0 });
    F.furn('br_bench', 4.5, y0, z1 + 1.4, 0, { v: 0 });
    F.furn('br_h_hitching_rail', -7.0, 0, z1 + 5.0, 0, { v: 1 });
    brtLamp(F, -4.4, y0 + wh, -0.5); brtLamp(F, 3.0, y0 + wh, -0.5);
    F.furn('br_h_hanging_lantern', 0, y0 + wh - 2.3, z1 + 2.6, 0, { v: 2 });
  }
});

/* ================================ the tannery */
ASSET({
  key: 'br_bldg_tannery', name: 'Tannery (tanners)', culture: 'beast-rider', job: 'tanning',
  family: 'industrial', types: ['industry'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 26.5, d: 12.5, h: 6.5, variants: 2, variantNames: ['the pit shed and the frames', 'with the beast-turned bark mill'],
  variantDims: [{ w: 16, d: 12.5, h: 6.5 }, { w: 26.5, d: 12.5, h: 6.5 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, ox = v1 ? -4.5 : 0;
    /* the pit shed: thatch on six log posts over two rows of lined pits, the scraping beam at one end */
    const x0 = ox - 6, x1 = ox + 6, z0 = -5, z1 = 2;
    F.box(ox, 0, (z0 + z1) / 2, x1 - x0 + 0.6, 0.12, z1 - z0 + 0.6, 0, shade(BRM.rock, -0.1), 'stone');
    for (let i = 0; i < 3; i++) for (const z of [z0 + 0.2, z1 - 0.2]) { const x = x0 + 0.2 + i * (x1 - x0 - 0.4) / 2; F.cyl(x, 0, z, 0.2, 3.0, 0, BRM.timber[2], 'bark'); }
    for (const z of [z0 + 0.2, z1 - 0.2]) F.beam(x0, 2.95, z, x1, 2.95, z, 0.22, 0.26, BRM.timber[2], BRM_TIMBER);
    brtThatch(F, ox, (z0 + z1) / 2, 3.1, x1 - x0 + 2.4, 3.2, z1 - z0 + 2.4, BRM.thatch[1]);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      const x = x0 + 1.6 + i * 2.95, z = z0 + 1.5 + j * 2.8;
      F.box(x, 0, z, 2.0, 0.5, 2.0, 0, BRM.timber[3], BRM_TIMBER);
      F.box(x, 0.32, z, 1.7, 0.16, 1.7, 0, (i + j) % 2 ? BRT.brine : shade(BRT.brine, -0.25), 'cloth');
    }
    F.rod(x1 - 1.0, 0.95, z1 + 1.0, x1 - 2.4, 0.2, z1 + 1.0, 0.18, BRM.timber[1], 'bark');
    F.rod(x1 - 1.1, 0, z1 + 0.8, x1 - 1.1, 0.95, z1 + 0.8, 0.07, BRM.timber[2], BRM_TIMBER);
    F.furn('br_h_hide_frame', ox - 4.5, 0, 5.5, 0, { v: 0 });
    F.furn('br_h_hide_frame', ox - 1.5, 0, 5.5, 0, { v: 0 });
    F.furn('br_h_hide_frame', ox + 1.5, 0, 5.5, 0, { v: 0 });
    F.furn('br_h_barrel_cluster', ox + 4.6, 0, 5.2, 0, { v: 0 });
    F.furn('br_h_sack_pile', x0 - 1.0, 0, -1.0, 0, { v: 1 });
    F.furn('br_h_hung_hide', x0 + 0.3, 0.12, -3.0, Math.PI / 2, { v: 1 });
    F.furn('br_h_water_butt', x0 - 1.2, 0, 1.8, 0, { v: 1 });
    if (!v1) return;
    /* the bark mill: a beast walks the ring, the sweep arm rolls an edge-runner stone round the bark bed */
    const mx = 8.5, mz = -1.5;
    brtWhim(F, mx, mz, 3.6, { a: 0.4 });
    F.cyl(mx, 0.04, mz, 2.2, 0.5, 0, BRM.rock, 'stone');
    F.cyl(mx, 0.5, mz, 1.9, 0.05, 0, BRM.mud, 'cloth');
    const ra = 0.4 + Math.PI;
    F.ell(mx + Math.cos(ra) * 1.25, 1.35, mz + Math.sin(ra) * 1.25, 0.82, 0.82, 0.3, -ra + Math.PI / 2, shade(BRM.rock, 0.1), 'stone');
    F.rod(mx, 1.35, mz, mx + Math.cos(ra) * 1.6, 1.35, mz + Math.sin(ra) * 1.6, 0.08, BRM.timber[2], BRM_TIMBER);
    F.furn('br_h_sack_pile', mx - 1.0, 0, mz + 4.8, 0, { v: 0 });
    F.furn('br_h_trough', mx + 3.4, 0, mz + 4.9, 0, { v: 0 });
  }
});

/* ================================ the weaving house and the dye works */
ASSET({
  key: 'br_bldg_weaver', name: 'Weaving house and dye works (weavers and dyers)', culture: 'beast-rider', job: 'weaving',
  family: 'trade', types: ['shop', 'industry'], districts: ['ridertown'], wealth: [0.2, 0.8],
  w: 19.5, d: 12.5, h: 10, variants: 2, variantNames: ['the weaving house', 'the dye works'],
  variantDims: [{ w: 16.5, d: 12.5, h: 10 }, { w: 19.5, d: 12, h: 7.5 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.45;
    if (F.variant === 1) {
      /* the dye works: an open thatch shed over the vats (indigo, madder, saffron, the green of the claw), a fire under
         one, the dyed cloth on the lines in the yard, the loom room at the end */
      const x0 = -8, x1 = 4, z0 = -4.5, z1 = 1.5;
      F.box(-2, 0, -1.5, 12.6, 0.12, 6.6, 0, shade(BRM.rock, -0.1), 'stone');
      for (let i = 0; i < 4; i++) for (const z of [z0 + 0.2, z1 - 0.2]) F.cyl(x0 + 0.2 + i * (x1 - x0 - 0.4) / 3, 0, z, 0.18, 2.8, 0, BRM.timber[2], 'bark');
      for (const z of [z0 + 0.2, z1 - 0.2]) F.beam(x0, 2.75, z, x1, 2.75, z, 0.2, 0.24, BRM.timber[2], BRM_TIMBER);
      brtThatch(F, -2, -1.5, 2.9, 14.2, 3.0, 8.2, BRM.thatch[0]);
      const dyes = [BRT.indigo, BRT.madder, BRT.saffron, BRT.green, BRT.indigo];
      for (let i = 0; i < 5; i++) brtVat(F, x0 + 1.4 + i * 2.3, 0.12, -2.6, 0.75, 0.9, dyes[i]);
      F.box(x0 + 1.4, 0.12, -0.9, 1.4, 0.35, 1.0, 0, BRM.rock, 'stone');
      F.box(x0 + 1.4, 0.2, -0.38, 0.6, 0.2, 0.06, 0, BRT_GLOW.ember, 'glow');
      /* the loom room */
      const lx0 = 4.6, lx1 = 9.0;
      brtBase(F, lx0, lx1, z0, z1, y0);
      brtWalls(F, lx0, lx1, z0, z1, y0, 2.5, BRM.stave[1], [{ side: 'f', at: 0, w: 1.2 }]);
      brtWin(F, 'r', lx0, lx1, z0, z1, 0, y0 + 1.6, 1.0, 0.7);
      brmHip(F, (lx0 + lx1) / 2, -1.5, y0 + 2.5, lx1 - lx0 + 1.4, 3.0, z1 - z0 + 1.4, BRM.shingle[1], 0.7);
      F.furn('br_loom_frame', 6.8, y0, -2.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_cloth_bolts', 6.8, y0, -0.2, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_cloth_line', -4.5, 0, 4.0, 0, { v: 0 });
      F.furn('br_h_cloth_line', -4.5, 0, 6.0, 0, { v: 2 });
      F.furn('br_h_cloth_line', 3.0, 0, 5.0, 0, { v: 1 });
      F.furn('br_h_water_butt', x0 - 0.8, 0, 2.6, Math.PI / 2, { v: 0 });
      F.furn('br_woodpile', x0 + 1.4, 0, 2.8, 0, { v: 0 });
      return;
    }
    /* the weaving house: a stave house with wide windows for the light, the looms along them, a joglo roof */
    const x0 = -6, x1 = 6, z0 = -4, z1 = 3, wh = 2.8;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 0, w: 1.5 }]);
    for (const a of [-3.6, 3.6]) brtWin(F, 'f', x0, x1, z0, z1, a, y0 + 1.75, 2.0, 1.0);
    for (const s of ['l', 'r']) brtWin(F, s, x0, x1, z0, z1, 0, y0 + 1.75, 2.2, 1.0);
    brtJoglo(F, 0, -0.5, y0 + wh + 0.3, 15.6, 10.6, {});
    F.furn('br_loom_frame', -3.4, y0, 0.8, 0, { v: 0, setting: 'indoor' });
    F.furn('br_loom_frame', 3.4, y0, 0.8, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_cloth_bolts', 0, y0, -3.0, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_workshop_shelves', -5.55, y0, -2.4, Math.PI / 2, { v: 0, setting: 'indoor' });
    F.furn('br_bench', 3.4, y0, -2.2, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_rope_coils', 4.4, y0, -3.0, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_cloth_line', 0, 0, 6.2, 0, { v: 1 });
    brtLamp(F, 0, y0 + wh, 0);
  }
});

/* ================================ the smithy */
ASSET({
  key: 'br_bldg_smithy', name: 'Smithy (smiths)', culture: 'beast-rider', job: 'smithing',
  family: 'industrial', types: ['industry', 'shop'], districts: ['ridertown'], wealth: [0.2, 0.7],
  w: 26, d: 12, h: 9, variants: 2, variantNames: ['the forge', 'the great forge, its bellows worked by a beast'],
  variantDims: [{ w: 11.5, d: 11.5, h: 9 }, { w: 26, d: 12, h: 9 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.35, v1 = F.variant === 1, ox = v1 ? -4.0 : 0;
    /* the forge shed: stave walls at the back and ends, open to the yard on red posts, a steep shingle hip with a tall
       smoke hood; the forge at the back wall, the anvil before it, the quench trough, the tool wall */
    const hw = v1 ? 7.0 : 4.5, x0 = ox - hw, x1 = ox + hw, z0 = -4.0, z1 = 2.5, wh = 2.8;
    brtBase(F, x0, x1, z0, z1, y0, { floor: shade(BRM.rock, -0.2), floorFam: 'stone' });
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[1], [], { sides: 'blr' });
    brtPostRow(F, x0 + 0.15, z1, x1 - 0.15, z1, y0, wh + 0.1, v1 ? 4 : 3);
    brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.8, 0.8, 0.6);
    brmHip(F, ox, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 4.2, z1 - z0 + 1.8, BRM.shingle[3], 0.9);
    const forges = v1 ? [ox - 3.2, ox + 3.2] : [ox];
    forges.forEach(function (x, i) {
      F.furn('br_h_smithy_forge', x, y0, z0 + 1.6, 0, { v: i % 2, setting: 'indoor' });
      F.furn('br_h_anvil_stump', x + 0.4, y0, z0 + 3.9, 0, { v: 0, setting: 'indoor' });
      brtSmoke(F, x, y0 + wh + 4.0, z0 + 1.2, true);
    });
    F.furn('br_h_tool_wall', x0 + 0.3, y0, -0.8, Math.PI / 2, { v: 0, setting: 'indoor' });
    F.furn('br_h_trough', x1 - 1.2, y0, -0.5, Math.PI / 2, { v: 0, setting: 'indoor' });
    F.furn('br_h_workshop_shelves', x1 - 0.45, y0, -3.0, -Math.PI / 2, { v: 0, setting: 'indoor' });
    /* the charcoal heap and the wood */
    F.cone(ox - hw + 1.2, 0, 4.6, 1.3, 1.0, 0, BRT.charcoal, 'stone');
    F.furn('br_woodpile', ox + hw - 1.4, 0, 4.4, 0, { v: 0 });
    F.furn('br_h_crate_stack', ox, 0, 4.6, 0, { v: 0 });
    if (!v1) return;
    /* the great forge's bellows: a pair of hide bellows by the end wall, worked through a crank from the whim outside */
    F.box(x1 - 1.5, y0, -3.0, 1.8, 0.8, 1.2, 0, BRM.timber[2], BRM_TIMBER);
    F.ell(x1 - 1.5, y0 + 1.15, -3.0, 0.85, 0.35, 0.55, 0, BRM.hide, 'hide');
    brtWhim(F, 8.8, -1.0, 3.4, { a: 2.2, to: [x1 + 0.1, y0 + 1.2, -3.0] });
    F.furn('br_h_water_butt', 8.8, 0, 4.5, 0, { v: 1 });
  }
});

/* ================================ the potter's */
ASSET({
  key: 'br_bldg_potter', name: 'Potter\'s workshop and kiln shed (craftsmen)', culture: 'beast-rider', job: 'pottery',
  family: 'trade', types: ['industry', 'shop'], districts: ['ridertown'], wealth: [0.1, 0.6],
  w: 19, d: 11, h: 8, variants: 2, variantNames: ['the workshop and kiln shed', 'the two-kiln yard'],
  variantDims: [{ w: 16, d: 11, h: 8 }, { w: 19, d: 11, h: 8 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4, v1 = F.variant === 1;
    /* the workshop: wheels by the windows, the shelves of green pots */
    const x0 = -8, x1 = -1, z0 = -4, z1 = 2, wh = 2.5;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 1.8, w: 1.3 }]);
    brtWin(F, 'f', x0, x1, z0, z1, -1.6, y0 + 1.6, 1.4, 0.8);
    brtWin(F, 'l', x0, x1, z0, z1, 0, y0 + 1.6, 1.2, 0.8);
    brmHip(F, (x0 + x1) / 2, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 3.6, z1 - z0 + 1.6, BRM.shingle[0], 0.8);
    F.furn('br_h_potters_wheel', -6.4, y0, 0.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_potters_wheel', -4.4, y0, 0.6, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_pot_shelf', -4.5, y0, z0 + 0.35, 0, { v: 0, setting: 'indoor' });
    F.furn('br_h_work_counter', -2.0, y0, -1.6, Math.PI / 2, { v: 0, setting: 'indoor' });
    /* the kiln shed: open, on posts, a shingle lean-to; one kiln, or two */
    const kx0 = 0, kx1 = v1 ? 9.5 : 6.5, kz0 = -4.5, kz1 = 2.0;
    F.box((kx0 + kx1) / 2, 0, (kz0 + kz1) / 2, kx1 - kx0 + 0.4, 0.25, kz1 - kz0 + 0.4, 0, shade(BRM.rock, -0.08), 'stone');
    for (const x of [kx0 + 0.25, (kx0 + kx1) / 2, kx1 - 0.25]) { brmPost(F, x, 0.25, kz1 - 0.2, 2.8, 0.26, BRM.red, BRM.gilt); brmPost(F, x, 0.25, kz0 + 0.2, 4.4, 0.26, BRM.deep, BRM.gilt); }
    brtShed(F, kx0 - 0.3, kx1 + 0.3, kz0 - 0.5, kz1 + 0.8, 0.25 + 4.6, 0.25 + 2.8, BRM.shingle[2]);
    F.furn('br_h_pottery_kiln', 3.1, 0.25, -1.4, 0, { v: 0, setting: 'outdoor' });
    if (v1) F.furn('br_h_pottery_kiln', 7.2, 0.25, -1.4, 0, { v: 0, setting: 'outdoor' });
    /* the clay pit and the drying boards in the yard */
    F.box(-4.5, 0, 4.5, 3.2, 0.12, 2.0, 0, BRT.clayD, 'clay');
    F.box(-4.5, 0.06, 4.5, 2.8, 0.08, 1.6, 0, BRT.clay, 'clay');
    F.furn('br_h_pot_shelf', 2.6, 0, 4.4, 0, { v: 0, setting: 'outdoor' });
    F.furn('br_woodpile', v1 ? 8.0 : 5.4, 0, 4.4, 0, { v: 0 });
    F.furn('br_h_water_butt', -7.4, 0, 4.0, 0, { v: 0 });
  }
});

/* ================================ the rope walk */
ASSET({
  key: 'br_bldg_ropewalk', name: 'Rope walk (craftsmen)', culture: 'beast-rider', job: 'ropemaking',
  family: 'industrial', types: ['industry'], districts: ['ridertown'], wealth: [0.1, 0.5],
  w: 34.5, d: 9, h: 7, variants: 2, variantNames: ['the long walk', 'the short walk and its hackling house'],
  variantDims: [{ w: 34.5, d: 6.5, h: 5 }, { w: 30, d: 9, h: 7 }],
  build: function (F) {
    brtCentre(F);
    const v1 = F.variant === 1, L = v1 ? 20 : 32, x0 = -L / 2 + (v1 ? 4 : 0), x1 = x0 + L, hd = 1.8;
    /* a long low thatch on log posts, the rope wheel at the head, T-posts carrying the strands down the walk */
    F.box((x0 + x1) / 2, 0, 0, L + 0.6, 0.04, 2 * hd + 0.8, 0, BRM.mud, 'yard/stone');
    const n = Math.round(L / 3.2);
    for (let i = 0; i <= n; i++) for (const s of [-1, 1]) F.cyl(x0 + i * L / n, 0, s * hd, 0.15, 2.4, 0, BRM.timber[2], 'bark');
    for (const s of [-1, 1]) F.beam(x0, 2.35, s * hd, x1, 2.35, s * hd, 0.18, 0.22, BRM.timber[2], BRM_TIMBER);
    brtThatch(F, (x0 + x1) / 2, 0, 2.5, L + 1.6, 2.2, 2 * hd + 2.2, BRM.thatch[1]);
    F.furn('br_h_rope_wheel', x0 + 1.2, 0, 0, Math.PI / 2, { v: 0, setting: 'indoor' });
    for (let i = 1; i < n; i++) {
      const x = x0 + 1.6 + i * (L - 3.2) / n;
      F.rod(x, 0, 0, x, 1.15, 0, 0.06, BRM.timber[0], BRM_TIMBER);
      F.beam(x, 1.15, -0.6, x, 1.15, 0.6, 0.08, 0.1, BRM.timber[0], BRM_TIMBER);
    }
    for (const z of [-0.45, 0, 0.45]) F.rod(x0 + 1.6, 1.25, z, x1 - 1.4, 1.25, z * 0.3, 0.025, BRT.hemp, 'rope');
    F.box(x1 - 1.0, 0, 0, 0.5, 1.6, 1.4, 0, BRM.timber[2], BRM_TIMBER);
    F.furn('br_h_rope_coils', x0 + 4.0, 0, 0.9, 0, { v: 0 });
    F.furn('br_h_rope_coils', x1 - 3.6, 0, -0.9, 0, { v: 1 });
    F.furn('br_h_sack_pile', x0 + 3.0, 0, -1.1, 0, { v: 0 });
    if (!v1) { brtLamp(F, (x0 + x1) / 2, 2.35, 0); return; }
    /* the hackling house at the head: where the fibre is combed and stored, a stave hut with its own hip */
    const hx0 = -14, hx1 = -7.4, hz0 = -3.8, hz1 = 3.0, y0 = 0.35;
    brtBase(F, hx0, hx1, hz0, hz1, y0);
    brtWalls(F, hx0, hx1, hz0, hz1, y0, 2.4, BRM.stave[0], [{ side: 'f', at: 0, w: 1.2 }, { side: 'r', at: 0, w: 1.4 }]);
    brtWin(F, 'l', hx0, hx1, hz0, hz1, 0, y0 + 1.6, 0.9, 0.6);
    brmHip(F, (hx0 + hx1) / 2, (hz0 + hz1) / 2, y0 + 2.4, hx1 - hx0 + 1.4, 3.0, hz1 - hz0 + 1.4, BRM.shingle[1], 0.7);
    F.furn('br_h_work_counter', -10.7, y0, -2.9, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_sack_pile', -12.8, y0, 1.6, 0, { v: 1, setting: 'indoor' });
    F.furn('br_h_rope_coils', -10.0, y0, 1.7, 0, { v: 1, setting: 'indoor' });
  }
});

/* ================================ the house of healing */
ASSET({
  key: 'br_bldg_healer', name: 'House of healing (healers)', culture: 'beast-rider', role: 'healer',
  family: 'civic', types: ['civic'], districts: ['ridertown'], wealth: [0.3, 0.8],
  w: 19.5, d: 13.5, h: 9.5, variants: 2, variantNames: ['the house of healing and its herb garden', 'the beast-healer\'s, with its sling stall'],
  variantDims: [{ w: 16.5, d: 13.5, h: 9.5 }, { w: 19.5, d: 12, h: 9 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.45, v1 = F.variant === 1, ox = v1 ? -4 : 0;
    /* the house: the sick laid on straw pallets, the hearth where the remedies are brewed, the shelves of jars */
    const hw = v1 ? 4.5 : 6.5, x0 = ox - hw, x1 = ox + hw, z0 = -4.5, z1 = 2.0, wh = 2.6;
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, wh, BRM.stave[0], [{ side: 'f', at: 0, w: 1.4 }]);
    for (const a of [-hw * 0.55, hw * 0.55]) brtWin(F, 'f', x0, x1, z0, z1, a, y0 + 1.7, 0.9, 0.7);
    for (const s of ['l', 'r']) brtWin(F, s, x0, x1, z0, z1, 0, y0 + 1.7, 0.9, 0.7);
    brmHip(F, ox, (z0 + z1) / 2, y0 + wh, x1 - x0 + 1.6, 4.4, z1 - z0 + 1.6, BRM.shingle[1], 1.0);
    F.furn('br_h_kitchen_hearth', ox, y0, z0 + 0.7, 0, { v: 0, setting: 'indoor' });
    const nb = v1 ? 2 : 4;
    for (let i = 0; i < nb; i++) F.furn('generic_poor_straw_bed', i < 2 ? x0 + 1.0 : x1 - 1.0, y0, i % 2 ? 0.2 : -2.4, 0, { v: 0, setting: 'indoor' });
    if (v1) F.furn('br_h_workshop_shelves', x1 - 0.45, y0, -2.0, -Math.PI / 2, { v: 0, setting: 'indoor' });
    else F.furn('br_h_workshop_shelves', ox + 3.4, y0, z0 + 0.4, 0, { v: 0, setting: 'indoor' });
    F.furn('br_bench', ox + 1.6, y0, -0.3, 0, { v: 0, setting: 'indoor' });
    brtLamp(F, ox, y0 + wh, -1.2);
    if (!v1) {
      /* the herb garden before it: beds, the trellis, the drying racks */
      F.furn('br_h_planter_box', -4.5, 0, 5.0, 0, { v: 0 });
      F.furn('br_h_planter_box', -1.0, 0, 5.0, 0, { v: 1 });
      F.furn('br_h_bean_trellis', 3.5, 0, 6.5, 0, { v: 0 });
      F.furn('br_drying_rack', 3.5, 0, 4.0, 0, { v: 0 });
      F.furn('br_h_water_butt', -7.5, 0, 3.6, 0, { v: 0 });
      brmFence(F, -8, 3.2, -8, 7.6, 1.0); brmFence(F, 8, 3.2, 8, 7.6, 1.0); brmFence(F, -8, 7.6, -1.6, 7.6, 1.0); brmFence(F, 1.6, 7.6, 8, 7.6, 1.0);
      return;
    }
    /* the sling stall: four great posts and their beams, a hide sling to hold a hurt beast off its legs, straw */
    const sx = 5.5, sz = -1.0, sw = 3.6, sd = 4.6;
    F.box(sx, 0, sz, 2 * sw + 0.8, 0.2, 2 * sd + 0.8, 0, shade(BRM.rock, -0.08), 'stone');
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) brmPost(F, sx + p[0] * sw, 0.2, sz + p[1] * sd, 4.6, 0.4, BRM.red, BRM.gilt);
    for (const s of [-1, 1]) F.beam(sx + s * sw, 4.7, sz - sd, sx + s * sw, 4.7, sz + sd, 0.32, 0.36, BRM.timber[2], BRM_TIMBER);
    for (const s of [-1, 1]) F.beam(sx - sw, 4.9, sz + s * 1.2, sx + sw, 4.9, sz + s * 1.2, 0.26, 0.3, BRM.timber[2], BRM_TIMBER);
    for (const s of [-1, 1]) F.rod(sx + s * 1.2, 4.9, sz + s * 1.2, sx + s * 1.0, 2.3, sz + s * 1.0, 0.05, BRM.rope, 'rope');
    F.box(sx, 1.9, sz, 2.4, 0.18, 3.0, 0, BRM.hide, 'hide');
    brtShed(F, sx - sw - 0.6, sx + sw + 0.6, sz - sd - 0.6, sz + sd + 0.6, 6.4, 5.0, BRM.shingle[2]);
    F.furn('br_h_straw_bedding', sx, 0.2, sz, Math.PI / 2, { v: 0 });
    F.furn('br_h_trough', sx + sw - 0.6, 0.2, sz + sd + 1.4, 0, { v: 0 });
    F.furn('br_h_tack_rack', ox, 0, 4.0, 0, { v: 1 });
  }
});

/* ================================ the shophouse */
ASSET({
  key: 'br_bldg_shophouse', name: 'Shophouse (shopkeepers)', culture: 'beast-rider', job: 'trading',
  family: 'trade', types: ['shop', 'dwelling-single'], districts: ['ridertown'], wealth: [0.3, 0.8],
  w: 16.5, d: 10, h: 13, variants: 2, variantNames: ['the shop under the home', 'the double shophouse'],
  variantDims: [{ w: 10.5, d: 10, h: 13 }, { w: 16.5, d: 10, h: 13 }],
  build: function (F) {
    brtCentre(F);
    const y0 = 0.4, v1 = F.variant === 1, hw = v1 ? 7.0 : 4.0, x0 = -hw, x1 = hw, z0 = -4.0, z1 = 2.5;
    const g = 2.9, u = y0 + g + 0.25, uh = 2.5, fronts = v1 ? [-3.5, 3.5] : [0];
    /* the shop: open to the street between red posts, a counter at each front, the goods on the back wall */
    brtBase(F, x0, x1, z0, z1, y0);
    brtWalls(F, x0, x1, z0, z1, y0, g, BRM.stave[1], [], { sides: 'blr' });
    brtPostRow(F, x0 + 0.15, z1, x1 - 0.15, z1, y0, g, v1 ? 5 : 3);
    if (v1) F.box(0, y0, -0.8, 0.16, g, 6.2, 0, BRM.stave[0], BRM_STAVE);
    fronts.forEach(function (x, i) {
      F.furn('br_h_work_counter', x, y0, z1 - 0.8, 0, { v: i % 2, setting: 'indoor' });
      F.furn('br_shopfront_display', x, y0, z0 + 0.6, 0, { v: 0, setting: 'indoor' });
      F.furn('br_h_crate_stack', x + (i ? 1.0 : -1.0) * 1.2, y0, -1.4, 0, { v: i % 2, setting: 'indoor' });
    });
    /* the home over it: the upper floor on its joists, stave walls, a gallery on brackets with a red rail, the stair */
    F.box(0, u - 0.25, -0.75, 2 * hw + 0.3, 0.25, z1 - z0 + 0.3, 0, BRM.timber[2], BRM_TIMBER);
    F.box(0, u - 0.05, 2.9, 2 * hw + 0.3, 0.12, 1.4, 0, BRM.plank, 'wood');
    for (let i = 0; i <= (v1 ? 6 : 3); i++) { const x = x0 + i * (2 * hw) / (v1 ? 6 : 3); F.beam(x, u - 1.3, z1 + 0.05, x, u - 0.2, z1 + 1.5, 0.16, 0.16, BRM.timber[2], BRM_TIMBER); }
    F.beam(x0, u + 1.0, z1 + 1.55, x1, u + 1.0, z1 + 1.55, 0.12, 0.12, BRM.red, BRM_TIMBER);
    for (let i = 0; i <= (v1 ? 10 : 6); i++) { const x = x0 + i * (2 * hw) / (v1 ? 10 : 6); F.box(x, u, z1 + 1.55, 0.08, 1.0, 0.08, 0, BRM.red, BRM_TIMBER); }
    const ud = fronts.map(function (x) { return { side: 'f', at: x + 1.2, w: 1.1 }; });
    brtWalls(F, x0, x1, z0, z1, u, uh, BRM.stave[0], ud);
    fronts.forEach(function (x) { brtWin(F, 'f', x0, x1, z0, z1, x - 1.2, u + 1.5, 0.9, 0.7); });
    for (const s of ['l', 'r']) brtWin(F, s, x0, x1, z0, z1, -0.8, u + 1.5, 0.8, 0.6);
    brmHip(F, 0, -0.4, u + uh, 2 * hw + 1.8, 5.0, z1 - z0 + 3.0, BRM.shingle[1], 1.0);
    /* the stair up the right end to the gallery */
    for (let k = 0; k < 9; k++) F.box(x1 + 0.7, y0 + k * (u - y0) / 9, z1 - 2.6 + k * 0.45, 1.0, 0.14, 0.4, 0, BRM.plank, 'wood');
    F.rod(x1 + 1.2, y0, z1 - 2.6, x1 + 1.2, u + 0.9, z1 + 1.4, 0.05, BRM.red, BRM_TIMBER);
    fronts.forEach(function (x, i) {
      F.furn('generic_poor_straw_bed', x - 1.6, u, -2.6, Math.PI / 2, { v: 0, setting: 'indoor' });
      F.furn('br_h_fire_pit', x + 1.2, u, -1.5, 0, { v: 1, setting: 'indoor' });
      F.furn('br_bench', x - 0.6, u, 0.6, 0, { v: 0, setting: 'indoor' });
    });
    F.furn('br_h_window_box', fronts[0] - 1.2, u + 0.6, z1 + 0.2, 0, { v: 0 });
  }
});

/* ================================ the market hall */
ASSET({
  key: 'br_bldg_market_hall', name: 'Market hall (market traders)', culture: 'beast-rider', job: 'trading',
  family: 'trade', types: ['market'], districts: ['ridertown'], wealth: [0.2, 0.8],
  w: 22.5, d: 17.5, h: 12.5, variants: 2, variantNames: ['the market hall', 'the market pavilion'],
  variantDims: [{ w: 22.5, d: 17.5, h: 12.5 }, { w: 13.5, d: 13.5, h: 12.5 }],
  build: function (F) {
    brtCentre(F);
    if (F.variant === 1) {
      /* the pavilion: a square of carved posts under a tajug (the hall's square, steep pyramid in shingle), the well
         in the middle, four stalls round it */
      const s = 4.6;
      F.box(0, 0, 0, 2 * s + 2.4, 0.3, 2 * s + 2.4, 0, BRM.rock, 'stone');
      for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]]) brmPost(F, p[0] * s, 0.3, p[1] * s, 3.6, 0.32, (p[0] + p[1]) % 2 ? BRM.deep : BRM.red, BRM.gilt);
      brtBand(F, 0, 0, 0.3 + 3.8, 2 * s + 0.4, 2 * s + 0.4);
      F.hipRoof(0, 0.3 + 3.75, 0, 2 * s + 3.0, 1.3, 2 * s + 3.0, 0, shade(BRM.thatch[1], -0.3), 'thatch');
      brtBand(F, 0, 0, 0.3 + 3.75, 2 * s + 3.0, 2 * s + 3.0);
      brtTierRoof(F, 0.3 + 4.85, 6.4, 5.4);
      F.furn('br_well', 0, 0.3, 0, 0, { v: 0 });
      F.furn('br_market_stall', 0, 0.3, -3.0, 0, { v: 0 });
      F.furn('br_market_stall', 0, 0.3, 3.0, Math.PI, { v: 0 });
      F.furn('br_market_stall', -3.0, 0.3, 0, Math.PI / 2, { v: 0 });
      F.furn('br_market_stall', 3.0, 0.3, 0, -Math.PI / 2, { v: 0 });
      return;
    }
    /* the market hall: three bays of carved posts on a stone floor under a great joglo roof, stalls between the posts */
    const hw = 9, hd = 5.5;
    F.box(0, 0, 0, 2 * hw + 1.6, 0.3, 2 * hd + 1.6, 0, BRM.rock, 'stone');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const x = -hw + i * (2 * hw) / 3, z = -hd + j * hd;
      if (j === 1 && (i === 1 || i === 2)) continue;
      brmPost(F, x, 0.3, z, 4.0, 0.36, (i + j) % 2 ? BRM.deep : BRM.red, BRM.gilt);
    }
    for (const z of [-hd, 0, hd]) F.beam(-hw, 4.3, z, hw, 4.3, z, 0.3, 0.34, BRM.red, BRM_TIMBER);
    brtJoglo(F, 0, 0, 4.7, 2 * hw + 4.0, 2 * hd + 4.0, { fin: 1.3 });
    const st = [[-6, -3.0, 0], [0, -3.0, 0], [6, -3.0, 0], [-6, 3.0, Math.PI], [6, 3.0, Math.PI]];
    st.forEach(function (p) { F.furn('br_market_stall', p[0], 0.3, p[1], p[2], { v: 0 }); });
    F.furn('br_fruit_stack', 0, 0.3, 3.0, 0, { v: 0 });
    F.furn('br_h_sack_pile', -2.6, 0.3, 0, 0, { v: 0 });
    F.furn('br_h_barrel_cluster', 2.8, 0.3, 0, 0, { v: 1 });
    F.furn('br_h_hitching_rail', -6.0, 0, 9.0, 0, { v: 0 });
    F.furn('br_h_hitching_rail', 6.0, 0, 9.0, 0, { v: 0 });
    F.furn('br_h_hanging_lantern', -3.0, 4.3 - 2.3, 0, 0, { v: 0 });
    F.furn('br_h_hanging_lantern', 3.0, 4.3 - 2.3, 0, 0, { v: 0 });
  }
});
/* the hall's crown in little (the rookery tower's), centred on the frame's origin as brmTier is: a shingle tier with
   its eave ring and ribs, a drum of dark windows, a steep cone, the gilt spire; from y, the tier's foot radius rb,
   total height h */
function brtTierRoof(F, y, rb, h) {
  const cx = 0;
  const t1 = h * 0.38, d = h * 0.16, t2 = h * 0.46;
  brmTier(F, y, rb, rb * 0.42, t1, BRM.shingle[1], 12, BRM.verd);
  const yy = y + t1, rd = rb * 0.4;
  F.frustum(cx, yy - 0.15, 0, rd, rd, d, 0, BRM.wall, 'reed', 16);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; F.box(cx + Math.cos(a) * rd, yy + d * 0.2, Math.sin(a) * rd, 0.5, d * 0.55, 0.5, -a, BRM.pane, 'wood'); }
  F.frustum(cx, yy + d - 0.2, 0, rd + 0.08, rd + 0.08, 0.18, 0, BRM.red, BRM_TIMBER, 16);
  brmTier(F, yy + d, rd * 1.25, 0.15, t2, BRM.shingle[3], 8, BRM.gilt);
  F.box(cx, yy + d + t2 - 0.1, 0, 0.1, 1.6, 0.1, 0, BRM.gilt, BRM_TIMBER);
}

BRT_ROWS.push({ title: 'Trades: crafts and food (this kit)', keys: ['br_bldg_bakehouse', 'br_bldg_butcher', 'br_bldg_mead_hall', 'br_bldg_tannery',
  'br_bldg_weaver', 'br_bldg_smithy', 'br_bldg_potter', 'br_bldg_ropewalk', 'br_bldg_healer', 'br_bldg_shophouse', 'br_bldg_market_hall'] });
