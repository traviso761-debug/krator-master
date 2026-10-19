/* ==================== core/hamlet 12: what can be gathered from the ground (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 2. A biome kit tags its own ground: api.gatherOf(zones) -> {pasture: 0..1, fish: 0..1,
   salt: bool} on the kit's zone weights, and api.gather(x, z) at a point (biomes/ringisles/src/57-biome-ringisles-gather.js
   is the first). The module reads the tag, never a kit's zone names, so any kit that tags its ground can host a village;
   a kit with no tag offers no field. Nothing runs out for now (owner, 2026-10-18): a weight is how many can work a place. */
KHAMLET.GATHER_KEYS = {pasture: 'weight', fish: 'weight', salt: 'flag'};

/* a kit's tag, checked: unknown keys and out-of-range weights are errors (a verify fails on them, nothing is dropped) */
KHAMLET.gatherCheck = function (g) {
  var bad = [], k;
  if (!g || typeof g !== 'object') return ['not a gather tag'];
  for (k in g) {
    var t = KHAMLET.GATHER_KEYS[k];
    if (!t) bad.push('unknown key ' + k);
    else if (t === 'weight' && !(typeof g[k] === 'number' && g[k] >= 0 && g[k] <= 1)) bad.push(k + ' is not a weight in 0..1');
    else if (t === 'flag' && typeof g[k] !== 'boolean') bad.push(k + ' is not true or false');
  }
  return bad;
};

/* the tag at a point from a kit's api: {pasture, fish, salt} with every key present (0, 0, false when the kit has none) */
KHAMLET.gatherAt = function (api, x, z) {
  var g = api && api.gather ? api.gather(x, z) : null, out = {pasture: 0, fish: 0, salt: false};
  if (g) for (var k in out) if (g[k] != null) out[k] = g[k];
  return out;
};

/* a field's capacity: the tag summed over sample points (cell metres apart) inside a polygon [[x, z], ...], times the
   area each stands for; salt counts the crust's area. Returns {pasture, fish, salt} in km2 of full-weight ground. */
KHAMLET.fieldCapacity = function (api, poly, cell) {
  cell = cell == null ? 200 : cell;
  var x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity, i, out = {pasture: 0, fish: 0, salt: 0};
  for (i = 0; i < poly.length; i++) { x0 = Math.min(x0, poly[i][0]); x1 = Math.max(x1, poly[i][0]); z0 = Math.min(z0, poly[i][1]); z1 = Math.max(z1, poly[i][1]); }
  var a = cell * cell / 1e6;
  for (var x = x0 + cell / 2; x < x1; x += cell) for (var z = z0 + cell / 2; z < z1; z += cell) {
    if (!KHAMLET.inPoly(poly, x, z)) continue;
    var g = KHAMLET.gatherAt(api, x, z);
    out.pasture += g.pasture * a; out.fish += g.fish * a; if (g.salt) out.salt += a;
  }
  return out;
};

KHAMLET.inPoly = function (poly, x, z) {
  var inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
