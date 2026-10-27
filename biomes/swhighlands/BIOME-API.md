# biomes/swhighlands: the kit's API (`SWHI`)

On the biome core's contract (`biomes/nhighlands/BIOME-API.md`): the kit's fragments (50-70) read the world only through
`BIO.host` (`BIO.init`: `terrainH`, `waterH`, `mask`, `fields`, `obstacles`, `register`, `origin`, `seed`).

## The fields a host hands in (`BIO.init({fields})`)

| Field | 0..1 | Used for |
|---|---|---|
| `cove` | the sheltered hollows | the lattice oaks' closed canopy, the bead cones, moss, club-moss, fallen cords |
| `bald` | the open crest under one pillar cap | bulb heath, banded coral, turf; no other tree |
| `crest`, `valley` | a ridge's profile near its spine / at its foot | turf on the crests, the oaks' thinning |
| `farm` | the Republic's fields | nothing native |
| `slope` | the ground's gradient (m/m) | off the cliffs |
| `wet`, `flow`, `mist`, `cold`, `rock`, `north` | as every kit | the floor's wettest ground, the banks |

Station 4 (the pillar rim, `57-biome-swhighlands-pillars.js`) reads its own (its stage, still to come, owes them):

| Field | 0..1 | Used for |
|---|---|---|
| `top` | a pillar's flat top | the anemone trees (dense, small), cushions, moss, bead coral |
| `floor` | the green floor between the pillars | rim turf, torch spikes, cushions, bead coral; a few anemone trees |
| `block` | by a fallen block | the floor's anemone trees, clasping a boulder (`T.block`, its radius) |
| `wet` | by Pan Riba and its seeps | moss in, torch spikes and bead coral out |

`SWHI.pillarZones(x, z)` combines them. The other stations' fields (their stages owe them too):

| Station | Fields | Combined by |
|---|---|---|
| 2, the rain wall (`58`) | `rain` (its forest), `scar` (the landslide's fresh ground), `boulder` (by a fresh boulder), `wet`, `slope`; `opt.bridges` [[x, z, x2, z2], ...] the stream crossings, each a fishing bridge | `SWHI.rainZones` |
| 3, Span's tableland (`59`) | `table` (the open tableland), `swamp` (a hanging swamp's ledge), `pool` (its seep pools), `dome` (a beehive dome's top), `wet`, `slope` | `SWHI.tableZones` |
| 5, the fan coast (`59c`) | `scarp` (the dry scarp, its ledges), `fan` (a fan delta's gravel), `wadi`, `shore`, `slope` | `SWHI.coastZones` |

`SWHI.zones(x, z)` combines them (`forest`, `cove`, `crest`, `valley`, `bald`, `farm`, ...).

## Station 4's site (for a settlement; plain data)

Station 4 (the pillar rim) is the biome only: it reads nothing of any settlement. What one may build on it is published by the
station as one plain record, `SWHI_PILLARS_SITE` on its page (also the page's `site` exporter and `window._api.site()`):

| Field | What |
|---|---|
| `format`, `version` | `'swhighlands-pillars-site'`, 1 |
| `frame` | `{x: 'east', z: 'south', y0}` (the map's y 0 in metres above the sea) and `box` |
| `watch` | the watch pillar: `id, x, z, foot, top, w, l, ry, flat` (the side of the flat square on its top, m), `keep` (the metres under the top its drawn mesh keeps whole). Its top is held bare (no plant within 30 m of its middle) |
| `arches` | every arch and natural bridge (added 2026-10-27, still version 1: a new field, nothing changed): `id, x, z, foot, top, R` |
| `towers` | every tower (not the arches): `id, x, z, foot, top, R` |
| `rim` | the cliff's line, 65 points west to east: `x, z, top` (the table's), `floor` (30 m out from the rim: since 2026-10-27 on the badland apron under the 85 m caprock, not the open floor) |
| `river` | Pan Riba's line (`name`, `pts`) |

A settlement reads it and places itself (its post, its stairs fitted to the drawn mesh); the station never moves for one. A change
to the record is a change to this table.

## Calls

- `SWHI.build({box, quality, bald: [x, z, r]})` -> counts. The trees (by `KRAND` cell, `SWHI.cells`), the fallen cords, the floor.
  `bald` is where the bald's pillar cap stands and the clearing it holds. A tile built alone draws what the full build draws in it.
- `SWHI.SPECIES` (`latticeoak`, `beadcone`, `pillarcap`) and `SWHI.PLANTS`, each with `tags` (climate, aridity, abyssal, riparian,
  harvest); `SWHI.tagsOf(nameOrLabel)` for an inspector hit.
- `SWHI.TREES` (records: `x, z, y0, sp, H, rb, crownR, seed, lv`), `SWHI.LOGS`; `SWHI.BUILD.lattice|cone|pillars|log(T, st, lv, stream)`
  draws one (a world placing its own: give it `KRAND.stream(T.seed ^ 0x5157)`).
- `SWHI.LOD` `{tree: 800, near: 450, floor: 420}`: heroes in full to `near`, a lighter form to `tree`, octahedral impostors beyond
  (and for every hero past its range); the floor to `floor`, the bald's plants to 700 m.
- `SWHI.build({station: 'rainwall' | 'tableland' | 'coast'})`: stations 2, 3 and 5's flora (`SWHI.buildRainwall(box, q, bridges)`,
  `buildTableland`, `buildCoast`), each with its own far impostors (`impRainwall`, `impTableland`, `impCoast`).
- `SWHI.build({station: 'pillars'})`: station 4's flora (`SWHI.buildPillars(box, q)`): anemone trees on the tops and the fallen
  blocks (impostors `impPillars` past 800 m), cushion sponges, torch spikes, bead coral, rim turf, moss.
  `SWHI.build({sheet: [x, z, heading]})` lays the station's flora out in a row on any page's ground after its own (a preview:
  `SWHI.SHEETS[name]`); station 1's page does it with `?sheet=pillars|rainwall|tableland|coast` (views "Flora sheet (name): ...").
- `SWHI.canopyH(x, z)`: the tallest crown over a point.
- `SWHI.MAT`, `SWHI.BKMAT`: the materials, with the library maps swapped in by slot (`materials.json`).
