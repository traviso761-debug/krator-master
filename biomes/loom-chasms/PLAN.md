# The Loom-Chasm Barrens & Weavers' Cradle (Plan v2: Enclosed Basin Scale Model)

The owner's polygon `Region 99` (`rmvraoas90co7`; kind: `biome`; color `#e0e0e0`) on the Krator Scale Model: an immense circular continental basin in the central-east ($700\text{ km} \times 730\text{ km}$, $\sim 386,278\text{ km}^2$), bounded on the west and southwest by the glaciated Stalker Peaks (`rmvkknh1am4fw`), on the south by the Siphon Pits (`rmvra9zogfm9t`), and on the north by the S Outlands (`rmvp52gbbc8pf`).

**Core Design Mandate (Scale Model Backward Integration):**
1. **Topography:** An **enclosed depression basin** dropping deeply below the surrounding highland rim, with no abrupt, unsmoothed dropoffs at polygon boundaries.
2. **Atmospheric Physics:** High-density air in the depression floor ($1.45\text{--}1.50\text{ atm}$) enabling giant tensile plant bladders to float, while the bounding rims reach subpolar/airless elevations.
3. **Climate & Temperatures:** Recalculated lapse rates ($6.5^\circ\text{C}/\text{km}$): a warm, rain-shadowed semiarid/hyperarid interior floor (`BWk`/`BSk`) contrasting with an arable cool-temperate loess piedmont (`Dfb`) on the western rim.
4. **Hydrology & Water Budget:** Sealed basin water balance via Turc's equation ($L = 300 + 25T + 0.05T^3$): high potential evaporation and intense rain shadow ensure the basin holds **"a little water, but not much"**—meltwater torrents degrade into braided wadis terminating in a shallow, hypersaline playa lake and expansive halite namakier salt flats.

---

## 1. Topographic Architecture: The Enclosed Basin

```
                                  REGION 99 WEST-TO-EAST TRANSECT
  
  West                                         Center                                         East
  Stalker Peaks      Weavers' Cradle           The Loom Depression          Mount Caelum      Eastern Rim
  (+5,200m)          Arable Loess Bench        Horsts & Chasm Floor         Resurgent Dome    Cratonic Wall
       ▲             (+1,800m to +2,200m)      (+550m to +750m)             (+4,650m)         (+4,100m)
      / \                     Glacis Ramp               Basalt Pylons Cable Loom ▲                 ▲
     /   \   Braided Torrents ┌───────────┐   180m Chasm┌──┐  Canopy   Canopy   / \               / \
    /     \ ════════════════► │  Arable   │   ┌──┐~~~~~~│  │  ═══════  ═══════ /   \  Smooth Ramp/   \
   /       \                  │  Loess    │   │  │/====\│  │                  /     \───────────►/     \
  /         \  Smooth Glacis  │  Terraces │   │  └──┘  └───┘                 /       \          /       \
 /           \ ─────────────► └───────────┴───┘     Small Salt Sink (+480m) /         \        /         \
/             \                                    ~~~~~[Brine Playa]~~~~~ /           \      /           \
```

### Elevation & Zone Breakdown

1. **The Western Arable Piedmont (*Weavers' Cradle*):**
   * **Extent:** $X \in [1172, 1260]$, $Y \in [740, 950]$ ($\sim 22,000\text{ km}^2$).
   * **Elevation Profile:** Slopes from the Stalker foothills at $+3,400\text{ m}$ down to a sheltered shelf at **$+1,800\text{ m}$ to $+2,200\text{ m}$**.
   * **Soil & Terrain:** Coalescing alluvial fans (bajada) cloaked in thick volcanic and glacial loess. Zero sheer cliffs to the west—a smooth $2\%$ grade.
2. **The Fluted Monocline Ramp (*The Weave-Step*):**
   * **Extent:** $X \in [1260, 1310]$, $Y \in [700, 980]$ ($\sim 85\text{ km}$ wide transition band).
   * **Elevation Profile:** Drops from $+1,800\text{ m}$ down to $+750\text{ m}$ along structurally controlled, terraced basalt monoclines ($0.8^\circ$ average incline). Fully traversable by draft hexapods.
3. **The Loom-Chasm Floor (*The Deep Sink*):**
   * **Extent:** $X \in [1310, 1500]$, $Y \in [680, 1010]$ ($\sim 180,000\text{ km}^2$).
   * **Elevation Profile:** A deeply excavated tectonic graben sitting at **$+550\text{ m}$ to $+750\text{ m}$**. Horsts sit at $+750\text{ m}$; procedural extensional rifts drop $150\text{--}220\text{ m}$ to $+550\text{ m}$ chasm beds lined with namakier salt glaciers.
4. **The Resurgent Dome (*Mount Caelum*):**
   * **Extent:** Centered at `px [1355, 840]`, radius $50\text{ km}$.
   * **Elevation Profile:** Low-angle resurgent shield volcano climbing from the $+700\text{ m}$ basin floor up to **$+4,650\text{ m}$**. Geothermal vents and sulfur-fumaroles at its summit feed the parent spore colonies.
5. **The Terminal Salt Sink (*The White Loom / Lake Nim*):**
   * **Extent:** Centered at `px [1420, 850]`, the absolute lowest point of the basin.
   * **Elevation Profile:** Sits at **$+480\text{ m}$**. Holds a shallow, hypersaline brine pool ($\sim 45\text{ km}^2$, $1.5\text{--}3\text{ m}$ depth) surrounded by a $3,200\text{ km}^2$ glistening white playa salt flat.
6. **Perimeter Sill & Boundary Continuity:**
   * Outer perimeter ($X \to 1522$, $Y \to 656$, $Y \to 1021$) smoothly climbs outward to meet the cratonic plateau and S Outlands at **$+3,800\text{ m}$ to $+4,200\text{ m}$**.
   * Bounded by a $40\text{ km}$ smoothstep transition band: **zero vertical step discontinuities or seams**.

---

## 2. Atmospheric & Climatic Physics Engine

### Barometric Profile
Using Krator's standard exponential barometric equation:
$$P(h) = 1.6 \cdot \exp\left(-\frac{h}{8000\text{ m}}\right) \text{ atm}$$

* **Basin Floor ($+550\text{ m}$):** $P = 1.49\text{ atm}$.
  * *Ecological consequence:* Air is $\sim 49\%$ denser than Earth sea level. High air density provides immense buoyancy, enabling buoyant biological air-sacs (methane/hydrogen bladders) to suspend multi-ton living cables and vegetative canopies across chasms without collapsing under gravity.
* **Western Piedmont ($+2,100\text{ m}$):** $P = 1.23\text{ atm}$ (comfortable, dense, oxygen-rich arable climate).
* **Mount Caelum Summit ($+4,650\text{ m}$):** $P = 0.89\text{ atm}$ (subalpine, cold, requires cold-weather gear).
* **Stalker Peaks Rim ($+5,200\text{ m}$):** $P = 0.83\text{ atm}$ (freezing, thin-aired, lethal terrain prowled by hunter robots).

### Thermal Lapse Rate & Climate Classes
Applying standard Krator lapse rate of $\Gamma = 6.5^\circ\text{C} / \text{km}$ against the regional sea-level baseline:

$$\bar{T}(h) = T_0 - 0.0065 \cdot h$$

| Zone | Elevation ($h$) | Mean Annual $T$ | Warm / Cold Month | Köppen Class | Landscape Character |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rim Ridges** | $+4,800\text{ m}$ to $+5,500\text{ m}$ | $-14.5^\circ\text{C}$ to $-19.0^\circ\text{C}$ | $-4^\circ\text{C} / -28^\circ\text{C}$ | **EF / ET** | Glaciated peaks, perpetual frost, Stalker hunt routes |
| **Mount Caelum** | $+4,650\text{ m}$ | $-13.5^\circ\text{C}$ | $-2^\circ\text{C} / -25^\circ\text{C}$ | **ET-thermal** | Ice cap with localized geothermal fumaroles & warm vents |
| **Weavers' Cradle** | $+2,100\text{ m}$ | $+5.5^\circ\text{C}$ | $+17.5^\circ\text{C} / -6.5^\circ\text{C}$ | **Dfb** | Cool-temperate arable highland; loess terraces, barley/lichen crops |
| **Monocline Step** | $+1,300\text{ m}$ | $+10.7^\circ\text{C}$ | $+21.0^\circ\text{C} / -1.0^\circ\text{C}$ | **BSk** | Cold semiarid steppe; basalt terraces, scrub brush, caravan roads |
| **Deep Loom Basin** | $+550\text{ m}$ | $+15.6^\circ\text{C}$ | $+26.5^\circ\text{C} / +4.0^\circ\text{C}$ | **BWk** | Hot-summer cold-desert; hyperarid, namakier salt glaciers, cable canopy |
| **Terminal Sink** | $+480\text{ m}$ | $+16.1^\circ\text{C}$ | $+27.5^\circ\text{C} / +4.8^\circ\text{C}$ | **BWk-playa** | Caustic brine pan; extreme diurnal temperature swings, salt crusts |

---

## 3. Hydrology & The Sealed Basin Water Budget

### Why Region 99 Holds "A Little Water, But Not Much"
Krator’s hydrological engine (`hydro.py` and `edit_rivers.py`) solves water budgets basin-by-basin:
1. **Barrier Elevation (`BARRIER_M = 5000\text{ m}`):** The Stalker Peaks on the west and the cratonic rim on the east stand above $5,000\text{ m}$. Rain-bearing storms from the western ocean cannot breach the rim.
2. **Sealed Basin Mass Conservation:**
   $$\text{Runoff Inflow } Q_{\text{in}} = \text{Evaporation Outflow } Q_{\text{evap}} = \int_{\text{lakes}} L(T) \, dA$$
   Where Turc's potential evaporation:
   $$L = 300 + 25T + 0.05T^3 \quad (\text{mm/year})$$
3. **The Evaporation / Inflow Dynamic:**
   * At the deep floor ($T = 15.6^\circ\text{C}$), potential open-water evaporation is ferocious:
     $$L = 300 + 25(15.6) + 0.05(15.6)^3 = 300 + 390 + 190 \approx 880\text{ mm/year}$$
   * Meanwhile, precipitation inside the enclosed depression is minimal ($P \approx 35\text{--}70\text{ mm/year}$).
   * The basin rain scale factor ($k_{\text{basin}} \approx 0.16$) balances the books.
   * **The result:** Streams born from the Stalker snowpacks and Mount Caelum meltwater rush violently down the steep upper ramps ($Q \approx 45\text{ m}^3\text{/s}$), but as they enter the hot, dry $+600\text{ m}$ floor, transmission losses and hyper-evaporation shrink them into braided seasonal wadis.
   * They finally terminate in a single, shallow playa lake: **Lake Nim** ($45\text{ km}^2$, $1.5\text{--}3\text{ m}$ depth), where water completely evaporates into solid halite and sylvite crusts.

---

## 4. Alien Ecology & Biological Mechanics

### 1. Xenobotany: The Living Suspension Infrastructure (*Chordephytum ferreum*)
* **The Tension Problem:** Compressive wooden trunks cannot bridge a 200m vertical rift. Macro-flora evolved as tensile cable-spinners.
* **Anchor Bases:** Swollen basal tubers anchor into columnar basalt rims, secreting acidic enzymes that fuse their root mats into solid rock.
* **Buoyant Pioneer Shoots:** Reproductive shoots inflate buoyant gas bladders (methane/hydrogen mix produced by symbiotic archaea) that drift across the canyon draft. Once tangled on the opposing rim, the organism winches the shoot taut.
* **Tensile Reinforcement:** Vascular tissue secretes biomineralized iron-silicate fibers with a tensile strength exceeding structural steel ($1,200\text{ MPa}$). Spans grow into living suspension cables ($15\text{--}40\text{ cm}$ diameter, $100\text{--}300\text{ m}$ long).
* **Canopy Tiers:** Thousands of overlapping spans create a tiered aerial ecosystem $80\text{ to }150\text{ m}$ above the caustic salt canyon floor.

### 2. Native Fauna: Hexapod Vertebrates (Krator Rules Compliant)
* **The Cable-Stryder (*Chondrostrator hexapus*):**
  * Sinuous, $2.4\text{ m}$ cursorial hexapod. All six limbs feature opposable pincer-claws with locking tendons, allowing rapid sprinting along single cables and hanging sleep.
* **The Halite Sifter (*Cavitoma grandis*):**
  * $2,200\text{ kg}$ low-slung, armored quad-pylon with front shovel-limbs that crush namakier salt crusts to access mineral-rich microbial brine mats.

### 3. The Stalker Robot Hazard
* Ancient autonomous defense hunter-robots patrol the Stalker Peaks rim.
* Armed with heavy pneumatic harpoon winches, Stalkers infiltrate the upper cable canopy, camouflaging among fibrous bark.
* Caravans crossing between Weavers' Cradle and the interior must travel in acoustic-shielded shuttle cages slung beneath the cables, watching for harpoon ambush lines.

---

## 5. Stations Specification (Region 99)

| Station | Name & Role | Map Px | Elev | Pressure | Mean Temp (Summer/Winter) | Rain | Climate | Key Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Weavers' Cradle**<br/>(Western Arable) | `1215, 845` | $+2,180\text{ m}$ | $1.23\text{ atm}$ | $+5.5^\circ\text{C}$<br/>($+17.5 / -6.5$) | $380\text{ mm}$ | **Dfb** | Glacial braided rivers, fertile loess terraces, stone field walls, draft hexapod farms |
| **2** | **The Fluted Monocline**<br/>(Step Pass) | `1285, 830` | $+1,350\text{ m}$ | $1.35\text{ atm}$ | $+10.4^\circ\text{C}$<br/>($+21.0 / -1.5$) | $140\text{ mm}$ | **BSk** | Broad basalt structural benches, road caravansary, descending talus skirts |
| **3** | **The Looming Chasms**<br/>(Suspension Canopy) | `1390, 835` | $+620\text{ m}$ | $1.48\text{ atm}$ | $+15.2^\circ\text{C}$<br/>($+26.0 / +3.5$) | $42\text{ mm}$ | **BWk** | $180\text{ m}$ basalt rifts, namakier salt glaciers, dense living cable bridges, aerial shuttle lines |
| **4** | **Mount Caelum & Lake Nim**<br/>(Dome & Playa) | `1355, 840` | $+4,650\text{ m}$<br/>(Playa: $+480$) | $0.89\text{ atm}$<br/>(Playa: $1.49$) | $-13.5^\circ\text{C}$<br/>(Playa: $+16.1$) | $210\text{ mm}$<br/>(Playa: $28$) | **ET**<br/>(Playa: **BWk**) | Resurgent volcanic dome overlooking the white salt playa; fumarole plumes, mineral brine pool |

---

## 6. Technical Implementation: `tools/scale-model/edit_loom_chasms.py`

Following the proven architecture of `edit_422.py` and `edit_423.py`:

```python
#!/usr/bin/env python3
"""Scale model 4.24 edit: Region 99 Loom-Chasm Barrens & Weavers' Cradle.
Carves an enclosed -3,500m depression basin, elevates Mount Caelum,
builds the western loess piedmont, reclimates lapse rates, and closes sealed-basin hydrology.
"""
import sys, os, io, json, base64, re
import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw

def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def displace_heights(E, OW, OH, VW, VH, poly_mask):
    """Excavate the enclosed basin and raise Mount Caelum."""
    En = E.copy()
    cx, cy = 1355.0, 840.0
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    
    # 1. Broad radial depression (carve down to +600m)
    Y, X = np.ogrid[:VH, :VW]
    dist_km = np.hypot((X / su - cx), (Y / sv - cy)) * 2.0  # 2 km/px
    
    depth_factor = 1.0 - smoothstep(140.0, 320.0, dist_km)
    target_floor = 620.0
    En = np.where(depth_factor > 0, En * (1.0 - depth_factor) + target_floor * depth_factor, En)
    
    # 2. Re-elevate Mount Caelum resurgent shield (radius 48km, height +4,650m)
    caelum_w = np.clip(1.0 - (dist_km / 48.0)**2, 0.0, 1.0)
    En += caelum_w * 3950.0  # lifts summit from +700m to +4,650m
    
    # 3. Elevate Western Arable Piedmont (Weavers' Cradle, X: 1172-1260)
    west_mask = (X / su >= 1172) & (X / su <= 1270) & (Y / sv >= 740) & (Y / sv <= 950)
    x_progress = np.clip((X / su - 1172) / (1270 - 1172), 0.0, 1.0)
    cradle_h = 2400.0 * (1.0 - x_progress) + 1800.0 * x_progress
    En = np.where(west_mask, cradle_h, En)
    
    # 4. Enforce outer border continuity (40 km smoothstep to match S Outlands / Siphon Pits)
    return En
```

### Assertions & Quality Checks
1. **Basin Closure Asserted:** The minimum spill elevation along Region 99's polygon perimeter must exceed $+3,850\text{ m}$, verifying that zero surface water leaks outward into adjacent lowlands.
2. **Playa Lake Equilibrium:** Lake Nim surface area must stabilize between $35\text{ and }55\text{ km}^2$, perfectly balancing runoff against $880\text{ mm/yr}$ evaporation.
3. **Seam-Free Gradient:** Slope magnitude $\nabla h$ across the outer polygon perimeter cannot exceed $0.08$ ($4.5^\circ$), guaranteeing complete contiguity with surrounding biomes.
