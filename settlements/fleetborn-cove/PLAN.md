# Fleetborn Cove & Arcoforte Sanctuary: Scope & Build Plan (`settlements/fleetborn-cove/`)

> [!IMPORTANT]
> **Status (`2026-11-26`, branch `claude/arcoforte-fleetborn-cove`):** **Phases P1 & P3a built and verified** on top of `biomes/arch` Station 6 (`cove`, `px [236, 242]`) and `kits/arcoforte` (Soleri Plates `19–21`). `FCOVE_TIDE` (`src/40-fcove-tide-rules.js`) encodes the six macrotidal laws as `[G data]` records verified over a 92-day cycle (`tests/test-fcove-tides.js`), and `dist/fleetborn-cove.html` seats `Arcoforte` in marginal caretaker state on the `+76..+84 m` eastern ophiolite cliff-prow above zero-pump tidal graving cradles, salvaged Ancient submarine wet-pens (`kits/port` at `d = 3`), reversible `|v|^3` paktong sill rotors, an impounding tide-mill, the `-6 m` White Stacks sea-byssus causeway, and the moored `cFlīt-qBōn` & Hueru-Kuran fleet (`kits/ringsea` `89c–89h`).

---

## 1. Site & Two-Anchorage Split: Fleetborn Cove (`px [236, 242]`) vs Deep-Ward (`px [148, 492]`)

- **Fleetborn Cove (`px [236, 242]`, Arch Horst Flank):** A dead-end ophiolite pocket fjord opening NNW across a `-9..-14 m` pillow-basalt sill into a `-45..-59 m` inner sanctuary basin (`E_worst = 0.13x` tsunami reduction). `KTIDE` (`core/water/tide`, slice `box: [226, 232, 246, 252]`, `meanRange: 11 m`) drives a **`7.5 m` neap to `14.3 m` greatest-spring tide** (`-7.27 m .. +7.11 m`), amplified by the `3.5`-day Week and `6.5`-day Thirteen lunar beats with peak **Great Careening** syzygies at the **Double Dark** and **Double Full** every `45.5` days (`91`-day full cycle).
- **Deep-Ward Anchorage (`px [148, 492]`, `~530 km` SSW in the Drownlands):** Shallow (`~4 m`) calm roadstead near a `D2` amphidrome (`~1.9 m` diurnal `D1` tide). Deep-Ward cannot careen deep hulls on the tide, so it serves as the fleets' calm home roadstead and trade hub to Farport and Kaskedi-Kuran (`2–3` days under sail), while **Arcoforte at Fleetborn Cove** is the Fleet-born's **spring-tide drydock, paktong campaign smelter, and Great Careening moot**.
- **Who Lives Here:**
  - **Fleet-born (`cFlīt-qBōn`):** Full free-divers (`25 min`, `100+ m`); zero conventional land cottages ([CROOK-RIA-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CROOK-RIA-SCOPE.md#L58)). Caretaker house (`~300–500`, rising to `2,000–2,600` at a Great Careening moot) occupies the moored Ark-Wards and Arcoforte's refurbished lower bastions and ring halls (`socket: 'fleetborn'`).
  - **Shore-kin:** Mixed Fleet-born, Hueru-Kuran, Eternian, and Rian client crews (`~900–1,400`, weak/lost dive trait) staffing the sub-cliff harbour works (`socket: 'shorekin'`), graving cradles, tide-mill, and upland ash/spar/copper hinterland villages (`kits/shore-kin` in P3c/P4).

---

## 2. Core Adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

Checked by `python3 tools/check_core_use.py settlements/fleetborn-cove`:

| Module / Kit | Taken For |
|---|---|
| `core/rand` (`KRAND`) | Seeded deterministic placement of cove geology, flora, mooring swing circles, salvage props, and byssus beds (`KRAND.hash` / `KRAND.cell`; zero `Math.random`) |
| `core/tags` (`KTAGS`) | Pre-draw registration of `site:fleetborn-arcoforte`, `Arcoforte` zones/rooms, graving cradles, `kits/port` segments, sill rotors, tide-mill, causeway, and `89c–89h` vessels |
| `core/space` (`KSPACE`) | Spatial keep-clear between Arcoforte's `576 m` horseshoe/harbour reserve, drydock quays, sill fairway, and moored Ark-Ward swing circles |
| `core/drawn` (`KDRAWN`) | Exact drawn-ground height grid (`GROUND` + drydock quays + Arcoforte decks) audited by `harness.SURVEY` eye/camera checks |
| `core/clock` (`KCLOCK`) | World day and hour driving `KTIDE.worldSeconds(clock)` across the 91-day lunar spring/neap cycle |
| `core/water` + `core/water/tide` (`KTIDE`) | `KTIDE` (`23-core-water-tide.js` + `tide.py` slice `[226, 232, 246, 252]`), `WATER.open` 14 km marine surface with reversible sill-race overfalls, `WATER.flow` gjár stream & Arcoforte park waterways, `WATER.still` pools, `WATER.fall` cascades, `WATER.spring` alkaline cliff seeps |
| `core/atmos` (`ATMOS`) | Shared Krator sky at `[236, 242]` (`sky: [-36, -88]`, `1.60 atm`), `#include <atmos_waves>`, `ATMOS.skylight` PBR reflections, Chimaera `H2/CH4` cleft-flames, weather & height fog |
| `core/terrain` (`KSTRATA`, `KGROUND`, `KFAR`, `KHORIZON`, `KTHERM`, `KRUBBLE`) | Ophiolite cliff strata (`pillow-basalt` -> `sheeted-dyke` -> `serpentinite` -> `laterite`), `<= 5` sampler ground layers, far horizon, Chimaera thermal field, and sub-cliff vault rubble heaps |
| `core/biome` (`BIO`, `buildlib.CORE_BIOME_MIN`) | Shared biome instancing, leaf cards, octahedral impostors, environmental fields, and guard checks |
| `core/ruins` (`KRUINS`) | `KRUINS.watch` on Arcoforte's collapsed sub-cliff automated industry vaults and ruined upper sky-crown/tower works (`0` floating pieces, every wreck seated on drawn ground) |
| `core/hazard` (`KHAZ`) | `20-core-hazard.js` and `21-core-hazard-flow.js` for alkaline seep, Chimaera flame, and tidal race hazard fields |
| `core/materials` (`KMAT`) | Packed library textures from `biomes/arch`, `kits/ancients`, and `kits/port` via `matlib_pack.py` sidecars |
| `core/furnish` (`KFURN`) + `core/door` (`KDOOR`) + `core/walk` (`KWALK`) | Camera-independent interior furniture records (`fleetborn` & `shorekin` sockets), interactive portal doors, and walkable terraces/quays |
| `core/host` (`KHOST`, `khost.FULL + khost.KEYS`) + `core/minimap` + `core/edits` | Standard viewer, cutaway (`X`), walk mode (`F`), inspector, polygon/marks tool, minimap, and `harness.SURVEY` probe |
| `core/lod` + `core/shadow` + `core/export` | Distance LOD, toggleable sun shadow box (`KSHADOW`, off at load), and Godot `4.7.2` world/tags/water export |
| `biomes/arch` + `stations/cove` | Read in place for cove fjord bathymetry, ophiolite strata, travertine curtains, White Stacks, and serpentine maquis / intertidal flora |
| `kits/arcoforte` + `kits/ancients` | Read in place (`ARCOFORTE_OPTS = {noTerrain: true, state: 'marginal', socket: {bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin'}}`) seated on the `+76..+84 m` eastern cliff-prow |
| `kits/port` (`82-dd-dock`, `82-dd-shed`, `82-dd-yard`, `87-sl-d-pen`) | Read in place at `d = 3` (salvaged/refurbished Ancient port dress) along the sheltered cove quay below Arcoforte |
| `kits/ringsea` (`89c`–`89h`) | Read in place: `89c` Moon-Pool Ark-Catamaran (moored + careened on `-3 m` blocks), `89d` Paktong Smelt-Barge, `89e` Vent Tender, `89f` Scout Trimaran, `89g` 3-Hull Chained Ark-Ward, `89h` Hueru-Kuran Whaler |

- **Modules not taken in P3a (with reasons):**
  - `core/mask`: No `getImageData` or 2D canvas placement masks; all keep-clear and zonation rules are analytical `[G data]` functions.
  - `core/city`: Single coastal megastructure (`Arcoforte`) + waterfront shipyard + moored pelagic fleet (`SINGLE_COMPLEX`; no terrestrial street/lot grid).
  - `core/hamlet`, `core/camp`, `core/simulation`, `core/sched`, `core/charactermodels`: Scheduled for Phases P4–P6 (Shore-kin hinterland hamlets on `kits/shore-kin`, `fleet` band routes to Deep-Ward, paktong `SIM` stocks chain, and animated `cflit_qbon` / `shore_kin` crews).

---

## 3. The Six Macrotidal Laws (`src/40-fcove-tide-rules.js`, `[G data]`)

1. **Spring & Shallow Graving Cradles (`cradle_deep`, `cradle_great`, `cradle_shallow`):**
   - `cradle_deep`: Keel blocks at `-3.0 m`, jammed-open caisson sill at `0.0 m`, `0.4 m` clearance. A careened `89c` Ark-Catamaran (`draft = 5.2 m`) rests dry on the `-3.0 m` blocks until sea level exceeds `+2.6 m`, and can cross the sill gate ONLY when `dayHighest >= +5.6 m` (**opens ONLY on spring days; shut on all neap days** `~+3.7 m`).
   - `cradle_great`: Inner careening pit (`blocks = 0.0 m`, `draft = 6.2 m` -> `>= +6.6 m`), opening **ONLY around Double Dark & Double Full Great Careenings** every `~45.5` days.
   - `cradle_shallow`: Blocks at `-1.0 m`, drafts `<= 2.2 m` (`>= +1.6 m`), opening on **every** spring and neap day for trimarans, tenders, whalers, and Shore-kin skiffs.
2. **The Sill Gate (`vMax = 5.2 m/s`):** Reversible race velocity `v(t) = vMax * rate(t) / maxRate`; deep hulls transit ONLY during slack windows `|v(t)| <= 0.65 m/s` (shorter on springs `~2.5 h/day` than neaps `~4.7 h/day`).
3. **Submerged Paktong Sill-Race Rotors (`|v|^3`):** Four reversible axial turbines in the NNW sill throat (`P(t) = min(2.4 MW, 0.022 * |v(t)|^3)`). The paktong reverberatory smelt-hearth requires `rotorDay(d).mwh >= 11.0 MWh` -> **active `'campaign'` on spring days, `'banked'` on neaps**.
4. **Impounding Basin & Tide Mill:** Fills through flap-gates at `dayHighest` and drains on the ebb with hydraulic head `H = dayRange` (`7.5..14.3 m`), driving rope-walk capstans daily and heavy nickel-slag ore stamps on springs (`H >= 10.8 m`).
5. **Low-Water White Stacks Causeway & Sea-Byssus Beds:** Crest at `-6.0 m`, exposed dry/wadable ONLY when `level(t) <= -6.0 m` (**spring low ebbs only; submerged all day on neaps**).
6. **92-Day Lunar Calendar:** Verified in `tests/test-fcove-tides.js` across `92` consecutive days covering Double Dark, Double Full, and intervening `3.5`-day / `6.5`-day beats.

---

## 4. Phased Roadmap (`arcoforte_tide_plan.md` §2.6)

- **P0 (Done):** `KTIDE` in `biomes/arch --station cove` with lunar springs & neaps.
- **P1 (Done):** `FCOVE_TIDE` `[G data]` records + 92-day `ktest.js` suite (`tests/test-fcove-tides.js`).
- **P2 (Concurrent in `kits/arcoforte`):** Per-zone `'marginal'` state and `'fleetborn'` / `'shorekin'` interior sockets.
- **P3a (This build):** `settlements/fleetborn-cove` — `Arcoforte` seated on the eastern cliff-prow, `576 m` horseshoe reserve, `kits/port` (`d = 3`) pens/sheds/yard, stepped graving cradles with careened `89c` Ark, sill rotors, tide-mill, `-6 m` White Stacks causeway, moored `89c–89h` fleet, interactive Tide & Drydock Panel, and `verify.py --assert`.
- **P3b–P3c (Concurrent):** Arch flora expansion (`biomes/arch`) & `kits/shore-kin` vernacular kit.
- **P4–P6 (Next):** Shore-kin hinterland hamlets & `SIM` paktong chain; `core/camp` `fleet` routes to Deep-Ward; `cflit_qbon` / `shore_kin` crews & Godot export.
