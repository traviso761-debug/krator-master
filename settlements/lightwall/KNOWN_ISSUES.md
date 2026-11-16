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

## Open

- [ ] **The furniture has no detail maps** (`kit.json` `furnitureTex: false`): the page holds about 15.1 MB of its 16. The
      catalog's maps want a sidecar of their own beside the page, as the Glaziers' textures have (the page cap's warning says
      plan the split now).
- [ ] **The flora is the Vale of Xanadu's**, the page's own biome, as Qiblai's: Opal Valley's (`biomes/opalvalley`, on
      the sites branch) is owed, sealed as Qiblai seals the biome kits it wants.
- [ ] **The ground is the site's numbers, not the open world's**: the bench's profile, the wall's line and the north wall
      are functions of the scale model's numbers for the site (PLAN.md 1), not `core/world`'s heightfield. L5 puts the town on
      the open world.
- [ ] **The north wall is one mesh in beds** (the strata tint and the rock face, snow over 2,300 m): ridges, buttresses and
      gullies, and Opal Valley's own strata (`KSTRATA` with its recipes, `KFAR` past a few km) are owed. From far off the rock
      face's tile still shows as horizontal banding.
- [ ] **The bands are stepped blocks with rock faces**: their faces are rock (displaced, in beds, textured), their ends
      buttresses, but their ledges are straight. Screes and ledges that wander are the next step.
- [ ] **The lake is a plane** (Qiblai's river likewise): `core/water`'s still water and its shore are owed.
- [ ] **The carved quarter costs about 8 s to mesh** (KCAVERN at 0.5 m over 131 sites). The cavern meshed by chunk near the
      camera would cut it further.
- [ ] **Interiors near the Stair Foot only**: the bench's houses past 260 m are solid; the wall's fronts past the carved
      quarter are fronts on whole rock (by design: the quarter is what is walked).
- [ ] No people (`core/charactermodels`), not in `XAN_TUNE` (L1), not on the open world (L5).
- [ ] **The Register's numbers are Latin digits** (the kit's: `kits/tungang/KNOWN_ISSUES.md`).
