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

## `slab`: a tilted slab's cliff of spurs and gullies (`38d-core-slab.js`, 2026-11-12)

The leading edge of a thrust-tilted block (`biomes/slabfields/PLAN.md` sections 3.4 and 15, item 5). `KRELIEF.scarp` draws one
smoothstep profile along its line, so a long face reads as a few broad panels (the owner on the Slabfields' first station). `slab`
draws a **row of spurs**, each with its own run, power, height, projection and fall of its top to its nose. Between them the face
recedes into **gullies** whose heads cut back into the plateau, with **scree cones** at their mouths. Along the face run **ledges**
(five by default) where hard flows stand out: their heights wander along the strike and they fade in and out, back-tilting a little
where strongest. The odd fresh **scar** sets the face back and steepens it. The crest is ragged, the face rough and fluted, and behind the
rim the slab's **ramp** falls at its dip. The profile drops steeply from the rim (`(1 - t)^power`, the lip eased over 3% of the run)
and eases into the foot.

Its own file, not part of `38c`, so no page that takes `38c` moves. It composes onto `KRELIEF` as `38c` does, with or without it.
`KRELIEF.slabProfile(rec, s, n)` gives the height over the ground across the face at arc length `s` (no noise), for the model's
side. Test: `node core/terrain/test-slab.js` (every check with a negative: the spurs differ, a spur stands out past a gully, gullies
notch the crest, the ramp's fall, the floor exactly untouched, the cones, the ledges, a scar, every part, continuity, the inputs).
**Godot:** `KRELIEF.slabExport(rec)` gives the record as plain JSON (`format: 'krator-slab'`); `kslab.gd` (`class_name KSlab`) samples it
with the same arithmetic (`shape`, `at`), held to `golden-slab.json` (`test-slab.js --write`) by `kslab_test.gd` within 1e-6 m (it reads 1e-12 on
Godot 4.7.2); copies in `godot/tests/terrain/`.

| Kind | What it draws | Parts (`at`) | Plans it serves |
|---|---|---|---|
| `slab` | A cliff of spurs and gullies along a rim, cones at the gullies' mouths, wandering ledges, scars, a ramp behind | `plateau`, `spur`, `face`, `ledge`, `gully`, `scar`, `cone`, `skirt` (and `fresh`: a scar's weight) | the Slabfields (station 1, the Anvil); any tilted block or basalt escarpment |
