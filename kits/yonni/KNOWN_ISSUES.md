# kits/yonni: known issues

`verify.py dist/yonni.html --assert` passes with zero open failures (`all-surfaces-textured` = 0 untextured meshes; `z-fighting` = 0 coplanar overlaps; `vendor-check` = OK, zero shadowed `core/engine` fragments).

## Notes for downstream settlement integration

- **Shared `core/tags` & `kits/catalog` promotion:** To stay strictly isolated inside `kits/yonni/` without changing hashes of other committed builds, `src/53a-yn-vocab.js` registers `'yonni'` idempotently on `KTAGS.VOCAB` at page load, and `build.py` bundles `kits/yonni/yonni_furniture.js` directly into `KratorFurniture`. When a multi-build rebuild runs on `main`, `'yonni'` can be listed in `core/tags/52-core-tags-vocab.js` and `yonni_furniture.js` linked as `kits/catalog/krator-master-furniture-yonni.js` with zero code changes here.
- **Placeholder wet-coastal flora (`66-yn-flora.js`):** `ynb-hill-oat`, `ynb-sea-kale`, `ynb-amber-pine`, and `ynb-creek-alder` are separate tagged `cls: 'flora'` placeholders per `README.md` until a dedicated Yonni / Scoured Hills biome kit replaces them by key.
