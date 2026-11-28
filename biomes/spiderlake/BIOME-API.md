# biomes/spiderlake: the API (Spider Lake)

The seven-station highland-lacustrine & Carnelian Frontier (`30% Red · Tier 1–2`) biome kit on `core/biome`'s contract (`BIO.kit('spiderlake')`), exporting `window.SPIDERLAKE` (`SPIDERLAKE`), `window.SPIDER_PHYS` (`SPIDER_PHYS`, `[G data]`), `window.SPIDER_SITES` (`SPIDER_SITES`, `[G data]`), and `window.slSilkMath` (`[G data]`, unified with `kits/spider-lake`).

A host world or open-world region reads its fragments in place (`src/40-biome-spider-phys.js`, `src/41-biome-spider-sites.js`, `src/50-biome-spider-species.js`, `src/60-biome-spider-place.js`, `src/70-biome-spider.js`) and deduplicates shared packed textures (`silk.*`, `rock.dolomite`, `rock.porphyry`, `wood.cedar`) via `matlib_pack.fragment`.

## Showcase stations (`dist/`)

| Station | Build command | Output | Elevation & Air | Signature Ecology, Carnelian Frontier & Silk Architecture |
|---|---|---|---|---|
| **`spillway`** *(default)* | `python3 tools/build.py biomes/spiderlake` | `dist/spiderlake.html` | `+1,460.0 m -> +1,390 m`, `1.33 atm` | Sole `380 m3/s` lake outlet into `9102` `Ham-Tsek` plunging through `secondary-ejecta` cataracts beneath `170 m` **Golden Cable Bridge-Curtains**, smudge-myrtle & indigo terraces, degumming vats & dry stack Carnelian relicts |
| **`narrows`** | `python3 tools/build.py biomes/spiderlake --station narrows` | `dist/spiderlake-narrows.html` | `+1,460.0 m`, `1.33 atm` | Emergent dolomite & ejecta island stacks crowned by `crowncypress` knees, `dolomitebamboo` & `140-180 m` multi-tier **Bridge-Curtains** (`>= 7.2 m` skiff arches) beside `site:spider-lake-weirs` (*Ham-Spi* reserve) |
| **`pavilion`** | `python3 tools/build.py biomes/spiderlake --station pavilion` | `dist/spiderlake-pavilion.html` | `+1,460..+1,495 m`, `1.33 atm` | Mist-drenched `spindlewillow`, `crowncypress` & `weepingliquidambar` woods linked by `2-6 m` **Cloud-Fleece Brood-Pavilions** above `lakelotus` coves and cut-stone `ambermulberry`, `silkbogmyrtle`, `dyersindigo` & `grottocamellia` terraces |
| **`fen`** | `python3 tools/build.py biomes/spiderlake --station fen` | `dist/spiderlake-fen.html` | `+1,460.0 m`, `1.33 atm` | `640 m3/s` `9106` `Hau-Gel` inflow delta with `+36.8-44.2 C` alkaline sericin-degumming springs (`>= +0.10 m` above lake), `lakelotus`, `nurserywildrice`, `silkfenpitcher` & `fensundew` mats, **diving-bell air-bell domes** & `300 m` midge pillars |
| **`dolomite`** | `python3 tools/build.py biomes/spiderlake --station dolomite` | `dist/spiderlake-dolomite.html` | `+1,460..+1,550 m`, `1.33 atm` | Cream `carbonate-shelf` dolomite bluffs with `dolomitebamboo` & `grottocamellia` mist-tea bushes sliced by an imperial red-porphyry dike over `tube_ozarks_15`, opening into a walk-in `KSPELEO.CALCITE` celestine-and-calcite grotto |
| **`rampart`** | `python3 tools/build.py biomes/spiderlake --station rampart` | `dist/spiderlake-rampart.html` | `+2,040.0 m`, `1.24 atm` | Unbroken ballistic `secondary-ejecta` boulder-collar sealing Spider Lake from Ria Valley headwaters (`0` open water, `0` eusocial colonies), holding edaphic Carnelian `agate_window`, `erythra_veil` & `carnelian_organpipe` relicts + `bleachfireweed` |
| **`haugel`** | `python3 tools/build.py biomes/spiderlake --station haugel` | `dist/spiderlake-haugel.html` | `+1,460..+1,505 m`, `1.33 atm` | `585 m3/s` NE `9106` `Hau-Gel` inflow gorge & scalding sinter terrace where **all `5` Carnelian clades** hold dry `secondary-ejecta` walls above green `ambermulberry` benches + an orbital **Bleach-Scar** seam with petrified skeletons |

## Pure `[G data]` physics (`SPIDER_PHYS`, `tests/test-spiderlake.js`)

| Call | Returns |
|---|---|
| `aerodynamicsAt({elevM, windSpeedMs, threadDiaUm, spanM, anchorHighM, curtainDropM})` | `{pAtm, pO2Atm, rhoKgM3, dragLiftRatio, maxCastSpanM, catenarySagM, boatClearanceM, tensileGPa}` |
| `lakeSmokeAt({shoreDistM, elevAboveLakeM, seepProximity01, hour24, windOnshore01})` | `{midgeFluxGm2Day, pillarHeightM, dielPeak01, eusocialOk, colonyPopCap, webSheetDensity01}` |
| `silkPinWeight(kind, u, v)` | Pin weight `0..1` (`0.000` at all rock/limb/crossbar anchors; ramps smoothly into sheet belly via `slSilkMath`) |
| `displaceSilk(wx, wy, wz, fx, fy, fz, t, windX, windZ, gustAmp, windPreset)` | `[dx, dy, dz]` pure-JS twin of `ATMOS.GLSL_WIND` (`atmWind`) silk vertex displacement |
| `harvestCycleAt({dayMod6, smudgeActive01, humFreqHz, strikingBrood})` | `{dayMod6, sheetThicknessMm, calmSignal01, workersRetreated, reelReady, broodUnharmed, killYield, tabooViolated}` |
| `mvtBrineAt({ventDistM, depthBelowRimM, zincByte, limestoneByte})` | `{tempC, pH, degumSafeOk, scaldCore, celestineSat01}` |
| `frontierAt({station, x, y, z, rock01, slope01, wet01, swath, seed})` | `{biosphere, redDominance01, bleachScar01, stranglerEdge01, skeleton01, vanguard01, band}` |

## Species registry (`SPIDERLAKE.SPECIES`, `27` species) & Silk Export Grades

- **Trees & Bamboo (`7`):** `spindlewillow`, `crowncypress` (emergent knees), `ambermulberry` (`crop: 'mulberry'`), `weepingliquidambar` (`bark.amber` + `card.samara.maple`), `chinkapinoak`, `porphyrypine`, `dolomitebamboo` (`bark.bamboo.jade` + `card.grass.panic`).
- **Hum-Ria, Warm-Seep, Karst & Vanguard Flora (`11`):** `silkbogmyrtle` (canonical smudge-myrtle), `lakelotus` (`crop: 'lotus-root'`), `nurserywildrice` (`crop: 'wild-rice'`), `dyersindigo` (`crop: 'indigo'`), `grottocamellia` (`crop: 'tea'`), `lakesmokesedge`, `silkfenpitcher` (`reagent`), `fensundew` (`reagent`), `porphyryfern` (`reagent`), `shorespiderlily`, `bleachfireweed`.
- **Pre-Terraforming Carnelian *Erythrophyll* Clades (`5`, `core/frontier`):** `carnelian_organpipe` (+ `petrified` Bleach-Scar skeletons), `erythra_veil`, `bladder_tether`, `agate_window`, `blood_strangler`.
- **Colonial Silk Structures (`4`):** `bridgecurtain` (`gather: 'spider-silk-cable'`), `broodpavilion` (`gather: 'spider-silk-fleece'`, canopy domes + littoral air-bells), `weirframe_wild` (`gather: 'spider-silk'`), `rampartgossamer`.
- **Placement entry point:** `SPIDERLAKE.build({station, terrainH, waterH, space, register, quality, seed, R, silkBatch})` -> per-species counts; populates `SPIDERLAKE.PLACED` and `SPIDERLAKE.SILK_AUDIT`.
