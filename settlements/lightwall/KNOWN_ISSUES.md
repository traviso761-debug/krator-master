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
- **L0, the pin** (2026-11-17): Lāiṭwāl is `slaitwal0001` on the scale model (edit 5.1e12, 4ba66f57c, the plan's notes in
  08447477d; its ground 1,430 m on the bench, the lake two cells south), and Opal Valley Mines' note names it Lāiṭwāl's works
  village. `openworld/SITES.json` reads it from the model now (`"model": false` gone); the region's site square is the same
  pixel, so the cut and the baked plan stand (`bake_sites.py --check`: fresh).
- **The carved quarter's rock streams in** (`targets/town/90m-lw-wall.js`): its about 8 s of meshing (KCAVERN.drawRock, 216
  chunks, about 1 M triangles) runs after the page's first frame, by drawRock's own 64 m tiles, nearest the camera first, about
  12 ms a frame. `window._hostPending` holds the page's ready for the verify harness until the last tile is drawn (a convention
  of core/host's README; `tools/harness.py` `READY_JS` waits for it), so every check and view sees the whole rock.
- **L0, the lode** (2026-11-17): the `opal` family is baked into `kits/resources/data/geology.json` and `lode:great-potch-line`
  (px 1028,1652, r 8 km, peak 235) is stamped (36f68df9c on `claude/resource-nodes-7ec053`). The test holds: the peak lies on dry
  land at the wall's foot (1,429 m), every cell over 200 within 8 km is land, and the lake's cells read 0. The node kind is
  `opal` (`kits/resources` 44t, `node-opal-low/medium/high`). Re-baked on our note (f813b5fed, the owner: "Lower and re-bake"):
  Opal Valley's opal is 150, the Line 235 at its peak (204 and 166 round it), all on land; the test holds.
- **The Great Potch Line on the page** (`targets/town/90o-lw-opal.js`, 2026-11-17): the Resources kit's opal nodes (sealed in `TG`
  by `tungang_bundle.py` `res=True`) at the wall's foot, an outcrop beside each adit's mouth: 11 (4 high over the lode's peak,
  3 medium, 4 low at the ends), registered in core/tags (`res-node`); every adit, dark adit and vein gallery of the wall (18)
  takes the nearest by the kit's rule, 78 m at most (`opal-lode`; the view "Opal outcrops at an adit of the Great Potch Line").

## Done (2026-11-23, the owner: "change the world"; PLAN.md step L6, the page side)

- **The page stands on the open world's ground.** `core/world/bake_ground.py` runs the region's own land chain in node
  (`openworld/xanadu-oidong-highrift`: its rasters, its baked roads, core/coast's coasts, its hooks, its SITE_SPEC's kept coasts,
  the geology) and samples `WORLD.H` round the pin, a 16 m grid over 6 km (bilinear within 0.18 m of `WORLD.H` on average, 1.6 m
  at most) and a 64 m one over 24 km (at the far chunks' minWave); `build.py` writes it into `gen/41w-lw-world-ground.js`
  (`LW_WORLD`), skipping the ~30 s node run while its key (every input's bytes) is unchanged. The page's x, z are the world's
  moved to the pin; its y the world's less 1,345.05 m, so the lake's -30 is the world's water (1,315.05 m; was 1,300 by the
  site's numbers).
- **The town's own ground is a patch on it**: the bench, the foot street and the band block (the carved quarter's held ramp)
  are the page's inside x +-1,150 m, from the wall's line to 300 m out on the lake, eased into the world over 550 m east and
  west and 400 m south (`lwNear`, `lwPatchW`); everything else is the world's.
- **The far ground** (`90l`): one mesh round the bench, 16 by 18 km (12 m cells by the bands, 60 m within 4 km, 150 m beyond;
  about 100,000 vertices), the bench's mesh cut out of it, the fault's beds on the steep, grass on the gentle, the shingle and
  the bed at the water; the flat lake bed plane is gone (the world's lake bed and the bay are the ground).
- **`world-ground`** (verify): the far ground's edge is the world's, past the patch the world's with the owed edit, the lake's
  level the world's water, the bake within its tolerance; it reports what the owed edit still moves.

## Open

- [ ] **The scale-model edit owed** (PLAN.md section 10): the world has the lake's shore 4-5 km south of the pin and no cliff
      north of it. Until the scale-model session's queue runs the edit (the bay up to the bench, the scarp behind the bands)
      and the region is re-cut, the page carries both as one layer over the world's ground (`lwPending`: the bay a min, the
      scarp a max), so inside that layer the page's ground and the region's still differ (`world-ground` reports how much;
      the region's own view of Lāiṭwāl still has the shore far off and no wall). At the layer's ends (x +-6.5 km for the scarp,
      +-2.5 km for the bay) the scarp fades into the world's slope and the bay into the world's apron, which reads as made.
- [ ] **The bench's mesh shows as a rectangle from afar** (the view "The town on the open world"): its painted canvas (grass,
      fields) is lighter and greener than the far ground's vertex colours over the rock texture, so from 4 km out the bench reads
      as a patch. The far ground wants the bench's grass set (the Qiblai kit's `qGrass`) on its gentle slopes, or the canvas
      faded into the far ground's tint toward its edges.
- [ ] **The north wall is a heightfield** (its gullies and buttresses since 2026-11-16): Opal Valley's own strata recipes
      (`KSTRATA` with `OPAL.STRATA`) and `KFAR` past a few km are owed; overhangs it cannot have.
- [ ] **The ledges' lips are straight in plan**: the screes break the ledges' line, but the lip itself runs straight (the
      band's block and its face meet on one line). A lip that wanders wants the block's top and the face cut on one curve.
- [ ] **Interiors near the Stair Foot only**: the bench's houses past 260 m are solid; the wall's fronts past the carved
      quarter are fronts on whole rock (by design: the quarter is what is walked).
- [ ] No people (`core/charactermodels`).
- [ ] **The Register's numbers are Latin digits** (the kit's: `kits/tungang/KNOWN_ISSUES.md`). Xanadui is English in Indic
      dress and its syllabary has no numerals, so the Register would spell its numbers as words in the syllables: the number
      words are the owner's to settle.
