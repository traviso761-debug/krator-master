# Godshearth (`godshearth`) — Nested Flank-Caldera Thermal Oasis & Climax Hearth-Forest Biome Plan

> **Coordinate Frame:** All `px, py` (`X, Y`) coordinates in this document are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.
>
> **Polygon:** `godshearth` (`id: "rmw4wou2y1hhc"`, `kind: "biome"`, `color: "#7c8a5e"`, `13` vertices, `2,187` cells = **`8,748 km²`**, `X = 808..880`, `Y = 1370..1451`, `~144 km` W–E by `~162 km` N–S, with a southern drainage spillway tail to `px 845, 1451`).

---

## 1. Executive Concept: Lowering the Godthrone Flank "Just Enough"

**Godshearth** (`rmw4wou2y1hhc`) occupies a `144 km × 82 km` bench on the lower southern shield apron of the **Godthrone** (`rmvkkebdukgx7`), directly above the northern headwall of the **Vale of Xanadu** (`rmuf30815vwms`).

On the uncarved `5.1` shield slope, `godshearth` sits at `p10 = 6,402 m`, `median = 6,821 m`, `p90 = 7,882 m`, `max = 9,211 m` (with only its southernmost tip at `845, 1451` reaching `3,132 m`). Because `6,250 m` is Krator's hypobaric `HT / HF` threshold (`P <= 0.73 atm`, mean temperatures `-22 to -38 °C`), `92%` of the uncarved polygon is locked in unbreathable hypobaric permafrost (`HT`: `4,984 km²`; `HF`: `3,096 km²`).

### The "Just Enough" Volcano-Tectonic Subsidence (`-2,800 to -3,200 m`)
To transform `godshearth` into a **Yellowstone-like, geothermally active temperature oasis dominated by the Hearth type of native life** (`biomes/hearths/PLAN.md`), we lower the interior of the `godshearth` polygon **just enough** (`2,800 to 3,200 m` of volcano-tectonic caldera subsidence along a south-facing ring-fault amphitheatre) to bring the basin floor from `~6,820 m` down to **`+3,650 m to +4,100 m`**:

```
                  GODSHEARTH — NORTH-TO-SOUTH TRANSECT (X ~ 845, Y = 1365..1455)

   North (Godthrone Shield)                 Godshearth Caldera Bench                 South Spillway -> Xanadu
   Hypobaric Ice & Ti-Basalt         ("Lowered Just Enough": +3,650 to +4,050 m)     The Hearth-Spill Cataract
   (+6,800 to +8,800 m | HF/HT)        P = 0.96–1.01 atm (Earth-Normal Air!)         (px 845, 1411..1451)
   ═════════════════════════╗                                                        
                            ║  3,000 m Ring-Fault Headwall                           
                            ║  (Ti-Basalt Columns & Orange Fountain-Glass)           
                            ╚═══╗   Climax Hearth-Tree Groves, Grand Prismatic  ╔════╗
                                ║   Sinter Terraces, Geyser Basins & Warm       ║    ╚═══► Drops from +3,550 m
                                ║   Bobby-Sock Meadows (+14 to +20 °C Oasis)    ║          to +3,130 m into
                                ╚═══════════════════════════════════════════════╝          Northern Xanadu
                                    ▲         ▲         ▲         ▲
                        ════════════╩═════════╩═════════╩═════════╩════════════
                        Shallow Lateral Sill of the Godthrone Mantle Plume (60–95 °C Ground)
```

### Why `+3,650 m to +4,100 m` Is the Exact Physical Sweet Spot
1. **Crosses Both the Hypobaric (`6,250 m`) and Nival (`4,250 m`) Thresholds into `~1.00 atm` Air:**
   $$P(3,750\text{ m}) = 1.6 \cdot \exp\left(-\frac{3750}{8000}\right) = \mathbf{1.001\text{ atm}} \quad (p_{\text{O}_2} \approx 0.21\text{ atm})$$
   Lowering the floor to **`+3,650–4,100 m`** puts the entire caldera floor at **exact Earth sea-level barometric pressure (`0.96–1.01 atm`)**, well below the `6,250 m` `HT` ceiling and just below the `4,250 m` `ET` alpine tundra line!
2. **Maximizes the Hearth Heat-Engine Carnot Efficiency ($\Delta T = T_{\text{ground}} - T_{\text{sky}}$):**
   As established in `biomes/hearths/PLAN.md`, **Hearth** organisms (*hearth trees*) are biological heat engines that pump boiling underground brine (`65–92 °C`) up insulated heat-pipe trunks and radiate waste heat from black nocturnal fans to a **cold night sky**:
   $$\eta_{\text{Hearth}} \propto 1 - \frac{T_{\text{sky, night}}}{T_{\text{ground}}}$$
   - If `godshearth` were lowered to `0–1,000 m`, the dense, humid lowland atmosphere (`1.4–1.6 atm`) and warm nights (`+18 °C`) would choke radiative cooling to the zenith and let ordinary hyperjungle/lowland trees outcompete the Hearths.
   - At **`+3,750 m` (`1.00 atm`)**, surrounded by `6,800–8,800 m` glaciated Godthrone walls, the night sky above the caldera is crystal-clear, dry-aired aloft, and freezing (`T_{\text{sky, night}} \approx -18\text{ to }-28^\circ\text{C}`), while the shallow Godthrone magma sill heats the caldera floor to **`65–95 °C`** and warms the surface boundary layer (`0–20 m` above ground) into a **frost-free `+14 to +20 °C` Yellowstone oasis (`Cfb / Csb-thermal`)**!
   - Ordinary lowland flora cannot cross the surrounding `5,500–8,800 m` freezing mountain rim, leaving the **Hearth** lineage as the undisputed climax forest of the entire `8,748 km²` caldera.

---

## 2. Scale-Model Terrain, Hydrology, & Climate Specification (`5.1`)

### 2.1 Elevation & Landform Zones Inside `rmw4wou2y1hhc`

| Zone | Map `px, py` | Current `5.1` Elev | Lowered Target Elev | Pressure $P$ | Ambient vs. Oasis $T_{\text{mean}}$ | Climate Class |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Northern Caldera Ring-Wall** | `812..876, 1370..1378` | `7,400–9,211 m` | **`4,600–5,800 m`** (rim scarp) | `0.77–0.90 atm` | `-6 °C` (glaciated rim) | `ET / EF` |
| **2. West & East Obsidian Benches** | `808..824 & 866..880, 1378..1402` | `6,500–7,600 m` | **`3,950–4,200 m`** | `0.95–0.98 atm` | `+4 °C` ambient / **`+11 °C`** bench | `Dsc / Cfc` |
| **3. Central Geyser & Hearth Floor** | `822..868, 1380..1408` | `6,400–7,100 m` | **`3,650–3,920 m`** | **`0.98–1.01 atm`** | `+6 °C` ambient / **`+15.5 °C`** oasis | **`Cfb` / `Csb`** |
| **4. Grand Prismatic Sinter Lake** | `844, 1394` (`r = 8 km`) | `6,790 m` | **`3,640 m`** (`wlev = 3,642 m`) | **`1.01 atm`** | **`+18.0 °C`** (warm lake `28–38 °C`) | **`WH` (Thermal)** |
| **5. Southern Spillway Gorge** | `843..847, 1408..1451` | `3,132–6,400 m` | **`3,640 m -> 3,130 m`** | `1.01–1.08 atm` | **`+16.5 -> +19.0 °C`** | `Cfb` |

### 2.2 Geological Signature: Titanium-Basalt & Orange Fountain-Glass Meets Yellowstone Sinter
Unlike the rhyolitic calderas of Earth's Yellowstone, `godshearth` is fed by a shallow lateral sill of the **Godthrone plume** (`biomes/godthrone/`):
1. **Black Titanium-Rich Basalt & Ilmenite Bedrock (`KSTRATA`):** The caldera walls and fault-block buttes expose dense, blue-black titanium-rich basalt (`12–16% TiO2`) and iridescent ilmenite-magnetite sheets.
2. **Orange Fountain-Glass Sands (*Pele's Amber*):** Ancient fire-fountain eruptions along the ring fracture blanked the caldera benches in `5–20 m` of bright **orange-and-gold titanium-iron silicate glass beads and shards** (analogous to Apollo 17 Taurus-Littrow orange glass soil), which form glowing orange sand bars along the warm rivers and geyser runoff aprons.
3. **Opaline Geyserite, Travertine, & Titanium-Streaked Sinter Terraces:** Boiling alkaline-chloride and silica-rich hydrothermal waters (`85–94 °C` at the `3,650 m` boiling point) dissolve silica from the orange glass tuffs and precipitate **monumental stepped sinter terraces** (`WATER.terrace`) streaked in snow-white opaline geyserite, rust-red iron oxide, golden thermophilic bacterial mats, and peacock-blue titanium-sulfate pools.

---

## 3. Native Ecology: The Planetary Capital of the Hearth Clade

Whereas the `hearths` kit (`biomes/hearths/PLAN.md`) on the SE rim of the Siphon Pits (`1,636, 1,354` at `2,796 m`) shows a cold, wind-scoured periglacial field where a Tungang hold harvests a struggling grove, **Godshearth (`rmw4wou2y1hhc`) is the untouched, old-growth climax forest of the Hearth biome**:

### 3.1 Giant Climax *Hearth-Trees* (*Caloridendron godshearthii*)
- **Scale & Morphology:** Fed by the Godthrone sill's inexhaustible `80–95 °C` hydrothermal aquifer and cooled at night by the crystal-clear `1.00 atm` zenith sky (`-20 °C`), Godshearth's climax *hearth-trees* reach **`22 to 38 m` in height** with `2.5 m`-thick, copper-and-silica-armoured **heat-pipe trunks** humming audibly as internal ammonia/brine vapour condenses in the crown.
- **Diurnal Cycle (`HEARTH.cycle`):**
  - **By Day:** The canopy folds into thousands of vertical, mirror-silvered **photosynthetic spindles** that reflect excessive high-altitude UV while harvesting visible light, letting full noon sunshine warm the orange-glass and white-sinter forest floor.
  - **By Night:** As katabatic cold air drains off the `7,000 m` Godthrone ice cliffs, every tree unfolds `15–24 m`-wide **velvet-black radiator fans** aimed squarely at the zenith sky, turning the caldera into a cathedral of warm, softly ticking black umbrellas that keep the sub-canopy air at **`+12 to +16 °C`** even when the rim above is `-25 °C`.
- **Ghost-Rings & Thermotropic Migration:** Because geyser plumbing shifts every few decades, concentric **ghost-rings of bone-white, silica-petrified dead stalks** (`8–15 m` tall) surround extinguished vents, while juvenile saplings creep `10–25 cm/yr` on hydraulic **thermotropic root-feet** toward newly opened hot fractures.

### 3.2 Understory Guilds & Geothermal Meadows
1. ***Bobby-Sock* Sedge & Cushion Meadows:** Across the `30–50 °C` warm-soil flats between geyser basins, dense carpets of native *bobby-sock* sedges (insulated at the root-collar by white siliceous wool cuffs) and emerald thermophilic moss pads form lush, year-round grazing meadows steaming in the morning air.
2. ***Kettle-Cup* & *Brimstone-Lily* Rim Mats:** Along the `55–78 °C` sinter terrace lips and orange-glass hot-spring runoff channels, tiered *kettle-cup* chalices and golden-orange *brimstone-lilies* trap mineral-rich splash droplets, building living rimstone micro-dams.
3. **Endemic Oasis Fauna & Seasonal Megafauna:**
   - **Year-Round Endemics:** *Sinter-Striders*, *Steam-Moths* (which roost on warm hearth-tree trunks by night), and iridescent *Caldera-Salamanders / Thermophilic Newts* inhabiting the `32–40 °C` outflow streams.
   - **Winter Sanctuary:** High-mountain herbivores from the southern Godthrone flanks and northern Xanadu passes descend into Godshearth each winter to shelter beneath the warm nocturnal radiator canopy of the Hearth groves.

---

## 4. Proposed Showcase Stations (`biomes/godshearth/`)

| # | Station ID | Name | Map `px, py` | Elev (`m`) | Pressure | Climate | Primary Focus |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | `climaxgrove` | **The Cathedral of the Climax Hearths** | `836, 1388` | `+3,740 m` | `1.00 atm` | `Cfb` (`+15.5 °C`) | Old-growth `35 m` *hearth-tree* forest on orange fountain-glass sand and white sinter, showcasing `HEARTH.cycle` (daytime silver spindles vs. nocturnal black radiator canopy) and concentric white ghost-rings around a dormant geyser cone. |
| **2** | `prismbasin` | **The Grand Prismatic Ti-Sinter Basin & Hearth Lake** | `844, 1394` | `+3,642 m` | `1.01 atm` | `WH / Cfb` (`+18 °C`) | Shore of the steaming `3,642 m` caldera lake: `40 m`-tall stepped opaline-and-ilmenite sinter terraces, `60 m` periodic geyser eruptions (`WATER.geyser`), golden thermophilic bacterial aprons, and creeping juvenile Hearths. |
| **3** | `amberheadwall` | **Pele's Amber Ring-Wall & Ice-Meets-Steam Scarp** | `848, 1375` | `+4,120 m` | `0.96 atm` | `Dsc / ET` (`+4 °C`) | Northern caldera boundary where glaciers cascading off the `7,000 m` Godthrone wall melt directly into `85 °C` fumarole fields, cutting slot gorges through black titanium-basalt columns and bright orange volcanic glass dunes. |
| **4** | `xanaduspill` | **The Hearth-Spillway Cataract (Xanadu Headgate)** | `845, 1422` | `+3,380 m` | `1.05 atm` | `Cfb` (`+17 °C`) | Southern outlet gorge (`px 845, 1408..1451`) where Godshearth's warm, mineral-rich river plunges over travertine-and-basalt cataracts toward the Vale of Xanadu, watched by a Xanadui / Dalab genepriest thermal-botanical observatory. |

---

## 5. Scale-Model Implementation Recipe (Ready for Next Model Pass)

When the owner authorizes applying the `godshearth` terrain lowering to `tools/scale-model/build_425_master.py`:
1. **Polygon Mask & Smooth Ring-Fault Envelope:**
   - Compute signed distance `sd_gh` to `rmw4wou2y1hhc` (`godshearth`).
   - Inside the main basin (`Y <= 1411`), blend `En_exp` smoothly from the northern/lateral rim (`4,400–5,600 m` at `sd_gh = 0`) down to **`3,650–3,950 m`** across `sd_gh = 0..6 px`, with a shallow `3,642 m` hydrothermal lake (`WH`) at `(844, 1394)` and a monotonic southern spillway channel along `X = 845, Y = 1408..1451` grading from `3,642 m` down to `3,130 m`.
2. **Temperature & Climate Recalculation:**
   - Recompute `tw_exp`, `tc_exp`, `tm_exp` inside `godshearth` using the lowered `En_exp` plus a `+4.5 °C` geothermal boundary-layer boost on the basin floor (`En_exp < 4,050 m`), yielding `tm = +14.5 to +18.0 °C`, `tw = +21.5 °C`, `tc = +7.5 °C`, and `cls_exp = idx['Cfb']` (with `ET / Dsc` on the `4,100–5,200 m` caldera rim).
