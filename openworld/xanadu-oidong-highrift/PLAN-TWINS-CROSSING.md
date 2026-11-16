# The Twins crossing and the White Gills Hermitage in the open world (plan, 2026-11-16)

**Status: the plan, its questions answered by the owner 2026-11-16 (section 9); nothing is built yet.** Moved here from
`openworld/twins-crossing/` when the owner chose to grow this region rather than cut a new one. The owner, 2026-11-16: *"I want to build the twins pathways and white gill
hermitage as part of the open world, if we haven't drafted plans for that yet."* No plan existed:
- the Twins kit (`biomes/twins`, six stations built) draws each station as its own page;
- the White Gills are a band kit read in place (`biomes/gills`), whose showcase station #10 is being built in a cloud session;
- the open world's `xanadu-oidong-highrift` region holds 1,424 px of the Twins' polygon as bare ground;
- the caravans already cross the Twins in the sim (`core/region/data/catch-tune.js`, `CATCH_TUNE.join`: steps C3-C5).

This plan puts the crossing on the world's ground: both routes as ways a walker can follow, the Brotherhood's waystations
and the guides' traps on them, and the History Monks' hermitage at the White Gills. Everything below is *proposed*
unless it quotes the owner or a plan the owner settled. Pixels are scale model 5.1 (2 km a pixel).

## 1. What it waits on

- **The Twins' sculpt.** It is queued with the scale-model session (the owner, 2026-11-16: "Add the twins as well per
  prior plans": `biomes/twins/PLAN.md` section 7, Option A as recommended): the cordillera spine, the 10 km caravan
  saddle along 996,1504 > 1016,1479 > 1056,1462, the Col of the Two Horns at +4,300 to +4,680 m, the two cones (NW Twin
  988,1458 at +6,480 m; SE Twin 1042,1498 at +5,880 m), the frozen box vales. The region is cut from the model after it
  lands, so the routes lie on the ground they were drawn for (today the polygon is the Godthrone's uncarved 7,665 m
  shield ramp).
- **Caverns in the open world.** Route A is ~82 km of drained lava tube. `core/world` streams a heightfield, roads,
  bridges and site camps but has no underground; `KCAVERN` (`core/terrain/39`) draws caverns on single pages (Dhelv,
  Loj Twenny, Opal Valley's adits) and `core/host` has the walker and pick underground. Step W3 is that bridge: a
  region's `SITE_SPEC.tubes` laid as `KCAVERN` tubes under the streamed ground, cut where they open (skylights,
  portals), streamed with the tiles they run under. It is core work: its own session, or ask.

## 2. The region: `xanadu-oidong-highrift`, grown north to the Catch

**The owner, 2026-11-16: "Growing the region north to connect to Catch".** The region's box grows north over the
Twins until it meets the Catch's south toe, and its frame's origin (px 1191,1569) stays put, so every record already
baked keeps its coordinates. The grown part:
- **The new rows:** about px 930-1112 x 1420 up to the box's present north edge. The exact box is
  `tools/scale-model/cut_site.py`'s, recut after the Twins' sculpt. It holds:
  - Strongbow at 1001,1596 (the Sultan's lift town, at the edge);
  - the Vale portal at the Alph's chasm, 938,1496;
  - the whole Twins massif;
  - both candidate sites of the Hermitage (section 6);
  - the Catch's south toe: Lasso 1083,1474, Bitta 1088,1455 and Stair's campground at 1106,1442, at the edge.
- **Recut, not a new region:** `tools/scale-model/cut_site.py xanadu-oidong-highrift` with the larger box
  (`openworld/PLAN-SITES.md`). The region's SITES.json row gains the Brotherhood's waystations, the Hall, the Hermitage and
  Strongbow's caravanserai. Strongbow's own page and Lasso and Bitta stay their kits'.
- **The recut also moves Erehwon's square onto the re-made lake** (the region's KNOWN_ISSUES), so one recut does both.
- **Its flora** is the Twins kit's, read in place as the regions read biome kits:
  - the five oases' islands of warm ground;
  - the dwarf agate-bark pines and pocket-hearth shrubs;
  - nothing on the ice.
  
  The White Gills' life is the gills kit's, round the pipes.
- **The bare Twins ground** this region already holds (1,424 px) gets the Twins kit's flora with the rest.

## 3. The ways

Each way is a record (`[G data]`): a polyline in the region's frame, its kind, its width and grade limit, its stops.
They are drawn by the region's roads code where they run on the ground, and by W3's tubes where they run under it.

| Way | Kind | Line (5.1 px) | Notes |
|---|---|---|---|
| **Route A, the Dark-Tube Road** | 4 tubes, 3 sprints | A1 938,1496 > 952,1489 > 966,1479 > 978,1468; Sprint 1 > 982,1466; A2 > 994,1467 > 1002,1469; Sprint 2 > 1006,1468; A3 > 1014,1464 > 1020,1461; Sprint 3 > 1024,1459; A4 > 1038,1452 | `biomes/twins/PLAN.md` 3.1: 12-22 m tubes with 3.5 m chokes, +8 to +16 °C inside, the three Breaths outside in the wind. The 18 m basalt arch at 1038,1452 opens onto the fan 65 km south-west of Stair. Pack mules and yaks only |
| **Route A's south feeder** | tube | 1010,1517 > 1028,1506 > 1024,1485 > the Hall 1014,1464 | The lower galleries of `tube_xanadu_se_10`, from near Strongbow into either route: a gasp up onto Route B under the SE Twin (1028,1506), then the model's Saddle dike conduit to the Hall, where it joins A3 underground (the owner, 2026-11-16: "Join the branch to the main line") |
| **Route B, the Steaming-Stone Dash** | trail | Strongbow 1001,1596 > Sinter-Gate 996,1504 > Mud-Kettle 1005,1489 > the Brazier 1016,1479 > Brimstone-Tarn 1031,1473 > Catch-Lookout 1056,1462 | `biomes/twins/PLAN.md` 3.2: outdoors over the col, a day between oases, for wagons and herds. A trail, not a highway: wider, steeper grades than the Sultan's roads (proposed: 4 m, 18 %) |
| **The Catch descent** | trail | Catch-Lookout 1056,1462 > Lasso 1083,1474; Route A's arch 1038,1452 > Bitta 1088,1455 | down the faulted basalt ledges onto the salt and sand |
| **The Hermitage path** | path | from the nearer route to the Hermitage (section 6) | the monks' and the caravans' turn-off |

The sim's rounds name the same stops (`twins.sinter`, `twins.kettle`, `twins.brazier`, `twins.tarn`, `twins.lookout`,
`twins.hall`, `sttkxo9ndy`). **Route A starts at the Vale's chasm with the Strongbow branch** (the owner, 2026-11-16:
"Vale chasm with strongbow branch"). The sim's Route A caravans are bound for Strongbow, so they take the branch: the
Hall, then the feeder's galleries down to Strongbow, not Sinter-Gate. The Vale's portal is the way on into the Vale.

## 4. The waystations and the traps

- **The Brotherhood's waystations** (the sim's records, its ids kept):
  - the five oases of Route B: Sinter-Gate with its south-west toll house; Mud-Kettle Hollow; the Brazier with the Shrine of the Split Horn, where the guide's second half falls due; Brimstone-Tarn; Catch-Lookout Spring;
  - the Hall of the Tally-Marks, Route A's overnight cistern inside tube A3 at 1014,1464.
  
  Each oasis's ground and hot water are the Twins kit's oasis model, from its stations (brazier, catchlookout); its stone corrals and the guides' houses are drawn with the Xanadu kit (`XAK`).
- **The guides' traps** (`biomes/twins/PLAN.md` section 4) are `core/hazard` records, so a walker who strays meets them:
  - the frozen box vales F1 at 968,1442 and F2 at 1068,1528 (`cold`, `fall`);
  - the decoy lava pools L1 at 992,1465 and L2 at 1035,1493 (`heat`, `gas`).
  
  The Red Cistern and the Iron Shroud are already station pages (lavasump, shroudvale): the region places their records.
- **The caravans themselves** (later): the sim's carriers drawn as `core/camp` caravan halts at the waystations they
  stand at, from `SIM.tradeReport`'s carriers.

## 5. The life on the ways

The Twins kit's flora and the gills kit's life, read in place:
- nothing grows on the trail beds or in the tubes but cave lichen at the skylights;
- the warm ground at the oases;
- the obsidian boulder fields of the Breaths.

The fauna (pyroduct swifts and others) is owed to `kits/fauna` as in the Twins kit's KNOWN_ISSUES.

## 6. The White Gills Hermitage

What is settled:
- **The owner, 2026-11-02, quoted in `biomes/gills/PLAN.md` section 9:** the History Monks keep a hermitage of two or three in the White pipe field, from Longsong. It doubles as a caravan stop. Besides counting rings, their duty is passing the news and rumours of travellers to Longsong: the Order's ear on the Catch crossing.
- **What they count:** the pipes' daily brucite-carbonate rings, for the date of the Cataclysm (`biomes/gills/PLAN.md` section 10).
- **The caravans' use of the field:** water at the saltcups, from the out-breath's mist, and lung salt (*Lãg Solṭ*) cut against thin-air sickness on the pass.

What the plan would build:
- the hermitage itself: a small house of the Order (cells for two or three, a counting room with the ring cores, a store of saltcup water, a guest court and corral for the caravans), drawn with the Xanadu kit in the Order's manner (Longsong's monastery is Xanadu-style, `LORE.md` 6.15);
- the pipe field round it: the gills kit's Breath Pipes (`KSTACKS.chimney`, 15-35 m, bone-white brucite), the saltcups and the candles;
- the path to the nearer route.

**Where: the White pipe field** (the owner, 2026-11-16, question 1). The house stands at about 1015,1430 (+3,746 m),
below the live ring fissure at 1015,1438. The map pin moves there through the scale-model session's queue, and the sim's
record follows. **Fifteen monks** (the owner, question 2): a larger house than the 2026-11-02 "two or three", now that it is
the crossing's caravan stop; the counting room, the cells, the guest court. The two places that were recorded, 100 px apart:
- **The White pipe field at about 1015,1430-1438.** `biomes/gills/PLAN.md` station #10 puts it there: the live ring fissure at 1015,1438, +4,670 m; the pipe field, candles and hermitage at 1015,1430, +3,746 m. That is north of the Twins, near the Catch side of the pass and Route A's line, and it matches the lore's "in the White pipe field".
- **The map pin "White Gills Hermitage" (`sttkxo9ndy`) at 1035,1535,** on the Xanadu side south of the SE Twin. Gills station #10 names it a secondary structural window; the Catch's sim and Gemini's trade model use the pin.

## 7. Core adoption (to write in full before the first fragment)

| Need | Module |
|---|---|
| ground, water, sky | `core/world` (the region's runtime), the Twins' sculpt on the model |
| ways on the ground | `core/world` roads and links (a `trail` and `path` kind, if the roads code has none: W2) |
| tubes | `core/terrain` `KCAVERN`, `core/host` underground walker, through W3's region bridge |
| sites, waystations | `core/world` `KSITES` (`SITES.json`), the sim's ids |
| flora | `biomes/twins` and `biomes/gills` read in place |
| buildings | `kits/xanadu` (`XAK`), the Order's manner for the Hermitage |
| hazards | `core/hazard` (the traps, the col's cold, the gas at the vents) |
| randomness, masks | `core/rand`, `core/mask` |

## 8. Steps

| Step | What | Check |
|---|---|---|
| **W0** | The owner's answers (section 9); the Twins' sculpt landed on the model | |
| **W1** | Recut `xanadu-oidong-highrift`, grown north to the Catch, from the sculpted model (Erehwon's square onto the new lake with it); SITES.json rows for the waystations, the Hall and the Hermitage | the region builds; every site on dry ground at its plan's height within a band |
| **W2** | Route B, the feeder's surface and the Catch descents as trails on the ground; the waystations drawn | the trail's grade under its limit, a day between oases, nothing on a trail bed |
| **W3** | Caverns in the open world (core work): Route A's four tubes and their skylights and portals, the Hall of the Tally-Marks | a walker goes Vale to arch by tube and sprint; the tubes open only where the plan opens them |
| **W4** | The White Gills Hermitage and its pipe field | the house on its bench; the pipes on the serpentinite window; the path joins a route |
| **W5** | The traps and hazards; the life read in place | each trap a hazard record with a negative |
| **W6** | The sim's caravans drawn at the waystations (`core/camp`) | carriers stand where the sim says |

## 9. Questions for the owner: answered 2026-11-16

The owner: *"1. White pipe field. 15 monks. Vale chasm with strongbow branch. Growing the region north to connect to
Catch. Build open world caverns now"*:
1. The Hermitage stands in the White pipe field (about 1015,1430).
2. Fifteen monks.
3. Route A starts at the Vale's chasm, with the Strongbow branch.
4. This region grows north to meet the Catch (no new region).
5. The open world's caverns are built now (W3).

The questions as they were put:

1. **Where is the Hermitage:** the White pipe field at about 1015,1430 (the gills plan and the lore), or the map pin at 1035,1535? If the pipe field, the pin moves through the scale-model session's queue and the sim's record follows.
2. **How many monks:** two or three (the gills plan, the owner's 2026-11-02 words), with the Catch sim's 15 (a guess of mine) brought down to match? Or a larger house now that it is a caravan stop?
3. **Route A's start:** the Vale's portal at the Alph's chasm (938,1496, the Twins plan), with the Strongbow feeder as a branch, or Strongbow only? The sim's rounds follow the answer.
4. **The region:** a new `openworld/twins-crossing` (this plan), or grow `xanadu-oidong-highrift` north over the Twins?
5. **Route A's tubes:** build the open world's caverns now (W3, core work), or draw Route A on the surface first, with the tubes' portals as closed doors?
</content>
</invoke>
<invoke name="Bash">
<parameter name="command">cd "C:/Users/travi/Documents/krator-master/.claude/worktrees/openworld-sites-24defd" && M="C:/Users/travi/AppData/Local/Temp/claude/fb90a45e00650bd0/3c8541e4-a2b4-461b-b662-31b858516b6a/scratchpad/msg-tw.txt" && printf 'openworld/twins-crossing/PLAN.md: the Twins crossing and the White Gills Hermitage in the open world (proposal; the owner, 2026-11-16)\n\nBoth routes as ways on the ground (Route A by lava tube and sprint, Route B by\ntrail between the five oases), the Brotherhood'"'"'s waystations and the guides'"'"' traps,\nand the History Monks'"'"' hermitage at the White Gills. Cut after the Twins'"'"' sculpt\nlands; Route A needs caverns in the open world (W3, core work). Five questions\nfor the owner, among them where the Hermitage stands (the pipe field at\n1015,1430 or the pin at 1035,1535).\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' > "$M" && git add openworld/twins-crossing/PLAN.md && python tools/commit.py -F "$M" 2>&1 | tail -1