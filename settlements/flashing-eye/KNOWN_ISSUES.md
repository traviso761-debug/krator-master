# settlements/flashing-eye: known issues and what is owed

## The ground

- **The vent is not on the scale model yet** (step F0, the scale-model session's queue). The page draws the crater from the
  layout (`FLASHING_EYE.ground`: a rampart and a bowl over the model's summit). When the vent record lands, re-cut `region/`
  and drop the bowl from the ground function, or keep it if the model's crater is coarser than the page wants.
- **The bench is cut as well as filled**, in three terraces. The region cut at 1:1 rises behind the Lip faster than the 2 km
  grid, so behind the north, west and east walls the cap is cut back in a bank. *Fixed 2026-11-23*: the banks are terraced with
  dry-stone walls along their contours every 1.5 m (`90fg-build.js`, about 150 pieces), open at the Gate of Breath and the Mule
  Gate; the ground itself is still a smooth slope under them.
- **The face.** The band is a heightfield wearing the colonnade's texture. *Fixed 2026-11-23*: the columns themselves stand in
  relief on it (`90fj-face.js`: about 280 hexagonal columns in jointed drums along the face's lean and the Lip's curve, some snapped
  below the top; 69k triangles). Still no overhangs: a `core/terrain` carve patch would give them. The spur's flanks that face east
  or west take the columnar map stretched along the slope (the ground shader projects it on x or z, not triplanar).
- **The far field.** The far ground is the region cut only (52 x 44 km): the Beacon, Erehwon and the Tears' camp are beyond
  it, so the sights past 2 km are `tools/sights.py`'s on the scale model, not the page's.

## The revamp (2026-11-23)

- **The Way of Shrines' spur is a heightfield arete**, its gendarmes hex columns (`90fi-bridges.js`); the stairs are cantilevered
  steps; *fixed 2026-11-23*, a hand rope on posts along the open side of every stair (both sides of the nose stair). *Fixed 2026-11-23*: the whole way is registered in core/tags before it is drawn (the stacks as features, the
  bridges as infrastructure) and walkable on core/walk (the nose stair, each landing and top, each stair round a crown, each
  bridge's deck; `verify.py`'s `way-walk`). The walker does not yet sway with the bridges.
- **The windows are the Qiblai kit's** (Tibetan trapezoids in strict rows), kept by the owner's choice (2026-11-23). The roofs'
  tiles are the library's grey barrel tiles tinted red, on a world-UV projection.
- **The blueprint's room plans** of the Lip Range, the hall of the Ember and the temple (sheets L, H, M1-MR) are the pre-revamp
  rooms with the revamp's notes. *Fixed 2026-11-23*: the towers have their floor plans (sheet T: four floors each of the Mirror
  Tower, the Labrang Tower and the Ember Tower's shaft).

## The house

- **Sized ranges.** The bench's lesser buildings (granary, kitchen, refectory, bath, stores, chapter range, Mirror School) are
  one generic record (`qb_fe_range`) sized to their layout boxes. *Fixed 2026-11-23*: each shows what it is for (the kitchen's two
  chimneys smoking, the granary's louvred roof vents, the bath house's steam lantern, the chapter range's wooden gallery, the Mirror
  School's trial mirrors); the smoke is core/atmos's chimney and steam kinds. *Fixed 2026-11-23*: the novices' court is four ranges round
  its paved yard with a chorten in it (`qb_fe_court`).
- *Fixed 2026-11-23*: **the first interiors and the catalog's pieces.** The eleven pieces `FURNITURE.md` marked NEW are in
  `kits/catalog/krator-master-furniture-xanadu.js` (the seven of this house; the signal lectern, the hour drum, the reader's seat and
  the 30 cm signal mirror as the Beacon's B8 made them). The Lip Range's four houses (four floors each), the Hall of the Ember, the
  Ember Tower's shaft and the Eye Post are planned, drawn and furnished at load (`src/32-fe-rooms.js` the programmes,
  `targets/cone/90fk-fe-interiors.js` on kits/qiblai's `qnIxType`): 7 buildings, 45 rooms, about 380 pieces, 2 s; every piece
  in core/tags, every floor and stair in core/walk, the doors unlocked (`verify.py`'s `interiors-furnished`, `interiors-walk-in`).
  *Fixed 2026-11-23*, on the same data: **the Red Monastery** (sheets M1-M2: the Gate of the Open Eye, its two front ranges, the
  side ranges and the back range round the Court of the Drum, the Assembly Hall with the Shrine of the Eye), **the Mirror Tower
  and the Labrang Tower** (sheet T), the bench's ranges (sheets E1-E2: the granary, the infirmary, the Great Kitchen, the
  refectory, the bath house, the wood store, the chapter range), **the Mirror School** (the mirror bench in its workshop), the
  novices' court, the Halfway Shelter and **the Foot House** (sheet F): 33 buildings, 154 rooms, about 1,440 pieces. The seven
  with views (sheets L, H, P) are built at load (2 s); the other 26 as the camera comes within 90 m of them, one every six frames
  (about 3.8 s in all; `FE_IX.buildAll()` builds them for the checks). *Fixed 2026-11-23*: the three gatehouses (their passages;
  the Porters' loft over the Mule Gate, the Veil Room over the Gate of Breath), the Watch's hut and the six shrines of the Way of
  Shrines: 43 buildings, 169 rooms, about 1,540 pieces. Still owed: **the four corner towers** (the precinct's walls run on to
  each tower's centre, so a room planned in one would be cut by two walls: the walls should stop at the towers' faces first), the
  Watchers' Chapel on the Assembly Hall's roof (sheet MR), and the Rest House (not drawn yet).
- **The interiors' compromises** (2026-11-23):
  - The rooms are kits/interiors' planner's, not the sheets' drawn plans: each storey is cut into the programme's room kinds by
    area, the first kind at the door, so the order of the rooms along the range is the planner's; the sheets' stair rooms are the
    planner's stairs. The furniture is the room kinds' (`kits/interiors/src/30-programs.js`), lighter than the manifest's counts.
  - The planner's street door is always on the lowest storey, so each Lip Range house's is a shut plank door into the rock at the
    back of L-2; the ways in are the record's two doors on L0 (from the bench, out onto the balcony), kits/qiblai's new
    `prog.doors`. The balcony is a core/walk floor; *fixed 2026-11-23*, its parapet is a wall to the walker (60 blocks of 2 m).
  - The Ember's sanctum is in the tower's back 4.5 m (the hall's body and its roof fill the tower's front half), entered by its own
    door on the tower's east face, not from the hall; its five storeys are 4.5 x 11 m (the sanctum about 40 m2, the sheet's 60).
    Its stairs are steep ladder-stairs (`prog.stair`), as are the Eye Post's.
  - The Eye Post's three storeys are its shaft's three lifts (the record draws it in three since 2026-11-23, so no lift's underside
    is a false ceiling in a room), planned inside the top lift (6.8 m): about 38 m2 a floor, not the sheet's 48; the Book of Breaths takes its whole storey (its signal store is not planned). *Fixed 2026-11-23*: an iron ladder climbs from
    the Mirror Room to the platform through a hatch (placed against a wall the room's pieces leave clear; in core/walk as rungs and
    the lantern's floor, so the walk-in check climbs it); the hatch is drawn shut on both sides and the walker passes it. The
    heliograph and the fire basket stand on the platform, the fire basket round the record's coals (`feFireB`, lit by the hour).
  - Kits/interiors offers a building's catalog once for all its rooms, so a piece kept alone of its type is so in every room of
    that building: every Xanadu desk in the Mirror Hall's house and the Labrang is the signal lectern, every reading desk in the
    Book House the Book's lectern (its studies take another culture's desk).
  - The court ranges (the novices', the Foot House's, the Red Monastery's) are entered by open doorways from their courts that the
    records did not draw (a doorway's jambs, threshold and portal, no leaf); the monastery's gate tower has an open doorway to the
    court the same way. The Assembly Hall is two planned storeys (the hall and the Masters' Gallery over it), not a double-height
    hall with a gallery round it. A big room is furnished thinly: kits/interiors' `gallery` and `hall` kinds stop at about nine
    pieces whatever the room's size. *Fixed 2026-11-23* for the halls of monks: the Assembly Hall and its gallery, and the Ember
    Tower's belvedere, have their rows of seats laid after the room is furnished (FE_ROOMS `rows`: the catalog's rows of
    meditation cushions with an aisle down the middle, facing the shrine, clear of every piece, fixture and door; 20 rows in
    the hall (214 m2) and its gallery, one in the belvedere beside its stairwell). The other big rooms (the Lip Range's halls, the refectories, the
    guest hall) are still the programmes' few pieces; the fix that reaches every page is a size-scaled cap in kits/interiors.
  - No electric light (`prog.bulbs` false) and no light of their own: the catalog's lamps are not lit at night yet.
- *Fixed 2026-11-23*: **the Foot House** stands on its own ground at the spur's foot (`FE_FOOT`, 1.2 x 0.8 km at 8 m, the far
  ground cut away under it): its ranges round the loading court and its gate chorten. Still owed: **the Rest House** (about 1,080 m
  on the Stair) and **the Stair of the Eye** between them, drawn only to the apron; the Foot House's lower terraces and mule yard.
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
