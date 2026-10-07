# Krator biome kits — the contract (southern highlands edition)

The southern highlands kit (`SHIGH`) is built on the shared biome core exactly as `biomes/crater-drylands` and
`biomes/sedesert` are (`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`,
`lod`, `windows`). This file says what is different and what the kit exports.

## The region

The Inner Wall's southern flank above the hyperjungle's scarp, ~1 atm: a cloud forest where the cloud sea laps against
the Wall, a paramo of giant rosettes above it, drying to the south-east. Koppen Cfb, Cwb, ET and BSk (`SHIGH.KOPPEN`;
an ESTIMATE, the scale model's rasters were not read: `KNOWN_ISSUES.md`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `fog` | **new**: how often the ground stands in cloud, 0..1 | the cloud forest (> ~.6), its elfin edge (~.3 .. ~.6), the open paramo below that |
| `rock`, `slope` | bare rock, gradient | the crags (tors); `cliff` (steep rock) zeroes every zone |
| `oasis` | the bogs | sphagnum, sundews, lobelias, groundsels |
| `canyon`, `flow` | the ravines, the streams | screw palms, tree ferns, ginger |
| `wet` | rain | the dry side where it is low |
| (terrain, water) | `terrainH`, `waterH`, `mask` | the host's mask keeps every plant above the cloud deck |

A world without `fog` gets 0 everywhere (the core's default), so the kit draws only paramo: a world that wants the
cloud forest must bind it. A first cut: `smooth(420,60,h-deck)` plus the ravines and the bogs (`45-host-stage.js`).

## The zones (`SHIGH.zones(x,z)`)

| zone | reads | flora |
|---|---|---|
| `forest` | fog high | volute, coilbark, spiral trumpet, spiral frill tree, crozier tree fern; moss, begonias, ferns, ginger, coral shrubs, fallen wood |
| `elfin` | fog middling | coilbark (low, mossy), trumpets, spiral frill trees, ruffle-crowns; moss, tussock, tank bromeliads, coral shrubs, daisies |
| `paramo` | fog low, wet | ruffle-crown, giant groundsel, spiral lobelia; swirl tussock, rush, rosettes, daisies, cushions, lichen |
| `dry` | fog low, wet low | spiral aloe, corkscrew cereus, ruffle-crowns; straw tussock, braid spears, albuca, stones |
| `bog` | oasis | groundsels, lobelias; sphagnum, rush, sundews, cushions |
| `crag` | rock | aloes, cereus; lichen, albuca, rosettes, boulders |
| `ravine`, `stream` | canyon, flow | screw palms, tree ferns; ferns, ginger, moss |

Every zone is multiplied by `1 - cliff`.

## The species (`SHIGH.SPECIES`, tagged)

| # | key | name | H (m) | spiral | Koppen |
|---|---|---|---|---|---|
| 0 | coilbark | Coilbark | 9-22 | twist | Cfb Cwb |
| 1 | trumpet | Spiral trumpet (alien) | 12-26 | twist | Cfb Cwb |
| 2 | volute | Volute tree (alien) | 18-32 | shell | Cfb |
| 3 | crozier | Crozier tree fern | 3-9 | coil | Cfb Cwb |
| 4 | screwpine | Screw palm | 5-14 | twist | Cfb Cwb |
| 5 | ruffle | Ruffle-crown (alien) | 5-11 | whorl | Cfb Cwb ET |
| 6 | groundsel | Giant groundsel | 2.5-8 | whorl | Cfb ET |
| 7 | lobelia | Spiral lobelia | 1.6-5 | whorl | Cfb ET |
| 8 | aloe | Spiral aloe | 0.4-1 | whorl | Cwb BSk |
| 9 | cereus | Corkscrew cereus | 1.5-7 | twist | BSk Cwb |
| 10 | frill | Spiral frill tree (alien) | 12-26 | whorl | Cfb Cwb |

`tags.spiral` is one of `SHIGH.SPIRALS` (whorl, twist, coil, shell); each species also has `how`, the words for its
spiral (the inspector shows it). Every tree record carries `hand` (+1, or -1 for the rare mirror-handed tree) and
`fog`.

## What the kit exports

```js
SHIGH.build({R:2450, quality:1}) -> {trees, heroes, far, mirrors, bySpecies, trumpets, scrolls, frills, cabbages, ..., under, tris}
SHIGH.SPECIES / byKey / PAL / TAGS / KOPPEN / HARVEST / PLANTS / plantOfItem(item) / SPIRALS / HAND / GOLD
SHIGH.zones(x,z) / PASSES / make(sp,x,y,z) / grow(T,lv) / nearestTree(sp,x,z,minH,{hand})
SHIGH.mirrorAt   // [{key,x,z}]: before build, ask for the nearest hero of that species there to be mirror-handed
SHIGH.MIRROR_EVERY   // 320: about one tree in this many is mirror-handed
SHIGH.buildFloor(R,q) / floorWeights(Z) / FLOOR_ZONES
SHIGH.canopyH(x,z), COUNTS
```

No fauna (the owner's plan: one fauna kit for every biome, `biomes/README.md`). No catalog fruit yet.

## File layout

```
00-head.html                       page shell
45-host-stage.js      (host)       the showcase: the rim, the scarp, the cloud deck height, ravines, tors (the Whorl
                                   Stone), bogs, the tarn, fields (fog), the root mask, light, BIO.init
50-biome-shigh-species.js          palettes, 10 species (tagged, with their spiral), 14 floor plants, textures, the
                                   spiral geometries (whorl, frill leaf, trumpet, crozier, volute, lobelia, cereus,
                                   albuca, ginger, spear, swirl, bells), items
55-biome-shigh-trees.js            zones; twistTrunk and corkscrew; builders; impostors; PASSES; make/grow; the hands
60-biome-shigh-floor.js            the floor by zone; boulders; fallen wood; rush in the tarn
70-biome-shigh.js                  build / canopyH; BIO.kitEnd
82-host-sky.js        (host)       the cloud sea to the horizon, the Throne in the north, the Wall east and west; the giant
84-host-ground.js     (host)       the ground painted by zone; the tarn and the bog pools; the mist
88-host-build.js      (host)       the mirror request, build order and bake
89z-host-atmos.js     (host)       core/atmos bound (ATMOS.init); the cloud sea as ATMOS.cloudDeck (core/atmos/GODOT.md)
90-host-camera.js     (host)       presets found from the zones and the built trees; the inspector (spiral, hand, fog)
91-host-probe.js      (host)       window._api: budgets and the host checks with their negatives
93-host-polytool.js   (host)       polygon and path tool (from nhighlands)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`; the atmosphere's core, presets, export and cloud deck
(`core/atmos/`) through `CORE_ATMOS`. `window._api.atmos()` is `ATMOS.export()`: the deck's record for a game engine.
