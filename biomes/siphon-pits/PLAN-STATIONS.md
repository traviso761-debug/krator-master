# Siphon Pits & Ostrukh Terraces: Stations Plan (Region 98)

> **Coordinate Frame:** All `px, py` (`X, Y`) coordinates in this document and in `biomes/siphon-pits/*/station.json` are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.

The owner (2026-10-27):
> "let's implement stations so the siphon pits are to the southeast of region 98 and there is a warmer, cold but arable region in the NW portion. propose terrain adjustments as needed"

This plan establishes the 4-station architecture for **Region 98** (`rmvra9zogfm9t`, kind: `biome`, bounds $X \in [1456, 1769], Y \in [1387, 1628]$, area $\sim 174,756\text{ km}^2$), the terrain modifications required on the Krator Scale Model, the physical climate gradient, and engine integration for `claude/biome-rebuild`.

---

## 1. Scale Model Terrain Adjustments

To create a physically coherent split between a **warmer, cold-but-arable NW** and the **frozen plateau with geothermal maar sinks in the SE**, three terrain adjustments are proposed for the Scale Model (`tools/scale-model/`):

```
                        REGION 98: NW-TO-SE TERRAIN TRANSECT
  
  NW                                                                            SE
  Stalker Massif    NW Step Basin       Central Scarp      High Basalt Plain    Siphon Pit
  (+13 to +15 km)   (+2,000m to 2,300m) (+3,350m pass)     (+4,250m datum)      (+3,800m floor)
       ▲                                                        Arête (6m)
      / \                                                         ┌──┐
     /   \   Foehn Warming                                        │  │ 425m Drop
    /     \ ──────────────►                                       │  └──┐
   /       \                                                ┌─────┘     │
  /         \       Station 1                Station 2      │           │    Station 3
 /           \      Ostrukh Terraces         Scarp Divide   │           └──┐ Maar Floor
/             \     ┌──────────────┐         ┌──────────┐   │  Station 4   │ ┌───────────┐
               \────┴──────────────┴─────────┴──────────┴───┘  Arête Way   └─┴───────────┴─
```

### Adjustment A: The Ostrukh Piedmont Depression (NW Graben / Basin)
* *All three adjustments are out of the kit's scope (2026-11-11): a to-do for the next scale model update, and the model already holds most of A and C (`PLAN.md` section 0).*
* **Coordinates:** $X \in [1456, 1557]$, $Y \in [1387, 1485]$ ($\sim 200\text{ km} \times 195\text{ km}$, $\sim 39,000\text{ km}^2$).
* **Elevation Edit:** Carve a down-dropped tectonic half-graben stepping down from the $+4,200\text{ m}$ rim datum to **$+1,950\text{ to }+2,300\text{ m}$**.
* **Atmospheric Consequence:**
  * Pressure increases from $0.94\text{ atm}$ to **$1.20\text{--}1.25\text{ atm}$** (corrected: the model's air law).
  * Lapse rate warming (the model's $6.5^\circ\text{C}/\text{km}$; the dry adiabat is $7.4$) plus the foehn: the model already gives **$+15^\circ\text{C}$** at Station 1 and a median $+12^\circ\text{C}$ over the NW sector (corrected: the old $+3.5$ to $+5.0$ contradicted the station's own record).
  * Changes climate classification from Arctic Tundra (ET) to **Dfb / Cfb (cool-temperate arable highland)**.
* **Drainage & Hydrology:**
  * Author a glacial braided meltwater river network flowing east from the Stalker Peaks' canyons ($X \approx 1456, Y \approx 1418$) across the alluvial floor.
  * Glacial flour + weathered maar volcanic ash yields fertile, arable loam.

### Adjustment B: The Ostrukh Wall / Fault Escarpment (Central Divide)
* **Coordinates:** A linear fault scarp trending SSW-to-NNE from $[1532, 1505]$ to $[1582, 1387]$.
* **Elevation Edit:** A steep $1,500\text{--}1,800\text{ m}$ stepped basalt fault cliff separating the NW lowlands ($+2,100\text{ m}$) from the SE plateau ($+4,200\text{ m}$).
* **Caravan Notch:** A natural scree-ramp pass at $[1559, 1457]$ (elev $+3,289\text{ m}$) allowing road transit between the arable basin and the high plain.

### Adjustment C: The SE High Plain & Siphon Maar Swarm
* **Coordinates:** $X \in [1582, 1769]$, $Y \in [1470, 1628]$ ($\sim 115,000\text{ km}^2$).
* **Elevation Edit:** Maintain the exposed plateau high at **$+4,200\text{ to }+4,500\text{ m}$** (mean $-5.0^\circ\text{C}$, katabatic gales, subpolar desert).
* **Crater Negative Stamps:** Carve a linear swarm of $35\text{--}50$ circular/elliptical negative stamps ($D = 2.5\text{--}5\text{ km}$, sunken maar floor at $+2,277\text{ m}$ with $420\text{ m}$ inner crater benches) along the volcanic fissure axis ($X \approx 1622\text{ to }1732, Y \approx 1510\text{ to }1600$).
* **Arête Preservation:** Maintain razor-thin basalt bridges ($5\text{--}10\text{ m}$ wide) between coalescing stamp intersections.

---

## 2. Stations Overview

| Station | Name & Role | Model Px | Elev | P (atm) | Mean T (warm/cold) | Climate | Key Feature |
|---|---|---|---|---|---|---|---|
| **1** | **Ostrukh Terraces** (NW Arable) | `1519, 1453` | $+2,157\text{ m}$ | $1.22$ | $+15^\circ\text{C}$ ($+28 / +2$) | Cwb | Meltwater streams, loess terraces, crops, farmsteads |
| **2** | **Scarp Pass** (Central Divide) | `1559, 1457` | $+3,289\text{ m}$ | $1.06$ | $+4^\circ\text{C}$ ($+17 / -9$) | Dsc | Stepped columnar wall, switchback road, tollhouse |
| **3** | **Siphon Maar Floor** (SE Sink) | `1687, 1555` | $+2,277\text{ m}$ | $1.20$ | $+18^\circ\text{C}$ ($+32 / +6$) | Cfa | Deep maar sink, woolly siphon grove, steam vents |
| **4** | **The Arête Way** (SE Rim) | `1678, 1542` | $+4,269\text{ m}$ | $0.94$ | $-5^\circ\text{C}$ ($+8 / -18$) | ET | $6\text{ m}$ knife-edge bridge, blizzard gales, flenser ambush |

*Corrected 2026-11-11 from scale model 5.1 (`PLAN.md` section 0): pressure is the model's air law, $1.6\,e^{-h/8000}$ atm; the temperatures are the model's `tm` / `tw` / `tc`. The old Station 3 note (pressure "boosted by CO$_2$ pooling") is dropped: a pure CO$_2$ layer 303 m deep would add 0.017 atm and kill everything in it. `verify.py --assert` reads this table.*

---

## 3. Station Specifications

### Station 1: Ostrukh Terraces (The Cold Arable Basin — NW)
* **Site & Context:** The sheltered agricultural piedmont of Region 98, receiving glacial runoff from the Stalker Peaks and adiabatic foehn winds from the west.
* **Terrain & Water:**
  * Stepped dry-stone agricultural terraces (`kits/crops` `terrace` zone).
  * Braided meltwater stream channels (`core/water` flow kind), gravel bars, and stone irrigation sluices.
  * Dark volcanic loess soil (`ground.soil.volcanic`, `ground.turf.alpine`).
* **Vegetation & Crops:**
  * Highland frost-barley, cold-hardy black tubers, dwarf blue-willow along stream cuts.
  * Domestic Ghaunt-Ox pairs pulling heavy stone seed-drills.
* **Props & Architecture:**
  * Low basalt-slab farmhouses with sod roofs, communal stone granaries, timber flumes, threshing yards.
  * Grain export wagons staging for the climb up to the Scarp Pass.

### Station 2: The Scarp Pass (The Central Dividing Fault)
* **Site & Context:** The narrow transit notch cut through the $1,600\text{ m}$ fault escarpment linking the arable lowlands to the high plain.
* **Terrain & Geology:**
  * Massive vertical hexagonal basalt columns (`stone.basalt.columnar`), frost-riven talus aprons.
  * Paved switchback road hugging the cliff face with heavy stone parapets.
  * Patterned ground: permafrost stone nets and solifluction lobes (`42-core-frost.js`).
* **Vegetation & Fauna:**
  * Stunted cushion mosses, orange rock-lichen, mountain scree sedges.
  * Wild Ghaunt-Ox herds migrating along the cliff ledges.
* **Props & Architecture:**
  * Fortified stone tollhouse / caravansary built into a natural columnar rock shelter.
  * Iron beacon baskets, windbreak palisades, freight exchange crane.

### Station 3: Siphon Maar Floor (The Sunken Geothermal Sink — SE)
* **Site & Context:** The flat floor of a $420\text{ m}$ deep collapsed volcanic explosion crater (floor $+2,277$, rim $+2,697$ m), sunk in the floor of the sink the model holds 2 km under the plateau, permanently insulated beneath an amber inversion fog lid at $+2,580$ m.
* **Terrain & Geology:**
  * Completely enclosed by vertical $400\text{ m}$ columnar basalt ring walls.
  * Flat floor of diatomaceous silt, sulfurous mud pools, and steaming diatreme vents.
  * Subterranean magma tube portals opening into neighboring collapse basins.
* **Vegetation & Ecology:**
  * Dense groves of **Woolly Siphon trees** (`woolly_siphon`): hollow chimney trunks venting steam, enveloped in $15\text{ cm}$ lanolin-wax pelts.
  * Carpet of spongy **Siphon-Felt turf** (`siphon_felt` / `kground`).
  * Bulbous **Suture-Galls** along basalt fractures; burrowing **Basalt Pipe-Borers**.
* **Props & Human Activity:**
  * Siphon-Roper base camp: heavy canvas huts, copper rendering cauldrons melting raw machine-wax into ingots.
  * Steel cable anchor rigs anchored to fallen basalt blocks, connecting to surface cranes above.

### Station 4: The Arête Way (The Knife-Edge Bridges — SE Rim)
* **Site & Context:** The razor-thin basalt spine separating two adjacent $420\text{ m}$ collapse pits at plateau level, swept by freezing katabatic blizzards.
* **Terrain & Geology:**
  * A basalt knife-edge $5\text{ to }8\text{ m}$ wide, flanked on both sides by sheer $400\text{ m}$ precipices plunging into glowing amber fog.
  * Shattered maar blast breccia, volcanic bombs, black rime ice on windward faces.
* **Fauna & Ambush Hazard:**
  * Stalking grounds of the **Flenser-Hound** (`flenser_hound`): crouching just below the fog line, locking arête claspers to rock during gusts, lunging to strike caravan stragglers.
* **Props & Human Activity:**
  * Iron stanchions and guy-wire guide ropes strung along the knife-edge path.
  * Massive wooden and iron windlass gantry anchored over the abyss, with suspended rope-cradles lowering wax harvesters into the void.

---

## 4. Rebuild & Pipeline Integration

1. **Materials & Textures:**
   * Reuses (real names, `PLAN.md` section 6): `ground.turf.native`, `ground.terrace.field`, `rock.loess`, `rock.basalt.polygonal`, `rock.basalt.vesicular`, `card.clubmoss`, `kits/crops`.
   * New slots required: `woolly_siphon` (flared chimney trunk + fleece normal/roughness), `siphon_felt` (fibrous turf groundcover), `machine_wax` (translucent amber ingot material).
2. **Terrain Engine (`core/terrain`):**
   * Graben carve: Negative step brush in `30-core-field.js` across $X \in [1456, 1557], Y \in [1387, 1485]$.
   * Pit stamps: `KRELIEF.stepcut` (`38c-core-landforms.js`; `KBASIN` is old lake beds, not a stamp).
   * Frost pass: `42-core-frost.js` applied to Station 2 & 4 plateau surfaces.
3. **Atmospheric Shaders (`core/atmos`; its shared sky is `core/atmos/sky`, there is no `core/sky`):**
   * Station 1: Bright, clear, sub-alpine sun with thin mountain haze.
   * Station 2 & 4: Frigid polar blizzard, blowing snow particle emitter, low sun angle.
   * Station 3: the amber deck as the height fog's mist pooled under $+2,580$ m ($Y_{\text{floor}} + 303$ m), visibility $\sim 200$ m on the floor (corrected from +150 m and 25 m).
4. **Performance Targets (`GRAPHIC-LOAD.md`):**
   * Geometry welding (`BIO.INDEX_ITEMS = true`) on all siphon chimneys and fleece meshes.
   * Tight MultiMesh culling: Station 3 floor capped at 250 active trees per chunk; zero tree instances on Station 2 and 4.
