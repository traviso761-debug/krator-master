# Krator biome kits — the contract (northwestern lowlands edition)

One biome = one self-contained set of fragments (`5x..7x-biome-<name>.js`) on the shared,
engine-independent core (`1x..4x core`). A world copies the core and the biome fragments,
gives the core a `host`, and calls `build()`. Nothing in the core or a biome fragment names
a world's kit: `build.py` greps for those names and fails the build if one appears.

The core is the eastern abyss core, **byte for byte**, as in the southwestern kit. The NW
kit is a sibling of the SW kit. It shares the SW machinery (the limb generator, anchored
crowns, the two-tone bark material, avenues, the understorey pass) and carries its own
copy of it, so neither kit depends on the other.

## What the host provides (`BIO.host`)

```js
BIO.init({ THREE, scene, terrainH, mask, obstacles, ticks, seed, origin:[[x,z],...], center,
  fields:{
    wet:    (x,z)=>0..1,   // annual moisture
    tropic: (x,z)=>0..1,   // frost-free heat: > ~.75 is rainforest (Af)
    dry:    (x,z)=>0..1,   // summer drought: 1 is Mediterranean (Csb)
    flow:   (x,z)=>0..1,   // river banks
    upland: (x,z)=>0..1 }, // 0 lowland .. 1 the foothills
  err, stat });
```
(`salt` is read as 0: the lake is fresh.)

How the biome zones itself (55-trees, `NWLOW.zones`):

| zone     | reads                                   | flora |
|----------|-----------------------------------------|-------|
| shore    | low (h<~3), wet, not dry                | glow-willows, pale paperbarks, stilt pandans; reeds, iris, sea pens; lotus on the water |
| rain     | tropic>~.7, wet>.72                     | sky meranti (emergent), mist palms, spire tree ferns, pandans; teal aroids, torch ginger, tall feather pens |
| bamboo   | an fbm patch in rain+sub, likelier by water; HARD edge | the GROVES: sky bamboo, Buddha-belly and coil cane at the rim; litter and shoots below |
| sub      | not tropic, not dry, wet>.45            | ghost and blue gums, column kauri, candle birch and spire cedar in STANDS (birchK, spireK), ginkgo, glow-willows; bluebells, rhododendrons, lilies, sea pens |
| med      | dry                                     | needle cypress, she-oak, crag pines (uplands), tall wattle, banksia, grass trees; tussock, kangaroo paw, saltbush, club pens |
| gully    | dry but wet (north-facing draws)        | tower ash |
| rip      | flow                                    | spindle poplars, glow-willows |

## The rules of this biome

- **Verticality.** Heights are ~1.5x the Earth kin. Crowns are high on steep limbs
  (`B.column`: crotch at 45–80%, limbs at 55–75° from the horizontal). Some trees are
  spindles (`B.fastigiate`) and spires (`B.spire`). The glow-willow is the one exception.
- **Bark.** White, blue-grey, green-grey and blue-green; brown only in fissures (the
  `alt` colour of `bk_fibre`, `bk_plate`).
- **Bamboo groves are a sub-biome.** No tree pass plants where `zones().bamboo` is above
  ~.02. The grove pass fills the patch: culms are taller in the interior and lower at the
  rim, and clumping kinds fringe it where it is wet. The floor pass lays grove litter there.
- **Sea pens** are the shrub layer everywhere (`pen`, `clubpen` items: feather, club and
  whip forms).
- **Lanterns.** The glow-willow hangs its lantern blossoms on strings. They are an unlit
  `MeshBasicMaterial`, so they show their own colour in any light, with an additive
  halo. They are the only emissive thing in the kit.

## The bark buckets

| bucket       | look                                         | species |
|--------------|----------------------------------------------|---------|
| `bk_ghost`   | powder-white, faint grey sheddings           | ghost gum, tower ash |
| `bk_birch`   | white, black lenticels and chevrons          | candle birch |
| `bk_bluegum` | blue-grey, cream ribbons peeling             | ribbon blue gum |
| `bk_smooth`  | green-grey smooth, green algae               | meranti, ginkgo, poplar, wattle, banksia |
| `bk_fibre`   | blue-grey fibres, brown in the grooves       | spire cedar, needle cypress, she-oak |
| `bk_plate`   | blue-grey / blue-green plates, brown edges   | kauri, crag pine |
| `bk_paper`   | layered paper, tan beneath                   | paperbark |
| `bk_silver`  | silver, softly twisted furrows               | glow-willow |
| `bk_ring`    | pale ringed stems                            | mist palm, pandan |
| `bk_fern`    | dark frond-base lattice                      | spire tree fern |
| `bk_char`    | charred leaf bases                           | grass tree |
| culm (instanced) | nodes with a white waxy ring, tinted per culm | the bamboos |

## What the biome exports

```js
NWLOW.build({R:2850, quality:1, avenues:[...]}) -> {trees, culms, lanterns, avenue, heroes, far, bySpecies, trisBySpecies, ..., under}
NWLOW.dress(geometries, opt)     // growth on a structure: moss, hanging moss, roots, sea pens in the joints
NWLOW.canopyH(x,z)
NWLOW.SPECIES                    // 23 species (20 trees, 3 bamboos), tagged; NWLOW.PAL the palettes
NWLOW.zones(x,z)                 // the zone weights (incl. bamboo, birchK, spireK)
NWLOW.barkMat2(tex,key,{alt,gloss,gain})
NWLOW.LOD                        // the runtime LOD ranges (below)
```
`avenues:[{path:[[x,z],...], spacing, offset, species}]` works as in the SW kit (the
host here lines a pale road with ghost gums). Then `BIO.bake()` once. `quality` scales
every count; the ideal-type host reads `?q=`.

**Runtime LOD** (the core's, as xanadu and swlowlands use it). The passes build under
`BIO.range`, so bake splits every item and bucket into one mesh per 1200 m chunk and range,
and the host calls `BIO.lodTick(camera)` every frame (after `camera.updateMatrixWorld()`): a
chunk's mesh is drawn only while the camera is within its range of the chunk and the chunk is
in view. The ranges are `NWLOW.LOD` (metres; `BIO.LOD.scale` multiplies them all):

| key | what | m |
|---|---|---|
| `tree` | a hero tree in full (its foot keys it: limbs, foliage, moss, lanterns...) | 1200 |
| `grove` | the bamboo groves' culms and leaf in the near and mid bands | 1200 |
| `avenue` | the avenue's row (`avenues`) | 2000 |
| `floor`, `floorMid`, `farFloor` | the floor's near / mid / far bands (grass and water: near / mid) | 800, 1200, 1200 |
| `under` | the understorey under each crown (keyed by its tree) | 800 |
| `logs` | fallen trees | 1200 |
| `dress` | `NWLOW.dress` on a world's structures (`opt.range` overrides) | 1200 |

Behind every hero stands a lite impostor (`minRange` = its range), drawn only past it; a far
tree (beyond the spine's mid ring) is only its impostor, always drawn. A grove's near and mid
culms have lite blobs behind them (ground to culm top, in the pale culm colour), one per 22 m cell
where a sky-bamboo clump stood; the far band is its blob canopy, always drawn. The scene
therefore HOLDS more than before (the stand-ins) and DRAWS far less: `BIO.lodShown` reports the chunk meshes and triangles drawn.
Draw calls rise to one per item per chunk in view (KNOWN_ISSUES).

## Tags (project rule)

Every species carries `tags:{climate, aridity, abyssal, riparian}`. A plant is never
part of a building: `dress()` places plants ON geometry the host hands it.

## File layout

```
10..40  core (identical to the eastabyss / swlowlands kits)
50-biome-nwlowlands-species.js   palettes, 23 species, two-tone bark (+ ghost, birch, bluegum, paper,
                                 fern, silver, char), culm/belly/coil/lantern geometries, materials, items
55-biome-nwlowlands-trees.js     zones; the limb machinery; builders by habit (column, fastigiate,
                                 spire, palm, fern, pandan, willow, grasstree, banksia); the GROVES; impostors
60-biome-nwlowlands-floor.js     the floor by zone (sea pens), grove floor, water, logs, understorey
65-biome-nwlowlands-dress.js     growth on structures
70-biome-nwlowlands.js           NWLOW.build / dress / canopyH
45-host-stage.js (ideal type)    the NW->SE terrain rising to the foothills, fields, lake, river, road
80+ host (ideal type)            sky with the Outer Wall (NW, far) and the Inner Wall mountains (SE),
                                 one Girder tower, build (+ ?q=), views found by species and grove, probe
```
