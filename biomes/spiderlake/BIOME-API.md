# biomes/spiderlake: the API (Spider Lake)

The six-station highland-lacustrine biome kit on `core/biome`'s contract (`BIO.kit('spiderlake')`), exporting `window.SPIDERLAKE` (`SPIDERLAKE`), `window.SPIDER_PHYS` (`SPIDER_PHYS`, `[G data]`), `window.SPIDER_SITES` (`SPIDER_SITES`, `[G data]`), and `window.slSilkMath` (`[G data]`, unified with `kits/spider-lake`).

A host world or open-world region reads its fragments in place (`src/40-biome-spider-phys.js`, `src/41-biome-spider-sites.js`, `src/50-biome-spider-species.js`, `src/60-biome-spider-place.js`, `src/70-biome-spider.js`) and deduplicates shared packed textures (`silk.*`, `rock.dolomite`, `rock.porphyry`, `wood.cedar`) via `matlib_pack.fragment`.

## Showcase stations (`dist/`)

| Station | Build command | Output | Elevation & Air | Signature Ecology & Silk Architecture |
|---|---|---|---|---|
| **`spillway`** *(default)* | `python3 tools/build.py biomes/spiderlake` | `dist/spiderlake.html` | `+1,460.0 m -> +1,390 m`, `1.33 atm` | Sole `380 m3/s` lake outlet into `9102` `Ham-Tsek` plunging through `secondary-ejecta` cataracts beneath `170 m` wind-billowing **Golden Cable Bridge-Curtains**, cedar `Silk-Weir` frames & warm alkaline degumming vats |
| **`narrows`** | `python3 tools/build.py biomes/spiderlake --station narrows` | `dist/spiderlake-narrows.html` | `+1,460.0 m`, `1.33 atm` | Emergent dolomite & ejecta island stacks crowned by buttressed `crowncypress` knees and `140-180 m` multi-tier **Bridge-Curtains** (`>= 7.2 m` skiff arches) beside `site:spider-lake-weirs` (*Ham-Spi* reserve) |
| **`pavilion`** | `python3 tools/build.py biomes/spiderlake --station pavilion` | `dist/spiderlake-pavilion.html` | `+1,460..+1,495 m`, `1.33 atm` | Mist-drenched `spindlewillow` and `crowncypress` woods linked canopy-to-canopy by `2-6 m` **Cloud-Fleece Brood-Pavilions** and gossamer sheets, stepped upslope into cut dolomite/porphyry `ambermulberry` terraces |
| **`fen`** | `python3 tools/build.py biomes/spiderlake --station fen` | `dist/spiderlake-fen.html` | `+1,460.0 m`, `1.33 atm` | `640 m3/s` `9106` `Hau-Gel` inflow delta with `+36.8-44.2 C` alkaline carbonate sericin-degumming springs (`>= +0.10 m` above lake), `silkfenpitcher` bogs, submerged **diving-bell air-bell silk domes**, and `300 m` dusk lake-smoke pillars |
| **`dolomite`** | `python3 tools/build.py biomes/spiderlake --station dolomite` | `dist/spiderlake-dolomite.html` | `+1,460..+1,550 m`, `1.33 atm` | Cream `carbonate-shelf` dolomite bluffs sliced by an imperial red-porphyry dike over `tube_ozarks_15`, opening into a walk-in `KCAVERN` + `KSPELEO.CALCITE` + `KCAVERN.cutLayer` celestine-and-calcite crystal grotto |
| **`rampart`** | `python3 tools/build.py biomes/spiderlake --station rampart` | `dist/spiderlake-rampart.html` | `+2,040.0 m`, `1.24 atm` | Unbroken ballistic `secondary-ejecta` boulder-collar sealing `+1,460 m` Spider Lake (south) cleanly from Ria Valley headwaters (north), carpeted in calming `porphyryfern` smudge-ledges and ballooning spiderling gossamer (`0` eusocial colonies) |

## Pure `[G data]` physics (`SPIDER_PHYS`, `tests/test-spiderlake.js`)

| Call | Returns |
|---|---|
| `aerodynamicsAt({elevM, windSpeedMs, threadDiaUm, spanM, anchorHighM, curtainDropM})` | `{pAtm, pO2Atm, rhoKgM3, dragLiftRatio, maxCastSpanM, catenarySagM, boatClearanceM, tensileGPa}` |
| `lakeSmokeAt({shoreDistM, elevAboveLakeM, seepProximity01, hour24, windOnshore01})` | `{midgeFluxGm2Day, pillarHeightM, dielPeak01, eusocialOk, colonyPopCap, webSheetDensity01}` |
| `silkPinWeight(kind, u, v)` | Pin weight `0..1` (`0.000` at all rock/limb/crossbar anchors; ramps smoothly into sheet belly via `slSilkMath`) |
| `displaceSilk(wx, wy, wz, fx, fy, fz, t, windX, windZ, gustAmp, windPreset)` | `[dx, dy, dz]` pure-JS twin of `ATMOS.GLSL_WIND` (`atmWind`) silk vertex displacement |
| `harvestCycleAt({dayMod6, smudgeActive01, humFreqHz, strikingBrood})` | `{dayMod6, sheetThicknessMm, calmSignal01, workersRetreated, reelReady, broodUnharmed, killYield, tabooViolated}` |
| `mvtBrineAt({ventDistM, depthBelowRimM, zincByte, limestoneByte})` | `{tempC, pH, degumSafeOk, scaldCore, celestineSat01}` |

## Species registry (`SPIDERLAKE.SPECIES`, `12` species) & Silk Export Grades

- **Trees (`5`):** `spindlewillow`, `crowncypress` (with emergent knees), `ambermulberry` (`crop: 'mulberry'`), `chinkapinoak`, `porphyrypine`.
- **Littoral, Fen & Cliff Flora (`4`):** `lakesmokesedge`, `silkfenpitcher` (`reagent`), `porphyryfern` (`reagent`), `rampartgossamer`.
- **Colonial Silk Structures (`3`):** `bridgecurtain` (`gather: 'spider-silk-cable'`), `broodpavilion` (`gather: 'spider-silk-fleece'`, canopy domes + littoral air-bells), `weirframe_wild` (`gather: 'spider-silk'`).
- **Placement entry point:** `SPIDERLAKE.build({station, terrainH, waterH, space, register, quality, seed, R, silkBatch})` -> per-species counts; populates `SPIDERLAKE.PLACED` and `SPIDERLAKE.SILK_AUDIT`.
