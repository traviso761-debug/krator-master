# kits/interiors/ — rooms and the furniture placer

**Status: working, verified.** A build registers rooms with `ROOM({...})` (the contract in
`SPEC.md`), and `furnishRoom(room, catalog)` fills each one with furniture, as data, in SPEC's
fixed order. The placer is a port of Yuni's interior planner (`settlements/yuni/src/64-interiors.js`,
`furnishGroup`), generalised from Yuni's door-aligned rectangles to any room polygon, and it
is engine-neutral: it needs no THREE, no DOM and no particular furniture registry. A small
adapter maps a build's furniture registry onto the four calls the placer needs; the one here,
`adapters/catalog-adapter.js`, maps the master catalog (`kits/catalog`).

`dist/interiors.html` is the demo: 23 sample rooms (9 room kinds, 7 cultures; rectangles,
L-shapes, trapezoids, a pentagon, rotated rooms, and a two-room house joined by an interior
door), each in a procedural shell, furnished from the master catalog, with the room-outline
debug view, the walk grid, the cut-away, the hover inspector and the polygon tool.

| Path | What |
|---|---|
| `src/10-49` | **the core**, engine-neutral: geometry, `ROOM()`, room programs, the occupancy grid, the placer, the plan audit, exports |
| `adapters/catalog-adapter.js` | the only file that knows `kits/catalog`: `list / dims / anchorY / build` |
| `src/50-59` | THREE views (no catalog): demo shells, the outline debug view, the cut-away |
| `src/70-98` | the demo page: sample rooms, hover inspector, page audit, polygon tool; `80-81` the vendored sky |
| `tests/core_test.js` | the core in node with a fake catalog (surface, ceiling, wall pieces, a rotated L room, fallback) |
| `dist/interiors-core.js` | built: the core alone, for another build to load by path or vendor |
| `dist/interiors.html` | built: the demo |

How to use it from another build: `API.md`. What is open: `KNOWN_ISSUES.md`.

## Build and verify

```
cd kits/interiors && python3 build.py                     # dist/interiors.html + dist/interiors-core.js, node --check, build-manifest.json
python3 build.py --vendor-check                           # src/80-sky-hash.js (kits/catalog), src/81-sky.js (settlements/iziz)
python3 verify.py dist/interiors.html --assert            # the gate; exit 0 = pass (about 15 s)
python3 verify.py dist/interiors.html --assert --seeds 8  # audit seeds 0..7 of every room
python3 verify.py dist/interiors.html --out shots         # overview, outline view, one close-up per kind, grid, each cut-away mode
python3 verify.py dist/interiors.html --out shots --rooms # a close-up of every room
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
| overlap | no two footprints overlap on one layer (floor, ceiling); a surface piece sits on its host |
| door | no footprint in a door's swing zone |
| clearance | no footprint in another piece's declared clearance (a seat drawn up to its table excepted) |
| reach | on a fresh occupancy grid, every door reaches every other door and every usable piece |
| required | every piece the room kind requires is placed, or reported `none-in-catalog` |
| determinism | furnishing a room twice gives identical placements; the whole sheet re-furnished at seed 0 after other seeds hashes the same |
| builds | every piece built, with a mesh and no NaN |

plus `tests/core_test.js`, and coverage (at least 20 rooms, the kinds hall bedroom kitchen
tavern workshop store shrine, 5+ cultures, rectangular and irregular rooms).

## The demo page

Pick a room from the toolbar for its report: what it required and placed, every culture
fallback, anything missing and why. Keys: **O** outline view (polygon, doors and their swing
arcs and keep-free zones, windows, footprints — orange required, white optional — and clearance
zones), **G** walk grid and the path from the door to every usable piece, **C** cycle the
cut-away (`cut` → `fade` → `roof` → `off`), **T** hover inspector (name, class, tags),
**P** polygon tool (click the ground; copy `[[x,z],...]`), **R** furnish every room with the
next seed, **F** walk. Click anything for the catalog's inspector (measure, isolate, variants).
