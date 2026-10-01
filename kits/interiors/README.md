# kits/interiors/ — buildings, rooms, furniture and the people who use them

**Status: working, verified.** Four engine-neutral layers, each usable without the next:

1. **Plan** a building: `IX.planBuilding(shell, program)` finds the rooms inside a footprint, storey by
   storey (a port of Yuni's planner, `settlements/yuni/src/64-interiors.js`): partitions, a door in
   each, stairs between storeys, windows, a walk graph. Or register rooms yourself with `ROOM()`.
2. **Furnish** each room: `furnishRoom(room, catalog)` fills it with furniture, as data, in SPEC's
   fixed order (a port of Yuni's `furnishGroup`, generalised to any polygon), keeping every door,
   stair landing and usable piece connected on a 0.1 m walk grid; greedy, then bounded
   backtracking when a required piece does not fit.
3. **Light** it by data: the pieces' lights (lamps, braziers, hearths) come back in `plan.lights`;
   the catalog adapter strips the real ones, so a host lights rooms within its own budget.
4. **Walk** it: `IX.life` routes agents from the street, through doors and up stairs, to a seat,
   bed or workbench, and back out, deterministic in time.

It needs no THREE, no DOM and no particular furniture registry. A small adapter maps a build's
furniture registry onto the calls the placer needs; the one here, `adapters/catalog-adapter.js`,
maps the master catalog (`kits/catalog`).

`dist/interiors.html` is the demo: 21 single rooms (9 room kinds, 7 cultures; rectangles,
L-shapes, trapezoids, a pentagon, rotated rooms), each in a procedural shell, and a row of 4
**planned buildings** (a two-room house, a two-storey town house, an L-shaped inn, a three-storey
rotated tower: 16 rooms, gable and hip roofs) furnished end to end, with 16 walkers, a 6-light
pool, the room-outline debug view, the walk grid, the cut-away with a storey selector, the hover
inspector and the polygon tool.

| Path | What |
|---|---|
| `src/10-49` | **the core**, engine-neutral: geometry, `ROOM()`, room and building programmes, the walk grid, the placer, the planner (`46`), the life layer (`47`), the audits, exports |
| `adapters/catalog-adapter.js` | the only file that knows `kits/catalog`: `list / dims / anchorY / build / lights` |
| `src/50-59` | THREE views (no catalog): room shells, planned-building shells (`51`), the outline debug view, the cut-away and storey selector (`55`), walker figures (`57`) |
| `src/70-98` | the demo page: sample rooms and buildings, light pool, hover inspector, page audit, polygon tool; `80-81` the vendored sky |
| `tests/core_test.js` | the core in node with a fake catalog: surface, ceiling and wall pieces, a rotated L room, fallback, both grids, the door arc, backtracking, three planned buildings, walkers |
| `dist/interiors-core.js` | built: the core alone, for another build to load by path or vendor |
| `dist/interiors.html` | built: the demo |

How to use it from another build: `API.md`. What is open: `KNOWN_ISSUES.md`.

## Build and verify

```
cd kits/interiors && python3 build.py                     # dist/interiors.html + dist/interiors-core.js, node --check, build-manifest.json
python3 build.py --vendor-check                           # src/80-sky-hash.js (kits/catalog), src/81-sky.js (settlements/iziz)
python3 verify.py dist/interiors.html --assert            # the gate; exit 0 = pass (about 25 s)
python3 verify.py dist/interiors.html --assert --seeds 8  # audit seeds 0..7 of every room
python3 verify.py dist/interiors.html --out shots         # overview, outlines, a close-up per kind, grid, cut-away modes,
                                                          #   the buildings (roofs; storeys 0, 1, 2), walkers
python3 verify.py dist/interiors.html --out shots --rooms # a close-up of every room
python3 verify.py dist/interiors.html --query lights=keep --assert   # the catalog's real lights instead of the pool
node tests/core_test.js dist/interiors-core.js            # the core alone
```

The page loads three.js, the catalog engine, the furniture registry and the click inspector
**by path** from `../../catalog/` (as `settlements/voth/catalog/index.html` does), so open it
from the repo (or serve `kits/`), not as a lone file. `verify.py` serves `kits/` itself.

`verify.py --assert` checks, for every room, at seeds 0, 1 and 2 (`--seeds`):

| Check | What |
|---|---|
| inside / measured-inside | every footprint inside the room polygon; the built geometry's box (vertices taken into the piece's frame) too, within max(6 cm, 4 %) |
| height / measured-height | y from the floor, top under the ceiling; declared and built |
| overlap | no two footprints overlap on one layer (floor, ceiling), nor a stair's flight or well; a surface piece sits on its host |
| door | no footprint in a door's swing (the leaf's quarter disc and a threshold band) |
| clearance | no footprint in another piece's or a stair's declared clearance (a seat drawn up to its table excepted) |
| reach | on a fresh walk grid, every way in (doors, stair landings) reaches every other and every usable piece |
| required | every piece the room kind requires is placed, or reported `none-in-catalog` |
| determinism | furnishing a room twice gives identical placements; the whole sheet (plans, buildings, walker poses) re-made at seed 0 after other seeds hashes the same |
| builds | every piece built, with a mesh and no NaN |
| building | every planned building: rooms inside the footprint and apart, interior doors in both rooms, stairs joining storey k to k + 1, every room reachable from the street on the walk graph and walked to on the grids |
| plan-determinism | planning every building again gives the same JSON |
| walkers | every walker routes from the street, reaches its target's use zone, dwells, never crosses a blocked cell; made again, it stands in the same place at the same time |
| lights | at most the pool's point lights in the scene (the catalog's are stripped and carried as data) |

plus `tests/core_test.js`, and coverage (at least 20 rooms, the kinds hall bedroom kitchen
tavern workshop store shrine, 5+ cultures, rectangular and irregular rooms, 3+ planned
buildings with a multi-storey one and a stair, 6+ walkers with one climbing a stair).

## The demo page

Pick a room from the toolbar for its report: what it required and placed, every culture
fallback, anything missing and why, its fixtures, its lights, how long it took. Keys: **O**
outline view (polygon, doors with their swing arcs and keep-free zones, windows, stair fixtures,
footprints — orange required, white optional — and clearance zones), **G** walk grid and the
path from the door to every usable piece, **C** cycle the cut-away (`cut` → `fade` → `roof` →
`off`), **L** cycle the storey shown (all → 0 → 1 → 2), **V** walkers on/off, **T** hover
inspector (name, class, tags; buildings and walkers too), **P** polygon tool (click the ground;
copy `[[x,z],...]`), **R** furnish every room with the next seed, **F** walk. Click anything for
the catalog's inspector (measure, isolate, variants). `?lights=keep` keeps the catalog's lights.
