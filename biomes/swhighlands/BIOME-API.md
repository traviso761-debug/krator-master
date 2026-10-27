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

`SWHI.zones(x, z)` combines them (`forest`, `cove`, `crest`, `valley`, `bald`, `farm`, ...).

## Calls

- `SWHI.build({box, quality, bald: [x, z, r]})` -> counts. The trees (by `KRAND` cell, `SWHI.cells`), the fallen cords, the floor.
  `bald` is where the bald's pillar cap stands and the clearing it holds. A tile built alone draws what the full build draws in it.
- `SWHI.SPECIES` (`latticeoak`, `beadcone`, `pillarcap`) and `SWHI.PLANTS`, each with `tags` (climate, aridity, abyssal, riparian,
  harvest); `SWHI.tagsOf(nameOrLabel)` for an inspector hit.
- `SWHI.TREES` (records: `x, z, y0, sp, H, rb, crownR, seed, lv`), `SWHI.LOGS`; `SWHI.BUILD.lattice|cone|pillars|log(T, st, lv, stream)`
  draws one (a world placing its own: give it `KRAND.stream(T.seed ^ 0x5157)`).
- `SWHI.LOD` `{tree: 800, near: 450, floor: 420}`: heroes in full to `near`, a lighter form to `tree`, octahedral impostors beyond
  (and for every hero past its range); the floor to `floor`, the bald's plants to 700 m.
- `SWHI.canopyH(x, z)`: the tallest crown over a point.
- `SWHI.MAT`, `SWHI.BKMAT`: the materials, with the library maps swapped in by slot (`materials.json`).
