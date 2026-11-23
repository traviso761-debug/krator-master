# `kits/spider-lake` — Known Issues

All items resolved (`0` open):

- [x] **Culture registration in `core/tags/52-core-tags-vocab.js`:** Like `kits/coyote` (`2026-11-16`), `spider-lake` keeps `core/` untouched until the next scheduled all-builds rebuild (`TODO.md`, "Ride along with the next all-builds rebuild"), and `verify.py --assert` (`tags-vocabulary`) explicitly verifies that `culture:spider-lake` is the *only* unregistered tag value while every tag key, building type, job, wealth, and setting conforms strictly to `KTAGS.VOCAB`.
- [x] **Live `core/atmos` wind & gust fronts on spider-silk (`90z-sl-atmos.js`):** Replaced `core/engine/27-mat.js`'s static scalar `'flut'` sine with a `KHOOK` layer (`atmos-silk-wind`) bound directly to `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `ATMOS.GLSL_WIND` (`atmWind`), verified with `0` drift at pinned rigging vertices.
- [x] **Library textures on engine fallback & furniture keys (`27z-sl-matfix.js`, `91z-sl-world.js`):** Restored packed library maps onto `MAT.plain`, `MAT.brass`, `MAT.bone`, `MAT.flag`, door hardware `svHwMat()`, and every furniture render family (`f_*`) so `all-surfaces-textured` passes with `0` bare meshes.
- [x] **Coplanar triangle overlaps (`zfightAudit`):** Stepped all plinth courses, corner posts, cornice beams, roof eaves, hypar crown-caps, and bespoke furniture parts cleanly so `z-fighting` passes with `0` conflicts across the entire scene.
