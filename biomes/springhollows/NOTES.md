# biomes/springhollows — Design & Vertical-Stack Notes

- **Native Vertical-Stack Graphics (`src/46-sh-vstack.js`):**
  - **Sidecar Texture Pack:** `build.py` emits `dist/springhollows.tex.springhollows.js` via `matlib_pack.write_sidecar(..., prune=False)` so all four `.html` station pages stay `< 2.0 MB` (`~1.25 MB` each).
  - **`B4` Cut-out Fringe Dilation without `getImageData`:** Uses deterministic two-canvas Porter-Duff `destination-in` compositing (`alpha >= 2/255 < 0.02` A2C threshold) to fill transparent card texels with neighbor & sheet mean opaque RGB, preventing dark mipmap halos while keeping `getImageData` strictly `0`.
  - **`M1/M2` Specular Anti-Aliasing:** Injects `KMAT_M1.GLSL_COMMON` (`km1RoughAA`) via `KHOOK` onto wet polished purple-red rhyolite porphyry, banded cave-onyx, pale-blue celestine megabeams, and honey calcite druse.
  - **Sampler Budget (`<= 13`):** Each station uses `3` height-blended `KGROUND` layers (`h: {from: 'lum', contrast: 1.65}`), keeping `MAT_GROUND` well below the `15` warning gate even with `KSTRATA`, `KHORIZON`, and `ATMOS`.
- **`KDRAWN` Surface & Walk-In Cavern Clearance:**
  - Surface `GROUND` triangles inside `C.holeAt(x, z)` are cleanly removed on cavern stations (`spring`, `fenestre`, `glade`), and `SURF_DRAWN_SRC.h(x, z)` returns `null` inside `C.holeAt(x, z)` so `CAVERN` floor sources registered via `KCAVERN.floorFn` + `KDRAWN.add` govern `DRAWN_H(x, z)` through every walk-in cave mouth and collapse skylight.
