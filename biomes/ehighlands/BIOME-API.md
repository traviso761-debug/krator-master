# Krator biome kits — the contract (eastern highlands edition)

The eastern highlands kit (`EHIGH`) is built on the shared biome core exactly as `biomes/crater-drylands` and
`biomes/ebadlands` are (`sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`,
`lod`, `windows`). This file says what is different and what the kit exports.

## The region

The eastern highlands: the eastern Inner Wall (`e inner wall` on the scale model), three stations (`PLAN-STATIONS.md`): the dry side's cold
cushion plateau near 5 km (station 1, ~0.86 atm on 5.1; the kit was written for ~0.6), the wet face's cloud forest at its foot (station 2,
1.0-2.0 km, ~1.36 atm, Cfa), the Lesser Throne's caldera (station 3, 6.07-6.88 km, ~0.7 atm, EF). `EHIGH.KOPPEN` is the polygon's classes
on 5.1 (surveyed 2026-11-09, rough shares). Species 0-6 are the plateau's, 7 and 8 (the combed laurel, the giant's tree fern) the wet
face's: appended, so readers' indices hold.

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
| `forest` | a cloud forest (station 2) | the `cloud` zone: laurels, tree ferns, ferns, moss, bromeliads; it takes the ground from every other zone |
| `barren` | ground nothing roots in (station 3's cold ash) | multiplies every zone to 0 (`live`) |

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
45-host-stage.js       (host)       the shell every station shares: renderer, light, the error panel, ticks, the registry
46-host-land.js        (host)       station 1's land (STAGE: site, air, sky, what the checks expect; the Mother, the range, the gullies, the bog,
                                    the tarn, the tors; fields' definitions; the LOD spine). stations/<name>/46-host-land.js replaces it
47-host-fields.js      (host)       the fields cached on a grid (FNAMES + STAGE.fields) and BIO.init
50-biome-ehigh-species.js           palettes, 9 species (tagged; 7 and 8 the wet face's), the giant, textures, geometries (lopsided domes, the glass tower, the comb), materials (the glass's backlight), items
55-biome-ehigh-trees.js             zones; builders (each turns its plant to the giant); the Mother Cushion; impostors; PASSES; make/grow
60-biome-ehigh-floor.js             the floor by zone; the bog's quilt; the tors' boulders; wormwick round the towers; tower honey on the cliffs
70-biome-ehigh.js                   build / canopyH; BIO.kitEnd
84-host-ground.js      (host)       the ground painted by the fields (the stations' forest, ash, lava too), its library layers on KGROUND; the frozen tarn
85-host-far.js         (host)       KFAR past the map (STAGE.farH) and the KHORIZON bake
86-host-geysers.js     (host)       the vents (VENTS): cones and steam; station 3's fumaroles (station 1's geyser field is gone, 2026-11-09)
89-host-sky.js         (host)       the shared sky at the station's site (STAGE.site, STAGE.sky)
89a-host-atmos.js      (host)       core/atmos bound; the weather; height fog, a station's cloud bank, the rain cover
89w-host-water.js      (host)       the water on core/water: the tarn, the pools, the stream (or a land's LAND_FLOWS, with their falls)
89z-host-build.js      (host)       build order and bake (after the water); impostors, the horizon on the flora, KSHADOW (?shadow=1)
95v-host-viewkit.js    (host)       the views' helpers
96-host-views.js       (host)       station 1's preset views and the negatives' points (NEG); each station has its own
99-host-take.js        (host)       the page handed to core/host (KHOST.take): the inspector's words, budgets and checks (what STAGE.expect names);
                                    the camera, loop, panel, probe and polygon/path tool are core/host's (core/host/README.md)
```
The core (`core/biome/`) is read through `CORE_BIOME` in `build.py`. The material library comes in through `materials.json` and
`tex/` (`tools/textures/pack.py biomes/ehighlands`), as KMAT.pack('ehigh'); without the pack (`?mat=proc`, or an open world)
every surface is procedural.
