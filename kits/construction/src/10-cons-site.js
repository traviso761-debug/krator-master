/* ============================== kits/construction: A BUILDING SITE (2026-11-04) ============================== */
/* [web] The Construction kit (KCONS): the gear of a building going up, generic to every culture and sized from any
   footprint, so a settlement draws its empty lots and its works without its own building kit knowing about them (the
   owner, 2026-11-04: "make construction parts that are generic and modular so they can be their own kit vended to
   settlements"). It decides nothing: the host passes the record (a footprint, a height, the bill on site, how far along).
   The building itself is the settlement's own kit piece, revealed by core/city's KCITY.constructMesh (54-city-host-construct).
     KCONS.site({w, d, h, eaves?, plot?: [w, d], bill?: {good: n}, palette?}) -> {group, set(f, onSite?), parts}: the site in
                     the piece's frame (w, d, h the building's own box; eaves the scaffold's top, 0.6 h; plot the cleared
                     ground's size, the box and a metre round)
                     (origin at the footprint's centre, +z its front): a CLEARED PLOT (levelled earth a little past the
                     footprint) with corner STAKES and a string line; the MATERIALS beside it, one pile a good of the bill
                     (KCONS.PILES: timber a stack of logs, stone a heap of blocks, mats and thatch rolled bundles, anything
                     else crates), each shown by what is still on site (onSite: {good: share 0..1}, default all of it); the
                     SCAFFOLD round the building a metre out (poles, ledgers every 2 m, a board walk and a ladder), rising
                     with the walls to the eaves, shown while the work is under way (0 < f < 1); set(f) moves it. Plain materials (the
                     palette's colours): a host may swap them for its library's
     KCONS.PILES      good -> pile kind ('logs', 'blocks', 'bundles', 'crates'); a host adds its goods */
var KCONS = (function () {
  'use strict';
  var PILES = { timber: 'logs', logs: 'logs', planks: 'logs', stone: 'blocks', brick: 'blocks', bricks: 'blocks', mats: 'bundles', thatch: 'bundles', reeds: 'bundles', cloth: 'bundles', rope: 'bundles' };
  var PAL = { earth: 0x6e5a40, stake: 0x8a6a48, string: 0xe8e0c8, pole: 0x8c6c48, board: 0xa88a5e, log: 0x7a5a3a, block: 0x8a8478, bundle: 0xc2a868, crate: 0x9a7a50 };
  function mats(pal) { var o = {}; for (var k in pal) o[k] = new THREE.MeshLambertMaterial({ color: pal[k] }); return o; }
  function box(w, h, d, m, x, y, z, ry) { var k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y, z); if (ry) k.rotation.y = ry; return k; }
  function cyl(r, len, m, x, y, z, axis) { var g = new THREE.CylinderGeometry(r, r, len, 7); if (axis === 'x') g.rotateZ(Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2); var k = new THREE.Mesh(g, m); k.position.set(x, y, z); return k; }
  function pile(kind, M, size) {
    var g = new THREE.Group(), s = Math.max(0.6, size);
    if (kind === 'logs') { for (var r = 0; r < 3; r++) for (var i = 0; i < 4 - r; i++) g.add(cyl(0.16 * s, 3.2 * s, M.log, 0, 0.17 * s + r * 0.28 * s, (i - (3 - r) / 2) * 0.33 * s, 'x')); }
    else if (kind === 'blocks') { for (var j = 0; j < 7; j++) { var lv = j < 4 ? 0 : j < 6 ? 1 : 2, at = j < 4 ? j : j < 6 ? j - 4 : 0; g.add(box(0.5 * s, 0.32 * s, 0.4 * s, M.block, (at - (lv === 0 ? 1.5 : lv === 1 ? 0.5 : 0)) * 0.52 * s, 0.16 * s + lv * 0.33 * s, 0)); } }
    else if (kind === 'bundles') { for (var b = 0; b < 3; b++) g.add(cyl(0.3 * s, 1.2 * s, M.bundle, 0, 0.3 * s + (b === 2 ? 0.52 * s : 0), (b === 2 ? 0 : b - 0.5) * 0.62 * s, 'z')); }
    else { g.add(box(0.8 * s, 0.6 * s, 0.8 * s, M.crate, 0, 0.3 * s, 0)); g.add(box(0.6 * s, 0.5 * s, 0.6 * s, M.crate, 0.1 * s, 0.85 * s, 0.05 * s)); }
    return g;
  }
  function site(o) {
    var w = Math.max(3, o.w), d = Math.max(3, o.d), h = Math.max(2.5, o.h || 6), eaves = o.eaves == null ? h * 0.6 : o.eaves, M = mats(Object.assign({}, PAL, o.palette || {})), G = new THREE.Group();
    var pw0 = o.plot ? o.plot[0] : w + 2, pd0 = o.plot ? o.plot[1] : d + 2;
    var plot = new THREE.Group(), stuff = new THREE.Group(), scaf = new THREE.Group(); plot.name = 'plot'; stuff.name = 'materials'; scaf.name = 'scaffold';
    plot.add(box(pw0, 0.1, pd0, M.earth, 0, 0.05, 0));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { plot.add(box(0.08, 0.7, 0.08, M.stake, c[0] * w / 2, 0.35, c[1] * d / 2)); });
    [[0, -1, w], [0, 1, w], [-1, 0, d], [1, 0, d]].forEach(function (q) { plot.add(box(q[0] ? 0.02 : q[2], 0.02, q[0] ? q[2] : 0.02, M.string, q[0] * w / 2, 0.55, q[1] * d / 2)); });
    /* the materials, one pile a good, along the side of the plot (the piece's +x), in the bill's order */
    var goods = Object.keys(o.bill || { timber: 1, stone: 1 }), piles = {};
    goods.forEach(function (gd, i) { var P = pile(PILES[gd] || 'crates', M, Math.min(1.4, 0.8 + w / 30)); P.position.set(w / 2 + 2.2, 0, -d / 2 + 1.2 + i * Math.max(1.6, (d - 1) / Math.max(1, goods.length))); P.name = gd; stuff.add(P); piles[gd] = P; });
    /* the scaffold: poles round the footprint a metre out, every 2-3 m, ledgers every 2 m, a board walk on top, a ladder */
    var ox = w / 2 + 1, oz = d / 2 + 1, posts = [], nx = Math.max(2, Math.round(w / 2.5)), nz = Math.max(2, Math.round(d / 2.5));
    for (var i = 0; i <= nx; i++) { posts.push([-ox + 2 * ox * i / nx, -oz]); posts.push([-ox + 2 * ox * i / nx, oz]); }
    for (var j = 1; j < nz; j++) { posts.push([-ox, -oz + 2 * oz * j / nz]); posts.push([ox, -oz + 2 * oz * j / nz]); }
    var poleGeo = new THREE.CylinderGeometry(0.06, 0.07, 1, 6); poleGeo.translate(0, 0.5, 0);
    var poles = posts.map(function (p) { var k = new THREE.Mesh(poleGeo, M.pole); k.position.set(p[0], 0, p[1]); scaf.add(k); return k; });
    var lifts = []; for (var y = 2; y <= eaves + 1.5; y += 2) { var L = new THREE.Group();
      L.add(box(2 * ox, 0.06, 0.06, M.pole, 0, y, -oz)); L.add(box(2 * ox, 0.06, 0.06, M.pole, 0, y, oz)); L.add(box(0.06, 0.06, 2 * oz, M.pole, -ox, y, 0)); L.add(box(0.06, 0.06, 2 * oz, M.pole, ox, y, 0));
      L.add(box(2 * ox, 0.05, 0.5, M.board, 0, y + 0.05, -oz + 0.3)); L.add(box(2 * ox, 0.05, 0.5, M.board, 0, y + 0.05, oz - 0.3)); L.userData.y = y; scaf.add(L); lifts.push(L); }
    var ladder = new THREE.Group(); ladder.add(box(0.05, 1, 0.05, M.pole, -0.25, 0.5, 0)); ladder.add(box(0.05, 1, 0.05, M.pole, 0.25, 0.5, 0));
    for (var r = 0; r < 4; r++) ladder.add(box(0.5, 0.04, 0.04, M.pole, 0, 0.15 + r * 0.25, 0));
    ladder.position.set(ox + 0.4, 0, oz - 0.8); ladder.rotation.z = -0.25; scaf.add(ladder);
    G.add(plot); G.add(stuff); G.add(scaf); G.name = 'building site';
    var S = { group: G, parts: { plot: plot, materials: stuff, scaffold: scaf, piles: piles }, f: 0 };
    S.set = function (f, onSite) { f = Math.max(0, Math.min(1, f)); S.f = f;
      var top = Math.min(eaves + 1.5, 1.5 + f / 0.7 * eaves); scaf.visible = f > 0 && f < 1;   /* up with the walls, to the eaves by the time the roof goes on */
      poles.forEach(function (k) { k.scale.y = top + 0.8; });
      lifts.forEach(function (L) { L.visible = L.userData.y <= top; });
      ladder.scale.set(1, Math.max(1, top), 1);
      goods.forEach(function (gd) { var q = onSite && onSite[gd] != null ? onSite[gd] : 1 - f; var P = piles[gd]; P.visible = q > 0.02; P.scale.setScalar(Math.max(0.35, Math.sqrt(Math.max(0, q)))); });
      plot.visible = f < 1; stuff.visible = f < 1; return S; };
    S.set(0);
    return S;
  }
  return { site: site, PILES: PILES, PALETTE: PAL };
})();
