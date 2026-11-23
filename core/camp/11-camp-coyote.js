/* ==================== core/camp 11: the Coyote herders' row (plain data, [G data]) ==================== */
/* kits/coyote/PLAN.md section 6; the shape is 10-camp-cultures.js's. Sunrise and Sunset (Tong-Hau and Si-Hau), the nomad
   goat-and-ostrich herders who move up the Tiers' stair in summer (`v: 0`) and down into the Outlands in winter (`v: 1`,
   each tipi on its stone ring `cy_winter_base`). A program key is a `kits/coyote` def key with an optional role after `@`
   (`cy_tipi_l@chief`, `cy_tipi_l@council`, `cy_tipi_s@shrine`): `kind()` reads the role, the def draws it (`o.role`).
   Default formation is `horseshoe`, open toward the way in; a station host passes the scale model's wind at the camp site
   as `spec.wind` (`row.wind` is the fallback). `KCAMP.coyoteProgram(season)` builds the standard 50-person band program
   (`season` 0 or `'summer'` -> `v: 0`; 1 or `'winter'` -> `v: 1`). Own fragment so pages listing only 10 do not move. */
globalThis.KCAMP = globalThis.KCAMP || {version: 1};
KCAMP.CULTURES = KCAMP.CULTURES || {};
KCAMP.coyoteProgram = function (season) {
  var v = (season === 1 || season === 'winter') ? 1 : 0;
  return {
    tents: [
      {key: 'cy_tipi_l@chief', n: 1, v: v}, {key: 'cy_tipi_l@council', n: 1, v: v}, {key: 'cy_tipi_s@shrine', n: 1, v: v},
      {key: 'cy_tipi_m', n: 5, v: v}, {key: 'cy_tipi_l', n: 1, v: v}, {key: 'cy_tipi_s', n: 2, v: v},
      {key: 'cy_feather_rack', n: 1}, {key: 'cy_saddle_rack', n: 1}
    ],
    pens: [{key: 'cy_ostrich_pen', n: 1}, {key: 'cy_fold', n: 1}, {key: 'cy_egg_cache', n: 1}]
  };
};
KCAMP.CULTURES['coyote-herder'] = {
  kind: function (k) {
    var q = String(k).split('@'), key = q[0], role = q[1];
    if (role === 'chief') return 'chief';
    if (role === 'council') return 'council';
    if (role === 'shrine') return 'shrine';
    if (/^cy_tipi_[ml]$/.test(key)) return 'dwelling';
    if (key === 'cy_tipi_s') return 'sleep';
    if (key === 'cy_feather_rack' || key === 'cy_saddle_rack') return 'trade';
    if (key === 'cy_ostrich_pen' || key === 'cy_fold' || key === 'cy_egg_cache') return 'pen';
    return null;
  },
  households: {'cy_tipi_l@chief': 1, cy_tipi_m: 1, cy_tipi_l: 2},
  household: [5, 8], chiefHousehold: [6, 9], sleepers: [3, 4],
  work: {
    'cy_tipi_s@shrine': {role: 'priest', n: 1},
    cy_feather_rack: {role: 'featherworker', n: 2},
    cy_saddle_rack: {role: 'saddler', n: 1},
    cy_ostrich_pen: {role: 'herder', n: 2},
    cy_fold: {role: 'herder', n: 1}
  },
  elderShare: 0.4, mountsPer: 1, wind: [0.7071, 0.7071], formation: 'horseshoe',
  program: KCAMP.coyoteProgram(0),
  pending: {
    cy_tipi_s: {w: 6.4, d: 6.4, h: 5.2, what: 'a small herder tipi (sleep or shrine)'},
    cy_tipi_m: {w: 8, d: 8, h: 6.6, what: 'a family herder tipi'},
    cy_tipi_l: {w: 9.6, d: 9.6, h: 7.8, what: 'a large herder tipi (two households, chief or council)'},
    'cy_tipi_l@chief': {w: 9.6, d: 9.6, h: 7.8, what: 'the chief\'s tipi'},
    'cy_tipi_l@council': {w: 9.6, d: 9.6, h: 7.8, what: 'the council tipi'},
    'cy_tipi_s@shrine': {w: 6.4, d: 6.4, h: 5.2, what: 'the runner-bird shrine tipi'},
    cy_feather_rack: {w: 5, d: 2.4, h: 2.4, what: 'an ostrich-plume drying rack'},
    cy_saddle_rack: {w: 5, d: 2.6, h: 1.8, what: 'an ostrich saddle and pack-frame rack'},
    cy_ostrich_pen: {w: 16, d: 12, h: 2.6, what: 'a high brush ostrich pen'},
    cy_fold: {w: 10, d: 8, h: 1.8, what: 'a dry-stone goat fold'},
    cy_egg_cache: {w: 2.6, d: 2.6, h: 1.6, what: 'a buried ostrich-egg cache'},
    cy_winter_base: {w: 7.8, d: 7.8, h: 1, what: 'a winter tipi stone ring'}
  }
};
