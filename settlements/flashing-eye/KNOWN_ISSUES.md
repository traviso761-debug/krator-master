# settlements/flashing-eye: known issues and what is owed

## The ground

- **The vent is not on the scale model yet** (step F0, the scale-model session's queue). The page draws the crater from the
  layout (`FLASHING_EYE.ground`: a rampart and a bowl over the model's summit). When the vent record lands, re-cut `region/`
  and drop the bowl from the ground function, or keep it if the model's crater is coarser than the page wants.
- **The bench is cut as well as filled**, in three terraces. The region cut at 1:1 rises behind the Lip faster than the 2 km
  grid, so behind the north, west and east walls the cap is cut back in a bank. *Fixed 2026-11-23*: the banks are terraced with
  dry-stone walls along their contours every 1.5 m (`90fg-build.js`, about 150 pieces), open at the Gate of Breath and the Mule
  Gate; the ground itself is still a smooth slope under them.
- **The face is one surface.** The band is a heightfield: its colonnade is a texture projected on the face, not columns. A
  `core/terrain` carve patch (overhangs, column relief) or `KSTACKS` columns would make it read as the plan's coulee front.
- **The far field.** The far ground is the region cut only (52 x 44 km): the Beacon, Erehwon and the Tears' camp are beyond
  it, so the sights past 2 km are `tools/sights.py`'s on the scale model, not the page's.

## The revamp (2026-11-23)

- **The Way of Shrines' spur is a heightfield arete**, its gendarmes hex columns (`90fi-bridges.js`); the stairs are cantilevered
  steps with no rail. *Fixed 2026-11-23*: the whole way is registered in core/tags before it is drawn (the stacks as features, the
  bridges as infrastructure) and walkable on core/walk (the nose stair, each landing and top, each stair round a crown, each
  bridge's deck; `verify.py`'s `way-walk`). The walker does not yet sway with the bridges.
- **The windows are the Qiblai kit's** (Tibetan trapezoids in strict rows), kept by the owner's choice (2026-11-23). The roofs'
  tiles are the library's grey barrel tiles tinted red, on a world-UV projection.
- **The blueprint's room plans** of the Lip Range, the hall of the Ember and the temple (sheets L, H, M1-MR) are the pre-revamp
  rooms with the revamp's notes. *Fixed 2026-11-23*: the towers have their floor plans (sheet T: four floors each of the Mirror
  Tower, the Labrang Tower and the Ember Tower's shaft).

## The house

- **Sized ranges.** The bench's lesser buildings (granary, kitchen, refectory, bath, stores, chapter range, Mirror School) are
  one generic record (`qb_fe_range`) sized to their layout boxes. *Fixed 2026-11-23*: the novices' court is four ranges round
  its paved yard with a chorten in it (`qb_fe_court`).
- **No interiors yet.** The blueprint's rooms (sheets L, H, P, T, M1-MR) are not built as room data; the catalog's NEW pieces
  (`FURNITURE.md`) are not made.
- **The Foot House, the Rest House and the Stair of the Eye** are off the page's near ground (6.6 km south); the Stair is
  drawn only to the apron.
- **No people, no pilgrims, no Station's night** on the page: `FE_WATCH.state` has the kora flag and the rota; the page does
  not draw them.
- *Fixed 2026-11-23*: **the mirrors flash.** A glint at the Eye Post's and the Mirror Tower's lanterns whenever the day line's
  shutter is open (`FE_WATCH.state`: the Opening at sunrise, the station slots on the hour), on the page only (`90fh-vent.js`),
  not a core/atmos module; `_api.signal(k)` sets the clock into the k-th station's slot. The glint does not yet follow the sun's
  actual reflection angle (the plan's question about a core/atmos effect still stands).

## The vent

- The plume is core/atmos's smoke with a page preset (`ATMOS.PRESETS.smoke.vent`, and the smoke's `distFade` and `pxMax`
  widened for this page); the ash plume record (`ATMOS.ashPlume`) is not yet read by the fog or the ground.
- The hazards are records only (`FE_HAZ`): the page does not take core/hazard's host.
- The bombs are CPU points (90 a burst); a burst's glow lights the bowl through one point light.
