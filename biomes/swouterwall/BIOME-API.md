# biomes/swouterwall — BIOME-API

The **South-Western Outer Wall** biome kit (`SWOW`, `BIO.kit('swouterwall')`) covers Scale-Model 5.1 polygon `rmwvsqhhqyk3f` (including the annealed northern `Region 177` boreal-to-alpine lake ramp `rmwzq42zszc94`) and **Trigemini Pass** (`rmwvsmgi8xrro`).

## Exported globals

### Pure `[G data]` modules (Node-testable, zero THREE / DOM)

- `SWOW_PHYS` (`src/15-swow-phys.js`):
  - `pressureAt(elevM)` -> barometric pressure in `atm` (`1.10 atm` at `+3,040 m`, `0.76 atm` at `+5,680 m`, `0.600 atm` at `HYPOXIA_CEILING_M ~ +6,465 m`).
  - `transectAt(py51, elevM)` -> `{pressureAtm, veilSpill01, precipMmYr, twC, tcC, meanC, koppen, belt, hypoxic, lethalHypoxia}`.
  - `iceShareAt(elevM, winter01, katabaticScour01)` -> `0..1` lake ice share (leaving an open katabatic lead on `+5,680 m` Trigemini Tarn).
  - `frostAt(elevM, slopeGrad, wet01)` -> `{permafrost01, sortedRings01, solifluction01, aufeis01, moraineFlour01}`.
  - `lungcushionAt(elevM, sun01, wind01)` -> `{viable, ambientPAtm, deltaTC, internalO2Pct, effectivePAtm, relievesHypoxia}`.
  - `sunbloodViableAt(elevM, rock01)` -> `{viable, pressureAtm, uvFluxRel, hematiteShield01}` (survives down to `0.58 atm`).
  - `hazardSpec(kindKey)` -> `KHAZ.make`-compatible hazard record for `'quakingbog'`, `'thinice'`, `'rockfall'`, or `'hypoxiaceiling'`.
- `SWOW_SITES` (`src/15-swow-phys.js`): station definitions for `'boreallakes'`, `'morainetarn'`, `'trigemini'`, and `'breathvale'`.
- `SWOW_CROPS` (`src/22-swow-crops.js`): registers `CROPS.BIOMES.swouterwall` (`borealfen`, `moraine`, `trigemini`, `hypoxicvale`).
- `SWOW_FAUNA` (`src/24-swow-fauna.js`): 6 species (`boreal_loon`, `tarn_char`, `fen_beaver`, `thinair_ibex`, `cushion_pika`, `ice_midge_swarm`) with 24-hour `scheduleOf(key, hour)` and `forStation(stationId, pAtm)`.

### Biome kit (`SWOW`, `src/50-swow-species.js` .. `src/70-swow.js`)

- `SWOW.SPECIES`: 8 native species (`paternoster_spruce`, `quaking_sphagnum`, `moraine_birch`, `lungcushion`, `glassbell`, `ice_waterweed`, `sunblood_crust`, `bog_rosemary_sw`), each carrying `tags` (`climate`, `aridity`, `abyssal`, `riparian`, `koppen`, `zone`, `harvest`).
- `SWOW.builders`: kit builders for `BIO.kin('swouterwall.<key>')` (`paternoster_spruce`, `moraine_birch`, `lungcushion`).
- `SWOW.placeAll(opt)` / `SWOW.build(opt)`: deterministic `KRAND.cell` placement across any of the 4 stations (`opt = {station, quality, R, seed, kin, terrainH, waterH, space, register}`), populating `SWOW.PLACED` and `SWOW.CROWNS`.
- `SWOW.gatherOf(Z)` -> `{pasture, fish, salt: false}` for `core/hamlet`.
- `BIO.kin` partners read in place: `biomes/nwouterwall` (`furlarch`, `pinemat`, `cottongrass`, `woolwillow`, `crowberry`) and `biomes/copperglacier` (`cushion`, `lichen`), bridged with `0.00 m` stem-snapped builders in `src/47z-host-kin.js`.
