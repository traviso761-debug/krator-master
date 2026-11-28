# Eternian Canal Testbed (*Chī-Mā* / *Shuāng-Zhá*, "Twin-Locks"): Site Scope & Blueprint (proposal, 2026-11-19)

The owner, 2026-11-19: *"Also spin off an agent to scope a good site in Eternia to test the canal infrastructure build
and functionality, but not the capital, I want to plan that separately later."*

Everything here is *proposed* except what the owner or the lore has said, and what Scale Model 5.1, `kits/eternian`,
`kits/crops`, `kits/resources`, `core/world`, `core/water`, `core/city`, and `core/simulation/PROPOSAL-ETERNIANS.md`
already hold. Verified model data and repo contracts are cited by file.

### Scope guardrails

1. **`Fulcrum` (`swbjnpbdar`, px `409, 621`, `85,000` headcount / `120,000` economy-test) is strictly excluded.** It is
   listed below only as an excluded baseline control row and is reserved for its own capital plan later.
2. **Goal of this build (`settlements/eternian-canal`):** prove every reusable Eternian canal primitive at `1:1` world
   scale inside one moderate, self-contained non-capital burgh (`6,800` people) before scaling up to `Lux` (`18,000`)
   or `Fulcrum` (`85,000`):
   - **(a)** perennial river diversion intake weir, trash-rack & desilting/settling basin;
   - **(b)** stepped bronze miter-lock flight lifting/dropping `25 t` state barges across multi-elevation water pounds;
   - **(c)** rectilinear primary trunk canal (`20 m` ROW) + narrower secondary ward canals (`14 m` ROW) integrated as
     first-class typed ways in `core/city` with stone quays, towpaths, and dual street/water lot frontage;
   - **(d)** humpback cart/avenue bridges & pointed-arch footbridges clearing loaded barge air-draft (`≥ 2.60 m`) while
     carrying Eternian brass water/steam pipes (`et_tube_pipe`);
   - **(e)** 3-arch masonry canal aqueduct / cross-drainage culvert over a seasonal spate wash + ancestor-mouth
     waste-weir spillway (`et_spillway`) returning surplus head to the natural river;
   - **(f)** barge turning basin, drydock/slipway (`et_dock`), and state granary, kiln, and licensed Valley-salvage
     transshipment wharves.

Sources surveyed:
- `core/simulation/PROPOSAL-ETERNIANS.md`: provinces `E1–E7`, `1:1` `475,000` headcount reconciliation, `119`-barge
  Mirror Sea & `Līng-Mā` network, state monopolies (rice, porcelain, lacquer, tea, silk, Ancient salvage, bronze locks).
- Scale Model 5.1 (`tools/scale-model/model/data/`, `1821 × 1723`, `2 km/px`, world origin `1191, 1569`):
  - `h.png` decoded as `(R·256 + G)/65535 · 29,600 − 2,600 m`, `B > 127` water mask;
  - `wl.png` / `basins.json` (`lbl=102` *Jìng-Hǎi* / Mirror Sea: `6,728` px = **`26,912 km²`**, `100%` inside Eternia,
    standing water **`+45.87 m` ASL**, max depth `735.3 m`; `lbl=77` *Jimjam's Lake*: `28,704 km²`, **`+429.78 m` ASL**);
  - `rivers.json` (`81` river nodes traced across Eternia), `tm.png`, `p.png`, `c.png` (`climate.json`), barometric
    pressure `1.6 · exp(−h/8000)` atm;
  - `kits/resources/data/geology.json` (`4 km` cells via `WRES`) & `lodes.json` (`0` point-lode overrides in Eternia).
- `kits/eternian/` (`PLAN.md`, `INDEX.md`, `API.md`, `KNOWN_ISSUES.md`, `src/70-et-canal.js`, `src/71-et-harbour.js`),
  `kits/ringsea/INDEX.md`, `kits/crops/` (`CROPS.at`), `openworld/trade-fleets-gemini.json`, `core/world/README.md`,
  `core/water/README.md`, `core/city/README.md`, and `settlements/pher/PLAN.md`.

---

## 0. Core adoption (`README.md`, "Core modules are not optional")

New build checklist (`tools/new_build/README.md`): register `settlements/eternian-canal` in `tools/checks_optin.json` at
creation; place it on the Scale Model 5.1 ground (`PLACED` in `tools/check_core_use.py`) so biome-sync rules apply from
day one; import `tools/build_sources.py` and call `report()` before the first write in `build.py`.

| Core module / kit | How `settlements/eternian-canal` takes it |
|---|---|
| `core/world` (`WORLD.H`, `ROADS`, terrain, streamed flora/floor, `41t` town land-hook) | `1:1` ground cut around `px 450.5, 782.0` (`2.5 × 2.5 km` walled/canalized core inside an `8 × 8 km` basin frame); `WORLD.landHook` carves rectilinear canal prism trenches, lock pits, settling basin, and stepped terrace pads into `WORLD.H` and registers baked town ground for `openworld/` streaming |
| `core/water` (`WATER.open`, `WATER.still`, `WATER.flow`, `WATER.fall`, `ext/53-core-water-terraces.js`) | **Stepped multi-elevation canal pounds** (`P3 = +61.87 m` river intake, `P2 = +58.87 m` upper trunk & settling basin, `P1 = +52.47 m` middle ward network, `P0 = +45.87 m` *Jìng-Hǎi* lake harbour — **never** a single sea-level plane), dynamic `y_chamber(t)` lock-chamber water surfaces, `WATER.flow` in `Hāk-Mā` & `Lōk-Mā`, `WATER.fall` on the `et_spillway` waste weir |
| `core/terrain` (`CORE_TERRAIN` carve patches) | Cut-and-cover masonry culvert portals under the East Kiln terrace and `et_culvert_aqueduct` arch openings over the `Lōk-Mā` spate wash |
| `core/city` (`KCITY`, `core/city/README.md`) | Rectilinear Eternian grid on `core/city` (`[G data]` records keyed by stable ids, zero DOM/Three.js in layout): typed `canal_trunk` (`20 m` ROW) and `canal_ward` (`14 m` ROW) ways alongside streets, quay-wall & towpath emission, bridge clearance rules, and dual street+water frontage lots (`warehouse`, `granary`, `kiln`, `mill`) |
| `core/engine` + `kits/eternian` | Building-kit runtime (`defBuilding`, merged material batches, sheet/host hand-over) + `kits/eternian` rectilinear timber-and-green-glaze buildings, canal walls, miter locks, bridges, spillways, clock tower, and 5 targeted canal extensions (§2.4) |
| `core/catalog` + `core/furnish` (`KFURN`) + `kits/interiors` | Eternian interior pieces (`kits/catalog/src/45-eternian.js`), indexed `KF.batch({indexed: true})` furnishing (`?interiors=1`) for lock-house, intendancy, granaries, guildhalls, tea-houses, and courtyard houses |
| `core/hamlet` (`KHAMLET.village`) | Two satellite agricultural/kiln hamlets inside the `8 km` frame (`Paddy-Weir` wet-rice village NNW on the lake plain; `Kaolin-Pit` clay/coal hamlet E on the `Hāk-Mā` bench) |
| `core/rand` (`KRAND`) | Every placement, barge schedule offset, crop parcel, and facade variant seeded from `(world, cell, id, salt)` — zero `Math.random`, zero draw-order drift, zero `Math.sin` hashes |
| `core/mask` (`KMASK.canvas`) | Canal trench masks, pound water-body masks, paddy bund polygons, and `WORLD.flora` suppression masks (`getImageData` never called) |
| `core/space` (`KSPACE`) | Shared occupancy & clearance queries for canal ways, bridge piers, quay cranes, moored barges, and `core/city` lots |
| `core/tags` (`KTAGS`) | Every lock chamber, miter gate, pound polygon, bridge span, quay berth, barge, lot, and building registered in `KTAGS` before geometry is drawn |
| `core/walk` (`KWALK`) + `core/clock` + `core/sched` | Continuous walkable graph across towpaths, stone quay stairs, humpback bridges, and lock-gate footwalks; deterministic `core/clock` + `core/sched` lock-cycling state machine and moving canal barges |
| `core/biome` + `core/atmos` (`biomes/nwlowlands`) | `NW lowlands` (`rmuqlni4tiwqm`) subtropical laurel/camphor/bamboo flora, paddy-edge reeds, `1.59 atm` warm-monsoon sky dome and fog |
| `core/lod` + `core/drawn` (`KDRAWN`) + `core/host` + `core/minimap` + `core/export` | Tiered range LOD, `KDRAWN` geometry accounting, standard camera/probe/inspector host, canal-pound minimap overlay, and Godot scene/record export (`[G data]`) |
| `core/charactermodels` | Eternian citizens (`data/peoples.json`): lock-keepers, barge polers, granary clerks, kiln potters, licensed salvage assessors |
| `core/simulation` (`SIM`) | Town stocks, `inland_river_canal_lake_barge` (`25 t`) vs `highway_wagon_convoy` (`15 t`) throughput proof, lock water-budget accounting, and `E7` granary/kiln balance |
| `tools/harness.py` | Shared `verify.py` runner (`smoke`, `walk`, `export`, GPU lane lock, stall watchdog, hydraulic & clearance `--assert` suite in §4.2) |

**Not taken (with reason):**
- **`core/coast` (`KCOAST`):** *Jìng-Hǎi* (`lbl=102`) is a sheltered fresh inland basin (`+45.87 m` ASL) fronted here by
  dressed Eternian ashlar quays, rubble breakwaters, and bunded polders rather than open-ocean surf/cliff geomorphic
  profiles (`core/water/farbed` + `et_quay` + bunded reed shallows handle the lake margin cleanly).
- **`core/camp` (`KCAMP`):** Settled Eternal State canal burgh and state agrarian polders; no nomad bands pitch inside
  the `8 km` basin frame.
- **`core/anomaly`:** `ruin_24km = 0 km²` on this bench (`Henge` `sf6a9gdawx` lies `94.8 km` NNE; `Veil` `448, 838`
  lies `112.1 km` S). Ancient salvage enters strictly as crated, state-sealed cargo off the `Veil` road, keeping the
  build focused on Eternian hydraulic engineering rather than Valley anomaly shaders.

---

## 1. Candidate Matrix & Site Selection (Non-Capital Eternia on Scale Model 5.1)

### 1.1 Why most canonical `60-settlements.js` Eternian pins cannot serve as a lowland canal testbed

All eleven canonical Eternian pins in `openworld/src/world/60-settlements.js` were audited first on raw Scale Model 5.1
(`h.png`, `wl.png`, `rivers.json`):

| Canonical pin (`id`) | `px, py` | Pop (`1:1`) | Raw `5.1` `E` (`m`) | `2.5 km` mean slope | Nearest river / lake | Suitability as moderate canal testbed |
|---|---|---|---|---|---|---|
| **`Fulcrum`** (`swbjnpbdar`) | `409, 621` | `85,000` | `+43.6 m` | `3.5 m/km` | `r002` `Līng-Mā` (`1,518 m³/s`) | **EXCLUDED PER OWNER** (capital planned separately later) |
| **`Lux`** (`s1ugpi6uas`) | `495, 645` (`498, 642` shore) | `18,000` | `-106.4 m` (`+117.7 m` shore) | `38.9 m/km` | `r162` `Sēk-Kē` (`29.1 m³/s`), Lake `+45.9 m` |Scored below as **#5** — raw pin is `152 m` underwater in `lbl=102`; snapped NE shore sits on a `72 m` bluff + major provincial seat + Ancient substation |
| **`Palewharf`** (`gem_palewharf`) | `565, 604` | `3,200` | `+606.8 m` | `56.1 m/km` | `r132` `Sīng-Mā` (`31.5 m³/s`, `9.7 km` W), Lake `lbl=77` `+429.8 m` | Scored below as **#6** — sits **`177 m` above** Jimjam's Lake on a `56 m/km` scarp |
| **`Corpus`** (`sn8n5y5wgu`) | `520, 693` | `11,000` | `+604.6 m` | `55.0 m/km` | `r014` `Hōng-Mā` (`14.1 km`), `42.8 km` from lake | Upland timber/tea valley town (`+605 m`); too steep and landlocked for barge trunk |
| **`Farport`** (`svsbhq4y04`) | `294, 588` | `7,500` | `+212.1 m` | `69.9 m/km` | `r163` (`29.2 m³/s`), NW Ocean `-0.2 m` | Cliff-top treaty port (`+212 m` above tsunami shelf); maritime crane/lift site, not canal grid |
| **`Tone`** (`sr4e1q5b1f`) | `368, 776` | `6,500` | `+453.7 m` | `32.5 m/km` | `r355` (`18.1 m³/s`), `17.1 km` W of lake | `408 m` above Mirror Sea in SW hills; music/lacquer conservatory town |
| **`Bastion`** (`sj6z88v6j3`) | `536, 627` | `9,000` | `+1,495.5 m` | `67.1 m/km` | `20.2 km` from `r132` | `1,495 m` mountain fortress holding the NE pass |
| **`Mirabilis`** (`s9h1fb5qsc`) | `350, 726` | `8,000` | `+3,125.0 m` | `97.9 m/km` | `11.7 km` from headwater | `3,125 m` alpine observatory & monastery |
| **`Veil`** (`gem_veil`) | `448, 838` | `3,800` | `+3,393.0 m` | `47.5 m/km` | `13.4 km` from headwater | `3,393 m` Ancients' Valley cordon garrison |
| **`Sheritu`** (`ss4k3k74p0`) | `384, 666` | `1,800` | `+3,597.7 m` | `55.8 m/km` | `21.2 km` from headwater | `3,598 m` high ridge sanctuary (`0.96 atm`) |
| **`Henge`** (`sf6a9gdawx`) | `457, 735` | `1,200` | `+49.4 m` | `1.5 m/km` | Island in `lbl=102` (`+45.9 m`), **no river** | Tiny `1,200`-soul island ruin-watch (`3.5 m` flat relief, zero river `Q` to feed upper locks) |

Because Eternia's lowland hydraulic heartland around *Jìng-Hǎi* (`lbl=102`, `26,912 km²` at `+45.87 m` ASL) intentionally
awaits its secondary river-mouth and outlet canal burghs (`PROPOSAL-ETERNIANS.md` §3, `E1`, `E3`, `E5`, `E7`), we scored
the top **six non-capital candidates** combining the two lakeside canonical pins (`Lux`, `Palewharf`) with the four
strongest river-to-lake / lake-outlet junctions from `PROPOSAL-ETERNIANS.md`.

### 1.2 Six-Candidate Non-Capital Scoring Matrix (`2.5 × 2.5 km` 1:1 Cut on Scale Model 5.1)

*Scoring rubric (`100 pts` total):* **Hydraulic & Lock Profile (`30`)** (perennial gravity feeder `Q`, natural `8–25 m`
bench drop to standing water without synthetic rivers or `100 m` gorges) · **2.5 km Terrace Buildability (`25`)**
(`0.5–2.0°` low-gradient bench for rectilinear `core/city` canal wards) · **6-Primitive Coverage (`20`)** (weir, lock
flight, trunk+ward canals, barge-clearing bridges, aqueduct/spillway, drydock/granary wharf in one town) · **Right-Sized
Non-Capital Scale (`15`)** (`~5,000–10,000` pop, clean scope without capital monumentality or Valley anomaly creep) ·
**Geology & Sim Fit (`10`)** (`WRES` clay/coal/iron/silica + `SIM` barge/road role).

| Rank & Candidate | Prov. & Status | `px, py` (cut ctr) & Dist. to `Fulcrum` | `E_cell` & `2.5×2.5 km` `p10..p90` / Slope (`WORLD.H`) | Perennial River `Q` & Basin `wlev` | Climate & Air (`tm`, `p`, Köppen, `atm`) | Geology (`WRES` cell / `24 km` max) | Canal Feature Coverage (`a–f`) & Engineering Verdict | Score |
|---|---|---|---|---|---|---|---|---|
| **EXCLUDED CONTROL:** `Fulcrum` (`swbjnpbdar`) | `E1` Capital (`85,000`) | `409, 621` (`0 km`) | `+43.6 m` · `+40.4..+48.6 m` · `3.5 m/km` (`0.20°`) | `Līng-Mā` `r002` **`1,517.6 m³/s`** · Tidal river | `26 °C`, `941 mm`, `Cfa`, `1.591 atm` | Clay `255`, Silica `150`, Coal `0/36`, Iron `0/40` | **STRICTLY EXCLUDED** per owner instruction (reserved for separate capital plan). | **EXCL.** |
| **#1 WINNER:** ***Chī-Mā* / *Shuāng-Zhá*** ("Twin-Locks") | `E7` Proposed Granary & Salvage Canal Burgh (`6,800`) | **`451, 782`** (`450.5, 782.0`) · `332.8 km` SSE | `+69.4 m` (`+62.8 m` ctr) · **`+47.7..+76.6 m`** (`28.9 m` span) · **`15.95 m/km`** (`0.91°`) | **`Hāk-Mā` `r012` `379.5 m³/s`** + **`Lōk-Mā` `r305` `29.2 m³/s`** -> Lake `lbl=102` **`+45.87 m`** (`Chī-Mā` `r016` `212.4 m³/s` `10.9 km` N) | `25 °C` (`18..33 °C`), `1,663 mm`, `Am` (`Cfa` margin), `1.586 atm` (ice-free) | **Coal `111/129`**, **Clay `60/255`**, **Silica `0/150`**, **Iron `40/40`**, Oil `60/68`, Peat `0/54` | **6 / 6 (`a–f` all native):** `379.5 m³/s` river feeds `+61.87 m` weir -> `+58.87 m` upper pound -> `+52.47 m` town grid -> `+45.87 m` lake harbour (`16.00 m` total drop across gentle `0.9°` terrace) + `Lōk-Mā` spate wash tests 3-arch canal aqueduct! | **`95 / 100`** |
| **#2 RUNNER-UP:** ***Līng-Kǒu* / *Ling-Mouth*** | `E1` Proposed Lake-Outlet Lock Town (`5,500`) | **`445, 645`** (`445.0, 645.3`) · `86.5 km` SE | `+54.9 m` · **`+48.4..+59.9 m`** (`11.5 m` span) · **`7.08 m/km`** (`0.41°`) | Head of `Līng-Mā` `r002` **`1,517.6 m³/s`** exiting Lake `lbl=102` **`+45.87 m`** | `26 °C` (`20..32 °C`), `894 mm`, `Aw`, `1.589 atm` | **Clay `245/255`**, **Iron `40/180`**, Silica `0/150`, Coal `45/49` | **4.5 / 6:** Superb flat `0.41°` bench on the main `Fulcrum–Lux` trunk, **but** raw `5.1` `h.png` has an `8–9 m` dry sill (`+54.0..+54.9 m`) *above* Lake `+45.87 m` with **no upland feeder river** to fill a high summit pound — cuts down to a `1.5–3 m` single regulating lock unless a synthetic feeder stream is invented. | **`86 / 100`** |
| **#3:** ***Wū-Xī* / Black-Seam Colliery Wharf** | `E5` Proposed Coal & Oil Barge Wharf (`4,800`) | `416, 782` (`415.8, 782.0`) · `322.3 km` S | `+52.6 m` · `+42.4..+77.1 m` (`34.7 m` span) · `19.78 m/km` (`1.13°`) | `Chī-Kē` `r230` **`18.3 m³/s`** -> SW Lake `lbl=102` **`+45.87 m`** | `25 °C`, `2,008 mm`, `Am`, `1.590 atm` | **Coal `168/168`** (Eternia #1), **Clay `255`**, **Silica `150`**, **Oil `103/108`** | **5 / 6:** Good bench and peak coal/clay/oil geology, but small feeder discharge (`18.3 m³/s` limits multi-flight lock cycling + industrial mill race) and heavy colliery specialization near Yusar border (`Carcosa` `30 km` S). | **`79 / 100`** |
| **#4:** ***Hōng-Mā* River-Mouth Wharf** | `E3` Proposed Timber/Tea Port below `Corpus` (`4,500`) | `500, 688` · `226.0 km` ESE | `+64.4 m` · `+42.5..+105.7 m` (`63.2 m` span; `93.7 m` full relief) · `33.81 m/km` (`1.94°`) | `Hōng-Mā` `r014` **`330.4 m³/s`** -> E Lake `lbl=102` **`+45.87 m`** | `26 °C`, `2,776 mm`, `WS`/`Af`, `1.587 atm` | **Clay `255`**, **Silica `150`**, Coal `111/129`, Iron `40/40` | **5 / 6:** Strong `330 m³/s` river, but valley walls jump to `+188 m` (`y=686`) and `+300 m` (`y=690`), pinching lateral `core/city` ward canals into a steep chute (`33.8 m/km`). | **`74 / 100`** |
| **#5:** **`Lux`** (snapped NE shore) | `E3` Canonical Provincial Seat (`18,000`) | `498, 642` (raw `495,645` is `-106 m` in lake) · `182.9 km` E | `+117.7 m` · `+44.7..+134.9 m` (`90.2 m` span; `104.3 m` relief) · `38.91 m/km` (`2.23°`) | `Sēk-Kē` `r162` **`29.1 m³/s`** -> NE Lake `lbl=102` **`+45.87 m`** | `26 °C`, `1,380 mm`, `Am`, `1.577 atm` | **Clay `255`**, **Silica `150`**, Coal `74/134`, Iron `40/40` | **4 / 6:** `72 m` coastal bluff requires a `15+` lock staircase on `29 m³/s`, plus `18,000` pop + Imperial porcelain dragon-kilns + Ancient power substation (`ruin_24km = 4 km²`) warrants its own major city build *after* canal tech is proven. | **`68 / 100`** |
| **#6:** **`Palewharf`** (`gem_palewharf`) | `E4` Canonical Eastern Lake Port (`3,200`) | `565, 604` (or `560.6, 602.6` river) · `313.8 km` ENE | `+606.8 m` · `+536.2..+676.0 m` (`139.8 m` span) · `56.05 m/km` (`3.21°`) | `Sīng-Mā` `r132` **`31.5 m³/s`** (`9.7 km` W) -> Lake `lbl=77` **`+429.78 m`** | `24 °C`, `659 mm`, `Csa`, `1.483 atm` | Clay `60/255`, Coal `52/115`, Silica `0/150` | **2.5 / 6:** Pin is **`177 m` above** Jimjam's Lake on a `56 m/km` (`p90 = 95.8 m/km`) scarp `9.7 km` from water; requires either relocating the pin onto a re-cut shore or building an incline railway rather than a canal grid. | **`58 / 100`** |

### 1.3 Winner vs. Runner-Up Summary

- **Recommended Winner — *Chī-Mā* / *Shuāng-Zhá* ("Twin-Locks", `px 451, 782`, `2.5 × 2.5 km` cut centered at
  `450.5, 782.0`):**
  1. **Real, unedited 5.1 gravity hydraulics:** `Hāk-Mā` (`r012`, **`379.5 m³/s`**, Eternia's #3 river) descends smoothly
     out of the SE foothills (`+139.4 m -> +110.9 m -> +73.0 m`) onto a broad `0.91°` (`15.95 m/km`) alluvial-lacustrine
     terrace (`+69.4 m -> +56.3 m`) directly into *Jìng-Hǎi* (`lbl=102`, **`+45.87 m` ASL**), with natural `-7.6 m` deeper
     lakebed (`+38.28 m` bilinear) immediately offshore for harbour berths.
  2. **Natural `16.00 m` head-drop = textbook lock flight, not an extreme gorge:** Four stepped water levels (`+61.87 m`
     weir -> `+58.87 m` upper trunk -> `+52.47 m` middle town grid -> `+45.87 m` lake harbour) can be crossed by two
     compact **paired 2-riser bronze miter-lock flights** (`3.20 m` and `3.30 m` per chamber), exercising multi-pound
     `core/water` rendering, stateful lock-chamber filling, and `core/city` stepped quays without building a 20-lock cliff
     ladder.
  3. **Bonus cross-drainage stream for the aqueduct primitive:** `5.9 km` SE (`452.2, 784.7`), tributary `Lōk-Mā` (`r305`,
     `29.2 m³/s`) sends a perennial/monsoon wash across the southern bench edge — giving an authentic terrain reason to
     carry the upper feeder/trunk canal across a **3-arch stone masonry aqueduct (`et_culvert_aqueduct`)** with an
     adjacent **ancestor-mouth waste-weir (`et_spillway`)**.
  4. **Complete Eternian economic microcosm at `6,800` souls:** Anchors `PROPOSAL-ETERNIANS.md` province **`E7` (South
     Shore & Veil Road, `71,000` provincial pop, `38,739 km²` `farm-eq` — Eternia's largest agricultural breadbasket)**:
     state rice granaries, coal-fired celadon/stoneware kilns (`coal = 111`, `clay = 255` within `24 km`), mulberry/tea/
     lacquer mills, and the fortified water-transshipment customhouse where sealed Ancients' Valley salvage coming down the
     state road from `Veil` (`448, 838`) boards `25 t` Mirror Sea state barges.

- **Runner-Up Alternative — *Līng-Kǒu* / *Ling-Mouth* (`px 445, 645`, `E1` Outlet Lock-Town, `5,500` pop):**
  - Choose *Līng-Kǒu* instead **only if** the owner specifically wants the first canal build to sit on the northern
    `Fulcrum <-> Lux` grand trunk where *Jìng-Hǎi* (`+45.87 m`) drains into `Līng-Mā` (`r002`, `1,517.6 m³/s`). Be aware
    that on raw 5.1 `h.png`, cells `444, 644` (`+54.0 m`) and `445, 645` (`+54.9 m`) form an `8–9 m` sill *higher* than
    the lake with no higher-elevation perennial river to feed a summit pound — so `WORLD.landHook` (or a scale-model edit)
    must breach that sill below `+45.8 m`, making *Līng-Kǒu* a flat `1.5–2.5 m` regulating/guard-lock port rather than a
    multi-stepped gravity lock flight.

---

## 2. Scale Model 5.1 Site Survey (`px 451, 782` — *Chī-Mā* / *Shuāng-Zhá*)

### 2.1 Coordinates & `7 × 7` Pixel Elevation Grid (`2 km/px`)

- **Settlement pin:** `px = 451, py = 782` (world `x = -1,480,000 m, z = -1,574,000 m` from origin `1191, 1569`).
- **`2.5 × 2.5 km` walled/canalized cut center:** `px = 450.5, py = 782.0` (`-1,481,000 m, -1,574,000 m`), spanning
  `1,250 m` from center (`x ∈ [449.875, 451.125]`, `y ∈ [781.375, 782.625]`) so the NW quadrant embraces the sheltered SE
  cove of *Jìng-Hǎi* (`+45.87 m` lake over `+38.28 m` harbour bed = **`7.59 m` natural harbour depth**), the central strip
  holds the `+52.47 m` middle canal town, and the SE quadrant rises gently to `+76.6 m` (`p90`) where `Hāk-Mā` enters.
- **`8.0 × 8.0 km` outer landscape & polder frame:** `x ∈ [448.5, 452.5]`, `y ∈ [780.0, 784.0]`.

Raw `h.png` / `wl.png` `7 × 7` neighborhood (`W+45.9` = standing lake water `lbl=102` at **`+45.87 m` ASL**; land values in
meters ASL):

| `py \ px` | `448` | `449` | `450` | **`451`** | `452` | `453` | `454` |
|---|---|---|---|---|---|---|---|
| **`779`** | `W+45.9` | `W+45.9` | `+59.0` | `+169.2` | `+288.9` | `+413.1` | `+537.7` |
| **`780`** | `W+45.9` | `W+45.9` | `W+45.9` | `W+45.9` | `+213.0` | `+327.3` | `+446.9` |
| **`781`** | `W+45.9` | `W+45.9` | `W+45.9` | `W+45.9` | `+144.3` | `+241.0` | `+372.4` |
| **`782`** | `+119.5` | `+86.5` | **`+56.3`** | **`+69.4` (pin)** | **`+96.0`** | `+181.4` | `+257.2` |
| **`783`** | `+187.7` | `+143.9` | `+97.8` | **`+81.1`** | **`+73.0` (`r012`)** | `+124.5` | `+194.5` |
| **`784`** | `+246.9` | `+206.7` | `+163.3` | `+128.5` | **`+96.9` (`r305`)** | `+110.9` | `+138.5` |
| **`785`** | `+301.1` | `+264.5` | `+225.6` | `+181.8` | `+136.7` | `+119.5` | `+110.9` |

Read the landform directly off the grid:
- Cells `(450, 782)` **`+56.3 m`**, `(451, 782)` **`+69.4 m`**, `(451, 783)` **`+81.1 m`**, and `(452, 783)` **`+73.0 m`**
  form a natural **SE-to-NW river-mouth amphitheater bench** (`15.95 m/km` = `0.91°` mean slope across the `2.5 × 2.5 km`
  cut; Catmull-Rom `WORLD.H` mean slope `14.89 m/km`), sheltered on the NE by a wooded headland spur (`452, 781` at
  `+144.3 m`) and opening NW onto calm `lbl=102` lake water (`450..451, 780..781` at `+45.87 m`).

### 2.2 Hydrology & Perennial River Vectors (`rivers.json`)

1. **`Hāk-Mā` (`r012`, "Black-Water River"):** **`Q = 379.5 m³/s`**, `187 km` mainstem draining the SE border highlands.
   Final nodes: `(456.2, 786.8, +139.4 m) -> (454.2, 784.7, +110.9 m) -> (452.2, 782.7, +73.0 m)` -> enters *Jìng-Hǎi*
   bay (`+45.87 m`) along the NE flank of the town bench. Even in the driest winter month (`~140 m³/s` baseflow),
   diverting **`8.5 m³/s`** (`2.2%` of mean `Q`) into the canal intake weir supplies **>12× the water needed** for continuous
   twin-lock cycling (`~0.65 m³/s` at `120` lockages/day), mill-races (`4.5 m³/s`), and polder irrigation (`3.0 m³/s`).
2. **`Lōk-Mā` (`r305`, "Six/Lock Stream"):** **`Q = 29.2 m³/s`**, steep foothill stream descending from the southern cordon
   scarp (`456.2, 818.7, +1,000 m`) to `(452.2, 784.7)` just south of the `Hāk-Mā` fan. Its lower spate channel skirts the
   southern edge of the upper terrace before joining the `Hāk-Mā` / lake bay — providing the exact ravine crossed by our
   **3-arch masonry canal aqueduct (`et_culvert_aqueduct`)**.
3. **`Chī-Mā` (`r016`, "Seven-River"):** **`Q = 212.4 m³/s`**, `169 km` river entering *Jìng-Hǎi* `10.9 km` N at
   `(450.2, 776.6, +75.7 m)` across the coastal rice plain; connected to town by the North Shore Towpath & Paddy Canal.

### 2.3 Climate, Crops (`CROPS.at`) & `WRES` Geology

- **Climate & Atmosphere:** Tropical/subtropical monsoon margin (`Am` bordering `Cfa`), mean `T = 25.0 °C` (winter `18 °C`,
  summer `33 °C` — **zero frost, zero canal ice-lock**), `Rain = 1,663 mm/yr`, air pressure **`1.586 atm`** (`CROPS` axis
  `warmth: 3, atm: 1, arid: 3, wet: true`, matching `biomes/nwlowlands`).
- **Verified `CROPS.at` palette (`kits/crops/`):**
  - *Staple grains, pulses & tubers:* **`rice`** (bunded double-crop lake-plain paddies — the state granary staple),
    `emmer`, `helix-bean`, `sweet-potato`, `murnong`.
  - *Industrial & state-monopoly tree/cash crops:* **`tea`** (bench slopes), **`mulberry`** & **`lotus-silk`** (sericulture
    & pond silk), **`cotton`**, `flax`, **`bamboo`**, `mat-reed`, `willow`, **`woad`** (indigo glaze/cloth dye),
    **`camphor`**, `whorl-olive`, `tobacco`, plus `PROPOSAL-ETERNIANS.md` §5.3's **`lacquer-tree`** (`Rhus verniciflua`).
  - *Orchard & dark-bed cellar crops:* `persimmon`, `apricot`, `citron`, `pomegranate`, `fig`, `canyon-grape`, `saffron`,
    and dark-cellar `alecap`, `pale-fungi`, `glow-mushroom`, `lamp-cap`.
- **Geology (`kits/resources/data/geology.json` sedimentary basin margin, cell / `24 km` radius):**
  - **`coal = 111 / 129`** (`WRES` seam on the SE bench fuels stoneware/celadon kilns and brass steam-boilers without
    stripping highland timber);
  - **`clay (kaolin/ball clay) = 60 / 255`** & **`silica = 0 / 150`** (`8–16 km` along the shore bench for glazed green
    roof tiles, stoneware canal-pipe joints, and celadon export ware);
  - **`iron = 40 / 40`** & **`copper = 10 / 10`** (local smithing; tin/bronze lock-gate castings imported down the lake
    from `Fulcrum` / `Lux` state foundries);
  - **`oil = 60 / 68`** (lamp/lubricating seep tar for lock-gate quoins and barge hull caulking).
- **Regional network links:**
  - **South State Cordon Highway (`118 km` S -> `Veil` `448, 838`):** Paved `0.72x`-friction Eternian stone highway climbs
    the `Lōk-Mā` / `Hāk-Mā` corridor to `Veil` (`3,393 m`), bringing down state-inventoried Ancients' Valley salvage and
    carrying up rice, coal, salt, and relief troops.
  - **Mirror Sea Barge Ring (`lbl=102`, `+45.87 m`):** Direct `25 t` state barge runs NNW to *Līng-Kǒu* (`445, 645`,
    `274 km` lake route -> `88 km` `Līng-Mā` down to `Fulcrum`), NNE to `Henge` (`457, 735`, `95 km`) & `Lux` (`498, 642`,
    `295 km`), and W across the south basin to *Wū-Xī* Colliery (`416, 782`, `70 km`).

---

## 3. Canal Infrastructure Architecture & Engineering Spec

### 3.1 Four-Pound Stepped Hydraulic Profile (`16.00 m` Total Head Drop)

Rather than faking canals with a flat sea-level plane or static `box('water')` blocks inside building meshes, the town's
water network is modeled as **four explicit hydraulic pounds (`P3 -> P0`)** descending `16.00 m` from the `Hāk-Mā` intake
weir to *Jìng-Hǎi*:

```
[Hāk-Mā River r012, 379.5 m³/s]
        │
  (Intake Weir + Desilting Sluice: +61.87 m ASL, Pound P3)
        │  ── Head Regulator Gate (Δh = 3.00 m, +4.5 m³/s mill-race bypass to Kiln/Paper wheels)
        ▼
  ══ Pound P2: Upper Feeder, 3-Arch Lōk-Mā Aqueduct & Settling Basin (+58.87 m ASL, depth 2.4 m, bed +56.47 m) ══
        │  ├─► Ancestor-Mouth Waste-Weir Spillway (`et_spillway`, 13.0 m cascade back to Hāk-Mā tailwater)
        │
  [Upper Twin-Lock Flight L2a + L2b: 2 chambers × Δh = 3.20 m = 6.40 m drop; paired up-bound / down-bound lanes]
        ▼
  ══ Pound P1: Middle Town Trunk & Ward Canal Grid (+52.47 m ASL, depth 2.5 m, bed +49.97 m, quay cope +53.87 m) ══
        │  ├─► Primary Grand Trunk Canal (`20 m` ROW: `11.0 m` water + `2 × 4.5 m` stone quay towpaths, length `1,150 m`)
        │  ├─► East Kiln & Mill Lateral (`14 m` ROW: `7.6 m` water + `2 × 3.2 m` quays, length `680 m`)
        │  ├─► West Market & Courtyard Lateral (`14 m` ROW: `7.6 m` water + `2 × 3.2 m` quays, length `640 m`)
        │  └─► Central Granary & Salvage Turning Basin (`56 × 48 m` clear water, `2.8 m` depth)
        │
  [Lower Twin-Lock Flight L1a + L1b: 2 chambers × Δh = 3.30 m = 6.60 m drop past the Clock-Tower Intendancy]
        ▼
  ══ Pound P0: Jìng-Hǎi Lake Harbour, Drydock & Breakwater Basin (+45.87 m ASL, bed +38.3..+42.8 m, quay +47.47 m) ══
```

**Why this `16.00 m` profile is ideal for testing:**
- Every pound (`P3`, `P2`, `P1`, `P0`) sits `1.2–2.2 m` **below** its surrounding graded terrace ground (`+63.5 m`,
  `+60.3 m`, `+53.87 m`, `+47.47 m`), guaranteeing **zero accidental flooding of adjacent building lots** while keeping
  quay freeboard at an ergonomic `1.40–1.60 m` for cargo cranes and stepped landings.
- Each individual miter-lock lift is **`3.20 m` (`L2`) or `3.30 m` (`L1`)** — realistic pre-industrial masonry/bronze
  engineering (comparable to Grand Canal of China / Briare summit locks), avoiding cavernous `10 m` shafts.
- Pairing two parallel lanes (`up-bound` and `down-bound`, sharing a central `4.0 m` masonry island pier with cross-culvert
  economizer sluices) explains the burgh's name (*Shuāng-Zhá*, "Twin-Locks") and allows opposing barges to pass without
  deadlock in `core/sched`.

### 3.2 Multi-Elevation Water Surfaces in `core/water` + `WORLD.landHook` Trench Deltas

1. **Terrain trenching (`WORLD.landHook` in `[G data]`):**
   - Each canal segment, turning basin, settling pond, and lock chamber is stored as an oriented `[G data]` prism record
     `(id, poundId, polyline, waterW, bedY, copeY, batter)`.
   - `WORLD.landHook(x, z, h0)` blends the natural `5.1` terrain onto the three graded town benches (`+60.3 m`, `+53.87 m`,
     `+47.47 m`) and carves smooth-walled trapezoidal trenches down to `bedY` (`P2: +56.47 m`, `P1: +49.97 m`, `P0` inner
     basin: `+42.87 m`), so terrain never pokes through water planes and cut-away camera angles see real stone-lined beds.
2. **Water rendering (`core/water`):**
   - **Pound `P0` (`+45.87 m`):** `WATER.open` for *Jìng-Hǎi* (`lbl=102`), seamlessly meeting harbour quays at `+45.87 m`.
   - **Pounds `P1` (`+52.47 m`), `P2` (`+58.87 m`), `P3` (`+61.87 m`):** One masked `WATER.still` horizontal polygon mesh per
     pound (built from the union of that pound's trunk, ward laterals, and basins via `KMASK`), carrying `core/water`'s
     absorption, shore-foam, and sky reflection at its exact `wlev` (`+52.47 m`, `+58.87 m`, `+61.87 m`).
   - **Lock Chambers (`L1a, L1b, L2a, L2b`):** Four independent `24.0 × 5.6 m` `WATER.still` rectangles whose `position.y`
     is driven by the deterministic lock state machine `y_chamber(clockT) ∈ [y_low, y_high]`, with `WATER.fall` / foam
     ribbons active at the bronze paddle-sluices during `FILLING` and `EMPTYING`.
   - **Rivers & Spillway:** `WATER.flow` ribbon meshes along `Hāk-Mā` (`+76 m -> +45.87 m`) and `Lōk-Mā` (`+97 m -> +45.87 m`
     passing *under* the `+58.87 m` `P2` aqueduct!), plus `WATER.fall` on the `13.0 m` `et_spillway` drop from `P2` back to
     `Hāk-Mā`.

### 3.3 `core/city` Canal-Way, Quay-Frontage & Bridge Contract (`[G data]`)

To make Eternian canals reusable across `Lux`, `Fulcrum`, and Voth/Ring Sea ports rather than bespoke to one build,
`settlements/eternian-canal` exercises a clean `[G data]` canal extension on `core/city` records:

| Way class (`way.kind`) | Total ROW | Wet Prism (`waterW × depth`) | Quay & Towpath (`each side`) | Min Bridge Span × Air-Draft | Allowed Lot Frontage |
|---|---|---|---|---|---|
| `canal_trunk` | **`20.0 m`** | **`11.0 m × 2.5 m`** (two `4.4 m` barges pass w/ `2.2 m` clearance) | **`4.5 m`** (`1.2 m` ashlar cope + `3.3 m` paved towpath/cart quay) | **`11.0 m` clear span × `2.80 m` air-draft** above `wlev` | Civic, State Granary, Salvage Customhouse, Guildhall, Rich Merchant |
| `canal_ward` | **`14.0 m`** | **`7.6 m × 2.0 m`** (one `4.4 m` barge + moored `2.2 m` punt) | **`3.2 m`** (`1.0 m` cope + `2.2 m` flagged foot/handcart towpath) | **`7.6 m` clear span × `2.60 m` air-draft** above `wlev` | Kiln, Paper/Lacquer Mill, Warehouse, Tea-house, Shop-house, Courtyard House |
| `canal_feeder` | **`10.0 m`** | **`5.6 m × 1.8 m`** (water-supply & scow channel) | **`2.2 m`** inspection walk | **`5.6 m` span × `2.20 m` air-draft** | Intake Weir, Aqueduct, Mill-race, Settling Basin |

**Four `core/city` rules tested in pure `[G data]`:**
1. **Dual-frontage water lots (`lot.waterFront`):** Lots backing or facing onto a `canal_trunk` or `canal_ward` receive
   both a dry street entrance (`lot.frontEdge`) and a wet quay berth (`lot.waterEdge`, `quayY = wlev + 1.40 m`), automatically
   placing recessed water-stairs (`et_canal_landing`) or overhanging hoist-gables (`granary` / `warehouse`) without manual
   coordinates.
2. **Bridge intersection solver (`KCITY.canalBridges`):** Wherever a primary street or ward lane crosses a canal way,
   `core/city` inserts a bridge record (`et_cart_bridge` for avenues, `et_bridge` for foot lanes), ramps the street
   approaches at `≤ 1:8` (`12.5%`) grade so `deckBottomY >= pound.wlev + minAirDraft`, and threads `KWALK` across the deck
   while keeping the towpath continuous (`≥ 2.1 m` headroom under the bridge haunches where space permits, or level deck
   crosswalk at the ramp toe).
3. **Zero-flooded-lot invariant:** `KCITY` lot elevation solver enforces `lot.padY >= adjacentPound.wlev + 1.35 m` across
   every parcel and courtyard.
4. **Lock-chamber state machine (`[G data]` in `core/sched`):** Each lock chamber cycles deterministically on a `6-minute`
   (`360 s`) period (`LOWER_OPEN 60 s -> CLOSING_LOWER 20 s -> FILLING 90 s -> UPPER_OPEN 70 s -> CLOSING_UPPER 20 s ->
   EMPTYING 100 s`), swinging the paired bronze miter leaves (`0° <-> 68°` into recessed wall pockets) only when water head
   across that gate is `< 0.02 m` (the physical miter-gate law!).

### 3.4 Audit of `kits/eternian` Pieces vs. 5 Targeted Additions

**Already built and verified in `kits/eternian` (`src/70-et-canal.js`, `src/71-et-harbour.js`):**
- `et_canal` (`seed 7701`, `20 × 10.2 m` ashlar section), `et_bridge` (`7702`, `4 × 13 × 4.4 m` pointed-arch footbridge),
  `et_canal_street` (`7703`), `et_lock` (`7704`, `30 × 15 × 5 m` bronze miter gates + capstans), `et_reservoir_wall`
  (`7705`), `et_spillway` (`7706`, `24 × 20 × 22 m` carved ancestor-mouth cascade), `et_canal_landing` (`7707`),
  `et_ferry_landing` (`7708`), `et_fish_landing` (`7709`), `et_quay` (`7710`), `et_dock` (`7711`, slipway + framed hull),
  plus `et_granary`, `et_warehouse`, `et_kiln`, `et_clock_tower`, `et_yamen`, `et_guildhall`, `et_market`, `et_tea_house`,
  and `et_tube_pipe`.

**Five targeted kit/vessel additions (`kits/eternian/src/70b-et-canal-ext.js` & `71b-et-barges.js`) to test full functionality:**
1. **`worldWater` & parameterized `et_lock` (`24 × 5.6 m` clear chamber, `Δh = 2.0–3.5 m`):** Adds `{worldWater: true}`
   option to `et_canal` and `et_lock` suppressing their baked sheet `box('water')` slabs so `core/water` pounds and
   dynamic `y_chamber(t)` planes own the water surface, and exposes the four bronze miter leaves as named sub-pivots for
   real gate rotation.
2. **`et_cart_bridge` (`seed 7712`):** `7.2 m` wide stone humpback wagon/avenue bridge (`11.0 m` clear span, **`2.85 m`
   crown air-draft** above `wlev`, `1:8` stepped-cobble wheel tracks + central smooth barrow strips, carrying twin
   insulated brass `et_tube_pipe` mains under the parapet cornice). *(Existing `et_bridge` clears `~1.50 m` on the sheet,
   fine for punts on `canal_ward` when seated on `+1.40 m` quays = `2.90 m` total air-draft, whereas `et_cart_bridge`
   carries ox-wagons across the `11.0 m` `canal_trunk`.)*
3. **`et_intake_weir` (`seed 7713`) & `et_sluice_gate` (`seed 7714`):** Oblique cut-stone river diversion weir with timber
   trash-rack booms + geared bronze rack-and-pinion desilting gatehouse under a green-glazed hipped pavilion.
4. **`et_culvert_aqueduct` (`seed 7715`):** `36 × 11 × 9 m` three-arch dressed-stone masonry canal trough lined with
   lead-caulked ashlar and flanked by cantilevered ironwood towpaths, carrying Pound `P2` (`+58.87 m`) clear over the
   `Lōk-Mā` spate bed (`+51.0 m`).
5. **Eternian Canal Craft (`et_canal_barge`, `et_tow_scow`, `et_inspection_launch`):** `kits/ringsea` (`85-rs-voth-barge.js`)
   contains only Ring Sea / Voth vessels, and `et_canal_landing` currently uses an `8 × 2.4 m` 3-box stand-in. We add three
   proper Eternian river/lake hulls sized strictly to the lock & bridge envelope:
   - **`et_canal_barge` (`20.0 m` LOA × `4.4 m` beam × `1.25 m` loaded draft × **`1.95 m` max air-draft** with hinged
     mast/sweep lowered):** bluff-bowed ironwood hull, green-glazed/lacquered deckhouse aft, sliding camphorwood cargo
     hatches (swappable cargo loads: sacked state rice, celadon kiln crates, coal bulk, or lead-sealed Ancients' Valley
     salvage chests); **`25.0 t` rated / `18.5 t` average `SIM` payload**.
   - **`et_tow_scow` (`12.0 × 3.2 × 1.35 m` air-draft):** open flat-bottomed ward lighter for coal, kaolin clay, and night-soil/ash,
     able to turn inside `14 m` `canal_ward` basins.
   - **`et_inspection_launch` (`10.5 × 2.5 × 1.75 m` air-draft):** sleek brass-trimmed Canal Intendancy dispatch boat.

### 3.5 `SIM` Throughput Proof: `25 t` Canal Barge vs. `15 t` State Wagon Convoy (`trade-fleets-gemini.json`)

Using the repo's canonical carrier specs (`openworld/trade-fleets-gemini.json` & `PROPOSAL-ETERNIANS.md` §4):

| Metric | `inland_river_canal_lake_barge` (Canal + *Jìng-Hǎi*) | `highway_wagon_convoy` (`0.72x` Eternian State Road) | `pack_caravan` (Foothill / Cordon Trail) |
|---|---|---|---|
| **Rated / Mean Payload** | **`25.0 t` / `18.5 t`** (1 hull) | **`15.0 t` / `11.5 t`** (10 ox/mule wagons) | **`6.0 t` / `4.5 t`** (35 pack beasts) |
| **Crew & Draught Beasts** | **`3–4` crew, `0` beasts** (wind on lake; 1 mule/human tow on canal) | **`14` teamsters/guards + `20` draught beasts** | **`12` drovers + `35` pack beasts** |
| **Daily Speed & Active Days** | **`48 km/day`** canal (`58 km/day` lake) · `285 days/yr` | **`34 km/day`** · `270 days/yr` | **`24 km/day`** · `250 days/yr` |
| **Fodder Self-Consumption** | **`0 kg/day` grain/hay** burned by beasts | **`~160 kg/day`** fodder (`14%` of payload eaten per `100 km`!) | **`~210 kg/day`** fodder (`47%` eaten per `100 km`!) |
| **Relative Freight Multiplier** | **`0.18×`** (`1.0×` baseline) | **`0.72×`** (**`4.0×` costlier** per ton-km) | **`1.53×`** (**`8.5×` costlier** per ton-km) |
| **Annual Delivered Tonnage (`362 km` to `Fulcrum`)** | **`~350 t/yr` per barge** (`18` barges move `6,300 t/yr` surplus w/ `64` sailors) | Needs **`55` ten-wagon convoys** (`1,100` oxen + `770` men!) | Economically impossible for bulk rice/coal |

This table is wired directly into the town's `SIM` stocks proof (`test-canal-sim.js`): `Veil`'s high-value/low-bulk salvage
and upland tea/lacquer descend the `118 km` mountain highway by `highway_wagon_convoy` to *Shuāng-Zhá*'s Middle Turning
Basin, where they meet `E7`'s bulky rice (`4,200 t/yr`), coal (`1,400 t/yr`), and celadon stoneware (`700 t/yr`) and step
onto `18` registered *Shuāng-Zhá* state barges (`15%` of Eternia's `119`-barge inland fleet).

---

## 4. Ward-by-Ward Town Layout & `1:1` Census (`6,800` People)

### 4.1 Reconciliation with `PROPOSAL-ETERNIANS.md` (`1:1` Single-Counted Headcount)

In `PROPOSAL-ETERNIANS.md` §3–§3.2, Province **`E7` (South Shore & Veil Road)** holds **`71,000` single-counted souls**:
`3,800` in the `Veil` mountain cordon garrison (`448, 838`) and **`67,200`** across the South Shore agricultural polders,
kiln villages, and unnamed river-mouth canal burghs. Seating *Chī-Mā* / *Shuāng-Zhá* at `451, 782` crystallizes **`6,800`**
of `E7`'s existing `67,200` lowland pool (plus **`620`** in the two `8 km`-frame `KHAMLET` satellites: `Paddy-Weir` `380`
and `Kaolin-Pit` `240`), leaving `59,780` in rural `E7` districts — **changing Eternal State total population by `0`
(`475,000` `1:1` single-counted exact)**.

### 4.2 Six Rectilinear Wards (`2.5 × 2.5 km` Cut Centered at `450.5, 782.0`)

Oriented at **bearing `318°` (NW toward *Jìng-Hǎi*)** so the Grand Trunk Canal runs dead straight down the natural fall-line
from `Hāk-Mā` (`SE`) to the lake cove (`NW`) while lateral ward canals follow the `0.4°` contour benches:

| Ward | Pound & Terrace `padY` | Key Infrastructure & `kits/eternian` Landmarks | Households | Pop (`1:1`) | Primary Trades & `SIM` Role |
|---|---|---|---|---|---|
| **W1. Lower Lake Harbour & Drydock Ward** (*Hǎi-Kǒu*) | `P0 = +45.87 m` · `padY = +47.5 m` | Twin rubble-and-ashlar breakwaters (`et_reservoir_wall`), `380 m` dressed lakefront (`et_quay`), `2`-slip barge drydock & carpenter yard (`et_dock`), Harbour Customhouse, ferry & reed-boat fish landings (`et_ferry_landing`, `et_fish_landing`), Harbor Beacon | `245` | **`1,120`** | Barge shipwrights, caulkers, lake mariners, net-fishers, rope/sail lofts |
| **W2. Twin-Lock Staircase & Clock Intendancy** (*Shuāng-Zhá Zhōng*) | Steps `P0 (+45.87 m) <-> P1 (+52.47 m)` & `P1 <-> P2 (+58.87 m)` | **Lower (`L1a/b`) & Upper (`L2a/b`) Paired Bronze Miter-Lock Flights**, Canal Intendancy Yamen (`et_yamen`), **Water-Clock Drum Tower (`et_clock_tower`)** timing lock slots & shift bells, Lock-Keepers' Guild, brass steam-pump & pipe manifold house | `135` | **`580`** | Hydraulic engineers, lock-keepers, water-bailiffs, telegraph/ledger clerks, cordon watch (`60` guards) |
| **W3. Middle Trunk Granary & Salvage Quays** (*Cāng-Qú*) | `P1 = +52.47 m` · `padY = +53.9 m` | **`56 × 48 m` Central Turning Basin**, `4` State Ever-Normal Rice Granaries (`et_granary`), **Sealed Valley-Salvage Assay Vault & Caravanserai Yard** (terminus of the `Veil` highway, transferring wagon crates directly across the quay into barges), `2` `et_cart_bridge` spans | `210` | **`960`** | State granary factors, licensed salvage appraisers, crane stevedores, wagon teamsters, coopers |
| **W4. East Lateral Kiln, Coal & Mill Ward** (*Dōng-Yáo*) | `P1 = +52.47 m` (`+4.5 m³/s` `P3->P1` mill-race) · `padY = +54.2 m` | `680 m` `canal_ward` (`14 m` ROW), `3` coal-fired celadon/green-glaze tile kilns (`et_kiln`), undershot waterwheel clay-pugger, mulberry-bark paper & lacquerware workshops, coal & kaolin scow wharves, `3` `et_bridge` footspans | `330` | **`1,540`** | Celadon & roof-tile potters, coal/clay lightermen, lacquerers, paper-makers, brass-pipe smiths |
| **W5. West Lateral Courtyard & Market Grid** (*Xī-Fāng*) | `P1 = +52.47 m` · `padY = +54.0 m` | `640 m` `canal_ward` (`14 m` ROW) lined by willow-shaded `et_canal_street` quays, `et_market` covered hall, `2` overhanging canal `et_tea_house` pavilions, Silk & Tea Guildhall (`et_guildhall`), bathhouse, ancestral hall, `190` middle/artisan courtyard houses w/ private water-stairs | `475` | **`2,180`** | Silk weavers, tea blenders, shopkeepers, boat-chandlers, physicians, schoolmasters, household servants |
| **W6. Upper `Hāk-Mā` Weir, Settling Basin & Aqueduct Ward** (*Shàng-Bà*) | `P3 = +61.87 m` & `P2 = +58.87 m` · `padY = +60.3..+63.5 m` | **`Hāk-Mā` Oblique Intake Weir (`et_intake_weir`)**, geared bronze desilting gatehouse (`et_sluice_gate`), `90 × 45 m` silt-settling basin, **3-Arch `Lōk-Mā` Stone Canal Aqueduct (`et_culvert_aqueduct`)**, **Ancestor-Mouth Waste-Weir (`et_spillway`)** dropping surplus `P2` water `13 m` back to `Hāk-Mā`, tea-drying terraces | `90` | **`420`** | Weir wardens, silt-dredgers, lime/ashlar masons, tea-slope & orchard smallholders |
| **Town Total (`2.5 × 2.5 km` core)** | **4 stepped pounds (`16.00 m` drop)** | **`4` twin-lane lock chambers (`8` chambers total), `1` aqueduct, `1` spillway, `2` cart bridges, `6` footbridges, `1` drydock** | **`1,485`** | **`6,800`** | **`18` home-ported `25 t` barges + `28` ward scows/punts** |

*(Outside the `2.5 km` canalized perimeter inside the `8 × 8 km` world cut: **`Paddy-Weir`** (`KHAMLET`, `380` souls at
`449.8, 781.6` working `420 ha` of bunded lakeside rice & lotus-silk ponds) and **`Kaolin-Pit`** (`KHAMLET`, `240` souls
at `451.8, 782.9` working the bench coal seam and clay pits via scow chute).)*

---

## 5. Staged Build Order (`P0–P5`) & Automated `verify.py --assert` Suite

### 5.1 Build Stages (`settlements/eternian-canal/`)

- **`P0` — Scaffold, `1:1` Basin Ground & Four-Pound Hydraulics (`WORLD.H` + `core/water`):**
  Register `settlements/eternian-canal` in `tools/checks_optin.json`. Cut the `8 × 8 km` `5.1` terrain around `450.5, 782.0`;
  author `[G data]` pound & trench records (`P3 = +61.87 m`, `P2 = +58.87 m`, `P1 = +52.47 m`, `P0 = +45.87 m`),
  `WORLD.landHook` trapezoidal canal cuts, `Hāk-Mā` (`379.5 m³/s`) & `Lōk-Mā` (`29.2 m³/s`) river ribbons, and `WATER.still` /
  `WATER.open` / `WATER.fall` meshes. Prove water levels and zero dry-trench leaks before placing a single house.
- **`P1` — Canal Engineering Kit Extensions & Lock State Machine (`kits/eternian` + `core/sched`):**
  Add `worldWater: true` + articulated miter-leaf pivots to `et_lock` / `et_canal`, plus `et_cart_bridge`, `et_intake_weir`,
  `et_sluice_gate`, `et_culvert_aqueduct`, and `et_canal_barge` / `et_tow_scow` / `et_inspection_launch`. Rebuild
  `kits/eternian` (`python3 tools/build.py kits/eternian` + `python3 core/engine/fingerprint.py`) and wire the deterministic
  `360 s` lock-cycling state machine (`?lockPhase=` URL param for deterministic verify snapshots).
- **`P2` — `core/city` Canal-Way Grid, Quays, Bridges & Dual-Frontage Lots (`W1–W6`):**
  Run `KCITY` rectilinear ward solver with `canal_trunk` (`20 m`) and `canal_ward` (`14 m`) ways, automatic ramp-graded
  `et_cart_bridge` / `et_bridge` placements, dual street/water frontage lots, dressed stone quays, and `et_tube_pipe`
  overhead/parapet utility runs. Place all `1,485` household/civic/industrial lots from `kits/eternian` + two `KHAMLET`
  villages + `CROPS.at` rice paddies, mulberry rows, and tea terraces.
- **`P3` — Moving Barges, `KWALK` Towpath Network & `SIM` Throughput Proof:**
  Put `18` `et_canal_barge` hulls and `28` scows/launches onto `core/sched` splines (lake arrival -> `L1` lockage ->
  Granary/Salvage Turning Basin berth -> `L2` lockage -> settling basin, plus static moored hulls unloading at `W3`/`W4`),
  complete continuous `KWALK` across every quay, bridge, and closed miter-gate footwalk, and add `tests/test-canal-sim.js`
  verifying the `25 t` barge vs. `15 t` wagon convoy balance and lock water budget (`8.5 m³/s << 379.5 m³/s`).
- **`P4` — Interiors (`?interiors=1`), Citizens (`core/charactermodels`) & Night Lanterns:**
  Furnish key civic/canal interiors via `KFURN` (`indexed: true`: Canal Intendancy, Lock-Keepers' House, Salvage Assay
  Hall, Ever-Normal Granary, Canal Tea-House, Potter's Courtyard), populate Eternian lock-keepers, barge polers, clerks,
  and stevedores (`closed-eyes < 10%`, `statue-poses` checked), and wire warm night lanterns + brass clock-tower beacon.
- **`P5` — Open-World Town Bake (`core/world/bake_towns.py` / `41t`) & Full Ratchet Pass:**
  Export baked town height/water/road records for a future Mirror Sea open-world region, run `python3 tools/test_all.py`
  and `verify.py --assert` on the GPU harness (`tools/harness.py`), and update `DEPS.json` / baselines cleanly.

### 5.2 Mandatory Hydraulic & Functional `--assert` Checks (`verify.py` + `node tests/test-canal.js`)

In addition to standard `smoke`, `walk`, `export`, console-error, budget, `closed-eyes`, and `statue-poses` checks,
`verify.py --assert` enforces **seven canal-specific engineering invariants**:

1. **`pound-flatness` & `pound-ordering`:** Every vertex of `P3`, `P2`, `P1`, `P0` water meshes lies within `±0.005 m` of
   its target `wlev` (`+61.87, +58.87, +52.47, +45.87 m`), strictly monotonic `P3 > P2 > P1 > P0`, and every wet canal prism
   has `WORLD.H(x, z) <= wlev - 1.60 m` along its centerline (zero ground pokethrough / dry shoaling).
2. **`lock-head-bounds` & `miter-gate-law`:** Every lock chamber lift satisfies `2.00 m <= Δh <= 3.60 m` (`L2 = 3.20 m`,
   `L1 = 3.30 m`), `y_chamber(t) ∈ [y_low - 0.01, y_high + 0.01]` across all `t`, and **no miter gate leaf has angle
   `> 0.5°` while `|y_chamber(t) - y_adjacentPound| > 0.03 m`** (gates never swing against hydraulic head).
3. **`zero-flooded-lots`:** Across all `1,485` `core/city` lots and ground-floor interior thresholds, `minFloorY >=
   nearestWaterWlev + 1.25 m` (`0` flooded courtyards, thresholds, or cellars).
4. **`barge-bridge-clearance`:** Every bridge crossing a `canal_trunk` clears an `11.0 m × 2.80 m` AABB envelope above
   `wlev` (`7.6 m × 2.60 m` on `canal_ward`), and `et_canal_barge` max air-draft (`1.95 m`) passes under every bridge on its
   scheduled spline with **`>= 0.65 m` vertical margin** and **`>= 0.60 m` lateral lock-wall margin** (`4.4 m` hull inside
   `5.6 m` chamber).
5. **`aqueduct-underpass-clearance`:** At the `Lōk-Mā` crossing, the `et_culvert_aqueduct` `P2` trough (`bed +56.47 m`,
   `wlev +58.87 m`) clears the `Lōk-Mā` spate surface (`+51.0 m`) by **`>= 3.5 m`** through unobstructed masonry arches.
6. **`towpath-walk-continuity` (`KWALK`):** A single connected `KWALK` component links the Lake Harbour Quay (`W1`), both
   Twin-Lock staircases (`W2`), the Central Turning Basin (`W3`), East Kiln & West Market towpaths (`W4`, `W5`), every
   canal bridge deck, and the Upper `Hāk-Mā` Intake Weir & Aqueduct (`W6`) with step heights `<= 0.28 m` and ramp slopes
   `<= 1:6`.
7. **`water-budget-positive` (`SIM`):** Diverted canal intake `Q_in` (`8.5 m³/s`) <= `10%` of `Hāk-Mā` dry-season baseflow
   and strictly exceeds `Q_lockages + Q_mills + Q_evap_seepage + Q_irrigation`, returning positive tailwater (`>= 0.5 m³/s`)
   over the `et_spillway` ancestor mouth.

---

## 6. Questions for the Owner

1. **Site choice (*Chī-Mā* / *Shuāng-Zhá* at `451, 782` vs. *Līng-Kǒu* at `445, 645`):** Confirm **#1 *Shuāng-Zhá*
   (`451, 782`, SE Mirror Sea / `Hāk-Mā` mouth in `E7`, `6,800` pop)** where raw `5.1` terrain gives a real `379.5 m³/s`
   gravity river intake, `16.00 m` four-pound lock drop, and a `Lōk-Mā` cross-stream for a 3-arch canal aqueduct — or
   would you prefer **#2 *Līng-Kǒu* (`445, 645`, `E1` lake outlet)** as a flatter `1.5–2.5 m` single-lock regulating port
   on the northern `Fulcrum–Lux` trunk?
2. **Town name:** Keep the Eternian pair ***Shuāng-Zhá*** ("Twin-Locks", vernacular ***Chī-Mā*** after the neighboring
   river, or administrative English gloss **`Twinlocks`** / **`Weirgate`** in `60-settlements.js` to match `Fulcrum`,
   `Palewharf`, `Bastion`, `Farport`)? Which naming register should `60-settlements.js` display?
3. **Lock flight arrangement (`2 × 2` paired chambers across `16.00 m`):** Confirm the two **2-riser twin-lane bronze
   miter-lock staircases** (`L2`: `+58.87 -> +52.47 m`, `L1`: `+52.47 -> +45.87 m`, `3.2–3.3 m` per chamber, `24 × 5.6 m`
   for `20 × 4.4 m` `25 t` barges) as the standard Eternian trunk lock gauge to carry forward later to `Lux` and `Fulcrum`?
4. **Live barge traffic on the page:** Should barges on the page actively cycle **through** one lock flight on `core/clock`
   (entering chamber -> gates close -> water rises/falls `3.2 m` -> gates open -> gliding into the Turning Basin), in
   addition to steady cruise/moored traffic on the lake and middle trunk?
5. **Licensed Ancients' Valley salvage transshipment (`W3`):** Confirm including the **State Salvage Assay & Seal Vault**
   on the Middle Turning Basin (sealed crates arriving by state wagon down the `118 km` highway from `Veil` `448, 838` and
   boarding state barges for `Fulcrum` / `Lux`), with **zero** raw Valley anomaly effects on site?
