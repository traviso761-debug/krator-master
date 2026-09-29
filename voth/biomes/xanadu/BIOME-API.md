# Krator biome kits — the contract (Xanadu edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, the host's river object…): `build.py` greps for those
and fails the build if one appears.

The core here is the Rift kit's core plus one additive thing, the RUNTIME LOD (`BIO.version`
reads `xanadu-1`; a Rift or eastern-abyss fragment runs unchanged on it):

- A pass may set `BIO.range` (metres) while it builds, and `BIO.owner=[x,z]` (a tree's foot)
  round each plant. Everything put or written into a bucket is then keyed by the chunk of
  its owner (`BIO.LOD.chunk`, 1200 m) and by that range (and `BIO.minRange`, for stand-ins
  that must only show BEYOND a distance). `BIO.bake()` splits each item and bucket into one
  mesh per key. With `BIO.range` left null nothing changes: one mesh, always drawn.
- The host calls `BIO.lodTick(camera)` every frame before rendering: a chunk's mesh is
  drawn only while the camera is within its range of the chunk (past its minRange) and the
  chunk's bounding sphere is in the view. `BIO.LOD.scale` stretches every range at once;
  `BIO.lodShown` reports what was drawn.
- Anything that writes into a bucket by hand (an impostor builder pushing to `K.pos`) must
  push one key per triangle to `K.k` (`BIO._lodKey(x,z)`), or its triangles land in the
  always-drawn group.
`BIO.iridBarkMat` is defined by the biome's species fragment only if no other biome
defined it first, so the Rift and Xanadu can load into the same world.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE, scene,
  terrainH: (x,z)=>y,           // ground height. Water is wherever it is < 0 (the lake at y=0).
  mask:     (x,z)=>0..1,        // 0 where nothing roots (water, cliffs, footprints, the river's channel)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  seed:     23,
  origin:   [[x,z],...],        // the LOD spine: every origin keeps full detail round itself
  center:   [0,0],
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   Mediterranean uplands ~.35, the open vale ~.6, the forested flanks ~.75, the lake shore and the river .85+
    salt:   (x,z)=>0,           //   unused: the lake is fresh
    upland: (x,z)=>0..1,        //   0 shore and vale .. .4 the brown uplands .. .7 the cliffs .. 1 the mountains
    flow:   (x,z)=>0..1,        //   1 on the river's banks
    mist:   (x,z)=>0..1 },      //   the chasm's spray, the fountain, the mist band on the mountains
  err, stat });
```

How the biome zones itself from those (55-trees, `XANADU.zones`):

| zone   | reads                                      | flora |
|--------|--------------------------------------------|-------|
| shore  | low upland, h < 10, wet > .7              | dawn redwoods (also standing in the shallows), frost willows, lotus trumpets, wisteria; reeds, iris, plumes; lotus on the water |
| rip    | flow                                       | dawn redwoods, wingnuts, frost willows, lotus trumpets, cacao, violet plantains; ferns, iris, cobra lilies |
| vale   | low upland, wet < .8, little mist          | cushion trees, haze blossoms, ginkgos, wisteria, lotus trumpets, traveller's palms; meadow, flower drifts, blood grass, box domes; fairy rings |
| forest | low upland, wet > .64, little mist         | chestnut-leaved oaks, agate trees, Persian ironwood, ginkgos, Wollemi pines, lantern trees; ferns, box, baneberry, cobra lilies, mushrooms; fairy rings, hornbeam arches |
| chasm  | mist, low upland                           | tree-ferns, chasm frills, Wollemi pines, cacao, violet plantains, dawn redwoods; giant ferns, moss, orchids |
| cloud  | mist, high upland                          | beard trees, chasm frills, tree-ferns, Wollemi pines |
| dry    | upland .16–.72, wet < .6                  | whorl olives, cloud pines, bottle palms, desert roses, prickly pears, pitaya, silver fan palms, barrel frills, silver scrub, serpent stalks; garrigue, star flowers, petrified logs; cloud-pine rings |
| crag   | upland > .52                               | wind-leaning cloud pines, silver scrub, barrel frills |

The mask must be zero on cliffs (slope > ~1.4) and in the river's channel.

## What the biome exports

```js
XANADU.build({R:3400, quality:1, lakeHue:.49}) -> {trees, heroes, far, rings, arches, bySpecies, ..., under, tris}
XANADU.dress(geometries, opt)   // growth on a structure: {ledges:{moss,plants,edges,hang}, soffits:{n,mossR,hang}, walls:{n}}
XANADU.canopyH(x,z)             // approximate canopy top
XANADU.zones(x,z)               // the zone weights a world can reuse for its own placement
XANADU.SPECIES / XANADU.PAL     // the 31 species (tagged), the palettes
XANADU.RINGS / XANADU.ARCHES    // where the fairy rings and the hornbeam alleys stood ({x,z,r|a,n,lv})
XANADU.LOD                      // the runtime ranges: {tree:1500, floor:750, farFloor:3000, dress:1500, logs:1500}
```

How the biome uses the runtime LOD: every hero tree (full detail near the spine at build
time) is drawn in full within `XANADU.LOD.tree` of its chunk and as a cheap stand-in impostor
past it; trees built as impostors from the start (far from the spine) are always drawn; the
floor near the spine shows within `floor`, the far band's coarse floor within `farFloor`.

Then `BIO.bake()` once, and `BIO.lodTick(camera)` every frame.

## The lake colour

The host sets `var XANADU_LAKE={hue:.49}` before fragment 50 loads (or calls
`XANADU.setLake(hue)` / `XANADU.build({lakeHue})`). It tinges the mosses, the reeds and the
jade second colour of the agate tree and the wingnut, and gives the complement the lotus
trumpets' fringe leans to. The psychedelic flowers (`PAL.psy`, `PAL.psyPair`) do not
follow it: every colour at once, by design.

## Tags (project rule)

Every species record carries `tags:{climate, aridity, abyssal, riparian}`. A plant is never
part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-40  the core (the Rift kit's, unchanged)
50-biome-xanadu-species.js  lake-hue palette, the petrified-wood and psychedelic palettes, 31 species, bark/leaf/flower textures, geometries, materials, items (data only)
55-biome-xanadu-trees.js    zones from the fields; one builder per species; the rings and the arches; impostors; the passes
60-biome-xanadu-floor.js    the floor by zone; lotus on still water; the fairy rings' lawns; fallen and petrified logs
65-biome-xanadu-dress.js    growth on structures (wisteria and willow curtains, ledge plants, soffits, walls)
70-biome-xanadu.js          XANADU.build / dress / canopyH
45-host-stage.js  (ideal type) the Vale map (class grid from the scale model), terrain, the river, the fields, BIO.init
46-host-ground.js (ideal type) the painted ground with the cliffs' strata, the lake, the river ribbon
82-host-sky.js    (ideal type) the ranges round the Vale, the cataract's spray, the gas giant
85-host-dome.js   (ideal type) the pleasure dome, a ruin to dress
86-host-fountain.js (ideal type) the fountain at the chasm
88/90/91          build order, camera + inspector, probe
```

To port: copy 10–70, write `BIO.init({...fields})`, set `XANADU_LAKE`, call `XANADU.build`,
then `BIO.bake()`, and call `BIO.lodTick(camera)` in the frame loop. Read KNOWN_ISSUES.md first.
