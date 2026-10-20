// prefix: brc
/* ======================================================================
   BR_CAMP: which tents and pens a band of each of the twelve tribes (LORE.md 6.6) pitches, so a settlement can lay a
   band's camp (owner, 2026-10-19; settlements/pinnacle-rock/PLAN.md, "The upper camp grounds", "The lower camp grounds
   and pastures"). Plain data and pure functions: no three.js, no DOM ([G data]); every key is a catalog ASSET of this
   kit (verify.py checks each one exists, with its variant). A band's grounds:
     upper   on the mesa top by the band's Wing's fins. The FLYERS' bands (Quetzal, Wingclaw, Nightwing) camp only here,
             beside their roosts: about nine tents, perch frames and feeding shelters, no pasture, no hedge. The six
             ground tribes' upper grounds are smaller (about five tents and a hitching line).
     lower   on the floor round the foot (most of the camps): the band's camp and its pasture, the two inside the band's
             own thorn hedge (br_hedge_thorn runs and gates, laid with BR_RUN), the pasture fenced in rails within it.
             The Dragonfly, Spider and Mammoth bands camp only here (their beasts live by water, among trees, on a
             paddock).
   A ground is { where, tents: [{ key, n, v }], pens: [{ key, n, v }], hedge?: { key, v, gate: { key, v, n } },
   pasture?: { fence: { key, v, gate: { key, v, n } }, ha } }: n of that key, its variant v. `beast` names the mount's
   kits/fauna key where there is one (`size` its length and height in metres; the hardshell and the mammoth are not in
   kits/fauna yet). `banner` is the tribe's banner colour (sRGB), for the band's banner poles and its tents' banners.
     brcGround(tribe, ground)  -> the ground, or null          brcKeys(tribe, ground) -> every key it names, once
     brcCount(tribe, ground)   -> { tents, pens }             BR_RUN(pts, o)           -> pieces along a polyline
   ====================================================================== */
const BR_CAMP_TRIBES = ['quetzal', 'wingclaw', 'dragonfly', 'nightwing', 'spider', 'raptor', 'staghorn', 'threehorn', 'hardshell', 'tiger', 'mammoth', 'longcrawler'];
const BR_CAMP_FLYERS = ['quetzal', 'wingclaw', 'nightwing'];

/* shorthand for the table below */
function brcE(key, n, v) { return { key: key, n: n == null ? 1 : n, v: v == null ? 0 : v }; }
function brcHedge() { return { key: 'br_hedge_thorn', v: 0, gate: { key: 'br_hedge_thorn', v: 1, n: 2 } }; }
function brcPasture(ha) { return { fence: { key: 'br_fence_rail', v: 0, gate: { key: 'br_fence_rail', v: 1, n: 1 } }, ha: ha }; }
/* the six ground tribes' upper ground: the chief's pavilion, two family domes, a small dome, one trade, a hitching line */
function brcUpperGround(trade, tv, line) {
  return { where: "the mesa top's open margin, away from the Crown",
    tents: [brcE('br_tent_chief', 1, 1), brcE('br_tent_dome_family', 2, 0), brcE('br_tent_dome_small', 1, 0), brcE(trade, 1, tv)],
    pens: [brcE('br_tent_hitch_line', 1, line)] };
}
/* a ground tribe's lower ground: its camp (the chief, the council, the dwellings, the shrine, its trades) and its pens */
function brcLowerGround(trades, pens, ha) {
  return { where: "the floor round the mesa's foot, beyond the farms",
    tents: [brcE('br_tent_chief', 1, 0), brcE('br_tent_council', 1, 0), brcE('br_tent_dome_double', 1, 0), brcE('br_tent_dome_family', 3, 0),
      brcE('br_tent_dome_small', 3, 0), brcE('br_tent_shrine', 1, 1)].concat(trades),
    pens: pens, hedge: brcHedge(), pasture: brcPasture(ha) };
}

const BR_CAMP = {
  quetzal: { name: 'Quetzal', note: 'the reigning tribe; a Wing posted at Pinnacle Rock', mount: 'flyer', beast: 'quetzalcoatlus', size: [7.5, 5.6], banner: 0x2f7a5a,
    grounds: { upper: { where: "the east fins, by the Quetzal Wing's roosts",
      tents: [brcE('br_tent_chief', 1, 0), brcE('br_tent_council', 1, 1), brcE('br_tent_dome_family', 3, 0), brcE('br_tent_dome_small', 2, 0), brcE('br_tent_shrine', 1, 0), brcE('br_tent_shaman', 1, 0)],
      pens: [brcE('br_tent_perch_frame', 3, 0), brcE('br_tent_feed_shelter', 1, 1)] } } },
  wingclaw: { name: 'Wingclaw', note: "the roost town's own tribe (giant archaeopteryx)", mount: 'flyer', beast: 'giant-archaeopteryx', size: [7.5, 3.7], banner: 0xb08432,
    grounds: { upper: { where: "the north fins over the gorge, by the Wingclaw Wing's roosts",
      tents: [brcE('br_tent_chief', 1, 1), brcE('br_tent_dome_double', 1, 0), brcE('br_tent_dome_family', 3, 1), brcE('br_tent_dome_small', 2, 1), brcE('br_tent_tackmaker', 1, 0), brcE('br_tent_trader', 1, 0)],
      pens: [brcE('br_tent_perch_frame', 3, 1), brcE('br_tent_feed_shelter', 2, 1)] } } },
  dragonfly: { name: 'Dragonfly', note: 'flyers whose beasts live by water, not on the fins: they camp on the floor by a netted breeding pond', mount: 'pond', beast: 'giant-dragonfly', size: [6.9, 1.9], banner: 0x3a7aa0,
    grounds: { lower: { where: 'the floor south-east of the gate, by its pond',
      tents: [brcE('br_tent_chief', 1, 1), brcE('br_tent_dome_family', 3, 2), brcE('br_tent_dome_small', 2, 0), brcE('br_tent_shrine', 1, 1), brcE('br_tent_shaman', 1, 1)],
      pens: [brcE('br_tent_pond_nets', 1, 0), brcE('br_tent_pond_nets', 1, 1), brcE('br_tent_net_house', 1, 1), brcE('br_tent_feed_shelter', 1, 1)],
      hedge: brcHedge(), pasture: null } } },
  nightwing: { name: 'Nightwing', note: 'giant bats; a Wing posted at Pinnacle Rock', mount: 'flyer', beast: 'giant-bat', size: [2.6, 2.2], banner: 0x3a2a4a,
    grounds: { upper: { where: "the west fins, by the Nightwing Wing's roosts",
      tents: [brcE('br_tent_chief', 1, 0), brcE('br_tent_dome_family', 2, 1), brcE('br_tent_dome_small', 3, 2), brcE('br_tent_shrine', 1, 0), brcE('br_tent_shaman', 1, 0), brcE('br_tent_smithy', 1, 1)],
      pens: [brcE('br_tent_perch_frame', 2, 2), brcE('br_tent_feed_shelter', 1, 1)] } } },
  spider: { name: 'Spider', note: 'spider-riders live in silk houses and work silk looms (LORE 6.6); their grove at the forest edge, away from the grazers', mount: 'grove', beast: 'giant-spider', size: [6.6, 3.7], banner: 0xe8e8e0,
    grounds: { lower: { where: "the forest's edge north-east of the mesa",
      tents: [brcE('br_tent_chief', 1, 1), brcE('br_tent_silk_house', 3, 0), brcE('br_tent_silk_house', 1, 1), brcE('br_tent_dome_small', 2, 0), brcE('br_tent_shrine', 1, 1), brcE('br_tent_trader', 1, 0)],
      pens: [brcE('br_tent_spider_grove', 1, 1), brcE('br_tent_spinning_shed', 1, 1)],
      hedge: brcHedge(), pasture: null } } },
  raptor: { name: 'Raptor', note: 'velociraptors: kennels and runs east of the mesa', mount: 'runner', beast: 'ridge-raptor', size: [4.1, 1.95], banner: 0x9a2e22,
    grounds: { upper: brcUpperGround('br_tent_trader', 0, 0),
      lower: brcLowerGround([brcE('br_tent_tackmaker', 1, 0), brcE('br_tent_hidemaker', 1, 0), brcE('br_tent_smithy', 1, 0)],
        [brcE('br_tent_kennel_row', 1, 1), brcE('br_tent_corral', 1, 0), brcE('br_tent_lunge_ring', 1, 0), brcE('br_tent_breaking_pen', 1, 0), brcE('br_tent_training_yard', 1, 0), brcE('br_tent_hitch_line', 1, 0), brcE('br_tent_feed_shelter', 1, 1)], 6) } },
  staghorn: { name: 'Staghorn', note: 'staghorn beetles: low pens with rotting logs west of the mesa, among the grazers', mount: 'beetle', beast: 'staghorn-beetle', size: [2.6, 1.5], banner: 0x5a3a20,
    grounds: { upper: brcUpperGround('br_tent_tackmaker', 1, 0),
      lower: brcLowerGround([brcE('br_tent_trader', 1, 1), brcE('br_tent_smithy', 1, 0)],
        [brcE('br_tent_corral', 2, 2), brcE('br_tent_lunge_ring', 1, 0), brcE('br_tent_training_yard', 1, 0), brcE('br_tent_hitch_line', 1, 0), brcE('br_tent_feed_shelter', 1, 0)], 4) } },
  threehorn: { name: 'Threehorn', note: 'triceratops: paddocks west of the mesa', mount: 'great', beast: 'tricorn', size: [4.5, 2.4], banner: 0xc08436,
    grounds: { upper: brcUpperGround('br_tent_smithy', 0, 1),
      lower: brcLowerGround([brcE('br_tent_hidemaker', 1, 1), brcE('br_tent_tackmaker', 1, 1)],
        [brcE('br_tent_corral', 1, 1), brcE('br_tent_lunge_ring', 1, 1), brcE('br_tent_breaking_pen', 1, 1), brcE('br_tent_training_yard', 1, 1), brcE('br_tent_hitch_line', 1, 1), brcE('br_tent_feed_shelter', 2, 0)], 12) } },
  hardshell: { name: 'Hardshell', note: 'glyptodonts: paddocks west of the mesa (not in kits/fauna yet: about 3.5 m long, 1.6 m high)', mount: 'great', beast: null, size: [3.5, 1.6], banner: 0x6d665c,
    grounds: { upper: brcUpperGround('br_tent_hidemaker', 0, 1),
      lower: brcLowerGround([brcE('br_tent_smithy', 1, 1), brcE('br_tent_trader', 1, 1)],
        [brcE('br_tent_corral', 1, 1), brcE('br_tent_lunge_ring', 1, 1), brcE('br_tent_breaking_pen', 1, 1), brcE('br_tent_hitch_line', 1, 1), brcE('br_tent_feed_shelter', 1, 0)], 10) } },
  tiger: { name: 'Tiger', note: 'the great cats: kennels and runs east of the mesa', mount: 'runner', beast: 'arena-tiger', size: [4.8, 1.7], banner: 0xd27a2c,
    grounds: { upper: brcUpperGround('br_tent_shaman', 0, 0),
      lower: brcLowerGround([brcE('br_tent_hidemaker', 1, 0), brcE('br_tent_trader', 1, 0)],
        [brcE('br_tent_kennel_row', 1, 0), brcE('br_tent_corral', 1, 0), brcE('br_tent_lunge_ring', 1, 0), brcE('br_tent_breaking_pen', 1, 0), brcE('br_tent_training_yard', 1, 1), brcE('br_tent_hitch_line', 1, 0), brcE('br_tent_feed_shelter', 1, 1)], 6) } },
  mammoth: { name: 'Mammoth', note: 'a paddock and byre south of the mesa, west of the forest road (not in kits/fauna yet: about 6 m long, 4 m high)', mount: 'great', beast: null, size: [6, 4], banner: 0x7a5a3a,
    grounds: { lower: { where: 'the floor south of the mesa, west of the forest road',
      tents: [brcE('br_tent_chief', 1, 0), brcE('br_tent_dome_family', 3, 0), brcE('br_tent_dome_small', 2, 2), brcE('br_tent_shrine', 1, 1), brcE('br_tent_smithy', 1, 0), brcE('br_tent_hidemaker', 1, 1)],
      pens: [brcE('br_tent_mammoth_paddock', 1, 1), brcE('br_tent_breaking_pen', 1, 1), brcE('br_tent_lunge_ring', 1, 1), brcE('br_tent_hitch_line', 1, 1), brcE('br_tent_feed_shelter', 1, 0)],
      hedge: brcHedge(), pasture: brcPasture(5) } } },
  longcrawler: { name: 'Longcrawler', note: 'giant millipedes: sheds over leaf litter', mount: 'crawler', beast: 'draught-millipede', size: [7.3, 1.05], banner: 0x3f7a3a,
    grounds: { upper: brcUpperGround('br_tent_trader', 1, 1),
      lower: brcLowerGround([brcE('br_tent_tackmaker', 1, 1), brcE('br_tent_smithy', 1, 0)],
        [brcE('br_tent_crawler_shed', 1, 1), brcE('br_tent_crawler_shed', 1, 0), brcE('br_tent_corral', 1, 1), brcE('br_tent_hitch_line', 1, 1), brcE('br_tent_feed_shelter', 1, 0)], 6) } }
};

function brcGround(tribe, ground) { const T = BR_CAMP[tribe]; return T && T.grounds[ground] || null; }
/* every key a ground names (tents, pens, its hedge and gates, its pasture's fence and gate), each once, with variants */
function brcKeys(tribe, ground) {
  const G = brcGround(tribe, ground); if (!G) return [];
  const out = [], seen = {}, add = function (k, v) { const id = k + '#' + v; if (!seen[id]) { seen[id] = 1; out.push({ key: k, v: v }); } };
  G.tents.concat(G.pens).forEach(function (e) { add(e.key, e.v); });
  if (G.hedge) { add(G.hedge.key, G.hedge.v); add(G.hedge.gate.key, G.hedge.gate.v); }
  if (G.pasture) { add(G.pasture.fence.key, G.pasture.fence.v); add(G.pasture.fence.gate.key, G.pasture.fence.gate.v); }
  return out;
}
function brcCount(tribe, ground) {
  const G = brcGround(tribe, ground); if (!G) return null;
  const n = function (L) { return L.reduce(function (s, e) { return s + e.n; }, 0); };
  return { tents: n(G.tents), pens: n(G.pens) };
}

/* BR_RUN(pts, o): the pieces of a boundary along the polyline pts ([[x, z], ...]; o.closed joins the last to the first):
   o.key (br_hedge_thorn or br_fence_rail), o.seg (the longest piece, default the key's span.default: 8 m), o.gates
   (distances along the line where a gate stands), o.gateLen (default the key's span.gate), o.seed. Each edge is cut
   into equal pieces no longer than seg, round the gates. Returns [{ key, v, x, z, ry, span, seed }]: build each with
   buildAsset(key, x, z, ry, { variant: v, span, seed }); local +x runs along the line (ry = atan2(-dz, dx)), and every
   seed is KRAND.hash(o.seed, the piece's index), so a piece draws the same brush however the line is laid. */
function BR_RUN(pts, o) {
  o = o || {};
  const key = o.key || 'br_hedge_thorn', spans = { br_hedge_thorn: [8, 7], br_fence_rail: [8, 5] }[key] || [8, 5];
  const seg = o.seg == null ? spans[0] : o.seg, gl = o.gateLen == null ? spans[1] : o.gateLen, seed = o.seed == null ? 1 : o.seed;
  const P = pts.slice(); if (o.closed && P.length > 2) P.push(P[0]);
  const gates = (o.gates || []).slice().sort(function (a, b) { return a - b; }), out = [];
  let d0 = 0;
  const piece = function (ax, az, ux, uz, s0, s1, v) {
    const L = s1 - s0, m = (s0 + s1) / 2;
    out.push({ key: key, v: v, x: ax + ux * m, z: az + uz * m, ry: Math.atan2(-uz, ux), span: L, seed: KRAND.hash(seed, out.length) });
  };
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-6) continue;
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    /* this edge's stretches between its gates (a gate is kept whole on the edge it falls on) */
    let s = 0;
    gates.filter(function (g) { return g >= d0 && g < d0 + L; }).forEach(function (g) {
      const c = Math.max(gl / 2, Math.min(L - gl / 2, g - d0)), g0 = c - gl / 2, g1 = c + gl / 2;
      if (g0 - s > 0.3) { const n = Math.ceil((g0 - s) / seg); for (let k = 0; k < n; k++) piece(a[0], a[1], ux, uz, s + (g0 - s) * k / n, s + (g0 - s) * (k + 1) / n, 0); }
      piece(a[0], a[1], ux, uz, g0, g1, 1); s = g1;
    });
    if (L - s > 0.3) { const n = Math.ceil((L - s) / seg); for (let k = 0; k < n; k++) piece(a[0], a[1], ux, uz, s + (L - s) * k / n, s + (L - s) * (k + 1) / n, 0); }
    d0 += L;
  }
  return out;
}

/* the sheet's rows for the tent set (90-br-sheet.js reads it) */
const BR_SHEET_TENTS = [
  { title: 'Tents: dwellings, chief, council, shrine', keys: ['br_tent_dome_small', 'br_tent_dome_family', 'br_tent_dome_double', 'br_tent_chief', 'br_tent_council', 'br_tent_shrine'] },
  { title: 'Tents: the trades (the Scyvoi set)', keys: ['br_tent_shaman', 'br_tent_smithy', 'br_tent_hidemaker', 'br_tent_trader', 'br_tent_tackmaker'] },
  { title: 'Pens and trainer structures', keys: ['br_tent_corral', 'br_tent_lunge_ring', 'br_tent_hitch_line', 'br_tent_perch_frame', 'br_tent_feed_shelter', 'br_tent_training_yard', 'br_tent_breaking_pen', 'br_tent_kennel_row', 'br_tent_crawler_shed'] },
  { title: "The Dragonfly, Spider and Mammoth bands' grounds", keys: ['br_tent_pond_nets', 'br_tent_net_house', 'br_tent_spider_grove', 'br_tent_silk_house', 'br_tent_spinning_shed', 'br_tent_mammoth_paddock'] },
  { title: 'Boundaries: thorn hedge, rail fence', keys: ['br_hedge_thorn', 'br_fence_rail'] }
];
