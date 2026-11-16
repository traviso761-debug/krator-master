# The Order of Viridian Thought: its head monastery and master tea and herb estate (plan, 2026-11-16)

The owner, 2026-11-16: *"can we find a site that's a great tea production site and place the head monastery of Qiblai's
green monastery there, the Order of Viridian Thought?"* Later the same day: *"plan the Viridian Thought head monastery /
master tea and medicinal herb farm"*.

This is a plan for the owner to approve. Nothing is built. `SURVEY.md` holds the site survey and `survey_site.py` re-runs it.
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
| `qb_terrace_stair` | the stairs between the benches; it is on the kit's own branch (`claude/zealous-allen-0cd44d`), not yet on this one |

**New**, prefix **`qb_vt_`** (*proposed*; sizes are estimates):

| Record | What | Size (m) | Budget (tris) |
|---|---|---|---|
| `qb_vt_wither` | a withering loft: three floors, louvred walls, the tray racks seen through them | 60 x 14, 12 high | 60k |
| `qb_vt_roll_fire` | the rolling hall and the firing hall in one range: the tables, sixteen woks, the chimney range, the steaming room and presses | 40 x 32 | 80k |
| `qb_vt_pack` | the sorting and packing house, with the winnowing yard | 30 x 16 | 30k |
| `qb_vt_tasting` | the tasting room: a pavilion with a long table, the cups set out to the north light | 18 x 12 | 25k |
| `qb_vt_drying` | the herb drying house: slatted racks round a white court (Kirstabal's `xa_latex_house` is the form) | 40 x 30 | 50k |
| `qb_vt_still` | the still-room and dispensary: the stills, the camphor still, the syrup kitchen, the Bitter Room, the counter | 30 x 20 | 50k |
| `qb_vt_curing` | the curing house: a half-sunk cube with root cellars | 20 x 14 | 20k |
| `qb_vt_shade` | a lath shade house for the ginseng beds where the grove is thin | 24 x 12 | 10k |
| `qb_vt_log_yard` | the log yard: stacked inoculated logs under a thatch roof on posts | 30 x 10 | 15k |
| `qb_vt_spring` | the spring house and cistern: a cube over the spring, a stone tank, the head of the rills | 12 x 12 | 15k |
| `qb_vt_grange` | the dry garden's grange: a lodge, a drying shed, a walled yard | 30 x 24 | 30k |
| `qb_vt_shelter` | the High Garden's pluckers' shelter, with a shrine and a basket rack | 10 x 8 | 8k |
| `qb_vt_hermitage` | a cloud hermitage cell on the face | 6 x 6 | 5k |
| tea hedges, herb beds | flora on the terraces' treads, not buildings: the crops kit's records placed by `KRAND` (section 10) | | instanced |

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

The Xanadu pack and the Qiblai kit's pack cover the walls, roofs, gold and wood. Two surfaces may want sets of their own. They
go to `core/materials/PROMPTS-NEEDED.md` only if the owner wants them (question 10):
- **bamboo tray weave**, for the withering trays and the drying racks;
- **tea-hedge foliage**, a clipped, glossy dark-green leaf mass for the hedges' tops, unless the crops kit's or the Oidong
  kit's tea card serves.

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
3. **`T.viridian`**: add `herbs:4000`. People are 440 (question 7), with the tea crew at 0.55 of them and the herb crew at 0.1.
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
7. **A check**, the next free number (25 if 24 is still the last): over a year, the hospital receives at least half the
   estate's herbs, with a negative where the road's herb share is 0.
8. **Not proposed yet**: what the hospital gives back (the sick's working days, PROPOSAL-XANADU), and the master tea's
   separate grade to the council and the court (a `tea-fine` good). Both wait on the owner.

**The road's time.** The tune counts 135 km at 25 km a day, a 5-6 day road. Loaded up the basin's wall (1,400 m in 11 km)
the climb may want 20 km a day for the up-leg. That is the sim session's call.

**Food.** The estate eats the rural diet, and its grain comes up from Qiblai 2,670 m below. If the owner wants a valley
village (question 9), a `core/hamlet` farming village on the valley floor (about 957,1561: 180-300 m, Cfa, 1,800-2,000 mm,
where rice can be paddy) could feed part of it.

## 12. Steps

| Step | What | Who | Proved by |
|---|---|---|---|
| **V0** | this plan and `SURVEY.md`; the owner's answers to section 13 | this session, the owner | |
| **V1** | the map: the bench landform `lf_viridian_bench` (the house's bench, about 350 x 400 m at ~800-845 m, centre px 962,1562); pins for the dry garden's grange, the hermitages and the valley village if wanted; the road's line up the hollow | the scale-model session's queue | the pins' ground; core/world's stamp at 1:1 |
| **V2** | the sim (section 11): herbs, the herb work, the White Lily's house, the people | the Xanadu sim session | its economy test and the new check |
| **V3** | the new `qb_vt_*` records in `settlements/viridian/src/` on the Qiblai kit's helpers and `QSPOKE[3]`'s dress, seeds 34200-34399, on a sheet beside the green monastery, the cloister court with `qnTeaTouches`; built from `claude/zealous-allen-0cd44d` or after it merges | this settlement | the footprint test; the sheet's `verify.py --assert` |
| **V4** | the terraces (`KRELIEF.terraces` per garden), the tea hedges and the herb beds placed from `kits/crops` by `KRAND`; a node test that every hedge stands on a tread, every bed's crop fits its ground (`CROPS.at`), and the same seeds give the same beds | this settlement | `node settlements/viridian/tests/test-estate.js` (`tools/ktest.js`, each check with its negative) |
| **V5** | the interiors: the factory, the still-room, the dispensary, the assembly hall; the new catalog pieces | this settlement; the catalog's owner | `core/walk` reach in node; the page's `--interiors` assert; `kits/catalog/verify.py --assert` |
| **V6** | the page, `settlements/viridian`, started from Longsong: the hollow on core/world's ground, the bench, the terraces, the stream and rills on `core/water`, the mist on `core/atmos`, the plucking day on `core/sched`, people | this settlement | `verify.py --assert` on a GPU lane; `check_core_use` |
| **V7** | the dry garden's grange and the hermitages as stations; the valley village (`core/hamlet`) if wanted | | the page's asserts |
| **V8** | the open world's site in `xanadu-oidong-highrift`; the Godot export; the gallery (a new settlement goes to the gallery when it reaches `main`) | | the export test; the gallery's card |

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
4. **The tea.** A pan-fired green master tea, and a pressed brick for the basin's caravans? Or another kind: an oolong, a
   black tea, or green only?
5. **The wild medicinal plants.** The `xanadu` biome's medicinal plants (ginkgo, cloud pine, whorl olive, frost willow,
   silverscrub, beard tree) are not crop records. Make them `kits/crops` records so the estate can grow them (a crops-kit
   change and its test), or keep them gathered wild?
6. **The dress.** White wash with the green on the sacred buildings' upper blocks (recommended, matching the Azure Dream's
   question 11), or the green walls throughout?
7. **The people.** 440 (400 plus 40 for the herbs: recommended), 400 with the tea down to about 35 t, or 400 with about 100
   seasonal pluckers in the flush?
8. **The cloud hermitages** on the face at about 1,500 m: in, or not?
9. **A valley village** on the floor below the hollow (about 957,1561, rice and grain, 100-200 people) to feed the estate, or
   all its grain from Qiblai?
10. **Textures.** Ask for bamboo tray weave and tea-hedge foliage (section 9), or stay on the packs?
11. **The White Lily's share.** 70 % of the herbs to the Qiblai hospital, 10 % to the Lily's house at Kirstabal and 20 % kept:
    right? And should the dream reagents (bell-pod, moon caps) also go to the Azure Dream's Hall of Dreaming?
12. **A name** for the head house and its estate. A working name is *Misṭ-Gārḍan* (the Mist Garden), in the tune's spelling
    of Ṭī-Ṭeras and Gārḍan.
13. **Building it.** Is the page the next step after the answers, or does it wait until core/world cuts the region on the
    scarp?
