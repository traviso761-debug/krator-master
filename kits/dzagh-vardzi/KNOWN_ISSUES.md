# kits/dzagh-vardzi: known issues

`verify.py --assert --no-cache` and `verify.py --village --assert --no-cache` pass with zero open failures (`all-surfaces-textured` = 0 untextured meshes; `z-fighting` = 0 coplanar overlaps; `zero-white-quartz-spires` = 0 quartz roof meshes; `hooks-2-to-4-wonders` = all 3 wonders placed, walkable, furnished & 0-z-fight; `vendor-check` = OK, zero shadowed `core/engine` fragments).

## Notes for downstream settlement integration

- **Shared `kits/catalog` promotion:** `'dzagh-vardzi'` is registered in `core/tags/52-core-tags-vocab.js`, and `build.py` bundles `kits/dzagh-vardzi/dzagh-vardzi_furniture.js` (31 bespoke `FURN` definitions, `< 30 KB`) directly into `KratorFurniture`. When a multi-build rebuild runs on `main`, `dzagh-vardzi_furniture.js` can be linked into `kits/catalog/` with zero code changes here.
- **Placeholder Vardzieti gorge flora (`66-dv-flora.js`):** `dvb-apricot-tree`, `dvb-red-cypress`, `dvb-gorge-barley`, and `dvb-dyer-madder` are separate tagged `cls: 'flora'` placeholders per `README.md` until a dedicated Vardzieti / Crookwash biome kit (`biomes/crook`) replaces them by key.
