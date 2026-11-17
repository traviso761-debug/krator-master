# Ledge: the brief for its blueprint (plan, draft, 2026-11-16)

**The build session (2026-11-16) settled the plan in section 9**: the shell, the levels, the lifts, the split of the 10,000,
the ruin, the Line's arrival, Core adoption and what was assumed for each of section 5's questions. Sections 1-8 are the
brief as written; where section 9 differs, section 9 is what is built (and section 0 wins over both).

Ledge is the Realm of Dalab's arcology on the West Rift's great lake: scale model 5.1 px **437,1330** (2 km a pixel), model id
`sxyznayzgc`, type `arcology`, polity `Dalab Council`. It stands about 1.3 km up the cliff over the lake, and the Tungangs of
**Loj Fower** run its lifts.

**The owner, 2026-11-16:** "Ledge is about 10k". It will need its own blueprint, made in its own session later; for now, nail
down the details. So this file is the brief that session starts from: the facts, the numbers and the decisions to take. It is not
the blueprint. Nothing is drawn or built yet.

Marks used throughout: ***proposed*** is invented here and waits for the owner; **(est.)** is an estimate, with its basis beside it.
Everything else is quoted from a source named in the line or in "Sources read" at the end.

## 0. The owner's answers (2026-11-16)

These settle sections 3-5 where they differ; the blueprint session starts from them.

- **The Line slopes down to Ledge** ("The Line must slope down to it"). It does not arrive level at the cliff top: the bore
  descends from the table-land (~3,480 m) to its station in the face, so question 4's spiral (or a long graded descent) is the
  shape, not a level arrival at the head.
- **It is partly inhabited, and half ruined.** "The arcology is half ruined": the blueprint draws a shell with whole decks
  dead or fallen, not a full one.
- **Who lives where:**
  - **the Tungangs (Loj Fower) hold the middle decks, by the Line's station**, not the rock behind every deck;
  - **sizeable Dalab and Fellgang settlements on the top and at the bottom**: the head on the table-land's edge, and the
    foot on the shore and the terraces by the lake. Fellgangs live at Ledge, not only Dalabites.
- **The elevators still work, sized for vehicles**: each car takes several pack animals at once. They are the arcology's
  own, running; the Tungangs' lever is that they work them and hold the decks the cars pass through.
- So the levels of section 3 read: the **head** (Dalab and Fellgangs, on top), the **middle decks** (the Line's station
  and Loj Fower), the **ruined decks** (dead or fallen, between), and the **foot** (Dalab and Fellgangs, the harbour and
  the shore). How the 10,000 split between them is still question 11.

## 1. What Ledge is

### 1.1 What the sources say

| Source | What it says |
|---|---|
| `LORE.md` §6.1 (the owner, 2026-10-23) | **"the Ancient arcology** that gives the settlement its name, on the cliff over the great lake at the Rift's western head, across the Outer Wall: where the Ancients' Rift line came out of the Wall". **"A bridge between two levels"**: the highland where the road arrives, and the basin and lake ~1.3 km below. Holding it means working both. Dalab occupied the **abandoned** arcology to study the rim's flora and fauna for useful genes. Dalab is "the only real power on the rift rim", but **"the hold is tenuous"**: every supply train is an expedition. The Tungangs "still keep stretches of the tunnels and **Ledge's lifts**". "Dalab's road and Ledge's lifts depend on an uneasy bargain with them" |
| `LORE.md` §4 (the Rift line) | Ledge is where the line comes out of the Wall; the Pile was the Rift's hub; "most of the Dalab-Ledge line runs underground" |
| `biomes/riftrim/PLAN.md` §5 (settled 2026-10-23; theme canon 2026-11-11) | "Ledge is the Ancient arcology". The road's terminus, stores and stables above; the fields, the harbour and the way to the gorge below; the arcology between them, built into the cliff, **"its lifts, inclines and stairs the only way up and down"**. **Theme (canon): a transit hub first** (terminus halls, the lift shafts, sidings cut into the rock), **with Dalab's gene bank as the second story**: "Dalab came for the line's road and stayed for what the arcology's gardens and vaults hold". *Proposed* there: the Ancient lifts are why Dalab's hold depends on others |
| `biomes/line/PLAN.md` (branch `claude/loj-twenny-059a5e`) | Station **4, Ledge's lifts**: "the arcology's top level, the lifts down the cliff (Loj Fower)", an Ancient station, 42 km of surface from the south portal |
| `kits/tungang/PLAN.md` 1.2 | "Ledge's lifts are Loj Fower". The Tungangs sell passage, "the lifts at Ledge" among it; they buy "Dalab's grain at Ledge". The kit names a def for it: `tg_lift_head`, "Loj Fower's: the lift's machine room kept by rite, the gear shrine". Canon in its faults: "the Strike has become a weapon (**work-to-rule at the lifts**, raids on Dalab when the bargain breaks)" |
| `core/region/WEST-RIFT-SCOPE.md` (2026-11-16) | Ledge is Dalab-held; **the lifts are the Union's lever**; its makes and needs (section 3 below); its salt and timber the Rift's biggest shortfalls at 10,000 |
| `openworld/RESOURCES-SETTLEMENTS.md` (the census) | arcology, reach 20 km; Cfa 15 °C, 878 mm, 1.32 atm, 1,562 m; copper 24, rare earths 18; farm 26, pasture 178, **fish 745**, timber 524, **salt 0** (good rock salt 169 km off, at 354,1347), water 279 |
| `kits/ancients/targets/ledge` and `src/89i-ledge.js` (2026-09, before the lore) | **"The Ledge"**, an Ancient arcology already built as a kit target: 34 pale limestone slab layers cantilevered off a sandstone escarpment 850 m tall and 2 km long, as an **inverted ziggurat** (the lowest layer 150 m over the plain reaches 40 m out of the rock; each one above reaches further; the top decks overhang 330 m, a great prow 460 m; the top deck flush with the plateau). Lift cores run up the face. Intact and ruined (decay 1: the prow fallen across the town, mid layers sheared at the rock line, a wing pancaked, a rockfall). Its site is a desert plain facing west |
| `openworld/populations-gemini.json`, `TRADE-GEMINI.md` (a draft, not canon) | Ledge is **Tungang Union**, about **2,200** people; "Loj Fower Cliff Lifts (Ledge-Nulab)"; exports to Fulcrum, Voth, Iziz and Ys "by Dapor -> Shim"; gunpowder, small arms, whiskey and an armour surplus at Ledge |

### 1.2 Where they disagree, and what the owner's 10,000 settles

- **Ancient or Dalab-built?** Every canon source says **Ancient**. Dalab built nothing of the shell; it occupies it and adds its
  own buildings (the Dalab set, as at Span). This plan takes that as settled.
- **Whose is it?** Gemini makes Ledge a Tungang town. The lore and every repo plan make it Dalab's, with the Tungangs holding the
  lifts. The scope's question 3 asks how Ledge splits. *Proposed* (section 3.3): Dalab holds the decks, Loj Fower holds the rock
  behind them (the shafts, the machine rooms, the stair, the springs' caverns). Gemini's Tungang polity is read as a description of
  who controls the way in, not of who lives there.
- **"Tenuous" against 10,000.** The lore's word was about the supply line and the bargain, not the head count. At 10,000 Ledge is
  a real town, the size of Nulab: the tenuousness moves to **what it cannot make** (salt, timber, iron, a third or more of its
  food) and **who holds the lifts**. That is the version this plan writes: a big Ancient shell, mostly empty, a town of 10,000 in the
  sound part of it, fed and supplied through a lift it does not run.
- **The Ancients' target is the wrong size and faces the wrong way.** Its cliff is 850 m and faces west over desert; Ledge's
  face is ~1,265 m from the pin to the water and faces **south over the lake**, in warm temperate forest (section 2). The form
  (slab layers stepping out as they rise, lift cores on the face, a prow) fits the lore well. Whether to start from it is
  question 1 (section 5).
- **Gemini's 2,200** are retired by the owner's 10,000.

## 2. The site in numbers

Read from the model (`tools/scale-model/model/data/h.png`, `wl.png`, `p.png`, `c.png`, `tm/tw/tc/th/tl.png`, `rivers.json`),
decoded as `smodel.page` does (heights: lo -2,600 m, hi 27,000 m, 16 bits in R and G; the water flag in B). The model's cells are
2 km, so it shows the face as a slope; the drawn ground (riftrim station 1) cuts the cliff and its Ancient benches into it.

### 2.1 The face

| Place | Px | Height | Note |
|---|---|---|---|
| The tableland at the Line's south portal | 439.5,1309.5 | 3,496 m | the Line comes out here and runs 42 km on the surface to Ledge |
| The Red Riba's hollow on the way | 438,1317 | 3,162-3,176 m | a perennial river, 86 m³/s, crossing the Line's surface run (the "dips" the Line plan crosses on decks) |
| **The tableland's edge** above Ledge | 438,1324 (to 3,629 m at 442,1323) | **3,481 m** | where the escarpment starts down |
| The escarpment | 437,1327 / 1328 / 1329 | 2,663 / 2,360 / 1,981 m | ~1.9 km of fall in ~10 km: a 19% mean slope on 2 km cells |
| **Ledge's pin** | **437,1330** | **1,562 m** | the arcology's level in the model (riftrim: "cliff top 1,563 m") |
| The water's edge below it | 437,1331 | 297 m (the lake) | 2 km south of the pin |
| **Ledge over the lake** | | **1,265 m** | the lore's "~1.3 km" |
| Water to tableland in one face | | **~3.2 km** | the escarpment runs the whole north shore (x 424-450) at 2.7-3.4 km above the water within ~12 km |

**The face has two parts:** an upper escarpment of ~1.9 km from the tableland's edge down to Ledge's level, and the lower cliff of
~1.27 km from Ledge to the water. The lore's 1.3 km is the lower one. This matters for the Line (section 4.2).

### 2.2 The rivers beside it

- **The Geit Riba** ("gate river": `rivers.json` r006, perennial, 69 km, **714 m³/s** at its mouth; its `settlements` field names
  Ledge). It runs south down a straight gorge at x ~430 (floor ~2,730-2,750 m for 30 km, walls to 3.4 km), takes the Red Riba at
  434,1321, and leaves the gorge at 2,705 m (434,1325). Then it falls: 2,372 m at 434,1327, 1,673 m at 434,1329, into the lake at
  **434.2,1331.4**. **A fall of ~1.4 km into the lake about 6 km west of the pin** (3.1 px). Ledge's water, its view, and perhaps
  its power (question 8).
- **The Swift Riba** (r048, 82 m³/s) falls ~630 m into the lake at 442.2,1333.4, about 12 km east.
- **Ledge's cliff springs** (`biomes/KARST-SITES-5.1.md` site 6, 437-445 x 1330-1345): a branchwork cave in the rift fill's gypsum
  from the cliff top to springs at the lake's foot. The Rift line's tunnel meets it "by design" (riftrim §5.1, "Caverns").

### 2.3 The lake and the far shore

- **The great lake**: level **297 m**; **2,336 km²** (584 cells); 62 km east-west (px 422-453) by 56 km north-south (1331-1358);
  the model's deepest floor -259 m (556 m deep; the pages draw 573 m).
- **Nulab** (city, 10,000, 443,1359, 343 m) is on the south shore, **59 km south-south-east** (29.6 px). The brief's "15 km" is a
  slip: the scope's route table and the Line plan both give 59 km (51 km of it over water).
- **Blakhed** (441,1400) is 140 km south, past the basin, at the head of the Chimes gorge stair.
- Other distances (straight): the Line's south portal 41 km north; Loj Twenny (445,1266 planned) 129 km north; Dalab (477,1108)
  451 km north by a little east (the Line: 439 km; the road: 528 km); the drovers (393,1338) 89 km west; the Dalab skarn hamlet
  (416,1377) 103 km south-west; the nearest good rock salt (354,1347) 169 km west.

### 2.4 Climate, top and foot

From the model's rasters (mean, warmest month, coldest month; rain; class):

| Level | Px | Height | Class | Rain | Mean | Warm / cold month | Hottest afternoon / coldest night | Air |
|---|---|---|---|---|---|---|---|---|
| The tableland (the Line's run) | 440,1310 | 3,496 m | Dsb | 878 mm | +4 °C | +17 / -9 | +24 / -16 | ~1.03 atm (est., between the pin's 1.32 and the crossing's 0.58 at 8,052 m) |
| The upper escarpment | 437,1327 | 2,663 m | Dfb | 956 mm | +7 | +20 / -6 | +27 / -13 | |
| The Geit Riba's gorge floor | 434,1323 | 2,705 m | Csb | 1,003 mm | +9 | +22 / -3 | +29 / -10 | |
| **Ledge** | **437,1330** | **1,562 m** | **Cfa** | **878 mm** | **+15** | **+26 / +3** | **+33 / -4** | **1.32 atm** (census, riftrim) |
| The shore below | 432,1332 / 441,1332 | 848-1,387 m (cells) | Csa / Cfa | 737-956 mm | +16 to +17 | +28 / +5 to +6 | +35 / -2 | ~1.55 atm at the water (est.; riftrim gives 1.54 at the gorge's 299 m) |
| Nulab | 443,1359 | 343 m | Csa | 1,129 mm | +18 | +26 / +9 | +32 / +3 | |

So: **the top is a cold highland** (frost most of the winter, snow on the tableland), **Ledge itself is warm temperate** (hard
frost rare), and **the foot is Mediterranean**: an 11 °C step from the Line's platform country to the harbour. Dalab's cold mods
matter on the road and the tableland, not in the town.

## 3. Ten thousand people

### 3.1 Who they are (*proposed*)

The owner's figure is 10,000 Dalabites in the arcology and its foot. Loj Fower's Tungangs are **not** in it: they are counted with
the Union's ~20,000 (the scope, section 3c). The basin's shore farms and fishing hamlets beyond the foot are counted in the basin's
50,000 rural (the scope, 3c), not here. Households of about 4.5 (est.).

| Group | People (with households) | What they do |
|---|---|---|
| **The genepriests' precinct** | 900 | the priests and novices; **the gene bank's** keepers, vault crews and gardeners; the healers of a lesser Hall of Reformation (the census's gene-craft 50 at Ledge); the Giant temple guard |
| **The garrison** | 1,200 | about 450 soldiers (est.), cold-modded, and about 40 Giants (four-armed at the temples, two-armed patrols in threes, as at Dalab); the gate, the road's escorts, the posts on the last stretch of road |
| **The Realm's officers** | 400 | a governor's house (*proposed* title), customs and the toll, scribes, the caravan office that books passage with Loj Fower |
| **The road's terminus** | 1,100 | caravan crews, cold-modded porters, drovers and stable hands for the lizards and pack beasts, warehousemen, the inns |
| **The trades** | 2,600 | **bronze** (the census's top producer: 27 t) and copper (24) founders and smiths; salvage crews cutting the empty decks (Ledge's arcology scrap is a census good); builders in rammed earth and stone; potters; lotus-silk weavers and dyers; tea houses |
| **The foot** | 2,300 | fishers (the census's fish 745 in reach), boatmen of the Nulab crossing, the harbour, fish smokers, shore growers of lotus root and wild rice |
| **The terraces and the slope above** | 1,000 | mist tea and orchards on the warm terraces, Dalab's hashish (transplanted to the rim: TRADE-SCOPE), the gene bank's growing beds; herders on the upper escarpment (pasture 178), wood cutters and charcoal burners in the montane forest |
| **Markets and services** | 500 | traders, inns, water and waste, Dalab's own porters on the decks |
| **Total** | **10,000** | about 2,200 households (est.); about 4,000 working (est.) |

Not counted: caravans and patients in residence, 200-500 at a time (est.); Travellers camped at the road head; embassies, if any
(question 13).

### 3.2 Loj Fower (~1,500, in the Union's 20,000)

*Proposed*, on the tungang kit's loj pattern (`kits/tungang/PLAN.md` 1.2):
- **The lift crews**: three turns a day (the Tungangs' eight-hour turns), every working lift and its machine rooms top and bottom,
  about 250 at work in a day (est.).
- **The Line's last segment**: S2 (bore km 264 to Ledge) and its two trains, the G3 bypass, the surface run's 42 km; about 60
  (est.). The Fixers on this stretch, about 80 (est.).
- **The loj itself**: the loj hall with its count wall, the Book and the minutes; the dark beds and wax; households. Where it lives:
  *proposed*, **in the rock behind the decks**, in the cliff springs' gypsum caverns and the Ancients' service galleries round the
  shafts, its doors onto the lift heads and the foot station. Tungangs do not live on the open decks: they are dazzled by day.
- Loj Fower is station 4's loj in the numbering, one of the oldest; *proposed*, the Book's copy here is old and its Bookmen
  respected, because it is the loj that faces Dalab every day.

### 3.3 How the town divides (*proposed*)

- **Dalab** holds the decks, the head (the platforms, the road head, the gate) and the foot (the harbour).
- **Loj Fower** holds the rock: the lift shafts and cages, the machine rooms (`tg_lift_head`), the Ancient stair inside the
  shafts' cores, the service galleries, the springs' caverns, the Line's siding and platforms below ground.
- The two meet at **the lift halls**, top and foot, where passage is paid and the lamp code changes from Dalab's daylight to the
  Tungangs' green and red. A Dalabite does not go into the rock without a Tungang guide; a Tungang goes onto the decks at night.

### 3.4 The levels and what each holds (*proposed*)

Heights are the model's: the head at the pin's level, the foot at the water. The blueprint session sets the real numbers.
"Wealth climbs with height" (`LORE.md` §5) holds: the priests at the top, the poor by the water, and the Tungangs inside the rock.

| Level | Height (asl) | Over the lake | What | Who |
|---|---|---|---|---|
| **L0 The head** | ~1,560 m | 1,265 m | the Ancients' cut bench and the top deck: **station 4's platforms**, the Line's siding; **the road head** (caravan yards, stables, the porters' hostel, warehouses); the gate and the garrison's fort; customs; **the top lift hall**; Ledge's **mound**, its temple facing the lab (Dalab, ~450 km north by a little east) | Dalab; Loj Fower in the lift hall and below the platforms |
| **L1 The upper decks** | ~1,560 to ~1,350 m | | the widest decks (the target's inverted ziggurat reaches furthest at the top): **the gene bank's precinct** (its vaults in the rock, its gardens and pens on the decks), the genepriests' halls, the healers, the governor's house, the nobles' houses. The God's teal light is here | priests, nobles, the Giant guard |
| **L2 The town decks** | ~1,350 to ~900 m | | homes by caste (traders above, peasants below), markets, scribes, baths, inns, the trades that need no fire | most of the 10,000 |
| **L3 The works and the empty decks** | ~900 to ~500 m | | the bronze and copper works (fire and fumes on the outer galleries), stores, salvage; **the sheared and empty layers** (the ruin's damage sits here, section 5 question 10) | trades; much of it empty |
| **L4 The terraces and the foot** | ~500 m to the water (297 m) | | the warm terraces (tea, orchards, the gene bank's growing beds), **the foot lift hall**, the harbour and its boats to Nulab, the fish market and smokehouses, the foot's houses | fishers, boatmen, growers |
| **Loj Fower** | the whole height, in the rock | | the shafts, the machine rooms top and foot, the stair, the springs' caverns and the loj | the Tungangs |
| **The slope above** | ~1,560 to ~3,480 m | | the upper escarpment: forest, pasture, the road's descent, the Line's descent (section 4.2) | herders, wood cutters, the road's posts |

### 3.5 How big a shell (est.)

The target as built is far bigger than 10,000 need. Its layers widen from ~400 m along the face at the bottom to ~950 m at the top
and reach from 40 m to 340 m out of the rock (`89i-ledge.js`, "THE NUMBERS"), about **3.9 million m² of deck footprint** over its
34 layers (est., from those formulas), before any floor inside a layer is counted. At Span's ratio (`settlements/span/AREAS.md`:
816,000 m² for 9,200 people at the Ancients' peak, ~89 m² a person) that is **40,000 or more people at the Ancients' peak** (est.).
Dalab's 10,000 at ~45 m² a person, crowded into reclaimed space (est.), need about **450,000 m²**: an eighth of the decks. The rest
is the gene bank's, empty, sealed or ruined. That is the "tenuous" hold drawn in floor area.

### 3.6 Food

Need: 10,000 at ~0.6 kg of grain-equivalent a day (est.) is about **6 t a day, 2,200 t a year** (est.).

| Source | Share (est.) | What |
|---|---|---|
| Local: the lake and the foot | ~25% | fish (the census's fish 745 in Ledge's reach), lotus root and wild rice from the shore shallows |
| Local: the decks, the terraces and the slope | ~10% | tea, fruit, vegetables in deck beds, meat and milk from the upper escarpment's pasture; the census's farm figure (26) is tiny: a cliff has no fields |
| **Nulab's basin** | ~55% | grain and pulses by boat across the lake (51 km of water), **then up the lifts** |
| The north (Dalab's grain by the Line) | ~10% | the garrison's ration and the bad-year reserve; it arrives at the head and needs no lift |
| The photosynthesis mod | ? | Dalabites are green-skinned with the photosynthesis mod; whether it cuts what they eat, and by how much, is question 15 |

So **about two thirds of Ledge's food comes up the lifts** (est.). Ledge is also where the Union buys grain for its southern lojes
(`kits/tungang/PLAN.md` 1.2: "Dalab's grain at Ledge"): the basin's grain comes up and part of it goes north into the rock.

Other needs (the scope): **salt** ~290 t a year at 10,000 (the census's 88 t at 3,000, scaled), with none within 169 km; **timber**
(the scope lists it as a need, yet the census gives timber 524 in Ledge's 20 km reach: the montane forest on the slope; the W1 tune
must settle which is true); **iron**; grain in a bad year.

## 4. The lifts and the Line

### 4.1 Loj Fower's lifts

What is canon: the lifts are Ancient, the Tungangs keep and run them by rite, the old timetable and signal codes kept as a second
voice in lamps and bells; Dalab cannot run the cliff's machinery alone; work-to-rule at the lifts is the strike's first weapon.
The rest is *proposed*:

- **What is there.** The Ancients built the lifts as the Line's way down to the lake and on to Nulab: *proposed*, **two car lifts**
  big enough for a rail car (the Line's leg 4 to 5 went down the cliff and on across the lake), **four to six passenger cores** in the
  face (the target's "lift cores running up the face"), and **an emergency stair** inside each core (about 7,000 steps over 1,265 m,
  est.).
- **What runs today.** One car lift (Loj Fower's pride; the other dead, its cage at the bottom of its shaft), two passenger cores,
  the stairs. The rest dead or cut off by the ruin.
- **The bores.** The shafts are bored in the rock behind the decks, vertical (*proposed*), with machine rooms at the head and the
  foot and service galleries at each layer the Ancients served. The cliff springs' caverns open into them: the loj's home and its
  water.
- **Power.** Open (question 8). Options: the Line's guideway power from the hot-door plant (if it still reaches the south end
  across the gaps); the Geit Riba's 714 m³/s falling 1.4 km 6 km west (an Ancient hydro plant, or a Tungang water-balance lift fed from
  the river); counterweights alone, slow. *Proposed*: the Geit Riba, because it makes the lifts Loj Fower's to keep without
  depending on the long run staying whole.
- **Capacity is not the lever** (est.). A 5 t cage every 20 minutes over a 16-hour working day is ~240 t a day for one car lift.
  Ledge's traffic is about 8-10 t a day up (food, salt, the Union's grain) and 2-4 t down (bronze, copper, gene-craft, the north's
  goods for Nulab). One running lift carries twenty times the need. **The lever is the crew**, not the machine.
- **The stair in a strike** (est.). A porter carrying 30 kg climbs 1,265 m in 4-5 hours, once a day. To carry 8 t a day up the stair
  takes ~270 porter-trips a day. Dalab could do that for weeks at a ruinous cost, **if** the stair is open to it. Whether Loj Fower
  holds the stairs too (a strike seals Ledge) or not (a strike only slows it) is question 7. *Proposed*: the stairs are inside the
  shafts' cores, so they are Loj Fower's, and a full strike seals Ledge except for ropes down the face.
- **The strike, in steps** (*proposed* order; the pieces are canon): work-to-rule (the cages run by the full rite, one an hour);
  the lifts stopped (held at the head or the foot); the shafts on the road's last stretch become raid points (the shallow south's
  air shafts, bore km 270-304, within 15 km of Dalab's road from km ~290: `biomes/line/PLAN.md` 2.1); the Line's S2 trains held.
  Dalab's counter is grain: the Union's southern lojes eat Dalab's grain, and much of it comes up these same lifts.

### 4.2 The Line's arrival (a gap in the sources)

The Line plan says the Line runs 42 km on the surface from the south portal "to Ledge's cliff (3,400 m, the lifts down 1.3 km to
the lake)". The model puts the tableland's edge at ~3,480 m and Ledge at 1,562 m: **3.2 km from the edge to the water**, not 1.3.
Something must take the Line, or the people, down the upper 1.9 km.

- From the portal (3,496 m) to Ledge (1,562 m) is 1,934 m of fall in 41 km: **4.7%**, over the network's 4% ruling grade, and nearly
  all of it in the last ~10 km. At 4% the fall needs **~48 km of line** (est.).
- Options (question 4): **(a)** a **helix bore** in the upper escarpment, as the Ancients' spirals under Shelf at the north end
  (canon), coming out on Ledge's head at ~1,560 m: about 48 km of spiral (est.; a helix of 400 m radius, ~19 turns), so the
  42 km surface run ends at the helix head on the edge; **(b)** an **upper station** on the edge at ~3,450 m, with a second lift
  stage of ~1.9 km down to Ledge (and Loj Fower's lever doubled); **(c)** the Line leaves the tableland down the Geit Riba's
  gorge (floor ~2,705-2,750 m for 30 km), which saves ~750 m, and spirals the rest. *Proposed*: **(a)**, which keeps the Line plan's
  "station 4 is the arcology's top level" and the lore's 1.3 km lift.
- **Dalab's road** comes down the same upper escarpment. *Proposed*: switchbacks down the Geit Riba's gorge and its east wall,
  about 24 km of road at 8% (est.), past the fall, onto Ledge's head from the west. The road's last ~15 km are the strike's raid
  ground either way.
- The Line's station 4 is **bore km 304 + 42**, line km ~440 from Dalab; Dalab to Ledge about **two days** by the Line (four
  segments, three portered gaps), about **three weeks** by the road (528 km at ~25 km a day, est.).

### 4.3 The lake crossing to Nulab

- The Ancients' Line ran on from the lifts' foot to Nulab (station 5): 59 km, **57 km of it on viaduct, 51 km over the lake**
  (`biomes/line/PLAN.md` 2.2, the survey's straight leg).
- Today the crossing is **by boat** (the scope's routes: "lifts down 1.3 km (Loj Fower), then boats"). *Proposed*: the viaduct is
  down, its piers a line of stumps and islets across the lake; Dalab's lake boats (sail and oar) make the crossing in about a day
  (51 km at ~5 km an hour, est.), with a halt on a pier island when the wind is wrong. Who owns the boats (Dalab's foot or Nulab's
  harbour) is a W1 detail.
- At Nulab the Line's station 5 is the lake station; from there the gorge stair leads on to Blakhed (82 km) and the Great Caravan.

## 5. What the blueprint session will need decided (questions for the owner)

Each has a *proposed* answer; the blueprint session starts from the owner's.

1. **The shell: start from the Ancients' target?** `kits/ancients/targets/ledge` (the inverted ziggurat of 34 slab layers on an
   850 m cliff) was built before the lore, for a western desert face. *Proposed*: yes, re-aimed to face south over the lake, re-sited
   on the drawn ground of riftrim station 1, and rescaled to the 1,265 m face (50-60 layers at the target's ~20 m pitch, est.).
2. **Footprint.** The target's top decks are ~950 m along the face and reach ~340 m out (the prow 460 m); it is ~3.9 million m² of
   deck (est.). *Proposed*: keep ~1 km along the face at the top, trim the reach (Span was trimmed to ~750,000 m² of floor), and
   measure it into an `AREAS.md` before the owner fixes the size.
3. **Height.** Does the arcology fill the whole lower face (the top deck flush with the head at ~1,560 m, the lowest layer at the
   shore) or only its upper part, with bare cliff and lifts below? *Proposed*: the whole face, its lowest layers the terraces and the
   foot.
4. **The Line's arrival** (section 4.2): (a) a helix bore down the upper escarpment, (b) an upper station and a second lift stage,
   or (c) the Geit Riba's gorge. *Proposed*: (a).
5. **Levels.** The five of section 3.4 (the head, the upper decks, the town decks, the works and empty decks, the terraces and foot),
   with Loj Fower in the rock. Confirm, or name others.
6. **The lift shafts.** How many, of what kind (car lifts, passenger cores, stairs), how many run today. *Proposed*: two car lifts
   (one runs), four to six cores (two run), a stair in every core.
7. **The stairs in a strike.** Loj Fower's (a strike seals Ledge) or open to Dalab (a strike slows it)? *Proposed*: Loj Fower's.
8. **The lifts' power.** The Line's power, the Geit Riba, or counterweights? *Proposed*: the Geit Riba.
9. **The viaduct to Nulab.** Fallen (boats today) or partly standing? *Proposed*: fallen, its piers a ruin across the lake.
10. **The ruin state.** The target's decay 1 (the prow fallen, mid layers sheared at the rock line, a wing pancaked, a rockfall) as
    Ledge today, or less? And each zone's shares by state (Strongbow's list: reclaimed, damaged, sealed, cut off, gone, squatted).
    *Proposed*: decay 1, with the damage in L3 (the sheared layers) and the fallen prow in the lake below; Dalab's 10,000 in about an
    eighth of the decks, reclaimed; the gene bank's vaults sealed to all but the priests.
11. **The gene bank.** An Ancient vault Dalab found, or Dalab's own collection in Ancient rooms? What it holds (seed, tissue, the rim's
    flora and fauna, a pen of the strange beasts as at Dalab's monster pen)? A lesser Hall of Reformation at Ledge? *Proposed*: an
    Ancient cold vault in the rock behind L1 (the "vaults" of the canon theme) holding seed of the rim's engineered flora, and
    Dalab's living collection in the L1 gardens and pens; a lesser Hall for healing and mods.
12. **The split.** Dalab on the decks and Loj Fower in the rock (section 3.3)? Where Loj Fower lives (*proposed*: the cliff
    springs' caverns behind the face)? Gemini's Tungang polity set aside? (The scope's question 3.)
13. **The 10,000.** The breakdown of section 3.1; the shore's fishers and growers in the 10,000 or in the basin's 50,000
    (*proposed*: the foot's in, the hamlets beyond it out). Embassies or a Travellers' halt at the road head?
14. **Interiors in scope.** *Proposed*, as Strongbow: rooms for the head (the station, the top lift hall, the gate, the governor's
    house), the gene bank's precinct, Loj Fower's lift head and loj hall, and the foot (the harbour, the foot lift hall); the town
    decks as frontage and impostors; the empty decks as ruin without rooms.
15. **The photosynthesis mod and food.** Does it cut what Dalabites eat (*proposed*: a little, 5-10%, est.), or is it cosmetic?
16. **The kits** (section 5.1). Confirm the list, and whether Ledge asks for the `SINGLE_COMPLEX` exemption from `core/city` as Span
    and Longsong do.

### 5.1 The kits and modules the blueprint will name (*proposed*)

| For | What | Note |
|---|---|---|
| The Ancient shell | `kits/ancients` (`targets/ledge`, `src/89i-ledge.js`), read in place | rescaled and re-aimed; its ruin pass; the arcology's records keyed by stable ids, as Strongbow's `STRONGBOW.plan` / `.ruin` |
| The far view | `kits/metropolis`' `KSHELL` (polar and box heightfields; a prototype, `core/shell` after the spike), or `core/lod` impostors | an inverted ziggurat is star-shaped about no vertical axis and hangs over its own soffits: `KSHELL`'s weak spots (the plan's section 8). *Proposed*: `KLOD` proxies and an impostor; `KSHELL` only if the spike proves it on overhangs |
| What Dalab builds | the Dalab set (`settlements/dalab`, `VERN.place`, `culture:'dalab'`): `dalab_mound`, `dalab_temple`, `dalab_halls`, `dalab_healers`, `dalab_barracks`, `dalab_gate`, `dalab_post`, `dalab_banners`, `dalab_granaries`, `dalab_warehouse`, `dalab_inn`, `dalab_market_*`, `dalab_smithy`, `dalab_rowhouse`, `dalab_tenement`, `dalab_bathhouse`, `dalab_scribes`, `dalab_watchtower` | as Span takes it; the decks are a floor Dalab builds on |
| Loj Fower | `kits/tungang`'s `tg` set (on `claude/loj-twenny-059a5e`): `tg_lift_head`, `tg_platform`, `tg_loj_hall`, `tg_doors`, `tg_signal_box`, `tg_set`, `tg_carriage_house`, `tg_dark_beds`, `tg_wax_house`, `tg_cistern`, `tg_fan_house` | carved defs through `KCAVERN`; the springs' caverns from `KKARST` (riftrim's site 6) |
| The station and the Line | `kits/ancient-transit` (`KTRANSIT`, the `line` kind), `kits/motor-vehicles` (the `tungang` cars), `biomes/line`'s records for S2 | station 4 is the Line plan's to define; Ledge draws it |
| Interiors | `kits/interiors`, `kits/ancients-interiors`, `core/furnish`, `kits/catalog` (`krator-master-furniture-dalab.js`, `-tungang.js`, `-fellgang.js`) | as section 5 question 14 |
| The ground | riftrim station 1's ground read in place (`core/terrain`: `KSTRATA` `rift`, `KCARVE` mouths and lift slots, `KSTACKS.contour`, the Ancient-cut benches), `core/water` (the lake, the Geit Riba's fall) | riftrim owes the cuts ("Core adoption" there) |
| The layout | a `[G data]` fragment that builds nothing (zones, levels, parts, lifts, ways, states by stable id), rules as plain functions with node negatives | Span's and Strongbow's method |
| The sheets | the shared generator `settlements/voth/palace/blueprint.py`, through a `ledge_blueprint.py`, and `AREAS.md` written by it | one sheet per level, a section through the cliff with every lift and stair |
| Placement and checks | `core/rand` (`KRAND`), `core/tags`, `core/space`, `core/ruins` (`KRUINS.watch` on every wreck: the fallen prow, the pancaked wing), `core/walk` | the rules in CLAUDE.md |
| The shore | `core/hamlet` (fishing villages beyond the foot), `kits/crops` (what the terraces grow) | later |

## 6. Ledge in a future West Rift sim

The scope's build order (W0-W6) and the valley spec's shapes (`50-region-valley.js`; the scope, section 0). *Proposed*, numbers
(est.):

```js
// settlements (WR_TUNE, [G data]); the town at scale 50, the loj at 10, as the scope proposes
{ id: 'ledge', name: 'Ledge', faction: 'dalab', people: 10000, scale: 50,
  works: [
    { kind: 'fish',      site: 'foot', out: 'fish' },        // the census's 745, the lake's north shore
    { kind: 'shore',     site: 'foot', out: 'lotus root, wild rice' },
    { kind: 'terraces',  site: 'foot', out: 'mist tea, fruit, hashish' },
    { kind: 'pasture',   site: 'slope', out: 'meat, hides' },
    { kind: 'bronze',    site: 'decks', out: 'bronze' },     // copper 24 + tin by the Line from the north door
    { kind: 'genecraft', site: 'decks', out: 'gene-craft, healing' },  // the census's 50
    { kind: 'salvage',   site: 'decks', out: 'arcology scrap' } ] }
{ id: 'loj-fower', name: 'Loj Fower', faction: 'tungang', people: 1500, scale: 10,
  works: [ { kind: 'lifts' }, { kind: 'dark-beds', out: 'mash' }, { kind: 'line-upkeep' } ] }

// roads
{ from: 'ledge', to: 'ledge.foot', carriers: "Loj Fower's cages", cut: 'passage', closed: 'strike' }  // the lifts
{ from: 'ledge.foot', to: 'nulab', carriers: 'boats' }                                           // 51 km of water
{ stops: ['dalab', 'shelf', 'twenny', 'ledge'], legs: "the Line's four segments", halts: 'the gaps', provision: 'Travellers' }
{ stops: ['dalab', 'shelf', 'ledge'], carriers: 'supply trains' }                                // the road, ~3 weeks
```

| Step | What it does with Ledge |
|---|---|
| **W0** | the owner's answers to this plan's questions 12, 13 and 15 and the scope's Q2, Q3, Q5 and Q10; this plan is part of it |
| **W1** | Ledge and Loj Fower as records; the diet (section 3.6); **the salt gap shows** (~290 t a year, none within 169 km); the timber question settled against the census's 524 |
| **W2** | the Line's S2 segment ends at Ledge's head; **the lifts as a road with `closed`**; the bronze works fed by tin from the north door, which reaches the south only while the long run is whole |
| **W3** | no change at Ledge: the Great Caravan stops at Nulab and Blakhed, not here; Ledge's goods reach it across the lake |
| **W4** | the bargain as transfers: Dalab pays Loj Fower for passage at the lifts (in grain, medicine, cloth); Loj Fower's book within the Union's |
| **W5** | **the strike**: work-to-rule, the lifts stopped, the road's raid points, the S2 trains held. The scope's test, "a strike starves Ledge before Dalab breaks", is Ledge's: two thirds of its food comes up the lifts |
| **W6** | Ledge as a refugee destination ("the west rim and Nulab", PLAN-POLITICS); the Fellgang drovers' market (89 km west) |

## 7. Steps up to the blueprint session

| Step | What | Done when |
|---|---|---|
| **L0** | This plan. The owner answers section 5 | the answers are written into section 5 with the owner's date |
| **L1** | **The face, measured finer.** Riftrim station 1's drawn ground at the pin (its benches within 650 m of the site), the Geit Riba's fall, the lake's edge under the pin; the Line's descent under the answer to question 4 (the helix's length at 4%, where it comes out); the road's descent | a short survey note in this folder, with the numbers the blueprint uses for the head, the foot and the face's line |
| **L2** | **The target, measured.** A layout dump of `kits/ancients/targets/ledge` (its layers, reaches and floor area), as Span's `AREAS.md`; what rescaling to the face does to it; the trim to the owner's size | `AREAS.md` (draft) and a size the owner accepts |
| **L3** | **The neighbours agree.** Station 4's platform level and the helix with `biomes/line` (on `claude/loj-twenny-059a5e`) and `openworld/ANCIENT-NETWORK.md` (the `rift` route's terminus at the lifts); station 1's window with `biomes/riftrim`; Loj Fower's place in the Union with `kits/tungang` | each plan's line on Ledge says the same |
| **L4** | **Core adoption**, written in full before the first fragment (CLAUDE.md), from section 5.1, started from Span (a Dalab-held Ancient arcology) and Strongbow (a cliff arcology with lifts) | `python3 tools/check_core_use.py` would pass on the list |
| **L5** | **The blueprint session**: the layout as `[G data]` records, the rules with node negatives, the sheets per level, the section through the cliff with every lift and stair, `AREAS.md`, the population by part | the sheets and a passing node test, for the owner's eye |

Then, outside this brief: the build (the shell, Dalab's buildings, Loj Fower, the interiors in scope), its verify, the West Rift
tune's Ledge records, and the gallery when it reaches `main`.

## 8. Notes on the sources

- `core/region/WEST-RIFT-SCOPE.md`'s Ledge row says Loj Fower's Tungangs are "counted with the Union's 2,000"; its section 3c and
  3d give **20,000**. The row is a slip (uncommitted in this worktree; not edited here).
- `biomes/line/PLAN.md` (branch) gives "Ledge's cliff (3,400 m, the lifts down 1.3 km to the lake)": the model's numbers do not
  fit both (section 4.2). The fix belongs to the Line plan once question 4 is answered.
- `biomes/line/PLAN.md` 2.2's leg "4 Ledge's lifts' foot to 5 Nulab" gives its ends as 1,563 m to 344 m: that is the pin's cell, not
  the lifts' foot at the water (297 m).
- `kits/ancients/targets/ledge` predates the lore (2026-09); its 850 m western desert cliff is the reference painting's, not the
  model's.

## Sources read

- `LORE.md` §4 (the Rift line, l.168), §5 (themes), §6.1 (Dalab, Ledge, the Tungangs, l.206-284)
- `core/region/WEST-RIFT-SCOPE.md` (all)
- `biomes/riftrim/PLAN.md` (5.1 survey, §5 Ledge, §6 the Tungangs, §9 stations, the "Ledge's own build" rows)
- From `claude/loj-twenny-059a5e` by `git show`: `biomes/line/PLAN.md` (the survey, §2.1 the shafts and numbering, §2.2 beyond
  Ledge), `settlements/loj-twenny/PLAN.md` (grep)
- `kits/tungang/PLAN.md` 1.2 and the `tg` defs table; `kits/tungang/README.md`
- `settlements/dalab/README.md`, `DESIGN.md`
- `settlements/span/PLAN.md` (the model for a Dalab-held Ancient arcology); `settlements/voth/palace/BLUEPRINT.md`; from
  `claude/keen-swanson-68a311`: `settlements/strongbow/PLAN.md` (a cliff arcology with lifts, ~7,000 people); from
  `claude/clever-wilson-6dc681`: `biomes/labyrinth/PLAN.md` (grep, the Hall of Heroes); `kits/metropolis/PLAN.md` (§2-3, 6, 8, 10)
- `kits/ancients/targets/ledge/NOTES.md`, `89z-rows.js`; `kits/ancients/src/89i-ledge.js` (header and "THE NUMBERS" only)
- `openworld/RESOURCES-SETTLEMENTS.md` (Ledge's rows), `openworld/TRADE-SCOPE.md`, `openworld/ANCIENT-NETWORK.md`,
  `openworld/TRADE-GEMINI.md` (grep)
- The scale model 5.1 (`tools/scale-model/model/data`): `h.png`, `wl.png`, `p.png`, `c.png`, the temperature rasters, `climate.json`,
  `rivers.json`, decoded by scratch scripts on `smodel.page`'s formulas

## 9. The plan as built (the Ledge session, 2026-11-16)

Everything here is *proposed* unless section 0 fixes it; the layout (`src/30-ledge-layout.js`) is the one source of the numbers,
`AREAS.md` and the sheets (`floors/`) are drawn from it, and `test-ledge.js` checks it.

### 9.1 The Ancients' target: replaced, not reused

`kits/ancients/targets/ledge` (`src/89i-ledge.js`) stays as it is, the kit's sheet of a cantilevered cliff city. Ledge's page
does **not** call `buildLedge`:
- it decides everything itself: a 53 KB function of fixed numbers drawing from the kit's global stream (`reseed(9740)`), where
  CLAUDE.md wants records drawn by a builder that decides nothing, and placement on `KRAND` by id;
- it carries its own ground: an 850 m desert massif facing west with a plain and a town of white boxes, where Ledge is a 1,265 m face
  over the lake facing south on its own ground with Dalab's and the Fellgangs' towns from their own kits;
- its decks have no ids, states or holders, so nothing (the tags, the walk, the census, the strike, the ruin by part) could key on them.

**What is kept** is the form, which fits the lore: pale slab layers cantilevered off the rock as an **inverted ziggurat** (each
layer reaching further than the one below, the top flush with the cliff top), rooms set back under the soffit above, a gallery at
each edge, ribbed soffits, lift cores up the face, a great prow; and its ruin (the prow fallen and the gash it tore, mid layers
sheared at the rock line, a wing pancaked). Ledge redraws that form from records (`src/45`-`48`), at Ledge's size.

### 9.2 The frame and the ground

- **Frame**: x east along the face, z south out of it (the rock at z < 0), y metres above sea level; the origin on the face line
  under the pin (5.1 px 437,1330). riftrim station 1's frame is the same with its z = Ledge's z - 603 (its `cliffZ(0)`).
- **Ledge draws its own ground** (`LEDGE.groundAt`, `[G data]`): riftrim station 1 drew a stand-in cliff with benches every 110 m and
  owes Ledge the cuts; Ledge's face is now the record riftrim reads (section 9.10, the hand-over).
  - **The head** (the Ancients' cut bench): flat at **1,562 m** from the face 700 m north; then the upper escarpment rises at ~26 %
    toward the tableland (3,481 m at its edge, ~10 km north: off the page, the far field).
  - **The face**: dressed sheer by the Ancients for 1,500 m along it (|x| < 750); beyond, the natural rift-fill cliff at ~73 degrees.
  - **The foot**: the Ancients' apron, flat at **312 m**, 180 m out to a quay wall; the lake (**297 m**) beyond, its bed falling to
    ~150 m deep within 1 km.

### 9.3 The shell (`LEDGE.stack`)

| | | |
|---|---|---|
| Layers | **42**, floors at y = 332 + 30 k (k 0-41): the lowest 20 m over the apron, the top (k 41) flush with the head at 1,562 m | a layer: a 5 m slab, four 4.5 m storeys of rooms, a 7 m plenum under the soffit above (the target's form at a 30 m pitch) |
| Along the face | 320 m at k 0 to 700 m at k 41 | the brief's "keep ~1 km at the top" trimmed: 700 m keeps the area near the Ancients' middling arcologies |
| Out of the rock | 24 m at k 0 to 220 m at k 41 (as t^1.5); **the prow** (the centre wing from k 26) to 340 m | the inverted ziggurat |
| Wings | five per layer: W2, W1, C, E1, E2 (a fifth of the width each; the outer pair at 72 % of the reach, the inner at 90 %) | the unit of state, holder and census: a **deck** is one wing of one layer, id `d.<k>.<wing>` |
| Floor | rooms over 70 % of a deck's footprint, four storeys: **6.27 million m2** at the Ancients' peak, **~90,000 people** then (Span's rule) | `AREAS.md` (from `LEDGE.area`); the owner may trim it (question A) |

### 9.4 The levels (section 0's four, as zones of layers)

| Zone | Layers | Height | What | Held by |
|---|---|---|---|---|
| **Z0 The head** | on the bench | 1,562 m | the road head (caravan yards, stables, warehouses, inns, the market), the gate, the garrison's fort, the top lift hall and its winding house, customs, Dalab's mound facing the lab (NNE), the Dalab town, **the Fellgang quarter** (the Travellers' halting place, porters, drovers) | Dalab; the Fellgangs; Loj Fower in the lift hall |
| **Z1 The crown** | k 37-41 | 1,442-1,587 m | the sound decks either side of the gash: **the gene bank's precinct** (W1, its cold vault in the rock behind), **the governor's house and a lesser Hall of Reformation** (E1), the priests' face core to the head | Dalab |
| **Z2 The upper dead decks** | k 26-36 | 1,112-1,437 m | dead: the prow gone from the centre, **the pancaked wing** (E2, k 29-35 down onto k 28), the rest empty and dark | no one |
| **Z3 The middle decks** | k 16-25 | 812-1,107 m | **the Line's station** (k 20: the bore's mouth in the face behind the C and E1 decks), **Loj Fower's** decks round it (their loj hall, dark beds, wax house, signal box: the `tg` set's keys, stand-ins until it merges), the great lifts' middle landings; the outer wings sealed by the loj | **Loj Fower** |
| **Z4 The lower dead decks** | k 6-15 | 512-807 m | **the sheared layers** (W1 and W2, k 8-14, cut at the rock line: their outer decks lie on the apron below), the centre squatted by Fellgang salvagers, the rest dead or sealed | no one; salvagers |
| **Z5 The foot** | k 0-5 and the apron | 312-482 m | the foot decks (Dalab west, Fellgangs east), **the foot lift hall**, the harbour and its mole, the fish market and smokehouses, the boatmen's inn, granaries for the basin's grain, the terraces on the apron's ends (tea, orchards, the gene bank's beds), the prow's wreck heaped at the water | Dalab; the Fellgangs |

### 9.5 The lifts and the stairs

- **Two great lifts** (G1 east at x +120, G2 west at x -120), vertical shafts 20 x 14 m in the rock 30 m behind the face, from the
  foot lift hall (312 m) to the top lift hall (1,562 m): **1,250 m**. The Ancients' rail-car lifts (the Line's leg 4 went down the cliff
  and over the lake to Nulab), so **a car is 16 x 10 x 7 m**: a wagon and its team, or **six pack beasts and their loads**, ~40 t.
  **Both run** (section 0: the elevators still work): Loj Fower's, counterweighted, driven from the head's winding house.
  Landings: the foot, k 2 (the foot decks), k 20 (the station), k 39 (the crown), the head. The dead decks' landings are sealed.
- **Four face cores** (P1-P4, 12 m towers on the face through the decks, the target's "lift cores up the face"): P3 runs between
  the crown and the head (the priests' lift); P1 is cut at the shear, P2 went with the prow, P4 is dead.
- **The stairs** are in the great shafts' cores, Loj Fower's (question 7 as proposed): a strike seals Ledge but for ropes down the face.
- **Power**: the Geit Riba's fall 6 km west (an Ancient penstock and plant, a record, off the page) (question 8 as proposed).

### 9.6 The Line's arrival (section 0: it slopes down to a station in the face)

The bore comes from the tableland's south portal (3,496 m, 41 km north) and **descends inside the upper escarpment** to the
station at **932 m** (k 20): 2,564 m of fall, at the network's 4 % ruling grade **64 km of line**: the 42 km surface run's last part and a
**helix** of 400 m radius inside the escarpment behind Ledge (~25 turns, 63 km; with the approach 64 km: `LEDGE_LAYOUT.line`, checked at 4 % or less). The station's platforms lie in the
rock behind the C and E1 decks; its mouth opens onto deck 20 as the concourse. So the Line reaches Ledge **in the middle**, among Loj
Fower's decks: the Tungangs hold the station, and both the head and the foot reach it only by their lifts.

### 9.7 The 10,000 (section 0 left the split open: question 13)

*Proposed*: **the 10,000 are everyone living at Ledge, Loj Fower included** (the Union's 20,000 counts the loj too: one person in both
counts). By zone (the layout gives every part its people; `test-ledge.js` holds the sums):

| Zone | People | Dalab | Fellgang | Loj Fower |
|---|---|---|---|---|
| Z0 The head | 3,700 | 2,700 (the garrison's 1,200 with families, the terminus, officers, the town) | 1,000 (Travellers, porters, drovers) | in the lift hall, counted in Z3 |
| Z1 The crown | 900 | 900 (genepriests and novices, the gene bank, the healers, the governor's house, the Giant guard) | | |
| Z2 The upper dead decks | 0 | | | |
| Z3 The middle decks | 1,600 | 100 (customs at the station) | | 1,500 |
| Z4 The lower dead decks | 300 | | 300 (salvagers) | |
| Z5 The foot | 3,500 | 2,000 (boatmen, fishers, the granaries, growers) | 1,500 (fishers, smokers, boat-builders) | |
| **Total** | **10,000** | **5,700** | **2,800** | **1,500** |

### 9.8 Half ruined (section 0)

States of a deck: **reclaimed** (lived in by Dalab or the Fellgangs), **kept** (Loj Fower's), **squatted**, **dead** (sound, empty, dark),
**sealed** (shut), and the broken ones: **damaged**, **sheared** (cut at the rock line: a stub), **pancaked**, **gone**. The layout's rule:
**the broken decks are 40-60 % of the shell's floor** (the layout: **43.4 %**; lived in today 24 %) and nobody lives on one. The ruin: the prow (C, k 26-41) fell and lies heaped on the
apron's front and in the shallows, the gash it tore sheared C k 22-25 and damaged C k 4-5; W1 and W2 k 8-14 sheared (their decks heaped on
the apron's west); E2 k 29-35 pancaked onto k 28; the prow's fall tore W2 k 26-36, W1 k 33-36 and E1 k 34-36. Every wreck is watched (`KRUINS.watch`); every debris heap is a `KRUBBLE` heap.

### 9.9 Section 5's questions: what the build assumed

| Q | Assumed (*proposed* unless section 0 says) |
|---|---|
| 1 Start from the target? | **No** (9.1): its form, redrawn from records |
| 2 Footprint | 320-700 m along the face, 24-220 m out, the prow 340 m (9.3); `AREAS.md` says the floor |
| 3 Height | the whole lower face: k 0 20 m over the apron, the top flush with the head |
| 4 The Line | section 0: slopes down; to the station in the middle (9.6), a helix inside the escarpment |
| 5 Levels | section 0's four: head, middle, ruined (two bands), foot; plus the crown (9.4) |
| 6 Lift shafts | two great car lifts (both run), four face cores (one runs), stairs in the great shafts (9.5) |
| 7 Stairs in a strike | Loj Fower's: a strike seals Ledge |
| 8 Power | the Geit Riba |
| 9 The viaduct | fallen: its piers a line of stumps SSE toward Nulab (drawn for 1.5 km) |
| 10 Ruin | 9.8; the gene bank's vault sealed to all but the priests |
| 11 The gene bank | an Ancient cold vault in the rock behind the crown's W1 decks, Dalab's living collection on those decks and the foot's terraces; a lesser Hall of Reformation on E1 |
| 12 The split | section 0: Dalab and the Fellgangs on the head, crown and foot, Loj Fower the middle and the lifts; Loj Fower lives on its decks and in the rock behind them |
| 13 The 10,000 | 9.7: Loj Fower inside the 10,000 |
| 14 Interiors | none in this pass (the decks are frontage); the lift halls, the station, the loj hall, the vault and the governor's house are the first rooms, next |
| 15 Photosynthesis | not used (a W1 tune question) |
| 16 Kits | the Dalab set, the Fellgang set (`TG.fg`), `kits/ancients`' materials; the `tg` set when Loj Twenny's branch merges. No `core/city`: Ledge does not take `core/simulation`, so needs no `SINGLE_COMPLEX` entry yet |

### 9.10 The hand-over to riftrim station 1

Riftrim's station 1 should read `LEDGE.groundAt` (or its face record: the dressed face |x| < 750 at z = 0, the head 1,562, the apron 312
to z 180, the lake 297) in place of its benched stand-in within 900 m of Ledge, and keep its flora off the dressed face and the decks.
Not done here (riftrim's files are another session's).

### 9.11 Questions for the owner (2026-11-16; the build took the first answer of each)

- **A. The size.** The shell as built is 42 layers, 320-700 m along the face, 24-220 m out (the prow 340 m): **6.27 million m2**, ~90,000
  people at the Ancients' peak. Keep it, or trim (a 500 m top would take it to about 4 million)?
- **B. Loj Fower in the 10,000?** Built: yes (1,500 of the 10,000 live on the middle decks; Dalab 5,700, the Fellgangs 2,800). Or are
  the 10,000 Dalab's and the Fellgangs', with the loj on top?
- **C. The station's height.** Built: the middle decks at 932 m (layer 20), reached by a helix of ~25 turns (64 km of bore at 4 %). Or
  should the Line come down the Geit Riba's gorge first (saving ~750 m of fall), or arrive higher in the face?
- **D. The lifts.** Built: both great lifts run (cars 10 x 16 x 7 m, six beasts, ~40 t), four face cores of which one runs, the stairs in
  the great shafts Loj Fower's. Right?

## Core adoption (written before the first fragment, 2026-11-16)

Started from **`settlements/span`** (a Dalab-held Ancient arcology: its layout-as-data, rules, test, blueprint and page are the
pattern, file for file) and **Strongbow** (`claude/keen-swanson-68a311`: a cliff arcology with lifts, its zones and states); the page
takes `tools/new_build/`'s defaults (recorded, samplers, drawn-ground, names: listed in `tools/checks_optin.json`).

| Module | Takes | For |
|---|---|---|
| `core/rand` | `KRAND` | every choice: a deck's blocks and their reach, which windows are dark, the wreck's pieces, the viaduct's stumps, by `KRAND.hash` of the record's seed (`LEDGE.seed`: `KRAND.child(world, id)`) |
| `core/tags` | `50`, `52`, `53` | every deck, lift, part and wreck registered before it is drawn (culture `ancient`, `dalab`, `fellgang`, `tungang`) |
| `core/space` | `KSPACE` | the head's and the foot's parts disjoint (`LEDGE.checks`) |
| `core/terrain` | `35-core-strata` (`KSTRATA` `rift`: the cliff's beds), `37c-core-rubble` (`KRUBBLE`: the prow's and the shear's heaps) | the face and the debris |
| `core/ruins` | `KRUINS.watch` | the shell, its wreckage and the viaduct's stumps |
| `core/water` | `WATER.still` + `stillMaterial` | the great lake |
| `core/atmos` | `skyBiome` at px 437,1330, `bindHost` | the standard sky; the clock and the waves the water reads |
| `core/host` | `FULL` + `KEYS` | camera, loop, panel, probe, inspector, marks, minimap, editor, cut-away |
| `core/drawn` | `KDRAWN.grid` of the ground | the eye check on the drawn ground |
| `core/materials` | `record` (`KMAT`), `materials.json`, `tools/textures/pack.py` | the cliff's rock and the head's turf from the library; the Ancients' panel through `kits/ancients`' pack |
| `settlements/dalab` | the Dalab set, read in place (`VERN.place`) | every building Dalab put up on the head and the foot |
| `kits/tungang` | `tungang_bundle.py` (`TG.fg.draw`) | the Fellgangs' quarters on the head and the foot |

Not taken (one line each): `core/city` (Ledge is one Ancient complex; the head's and foot's towns are a few dozen buildings on the
Ancients' flat benches; no `core/simulation` yet, so no exemption is needed); `core/simulation`, `core/sched`, `core/charactermodels`
(life is the W1 tune's and a later pass); `core/walk` (the layout's links are the coarse graph; walk floors come with the interiors);
`core/biome` and the riftrim kit's flora (owed: the W rim's dress on Ledge's ground, a later pass); `core/lod` (one site, the shell is
merged by material; the budget is asserted); `KCARVE`, `KCAVERN`, `KKARST` (the shafts, the station and the springs' caves are inside
the rock and drawn as their mouths only: owed with the interiors); `core/furnish`, `kits/interiors` (no rooms this pass); the
`tg` set (on `claude/loj-twenny-059a5e`, not merged: Loj Fower's buildings are tagged stand-ins).
