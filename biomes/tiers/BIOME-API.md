# biomes/tiers: the kit's API

The Tiers' natives on the biome core (`core/biome`), Korona's and the Outlands' shape (PLAN.md section 0). A world loads the core,
then this kit's fragments `50`-`70` in its own registry (`BIO.kit('tiers')` ... `BIO.kitEnd(TIERS)`), after a host that has called
`BIO.init` with the fields below. The kit never reads a host global except through `BIO.host` and `BIO.field`.

## The object: `TIERS`

| Name | What |
|---|---|
| `TIERS.build({R, quality})` | places the tree-scale natives (`buildTrees`) and the floor (`buildFloor`) in the disc of radius R round the origin; returns the counts (`bySpecies`, `under`: the floor's kinds) |
| `TIERS.SPECIES` | the tree-scale natives: `shelfoak`, `steppalm`, `candelabra`, `ladderreed`, `whorlpine` (its pass last: the `cool` zone) (`{key, name, i, H, rb, crownR, tiers, bark, leaf, tags}`) |
| `TIERS.PLANTS` | every native by key (the twelve of PLAN.md section 4, each drawn), `{name, tags, items, station}`; tags: `climate`, `aridity`, `abyssal`, `riparian`, `koppen`, `harvest` (`wood`, `edible`, `medicinal`, `note`, `gather`: core/hamlet's key), `tiered` |
| `TIERS.byKey`, `TIERS.plantOfItem(item)` | a species by key; the plant an instanced item belongs to (the inspector's) |
| `TIERS.make(sp, x, y, z)`, `TIERS.grow(T, lv)` | one tree, the shape every kit's make/grow has (an open world's nursery): lv 2 near, 1 mid, 0 far (the oak's and the palm's tiers in silhouette) |
| `TIERS.treeAt(key, x, y, z, {seed, lv})` | one tree where a world puts it (a village garden's), drawing from its own seed |
| `TIERS.zones(x, z)` | the zones from the host's fields (`shallows`, `bay`, `shore`, `wood`, `dry`, `ledge`, `face`, `tread`, ...); `temperate` (the lake tread's and the treads' warm-to-mild ground: 0 on the hot floor under ~0.5 km and on the cold stair), `cool` (the whorl pine's: the upper steps over ~2.5 km, and south-looking ground over ~2 km), `high` (the cold stair over ~4.2 km) and `stair` (its open land: the pagoda bush's, the stack cushion's) |
| `TIERS.PASSES` | the tree passes as data: `{key, cell, accept(Z), water, opt}` |
| `TIERS.TREES`, `TIERS.COUNTS` | the trees placed (each with `tierYs`: the heights of its tiers), and the count by species |
| `TIERS.SHRUBS` | the near pagoda bushes (`{key, x, z, discs}`: their tiers, for the rule's check where a station has no native trees) |
| `TIERS.blocked(x, z, pad)`, `TIERS.canopyH(x, z)` | the trees' keep-clear (core/space); the canopy's top near a point |
| `TIERS.PAL`, `TIERS.MAT`, `TIERS.G`, `TIERS.TEX`, `TIERS.LIB` | palettes, materials, geometries, the procedural fallbacks, the library swap |
| `TIERS.KOPPEN`, `TIERS.BARREN` | the polygon's classes by share (PLAN.md section 3), the barren ones (EF) |

Also in the kit's folder, data for the host: `TIERS_STRATA(o)` and `TIERS_STEP(y)` (`src/44r-biome-tiers-strata.js`: the `tiers-floor`,
`tiers-black`, `tiers-red`, `tiers-white` and `tiers-grey` KSTRATA recipes, added by `KSTRATA.add`; the stack by height, the step's name at
a height).

## The fields the kit reads (`BIO.field`)

`slope`, `rock`, `strata`, `wet`, `seep` (a seep's line), `ledge` (a bench in a riser), `farm`, `road`, `tread` (a step's tread behind its rim),
`talus`, `cold`, and the water's own numbers once the host binds them (`shoreD`: m to the water's edge, signed, under 0 in the water; `depth`).
Missing ones read 0 (`shoreD` reads 40: dry land). `BIO.host.waterH(x, z)` gives the water's level (the reeds, the lilies).

## Items

`oakplate` (the shelf oak's level sprays, a clump held by its sprigs' stems), `palmfan`, `palmfruit`, `cane`, `whorl`, `reed`, `heath`,
`tiergrass`, `pad` and `lilybloom` (free: on the water), `moss`, `lichen` (grows on faces), `cbloom`, `boulder`, `stone`, `column`, and the cold
stair's `pagoda` (a pagoda bush's disc top, `card.saltbush`), `pdisc` (its drums and stem) and `cushion` (a stack cushion's lathed mound, `surface.cushion`); `pinespray` (the whorl pine's level needle sprays, `card.pine`).
Buckets: `bark.oak`, `bark.palm`, `bark.skirt`, `bark.cactus`, `bark.pine` (`bark.ponderosa`), `far`.

Also for the open world: `outposts.json`, three candidate sites in `openworld/outposts`' shape (`KOUTPOST.offer('tiers', ...)`; the
kit's node test offers them).
