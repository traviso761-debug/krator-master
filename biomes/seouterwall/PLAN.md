# SE Outer Wall (`seouterwall`) — Scenic Alpine Cordillera, The Godsgate Pass & Hidden Highland Tarn Oases (`PLAN.md`)

> **Status: Proposed Biome Kit & Scale-Model `5.1` Sculpting Blueprint (`2026-11-06`).**
>
> **Polygon:** `SE outer wall` (`id: "rmw4xy4tp9b29"`, `kind: "biome"`, `20` vertices: `[[1329,1136],[1356,1201],[1336,1222],[1299,1228],[1267,1254],[1245,1276],[1224,1300],[1201,1346],[1130,1352],[1092,1340],[1060,1310],[1039,1292],[1009,1305],[997,1207],[1032,1205],[1091,1204],[1164,1198],[1249,1188],[1300,1160],[1324,1141]]`).
> - **Bounding Box:** `X = 997..1356`, `Y = 1136..1352` (`359 × 216 px` span; `38,207` cells = **`152,828 km²`** on the `1821 × 1723` `2 km/px` Scale Model `5.1` master grid, or `~224 km E–W × 135 km N–S` / `14,925 km²` at the `625 m/px` regional detail scale). All `px, py` coordinates below are on the unified **Scale Model `5.1` (`X = 997..1356, Y = 1136..1352`)** grid (subtract `DX = 272, DY = 330` for legacy `4.23` coordinates).

---

## 0. Executive Summary & Design Brief

**Owner's Brief:**
> *"Give me a proposal for a scenic alpine biome for the polygon 'SE outer wall'. It should be relatively inhospitable, the kind of place most would not want to stay for long, but might contain a handful of tiny highland lake oases an enterprising player might find exploring. In the west, the Godsgate, the great pass to the Catch and Xanadu runs."*

### What the Kit Is (`biomes/seouterwall/`)
`biomes/seouterwall/` (`window.SEOUTERWALL`, `id: 'seouterwall'`) is the high, wind-scoured, cold-alpine impact-ring cordillera that walls off the hyperarid abyssal salt pan of **The Bowl** (`rmvka5413efyi`, `-1,080 m` to `+1,500 m`) in the north from the sealed Taklamakan-like basin of **The Catch** (`rmvka7icdn1dq`, `+225 m` to `+3,000 m`) in the south, pinched between the eastern titanium-basalt shield apron of the **Godthrone** (`rmvkkebdukgx7`) on the west and the **Stalker Range / Stalker Gate** (`rmvkknh1am4fw` / `rmvstalkergate`) on the east.

| Parameter | Specification |
| :--- | :--- |
| **Kit Folder & Object** | `biomes/seouterwall/` (`window.SEOUTERWALL`, `BIO.init({tags:'seouterwall'})`) |
| **Core Modules Adopted** | `core/biome`, `core/rand` (`KRAND`), `core/tags`, `core/space` (`KSPACE`), `core/host` (`KHOST.FULL`), `core/atmos` (thin-air sky, katabatic gust-front weather, rime fog, snowcover fx), `core/water` (`WATER.still` tarns, `WATER.flow` headwater torrents, `WATER.fall` cascades), `core/terrain` (`KFIELD`, `KSTRATA` with `megabreccia` + `tibasalt` dike recipes, `KRELIEF.talus`, `KFROST` patterned ground & rock glaciers, `KSTACKS` arête gendarmes), `core/hazard` (katabatic wind-chill, nocturnal frost, rockfall, Stalker scout patrols on the eastern col) |
| **Read in Place** | `biomes/nwouterwall` & `biomes/ehighlands` (cushion domes, fellfield lichens, dwarf willow/birch); `biomes/wouterwall` (puya spikes & slump-scarp ledges); `biomes/oidong` (snow lotus & prayer cairns on the western Godsgate); `biomes/godshearth` / `biomes/hearths` (relict dwarf *pocket-hearths* at the two geothermal/volcanic-sill tarns); `kits/ancients` (cyclopean wind-baffles, broken viaduct piers, & sealed Arcbeam–Stair tunnel ventilation shafts) |
| **Target Elevation Tiers (`5.1`)** | **`+3,350 – +3,750 m`** in the **Godsgate Pass** saddle (`0.99–1.05 atm`); **`+3,680 – +4,520 m`** in the **5 Hidden Highland Tarn Oases** (`0.91–1.01 atm`); **`+4,200 – +5,400 m`** across the wind-planed periglacial benches & felsenmeer (`0.81–0.95 atm`, `ET` / `Dsc`); **`+5,400 – +6,450 m`** along the central glaciated megabreccia arêtes & horn peaks (`0.71–0.81 atm`, `EF` / `HT`) |
| **Why Nobody Lingers** | Violent nocturnal **katabatic density-windavalanches** (`70–130 km/h`) roaring off Godthrone and the crest into the `-1,000 m` Bowl vacuum; flash **barometric whiteouts** & freezing rime-fogs; relentless **freeze-thaw rockfall** off overhanging shatter-cone cliffs; nocturnal radiative frosts (`-8 °C to -22 °C` even in summer); and, east of `X = 1180`, roving **Stalker** harpooner/blade triads patrolling the western ridges above Hub 01 |

---

## 1. Physiography, Tectonics & Structural Geology (`X = 997..1356, Y = 1136..1352`)

### 1.1 Current Uncarved `5.1` Survey vs. Proposed Alpine Cordillera Profile
A live readout of `SE outer wall` (`rmw4xy4tp9b29`, `38,207` pixels) on the current `5.1` height raster reveals why this polygon requires a dedicated **Alpine Cordillera & Godsgate Sculpting Pass**:
- **Current Uncarved Raster (`5.1`):** `min = 3,712 m`, `p5 = 5,341 m`, `p25 = 6,740 m`, **`median = 8,303 m`**, `p75 = 10,115 m`, `max = 15,016 m`. Because `6,250 m` is Krator's hypobaric `HT / HF` threshold and `9,000 m` is the airless `Class O` line, **`79.8%` of the uncarved polygon currently sits in airless or unbreathable hypobaric permafrost** (`Class O`: `40.5%` at `10,473 m` median; `HF`: `19.4%` at `8,290 m`; `EF`: `18.8%` at `7,050 m`; `HT`: `1.9%`; `ET`: `18.0%` at `5,798 m`; `Dsc/Dfc/Dsb/BSk`: `1.5%` at `3,827–4,805 m`). Even the western notch (`old px 726, 896` -> `5.1 px 998..1033, 1226..1257`) stands at **`5,666–6,277 m`** (`-12 °C` mean), with only `24` perched water pixels in the entire `152,828 km²` region.
- **Proposed `5.1` Alpine Rescaling ("Breathable but Brutal"):** Just as `godshearth` (`rmw4wou2y1hhc`) and `nwouterwall`'s central trough were lowered into the breathable alpine/subalpine window, we rescale `SE outer wall` from an airless `8–15 km` barrier into a **dramatic, Earth-to-Andean-scale high alpine cordillera (`+3,350 m` to `+6,450 m`)**:

```
           SE OUTER WALL — WEST-TO-EAST STRUCTURAL PROFILE (X = 997..1356, Y ~ 1140..1350)

  WEST (X = 997..1060)             CENTRAL CORDILLERA (X = 1060..1260)           EAST (X = 1260..1356)
   THE GODSGATE PASS             JAGGED MEGABRECCIA ARÊTES & CIRQUE TARNS       STALKER-WALL TRANSITION
  (Fault-Breccia Col)           (Listric Slump Terraces & Glaciated Horns)      (Yuni Headwall & Stalker Col)

Godthrone                           Horn Peaks & Knife-Edge Arêtes (+5,400–6,450 m, EF/HT, 0.71–0.81 atm)
Ti-Basalt                          /\        /\      /\        /\      /\          /\        /\
Apron                             /  \  [2] /  \    /  \  [3] /  \    /  \  [4]   /  \  [5] /  \   Stalker Range
(+6.5 km)                        /    \~~~~/    \  /    \~~~~/    \  /    \~~~~~~/    \~~~~/    \  (+7.5–11 km)
  \                             /   Hanging Cirque & Fault-Graben Tarns (+3,850–4,520 m, 0.91–0.98 atm)
   \      [1] Tarn of          /
    \     the Gate-Bell       /     Periglacial Felsenmeer & Slump Benches (+4,200–5,200 m, ET/Dsc)
     \____(+3,680 m)_________/
          \        /
           \______/  <-- THE GODSGATE SADDLE (+3,350–3,720 m | P = 0.99–1.05 atm | Dsc / BSk / ET)
                          Connects The Bowl (-1,080 m, N) <-> The Catch (+1,400 mKolli Fan, S) & Xanadu (SW)
```

### 1.2 Three Interlocking Geological Domains
`SE outer wall` stands at the triple junction of Krator's three most violent geological processes, giving its cliffs and talus slopes an unmistakable visual signature (`KSTRATA`):

1. **The Megacrater Outer-Ring Megabreccia & Overturned Flap (Central & Northern Spine, `X = 1055..1310`):**
   - The core of the cordillera is the **southeastern rim of the primary planetary impact basin**. During transient crater collapse, kilometer-scale listric normal faults dropped the northern face down toward **The Bowl** (`-1,080 m`) in three colossal **back-tilted rotational slump terraces** (`+3,500 m`, `+4,350 m`, and `+5,150 m`), while thrusting the **overturned impact-ejecta flap** (`megabreccia` strata recipe: chaotic, house-sized angular clasts of pale granite, dark gneiss, red sandstone, and bottle-green suevite impact glass welded in a grey pseudotachylite friction-melt matrix) skyward along the southern crest overlooking **The Catch**.
2. **The Godthrone Titanium-Basalt & Orange-Glass Western Contact (`X = 997..1065`):**
   - Along the western boundary (`X = 997..1065`), flood-basalt lobes and radial feeder dikes from the **Godthrone** (`rmvkkebdukgx7`) lapped against the fractured impact megabreccia wall. The contact zone is a structural weakness — a **right-lateral strike-slip transfer zone and fault-breccia col** where differential subsidence between the massive volcanic shield load (`west`) and the listric crater-wall blocks (`east`) tore open **The Godsgate** (`X = 1005..1058, Y = 1205..1305`).
   - Here, black colonnaded **titanium-basalt (`tibasalt`) buttresses** with metallic ilmenite sheen and recessed stripes of **orange fountain-glass palagonite** (`biomes/godthrone/PLAN.md` §3) face sheer eastern cliffs of patchwork impact megabreccia across the pass floor.
3. **The Yuni–Stalker Transpression Zone & Hydrothermal Vein Network (Eastern Bastion, `X = 1250..1356`):**
   - Where the polygon bends northeastward between **Yuni Valley** (`rmuvlpgkd7v7w`, north at `X = 1225..1294, Y = 1059..1124`), **The Catch** (`south`), and the **Stalker Range / Stalker Gate** (`rmvkknh1am4fw` / `rmvstalkergate`, east), the megabreccia is cross-cut by quartz-sulfide, copper-porphyry, and warm geothermal fault veins (an upper-crustal finger of the same deep hydrothermal anomaly that powers Yuni's Grand Vault at `1263, 1089`).

### 1.3 Elevation Tiers & Barometric Physics (`P(h) = 1.6 \cdot e^{-h / 8000\text{ m}}`)

| Tier | Elevation (`m`) | Pressure (`atm`) | $\text{O}_2$ Equiv. on Earth | Köppen Class | Dominant Landforms & Surface Cover |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tier 1: The Godsgate Pass & Fault Toes** | `+3,350 – +3,850 m` | `0.99 – 1.05 atm` | Sea level (`0–500 m`) | `Dsc` / `Dsb` / `BSk` | Glaciated fault-breccia trough, braided meltwater gravels, cyclopean Ancient road cuttings, wind-flagged krummholz |
| **Tier 2: The 5 Hidden Tarn Oases** | `+3,680 – +4,520 m` | `0.91 – 1.01 atm` | `0 – 850 m` | `Dsc` / `Cfc-micro` / `ET` | Overdeepened glacial cirque bowls, fault-sag grabens, & warm hydrothermal spring alcoves sheltered by `500–1,200 m` rock walls |
| **Tier 3: Slump Benches & Felsenmeer** | `+4,200 – +5,400 m` | `0.81 – 0.95 atm` | `500 – 1,900 m` | `ET` (Alpine Tundra) | Back-tilted listric slump treads, frost-shattered blockfields (*felsenmeer*), sorted stone polygons, lobate rock glaciers, cushion fellfield |
| **Tier 4: Nival Arêtes & Glaciated Horns** | `+5,400 – +6,450 m` | `0.71 – 0.81 atm` | `1,900 – 3,000 m` | `EF` / `HT` | Knife-edge megabreccia arêtes, pyramidal horn peaks, hanging cirque glaciers, blue-ice seracs, rime-ice feathers, constant rockfall chutes |

---

## 2. Climate, Meteorology & Why Most Travelers Do Not Linger

Even after lowering the cordillera into the breathable `0.71–1.05 atm` envelope, **`SE outer wall` is deliberately designed as a hostile, high-exposure transit biome** where caravans push double-stages to clear the pass and solo explorers must hunt for sheltered micro-basins before nightfall. Five interlocking meteorological hazards govern gameplay and atmosphere (`core/atmos` & `core/hazard`):

### 2.1 The "Bowl-Draught" & "Catch-Spill" Katabatic Hurricanes
- **The Barometric Engine:** `SE outer wall` sits perched on a knife-edge between two extreme thermal and barometric regimes:
  1. Immediately **north**, **The Bowl** drops to `-1,080 m` (`1.83 atm`, daytime highs `+47 °C`).
  2. Immediately **west**, the **Godthrone** rises to `25,000 m` (`0.07 atm`, `-75 °C`), shedding a relentless river of hyper-chilled, dense katabatic air down its eastern flank.
  3. Immediately **south**, **The Catch** (`+225–1,400 m`, `1.35–1.55 atm`) heats to `+34–43 °C` by day and radiates rapidly under bone-dry skies at night.
- **Diurnal Wind Reversal (`ATMOS.windAt`):**
  - **By Afternoon (The Anabatic *Salt-Draught*):** Superheated air rising off The Bowl and The Catch draws a roaring upslope gale (`45–75 km/h`) up the northern and southern gorges, carrying stinging alkali dust from The Catch and ochre salt-haze from The Bowl up to the `4,500 m` benches.
  - **By Night & Dawn (The Katabatic *God-Bore*):** Two hours after sunset, radiative cooling on the `5,500–6,450 m` crest and downslope drainage off Godthrone trigger violent **katabatic density-wind avalanches (`80–130 km/h`)** that howl down every couloir and funnel through the Godsgate like a jet engine. In ~`1.0 atm` air at `-15 °C`, exposed travellers suffer rapid convective hypothermia unless sheltered behind wind-baffles or inside a cirque tarn hollow.

### 2.2 Diurnal Radiative Frost & Thin-Cloud UV Glare
- Because the southern rain shadow of the Catch and the dry subsidence over the Bowl starve the range of moisture (`median precipitation 90–260 mm/yr`, rising to `320–450 mm/yr` only on the western Godsgate and northeastern Yuni-facing shoulders), skies above `4,200 m` are crystal-clear 70% of the time.
- **Daytime solar glare** off pale suevite breccia, quartz veins, and snowfields forces high contrast and snow-blindness, while **nighttime longwave radiative loss** drops surface rock temperatures by `22–30 °C` within three hours of sunset (summer afternoons `+6 to +14 °C` plunging to `-10 to -22 °C` before dawn).

### 2.3 Flash Barometric Whiteouts & Rime-Ice Fogs (`core/atmos` Height Fog)
- When moist air from the **Bowl's lake-effect plumes** (`biomes/sedesert/PLAN-BOWL.md`) or the **SE Savannah Rim** is forced up the northern listric scarps (`Y = 1136..1205`) and collides with freezing air spilling off the crest, it condenses instantaneously into **supercooled rime-fog banks**.
- Visibility drops from `80 km` to `< 12 m` in minutes; horizontal wind drives supercooled droplets that freeze on contact into `30–80 cm` horizontal **rime-ice feathers** (*anemousite*) on every cairn, boulder, and pack-beast harness.

### 2.4 Periglacial Freeze-Thaw Shattering & Active Rockfall Chutes
- Crossing `0 °C` twice every 24 hours, water in the fractured `megabreccia` expands and pries loose blocks ranging from fist-sized cobbles to `20-ton` granite and impact-glass boulders.
- The mid-elevation slopes (`+4,200–5,400 m`) are vast, unstable **felsenmeer (blockfields)** and **scree aprons (`KRELIEF.talus`)** that clatter and shift underfoot, while steep couloirs discharge periodic noon rockfalls as the sun melts the ice cement on north-facing (sunlit, `40° S`) walls.

### 2.5 The Eastern Shadow: Stalker Reconnaissance Triads (`X > 1200`)
- While the western Godsgate is patrolled by caravaneers, the eastern half of `SE outer wall` (`X = 1200..1356`) directly overlooks **Hub 01** (`5.1 px 1344, 1409`, `4,351 m`) and the **Stalker Range** (`rmvkknh1am4fw`).
- Caravaneers and Yuni prospectors know that **Stalker pairs and triads** (`st_harpooner` and `st_blade`, `biomes/catch/PLAN.md` §6c) use the high snow-chutes and dry wadis of the eastern wall (`Loua Waita Guli`, `Waita Guli`, `Wādī al-Zulāl`) to transit between Hub 01, the Catch, and the collapsed northern half of the Arcbeam–Stair tunnel. In the whiteout rime-fog, a white-hulled Harpooner crouching motionless among white quartz-breccia boulders is virtually invisible until its pneumatic harpoon hisses.

---

## 3. The Western Corridor: The Godsgate (`X = 997..1060, Y = 1205..1310`)

### 3.1 Role in Krator's Global Trade & Lore
In `LORE.md` (§3.1, §4, §6.13) and `biomes/catch/PLAN.md` (§1, §6), **all overland trade between the Crater (Iziz, Yuni, the Bowl, Mantis, Arcbeam) and the rich southern Sultanate of Xanadu** must cross **The Catch** — and the **only viable northern entry into The Catch** is the notch between the Bowl and the Catch (`old px 726, 896` -> `5.1 px 998..1045, 1205..1305`).

In the newly defined `SE outer wall` polygon (`rmw4xy4tp9b29`), this western lobe (`X = 997..1060, Y = 1205..1310`) is **The Godsgate**:
- **Multilingual Names across the Four Caravan Tongues (`biomes/catch/PLAN.md` §8):**
  - **Common / History Monks:** *The Godsgate* (so named because the pass threads directly under the eastern shadow of the 25 km **Godthrone**, and because the Ancients' cyclopean portal pylons stand at its crest).
  - **Izani (Empire of Iziz):** *Porta Dīva* or *Clūsa Deōrum* ("The Pass of the Gods").
  - **Yuni:** *Godgeit* or *Guli-Geito* ("The Gully-Gate").
  - **Dasrī (Eastern Desert Caravaneers):** *Bāb al-'Āliha* ("Gate of the Gods") / * العقبة الكبرى (al-'Aqaba al-Kubrā)*.
  - **Xanadui:** *Dēva-Dvārṭu* or *Qol-Gāphar* ("The Overseer's Col").

### 3.2 Structural Origin & Topographic Profile (`100 km` Trans-Cordilleran Trench)
The Godsgate is a **strike-slip fault-breccia col and glacial transfluence saddle** carved along the contact between **Godthrone's eastern titanium-basalt shield apron** (`west wall`) and the **SE Outer Wall's megabreccia bastion** (`east wall`).

On the `5.1` height grid, we carve **The Godsgate** as a meandering, domain-warped U-to-V structural corridor (`half-width ~ 4.5–7.5 px = 9–15 km`) running NNW–SSE from the southern edge of **The Bowl** (`Y = 1195..1206`) to the northern apex of **The Catch** above **Kolli Oasis** (`Y = 1292..1315`):

```
          THE GODSGATE — NORTH-TO-SOUTH LONGITUDINAL PROFILE (X ~ 1022..1038, Y = 1185..1345)

  NORTH: THE BOWL / SEDESERT                   THE GODSGATE (SE OUTER WALL)                   SOUTH: THE CATCH
  (Guli rrija Gorge & Arcbeam)         (100 km Trans-Cordilleran Pass, Y=1205..1305)       (Wādī al-Qamar & Kolli Fan)

                                                 The Twin Gate-Pylons
                                            (West: Ti-Basalt | East: Breccia)
                                              Flanking Peaks: +5,200–5,800 m
                                                       ||        ||
                                  North Sill           ||  Saddle Crest (+3,620 m)
                                 (+3,380 m)            ||   px (1031, 1252)
                                  /~~~~~~\             ||   P = 1.02 atm (`Dsc`)
                       Tarn #1   /        \____________||________||____________
                      "Gate-Bell"          Hanging Valley Tread (+3,420–3,620 m) \          South Portal &
                      (+3,680 m)           Ancient 30m Cuttings & Wind-Baffles    \        Collapsed Tunnel Air-Shaft
                        /                                                          \       px (1035, 1292 | +3,480 m)
         North Gorge   /                                                            \             \
        (Guli rrija)  /                                                              \             \   Braided Gravel Fan
       px (1024,1206)/                                                                \             \-> Kolli Oasis (#1)
         (+2,850 m) /                                                                  \                px (1010, 1274 /
            \      /                                                                    \               1035, 1325 | +1,400 m)
             \____/ ---> To The Bowl (-1,080 m) & Godstep Valley (NW)                    \____________/ ---> To Stair (+1,000 m)
```

- **Northern Approach (`px 1018..1032, py 1195..1225`):** Climbs out of The Bowl and the eastern toe of Godstep Valley up the incised gorge of **`Guli rrija`** (`r440`, Izani: "Red Gully", named for the rust-red palagonite and iron-stained breccia beds in its walls), rising from `+2,600 m` at the polygon's northern foot (`1021, 1205`) to the **North Threshold Sill (`+3,380 m` at `1026, 1224`)**.
- **The Central Hanging Corridor & Saddle Divide (`px 1026..1038, py 1225..1278`):** A `55 km`-long glaciated trough floored at **`+3,420 m to +3,620 m`** (`P = 1.02–1.04 atm`, mean `T = +3.5 °C`, summer `+15 °C`, winter `-8 °C`, `Dsc` dry-summer subalpine / `BSk` cold steppe).
  - **The Drainage Divide (`px 1031, 1252`, `+3,620 m`):** Framed by **The Twin Gate-Horns** — on the west, **Ilmenite Horn** (`px 1008, 1248`, `+5,480 m`), a black colonnaded titanium-basalt spire striped with orange fountain-glass beds; on the east, **Shatter-Crown** (`px 1056, 1244`, `+5,760 m`), a sheer overhang of grey-and-green impact megabreccia.
  - North of `(1031, 1252)`, meltwater drains into **`Guli rrija` (`r440`)** toward The Bowl; south of `(1031, 1252)`, meltwater feeds **`Wādī al-Qamar al-Kabīr` (`r464`, "Great Moon Wadi")** and **`Wādī al-Ṣakhr` (`r708`, "Wadi of the Rock")** toward The Catch (`biomes/catch/PLAN.md` Station 4, *The north fan and the walls*).
- **Southern Mouth (`px 1028..1045, py 1278..1305`):** The pass narrows through **The Southern Narrows (`+3,480 m` at `1035, 1292`)** before plunging down the coalescing gravel bajada fan into the northern Catch toward **Kolli / al-Kōl** (Oasis #1, `"the cold one"`, `biomes/catch/PLAN.md` §8) and southwestward along the high volcanic bench toward **Godshearth** (`rmw4wou2y1hhc`) and **Xanadu** (`rmvkkmitffbjk`).

### 3.3 Ancient Engineering & Caravan Infrastructure in the Godsgate
How does the Godsgate relate to the **sealed Arcbeam–Stair tunnel** (`biomes/catch/PLAN.md` §6, `openworld/ANCIENT-ROADS.md` §4b)?
1. **The Deep Tunnel Below vs. The Surface Service Highway Above:**
   - During the Ancients' era, the primary high-speed maglev/guideway trunk between **Arcbeam** (`px 1016, 1058`, `2,119 m`) and **Stair** (`px 1106, 1442`, `1,379 m`) bored straight underneath the eastern shoulder of the Godsgate in a deep base-tunnel.
   - However, to build and ventilate that `180 km` tunnel—and to haul oversized industrial reactors and heavy crawlers that could not fit the tunnel bore—the Ancients also graded a **`30 m`-wide surface construction highway** (`4%` ruling grade, board-formed cyclopean concrete cuttings, and monolithic **parabolic wind-baffle walls**) directly through the Godsgate saddle!
   - When the Cataclysm's earthquakes collapsed the deep Arcbeam–Stair tunnel halfway through, **the surface Godsgate road became the sole surviving artery between the Crater and the south**.
2. **The Vent-Shaft Caravanserai (*Bāb al-Hawa* / "Gate of the Wind-Shaft", `px 1033, 1258`, `+3,590 m`):**
   - Just south of the `3,620 m` saddle divide stands a colossal, `40 m`-diameter **Ancient Ventilation & Access Shaft Collar** of seamed white metal and bronze ring-bands (`kits/ancients`), originally sunk `1,400 m` vertically down to the mid-point of the Arcbeam–Stair tunnel.
   - The shaft is plugged by fallen megabreccia `180 m` down, *but* warm, dry air (`+16 °C`) still drafts gently upward through the rubble from the geothermally heated tunnel below!
   - Yuni, Izani, Dasrī, and Xanadui caravaneers have turned the sunken concrete apron inside the shaft's massive **cyclopean wind-baffle crescent** into the pass's only safe overnight camp: a roofless stone-and-salvage caravanserai where beasts are tethered out of the `100 km/h` nocturnal *God-Bore* katabatic gale, prayer wheels (`kits/xanadu`) spin alongside Izani milestones and Yuni stencil signs, and desperate arcology divers occasionally attempt to winch down the choked shaft toward the sealed mid-tunnel wreck.

---

## 4. The 5 Hidden Highland Lake Oases (Rewards for Off-Road Exploration)

While 98% of travellers hurry head-down through the Godsgate corridor to escape the freezing nights and katabatic gales, **an enterprising player who climbs out of the pass or ventures east into the rugged `4,000–5,200 m` megabreccia cordillera can discover five tiny, jewel-like highland lake oases (`WH` cells on `5.1`)**.

Each tarn occupies a distinct **structural and microclimatic trap** (overdeepened glacial cirque, back-tilted listric slump trench, volcanic dike-dammed cauldron, or hydrothermal fault-seep) that shields it from the katabatic wind and buffers its thermal regime by **`+5 to +14 °C`** above the surrounding fellfield:

### Oasis 1: *Tarn of the Gate-Bell* (*Kolli-Tarn* / *Birkat al-Jaras*) — Western Godsgate Hanging Cirque
- **Coordinates & Elevation:** **`px (1016, 1236)`**, Lake Surface **`+3,680 m`** (Bed `+3,662 m`, surrounded by `+4,650 m` horseshoe headwall; `P = 1.01 atm`, **`Dsc / Cfc-micro`**, mean `T = +5.5 °C`, summer `+16 °C`).
- **Geological Trap:** A hidden, south-facing hanging glacial cirque (`4 km × 3 km`) perched `260 m` above the western wall of the Godsgate, dammed by a terminal moraine of black titanium-basalt columns and orange fountain-glass sand washed down from Godthrone's apron.
- **Water & Microclimate:** Crystal-clear, cobalt-blue snowmelt fed by a `120 m` bridal-veil waterfall cascading over an orange-striped palagonite cliff. The dark basalt amphitheatre absorbs daytime sun (`40° S` northern exposure on its south wall) and blocks the nocturnal *God-Bore* gale.
- **Flora & Fauna:** Sheltered groves of twisted **gold-needled fur larch** (`nwouterwall`), **red guyed stalks** (`godstep`) in the wet seep gravel, carpets of **goldroot** (*Rhodiola*, the thin-air stamina herb) and **mountain sorrel**, and wild high-mountain ibex/camelids watering at dawn.
- **Exploration Hook:** Half-submerged on the moraine lip stands a toppled **Ancient acoustic fog-horn / resonance bell** (`kits/ancients`) that once guided blind crawlers through the pass; inside its dry bronze housing is a hermit Historian monk's observation cache overlooking the entire Godsgate below.

### Oasis 2: *Amber-Sinter Tarn* (*Chashma-yi Zard* / *Guli-Hearth*) — Godthrone–Breccia Contact Geothermal Pocket
- **Coordinates & Elevation:** **`px (1064, 1272)`**, Lake Surface **`+3,940 m`** (Bed `+3,925 m`, `P = 0.98 atm`, **`Csb / Cfb-thermal`**, ambient `+1 °C` / **oasis boundary layer `+13.5 °C`**, water temperature **`+26 to +34 °C`**).
- **Geological Trap:** Located `28 km` east of the Godsgate in a deep fault-wedge canyon where a lateral titanium-basalt feeder dike from the Godthrone intrudes the Outer Wall megabreccia along the headwaters of **`Wādī al-Ṣakhr` (`r708`)**.
- **Water & Microclimate:** A steaming, turquoise-and-ochre geothermal tarn (`5 km × 4 km`) dammed behind a `25 m` natural travertine and opaline-sinter terrace (`WATER.terrace`). Subaqueous fumaroles (`55–72 °C`) keep the lake ice-free year-round, sending a perpetual plume of warm white vapour curling against the `5,600 m` glaciated peaks above.
- **Flora & Fauna:** An isolated, dwarfed outpost of the **Hearth clade** (`biomes/godshearth/PLAN.md` / `biomes/hearths/PLAN.md`): **`8–14 m` *Dwarf Alpine Hearth-Trees* (*Caloridendron alpinum*)** whose copper-silica heat-pipe trunks tap the hot fault fissure and spread `10 m` black nocturnal radiator umbrellas over lush meadows of **bobby-sock sedge**, **brimstone-lilies**, and **brine lamps**.
- **Exploration Hook:** Because the nocturnal radiator canopy keeps the grove at `+12 °C` during `-18 °C` blizzards, a band of **free Talovolci prospectors and Dalab runaway mods** use the warm sinter caves behind the waterfall as a secret winter refuge and pigment-mining camp (harvesting pure **orange titanium glass** and **alkali sinter** without descending into the Catch).

### Oasis 3: *Mirror-Slump Tarn* (*Lago de Specula* / *Shatter-Glass Lake*) — Central North-Wall Listric Trench Oasis
- **Coordinates & Elevation:** **`px (1134, 1218)`**, Lake Surface **`+4,120 m`** (Bed `+4,095 m`, `P = 0.96 atm`, **`Dsc / ET`**, mean `T = +2.5 °C`, summer `+13 °C`).
- **Geological Trap:** A classic **back-tilted listric slump-block sag pond** (`6 km × 2.5 km`, `biomes/wouterwall/PLAN.md` §4) trapped behind an uphill-facing fault scarp on the northern mid-wall bench, `2,400 m` above the shimmering pink-and-white salt expanse of **The Bowl**.
- **Water & Microclimate:** The north-facing (`300 m` high) fault-mirror wall is coated in a polished sheet of **jet-black pseudotachylite friction-melt glass** (`biomes/neouterwall/PLAN.md` §2) that acts as a giant parabolic solar reflector, focusing noon sunlight onto the narrow trench lake and raising its summer water temperature to `+14 °C` while shielding it completely from southern crest winds.
- **Flora & Fauna:** Giant `10 m` **Puya spikes** (`wouterwall`) and **spiral whorl-rosettes** (`shighlands`) line the sunny friction-glass talus; the lakeshore supports dense **woolly willow**, **silverthorn** (orange vitamin-C berries), **sweetroot**, and nesting colonies of high-wall cliff-swifts and Bowl-hawk raptors.
- **Exploration Hook:** An intact **Ancient Geodetic Survey & Laser-Relay Bunker** (`kits/ancients`) is cantilevered into the black pseudotachylite mirror-scarp above the water, still holding unplundered optical lenses and a panoramic sightline straight across The Bowl to Mantis (`1113, 1164`) and the Throne.

### Oasis 4: *Jade-Karst Polje* (*Birkat al-Zumurrud* / *The Emerald Sink*) — Central-East Megabreccia Carbonate Megablock Oasis
- **Coordinates & Elevation:** **`px (1208, 1254)`**, Lake Surface **`+4,380 m`** (Bed `+4,355 m`, `P = 0.93 atm`, **`ET / Dfc-micro`**, mean `T = +0.5 °C`, summer `+11 °C`).
- **Geological Trap:** Inside the chaotic impact `megabreccia` of the central-eastern crest lies a **house-of-cards megablock of pre-impact Devonian-style reef limestone (`12 km × 8 km`)** that was rafted intact into the crater rim and subsequently dissolved by snowmelt and deep $\text{CO}_2$-rich fault waters into a sunken **alpine karst *polje* (sinkhole amphitheatre)** `450 m` below the surrounding `5,300 m` felsenmeer.
- **Water & Microclimate:** Fed by a sub-permafrost karst resurgence spring (`+9 °C` year-round) that emerges from a flooded limestone cavern (`KCAVERN`) and drains into a swallow-hole (*ponor*) at the eastern end of the meadow. The dissolved calcium-magnesium carbonate gives the tarn a vivid, milky **jade-emerald** hue (`WATER.still` tint field).
- **Flora & Fauna:** Carpeted in **emerald cushion domes**, **Oidong snow lotus** (*Saussurea*), **sky poppies** (`oidong`), and **woolly snowballs** (`nwouterwall`). The warm karst spring cave shelters blind alpine cave-shrimp and hibernating mountain bears/predators.
- **Exploration Hook:** The karst cavern (`cav_sewall_jade`) connects at depth to a fractured **Ancient seismographic vault** containing intact **alloy stock** and a sealed records cylinder detailing the Cataclysm-era seismic wave that collapsed the Stair tunnel and drove Hub 01 mad.

### Oasis 5: *Copper-Vein Tarn* (*Waita-Kopa* / *The Stalker's Mirror*) — Eastern Yuni–Stalker Headwall Cirque
- **Coordinates & Elevation:** **`px (1288, 1184)`**, Lake Surface **`+3,820 m`** (Bed `+3,798 m`, `P = 0.99 atm`, **`Dsc / Dfc`**, mean `T = +4.0 °C`, summer `+15 °C`).
- **Geological Trap:** A deep, glacially scoured rock-basin tarn (`5 km × 3 km`) at the headwaters of **`Waita Guli` (`r514`, Yuni: "White Gully", `q = 6.8 m³/s`)**, tucked beneath the `5,800 m` eastern megabreccia wall where Yuni Emirate's southern mountain frontier meets the western ridge of the **Stalker Range**.
- **Water & Microclimate:** The cirque cuts through a rich **malachite, azurite, and chalcopyrite hydrothermal skarn vein**, staining the waterfalls and lake shallows brilliant peacock-blue and verdigris-green. Moist air rising up `Waita Riba` (`r077`) and `Waita Guli` (`r514`) from the Yuni Valley (`1263, 1089`) gives this eastern pocket higher precipitation (`~380 mm/yr`) than the central spine.
- **Flora & Fauna:** Subalpine **crag pine**, **candle birch**, and **furlarch** groves clinging to copper-green rock ledges; metallophyte **copper-moss** and **ivan-chai** (fireweed) along the stream.
- **Exploration Hook (High Risk / High Reward):** Yuni's **Geomancers** once operated a covert high-altitude copper-and-rare-earth mine here before abandoning it to **Stalker** incursions from the southeast (`Hub 01` lies `225 km` SSE at `1344, 1409`). A wrecked **Stalker Harpooner (`st_harpooner`)** lies frozen in the shallow aufeis at the tarn's southern inlet beside an unlooted Yuni Geomancer battery-charging winch — and a live Stalker pair stalks the upper moraine at dusk.

---

## 5. Proposed Biome Stations (`6` Showcase Stations for `biomes/seouterwall/`)

All station coordinates `(px, py)` and `base` elevations (`m`) are specified on the **Scale Model `5.1` (`1821 × 1723`)** grid and designed to satisfy `tools/scale-model/tests/test_smodel.py` (`|ground_m - base_m| <= 150 m` once the `seouterwall` terrain pass is applied):

| # | Station ID | Page (`dist/`) | `5.1` `px, py` | Base Elev (`m`) | Pressure | Temp (`mean` / `w` / `c`) | Precip | Köppen | Narrative & Visual Showcase Description |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `godsgate` | `seouterwall.html` | **`1031, 1252`** | **`+3,620 m`** | `1.02 atm` | `+3.5 °C` (`+15 / -8`) | `285 mm` | **`Dsc`** | **The Godsgate Saddle & Vent-Shaft Caravanserai:** The flagship trans-cordilleran pass at the drainage divide between `Guli rrija` (N) and `Wādī al-Qamar` (S). Western cliffs of black colonnaded Godthrone `tibasalt` striped with orange glass face eastern cliffs of patchwork impact `megabreccia`. Features the `30 m` Ancient highway cutting, parabolic wind-baffle walls, the steaming `40 m` Arcbeam–Stair tunnel ventilation shaft (`Bāb al-Hawa`) converted into a four-tongue caravan camp, prayer wheels, and roaring nocturnal katabatic dust/snow spindrift. |
| **2** | `gatetarn` | `seouterwall-gatetarn.html` | **`1016, 1236`** | **`+3,680 m`** | `1.01 atm` | `+5.5 °C` (`+16 / -5`) | `340 mm` | **`Dsc`** | **Tarn of the Gate-Bell (Oasis #1):** A sheltered hanging glacial cirque `260 m` above the western wall of the Godsgate. A `120 m` waterfall plunges over an orange palagonite and columnar basalt headwall into a cobalt tarn ringed by gold-needled furlarch, red guyed stalks, goldroot carpets, and a toppled bronze Ancient acoustic fog-bell housing a Historian monk's lookout over the pass below. |
| **3** | `ambertarn` | `seouterwall-ambertarn.html` | **`1064, 1272`** | **`+3,940 m`** | `0.98 atm` | `+1.0 °C` ambient (`+13.5 °C` oasis) | `210 mm` | **`Csb` / `ET`** | **Amber-Sinter Geothermal Tarn (Oasis #2):** A steaming `+30 °C` hydrothermal oasis in a fault-wedge canyon at the head of `Wādī al-Ṣakhr`. Opaline-and-iron sinter terraces dam a turquoise lake surrounded by `12 m` *Dwarf Alpine Hearth-Trees* (`HEARTH.cycle`: silver daytime spindles unfolding into black nocturnal radiator umbrellas under a freezing starry sky), orange volcanic glass sandbars, and a hidden Talovolci/runaway winter camp in the warm travertine caves. |
| **4** | `mirrorscarp` | `seouterwall-mirrorscarp.html` | **`1134, 1218`** | **`+4,120 m`** | `0.96 atm` | `+2.5 °C` (`+13 / -8`) | `195 mm` | **`ET` / `Dsc`** | **Mirror-Slump Tarn & The Bowl Overlook (Oasis #3):** Back-tilted listric slump terrace on the northern rim scarp. A `300 m` uphill-facing fault mirror of polished black pseudotachylite friction-glass reflects noon sunlight onto a narrow sag-pond tarn lined with giant `10 m` Puya spikes and woolly willow, while `200 m` north the bench breaks away in a breathtaking `5,000 m` vertical vista down into the pink-and-white salt pan of **The Bowl**. Includes a cantilevered Ancient geodetic laser-relay bunker. |
| **5** | `jadecrest` | `seouterwall-jadecrest.html` | **`1208, 1254`** | **`+4,380 m`** | `0.93 atm` | `+0.5 °C` (`+11 / -10`) | `165 mm` | **`ET`** | **Jade-Karst Polje & The Felsenmeer Crest (Oasis #4):** High central cordillera where a wind-blasted desert of frost-shattered megabreccia blockfields (*felsenmeer*), rime-feathered arête gendarmes (`+5,600 m`), and lobate rock glaciers drops suddenly into a `450 m`-deep dissolved limestone megablock sinkhole. A milky jade-emerald spring tarn fed by a warm karst cavern supports snow lotus, sky poppies, and emerald cushion domes amid the freezing alpine waste. |
| **6** | `coppertarn` | `seouterwall-coppertarn.html` | **`1288, 1184`** | **`+3,820 m`** | `0.99 atm` | `+4.0 °C` (`+15 / -7`) | `380 mm` | **`Dsc` / `Dfc`** | **Copper-Vein Tarn & The Stalker Shadow (Oasis #5):** Glaciated cirque at the headwaters of `Waita Guli` above Yuni Valley. Waterfalls stained peacock-blue and malachite-green by a hydrothermal copper-skarn vein feed a rock-basin tarn among crag pines and candle birches. Features an abandoned Yuni Geomancer ore-winch, a half-frozen `st_harpooner` wreck in the aufeis, and a live Stalker pair silhouetted on the rime-crusted eastern ridge toward Hub 01. |

---

## 6. Terrain & Hydrology Implementation Blueprint for Scale Model `5.1`

When ready to integrate into `tools/scale-model/smodel/se_provinces.py` (or `tranche3_biomes.py`) and `build_425_master.py`, the `SE outer wall` (`rmw4xy4tp9b29`) terrain and hydrology pass should execute the following deterministic steps on the unified `2 km/px` grid (note: if running on pre-shift `1549 × 1393` inside Step 2 of `build_425_master.py`, subtract `DX = 272, DY = 330` from all `(px, py)` below; if running post-shift on `1821 × 1723`, use `(px, py)` directly):

### 6.1 Step 1 — Regional Cordillera Rescaling (`8,303 m` -> `4,850 m` Median, Preserving Jagged Arêtes)
1. **Compute Polygon Mask & Feather Envelope:**
   - Rasterize `mask_seow` from `rmw4xy4tp9b29` (`SE outer wall`).
   - Compute interior distance `d_in = nd.distance_transform_edt(mask_seow)` and exterior feather distance `d_out = nd.distance_transform_edt(~mask_seow)`.
   - Define smooth blend weight `w_seow = np.where(mask_seow, G.sstep(0.0, 3.5, d_in), 0.35 * G.sstep(4.5, 0.0, d_out)) * sett_guard`.
2. **Compress Airless `8–15 km` Heights into the `+3,800–6,450 m` Alpine Cordillera Window:**
   - Decompose existing height `En` into a smooth regional baseline `E_base = nd.gaussian_filter(En, sigma=4.5)` and high-frequency ridge/valley relief `dE_hp = En - E_base`.
   - Map `E_base` inside `mask_seow` via a smooth concave alpine compression curve:
     $$E_{\text{alp\_base}} = 3850.0 + 2150.0 \cdot \tanh\left(\frac{\max(0.0,\, E_{\text{base}} - 3850.0)}{3600.0}\right)$$
   - Amplify multifractal arête and horn sharpness (`T.ridged` at scales `(1.5, 3.0, 6.0)`) so the central spine (`X = 1070..1310`) carries sharp **glaciated horn peaks and knife-edge arêtes at `+5,400–6,450 m`** (`EF` / `HT`) separated by `+4,200–4,900 m` periglacial slump benches (`ET`), with **zero cells above `6,500 m`** (eliminating the unbreathable `8–15 km` `Class O / HF` pancake while keeping dramatic `2,000–3,000 m` local relief above the pass and benches).
3. **Sculpt the 3 Northern Listric Slump Terraces Facing The Bowl (`Y = 1140..1215`):**
   - Along the northern crater-facing slope (`py < 1220`), apply three back-tilted rotational slump bench attractors at **`+3,500 m`, `+4,350 m`, and `+5,150 m`** (`w_step = np.exp(-((de / 220.0) ** 2))`), creating flat-to-back-tilted bench treads separated by sheer `600–850 m` pseudotachylite fault scarps overlooking The Bowl.

### 6.2 Step 2 — Carving The Godsgate Pass Corridor (`X = 1005..1058, Y = 1195..1315`)
1. **Domain-Warped Catmull-Rom Spline (`_eval_warped_pass_network`):**
   - Carve the primary **Godsgate Pass chain** with organic pinch-and-swell width modulation (`hw_px = 4.5..7.5 px` = `9–15 km` total width) and U-shaped glacial/fault trough cross-section along:
     ```python
     godsgate_chain = [
         # (px_51, py_51, target_floor_m, half_width_px)
         (1018.0, 1188.0, 2250.0, 6.5),  # Northern mouth into The Bowl / Guli rrija fan
         (1024.0, 1206.0, 2850.0, 5.5),  # North polygon boundary gorge
         (1026.0, 1224.0, 3380.0, 5.0),  # North Threshold Sill below Gate-Bell Tarn
         (1029.0, 1238.0, 3510.0, 4.8),  # Northern hanging trough
         (1031.0, 1252.0, 3620.0, 4.5),  # THE GODSGATE SADDLE DIVIDE (Station 1, +3,620 m)
         (1033.0, 1268.0, 3550.0, 4.8),  # Southern trough past Bāb al-Hawa shaft
         (1035.0, 1292.0, 3480.0, 5.2),  # Southern Narrows at Catch polygon border
         (1032.0, 1315.0, 2450.0, 6.8),  # Upper Kolli gravel fan in The Catch
         (1018.0, 1338.0, 1550.0, 8.5),  # Grades seamlessly to Kolli Oasis (#1) & Catch floor
     ]
     ```
   - Add a **Southwest Xanadu / Godshearth High Branch** bifurcating from the southern Godsgate at `(1034, 1282, 3510 m)` toward `(1004, 1308, 3680 m)` -> `(972, 1346, 3780 m)` so caravans bound for **Godshearth** (`844, 1394`) and **Xanadu** have a continuous, graded high-bench route along the southern toe of Godthrone without climbing above `3,850 m`.
   - Flank the pass at `(1008, 1248)` (**Ilmenite Horn**, `+5,480 m`) and `(1056, 1244)` (**Shatter-Crown**, `+5,760 m`) with steep `1,800–2,100 m` gate-tower buttresses.

### 6.3 Step 3 — Carving & Filling the 5 Hidden Highland Tarn Oases (`whas` & `wlev`)
Carve 5 circular-to-elliptical cirque/graben depressions (`r_tarn = 1.8..2.6 px` = `3.6–5.2 km`, surrounded by `r_amph = 4.5..6.5 px` sheltered rock walls) and set `whas = True` and `wlev` at their exact target elevations:

| Tarn # | Name | Center `5.1 (px, py)` | Legacy `4.23 (px, py)` | Water Level `wlev` (`m`) | Bed Elev `En` (`m`) | Radius (`px`) | Outlet Drainage River |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **Tarn of the Gate-Bell** | `(1016, 1236)` | `(744, 906)` | **`+3,680.0 m`** | `+3,662.0 m` | `1.8 px` | Spills E over `120 m` falls into `Guli rrija` (`r440`) -> **The Bowl** |
| **2** | **Amber-Sinter Tarn** | `(1064, 1272)` | `(792, 942)` | **`+3,940.0 m`** | `+3,924.0 m` | `2.0 px` | Feeds `Wādī al-Ṣakhr` (`r708`) SSW -> **The Catch** |
| **3** | **Mirror-Slump Tarn** | `(1134, 1218)` | `(862, 888)` | **`+4,120.0 m`** | `+4,096.0 m` | `2.2 px` | Seep/overflow N down listric scarp -> **`Rvr Bḥr` (`r050`) / The Bowl** |
| **4** | **Jade-Karst Polje** | `(1208, 1254)` | `(936, 924)` | **`+4,380.0 m`** | `+4,356.0 m` | `2.2 px` | Subterranean karst ponor NNE -> **`Wādī al-Jabal` (`r637`) / The Bowl** |
| **5** | **Copper-Vein Tarn** | `(1288, 1184)` | `(1016, 854)` | **`+3,820.0 m`** | `+3,798.0 m` | `2.0 px` | Headwater source of **`Waita Guli` (`r514`)** NNW -> **Yuni / E. Badlands** |

- Also clear the `24` accidental perched water pixels currently sitting at `5,726–5,965 m` at `(1075..1078, 1303..1308)` and `(1179..1182, 1347)` so the only water bodies inside `rmw4xy4tp9b29` are the **5 intentional Highland Tarn Oases**.

### 6.4 Step 4 — Monotonic Headwater River Grading & Climate Recalculation
1. **Enforce Strictly Monotonic River Thalwegs (`test_smodel.py` Check #6):**
   - Grade the 7 headwater rivers originating inside `rmw4xy4tp9b29` so every vertex descends monotonically from the new `+3,550–4,380 m` cirque/pass headwaters into its receiving basin:
     - **North into The Bowl:** `Guli rrija` (`r440`, from `(1031, 1248)` at `+3,590 m` down the northern Godsgate to `(1017, 1171)` at `-1,083 m`), `Wādī al-Jabal` (`r637`, from `(1249, 1195)` at `+4,150 m` to `-412 m`), and `Wādī al-Zulāl al-Ṣaghīr` (`r645`, from `(1279, 1179)` at `+4,180 m` to `+1,279 m`).
     - **Northeast toward Yuni / E. Badlands:** `Waita Guli` (`r514`, from Copper-Vein Tarn `(1288, 1184)` at `+3,820 m` to `(1285, 1121)` at `+3,412 m`) and `Loua Waita Guli` (`r505`, from `(1325, 1149)` at `+4,620 m` to `(1305, 1143)` at `+4,210 m`).
     - **South into The Catch:** `Wādī al-Qamar al-Kabīr` (`r464`, from the southern Godsgate `(1031, 1262)` at `+3,580 m` down to `(1031, 1317)` at `+2,350 m`) and `Wādī al-Ṣakhr` (`r708`, from Amber-Sinter Tarn `(1064, 1272)` at `+3,940 m` through `(1055, 1291)` to `(1039, 1382)` at `+344 m`).
2. **Lapse-Rate & Microclimate Recalculation (`smodel.climate`):**
   - Apply standard lapse-rate warming (`-6.5 °C / km` of elevation lowering) across `rmw4xy4tp9b29`, plus a `+3.0 °C` sheltered-cirque microclimate boost within `r <= 4.5 px` of the 5 tarns (and `+8.5 °C` geothermal boundary-layer boost at **Amber-Sinter Tarn**, `1064, 1272`), and `+60–140 mm/yr` orographic funneling through the Godsgate (`X = 1005..1055`).
   - **Resulting Climate Distribution inside `SE outer wall`:**
     - **`ET` (Alpine Tundra, `~58%`):** `+4,200–5,500 m` benches and felsenmeer (`tm = -2 to -8 °C`, `tw = +4 to +9 °C`).
     - **`EF` / `HT` (Glaciated Horns & Arêtes, `~18%`):** `+5,500–6,450 m` crest (`tm = -9 to -16 °C`, `tw < 0 °C`, **0% Class O / 0% HF**).
     - **`Dsc` / `Dsb` / `Dfc` (Subalpine Pass & Cirque Pockets, `~20%`):** `+3,350–4,250 m` Godsgate floor, northern slump toes, and Tarn Oases #1, #3, #5 (`tm = +1 to +6 °C`, `tw = +12 to +16 °C`).
     - **`BSk` / `Csb` (Dry Steppe Thresholds & Geothermal Tarn #2, `~4%`):** Southern Godsgate fan mouth and Amber-Sinter Tarn (`tm = +4 to +13.5 °C`).
