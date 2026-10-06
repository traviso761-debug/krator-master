# Krator biome kits — the contract (eastern badlands edition)

The eastern badlands kit (`EBADLANDS`) is built on the shared biome core exactly as `biomes/sedesert` is
(its `BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`, `lod`, `windows`,
`BIO.strata`). This file says what is different and what the kit exports.

## The region

The 'e badlands' overlay of the Krator Scale Model (4.18): about 345,000 km² east of the abyss, from its gentle
east rim to the airless outer rim. Height 300 m to 9.8 km (median 4.5 km), rain 0 to 1,240 mm a year (median
330), mean temperature -32 to +25 °C (median +2). Köppen: Cfa 22 %, ET 16 %, Dfc 14 %, EF 9 %, Dfb 8 %, O 7 %,
BSk 7 %, BSh 7 %, HF 4 % (`EBADLANDS.KOPPEN`). Nothing grows on EF, O or HF (`EBADLANDS.BARREN`).

The owner's brief (Oct 2026): a Great Basin of badlands and rocky desert with intermittent green valleys and
plateaus (Zion and the lusher West for the green places); hotter and more desolate in the north, with volcanic
ground and sulphur pools like the Danakil and small oases; milder and wetter in the south (humid subtropical,
the valley of Yuni); pine woods taking over toward the boreal peaks of the outer rim. Mostly terrestrial flora,
with the alien species of the reference sheets. **Dryness and temperature lead, not the Köppen label.**

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `cold` | 0 at +12 °C mean .. 1 at -10 °C | the main axis: hot waste, steppe, pine, boreal, tundra |
| `wet` | rain, channels, water | the second axis: waste/steppe vs vale; the forests need some |
| `rock`, `slope` | bare rock, gradient | the badlands; thins every zone |
| `canyon`, `rim`, `flow` | the carved channels | riparian floor, benches, rims |
| `dune` | dune seas | thins the open zones |
| `upland` | height and relief | read, not used for zoning (most of the region is high) |
| `geo` | **not bound by the world yet** | geothermal ground: the sulphur vents. 0 when unbound |
| `barren` | **not bound by the world yet** | ice cap and airless rim: nothing grows. 0 when unbound |

`geo` and `barren` are the two fields this kit needs that `openworld/little-demo` does not give
(`KNOWN_ISSUES.md`). The showcase host binds both.

## The zones (`EBADLANDS.zones(x,z)`)

| zone | reads | flora |
|---|---|---|
| `waste` | hot (cold < .2), dry (wet < .26), open | ember crowns, sunspires, needle blooms, yucca, juniper; mirage grass, spiral mats, moonflower cacti, prickly pear, red buckwheat |
| `vent` | geo | stilt pods, needle blooms, ember crowns; sulphur chimneys and crust mounds, gold parasols, fan cups |
| `steppe` | cold .03..72, wet < .45 | pinyon-juniper in stands, yucca, bristlecones up high; sagebrush, rabbitbrush, bunchgrass, phlox, buckwheat |
| `bad` | rock, cold < .6 | scattered juniper, pinyon, sunspires; banded stones, toadstool rocks; grass where wet |
| `vale` | wet > .18, cold < .55, gentle | gambel oak, maple, rose weepers, giant umbels, ponderosa; thick grass, wildflowers, ferns |
| `pine` | cold .22..68, wet > .14 | ponderosa, aspen groves, gambel oak, pinyon; bunchgrass, needle litter, lupine, phlox |
| `boreal` | cold .5..95, wet > .1 | Engelmann spruce and subalpine fir in stands, aspen; litter, moss, ferns, logs |
| `tundra` | cold > .82 | krummholz spruce (flag trees), bristlecones; cushions, moss, lichen, sedge, dwarf willow |
| `rip` | canyon × wet, or flow | cottonwoods, maples, weepers, umbels, aspen up high, spruce higher; reeds, sedge, ferns |
| `bench`, `rimZ` | a canyon's walls and lip | pinyon, juniper, maple, yucca; stones, bunchgrass, phlox |

Every zone is multiplied by `1 - barren` and by `1 - cliff`: **nothing roots on a layered cliff face** (the owner,
Oct 2026). `cliff` is steep ground (`slope` .8 → .96, about 30° and up) that is also rock (`rock` .3 → .6): the canyon
walls, the escarpment, the badland walls, the range's crags. The host's probe checks it, with a negative control. Spruce on the tundra shrinks to krummholz through its pass's `size`
hook (cold .84 → .97: 34 m → 1.2-3.6 m), and a spruce under 4.5 m is built as a flag tree.

## The species (`EBADLANDS.SPECIES`, tagged)

| # | key | name | H (m) | tags (climate, aridity, riparian) | Köppen |
|---|---|---|---|---|---|
| 0 | pinyon | Pinyon pine | 4-11 | temperate, semiarid, no | BSk Dfb Cfa BSh |
| 1 | juniper | Utah juniper | 3-8 | temperate, arid, no | BSk BSh Dfb |
| 2 | ponderosa | Ponderosa pine | 18-38 | temperate, semiarid, no | Dfb Cfa BSk |
| 3 | spruce | Engelmann spruce | 14-34 | cold, subhumid, both | Dfc Dfb ET |
| 4 | fir | Subalpine fir | 10-24 | cold, subhumid, no | Dfc Dfb |
| 5 | aspen | Quaking aspen | 9-22 | cold, subhumid, both | Dfb Dfc Cfa |
| 6 | bristlecone | Bristlecone pine | 3-10 | cold, semiarid, no | Dfc ET Dfb |
| 7 | cottonwood | Fremont cottonwood | 14-28 | temperate, subhumid, yes | Cfa BSk BSh |
| 8 | oak | Gambel oak | 3-9 | temperate, semiarid, no | Cfa Dfb BSk |
| 9 | maple | Bigtooth maple | 5-12 | temperate, subhumid, both | Cfa Dfb |
| 10 | yucca | Chaparral yucca | 3-5.5 | temperate, arid, no | BSh BSk Cfa |
| 11 | embercrown | Ember crown (alien) | 6-12 | tropic, arid, no | BSh |
| 12 | sunspire | Sunspire tree (alien) | 8-16 | tropic, arid, no | BSh BSk |
| 13 | needlebloom | Needle bloom (alien) | 3-9 | tropic, semiarid, no | BSh BSk |
| 14 | weeper | Rose weeper (alien) | 6-14 | temperate, subhumid, both | Cfa BSk |
| 15 | umbel | Giant umbel (alien) | 3-6 | temperate, humid, both | Cfa Dfb |
| 16 | stiltpod | Stilt pod (alien) | 5-10 | tropic, semiarid, both | BSh |

All `abyssal:false`. The alien species come from the owner's reference sheets (`reference/alien-flora.jpg`:
ember crown, sunspire, needle bloom, moonflower cactus, mirage grass, spiral mat, gold parasols; and the
pink weeping trees, the stilt-rooted pod plants, the fan cups and the giant umbels of the other 'alien' images).

## What the kit exports

```js
EBADLANDS.build({R:3250, quality:1}) -> {trees, heroes, far, bySpecies, ..., under, tris}
EBADLANDS.SPECIES / byKey / PAL / TAGS / KOPPEN / BARREN
EBADLANDS.zones(x,z)                 // the zone weights above
EBADLANDS.PASSES                     // [{sp, cell, accept(Z,x,z), opt:{pad, patch, patchScale, lodK, small, size(T,Z)}}]
EBADLANDS.make(sp,x,y,z) / grow(T,lv)// one tree alone (the open world's variants); grow returns null for lv 0 with no impostor
EBADLANDS.buildTrees(R,q,{records:true})   // place every tree, build none (level-free records for a variant host)
EBADLANDS.RICH_ALL                   // set by a variant host while it grows: every hero gets the full branch build
EBADLANDS.buildFloor(R,q)            // the floor, reseeding itself; EBADLANDS.floorWeights(Z) its zone mix, FLOOR_ZONES the names
EBADLANDS.canopyH(x,z), nearestTree(sp,x,z,minH), standOf(x,z,n,seed), COUNTS (trees per species, last build)
```

EBADLANDS.dress(geos, opt)           // growth on a structure the host hands over (65-dress): Zion's hanging gardens
                                     // (maidenhair curtains with monkeyflower and columbine), canyon grape curtains with
                                     // clusters, rose-weeper drapes, moss and lichen, ledge plants and saplings. Returns
                                     // {curtains, vines, drapes, plants, lichen, fruit}. Never touches the geometry.
EBADLANDS.HARVEST / SPECIES[i].tags.harvest   // {wood, edible[], medicinal, notes, fruit}: fruit is the catalog key
EBADLANDS.PLANTS                     // the small plants (floor and dressing), tagged like the species, with harvest and
                                     // the items that draw them; EBADLANDS.plantOfItem(item) for an inspector
EBADLANDS.FRUIT_KEYS                 // every catalog fruit this kit names (biomes/FRUIT.md, "Eastern Badlands")
EBADLANDS.hangVine(x,y,z,len,w)      // a canyon-grape curtain from a point (trees, floor and dressing share it)
```

No fauna (the owner's plan: one fauna kit for every biome, `biomes/README.md`).

## Fruit

Every fruiting plant draws its fruit, and its harvest tag names the catalog piece (`kits/catalog/
krator-master-furniture-generic-fruit.js`): pinyon cones, juniper berries, gambel-oak acorns, yucca seed pods on the
spent spikes, canyon grape clusters (vines on cottonwood and maple limbs, grape tangles on the canyon floor, the
hanging gardens), seeding umbel heads, the stilt pod's head, prickly-pear tunas, moonflower fruit. The probe checks that
every species with an edible part either names a catalog fruit or is listed as not drawn (`FRUIT_NOT_DRAWN` in
`91-host-probe.js`: sap, tips, nectar...), and that fruit is drawn on the stage.

```

## File layout

```
00-head.html                        page shell
35-core-strata.js                   the bedded-rock shader (vendored from sedesert, unchanged)
45-host-stage.js       (host)       the showcase transect: terrain, fields, the river, pools, tarn, painted ground, BIO.init
50-biome-ebadlands-species.js       palettes, 17 species (tagged), textures, geometries, items
55-biome-ebadlands-trees.js         zones; builders (open pine, spire, broadleaf, and one per alien); impostors; PASSES; make/grow
60-biome-ebadlands-floor.js         the floor by zone; toadstool rocks, chimney fields, logs, reeds in the shallows
65-biome-ebadlands-dress.js         growth on structures: hanging gardens, grape curtains, moss, ledge plants
70-biome-ebadlands.js               build / dress / canopyH; BIO.kitEnd
82-host-sky.js         (host)       sedesert's sky with the wall turned east: the outer rim, iced
85-host-arcade.js      (host)       the hanging-garden arcade: a test structure for dress()
86-host-variants.js    (host)       trees as variants: the nursery (grow, harvest) and instance pools by camera distance
88-host-build.js       (host)       build order: arcade, records, floor, dress, bake, variants
90-host-camera.js      (host)       presets found from the zones, the inspector (class and tags)
91-host-probe.js       (host)       window._api: budgets and the host checks with their negatives
93-host-polytool.js    (host)       polygon and path tool (from nhighlands)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`.
