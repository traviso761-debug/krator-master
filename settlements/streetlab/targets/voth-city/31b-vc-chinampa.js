/* ============================== 4b. THE CHINAMPAS, DRAWN AGAIN ============================== */
/* [G data] Voth's chinampa pass (settlements/voth/src/55-chinampa.js, run whole by build.py's runChinampas) lays the
   beds out: rows of 14 x 27 m beds off the shoreline, canals between, marsh beds near the river mouth, a stilt hut in
   place of a bed now and then. Its own drawing (a mud slab, one green box for the crop, blob willows, a hovel on a
   deck) gives way here to the owner's quality pass (2026-10-09: "get them to comparable level to newer voth buildings
   and add real swbay flora instead of placeholder"). Each bed is a record (VC.CHIN.beds) and is drawn from it in Voth's
   own primitives:
   - the fill, mud from the lake bed, and a crowned top of dark worked soil;
   - the wattle that holds it: stakes along every edge, two woven withy bands between them;
   - its crop, in rows along its length, one crop a bed (TUNE.chin.crops): maize (tall, a tassel line), beans on
     their poles, squash (low leafy mounds), amaranth (red), marigolds (orange), greens, or a seedbed of soil squares;
     a marsh bed is reed and sedge;
   - now and then a canoe tied at its end, or a plank across the canal to the next row;
   - its trees and bank plants are the swbay biome's (VC.CHIN.flora: the host's VC.floraPlace builds them with
     SWBAY.treeAt / plantAt): crown ferns and splay shrubs on the banks of a mature bed, where Voth had blob willows;
     reeds and sedge on a marsh bed and along the banks.
   A stilt hut becomes Voth's newer shore house on piles (voth_house_poor, variant 4: deck, porch, boat landing,
   door and windows), drawn instanced as district art. Every choice is a KRAND hash of the bed's place and a salt. */
VC.CHIN = { beds: [], huts: [], flora: [] };
/* a bed's own random number: KRAND, seeded by where it is (never by how many draws came before) */
VC.chinU = function (u, salt) { return KRAND.unit(KRAND.hash(5501, Math.round(u.x * 4), Math.round(u.z * 4), salt)); };
VC.chinampaPrims = function (units) {
  var B = VOTH, K = TUNE.chin, P = B.PAL, out = [], beds = [], huts = [], flora = [], n = { beds: 0, huts: 0, canoes: 0, planks: 0 };
  var push = function () { out.push([].slice.call(arguments)); };
  var BOX = function (x, y, z, w, h, d, ry, c, f) { push('box', x, y, z, w, h, d, ry || 0, c, f); };
  var BLOB = function (x, y, z, r, h, ry, c) { push('blob', x, y, z, r, h, r, ry || 0, c, 'leaf'); };
  var loc = B.loc, pick = function (a, u) { return a[Math.floor(u * a.length) % a.length]; };
  var shade = B.shade;
  (units || []).forEach(function (u, i) {
    var bed = B.terrainHe(u.x, u.z);
    if (u.isHut) {
      if (bed < -1.5 && bed > -15) { huts.push({ key: K.hut[0], v: K.hut[1], x: u.x, y: B.SEA + K.hutY, z: u.z, ry: u.ry + (VC.chinU(u, 1) < 0.5 ? 0 : Math.PI) }); n.huts++; }
      return;
    }
    if (bed > -1.1 || bed < -19) return;
    var marsh = u.marsh, top = (marsh ? K.marshTop : K.top) + (VC.chinU(u, 2) - 0.5) * 0.4, bw = u.bw, bl = u.bl, ry = u.ry;
    var mud = pick(P.mud, VC.chinU(u, 3)), soil = shade(mud, -0.28), stake = 0x6b5a44, withy = 0x8a7656;
    var rec = { i: i, x: u.x, z: u.z, ry: ry, bw: bw, bl: bl, top: top, marsh: marsh };
    /* the fill, and the worked soil crowning it */
    BOX(u.x, bed - 0.6, u.z, bw, top - 0.3 - bed + 0.6, bl, ry, mud, 'soil');
    BOX(u.x, top - 0.3, u.z, bw * 0.97, 0.36, bl * 0.985, ry, soil, 'soil');
    /* the wattle: stakes along the two long sides and the ends, two withy bands woven between them */
    [-1, 1].forEach(function (s) {
      for (var k = 0; k < K.stakes; k++) { var a = ((k + 0.5) / K.stakes - 0.5) * bl, p = loc(u.x, u.z, s * (bw / 2 + 0.06), a, ry); BOX(p[0], -0.6, p[1], 0.2, top + 0.55, 0.2, ry, shade(stake, (k % 3) * 0.04), 'wood'); }
      var e = loc(u.x, u.z, s * (bw / 2 + 0.12), 0, ry);
      BOX(e[0], top - 0.62, e[1], 0.14, 0.2, bl, ry, withy, 'wood'); BOX(e[0], top - 0.22, e[1], 0.14, 0.2, bl, ry, shade(withy, 0.05), 'wood');
      for (var k2 = 0; k2 < 2; k2++) { var p2 = loc(u.x, u.z, (k2 - 0.5) * bw * 0.6, s * (bl / 2 + 0.06), ry); BOX(p2[0], -0.6, p2[1], 0.2, top + 0.5, 0.2, ry, stake, 'wood'); }
      var e2 = loc(u.x, u.z, 0, s * (bl / 2 + 0.12), ry); BOX(e2[0], top - 0.45, e2[1], bw, 0.2, 0.14, ry, withy, 'wood');
    });
    if (marsh) {
      /* a marsh bed: the biome's reeds and sedge over a wet top */
      for (var r = 0; r < K.marshReeds; r++) { var p3 = loc(u.x, u.z, (VC.chinU(u, 10 + r) - 0.5) * bw * 0.8, (VC.chinU(u, 30 + r) - 0.5) * bl * 0.9, ry); flora.push({ plant: VC.chinU(u, 50 + r) < 0.6 ? 'reed' : 'sedge', x: p3[0], y: top, z: p3[1] }); }
      rec.crop = 'marsh';
    } else {
      /* one crop a bed, in rows along it */
      var cu = VC.chinU(u, 4), acc = 0, crop = 'greens'; for (var c in K.crops) { acc += K.crops[c]; if (cu < acc) { crop = c; break; } }
      rec.crop = crop;
      var rows = crop === 'seedbed' ? 0 : K.rows, len = bl * 0.86;
      for (var w = 0; w < rows; w++) {
        var ox = ((w + 0.5) / rows - 0.5) * bw * 0.78, p4 = loc(u.x, u.z, ox, 0, ry), g = pick(P.crop, VC.chinU(u, 60 + w));
        BOX(p4[0], top + 0.04, p4[1], 0.9, 0.22, len, ry, shade(soil, 0.06), 'soil');                       /* the ridge */
        if (crop === 'maize') { BOX(p4[0], top + 0.2, p4[1], 0.55, K.maizeH, len * 0.97, ry, shade(g, 0.05), 'leaf'); BOX(p4[0], top + 0.2 + K.maizeH, p4[1], 0.18, 0.35, len * 0.95, ry, 0xc9b25a, 'leaf'); }
        else if (crop === 'beans') { for (var b = 0; b < 6; b++) { var q = loc(p4[0], p4[1], 0, ((b + 0.5) / 6 - 0.5) * len, ry); BOX(q[0], top + 0.1, q[1], 0.12, 2.3, 0.12, ry, stake, 'wood'); } BOX(p4[0], top + 0.2, p4[1], 0.6, 1.9, len * 0.95, ry, shade(g, -0.12), 'leaf'); }
        else if (crop === 'squash') { for (var m = 0; m < 4; m++) { var q2 = loc(p4[0], p4[1], 0, ((m + 0.5) / 4 - 0.5) * len, ry); BLOB(q2[0], top + 0.15, q2[1], 1.05, 0.7, VC.chinU(u, 70 + m) * 3, shade(g, -0.06)); } }
        else if (crop === 'amaranth') BOX(p4[0], top + 0.2, p4[1], 0.6, K.amaranthH, len * 0.95, ry, pick([0x8a3a3a, 0x9a4a3a, 0x7a3040], VC.chinU(u, 80 + w)), 'leaf');
        else if (crop === 'marigold') { BOX(p4[0], top + 0.2, p4[1], 0.7, 0.5, len * 0.95, ry, shade(g, -0.1), 'leaf'); BOX(p4[0], top + 0.7, p4[1], 0.6, 0.18, len * 0.93, ry, pick([0xe08a2a, 0xe8a030, 0xd8742a], VC.chinU(u, 90 + w)), 'leaf'); }
        else BOX(p4[0], top + 0.2, p4[1], 0.75, 0.45, len * 0.95, ry, g, 'leaf');
      }
      if (crop === 'seedbed') {
        /* a chapin: the seedbed cut into squares, each a seedling plug */
        for (var sx = 0; sx < 4; sx++) for (var sz = 0; sz < 8; sz++) { var q3 = loc(u.x, u.z, ((sx + 0.5) / 4 - 0.5) * bw * 0.82, ((sz + 0.5) / 8 - 0.5) * bl * 0.86, ry); BOX(q3[0], top + 0.04, q3[1], bw * 0.82 / 4 - 0.35, 0.16 + 0.1 * VC.chinU(u, 100 + sx * 8 + sz), bl * 0.86 / 8 - 0.35, ry, shade(pick(P.crop, VC.chinU(u, 200 + sz)), -0.05), 'leaf'); }
      }
      /* a mature bed's banks: the biome's trees where Voth had blob willows (crown ferns, splay shrubs) */
      if (VC.chinU(u, 5) < K.mature) {
        var nt = 1 + Math.floor(VC.chinU(u, 6) * K.trees);
        for (var t = 0; t < nt; t++) { var side = VC.chinU(u, 120 + t) < 0.5 ? -1 : 1, p5 = loc(u.x, u.z, side * (bw / 2 - 0.9), ((t + 0.5) / nt - 0.5) * bl * 0.84, ry);
          flora.push({ tree: VC.chinU(u, 130 + t) < K.fernShare ? 'treefern' : 'splay', x: p5[0], y: top, z: p5[1], H: K.treeH[0] + (K.treeH[1] - K.treeH[0]) * VC.chinU(u, 140 + t) }); }
        rec.mature = true;
      }
    }
    /* the banks' own plants: sedge at the corners, now and then a shrub */
    for (var bk = 0; bk < K.bankPlants; bk++) { var s2 = bk % 2 ? -1 : 1, p6 = loc(u.x, u.z, s2 * (bw / 2 - 0.5), (VC.chinU(u, 150 + bk) - 0.5) * bl * 0.9, ry); flora.push({ plant: VC.chinU(u, 160 + bk) < 0.75 ? 'sedge' : 'shrub', x: p6[0], y: top, z: p6[1] }); }
    /* a canoe tied at the bed's end, in its canal */
    if (VC.chinU(u, 7) < K.canoe) {
      var ce = loc(u.x, u.z, (VC.chinU(u, 8) - 0.5) * bw * 0.5, (bl / 2 + 1.6) * (VC.chinU(u, 9) < 0.5 ? -1 : 1), ry + Math.PI / 2), cry = ry + Math.PI / 2;
      BOX(ce[0], B.SEA - 0.25, ce[1], 1.1, 0.55, 6.2, cry, 0x5a4632, 'wood');
      [-1, 1].forEach(function (s3) { var cs = loc(ce[0], ce[1], s3 * 0.55, 0, cry); BOX(cs[0], B.SEA + 0.25, cs[1], 0.12, 0.22, 6.0, cry, 0x6b5440, 'wood'); });
      BOX(ce[0], B.SEA + 0.32, ce[1], 0.9, 0.08, 0.5, cry, 0x7a6448, 'wood'); n.canoes++;
    }
    /* a plank across the canal to the next row (Voth's beds keep 6 m canals between rows) */
    if (VC.chinU(u, 11) < K.plank) {
      var pp = loc(u.x, u.z, (bw / 2 + 3.0) * (VC.chinU(u, 12) < 0.5 ? -1 : 1), (VC.chinU(u, 13) - 0.5) * bl * 0.6, ry);
      BOX(pp[0], top + 0.05, pp[1], 6.6, 0.18, 1.1, ry, 0x8a7254, 'wood'); n.planks++;
    }
    beds.push(rec); n.beds++;
  });
  VC.CHIN = { beds: beds, huts: huts, flora: flora, n: n };
  return out;
};
