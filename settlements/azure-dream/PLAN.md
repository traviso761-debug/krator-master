# Grēṭ-Āil: the head monastery of the Order of the Azure Dream (plan, 2026-11-16)

The owner, 2026-11-16: *"design the Azure Dream head monastery, with a fishermonk's wharf and great Hall of Dreaming with
many cots where devotees sleep in hopes of a spiritually enlightening dream"*. Before that, relayed: *"Grēṭ-Āil will be
the head monastery for qiblai's blue monastery, the Order of the Azure Dream"* (`settlements/qiblai/PLAN.md`, LORE.md 6.13).

This is a plan for the owner to approve. Nothing is built. The blueprint sheets are in `floors/`, drawn by
`azure_blueprint.py` on the shared generator (`BLUEPRINT.md` says what each sheet holds and which plans taught it).
`FURNITURE.md` is the furniture manifest drawn from the same room data. Everything not quoted from the owner is
*proposed*. The questions are in section 13.

## 0. What is settled, and what this plan proposes

**Settled** (the owner and the repo):
- The **Order of the Azure Dream** is Qiblai's **blue monastery**, one of the eight whose abbots, the Prismarchs, sit on
  the Prismarchy. Its spoke in Qiblai (`QSPOKE[5]`, `kits/qiblai/src/89q0-qb-helpers.js:49`) is its town house on the
  council. Its head monastery is **Grēṭ-Āil**.
- **The isle**, from the scale model's 2026-11-16 re-run (commit 5f659c054 on `claude/gemini-trade-reconcile`, unpushed;
  `edit_517.py`, record `isle_erewhon_long`):
  - Erehwon's lake is 66 x 25 px, centred at px 845,1504, its axis 15 degrees south of east. Its level is -520 m and it
    is 937 m deep at most.
  - The long isle is 24 x 8 px (about 48 x 16 km) on that axis, centred at 845,1504, rising 300 m over the water.
  - Erehwon stands at 841,1517 on the south shore, and the Pleasure Dome's islet at 840.9,1516.8 in its bay.
  - The volcanoes stand at 829,1526, 856,1532 and 881,1526. The bay isle is at 844.1,1511.5.
- In the sim (`core/region/data/xan-tune.js`, `claude/openworld-sites-24defd`), the isle is `lk.great-isle`: about 600
  people, fishing under Erehwon's hub. The sim session will re-fit it to the new lake.

**Proposed here:**
1. The site: a cove on the isle's south shore facing Erehwon. The monastery climbs from the wharf to the shore's brow.
   The summit kora is 8 km up the isle by the Dream Road.
2. A doctrine for the Order: the Song was dreamed and is unfinished, and its lost turnings come back in dreams.
3. The Hall of Dreaming: 256 cots in eight turnings, its rites, its keepers, its quiet and its light.
4. The buildings as kit records, mostly the Qiblai kit's own in the blue dress, plus new ones (section 6).
5. The isle's 600 people: the Order about 236 and three fishing villages about 364.

## 1. The site

**The isle as the model draws it.** `edit_517.py` raises each isle cell to `LEVEL + 8 + (crest - 8)(1 - 0.45 r^2)`,
with `r` the elliptic radius. For the long isle:
- The middle stands 300 m over the lake (-220 m). The edge cells stand about 168 m over it (-352 m).
- So at the cell scale the isle is a broad, low dome, a whaleback, with a steep shore: about 170 m of rise inside the last
  cell. Atitlán's shores are like this.
- Its shallows reach about 2 px out.
- The summit is the dome's middle. It lies 8 km from the south shore and 24 km from either tip.

What the isle looks like at 1:1 (coves, spurs, the shore's real steepness) is core/world's to draw, and it has not been
cut on this lake yet. The scale model session was asked (2026-11-16) whether the long isle gets finer relief and whether
a cove can be stamped. **Every height in this plan is an assumption until then.** They are listed in the sheets'
headers and in the section.

**Where on the isle** (question 1). The owner asked for the wharf "on the shore that faces Erehwon". Erehwon at 841,1517
lies almost exactly across the isle's axis from its middle (u -0.5, v +13.6 px in the isle's frame). So the shore facing
Erehwon is the middle of the south shore, near **px 844,1508**. Three placements were weighed:

| | Where | For | Against |
|---|---|---|---|
| **A (recommended)** | **The south-shore cove, near 844,1508.** The monastery climbs from the wharf to the brow, about 60-80 m up. The summit kora stands apart, 8 km up the Dream Road | wharf, pilgrims' landing, hostel and Hall in one walk; the Hall faces Erehwon and the Pleasure Dome across 19 km of water; the Valaam and Athos pattern (a great house by the landing, sketes and a summit chapel inland) | the summit kora is a day's outing, not a daily circuit (section 4e) |
| B | The summit, the dome's middle. The wharf is an outstation 8 km away | the kora round the summit is the monastery's own; seen from every shore | every pilgrim and every fish walks 8 km uphill; the wharf and the Hall are two sites |
| C | The west tip, facing the west stack and Erehwon's bay obliquely | the tip's narrower neck | Erehwon is not in front of it; 24 km from the summit |

**The view from the cove** (A), toward the south-south-west:
- Erehwon on its bench 19 km off, with the Pleasure Dome on its islet in the bay.
- The western and middle volcanoes (829,1526 and 856,1532) behind the city, 11-13 px back.
- The bay isle 7 km out on the line. It carries the **Threshold Light**, a lamp chorten that guides the night barge.

The quarrel between the Sultan and the council (`kits/qiblai/PLAN.md` 2a: a pleasure dome "built for feasts, not by the
Song") is then a view: from the Hall's terrace the Order looks across the water at the Sultan's dome.

**The frame.** The sheets use the cove's frame:
- u runs from the waterline inland and uphill, bearing NNE (toward the isle's crest).
- v runs along the shore, positive toward the isle's east tip (ESE).
- Metres. u < 0 is the lake.

Assumed heights over the lake:

| Part | Height over the lake |
|---|---|
| the wharf | +2 to +5 m |
| the lower ward | +5 to +20 m |
| the Stair of Lowered Eyes | +20 to +60 m |
| the upper precinct | +60 m (the Blue Gate) to +76 m (the Hall of Dreaming's terrace) |
| the summit, 8 km on | about +300 m |

**A landform record to ask for** (step AD1, through the scale-model session's queue):
- `lf_azure_cove`: a sheltered cove about 500 m across at 844,1508, with its headlands.
- A spur from the cove up to a brow terrace at +60 to +80 m.
- Like `lf_pleasure_dome_isle`, a sub-cell landform that core/world stamps at 1:1.
- Requested only after the owner approves the site.

## 2. The Order of the Azure Dream (lore, proposed)

**What it believes.** The faith (LORE.md 6.13, `kits/qiblai/PLAN.md` 2a) holds that the Song (*Gīt*), sung whole, will
mend the Broken Wheel. The Azure Dream holds that **the Song is not whole yet**:
- **The Song came in a dream.** The Song itself says so: "A damsel with a dulcimer / In a vision once I saw". The seer
  who first heard it heard it asleep.
- **It broke off.** "Could I revive within me / Her symphony and song": the seer woke and lost the rest. The eight
  turnings the faith sings are what was kept.
- **What was lost comes back the way it came: in dreams.** Every dream that sounds a syllable true to the sound grid is
  taken down. A dream that sounds a lost line of the Song would be the greatest event in the faith since the Decree.
- So the Order dreams for the Wheel. The other Orders turn wheels and sing; the Azure Dream sleeps.

**Its practice:**
- **The Porlock rule.** No one is ever woken. The dream is told before any other word is spoken, to a scribe waiting for
  it. The worst sin in the Order is to break a dreamer's sleep. *Pōrlak*, "the one who wakes", is its word for a
  disturber and a curse.
- **The wheels stop at night in the Hall.** This is the Order's heresy, if it is one. At the Lulling the Hall's kora
  wheels are braked, because the dreamers turn the Wheel in their sleep. The great wheels on the Ālph never stop, and the
  other seven Prismarchs have argued the point for a century. This is question 3.
- **The Station's nights** are the Order's festivals. When the Station crosses overhead (LORE 6.14), the Hall's
  clerestory shutters are opened and its light falls on the sleepers. On those nights the whole Order walks the High Kora.
- **The sacraments of the night.** Honey and milk, the faith's own sacraments ("For he on honey-dew hath fed, / And drunk
  the milk of Paradise"), taken with steeped **blue lotus** from the precinct's ponds. The biome's lotus lies on still
  water (`biomes/xanadu`, zone *shore*). This is question 4.

**The secret this sets up.** Longsong's sealed library holds the poem's English text with its author's name
(`kits/qiblai/PLAN.md` 2a). The plan proposes that it also holds the author's preface: the poem was composed in a dream
and broken off when he was called away by "a person on business from Porlock". The History Monks know the Azure Dream
is right, word for word, about where the Song came from. They also know the lost lines are not anywhere to be dreamed
back. They say nothing. A quest could put the preface in the player's hands.

**Its people and offices** (proposed):
- **The Prismarch** is the Order's abbot. He sits on the council in Qiblai half the year; the blue spoke there is his town
  house.
- **The Prior** keeps Grēṭ-Āil when the Prismarch is away.
- **The Master of the Hall** keeps the Hall of Dreaming and its keepers.
- **The Master of the Wharf** keeps the fishermonks, the barge and the catch.
- **The dream-keepers**, twenty-four: the keepers of the night, the scribes of the Waking Gallery, and the readers.
- **The fishermonks**, forty, who fish the lake for the house.

**The Order and the others** (proposed):
- **The Order of the White Lily** (Qiblai's hospital) sends it the sick who are not mending. They sleep the **Seven
  Nights** in the Hall. This is the Asclepieion's incubation, the oldest dream rite there is (question 6).
- **Erehwon's court** comes across the water on festival nights in its own boats. The Order takes the Sultan's gold and
  disapproves of his dome.

## 3. Who lives on the isle (about 600)

| Who | Where | People *est.* |
|---|---|---|
| choir monks (the Prismarch, the Prior, the officers, the senior monks) | the upper precinct's cells and the great monastery | 82 |
| fishermonks | the Fishermonks' House at the wharf | 40 |
| dream-keepers (keepers, scribes, readers) | the Dream-keepers' House | 24 |
| the Station Watch | the summit | 4 |
| novices | the Novices' College | 30 |
| lay servants and their families | the lower ward | 56 |
| **the monastery** | | **236** |
| **West End** (*Wesṭ-Ēn*, proposed name), fishing, on the isle's west tip facing the west stack | core/hamlet fishing village | 150 |
| **North Shore** (*Nōṛ-Shōr*), fishing, facing Old Thalaba across the water | core/hamlet fishing village | 120 |
| **East End** (*Īsṭ-Ēn*), fishing and the Order's herds, on the east tip by the east isle | core/hamlet fishing village | 94 |
| **the villages** (the Order's lay tenants: a share of the catch, and boats for the festival) | | **364** |
| **the isle** | | **600** |

**Pilgrims come on top of this; they are not residents.**
- An ordinary night has about 60-120 sleepers.
- A Station's night fills all 256 cots, and the hostels take the overflow.
- They come by the Order's barge from Erehwon, daily, about 4 hours under sail and oar. On festival nights Erehwon's
  fishermen ferry them too.

The rest of the isle is woods and meadows:
- dawn redwood and ginkgo groves (the dugouts are cut from them);
- the herds' meadows round East End;
- the Order's terraced orchards on the cove's slopes.

Section 11 lists the numbers handed to the sim session.

## 4. The programme and the layout (sheet G)

The plan follows the Longsong blueprint's lessons (`BLUEPRINT.md`): **the climb is the rank, the holiest room is wrapped
in a kora, the services run beside the processional way, and the ward feeds the house.** Three more come from the dream
temples (section 5): **the sleepers are purified on the way up, the hall is the quietest place in the plan, and the
waking way does not cross the sleeping way.**

### 4a. The wharf (sheet W)

**West of the mole: the pilgrims.**
- **The Mole and the Barge Berth.** A stone mole 54 m into the cove. The Order's barge lies along it: 22 m, a lateen sail
  and eight oars, forty pilgrims.
- **The Wave-wheel Shrine** at the mole head. A prayer wheel turned by a paddle in the swell, its lamp the cove's light.
  On a still night it stops, and the fishermonks say the lake is dreaming.
- **The Lustral Steps.** A ghat (`qb_ghats`) where every arrival bathes in the lake before going up, men and women either
  side of a screen.
- **The Threshold Chorten** at the mole's foot, and **the Ferry House** with the porters, the waiting hall and the list
  of tonight's sleepers.

**East of the mole: the fishermonks.** They fish the lake the Atitlán way: from dugouts (*cayucos*, one trunk each, 4 to
7 m), with nets and handlines by day and with lamps by night.
- three jetties on piles: the night boats', the line boats', the net boats';
- **the Dugout Beach**, about thirty boats hauled up in rows, with paddle racks;
- **the Boathouse**, a Qiblai cube with four open slips on its lake face and a loft for sails and paddles;
- **the Net Racks** and **the Fish-drying Racks**;
- **two Smokehouses.** The lake has no salt within 30 km (`kits/resources/data/ledger.json`: "Erehwon lacks salt within
  30 km"), so the catch keeps by smoke;
- **the Net Loft** over the cool fish store, where the Order's share is set aside;
- **a 180 m Ropewalk** for the net cord and the mooring lines;
- **the Boatwrights' Yard**, where trunks floated round from the woods are hollowed;
- **the Fishermonks' House**: forty cells round a court, a refectory and a chapel with its own lake wheel. They keep night
  hours, so they live by the boats, below the hill and far from the sleepers.

**At night the fishermonks' lamps on the water are a second, lower sky,** seen from the Hall's terrace. Their one rule
inside the cove: no singing.

### 4b. The lower ward (u 26 to 206)

**The pilgrims stay below the stair until their night.**
- **The Lower Way** runs from the mole to the stair, under prayer flags in the Order's blue.
- **Two Pilgrims' Hostels** (`qb_hostel`) stand on the west.
- **The Hall of Fasting** is the pilgrims' refectory for the day before the night, on honey and milk only. Here the
  dream-keepers question each pilgrim and give them a turning.
- **The Waiting Garden** (willows, a rill) keeps the talk below the stair.

**The Order's farm and workshops are on the east:**
- the granary and stores (grain from the isle's terraces and from Erehwon, lamp oil, incense);
- the Dairy and Byres, for the milk of the sacrament;
- the lay servants' houses.

**The Lower Gate** closes the ward at the stair's foot. Past it, eyes are lowered and there is no talk.

### 4c. The Stair of Lowered Eyes (u 206 to 280)

- A zigzag stair up 40 m in **eight flights, one a turning**, with a landing and a chorten at each turn.
- Prayer-wheel rows run along both sides, turned on the way up.
- The terraced orchards lie on either side: apricot and persimmon (`kits/crops`).
- The hives sit in niches in the terrace walls: the honey of the sacrament.

### 4d. The upper precinct (u 280 to 600, walled)

From the gate up the axis:
1. **The Blue Gate.** The gate temple (`qb_gate_temple`) in the blue dress. The bell and drum hang in its towers: **the
   precinct's only bells, 200 m from the sleepers.**
2. **The Court of Arrival.** The Order's chorten stands in the middle. Each pilgrim circles it once and is counted in.
3. **The great monastery in the blue dress.** This is `qb_monastery` v5, the same building as the blue spoke in Qiblai:
   the Assembly Hall (dukhang) at its court's head, and the cloister of the senior monks. The Order's chapter meets here.
   **The head house and its town house share one building**, as the Tempest's daughter house does (`settlements/strongwall`).
4. Flanking it:
   - **the Prismarch's House** and **the Prior's and Officers' House** (west);
   - **the Novices' College** and **the Refectory and Kitchen** (east);
   - **two ranges of Monks' Cells**, sixty cells each in two storeys, along the precinct's sides.
5. **The Lotus Garden, the Garden of Lowered Voices.** Blue lotus in four still ponds and gravel walks. The last talk is
   allowed here, before the Hall.
6. **The Hall of Dreaming** at the head of the axis, on the highest terrace, wrapped in its kora (section 5). Beside it:
   - the **Lustral Bath**, the **Robing Room** and **the Cup House** on the east: the sleepers' way in;
   - **the Waking Gallery**, **the Register** and **the Readers' Court** on the west: the wakers' way out;
   - the **Dream-keepers' House** (they sleep by day);
   - the **Cells of the Seven Nights**.
7. **The Quiet Walk** (juniper and stone) behind the Hall's head, and the back gate onto the Dream Road.

### 4e. The summit and the High Kora (sheet S)

- **The Dream Road** runs 8 km from the back gate up the isle's crest, about 220 m of climb, with **a chorten at every
  kilometre: eight, one a turning**.
- **The High Kora** rings the summit at 260 m out (1.6 km round), with **sixteen wheel houses** (`qb_wheel_house`).
- **The Summit Chorten** (`qb_chorten`, large) carries the isle's one gilt crown seen from every shore.
- **The Wheel House of the Summit** holds the isle's great wheel.
- **The Station Watch**: four monks keep the Station's passes and signal the monastery by lamp when it is due.
- **A Pilgrims' Shelter** for the festival.

The faith walks its kora three times with eyes lowered (LORE 6.13). The Order walks it three times in two places:
- **the inner kora round the Hall, every night before sleep** (about 230 m round, three circuits);
- **the High Kora on the Station's nights**, when the whole Order and the festival's pilgrims go up and walk it three
  times before dawn.

## 5. The Hall of Dreaming (sheets H1, H2)

**What taught it:**
- the Asclepieia: Epidauros, Kos, Pergamon, where suppliants bathed, offered, and slept in the abaton for a healing dream
  that the temple's servants interpreted;
- the Amphiareion at Oropos: its incubation stoa, a long hall of benches, about 110 m;
- the Heian pilgrims' *komori* at Hasedera, who slept the night in the hall, beyond a lattice from Kannon, for a dream
  (the Sarashina diary);
- the Tibetan dukhang: a pillared assembly hall with a raised clerestory over its middle.

**The hall.**
- A dukhang **54 x 30 m inside** on a 3 m column grid: 18 bays long, 10 across, 136 columns. Its outer walls are 1.2 m,
  felt-lined.
- **The Keepers' Walk** runs down the middle two bays, under the clerestory.
- **The cot bays**: four bays either side of the walk, two cots to a bay, heads to the outer wall. **256 cots in all.**
- **Eight turnings of 32 cots** (4 x 4 bays), named for the Song's eight turnings. They are read round the hall
  clockwise from the foot: 1 to 4 up the east side, 5 to 8 down the west. A low painted screen with the turning's number
  in the sound-grid script stands at each end.
- **At the head:**
  - **the Lulling Dais**, where a keeper plays the first turning on the dulcimer at dusk;
  - **the Damsel's Shrine**: her gilt image with her dulcimer, and the one gold lamp in the hall, never put out;
  - the keepers' rest, and the stair to the clerestory.
- **At the foot:**
  - **the Porlock Screen**: the door and two felt curtains 2 m apart, so no light and no sound passes. The keeper of the
    door sits inside it all night;
  - the senior keeper's station, with the wax-tablet racks;
  - the blanket store;
  - **the Waking Door**, west, by which the wakers leave, never back through the hall.
- **Round the hall: the Kora Gallery**, a covered arcade with 48 wheels on each long side and the hall's great wheel
  behind the shrine.
- **Overall**, with the kora: about 66 x 42 m. Exterior budget: the Xanadu kit's largest, 250k triangles.

**The upper works** (sheet H2):
- The cot bays are roofed at +7 m under **a ceiling painted as the night**: deep blue, gold stars, and over the walk the
  Wheel drawn whole (the Station as it was).
- The walk rises to **a clerestory at +12 m**, closed by **the Station Shutters**, worked from a catwalk at +9 m.
- **The Foot Gallery** at +4 m lets the Master of the Hall see its whole length.
- Over the shrine stands a **gilt lantern**, one of the few gilt roofs on the isle (the faith's rule: gold only on the
  sacred).

**A night in the hall:**

| When | What |
|---|---|
| the day before | the pilgrim lands, bathes at the Lustral Steps, rests in the hostel, fasts on honey and milk in the Hall of Fasting; a dream-keeper hears their question and gives them a turning |
| afternoon | up the Stair of Lowered Eyes; counted in at the Court of Arrival; the Lotus Garden |
| dusk | the Lustral Bath; the blue sleeping robe in the Robing Room; **the dream cup** in the Cup House (honey, milk, blue lotus; each cup noted) |
| dusk | **the kora round the hall, three times, eyes lowered,** turning its wheels |
| last light | through the Porlock Screen to the cot; the censers lit; **the Lulling**: one keeper plays the first turning on the dulcimer; the gallery's wheels are braked one by one, the great wheel last; the door is shut and no one enters until dawn |
| the night | three watches. The keepers walk the Keepers' Walk in felt shoes with hooded lamps and speak by hand signs. **Words spoken in sleep are taken down at the cot** on wax tablets. On a Station's night the shutters open at its pass |
| dawn | no bell. The great wheel is freed. **Each sleeper wakes when they wake**, leaves by the Waking Door and goes straight to a booth in **the Waking Gallery**, where a scribe takes the dream down in the sound-grid script before the dreamer has said anything else. A blue thread is tied on their wrist: a dreamer not yet read |
| afternoon | in **the Readers' Court** a reader goes through the dream with the dreamer. A dream that sounds the Song goes to the Master of the Hall, then to the Prismarch |
| after | the dream is entered in **the Register**, shelved by year and turning |

**Quiet** is designed in, not asked for:
- the Hall stands at the far end of the precinct, beyond the Lotus Garden;
- the bells and the drum are at the Blue Gate, 200 m away;
- the fishermonks live by the water, 500 m down the hill;
- felt on timber floors, felt-lined walls, felt shoes, hand signs;
- the Porlock Screen's double curtain;
- the wheels braked;
- no talk past the last lotus pond.

**Incense:** three censers on the walk burn lotus resin and juniper from the Lulling to the first watch, and the smoke
leaves by the clerestory's vents.

**Light at night:**
- **Inside, there is no flame in the cot bays.** The walk is lit by **azure lamps**: butter lamps under blue glass in
  floor niches every 3 m, covered with pierced brass, a dim blue line down the middle of the dark.
- The keepers' lamps are hooded to throw light only down.
- The Damsel's gold lamp burns at the head.
- On the Station's nights its light comes down through the opened shutters.
- **Outside**, the hall's windows are shuttered, and the clerestory glows a faint blue. **The blue window is what Erehwon
  sees of Grēṭ-Āil at night**, 19 km across the water: the Order's sign.
- For the page: lamps on Qiblai's run-time lamp pool (commit 95db7d169) on `core/atmos`'s night, scheduled by
  `core/sched` (the Lulling, the watches, the shutters).

**The numbers:**
- **Capacity**: 256 cots, plus 8 in the Cells of the Seven Nights.
- **Ordinary nights**: 60-120 sleepers; monks of the Order sleep in turn on the empty cots.
- **The Station's nights**: the hall full.
- **The dreams**: at about 100 a night, about 36,000 dreams a year are taken down. The readers keep about 1 in 20 in the
  Register's index, those with a sound of the Song; the rest are shelved and never read again. The Register grows by
  about 60 bound books a year (*est.*).

**The hall as room data.** The cots are a fixed grid, two to a bay, so they are not left to the placer:
- the hall is a layout (bays, turnings, columns, the walk, doors) in the frame of sheet H1;
- the cots are placed from the grid, and the placer fills only the side rooms;
- `core/walk`'s reach audit is run in node before any page (every cot reached from the foot door, the Waking Door reached
  from every turning, the shrine reached only along the walk).

## 6. The buildings as kit records

Most of the head house is the Qiblai kit's own buildings, in the blue dress (`QSPOKE[5]`: wall `0x2a4a9a`, gold trim,
band `0x1a2a5a`), so it reads as one of Qiblai's Orders. On the shore and in the lower ward the walls are white wash,
with the blue on the upper blocks of the sacred buildings only, as Longsong keeps red for its Red Palace (question 11).

| Record | What | From | Size *est.* (m) | Budget |
|---|---|---|---|---|
| `qb_monastery` v5 | the great monastery: Assembly Hall and cloister | **reuse** (the blue spoke) | 52 x 52 | as built |
| `qb_gate_temple` (blue) | the Blue Gate; the Lower Gate as its small form | reuse, the dress | as built | as built |
| `qb_hostel` | the two pilgrims' hostels | reuse | as built | as built |
| `qb_bath` (blue) | the Lustral Bath | reuse, the dress | as built | as built |
| `qb_chorten` 0-2 | the Threshold Chorten, the Court's chorten, the stair's landings, the Dream Road's eight, the Summit Chorten | reuse | 3 sizes | as built |
| `qb_terrace_stair` | the Stair of Lowered Eyes, flight by flight | reuse | as built | as built |
| `qb_kora_arcade`, `qb_kora_corner` | the Stair's wheel rows | reuse | as built | as built |
| `qb_wheel_house` | the High Kora's sixteen and the summit's great wheel | reuse | as built | as built |
| `qb_ghats` | the Lustral Steps | reuse | 48 x 30 | as built |
| `qb_college` | the Novices' College | reuse | as built | as built |
| `qb_row_poor`, `qb_row_mid`, `qb_court_house` | the lay servants' houses; the Prismarch's House (the courtyard house in the blue dress) | reuse | as built | as built |
| `qb_shrine` | the villages' wayside shrines | reuse | as built | as built |
| **`qb_ad_dream_hall`** | **the Hall of Dreaming**: the pillared hall, the clerestory and shutters, the gilt lantern, the Kora Gallery with 96 wheels and the great wheel | **new** | 66 x 42, 19 m to the crown | 250k |
| `qb_ad_waking` | the Waking Gallery, the Scribes' Room and the Register, one range west of the hall's foot | new | 88 x 48 | 60k |
| `qb_ad_cup_house` | the Robing Room and the Cup House | new | 40 x 26 | 30k |
| `qb_ad_fast_hall` | the Hall of Fasting | new (a Qiblai cube hall) | 44 x 72 | 60k |
| `qb_ad_lotus_garden` | four still ponds (`core/water` still), walks, the biome's lotus placed as flora, not drawn into the record | new (on the kit's `qb_meditation_garden`) | 66 x 100 | 20k |
| `qb_ad_boathouse` | the Boathouse: a cube, four open slips, the loft | new | 30 x 46 | 60k |
| `qb_ad_jetty` | a timber jetty on piles, its mooring posts, lamp posts | new | 6 x 42 | 10k |
| `qb_ad_mole` | the stone mole and the Wave-wheel Shrine at its head | new (Xanadu's `xa_quay` is the form) | 62 x 16 | 30k |
| `qb_ad_racks` | net racks and fish-drying racks, in a field | new (the port kit's `hbNetRack` and `hbFishRack` are the forms) | 32 x 66 | 20k |
| `qb_ad_smokehouse` | a smokehouse | new (the Iziz Vernacular's fish landing and smokehouse is the form) | 11 x 14 | 15k |
| `qb_ad_ropewalk` | the ropewalk: a long low roof on posts | new | 8 x 180 | 20k |
| `qb_ad_fishermonks` | the Fishermonks' House: cells round a court, refectory, chapel | new (a small `qb_monastery`) | 44 x 70 | 60k |
| `qb_ad_station_watch` | the Station Watch: a cube with a roof platform and a signal lamp | new | 28 x 28 | 30k |
| boats | the dugout; the Order's barge | new: the dugout from the Vernacular's `vldDugout` form; the barge in the line of Xanadu's `xnXQBoat` and the pleasure barge | 4-7 m; 22 m | 2k; 20k |

**Where the new records live** (question 10). Recommended: a fragment in the Qiblai kit, `kits/qiblai/src/89q6-qb-azure.js`
(and `89q6i` for the hall's interior):
- Qiblai's blue spoke can then show the hall in miniature.
- The other Orders' head houses (Viridian Thought's tea estate, the Tempest) can follow the same pattern.
- The Qiblai session owns the kit, so this waits for its agreement.

**Seeds** 34000-34199. The kit's own block, 33000-33999, is full; nothing in `kits/`, `settlements/` or `biomes/`
reseeds in the 34000s. The prefix is `qb_ad_`, with `culture:'qiblai'`. The tags: religious for the hall, the gate, the
chortens and the wheel houses; infrastructure for the mole and jetty; industry for the racks, smokehouse and ropewalk;
multi-family dwelling for the cells.

The kit's footprint test (`node kits/xanadu/tests/test-footprints.js`, copied for the kit) runs on every new record before
it goes on a sheet.

## 7. Interiors and furniture

- **The furniture manifest** is `FURNITURE.md`: 6,186 pieces as a brief, on the Xanadu sets through Longsong's key map.
  It lists **22 new catalog pieces**, each with a line a modeller can build from. Chief among them:
  - the dream cot: a low frame, a reed (*tul*) mat, a blue wool blanket, a bolster, the turning's syllable on the rail;
  - the azure lamp, the keeper's hooded lamp, the standing censer;
  - the turning screen, the tablet rack, the Lulling dais and the Damsel's image;
  - the waking booth and the register press;
  - the cup table and the robe rack;
  - for the wharf: net, fish and smoke racks, the paddle rack, the creel, the ropewalk post, the wave wheel, the dugout;
  - the bee wall.
- **Rooms** go through `kits/interiors` (`ROOM()`, the placer) with the catalog's Xanadu culture, as Qiblai's are.
  The exceptions:
  - the Hall's cots, a fixed grid (section 5);
  - the Assembly Hall, which takes the Qiblai kit's existing dukhang interior (`qb_ix_assembly`);
  - the hostel, which takes `qb_ix_hostel`.
- **People.** The monks, pilgrims and sleepers come from `core/charactermodels`, which already has the donor clips
  "Sleep Normally" and "Sit Lie Bed" (`donors/anims/actions.json`). The Hall needs 256 bodies lying still; a crowd of
  baked poses is enough, not 256 rigs.

## 8. The fishing villages

West End, North Shore and East End are **`core/hamlet` fishing villages** (`KHAMLET.village`), placed with what they
work:
- the shore and its shallows;
- the dawn-redwood woods for the boats;
- East End's meadows for the Order's herds.

They are built in Xanadu's vernacular: the Xanadu kit's poor and middle houses, its boat shed. They are lay houses, so
there is no blue.

Each has:
- a landing with dugouts, racks and a smokehouse (the same records as the wharf's);
- a wayside shrine (`qb_shrine`).

They owe the Order a share of the catch and their boats on festival nights. A footpath round the isle joins them to the
monastery and to the Dream Road.

## 9. Textures

The Xanadu pack (`settlements/xanadu/materials.json`) and the Qiblai kit's (`kits/qiblai/tex`) cover the walls, roofs,
gold, wood and tile. Three surfaces may want sets of their own. They go to `core/materials/PROMPTS-NEEDED.md` only if
the owner wants them (question 12):
1. **The painted night ceiling**: deep blue with gold stars and the eight-spoked Wheel. It could also be a decal on a
   plain blue.
2. **Felt**: the floor runners, the curtains of the Porlock Screen, the wall lining.
3. **Reed matting** (*tul*) for the cots and the boathouse floor.

## 10. Core adoption (write in full before the first fragment)

The page is a settlement placed on the world map, so it starts from `settlements/pinnacle-rock` or `settlements/isle-demo`
(README "CORE MODULES ARE NOT OPTIONAL"). Its buildings come from the Qiblai kit, which is drawn on Xanadu's page.

| Module | Taken for |
|---|---|
| `core/rand` (`KRAND`) | every placement: racks, dugouts, cots' small variation, villages; seeds by (world, cell, index, salt), with `KRAND.child` for derived seeds |
| `core/terrain`, and core/world's stamp of the isle (`claude/openworld-sites-24defd`) | the isle's ground, the cove landform, the terraces' cut and fill; no `terrainH` of its own |
| `core/space` (`KSPACE`), `core/mask` (`KMASK.canvas`) | every footprint reserved before it is drawn; no `getImageData` |
| `core/atmos` (`ATMOS.bindHost`) | the standard sky with the gas giant and sun, the night, the lake's wave field, the Station's pass (question 7) |
| `core/water` | the lake (open, shore), the lotus ponds (still), the Lustral Steps' shallows; no water shader of its own |
| `core/host` (`KHOST`), `core/walk` | camera, viewer, inspector, polygon tool, walk keys, probe, cut-away; the Hall's reach audit |
| `core/tags` (`KTAGS`) | every record registered before it is drawn. `qiblai` is not yet in its vocabulary; it is parked in `TODO.md`'s ride-along |
| `core/door` | the Hall's doors, the Waking Door, the booths |
| `kits/catalog` through `core/catalog` and `core/furnish`, with `kits/interiors` | every room's furniture; the 22 new pieces go into the Xanadu culture file |
| `core/hamlet` | the three fishing villages |
| `core/city` | **not taken for the monastery**: a single complex, exempt like Longsong (`SINGLE_COMPLEX` in `tools/check_core_use.py`). The villages are `core/hamlet`'s |
| `core/simulation`, `core/sched`, `core/clock` | the isle's people and the pilgrims; the Hall's night (the Lulling, three watches, the shutters, dawn); the Station's nights as clock events |
| `core/biome`, `biomes/xanadu`, `kits/crops`, `kits/fauna` | the isle's woods (dawn redwood, ginkgo), the shore's reeds and lotus, the orchards (apricot, persimmon), the herds |
| `core/charactermodels` | monks, keepers, pilgrims, sleepers (the "Sleep Normally" clip) |
| `core/materials` | the Xanadu and Qiblai packs through `materials.json` and `tools/textures/pack.py` |
| `core/export`, `core/lod`, `core/minimap` | the Godot export, the far forms (the Hall's blue window, the Summit Chorten seen from Erehwon), the minimap |
| `core/engine` | **not taken**: the Qiblai kit is on `VERN.def` through the Xanadu kit, not on the building-kit engine |

`python3 tools/check_core_use.py` is run before the page is called done.

## 11. The economy (for the sim session; not done here)

These numbers are for whoever re-fits `lk.great-isle` in `XAN_TUNE` (the sim session on `claude/openworld-sites-24defd`).
This plan does not edit the tune.

**People.** The 600 split into the monastery (236) and three villages (150, 120, 94), as in section 3. Pilgrims are a
flow from Erehwon: about 100 a night, and 256 or more on the Station's nights.

**What the isle makes:**
- fish, smoked, not salted;
- honey and milk for the sacrament;
- blue lotus for the cup and for the Order's incense;
- dugouts.

**What the isle takes in:**
- grain from Erehwon (the isle's terraces feed perhaps a third, *est.*);
- salt (little: the fish are smoked);
- lamp oil and butter for the lamps;
- juniper;
- paper and ink for the Register.

**The Order's income:**
- pilgrims' gifts;
- the Sultan's festival gold;
- its eighth of the council's income in Qiblai, as each great monastery has.

**The pilgrims fast**: the day before their night they eat nothing but honey and milk. This is a real dent in the
isle's food bill, and a real demand for its dairy and hives.

## 12. Steps

| Step | What | Who | Proved by |
|---|---|---|---|
| **AD0** | this plan and its sheets; the owner's answers to section 13 | this session, the owner | |
| **AD1** | the map: the cove (`lf_azure_cove`) and its spur; a pin for the monastery at the cove, one for the Station Watch at the summit, the Dream Road; the three villages' pins | the scale-model session's queue | the pins' ground; core/world's stamp at 1:1 |
| **AD2** | the sim: `lk.great-isle` split into the monastery and three villages; pilgrims as a flow; the isle's goods | the sim session | its economy test |
| **AD3** | the kit records (section 6) in `kits/qiblai` (`89q6-qb-azure.js`), on the kit's sheet beside the blue monastery; the reused records' blue dress | the Qiblai kit's owner, or this session with its agreement | the footprint test; `kits/qiblai/verify.py --assert` |
| **AD4** | the 22 catalog pieces in the Xanadu culture file | the catalog's owner | `kits/catalog/verify.py --assert` |
| **AD5** | the Hall as room data, its cot grid, the side rooms furnished; the reach audit in node first | | `core/walk` reach in node; the page's `--interiors` assert |
| **AD6** | the page, `settlements/azure-dream`: the cove, the wharf, the ward, the stair, the precinct on core/world's ground, the lake on `core/water`, the night on `core/atmos` and `core/sched` (the Lulling, the watches, the shutters, the blue window), people asleep | | `verify.py --assert` on the GPU lane; `check_core_use` |
| **AD7** | the three villages (`core/hamlet`); the summit kora as a second station, with a far form from the cove | | the page's asserts |
| **AD8** | the open world's site; the Godot export; the gallery (a new settlement goes to the gallery when it reaches `main`) | | the export test; the gallery's card |

## 13. Questions for the owner

1. **The site.** **A (recommended):** the south-shore cove facing Erehwon (near px 844,1508), the monastery climbing from
   the wharf to the brow, the summit kora 8 km up the Dream Road. **B:** the whole monastery on the summit, with the
   wharf an outstation 8 km off. **C:** the west tip.
2. **The Hall's size.** 256 cots (eight turnings of 32) in a 54 x 30 m pillared hall. Keep it, double it (a second hall
   or a gallery storey of cots), or make it smaller?
3. **The doctrine** (proposed): the Song was dreamed and is unfinished, and the Order seeks its lost turnings in dreams.
   Keep it? And **do the Hall's wheels stop at night** (the Order's heresy, argued on the council), or keep turning
   silently?
4. **The dream cup.** Honey, milk and steeped blue lotus, a mild draught from the precinct's ponds. Or honey and milk
   only?
5. **Who may sleep.** Anyone who has fasted and bathed, of any faith? Men and women in the same hall, kept apart by
   turning? Or a men's side and a women's side, as at Oropos?
6. **The White Lily** sends the sick who are not mending to sleep the Seven Nights (dream incubation for healing). Keep
   the link?
7. **The Station.** Is it in the sky that `core/atmos` draws, so its passes can be clock events for the shutters and the
   festivals? If not, the shutters open on a schedule.
8. **The fishermonks.** The faith forbids war-making by clergy, not fishing. Do Decree monks fish without qualm? And is
   night-lamp fishing right for the lake?
9. **The names.** The eight turnings are named here from the poem's sections: the Decree, the Garden, the Chasm, the
   Fountain, the Dome and the Caves, the Damsel, the Song Revived, the Circle Thrice. Has the faith's division of the
   Song been fixed elsewhere? And are the villages West End, North Shore and East End (*Wesṭ-Ēn*, *Nōṛ-Shōr*, *Īsṭ-Ēn*)?
10. **Where the new records live.** In the Qiblai kit (a new fragment, recommended), or in the settlement's own `src/`?
11. **The dress.** White wash with the Order's blue on the sacred buildings' upper blocks (recommended), or the blue spoke's
    blue walls throughout, as in Qiblai's clergy ring?
12. **The textures.** Ask for the painted night ceiling, felt and reed matting (section 9), or stay on the packs and draw
    the ceiling as a decal?
13. **The population split.** The monastery 236, the villages 364. Or does the owner want the Order larger, with the
    villages smaller?
14. **Building it.** Is the page the next step after the owner's answers, or does it wait until core/world has cut the
    isle on the new lake?
