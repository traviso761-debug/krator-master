# `biomes/ricochetpeaks` — The Ricochet Peaks Boreal Crater-Archipelago

Scale Model `5.1` biome polygon **`Ricochet Peaks`** (`rmwvsvyf1iqzg`, `251,564 km²`): a `12`-crater oblique skipping-stone secondary-ejecta chain gouged into the `9–15.5 km` southern cordillera between the `Yuni Emirate`, `Oidong Valley`, `High Rift`, and `Siphon Pits`. Towering `5–9 km` snow-crowned crater walls funnel `3x` exterior moisture into habitable `+2,720–+3,820 m` (`0.98–1.15 atm`, `Dfb`/`Dfc`) boreal crater-lakes, hydrothermal hot-spring oases, jet-black `tagamite` impact-melt sheets, and `+5,100 m` `ET` Erebus steam-ice chimneys.

## Stations (`5` pages)

| Station | Page | `5.1` Pixel & Elev | Highlights |
|---|---|---|---|
| `ringlake` *(default)* | `dist/ricochetpeaks.html` | `1205, 1482` (`+3,250 m`, `Dfb`) | Forested central rebound peak island, annular sapphire moat-lake (`WATER.open`), shatter-cone tors (`KSTACKS`), `site:yuni-pioneer-homestead` & curved Yuni adobe + Gaudi-mosaic + snow-shingle shrine |
| `notch` | `dist/ricochetpeaks-notch.html` | `1285, 1508` (`+3,820 m`, `Dfc`) | `180 m` Skippers Notch doublet breach looking into two boreal crater-lakes, wind-flagged `glass_pine`, `KCARVE` overhang eyrie & bandit timber abatis |
| `vents` | `dist/ricochetpeaks-vents.html` | `1450, 1558` (`+3,180 m`, `Dfb`) | `6` boiling `WATER.spring` fumaroles, `5`-step silica sinter `WATER.terraces`, emerald hot lake, `ATMOS.snowBare` snow-free green oasis & `vent_willow` |
| `glasssheet` | `dist/ricochetpeaks-glasssheet.html` | `1158, 1522` (`+3,580 m`, `Dfc`) | Frost-cracked jet-black `tagamite` impact-melt pavement, bonsai `glass_pine`, metallic-blue `nickel_heather` indicator stands & `kits/resources` `iron`/`nickel`/`gold` nodes |
| `highbowl` | `dist/ricochetpeaks-highbowl.html` | `1375, 1525` (`+5,100 m`, `ET`) | `5` hollow `7–13 m` Erebus rime-ice fumarole towers (`KSTACKS` `chimney`), warm `KCARVE` steam-cave, `steam_moss` & polygon-cracked `WATER.ice` tarn |

## Build & Verify

```bash
node biomes/ricochetpeaks/tests/test-ricochet.js
python3 tools/build.py biomes/ricochetpeaks --all
python3 tools/check_port.py biomes/ricochetpeaks
python3 tools/check_core_use.py biomes/ricochetpeaks
python3 biomes/ricochetpeaks/verify.py --assert --no-cache
```
