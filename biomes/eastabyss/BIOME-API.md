# Krator biome kits — the contract (eastern abyss edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core here is the hyperjungle kit's core plus three additive, backward-compatible
things this biome needed (a hyperjungle fragment runs unchanged on it):

- `origin` may be a LIST of `[x,z]` points — the LOD curve is measured from the nearest
  one, so a long showcase keeps detail along a spine. `center` is the disc the grids
  cover (default: the first origin).
- `fields`: optional climate fields, each `(x,z)->0..1`, read with `BIO.field(name,x,z)`.
  Missing ones fall back to `BIO.fieldDefault`.
- `BIO.grid(..., {box:[x0,z0,x1,z1], noMask:true})`: a rectangular window (cells outside
  cost nothing) and a way to grow ON water (lily pads) past the host mask.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space. Water is wherever it is < 0.
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, footprints)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  seed:     7,
  origin:   [[x,z],...],        // LOD spine (or one [x,z])
  center:   [0,0],              // the grids' disc
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   0 arid crust .. 1 saturated marsh / rainforest floor
    salt:   (x,z)=>0..1,        //   salt crust
    upland: (x,z)=>0..1,        //   0 basin floor .. 1 the top of the slope (savannah)
    flow:   (x,z)=>0..1 },      //   0 still water / dry .. 1 a river bank
  err, stat });
```

How the biome zones itself from those four (55-trees, `EASTABYSS.zones`):

| zone     | reads                                   | flora                                                      |
|----------|-----------------------------------------|------------------------------------------------------------|
| flat     | wet<.28, salt>.3, upland<.15            | samphire, salt grass, rosettes + jade shrubs + Calamophyton palms where flow>0 |
| marsh    | upland<.22, wet>.5, low salt            | knee-trees with beard moss, seal-trees, palmettos, reeds, cordgrass meadows, sedge, marsh shrub, samphire; beard oaks on the hummocks |
| shore    | terrainH<1.6, wet>.6, basin             | stilt-woods, tide lycopsids and water palms (in the shallows), strap cordaites on prop roots, Sanfordacaulis, reeds, samphire |
| water    | terrainH<0, flow small                  | lily pads, leaf rafts + water hyacinth, emergent reeds; mat-reed beds on the still margins |
| jungle   | upland .05..86, wet>.45                 | scale-trees, bell-bark, seal-trees, cordaites, tree ferns, seed ferns, cycads, pipe reeds, the club-moss carpet; rope araucarias toward the top |
| savannah | upland>.62                              | umbrella trees (thinning up), rope araucarias, Vain fronds, dry grass, rosettes |

An `arid`-tagged species only reads the flat weight; a `humid` one never does. Deltas and
river banks are lush because `wet` and `flow` are both high there.

## The lake colour

The host sets `var EASTABYSS_LAKE={hue:0.0}` before fragment 50 loads (or calls
`EASTABYSS.setLake(hue)` / `EASTABYSS.build({lakeHue})`). Everything with a splash of colour
derives from that one hue: the water (host side, `WATER_*`), the salt crust's tinge, the
samphire and the red reed stands (`PAL.accent`), the lily pads and the blooms (its
complement, `PAL.comp`), the mosses (`PAL.moss`, greens pulled a fifth of the way toward
the lake). The Vain fronds stay purple (canon).

## What the biome exports

```js
EASTABYSS.build({R:3250, quality:1, lakeHue:0}) -> {trees, heroes, far, bySpecies, ..., beds, stems, farBeds, under, tris}
EASTABYSS.dress(geometries, opt)     // growth on a structure (the hyperjungle pass, in this palette)
EASTABYSS.canopyH(x,z)               // approximate canopy top
EASTABYSS.SPECIES                    // the 21 species (tagged; the mat reed carries `use` and `bed`), EASTABYSS.PAL the palettes
EASTABYSS.REEDBEDS                   // after build: the mat-reed beds [{x,z,r,n,depth,h}] -- a resource a world can harvest
                                     // (within 1.9 km of the LOD spine; past it a bed is a far hull, counted in farBeds, not listed)
EASTABYSS.hummock(x,z)               // the marsh's drier hummocks (beard oaks), a noise field
EASTABYSS.zones(x,z)                 // the zone weights a world can reuse for its own placement
```

Then `BIO.bake()` once. Draw calls: one per instanced item + one per merged family (~55).

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
50-biome-eastabyss-species.js   lake-hue palettes, 21 species, the iridescent bark, textures, materials, items (data only)
55-biome-eastabyss-trees.js     zones from the fields; one builder per tree species; the reed-bed pass; impostors
60-biome-eastabyss-floor.js     the floor by zone; lily pads on still water; fallen scale-trees
65-biome-eastabyss-dress.js     growth on structures (soffits, ledges, walls)
70-biome-eastabyss.js           EASTABYSS.build / dress / canopyH
45-host-stage.js (ideal type only): renderer, the zoned basin terrain, the four fields,
                                    the water plane + river ribbon, the painted crust, BIO.init
80+ host (ideal type only): sky with the abyssal shelf (painted twice: dome + overlay in front of the giant),
                            one Girder tower, build order, camera + inspector, probe
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields})`,
set `EASTABYSS_LAKE`, call `EASTABYSS.build`, then `BIO.bake()`. Read KNOWN_ISSUES.md first.

## One tree alone (open worlds)

`EASTABYSS.PASSES`: the tree passes as data, in buildTrees' order; EASTABYSS.make(sp,x,y,z) / grow(T,lv): one tree alone (an open world's variants). Additive: `build()` never calls them, and the kit builds exactly what it built before (checked by `verify.py --baseline`). `openworld/little-demo/src/84-world-nursery.js` is the user.
