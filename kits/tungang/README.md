# kits/tungang: the Tungang kit

The culture kit of the Rift's tunnel people, the Tungangs, their kin on the rim and the fells, the Fellgangs, and the
Glaziers of Opal Valley: **one kit, three sets** on one salvage foundation (`PLAN.md`, the design; its owner's answers
blocks are the decisions). **Built so far: the Fellgang set (`fg`)**, the fell villages of `PLAN.md` section 3.3.1 (the
owner, 2026-11-11: "build the fellgang villages now"). The Tungang (`tg`) and Glazier (`gz`) sets come later.

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
(`src/26k-kit.js`, `TG.fg.BOX`; each def within 0.5 m of its box, asserted) and the **same frame** (origin at the
footprint's centre, the door on +z toward the lane, the floor at the footprint's highest corner, a drystone plinth to its
lowest), so a station swaps `FELLGANG.draw` for `TG.fg.draw` with no layout change.

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
| `fg-wagon` | the Travellers' rolling home: a barrel-top sledge-wagon of bright painted boards with a scalloped trim and the family's mark, plate runners faced with tyres, a drawbar, a stove pipe, a painted door and steps at the back |

**States.** `kept` and `worn` (`?state=worn`, or the State select on the panel, which reloads): worn greys the colours,
patches the turf with dead brown, slumps the ridge, stands doors ajar, drops stones at the walls' foot, puts out the fires.

**The sheet.** Each building in a row, three seeds a row (the meeting hall in both variants); the wall and the road pieces.
East of the rows **a sample village** laid by `KHAMLET.village` on core/hamlet's `fellgang` row (focus `fowling`) and drawn
through `TG.fg.draw`, with a stretch of lantern road, a halt and a wagon; west **a sloped pad** (12 % and 5 %) with five
buildings on its ground; north-west **a test wall** with a ledge, six families' ropes, wall stations, nest gear and burial ledges.

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
| `core/walk`, `core/sockets`, `core/lod`, `core/export`, `core/terrain` (`KCAVERN`), `core/camp`, `core/minimap`, `core/shader` x-ray, `core/hazard`, `kits/ancient-transit`, `kits/motor-vehicles` | not yet | the Tungang set's holds and the Line; the walk records and the Godot export are `KNOWN_ISSUES.md` items |

## Checks

`verify.py --assert`: every check runs on the page and on a broken input that must fail (its negative):

| Check | What | Its negative |
|---|---|---|
| `box-within-contract` | every row building's measured box within 0.5 m of its `TG.fg.BOX` (w, d, h above the floor), the pieces of their declared boxes; kept on the page, worn through `TG.fg.proto` | a hut measured against the meeting hall's box |
| `tags-vocabulary` | the core/tags audit: no unknown value or key, every building with a culture and types | a record of culture `nonesuch`, type `spaceport` |
| `error-panel` | the panel and the console clean | a panel holding an error |
| `meethall-variants` | the two `fowlers` halls carry a rope wall (pegs, coils = pegs less the empty, one empty), the two `icecut` halls a tally board (slats, 3+ notches each); the sample village's hall is `fowlers` with a peg for each household | the tally board checked as a rope wall |
| `plinth-on-slope` | on the sloped pad every floor at its footprint's highest corner, every plinth down to its lowest; the longhouse's byre down-slope there and at +x on the flat | the pad's buildings checked against ground 3 m lower |
| `fixed-line-follows` | the six ropes: every cable and cordage vertex within 0.12 m of its record, every record point within 0.12 m of the line; pegs and rungs drawn | the records moved 3 m east |
| `host-api` | `TG.fg.draw` draws every record of the sample village | a record of a key the kit lacks is reported missing |
| `coverage`, `no-nan`, `furniture-keys`, `material-records` | every def drawn; no NaN; every catalog key found; the library records | an unknown def, a NaN mesh, an unknown catalog key |

`node tests/test-bundle.js` runs the sealed bundle without a browser: both riftrim villages (their stations' specs) drawn on a
slope, the plinth, the hall variants by focus, the 14 boxes built alone, a rope, the road pieces; each with its negative.
