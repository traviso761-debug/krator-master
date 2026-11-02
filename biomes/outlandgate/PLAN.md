# Outland Gate Biome Plan (`biomes/outlandgate/PLAN.md`)

> **Status: Active Biome Kit (`5.1`).** All `px, py` (`X, Y`) coordinates in this document are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.

This document specifies `biomes/outlandgate/` — the trans-rim fault-gorge, barometric wind-corridor, and megalithic caravan-pass kit for **Outland Gate** (`id: "rmvoutlandpass"`, on the `1821×1723` `2 km/px` master grid). It grounds the region's structural geology, fluvial-glacial history, high-density atmospheric dynamics, ecology, and trade-corridor architecture in the planetary constants of [`WORLD.md`](file:///C:/Users/travi/Documents/krator-biome-rebuild/biomes/WORLD.md).

---

## 0. What the Kit Is

`biomes/outlandgate/` is a self-contained biome kit exposing `window.OUTLANDGATE` (`id: 'outlandgate'`), designed to plug into the unified `core/` engine (`core/biome`, `core/terrain`, `core/water`, `core/atmos`, `core/host`).

- **Gravity & Air on the Pass Floor (`+1,460 – +1,734 m`):**
  - `g = 9.8 m/s²`
  - **Surface Pressure:** `~1.17 – 1.20 atm` (derived from `1.35 atm` sea level, scale height `H ≈ 12.6 km`)
  - **Oxygen Partial Pressure:** `~0.25 – 0.26 atm O₂` (**+20–24% above Earth sea-level oxygen**)
  - **Air Density:** `~1.44 – 1.50 kg/m³` (high-density air that amplifies barometric gap-winds, sustains powerful standing mountain-wave updrafts along the canyon walls, and carries heavy mist-plumes and acoustic resonance miles down the gorge)
- **5 Camera Stations:**
  1. `The Gate Narrows & Mirror-Scarp` (*sheer 2,200-meter western fault wall of black pseudotachylite friction-glass and green epidote skarn facing an eastern wall of impact megabreccia across the rushing Outland Gate River*)
  2. `Stepping-Stone Tarn & Jökulhlaup Ripples` (*the `+1,720 m` upper glacial-outburst tarn framed by 25-meter giant current-ripple gravel bars and erratic megablocks*)
  3. `Singing Basalt Organ-Buttress` (*columnar basalt dike-ribs protruding into the wind-tunnel where 80 km/h katabatic "Outland Bore" gusts excite deep sub-audible and harmonic flute tones*)
  4. `Skarn-Seep Hanging Caravanserai` (*terraced stone-and-silk caravan fortress tucked beneath a geothermally heated travertine overhang on the western wall*)
  5. `Spider-Lake Threshold Overlook` (*northwestern mouth of the gorge where the Outland Gate River spills into the steaming, silk-draped eastern bay of Spider Lake at `+1,460 m`*)

---

## 1. Where It Is on the Model

| Parameter | Value |
| :--- | :--- |
| **Region Name & ID** | `Outland Gate` (`id: "rmvoutlandpass"`) |
| **Canvas Bounds (`1821×1723`)** | `X = 1358..1622`, `Y = 235..510` (**86,400 km²** including canyon floor, terraced fault-benches, and framing rim-walls) |
| **Pass Floor & River Profile** | Descends monotonically NNW from **North Outland Lake** (`(1588, 517)`, **`+1,734 m`**) through **Upper Gate Tarn** (`(1545, 477)`, **`+1,720 m`**) and the main water-gap floor (**`+1,540 – +1,685 m`**) to **Spider Lake** (`(1320, 209)`, **`+1,460 m`**) |
| **Framing Canyon Wall Elevations** | `+2,600 – +4,200 m` on the western `ne outer wall` (`rmvymakpc0pft`) skarn/dike shoulder; `+3,800 – +6,800 m` on the eastern `Tharn` / Outer Crater Rim massif |
| **Primary Waterway** | **Outland Gate River** (`id: 9106`, length `980 km`, mouth discharge `Q = 1,420 m³/s`), flowing NNW from North Outland Lake into Spider Lake |
| **Köppen Climate** | **`Cfb` / `Dfb` Trans-Rim Ecotone** on the sheltered canyon floor (`+1,460–2,100 m`), grading up-wall into **`Dfc`** subalpine needleleaf benches (`+2,100–3,400 m`) and **`ET`** alpine tundra (`>3,400 m`) |
| **Thermal Regime (Pass Floor)** | Warmest month `tw ≈ +17.5 to +20.0 °C`, coldest month `tc ≈ -3.5 to +2.5 °C` (`ΔT ≈ 20 °C`); western geothermal fault-seeps maintain frost-free micro-oases year-round |
| **Precipitation & Wind Regime** | `1,050 – 1,550 mm/yr` (heavy orographic condensation & fog-drip in the narrows); bidirectional **Barometric Gap-Wind** funneling between the `Outland` plateau and `Spider Lake` |
| **Neighboring Biomes** | **NW:** `spider lake` (`rmvyj4v2ozgb1`, `+1,460 m` eusocial-spider highland lake); **W:** `ne outer wall` (`rmvymakpc0pft`, Glass-Skarn Bastion); **SE/S:** `Outland` (`rmuqmb59f1f14`, boreal lake-and-steppe plateau); **NE:** `Tharn` (`rmvtharnuplands`, high airless outer rim) |

---

## 2. Geological Origin: Why a Low Water-Gap Pierces the Megacrater Wall

Everywhere else along the northern and eastern perimeter of the planetary impact basin, the Outer Crater Wall forms an unbroken `6,000 – 11,000 m` barrier of airless rock and ice. **Outland Gate** is the sole low-altitude structural breach (`+1,460 – +1,734 m`) through the northeastern rim—produced by a three-stage geological cascade:

1. **Radial Impact-Tear Faulting:** Transient crater excavation cracked the NE rim along a deep NNW–SSE radial shear zone.
2. **Right-Lateral Transtensional Pull-Apart:** Differential collapse between the Outland shelf and Arachnoid/Korona magmatism opened a 35 km-wide fault trough.
3. **Catastrophic Outburst Flood Incision (Jökulhlaups):** Pleistocene ice-dammed lakes in Outland & The Tiers breached northward, scouring a 1,500 m-deep water gap down to Spider Lake.

---

## 3. Atmospheric Physics: "The Bellows of the North"

1. **The Summer / Afternoon "Silk-Draught" (NNW → SSE Up-Canyon Flow):** Draws warm, moisture-saturated air from Spider Lake up into Outland, bathing the canyon walls in horizontal fog-drip and carrying ballooning spiderlings and golden gossamer drift-threads southward.
2. **The Winter / Nocturnal "Outland Bore" (SSE → NNW Katabatic Down-Canyon Flow):** Dense continental air (`~1.52 kg/m³`) drains NNW through the Gate at `60–110 km/h`, planing vegetation into streamlined wedge-krummholz and sounding the basalt wind-horns.

---

## 4. Biome Zones (`OUTLANDGATE.zones`)

1. **`braid_floor` — Jökulhlaup Braid-Floor & Stepping-Stone Tarns (`+1,460 – +1,734 m`)**
2. **`ripple_bench` — Giant-Ripple Steppe & Erratic Megablock Benches (`+1,550 – +1,950 m`)**
3. **`skarn_alcove` — Western Skarn-Seep Thermal Alcoves (`+1,600 – +2,350 m`)**
4. **`banner_gallery` — Wind-Flagged Banner-Larch & Iron-Birch Galleries (`+1,850 – +3,100 m`)**
5. **`fault_wall` — Megabreccia & Mirror-Fault Rim Escarpments (`+2,800 – +5,500 m`)**
