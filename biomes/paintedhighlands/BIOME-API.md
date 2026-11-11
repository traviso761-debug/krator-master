# Krator biome kits — the contract (painted highlands edition)

The painted highlands kit (`PAINTED`) is built on the shared biome core exactly as `biomes/highrift` is (its stage, ground and host
hand-over were the starting point; `biomes/sedesert/BIOME-API.md` is the full contract: the host object, `waterH`, fields, `register`,
`lod`, `windows`). This file says what is different and what the kit exports. `PLAN.md` is the design; `KNOWN_ISSUES.md` what is owed.

## The region

The painted highlands (`rmvkam8s13kwu`, scale model 5.1): the high plateau west of Korona, 61,060 km², median 3,290 m. A cold steppe
(BSk, Dsb on the higher half) on bare banded rock: `badland` clays and ash beds under `danxia` red sandstones, folded NNW-SSE into
hogbacks, cut by the Painted Canyon. 125-231 mm a year on the plateau; winters under freezing, so the snow melts into a spring bloom.

## The fields it reads

| field | how the kit uses it |
|---|---|
| `bare` | **the kit's own**: the clay exposed (the rounded hills, every slope over ~15 degrees). Almost nothing grows; the beds show |
| `rock`, `slope` | the scarps and the canyon's cliffs: nothing roots; the fallen blocks at their feet (`talus`) |
| `flow` | a wash's or the canyon's floor: the bloom's densest drifts, the rabbitbrush on the banks |
| `flat` | the playa (station 2): the bloom flats, thin grass |
| `rim` | a scarp's or the canyon's lip: the juniper and pinyon |
| `wet` | thickens the grass; the cliff town's wall (Cfa) is the wet one |
| `cold` | read, not used for zoning yet (no station reaches the cushions' 4 km) |

## The kit (`PAINTED`)

```
PAINTED.build({R, quality, bed, talus, keep, grass, accept}) -> {grass, sage, rabbit, flowers, drifts, boulders, byFlower, trees}
PAINTED.buildFloor(R, q, o)     the steppe and the bloom: o.bed(x, y, z) the strata kind at the ground (the drifts' clay), o.talus(x, z) 0..1,
                                o.keep(x, z) 0 = keep bare, o.grass 0..1
PAINTED.buildTrees(R, q, o)     the rims' and ledges' trees: o.accept(x, z) 0..1; o.ecotone adds the wet wall's broadleaves (o.wetAt)
PAINTED.kinRows()               the BIO.kin rows (ebadlands' juniper, pinyon, oak, maple), null without EBADLANDS on the page
PAINTED.circles([[x, z, r, n]]) the stone circles' standing stones
PAINTED.dress(seeps, o)         the hanging gardens round the seeps [{x, y, z, nx, nz}]
PAINTED.SPECIES, byKey, plantOfItem(item), PAL, M, SWAP, TREES, canopyH(x, z)
PAINTED.SITES = PAINTED_SITES   the four stations' site records (40, [G data])
PAINTED.BLOOM = PAINTED_BLOOM   the bloom's calendar and drifts (41, [G data]): at(day, hour), day(stage), FLOWERS, DRIFT, flowerFor(kind, u)
PAINTED.FAUNA = PAINTED_FAUNA   kits/fauna keys and where they live (42, [G data])
PAINTED.HAZ = PAINTED_HAZ       the hazard kinds (KHAZ) the stations register
```

**The bloom's calendar.** `PAINTED_BLOOM.at(day, hour)` reads core/clock's season (`KCLOCK.season`, the phase of the local year) and gives
`{snow, melt, green, flower, seed, straw, dry, stage}`. The page sets `BIO.SEASON` to `dry` (the flower cards drop and the grass turns straw
at full dry: their materials carry `season`), the ground's uniforms to the flower share, the green flush and the snow, and the melt pools'
levels. The day is the sky's (`#day=`, the host clock's days); the bar's season select moves it to a stage's day.

**The drifts echo the stripes.** Each flower is placed by the bed under it: `KSTRATA`'s kind at the ground (`STRATA_DATA.at`) picks from
`PAINTED_BLOOM.DRIFT` (the pink clays the reds, the cream and ash the primrose, the gold the yellows, the grey the blues, the maroon and mauve
the purples, the danxia's sand the oranges). The ground carries the same choice as a far colour (`aBl`) so a slope flushes from afar.

## The species (`PAINTED.SPECIES`, tagged)

| key | name | Earth model | zone |
|---|---|---|---|
| bunchgrass | Stripe bunchgrass | cold-steppe bunchgrass | steppe, bloom, rim |
| sage | Plateau sage | sagebrush | steppe, rim |
| rabbitbrush | Gold rabbitbrush | rabbitbrush (the yellow dye) | the washes' banks |
| skylupin, scarletbeard, embermallow, paintbrush, ravenspike, meltdandelion, snowprimrose, stripedaisy, guanacofoot | the nine flowers of the bloom | lupin, penstemon, globe mallow, paintbrush (the Painted Men's medicine), blazing star, desert dandelion, evening primrose, Namaqualand daisy, pata de guanaco | bloom, steppe |
| (kin) paintedjuniper, paintedpinyon | Painted juniper, Rim pinyon | ebadlands' Utah juniper and pinyon (`BIO.kin`) | rim, ledge |
| (kin) paintedoak, paintedmaple | Wall oak, Seep maple | ebadlands' Gambel oak and bigtooth maple (`BIO.kin`) | the cliff town's wet wall |

Every species tag has climate, aridity, abyssal, riparian, Köppen, zone and harvest. The crops are in `kits/crops`' `paintedhighlands`
entry (juniper, rabbitbrush, `painted-camas`, `paintbrush`, `lignite-black`, `celadonite-teal`).

## The cliff sites (`46-host-cliff.js`)

Each site is a core/tags record with `zone: 'cliff-alcove' | 'cliff-ledge' | 'talus-bench'` (`'pigment-pit' | 'stone-circle'` at the bloom
flats), `culture: 'painted'`, and its own `site` field: `{id, kind, floorY, width, depth, h, aspect, seep:[x, y, z], ladder:{to, from, at},
patch}`. They are painted into a `KMASK` raster the placement reads as bare. The page's `export sites` button and `window._api.sites()` give
them; nothing is placed in them (the settlement plan's).

## File layout

```
40-biome-painted-sites.js   [G data]  the four stations' records: the strata stack, the land's numbers, the sites; the hazard kinds
41-biome-painted-bloom.js   [G data]  the bloom's calendar, the flowers, the drifts
42-biome-painted-fauna.js   [G data]  kits/fauna keys and where they live
45-host-stage.js            (host)    the land per station, the strata stack (STRATA_DATA), the fields, BIO.init
46-host-cliff.js            (host)    the cliff sites, KCARVE's alcoves, the KMASK raster
50-biome-painted-species.js           species, materials, items
60-biome-painted-place.js             the floor (steppe, bloom, blocks) and the stone circles
70-biome-painted.js                   build, the trees (BIO.kin), dress; BIO.kitEnd
84-host-ground.js           (host)    the ground on KGROUND and KSTRATA's shader; the alcoves' hoods
85-host-far.js              (host)    KFAR, KHORIZON
86-host-stacks.js           (host)    the danxia fins (KSTACKS)
88-host-place.js            (host)    STATION_BUILD: the passes in order
89-host-sky.js, 89a-host-atmos.js, 89w-host-water.js, 89z-host-build.js, 99-host-take.js   (host)
stations/<name>/44z-host-site.js      STATION_KEY: bloom, canyon, cliff (build.py --station <name>)
```
