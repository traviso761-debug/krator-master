# Krator biome kits — the contract (crater drylands edition)

The crater drylands kit (`CRATERDRY`) is built on the shared biome core exactly as `biomes/sedesert` and
`biomes/ebadlands` are (`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`,
`lod`, `windows`). This file says what is different and what the kit exports.

## The region

The two 'crater drylands' overlays of the Krator Scale Model: the floor of the central crater in the Throne's rain
shadow, ~1.9 atm, hot and dry, bordering SW Bay and the savannah south of the hyperjungle. Koppen BSh, BWh and Aw
(`CRATERDRY.KOPPEN`; an ESTIMATE, the scale model's rasters were not read: `KNOWN_ISSUES.md`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `rock`, `slope` | bare rock, gradient | the kopjes (refuges); `cliff` (steep rock) zeroes every zone |
| `flow` | channels | the washes; a fire crosses their sand slowly |
| `wet`, `oasis` | rain, water | the seep; damp ground carries fire badly |
| `cold` | mean temperature | read, not used for zoning (the drylands are hot everywhere) |
| (terrain, water) | `terrainH`, `waterH` | the fire model's slope term; nothing burns under water |

**The burn age is the kit's own.** `CRATERDRY.fireHistory(o)` runs the fire model over the host's terrain and fields
(52-fire). A world calls it once before `build` with its own options, or the first `build` makes one with the defaults.
An open world that streams tiles would call it over its whole region once (it is a 20 m grid: ~4 MB for 50 km) or bind
an age field of its own: the kit reads only `CRATERDRY.ageAt(x,z)`.

## The fire model (`52-biome-craterdry-fire.js`, [G data])

```js
CRATERDRY.fireHistory({R, cell:20, seed, wind:[dx,dz] /* blowing toward */, old:9,
                       fires:[{ago /* years */, x, z, frac /* share of the disc */, veer}]})
  -> FIRE {R, cs, N, x0, z0, last /* years since a cell last burned, Float32 */, id /* its fire */,
           front /* the newest fire's arrival order 0..1, -1 elsewhere */, base /* burnability */,
           fires:[{ago, x, z, frac, cells, failed}], ageAt(x,z), fireAt(x,z), frontAt(x,z), shares()}
CRATERDRY.ageAt(x,z) / fireAt(x,z) / frontAt(x,z)   // the current history (made with defaults if none)
CRATERDRY.stages(age) -> {char, bloom, regrow, mature}   // the mosaic's stages as weights
CRATERDRY.fuelK(age)                                     // the fuel a cell carries `age` years after it burned
CRATERDRY.fireRun({x, z, wind, maxT, maxCells})          // a LIVE fire lit now through the history's fuel: {ok, arrive
                                                         // (seconds per cell, Infinity where it never arrives), order
                                                         // (cells in the order they caught), range(t0,t1), state(x,z,t),
                                                         // at(x,z), x, z, wind, N, cs, x0, z0, H}; {ok:false} on granite,
                                                         // sand, water or a fresh burn
CRATERDRY.FIRE_SEC, FLAME_H                              // model units to seconds (1.6); the flame height (12 m)
CRATERDRY.NEVER                                          // 60: the age of ground no recorded fire reached
```

Spread speed per step: burnability (`(1-rock)^2 (1-.72 flow) (1-.7 wet)`, an fbm patch for unburnt islands) x
`fuelK(age at the fire's time)` x wind `(1+.72 cos)^2` x slope `exp(3 dh/ds)` clamped. A fire takes the first `frac` of
the disc's cells it reaches. Fires run oldest first, so each is stopped by the fresh burns before it.

## The zones (`CRATERDRY.zones(x,z)`)

| zone | reads | flora |
|---|---|---|
| `kop` | rock | tree aloes, ember jade, pincushion trees; boulder piles, crassula, prism ferns in the clefts, lichen |
| `wash` | flow | ghost gums, prism mallees; cobbles, prism ferns, grass, poppies |
| `seep` | oasis | ghost gums; reeds, ferns, green grass |
| `char` | open × age < ~.6 | the trees as the fire left them; ash, char debris, charred shrubs, fire lilies |
| `bloom` | open × age ~.4 .. ~2.5 | sword spires in flower, seedlings, resprouts; the drifts (fireweed, poppy, lupine, goldfields, flame plume) |
| `regrow` | open × age ~2.5 .. ~7 | the scrub trees growing back; young chaparral, broom, protea, buckwheat |
| `mature` | open × age > ~7 | full-grown scrub trees; dense old chaparral, straw grass, dead wood |

Every zone is multiplied by `1 - cliff` (steep granite).

## The species (`CRATERDRY.SPECIES`, tagged)

| # | key | name | H (m) | fire | Koppen |
|---|---|---|---|---|---|
| 0 | prismmallee | Prism mallee | 6-13 | resprouter | BSh BWh Aw |
| 1 | pillar | Pyre pillar (alien) | 11-26 | survivor | BSh BWh |
| 2 | frill | Frill-tree (alien; the Rift's frill tree in kiln country) | 5-11 | seeder | BSh Aw |
| 3 | parasolpine | Parasol pine | 16-28 | survivor | BSh Aw |
| 4 | ghostgum | Ghost gum | 18-32 | survivor | BSh Aw |
| 5 | treealoe | Tree aloe | 3-7 | avoider | BSh BWh |
| 6 | joshua | Joshua tree | 4-9 | killed | BWh BSh |
| 7 | pincushion | Pincushion tree (alien) | 4-8 | survivor | BSh BWh |
| 8 | jade | Ember jade | 2-4.5 | avoider | BSh BWh |
| 9 | yucca | Chaparral yucca | 2.5-5 | resprouter | BSh BWh |
| 10 | swordspire | Sword spire (alien) | 1.6-3.4 | seeder | BSh BWh |

`tags.fire`: resprouter (top-killed, back from the root crown), seeder (killed; its seed waits for the fire), survivor
(charred, not killed), avoider (lives where fire rarely reaches), killed (the snag stands for years). Every tree record
carries `age`, and every builder draws its tree as the fire left it.

## What the kit exports

```js
CRATERDRY.build({R:2450, quality:1}) -> {trees, heroes, far, bySpecies, shoots, seedlings, under, fires, shares, tris}
CRATERDRY.SPECIES / byKey / PAL / TAGS / KOPPEN / HARVEST / PLANTS / plantOfItem(item)
CRATERDRY.zones(x,z) / PASSES / make(sp,x,y,z) / grow(T,lv) / nearestTree(sp,x,z,minH,{age:[lo,hi]})
CRATERDRY.buildFloor(R,q) / floorWeights(Z) / FLOOR_ZONES / driftOf(x,z) / BLOOM_SETS
CRATERDRY.canopyH(x,z), COUNTS
```

No fauna (the owner's plan: one fauna kit for every biome, `biomes/README.md`); the Scyvoi's lizard mounts belong there.
No catalog fruit yet (`KNOWN_ISSUES.md`).

## File layout

```
00-head.html                        page shell
45-host-stage.js       (host)       the showcase: terrain, kopjes, washes, the seep, fields, light, the recent fires, BIO.init
50-biome-craterdry-species.js       palettes, 11 species (tagged, with their fire response), textures, geometries, items
52-biome-craterdry-fire.js          the fire model and the mosaic's stages [G data]
55-biome-craterdry-trees.js         zones; builders (each draws its burnt states); impostors; PASSES; make/grow
60-biome-craterdry-floor.js         the floor by stage; the bloom's carpet, the kopjes' boulder piles, burnt logs
70-biome-craterdry.js               build / canopyH; BIO.kitEnd
82-host-sky.js         (host)       the dense-air dome: the Throne far in the SSE, a far wildfire's smoke; the gas giant
84-host-ground.js      (host)       the fire history with the showcase's fires; the ground painted by the mosaic; the seep
88-host-build.js       (host)       build order and bake
90-host-camera.js      (host)       presets found from the burns and the built trees; the inspector (tags, the burn's age)
89-host-fire.js        (host)       the live fire: the arrival map as a texture, the plant materials' patch, flames, smoke, the
                                    fire's light, the controls (F, x1/x10/x60, Put it out), the preset; FIREFX
91-host-probe.js       (host)       window._api: budgets and the host checks with their negatives
93-host-polytool.js    (host)       polygon and path tool (from nhighlands)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`.
