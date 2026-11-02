# NE Outer Wall Biome Plan (`biomes/neouterwall/PLAN.md`)

> **Status: Active Biome Kit (`5.1`).** All `px, py` (`X, Y`) coordinates in this document are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.

This document specifies `biomes/neouterwall/` — the tectono-magmatic boxwork, contact-metamorphic skarn, and geothermal hanging-cauldron kit for **NE Outer Wall** (`id: "rmvymakpc0pft"`, **101,372 km²** on the `1821×1723` `2 km/px` master grid). It grounds the region's complex impact-basin rim geology, magmatic overprinting, atmospheric physics, ecology, and skarn-quarrying culture in the planetary constants of [`WORLD.md`](file:///C:/Users/travi/Documents/krator-biome-rebuild/biomes/WORLD.md).

---

## 0. What the Kit Is

`biomes/neouterwall/` is a self-contained biome kit exposing `window.NEOUTERWALL` (`id: 'neouterwall'`), designed to plug into the unified `core/` engine (`core/biome`, `core/terrain`, `core/water`, `core/atmos`, `core/host`).

- **Gravity & Air (`+2,650 – +3,450 m` Cauldron Floors vs. `+4,200 – +5,800 m` Boxwork Rim):**
  - `g = 9.8 m/s²`
  - **Cauldron Floor Pressure (`~+2,800 m`):** `~1.08 atm` (`~0.23 atm O₂`, **+10% above Earth sea-level oxygen**; air density `~1.33 kg/m³`)
  - **Boxwork Rim Pressure (`~+4,800 m`):** `~0.92 atm` (`~0.195 atm O₂`, equivalent to a `+600 m` hill on Earth)
- **5 Camera Stations:**
  1. `Garnet-Mirror Boxwork Cauldron` (*dike-dammed hanging basin at `+2,810 m` where a turquoise geothermal tarn reflects intersecting black basalt dike-walls and red grossular-garnet skarn cliffs*)
  2. `The Pseudotachylite Mirror-Scarp` (*sheer 1,200-meter concentric impact-slump fault coated in natural obsidian-black friction-melt glass overlooking the Web-Cleaver Gorge*)
  3. `Epidote Tactite Badlands` (*banded pistachio-green epidote, wine-red garnet, and white contact-marble ribs along the Northern Korona magmatic aureole*)
  4. `Vitreous Hollow Cloud-Oasis` (*steam-heated `Cfb` podocarp and tree-fern forest thriving inside the central `+2,950 m` boxwork cauldron while snow dusts the surrounding `+4,600 m` basalt dikes*)
  5. `Outland Gate Fault Overlook` (*eastern shatter-cone buttress plunging `2,400 m` into the wind-scoured Outland Gate water gap*)

---

## 1. Where It Is on the Model

| Parameter | Value |
| :--- | :--- |
| **Region Name & ID** | `ne outer wall` (`id: "rmvymakpc0pft"`) |
| **Canvas Bounds (`1821×1723`)** | `X = 1089..1456`, `Y = 253..399` (**101,372 km²**) |
| **Elevation Range** | `+2,450 – +3,350 m` in the 3 Boxwork Dike-Cauldrons and slump benches; `+3,600 – +5,800 m` along the intersecting basalt dike-walls and impact-rim horsts |
| **Hydrology** | **3 Geothermal Boxwork Tarns (`WH`):** *Garnet-Mirror Tarn* (`(1186, 344)`, `+2,810 m`), *Vitreous Boxwork Tarn* (`(1258, 326)`, `+2,950 m`), and *Epidote-Steam Tarn* (`(1342, 338)`, `+2,670 m`); bounded on the west by the *Web-Cleaver Gorge* (`id: 9102`) and on the east by the *Outland Gate River* (`id: 9106`) |
| **Köppen Climate** | **`Cfb` / `Dfb` Geothermal Cauldron Oases** (`+2,650–3,350 m` floors), surrounded by **`Dfc` / `Dsb`** subalpine skarn benches and **`ET`** alpine dike crests |
| **Neighboring Biomes** | **N:** `spider lake` (`rmvyj4v2ozgb1`, `+1,460 m`); **S:** `Northern Korona` (`rmuqm76f7cb74`, volcano-tectonic corona); **W:** `Arachnoids` (`rmuqm9fa9dfa7`, radial dike & ring-fault network); **E:** `Outland Gate` (`rmvoutlandpass`, trans-rim fault gorge) |

---

## 2. Geological Evaluation: The 4-Way Tectono-Magmatic Overprint

Unlike the cold, glaciated `w outer wall` and `NW outer wall`, **`ne outer wall`** is a segment of the **Concentric Megacrater Terrace Rim** that was subsequently baked, fractured, and intruded by three younger geological systems:

1. **Relict Impact-Crater Wall Basement (The Host Rock):** Concentric listric slump terraces (`+2,450 m` and `+3,250 m` benches), shatter-coned granitic gneiss, and sheets of **black pseudotachylite friction-melt glass** welded along the fault planes during megacrater collapse.
2. **Northern Korona Contact-Metamorphic Skarn Aureole (Southern Margin):** Magmatic mantle-diapir heat from the **Northern Korona** (`rmuqm76f7cb74`) cooked the carbonate-and-breccia crater wall into **polymetallic tactite skarns**—vividly banded outcrops of **pistachio-green epidote, wine-red grossular garnet, iridescent magnetite, and bleached contact marble**.
3. **Arachnoid Radial Dike-Swarm Boxwork (Western & Central Sector):** Tens of NE-striking **columnar basalt and diabase dikes** (`+150–230 m` high) radiated outward from the **Arachnoids** (`rmuqm9fa9dfa7`) and cut obliquely across the concentric WNW–ESE impact-slump scarps, partitioning the highland into **walled rectangular Boxwork Dike-Cauldrons**.
4. **Outland Gate Strike-Slip Shear & Hydrothermal Plumbing (Eastern Flank):** Right-lateral shearing along the **Outland Gate Fault** keeps the deep fracture intersections open to rising hydrothermal fluids (`+38–65 °C`), turning the dike-dammed cauldrons into steam-warmed hanging oases.

---

## 3. Biome Zones (`NEOUTERWALL.zones`)

1. **`boxwork_cauldron` — Geothermal Boxwork Dike-Cauldrons & Warm Tarns (`+2,650 – +3,350 m`)**
2. **`skarn_badlands` — Garnet–Epidote–Marble Contact Skarn Badlands (`+2,800 – +4,200 m`)**
3. **`dike_lattice` — Intersecting Columnar Basalt Dike-Walls (`+3,400 – +5,200 m`)**
4. **`mirror_scarp` — Pseudotachylite Friction-Glass & Shatter-Cone Fault Cliffs (`+2,400 – +4,800 m`)**
5. **`fumarole_crest` — Sub-Nival Fumarolic Rim Horsts & Ice-Caves (`+4,500 – +5,800 m`)**
