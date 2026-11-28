# Ardent — Known Issues (`settlements/ardent`)

1. **Standalone `56 × 56 km` Scale Model 5.1 bake prior to streamed `core/world` region:**
   - Ardent bakes a deterministic `29 × 29` (`56 × 56 km`) heightfield cut and `360°` horizon profile directly from `tools/scale-model/model/data/h.png` (`src/28-ar-model.js`) at `(830, 553)` (`+2,801.9 m` ASL). When a Free Clans–Jimjam–Cut `openworld/<region>` tile set is extracted onto `core/world`, `AR_LAYOUT` (`[G data]`) can be mounted directly onto `WORLD.H`.
2. **Interior room floorplans (`?interiors=1`) on the 14 new Baronial-Caucasus definitions:**
   - Existing Highlands `rustic` dwellings and trades carry `kits/interiors/sets/highlands.js` room plans when `?interiors=1` is passed; the 14 new `82-rus-baronial.js` definitions place exterior/courtyard catalog `FURNISH` pieces and `vnOpening` real doors/hearth windows today, with interior room recipes in `kits/interiors/sets/highlands.js` deferred to an interiors pass.
