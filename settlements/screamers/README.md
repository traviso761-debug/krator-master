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
| Plan from above | 82 / 3.27 M | 128 / 2.73 M |
| The plaza | 84 / 3.28 M | 126 / 2.83 M |
| The village | 83 / 3.27 M | 134 / 2.81 M |

The gain is small here (14-17% of triangles) because the biome already has its own LOD; see `KNOWN_ISSUES.md`.
