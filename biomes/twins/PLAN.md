# The Twins (`twins`) — Active Twin-Volcano Divide, Pyroduct & Geothermal Oasis Caravan Crossings, and Guide Traps (`PLAN.md`)

> **Status: Proposed Biome Kit & Scale-Model `5.1` Sculpting Blueprint (`2026-11-06`).**
>
> **Polygon:** `twins` (`id: "rmw536m06wlyf"`, `kind: "biome"`, `7` vertices: `[[935, 1476], [978, 1419], [1059, 1472], [1095, 1521], [1092, 1556], [1043, 1570], [987, 1515]]`).
> - **Bounding Box & Area:** `X = 935..1095` (`~320 km` NW–SE), `Y = 1419..1570` (`~302 km` NE–SW); **`12,159 px` = `48,636 km²`** on the `1821 × 1723` (`2 km/px`) Scale Model `5.1` master grid (subtract `DX = 272, DY = 330` for legacy `4.23` coordinates).
> - **Adjacencies (`5.1`):** Divides the **Vale of Xanadu** (`rmuf30815vwms`, SW at `X = 769..950, Y = 1455..1547`), **Xanadu** (`rmvkkmitffbjk`) / **Xanadu Sultanate** (`rmufcgvtxatfx`), and the caravan gate-town of **Strongbow** (`(1026, 1594)`) from the hyperarid endorheic basin of **The Catch** (`rmuf346nvpktx` / `rmvka7icdn1dq`, NE at `X = 958..1274, Y = 1288..1520`) and the Hill-arcology camp of **Stair** (`(1106, 1442)` on `5.1`, old `(834, 1112)`). Flanked to the NW by the **Godthrone** (`rmvkkebdukgx7`) and **Godshearth** (`rmw4wou2y1hhc`, `X = 808..880, Y = 1370..1451`), and to the SE by **Oidong Valley** (`rmuklrcae6jb5`, `X = 997..1307, Y = 1564..1680`).

---

## 0. Kit Identity & Core Adoption (`TWINS` on `BIOME-API.md`)

**Owner's Brief:**
> *"similarly, the region 'twins'. this tall and inhospitable range divides Xanadu and the Catch and contains the Twins, two active small volcanoes. Savvy travellers know two ways to make the crossing easier; one route across that runs through extinct lava tubes with brief runs between them outside; and another, mostly outside route that dashes between a handful of not quite yellowstonian, but warm enough geothermal temperature oases. The Xanadui guides are paid well; those who have been stiffed, or mistreated, have been known to lead caravaneers to dead end frozen vales or active lava pools where they abandon them to their demise...."*

### What the Kit Is (`biomes/twins/`)
`biomes/twins/` (`window.TWINS`, `id: 'twins'`) is the steep, black basaltic-andesite and titanium-basalt volcano-cordillera that walls off the lush Mediterranean-and-cloud-forest basin of **Xanadu** in the southwest from the alkali-salt ergs of **The Catch** in the northeast. Crowned by **The Twins (*Al-Qaranān*)**—two active parasitic volcanic cones straddling a steaming NW–SE fissure-ridge—the range is a freezing, wind-lashed barrier (`+3,600 m` in the lower pass approaches to `+6,800 m` / `+12,180 m` at the active cones) pierced by two contrasting caravan lifelines and honeycombed with lethal traps known only to the sworn **Xanadui Guild of the Two Horns (*Dalīl al-Qaranayn*)**.

| Parameter | Specification |
| :--- | :--- |
| **Kit Folder & Object** | `biomes/twins/` (`window.TWINS`, `BIO.init({tags:'twins'})`) |
| **Core Modules Adopted** | `core/biome`, `core/rand` (`KRAND`), `core/tags`, `core/space` (`KSPACE`), `core/host` (`KHOST.FULL`), `core/atmos` (thin-air mountain sky, SO₂/steam volcanic plumes, nocturnal katabatic frost-winds, height-fog in box vales), `core/water` (`WATER.geyser` low fumarolic seeps, `WATER.terrace` compact travertine/sinter aprons, `WATER.still` warm tarn pools & molten lava ponds, `WATER.ice` Erebus fumarolic ice towers & glaciers), `core/terrain` (`KFIELD`, `KSTRATA` with `tibasalt` + `obsidian` + `scoria` recipes, `KRELIEF.talus`, `KRELIEF.tube` lava-tube skylights & portals, `KFROST` periglacial scree), `core/hazard` (`KHAZ` sub-zero wind-chill, thin lava crusts, `1,150 °C` degassing lava sumps, CO₂/SO₂ dead-air pockets) |
| **Cross-Kit Interfaces (Read in Place)** | • **`biomes/xanadu` (`--station ranges`, `PLAN-STATIONS.md` ll. 42–53):** Supplies the SW subalpine approach flora (agate-barked Xanadu pine krummholz, high-range cushion plants) and links `tube_xanadu_nw_09` directly to the sacred River Alph's chasm headwaters.<br>• **`biomes/geyser` (`--station puna` & `--station ice`, `PLAN-STATIONS.md` ll. 31–57, 85–97):** Supplies the Mount Erebus fumarolic ice chimneys and subglacial melt caves on the upper flanks of the SE Twin `(1042, 1498)` (`--station ice`) and the compact, El Tatio / Puna-style steaming sinter aprons, orange/black cyanobacterial mats, and borate crusts of the Five Steaming Stones (`--station puna`).<br>• **`biomes/catch` (`PLAN.md` ll. 146–196):** Supplies the NE desert-fan transition toward **Stair** `(1106, 1442)`, the alkali-dust haze carried up by afternoon anabatic gusts, and the multi-ethnic caravan traffic (**Xanadui, Yuni, Izani, Dasrī**).<br>• **`biomes/godthrone` (`tubes`) & `biomes/hearths` / `biomes/godshearth`:** Supplies the drained master pyroduct geometry (`tube_xanadu_nw_09`, `tube_xanadu_se_10`, intact levee benches, glazed ceiling drip-stalactites) and stunted, knee-high *pocket-hearth* shrubs & *bobby-sock* sedges colonizing the five geothermal oases. |

---

## 1. Current Ground on Scale Model `5.1` vs. Proposed Reshaped Physiography

### 1.1 Why the Uncarved `5.1` Polygon Needs a Sculpted Inter-Twin Saddle & Flank Structure
On the current uncarved `5.1` height raster (`12,159 px` = `48,636 km²`), `"twins"` (`rmw536m06wlyf`) inherits the raw, uncarved southeastern shield apron of the Godthrone plus two massive `14.4 km`-radius cone stamps:
- **Current `5.1` Elevation Percentiles:** `min = +2,689 m`, `p10 = +5,755 m`, **`median = +7,665 m`**, `p90 = +10,499 m`, `max = +13,137 m`.
- **Current `5.1` Climate Breakdown:**
  - `HF` (Hypobaric Ice, `6,250–9,000 m`): **`29.6%` (`14,384 km²`)**
  - `O` (Exospheric / Airless, `> 9,000 m`): **`26.4%` (`12,856 km²`)**
  - `EF` (Glacial Ice Cap, `4,800–6,250 m`): **`26.1%` (`12,696 km²`)**
  - `ET` (Alpine Tundra): **`7.9%` (`3,856 km²`)**
  - `HT` (Hypobaric Tundra): **`5.9%` (`2,860 km²`)**
  - `Dsc` (`2.8%`, `1,364 km²`), `BSk` (`0.9%`), `Dsb` (`0.4%`).
- **The Problem:** With **`56.0%` of the polygon in airless/unbreathable `O` and `HF`** and another **`26.1%` under permanent `EF` ice sheet**, the inter-Twin col sits at `7,400–9,300 m` (`0.50–0.63 atm`, `-28 to -42 °C`). Pack beasts cannot breathe in `Class O`, groundwater is frozen hundreds of metres deep outside the raw vent throats, and the two cones read as `9–12 km` planetary megavolcanoes rather than *"a tall and inhospitable range... [that] contains the Twins, two active small volcanoes"* crossed by caravan routes.

### 1.2 Proposed Reshaped Physiography (`+3,600 m` to `+6,800 m` Range & Pass System)
To make `"twins"` physically and ecologically faithful to the brief while preserving its barrier severity:
1. **Lower the Regional Range Spine & Flank Corridors into the High-Alpine / Sub-Nival Window (`+3,600 m` to `+5,800 m`):**
   - **SW Xanadu Approach & Strongbow Foreland (`X = 935..995, Y = 1475..1565`):** Grades from `+2,690 m` at the Xanadu border up through `+3,400–4,200 m` (`Dsc` / `Dsb` / `ET`, `0.95–1.14 atm`).
   - **The Inter-Twin Caravan Saddle (*Col of the Two Horns*, `px 995..1035, 1465..1495`):** Sculpted down from `~7,800 m` to **`+4,250 – +4,850 m`** (`0.87–0.94 atm`, `ET` / lower `EF` edge, ambient `T_mean = -3 to -8 °C`). At this altitude, the pass is bitterly cold, rime-swept, and lethal at night (`-18 to -26 °C` outside), so neither beast nor driver can survive exposed overnight camps—making **Route A (the warm lava tubes)** and **Route B (the five `+10 to +20 °C` geothermal temperature oases)** essential for survival!
   - **NE Catch Descent toward Stair (`X = 1015..1095, Y = 1425..1515`):** Steps down across faulted basalt benches and gravel fans from `+4,200 m` to `+2,600 m` toward **Stair** (`(1106, 1442)` at `+1,130 m`).

```
       THE TWINS (rmw536m06wlyf) — NW-TO-SE RIDGE & CARAVAN SADDLE PROFILE (5.1)

  NW (Godthrone Tie-In)         NW TWIN (Al-Qaran al-Kabīr)        INTER-TWIN FISSURE COL         SE TWIN (Al-Qaran al-Ṣaghīr)       SE (Oidong Tie-In)
   px (965, 1435)                    px (988, 1458)              px (1007..1024, 1472..1485)           px (1042, 1498)               px (1075, 1540)
                                    ( Plume & Lava )                                                  ( Erebus Ice & )
                                       /\  /\                        Fissure Vents                       /\  /\
                                      /  \/  \  +6,480 m              (1007,1472)                       /  \/  \  +5,880 m
   +5,400 m Ridge                    /        \ (or 12.18 km)         & (1024,1485)                    /        \ (or 9.34 km)
  ═══════════════\                  /          \                      +4,350–4,850 m                  /          \                  /═══════════════
                  \                /  Active    \       Route B:      Steaming-Stone                 /  Erebus    \                /  +4,600 m Ridge
   Dead-End Frozen \              /  Lava Sump   \      5 Geothermal  Oases [1]..[5]                /  Ice Towers  \              /  toward Oidong
   Box Vales        \____________/  (Trap Pits)   \____/~~~*~~~*~~~*~~~*~~~*~~~\___________________/  & Tube 10     \____________/
   (-32 °C Traps)                   ═══════════════[===]═══( Skylight )═══[===]════════════════════
                                    Route A: Extinct Master Lava-Tube Chain + 3 Open-Air Sprints
```

### 1.3 Handling the Step 7I Vent-Peak Guard in `build_425_master.py` (Two Clean Engineering Options)
In `tools/scale-model/build_425_master.py` (Step 7I), an automated assertion checks every entry in `D['vents']`: within a `6 px` (`12 km`) radius of `(vx, vy)`, the raster maximum `En_exp` must stay within `400 m` of the vent's declared `peak` (or `floor`), or the build raises a vent-guard failure. For the four vents inside `"twins"`, we document **two clean, mutually compatible options** for the owner to choose when applying the `5.1` terrain pass:

| Option | How It Works in `build_425_master.py` | Pros & Tradeoffs |
| :--- | :--- | :--- |
| **Option A (Recommended — Rescale Metadata to True "Small Active Volcanoes"):** Update `D['vents']` metadata for the 4 Twins vents along with the terrain lowering | Lower the inter-Twin range spine to `+4,200–5,200 m` and rescale the 4 `D['vents']` entries so the Twins are true **small active stratocones (`1,400–1,800 m` prominence above the saddle)**:<br>• **NW Twin `(988, 1458)`:** `floor: 5980.0`, `peak: 6480.0`, `radius: 5.5` (`11 km`).<br>• **SE Twin `(1042, 1498)`:** `floor: 5420.0`, `peak: 5880.0`, `radius: 5.5` (`11 km`).<br>• **Fissure Vent NW `(1007, 1472)`:** `floor: 4680.0`, `peak: 4840.0`, `scale: 0.18`, `radius: 1.6`.<br>• **Fissure Vent SE `(1024, 1485)`:** `floor: 4460.0`, `peak: 4610.0`, `scale: 0.18`, `radius: 1.6`. | **Best matches the owner's prompt** (*"contains the Twins, two active small volcanoes"*): eliminates airless `Class O` inside `"twins"`, keeps the summit cones in `EF / HT` (`0.71–0.76 atm`) where visible steam/ash plumes and Mount Erebus ice towers (`biomes/geyser` Station 5) form naturally, and passes Step 7I with zero exceptions. |
| **Option B (Preserve Legacy `D['vents']` Heights via `6 px` Local Pinnacles):** Keep `D['vents']` untouched and carve the saddle around `r > 6 px` | Leave `D['vents']` at `12,180 m` `(988, 1458)`, `9,340 m` `(1042, 1498)`, `9,493 m` `(1007, 1472)`, and `7,535 m` `(1024, 1485)` by applying a `1.0` pinnacle-preservation weight within `r <= 5.5 px` (`11 km`) of the vents while carving the caravan corridors (`+3,800–4,850 m`) along sinuous paths `>= 6 px` (`12 km`) away from the vent centres. | Requires zero changes to `D['vents']` JSON metadata or legacy `xanadu`/`geyser` altitude citations (`10.7 km` and `8.4 km`), though it leaves four ultra-steep needle cones (`7.5–12.2 km`) protruding out of the `+4,500 m` range. |

---

## 2. The Twins Volcanoes (*Al-Qaranān* — The Elder & Younger Horns)

Rising along a `78 km`-long NW–SE extensional transfer fissure that splays off the southeastern flank of the **Godthrone** (`rmvkkebdukgx7`), **The Twins** are a pair of active, steep-sided **basaltic-andesite and titanium-basalt composite cones** connected by a steaming curtain-fissure ridge:

| Vent Feature | `5.1` `px, py` (Legacy `4.23`) | Current `5.1` `floor / peak` | Option A Rescaled `floor / peak` | Radius & Scale | Volcanological Character & Surface Set-Pieces |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. North-West Twin (*Al-Qaran al-Kabīr* — The Elder Horn / The Ember Twin)** | **`988.0, 1458.0`**<br>`(716, 1128)` | `11,080 m` / `12,180 m` | **`5,980 m` / `6,480 m`**<br>(`0.71 atm`, `HT/EF`) | `r = 7.2 px` (`14.4 km`, or `11 km` Opt A), `scale = 0.5` | **Dry, Effusive & Strombolian Cone:** Breached on its SW and SE rim by a persistent **`1,150 °C` degassing basaltic-andesite lava lake** (*The Red Eye of Strongbow*). Feeds both the drained master pyroduct `tube_xanadu_nw_09` (headwater conduit of Xanadu's sacred River Alph) and active crusted-over lava sumps on its lower SE apron. |
| **2. South-East Twin (*Al-Qaran al-Ṣaghīr* — The Younger Horn / The Rime Twin)** | **`1042.0, 1498.0`**<br>`(770, 1168)` | `8,535.2 m` / `9,340 m` | **`5,420 m` / `5,880 m`**<br>(`0.77 atm`, `EF`) | `r = 7.2 px` (`14.4 km`, or `11 km` Opt A), `scale = 0.5` | **Glaciated Volcano-Cryospheric Cone (`biomes/geyser` Station 5 `ice`):** Mantled in a thick summit glacier whose ice is perforated by **Mount Erebus–style fumarolic ice towers** (`4–12 m` hollow rime chimneys), blue-lit subglacial steam caves (`tube_xanadu_se_10`), and `84–88 °C` boiling snow-slush pots. |
| **3. Inter-Twin Fissure Vent NW (*Jamarāt al-Shamal* — The Cinder Stitch)** | **`1007.0, 1472.0`**<br>`(735, 1142)` | `9,333.1 m` / `9,493.1 m` | **`4,680 m` / `4,840 m`**<br>(`0.87 atm`, `ET`) | `r = 1.6 px` (`3.2 km`), `scale = 0.18` | **Spatter-Cone & Obsidian Coulee Vent:** A `160 m`-high parasitic spatter rampart surrounded by ropy *pāhoehoe* slabs, glossy black **obsidian coulees**, and sulfurous fumarole cracks (`SO₂ / H₂S`) that heat the central caravan col and feed **Oasis 2 (*Mud-Kettle*)** and **Trap Sump B**. |
| **4. Inter-Twin Fissure Vent SE (*Jamarāt al-Janūb* — The Steam Stitch)** | **`1024.0, 1485.0`**<br>`(752, 1155)` | `7,385.4 m` / `7,535.4 m` | **`4,460 m` / `4,610 m`**<br>(`0.90 atm`, `ET`) | `r = 1.6 px` (`3.2 km`), `scale = 0.18` | **Phreatomagmatic Maar & Hydrothermal Breccia Cone:** Where glacial meltwater off the SE Twin infiltrates the fissure dike, driving low phreatic steam puffs and feeding the warm alkaline-silica springs of **Oasis 3 (*Cushion-Warmth*)** and **Oasis 4 (*Brimstone-Tarn*)**. |

---

## 3. The Two Savvy Caravan Crossings Between Xanadu & The Catch

Merchants hauling **Xanadui silk, cloud-timber, tea, and lacquerware** northeast from **Strongbow** (`(1026, 1594)`) or **Vale of Xanadu** (`(938, 1496)`) to **Stair** (`(1106, 1442)`), and returning with **Catch potash, alkali salts, and salvaged Ancient energy cells** (`biomes/catch/PLAN.md` §6a), never attempt the open ridge crest (`-20 to -35 °C`, `90–120 km/h` katabatic gales). Instead, savvy travellers rely on one of two specialized routes across the `~130 km` mountain core:

```
         SCHEMATIC MAP OF THE TWO CARAVAN CROSSINGS & GUIDE TRAPS (5.1 CANVAS)

                       NW TWIN (988, 1458)                     To THE CATCH & STAIR (1106, 1442)
                        [Active Volcano]                                    ▲  ▲
                           /        \                                      /  /
    From VALE OF XANADU   /  Trap L1 \      [Breath 2]      [Breath 3]    /  /
    (Alph Chasm 938,1496)/  (992,1465)\     (1003,1469)    (1021,1461)   /  /
         ●══════════════●══════════════○───●══════════○───●═════════════●  /  <-- ROUTE A: Dark-Tube Road
        Tube 09 (West)   [Breath 1]     Tube 09b (Col)     Tube 09c (NE)  /       (Extinct Lava Tubes + 3 Sprints)
                         (980,1467)          \                            /
                                      Fissure \ (1007,1472)              /
                         Trap F1          ▲    \                        /
                       (968,1442)          \    *[2]────*[3]────*[4]───*[5] (1056,1462)
                     [Frozen Vale]          \  /        (1024,1485)         <-- ROUTE B: Steaming-Stone Dash
                                             *[1]          ▲    \               (5 Geothermal Oases Outside)
                                          (996,1504)             \  Trap L2 (1035,1493)
                                             /                    \
                                            ●──────────────────────● (1042, 1498) SE TWIN
                                       (1010,1517)  Tube 10 (SE)      [Erebus Ice Volcano]
                                           ▲                            \
                                           │                             \ Trap F2 (1068, 1528)
                                 From STRONGBOW (1026, 1594)              [Frozen Box Vale]
```

---

### 3.1 Route A — The Dark-Tube Road (*Darb al-Anfāq* / The Extinct Pyroduct Sprint)
- **Concept:** A subterranean-dominant crossing (`~82 km` underground in four drained basaltic master lava tubes, broken by **three brief, harrowing open-air sprints** totaling `~11 km` outside) that threads the root-zone of the NW Twin and the inter-Twin fissure col.
- **Why Caravans Take It:** Inside the extinct `12–22 m`-wide, arched basalt pyroducts, residual conductive heat from the deep fissure plumbing (`+8 to +15 °C`), complete shelter from the howling katabatic winds, and flat solidified lava-bench causeways (*curb-ledges*) allow heavily laden pack-mules and yaks to march in shirt-sleeve warmth—**except where seismic roof collapses force the caravan to scramble out of a skylight portal and race across freezing, wind-lashed sub-nival scree (`-15 to -25 °C`) to the next tube mouth before frostbite or whiteout strikes**.
- **Segment-by-Segment Itinerary (`5.1` Coordinates):**
  1. **Tube Segment A1 — *Al-Nafaq al-Gharbī* (Western Alph Pyroduct, `tube_xanadu_nw_09` lower reach: `(938, 1496) -> (952, 1489) -> (966, 1479) -> (978, 1468)`):**
     - Enters above the sacred River Alph's chasm headgate (`biomes/xanadu/PLAN-STATIONS.md` §Station 3) at `+2,950 m` and climbs gently through a dry upper-level braided tube gallery (`+12 °C`, lit by Pale-Gold Cave-Lichen and iron torch-brackets left by the guides) to the **First Skylight Break** at `(978, 1468)` (`+4,180 m`).
  2. **Open Sprint 1 — *The First Breath / Al-Nafas al-Awwal* (`(978, 1468) -> (982, 1466)`, `~3.5 km` outside at `+4,180–4,290 m`):**
     - A frantic `40-minute` dash across a frost-shattered black obsidian boulder field under the looming `6,480 m` cone of the NW Twin. Rime-fog and `85 km/h` crosswinds whip the trail; ancient basalt cairns painted with yellow sulfur mark the dive-ramp into Tube A2.
  3. **Tube Segment A2 — *The Horn-Underpass* (`(982, 1466) -> (994, 1467) -> (1002, 1469)`, `+4,290 -> +4,480 m`):**
     - An ancient drained radial pyroduct curving around the southern shoulder of the NW Twin. The air here is `+16 °C` and smells faintly of warm iron and sulfur; glazed chocolate-brown **lava stalactites (*lavacicles*)** and tiered flow-line benches line the walls.
  4. **Open Sprint 2 — *The Saddle-Gasp / Nafas al-Sarj* (`(1002, 1469) -> (1006, 1468)`, `~2.8 km` outside at `+4,480–4,560 m`):**
     - The highest and most exposed sprint: crossing the knife-edge saddle just north of **Inter-Twin Fissure Vent NW (`1007, 1472`)**. Pelting graupel, sulfurous steam gusts from the nearby spatter cone, and loose cinders test every beast before the caravan plunges down a collapsed lava-trench portal at `(1006, 1468)`.
  5. **Tube Segment A3 — *The Saddle Siphon* (`(1006, 1468) -> (1014, 1464) -> (1020, 1461)`, `+4,560 -> +4,120 m`):**
     - A wide, double-decked master tube draining northeastward toward the Catch. Caravans camp overnight in the **Hall of the Tally-Marks** (`(1014, 1464)`), where warm `+14 °C` seepage from a roof crack fills a carved basalt cistern.
  6. **Open Sprint 3 — *The Catch-Leap / Wathbat al-Maṣīd* (`(1020, 1461) -> (1024, 1459)`, `~4.2 km` outside at `+4,120–3,940 m`):**
     - Where a listric fault scarp sheared off the tube roof, forcing a steep zig-zag sprint down frost-heaved basalt talus in full view of The Catch's vast yellow-white alkali plains below, diving back into the final lower tube at `(1024, 1459)`.
  7. **Tube Segment A4 — *The Stair Conduit* (`(1024, 1459) -> (1038, 1452)`, `+3,940 -> +3,150 m`):**
     - Exits through a monumental `18 m` basalt arch onto the upper gravel fan `~65 km` southwest of **Stair** (`(1106, 1442)`).
  - *(Note: A secondary southern feeder branch uses the lower dry galleries of `tube_xanadu_se_10` from `(1010, 1517)` near Strongbow up to `(1028, 1506)` to link Strongbow caravans into either Route A or Route B.)*

---

### 3.2 Route B — The Steaming-Stone Dash (*Darb al-Manāwir* / The Geothermal Oasis Hop)
- **Concept:** For caravans with bulky high-frame wagons, siege-engines, or claustrophobic herds that cannot fit through the `3.5 m` choke-points of the lava tubes, **Route B** runs **almost entirely outdoors** across the southern and central inter-Twin col (`+3,750 m` to `+4,780 m`), dashing day-by-day between **five compact, not-quite-Yellowstonian geothermal temperature oases (*The Five Steaming Stones / Al-Manāwir al-Khams*)**.
- **Why "Not Quite Yellowstonian, But Warm Enough":**
  - Unlike **Godshearth** (`rmw4wou2y1hhc`, an `8,748 km²` caldera with `35 m` climax *hearth-trees* and `60 m` geysers) or the lowland **Steampits** (`biomes/geyser` Station 1), the Twins' five oases are **small (`300–900 m` across), gritty, wind-besieged hydrothermal pockets (`biomes/geyser` Station 2 `puna` meets stunted `biomes/xanadu` `ranges` & dwarf `hearths`)**.
  - Each sits where a fault-fissure hot spring (`45–86 °C` water at `0.88–0.99 atm` boiling point) and conductive warm ground (`25–45 °C` soil) melt a **snow-free green-and-ochre island (`+10 to +20 °C` air at `0–3 m` height)** inside a howling `-15 °C` alpine freeze. There are no towering forests—only low, whistling travertine/sinter aprons (`1–3 m` high), bubbling mud-pots, steaming soaking pools ringed with ice crystals at their outer edge, carpets of *bobby-sock* sedge and emerald thermal moss, and chest-high thickets of wind-twisted **dwarf agate-pine** and **shrub-hearths** (`1.5–3 m` tall) where beasts and drivers huddle around warm basalt slabs to survive the night.

#### The Five Geothermal Temperature Oases (*Al-Manāwir al-Khams*) Along Route B

| # | Oasis Name (Xanadui / Trader) | `5.1` `px, py` | Elev & Pressure | Ambient vs. Oasis Microclimate | Hydrothermal Features & Ecological Character |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **1** | ***Bāb al-Bukhār* — Sinter-Gate** (SW Approach Oasis above Strongbow) | **`996, 1504`** | `+3,780 m`<br>(`1.00 atm`) | Ambient `+1 °C` (`Dsc`) -> **Oasis `+15 °C`** (`650 × 400 m`) | Low white travertine terraces fed by a `62 °C` bicarbonate spring at the toe of `tube_xanadu_se_10`. Groves of `4 m` **dwarf Xanadu agate-bark pine** (`biomes/xanadu` `ranges`), stone caravan corrals with geothermally heated floor slabs, and the Guild's SW toll-house. |
| **2** | ***Qidr al-Ṭīn* — Mud-Kettle Hollow** (SW Saddle Climb) | **`1005, 1489`** | `+4,320 m`<br>(`0.93 atm`) | Ambient `-4 °C` (`ET`) -> **Oasis `+12 °C`** (`450 × 350 m`) | Sheltered basalt maar crater (`35 m` deep) with plopping grey-rose kaolinite mud pots (`78 °C`), warm dry sand-beds where mules roll to shed ice, and `2 m` **dwarf pocket-hearth shrubs** unfolding plate-sized black radiator leaves at dusk. |
| **3** | ***Al-Miǧmarah* — The Brazier / Cushion-Warmth** (High Inter-Twin Col Oasis) | **`1016, 1479`** | `+4,680 m`<br>(`0.89 atm`) | Ambient `-7 °C` (`ET/EF`) -> **Oasis `+14 °C`** (`800 × 500 m`) | The mid-pass crossroads between **Fissure Vent NW `(1007, 1472)`** and **Fissure Vent SE `(1024, 1485)`**. Steaming El Tatio–style low geyser cones (`1.5–3 m` spouts every `20 min`), orange-and-black thermophilic cyanobacterial runoff aprons (`biomes/geyser` `puna`), lush *bobby-sock* sedge grazing flats, and the **Shrine of the Split Horn** where the second half of the guide's fee falls due. |
| **4** | ***Birkat al-Kibrīt* — Brimstone-Tarn** (NE High Shoulder Oasis) | **`1031, 1473`** | `+4,410 m`<br>(`0.92 atm`) | Ambient `-5 °C` (`ET`) -> **Oasis `+13 °C`** (`550 × 400 m`) | A `38 °C` milky-turquoise colloidal-sulfur tarn (`220 m` wide) rimmed by yellow sulfur needles, borate crusts, and warm mossy turf underneath the gleaming **Mount Erebus ice chimneys** of the SE Twin `(1042, 1498)`. |
| **5** | ***Manẓar al-Maṣīd* — Catch-Lookout Spring** (NE Descent Gate toward Stair) | **`1056, 1462`** | `+3,690 m`<br>(`1.01 atm`) | Ambient `+2 °C` (`BSk/ET`) -> **Oasis `+17 °C`** (`700 × 450 m`) | Perched on a faulted titanium-basalt ledge overlooking the vast salt-and-sand floor of **The Catch** (`biomes/catch`) and **Stair** `(1106, 1442)`. Alkaline-chloride hot springs (`70 °C`) feed stepped soaking basins where caravans wash alkali dust from their eyes and refill waterskins before descending to Stair. |

---

## 4. The Xanadui Guides (*Dalīl al-Qaranayn*) & The Traps for the Unpaying

### 4.1 Guild Customs, the Split-Coin Contract, & How Betrayals Happen
- **The Brotherhood of the Two Horns (*Ṭā'ifat Dalīl al-Qaranayn*):** Based in **Strongbow** (`(1026, 1594)`) and **Stair** (`(1106, 1442)`), the Xanadui mountain guides guard the shifting topology of the Twins as a hereditary trade secret. Because roof falls periodically seal lava-tube skylights on Route A and phreatic quakes shift which springs are boiling vs. dormant on Route B, an unguided caravan has less than a one-in-three chance of crossing without losing its pack train.
- **The Custom of the Split Tally:** By ancient law, a guide is paid **half the silver and rations at the gate** (Strongbow or Stair) and **the second half at the Mid-Col Shrine** (**Hall of the Tally-Marks** at `(1014, 1464)` on Route A, or **The Brazier / Oasis 3** at `(1016, 1479)` on Route B), plus a sworn share of tea, furs, and warm tent-space.
- **The Retribution of the Stiffed Guide:** Arrogant outlander factors, greedy merchant-captains, or harsh caravan masters who **withhold the mid-col payment, cheat the tally weight, beat a guide, or force them to march outside the warm perimeter** rarely survive to boast of it. The guide smiles, bows in the courtly Xanadui fashion, and claims to know a *"sheltered shortcut tube"* or a *"sixth hidden hot-spring vale just around the spur"*—leading the caravan straight into one of two classic death-traps before vanishing through a hidden crack-chimney in the night.

---

### 4.2 Trap Type 1 — The Dead-End Frozen Vales (*Wādī al-Kafan* / The Shroud Box-Canyons)
> *"lead caravaneers to dead end frozen vales... where they abandon them to their demise"*

- **Geomorphology & Barometric Cold-Trap Physics:**
  - Carved into the shaded, non-volcanic fault blocks on the outer flanks of the Twins are deep, U-shaped **glaciated box-canyons (*cirque cul-de-sacs*)** walled in by sheer `500–900 m` vertical cliffs of polished columned titanium-basalt and overhanging blue glacier snouts.
  - Each box vale has a **deceptively wide, gentle entrance** enhanced by a tiny, lukewarm iron-seep (`+12 °C`) right at the mouth—convincing the greedy caravan master that they are entering a prime geothermal oasis.
  - However, `4 km` inside, the canyon floor rises across a **reverse-sloped terminal moraine lip (`35 m` high)** into a sealed, zero-heat **katabatic cold-air sink basin**. Two hours after sunset, dense `-30 to -36 °C` air draining off the `5,800–6,480 m` summit ice fields pours over the headwall like liquid nitrogen and pools behind the moraine dam (`cold-air lake` / thermal inversion of `18 °C` over `50 m` vertical), while drifting snow and rime-fog blot out the stars and bury the entrance tracks.
- **The Two Infamous Frozen Box-Vales on `5.1`:**
  1. ***Wādī al-Kafan al-Shamalī* — The Valley of the Iron Shroud (NW Flank Trap F1, `px 968, 1442`, `+4,720 m`, `EF/ET`):**
     - Branches north off **Open Sprint 1** on Route A (`(978, 1468)`). A `6 km`-long, curved glacial trough beneath the shadowy north-west face of the NW Twin. Once the caravan camps inside the moraine bowl expecting a warm spring around the bend, the guide waits for the `20:00` katabatic whiteout, climbs a concealed iron-runged **fissure chimney (*The Guide's Needle*, `0.7 m` wide)** in the eastern cliff wall that exits back onto Route A, and pulls up the rope ladder. By dawn, the basin floor hits **`-34 °C`**; frozen pack-mules and rimed wagon frames of forty past betrayals litter the blue-ice floor.
  2. ***Šiʿb al-Zamharīr* — The Gulch of Bitter Frost (SE Flank Trap F2, `px 1068, 1528`, `+4,580 m`, `EF/ET`):**
     - Branches southeast off **Route B** between Oasis 1 and Oasis 4 under the iced shadow of the SE Twin `(1042, 1498)`. A narrow, flat-floored periglacial box canyon ending at a `700 m` vertical amphitheatre of hanging seracs (`core/water` ice). The guide triggers a minor snow-slab slide across the `12 m`-wide entrance throat with a single horn-blast from the cliff-top goat-track above, sealing the caravan in a dead-end freezer.

---

### 4.3 Trap Type 2 — The Active Lava-Pool Traps (*Bi'r al-Naḥs* / Decoy Pyroducts & Degassing Sump Pits)
> *"or active lava pools where they abandon them to their demise...."*

- **Volcanological Mechanism (Decoy Tubes, Thin Blister Crusts & CO₂/SO₂ Sumps):**
  - Unlike the ancient, drained master tubes of Route A (`tube_xanadu_nw_09`), the lower flanks of the **NW Twin `(988, 1458)`** and **Inter-Twin Fissure Vent NW `(1007, 1472)`** also host **active, partially crusted-over pyroducts and degassing lava-sump pits**.
  - At the portal, a decoy tube looks identical to a safe Route A shelter—warm air (`+22 °C`) wafts out into the freezing gale, inviting exhausted, frostbitten travellers inside.
  - `600–1,200 m` down the gentle downgrade, the tube roof drops and opens into a **blind collapse amphitheatre or subterranean sump chamber** occupied by a slowly churning **`1,150 °C` basaltic-andesite lava pond** roofed around its margins by a **paper-thin (`3–8 cm`), cooled silvery-black *pāhoehoe* blister crust** dust-coated with windblown ash so it looks like solid rock floor, while dense, invisible **carbon dioxide ($\text{CO}_2$) and sulfur dioxide ($\text{SO}_2$) gas** pools in the lower depression.
- **The Two Infamous Active Lava-Pool Traps on `5.1`:**
  1. ***Al-Jubb al-Aḥmar* — The Red Cistern / The False Tube of the Elder Horn (NW Twin Flank Trap L1, `px 992, 1465`, `+4,890 m`):**
     - Located `1.8 km` east of **Open Sprint 1** on the southern apron of the NW Twin `(988, 1458)`. The entrance is a wide, inviting basalt arch carved with counterfeit caravan tally-marks. Inside, the floor slopes at `6°` down toward a `90 m`-wide subterranean **degassing lava sump pond** fed by a lateral siphon from the NW Twin's conduit.
     - **How the Trap Works:** The mistreated guide leads the caravan in during a howling dusk blizzard, claiming it is the entrance to *The Horn-Underpass* (Tube A2). At a fork `400 m` inside, the guide steps onto an elevated lateral basalt bench (`+4 m` above the floor) to *"check the torch-draft ahead,"* while directing the heavy pack-train and drivers straight down the main ash-dusted ramp onto the **hollow lava-blister crust** over the active pond—or drops a counterweighted basalt portcullis slab across the upper throat while the caravan chokes in the rising `SO₂ / CO₂` gas plume and radiant `1,150 °C` heat.
  2. ***Bi'r al-Kibrīt al-Muštamil* — The Boiling Crucible Hollow (Inter-Twin Fissure Trap L2, `px 1035, 1493`, `+4,760 m`):**
     - Located between **Fissure Vent SE `(1024, 1485)`** and the **SE Twin `(1042, 1498)`** just off Route B. In a night fog or whiteout, its steaming rim looks identical to the warm soaking basin of **Oasis 4 (*Brimstone-Tarn*)**. In reality, it is a steep-walled funnel crater (`140 m` wide) where a subglacial melt-stream from the SE Twin's ice cap (`tube_xanadu_se_10` upper branch) drips onto an **open, spattering `1,120 °C` lava lake** surrounded by collapsing overhang ledges and superheated acid-steam jets (`KHAZ`). Guides who have been stiffed at Oasis 3 lead their marks to the overhanging north lip in the fog, step sideways through a notched obsidian dike, and leave the caravan pinned between a collapsing lava-lake cornice in front and a sheer ice-glaze chute behind.

---

## 5. Flora, Fauna & Micro-Ecology

The ecology of `biomes/twins/` is a stark study in **extreme microclimatic edge-effects (`KMASK.distance` from thermal vents and tube mouths)**:

```
         MICROCLIMATIC ZONATION AROUND A TWINS GEOTHERMAL OASIS (300–900 m DIAMETER)

   Zone 1: Vent Throat        Zone 2: Sinter Apron &       Zone 3: Warm-Soil Shrub     Zone 4: Periglacial Collar   Zone 5: The Frozen Range
   & Boiling Runoff           Thermophilic Meadow          & Dwarf-Hearth Ring         & Tube-Mouth Rim             (95% of Polygon Area)
   (55–88 °C Water)           (+15 to +22 °C Ground)       (+8 to +15 °C Ground)       (0 to +6 °C Ground)          (-5 to -28 °C Ambient)
  ═══════════════════        ═══════════════════════      ═══════════════════════     ═══════════════════════      ════════════════════════
  • Opaline/travertine       • Lush carpets of            • Stunted 1.5–3 m           • Dense hemispheric          • Barren black Ti-basalt,
    sinter lips                *bobby-sock* sedges          *pocket-hearth* shrubs      *cinder-cushion* domes       obsidian scree, rime
  • Orange, gold & black       (white silica root-cuffs)    (black night-radiators)   • Xanadu snow-lotus &          feathers & blue glacier
    cyanobacterial mats      • Emerald thermal moss       • Wind-twisted 2–4 m          *fumarole-ferns* in          ice (`EF / HT`)
    (`geyser` puna palette)  • *Brimstone-cup* chalices     dwarf Xanadu agate-pine     warm rock cracks           • Zero vascular plants
```

### 5.1 The Five Geothermal Oases & Warm Runoff Channels (Read-in-Place + Endemic Variants)
1. **Dwarf *Pocket-Hearth* Shrubs (*Caloridendron nanum-geminum*, `biomes/hearths` / `biomes/godshearth` kin):**
   - Unlike the `35 m` climax giants of neighboring **Godshearth**, the Twins' five oases are too small, windy, and shallow-rooted for tall trees. Here the Hearth lineage grows as **gnarled, multi-stemmed `1.5 to 3.2 m` shrubs** with copper-ribbed heat-pipe stems that pump `50–75 °C` spring water and unfold overlapping `1.2 m` **velvet-black radiator parasols** at night. Caravaneers pitch their felt tents directly underneath these warm black canopies (`+12 to +16 °C` underneath when the pass outside is `-20 °C`).
2. **Dwarf Xanadu Agate-Pine Krummholz (*Pinus agatoides var. pygmaea*, `biomes/xanadu` `ranges` kin):**
   - On the slightly drier warm-soil margins of Oasis 1 (*Sinter-Gate*) and Oasis 5 (*Catch-Lookout*), the banded agate-bark conifer of Xanadu's high ranges (`biomes/xanadu/PLAN-STATIONS.md` §Station 3) grows as wind-flagged, flat-topped krummholz (`2–4 m` tall) whose resinous needles perfume the steam.
3. ***Bobby-Sock* Thermal Sedges, Emerald Steam-Moss & Cyanobacterial Sinter Mats (`biomes/geyser` `puna` kin):**
   - Along the `30–55 °C` runoff rills, dense turf of silica-cuffed *bobby-sock* sedges provides vital night-grazing for caravan mules and yaks, bordered by orange, ochre, and black thermophilic cyanobacterial crusts (`biomes/geyser` Station 2 `puna`) on the hotter `55–85 °C` sinter lips.

### 5.2 The Lava-Tube Portals & Subterranean Galleries (`Route A`)
1. **Skylight Rim Flora (*Fumarole-Ferns* & *Steam-Cushions*):**
   - Where warm, humid `+12 to +16 °C` air vents upward out of the collapsed lava-tube skylights along Route A, a `5–15 m` collar of bright green *fumarole-ferns*, pendant icicle-mosses, and hemispherical *cinder-cushions* clings to the basalt overhang like a green wreath in the middle of black snow-scree.
2. **Cave-Mouth Bioluminescent & Sulfide Lichens (*Chrysothrix vulkanus*):**
   - Inside the twilight zone (`0–80 m` from portals and skylights) and along warm sulfur-weeping roof cracks in `tube_xanadu_nw_09`, crusts of **reflective golden-amber and pale blue-green chemolithotrophic lichens** oxidize hydrogen sulfide ($\text{H}_2\text{S}$) and glow softly against the dark basalt when struck by lantern light—used by Xanadui guides to tell live gas-weeping tubes (Trap L1) from safe, sweet-aired extinct tubes (Route A).

### 5.3 Fauna & Caravan Life
- **Pack-Beasts & Working Animals:** Heavily woolled **Xanadui Cloud-Yaks** and iron-shod **Strongbow Basalt-Mules** (trained to step over lava-tube floor cracks and wear leather alkali-goggles on the Catch descent).
- **Native Oasis & Tube Fauna:**
  - ***Cinder-Vipers* (*Vipera fumarola*):** Small, rust-and-obsidian patterned pit-vipers that coil on `35 °C` warm basalt slabs around the Five Steaming Stones and inside decoy tube mouths; guides check under every sleeping-felt with a brass hook.
  - ***Pyroduct Swifts & Cave-Crickets*:** Roost by the thousands in the warm vaulted ceilings of `tube_xanadu_nw_09`, pouring out of the skylights at midday to hawk insects blown upslope from Xanadu.
  - ***Fissure-Ibex* (*Capra qaranayn*):** Sure-footed mountain caprids with spiraled, ridged horns (after which the Twins are named) that leap across the `3 m` lava-tube skylights and lick borate salts at Oasis 4.

---

## 6. Six Showcase Stations (`biomes/twins/` — `px, py`, Elevations, Climate, & Set-Pieces)

Following the multi-station architecture of `throne`, `korona`, `xanadu`, and `geyser` (`python3 build.py --station <name>`), `biomes/twins/` defines **6 showcase stations** covering every facet of the owner's brief:

| # | Station ID | Station Title | `5.1` `px, py` | Reshaped Elev & Pressure | Climate (`5.1`) | Primary Visual & Gameplay Set-Pieces |
| :-: | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | `pyroduct` *(Default Showcase)* | **The First Breath: Extinct Lava-Tube Skylight & Scree Sprint (Route A)** | **`980, 1467`** | `+4,240 m`<br>(`0.94 atm`) | `ET`<br>(`-4 °C` outside / **`+13 °C`** inside tube) | **Route A in action:** The collapsed skylight portal of `tube_xanadu_nw_09` (*Segment A1 -> Open Sprint 1 -> Segment A2*). Half the scene is inside the warm, `18 m`-wide arched basalt pyroduct (solidified curb-ledges, glazed *lavacicles*, golden cave-lichens, a resting caravan); the other half climbs out the skylight ramp into a howling, rime-feathered obsidian scree sprint toward the next portal `3.5 km` away under the smoking cone of the NW Twin `(988, 1458)`. |
| **2** | `brazier` | **The Brazier (*Al-Miǧmarah*): High-Col Geothermal Temperature Oasis (Route B)** | **`1016, 1479`** | `+4,680 m`<br>(`0.89 atm`) | `ET / EF` edge<br>(`-7 °C` ambient / **`+14 °C`** oasis) | **Route B in action:** Oasis 3 on the inter-Twin saddle between Fissure Vents `(1007, 1472)` and `(1024, 1485)`. Not quite Yellowstonian, but a vivid `600 m` island of life in the snow: low `2 m` steaming sinter cones, orange/black cyanobacterial mats (`geyser` `puna`), *bobby-sock* sedge meadows, `2.5 m` *pocket-hearth* shrubs unfolding black nocturnal radiator parasols over caravan tents, and the **Shrine of the Split Horn** where guides collect their second coin. |
| **3** | `lavasump` | **The Red Cistern (*Al-Jubb al-Aḥmar*): The Guide's Active Lava-Pool Trap** | **`992, 1465`** | `+4,890 m`<br>(`0.87 atm`) | `ET / HT`<br>(Volcanic Hotspot) | **The Active Lava-Pool Trap (Trap L1) on the NW Twin's flank:** A decoy lava tube whose ash-dusted downgrade opens suddenly into a subterranean collapse amphitheatre holding a churning **`1,150 °C` degassing basaltic-andesite lava lake**. Showcases paper-thin silvery *pāhoehoe* blister crusts cracking red underfoot (`KHAZ`), shimmering `SO₂/CO₂` gas layers, abandoned merchant strongboxes on the rim, and the high narrow basalt ledge by which the stiffed Xanadui guide slips away. |
| **4** | `shroudvale` | **Valley of the Iron Shroud (*Wādī al-Kafan*): The Dead-End Frozen Box Vale** | **`968, 1442`** | `+4,720 m`<br>(`0.88 atm`) | `EF / ET`<br>(`-8 °C` day / **`-34 °C`** night sink) | **The Frozen Cul-de-Sac Trap (Trap F1):** A claustrophobic glacial box-canyon ringed by `700 m` sheer columns of blue-black titanium-basalt and overhanging serac ice. A tiny, deceptive warm seep at the outer lip gives way behind a `35 m` reverse moraine dam to a lethal `-34 °C` katabatic cold-air sink filled with rime-encrusted wreckages of betrayed caravans, while the guide's secret crack-chimney (*The Guide's Needle*) climbs the eastern cliff. |
| **5** | `erebustwin` | **The Rime Twin (*Al-Qaran al-Ṣaghīr*): Erebus Ice Towers & Subglacial Tube 10** | **`1042, 1498`** | `+5,420–5,880 m`<br>(`0.77–0.81 atm`) | `EF`<br>(`-18 °C` summit glacier) | **Cross-kit anchor with `biomes/geyser` Station 5 (`--station ice`):** The glaciated upper flanks of the SE Twin volcano `(1042, 1498)` and the upper mouth of `tube_xanadu_se_10`. Towering `6–12 m` hollow **Mount Erebus fumarolic ice chimneys** venting volcanic steam into sub-zero sky, blue-lit subglacial steam caves melted into the glacier sole, and boiling `86 °C` snow-slush cauldrons. |
| **6** | `catchlookout` | **Catch-Lookout Spring (*Manẓar al-Maṣīd*): The NE Oasis Above Stair** | **`1056, 1462`** | `+3,690 m`<br>(`1.01 atm`) | `BSk / ET`<br>(`+2 °C` ambient / **`+17 °C`** oasis) | **The NE Gateway between Twins and The Catch:** Oasis 5 perched on a faulted titanium-basalt cliff bench with a sweeping vista northeast across the yellow alkali pans and star dunes of **The Catch** (`biomes/catch`) toward **Stair** `(1106, 1442)`. Stepped alkaline travertine soaking pools (`70 °C`), wind-flagged dwarf Xanadu agate-pines, and outbound Yuni/Xanadui caravans strapping on alkali-dust goggles for the desert descent. |

---

## 7. Scale Model `5.1` Implementation Blueprint (For Next `build_425_master.py` Pass)

When the owner approves applying the `"twins"` (`rmw536m06wlyf`) sculpting pass to `tools/scale-model/build_425_master.py`, the exact terrain and climate rules are:

### 7.1 Signed-Distance Ridge, Saddle & Corridor Sculpting (`rmw536m06wlyf`)
1. **Polygon Mask (`mask_twins`):** Rasterize `id: "rmw536m06wlyf"` (`12,159 px`) and compute Euclidean inner distance `d_in` (`0` at boundary, up to `~28 px` at the range core).
2. **Base Range Spine & Flank Ramp (`+3,200 m` to `+5,400 m`):**
   - Replace the uncarved `7,665 m` Godthrone shield ramp inside `mask_twins` (blended over a `6 px` boundary feather into `xanadu`, `the catch`, `oidong`, and `godthrone`) with a structured **NW–SE volcanic cordillera spine**:
     - **SW & NE Flank Aprons (`d_in = 0..8 px`):** Grade smoothly from the boundary (`+2,690–3,400 m` on the Xanadu and Catch sides) up to `+4,200 m`.
     - **High Range Ridge (`d_in > 8 px` outside the pass corridor):** `+4,800 to +5,600 m` (`ET / EF`), with two overdeepened glacial box-canyon troughs carved at **Trap F1 `(968, 1442)`** (`+4,720 m` floor surrounded by `+5,450 m` walls) and **Trap F2 `(1068, 1528)`** (`+4,580 m` floor surrounded by `+5,300 m` walls).
3. **The Inter-Twin Caravan Saddle & Route Corridors (`+3,690 m` to `+4,680 m`):**
   - Carve a `5 px`-wide (`10 km`) **SW–NE Pass Saddle** across the centre of the range (`(996, 1504) -> (1016, 1479) -> (1056, 1462)`), bringing the **Col of the Two Horns** down to **`+4,300 – +4,680 m`** (`ET`, `0.89–0.93 atm`) and grading the approaches down to **`+3,780 m`** at Oasis 1 `(996, 1504)` and **`+3,690 m`** at Oasis 5 `(1056, 1462)`.
4. **The Two Twin Cones & Two Inter-Twin Fissure Vents (`D['vents']`):**
   - **Under Option A (Recommended — True "Small Active Volcanoes"):**
     - Superimpose two crisp Gaussian/conical stratovolcano edifices (`r = 5.5 px` = `11 km`) at **NW Twin `(988, 1458)`** (`peak = +6,480 m`, `floor = +5,980 m` crater) and **SE Twin `(1042, 1498)`** (`peak = +5,880 m`, `floor = +5,420 m` crater), plus two `r = 1.6 px` spatter/maar cones at **`(1007, 1472)`** (`peak = +4,840 m`, `floor = +4,680 m`) and **`(1024, 1485)`** (`peak = +4,610 m`, `floor = +4,460 m`), and update their four `D['vents']` `floor`/`peak` values to match so Step 7I passes cleanly.
   - **Under Option B (Preserve Legacy `9.3–12.2 km` Vent Heights):**
     - Apply a `r <= 5.5 px` Gaussian pinnacle-preservation mask around the four vent centres so their `6 px` neighbourhoods retain `12,180 m`, `9,340 m`, `9,493 m`, and `7,535 m` while the caravan saddle (`>= 6 px` away from the main cones) drops to `+4,300–4,680 m`.

### 7.2 Target Climate Distribution After Sculpting (`rmw536m06wlyf`, `48,636 km²`)

| Climate Class | Current `5.1` % (`km²`) | Reshaped Target % (`km²`, Opt A) | Physical Whereabouts in `"twins"` |
| :--- | :---: | :---: | :--- |
| **`ET` (Alpine Tundra & High Pass Col)** | `7.9%` (`3,856 km²`) | **`46.0%` (`~22,370 km²`)** | The `+4,100–5,000 m` inter-Twin caravan saddle, the open-air tube sprints (*The Three Breaths*), and the mid-flank periglacial scree slopes. |
| **`EF` (Glacial Ice Cap & Frozen Box Vales)** | `26.1%` (`12,696 km²`) | **`28.0%` (`~13,620 km²`)** | The `+5,000–6,480 m` upper cones of the Twins (including the Erebus ice-tower glacier on SE Twin `1042, 1498`) and the dead-end frozen box vales (`Trap F1`, `Trap F2`). |
| **`Dsc / Dsb` (Subalpine Approach & Lower Oases)** | `3.2%` (`1,560 km²`) | **`16.5%` (`~8,025 km²`)** | The `+3,100–4,100 m` SW Xanadu / Strongbow foreland, the Alph headwater portal `(938, 1496)`, and the warm-boosted pixels of the **Five Steaming Stones**. |
| **`BSk / BWk` (Arid Catch-Side Fan Toes)** | `0.9%` (`440 km²`) | **`6.5%` (`~3,160 km²`)** | The `+2,700–3,800 m` rain-shadowed NE descent benches facing **The Catch** and **Stair** `(1106, 1442)`. |
| **`HT / HF / O` (Hypobaric Summit Rims)** | `61.9%` (`30,100 km²`) | **`3.0%` (`~1,460 km²`)** | Restricted strictly to the smoking `> 6,000 m` summit crater rims of the NW Twin `(988, 1458)` (`0%` airless `Class O` under Option A). |
