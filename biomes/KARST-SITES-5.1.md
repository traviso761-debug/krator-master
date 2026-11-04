# Karst sites on scale model 5.1

Surveyed 2026-11-03 for `KKARST` (`core/terrain/39c-core-karst.js`): where limestone and gypsum caves plausibly form on
the map, so the biome turns can place them. This is a survey only: no build, the model or `core/` was changed.

**What a site needs** (from KKARST's header): **soluble beds** (limestone, dolomite, gypsum, salt); **relief**, so a water
table falls across the box from the sinks to a spring; **water** to dissolve the rock (rain, or rising warm water for a
hypogene cave); **sinks** (swallets) where the surface water goes in; a **spring** (resurgence) lower down where it comes out.

**How the numbers were got.** The heights, water levels, climate class, rain and annual mean are the 5.1 model's own data
(`tools/scale-model/model/data`, read with `smodel.page`; 30 km relief is the height range in a 15 px window). Rock
province and the gypsum and halite bytes are from `kits/resources/data/geology.json`, which was baked on the **4.2x
canvas** (1549x1393). They were read at legacy px (5.1 px - (272, 330)). Those bytes say how likely the rock is (0-255);
they are not mapped beds. Biome polygons and settlements are the defaults in `model/src/51-region-store.js` and
`60-settlements.js`. Tubes are `DATA.tubes` (15).

**Coordinates.** All px are on the **5.1 canvas** (1821x1723, 2 km a pixel). The plans quote 4.2x px in many places, and
those have been shifted by +272, +330 here. **World km** is the 5.1 global frame: `x = px x 2`, `z = py x 2`, measured
from the canvas's top-left corner. A region cut by `extract_region.py` uses its own frame, `x = (px - cx) x 2000` m, and
`kits/resources` uses the old canvas's frame, `x = (px - 272) x 2000`.

**One finding first.** `geology.json` has no carbonate province (its provinces are water, sedimentary, crystalline,
volcanic, evaporite, rift). So the map's limestone exists only in the lore and the kits' plans: the Hykkousoi province,
swhighlands' ring folds, the `rift` strata recipe, n semiarid's basement and the Neo-Ozarks. Gypsum and salt are mapped,
but only round the 4.2x basins. **Since added (2026-11-03):** a `carbonate` province and a `limestone` layer
(`kits/resources/GEOLOGY.md`, "The carbonate"); other missing rocks are proposed in `kits/resources/ROCK-PROPOSAL.md`.

## Ranked sites

Geology: **A** means thick soluble rock, wet, with real relief, and the lore or a plan already names karst. **B** means a
named soluble rock but thin or patchy beds, or a stand-in for the true process. **C** means plausible but inferred.

| # | Site | 5.1 px | World km | Kit, station | Rock | Kind | Geology | Station gain | Conflicts |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **The Hykkousoi karst**: NW bay, Ys and k-guilin | 780,725 (plain), 745,728 (lake), 789,738 (Ys) | 1560,1450 | `k-guilin` page; `nwbay` page (its tiankeng and cenotes); Ys | thick grey limestone (`nwbay-karst` recipe) | branch, with a drowned level | **A** | high: cenotes and the tiankeng get a cave under them, and Ys's drowned stacks get sumps | none (the Zeijani tubes are 95-260 km off) |
| 2 | **swhighlands' ring folds** | 545-555, 975-985 | 1100,1960 | `swhighlands` station 1 (built: has a river cave) | limestone ridges in `ringfold` (opal-shell limestone) | branch: river cave, sinkhole chain, 1 old level | **A** | high: the plan's river cave, natural bridges and karst springs | none (the nearest tube is 520 km off) |
| 3 | **Cube's plateau**: gypsum maze in the rift fill | 720,1570 | 1440,3140 | `rift` station 4 (Cube's plateau); its springs at station 2 | gypsum and stromatolite limestone (`rift` recipe) | maze, 2 storeys, dry | **B+** | high: the reward under Cube, and the Tungangs' lost east | `tube_rift_08` 200 km off; The Tubes is a lava tube, not this |
| 4 | **The Hearth hold**: hypogene chambers | 525,1400 | 1050,2800 | `hearths` station 2 (the hold, under `riftrim --station hearths`) | lake limestone and gypsum under the vent field | hypogene (`kind:'hypogene'`): feeders, chambers and cupolas, 2 storeys | **B** | high: the plan asks for it ("huge chambers, gypsum blocks") | none; the field's fumarole shaft goes through it |
| 5 | **The great river gorge** | 690,1050 | 1380,2100 | `swlowlands` station 2 (built); Shim's ground | limestone walls (the station takes `rock.limestone.karst`) | branch from the rim to the wall springs, 1 old level | **B** | medium: springs in the gorge walls, dry valleys and dolines on the rims | none |
| 6 | **Ledge's cliff springs** | 437-445, 1330-1345 | 880,2670 | `riftrim` (Ledge's point and the great lake) | `rift` fill in the trough wall | branch from the highland to the lake's foot | **B-** | medium: "the springs at the great lake's foot are the caves' outflow" | the Ancients' Rift-line tunnels come out here (they join natural caves by design); `tube_rift_08` 125 km off |
| 7 | **Korona's west trench rims** | 950,475 | 1900,950 | `korona` (nearest: the trench station) | gypsum and salt round the endorheic trench lakes | maze in gypsum, sinks on the rims | **C+** | medium | none |
| 8 | **The Bowl's salt rings** | 1141-1184, 1136-1162 | 2300,2300 | `sedesert` Bowl station | gypsum and halite rings round the -990 m lake | shallow maze with collapse dolines | **C** | low to medium | none (`tube_god_07` 380 km off) |
| 9 | **swbay's karst springs** | 720,990 | 1440,1980 | `swbay` page (three `WATER.karstSpring` pools) | inferred: the ring folds' limestone reaching the coast | small branch, used only to place a spring | **C** | low: the springs get a source | none |
| 10 | **n semiarid basement, Jimjam** | 746,550 | 1490,1100 | `nsemiarid`, `scablands` | limestone under the flood basalt; young dam-lake gypsum | branch under a basalt cap | **C** | low | none |

**The top three for the biome turns** are 1, 2 and 3. Sites 1 and 2 are the strongest geology on the map. Site 3 is the
one the rim's lore leans on hardest: the "gypsum and salt mazes", rated "excellent, the most Krator-like" in
`biomes/riftrim/PLAN.md`. Site 4 comes next, because a plan already asks for it.

---

## 1. The Hykkousoi karst: NW bay, Ys and k-guilin

- **Where.** The `k-guilin` polygon (687-790 x 708-773; a 14,860 km² plain round a freshwater lake at **-1,480 m**) and
  the `NW bay` polygon (676-813 x 707-854) on the Ring Sea at **-1,500 m**. The plain at 780,725 stands at -1,227 m (Aw,
  973 mm, +32 °C) and at 710,760 at -828 m (Aw, 831 mm). The lake centre, 745,728, is XA with 3,278 mm. Relief over 30 km
  is 740-1,060 m. Settlements: Trigon (722,740) on the lake's south shore, Ys (789,738), Tethis (733,775). The dry
  upper slope SW of the bay (700,800: -941 m, Aw, 612 mm, 1.3 km relief) is the nwbay page's tsingy ground.
- **Rock.** One limestone province: the bay's drowned stacks and the inland towers (`LORE.md`, "The Hykkousoi hinterlands"; `k-guilin/PLAN.md`
  "Geology"), drawn with the `nwbay-karst` recipe (thick grey limestone beds, marl partings, iron bands). It is hot, wet
  and dense-aired (1.8-1.9 atm), which is the fastest-dissolving climate on the map.
- **Cave kind and levels.** Branchwork. Under the k-guilin plain the water table is shallow (a fenglin plain sits near
  base level), so the main level is phreatic. Tower-foot caves, and old dry levels in the fengcong clusters, sit tens of
  metres up. In the bay the karst is **drowned**: Ys's stacks stand in the sea, so their lower passages are sumps.
- **Sinks and spring.** Sinks are the plain's ponors and the cenotes. The k-guilin springs come out on the lake shore
  (Trigon's promontory side). The bay's springs are submarine and shore resurgences at the waterline: brackish, under the
  sea notches of the stacks (`settlements/ys/KNOWN_ISSUES.md` lists the missing notches).
- **Surface.** Fenglin and fengcong towers (built). The nwbay page already draws a tiankeng 84 m deep at the tsingy's NE
  edge and two cenotes 19-26 m deep in the bay jungle (`biomes/nwbay/NOTES.md`). KKARST would put a cave under each one
  and a dry valley above the shore springs.
- **Who uses it.** The Hykkousoi, who breathe water. A flooded cave is their road, not a hazard, so sumps here are
  through-routes; `KKARST.hazards`' `drown` records should be tagged for land-breathers only. Pearl divers. Trigon and
  Tethis are Ancient arcologies, and their cellars may meet the caves.
- **Conflicts.** None. It is outside the tsunami coast (Farside's polygon ends at y 673). The Zeijani tubes round the
  Throne (`tube_surpu_02`, `tube_dhelv_01`) are 95-260 km off.
- **KKARST.network** (station metres; `G` is the ground at the spring, `L` the lake or sea level there):

```js
/* k-guilin: a plain draining to the lake */
KKARST.network({box:[-2500,-2500,2500,2500], ground, world, kind:'branch',
  level: L - 8, table: L + 3,                 /* the plain's caves sit at the lake's level: the main level phreatic, sumps at the shore */
  levels:[{y: L + 45, kind:'maze', p:.45}],   /* the older dry level, inside the fengcong towers only (crop the records to the towers' footprints) */
  joints:{angle:.35, sp:45}, spring:[/* the lake-shore point */], sinks:{cell:180, p:.55},
  gradient:.004, chamber:{p:.3, r:[10,26], h:[6,16]}, thin:12})   /* thin 12: cenotes where a chamber nears the plain */
/* the bay (Ys, nwbay): drowned */
KKARST.network({box, ground, world, kind:'branch', level: L - 25, table: L + 1, spring:[/* a stack's foot at the waterline */],
  sinks:{cell:150, p:.5}, gradient:.006, chamber:{p:.25, r:[8,22], h:[5,14]}, thin:10})
```

  The tiankeng is bigger than KKARST's chamber range. Give it its own one-chamber network
  (`chamber:{p:1, r:[41,49], h:[60,84]}`), or keep it as the page's KRELIEF hole and run the network under it.

## 2. swhighlands' ring folds

- **Where.** The wet western ramp at 2-3 km: 545,975 (2,923 m, Cfa, 1,616 mm, +10 °C), 555,985 (2,998 m, Dfa, 1,365 mm)
  and 540,1000 (2,366 m, Cfa, 1,161 mm). Lower, at 530,980, it is 1,839 m with 2,824 mm, the rain wall. Relief over 30 km
  is 1.8-2.0 km. Span (554,1010) is 50-70 km off. The landslide lake is at 550,959.
  **Check the station's site:** its shared sky is placed at 4.2x px 300,640 (`swhighlands/KNOWN_ISSUES.md`), which is
  5.1 px 572,970: 4,172 m, Dsc, 455 mm. That is not station 1's 2-3 km band (Cfa, Dfb). The band lies 15-30 px west of it.
- **Rock.** `ringfold`: hard sandstone and limestone ridges with shale valleys, and opal-shell limestone in some ridges
  (`swhighlands/PLAN.md` section 2). The province is sedimentary. There is up to 4 m of rain on the rain wall.
- **Cave kind and levels.** Branchwork in the limestone ridges. **A river goes through a ridge in a cave** instead of a
  gap, its roof holed by skylights (thin roof means cenotes). A stream falls through a chain of natural bridges into a
  sinkhole. Add one older dry level, left when the rivers cut the water gaps down.
- **Sinks and spring.** Sinks are on the ridge's up-dip side and in the soft shale valley where streams meet the
  limestone. The spring is the cave's resurgence on the far side of the ridge, gin-clear (refs/35). Strike the joints
  along the fold axis, which is parallel to the crest.
- **Surface.** Natural bridges (collapsed passage), a sinkhole chain, skylights, the karst springs, fluted pinnacles on
  the rain wall, a wind gap as the dry valley.
- **Downstream.** The ramp drains west, toward the Valley of the Ancients and the SW lowlands: these are the springs
  where swlowlands' **spring cypress** stands ("the clear springs where the SW highlands' karst rivers come out",
  `swlowlands/PLAN-FLORA.md`). The vitrified blast basins (398-476 x 896-984, Ancient's Valley) are 70-150 km west:
  no conflict, though a spring's run could reach the 17.4 m lake.
- **Who uses it.** The Iron Republic's farms reach in from the north. Dalab's outposts are near Span.
- **Conflicts.** None: the nearest tube is 520 km off, and it is outside the tsunami coast.
- **What it gains.** Station 1 already has a river cave (a `KCARVE` alcove for the mouth, a cave about 22 m deep under
  the face: `swhighlands/NOTES.md`). KKARST makes it a system: the sink upstream, the keyhole passage, the bridges, the spring.

```js
KKARST.network({box:[-1800,-1800,1800,1800], ground, world, kind:'branch',
  level: G - 6,  table: G - 3,                /* G = the spring's ground; passages upstream rise above the table and become keyholes */
  levels:[{y: G + 55, kind:'branch'}],        /* the old dry level, left by the water gap's incision */
  joints:{angle:/* the fold axis */, sp:40}, spring:[/* the resurgence on the ridge's far side */],
  sinks:{cell:140, p:.6}, gradient:.02,       /* a steep mountain branchwork */
  w:[3,8], h:[2.5,6], canyon:[1.5,5], chamber:{p:.2, r:[8,18], h:[5,12]}, thin:10})
```

## 3. Cube's plateau: the gypsum maze in the rift fill

- **Where.** The rift kit's station 4, the plateau round Cube (4.2x 448,1240 is 5.1 **720,1570**): -260 m, Cfa,
  **2,055 mm**, +22 °C. It is a table of 3,600-5,000 km² standing 1.2-2.3 km over the jungle floor. Its west scarp drops
  to station 2, the mouth of the Lizardmen's river 3, at 692,1578 (-1,843 m, XA, 3,686 mm). The terminal sea is at
  -2,600 m (Sauropolis, 765,1596). The salt lakes in the trough (basins 112, 114, 150 at 644-713, 1476-1526; Gila's lake
  at -1,738 m) are the evaporites' source.
- **Rock.** The `rift` recipe (`core/terrain/STRATA-PLAN.md`): fan gravels, red sandstones, lake marls, **stromatolite
  limestones (thin, patchy)**, **gypsum and salt** from the drying lakes, and basalt and ash beds; "the gypsum soft and
  recessed (where the caves are)". The province is `rift`. Gypsum is far more soluble than limestone, so with 2 m of
  rain a gypsum maze forms fast.
- **Cave kind and levels.** A **network maze** like Optymistychna: the gypsum beds hold a dense joint grid, cut while the
  plateau was buried under a confining cap and fed from below. Make it two or three storeys. The plateau now stands 1.2 km
  or more above the floor, so the maze is **drained and dry**, a relict cave, with water only at its lowest storey near
  the scarp.
- **Sinks and spring.** There are few sinks: a maze is entered by collapses (dolines on the plateau top) and by the scarp
  face. The springs are at the **west scarp's foot**, station 2's algal shore and stream mouth.
- **Surface.** Collapse dolines on the table, a scarp lined with cave mouths, the springs at its foot.
- **Who uses it.** Cube was the Ancients' hub (`riftrim/PLAN.md` section 5), "the reward for a player who
  braves the Lizardmen". The Tungangs once lived throughout the Rift: those east of Chimes were wiped out in tunnel wars
  after the Lizardmen came, and a lost loj in the east is rumoured (`LORE.md`). **Approved by the owner (2026-11-03):** this
  maze is where that lost loj lies, and where the Ancients' line joined natural caves under its hub.
- **Conflicts.** `tube_rift_08` (the Southern Rift basalt tubes, 594-628 x 1528-1558) is 160-200 km west. **The Tubes**
  (cavern settlement, 608,1547) sits on that tube, so it is a lava tube, not karst: keep KKARST off it.

```js
KKARST.network({box:[-2000,-2000,2000,2000], ground, world, kind:'maze',
  level: G - 35, p:.6, joints:{angle:/* the rift's strike */, sp:28},     /* gypsum mazes are dense */
  levels:[{y: G - 18, kind:'maze', p:.5}, {y: G - 8, kind:'maze', p:.35}], /* storeys under the cap */
  table: G - 300,                             /* drained: the scarp foot is 1.2 km and more below */
  spring:[/* the scarp edge facing station 2 */], w:[1.5,4], h:[1.5,3],
  chamber:{p:.12, r:[8,16], h:[4,8]}, thin:8})
```

  Station 2 then takes `KKARST.water(N).spring` as the scarp-foot springs (`WATER.karstSpring`), with its own short
  branch network if it wants a cave behind them.

## 4. The Hearth hold: hypogene chambers under the vent field

- **Where.** `riftrim --station hearths` at **525,1400**: 3,736 m, Dsc, 753 mm, +2 °C, on a shelf at 3.5-3.7 km at the
  rim's edge (5.8 km of relief over 30 km), in the volcanic province. The hold is `hearths` station 2 (`hearths/PLAN.md`,
  "The hold").
- **Rock.** Lake limestones and gypsum of the rift fill, lifted onto the shoulder, meeting the vents' sulphur water. This
  is the "hypogene chambers" row of `riftrim/PLAN.md`, rated "good". Sulphuric acid dissolves from below, so the chambers
  are huge, with gypsum blocks and chandeliers, few entrances, warm and wet.
- **Cave kind and levels.** KKARST's **`kind: 'hypogene'`** (added 2026-11-03 for this site): feeders rising up the rim's
  faults from depth, big chambers and cupolas over them at the water table, a rising maze a storey, an older dry storey
  above at an older table (replacement gypsum and fallen gypsum blocks on its floors), and gypsum crust round today's table.
  At 0.75 g a roof spans about a third wider, so `chamber.r` runs past Earth's sizes.
- **Outlets.** A warm, sulphurous spring where today's table meets the rim, going down toward the trough, and vents where a
  cupola has broken the shelf's surface. There are no sinks. The fumarole's shaft through the hold is a `KCAVERN` shaft added
  by the station, not by KKARST.
- **Surface.** Few signs: the vents steaming through the hearth stand (`N.outlets`), the warm spring, the hearth stand's
  floor as the roof.
- **Hazards.** `KKARST.hazards(N)` gives scalding pools over the flooded chambers, bad air (H2S and CO2) pooled on every
  active chamber's floor (load `core/hazard/21-core-hazard-flow.js` for `shape.pool`), the acid's drips in the crust band,
  and falls down the shafts above the water.
- **Who uses it.** The Tungangs' holds: "the warm, wet hypogene chambers by the vents above all", where they grow the dark
  crops (`riftrim/PLAN.md` section 6).
- **Conflicts.** None with the tubes (`tube_rift_08` is 290 km off). The rim's vents are lava sources: if a tube is drawn
  here later, keep it out of the chamber box.

```js
const N = KKARST.network({box:[-900,-900,900,900], ground, world, kind:'hypogene',
  level: G - 70, table: G - 69,               /* the active storey: warm wet floors, hot pools in the lows */
  temp: 55,                                   /* scalding: the vents' sulphur water */
  levels:[{y: G - 40}],                       /* the older storey: dry, the Cave of Crystals */
  crystal:{storeys:[1], speleo:'SELENITE'},    /* its chambers and crusts dressed as a Naica (CRYSTAL-CAVES-5.1.md, site 1) */
  form:'maze', p:.45, joints:{angle:/* the rim's strike */, sp:55},
  feeders:{cell:300, p:.6, depth:200, faults:[/* the rim's faults as [x0, z0, x1, z1] */]},
  chamber:{p:.4, r:[20,60], h:[12,32]},       /* 0.75 g: wider spans than Earth's */
  cupola:{p:.7, n:[1,4], r:[4,10], h:[3,8]}, thin:12,
  outlet:[/* the shelf's lowest edge toward the trough */], w:[3,8], h:[3,7]});
KKARST.build(C, N, {rock:'gypsum'});
N.crusts.forEach(c => KSPELEO.place(C, {box:c.box, y:(c.y0 + c.y1) / 2, world, kinds:KSPELEO[c.speleo]}));   /* HYPOGENE below, SELENITE in the crystal storey */
```

## 5. The great river gorge (swlowlands station 2, Shim's ground)

- **Where.** The gorge at about **690,1050** (85 m, Csa, 800 mm, +22 °C, 2.55 km of relief over 30 km). The Lake of Shim
  is at -9 m (651,1118), and Shim (654,1118) is on its shore. The great river (r000, *klir Rivrh*, "clear river") runs
  5,744 m³/s through a gorge up to 600 m deep. Wing (699,1042) stands on the floodplain bench.
- **Rock.** The station's walls take `rock.limestone.karst` (`biomes/STATIONS-SURVEY.md`), and the river is named for
  clear water. Nothing on the model says limestone here; it is the kit's choice. Rated B on that.
- **Cave kind and levels.** Gorge karst, like the Tarn's or the Verdon's: branchwork from the oak rims down to
  **resurgences in the gorge walls** just above the river, plus one older level stranded high in the walls by the
  incision (the wall cave mouths).
- **Sinks and spring.** Sinks are dolines on the oak-and-cork rims. The springs come out in the walls a few metres above
  the river.
- **Surface.** Dolines and a dry valley on the rim, hanging cave mouths, wall springs with tufa.
- **Who uses it.** The Vothic Kingdom (Voth 87 km, Torus 28 km). Shim is the Chichani's old capital, and its high
  priests' tombs are "in the lake below" the temple (`settlements/shim/PLAN.md`): a flooded cave would suit them.
- **Conflicts.** None (`tube_god_nw_11` is 213-284 km off).

```js
KKARST.network({box:[-1500,-1500,1500,1500], ground, world, kind:'branch',
  level: R + 8, table: R + 12,                /* R = the river's level at the spring */
  levels:[{y: R + 140, kind:'branch'}],       /* the old level, now holes high in the walls */
  joints:{angle:/* across the gorge */, sp:40}, spring:[/* a point on the wall */],
  sinks:{cell:220, p:.4}, gradient:.012, chamber:{p:.2, r:[8,20], h:[5,12]}, thin:8})
```

## 6. Ledge's cliff: the great lake's foot springs

- **Where.** Ledge (437,1330) is on the cliff about 1,340 m over the great lake, which is at **297 m** (437-445,
  1330-1345). Chimes (468,1392) is at the gorge's foot. The province is `rift`, and the Tungang Union polygon
  (399-517 x 1140-1345) covers it.
- **Rock and kind.** The `rift` fill in the trough wall. Branchwork from the highland (where Dalab's road comes out) to
  springs at the lake's foot: "the springs at the great lake's foot are the caves' outflow" (`riftrim/PLAN.md`).
- **Conflicts and joins.** The Ancients' Rift line comes out of the Outer Wall above Ledge (340-420 km of tunnel, "joined
  to the natural caves"). Here a tunnel meeting a KKARST passage is intended, not a clash: give the joint an id the
  tunnels' record can name. `tube_rift_08` is 125 km off. **Loj Twenny** (cavern settlement, 457,1269, 6,217 m) sits on
  `tube_rift_08`'s line, so it is a lava-tube loj, not karst.

```js
KKARST.network({box:[-1500,-1500,1500,1500], ground, world, kind:'branch',
  level: 297 + 5, table: 297 + 8, spring:[/* the cliff foot at the shore */],
  levels:[{y: 297 + 180, kind:'maze'}], sinks:{cell:200, p:.4}, gradient:.03})   /* steep: the cliff */
```

## 7. Korona's west trench rims

- **Where.** **950,475** (-95 m, Aw, 910 mm, 3.2 km of relief over 30 km): an evaporite ring with gypsum and salt bytes
  (`gypsum` clusters at 946-976, 489-517, Cfa, 1,850-2,000 mm). The rings round Korona's endorheic trench lakes take
  3,500-4,000 mm on their windward faces and 200-300 mm in their lee (`biomes/korona/NOTES.md`).
- **Rock and kind.** Gypsum and salt laid round the salt lakes, under Korona's quartzite (`tepui` recipe). Make a maze in
  the gypsum where the wet face reaches it, with sinks on the rim and springs at the trench's salt shore. Salt does not
  survive at the surface in 2 m of rain, so the halite is subsurface: dissolution there makes collapse dolines.
- **Who.** Korona's lore makes it the source of marble ("where volcanic heat would have cooked limestone", `LORE.md`, the
  Brick paragraph). A marble cave is plausible too, but no plan places the marble.
- **Gain.** Medium: the trench station gets dolines and a salt-shore spring. Korona's stations have no 5.1 px yet, so place
  this when they do.

## 8. The Bowl's salt rings

- **Where.** The east side of the Bowl's lake (which stands at **-990 m**): gypsum bytes 180-250 at 1141-1184,
  1136-1162, and halite to 253. At 1150,1150 it is -1,137 m, Aw, 753 mm; to the west it is BSh, about 400 mm. Relief is
  only 550 m over 30 km. Mantis (village) is 80 km off. The kit is the `sedesert` Bowl station (`PLAN-BOWL.md`: the
  Dasht-e Lut).
- **Kind.** A shallow gypsum maze, with **collapse dolines** where salt dissolves under the flat (the Permian Basin's kind).
  The table is the lake's level. Dry and low, so this is a weak cave but good surface: a field of dolines and a sinking
  stream or two on the wetter east edge.

## 9. swbay's karst springs

The swbay page has three `WATER.karstSpring` pools on its rainforest slope (`swbay/PLAN.md`) with no cave behind them.
At 720,990 the bay's slope is -1,212 m, XA, 2,682 mm. The source would be swhighlands' limestone reaching the coast (the
fan coast's "steep thin beds", `swhighlands/PLAN.md`). Use a small branch box per spring, take `KKARST.water(N).spring`
for its `at` and `dir`, and leave the cave unbuilt unless the page wants a mouth.

## 10. n semiarid's basement and Jimjam

Jimjam (746,550: 692 m, Cfa, 941 mm) stands on an evaporite cell (gypsum byte 76). It belongs to the largest gypsum belt on
the map (4,156 cells over 650-920 x 384-600, mostly BSh; the wet part, 1,644 cells, centres near 794,498). But that gypsum
was laid by the dam lakes that drained only centuries ago (`nsemiarid/PLAN.md` section 2), so it is a crust, not cave
rock. The better rock is the **basement limestone under the flood basalt**, "seen where the cuts are deepest (the two
notches, 460 and 485 m) and on the rainier Cfa uplands" (section 4). That gives a branch cave under a basalt cap, with its
springs at the notches below the basalt. Low gain: the scablands' coulee station could show a spring line at the
basalt's base. Note the lake marl that fires Jimjam's yellow brick (`LORE.md`, the Brick paragraph).

---

## Weak or not karst (do not use KKARST)

| Place | 5.1 px | Why not |
|---|---|---|
| The Ring Isles' reef bank | 1002,779 | Reef limestone, but the Ring Sea's level has not changed, so there is no emergent old reef and no blue holes. The living reef is all there is |
| Farside's spray coral | the Farside polygon | young lime growing on the spray, metres thick, and **on the tsunami coast** (scoured to 65 m, run-up to 100 m) |
| The Catch's soda pans | 1035-1107, 1389-1433 | gypsum and halite bytes to 255, but **16 mm of rain**: nothing dissolves. A salt cave needs at least a flash flood and a salt body with relief |
| The White Loom (Lake Nim) | 1690,1178 | a halite playa crust at 240 m with 47 mm of rain; the chasm walls are basalt horsts. No salt body to cave |
| Xanadu's Alph | 938-988, 1458-1496 | its "caverns" are `tube_xanadu_nw_09`, the Alph's headwater conduit: **a lava tube**. The vale's "limestone" is floor dressing (`xanadu/NOTES.md`) |
| ebadlands' "redwall" | e badlands | a sandstone variant in the ground paint (`45-host-stage.js`), not limestone |
| Geyser's and the Gills' travertine | | hydrothermal aprons (`core/water` terraces), not cave rock |
| wouterwall's loess sinkholes | | piping in loess (pseudokarst). KRELIEF's `doline` kind could draw them, but there is no cave network |
| Godstep's gypsum crusts | `tube_god_07` | mineral crusts inside **lava tubes** |
| The Cliff Lungs | 745-930, 1022-1060 | an organism's skeleton. It already uses `WATER.karstSpring` for its wells |
| Copper Glacier (the exception to "N and W last") | 213,1225 | copper porphyry with malachite and azurite under glaciers at 5.4-6.5 km (HT, EF). No carbonate host is named; only ice caves fit |
| The Rift rim's deep limestone shafts | | rated "weak" by `riftrim/PLAN.md`: a dry world seldom lays the hundreds of metres of marine limestone Alpine shafts need |

## The new N and W regions (noted, not developed)

- **Neo-Ozarks and Spider Lake** (`neo-ozarks` 1109-1318 x 107-231; `spider lake` 1225-1417 x 154-291): flat cherty
  dolomite and limestone at 1,260-1,680 m, Cfa, 1,450-1,870 mm, with "spring-fed hollows and first-magnitude karst
  caverns" (`smodel/nw_expansion.py`). Spider Lake's coves take Neo-Ozark karst springs (`spiderlake/PLAN.md` 3.2).
  This would be an A site if it were in scope.
  **It is already in the data:** `tube_ozarks_15`, "Neo-Ozarks Dolomite Karst & Porphyry-Vein Cavern System", 310 km,
  three caverns (a phreatic hall on a dike wall, an onyx labyrinth, the Shut-In Big Spring resurgence). **But its line
  runs at 988-1132 x 290-364, outside the `neo-ozarks` polygon** (in arachnoid canyons and the NE outer wall, half in
  the old area south of y 330). Either the tube or the polygon is in the wrong place. For the owner.
- **The NE outer wall's skarns** (1089-1456 x 253-399): carbonate wall rock cooked to skarn by the Northern Korona. It
  could be a marble cave, but no plan asks for one.
- **The Crook, the Silent Vales, the Sasquatch Tribes, the Arch**: no soluble rock is named.

## Conflicts, summarised

- **Lava tubes.** No karst site lies on a tube. Two cavern settlements are on tubes and are not karst: The Tubes
  (`tube_rift_08`) and Loj Twenny (`tube_rift_08`'s line). The Throne's Zeijani tubes are 95 km and more from the
  Hykkousoi karst.
- **The tsunami line.** It touches Farside only (the `tsunami coast` polygon 97-636 x 115-673). No ranked site is inside it.
- **The Godthrone's tubes and the Ancients' tunnels.** The pyroducts (`tube_god_*`) and Pluton's tunnels up the
  Godthrone are 200 km and more from every ranked site. The Ancients' **Rift line** is the one place where a tunnel
  should meet a karst cave (site 6, and maybe site 3); `riftrim/PLAN.md` says they joined natural caves where they could.

## Notes for the module

- `KKARST.build`'s default rock is `'tuff'`. Pass `rock:'limestone'` or `'gypsum'` for these sites, but note that the rock is
  only a label so far: KCAVERN has materials for basalt and tuff only (`MATS`), and draws any other rock as raw tuff. A
  limestone and a gypsum material for KCAVERN are owed before these caves look right.
- Hypogene caves now have their own kind (`kind:'hypogene'`, 2026-11-03; site 4). Another candidate for it: the Throne's
  vents meeting the Hykkousoi limestone.
- Hykkousoi sumps are roads, not hazards: `KKARST.hazards` could take a `breathers` tag so `drown` skips water-breathers.
