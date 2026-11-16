# The Kimr's pueblo sites: a scope (2026-11-16)

The owner, 2026-11-16: "Scope out the Labyrinth for good Kimr Pueblo sites assuming 1-2k per Pueblo + hamlet, 1k at the hall of
heroes, and 12k total Kimr pop."

This is a scope, not a build. Nothing here is drawn or pinned. Every site, name, size and pairing below is *proposed*, and every
figure marked (est.) is an estimate. Coordinates are scale model 5.1 px (1821 x 1723, 2 km a px).

**Sources.**
- The Labyrinth's plan, `PLAN-GATE.md`, `KIMR.md`, `LORE.md` 6.24, `lore/kimr-tongue.md`, and `kits/kimr` (README, PLAN). The fuller
  versions are on `claude/clever-wilson-6dc681`; this checkout holds only `PLAN.md`.
- `core/hamlet` README, `core/hamlet/32-hamlet-platform.js` and `core/region/WEST-RIFT-SCOPE.md`.
- The model's data (`tools/scale-model/model/data`, read with `smodel/page.py`):
  - heights `h`, decoded as `_dec`;
  - lakes `wl`;
  - `rivers`;
  - climate `tm`, `tw`, `tc` (L - 90 °C), `p` (L / 255 x 4,000 mm) and `c` (the Köppen class index);
  - the region polygons (`51-region-store.js`) and the pins (`60-settlements.js`).

The survey scripts and the map are in the session's scratchpad, not in the repo.

## 1. Assumptions and the head count

**The owner's numbers:**
- 12,000 Kimr in all;
- 1,000 at the Hall of Heroes;
- 11,000 in pueblos of 1,000-2,000, each with its hamlets.

**Not counted here:** Wildcat's Kimr half. It stays inside Wildcat's 400, as `WEST-RIFT-SCOPE.md` 3c says.

**Where the Kimr live.** The owner's `Kimr` political polygon (`rmwelrhij6khp`, 2026-11-13) spans px 188-398 x 1348-1619: the
chaos, the grabens and the neck. Its numbers:
- 40,070 cells (160,000 km²);
- 21,440 of those cells are floor under 3,000 m (about 86,000 km²);
- six of the Labyrinth's eight lakes lie inside it.

The pit chains in the west (px 90-188), with the two pit tarns, lie outside it. So does the Mesas station's floor. Every seat below
stands inside the polygon.

**How many pueblos: eight.**

Food does not set the count. 11,000 hunters on 86,000 km² of floor is 0.13 a km² (est.). That is well inside what a
megafauna steppe can feed: the plan says the floors "could feed a few tens of thousands".

Water and the rock set the count. A pueblo wants three things, and inside the polygon eight places have all three:
- standing or running water within about 5 km;
- a knob, a mesa bench or ground for a built plinth, as `PLAN.md` section 5 asks;
- climate warm enough for the steppe and the melons (Cfb or Csb, 9-12 °C here).

The eight are one per watered paddock:
- **the six lakes:** the gate lake, the chaos lake, the Paddocks lake, and graben lakes N, E and S;
- **two river reaches with no lake:** the Shatter-Scarp Gill between the Paddocks and the gate, and the Gowd Warra's knob garden
  above the neck.

Eight at 11,000 averages 1,375, inside the owner's 1,000-2,000.

Why not another number:
- **Seven** would leave one gap: either the 160 km corridor between the Paddocks and the gate with no seat, or the knob garden
  nearest the Hall empty.
- **Nine** would need a seat on dry ground or cold ground. The south-east chaos (px 330-380 x 1510-1590) lies 60-130 km from any
  river or lake on the model. The south mesas get 235-300 mm, BSk. The cold pit chains are Dfc at about 1 °C and outside the
  polygon.

**The great houses.** `LORE.md` 6.24 has two kinds of village:
- a great house (*greidhaws*): "a village of several hundred on its own rock, the head of the lesser villages round it", with an
  ally house (*mara*) and an enemy house (*ffiwd*);
- the lesser villages on the knobs about it.

Under the owner's numbers each pueblo is one seat with its hamlets. Four of the eight seats are *proposed* as great houses: the
four on the best water and the herds' main ground. The other four are lesser pueblos. Each lesser pueblo follows one great house.

**The cap.** `core/hamlet` caps a village at 500 people (`PLAN.md`, "Sizing"). So no seat goes over 500. The rest of each pueblo's
people live in its hamlets:
- a hamlet holds 60-250 people (est.): one to three clan houses, each a `kits/kimr` `km-house` on its rock;
- a `km-house` holds roughly 50-100 people (est.). The kit's census prints the real figure; it was not run for this scope.

| Pueblo | Kind | Seat px | Seat (est.) | Hamlets | In hamlets (est.) | Total (est.) |
|---|---|---|---|---|---|---|
| **K1 Tawn Leig Geid**, the gate-lake town | great house | 318,1466 | 500 | 9, about 155 each | 1,400 | **1,900** |
| **K3 Tawn Padyg**, the paddock town | great house | 251,1483 | 500 | 8, about 150 each | 1,200 | **1,700** |
| **K2 Tawn Shwfl**, the shovel-tusker town | great house | 308,1514 | 450 | 7, about 165 each | 1,150 | **1,600** |
| **K4 Tawn Ffair**, the fire town (the road to the Firebliss) | great house | 279,1415 | 450 | 6, about 160 each | 950 | **1,400** |
| **K7 Tawn Nob**, the knob town | pueblo, follows K1 | 338,1495 | 350 | 5, about 170 each | 850 | **1,200** |
| **K6 Tawn Rog**, the plinth town | pueblo, between K3 and K1 | 292,1478 | 300 | 5, about 160 each | 800 | **1,100** |
| **K5 Tawn Woʼr**, the water town | pueblo, follows K4 | 237,1418 | 300 | 5, about 160 each | 800 | **1,100** |
| **K8** (name TBD) | pueblo, follows K2 | 259,1550 | 250 | 5, about 150 each | 750 | **1,000** |
| **The pueblos** | | | **3,100** | **50** | **7,900** | **11,000** |
| **The Hall of Heroes' people** (section 4) | | round 376.5,1473.5 | | | | **1,000** |
| **The Kimr** | | | | | | **12,000** |

**The names.** Each name is *Tawn* (town) and a place word from the tongue's glossary (`lore/kimr-tongue.md` sections 5 and 6), as
the tongue builds *Tawn Geid* and *Tawn Teibl*. All are *proposed*:
- **Leig Geid** is the gate lake.
- **Padyg** is a graben corridor.
- **Shwfl** is the shovel-tusker of the lake shallows.
- **Ffair** is fire, after *Mawʼn Ffair*, the Firebliss.
- **Nob** is a knob of the chaos.
- **Rog** is a village's plinth or knob.
- **Woʼr** is water.

The tongue has no word yet that fits K8's place, the head of the Way Out.

The tongue's own two examples are kept for the places they name:
- **Tawn Geid**, "the gate village", is the Hall's village (section 4);
- **Tawn Teibl**, "the mesa village", is the Mesas station's built pueblo, one of K8's hamlets.

## 2. The sites

### 2a. How the ground was read

- **Height and slope.** The value at the seat's cell, the range in the 5 x 5 cells round it (10 km), and the relief within
  7 x 7 (14 km). At 2 km a cell, the model resolves the big mesas and a few knobs a few hundred metres high. It cannot see the
  6-15 m rock a pueblo stands on.
  - **Mesas and knobs the model does show:** 25 rise 400 m or more over the floor within 20 km and cover 250 cells or fewer. Each
    row below names the nearest of them.
  - **Where none is near:** the rock is a `KSTACKS` knob drawn at the station, as the Mesas station drew its knob 7, or a built
    plinth.
- **Water.** The distance to the nearest river (`rivers.json`) and the nearest lake (`wl`), straight line.
- **Climate.** The model's `tm`, with the warmest-month and coldest-month means (`tw`, `tc`), the rain `p` and the class `c`.
- **Herd lanes.**
  - **What the plan says.** It names no migration routes. It says:
    - the herds come down from the high paddocks to the gate lake and the low floors in late autumn (*Kwm In*);
    - trails run along the graben corridors and up to every lake;
    - every herd that leaves the Labyrinth passes the neck.
  - **What was modelled (est.):** least-cost floor paths to the gate lake from eleven summer grounds:
    - the two pit tarns;
    - the four graben lakes;
    - the three Warras' gorge mouths;
    - the south-east chaos floor;
    - the Mesas floor.

    The cost favours low, gentle ground. "Lane" below means the nearest of these paths. The fauna kit should replace them with its
    own ranges.
- **Distances.**
  - Straight line, then walking: the least-cost path on the floors, avoiding lakes, slopes and the ground over 3 km.
  - A day's walk is taken as about 35 km on the floors (est.).

### 2b. The seats

| | K1 Tawn Leig Geid | K2 Tawn Shwfl | K3 Tawn Padyg | K4 Tawn Ffair |
|---|---|---|---|---|
| **Kind** | great house | great house | great house | great house |
| **px** | 318,1466 | 308,1514 | 251,1483 (station 2's lake, its north-east shore) | 279,1415 |
| **Height** | 1,530 m (1,489-1,679 within 10 km) | 1,815 m (1,550-1,934) | 1,973 m (1,785-3,001) | 2,093 m (1,733-2,325) |
| **Climate** | Cfb, 11 °C (21 / 2), 910 mm | Cfb, 11 °C (20 / 1), 847 mm | Cfb, 10 °C (19 / 0), 1,035 mm | Cfb, 9 °C (19 / -1), 1,145 mm; the shore below is Csa, 16 °C |
| **Water** | Fell-Block Beck (280 m³/s) 3 km; the gate lake (1,420 m) 14 km | the chaos lake (1,580 m) 4.5 km; the Gowd Warra 16 km | the Paddocks lake (1,820 m) 3 km; Shatter-Scarp Gill 1 km; station 2's beck from the bastion's ravine | lake E (1,720 m) 4.5 km; Fell-Block Beck 4 km; the Weyt Warra's mouth 10 km |
| **Relief, slope** | 203 m in 14 km; 1.5° | 428 m; 3.0° | 1,995 m; 4.3° | 617 m; 6.3° |
| **The rock** | No mesa within 22 km on the model: a `KSTACKS` knob of the chaos amphitheatre. The nearest model knob, 550 m, is 13 km north-north-west at 313,1454 (a hamlet) | The low flat mesa at 303,1512 (105 cells, top 1,977 m, about 400 m over the lake): the seat on its south-east bench. The great house on a mesa bench, as `KIMR.md` rule 1 has it | The bastion's benched face that station 2 draws, rising 3.2 km to the north-east: the seat on its lowest bench | The mesa at 276,1409 (166 cells, top 4.5 km): the seat on its south-east bench over the lake |
| **Nearest pueblo (walk)** | K6, 57 km (62): two days | K7, 71 km (79) | K6, 83 km (91) | K5, 84 km (88) |
| **To the Hall (walk)** | 118 km (123) | 159 km (169) | 252 km (262) | 227 km (254) |
| **Hunts and keeps** | The winter herds of every kind at *Kwm In*; giant elk on the chaos floors; shovel-tuskers in the gate lake's shallows; melons in the warm floor's sun traps | Shovel-tuskers and glyptodonts on the wet floors; giant elk; melons | **The Aurochs herd** (station 2): the keepers of the rite hunt in the graben corridor. Also ground sloths in the parkland and deinotheres in the gallery woods | Gomphotheres; glyptodonts; the strays up the Weyt Warra to East Bliss Vale in summer |
| **Risks** | All the lanes meet at the gate lake: the *Kwm In* stampedes pass 7 km off. Nearest of the four to the Fellgang fells: 131 km to their polygon | The south-east chaos's dust season. Sabre-tooths in the mesa's own talus. A lane 10 km off | Its lane starts at its own lake: the herds come down to drink past the bench. Two-Snouts on the graben rims | The Firebliss plume blows south-east over it (ash). Fellgang hunters come down the Weyt in summer (Firebliss edge 128 km). The Weyt lane 11 km off. Sabre-tooths on the mesa |

| | K5 Tawn Woʼr | K6 Tawn Rog | K7 Tawn Nob | K8 (TBD) |
|---|---|---|---|---|
| **Kind** | pueblo, follows K4 | pueblo, between K3 and K1 | pueblo, follows K1 | pueblo, follows K2 |
| **px** | 237,1418 | 292,1478 | 338,1495 | 259,1550 |
| **Height** | 2,089 m (1,981-2,275) | 1,681 m (1,615-1,841) | 1,328 m (1,289-1,428) | 1,906 m (1,824-1,994) |
| **Climate** | Csb, 12 °C (21 / 3), 863 mm | Cfb, 10 °C (20 / 0), 722 mm | Cfb, 12 °C (22 / 2), 800 mm | Cfb, 9 °C (19 / 0), 722 mm |
| **Water** | the Tlahn Warra (145 m³/s) 2 km; lake N (1,980 m) 6 km | Shatter-Scarp Gill (340 m³/s) 3 km; no lake within 56 km | the Gowd Warra 3 km; the gate lake 33 km | the Gowd Warra 3 km; lake S (1,920 m) 11 km |
| **Relief, slope** | 307 m; 4.2° | 282 m; 1.9° | 779 m; 0.7° | 277 m; 1.0° |
| **The rock** | Lake N's north-east shore, under the bastion at px 225-235 x 1395-1405. A model knob, 2.5 km at its top, stands 28 km north-east at 248,1393 (a hamlet) | No mesa within 33 km on the model: **a built plinth**, which is why it is the plinth town | The knob garden: three model knobs 450-1,000 m over the floor at 335,1502, 342,1498 and 350,1492, where "the chaos breaks into knobs" | Lake S's east side, at the foot of the south bastion: a bench or a built plinth |
| **Nearest pueblo (walk)** | K4, 84 km (88) | K1, 57 km (62) | K1, 70 km (75) | K2, 122 km (134) |
| **To the Hall (walk)** | 300 km (324) | 169 km (175) | **88 km (93): the nearest seat to the Hall** | 280 km (297) |
| **Hunts and keeps** | Ground sloths; the cold beasts at the bastions' feet (mammoth, woolly rhino); the Tlahn gorge to the Great Firebliss Vale in summer | The herds passing on the corridor between the Paddocks and the gate; glyptodonts; dire wolves follow them | Giant elk; glyptodonts; melons. The meat for the Hall's people (section 4) | Gomphotheres; mammoth and woolly rhino coming east from the south-west pit tarn; elk on the south mesas' floors in the dust season |
| **Risks** | The Firebliss plume. Fellgang hunters in the Tlahn gorge (Firebliss edge 133 km). The farthest seat from the Hall: a nine-day funeral carry | Two lanes pass 12 km off on either side. No lake: the Gill is its only water | The neck's road: Fellgang robbers going for the Hall come past it (Fellgang polygon 107 km). Dust season to the south | On the south lane (4 km). Remote: 134 km to the nearest seat. The south mesas are dry (235-300 mm) |

### 2c. The hamlets

Each pueblo's hamlets stand on the knobs and benches of its own floor, within about a day (35 km) of the seat. They are the
lesser villages of the lore. Placing them is a station's work (`core/hamlet`, section 5). The anchors below are the model's own
knobs and mesas. All are *proposed*:

| Pueblo | Hamlets | Anchors on the model |
|---|---|---|
| K1 | 9 | **The Beck knob**, 313,1454 (550 m, on Fell-Block Beck): the house's lookout over the gate lake's north. The gate lake's south shore, about 330,1478. Five or six more on the amphitheatre's knobs round the lake (`KSTACKS`) |
| K2 | 7 | The mesas at 338,1518 (top 2.9 km) and 317,1539 (top 4.4 km); the rest on the chaos lake's shore |
| K3 | 8 | The Gill below the Paddocks, about 270,1478. The graben corridors round the bastion, where the Aurochs are kept |
| K4 | 6 | **The Fell-Block knobs**, 259-262,1416 (three model knobs 0.5-1.4 km, on the Beck halfway to K5); the Weyt Warra's mouth |
| K5 | 5 | The knob at 248,1393, at the Tlahn gorge's mouth; lake N's shores |
| K6 | 5 | The mesas at 304,1460 and 296,1497 (tops about 4.5 km), one on each side of the Gill |
| K7 | 5 | The knobs at 342,1498 and 350,1492; the mesa at 362,1503, beside the road to the Hall |
| K8 | 5 | **Tawn Teibl**, the Mesas station's built pueblo (257.5,1590, `km-house` on knob 7): a dust-season hunting hamlet, 84 km walk south. It lies outside the Kimr polygon in BSk, 235 mm, 65 km from the model's nearest water (question 6). The other four on lake S's shores |

### 2d. Spacing

On the floors the seats stand **57-134 km apart, two to four days' walk**. Each seat's nearest neighbour is 62-134 km away on foot.

The hamlets fill the gaps, so that on the main floors no settlement is much more than a day from the next (est.). Neighbouring
pueblos' hunting grounds meet halfway, and those borders are where the feuds are fought (section 2e).

The Kimr country is large for 12,000 people: the polity is 420 km across. Seats a day apart would crowd all eight into the
eastern chaos, round the gate and the Hall. That is the compact alternative (question 2). It shortens every funeral road. It would
leave the Paddocks (station 2's Aurochs ground) and the two Firebliss gorges with hamlets only.

### 2e. The web of houses

All *proposed*, after `LORE.md` 6.24, "The great houses".

**The great houses' allies (*mara*) and enemies (*ffiwd*):**

| Great house | Its *mara* | Its *ffiwd* | Why |
|---|---|---|---|
| K1 Tawn Leig Geid | K4 Tawn Ffair | K2 Tawn Shwfl | K1 and K4 share Fell-Block Beck and the north road to the Firebliss hunts. K1 and K2 contest the low chaos floors where the herds winter, and the road to the Hall |
| K3 Tawn Padyg | K2 Tawn Shwfl | K4 Tawn Ffair | K3 and K2 are joined by the southern corridors. K3 and K4 contest the summer paddocks and the Aurochs |

**The lesser pueblos:**
- K7 follows K1, its neighbour down the Way Out;
- K5 follows K4;
- K8 follows K2;
- K6 is a swing house on the corridor between K3 and K1, courted by both.

**Wildcat** (lore: a Kimr great house for its *mara* and another for its *ffiwd*):
- its *mara* is K1, the gate house that trades through it;
- its *ffiwd* is K4, whose hunters meet Wildcat's in the Firebliss each summer.

## 3. The map

The map is a PNG in the session's scratchpad, not in the repo:
`C:\Users\travi\AppData\Local\Temp\claude\fb90a45e00650bd0\3c8541e4-a2b4-461b-b662-31b858516b6a\scratchpad\kimr-sites.png`.

It covers px 80-440 x 1330-1650, as a hillshade of `h.png`. It shows:
- the polygons: the Labyrinth biome, the Kimr polity, the Firebliss and the Fellgangs;
- the eight rivers and the lakes;
- the modelled herd lanes;
- the eight seats, each with a 35 km ring;
- the hamlet anchors;
- the Hall and its three villages;
- the stations, Wildcat and the drovers' salt basins.

**In words:**
- **The Hall stands alone at the neck** (376.5,1473.5), the funnel's spout on the east. Past it, the Gowd Warra runs east in a slot
  gorge 1,121 m deep in the rock, between walls of 4-6 km, toward Wildcat. Wildcat is 109 km off in a straight line and 130 km on
  foot, up on the rim at 3,427 m.
- **West of the neck, the low chaos floor opens.** It lies at 1,150-1,600 m, with the gate lake 97 km up-valley.
  - **The east pair:** K1 stands where Fell-Block Beck comes down to the gate lake from the north-west, and K7 in the knob garden on
    the Gowd Warra, 70 km from K1. These two hold the gate.
  - **K2** sits on its low mesa by the chaos lake, 75 km south-west of K7.
  - **The Shatter-Scarp corridor** runs west from the gate lake. K6 is on it, a day and a half from K1, and K3 at the Paddocks lake
    under its bastion, two and a half days further on.
- **The north row lies along Fell-Block Beck and the two lakes where the Firebliss rivers come in:** K4 on lake E at the Weyt's
  mouth, K5 on lake N at the Tlahn's. The Fell-Block knobs stand between them.
- **K8 is the far south seat**, at lake S on the Gowd Warra's upper reach. Its dust-season hamlet, the Mesas pueblo, is two and a
  half days south.
- **Outside the Kimr polygon:**
  - the pit chains (west of px 188);
  - the cold tarns;
  - the dry south-east chaos;
  - the bastions, which stay hunting and herd ground, with no seat.

## 4. The Hall of Heroes' 1,000

**Where the Hall is.** Three coordinates are in use:

| Px | Source | What it is |
|---|---|---|
| **376.5,1473.5** | `PLAN-GATE.md`; the owner's answer of 2026-11-11, "the neck"; station 1 is built here | the ruin at the neck, on floor at 1,113 m. **Taken as the Hall here** |
| 365,1474 | the model's pin `s3zzt8dujb` ("Hall of Heroes", ruined arcology, polity Kimr, 2026-11-13), and `WEST-RIFT-SCOPE.md` | 23 km up the Way Out from the station, on floor at 1,206 m |
| 328,1476 | the seed's first guess | the gate lake, 97 km up-valley; superseded |

The Labyrinth's biome polygon still cuts the floor diagonally, so neither 376.5 nor 365 lies inside it. The Kimr political polygon
of 2026-11-13 takes in both.

**Proposed:** keep 376.5,1473.5 as the Hall. Either move the pin there, or keep the pin as the causeway head below (question 3).

**"The living stay out."** The owner's answer to `PLAN-GATE.md` question 4, and `LORE.md` 6.24, say no pueblo is built at the Hall.
So the Hall's 1,000 live round it, outside the pond and its causeways. They live off the station 1 page (5.2 km square), so the
built page does not change.

| Group (all *proposed*) | People (est.) | Where |
|---|---|---|
| **The People of the Hall** (*Pibl y Hol*): the Mask-keeper's household, the carriers who keep the First Keepers' and the oldest heroes' masks, the Painters' workshops (ochre, kaolin, bone black), the Tellers | 200 | **Tawn Geid**, the gate village: on the south wall's toe about 383,1478, 1,205 m, about 8 km south-east of the Hall across the Gowd Warra. A bench facing the Hall over the river |
| **The keepers of the dead**: the drying decks, one keeper family to each clan's bone house in the columns, the niche-cutters, the setters of the Hawrog poles on the causeways | 150 | Tawn Geid |
| Their children and elders | 150 | Tawn Geid (500 in all, at `core/hamlet`'s cap) |
| **The vigil**: the kin of the year's dead in the drying (each dead of note lies a year, `LORE.md` 6.24). One lodge for each of the eight houses, and one for Wildcat's Kimr, who bring their dead to the Hall. The vigil turns over through the year | 250 | **The causeway head**, at the map's pin 365,1474: 22 km up the Way Out, where the funeral walk (*Ffiwn*) gathers before it crosses |
| **The Hall's watch**: warriors sent by turns from all eight houses (about 15-20 each). They guard against Fellgang robbers (the bands' young dare each other to rob the Hall) and herds bolting through the neck. The trading ground with Wildcat is theirs | 150 | **The east watch**, at the gorge mouth about 386,1473: the one way in from the Rift. The Fellgang polygon is 22 km from the Hall |
| **The Hall's hunters and the counters**: they feed the Hall's people from the low floor west of the neck, and each spring they climb the Lookout to make the Count | 100 | A hamlet on the north wall's toe about 370,1466, west of the stacks and outside the pond |
| **The Hall's people** | **1,000** | |

**Not in the 1,000:** the thousands who come for days at *Kwm In* (the masks fetched out) and *Go Awd* (the heroes walked home).
They camp (section 5).

**What feeds them.** The Hall's people hunt little. K7 and K1 send meat, fat and melons down the Way Out as the houses' due to the
dead (est.). That is a flow for the sim.

## 5. How this feeds the sim and the placement

**The West Rift sim** (`core/region/WEST-RIFT-SCOPE.md` section 6):
- **W0.** This file answers the scope's question 16 ("Kimr numbers"), and its table 3c already cites it. Owed:
  - the owner's answers below;
  - a pin batch through the scale-model edit queue: the eight seats and Tawn Geid as `village` pins, polity Kimr, plus the Hall's
    pin moved or confirmed;
  - section 1's people table still gives the Hall at 365,1474: correct it once question 3 is answered.
- **W1** (`WR_TUNE`).
  - **The settlements.** Keep the Kimr as one bulk district of 12,000 at the districts' scale (200: about 60 actors, est.) until
    W6. The Kimr trade nothing in W1-W5 but through Wildcat.
  - **The goods to add:**
    - ivory, tusker hide, mammoth wool, horn, fat, melons, melon beer (*melinbru*) and dung fuel;
    - in from Wildcat: obsidian, sulphur, salt and salvage metal (`LORE.md` 6.24, "The trade").
  - **The calendar:**
    - *Kwm In*: the herds down, the masks out;
    - *Long Naid*;
    - the Count in spring;
    - the Aurochs Hunt;
    - the summer hunts in the Firebliss;
    - *Melyn*;
    - *Go Awd*: the heroes home, and the funeral walks.
  - **The diet:** meat, marrow and melons. No grain.
- **W5.** Raids:
  - the great houses' feuds (*ffiwd* pairs, 2e), fought by champions;
  - Fellgang robbers at the Hall;
  - Wildcat in the web, with a *mara* and a *ffiwd*.
- **W6.** "The Kimr and the Hall of Heroes as a market through Wildcat":
  - split the district into nine settlements at the towns' scale (50: about 240 actors, est.): the eight pueblos and the Hall's
    people;
  - the east watch is the market ground;
  - the routes:
    - the Way Out from each seat to the Hall (the walking km in section 2);
    - the slot gorge to Wildcat, 130 km;
    - the Warras north to the Firebliss.
  - The Hall is a sink for the houses' dues and a destination for processions. The funerary records of `PLAN-GATE.md` section 9 are
    what `core/simulation` sends them to.

**Placement:**
- **`core/hamlet`** (`32-hamlet-platform.js`, opt-in; README, "Adopting the platform village").
  - **Every seat and hamlet is a `KHAMLET.platform` village:**
    - its plinth is the station's `KSTACKS` knob or bench, through `kits/kimr`'s `kmSite` rock (`{rock: {x0, x1, z0, z1, h}}`), or
      a built plinth;
    - its kivas go in the court (`kivas: 'court'`, the Kimr's);
    - its pen and works go below.
  - **A Kimr culture row is owed** in `core/hamlet`. Until it lands, `KHAMLET.pendingRow('kimr')` gives the pending row. Its
    platform keys come from `kits/kimr`: `km-house` for the room blocks, the round room under the glyptodont's shell for the kiva,
    the bone pen, the ladders. A great house's seat takes `greatKiva`.
  - **A `hunt` focus is owed too.** `KHAMLET.FOCI` has none (salt, mine, quarry, clay, lumber, ranch, fishing, farming). A culture
    row may keep a focus of its own in its `works` (`30-hamlet-village.js` l.145), so the Kimr row can name `hunt`, with its jobs
    taken from the herds' records.
  - **The cap.** Seats stay at 500 or under (the cap). If the owner wants a bigger great house, it is several `KPUEBLO` houses
    round one court on the bench (question 5).
  - **Stable ids:** `kimr-k1` to `kimr-k8`, `kimr-k1-h1` and so on, and `kimr-hall-geid`, `-vigil`, `-watch`, `-north`.
  - **The names** need a Kimr list for `KHAMLET.hamletName`, generated from the tongue's glossary as `tools/names/sikau.py` does
    the Islanders' (*Tawn* plus a place word).
- **The biome kit** places the sites, the plinths and the keep-clears (`PLAN.md` section 5):
  - no hamlet on a herd lane;
  - the charge hazard (`PLAN.md` section 7, amendment 2) along each lane;
  - the lanes as the fauna kit's ranges, once it has them.
- **`core/camp`.** The moving and seasonal Kimr:
  - the summer hunting bands up the Weyt and Tlahn Warras to the Firebliss (bands that move);
  - the rite hunt's band;
  - K8's dust-season camp, if Tawn Teibl is seasonal;
  - the festival camps at the causeway head (*Kwm In*, *Go Awd*).

  A Kimr row in `10-camp-cultures.js` is owed.

## 6. For the owner

1. **The count:** eight pueblos (four great houses of 1,400-1,900, four lesser pueblos of 1,000-1,200), one to each watered paddock
   inside the Kimr polygon. Or seven, or nine?
2. **The spread:** the seats 2-4 days apart over the whole polity, with hamlets filling the gaps (as proposed). Or the compact
   layout, all eight seats a day apart in the eastern chaos round the gate, with the Paddocks and the Firebliss gorges as hamlets
   and hunting ground only? The compact one shortens the funeral roads: from K5 today it is about 324 km, nine days.
3. **The Hall's pin:** move pin `s3zzt8dujb` from 365,1474 to station 1's 376.5,1473.5 (your answer of 2026-11-11, "the neck")?
   Or keep 365,1474 on the map as the causeway head, where the funeral walk gathers?
4. **The Hall's 1,000 and "the living stay out":** is it right that they live round the Hall, outside the pond, in Tawn Geid
   (500), the vigil's lodges (250), the east watch (150) and the north toe (100)?
5. **The great house's size:** keep the seats at `core/hamlet`'s cap of 500, "several hundred" as the lore has it? Or raise the cap
   for a *greidhaws*, or draw it as several houses round one court?
6. **The Mesas pueblo** (station 3, built): it stands outside the Kimr polygon, in BSk with 235 mm, 65 km from the model's nearest
   water. Is it K8's dust-season hamlet (as proposed), or should the polygon or the pueblo move?
7. **The names:** Tawn Leig Geid, Tawn Shwfl, Tawn Padyg, Tawn Ffair, Tawn Nob, Tawn Rog and Tawn Woʼr. Is *Tawn Geid*, the
   tongue's "gate village", the Hall's village? And a name for K8.
8. **The web of houses** (2e): is K1 with K4 against K2, and K3 with K2 against K4, right? And Wildcat with K1 against K4?
9. **The cold west** (the pit chains and the two tarns, px 90-188): it lies outside the Kimr polygon. Is it Kimr summer hunting
   ground (the mammoth and the woolly rhino are there), or nobody's?
10. **The herd lanes** are modelled here (least-cost paths, est.). Should the fauna kit own them?
11. **The pins:** add the eight seats and Tawn Geid to the scale model as `village` pins, polity Kimr, through the scale-model edit
    queue?
12. **Wildcat's Kimr half** (about 200 of its 400) stays outside the 12,000, as `WEST-RIFT-SCOPE.md` has it. Right?
