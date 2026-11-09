# Godshearth: the plan (2026-11-09)

Godshearth (`rmw4wou2y1hhc`) is a caldera let down into the Godthrone's southern flank, above the Vale of Xanadu. Gemini
lowered it about 3 km, from the flank's 6.4-7 km to a floor at 3.6-4.1 km, so the air in it is Earth's sea-level air
(1.0 atm) inside walls that stay frozen and thin-aired. Gemini's brief for it: a Yellowstone-like geothermal basin where the
**Hearths** (`biomes/hearths/PLAN.md`), Krator's native heat-eating life, grow as a whole country rather than as a disc round
one vent.

This plan replaces Gemini's draft (2026-11-06) and keeps its facts. The carving is already on the model; nothing else is built.
It is a kit for the rebuild's queue, after the frozen integration pass. Names marked **TBD** are the owner's. What changed from
the draft is listed at the end.

## 1. What the map carves (Gemini, map 5.1)

The region is in `tools/scale-model/smodel/nw_expansion.py` (l. 2734, no note). The carving is
`tools/scale-model/build_425_master.py`: the caldera, spillway, lake and station pins at l. 1109-1203, the pins again at l. 3962,
the climate at l. 4164, the paint at l. 4865. The numbers below were read from the model (`smodel.page`, 2026-11-09, at
`gemini/scale-model-5.1-r3`, dfdf64d1a), the polygon masked with `matplotlib.path.Path.contains_points`.

- **Size:** 2,148 height cells of 2 km, about 8,600 km² (the draft's 2,187 cells came from another mask). It spans 5.1 px
  x 808-880, y 1371-1451: a main bowl about 144 by 80 km, and a thin tail running south to px 845,1451, the spillway.
- **Whose ground:** 2,099 of its cells (98%) lie inside the Godthrone's polygon (`rmvkkebdukgx7`). The rest touch Xanadu's biome
  (35 cells), the Xanadu Sultanate (26) and the Rift (12). Godshearth is a hole cut in the Godthrone kit's south flank.
- **How it is cut** (the code): a signed distance to the polygon, warped by noise and scalloped round the thermal centre
  (843,1392), sets a weight. Inside, the floor is 3,644 m at the centre, rising 340 m outward. Between the floor and the old
  flank, a **listric slump collar** about 24-28 px wide keeps the Godthrone's ridges and gullies (`dE_gh_med`, `dE_gh_hp`) and
  holds an intermediate bench at about 4,180-4,860 m. A spillway valley is carved along x about 845 from y 1394 to 1451.
- **Heights inside:** p1/p5/p25/p50/p75/p95/p99 = 3,239 / 3,438 / 3,732 / 3,964 / 4,040 / 4,442 / 5,111 m. Lowest 3,142 m at
  845,1451 (the spillway's end); highest 5,915 m at 874,1398 (the east rim).

  | Band | Cells | Share |
  |---|---|---|
  | 3,000-3,500 m (the spillway) | 148 | 7% |
  | **3,500-4,000 m** (the floor) | 1,113 | **52%** |
  | 4,000-4,500 m (the benches) | 797 | 37% |
  | 4,500-6,000 m (the rim inside the line) | 90 | 4% |

  It is flat: median slope 0.8°, p90 5.4°, p99 12.8° on the 2 km grid.
- **The walls** stand outside the polygon. In a ring 12 px (24 km) wide round it, p10/p50/p90 = 3,356 / 4,621 / 7,234 m.
  - **West:** along y 1392 the ground falls from 7,872 m (x 800) to 4,277 m (x 810): 3.6 km in 20 km.
  - **North:** along x 845, from 7,581 m (y 1360) to 4,664 m (y 1370) and 4,024 m (y 1375): about 3.5 km in 30 km.
  - **East:** a rim of 4.5-5.9 km at x 874-885.

  The draft's "3,000 m ring-fault headwall" is right in kind; the walls are 3-4 km high.
- **The spillway:** along x 845 the floor falls from 3,647 m (y 1395) to 3,484 m (y 1410), 3,389 m (y 1420) and 3,180 m
  (y 1445). Past the polygon's tip it drops off the shield: 2,282 m at y 1455, 1,752 m at 843,1460, 1,285 m at 845,1470.
  **About 1.4 km of fall in 20 km at the tail's end**: the cataract the draft wanted, just outside the polygon.
- **Water:**
  - **One lake**, the hot lake (the draft's "Grand Prismatic Hearth Lake"): 18 cells, about 72 km², level 3,642 m, bed
    3,636 m, centre px 839,1394, class WH. The draft's radius of 8 km is about 5 km on the model.
  - **No river record** crosses the polygon (`rivers.json`). The spillway valley is carved but carries nothing: the lake has
    no outlet on the model. The nearest records lie just south-west of the tail, all in the Xanadui tongue:
    - **Rīfar al-Bihār** (`r442`): 95 km, 13.3 m³/s, rising at 864.8,1439.6 (5,318 m) and joining **Bīruk al-Yāqūt** (`r272`)
      at 826.7,1463.6; that river runs 43 km to the Rift's lake at -717 m. r442 is the Godthrone plan's **Qol Ḍrāi**, the
      blood river (section 1, "The bloodfalls").
    - **Gūlī al-Salsabīl** (`r836`, a wadi from 4,085 m at 834.7,1439.6) and `r837` (6 km) both join r442.
    - **Gūlī al-Ward** (`r492`, a wadi of 80 km) heads at 798.7,1449.6, west of the tail.
  - **No vent** in `vents.json` lies inside or near it.
  - **One lava tube ends here.** `tube_god_ssw_14`, "Godthrone SSW Shield & Brine-Lake Siphon Pyroduct" (`tubes.json`):
    295 km, tibasalt, 50 by 32 m, 60 m deep, state geothermal, uninhabited. It runs south from 840,1282 and ends at 843,1398,
    under the lake. Its one cavern, `cav_god_brine_throat` ("Red Riwa Subglacial Brine-Lake Conduit": a stepwell cistern
    350 by 220 m and 62 m high) is still described as "at 6,415 m beneath the southern EF ice sheet". That is stale: the
    ground above it is now 3,624 m (section 9).
- **The Godthrone's brine lake is gone.** The Godthrone plan's closed saline lake (112 km² at 6,419 m, old px 571,1068 =
  **5.1 px 843,1398**) was the bloodfalls' reservoir. The carving cleared it ("Clear stale 6.4-9.1 km Godthrone flank tarns",
  l. 1140), and the hot lake now lies there, **1,676 m lower than r442's head**. The bloodfalls (old px 585-595,1105-1112 =
  5.1 px 857-867,1435-1442, now 5,047-5,356 m, ET and EF) survive outside the polygon. Their brine can no longer come from
  that lake (section 9).
- **Settlements:** one. **Nazar** (ruin, `s3i61t95z5`, old px 582,1079 = 5.1 px 854,1409) stands inside, at 4,033 m on the
  south-east bench above the spillway's head. It stood on the ice belt at about 6.4 km before the carving.

## 2. Geology and landforms

The rock is the Godthrone's (`biomes/godthrone/PLAN.md` section 3): **titanium-rich basalt** (`tibasalt`, black with an
ilmenite sheen) in thin flows, with **orange and black glass-bead horizons** between eruptions. Below the dry-cold line the
glass alters to ochre palagonite. Gemini's "Pele's Amber" orange glass sands are the Godthrone's own glass halo, here washed
and sorted by water.

| Landform | What it is (Earth's like) | Where | Drawn by |
|---|---|---|---|
| **The ring-fault walls** | A caldera's collapse scarps, stepped by later slumping (Yellowstone's rim, Hawaiian pit craters on a large scale) | the west and north walls, 3-4 km high outside the polygon | `KRELIEF.slump` (38c: the code's listric collar is one) and `scarp`; `KSTRATA` tibasalt in the faces |
| **The slump bench** | Rotated blocks part-way down the wall, back-tilted, at 4.2-4.9 km | the collar, all round | `KRELIEF.slump` treads; `runout` talus below |
| **The wall gullies** | The Godthrone's own radial gullies, kept by the code, cutting the walls | the walls | `KRELIEF.gully` |
| **The floor** | A caldera floor of lake sediments and washed glass sand over the collapsed block | 3.6-4.1 km | `KGROUND` on the heights; `KSTRATA.drape` for the bead-sand mantle |
| **Sinter terraces and aprons** | Geyserite and travertine laid by hot springs (Mammoth, Pamukkale; Yellowstone's basins) | round the lake and the vents | the geyser kit's Stair, read in place (`biomes/geyser`); `WATER.terraces` for the stepped pools |
| **Geyser cones, hot pools, fumaroles** | Yellowstone's Upper Geyser Basin | the floor's vent lines (section 9: no vent records yet) | `WATER.geyser`, `WATER.spring`; fumaroles and mud pots are owed (section 8) |
| **The hot lake** | A geothermal lake on a caldera floor (Yellowstone Lake's West Thumb, with vents in its bed) | 839,1394 | `KRELIEF.waters`, `WATER.open` with `WATER.spring`'s thermal ramp at its vents |
| **The spillway and its cataract** | A breach gorge out of a caldera, ending in a fall off the shield | x 845, y 1395-1470 | `KRELIEF.gully` or `stepcut` for the gorge; `WATER.flow` and falls once the river exists |
| **The lava tube** | A pyroduct running under the flank, ending in a cistern-like chamber | under the lake | `KRELIEF.tube` (the Godthrone flank station's); `KCAVERN` for the chamber |

**The heat.** The draft gives the caldera a "shallow lateral sill of the Godthrone plume" heating the floor to 65-95 °C. That
is Gemini's reading, and a sound one: a caldera is a collapse over an emptied magma chamber, and a sill under it would feed
the springs. The heat at the surface is local, though. Ground at 60-90 °C belongs to the vent fields, discs a few hundred metres
to a few kilometres across (the Hearths plan, section 1). Between them the floor is the country's soil.

## 3. Air and climate

- **Air** (P = 1.6 e^(-h/8000) atm, the scale model's figure: it gives Copper Glacier's 1.19 atm at 2,380 m): 1.08 atm at the
  spillway's end (3,142 m), **1.00-1.01 atm on the floor** (3,645-3,740 m), 0.96 atm on the benches (4,120 m), 0.80 atm on
  the east rim (5,915 m). The draft's sum is right.
- **What the model holds** (the code at l. 4164 sets it): warmest month 22.0 °C and coldest 8.5 °C at 3,640 m, both falling
  5.5 °C per km above; rain 920 mm less 0.18 mm per metre. The classes follow height: Cfb under 4,040 m, Csb to 4,350 m, Dsc to
  4,680 m, ET to 5,450 m, EF to 6,250 m.
  - Inside the polygon: mean p10/p50/p90 = 13 / 14 / 15 °C; rain 753 / 863 / 925 mm.
  - Classes by cells: Cfb 1,583, Csb 409, Dsc 68, ET 49, WH 18, EF 12, Dfc 8, Dfb 1.
  - The stations: 3,740 m, 15 °C (21/8), 910 mm, Cfb; 4,120 m, 13 °C (20/6), 800 mm, Csb.
- **This is a forced climate, and it fights the Hearths.** At the same height and air, the Hearths' showcase vent on the rift
  rim (525,1400, 3,737 m, 1.00 atm) has a mean of +2 °C (14/-10), Dsc. Godshearth is set 13 °C warmer than its altitude twin.
  Two things argue against it:
  1. **The physics.** A caldera's ground heat cannot warm a whole basin's air that much. Yellowstone's flux averages a few
     watts a square metre, against about 250 from the sun. Its caldera is no warmer than the plateau round it; it has warm
     *spots*.
  2. **The life.** The Hearths' engine runs on a cold sky against warm ground. It works winter nights and idles in summer
     (Hearths plan, sections 3 and 7a). A Cfb basin warm all year is the worst country for it, and the best for ordinary
     light-eating forest.

  The draft's own argument (cold sky, warm ground) is the Hearths'. The choice is the owner's (section 9):
  - **A. Keep the model's oasis** (Cfb at 3.7 km). The Hearths there stand in a mild basin, the snow never lies, and the
    climax forest needs another reason to hold off the light-eaters.
  - **B. Re-lapse the basin** (*proposed*): the floor about +2 to +4 °C, Dsc and Dfb as on the rift rim's shelf, with snow in
    winter. Then the warmth is where the vents are: black hearth forests steaming in the snow over warm discs, frost-free
    meadows round each, the lake open all winter. That is the Yellowstone the draft names, and the Hearths' own country. On
    the model: drop the forced block at l. 4164 and let `smodel.climate.lapse` and `reclimate` set it.
- **Wind and sky:** cold air drains off the walls at night (katabatic flow) and pools on the floor: steam banks over the lake
  and the vent lines at dawn. Cold-air and katabatic wind are a shared amendment already listed by other plans (section 8).

## 4. Life

### Flora: the Hearths' own country

The Hearths kit (`biomes/hearths`) is a **shared kit read in place**. Its fields are stations of their hosts: the rift rim N
(the showcase vent, 525,1400), Oidong's north rim (the Cold Hearths), Godstep's flank vent (893,1145, 2,700 m) and the geyser
kit's Stills. It holds `HEARTH` (`SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `heat`, `work`, `dress`, `layout`). Godshearth reads it
the same way, as a fourth host, and is its largest field.

| Key (the Hearths kit's) | Name | Where in Godshearth |
|---|---|---|
| `hearth` | **Hearth tree** | 25-60 °C ground: the discs round every vent line, forest where the discs merge along the floor's faults |
| `stalkdead` | **Dead stalk** | rings round cooled vents; on the sinter aprons they whiten and silicify, the geyser kit's "bobby-socks" |
| `ember` | **Ember mat** | 60-95 °C aprons round the fumaroles |
| `kettle` | **Boil cup** | the hot pools' rims and the lake's warm margins, 40-80 °C water |
| `stoker` | **Stoker** | the discs' edges, 10-25 °C |
| `shade` | **Shade cap** | the mixed ring at each disc's edge |
| `coal` | **Coal moss** | 20-40 °C: the discs' floor and the warm meadows |
| `tallow` | **Tallow bead** | on the hearth trees' stalks |

- **The engine's state** is `HEARTH.work(t, W, atm)`: 0 with the fans folded into silver spindles (by day), 1 with them open
  flat to the zenith (at night and in eclipse). The ground's temperature is `HEARTH.heat(x, z)`, on a `KTHERM` bake of the vent
  records. The placement is `HEARTH.layout`. The draft's `HEARTH.cycle` does not exist.
- **A third dress** (*proposed*, the Hearths kit's own work, not this plan's). The kit has two (`HEARTH.DRESS`): `rim` (broad,
  few, high fans) and `cold` (narrow, many, low). Godshearth's field is bigger, wetter and steadier than either. It would be
  the **caldera dress**: the rim's broad fans on taller stalks.
  - **The draft's figures are too large.** It asks for trees 22-38 m with stalks 2.5 m thick and fans 15-24 m wide. The
    lineage's rim trees have stalks of 2-12 m and fans of 1-2 m. Its biggest are the Stills: 15-30 m with fans of 2-4 m,
    standing in boiling water in 2 atm air, where convection carries ten times what a fan can radiate at 1 atm (Hearths plan,
    section 7b).
  - **Proposed:** caldera hearths 8-18 m, fans 2-3 m, discs merging into groves along the vent lines. The owner's to scale.
- **The ghost rings and the walk** are the kit's canon already: rings of dead stalks round cooled ground, and the walk "under a
  metre a year" (the owner, 2026-11-02). The draft's 10-25 cm a year fits.
- **The hot water's life** is the geyser kit's (`biomes/geyser`, read in place): the mats banded by the water's temperature
  (nothing photosynthetic over about 73 °C), the sinter, the dead trees silicified at the run-off. Its station 3 (`basin`, "the
  mountain forest field", Yellowstone's basins) is this ground's recipe, without its conifers.
- **The draft's invented plants:**
  - The **"bobby-sock sedge"** misreads the geyser kit's term: bobby-socks are dead trees whitened at the foot by silica
    run-off. The warm meadows are the coal moss and the host's turf.
  - The **"kettle-cup"** is the Hearths' boil cup (renamed from "kettle cup" because the geyser kit has a kettle lily).
  - The **"brimstone-lily"** is new; it would belong to the geyser kit's or the Hearths' species, if the owner wants it.
- **Outside the discs:**
  - **Under option B,** the floor between the discs is cold high meadow, read in place from the Godthrone's south-flank crusts
    and Oidong's cushions.
  - **Under option A,** it is whatever the model's Cfb grows: the draft's claim that no lowland flora crosses the rim is a lore
    decision, the owner's.
  - **Either way,** Xanadu's dry-country species (`biomes/xanadu`) come up the spillway gorge from the south.
- **The red weed** of the blood river (the Godthrone plan's riverweed) lives in r442 below the bloodfalls, outside the polygon.

### Fauna (`kits/fauna`)

The Hearths' animals, read in place (`biomes/hearths/PLAN.md` section 8): nocturnal and warm-seeking hexapods.
- the **fin-mouse** (new) and the **fin-owl** (new), the discs' commonest pair;
- the **hearth-stalker** (new), the ambusher on the coal moss, the disc's `hunter`;
- the **cinder crawler** and the **cavern leaper** (in `kits/fauna`), the leaper up the tube's shafts;
- the **frost trunker** (in `kits/fauna`), coming in off the cold to sleep on the moss. This needs option B's cold.

The draft's sinter-striders, steam-moths and caldera salamanders are new animals; they go in the fauna kit's queue as
proposals. So does its winter sanctuary of highland grazers, which also needs option B.

## 5. People

- **On the map:** nobody lives in the caldera. **Nazar** (ruin) stands on the south-east bench (854,1409). The lore's
  **Nazarites** are a ruin tribe, enslaved on Voth's plantations (`LORE.md` §6.12). Whether Nazar is where they came from is
  the owner's (section 9).
- **The Dalab genepriests** (canon, the owner, 2026-11-02): the hearth tree is "one of the things its genepriests come over the
  rim for". The biggest Hearth field on Krator would draw them. The draft's "Xanadui / Dalab genepriest observatory" at the
  spillway is a proposal. It would be an NPC post, placed with `core/hamlet` (or `core/camp` if seasonal), not built by
  this kit.
- **The Xanadui** of the Vale below. The rivers carry their names. The Sultanate's polygon touches the tail (26 cells). Erewhon
  is far down the vale. *Proposed:* the caldera is a high summer pasture and a hunting ground for them, reached up the
  spillway.
- **The Tungangs** do not live here. Their holds are under the rift rim's vents. The draft's Tungang hold "on the SE rim of the
  Siphon Pits" is not in the Hearths plan.
- **Player outposts:** the warm lake shore and the spillway's head are good candidate sites, as **hints** for the open world's
  player-settlement registry. The kit draws nothing for them.

## 6. Dangers

Each maps to a `KHAZ` kind (`core/hazard/README.md`) or a provider.

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Scalding water and hot ground** | the springs, the geysers, the lake's vents, the fumarole aprons | `heat` (with `drown` in the pools), steady or on `HEARTH.work` |
| **Sinter crust over boiling water** | the terraces and aprons | `sink`, trigger `weight`: a crust that breaks underfoot is a shared amendment (section 8) |
| **Gas pooling on still nights** | the floor's hollows, the vent lines, the tube's mouth | `gas`, strongest at night and in still air: a shared amendment |
| **Phreatic blasts** | the geyser fields | `heat` and `crush`, timed on `WATER.geyser`'s cycle |
| **Rockfall and the walls** | the ring-fault walls, the slump bench, the gorge | `fall`, `crush` |
| **The cataract** | the spillway's end, 1.4 km of fall in 20 km | `fall`, `drown` |
| **Cold and thin air** | the rim (0.80 atm at 5.9 km), and the floor in winter under option B | `KHAZ.provide('temperature')`, `'pressure'`; `slip` on ice |
| **The hearth-stalker** | the coal moss at night | `hunter` (`KHAZ.PREDATOR.lair`), bound to the fauna record |
| **Sulphide snow** downwind of a smoking crack | the vent lines (option B) | `poison`, mild, on the wind |

The tells, as the Hearths plan writes them: steam, yellow lips, black snow, a hollow sound at the crust, the stalker's shape in
the moss.

## 7. Stations (on the 5.1 map)

The model already pins four station heights (l. 1190 and l. 3962). Each page is the usual 5.2 km square round its site. World
km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less 272, 330).

| Station | 5.1 px | Ground (the model) | What |
|---|---|---|---|
| 1 **The Hot Lake** (`prismbasin`) | 844,1394 | 3,645 m on the shore; the lake (3,642 m) from about 4 km west; 1.01 atm; Cfb 15 °C (22/8), 925 mm | the lake's sinter shore: a hearth field round the shore vents, geysers and hot pools, terraces stepping down to the lake, the mats, the boil cups, ghost rings round a dead spring |
| 2 **The Grove** (`climaxgrove`) | 836,1388 | 3,740 m; 1.00 atm; Cfb 15 °C (21/8), 910 mm | where the discs merge into forest along a vent line: the caldera dress, the walk, a dormant cone in its rings of dead stalks; the west wall 3.6 km high behind |
| 3 **The North Wall** (`amberheadwall`) | 848,1375 | 4,120 m on the slump bench; the wall rises to 7.6 km within 30 km; 0.96 atm; Csb 13 °C (20/6) | the wall: tibasalt flows, the orange bead horizons, gullies and talus, the Godthrone's ice above, meltwater falling to the floor |
| 4 **The Spillway** (`xanaduspill`) | 845,1422 | 3,380 m in the gorge; 1.05 atm; Cfb 15 °C (22/8) | the outlet gorge between the benches, the river once it exists, Nazar's ruin on the bench about 30 km north-north-east, the drop to Xanadu ahead |

**Station 1 comes first.** It holds the region's point in one page: the hot lake, the vents, the sinter and the Hearth forest
round them, the geyser kit and the Hearths kit read together. It also needs the most from the model: vent records for the
heat field, and the climate choice.

The Godthrone kit's own bloodfalls station (`godthrone-blood`, its plan's section 7) stands just outside, at 857-867,1435-1442.
It is that kit's page, not this one's, and it waits on the same decision about the brine (section 9).

## 8. Core adoption (written first, as the working rules ask)

The modules this kit takes (`README.md`, "CORE MODULES ARE NOT OPTIONAL"), with what each draws here. Start from
`biomes/copperglacier` (the newest finished kit) and the geyser kit's `basin` recipe.

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the caldera's land | `KRELIEF` (`38`, `38c`) | `slump` for the collar and bench, `runout` for the talus, `gully` for the walls and the gorge, `scarp`; `KRELIEF.waters` for the lake |
| strata | `KSTRATA` (35), `KSTRATA.drape` (35c) | the Godthrone's `tibasalt` recipe with its bead horizons in the walls; the washed bead sand draped on the floor |
| the tube | `KRELIEF.tube`, `KCAVERN` | the pyroduct and its cistern chamber, if a station reaches them |
| heat | `KTHERM` (`core/terrain/47-core-therm.js`) | the ground's temperature from the vent records; `HEARTH.layout`, the hazards, the snow and a walker all read the one bake |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | sinter, bead sand, mats and moss as documented masks; the walls and the Godthrone shield as far masses |
| ice and frost | `KGLACIER` (44g), `KFROST` (42) | the Godthrone's ice above the north wall (station 3); patterned ground on the rim, and on the floor under option B |
| water | `core/water`: `WATER.open`, `flow`, `spring`, `geyser` (`geyser/52`), `terraces` (`ext/53`) | the lake, the river, the hot pools with their mineral ramps, the geysers on real periods, the stepped pools |
| hot-water life and terraces | `biomes/geyser`, read in place | the mats, the Stair's terraces, the silicified dead (its `basin` recipe) |
| flora | `core/biome`; `biomes/hearths`, read in place (`BIO.kit('hearths')`) | the Hearths' species and `HEARTH.work`; the neighbours' species at the edges |
| clock, sky, weather | `core/clock` (`KCLOCK`), `core/atmos` | the hour and season for `HEARTH.work`; the standard sky with its eclipse seasons; the shimmer and the snow cover, which reads `KTHERM` (`fx/89-atmos-fx-shimmer.js`, `fx/89-atmos-fx-snowcover.js`) |
| hazards | `core/hazard` (`KHAZ`) | section 6, every record in `core/tags` before it is drawn |
| fauna | `kits/fauna` | section 4, as `BIO.record` records |
| resources | `kits/resources` (`KRES`) | sulphur and copper sulphide at the fumarole lines (the Hearths plan's); hearth wax (`kits/crops`, zone `hearths`); ilmenite sand as an iron node (*proposed*) |
| settlements | `core/hamlet`, `core/camp` | only if the owner places the genepriests' post or a Xanadui summer camp; Nazar as an Ancients ruin (`KFAR` far, the ruin kit's pieces close) |
| shadows | `core/shadow` | off at load, as every kit |
| tags, space, mask, host, export, materials | `core/tags`, `core/space`, `core/mask`, `core/host`, `core/export`, `core/materials` | as every kit |
| city | `core/city` | no |

**Core amendments** (none is a new module; the first three are already listed by other plans: cite, don't re-propose):
1. **Geothermal surfaces:** mud pots, the fumarole kind (steam and run-off), sinter and mat decals. Owed in
   `core/water/README.md` ("Not here (yet)"). Firebliss, Mid Basin, twins, greatchasm and seouterwall want them too.
2. **Hazard kinds:** a crust that breaks underfoot; gas that pools at night and in still air (a `cycle` bound to `core/clock`).
3. **Cold-air and katabatic wind** in `core/atmos`: the walls' night drainage and the steam banks on the floor.

**Kit-side, not core:** the caldera dress in `biomes/hearths` (`HEARTH.DRESS`), and its scale.

**Model amendments** (the scale model, the owner's to authorize):
1. **Vent records** in `DATA.vents` for the caldera's vent lines (the lake's bed, the grove's line, the spillway's head). The
   Hearths' sites come from `DATA.vents`, and `KTHERM` bakes from them. Godshearth has none.
2. **An outlet river** from the hot lake down the spillway. With 750-925 mm of rain on 8,600 km², the basin cannot be closed and
   dry. The spillway would join Rīfar al-Bihār or Gūlī al-Salsabīl below the tail (a hydro pass; `test_smodel.py`'s checks).
3. **The stale records:**
   - `cav_god_brine_throat`'s note (6,415 m under the ice);
   - the tube's name, which still says "Brine-Lake Siphon";
   - the region's empty `notes`.
4. **The climate:** option A or B (section 3).

## 9. For the owner

- **The climate** (section 3): keep the model's Cfb oasis (A), or let the basin lapse to its height and keep the warmth at the
  vents (B, *proposed*)?
- **The bloodfalls' brine:** the carving removed the Godthrone's closed lake, their reservoir, and put a hot lake 1,676 m below
  their head. Choose:
  - the brine comes from under the ice belt east of the caldera (the east rim, 5-5.9 km, EF), and the tube's cavern is
    re-described;
  - or the hot lake *is* the old reservoir, drained when the caldera fell, and the bloodfalls are its last seep, dwindling.

  Either way, the Godthrone plan's section 1 and its `-blood` station need a line.
- **The Hearths' scale:** a caldera dress at 8-18 m (proposed), or the draft's 22-38 m giants, which would outgrow the Stills?
- **Nazar:** is it the Nazarites' origin? Did it stand on the ice (its old height) or on the caldera floor? What is it: an Ancient
  ruin, or a later one?
- **Who comes here:** the Dalab genepriests (and an observatory?), Xanadui herders, both, or no one?
- **Names:** "Godshearth" is Gemini's. The lake, the grove, the spillway and its cataract want Xanadui names (the rivers'
  tongue) or the Monks'.
- **The pinned stations** are Gemini's sites. Keep them, or move station 1 onto vents once the vent records exist?
- **Order:** after the integration pass, and after the Hearths kit's own next steps (`HEARTH.layout` is built; the boil cup,
  the shade cap, the walk and the animals are not). Godshearth is its biggest host, so it should not go first.

## Changes from Gemini's draft (2026-11-06)

- **`HEARTH.cycle`** does not exist: it is `HEARTH.work(t, W, atm)`, with `HEARTH.heat` and `HEARTH.layout` on `KTHERM`.
- **The Hearths kit is not at "the SE rim of the Siphon Pits (1,636,1,354)".** It is a shared kit; its fields are on the rift
  rim N, Oidong's rim, Godstep's flank vent and in the geyser kit (the Stills).
- **Section 5's "implementation recipe"** was written as a proposal "ready for the next model pass". It has been applied
  (`build_425_master.py` l. 1109-1203, 3962, 4164). It came out differently:
  - the lake is 18 cells (72 km²), not 8 km in radius;
  - the climate is a set formula (22.0/8.5 °C at 3,640 m), not a +4.5 °C boost;
  - Cfb runs to 4,040 m, Csb to 4,350 m.
- **The numbers:** 2,148 cells, not 2,187; the rim inside the polygon is mostly 4-4.6 km (90 cells over 4.5 km), not
  4.6-5.8 km.
- **The model's side effects,** not in the draft: the Godthrone's brine lake was removed, the cavern note is stale, there is no
  river or vent.
- **The plants:** the trees' size (section 4), the bobby-sock sedge, and `WATER.terrace` (it is `WATER.terraces`, a stepped
  river; the sinter terraces are the geyser kit's Stair).
- **The climate's rationale:** a warm Cfb basin weakens the Hearths' engine (section 3).

## Sources

- Gemini's draft of this plan (2026-11-06), and the carving in `tools/scale-model/build_425_master.py`;
- the model's data at dfdf64d1a (`gemini/scale-model-5.1-r3`), read with `smodel.page`: heights, water, `tm`/`tw`/`tc`/`p`/`c`,
  `rivers.json`, `tubes.json`, `vents.json`, `model/src/51-region-store.js`, `model/src/60-settlements.js`;
- `biomes/hearths/PLAN.md` (sections 0, 1, 5, 7, 7a, 7b, 8, 9) and `src/50-biome-hearths-species.js`, in the rebuild worktree;
- `biomes/godthrone/PLAN.md` (sections 1, 3, 4: the ice country, the rock, the bloodfalls);
- `biomes/geyser/PLAN-STATIONS.md` and `NOTES.md`;
- `core/water/README.md` (`WATER.spring`, `geyser`, `terraces`), `core/terrain/47-core-therm.js`, `core/README.md`;
- `LORE.md` (§6.12, the Nazarites), `biomes/firebliss/PLAN.md` and `biomes/midbasin/PLAN.md` (the shared amendments).
