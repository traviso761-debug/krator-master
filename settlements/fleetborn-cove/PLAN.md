# Fleetborn Cove & Arcoforte Sanctuary: Scope & Build Plan (`biomes/arch` Station 6 + `settlements/fleetborn-cove/`)

> [!IMPORTANT]
> **Status (`2026-11-24`, branch `claude/arcoforte-fleetborn-cove` on `claude/integration-4`):** **Scoping & integration plan** pairing a new **`biomes/arch` Station 6 (`cove` -> `dist/arch-cove.html`)** with the **`settlements/fleetborn-cove/`** settlement build, adapting the sister session's **`Arcoforte`** megastructure (`kits/ancients` Soleri Plates `19–21` in [arco2-sheet0.jpg](file:///home/antigravity/traviso761-debug/krator-master/kits/ancients/refs/arco2-sheet0.jpg)) as the hidden careening drydock, `paktong`-smelting hearth, and submerged click-echo sanctuary of the **`cFlīt-qBōn` ("Fleet-Born")** ([CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md)).

---

## 0. Overview: Two-Stage Architecture (`biomes/arch` Station 6 -> `settlements/fleetborn-cove/`)

| Field | Stage A: New Biome Station (`biomes/arch --station cove`) | Stage B: Sanctuary Settlement (`settlements/fleetborn-cove/`) |
|---|---|---|
| **Folder & Output** | `biomes/arch/` (`src/41-biome-arch-sites.js` `cove` key + `stations/cove/`) -> `dist/arch-cove.html` | `settlements/fleetborn-cove/` (`src/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `BUDGETS.json`) -> `dist/fleetborn-cove.html` |
| **Scale-Model `5.1` Pin** | **`px (236, 242)`** (`world [472000, 484000]`, sky `[-36, -88]`; `5.2 × 5.2 km` cut across the `-59 m` dead-end cove, `-11 m` tidal sill & `+97..+246 m` E serpentinite/sheeted-dyke wall) | Same **`px (236, 242)`** cove + **`px (238, 241)`** eastern cliff-prow (`site:fleetborn-arcoforte` held clear by Station 6); `8 km` NW of the `+7 m` *gjár* saddle (`240, 250`) to the `-73 m` SE fjord (`241, 251`) |
| **Tsunami & Tide Physics** | **🟢 Tier 1 Double-Proof (`E_worst = 0.13×`, `87%` wave reduction)** behind the `-9 to -14 m` NE-facing sill (`233, 237`); **`11–16 m` macrotidal spring range** (`6.37×` open-ocean amplification — highest on map) | Harnesses the `11–16 m` spring tide for **zero-pump tidal graving cradles**, sill-race rotors, and `[-8 m, +8 m]` amphibious wet-pens while `89c–89g` Ark-Wards ride safely on nephrite-chained moorings |
| **Polity & Census (`Sphere 27`)** | Uninhabited natural cove stage (`site:fleetborn-arcoforte` registered in `KTAGS`, `0` buildings) | **`cFlīt-qBōn` (*Fleet-Born*)** Sanctuary Hub (`~1,800–2,600` seasonal/resident Ark-Ward population drawn from `Sphere 27`'s `8,000` pelagic `cFlīt-qBōn` pool, `ΔPop = 0`; `0` conventional terrestrial houses, preserving the pelagic rule in [CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md#L58)) |
| **Upstream Reads (Zero Copies)** | `biomes/arch` (`ARCH`, `ARCHB`), `biomes/geyser` / `biomes/gills` (`WATER` & `ATMOS` contracts), `core/coast` | Sister-session **`Arcoforte`** (`kits/ancients/targets/arcoforte` read in place via `TARGET_READS`), **`kits/ringsea`** (`89c–89g` `cFlīt-qBōn` fleet), **`kits/port`** (`87-sl-d-pen.js` sub pens, `82-dd-dock.js` graving cradles), **`biomes/arch`** |

---

## 1. Why `biomes/arch` Needs Station 6 (`cove`)

Inspecting [41-biome-arch-sites.js](file:///home/antigravity/traviso761-debug/krator-master/biomes/arch/src/41-biome-arch-sites.js) shows that none of the five existing `biomes/arch` stations represent the deep macrotidal fjords cut into the Arch's horst flanks:
- `confluence` (`324, 180`, `+183 m`) and `dome` (`318, 178`, `+863 m`) are upland serpentinite core-complex slopes;
- `barrens` (`258, 246`, `+155 m`, `44 km` E of our cove) is dryish `Aw` nickel-laterite maquis with `lavaka` gullies;
- `sound` (`299, 220`, `+7 m`) is a **shallow `5–8 m` micro-tidal (`0.5 m` tide)** mangrove and Laki-lava flat;
- `coast` (`167, 336`, `+2 m`) is an open black-sand Surtseyan beach facing the `Steaming Seamounts`.

**Station 6 (`cove`, `px [236, 242]`)** fills the missing coastal-fjord endmember of the ophiolite sequence ([PLAN.md](file:///home/antigravity/traviso761-debug/krator-master/biomes/arch/PLAN.md) §4):
1. **Ophiolite Cliff Wall (`+12 m -> +246 m`):** Exposes **pillow basalts** in the `[-8 m, +8 m]` intertidal foot, **vertical sheeted-dyke columns** in the `+8..+110 m` sheer gorge wall, and **red nickel-laterite maquis** (`Araucaria`, `Pycnandra` blue-sap nickel-hoarders, `verdigris` caps) on the `+110..+246 m` eastern crown leading up toward `barrens` (`258, 246`).
2. **`14 m` Macrotidal Zonation Band & Sill Race:** A `-11 m` pillow-lava entrance sill at the north-west throat (`WATER.flow` / `WATER.open` white-water standing tidal race), exposing **submerged brucite-carbonate White Stacks** and golden **`Sea-Byssus` pen-shell beds** at `-6 m` spring low ebb while drowning dark-green serpentinite sea-caves at `+7 m` high flood.
3. **Submarine Alkaline Seep & Chimaera Cliff-Flames:** Type II (`Ca-OH`, `pH 11.4`) alkaline springs weeping white travertine curtains down the sheeted-dyke cliff into the salt cove, plus pale-blue night-visible hydrogen/methane cleft flames (`biomes/gills` `core/atmos` hook) serving as natural navigation leading-marks through the sill.
4. **Settlement Reserve:** Registers `site:fleetborn-arcoforte` (`KTAGS`) on the eastern cliff-prow so `settlements/fleetborn-cove/` drops `Arcoforte` cleanly onto identical rock and water rules.

---

## 2. Adapting Sister-Session `Arcoforte` (`kits/ancients` Plates `19–21`)

In Paolo Soleri's *Arcology: The City in the Image of Man* (Plates `19–21` on [arco2-sheet0.jpg](file:///home/antigravity/traviso761-debug/krator-master/kits/ancients/refs/arco2-sheet0.jpg)), ***Arcoforte*** is a **horseshoe coastal-cliff bastion** (`20,000` design pop, `~80–140 m` structural height above its cliff shelf, `16 ha`) wrapping a small semi-enclosed sea-cove with battered vertical concrete pylons, radial faceted rib-buttresses, deep vertical shafts, and a curved sea-mole closing the harbor mouth.

### 2.1 Upstream Hook Checklist for the Sister Session (`5` Lines, Zero Forking)
To read `kits/ancients/targets/arcoforte` directly in place (`TARGET_READS` pattern from [build.py](file:///home/antigravity/traviso761-debug/krator-master/kits/ancients/build.py#L123-L135)) without touching its showcase hash:
1. **`opts.noTerrain` Guard:** Keep any synthetic demo cliff/sea-plane `rng()` calls inside their own `reseed()` sub-stream (or consume draws unconditionally) and skip emitting demo rock meshes when `ARC_HOST && ARC_HOST.noTerrain` is set (avoiding the [Ledge](file:///home/antigravity/traviso761-debug/krator-master/settlements/ledge/PLAN.md) synthetic-cliff conflict).
2. **Exported Hull Descriptor (`ARCOFORTE_DESC`):** Expose `{ span, H, coveR, moleArc, pylonAngles, toeY, sillZ }` as plain constants so our tidal band, wet-pens, and `KSTRATA` cliff pockets snap analytically to `Arcoforte`'s concrete faces.
3. **Decay `d = 3` (`reclaimed`) + Waterline Cut:** Place `buildArcoforte` via an `ysPlaceHost`-style wrapper ([64-hyk-accrete.js](file:///home/antigravity/traviso761-debug/krator-master/settlements/ys/src/64-hyk-accrete.js#L10-L40)) at `d = 3` (`69-mat-salvage.js`) with its lower buttress toes straddling `[-18 m, +8 m]` and `KRUINS.watch` verifying any collapsed outer mole blocks.

### 2.2 Fleetborn (`cFlīt-qBōn`) Cultural & Functional Layers Around `Arcoforte`
1. **Zero Shore Cottages — Pure Amphibious & Pelagic Habitation:**
   - Honouring [CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md#L58), the `cFlīt-qBōn` build **no land villages**. Onshore, they occupy only `Arcoforte`'s **cantilevered concrete sea-bastions, cliff-cut crane galleries, and flooded submarine vaults**, dressed in `paktong` (`Cu-Ni-Zn` white-copper), sawn green `nephrite-jade` ring-stones, `Sea-Byssus` golden cables, and catechu-dyed crab-claw awnings.
2. **Zero-Pump Macrotidal Graving Cradles & Vaulted Wet-Pens (`[-8 m, +8 m]`):**
   - Cut into the base of `Arcoforte`'s horseshoe cliff-wall are vaulted concrete submarine pens ([87-sl-d-pen.js](file:///home/antigravity/traviso761-debug/krator-master/kits/port/src/87-sl-d-pen.js) read in place) and stepped **tidal graving cradles** ([82-dd-dock.js](file:///home/antigravity/traviso761-debug/krator-master/kits/port/src/82-dd-dock.js)): `40 m` Ark-Catamarans float over the red-cypress keel-blocks at `+7.5 m` high spring flood and sit completely high-and-dry for `paktong` hull-sheathing and `bitumen` caulking at `-7.5 m` low ebb — **zero mechanical pumps required**.
3. **Submerged Free-Dive Click-Council Hall & Air-Bell Shafts (`-15 m` to `-52 m`, `khost.UNDERGROUND`):**
   - Because the `cFlīt-qBōn` free-dive `25 minutes` to `100+ m` with clear nictitating eyelids and speak an underwater-propagating click language ([CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md#L86)), `Arcoforte`'s drowned lower rotunda (`-28 m`) serves as the **`qDīp-cRīng` (*Deep-Ring* Acoustic Council Vault)** — an un-pumped, water-filled concrete dome ringed by resonant `nephrite` lithophone ribs and breath-replenishing trapped-air domes, inspectable via `khost.UNDERGROUND` section-cuts (`C`/`X`) and underwater swim/walk camera!
4. **The Chained Ark-Lagoon & `Paktong` Smelt-Hearth (`kits/ringsea` `89c–89g`):**
   - Moored in concentric arcs across the `-59 m` inner lagoon (riding the `14 m` tide on `core/city/float/`):
     - **`89g` Coupled 3-Hull Chained Ark-Wards** & **`89c` Great Moon-Pool Ark-Catamarans** forming floating clan neighborhoods;
     - **`89d` `Paktong` Phytomining Smelt-Barges** anchored downwind under the north-east cliff chute, burning bundled **`Pycnandra` blue-sap nickel-shrub ash** harvested from the upland `barrens` (`258, 246`) with `Copper Tarn` copper/zinc ingots;
     - **`89e` Deep-Trench Vent-Harvester Tenders** & **`89f` Fast Crab-Claw Scout Trimarans** shooting the `-11 m` entrance sill on slack water (plus a narrow flooded-*gjár* portage tramway toward the `+7 m` SE saddle `240, 250`).
5. **Sill-Throat Tidal Stream Rotors (`-11 m`):**
   - Slung between two surviving Ancient mole piers at the cove's narrowest throat, reversible `paktong`-bladed tidal rotors spin in the `4–6 m/s` flood/ebb race, driving the capstan sheerlegs, forge-bellows shafts, and storm-gong winches inside `Arcoforte`.

---

## 3. Mandatory `Core adoption` & Survey Checks (`README.md`)

Written before any fragment and checked against `tools/check_core_use.py` and `tools/new_build/README.md` (items `22–31`):

| Module | Taken For |
|---|---|
| `core/rand` (`KRAND`) | Every rock bed, intertidal cluster, salvage patch, and moored ark pose seeded via `KRAND.cell` / `KRAND.hash` |
| `core/tags` (`KTAGS`) | Pre-draw registration of `Arcoforte` host tiers, wet-pens, graving cradles, `89c–89g` Ark-Wards, smelt-barges, and `cFlīt-qBōn` dive bells (`culture: 'cflit-qbon'` & `'ancients'`) |
| `core/space` (`KSPACE`) | Order-free keep-clear between moored Ark-Ward swing circles, sill-race channels, cliff buttresses, and intertidal chimneys |
| `core/city` + `core/city/float/` | `SINGLE_COMPLEX` / `float` mode laying out the chained pelagic Ark-Ward rings, floating hinge-bridges, and `Arcoforte` terrace slots riding `y_tide(clock)` |
| `core/water` + `ext/63-core-water-tide` | `WATER.open` (`-59 m` calm cove vs shoaling outer channel), `WATER.flow` reversible `4–6 m/s` sill tidal race, `WATER.still` alkaline cliff pools, and `11–16 m` spring-tide elevation curve |
| `core/atmos` | Shared Krator sky at `[236, 242]` (`sky: [-36, -88]`, `1.60 atm`), `#include <atmos_waves>`, `ATMOS.skylight` PBR reflections, sea-mist in the fjord, and pale-blue night hydrogen cleft-flames |
| `core/terrain` + `core/coast` + `core/drawn` | `KSTRATA` ophiolite cliff (`pillow-basalt` -> `sheeted-dyke` -> `serpentinite` -> `laterite`), `36-core-carve` / `KCAVERN` sea-caves & wet-pens, `KGROUND` (`<= 5` samplers), `KCOAST` cliff/shingle rims, `KDRAWN` mesh/grid registration |
| `core/ruins` (`KRUINS`) | `KRUINS.watch` on collapsed outer `Arcoforte` sea-mole blocks and fallen pylon ribs (`0` floating rubble) |
| `core/host` + `khost.UNDERGROUND` + `core/walk` | Full viewer, `KWALK` across `Arcoforte` terraces, hinged gangways & Ark decks, plus `UNDERGROUND` section-cuts (`C`/`X`) into the `-28 m` submerged *Deep-Ring* click-council vault & wet-pens |
| `core/furnish` + `kits/interiors` + `KROOMLIGHT` | Reclaimed Fleetborn rope/nephrite/paktong interiors in `Arcoforte`'s dry chart-bastion & forge-galleries (`<= 6` `PointLight` pool) |
| `core/simulation` + `core/clock` + `core/sched` | Tide-locked daily schedule: slack-water sill transits, low-ebb hull careening on exposed graving cradles, high-flood wet-pen launches, `paktong` ash-smelting, and `25-min` free-dive cycles |
| `core/charactermodels` | `cflit_qbon` lineage bodies (`peoples.json`: plum-indigo myoglobin lips/sclerae, dive-harnesses, `paktong` knives) |
| `core/lod` + `core/minimap` + `core/export` + `core/shadow` | `KSHELL` / impostor LOD, cove + deck minimap, Godot `4.7.2` export, `KSHADOW` **off at load** |
| `biomes/arch` + `kits/ringsea` + `kits/port` + `kits/ancients` | All read in place by path (`0` vendored copies) |

- **Not taken (with reasons):** `core/mask` (`0` `getImageData` raster reads; all placement from pure `[G data]` functions); `core/hamlet` / `core/camp` (no terrestrial village or land tent camp).

---

## 4. Phased Order of Work (`S0` -> `S5`)

1. **`S0` — `biomes/arch` Station 6 (`cove`, `dist/arch-cove.html`):** Add `ARCH_SITES.cove` (`px [236, 242]`) to `biomes/arch/src/41-biome-arch-sites.js` and `stations/cove/`; build the `-59 m` ophiolite fjord, `-11 m` sill race, `14 m` intertidal band, brucite stacks, alkaline cliff curtains, hydrogen flames, and `site:fleetborn-arcoforte` reserve; pass `verify.py --assert` (`checks=harness.SURVEY`).
2. **`S1` — Sister `Arcoforte` Upstream Hook & `mock.html` Massing Gate:** Once the sister session lands `targets/arcoforte`, add the 5-line `noTerrain` + `ARCOFORTE_DESC` hook (`0` change to `dist/arcoforte.html` hash), seat `Arcoforte` into the `(238, 241)` eastern cliff-prow on `mock.html`, and verify proportions at `[Low Ebb]` (`-7.5 m`) and `[High Flood]` (`+7.5 m`).
3. **`S2` — Wet-Pens, Zero-Pump Tidal Graving Cradles & Submerged *Deep-Ring* Vault:** Carve the cliff-foot submarine pens (`87-sl-d-pen`), stepped careening cradles (`82-dd-dock`), sill-race `paktong` rotors, and `-28 m` flooded acoustic council dome (`khost.UNDERGROUND`).
4. **`S3` — Pelagic Ark-Lagoon & `Paktong` Smelt-Hearth:** Place the concentric nephrite-chained `89c–89g` `cFlīt-qBōn` fleet on `core/city/float/`, hinged gangways, nickel-ash chute from the eastern maquis rim, and `KWALK` connectivity.
5. **`S4`–`S5` — Tide-Locked `SIM` Life Layer, `cflit_qbon` Free-Divers & Godot `4.7.2` Export:** Wire tide-gated careening/diving schedules, `verify.py --assert` across `[Low Ebb] / [Slack] / [High Flood]`, and `tools/test_all.py`.

---

## 5. Open Decisions to Confirm Before `S0`

1. **New Arch Station Key (`biomes/arch --station cove`):** Confirm adding `cove` (`px [236, 242]`, `dist/arch-cove.html`) as Station 6 of `biomes/arch` first so the ophiolite cliff, `14 m` intertidal zone, and `-11 m` sill race are verified on the biome core before `Arcoforte` drops in.
2. **Fleetborn Name for the Cove & `Arcoforte` (`[proposed]`):** Confirm or tweak `cFlīt-qBōn` click-prefixed names: **`qSīl-cKōv`** (*Sill-Cove* / English: **Fleetborn Cove**) for the sanctuary fjord, **`cFōrt-qKlif`** (*Cliff-Fort*) for `Arcoforte` itself, and **`qDīp-cRīng`** (*Deep-Ring*) for the drowned `-28 m` underwater click-council rotunda.
3. **The `+7 m` *Gjár* Back-Door (`px 240, 250` -> `-73 m` SE Fjord `241, 251`):** Keep the SE rift-fissure neck as a narrow, shallow/portage *gjár* slot usable only by small `89f` Scout Trimarans at `+8 m` spring high water (preserving the dead-end secrecy of the main `-59 m` cove against large warships), or cut it deeper?
