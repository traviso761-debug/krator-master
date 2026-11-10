# biomes/godstep: the kit's contract (`GSTEP`)

Godstep valley (`PLAN.md`): the god's stair of ponded titanium-basalt flows. The kit is on the biome core (`core/biome`) like every
biome kit; its leaves (`src/50`-`70`) reach the world only through `BIO.host` (`terrainH`, `fields`, `seed`, `THREE`). Started from
`biomes/godthrone` (the same rock, the same host shell).

## The object

| | |
|---|---|
| `GSTEP.build({R, quality, box, path})` | the ground's loose stuff and the pioneers over `box` ([x0, z0, x1, z1]); `path` the procession's way ([[x, z], ...]: its cairns). Returns the counts: `talus`, `columns`, `bigBlocks`, `stones`, `cushions`, `crusts`, `moss`, `cairns`, `ms` |
| `GSTEP.groundAt(x, z, o)` | the ground's class weights 0..1 from the host's fields: `skin`, `palag`, `soil`, `lichen`, `sand`, `moss`, `snow`, `playa`, `path`, `cone` (the old basalt shows where none does) |
| `GSTEP.GROUND` | each class's colour (sRGB) and name; `GSTEP.CLASSES` their order |
| `GSTEP.PAL` | the items' tints |
| `GSTEP.SPECIES` | the pioneers: `cushion`, `crust`, `mossmat` (the kit's own flora at station 1, `PLAN.md` section 3) |
| `GSTEP.tagsOf(label)` | the inspector's words for an item |
| `GSTEP.TAGS` | `{climate: 'cold-steppe', aridity: 'arid', koppen: ['BSk', 'Dsb', 'Dsc']}` |
| `GSTEP.dress()` | `null`: nothing grows on a structure here |

## The items (`BIO.def`, core/tags class in brackets)

`boulder` (feature), `column` (feature: a whole hexagonal prism fallen from a colonnade, 1 long), `stone` (feature), `cairn` (feature:
the procession's), `cushion`, `crust`, `mossmat` (plant: `BIO.fung` cap and crust parts, vertex-shaded).

## What the host must give (`BIO.host.fields`)

`face`, `talus`, `slope`, `sand`, `cone`, `snow`, `playa`, `path`, `soil`, `skin`, `lichen`, `moss` (0..1 each), and `BIO.mask`.
The page's own (`src/45c-host-field.js`) caches them on a 20 m lattice from the station's ground model (`src/45b-host-model.js`). The
core's field contract (`BIO.env`, `core/biome/41-core-env.js`) is filled from the same: `elevation`, `slope`, `temp`, `cold`, `wet`,
`salt`, `rock`, `upland`.

## The station's data a reader can take

`STAIR` (the `KRELIEF.stair` record: the steps, the front's lobes, its tongues, `flowTops`), `CONES`, `TUMULI` (`KRELIEF.tumuli`
records), `PLAYA`, `PATH` (the procession's way), `FLOWS` (the bake: `dh`, `age`), `STRATA` (the front's beds) are the page's
globals; the sites (the procession's way, the cones, the pan) are registered as core/tags records.
