/* ============================== kits/construction: A BUILDING SITE (2026-11-04; polished 2026-11-09) ============================== */
/* [web] The Construction kit (KCONS): the gear of a building going up, generic to every culture and sized from any
   footprint, so a settlement draws its empty lots and its works without its own building kit knowing about them (the
   owner, 2026-11-04: "make construction parts that are generic and modular so they can be their own kit vended to
   settlements"). It decides nothing: the host passes the record (a footprint, a height, the bill on site, how far along).
   The building itself is the settlement's own kit piece, revealed by core/city's KCITY.constructMesh (54-city-host-construct).
     KCONS.site({w, d, h, eaves?, plot?: [w, d], bill?: {good: n}, palette?, mats?}) -> {group, set(f, onSite?), parts, f}: the
                     site in the piece's frame (w, d, h the building's own box; eaves the scaffold's top, 0.6 h; plot the
                     cleared ground's size, the box and a metre round) (origin at the footprint's centre, +z its front):
                     a CLEARED PLOT (levelled earth a little past the footprint) with corner STAKES and a string line; the
                     MATERIALS beside it, one pile a good of the bill (KCONS.PILES: timber a stack of logs, planks a stack of
                     boards, stone a heap of blocks, bricks a stacked pallet, sand and lime a heap, mats and thatch rolled
                     bundles, rope coils, anything else crates under a tarp), each shown by what is still on site (onSite:
                     {good: share 0..1}, default all of it); the SCAFFOLD round the building a metre out (poles, ledgers every
                     2 m with the transoms a hand lower, a board walk and a ladder leaning on it), rising with the walls to
                     the eaves, shown while the work is under way (0 < f < 1); set(f) moves it.
                     Materials: by default each site makes plain Lambert materials from the palette's colours (KCONS.PALETTE
                     over `palette`); `mats` is a table of the same keys shared by every site (KCONS.libMats, 20-cons-lib.js:
                     the library's maps), which then wins. Every box and pole carries world-unit UVs (a metre is one UV
                     unit), so a library map tiles by its own scale whatever the piece's size. Every mesh is named and
                     carries userData.cons (its palette key) and userData.consPart (plot, pile, scaffold, ladder)
     KCONS.PILES      good -> pile kind ('logs', 'planks', 'blocks', 'bricks', 'heap', 'bundles', 'coils', 'crates'); a host adds its goods
     KCONS.PALETTE    the palette's keys and colours */
var KCONS = (function () {
  'use strict';
  var PILES = { timber: 'logs', logs: 'logs', poles: 'logs', planks: 'planks', boards: 'planks', stone: 'blocks', blocks: 'blocks', brick: 'bricks', bricks: 'bricks',
    sand: 'heap', lime: 'heap', clay: 'heap', gravel: 'heap', mortar: 'heap', mats: 'bundles', thatch: 'bundles', reeds: 'bundles', cloth: 'bundles', rope: 'coils' };
  var PAL = { earth: 0x6e5a40, stake: 0x8a6a48, string: 0xe8e0c8, pole: 0x8c6c48, board: 0xa88a5e, log: 0x7a5a3a, block: 0x8a8478, bundle: 0xc2a868, crate: 0x9a7a50,
    brick: 0x9a5040, sand: 0xc8b48a, rope: 0xb8a070, canvas: 0xc8bca0 };
  function mats(pal) { var o = {}; for (var k in pal) o[k] = new THREE.MeshLambertMaterial({ color: pal[k] }); return o; }
  /* world-unit UVs: a box's faces in metres (BoxGeometry's faces: +x -x (d by h), +y -y (w by d), +z -z (w by h)); a
     cylinder's side round its girth and along its length */
  function wuvBox(g, w, h, d) { var uv = g.attributes.uv, F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (var f = 0; f < 6; f++) for (var i = 0; i < 4; i++) { var k = f * 4 + i; uv.setXY(k, uv.getX(k) * F[f][0], uv.getY(k) * F[f][1]); } return g; }
  function wuvCyl(g, r, len) { var uv = g.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2 * Math.PI * r, uv.getY(i) * len); return g; }
  function tag(k, key, part, name) { k.userData.cons = key; k.userData.consPart = part; k.name = name || part + ' ' + key; return k; }
  function box(w, h, d, M, key, x, y, z, part) { var k = new THREE.Mesh(wuvBox(new THREE.BoxGeometry(w, h, d), w, h, d), M[key]); k.position.set(x, y, z); return tag(k, key, part || 'pile'); }
  function cyl(r, len, M, key, x, y, z, axis, part) { var g = wuvCyl(new THREE.CylinderGeometry(r, r, len, 7), r, len); if (axis === 'x') g.rotateZ(Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2);
    var k = new THREE.Mesh(g, M[key]); k.position.set(x, y, z); return tag(k, key, part || 'pile'); }
  function pile(kind, M, size) {
    var g = new THREE.Group(), s = Math.max(0.6, size);
    if (kind === 'logs') { for (var r = 0; r < 3; r++) for (var i = 0; i < 4 - r; i++) g.add(cyl(0.16 * s, 3.2 * s, M, 'log', 0, 0.16 * s + r * 0.28 * s, (i - (3 - r) / 2) * 0.33 * s, 'x')); }
    else if (kind === 'planks') { for (var p = 0; p < 6; p++) for (var q = 0; q < 3; q++) g.add(box(3 * s, 0.05 * s, 0.24 * s, M, 'board', (p % 2) * 0.1 * s, 0.025 * s + p * 0.05 * s + (p > 2 ? 0.05 * s : 0), (q - 1) * 0.26 * s));
      [-1, 1].forEach(function (e) { g.add(box(0.08 * s, 0.05 * s, 0.8 * s, M, 'crate', e * 1.1 * s, 0.175 * s, 0)); }); }   /* two stickers between the courses */
    else if (kind === 'blocks') { for (var j = 0; j < 7; j++) { var lv = j < 4 ? 0 : j < 6 ? 1 : 2, at = j < 4 ? j : j < 6 ? j - 4 : 0; g.add(box(0.5 * s, 0.32 * s, 0.4 * s, M, 'block', (at - (lv === 0 ? 1.5 : lv === 1 ? 0.5 : 0)) * 0.52 * s, 0.16 * s + lv * 0.32 * s, 0)); } }
    else if (kind === 'bricks') { g.add(box(1.0 * s, 0.1 * s, 0.9 * s, M, 'crate', 0, 0.05 * s, 0));   /* the pallet, and two stacks on it */
      [-0.24, 0.24].forEach(function (x) { g.add(box(0.46 * s, 0.6 * s, 0.86 * s, M, 'brick', x * s, 0.4 * s, 0)); }); }
    else if (kind === 'heap') { var cg = new THREE.ConeGeometry(0.9 * s, 0.7 * s, 10, 1, true); cg.translate(0, 0.35 * s, 0); wuvCyl(cg, 0.45 * s, 0.9 * s);
      g.add(tag(new THREE.Mesh(cg, M.sand), 'sand', 'pile')); }
    else if (kind === 'bundles') { for (var b = 0; b < 3; b++) g.add(cyl(0.3 * s, 1.2 * s, M, 'bundle', 0, 0.3 * s + (b === 2 ? 0.52 * s : 0), (b === 2 ? 0 : b - 0.5) * 0.62 * s, 'z')); }
    else if (kind === 'coils') { for (var c = 0; c < 3; c++) { var tg = new THREE.TorusGeometry(0.28 * s, 0.07 * s, 6, 14); tg.rotateX(Math.PI / 2); wuvCyl(tg, 0.28 * s, 2 * Math.PI * 0.07 * s);
      var t = tag(new THREE.Mesh(tg, M.rope), 'rope', 'pile'); t.position.set((c === 2 ? 0 : c - 0.5) * 0.7 * s, 0.07 * s + (c === 2 ? 0.14 * s : 0), 0); g.add(t); } }
    else { g.add(box(0.8 * s, 0.6 * s, 0.8 * s, M, 'crate', 0, 0.3 * s, 0)); g.add(box(0.6 * s, 0.5 * s, 0.6 * s, M, 'crate', 0.1 * s, 0.85 * s, 0.05 * s));
      g.add(box(0.66 * s, 0.03 * s, 0.66 * s, M, 'canvas', 0.1 * s, 1.115 * s, 0.05 * s)); }   /* a tarp over the top crate */
    return g;
  }
  function site(o) {
    var w = Math.max(3, o.w), d = Math.max(3, o.d), h = Math.max(2.5, o.h || 6), eaves = o.eaves == null ? h * 0.6 : o.eaves, G = new THREE.Group();
    var M = Object.assign(mats(Object.assign({}, PAL, o.palette || {})), o.mats || {});
    var pw0 = o.plot ? o.plot[0] : w + 2, pd0 = o.plot ? o.plot[1] : d + 2;
    var plot = new THREE.Group(), stuff = new THREE.Group(), scaf = new THREE.Group(); plot.name = 'plot'; stuff.name = 'materials'; scaf.name = 'scaffold';
    plot.add(box(pw0, 0.1, pd0, M, 'earth', 0, 0.05, 0, 'plot'));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { plot.add(box(0.08, 0.7, 0.08, M, 'stake', c[0] * w / 2, 0.35, c[1] * d / 2, 'plot')); });
    [[0, -1, w], [0, 1, w], [-1, 0, d], [1, 0, d]].forEach(function (q) { plot.add(box(q[0] ? 0.02 : q[2], 0.02, q[0] ? q[2] : 0.02, M, 'string', q[0] * w / 2, 0.55, q[1] * d / 2, 'plot')); });
    /* the materials, one pile a good, along the side of the plot (the piece's +x), in the bill's order */
    /* (each pile's near end half a metre past the scaffold line, so the long goods, logs and planks, clear the poles) */
    var goods = Object.keys(o.bill || { timber: 1, stone: 1 }), piles = {}, ps = Math.min(1.4, 0.8 + w / 30), LONG = { logs: 1.6, planks: 1.6 };
    goods.forEach(function (gd, i) { var kind = PILES[gd] || 'crates', P = pile(kind, M, ps); P.position.set(w / 2 + 1.5 + (LONG[kind] || 0.6) * Math.max(0.6, ps), 0, -d / 2 + 1.2 + i * Math.max(1.6, (d - 1) / Math.max(1, goods.length)));
      P.name = 'pile ' + gd; P.userData.good = gd; P.userData.kind = kind; stuff.add(P); piles[gd] = P; });
    /* the scaffold: poles round the footprint a metre out, every 2-3 m; ledgers along x every 2 m, the transoms along z a hand
       lower (so no two members share a face), a board walk on the ledgers of the long sides, a ladder leaning on the -x side (the piles keep the +x) */
    var ox = w / 2 + 1, oz = d / 2 + 1, posts = [], nx = Math.max(2, Math.round(w / 2.5)), nz = Math.max(2, Math.round(d / 2.5)), lmax = eaves + 1.5;
    for (var i = 0; i <= nx; i++) { posts.push([-ox + 2 * ox * i / nx, -oz]); posts.push([-ox + 2 * ox * i / nx, oz]); }
    for (var j = 1; j < nz; j++) { posts.push([-ox, -oz + 2 * oz * j / nz]); posts.push([ox, -oz + 2 * oz * j / nz]); }
    var poleGeo = wuvCyl(new THREE.CylinderGeometry(0.06, 0.07, 1, 6), 0.065, 1); poleGeo.translate(0, 0.5, 0);
    var poles = posts.map(function (p, n) { var k = tag(new THREE.Mesh(poleGeo, M.pole), 'pole', 'scaffold', 'pole ' + n); k.position.set(p[0], 0, p[1]); scaf.add(k); return k; });
    var lifts = []; for (var y = 2; y <= lmax; y += 2) { var L = new THREE.Group(); L.name = 'lift ' + y;
      L.add(box(2 * ox, 0.06, 0.06, M, 'pole', 0, y, -oz, 'scaffold')); L.add(box(2 * ox, 0.06, 0.06, M, 'pole', 0, y, oz, 'scaffold'));
      L.add(box(0.06, 0.06, 2 * oz, M, 'pole', -ox, y - 0.07, 0, 'scaffold')); L.add(box(0.06, 0.06, 2 * oz, M, 'pole', ox, y - 0.07, 0, 'scaffold'));
      L.add(box(2 * ox, 0.05, 0.5, M, 'board', 0, y + 0.055, -oz + 0.22, 'scaffold')); L.add(box(2 * ox, 0.05, 0.5, M, 'board', 0, y + 0.055, oz - 0.22, 'scaffold')); L.userData.y = y; scaf.add(L); lifts.push(L); }
    /* the ladder: rungs along z every 0.3 m up its whole length, two rails of a metre scaled to the height reached, leaning
       toward the building (rotation about z), its feet on the ground a lean's width out from the scaffold, its head on the
       outer transom */
    var LEAN = 0.25, ladder = new THREE.Group(), rails = [], rungs = []; ladder.name = 'ladder';
    var railGeo = wuvBox(new THREE.BoxGeometry(0.05, 1, 0.05), 0.05, 1, 0.05); railGeo.translate(0, 0.5, 0);
    [-0.25, 0.25].forEach(function (z) { var k = tag(new THREE.Mesh(railGeo, M.pole), 'pole', 'ladder', 'ladder rail'); k.position.set(0, 0, z); ladder.add(k); rails.push(k); });
    for (var r = 0.3; r < lmax + 0.8; r += 0.3) { var g = box(0.04, 0.04, 0.5, M, 'pole', 0, r, 0, 'ladder'); g.name = 'ladder rung'; ladder.add(g); rungs.push(g); }
    ladder.rotation.z = -LEAN; ladder.position.set(-ox - 0.4, 0, oz - 0.8); scaf.add(ladder);
    G.add(plot); G.add(stuff); G.add(scaf); G.name = 'building site';
    var S = { group: G, parts: { plot: plot, materials: stuff, scaffold: scaf, piles: piles, ladder: ladder }, f: 0, eaves: eaves };
    S.set = function (f, onSite) { f = Math.max(0, Math.min(1, f)); S.f = f;
      var top = Math.min(lmax, 1.5 + f / 0.7 * eaves); scaf.visible = f > 0 && f < 1;   /* up with the walls, to the eaves by the time the roof goes on */
      poles.forEach(function (k) { k.scale.y = top + 0.8; });
      lifts.forEach(function (L) { L.visible = L.userData.y <= top; });
      var len = (top + 0.8) / Math.cos(LEAN);   /* the rails reach the top lift's rail; the rungs above them go */
      rails.forEach(function (k) { k.scale.y = len; }); rungs.forEach(function (k) { k.visible = k.position.y < len - 0.1; });
      ladder.position.x = -ox - 0.12 - len * Math.sin(LEAN);
      goods.forEach(function (gd) { var q = onSite && onSite[gd] != null ? onSite[gd] : 1 - f; var P = piles[gd]; P.visible = q > 0.02; P.scale.setScalar(Math.max(0.35, Math.sqrt(Math.max(0, q)))); });
      plot.visible = f < 1; stuff.visible = f < 1; return S; };
    S.set(0);
    return S;
  }
  return { site: site, PILES: PILES, PALETTE: PAL };
})();
