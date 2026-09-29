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
| `krator-master-furniture.js` | 84 `FURN({...})` pieces, tagged by culture and room |
| `krator-master-plants.js` | `PLANT({...})` pieces, tagged by climate and aridity |
| `krator-master-buildings-voth.js`, `-beast-rider.js` | `ASSET({...})` buildings |

The frame convention: the origin is the footprint centre on the ground, and +z
is the front. Read the engine's header comment before writing a piece.
