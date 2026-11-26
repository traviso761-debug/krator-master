# biomes/gills: the API (the shared life of the Red and the White Gills)

`biomes/gills` has no page. Its fragment `src/44-gills-life.js` is read in place by the host kits' stations (`PLAN.md` sections 0, 11, 13):
`biomes/xanadu --station gills` (its `stations/gills/station.json` "reads"), `biomes/godthrone --station gills` and `--station gills-ladder` (the Red
dress, 2026-11-04: its drawing a port of xanadu's, `biomes/godthrone/stations/gills/87-host-gills.js`), and the catch's three stations later.
The fragment is `[G data]`: plain records and pure functions on core/rand (`KRAND`), no THREE, no DOM; it runs in node as on a page.
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

A host opens the registry around its items (`BIO.kit('gills')` ... `BIO.kitEnd(GILLS)`), so the kit's items never collide with the host's.

Test: `node biomes/gills/tests/test-gills.js` (the breath against `ATMOS.libration`, the shape, the drift, the layouts' determinism, stable ids and
invariants; each check with a negative).
