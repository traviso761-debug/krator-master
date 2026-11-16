# Phēr, the north shore's fair: a lake town of 6,000 on Erewhon's caldera lake (proposal, 2026-11-16)

The owner, 2026-11-16: *"spin off agents to make site plans for Pher, Thalaba, Kirstabal, and Strongwall"*.

Everything here is *proposed* except what the owner or the lore has said, and what the sim already holds. The sim's
facts are marked with their source.

What is already settled:
- **The town is the sim's** (`core/region/data/xan-tune.js`; `core/simulation/PROPOSAL-XANADU.md` sections 2, 2a and 7).
  `xan.pher`, "Phēr (the north shore's fair)", px 810,1483, 6,000 people.
  - It is the seat of province P7, **Nōrth-Shor** (the North Shore).
  - It is the northern of the lake's two hubs: Erehwon in the south, Phēr in the north.
- **The lake is Atitlán's pattern** (the owner, 2026-11-16: *"There should be many villages and hamlets along the lakes;
  Lake Atitlán is the inspiration. There will be constant boat traffic."*).
  - About twenty lake towns, about two hundred hamlets and some five hundred boats.
  - A seven-day market week: Erehwon's great market and Phēr's fair take two days each.
- **Thalaba moved** to the mouth of Godshearth (the owner, 2026-11-16), about 86 km and 3-4 days up the road from Phēr.
  - Grain, salt and tea go up that road.
  - The vents' sulfur, hearth wax and rarities come down it.
- **The north's salt** comes with Dalab's Great Caravan to the capital, then by the lake to Phēr (the owner, 2026-11-16).
- **The oil licence** (the owner, PROPOSAL-XANADU.md section 7: *"only the major avenues of large settlements"*): Phēr's
  generator takes 15 % of the Sultan's licence (`T.lit`) and lights its avenues.
- **The Two Horns** keep a factor house at Phēr (`horns.pher`, 810,1482).

Sources:
- `core/region/data/xan-tune.js`: the town, its fishing, the roads, the rounds, the dues and the licence.
- `core/simulation/PROPOSAL-XANADU.md`: section 2 (P7), section 2a (the lake towns, the boats, the market week), section 7.
- `settlements/thalaba/PLAN.md` (18e5611c1): the road from Phēr, from the other end.
- `settlements/lightwall/PLAN.md`: the pattern for this plan.
- The scale model 5.1 with 5.1 edit 7 in (`tools/scale-model/edit_517.py`, the caldera lake), `tools/scale-model/model/data`:
  - `h.png` decoded as (R·256+G)/65535·29,600 − 2,600 m, with B > 127 meaning water;
  - `tm.png` (mean °C + 90), `p.png` (rain = byte/255 · 4,000 mm), `c.png` (`climate.json`'s classes);
  - `rivers.json`;
  - air from `core/world`'s formula, 1.6 atm · e^(−h/8,000 m).

## 1. The site

**px 810,1483, as the sim has it** (world x −762,000 m, z −172,000 m on the 5.1 frame, origin 1191,1569).

This is the shore cell due north of the lake's centre (810,1499.5), bearing 270°. It stands on the **west bank of the mouth
of the Bhon Ḍrāi**, the wadi that cuts the north wall at 812,1484. The town is proposed on the wadi's **fan delta** and on
the wall behind it. That is Panajachel's place on Atitlán: the lake's biggest market and boat town, on the Río Quiscab's
delta, under a wall that Sololá crowns.

### 1.1 The survey (the model as it stands)

| | |
|---|---|
| **The shore** | One cell of stamped shore bench at **−500 m** (810,1483; 808-812 on row 1483), **20 m over the lake**. The lake stands at **−520 m** (edit 7's level). 808,1483 is −441 m (80 m over the water) |
| **The wall** | The caldera wall rises in the model's three steps: **−260 m** one cell back (2 km), **−20 to −5 m** three cells back (6 km). At 1:1 the bilinear ground climbs from the water to the rim at about **120 m a km (7°)**: −404 m at 2 km, −163 m at 4 km, −17 m at 5.5 km |
| **The rim plateau** | From 5.5 km back, a flat at **−17 to +27 m** (520-550 m over the lake). Its slope is 7 m a km. It runs about 20 km east-west (x 800-821) and 6-8 km deep (rows 1477-1481). Within 15 km, the 17 cells under 20 m a km of slope (**68 km²**) are all on it |
| **The hills** | North of the plateau, the ground rises to 240-380 m at row 1476-1477. Then it climbs to **1,600 m by row 1468-1470** (26-30 km north): the slopes up toward Godshearth |
| **The wadi** | **Bhon Ḍrāi** (`r492`, "bone wadi"). It runs 82 km from 5,700 m (798.7,1449.6) to the lake at 812,1484. It is not perennial: a mean of 4.1 m³/s at the mouth, from a catchment of **7,974 km²**, in a 70 m bed. It cuts a gorge through the rim at x 812-814, 200-450 m deep (its bed −47 m at row 1476, −143 at 1479, −295 at 1480, −492 at 1481, −516 at 1483). A wadi that size off a 5,700 m range floods hard and builds a fan |
| **The river** | **Qol Siṭrīm** (`r272`, "cold stream"). Perennial, **139.7 m³/s**, 52 km. It reaches the lake at 821,1487, **22 km east**, at Māuṭh (818,1485, "mouth"). Its valley is the road up to Thalaba (`settlements/thalaba/PLAN.md` section 3) |
| **The water off the town** | The caldera bowl drops fast. The bed is 40-90 m deep 2 km out, 140-210 m deep 4 km out, and about 800 m deep 10 km out (−1,310 m at 810,1490). Boats can anchor only close in, so the quays go on the fan's lakeward edge |
| **Climate** | Shore: **25 °C** mean, **~1,190 mm** of rain, **Cfa** (humid subtropical). Rim plateau: 22 °C, ~1,000 mm, Cfa with Csa patches. Within 15 km of the pin: Cfa 84 cells, Csa 13, Aw 1, lake 79 |
| **Air** | **1.70 atm** on the shore, 1.60 atm on the rim |
| **Within 15 km** | 177 cells: 98 land (392 km²) and 79 water (316 km²). The land runs from −516 to +124 m, median −36 m |
| **Lodes** | None within 80 km (`kits/resources/data/lodes.json`). The north shore's wealth is the land, the lake and the road |

**Neighbours:**

| Place | px | Distance | Notes |
|---|---|---|---|
| Qōqō (cocoa) | 805,1482 | 10 km W | the north-west round's first call |
| Nēṭ (net) | 800,1482 | 20 km W | |
| Malbari (mulberry) | 793,1483 | 34 km W | silk; one of the market week's days |
| Hāibh (hive) | 785,1485 | 50 km W | the north-west round's last call |
| Māuṭh (mouth) | 818,1485 | 16 km E | the Qol Siṭrīm's mouth; the Thalaba road's foot |
| Ōlḍ-Thalaba | 825,1488 | 32 km E | |
| Ḍāiyar (dyer) | 834,1493 | 52 km E | the north-east round's last call |
| Grēṭ-Āil (the monastery isle) | 816.5,1501.5 | 39 km SSE | mid-lake |
| **Erehwon** | 806,1516 | **66 km S**, across the lake | the cross-lake run (but see section 8: the tune says 34 km) |
| **Thalaba** | 840,1463 | 72 km straight, ~86 km by road | the road up |

### 1.2 What depends on the lake's final shape

The survey reads the model with edit 7's caldera in. Its shoreline is a **smoothed ellipse with a stamped three-step wall**.
The open world's 1:1 shore will come from `core/coast` (`KCOAST`, the coast profile per stretch) and from any further
Atitlán-like reshaping of the shoreline queued with the scale-model session. These things depend on that shape:

1. **The fan.** The model has no delta. The fan is this plan's proposal: about **3 km wide and 1.5 km deep**, at 0-30 m
   over the water, built where the Bhon leaves its gorge. It needs either a landform record (the islands' kind, in
   `landforms.json`) or a coast-profile "fan" stretch in `KCOAST`. If the reshaped shore puts a bay or a point here, the
   quays follow the fan.
2. **The wall's profile.** Atitlán's north wall is steep but has benches. The model's three equal steps give a plain 7°
   ramp at 1:1. Benches at about −400 m and −150 m would carry the middle town (section 3); without them, the streets
   switch back up the ramp.
3. **The anchorage.** The bowl's slope off the fan decides how far out the quays and the moorings reach. If the bed falls
   to 100 m within 1 km, the quays are moles built out from the fan.
4. **The crossing.** If the shoreline moves, the cross-lake distance moves with it (section 8).

### 1.3 Alternatives weighed

| Site | px | Ground | Why not first |
|---|---|---|---|
| **The Bhon fan** (chosen, the sim's pin) | 810,1483 | the shore at −500 m, the fan, the wall to the rim | |
| The Qol Siṭrīm's mouth | 820,1486 | the perennial river's mouth, at the Thalaba road's foot | It is Māuṭh's place in section 2a (300°). It is 22 km farther from the north-west round's towns. The crossing to Erehwon would be about the same (66 km). It would give Phēr a perennial river and shorten the road to Thalaba by ~20 km (question 2) |
| The rim (Sololá's place) | 810,1480 | the plateau at −10 m, flat, 22 °C | 5.5 km and 500 m up from the boats. A hub of the lake's launches has to be on the water. *Proposed:* the rim gets the upper town instead (section 3) |

## 2. Who lives there (*proposed* split of the sim's 6,000)

| Group | People (with households) | What they do |
|---|---|---|
| **The fishers** | ~2,200 | The dugouts: the tune's **600 fishing crew** (`ph.fishing`), out at dawn and back by noon, every day but the fair's |
| **The boat people** | ~800 | Crews of the launches and cargo boats based at Phēr: the cross-lake run's six carriers, the two market-boat rounds, the passenger launches of the north shore. Caulkers, sailmakers and a repair slip (the hulls are laid down at Boṭ-Yārḍ) |
| **The fair's people** | ~1,100 | Brokers, warehousemen, porters, the fish market's sellers and salters, the weighmasters; the cacao roasters and the silk buyers from the north-shore towns; inns for the fair's crowds |
| **The road's people** | ~350 | Muleteers and carters on the Thalaba road (the tune's six carriers), farriers, harness makers, the caravanserai's keepers, the rim's granary men |
| **The Sultan's people** | ~350 | The governor of Nōrth-Shor and his household; the tax and dues clerks (the dues: section 4); the harbour master; the customs launch; the generator's keepers and lamplighters; a small watch (~60) |
| **The Decree's people** | ~150 | A temple on the fan and its monks; the lake's pilgrims to Grēṭ-Āil take ship here |
| **The rest** | ~1,050 | Craftsmen, servants, gardeners of the wall's terraces, the poor of the wadi's edges |

**The Two Horns' factor** (`horns.pher`) sits on the fair ground, the one merchant house the tune gives Phēr. *Proposed:* no
other X2 house keeps a factor here. The Rare Devisers buy Godshearth's rarities at Thalaba, and the Golden Tears work in
Lizard country.

The people are Xanadui of the lake (the tune's `lake` diet). *Proposed:* they speak the lake's Xanadui, and the fair draws
traders from every north-shore town.

## 3. The layout (*proposed*)

The town has three parts, read bottom to top as Atitlán's towns are. The wadi's flood channel runs down through the middle.

**The fan (Lower Phēr), 0-30 m over the water, about 3 km by 1.5 km.**
- **The quays:** stone moles out from the fan's lakeward edge (the Xanadu kit's quay, boat shed and warehouse,
  `87c-xa-erewhon.js`), the launches' landing, the cargo boats' berths, and the dugouts' beach to the west, where the fan
  shelves gently.
- **The fair ground:** a great open square behind the quays, paved on the fan's old west lobe. On the fair's two days the
  boats of every north-shore town converge on it, and the ground fills with awnings. On other days it is the fish market
  and a smaller daily market under the bazaar rows (`75-xa-trade.js`).
- **The Two Horns' factor house** and the brokers' warehouses on the square's north side.
- **The temple of the Decree** on the square's east side, facing the lake (`77-xa-sacred.js`).
- **The Bhon's channel:** kept open across the fan between stone levees. It is dry most of the year (the wadi's mean is
  4 m³/s), but the floods off a 7,974 km² catchment are the town's danger: Panajachel's lesson. One stone bridge
  crosses it (`87c-xa-erewhon.js`'s street bridge). Nothing is built on the active lobe east of the channel except the
  boatyard's slip and drying grounds, which a flood can take.

**The wall (Middle Phēr), from −480 m to about −150 m.**
- **Houses poor to rich** climb the 7° ramp in terraced streets that switch back. The poor are low and at the wadi's edge,
  in the Palopó shop-houses (`87b-xa-andean.js`, after Santa Catarina Palopó on Atitlán). The rich are higher, with the
  view, in the kit's Turkish and Persian houses.
- **The governor's house** on a spur at about −250 m, over the fair ground.
- **The lit avenue:** one avenue climbs from the quays past the fair ground and the governor's house to the rim. The
  Sultan's licence lights it (`T.lit`), with the kit's street lights (`83-xa-turk.js`). The generator house
  (`79-xa-guild.js`) stands at its foot, by the warehouses, where the oil comes in.
- **The terraced gardens** of the wall: fruit, mulberry and vegetables between the streets.

**The rim (Upper Phēr), −20 to 0 m.**
- **The caravanserai** where the avenue meets the plateau, at the start of the Thalaba road (Qiblai's caravanserai,
  `89q3-qb-sacred.js`, is the nearest drawn; the Xanadu kit has none).
- **The province's granaries** (`76-xa-farm.js`), where Nōrth-Shor's tithe grain is stored: the rim's farms are next to
  them.
- **The mule yards** and the watch's barracks (`80-xa-military.js`).
- **The farmland:** the rim plateau east and west, about 68 km² of flat within 15 km, in the province's farming villages.

**The road up to Thalaba:** from the rim, east along the plateau (about 12 km at 0-40 m), across the Bhon's gorge at the
fan, not on the rim (the gorge is 200-450 m deep up there; the road crosses on the town's bridge and climbs the east wall,
which reaches the rim within 4 km). Then it crosses the Qol Siṭrīm and climbs its valley to the head (827,1464, 1,197 m),
then the bench to Thalaba: about 86 km, as the tune has it.

**The edges.** P7's ~60 lake hamlets between the towns and the rim's farming villages are left to `core/hamlet` (a ring
like Erehwon's and Qiblai's, `KHAMLET.village`), after the town is built.

## 4. The economy (in `XAN_TUNE` as it stands; *proposed* additions marked)

**What the tune already has** (`core/region/data/xan-tune.js`):
- **The town:** `xan.pher`, 6,000 people, the `lake` diet.
- **Its one work: the dugouts** (`ph.fishing`): 600 crew, 6,000 × 260 kg × 0.6 = **936 t of fish a year**. Its fishery
  holds half a year's catch (468 t) and regrows a day's catch (2.6 t) each night.
- **It is fed from its province.** P7's countryside (25,000 rural people, 1.5 t/ha; its extras silk 14 t, cacao 60 t,
  honey 12 t and fruit 300 t a year) tithes grain to Phēr. The tithe covers Phēr's own table, the north-shore lake towns'
  shortfall (each grows three fifths of its grain on its terraces), the half of Thalaba's grain that its terraces do not
  grow, and the dues, with a 15 % margin. If the province cannot cover it, the rest passes to the capital (`passTo`).
- **The dues to the Treasury** after the harvest: grain 30 t, silk 300 kg, honey 400 kg.
- **The cross-lake run** (`lake.cross`): six carriers, 20 t each, want 12.
  - The capital to Phēr: grain, salt, tea, tools, pottery and mats; the north's salt (from the Great Caravan), iron and
    arms; and what Thalaba takes.
  - Phēr to the capital: fish, silk, cacao, honey, fruit, and the vents' sulfur, wax and rarities.
- **The road to Thalaba** (`road.pher-thalaba`): about 86 km, six carriers, 10 t each. Up: grain, tea, tools and salt.
  Down: sulfur, wax and rarities.
- **The rounds:** `round.north-west` (Qōqō, Nēṭ, Malbari, Hāibh) and `round.north-east` (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar). At
  each town a market boat buys what the next one wants.
- **The licence:** 15 % of the Sultan's oil licence to Phēr's dynamo (`T.lit`), used all year.
- **The Two Horns' factor house** (`horns.pher`).

**Proposed additions, for the owner to choose (question 5):**
- **The fair as a sim event.** On the fair's two days each week, the north-shore towns' people ride the launches to Phēr
  and back (`transport` records, 77-sim-5r, as section 2a of the proposal plans). The rounds' boats meet at Phēr instead
  of calling round. Nothing new is made: it moves people and changes when goods move.
- **The cacao house.** Qōqō's cacao and the province's 60 t come to Phēr, are roasted and pressed (a batch chain, like the
  weavers'), and go across the lake as cakes. *Only if* the owner wants the north shore to sell worked cacao, not beans.
- **The boat slip.** A repair work for the hub's boats (no output in the tune, like `er.dockyard`).
- **The rim's farms as named villages.** A ring of `KHAMLET` farming villages on the rim plateau, tithing to Phēr, as
  Erehwon's and Qiblai's rings do, taking their people out of P7's bulk district.

## 5. Core adoption (to write in full before the first fragment)

| Need | Module | How |
|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | The site cut by `tools/scale-model/cut_site.py`. Phēr is inside `openworld/xanadu-oidong-highrift`'s frame (box 746-1636 by 1424-1714) but outside its cut polygons (Erewhon's square is 790-820 by 1501-1531), so it needs a site entry in `openworld/SITES.json` (question 6). The Thalaba road joins `ROADS` |
| The shore and the fan | `core/coast` (`KCOAST`) | The coast profile for the north shore; the fan as a stretch or a landform (section 1.2). `core/terrain` for the wall's benches, if the model has none |
| The lake and the wadi | `core/water` | The lake surface at −520 m; the Bhon's dry bed and its levees as a channel |
| The streets and lots | `core/city` (`KCITY`) | The town on core/city as Qiblai and Erehwon are: the quays and the fair ground as the civic set; the lit avenue as the main street; the terraced streets up the wall as side streets on the slope rule. A target on Xanadu's page, as Qiblai is |
| The buildings | `kits/xanadu` | The quay, boat shed, warehouse and bridge (`87c`); the bazaar rows (`75`); the Palopó shop-house and the cholets (`87b`); the Turkish houses and the street lights (`83`); the temple (`77`); the generator (`79`); the granary and the terraced farm (`76`); the barracks and the watch (`80`). The caravanserai from `kits/qiblai` (`89q3`), or a Xanadu one owed |
| The boats | owed | The lake craft are owed (PROPOSAL-XANADU.md section 2a): the dugout, the launch, the cargo barge. `kits/ringsea` has none of them. Phēr is where the most of them are seen at once |
| Placement | `core/rand` (`KRAND`), `core/tags`, `core/space` | Every lot, boat and stall seeded from (world, cell, index, salt); registered before it is drawn |
| The fair's awnings and stalls | `kits/catalog` | The catalog's market pieces in the Xanadu culture |
| Interiors | `kits/interiors` | The Xanadu interiors for the governor's house, the factor house and the inns |
| Life | `core/charactermodels` | The lake Xanadui; the crowds of the fair's days from the sim's `transport` records |
| The economy | `core/region` | The valley host (`XAN_TUNE`), as it stands |

## 6. Steps

| Step | What | Test |
|---|---|---|
| **P0** | **The pin:** a scale-model edit through the scale-model session's queue (a `SETT_ADDED` pin: Phēr, a town of P7, at 810,1483) | the pin is on the shore bench, dry, at −500 m |
| **P1** | **The tune's corrections** (section 8): the crossing's length; the owner's choices from question 5 | `test-xan-economy.js` unchanged unless meant to move; Phēr fed |
| **P2** | **The site:** a `SITES.json` entry; the fan and the shore with `KCOAST`; the cut | the region's verify: the fan dry, the quays on the water's edge |
| **P3** | **The town on `core/city`** with the Xanadu kit: the fan, the wall, the rim, the lit avenue | its city tests; the GPU verify |
| **P4** | **The boats** (owed models), and the harbour's traffic drawn from the sim | the boats on the water, none aground |
| **P5** | **Interiors** for the governor's house, the factor house, the inns | the interiors' checks |
| **P6** | **The fair's days:** the launches' `transport` loops and the crowds | the sim's market-week test |

## 7. Questions for the owner

1. **The fan and the wall.** Phēr on the Bhon Ḍrāi's fan with its quays and fair ground, the town up the wall, and an
   upper town on the rim with the caravanserai and the granaries, as this plan proposes? Or the whole town on the shore?
2. **The place.** At the sim's pin (810,1483), on the wadi's fan? Or at the Qol Siṭrīm's mouth (820,1486), with a
   perennial river and a road to Thalaba ~20 km shorter? That would trade places with Māuṭh.
3. **The wadi's floods.** Should the Bhon's floods be an event in the sim (a flood year that takes the boatyard and the
   lower fair ground), or only the reason the town keeps off the active lobe?
4. **The governor.** Is Nōrth-Shor's seat a governor of the Sultan's household, a lake family holding it by right, or the
   Chancellor's appointee? The other provinces' plans have not said yet.
5. **The additions.** Which of section 4's proposals go in the tune: the fair's days as transport, the cacao house, the
   boat slip, the rim's farming villages?
6. **The region.** Is Phēr cut into `xanadu-oidong-highrift` (the region that holds Erewhon) as a new site polygon, or into
   a north-shore region of its own that also takes Qōqō, Māuṭh and the Thalaba road?
7. **The crossing.** The lake is 66 km across from Phēr to Erehwon, not the 34 km the tune and the proposal say (section 8).
   Keep the lake and fix the run (about 5.5 hours under sail and oar), or should the reshaped shoreline bring the two hubs
   closer?
8. **The name's gloss.** *Phēr* is "fair" in the proposal's working names (section 9, Q5). Keep it?

## 8. Found on the way (for the sessions that own them; not changed here)

- **The cross-lake run is twice as long as the tune has it.** `xan-tune.js` line 259 sets `lake.cross` at 34 km
  (`Math.round(34/12*60)+60`, 230 minutes), and PROPOSAL-XANADU.md section 2a says "about 34 km", about 3 hours.
  - The two hubs are 33.2 px apart (806,1516 to 810,1483), which is **66.5 km**: about 5.5 hours at 12 km/h, so the run
    should take about **392 minutes** with the hour's loading. The 34 looks like the pixel count.
  - The other lake runs compute their length from the seats, so only this one is off.
- **The dugouts' count.** The tune's 600 dugout crew at Phēr alone, at one or two to a dugout, is 300-600 dugouts. The
  proposal's table counts ~400 dugouts on the whole lake. One of the two should move.
- **The wadi's name.** `rivers.json` names `r492` *Bhon Ḍrāi* ("bone wadi", old name *Wāiṭ Ḍrāi*). `tools/scale-model/river-names-5.1.md`
  line 662 still names it *Gūlī al-Ward*. The scale-model session owns which is current.
- **There is no Phēr pin on the scale model.** The tune's `xan.pher` has no map record; the P0 pin goes through the
  scale-model session's queue.
