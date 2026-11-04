# The Siphon Pits & Ostrukh Terraces of Region 98 (Plan)

> **Coordinate Frame:** All `px, py` (`X, Y`) coordinates in this document and in `biomes/siphon-pits/*/station.json` are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.

The owner's polygon `Region 98` (2026-10-27; `regions` doc `rmvra9zogfm9t`; kind: `biome`; color `#6fb5a8`) on the Krator Scale Model: a vast regional biome in the far south-east ($626\text{ km} \times 482\text{ km}$, $\sim 174,756\text{ km}^2$), lying immediately east of the towering Stalker Peaks (`rmvkknh1am4fw`) and south-east of Hub 01.

**Owner's briefs** (2026-10-27):
1. An alien biome not found on Earth, consistent with Krator's planetary physics (gravity $7.4\text{ m/s}^2$, dense air $1.6\text{ atm}$ at datum, scale height $\sim 8\text{ km}$, heat-pipe volcanism, tidal flexure from the gas giant, no plate tectonics).
2. Native fauna strictly **vertebrate-grade hexapods, NOT insects**.
3. Direct evolutionary descent from the native **Siphon tree** lineage of `biomes/throne` (`key: 'siphon'`), where solitary trees root in hot lava-tube skylights.
4. Combined geological sequence: **Phreatomagmatic Maar-Diatreme Explosions** (steam flash-detonations through permafrost) and **Tectonic Magma-Withdrawal Pit-Crater Chains** (tidal drainage of magma chambers causing vertical ring-fault collapse).
5. **Stations & Regional Split**: Implement stations such that the **Siphon Pits** occupy the **south-east** of Region 98, while the **north-west** portion is sculpted into a **warmer, cold-but-arable piedmont basin**.

---

## 1. Regional Geography & Survey (Scale Model 5.1)

One pixel on the Krator Scale Model is $2\text{ km}$ ($4\text{ km}^2/\text{px}$).

| Metric | Model Coordinate / Value | Physical Equivalent |
|---|---|---|
| **Doc ID** | `rmvra9zogfm9t` | Region 98 |
| **Bounding Box** | $X \in [1456, 1769]$, $Y \in [1387, 1628]$ | $626\text{ km}$ wide $\times 482\text{ km}$ tall |
| **Centroid** | $(1617.8, 1493.6)\text{ px}$ | $+905.6\text{ km}$ East, $+1227.2\text{ km}$ South of datum $[1165, 880]$ |
| **Polygon Area** | $43,689\text{ px}^2$ | **$\sim 174,756\text{ km}^2$** ($\sim 1.38\times$ The Catch) |
| **NW Arable Sector** | $X \in [1456, 1557]$, $Y \in [1387, 1485]$ | $\sim 39,000\text{ km}^2$ (cool-temperate piedmont basin) |
| **SE Siphon Sector** | $X \in [1582, 1769]$, $Y \in [1470, 1628]$ | $\sim 115,000\text{ km}^2$ (frozen plateau & maar-pit swarm) |

```
                        REGION 98: NW-TO-SE TERRAIN PROFILE
  
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

---

## 2. Proposed Scale Model Terrain Adjustments

To physically deliver the owner's brief, three targeted terrain edits are proposed for the Scale Model pipeline (`tools/scale-model/`):

1. **The NW Piedmont Graben Carve ($X \in [1456, 1557], Y \in [1387, 1485]$):**
   * Carve a down-dropped tectonic half-graben stepping down from the default $+4,200\text{ m}$ rim down to **$+1,950\text{ to }+2,300\text{ m}$**.
   * **The Physical Mechanism:** The $2,000\text{ m}$ elevation reduction increases atmospheric pressure to **$1.28\text{--}1.35\text{ atm}$**. By Krator's lapse rate ($5.5^\circ\text{C}/\text{km}$), mean annual temperature rises by $+11^\circ\text{C}$ to **$+3.5^\circ\text{C}\text{ to }+5.0^\circ\text{C}$** (Summer $+16.5^\circ\text{C}$), transforming the NW from Arctic tundra into a fertile **Dfb / Cfb arable highland** (Station 1).
   * **Hydrology:** Author braided meltwater stream channels carrying glacial discharge and mineral-rich volcanic silt from the eastern canyons of the Stalker Peaks across the terraces.
2. **The Central Fault Escarpment ($[1532, 1505]\text{ to }[1582, 1387]$):**
   * A $1,500\text{--}1,800\text{ m}$ stepped columnar basalt cliff separating the warm NW lowlands from the high SE plateau.
   * A scree-ramp caravan notch at $[1559, 1457]$ ($+3,289\text{ m}$) hosting the Scarp Pass (Station 2).
3. **The SE High Plateau & Maar Swarm ($X \in [1582, 1769], Y \in [1470, 1628]$):**
   * Plateau surface remains elevated at **$+4,200\text{ to }+4,500\text{ m}$** (freezing subpolar plateau, $-5.0^\circ\text{C}$ mean, katabatic blizzards).
   * Carve $35\text{--}50$ circular/elliptical negative crater stamps ($D = 2.5\text{--}5\text{ km}$, deep maar pit floors down to $+2,277\text{ m}$ with $420\text{ m}$ inner crater benches) along the volcanic fissure corridor.
   * Preserve $5\text{--}10\text{ m}$ wide knife-edge basalt bridges (The Arête Way, Station 4 at $[1678, 1542]$, $+4,269\text{ m}$) between overlapping stamps, while their floors host the warm geothermal groves (Station 3 at $[1687, 1555]$, $+2,277\text{ m}$).

---

## 3. The 4 Stations

### Station 1: Ostrukh Terraces (The Cold Arable Basin — NW)
* **Metadata:** `stations/terraces/station.json` (`px: 1519, 1453`, elev $+2,156\text{ m}$, $1.31\text{ atm}$, mean $+15.0^\circ\text{C}$, rain $439\text{ mm}$, Cwb).
* **Landscape:** Fertile loess terraces stepping down to braided meltwater streams fed by Stalker glaciers; dry-stone retaining walls, sod-roofed basalt farmhouses, communal grain elevators.
* **Agriculture & Ecology:** Highland frost-barley, frost-wheat, cold-hardy black tubers (`kits/crops` `terrace` zone); domesticated Ghaunt-Ox pairs pulling stone seed-drills.
* **Role:** The agricultural breadbasket of the south-east, feeding the mining and wax-harvesting camps of the higher zones.

### Station 2: The Scarp Pass (The Central Dividing Fault)
* **Metadata:** `stations/scarp/station.json` (`px: 1559, 1457`, elev $+3,289\text{ m}$, $1.13\text{ atm}$, mean $+4.0^\circ\text{C}$, rain $173\text{ mm}$, Dsc).
* **Landscape:** Sheer hexagonal basalt columns rising $1,600\text{ m}$; switchback road cut into jointed rock; permafrost stone nets and frost circles (`42-core-frost.js`).
* **Settlement & Transit:** Fortified stone tollhouse and caravansary sheltered under a basalt overhang; iron beacon baskets and windbreaks; freight exchange for pack beasts.

### Station 3: Siphon Maar Floor (The Sunken Geothermal Sink — SE)
* **Metadata:** `stations/pitfloor/station.json` (`px: 1687, 1555`, floor elev $+2,277\text{ m}$, rim $+4,269\text{ m}$, total relief $1,992\text{ m}$, $1.29\text{ atm}$, mean $+18.0^\circ\text{C}$, rain $439\text{ mm}$, Cfa-thermal).
* **Landscape:** Circular flat basin floor completely enclosed by vertical columnar basalt cliffs; boiling diatreme vents, mud pots, and subterranean lava tube portals.
* **Inversion Trap:** Amber inversion fog deck sealed at $+2,580\text{ m}$ ($303\text{ m}$ above the floor); dead-calm $+18.0^\circ\text{C}$ microclimate.
* **Ecology:** Communal groves of **Woolly Siphon trees** (`woolly_siphon`, $20\text{--}30\text{ m}$ tall), venting steam through flared lips and wrapped in $15\text{ cm}$ lanolin-wax pelts; springy **Siphon-Felt turf** (`siphon_felt` / `kground`); bulbous **Suture-Galls**; burrowing **Basalt Pipe-Borers**.
* **Human Presence:** Roper base camp (*Pit-Head 04*): canvas huts, copper rendering kettles melting raw machine-wax into ingots.

### Station 4: The Arête Way (The Knife-Edge Bridges — SE Rim)
* **Metadata:** `stations/arete/station.json` (`px: 1678, 1542`, elev $+4,269\text{ m}$, $0.99\text{ atm}$, mean $-5.0^\circ\text{C}$, rain $173\text{ mm}$, wind $35\text{ m/s}$, ET).
* **Landscape:** A terrifying $5\text{ to }8\text{ m}$ wide basalt knife-edge ridge between two coalescing $420\text{ m}$ deep pits; shattered phreatic explosion breccia; black rime ice.
* **Hazard & Ecology:** Ambush lairs of the **Flenser-Hound** (`flenser_hound`), crouching along the fog rim in blizzards to strike crossing caravans.
* **Human Infrastructure:** The Arête Way caravan trail with iron guide stanchions and safety chains; heavy rim windlass gantries lowering ropers into the abyss.

---

## 4. Ecology & Organism Specifications

### Xenobota
* **Woolly Siphon (*Siphonostoma velosum*):** Divergent offshoot of `biomes/throne`'s volcanic `siphon`. Features a hollow chimney trunk that vents boiling subterranean gases, covered in a shaggy hydrocarbon fleece (**Machine-Wax**) that insulates against downdrafts and acidic condensate.
* **Siphon-Felt Turf (`siphon_felt`):** Spongy xenophytic groundcover carpet on the pit floors.
* **Suture-Galls (`suture_gall`):** Fleshy, wax-storing bulbs growing on damp basalt column fractures.

### Native Fauna (Strictly Vertebrate-Grade Hexapods — NO Insects)
* **Woolly Ghaunt-Ox (*Ovisaphon borealis*):** $1,800\text{ kg}$ 6-limbed herbivore. Crampon forelimbs for talus climbing; columnar mid-limbs; powerful hind jumping levers. Domesticated in the NW terraces (Station 1); wild herds graze the scarp corridors and pit floors.
* **Flenser-Hound (*Scyllatherium fissum*):** Cursorial apex predator with tripartite limbs: 2 folding raptorial scythe-arms for silent neck strikes, 2 lateral arête-claspers for gripping rock in gale winds, 2 sprinting hind legs. Lurks along the Arête Way (Station 4).
* **Basalt Pipe-Borer (*Chthonomys perforans*):** Burrowing hexapod tunneling through diatreme breccia and lava tubes, dispersing siphon seeds.

---

## 5. Technical Engine Architecture & Graphics Budget

1. **Materials & Textures:**
   * Reuses: `ground.turf.alpine`, `ground.soil.volcanic`, `stone.basalt.columnar`, `card.clubmoss`, `core/crops`.
   * New slots: `woolly_siphon` (flared chimney trunk + fleece normal/roughness), `siphon_felt` (fibrous turf groundcover), `machine_wax` (amber lubricant ingot).
2. **Terrain Procedural Pipeline (`core/terrain`):**
   * Graben carve: Negative step brush in `30-core-field.js` across NW sector.
   * Negative pit stamps: `KBASIN` negative stamp array with vertical scarp clamp across SE sector.
   * Frost pass: `42-core-frost.js` applied to Station 2 & 4 plateau surfaces.
3. **Atmospheric Shaders (`core/atmos` & `core/sky`):**
   * Station 1: Crisp sub-alpine sky with warm directional sun and thin mountain haze.
   * Station 2 & 4: Frigid polar blizzard with horizontal snow particle emitter.
   * Station 3: Height-bounded volumetric amber fog plane ($Y \in [Y_{\text{floor}}, Y_{\text{floor}} + 150\text{ m}]$), $100\%$ visibility cutoff at $25\text{ m}$.
4. **Performance Targets (`GRAPHIC-LOAD.md`):**
   * Geometry welding (`BIO.INDEX_ITEMS = true`) on all siphon chimneys and fleece meshes.
   * MultiMesh instance budgets: Station 3 floor capped at 250 active trees per chunk; zero trees on Stations 2 and 4.

## Crystal caves (planned, 2026-11-03)

The basalt plateau's flows hold amethyst geodes, the maars' hot water the silica that fills them: one or two walk-in geodes on the pit rims (a `KCAVERN` hall 2-5 m across, `KSPELEO.AMETHYST`). See `biomes/CRYSTAL-CAVES-5.1.md`, site 3.
