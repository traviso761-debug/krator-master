/* ==================== core/hamlet 14: the farmland round a farming village (plain data, [G data]) ==================== */
/* settlements/isle-demo/PLAN.md section 11 (2026-11-09). A farming village works FARMLAND: parcels of ground round it, some in
   crop this year and the rest resting (shifting gardens: `fallow` years of rest for each in crop; 0 for permanent fields).
   No three.js, no DOM: a node test and Godot run it. Every parcel is a function of the world seed, the farmland's id and
   the parcel's own grid cell (core/rand: never of how many came before), on a grid anchored at the world's origin, so the
   same parcels come out on any page.
     KHAMLET.FARM                 the tunables (below; the historical estimate of PLAN.md section 11)
     KHAMLET.farmNeed(people, o)  -> {people, inCrop (ha), farmed (ha, with the fallow), hands}: the land a population needs
     KHAMLET.farmland(spec)       -> {id, kind: 'farmland', centre, parcel, parcels: [{id, x, z, y?, size, crop, kind, state
                                     ('crop' | 'fallow' | 'yard'), rot, block, farm}], inCropHa, farmedHa, target, hands,
                                     capped, crops, poly (the hull of the parcels' corners), cap (km2 farmed), grade,
                                     holdings: [{farm, x, z, parcels, inCropHa}], records: [the farmhouses], tracks: [{id,
                                     kind 'track', w, pts: [[x, z], [x, z]], farm}]}
       spec: {id, world (a seed), centre {x, z}, hands (the posts that work it: in crop = hands x haPerHand), crops
              [{crop, kind ('field' | 'orchard'), w, maxSlope?, minH?, maxH?}], ground {ok(x, z) -> bool, h(x, z)?,
              slope(x, z)? (rise over run)}, avoid(x, z, r) -> bool (ground the parcels keep off: the village's own
              buildings and lanes), parcel? (m), block? (parcels a side sharing one crop and one rotation year), fallow?,
              haPerHand?, rMax? (m from the centre), grade?,
              farms? {key, n, box {w, d, h}} (the farmsteads the village kept out of its layout: 30's `outWorks`),
              from? {x, z} (where the farm tracks start: the village's works lane end)}
     THE HOLDINGS (the owner, 2026-11-09: a farmhouse on every field, a road to each): with `farms`, the farmland is
     divided among n holdings, one farmhouse each. The farmhouses stand on a yard parcel each, spread over the land on a
     sunflower spiral from the centre (a hash turns it), a resting parcel preferred, at least FARM.farmGap apart; every
     other parcel belongs to the nearest farmhouse. The FARM TRACKS are a tree from `from`: each farmhouse in turn (the
     nearest unjoined to the network so far) is joined by a straight track to the nearest point already on it (the root
     or another farmhouse's door), so the tracks branch out through the holdings rather than each running back to the
     village; a farmhouse faces the track that reaches it.
     KHAMLET.farmlandHash(F)      a placement hash (parcels, crops, states, farmhouses), for determinism checks
   The parcels are laid out from the centre outward (nearest first; ties by grid index) over every cell the ground takes
   (`ground.ok` at the parcel's middle and its four quarter points, `avoid` false, a crop of the list accepting its slope
   and height), each block drawing its crop (by weight) and its rotation year from a hash, until the land in crop reaches
   the hands' (`capped` when `rMax` runs out first). */

KHAMLET.FARM = {
  perPerson: 0.075,   /* ha in crop a person: roots and rice at Oceania field yields (about 8 million kcal a hectare a year), with fish a quarter of the diet */
  haPerHand: 0.75,    /* ha in crop one farm hand works by hand (0.5 to 1 in the historical range) */
  fallow: 3,          /* years resting for each year in crop (shifting gardens; the owner's open question: 0 for permanent fields) */
  parcel: 60,         /* a parcel's side, m (0.36 ha) */
  block: 3,           /* parcels a side of a block: one crop and one rotation year a block */
  rMax: 2500,         /* how far from the farmland's centre the parcels are laid, m */
  slopeMax: 0.12,     /* the steepest ground a crop takes unless its row says otherwise (rise over run) */
  farmGap: 110,       /* the least distance between two farmhouses, m */
  track: 4            /* a farm track's width, m */
};

KHAMLET.farmNeed = function (people, o) {
  var F = KHAMLET.FARM, per = o && o.perPerson != null ? o.perPerson : F.perPerson, hand = o && o.haPerHand != null ? o.haPerHand : F.haPerHand;
  var fallow = o && o.fallow != null ? o.fallow : F.fallow, inCrop = people * per;
  return { people: people, inCrop: Math.round(inCrop * 10) / 10, farmed: Math.round(inCrop * (1 + fallow) * 10) / 10, hands: Math.ceil(inCrop / hand) };
};

KHAMLET.farmland = function (spec) {
  var F = KHAMLET.FARM, K = KRAND, P = spec.parcel == null ? F.parcel : spec.parcel, BL = spec.block == null ? F.block : spec.block;
  var fallow = spec.fallow == null ? F.fallow : spec.fallow, hand = spec.haPerHand == null ? F.haPerHand : spec.haPerHand, rMax = spec.rMax == null ? F.rMax : spec.rMax;
  var crops = spec.crops || [], g = spec.ground || {}, okAt = function (x, z) { return !g.ok || g.ok(x, z); };
  var hAt = g.h ? g.h : null, slopeAt = g.slope ? g.slope : (hAt ? function (x, z) { return Math.max(Math.abs(hAt(x + 4, z) - hAt(x - 4, z)), Math.abs(hAt(x, z + 4) - hAt(x, z - 4))) / 8; } : null);
  var seed = K.hash(K.child(spec.world >>> 0, 'farmland'), KHAMLET.idHash(spec.id)), c = spec.centre, ha = P * P / 1e4, target = spec.hands * hand;
  var out = { id: spec.id, kind: 'farmland', centre: { x: c.x, z: c.z }, parcel: P, parcels: [], inCropHa: 0, farmedHa: 0, target: Math.round(target * 10) / 10, hands: spec.hands,
              capped: false, crops: crops.map(function (C) { return C.crop; }), poly: [], cap: 0, grade: spec.grade == null ? 'medium' : spec.grade };
  if (!crops.length || !(spec.hands > 0)) return out;
  /* the cells within rMax, nearest the centre first */
  var n = Math.ceil(rMax / P), i0 = Math.floor(c.x / P), j0 = Math.floor(c.z / P), cells = [];
  for (var j = j0 - n; j <= j0 + n; j++) for (var i = i0 - n; i <= i0 + n; i++) {
    var x = (i + 0.5) * P, z = (j + 0.5) * P, d = Math.hypot(x - c.x, z - c.z);
    if (d <= rMax) cells.push({ i: i, j: j, x: x, z: z, d: d });
  }
  cells.sort(function (a, b) { return a.d - b.d || a.i - b.i || a.j - b.j; });
  var pick = function (bi, bj, opts) {
    var tot = 0, k; for (k = 0; k < opts.length; k++) tot += opts[k].w == null ? 1 : opts[k].w;
    var r = K.unit(K.hash(seed, 13, bi, bj)) * tot;
    for (k = 0; k < opts.length; k++) { r -= opts[k].w == null ? 1 : opts[k].w; if (r <= 0) return opts[k]; }
    return opts[opts.length - 1];
  };
  var pts = [], corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (var q = 0; q < cells.length && out.inCropHa < target - 1e-9; q++) {
    var C = cells[q], ok = okAt(C.x, C.z), k2;
    for (k2 = 0; k2 < 4 && ok; k2++) ok = okAt(C.x + corners[k2][0] * P * 0.4, C.z + corners[k2][1] * P * 0.4);
    if (!ok || (spec.avoid && spec.avoid(C.x, C.z, P * 0.71))) continue;
    var sl = slopeAt ? slopeAt(C.x, C.z) : 0, y = hAt ? hAt(C.x, C.z) : null;
    var opts = crops.filter(function (Cr) { return sl <= (Cr.maxSlope == null ? F.slopeMax : Cr.maxSlope) && (Cr.minH == null || y == null || y >= Cr.minH) && (Cr.maxH == null || y == null || y <= Cr.maxH); });
    if (!opts.length) continue;
    var bi = Math.floor(C.i / BL), bj = Math.floor(C.j / BL), rot = fallow > 0 ? K.hash(seed, 11, bi, bj) % (fallow + 1) : 0, Cr = pick(bi, bj, opts);
    var rec = { id: spec.id + ':p' + C.i + ':' + C.j, x: C.x, z: C.z, size: P, crop: Cr.crop, kind: Cr.kind || 'field', state: rot === 0 ? 'crop' : 'fallow', rot: rot, block: [bi, bj] };
    if (y != null) rec.y = +y.toFixed(2);
    out.parcels.push(rec); out.farmedHa += ha; if (rot === 0) out.inCropHa += ha;
    for (k2 = 0; k2 < 4; k2++) pts.push([C.x + corners[k2][0] * P / 2, C.z + corners[k2][1] * P / 2]);
  }
  out.capped = out.inCropHa < target - 1e-9;
  out.holdings = []; out.records = []; out.tracks = [];
  if (spec.farms && spec.farms.n > 0 && out.parcels.length) KHAMLET.farmHoldings(spec, out, seed, ha);
  out.inCropHa = Math.round(out.inCropHa * 100) / 100; out.farmedHa = Math.round(out.farmedHa * 100) / 100; out.cap = Math.round(out.farmedHa) / 100;
  out.poly = KHAMLET.hull(pts);
  return out;
};

/* the holdings, their farmhouses and the farm tracks (above) */
KHAMLET.farmHoldings = function (spec, out, seed, ha) {
  var F = KHAMLET.FARM, K = KRAND, Fm = spec.farms, n = Fm.n, P = out.parcels, c = out.centre, GOLD = 2.399963, gap = F.farmGap;
  var Rm = 0; P.forEach(function (p) { Rm = Math.max(Rm, Math.hypot(p.x - c.x, p.z - c.z)); });
  var turn = K.unit(K.hash(seed, 17)) * 2 * Math.PI, yards = [];
  var near = function (q, pred) { var best = null, bd = Infinity; P.forEach(function (p) { if (p.state === 'yard' || (pred && !pred(p))) return;
    var d = Math.hypot(p.x - q[0], p.z - q[1]); if (d < bd - 1e-9 || (Math.abs(d - bd) <= 1e-9 && p.id < best.id)) { bd = d; best = p; } }); return best; };
  var apart = function (p) { return yards.every(function (y) { return Math.hypot(p.x - y.x, p.z - y.z) >= gap; }); };
  for (var k = 0; k < n; k++) {
    var a = k * GOLD + turn, r = Rm * 0.85 * Math.sqrt((k + 0.5) / n), q = [c.x + Math.cos(a) * r, c.z + Math.sin(a) * r];
    var y = near(q, function (p) { return p.state === 'fallow' && apart(p) && Math.hypot(p.x - q[0], p.z - q[1]) < 160; }) || near(q, apart) || near(q);
    if (!y) break;
    if (y.state === 'crop') out.inCropHa -= ha;
    y.state = 'yard'; y.farm = yards.length; yards.push(y);
  }
  P.forEach(function (p) { if (p.state === 'yard') return; var bk = 0, bd = Infinity; yards.forEach(function (y, j) { var d = Math.hypot(p.x - y.x, p.z - y.z); if (d < bd) { bd = d; bk = j; } }); p.farm = bk; });
  yards.forEach(function (y, j) { var H = { farm: j, x: y.x, z: y.z, parcels: 0, inCropHa: 0 }; P.forEach(function (p) { if (p.farm === j && p.state !== 'yard') { H.parcels++; if (p.state === 'crop') H.inCropHa += ha; } });
    H.inCropHa = Math.round(H.inCropHa * 100) / 100; out.holdings.push(H); });
  /* the tracks: a tree from the root, each farmhouse joined to the nearest point on the network so far */
  var root = spec.from ? [spec.from.x, spec.from.z] : [c.x, c.z], nodes = [{ at: root, j: -1 }], left = yards.map(function (y, j) { return j; }), b = Fm.box, w = F.track;
  while (left.length) {
    var best = null;
    left.forEach(function (j) { var y = yards[j]; nodes.forEach(function (N) { var d = Math.hypot(y.x - N.at[0], y.z - N.at[1]); if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) <= 1e-9 && j < best.j)) best = { d: d, j: j, N: N }; }); });
    var y = yards[best.j], dx = best.N.at[0] - y.x, dz = best.N.at[1] - y.z, L = Math.hypot(dx, dz) || 1, fx = dx / L, fz = dz / L;
    var door = [y.x + fx * (b.d / 2 + 3), y.z + fz * (b.d / 2 + 3)];
    out.records.push({ id: spec.id + ':farm' + best.j, key: Fm.key, role: 'works', x: y.x, z: y.z, y: y.y, ry: Math.atan2(fx, fz), w: b.w, d: b.d, h: b.h == null ? 8 : b.h, farm: best.j, village: spec.id, focus: 'farming', pending: false });
    out.tracks.push({ id: spec.id + ':track' + best.j, kind: 'track', w: w, pts: [[best.N.at[0], best.N.at[1]], [+door[0].toFixed(2), +door[1].toFixed(2)]], farm: best.j });
    nodes.push({ at: door, j: best.j }); left.splice(left.indexOf(best.j), 1);
  }
  out.records.sort(function (p, q) { return p.farm - q.farm; });
};

/* the convex hull of points [[x, z]] (monotone chain), counter-clockwise */
KHAMLET.hull = function (P) {
  P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  if (P.length < 3) return P;
  var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], up = [], i;
  for (i = 0; i < P.length; i++) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
  for (i = P.length - 1; i >= 0; i--) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};

KHAMLET.farmlandHash = function (F) {
  var s = (F.parcels || []).map(function (p) { return p.id + '|' + p.crop + '|' + p.state; }).join(';') + (F.records || []).map(function (r) { return '#' + r.id + '|' + Math.round(r.x * 100) + '|' + Math.round(r.z * 100) + '|' + Math.round(r.ry * 1000); }).join('');
  return KHAMLET.idHash(s) >>> 0;
};
