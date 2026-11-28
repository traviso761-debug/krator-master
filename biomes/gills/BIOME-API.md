# biomes/gills: the API (the shared life of the Red and the White Gills)

`biomes/gills` has no page. Its fragments `src/44-gills-life.js` and `src/45-gills-candles.js` are read in place by the host kits' stations (`PLAN.md` sections 0, 11, 13):
`biomes/xanadu --station gills` (its `stations/gills/station.json` "reads"), `biomes/godthrone --station gills` and `--station gills-ladder` (the Red
dress, 2026-11-04: its drawing a port of xanadu's, `biomes/godthrone/stations/gills/87-host-gills.js`), `biomes/catch --station gills-candles` (the White pipe field and the candles, 2026-11-25: its drawing a port of the godthrone's, `biomes/catch/stations/gills-candles/87-host-gills.js`), and the catch's `gills` and `gills-pass` later.
The fragments are `[G data]`: plain records and pure functions on core/rand (`KRAND`), no THREE, no DOM; it runs in node as on a page.
The drawing (meshes, materials, the breath's shaders, the steam, the hazards) is the host's: `biomes/xanadu/stations/gills/87-host-gills.js` is the
worked example.

| Name | What |
|---|---|
| `GILLS.breath(t)` / `GILLS.breath(ATMOS.libration(t))` | the breath 0..1 at clock `t` (days from game start, the sky's `t`): 1 the out-breath (Bhlo), 0 the in-breath (Suq). A 3 h plateau centred on the top of the giant's nod (Noḍ), an hour's ramp each side. Its constants (`GILLS.SID`, `GILLS.NOD`) are the sky model's; `tests/test-gills.js` holds them equal |
| `GILLS.nodPhase(t)`, `GILLS.breathAt(u)` | the phase from the nod's top, and the breath at a phase |
| `GILLS.peakHour(day)` | the hour of the out-breath's middle on a day (about 3.9 minutes earlier each day: a sidereal day) |
| `GILLS.SPECIES`, `PLANTS`, `HARVEST`, `byKey(key)` | the BIOME-API contract: `pipe`, `collar`, `bellows`, `fringe`, `lamp`, `dewmat`, `saltcup`, `whitewood`, `rollbead`, each tagged (`temperature`, `aridity`, `koppen`, `alien`, `breath`, `harvest`) |
| `GILLS.country(name)`, `GILLS.COUNTRIES`, `GILLS.dress(name)` | `'white'` or `'red'`, and that country's palette (sRGB 0..1 triples: `pipe`, `band`, `bore`, `collar`, `collarLit`, `fringe`, `dew`, `bead`, `cup`, `wood`, `cap`) |
| `GILLS.NAMES` | the Xanadui words (`PLAN.md` section 9a): Gīl, Wāiṭ Gīl, Reḍ Gīl, Bhlo, Suq, Noḍ, Phlū, Bhon Phlū, Phlū-phīlḍ, Lãg Solṭ, Qolar, Bhlo-wāṭar, Ālph-bi Bhlo, Qãḍal, Thin Yīr |
| `GILLS.layout(o)` | the swarm: `{centre, band, arc, n, dead, seed, form, w, d, len}` -> `{gills: [{id, form, c, r, a0, a1, w, d, alive, age}]}` (ring cracks; `form: 'radial'` is recorded for the Red Gills, its geometry still ring arcs: owed) |
| `GILLS.gillAt(L, x, z)` | `{g, k, dr, along, half}`: the crack under a point and its depth share (1 on the floor), for the host's `terrainH` carve; null off the swarm |
| `GILLS.life(L, o)` | the life on the swarm, from the host's ground: `{ground, iceH, treeH, lip, step, wind, seed}` -> `{pipes, collars, fringes, pads, beads, lamps, dew, turf, cups, wood, steam}` (turf: the limed clumps round a dew mat, `{id, gill, mat, x, z, y, h, yaw}`, on their own stream), each record with a stable id `'<gill>.<kind>.<k>'`; a pipe `{id, gill, x, z, y0, H, r, mouths, state, ice, live, lag, toward, lean, seed}` (under 90 m; live only on a live gill, never iced; iced only over `iceH`) |
| `GILLS.isDry(L, g, o)` | whether a gill burns: a CLOSED gill (`alive` false) whose conduit still carries dry, fast gas, picked by hash from the gill's index (`o.dry`, the share; `o.seed`). A breathing gill is wet and steams, so it never burns: the two are exclusive, and that is the picture |
| `GILLS.candles(L, o)` | THE CANDLES (Qãḍal), `45-gills-candles.js`: `{ground, seed, dry, step, h, crust}` -> `[{id, gill, x, z, y, h, r, crust, along, seed}]`, blue flames 0.4 to 1.6 m at the dry gills' throats with a black heat crust round each. The flame burns all day (PLAN.md section 9), so it takes no breath state; only its brightness against the hour is the host's (invisible at noon, plain at dusk) |
| `GILLS.sites(L, R, o)` | THE PIPE FIELD'S SITES as plain data, published and never drawn (PLAN.md section 0 "Out of scope"; the way swhighlands' pillar rim publishes `SWHI_PILLARS_SITE`): `{format:'gills-field-site', version:1, field, hermitage, caravanStop, gasHouse, hearths, candleGills, pipeFieldGills}`. `R` is a `GILLS.life` record set, for the fallen pipe the Monks cut their two cells into. **The number of Monks is the region's, not the kit's** (`o.monks`; KNOWN_ISSUES.md) |

**The keep-clear.** `GILLS.life` keeps its pipes off one another on `core/space` (`KSPACE`, `PLAN.md` section 13): a standing pipe is its own
disc, a fallen one sweeps its length, and `o.gap` (1.5 m) is the margin. A host that RESIZES pipes after `life` has run (the catch station
widens the White form by 15 per cent, the godthrone station lengthens the Red by 1.7) must pass a `gap` that covers its own growth, or test
the drawn size itself: the kit can only keep the records it made apart. Shrinking is always safe.

A host opens the registry around its items (`BIO.kit('gills')` ... `BIO.kitEnd(GILLS)`), so the kit's items never collide with the host's.

Tests: `node biomes/gills/tests/test-gills.js` (the breath against `ATMOS.libration`, the shape, the drift, the layouts' determinism, stable ids and
invariants; each check with a negative), and `node biomes/gills/tests/test-gills-candles.js` on `tools/ktest.js` (the candles and the sites: 24 checks, each with a `T.neg` fault and fix).
