# Grēṭ-Āil: the head monastery of the Order of the Azure Dream (plan, 2026-11-16)

The owner, 2026-11-16: *"design the Azure Dream head monastery, with a fishermonk's wharf and great Hall of Dreaming with
many cots where devotees sleep in hopes of a spiritually enlightening dream"*. Before that, relayed: *"Grēṭ-Āil will be
the head monastery for qiblai's blue monastery, the Order of the Azure Dream"* (`settlements/qiblai/PLAN.md`, LORE.md 6.13).

This is a plan for the owner to approve. Nothing is built. The blueprint sheets are in `floors/`, drawn by
`azure_blueprint.py` on the shared generator (`BLUEPRINT.md` says what each sheet holds and which plans taught it).
`FURNITURE.md` is the furniture manifest drawn from the same room data. Everything not quoted from the owner is
*proposed*. The questions are in section 13.

## The owner's answers (2026-11-16)

| Question | Answer |
|---|---|
| 1. The site | **"Agreed"**: the south-shore cove facing Erehwon. Then: "can you make the cove landform here": done, section 1 (`tools/scale-model/edit_517_azure.py`) |
| 2. The Hall's size | **"Keep it"**: 256 cots in eight turnings of 32 |
| 3. The doctrine and the wheels | **"Stop at night"**: the Hall's wheels are braked at the Lulling. The doctrine (the Song dreamed and unfinished) stands as proposed |
| 4. The dream cup | **"Honey. Milk, lotus"** |
| 5. Who may sleep | **"Anyone who has fasted and bathed; men and women's side"**: the east turnings are the women's, the west the men's (section 5) |
| 6. The White Lily's sick | **"Sure"**: the Seven Nights |
| 7. The Station | **"Sure"**: its passes are clock events for the shutters and the festivals |
| 8. The fishermonks | **"Fish without qualm; night fishing is fine"** |
| 9. The names | **"Not fixed anywhere. Village names are fine"**: the turnings' names here stand for the Order; West End, North Shore, East End |
| 11. The dress | **"White with blue dress"** |
| 12. Textures | **"Yes new textures"**: three prompts in `core/materials/PROMPTS-NEEDED.md` section 56; felt and reed matting are already in the library |
| 13. The people | **"300 people in monastery and 600 in villages"**: the isle holds 900, not 600 (section 3) |
| 14. Building it | **"Build the page next"**: the page's first pass is built (README.md) |

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
4. The buildings as records: mostly the Qiblai kit's own in the blue dress, plus new ones in this settlement's `src/`
   (section 6).
5. The isle's people: the owner set them at 900, the monastery 300 and three fishing villages 600 (section 3).

## 1. The site

**The isle as the model draws it.** `edit_517.py` raises each isle cell to `LEVEL + 8 + (crest - 8)(1 - 0.45 r^2)`,
with `r` the elliptic radius. The scale-model session confirmed the figures from the committed model (2026-11-16). For
the long isle:
- **Its land cells** run in rows 1500-1508, x 834-856. The middle (845,1504) stands 300 m over the lake (-220 m); the
  edge cells stand 170-190 m over it.
- **Heights over the lake by row** (the scale-model session):

  | Row | West | Middle | East |
  |---|---|---|---|
  | 1504 | 186 at x 836 | 300 at x 845 | 186 at x 854 |
  | 1506 | 175 at x 839 | 279 at x 848 | 180 at x 856 |
  | 1507 | 185 at x 842 | 252 at x 849 | 181 at x 856 |
  | 1508 (the south shore) | 177 at x 845 | 212-214 at x 849-851 | 182 at x 855 |

- So at the cell scale the isle is a broad, low dome, a whaleback, with a steep shore: one cell-wide step of about 180 m
  into shallows 24-100 m deep within 2 px, then the caldera bowl, up to about 937 m deep. Atitlán's shores are like this.
- The summit is the dome's middle. It lies 8 km from the south shore and 24 km from either tip.

**At 1:1**, core/world's `WORLD.H` reads the model's heights by Catmull-Rom and adds per-biome detail scaled to each
cell's relief. The one-cell step becomes **a steep slope about 2 km wide: no cliff and no cove.** A cove, a wharf bench or
a spur has to come from a landform record (below), as `lf_pleasure_dome_isle` does, stamped by the region's
`44-world-landforms.js`. The isle has not been cut on this lake yet. **Every height in the sheets is an assumption until
then**; they are listed in the sheets' headers and in the section.

**Where on the isle** (question 1). The owner asked for the wharf "on the shore that faces Erehwon". Erehwon at 841,1517
lies almost exactly across the isle's axis from its middle (u -0.5, v +13.6 px in the isle's frame). The shore facing it
is **row 1508's cells, x 845-848**, about 20 km NNE of the city, under the shore cell 846,1508 (about 190 m), with a spur up
through 848,1506 (279 m) to the crest at 845,1504 (the scale-model session's reading). Three placements were weighed:

| | Where | For | Against |
|---|---|---|---|
| **A (chosen: the owner, "agreed")** | **The south-shore cove, its head at px 846.075,1508.493** (the scarp's toe at 1:1, below). The monastery climbs from the wharf up the scarp to terraces 74-122 m over the lake. The summit kora stands apart, 8 km up the Dream Road | wharf, pilgrims' landing, hostel and Hall in one walk; the Hall faces Erehwon and the Pleasure Dome across 20 km of water; the Valaam and Athos pattern (a great house by the landing, sketes and a summit chapel inland) | the summit kora is a day's outing, not a daily circuit (section 4e) |
| B | The summit, the dome's middle. The wharf is an outstation 8 km away | the kora round the summit is the monastery's own; seen from every shore | every pilgrim and every fish walks 8 km uphill; the wharf and the Hall are two sites |
| C | The west tip, facing the west stack and Erehwon's bay obliquely | the tip's narrower neck | Erehwon is not in front of it; 24 km from the summit |

**The view from the cove** (A), toward the south-south-west:
- Erehwon on its bench 20 km off, with the Pleasure Dome on its islet in the bay.
- The western and middle volcanoes (829,1526 and 856,1532) behind the city, 11-13 px back.
- The bay isle 6 km out on the line. It carries the **Threshold Light**, a lamp chorten that guides the night barge.

The quarrel between the Sultan and the council (`kits/qiblai/PLAN.md` 2a: a pleasure dome "built for feasts, not by the
Song") is then a view: from the Hall's terrace the Order looks across the water at the Sultan's dome.

**The shore at 1:1** (measured on the page, 2026-11-16). The page stands on the region cut of the scale-model line's model
(with edit 517 and the cove applied) through the open world's fields (`WORLD.H`). It shows the south shore otherwise than the
cells' Catmull-Rom, which put the waterline at py 1508.70:
- **a flat about 400 m wide** at the lake's level, within a few metres of it, half drowned (3-11 m deep between x -200 and
  +500 m of column 846, dry flats either side);
- **a steep scarp behind it, whose toe is the real shore**: at py 1508.49 on column 846.075 (world metres 150, 2986);
- above the toe: +4 m at 25 m in, +17 at 75, +34 at 125, **+58 at 150** (the scarp's steepest stretch, about 100 %), +73 at
  200, +95 at 300, +121 at 400, +131 at 500, +144 at 600.

**The frame.** The sheets and the page use the cove's frame:
- The origin is the cove's head at the scarp's toe, **px 846.075, 1508.493** (`edit_517_azure.report.json`).
- u runs inland and uphill, due north (the shore here runs along row 1508, east and west).
- v runs along the shore, positive toward the isle's east tip.
- Metres. u < 0 is the lake.

The heights on the page (the precinct's terraces are each one level, the mean of the ground under them, cut and filled):

| Part | Where (u) | Over the lake |
|---|---|---|
| the wharf | -60 to 25 | 0 to +6 |
| the lower ward | 25 to 120 | +4 to +32, building by building on pads |
| the Stair of Lowered Eyes | 108 to 160 | +41 to +75.5: a zigzag of six runs up the scarp's face, 34 m (a terrace stair, gentler than the scarp, would run out into the lake) |
| the gate court | 160 to 222 | **+75.5** |
| the monastery's terrace | 222 to 284 | **+94** |
| the Lotus Garden's | 284 to 348 | **+105** |
| the Hall of Dreaming's | 348 to 484 | **+120.5** |
| between the terraces | | zigzag stairs down each face (18.5, 11 and 15.5 m) |
| the summit, 8 km on | | about +300 |

The sheets in `floors/` keep the first frame's u (the precinct drawn 120 m further up, the lower ward wider); the page's
layout is in `targets/isle/89zad-site.js`.

**The cove landform** (the owner, 2026-11-16: "can you make the cove landform here"; `tools/scale-model/edit_517_azure.py`,
its report beside it). It is records only, after `edit_517_pher.py`, the way Phēr's cove was made, and placed against the
1:1 shore:
- **Two headlands**, one `island` record each, on the drowned flat either side of the toe: `lf_azure_cove_west` at px
  845.91,1508.568 (crest 30 m over the lake) and `lf_azure_cove_east` at px 846.24,1508.568 (34 m). Each is 220 m in radius at
  its waterline, 150 m out from the head and 330 m either side of the centre line, joined to the scarp's foot behind it.
- **The cove** is the drowned flat between them, open to the south-south-west toward Erehwon: about 250 m across at 120 m
  out, 7-11 m deep; each arm dry for about 390 m out from the head.
- **No new stamper kind is needed.** core/world's stamper (`41l-world-landforms.js`) already stamps islands. The plan
  first asked for a `cove` kind, as Phēr's first records did, but Phēr's final records (dc15601bc) use islands too.
- **One record per arm.** The stamper stamps a point with the first record whose reach holds it, so an arm drawn as a
  base and a tip would blank part of itself.
- **The first take** (5e5d46b88: knobs 300 m in radius, 200 m out from py 1508.703) was placed against the cells'
  Catmull-Rom. On the 1:1 ground it left two islands 400 m out from the real shore, so it was refitted when the page was
  built. The page draws the same records (KNOWN_ISSUES.md: through `WORLD.landHook` until it takes core/world).
- **Checked** on the page (`verify.py`'s `cove-water`: the water on the centre line 60-160 m out, the headlands out of it). On
  a scratch copy of the scale-model line (dc15601bc) the edit writes only `landforms.json`, and `tests/test_smodel.py` gave
  280 passes and the same 2 known failures as before (the north-east outer wall's station bases) with the first take.
- **To land**, the scale-model session re-runs the script on its line, as it did Phēr's.
- **The monastery's pin** is a separate step (AD1b).

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
  other seven Prismarchs have argued the point for a century. (The owner, 2026-11-16: "stop at night".)
- **The Station's nights** are the Order's festivals. When the Station crosses overhead (LORE 6.14), the Hall's
  clerestory shutters are opened and its light falls on the sleepers. On those nights the whole Order walks the High Kora.
- **The sacraments of the night.** Honey and milk, the faith's own sacraments ("For he on honey-dew hath fed, / And drunk
  the milk of Paradise"), taken with steeped **blue lotus** from the precinct's ponds. The biome's lotus lies on still
  water (`biomes/xanadu`, zone *shore*). (The owner, 2026-11-16: "honey. Milk, lotus".)

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
- **The dream-keepers**, thirty: the keepers of the night, the scribes of the Waking Gallery, and the readers. Women
  keepers keep the women's side.
- **The fishermonks**, fifty, who fish the lake for the house.

**The Order and the others** (proposed):
- **The Order of the White Lily** (Qiblai's hospital) sends it the sick who are not mending. They sleep the **Seven
  Nights** in the Hall. This is the Asclepieion's incubation, the oldest dream rite there is (the owner, 2026-11-16: "sure").
- **Erehwon's court** comes across the water on festival nights in its own boats. The Order takes the Sultan's gold and
  disapproves of his dome.

## 3. Who lives on the isle (900: the owner, 2026-11-16)

The owner: "300 people in monastery and 600 in villages". The sim's `lk.great-isle` had about 600 for the whole isle,
so its re-fit takes 900 (section 11). The split inside each is *est.*

| Who | Where | People |
|---|---|---|
| choir monks (the Prismarch, the Prior, the officers, the senior monks) | the upper precinct's cells and the great monastery | 100 |
| fishermonks | the Fishermonks' House at the wharf | 50 |
| dream-keepers (keepers, scribes, readers) | the Dream-keepers' House | 30 |
| the Station Watch | the summit | 4 |
| novices | the Novices' College | 40 |
| lay servants and their families | the lower ward | 76 |
| **the monastery** | | **300** |
| **West End** (*Wesṭ-Ēn*), fishing, on the isle's west tip facing the west stack | core/hamlet fishing village | 250 |
| **North Shore** (*Nōṛ-Shōr*), fishing, facing Phēr and Old Thalaba across the water | core/hamlet fishing village | 200 |
| **East End** (*Īsṭ-Ēn*), fishing and the Order's herds, on the east tip by the east isle | core/hamlet fishing village | 150 |
| **the villages** (the Order's lay tenants: a share of the catch, and boats for the festival) | | **600** |
| **the isle** | | **900** |

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
- **the Fishermonks' House**: fifty cells round a court, a refectory and a chapel with its own lake wheel. They keep night
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
   - **two ranges of Monks' Cells**, seventy cells each in two storeys, along the precinct's sides (the choir monks, the
     keepers' novices and guests of the Order).
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
- **The women's side and the men's side** (the owner, 2026-11-16: "men and women's side"). The east side, turnings 1 to
  4, is the women's; the west side, turnings 5 to 8, is the men's. Women keepers walk the east half of the Keepers' Walk,
  and men keepers the west. A low lattice screen runs down the middle of the walk, between the lamp niches, from the
  Porlock Screen to the Lulling dais. The shrine at the head faces both sides. The Lustral Bath and the Robing Room each
  have two halves, and the Waking Gallery has eight booths a side. Each side's pilgrims rest in their own hostel range
  below.
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
  sees of Grēṭ-Āil at night**, 20 km across the water: the Order's sign.
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
with the blue on the upper blocks of the sacred buildings only, as Longsong keeps red for its Red Palace (the owner, 2026-11-16: "white with blue dress").

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

**Where the new records live** (settled with the Qiblai kit's session, 2026-11-16). The Orders' head houses do not go
into `kits/qiblai`:
- The new records live in **this settlement's own `src/`** (`settlements/azure-dream/src/`). They are written on the
  Qiblai kit's helpers (`qn*`) and drawn on the kit's page, as a target or a `--kit` folder like Qiblai's own city.
- **The dress** is `QSPOKE[5]`'s `wall`, `trim` and `band`. Not `QN_ORDER_BLUE` / `QN_ORDER_BLUE2`: those are the
  History Monks' blue.
- The `qb_ad_*` keys are agreed.

**Seeds** 34000-34199, given to the Azure Dream by the Qiblai kit's session. Qiblai owns all of 33000-33999 (33700-33899
are its temple, walls, gates and terrace stair); nothing in `kits/`, `settlements/` or `biomes/` reseeds in the 34000s.
Later head houses take the blocks after it, 200 seeds each (34200-34399 next). The prefix is `qb_ad_`, with
`culture:'qiblai'`. The tags: religious for the hall, the gate, the
chortens and the wheel houses; infrastructure for the mole and jetty; industry for the racks, smokehouse and ropewalk;
multi-family dwelling for the cells.

The Xanadu kit's footprint test (`node kits/xanadu/tests/test-footprints.js`, copied for this settlement's records) runs
on every new record before it goes on a sheet.

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
gold, wood and tile. The owner wants new sets for the Hall (2026-11-16: "yes new textures"). **Three prompts** are in
`core/materials/PROMPTS-NEEDED.md` section 56, all full colour. They land as families in `settlements/azure-dream/materials.json`:

| id | Family | For |
|---|---|---|
| `ceiling.night.stars` | `adNight` | the painted night over the cot bays: deep blue, gold eight-pointed stars, small whole Wheels. The great Wheel over the Keepers' Walk is drawn over it with the Qiblai kit's wheel sign, in gold |
| `wall.mural.dream` | `adMural` | the Hall's walls above the dado, the Waking Gallery, the Readers' Room: sleepers in rows under a blue night, and in the clouds above them the Damsel with her dulcimer and the Wheel |
| `cloth.blanket.azure` | `adBlanket` | the dream cots' blankets: the Order's weave, indigo and white with a saffron line |

Two surfaces the plan first listed are **already in the library**, so no prompt is needed:
- **felt** (`cloth.felt`, family `adFelt`): the floor runners, the Porlock Screen's curtains, the wall lining;
- **reed matting** (`fibre.reedmat`, or `reed.mat.woven` for the boathouse floor; family `adReed`): the cots' mats.

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

**People.** 900 (the owner): the monastery 300 and three villages of 250, 200 and 150, as in section 3. `lk.great-isle`
has about 600 today. Pilgrims are a
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
| **AD0** (**done** 2026-11-16) | this plan and its sheets; the owner's answers to section 13 (all but 14) | this session, the owner | |
| **AD1a** (**written** 2026-11-16) | the cove: `tools/scale-model/edit_517_azure.py`, two headland records (section 1), to be re-run on the scale-model line after `edit_517_pher.py` | this session; the re-run is the scale-model session's | the script's own checks; `test_smodel.py` on that line |
| **AD1b** | a pin for the monastery at the cove's head (846,1508), one for the Station Watch at the summit, the Dream Road; the three villages' pins | the scale-model session's queue | the pins' ground |
| **AD2** | the sim: `lk.great-isle` re-fitted to 900 (the monastery 300 and three villages); pilgrims as a flow; the isle's goods | the sim session | its economy test |
| **AD3** (**done** with the page: `src/89qa-ad-hall.js`, `src/89qb-ad-wharf.js`) | the new records (section 6) in `settlements/azure-dream/src/` on the Qiblai kit's helpers and `QSPOKE[5]`'s dress, seeds 34000-34199, on a sheet beside the blue monastery; the reused records' blue dress | this settlement | the footprint test; the sheet's `verify.py --assert` |
| **AD4** | the 22 catalog pieces in the Xanadu culture file | the catalog's owner | `kits/catalog/verify.py --assert` |
| **AD5** | the Hall as room data, its cot grid, the side rooms furnished; the reach audit in node first | | `core/walk` reach in node; the page's `--interiors` assert |
| **AD6** (**first pass done** 2026-11-16, the owner: "build the page next"; README.md, KNOWN_ISSUES.md) | the page, `settlements/azure-dream`: the cove, the wharf, the ward, the stair, the precinct on core/world's ground, the lake on `core/water`, the night on `core/atmos` and `core/sched` (the Lulling, the watches, the shutters, the blue window), people asleep | | `verify.py --assert` on the GPU lane; `check_core_use` |
| **AD7** | the three villages (`core/hamlet`); the summit kora as a second station, with a far form from the cove | | the page's asserts |
| **AD8** | the open world's site; the Godot export; the gallery (a new settlement goes to the gallery when it reaches `main`) | | the export test; the gallery's card |

## 13. Questions for the owner

Questions 1 to 13 are answered (the table at the top; 10 by the Qiblai kit's session). One is open:

14. ~~**Building it.**~~ **Answered 2026-11-16: "build the page next"** (step AD6's first pass). The original question: Is the page the next step after the owner's answers, or does it wait until core/world has cut the
    isle on the new lake?
