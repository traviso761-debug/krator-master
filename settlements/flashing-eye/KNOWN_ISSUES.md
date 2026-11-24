# settlements/flashing-eye: known issues and what is owed

## The ground

- **The vent is not on the scale model yet** (step F0, the scale-model session's queue). The page draws the crater from the
  layout (`FLASHING_EYE.ground`: a rampart and a bowl over the model's summit). When the vent record lands, re-cut `region/`
  and drop the bowl from the ground function, or keep it if the model's crater is coarser than the page wants.
- **The bench is cut as well as filled**, in three terraces. The region cut at 1:1 rises behind the Lip faster than the 2 km
  grid, so behind the north, west and east walls the cap is cut back in a bank. *Fixed 2026-11-23*: the banks are terraced with
  dry-stone walls along their contours every 1.5 m (`90fg-build.js`, about 150 pieces), open at the Gate of Breath and the Mule
  Gate; the ground itself is still a smooth slope under them. Stepping it (flats and 1.5 m risers at the walls) is a change to
  `terrainH` the near ground mesh cannot show: its cells are 4 m, so a riser shorter than a cell smears back into a slope. It
  waits on a finer mesh over the banks (or the banks as their own patch).
- **The face.** The band is a heightfield wearing the colonnade's texture. *Fixed 2026-11-23*: the columns themselves stand in
  relief on it (`90fj-face.js`: about 280 hexagonal columns in jointed drums along the face's lean and the Lip's curve, some snapped
  below the top; 69k triangles). Still no overhangs: a `core/terrain` carve patch would give them (`CORE_TERRAIN`, 36-core-carve:
  opt-in, with its own test; not started). *Fixed 2026-11-23*: the spur's flanks no longer take the columnar map stretched: the
  ground shader blends its x and z projections by the face's normal (triplanar on the sides).
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
  Shrines. *Fixed 2026-11-23*: the four corner towers (the precinct's walls ran on to each tower's centre; they stop at its faces
  now, 89zfe, and each tower's watch room and loft are entered by an open doorway from the bench): 47 buildings, 181 rooms, about
  1,600 pieces. *Fixed 2026-11-23*: the Rest House (its hall and tea kitchen, its dormitory and the keeper's room; see below).
  Still owed: the Watchers' Chapel on the Assembly Hall's roof (sheet MR).
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
    the hall (214 m2) and its gallery, one in the belvedere beside its stairwell). *Fixed 2026-11-23* for the other big halls:
    the Mirror Hall's benches (31 rows), the guest hall's and the three refectories' tables with a bench either side (`unit:
    'table'`; a hall 6 m across takes one file down its middle), the audience hall's cushions and the Hall of the Ember's
    benches: 127 rows in nine buildings. Every other room is still its programme's few pieces; the fix that reaches every
    page is a size-scaled cap in kits/interiors.
  - No electric light (`prog.bulbs` false) and no light of their own: the catalog's lamps and butter lamps glow (their flames are
    lit materials) but cast no light into the rooms at night; a light per lamp would be some hundreds of lights.
- *Fixed 2026-11-23*: **the Foot House** stands on its own ground at the spur's foot (`FE_FOOT`, 1.2 x 0.8 km at 8 m, the far
  ground cut away under it): its ranges round the loading court and its gate chorten. Still owed: the Foot House's lower terraces
  and mule yard, and the west and east roads south of its gate.
- *Fixed 2026-11-23*: **the Stair of the Eye and the Rest House.** The Stair is layout data (`src/30-fe-layout.js` `stair`: switchbacks
  on the spur's broad crest, 160 m either side of it, every 20 m of each leg at 9 % or less on the crest's surface: a table of the
  page's ground sampled every 200 m down the spur and 100 m across it, each row fitted to a level and a cross-slope, the levels
  eased; about 14 km in 39 legs), with its rule (`src/31-fe-rules.js`: 9-16 km, uncrossed, on the crest, turning at the Rest House's
  gate at 1,040-1,120 m, its corners on the surface, every 20 m of it at 10 % or less) and six negatives in `test-flashing-eye.js`.
  The page smooths the crest under it to that surface (`FLASHING_EYE.stairGround`: 200 m either side of the crest from the apron to
  the Foot House, faded out over 80 m; it moves the ground by up to 15 m, the model's hundred-metre bumps, which would otherwise put
  stretches of 30-70 % in the road). The page draws it on its own ground
  (`FE_STAIRG`, 10 m cells from the coarse box to the Foot House's, holed out of the far ground; `targets/cone/90fl-stair.js`): its
  corners rounded into hairpins of 7 m, a cobbled deck 3.5 m wide laid 0.15 m over the drawn ground (the highest of terrainH and
  KDRAWN across it) and eased along it, dry-stone revetments down both edges, a kerb on the downhill edge, a ramp from the deck to
  each house's gate; every leg in core/tags before it is drawn, the deck in core/walk (a strip every 4 m). The Rest House
  (`qb_fe_rest`, seed 34501: a walled yard with its gateway to the road's hairpin, the house across the back, the mules' shed and
  trough, a chorten, the cistern's head) stands on its pad on its own ground (`FE_REST`, 4 m cells) at about 1,085 m; its rooms are
  `src/32-fe-rooms.js`'s, planned, furnished and walked in by `90fk` like the others. Way chortens (twelve) stand outside every third
  hairpin. `verify.py`'s `stair`, `stair-ground` and `rest-house`.
  - *Fixed on the way*: **the band's cut ran on down the spur.** `FLASHING_EYE.ground` lowered the ground in front of the Lip by the
    band's height and the apron's slow fall wherever the band's ends had not tapered (|v| under 750 m), as far as the Foot House: a
    trench 200 to 450 m deep either side of the crest, hidden only because the far ground (400 m cells) read the model, not the
    ground (the Foot House's own ground showed it). The cut now fades back into the model between 600 and 1,200 m from the Lip
    (`band.merge`; the test's "the band's cut fades into the model down the spur" and its negative).
  - The deck is the least height over the drawn ground whose grade nowhere passes 10 %: round each hairpin (whose apex runs down
    the fall line) it is built up on its revetments by a metre or two rather than cut in, and the ground is never cut for it
    (`verify.py` fails any 20 m over 12 %). No steps are drawn.
  - The crest's smoothing is a ruled surface between rows 200 m apart: it reads as long even slopes, not the model's broken ground.
  - The spur's ground carries no flora: the biome's mask stops at the coarse box (the Foot House's ground has none either).
  - The walls of the Rest House's yard are not walls to core/walk (the walker can step through them); its gateway is open, no leaf.
- *Fixed 2026-11-23*: **the people, the pilgrims and the Station's night.** `src/41-fe-people.js` (`FE_PEOPLE`, `[G data]`,
  `test-people.js` 16 checks) places the census (320: the chapter, the Prismarch's household, the school, the novices, the lay
  brothers, the Foot House) and the day's pilgrims (20-40; 420-500 on a Station's day) as pure functions of the clock on
  `FE_WATCH`: the offices and the meals, the readers on the Mirror Hall's balcony at the line's slots, the Rift Watch there in
  turns by day and night (the Master of the Rift's office, the owner's lore of 2026-11-23: it keeps its post on a Station's night;
  its watchers at the Readers' Gallery's windows and in the Lip's two towers are indoors, so not drawn), debates in the Monastery
  Court, the novices' lessons in their yard, the lay brothers on the cap, the mule train, the Rim Watch at the Eye Post on its
  rota (the platform in the line's and the basket's slots, the rim walked by day, the hut), the pilgrims up the Way of Shrines,
  three times round the lower kora and up the Way of Breath to the Threshold Chorten and no further; on a Station's night
  (one in eight, *proposed*: `FE_ENV.station`, so `FE_WATCH.state`'s kora flag is on) the professed walk the rim three times in
  procession, eight novices keep the vigil at the chorten, the pilgrims fill the Pilgrims' Court and the chorten's ring.
  `targets/cone/90fl-fe-people.js` draws them from core/charactermodels (twelve looks baked by `KCharCrowd`: standing, four
  frames of the walk, sitting), each resident in core/tags, the pilgrims as a set; `verify.py`'s `people-*`. The lower kora
  crossed both terraces' faces and the Stair of the Ember's flight with no way down: it has four stairs of its own now (parts
  44-47, in core/walk with the axis's two) and its north leg runs on the upper terrace before the Ember.
  Still owed:
  - The figures are the crowd's still bakes, near and far: no near figures animated in full (Longsong's `KCharFigure` slots),
    no faces of their own, one record per look; the walk is four frames. The pilgrims' eyes are not lowered (no head pitch).
  - The Order's robes are the Historians' (Longsong) dyed crimson; the novices' shirt and skirt ochre and crimson. A robe of the
    Order's own (and the veil of dread on the rim) wants a garment in `core/charactermodels` (`prompt-clothes.md`). The women of
    the Xanadu dress go bareheaded: `xan_f_town_cap` has no built piece (the sidecars come from Longsong's `dist/kchar`, built
    pieces are not in Git; `core/charactermodels/tools/kchar_page.py`).
  - Indoors they are hidden: no one sits in the Assembly Hall's rows at the offices or at the refectory's tables.
  - The day is the clock's alone: no `core/simulation` actors (the page does not take the sim); the Station's nights are FE_PEOPLE's
    rule, not the sky model's Station (`core/atmos` sky: not on this page).
  - Only the Foot House's own day is drawn there; the Stair of the Eye and the Rest House are walked by the mule train over the
    model's ground (the Stair is not drawn: see the house, above).
- *Fixed 2026-11-23*: **the mirrors flash.** A glint at the Eye Post's and the Mirror Tower's lanterns whenever the day line's
  shutter is open (`FE_WATCH.state`: the Opening at sunrise, the station slots on the hour), on the page only (`90fh-vent.js`),
  not a core/atmos module; `_api.signal(k)` sets the clock into the k-th station's slot. *Fixed 2026-11-23*: the flash is aimed:
  the sun is thrown along the line to the station the mirror sends to (`FE_WATCH.state`'s bearing), so a viewer within a few
  degrees of that line sees the full flash (`feBeam`: a half at 5 degrees) and anyone else only the mirror's face catching the
  light (`verify.py`'s `glints` checks it on the line, 20 degrees off and behind). The beam is horizontal: the stations lie
  60 to 210 km off and a few hundred metres lower, under half a degree down, inside the beam's spread, so no tilt is drawn. The
  sun's own place is not used (the second mirror turns it when it stands behind), and it is the page's sprite, not a core/atmos
  effect: the plan's question about one is the owner's.

## The vent

- The plume is core/atmos's smoke with a page preset (`ATMOS.PRESETS.smoke.vent`, and the smoke's `distFade` and `pxMax`
  widened for this page); *fixed 2026-11-23* for the ground: the ash plume record's fall (`ATMOS.ashPlume`'s `under`) is baked
  into the three near ground meshes and the ground's shader lays the ash set by it (`verify.py`'s `ash-fall`: downwind, none on
  the bench). Its deposit peaks about 6 km downwind, past the near ground, so only its edge falls on the cone (shown six times
  over); the far ground (400 m cells) does not read it. *Fixed 2026-11-23* for the fog: the page's fog thickens by the plume
  record's density where the camera stands (about 250 m of sight in a column's core) and greys toward the ash (`feFogAt`;
  `verify.py`'s `plume-fog`).
- *Fixed 2026-11-23*: **the hazards are on core/hazard** (`20-core-hazard.js` and its clock `37-core-traps.js` through
  kit.json): the vent's lava, its gas, the bombs' reach and the floor's heat are core/tags records carrying `tags.hazard`, so
  `KHAZ.at` and `KTAGS.hazardAt` answer what hurts a walker here and now; the lava, the gas and the bombs run on the vent's own
  bursts (`KHAZ.STATES['FE_WATCH.vent']`), the heat is steady (`verify.py`'s `hazards`). core/hazard has no ring shape, so the
  bombs' record is the whole crater out past the rim; the page draws no overlay for them (the Xanadu host has no hazard layer).
- The bombs are CPU points (90 a burst); a burst's glow lights the bowl through one point light.
