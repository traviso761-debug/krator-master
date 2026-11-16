# Proposal: the Xanadu Sultanate on the sim layer (Erehwon, the Vale, the provinces), beside Oidong and the High Rift

The owner, 2026-11-15: "using these maps and trade info, let's scope Erehwon (and the Vale, and the Sultanate's) trades and
economy for the sim layer. let's plan out the minor villages, hamlets, and other special districts of the country in
preparation to put it in a larger sim fragment with Oidong/High Rift."

Status: **X0 built** (2026-11-16): `core/region/data/xan-tune.js` (`XAN_TUNE`) and `core/region/tests/test-xan-economy.js`,
18 checks passing. A year runs in about 50 s on 910 actors:
- **Food:** 348,710 people in 62 settlements, all of them fed their grain (55,000 t eaten, none short).
- **Gold:** the gold field's ore is assayed at Strongwall, the Sultan's Fifth reaches the Treasury, the goldsmiths make goldwork and the Mint makes coin.
- **Dues:** every province's dues and Qiblai's grants fall once a year, none owed.
- **The lake:** every lake town is fed and their fish land at Erehwon and Phēr.
- **Iron:** Theodiga smelts 107 t of iron from scrap and the Cataracts' charcoal.
- **Gateways:** salt and iron come in; goldwork, cacao, opium, tea and silk go out.

**Owed to X1:**
- **Salt:** 38% short, as the owner expects until the northern caravans are built (2026-11-16). The capital's market ends
  the year holding 419 t of salt its provinces cannot reach on two-stop roads.
- **Exports:** well under the gateways' take (cacao 53 t of about 440). The goods pile up at the seats and the capital.

Both wait on X1's staged roads. X0's own finding: core/clock's day 0 is year day 259, so the first stores stand for last
year's harvest and last to the first harvest's end (clock day 306).

**X1 built** (2026-11-16), 26 checks passing, a year in about 50 s on 472 actors (down from 910). The valley host
(`core/region/50-region-valley.js`) takes three new fields; Longsong's test passes unchanged:
- a settlement's own `scale`: the countrysides at 200 people an actor;
- a work's `site`: the gold lode and the opal diggings run down, the Dome's fall and the fisheries regrow nightly;
- a road's `stops`: a round of three or more.

The Sultanate's tune then changed in three ways:
- **The gateways enter at their staging towns.** The caravans start at the gateway, so the first salt lands within its first passage. The Catch's caravans come in at Strongbow, and their salt goes inward by Kirstabal to Qiblai for the south. ~~Yuni's come in at Thalaba, and their salt goes by Phēr to the capital for the north.~~ **Changed 2026-11-16 (the owner: "I don't think Thalaba should be a Yuni terminus"):** Yuni's then end at Qiblai (the owner: "Yuni's caravans should go to qiblai"), by the Geomancers' road from the north-east, beside the Geomancers' oil caravans. The north's salt comes with Dalab's Great Caravan, which lands it at the capital at the winter's start; from there it goes out by the lake to Phēr and up to Thalaba.
- **The lake's four market-boat rounds** call at every shore town. The lake's households now buy the market's wares (pots, mats, honey), so the boats carry them round as a relay.
- **Salt** is 8.1% short in the first year (from 38%).

The year's results:
- **Exports:** cacao 75 t, opium 60 t, tea 41 t, silk 4 t, brocade 1.9 t, goldwork 224, wheels 384.
- **Imports:** salt 1,160 t, iron 37 t.

**Not in X1:**
- **The Strongbow toll:** a share of loads passing a stop needs a change to core/simulation's trade, which is inlined into many built pages. It waits for X3's priced gateways.
- **Legs of their own length:** a round still has one time for every leg, which suits the lake's rounds. The long caravans are two-stop roads from their gateway to their staging town.

This is the sequel to `PROPOSAL-LONGSONG-PINNACLE.md`, which put Longsong and its ring on the valley host
(`core/region/50-region-valley.js`) with a test (`settlements/longsong/tests/test-ls-economy.js`). Xanadu goes on the
same host. Its stand-in "Xanadu market" (`settlements/longsong/src/15-ls-tune.js:128`: an off-map pool with 0 people)
is replaced by the real towns. The fealty and esteem bills then run between real treasuries.

## Sources

- **Gemini's model.** These files set the scale and the goods. Read them as a draft, not as canon (section 1 lists where they disagree with the repo):
  - `openworld/TRADE-GEMINI.md`, `trade-gemini.json` and `populations-gemini.json`;
  - `trade-fleets-gemini.json`, `roads-supplement-gemini.json` and `net51-gemini.json`;
  - the method is in `tools/scale-model/gemini_trade_model.py`.
- **This line's census:** `openworld/RESOURCES-SETTLEMENTS.md`, `TRADE-GOODS.md` and `TRADE-SCOPE.md` (the gateway rule, the native crops, the salt split, the oil licence).
- **The map:**
  - scale model 5.1 edit 7, Erewhon's caldera: `tools/scale-model/edit_517.report.json`;
  - the pins in `tools/scale-model/model/src/60-settlements.js`;
  - `openworld/xanadu-oidong-highrift/plan/sites.json` and `plan/resources.json`.
- **Lore:**
  - LORE.md 6.13: the Sultan, the Vizier, the six guilds, the faith of the Decree, and Xanadu's lack of iron;
  - Erewhon's districts: `settlements/xanadu/targets/erewhon/87-er-layout.js` and `settlements/xanadu/citadel/BLUEPRINT.md`;
  - Qiblai: `kits/qiblai/PLAN.md`;
  - Theodiga: `settlements/theodiga/BLUEPRINT.md`.

## 1. The numbers to reconcile first

The sources disagree on the country's scale by a factor of ten. Every rate below depends on which figure is taken (section 9, Q1).

| | This line's census (`TRADE-GOODS.md`) | Gemini (`populations-gemini.json`) | Lore |
|---|---|---|---|
| The Sultanate | 45,650 (35,500 named) | **465,300**: towns 103,400; rural 361,900 (rural ratio 3.5) | "a rich hilly valley" |
| Erehwon | 20,000 | sim 55,000 (pin 20,000) | **20,000** (LORE.md:479) |
| Qiblai | 12,000 | 24,000 | ~12,000; its hinterland needs ~30,000 (`kits/qiblai/PLAN.md:261`) |
| Theodiga | 10,000 (estimate) | 6,000 | ~5,000: 900 in the arcology, 4,100 in the town (blueprint) |
| Strongbow | n/a | 7,000 | 3,500 |
| Kirstabal | none | 3,750 (a sugar and opium plantation town) | none |
| Thalaba | none | 4,500 (pin 750) | none |
| Gold mines, Opal Valley, Strongwall | none | 1,400 / 1,500 / 250 | none |

**The answer (the owner, 2026-11-15/16): between the first proposal (~230,000) and Gemini's 465,300, with the lake the
heart of the country, many villages and hamlets along its shores on the pattern of Lake Atitlán, and constant boat
traffic (section 2a).**

| Group | People |
|---|---|
| Towns: Erehwon 25,000 (the lore's 20,000 city and 5,000 in its quays and suburbs), Qiblai 15,000, Theodiga 6,000, Strongbow 4,000, Kirstabal 3,000, the mines and forts ~3,000 | ~56,000 |
| Rural: about 5x the towns, between the first proposal's 4x and Gemini's 3.5x on a larger town base. A third of it (~95,000) lives on the lake's shores | ~294,000 |
| **The Sultanate** | **~350,000** |

This is three-quarters of Gemini's total. Its rural density is 4 people per km² over Gemini's 73,808 km² of habitable
land, much higher on the lake's shores.

Gemini scales supply and demand by a polity multiplier (about 4.82 for Xanadu) and then rewrites each town's population as 4.5x its sim figure. The sim must not do either. Its people are counted once, as residents of settlements.

## 2. The country as the sim sees it: provinces

The Chancellor of Seals and Provinces is already a great officer of the court (`citadel/BLUEPRINT.md:14`), so the provinces are canon in all but name.

Each province is three things:
- **One rural district:** an abstract settlement holding many villages. It eats, farms, herds and tithes to its town. It is never drawn.
- **A few named villages and works**, drawn from the map's pins or the region's `KHAMLET` sites.
- **A seat:** a town that takes its tithe.

Names are working names (section 9, Q5); the px coordinates are on the 5.1 canvas.

| # | Province (seat) | Ground | Rural people | Named places | What it makes |
|---|---|---|---|---|---|
| P1 | **The Lake Shore** (Erehwon) | The caldera lake's south, west and east shores at -520 m (121 x 66 km), the terraces under the three volcanoes, the four islands | 70,000 | The lake towns of section 2a (south, west and east shores, the islands); Erehwon's ring of 5 farming villages and 1 ranch (`sites.json`, 1,345 people); ~130 lake hamlets | Lake fish (the census gives 1,212 fish-eq km²), terrace grain and fruit, the Vale apricot and strawberry-tree, mulberry silk, volcanic sulfur, pumice, the boats |
| P2 | **The Vale of Xanadu** (Theodiga) | The old basin between the lake and the dam: 1,591 cells, Cfa, ~913 mm, the Ālph across it | 75,000 | Theodiga's silt-flat temple fields, hives and dairies; 3-4 named Vale villages on the Ālph | The country's granary and its native crops: cacao, Vale saffron, mist tea, the sky poppy; mulberry and silk reeling; lotus root and wild rice |
| P3 | **Shalālāt** (Qiblai) | The lowlands on the cataracts of Nahr ash-Shalālāt, ~-1,900 m, Af | 80,000 | Qiblai's ring (5 farming villages and 1 ranch, 1,345 people); the temple-estate farms; the ghats; a caravanserai on the Erehwon road; the salt pan at 922,1580 | Timber (42,000 t, third on the map), cacao, fruit, potash; honey and milk for the sacraments. The oil field is worked by Yuni under licence (`TRADE-SCOPE.md:94-98`) |
| P4 | **The Gold March** (the Master of Mines' seat at Strongwall) | South of Qiblai: `lode:xanadu-gold` (911,1665, r 16 km), the copper band beside Strongwall (923,1650), placer gold down the rivers | 10,000 | The gold mines (`smgxtultfq`, ~950), Strongwall (a fort of 150-250), 2 placer camps | Gold ore to gold, copper; saltpeter (Gemini: 70 t). The mines eat food from P3 |
| P5 | **The Scarp** (Kirstabal) | The foot of the Oidong–Xanadu scarp, where Kirstabal and Strongbow stand (989-1001,1596-1600) | 25,000 | Kirstabal (2,200), plantation hamlets on the slopes, the foot of the Strongbow lift | Mist tea, cacao and saffron on the slopes, the sky poppy. Not sugar or coffee: the native rule (`TRADE-SCOPE.md:161`) gives those to the Ring Isles and the SW lowlands, so Gemini's sugar, coffee and cotton are dropped |
| P6 | **Opal Valley** (the Sultan's factor) | 1038,1662: terraces of opal diggings, east of the Gold March | 4,000 | Opal Valley Mines (~850) | Precious opal and photonic opal; the Sultan's Fifth |
| P7 | **The North Shore** (Phēr, the north shore's market town) | The lake's north shore and the summer road to Godshearth (217 km) | 25,000 | The north-shore lake towns of section 2a, Thalaba among them (to ~3,000); ~60 lake hamlets | Fish; mulberry and silk; cacao groves; honey; sulfur and machine-wax from the summer expeditions; the vent fields |
| P8 | **The Marches** (the Military quarter of Erehwon) | The south and west rim facing the Lizardmen's floor, lowered to 0.8 km by edit 7 (Tuatara 818,1554, Komodo 865,1617) | 5,000 | 3-4 watch forts and a beacon line | No goods. It is fed and paid; Lizardman raids are its events (section 7, X5) |
| **Total** | | | **~294,000** | | |

The Order of Historians' valley (Longsong, the Singing Gjár, the Mirror Grange, the Caldron House: 4,904 people
simulated today) and the Order's White Gills Hermitage stay the Order's. **Strongbow** sits on the line: in Xanadu's polygon and
in the Oidong Valley's (section 9, Q4).

## 2a. The lake: Atitlán's pattern (the owner, 2026-11-16)

"There should be many villages and hamlets along the lakes; Lake Atitlán is the inspiration. There will be constant boat
traffic."

At Atitlán a dozen towns ring one caldera lake under three volcanoes. Each town keeps its own trade (weaving, coffee, fishing, reed
mats, a market), and the launches never stop crossing between them. Erewhon's caldera lake is Atitlán at 46 times the area:
5,980 km² against 130, 121 x 66 km, three volcanoes on the south rim, four islands. So it holds about **twenty lake towns**,
**about two hundred lake hamlets** and **some five hundred boats**, and crossings take hours, not minutes.

**The lake towns.** Each stands on the shore cell found round the lake every 15 degrees (the merged model with edit 7; the
bearing is measured from the lake's centre at 810,1499.5, 0° east, 90° south). X0 snaps each one to the 1:1 shore with
`core/hamlet` placement. The names are coined Xanadui on the tongues sheet, as for the provinces, all *proposed*.

| Bearing | px (shore cell) | Name (gloss) | People | Trade |
|---|---|---|---|---|
| 0° | 839,1499 | **Ālph-Hēḍ** (Alph-head) | 4,000 | The lake's outlet at the Ālph's head: the weir, the mills, the river barges to Theodiga. A holy place of the Decree |
| 15° | 838,1507 | **Hoṭ-Bāṭh** (hot bath) | 1,800 | The east volcano's hot springs and bathhouses; sulfur and pumice |
| 30° | 834,1514 | **Ṭī-Ṭeras** (tea terraces) | 2,000 | Mist tea on the east volcano's flank |
| 45° | 827,1517 | **Pāṭari** (pottery) | 1,500 | Clay and the lake's pottery |
| 60° | 820,1517 | **Saphran** (saffron) | 1,800 | Vale saffron under the middle volcano |
| 75° | 815,1517 | **Wībhar** (weaver) | 2,500 | Silk weaving, the lake's dyed cloth |
| 90° | 810,1517 | **Boṭ-Yārḍ** (boatyard) | 2,000 | Erehwon's east suburb: the boatbuilders. Most of the lake's hulls are laid down here |
| 105° | 806,1516 | **Erehwon** | 25,000 | The capital and its quays: the lake's hub (section 3a) |
| 120° | 801,1514 | **Gārḍan** (garden) | 1,800 | Erehwon's west suburb: market gardens and flowers for the city |
| 135° | 797,1513 | **Qorī** (quarry) | 1,500 | The west volcano's basalt quarries; masons |
| 150° | 793,1510 | **Ōrcharḍ** (orchard) | 1,600 | Vale apricot, strawberry-tree, pitaya |
| 165° | 788,1505 | **Lōṭas** (lotus) | 1,500 | Giant lotus root, reeds, willow withies: mats and baskets |
| 180° | 782,1499 | **Phish-Mārkiṭ** (fish market) | 4,000 | The west end's fishing town and the lake's great fish market |
| 195° | 780,1491 | **Siṭāq** (stack) | 900 | The ferry to the west isle; the shrine on the west stack (`lf_west_stack`) |
| 210° | 785,1485 | **Hāibh** (hive) | 1,200 | Hives and honey: the sacrament's honey for the temples |
| 225° | 793,1483 | **Malbari** (mulberry) | 2,200 | Mulberry and silk reeling |
| 240° | 800,1482 | **Nēṭ** (net) | 1,400 | Fishing |
| 255° | 805,1482 | **Qōqō** (cocoa) | 1,800 | Cacao groves on the north shore |
| 270° | 810,1483 | **Phēr** (fair) | 6,000 | The north shore's market town, across the lake from Erehwon: the north's hub and P7's seat |
| 300° | 818,1485 | **Māuṭh** (mouth) | 1,500 | Fishing at the mouths of the north-shore rivers |
| 330° | 825,1488 | ~~**Thalaba** (3,000)~~ **Ōlḍ-Thalaba** | 600 | **Changed at X2 (the owner, 2026-11-16):** Thalaba moved up to the mouth of Godshearth (840,1463, a town of 2,400; section 7, X2); a fishing village keeps its shore |
| 345° | 834,1493 | **Ḍāiyar** (dyer) | 1,400 | The dyers: saffron yellow, agate-wood maroon |

The islands:

| Island | px | Name (gloss) | People | What it is |
|---|---|---|---|---|
| The great isle (113 m) | 816.5,1501.5 | **Grēṭ-Āil** | 600 | A monastery of the Decree, mid-lake: **the head monastery of the Order of the Azure Dream, Qiblai's blue monastery** (the owner, 2026-11-16) |
| The bay isle (64 m) | 808.5,1509 | **Bē-Āil** | 300 | The Sultan's fishponds and gardens, 15.7 km off Erehwon |
| The west isle (100 m) | 797,1494 | **Wesṭ-Āil** | 400 | Fishermen |
| The east isle (45 m) | 828,1497 | **Lāiṭ-Hāus** (lighthouse) | 200 | The light and the customs post on the run to the Ālph |
| Pleasure island | 805.035,1515.69 | The Dome of the Bay | (the Dome) | The Sultans' feasting dome, 0.6 km off the quays (section 3a) |

That makes about 70,000 people in the named lake towns, Erehwon included (45,000 without), and 1,500 on the islands.
The ~190 lake hamlets of 150-240 people (P1's ~130, P7's ~60) hold some 40,000 more, between and behind the towns and on
the terraces above them. With Erehwon's farm ring, the lake's shores hold about 120,000 people, a third of the country. Fishing
hamlets are on the water; farming hamlets are on the terraces.

**The boats.** Their numbers are scaled from Atitlán's launches and dugouts to the lake's people:

| Craft | Number | What it does |
|---|---|---|
| Fishing dugouts (*cayucos*) | ~400: one to four fishing households | Out at dawn, back by noon, every day but the market's |
| Cargo boats and lake barges | ~120: about one to 800 lake people | The goods between the towns, the Ālph-Hēḍ transfer to the river barges, the north shore's silk and cacao to Erehwon |
| Passenger launches | ~60 | Scheduled runs (below) |
| The Sultan's barges and dragon boats | ~12 | The court's festival boats; the Dome's barge; the customs launch from Lāiṭ-Hāus |

**The traffic.** Two hubs, Erehwon in the south and Phēr in the north:
- Launches run hub-and-spoke from each hub to every town on its shore, and back, all day.
- **The cross-lake run** (Erehwon to Phēr, about 34 km): a launch every two hours by day.
- **The long runs** to Ālph-Hēḍ (about 74 km) and Phish-Mārkiṭ (about 50 km): one a day each way.
- At 12 km/h (sail and oar; the court's barges are rowed) the cross-lake run takes about 3 hours, so on any daylight hour some 40-60 launches and cargo boats are under way, and the dugouts are out every morning.
- **The market week:** each day of the lake's seven-day week is one town's market day. The boats converge on it, as Atitlán's do on Sololá's and Santiago's days.
  - Erehwon's great market and Phēr's fair take two days.
  - Ālph-Hēḍ, Phish-Mārkiṭ, Thalaba, Wībhar and Malbari take one each.
  - The rest go to market at the nearest of these.

**On the sim:**
- **Passengers:** the launches are `transport` records (77-sim-5r, the ferries), each on a fixed loop with a timetable. Market-goers and pilgrims ride them. On a market day a town's people are sent to the market's town by ferry and back.
- **Cargo:** each pair of towns on a regular run is a `SIM.trade` road with `carriers` (its cargo boats), `minutes` from the distance at 12 km/h and `want`. The two hubs gather and redistribute, so most roads are town to hub.
- **Fishing:** each fishing town has a fishing work whose crew takes the dugouts out in the morning window. The catch is fish, and its rate comes from the lake's fish-eq.
- **Drawing:** the region page draws the boats in view.
  - *Near the camera:* the presented level places each launch and cargo boat at its leg's progress from the sim clock.
  - *Far off:* boats are seeded on the runs' lines by `KRAND` from (run, hour, index) and the clock, so the lake looks as busy from Erehwon's palace as the sim says it is.
- **Owed for drawing:** the Xanadu lake craft. There are no models yet for:
  - a launch;
  - a dugout;
  - a cargo barge;
  - a dragon boat;
  - the Sultan's barge.

  `kits/ringsea` has 31 sea vessels, none of them these.

## 3. Settlements: towns, villages, hamlets and special districts

The sim has one settlement per row. A town's **special districts** are works inside its settlement, or a sub-settlement
where a district eats or holds stock on its own account.

### 3a. Erehwon (20,000; the capital)

The districts come from `87-er-layout.js` and the citadel's blueprint. For each: what it does on the sim, and the records it needs.

| District | On the sim | Takes, makes |
|---|---|---|
| **The Citadel**: the Sultan's Palace, the Vizier's Divan and chancery, the great officers' houses, the gate company of 80 | Sub-settlement `xan:citadel`. It holds **the Sultan's Treasury**, the one store the provinces' dues land in (section 5) | Takes the provinces' dues, the Sultan's Fifth, the oil licence's share and the fealty grants. Pays the garrison, the court and the grants of esteem |
| **The Pleasure Dome** (the citadel's harem, ~200 people) and **the Dome of the Bay** (the feasting dome on Pleasure island) | Sub-settlement `xan:dome`: a luxury sink | Cacao, silk, saffron, pearls, wine, lamp oil (`TRADE-SCOPE.md:127`: 1.5 oil for the Dome), ice from the Caves |
| **The Mint and assay** (the Master of Mines and Mints) | A work in the citadel | Gold, from the mines, to **coin** (the Xanadu currency against the Izani Talent: PLAN-MONEY) |
| **The Goldsmiths' quarter** (the richest guild: LORE.md:477) | A work in the town | Gold to **goldwork**: Gemini puts Xanadu at 99.5% of the world's, and this line's census gives it 100% of goldwork and prayer wheels |
| **The three industry districts** (west, east, south) | Works | Copper smithing, silk weaving and dyeing (saffron yellow, agate-wood maroon), lacquerware once it has a source (section 9, Q7), prayer-wheel drums, the masons' yards |
| **Mines and quarries** (east) | A work with a site | Marble (Gemini gives Xanadu 48.5% of the world's marble, unsold: an export to look at) and building stone |
| **The Caves of Ice** (Ancient, kept cold) | A work and a holy place | Ice for the Dome and the markets; a **keeping** store that lowers spoilage for what is kept there |
| **The Dockyard and waterfront** | A work | Lake barges and dragon boats (the lake carries the Thalaba and island trade). No sea ships: the owner ruled Xanadu has none |
| **Three markets** (garden, main, temple) | One store for the town; the temple market takes the offerings | Where the gateway caravans load and unload |
| **The Temple district, temple garden and baths, monastery** | Places; offerings come in as a wanted sink (PLAN-MONEY.md:231) | Honey, milk, incense, lamp oil |
| **The Military quarter, prison, arena and amphitheatres** | Eaters with posts | The Marches' garrison is paid from here |
| **The garden district, wealthy, middle and slum quarters** | Households by class (where the city host's needs and unrest would go) | No goods of their own |
| **The terrace farms outside the walls** | Part of the Lake Shore's rural district | |

### 3b. Qiblai (12,000; the holy city under the Prismarchy)

The places come from `kits/qiblai/PLAN.md:146-152, 204-212`.

| Place | On the sim |
|---|---|
| **The Temple Mountain and the Hall of the Decree**: the treasury of the Decree, the great wheel house | Sub-settlement `qib:hall`. The **Prismarchy's treasury** sends Qiblai's grant of fealty to the Sultan and receives his grants of esteem (section 5) |
| **The eight monasteries** (ring 1; one colour each; unnamed) | Eight works, or eight sub-settlements if each keeps its own estate's yield (section 9, Q6). Their colleges copy the Song |
| **The kora's arcades**: the prayer wheels and chortens | The prayer-wheel works: copper and goldwork into wheels (an export, 100% of the map's) |
| **Pilgrims' hostels and the four gate markets** | A pilgrim flow: pilgrims come with the festivals' season and eat and give |
| **The Goldsmiths', Masons' and Spicers' halls** | Works (the guilds' Qiblai houses) |
| **Temple estates outside the walls**: hives, dairies, chahar-bagh gardens | Rural villages that tithe to `qib:hall`, not to the town: the first case of an estate (section 6) |
| **The ghats at the cataracts, the caravanserai on the Erehwon road, the ranch** | A caravanserai is a stop of the Erehwon–Qiblai road; the ranch is a ring village |

### 3c. Theodiga (5,000: 900 in the arcology, 4,100 in the town)

From its blueprint:

| Part | On the sim |
|---|---|
| Arcology, 900: priests, monks, grammarians, and the History Monks' fin of 25 | Sub-settlement `theo:arc`, which eats from stores. The Order's fin stays the Order's (its relation record) |
| The town's pilgrim trade, 1,300 | The pilgrim flow, which doubles at festival (the season) |
| **The Salvagers' guild**, 800 | **Scrap to iron**, as `PROPOSAL-LONGSONG-PINNACLE.md` section 7 designed it: only what the Dome has let fall, so it is a site that does not regrow, metered by the Register of Descents. The smelter needs bought coal or charcoal (`TRADE-SCOPE.md:312`). This is Xanadu's answer to its want of iron |
| Farming and herding, 900 | Part of the Vale's rural district |
| The Sultanate's office, 100 | The Vale's tax post |

### 3d. The smaller seats

- **Strongbow** (3,500): the Royal Opal Gate (Gemini), the lift up the 3,100 m scarp, and the end of Xanadu's Ancient road. On the sim it is a toll: every load on the Longsong road and the Twins pass pays a share at the lift (section 5). It makes tea, silk, lotus root and wild rice (census).
- **Kirstabal** (2,200): the Scarp's market town. Gemini made it a sea port and a sugar town; neither holds (no sea, the native rule). Its trade is the scarp's tea, cacao and poppy down to Qiblai by the 108 km barge route (Gemini's busiest internal link, 3,686 t).
- **Thalaba** (750): the north-shore village. In summer it stages the Godshearth expeditions, which bring back sulfur, machine-wax and vent goods. Its winter is fishing.
- **The gold mines, Strongwall, Opal Valley:** work camps on sites (section 4). They eat what P3 sends them.

### 3e. The villages and hamlets

The census engine (`KHAMLET.census`) fixes a village at 240 people (44 households) on the `xanadu` row and a ranch at 145. So the ~294,000 rural people are **about 1,200 villages and hamlets**. The sim does not draw them one by one:

- **Drawn and declared one by one**, about 75 places:
  - the 21 lake towns and 4 islands of section 2a;
  - each town's ring (the region's `sites.json`: 6 at Erehwon and 6 at Qiblai today, 3-4 to add at Theodiga and Kirstabal);
  - the named villages of section 2;
  - the work camps.
- **Declared in bulk**, one rural district per province:
  - one abstract settlement holding the rest (`people`, `works` per focus);
  - it eats its own harvest and tithes its surplus to its seat on a road with `share`, as Longsong's ring does;
  - the region page can still draw a sample of its villages near the camera from the province's land (`KHAMLET.village` on the farm mask), seeded by `KRAND` from (province, cell). The sim never counts those villages.
- **New foci on the `xanadu` row** (`core/hamlet/20-hamlet-cultures.js`), beside farming, ranch, mine and silk:
  - **fishing**, for the lake;
  - **orchard**: cacao, apricot, the strawberry-tree;
  - **tea garden**;
  - **saffron**;
  - **estate**: a temple estate's village, tithing to a temple;
  - **placer**: gold washing.

  Each needs its works in the Xanadu kit. The kit's own gaps list (`kits/xanadu/src/89-xa-trades.js:15`) already names the caravanserai, fishing dock, orchard, mine head and quarry.

## 4. Goods and chains

**Goods the sim carries for Xanadu:** grain, dairy, fish, fruit, cacao, saffron, tea, poppy (section 9, Q3), silk (raw and cloth), timber, potash, copper, gold ore, gold, goldwork, prayer wheels, coin, opal, marble, scrap, iron, coal, salt, pearls, wine, oil, arms, paper, books, lenses, honey, milk, ice.

The chains, each a batch recipe on the valley host:

| Chain | Where | What goes in and out |
|---|---|---|
| **Gold** | The gold mines (site `lode:xanadu-gold`, finite with a slow regen; a grade from the lode's byte) | Ore. Then **assay** at Strongwall or the Mint: ore to gold. The **Sultan's Fifth** comes off the top. Then the **Goldsmiths** of Erehwon and Qiblai: gold to goldwork. Then the **Mint**: gold to coin |
| **Copper** | Strongwall's band, Erehwon's east mines | Copper, used by the prayer wheels, the bronze, the copper smiths |
| **Silk** | Vale mulberry (P2, P3), Qiblai's reeling suburbs, Erehwon's weavers | Cocoons, then raw silk, then cloth dyed with saffron and maroon |
| **Cacao, saffron, tea, poppy** | The orchards and gardens of P2, P3 and P5 | Each dried and kept. Cacao and saffron are the Dome's and the gateway caravans' |
| **Iron** | **The import**, plus **scrap to iron** at Theodiga (Salvagers: the Dome's fall, bought coal) | Xanadu's want of iron is canon (LORE.md:508); the import comes from Iziz and Yuni through the gateways |
| **Salt** | **The import**: the shortfall of ~290 t (this line's figure; Gemini's is 1,543 t) | A third from the Dasri works on the Catch (Ṣalṭ al-Bān, batch 5.1e10, held), a third from the Izani works at the Bowl (Solta), the rest from Iziz and Yuni. Plus Qiblai's small pan (`TRADE-SCOPE.md:60-73`) |
| **Oil** | Qiblai's field, Yuni's mission, worked by the Geomancers (X2) | 20% of the oil to the Sultan by licence, 10% to the Prismarchy; both burned for power (Qiblai's avenues and all but its poor quarters; the large towns' avenues and the richest homes). The rest goes out by the Geomancers' caravans from Qiblai |
| **Opal** | Opal Valley | Opal and photonic opal; the Fifth to the Treasury, the rest to the gateway caravans |
| **Lacquerware** | Owed | The owner gives it to Xanadu and the Eternians, but it has no source tree or workshop yet (Q7) |

## 5. The polity: the Sultan's treasury, dues and transfers

The sim today owns stock only by settlement (SCHEMA.md:201-203). The polity level is one settlement that holds the
Sultan's account: `xan:citadel`, the Treasury. Every polity flow is a road or a transfer into or out of it.

| Flow | Kind | Rule |
|---|---|---|
| **The provinces' dues** | A road with `share` from each seat to the Treasury | A fraction of each seat's tithe intake: the Chancellor's provinces |
| **The Sultan's Fifth** | A road with `share` 0.2 | Gold, from the gold mines' assay; opal, from Opal Valley |
| **The oil licence** | `SIM.transfer`, every 30 days | Yuni's 20% of the oil to the Treasury (the 10% of profits waits on money M5) |
| **The Strongbow lift** | A road with `share`, on loads passing the lift | The Royal Opal Gate's toll |
| **Longsong's grant of fealty and the Sultan's grants of esteem** | The two `SIM.transfer`s already coded (`15-ls-tune.js:48`) | Now between the Order's house and **the Treasury**, not the off-map market |
| **Qiblai's grant of fealty and esteem** | Two `SIM.transfer`s on the same pattern, between `qib:hall` and the Treasury (`kits/qiblai/PLAN.md:128-132`) | The bills are to be set: a token of goldwork, wheels and books against grain and silk? (Q6) |
| **The court, the Dome, the garrison and the Marches** | Roads out of the Treasury, by `want` | The spendthrift Sultan (LORE.md:508): the Treasury should run short in a bad year, and the Marches' forts go short first. That is the lore's crisis, made by the sim |

## 6. Trade with the world: the gateways

**The rule** (the owner, 2026-11-12; `TRADE-SCOPE.md:19, 32-58`): the East Rift trades directly only with **Iziz, Yuni and
the Dasri**, over the Catch by Stair and the northern passes. Everyone else's goods come re-exported through them.

On the sim this is three off-map markets, one per gateway, each like today's "Xanadu market": a store with a price pool, reached by a caravan road with its days, carriers, `want` and `goods`.

| Road | From the East Rift side | To the gateway side | Out | In |
|---|---|---|---|---|
| **The Catch road** | Erehwon, via Thalaba or Strongbow, the Twins, Stair and the Catch oases (Lasso, Bitta, Arfwai, Kolli) | **Iziz** | Goldwork, cacao, saffron, tea, silk, opal | Iron, arms, salt, scrap |
| **The Catch road** | Same route | **The Dasri** | Same goods | The Catch's salt, alkali, lung salt |
| **The Yuni road** | By the northern passes, or by Strongbow and the Order's road | **Yuni** | Same goods | Electrics, firearms; the oil licence's people |

| **The Annual Great Caravan** (the owner, Q2: Dalab a fourth gateway) | Erehwon, over the North Rift Bench, 831 km, 90 days, once a year | **Dalab** (Nulab) | Cacao, saffron, opium, tea (Gemini: 414 t out) | 194 t back: Dalab's goods |

The caravan's operators are Dalab (46%), Xanadu (40%) and the Tungang Union (10%).

The fleets: Gemini gives Xanadu 12 inland barges, 69 wagon convoys and 43 pack caravans, with 2,910 beasts. On the valley host these become the roads' `carriers`.

**The internal roads** (`net51-gemini.json` class `xanadu`; Gemini's barge links):

| Road | Length | Mode |
|---|---|---|
| Erehwon–Qiblai | 321 km (56 km tunnel) | Ancient road |
| Erehwon–Theodiga | 228 km | Road |
| Qiblai–Strongwall | 83 km | Road |
| Qiblai–Strongbow | 160 km | Road |
| Strongbow–Longsong | 469 km | Partly decayed |
| Kirstabal–Qiblai | 108 km | Barge |
| Qiblai–Theodiga | 155 km | River barge |
| Erehwon–Thalaba | 69 km | Lake barge |

The region's baked link is 313.8 km (`sites.json`). Longsong's caravan still assumes 568 km and 23 days; it is to be reset to the baked 657 km.

## 7. The build, in steps

Each step ends in a node test on the valley host, with a negative for each check, as Longsong's test does.

- **X0. Data, no new mechanism.**
  - Write `XAN_TUNE`: a region tune like `LS_TUNE`, in a new `openworld/xanadu-oidong-highrift/src/15-xan-tune.js` or a shared `core/region` data file (Q8). It holds the settlement table of sections 2-3, the provinces' rural districts, the goods, the diets, the calendar (the Vale's harvest, the tea flush, the saffron's autumn, the festival seasons) and the roads of section 6.
  - Take the region's `sites.json` for the drawn villages.
  - **Test:** a year runs; every town is fed; the ledger closes; the Treasury gets its dues; the gold, silk and goldwork chains run.
- **X1. The valley host grows sites and multi-stop roads.**
  - `50-region-valley.js` passes `site` through to `SIM.recipe`, so the gold, opal, copper and the Dome's scrap deplete or regrow.
  - It allows a road of more than two stops (the Catch road's stages) and the toll's `share` on a passing road.
  - This is a small change to core/region, which Longsong's test must pass unchanged.
- **X2. The joint fragment, Xanadu with Oidong and the High Rift.**
  - Both tunes go into one valley run: one calendar, one ledger, 25 Order settlements plus about 60 Xanadu ones.
  - Longsong's caravan goes to Qiblai or the Strongbow lift, not the off-map market.
  - The fealty and esteem bills run between real treasuries.
  - **Test:** Longsong's ten checks still pass, plus Xanadu's.
  - **Built (2026-11-16).** `core/region/data/east-rift.js` (`EAST_RIFT.valley(Pxan, Pls)`) joins `XAN_TUNE` and `LS_TUNE` unchanged. Longsong's 24 settlements run at 10 people an actor and its calendar windows are prefixed `ls.`. Its caravan runs 19 days to Strongbow, where the Sultan's toll is cut. The fealty goes to `xan.citadel` and the esteem comes back from it. The Order's books, paper and lenses go out by the Iziz gateway. Test: `core/region/tests/test-east-rift.js`. The owner added to X2 that day:
    - **The lodes as fields.** "The gold and opal lodes should collectively last >200 years but individually lodes may dry up over the course of 2-3 years." `XAN_TUNE.field` makes a field of 85 veins, each 2-3 years of the mine's make (212 years in all). The valley host moves a work to its next vein when one runs dry.
    - **The oil field is both Yuni's mission and the Geomancers' concession, side by side** (the owner's answer, by way of the Qiblai kit's session). `yuni.mission` (40 people, faction `yuni`) stands beside `geo.oilfield` (300). The Geomancers ("mostly Yuni", LORE.md 6.9) work the wells, and their caravans stop at Qiblai: a fifth gateway, `gate.geomancers`. Section 4's "worked by Yuni" stands, in that sense. The Sultan takes a fifth by licence and the Prismarchy a tenth ("the council will take its cut").
    - **The power.** "Qiblai will be electrified along all major avenues and in buildings except in poor areas; elsewhere in Xanadu only the major avenues of large settlements, for defense, and in the richest of homes. just enough to use the cut of oil they get from Yuni." The Prismarchy's tenth is burned in Qiblai's generator. The Sultan's licence is split by `XAN_TUNE.lit` among the generators of the capital, Theodiga, Kirstabal, Strongbow and Phēr. Each town uses its power all year.
    - **Three merchant houses**, wary of one another, each a settlement beside its towns that sells back into them:
      - *The Brotherhood of the Two Horns*, the Twins' guides (`biomes/twins/PLAN.md` section 4). Their guild houses stand at Strongbow and at Stair, off the map, with factor houses in six towns. They take the Split Tally (4 %) on the Catch caravans and a 3 % margin where a factor stands. The Sultan's 5 % toll at the lift is cut beside them.
      - *The Golden Tears*, "a bit more militaristic, running expeditions into Lizard country to seek out unclaimed gold lodes". Their house is in the Gold March, with a factor in the capital. An armed camp of 120 works a field of short lodes on the Rift floor in the cool months. Its ore goes to the Sultan's assay, where the Fifth is taken of the gold. They also escort Dalab's Great Caravan, for 4 % of what it lands.
      - *The Rare Devisers*, "whose specialty is running the expeditions to the Godshearth". The owner added: "the rare devisers will have their main guild house at Theodiga; they are royally licensed in the scrap and rare artifact trade".
        - Their guild house at Theodiga takes all the Salvagers' scrap and sells it on to the smelter.
        - Their house at Thalaba sends the camp out. It works the vents in the expedition season; its sulfur, wax and rarities go home to that house, then down by Phēr and the lake to the capital and out with the Great Caravan (no longer by Yuni's caravans: they end at Qiblai).
        - ~~The Sultan's licence fee is 10 % of the rarities.~~ **The Sultan's share (the owner, 2026-11-16, `settlements/thalaba/PLAN.md`): "10% of the overall haul and 20% of the rarities", 20 % in all, "on dalab party too"**: `XAN_TUNE.haul`, cut where each Godshearth haul lands at Thalaba.
        - They also keep a factor in the capital.
    - **Thalaba moved** (the owner: "we can move thalaba to the mouth of godshearth and put a new village on the lake in its place"). It moves from the lake's north shore (825,1488) to the bench where Godshearth's spillway gorge opens (840,1463, about 1,550 m), as a town of 2,400. It makes the vents' sulfur, and its terraces grow half its grain. It is 3-4 days up from Phēr and no longer a caravan terminus (see the Great Caravan, below). Ōlḍ-Thalaba, a fishing village of 600, takes its place on the shore and in the north-east market round. The map's pins are queued with the scale-model session.
    - **Thalaba's site plan** (`settlements/thalaba/PLAN.md`, the owner's answers 2026-11-16): its own small deposit makes **30 t of sulfur a year** (a steady works, the crew halved to 180), most of its sulfur by expedition; **a Dalab mission of about 30** (`dalab.thalaba`, faction `dalab`), whose genepriests run **their own expedition** to the Grove with hired locals (`exp.dalab`, 40, *proposed* make 40 kg of `hearthseed` and 8 t of wax), the seed home to Dalab with the Great Caravan. Phēr and the capital now ask for Thalaba's export goods on the way down (the roads' `expect`), so they reach the capital for the caravan. Test: `test-xan-economy.js` checks 18c (the Sultan's share) and 18d (Thalaba).
    - **The Great Caravan** (the owner: "the great caravan will leave in the spring from Xanadu every year, go to south Dalab for the summer visiting Blakhed, Nulab, and Shelf, then return in the fall, spending the winter in Xanadu visiting Erewhon, Theodiga, and Qiblai").
      - `caravan.great` is one carrier on a round of seven stops, about 52 days a leg: Shelf, then Erehwon (year day ~311), Theodiga (~3), Qiblai (~55), back to Erehwon in the spring (~107), Blakhed (~159), Nulab (~211) and Shelf again (~263).
      - The three Dalab towns are off the map. Blakhed takes the exports (now with the vents' sulfur, wax and rarities); Shelf holds Dalab's salt, iron, wine and pearls.
      - The exports load at the capital in the spring, where the roads gather them. A round buys at each stop only what the next one wants, and a town that eats a good keeps it.
      - The Golden Tears' escort and the Two Horns' margin are cut where it lands at the capital.
      - The rarities the Godshearth camp brings home in summer leave with the next spring's caravan.
    - **The Order's monastery at Qiblai** (the owner, a proposal: "one of the monasteries of Qiblai (and therefore of the Prismatic Council) is a History Monk monastery, and uses the Order's banner and color. as such the order gets 1/8 of the council income").
      - `qb.order` is one of the eight great monasteries: about 300 of Qiblai's monks, faction `order`, its Prismarch on the council.
      - **The saffron one, settled by the owner ("Yes, saffron")**: spoke 1, north-east of the Temple Mountain, ~300 m from the centre; built on the Qiblai page with the Order's blue, a parabolic gate, a toron spire, drum halls and the Order's banners.
      - It takes an eighth of the council's income in two parts: of the Prismarchy's oil, a `cut` where it lands; and of the Sultan's grants of esteem, `esteem.qiblai.order`.
      - The Qiblai kit session has the building side.
    - **The Order of Viridian Thought** (the owner: "find a site that's a great tea production site and place the head monastery of Qiblai's green monastery there"). Qiblai's green monastery is this Order.
      - Its head monastery and tea estate, `qb.viridian`, stand at px 962,1562, found by a scan of the scale model for mist tea: 813 m, Cfb, 18 °C, ~2,300 mm of rain, a 20 % west-facing slope under the scarp. It is 104 km from Qiblai, 93 km from Kirstabal.
      - *Proposed:* 400 people and about 40 t of tea a year in the spring flush, sent to Qiblai, which feeds the estate.
      - The pin is queued with the scale-model session; the Qiblai kit session has the building side.
    - **The Order of the Azure Dream** (the owner: "Grēṭ-Āil will be the head monastery for qiblai's blue monastery, the Order of the Azure Dream"). Qiblai's blue monastery is this Order, and its head monastery is Grēṭ-Āil, the monastery isle in Erehwon's lake (`lk.great-isle`, 816.5,1501.5, 600 people, under Erehwon's hub). So two of the eight spokes now have head houses away from Qiblai: green on the scarp's tea, blue on the lake.
    - **The lake re-fit** (scale model 5.1 edit 7 re-run, 5f659c054 on claude/gemini-trade-reconcile, 2026-11-16: the lake
      narrower and in the valley's middle, 66 x 25 px round 845,1504, with the long isle).
      - The sim follows it. Erehwon is at 841,1517, with the Citadel, the Dome (on the Pleasure Dome's landform, 840.9,1516.8) and the three houses' factor houses beside it. Phēr is at 843,1491. Every shore town is on the cell the model's run gives it, and Ōlḍ-Thalaba is at 860,1496.
      - The long isle is Grēṭ-Āil, and the small isles moved with the lake. The march forts and the provinces' centres moved with Erehwon.
      - Each point was checked against the re-run model's water mask: shore towns are dry with the lake beside them, isles dry with the lake round them.
      - The cross-lake run and the road up to Thalaba are now measured from the towns. The old 34 km was half the true crossing even on the first lake; the crossing is now about 57 km.
      - Erehwon's ring hamlets follow the town until the region (`openworld/xanadu-oidong-highrift/plan/sites.json`) is recut on the re-run model. One hamlet, farm-1, is moved a cell inland because it would land in the lake.
    - **Phēr's additions** (the owner's answers in the Phēr plan's session, 8ef5899d0 on claude/pher-plan-55d3f2, 2026-11-16: "i likE all these").
      - **The cacao house** (`ph.cacao`): beans pressed into **cacao cakes** (`cacaocake`, a new good, 1.25 kg of beans to the kg). The cakes cross the lake to Erehwon and go out with the Great Caravan (`T.gateWant` 55 kg a day).
      - **The boat slip** (`ph.slip`): a work with no output, like `er.dockyard`.
      - **The ring**: six farming villages of 240 on the rim plain (`T.pherRing`), tithing to Phēr. Their people come out of Nōrth-Shor's bulk district.
      - **The fair's two days and the pilgrims' launches to Grēṭ-Āil** are `transport` records (`T.loops`). They are declared for the page that draws Phēr at 1:1 (its step P6); the valley runs its towns abstract, with no water layer, so it does not run them.
      - **The Thalaba road goes up the Qol valley** ("up into the qol valley"): about 105 km traced on the re-run model (`T.thalaba.roadKm`).
      - **Phēr's seat is held by the Sultan's heir** (the owner's later answer, narrowing "a family member of the sultan holds the seat"). That is recorded in the Phēr plan; the tune needs nothing for it.
      - **Phēr's small stream is named the Swīṭ Siṭrīm** ("sweet stream"). It rises in springs at the scarp's foot; the Phēr session's map edit draws it.
      - **The north-shore region** (`openworld/xanadu-north-shore`, Phēr and Thalaba, reaching east to Ḍāiyar, the long isle left out) is the Phēr session's. `T.pherRing` stands in until its core/hamlet ring is baked.
    - **The White Lily and the Flashing Eye** (the owner, by way of the Qiblai kit's session, f5a10f8a4).
      - Qiblai's **white monastery is the Order of the White Lily**, a medicine and healing Order. Its complex in Qiblai is its head house (it has none elsewhere) and the city's hospital.
      - The **crimson monastery is the Order of the Flashing Eye**; no head house is given for it yet.
      - The council's eight so far: saffron (the History Monks), green (Viridian Thought, the scarp's tea estate), blue (the Azure Dream, Grēṭ-Āil), white (the White Lily, Qiblai's hospital), crimson (the Flashing Eye), gold (the Yellow Monastery, the Order of the Beacon, its head house the beacon fort over the Rift: `settlements/beacon/PLAN.md`), and violet (the Order of the Violet Storm, its central monastery the House of the Tempest on the West Arm, 600, in the sim since Strongwall's W1). The White Lily also runs Kirstabal's latex house (K1). Turquoise is still unnamed. (LORE.md 6.13 carries the same, reconciled 2026-11-16.)
      - *Sim, proposed:* the White Lily's hospital could take medicine and herbs and give back the sick's working days; not built.
    - The houses and the camp places are *proposed*. Beyond the owner's words there is no lore for the Tears or the Devisers yet, and the camps' pixels are approximate.
- **X3. The gateways.**
  - The three gateway markets as off-map stores priced by PLAN-MONEY's M2 scarcity prices.
  - The caravans carry by want.
  - **Test:** iron, salt and arms arrive; goldwork and cacao go.
- **X4. The estates.**
  - A temple estate's village tithes to its temple, not to its town. Today that is a road with `share` to `qib:hall`; later it is an owner on the ledger (SCHEMA.md:201).
  - The Prismarchy's eight monasteries as eight such holders, if Q6 says so.
- **X5. The Marches and the Sultan's bad years.**
  - Lizardman raids as events on the Marches' forts and the Vale's southern villages: stock taken, a village's harvest cut.
  - The Treasury's shortfall reaching the garrison first.
  - These want core/simulation's events and the needs and unrest levels (the city host has them; the valley host does not yet).

**Sizes:** at the valley host's scale of 10 people per actor, 350,000 people would be 35,000 actors. So the scale is set per settlement, which the valley host takes after X1:

| Who | People per actor | People | Actors |
|---|---|---|---|
| The bulk rural districts | 250 | ~175,000 | ~700 |
| The towns and lake towns | 50 | ~120,000 | ~2,400 |
| The drawn villages, the islands, the work camps and the Order | 10 | ~30,000 | ~3,000 |

**The lake's traffic (section 2a)** is its own step, **X1b**:
- the launches as `transport` loops with timetables;
- the cargo roads between the towns and the hubs;
- the fishing works' morning window;
- the seven-day market week.

**Test:** every lake town is fed; fish reach the hubs; market days draw riders; and a launch's position on its loop at any hour agrees with the timetable (the drawing's contract).

## 8. What this does not do

- It does not draw anything: the region's page draws its sites as it does now.
- It does not move pins. The only map changes it relies on are already queued: Thalaba to 825,1488 (edit 7), and the 5.1e10 salt works, which the queue holds. **Superseded at X2:** Thalaba now goes to 840,1463, with Ōlḍ-Thalaba at 825,1488 and Lāiṭwāl at 1028,1653; all three are queued with the scale-model session.
- It does not touch core/simulation's contract. The changes are in core/region's valley host (X1) and the tunes.

## 9. Open questions for the owner

**Answered 2026-11-15** (the owner):
- **Q1, the scale:** first about 230,000, then (2026-11-16) "something between this and Gemini's numbers": **about
  350,000**, with the lake's shores holding a third of it on the pattern of Lake Atitlán, and constant boat traffic (sections 1 and 2a).
- **Q2, the Dalab caravan:** **Dalab becomes a fourth gateway.** The Annual Great Caravan stays: once a year, Erehwon to
  Nulab over the North Rift Bench (831 km, 90 days, run by Dalab, Xanadu and the Tungang Union). The rule now reads: the
  East Rift trades directly with Iziz, Yuni, the Dasri and Dalab. `TRADE-SCOPE.md`'s rule is to be updated to match.
- **Q3, opium:** **the sky poppy.** Its crop record takes the Vale (P2) and the Scarp (P5) as homes beside Oidong, and its
  resin is Xanadu's opium export.
- **Q4, Strongbow:** **the Sultan's.** It is the royal lift and toll gate at the end of Xanadu's Ancient road; the toll goes to
  the Treasury (section 5).
- **Q5, the province names:** **Xanadui names**, with the English working names as glosses. They are coined below on the
  owner's tongues sheet: English worn to sound Nepali, Tibetan or Persian, as in `biomes/gills/PLAN.md` section 9a. The
  rules used: **t d** > **ṭ ḍ**; **f** > **ph**; **v** > **bh**; **c/k** > **q** before a back vowel; an initial **sc-/st-**
  breaks up, as *stream* > *Siṭrīm*; long vowels are marked. All are *proposed*:

  | # | Xanadui | Gloss |
  |---|---|---|
  | P1 | **Lēk-Shor** | the Lake Shore |
  | P2 | **Bhēl** | the Vale (*vale*, with **v** > **bh**); in full, *Bhēl-Zānaḍu* |
  | P3 | **Qāṭarāq** | the Cataracts (*cataract*), Qiblai's lowlands on Nahr ash-Shalālāt |
  | P4 | **Gōlḍ-Mārch** | the Gold March |
  | P5 | **Siqārp** | the Scarp |
  | P6 | **Ōpal-Bhālī** | Opal Valley |
  | P7 | **Nōrth-Shor** | the North Shore (the dental **th** kept, as in *Thin Yīr*) |
  | P8 | **Mārchiz** | the Marches, the Lizardman frontier |

- **Q6, Qiblai's estates:** **each monastery holds its own.** There are eight holders, one per colour monastery, each with its
  estate villages (hives, dairies, gardens) tithing to it. The Hall of the Decree is fed by the eight, so the Prismarchy's
  politics has a ledger (X4). The grant of fealty's bill and the esteem's are still to be set.
- **Q7, lacquer:** **a Vale lacquer tree.** It is a new crop record in `kits/crops`, a tree tapped for its sap like the real
  lacquer tree, *Lāqar Ṭrī*, at home in the Vale (P2) and the Scarp (P5). The workshop is in Erehwon's industry quarter.
  Lacquerware then joins the gateway caravans' goods.
- **Q8, where the tune lives:** **a shared `core/region` data file** (`core/region/data/xan-tune.js`, say). Both open-world
  regions, Longsong's page and the joint fragment's test read it in place, beside Longsong's `LS_TUNE`.

1. **The scale of the country.**
   - (a) About 230,000: lore-sized towns plus Gemini's rural share (recommended).
   - (b) Gemini's 465,300 with Erehwon at 55,000.
   - (c) This line's census, 45,650.
2. **The Annual Great Caravan with Dalab** (Gemini's Nulab–Erehwon run). Drop it under the gateway rule, or make Dalab a fourth gateway?
3. **Opium.**
   - Gemini makes Xanadu the world's opium source (94%). Is that the **sky poppy**, the Vale's native crop?
   - If so, its crop record needs `xanadu` among its homes; today its only home is `oidong`.
4. **Strongbow** is in both polygons. Is it the Sultan's (a royal lift and toll) or the Order's?
5. **Province names and seats** (section 2). The Chancellor's provinces want names: Xanadui names in the language's style, or English working names?
6. **Qiblai's economy.**
   - Do the eight monasteries each hold their own temple estates (eight holders), or does the Hall of the Decree hold them all?
   - What does Qiblai's grant of fealty carry, and the Sultan's esteem back?
7. **Lacquerware.** Which tree gives Xanadu's lacquer (a new crop record), and where is the workshop: Erehwon's industry, or Qiblai?
8. **Where the tune lives:** in the region (`openworld/xanadu-oidong-highrift/src`), or in a shared `core/region/data` that the Oidong region also reads?

## 10. Found on the way (to fix with or before X0)

1. **Gemini's ids.**
   - The gold mines have three ids (`sxangold01`, `ssrnk21ybu` and `gem_xanadu_goldfields`) against the page's `smgxtultfq`; Gemini's files are to be re-keyed to the page's.
   - The trade files report towns at 4.5x their sim population.
2. **Gemini's Kirstabal** is a sea port (3,819 t of sea tonnage) in a country with no sea, and grows sugar, coffee and cotton against the native rule.
3. **The crops kit.**
   - Cacao's and the violet plantain's warmth (4) is above the `xanadu` zones' (to 3), so `CROPS.at` cannot grow them at home.
   - The `xanadu` biome's air is 1 atm; the Vale is at 1.55-1.70.
4. **Thalaba.** The page holds 825,1481; edit 7's report has 825,1488, and no SETT_MOVED entry exists for it.
5. **The lake.** Edit 7's report gives the lake a mean of 37 °C and a high of 46 °C, against the Vale floor's 25 °C. That is either a hot caldera, or a fault to check.
6. **Erewhon or Erehwon:** the lore and the region docs say Erewhon; the pin and Gemini's files say Erehwon.
7. **The Vale biome kit** (`biomes/xanadu/PLAN-STATIONS.md`) still describes the lake before edit 7: -717 m, its outlet a cataract, the Ālph's head at the White Gills.
8. **Longsong's caravan** assumes 568 km; the baked link is 657 km.
