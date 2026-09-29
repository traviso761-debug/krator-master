# Krator biome kits — the contract (southwest bay edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core is the eastern abyss kit's core, unchanged (origin lists, climate fields,
`BIO.grid` boxes / `noMask`). A hyperjungle or eastern abyss fragment runs on it as is.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space. Water is wherever it is < 0.
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, footprints)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  seed:     11,
  origin:   [[x,z],...],        // LOD spine (or one [x,z])
  center:   [x,z],              // the grids' disc
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   0 dry highland .. 1 the jungle floor round the bay
    salt:   (x,z)=>0..1,        //   brackish rim (barely read here)
    upland: (x,z)=>0..1,        //   0 the shore .. 1 the top of the highlands
    flow:   (x,z)=>0..1 },      //   0 still / dry .. 1 a river bank
  eye:      ()=>[x,y,z],        // optional: where the viewer is; the fauna leaves what is far alone
  err, stat });
```

How the biome zones itself from those (55-trees, `SWBAY.zones`):

| zone   | reads                                    | flora                                                                 |
|--------|------------------------------------------|-----------------------------------------------------------------------|
| hyper  | upland<.30, wet>.55, on land             | prism gums and ironbarks (to the temple height), cap-trees, fan-crowns, baobabs at the edge, tree ferns, splay shrubs, bracket trees, coral fungus; ferns, mushroom troops, moss, logs |
| rain   | upland .08..64, wet>.35                  | cap-trees, fan-crowns, ironbarks, baobabs, tree ferns, splay shrubs, bracket trees; ferns, fewer mushrooms |
| sav    | upland>.42                               | baobabs in stands, umbrella monkey puzzles, umbrella thorns, dragon trees, parasol mushrooms; dry grass, fairy rings, puffballs, mounds, lava boulders |
| shore  | terrainH<2.4, upland<.14, wet>.5         | splay shrubs, reeds in the bay's colour, grass, driftwood             |

A `semiarid`-tagged species reads the savannah weight; a `humid` one never does. The
river's banks and the delta are lush because `wet` and `flow` are both high there.

## The two knobs

- `SWBAY_TEMPLE_H` (host, before fragment 50; default 110 m): the canopy ceiling. The
  heights of the five canopy species scale with it; the prism gum's top band IS it.
- `SWBAY_BAY={hue}` (host, before fragment 50; or `SWBAY.setBay(hue)` / `SWBAY.build({bayHue})`):
  the water (host side, `WATER_*`), the shore reeds' accent and the mosses' tinge derive
  from it. The epiphytes stay red and purple whatever the bay (canon).

## What the biome exports

```js
SWBAY.build({R:2400, quality:1, bayHue:.5, fauna:true}) -> {trees, heroes, far, bySpecies, ..., under, fauna, tris}
SWBAY.dress(geometries, opt)     // growth on a structure (the hyperjungle pass, in this palette)
SWBAY.canopyH(x,z)               // approximate canopy top
SWBAY.SPECIES                    // the 13 tree species (tagged), SWBAY.PAL the palettes
SWBAY.zones(x,z)                 // the zone weights a world can reuse for its own placement
SWBAY.FAUNA.species              // the 8 animal kinds (tagged, + diet); SWBAY.FAUNA.herd where the herd started, .pods the swimmers' loops
```

Then `BIO.bake()` once. Draw calls: one per instanced item + one per merged family (~48), four for the fauna, plus the host's far country and plume.

The fauna needs `ticks` and `scene` at build time (it adds its own meshes and updates them every frame); a host without `ticks` gets frozen animals, one without `eye` animates everything whatever the range.

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
A plant is never part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ origin list, fields), stats
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook, wind
40-core-place.js    stands, jittered grids (+ box, noMask), keep-clear, face sampling
50-biome-swbay-species.js   palettes, the temple height, 13 species, textures (bark, cap, gills), geometries (wide frond, mushroom, parasol, rosette), materials, items (data only)
55-biome-swbay-trees.js     zones from the fields; one builder per species; epiphytes; impostors
60-biome-swbay-floor.js     the floor by zone; mushroom troops and fairy rings; logs
65-biome-swbay-dress.js     growth on structures (soffits, ledges, walls), epiphytes on the ledges
70-biome-swbay.js           SWBAY.build / dress / canopyH
75-biome-swbay-fauna.js     flocks, the herd, the glint swarms: animated InstancedMeshes / Points ticked by the biome
45-host-stage.js (ideal type only): renderer, the bay-and-slope terrain, the four fields,
                                    the water plane + river ribbon, the painted ground, BIO.init,
                                    the far country (the volcano, the rim, the outer water, the plume)
80+ host (ideal type only): sky (dome + gas giant), one Girder tower and a ruined jetty (both dressed),
                            one Girder tower, build order, camera + inspector, probe
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields})`,
set `SWBAY_TEMPLE_H` and `SWBAY_BAY`, call `SWBAY.build`, then `BIO.bake()`. Read
KNOWN_ISSUES.md first.
