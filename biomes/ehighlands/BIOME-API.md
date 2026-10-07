# Krator biome kits — the contract (eastern highlands edition)

The eastern highlands kit (`EHIGH`) is built on the shared biome core exactly as `biomes/crater-drylands` and
`biomes/ebadlands` are (`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`,
`lod`, `windows`). This file says what is different and what the kit exports.

## The region

The eastern highlands: a cold high plateau at about 0.6 atm. Koppen BSk and ET, EF at the crests (`EHIGH.KOPPEN`; an
ESTIMATE, the scale model's rasters were not read: `KNOWN_ISSUES.md`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `rock`, `slope` | bare rock, gradient | the tors, the scree; `cliff` (steep rock) zeroes every zone |
| `cold` | mean temperature | puna below ~.45, the cold meadow (fell) above, snow past ~.9 |
| `wet`, `flow` | rain, channels | sedge turf where wetter; the stream's banks |
| `sun` | how squarely a slope faces the sun | the dry slope (vigil spikes, thorn cushions, cereus) |
| `bog` | the bofedal | the cushion quilt |
| `mother` | the Mother Cushion's thickness, 0..1 | the kit drapes the Mother's skin over it (read at full resolution) |
| `geo` | the sinter of a geyser field | bare; mat algae |
| `gully` | a quebrada's floor and walls | the ragbark woods |
| `tarn` | a lake | nothing roots |

A world without `mother` gets no Mother Cushion; one without `sun`, `bog`, `geo` or `gully` loses those zones (they
read 0) and the plants fall back to the puna, the fell and the scree.

## The windows it asks for

`water` (the bog's pools and the tarn: the floor's quilt keeps clear of them) and `mother` (the rectangle the Mother's
skin is built over, 2 m a cell; 3 m at quality under .75).

## The giant

```js
EHIGH.setGiant(azDeg)    // default 66 (LORE.md); EHIGH.build({giantAz}) does the same
EHIGH.GIANT              // [x,z] unit vector toward the giant on the ground
EHIGH.GIANT_YAW          // the yaw that turns a geometry's +x toward it
EHIGH.toward(a,jit)      // a unit direction a radians off up, toward the giant
```

## What the kit exports

```js
EHIGH.build({R:2450, quality:1, giantAz:66}) -> {trees, heroes, far, bySpecies, cushions, woolbacks, thorns, towers, spikes, under, tris:{trunk, limbs, far, mother}}
EHIGH.SPECIES / byKey / PAL / TAGS / KOPPEN / HARVEST / PLANTS / plantOfItem(item)
EHIGH.zones(x,z) / PASSES / make(sp,x,y,z) / grow(T,lv) / nearestTree(sp,x,z,minH,{stage,minR})
EHIGH.FLOWERING           // [{x,z,r}]: the stands of vigil spikes the host says flower this year
EHIGH.vigilStage(x,z)     // 'rosette' | 'young' | 'flower' | 'torch'
EHIGH.buildMother(q)      // the Mother Cushion's skin (called by build)
EHIGH.buildFloor(R,q) / floorWeights(Z) / FLOOR_ZONES
EHIGH.WICKS, EHIGH.COMBS  // where the floor put wormwick and tower honey
EHIGH.canopyH(x,z), COUNTS
```

## The species (`EHIGH.SPECIES`, tagged)

| # | key | name | H (m) | form | Koppen |
|---|---|---|---|---|---|
| 0 | cushion | Poured cushion | .5-2.6 (up to 13 m across) | cushion | BSk ET |
| 1 | woolback | Woolback (alien) | .5-1.5 | cushion | ET EF |
| 2 | thorn | Thorn cushion | .4-1.1 | cushion | BSk |
| 3 | vigil | Vigil spike (alien) | spike 8-17 | rosette | BSk ET |
| 4 | ragbark | Ragbark | 4-10.5 | tree | BSk ET |
| 5 | glasstower | Glass tower (alien) | 1.6-3.8 | rosette | ET EF |
| 6 | cereus | Hoar cereus | 1.4-4.2 | column | BSk |

`tags.form` takes the place of the drylands' `fire`. No catalog fruit yet (`KNOWN_ISSUES.md`).

## File layout

```
00-head.html                        page shell
45-host-stage.js       (host)       the showcase: terrain (the Mother, the range, the gullies, the bog, the tarn, the tors, the sinter shield), fields, thin-air light, BIO.init
50-biome-ehigh-species.js           palettes, 7 species (tagged), the giant, textures, geometries (lopsided domes, the glass tower, the comb), materials (the glass's backlight), items
55-biome-ehigh-trees.js             zones; builders (each turns its plant to the giant); the Mother Cushion; impostors; PASSES; make/grow
60-biome-ehigh-floor.js             the floor by zone; the bog's quilt; the tors' boulders; wormwick round the towers; tower honey on the cliffs
70-biome-ehigh.js                   build / canopyH; BIO.kitEnd
82-host-sky.js         (host)       the thin-air dome: deep blue, the volcanoes on the horizon; the gas giant
84-host-ground.js      (host)       the ground painted by the fields, the turf's polygons in the shader; the bog's pools, the stream, the frozen tarn
86-host-geysers.js     (host)       the vents' cones and their steam (one Points mesh); the Old Kettle's eruptions
88-host-build.js       (host)       build order and bake
90-host-camera.js      (host)       presets found from the built plants; the inspector (tags, the plant's bearing)
91-host-probe.js       (host)       window._api: budgets and the host checks with their negatives
93-host-polytool.js    (host)       polygon and path tool (from nhighlands)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`. The material library comes in through `materials.json` and
`tex/` (`tools/textures/pack.py biomes/ehighlands`), as KMAT.pack('ehigh'); without the pack (`?mat=proc`, or an open world)
every surface is procedural.
