# Phēr, the north shore's fair: a lake town of 6,000 on Erewhon's caldera lake (proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall"*.

Everything here is *proposed* except what the owner or the lore has said, and what the sim already holds. The sim's
facts are marked with their source.

**Re-seated the same day.** The first version of this plan (b9a5543bb) put Phēr at 810,1483, on the old lake's north
shore by the Bhon Ḍrāi's fan. The owner then re-made the lake (*"a little narrower and ... more toward the center of the
valley? settlements can move with it"*; scale model 5.1 edit 7 re-run, 5f659c054 on `claude/gemini-trade-reconcile`).
Phēr moved with it to **843,1491**, and the sim was re-fitted (`claude/openworld-sites-24defd`, 6b7feead1). This version
is surveyed on the re-run model. The wadi is now 60 km west and plays no part here.

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
- **Thalaba moved** to the mouth of Godshearth, 840,1463 (the owner, 2026-11-16). From the new shore it is about 68 km up
  the scarp road, under 3 days.
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
| **Rivers** | **None within 15 km.** The Qol Siṭrīm (`r272`, perennial, 139.7 m³/s) now reaches the lake at 824,1489, 38 km west, by Malbari. The Bhon Ḍrāi (`r492`, a wadi) ends at 813,1491, 60 km west. The Sakāi Ḍrāi (`r488`, a wadi, 5.8 m³/s) ends at 881,1506, east of Ḍāiyar. The town drinks the lake (fresh: it drains by the Ālph) and wells on the rim |
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
| **Thalaba** | 840,1463 | 56 km N straight, about 68 km by road | the road up |
| Ḍāiyar (dyer) | 870,1500 | 57 km ESE | the north-east round's last call |

### 1.2 What depends on the shore at 1:1

The re-run's shore has bays and headlands in places, but at Phēr the model's coast is a smooth diagonal with the stamped
three-step wall behind it. The open world's 1:1 shore will come from `core/coast` (`KCOAST`, a coast profile per stretch)
and its warp. These things depend on it:

1. **The harbour.** The bed falls about 150 m in the first 4 km off the bench, so the harbour needs shelter close in:
   - a **cove** in the 1:1 shore at the pin (`KCOAST` can be asked for a pocket bay here, or a headland to the west where
     the shore bends, behind which the boats lie: the better choice, since the south and south-west winds come up the lake);
   - or **moles** built out from the bench, stone breakwaters enclosing about 400 × 250 m of water.

   The plan proposes the headland and cove (question 2), with a short mole if the cove is shallow.
2. **The bench's width.** The model's shore bench is one cell at −500 m, which at 1:1 is a slope, not a shelf. Lower Phēr
   needs about 300-500 m of near-level strand: a coast profile with a shingle or sand shelf here, or the quays cut in.
3. **The wall's benches.** The three equal steps give a plain 7-8° ramp at 1:1. One bench at about −250 m (the step at
   843,1490) would carry the governor's house and the middle town; without it, the streets switch back up the ramp.
4. **The Ālph gorge.** Not settled: whether the lake floods up the Ālph's gorge. It does not reach Phēr, but it would move
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
| **The Sultan's people** | ~350 | The governor of Nōrth-Shor and his household; the tax and dues clerks (section 4); the harbour master; the customs launch; the generator's keepers and lamplighters; a small watch (~60) |
| **The temples' people** | ~150 | A temple of the Decree; a house of the Azure Dream where the pilgrims to Grēṭ-Āil wait for the launch (*proposed*) |
| **The rest** | ~1,050 | Craftsmen, servants, gardeners of the wall's terraces, the rim's market gardeners |

**The Two Horns' factor** (`horns.pher`) is the one merchant house the tune gives Phēr. *Proposed:* no other X2 house keeps a
factor here. The Rare Devisers buy Godshearth's rarities at Thalaba, and the Golden Tears work in Lizard country.

The people are Xanadui of the lake (the tune's `lake` diet). *Proposed:* they speak the lake's Xanadui, and the fair draws
traders from every north-shore town.

## 3. The layout (*proposed*)

The town has three parts, read bottom to top as Atitlán's towns are, joined by one lit avenue.

**The strand (Lower Phēr), on the bench, 0-40 m over the water, about 2.5 km along the shore.**
- **The harbour:** the cove behind the western headland, closed by a short stone mole (the Xanadu kit's quay, boat shed
  and warehouse, `87c-xa-erewhon.js`). The launches' landing and the cargo boats' berths are inside it. The dugouts are
  drawn up on the beach east of the mole.
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
- **The governor's house** on the bench at about −250 m (the step at 843,1490), over the harbour.
- **The Two Horns' factor house** at the wall's upper bend (the tune's 843,1490), between the harbour and the fair.
- **The terraced gardens** of the wall: fruit, mulberry and vegetables between the streets, watered from the lake by
  wheels and from the rim's tanks.

**The rim (Upper Phēr), −30 to 0 m.**
- **The fair ground:** a great open square where the avenue reaches the plain, as Sololá's market stands above Panajachel.
  On the fair's two days the north-shore towns' people land at the harbour and climb to it, and the rim's farmers and the
  Thalaba road's carts come in from the north. On other days it is the daily market, under the bazaar rows.
- **The temple of the Decree** on the square (`77-xa-sacred.js`).
- **The caravanserai** on the square's north side, where the Thalaba road begins (Qiblai's caravanserai, `89q3-qb-sacred.js`,
  is the nearest drawn; the Xanadu kit has none).
- **The province's granaries** (`76-xa-farm.js`), where Nōrth-Shor's tithe grain is stored, the mule yards, and the watch's
  barracks (`80-xa-military.js`).
- **Water:** wells and tanks, since no stream crosses the plain here, and a lift of lake water up the wall for the strand's
  needs only.
- **The farmland:** the plain north, east and west, 216 km² of gentle ground within 15 km, in the province's farming
  villages.

**The road up to Thalaba:** north from the fair ground straight across the plain, about 26 km at −20 to +130 m, then up
the scarp (about 1,050 m in 12 km: switchbacks), then the bench to Thalaba. About 68 km by road, as the re-fitted tune
has it. The Thalaba plan's route up the Qol Siṭrīm valley was drawn for the old shore; the Qol's mouth is now 38 km west,
so the direct road north is shorter (question 7).

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
- **The road to Thalaba** (`road.pher-thalaba`): about 68 km, six carriers, 10 t each. Up: grain, tea, tools and salt.
  Down: sulfur, wax and rarities.
- **The rounds:** `round.north-west` (Qōqō, Nēṭ, Malbari, Hāibh) and `round.north-east` (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar). At
  each town a market boat buys what the next one wants.
- **The licence:** 15 % of the Sultan's oil licence to Phēr's dynamo (`T.lit`), used all year.
- **The Two Horns' factor house** (`horns.pher`).

**Proposed additions, for the owner to choose (question 5):**
- **The fair as a sim event.** On the fair's two days each week, the north-shore towns' people ride the launches to Phēr
  and back (`transport` records, 77-sim-5r, as section 2a of the proposal plans). The rounds' boats meet at Phēr instead
  of calling round. Nothing new is made: it moves people and changes when goods move.
- **The pilgrims' launches** to Grēṭ-Āil: a `transport` loop from Phēr's landing to the long isle, 26 km.
- **The cacao house.** Qōqō's cacao and the province's 60 t come to Phēr, are roasted and pressed (a batch chain, like the
  weavers'), and go across the lake as cakes. *Only if* the owner wants the north shore to sell worked cacao, not beans.
- **The boat slip.** A repair work for the hub's boats (no output in the tune, like `er.dockyard`).
- **The plain's farms as named villages.** A ring of `KHAMLET` farming villages on the rim plain, tithing to Phēr, as
  Erehwon's and Qiblai's rings do, taking their people out of P7's bulk district.

## 5. Core adoption (to write in full before the first fragment)

| Need | Module | How |
|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | The site cut by `tools/scale-model/cut_site.py` from the re-run model. Phēr is inside `openworld/xanadu-oidong-highrift`'s frame (box 746-1636 by 1424-1714) but not in its cut polygons, so it needs a site entry in `openworld/SITES.json` (question 6). The Thalaba road joins `ROADS` |
| The shore and the harbour | `core/coast` (`KCOAST`) | The north shore's coast profile; the headland and the cove, or the shelf for the moles (section 1.2). `core/terrain` for the wall's bench at −250 m, if the model keeps its plain ramp |
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
| **P0** | **The pin:** a scale-model edit through the scale-model session's queue (a `SETT_ADDED` pin: Phēr, a town of P7, at 843,1491 on the re-run model) | the pin is dry, on the wall's foot at −447 m, the lake two cells south |
| **P1** | **The tune:** the owner's choices from question 5 | `test-xan-economy.js` unchanged unless meant to move; Phēr fed |
| **P2** | **The site:** a `SITES.json` entry; the headland, the cove and the shelf with `KCOAST`; the cut | the region's verify: the strand dry, the harbour's water inside the mole, the bench walkable |
| **P3** | **The town on `core/city`** with the Xanadu kit: the strand, the wall, the rim, the lit avenue | its city tests; the GPU verify |
| **P4** | **The boats** (owed models), and the harbour's traffic drawn from the sim | the boats on the water, none aground or through the mole |
| **P5** | **Interiors** for the governor's house, the factor house, the inns | the interiors' checks |
| **P6** | **The fair's days:** the launches' `transport` loops and the crowds climbing to the fair ground | the sim's market-week test |

## 7. Questions for the owner

1. **The two levels.** The harbour and the strand on the bench, the town up the wall, and the fair ground with the
   caravanserai and the granaries on the rim, as Panajachel and Sololá are on Atitlán? Or the fair down at the water,
   with only the road's yards on the rim?
2. **The harbour.** The open lake off Phēr is 150 m deep within 4 km. Should the 1:1 shore give Phēr a headland and a cove
   at the bend just west of the pin, or should the harbour be built out from a plain shore with moles?
3. **Water.** No stream reaches the lake within 15 km of the pin. Is the lake and the rim's wells enough, or should the
   1:1 ground give Phēr a stream (a small wadi off the plain), as most lake towns have?
4. **The governor.** Is Nōrth-Shor's seat a governor of the Sultan's household, a lake family holding it by right, or the
   Chancellor's appointee? The other provinces' plans have not said yet.
5. **The additions.** Which of section 4's proposals go in the tune: the fair's days as transport, the pilgrims' launches,
   the cacao house, the boat slip, the plain's farming villages?
6. **The region.** Is Phēr cut into `xanadu-oidong-highrift` (the region that holds Erewhon) as a new site polygon, or into
   a north-shore region of its own that also takes Qōqō, Māuṭh and the Thalaba road?
7. **The road.** North across the plain and straight up the scarp to Thalaba (about 68 km), or still up the Qol Siṭrīm's
   valley as the Thalaba plan drew it for the old shore (now a longer way round, from 38 km west)?
8. **The name's gloss.** *Phēr* is "fair" in the proposal's working names (section 9, Q5). Keep it?

## 8. Found on the way (for the sessions that own them; not changed here)

- **The dugouts' count.** The tune's 600 dugout crew at Phēr alone, at one or two to a dugout, is 300-600 dugouts. The
  proposal's table counts ~400 dugouts on the whole lake. One of the two should move.
- **The Thalaba plan's road** (`settlements/thalaba/PLAN.md` section 3) goes up the Qol Siṭrīm's valley from the old
  shore. On the re-run model the Qol reaches the lake at 824,1489, by Malbari, 38 km west of Phēr; the tune's 68 km is
  the direct road north.
- **The province's point.** P7's `px` in `T.provinces` is still 812,1478, on the old shore's hinterland. It now lies 60 km
  west of its seat; if the bulk district's position matters (its tithe road's length is measured from it), it should move
  toward 843,1484.
- **The wadi's name** (no longer near Phēr): `rivers.json` names `r492` *Bhon Ḍrāi*; `tools/scale-model/river-names-5.1.md`
  line 662 still names it *Gūlī al-Ward*.
- **The cross-lake run is fixed** in the re-fitted tune: it is now measured from the two towns (the first version of this
  plan flagged the old fixed 34 km).
- **There is no Phēr pin on the scale model.** The P0 pin goes through the scale-model session's queue.
