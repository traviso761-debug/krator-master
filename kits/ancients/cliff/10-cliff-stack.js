// ================================================================= KCLIFF — the Ancients' cliff city as records ([G data])
// The Ancients' cantilevered cliff city (the kit's target `targets/shelf`, built 2026-09 as `targets/ledge`: pale slab layers stepping out of a cliff as an
// INVERTED ZIGGURAT, each layer reaching further than the one below, the top flush with the cliff top) as plain records, for any
// build that hangs one off its own cliff: Ledge (settlements/ledge, a 1,265 m face over the great lake) and Shelf (settlements/shelf,
// an 850 m face on the Outer Wall). Lifted from Ledge's rules (2026-11-22) when Shelf took the same form; no THREE, no DOM, no
// randomness: node-tested by each build's test. Its drawing half is 20-cliff-stack-draw.js.
//
// THE FRAME: x along the face, z out of it (the rock at z < 0), y up (metres above sea level). A build lays it on its world.
// A STACK S: {n, y0, pitch, slab, storey, storeys, plenum, w0, w1, r0, r1, rExp, root, gallery, cover, prow: {wing, k0, add},
//   wings: [{id, f0, f1, r}]}: n layers, floors at y0 + pitch k; a layer's width along the face from w0 to w1 and its reach out of the
//   rock from r0 to r0 + r1 (as t^rExp), each wing a share [f0, f1] of the width and r of the reach; the prow wing gains `add` from k0
// A DECK: one wing of one layer {id 'd.<k>.<wing>', k, wing, zone, state, by, use, people}
//
//   KCLIFF.layerY(S, k) / widthAt(S, k) / reachOf(S, k, w) / wing(S, id)
//   KCLIFF.deckBox(S, d)             {x0, x1, z0, z1, y0, y1, floor, reach, width}: the plan's footprint and band, whatever its state
//   KCLIFF.deckFloor(S, d)           its floor at the Ancients' peak: width x reach x cover x storeys
//   KCLIFF.decks(S, ruin, zoneOf)    the decks, a wing a layer, each taking the last row of the ruin table that covers it:
//                                    ruin rows [wings ('w1 c'), k0, k1, state, by, use]
//   KCLIFF.share(items, n, weight)   n shared out over items by weight, largest remainders (ties by id): the sums are exact
//   KCLIFF.area(S, decks, zones)     {floor, broken, brokenShare, lived, livedShare, rows by zone, peak}
//   KCLIFF.STATES, BROKEN, LIVED
var KCLIFF = (function () {
  var K = {};
  K.STATES = ['reclaimed', 'kept', 'squatted', 'dead', 'sealed', 'damaged', 'sheared', 'pancaked', 'gone'];
  K.BROKEN = ['damaged', 'sheared', 'pancaked', 'gone'];
  K.LIVED = ['reclaimed', 'kept', 'squatted'];
  K.layerY = function (S, k) { return S.y0 + S.pitch * k; };
  K.wing = function (S, id) { return S.wings.filter(function (w) { return w.id === id; })[0]; };
  K.widthAt = function (S, k) { var t = k / (S.n - 1); return S.w0 + (S.w1 - S.w0) * t; };
  K.reachOf = function (S, k, w) {
    var t = k / (S.n - 1), r = (S.r0 + S.r1 * Math.pow(t, S.rExp)) * w.r;
    if (S.prow && w.id === S.prow.wing && k >= S.prow.k0) r += S.prow.add * (k - S.prow.k0 + 1) / (S.n - S.prow.k0);
    return r;
  };
  K.deckBox = function (S, d) {
    var w = K.wing(S, d.wing), W = K.widthAt(S, d.k), r = K.reachOf(S, d.k, w), y = K.layerY(S, d.k);
    return { x0: W * w.f0, x1: W * w.f1, z0: 0, z1: r, y0: y - S.slab, y1: y + S.pitch - S.slab, floor: y, reach: r, width: W * (w.f1 - w.f0) };
  };
  K.deckFloor = function (S, d) { var b = K.deckBox(S, d); return b.width * b.reach * S.cover * S.storeys; };
  K.decks = function (S, ruin, zoneOf) {
    var out = [];
    for (var k = 0; k < S.n; k++) S.wings.forEach(function (w) {
      var d = { id: 'd.' + k + '.' + w.id, k: k, wing: w.id, zone: zoneOf(k), state: null, by: 'none', use: '', people: 0 };
      ruin.forEach(function (r) { if (k >= r[1] && k <= r[2] && r[0].split(' ').indexOf(w.id) >= 0) { d.state = r[3]; d.by = r[4]; d.use = r[5]; } });
      out.push(d);
    });
    return out;
  };
  K.share = function (items, n, weight) {
    var tot = items.reduce(function (a, x) { return a + weight(x); }, 0), given = 0;
    var sh = items.map(function (x) { var q = tot > 0 ? n * weight(x) / tot : 0; return { x: x, q: q, f: Math.floor(q) }; });
    sh.forEach(function (s) { s.x.people = s.f; given += s.f; });
    sh.slice().sort(function (a, b) { return (b.q - b.f) - (a.q - a.f) || (a.x.id < b.x.id ? -1 : 1); }).slice(0, n - given).forEach(function (s) { s.x.people++; });
    return items;
  };
  K.area = function (S, decks, zones) {
    var rows = {}, floor = 0, brk = 0, lived = 0;
    zones.forEach(function (z) { if (z.k) rows[z.id] = { zone: z.id, name: z.name, decks: 0, floor: 0, broken: 0, lived: 0, people: 0 }; });
    decks.forEach(function (d) {
      var f = K.deckFloor(S, d), r = rows[d.zone]; r.decks++; r.floor += f; floor += f; r.people += d.people;
      if (K.BROKEN.indexOf(d.state) >= 0) { r.broken += f; brk += f; }
      if (K.LIVED.indexOf(d.state) >= 0) { r.lived += f; lived += f; }
    });
    /* Span's rule: homes on half the floor at 35 m2 a head (settlements/span/PLAN.md section 3) */
    return { floor: floor, broken: brk, brokenShare: brk / floor, lived: lived, livedShare: lived / floor, rows: rows, peak: Math.round(floor * .5 / 35) };
  };
  // ---- the layout's shapes and walk (a build's parts and links, as Ledge and Shelf write them)
  //   K.bbox(shape) [x0, x1, z0, z1]; shapes ['box', x0, x1, z0, z1] | ['circ', x, z, r] | ['oval', x, z, a, b]
  //   K.inShape(shape, x, z, pad); K.overlap(a, b): two footprints overlap (touching is not overlap)
  //   K.graph(L, {strike}) {adj}: L.links [a, b, {strike}] (a strike drops the links it shuts) and every part's `in` to its parent
  //   K.reach(L, from, opt): the ids a walker reaches
  var EPS = .01;
  K.bbox = function (s) { if (!s) return null; if (s[0] === 'box') return [s[1], s[2], s[3], s[4]]; if (s[0] === 'oval') return [s[1] - s[3], s[1] + s[3], s[2] - s[4], s[2] + s[4]]; return [s[1] - s[3], s[1] + s[3], s[2] - s[3], s[2] + s[3]]; };
  K.inShape = function (s, x, z, pad) {
    pad = pad || 0;
    if (s[0] === 'box') return x >= s[1] - pad && x <= s[2] + pad && z >= s[3] - pad && z <= s[4] + pad;
    var a = s[3] + pad, b = (s[0] === 'oval' ? s[4] : s[3]) + pad, dx = (x - s[1]) / a, dz = (z - s[2]) / b; return dx * dx + dz * dz <= 1;
  };
  K.overlap = function (a, b) {
    var A = K.bbox(a), Bb = K.bbox(b);
    if (A[0] >= Bb[1] - EPS || Bb[0] >= A[1] - EPS || A[2] >= Bb[3] - EPS || Bb[2] >= A[3] - EPS) return false;
    if (a[0] === 'box' && b[0] === 'box') return true;
    var pts = function (s) {
      var o = [], i;
      if (s[0] === 'box') { for (i = 0; i <= 8; i++) { var t = i / 8; o.push([s[1] + (s[2] - s[1]) * t, s[3]], [s[1] + (s[2] - s[1]) * t, s[4]], [s[1], s[3] + (s[4] - s[3]) * t], [s[2], s[3] + (s[4] - s[3]) * t]); } }
      else for (i = 0; i < 64; i++) { var q = i / 64 * 2 * Math.PI, ra = s[3], rb = s[0] === 'oval' ? s[4] : s[3]; o.push([s[1] + ra * Math.cos(q), s[2] + rb * Math.sin(q)]); }
      var c = K.bbox(s); o.push([(c[0] + c[1]) / 2, (c[2] + c[3]) / 2]); return o;
    };
    return pts(a).some(function (p) { return K.inShape(b, p[0], p[1], -EPS); }) || pts(b).some(function (p) { return K.inShape(a, p[0], p[1], -EPS); });
  };
  K.graph = function (L, o) {
    o = o || {}; var adj = {}, add = function (a, b) { (adj[a] || (adj[a] = [])).push(b); (adj[b] || (adj[b] = [])).push(a); };
    L.links.forEach(function (k) { if (o.strike && k[2] && k[2].strike) return; add(k[0], k[1]); });
    L.parts.forEach(function (p) { if (p.in) add(p.id, p.in); });
    return { adj: adj };
  };
  K.reach = function (L, from, o) {
    var G = K.graph(L, o), seen = {}, st = [].concat(from); st.forEach(function (s) { seen[s] = 1; });
    while (st.length) { var q = st.pop(); (G.adj[q] || []).forEach(function (r) { if (!seen[r]) { seen[r] = 1; st.push(r); } }); }
    return seen;
  };
  return K;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KCLIFF;
