# Kirstabal: the staging town at the head of the Lower Xanadu Lake (site plan, proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall"*.

This is a site plan, not a build: no kit code and no pages. Everything not from the owner, the lore or the sim's tune is
*proposed*. Kirstabal is the map's name (Gemini's pin, `sl758m2396`); `LORE.md` does not mention it.

**The owner's answers (2026-11-16), section 7:** *"lake port. it has its own, smaller atitlan-like hinterland. barges can
stop at a landing with portage road. 3k is fine. bridge crosses it. make it a target on xanadu's page, it will use just
the normal xanadu kit. opium dried at kirstabal. road follows lake and gorge. Keb Riwa."*
- **Kirstabal is a lake port** on the apron at the head of the Lower Xanadu Lake, with **3,000 people**.
- **The lake is its hinterland**, after Lake Atitlán as the capital's lake is (`PROPOSAL-XANADU.md` 2a), but smaller:
  section 2a here.
- **The barges to Qiblai stop at a landing** at the lake's outlet, and a **portage road** runs past the cataracts.
- **A bridge crosses Keb Riwā's mouth.**
- **It is a target on Xanadu's page** and uses **only the normal Xanadu kit**: not the scrap set, not Qiblai's.
- **The opium is dried at Kirstabal**, in the latex house.
- **The road to Lāiṭwāl follows the lake and the Opal River's gorge.**
- **The river is Keb Riwā.**

**And later the same day:** *"villages sound fine. The White Monastery (name TBD) runs the latex house. The Red Monastery
(name also TBD) runs Sekrid. Landing belongs to Scarp province"*.
- **The lake's nine villages stand** as section 2a gives them.
- **The White Monastery runs the latex house** at Kirstabal, and **the Red Monastery runs Sekriḍ**. Both names are still
  to come. **They are two of Qiblai's eight great monasteries, the white and the crimson** (the owner, 2026-11-16: "yes the
  white and crimson of qiblai"; `kits/qiblai/PLAN.md` 2b: each has its colour and its Prismarch on the council).
- **The White Monastery takes a share of the opium it dries and a small fee** (the owner, 2026-11-16). Section 4 has the
  numbers, all *proposed*.
- **Each great monastery also takes 1/8 of the Council's income** (the owner, 2026-11-16: "the great monasteries
  additionally each take 1/8 of the Council's income"). So the White and the Crimson draw their eighths at Qiblai, as the
  Order's saffron house already does (`T.orderHouse.share`, 1/8), on top of what the White earns at Kirstabal.
- **The Council keeps some** (the owner, 2026-11-16, asked whether eight eighths leave it nothing: "No, Council keeps
  some"). So the eighths are of what the Council shares out, not of its whole income. **The Council keeps a fifth** (the
  owner, 2026-11-16: "A fifth"), for the Temple Mountain, the Hall of the Decree and its offices (*proposed* uses). The
  eight monasteries take an eighth each of the rest: **a tenth of the whole each**.
- **The Landing belongs to the Scarp** (P5), with the rest of the lake.

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
| The river | **Keb Riwā** (`r107`, 780 m³/s, 135 m wide, 4.6 m deep; the owner, 2026-11-16: the town calls it Keb Riwā), the Oidong Valley's trunk river. The model's edit 5.1.5 restored the name, "cave river"; the region data and Strongbow's notes still say *Rīfar al-Jadwal*. It crosses the lip at px 1000.5,1598 (bed 1,326 m), drops to 249 m by 996.5,1596.5 (the cataract, about **1,080 m in 4 km**), runs down the scarp's foot (-1,240 m at 993,1598) and enters the lake at **989.5,1597.5** (-1,655 m), **5 km north of the pin**. Two wadis, Jeḍ Ḍrāi (jade wadi, `r786`) and Sekriḍ Ḍrāi (sacred wadi, `r585`), come down to the same head |
| The scarp | straight behind the town to the east: from -1,530 m at x 991 to -267 m at 995 and **+1,295 m at 999**, about **2,900 m in 16 km**. That averages 180 m a km, with 300-330 m a km (17-18°) at x 994-996. Strongbow's lip is at 1001,1596 (**1,400 m**) |
| Climate | apron **31-33 °C** mean, **800-1,250 mm**, `Af`; lake surface 30-36 °C on the model. The scarp cools upward: 29 °C, 1,180 mm, `Af` at -1,100 m; 25 °C, 1,300 mm, `Cfa` at -270 m; 19 °C, 1,180 mm, `Cfb` at +770 m; 14-15 °C, 700-925 mm, `Cfb` on the lip. There is a `Csb` cell at 997,1608 |
| Air | about **1.98 atm** on the apron (the opal valley plan's 1.59 at 60 m and 1.35 at 1,340 m, carried down); 1.34 at Strongbow's lip |
| Within 15 km | 708 km²: **268 km² of lake** and 440 km² of land. The land runs from -1,674 to +283 m, and **208 km² of it is under 60 m a km**: the apron and the floor south of the lake. By height: 276 km² from -1,700 to -1,400 m (31 °C, 930 mm, Af/Cfa), 108 km² from -1,400 to -500 m (29 °C, 1,090 mm), 56 km² from -500 to +500 m (23.5 °C, 1,215 mm, Cfa/Cfb) |
| Neighbours | **Strongbow's foot** (the arcology's lobby and its town of ~3,500) at the scarp's toe north of the river mouth, about **12-16 km by the ground**. **Qiblai** at the lake's far end, 112 km by water and about 22 km past the cataracts. **The Opal River** (`r682`, Sitār Ḍrāi, 115 m³/s) enters the lake's south shore at **955,1606**, about 35 km west. **Opal Valley's mouth** (`biomes/opalvalley` station 5, the toll-quay) is at 972,1636 up that river's gorge, and **Lāiṭwāl** is at 1028,1653 |

**The floor south of the town.** South of the lake the floor rises gently from -1,650 m at y 1604 to about -1,300 m at y
1616, over x 960-991. This is the broadest farmland near the town. It ends at y ~1620 against the Rift's inner wall, a
3,600 m rise in 6 km (to 2,089 m at 979,1622 and 2,623 m at 979,1624). There, flat cells at exactly -1,530 m (970-975,
1626-1628; 980-983, 1620) look like a carve's floor and not ground: **for the scale-model session to check.**

**The lake's shores.** The whole shore is low, hot and gentle: 230 km of it, -1,670 to -1,520 m, 31-32 °C, 800-1,110 mm,
`Af`, with slopes of 12-97 m a km. There are no islands. Both sides rise 300-1,300 m within 20 km: on the north to
-350 to -840 m, and on the south to -740 to -1,210 m. The south side's middle (955-970) is `Cfa`, with
1,080-1,130 mm. Waters entering the lake:
- Keb Riwā and Jeḍ Ḍrāi at the head (989.5,1597.5);
- Sekriḍ Ḍrāi on the north shore (984.9,1587.5);
- **the Opal River** (Sitār Ḍrāi, `r682`, 115 m³/s) on the south shore at 955,1606.

**The roads on the ground** (surveyed; the lines are the owner's choice of 2026-11-16, their details *proposed*):

| Road | By the ground | The tune |
|---|---|---|
| To **Qiblai** | by barge down the lake, 112 km from the head to **the Landing** at the outlet (~932,1600, -1,660 m on the south bank; the owner: "barges can stop at a landing with portage road"). From there the **portage road** runs about 22 km beside the cataracts of Nahr ash-Shalālāt (-1,686 m to -1,860 m) to Qiblai's ghats. The south shore's apron and fans (-1,665 to -1,480 m) could also carry a towpath | `road.qb-ks`: 108 km, barge |
| To **Strongbow** | north 5 km over the apron to Keb Riwā's mouth, over **the bridge** (the owner, 2026-11-16), then up the toe to the foot, about 12-16 km in all. The lift goes on up 3,100 m to the lip | `road.ks-sb`: 25 km, road (the distance to the lip's pin) |
| To **Lāiṭwāl** | **by the lake and the gorge** (the owner, 2026-11-16): 35 km along the south shore or by barge to the Opal River's mouth (Ōpal-Māuṭh, section 2a), up the gorge (-1,685 m to the mouth bench at +60 m, about 40 km) past the Sultan's toll-quay at the valley's mouth (`biomes/opalvalley` station 5), then up the valley about 120 km: **about 190 km** | none yet |

## 2. Who lives there: 3,000

**3,000** (the tune's figure, `town('sl758m2396', ..., 3000)`; the owner, 2026-11-16: "3k is fine"). Kirstabal is **the seat of the Scarp** (P5, *Siqārp*: 25,000 rural people, the plantations on the scarp's slopes),
**the staging town between Qiblai and Strongbow**, and **the barge port** at the lake's head. *Proposed*, by trade:

| Who | People | Where |
|---|---|---|
| The barge and lake people: bargemen, the boatyard, fishers and their households | ~550 | the harbour quarter |
| The warehouses: porters, weighers, storekeepers, the Month Store (the salt), the factors' clerks | ~400 | the harbour quarter and the bazaar |
| The caravan trade inward from the lift: the serai, grooms, drovers, carters | ~300 | the serai quarter by the Strongbow road |
| The Scarp's works: the tea factory and the cacao fermentaries | ~400 | the works quarter, at the south edge |
| **The White Monastery's house**: its monks and lay workers, who run **the latex house**, where all the Scarp's opium is dried, balled and sealed (the owner, 2026-11-16) | ~150 | the daughter house on the scarp's toe; the latex house in the works quarter |
| The bazaar's traders and the crafts (smiths, potters, rope and sail makers, the oil lamps' keepers) | ~600 | the bazaar and the streets off it |
| The province's seat: the governor of the Scarp, the tax post, the tithe granary's keepers, a garrison of ~80 | ~250 | the seat beside the bazaar |
| The Decree's lay temples: a gate temple, the harbour shrine | ~50 | the gate and the quay |
| **The Brotherhood of the Two Horns**: the factor house (`horns.kirstabal`, 20 in the tune) | 20 | on the bazaar |
| Others: households, servants, the poor | ~280 | through the town |

Plus the Scarp's **25,000 rural people** (the tune's bulk district). *Proposed*, about **13,000 of them live round the
lake** (section 2a), about **1,000 in 3-4 ring villages** on the floor south of the town (the proposal's section 3e), and
about **11,000 on the scarp**: tea on its middle slopes, the sky poppy and saffron on the cool lip.

## 2a. The lake: a smaller Atitlán (the owner, 2026-11-16)

The owner: *"it has its own, smaller atitlan-like hinterland"*. The capital's lake is Atitlán at 46 times the area, with
about twenty lake towns, some two hundred hamlets and five hundred boats (`PROPOSAL-XANADU.md` 2a). The Lower Xanadu Lake is
**3,552 km²** (60% of the capital's lake), but long and thin (114 by 40 km), with no islands and no volcanoes, and its
shores hold about an eighth as many people (~16,000 with Kirstabal, against ~120,000). Its ring is a village ring, not a
town ring.

*Proposed:* **nine lake villages** about 25 km apart round the 230 km shore, **about 25 lake hamlets** of 150-240 between
them, and Kirstabal as the one hub.

**The villages.** The places are surveyed shore cells, to be snapped to the 1:1 shore by `core/hamlet`. The names are
coined Xanadui in the style of the capital's lake towns (English in Indic letters), all *proposed*.

| Shore | px | Name (gloss) | People | Trade |
|---|---|---|---|---|
| Head (east) | 989,1600 | **Kirstabal** | 3,000 | the hub: the barge port, the bazaar, the Scarp's seat (section 3) |
| North, at the head | 986,1588 | **Sekriḍ** (sacred) | 800 | **the Red Monastery's village** (the owner, 2026-11-16): the shrine village at the sacred wadi's mouth, its house and estate, and the Decree's pilgrims to the cataract. *Proposed:* the monastery holds the village's land and fishing as Qiblai's temple estates hold theirs |
| North | 975,1587 | **Phisharī** (fishery) | 1,400 | the lake's fishing village and its fish market; the dugouts' beach |
| North | 963,1586 | **Kāko-Bāgh** (cacao garden) | 1,200 | cacao groves on the north slope behind it (`Cfa`, 1,035 mm at 8 km back) |
| North | 948,1589 | **Rīḍ** (reed) | 700 | reeds, lotus root and willow: the mats and baskets |
| West (the outlet) | 932,1600 | **The Landing** (*Lānḍing*) | 600 | the barges' landing and the portage road's head to Qiblai (the owner, 2026-11-16): ox-carts, porters, the transfer sheds. **The Scarp's** (P5), not Qiblai's (the owner, 2026-11-16) |
| South | 938,1606 | **Ṭimbar** (timber) | 700 | the floor's timber floated down the lake to Kirstabal's boatyard |
| South | 955,1607 | **Ōpal-Māuṭh** (opal mouth) | 1,200 | at the Opal River's mouth: the ferry and the start of the gorge road to Opal Valley and Lāiṭwāl; Opal Valley's goods come down here |
| South | 967,1606 | **Rāis-Ṭeras** (rice terraces) | 1,000 | rice and grain terraces on the south side's wetter middle (`Cfa`, 1,080-1,130 mm) |
| South, at the head | 979,1605 | **Kaṭal** (cattle) | 700 | herds on the floor south of the lake; hides and dairy |
| | | **Nine villages** | **8,300** | plus ~25 hamlets (~5,000) |

**The boats**, scaled from the capital's lake to about 16,000 lake people (*proposed*):
- ~50 fishing dugouts;
- ~20 cargo boats and lake barges (the barge road to the Landing among them);
- ~8 passenger launches.

**The traffic** (*proposed*):
- Launches run hub-and-spoke from Kirstabal to every village and back.
- **The long run** to the Landing (112 km) goes once a day each way, about 9 hours at 12 km/h.
- **The market week:**
  - Kirstabal's market takes two days.
  - The Landing and Ōpal-Māuṭh take one each.
  - Phisharī's fish market takes one.
  - The rest go to market at the nearest of these.

The boats are the same Xanadu lake craft the capital's lake owes (a launch, a dugout, a cargo barge).

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
  the stables, a camping ground for overflow (a `core/camp` caravan halt), and **the bridge over Keb Riwā's mouth** (the
  owner, 2026-11-16): 135 m of river, on stone piers with Xanadu's arches (*proposed*).
- **The works quarter** at the south edge, downwind of the lake breeze: the tea factory's withering lofts and rolling
  floors, the cacao fermentaries and drying floors, and **the latex house**, run by **the White Monastery** (the owner,
  2026-11-16). There the Scarp's raw latex is dried on racks, balled and sealed for the Treasury and the gateways. It is a
  walled compound with whitewashed drying halls and the monastery's white banner. *Proposed:* the monks seal the balls,
  and the Sultan's weigher at the gate counts the Treasury's due (2,000 kg a year).
- **The houses.**
  - The rich courtyard houses are on the lakefront either side of the harbour, where the breeze is.
  - The middle houses fill the grid between the Lamp Way and the works.
  - The poor are at the south and east edges, by the works and toward the scarp.
- **The White Monastery's daughter house** (*proposed*) on the scarp's first spur east of the town (about 992,1602,
  -1,350 to -1,530 m), 150-300 m over the roofs. Its terraces look at the cataract, and its stair comes down to the latex
  house. It is drawn with the Xanadu kit's monastery in white, not with Qiblai's kit (the owner: the normal Xanadu kit
  only).
- **The ring villages** (`core/hamlet`) on the floor south of the town, 4-11 km out as Erehwon's and Qiblai's rings are (built at
  K4: Mil 987.5,1601.8, Kanāl 986.5,1603, Grēnz 988.8,1602.6 and the ranch Bāiyar 985.5,1604.5; about +30 to +45 m over the lake): grain,
  rice and cacao. Up the scarp are the plantation hamlets: tea at 0 to +1,000 m, poppy and saffron near the lip.
- **The lake** (section 2a): the launches' quay beside the barge quays. Sekriḍ is about 25 km off, up the north side of the lake's
  head, and the other eight villages lie down the two shores.

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
| **The lower lake's villages** (section 2a) as `T.lowerLake`, read by the same `lakeTown` as `T.lake`: nine villages with their trades, in P5, hub Kirstabal; their people come off P5's bulk district | the owner's smaller Atitlán. The fishing villages get `T.fishery` works; the town and Strongbow eat 56 t of fish a year and catch none |
| **A market-boat round** on the lower lake (`T.rounds`: `round.lower`, Kirstabal and the villages) | the pots, mats, honey, fruit and fish go round as on the capital's lake |
| **The Landing** (`xan.landing`, 600, `lake`) and **the split of `road.qb-ks`**: the barge Kirstabal to the Landing (112 km), then the portage road from the Landing to Qiblai (~22 km) | the owner: "barges can stop at a landing with portage road". Gemini's 108 km is the lake alone |
| **The latex house** (`ks.latex`): the opium's drying as a batch (raw latex in, opium out, at a loss of weight), so the province's opium share lands as latex and leaves as opium. It is **the White Monastery's** work: a house record beside the town, as `T.orderHouse` is beside Qiblai (`['qb.white.kirstabal', ..., 'sl758m2396', 992, 1602, 150]`) | the owner: "opium dried at kirstabal", run by the White Monastery. It needs a raw good (`latex`) beside `opium` in `T.goods`, or the latex house stays a store if the tune keeps one good. **The share and the fee** (the owner, 2026-11-16: "takes a share and a small fee"; the figures *proposed*): a **cut of 1/20** on the opium that lands at Kirstabal on the Scarp's tithe road (`tithe.p5`), to the house, as the Order's house takes its cut of the oil. That is about 6 t of the province's 120 t a year. **The fee is a fixed yearly transfer of 200 dinars** from the seat to the house (`77-sim-6-transfer.js`), against the Sultan's grant of 500 to the whole council. The house sells its opium on by want, as the Two Horns' factors do. **Beside this the White Monastery takes its eighth of the Council's income at Qiblai** (the owner, 2026-11-16: each great monastery takes 1/8). That eighth is not Kirstabal's: in the tune it generalises `T.orderHouse` to eight houses, a change on Qiblai's side (below) |
| **Sekriḍ as the Red Monastery's** village: its `lakeTown` record with the crimson monastery of Qiblai as its holder | the owner: the Red Monastery, Qiblai's crimson, runs Sekriḍ. On the sim it is a lake village like the rest, until the council's houses have records of their own |
| `ks.boatyard` and `ks.serai`, stores (`out:[]`, as Erehwon's dockyard) | so the barge and caravan people are works the sim can count |
| The ring villages, 3-4 declared (`KHAMLET` `xanadu` row) | the proposal's section 3e; the rest of the Scarp stays bulk |
| Retime `road.ks-sb` to the ground (12-16 km, over the bridge) plus the lift's hours | the 25 km is to the lip's pin, but the goods land at the foot |
| **`road.ks-lw`, to Lāiṭwāl**, by the lake and the gorge (the owner): Kirstabal to Ōpal-Māuṭh by barge (35 km), then up the gorge and the valley (~155 km) | Lāiṭwāl's plan sends opal, moonglass, lenses and pearls down through Kirstabal and Strongbow, and takes grain, tea, dried fruit and iron up. Its step L1 adds the town to the tune |

**On Qiblai's side, not this step's** (the owner, 2026-11-16: "the great monasteries additionally each take 1/8 of the
Council's income"): today the tune gives an eighth only to the Order's house (`T.orderHouse`, `qb.order`). The rule makes
that eight houses, one per colour, among them the white (whose daughter house is at Kirstabal) and the crimson (which
holds Sekriḍ). **The Council keeps a fifth first** (the owner, 2026-11-16): a fifth of the Prismarchy's oil cut and of the
Sultan's grants of esteem stays with the Council at Qiblai, and each house takes 1/8 of the rest. So each house takes a
tenth of the whole, and **the Order's house goes from today's 1/8 to 1/10** (`T.orderHouse.share`). The change belongs to the Xanadu tune's owner session with Qiblai's
monasteries, and `test-xan-economy.js` should check that the Council's keep and the eight eighths add to the whole, with
the keep above zero. Kirstabal's K1 only adds the White Monastery's latex share and fee.

*Proposed, for the owner:* Lāiṭwāl's road list also has sugar going up, which the native rule (`TRADE-SCOPE.md:161`) gives
to the Ring Isles and the SW lowlands. That is for Lāiṭwāl's plan to settle.

## 5. Core adoption (to write in full before the first fragment)

Following `README.md`, "CORE MODULES ARE NOT OPTIONAL":

| Need | Take |
|---|---|
| The town's streets, lots and infill | **`core/city`** (`KCITY`): the comb of section 3 as its main streets, side streets and alleys; lots by quarter; infill by the trades table of section 2 |
| The buildings | **`kits/xanadu`** only (the owner, 2026-11-16: "make it a target on xanadu's page, it will use just the normal xanadu kit"): no scrap set, no Qiblai kit. The kit gives houses poor to rich, the bazaar, the serai, the granary, the gate and the monastery. Pieces it lacks go into the kit itself, as Xanadu pieces any town could use: wind-catchers, a harbour mole and quays, a barge slip, the bridge, withering lofts, a fermentary, the latex house, the generator house |
| The page | **a target on Xanadu's page**, built as Qiblai's city is: `settlements/kirstabal/build.py` runs `settlements/xanadu/build.py` with this folder's `targets/town` and `core/city` sealed in one closure (Qiblai's `gen/69q-kcity-bundle.js` pattern), with no kit of its own in `kit.json`. Start `build.py` and `verify.py` from `tools/new_build/` and list the build under every check in `tools/checks_optin.json` |
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
| **K1** | The tune: the works and roads of section 4 (the lower lake's villages and their round, the Landing and the portage, the latex house, fishery, boatyard, serai, the ring villages, the retimed road over the bridge, the road to Lāiṭwāl after its L1) | `test-xan-economy.js`: fed (with Strongbow), the staging checks (14) through the Landing, the salt kept a month, the generator (the light), the dues; the lower lake's round reaches every village |
| **K2** | The town on `core/city` with the Xanadu kit, as a target on Xanadu's page | `core/city`'s tests; no overlap; the GPU verify (`--assert`) |
| **K3** | The harbour, the lake shore, Keb Riwā's mouth and the bridge, and the cataract as the skyline (`core/water`, `core/coast`) | water checks; the bridge's piers on the bed; nothing floats |
| **K4** | The lake's nine villages and hamlets, the ring villages and the plantation hamlets (`core/hamlet`, `kits/crops`); the boats drawn on their runs once the lake craft exist | the hamlet tests; every village on its shore cell at 1:1; no trees on the scarp's cliffs |
| **K5** | Interiors: the serai, the factor house, the governor's house, the tea factory, the latex house | the interiors' checks |
| **K6** | The site in the open world, with Strongbow's foot and the road between | the region's verify |

**Built (2026-11-16; the owner: "build k0-4"),** on `claude/kirstabal-plan-3bc37d`:
- **K0.** The pin stays at 989,1600. The page's frame is centred at px 988.33,1599.4, about 450 m inland of the model's
  shore. The -1,530 m flats were reported to the scale-model session. No edit was needed.
- **K1.** `core/region/data/xan-tune.js` and `test-xan-economy.js` checks 23-25 (50 of 50 pass). The ring sits 4-11 km
  out (moved in from the first draft's 11-23 km). The road to Lāiṭwāl waits for Lāiṭwāl in the tune.
- **K2.** `settlements/kirstabal`: the town on core/city as a target on Xanadu's page, with only the Xanadu kit
  (`README.md`). About 440 buildings and 2,850 people. The caravanserai, the latex house, the tea factory and the fermentaries
  are new Xanadu kit pieces (`kits/xanadu/src/87k-xa-lake-trades.js`, opt-in, 2026-11-16).
- **K3.** The harbour (quays, mole, lighthouse, boat sheds), the lake (core/water open), Keb Riwā from the lip down the
  scarp to its mouth (core/water flow) and the bridge on the Strongbow road. `core/coast` is not taken: the lake's shore
  near the town is designed ground, and the open world (K6) takes core/coast.
- **K4.** The ring's four villages (drawn) and the lake's nine (records for K6) on core/hamlet. The lake's villages fish
  (the owner, 2026-11-16: "work on fishing villages"): boat sheds, fish racks and a quay at the shore, on the Xanadu row
  extended with fishing works (`KS_RING.fishingRow`). One lake hamlet, Jāl, is drawn on the town's own shore 3 km south-west.
  The boats wait for the lake craft.
- **The Rift climate** (the owner, 2026-11-16: "implement rift climate"). The flora row above changed: the country grows the
  Rift kit (`biomes/rift`) on today's core/biome, not the Vale's `biomes/xanadu`, zoned by one wetness field (jungle along
  the lake and Keb Riwā and toward the scarp's foot, savannah inland) that also tints the grass, under the Rift's air
  (`targets/town/90m-ks-flora.js`, `ksWet` in 89zk). The scarp's cloud forest and tea belt are still to come.

## 7. Questions for the owner

1. ~~**The site.**~~ **Answered 2026-11-16: a lake port**, on the apron at the lake's head, "with its own, smaller
   atitlan-like hinterland" (section 2a).
2. ~~**The barge to Qiblai.**~~ **Answered 2026-11-16: the barges stop at a landing with a portage road** past the
   cataracts (the Landing, section 2a).
3. ~~**How many people?**~~ **Answered 2026-11-16: 3,000.**
4. ~~**Keb Riwā's mouth.**~~ **Answered 2026-11-16: a bridge crosses it.** Still open, *proposed*: Xanadu's own stone piers
   and arches. The other choice is Ancient work reused, with the Rift line's end so near.
5. ~~**Its page.**~~ **Answered 2026-11-16: a target on Xanadu's page, with only the normal Xanadu kit.**
6. ~~**The latex house.**~~ **Answered 2026-11-16: the opium is dried at Kirstabal.** The crops' belts (tea on the middle
   slopes, cacao and grain on the floor, the poppy and saffron on the lip) stand as *proposed*.
7. ~~**Lāiṭwāl's road.**~~ **Answered 2026-11-16: by the lake and the gorge.**
8. ~~**The river's name.**~~ **Answered 2026-11-16: Keb Riwā.** The region data (`openworld/oidong-highrift`,
   `openworld/xanadu-oidong-highrift`) and Strongbow's notes still say *Rīfar al-Jadwal*, for their sessions to follow.
9. ~~**The lake's ring.**~~ **Answered 2026-11-16: "villages sound fine."** Nine villages, about 8,300 people, and some 25
   hamlets, with the names of section 2a.
10. ~~**Whose is the lake's west end?**~~ **Answered 2026-11-16: the Landing belongs to the Scarp province.**
11. ~~**The two monasteries.**~~ **Answered 2026-11-16: the white and the crimson of Qiblai's eight great monasteries.**
    Their names are still to come (the owner: "name TBD"), with the rest of the eight (`kits/qiblai/PLAN.md` question 1).
12. ~~**The White Monastery's cut.**~~ **Answered 2026-11-16: it takes a share and a small fee.** The proposed figures
    (section 4): a twentieth of the opium that comes in to be dried (about 6 t of the Scarp's 120 t a year) and a fee of
    200 dinars a year from the seat. Are they the right size?
13. ~~**The Council's keep.**~~ **Answered 2026-11-16: a fifth.** Each great monastery takes 1/8 of the rest, a tenth of
    the whole, and the Order's house goes from 1/8 to 1/10.
