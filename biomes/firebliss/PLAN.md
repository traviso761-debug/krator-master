# The Firebliss Range: the plan (seed, 2026-11-09)

The Firebliss Range (`rmw8hj62nmugn`) is a volcanic arc on the Labyrinth's northern rim, in the far south-west of map 5.1,
between the airless west edge and the Labyrinth. Along its spine stand five ice-capped volcanoes, at 5.4 to 6.7 km. Under them
lie four warm valleys, each with its own lake, at 1.9 to 2.7 km: temperate (Cfb, with a Cfa pocket) in a country that is
otherwise tundra and ice. The valleys are 5% of its ground; the other 95% lies at 4 to 6 km.

**Nobody lives here permanently. Fellgang and Kimr bands pass through semi-regularly** (the owner, 2026-11-09). Its dangers are
the land itself: gas, heat, ash, ice and thin air. A player who reaches one of its oases has found a good place for an outpost
(section 6).

This is a seed from the owner's brief (2026-11-09) and the map. Two drafts were merged into it on 2026-11-09: the brief's (who
comes here, the outposts, the Labyrinth as neighbour) and a reading of the model's numbers. The owner's decisions of 2026-11-09
are applied to the scale model in **5.1 edit 3** (`tools/scale-model/edit_513.py`; section 9). Names marked **TBD** are the
owner's to give, and *proposed* marks this plan's own suggestions. A neighbour of `biomes/labyrinth/PLAN.md`. Coordinates are 5.1 px
(1821 x 1723, 2 km a px).

**Built 2026-11-10** (branch `claude/firebliss-80cc25`, on `claude/cloud-kits-verify`'s 5.1 edit 3): the four stations of section 7 on the
model's own ground (section 7a), with the core adoption of section 8 as built. What is owed is in `KNOWN_ISSUES.md`; how a page is
made is in `README.md`.

## 1. What the map carves (Gemini, map 5.1)

The carving is `tools/scale-model/build_425_master.py` step 9E (l. 2609-2989); its climate is set in the Labyrinth's pass (l.
4328-4420). The region is in `smodel/nw_expansion.py` and the page's `51-region-store.js`. The numbers were read from
`model/data` (`smodel.page`, 2026-11-09), the polygon masked by `matplotlib.path.Path.contains_points`.

- **Size:** 28,007 cells of 2 km, about 112,000 km² (x 38-320, y 1238-1403): 560 km WNW to ESE, 330 km north to south.
- **How it is cut** (the code):
  - **The spine.** A cordillera runs WNW to ESE along the Labyrinth's upwind northern border, falling from about 5,250 m in
    the west to 3,950 m at the east border, with a crest of up to 620 m on its axis.
  - **The cones.** Five stratocones on the spine, each with a summit crater and radial barranco ribs. Each rim has a notch
    180 m deep on its **south-west** side (the code's 130-140° is measured with y pointing south).
  - **The valleys.** Four elliptic basins south of the spine, each with a flat floor, stepped sinter benches (±85 m) and a
    warm lake at its centre. The code first set the lakes at 1,680-2,180 m, then raised them so that each outflow could run
    downhill into the Labyrinth's lakes.
  - **The west edge.** The airless barrier (x under 62, over 8.8 km, class O) is kept.
- **Heights:** p5/p25/p50/p75/p95 = 2,918 / 4,367 / 4,718 / 5,123 / 6,029 m. The lowest ground is 1,901 m (the East Bliss
  lake's bed, 284,1318); the highest 10,128 m (38,1259, on the barrier). By band: under 2 km 0.3%, 2-3 km 5.1%, 3-4 km 5.9%,
  **4-5 km 57.3%**, **5-6 km 26.3%**, 6-8.8 km 3.9%, over 8.8 km 1.3%.
- **Slopes** on the 2 km grid: median 2.4°, p90 8.9°, steepest 34.8°. At this scale it is a plateau with cones on it; the relief a
  walker sees (crater walls, barrancos, sinter steps, valley walls) is under the grid, and the kit makes it.
- **The five volcanoes** (`model/data/vents.json`, kind `stratovolcano`). Base radius 29-42 km, craters 12-18 km across:

  | Volcano | 5.1 px | Peak | Crater floor | Crater floor's climate |
  |---|---|---|---|---|
  | Mount Pyre | 104,1304 | 6,650 m | 5,820 m | EF, -13 °C (-3 / -22) |
  | Cinder-Crown | 148,1292 | 5,940 m | 5,320 m | EF |
  | **Firebliss Mons** | 206,1284 | 6,380 m | 5,480 m | EF, -11 °C (-1 / -20), 596 mm |
  | Brimstone Spire | 254,1288 | 5,780 m | 5,180 m | EF |
  | Copper-Fissure Vent | 298,1286 | 5,360 m | 4,680 m | ET, -6 °C (4 / -16) |

- **The four valleys** (the oases), each a sheltered geothermal basin under the spine with a warm lake (class WH) and sinter
  steps round its shore:

  | Valley | Lake: centre, area, level | Ground under 3 km | Warmest shore (model) | Outflow |
  |---|---|---|---|---|
  | West Bliss Cauldron | 125,1343; 140 km²; 2,640 m | 1,048 km² | 125,1340, 2,695 m: Cfb, 10 °C (19 / 2), 1,082 mm, 1.14 atm | **Yan Warra** (`r_fb_west`), 169 km to the Labyrinth's north-branch head (182,1404) |
  | **Great Firebliss Vale** | 184,1318; 240 km²; 2,280 m | with the Glen, 3,460 km² | 183,1314, 2,315 m: Cfb, 12 °C (21 / 4), 1,067 mm, 1.20 atm | **Tlahn Warra** (`r_fb_central`), 341 km through Solfatara Glen to the Labyrinth's Lake 3 (1,980 m) |
  | Solfatara Glen | 238,1322; 140 km²; 2,120 m | (with the Vale) | 235,1319, 2,140 m: Cfb, 13 °C (22 / 5), 1,239 mm, 1.22 atm | Tlahn Warra |
  | East Bliss Vale | 284,1318; 132 km²; 1,960 m | 1,440 km² | 282,1315, 2,004 m: **Cfa**, 14 °C (23 / 6), 1,271 mm, 1.25 atm | **Weyt Warra** (`r_fb_east`), 218 km to the Labyrinth's Lake 6 (1,720 m) |

  In all 5,970 km² lie under 3 km. The valley walls climb fast: 8 px south of the Vale's lake the ground is at 4.7 km. The
  rivers are named in the Tungang tongue (`river-names-5.1.md`): Yan, "first"; Tlahn, "iron-clan"; Weyt, "white-water"; Warra,
  "river". **Their gorges are the only easy ways in** (section 3).
- **The plume:** the five vents breathe a persistent plume to the south-east (bearing about 142°): vapour 370-640 km
  downwind, sulphate, and dark basaltic-andesite ash 190-390 km (`w_firebliss_plume`, `w_firebliss_ash` in the build; not saved
  in `model/data`). The model uses it only to add rain to the Labyrinth (+310 mm, +165 on its NW-facing slopes). **The range
  makes its neighbour green**; its own valleys lie mostly upwind of it.
- **Neighbours:**
  - **the Labyrinth** to the south (`rmw8bqrn3dnx4`, along the edge from 293,1349 to 113,1402), which takes all three rivers;
  - **Copper Glacier** to the north (`rmvcopperglacier`, built). Its region overlapped 57% of the range until 5.1 edit 3
    trimmed it to Firebliss's north edge (section 9); its three stations all stand outside the range;
  - the W rift highland, the Fellgangs' fells and the Tungang Union to the east, past Copper Glacier's pass;
  - the airless barrier to the west.
- **Settlements:** none within 100 px. The nearest pins are Ledge (437,1330, Dalab's hold over the great lake), Nulab, Loj Twenny
  (a Tungang cavern) and Wildcat, 140-175 px (280-350 km) east of East Bliss.

## 2. Geology, air and climate

- **A glaciovolcanic arc.** Basaltic andesite to andesite cones on an older uplifted plateau, ice-capped above about 5.1 km.
  The barrancos are lahar and meltwater gullies; each rim's SW notch is the side its meltwater leaves by, and where a flank
  collapse would run.
- **Degassing calderas** (*proposed*): 0.6-0.9 km deep under their rims, each with a crater glacier and fumarole fields
  melting holes through it.
- **The valleys are hydrothermal grabens** (*proposed*): warm groundwater rising under the arc, sinter terraces, acid and
  steaming ground. The Earth analogue is New Zealand's Taupō Volcanic Zone (Rotorua, Waiotapu) under ice-capped andesite cones
  (Ruapehu). Solfatara Glen is the sulphur field its name implies.
- **The resource bake** (`kits/resources/data/geology.json`, rebaked in 5.1 edit 3): the range had been masked airless and
  crystalline, with no sulphur, because the bake predated the carving. Now 1,432 of its 7,016 four-km cells are volcanic (round
  the cones: their vent records reach 39-45 km), 2,666 sedimentary, 1,556 crystalline and 1,304 granite (the plateau, by the
  bake's height and relief rules); sulphur reaches 255 at the vents (105 cells over 150), copper 210 and tuff 200 round the
  cones. *For the owner:* the bake reads the 4-5 km plateau between the cones as sedimentary and granite, not ash and lava
  sheets; a `VOLCANIC_REGIONS` entry for the range would make all of it volcanic.
- **Air** is P = 1.6 e^(-h/8000) atm. Temperatures are the model's `tm`, `tw`, `tc` (mean, warm month, cold month):

  | Site | Height | Air | tm | tw / tc | Rain | Class |
  |---|---|---|---|---|---|---|
  | East Bliss shore | 2,004 m | 1.25 atm | 14 °C | 23 / 6 °C | 1,271 mm | Cfa |
  | Great Vale shore | 2,315 m | 1.20 atm | 12 °C | 21 / 4 °C | 1,067 mm | Cfb |
  | the plateau (median) | 4,718 m | 0.89 atm | -10 °C | 0 / -21 °C | 565 mm | ET |
  | Firebliss Mons' crater | 5,481 m | 0.81 atm | -11 °C | -1 / -20 °C | 596 mm | EF |
  | Mount Pyre's summit | 6,650 m | 0.70 atm | | | | EF / HT |

- **Classes inside** (`c`): ET 66%, EF 19%, then Dfc, Cfb, HF, HT, O, WH, Csb, Cfa. Cfa only at East Bliss (1,965-2,069 m);
  Cfb 2.1-3.1 km; Dfc (3.2-3.9 km) on the valley walls' shoulders.
- **Why the valleys are warm:** the build adds a fixed geothermal term over each valley (+6.4 °C to the warm month, +8.2 °C to
  the cold), +3.5 / +4.5 °C in the craters, and +280 mm of rain (+345 round the lakes). Set terms, not physics: about 7 °C over
  the plain lapse at 2-2.7 km. The kit draws it as ground heat (`KTHERM`): strongest at the vents, lakes and sinter, weakest on
  the walls. *Proposed:* steam fogs on the lakes on cold mornings.
- **The day's extremes** (`th`, `tl`) were missing on 90% of the range; 5.1 edit 3 set them by the model's own rule (section 9).
  On the valley shores the hottest afternoon is now 27-29 °C and the coldest night about 0 °C; on the plateau 2 / -32 °C.
- **Wind:** the prevailing north-westerly blows the plume off the cones, over the valleys' south walls into the Labyrinth.

## 3. Who comes here

- **Nobody lives here permanently** (the owner, 2026-11-09). No settlement or polity polygon lies in the range, and the plan
  keeps it that way.
- **Fellgang and Kimr bands pass through semi-regularly** (the owner, 2026-11-09):
  - **Fellgangs** come over the fells from the north and east. The Fellgangs descend in part from the Tungangs who fled the
    tunnel wars up onto the fells (`LORE.md` 6.1), which is why the range's rivers carry Tungang names. *Proposed:* "Yan Warra",
    the First river, is where they first came down.
  - **Kimr** come up the Warras' gorges from the Labyrinth, hunting the megafauna that stray up in summer
    (`biomes/labyrinth/PLAN.md` sections 4-5).
- **The ways** (the lowest-highest route on the height grid; see section 1 for the rivers):

  | Route | Highest point | Length | Notes |
  |---|---|---|---|
  | the Great Vale to Solfatara Glen | 2,682 m (208,1320) | 114 km | one valley system |
  | the Glen to East Bliss | 2,526 m | 307 km | round by the Labyrinth: down the Tlahn Warra, up the Weyt |
  | West Bliss to the Great Vale | 3,253 m (in the Labyrinth) | 528 km | round by the Labyrinth; straight over the spine is higher |
  | East Bliss to Ledge (Dalab's hold) | 3,520 m (405,1471) | about 1,000 km | through the Labyrinth to the Rift's west head; 302 km straight |
  | the Great Vale to Copper Tarn (north) | 4,828 m | over 1,500 km | over the ice: nothing under 4.5 km |

  **The valleys open only south**, into the Labyrinth: ice closes the north and air the west. The Kimr's way in is short (up a
  Warra); a Fellgang band's is long, by the Labyrinth from the east or over the high fells. *Proposed:* the Fellgangs cross the
  plateau in summer only, at 0.85-0.9 atm, which their highland breeding takes.
- **What they leave** (drawn by the kit, all temporary; `core/camp`, `KCAMP`, as bands that move):
  - night and hunting camps in the valleys: hide shelters, drying racks, hearths, cached gear;
  - cairns and marked trails along the gorges;
  - butchery sites;
  - each people's own marks: Kimr Aurochs-horn markers, Fellgang stone signs.

  Two peoples on the same ways avoid each other, so a camp may be abandoned, raided or contested.
- **What they take:** megafauna that stray up from the Labyrinth (mammoth, woolly rhino, giant elk); the range's own animals
  (section 4); sulphur, obsidian and pumice; the valleys' hot-spring minerals.

## 4. Life

The valleys are lush pockets in a bleak arc. Most of their life is read in place from kits that already have that country,
with the Labyrinth's Earth stock straying in along the rivers.

| Zone | Life | From |
|---|---|---|
| **Valley floors** (to ~2,700 m; Cfb, Cfa) | warm meadow and fern, conifer groves in the lee of the walls, reeds round the lakes; the veiled rim's fog plants where the steam lies | the geyser and swbay kits; `biomes/riftrim`'s W rift highland (`veilthread`, `mistcup`, `moorsponge`); the Labyrinth's parkland trees along the Warras |
| **Lake shores and sinter** | thermophile mats banded by temperature (white, yellow, orange, green, brown), sinter steps, hot-spring grasses, silicified dead trees | `biomes/geyser` (its mats and `basin` recipe) |
| **Fumaroles** (Solfatara Glen) | sulphur crusts, acid-tolerant mosses, almost nothing else | the Throne's vent flora |
| **The ash slopes and plateau** (2,700-5,100 m; ET, Dfc) | sparse cushions, ash-desert plants, lichen on the lava | the Throne's ash-desert flora; Copper Glacier's cushions; the rift rim's black rim |
| **The ice** (over ~5,100 m) | snow algae, ice worms, frost coral at the moraines | `biomes/copperglacier` |
| **Fumarolic ice caves and crater vents** | the cold lineage's mats and glow; the Hearths at the vents (a heat engine against a cold sky, at 0.8 atm and -11 °C mean) | the Throne's glacier station; `biomes/hearths` |

*Proposed, the range's own* (Earth's Taupō geothermal flora as the models; the trick they share is warmth from below, so their
stands trace the `KTHERM` field): **steam fern** (a tree fern 6-12 m whose crown stands in the steam), **heath tea-tree**
(thermal kānuka: upright on cool ground, flattened to a mat on hot), **sinter moss** (a crust on warm sinter, green to orange
with the heat), **ash lily** (a bulb that flowers hot pink through fresh ash downwind of the cones).

**Animals:** the Labyrinth's strays in summer, in the valleys and gorges; the range's own: mountain goats and ibex on the cliffs,
marmots, raptors on the valleys' thermals, the glowing ice worms on the high ice; *proposed*, waterfowl wintering on the warm
lakes. The fauna kit owns them all.

**Crops** (`kits/crops`): at 1.25 atm, 14 °C and 1,270 mm, `CROPS.at` should give East Bliss a wide temperate palette, for a
player outpost (section 6).

## 5. The hazards (environmental)

The range's dangers come from the ground and the air, not from enemies. Each maps to a `KHAZ` kind (`core/hazard/README.md`) or
to a weather provider.

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Gas pooling** (CO₂ and H₂S settling into hollows on still nights) | the valley floors, the craters, the caves | `gas` with `shape.pool` (`21-core-hazard-flow.js`), strongest at night and in still air (an amendment: section 8) |
| **Scalding water and hot ground** | the lakes' hot margins, springs, geysers, Solfatara Glen | `heat` |
| **Sinter crust over boiling water** | the sinter terraces and the springs' aprons | `sink`, a crust that breaks underfoot (an amendment: section 8) |
| **Acid** | crater lakes, fumarole fields, rain under the plume | `acid`; `KHAZ.provide('rain')` and `'ph'` |
| **Ashfall and whiteout** | the plume's track (the south-east side), whenever the vents puff | ambient `ash` (`ATMOS.airLoad`'s `ashAt`); the weather's `ashfall` mode; `slip` on ash over ice |
| **Lahars and outburst floods** | the Warras' gorges, the barrancos, the SW notches | `drown` and `crush`, timed: a flood that runs the gorge (an amendment: section 8) |
| **Phreatic blasts** | geysers and steaming ground | `heat` and `crush`, timed |
| **Crevasses and cliffs** | the ice and the gorge walls | `fall` |
| **Cold and thin air** | everywhere over the valleys: the plateau at 0.85-1.0 atm and -10 °C mean, the cones at 0.70-0.85 | `KHAZ.provide('temperature')`, `'pressure'` |
| **Lava** | the Copper-Fissure Vent's fissure only (the plan's default) | `lava` (`KHAZ.GROUND.lavaFlow`, `KLAVA.bind`) |

Every hazard has a sign before it kills: dead birds and bare ground for gas; colour for heat; a hollow sound and steam at the
crust; grey sky for ash; a rising roar for a flood.

## 6. The oases as outposts

If the player can reach one of the valleys, it is a good place for an outpost: water and warmth, ground to grow on, sulphur,
obsidian and the hunt nearby, and safe from everything but the range itself. Each valley is a different bargain:

| Valley | For it | Against it |
|---|---|---|
| **East Bliss Vale** (1,960 m) | the lowest and warmest (Cfa); nearest the Labyrinth (Weyt Warra); the bands' usual way in, so trade | the most passed-through, so camps and quarrels; a lahar route |
| **Great Firebliss Vale** (2,280 m) | the largest valley and lake; the best ground to grow on; sheltered | gas pools on its floor on still nights; the Tlahn Warra's floods |
| **Solfatara Glen** (2,120 m) | the sulphur, the range's richest resource | acid, fumes and hot ground: a works, not a home |
| **West Bliss Cauldron** (2,640 m) | the most hidden and defensible: a crater moat under Mount Pyre | the highest, coldest and most remote; a crater, so the worst gas trap |

**No spot is picked for the player** (the owner, 2026-11-09): the player sets up where they like. "Outpost" is the owner's
shorthand for any **player settlement**, from a camp to a town; NPC outposts stay conceptually and mechanically distinct (the
world's settlements and camps, `core/hamlet`, `core/camp`). The **outpost registry** belongs to the open world, not to this kit,
and is being built as core work (the owner, 2026-11-09). This kit only supplies candidates: the oases' benches (water, warmth,
gas and flood safety) as hints the registry may read, and nothing drawn on the ground for them.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less 272, 330): negative here, as Copper Glacier's are. Each
page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **Great Firebliss Vale** | the north shore, 183,1314 (lake 184,1318) | 2,315 m; lake 2,280 m; Cfb, 12 °C (21 / 4), 1.20 atm | the oasis: the warm lake in steam, sinter benches, meadow and groves under the ash slopes, a band's night camp; gas in the hollows at night; Firebliss Mons 76 km NNE on the skyline with its plume |
| 2 **Solfatara Glen** | the shore, 235,1319 (lake 238,1322) | 2,140 m; lake 2,120 m; Cfb, 13 °C (22 / 5), 1.22 atm | the fumarole field: sulphur chimneys, acid pools, mud pots, mats in the run-off, the sulphur gatherers' tracks; the Tlahn Warra through it |
| 3 **East Bliss Vale** | the shore, 282,1315 (lake 284,1318) | 2,004 m; lake 1,960 m; Cfa, 14 °C (23 / 6), 1.25 atm | the way in: the Weyt Warra's gorge up from the Labyrinth, a Kimr camp, strays at the water, lahar marks in the gorge; Copper-Fissure Vent 66 km NNE |
| 4 **Firebliss Mons** | the crater floor, 205,1282 | 5,481 m, the rim to 6,421 m; EF, -11 °C (-1 / -20), 0.81 atm | fire and ice: the glaciated cone, the steaming crater breached south-west, fumarolic ice caves, the Hearths at the vents, the plume overhead, thin air |

Station 1 comes first: it holds the oasis, the hazards and the bands all at once. A fifth could be West Bliss Cauldron (125,1340,
2,695 m, the Yan Warra's head under Mount Pyre) or the Copper-Fissure Vent's lava, if the owner wants either.

### 7a. The pages as built (2026-11-10)

Each page stands on the model's own ground: `model_site.py` reads a window of the 5.1 height grid (22 x 22 cells of 2 km) round its
centre at build time and the page interpolates it with a cubic B-spline (`FB_MODEL`, `45-host-stage.js`), then adds only what 2 km cells
cannot hold (the shore's coves, the thermal ground, a river's channel or gorge, hollows, a camp's pad). The lakes are 11-17 km across, wider
than a page, so each valley's page stands on its lake's shore.

| Station | Page | Centre (5.1 px) | Why there | What the model gives there |
|---|---|---|---|---|
| 1 Great Firebliss Vale | `dist/firebliss.html` | 183,1315 | the plan's north-shore point, 1 km toward the lake so the shore crosses the page | the lake (2,279.8 m) over the south-east; the floor rising north-west 40 m; Cfb, 12 °C (21 / 4), 1,050 mm |
| 2 Solfatara Glen | `dist/firebliss-glen.html` | 234,1320.5 | where the Tlahn Warra reaches the lake (234,1321), 2 km from the plan's point | the lake (2,119.9 m) over the east half; the glen's floor 5-8 m over it, rising south-west; Cfb, 12.9 °C, 1,240 mm |
| 3 East Bliss Vale | `dist/firebliss-east.html` | 285,1320.6 | the Weyt Warra's outlet (285,1320): the station is "the way in", up the gorge; the plan's point (282,1315) is the warmest shore, 12 km north-west | the lake (1,960 m) north-west; edit 3's carved outlet channel south down the middle (2 km wide on the cells); Cfa, 13.9 °C, 1,370 mm |
| 4 Firebliss Mons | `dist/firebliss-mons.html` | 205,1282 | the plan's point | the crater floor (5,481-5,500 m) south and east, the inner wall north-west to 5,930 m; EF, -12.6 °C, 600 mm |
## 8. Core adoption (written first, as the working rules ask)

Start from `biomes/copperglacier` (the newest finished kit and the neighbour: its ice, frost and station frame) and the geyser
kit's `basin` recipe.

**As built (2026-11-10).** "Branch" means read in place from `origin/claude/core-plan-features-229d2a` by `build.py` (`git show`) until
that branch is merged: the pieces are not copied into the kit (`KNOWN_ISSUES.md`).

| Need | Module | Taken | How |
|---|---|---|---|
| randomness | `core/rand` (`KRAND`) | yes | every placement cell seeded by `KRAND.cell(seed + salt, ix, iz)`; the camps' and hollows' by `KRAND.hash` of (world, key, index) |
| the ground | the scale model 5.1 (`model_site.py`) | yes | the heights and water levels round each centre, baked into the page; no hand-drawn profile |
| volcanoes, relief | `KRELIEF` (38) | yes | `KRELIEF.river` grades the Warras; the volcanoes themselves are the model's (2 km cells hold Mons' crater); `volcano`/`range` not called |
| landforms | `KRELIEF` 38c (`maar`, `stepcut`, `terraces`) | **no** | the sinter steps are the geyser kit's terrace flights (its `GEYSER.lay` terraces); the gas hollows are KRAND-placed dish hollows on the stage |
| thermal ground | the geyser kit (`biomes/geyser`, read in place as `biomes/ringisles` reads it) | yes | `GEYSER.lay` on each station's authored layout: springs, geysers, sinter flats and terraces, acid fields with mud pots and fumaroles, dead fringes; its relief, heat, flora and show |
| ground temperature | `KTHERM` (47) | yes | the vents' heat between them, from the geyser layout: the snow's bare ground, the hot-ground hazard, the frost coral's warmth on Mons |
| lava and tuff | `KLAVA`, `KSTRATA` | **no** | no station is on the Copper-Fissure Vent's flow (section 7); the walls are off the pages (the far field), so no bedded face is drawn |
| glacier and frost | `KGLACIER` (44g), `KFROST` (42) | **KFROST yes, KGLACIER no** | KFROST's sorted circles on the ash flats over 2,900 m; Mons' crater ice is the ground's ice and snow layers (a crater floor, not a flowing glacier) |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | yes | library layers on documented masks with KGROUND's relief; the far field to 14 km on the model's own heights; the walls' shadows; the plume as far sprites (`KFAR.sprites`) |
| water | `core/water` (`open`, `flow`, ext 56-61, geyser 52/52b) | yes | the tarns (`WATER.open`, still: no surf, no breakers; the warm springs' tint), the Warras (`WATER.flow` on `KRELIEF.river`), the springs and geysers through the geyser kit's show; the reflections switch off at load |
| flora | `core/biome` and the kits read in place | yes | the geyser kit's thermal trees and floor; the Throne's ash pine and tree fern as kin (`BIO.kin`); Copper Glacier's cushions, lichen, moss, sedge, boulders and frost coral (`COPPERG.build` on this page's fields); the kit's own meadow, reeds and stones |
| sky, weather | `core/atmos` | yes | the standard sky at each site; height fog; rain cover; snow that lies (the station's line, bare over warm ground); the plume (`ATMOS.ashPlume`, branch) as fog, ash fall and the hazard's `ash` |
| hazards | `core/hazard` (20, 21) and 22 (branch) | yes | heat and acid (the geyser kit's records), gas that pools at night (`KHAZ.night`), the sinter crust (`KHAZ.crust` / `under`), the gorge's flood (`KHAZ.front`, station 3), cold and thin air (`KHAZ.provide`), falls on the steep |
| camps | `core/camp` (`KCAMP.pitch`) | yes | the hunters' camps; the two culture rows (`fellgang-hunt`, `kimr-hunt`) are the kit's data, registered on `KCAMP.CULTURES` (to move to core/camp/10 when settled) |
| fauna | `kits/fauna` | **no** | owed: the Labyrinth's strays and the range's own animals wait for the fauna kit's Labyrinth and alpine sets (`KNOWN_ISSUES.md`) |
| resources | `kits/resources` (`KRES`), read in place | yes | the nodes in each square from the rebaked `geology.json` (Copper Glacier's `res_site.js`, read in place), registered and drawn as stained outcrops: four sulphur nodes on Mons' crater floor; the valleys' data holds none (the sulphur is at the vents), so the Glen's sulphur is the fumaroles' crusts |
| shadows | `core/shadow` | yes | off at load (`?shadow=1`) |
| tags, space, mask, host, export, materials | as every kit | yes | `KTAGS`, `KSPACE` through the biome core; `KHOST` full with the polygon tool; `core/export`'s profile; `materials.json` and `pack.py` |
| city, hamlet | `core/city`, `core/hamlet` | no | nobody lives here; the oases are offered to the open world's outpost registry as `outposts.json` (section 6), nothing drawn |

**The plan's table** (2026-11-09, kept for the record):

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| volcanoes | `KRELIEF` (`38`, `38b-core-relief-lava.js`, `38c`) | the cones, the breached craters, the spine; `gully` for the barrancos and the Warras' gorges, `slump` and `scarp` for caldera walls and grabens, `runout` for talus |
| the valleys | `KRELIEF` landforms (`38c`: `maar`, `stepcut`, `terraces`), `KRELIEF.waters` | the moats, benches and the sinter steps' ground; the lakes |
| lava and tuff | `KLAVA` (46, 46b), `KSTRATA` (35, 35c: tibasalt, tuff) | flows on the slopes; the walls' bedded ash |
| heat | `KTHERM` (`47-core-therm.js`) | the ground's temperature from vent records (the crater fumaroles, the valleys' vent lines): what the steam, the snow line, the sinter, the flora, the hazards and a walker all read |
| glacier and frost | `KGLACIER` (44g), `KFROST` (42), `KCAVERN` (39) | the summit ice and its caves, patterned ground on the slopes |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | ash, sinter and mats as documented masks; the far cones, and the plume as far sprites (`KFAR.sprites`) |
| water | `core/water` (`WATER.open`, `flow`, `spring`, `geyser`, `terraces`) | the warm lakes, the Warras, the springs, the sinter terraces |
| flora | `core/biome` | read in place (section 4): the geyser, swbay, Throne, Copper Glacier, rift rim and Hearths kits; the Labyrinth's trees along the rivers |
| sky, weather | `core/atmos` | the standard sky; steam (`ATMOS.smokeGroups`); the plume's fog and ash fall (`weather({ash:true})`, `ATMOS.airLoad`); snow reading `KTHERM` (`fx/89-atmos-fx-snowcover.js`) |
| hazards | `core/hazard` (`KHAZ`, `21-core-hazard-flow.js`) | section 5, every record in `core/tags` before it is drawn |
| bands and camps | `core/camp` (`KCAMP`) | the passing bands' temporary camps and the trails they use |
| fauna | `kits/fauna` | strays and the range's own animals, as `BIO.record` records |
| resources | `kits/resources` (`KRES`) | the rebaked field: sulphur at the vents, copper and tuff round the cones, obsidian (*proposed*) |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no: nobody lives here. Outposts go in the open world's registry (section 6) |

**Core amendments the range needs** (no new module; most are shared with the region plans of 2026-11-09):
1. **Geothermal surfaces:** mud pots, the fumarole kind with steam and run-off, sinter and mat decals. Owed in core/water's
   README ("Not here (yet)"); wanted by Godshearth, the Twins, the Great Chasm and the SE outer wall. Firebliss needs them most:
   stations 1-3 are made of them.
2. **Hazard kinds:** a crust that breaks underfoot; gas that pools at night and in still air; a flood that runs a gorge on a
   cycle (lahar or outburst).
3. **A volcanic plume** as a weather source in `core/atmos`: fog, ash fall and shade along an azimuth from the vents. It would
   serve the Godthrone and the Throne's vents too.
4. **The outpost registry** (open world, not this kit), with this kit's oases as candidate sites.

**Kit-side, not core:** the caldera dress (crater glacier, fumarole holes), the plume's look over the cones, the range's own
species.

## 9. The scale model: 5.1 edit 3 (the owner's decisions, 2026-11-09)

`python3 tools/scale-model/edit_513.py` (report: `edit_513.report.json`; `tools/scale-model/README.md`, "5.1 edit 3"):
- **Copper Glacier trimmed** to Firebliss's north edge (it overlapped 15,868 cells, 57% of the range: three volcanoes, two
  valleys). The two now share only their edge's 113 cells. A strip of the airless barrier west of Firebliss's west edge (806
  cells, x 48-73) is cut off from Copper Glacier's body and left to neither. Firebliss has its region note.
- **The rivers fixed.** The three Warras were notched into the ground at their vertices only (the Labyrinth's pass rebuilt its
  mesas over the build's gorges): between the vertices the ground rose 390-590 m, so the lakes had no outlet. Each is rerouted
  by the least-cut route from its lake (the Tlahn through Solfatara Glen) to the build's own target and carved to fall the whole
  way: outlet gorges cut 130-250 m at the median, 470-655 m at their highest pass, 1,491 cells in all; no lake lowered. The
  records have the new course, the carved bed, their region and their mouth (Yan Warra joins Fell-Block Beck; the Tlahn and the
  Weyt end in the Labyrinth's Lakes 3 and 6). The river-names table's "Drains To" now reads the records (it said "sea" for every
  river that ends in a lake).
- **The temperatures fixed.** `th` and `tl` (the hottest afternoon and coldest night) set by the model's own rule (`th = tw +
  d`, `tl = tc - d`, `d` the 5.0 diurnal half-swing, 6.5-8.4 °C) where they were missing (215,770 land cells map-wide), stale
  (the Firebliss-Labyrinth block) or contradicted their own months (431,710 more, mostly the 5.0 expansion strips). Cells whose
  `th` and `tl` agreed with their months kept them.
- **The vent records** given a crater floor, radius and scale: the page had drawn the five at no height.
- **The resources rebaked** (`kits/resources/data/geology.json`, `ledger.json`, the Godot field test's copies); the Resources
  page and Copper Glacier's three pages rebuilt.

**Left for the Labyrinth's own edit:** its four rivers (`r_lab_chaos_n`, `r_lab_chaos_s`, `r_lab_cat_nw`, `r_lab_cat_sw`) have
the same vertex-only fault, climbing 320-535 m; Lakes 3 and 6, where the Tlahn (145 m³/s) and the Weyt (85 m³/s) end, have no
outlet; the 2,920 m catena tarn at 146,1467 has rim cells 90 m under its level. 128 of the map's 893 rivers climb more than
150 m somewhere along their course; that is a map-wide hydrology pass, not this one.

## 10. For the owner

Found while building (2026-11-10):
- **The stations' points.** The Glen's page stands where the Tlahn Warra reaches the lake and East Bliss's on the Weyt Warra's outlet,
  not on the plan's warmest-shore points (section 7a says why). Move them back if the owner wants the shores.
- **The gorges under the grid.** Edit 3 carves each outlet as one 2 km cell; station 3 adds a 26-40 m gorge in a tuff bench inside it
  (sub-cell, the kit's). Should the model's channel be narrower and deeper?
- **The plume misses the valley pages.** With the plume south-east of the cones the three valley pages get no ash fall (Mons' own does),
  as section 1 says ("its own valleys lie mostly upwind").

The plan's questions:

- **The volcanoes' activity:** the plan takes all five as degassing and only the Copper-Fissure Vent as flowing lava.
- **The two peoples:** do the Fellgangs and the Kimr have a truce here, a border, or a feud? Do they pass at different
  seasons?
- **An old outpost?** Should one valley hold a ruined hunters' lodge a player could take over, as an abandoned outpost?
- **The plateau's rock:** a `VOLCANIC_REGIONS` entry for the range in the bake, so the 4-5 km plateau between the cones reads as
  ash and lava, not sediment and granite?
- **Names:** the valleys and volcanoes keep Gemini's English names. Do they want Tungang or Kimr names too?
- **The range's own flora:** the four proposed in section 4, more, or none?
- **Order:** after the Labyrinth, since station 3 and its strays lean on the Labyrinth's fauna, and after core amendment 1
  (geothermal surfaces).

## Sources

- the owner's brief and decisions, 2026-11-09;
- `tools/scale-model/build_425_master.py` step 9E (the arc, the volcanoes, the valleys, the rivers, the plume) and l. 4328-4420
  (the climate pass); `edit_513.py` and its report;
- `smodel/nw_expansion.py`, `model/src/51-region-store.js`, `model/src/60-settlements.js`;
- `model/data` (`h`, `wl`, `c`, `p`, `tm`, `tw`, `tc`, `th`, `tl`; `rivers.json`, `vents.json`), read with `smodel.page`; routes by
  a bottleneck search on the height grid;
- `river-names-5.1.md` (Yan, Tlahn and Weyt Warra); `kits/resources/data/geology.json`, `tools/scale-model/geology.py`;
- `LORE.md` 6.1 (the tunnel wars, the Fellgangs, Dalab); `biomes/labyrinth/PLAN.md` (the Kimr, the megafauna);
  `biomes/riftrim/PLAN.md`; `biomes/copperglacier/PLAN.md`; `biomes/geyser`, `biomes/hearths`;
- the core READMEs: `core/terrain` (`LAVA.md`, `47-core-therm.js`), `core/water`, `core/atmos`, `core/hazard`.
