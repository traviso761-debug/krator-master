# biomes/thedome: the API (The Dome)

The four-station resurgent quartz-porphyry & leucogranite laccolith-dome biome kit on `core/biome`'s contract (`BIO.kit('thedome')`), exporting `window.THEDOME` (`THEDOME`), `window.DOME_PHYS` (`DOME_PHYS`, `[G data]`), `window.DOME_SITES` (`DOME_SITES`, `[G data]`), `window.DOME_FAUNA` (`DOME_FAUNA`, `[G data]`), and `CROPS.BIOMES.thedome` (`[G data]`).

A host world or open-world region reads its fragments in place (`src/15-thedome-phys.js`, `src/22-thedome-crops.js`, `src/24-thedome-fauna.js`, `src/41-biome-dome-sites.js`, `src/50-biome-dome-species.js`, `src/60-biome-dome-place.js`, `src/70-biome-dome.js`) and deduplicates shared packed textures (`rock.*`, `bark.*`, `card.*`) via `matlib_pack.write_sidecar` (`.tex.thedome.js`).

## Showcase stations (`dist/`)

| Station | Build command | Output | Elevation & Air | Signature Landforms, Hydrology & Ecology |
|---|---|---|---|---|
| **`apron`** *(default)* | `python3 tools/build.py biomes/thedome` | `dist/thedome.html` | `+2,268.5 m`, `1.20 atm` (`0.251 atm O2`, `Cfa/Cfb`) | Curved rose-grey quartz-porphyry & leucogranite onion-skin exfoliation apron (`1336, 128`), `3` cantilevered hollow **A-tent lithophone arches** (`65-140 Hz`), `128` perched sky-reflecting **`gnamma` solution pans** (`KBASIN` + `WATER.still`), `gnammamoss` emerald-crimson rims, `panbonsai` contorted pines, radial `KSCOUR` scour flutes, `ringlichen` bullseyes, and Upper Ria acoustic listening dish (`?works=0`) |
| **`moat`** | `python3 tools/build.py biomes/thedome --station moat` | `dist/thedome-moat.html` | `+1,749.1 m`, `1.29 atm` (`0.270 atm O2`, `Cfa`) | Concentric upturned `35-55 deg` ring-dike & carbonate/arkose collar hogback (`KSTACKS` + `KSTRATA` `'ring-dike-collar'` + `KRELIEF.slab`) impounding an annular **Ring-Moat Seepage Fen** (`WATER.still` tannin-amber pools, `moatpitcher` carnivorous sedges, cross-faded `WATER.flow` sheetwash rills, stunted `BIO.kin` cork-oak & willow gallery, `+18 dB` whispering scarp, `site:moat-waystation`) |
| **`crown`** | `python3 tools/build.py biomes/thedome --station crown` | `dist/thedome-crown.html` | `+2,924.8 m`, `1.11 atm` (`0.233 atm O2`, `Cfb`) | Cloud-combing laccolith apex (`1328, 150`) under the stationary lenticular **`ATMOS.fogBelt` ("The Crown-Veil")**, concentric contour-line **`cloudgarlandpine`** treeline ribbons hugging exfoliation step risers (`shellStep01 >= 0.70`), silvery **`crownrosette`** fog-combing cushions, `38` summit `gnamma` sky-mirrors, and `site:dome-observatory` |
| **`cleft`** | `python3 tools/build.py biomes/thedome --station cleft` | `dist/thedome-cleft.html` | `+2,537.7 m`, `1.17 atm` (`0.245 atm O2`, `Cfb`) | Walkable wedged-chockstone descent & bridge inside a `40 m` deep radial unloading tension *Kluft* fissure (`1372, 148`), lined with `KCAVERN` + **`KSPELEO.SMOKY`** (`39b2-core-speleo-cleft.js`) smoky-quartz & chlorite-dusted microcline crystal megaprisms, `KSPELEO.blocks`, `cleftfilmyfern` translucent curtains, and diurnal barometric shimmer wisps |

## Pure `[G data]` physics (`DOME_PHYS`, `tests/test-thedome.js`)

| Call | Returns |
|---|---|
| `inDomeFootprint(pxX, pxY)` | `{inPolygon, inOwnDm, domeRadiusKm, collarMarginKm}` (strict `5.1` `rmweubdnyts8y` & sibling-exclusive `own_dm` envelope) |
| `pressureAt(elevM)` | `{elevM, pAtm, pO2Atm, rhoKgM3, koppen, inCrownVeil}` (`1.29 atm Cfa` moat to `1.11 atm Cfb` apex) |
| `exfoliationAt(x, z, site)` | `{domeRadiusKm, slopeDeg, shellStep01, riserHeightM, hollowGapM, plateSpanM, plateThickM, slickFlute01, shellIndex}` |
| `gnammaAt(x, z, hydroperiod01, site)` | `{inPan, panId, panRadiusM, depthM, sillElevLocalM, waterLevelLocalM, waterDepthM, rimGrit01, desiccationRing01, island01}` (`>= 0.06 m` freeboard below 360 deg rock sill) |
| `barometricAt(x, z, site, hour24)` | `{inCleftZone, deltaPa, baroFlowMs, exhaling, relHumidityPct, aeolianChordHz}` |
| `acousticsAt(x, z, site, hour24)` | `{hollowGapM, hollowBoom01, lithophoneHz, whisperFocusDb, aeolianChordHz}` (`62-148 Hz` flexural A-tent bass, `+18..+22 dB` scarp focus) |
| `canRootFullTree(x, z, hydroperiod01, site)` | `boolean` (`false` across bald exfoliation shell interiors `shellStep01 < 0.55`; `true` on stepped risers, cleft lips, and moat fen) |

## Species registry (`THEDOME.SPECIES`, `7` endemic species + `2` `swlowlands` `BIO.kin`)

- **Trees (`2` endemic + `2` `BIO.kin`):** `cloudgarlandpine` (`BIO.flareJoin`, `crop: 'pinyon'`, `gather: 'resin'`), `panbonsai` (`BIO.flareJoin`, `gather: 'aromatic-needle'`), plus `swlowlands` `corkoak` and `willow` in the Station 2 Ring-Moat gallery.
- **Cushion, Moss, Lichen, Carnivore & Filmy Fern (`5`):** `crownrosette` (`gather: 'reagent'`), `gnammamoss` (`uHydro` hydration shader tint, `gather: 'peat-moss'`), `ringlichen` (`gather: 'dye-ochre'`), `moatpitcher` (`KTRAPS.make` passive pitfall, `gather: 'reagent'`), `cleftfilmyfern` (`gather: 'reagent'`).
- **Endemic Fauna (`DOME_FAUNA.SPECIES`, `6` species):** `gnammatriops` (drought-cyst tadpole shrimp), `atentgecko`, `garlandtragopan`, `slabklipspringer`, `moatnewt`, `cleftswift`.
- **Crops (`CROPS.BIOMES.thedome`):** `65` verified open-air crops + `2` radial-*Kluft* `dark-beds` fungus fits = `67` total verified crops (`CROPS.forBiome('thedome', {works: ['dark-beds']})`).
- **Hazards (`KHAZ`):** `dome:slickslab` (`slip`), `dome:spall` (`crush`), `dome:quagmire` (`sink`), `dome:cleftdrop` (`fall`).
- **Placement entry point:** `THEDOME.build({station, terrainH, waterH, space, register, quality, seed, R, hydroperiod01})` -> per-species counts; populates `THEDOME.PLACED` and registers `KTAGS` resource nodes (`node:quartz`, `node:feldspar`, `node:porphyry-slab`, `node:spring-water`, `node:bog-peat`).
