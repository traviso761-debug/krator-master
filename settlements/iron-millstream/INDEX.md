# settlements/iron-millstream — fragment index

Built by `python3 tools/build.py settlements/iron-millstream` into `dist/iron-millstream.html` (plus `dist/iron-millstream.tex.js`). Reads `kits/highlands` (`culture_files('republican', 'rustic')`), `kits/ancients` runtime, `kits/iziz-vernacular` helpers, `kits/resources`, `biomes/nhighlands`, and shared `core/` modules in place.

| Fragment | Tag | Role |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML5 head, `#errs` overlay, Three.js r128 script tag |
| `src/28-im-model.js` | `[G data]` | Generated Scale Model 5.1 `25 × 25 px` (`50 × 50 km`) elevation cut around Roketstad `(632, 716)`, `r201` *Snou Bruk* profile & `geology.json` |
| `src/30-im-ground.js` | `[G data]` | `IM_GROUND`: bicubic 5.1 ground + carved *Snou Bruk* gorge, impounded weir pond, 4 stepped mill-benches, leat shelves & `KDRAWN` grids (`4 m` near, `320 m` far) |
| `src/32-im-layout.js` | `[G data]` | `IM_LAYOUT`: monotonic *Snou Bruk* & 4-tier mill-leat polylines, 7 hydropower works, `KCITY` cantonal street, `KHAMLET` magnetite/charcoal hamlet, bridges & `RES_ORE` |
| `src/34-im-rules.js` | `[G data]` | `IM_RULES`: monotonic head drop, wheel-to-water contact, dry-hall river clearance, OBB overlap, Slavic-only check & `KTAGS` registration |
| `src/45-im-stage.js` | `[web]` | `IM_STAGE`: WebGL renderer/lights, `KMASK.canvas` cobble road/yard field, and `8×8`-tiled near (`4 m`) + far (`320 m`) terrain meshes |
| `src/82-im-bridges.js` | `[draw]` | `IM_BRIDGES`: `VERN.def` builders for arched granite gorge bridge (`im_gorge_bridge`), magnetite adit (`im_iron_adit`), charcoal clamp (`im_charcoal_yard`), and masonry leat revetments |
| `src/89z-im-sky.js` | `[web]` | `SKY`: `ATMOS.skyBiome` & `ATMOS.bindHost` at `(632, 716)`, `+2,949.6 m ASL`, `1.107 atm` |
| `src/89zp-im-place.js` | `[draw]` | `IM_PLACE`: `KTAGS` registration, `VERN.place` (`noRace: true, dryFlume: true`), live `WATER` (`flow`, `fall`, `still`, `open`/`shore`, `join`), `kbake`, `KWALK`, `KDOORHOST` & `NHL` flora |
| `src/99-im-host.js` | `[web]` | `VIEWS` (9 camera presets), `hostChecks`, `hostNegatives`, and `KHOST.take` |
| `src/99-tail.html` | `[web]` | Closing `</script></body></html>` |
