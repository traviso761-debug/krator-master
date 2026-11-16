# kits/tungang: the Tungang kit

The culture kit of the Rift's tunnel people, the Tungangs, their kin on the rim and the fells, the Fellgangs, and the
Glaziers of Opal Valley: **one kit, three sets** on one salvage foundation (`PLAN.md`, the design; its owner's answers
blocks are the decisions). **Built so far: the Fellgang set (`fg`)**, the fell villages of `PLAN.md` section 3.3.1 (the
owner, 2026-11-11: "build the fellgang villages now") and **the Tungang set (`tg`)**, the carved defs Loj Twenny needs (`PLAN.md`
section 3.2; below). The Glazier (`gz`) set comes later.

- **Page:** `dist/tungang.html` (the kit sheet), its library pack beside it (`dist/tungang.tex.tungang.js`).
- **Build:** `python3 tools/build.py kits/tungang` (runs `build.py`, records `build-inputs.json`).
- **Check:** `python3 verify.py dist/tungang.html --assert` (on `tools/harness.py`; `KRATOR_GL=gpu` for the real GPU),
  `node tests/test-bundle.js` (the sealed bundle in plain node), `node core/hamlet/test-hamlet.js` (the `fellgang` row),
  `node tests/test-wildcat.js` (Wildcat through the bundle), `node core/pueblo/test-pueblo.js` (the pueblo builder).
- **For another world:** `tungang_bundle.py` seals the kit as the global `TG`; `API.md` says what to call (`TG.fg.draw`).
  `bundle(furniture=True, furniture_tex=True)` seals the catalog's library detail maps in with the furniture (about 1.9 MB:
  every family, since a piece's family is known only when it is built), so the pieces are textured, not vertex colours only;
  Loj Twenny takes it. Off by default, byte for byte.

## The Fellgang set

The rim and fell folk's villages are peaceful working towns: drystone of the rim's stone under turf on bell-fir poles, low
and long, the meeting hall the one large room; the salvage **lashed and spiked** on (the rule of salvage, `PLAN.md` 2.1:
Ancient white plate doors on cable hinges, rusted plate patches, fan blades, spikes on the gables), and the union's words kept
as daubed slogans (NO SKABS, ALL OUT, HOLD FAST). Fellgangs bear the day: 1.0 scale (1.8 m doors).

**The contract (`PLAN.md` 3.3.1).** riftrim's Fowlers and Ice-cutters stations (`biomes/riftrim`, stations 8 and 9) lay
their villages with `KHAMLET.village` on stand-in boxes keyed `fg-*`. The kit keeps the **same keys and boxes**
(`src/26k-kit.js`, `TG.fg.BOX`: an **upper bound**, each building filling 65-100 % of its w and d and 75-100 % of its h,
never 0.5 m past it, asserted) and the **same frame** (origin at the
footprint's centre, the door on +z toward the lane, the floor at the footprint's highest corner, a drystone plinth to its
lowest), so a station swaps `FELLGANG.draw` for `TG.fg.draw` with no layout change.

**Massing families** (the owner, 2026-11-11: "a bit more variation in size and massing"; `src/42-fg-mass.js`). Each
house-like key draws one of three to five families by seed (the sheet shows them in turn, five seeds a row) or, in a
village, weighted by its character: **stony** (the Fowlers: blackhouses, beehive cells, steeper roofs) or **low** (the
Ice-cutters: blackhouses, crofts, hips, lower walls), which `TG.fg.draw` takes from the village's focus.

| Key | Families |
|---|---|
| `fg-hut` | gabled; blackhouse; with a beehive cell; half-hipped croft with an outshot; with a wreck's cab for a porch |
| `fg-house` | gabled with a gable stack; blackhouse; burstabaer (2-3 painted gable fronts, a passage range behind); croft with an outshot; double pile (twin ridges) with a buried container store |
| `fg-longhouse` | gabled; Norse bow-sided (curved long walls, bowed ridge); Welsh (half-hipped, a cross passage with opposed doors); long blackhouse; hipped croft with a plate lean-to. The byre always at the low end |
| `fg-headhouse` | porched; burstabaer of 3-4 fronts; double pile with a cab porch; bow-sided with a beehive cell; half-hipped with an outshot |
| `fg-meethall` | porched; bow-sided; low half-hipped |
| `fg-store` | gabled; blackhouse; with a buried container; half-hipped with a plate lean-to |
| `fg-smokehouse` | gabled; hipped; with a beehive cell (each under a louvre) |
| `fg-barn` | gabled; half-hipped; bow-sided; with an outshot |
| the rest | fill and proportion by seed: the sheds' length, depth, height and eave; the pens' layout; the ice house's barrow; the cairn house's and egg store's radius and dome |

Details vary by seed within a family: the pitch (30-50 degrees; a burstabaer's gables steeper), the wall height, the
chimney (a hood along the ridge or a stone stack at a gable), the door's offset, small windows of visor glass, and the turf
(green, brown, patchy with dead turf, flowering).

| Key | Box (w x d x h) | What it is |
|---|---|---|
| `fg-hut` | 6 x 5 x 4.2 | one room: walls 0.7 m thick, a plate door on cable hinges, the hearth under a smoke hood; a fur bed, sacks, a stool, a lamp; a slogan scratched on rusted plate |
| `fg-house` | 9 x 6 x 4.8 | two hearths and a cross wall; a box bed in a plank cabinet against the back wall; a store loft on poles over the second room with its ladder; the family's slogan by the door |
| `fg-longhouse` | 15 x 6.5 x 5.2 | house and byre under one roof; the byre takes the **lower end** (it reads the footing), stalls, a muck channel to a drain slot through the gable, hay; a fan blade over the byre door; spikes on the house gable |
| `fg-headhouse` | 13 x 8 x 5.8 | the head's house: the front wall set back 2 m behind a porch on two fir posts, the hearing bench, the head's table and stool, ALL HANDS on the eave; two rooms, plate shutters, the rulebook |
| `fg-meethall` | 18 x 10 x 7 | the one large room: benches down both long walls, a kerbed fire trench down the middle under three hoods, a scrap-plate porch; variant **`fowlers`**: the rope wall (a peg a family in two rows, each family's mark over its peg, its coil in its colour, an empty peg); variant **`icecut`**: the tally board (36 notched slats, OWED chalked at its end). A ROPE IS A VOTE or THE COLD IS OWED over the porch |
| `fg-cairnhall` | 7 x 7 x 6 | a corbelled drystone round house, a turf crown; inside a stone bench round the wall and the dead's names: slate tallies on cords in three rows (~230), a name scratched on each; the broad step the old rules are said from |
| `fg-store` | 8 x 6 x 4.5 | plank shelves on stone brackets with the goods (hides, cans, bar metal, furs), a stone counter topped with plate, sacks, a barrel, a strongbox; TRADE |
| `fg-smokehouse` | 6 x 5 x 4.5 | the roof stops short of the ridge under a louvre of scrap slats; racks of fowl and fish on poles at three heights; a peat smudge |
| `fg-barn` | 12 x 7 x 5.5 | a wide double plate door, the back door opposite, a threshing floor of flags between; hay stacked in one bay, peat blocks in the other; loft beams |
| `fg-ropehouse` | 20 x 5 x 4 | the rope walk: an open shed; twisting jacks at both ends with three strands laid between on trestles; a splicing bench with the Ancients' cable coiled; every family's spare coil on its own marked peg; HOLD FAST |
| `fg-eggstore` | 6 x 6 x 4.5 | round, half sunk (the floor 0.8 m down, steps in), turf banked against the low wall, a corbelled dome and turf cap; egg racks bedded in ash (126 eggs), honey crocks, herbs hung |
| `fg-pens` | 14 x 12 x 1.4 | drystone pens under a turf coping, a footing under each run; a gate of rusted plate and stakes on two posts; a corrugated lean-to against the back wall; a trough |
| `fg-icehouse` | 12 x 9 x 4.5 | a turf barrow over a stone vault; its front dented back for a drystone facade faced with plate, the plate door, a flagged apron; the reckoning chalked in fives on a plate by the door; inside (the cut-away) the blocks in tiers, sawdust between, snow on top; saw, pike pole, tongs |
| `fg-sledgeshed` | 16 x 7 x 4.2 | an open shed; sledges of painted boards on fir runners faced with tyre strips, two racked on end, one on trestles half painted; paint pots on a bench |

**The road and the wall** (the records that are not buildings; `src/60-fg-road.js`):

| Key | What it is |
|---|---|
| `fg-fixed-line` | a family's rope drawn from the station's record `{pts, y0, top, family}`: Ancient cable for the first 30 m, bark cordage above, an iron peg every 25 m with a rope-end and the family's mark, a ladder (pipe rails, fir rungs) up the first 18 m, the mark on a staked plate at the foot |
| `fg-lantern-post` | a lantern lobelia (faint blue) in a cut can of tin under a plate hood on a fir post, a cairn at its foot |
| `fg-wall-station` | a plank deck on iron pegs where a rope passes a flat, a railing; variant 0 a lift cage of the Ancients hung from a gantry, variant 1 a plate shelter lashed to the face over a fur bed |
| `fg-nest-ledge` | the fowlers' gear by a nest: a plank bridged to the ledge, an iron peg and line with a wicker basket of eggs |
| `fg-burial-ledge` | a drystone kerb on a ledge, the dead wrapped in hide and bound with cord, a little cairn at the head, the family's rope coiled beside, a slate with the name |
| `fg-halt` | the Travellers' halting place (the Fellgangs who live on the road: the owner, 2026-11-11): A-frames of fir, hide down the back slope, plate at the windward end, fur beds, a fire before it, a lantern on its pole |
| `fg-ice-tools` | the Ice-cutters' tools by their stacks: an A-frame rack of fir, two long ice saws, pike poles with iron hooks, block tongs, a coil of rope |
| `fg-wagon` | the Travellers' rolling home: a barrel-top sledge-wagon of bright painted boards with a scalloped trim and the family's mark, plate runners faced with tyres, a drawbar, a stove pipe, a painted door and steps at the back |

**States.** `kept` and `worn` (`?state=worn`, or the State select on the panel, which reloads): worn greys the colours,
patches the turf with dead brown, slumps the ridge, stands doors ajar, drops stones at the walls' foot, puts out the fires.

**The sheet.** Each building in a row, three seeds a row (the meeting hall in both variants); the wall and the road pieces.
East of the rows **a sample village** laid by `KHAMLET.village` on core/hamlet's `fellgang` row (focus `fowling`) and drawn
through `TG.fg.draw`, with a stretch of lantern road, a halt and a wagon; west **a sloped pad** (12 % and 5 %) with five
buildings on its ground; north-west **a test wall** with a ledge, six families' ropes, wall stations, nest gear and burial ledges.

## Wildcat: the scrap pueblo

The Fellgangs' raiding village, about half Kimr (`PLAN.md` 1.3.1, the owner's round 6): **one great house** of Pueblo
Bonito's scale and **two hamlets**, planned by **`core/pueblo`** (`KPUEBLO.house`: room cells keyed by stable ids, storeys
stepping back from the plazas, terraces, kivas, ladders, the stockade's ring; plain records, no three.js) and drawn by the
kit: drystone and rammed-earth columns faced in salvage (sheet, rusted and white plate, car shells, container panels),
vigas and rail ends in rows, parapets, T-doors framed in mammoth ivory onto the terraces, plate hatches, ladders of pipe and
fir, no door at the ground; the round room (the great kiva, the Boast's stand on its roof, trophy poles), small kivas; the
dress: the hero's horned crest and aurochs skulls, the Deeds on the front, NO SKABS on the outer walls, glyptodont shells.

| | |
|---|---|
| The great house | a D 148 x 83 m: 805 rooms up to five storeys, 1,145 people, two plazas, the round room and three kivas, 98 ladders, a stockade 24 m out at the knoll's foot |
| The hamlets | the ford's U (60 people, a low stockade), the pens' L (82) |
| Fragments | `44-fg-wc-plan.js` (the specs and the dress: records), `46-fg-wc-draw.js` (the drawing and the six `fg-wc-*` defs), `82-wc-host.js` (`TG.fg.pueblo`, `TG.fg.puebloRegister`, `TG.fg.check.pueblo`), and the sheet's `89w`, `91w`, `96w` |
| On the sheet | the great house on a knoll at (600, -170), the hamlets below it; rows of one room block alone, the round room and kivas, the stockade; `Wildcat:` views |

## Barricade: the wall across the pass

The second great house (`PLAN.md` 1.3.2, the owner's round 7): Fellgangs who wall **the Weyt Warra's gorge**, a major pass into
Firebliss, and count everyone through (*proposed*: the union's picket line made stone). core/pueblo's **`bar`**: one block four
rows deep and 176 m across, its outer face sheer and **barricaded with stacked Ancient wrecks**, bastions of six storeys at
the gorge's walls with crow's nests, terraces stepping down to a long plaza open toward Firebliss between two wings; **a gate
tunnel** (the tallies of the crossings painted inside) and **a culvert** for the river under its rooms; red picket banners;
NOBODY CROSSES. 620 rooms, 1,027 people; the count room (the great kiva) with its count boards and toll chests. Fragments
`47-fg-bc-plan.js` (spec, dress) and `48-fg-bc-draw.js` (def `fg-bc-greathouse`); on the sheet across a gorge at (-480, -170).

## Inside the pueblos

Both great houses (and the hamlets and the row's blocks) are hollow (`PLAN.md` 1.3.5): every room walled, plastered, its
door or window open, its hatch and ladder; the kivas dug (bench, pilasters, hearth, deflector); the plazas paved. Every room
furnished by its use from the catalog (12 new Fellgang pueblo pieces: sleeping platform, mealing bins, corner hearth, wall
shelves, grain bin, storage jars, water jar, felting frame, horned seat, spear rack, count board, salvage bin), placed by
core/pueblo (`KPUEBLO.furnish`), drawn in chunks near the camera. **K** steps the storey section (whole, the kivas, storeys
1-6); the `... inside:` views open it.

## Core adoption

What this set takes (trimmed from `PLAN.md` section 8 to what is built; `python3 tools/check_core_use.py` passes):

| Module | Taken | For |
|---|---|---|
| `core/engine` | yes, read in place | the defs, their records, the merged buckets, the sheet's scene; the host draw (`80-fg-host.js`) runs it dry into buckets of its own |
| `core/rand` (`KRAND`) | yes | the village's look per building (a hash of the world seed and the record's index), the test grounds; the engine's per-def stream is seeded by `place()` from the def's seed and variant |
| `core/tags` (`KTAGS`) | yes | every row building, piece and furniture piece registered before it is drawn; the sheet registers its test grounds' records first, as a station does; culture `fellgang` (in the vocabulary) |
| `core/pueblo` (`KPUEBLO`) | yes, read in place (new) | Wildcat's great house and hamlets: the plan as records; the bundle seals it with `core/space` |
| `core/hamlet` | yes | the sample village; the new opt-in `core/hamlet/fellgang/22-hamlet-fellgang.js` (the `fellgang` row, the `fowling` and `ice` focuses) |
| `core/space` (`KSPACE`) | through core/hamlet | the village's overlap index (no new occupancy grid) |
| `core/city` | `33-city-strategies.js` only, through core/hamlet | `KCITY.prim` (the lanes' frontage cursor), read in place; the cavern setting comes with the Tungang set |
| `core/materials/record` | yes | `materials.json` on the library: 20 families and 9 furniture detail maps (`tex/`) |
| `core/catalog`, `core/furnish`, `kits/catalog` | yes | the Fellgang culture file and the generic goods and trades, placed through `FURNISH` on the sheet |
| `core/door` | yes | the plate doors are `KDOOR` records: they open with E on the sheet |
| `core/host` | yes | camera, panel, inspector, polygon tool, probe |
| `core/atmos` | yes | the placeholder sky and the skylight on the library materials |
| `core/walk`, `core/walk/box` | yes | every box a building draws is a floor or a block (`src/37-wk-rec.js`); round walls as arcs of blocks; the doors' blocks switch as they open; F walks the sheet |
| `core/sockets`, `core/lod`, `core/export`, `core/terrain` (`KCAVERN`), `core/camp`, `core/minimap`, `core/shader` x-ray, `core/hazard`, `kits/ancient-transit`, `kits/motor-vehicles` | not yet | the Tungang set's holds and the Line; the Godot export is a `KNOWN_ISSUES.md` item |

## Checks

`verify.py --assert`: every check runs on the page and on a broken input that must fail (its negative):

| Check | What | Its negative |
|---|---|---|
| `box-within-contract` | every row building's measured box never 0.5 m past its `TG.fg.BOX` (w, d, h above the floor), the pieces' of their declared boxes; kept on the page, worn through `TG.fg.proto` | too big: a meeting hall measured against the hut's box |
| `box-fills-its-share` | and filling 65 % of the box's w and d and 75 % of its h | too small: a hut measured against the meeting hall's box |
| `triangle-budget` | every def within its own budget, kept and worn; the sample village under 130k | the budgets cut to a quarter |
| `walls-block-doors-pass` | a hut's door blocks a walker shut and lets one through open; 1.35 m along its wall the wall's box stops one | a walker put in the wall, checked as passing |
| `tags-vocabulary` | the core/tags audit: no unknown value or key, every building with a culture and types | a record of culture `nonesuch`, type `spaceport` |
| `error-panel` | the panel and the console clean | a panel holding an error |
| `meethall-variants` | the two `fowlers` halls carry a rope wall (pegs, coils = pegs less the empty, one empty), the two `icecut` halls a tally board (slats, 3+ notches each); the sample village's hall is `fowlers` with a peg for each household | the tally board checked as a rope wall |
| `plinth-on-slope` | on the sloped pad every floor at its footprint's highest corner, every plinth down to its lowest; the longhouse's byre down-slope there and at +x on the flat | the pad's buildings checked against ground 3 m lower |
| `fixed-line-follows` | the six ropes: every cable and cordage vertex within 0.12 m of its record, every record point within 0.12 m of the line; pegs and rungs drawn | the records moved 3 m east |
| `host-api` | `TG.fg.draw` draws every record of the sample village | a record of a key the kit lacks is reported missing |
| `coverage`, `no-nan`, `furniture-keys`, `material-records` | every def drawn; no NaN; every catalog key found; the library records | an unknown def, a NaN mesh, an unknown catalog key |
| `wildcat-plan` | the great house's plan passes `KPUEBLO.check` (terraces, reach from outside, no ground doors, no overlap, kivas, ids), 1,000-2,000 people, every column, kiva, door and hatch drawn | a front room raised to nine storeys over the terrace behind it |
| `wildcat-on-knoll` | the floor at the hull's highest ground on the knoll, the footings to the ground, the stockade's stakes down the slope | the floor checked against the knoll 3 m lower |
| `wildcat-tags` | every room, kiva and ladder a child of the house's record in core/tags | the rooms counted against one more |
| `wildcat-dress`, `wildcat-hamlets` | the crest, six trophy poles, the Deeds, the slogans, the shells; both hamlets pass, 40-300 people, yards open | seven poles; the hamlets against the great house's range |
| `barricade-plan`, `barricade-in-the-gorge` | Barricade's plan passes, 600-2,000 people, its gate and culvert, wrecks, gear, lookouts, pickets, slogans drawn; its floor on the gorge's floor, its bastions within 4 m of the walls, the river's bed under the culvert | its plan against Wildcat's draw; walls 1 m off |
| `pueblo-interiors`, `pueblo-furniture-table`, `pueblo-section` | both houses' rooms hollow, every piece placed, `KPUEBLO.check.furniture` clean; the table's keys and sizes as the catalog's; the section clips every house at a storey and closes | a piece on its hatch; `fellgang_nonesuch`; storey 2 as the ground floor |

`node tests/test-bundle.js` runs the sealed bundle without a browser: both riftrim villages (their stations' specs) drawn on a
slope, the plinth, the hall variants by focus, every key at 8 seeds in three characters within the contract, the ice village
lower than the Fowlers', a rope, the road pieces, the furnished bundle; each with its negative.

## The Tungang set (`tg`, 2026-11-11)

The Line's crews' rooms, cut into the rock (`PLAN.md` 3.1-3.2, 5): squared, small and many, hewn or plastered; every door on a
gallery with its lamp of the code's colour, a stencilled number and its click-ribs; wealth in the salvage fitted. **Carved
first**: a def is its front and a **void plan** (`TG.tg.plan(key)`: rooms behind its front at -z, a doorway .4 m out past it),
the one source the world carves (KCAVERN through `KCITY.cavern.carve(H, {plan: TG.tg.planOf})`), the builder draws inside
and core/city's cavern setting lays out. The frame is a wall site's: the origin the foot of the front, the door facing +z.

| Key | Box (w x d x h) | What it is |
|---|---|---|
| `tg-cut` | 2.8 x 3.6 x 2.4 | a single hewn cell: a curtain door, a red lamp, a bunk, a glow-cap jar, a peg wall |
| `tg-set` | 7.4 x 8.6 x 2.6 | a household's cut rooms: the hearth room (drum stove, trestle, seats, peg wall, bait locker), the sleeping room (box beds), the store; the doorway plastered white with the berth numbers, a child's chalk on it |
| `tg-loj-hall` | 14 x 17 x 6 | the meeting: the white count wall ruled in squares behind the steward's desk, its low lamp row behind six rows of raked benches, the banner wall, the minutes on enamel, the crew mosaic, the Book's lectern, the Tpresden's chair, the minute chest, the turn bell |
| `tg-signal-box` | 6.4 x 5.2 x 3 | the steward's office: the lever frame, the desk, the timetable, the rota, the lockers |
| `tg-carriage-house` | 27 x 8.6 x 5.4 | a Line carriage drawn into a cut bay: plated slit windows, the livery band, the number plate, a brass bell, the banner, the carriage seats set out, a cut galley behind |
| `tg-dark-beds` | 12.4 x 14 x 3.2 | racks of fungus trays in four rows under amber tending lamps, the mat beds, the mash bin, the drip gutter |
| `tg-cistern` | 8.4 x 9.4 x 3.6 | a sunk tank of dark water under a plate walk and rails, the drip gutters, the tap and the butts |
| `tg-bath` | 8.4 x 9.4 x 3.2 | a plastered pool of warm water with steps, benches, the wash trough, the steam |
| `tg-fan-house` | 6.4 x 8.2 x 4.4 | the Ancients' fan in its frame before the duct, the draught doors, the rota |
| `tg-doors` | 10 x 4.4 x 5 | the gate across the way (`span`): two plate leaves folded back, the winding gear, the guard cut, the white lamp hooded |
| `tg-night-mouth` | 3.4 x 16 x 3 | a porch with its click-ribs and hooded white lamp, a cut stair climbing 4.2 m toward the surface, a door at its head |
| `tg-last-stop` | 7 x 12 x 3 | the seal plates across the siding with the berth numbers painted, the last lamps burning down, the dead in their berths behind |

**States**: `kept`, `worn` (greyed, lamps dimmed, curtains rags, rubble), `abandoned` (dark, the furniture thinned, doors
hanging, the plaster stained); `o.state`, a site's `state`, or `?tgstate=` on the sheet. **Light**: every lamp is a light
record in `TG.tg.LIGHTS` (core/cavelight's shape: the lamp code's `lamp-red`, `lamp-green`, `lamp-amber`, `glowcap`,
`lamp-white` hooded, and `wax` in the rooms). **Furniture**: the catalog's Tungang pieces at **0.94** (`tgFurn` queues them;
`TG.tg.draw` places them in a batch of their own scaled by `TG.tg.SCALE`: KFURN.drawRec passes no scale).

**The sheet's test hold** (`src/91g-tg-sheet.js`, south of the rows): three galleries, kept, worn and abandoned, each lined
with every def, laid on `KCITY.cavern`, carved in KCAVERN (drawn as a dollhouse with the rock cut, `39h`), drawn through
`TG.tg.draw`. Its views start "Test hold". `verify.py --assert` runs the `tg-*` checks.
