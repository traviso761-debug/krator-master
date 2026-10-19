// prefix: brt
/* ======================================================================
   The Beast Riders' tents (3): PENS AND TRAINER STRUCTURES for the tribes' mounts, portable as the tents are (rope and
   lashed poles, hides on poles), on the tent kit (70-br-tent-kit.js). Sized from the mounts (kits/fauna, `size`):
   the runners (ridge-raptor 4.1 m long, arena-tiger 4.8 m), the staghorn beetle (2.6 m), the great beasts (tricorn
   4.5 m long, 2.4 m high; the hardshell and the mammoth are not in kits/fauna yet: about 3.5 m and 6 m long, 1.6 m and
   4 m high), the longcrawler (draught-millipede 7.3 m), the flyers (quetzalcoatlus 7.5 m long and 5.6 m high standing,
   12 m across the wings; giant-archaeopteryx 7.5 m, 3.7 m high; giant-bat 2.6 m, 9 m across).
     br_tent_corral          a portable corral (role herding): (v0) rope and poles for the runners, (v1) lashed log rails
                             for the great beasts, (v2) a low pen with rotting logs and a sap trough for staghorn beetles
     br_tent_lunge_ring      a training ring with a centre post, its swivel arm and lunge line (role training)
     br_tent_hitch_line      a hitching line between carved posts (role tethering): (v1) the great beasts' line
     br_tent_perch_frame     the flyers' portable perch frame and roost poles (role roosting): (v0) the quetzals' great
                             perch log, (v1) the wingclaws' two-level frame, (v2) the nightwings' hanging bar under a shade
     br_tent_feed_shelter    a feeding shelter, a lean-to of hides (role feeding): (v0) hay and troughs for grazers,
                             (v1) a meat rack and baskets for the hunters and the flyers
     br_tent_training_yard   a training yard (role training): (v0) jump rails, weaving poles, a ramp; (v1) a lance course
     br_tent_breaking_pen    a breaking pen of close-set poles round a snubbing post (role training): (v1) the great beasts'
     br_tent_kennel_row      a kennel row for raptors (role kennel): (v0) four runs, (v1) six
     br_tent_crawler_shed    a longcrawlers' shed, a hooped hide tunnel over leaf litter (role stabling): (v1) two
   ====================================================================== */

/* a polygon of n corners round (cx, cz), radius r (rx, rz for an ellipse), the first corner's turn a0 */
function brtRing(n, rx, rz, a0, cx, cz) { const P = []; for (let i = 0; i < n; i++) { const a = ((a0 == null ? 0 : a0)) + i * Math.PI * 2 / n; P.push([((cx == null ? 0 : cx)) + rx * Math.cos(a), ((cz == null ? 0 : cz)) + rz * Math.sin(a)]); } return P; }
/* the frame's index of the polygon edge facing the front (+z) */
function brtFrontEdge(P) { let best = 0, bz = -1e9; for (let e = 0; e < P.length; e++) { const q = P[(e + 1) % P.length], z = (P[e][1] + q[1]) / 2; if (z > bz) { bz = z; best = e; } } return best; }

ASSET({
  key: 'br_tent_corral', name: 'Portable corral', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'rope-and-pole', role: 'herding' },
  w: 25.6, d: 26.8, h: 4, variants: 3, variantNames: ['rope and poles: the runners (raptor, tiger)', 'lashed log rails: the great beasts (threehorn, hardshell)', 'a low pen, rotting logs and a sap trough: staghorn beetles'],
  variantDims: [{ w: 15.6, d: 15.6, h: 3.6 }, { w: 25.6, d: 26.8, h: 4 }, { w: 14.8, d: 13, h: 3 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    const P = v === 0 ? brtRing(8, 8.2, 8.2, Math.PI / 8) : v === 1 ? brtRing(10, 13.2, 13.2, Math.PI / 10) : brtRing(6, 7.2, 7.2, 0);
    const h = [1.9, 2.3, 1.3][v], e = brtFrontEdge(P);
    brtCorral(F, B, P, h, { rope: v === 0, rails: v === 2 ? 2 : 3, post: [0.07, 0.13, 0.09][v], step: [2.6, 3.0, 2.4][v], gate: { e: e, w: [3.2, 5.0, 2.6][v] } });
    if (v === 0) {
      F.furn('br_h_trough', -3.5, 0, -2.5, 0.4, { v: 0 }); F.furn('br_h_water_butt', 4.5, 0, -3.4, -0.5, { v: 1 });
      F.furn('br_h_straw_bedding', 1.0, 0, -4.4, 0, {});
    } else if (v === 1) {
      F.furn('br_h_trough', -5.5, 0, -6.0, 0.3, { v: 1 }); F.furn('br_h_trough', -1.5, 0, -8.0, 0.1, { v: 2 });
      F.furn('br_h_hay_bales', 5.5, 0, -6.5, -0.4, { v: 1 }); F.furn('br_h_hay_bales', 7.4, 0, -4.4, 0.6, { v: 2 });
      F.furn('br_h_water_butt', 8.0, 0, 1.0, -1.2, { v: 0 });
      for (const p of [[-9.8, 7.4], [9.6, 7.6]]) { F.cyl(p[0], 0, p[1], 1.4, 1.6, 0, BRT.straw, 'straw/cloth'); F.cone(p[0], 1.6, p[1], 1.5, 1.2, 0, BRT.straw, 'straw/cloth'); }
    } else {
      /* rotting logs for the beetles to chew and shelter under, a sap trough of split log */
      for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4, r = 2.4 + k * 0.8, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8, L = 2.4 + brtU(F, 91, k) * 1.6, t = brtU(F, 92, k) * Math.PI;
        F.rod(x - Math.cos(t) * L / 2, 0.32, z - Math.sin(t) * L / 2, x + Math.cos(t) * L / 2, 0.36, z + Math.sin(t) * L / 2, 0.32 + brtU(F, 93, k) * 0.12, k % 2 ? BRT.thornDry : BRT.thorn, 'bark'); }
      F.furn('br_trade_trough', 0.4, 0, -0.6, 0.6, {}); F.furn('br_trade_trough', -1.2, 0, 1.4, -0.3, {});
      F.box(0, 0, 0, 11.5, 0.04, 11.5, 0, BRT.earth, 'yard/stone');
    }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_lunge_ring', name: 'Lunging ring with a centre post', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'rope-and-pole', role: 'training' },
  w: 28.4, d: 26.2, h: 3.6, variants: 2, variantNames: ["the runners' ring (18 m)", "the great beasts' ring (26 m), a heavier post"],
  variantDims: [{ w: 20.4, d: 18, h: 3.2 }, { w: 28.4, d: 26.2, h: 3.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), r = v ? 13 : 9, P = brtRing(v ? 18 : 14, r, r, 0);
    F.cyl(0, 0, 0, r - 0.1, 0.04, 0, BRT.earth, 'yard/stone');
    brtCorral(F, B, P, v ? 1.7 : 1.4, { rope: !v, rails: 2, post: v ? 0.11 : 0.07, step: 2.4, gate: { e: brtFrontEdge(P), w: v ? 4.0 : 2.8 } });
    /* the centre post: a carved post, a swivel cap, an arm out to the line's ring, the lunge line trailing */
    brmPost(F, 0, 0, 0, v ? 3.2 : 2.7, v ? 0.42 : 0.3, BRM.red, BRM.gilt);
    const ya = (v ? 3.2 : 2.7) - 0.45, arm = v ? 3.2 : 2.2;
    F.cyl(0, ya - 0.1, 0, 0.22, 0.3, 0, BRT.iron, 'metal');
    B.stick(BRT.poleDark, BRT_LASH, [0, ya, 0, arm, ya + 0.3, 0.2, 0.08, 0.06]);
    B.stick(BRT.poleDark, BRT_LASH, [-0.8, ya, -0.1, 0, ya, 0, 0.07]);
    F.box(-0.95, ya - 0.3, -0.1, 0.4, 0.35, 0.4, 0, BRM.rock, 'stone');
    brtRope(B, [arm, ya + 0.3, 0.2], [arm + 0.3, 0.9, 0.5 + r * 0.25], 0.3, 0.02);
    brtRope(B, [arm + 0.3, 0.9, 0.5 + r * 0.25], [arm + 0.8, 0.05, r * 0.5], 0.05, 0.02);
    F.furn('br_h_training_post', -r * 0.55, 0.04, -r * 0.45, 0.6, { v: v });
    F.furn('br_h_trough', r + 1.8, 0, -2.0, Math.PI / 2, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_hitch_line', name: 'Hitching line', culture: 'beast-rider', family: 'farm',
  types: ['farm', 'infrastructure'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'rope-and-pole', role: 'tethering' },
  w: 26.2, d: 4.4, h: 4.6, variants: 2, variantNames: ['a line for six runners', "the great beasts' line: log posts and stays"],
  variantDims: [{ w: 17.2, d: 4.4, h: 3.6 }, { w: 26.2, d: 4.4, h: 4.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), L = v ? 22 : 13, yl = v ? 2.6 : 1.9, n = v ? 6 : 4;
    for (let i = 0; i <= n; i++) {
      const x = -L / 2 + L * i / n, end = i === 0 || i === n;
      if (end) { brmPost(F, x, 0, 0, yl + 0.8, v ? 0.4 : 0.28, BRM.red, BRM.gilt); brmFinial(F, x, yl + 0.8, 0, x < 0 ? -1 : 1, 0, v ? 0.6 : 0.45, BRM.deep);
        brtGuy(B, [x, yl + 0.4, 0], x + (x < 0 ? -1.9 : 1.9), 0); }
      else B.stick(BRT.poleDark, BRT_LASH, [x, -0.2, 0, x, yl + 0.15, 0, v ? 0.12 : 0.08, v ? 0.1 : 0.07]);
    }
    brtRope(B, [-L / 2, yl, 0], [L / 2, yl, 0], v ? 0.25 : 0.18, v ? 0.035 : 0.025);
    /* tie loops, one per mount, hanging off the line */
    const nT = v ? 6 : 6;
    for (let k = 0; k < nT; k++) { const x = -L / 2 + L * (k + 0.5) / nT, sag = (v ? 0.25 : 0.18) * 4 * ((k + 0.5) / nT) * (1 - (k + 0.5) / nT);
      brtRope(B, [x, yl - sag, 0], [x + 0.1, yl - sag - 0.9, 0.05], 0, 0.02); F.cyl(x + 0.1, yl - sag - 1.0, 0.05, 0.09, 0.05, 0, BRT.iron, 'metal'); }
    /* the troughs before it, hay or tack behind */
    for (let k = 0; k < (v ? 3 : 2); k++) F.furn('br_h_trough', -L / 2 + L * (k + 0.5) / (v ? 3 : 2), 0, 1.5, 0, { v: k % 3 });
    if (v) { F.furn('br_h_hay_bales', -6, 0, -1.9, 0, { v: 0 }); F.furn('br_h_hay_bales', 6, 0, -1.9, 0, { v: 1 }); }
    else { F.furn('br_h_saddle_trestle', -3.0, 0, -1.4, 0, {}); F.furn('br_h_saddle_trestle', 2.2, 0, -1.5, 0.2, {}); F.furn('br_h_water_butt', 5.0, 0, -1.6, 0, { v: 1 }); }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_perch_frame', name: "Flyers' perch frame and roost poles", culture: 'beast-rider', family: 'farm',
  types: ['farm', 'infrastructure'], districts: ['camp', 'roost'], wealth: [0, 1], tags: { style: 'lashed-frame', role: 'roosting' },
  w: 16.2, d: 10, h: 7.6, variants: 3, variantNames: ["the quetzals' great perch log", "the wingclaws' two-level frame and roost poles", "the nightwings' hanging bar under a shade"],
  variantDims: [{ w: 16.2, d: 10, h: 5.8 }, { w: 16, d: 9.6, h: 5.4 }, { w: 11.8, d: 8.4, h: 7.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    F.box(0, 0, 0, v === 2 ? 9.6 : 12.4, 0.04, 6.4, 0, BRT.straw, 'straw/cloth');
    /* an A-frame of lashed poles at x: two legs each side meeting under the bar at height y, a cross-tie */
    const aframe = function (x, y, spread) {
      for (const s of [-1, 1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.2, s * spread, x, y + 0.25, s * 0.15, 0.11, 0.09]);
      B.stick(BRT.pole, BRT_LASH, [x, y * 0.35, -spread * 0.65, x, y * 0.35, spread * 0.65, 0.06]);
      brtGuy(B, [x, y + 0.1, 0], x + (x < 0 ? -2.3 : 2.3), 0);
    };
    if (v === 0) {
      const y = 4.2; aframe(-5.6, y, 2.4); aframe(5.6, y, 2.4);
      for (const s of [-1, 1]) B.stick(BRT.poleDark, BRT_LASH, [0, -0.2, s * 2.4, 0, y + 0.25, s * 0.15, 0.11, 0.09]);
      F.rod(-6.6, y + 0.32, 0, 6.6, y + 0.32, 0, 0.26, BRT.pole, 'guano/wood');
      for (const s of [-1, 1]) brmFinial(F, s * 6.55, y + 0.3, 0, s, 0, 0.6, BRM.deep);
      /* roost poles: a pole and a T-bar either side of the frame */
      for (const p of [[-3.2, 3.6], [3.4, -3.6]]) { B.stick(BRT.poleDark, BRT_LASH, [p[0], -0.2, p[1], p[0], 3.5, p[1], 0.11, 0.09]); F.rod(p[0] - 1.0, 3.55, p[1], p[0] + 1.0, 3.55, p[1], 0.11, BRT.pole, 'guano/wood'); brtGuy(B, [p[0], 3.2, p[1]], p[0] * 1.4, p[1] * 1.35); }
      brtLadder(B, 0, -4.2, 0, Math.PI / 2, y + 0.2);
      F.furn('br_h_feed_basket', -3.0, y + 0.2 - 1.6, 0.3, 0, {}); F.furn('br_h_feed_basket', 3.2, y + 0.2 - 1.6, -0.3, 0, {});
      F.furn('br_h_trough', -2.5, 0.04, 2.6, 0, { v: 1 }); F.furn('br_h_trough', 2.5, 0.04, -2.6, Math.PI, { v: 0 });
    } else if (v === 1) {
      /* two rows of posts carrying perch rails at two heights, roost poles (a pole and a T-bar) round it */
      for (const x of [-4.5, -1.5, 1.5, 4.5]) for (const s of [-1, 1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.2, s * 1.2, x, 4.3, s * 1.2, 0.1, 0.085]);
      for (const y of [2.4, 4.0]) for (const s of [-1, 1]) F.rod(-5.0, y, s * 1.2, 5.0, y, s * 1.2, 0.13, BRT.pole, 'guano/wood');
      for (const x of [-4.5, 0, 4.5]) B.stick(BRT.pole, BRT_LASH, [x, 4.15, -1.4, x, 4.15, 1.4, 0.07]);
      for (const p of [[-6.2, 3.4], [6.2, -3.3], [-2.6, -3.6], [3.0, 3.6]]) {
        B.stick(BRT.poleDark, BRT_LASH, [p[0], -0.2, p[1], p[0], 4.9, p[1], 0.1, 0.08]);
        F.rod(p[0] - 0.9, 4.95, p[1], p[0] + 0.9, 4.95, p[1], 0.09, BRT.pole, 'guano/wood');
        brtGuy(B, [p[0], 4.5, p[1]], p[0] * 1.25, p[1] * 1.28);
      }
      brtLadder(B, 0, -3.3, 0, Math.PI / 2, 3.9);
      F.furn('br_h_perch_bar', 0, 0.04, 3.0, 0, { v: 1 });
      F.furn('br_h_trough', 0, 0.04, -2.9, 0, { v: 1 });
    } else {
      /* the nightwings hang by their feet: a high bar on stout posts, a shade of dark hides over it, hooks along it */
      for (const x of [-4.2, 0, 4.2]) for (const s of [-1, 1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.25, s * 1.6, x, 6.9, s * 1.6, 0.12, 0.1]);
      for (const s of [-1, 1]) F.rod(-4.6, 6.0, s * 1.6, 4.6, 6.0, s * 1.6, 0.14, BRT.pole, 'guano/wood');
      for (let k = 0; k < 7; k++) { const x = -3.6 + k * 1.2; for (const s of [-1, 1]) B.stick(BRT.iron, 'metal', [x, 6.0, s * 1.6, x, 5.7, s * 1.6, 0.02, 0.015]); }
      for (let i = 0; i < 4; i++) { const x0 = -4.8 + 2.4 * i, x1 = x0 + 2.4, col = brtPick(F, [BRT.fur, BRT.leather, BRT.hideOld[1]], 94, i);
        brtSurf(F, 3, 4, function (u, w) { const z = -2.4 + 4.8 * w; return [x0 + (x1 - x0) * u, 7.2 - Math.abs(z) * 0.35 - Math.sin(Math.PI * u) * 0.08 + (i % 2) * 0.012, z]; }, col, BRT_HIDE); }
      for (const x of [-4.2, 0, 4.2]) B.stick(BRT.pole, BRT_LASH, [x, 7.05, -2.5, x, 7.05, 2.5, 0.06]);
      for (const x of [-4.2, 4.2]) for (const s of [-1, 1]) brtGuy(B, [x, 6.6, s * 1.6], x * 1.35, s * 4.0);
      F.furn('br_h_feed_basket', 0, 0.8, 0, 0, {}); F.furn('br_h_trough', 0, 0.04, 2.9, 0, { v: 2 });
    }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_feed_shelter', name: 'Feeding shelter (a lean-to of hides)', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture', 'roost'], wealth: [0, 1], tags: { style: 'hide-lean-to', role: 'feeding' },
  w: 10.2, d: 6.8, h: 3.6, variants: 2, variantNames: ['the grazers: hay, fodder racks, troughs', 'the hunters and flyers: a meat rack, baskets, a block'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F);
    brtLeanTo(F, B, -4.2, 4.2, 2.0, -2.0, 3.0, 2.2);
    F.box(0, 0, 0, 9.2, 0.04, 5.4, 0, v ? BRT.earth : BRT.straw, v ? 'yard/stone' : 'straw/cloth');
    for (const x of [-4.2, 4.2]) brtGuy(B, [x, 2.9, 2.0], x * 1.18, 3.9);
    if (!v) {
      F.furn('br_trade_hayrack', -2.2, 0.04, -1.75, 0, {}); F.furn('br_trade_hayrack', 0, 0.04, -1.75, 0, {});
      F.furn('br_h_hay_bales', 2.6, 0.04, -1.2, 0, { v: 2 }); F.furn('br_h_trough', -1.0, 0.04, 1.1, 0, { v: 0 });
      F.furn('br_h_water_butt', 3.0, 0.04, 1.3, 0, { v: 0 });
    } else {
      /* a meat rack: a pole on two forks, hunks hung from hooks */
      for (const x of [-3.0, 0.4]) { B.stick(BRT.poleDark, BRT_LASH, [x, 0, -1.4, x, 2.2, -1.4, 0.06]); }
      B.stick(BRT.pole, BRT_LASH, [-3.2, 2.15, -1.4, 0.6, 2.15, -1.4, 0.05]);
      for (let k = 0; k < 5; k++) { const x = -2.6 + k * 0.65; B.stick(BRT.iron, 'metal', [x, 2.15, -1.4, x, 1.75, -1.4, 0.012]);
        F.ell(x, 1.45, -1.4, 0.18 + brtU(F, 95, k) * 0.08, 0.32, 0.12, 0, brtPick(F, [0x5a1810, 0x6a2216, 0x4a140c], 96, k), 'hide'); }
      F.box(2.3, 0.04, -1.0, 0.9, 0.8, 0.9, 0, BRT.thorn, 'bark');
      F.furn('br_h_feed_basket', 2.6, 2.6 - 1.6, 0.6, 0, {}); F.furn('br_h_trough', -1.2, 0.04, 1.2, 0, { v: 1 });
      F.furn('br_h_water_butt', 3.2, 0.04, 1.4, 0, { v: 1 });
    }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_training_yard', name: 'Training yard', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'rope-and-pole', role: 'training' },
  w: 28.4, d: 18.4, h: 3.4, variants: 2, variantNames: ['jump rails, weaving poles, a log ramp', 'a lance course: rings on arms, quintains, archery butts'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), hw = 14, hd = 9;
    const P = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    F.box(0, 0, 0, 2 * hw - 0.2, 0.04, 2 * hd - 0.2, 0, BRT.earth, 'yard/stone');
    brtCorral(F, B, P, 1.6, { rope: true, rails: 2, step: 3.0, gate: { e: 2, w: 4.0 } });
    if (!v) {
      /* three jumps of a rail on crossed trestles, rising */
      [0.7, 1.1, 1.5].forEach(function (y, k) {
        const x = -9 + k * 5.5, z = -3.5 + k * 1.2;
        for (const s of [-1, 1]) { B.stick(BRT.poleDark, BRT_LASH, [x - 0.45, 0, z + s * 2.0, x + 0.45, y + 0.25, z + s * 2.0, 0.05]); B.stick(BRT.poleDark, BRT_LASH, [x + 0.45, 0, z + s * 2.0, x - 0.45, y + 0.25, z + s * 2.0, 0.05]); }
        B.stick(BRT.cream, BRT_LASH, [x, y, z - 2.2, x, y, z + 2.2, 0.06]); B.stick(BRT.red, BRT_LASH, [x, y * 0.55, z - 2.2, x, y * 0.55, z + 2.2, 0.05]);
      });
      /* the weaving line: poles with red rags at their heads */
      for (let k = 0; k < 7; k++) { const x = -6 + k * 2.1, z = 4.6; B.stick(BRT.pole, BRT_LASH, [x, -0.1, z, x, 2.2, z, 0.05]);
        B.quad(k % 2 ? BRT.red : BRT.ochre, 'cloth', [x, 2.15, z], [x + 0.5, 2.05, z], [x, 1.8, z], [x + 0.45, 1.85, z]); }
      /* a log ramp up onto a platform of logs, and down */
      F.box(9.5, 0, -3.0, 3.0, 1.2, 3.0, 0, BRT.thorn, 'bark');
      F.beam(6.0, 0.0, -3.0, 8.0, 1.2, -3.0, 0.2, 2.6, BRT.plank, 'wood');
      F.beam(11.0, 1.2, -3.0, 13.0, 0.0, -3.0, 0.2, 2.6, BRT.plank, 'wood');
      F.furn('br_h_training_post', 10.5, 0.04, 4.6, Math.PI, { v: 0 });
    } else {
      /* the lance course: four posts each with an arm holding a ring, quintains, archery butts at the far end */
      for (let k = 0; k < 4; k++) { const x = -10 + k * 5.2, z = -1.2;
        brmPost(F, x, 0, z, 2.6, 0.22, BRM.red, BRM.gilt);
        B.stick(BRT.poleDark, BRT_LASH, [x, 2.3, z, x, 2.3, z + 1.3, 0.05]);
        const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; pts.push([x, 1.95 + Math.sin(a) * 0.32, z + 1.3 + Math.cos(a) * 0.04]); }
        B.line(BRT.iron, 'metal', pts, 0.025); }
      for (let k = 0; k < 2; k++) { const x = -5 + k * 10, z = 4.8; B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z, x, 2.4, z, 0.1]);
        F.beam(x - 1.0, 2.2, z, x + 1.0, 2.2, z, 0.12, 0.12, BRT.pole, BRT_LASH);
        F.box(x - 1.1, 1.1, z - 0.3, 0.7, 1.0, 0.1, 0, BRT.hideOld[0], BRT_HIDE); F.furn('generic_training_training_dummy', x + 1.6, 0.04, z - 0.4, 0, {}); }
      for (let k = 0; k < 3; k++) F.furn('generic_training_archery_butt', 11.2, 0.04, -6 + k * 3.0, -Math.PI / 2, {});
      F.furn('br_trade_weapon_rack', -12.6, 0.04, -7.6, 0.6, { setting: 'outdoor' });
    }
    F.furn('br_common_bench', -11.5, 0.04, 7.2, Math.PI, { v: 1 });
    F.furn('br_h_water_butt', 12.2, 0.04, 7.4, 0, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_breaking_pen', name: 'Breaking pen with a snubbing post', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'close-pole', role: 'training' },
  w: 19, d: 17.6, h: 4.4, variants: 2, variantNames: ["the runners' pen (11 m)", "the great beasts' pen (17 m), logs and two stays"],
  variantDims: [{ w: 13.4, d: 11.8, h: 3.8 }, { w: 19, d: 17.6, h: 4.4 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), r = v ? 8.4 : 5.6, H = v ? 3.2 : 2.6, n = Math.round(Math.PI * 2 * r / (v ? 0.36 : 0.26));
    F.cyl(0, 0, 0, r - 0.1, 0.04, 0, BRT.earth, 'yard/stone');
    const gate = 2.4 / r;
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2, rel = Math.abs(((a - BRT_FRONT) + Math.PI * 3) % (Math.PI * 2) - Math.PI); if (rel < gate / 2) continue;
      const p = brtAt(r, a), hh = H - 0.15 + brtU(F, 97, k) * 0.3;
      B.stick(k % 2 ? BRT.poleDark : BRT.pole, BRT_LASH, [p[0], -0.2, p[1], p[0], hh, p[1], v ? 0.15 : 0.1, v ? 0.12 : 0.08]);
    }
    for (const y of [0.6, H - 0.4]) { const pts = []; for (let k = 0; k <= 48; k++) { const a = BRT_FRONT + gate / 2 + (Math.PI * 2 - gate) * k / 48, p = brtAt(r + 0.16, a); pts.push([p[0], y, p[1]]); } B.line(BRT.rope, 'rope', pts, 0.035); }
    for (const s of [-1, 1]) { const p = brtAt(r + 0.1, BRT_FRONT + s * gate / 2); brmPost(F, p[0], 0, p[1], H + 0.6, v ? 0.4 : 0.3, BRM.red, BRM.gilt); }
    const g0 = brtAt(r + 0.1, BRT_FRONT - gate / 2), g1 = brtAt(r + 0.1, BRT_FRONT + gate / 2);
    for (const y of [0.5, 1.1, 1.7]) B.stick(BRT.rail, BRT_LASH, [g0[0], y, g0[1], g1[0], y, g1[1], 0.06]);
    /* the snubbing post: a stout post, a rope wrapped round it, its end out to a beast's place */
    const sp = v ? 0.38 : 0.26;
    B.stick(BRT.poleDark, BRT_LASH, [0, -0.4, 0, 0, v ? 2.4 : 1.9, 0, sp, sp * 0.9]);
    F.cyl(0, (v ? 2.4 : 1.9) - 0.02, 0, sp * 1.05, 0.12, 0, BRT.iron, 'metal');
    const wrap = []; for (let k = 0; k <= 30; k++) { const a = k / 30 * Math.PI * 6; wrap.push([Math.cos(a) * (sp + 0.03), 0.9 + k * 0.012, Math.sin(a) * (sp + 0.03)]); }
    B.line(BRT.rope, 'rope', wrap, 0.03);
    brtRope(B, [sp, 1.1, 0], [r * 0.45, 0.9, r * 0.2], 0.25, 0.03);
    if (v) for (const s of [-1, 1]) brtRope(B, [0, 2.2, 0], [s * r * 0.55, 0.05, -r * 0.4], 0.1, 0.03);
    F.furn('br_h_trough', r + 1.5, 0, 0, Math.PI / 2, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_kennel_row', name: 'Kennel row (raptors)', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'hide-lean-to', role: 'kennel' },
  w: 23.4, d: 6, h: 3.4, variants: 2, variantNames: ['four runs', 'six runs, a meat rack at the end'],
  variantDims: [{ w: 17.6, d: 6, h: 3.4 }, { w: 23.4, d: 6, h: 3.4 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), n = v ? 6 : 4, bw = 3.3, L = n * bw, z0 = -3.0, z1 = 2.4, H = 2.2;
    F.box(0, 0, (z0 + z1) / 2, L + 0.2, 0.04, z1 - z0 + 0.2, 0, BRT.straw, 'straw/cloth');
    brtLeanTo(F, B, -L / 2, L / 2, -0.2, z0, 2.9, 2.4);
    for (let i = 0; i <= n; i++) {
      const x = -L / 2 + i * bw;
      /* a wall of split poles between the runs, front to back */
      for (let k = 0; k < 14; k++) { const z = z0 + (z1 - z0) * k / 13; B.stick(k % 2 ? BRT.pole : BRT.poleDark, BRT_LASH, [x, -0.1, z, x, H - 0.2 + brtU(F, 98, i, k) * 0.25, z, 0.055]); }
      B.stick(BRT.poleDark, BRT_LASH, [x, H - 0.1, z0, x, H - 0.1, z1, 0.05]);
    }
    for (let k = 0; k < Math.round(L / 0.3); k++) { const x = -L / 2 + k * 0.3; B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z0, x, H, z0, 0.05]); }
    for (let i = 0; i < n; i++) {
      const xa = -L / 2 + i * bw + 0.2, xb = xa + bw - 0.4;
      for (const y of [0.4, 1.0, 1.6]) B.stick(BRT.rail, BRT_LASH, [xa, y, z1, xb, y, z1, 0.05]);
      for (const x of [xa, xb]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z1, x, 2.0, z1, 0.06]);
      F.furn('br_trade_trough', (xa + xb) / 2 + 0.6, 0.04, z1 - 0.6, 0, {});
    }
    for (const s of [-1, 1]) brtGuy(B, [s * L / 2, 2.8, -0.2], s * (L / 2 + 1.6), 2.0);
    if (v) { const x = L / 2 + 1.2; B.stick(BRT.poleDark, BRT_LASH, [x, 0, -1.6, x, 2.2, -1.6, 0.06]); B.stick(BRT.poleDark, BRT_LASH, [x, 0, 1.0, x, 2.2, 1.0, 0.06]);
      B.stick(BRT.pole, BRT_LASH, [x, 2.15, -1.8, x, 2.15, 1.2, 0.05]);
      for (let k = 0; k < 4; k++) { const z = -1.2 + k * 0.6; B.stick(BRT.iron, 'metal', [x, 2.15, z, x, 1.8, z, 0.012]); F.ell(x, 1.5, z, 0.12, 0.3, 0.16, 0, 0x5a1810, 'hide'); } }
    else F.furn('br_h_water_butt', L / 2 + 1.4, 0, 0.8, 0, { v: 1 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_crawler_shed', name: "Longcrawlers' shed", culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'hide-vault', role: 'stabling' },
  w: 18.4, d: 12.6, h: 3, variants: 2, variantNames: ['one hooped tunnel', 'two tunnels side by side'],
  variantDims: [{ w: 18.4, d: 6.2, h: 3 }, { w: 18.4, d: 12.6, h: 3 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), L = 16, W = 4.4, H = 2.5;
    const zs = v ? [-3.2, 3.2] : [0];
    zs.forEach(function (z, k) {
      brtVault(F, B, [-L / 2, z], [L / 2, z], W, H, 9);
      F.box(0, 0, z, L - 0.2, 0.08, W - 0.3, 0, BRT.earth, 'yard/stone');
      for (let i = 0; i < 6; i++) F.ell(-L / 2 + 1.5 + i * 2.6, 0.12, z + (brtU(F, 99, i, k) - 0.5) * 2.0, 0.9, 0.12, 0.6, brtU(F, 100, i, k) * 3, BRT.moss, 'straw/cloth');
      F.rod(-3.0, 0.3, z - 1.0, 2.5, 0.35, z - 0.8, 0.3, BRT.thornDry, 'bark');
      for (const s of [-1, 1]) brtGuy(B, [s * L / 2, H - 0.2, z], s * (L / 2 + 1.0), z + (k ? 1.6 : -1.6) * (v ? 1 : 0));
    });
    F.furn('br_h_trough', 0, 0, (v ? 3.2 : 0) + W / 2 + 1.2, 0, { v: 0 });
    B.flush();
  }
});
