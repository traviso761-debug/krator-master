/* ==================== the Crops kit: the queries (pure functions on the records, [G data]) ==================== */
/* Ask what a place can plausibly grow (CROPS.at, CROPS.forBiome), what a recipe or a store may call (CROPS.inBucket, CROPS.pick),
   or which colours and plaids a biome can make (CROPS.palette, CROPS.canPlaid). A fit is {how, zone}: 'wild' (native there),
   'rain' (rain-fed), 'irrigated', 'bed' (a dark works the settlement has), 'node' (a mineral dye whose node is in reach),
   'trade' (a homeOnly crop the settlement imports), or 'no'. Dense air steps a crop's rain-fed aridity floor one band drier
   (it halves transpiration: biomes/crater-drylands/NOTES.md). Picks draw from core/rand (KRAND), never Math.random. */
CROPS.HOW_RANK = {wild: 6, rain: 5, irrigated: 4, node: 3, bed: 2, trade: 1, no: 0};

CROPS.isBucket = function (c, bucket) { return c.bucket === bucket || c.also.indexOf(bucket) >= 0; };
CROPS.isGroup = function (c, group) {
  if (CROPS.BUCKETS[c.bucket].group === group) return true;
  for (let i = 0; i < c.also.length; i++) if (CROPS.BUCKETS[c.also[i]].group === group) return true;
  return false;
};
CROPS.index = function (v, list) { return typeof v === 'number' ? v : list.indexOf(v); };

/* how crop c does in one zone ({warmth:[lo,hi], arid:[lo,hi], wet, salt, heated}) under atm (an index) */
CROPS.fitZone = function (c, z, atm, biomeId, opts) {
  opts = opts || {};
  if (c.grown === 'underground') {
    if (opts.works && opts.works.indexOf(c.works) >= 0) return 'bed';
    return biomeId && c.home.indexOf(biomeId) >= 0 ? 'wild' : 'no';
  }
  if (biomeId && c.home.indexOf(biomeId) >= 0) return 'wild';
  if (c.node && opts.nodes && opts.nodes.indexOf(c.node) >= 0) return 'node';
  if (c.homeOnly) return opts.trade && opts.trade.indexOf(c.id) >= 0 ? 'trade' : 'no';
  if (atm < c.atm[0] || atm > c.atm[1]) return 'no';
  if (z.warmth[1] < c.warmth[0] || z.warmth[0] > c.warmth[1]) return 'no';
  if (c.needs === 'salt' && !z.salt) return 'no';
  if (c.needs === 'heated' && !z.heated) return 'no';
  if (c.water === 'aquatic' && !z.wet) return 'no';
  const lo = atm === 2 && c.arid[0] > 0 ? c.arid[0] - 1 : c.arid[0], hi = c.arid[1];
  if (z.arid[0] > hi) return 'no';                              /* too wet */
  const mid = (z.arid[0] + z.arid[1]) / 2;                      /* a zone counts at its middle: a desert edge in semiarid is not rain-fed */
  if (mid >= lo) return 'rain';
  return lo - mid <= c.reach ? 'irrigated' : 'no';
};

/* every crop that fits any zone of a biome: [{crop, how, zone}] with the best fit per crop; opts: works, nodes, trade */
CROPS.forBiome = function (biomeId, opts) {
  const B = CROPS.BIOMES[biomeId];
  if (!B) throw new Error('crops: no biome ' + biomeId);
  const out = [];
  CROPS.LIST.forEach(function (c) {
    let best = null;
    for (const zid in B.zones) {
      const z = B.zones[zid], how = CROPS.fitZone(c, z, z.atm == null ? B.atm : z.atm, biomeId, opts);
      if (!best || CROPS.HOW_RANK[how] > CROPS.HOW_RANK[best.how]) best = {crop: c, how: how, zone: zid};
    }
    if (best && best.how !== 'no') out.push(best);
  });
  return out;
};

/* a point on the axes: {warmth, atm, arid} as band names or indices, with optional wet, salt, heated */
CROPS.at = function (pt, opts) {
  const w = CROPS.index(pt.warmth, CROPS.WARMTH), a = CROPS.index(pt.arid, CROPS.ARID), m = CROPS.index(pt.atm, CROPS.ATM);
  const z = {warmth: [w, w], arid: [a, a], wet: !!pt.wet, salt: !!pt.salt, heated: !!pt.heated}, out = [];
  CROPS.LIST.forEach(function (c) { const how = CROPS.fitZone(c, z, m, null, opts); if (how !== 'no') out.push({crop: c, how: how, zone: null}); });
  return out;
};

/* the crops of a bucket (or a group when group:true) among a result of forBiome or at */
CROPS.inBucket = function (results, name, asGroup) {
  return results.filter(function (r) { return asGroup ? CROPS.isGroup(r.crop, name) : CROPS.isBucket(r.crop, name); });
};

/* an FNV-1a hash of a string, for core/rand's integer arguments */
CROPS.strHash = function (s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* One crop for a recipe or a store: results from forBiome/at, a bucket or group name, o {seed, salt, prefer: [ids], asGroup, rainOnly}.
   A preferred crop that fits wins, in the order given; otherwise a seeded draw among the fits that need no trade, else any. */
CROPS.pick = function (results, name, o) {
  o = o || {};
  if (typeof KRAND === 'undefined') throw new Error('crops: CROPS.pick needs core/rand (KRAND)');
  let cand = CROPS.inBucket(results, name, o.asGroup);
  if (o.rainOnly) cand = cand.filter(function (r) { return r.how === 'wild' || r.how === 'rain'; });
  if (!cand.length) return null;
  const pref = o.prefer || [];
  for (let i = 0; i < pref.length; i++) for (let j = 0; j < cand.length; j++) if (cand[j].crop.id === pref[i]) return cand[j];
  let own = cand.filter(function (r) { return r.how !== 'trade'; });
  if (!own.length) own = cand;
  own = own.slice().sort(function (a, b) { return a.crop.id < b.crop.id ? -1 : a.crop.id > b.crop.id ? 1 : 0; });
  const seed = o.seed == null ? 0 : o.seed, h = KRAND.hash(seed, CROPS.strHash(name), CROPS.strHash(o.salt == null ? '' : String(o.salt)));
  return own[h % own.length];
};

/* dye colours to the families a plaid counts */
CROPS.COLOUR_FAMILY = {'pale blue': 'blue', slate: 'blue', crimson: 'red', terracotta: 'red', 'red-brown': 'brown', gold: 'yellow', saffron: 'orange', ochre: 'yellow', rust: 'red'};

/* the colour families a biome has: its own dyes (wild or native there, a mineral dye whose node it can reach, a dye it trades for), and
   with opts.grow also what its climate would let it grow (rain-fed or irrigated). opts as forBiome (trade: ids, nodes: kinds). */
CROPS.palette = function (biomeId, opts) {
  opts = opts || {};
  const fam = {}, srcs = {}, own = {wild: 1, node: 1, trade: 1, bed: 1};
  CROPS.inBucket(CROPS.forBiome(biomeId, opts), 'dye').forEach(function (r) {
    if (!r.crop.colour || (!opts.grow && !own[r.how])) return;
    const f = CROPS.COLOUR_FAMILY[r.crop.colour] || r.crop.colour;
    fam[f] = true; (srcs[f] = srcs[f] || []).push(r.crop.id + ':' + r.how);
  });
  return {colours: Object.keys(fam).sort(), sources: srcs};
};

/* a plaid: three colour families or more, and cloth (a spinning crop that fits, or wool, which is animal and not tracked here) */
CROPS.canPlaid = function (biomeId, opts) {
  opts = opts || {};
  const p = CROPS.palette(biomeId, opts);
  const cloth = opts.wool !== false || CROPS.inBucket(CROPS.forBiome(biomeId, opts), 'spinning').length > 0;
  return cloth && p.colours.length >= 3;
};
