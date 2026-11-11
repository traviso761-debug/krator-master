# Krator biome kits — the contract (W outer wall edition)

One biome = one set of fragments (`46`, `70-biome-wow-*.js`, and from W3 the kit's own species) on the shared, engine-independent core
(`core/biome`), the way every Krator biome kit is written. Nothing in a kit fragment names a world's engine: `build.py` greps the kit's
fragments (`-wow-`) and the ones it reads in place (`-nwow-`) for the forbidden names. The kit's object is **`WOW`**.

## What the host provides

```js
BIO.init({tags:'wouterwall', THREE, scene, terrainH, field (a KFIELD: the baked near ground), waterH, mask, obstacles, ticks,
  seed, origin:[[x,z],...] (the LOD spine), center, eye, fields:{...}, register, err, lod:{hero, mid, far, floor:[near, far]}});
WOW.lay({fields:(x,z)=>F, R, seed});      // the kit's fields at a point, one record (47-host-land.js: fieldsAt)
WOW.AMP = {warm, cold};                   // optional: the station's annual swing (default +13 / -13 round the mean)
WOW.zoneAt = (x,z)=>zone;                 // optional: a fast zone (the host's raster of 46's zones on its ground grid)
// the NW outer wall's flora, read in place (W1): its passes ask NWOW, so the host binds it to the same fields
NWOW.AMP = WOW.AMP; NWOW.lay({fields, R, seed}); NWOW.zoneAt = (x,z)=>WOW.nwZone(WOW.zoneAt(x,z)); NWOW.larchK = 1.15;
```

**The fields record F** (what 46 reads): `y` (the ground), `g` (grade), `slope` (0..1), `sunny` (-1 a south-facing, shaded slope .. 1 a
north-facing, sunny one: Krator stands near 40 S), `mean` (the annual mean, °C, with the aspect's 1.5 °C), `perma` (0..1), `water`,
`streamD` (metres to the brook), `cave` (inside a cave house's recess), `floor` (a gully floor), `pillar`, `terrace` (a terraced field), `terrW` (0..1), `yuan` (0..1: the
tableland's flat top), `gully` (0..1: a side gully), `cut` (metres under the yuan), `loess` (its depth, m), `spring` (0..1: the spring
line, `WOW.springAt`), `tp` (the terraces' furrow phase: the ground under them over a step), `rubble` (0..1: a sturzstrom's deposit, 1 on a
fresh lobe, about .5 on an old one or a slump's toe and front), `runout` ('fresh' | 'old' | null), `thru` (a cut gone down through the loess
into the rock: the host sets it only where its ground draws the rock), `shore` (0..1: a trench lake's gravel beach). For the NW outer wall's
passes: `field` (no tree there), `aufeis`, `pocket` (false), `rock`.

The core's own fields are bound too (`BIO.field`): `wet`, `flow`, `cold`, `rock`, `upland`, `slope`, and this kit's `sunny`, `mean`,
`loess`, `cut`, `spring`: any other kit on the page can read them.

## The bench (46: `WOW.bench(h)`, at an absolute height h in metres)

| band | heights | what |
|---|---|---|
| `loess` (m) | 180 at 3.0-3.8 km, thinning to 0 by 4.7 km | the dust the wall sheds, blown down by the night's katabatic wind |
| `slump` (0..1) | 3.8-5.6 km | the rim collapsing inward: back-tilted blocks, uphill-facing scarps, trench lakes |
| `runout` (0..1) | 5.2-7.0 km | long-runout rock avalanches from the crest |
| `crest` (0..1) | 7 km and up | the airless crest (godthrone's ground) |

## The zones (46: `WOW.zoneOf(F)`)

| zone | where | flora (W1: the NW outer wall's, as `nw`) |
|---|---|---|
| `water` | the brook | none |
| `floor` | a gully floor | `floor`: woolly willow, grass, stones |
| `cave` | a cave house's room (a `KCARVE` alcove's recess) | none |
| `pillar` | an earth pillar's foot | none |
| `wall` | loess over ~45 degrees (it stands sheer) | none: bare buff loess |
| `scarp` | the same where no loess lies or a cut is through it (the patchwork rock) | none: bare rock (the NW outer wall's `rock` roots its stone pine's mats) |
| `runout` | a fresh sturzstrom's deposit (`F.rubble` over .8) | none: bare angular rubble |
| `hummock` | an old lobe's softened deposit, a slump's toe and broken front (`F.rubble` .3-.8) | `fellfield`; the puya |
| `shore` | a trench lake's beach | `floor` |
| `terrace` | a tread of `KRELIEF.terraces` | `field`: no tree, a little grass (the crops are section 6's) |
| `fellfield`, `tundra` | the warmest month under +2.5 / +7.5 °C | as the NW outer wall's |
| `gully` | a side gully's slopes | `gully`: silverthorn |
| `larch` | a shaded (south-facing) slope | `larch`: fur larch, stone pine, caribou moss |
| `yuan` | the tableland's flat top | `steppe`: plumegrass, steppe grass, furflowers, voles' caches; the dust towers |
| `steppe` | a sunny (north-facing) slope | `steppe`; the puya on the dry bench (a mean of -4.5 to +4.5 °C) |

## What the kit gives

```js
WOW.build({R, quality}) -> {R, quality, nw: NWOW.build's stats, natives: {puya, bloom, at:[[x,z],...] (the first blooms)}}
WOW.canopyH(x, z), WOW.climate(mean), WOW.bench(h), WOW.springAt(F), WOW.zoneOf(F), WOW.at(x, z), WOW.ZONES, WOW.nwZone(zone)
WOW.SPECIES, WOW.byKeyS, WOW.PLANTS, WOW.plantOfItem(item)   // the two natives (50): the puya spike, the dust tower
WOW.PUYA                                   // where the puya grows (46): the mean's band, the zones, the cell, a cell's chance, the bloomers' share
WOW.buildNatives(R, q)                     // the puya placed (60); WOW.build calls it after the NW outer wall's passes
WOW.CROP_IDS, WOW.CROP_LOOK                // the terraces' crops (kits/crops' wouterwall records) and each one's look this season (50)
WOW.buildCrops({fields(fn)})               // the host walks its fields' points, fn(x, y, z, cropId); a card each (60). 88c: station 1's terraces
WOW.DUST, WOW.dustTowers(o, spec)          // the dust towers as core/terrain KSTACKS mounds by cell (46, [G data]): o {world, box, ground,
                                           // accept(x, z), avoid(x, z, r)} -> records keyed plant.dusttower, drawn by the host on organic.dusttower
```

The kit's registry is `wouterwall` (`BIO.kit`, 50; `BIO.kitEnd(WOW)`, 70): its items are `puya` and `puyaspike` (card.puya's cells,
`materials.json`).

## What the host reads beside the kit (the stations, `44s-host-site.js`)

A station's site gives the host its records and hooks; each is optional unless named:
`SITE` (`name`, `title`, `R`, `step`, `seed`, `loess`, `slots` [two of loess, terr, rock, rubble: the ground's station layers], `lake`
(the model's water fitted: `near`, `ring`, `depth`, `lift`, `shore`, `beach`), `need` (the checks: `zones`, `keys`, `larch`, `trees`,
`spring`), `views(V)`, `spine()`, `checks()`, `negatives()`), `siteBuild(ground)`, `sitePoint(x, z)` (required: `y`, `rel`, `cut`, `part`, `rec`,
`order`, `terrace`, `g2`, `top`; optional `rubble`, `runout`), `siteRelief`, `siteFloor`, `siteGully`, `siteYuan`, `siteSwell`,
`SITE_STREAM`, `SITE_SPRING`, `SITE_TRUNK_AT`, `siteStacks(ctx)` (KSTACKS records with `name`, `key`, `tex`), `sitePools()` (ellipses of
still water), `siteFalls()` (core/water fall records).

## The lowlands' species (88k, the host)

Read in place by key (`BIO.kitBuilder`, `BIO.kin`; `build.py` LOWLANDS, a station's `station.json` "lowlands"): station 1 takes
nwlowlands' crag pine, needle cypress and candle birch, station 4 swlowlands' tier cedar (as a kin: shorter, a tighter crown) and ember
manzanita; stations 2 and 3 none.
