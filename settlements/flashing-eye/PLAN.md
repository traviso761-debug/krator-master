# The Order of the Flashing Eye: its head house on the east volcano (site plan, 2026-11-16)

The crimson great monastery of Qiblai's council (LORE.md 6.13; `settlements/qiblai/PLAN.md`) has had no head house
(`core/simulation/PROPOSAL-XANADU.md`: "no head house is given for it yet"). It holds Sekriḍ, the shrine village on
Kirstabal's lake (986,1588), and its Prismarch takes a tenth of what the council shares out
(`settlements/kirstabal/PLAN.md`). The first draft of this plan settled the site. This version adds the house: the Order,
its people and programme, the site in numbers, its place in the tune, the kits, the steps and the owner's questions.

There is no kit code, layout or page yet. Everything not quoted from the owner, the lore or the tune is *proposed*.

Sources:
- `LORE.md` 6.13 (the Decree, the Broken Wheel, the Prismarchy, the eight colours);
- `kits/qiblai/PLAN.md` 2a (the faith's tenets), `kits/qiblai/src/89q0-qb-helpers.js` (`QSPOKE[0]`, the crimson dress),
  `kits/qiblai/src/89q3-qb-sacred.js` (`qb_monastery`);
- `settlements/beacon/PLAN.md` (the gold Order: the nearest model), `settlements/strongwall/tempest/BLUEPRINT.md` (the
  violet), `settlements/azure-dream/PLAN.md` (the blue), `settlements/viridian/PLAN.md` (the green);
- `settlements/kirstabal/PLAN.md` (Sekriḍ; the council's fifth and each house's tenth);
- `core/region/data/xan-tune.js` (`T.lake`, `T.beacon`, `T.orderHouse`, `T.oil`, `T.dues`) and
  `core/region/tests/test-xan-economy.js` (check 31);
- the scale model 5.1 (`tools/scale-model/model/data/h.png`, `rivers.json`; 2 km a pixel).

## 0. The owner's decisions (2026-11-16)

- **The name is the Order of the Flashing Eye**, as the lore has it ("Flashing eye is correct").
- **The site is the east volcano of Erewhon's lake**, `volc_erewhon_east`, summit 881,1526 on scale model 5.1 ("Agree with
  crimson recc"). A cliffside house on the cone.
- **It faces the Rift**, south, not the lake ("Will face the rift").
- **The cone gets a vent** ("Give it a cone"): the dormant volcano becomes a smoking crater on the scale model, a vent
  record queued with the scale-model session (`edit_517` drew it "not vents"). The house's fire is the mountain's own.
- **The cliff band is authored on the page.** The model has no true cliff here (section 3.4).
- **The first answers** (the owner, 2026-11-16, "Agreed", to questions 1, 2, 3 and 5 as put to him): the doctrine of section 1
  stands (the Eye that does not close); the house is about **320**; the vent **flashes** (Strombolian bursts, red at night,
  the recommended answer to question 3); the Eye **keeps the council's mirror line by day** and is **the relay between the
  Beacon and the capital**. Questions 4 and 6-13 are still open.

## 1. The Order of the Flashing Eye

### 1.1 What is written

- The council of Qiblai is the **Prismarchy**: the eight abbots of its great monasteries, each a **Prismarch**, each
  monastery with its own colour. The great temple flies a banner of each colour turned toward its monastery: the
  **Rainbow Temple** (`LORE.md` 6.13).
- **The crimson monastery is the Order of the Flashing Eye.** Sekriḍ, a village on Kirstabal's lake, is its own
  (`LORE.md` 6.13; `settlements/kirstabal/PLAN.md` calls it the Red Monastery's village, 800 people).
- Its dress in the Qiblai kit is **`QSPOKE[0]`**: crimson walls (`0xa8302a`), saffron trim, an oxblood band
  (`0x5a1c1c`). Its spoke is spoke 0, due north of the Temple Mountain. "The crimson monastery is named; its dress is
  unchanged" (`settlements/qiblai/PLAN.md`).
- **Each great house takes a tenth** of the council's income: the council keeps a fifth, and each of the eight takes an
  eighth of the rest (`settlements/kirstabal/PLAN.md`, section 4; not yet in the tune, where the History Monks' house
  still takes 1/8).
- Nothing else is written: no doctrine, no head house, no size.

### 1.2 The doctrine (*proposed*)

**The idea.** The Order takes its name from the Song's last turning:

> "Beware! Beware! / His flashing eyes, his floating hair!" (*Kubla Khan*, the faith's eighth turning)

The faith reads those lines as holy dread before the one who has tasted paradise. That is why the kora is walked three
times with eyes lowered (`kits/qiblai/PLAN.md` 2a). The Order reads them as a **promise**:
- The one who sings the Song whole, and so builds "that dome in air" and mends the Wheel, will come **with flashing
  eyes**. When he comes, all will cry "Beware", close their eyes and weave the circle round him.
- **Someone must keep their eyes open to know him.** The Order is that someone: **the Eye that does not close.** Its
  monks bear the dread so that the faithful need not.
- **The mountain's fire is his sign.** The Song's chasm breathes "as if this earth in fast thick pants were breathing",
  and the faith already holds that earth's breath is the Song breathing. A live vent that flashes is the Song's breath
  and the coming eye at once.
- **The Station's glints are the Wheel's eye.** When the broken Wheel catches the sun, it flashes. The Order writes down
  every flash, of the mountain and of the sky.

**Its practice:**
- **The Vigil.** The crater is never unwatched. The **Rim Watch** keeps the Eye Post on the crater's south rim day and
  night, four monks a watch, six watches.
- **The Open Kora.** The professed walk the crater's rim three times **with eyes open**: the faith's rite turned round.
  Pilgrims walk the lower kora round the house with eyes lowered, as everywhere.
- **The Books.** *The Book of Breaths* holds every flash and plume of the mountain since the founding. *The Book of
  Flashes* holds every signal sent and read.
- **The mirrors.** The Order flashes as the Eye flashes: holy writing in light, by the sun (section 2.4).
- **The veil of dread.** On the rim the professed wear a crimson cloth over mouth and nose against the fumes. Novices
  take their vows on the rim, a night's vigil on a Station's pass.
- **The Ember.** The house's one fire is lit from the vent, once a year, and carried down to the Hall of the Ember.
  Every hearth and lamp in the house is lit from it (Baku's Ateshgah is the model: a fire temple on the earth's own fire).

**The Order and the others:**
- **The council's eye.** The Eye keeps the Prismarchy's **day line** of mirrors. Its readers bring the council its news
  of the Vale, the Rift and the capital. The capital is in its sight every morning (section 3.2): the Sultan's court
  knows it is watched, and Qiblai is the Sultan's quiet opposition (`kits/qiblai/PLAN.md` 2a).
- **The Beacon** (the gold Order): **the day and the night.** The Eye flashes by day with the sun. The Beacon flashes by
  night with the Sultan's oil. They are partners on the line and rivals in doctrine: the Eye holds that a light fed by
  the Sultan's licence is the Sultan's light.
- **The Azure Dream** (the blue) sleeps for the Song, and its wheels stop at night. The Eye never sleeps on watch. This is
  argued on the council.
- **Viridian Thought** (the green) drinks tea against sleep for disputation. The Eye drinks it for the watch, and buys it
  next door at Ṭī-Ṭeras.
- **The Violet Storm** keeps the Vale with sword and bow. The Eye bears no arms, since the Decree forbids war-making by
  its clergy. It warns and the Sultan's men and the violet riders answer, as the Beacon does.

**Its sign:** the eight-spoked wheel with an open eye at the hub, rayed. Its colour is the vent's glow.

### 1.3 Its offices (*proposed*)

| Office | What |
|---|---|
| **The crimson Prismarch** | the Order's abbot. He lives on the mountain and **sits on the council by mirror**: his words go to Qiblai by the day line, read aloud in the crimson spoke by his reader. He goes down to Qiblai once a year, for the grant of fealty |
| **The Prior** | keeps the house |
| **The Master of the Eye** | keeps the crater, the Rim Watch and the Book of Breaths |
| **The Master of Mirrors** | keeps the Eye Post, the Mirror Hall, the signal readers, the Mirror School and the Book of Flashes |
| **The Keeper of the Ember** | keeps the Hall of the Ember and lights the house's fires |
| **The Hosteller** | keeps the Foot House and the pilgrims |
| **The Reader at Qiblai** | the head of the daughter house, the crimson spoke: reads the Prismarch's words in the Hall of the Decree |

## 2. The house's programme (*proposed*)

### 2.1 Its people: about 320

| Who | People | Where |
|---|---|---|
| **The crimson Prismarch** and his household: secretary, chamberlain, attendant monks, cooks | 10 | the Labrang |
| **The chapter**: the Prior, the chant-master, the Masters, the Rim Watch (24 on rota: a week on the rim, three weeks down), the signal readers, the librarians, the old monks | 130 | the Red Monastery's cells, two to a cell, and the chapter range |
| **The Mirror School**: masters and keepers in training for the line's posts | 30 | the school's range |
| **Novices** | 50 | the novices' court |
| **Lay brothers**: cooks, granary, the infirmary, the herd and dairy, the hives, the woodlot | 60 | over the kitchen and granary, the infirmary, the byres on the cap |
| **The bench** | **280** | |
| **The Foot House**: the Hosteller, the muleteers of the Stair, the storemen, the terraces' hands | 40 | the Foot House |
| **The Order on the mountain** | **320** | |

**Why 320:**
- **A signal house, like the Beacon.** The Beacon is 300 with its Lamp School. The Eye has the same work (a watch on
  rota, readers, a school for the line's keepers) plus the crater's vigil.
- **Not a martial house.** The Tempest is 600 because of its eight companies and their horses. The Eye has neither.
- **The site carries few.** A spur bench at 1,669 m, roof water only, about 12 ha of terraces (section 4.2). Every
  sack of grain beyond that climbs 1,200 m by mule.
- **Its estate is elsewhere.** Sekriḍ (800) is the Order's village, counted in the tune on its own. Its daughter house
  in Qiblai (the crimson spoke, about 300 of Qiblai's ~2,400 monks) is counted in Qiblai.

**Pilgrims come on top**, not residents: about 20-40 a day in the dry months, and some 400-500 on the nights the Station
passes, when the professed walk the Open Kora. The Foot House sleeps 120 and the bench's guest house 60. The rest camp at
the Foot House.

### 2.2 The cone, from the rim down (the zones)

The frame (*proposed*, as the Beacon's): **u** runs south along the spur, **v** east, **y** up from the bench. The origin
is the middle of the **Lip**, the top edge of the cliff band. The bench lies at u -150..0. The cliff falls from u 0.

| Zone | Where | What |
|---|---|---|
| **The Rim** | the crater's south rim, 881,1526 (1,838 m before the vent is cut), 2 km north of the bench, 170 m up | **the Eye Post**: a stone tower about 8 x 8 m and 12 m high, the watch room below and the mirror platform on top; the Watch's hut (four bunks); a shuttered fire basket; **the Threshold Chorten** where the Open Kora starts. No building in the crater. The rim is in the bomb and gas zone: the professed only |
| **The Way of Breath** | the cap, from the bench's north gate to the rim: about 2 km at 8.5 % | prayer-flag lines, three chortens, the Halfway Shelter. Pilgrims may climb to the Threshold Chorten and no further |
| **The bench** (the house) | the spur's crest at 881,1527 (1,669 m), about 180 x 130 m behind its wall | the Red Monastery and the house's halls (section 2.3) |
| **The cliff band** | under the Lip, facing south | authored on the page (section 3.4). **The Cleft Stair** climbs it in a cleft; meditation caves in its columns (Taktsang's are the model) |
| **The Stair of the Eye** | the spur, from the band's foot (~1,450 m) to the Foot House (~460 m) | a mule road in switchbacks, about 13 km at 9 %; way chortens; **the Rest House** at about 1,080 m (881,1528.5). Mules go round the band's west end to the Mule Gate (about 1.5 km more) |
| **The Foot House** | the spur's foot, about 881,1530.3 (~460 m) | where the west and east roads meet: the pilgrims' hostel (120 beds), the stores, the mule stables (about 40 mules), the threshing floor, the lower terraces, the gate chorten |

### 2.3 The halls on the bench

| Part | Size (*proposed*) | What |
|---|---|---|
| **The Red Monastery** | 52 x 52 m | the Qiblai kit's great monastery whole (`qb_monastery`) in the **crimson dress** (`o.v 0`), its gate facing south to the Rift, the gilt crown on its Assembly Hall. Its cell ranges hold about 100 of the chapter |
| **The Lip Range** | about 120 x 14 m, four storeys, its lower two built into the cliff's top (the Potala effect, as Longsong's) | from west to east: **the Mirror Hall** (the readers' gallery and balcony toward the Beacon, 245°, Erehwon, 284°, and the Tears' camp, 197°), **the Book House**, the **guest house** (60 beds), **the Labrang** (the Prismarch's four storeys at the east end) |
| **The Hall of the Ember** | about 20 x 16 m | on the axis north of the monastery, toward the crater. The fire lit from the vent burns in its sanctum. Its north window frames the plume |
| **The chapter range** | about 40 x 10 m | the rest of the chapter, two to a cell |
| **The Mirror School** | about 36 x 12 m | its dormitory, the mirror bench (grinding and silvering), the code room |
| **The novices' court** | about 40 x 30 m | dormitory, school, refectory, the Master of Novices |
| **Kitchen, refectory, granary, infirmary, bath house** | ranges round the Mule Gate's court | the granary holds a winter's grain (section 4.1) |
| **The great cistern** | about 1,000 m³ under the monastery's court | with smaller tanks under the guest house and the novices' court (section 2.5) |
| **Gates** | | **the Gate of the Rift** (south-west, at the head of the Cleft Stair); **the Mule Gate** (west); **the Gate of Breath** (north, to the rim) |
| **Outside, on the cap** | | the byres and dairy (milk is a sacrament), the hives on the lee of the wall (honey is the other), the threshing floor, the upper terraces, the woodlot's sheds |

**The rules a layout would keep** (*proposed*, for step F3, as the Beacon's `31-bc-rules.js`):
- every part in its zone; no overlaps; no building in a wall;
- **nothing within 12 m of the Lip but the Lip Range**, which is built on it on purpose;
- **the Lip Range's balcony sees the Beacon, Erehwon and the Tears' camp** by 10 m or more;
- the Way of Breath and the Stair at 10 % or less, the Cleft Stair excepted;
- **everyone has a bed**: 280 on the bench and 40 at the Foot House;
- **no oil burned on the mountain** (section 2.4); the roof water covers the year (section 2.5);
- gold only on the Assembly Hall's crown and the Hall of the Ember's sanctum.

### 2.4 The crater rite and the signals (*proposed*)

**The crater.** The owner's vent makes the summit a live crater. *Proposed*: about 600 m across and 150 m deep, with a
**Strombolian** vent in its floor: a small burst every 10-20 minutes, red flashes on the plume at night, puffs of ash
by day (Stromboli is called "the lighthouse of the Mediterranean" for this). The house stands 2 km off and 170 m
below, out of the bombs' reach. Whether the vent flashes, or only smokes, is question 3.

**The day's round:**
- **The Opening of the Eye.** At sunrise the Rim Watch flashes the first mirror of the day to the Beacon (answering its
  last night signal) and to Erehwon. The house below sings the morning office.
- **The day line.** On the hour the Mirror Hall and the Eye Post read and send.
- **The Closing.** At dusk the Watch writes the day's breaths in the Book. The night watch counts the flashes.
- **The Station's passes** are the Order's festival: the professed walk the Open Kora three times on the rim, the
  novices take their vows, and the pilgrims fill the bench.

**The mirrors (the day line):**
- Mirrors of polished speculum bronze, about 30 cm on the bench and 60 cm on the Eye Post, each with a sighting vane
  and a shutter. They are **heliographs**: the sun is the lamp.
- **The code** is the Beacon plan's proposal: the **sound grid of the syllabary**, a syllable as a row of flashes and a
  column of flashes (`settlements/beacon/PLAN.md` section 4, question 5). One signal book for the day and the night.
- **Range.** A heliograph has been read at about 295 km (1894, Utah to Colorado) in very clear air. The Eye's lines are
  62-254 km (section 3.2): the Beacon and Erehwon read it on most clear days, G1 only on the clearest.

**The night:**
- The Beacon flashes to the Eye with its lamp. The Eye answers with the **fire basket** on the Eye Post, a juniper fire
  behind a shutter screen, lit from the Ember: read at the Beacon (62 km) and Erehwon (82 km) on clear nights.
- **No oil.** The Eye burns no oil and keeps no generator: the sun and the mountain are its lights. Its tenth of the
  council's oil stays at Qiblai (section 4.3). This is question 7.

**The line it makes** (section 3.2):
- **Erehwon - the Eye - the Beacon.** The Beacon cannot see the capital (its plan, 1.3: "No cell within 16 km of the pin
  sees Erehwon"). The Eye sees both. **The Eye is the relay the Beacon's plan asked for** between the Marches' lamp and
  the capital.
- **The Eye - the Beacon - G1 - Qiblai and Strongwall.** The Beacon sees G1 (+32 m), and G1 sees Qiblai (+36 m) and
  Strongwall (`settlements/strongwall/PLAN.md`, the watch line). So the Prismarch's words reach the council in three
  hops by day, and the Beacon carries them on at night.
- **The Eye Post to G1 direct**, 254 km, on the clearest days only (+9 m with the mirror 30 m up).
- **The Rift.** The bench sees the Golden Tears' camp in the Rift floor (211 km) through a gap in the ridge at
  868,1571. Alarms from the Rift come to the Eye by the Beacon, or straight from the Tears.

### 2.5 Water (*proposed*)

- **No crater lake to drink.** A live crater holds a hot acid pool or nothing. *Proposed*: no lake; a crater lake
  (Kawah Ijen's) is question 3's other answer, and it would be holy, never drunk.
- **No spring on the bench.** No river within 29 km: the Ālph passes the cone's north-east foot at 891,1516, 2,190 m
  below. Hoṭ-Bāṭh's springs are on the north shore, 30 km away, hot and sulfurous: for bathing, not drinking.
- **The bench lives on cisterns.** About 10,000 m² of roofs and 5,000 m² of paved courts at ~850 mm and a runoff of 0.8
  give about **10,000 m³ a year**. The house needs about 2,900 m³ (280 people at 25 litres a day, the guests and the
  herd on top). The climate is `Cfb` with no dry season, so the great cistern's 1,000 m³ is about three months' reserve.
- **The Foot House** drinks from wells into the springs at the coulée's foot (*proposed*; the model does not show them).
- **Breath water.** Steam condensed on cold stone in the crater, a few litres for the rites: holy, not drinking water.
- **The baths.** Pilgrims bathe at Hoṭ-Bāṭh's springs before the climb, as the Azure Dream's bathe before the Hall.

### 2.6 The roads (*proposed*)

| Road | Route | Length |
|---|---|---|
| **The west road** (the pilgrims' and the supply road) | Ṭī-Ṭeras (872,1517) south along the cone's west foot (111-345 m), east to the Foot House | about 33 km, then the Stair: **about 45 km** from Ṭī-Ṭeras to the bench |
| **The east road** (from the barges) | **the Eye's Ghat**, a landing on the Ālph at about 890,1521 (-520 m), up to the cone's east saddle (886,1527, ~300 m), west along the south foot to the Foot House | about 18 km, then the Stair: about 32 km to the bench, 2,190 m of climb |
| **The Stair of the Eye** | the Foot House to the band's foot in switchbacks; the Cleft Stair or the mule road round the west end | about 13 km and 1,200 m |
| **The Way of Breath** | the bench to the rim | about 2 km and 170 m |

**The pilgrims' way** from the capital (*proposed*): by launch from Erehwon to Hoṭ-Bāṭh (bathe), along the shore to
Ṭī-Ṭeras (the last night by the lake, at the tea houses), by the west road to the Foot House, and up the Stair. Three
to four days.

**Stores.** The bench eats about 40 t of grain a year from below (section 4.1): about 400 mule loads, one or two a day.
The granary on the bench holds a winter. Fuel comes from the Order's woodlot on the cone's upper flanks (`Cfb`, 12 °C).

## 3. The site in numbers

**The method** (the Beacon plan's): the ground from `tools/scale-model/model/data/h.png`, decoded as `smodel.page.heights`
does (lo -2,600 m, hi 27,000 m, 16 bits), sampled bilinear on the 2 km grid; the eye **20 m** up, the target **15 m** up;
Earth's curve with refraction (k 0.13); samples every 250 m. "Clear by" is the least clearance on the line, leaving out
the last kilometre (the target's own cell). A negative figure is the height of the block. All on the model before the
vent is cut (step F0 re-runs them).

### 3.1 The bench: 881,1527, 1,669 m

The house's terrace is the **break of slope** on the south spur, 2 km south of the summit. Above it the cap is gentle;
below it the flank falls steeply to the Rift's side. It is the lowest ground on the south spur that still sees both the
capital and the Beacon (section 3.2).

| | |
|---|---|
| **The bench** | **881,1527, 1,669 m** on the 2 km grid: the crest of the south spur. 169 m below the summit and 2 km south of it. 2,190 m above Erewhon's lake (-520 m). The house's ground at 1:1 is an assumption until the region is cut |
| Climate | about **12 °C** mean, ~850 mm, `Cfb` (*estimated* from the summit's 11 °C, 18 / 4, at 6.2 °C a km, the lapse between the summit and the Beacon's knoll) |
| Air | about **1.31 atm** (*estimated* as in Strongwall's plan: 1.60 atm at 0 m, a scale height of 8.2 km). The summit is 1.28. Thinner than the Beacon's 1.44, which is already the edge of Lizard air: **no raid comes here** |
| The Foot House | about 881,1530.3, ~460 m, ~19.5 °C (*estimated*), about 1.51 atm. 6.6 km south of the bench and 1,200 m below |
| From | Ṭī-Ṭeras 27 km, Hoṭ-Bāṭh 30, the Ālph 30 (891,1516), Theodiga 56, the Beacon 62, Erehwon 82, Qiblai 159 (straight) |

### 3.2 What the bench sees (eye 20 m)

| Target | px | km | Bearing | Clear by | |
|---|---|---|---|---|---|
| **The Beacon** (the gold Order) | 853,1540 | 61.7 | 245° | **+46 m** | sees |
| **Erehwon** | 841,1517 | 82.5 | 284° | **+26 m** (the flank below the eye) | sees |
| **Grēṭ-Āil** (the Azure Dream's cove) | 846,1509 | 78.7 | 297° | **+19 m** (the flank below the eye) | sees |
| **The Golden Tears' camp** | 850,1628 | 211.3 | 197° | **+54 m** | sees, through the gap at 868,1571 |
| The Ālph wall's crest | 951,1505 | 146.8 | 73° | +13 m | sees |
| **The House of the Tempest** | 886,1619 | 184.3 | 177° | -495 m | hidden by the ridge at 883,1570 (1,067 m, 86 km) |
| **Strongwall** | 912,1640 | 234.4 | 165° | -998 m | hidden (893,1571, 1,434 m) |
| G1, the Brow post | 917,1648 | 252.5 | 163° | -94 m | hidden by the same ridge (893.8,1570, 1,419 m) |
| **Qiblai** | 922,1595 | 158.8 | 149° | -2,284 m | hidden: deep in its lake basin, behind 908,1572 (1,250 m) |
| **Theodiga** | 908,1535 | 56.3 | 107° | -215 m | hidden in its gorge (904,1534) |
| The south watch fort (`march.s`) | 847,1549 | 81.0 | 237° | -801 m | hidden under the Rift's scarp |
| The west watch fort (`march.w`) | 818,1531 | 126.3 | 266° | -42 m | hidden |
| Phēr | 843,1491 | 104.7 | 313° | -11 m | hidden by the summit |
| Tuatara | 818,1554 | 137.1 | 247° | -523 m | hidden |
| Viridian's estate | 962,1562 | 176.5 | 113° | -933 m | hidden |
| Sekriḍ | 986,1588 | 242.9 | 120° | -2,604 m | hidden |

- **The lamp's partner and the capital.** The Beacon sees the bench back (+39 m with its lamp at 22 m) and Erehwon sees
  it (+45 m). The Beacon does not see Erehwon (-646 m). So the bench is the relay between them (section 2.4).
- **The view by bearing.** East-south-east (120-150°) is closed at 37-43 km by the wall of Theodiga's gorge (893-900,
  1537-1543, 1,700-2,000 m). South to south-west (160-230°) is open to the Rift's far ranges, 250-300 km off, over the
  ridge at 1570. West-south-west (240-250°) looks down into the Rift's scarp by the Beacon. North is the cone itself.
- **Lower on the spur sees less.** At 881,1527.5 (1,473 m) Erehwon is hidden (-11 m) and the Tears' gap is marginal
  (+2 m). At 881,1528 (1,277 m) both are hidden (-105 m and -108 m). Half a pixel east (881.5,1527) loses the Beacon.
  **The house must stand on the bench, not below it.**

### 3.3 What the rim sees (the Eye Post, 881,1526, 1,838 m)

| Target | km | Bearing | At 20 m | At 30 m | At 40 m |
|---|---|---|---|---|---|
| The Beacon | 62.6 | 243° | +46 m | +50 m | +50 m |
| Erehwon | 82.0 | 283° | +46 m | +56 m | +66 m |
| Grēṭ-Āil's cove | 77.8 | 296° | +52 m | +53 m | +53 m |
| The Golden Tears' camp | 213.2 | 197° | +40 m | +50 m | +54 m |
| **G1, the Brow post** | 254.4 | 164° | **+3 m** | **+9 m** | **+16 m** |
| Phēr | 103.3 | 313° | +3 m | +3 m | +3 m |
| The House of the Tempest | 186.3 | 177° | -431 m | -425 m | -420 m |
| Strongwall | 236.3 | 165° | -910 m | -904 m | -898 m |
| Qiblai | 160.5 | 149° | -2,251 m | | |
| Theodiga | 56.9 | 108° | -108 m | | |

- The rim also sees the lake's north side over the cone (Ālph-Hēḍ, Ōlḍ-Thalaba). The bench does not.
- **G1 is just in sight from a 30 m mirror tower.** That is the Eye Post's height question: 12 m (*proposed*) needs the
  Beacon to relay; a 30 m tower reaches G1 direct on the clearest days.
- **The vent will change these figures**: the crater lowers the summit's middle, not the rim. Step F0 re-runs them.
- *Considered and set aside*: a post on Theodiga's gorge wall (897,1539, 2,042 m) sees the bench (+31 m), G1 (+11 m) and
  the Beacon (+2 m), but not Qiblai. It shortens no line enough to be worth a post.

### 3.4 The south flank's slope, and the cliff band

**The profile due south from the summit** (bilinear, on the 2 km grid):

| From the summit | px | Ground | Slope |
|---|---|---|---|
| 0 km (the summit) | 881,1526 | 1,838 m | |
| 2 km (**the bench**) | 881,1527 | 1,669 m | the cap: **84 m a km, 4.8°** |
| 3 km | 881,1527.5 | 1,473 m | the flank: **196 m a km, 11.1°** |
| 5 km | 881,1528.5 | 1,080 m (the Rest House) | 196 m a km |
| 8 km | 881,1530 | 497 m (the spur's foot) | 196 m a km |
| 10 km | 881,1531 | 366 m (the plain) | the foot: 66 m a km |

- **Across the spur** at the bench: 1,516 m a pixel west and 1,451 m a pixel east, so the bench falls 77-109 m a km to
  either side. It is a crest on a cone about 16 km wide at its foot.
- **Beyond the foot** the plain lies at 360-425 m for 24 km south, then a low rise (597 m at 879.5,1542), the Rift's
  north scarp at 42-48 km (86 m to -862 m), a trough at about -900 m, and the ridge at 1570 (1,067-1,434 m) that hides
  the Tempest. The Rift's floor and far ranges show over and through it.
- The cone is about 10° on the grid overall. The steepest step on the south flank is 196 m a km. **There is no cliff at
  model scale.**

**Where the band goes** (*proposed*; the owner: authored on the page):
- **One band under the Lip**, its top at about 1,650 m, along the contour about 200 m south of the bench's middle
  (881,1527.1), facing 165-200°, **about 1.5 km long and 200 m high** (the owner's range is 100-300 m).
- **What it is**: the front of the cone's last lava flow, a **coulée** of columnar basalt under a rubbly crust. The
  bench is the flow's flat top. The house's stone is cut from its columns.
- **How it fits the model**: the grid spreads 196 m of fall over the first kilometre below the bench. The band takes
  that fall in one face. The bench behind it is flattened to about 1,660 m; a talus apron from about 1,450 m eases into
  the flank below. The ground at both ends stays on the model's surface (a `core/terrain` carve patch, sign-safe;
  `KRUBBLE` for the talus).
- **A second, lower band** of about 100 m at the Rest House (~1,080 m) is optional: question 4.
- The band's west end is where the mule road turns up onto the bench. The Cleft Stair climbs a cleft near its middle.

### 3.5 Neighbours and the survey

- **Neighbours.** Ṭī-Ṭeras (mist tea "on the east volcano's flank") 25 km from the summit, Hoṭ-Bāṭh ("the east volcano's
  hot springs; sulfur and pumice") 28 km, the moved `march.e` and the Beacon (853,1540) 63 km, Ālph-Hēḍ 47, Theodiga 57,
  Erehwon 82. The lake is 26 km off, the Ālph and its barge road 28 km. No road crosses the cone yet.
- **The other two volcanoes are claimed:** the west (829,1526) holds Erehwon's basalt quarries, the middle (856,1532)
  stands by the Beacon. The east one was the only one free.
- From the Sultanate's middle (905,1551): 69 km. Relief within 6 / 10 / 20 km of the summit: 1,546 / 2,021 / 2,436 m.
  Biome kit: `xanadu`, the Vale of Xanadu.

**The other candidates** (the first draft's survey):

| # | Site | px | Summit | Why not |
|---|---|---|---|---|
| C2 | The Ālph wall, the Vale's NE wall | 951,1505 | 5,682 m, a 3,050 m SW face | the fallback: tall and remote, but cold (ET), dry, no fire, 130 km from the centre |
| C3 | Theodiga's gorge wall | 897,1539 | 2,042 m, the only true cliff in the centre | crowds Theodiga and the river road |
| C4 | The ridge north of Qiblai | 921,1559 | 1,362 m | low; Qiblai hidden behind its own shoulder |
| C5 | Sekriḍ's height | 1004,1556 | 5,215 m | the east edge, shared with Strongbow and two roads |

## 4. Its place in the economy sim (*proposed*; for the tune's owner, not done here)

This plan does not edit `core/region/data/xan-tune.js`. The entry below follows how `xan.beacon` was added (B4:
a1df088a0, 6f9c33143): a `T.` record, a block that adds the settlement with its works, a road from the capital, and a
check in `test-xan-economy.js`.

### 4.1 What it eats, and what feeds it

| What | The proposal | Why |
|---|---|---|
| **People** | 320 at the bench's px, 881,1527 | section 2.1 |
| **Diet** | the fort diet (as the Beacon's) **less arms and powder**, plus **sulfur 1 kg a head a year** (320 kg) | a working house at altitude; the monks bear no arms. Sulfur for the halls' fumigation (the old use of brimstone) and the White Lily's ointments |
| **Its terraces** | `fe.terraces`, harvest season, **three tenths** of its grain: about **17 t** a year (0.3 of 320 x 180 kg) | less than the Beacon's two fifths: the cone is steeper and higher. At about 1.5 t/ha on ash soil, some 12 ha on the cap and round the Foot House |
| **The capital's road** | `road.er-eye`: grain, salt and tools from Erehwon, by launch to Ṭī-Ṭeras (62 km) and the west road (45 km) | the capital feeds the Beacon too; the lake towns already ship to it |
| **Tea** | `road.eye-tea` from Ṭī-Ṭeras (`lk.tea-terraces`, 45 t a year), by want | the watch's tea, from the next village. The fort diet's tea (1 kg a head) is 320 kg, under 1 % of Ṭī-Ṭeras' make |
| **Sulfur** | `road.eye-bath` from Hoṭ-Bāṭh (`lk.hot-bath`, 40 t a year), by want: 320 kg | under 1 % of Hoṭ-Bāṭh's sulfur, most of which goes to the capital by share today |
| **No oil, no power** | none | section 2.4 |
| **Milk and honey** | not in the tune (no dairy good), as at the Beacon | the byres and hives are drawn |

### 4.2 Its income

- **The Prismarch's tenth** (`settlements/kirstabal/PLAN.md`: the council keeps a fifth, each house takes an eighth of
  the rest). *Proposed*: a crimson daughter house, `qb.crimson`, in Qiblai at spoke 0 (922,1594.85: the saffron house's
  302 m radius, due north of the Temple Mountain), about 300 monks taken out of Qiblai's bulk as `qb.order` is. It takes
  its share of `oil.council` as a `cut` where the oil lands, and its share of the Sultan's grants of esteem as a
  transfer, both at **`T.orderHouse.share`**, so it follows the change from 1/8 to 1/10 when the tune makes it.
  - In the test year that is about **4,000 kg of oil** (400,000 x 0.1 x 0.1) and, of the esteem, **2 t of grain, 20 kg
    of silk and 50 coin**.
  - **The oil stays at Qiblai**, sold into its market or burned in its generator. The mountain burns none.
- **The Prismarch's purse.** A yearly transfer, `eye.purse`, from `qb.crimson` to the head house: half the esteem's
  coin and silk (25 coin, 10 kg of silk), ten days after the grant.
- **Pilgrims' offerings.** The sim has no pilgrim flow yet (the Azure Dream's launch is a transport record only). Later,
  an offerings transfer from Erehwon in the Station's months.
- **Sekriḍ** (`T.lowerLake`, 800) stays a lake village in the tune. *Later*: its holder set to `qb.crimson`, and a rent
  from it to the daughter house, as the latex house's fee is a transfer.

### 4.3 The entry, as it would read

```js
/* settlements/flashing-eye/PLAN.md section 4 (the owner, 2026-11-16: the east volcano, facing the Rift; the house's size
   *proposed*): the Order of the Flashing Eye's head house (the Red Monastery) on the south flank's bench below the crater,
   with its Foot House at the spur's foot. The fort diet less arms and powder, and a little sulfur; its terraces three
   tenths of its grain; the rest from the capital by launch to Ṭī-Ṭeras and up the Stair; tea from Ṭī-Ṭeras and sulfur
   from Hoṭ-Bāṭh by want. It burns no oil. Its tenth of the council's income lands at its daughter house in Qiblai */
T.flashingeye={id:'xan.flashingeye',name:'The Order of the Flashing Eye\'s head house (the Red Monastery, on the east volcano\'s south flank)',
 px:[881,1527],people:320,terraces:.3,sulfur:1,lakeKm:62,roadKm:45,bathKm:11,
 daughter:['qb.crimson','The Red Monastery at Qiblai (the Order of the Flashing Eye\'s house on the council, the crimson spoke)','skm4jjo2vl',922,1594.849,300]};
```

The block goes **after the lake towns are added** (after `T.lake.filter(...).forEach(lakeTown)`), since two of its
roads start at lake towns:

```js
 /* the Order of the Flashing Eye's head house on the east volcano (settlements/flashing-eye/PLAN.md section 4) */
 {const Fe=T.flashingeye,p=at(Fe.px[0],Fe.px[1]),tc=Math.round(Fe.people*.3),terr=eatYr('fort',Fe.people)*Fe.terraces;
  const s=add({id:Fe.id,name:Fe.name,faction:'xanadu',parent:'s57bkv9741',people:Fe.people,x:p.x,z:p.z,
   eats:Object.assign(eats('fort'),{sulfur:Fe.sulfur*D}),keepDays:30,state:'kept',
   start:{grain:Math.round(eatYr('fort',Fe.people)*T.startDays/yr),salt:Math.round(Fe.people*6*.4),tea:Fe.people,tools:Fe.people*.3,sulfur:Fe.people*Fe.sulfur*.5},
   works:[{id:Fe.id+'.market',kind:'market',name:'the Foot House\'s stores',crew:10,out:[],rate:0},
    {id:'fe.terraces',kind:'terraces',name:'the monks\' terraces on the cone',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'}]});
  seats[Fe.id]=s;delete s.eats.powder;delete s.eats.arms;bump('s57bkv9741',eatYr('fort',Fe.people)-terr);
  const up=Math.round(Fe.roadKm/25*1440);
  R.push({id:'road.er-eye',from:'s57bkv9741',to:Fe.id,minutes:Math.round(Fe.lakeKm/12*60)+up,cap:20000,want:40,goods:{s57bkv9741:['grain','salt','tools']}});
  R.push({id:'road.eye-tea',from:'lk.tea-terraces',to:Fe.id,minutes:up,cap:4000,want:40,goods:{'lk.tea-terraces':['tea']}});
  R.push({id:'road.eye-bath',from:'lk.hot-bath',to:Fe.id,minutes:Math.round((Fe.roadKm+Fe.bathKm)/25*1440),cap:4000,want:60,goods:{'lk.hot-bath':['sulfur']}});}
```

The daughter house is added beside `house('order')(T.orderHouse.house)` with `house('order')(T.flashingeye.daughter)`
(Qiblai's bulk less its 300, as `town('skm4jjo2vl',...)` does for the saffron), with a second `cut` on `oil.council`
and its esteem transfer, both at `T.orderHouse.share`, and the purse:
`{id:'eye.purse',from:'qb.crimson',to:'xan.flashingeye',goods:{coin:25,silk:10},first:T.dues.esteem.day+10,every:365}`.

**Things for the tune's owner to weigh:**
- `sulfur` is a good, but no diet eats it today. The proposal adds it to this house's `eats` only.
- `qb.crimson` is the first of the six other council houses the tenth rule asks for. Adding one alone is a choice.
- The house's px is the bench, so the sim's distance to the capital is 82 km straight. The road's minutes come from the
  lake leg and the west road, not the straight line.

### 4.4 The check (`test-xan-economy.js`, the next number after 31)

- the house stands on the cone's **south flank**: within 1.5 px of the summit (881,1526) and south of it;
- it is not hungry over the year;
- its terraces made grain; the capital's road landed; **tea landed from Ṭī-Ṭeras and sulfur from Hoṭ-Bāṭh**;
- it ate **no arms, no powder, no oil and no power**;
- `qb.crimson` received its cut of the council's oil.

Negatives: a house moved to the north flank (881,1525) is caught; a tea road that landed nothing is caught.

## 5. Which kits and modules draw it

| Need | Take | Notes |
|---|---|---|
| **The Red Monastery** | `kits/qiblai` `qb_monastery`, **`o.v 0`** (the crimson dress, `QSPOKE[0]`), read in place | kept whole, as the Beacon and the Tempest keep theirs. Its gate faces south |
| **The rest of the house** | the Qiblai kit's helpers and buildings (`qnStack`, the hostel, the chorten in its three sizes, the kora arcade, the wheel house, the shrine) and the Xanadu kit's (`xnWall`, `xnStack`, `kits/xanadu/README.md`), read in place, in the crimson dress | the Lip Range, the Hall of the Ember, the Eye Post and the Foot House are **new records** on these helpers, in `settlements/flashing-eye/src/` (step F6) |
| **A precinct, not a town** | a blueprint and a layout as data, like the Beacon's (`BLUEPRINT.md`, `src/30-bc-layout.js`) | **not `core/city`**: one complex, exempt as Longsong and the Azure Dream are (`SINGLE_COMPLEX` in `tools/check_core_use.py`) |
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) on the recut `xanadu-oidong-highrift` region (`tools/scale-model/cut_site.py`) | the region was cut before edit 7's final run and has no lake volcanoes yet: the recut north to the Catch puts the cone on its ground |
| **The cliff band, the bench, the talus** | `core/terrain` (a carve patch for the coulée's front; `KRUBBLE` for the talus) | section 3.4. No `terrainH` of the page's own |
| **The vent** | the scale model's vent record (step F0), drawn by `core/atmos` (`smoke`, the opt-in `fx/ashplume`; `fx/lava` for the glow in the vent if it flashes) and `core/hazard` (`gas`, `heat`, `lava`, a vent that "fumes between puffs" by `cycle.base`) | the rim's bombs and fumes as hazards: what the veil of dread is for. The Throne's vents station is the worked example |
| Cisterns, the Foot House's wells | `core/water` (still water) | section 2.5 |
| Sky, the night, the plume lit from below, the Station's passes | `core/atmos` | |
| The mirrors' flashes | a new small effect on `core/atmos`'s sun direction: a mirror flashes where the sun's reflection meets the reader | *proposed*; ask before writing it as a module |
| The night answer | the fire basket on `core/atmos` smoke and a light | |
| Randomness | `core/rand` (`KRAND`) | the layout itself draws nothing at random |
| Records, names | `core/tags` | `qiblai` and `vent` in the vocabulary if missing |
| Overlap | `core/space` (`KSPACE`); `core/mask` for placement | no `getImageData` |
| Doors, walks, interiors | `core/door`, `core/walk` (the Cleft Stair and the Way of Breath as walks), `kits/interiors` (`sets/xanadu.js`), furnished from `kits/catalog` through `core/furnish` | the manifest's new pieces first (the mirror stand, the speculum disc, the fire basket, the Book's lectern) |
| Flora on the cone | `biomes/xanadu` (the Vale); the Throne's vent flora round the crater, read in place | no trees on the rim's bare ash |
| People and time | `core/charactermodels`, `core/simulation`, `core/sched`, `core/clock` (the Rim Watch's rota, the hours of the day line, the Opening and the Closing, the Station's passes) | |
| The economy | `core/region` (`XAN_TUNE`) | section 4 |
| Surfaces | the Xanadu and Qiblai packs through `materials.json` and `tools/textures/pack.py` | **a gap**: no columnar-basalt or fresh-ash set is known in the library. If none is found, the prompt goes in `core/materials/PROMPTS-NEEDED.md` |

## 6. Steps

| Step | What | Who | Test |
|---|---|---|---|
| **F0** (queued 2026-11-16) | **The vent on the scale model**: a vent record for `volc_erewhon_east` at 881,1526, its crater cut (*proposed*: ~600 m across, ~150 m deep, Strombolian); pins for the bench (881,1527) and the Foot House (881,1530.3); the climate and Hoṭ-Bāṭh's springs unchanged. Then section 3's sights re-run on the edited model | the scale-model session | `test_smodel.py`; the bench and the rim still see the Beacon and Erehwon by 10 m or more |
| **F1** (this plan) | The plan; the owner's answers to section 7 | this session, the owner | |
| **F2** | **The blueprint**: `BLUEPRINT.md`, sheets in `floors/` (E0 the cone from the rim to the Foot House; E1 and E2 the bench's floors; M1, M2, MR the kit's monastery in crimson; L the Lip Range; P the Eye Post; F the Foot House; a section along the spur), `FURNITURE.md`, `flashing_blueprint.py` on the shared generator (`settlements/voth/palace/blueprint.py`), as the Beacon's | a blueprint session (the large-buildings skill) | the sheets drawn from the layout; the layout's checks pass first |
| **F3** | **The layout as data**: `src/30-fe-layout.js`, `src/31-fe-rules.js` (section 2.3's rules), `layout_dump.js` | | `node settlements/flashing-eye/test-flashing-eye.js`, every rule with a negative |
| **F4** | **The tune**: `T.flashingeye`, `xan.flashingeye` (320), its terraces, its three roads, `qb.crimson` and its tenth, the purse (section 4) | the Xanadu sim session | `test-xan-economy.js`, the new check and its negatives; the baseline moved on purpose |
| **F5** | **The house on the open world**: the recut region with the cone on it; the cliff band authored (`core/terrain` carve, `KRUBBLE`); the vent drawn (`core/atmos`, `core/hazard`); the layout's frame on the 1:1 ground; the sights asserted on the drawn ground | the open-world session | the region's verify; line-of-sight asserts to the Beacon, Erehwon and the Tears' camp; no trees on the band or the rim |
| **F6** | **The records, the interiors and the life**: the new records (the Lip Range, the Hall of the Ember, the Eye Post, the Foot House) on the Qiblai kit's helpers; the interiors from the blueprint; the catalog's new pieces; the Rim Watch, the day line, the Opening and the Closing and the Station's nights on `core/sched`; pilgrims on the Stair | | the walk and interiors audits; `check_core_use`; the page's `verify.py --assert` on a GPU lane |

## 7. Questions for the owner

1. **The doctrine.** The Eye that does not close: the Order watches for the one with "flashing eyes" who will sing the
   Song whole, bears the holy dread for the faithful, and reads the mountain's breath and the Station's glints. Keep it,
   or change it?
2. **The size.** About **320** (280 on the bench, 40 at the Foot House), with pilgrims on top. Or the Beacon's 300, or
   more?
3. **The crater.** What does the vent do: **flash** (Strombolian bursts every 10-20 minutes, red at night:
   *recommended*, it makes the name), glow (a lava pit, Masaya's or Erta Ale's), or only smoke (fumaroles)? And is
   there a hot acid lake in it (Kawah Ijen's)? This sets the vent record (F0).
4. **The cliff band.** One band of about **200 m** under the bench, as the front of a columnar-basalt lava flow
   (*recommended*), or the crater's own wall? A second band of about 100 m at the Rest House?
5. **The day line.** Does the Eye keep the council's mirror line by day, with the Beacon's lamp by night, in one signal
   book (the sound grid)? And is the Eye the **relay between the Beacon and the capital** that the Beacon's plan left to
   the Marches?
6. **The Prismarch.** Does he live on the mountain and sit on the council by mirror (*proposed*), or in Qiblai half the
   year, as the Azure Dream's does?
7. **The night answer.** A juniper fire basket and no oil (*proposed*: the Eye burns none of the Sultan's), or a lamp on
   a share of the council's oil?
8. **The crimson banner.** Spoke 0 points due north from the Rainbow Temple. The Eye lies at **329°** from Qiblai. Does
   the banner turn toward the mountain, or keep the spoke's bearing?
9. **Sekriḍ.** Do its rents go to the daughter house at Qiblai, or up to the mountain? Its holder set to `qb.crimson` in
   the tune?
10. **The roads.** Both the west road from Ṭī-Ṭeras (the pilgrims', by Hoṭ-Bāṭh's baths) and the east road from a
    landing on the Ālph, or only the west?
11. **The daughter house in the tune.** Add `qb.crimson` now on its own, or wait and add all six missing council houses
    together with the 1/10 rule?
12. **A Xanadui name** for the house, as Grēṭ-Āil and Ṭī-Ṭeras have? *Proposed*: *Phlāśin-Āi* (the Flashing Eye), from
    the language's *ph* and *ś* (Phēr, peleśā). The owner's call.
13. **Textures.** If the library has no columnar basalt or fresh volcanic ash, may the gap go in
    `core/materials/PROMPTS-NEEDED.md` with a prompt?
