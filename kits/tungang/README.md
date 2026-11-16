# kits/tungang: the Tungang kit

The culture kit of the Rift's tunnel people, the Tungangs, their kin on the rim and the fells, the Fellgangs, and the
Glaziers of Opal Valley: **one kit, three sets** on one salvage foundation (`PLAN.md`, the design; its owner's answers
blocks are the decisions). **Built here: the Fellgang set (`fg`)**, the fell villages of `PLAN.md` section 3.3.1 (the
owner, 2026-11-11: "build the fellgang villages now"), and **the Glazier set (`gz`)**, the eastern loj of Opal Valley (`PLAN.md`
sections 1.4, 3.4; 2026-11-16). The Tungang (`tg`) set is on Loj Twenny's branch (`claude/loj-twenny-059a5e`).

- **Page:** `dist/tungang.html` (the kit sheet), its library pack beside it (`dist/tungang.tex.tungang.js`).
- **Build:** `python3 tools/build.py kits/tungang` (runs `build.py`, records `build-inputs.json`).
- **Check:** `python3 verify.py dist/tungang.html --assert` (on `tools/harness.py`; `KRATOR_GL=gpu` for the real GPU),
  `node tests/test-bundle.js` (the sealed bundle in plain node), `node core/hamlet/test-hamlet.js` (the `fellgang` row).
- **For another world:** `tungang_bundle.py` seals the kit as the global `TG`; `API.md` says what to call (`TG.fg.draw`).

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

## The Glazier set

The Glaziers are the eastern loj: the crew who went up the Opal River into the fault and were not absorbed, a thousand years
apart from the Union (`PLAN.md` 1.4, `LORE.md` 6.13). Their hold is **carved into a fault scarp over the milk-opal tarns**, the
only Tungang hold with a face to the sky: tiered, battered, whitewashed fronts in the cliff, tapering window cuts under cusped
arches glazed with **moonglass** (potch, the common opal with no fire, sliced thin), the parapets banded in alecap purple,
cholet bands in rose, teal and saffron, gilt on the rich (bought with opal), the eight-spoked wheel over the door, the **click
wheels** (Xanadu's prayer wheels hung with opal chips and frost-willow spicules), Oidong's celadon and the Register's enamel in
the Order's blue. A Tungang loj underneath: the count wall, the banner, the timetable of the train that never comes, the lamp
code. The Orientalism is kept light. Culture id `glazier` (opt-in: `core/tags/glazier/`); openings at `TG.SCALE` 0.94.

**A carved def is a front plus a void plan** (`kits/zeijani/PLAN.md` 6.3). The front is the builder's; the rooms are voids
in the rock, and **the void plan is the one source** (`TG.gz.plan`): the sheet carves the rock from it (KCAVERN), the builder
draws its floors, whitewash linings, furniture and lamps from it, core/walk takes its floors from it. The frame: the origin at
the front's foot on the rock face, the front out toward +z, the rooms into the rock at -z (`API.md`, `TG.gz`).

| Key | Tier | What |
|---|---|---|
| `gz-cell` | poor | one tier and a door (a trefoil arch, a curtain or a carved leaf); a carved room (hewn or plastered) with a bed shelf, the tea board, the mask rack; a store niche |
| `gz-front` | middle | two tiers; the hearth room (a drum stove, carpet, tea, bolsters), the sleeping room, the store; a steep timber stair up to the upper room behind tier two, which opens on the terrace |
| `gz-house` | rich | three or four tiers (by seed): five-lobed arches, gilt, a lattice bay (jharokha), the eight-spoked wheel, a gilt finial; the polished reception room with carpets, bolsters, celadon and the tea copper; the kitchen and the store; the family rooms; the shrine room with its click wheel and opal boss; the top room |
| `gz-stair` | common | two or three switchback flights up the scarp: masonry from the ground, timber on iron brackets above; white hooded lamps at the landings (the edge) |
| `gz-wheel-walk` | common | 8 to 12 click wheels in a rock-cut niche row under a carved eave, a parapet on the ledge's edge |
| `gz-tea-hall` | civic | the loj's meeting hall (12 x 10.4 m, polished, vaulted): the benches down the west wall, the count lamps behind them and the ruled count wall opposite, the steward's carved seat on its dais, the gilt-framed timetable and the banner, the brass urn on its carpet, celadon, the guest benches for monks and clerks; three tiers of front, the guest gallery |
| `gz-register-room` | civic | the Register of the Veins: one enamel plaque per vein (24 to 47), the hold's own on the front; the claim book, the counting table with its trays of cut stones and balance, the seal; the Fifth's strongroom behind an iron door |
| `gz-glass-shop` | common | the moonglass workshop: wide windows with the wares, the slicing and polishing benches, the lens lathe, racks of panes, plate frames, the wet trough |
| `gz-monks-house` | civic | the Order's blue bands; the reading room (low desks, the scroll rack, cushions, butter lamps), the pigment mill (an edge-runner grinding opal spoil), a cell |
| `gz-adit` | common | a plate-framed portal, the Register's plaque, the amber and the white hooded lamps, the potch spoil heap, the wet-drilling flume from the tarn, timber sets to the lit face |
| `gz-vein-gallery` | common | a narrow gallery in, a turn and on along a potch line (a pale band at the contact), the wet floor, the lit face with its opal |
| `gz-dark-adit` | poor | the old mouth behind a wax-cloth curtain and a glow-cap lamp; three kerbed beds of pale fungi and alecap, the spawn trays, the water channel |
| `gz-lotus-pond` | common | three whitewashed basins stepping down from the face to the tarn, the opal water-lotus, a sluice from the rock, a path of flags |

**States.** kept, worn (greyed, the paint flaking, doors ajar, lamps dimmed, rubble) and abandoned (dark: no lamp lit, the panes
broken out, the curtains rags, the furniture thinned, the gilt dull): `?state=` or the panel's State select.

**The sheet.** Thirteen Glazier rows, three seeds each, each row in a block of the scarp's rock carved from its plans; east of
them **a sample scarp hold** in two steps over a tarn: on the lower face the stair, two cells, two household fronts, the
Register, the glass shop and the dark adit, lotus ponds on the shore; on the ledge (6.8 m) and the upper face an adit, a vein
gallery, a cell, a rich house, the wheel walk and the tea hall, the monks' house. C (the cut-away) opens the rock 2.2 m over
every void's own floor.

## Core adoption

What this set takes (trimmed from `PLAN.md` section 8 to what is built; `python3 tools/check_core_use.py` passes):

| Module | Taken | For |
|---|---|---|
| `core/engine` | yes, read in place | the defs, their records, the merged buckets, the sheet's scene; the host draw (`80-fg-host.js`) runs it dry into buckets of its own |
| `core/rand` (`KRAND`) | yes | the village's look per building (a hash of the world seed and the record's index), the test grounds; the engine's per-def stream is seeded by `place()` from the def's seed and variant |
| `core/tags` (`KTAGS`) | yes | every row building, piece and furniture piece registered before it is drawn; the sheet registers its test grounds' records first, as a station does; culture `fellgang` (in the vocabulary) |
| `core/hamlet` | yes | the sample village; the new opt-in `core/hamlet/fellgang/22-hamlet-fellgang.js` (the `fellgang` row, the `fowling` and `ice` focuses) |
| `core/space` (`KSPACE`) | through core/hamlet | the village's overlap index (no new occupancy grid) |
| `core/city` | `33-city-strategies.js` only, through core/hamlet | `KCITY.prim` (the lanes' frontage cursor), read in place; the cavern setting comes with the Tungang set |
| `core/materials/record` | yes | `materials.json` on the library: 20 families and 9 furniture detail maps (`tex/`) |
| `core/catalog`, `core/furnish`, `kits/catalog` | yes | the Fellgang culture file and the generic goods and trades, placed through `FURNISH` on the sheet |
| `core/door` | yes | the plate doors are `KDOOR` records: they open with E on the sheet |
| `core/host` | yes | camera, panel, inspector, polygon tool, probe |
| `core/atmos` | yes | the placeholder sky and the skylight on the library materials |
| `core/walk`, `core/walk/box` | yes | the Glaziers' carved floors from their plans (KCAVERN writes them); every box a building draws is a floor or a block (`src/37-wk-rec.js`); round walls as arcs of blocks; the doors' blocks switch as they open; F walks the sheet |
| `core/terrain` (`KCAVERN`, `host/39e`, `host/39h`) | yes (the Glazier set) | the Glaziers' rock on the sheet, carved from their void plans (`TG.gz.carve`), its floors to core/walk; the cut-away's rock cut |
| `core/tags/glazier` | yes, opt-in | the culture id `glazier` |
| `core/sockets`, `core/lod`, `core/export`, `core/camp`, `core/minimap`, `core/shader` x-ray, `core/hazard`, `kits/ancient-transit`, `kits/motor-vehicles` | not yet | the Tungang set's holds and the Line; the Godot export is a `KNOWN_ISSUES.md` item |

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
| `gz-box-within` | every Glazier site within its box (x within +-w/2, z within [out - d, out], y within h, by 0.5 m) and filling 60 % of w and h, 45 % of d: kept on the rows, worn and abandoned through `TG.gz.proto` | the tea hall measured against the cell's box |
| `gz-void-plans` | every def's void plan at 8 seeds inside its box, its rooms 0.6 m of rock apart (a working's joined stretches exempt) | 4 m of rock asked between rooms |
| `gz-rock-carved` | the rows' and the scarp's rock (KCAVERN) open at each site's first room and solid behind its back wall | every site moved 2 km north, off the rock |
| `gz-lights-by-state` | the kept scarp's lamps as light records (seven kinds of the code), the worn rows' dimmed, the abandoned rows' none | the kept scarp checked as abandoned |
| `gz-host-api` | `TG.gz.draw` draws every site of the sample scarp | a site of a key the kit lacks is reported missing |
| `gz-loj-rooms` | the Register's plaques (one per vein and the hold's own), the wheel walks' 8-12 wheels, the tea halls' count wall, timetable, benches and eight count lamps | one plaque more asked of every Register |
| `gz-walk-carved` | a walker finds the cavern's floor at the hearth room's centre of each household front on the scarp (core/walk from the plan) | a point in the rock behind the hearth room's back wall |
| `coverage`, `no-nan`, `furniture-keys`, `material-records` | every def drawn; no NaN; every catalog key found; the library records | an unknown def, a NaN mesh, an unknown catalog key |

`node tests/test-bundle.js` runs the sealed bundle without a browser: both riftrim villages (their stations' specs) drawn on a
slope, the plinth, the hall variants by focus, every key at 8 seeds in three characters within the contract, the ice village
lower than the Fowlers', a rope, the road pieces, the furnished bundle; the Glaziers' plans inside their boxes and their rooms
apart, every Glazier key at 8 seeds in three states within its box, a small scarp carved from the plans (KCAVERN in node) and drawn
lit kept and dark abandoned; each with its negative.
