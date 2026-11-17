# Misṭ-Gārḍan: the Order of Viridian Thought's head monastery and master tea and herb estate (plan, 2026-11-16)

The owner, 2026-11-16: *"can we find a site that's a great tea production site and place the head monastery of Qiblai's
green monastery there, the Order of Viridian Thought?"* Later the same day: *"plan the Viridian Thought head monastery /
master tea and medicinal herb farm"*.

This is a plan for the owner to approve. Some of it is built (section 12a):
- the Order's own buildings on a sheet (V3);
- the estate's records (V4, the data side);
- a first pass of the page at 1:1 (V6).

The page takes the plan's recommended answer where a question is open, marked *proposed* (section 12b). `SURVEY.md` holds
the site survey and `survey_site.py` re-runs it.
Each item is marked by where it comes from:
- **owner**: the owner's words;
- *brief*: the Xanadu sim session's brief for this plan;
- *proposed*: everything else.

The questions are in section 13.

## 0. What is settled, and what this plan proposes

**Settled:**
- The Order of Viridian Thought is **Qiblai's green monastery**, one of the eight on the Prismatic Council (**owner**). Its
  Qiblai house is the green spoke: `QSPOKE[3]`, bearing 135°, wall `0x3f7a44`, trim `XPAL.saffron`, band `0x1f3f24`
  (`kits/qiblai/src/89q0-qb-helpers.js:37`).
- **Its head monastery stands on a great tea site** (**owner**), with **a master tea and medicinal herb farm** (**owner**).
- **The site in the sim**: `T.viridian` in `core/region/data/xan-tune.js` puts it at **px 962,1562** on the Xanadu scarp, in
  province p5 (Siqārp, seat Kirstabal, `sl758m2396`). There it has 400 people and makes 40 t of tea a year in the flush.
  `road.viridian` runs from Qiblai (`skm4jjo2vl`, 922,1595), and check 24 is in `core/region/tests/test-xan-economy.js`. The
  numbers are the sim session's proposal; the pin is queued with the scale-model session.
- **Each monastery holds its own estates** (PROPOSAL-XANADU Q6).

**Proposed here:**
1. **Keep the pin.** The survey finds 962,1562 the best house site on the best tea ground within 100 km (section 1).
2. **Three herb grounds, set by climate**: the wet gardens at the house, the low bed at 500 m and the dry garden on the
   rain-shadow spur (section 5).
3. **The house in the hollow**: the cell is a west-facing hollow in the scarp's apron, with a stream down its axis. The house
   stands on a bench in the hollow's mouth, the Low Garden of tea on its flanks and the High Garden above (section 6).
4. **A doctrine**: the Order keeps the Song's Garden and holds that it is understood waking, with tea against sleep. It is
   the Azure Dream's opposite on the council (section 2).
5. **The records**: in this settlement's `src/`, on the Qiblai kit's helpers, in the green dress, with seeds **34200-34399**
   (section 7).
6. **The sim**: herbs as a good, a herb work, and the White Lily's hospital as a house in Qiblai that buys them (section 11).

## 1. The site (`SURVEY.md`)

**The cell, px 962,1562**, read from the model after the lake re-run (5f659c054). The re-run moved only Erehwon's lake, 80 km off.

| | |
|---|---|
| Height | **813 m** |
| Slope | **16 %**, facing **274°** (west) |
| Rain | **2,322 mm** |
| Temperature | mean **18 °C**; coldest month 11 °C; **coldest night +4 °C (frost-free)**; warmest month 25 °C; hottest afternoon 33 °C |
| Climate | **Cfb** (oceanic), no dry season |
| Wind | from the north-west, onto the scarp's west face |
| Biome | the `xanadu` kit (region `openworld/xanadu-oidong-highrift`) |
| Water on the model within 15 km | **none**; the nearest are two dry wadis, at 24 km and 30 km |

**What the ground is.** The cell lies on the apron at the scarp's foot. Row 1562 climbs 1,700 m in 12 km, from the valley
floor (185 m at x 956) to the scarp's top (2,523 m at x 968). Down its column, the cell is lower than the cells north and
south of it (907-1,085 m at y 1559-1560; 923 m at y 1564). So it is **a west-facing hollow in the apron**, about a cell across,
where mist pools and spring water gathers and runs west down the hollow to the valley.

**The mist belt is a strip.** It is 4-6 km wide along the scarp's foot, with 2,000-2,960 mm of rain. Westerly air banks
against the face. Rain falls off fast to the south-west: 1,066 mm at 959,1565, 6 km off, in a rain shadow.

**The frost line is at about 1,100-1,200 m.** The coldest night is 0 °C at 963 (1,142-1,206 m) and +4 °C at the house.

**Is it the best tea ground?** The survey ranked every dry cell in a 200 km square (9,313 cells) for mist tea, on rain, a mild
mean, a frost-free night, a workable slope, height and a C climate.
- **The fifteen best cells all lie on this strip.**
- **The site ranks third.**
- The two above it are its own upper slope, 2 km east: **963,1561** (1,206 m, 2,824 mm, 16 °C, 0 °C nights) and **963,1562**
  (1,142 m, 2,384 mm). They are cooler and wetter, which is the classic high-grown tea, but they sit on the frost line.

So the pin stands: it is the highest frost-free cell in the wettest strip. This plan puts the **High Garden** on 963,1561-1562
and the house on 962,1562. Moving the house up the slope is question 1; the recommendation is no.

**At 1:1.** core/world's `WORLD.H` reads the cells by Catmull-Rom, so the hollow becomes a gentle west-facing re-entrant
2-4 km across, sloping 12-20 %. The house's bench and the terraces need records of their own:
- the bench is a landform, `lf_viridian_bench`, requested through the scale-model session's queue after the owner approves
  the site;
- the terraces are `KRELIEF.terraces` in the page (section 10).

The region `openworld/xanadu-oidong-highrift` (box px 746-1636 x 1424-1714) already covers the cell.

**The road down to Qiblai.** Qiblai lies at **-1,860 m** in the basin (Af, 34 °C). From the house the road runs:
1. down the hollow, west, past the low bed (500 m);
2. south down the valley under the scarp (about 950,1572, near 0 m);
3. down **the basin's wall, 1,400 m in about 11 km** (940,1580 to 936,1584);
4. on to Qiblai.

It falls 2,670 m over 104 km in a straight line, 135 km by road (the tune's 1.3).

## 2. The Order of Viridian Thought (lore, proposed)

Nothing is written about the Order beyond its colour and its estate, so all of this is *proposed* (question 2):

- **The Order keeps the Song's Garden.** The faith of the Decree reads the poem in turnings (the Azure Dream plan names
  them). The Viridian take the Garden's: gardens bright with sinuous rills, and many an incense-bearing tree. Their head house
  is that garden made: terraces cut by rills, with camphor and temple cedar for incense.
- **Thought is a leaf.** It is plucked young, withered, rolled, fired, then steeped and drunk awake. The Order holds that the
  Song is understood by waking attention, not in dreams. On the council that makes it the Azure Dream's opposite: one Order
  sleeps for visions and the other drinks tea against sleep.
- **The Green Watch.** The Order's rite is a night of tea and disputation, held at the full moons of the flush. The teaching
  halls train the Prismarchy's disputants, the council's arguers.
- **Garden and Lily.** The Order grows the simples and the White Lily heals with them. The Order compounds the remedies and
  the Lily gives them, a compact as old as the council (section 5).
- **The master tea.** The High Garden's first flush is plucked by the monks alone and goes to the council and the Sultan's
  court. The estate keeps the Sultanate's mother bushes and nursery, and its cuttings stock the Scarp's tea villages.

## 3. Who lives on the estate (about 400, the sim's number)

| Who | People | |
|---|---|---|
| The Order | ~150 | the Master of the Garden (the head house's abbot: the Prismarch sits in Qiblai), ~10 masters and teachers, ~100 monks, ~40 novices |
| Lay families, working | ~190 | pluckers (~120), factory hands (~30 in the flush), gardeners and herb hands (~25), carters, porters and storemen (~15) |
| Lay families, not working | ~60 | children and elders |

**Is 400 right?** (question 7)
- The tune's tea crew is 0.6 x 400, so 240 people.
- A hand-plucker on fine plucking (a bud and two leaves) takes about 8-10 kg of green leaf a day. That is about 2 kg of made
  tea.
- The flush window is 90 days (`T.calendar`, days 40-130). So 240 pickers make about 43 t if all of them pluck. Some of them
  run the factory, so **40 t is just within reach**.
- The herb gardens need about 40 more hands. So either:
  - add them: **440 people** (recommended);
  - or take them from the same 400, and the tea falls to about 35 t;
  - or keep 400 and bring about 100 seasonal pluckers up from the Scarp's villages for the flush.
- For comparison, the lake's tea town Ṭī-Ṭeras makes 45 t with 2,000 people, but it is a mixed town. A specialist estate of
  400 making 40 t is at the top of the plausible range.

## 4. The tea

**Which tea** (question 4). *Proposed:* the master tea is **a pan-fired green tea**, the Order's colour in the cup: spread,
killed in the pan, rolled, fired dry. A second line is **a steamed, pressed and aged brick**, made from the Low Garden's
later leaf, for the caravans down to the basin's heat. A brick keeps where loose green tea goes stale.

**The gardens:**
- **The High Garden** (963,1561-1562; 1,040-1,200 m; about 50 ha). This is the master tea. The bushes are slow-grown on the
  frost line in the wettest cell (2,400-2,800 mm), plucked by the monks only, the first flush to the council. It is the
  survey's best cell.
- **The Low Garden** (the hollow's two flanks; 650-900 m; about 55 ha). This is the estate's main crop, plucked by the lay
  families.
- **Together about 105 ha**, at about 400 kg of made tea a hectare (hand-plucked, unfertilised): 40 t.
- **The nursery**: the mother bushes and the cuttings beds, beside the physic garden.

**The factory** (*brief*: withering, rolling, firing). Sized for the flush's peak, about 900 kg of made tea a day from about
4 t of leaf:
- **The withering lofts**: two ranges, 60 x 14 m, of three floors, with louvred walls and bamboo trays (about 5,000 m² of tray
  at 1 kg/m²). They stand on the bench's windward edge, open to the westerlies.
- **The rolling hall**: 36 x 14 m, with twenty rolling tables.
- **The firing hall**: 40 x 16 m, with sixteen charcoal woks in two rows and a chimney range. Next to it, the steaming room
  and the brick presses for the pressed tea.
- **The sorting and packing house**: winnowing, sieving and grading; the jars sealed and the bricks wrapped in bamboo leaf.
- **The tasting room**, where the buyers taste: in the buyers' court (section 6).
- **The charcoal store**, filled from the estate's coppice (cloud pine, Hyrcanian oak: the biome kit's fuel trees) and from
  Qāṭarāq's charcoal (p3).

## 5. The medicinal herbs

**What the estate can grow** (`kits/crops`, `CROPS.at`). The house's point is temperate, standard air and wet, and is the same
at dense air. Two more points come from the survey: the low bed (subtropic, humid, about 500 m) and the dry spur (temperate,
subhumid, about 1,070 mm). The list is the medicine, herb, reagent, spice, beverage and fuel records that fit any of the three.

**The wet gardens** (the house, 800-1,200 m). All of these are rain-fed, and none needs irrigation:

| Crop | Bucket | Use | Needs |
|---|---|---|---|
| **Mist tea** (`tea`) | beverage | the estate | |
| **Valley ginseng** (`valley-ginseng`) | herb, reagent | the tonic root, dug after seven years | **shade**: under the camphor grove |
| **Camphor crystals** (`camphor`) | reagent, herb | the liniment, steamed from the laurel's wood; clears the head | the grove's trees; the still |
| **Circle lichen** (`circlelichen`) | herb, medicine, dye | the antiseptic wash; a yellow to orange dye | the bare cut faces of the terraces' risers |
| **Rainbow bracket** (`rainbow-bracket`) | herb | the long-life tea | **shade**: the log yard |
| **Moon caps** (`moon-cap`) | mushroom, reagent | a mild dream mushroom (hazard: dreams) | **shade**: the log yard |
| **Bell-pod beads** (`bell-pod`) | berry, reagent | the sleeping draught (hazard: one bell is sleep, two is a day lost) | |
| **Temple-cedar incense** (`cedar-incense`) | fuel | the temple's incense | the grove |
| **Paper-maple syrup** (`maple-syrup`) | sweetener | the syrup base of the remedies | |

**The low bed** (961,1562, about 500 m, on the road up the hollow: warmth on the edge of subtropic, 2,200 mm):

| Crop | Bucket | Use | Needs |
|---|---|---|---|
| **Rimdew** (`rimdew`) | medicine | the cough and chest syrup; it eases cramps | a wet, sunny, nutrient-poor bog bed: the stream's tail |
| **Herbs** (`herbs`: lemongrass, ginger, basil) | herb | fevers, the stomach, the kitchen | |
| **Tobacco** (`tobacco`) | herb, medicine | a poultice and a purge | |

**The dry garden** (the rain-shadow spur, about 959,1565, 700 m, 1,066 mm). These would rot in the wet gardens, so they
grow 6 km off. All are rain-fed there:

| Crop | Bucket | Use |
|---|---|---|
| **Monk's sage** (`monks-sage`) | herb, fuel | a bitter for the stomach; incense |
| **Vale saffron** (`saffron`) | spice, dye | the physicians' saffron |
| **Juniper berries** (`juniper`) | spice | |
| **Umbel seed** (`umbel-seed`) | spice | |
| **Bench garlic** (`bench-garlic`) | spice, medicine | against the cold |
| **Cave madder** (`cave-madder`) | dye, medicine | the root |
| **Sky poppy** (`sky-poppy`) | reagent | the seed is the sleeping draught (hazard: sleep). The Scarp's opium is grown in the province and dried at Kirstabal; the Order grows only the physicians' poppy |
| **Peyote buttons** (`peyote`) | reagent | the seeing reagent (hazard: a day of visions) |

The wet crops (ginseng, bell-pod, moon-cap, bracket) would be "irrigated" on the dry spur at standard air, and "no" at dense
air. They stay in the wet gardens either way.

**Gathered wild, not grown.** The `xanadu` biome kit tags these plants medicinal (`biomes/xanadu/src/50-biome-xanadu-species.js`):

| Plant | Use |
|---|---|
| ginkgo | the memory tea |
| cloud pine | the resin salve |
| whorl olive | the fever leaf |
| frost willow | the pain tea from its bark |
| silverscrub | the wormwood bitter |
| beard tree | the wound moss |
| flame cypress | incense |
| hive lily | the midge smoke |

They are not `kits/crops` records. Question 5 asks whether they should become records, which would be a crops-kit change.

**Output** (*proposed*): **about 4 t of dried simples a year**, plus about 200 kg of camphor and the incense. It comes from
about 2 ha of the physic garden, 4 ha of the grove, the log yard, 0.5 ha of the low bed and 3 ha of the dry garden.

**The buildings for the herbs:**
- **The drying houses**: two open halls of slatted racks round a whitewashed court, with a smoke-free stove for the wet
  months. Kirstabal's latex house (`xa_latex_house`, on the Kirstabal plan's branch: drying halls of racks round a court) is
  the form to share.
- **The curing house**: a cool, dark store with root cellars for the ginseng and madder and the roots' sand beds.
- **The still-room**: copper stills and the camphor steam-still, with the syrup kitchen, the tincture shelves and the
  **Bitter Room**, a locked cupboard for the hazard reagents (bell-pod, moon-cap, sky poppy, peyote).
- **The dispensary**: in the buyers' court, a counter for the sick of the Scarp's villages and the pilgrims, and a few cots
  for the night. The hospital itself is the White Lily's in Qiblai.

**The White Lily.**
- Qiblai's white monastery, the Order of the White Lily, is the city's hospital (PROPOSAL-XANADU), and it is the herbs'
  natural buyer.
- The Kirstabal plan (`claude/kirstabal-plan-3bc37d`) has "the White Monastery (name TBD)" running the Scarp's latex house
  from a daughter house at Kirstabal. PROPOSAL-XANADU makes white the White Lily, so that is the same Order.
- *Proposed* split of the herbs: **70 % to the hospital in Qiblai**, 10 % to the Lily's daughter house at Kirstabal (93 km),
  and 20 % kept for the estate's dispensary and the green spoke's house in Qiblai.

## 6. The layout

**The frame.** The origin is the house's court at px 962,1562 (813 m).
- **u** runs up the hollow, bearing 94° (east, uphill).
- **v** runs along the contour, bearing 4°, positive north.
- Metres. Heights assume the cell's 1:1 slope (about 12 % below the house, 16-17 % above); they hold until core/world cuts
  the region.

| Part | u (m) | v (m) | Height | Size | From |
|---|---|---|---|---|---|
| **The head monastery** | 0 | 0 | 813 | | **owner** |
| **The tea estate** (High and Low Gardens) | | | | ~105 ha | **owner** (a great tea site); the two gardens *proposed* |
| **The medicinal herb farm** (the three grounds) | | | | ~10 ha | **owner**; the three grounds *proposed* |
| The road up the hollow from the valley (~957,1563, ~200 m), its lower gate and the **low bed** at its foot | -10,000 → -600 | ±200 | 200 → 735 | | *brief* (the road to Qiblai); the line *proposed* |
| **The pilgrims' and buyers' court**: the caravanserai, the hostel, the tasting room, the dispensary, the stables | -600 → -350 | -150 → +150 | 735-770 | 250 x 300 | *brief*; contents *proposed* |
| **The store-houses**: tea, grain, herbs, charcoal | -450 → -350 | +150 → +300 | 750-765 | | *brief* |
| **The tea factory**: two withering lofts on the windward (west) edge, the rolling hall, the firing hall, the packing house | -350 → -150 | -300 → 0 | 765-790 | 200 x 300 | *brief* (withering, rolling, firing); sizes *proposed* |
| **The herb drying and curing houses, the still-room** | -350 → -200 | +50 → +250 | 765-785 | | *brief*; *proposed* |
| The lay families' lines (two rows of houses), the school | -500 → -200 | -500 → -300 and +300 → +500 | 740-790 | | *proposed* |
| **The Green Gate** | -150 | 0 | 790 | | *proposed* |
| **The cloister and the assembly hall** (the dukhang facing west down the hollow) | -100 → +100 | -80 → +80 | 800-825 | as `qb_monastery` | *brief* |
| **The teaching halls** (two colleges, north and south of the cloister) | -50 → +100 | ±(100 → 180) | 805-830 | | *brief* |
| The Master's house; the refectory and kitchen; the bath | +100 → +200 | -150 → +150 | 830-845 | | *proposed* |
| The kora round the bench: chortens and a wheel house | ring | | 790-850 | ~2 km | *proposed* |
| **The physic garden** (the wet herbs: a walled garden of eight beds on the stream) and the **nursery** | +200 → +450 | -100 → +150 | 845-885 | 2 ha | *brief* (herb gardens); the form *proposed* |
| **The camphor grove** (ginseng under it), the **log yard** (moon caps, brackets) | +450 → +900 | -200 → +200 | 885-960 | 4 ha | *proposed* |
| The spring house and cistern, at the hollow's head | +1,000 | 0 | ~975 | | *proposed* (question 3) |
| **The Low Garden** (tea), on the hollow's two flanks | -900 → +900 | ±(300 → 1,200) | 650-900 | ~55 ha | *brief* (terraces); the form *proposed* |
| **The High Garden** (the master tea), with a pluckers' shelter and shrine | +1,400 → +2,400 | -300 → +300 | 1,040-1,200 | ~50 ha | *proposed* |
| **The dry garden** and its grange (a drying shed and a lodge for 10), 6 km south-west on the spur | ~-6,000 | ~-6,000 | ~700 | 3 ha | *proposed* |
| The cloud hermitages, on the face in the cloud bank (964,1561-1562) | ~+4,000 | ±500 | ~1,500 | | *proposed* (question 8) |

**How it reads.**
- Coming up the hollow, the road passes the low bed and then the lay lines.
- The buyers' court is the first big space, with the factory's lofts standing over it on the windward edge.
- The Green Gate opens on the cloister. Its assembly hall faces west, down the hollow toward the basin and Qiblai.
- The physic garden rises behind the cloister, then the dark camphor grove and the springs.
- The Low Garden's terraces fold round both flanks of the hollow. Above, the High Garden disappears into the cloud on the
  scarp's face.

**The terraces.** At 16-18 %, a 1.4 m rise gives a 7.8 m tread: a tea terrace of three hedge rows. The risers are stone-faced
on the High Garden and earth on the Low. Each tread carries a rill along its inner edge (the Garden's sinuous rills, section 2).

## 7. The buildings as kit records

Most of the head house is the Qiblai kit's own buildings in the green dress. The proposed dress follows the Azure Dream's
question 11 (question 6 here): **white wash on the estate's working buildings, and the green on the sacred buildings' upper
blocks**. As in Qiblai, the green is `QSPOKE[3]`'s.

**Reused** (keys on this branch's `kits/qiblai/src`, except where noted):

| Record | For |
|---|---|
| `qb_monastery` (the green spoke's dress) | the cloister and the assembly hall |
| `qb_college` | the two teaching halls |
| `qb_gate_temple` (green) | the Green Gate; the lower gate in a small form |
| `qb_court_house` | the Master's house |
| `qb_caravanserai` | the buyers' court |
| `qb_hostel` | the pilgrims' hostel |
| `qb_granary` | the store-houses |
| `qb_bath` | the bath |
| `qb_chorten`, `qb_kora_arcade`, `qb_kora_corner`, `qb_wheel_house`, `qb_shrine` | the kora, the High Garden's shrine, the wayside shrines |
| `qb_row_poor`, `qb_row_mid` | the lay families' lines |
| `qb_workshop` | the cooper, the basket maker, the potter of the tea jars |
| `qb_meditation_garden` | the form under the physic garden (as the Azure Dream's lotus garden takes it) |
| `qb_terrace_stair` | the stairs between the benches (from the kit's branch, now merged into this one) |

**New**, prefix **`qb_vt_`**. These are built (V3): the lot is each def's `w` x `d`, and every one stays on it within 0.3 m
(`tests/test-vt-records.js`):

| Record | What | Lot (m) | Fragment |
|---|---|---|---|
| `qb_vt_wither` (3 variants) | a withering loft: a wash ground storey, two timber storeys with louvres front and back, the tray racks seen through them, the roof lanterns; v1 shorter (40 m), v2 with the weighing yard under an awning | 62 x 28 | `89qv` |
| `qb_vt_roll_fire` | the rolling hall (twenty tables behind tall windows) and the firing hall (a stove bench with sixteen woks, a chimney to each pair), the steaming room and the brick presses at the west end | 54 x 32 | `89qv` |
| `qb_vt_pack` | the sorting and packing house, the winnowing yard, the sealed jars, the Order's chests | 31 x 18 | `89qv` |
| `qb_vt_tasting` | the tasting room: an open pavilion with a gilt crown, the cupping table with its bowls, the grade jars | 19 x 15 | `89qv` |
| `qb_vt_drying` | the herb drying house: two open rack halls round a white court, the mats, the closed store at the back | 41 x 31 | `89qv` |
| `qb_vt_still` | the still-room and dispensary: the counter window and the drawers of simples, the stills' flue, the Bitter Room, the camphor still in its side yard | 33 x 25 | `89qv` |
| `qb_vt_curing` | the curing house: a low cube over a sunk cellar, slit vents, a ramp to the cellar door | 21 x 24 | `89qv` |
| `qb_vt_shade` | the lath shade house over two ginseng beds | 24.5 x 12.5 | `89qw` |
| `qb_vt_log_yard` | the log yard: six cribs of logs under thatch, the caps and brackets, the soaking trough | 31 x 9 | `89qw` |
| `qb_vt_spring` | the spring house and cistern, the rill's head, a chorten | 12 x 13 | `89qw` |
| `qb_vt_grange` | the dry garden's grange: the walled yard, the lodge, the drying shed, two beds | 31 x 27 | `89qw` |
| `qb_vt_shelter` | the High Garden's pluckers' shelter: the cube, the lean-to and the basket rack, a chorten and a flag pole | 10 x 8 | `89qw` |
| `qb_vt_hermitage` (3 variants) | a cloud hermitage cell on its ledge, a flag pole | 6 x 6 | `89qw` |
| `qb_vt_terrace_plot` (Low, High) | the sheet's sample of two tea treads, three hedge rows each, the rill, the riser (earth or stone) and the path's steps | 24.5 x 16 | `89qw` |
| `qb_vt_physic` | the physic garden: eight beds either side of the axis rill, the nursery's cuttings beds, the pavilion at the head, the green-banded wall | 61 x 79 | `89qw` |
| tea hedges, herb beds | not buildings: `VTE` (`src/40-vt-estate.js`) traces the hedges along the terraces' treads and picks every bed's crop from `kits/crops` (section 12a); the page draws them (V6) | | `40` |

**Where they live.** The same arrangement the Azure Dream settled with the Qiblai kit's session (its PLAN.md section 6,
commit 12cb1eb1a):
- the new records live in **this settlement's own `src/`** (`settlements/viridian/src/`), written on the Qiblai kit's
  helpers (`qn*`);
- they are drawn on the kit's page as a target or a `--kit` folder;
- **the dress** is `QSPOKE[3]`'s wall, trim and band.

**Seeds 34200-34399 and the prefix `qb_vt_`: settled with the Qiblai kit's session (2026-11-16).** It is the block after the
Azure Dream's 34000-34199. Qiblai owns 33000-33999, and no source reseeds anywhere in 34200-34399.
- **The base branch.** Every reused def exists on the kit's branch, `claude/zealous-allen-0cd44d` (f5a10f8a4, unpushed).
  `qb_terrace_stair` is only there, so V3 builds from that branch, or after it merges.
- **The echo in the city.** The green monastery in Qiblai already has tea beds in its court: `qnTeaTouches`
  (`kits/qiblai/src/89q3-qb-sacred.js` on that branch, drawn under `SP.tea`). The head house's cloister court takes the
  same touches, so the city house and the estate read as one Order.

**Tags.** Every record has `culture:'qiblai'`, which is parked in `TODO.md`'s ride-along. Religious: the hall, the gate, the
chortens, the wheel houses, the hermitages. Industry: the factory, the drying, curing and still houses, the grange.
Agriculture: the shade house, the log yard, the shelter. Infrastructure: the spring house. Multi-family dwelling: the cells and
the lines.

The Xanadu kit's footprint test (`node kits/xanadu/tests/test-footprints.js`, copied for these records) runs on every new
record before it goes on a sheet.

## 8. Interiors and furniture

These rooms are furnished with `kits/interiors` and the catalog's Xanadu pieces, with new pieces listed in a `FURNITURE.md`
at V5:
- the assembly hall (the Green Watch's low tables and cups);
- the firing hall (woks, charcoal bins, cooling trays);
- the rolling hall (rolling tables);
- the withering lofts (tray racks);
- the tasting room (the cupping table, the spittoons, the grade jars);
- the still-room (stills, mortars, the drying sieves, the tincture shelves, the Bitter Room's locked press);
- the dispensary (the counter, the drawers of simples, a few cots).

The new pieces likely include the tea wok and stove, the rolling table, the tray rack, a copper still, the drawers of simples
and the cupping table. They go into the Xanadu culture file through the catalog's owner, as the Azure Dream's did.

## 9. Textures

The Xanadu pack and the Qiblai kit's pack cover the walls, roofs, gold and wood. **Question 10 is settled (the owner,
2026-11-16: "we can make new textures").** The library already holds most of what the estate needs, so only one set is
generated:
- **the trays and racks:** `fibre.cane`, the weathered bamboo basket weave, from the library;
- **the terraces' soil:** `ground.terrace.field`, or `ground.redsoil` on the High Garden, from the library;
- **the nursery's bush:** `card.crop.tea`, the crops kit's card, from the library;
- **the clipped hedges:** `foliage.tea.clipped`, **owed**. It is a new generic id (any clipped evergreen hedge can take
  it), and its prompt is in `core/materials/PROMPTS-NEEDED.md` section 57.

They become families in `settlements/viridian/materials.json`, packed by `python3 tools/textures/pack.py settlements/viridian`,
once the tea's set arrives. The library's three are wired then too, in one pack.

## 10. Core adoption (write in full before the first fragment)

The page is one pre-planned complex on a slope in the Xanadu style, so it **starts from `settlements/longsong`** (the
History Monks' monastery: the same kit lineage, the same `SINGLE_COMPLEX` exemption). Its buildings come from the Qiblai kit,
drawn on Xanadu's page.

| Module | Taken for |
|---|---|
| `core/rand` (`KRAND`) | every placement: the tea hedges' rows, the herb beds, the logs, the trays; seeds by (world, cell, index, salt), with `KRAND.child` for derived seeds |
| `core/world`, `core/terrain` (`KRELIEF.terraces`, `38c-core-landforms.js`) | the ground at 1:1 from the region; the bench landform; **the tea terraces as `terraces` records** (rise 1.4 m, held to each garden's polygon and height band); no `terrainH` of its own |
| `core/space` (`KSPACE`), `core/mask` (`KMASK.canvas`) | every footprint reserved before it is drawn; the beds and hedges kept off the paths; no `getImageData` |
| `core/tags` (`KTAGS`) | every record registered before it is drawn |
| `core/atmos` (`ATMOS.bindHost`) | the standard sky, and **the mist**: the cloud bank on the scarp's face and the morning fog in the hollow. If `core/atmos` has no low cloud bank on a slope, that is a question for core/atmos, not drawn here |
| `core/water` | the stream down the hollow, the rills along the terraces (flow), the cistern (still); no water shader of its own |
| `core/host` (`KHOST`), `core/walk` | camera, viewer, inspector, polygon tool, walk keys, probe, cut-away; the reach audit of the factory and the still-room |
| `core/door` | every door |
| `kits/crops` | the tea and every herb as records: what grows where (`CROPS.at`), the beds' contents (`CROPS.pick` with the house's seeds), the cards |
| `core/biome`, `biomes/xanadu` | the grove (camphor, temple cedar), the coppice, the wild medicinal plants of section 5, the forest above the gardens |
| `kits/catalog` through `core/catalog` and `core/furnish`, with `kits/interiors` | every room's furniture |
| `core/hamlet` | the valley village if the owner wants one (question 9) |
| `core/city` | **not taken**: a single complex, exempt like Longsong (`SINGLE_COMPLEX` in `tools/check_core_use.py`) |
| `core/simulation`, `core/sched`, `core/clock` | the estate's people; the plucking day in the flush (out at first light, the leaf weighed at noon and dusk, the factory working into the night); the Green Watch as a clock event |
| `core/charactermodels` | monks, pluckers with back baskets, buyers, the sick at the dispensary |
| `core/materials` | the Xanadu and Qiblai packs through `materials.json` and `tools/textures/pack.py` |
| `core/export`, `core/lod`, `core/minimap` | the Godot export; the far forms (the green hall and the High Garden seen from the valley); the minimap |
| `core/engine` | **not taken**: the Qiblai kit is on `VERN.def` through the Xanadu kit |

`python3 tools/check_core_use.py` is run before the page is called done. Every check in `tools/checks_optin.json` lists the
build from its first commit (a new build), and its `build.py` and `verify.py` start from `tools/new_build/`.

## 11. The economy (for the sim session; not done here)

`core/region/data/xan-tune.js` and its tests belong to the Xanadu sim session. This is the proposal, nothing is edited:

1. **A good**: `herbs:{unit:'kg'}`, the dried simples (camphor and incense included, or `camphor` apart if the sim wants it).
   It has no single crop link: it is a basket of the section 5 records.
2. **A calendar window**: `'herb-cut':[100,290]`, the leaves in summer and the roots in autumn.
3. **`T.viridian`**: add `herbs:4000`. **People 440 (the owner: "440")**, with the tea crew at 0.55 of them and the herb crew
   at 0.1.
   A second work, beside the tea:

   ```js
   {id:V2.id+'.herbs',kind:'herb-garden',name:'the physic gardens, the camphor grove and the dry garden',
    crew:Math.round(V2.people*.1),out:['herbs'],rate:rate(V2.herbs,crew,win('herb-cut')),season:'herb-cut'}
   ```
4. **The road carries them**: `road.viridian`'s share becomes `{tea:.85, herbs:.9}`. The want is unchanged; the herbs ride
   with the tea.
5. **The White Lily as a house in Qiblai**, on the saffron house's pattern:
   - `T.lilyHouse=['qb.lily','The Order of the White Lily\'s monastery and hospital at Qiblai (the council\'s white spoke)','skm4jjo2vl',921.893,1594.893,300]`;
   - the white spoke is `QSPOKE[7]`, bearing 315°, at the saffron monastery's radius (x -213.8, z -213.8 m from the centre);
   - `house('lily')(T.lilyHouse,{herbs:V2.herbs*.7/yr})`, so it buys its 70 % from Qiblai's market by want;
   - 300 people is a guess for the monks and the standing sick; the sim session sets it.
6. **Kirstabal's share** (10 %): a want at the White Lily's daughter house, once the Kirstabal plan's house is in the sim.
   The 70 / 10 / 20 % split is the owner's ("sure", 2026-11-16).
6a. **The dream reagents to the Azure Dream** (the owner: "sure"). Bell-pod and moon caps, about 150 kg a year out of the 20 %
   kept, go to Grēṭ-Āil's Hall of Dreaming. They ride the road to Qiblai with the herbs, then go on by Erehwon's barge. In the
   tune that is a want of `herbs` at the Azure Dream's house (`lk.great-isle`, or its head house once the sim splits it),
   about 150/yr, filled from Qiblai's market.
7. **A check**, the next free number (25 if 24 is still the last): over a year, the hospital receives at least half the
   estate's herbs, with a negative where the road's herb share is 0.
8. **Not proposed yet**: what the hospital gives back (the sick's working days, PROPOSAL-XANADU), and the master tea's
   separate grade to the council and the court (a `tea-fine` good). Both wait on the owner.

**The road's time.** The tune counts 135 km at 25 km a day, a 5-6 day road. Loaded up the basin's wall (1,400 m in 11 km)
the climb may want 20 km a day for the up-leg. That is the sim session's call.

**Food: the valley village** (the owner, question 9: "y").
- The estate eats the rural diet. Most of its grain would come up from Qiblai, 2,670 m below.
- The village is a `core/hamlet` farming village of about 150 people on the valley floor, at about 958,1561 (180-300 m, Cfa,
  1,800-2,000 mm), where rice can be paddy. It feeds part of the estate.
- In the tune it is a hamlet under `qb.viridian`. A work of `grain` sized to its fields (about 40 t a year, *est.*) goes up a
  short road to the estate, 10 km and a day, which takes the estate's grain want down by as much. The Qiblai road keeps the
  rest of the grain, the salt and the tools.
- The village's pin is requested; its page is V7.

## 12. Steps

| Step | What | Who | Proved by |
|---|---|---|---|
| **V0** | this plan and `SURVEY.md`; the owner's answers to section 13 | this session, the owner | |
| **V1** | the map: the bench landform `lf_viridian_bench` (the house's bench, about 350 x 400 m at ~800-845 m, centre px 962,1562); pins for the dry garden's grange, the hermitages and the valley village if wanted; the road's line up the hollow | the scale-model session's queue | the pins' ground; core/world's stamp at 1:1 |
| **V2** | the sim (section 11): herbs, the herb work, the White Lily's house, the people | the Xanadu sim session | its economy test and the new check |
| **V3** | the new `qb_vt_*` records in `settlements/viridian/src/` on the Qiblai kit's helpers and `QSPOKE[3]`'s dress, seeds 34200-34399, on a sheet beside the green monastery, the cloister court with `qnTeaTouches`; built from `claude/zealous-allen-0cd44d` or after it merges | this settlement | the footprint test; the sheet's `verify.py --assert` |
| **V4** | the terraces (`KRELIEF.terraces` per garden), the tea hedges and the herb beds placed from `kits/crops` by `KRAND`; a node test that every hedge stands on a tread, every bed's crop fits its ground (`CROPS.at`), and the same seeds give the same beds | this settlement | `node settlements/viridian/tests/test-vt-estate.js` (`tools/ktest.js`, each check with its negative) |
| **V5** | the interiors: the factory, the still-room, the dispensary, the assembly hall; the new catalog pieces | this settlement; the catalog's owner | `core/walk` reach in node; the page's `--interiors` assert; `kits/catalog/verify.py --assert` |
| **V6** | the page, `settlements/viridian`, started from Longsong: the hollow on core/world's ground, the bench, the terraces, the stream and rills on `core/water`, the mist on `core/atmos`, the plucking day on `core/sched`, people | this settlement | `verify.py --assert` on a GPU lane; `check_core_use` |
| **V7** | the dry garden's grange and the hermitages as stations; the valley village (`core/hamlet`) if wanted | | the page's asserts |
| **V8** | the open world's site in `xanadu-oidong-highrift`; the Godot export; the gallery (a new settlement goes to the gallery when it reaches `main`) | | the export test; the gallery's card |

## 12a. Built so far (2026-11-16)

The owner asked for the next steps where the open questions do not block them. Those are V3 and V4's data side. V1 waits on
the site (question 1), V2 is the sim session's, and V5-V8 wait on the page (question 13).

**V3, the records on a sheet.** `settlements/viridian` is a target on Xanadu's page, as the Azure Dream's and Kirstabal's
are.
- `dist/viridian-sheet.html` shows the fifteen `qb_vt_*` records (section 7) at every variant in three rows (the tea works,
  the herbs, the estate), with Qiblai's green monastery beside them.
- The records are written on the Qiblai kit's helpers, in `QSPOKE[3]`'s dress, with seeds 34201-34341.
- `VT_DRESS` is the one switch for question 6: white wash on the working buildings (the recommendation), or green walls
  throughout.
- **Tested:** `tests/test-vt-records.js` builds every def at every variant headless (the Xanadu kit's bundle with the
  Qiblai kit) and checks it stands on its lot within 0.3 m, that every seed is in the block and the dress is the green
  spoke's. 8 checks pass, each negative failing its fault. `verify.py --assert` adds `viridian-laid` to Xanadu's
  invariants.
- **GPU verify:** it passes on the rtx lane (2026-11-16, the page of c4d2e0889). `viridian-laid` finds 20 builds and the
  green monastery. The scene is 1.03M triangles of a 3M budget, 35 draw calls, 26,063 baked instances; the largest build is
  the physic garden. The shaders, textures, geometry and eye checks are clean.

**V4, the estate as records** (`src/40-vt-estate.js`, `VTE`, `[G data]`):
- the three gardens as `KRELIEF.terraces` records: a 1.4 m rise, the Low Garden's earth risers (0.22 of a step) and the
  High Garden's stone faces (0.15), each held to its polygon and height band;
- **the hedge rows**: traced as contours of the step coordinate along each tread, three rows to a tread at 0.3, 0.56 and
  0.82 of it, walked at 0.8 m. The terraces' wobble is read through `KRELIEF`'s own public `shape` and `at`, so nothing
  in core/terrain is copied;
- **the beds**: five places on three grounds (the physic garden, the shade house and the log yard on the wet ground, the
  low bed, the dry garden), every crop from `kits/crops` (`CROPS.at`, `CROPS.pick` with seed 34361), all rain-fed, the
  shade crops in the shade only;
- **tested:** `tests/test-vt-estate.js`, 17 checks, on a stand-in ground with the cell's slopes and the hollow's flanks.
  core/world's ground replaces it at V6.

**What the beds came out as:**

| Place | Crops |
|---|---|
| the physic garden | ginkgo leaf, frost-willow bark, beard moss, cloud-pine resin, bell-pod, camphor, circle lichen, paper-maple syrup (with the Vale's six as crop records, question 5; before them bell-pod, camphor and circle lichen) |
| the shade house | valley ginseng |
| the log yard | moon caps and rainbow brackets |
| the low bed | rimdew, herbs (lemongrass, ginger, basil) and tobacco |
| the dry garden | the plan's eight |

**Found on the way:**
- **The wet ground's open beds were thin in `kits/crops`**: only three crops fit there that are not shade crops. The owner
  answered question 5 "y", and the Vale's six plants are records now (`kits/crops/src/24-crop-vale-wild.js`).
- **Every prayer-flag rope is drawn half its length past its far end** (the Xanadu and Qiblai kits' `xnPennants`). It
  draws its rope with `beam()`, which centres the geometry, but `vRope` (`kits/iziz-vernacular/src/69b-vern-mat.js`) is
  a cylinder based at 0. The fix belongs to the kits' owners (`KNOWN_ISSUES.md`). The small records here stand their
  flags on a pole instead.

**V6, the page, a first pass** (the owner, 2026-11-16, by way of the openworld-sites session: "Have daughter sessions
continue next step of build"; where a question is open, the plan's recommended answer, section 12b).

`dist/viridian.html` is the second target of the same build (`targets/estate`), on Xanadu's page as the Azure Dream's is.

- **The ground:**
  - the scale model's cut round px 962,1562 (`region/`: 938-986 x 1538-1586, 500 m cells, `extract_region.py` on this
    branch's model), through core/world's fields at 1:1. The site's cell is unchanged from the survey;
  - the near ground is 8 m cells over 4 x 2.8 km; the fine ground is 2.5 m cells round the house and the Low Garden's
    nearest treads, where every tread and riser reads; the far ground covers the whole cut.
- **What the 1:1 ground is here:**
  - a west-facing slope of about 17 %;
  - the hollow centred about 100 m south of the court (768 m), its flanks rising to about 830 m;
  - **core/world's own benches**: 25 m scarplets every 300-400 m (its detail style for this relief). The tea terraces ride
    over them.
- **The terraces** are the three gardens (`VTE.terraces`), each held to the heights its ground really has:
  - the Low Garden's north flank 602-978 m and its south flank 643-965 m;
  - the High Garden 1,009-1,221 m.
- **The places**: 49 of the plan's buildings on 24 pads, with 411 retaining faces; with the cloud hermitages (question 8), 52 and
  422.
  - The head house's **bench** is one level at 792 m (the ground under it 763-817 m), 208 x 216 m. On it stand the great
    monastery in the green dress (`qb_monastery` v3, the tea touches in its court), its gate facing west down the hollow,
    the two colleges, the Master's house and the refectory in the green spoke, the bath, the wheel house and four kora
    chortens.
  - Below the bench: the Green Gate and its chortens; the buyers' court (the caravanserai, the tasting room, the hostel,
    the still-room and dispensary); the tea works south of the way (two withering lofts, the rolling and firing hall, the
    packing house, three stores); the herb houses north of it; the lay families' two lines.
  - Above the bench: the physic garden, the shade house and the log yard, the spring house, and the pluckers' shelter in the
    High Garden.
- **The tea:**
  - every row on every tread traced (`VTE.hedges`), 1.46 million dabs painted on the near ground;
  - drawn whole on the fine ground as 149,461 clipped blocks, each on its tread.
- **The flora** is the Vale of Xanadu's biome: forest on the open slopes, a shade tree here and there in the tea.
- **The mist** is the sky's fog, thickened, so the scarp's top goes grey.
- **Checked:** `verify.py` adds `estate-laid`, `bench-level`, `terraces-cut` and `tea-on-treads`; all four pass in the
  in-app browser, and **the GPU verify passes on the rtx lane** (2026-11-16, the page of a7e376a92):
  - every universal assert is clean;
  - 15.9M of 16M triangles at the overview, 324 draw calls;
  - the eye stands clear in all eight views.

  The overview sits at the budget's edge, so the next pass thins the far tea or the flora (`KNOWN_ISSUES.md`).
- **With the hermitages** (the near ground run to x 4,400 m) and the Vale's flora at 0.55 of its quality, the page passes again
  on the rtx lane. It has 52 places, 15.1M of 16M triangles at the overview, and the eye is clear in six views, the cloud
  hermitages among them.

## 12b. The owner's answers, and what is still assumed

**Answered (the owner, 2026-11-16):**

| Question | The answer | Done |
|---|---|---|
| 4, the tea | "a pan-fired green master tea plus a pressed brick for the caravans to the basin" | as built: the works, the steaming room and the brick presses |
| 5, the wild medicinal plants | "y": crop records | the Vale's six as `kits/crops` records: ginkgo leaf, cloud-pine resin, frost-willow bark, beard moss, whorl-olive leaf, silverscrub (`kits/crops/src/24-crop-vale-wild.js`, opt-in). The physic garden grows eight crops (was three) and the dry garden ten |
| 6, the dress | "white with green dress" | as built (`VT_DRESS` 'wash') |
| 7, the people | "440" | section 11; the tune is the sim session's |
| 8, the cloud hermitages | "y" | three on the scarp's face at 1,445-1,493 m, with their path up from the High Garden (the near ground now runs to x 4,400 m) |
| 9, the valley village | "y" | a `core/hamlet` farming village on the valley floor (section 11, the pin requested); its page is V7 |
| 10, textures | "we can make new textures" | section 9: `foliage.tea.clipped` owed, the rest from the library |
| 11, the White Lily's share | "sure": 70 / 10 / 20 %, and the dream reagents to the Azure Dream | section 11 |
| 12, the name | "sure" | **Misṭ-Gārḍan** (the Mist Garden); the page is titled so |
| 13, building it | "keep going and ask for reshape" | the page goes on. **The four pins are in** (the scale-model session, b0c7d14b0 on `claude/gemini-trade-reconcile`, SETT_ADDED 5.1e13, unpushed): `sviridian001` Misṭ-Gārḍan 962,1562 (type village: the map has no monastery type), `sviridhermt1` the hermitages 964,1562 (1,471 m), `sviridgrang1` the grange 959,1565, `sviridvill01` the valley village at 959,1561 (181 m; moved from 958,1561, which reads 135 m: c7ef8508c). **`lf_viridian_bench` waits on a `bench` kind** in core/world's landform stamper (`core/world/41l-world-landforms.js` knows island, islet, stack, shoal; any other kind is skipped). The kind takes centre, w x l, rotation, level; it cuts uphill, fills downhill on a batter, blends a skirt, and reports its cut and fill. Once it exists, the record (792 m, 208 x 216 m at 962.032,1562) goes in the queue |

**Still open, the page assuming the plan's recommendation (*proposed*):**

| Question | Taken |
|---|---|
| 1, the site | the house at 962,1562; the High Garden on 963,1561-1562 |
| 2, the doctrine | not drawn; the lore stays proposed |
| 3, the water | the spring house is drawn; the spring line and the stream are not water yet |

## 13. Questions for the owner

1. **The site.** **Keep the house at 962,1562** (recommended): 813 m, frost-free, 2,322 mm, with the master tea's High Garden
   2 km up the slope at 963,1561-1562 (1,140-1,210 m, 2,400-2,800 mm, on the frost line). Or move the house itself up to
   963,1561: wetter and mistier, but with frost on the coldest nights. Either way the pin stays in this strip, the best tea
   ground in a 200 km square.
2. **The doctrine** (proposed): the Order keeps the Song's Garden, holds that the Song is understood waking, and drinks tea
   against sleep as the Azure Dream's opposite on the council, with the Green Watch as its rite. Keep it?
3. **The water.** The model has no stream within 15 km; the plan gives the hollow a spring line and a stream (2,300-2,900 mm
   falling on the scarp makes it sound). Is a spring-fed stream below the model's grid all right, or should the scale-model
   session add a stream to the model?
4. *(answered 2026-11-16: section 12b)* **The tea.** A pan-fired green master tea, and a pressed brick for the basin's caravans? Or another kind: an oolong, a
   black tea, or green only?
5. *(answered 2026-11-16: section 12b)* **The wild medicinal plants.** The `xanadu` biome's medicinal plants (ginkgo, cloud pine, whorl olive, frost willow,
   silverscrub, beard tree) are not crop records. Make them `kits/crops` records so the estate can grow them (a crops-kit
   change and its test), or keep them gathered wild?
6. *(answered 2026-11-16: section 12b)* **The dress.** White wash with the green on the sacred buildings' upper blocks (recommended, matching the Azure Dream's
   question 11), or the green walls throughout?
7. *(answered 2026-11-16: section 12b)* **The people.** 440 (400 plus 40 for the herbs: recommended), 400 with the tea down to about 35 t, or 400 with about 100
   seasonal pluckers in the flush?
8. *(answered 2026-11-16: section 12b)* **The cloud hermitages** on the face at about 1,500 m: in, or not?
9. *(answered 2026-11-16: section 12b)* **A valley village** on the floor below the hollow (about 957,1561, rice and grain, 100-200 people) to feed the estate, or
   all its grain from Qiblai?
10. ~~**Textures.**~~ **Settled (the owner, 2026-11-16): "we can make new textures".** One set is owed,
    `foliage.tea.clipped` (`core/materials/PROMPTS-NEEDED.md` section 57); the trays, the soil and the nursery's bush come
    from the library (section 9).
11. *(answered 2026-11-16: section 12b)* **The White Lily's share.** 70 % of the herbs to the Qiblai hospital, 10 % to the Lily's house at Kirstabal and 20 % kept:
    right? And should the dream reagents (bell-pod, moon caps) also go to the Azure Dream's Hall of Dreaming?
12. *(answered 2026-11-16: section 12b)* **A name** for the head house and its estate. A working name is *Misṭ-Gārḍan* (the Mist Garden), in the tune's spelling
    of Ṭī-Ṭeras and Gārḍan.
13. *(answered 2026-11-16: section 12b)* **Building it.** Is the page the next step after the answers, or does it wait until core/world cuts the region on the
    scarp?
