# Krator biome kits — the contract (NW outer wall edition)

One biome = one set of fragments (`46`, `50..70-biome-nwow-*.js`) on the shared, engine-independent core (`core/biome`), the way
every Krator biome kit is written. Nothing in a kit fragment names a world's engine: `build.py` greps the kit's fragments
(`-nwow-`) for the forbidden names. The kit's object is **`NWOW`**.

## What the host provides

```js
BIO.init({tags:'nwouterwall', THREE, scene, terrainH, field (a KFIELD: the baked near ground), waterH, mask, obstacles, ticks,
  seed, origin:[[x,z],...] (the LOD spine), center, eye, fields:{...}, register, err, lod:{hero, mid, far, floor:[near, far]}});
NWOW.lay({fields:(x,z)=>F, R, seed});     // the kit's fields at a point, one record (47-host-land.js: fieldsAt)
NWOW.AMP = {warm, cold};                  // optional: the station's annual swing (default +11 / -13.5 round the mean)
NWOW.zoneAt = (x,z)=>zone;                // optional: a fast zone (the host's raster of 46's zones on its ground grid)
NWOW.larchK = 1;                          // optional: the station's larch density (the forest-steppe's walls 1, the taiga .24)
NWOW.clearings = [{x, z, r}];             // optional: discs no tree stands in (a town: station 3's capital)
```

**The fields record F** (what 46 and the passes read): `y` (the ground), `g` (grade), `slope` (0..1), `sunny` (-1 a south-facing,
shaded slope .. 1 a north-facing, sunny one: Krator stands at 28-40 S), `mean` (the annual mean, °C, with the aspect's 1.5 °C),
`perma` (0..1), `water`, `streamD` (metres to the stream), `floor`, `aufeis`, `alas`, `lake`, `meadow`, `pingo`, `poly`, `lobe`,
`front`, `rockG` (the landforms: `core/terrain/42-core-frost.js`), `gully`, `burn`, `burnK`, `field`, `pocket`, `rock`.

The core's own fields are bound too (`BIO.field`): `wet`, `flow`, `cold`, `rock`, `upland`, `slope`, and this kit's `sunny`,
`mean`, `perma`: any other kit on the page can read them.

## The zones (46: `NWOW.zoneOf(F)`)

| zone | where | flora |
|---|---|---|
| `steppe` | sunny slopes and dry flats, the warmest month over +10.5 °C | plumegrass, steppe grass, furflowers, voles' caches |
| `larch` | shaded slopes (the forest-steppe's split), and the flats and every slope once the warmest month is under +10.5; the frozen ground | fur larch (beards on the shaded ones), stone pine, caribou moss, a little heath and birch |
| `gully` | the runnels down the walls | silverthorn, grass |
| `floor` | the valley floor's gravel | woolly willow, cottongrass by the water, stones |
| `aufeis` | KFROST's ice sheets over the floor | nothing (the ice) |
| `burn` | a fire scar on the larch's edge | Ivan-chai (fireweed), grass, a few standing larch |
| `alas` | a thaw hollow's floor | cottongrass, cloudberry, bog moss (the ground) |
| `tundra` | the warmest month under +7.5 °C (above the tree line) | snow birch, crowberry and heath, caribou moss, creeping stone pine |
| `fellfield` | the warmest month under +2.5 °C | moss cushions, woolly snowballs, felt stars, stones |
| `rock` | steep crags and the tors | goldroot (in the tors' cracks), cushions, stones |
| `field`, `pocket` | the host's sweetroot beds and snow-potato pockets | the Three Gifts |
| `water` | the stream, the lakes | nothing |

Each zone's crops-kit zone is `NWOW.ZONES[zone].crop` (`kits/crops` `CROPS.BIOMES.nwouterwall`: steppe, larchwood, alas, tundra,
fellfield).

## Pycrete's rule (PLAN.md section 5)

```js
NWOW.climate(mean) -> {mean, warm, cold, perma, pyc}   // pyc: 'permanent' (mean <= -2 °C) | 'seasonal' (coldest month <= -8 °C) | 'none'
NWOW.pyc(x, z)                                          // at a point on the page
```

The culture kit (`kits/yeti/PLAN.md` section 1) reads it to choose a shell: pycrete where permanent, seasonal pycrete for the
winter forts, larch, stone and sod where it is neither.

## What the biome exports

```js
NWOW.build({R, quality, beds, pockets, tors}) -> {trees, heroes, far, bySpecies, clumps, fruit, beards, tris, floor:{plants, byKind, sweet, potato, gold, ...}}
NWOW.SPECIES      // the four tree-scale species (fur larch, stone pine, creeping stone pine, silverthorn), tagged, with harvest
NWOW.PLANTS       // the small plants and the crops, tagged (harvest; crop: the kits/crops id)
NWOW.TREES        // every tree: {x, z, y0, sp, H, rb, crownR, seed, lv, lean, beard}
NWOW.BEDS, NWOW.POCKETS   // the fields' rows (their year of 3-7, dug or not) and the pockets (their stone walls)
NWOW.frost        // the station's KFROST: .alases, .pingos, .aufeis, .rockGlaciers, .records(), .sample(x,z)
NWOW.canopyH(x,z), NWOW.place(cell, salt, accept, fn, {R, lodMax, boxes})
```

Then `BIO.bake()` once. `quality` scales every count. Every placement is reseeded per cell from `KRAND.hash(kit seed, pass, cell)`.

**The beds, pockets and tors** are the host's places: `beds {c:[x,z], len, wid, ang}` (rows 1.7 m apart, each a year of its 3-7, the
oldest dug in autumn), `pockets {c, rad, n}` (stone-walled rings), `tors` (core/terrain `KSTACKS` bodies: goldroot grows on their
beds' top edges).

## The season

The host's `SEASON` ('autumn' | 'spring' | 'summer'; `?season=`) is read at the kit's definition (`NWOW.season`): the larch's
needles (gold, or green; fewer in spring), the furflower (in bloom in spring, seed heads after), Ivan-chai (in flower, or gone to
fluff in autumn), the willow's catkins and the cushions' flowers (not in autumn), the steppe's and the birch's colours, the
dug rows. A world that takes the kit without a season gets autumn.

## Tags (project rule)

Every species and plant record carries `tags:{climate:'cold'|'polar', aridity, abyssal:false, riparian, koppen:[...], zone,
harvest:{wood, edible, medicinal, notes, fruit, crop}}`. A plant is never part of a building.

## File layout

```
46-biome-nwow-layout.js   NWOW, the climate (pycrete's rule), the bands, the zones   [G data]
50-biome-nwow-species.js  palettes, species, harvest, plants, the procedural fallbacks, materials (library slots), items
55-biome-nwow-trees.js    the placement grid (by cell), keep-clear, the four builders, impostors, the passes
60-biome-nwow-floor.js    the ground plants by zone, the sweetroot beds, the snow-potato pockets, goldroot, the voles' caches
70-biome-nwow.js          NWOW.build / canopyH / pyc
```

To port: list core/biome, core/rand, core/space, core/tags and `core/terrain/42-core-frost.js`, bind the fields, call `NWOW.lay`,
`NWOW.build`, then `BIO.bake()`. Read KNOWN_ISSUES.md first.
