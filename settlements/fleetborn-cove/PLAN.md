# Fleetborn Cove & Arcoforte Sanctuary: Scope & Build Plan (`settlements/fleetborn-cove/`)

> [!IMPORTANT]
> **Status (`2026-11-26`, branch `claude/arcoforte-fleetborn-cove`):** **Phases P1–P5 built and verified** on top of `biomes/arch` Station 6 (`cove`, `px [236, 242]`), `kits/arcoforte` (Soleri Plates `19–21`), and `kits/shore-kin` (`SKK`). `FCOVE_TIDE` (`src/40-fcove-tide-rules.js`) encodes the six macrotidal laws over a 92-day cycle (`tests/test-fcove-tides.js`), `FCOVE_SIM` (`src/60-fcove-sim.js`) couples `SIM`, `FCOVE_TIDE`, `KHAMLET.shorekinRow`/`village`, and `KCAMP.fleetWorld` (`Deep-Ward` `px [148, 492]` <-> `Arcoforte` `px [236, 242]`) over 92 days with fault-injection proofs (`tests/test-fcove-sim.js`), and `dist/fleetborn-cove.html` renders `Arcoforte`, the tidal graving cradles, salvaged Ancient port wet-pens (`kits/port` `d = 3`), reversible `|v|^3` paktong sill rotors, impounding tide-mill, `-6 m` White Stacks sea-byssus causeway, **all 5 Shore-kin client hinterland villages + Harbour Client Work-Bench (`219` `SKK` buildings) + 540 m 3D Timber Spar Log-Chute**, and **5 dynamic visiting Sea-Nomad fleets (`34` moored + `2` careened hulls)** converging at Double Dark & Double Full Moots.

---

## 1. Site & Two-Anchorage Split: Fleetborn Cove (`px [236, 242]`) vs Deep-Ward (`px [148, 492]`)

- **Fleetborn Cove (`px [236, 242]`, Arch Horst Flank):** A dead-end ophiolite pocket fjord opening NNW across a `-9..-14 m` pillow-basalt sill into a `-45..-59 m` inner sanctuary basin (`E_worst = 0.13x` tsunami reduction). `KTIDE` (`core/water/tide`, slice `box: [226, 232, 246, 252]`, `meanRange: 11 m`) drives a **`7.5 m` neap to `14.3 m` greatest-spring tide** (`-7.27 m .. +7.11 m`), amplified by the `3.5`-day Week and `6.5`-day Thirteen lunar beats with peak **Great Careening** syzygies at the **Double Dark** and **Double Full** every `45.5` days (`91`-day full cycle).
- **Deep-Ward Anchorage (`px [148, 492]`, `530.1 km` SSW at `199.4°` in the Drownlands):** Shallow (`~4 m`) calm roadstead near a `D2` amphidrome (`1.9 m` diurnal `D1` tide). Deep-Ward cannot careen deep hulls (`draft > 2.2 m`) on the tide (`0` deep careenings in `FCOVE_SIM` audit), so it serves as the fleets' calm home/storm roadstead and trade hub to Farport and Copper Tarn, while **Arcoforte at Fleetborn Cove** is the Fleet-born's **spring-tide drydock, paktong campaign smelter, and Great Careening moot**.
- **Who Lives Here:**
  - **Fleet-born (`cFlīt-qBōn`):** Full free-divers (`25 min`, `100+ m`); zero conventional land cottages ([CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md#L58)). Caretaker house (`420` residents on `4` permanent guard-hulls + lower `Arcoforte` bastions/ring, rising to **`2,480` Moot Pop** across `5/5` fleets at Double Dark & Double Full Great Careenings).
  - **Shore-kin (`1,192` clients):** Mixed Fleet-born, Hueru-Kuran, Eternian, and Rian client villagers (`1,012` across 5 `KHAMLET` hinterland villages + `180` harbour yard crew at the `+9.2 m` Client Work-Bench) delivering tithed nickel bio-ash, *Araucaria*/*Agathis* spars, bitumen/byssus cordage, roasted copper-zinc ore, and solar-pan salt fish under client contract to the Caretaker House in return for `paktong` tools/fittings and `cradle_shallow` boat-repair berths.

---

## 2. Core Adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

Checked by `python3 tools/check_core_use.py settlements/fleetborn-cove`:

| Module / Kit | Taken For |
|---|---|
| `core/rand` (`KRAND`) | Seeded deterministic placement of cove geology, flora, hamlets, fleet schedules, mooring swing circles, and byssus beds (`KRAND.hash` / `KRAND.cell`; zero `Math.random`) |
| `core/tags` (`KTAGS`) | Pre-draw registration of `site:fleetborn-arcoforte`, `Arcoforte` zones/rooms, 5 Shore-kin villages & `219` `sk_*` buildings, `fcove.spar_log_chute`, graving cradles, `kits/port` segments, sill rotors, tide-mill, causeway, and `36` `89c–89h` vessels |
| `core/space` (`KSPACE`) | Spatial keep-clear between Arcoforte's `576 m` horseshoe/harbour reserve, drydock quays, sill fairway, and all `30` visiting + `4` caretaker fleet berths |
| `core/drawn` (`KDRAWN`) | Exact drawn-ground height grid (`GROUND` + drydock quays + spar log-chute + Shore-kin village plinths/buildings + Arcoforte decks) audited by `harness.SURVEY` |
| `core/clock` (`KCLOCK`) | World day and hour driving `KTIDE.worldSeconds(clock)` and `FCOVE_SCENE.syncFleetsForDay(day)` across the 91-day lunar cycle |
| `core/city` (`KCITY.prim`) + `core/hamlet` (`KHAMLET.shorekinRow`, `KHAMLET.village`) | Deterministic siting, lanes, and `SKK` building placement for all 5 Shore-kin client hinterland villages (`village_ash`, `village_spars`, `village_cordage`, `village_ore`, `village_saltery`) |
| `core/camp` (`KCAMP.fleetWorld`, `KCAMP.fleetsAt`) | 5 sea-nomad fleets (`ward_ring`, `smelt_fleet`, `trench_fleet`, `outer_whalers`, `island_traders`) sailing between `Deep-Ward`, `Copper Tarn`, `Arch Trench`, `Ria Sound`, and `Arcoforte` under spring careening & moot convergence laws |
| `core/simulation` (`SIM`, `S.economy`, `S.ledger`, `KHOST.simHolds`) | 92-day coupled paktong stock & ledger simulation (`FCOVE_SIM` in `src/60-fcove-sim.js`) wired into the interactive `Stocks (O)` panel and inspector place holdings |
| `core/water` + `core/water/tide` (`KTIDE`) | `KTIDE` (`23-core-water-tide.js` + `tide.py` slice `[226, 232, 246, 252]`), `WATER.open` 14 km marine surface with reversible sill-race overfalls, `WATER.flow` gjár stream & Arcoforte park waterways, `WATER.still` pools, `WATER.fall` cascades, `WATER.spring` alkaline cliff seeps |
| `core/atmos` (`ATMOS`) | Shared Krator sky at `[236, 242]` (`sky: [-36, -88]`, `1.60 atm`), `#include <atmos_waves>`, `ATMOS.skylight` PBR reflections, Chimaera `H2/CH4` cleft-flames, weather & height fog |
| `core/terrain` (`KSTRATA`, `KGROUND`, `KFAR`, `KHORIZON`, `KTHERM`, `KRUBBLE`) | Ophiolite cliff strata (`pillow-basalt` -> `sheeted-dyke` -> `serpentinite` -> `laterite`), `<= 5` sampler ground layers, far horizon, Chimaera thermal field, and sub-cliff vault rubble heaps |
| `core/biome` (`BIO`, `buildlib.CORE_BIOME_MIN`) | Shared biome instancing, leaf cards, octahedral impostors, environmental fields, and guard checks |
| `core/ruins` (`KRUINS`) | `KRUINS.watch` on Arcoforte's collapsed sub-cliff automated industry vaults (`0` floating pieces, every wreck seated on drawn ground) |
| `core/hazard` (`KHAZ`) | `20-core-hazard.js` and `21-core-hazard-flow.js` for alkaline seep, Chimaera flame, and tidal race hazard fields |
| `core/materials` (`KMAT`) | Packed library textures from `biomes/arch` and `kits/shore-kin` via `matlib_pack.py` sidecars (`fleetborn-cove.tex.js`) |
| `core/furnish` (`KFURN`) + `core/door` (`KDOOR`) + `core/walk` (`KWALK`) | Camera-independent interior furniture records (`fleetborn` & `shorekin` sockets), interactive portal doors, and walkable terraces/quays |
| `core/host` (`KHOST`, `khost.FULL + khost.KEYS`) + `core/minimap` + `core/edits` | Standard viewer, `Stocks (O)`, cutaway (`X`), walk mode (`F`), inspector (`I`), polygon/marks tool (`M`), minimap, and `harness.SURVEY` probe |
| `core/lod` + `core/shadow` + `core/export` | Distance LOD, toggleable sun shadow box (`KSHADOW`, off at load), and Godot `4.7.2` biome/tags/water/sim export |
| `biomes/arch` + `stations/cove` | Read in place for cove fjord bathymetry, ophiolite strata, travertine curtains, White Stacks, and 39-species ultramafic maquis / intertidal flora |
| `kits/arcoforte` + `kits/ancients` | Read in place (`ARCOFORTE_OPTS = {noTerrain: true, state: 'marginal', socket: {bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin'}}`) seated on the `+76..+84 m` eastern cliff-prow |
| `kits/shore-kin` (`SKK` via `kit_bundle.py`) | Bundled in place (`SKK.proto`, `SKK.dims`, `SKK.bills`, `SKK.ANIMU`): all 16 Shore-kin vernacular buildings merged into world-space material batches across the 5 client villages and `+9.2 m` Harbour Client Work-Bench |
| `kits/port` (`82-dd-dock`, `82-dd-shed`, `82-dd-yard`, `87-sl-d-pen`) | Read in place at `d = 3` (salvaged/refurbished Ancient port dress) along the sheltered cove quay below Arcoforte |
| `kits/ringsea` (`89c`–`89h`) | Read in place: `89c` Moon-Pool Ark-Catamaran, `89d` Paktong Smelt-Barge, `89e` Vent Tender, `89f` Scout Trimaran, `89g` 3-Hull Chained Ark-Ward, `89h` Hueru-Kuran Whaler |

- **Modules not yet taken (with reasons):**
  - `core/mask`: No `getImageData` or 2D canvas placement masks; all keep-clear and zonation rules are analytical `[G data]` functions.
  - `core/charactermodels` + `core/sched`: Scheduled for Phase P6 (animated `cflit_qbon` free-divers & `shore_kin` harbour/village crowds).

---

## 3. The 5 Shore-Kin Client Villages, Spar Chute & Coupled 92-Day Economy (`src/42`, `src/60`)

1. **`village_ash` (*Pycnandra-Clamps*, focus `'ash'`, `+148 m` eastern red-laterite plateau):** Burns *Pycnandra* & *verdigris* nickel bio-ash (`nickel_ash`) and oyster-shell flux (`shell_lime`) in `sk_ash_kelp_kiln` & `sk_lime_kiln`.
2. **`village_spars` (*Kauri-Chute*, focus `'spars'`, `+128.5 m` *Agathis*/*Araucaria* ridge):** Cuts masts & spars in `sk_spar_sawpit` and sends peeled logs down the **540 m, 29-bent 3D Timber Spar Log-Chute (`fcove.spar_log_chute`)** to the southern cove boatyard.
3. **`village_cordage` (*Seep-Walk*, focus `'cordage'`, `+16.4 m` dry southern gjár neck bench):** Twists bitumen-tarred coir, hibiscus bast & spring-low sea-byssus into `pitch_cordage` (`sk_ropewalk_pitch`), safely above the `±7.3 m` tidal band while leaving the gjár stream untouched.
4. **`village_ore` (*Dyke-Roast*, focus `'smelt'`, `+64.0 m` southeastern sheeted-dyke bench):** Roasts local copper-zinc ore (`copper_zinc`, supplemented by `smelt_fleet` Copper Tarn imports) in `sk_paktong_foundry`.
5. **`village_saltery` (*Sill-Pans*, focus `'saltery'`, `+14.4 m` outer NW basalt headland + `+8.8 m` boat-grid slipway):** Cures pelagic catch and solar-pan salt (`salt_fish`) in `sk_fish_saltery` & `sk_boat_grid_shed`.
6. **Harbour Client Work-Bench (`+9.2 m` terrace):** `sk_client_hall` (Caretaker House client moot & tally warehouse), `sk_paktong_foundry`, and `sk_boat_grid_shed` beside the Paktong Reverberatory Smelt-Hearth (`nickel_ash + copper_zinc + shell_lime -> paktong` **strictly on spring rotor campaign days >= 11.0 MWh; `0` smelted on banked neaps**).

---

## 4. Phased Roadmap (`arcoforte_tide_plan.md` §2.6)

- **P0 (Done):** `KTIDE` in `biomes/arch --station cove` with lunar springs & neaps.
- **P1 (Done):** `FCOVE_TIDE` `[G data]` records + 92-day `ktest.js` suite (`tests/test-fcove-tides.js`).
- **P2 (Done):** `kits/arcoforte` per-zone `'marginal'` state and `'fleetborn'` / `'shorekin'` interior sockets.
- **P3a–P3c (Done):** `settlements/fleetborn-cove` drydock/rotors/causeway, `biomes/arch` 39-species flora expansion, and `kits/shore-kin` vernacular kit.
- **P4 (Done):** All 5 Shore-kin client hinterland villages + Harbour Client Work-Bench (`SKK` merged meshes), 540 m 3D Timber Spar Log-Chute, and tide-gated paktong `SIM` stocks/ledger chain (`tests/test-fcove-sim.js`).
- **P5 (Done):** 5 Sea-Nomad Fleets (`KCAMP.fleetWorld`, `Deep-Ward` <-> `Arcoforte`), dynamic 3D sanctuary moorings synced to `KCAMP.fleetsAt`, updated HUD + `Stocks (O)`, 11 camera presets, and `verify.py --assert`.
- **P6 (Next):** `core/charactermodels` animated `cflit_qbon` free-divers & `shore_kin` crews + Godot `4.7.2` export.
