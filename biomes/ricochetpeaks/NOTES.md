# `biomes/ricochetpeaks` — Notes

- **Inverted Bowl Treeline (`RICOCHET_PHYS.bowlTreelineAt`):** Nighttime katabatic cold-air drainage pools on unheated crater bottoms (`frost_hollow_sedge`), pushing the dense `crater_spruce`, `shatter_larch`, and `ejecta_birch` forest up onto the `+6..+95 m` lower talus apron and central rebound peak islands, before transitioning to `BIO.kin` krummholz toward the outer crater rims.
- **Hydrothermal `snowBare` Oasis (`vents` & `highbowl`):** `RICOCHET_PHYS.snowBareMask` feeds `ATMOS.snowBare` (`fx/89-atmos-fx-snowcover.js`) so snow melts cleanly around East Hearth's `6` boiling fumaroles and Old Rim's `5` Erebus steam-ice chimneys.
- **Sampler Headroom:** `MAT_GROUND` uses `KGROUND` `array: true` (`<= 3` layers per station), keeping ground texture units `< 13` even with `KSTRATA`, `KHORIZON` ring-shadow, `ATMOS.cloudShadeScene`, and `ATMOS.snowBare`.
