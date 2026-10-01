# Krator biome kits — the contract (Rift edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core here is the eastern abyss kit's core (itself the hyperjungle's plus the origin
list, the climate fields and the boxed / unmasked grid) plus one additive thing this
biome needed (an eastern-abyss or hyperjungle fragment runs unchanged on it):

- `BIO.fieldDefault` now also carries `flow` and `mist` (both 0), so a biome may read
  `BIO.field('mist',x,z)` on a host that never heard of a cloud forest.
- `BIO.iridBarkMat(tex,key,colA,colB)` takes the two colours of the shift (the eastern
  abyss's red-green is the default), so several species can shimmer differently.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space. Water is wherever it is < 0.
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, cliffs, footprints)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  seed:     11,
  origin:   [[x,z],...],        // LOD spine (or one [x,z])
  center:   [0,0],              // the grids' disc
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   0 arid .. 1 saturated (the jungle side .9, the savannah side .3)
    salt:   (x,z)=>0..1,        //   the algal crust round the lake
    upland: (x,z)=>0..1,        //   0 valley floor .. 1 the ridge's crest
    flow:   (x,z)=>0..1,        //   0 still / dry .. 1 a stream bank (or a dry wash, at .6)
    mist:   (x,z)=>0..1 },      //   the cloud-forest band on the ridge's wet face
  err, stat });
```

How the biome zones itself from those five (55-trees, `RIFT.zones`):

| zone   | reads                                    | flora                                                                          |
|--------|------------------------------------------|--------------------------------------------------------------------------------|
| jung   | upland<.26, wet>.45, low salt            | frill trees, carrot frills, parasol trees, violet domes, bell palms + lobe trees in stands, pagoda trees, trumpet trees, anemone stalks, crotons, curls, prism bushes; the iridescent floor |
| sav    | upland<.26, wet<.5                       | baobabs, monkey-puzzles, acacias, dragon trees, tree aloes, crotons, purple fan shrubs, pinecone succulents, candle stalks; dry grass, Vain fronds, heath, termite spires |
| slope  | upland .1..∞, wet<.5, mist<.5            | the dry ridge (north pediment, the crest's flanks): monkey-puzzles, dragon trees, aloes, cycads |
| cloud  | upland>.12, mist>.35                     | cloud frills, cloud bell palms, cloud lobe trees, cloud parasols, beard trees, cloud tree-ferns, lantern trees, pagoda trees, trumpet trees, groundsels; ferns, moss and light-green rosettes |
| peak   | upland>.6, mist<.55                      | stone pines, fan trees, barrel frills, silver scrub, peak pines, dragon trees, aloes, cycads; the garrigue floor |
| shore  | terrainH<2, salt>.25                     | glasswort, algal mats, stromatolite domes, salt grass, reeds; scum mats on the water |

A species tagged `arid` only reads slope / peak / sav; a `humid` one never does. Stream
banks are lusher because `wet` and `flow` are both high there. The `mask` here also goes
to zero on cliffs (slope > 1.6), which is what keeps the mesa faces bare.

## The lake colour

The host sets `var RIFT_LAKE={hue:0.15}` before fragment 50 loads (or calls
`RIFT.setLake(hue)` / `RIFT.build({lakeHue})`). Everything with a splash of colour derives
from that one hue: the water (host side, `WATER_*`), the algal crust and the glasswort
(`PAL.accent`), the scum mats (`PAL.scum`), the blooms (its complement, `PAL.comp`), the
mosses' tinge, and the five iridescence pairs (`PAL.irid.GP/GB/YG/RP/OR`: the second colour
of every shimmering leaf is measured off the lake's hue, so a yellow lake gives the
green-purple valley and a red one would give green-cyan). The Vain fronds stay purple
(canon).

## Iridescence

The core's foliage hook already knew `irid:true` (the hyperjungle's prism gum): a second
per-instance colour `aC2` shown away from the sun and at grazing view angles, shimmering
slowly with the wind. This kit is the first to use it as the rule: `frill`, `pleat`,
`lobeleaf`, `spray`, `rope`, `curl`, `irosette` and `clubmoss` all carry `aC2`, and every
builder passes a second colour from the species' `irid` set (or none, for the terrestrial
species). Two boles shimmer too (`BIO.iridBarkMat`): the frill tree's column teal to
violet, the bell palm's trunk only a little. `curl` and `irosette` also carry `aN`, a
per-instance normal that steers only their iridescence (`RIFT.iridOnlyN` keeps the lighting
on the geometry). The impostors keep it: the 'far' bucket's material (`RIFT.farMat`) reads a
second colour packed into each vertex's uv (see NOTES, the far canopy).

## What the biome exports

```js
RIFT.build({R:3050, quality:1, lakeHue:.15}) -> {trees, heroes, far, standins, bySpecies, ..., under, tris}
RIFT.dress(geometries, opt)     // growth on a structure (the hyperjungle pass, in this palette)
RIFT.canopyH(x,z)               // approximate canopy top
RIFT.SPECIES                    // the 34 tree species (tagged), RIFT.PAL the palettes
RIFT.zones(x,z)                 // the zone weights a world can reuse for its own placement
RIFT.LOD                        // the runtime ranges: {tree:1200, floor:650, midFloor:1300, farFloor:3000, logs:1200, dress:1200}
```

How the biome uses the runtime LOD (the core's `BIO.range`): every hero tree is drawn in full
within `RIFT.LOD.tree` of its chunk and as a cheap stand-in impostor past it (a small species as a
20-triangle blob, or nothing); trees built as impostors from the start (far from the spine) are
always in range; the floor's bands show within their ranges, and a coarse far band stands in for
the near and mid bands past theirs.

Then `BIO.bake()` once, and `BIO.lodTick(camera)` every frame (after `camera.updateMatrixWorld()`).
Draw calls: one per instanced item or merged family per 1.2 km chunk in range (340-580 at the presets).

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
A plant is never part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ origin list, fields), stats
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook (+ iridescence), wind
40-core-place.js    stands, jittered grids (+ box, noMask), keep-clear, face sampling
50-biome-rift-species.js   lake-hue palettes + iridescence pairs, 34 species, textures, the brain and curl geometries, materials, items (data only)
55-biome-rift-trees.js     zones from the fields; one builder per species; impostors
60-biome-rift-floor.js     the floor by zone; scum mats on still water; fallen frill trees
65-biome-rift-dress.js     growth on structures (soffits, ledges, walls)
70-biome-rift.js           RIFT.build / dress / canopyH
45-host-stage.js (ideal type only): renderer, the Rift terrain (lake trough, benched ridge with mesas, savannah), the five fields,
                                    the water plane, the painted floor, BIO.init
80+ host (ideal type only): sky with the Rift's two walls and the far lakes (painted twice: dome + overlay in front of the giant),
                            one Girder tower in the jungle, build order, camera + inspector, probe
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields})`,
set `RIFT_LAKE`, call `RIFT.build`, then `BIO.bake()`, and call `BIO.lodTick(camera)` in the frame
loop. Read KNOWN_ISSUES.md first.
