# The Outland Gate: the plan (build plan, 2026-11-09)

The Outland Gate (`rmvoutlandpass`, "outland gate") is a deep, wide trough through the north-eastern Outer Wall on map 5.1.
The **Outland Gate River** (Hau-Gèl) runs down it from the N Outlands' lake to Spider Lake. Its floor is warm, low and wet;
its walls climb to 10-14 km of airless rock on both sides.

Gemini's sketch (2026-11-02) gave the idea, the river and the stations. This plan keeps those, corrects the heights, the
air, the climate and the river from the model, and adds the people, the hazards and the core adoption. **Station 1, the Narrows
and the Gate, is built (2026-11-11, `dist/outlandgate.html`; verified in software GL only: the GPU verify is owed;
`KNOWN_ISSUES.md`, `BIOME-API.md`). Stations 2-4, the West Bench's seeps, the Upper Gate Tarn and the Spider Lake Threshold, are built
the same day (`python3 build.py --station seeps | tarn | mouth`; software GL only), each at a moved pixel (section 7, as built).** Station
5, the Nursery Bench, is built by the Outlands kit. The map edit (section 9) is
not made. The
owner wants a kit here (2026-11-02, `HANDOFF-GEMINI-5.1.md` item 5). It goes in the rebuild's queue after the frozen
integration pass. All px below are on the 5.1 canvas (1821 x 1723, 2 km/px).

**The conflict is settled (the owner, 2026-11-09): the gap stays, and The Gate moves into it.** The Tierhounds' toll fort
now stands at the Narrows (px 1438,326) and closes the floor with a long wall; the Outlands' rule becomes "one crossing,
the gap, held by the toll fort" (section 9). The god's road runs through the gap. The Outlands' lost Nursery Plateau comes
back as a station shared with this kit, on the dry bench at the gap's head (section 7).

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
- **No settlements** inside on the model yet. **The Gate** (`sthegate`, outpost) stands at px 1408,414 (8,002 m) in the N
  Outlands polygon; **it moves to px 1438,326 on the Narrows' floor** (the owner, 2026-11-09; the map edit moves the marker:
  section 9).
- **Neighbours on the model:** spider lake (`rmvyj4v2ozgb1`), ria valley (`rmvriavalley`), N Outlands (`rmvp5489oiy6z`),
  tharn uplands (`rmvtharnuplands`); the NE Outer Wall (`rmvymakpc0pft`) touches it at the west wall's shoulder. The
  polygon **overlaps Spider Lake's** at the mouth, and the ria valley's and N Outlands' at its ends. The sketch's id for
  Outland (`rmuqmb59f1f14`) is not in the region store.
- **Lost station:** the Outlands' planned station 5, the Nursery Plateau (old px 1269,130 = 5.1 px 1541,460), now lies in
  this polygon. The carve took it from 3,783 m BWk to 1,676 m Cfa (`biomes/STATIONS-MAP-5.1.md`); the model now gives
  1,719 m, Cfa, 1,552 mm there. **It comes back on the gap's head** (section 7, the Nursery Bench).
- **The gap's head** (the model, 2026-11-09). South of the Upper Gate Tarn the floor climbs to the N Outlands' lake
  (2,345 m) and the ground south-west of the lake's outlet rises in a 2.1-2.2 km scarp to a **dry tableland at 3.9-4.0 km**:
  along x 1558, Cfa 1,785 m and 1,160 mm at y 500, Csa 2,423 m at y 506, Dsc 3,285 m at y 510, BWk 3,881 m and 203 mm at
  the rim (y 513), BWk 3,963 m and **94 mm** at y 520, mean 6 °C (19/-7). It is part of the N Outlands' largest cold desert
  (BWk and BSk, 5,524 km² round px 1585,544, median 3,886 m, 203 mm).

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
  20 °C. At px 1442,336 the model gives a mean of 25 °C and a warmest month of 38 °C, but rows 314-328 (the Gate's
  stretch, 1438,326) give 19 °C (29/8): the temperature raster steps at y 330. Read again at build.
- **Wetter at the mouth, drier on the west benches:** Spider Lake's end 1,929 mm; the narrows 956-988 mm; the west benches'
  Csa strip 666-776 mm; the Upper Gate Tarn's cells 313 mm (the lake class's own figure; its shores take 1,300-1,600 mm).
- **The gap's head is the dry edge:** 1,160 mm on the upper floor (1558,500), 203 mm on the rim (1558,513), 94 mm on the
  tableland (1558,520). The rain falls in the gap and stops at its head.
- **The wind** (the sketch's "Bellows of the North", a proposal): a trough this deep between airless walls channels air.
  Daytime up-valley flow from Spider Lake (the "Silk-Draught", with ballooning spiderlings); night and winter down-valley flow
  from the higher Outlands (the "Outland Bore"). It needs the shared cold-air and katabatic wind amendment. The Bore now
  carries two jobs (2026-11-09): it cuts the Nursery Bench's yardangs at the gap's head, and it keeps the leak of plants one
  way, out of the Outlands (section 9).

## 4. Life

The gap joins two worlds: the Outlands' native, fungoid flora to the south (`biomes/outlands/PLAN.md` section 2) and Spider
Lake's and the crater's flora to the north. **It is an ecotone.** With the gap kept (the owner, 2026-11-09), the plan
proposes that the leak runs **one way, north**: the Outlands' natives come down the gap on the night wind and the river,
while the crater's lowland plants stop at the gap's head, where every way on into the basins climbs into cold steppe and
cold desert (section 9, "the new isolation"). So the southern floor carries fungoid stragglers among Earth-like woods, and
the Nursery Bench above the head is wholly native.

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

- **The Gate** (the owner, 2026-11-09: moved here). The **Tierhounds' toll fort** stands on the Narrows' floor at **px
  1438,326** (1,423 m, 1.34 atm, Cfa, 988 mm, 19 °C (29/8)), with the trickster's shrine.
  - **Why there:** it is the narrowest stretch of floor on the gap's northern run. Across row 326 the floor within 300 m of
    the river is 30 km wide (1431 to 1446; 1,760 and 1,763 m at its edges); within 1 km, 62 km; the walls stand 5.2 km at
    1411,326 and 4.9 km at 1465,326, and 10-14 km beyond. The +300 m floor is 22-24 km at a few points further south
    (1526-1538, 456-465), but those lie 300 km up the gap with no shoulder beside them. The Narrows has the NE Outer Wall's
    **Gate shoulder** (a low lobe at 2.6-3.8 km, centre 1427,351) on its west side for a citadel over the floor.
  - **How it closes the valley** (*proposed*): a fort cannot close 30 km of floor alone. The Tierhounds close it as Derbent
    closed the Caspian Gates: a **long wall** from wall foot to wall foot (1431,326 to 1446,326), the fort and its toll gate on
    the river at its middle, towers every few kilometres, a citadel on the Gate shoulder. The river passes under a water
    gate. Every caravan, and the god's road, goes through the gate.
  - **Reaching it:** the Tierhounds' own country (the Tiers) reaches the gap's floor over crests no higher than about 3.9 km
    (a minimax flood fill from the Tiers' centre, 1275,495), so the fort is theirs to supply.
  - **The old pass** at 1408,414 (8,002 m) loses the fort. *Proposed*: it keeps a cairn and a trickster's shrine as the
    "old gate" of the stories, crossed by nobody but pilgrims.
- **Who passes:**
  - the **Coyote Men** of the N Outlands (Hum speakers; the rivers here have Hum names) and the **Tierhounds**
    (`biomes/outlands/PLAN.md` section 6; not yet in `LORE.md`);
  - **Izani caravans** carrying the Outlands' trade (emeralds, turquoise, feathers out; grain, metal, cloth in): the gap is
    the trade road, and the Tierhounds take the toll at the wall;
  - **the god's road** (the owner's, 2026-10-26, re-routed here 2026-11-09): from the Sleeping City by Spider Lake, up the
    gap, through the gate at the Narrows, past the Upper Gate Tarn and the N Outlands' lake to Trickster's House. Its highest
    point falls from 7.7 km to about 3.6 km (the crest between the lake and Trickster's House); `god_road.py` re-routes it and
    rewrites `openworld/gods-road.json` (the map session's work);
  - **Spider Lake's people** (Spider Lake's plan) at the mouth.
- **NPC sites:** the fort, the wall and the shrine are a settlement (the culture kit `kits/coyote`, later); until then the
  station carries them as plain records, as the Outlands plan does. Caravan camps outside the wall (`core/camp`, `KCAMP`);
  cairns and milestones with Coyote contour carvings. The sketch's **Skarn-Seep Hanging Caravanserai** is a proposed NPC
  caravanserai on the west bench (station 2), north of the wall, where caravans wait for the toll.
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
| **The wall's guards** (the toll, the seed law) | the Narrows | not a `KHAZ` kind: the open world's faction rules |

## 7. Stations (proposed, on the 5.1 map)

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **The Narrows and the Gate** (**built** 2026-11-11) | **1438,326** (was 1442,336) | floor 1,423 m; 1.34 atm; Cfa, 988 mm, 19 °C (29/8) | the gap itself: the braided river on a 30 km floor, walls climbing to 4-5 km 48-54 km out on either side and to 10-14 km beyond (`KFAR`); the wind; **the Tierhounds' long wall across the floor, the toll fort and water gate on the river, the shrine** (plain records until `kits/coyote`) |
| 2 **West Bench** (**built** 2026-11-11: `--station seeps`) | **1416,312** (was 1441,306: that pixel is on the EAST flank, the river at 1427 on its row; no bench on the model is flat) | 2,016 m on a 5 % slope; 1.23 atm; Cfa, 1,020 mm, 17 °C (27/7) | the warm seeps and travertine alcoves on the west wall (three springs, their rimstone stairs on WATER.terraces); the proposed caravanserai outside the wall (north of it); the dike ribs (KSTACKS fins); banner larch, iron birch, wind spruce, brook willow, tree ferns read in place |
| 3 **Upper Gate Tarn** (**built** 2026-11-11: `--station tarn`) | **1538,472**, the outlet (was 1544,474: the tarn's middle) | tarn 1,521.46 m; 1.33 atm; WH (the 313 mm is the lake cell's; the shores take 1,300-1,600 mm) | the south end: the tarn, flood-scoured ground (three flood terraces, the outlet coulee, giant current ripples, erratics), the fungoid flora coming in from the Outlands (young colonies, read in place); the god's road and the trickster's shrine; the Nursery Bench's scarp on the skyline to the south |
| 4 **Spider Lake Threshold** (**built** 2026-11-11: `--station mouth`) | **1328,228**, the mouth (was 1331,230: 6 km up the carved channel) | the lake 1,460 m (the model's 1,396 m floor lies under it: `KNOWN_ISSUES.md`); 1.35 atm; Cfa, 1,929 mm | the mouth: the river into Spider Lake's eastern bay over a delta, warm coves, silk in the woods (the gilded orb spiders' webs); Spider Lake's people's silk landing |
| 5 **The Nursery Bench** (shared; **owned by `biomes/outlands`**, its station 5; **built** there 2026-11-11) | **1558,516**, the rim at 1558,513 | 3,960-4,007 m; 0.98 atm; BWk/BSk, 94-109 mm, 6 °C (19/-7) | the old Nursery Plateau's idea on the gap's head: pod towers, brood pads and gall stacks on desert pavement, yardangs cut by the gap's night wind, the rim and the 2.2 km scarp down to the gap's upper floor; this kit reads it in place and draws the floor below it as its far field |

**Station 1 comes first:** it shows what the kit is (a low, wide gap under airless walls) and now the Gate, the reason the
gap matters. Its ground needs only `KRELIEF.gap`, `WATER.flow` and `KFAR`. Gemini's "Gate Narrows and Mirror-Scarp" and
"Singing Basalt Organ-Buttress" are folded into stations 1 and 2.

**The Nursery Bench, combined** (the owner asked, 2026-11-09: "can we combine the ideas maybe?"). The old station was the
Outlands' driest ground (BWk, 3,802 m, 31 mm, 8 °C (21/-5)): the hexapods' nests among pod towers, brood pads and gall stacks
on desert pavement, with yardangs. The gap's floor cannot hold that: every bench in the gap's south end is wet Cfa
(1,000-1,600 mm). The gap's **head** can. The tableland above the scarp at 1558,513-524 is BWk at 3.9-4.0 km with 94-203 mm,
as close to the old N2 as any ground left (3,963 m, 94 mm, 6 °C against 3,802 m, 31 mm, 8 °C). It stands over the place
where the gap begins, and the gap gives it what the old plateau only claimed: **a wind to cut the yardangs.** The night and
winter down-valley flow (the "Outland Bore", section 3) drains off the Outlands' plateau into the gap through its head, so
the yardangs line up with the gap's axis (NNW-SSE, *proposed*). The nursery and the gap are then one story: the hexapods
breed on the dry bench, and the spores they carry ride the same wind down the gap.

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
| camps | `core/camp` (`KCAMP`) | caravan camps outside the wall |
| the Gate | plain records (`core/tags`) until `kits/coyote` | the long wall, the toll fort, the water gate, the shrine (section 5); the kit places no settlement of its own |
| the Nursery Bench | `biomes/outlands`, read in place | station 5 is the Outlands kit's; this kit draws only the floor and the scarp's foot |
| fauna | `kits/fauna` | section 4 |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no |

`tools/check_core_use.py` must pass.

**As built, station 1 (2026-11-11).** Taken: `core/biome` (with 32's `BIO.kin`: ebadlands' cottonwood, oak and maple read in place;
33's stalk for the reeds), `core/rand`, `core/tags` (every tree, work and hazard a record), `core/space`, `core/host`, `core/atmos` (the
shared sky, the weather, the height fog), `core/water` (`WATER.flow`: the main channel and two braids), `KRELIEF.meander` (the river's
bends), `KGROUND`, `KFAR` (out to 70 km, on the model's own heights: `tools/far_grid.py` writes `src/44f-og-far-data.js` from
`tools/scale-model/model/data`), `KHORIZON`, `core/shadow`, `core/materials` (three ground layers); then (2026-11-11, the same day)
`core/atmos`'s katabatic fx (amendment 1: the gap's wind, the Bore by night and the Silk-Draught by day, with banners on the towers),
`core/hazard` (`KHAZ`: the river's drowning as shaped records, the outburst flood on KHAZ's own cycle, the heat provided as the ambient
temperature) and `kits/fauna` (the land `outlandgate.narrows` on FAUNALANDS; the runner birds, the caravans' camels and donkeys, the
fort's goats; the Outlands' hexapods are the fauna kit's new `outlands` group). Not yet: `KRELIEF.gap` (the page lies
wholly on the floor: the gap's walls are the far field), `KSTRATA`, `KSTACKS`, `KGLACIER`, `KFROST` (the walls), `core/hazard`'s runtime
`KCAMP` (the caravans are tents), the shared gorge-flood amendment (the flood here is the page's compressed cycle, kit work).

**As built, stations 2-4 (2026-11-11).** On `stations/_shared/`'s host (one STAGE record a station; `44z-host-common.js` says which
fragment reads what). Taken besides station 1's: `KSTACKS` (the seeps' dike ribs, the tarn's erratics), `WATER.terraces` (the seeps'
rimstone stairs), `WATER.open` (the tarn, Spider Lake's bay), `WATER.still` pools (the warm coves), `KHAZ`'s `slip`, `fall`, `crush`, `hunter`
and `heat` records, `BIO.kin` from the north highlands (larch, birch, wind spruce, brook willow) and the north-west lowlands (tree fern,
paperbark, glow-willow, ghost gum), and the Outlands kit's forms read in place (the tarn's young colonies). The giant current ripples and the
flood terraces are kit work (amendment 3 is not a `KRELIEF` form yet).

**Core amendments needed:**
1. **Gap wind** (shared: cold-air and katabatic wind), with a day up-valley mode. **Done** in core/atmos (`89-atmos-fx-katabatic.js`);
   station 1 takes it.
2. **A gorge flood** on a cycle (shared hazard amendment).
3. **Flood bedforms** (new, small): giant current ripples on a floor, as a `KRELIEF` form in `38c` beside `terraces` and
   `runout`. Kit work first; lift to core if another plan (the scablands) wants it.
4. **The player-settlement registry** (shared, open world).
5. **Proposed, not core terrain:** the wind-sounding rock (the sketch's singing basalt) as a `core/audio` soundscape source.

## 9. For the owner

**The gap and the Gate: settled (the owner, 2026-11-09): keep the gap, move The Gate into it** (option (a) of this plan's
first draft). What was found: the old Gate (px 1408,414) stands at 8,002 m, about 110 km south-west of the gap's floor; on
5.1 a walker reaches Trickster's House from the crater with no crest over 3.6 km (Spider Lake to the Sleeping City 1,747 m;
the N Outlands' lake to Spider Lake 2,345 m; Trickster's House to the lake 3,617 m). The river's Hum name means "Coyote-Gate
River": Gemini meant the gap as the Coyotes' gate.

**What changes:**
- **The Gate's new pin: px 1438,326** (section 5): the Narrows' floor, 1,423 m. The map edit moves `sthegate` there and
  rewrites its note ("The one way into the Outlands: the gap's Narrows, held by the Tierhounds' long wall and toll fort").
- **The rule:** "one crossing at 7.7 km" becomes **"one crossing, the gap, held by the toll fort"**.
- **The god's road** runs through the gap (section 5); `god_road.py` re-routes it with the old 8.2 km surface cap dropped.
- **The Outlands' isolation must rest on something else. The new isolation (*proposed*, for the owner):**
  1. **A climate wall at the gap's head.** The gap is warm and wet (Cfa, 1,000-1,600 mm, 19-22 °C), but every way on into
     the basins climbs into cold steppe and cold desert: the head's scarp rises 2.2 km to BWk at 4 km (94 mm, 6 °C) in
     30 km, and the lowest way from the N Outlands' lake to Trickster's House (471 km, top 3,749 m) crosses two dry ridges (Dsc at
     3.3 km and 188-298 mm round 1605,537; BSk at 3.4-3.7 km and 203-235 mm round 1610,600) and the salt basin's steppe
     (BSk, 420-520 mm) before the Cfa slopes under Trickster's House. A crater lowland lineage that reaches the lake still dies on the steppe.
     The pressure step is smaller than before (1.34 atm on the floor, about 1.0 on the steppe) but still a third.
  2. **A wind that blows out.** The gap's night and winter flow (the Outland Bore) drains the Outlands' plateau north down
     the gap. Spores and seeds go out with it; little rides in. The leak is one way, which is why the southern floor has
     fungoid stragglers and the basins have no crater plants.
  3. **The gap is young.** The outburst floods (section 2) cut the head's sill late; the natives' long isolation came first,
     behind the old crest. *Proposed*: a few thousand years of contact, too short to undo millions.
  4. **The fort.** The Tierhounds' toll includes a **seed law** (*proposed*): no live plant, seed or fodder passes the wall
     inward; caravans burn their fodder at the gate and buy the Kingdom's. A trickster's taboo backs it: what grows behind
     the wall is the god's.
  The owner chooses which of these carry the rule; the plan uses all four.

**Also open:**
- the air curve (Copper Glacier's or `WORLD.md`'s);
- ~~the Outlands' lost Nursery Plateau station~~ combined on the gap's head as the Nursery Bench (section 7, station 5),
  owned by the Outlands kit: confirm the site (1558,516) and the ownership;
- the long wall (Derbent's pattern) and the citadel on the Gate shoulder: wanted, or a fort alone?
- the old pass (1408,414): a pilgrims' cairn and shrine, or dropped from the model?
- the flat 150 km floor: grade it on the model, or let the kit grade it;
- overlaps with Spider Lake's, the ria valley's and N Outlands' polygons;
- names: the river is Hau-Gèl; the tarn, benches and stations keep Gemini's English names until Hum names are given.
- **Order:** the map edit (the Gate's marker, the god's road) first; then station 1.

## Sources

- Gemini's sketch (this file, 2026-11-02) and the region note (`smodel/nw_expansion.py`, ~lines 1487, 1655, 2628);
- the model's data at `gemini/scale-model-5.1-r3`, read with `smodel.page` (heights, `wl`, `c`, `p`, `tm`, `tw`, `tc`);
  the crest figures by a flood fill on the heights with lake levels; the Gate's pin by the river's cross-sections (floor
  width within 300 m and 1 km of the river, every 8 km of its line) and the Tiers' reach by a minimax flood fill
  (2026-11-09); the Nursery Bench by the class and rain rasters at the gap's head;
- `model/data/rivers.json` (9106 and the side channels), `vents.json`, `tubes.json`; `model/src/51-region-store.js`,
  `60-settlements.js` (The Gate, Trickster's House);
- `smodel/river_names.py` (Hau-Gèl);
- `biomes/outlands/PLAN.md` (sections 1, 2, 6), `biomes/outlands/SURVEY.md` (sections 2, 3);
- `biomes/STATIONS-MAP-5.1.md` (the Nursery Plateau); `biomes/spiderlake/PLAN.md`; `biomes/neouterwall/PLAN.md`;
- `core/README.md` (`KRELIEF.gap`, the unbuilt plans' pieces), `core/terrain/LANDFORMS.md`, `core/hazard/README.md`;
- `tools/scale-model/HANDOFF-GEMINI-5.1.md`.
