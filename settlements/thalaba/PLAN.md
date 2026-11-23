# Thalaba, the town at the mouth of Godshearth: a site plan (proposal, 2026-11-16)

The owner, 2026-11-16: *"we can move thalaba to the mouth of godshearth and put a new village on the lake in its place"*.
The owner then asked for site plans for the Sultanate's minor towns: *"spin off agents to make site plans for Pher, Thalaba,
Kirstabal, and Strongwall"*.

What is settled, from the owner and the sim:
- **The place:** the pin `shvo49k0y2` moves to **px 840,1463** as a town (scale-model key 5.1e12, commit 4ba66f57c on
  `claude/gemini-trade-reconcile`). That is the bench where Godshearth's spillway gorge opens.
- **Ōlḍ-Thalaba**, a fishing village of about 600, keeps the old shore spot at 825,1488.
- **The town in the sim** (`core/region/data/xan-tune.js`, `T.thalaba`, `xan.thalaba`):
  - 2,400 people;
  - the spillway's sulfur, 60 t a year in the tune (**30 t**: the owner's second answer, section 4);
  - the bench's terraces grow half its grain, and Phēr, about 105 km down the Qol road, sends the rest;
  - it is not a caravan terminus: Yuni's caravans end at Qiblai.
- **The Rare Devisers' house** (`devisers.thalaba`). The Devisers are the merchant house with the royal licence in scrap and
  rare artifacts; their guild house is at Theodiga. From here they run the summer expedition into Godshearth: a camp of 150
  (`exp.godshearth`, px 828,1380, about 200 km by road). Its sulfur, wax and rarities come home here, then go down to the
  capital for Dalab's Great Caravan.
- **A Two Horns' factor house** (`horns.thalaba`).
- `core/simulation/PROPOSAL-XANADU.md` section 7 (X2) holds all of this.

**The owner's answers to this plan's questions (2026-11-16):**
- **The town stands on the spring line** at the riser's foot, at the pin.
- **Thalaba has its own small sulfur node, but most of its sulfur comes by expedition.**
- **The river's water is fit for the terraces.**
- **The sulfur is a steady works**, not a field of short-lived beds.
- **The Rare Devisers' people from Theodiga run the expedition, but many of the hired men are locals.**
- **Names:** "I am open to proposals" (the proposals are in section 3a).
- **No walls.**
- **A small Dalab mission of about 30 people** lives in the town.
- **The second round (2026-11-16):**
  - **The town's own deposit makes 30 t of sulfur a year.**
  - **The names of section 3a are agreed.**
  - **The Dalab mission is built in Dalab's style.** It runs **its own expedition** into Godshearth and hires locals.
  - **The Sultan takes 10 % of the overall haul and 20 % of the rarities** (no toll on the road).
- **The region:** "cut it into whichever polygon the new pin falls into". At 840,1463 that is the **Xanadu Sultanate**
  (political, `rmufcgvtxatfx`). The open world cuts that polygon as the region `xanadu-oidong-highrift`
  (`openworld/SITES.json`). The pin also falls in the Vale of Xanadu and the Rift (geographic) and in the `xanadu` biome,
  but not in Godshearth, whose polygon stops at y 1451.

Everything else here is *proposed*.

Sources:
- `biomes/godshearth/PLAN.md`: the caldera, its spillway, the climate ruling, the dangers, the stations.
- `core/simulation/PROPOSAL-XANADU.md` (sections 2, 2a, 7) and `core/region/data/xan-tune.js`: the province (P7, the North
  Shore) and the sim.
- `kits/xanadu`, `kits/qiblai/PLAN.md`, `settlements/lightwall/PLAN.md` and `settlements/longsong/PLAN.md`: the buildings,
  and the shape of these plans.
- The scale model 5.1 as committed on this branch (after edit 7, the caldera lake), `tools/scale-model/model/data`:
  - `h.png`: height = (R·256+G)/65535·29,600 − 2,600 m, B > 127 water;
  - `tm.png` (mean °C + 90), `p.png` (byte/255 · 4,000 mm), `c.png` (the classes of `climate.json`);
  - `rivers.json`, `vents.json`;
  - 2 km a pixel; slopes are central differences on the 2 km grid.

## 1. The site

**px 840,1463**, on the north-west lip of a broad bench under the gorge's mouth.

| | |
|---|---|
| Ground | **1,507 m** at the pin, slope 16 m a km (1.6 %) |
| The bench | **About 700 km²** of ground under 25 m a km (177 cells), x 835-870, y 1461-1470. It runs **1,350-1,720 m**, median 1,667 m and 0.8 % slope. It rises gently east from the pin (1,615 m at 845,1464, 1,659 m at 850,1465, 1,664 m at 860,1466) |
| Climate | Mean **12-13 °C** (13 at the pin), **780-800 mm** of rain, `Cfb` over the whole bench. Air **1.33 atm** (the model's 1.6 e^(−h/8,000)) |
| Within 5 km | 1,447-1,703 m |
| Within 10 km | 1,322-1,889 m |
| Within 15 km | 1,189-2,048 m. The bench is the gentlest ground for 30 km round |

**The ground, north to south along x 840:**

| Rows | What | Height | Slope |
|---|---|---|---|
| 1436-1448 | **The gorge.** Its floor (x 840-846) is a flat 3,160-3,260 m, about 8 km wide. Its walls rise to 5.5 km (west, x 828) and 5.4 km (east, x 863): 2 km walls, 30 km rim to rim. The spillway's river runs down it | 3,160-3,260 m | |
| 1449-1453 | **The cataract.** The floor drops from **3,148 m** (842,1449) to **2,098 m** (842,1453): about **1,050 m in 8-10 km**. The Godshearth plan's "drop off the shield" | 3,148 to 2,098 m | |
| 1454-1458 | **The mouth.** A basin where the gorge opens out, about 15 km across, between the cataract's foot and the bench. The Solṭ Siṭrīm crosses it westward along row 1458 | 1,813-2,370 m | median 44 m a km |
| 1459-1462 | **The riser.** A step down to the bench: 1,866 m at 840,1458 to 1,507 m at the pin, about 300 m in 8 km | | median 42 m a km (4 %) |
| 1462-1468 | **The bench** | | |
| 1469-1484 | **The caldera's north wall.** The bench breaks south, down **2 km** in about 30 km, to the lake at **−520 m** (from about row 1484). The town stands 2,000 m above Erewhon's lake | | |

**The waters** (`rivers.json`):

| River | What | Near the town |
|---|---|---|
| **Āirã Siṭrīm** (`r_gh_spillway`, "iron stream") | The hot lake's outlet: 124 km, **95-131 m³/s**, 51 m wide. Added by 5.1 edit 5 | Comes down the gorge floor on x 842, over the cataract (3,148 m at 842,1449), and joins the Solṭ Siṭrīm at **846.7,1453.6** (2,549 m) |
| **Solṭ Siṭrīm** (`r442`, "salt stream", old name *Reḍ Riwā*) | The Godthrone plan's blood river, from the bloodfalls' brine. Only **3-5 m³/s** above the junction, **135-139 m³/s** below it: the hot lake's water, the brine about 1 part in 30. 53 m wide, 2.3 m deep | Runs south down to 847,1458 (2,117 m), then **west along row 1458 across the mouth**: 1,935 m at 843, 1,829 m at 839, a level reach of 1,820 m from 837 to 831. Then a **second fall**: about **420 m** to 1,402 m at 829,1462. It joins the Qol Siṭrīm at 826.7,1463.6. **Nearest the pin: 840.7,1457.6, 10.9 km north and about 330 m higher** |
| **Qol Siṭrīm** (`r272`, "cold stream") | 139.7 m³/s, from the junction (1,198 m) down to the lake at 821,1487 (−520 m), 52 km | The valley head is **13 km west** of the pin and 300 m below it. It is the road down to the lake and Phēr (the owner, 2026-11-16: "up into the qol valley"); since the lake was re-made the river reaches the lake at 824,1489, by Malbari |
| **Reḍ Ḍrāi** (`r836`, "red wadi") | Seasonal, 1.1 m³/s at its mouth | Runs down **the trough beside the cataract** (839,1444 to 841,1456: 3,286 m to 1,917 m), the lowest line of the cataract step. It joins the Solṭ at 838.7,1457.6 |

No lake and no vent record lies within 60 km. The nearest vent is the spillway's head fumarole (845,1396.5), 133 km north
(`tools/scale-model/edit_512.py`).

**Why the town stands at the riser's foot** (the spring line is **the owner's choice, 2026-11-16**; the reasons are
*proposed*). The river runs across the mouth, 300 m above the bench. Water that soaks into the mouth's gravels comes out as
**a spring line along the riser's foot**, and the pin sits on that line. So the town gets:
- its drinking water from the springs, not from the river;
- the riser behind it to terrace;
- a leat off the river at the mouth that waters the riser by gravity (the river's water is fit for the terraces: the
  owner, 2026-11-16);
- the bench before it for fields and pasture;
- a view north up the riser to the mouth and the white cataract, 20 km off and 1 km high. Krator's settlements lie near
  40 S, so the sun is in the north: the view is lit all day.

**Where the expedition road leaves the gorge.** From the town the road climbs the riser (4 %) to the mouth. It crosses the
Solṭ Siṭrīm by a bridge at about **840,1458** (1,866 m), on the level reach above the second fall. Then it climbs the
cataract step up the Reḍ Ḍrāi's trough: about 1,050 m in 10 km (10-11 %), so it zig-zags on the trough's west side. On the
gorge floor it runs 90 km north to the hot lake, then crosses the caldera floor to the camp. That makes about 200 km, the
tune's figure: 8 days at the tune's 25 km a day, and a day or two more up the cataract. **The mouth is where the road leaves
the gorge**, and the town takes the first ground below it that is flat, watered and warm. The bridge at the mouth is its
outpost (section 3).

**The other sites the survey weighed:**

| Site | px | Ground | Why not first |
|---|---|---|---|
| **The riser's foot** (the pin; **the owner's choice**) | 840,1463 | 1,507 m, 13 °C, the spring line, the bench before it | |
| **The mouth, on the river** | 840,1458 | 1,866 m, 11 °C, 44 m a km | On the river and 10 km nearer the gorge, but steeper, colder, cramped by the east wall (slopes over 150 m a km from x 850), and wide open to the cataract's spray and the gorge's night wind |
| **The bench's middle** | 850,1465 | 1,659 m, 12 °C, flat | The best fields, but 15 km from the springs and the road. Left to the farms (section 3) |
| **The Qol valley's head** | 827,1464 | 1,197 m, 15 °C | Warmer and on the Phēr road, but in a cleft under the second fall, 26 km from the gorge |

## 2. Who lives there

About **2,400** (the tune), with the Devisers' house (40), the Two Horns' factor (20) and the Dalab mission (about 30, the
owner) beside them. The shares below are *proposed* except the crews, which are the tune's (`tb.sulfur`, 15 %;
`tb.terraces`, 30 %).

| Who | People | What they do |
|---|---|---|
| **The terrace farmers** | **720** at harvest (the tune's crew), with their households | The riser's terraces and the bench's fields; barley, wheat and buckwheat at 1,500 m and 12-13 °C (`kits/crops` to pick: section 5); apricot and walnut on the terrace walls |
| **The sulfur diggers and kiln men** | **~180** (*proposed*: the tune's crew of 360 halved with the make, section 4) | The town's own small sulfur node at the cataract's foot, a steady works all year (the owner). They work in shifts from a diggers' hamlet there (section 3) |
| **The road** | ~150 | Muleteers, carters and porters on the road down to Phēr (the tune's six carriers) and up the gorge. Farriers, harness makers, a ropewalk |
| **The expedition season** | ~150 away each summer (`exp.godshearth`, a separate settlement in the tune) | The Devisers' camp: diggers of sulfur and hearth wax, scavengers of rarities, guards, guides. **The owner: the Devisers' people from Theodiga run it, and many of the hired men are locals.** *Proposed:* about 30 Devisers' people (the master of the expedition, the clerks, the guides and guards, the assayer of rarities) and about 120 hired men, most of them Thalaba's own, a few from the north shore. They muster here each spring |
| **The market and the trades** | ~300 | Smiths, tanners, potters, bakers, weavers, the inn and the teahouses, the market's sellers |
| **The Sultan's people** | ~40 | The licence clerks: the Sultan's **10 % of the overall haul and 20 % of the rarities** (the owner) is counted out here, at the Devisers' house and at the mission's, as each expedition comes home (the owner: the Dalab party pays it too). The road warden, a small watch at the bridge (no toll: the owner) |
| **The faith** | ~20 | A temple of the Decree with its wheel house, and a shrine at the bridge where the expeditions are blessed going up and counted coming down |
| **Households** | the rest, about 650 | Elders and children |
| **The Dalab mission** | **~30** (the owner), beside the 2,400 | The genepriests, who come over the rim for the hearth trees (the Godshearth plan, section 5), with their servants. **They run their own expedition into Godshearth and hire locals** (the owner). *Proposed:* a compound on the town's east edge (section 3); the party is section 4's |

**The Rare Devisers' house** (40) is the town's biggest compound. It holds:
- the yard where the expedition outfits;
- the strongroom for the rarities;
- the sheds for the sulfur and the hearth wax until the road takes them down;
- the counting room where the licence is cut.

**The Two Horns' factor** (20) sits on the Phēr road. It takes its 3 % margin on what passes. *Proposed:* the two houses are
wary of each other (X2: "wary of one another"), and the market square stands between them.

**Neighbours:**
- Phēr (843,1491 since the lake was re-made, scale model 5.1 edit 7 re-run, 5f659c054): 56 km straight, about 105 km by the
  Qol road (section 3).
- Ōlḍ-Thalaba (860,1496, on the lake's north-east shore since the re-made lake): 77 km straight, 2 km below.
- Ḍāiyar (870,1500): 95 km straight.
- The Godshearth camp (828,1380 in the tune): 168 km straight. Its own site plan is `settlements/devisers-camp/PLAN.md`
  (2026-11-16, the owner: "make the expedition's semi-permanent main camp as its own settlement"), which proposes the hot
  lake's outlet, 839,1398, about 130 km by the road up the gorge.

## 3. The layout (*proposed*, except the spring line, the mission and the open town, which are the owner's)

The town is about **1.5 km by 1 km** on the spring line at the riser's foot, at 1,500-1,560 m, centred on the pin. **Two roads meet in it:**
- the **Phēr road**, coming in from the west: **up the Qol Siṭrīm's valley** (the owner, 2026-11-16, in the Phēr plan's
  session: "up into the qol valley"; `settlements/pher/PLAN.md`, 8ef5899d0 on claude/pher-plan-55d3f2, traced on the re-made
  lake's heights, 5f659c054). About 105 km, 4 days: west-north-west 42 km across the rim plain from Phēr (843,1491) to the Qol
  where it leaves its lower gorge (822.7,1480); 34 km up the valley to its head (826.7,1463.6, 1,198 m), the steep part between
  rows 1470 and 1468 by the second fall; then 27 km east along the bench, over a rise of about 1,515 m (833.5,1463.5), into the
  town by its west gate;
- the **expedition road**, leaving north up the riser to the mouth;
- and, besides the two roads, **the mule path to Phēr** (the owner, 2026-11-16: "Yes, a mule path"): the short way down,
  straight south from the town's south gate across the bench and down the scarp, for pack mules and walkers, not carts.
  About 60 km against the Qol road's 105, traced on the re-made lake's heights (5f659c054) at a 7 % ruling grade: across the
  bench on x 840 to its edge (1,220 m at 840,1469.5), down the scarp along x 840-842.5 (1,140 m to 160 m in about 14 km, in
  zig-zags where it passes 7 %, at 840,1471 and 841,1472.5), due south across the plain on x 841.5 to the caldera's rim
  (about −20 m, 841.25,1488.25) and down Phēr's wall into the town (843,1491). Its line in px: 840,1463; 840,1470.5;
  840.5,1471.5; 841.5,1473; 842.5,1475; 842.5,1477; 841.5,1479; 841.5,1487; 841.25,1488.25; 841.75,1489.75; 843,1491.
  *Proposed:* two days for a mule train against the road's four; the carts and the sim's road stay on the Qol road.

**The town:**
- **The market square** stands where the two roads meet: the Devisers' house on its north-east side (toward the gorge), the
  Two Horns' factor on its west side (toward Phēr), the inn and the teahouses between them.
- **The spring line** runs along the town's north edge, at the riser's foot. Its springs feed fountains and a stepped tank
  (a Xanadu baoli) under the market, and the bathhouse.
- **The houses** climb the riser's first terraces behind the square, poor to rich. The rich houses are on the higher
  terraces, looking north to the cataract. The poor houses are on the bench's lip toward the Qol valley.
- **The temple of the Decree** stands on a terrace above the square, with its wheel house.
- **The road's quarter** is at the west end, on the Phēr road: caravan yards, stables, the farriers and the ropewalk.
- **The threshing floors and the granary** are at the east end, toward the fields.
- **The Dalab mission** is a compound past the granary on the east edge, **built in Dalab's style** (the owner): the
  genepriests' house, a seed and specimen house, its own yard and store for its expedition, and lodgings for the hired
  men. It stands apart from the Devisers' house.
- **No walls** (the owner). The town is open on every side. The "gates" above are where the roads come in, marked by a
  wheel house or a shrine, not a gatehouse. The only watch is the road warden's at the bridge.

**The riser terraces.** About 20 km of the riser either side of the expedition road (x 834-846, y 1459-1462). The grain needs
**about 250-300 ha of terraces** with fallow: 192 t at 1.2-1.5 t a hectare (section 4).
- They are watered by **a leat** taken off the Solṭ Siṭrīm at the mouth (about 1,850 m), contouring west and east across
  the riser's face, with drops to each flight.
- The terrace walls carry the apricots and walnuts.

**The bench east of the town.** About 700 km² of flat ground at 1,600-1,720 m:
- dry fields of barley near the town;
- pasture beyond, for the mules, yaks and sheep the road and the expeditions need;
- a ring of **farmsteads** (a `core/hamlet` pass after the town).
- The bench breaks at its south edge into the caldera's wall. Watch points along the edge look down 2 km to the lake.

**The mouth: Briḍj, the bridge ward** (about 840,1458; the names are coined in section 3a):
- the bridge over the Solṭ Siṭrīm, 53 m of river, stone piers on the level reach above the second fall;
- the road warden's watch house (no toll: the Sultan's share is taken in the town, section 4);
- the expeditions' shrine;
- the leat's headworks;
- the Devisers' summer muster ground and corrals. The camp gathers here in spring and is counted here in autumn.

**The diggings** (about 841,1453, at the cataract's foot, 20 km north of the town):
- the town's **small sulfur node** (the owner): beds in the cataract's walls, where the spillway cut down through the
  shield's old fumarole lines (*proposed*), worked steadily all year (section 4);
- a **diggers' hamlet** of the shift crews;
- the **kilns** (calcaroni: sulfur melted out of its rock in banked heaps). They stand on the mouth's east side, downwind
  of the town under the westerlies;
- sulfur loaves carted down past Briḍj to the Devisers' sheds and the town's store.

**The landmarks seen from the town:**
- the cataract: a 1 km white fall at the head of the view, its spray lit at sunset;
- the gorge's walls behind it, 5.5 km high;
- the second fall, 12 km west-north-west, where the Solṭ drops off the mouth;
- southward, nothing until the lake 2 km below.

## 3a. The names (**agreed by the owner, 2026-11-16**: first "I am open to proposals", then "agree with names")

These are coined on the owner's tongues sheet, by the rules `PROPOSAL-XANADU.md` Q5 uses: English worn to sound Nepali,
Tibetan or Persian; **t d** > **ṭ ḍ**; **f** > **ph**; **v** > **bh**; an initial **sc-/st-** breaks up, as *stream* >
*Siṭrīm*; long vowels marked. One extension is new: initial **sp-** breaks up the same way.

*Qāṭarāq* ("cataract") is already the province P3's name, so the falls here take *phōl* ("fall").

| Place | Xanadui | Gloss |
|---|---|---|
| The cataract at the gorge's mouth (842,1449-1453) | **Gāḍz-Phōl** | "God's Fall": Godshearth's water falling off the shield |
| The second fall, where the Solṭ Siṭrīm drops off the mouth (831-829,1460-1462) | **Solṭ-Phōl** | "the salt fall", after its river |
| The mouth, the basin under the cataract | **Gōrj-Phuṭ** | "the gorge's foot" |
| The bridge ward at the mouth | **Briḍj** | "the bridge" |
| The riser's terraces | **Siṭēps** | "the steps" (*st-* broken, as *Siṭrīm*) |
| The spring line at the town's back | **Siprīngz** | "the springs" (the new *sp-* rule) |
| The diggers' hamlet and its kilns | **Salphar** | "sulphur" (the **ph** already there) |
| The bench east of the town | **Bēnch** | "the bench": the fields and the pasture |

The town keeps **Thalaba**, the owner's name; the dental **th** is kept as in *Nōrth-Shor*.

## 4. The economy (in `XAN_TUNE` as it stands; *proposed* additions marked)

All figures are the tune's. `T.diet.town` is 160 kg of grain a person a year; the calendar's windows are harvest days 150-200
and the expedition days 120-240 (a northern year on core/clock's southern one: the owner asked to turn it, not done yet, KNOWN_ISSUES.md).

**Grain.**
- The town eats 2,400 × 160 kg = **384 t a year**.
- The terraces (`tb.terraces`, 720 at harvest) make **half**, 192 t.
- Phēr sends the other half up `road.pher-thalaba`: about 105 km by the Qol road (the sim's `T.thalaba.roadKm`, 82dd21e8f on
  claude/openworld-sites-24defd), six carriers, 10 t each, about 4 days.
- The camp's 150 eat another **28.5 t** (camp diet, 190 kg). The valley host bumps it onto Thalaba (`bump(TB, …)`), and the
  town passes it on by `devisers.supply`.

**Sulfur** (the owner: a small node of its own, most of it by expedition, a steady works).
- **The town's own deposit makes 30 t a year** (the owner, 2026-11-16), steadily all year: a works, not a field
  (`XAN_TUNE.field` is not used here). **In the tune (T1, done):** `T.thalaba.make.sulfur` is 30,000 kg and the crew
  180 (`sulfurCrew` .075 of the town, in place of 15 %, *proposed*), so a digger's year stays what it was.
- The Devisers' camp brings home **90 t of sulfur, 40 t of hearth wax and 60 rarities** a season. The house keeps 95 % of
  the camp's make (`share`).
- Together Thalaba handles **120 t of sulfur a year, three quarters of it from the expedition**. That is still more than
  the rest of the country (Hoṭ-Bāṭh's 40 t on the lake).
- Down the road it goes, with the wax and the rarities: to Phēr, across the lake (`lake.cross`) to the capital, and out
  with the Great Caravan in spring to Blakhed.

**The Sultan's share** (the owner, 2026-11-16): **10 % of the overall haul and 20 % of the rarities.**
- **10 % of the sulfur and the wax, and 20 % of the rarities in all, not 10 + 20** (the owner). On the Devisers' season that is
  **9 t of sulfur, 4 t of wax and 12 rarities** to the Treasury.
- It is taken where the haul comes home, at Thalaba, for `xan.citadel`. There is no toll on the road.
- **In the tune (T1, done):** `T.haul = {all: .1, rarities: .2}` replaces `T.devisers.licence` (0.1 of the rarities only).
  Each Godshearth road's `cut` takes it where the haul lands. Over the test's year that is 8.5 t of sulfur, 3.8 t of wax
  and 11 of 56 rarities from the Devisers' camp, and 0.76 t of wax and 3 of 37 kg of hearth seed from the Dalab party.
  `PROPOSAL-XANADU.md` section 7 follows.
- **The same share falls on the Dalab party's haul** (the owner): 10 % of its hearth seed and wax.

**The Dalab mission's expedition** (the owner: its own, hiring locals; the figures are *proposed*):
- A party of about **40**: 8-10 genepriests and their servants from the mission, and about 30 hired Thalaba men as
  porters, diggers and guides.
- It goes up the same road in the expedition window, to the Grove (Godshearth station 2, 836,1388), where the vent lines'
  discs merge into hearth forest, for seed, cuttings and specimens. It pitches its own camp, apart from the Devisers'.
- **Its haul is hearth seed and specimens for Dalab, and it goes home with the Great Caravan** (the owner). Hearth seed
  is a new good for the tune (*proposed:* 40 kg a season), with a share of wax. What the mission keeps after the
  Sultan's 10 % goes down to the capital and leaves with the Great Caravan in spring (Blakhed is its summer stop).
- **In the tune (T1, done):** the mission `dalab.thalaba` (30, faction `dalab`, a house beside the town, as `yuni.mission`
  stands beside the oil field) and its party `exp.dalab` (40, make 40 kg of `hearthseed` and 8 t of wax in the expedition
  window, 180 km by road), on the same camp code as the Devisers' (`camp(...)` in the tune).
- **The way down.** Phēr and the capital now *ask* for Thalaba's export goods (the roads' `expect`, Thalaba's year less the
  Sultan's share). Before, nothing below Thalaba wanted them, so its sulfur, wax and rarities never left the town; the Great
  Caravan's sulfur came from Hoṭ-Bāṭh. Over the test's year, 11.6 t of sulfur, 4.2 t of wax and 5 kg of hearth seed now
  reach Phēr, and the first of it the capital.
**Up the road:** grain, salt (the north's salt, landed at the capital by the Great Caravan, by the lake to Phēr and on up),
tea and tools. All of these are already on `road.pher-thalaba`.

**The Two Horns' factor** takes its 3 % where it stands (`T.horns`).

**Proposed for later passes (not in the tune):**
- **Mules, yaks and sheep** from the bench's pasture, sold to the expeditions and down to the north shore.
- **The hired men's wages:** the two expeditions' ~150 locals leave the town in the expedition window (days 120-240 in the tune; the southern summer, 302-57, on the page) and come
  home with pay. The sim does not count that yet; the camp is a separate settlement of 150.
- **Night-soil and kiln ash** onto the terraces: the reason the terraces can carry half the grain at 1,500 m. It is not a sim
  good.

**What the model gives the sulfur** (`kits/resources/GEOLOGY.md`):
- The resources kit's sulfur family is `255 exp(−d/10 km)` within 40 km of a vent, + 60 on volcanic ground.
- No vent lies within 130 km of the cataract, so the geology bake can give Thalaba's diggings at most the low volcanic
  floor.
- So the town's small node is an authored deposit: a **sulfur lode record** in `kits/resources/data/lodes.json`, as
  `lode:xanadu-gold` was authored for the Gold March. *Proposed:* `lode:thalaba-sulfur` at about 841,1452, small (r_km 3,
  a modest peak), so it reads as a small node beside the caldera's vent fields.

## 5. Core adoption (to write in full before the first fragment)

| Need | Module | How |
|---|---|---|
| the ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | the site cut by `tools/scale-model/cut_site.py` into the open-world region `xanadu-oidong-highrift`, which cuts the Xanadu Sultanate polygon the pin falls in (the owner); the Phēr road and the expedition road joined to `ROADS`, not drawn on their own |
| the riser, the terraces, the cataract step | `core/terrain` (`KRELIEF`, `KSTRATA`) | the terrace flights stepped into the riser; `gully` or `stepcut` for the cataract and the Reḍ Ḍrāi's trough; the Godthrone's tibasalt in the faces |
| the town | `core/city` (`KCITY`) | streets and lots at the riser's foot, the Xanadu kit's buildings on them, as Qiblai and Erewhon are built; no bespoke street pass |
| the buildings | `kits/xanadu` (on `VERN.def`, bundled as `XAK` by `kit_bundle.py`) | houses poor to rich, the square, the inn, the temple and wheel house, the granary, the caravan yards, the baoli. **New pieces** (to ask of the Xanadu kit, not to write here): the Devisers' compound with strongroom and sheds, the bridge and its toll house, the leat's headworks, the calcaroni. The Dalab mission's house is in Dalab's own style (the owner): a piece of whichever kit holds Dalab's buildings, or a new one asked of it |
| a site under construction | `kits/construction` (`KCONS`) | if the town is shown growing; not at first |
| the farmsteads, the diggers' hamlet, Briḍj | `core/hamlet` (`KHAMLET.village`) | the diggings as a resource (mining) village on the sulfur node; the farmsteads as a farming village on the bench |
| the expedition camp | `core/camp` | not drawn here (it is at Godshearth); the muster at Briḍj could use a camp's pitch in spring |
| water | `core/water` | `flow` for the Solṭ Siṭrīm and the leat, `fall` for the cataract and the second fall (seen from the town), `spring` for the spring line, `still` for the baoli |
| sky, weather | `core/atmos`, `core/clock` | the standard skybox; the cataract's spray; the katabatic flow out of the gorge at night (`fx/89-atmos-fx-katabatic.js`) |
| flora | `core/biome`, `biomes/xanadu` | Xanadu's dry-country species, which come up the gorge (Godshearth plan, section 4); the Hearths stay up in the caldera |
| crops | `kits/crops` (`CROPS.at`) | what the riser can grow at 1,500 m, 12-13 °C, 780 mm, irrigated |
| the sulfur | `kits/resources` (`KRES`) | the sulfur node at the diggings (the lode record, section 4); `ground.sulphur` for the beds and the kiln yards |
| dangers | `core/hazard` (`KHAZ`) | the river (`drown`), the cataract (`fall`), the kilns' fumes (`gas`, `poison`) |
| interiors, furniture | `kits/interiors`, `kits/catalog`, `core/furnish` | the Xanadu interiors; the Devisers' counting room and strongroom as new room kinds |
| people and time | `core/simulation`, `core/sched`, `core/clock`, `core/charactermodels` | the tune's settlement on the region host; the Xanadu sets; the expedition's departure and return as the year's two events |
| the economy | `core/region` | `XAN_TUNE` as it stands (section 4) |
| placement, records | `core/rand`, `core/tags`, `core/space`, `core/mask` | everything seeded by (world, cell, index, salt) and registered before it is drawn |
| host, tools | `core/host`, `core/walk` | the inspector, the polygon tool, the walk |
| surfaces | `core/materials` | the Xanadu pack (`kits/xanadu/materials.json`); tibasalt and sulfur from the library |
| export, LOD | `core/export`, `core/lod` | as every build |
| ruins | `core/ruins` | not taken: nothing here is ruined |
| caverns | `core/terrain` cavern cut | not taken: the small node is worked as open beds, not adits |

## 6. Steps

| Step | What | Test |
|---|---|---|
| **T0** (part done, 2026-11-16) | **The records**, through the scale-model session's queue (pins and model edits are its work): the pin 5.1e12 merged where the region is cut; the small sulfur lode record `lode:thalaba-sulfur` at the cataract's foot, sized for 30 t a year; `shvo49k0y2` added to `xanadu-oidong-highrift`'s `sites` in `openworld/SITES.json` (with the Dalab mission as a `"model": false` row, if it is drawn apart from the town) **Done on this branch:** the 5.1e12 records (Thalaba, Ōlḍ-Thalaba, Lāiṭwāl) applied to `60-settlements.js` verbatim from the scale-model commit; Thalaba in `SITES.json` (reach 22 km). **Still owed:** the sulfur lode record's stamp (the record is in `kits/resources/data/lodes.json` on claude/resource-nodes-7ec053, f568d34e9; it is stamped on `geology.json` with the next bake, which 62 pages read), and 5.1e12 merged from `claude/gemini-trade-reconcile` (the two copies are identical records) | the pin's ground is the bench (1,507 m); `cut_site.py --dry` lists Thalaba in the region; the geology bake shows sulfur at the diggings (owed) |
| **T1** (**done**, 2026-11-16) | **The tune's changes:** the town's sulfur to 30 t (crew 180); the Sultan's cut to 10 % of the sulfur and wax and 20 % of the rarities, on the Devisers' camp and the Dalab party alike; the Dalab mission (30) and its seasonal camp (40), and hearth seed if it becomes a good; the stale comments (section 8) | `test-xan-economy.js` and `test-east-rift.js` unchanged unless meant to move; Thalaba and the mission fed, the licence cut |
| **T2** (**done**, 2026-11-16) | **The ground:** `cut_site.py xanadu-oidong-highrift` re-run with Thalaba in it (the recut also brought the region up to the model: scattered patches the model moved since the last cut, Longsong's ring at its 2026-11-11 pin); the town page's ground is the model's, bicubic round the pin (`gen/69u-tb-ground.js`), the Siṭēps stepped into the riser's toe, the leat a core/water flow in its cut, the springs and the tank still water; the far land out to 40 km | `bake_sites.py --check`; the page's `on-the-model` (1,507.9 m drawn at the pin) and `water-on-core` (the leat falling all its length) |
| **T3** (**done**, 2026-11-16) | **The town on `core/city`** with the Xanadu kit, a target on Xanadu's page (`settlements/thalaba`, `README.md`): its own steps on a core/city instance, frontage-courts on 15 house blocks, the civic buildings round the square; the Rare Devisers' house as Thalaba's own piece (`tb_devisers`), the Dalab mission in the Dalab set's own pieces (the healers' hall, the granaries, a family compound, read in place); the near ground extended to the gorge's mouth, so the Siṭēps stand on the riser itself, below the leat; ~2,500 residents; a pieces sheet (`dist/thalaba-pieces.html`). Dalab's texture pack (trimmed to six families) and the road warden's watch house at Briḍj (`tb_watchhouse`; no toll house, the owner) since | the GPU verify (`thalaba-laid`, `on-the-model`, `people` as a budget, `water-on-core`) |
| **T4** (**done**, 2026-11-16) | **The outworks** in the region's ring (`openworld/xanadu-oidong-highrift/src/48-world-site.js`): Briḍj (a ranch village, 120, at the bridge 10 km north), Salphar (its own row `xanadu-sulfur`, focus `sulfur`: 4 adits, 5 calcaroni, a sorting shed; ~95 people, 20 km north), the near and far Bēnch farms; the region's roads bridged over the named rivers (core/world 42b, in the Xanadu kit's stone: Thalaba's north road crosses the Solṭ Siṭrīm by a 120 m arched bridge). The calcarone itself is `tb_calcarone` (Thalaba's own piece); on the region, which has no Thalaba kit, a pending box. Not yet: the kilns' hazard records (the region page takes no core/hazard) | `bake_sites.py`: no errors, 3 bridges; the region's GPU verify |
| **T5** (interiors, the people and the expedition season done, 2026-11-16; the people's bodies to come) | **Interiors and people:** (done: the Xanadu kit's walk-in houses on `?interiors=1`, 314 buildings, 1,799 rooms furnished, with the Devisers' house, the warden's watch house and the mission's healers' hall from Thalaba's own set, `src/89t2-tb-interiors.js`; the people on core/simulation, a first cut: 2,591 actors on lazy routes over the plan's ways, their days and the diggers' and the road's weeks, drawn near the eye as placeholder figures (`targets/town/89zu-tb-people.js`, `90t-tb-life.js`); the expedition season: the Devisers' 150 and the Dalab party's 40 muster at Briḍj in spring, are away up the gorge all summer and unload for the Sultan's count in autumn, on core/simulation's calendar (the windows *proposed*); to come: the people's bodies) the Xanadu interiors, the Devisers' rooms, the people on `core/simulation` and the expedition's muster and return | the interiors' checks; the sim's schedules |
| **T6** (the road laid to the cut's edge, 2026-11-16; to the Devisers' camp with the recut) | **The open world:** the town in its region; the expedition road joined to the Godshearth station 4 (`xanaduspill`, 845,1422). **Done:** the road from Salphar up the gorge (`SITE_SPEC.ways`, core/world 48s's opt-in road to a point; 35.8 km at 8 %, a bridge), ending at the cut's edge 80 km short of the camp (the owner chose its site, the hot lake's outlet, 839,1398: `settlements/devisers-camp`) (the owner: "Grow the cut up the gorge": the open-world session's recut takes a corridor to the station) | `bake_sites.py` (check ok, the way at its village and its end); the region's verify |

## 7. Questions for the owner

**Answered 2026-11-16** (the first round; the answers are folded into the sections above):
1. ~~**The town's place.**~~ **The spring line**, at the pin.
2. ~~**Thalaba's own sulfur.**~~ **A small node of its own; most of the sulfur comes by expedition.** The node is the
   authored lode at the cataract's foot (section 4).
3. ~~**The river's water.**~~ **Fit for the terraces.**
4. ~~**The sulfur as a field.**~~ **A steady works.**
5. ~~**The expedition's men.**~~ **The Devisers' people from Theodiga run it; many of the hired men are locals.**
6. ~~**Names.**~~ **Open to proposals:** coined in section 3a.
7. ~~**Who else.**~~ **No walls; a small Dalab mission of about 30.**
8. ~~**The region.**~~ **The polygon the new pin falls in:** the Xanadu Sultanate, cut as `xanadu-oidong-highrift`.

**Answered 2026-11-16** (the second round):
1. ~~**How small is the node?**~~ **30 t a year from the deposit.**
2. ~~**The Dalab mission.**~~ **Dalab's style; they run their own expedition and hire locals.**
3. ~~**The names.**~~ **Agreed** (section 3a).
4. ~~**The bridge's toll.**~~ **No toll: the Sultan takes 10 % of the overall haul and 20 % of the rarities.**

**Answered 2026-11-16** (the third round):
1. ~~**The Sultan's share.**~~ **20 % of the rarities in all, not 30 %; it falls on the Dalab party's haul too.**
2. ~~**The Dalab party's haul.**~~ **Yes: hearth seed and specimens for Dalab, home with the Great Caravan.**

**Answered 2026-11-16** (the fourth round):
1. ~~**A mule path straight up the scarp?**~~ **Yes, a mule path** (section 3): the short way to Phēr for mules and walkers,
   beside the owner's Qol road for the carts.

**Still open:** none from this plan. What is left is the work of section 6, and the found-on-the-way items of section 8 for
the sessions that own them.

## 8. Found on the way (for the sessions that own them; not changed here)

- ~~**`xan-tune.js`'s comments predate the owner's change on Yuni.**~~ **Fixed at T1.** Line 87 (`T.thalaba`: "still the Yuni caravans' staging
  town"), lines 147-149 and 405-409 (the Devisers "sell them on to Yuni's caravans there") still say Thalaba sells to Yuni.
  - The code is right: no gateway enters at Thalaba (`gate.yuni`'s `entry` is Qiblai), so `takeAt(TB)` is empty, and
    `road.pher-thalaba` carries no gateway goods.
  - `PROPOSAL-XANADU.md` line 385 says the same ("out by Yuni's caravans"); line 391 (the Great Caravan) supersedes it.
- **The rivers run off the trough below the cataract.**
  - `r_gh_spillway`'s last points (843,1450 to 847,1454) and `r442` from 847,1454 to 847,1458 lie on the gorge's east
    flank, where the slope is 60-110 m a km.
  - The height trough of the cataract step is at x 839-842, and only the wadi `r836` follows it.
  - At 1:1, `core/world` would draw a 130 m³/s river across a hillside. The fix is to move the records or carve the trough:
    the scale-model session's call.
- **A ledge at exactly 1,284 m on the bench's south-west rim** (833,1466-1468; 834-838,1469; 842-843,1469; 845,1470;
  850-852,1471). It is constant across 20 cells, inside edit 7's box (y ≥ 1464), so it looks like the edit's pit fill. To
  smooth at 1:1.
- **Holes in the gorge's climate grids.**
  - `p.png` gives **0 mm** on the gorge floor at 842,1435-1445, between 141 mm (1422) and 219 mm (1449), against 750-900 mm
    round it.
  - `tm.png` gives **1 °C** at 842,1449, between 10 °C cells.
  - Both are on the spillway's line: probably artefacts of the river's carve. For the scale-model session.
- **The Godshearth plan's river names are old.** Its section 1 calls r442 *Rīfar al-Bihār* and r272 *Bīruk al-Yāqūt*;
  the model now names them *Solṭ Siṭrīm* (old name *Reḍ Riwā*) and *Qol Siṭrīm*. The spillway's river now exists:
  *Āirã Siṭrīm*, edit 5.
- **This branch's settlement record still has Thalaba at 825,1481.** `tools/scale-model/model/src/60-settlements.js`
  predates 5.1e12, which is on `claude/gemini-trade-reconcile`.
