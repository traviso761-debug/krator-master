# The NE Outer Wall: the plan (build plan, 2026-11-09)

The NE Outer Wall (`rmvymakpc0pft`, "ne outer wall") is the stretch of the Outer Wall between Korona and Spider Lake, in the
north-east of map 5.1. Gemini's note calls it the **Glass-Skarn Bastion**: an impact-rim wall cooked by Korona's heat, cut by
the Arachnoids' dikes and sheared by the Outland Gate fault, with three warm tarns in walled cauldrons. On the model it is
mostly a very high, airless wall. Its life is in the north-western lowlands and in the three cauldrons.

Gemini's sketch (2026-11-02) gave the names, the cauldrons and the four-way geology. This plan keeps those, corrects the
heights and the air from the model, and adds the people, the hazards, the stations and the core adoption. Nothing is built.
The owner wants a kit here (`HANDOFF-REBUILD.md`: one of the three new-north kits allowed to go ahead). It goes in the
rebuild's queue after the frozen integration pass. All px below are on the 5.1 canvas (1821 x 1723, 2 km/px).

## 1. What the map carves (Gemini, map 5.1)

The region is written in `tools/scale-model/smodel/nw_expansion.py` (section 6, "ne outer wall"; the note at line ~2642).
The numbers were read from the model (`smodel.page`, 2026-11-09, branch `gemini/scale-model-5.1-r3`).

- **Size:** 27,375 cells of 2 km, about **109,500 km²** (the note says 101,372 km²; the difference is the cell rule and
  the polygon's overlaps, below). Between 5.1 px x 1089-1456 and y 253-399.
- **Heights:** p5/p25/p50/p75/p95 = **2,761 / 4,867 / 6,993 / 10,704 / 13,101 m**. Highest 14,015 m at px 1386,376; lowest
  1,013 m at px 1091,339 (the western tip, toward the Arachnoids).

  | Band | Cells | Share |
  |---|---|---|
  | under 2,500 m | 720 | 3% |
  | 2,500-3,500 m | 2,308 | 8% |
  | 3,500-5,500 m | 5,609 | 20% |
  | 5,500-9,000 m | 9,177 | 34% |
  | over 9,000 m (airless) | 9,561 | 35% |

  **The sketch was wrong on height.** It put the rim at 3,600-5,800 m. The model's wall is a true Outer Wall: its median is
  7 km and a third of it is airless crest.
- **The lowlands:** ground under 4.5 km makes four pockets.

  | Pocket | Cells | Centre | Lowest / median | Rain | Classes |
  |---|---|---|---|---|---|
  | **North-west lowland** | 4,940 (~19,800 km²) | 1236,299 | 1,686 / 3,422 m | 1,537 mm | Dfc, Cfa, ET |
  | **Gate shoulder** (east lobe) | 463 | 1427,351 | 2,587 / 3,842 m | 549 mm | Dfc, Dsc, ET |
  | **Western tip** | 465 | 1117,336 | 1,013 / 3,713 m | 1,301 mm | Dfc, Cfa, ET |
  | **Garnet cauldron** | 53 | 1187,345 | 2,800 / 3,964 m | 2,321 mm | WH, Dfc, ET |

  The north-west lowland slopes down toward Spider Lake and holds the Vitreous tarn. The south margin, toward Korona, is
  not low: 6.6-7.5 km of tundra (HT) at px 1160-1250, y 345-372, and airless crest (10.6 km) at px 1290-1300.
- **The three cauldron tarns** (class WH, all inside the polygon). Gemini's levels are right.

  | Tarn | 5.1 px | Level | Walls within 8 km | Lowest crest out | Rain | Mean / warm / cold |
  |---|---|---|---|---|---|---|
  | **Garnet-Mirror Tarn** | 1186,344 | 2,810 m (19 cells) | to 6,308 m | 5,435 m | 2,211 mm | 10 / 17 / 3 °C |
  | **Vitreous Boxwork Tarn** | 1258,326 | 2,950 m (27 cells) | to 4,809 m | 3,728 m | 2,494 mm | 9 / 16 / 2 °C |
  | **Epidote-Steam Tarn** | 1342,338 | 2,670 m (19 cells) | to 10,457 m | **11,535 m** | 1,929 mm | 11 / 18 / 3 °C |

  "Lowest crest out" is the lowest height a walker must climb to reach Spider Lake or Korona (a flood fill on the model).
  **The Epidote-Steam Tarn is sealed:** airless walls ring it, so nobody walks in (section 9).
- **Water:** no river in `rivers.json` crosses the polygon. The **Web-Cleaver River** (Hām-Tsēk, `id 9102`, 1,092 km,
  380-1,650 m³/s) runs 12 km off its north-west edge, from Spider Lake west to the Ria. The **Outland Gate River** (Hau-Gèl,
  `id 9106`) runs 32 km off its east edge, in the gap. The tarns have no outflow on the model; their streams are kit work.
- **No vents, tubes or volcanoes** inside (`vents.json`, `tubes.json`, `volc.json`). The heat is geothermal, not volcanic.
- **No settlements** inside (`60-settlements.js`). The nearest: **The Gate** (outpost, px 1408,414, just past the polygon's
  south-east corner in N Outlands, 8,002 m on the model) and **Coyote Canyon** (village, px 1265,500, in Korona, 1,603 m).
- **Neighbours on the model** (polygons touching or overlapping): Korona / NE (`rmuqm3urh0mo6`), arachnoid canyons
  (`rmvarachnoids`), Tiers (`rmvp5il0uz1yf`), N Outlands (`rmvp5489oiy6z`), ria valley (`rmvriavalley`), spider lake
  (`rmvyj4v2ozgb1`), the Coyote Kingdom (political). The polygon overlaps N Outlands, the Arachnoids and the Tiers along its
  south and east edges, and touches the Outland Gate polygon at the Gate shoulder. **The sketch's ids for Korona
  (`rmuqm76f7cb74`), the Arachnoids (`rmuqm9fa9dfa7`) and Outland (`rmuqmb59f1f14`) are not in the region store.**

## 2. Geology and landforms

The sketch's four-way story holds, and it is good geology. In the order the rocks formed:

1. **The impact rim (the host rock).** Concentric slump terraces, shatter-coned gneiss and breccia. **Pseudotachylite**:
   black glassy friction-melt veins and sheets along the slump faults, polished to "mirrors" where a fault surface is bared.
2. **Korona's contact aureole (the skarns).** Heat from Korona's dome baked the wall's carbonate and breccia into **skarn**:
   bands of green epidote, red-brown grossular garnet, black magnetite and white marble. Real skarns form where an intrusion
   meets limestone; the plan takes Korona's dome as the heat source. Skarns are the classic host of iron, copper, tungsten
   and gold ores (a resource, section 5).
3. **The Arachnoids' dike swarm (the boxwork).** Basalt and diabase dikes radiate from the Arachnoids and cross the slump
   scarps. Harder than the host rock, they weather out as walls, and the walls box the ground into cells: the **cauldrons**.
   (Sketch: dikes 150-230 m high. A proposal; the model's 2 km grid cannot show them.)
4. **The Outland Gate fault (the plumbing).** Shear on the fault keeps deep fractures open; hot water rises through them into
   the cauldrons. (Sketch: 38-65 °C. A proposal.)

**Zones** (Gemini's five, re-banded to the model):

| Zone | Where (model) | Drawn by |
|---|---|---|
| `boxwork_cauldron`: warm tarns in dike-walled cells | the three tarns, 2.7-3.5 km | `KSTACKS.row` (`kind:'fin'`) for the dike walls on one strike; `KRELIEF.waters` and `WATER.open` for the tarn; `WATER.spring` and `WATER.terraces` for the warm springs and their sinter |
| `skarn_badlands`: banded green, red and white ribs | the north-west lowland's slopes, 3.5-5 km | `KRELIEF.gully` (badland gullies), `KSTRATA` with a skarn recipe (`KSTRATA.vary` for the bands) |
| `dike_lattice`: the dikes standing above the slopes | 3.5-6 km | `KSTACKS.row` fins; `KRELIEF.joints` for the cross-joints |
| `mirror_scarp`: slump faults with glassy faces | the Gate shoulder and the rim's inner face | `KRELIEF.slump` (blocks under a head scarp), `KRELIEF.scarp` for a single wall, `KRELIEF.talus` at the foot |
| `rim_crest`: tundra, ice and the airless crest | 5.5 km up; airless over ~9 km | `KGLACIER`, `KFROST`, `KFAR` for the crest past the map |

The fifth sketch zone (`fumarole_crest`, fumarolic ice caves at 4.5-5.8 km) has no vent on the model. It is kept as a
proposal for the owner: a few warm fractures reaching the ice (section 9).

## 3. Air and climate

- **Air** (at Copper Glacier's figures, 1.19 atm at 2,380 m and 0.71 atm at 6,500 m): the tarns at **1.11-1.15 atm**; the
  north-west lowland's median (3.4 km) about **1.05 atm**; the skarn ridges (4.8 km) about **0.88 atm**; the region's median
  (7 km) about **0.67 atm**; airless over ~9 km. The sketch's figures (1.08 atm at 2.8 km, 0.92 at 4.8 km) came from a
  different curve (`WORLD.md`'s 1.35 atm sea level with a 12.6 km scale height). The kit uses the Copper Glacier curve, as
  the Outlands plan does, unless the owner picks the other (section 9).
- **Climate classes**, whole polygon: O (airless) 36%, HT 13%, HF 12%, Dfc 12%, ET 10%, EF 10%, Cfa 4%, Dfb 1%, Cfb 1%.
  Ground under 4.5 km: **Dfc 54%, Cfa 20%**, ET 9%, Dfb 7%, Cfb 6%; median rain **1,505 mm**; mean 8 °C, warmest month
  18 °C, coldest -3 °C.
- **The cauldrons are wet and cool-temperate** (WH tarns with 1,929-2,494 mm and means of 9-11 °C). Gemini's "Cfb cloud
  oasis" fits the Vitreous and Garnet cauldrons; it is a geothermal pocket in Dfc country, not a separate class on the model.
- **The Gate shoulder is dry** (549 mm, Csa and Dsc): the rain shadow of the high crest, open to the gap's warm air.
- Read each station's `tm`, `tw`, `tc` and `p` again when the kit starts.

## 4. Life

Flora is read in place from kits that have it; this kit adds only what the cauldrons and skarns need.

| Zone | Life | From |
|---|---|---|
| **Cauldron tarns** | thermophile mats banded by temperature round the springs; reeds; warm meadow | the geyser kit (`biomes/geyser`) |
| **Cauldron floors** (Vitreous, Garnet) | the sketch's tree ferns and podocarps as a moist, mild forest under the dike walls | Korona's wet-wall plants (`wallfern`, `bladderpool`, once Korona exports them); swbay's fern and conifer species |
| **North-west lowland** (Dfc, Cfa) | boreal forest grading to temperate broadleaf near Spider Lake | nwouterwall's wall flora (its "fur" theme); the Spider Lake kit's silk-forest trees when that kit exists (parked) |
| **Skarn badlands** | sparse: metal-tolerant cushions and lichens on the bands, bare marble | Copper Glacier's cushions; the Throne's ash-desert plants |
| **Rim crest** (ET, EF, HT) | snow algae, lichen, frost coral; nothing on the airless crest | Copper Glacier |

**Animals** (`kits/fauna`, as `BIO.record` records): ibex and goats on the dike walls; marmots on the badlands; raptors on
the cauldrons' thermals; Spider Lake's eusocial spiders and their silk at the north-west lowland's edge (Spider Lake's plan;
the spider lineage is the fauna kit's to define). **Proposed:** warm-water invertebrates in the tarns.

## 5. People

- **Nobody lives here** on the model: no settlement, camp or polity polygon.
- **Who comes:**
  - the **Coyote Men** and the **Tierhounds** (`biomes/outlands/PLAN.md` section 6; not yet in `LORE.md`), from the N Outlands
    and the Gate to the south-east. The Gate shoulder faces their country;
  - **Spider Lake's silk-gatherers** (Spider Lake's plan) on the north-west lowland.
- **What they would come for:** the skarns' ores (magnetite iron, copper, garnet as an abrasive, epidote and garnet as gem
  rough) and the warm cauldrons. **Proposed:** quarrymen's and prospectors' camps (`core/camp`, `KCAMP`), temporary; skarn
  ore nodes from `kits/resources` (iron, copper; the grade read at build).
- **Player outposts:** the Vitreous and Garnet cauldrons have water, warmth and shelter. As the owner's rule asks, the kit
  only offers their benches as candidate sites to the open world's player-settlement registry and draws nothing for them.

## 6. Dangers

Each maps to a `KHAZ` kind (`core/hazard/README.md`).

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Gas pooling** (CO₂ from the springs settling on still nights) | cauldron floors | `gas`, pooled with `KHAZ.poolK` (`21-core-hazard-flow.js`, opt-in); the night timing is the shared amendment |
| **Hot water and ground** | spring vents and the tarns' hot margins | `heat` |
| **Sinter crust over hot water** | spring aprons | `sink` (the shared breaking-crust amendment) |
| **Glassy faces and scree** | mirror scarps, pseudotachylite slabs, dike talus | `slip`, `fall` |
| **Rockfall** | under the dike walls and scarps | `crush` |
| **Cold and thin air** | everything over the cauldrons; airless crest | `KHAZ.provide('temperature')`, `'pressure'` |
| **Drowning** | the tarns | `drown` |

Signs: dead birds and bare hollows for gas; mat colour for heat; a hollow ring for the crust; fresh talus under a wall.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **Vitreous Hollow** | 1258,326 | tarn 2,950 m; walls to 4,809 m; 1.11 atm | the cauldron: the warm tarn, dike walls on all sides, sinter springs, mats, the fern-and-podocarp floor; gas at night |
| 2 **Garnet-Mirror Cauldron** | 1186,344 | tarn 2,810 m; walls to 6,308 m; 1.13 atm | the deep cauldron: red garnet skarn cliffs and black dikes over a still tarn, the wettest station (2,211 mm) |
| 3 **Epidote Badlands** | 1200,330 | 4,780 m (ET); 0.88 atm | the skarn ribs between the two cauldrons: green, red, black and white bands in gullies, ore outcrops, a prospectors' camp |
| 4 **Gate Shoulder** | 1430,345 | 2,867 m (Csa, 643 mm), 1,972-4,538 m within 8 km | the mirror scarp: slump blocks with glassy faces, looking east down into the Outland Gate (the border with `biomes/outlandgate`) |

**Station 1 comes first:** it is the reachable cauldron (lowest crest out 3,728 m), it holds the kit's signature (a warm
tarn in a dike box), and its geothermal surfaces are the shared amendment the other plans want. Gemini's "Pseudotachylite
Mirror-Scarp" over the Web-Cleaver Gorge is folded into station 4: the Web-Cleaver runs outside the polygon. The sealed
Epidote-Steam Tarn gets no station unless the owner opens it (section 9).

## 8. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| relief | `KRELIEF` (38, 38c) | `slump`, `scarp`, `talus`, `gully`, `joints`, `waters` |
| dikes | `KSTACKS.row` (`kind:'fin'`) | the dike walls on one strike; a second row across for the boxwork |
| strata | `KSTRATA` (`create`, `vary`, `drape`) | the skarn bands and the gneiss; a skarn recipe (amendment 1) |
| glacier and frost | `KGLACIER` (44g), `KFROST` (42) | the rim crest |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | cover masks; the crest and the far wall |
| water | `core/water` (`WATER.open`, `spring`, `terraces`, `flow`) | the tarns, springs, sinter steps, outflow streams |
| flora | `core/biome` | read in place: geyser, Korona, swbay, nwouterwall, Copper Glacier, the Throne |
| sky, weather | `core/atmos` | the standard sky; fog in the cauldrons |
| hazards | `core/hazard` (`KHAZ`, `21-core-hazard-flow.js`) | section 6 |
| camps | `core/camp` (`KCAMP`) | prospectors' camps |
| fauna | `kits/fauna` | section 4 |
| resources | `kits/resources` | iron and copper nodes in the skarn |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no: nobody lives here |

`tools/check_core_use.py` must pass.

**Core amendments needed:**
1. **A skarn recipe for `KSTRATA`** (new): irregular, lensing bands (epidote green, garnet red-brown, magnetite black,
   marble white), not flat beds. `KSTRATA.vary` may already be enough; check at build before proposing code.
2. **Geothermal surfaces** (shared: mud pots, fumaroles, sinter and mat decals; `core/water` README "Not here (yet)").
3. **Night gas pools** (shared hazard amendment), on `KHAZ.poolK`.
4. **A breaking crust** (shared hazard amendment).
5. **Rock glaze** (shared: the rock iridescence glaze) for the pseudotachylite mirrors and the magnetite's sheen.
6. **The player-settlement registry** (shared, open world).

**Textures owed** (to `core/materials/PROMPTS-NEEDED.md` when the kit starts): skarn (epidote-garnet banded), pseudotachylite
fault mirror, contact marble. `stone.obsidian` exists and may serve the glass.

## 9. For the owner

- **The sealed tarn.** The Epidote-Steam Tarn (1342,338) is ringed by airless walls (lowest crest out 11,535 m). Keep it as
  a sealed, unreachable cauldron (seen from the air, or reached by a tunnel), or ask Gemini to cut a notch?
- **The heat.** The model has no vent here. Is the cauldrons' warmth hot springs only (the plan), or also fumaroles on the
  crest (Gemini's `fumarole_crest`)?
- **The air curve.** Copper Glacier's (used here and in the Outlands plan) or `WORLD.md`'s (used by Gemini's sketches)?
- **Overlaps.** The polygon overlaps N Outlands, the Arachnoids and the Tiers. Trim it on the model?
- **Who quarries the skarns:** the Tierhounds, Spider Lake's people, or nobody yet?
- **Names:** the tarns keep Gemini's English names. Hum names (the Coyote tongue, as the rivers have) are open.
- **Order:** after Korona's 5.1 station sites (`STATIONS-MAP-5.1.md`) and the owner's ruling on the Outland Gate
  (`biomes/outlandgate/PLAN.md` section 9), since station 4 looks into it.

## Sources

- Gemini's sketch (this file, 2026-11-02) and the region note (`smodel/nw_expansion.py`, ~line 2642);
- the model's data at `gemini/scale-model-5.1-r3`, read with `smodel.page` (heights, `wl`, `c`, `p`, `tm`, `tw`, `tc`);
- `model/data/rivers.json`, `vents.json`, `tubes.json`, `volc.json`; `model/src/51-region-store.js`, `60-settlements.js`;
- `smodel/river_names.py` (Hām-Tsēk, Hau-Gèl);
- `biomes/outlands/PLAN.md`, `SURVEY.md`; `biomes/spiderlake/PLAN.md`; `biomes/korona/PLAN.md`; `biomes/firebliss/PLAN.md`;
- `core/README.md`, `core/terrain/LANDFORMS.md`, `core/hazard/README.md`, `core/water/README.md`;
- `HANDOFF-REBUILD.md`, `tools/scale-model/HANDOFF-GEMINI-5.1.md`.
