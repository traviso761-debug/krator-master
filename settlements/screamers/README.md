# Hexahedron — village of the Screamers

Forked from the `ancients` kit. One target, `screamers`, building one settlement:
a tribal village in and under the ruined Hexahedron arcology, in the northern
part of the central crater, hyperjungle, the great volcano far to the south.

    python build.py --target screamers
    python verify.py dist/screamers.html --assert --all-views --out ./shots/x

## Why this forked ancients and not Girder

Girder is the jungle lineage and has the things this brief wants -- sky, life
layer, overgrowth, flyers -- but it is ~7 800 lines against a different kit
(PAL/FAMMAT, its own tube and merged-bucket builders). The Hexahedron is 340
lines that depend on the whole ancients helper ecosystem: gridSurface, lathe,
the kdef/kput instancing kit, holeFn, the decor samplers, the concrete
materials. Porting one building into Girder is not obviously cheaper than
porting Girder's world into ancients, and the only capability ancients actually
lacks is animation, which is a few hundred lines rather than eight thousand.
The jungle look is reproduced from the shared Krator palette canon.

## Orientation

+x east, +z SOUTH (Krator canon). The volcano stands at +z, so the hero cameras
sit north of the settlement and look back across it toward the mountain.

## Level of detail

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into
frustum-culled chunks that switch to clustered proxies with distance; instanced sets keep one draw call and drop their
smallest instances by screen size. The originals stay the raycast targets, so the inspector and `_api` see full detail.
The `LOD` panel (bottom right; `l` toggles it, `measure` renders the view both ways) reads draw calls and triangles.
`LOD.enabled=false` (or `?lod=0`) puts back the exact scene the build made; `LOD.stats()` and `LOD.measure()` are
there for verify.

`92-camera.js` sets `window.LOD_OPTIONS`: the jungle flora (the Lambert instanced sets) keeps every instance, because
the biome core already thins and enlarges far cards on its own curve, so their screen size is not their geometry's.
LOD still frustum-culls them (their originals are drawn with culling off) and simplifies the biome's merged far meshes.

Measured 2026-10-01, 1000x640, SwiftShader on a shared 4-core machine (`LOD.flush()` then `LOD.measure()`; triangles and
draw calls as three.js counts them. Frame times were too noisy under the shared load to quote):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Plan from above | 82 / 3.27 M | 79 / 2.88 M |
| The plaza | 84 / 3.28 M | 87 / 3.13 M |
| The village | 83 / 3.27 M | 81 / 2.94 M |

The gain is small here (5-12% of triangles) because the biome already has its own LOD; see `KNOWN_ISSUES.md`.

## Materials: the library (core/materials/record)

`materials.json` is the adapter: per family a library set, the `MAT` keys it dresses (`mat`), its tile in world
metres, how much of the set's own colour survives (`tint.keep`) and the brightness it is normalised to (`tint.mean`,
measured from the procedural canvas it replaces, so the Screamer retint in `69-mat-salvage.js` keeps its meaning).
`python3 tools/textures/pack.py settlements/screamers` writes `tex/` (commit it); `build.py` inlines it as the
generated `72b-matlib-pack.js`, and `src/72c-matlib.js` attaches each family to its materials in place.

The maps are sampled by **world-space triplanar projection**, not through the UVs: this lineage's UVs are in no one unit
(lathe tiles at 8 m, kit boxes stretch 0..1 over each face), which is why the board-formed concrete ran at a different
size on every surface. Colour, normal (reoriented per plane) and roughness, with the tiling break-up. `?mat=proc` is the
old procedural look; `?breakup=0` turns the break-up off; `window._materials` lists what went where.

| Family | Set | Dresses |
|---|---|---|
| concrete | `concrete.board` (4.2 m) | the Hexahedron's fabric: `concrete concreteR hxCell hxSoffR rock` |
| soil, lawn | `ground.ruin` (own colours), `ground.grass_ground` | the graded village ground (`mud`), the plaza lawn |
| rust, corrugate | `metal.rusty_metal_05`, `metal.corrugated` | rust plate, salvage sheet (`corrugate scrap`) |
| timber, tarp, thatch, lash | `wood.weathered_brown_planks`, `cloth.tarp`, `roof.thatch`, `wood.lash` | the tribe's own building |
| ancient | `metal.ancient` | `MAT.white`, and the Post-Apoc bulkhead (`apoc_conc`) |
| ironbark, ghostwood, prismgum, baobab | `bark.*` (the generated Girder sets) | the four species' boles |
| apoc_* | planks, worn corrugated iron, scrap sheet, adobe, medieval wood, bottle glass | the Post-Apoc set's own materials (`KratorPostApoc.MAT`) |

A family may also set `"color"`: the material's tint, for a set whose hues are the surface (the laterite and moss).
`metal.ancient`, `wood.lash` and `ground.ruin` are the owner's generated sets (`tools/textures/batches/chatgpt-2026-10f-screamers.json`). The biome's own flora (the vendored hyperjungle) and the leaf
cards keep their procedural textures.

## The salvage quarter: Post-Apoc homes, furnished

Beside each smithy stand three homes from the Post-Apoc set (`kits/post-apoc`): silo house, tyre hut, bulkhead manor,
bottle cottage, box house, twin silo hall, tank pod, stilt perch, bus house. They come in as ONE closure,
`KratorPostApoc` (`kits/post-apoc/apoc_bundle.py`, the generated `70e-apoc-bundle.js`): the kit's engine, sockets and
cultures and its dwelling fragments, with its own `MAT`, `TEX` and seeded stream, so nothing it does moves this page's.
They wear the **Screamer** culture pack (`core/sockets/80-cultures.js`: ochre rag, black and bone, the skull) and are
**furnished inside** by the interiors kit (the generated `70d-furniture-bundle.js`: the catalog's furniture with the
`screamer` culture and its fallbacks, and `KratorInteriors` with the `post-apoc` set), plus their yard furniture.
`src/71a-apoc-homes.js` sites them (tier 4 in `buildVillage`, before the fields, on a fixed ring round each smithy:
no draw from the village's rng) and leaves `SCREAM.homes` (each one's front door) and `window._apoc` (homes, pieces,
rooms, residence fails, missing catalog keys). Views: *Salvage homes*, *A salvage home*, *Inside a salvage home*,
*Inside the twin silo hall*.
