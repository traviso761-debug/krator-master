# `settlements/mirabilis` — Known Issues & Ride-Along Notes

1. **Open-World Region Integration (`openworld/wouterwall`):**
   - `settlements/mirabilis` bakes a `40 × 40` pixel (`80 × 80 km`) Scale Model 5.1 neighborhood (`src/39e-mb-model.js`) centered on `[350.0, 725.6]` (`Mirabilis` `350, 726` and `Yūt-Mā` `r227`). When the full streamed `openworld/` Western Outer Wall region is cut with `tools/scale-model/extract_region.py`, `MB_CITY`'s `[G data]` multi-kit ward plan and `kits/hayrant` bundles can be mounted directly onto `core/world` (`88s-world-sites.js`).
2. **Citizen Figures (`core/charactermodels`):**
   - Like `settlements/isle-demo` (`59-isle-citizens.js`), street walkers currently use lightweight instanced stand-ins colored by Hayrant madder-plaid, Eternian celadon-robe, and Kuran fur-and-jade roles until `core/charactermodels` ships its low-cost settlement crowd batcher.
