# The Great Chasm: the plan (seed, 2026-11-09)

The Great Chasm (`rmw4vh9t20da4`) is a trench 468 km long and up to 12.6 km deep, cut through the high ground between the
S Outlands and the Loom-Chasms on map 5.1. It is the one way between two peoples: the **Coyote Men** of the Outlands to the
north, and the **Yuni frontier** pushing north-east across the Loom-Chasms to the south. Between them the chasm is a hot,
dry, empty corridor. One **trade post** stands in it, where the two cultures meet; other than that, almost nobody lives here
(the owner's brief, 2026-11-09).

This is a seed from the owner's brief and the map, expanded from Gemini's first draft (2026-11-06). Its names marked **TBD**
are the owner's to give, and *proposed* marks this plan's own suggestions. Coordinates are 5.1 px (1821 x 1723, 2 km a px).

**Built 2026-11-11** (a cloud session, branch `claude/greatchasm`): the five stations of section 7 as pages on the biome core
(`build.py --all`; `INDEX.md`, `KNOWN_ISSUES.md`). Section 7b is the survey of the sites as the model draws them, section 7c
what this build settled, and section 8 the core adoption as built. The real-GPU verify is owed on the owner's PC: the cloud has
no GPU, and the pages were checked in software GL only (`KNOWN_ISSUES.md`).

## 1. What the map carves (Gemini, map 5.1)

The region is in `tools/scale-model/smodel/nw_expansion.py` (no note yet); the carving is `tools/scale-model/build_425_master.py`
step 5B-NEW-BIOMES (from l. 931), its climate at l. 4140 and its paint at l. 4844. The numbers below were read from the model
(`smodel.page`, 2026-11-09, at `gemini/scale-model-5.1-r3`); the polygon mask is `matplotlib.path.Path.contains_points`.

- **Size:** 18,262 height cells of 2 km, about 73,000 km² (x 1614-1747, y 798-1032): 468 km NNW to SSE, 266 km at its
  widest.
- **How it is cut** (the code): a floor line runs through nine control points from 4,150 m at 1675,748 (on the Outlands
  plateau) down to -1,180 m at 1692,895 and back up to 580 m at 1696,1026. Across it lie three tiers: the floor
  (`h_gc_tier3`); benches (`h_gc_tier2`) at about 1.5-2.4 km, ribbed up to 220 m (`dike_rib_gc`, Gemini's dikes); and the
  walls, which keep the old plateau's height. At the north end (y 746-868) the code carves a **headwall chaos**: 10 tilted flat-topped mesas (caps 1,520-3,560 m) and
  4 knobs (640-1,240 m) between anastomosing channels, so the floor climbs gradually to the Outlands. Four station heights
  are pinned to within 25 m: 1692,895 (-1,180 m), 1708,935 (1,640 m), 1726,888 (6,850 m) and 1698,1008 (280 m).
- **Heights** inside the polygon: p5/p25/p50/p75/p95 = -823 / 292 / 1,582 / 2,265 / 6,344 m. The lowest ground is -1,187 m
  at 1686,898; the highest is 11,422 m at 1668,968, on the west wall. By band: under 0 m 19.8%, 0-1 km 16.7%, 1-2 km
  31.8%, 2-3 km 14.4%, 3-5 km 9.0%, 5-8 km 6.1%, over 8 km 2.3%.
- **Along its length** (sampled rows; the floor is the row's lowest cell; each rim is the highest ground on that side, to
  12 km past the polygon's edge; width is the ground under 1,500 m):

  | Row y | Floor | at x | West rim | East rim | Width < 1.5 km | Floor tm (°C) |
  |---|---|---|---|---|---|---|
  | 808 | 1,367 m | 1667 | 2,249 m | 2,038 m | 10 km | 18 |
  | 840 | -14 m | 1660 | 4,481 m | 5,656 m | 118 km | 28 |
  | 872 | -733 m | 1687 | 6,063 m | 8,043 m | 108 km | 36 |
  | 896 | -1,179 m | 1690 | 6,379 m | 10,553 m | 76 km | 38 |
  | 968 | -551 m | 1695 | 12,257 m | 9,796 m | 64 km | 34 |
  | 992 | -124 m | 1701 | 8,169 m | 10,669 m | 70 km | 30 |
  | 1008 | 214 m | 1696 | 6,547 m | 11,331 m | 52 km | 26 |
  | 1024 | 632 m | 1696 | 2,870 m | 8,430 m | 18 km | 23 |

  The floor under 0 m is 16-70 km wide; the ground under 1.5 km is 52-156 km wide in the middle reach. The chasm is deepest
  in its middle third: 11.7 km from the floor at y 896 to the east rim, 12.8 km at y 968 to the west.
- **Its two ends.**
  - **North:** the floor climbs through the chaos to about 1.4-2.0 km at y 800-816. Above it, the Outlands' lip stands at
    3,786 m (1656,757), and beyond it the plateau at 3-4 km.
  - **South:** the floor rises to 632 m at y 1024, then over a **sill** at 1,550-2,000 m (y 1028-1032) onto the Loom-Chasms'
    plateau at 1.5-1.7 km. (The draft put the sill at 450-750 m: that is the floor below it.)
- **The benches:** on each side of the floor, at 1.2-2.6 km. The east bench (x 1713-1733, median 1.6-1.9 km) runs unbroken
  from the headwall to the sill. The west one is broken by spurs of 3.5-3.7 km at y 887-911.
- **Slopes** on the 2 km grid: median 4.6°, p90 19.2°, p99 35.6°, steepest 53.1° (1677,957, on the west wall at 5,450 m).
  463 cells are steeper than 30°. A page makes those cells cliffs.
- **Water: none.** No lake, river, lava tube or vent lies inside the polygon (`wl`, `rivers.json`, `tubes.json`,
  `vents.json`). The trough has no outlet at either end: a closed basin the model leaves dry. The nearest water:
  - **North (Hum names):** the head of the **Sām-Hām** ("deep-notch river", r098) at 1626,765, 3,760 m, running 151 km to
    the S Outlands' 705 m lake (1654,701), fed by the wadis Fūng-Gèl and Sāng-Kām-Gèl.
  - **South (Yuni names):** the heads of **Klira Guli** (1,749 m, 1628,1037) and **Mista Guli** (1,694 m, 1636,1039), running
    to a basin at 590 m (1628,1119); **Stoun Guli**, to a lake at 620 m (1610,1119).

  The map's own names show the transition: Hum at the north end, Yuni at the south.
- **Neighbours:**
  - the S Outlands (`rmvp52gbbc8pf`, x 1466-1783, y 617-960) wrap the north end and the west rim down to y 960;
  - Region 99, the Loom-Chasms (`rmvraoas90co7`), begins at the south end;
  - the Yuni Emirate's polygon (`rmw8ca6baau47`) reaches only x 1575-1592 at y 1073-1185, 200-260 km to the south-west.

  Between the S Outlands and Region 99, west of the chasm, the ground is 9-12 km high and airless (O) from y 914 to 1000. So
  **the chasm is the only way between the two peoples' lands**.

## 2. Geology

The code carves three tiers and a chaos; the reading below is the plan's, Gemini's in part, and it is to be checked against
`kits/resources`' geology bake (`tools/scale-model/geology.py`) when the kit starts.

- **A rift that failed.** Paired faults dropped a long block between two shoulders. The benches are the rotated fault blocks
  part-way down, back-tilted toward the walls. The chaos at the north end is the trench's head, where the ground broke up
  into blocks instead of a clean scarp.
- **Flood basalt walls** (*proposed*, Gemini's): the walls are a layer cake of dark basalt flows, each tens of metres thick
  with colonnade and entablature joints. Dikes cut them as near-vertical walls of harder rock; weathered out on the
  benches, they stand as fins and ribs (the code's `dike_rib_gc`). Small basalt geodes lined with amethyst open in the wall
  (KSPELEO, section 8).
- **Is the floor live?** No vent or tube on the map marks the chasm. The model gives the deep floor only a geothermal term:
  up to +4.5 °C below about -600 m, fading to nothing at +400 m (`build_425_master.py` l. 4142). Gemini's draft
  imagined crusted lava lakes, sulphur vents and black-smoker chimneys. They are not in the data. Whether the floor is
  dead and dry or has a few vents is the owner's call (section 9). The code's paint: dark komatiite and obsidian on the
  floor, banded walls, ochre caps on the chaos mesas.

## 3. Climate and air

- **Air and temperature.** Air is P = 1.6 e^(-h/8000) atm (the Loom-Chasms plan's formula; it gives Copper Glacier's
  1.19 atm at 2,380 m and 0.71 at 6,500 m). Temperatures are the model's `tm`, `tw`, `tc` (mean, warm month, cold month):

  | Site | Height | Air | tm | tw / tc |
  |---|---|---|---|---|
  | the Deep (1686,898) | -1,187 m | 1.86 atm | 38 °C | 46 / 31 °C |
  | mid-floor (1700,960) | -537 m | 1.71 atm | 35 °C | 42 / 28 °C |
  | the benches (1708,935) | 1,640 m | 1.30 atm | 16 °C | 24 / 9 °C |
  | the sill (1697,1028) | 1,695 m | 1.29 atm | 16 °C | 23 / 8 °C |
  | the headwall (1664,812) | 1,628 m | 1.30 atm | 16 °C | 24 / 9 °C |
  | the Outlands' lip (1656,757) | 3,786 m | 1.00 atm | | |
  | the east rim (1726,888) | 6,850 m | 0.68 atm | -16 °C | -8 / -23 °C |
  | the walls' crests | 10.5-12.3 km | 0.43-0.34 atm | | |

- **Climate classes inside** (`c`): BWk 13,130 cells (72%), XW 2,815 (15%), ET 971, HF 462, EF 412, HT 275, O 197. The code
  sets them by height: XW (abyssal desert) under -250 m, BWk to 3,800 m, ET to 5,350 m, EF to 6,250 m, HT to 7,150 m, HF to
  8,800 m and O above.

- **Rain** (`p`): 47-78 mm a year on the floor and benches (the code: 45-80 mm under 2,600 m), and 0 on the high walls.
- **The sky is wide.** The draft's narrow sky slit and "perpetual canyon shadow" do not fit the data. From the Deep, the
  highest skyline in any of eight directions stands 1-11° above level; the near rises are 14-16 km off, and the great walls
  are 60-120 km away. The sun reaches the floor all day. What the walls do is close the horizon: a skyline of 10-12 km walls
  on both hands, KHORIZON's far grid at work (section 8).
- **The transition, north to south:** the plateau's lip is cool steppe and desert at 1 atm (Hum country); the headwall is
  mild desert; the floor is a furnace in dense air; the benches stay mild at 1.3 atm the whole way; the sill is mild desert
  again, and the Loom-Chasms' plateau beyond it is BSk and BWk (Yuni country).

## 4. Life

Little lives here. Most of what does is read in place from the neighbours' kits; none of them is built yet except as plans,
so each species comes when its kit does.

| Zone | Ground | Life | From |
|---|---|---|---|
| **The floor** (XW, under -250 m) | 1.66-1.86 atm, 34-38 °C | abyssal desert: bare pavement, salt crust in hollows, a few salt-tolerant tufts; scrub thinning up the ramps | the Bowl's floor (`biomes/sedesert/PLAN-BOWL.md`: 1.83 atm, part XW); `biomes/eastabyss`' XW species |
| **The benches, the headwall** (BWk, 1.4-2.6 km) | 1.3 atm, 15-18 °C | the Outlands' cold-desert and wadi set, thinning south (stilt mound, sac brush, ember scrub, drum cluster, pebble mat); **pleat columns** in the dikes' shade, tapped for water | `biomes/outlands/PLAN.md` section 4 (Z5, Z7) |
| **The south end** (the sill, the floor below) | 1.3-1.56 atm | the Loom-Chasms' **cable vines** across the gorges: the dense air they need (1.45 atm and up) runs on into the chasm | `biomes/loom-chasms/PLAN.md` section 4 |
| **The walls** (ET to HF, 3.8-8.8 km) | 0.53-0.99 atm | lichen and cushions, frost puffs and ice crust high up; nothing over 8.8 km | the Outlands' Z8; Copper Glacier |

- **If the owner makes the floor live** (section 9), the vents bring the vent lineages, read in place: the Gills
  (`biomes/gills`) and the Hearths (`biomes/hearths`). The Hearths run a heat engine against a cold sky, and the floor's
  air is 31-46 °C, so the Gills fit better. Gemini's Curtain-Gills and Chasm-Hearths are these lineages, not new ones.
- **Animals** (`kits/fauna` owns them all):
  - **From the north:** the Outlands' ostriches (the Coyote Men's riding birds), goats, vultures, and the native stalker and
    carrion hexapods.
  - **The golden bird** (the Coyote Men's sacred raptor) on the thermals off the walls. *Proposed:* the chasm's are the
    strongest thermals it knows.
  - **The runner bird** on the bench road. The trickster runs the roads (`biomes/outlands/PLAN.md` section 6).
  - **From the south:** the Loom-Chasms' cable-stryder in the vines, and the halite sifter on any salt.

## 5. People: the two cultures and the trade post

### Why so few people live here

No water (no lake, no river, 47-78 mm of rain); a furnace floor (warm-month means of 39-46 °C in the middle reach, under
1.7-1.86 atm); airless walls over 8.8 km; and distance. The Coyote Men's river country by the 705 m lake (the Outlands'
stations 2-3, here about 1641-1656,676-719) is 95-135 px north of the headwall. Yuni's nearest pins are its farming
outposts **Spindle Fan** (1561,1140) and **Ostrukh-on-Water** (1516,1471); Yuni itself is at 1263,1089. And it is the
border between two peoples: neither claims the corridor.

### The two peoples

- **The Coyote Men** (`biomes/outlands/PLAN.md` section 6): therian tribes, stone and bronze age, highlanders who cross 0.6
  atm and live at 1.0. They bark a dialect of the Hum and write it in contour carvings on milestones. The tribe nearest the
  chasm is the **Peak** tribe, miners of the gem hills (the Outlands' S4, legacy 1352,391, here about 1624,721), about
  100 px north of the headwall; *proposed:* they are the chasm's traders. They sell emeralds, turquoise and ostrich
  feathers and buy grain, metal and cloth; at their other door, the Gate, Izani caravans buy and the Tierhounds take the toll.
- **The Yuni** (`LORE.md` 6.11): tower-house families under an elected Emir, with the Geomancers and the History Monks. They
  speak a clipped English and write in stencil capitals. Yuni is electrified, has a few dune buggies and a caravanserai, and
  its caravans carry spice, gold, petrol, relics, scrap and medicines. Its frontier is the Loom-Chasms, whose rivers carry
  Yuni names (`river_names.py`).

### The routes (computed: the lowest-highest route on the height grid)

| Route | Highest point | Length | Notes |
|---|---|---|---|
| the Mires (S Outlands, 1615,715) to Spindle Fan | 3,786 m at 1656,757, the Outlands' lip | 1,015 km | half of it in the chasm |
| the same, kept out of the chasm | 9,411 m at 1454,784 | 1,599 km | airless: no way round |
| **the sill to the headwall, never under 1,000 m** | 1,695 m | 522 km | **the bench road**: 468 km of it on the chasm's benches, warm month no more than 28 °C; the floor is passed round its south end, never crossed |
| the sill to Spindle Fan, never under 1,000 m | 2,150 m (Spindle Fan itself) | 423 km | the Loom-Chasms' plateau and the Yuni wadis |
| the sill to the Mires, never under 1,000 m | 3,786 m | 794 km | up the bench road, then the headwall's chaos to the lip |

So the way is **along**, not across: off the Outlands at the north lip, down the headwall's chaos to the east bench, 470 km
along it above the furnace, and off the south end over the sill. Nobody needs to go down onto the floor. *Proposed:* Coyote
milestones in contour carving mark the north half, Yuni waymarks in stencil capitals the south half.

### The trade post (name TBD)

**Where:** on the **sill**, 1697,1028, 1,695 m (BWk, tm 16 °C, 23/8 °C, 47 mm, 1.29 atm). It is chosen from the data:
- the floor ends here, so the east bench road, the west bench and the Loom-Chasms' plateau road to the Yuni frontier meet
  here without going down onto the floor (the routes above run through it);
- it is the last ground before the floor: the sill drops to 761 m within 8 km to the north, the one ramp down onto the floor;
- its climate is mild;
- it stands at the edge of Yuni-named ground.

The alternative is the **headwall foot** (about 1664,812, 1,628 m, the same climate), where the Coyote road comes down off the
lip. There the Coyote Men would walk about 270 km to it (from the Mires) and the Yuni about 945 km (from Spindle Fan). At the sill it is the other way round: the Yuni
come 423 km, and the Coyote Men 794 km along the bench road. Either way the post has to bring its water: no water lies within
a station's square of either site. *Proposed:* Yuni-built cisterns fed by a qanat (Ostrukh-on-Water's pin note names
qanats), and the bench's pleat columns tapped.

**What it is** (*proposed*): a serai and its people, tens to a few hundred. **It is an NPC settlement** (the owner,
2026-11-09): a `core/hamlet` record set, a `core/simulation` settlement with its books, a serai where caravans stop
(`core/camp`'s `court`), and a pin in `model/src/60-settlements.js`. It is **not** a record in the open world's outpost
registry, which holds player settlements only.

**Who runs it** (*proposed*): a Yuni trading family holds the serai under the Emir's licence. The Peak tribe holds its own
half. Neither rules the other. A line of contour-carved boundary stones runs across the market court between them.
Possibly it is Yuni's "outpost to their north [TBD]" (`LORE.md` 6.11), though the chasm lies east-north-east of Yuni, not
north (section 9).

**What is traded:**

| From | Goods |
|---|---|
| the Coyote Men | emeralds, turquoise, ostrich feathers (the Outlands' exports); comb-mast drip gum, the caravans' incense |
| the Yuni | grain, metal, cloth (what the Coyote Men buy at the Gate); medicines (a caravan good); *proposed:* tools from Yuni's Foundry, and no firearms past the sill |
| forbidden | the golden bird's feathers: carrying them makes every Coyote tribe hostile (`biomes/outlands/PLAN.md` section 6), so the post refuses them, and the player who brings them is attacked |

**How the two styles meet:** both peoples build in mud, which makes them neighbours and not strangers.
- **The Yuni half**, from the Yuni build's own kit (`settlements/yuni`, `API.md`): the caravanserai, a square court behind a
  gate in banco adobe (`adobe`) with Tiebele chevron bands (`paintbw`); a Musgum shell house or two (`poor_musgum`); one
  tower-house for the family; the yellow hyperboloid over the gate.
- **The Coyote half**: stepped mud-brick rooms climbing the slope behind the court, flat roofs as terraces (the Valley
  tribe's villages, the Tierhounds' stepped towns), a runner-bird shrine at the road's head, contour-carved stones. There
  is no Coyote kit yet (`kits/coyote`, planned): until then these are `core/hamlet` `pending` stand-ins at their boxes.
- **Between them:** the market court, with pens for the ostriches and the Yuni draught beasts outside the walls. The Yuni
  rooms take `kits/catalog`'s `yuni-common` furniture; the Coyote rooms wait for their culture file.

**Player outposts:** none is picked. The open world's outpost registry (being built elsewhere) is for player settlements
only. The chasm offers it few hints: the sill's lee beside the post, and the headwall foot. Both are dry, so a player
outpost there lives on wells and carried water.

## 6. Dangers

The chasm's dangers are heat, air, drop and distance. Each maps to a `KHAZ` kind (`core/hazard/README.md`) or an ambient
field.

| Danger | Where | `KHAZ` |
|---|---|---|
| **Heat** | the floor, worst at the Deep (warm month 46 °C mean) | ambient `hot` (45-70 °C) from `KHAZ.provide('temperature')`, fed by the model's `tm`/`tw`/`tc` and a day curve |
| **Gas** (CO₂ in a trough with no outlet) | the Deep's hollows, still nights | `gas` with `shape.pool` (`21-core-hazard-flow.js`); the night timing is a shared amendment |
| **Thin air, cold** | the walls over about 5 km; the east rim (0.68 atm, -16 °C) | ambient `thin-air` and `cold` (`KHAZ.provide('pressure')`, `'temperature'`) |
| **Falls, rockfall** | the walls (463 cells over 30°), bench edges, the chaos | `fall`, `crush` |
| **Dust** | the floor in the hot season | ambient `dust`; `KHAZ.sight` |
| **Thirst** | the whole 522 km road | no KHAZ kind: supplies in `core/simulation`, the post's cisterns |
| **Salt crust** (if a pan) | the Deep's hollows | `sink`, a crust that breaks: a shared amendment |
| **Hot pools** (if live) | the vents | `heat`, `acid` |
| **Predators** | the native stalker hexapod's lairs | `hunter` (`KHAZ.PREDATOR.lair`) |

The Stalkers (the robot killers) keep to the Stalker Range and Stalker Gate (`rmvstalkergate`, x 1333-1554), 150 px and more
to the south-west; they are not placed here (section 9).

Every danger should read before it kills: shimmer and a white sky for heat, dead birds in a still hollow for gas, frost and
laboured breath for thin air, a dust wall for a storm.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less 272, 330). Each page is the usual 5.2 km square.
Three of Gemini's four pinned heights are kept as stations; the fourth (1698,1008, 280 m) lies in the trade post's view to
the north.

| Station | 5.1 px | Ground (model) | What |
|---|---|---|---|
| 1 **The Sill** (the trade post) | 1697,1028 | 1,695 m; crest 1,550-2,000 m; floor 761 m within 8 km north; BWk, 16 °C (23/8), 47 mm, 1.29 atm | the post (serai, Yuni half, Coyote half, market court); the bench road arriving, the Yuni road leaving; the ramp down to the floor; cable vines below; walls to 11 km (E) and 6.5 km (W) |
| 2 **The Long Bench** | 1718,924 (the pin 1708,935 is a knob: 7b) | 1,750 m on the east bench; BWk, 16 °C (24/9), 47 mm, 1.30 atm | the road: dike fins, pleat columns in their shade, a caravan's night camp, milestones; the drop to the Deep, the east wall to 9.5 km |
| 3 **The Deep** | 1692,895 (pinned) | -1,180 m (lowest -1,187 m at 1686,898); XW, 38 °C (46/31), 78 mm, 1.86 atm | the furnace: pavement, salt crust, shimmer, dust, gas in the hollows; the walls a skyline 1-11° high; vents if the floor is live |
| 4 **The Headwall** | 1664,812 | 1,628 m; mesa caps 1,520-3,560 m round it; the lip (3,786 m) 55 px north; BWk, 16 °C (24/9), 47 mm, 1.30 atm | the Coyote Men's way down: the chaos and its channels, Hum milestones, ostrich riders, the golden bird on the thermals |
| 5 **The East Rim** (optional) | 1726,888 (pinned: the horn, 7b) | 6,850 m; HT, -16 °C (-8/-23), 0 mm, 0.68 atm | the whole chasm from above, the floor 74 km west and 7.9 km down; thin air, frost, amethyst geodes |

Station 1 comes first: it holds the post, both peoples, both roads and the view of the chasm at once. Station 2 is the road
itself; stations 3 and 4 are its two extremes.

### 7b. The sites as drawn (the survey, 2026-11-11)

Read with `smodel.page` from `tools/scale-model/model/data` (the build's own source; the height grid is the full map, one 2 km
cell a pixel), heights bilinear at the pixel, pressure 1.6 e^(-h/8000), rain and temperatures the model's `p`, `tm`, `tw`, `tc`
at the pixel. `stations/bake_far.py` writes each station's window (121 x 121 cells, 120 km each way) into its
`44f-host-far-data.js`; the page's ground is the model's surface through those cells (Catmull-Rom: the cells' heights exactly
at their centres) with the station's landforms on it, and the far field (KFAR, `src/83-host-far.js`) is the same surface past
the ground's square.

| Station | 5.1 px | Height | Air | Class | tm (tw / tc) | Rain | What the cells show |
|---|---|---|---|---|---|---|---|
| 1 the Sill | 1697,1028 | 1,695 m | 1.29 atm | BWk | 16 (23 / 8) °C | 47 mm | a north-facing ramp: 1,150 m at the page's north edge, 1,940 m at its south; 973 m 4 km north, 651 m 8 km north; the crest 2,040-2,080 m 6 km south |
| 2 the Long Bench | **1718,924** | 1,750 m | 1.28 atm | BWk | 16 (24 / 9) °C | 47 mm | the east bench's back sloping west from 1.9 km to 1.5 km at the page's west edge, ribbed 100-250 m on a NNW-SSE strike (the dikes); the ramp to the floor beyond |
| 3 the Deep | 1692,895 | -1,180 m | 1.85 atm | XW | 38 (46 / 31) °C | 78 mm | flat: the page's nine cells within 50 m of each other; the walls 60-120 km off, 1-7° up |
| 4 the Headwall | 1664,812 | 1,628 m | 1.31 atm | BWk | 16 (24 / 9) °C | 47 mm | a plateau at 1,560-1,790 m broken by single low cells 350-550 m down (1,082-1,300 m): one 2 km north, four more 4 km off |
| 5 the East Rim | 1726,888 | 6,850 m | 0.68 atm | HT | -16 (-8 / -23) °C | 0 mm | a horn: its four neighbours 6,020-6,030 m, its corners 5,290-5,370, the ring 4 km out 4,100-4,300 m, on a bench at 1.9-2.6 km |

What the survey changed (the round's rule: survey the drawn heights, never the pins' comments):
- **Station 2 moved** from the pin (1708,935) to **1718,924**. The pin is a lone knob: its cell at 1,640 m stands over
  neighbours at 1,330-1,360 and a ring 4 km out at -230 to 750 m, on the ramp between the floor and the bench, 10 km west of
  the bench. The east bench is drawn at x 1716-1733 (1.5-2.0 km); the knob stands in station 2's far field, 22 km west.
- **Station 5 is the pin's horn**, as drawn: a peak 4.5 km over the bench round it, 30-40 km in front of the east wall's true
  crest (11-12.3 km, airless). The page is the horn; the wall is its far field.
- **The headwall's chaos** is a plateau with box channels: the code's mesas between channels narrower than a cell. The page
  draws the plateau through the high cells and cuts the channels down to the low cells' heights (KRELIEF.stepcut).
- **No water within 12 km of any site** (the `wl` layer, `rivers.json`, `tubes.json`, `vents.json`): the plan's section 1 holds.

### 7c. Settled in the build (2026-11-11; the owner's questions in section 9 stay open)

- The trade post is on **the sill** (section 9's first question taken as the plan proposes), as records first: 84 of them
  (serai walls, gate and bays, tower-house, two shell houses, the cistern's kerb, the market court's stalls and its seven
  boundary stones, twelve Coyote rooms in three steps, the shrine, the two pens, the qanat's shafts), every one `pending` and
  drawn as a stand-in at its box in its culture's mud. The Yuni kit's buildings, kits/coyote, core/hamlet's trade focus and
  core/simulation's books are owed (section 8).
- **The floor is dead and dry** (the plan's default): no vents, no pan, no geothermal surfaces.
- **The flora**: the chasm's own ground cover is drawn as named stand-ins for the Outlands' plants on the library's Outlands
  cards (`card.outlands.scrub`, `card.outlands.crust`), each tagged `standin: 'outlands.<key>'`; the trees are read in place
  from the built kits: the eastern abyss's **jade shrub** on the Deep's hollow rims (the plan's own XW source) and the
  eastern badlands' alien **needle bloom** on the benches, the sill and the headwall's channels (stand-ins for the Outlands'
  and the Loom-Chasms' trees). The badlands' stilt pod was tried and dropped: its tendrils float 2.3-2.6 m off it here (the
  attach audit, `KNOWN_ISSUES.md`).
- **The air**: the sky's own fog thinned to a sixth (the walls 30-120 km off are the chasm); the heat shimmer over the Deep
  (core/atmos fx/shimmer, first used here); the dust season held at the dry end all year.
- **The hour**: the pages open at 14:00, not the shared 11:00. On game start's day (the spring equinox) the giant eclipses the
  sun at the chasm's longitude from 10:00 to 12:00 (`ATMOS.sunHidden`), so at 11:00 the world was unlit; `?hour=` still sets
  any hour, the eclipse included.

## 8. Core adoption (written first, as the working rules ask; as built 2026-11-11)

The plan's table (written before any fragment, 2026-11-09) is kept here as the build took it: each row says what the build takes
and where, and the second table what it does not take, and why. `python3 tools/check_core_use.py biomes/greatchasm` reads 0 findings. The host is riftrim's (`biomes/riftrim/src`, the
nearest finished station kit on the scale model), taken as the start and cut to the chasm: no copy of a core fragment is in `src/`.

| Need | Module | As built |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement by cell: the floor's passes are the core's cell lattice (`BIO.grid`'s cell form), the hollows, knobs, tors and buttes `KRAND.hash(world, i, k, salt)`, the kin's lattice the same; the small relief `KRAND.fbm` |
| the land | the scale model, `KRELIEF` (`38`, `38c`) | the page's ground is the model's own surface (44v `MODEL`: the station's 44f cells, baked by `stations/bake_far.py`); on it `KRELIEF.wadi` (the sill's and the bench's dry channels), `KRELIEF.pavement`, `KRELIEF.stepcut` (the headwall's channels) |
| the chaos, the dikes, the knobs | `KSTACKS` (`37`) | `KSTACKS.row` for the dike fins (sill, bench), `make` for the channels' buttes and spire (headwall), the Deep's knobs, the horn's tors; drawn by `KSTACKS.mesh` in the strata's beds (45) |
| strata | `KSTRATA` (35, 35z) | three recipes added through the core's `KSTRATA.add` (`src/44r-biome-greatchasm-strata.js`: the flood basalt's colonnade, entablature, flow tops and boles; the chaos's ochre caps; the floor's komatiite): the walls, the rock bodies and the ground's steep faces |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | four library layers a station (45: the ground's program reads 15 texture units, counted on the linked program: `the ground reads 15 texture units or fewer`; ANGLE on the Arc links 15 at most), KGROUND's pavement, polygon and talus kinds; KFAR to 118 km from the model with the planet's curvature and a crest pass (83); KHORIZON over the square with the far lattice past it |
| water | `core/water` | the post's cistern, a still (station 1); nothing else (the chasm is dry); the fields path (ext/60) reads it |
| flora | `core/biome` | the kit's ground cover (50, 60) and the neighbours' trees read in place (`BIO.kin`, 87; station.json `kin`) |
| sky, weather | `core/atmos` | the standard sky at each station's place (`ATMOS.skyBiome`), its fog thinned; height fog, the dust and the air's load, the dust season (`fx/dustseason`), the heat shimmer (`fx/shimmer`) over the Deep, the weather's dry climate |
| hazards | `core/hazard` (`KHAZ`, 20 and 21) | the air and the heat as ambient fields (`KHAZ.provide`: pressure, temperature with the season and the hour), records for the Deep's gas hollows, falls, rockfall, the qanat's open shafts, the cistern (88) |
| tags, space, mask, host, export, materials, shadow, clock, minimap, edits | as every kit | `core/tags`, `core/space`, `core/host` (the whole interface and the polygon tool), `core/export`, the material library (`materials.json`, `tex/`), `core/shadow` (off at load); placement never reads canvas pixels |

**Not taken, each with its reason:**

| Module | Why not (yet) |
|---|---|
| `core/hamlet` (`KHAMLET`) | it has no `trade` focus and no Yuni or Coyote culture row (amendment 1 below); the post's records are laid by hand in its own frame (`stations/sill/86-host-post.js`), plain data with stable ids, to move onto `KHAMLET.village` when it gains them |
| `core/simulation` | the post's books (its stock, the caravans' trade) wait for the hamlet record set; `check_core_use` would then ask for `core/city` too, which the plan rules out (a hamlet, not a city) |
| `core/camp` | the bench's night camp is pending records drawn as stand-ins (station 2); `KCAMP`'s caravan records are planned, not built |
| `core/city` | no: the post is a hamlet (as planned) |
| `kits/fauna` | no animal is placed: the Outlands' ostriches, goats, vultures and hexapods, the golden bird and the runner bird wait for their records in kits/fauna; the stalker hexapod's lairs (`hunter`) with them |
| `kits/catalog`, `core/furnish` | no interiors are drawn (the post's buildings are stand-ins) |
| `kits/resources` | the geology bake is not read; the plan's section 2 is the plan's reading |
| `KCAVERN`, `KSPELEO` (39, 39b) | the amethyst geodes on the east rim are owed |
| `KRUBBLE` (37c) | the talus blocks are the floor pass's boulders and fallen columns; KRUBBLE's fields when the walls' feet are drawn closer |
| `KLAVA` (46, 46b) | the floor is dead (7c) |
| `KSTACKS.contour` (37b) | the fins keep KSTACKS' own profile |

**What is kit-side, not core:** the vents, if any (black-smoker chimneys, lava glow), and the look of the walls closing the
sky. KHORIZON gives the shading, and the composition is the kit's.

**Core amendments the chasm needs.** Most of what the draft asked for exists already. These are what is left:
1. **A trade post in `core/hamlet`** (the chasm's one new need):
   - a `trade` focus beside the resource, fishing and farming villages: a serai court, stores, cisterns and a market court;
   - a village shared by two culture rows, each with its own half and a line between.

   `KHAMLET.CULTURES` has no Yuni row yet (from `settlements/yuni`'s kit) and no Coyote row (its buildings are `pending`
   until `kits/coyote`). Other border posts could use it (the Gate's toll fort, *proposed*).
2. **Hazard kinds**, shared with the region plans of 2026-11-09:
   - gas that pools at night and in still air (a timed `gas`);
   - a crust that breaks underfoot, only if the owner puts a pan in the Deep.

   The third, the gorge flood, is not needed here: no river or wadi enters the chasm.
3. **Geothermal surfaces** (mud pots, the fumarole kind with steam and run-off, sinter and mat decals): owed in core/water's
   README ("Not here (yet)"), and wanted by Firebliss, Godshearth, the Twins and the SE outer wall. The chasm needs them
   only if the owner makes the floor live.

## 9. For the owner

- **The trade post's site:** the sill (1697,1028), or the headwall foot (1664,812)? The plan takes the sill (section 5).
- **Its names (TBD):**
  - *proposed* in Yuni: **the Deppo**, one of the clipped words `LORE.md` 6.11 gives (read here as "the depot");
  - *proposed* in Hum, from the river-name lexicon (`river_names.py`): **Sām-Lōk**, "deep-notch step-bench".
  - The chasm itself is the Sām in Hum: the Sām-Hām, "deep-notch river", rises at its north lip. What do the Yuni call it?
- **Who holds it:** a Yuni family and the Peak tribe side by side (the plan's proposal), one of them alone, or a third party?
  Is it Yuni's "outpost to their north [TBD]" in `LORE.md` 6.11?
- **How big:** tens of people, or a few hundred? A pin on the scale model's settlements to follow.
- **Is the floor live?** The map has no vents here. Dead and dry (the plan's default), or a few vents with hot brine and
  their lineages (the Gills, the Hearths)? That choice decides the geothermal amendment.
- **A salt pan in the Deep?** The trough is closed and the model leaves it dry. A pan would explain the halite sifters.
- **The Stalkers:** do they range this far north-east, onto the Yuni road south of the sill?
- **Order:** after the Outlands kit and the Coyote culture kit, since the post's Coyote half and most of the bench flora
  read from them. The `core/hamlet` trade post can go first; other border posts could use it.

## Changes from Gemini's draft (2026-11-06)

- **Core calls:** no `WATER.fumarole` or `WATER.brinePool` (brine is a `W.LOOKS` look, a boiling pool `WATER.spring`;
  fumaroles and mud pots are owed); black smokers, the sky slit and lava glow are kit-side; `core/haz` is `core/hazard`.
- **Numbers:** the draft's heights were the uncarved plateau's (median 5,643 m; carved, 1,582 m); most node rims and floors
  were wrong; the floor is 16-70 km wide, not 6-18; the sky is open; the sill is 1,550-2,000 m, not 450-750.
- **Claims:** the north end ramps to the Outlands (no island); lava, vents and brine pools are not on the map.

## Sources

- the owner's brief, 2026-11-09, and the owner's note that NPC outposts are not player outposts;
- `tools/scale-model/build_425_master.py` step 5B (l. 931-1107: the spine, the tiers, the chaos, the pins), l. 4140-4162
  (the climate) and l. 4844 (the paint);
- `smodel/nw_expansion.py` (the region); `model/src/51-region-store.js` (S Outlands, Region 99, the Yuni Emirate, the
  Stalker Gate);
- `model/src/60-settlements.js` (Spindle Fan, Ostrukh-on-Water, Yuni, Trickster's House);
- `model/data/rivers.json` (Sām-Hām, the Hum and Yuni wadis), `tubes.json`, `vents.json`; `smodel/river_names.py` (the
  tongues by region, the Hum lexicon);
- the model's data at `gemini/scale-model-5.1-r3`, read with `smodel.page`;
- `biomes/outlands/PLAN.md`, `biomes/loom-chasms/PLAN.md`, `biomes/sedesert/PLAN-BOWL.md`, `biomes/hearths`, `biomes/gills`;
- `LORE.md` 6.11 (Yuni), the caravans and vehicles, the Stalkers; `settlements/yuni/API.md`, `NOTES.md`;
- `README.md` ("CORE MODULES ARE NOT OPTIONAL") and the core READMEs (terrain, hazard, water, hamlet, camp, atmos) in
  `krator-rebuild-merge`;
- `biomes/labyrinth/PLAN.md` and `biomes/firebliss/PLAN.md`, the form this plan follows.
