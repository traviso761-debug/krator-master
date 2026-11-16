# Phēr, the north shore's fair: a lake town of 6,000 on Erewhon's caldera lake (proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall"*.

Everything here is *proposed* except what the owner or the lore has said, and what the sim already holds. The sim's
facts are marked with their source.

**Re-seated the same day.** The first version of this plan (b9a5543bb) put Phēr at 810,1483, on the old lake's north
shore by the Bhon Ḍrāi's fan. The owner then re-made the lake (*"a little narrower and ... more toward the center of the
valley? settlements can move with it"*; scale model 5.1 edit 7 re-run, 5f659c054 on `claude/gemini-trade-reconcile`).
Phēr moved with it to **843,1491**, and the sim was re-fitted (`claude/openworld-sites-24defd`, 6b7feead1). This version
is surveyed on the re-run model. The wadi is now 60 km west and plays no part here.

**The owner's answers (2026-11-16)** to section 7's questions:
- the town on **two levels**;
- a **headland and a cove** for the harbour;
- a **small stream** for the town;
- the seat held by **a member of the Sultan's family**: **the heir** (the owner, 2026-11-16, question 9);
- **every proposed addition** to the economy;
- a **new open-world region north of Erewhon's** that also holds Thalaba;
- the road **up the Qol Siṭrīm's valley**;
- the name kept.

They are written into the sections below.

What is already settled:
- **The town is the sim's** (`core/region/data/xan-tune.js` at 6b7feead1; `core/simulation/PROPOSAL-XANADU.md` sections 2,
  2a and 7). `xan.pher`, "Phēr (the north shore's fair)", px 843,1491, 6,000 people.
  - It is the seat of province P7, **Nōrth-Shor** (the North Shore).
  - It is the northern of the lake's two hubs: Erehwon (now 841,1517) in the south, Phēr in the north.
- **The lake is Atitlán's pattern** (the owner, 2026-11-16: *"There should be many villages and hamlets along the lakes;
  Lake Atitlán is the inspiration. There will be constant boat traffic."*).
  - About twenty lake towns, about two hundred hamlets and some five hundred boats.
  - A seven-day market week: Erehwon's great market and Phēr's fair take two days each.
- **The long isle** (the owner, 2026-11-16: *"add one large oblong island in the middle of the lake"*): Grēṭ-Āil, 24 × 8 px
  and 300 m high, at 845,1504, the head monastery of the Order of the Azure Dream. It lies between the two hubs.
- **Thalaba moved** to the mouth of Godshearth, 840,1463 (the owner, 2026-11-16). The road to it goes up the Qol Siṭrīm's
  valley (the owner, 2026-11-16): about 105 km from the new shore, about 4 days (section 3; the tune still has 68 km).
  - Grain, salt and tea go up that road.
  - The vents' sulfur, hearth wax and rarities come down it.
- **The north's salt** comes with Dalab's Great Caravan to the capital, then by the lake to Phēr (the owner, 2026-11-16).
- **The oil licence** (the owner, PROPOSAL-XANADU.md section 7: *"only the major avenues of large settlements"*): Phēr's
  generator takes 15 % of the Sultan's licence (`T.lit`) and lights its avenues.
- **The Two Horns** keep a factor house at Phēr (`horns.pher`, now 843,1490).

Sources:
- `core/region/data/xan-tune.js` (6b7feead1): the town, its fishing, the roads, the rounds, the dues and the licence.
- `core/simulation/PROPOSAL-XANADU.md`: section 2 (P7), section 2a (the lake towns, the boats, the market week), section 7.
- `settlements/thalaba/PLAN.md` (18e5611c1): the road, from the other end. It was written for the old shore.
- `settlements/lightwall/PLAN.md`: the pattern for this plan.
- The scale model 5.1 with edit 7 re-run (5f659c054, `tools/scale-model/model/data`):
  - `h.png` decoded as (R·256+G)/65535·29,600 − 2,600 m, with B > 127 meaning water;
  - `tm.png` (mean °C + 90), `p.png` (rain = byte/255 · 4,000 mm), `c.png` (`climate.json`'s classes);
  - `rivers.json`, `landforms.json`;
  - air from `core/world`'s formula, 1.6 atm · e^(−h/8,000 m).

## 1. The site

**px 843,1491, as the sim has it** (world x −696,000 m, z −156,000 m on the 5.1 frame, origin 1191,1569).

The cell is on the caldera's north wall, one cell back from the shore bench (843,1492) and two from the water (843,1493).
It looks south over the lake to the long isle, 26 km off, and past it to Erehwon. Here the north shore bends from running
east-west (x 830-836, on row 1489) to running east-south-east (x 837-857, about one row down for every three columns).
The town is proposed on the bench and the wall, with an upper town on the rim. That is Atitlán's own pairing: Panajachel
at the water and Sololá on the rim above it, about 550 m higher and 5 km apart, joined by one climbing road.

### 1.1 The survey (the re-run model)

| | |
|---|---|
| **The shore** | One cell of stamped shore bench at **−500 m** along the diagonal shore: 841-842 on row 1491, 843-845 on row 1492, 846-850 on row 1493. That is **20 m over the lake**, which stands at **−520 m** |
| **The pin's cell** | 843,1491: **−447 m**, 73 m over the lake, on the wall's foot |
| **The wall** | The model's stamped steps: **−260 m** (844,1491), **−177 m** (843,1490), **−30 to −5 m** (844-848,1490). Up the 843 column at 1:1 (bilinear): **−446 m** at the pin, −185 m at 2 km, **−22 m at 4 km**, −5 m at 6 km. The climb is 120-135 m a km (7-8°) |
| **The rim plain** | From 4 km back, a broad plain rising north at a steady **6-7 m a km**: −20 m at the rim, +60 m by row 1483 (16 km), +130 m by row 1477 (28 km). Within 15 km, the 54 cells under 20 m a km of slope (**216 km²**, −11 to +63 m) are all on it |
| **The scarp** | North of row 1477 the ground climbs hard: 205 m at row 1476, 544 m at 1474, 1,080 m at 1471, 1,190 m at 1470 (an average of about 90 m a km over 12 km). Then the bench rises gently to **Thalaba, 1,507 m** at 840,1463 |
| **Rivers** | **None within 15 km on the model** (the owner's stream is to be added: section 1.2). The Qol Siṭrīm (`r272`, perennial, 139.7 m³/s) now reaches the lake at 824,1489, 38 km west, by Malbari. The Bhon Ḍrāi (`r492`, a wadi) ends at 813,1491, 60 km west. The Sakāi Ḍrāi (`r488`, a wadi, 5.8 m³/s) ends at 881,1506, east of Ḍāiyar. The town drinks the lake (fresh: it drains by the Ālph) and wells on the rim |
| **The water off the town** | The caldera bowl drops very fast. Down the 843 column the bed is **−668 m** 4 km out (148 m deep), −833 m at 6 km, −1,226 m at 10 km and −1,375 m at 12 km (855 m deep). Then it shoals to −666 m and −574 m under the long isle's flank (row 1498-1499). Boats cannot anchor in open water: they need a harbour built on the bench or a cove in the 1:1 shore (section 1.2) |
| **Climate** | Shore: **24 °C** mean, **~1,430 mm** of rain, **Cfa** (the lake's warmth and wet). Rim plain: **21 °C**, ~900-1,000 mm, mostly **Csa** (dry summers), with Cfb to the east. Within 15 km of the pin: Csa 50 cells, Cfa 30, Cfb 13, Am 5, Aw 2, lake 77 |
| **Air** | **1.69 atm** on the shore, 1.60 atm on the rim |
| **Within 15 km** | 177 cells: 100 land (400 km²) and 77 water (308 km²). The land runs from −500 to +63 m, median −11 m |
| **Lodes** | None within 80 km (`kits/resources/data/lodes.json`). The north shore's wealth is the land, the lake and the road |

**Neighbours** (the re-fitted `T.lake` and `T.islands`):

| Place | px | Distance | Notes |
|---|---|---|---|
| Qōqō (cocoa) | 838,1489 | 11 km W | the north-west round's first call |
| Māuṭh (mouth) | 852,1494 | 19 km E | the north-east round's first call |
| Nēṭ (net) | 833,1488 | 21 km W | |
| Grēṭ-Āil (the long isle) | 845,1504 | 26 km S | the Azure Dream's head monastery; pilgrims take ship at Phēr |
| Wesṭ-Āil (the fishermen's isle) | 831,1499 | 29 km SW | |
| Ōlḍ-Thalaba | 860,1496 | 35 km E | |
| Malbari (mulberry) | 825,1488 | 37 km W | silk; one of the market week's days; the Qol Siṭrīm's mouth |
| Hāibh (hive) | 817,1490 | 52 km W | the north-west round's last call |
| **Erehwon** | 841,1517 | **52 km S** straight, about 57 km round the long isle | the cross-lake run |
| **Thalaba** | 840,1463 | 56 km N straight, about 105 km by the Qol road | the road up |
| Ḍāiyar (dyer) | 870,1500 | 57 km ESE | the north-east round's last call |

### 1.2 What depends on the shore at 1:1

The re-run's shore has bays and headlands in places, but at Phēr the model's coast is a smooth diagonal with the stamped
three-step wall behind it. The open world's 1:1 shore will come from `core/coast` (`KCOAST`, a coast profile per stretch)
and its warp. These things depend on it:

1. **The harbour: a headland and a cove (the owner, 2026-11-16).** The bed falls about 150 m in the first 4 km off the
   bench, so the boats need shelter close in.
   - *Proposed:* **the headland** runs out about 1.5 km south-east from the shore's bend at about 839.5,1491. It is a
     ridge of the wall's rock, 40-80 m over the water.
   - **The cove** lies east of it, its head at about 842.5,1492, under the pin: about 1 km across and 600 m deep, opening
     south-east toward the long isle, 10-30 m deep inside.
   - On the model this is a scale-model edit: the heights and water of cells 839-843 by 1491-1493. At 1:1 it can instead
     be a `KCOAST` stretch, if the coast module takes a headland and pocket bay as a profile.
   - A short stone mole closes the cove's mouth only if it is open to a long fetch.
2. **The stream (the owner, 2026-11-16: "give it a small stream").** *Proposed:* a perennial stream of about
   **1-3 m³/s**, a new river record.
   - It rises in springs at the scarp's foot, about 843,1477, at +130 m.
   - It runs south across the plain, about 22 km at 6-7 m a km, through a shallow vale.
   - It drops down the wall in a ravine to the cove's head at about 842.5,1492.
   - Its catchment is the scarp's face and the plain, about 250 km² at ~1,000 mm.
   - Its name is coined (the owner, 2026-11-16: "coined name"): **Swīṭ Siṭrīm**, "sweet stream" (`r_pher_swit`).

   The stream gives Phēr water and a wooded ravine, the way down for the town's terraces, and a mouth for the dugouts'
   beach. On the model it is a `rivers.json` record and a ravine cut in `h.png`: the scale-model session's queue.
3. **The bench's width.** The model's shore bench is one cell at −500 m, which at 1:1 is a slope, not a shelf. Lower Phēr
   needs about 300-500 m of near-level strand: a coast profile with a shingle or sand shelf here, or the quays cut in.
4. **The wall's benches.** The three equal steps give a plain 7-8° ramp at 1:1. One bench at about −250 m (the step at
   843,1490) would carry the governor's house and the middle town; without it, the streets switch back up the ramp.
5. **The Ālph gorge.** Not settled: whether the lake floods up the Ālph's gorge. It does not reach Phēr, but it would move
   the lake's level only if the outlet changes. The plan assumes −520 m.

### 1.3 Alternatives weighed

| Site | px | Ground | Why not first |
|---|---|---|---|
| **The wall at the bend** (chosen, the sim's pin) | 843,1491 | bench at −500 m, wall to the rim at −20 m, the plain beyond | |
| The bend's west side | 837,1489 | the shore cell where the coast turns, −500 m | It is Qōqō's place (838,1489), 11 km from Phēr. The bend may give the headland for Phēr's harbour instead |
| The rim alone (Sololá's place) | 843,1488 | the plain at −5 m, flat, 21 °C | 4 km and 450 m up from the boats. The lake's northern hub has to be on the water; the rim gets the upper town (section 3) |

## 2. Who lives there (*proposed* split of the sim's 6,000)

| Group | People (with households) | What they do |
|---|---|---|
| **The fishers** | ~2,200 | The dugouts: the tune's **600 fishing crew** (`ph.fishing`), out at dawn and back by noon, every day but the fair's |
| **The boat people** | ~800 | Crews of the launches and cargo boats based at Phēr: the cross-lake run's six carriers, the two market-boat rounds, the pilgrims' launches to Grēṭ-Āil, the passenger launches of the north shore. Caulkers, sailmakers and a repair slip (the hulls are laid down at Boṭ-Yārḍ, across the lake) |
| **The fair's people** | ~1,100 | Brokers, warehousemen, porters, the fish market's sellers and salters, the weighmasters; the cacao and silk buyers from the north-shore towns; inns for the fair's crowds |
| **The road's people** | ~350 | Muleteers and carters on the Thalaba road (the tune's six carriers), farriers, harness makers, the caravanserai's keepers, the granary men |
| **The Sultan's people** | ~350 | **The governor of Nōrth-Shor, the Sultan's heir** (the owner, 2026-11-16), and the governor's household; the tax and dues clerks (section 4); the harbour master; the customs launch; the generator's keepers and lamplighters; a small watch (~60) |
| **The temples' people** | ~150 | A temple of the Decree; a house of the Azure Dream where the pilgrims to Grēṭ-Āil wait for the launch (*proposed*) |
| **The rest** | ~1,050 | Craftsmen, servants, gardeners of the wall's terraces, the rim's market gardeners |

**The Two Horns' factor** (`horns.pher`) is the one merchant house the tune gives Phēr. *Proposed:* no other X2 house keeps a
factor here. The Rare Devisers buy Godshearth's rarities at Thalaba, and the Golden Tears work in Lizard country.

The people are Xanadui of the lake (the tune's `lake` diet). *Proposed:* they speak the lake's Xanadui, and the fair draws
traders from every north-shore town.

## 3. The layout (*proposed*)

The town has three parts, read bottom to top as Atitlán's towns are, joined by one lit avenue.

The two levels are the owner's (2026-11-16); the rest of this section is *proposed*.

**The strand (Lower Phēr), on the bench round the cove, 0-40 m over the water, about 2.5 km along the shore.**
- **The harbour:** the cove behind the western headland (section 1.2), with the Xanadu kit's quay, boat shed and warehouse
  (`87c-xa-erewhon.js`) along its west and north sides. The launches' landing and the cargo boats' berths are inside it.
- **The stream's mouth** at the cove's head, with the dugouts drawn up on its gravel beach, and the kit's street bridge
  (`87c`) over it on the strand.
- **The headland:** the harbour light and the watch's post at its tip; the governor's water-stair where the court's barge
  lands.
- **The fish market and the strand's bazaar** behind the quays (`75-xa-trade.js`), the harbour master's house and the
  customs.
- **The pilgrims' house** of the Azure Dream by the landing, facing the long isle.
- **The warehouses** and **the generator house** (`79-xa-guild.js`), where the oil comes in by boat. The lit avenue starts
  here.
- **The boat people's and fishers' houses** along the strand and up the wall's foot: the Palopó shop-houses
  (`87b-xa-andean.js`, after Santa Catarina Palopó on Atitlán).

**The wall (Middle Phēr), from −480 m to about −100 m.**
- **The lit avenue** climbs the wall in long switchbacks, about 6 km of road for 450 m of height. The Sultan's licence
  lights it (`T.lit`), with the kit's street lights (`83-xa-turk.js`).
- **Houses** climb either side in terraced streets: the middling and the rich higher, with the view of the isle, in the
  kit's Turkish and Persian houses and the cholets (`87b`).
- **The governor's house** on the bench at about −250 m (the step at 843,1490), over the harbour: a palace in small for a
  member of the Sultan's family, with a garden court and a terrace over the cove (the citadel's dars, `78n-xa-citadel.js`,
  are the nearest drawn).
- **The stream's ravine** beside the avenue: wooded, with the terraces' water drawn off it in channels.
- **The Two Horns' factor house** at the wall's upper bend (the tune's 843,1490), between the harbour and the fair.
- **The terraced gardens** of the wall: fruit, mulberry and vegetables between the streets, watered from the stream.

**The rim (Upper Phēr), −30 to 0 m.**
- **The fair ground:** a great open square where the avenue reaches the plain, as Sololá's market stands above Panajachel.
  On the fair's two days the north-shore towns' people land at the harbour and climb to it, and the rim's farmers and the
  Thalaba road's carts come in from the north. On other days it is the daily market, under the bazaar rows.
- **The temple of the Decree** on the square (`77-xa-sacred.js`).
- **The caravanserai** on the square's north side, where the Thalaba road begins (Qiblai's caravanserai, `89q3-qb-sacred.js`,
  is the nearest drawn; the Xanadu kit has none).
- **The province's granaries** (`76-xa-farm.js`), where Nōrth-Shor's tithe grain is stored, the mule yards, and the watch's
  barracks (`80-xa-military.js`).
- **Water:** the stream, which crosses the rim beside the fair ground, with a weir and a tank for the upper town.
- **The farmland:** the plain north, east and west, 216 km² of gentle ground within 15 km, in the province's farming
  villages.

**The road up to Thalaba: up the Qol Siṭrīm's valley (the owner, 2026-11-16).** Traced on the re-run model:
- **Across the plain:** west-north-west from the fair ground (843,1488, −5 m) along the rim plain, past above Qōqō and Nēṭ,
  to the Qol where it leaves its lower gorge, about 822.7,1480 (the bed at 9 m, the plain 80 m). That is about 42 km at
  −25 to +40 m.
  - The road keeps north of the Qol's lower gorge (rows 1482-1488, 300-450 m deep), which reaches the lake at Malbari.
  - A bridge or ford there; *proposed:* the road's one bridge, with a caravan halt (a hamlet).
- **Up the valley:** the Qol's bed climbs from 9 m to 1,198 m at the valley head (826.7,1463.6) in about 34 km.
  - The bed: 126 m at row 1477.6, 321 m at 1475.6, 480 m at 1473.6, 638 m at 1471.6, 840 m at 1469.6, 1,116 m at 1467.6.
  - The steep part is between rows 1470 and 1468, about 300 m in 4 km: the Thalaba plan's "second fall", where the road
    climbs the valley side.
- **The bench:** east from the head to Thalaba (840,1463), about 27 km, over a rise of about 1,515 m (833.5,1463.5).

That makes **about 105 km, about 4 days** at the tune's 25 km a day. The tune's `road.pher-thalaba` still measures 68 km
(the straight line × 1.2), so it should be lengthened (section 8). It joins the Thalaba plan's road, which was drawn up
the same valley from the old shore.

**The mule path** (the owner, 2026-11-16, in the Thalaba session: "Yes, a mule path"; `settlements/thalaba`): pack mules and
walkers take the straight line up the scarp from Thalaba, reaching Phēr's rim by the fair ground (about 841.25,1488.25) and going
down the wall into the town. On the town's page it is the way north from the fair ground; the carts keep the Qol road.

**The edges.** P7's ~60 lake hamlets between the towns, and the plain's farming villages, are left to `core/hamlet` (a ring
like Erehwon's and Qiblai's, `KHAMLET.village`) after the town is built.

## 4. The economy (in `XAN_TUNE` as it stands; *proposed* additions marked)

**What the tune already has** (`core/region/data/xan-tune.js` at 6b7feead1):
- **The town:** `xan.pher`, 6,000 people, the `lake` diet.
- **Its one work: the dugouts** (`ph.fishing`): 600 crew, 6,000 × 260 kg × 0.6 = **936 t of fish a year**. Its fishery
  holds half a year's catch (468 t) and regrows a day's catch (2.6 t) each night.
- **It is fed from its province.** P7's countryside (25,000 rural people, 1.5 t/ha; its extras silk 14 t, cacao 60 t,
  honey 12 t and fruit 300 t a year) tithes grain to Phēr. The tithe covers Phēr's own table, the north-shore lake towns'
  shortfall (each grows three fifths of its grain on its terraces), the half of Thalaba's grain that its terraces do not
  grow, and the dues, with a 15 % margin. If the province cannot cover it, the rest passes to the capital (`passTo`).
- **The dues to the Treasury** after the harvest: grain 30 t, silk 300 kg, honey 400 kg.
- **The cross-lake run** (`lake.cross`): measured from the two towns, 52 km straight and a tenth more round the long isle
  (about 57 km, 5.8 hours at 12 km/h with the hour's loading); six carriers, 20 t each, want 12.
  - The capital to Phēr: grain, salt, tea, tools, pottery and mats; the north's salt (from the Great Caravan), iron and
    arms; and what Thalaba takes.
  - Phēr to the capital: fish, silk, cacao, honey, fruit, and the vents' sulfur, wax and rarities.
- **The road to Thalaba** (`road.pher-thalaba`): 68 km in the tune (about 105 km by the Qol road: section 3), six
  carriers, 10 t each. Up: grain, tea, tools and salt.
  Down: sulfur, wax and rarities.
- **The rounds:** `round.north-west` (Qōqō, Nēṭ, Malbari, Hāibh) and `round.north-east` (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar). At
  each town a market boat buys what the next one wants.
- **The licence:** 15 % of the Sultan's oil licence to Phēr's dynamo (`T.lit`), used all year.
- **The Two Horns' factor house** (`horns.pher`).

**Additions: all five taken (the owner, 2026-11-16: "i like all these").** The forms below are *proposed*; they go in the
tune at step P1 (the tune's session):
- **The fair as a sim event.** On the fair's two days each week, the north-shore towns' people ride the launches to Phēr
  and back (`transport` records, 77-sim-5r, as section 2a of the proposal plans). The rounds' boats meet at Phēr instead
  of calling round. Nothing new is made: it moves people and changes when goods move.
- **The pilgrims' launches** to Grēṭ-Āil: a `transport` loop from Phēr's landing to the long isle, 26 km.
- **The cacao house.** Qōqō's cacao and the province's 60 t come to Phēr, are roasted and pressed (a batch chain, like the
  weavers'), and go across the lake as cakes: a new good, *cacao cakes*, beside the beans. The house stands on the
  strand by the warehouses.
- **The boat slip.** A repair work for the hub's boats (no output in the tune, like `er.dockyard`).
- **The plain's farms as named villages.** A ring of `KHAMLET` farming villages on the rim plain, tithing to Phēr, as
  Erehwon's and Qiblai's rings do, taking their people out of P7's bulk district.

## 5. Core adoption (to write in full before the first fragment)

| Need | Module | How |
|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | **A new open-world region north of Erewhon's that also holds Thalaba** (the owner, 2026-11-16). *Proposed:* `openworld/xanadu-north-shore`, cut by `tools/scale-model/cut_site.py` from the re-run model. Its box is about px 815-870 by 1455-1498 (110 by 86 km). It takes Phēr, the Qol Siṭrīm's valley and the road, Thalaba and its bench, Godshearth's mouth, the shore from Hāibh's side to Ōlḍ-Thalaba, and the long isle's north shore. It starts as a `SITES.json` entry each for Phēr and Thalaba. The Qol road joins `ROADS` |
| The shore and the harbour | `core/coast` (`KCOAST`) | The north shore's coast profile; the headland and the cove, stamped on the model first (section 1.2). `core/terrain` for the wall's bench at −250 m, if the model keeps its plain ramp |
| The stream | `core/water` | The stream's bed and its ravine down the wall from its `rivers.json` record, as the region's other rivers |
| The lake | `core/water` | The lake surface at −520 m; the harbour's still water inside the mole |
| The streets and lots | `core/city` (`KCITY`) | The town on core/city as Qiblai and Erehwon are: the quays and the fair ground as the civic set; the lit avenue as the main street; the terraced streets up the wall as side streets on the slope rule. A target on Xanadu's page, as Qiblai is |
| The buildings | `kits/xanadu` | The quay, boat shed, warehouse and bridge (`87c`); the bazaar rows (`75`); the Palopó shop-house and the cholets (`87b`); the Turkish houses and the street lights (`83`); the temple (`77`); the generator (`79`); the granary and the terraced farm (`76`); the barracks and the watch (`80`). The caravanserai from `kits/qiblai` (`89q3`), or a Xanadu one owed. The Azure Dream's pilgrims' house: Qiblai's pilgrims' hostel (`89q3`) in the Azure Dream's dress, if the kit has it |
| The boats | owed | The lake craft are owed (PROPOSAL-XANADU.md section 2a): the dugout, the launch, the cargo barge. `kits/ringsea` has none of them. Phēr's harbour is where most of them are seen at once |
| Placement | `core/rand` (`KRAND`), `core/tags`, `core/space` | Every lot, boat and stall seeded from (world, cell, index, salt); registered before it is drawn |
| The fair's awnings and stalls | `kits/catalog` | The catalog's market pieces in the Xanadu culture |
| Interiors | `kits/interiors` | The Xanadu interiors for the governor's house, the factor house and the inns |
| Life | `core/charactermodels` | The lake Xanadui; the crowds of the fair's days from the sim's `transport` records |
| The economy | `core/region` | The valley host (`XAN_TUNE`), as it stands |

## 6. Steps

| Step | What | Test |
|---|---|---|
| **P0** | **The map:** scale-model edits through the scale-model session's queue: a `SETT_ADDED` pin (Phēr, a town of P7, at 843,1491 on the re-run model); the headland and the cove; the stream (a `rivers.json` record and its ravine) | the pin dry, on the wall's foot at −447 m; the cove's water connected to the lake; the stream reaching the cove, downhill all the way |
| **P1** | **The tune:** the five additions; the Qol road's length (~105 km); P7's point moved | `test-xan-economy.js` unchanged unless meant to move; Phēr and Thalaba fed |
| **P2** | **The region:** `openworld/xanadu-north-shore` cut, with Phēr's and Thalaba's `SITES.json` entries; the shore with `KCOAST`; the Qol road in `ROADS` | the region's verify: the strand dry, the cove's water still, the bench walkable, the road on the ground |
| **P3** | **The town on `core/city`** with the Xanadu kit: the strand, the wall, the rim, the lit avenue | its city tests; the GPU verify |
| **P4** | **The boats** (owed models), and the harbour's traffic drawn from the sim | the boats on the water, none aground or through the headland |
| **P5** | **Interiors** for the governor's house, the factor house, the inns | the interiors' checks |
| **P6** | **The fair's days:** the launches' `transport` loops and the crowds climbing to the fair ground | the sim's market-week test |
| **P7** | **The town in the region:** the page's ground and the world's met; Phēr's footprint on core/world in `openworld/xanadu-north-shore` | the region's verify, the town's |

**Done (2026-11-16, the owner: "do p0-3"):**
- **P0:** `tools/scale-model/edit_517_pher.py` (the pin `spher0north1`, the headland, the east point, the Swīṭ Siṭrīm); `tests/test_smodel.py` section 17.
- **P1:** `core/region/data/xan-tune.js` (82dd21e8f, the open-world sites session): the five additions, the Qol road at 105 km, P7's point; `test-xan-economy.js` 50 passed.
- **P2:** `openworld/xanadu-north-shore` (README.md there): the cut, Phēr's farming ring, the Thalaba road (104.8 km, 7 hans, 6 bridges); its GPU verify passes.
- **P3:** this folder's town on `core/city` (README.md): two levels and the wall between, about 1,190 buildings for about 6,300 people; `tests/test-pher-site.js` and `verify.py`.

**Done (2026-11-16, the owner: "work on p4-p5 and open / missing issues"; answers 12-14):**
- **The heir's seat** (12, "yes and yes"): the palace above the top terrace (the kit's hollow citadel palace, the Grand Vizier's design, walk-in), its garden court and gate, the barracks and watch of the Sultan's own guard, the water-stair on the cove and the heir's barge.
- **The caravanserai** (13, "build xanadu one"): `xa_caravanserai`, the kit's new piece (opt-in, `kits/xanadu/extra`), on the rim by the Thalaba road, with its mule yard.
- **The wall** (14, "houses line lower switchbacks"): the avenue's three lower legs lined with houses on their lakeward side.
- **P4:** the lake craft (`xa_dugout`, `xa_launch`, `xa_lake_barge`, opt-in) and the harbour's traffic from the tune: moored, beached, fishing, and the four runs moving with the page's clock. Their schedule waits for P6.
- **P5:** the interiors with `?interiors=1` (every house with an item in the kit's set, the factor house, the inns, the barracks, the caravanserai's ranges, the heir's palace).
- **Open issues:** the ground textured with the biome pack's sets; the beach shelving into the water (it was a 2.7 m step); the flora over the town's mask.

**Done (2026-11-16, the open-world sites session: "proceed with the next steps of your builds"):**
- **P6:** the fair's days as the tune proposes them (question 16 still open: `PH.FAIR`, days 3 and 6 of a 7-day week, the
  page's `?day=` picks one): the daily stall rows always, the fair's rows only on a fair day; the launches' two fair runs
  (west and east along the shore) only then, six runs in all. Entry flights (`core/walk` strips) up to the raised doors
  took the interiors' unreached floors from 3,527 to 1,053 (30,812 of 31,865 reached).
- **P7:** Phēr's ground in `openworld/xanadu-north-shore` (`SITES.json` `"towns": ["pher"]`): `core/world/bake_towns.py`'s
  new `closed` kind samples the page's `phH` through its world frame (`phWorldFrame`: turned by the shore's bearing, the
  lake at -520 m) into `openworld/towns/pher`; the region takes it with `41t`. The Swīṭ Siṭrīm runs at its own height
  down its ravine (`41t`'s new `over` rivers: wet in its channel, drawn as its own line), not yet joined to the model's
  line (question 17).


## 7. Questions for the owner

**Answered 2026-11-16:**
1. ~~**The two levels.**~~ **Two levels:** the harbour and the strand on the bench, the fair ground, the caravanserai and the
   granaries on the rim.
2. ~~**The harbour.**~~ **A headland and a cove** at the shore's bend just west of the pin (section 1.2).
3. ~~**Water.**~~ **A small stream**, down the plain and the wall to the cove (section 1.2).
4. ~~**The governor.**~~ **A member of the Sultan's family** holds the seat.
5. ~~**The additions.**~~ **All five:** the fair's days, the pilgrims' launches, the cacao house, the boat slip and the
   plain's farming villages.
6. ~~**The region.**~~ **A new region north of Erewhon's that also holds Thalaba** (`xanadu-north-shore`, *proposed* name).
7. ~~**The road.**~~ **Up the Qol Siṭrīm's valley** (about 105 km, section 3).
8. ~~**The name's gloss.**~~ **Kept:** *Phēr*, "fair".

**Answered 2026-11-16 (second round):**
9. ~~**The governor's rank.**~~ **The heir** holds the seat.
10. ~~**The stream's name.**~~ **Coined:** *Swīṭ Siṭrīm*, "sweet stream".
11. ~~**The region's name and box.**~~ **Reach east, not the long isle:** `openworld/xanadu-north-shore` reaches along the
    shore to Ḍāiyar (870,1500) by corridors; the long isle is outside every polygon.

**Answered 2026-11-16 (third round):**
12. ~~**The heir's household.**~~ **Grander, with a guard of the Sultan's own** ("yes and yes").
13. ~~**The caravanserai.**~~ **A Xanadu one of its own** ("build xanadu one").
14. ~~**The wall between the levels.**~~ **Houses line the lower switchbacks.**

**Still open:**
15. **The heir's own palace.** The seat uses the Grand Vizier's citadel design (walk-in). Should the heir have a palace
    of its own design (a commission for the citadel's builders), or does this one stand?
16. **The fair's days (P6).** The tune proposes days 3 and 6 of the lake's week (`T.fairDays`). Keep them? On those days the
    fair ground fills with stalls and the launches of the north shore come in.
17. **The Swīṭ Siṭrīm at the rim.** The model's stream (`r_pher_swit`) reaches Phēr's band at about -38 m, some 45 m
    under the page's rim plain where the town's stream rises (the upper town stands on that plain): water cannot run up
    into it, so the model's line now ends at the band and the town's stream rises at a spring above the upper town.
    Which should give way? (a) a scale-model edit raising the land behind the rim (the plateau stands higher than the
    caldera's lip, the stream crossing it in a shallow channel, as the page has it); (b) the page cuts a gorge through
    the rim, which runs through the upper town and its fair ground; (c) leave it: the Swīṭ rises on the rim, and the
    model's stream is another, ending in the hills behind (*proposed: (a)*).

## 8. Found on the way (for the sessions that own them; not changed here)

- **The road's length.** `road.pher-thalaba` measures 68 km (the straight line × 1.2). Up the Qol Siṭrīm's valley, the
  owner's road, it is about 105 km: about 4 days at 25 km a day, against under 3. The road's minutes and stagger should
  follow, and Thalaba's stores may need a longer keep.
- **The dugouts' count.** The tune's 600 dugout crew at Phēr alone, at one or two to a dugout, is 300-600 dugouts. The
  proposal's table counts ~400 dugouts on the whole lake. One of the two should move.
- **The Thalaba plan's road** (`settlements/thalaba/PLAN.md` section 3) goes up the Qol Siṭrīm's valley, as the owner
  wants, but from the old shore: its lower end should now start from Phēr across the plain (section 3 here).
- **The province's point.** P7's `px` in `T.provinces` is still 812,1478, on the old shore's hinterland. It now lies 60 km
  west of its seat; if the bulk district's position matters (its tithe road's length is measured from it), it should move
  toward 843,1484.
- **Erewhon's region is stale too.** `openworld/xanadu-oidong-highrift`'s cut square for Erehwon is still px 790-820 by
  1501-1531, round the old pin 805,1516; Erehwon is now at 841,1517.
- **The wadi's name** (no longer near Phēr): `rivers.json` names `r492` *Bhon Ḍrāi*; `tools/scale-model/river-names-5.1.md`
  line 662 still names it *Gūlī al-Ward*.
- **The cross-lake run is fixed** in the re-fitted tune: it is now measured from the two towns (the first version of this
  plan flagged the old fixed 34 km).
- **There is no Phēr pin on the scale model.** The P0 edits (the pin, the headland and cove, the stream) go through the
  scale-model session's queue.
