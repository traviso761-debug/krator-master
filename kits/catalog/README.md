# kits/catalog/ — the master catalog (harvest)

A harvest of reusable pieces pulled out of Voth, Iziz, Mav's Refuge, Girder,
Yuni and the Ancients kit into one registry format. It was exported earlier and
kept in `archive/Claude outputs/`. It moved here because it is the starting
point for `kits/furniture/`.

**Status: unverified.** It has no `build.py` or `verify.py` yet, and nothing
here has been rebuilt since it was exported. Check a piece in its source build
before trusting it.

| File | What |
|---|---|
| `krator-asset-engine.js` | scene, camera, geometry kit (`F.box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof`), and the `FURN`/`PLANT`/`ASSET` registries with `buildFurn/buildPlant/buildAsset` |
| `inspector.js` | click-to-select inspector: measure, isolate, cycle variants, audit declared sizes |
| `krator-master-furniture.js` | 87 `FURN({...})` pieces, tagged by culture and room |
| `krator-master-plants.js` | `PLANT({...})` pieces, tagged by climate and aridity |
| `krator-master-buildings-voth.js`, `-beast-rider.js` | `ASSET({...})` buildings |

The frame convention: the origin is the footprint centre on the ground, and +z
is the front. Read the engine's header comment before writing a piece.

## Yuni furniture

The Yuni furniture sheet (`settlements/yuni`, `yuni-furniture.html`) is folded
in here: all 35 of its pieces are in `krator-master-furniture.js` under a
`yuni_` key prefix (`common_low_table` → `yuni_common_low_table`), rewritten
in the engine's dialect (literal colours, no Yuni palette, no `F.lathe` or
`F.edome`). The catalog is the general home for them; new furniture goes here,
not into Yuni. Yuni keeps its own copy in `src/63-furniture.js`,
`59-civic.js` and `61e-ancients-furniture.js` because its city build places
them at runtime, so changing a piece there does not change it here.
