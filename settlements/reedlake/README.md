# Reed Lake — floating village kit

The floating reed villages of the lake people: islands of piled reed anchored in the shallows, reed-bundle arch
houses (the mudhif), totora thatch huts and cone huts, reed boats with painted puma prows, pontoon bridges, garden
rafts. Everything is reed; the little timber is eucalyptus poles; the painted vocabulary is woven, Andean —
stepped diamonds, zigzags, step-frets and the chakana in madder, ochre, black and white. No electric light.

The same building types as the Highland Tribal branch (three small and two large dwellings, the village longhouse,
the warrior's hall, the shaman's house, a sacred circle, farmhouse, farm, animal pen, granary, scrap smithy) with
nothing hung on a hillside, plus the reed boats, five island platforms, a fishing dock, a reed weaver's workshop,
a warehouse, a watchtower, a fish weir and duck run, and the composite floating village.

Built on the Highlands kit's fragment contract (which is the Ancients kit's), vendoring the Highlands vocabulary
fragments unchanged, so it drops into a settlement target the way the Highlands and Iziz sets do.

```
python build.py                         # dist/reedlake.html (every family row + the village), dist/reedlake-village.html
python verify.py dist/reedlake.html --assert --views "Opening,Great mudhif — eye level" --out shots
python build.py --vendor-check          # vendored fragments still identical to ../highlands/src?
```

* `DESIGN.md` — the brief: the culture, the materials, the painted vocabulary, the building list.
* `API.md` — the contract: registry, palette, kit items, helpers, how to put a building on an island.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open.

## Level of detail

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into
frustum-culled chunks that switch to clustered proxies with distance; instanced sets keep one draw call and drop their
smallest instances by screen size. The originals stay the raycast targets, so the inspector and `_api` see full detail.
The `LOD` panel (bottom right; `l` toggles it, `measure` renders the view both ways) reads draw calls and triangles.
`LOD.enabled=false` (or `?lod=0`) puts back the exact scene the build made; `LOD.stats()` and `LOD.measure()` are
there for verify.

Measured 2026-10-01, 1000x640, SwiftShader on a shared 4-core machine (`LOD.flush()` then `LOD.measure()`; triangles and
draw calls as three.js counts them. Frame times were too noisy under the shared load to quote):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| village: Opening | 148 / 223k | 148 / 200k |
| village: Overview | 148 / 223k | 127 / 72k |
| village: Floating village | 148 / 223k | 149 / 196k |

The village is small, so close views barely change; the overview drops to a third.
