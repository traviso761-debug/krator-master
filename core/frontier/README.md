# `core/frontier` (`KFRONTIER`)

Shared engine-neutral `[G data]` rules (`18-core-frontier.js`) and `[draw]` / `[G shader]` visual builders (`52-core-frontier-draw.js`) for the **SW→NE Carnelian Ecological Frontier & Rogue Ecoforming Gradient** ([`docs/CARNELIAN-FRONTIER-PLAN.md`](../../docs/CARNELIAN-FRONTIER-PLAN.md)):

- **`18-core-frontier.js` (`[G data]`):** *Erythrophyll* (`605–710 nm`) reflectance palette & green-exclusion check (`isErythrophyllHex`), deterministic 4-axis Crazy-Quilt partition law (`quiltAt`), orbital Bleach-Scar & `Kill-Line` tri-band cross-sections (`bleachSwathAt`), `45 m` `ecof_soil_auger` lime-phosphate oases (`augerDiscAt`), topographic `ecof_mist_pylon` defoliant pooling (`mistInversionAt`), and 24-hour schedules + `KHAZ` bindings for all four autonomous rogue ecoforming machines.
- **`52-core-frontier-draw.js` (`[draw]`):** Subsurface carnelian back-translucency hook (`erythrophyllHook`), instanced `BIO` builders for all five non-botanical chitin-silica / pneumatic Carnelian clades (`carnelian-organpipe`, `erythra-veil`, `bladder-kelp-land`, `agate-window`, `blood-strangler`) plus petrified white Bleach-Scar skeletons, and `KTAGS`-first PBR 3D builders (`placeMachine`) for `ecof_mist_pylon`, `ecof_soil_auger`, `ecof_swath_burner`, and `ecof_canister_train`.

Test: `node core/frontier/test-frontier.js`
