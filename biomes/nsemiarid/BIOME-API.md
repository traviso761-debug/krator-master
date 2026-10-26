# Krator biome kits — the contract (n semiarid edition)

The n semiarid kit (`NSEMIARID`) is built on the shared biome core exactly as `biomes/ebadlands` is (its `BIOME-API.md`,
and sedesert's before it, is the full contract: the host object, `waterH`, fields, `register`, `lod`, `windows`). This
file says what is different and what the kit exports.

## The region

The 'n semiarid' biome region of the Krator Scale Model (4.21; `PLAN.md` section 1): 183,000 km² round the drained dam
lakes, median 941 m (~1.42 atm), median rain 408 mm, median annual mean 23 °C, wind power 228 W/m². Köppen: BSh 46.6%,
Csa 15.9, Cfa 11.9, BWh 7.8, Dsb 5.0, Aw 4.1, Af 2.2, Csb 2.0, BSk 1.3, Dfb 1.2, Cfb 0.9, Am 0.8 (`NSEMIARID.KOPPEN`).
The highland spurs over 2.5 km (Dsb, Csb, Dfb, Cfb) are for the nhighlands and ebadlands kits read in place (`PLAN.md`):
not in this kit yet (`KNOWN_ISSUES.md`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `wet` | rain, channels, water (~ rain / 1,800 mm) | the main axis: desert < .17, steppe .1-.36, med .27-.56, forest > .46; the margins |
| `flow` | a stream's or a spring's banks | rip (planes), tugai with wet |
| `upland` | height | keeps the tugai low; walnuts up the streams |
| `cold` | the mean temperature | hot: the med zone and the tugai want it warm |
| `rock`, `slope` | bare rock, gradient | cliff: nothing roots; thins every zone |
| `dune` | dune seas | thins the open zones |
| `salt` | salt ground | pan (salt fingers, windows, step cones; dead poplars) |
| `bed`, `silt`, `dry` | **the dam-basin overlay** (`core/terrain/40-core-basin.js`); 0 when unbound | step cones read `dry` (the years since the ground came out of the water, 0..1 of the overlay's age) on the bed |
| `scour` | **the scablands overlay** (`core/terrain/41-core-scour.js`); 0 when unbound | thins the steppe on the scoured channels |

## The zones (`NSEMIARID.zones(x,z)`)

`desert`, `pan`, `steppe`, `med`, `forest`, `tugai`, `rip`, and `cliff` (every zone x 1 - cliff): `55-biome-nsemiarid-
trees.js` says how each is made. `NSEMIARID.FLOOR_ZONES` and `floorWeights(Z)` are the floor's.

## The species (`NSEMIARID.SPECIES`, tagged)

| # | key | name | H (m) | travel | Köppen |
|---|---|---|---|---|---|
| 0 | pistachio | Wild pistachio | 4-9 | seed | BSh Csa BSk |
| 1 | saxaul | Crescent saxaul | 3-7 | grove (crescents downwind) | BWh BSh |
| 2 | plane | Spring plane | 18-34 | seed | Csa Cfa BSh |
| 3 | judas | Judas tree | 5-10 | seed | Csa Cfa Csb |
| 4 | almond | Wild almond | 4-8 | seed | Csa BSh Csb |
| 5 | apple | Wild apple | 6-14 | seed | Cfa Csb Dsb Cfb |
| 6 | walnut | Wild walnut | 14-26 | seed | Cfa Csa Dsb |
| 7 | apricot | Wild apricot | 5-10 | seed | Cfa Csa BSh Dsb |
| 8 | pear | Wild pear | 6-12 | seed | Cfa Csb Cfb |
| 9 | samara | Kite ash | 12-24 | wind (half-metre samaras) | Cfa Csb Dfb |
| 10 | poplar | Golden poplar | 10-22 | wind (cotton) | Aw Af Am BSh BWh |
| 11 | frill | Dandelion frill (alien) | 12-20 | wind (plumed fins) | BSh Csa BSk |
| 12 | trumpet | Helicopter trumpet (alien) | 8-16 | wind (spinning funnel, winged seeds) | BSh BWh Csa |
| 13 | lantern | Drift lantern (alien) | 4-8 | float (gas bulbs) | Cfa Csa Csb |
| 14 | pomegranate | Wild pomegranate | 2.5-5 | seed | Csa BSh Aw |
| 15 | foxtail | Foxtail spire | 4-8 | wind | BSh Csa Dsb |
| 16 | dandelion | Giant dandelion | 3.5-6 | wind (clock, balding downwind) | BSh BWh Csa |

The small plants are `NSEMIARID.PLANTS` (tagged, with `items` and `travel`): wormwood, drill grass, grass, tumbler,
crawler, resurrection ball, tulips, reeds, balloon pod, glider gourd, and the small and weird (strider, mace head, bead
chain, sail candelabra, star drifter, censer caps, horn pipes, roll-egg, furler, hitcher, step cone, window plant, salt
fingers, rust vine).

## What the kit exports

```js
NSEMIARID.build({R:3250, quality:1}) -> {trees, heroes, far, dead, bySpecies, ..., under}
NSEMIARID.SPECIES / byKey / PAL / TAGS / KOPPEN / PLANTS / plantOfItem(item) / HARVEST / FRUIT_KEYS
NSEMIARID.WIND, setWind([x,z])        // the prevailing wind: every traveller's heading reads it (a world binds its own)
NSEMIARID.zones(x,z), standOf(x,z,n,seed), crescentAt(x,z) -> [live, dead]   // the saxaul groves' arcs, by position
NSEMIARID.PASSES                      // [{sp, cell, accept(Z,x,z), opt:{pad, patch, patchScale, lodK, small, size(T,Z,x,z)}}]
NSEMIARID.make(sp,x,y,z) / grow(T,lv) // one tree alone (variants); T.dead grows a dead tree (a golden poplar on the salt)
NSEMIARID.buildTrees(R,q,{records:true}), buildFloor(R,q), floorWeights(Z), FLOOR_ZONES
NSEMIARID.hangVine, seedsAloft, blooms, small.{...}   // shared by trees and floor
NSEMIARID.canopyH(x,z), nearestTree(sp,x,z,minH,pred), COUNTS, TREES
```

No fauna (one fauna kit for every biome, `biomes/README.md`).

## File layout

```
00-head.html                        page shell
45-host-scene.js       (host)       the page: renderer, scene, haze, camera, lights, ticks, registry
45b-host-stage.js      (host)       the showcase transect: terrain (KBASIN's marks on the old bed), fields, water, BIO.init, STAGE_WATER, STAGE_GROUND (an overlay's station replaces this file: biomes/scablands)
45c-host-ground.js     (host)       the painted ground for any stage (STAGE_GROUND: N, label, rows, tint)
50-biome-nsemiarid-species.js       palettes, 17 species and 24 small plants (tagged), textures, geometries, items
55-biome-nsemiarid-trees.js         zones; crescents; builders (broadleaf, and one per alien and tall herb); impostors; PASSES; make/grow
60-biome-nsemiarid-floor.js         the floor by zone; the travellers with their headings; dew gardens; drifts; windfall; dead saxaul
70-biome-nsemiarid.js               build / canopyH; BIO.kitEnd
82-host-sky.js         (host)       the eastern badlands' sky with the wall turned north
86-host-variants.js    (host)       trees as variants (the eastern badlands', renamed; a dead form)
88-host-build.js       (host)       build order: the wind, records, floor, bake, variants
89b-host-atmos.js      (host)       core/atmos and core/water bound: the wind setting (calm, a breeze, high; ?wind=), NSWIND, the water drawn
89c-host-seeds.js      (host)       the seed weather (drifting plumes) and seed flight: the seeds the wind tears off the trees
98-host-checks.js      (host)       the kit's checks (HCHK) and the inspector's words, naming no place (a stage's own plants: STAGE_PLANTS {plantOfItem, kit})
99-host-take.js        (host)       the stage's page handed to core/host: presets, budgets, which checks run (an overlay's station replaces it)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`; `core/terrain/40-core-basin.js` through `CORE_TERRAIN`;
`core/water` and `core/atmos` through `CORE_WATER` and `CORE_ATMOS` (the water's records are made in 45, drawn in 89b).
