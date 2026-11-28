# biomes/compasshills: the API (The Compass Hills)

The multi-station biome kit on `core/biome`'s contract (`BIO.kit('compasshills')`), exporting `window.COMPASS` (`COMPASS` / `COMPASSHILLS`), `window.COMPASS_PHYS` (`COMPASS_PHYS`, `[G data]`), and `window.COMPASS_SITES` (`COMPASS_SITES`, `[G data]`).

A host world or 1:1 `openworld/` region reads its fragments in place (`src/40-biome-compass-phys.js`, `src/41-biome-compass-sites.js`, `src/50-biome-compass-species.js`, `src/60-biome-compass-place.js`, `src/70-biome-compass.js`) and deduplicates shared packed library textures via `matlib_pack.fragment`.

## Showcase stations (`dist/`)

| Station | Build command | Output | `5.1` `(px, py)` & Air | Signature Physics & Ecology (`85%` Earthlike + `15%` Ferromagnetic) |
|---|---|---|---|---|
| **`foundry`** *(default)* | `python3 tools/build.py biomes/compasshills` | `dist/compasshills.html` | `(1058, 224)`, `+876.5 m`, `1.43 atm Cfa` | `Lodestone` toroidal cryo-magnet quench-ring trench, `360°` swirling `compassbush` leaf streamlines around collapsed quench-vents, tangent-steered `Fe3O4` iron-sand ripples, `site:lodestone-arcology` (`superconductor` salvage reserve), and zero-iron nephrite/bronze warning stelae |
| **`tors`** | `python3 tools/build.py biomes/compasshills --station tors` | `dist/compasshills-tors.html` | `(1128, 248)`, `+1,392.3 m`, `1.34 atm Cfa` | `60 m` `banded-ironstone` cuesta escarpment (`iron = 180`, `lodestone = 220`), lightning-struck `lodestonespire` crags (`fx/lightning.js`) laced with glassy fulgurite melt-veins, concentric `fluxlichen` isogauss rings, `ferrotuft` cushions, and tin-bronze quarry wedges |
| **`cuesta`** | `python3 tools/build.py biomes/compasshills --station cuesta` | `dist/compasshills-cuesta.html` | `(1046, 258)`, `+987.6 m`, `1.42 atm Csa` | Dry-summer Mediterranean stone pine, cork oak, *iron-pistache*, *whorl-olive*, and *saffron* dip-slope crossed by a crisp `180°` magnetic domain-wall saddle where `compassbush` leaf bearings flip across `40 m` and splay radially in the zero-`B_horiz` seam |
| **`gorge`** | `python3 tools/build.py biomes/compasshills --station gorge` | `dist/compasshills-gorge.html` | `(1055, 219)`, `+846.7 m`, `1.44 atm Cfa` | `9102` `Hām-Tsēk` (*Web-Cleaver River*, `Q = 1,080 m³/s`) slicing `90 m` dark magnetite palisades with black magnetite-amber (`amber = 120`) placer sandbars, *white mulberry* groves, `site:ham-tsek-post` reserve, and cast tin-bronze ferry bollards |

## Pure `[G data]` physics (`COMPASS_PHYS`, `tests/test-compasshills.js`)

| Call | Returns |
|---|---|
| `fieldAt(x, z, site)` | `{bx, by, bz, bMagMt, bHorizMt, azimuthRad, dipRad, gradB2, inversionSeam01}` (supports station keys & seamless `'world'` 1:1 coordinates) |
| `leafAzimuthAt(x, z, site, jitterU)` | `{bladeYawRad, alignment01, noonShadeGain01, bHorizMt, bMagMt}` (`±12°` alignment where `bHorizMt >= 0.5 mT`; `< 0.20` radial splay inside neutral domain seams) |
| `sandStreamAt(x, z, slope, ironByte, bMagMt, gradB2)` | `{rippleYawRad, streakContrast01, ferroTuftMm}` |
| `ferrousPullAt(x, z, toolIronKg, gradB2, material)` | `{forceN, wrenchTool, pinClimber, safeBronze}` (`> 180 N` on `2 kg` iron within `12 m` of quench-vents; `< 0.05 N` on tin-bronze & nephrite everywhere) |
| `lightningScoreAt({elevM, localProminenceM, ironByte, bMagMt})` | `{strikeProb01, fulgurite01, irmpole01}` |
| `cuestaAspectAt({elevM, nx, nz, rainMmYr, bMagMt, inversionSeam01, riverDistM, quenchTrench01})` | `{moisture01, koppenLocal, pAtm, effTempC, zoneKey}` |

## Species registry (`COMPASS.SPECIES`, `14` species)

- **Signature Ferromagnetic & Cuesta Biota (`6`):** `compassbush`, `ironpistache`, `fluxgrass`, `fluxlichen`, `ferrotuft`, `lodestonespire`.
- **Mediterranean-Continental & Riparian Matrix (`8`):** `stonepine`, `corkoak`, `whorlolive`, `cuestajuniper`, `gorgeplane`, `silkmulberry`, `saffroncrocus`, `macchiasage`.
- **Placement entry point:** `COMPASS.build({station, terrainH, waterH, space, register, quality, seed, R})` -> per-species counts & `earthShare`; populates `COMPASS.PLACED` and `COMPASS.SPIRES`.
