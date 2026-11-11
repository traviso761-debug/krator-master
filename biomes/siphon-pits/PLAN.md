# The Siphon Pits & Ostrukh Terraces of Region 98 (Plan)

> **Coordinate Frame:** All `px, py` (`X, Y`) coordinates in this document and in `biomes/siphon-pits/*/station.json` are on the **Scale Model `5.1` (`1821 × 1723`, `2 km/px`)** canvas.

The owner's polygon `Region 98` (2026-10-27; `regions` doc `rmvra9zogfm9t`; kind: `biome`; color `#6fb5a8`) on the Krator Scale Model: a vast regional biome in the far south-east ($626\text{ km} \times 482\text{ km}$, $\sim 174,756\text{ km}^2$), lying immediately east of the towering Stalker Peaks (`rmvkknh1am4fw`) and south-east of Hub 01.

**Owner's briefs** (2026-10-27):
1. An alien biome not found on Earth, consistent with Krator's planetary physics (gravity $7.4\text{ m/s}^2$, dense air $1.6\text{ atm}$ at datum, scale height $8\text{ km}$ in the model's air law $p = 1.6\,e^{-h/8000}$ atm, heat-pipe volcanism, tidal flexure from the gas giant, no plate tectonics). *(Checked 2026-11-11: section 0.)*
2. Native fauna strictly **vertebrate-grade hexapods, NOT insects**.
3. Direct evolutionary descent from the native **Siphon tree** lineage of `biomes/throne` (`key: 'siphon'`), where solitary trees root in hot lava-tube skylights.
4. Combined geological sequence: **Phreatomagmatic Maar-Diatreme Explosions** (steam flash-detonations through permafrost) and **Tectonic Magma-Withdrawal Pit-Crater Chains** (tidal drainage of magma chambers causing vertical ring-fault collapse).
5. **Stations & Regional Split**: Implement stations such that the **Siphon Pits** occupy the **south-east** of Region 98, while the **north-west** portion is sculpted into a **warmer, cold-but-arable piedmont basin**.

---

## 0. The survey, and what it corrected (2026-11-11)

Read from scale model 5.1 (`tools/scale-model/model/data` through `smodel/page.py`, as `biomes/highrift` and
`biomes/copperglacier` surveyed theirs): heights from `h` (16 bits over [-2,600, 27,000] m), temperatures from `tm`, `tw`,
`tc`, `th`, `tl` (byte minus 90), rain from `p` (byte / 255 x 4,000 mm), class from `c`, wind from `wd` (G channel x 25 / 255
m/s), vents from `vents`. Pressure is the model's air law, **1.6 x e^(-h / 8,000) atm** (`survey_biomes.py`, the clifflung
plan). The regions collection (the polygon `rmvra9zogfm9t`) lives in the artifact's database, not in `model/data`: the
bounding box and the area are the plan's, not re-measured. The sampling is `survey_biomes.py`'s, run on the four points
(no script kept: the numbers are below).

| Station | px | h (m) | atm, law | atm, old plan | mean / warm / cold / high / low (degC) | rain | class | wind (m/s) |
|---|---|---|---|---|---|---|---|---|
| 1 Terraces | 1519, 1453 | 2,157 | **1.22** | 1.31 | 15 / 28 / 2 / 36 / -6 | 439 | Cwb | 7.4 |
| 2 Scarp | 1559, 1457 | 3,289 | **1.06** | 1.13 | 4 / 17 / -9 / 26 / -19 | 173 | Dsc | 7.3 |
| 3 Pit floor | 1687, 1555 | 2,277 | **1.20** | 1.29 | 18 / 32 / 6 / 40 / -2 | 439 | Cfa | 7.6 |
| 4 Arete | 1678, 1542 | 4,269 | **0.94** | 0.99 | -5 / 8 / -18 / 15 / -26 | 173 | ET | 7.4 |

Local relief round each point (min / median / max of the height cells on a ring, m): the pit floor 2,220 / 2,283 / 2,463
at 2 km, 2,205 / 2,681 / 4,091 at 8 km, 2,278 / 3,323 / 4,811 at 16 km; the Arete 4,031 / 4,172 / 4,904 at 2 km, 3,151 /
3,825 / 4,986 at 4 km; the Scarp 2,954 / 3,279 / 3,560 at 2 km, 2,139 / 3,174 / 4,236 at 8 km; the Terraces 2,133 / 2,157 /
2,167 at 2 km (a level floor). Sectors: NW p5 / p50 / p95 heights 1,941 / 2,451 / 6,388 m, mean temperature median +12, rain
median 235 mm, BSk > Dsc > Dsb > ET > Cwb; SE 2,483 / 4,642 / 6,969 m, median -4, 141 mm, ET > EF > Dsb.

**What changed, and why:**
- **Gravity, datum, scale height** agree with `biomes/WORLD.md` and the model: 7.4 m/s2 (0.75 g), 1.6 atm at datum, the
  law's 8 km. (An isothermal column at 0.75 g would have H = RT/Mg of 10-11 km, `biomes/throne/NOTES.md`; the kit follows
  the model's law, as every kit does.)
- **Every pressure was high.** The old figures fit no single scale height (1.31 at 2,156 m needs H = 10.8 km, 1.13 at 3,289 m
  needs 9.5 km). Corrected to the law: 1.22, 1.06, 1.20, 0.94. Station 3's "boosted by CO2 pooling" is dropped: a pure CO2
  layer 303 m deep adds rho x g x h = 0.75 kg/m3 x 7.4 x 303 = 1.7 kPa, **0.017 atm**, and would kill everything in it.
- **The warm and cold months** were invented (+20/+9, +11/-3, +25/+11, +2/-12); the model's are taken (table). The model's
  `tw`/`tc` read as the extreme months' daily highs and lows, so a Cwb station shows a warm figure of 28 (the class is the
  model's, as every 5.1 plan takes it).
- **The lapse rate.** The plan's 5.5 degC/km is neither the model's (6.5, `smodel/climate.py`) nor the dry adiabat (g/cp =
  7.4). Its NW-sector figures ("+3.5 to +5 mean, from -14") contradicted its own station record (+15) and the model (NW
  median +12): corrected to the model. Note for the owner: across the stations the model runs 9.5 degC/km (Terraces +15 at
  2,157 m to the Arete -5 at 4,269 m), steeper than the dry adiabat; the NW's warmth is the foehn's (the plan's own reason) and
  the sink's is the heat's, so it stands, but it is the model's call, not a column's.
- **The pit geometry.** Station 3 said "rim +4,269 m, relief 1,992 m" and also "a 420 m deep crater with 400 m walls": the
  +4,269 m is the Arete's height. The model holds a **sink**: low ground ~8 km across at ~2,200-2,500 m, its shoulders on the
  plateau 2 km higher 8-16 km out. Corrected: the maar of Station 3 is 420 m deep inside the sink (floor 2,277, rim 2,697),
  the fog lid at 2,580 under its rim; the Arete's two pits are 420 m deep in the plateau (floors ~3,850, the profile's
  "+3,800 m floor"), 32 km north-west of Station 3, not over it.
- **The fog.** Two lids were given (+150 m and +303 m): the station record's 303 m is kept. "100% visibility cut-off at 25
  m" becomes ~200 m on the floor (mist density 0.02 per m: Koschmieder's V = 3.912 / sigma), thickening to the lid.
- **The wind.** The model's mean wind is 7.3-7.6 m/s at all four stations; the Arete's 35 m/s (gusts 48) is the blizzard's,
  an event in the weather, not the mean. Kept as the blizzard: core/atmos's blizzard state at the station's wind.
- **Latitude.** The station records' `lat` (-28.2 to -30.4) did not match the shared sky's site frame (`ATMOS.siteAt`): the four
  stations lie at **50.3-52.7 degrees south**. Corrected; at their longitude the giant eclipses the sun at 11:00 on the sky's day 0,
  so the pages open at 14:00.
- **Vents.** The model has a geyser vent 3 px from Station 3 (1684, 1552; floor 2,203 m), and three more along the swarm
  (1668, 1539; 1618, 1576; 1712, 1482): the boiling vent well is that geyser. **No lava tube** of `DATA.tubes` reaches the
  region: the "lava tube portals" are kept only as the Pipe-Borer's burrows in the breccia.
- **Names that do not exist**, mapped to the real ones (section 6): `core/sky` (the shared sky is `core/atmos/sky`), the
  `kits/crops` `terrace` zone (the station queries `CROPS.at` on its axes), `core/crops` (`kits/crops`), "KBASIN negative
  stamps" (KBASIN is old lake beds: the pits are `KRELIEF.stepcut`), `ground.turf.alpine`, `ground.soil.volcanic`,
  `stone.basalt.columnar` (the library's sets are named in section 6).
- **The model already carries most of section 2's edits**: the NW basin lies at 1,900-2,450 m (5.1's south-east provinces
  pass, `smodel/se_provinces.py`, joins the Ostrukh Terraces to the Mid Basin) and the sink is there. Section 2 is out of
  this kit's scope: it is a to-do for the next scale model update (section 7, S9), and the kit carves its own ground.

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

*Out of the kit's scope (2026-11-11): a to-do for the next scale model update; the model already holds most of it (section 0).*

To physically deliver the owner's brief, three targeted terrain edits are proposed for the Scale Model pipeline (`tools/scale-model/`):

1. **The NW Piedmont Graben Carve ($X \in [1456, 1557], Y \in [1387, 1485]$):**
   * Carve a down-dropped tectonic half-graben stepping down from the default $+4,200\text{ m}$ rim down to **$+1,950\text{ to }+2,300\text{ m}$**.
   * **The Physical Mechanism:** The $2,000\text{ m}$ elevation reduction increases atmospheric pressure to **$1.20\text{--}1.25\text{ atm}$** (the model's air law at 2,300 and 1,950 m; the plan said 1.28-1.35). The model's lapse is $6.5^\circ\text{C}/\text{km}$ (`smodel/climate.py`; the plan said 5.5); Krator's dry adiabat is $g/c_p = 7.4^\circ\text{C}/\text{km}$. The model already holds the result: **$+15^\circ\text{C}$ mean** at Station 1 (warm month $+28$, cold month $+2$), the NW sector's median $+12$ (the plan's $+3.5\text{ to }+5.0$ contradicted its own station record); class **Cwb** at the station, BSk, Dsc and Dsb round it.
   * **Hydrology:** Author braided meltwater stream channels carrying glacial discharge and mineral-rich volcanic silt from the eastern canyons of the Stalker Peaks across the terraces.
2. **The Central Fault Escarpment ($[1532, 1505]\text{ to }[1582, 1387]$):**
   * A $1,500\text{--}1,800\text{ m}$ stepped columnar basalt cliff separating the warm NW lowlands from the high SE plateau.
   * A scree-ramp caravan notch at $[1559, 1457]$ ($+3,289\text{ m}$) hosting the Scarp Pass (Station 2).
3. **The SE High Plateau & Maar Swarm ($X \in [1582, 1769], Y \in [1470, 1628]$):**
   * Plateau surface remains elevated at **$+4,200\text{ to }+4,500\text{ m}$** (freezing subpolar plateau, $-5.0^\circ\text{C}$ mean, katabatic blizzards).
   * Carve $35\text{--}50$ circular/elliptical negative crater stamps ($D = 2.5\text{--}5\text{ km}$, deep maar pit floors down to $+2,277\text{ m}$ with $420\text{ m}$ inner crater benches) along the volcanic fissure corridor.
   * Preserve $5\text{--}10\text{ m}$ wide knife-edge basalt bridges (The Arête Way, Station 4 at $[1678, 1542]$, $+4,269\text{ m}$, its two pits' floors at $\sim 3,850\text{ m}$) between overlapping stamps. The warm groves (Station 3 at $[1687, 1555]$, $+2,277\text{ m}$) are in a different place: a 420 m maar sunk into the floor of the **sink**, a trough the model already holds $\sim 2\text{ km}$ under the plateau and $\sim 8\text{ km}$ across, 32 km south-east of the Arête (section 0).

---

## 3. The 4 Stations

### Station 1: Ostrukh Terraces (The Cold Arable Basin — NW)
* **Metadata:** `stations/terraces/station.json` (`px: 1519, 1453`, elev $+2,157\text{ m}$, $1.22\text{ atm}$, mean $+15^\circ\text{C}$ (warm $+28$, cold $+2$), rain $439\text{ mm}$, Cwb, wind $7.4\text{ m/s}$).
* **Landscape:** Fertile loess terraces stepping down to braided meltwater streams fed by Stalker glaciers; dry-stone retaining walls, sod-roofed basalt farmhouses, communal grain elevators.
* **Agriculture & Ecology:** the grain, pulse and tuber `kits/crops` gives for the station's axes (`CROPS.at({warmth:'temperate', atm:'standard', arid:'semiarid'})`: there is no `terrace` zone in the crops kit); domesticated Ghaunt-Ox pairs pulling stone seed-drills.
* **Role:** The agricultural breadbasket of the south-east, feeding the mining and wax-harvesting camps of the higher zones.

### Station 2: The Scarp Pass (The Central Dividing Fault)
* **Metadata:** `stations/scarp/station.json` (`px: 1559, 1457`, elev $+3,289\text{ m}$, $1.06\text{ atm}$, mean $+4^\circ\text{C}$ (warm $+17$, cold $-9$), rain $173\text{ mm}$, Dsc, wind $7.3\text{ m/s}$).
* **Landscape:** Sheer hexagonal basalt columns rising $1,600\text{ m}$; switchback road cut into jointed rock; permafrost stone nets and frost circles (`42-core-frost.js`).
* **Settlement & Transit:** Fortified stone tollhouse and caravansary sheltered under a basalt overhang; iron beacon baskets and windbreaks; freight exchange for pack beasts.

### Station 3: Siphon Maar Floor (The Sunken Geothermal Sink — SE)
* **Metadata:** `stations/pitfloor/station.json` (`px: 1687, 1555`, floor elev $+2,277\text{ m}$, the maar's rim $+2,697\text{ m}$ (420 m walls), the sink's shoulders $+4,000\text{ to }4,800\text{ m}$ 8-16 km off, $1.20\text{ atm}$, mean $+18^\circ\text{C}$ (warm $+32$, cold $+6$), rain $439\text{ mm}$, Cfa (geothermal), a geyser vent of the model 3 px north-west (`vents`: floor 2,203 m)).
* **Landscape:** Circular flat basin floor completely enclosed by vertical columnar basalt cliffs; boiling diatreme vents, mud pots, and subterranean lava tube portals.
* **Inversion Trap:** Amber inversion fog deck sealed at $+2,580\text{ m}$ ($303\text{ m}$ above the floor, under the 420 m rim); dead-calm $+18^\circ\text{C}$ microclimate; visibility on the floor $\sim 200\text{ m}$ (section 0).
* **Ecology:** Communal groves of **Woolly Siphon trees** (`woolly_siphon`, $20\text{--}30\text{ m}$ tall), venting steam through flared lips and wrapped in $15\text{ cm}$ lanolin-wax pelts; springy **Siphon-Felt turf** (`siphon_felt` / `kground`); bulbous **Suture-Galls**; burrowing **Basalt Pipe-Borers**.
* **Human Presence:** Roper base camp (*Pit-Head 04*): canvas huts, copper rendering kettles melting raw machine-wax into ingots.

### Station 4: The Arête Way (The Knife-Edge Bridges — SE Rim)
* **Metadata:** `stations/arete/station.json` (`px: 1678, 1542`, elev $+4,269\text{ m}$, $0.94\text{ atm}$, mean $-5^\circ\text{C}$ (warm $+8$, cold $-18$), rain $173\text{ mm}$, wind $7.4\text{ m/s}$ mean, the blizzard's gusts to $35\text{ m/s}$, ET).
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
   * Reuses (the library's real names, section 8 of the Core adoption): `ground.turf.native` (no `ground.turf.alpine`), `ground.terrace.field` and `rock.loess` (no `ground.soil.volcanic`), `rock.basalt.polygonal` and `rock.basalt.vesicular` (no `stone.basalt.columnar`), `card.clubmoss`, `kits/crops` (no `core/crops`).
   * New slots: `woolly_siphon` (flared chimney trunk + fleece normal/roughness), `siphon_felt` (fibrous turf groundcover), `machine_wax` (amber lubricant ingot).
2. **Terrain Procedural Pipeline (`core/terrain`):**
   * Graben step and pits: `KRELIEF.stepcut` (`38c-core-landforms.js`, written for these pits: sheer stepped walls, no falloff) and `KRELIEF.scarp`; `KFIELD` (`30-core-field.js`) carries no brush for it and `KBASIN` is old lake beds (strandlines), not a stamp.
   * Frost pass: `42-core-frost.js` applied to Station 2 & 4 plateau surfaces.
3. **Atmospheric Shaders (`core/atmos`; there is no `core/sky`: the shared sky is `core/atmos/sky`):**
   * Station 1: Crisp sub-alpine sky with warm directional sun and thin mountain haze.
   * Station 2 & 4: Frigid polar blizzard with horizontal snow particle emitter.
   * Station 3: the amber deck as `core/atmos` height fog's mist pooled under $+2,580\text{ m}$ ($Y_{\text{floor}} + 303\text{ m}$, the station record's lid; the plan's other figure, +150 m, dropped), visibility $\sim 200\text{ m}$ on the floor (the plan's 25 m would hide every tree on the page).
4. **Performance Targets (`GRAPHIC-LOAD.md`):**
   * Geometry welding (`BIO.INDEX_ITEMS = true`) on all siphon chimneys and fleece meshes.
   * MultiMesh instance budgets: Station 3 floor capped at 250 active trees per chunk; zero trees on Stations 2 and 4.

## Crystal caves (planned, 2026-11-03)

The basalt plateau's flows hold amethyst geodes, the maars' hot water the silica that fills them: one or two walk-in geodes on the pit rims (a `KCAVERN` hall 2-5 m across, `KSPELEO.AMETHYST`). See `biomes/CRYSTAL-CAVES-5.1.md`, site 3.

The geodes (2026-11-11): `core/terrain/39f-core-geode.js` (`KGEODE.block`, `KGEODE.line`, on a `KCAVERN`) is the module, built
for this survey's site 3 with the scablands' coulee first. One walk-in geode on Station 3's rim is section 7's S7.

## 6. Core adoption (written 2026-11-11, before the first fragment, as `CLAUDE.md` asks)

**Started from `biomes/highrift`**: the newest compact station kit on the rebuilt core (five ideal-type stations in one
stage fragment, KTHERM vents, sinter, geysers, height fog, KFAR and KHORIZON, the kin mechanism in `build.py`), built and
checked in the cloud on software GL as this kit is, and the Siphon Pits' own neighbour (High Rift runs from Oidong to here).
Its `build.py` predates `tools/build_sources.py`, so that part (`BSRC.report`) is taken from `biomes/geyser`'s. The Throne's
`siphon` is read in place (`BIO.kin`), never copied.

| Need | Module | How |
|---|---|---|
| species, items, placement, LOD, impostors, the kin | `core/biome` (`10`, `20`, `30`, `31j`, `32` `BIO.kin`, `33` `BIO.fung`, `34`, `35`, `40`, `41`, `42`, `43`, `44`) | the woolly siphon is `BIO.kin('throne.siphon', ...)` grown by the Throne's own builder (`biomes/throne/src/50`, `55`, `70` read in place, its registry); the fleece, felt, galls, cushions, sedges, willow, crops are this kit's items on `BIO.fung` and `BIO.geo`; `BIO.INDEX_ITEMS` on (the plan's welding) |
| randomness | `core/rand` (`KRAND`) | every cell `KRAND.cell(seed, ix, iz)`, every record `KRAND.hash(world, i, j, salt)`; the land's noise `KRAND.fbm`; no `Math.random`, no sin hash |
| records and tags | `core/tags` (`50`, `52`, `53`) | everything placed is registered before it is drawn (`BIO.init({tags})`, `REGISTER`): trees, galls, vents, the stations' human sites, hazards |
| keep-clear, occupancy | `core/space` (`KSPACE`) | the biome core's keep-clear between siphons; no grid of the kit's own |
| a placement raster | `core/mask` (`KMASK.canvas`, `KMASK.distance`) | Station 1's farm plan (the braided channels, the fields, the farmstead lots) painted as a mask and read back; the willow and the gravel bars by `KMASK.distance` from the channels; Station 3's roper camp kept clear the same way. Never `getImageData` on a canvas of the page's |
| the ground as data | `core/terrain` `30-core-field` (`KFIELD.bake`, with an inset) | each station's analytic land baked once to a field (8 m; Station 4's knife-edge in a 0.5 m inset), the page and the export read the field |
| the graben step, the scarp, the pits | `38-core-relief` + `38c-core-landforms` (`KRELIEF.scarp`, `KRELIEF.stepcut`, `KRELIEF.terraces`, `KRELIEF.columns`, `KRELIEF.wadi`'s braids) | the Ostrukh fault's step behind Station 1 and the Scarp's wall (`scarp`), the maar of Station 3 and the Arete's two pits (`stepcut`: sheer stepped walls, written for these pits), the loess terraces (`terraces`), the columns' relief on the walls' tops (`columns`), the braided channel's bars (`wadi` braids) |
| the frost pass | `42-core-frost` (`KFROST`) | ice-wedge polygons and sorted circles on Stations 2 and 4, solifluction lobes on the Scarp's ramp |
| beds on the faces | `35-core-strata` + host shade | `tibasalt` (the flood basalt: flows, rubble, beads, palagonite) on every wall; `loess` on the terraces' risers |
| the ground's layers, far field, horizon | `43-core-ground` (`KGROUND`), `44-core-farfield` + draw, `45-core-horizon` + shade | as highrift |
| the vents' heat | `47-core-therm` (`KTHERM`) | Station 3's geyser (the model's vent) and its fumaroles: the one temperature field the felt, the groves, the snow and the hazards read |
| caves, the geode | `39-core-cavern` (`KCAVERN`), `39b-core-speleo` (`KSPELEO.AMETHYST`), `39f-core-geode` (`KGEODE`) | the walk-in geode on Station 3's rim (S7) |
| sky, sun, weather, the deck, the blizzard | `core/atmos` (core, presets, particles, export, waves, skylight, weather, host bind, the shared sky `sky/` and `host/89-atmos-i-skybiome.js`, height fog `j`, `fx/snowcover`, `fx/smokegroups`) | the shared sky at each station's place; the amber deck is the height fog's **mist** pooled under +2,580 m all day (its dawn window opened to the whole day); the blizzard is the weather's `blizzard` (`bindWeather({climate:{cold:true}, mode:'blizzard'})`); the vents' steam is `smokeGroups` |
| water | `core/water` (`20`, `21`, `22`, `50`, `51`; `geyser/52`, `52b`; `ext/56`, `57`, `60`) | the braided meltwater as `WATER.flow` channels; the vent well a `WATER.geyser`, the mud pots and hot pools `WATER.spring`; the fields (`WATER.fields`) for the shore |
| hazards | `core/hazard` (`KHAZ`) | `fall` on the walls and the knife-edge, `hunter` on the flensers' lairs, `heat` on the vents, `slip` on the rime; the air as ambient fields (`KHAZ.provide('pressure')`, `KHAZ.provide('temperature')`) from each station's record, so `thin-air` and `cold` read the corrected numbers |
| camera, panel, probe, inspector, polygon tool | `core/host` (`FULL` + `94-host-polytool.js`) | the page shell; `99-host-take.js` hands it the views, the words and the checks |
| shadows, the clock, export, minimap | `core/shadow`, `core/clock`, `core/export` (`07`, `09`), `core/minimap` (in `FULL`) | as highrift |
| textures | `core/materials` (`record`, `materials.json`, `tools/textures/pack.py`) | the library sets of section 5 under their real names; the three owed slots are in `core/materials/PROMPTS-NEEDED.md` with stand-ins named in `KNOWN_ISSUES.md` |
| crops | `kits/crops` (`10`, `20`, `22`, `40`, read in place) | Station 1's grain, pulse and tuber from `CROPS.at` on the station's axes and `CROPS.pick` |
| fauna | `kits/fauna` | the Ghaunt-Ox, the Flenser-Hound and the Pipe-Borer as records (`krator-fauna-xeno.js`); the pages publish where each lives as data (their herds and lairs as `life` records); drawing them on the pages is S8 |

Not taken, and why: `KBASIN` (old lake beds; no palaeolake here), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement is built: the farmsteads, the tollhouse, the roper camp and the gantries are published as site
records for a building kit and a hamlet pass to take; the culture is undecided), `core/lod` (the biome core's runtime LOD),
`core/walk` (no paths yet beyond the road's line, which is data), `33b-core-bamboo`, `36-core-walker`, `37-core-traps` (no
trap plants), `38b`/`46` lava (no live lava), `39c-core-karst` (no soluble rock), `core/engine` (no building kit),
`core/charactermodels` (no people drawn).

## 7. Order of work

- **S0.** The survey and the corrections (section 0); this section and section 6; the station records corrected
  (`stations/*/station.json`, inlined by `build.py`); `PLAN-STATIONS.md`'s table.
- **S1.** The kit's frame from highrift: `build.py` (with `BSRC.report`), the site records (`[G data]`), the stage on
  `KFIELD`, the host files, `99-host-take.js`; **Station 1, the Ostrukh Terraces**: the graben's floor under the fault step,
  the braided meltwater on `WATER.flow` with its bars, the loess terraces on `KRELIEF.terraces`, the crops from `kits/crops`,
  dwarf blue willow by the channels (`KMASK.distance`), the farm plan as a mask, the farmsteads as site records.
- **S2.** **Station 3, the Siphon Maar Floor**: the maar on `KRELIEF.stepcut` in the sink, the geyser and the mud pots on
  `core/water/geyser` and `KTHERM`, the amber deck, the woolly siphon (`BIO.kin('throne.siphon')` plus its fleece), the
  siphon felt, the suture galls on the wall's foot, the tree cap (250) held, the roper camp as sites.
- **S3.** **Station 2, the Scarp Pass**: `KRELIEF.scarp` with the ramp and the switchback road's line, the columns,
  `KFROST`'s polygons and lobes, cushion moss, rock lichen and scree sedge; no trees.
- **S4.** **Station 4, the Arete Way**: the two pits on `KRELIEF.stepcut`, the knife-edge in a fine inset, the blizzard,
  rime, the stanchions and chains, the gantry's site, the flensers' lairs as hazard records; no trees.
- **S5.** `kits/fauna`: the Ghaunt-Ox, the Flenser-Hound, the Pipe-Borer as records on the data-first contract;
  `tools/reach.py` and the rebuilds it asks.
- **S6.** `verify.py --assert`: each station's pressure and temperature against the table in `PLAN-STATIONS.md` and the
  air law; no trees on Stations 2 and 4; the cap on Station 3; the human sites registered; each check with a negative.
  `PORT.md`, `INDEX.md`, `BIOME-API.md`, `KNOWN_ISSUES.md`; `tools/check_core_use.py`; `tools/test_all.py`.
- **S7.** One walk-in amethyst geode on Station 3's rim (`KGEODE.block` and `line` on a `KCAVERN`), if it fits; else a
  noted next step.
- **S8.** Next: the animals drawn on the pages (`fauna-lands.js`, the herds on Station 1, the flensers on 4); the owed
  textures; the human structures from a building kit; Section 2's terrain edits in the next scale model update.
