# Blakhed, the Fellgangs' market town at the Blak Riba head: a site plan (proposal, 2026-11-16)

The owner, 2026-11-16: **"upscale a bit to 5k"**. The lore and the Tungang kit's plan gave Blakhed 1,000-2,000; this plan
sizes it for **5,000 people**, the figure `core/region/WEST-RIFT-SCOPE.md` section 3b already counts.

It was written as a plan on the `claude/openworld-sites-24defd` worktree; the build session (`claude/blakhed-72bd22`,
2026-11-16) settled it for the build (section 0) and builds steps B1-B5's first pass (`README.md`). Every invented thing is
marked *proposed*. Every estimate is marked (est.). Pixels are on scale model 5.1 (1821 x 1723 px, 2 km a pixel).

**What is settled** (quoted, not proposed):
- **The name and the site:** Blakhed, at **the Blak Riba head, px 441,1400** (the owner, 2026-11-11; `LORE.md` l.270;
  `kits/tungang/PLAN.md` 1.3.3). It stands "where the south road tops out of the Chimes gorge, the one land crossing
  between the rims".
- **What it is:** a **market town**, non-raiding, kin to both the Fowlers and the Ice-cutters. It **stores the
  Ice-cutters' ice and the Fowlers' eggs** and **keeps the gorge stair's ropes** (LORE l.270-273).
- **Dalab:** the site lies in the Realm of Dalab polygon. The town **pays Dalab a toll** and keeps its **market peace**
  under Dalab's claim (the owner, 2026-11-11).
- **The Travellers** (the Fellgang road families, with the **Kradz**, their dark clan) hold **a yearly Fair** (LORE l.277-284).
  The Tungang kit's plan makes Blakhed the Fair's permanent ground and the Travellers' winter quarter (*proposed* there).
- **The Great Caravan** stops at Blakhed each summer (the owner, 2026-11-16, `core/region/data/xan-tune.js` l.163-176:
  `gate.dalab.blakhed`, year day ~159, between Erehwon and Nulab). There Blakhed "takes the exports".
- **The size:** 5,000 (the owner, 2026-11-16).
- **The town and its country** (the owner, 2026-11-16: "Some live in farmsteads. And there is a healthy hamlet network around
  it"): the 5,000 are the town and its farmsteads along the river (question 1's ~4,400 and ~600, *proposed*), and a network of
  Fellgang hamlets on core/hamlet lies round it beyond them. *Proposed:* about a dozen hamlets of ~150, ~2,000 people (est.),
  counted with the scope's Fellgang fells; their grain, herds and ice come to Blakhed's market.

### 0. The answers the build takes (2026-11-16, the build session `claude/blakhed-72bd22`)

The owner's answers above are taken as settled. Every other question of section 8 takes this plan's recommended answer,
*proposed*, so the build can go on; the owner can overturn any of them, and the five marked **ask** went to the owner.

| Q | Taken | Status |
|---|---|---|
| 1 | The 5,000 are **~4,250 in the town, ~150 at the Stairhead, ~600 on four steadings** along the river within 10 km. The hamlet network (twelve of ~150, ~1,800) lies beyond, counted with the fells (section 3.2a). The extra people: settled carriers, Travellers who stayed, drovers' families, the Stairmen | owner (the split), *proposed* (the numbers) |
| 2 | The town stays at the pin; **the Stairhead is a ward at the falls' lip**, ~24 km down the river, with Dalab's toll post. Both are on the page: two near grounds joined by the river's country | *proposed*, **ask** |
| 3 | The stair is a **switchback beast path with roped pitches and hoists** (the Stairhead's gin wheels) | *proposed*, **ask** |
| 4 | The crossing to the north rim is a route record only; its form stays open | open, **ask** (not on the page) |
| 5 | **Ice ponds** on the river flats below the town, fed by leats, cut in winter, beside the Ice-cutters' lake ice | *proposed* |
| 6 | The Fair in **autumn**, after the shielings come down, on Blakhed's own **Fairfell** south of the town | *proposed* |
| 7 | The herd beasts stay unnamed: the folds and byres are drawn empty | open, **ask** |
| 8 | Salt: the drovers, from the western fells' salt basins (scope 4.4) | owner |
| 9 | Blakhed is a **transit market**: Dalab's factors buy the Great Caravan's goods there; the caravan camps on the Fairfell | *proposed* |
| 10 | The toll: **a tenth** of what goes down the stair, in kind; a post of **~25** with a genepriest. A Giant guard: not drawn | *proposed*, **ask** (the Giant) |
| 11 | **One head**, elected by the double meeting: two meeting halls face each other across the Market, the Fowlers' rope wall in one and the Ice-cutters' tally board in the other (the kit's two `fg-meethall` variants), until the kit has a double hall | *proposed* |
| 12 | **No wall**: the market peace and a watch | *proposed* |
| 13 | The Kradz winter at the western Hearth vent's caves, off the page | *proposed* |
| 14 | **`settlements/blakhed/build.py` of its own**, a target on Xanadu's page as Thalaba, Kirstabal and Lāiṭwāl are, with the Tungang kit sealed in as `TG` (the Fellgang set) and the Dalab set read in place for the toll post | *proposed* |

**One finding of the town-scale survey (B1), taken by the build.** The model's Blak Riba runs **1.9 km north-west of the pin**
(its vertex 440.2,1399.5); the town is to stand on its south bank. The build moves that one vertex about 1 km toward the pin
(to 440.65,1399.68: inside its own 2 km cell, so within the model's resolution) and carves the channel into the model's ground
(section 5). The river then passes ~0.6 km north-west of the Market. *Proposed*: for the scale-model session's pin batch.

Sources read: `core/region/WEST-RIFT-SCOPE.md`; `LORE.md` 6.1 (l.236-284); `kits/tungang/PLAN.md` 1.3, 1.3.3, 1.3.4, 3.3,
3.3.1, `README.md`, `API.md`; `biomes/riftrim/PLAN.md` (the 5.1 survey, section 6, stations 8 and 9, the 2026-11-13 note);
`core/region/data/xan-tune.js`; on the branch `claude/loj-twenny-059a5e`, `biomes/line/PLAN.md` and
`settlements/loj-twenny/PLAN.md`; `kits/crops` (queried); `core/hamlet/fellgang/README.md`; `core/city/README.md`.
The shape follows `settlements/thalaba/PLAN.md`.

## 1. What Blakhed is

The rim's **market and meeting town**. It lives by **storing and carrying**, not by one craft (tungang plan 1.3.3). It
stands at the head of the one land crossing between the Rift's north and south rims, where Dalab, the Fellgangs, the
Travellers and, once a year, Xanadu's Great Caravan meet.

| Part | Source | What it does |
|---|---|---|
| **The market** | lore | Fellgang goods meet Dalab's and the basin's. A **market peace**: no raiding, no feud, inside the town's bounds (canon); *proposed*: kept by the meeting, with the market's wardens, and the peace stone where a quarrel is sworn off |
| **The ice houses** | lore | Hold the Ice-cutters' blocks for the warm basin (+16.6 °C) and Nulab. *Proposed:* also the town's own **pond ice** (section 3) |
| **The egg and honey store** | lore | The Fowlers' take: eggs bedded in ash, wall honey in crocks, herbs (the kit's `fg-eggstore`) |
| **The rope walk** | lore | Makes and keeps **the gorge stair's ropes and ladders** (a Fowler craft). *Proposed:* also sells rope to the Fowlers' families, the Kradz, and Dalab's road |
| **The gorge stair** | lore | The way down to the basin and Nulab. Blakhed keeps its ropes. Section 4 |
| **The beast pens and sledge sheds** | tungang plan 1.3.3 | The drovers' beasts, the Fair's sales, the town's own herds in winter; the sledges of the ice road |
| **The meeting hall** | tungang plan 1.3.3 | Keeps both peoples' customs: the Fowlers' **rope wall** (a rope is a vote) beside the Ice-cutters' **tally board** ("the Cold is owed") |
| **The Travellers' Fair ground** | tungang plan 1.3 (*proposed* there) | The rim's great meeting: beasts traded and raced, matches made, quarrels settled, news carried (Ballinasloe's horse fair is the model) |
| **The Travellers' winter quarter** | tungang plan 1.3.3 (*proposed* there) | Where the road families winter with their wagons. *Proposed:* the Kradz winter apart, near the western Hearth vent's caves (33 km) |
| **Dalab's toll** | the owner, 2026-11-11 | Paid in kind (ice, eggs, rope: *proposed* in the tungang plan) at Dalab's toll house by the gorge stair's head |
| **The Great Caravan's stop** | XAN_TUNE | Lands Xanadu's exports (cacao, cacao cake, saffron, opium, tea, brocade, silk, sulfur, wax, rarities, hearthseed) each summer, then goes on to Nulab and Shelf |

**Its politics** (*proposed* on the lore):
- It **stands between** the Realm and the Fellgangs who resent it. It pays Dalab, and it shelters the Travellers.
- It is **kin to the Fowlers and the Ice-cutters**, and the rival of no one. Wildcat raids its ice road (canon).
- When the Union strikes against Dalab's caravans, where Blakhed stands is "the town's own politics" (tungang plan 1.3.3).
  It has no shaft head near it: the Line runs under the gorge floor 53 km off.
- PLAN-POLITICS's **Fellgang rising at Nulab** (rising 8) would start, or be stopped, here.

**Not one village grown big.** At 5,000 Blakhed is about **33 times** the Fowlers or the Ice-cutters (150 each), not the
"ten times" of the tungang plan. *Proposed:* the extra people are the rim's settled carriers and dealers, Travellers who
stayed, drovers' families who came in from the west highland, and the stair's keepers. Question 1.

## 2. The site in numbers

Read from `tools/scale-model/model/data` with `smodel.page` (heights on `h.png`, lo -2,600 m, hi 27,000 m; `tm`, `tw`,
`tc`, `th`, `tl` as `L - 90` °C; `p` as `L / 255 x 4,000` mm; `c` the Köppen class; wind `wd` as power and speed;
`rivers.json`). Air is 1.6 atm x e^(-h / 8 km), as riftrim's survey uses. The model's cell is 2 km: **slopes and drops
below are smoothed**, and the town scale needs its own survey (step B1). The scripts were scratch, not committed.

### 2.1 The pin

| | At 441,1400 |
|---|---|
| Height | **3,653 m** |
| Air | **1.01 atm** (Earth's sea-level air) |
| Slope | **3.4 %** (the 2 km cell) |
| Climate | **Dsb** (dry-summer warm continental) |
| Temperature | mean **+3 °C**; warmest month 16, coldest −10; hottest afternoon 23, coldest night −17 |
| Rain | **894 mm** a year, most of it in winter as snow (Dsb: the summer is the dry season) |
| Wind | 383 W/m², 6.8 m/s: sheltered (the tungang plan's survey: 0.79 of the 22 km median) |
| Polygons | `The Rift`, `w rift highland`, `rift rim S`, `Fellgangs`, `Realm of Dalab` |
| On the model | **not pinned** (scope Q13: the pin batch is queued with the scale-model session) |

### 2.2 The ground round it

**A broad shoulder, not a ledge.** The town sits on the high bench of the west rift highland:

- **Within 10 km** (a 5-cell box): 3,464-4,142 m, median 3,730 m. Every 2 km cell is **under 5 %**.
- **Within 20 km:** 2,579-4,330 m, median 3,739 m. 414 of 441 cells under 5 %.
- **The bench** (cells within ±250 m of the pin and under 12 %, joined to it): **about 12,500 km²**, x 379-492, y 1294-1458.
  It is the whole west highland's shoulder, from the drovers' country to the rim.

**The heights along eight bearings** (every 6 km, out to 60 km):

| Bearing | 0 | 6 | 12 | 18 | 24 | 30 | 36 | 42 | 48 | 54 | 60 km |
|---|---|---|---|---|---|---|---|---|---|---|---|
| N | 3,653 | 3,579 | 3,700 | 3,697 | 3,395 | 2,507 | 1,337 | 1,121 | 1,023 | 890 | 762 |
| NE | 3,653 | 3,485 | 3,517 | 3,390 | 3,178 | 2,238 | 1,637 | 1,185 | 674 | 360 | 487 |
| E | 3,653 | 3,603 | 3,614 | 3,574 | 3,264 | 2,563 | 1,501 | 558 | −140 | −1,014 | **−1,625** |
| SE | 3,653 | 3,720 | 3,748 | 3,762 | 3,796 | 3,720 | 3,523 | 3,344 | 3,354 | 3,518 | 3,618 |
| S | 3,653 | 3,855 | 4,058 | 4,186 | 4,240 | 4,253 | 4,285 | 4,363 | 4,397 | 4,386 | 4,393 |
| SW | 3,653 | 3,858 | 4,069 | 4,186 | 4,265 | 4,378 | 4,335 | 4,462 | 4,576 | 4,646 | 4,715 |
| W | 3,653 | 3,792 | 4,036 | 4,158 | 4,214 | 4,287 | 4,418 | 4,514 | 4,487 | 4,547 | 4,833 |
| NW | 3,653 | 3,694 | 3,769 | 3,746 | 3,705 | 3,742 | 3,780 | 3,783 | 3,725 | 3,600 | 3,564 |

**The rim's edge.** The ground first falls 300 m below the pin at **20-25 km** to the north, north-east and east (24.5 km N,
20.5 km NNE, 23 km E), and at 31 km to the ESE. Past the edge it drops fast:
- **North, into the great lake's basin:** 3,395 m at 24 km, 1,337 m at 36 km, then easing to ~760 m at 60 km.
  Nulab's shore is 344 m.
- **East, into the Rift's head:** 3,264 m at 24 km, 558 m at 42 km, **−1,625 m at 60 km**. That is **5.3 km below the town**.
  The Rift floor's lake (level −1,862 m) is 70 km east at 476,1403.
- **South and west the fells rise:** 4.2-4.4 km at 18-48 km south, 4.8 km at 60 km west. The Blak Riba's source is
  5,152 m at 408,1420, 76 km WSW.

So the town looks **north-east down the Blak Riba** to the rim's edge, with the fells at its back. That fits the tungang
plan's survey: "fells rise behind it to the south and west, to 4.1-4.2 km, and the gorge falls away north and east."

### 2.3 The Blak Riba

`rivers.json` `r116`: perennial, order 1, 153 km, catchment 4,508 km², **42.7 m³/s at its mouth**, 29 m wide and 1.5 m deep.
It rises at 5,152 m (408,1420) and joins the **Chimes Riba** at 454.2,1371.5. The Chimes Riba is the great lake's outlet,
1,088 m³/s and 148 m wide, which falls into the Rift past Chimes.

Its course past the town (the ground's height along it, from the model):

| Reach | Px | Ground | River |
|---|---|---|---|
| Past the town | 440.2,1399.5 (1.9 km from the pin) | 3,680 m | **~31 m³/s** |
| **The falls bench** (tungang plan: 445,1397) | 442.7-445.5, 1395-1397.5 | 3,480-3,515 m, level for ~8 km | 36-39 m³/s |
| The falls' lip | ~449.6,1392.6 | ~3,190 m | 40 m³/s |
| **The falls** | 449.6,1392.6 to 449.7,1385.7 | **3,190 m to 1,290 m in ~17 km** of river (est.; the model's cells smooth it, so the real falls are steeper) | |
| The basin reach | 450-452, 1374-1385 | 1,180 m falling to ~670 m | 42 m³/s |
| The mouth | 454.2,1371.5 | the Chimes Riba at ~300 m | 42.7 m³/s |

**"The Blak Riba head"** reads, on the model, as the head of the river's fall off the bench. The town is on the river
**about 25 km upstream of the falls' lip** (est., by the river). Question 2.

**Water for the town:** the river at ~31 m³/s is ample for 5,000 people, the herds and the leats. The model has no lake
within 70 km. *Proposed:* the town's own **ice ponds** are shallow basins fed by leats off the river, flooded in early
winter and cut when frozen (section 3).

### 2.4 Climate up and down

| Where | Px | Height | Class | Mean (warm / cold month) | Rain |
|---|---|---|---|---|---|
| The town | 441,1400 | 3,653 m | Dsb | +3 (16 / −10) | 894 mm |
| The falls bench | 446,1396 | 3,467 m | Dsb | +4 (17 / −9) | 910 mm |
| The fell behind the town | 436,1402 | 4,021 m | Dsc | +1 (14 / −12) | 800 mm |
| The shielings' fells (*proposed*) | 430,1405 / 420,1410 | 4,336 / 4,649 m | Dsc | −2 (11 / −15) / −3 (10 / −16) | 737 / 690 mm |
| Nulab | 443,1359 | 344 m | Csa | (riftrim: +16.6 °C on the shore) | ~1,050 mm |
| Chimes | 468,1392 | 243 m | Csa | (riftrim station 4: +22) | ~1,050 mm |

Within 30 km: Dsc about 1,490 km², Dsb about 1,270 km², and a few cells of Csa, Csb and Cfa where the ground falls off the rim.

### 2.5 What the town can sit on

- **The town:** the pin's own cell and its neighbours, 3,600-3,700 m, under 5 %, on the river's south bank. A town of
  ~1.5 km by 1 km fits many times over (est.).
- **The in-field:** ground near the river under 10 % and below ~3,800 m, watered by leats in the dry summer.
- **Farm ground in reach:** within 30 km, **about 2,600 km²** of cells under 10 % slope with a warmest month of 10 °C or
  more; **about 1,740 km²** under 15 % and below 4,000 m. The town needs a small fraction of either (section 3.4).
- **The summer pasture:** the fells to the south and west, 4.0-4.6 km, Dsc.
- **What `kits/crops` says will grow there** (`CROPS.at({warmth: 'cool', atm: 'standard', arid: 'subhumid'})`, 28 crops).
  On rain:
  - grains: **frostoat**, redstem buckwheat, snow bistort, dustmillet;
  - pulses and tubers: **helix bean**, terrace lentil, **snow potato**, frostroot, sweetroot;
  - fruit and berries: highland crabapple, vale apricot, frost rowan, wall bilberry, crowberry, canyon serviceberry;
  - the rest: pine nuts, bench garlic, juniper, goldroot, ivan-chai, mountain sorrel.

  Irrigated: fiddleheads, cloudberry, mist tea, cloud tamarillo.

  The tungang plan's Fellgang foods (bell seed meal, starberries, crozier fiddleheads, eggs, wall honey, herd meat, pine
  nuts) fit this list. **Bell seed** is riftrim's wild flora, not a crop of the kit.

## 3. 5,000 people (*proposed* throughout, except the parts section 1 calls settled)

### 3.1 Who lives there

**About 820 hearths at about six a hearth** (5-7: est.). The livelihoods:

| Livelihood | Hearths | People | What they do |
|---|---|---|---|
| **Fields and byres** | 250 | 1,500 | The in-field on the river: frostoat, buckwheat, snow potato, helix bean on leats; hay meadows; the herds' winter byres in their longhouses |
| **Herds and shielings** | 80 | 500 | The town's herd beasts (the rim's big animals: unnamed, question 7), taken up to summer shielings (`fg-shieling`) on the fells south and west |
| **Ice** | 70 | 420 | The pond cutters in winter, the ice-house keepers, the carry down the stair |
| **Ropes and the stair** | 60 | 360 | The rope walk; *proposed* **the Stairmen**, who keep the stair's ropes, ladders and hoists and guide loads down it |
| **Carriage and beasts** | 110 | 660 | Sledgers and pack-beast men on the ice road and the drove road; the pens; dealers who settled |
| **The market and the stores** | 80 | 480 | The egg and honey store, the general stores (`fg-store`), the halting houses where outsiders sleep and drink, the Fair's wardens |
| **Trades** | 160 | 960 | Salvage-smiths (the Travellers' trade, settled), tanners and felters, sledge-wrights, coopers, potters, peat cutters, weavers of wool and bark cord |
| **The head, the meeting, the cairn hall** | 10 | 60 | The town's elected head and household; the keepers of the meeting hall and the cairn hall |
| **Total** | **~820** | **~4,940**, with ~60 lone and old folk: **5,000** | |

**Beside the 5,000** (not counted in it):

| Who | People (est.) | When |
|---|---|---|
| **The Travellers in winter quarters** | ~500 of the scope's 750 (the rest winter at halting places) | from the Fair to the thaw, about five months |
| **The Kradz** | ~50 (est.) | they winter near the western Hearth vent's caves, 33 km west (tungang plan) |
| **Dalab's toll post** | **~25** (est.: toll-men, a clerk, a genepriest, a few guards), part of the scope's 100 in Dalab's posts | all year |
| **The Fair** | ~3,500 visitors (est.) | about ten days in autumn |
| **The Great Caravan** | ~400 (est.), with its beasts | about two weeks round year day 159 |

### 3.2 The quarters (*proposed*; the names are placeholders in the Fellgangs' worn English)

The town is **about 1.5 km by 1 km** (est.) on the river's south bank, centred on the pin. It has **no wall**: it lives by
the market peace (question 12).

| Quarter | Where | What is in it | Kit pieces |
|---|---|---|---|
| **The Market** (*Markit*) | the town's centre, on the pin | the market square; the **meeting hall** with the rope wall and the tally board (a **double hall**, one end each); the **head's house**; the general stores; the halting houses; the **peace stone** | `fg-meethall` (both variants: one hall at town scale, missing), `fg-headhouse`, `fg-store`; a market hall and booths (missing) |
| **The Icegarth** | on the river below the town, downstream (north-east) | the **ice houses**, dug into the bank's north face for the cold; the ice ponds on the flats beside the river; the sledge sheds; the reckoning board | `fg-icehouse` x 12-16 (est.), `fg-sledgeshed`, `fg-ice-tools`; a great ice house (missing) |
| **The Ropewalk** | along the river bank, straight and level | **the rope walk** (about 250 m: est.; a real rope walk is a few hundred metres), the tar and bark sheds, the egg and honey store beside it (the Fowlers' quarter) | `fg-ropehouse` is 20 m: a town walk is missing; `fg-eggstore` x 4-6 |
| **The Folds** (pens) | the town's west edge, toward the drove road | the **beast pens**, the drovers' yards, the byres, the hay barns | `fg-pens`, `fg-barn` |
| **The Fairfell** | the open ground south of the town, rising to the fells | **the Fair ground**: the ring for racing beasts, the fair pens, booth rows, the judges' cairn. *Proposed:* the Great Caravan camps here in summer | the Fair's pens and stalls (planned in the tungang plan, missing) |
| **The Winterings** | beside the Fairfell, on the lee of the first rise | **the Travellers' winter quarter**: wagon stands in family rows, halting shelters, a shared smithy, their own fire ring | `fg-wagon`, `fg-halt`, `fg-lantern-post`; a `traveller` row in `core/camp` (missing) |
| **The houses** | round the Market, in garths along the lanes | ~820 hearths: longhouses (house and byre) for the field and herd families, houses and huts for the trades; richer houses near the Market | `fg-longhouse`, `fg-house`, `fg-hut`, `fg-smokehouse`, `fg-barn` |
| **The cairn hall** | on a knoll at the town's south edge | the dead's names on slate tallies; the old rules said aloud from its step | `fg-cairnhall` |
| **The Stairhead** | the head of the falls, **~25 km down the river** (about 449,1393: est.) | **Dalab's toll house**; the Stairmen's ward: the hoists, the rope stores, a halting house; the top of the stair | the Dalab set (`settlements/dalab/src`) for the toll house; `fg-ropehouse`, `fg-halt`; a hoist (missing: the planned `fg-shaft-rig`'s gin wheel is the nearest) |

**The Stairhead and the toll.** The pin is about 25 km (est.) up the river from the falls' lip, so the toll house cannot
stand "by the gorge stair's head" and in the town at once. *Proposed:* the Stairhead is a ward of its own, about 150 of
the 5,000 (est.: Stairmen's hearths, the halting house), a day's sledge from the town, with Dalab's post beside it.
Question 2.

**The in-field and the outworks** (each a `core/hamlet` village, under its 500 cap):
- **Steadings** along the river for 10 km above and below the town (est. ~600 of the field families live out on them;
  question 1).
- **Shielings** on the fells south and west, summer only.
- **Peat banks** on the wet flats, if the town survey finds them.

### 3.2a The hamlet network (the owner, 2026-11-16: "a healthy hamlet network around it"; *proposed*: the sites, names, foci)

Twelve Fellgang hamlets of ~150 (~1,800 people), one in each 30-degree sector round the town, 13-24 km out, each on the
bench's gentlest 2 km cell in its sector (under 5 % and 3,350-4,150 m, read from `h.png`). The names are placeholders in the
Fellgangs' worn English. They send grain, herds, ice and slate to Blakhed's market. Each is a `core/hamlet` village on the
Fellgang row (`BK_ROW`); their records are for the open world, and the page draws those inside its country.

| Hamlet | Px | Bearing, km | Height | Focus |
|---|---|---|---|---|
| Highgarth | 439,1392 | N, 16.5 | 3,743 m | farming |
| Beckfoot | 443,1393 | NNE, 14.6 | 3,647 m | farming |
| Pondhead | 451,1397 | ENE, 20.9 | 3,519 m | ice (ponds on the falls bench) |
| Fallsfield | 450,1398 | E, 18.4 | 3,557 m | farming |
| Cragfold | 449,1404 | ESE, 17.9 | 3,659 m | ranch |
| Hayfell | 445,1411 | SSE, 23.4 | 4,142 m | ranch |
| Slatebank | 443,1409 | S, 18.4 | 4,127 m | quarry (roof slate and drystone) |
| Highbyre | 438,1406 | SSW, 13.4 | 4,141 m | ranch |
| Peatmoss | 434,1403 | WSW, 15.2 | 4,143 m | farming |
| Coldwater | 430,1398 | W, 22.4 | 4,147 m | ice |
| Drovers' Rest | 432,1392 | WNW, 24.1 | 3,726 m | ranch (on the drove road) |
| Tarnside | 434,1391 | NW, 22.8 | 3,669 m | farming |

**The steadings** (part of the 5,000): four clusters of ~150 on the river within 10 km of the town, two above it and two below
(focus `farming`, one `ranch`), drawn on the page.

### 3.3 Light, fuel and look

- **Fire people** (tungang plan 1.3): tallow, hearth wax, peat fires of moor sponge, spiked braziers. **Lantern lobelia**
  planted along the lanes, faint blue on cold nights.
- **Fuel** is the town's quiet shortage at 3,650 m. There are few trees on the fells. *Proposed:* peat, dung, and timber
  bought up the stair (bell-fir poles for roofs).
- **The look:** drystone under turf on bell-fir poles, salvage lashed on, a slogan over every door (HOLD FAST, ALL HANDS).
  The market's punk is paint and pride, not spikes.

### 3.4 What it eats (all est.)

**The need.** About 235 kg of grain-equivalent a person a year (2,200 kcal a day at 3,400 kcal a kg).

| Mouths | t grain-eq a year |
|---|---|
| The 5,000 | 1,175 |
| The Travellers' winter (500 x 5 months) | 50 |
| The Fair (3,500 x 10 days) | 23 |
| Dalab's post (25) | 6 |
| The Great Caravan's people (400 x 14 days) | 4 |
| **Total** | **~1,260, call it 1,300** |

**Where it comes from** (*proposed*):

| Source | t grain-eq | Share | Basis |
|---|---|---|---|
| **Its own fields** | ~550 | 42 % | ~600 ha cropped (frostoat and buckwheat ~0.8 t/ha, snow potato ~1.5 t/ha as grain: ~0.9 mixed), as much again in fallow or ley: **about 12 km² of in-field** on leats off the Blak Riba (the summer is the dry season) |
| **Its herds** | ~300 | 23 % | milk, butter, cheese, blood and meat from ~1,500 head of the town's beasts (~0.2 t a head a year, mixed herd), wintered on hay from ~15 km² of meadow; with ~50 t of the drovers' meat bought at the Fair |
| **Gathered and kept back** | ~100 | 8 % | bell seed, starberries, pine nuts, fiddleheads; the eggs and honey kept back from the store |
| **Bought up the stair** | ~350 | 27 % | the Nulab basin's grain (helix bean, rice, ashroot), paid with ice, rope and carriage: ~4,400 beast-loads of 80 kg a year, about 12 a day (or ~12,000 porter-loads) |
| **Total** | **~1,300** | | **about three-quarters home-grown** |

The ground is not the limit: 12 km² of in-field and a few hundred km² of summer pasture, against ~2,600 km² of workable
ground within 30 km. **The limits are the season** (a warmest month of 16 °C: one harvest, short) **and the dry summer**,
which the leats answer. The **350 t from the basin** is the town's tie to Dalab: the scope's section 3d asks the basin's
surplus to feed the two cities, the Union's lojes and Blakhed.

### 3.5 What it sells and what it buys

| Sells | To | Note |
|---|---|---|
| **Ice** | Nulab and the basin (fish, the rich's cellars); **Dalab's gene stores** at Nulab and Ledge (*proposed*) | Two kinds (*proposed*): the Ice-cutters' clear **lake ice**, dear, carried 300 km; and the town's **pond ice**, the bulk. ~1,500 t a year in store, ~1,000 t down the stair after ~30 % melt (all est.) |
| **Rope and ladders** | the stair itself, the Fowlers, the Kradz, Dalab's road, the Union's shaft heads (through the Kradz) | the rope walk's lobe-larch bark cord with Ancient cable spliced in |
| **Eggs and honey** | Nulab, Dalab's traders, the Great Caravan | the Fowlers' take, resold. The Fowlers also sell straight to the Hearth hold (80 km from them) |
| **Felt, hides, wool, smoked meat** | the basin, the Great Caravan | the drovers' and the town's |
| **Beasts** | the Fair's buyers, Dalab's road (pack and sledge beasts) | the Fair is the rim's beast market |
| **Carriage** | everyone | the town's sledgers and the Travellers |
| **Mended salvage** | the fells | the salvage-smiths |

| Buys | From |
|---|---|
| **Grain** | the Nulab basin, up the stair |
| **Salt** | unknown: none within 169 km of any West Rift town (scope 4.4 and Q5). Question 8 |
| **Metal** | bar and plate from the basin or the skarn (Dalab's, 69 km); copper from the coppersmiths by the Travellers |
| **Timber** | the basin, up the stair |
| **Cloth** | the basin (lotus silk, sea-linen) |
| **Xanadu's goods** | the Great Caravan (cacao, tea, silk ...). *Proposed:* most is bought by **Dalab's factors** at Blakhed's market and goes on, so Blakhed is a **transit market** for them, not their eater (question 9) |

### 3.6 Dalab's toll (*proposed*)

- **Where:** the toll house at the Stairhead, on the way down. What goes down the stair pays. What comes up does not.
- **What:** in kind, **a tenth** (est.) of the ice, eggs and rope that go down. Dalab takes ice for its gene stores, and
  eggs and rope for its road.
- **Who:** ~25 of Dalab's people (est.). A genepriest to judge the ice's fitness for the gene stores; a few guards. Perhaps
  a Giant guard: question 10.
- **The Great Caravan:** Dalab is 46 % of the caravan's operation (Gemini), so *proposed* the caravan pays no toll at the
  stair. The market's dues are the town's own.

## 4. Its roads

Measured on the model: the straight distance, and a least-cost line on the 2 km cells (cost per step the length x
(1 + (grade / 6 %)²), no lake water: the rule riftrim's road survey used). Times at **~25 km a day** (the scope's pack
figure); the stair is slower.

| Road | To | Straight | By the ground | Height and climb | Time (est.) | Carries | Risk |
|---|---|---|---|---|---|---|---|
| **The gorge stair** | **Nulab** (443,1359) | 82 km | **98 km** | down 3.3 km: the falls bench at 3,480 m, then **~2.1 km of stair** (3,270 m at 448,1393 to 1,130 m at 442,1380), then the basin | 4 days down, 5 up (est.) | ice, rope, eggs, honey, felt down; grain, salt, timber, cloth, metal up | the stair itself (falls, ice) |
| **The Chimes descent** (*proposed*: a second way down) | **Chimes** (468,1392) | 56 km | 80 km | down 3.4 km by the Chimes gorge's south wall (2,866 m at 455,1400, 1,230 m at 462,1396, 542 m at 464,1395) | 3-4 days | to the Line's Chimes halt (a ruin) and the crossing north | |
| **The crossing to the north rim** | **the Fowlers** (571,1397) | 260 km | **310 km** | down into the Rift's head (~400-800 m) and up onto the north rim: 4.8 km of climb, 6.1 km of descent in all | ~14 days | eggs, honey, herbs south; grain, rope north | the Chimes Riba (148 m wide, ~1,090 m³/s) must be crossed: in the basin above the notch, or in the gorge, where the 2 km line crosses it near 467-470,1394-1398 (the model cannot say which is passable): question 4 |
| | the Hearth hold (525,1400) | 168 km | 210 km | the same crossing | ~9 days | ice, grain to the hold | |
| **The ice road** | **the Ice-cutters** (470,1521) | 249 km | **298 km** | stays on the rim, 2.1-4.4 km: over the fells south (4,379 m at 441,1422), past Wildcat's country | ~12 days by sledge in winter | ice, by sledge on snow | **Wildcat raids it** (canon) |
| | Wildcat (427,1453) | 110 km | 121 km | over a 4.4 km fell | 5 days | | the band |
| | the gold camp (438,1448) | 96 km | 104 km | over the same fell | 4 days | Fellgang gold in summer | |
| **The drove road** | **the drovers** (393,1338) | 157 km | **165 km** | level highland, 3.4-3.9 km all the way | 7 days with beasts | beasts, felt, hides, meat, wool in; grain, salt out | |
| | Dalab's skarn hamlet (416,1377) | 68 km | 69 km | level, 3.5-3.8 km (on the drove road) | 3 days | Dalab's copper and iron | |
| | the western Hearth vent (430,1388) | 33 km | 33 km | level | 1-2 days | the Kradz' winter caves | |
| **Dalab's road** | **Ledge** (437,1330) | 140 km | **210 km** by the highland to Ledge's cliff top (1,563 m) | 1.5 km of climb, 3.6 km of descent | ~9 days | Dalab's toll-men and supply | Fellgang raids on the surface stretches |
| | then **Dalab** (477,1108) | | +528 km by Dalab's road (the scope) | the crest at 9,645 m, the tunnel | ~3 weeks more | | Tungang shaft raids near Shelf and Ledge |
| | or Nulab, the lake and Ledge's lifts | | 98 + 59 km | | | | the lifts are the Union's lever |
| **The Great Caravan's leg** | **Erehwon** (800,1503) | 747 km | not routed here | riftrim's 2026-11-13 note (Gemini, for the owner to review): by the S rim's footwall ramps past Cthonos and the Opal Valley relay | **52 days** a leg in XAN_TUNE; Gemini: "831 km, 90 days" for the whole | Xanadu's exports west; Shelf's salt, iron, wine and pearls east | Lizardmen (scope Q6) |
| | Cthonos (526,1503), the Ice-cutters' buyers | 267 km | 306 km | down to 57 m on the Rift floor's edge | ~12 days | ice | Lizardmen? |

**The stair** (*proposed*):
- It is two kinds of way. **A switchback beast path** on the falls' west side, with roped pitches where the face is steepest.
  And **hoists**: loads lowered on ropes past the worst pitches, from the Stairhead's gin wheels.
- The Stairmen keep it. Blakhed's rope walk renews its ropes.
- Whether beasts can go down at all decides whether the Great Caravan's beasts reach Nulab or its goods are broken down
  into porter loads at Blakhed (question 3).

## 5. Core adoption

Written first, as CLAUDE.md asks ("CORE MODULES ARE NOT OPTIONAL"), and settled for the build on 2026-11-16 (section 0).

**What the page takes** (`settlements/blakhed/build.py`, `kit.json`; checked by `tools/check_core_use.py`):

| Module | Taken | For |
|---|---|---|
| Xanadu's page (`settlements/xanadu/build.py --kit`) | the host | core/host's camera, panel, inspector, polygon tool and probe; core/rand, core/tags, core/door, core/lod; the verify harness (`settlements/xanadu/verify.py` on `tools/harness.py`). No Xanadu kit building is drawn |
| `core/city` (with `core/space`) | yes, sealed in `gen/69b-kcity-bundle.js` | **the town**: one instance (`rand: 'krand'`, insertion order, `TUNE.exact`); its own steps lay the raster, the roads (the drove road, the stair road, the ice road, the fair lane) and the lanes; the **frontage-courts** strategy fills the house blocks with the Fellgang keys (`kit.dims` from `TG.fg.dims`, `TUNE.classes` the Fellgang keys). The Market, the Icegarth, the Ropewalk, the Folds, the Fairfell, the Winterings and the cairn hall's knoll are the plan's records, placed by the town's site step, never by a builder |
| `core/hamlet` + `core/hamlet/fellgang` | yes, in the same closure | **the four steadings** (focus `farming` / `ranch`), **the Stairhead** (the row's own focus `stair`), **the twelve hamlets** of the network (records for the open world; those within the page's country drawn). The Fellgang row has works for `fowling` and `ice` only: the page extends it locally (`BK_ROW`: farming, ranch, quarry and stair works from the kit's keys), as Kirstabal extends the Xanadu row, so no other world's villages move |
| `kits/tungang` (the Fellgang set) | yes, sealed as `TG` (`tungang_bundle.bundle(tex=True, side=...)`, the maps beside the page) | every Fellgang building and road piece: `TG.fg.draw` (seated by the kit: floor at the highest corner, plinth to the lowest), `TG.fg.pieces` (lantern posts, halts, wagons, ice tools) |
| the Dalab set (`settlements/dalab/src` 69d, 69e, 70, 71, 71c, 73, read in place as Thalaba does) | yes | **Dalab's toll post** at the Stairhead: the watch tower, the toll store (warehouse), the genepriest's house, the toll-men's compound; Dalab's pack trimmed to its families |
| `core/water` (+ `core/atmos` for its clock and waves) | yes | the **Blak Riba** a `flow` from 8 km above the town down the falls to their foot (white on the falls), the **leats** off it, the **ice ponds** `still` |
| `core/drawn` | yes | every ground mesh registered (`KDRAWN.grid`), so the eye check measures the drawn ground |
| `core/biome` + `biomes/riftrim` (rim `w`, the veiled rim of the W rift highland) | yes, sealed in `gen/69b4-bk-flora-bundle.js` | the country's flora over a mask made from the plan's records (never from pixels): the cloud belt's moor sponge, sedge and cotton grass, prism heath, bell firs and lobe larch where the fields allow, lantern lobelia along the lanes |
| `core/materials/record` | yes | the town's ground sets (`materials.json`, `tex/`); the kit's own pack for the buildings |
| `core/clock`, `core/sched`, `core/simulation`, `core/charactermodels`, `core/camp`, `core/hazard`, `core/walk`, interiors, `core/export` | not yet | the life, the people, the Winterings on `core/camp` (no Traveller row yet), the hazards, the interiors and the Godot export are later steps (B4-B6); `KNOWN_ISSUES.md` |
| `core/region` | data only | Blakhed's records for the West Rift sim (`sim/wr-blakhed.js`, section 6): no tune runs them yet |

**What the kit lacks at town scale**, named for the Tungang kit (not written here): a **double meeting hall**, a **long rope
walk** (the page lays a ~240 m walk of twelve `fg-ropehouse` sheds end to end), a **great ice house** (the page sets out
fourteen `fg-icehouse` barrows), a **market hall and booths** and **the Fair's ring, pens and stalls** (the page draws the
ring's rails and the booths as plain posts and hides, page geometry, and the fair pens as `fg-pens`), a **halting house** (an
inn), a **smithy**, a **tannery and felt house**, a **granary**, a **stair hoist** (the page draws the gin wheels' frames as
page geometry). These go upstream into `kits/tungang` once the owner has seen them.

**The first table (the plan's survey of every need, before the build):**

| Need | Module | How | Gap |
|---|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | the site cut by `tools/scale-model/cut_site.py` into a new open-world region (*proposed* `west-rift-head`: Blakhed, Nulab, Ledge, Chimes); the stair, the drove road and the ice road joined to `ROADS` | **no West Rift region in `openworld/SITES.json`; Blakhed is not pinned** |
| The bench, the falls, the stair | `core/terrain` (`KRELIEF`, `KSTRATA`, `KCARVE`) | `rift-basement` and `rift` strata in the faces; `stepcut` or `gully` for the falls; the stair's switchbacks cut into the face | |
| **The town's layout** | `core/city` (`KCITY`) | streets and lots on the bench; *proposed* the `frontage-courts` strategy (houses round garths); the Market, the Fairfell and the Folds as districts with roles; no bespoke street pass | **no Fellgang adapter**: `kit.dims` from `TG.fg.dims(key)` and `TUNE.classes` to write |
| **The buildings** | `kits/tungang`, the Fellgang set (`TG.fg.draw`, `TG.fg.pieces`; 14 buildings, 8 road pieces) | every house, store, ice house, pen, the meeting hall, the cairn hall, the wagons and halts | **missing at town scale** (to ask of the kit, not to write here): a meeting hall for both customs in one, a **long rope walk** (~250 m against `fg-ropehouse`'s 20 m), a **great ice house**, a **market hall and booths**, the **Fair's pens, ring and stalls**, a **halting house** (an inn), a **smithy**, a **tannery and felt house**, a **granary**, a **stair hoist** (gin wheel and lowering frame); `fg-shieling`, `fg-cairn` and `fg-stone-sign` are planned, not built |
| Dalab's toll house | the Dalab set (`settlements/dalab/src` 69d-73, read in place as Thalaba does) | a small compound in Dalab's style | a toll house piece |
| Steadings, the Stairhead, the shielings, the ice ponds | `core/hamlet` (`KHAMLET.village`) with `core/hamlet/fellgang/22-hamlet-fellgang.js` | the `fellgang` row; focus `ice` for the Icegarth's ponds, `ranch` for the steadings and shielings | no `stair` or `carry` focus for the Stairhead (*proposed*: add one, or use `fowling`'s rope house) |
| The Winterings, the Fair's crowd | `core/camp` | a `traveller` row for the wagons and halts (tungang plan 1.3) | **missing**: core/camp has no Fellgang or Traveller row (`core/camp/PLAN.md` l.162: "gap") |
| Water | `core/water` | `flow` for the Blak Riba and the leats, `fall` for the falls seen from the Stairhead, `still` and `WATER.ice` for the ice ponds in winter (as riftrim's stations 3 and 9) | |
| Sky, weather, seasons | `core/atmos`, `core/clock` | the standard skybox; winter snow that lies (riftrim station 7's `snowBase`); the Fair in autumn, the caravan in summer | |
| Flora | `core/biome`, `biomes/riftrim` (the S rim) | bell seed, lantern lobelia, crozier, starberries, bell-fir | |
| Crops | `kits/crops` (`CROPS.at`) | `{warmth: 'cool', atm: 'standard', arid: 'subhumid'}` (section 2.5) | |
| Dangers | `core/hazard` (`KHAZ`) | the river and the ice ponds (`drown`), the stair and the rim's edge (`fall`) | |
| Interiors, furniture | `kits/interiors`, `kits/catalog` (the `fellgang` culture file), `core/furnish` | the Fellgang interiors the kit draws; the store's goods; the ice houses' cut-away | the market hall's and halting house's rooms |
| People and time | `core/simulation`, `core/sched`, `core/charactermodels` | Fellgang dress (tungang plan 1.5), Traveller dress, Dalab's toll-men | Fellgang outfits are owed by the outfit sessions |
| The economy | `core/region` | `WR_TUNE` (section 6) | not written |
| Placement, records | `core/rand`, `core/tags`, `core/space`, `core/mask` | every record seeded by (world, cell, index, salt) and registered before it is drawn | |
| Host, tools | `core/host`, `core/walk` | the inspector, the polygon tool, the walk | |
| Surfaces | `core/materials` | the Tungang kit's pack | a turf-roof and drystone set if the kit's are thin |
| Export, LOD | `core/export`, `core/lod` | as every build | |
| Ruins | `core/ruins` | not taken: nothing here is ruined | |

## 6. Its place in a future West Rift sim

The scope's build order (section 6) and what Blakhed is in each step:

| Step | Blakhed's part |
|---|---|
| **W0** (numbers and map) | **its pin** in the scale-model session's batch, with the Fowlers, the Ice-cutters, the drovers and the rest; this plan's answers |
| **W1** (`WR_TUNE`) | **a town record at scale 50** (about 100 actors); its works; the stair, ice, drove and egg roads; the Fair and the Travellers' winter in the calendar |
| W2 (the Line) | none directly: the Line runs 53 km off, under the gorge floor |
| **W3** (join the East Rift) | **replaces `gate.dalab.blakhed`**: the Great Caravan lands Xanadu's exports at a real town, and Blakhed's market sells them on to Dalab's factors |
| **W4** (the books) | **Dalab's toll in kind** at the Stairhead, into Dalab's treasury |
| **W5** (strikes, raids, risings) | **Wildcat's raids** on the ice road; the market peace as a check on unrest; the Fellgang rising at Nulab |
| W6 | the Kimr's goods through Wildcat come to the Fair |

**The record** (*proposed*, in the valley spec's shape, `core/region/50-region-valley.js`; numbers est.):

```js
{id: 'wr.blakhed', name: 'Blakhed (the rim\'s market town, at the Blak Riba head)', faction: 'fellgang',
 people: 5000, px: [441, 1400], scale: 50,
 eats: {grain: .45, potato: .15, milk: .15, meat: .10, eggs: .05, honey: .02, bellseed: .08},
 works: [
  {id: 'bk.fields',  kind: 'fields',   crew: .20, out: ['grain', 'potato', 'beans'], season: 'summer'},
  {id: 'bk.herds',   kind: 'herd',     crew: .08, out: ['milk', 'meat', 'hides', 'wool']},
  {id: 'bk.ponds',   kind: 'icecut',   crew: .06, out: ['ice'], season: 'winter'},
  {id: 'bk.icegarth',kind: 'store',    cap: 1500000, goods: ['ice'], keep: .7},        /* the ice houses: ~30 % melts by the time it reaches Nulab */
  {id: 'bk.eggstore',kind: 'store',    goods: ['eggs', 'honey', 'herbs']},
  {id: 'bk.ropewalk',kind: 'rope',     crew: .03, out: ['rope']},
  {id: 'bk.market',  kind: 'market'}]}
```

Its roads and others' records:
- `wr.road.stair`: Blakhed and Nulab, 98 km; down: ice, rope, eggs, honey, felt. Up: grain, salt, timber, cloth, metal.
  `cut`: Dalab's tenth at the Stairhead (`dalab.blakhed`).
- `wr.road.ice`: from the Ice-cutters, 298 km, winter only (`season`), with Wildcat's raids as W5's risk.
- `wr.road.drove`: from the drovers, 165 km, in autumn for the Fair.
- `wr.road.north`: to the Fowlers and the Hearth hold by the crossing, 310 and 210 km.
- `dalab.blakhed`: Dalab's toll post, ~25 people, faction `dalab`.
- The Travellers as an org (`travellers`) whose carriers are the roads' carriers, with `winter: 'wr.blakhed'`.
- **The Fair** as a calendar event: ~3,500 people for ten days in autumn, the year's beast market.
- In XAN_TUNE, the `dalab` list's `gate.dalab.blakhed` becomes `wr.blakhed` (W3).

## 7. Steps

| Step | What | Test |
|---|---|---|
| **B0** | **The records.** The owner's answers (section 8). Blakhed's pin (and the Stairhead's) in the scale-model session's queue, with the West Rift's pin batch (scope W0). A West Rift region in `openworld/SITES.json` with the stair as a corridor to Nulab | the model and `SITES.json` agree |
| **B1** | **The ground.** `cut_site.py` for the region; the town's ground bicubic round the pin; the Blak Riba as a `core/water` flow; the leats and ice ponds; the falls and the stair cut in the face; **a town-scale survey** of the slope, the wind and the river's banks, which the 2 km model cannot give | the region's bake checks; nothing on a slope past the town's limit |
| **B2** | **The kit's town pieces**, asked of the Tungang kit (section 5's list), on the set's contract: the same frame, the plinth to the lowest corner, everything registered in `core/tags` | the kit's `verify.py --assert` and its box checks |
| **B3** | **The town on `core/city`** with a Fellgang adapter (`TG.fg.dims`); the Market, the Icegarth, the Ropewalk, the Folds, the Fairfell, the Winterings and the houses as districts; a target on the Tungang kit's page, or a build of its own (question 14) | Voth's checks: exact footprint overlap, nothing on a street or in water; each building dry and on its plinth |
| **B4** | **The outworks.** The Stairhead (a `core/hamlet` village and Dalab's toll house), the steadings, the shielings (summer), the ice ponds; the Winterings on `core/camp`'s new `traveller` row | `test-hamlet.js`; the camp's tests |
| **B5** | **The sim.** Blakhed's record, roads and toll in `WR_TUNE` (W1, W4); the Great Caravan's stand-in replaced (W3) | the town fed in a year; the stair's grain arrives; the toll lands in Dalab's books; `test-east-rift.js` and `test-xan-economy.js` unchanged unless meant to move |
| **B6** | **Interiors and people.** The Fellgang interiors; the people on `core/simulation`; the Fair and the caravan as the year's two events | the interiors' checks; the sim's schedules |

## 8. Questions for the owner

1. **All in town, or a town and its in-field?** Do the 5,000 live in the town, or ~4,400 in the town and ~600 on steadings
   along the river within 10 km (proposed)? And where do the extra people come from, now that Blakhed is ~33 times the
   Fowlers, not 10 times: settled carriers, Travellers and drovers (proposed)?
2. **The town and the stair head.** On the model the pin is ~25 km up the Blak Riba from the head of its falls (~449,1393).
   Keep the town at the pin, with **the Stairhead** as a ward at the falls holding Dalab's toll house (proposed)? Or move
   the town to the falls' lip?
3. **The stair's form.** A switchback beast path with roped pitches and hoists (proposed), or a rope-and-ladder stair for
   porters only? If porters only, the Great Caravan's beasts stop at Blakhed and its goods go down in porter loads.
4. **The crossing to the north rim.** The road to the Fowlers and the Hearth hold goes down into the Rift's head and must
   cross the Chimes Riba (148 m wide, ~1,090 m³/s). A ferry, a bridge of Fellgang rope, an Ancient span, or a ford below the
   lake? And is that the "one land crossing between the rims"?
5. **The town's own ice.** Ice ponds on the river flats, cut in winter, beside the Ice-cutters' lake ice (proposed)? The
   Ice-cutters are 300 km off by the ground and 150 people. Their ice alone cannot fill a 5,000-town's ice houses.
6. **The Fair.** In autumn, after the shielings come down (proposed)? And on Blakhed's own Fairfell, or on "a fell everyone
   knows" nearby?
7. **The herd beasts.** The rim's big animals are still unnamed (tungang plan 1.3). What are the town's herds?
8. **Salt.** (**Settled, the owner 2026-11-16: "We'll have the drovers be a major salt source"**; Blakhed is their market. *The map's answer, 2026-11-16, in the scope's 4.4 item 1: the western fells' high salt basins, 219 km west,
   the farthest salt from the Lizardmen, worked by the western Fellgangs and droved to Blakhed's market.*) Where does Blakhed's salt come from? No salt lies within 169 km (scope Q5). The fells' rock salt at 354,1347
   (204 km straight), carried by the drovers?
9. **The Great Caravan at Blakhed.** Is Blakhed a **transit market** where Dalab's factors buy Xanadu's goods (proposed),
   or does `WR_TUNE` have Blakhed eat them? Does the caravan camp on the Fairfell?
10. **Dalab's toll.** A tenth of what goes down the stair, in ice, eggs and rope (proposed)? A post of ~25 with a
    genepriest (proposed)? A Giant guard?
11. **The head.** One head elected by the double meeting (the rope wall and the tally board), or two, one for each kin?
12. **Walls.** No wall, only the market peace and a watch (proposed)? Wildcat raids the ice road, not the town.
13. **The Kradz.** Do they winter near the western Hearth vent's caves (33 km; tungang plan), or in the Winterings?
14. **The build's home.** A target on the Tungang kit's page (as Thalaba is on Xanadu's), or `settlements/blakhed/build.py`
    of its own?

## 9. Found on the way (for the sessions that own them; not changed here)

- **Distances in the scope.** `WEST-RIFT-SCOPE.md` 4.1 gives Blakhed to the Fowlers and the Ice-cutters as "~250 km". That is
  the straight line. **By the ground** they are ~310 km (across the Rift's head) and ~298 km (round by the fells).
  The stair to Nulab is 82 km straight, ~98 km by the ground.
- **The air.** At 3,653 m the model gives 1.01 atm. The rim's Fellgangs live at Earth's sea-level pressure; the
  basin below them is at 1.5 atm.
- **"A tenth of Blakhed".** Riftrim section 6 and the scope give the Fowlers as "a tenth of Blakhed". At 5,000 that ratio is
  stale.
- **The Blak Riba's mouth** is 619 m in `rivers.json`, but the Chimes Riba it joins is at ~299 m there. Probably the river
  record's last vertex, not a fault.
