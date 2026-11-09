# The Outland Gate: the plan (build plan, 2026-11-09)

The Outland Gate (`rmvoutlandpass`, "outland gate") is a deep, wide trough through the north-eastern Outer Wall on map 5.1.
The **Outland Gate River** (Hau-Gèl) runs down it from the N Outlands' lake to Spider Lake. Its floor is warm, low and wet;
its walls climb to 10-14 km of airless rock on both sides.

Gemini's sketch (2026-11-02) gave the idea, the river and the stations. This plan keeps those, corrects the heights, the
air, the climate and the river from the model, and adds the people, the hazards and the core adoption. Nothing is built. The
owner wants a kit here (2026-11-02, `HANDOFF-GEMINI-5.1.md` item 5). It goes in the rebuild's queue after the frozen
integration pass. All px below are on the 5.1 canvas (1821 x 1723, 2 km/px).

**The plan has one open conflict, for the owner (section 9):** the gap is not the Gate. The Gate of the Outlands plan is a
7.7 km pass about 110 km to the south-west. On 5.1 the gap gives the Outlands a second, far lower way in, which breaks the
Outlands' "one crossing" rule. This plan states both and does not choose.

## 1. What the map carves (Gemini, map 5.1)

The trough is sculpted in `tools/scale-model/smodel/nw_expansion.py` (section 6A, `is_ne_connector`; the river traced at
~line 1655; the region note at ~line 2628). The numbers were read from the model (`smodel.page`, 2026-11-09, branch
`gemini/scale-model-5.1-r3`).

- **Size:** 30,080 cells of 2 km, about **120,320 km²** (the sketch said 86,400 km²). The polygon runs from px 1345,215 at
  Spider Lake to px 1475-1565,475 at the Outlands.
- **Heights:** p5/p25/p50/p75/p95 = **1,532 / 1,939 / 4,326 / 9,065 / 11,208 m**. Lowest 1,269 m at px 1348,216 (the mouth);
  highest 12,839 m at px 1419,387 (the west wall).

  | Band | Cells | Share |
  |---|---|---|
  | under 2,000 m (the floor) | 8,016 (32,064 km²) | 27% |
  | 2,000-3,500 m (benches, lower walls) | 5,432 | 18% |
  | 3,500-5,500 m | 3,560 | 12% |
  | 5,500-9,000 m | 5,446 | 18% |
  | over 9,000 m (airless) | 7,626 | 25% |

  **The sketch was wrong on the walls.** It framed the floor with 4,400-7,600 m peaks; the model's walls reach 10-14 km.
- **The floor.** Ground under 2 km is **48-86 km wide** along the whole run (24-43 cells a row, y 220-460). It is narrowest
  at y 320-380 (about 50 km). Cross-section at y 336: floor 1,447 m at px 1442; 4-5 km within ~24 km either side; the west
  wall 13,830 m at px 1376, the east wall 10,595 m at px 1508. A walled trough, not a narrow gorge.
- **The river: Hau-Gèl** ("Coyote-Gate River" in Hum, `smodel/river_names.py`; `id 9106`). On the model:
  - from the **N Outlands' lake** at px 1584,513 to **Spider Lake** at px 1328,228;
  - **846 km** along its line, flow **180 m³/s rising to 640 m³/s** at the mouth;
  - the sketch's 980 km and 1,420 m³/s, and `river_names.py`'s 360 km, do not match the data.
  - The floor under it is **flat at 1,447 m for ~150 km** (px 1551,477 to 1456,361), then falls to 1,396 m at the mouth. A
    river needs fall: the kit grades its own bed (section 8).
- **Lakes:**
  - **Upper Gate Tarn** (inside): centre px 1544,474, **56 cells, level 1,521 m** (the sketch said 1,720 m), class WH.
  - **The N Outlands' lake** (outside, just south of the polygon): px 1588,517, **level 2,345 m**. The sketch's "North
    Outland Lake, +1,734 m" is this lake; the model says 2,345 m. It is the Outlands survey's "Cfa lake at 2,345 m" (old px
    1316,186; `biomes/outlands/SURVEY.md` section 2).
  - **Spider Lake** at the mouth, 1,460 m.
- **Side streams:** seven short dry channels (`r460`, `r547`, `r686`, `r689`, `r769`, `r851`, `r852`, Hum names, 0 m³/s) on
  the east benches at px 1465-1561, y 414-478.
- **No vents, tubes or volcanoes** inside.
- **No settlements** inside. **The Gate** (outpost, px 1408,414) stands outside, in the N Outlands polygon (section 9).
- **Neighbours on the model:** spider lake (`rmvyj4v2ozgb1`), ria valley (`rmvriavalley`), N Outlands (`rmvp5489oiy6z`),
  tharn uplands (`rmvtharnuplands`); the NE Outer Wall (`rmvymakpc0pft`) touches it at the west wall's shoulder. The
  polygon **overlaps Spider Lake's** at the mouth, and the ria valley's and N Outlands' at its ends. The sketch's id for
  Outland (`rmuqmb59f1f14`) is not in the region store.
- **Lost station:** the Outlands' planned station 5, the Nursery Plateau (old px 1269,130 = 5.1 px 1541,460), now lies in
  this polygon. The carve took it from 3,783 m BWk to 1,676 m Cfa (`biomes/STATIONS-MAP-5.1.md`).

## 2. Geology and landforms

The sketch's three-stage origin is good geology and stays, marked as the plan's story (the model has no history):

1. **A radial tear** in the rim from the impact, on a NNW-SSE line.
2. **A pull-apart:** right-lateral shear on the Outland Gate fault opened a trough between the NE Outer Wall and the Tharn
   rim. The flat floor and the parallel walls fit a pull-apart basin.
3. **Outburst floods:** ice-dammed lakes in the Outlands broke through and scoured the floor (the sketch's jökulhlaups). Real
   outburst floods leave giant current ripples, scabland channels and erratic boulders (the Channeled Scablands, the Altai).

**Zones** (Gemini's five, re-banded to the model):

| Zone | Where (model) | Drawn by |
|---|---|---|
| `braid_floor`: the river's braid plain and tarns | the floor, 1.27-2 km | `KRELIEF.gap` (a water gap and its `stream` for `WATER.flow`), `KRELIEF.meander`, `WATER.flow`, `WATER.open` |
| `ripple_bench`: giant ripples and erratic blocks | floor edges, 1.5-2 km | kit work on `KRELIEF.shape` (amendment 3); boulders as `KSTACKS` balanced rocks |
| `skarn_alcove`: the west wall's warm seeps | west benches, 2-2.4 km (px 1416,312; 1429,331; 1446,368) | `WATER.spring`, `WATER.terraces` (travertine); `KRELIEF.slump` for the alcoves |
| `banner_gallery`: wind-trained woods on the benches | benches 2-3.5 km | `core/biome`; the wind amendment for the flagging |
| `fault_wall`: the walls | 3.5 km to the airless crest | `KRELIEF.relay` (en-echelon fault scarps: the pull-apart's walls), `KRELIEF.scarp`, `KRELIEF.talus`, `KSTRATA`, `KGLACIER` high up, `KFAR` for the crest |

Basalt dikes from the Arachnoids may cross the west wall as ribs (`KSTACKS.row` fins): the sketch's "organ buttress".

## 3. Air and climate

- **Air** (Copper Glacier's figures, 1.19 atm at 2,380 m, 0.71 atm at 6,500 m): the floor at 1,447 m about **1.34 atm**;
  the mouth (1,396 m) 1.35; the benches (2.1 km) 1.23; the region's median (4.3 km) 0.94; airless over ~9 km. The sketch's
  1.17-1.20 atm used `WORLD.md`'s curve (the same question as the NE Outer Wall's plan, section 9).
- **Climate classes**, whole polygon: Cfa 36%, O (airless) 27%, ET 8%, HF 7%, Dfc 6%, EF 5%, Csa 4%, HT 3%. Ground under
  4.5 km: **Cfa 71%**, Dfc 12%, Csa 7%, Dsc 3%; median rain 1,035 mm; mean 19 °C, warmest month 29 °C, coldest 8 °C.
- **The floor is warm and humid (Cfa), not Cfb/Dfb as the sketch had it.** Floor under 2 km: median rain 1,066 mm, mean
  20 °C. At the narrows (px 1442,336) the model gives a mean of 25 °C and a warmest month of 38 °C: hot. Read again at build.
- **Wetter at the mouth, drier on the west benches:** Spider Lake's end 1,929 mm; the narrows 956 mm; the west benches'
  Csa strip 666-776 mm; the Upper Gate Tarn only 313 mm (a dry pocket).
- **The wind** (the sketch's "Bellows of the North", a proposal): a trough this deep between airless walls channels air.
  Daytime up-valley flow from Spider Lake (the "Silk-Draught", with ballooning spiderlings); night and winter down-valley flow
  from the higher Outlands (the "Outland Bore"). It needs the shared cold-air and katabatic wind amendment.

## 4. Life

The gap joins two worlds: the Outlands' native, fungoid flora to the south (`biomes/outlands/PLAN.md` section 2) and Spider
Lake's and the crater's flora to the north. **It is an ecotone**, and what crosses it depends on the owner's ruling
(section 9).

| Zone | Life | From |
|---|---|---|
| **Floor and banks** (Cfa) | riparian woods, reeds, braid-bar pioneers | Spider Lake's silk-forest trees (when built); swbay's warm species |
| **The southern floor** | the Outlands' fungoid natives leaking north | `core/biome/33-core-fungoid.js` (planned in the Outlands plan) and the Outlands kit, read in place |
| **West seeps** | travertine mats, ferns, mosses round warm water | the geyser kit; Korona's wall ferns |
| **Benches** (Cfa, Csa, Dfc) | wind-trained woods (the sketch's banner-larch and iron-birch: proposals) grading to dry scrub on the Csa strip | nwouterwall, ebadlands scrub |
| **Walls** (ET, EF, HF) | lichen, snow algae, then bare rock | Copper Glacier |

**Animals** (`kits/fauna`): Spider Lake's spiders at the mouth; the Outlands' hexapods, ostriches and the runner bird (the
trickster's sacred bird) from the south; raptors on the walls' updrafts; goats and ibex on the benches. Who reaches whose
side is the same open question.

## 5. People

- **Nobody lives here** on the model.
- **Who passes**, on the plan's present lore:
  - the **Coyote Men** of the N Outlands (Hum speakers; the rivers here have Hum names) and the **Tierhounds** who keep the
    Gate (`biomes/outlands/PLAN.md` section 6; not yet in `LORE.md`);
  - **Izani caravans** carrying the Outlands' trade (emeralds, turquoise, feathers out; grain, metal, cloth in), if the gap
    is a trade road (section 9);
  - **Spider Lake's people** (Spider Lake's plan) at the mouth.
- **NPC sites** (drawn by the kit only after the ruling): caravan camps on the floor (`core/camp`, `KCAMP`); cairns and
  milestones with Coyote contour carvings. The sketch's **Skarn-Seep Hanging Caravanserai** is a proposed NPC caravanserai on
  the west bench (station 2). A Tierhound toll post here is the owner's call (section 9).
- **Player outposts:** the floor's benches have water, warmth and dense air. The kit only offers them as candidate sites to
  the player-settlement registry and draws nothing for them.

## 6. Dangers

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Outburst flood** (the lake at 2,345 m breaking through) | the whole floor | `drown`, `crush`, timed: the shared gorge-flood amendment |
| **The river** (180-640 m³/s) | crossings, braid channels | `drown` |
| **Rockfall and avalanche** off 10-14 km walls | wall feet, talus fans | `crush` |
| **Cliffs** | walls, bench edges | `fall` |
| **Wet travertine** | the west seeps | `slip` |
| **Summer heat** (warmest month 29-38 °C on the floor) | the floor | `KHAZ.provide('temperature')` |
| **Cold and thin air** | the walls; airless crest | `'temperature'`, `'pressure'` |
| **Gap wind** | the narrows | weather (the shared katabatic amendment); a `slip`/push on exposed benches is kit work |
| **Predators** | spider ground at the mouth | `hunter` (the fauna kit's places predators hold) |

## 7. Stations (proposed, on the 5.1 map)

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **The Narrows** | 1442,336 | floor 1,447 m; 1.34 atm; Cfa, 956 mm | the gap itself: the braided river on a 50 km floor, walls climbing to 4-5 km within the view and to 10-14 km beyond (`KFAR`); the wind |
| 2 **West Bench** | 1441,306 | 2,100 m bench (125 cells); 1.23 atm; Cfa, ~1,100 mm | the warm seeps and travertine alcoves on the west wall; the proposed caravanserai; the dike ribs |
| 3 **Upper Gate Tarn** | 1544,474 | tarn 1,521 m; 1.33 atm; WH, 313 mm | the south end: the tarn, flood-scoured ground (ripple bars, erratics), the fungoid flora coming in from the Outlands |
| 4 **Spider Lake Threshold** | 1331,230 | 1,396 m; 1.35 atm; Cfa, 1,929 mm | the mouth: the river into Spider Lake's eastern bay, silk in the woods |

**Station 1 comes first:** it shows what the kit is (a low, wide gap under airless walls), it needs only `KRELIEF.gap`,
`WATER.flow` and `KFAR`, and its picture is what the owner's ruling turns on. Gemini's "Gate Narrows and Mirror-Scarp" and
"Singing Basalt Organ-Buttress" are folded into stations 1 and 2.

## 8. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the gap | `KRELIEF.gap` (38) | the water gap and its `stream`, graded so the river falls (the model's floor is flat) |
| walls | `KRELIEF.relay`, `scarp`, `slump`, `talus` (38, 38c) | the en-echelon fault walls, alcoves, talus fans |
| river | `core/water` (`WATER.flow`, `open`, `network`, `spring`, `terraces`) | Hau-Gèl and its braids, the tarn, the seeps, travertine |
| rock | `KSTRATA`, `KSTACKS.row` (fins), `KSTACKS` balanced rocks | wall beds, dike ribs, erratics |
| ice | `KGLACIER` (44g), `KFROST` (42) | the high walls |
| ground, far | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | cover; the 10-14 km walls past the map |
| flora | `core/biome` | read in place: Outlands (fungoid), Spider Lake, swbay, geyser, Korona, nwouterwall, ebadlands, Copper Glacier |
| sky, weather | `core/atmos` | the standard sky; valley fog at the mouth |
| hazards | `core/hazard` (`KHAZ`) | section 6 |
| camps | `core/camp` (`KCAMP`) | caravan camps, after the ruling |
| fauna | `kits/fauna` | section 4 |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no |

`tools/check_core_use.py` must pass.

**Core amendments needed:**
1. **Gap wind** (shared: cold-air and katabatic wind), with a day up-valley mode.
2. **A gorge flood** on a cycle (shared hazard amendment).
3. **Flood bedforms** (new, small): giant current ripples on a floor, as a `KRELIEF` form in `38c` beside `terraces` and
   `runout`. Kit work first; lift to core if another plan (the scablands) wants it.
4. **The player-settlement registry** (shared, open world).
5. **Proposed, not core terrain:** the wind-sounding rock (the sketch's singing basalt) as a `core/audio` soundscape source.

## 9. For the owner

**The conflict: the gap and the Gate.**
- **They are different places.** The Gate (outpost, px 1408,414) stands at **8,002 m** on the 5.1 model (0.59 atm), in the
  N Outlands polygon, about **110 km** south-west of the gap's floor. The god's road's high point (old px 1171,106 = 5.1 px
  1443,436) is 7,745 m, about 70 km from the floor. The gap's floor is 1,400-1,700 m.
- **The Outlands plan says the Gate is the one way in** (`biomes/outlands/PLAN.md` section 1; `SURVEY.md` section 3: "one
  way in ... a high pass in thin air"). Its island rule rests on that: a lowland lineage cannot cross 7.7 km.
- **On 5.1 that is no longer true.** A flood fill on the model gives the lowest crest a walker must climb: Spider Lake to
  the Sleeping City, 1,747 m; the N Outlands' lake to Spider Lake, 2,345 m (the lake's own level); Trickster's House to the
  N Outlands' lake, 3,617 m. So **Trickster's House is reachable from the crater floor with no crest over 3.6 km**.
- **The sketch also claims the gap is "the sole low-altitude breach"** of the NE rim, and the river's Hum name means
  "Coyote-Gate River": Gemini seems to have meant the gap as the Coyotes' gate.

Ways forward, for the owner to choose (the plan does not):
- **(a) Keep the gap.** Move the Gate (the Tierhounds' toll fort) down into it, re-route the god's road, and rewrite the
  Outlands' isolation (for example: the outburst floods are young, so the native flora was cut off before the gap opened).
- **(b) Keep the Outlands sealed.** Gemini closes the gap on the model: a high sill or a plug, and the river re-routed or
  ended in the lake.
- **(c) Keep both,** with the gap closed by something other than height (a taboo, the Tierhounds' wall, Spider Lake's
  spiders). The island rule then needs a reason for the plants as well as the people.

**Also open:**
- the air curve (Copper Glacier's or `WORLD.md`'s);
- the Outlands' lost Nursery Plateau station (re-site it, `STATIONS-MAP-5.1.md`);
- the flat 150 km floor: grade it on the model, or let the kit grade it;
- overlaps with Spider Lake's, the ria valley's and N Outlands' polygons;
- names: the river is Hau-Gèl; the tarn, benches and stations keep Gemini's English names until Hum names are given.
- **Order:** the ruling first; then station 1.

## Sources

- Gemini's sketch (this file, 2026-11-02) and the region note (`smodel/nw_expansion.py`, ~lines 1487, 1655, 2628);
- the model's data at `gemini/scale-model-5.1-r3`, read with `smodel.page` (heights, `wl`, `c`, `p`, `tm`, `tw`, `tc`);
  the crest figures by a flood fill on the heights with lake levels;
- `model/data/rivers.json` (9106 and the side channels), `vents.json`, `tubes.json`; `model/src/51-region-store.js`,
  `60-settlements.js` (The Gate, Trickster's House);
- `smodel/river_names.py` (Hau-Gèl);
- `biomes/outlands/PLAN.md` (sections 1, 2, 6), `biomes/outlands/SURVEY.md` (sections 2, 3);
- `biomes/STATIONS-MAP-5.1.md` (the Nursery Plateau); `biomes/spiderlake/PLAN.md`; `biomes/neouterwall/PLAN.md`;
- `core/README.md` (`KRELIEF.gap`, the unbuilt plans' pieces), `core/terrain/LANDFORMS.md`, `core/hazard/README.md`;
- `tools/scale-model/HANDOFF-GEMINI-5.1.md`.
