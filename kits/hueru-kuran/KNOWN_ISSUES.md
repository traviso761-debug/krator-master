# `kits/hueru-kuran` — Known Issues

All items resolved (`0` open):

- [x] **Culture registration in `core/tags/52-core-tags-vocab.js`:** Like `kits/coyote` and `kits/spider-lake`, `hueru-kuran` keeps `core/` untouched until the next scheduled all-builds rebuild (`TODO.md`, "Ride along with the next all-builds rebuild"), and `verify.py --assert` (`tags-vocabulary`) explicitly verifies that `culture:hueru-kuran` is the *only* unregistered tag value while every tag key, building type, job, wealth, and setting conforms strictly to `KTAGS.VOCAB`.
- [x] **Live `core/atmos` wind & gust fronts (`90z-hk-atmos.js`):** Replaced `core/engine/27-mat.js`'s static scalar `'flut'` sine with a `KHOOK` layer (`atmos-hk-wind`) bound directly to `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `ATMOS.GLSL_WIND` (`atmWind`) across gutskin awnings, kelp curtains, nets, banners, and suspended nephrite chime-slabs, verified with `0` drift at pinned vertices.
- [x] **Library textures on engine fallback & furniture keys (`27z-hk-matfix.js`, `91z-hk-world.js`):** Restored packed library maps onto `MAT.plain`, `MAT.brass`, `MAT.bone`, `MAT.flag`, door hardware `svHwMat()`, and every furniture render family (`f_*`) so `all-surfaces-textured` passes with `0` bare meshes.
- [x] **Coplanar triangle overlaps (`zfightAudit`):** Stepped all plinth courses, battered *nuraghe* rings, *tholos* corbels, *mensoloni* brackets, emerald-nephrite lintels, whale-rib arches, *kaen-doki* crowns, and bespoke furniture parts cleanly so `z-fighting` passes with `0` conflicts across the entire scene.
