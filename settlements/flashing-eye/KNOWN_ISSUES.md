# settlements/flashing-eye: known issues and what is owed

## The ground

- **The vent is not on the scale model yet** (step F0, the scale-model session's queue). The page draws the crater from the
  layout (`FLASHING_EYE.ground`: a rampart and a bowl over the model's summit). When the vent record lands, re-cut `region/`
  and drop the bowl from the ground function, or keep it if the model's crater is coarser than the page wants.
- **The bench is cut as well as filled.** The region cut at 1:1 rises behind the Lip faster than the 2 km grid (about +10 m
  at the north wall and +7.5 m at the west wall), so the precinct is cut level with a 25 m bank behind its north and west
  walls. The banks are bare earth: a retaining face like the pads' would read better.
- **The face is one surface.** The band is a heightfield: its colonnade is a texture projected on the face, not columns. A
  `core/terrain` carve patch (overhangs, column relief) or `KSTACKS` columns would make it read as the plan's coulee front.
- **The far field.** The far ground is the region cut only (52 x 44 km): the Beacon, Erehwon and the Tears' camp are beyond
  it, so the sights past 2 km are `tools/sights.py`'s on the scale model, not the page's.

## The revamp (2026-11-23)

- **The Way of Shrines' spur is a heightfield arete**, its gendarmes hex columns (`90fi-bridges.js`); the stairs are cantilevered
  steps with no rail; the bridges are drawn, not walked (no `core/walk` registration yet) and not registered in core/tags.
- **The windows are still the Qiblai kit's** (Tibetan trapezoids in strict rows); the references' Chinese-style lattices and
  bracket sets are not drawn. The roofs' tiles are the library's grey barrel tiles tinted red, on a world-UV projection.
- **The blueprint's room plans** (sheets L, H, M1-MR) are the pre-revamp rooms with the revamp's notes; the towers have no
  floor plans of their own yet.

## The house

- **Sized ranges.** The bench's lesser buildings (granary, kitchen, refectory, bath, stores, chapter range, novices' court,
  Mirror School) are one generic record (`qb_fe_range`) sized to their layout boxes, not buildings of their own. The novices'
  court is drawn as a block, not round a yard.
- **No interiors yet.** The blueprint's rooms (sheets L, H, P, M1-MR) are not built as room data; the catalog's NEW pieces
  (`FURNITURE.md`) are not made.
- **The Foot House, the Rest House and the Stair of the Eye** are off the page's near ground (6.6 km south); the Stair is
  drawn only to the apron.
- **No people, no pilgrims, no Station's night** on the page: `FE_WATCH.state` has the kora flag and the rota; the page does
  not draw them.
- **The mirrors do not flash.** The day line is in `FE_WATCH` (slots, bearings, the code); the page draws no glint. The plan's
  question: a small effect on core/atmos's sun direction, asked before writing it as a module.

## The vent

- The plume is core/atmos's smoke with a page preset (`ATMOS.PRESETS.smoke.vent`, and the smoke's `distFade` and `pxMax`
  widened for this page); the ash plume record (`ATMOS.ashPlume`) is not yet read by the fog or the ground.
- The hazards are records only (`FE_HAZ`): the page does not take core/hazard's host.
- The bombs are CPU points (90 a burst); a burst's glow lights the bowl through one point light.
