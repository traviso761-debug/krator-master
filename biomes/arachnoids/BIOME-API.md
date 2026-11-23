# biomes/arachnoids: the API (Arachnoid Canyons)

The four-station biome kit on `core/biome`'s contract (`BIO.kit('arachnoids')`), exporting `window.ARACHNOIDS` (`ARACHNOIDS`), `window.ARACH_PHYS` (`ARACH_PHYS`, `[G data]`), and `window.ARACH_SITES` (`ARACH_SITES`, `[G data]`).

Strictly scoped to **Core `Arachnoid Canyons` Proper** (`own = rmvarachnoids & ~all_other_biomes` = `111,952 km²` / `27,988` cells, `X = 864..1340, Y = 243..427`, `+847–5,845 m`, incised by trunk river `9102` *Hām-Tsēk*). Neighboring overlap belts (such as `(1055, 219)` in `Compass Hills` `rmweu4kpowzji` and `(1272, 193)` in `Spider Lake`) are explicitly excluded (`ARACH_SITES.inOwnPolygon(1055, 219) === false`).

A host world or open-world region reads its fragments in place (`src/40-biome-arach-phys.js`, `src/41-biome-arach-sites.js`, `src/50-biome-arach-species.js`, `src/60-biome-arach-place.js`, `src/70-biome-arachnoids.js`) and deduplicates shared packed textures via `matlib_pack.fragment`.

## Showcase stations (`dist/`, `100%` verified inside `own`)

| Station | Build command | Output | `5.1` `(px, py)` & Air | Signature Geomorphology & Ecology |
|---|---|---|---|---|
| **`nexus`** *(default)* | `python3 tools/build.py biomes/arachnoids` | `dist/arachnoids.html` | `(998, 290)`, `+660.6 m`, `1.47 atm`, `Cfa` | Radial 3-spoke `arch-rift-basalt` dike star-junction breached by `9102` *Hām-Tsēk* (`1,295 m³/s`), `35–85 m` catenary *Tsēk-Mā* communal **Bridge-Webs** swaying on `ATMOS`, `KSPELEO.HYPOGENE` `saltpeter = 200` overhangs, and `site:hum-webgate` |
| **`fumarole`** | `python3 tools/build.py biomes/arachnoids --station fumarole` | `dist/arachnoids-fumarole.html` | `(1097, 331)`, `+912.6 m`, `1.43 atm`, `+28 °C` `Cfa` | Inverted warm hydrothermal cauldron trough, 9 monotone turquoise basalt-weir step-pools, `KTHERM` `+68 °C` fumaroles, `fumarolefern` & `sintermat` gardens, and `tin`/`gold` river placers |
| **`ledges`** | `python3 tools/build.py biomes/arachnoids --station ledges` | `dist/arachnoids-ledges.html` | `(984, 283)`, `+1,629.0 m`, `1.31 atm`, `Csa` | `KRELIEF.slab` horizontal basalt colonnade & `outland-tuff` benches, root-clawed `columnarpine` & `ledgeoak` woods, cliff-clinging `dikeclaw` & `webanchorvine`, and a walkable `KSPELEO.SMOKY` smoky-quartz *Kluft* |
| **`frostrim`** | `python3 tools/build.py biomes/arachnoids --station frostrim` | `dist/arachnoids-frostrim.html` | `(919, 281)`, `+4,784.3 m`, `0.88 atm`, `ET` `-2 °C` | `KFROST` sorted polygonal stone rings, standing jet-black obsidian-vitrophyre dike hogbacks, `frostcushion` domes, and horizontal `rimkrummholz` banners sheared radially away from rising canyon updrafts |

## Pure `[G data]` physics (`ARACH_PHYS`, `tests/test-arachnoids.js`)

| Call | Returns |
|---|---|
| `ARACH_SITES.inOwnPolygon(px, py)` | `boolean` (`true` strictly inside Core `own`; `false` on neighboring overlap polygons) |
| `fissureNetAt(x, z, site)` | `{ringDistM, spokeDistM, slotWidthM, dikeHeightM, nexusScore01, vitrophyre01, lipAzimuthRad, lipNx, lipNz}` |
| `inversionAt(x, z, y, site)` | `{tempC, rh01, mistDensity01, updraftMs, frost01, skyView01, pAtm, aslM, zoneBand}` |
| `webSpanAt(anchorA, anchorB, gKrator, opt)` | `{spanM, sagM, sag1gM, sagRatio01, tensionN, tierCount, lowestY, clearAboveWaterM, anchorGapMaxM, validSpan}` |
| `silkPinWeight(kind, u, v)` & `displaceSilk(...)` | `0.000 m` rock-wall anchor pin weight (`u=0, 1`) and deterministic `ATMOS` sway mirror |
| `fumaroleAt(x, z, site)` | `{groundTempC, steam01, sinterRim01, sulfurCrust01, hazardScald}` |
| `krummholzShearAt(x, z, site)` | `{updraftMs, pAtm, shear01, prostrateH, bannerLenM, yawRad, flaggedOk}` |

## Species registry (`ARACHNOIDS.SPECIES`, `11` species + `bridgeweb`)

- **Signature Arachnoid Canyons Guilds (`7`):** `fumarolefern`, `sintermat`, `dikeclaw`, `webanchorvine`, `columnarpine`, `rimkrummholz`, `frostcushion`.
- **Montane-Gorge Vascular Matrix (`4`):** `gorgehemlock`, `ledgeoak`, `canyonbamboo`, `alpinesedge`.
- **Placement entry point:** `ARACHNOIDS.build({station, terrainH, waterH, space, register, webBatch, quality, seed, R})` -> per-species counts; populates `ARACHNOIDS.PLACED` and `ARACHNOIDS.WEB_SPANS`.
