# Krator biome kits — the contract (Northern Highlands edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) sitting on one
shared, engine-independent core (`1x..4x core`). A world that wants the biome copies the
core fragments and the biome fragments into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, the host's river object…): `build.py` greps for those
and fails the build if one appears.

The core here is the **xanadu core** (`xanadu-1`, with the runtime LOD) plus these additive
things (`BIO.version` reads `nhighlands-1`; a Rift, xanadu or sedesert fragment runs unchanged
on it):

- **`waterH(x,z)`** and **`BIO.depth(x,z)`** (ported from the sedesert core): the LOCAL water
  surface, for a stream that descends and a tarn in a hollow. `BIO.depth` = waterH − terrainH,
  positive under water. The default is `0` (the old kits' water plane); a host with no water
  somewhere returns `-1e9` there.
- **`BIO.grid(..., {depth:[lo,hi]})`** (sedesert): a window on `BIO.depth`, for a pass that
  plants IN the water (the stepping stones).
- **`register(o)`** / **`BIO.register(o)`** (sedesert): a volume the world's inspector and probe
  can name, `{name, key, kind, x, z, y, r, h}`. Every hero tree registers itself.
- **Two new climate fields, `cold` and `rock`** (both 0 by default in `BIO.fieldDefault`, so an
  older biome never notices them): `cold` is 0 temperate .. 1 boreal, from altitude AND
  aspect (the north-facing walls run colder, so the boreal band comes down lower in the side
  valleys); `rock` is 0 soil .. 1 boulder ground and crag.
- **Float32 stores** (internal): the items' matrices and colours and the buckets' vertices are
  growable `Float32Array`s (`BIO.F32`, the same `push()`); bake reads `.a`. Plain arrays of
  doubles crashed the page at ~16M triangles on a 43 km² map. A biome that writes into a
  bucket by hand keeps calling `K.pos.push(...)`.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                        // r128
  scene,
  terrainH: (x,z)=>y,           // ground height, world space
  waterH:   (x,z)=>y,           // the local water surface; -1e9 where there is none
  mask:     (x,z)=>0..1,        // density multiplier: 0 where nothing roots (water, cliffs, off the map)
  obstacles:[{x,z,r,y0,y1}],    // cylinders nothing may grow inside
  ticks:    fn=>void,           // per-frame fn(dt,t) for the wind
  register: o=>void,            // the inspector's volumes
  seed:     31,
  origin:   [[x,z],...],        // LOD spine
  center:   [0,0],
  fields:{                      // THE CLIMATE. This is how a world zones the biome.
    wet:    (x,z)=>0..1,        //   high everywhere on this flank; highest by the water
    upland: (x,z)=>0..1,        //   altitude
    flow:   (x,z)=>0..1,        //   the stream's banks, the tarn's shore
    mist:   (x,z)=>0..1,        //   the hollows, the water, the cloud band up high
    cold:   (x,z)=>0..1,        //   NEW: temperate .. boreal (altitude + aspect)
    rock:   (x,z)=>0..1 },      //   NEW: boulder fields and crags
  err });
```

How the biome zones itself from those (55-trees, `NHL.zones`):

| zone | reads | flora |
|---|---|---|
| temperate | cold < ~.36 | great spruce, cathedral cedar, shadow hemlock, moss maple, blue beech, forest lime, silver fir (low in the band, `low`: the broadleaves lead and the conifer giants are emergents); GREAT TRUMPETS; UNDERSTOREY TRUMPET colonies; sword and lady ferns, moss, sorrel, lace fern, the dark accents, mountain cane |
| montane | cold ~.24–.74 | Norway spruce, silver fir, mountain maple, blue beech, great trumpets; ferns, moss, bilberry |
| boreal | cold > ~.64 | spire spruce, frost fir, larch, birch stands, crag pines, boreal trumpets; heath, bilberry, reindeer lichen, fly agarics |
| alpine (treeline) | cold > ~.9 | wind spruce (krummholz), snow on the crowns; heath and lichen among stones; snow patches (host paint) |
| riparian | flow | grey alder, brook willow, moss maples hung with moss; RED-STEM FANS, lace ferns, disc stalks on the gravel, mossy boulders |
| old wood | rock, mid band | gnarled oak, fog laurel, elder yew on the boulder fields, mossed to the tips |
| crag | rock, cold | crag pines |
| glade | fbm clearings | bluebell carpets, bracken, DISC STALKS (fireweed in the boreal ones) |
| burn | fbm patch in the boreal band | burn snags over fireweed, birch coming back |
| dark | fbm patch | black grass, smoke bush, dark spurge, purple millet, teal aroids (≤ ~15% of the floor, never the canopy) |

## Night

The bell-bulbs and lantern pods glow faintly at night. `NHL.setNight(k)` (0..1) raises the glow
materials' emissive (bulbs `.05 → 1.35`, pods `.04 → 1.5`) and shows a small, dim additive halo on
half the clusters (hidden by day). The host's light modes call it (`LIGHT_HOOKS`).

## Tags (project rule)

Every species record (and every understorey plant, `NHL.PLANTS`, keyed by its item's label)
carries

```js
tags:{climate:'temperate'|'cold', aridity:'humid'|'subhumid', abyssal:false, riparian:'yes'|'no'|'both',
      harvest:{wood:'timber'|'fuel'|'none', edible:[parts], medicinal:bool, notes:''}}
```

**`harvest` is new in this kit and is the pattern later kits copy.** `edible` lists the parts
(an empty list: nothing edible); `notes` says how (or warns). `NHL.tagsOf(nameOrLabel)` returns
`{name, cls, tags}` for an inspector. A plant is never part of a building: `dress()` places
plants ON geometry the host hands it.

## What the biome exports

```js
NHL.build({R, quality}) -> {trees, heroes, far, colonies, bySpecies, ..., under}
NHL.dress(geometries, opt)      // growth on a structure: the HANGING FLORA (curtains of moss graded by
                                // length, bell-bulb strings, lantern pods, vines under every soffit; ferns,
                                // trumpet saplings and seedlings on the ledges); opt {y0,h,coldTop} makes the
                                // upper storeys boreal (beard lichen for moss). opt {kind:'crag'}: a rock
                                // (crag pines, heath, lichen).
NHL.setNight(k)                 // the glow, 0..1
NHL.canopyH(x,z)                // approximate canopy top
NHL.treeAt(x,y,z,key,opt)       // one tree at a point (a world's own placement)
NHL.SPECIES, NHL.PLANTS, NHL.PAL, NHL.KEY
NHL.zones(x,z)                  // the zone weights a world can reuse (the host's ground paint does)
NHL.TREES, NHL.COLONIES         // what was placed
NHL.tagsOf(nameOrLabel)
```

Then `BIO.bake()` once.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding (+ waterH, register, cold/rock defaults), stats
20-core-kit.js      instanced items (def/put), merged buckets (Float32 stores), runtime LOD, bake
30-core-foliage.js  leaf cards, alpha textures, Lambert foliage hook (+ iridescence), wind
40-core-place.js    stands, jittered grids (+ box, noMask, depth window), keep-clear, face sampling
50-biome-nhighlands-species.js   palettes, 25 species + 27 understorey plants (tagged), textures, the glow materials, items
55-biome-nhighlands-trees.js     zones from the fields; builders by habit (conifer, broad, gnarl, yew, birch, pine,
                                 snag, krumm, willow, great trumpet, trumpet); impostors; the passes; treeAt
60-biome-nhighlands-floor.js     the floor by zone; stepping stones; the fallen giants (nurse logs)
65-biome-nhighlands-dress.js     the hanging flora on structures; the crag dress
70-biome-nhighlands.js           NHL.build / dress / canopyH / tagsOf
45-host-stage.js  (ideal type)   renderer, the flank (ramp, spurs, valleys, crag steps), the stream and tarn, the six fields, BIO.init
82-host-sky.js    (ideal type)   the Krator dome (giant NE, sun WNW), the far country (the NW lowlands and their lake, the
                                 Inner Wall's snowy peaks SE), fog, the light modes (day / dawn / night) and LIGHT_HOOKS
84-host-ground.js (ideal type)   the ground painted from the fields and NHL.zones, the canopy's shade baked in; the stream
                                 ribbon, the tarn; the mist (sheets and sprites)
85-host-tower.js, 86-host-pillars.js   the ruined Girder tower and the crag pillars (structures for dress)
88-host-build.js, 90-host-camera.js, 91-host-probe.js, 93-host-polytool.js   build order, views + inspector, probe, polygon/path tool
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...fields})`
with `cold` and `rock`, call `NHL.build`, dress your structures, then `BIO.bake()`.
Read KNOWN_ISSUES.md first.
