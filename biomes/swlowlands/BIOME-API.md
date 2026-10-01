# Krator biome kits — the contract (southwestern lowlands edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails the
build if one appears. The flora of a biome must move between worlds without a
re-implementation.

The core here is the eastern abyss kit's core, **byte for byte**. The lowlands add
nothing to it. They extend it from the biome side:

- `BIO.fieldDefault` gains `tropic`, `dry` and `flow` defaults (all 0) if a world binds
  none. This is additive: the core's own defaults are untouched, and an eastabyss or
  hyperjungle fragment runs unchanged beside this one.
- A TWO-TONE BARK material (`SWLOW.barkMat2`) lives in 50-species, not in the core. It is a
  Lambert material whose canvas carries relief in R and a mask in G. It is described
  below because a world porting the biome gets it for free.

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
  center:   [0,0],              // the grids' disc
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   annual moisture: 1 rainforest / bayou .. .2 the dry hills
    tropic: (x,z)=>0..1,        //   frost-free heat: > ~.75 is rainforest (Af)
    dry:    (x,z)=>0..1,        //   summer drought: 1 is Mediterranean (Csb)
    salt:   (x,z)=>0..1,        //   brackish ground at the sea
    flow:   (x,z)=>0..1,        //   river banks
    upland: (x,z)=>0..1 },      //   0 lowland .. 1 hilltops
  err, stat });
```

How the biome zones itself from those (55-trees, `SWLOW.zones`):

| zone   | reads                                    | flora |
|--------|------------------------------------------|-------|
| beach  | salt>.55, just above the water           | sea oats, dune grass, beach vine, the odd skirt palm |
| mang   | salt>.25, tropic>.4, in the shallows     | lantern mangroves on arching red prop roots |
| rain   | tropic>~.7, wet>.72, fresh               | parasol kapoks, ribbon gums, lacquer cane palms, pillar figs; elephant ears, heliconias, forking ferns, bromeliads |
| swamp  | wet>.84, low ground (h<~3), not dry      | knee-cypress (in the pools too), saw palmetto, flag iris; lily pads, hyacinth, duckweed on the water |
| sub    | not tropic, not dry, wet>.45             | SPRAWL OAKS, pillar figs and flame parasols (warm end), lantern magnolias, violet jacarandas, veil willows, copper ringbark, eyed beech, flatwood pines over palmetto (pine patches), crimson ghosts, star gums (wetter ground); sunburn trees (warm end) |
| med    | dry                                      | coast oaks, bay laurels, cork oaks, flayed madrones, tier cedars (uplands), rattle-pods, skirt palms (draws, river), ember manzanita + pompom cycads (chaparral patches); golden grass, poppies, lupins, yuccas, aloes, agaves |
| rip    | flow                                     | veil willows, ghost sycamores, reeds, iris |

A 'semiarid' species reads only `med`. A 'humid' one never reads it. A world with
differently scaled fields will want to retune the `smooth()` bands in `zones()`.

## The bark

Bark colour is half of this biome's identity: brown, pale, and blood red. Each bark LOOK
is one merged bucket (one draw call) with its own material:

| bucket        | look                                            | species |
|---------------|-------------------------------------------------|---------|
| `bk_ember`    | smooth red, glossy, black char streaks          | ember manzanita |
| `bk_lacquer`  | lacquered red, pale lichen flecks               | lantern mangrove, a cork oak's stripped foot, sunburn tree |
| `bk_flay`     | red flakes over green-white                     | flayed madrone |
| `bk_strip`    | long red ribbons over white                     | ribbon gum |
| `bk_mottle`   | olive jigsaw over white                         | ghost sycamore |
| `bk_ring`     | copper sheen, pale lenticel bands, curls        | copper ringbark |
| `bk_ocelli`   | tan with dark ringed eyes                       | eyed beech |
| `bk_crack`    | cream split by a gold-orange network            | crimson ghost |
| `bk_plate`    | red plates, dark fissures                       | flatwood pine |
| `bk_furrow`   | furrowed, grey-green lichen                     | sprawl oak, coast oak, willow, cedar, rattle-pod |
| `bk_stringy`  | cinnamon fibres, weathered grey strands         | knee-cypress |
| `bk_pale`     | pale smooth, lenticels, green algae             | parasol kapok, pillar fig, flame parasol, lantern magnolia, bay laurel |
| `bk_cork`     | deep cork fissures, red-brown in their floors   | cork oak, star gum |
| `bk_cane`     | ringed nodes, per-vertex yellow -> lipstick red | lacquer cane palm |
| `bk_fibre`    | palm leaf-base lattice                          | skirt palm, pompom cycad |

The vertex colour is the species' colour **as it should look**. The material divides the
canvas relief by its own mean and multiplies by `uGain` (.52) for the light rig: sun plus
hemisphere render an albedo about twice as bright as it is written. So no palette has
to be pre-darkened. The mask's second colour (`uAlt`) is per bucket. `uGloss` adds a
sun highlight.

## What the biome exports

```js
SWLOW.build({R:2850, quality:1, avenues:[...], groves:[...]}) -> {trees, avenue, grove, heroes, far, bySpecies, trisBySpecies, ..., under, tris}
SWLOW.dress(geometries, opt)     // growth on a structure: Spanish moss, strangler roots, staghorns
SWLOW.canopyH(x,z)               // approximate canopy top
SWLOW.SPECIES                    // the 27 tree species (tagged), SWLOW.PAL the palettes
SWLOW.zones(x,z)                 // the zone weights a world can reuse for its own placement
SWLOW.barkMat2(tex,key,{alt,gloss,gain})   // the two-tone bark material (.barkLook: {alt, gloss, mask})
SWLOW.BARKLOOK                   // each bark bucket's look by name; the far impostors' trunks carry it
SWLOW.farMat()                   // the impostors' material: vertex colours + the bark's sun highlight (gloss in uv.x)
SWLOW.LOD                        // the runtime LOD ranges (below)
```

Two planted stands a world can ask for. The world owns the ground (a road, a clearing)
and the biome plants it:

```js
avenues:[{path:[[x,z],...], spacing:24, offset:13.5, species:'sprawloak'}]
  // two rows along a path. Each tree knows the road's direction (T.bias): an oak leans its
  // vault limbs over the road and keeps its sweeping limbs off it. That makes the live-oak tunnel.
groves:[{center:[x,z], r:70, spacing:16, angle:.35, species:'corkoak', stripped:true}]
  // a planting in jittered rows. stripped:true marks cork oaks as harvested. These are the
  // ONLY stripped cork oaks: a wild cork oak always keeps its cork.
```

Then `BIO.bake()` once. `quality` scales every count; the ideal-type host reads it from
`?q=` (or `window.KRATOR_Q`).

**Runtime LOD** (the core's, as xanadu uses it). The passes build under `BIO.range`, so bake
splits every item and bucket into one mesh per 1200 m chunk and range, and the host calls
`BIO.lodTick(camera)` every frame (after `camera.updateMatrixWorld()`): a chunk's mesh is
drawn only while the camera is within its range of the chunk and the chunk is in view.
The ranges are `SWLOW.LOD` (metres; `BIO.LOD.scale` multiplies them all):

| key | what | m |
|---|---|---|
| `tree` | a hero tree in full (its foot keys it: limbs, foliage, moss, knees...) | 1200 |
| `avenue` | the avenue's and the grove's rows (`avenues`, `groves`) | 2000 |
| `floor`, `floorMid`, `farFloor` | the floor's near / mid / far bands (grass and water: near / mid) | 800, 1200, 1200 |
| `under` | the understorey under each crown (keyed by its tree) | 800 |
| `logs` | fallen trees | 1200 |
| `dress` | `SWLOW.dress` on a world's structures (`opt.range` overrides) | 1200 |

Behind every hero stands a lite impostor (`minRange` = its range), drawn only past it; a far
tree (beyond the spine's mid ring) is only its impostor, always drawn. The scene therefore
HOLDS more than before (the stand-ins) and DRAWS far less: `BIO.lodShown` reports the chunk
meshes and triangles drawn. Draw calls rise to one per item per chunk in view (KNOWN_ISSUES).
`SWLOW.treeAt` keys its tree by its foot too, under whatever `BIO.range` the world sets.

## Flowers (project rule for this biome)

These are ordinary flowering plants. Flowers are borne in the crown, at the branch ends,
and never off the bark: there is no cauliflory here. That was the eastern abyss's habit,
and the lowlands kit does not inherit it. Where the trees flower:
- The flame parasol and violet jacaranda flower over the top of the crown (`bloomK`, the
  top share of the branch ends).
- The lantern magnolia holds one big upright flower at a branch end.
- The copper ringbark is sometimes in blossom through its crown.
- The madrone carries cream panicles and red berries at its tips; the manzanita carries
  urn flowers and berries.

Perched bromeliads are grey-green only, because a red rosette on a bough reads as a
flower on the bark.

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
The lowlands are the first kit with `abyssal:false` throughout. A plant is never part of
a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ origin list, fields), stats   } identical to
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets                } the eastern
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook, wind                   } abyss kit
40-core-place.js    stands, jittered grids (+ box, noMask), keep-clear, face sampling        }
50-biome-swlowlands-species.js   palettes, 27 species, two-tone bark, textures, materials, items (data only)
55-biome-swlowlands-trees.js     zones from the fields; the limb generator; one builder per habit; impostors
60-biome-swlowlands-floor.js     the floor by zone; the water (lilies, hyacinth, duckweed); fallen trees
65-biome-swlowlands-dress.js     growth on structures (ledges, soffits, walls)
70-biome-swlowlands.js           SWLOW.build / dress / canopyH
45-host-stage.js (ideal type only): renderer, the NW->SE terrain, the six fields, the sea
                                    plane + river ribbon, the painted ground, BIO.init
80+ host (ideal type only): sky with the Inner and Outer Walls, one Girder tower,
                            build order (+ ?q=), camera (views found by species) + inspector, probe
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields})`,
call `SWLOW.build`, then `BIO.bake()`. Read KNOWN_ISSUES.md first.
