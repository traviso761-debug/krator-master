# biomes/crook: the API (The Crook)

The multi-station biome kit on `core/biome`'s contract (`BIO.kit('crook')`), exporting `window.CROOK` (`CROOK`), `window.CROOK_PHYS` (`CROOK_PHYS`, `[G data]`), and `window.CROOK_SITES` (`CROOK_SITES`, `[G data]`).

A host world or open-world region reads its fragments in place (`src/40-biome-crook-phys.js`, `src/41-biome-crook-sites.js`, `src/50-biome-crook-species.js`, `src/60-biome-crook-place.js`, `src/70-biome-crook.js`) and deduplicates shared packed textures via `matlib_pack.fragment`.

## Showcase stations (`dist/`)

| Station | Build command | Output | Elevation & Air | Signature Ecology (`85-90%` Earthlike + `10-15%` Weirdness) |
|---|---|---|---|---|
| **`shore`** *(default)* | `python3 tools/build.py biomes/crook` | `dist/crook.html` | `0 - +950 m`, `1.60-1.46 atm` | Drowned ejecta-caldera basalt collar, `< +65 m` tsunami-scoured columnar basalt benches with **lithistid chimney- & cushion-sponges**, and `>= +65 m` Sitka spruce, redcedar, *benihi* red-cypress, bigleaf maple & tree-fern cloud-forest carrying **celadon & amber spongin canopy cup- & beard-sponges** |
| **`wash`** | `python3 tools/build.py biomes/crook --station wash` | `dist/crook-wash.html` | `+950 - +2,800 m`, `1.20 atm` | Incised V-gorge *benihi* red-cypress, silver fir & rhododendron forest with **metallic-scale skarn-cedars** and **porcelain-margin jade-ferns**, **16 monotone-stepped terracotta/ochre/celadon rimstone pools**, **wind-tuned chambered bamboo/horsetail brakes**, and sunny `Csa`/`Dsb` rain-shadow aspect split |
| **`head`** | `python3 tools/build.py biomes/crook --station head` | `dist/crook-head.html` | `+1,800 - +6,000 m`, `1.07 atm` | Subalpine krummholz larch & moraine tarn country with **malachite-teal & rust-ochre mineral-rind cushion-heaths**, **spun frost-glass silica sedges**, **48 thermogenic `+15 degC` hearth-ring rosettes** melting `1-2 m` circular snow wells ringed by **cryo-snow algae**, and **bone-white wind-fluted alpine seed-chimneys** crossing the `Silent Vales` Great Hush threshold |

## Pure `[G data]` physics (`CROOK_PHYS`, `tests/test-crook.js`)

| Call | Returns |
|---|---|
| `sprayTrimAt({elevM, coastDistKm, wnwExposure01, calderaShelter01, silicaByte, drawdownM})` | `{trimElevM, safeTownElevM, sprayMist01, fogBelt01, ostiaOpen01, basaltSpongeOk, canopySpongeOk, woodyOk}` |
| `talwegSeepAt({elevM, slope, talwegDistM, qLocalM3s, incision01, rainMm})` | `{soilWet01, gorgeMist01, cascadeSpray01, seepDischarge01, floodScour01}` |
| `aspectClimateAt({elevM, nx, nz, rainMm, leeShelter01, gorgeMist01})` | `{sunny01, effTempC, effRainMm, pAtm, zoneBand, snowPackM}` |
| `biomineralAt({jadeByte, skarnByte, ironByte, copperByte, tinByte, seepDischarge01, incision01, slope})` | `{skarnSeep01, silicaGlaze01, rustScale01, malachiteRind01, nephriteFloat01}` |
| `rimstoneAt({x, z, baseElevM, topElevM, slope, seepDischarge01, ironByte, jadeByte, seed})` | `{active, stepIndex, poolLevelM, lipHeightM, rimWidthM, stainPalette}` |
| `aeroResonanceAt({culmDiaM, chamberLenM, apertureDiaM, pAtm, windSpeedMs, hushSuppression01})` | `{f0Hz, harmonicHz, splDb, audible01, pollinatorReachM}` |
| `thermogenicWellAt({tAirC, snowPackM, starchReserve01, colonyRadiusM, peatByte})` | `{coreTempC, deltaTC, meltWellRadiusM, WellDiameterM, bareApronM, steamWisp01}` |
| `hushAt({x, z, passLineX, passNormalXZ, bandWidthM})` | `{signedDistM, suppression01, bellHarmonicPass01, visualWindScale}` |

## Species registry (`CROOK.SPECIES`, `24` species)

- **Montane & Coastal Matrix (`10`):** `coastspruce`, `westernredcedar`, `redcypress`, `bigleafmaple`, `silverfir`, `gorgerhodo`, `cloudtreefern`, `devilsclub`, `furlarch`, `morainesedge`.
- **`Crookshore` Sponges (`4`):** `basaltchimney`, `spraycushion`, `canopycup`, `spongebeard`.
- **`Crookwash` Skarn, Rimstone & Resonant Brakes (`5`):** `rustcedar`, `skarnfern`, `jadeequisetum`, `rimstonemoss`, `chamberbamboo`.
- **`Crookhead` Metallophytes, Hearth-Rings & Pass Chimneys (`5`):** `malachitecushion`, `frostsedge`, `hearthring`, `cryosnow`, `seedchimney`.
- **Placement entry point:** `CROOK.build({station, terrainH, waterH, space, register, quality, seed, R})` -> per-species counts; populates `CROOK.PLACED`.
