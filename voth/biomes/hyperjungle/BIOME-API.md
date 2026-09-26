# Krator biome kits — the contract

One biome = one self-contained fragment (`5x-biome-<name>.js`) sitting on one shared,
engine-independent core (`1x..4x biome-core`). A world that wants the biome copies the
core fragments and the biome fragment into its `src/`, gives the core a `host` object,
and calls `build()`. Nothing in the core or a biome fragment names a world's kit
(`kdef/kput`, `BUCKET/MBK`, `PLATS`, `RIVER`…): `build.py` greps for those and fails
the build if one appears. That is the whole point — the flora of a biome must move
between worlds without a re-implementation, which is what every port before this one
turned into.

## What the host provides (`BIO.host`)

```js
BIO.init({
  THREE,                       // r128
  scene,                       // everything the biome emits is added here
  terrainH: (x,z)=>y,          // ground height, world space. The one function every plant asks.
  mask:     (x,z)=>0..1,       // density multiplier: 0 inside clearings/footprints/water, 1 in the open.
                               //   The HOST cuts the clearings; the biome never knows why.
  obstacles:[{x,z,r,y0,y1}],   // cylinders nothing may grow inside (towers, platforms). Optional.
  ticks:    fn=>void,          // register a per-frame fn(dt,t). Optional; without it nothing sways.
  seed:     1234,              // one integer; the biome is deterministic from it
  origin:   [x,z],             // LOD origin (where the cameras live). Default 0,0.
  stat:     (key,tris,inst)=>void   // optional per-type accounting hook for a probe
});
```

The core keeps its own PRNG (`BIO.rng/rr/reseed`) — it never touches the host's stream,
so adding a biome to a world does not move that world's rubble.

## What a biome exports

```js
HYPERJUNGLE.build({
  R:3400,                // radius of forest around origin
  quality:1,             // 0.5 halves every count; budgets scale with it
  species:[0,1,2,3],     // which of the biome's species to use
  heroR:1400             // full-detail radius; beyond it trees are impostors
}) -> { tris, inst, calls, trees, hyper, under }

HYPERJUNGLE.dress(geometries, opt)   // grow on a structure: moss on up-faces, moss
                                     // mats + curtains + brackets on soffits, lips and
                                     // curtains off ledges. `geometries` = BufferGeometry[]
                                     // in world space (merged shells); the biome samples
                                     // their faces itself.
HYPERJUNGLE.canopyH(x,z)             // approximate canopy top, for flyers and cameras
HYPERJUNGLE.SPECIES                  // the species table (tags: climate, aridity, riparian)
```

`BIO.bake()` is called by the host after every biome (and after the host's own use of
the core) — it turns the card/instance stores into InstancedMeshes and the merged buckets
into Meshes. Draw calls: one per instanced item + one per merged family, typically 12–18.

## Tags (project rule)

Every species record carries `tags:{climate:'hypertropic'|'tropic'|'temperate'|'cold',
aridity:'arid'|'semiarid'|'subhumid'|'humid', abyssal:true|false, riparian:'yes'|'no'|'both'}`.
A plant is never part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10-core-head.js     BIO object, PRNG, noise, host binding, stats
20-core-kit.js      instanced items (def/put), merged vertex-coloured buckets (tube/lathe/surf/tri)
30-core-foliage.js  leaf-card store with per-card normal + second colour, alpha textures,
                    Lambert foliage hook (two-sided, up-bent normal, distance alpha, iridescence), wind
40-core-place.js    stands (fbm), jittered grids, keep-clear tests, LOD curve, face sampling
50-biome-hyperjungle-species.js   the 4 hypertree species + understorey palette (data only)
55-biome-hyperjungle-trees.js     hero hypertrees, saplings, far impostors
60-biome-hyperjungle-floor.js     understorey, logs, lianas, fungi, boulders
65-biome-hyperjungle-dress.js     growth on structures (soffits, ledges, up-faces)
70-biome-hyperjungle.js           HYPERJUNGLE.build / dress / canopyH
45-host-stage.js (ideal type only): renderer, terrain, BIO.init -- a world puts its own BIO.init
                                    anywhere after its terrain exists and BEFORE fragment 50
80+ host (ideal type only): sky, one Girder tower, build order, camera, probe
```

To port: copy 10–70 (and 00-head/99-tail if starting fresh), write `BIO.init({...})`, call
`HYPERJUNGLE.build`, then `BIO.bake()`. Read KNOWN_ISSUES.md first.
