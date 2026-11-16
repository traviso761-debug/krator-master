# The landform kinds owed by the unbuilt plans (`38c-core-landforms.js`, 2026-11-03)

An audit of the unbuilt biome plans (2026-11-03) found that most need nothing new in core. These seven landforms were the
exception. Each is a `KRELIEF` kind:

- a **record**, which is plain JSON-safe data. Every draw is `KRAND.hash(seed, slot, ..., salt)`.
- a **height function**, `KRELIEF.shape(rec, x, z, g)`: the height at (x, z) given the ground `g` there.
- a **part reader**, `KRELIEF.at(rec, x, z, g)`: which part of the form (x, z) is on, for cover, strata and placement.

The fragment is `[G data]`: no THREE, no DOM, no `Math.random`. Its test is `node core/terrain/test-landforms.js`, which holds
a negative for every check.

**Adopting it.** List the file after `38-core-relief.js`, with core/rand on the page (`CORE_TERRAIN` in `build.py`). Put the
records in `KRELIEF.apply(ground, [...])` with any older kinds. Once the file is loaded, `KRELIEF.shape`, `at`, `apply` and
`kinds` take the seven kinds; every older kind answers exactly as before (the test's first check).

`KRELIEF.waters(rec, ground)` lists a record's standing water as `{part, x, z, r, y}`, with `y` absolute: the slump's sag
ponds, the runout's dammed lake, and the maar's spring pool (with its outflow, `out`, for `WATER.flow`). It returns `[]` for
any other kind.

No page takes the file yet, so no page's bytes move (`python3 tools/port_baseline.py`).

| Kind | What it draws | Parts (`at`) | Plans it serves |
|---|---|---|---|
| `slump` | Back-tilted blocks under a head scarp. An uphill-facing (antithetic) scarp crosses each block, which makes a double crest with the block's front. Sag ponds lie at each block's back, a sackung trench sits behind the crown, and a toe bulges past the last block. | `trench`, `head`, `anti`, `block`, `front` (where landslip pinnacles stand: KSTACKS places them), `pond`, `toe` | wouterwall §4, the slump terraces (stations 2-3) |
| `runout` | A sturzstrom lobe, lying on the ground. Its margins stand as a raised rim. It has hummocks on the distal lobe, longitudinal grooves, megablocks (records a kit can stand KSTACKS bodies on) and an optional dammed lake. `fresh: false` softens it. | `lobe`, `rim`, `groove`, `hummock`, `megablock`, `lake` | wouterwall §4, the sturzstrom fields |
| `gully` | Sheer loess gullies cut to a floor that never climbs downstream. Branches end in amphitheatre (box-canyon) heads, two orders by default. `tops` is `yuan` (flat tables, sheer rims, fewer branches), `liang` (rounded ridges) or `mao` (the ridges broken into knolls). `rec.heads` lists every head for a spring and a fall. | `floor`, `head`, `wall`, `rim`, `yuan`, `liang`, `mao` | wouterwall §4, the loess tablelands and the edge's box canyons (stations 1, 4) |
| `terraces` | Contour-terraced fields: treads on the height lines, risers and bunds. Cut and fill balance by default. They are held to a zone (a polygon, or a circle) and a height band, and fade out at both edges. | `tread`, `riser`, `bund`, with `level` and a field id `level:i,j` | wouterwall §4 (the terraced fields); loom-chasms' Cradle |
| `maar` | A breached maar-diatreme. A tuff ring surrounds a crater cut to its floor, and a fault's gorge cleaves one rim open. An optional warm spring's pool is dished into the floor, and its outflow runs down the gorge. In the walls, `rock` reads `breccia` inside the pipe (which flares upward), `baked` at its contact, `country` beyond, and `tuff` above the old surface. `rec.fault` drops straight into `KSTRATA.create({faults})`. | `pool`, `floor`, `wall`, `gorge`, `ring`, plus `rock`, `fault`, `rn` | Mid Basin's six horseshoe maars (`tools/scale-model/smodel/se_provinces.py` from l.108: `dir: -PI/2` opens north); the Siphon Pits' pit floors |
| `relay` | Fault scarps with tapering throws. Where two overlap en echelon, the tapers add into a relay ramp, so the ramp is continuous by construction. The downthrown bench sags at the scarp's foot (back-tilted) and the footwall's crest is lipped. | `scarp`, `crest`, `ramp`, `foot`, `bench`, plus `bench` (how many throws stand above) | Mid Basin's three basalt benches, +4,350 m to +1,550 m (the test builds that stack) |
| `stepcut` | A cut with sheer stepped walls and **no falloff**: a graben along a line, or a pit (a disc or an ellipse). Its treads are jittered by hash. The cut is either `depth` under the ground or down to an absolute `floor`, and its edge can be warped. | `rim`, `riser`, `tread`, `floor` | the Siphon Pits' graben and pit stamps (`biomes/siphon-pits/PLAN.md` §5.2, `PLAN-STATIONS.md`) |

**The Siphon Pits' "negative step brush".** KFIELD's brushes (`31-core-field-brush.js`) stay smooth: they are the editor's
strokes, and their falloff is what lets a stroke leave no step. The plan's graben and pit stamps are `stepcut` records, applied
to the ground through `KRELIEF.apply` before the field bakes. `KBASIN`'s smooth stamps are not used for them.

**Seen** as hillshades of every kind (a 256² grid each), not on a page. The mao knolls' first draft stopped at the segment
index's cells. Its reach now covers the knoll zone.

**Not done.**
- No Godot twin: the relief kinds have none yet, and a page bakes them into its KFIELD.
- `slump` and `relay` follow a polyline's nearest segment. A tightly curled line gives a crease, as `KRELIEF.scarp` does.
  Keep their lines gently arcuate.

## The chasm head, the graben net and the flood ripples (2026-11-09)

Three more pieces the plans owed: Mid Basin's amendment 3 (a chasm head, which the Loom-Chasms' slots want too), the Labyrinth's
amendment 3 (the graben net, shared with the Siphon Pits and the Loom-Chasms' horst-and-graben), and Outland Gate's amendment 3
(giant current ripples on its flood floor).

**`stepcut` did not take a floor that varies along its line** (the depth was one number; the line's ends were round caps at full
depth). `head` adds it, in place in `38c-core-landforms.js` and off by default: `KRELIEF.stepcut({line, ..., head: {at: 'end' |
'start' | 'both', len, amph, wall}})`. Over the head's last `len` metres of line the outline narrows from the cut's half-width to the
bowl's radius (`amph` x the half-width: 1 a box-canyon bowl as wide as the cut, 0 the walls closing to a point), as a tapered
capsule whose distance is exact, so the treads and risers wrap round the bowl; the depth falls smoothly to `wall` x depth at the tip
(0 by default: the chasm dies out; .4 a sapped headwall over a spring line). `at()` adds `head` (the depth's share lost) in the taper.
A record without `head` is untouched: `test-landforms.js` holds a frozen digest of `shape` and `at` on six cuts, taken before the
change (`55247ac0`).

**`38d-core-landforms-net.js`** (loaded after `38c`; `node core/terrain/test-landforms-net.js`):

| Kind | What it draws | Parts (`at`) | Plans it serves |
|---|---|---|---|
| `grabenNet` | Grabens on several fault trends (three for the Labyrinth). Each trend's faults lie on parallel lines `spacing` apart, each line jittered, broken into segments with gaps and each segment staggered across (en echelon), some left uncut (`p`); a segment is a `stepcut` line with chasm heads at both ends, its id `<net>:<trend>:<line>,<segment>`, its numbers hashed from (world, trend, line, segment). `keep` trims the segments off masked ground (the dome). The record lists the cuts, the corridors (their lines and widths), the nodes (where two trends' cuts cross) and the bastions (the horst blocks no cut reaches, as outlines on a grid, each with its area and top). Its `shape` is the cuts' union: where cuts cross, the deeper floor, not the sum. | the deepest cut's part (stepcut's), plus `cut` (its id) | the Labyrinth's maze (§7, amendment 3); the Siphon Pits' graben stamps; the Loom-Chasms' horst-and-graben |
| `ripples` | Giant current ripples in a polygon (with a flow direction) or along a line (the flow runs along it): crests across the flow `wl` apart and `h` high, the stoss (upstream) face long and gentle, the lee short and steep; crests wander (`sinuous`) and fork, a crest inserted between two dislocations (the phase jumps exactly one wavelength across it, so there is no seam); height varies along a crest; mean-free (the floor keeps its volume); faded to nothing at the area's edge. | `crest`, `stoss`, `lee`, `trough`, with `t` (0..1 through a wavelength) and `fade` | Outland Gate's ripple benches (amendment 3; station 3's ripple bars); any scabland floor |

**Adopting them.**
- The head: add `head: {at: 'end', len: 1200, amph: .7, wall: .3}` to a `stepcut` line record; nothing else changes.
- The net: list `38d-core-landforms-net.js` after `38c-core-landforms.js` in `CORE_TERRAIN`, with core/rand on the page.
  `const N = KRELIEF.grabenNet({box, world, id: 'lab', trends: [{az, spacing, w, depth, len}, ...], keep: (x, z) => !inDome(x, z),
  ground})`, then `KRELIEF.apply(ground, [N, ...])` (or put `N.cuts` in one by one where they never cross). Hand `N.corridors` to
  `KSIGN.make`'s cost (cheap on a corridor's floor) and `N.bastions` to the flora and `KGLACIER` (the caps on the high blocks). A tile
  built alone has the very cuts the whole box has there; bastions are clipped at the box (`edge`).
- The ripples: the same file; `KRELIEF.ripples({poly, flow, wl: 100, h: 6, seed})` into `KRELIEF.apply` after the floor's own kinds;
  `KRELIEF.at(rec, x, z).part` for cover (gravel on the crests, fines in the troughs) and `KSTACKS` erratics.
- `KRELIEF.waters` lists nothing for either.

**Not done.** No Godot twin (as for the other relief kinds). The net's cuts are straight segments (a curved fault would be a line of
several points; the head already follows one). The bastions are found on a grid (`cell`, 25 m): a narrow neck of horst under a cell
reads as two bastions. The ripples' forks are fixed at record time over the area's bounds (a record is global, not per tile).
