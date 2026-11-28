# Skywatch (`settlements/skywatch`)

**Skywatch** (Scale Model 5.1 pin `id: "s8921htcjy"`, pixel **`(776, 470)`**, datum **`+3,745.5 m` ASL**, atmospheric pressure **`1.002 atm`** under `H = 29,211 m`, polity **`Jimjam`**) is the high-altitude northern astronomical observatory, copper-zinc skarn brass citadel, and diplomatic silent-barter moot guarding the alpine pass between the Jimjam plateau and the northern Sasquatch highlands.

Its architectural, geological, and astronomical specification lives in [`PLAN.md`](PLAN.md).

## Architectural Tiers

1. **Tier I — Upper Observatory Crag & Signal Beacons (`+3,817 m` WNW Basalt Dome):**
   - *Raja's Eye* brass observatory dome (`hl_rep_guild_astro` / `hnRBOrrery`), *Winter Solstice Sunset Sanctuary* (`sw_solstice_sanctuary`, aligned along azimuth `242.17°` / altitude `+1.67°` to the far WSW horizon ridge), *360° Horizon Azimuth Ring* (`sw_horizon_ring`, 16 engraved brass sighting notches), the *Ephemeris Hall & Sky-Clerks' Archive* (`jj_library`), and the North (`(-560, -620)`) and South (`(-520, 420)`) *Heliograph & Fire-Beacon Towers* (`sw_beacon_tower`) aimed down the `(780, 498)` relay line toward Jimjam.
2. **Tier II — Pass-Gate Fortress & Sheltered Switchback Town (`KCITY` + `KHAMLET`):**
   - Laid out on `core/city` (`KCITY.makeGrid` + `KCITY.makeTown`) and `core/hamlet` (`KHAMLET`), enclosed by banded brick-and-basalt curtain walls, corner bastions, and North/South Pass Gatehouses (`jj_gate`), with two vaulted rock-cut step-cisterns (`sw_step_cistern` + `WATER.still` / `WATER.drawStill`), Jimjam sky-clerk dwellings and shrines (~25%), and Highlands `rustic` stone-and-larch pass-folk dwellings, bakeries, taverns, smithies, and granaries (~75%).
3. **Tier III — Lee-Saddle Convoy Caravanserai & `KCAMP` Yak Yards:**
   - Sheltered courtyard caravanserai (`jj_caravanserai`), bonded halite vaults (`jj_granary`), Ancient Salvage Assay Yard (`sw_salvage_assay`, audited with `KRUINS.watch`), and two pitched `KCAMP` pack-convoy laagers on the ESE lee shoulder.
4. **Tier IV — West-Gully Copper-Zinc Skarn Adits & Wind-Furnace Brass Works:**
   - Copper (`120`), zinc (`96`), iron (`60`), and saltpeter (`83`) skarn outcrops and adits (`kits/resources` `RES_ORE` + `sw_skarn_adit`), katabatic wind-drafted calamine brass furnaces (`sw_wind_furnace`), smelter (`hl_rep_smelter`), and optical/astrolabe instrument smithies.
5. **Tier V — NE Escarpment Megalithic Silent-Barter Ring (`The Silent Moot`):**
   - 13 unworked columnar basalt monoliths (`sw_moot_monolith`, `R = 14 m`), polished stone barter plinths (`sw_moot_table`), brass truce-gong gantry (`sw_truce_gong`), boundary cairns, and three `1.35×`-scaled seasonal Sasquatch equinox camps (`KCAMP.pitch`) overlooking the NNE East Dam Breach and Sasquatch Outer Wall vista.

## Core Modules Adopted

- **Data & Layout (`[G data]`):** `core/rand` (`KRAND`), `core/mask` (`KMASK.canvas`), `core/drawn` (`KDRAWN.grid`), `core/space` (`KSPACE`), `core/city` (`KCITY`), `core/hamlet` (`KHAMLET`), `core/camp` (`KCAMP`), `core/tags` (`KTAGS`), `kits/resources` (`RES_ORE`).
- **Scene, Kits & Host (`[draw]` / `[web]`):** `kits/ancients` runtime, `settlements/jimjam` (`JJ`), `kits/iziz-vernacular` + `kits/highlands` (`rustic`, `hl_rep_guild_astro`, `hl_rep_smelter`, `hl_tri_stone_circle`), `core/furnish` (`KFURN`), `core/door` (`KDOORHOST`), `core/walk` (`KWALK`), `core/ruins` (`KRUINS`), `core/water` (`WATER.still` / `WATER.drawStill`), `core/atmos` (`ATMOS.skyBiome` / `ATMOS.bindHost`), `core/biome` (`buildlib.CORE_BIOME_MIN` + `biomes/nhighlands`), `core/lod` (`KLOD`), and `core/host` (`KHOST.take`, `FULL + KEYS + UNDERGROUND`).

## Commands

```bash
# 1. Node [G data] test suite (terrain, 5 tiers, KCITY, 0 KSPACE overlaps, cisterns, Moot & Solstice sightline)
node settlements/skywatch/tests/test-skywatch.js

# 2. Build dist/skywatch.html + dist/skywatch.tex.js + build-inputs.json
python3 tools/build.py settlements/skywatch

# 3. Refresh Scale Model 5.1 elevation & horizon bake (src/28-sw-model.js)
python3 settlements/skywatch/build.py --bake-model

# 4. Headless WebGL verification & preset screenshots
KRATOR_CHROME=/usr/bin/chromium python3 settlements/skywatch/verify.py settlements/skywatch/dist/skywatch.html --assert --all-views --out settlements/skywatch/shots
```
