# yuni-variants — notes

The paused item from the 2026-09-29 handover: the Yuni settlement runs a
patched fork of this kit (`settlements/yuni/tools/gen_ancients.py` patches a
kit slice; `tools/anc_kit_tail.js` adds builders and passes), and it grew
variants the kit never had. They are ported here as kit builders of their own,
in their own fragments, so the kit's originals are untouched.

```
python3 build.py --target yuni-variants && python3 jscheck.py .syntax-yuni-variants.js
python3 verify.py dist/yuni-variants.html --assert --views "Yuni variants,Terrace stack roofed — ruined"
```

## Files, seeds, keys

| builder | key | fragment | seed | budget class |
|---|---|---|---|---|
| `buildYvQuad` (the Cloisters) | `yvQuad` | `src/8am-yv-a-quad.js` | 9955+d | medium |
| `buildYvCombShort` (honeycomb block, short) | `yvComb` | `src/8am-yv-b-comb.js` | 9965+d | medium |
| `buildYvTerrace` (terrace stack, roofed) | `yvTerr` | `src/8am-yv-c-terrace.js` | 9975+d | medium |
| `buildYvDish` (the Ear, dish intact) | `yvDish` | `src/8am-yv-d-dish.js` | d>0?9988:9987 | small |
| `buildYvHospital4` (the Cloister, four towers) | `yvHosp` | `src/8am-yv-e-hosp.js` | d>0?9986:9985 | medium |

The allocation was 9950-9989, but Apartments, Amphitheater, Fuel and Radar
already claim 9950-54, 9960-64, 9970-74 and 9980-84 (`build.py` counts `N+d`
as N..N+4). That leaves four free `+d` blocks for five builders, so the dish
and the hospital take the two-seed form (decays 1 and 3 share a stream, as
the Lab's do). The noise seeds inside the builders (`holeFn`, `h3`, `fbm`) are
not PRNG seeds and do not collide with anything that matters.

Every builder is the kit contract: `build…(scene,gx,gz,d)`, opens with its
reseed, sets and resets `KOFF`, registers itself, uses only `MAT`/kit items
(new arch items go through `civDef`), and ends with `civFlatten(G)` (one draw
call per material).

**Shared-file edits (additive, one line each):** `build.py` TARGET_OUT gets
`yuni-variants`; `src/91-probe.js` gets one `Object.assign(BUDGET.type,…)` line
for the five keys. No kit rows were added: the coordinator gives them rows.

**The target.** Decays `[0,3,1,5]`: intact `-s`, repaired `0`, ruined `+s`,
worn `w = 2s`. Five presets per type (`— row`, `— intact`, `— ruined`,
`— worn`, `— night` on the repaired one) and an overview first.

## Worn decay: nothing to port

Checked first, as asked. Yuni's worn state is `WORN` (shell in
`MAT.whiteWorn`), `rustPass` and `weatherPass`, with planting only on the
tall towers. `src/69w-worn.js` already carries all of it (the same texture,
`wornRustPass`, `wornWeatherPass`, `WORN_PLANTS`), with Yuni's per-asset tint
folded into the material colour. What Yuni adds beyond it is host glue, not
kit: `repairPassY` (repairPass divided by the asset scale), the town dressing
(`ancDress`), the per-mode tints in its merge step, and the triangle diet
(halved segment counts, item thinning, the coarser cooling-tower weave,
5-segment window curves). None of that belongs in the kit. The five builders
here show worn at `w` through the scene loop's decay 5, unchanged.

Also not ported, being outside the list: the compact laboratory (`LABTIGHT`),
the short apron (`APRK`) and the great silo, which are Yuni footprint fixes.

## Per variant

Scene triangles per decay from `verify.py --assert` (error panel clean, every
invariant PASS; the whole target is 0.77 M triangles, 116 draw calls at the
worst camera).

| type | 0 intact | 1 ruined | 3 repaired | 5 worn |
|---|---|---|---|---|
| Quadrangle (the Cloisters) | 54 692 | 53 862 | 54 952 | 58 594 |
| Honeycomb block, short | 49 160 | 50 672 | 44 112 | 53 240 |
| Terrace stack, roofed | 32 512 | 39 292 | 38 472 | 34 644 |
| Dish intact (the Ear) | 8 572 | 10 518 | 13 866 | 11 268 |
| Hospital, four towers | 31 708 | 49 104 | 43 892 | 33 082 |

All far inside their class (small 60 k, medium 250 k).

### The Cloisters (`yvQuad`)
**In Yuni:** `buildQuad` in `anc_kit_tail.js`, written for Yuni: a closed
court 84 x 64 inside four terraced ranges (2, 4, 3, 3 storeys), a parabolic
cloister arcade on all four sides, a fluted lecture drum, two stair towers, a
12 m parabolic gate on the +z range. Its ruin was the intact quad with holes,
a broken stair tower and moss.
**What changed:** the ruin brings the middle of the four-storey back range
down to its ground storey (a gap that widens upward, ragged by storey); at
each cut the last bay stands open as a section (floor and ceiling bands,
facade walls torn short, a furnished room by `domRoom`, a torn floor plate
sagging into the gap), the arcade in front of it lies on its face in the
court, and a talus with roof slabs fills both sides. Dead windows keep glass
teeth (`civWin`). The ruined lecture drum has rooms behind its holes
(`civRooms`) round a dark hall. The gate now actually passes through the
range (storeys, roof and walk are cut at |x| < 6.2 and three arches vault the
passage); in Yuni the arch stood inside a solid block, its crown and the
column tops poking out of the roof. The stair towers' dark liner follows the
taper (Yuni's poked through the top as black notches).
**Weaknesses:** the ranges are boxes with windows on them, so the intact quad
has no interior except the glass gallery; the arch crown still rises above
the two-storey +z range (it reads as a gate, but it is not a tower); at night
the repaired quad shows few lights.

### Honeycomb block, short (`yvComb`)
**In Yuni:** `buildCombShort`: Apartments B's hexagonal lattice wrapped round
a 58 x 48 squircle, five storeys, a 5 m sandwich of two perforated skins
round a closed dark core under a cambered lid, an open colonnaded ground
storey. Yuni forced every cell, strip and dot dead.
**What changed:** intact, the lattice is glazed and the flats behind it are
furnished and lit (`domRoom` per bay, warm cells); ruined, teeth of glass are
left in about a quarter of the cells (`civShardAt`), and the south-east corner
has lost the outer skin, floors and roof ring of its top two storeys over a
talus, while the inner skin, the core and its lid stand (cutting the core too
opened an empty box). The storey heights now agree with the floors (Yuni's
cells and floors used two different storey heights).
**Weaknesses:** the bite is legible close up but modest from the row camera;
the glazing is one transparent band, so by day the intact block reads paler
than the lattice; the repaired state is the ruin re-patched, with the bite.

### Terrace stack, roofed (`yvTerr`)
**In Yuni:** Apartments A patched in place: each tray's terrace gets a lobed
parapet, a coping and a soffit, the gap up to the next tray is closed, and
the top tray is capped by a fluted lobed roof with a finial. The ruin was the
kit's: tray 6 gone, tray 7 and its new roof floating over the hole.
**What changed:** a builder of its own (the kit's Apartments A is untouched;
B and C are not part of this variant). The parapet stands at the deck's outer
edge (Yuni's stood 10% inside it). Every tray stands in the ruin; the ruin is
in the roof instead: the lid has caved in on the camera side, the slab under
it is bitten out, a broken inner lining shows, a shell of the lid lies on the
terrace below with its rubble, and the top tray's wall is open under it with
furnished rooms behind. Hedges along the parapets. Glass teeth and rooms
behind holes as in the kit's A.
**Weaknesses:** the stack still floats on its stem as the kit's A does; the
caved roof is the one big ruin event, so from far the ruined stack reads
close to the repaired one.

### Dish intact, the Ear (`yvDish`)
**In Yuni:** a flag (`DISHOK`) on the kit's own `buildDish`, used by the
"reclaimed, dish intact" asset (decay 1 at holes .45 with the repair pass):
the reflector, struts, feed and mount whole and aimed at the sky.
**What changed:** a builder of its own. Decay 1 is the abandoned ruin with
the dish whole (holes in the legs and the hut only, no fallen panel); decay 3
is Yuni's state proper, and the keepers show: a camp on the pad (`adReclaim`,
fires at night), a lamp on the feed and a cable down the tripod, a cable from
a leg to the hut, the hut lit inside. Ruined, the hut has a room behind its
holes. The bowl, struts and rim are whole at every decay.
**Weaknesses:** at decay 3 the bowl group is moved from the builder's group
to the scene (same place) so the scene's `repairPass` does not stand shacks
in the tilted bowl; it therefore costs two extra draw calls and is not
merged by `civFlatten`. Intact, it is the kit's intact dish.

### Hospital, four towers (`yvHosp`)
**In Yuni:** the kit's hospital patched: `gone=false` (four bed towers at
every decay; the kit drops one), podium 150 x 104 (not 170 x 110), the wards
at radius 23.5 pulled in to 20 m from the core (not 26 at 24), the canopy and
ambulance bays brought inside the plot.
**What changed:** a copy of the kit's current hospital (wards and beds behind
the podium ribbon, glass teeth, oval windows with shards, rooms behind the
holes) with Yuni's dimensions. All four towers stand in the ruin; the one
facing the row camera is torn off at two thirds (the kit's tear, moved to the
visible tower) and the rest are holed.
**Weaknesses:** being a copy, a later fix to `buildHospital` will not reach
it; the towers hover 8 m above the podium on the core, as in the kit.
