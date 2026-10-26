# biomes/catch: the kit's contract

The Catch (`PLAN.md`: the sealed basin south-east of the Godthrone) is one kit, **CATCH**, on the shared biome core, with
the **sedesert** kit read in place at the oases (its wadi palm and mesquite, its reeds and sedges) and the **kits/mechs**
bundle (culture `stalker`) for the set dressing. One `src/`, one pack, one host; each station its own page
(`build.py --station <name>`; `stations/<name>/` holds that station's `00-head.html` and `45b-host-stage.js`, its
`station.json` the page's name).

## What a stage gives (`45b-host-stage.js`)

Every station defines the same globals; the shared host fragments (45c, 46, 80, 88, 89*, 99) read them.

| name | what |
|---|---|
| `TERR.R` | the station's radius (m); the ground covers 2.2 R |
| `terrainH(x,z)` | the ground (the dunes, the nebkhas, the pools' hollows, KBASIN's marks); `groundAll` adds the mesas' tops (the camera's ground) |
| `waterH(x,z)` | the water's level where there is water, else -1e9: answers from the same records 89w draws |
| `ROCK` | `KSTACKS` records (`core/terrain/37-core-stacks.js`): the castellated lake-bed mesas; `[]` where there are none |
| `WIND` | the prevailing wind (unit [x, z]): the dunes and yardangs run with it; ATMOS's base wind |
| `FC`, `FIELD` | the field cache and the fields handed to the kits (`bindStage`, 45-host-scene.js) |
| `STAGE` | the station's say, below |

`bindStage({R, N, terrainH, waterH, fieldsAt, seed, spine, lod, rockAt, keep})` bakes the fields, makes the mask (nothing
under the water, on a mesa, or on ground the stage keeps: a camp, the portal's apron) and calls `BIO.init({tags:'catch'})`.

| `STAGE.` | what |
|---|---|
| `key`, `name`, `title`, `hint`, `seed`, `hour` | the page's words, its seed, the hour it opens at |
| `site {px, py}`, `air {pressure, humidity}`, `clouds`, `fogDensity`, `siteH` | the shared sky's preset at the station's point on the scale model |
| `ridges` | the shared sky's far land (`core/atmos/SKY-PLAN.md` 3.3), far to near, up to four: `{dist, base, amp, cycles, octaves, peaks, peakAmp, win, floor, seed, rock, snowH, haze}` |
| `paint(F, colour)`, `layers` | the ground's vertex colour from the fields at a vertex, and its library layers `[[family, F => weight], ...]` (up to twelve) |
| `water` | `[{key, kind 'still' \| 'open' \| 'flow', rec \| open: WATER.open's options, look: the draw's options}]` |
| `nebkhas` | `[{x, z, r, h}]`: the sand cones in the land; the kit stands a salt cedar on each |
| `bias` | `{species or plant key: number \| (x, z) => number}`: the station's say on a density |
| `sedQ`, `sedMask(x,z)`, `sedFields` | the sedesert kit's quality (0: not built), where it may root, and its zone fields while it builds |
| `stalkers` | `[{kind 'st_harpooner' \| 'st_blade', x, z, bury, yaw}]` |
| `expect` | the species and plants the station must place (a probe check) |
| `views(gh, nearTree)` | the preset views, framed once the kit has built |
| `registers`, `exportBox`, `spine` | the landforms' registered volumes, the export profile's box, the LOD spine |

## The fields (through `BIO.field`)

`wet` is **the water table** (1 at a pool; a poplar lives over .5, dies standing from .47 down), `flow` a channel's
banks (dead or alive), `rock`, `slope`, `upland`, `cold`; the Catch's own: `sand` (loose sand), `reg` (gravel desert),
`silt` (old lake sediment), `yard`, `bed`, `strand`, `dry` (KBASIN's), `crust` (white efflorescence), `soda` (soda
crust), `salt` (ochre salt polygons), `algal` (the mats at the water), `spring`, `trod` (trampled ground). The sedesert
kit's `dune`, `canyon`, `rim`, `oasis`, `abyss` are the stage's `sedFields` while it builds (`dune` 1 keeps its scrub,
cacti and Socotran succulents off the Catch) and inert otherwise.

## The kit's surface (`CATCH`)

- `CATCH.build({R, quality})`: the trees (55), the floor (60). `CATCH.canopyH(x,z)`.
- `CATCH.SPECIES` (the Euphrates poplar, the salt cedar), `CATCH.PLANTS` (the dune shrub, reeds, saltbush, the brine lamp,
  fallen poplar wood; each with `items` and `tags`), `CATCH.OASES` (the five, named in the four tongues; px proposed).
- `CATCH.TREES` (`{x, z, y0, sp, H, rb, crownR, lv, dead, gold, nebkha}`), `CATCH.COUNTS`, `CATCH.nearestTree(sp, x, z, pred)`,
  `CATCH.plantOfItem(item)`.
- `CATCH.place(cell, salt, accept, fn, opt)`: the cell grid seeded by `KRAND.hash(CATCH.SEED, salt, i, j)`; `CATCH.bias`,
  `CATCH.blocked` (core/space keep-clear), `CATCH.col(slot, colour)` (a full-colour card keeps its own colour).

Every tree is a registered volume (a record of class flora: a dead poplar is named so); every item set a core/tags set;
the fire rings, spoil heaps, the portal and the Stalkers are registered records; Stair's site is a record (`site.stair`),
not a volume: nothing is drawn on it.

## The library (`materials.json`)

`ground.*` are the painted ground's layers, `rock.*` the mesas', `bark0`/`bark1` the barks (`BIO.libSwap`), and the five
nine-cell sheets (poplar, tamarisk, reed, saltbush, brine lamp) are full colour, each item cutting its own cell in its uv
(`CATCH.cellUV`), so their families carry no pack `cell`.
