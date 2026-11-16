# Kirstabal: the staging town at the head of the Lower Xanadu Lake (site plan, proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall"*.

This is a site plan, not a build: no kit code and no pages. Everything not from the owner, the lore or the sim's tune is
*proposed*. Kirstabal is the map's name (Gemini's pin, `sl758m2396`); `LORE.md` does not mention it.

Sources:
- `core/region/data/xan-tune.js` (`XAN_TUNE`) and `core/simulation/PROPOSAL-XANADU.md`, sections 2, 3d, 6 and 7: the
  province, the sim and its roads.
- `settlements/strongbow/PLAN.md` on `claude/keen-swanson-68a311`: Strongbow's town at the foot and the lift.
- `settlements/lightwall/PLAN.md`: Lāiṭwāl, the new opal town up Opal Valley.
- `biomes/opalvalley/PLAN.md`: the valley's mouth and the Sultan's factors.
- `kits/qiblai/PLAN.md`: Qiblai and its ghats on Nahr ash-Shalālāt.
- The scale model 5.1 (`tools/scale-model/model/data`, 2 km a pixel):
  - `h.png` and `wl.png` decoded as `(R*256+G)/65535*29600-2600` m, with B>127 meaning water;
  - `tm.png` (mean °C + 90), `p.png` (rain = byte/255*4000 mm) and `c.png` (classes from `climate.json`);
  - `rivers.json`.

## 1. The site

**Kirstabal is at the eastern head of the Lower Xanadu Lake.** It stands on the flat apron between the lake and the foot of
the Oidong–Xanadu scarp, just south of where Keb Riwā falls off the scarp into the lake. The pin is **px 989,1600**.

| | |
|---|---|
| Ground | the shore apron: **-1,665 to -1,620 m**, flat (5-30 m a km), cells 987-991 by 1598-1607, about 10 km along the shore and 4-8 km deep. The pin's cell is -1,661 m |
| The lake | **the Lower Xanadu Lake** (the model's gloss for Nahr ash-Shalālāt's source, `smodel/river_names.py`): water at **-1,685 m**, **3,552 km²**, px 934-991 by 1587-1607, **114 km long and up to 40 km wide**, its bed to -1,838 m. Kirstabal is at its eastern tip. It has an outflow, so it is fresh |
| Its outflow | **Nahr ash-Shalālāt** (`r_xanadu_low_cataracts`, **1,180 m³/s**) leaves the west end at px 932,1598. It falls by low cataracts past **Qiblai** (922,1595, -1,860 m: 175 m down in about 22 km) and runs on to the Lizardman Rift Sea |
| The river | **Keb Riwā** (`r107`, 780 m³/s, 135 m wide, 4.6 m deep), the Oidong Valley's trunk river, called *Rīfar al-Jadwal* in the region data and in Strongbow's notes. The model's edit 5.1.5 restored *Keb Riwā*, "cave river". It crosses the lip at px 1000.5,1598 (bed 1,326 m), drops to 249 m by 996.5,1596.5 (the cataract, about **1,080 m in 4 km**), runs down the scarp's foot (-1,240 m at 993,1598) and enters the lake at **989.5,1597.5** (-1,655 m), **5 km north of the pin**. Two wadis, Jeḍ Ḍrāi (jade wadi, `r786`) and Sekriḍ Ḍrāi (sacred wadi, `r585`), come down to the same head |
| The scarp | straight behind the town to the east: from -1,530 m at x 991 to -267 m at 995 and **+1,295 m at 999**, about **2,900 m in 16 km**. That averages 180 m a km, with 300-330 m a km (17-18°) at x 994-996. Strongbow's lip is at 1001,1596 (**1,400 m**) |
| Climate | apron **31-33 °C** mean, **800-1,250 mm**, `Af`; lake surface 30-36 °C on the model. The scarp cools upward: 29 °C, 1,180 mm, `Af` at -1,100 m; 25 °C, 1,300 mm, `Cfa` at -270 m; 19 °C, 1,180 mm, `Cfb` at +770 m; 14-15 °C, 700-925 mm, `Cfb` on the lip. There is a `Csb` cell at 997,1608 |
| Air | about **1.98 atm** on the apron (the opal valley plan's 1.59 at 60 m and 1.35 at 1,340 m, carried down); 1.34 at Strongbow's lip |
| Within 15 km | 708 km²: **268 km² of lake** and 440 km² of land. The land runs from -1,674 to +283 m, and **208 km² of it is under 60 m a km**: the apron and the floor south of the lake. By height: 276 km² from -1,700 to -1,400 m (31 °C, 930 mm, Af/Cfa), 108 km² from -1,400 to -500 m (29 °C, 1,090 mm), 56 km² from -500 to +500 m (23.5 °C, 1,215 mm, Cfa/Cfb) |
| Neighbours | **Strongbow's foot** (the arcology's lobby and its town of ~3,500) at the scarp's toe north of the river mouth, about **12-16 km by the ground**. **Qiblai** at the lake's far end, 112 km by water and about 22 km past the cataracts. **The Opal River** (`r682`, Sitār Ḍrāi, 115 m³/s) enters the lake's south shore at **955,1606**, about 35 km west. **Opal Valley's mouth** (`biomes/opalvalley` station 5, the toll-quay) is at 972,1636 up that river's gorge, and **Lāiṭwāl** is at 1028,1653 |

**The floor south of the town.** South of the lake the floor rises gently from -1,650 m at y 1604 to about -1,300 m at y
1616, over x 960-991. This is the broadest farmland near the town. It ends at y ~1620 against the Rift's inner wall, a
3,600 m rise in 6 km (to 2,089 m at 979,1622 and 2,623 m at 979,1624). There, flat cells at exactly -1,530 m (970-975,
1626-1628; 980-983, 1620) look like a carve's floor and not ground: **for the scale-model session to check.**

**The roads on the ground** (surveyed; the lines are *proposed*):

| Road | By the ground | The tune |
|---|---|---|
| To **Qiblai** | the lake, 112 km from the head to the outlet at 933,1598. The south shore is 1-6 km of apron and fans all the way (-1,665 to -1,480 m) and could carry a towpath or road. From the outlet the cataracts need a **portage road of about 22 km** to Qiblai's ghats | `road.qb-ks`: 108 km, barge |
| To **Strongbow** | north 5 km over the apron to Keb Riwā's mouth, across the river, then up the toe to the foot, about 12-16 km in all. The lift goes on up 3,100 m to the lip | `road.ks-sb`: 25 km, road (the distance to the lip's pin) |
| To **Lāiṭwāl** | west 35 km along the south shore (or by barge) to the Opal River's mouth, up its gorge (-1,685 m to the mouth bench at +60 m, about 40 km), then up the valley about 120 km: **about 190 km**. The straight line, 132 km, crosses the divide at 4,800 m (`EF` at 1010,1628) | none yet |

## 2. Who lives there: 3,000

The tune's figure is **3,000** (`town('sl758m2396', ..., 3000)`); the proposal's section 3d says 2,200, and Gemini said
3,750. Kirstabal is **the seat of the Scarp** (P5, *Siqārp*: 25,000 rural people, the plantations on the scarp's slopes),
**the staging town between Qiblai and Strongbow**, and **the barge port** at the lake's head. *Proposed*, by trade:

| Who | People | Where |
|---|---|---|
| The barge and lake people: bargemen, the boatyard, fishers and their households | ~550 | the harbour quarter |
| The warehouses: porters, weighers, storekeepers, the Month Store (the salt), the factors' clerks | ~400 | the harbour quarter and the bazaar |
| The caravan trade inward from the lift: the serai, grooms, drovers, carters | ~300 | the serai quarter by the Strongbow road |
| The Scarp's works: the tea factory, the cacao fermentaries, the latex house (the poppy's opium dried and sealed) | ~500 | the works quarter, at the south edge |
| The bazaar's traders and the crafts (smiths, potters, rope and sail makers, the oil lamps' keepers) | ~600 | the bazaar and the streets off it |
| The province's seat: the governor of the Scarp, the tax post, the tithe granary's keepers, a garrison of ~80 | ~250 | the seat beside the bazaar |
| The Decree: a monastery and a gate temple | ~150 | the monastery on the scarp's toe |
| **The Brotherhood of the Two Horns**: the factor house (`horns.kirstabal`, 20 in the tune) | 20 | on the bazaar |
| Others: households, servants, the poor | ~230 | through the town |

Plus the Scarp's **25,000 rural people** (the tune's bulk district): grain and cacao villages on the floor south of the
lake, tea on the scarp's middle slopes, the sky poppy and saffron on the cool lip. The proposal's section 3e asks for
**3-4 ring villages** declared one by one round the town.

## 3. The layout (*proposed*)

This is a lakeshore town in the hottest country Xanadu has: the apron is as hot as Qiblai (31-33 °C mean, nearly 2 atm). It
is built like the Gulf's old ports, behind thick walls round courtyards, under arcades and wind-catchers, with work done at
dawn and dusk. It faces the lake breeze and turns its back on the scarp's heat. Its landmark is the scarp: Keb Riwā's
cataract hangs in sight to the north-east, and Strongbow's tower stands over the lip.

**About 60 ha**, 1 km along the shore and 600 m deep, on the apron centred near **989,1601**:

- **The harbour (the town's front).** A walled basin at the lake's head, with a mole against the swell up the lake's
  length. It has the barge quays, the boatyard and slips, the fish landing and the **Month Store** (the town keeps a month
  of its own salt: `road.ks-sb.keep = 30`). Warehouses line the quay street, and the Sultan's barge office is at the gate.
- **The Lamp Way.** The main avenue runs from the harbour inland to the bazaar and on to the north gate and the Strongbow
  road. It is **lit by the Sultan's oil licence** (`T.lit`: a tenth of the licence). The generator house stands at its
  inland end.
- **The bazaar and the seat** at the centre:
  - the covered bazaar;
  - the governor's house of the Scarp and the tax post;
  - the **tithe granary** (the province's grain, which feeds Strongbow too);
  - **the Two Horns' factor house** on the bazaar square, facing the serai road, the way the caravans' goods come in.
- **The serai quarter** at the north gate, toward Keb Riwā. It has the caravanserai for the loads coming in from the lift,
  the stables, a camping ground for overflow (a `core/camp` caravan halt), and the **bridge over Keb Riwā's mouth**: 135 m
  wide, on piers (or a ferry first, owner's question 4).
- **The works quarter** at the south edge, downwind of the lake breeze: the tea factory's withering lofts and rolling
  floors, the cacao fermentaries and drying floors, and the **latex house**, where the Scarp's opium is dried, balled and
  sealed.
- **The houses.**
  - The rich courtyard houses are on the lakefront either side of the harbour, where the breeze is.
  - The middle houses fill the grid between the Lamp Way and the works.
  - The poor are at the south and east edges, by the works and toward the scarp.
- **The monastery of the Decree** on the scarp's first spur east of the town (about 992,1602, -1,350 to -1,530 m), 150-300 m
  over the roofs. Its terraces look at the cataract.
- **The ring villages** (3-4, `core/hamlet`) on the floor south of the town (985-989, 1605-1611, -1,600 to -1,480 m): grain,
  rice and cacao. Up the scarp are the plantation hamlets: tea at 0 to +1,000 m, poppy and saffron near the lip.

The streets are a comb on `core/city`: the quay street along the shore, the Lamp Way across it, and side streets and alleys
between. Qiblai's mandala and Strongbow's rings are not for a working port.

## 4. The economy (for `XAN_TUNE`, after the owner's choices)

What the tune does now:

- **The town** (`sl758m2396`, 3,000, `town` diet) has only its market (`sl758m2396.market`). **It feeds Strongbow**
  (`feeder: 'sl758m2396'`), so it passes on that town's grain from the Scarp's tithe.
  - Its own grain is 3,000 × 160 kg = **480 t a year**, and Strongbow's 4,000 × 160 kg is **640 t**: 1,120 t in all.
  - The Scarp's surplus is about **1,640 t** (25,000 people at 1.3 t/ha: 3,545 farming households make about 5,760 t and
    eat 4,125 t). That is enough, but not by much once the seat's 85% cap is taken.
- **The roads:**

  | Road | Where | Down (from Kirstabal) | Up (to Kirstabal) |
  |---|---|---|---|
  | `road.qb-ks` | Qiblai, 108 km by barge, 3 carriers | the Scarp's tea, cacao, opium, saffron and silk, and the gateways' export goods for Strongbow, gathered from behind | Qiblai's grain, salt and tools |
  | `road.ks-sb` | Strongbow, 25 km by road, 2 carriers | grain, tools and the gateways' goods | Strongbow's tea and silk, and **the Catch's salt, iron and arms** |

  - **Salt, iron and arms come inward**: Strongbow to Kirstabal to Qiblai.
  - **Each road keeps 30 days** before it sends on, because a staging town short of a good sends none of it on (2026-11-16).
- **The toll is not Kirstabal's.** The Sultan's toll (`T.toll` = 0.05) and the Two Horns' tally (`T.horns.tally`) are taken
  at Strongbow's lift. Kirstabal's factor house is one of the houses that sells the Brotherhood's share back into its town.
- **The dues:** the Scarp's yearly bill to the Treasury is grain 15,000 kg, tea 2,500 kg and opium 2,000 kg
  (`T.dues.bills.sl758m2396`, after the harvest, day 215).
- **The province** (`p5`, *Siqārp*) sends its seat a share of tea (200 t), cacao (90 t), opium (120 t) and saffron (600 kg)
  a year.
- **The light:** the licence is 400,000 kg × 0.2, and Kirstabal's tenth of it is **8,000 kg of oil a year**. At 3 kWh a kg
  that is about 24,000 kWh, or **66 kWh a night**. That is about a hundred 60 W lamps for ten hours: the Lamp Way and the
  seat's and the richest houses' lamps, as the owner's rule says. The test catches a town whose generator runs dry
  (`elecCheck`).

**Proposed additions** (step K1):

| Addition | Why |
|---|---|
| `ks.fishing`, the lake's dugouts on the Lower Xanadu Lake (`T.fishery`, crew ~150) | the town and Strongbow eat 56 t of fish a year and catch none; the lake is 3,552 km² of fresh water |
| `ks.boatyard` and `ks.serai`, stores (`out:[]`, as Erehwon's dockyard) | so the barge and caravan people are works the sim can count |
| The ring villages, 3-4 declared (`KHAMLET` `xanadu` row) | the proposal's section 3e; the rest of the Scarp stays bulk |
| Retime `road.ks-sb` to the ground (12-16 km) plus the lift's hours | the 25 km is to the lip's pin, but the goods land at the foot |
| Split `road.qb-ks` into the lake (112 km) and a **portage road** past the cataracts (~22 km), with a landing at the outlet (933,1598) | barges cannot run the cataracts. Gemini's 108 km is the lake alone |
| **`road.ks-lw`, to Lāiṭwāl** (~190 km by the shore or barge, the Opal River's gorge and the valley) | Lāiṭwāl's plan sends opal, moonglass, lenses and pearls down through Kirstabal and Strongbow, and takes grain, tea, dried fruit and iron up. Its step L1 adds the town to the tune |

*Proposed, for the owner:* Lāiṭwāl's road list also has sugar going up, which the native rule (`TRADE-SCOPE.md:161`) gives
to the Ring Isles and the SW lowlands. That is for Lāiṭwāl's plan to settle.

## 5. Core adoption (to write in full before the first fragment)

Following `README.md`, "CORE MODULES ARE NOT OPTIONAL":

| Need | Take |
|---|---|
| The town's streets, lots and infill | **`core/city`** (`KCITY`): the comb of section 3 as its main streets, side streets and alleys; lots by quarter; infill by the trades table of section 2 |
| The buildings | **`kits/xanadu`** (`XAK`, by `kit_bundle.py`), as Qiblai and Erehwon use it: houses poor to rich, the bazaar, the serai, the granary, the gate, the monastery. Kirstabal is a target on Xanadu's page (`settlements/xanadu/build.py --target kirstabal`, as Qiblai is), or its own build if the owner prefers (question 5). Pieces the kit lacks go into the kit: wind-catchers, a harbour mole and quays, a barge slip, withering lofts, a fermentary, the latex house, the generator house |
| The ground | **`core/world`** (`WORLD.H`, `ROADS`): the site cut by `tools/scale-model/cut_site.py`. The place is inside both the `xanadu-oidong-highrift` box (origin px 1191,1569) and the recut `oidong-highrift` box (from px 976 since 2026-11-11). Which one draws it is the open-world session's call. **`core/terrain`** for the scarp's face |
| The lake, the river, the cataract, the harbour water | **`core/water`** (open for the lake with the shared wave field, flow for Keb Riwā, fall for the cataract); **`core/coast`** (`KCOAST`) for the lake's natural shore outside the harbour |
| Sky, heat, haze | **`core/atmos`** (`ATMOS.bindHost`), the standard skybox with the scarp and Strongbow as the local skyline |
| The villages and plantation hamlets | **`core/hamlet`** (`KHAMLET.village`, the `xanadu` row); what grows from **`kits/crops`** (`CROPS.at`: tea, cacao, sky poppy, saffron, vale rice) |
| The caravan halt by the serai | **`core/camp`** (`50-camp-tents.js` pitches a caravan halt) |
| Flora | **`core/biome`** with **`biomes/xanadu`**: its `floor` station (the Rift floor by Qiblai) for the apron, its `cloud` station for the scarp's tea belt |
| Interiors | **`kits/interiors`** and **`kits/catalog`**'s Xanadu pieces through **`core/furnish`** |
| Placement | **`core/rand`** (`KRAND`), **`core/tags`** (everything registered before it is drawn), **`core/space`** and **`core/mask`** |
| The economy and the people | **`core/region`**'s valley host (the town in `XAN_TUNE`), **`core/simulation`**, **`core/sched`**, **`core/clock`**; the Xanadui peoples in **`core/charactermodels`** |
| Viewer and tools | **`core/host`** (`KHOST`: inspector, polygon tool, probe), **`core/walk`**, **`core/materials`** (the Xanadu pack) |
| Not taken | **`core/ruins`**: nothing in the town is ruined (Strongbow's ruin is Strongbow's). **`core/engine`**: the Xanadu kit draws through its own engine, as on Xanadu's page |

## 6. Steps

| Step | What | Test |
|---|---|---|
| **K0** | The pin: keep 989,1600 or move it to 989,1601. A scale-model edit through the scale-model session's queue (`local_bf163a02-2efb-40a4-bfa4-9aa28273c65f`), with the -1,530 m flats south of the lake reported to it | the pin's cell is apron land, not water or scarp |
| **K1** | The tune: the works and roads of section 4 (fishery, boatyard, serai, the ring villages, the retimed roads, the portage, the road to Lāiṭwāl after its L1) | `test-xan-economy.js`: fed (with Strongbow), the staging checks (14), the salt kept a month, the generator (the light), the dues |
| **K2** | The town on `core/city` with the Xanadu kit, as a target on Xanadu's page | `core/city`'s tests; no overlap; the GPU verify (`--assert`) |
| **K3** | The harbour, the lake shore, Keb Riwā's mouth and the bridge, and the cataract as the skyline (`core/water`, `core/coast`) | water checks; the bridge's piers on the bed; nothing floats |
| **K4** | The ring villages and the plantation hamlets (`core/hamlet`, `kits/crops`) | the hamlet tests; no trees on the scarp's cliffs |
| **K5** | Interiors: the serai, the factor house, the governor's house, the tea factory | the interiors' checks |
| **K6** | The site in the open world, with Strongbow's foot and the road between | the region's verify |

## 7. Questions for the owner

1. **The site.** The ground puts Kirstabal on the apron at the lake's head, 5 km south of Keb Riwā's mouth and 12-16 km
   from Strongbow's foot. It is a lake port under the scarp, not a town on the scarp. Is that the Kirstabal you meant? The
   other choice is the cooler scarp, as a tea town at about +500 to +1,000 m: 19-23 °C, but slopes of 200-330 m a km.
2. **The barge to Qiblai.** The model's lake ends 22 km short of Qiblai, above the cataracts of Nahr ash-Shalālāt. Should
   there be a landing and portage at the outlet, which in the tune would be a small settlement, or is Qiblai's ghat way
   enough, with the barges stopping at the lake's end?
3. **How many people?** The tune says 3,000, the proposal 2,200 and Gemini 3,750. This plan uses the tune's 3,000.
4. **Keb Riwā's mouth.** Is it crossed by a bridge (135 m on piers: Xanadu building, or Ancient work reused?) or by a
   ferry? This decides whether the town and Strongbow's foot grow toward each other.
5. **Its page.** A target on Xanadu's page, as Qiblai is, or a build of its own?
6. **The Scarp's crops.** The plan puts tea on the middle slopes, cacao and grain on the hot floor, and the sky poppy and
   saffron on the cool lip, by the model's climate. Is the latex house (the opium sealed for the Treasury and the gateways)
   in the town, or at Strongbow under the Sultan's eye?
7. **Lāiṭwāl's road.** By the lake and the Opal River's gorge (~190 km, and part of it by barge), or by a pass over the
   divide (132 km, with the crossing at ~4,800 m on ice)?
8. **The river's name.** The model has *Keb Riwā* since edit 5.1.5; the region data and Strongbow's notes have *Rīfar
   al-Jadwal*. Which should the town call it?
