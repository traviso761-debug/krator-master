# kits/dzagh-vardzi: known issues

`verify.py dist/dzagh-vardzi.html --assert` passes with zero open failures (`all-surfaces-textured` = 0 untextured meshes; `z-fighting` = 0 coplanar overlaps; `vendor-check` = OK, zero shadowed `core/engine` fragments).

## Notes for downstream settlement integration

- **Shared `core/tags` & `kits/catalog` promotion:** To stay strictly isolated inside `kits/dzagh-vardzi/` without changing hashes of other committed builds, `src/53a-dv-vocab.js` registers `'dzagh-vardzi'` idempotently on `KTAGS.VOCAB` at page load, and `build.py` bundles `kits/dzagh-vardzi/dzagh-vardzi_furniture.js` directly into `KratorFurniture`. When a multi-build rebuild runs on `main`, `'dzagh-vardzi'` can be listed in `core/tags/52-core-tags-vocab.js` and `dzagh-vardzi_furniture.js` linked into `kits/catalog/` with zero code changes here.
- **Placeholder Vardzieti gorge flora (`66-dv-flora.js`):** `dvb-apricot-tree`, `dvb-red-cypress`, `dvb-gorge-barley`, and `dvb-dyer-madder` are separate tagged `cls: 'flora'` placeholders per `README.md` until a dedicated Vardzieti / Crookwash biome kit replaces them by key.
