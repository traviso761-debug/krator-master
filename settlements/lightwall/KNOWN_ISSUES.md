# settlements/lightwall: known issues

## Done (2026-11-16, PLAN.md steps L2 and L3)

- The town's own page on Xanadu's (`build.py`, `kit.json`, `targets/town/`, `verify.py`): the bench town on core/city
  (frontage-courts with the Xanadu kit), the Glaziers' wall from the Tungang kit's `gz-*` set (the central quarter carved
  from the void plans with KCAVERN, the outer wall as fronts on whole rock), the lake, the north wall, the flora.
- The owner's answers of 2026-11-16 in `PLAN.md` (the writ, the footprint, this pass), its page design (section 8) and its
  Core adoption (section 9).

## Done (2026-11-16, the owner: "textures and the wall's look")

- **The Glaziers' fronts textured**: the Tungang kit's library pack (whitewash, hewn basalt, gilt, carpet, celadon, enamel,
  potch, carved timber, silk...) beside the page in `dist/lightwall.tex.tungang.js` (7.7 MB; `tungang_bundle.bundle(side=...)`,
  `tools/textures/matlib_pack.py write_sidecar`), so the page stays under the 16 MB cap (15.4 MB). Publish the file with the page.
- **The scarp's rock textured**: the bands, the carved quarter and the north wall take the library's `rock.rock_face` (Xanadu's own
  `xRock`, no new pack) through core/terrain's ground shader (`KGROUND.hook`: hex tiling, the distance scale, triplanar on the steep),
  tinted per vertex by the north fault's beds (`lwStrata`: basalt, rhyolite, tuff, warped by core/rand's value noise).
- **The bands' faces are rock**: between the fronts each band's face is a displaced grid (0.25 m out to 0.85 m in, flat behind every
  front, a worn lip at the ledge) in place of a slab; the north wall's mesh faces up (it was culled); the wall's foot is scree.

## Done (2026-11-16, the owner: "the html, the open issues, L4"; "more plants or fields"; the Iridescent Order)

- **L4, the interiors** (PLAN.md 6): the bench's houses within 260 m of the Stair Foot are built with the Xanadu kit's interiors
  (hollow walls, planned and furnished rooms, their floors in core/walk; `?interiors=0` turns them off): 61 houses, 552 rooms,
  about 4,900 pieces. The carved homes' rooms are walked: the front's floor from the walked draw (`TG.gz.draw(..., {walk:true})`),
  the doorway, the cavern's floor; every one of the 109 carved homes is reached from its front room. The kit's passages now
  reach the cavern's inset floor (`gzPass`), and the curtain and the wall lamps no longer block a walker.
- **The blocks' open ground is gardens** (the owner: "a lot of empty space between the buildings"): every built block's ground
  not under a building or a street is a 12 m plot, a kitchen garden in beds, an orchard or a yard (core/rand by its cell), the
  dooryards made ground; the canvas paints them and the flora mask plants the orchards and yards (`lwPlot`, `bench-ground`).
- **The Iridescent Order**: the house of the Teal great monastery of Qiblai on the eastern spur is the Qiblai kit's
  `qb_monastery` in the Turquoise spoke's dress, named as the Order's (PLAN.md, answer 8).
- **The bands' ends are buttresses** sloping to the foot, not square-cut; the rock's far tiling is broken up (KGROUND's far
  levels); the carved quarter is 230 m each side (131 carved sites, about 8 s to mesh, was 174 and 11 s).
- **The bench's ground no longer runs through the carved rooms**: behind the wall line, across the carved quarter, the ramp
  under the bands is held a metre under the floor of every band whose rooms run over it; the top band's block is deeper and
  lidded behind its carved sites so no trench opens above it.
- **Podiums and steps on the slopes** (the owner: "buildings on slopes need podiums / stairs / walk test"): the frontage houses'
  footings were never drawn (core/city hands a lot its footing's depth as a number; the page read only the landmarks' `{lo}`),
  so they stood on their own plinths in the air. Every building now stands on a podium of dressed stone, its whole plot, down
  to its lowest ground, with a coping; where the street is lower than the floor, a flight of steps runs along the podium's
  front to the door's axis (274 flights, 3,265 steps). Both are in core/walk: `bench-stairs` climbs every flight onto its
  podium and, opening the unlocked doors as a walker would, into every furnished house that has one (18; 24 have only the
  kit's locked doors).

## Done (2026-11-16, the owner: "work on all open issues")

- **The lake is core/water's** (`targets/town/90lw-lw-lake.js`): one `WATER.open` surface at the lake's level on core/atmos's
  wave field, the sky in it from the skylight; along the town's shore its bed is a shore grid (4 m, 650 x 145 cells), so the
  water stops at the shoreline, its waves shoal and surf breaks along the beach (`lake-water`). The plane stays only where
  core/water is missing.
- **The page has room again**: kit.json `sidePacks` (an opt-in of Xanadu's `--kit` build, 2026-11-16) puts the Qiblai pack,
  the vendored biome's cards and the catalog furniture's detail maps beside the page (`dist/xanadu.tex.*.js`), as Xanadu's
  own pack and the Glaziers' already were: the page is 5.4 MB, was 15.2. The furniture now wears the library's detail maps
  (`furnitureTex: true`). Publish every `dist/*.js` with the page.
- **The town's grain after its first year**: a two-year run of the Sultanate (the economy test's setup, 730 days) leaves no
  settlement hungry; Lāiṭwāl eats 1,250 t in the two years, 583 t of it up the Kirstabal road.
- **The flora is Opal Valley's** (`targets/town/90s-lw-flora.js`, `gen/69r-lw-flora-bundle.js`: today's core/biome with the Vale
  of Xanadu and Opal Valley kits sealed as `LW_FLORA`, as Qiblai's `QC_FLORA`): the middle terrace's station (`middlebed`) grown
  over the bench's mask, its kin trees (239), its floor plants (27,600: the tussock, the prism ferns, the opal lotus pads at the
  lake's edge), and every orchard plot and one yard in three planted with a kin tree (about 700), clear of the walls
  (`opal-flora`; the view "An orchard of Opal Valley trees"). The page's Vale grows only without it.
- **The north wall has relief**: gullies down the fault's face and buttresses between them (a ridged value noise, `lwFace` in
  `terrainH`), a rougher grain over it, and beds that thicken up the wall (7.5 m on the bands to about 60 m half a kilometre
  over them), so from the bench or the lake it reads as the fault's column, not a fine tiled stripe.
- **Screes** (`targets/town/90n-lw-scree.js`, core/terrain KRUBBLE): a talus cone at each band's two ends against its
  buttress, heaps in the gaps on the ledges and at the wall's foot (19 heaps), the ledges' walked (`wall-scree`; the view
  "Screes at the east end of the bands").

## Open

- [ ] **The ground is the site's numbers, not the open world's**: the bench's profile, the wall's line and the north wall
      are functions of the scale model's numbers for the site (PLAN.md 1), not `core/world`'s heightfield (the site is on the
      open world since L5, its countryside planned there; the town's page is not yet).
- [ ] **The north wall is a heightfield** (its gullies and buttresses since 2026-11-16): Opal Valley's own strata recipes
      (`KSTRATA` with `OPAL.STRATA`) and `KFAR` past a few km are owed; overhangs it cannot have.
- [ ] **The ledges' lips are straight in plan**: the screes break the ledges' line, but the lip itself runs straight (the
      band's block and its face meet on one line). A lip that wanders wants the block's top and the face cut on one curve.
- [ ] **The carved quarter costs about 8 s to mesh** (KCAVERN.drawRock: 216 chunks, about 1 M triangles, of a 30 s load).
      Meshing it a few chunks a frame, nearest the camera first, needs a pending hook in core/host first: the page is ready
      after its first frame (core/host 91), so the verify's shots could catch the rock half drawn.
- [ ] **Interiors near the Stair Foot only**: the bench's houses past 260 m are solid; the wall's fronts past the carved
      quarter are fronts on whole rock (by design: the quarter is what is walked).
- [ ] No people (`core/charactermodels`).
- [ ] **L0 is with two other sessions** (2026-11-16): the town's pin on the scale model is queued with the scale-model edits
      session (until it lands, the site is `slaitwal01` with `model: false` in `openworld/SITES.json`, and the economy's id is
      `xan.laitwal`; both give way to the model's id); the `opal` resource family and the Great Potch Line's lode record
      (`kits/resources/data/lodes.json`) are asked of the resource-nodes session, which is working in `kits/resources`.
- [ ] **The town's page and its open-world site are two grounds**: the page shapes its ground from the site's numbers; the
      region's ground is the scale model's at 1 km cells. The page placed on `core/world` (as Longsong's) is owed.
- [ ] **The Register's numbers are Latin digits** (the kit's: `kits/tungang/KNOWN_ISSUES.md`). Xanadui is English in Indic
      dress and its syllabary has no numerals, so the Register would spell its numbers as words in the syllables: the number
      words are the owner's to settle.
