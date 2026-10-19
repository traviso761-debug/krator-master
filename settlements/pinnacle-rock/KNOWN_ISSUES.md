# Pinnacle Rock — known issues

- [ ] **The Deep Root cavern and the Garden's great-houses are not built yet** (P3d-e): the precinct and the Garden's
      mesa are bare until they are laid (`PLAN.md` section 3). The town (P3a), the farms (P3b) and the bands' grounds
      (P3c) are.
- [ ] **The hedges' runs are drawn light** (a ragged band of brush, `89e`): the kit's own run piece is 9.7 k triangles of
      cut thorn and the nine hedges are 14 km of it; its gate pieces are drawn whole. The cut thorn has no library set
      (`foliage.thorn.cut`, owed: `core/materials/PROMPTS-NEEDED.md`). The pastures are the floor's ground (no grass
      sward), and no mount stands in them yet (the beasts, kits/fauna, with the life: P4).
- [ ] **The top's grounds moved in from the diagram's places** (`PR.TOP.camps`, 2026-10-19): seven of the nine stood partly
      over the rim band or the fins' feet (the Hardshell's almost wholly over the rim); each now stands 90% or more on the
      usable cap. The town re-plans round them.
- [ ] **The farms are drawn simply**: each field a levelled slab over the floor mesh (the floor is not cut to the
      terraces), its crop as instanced rows, the orchards' trees a trunk and a crown, the paddies' water a sheet with no
      channels from the spring; the crops are the plan's named few, not drawn from `kits/crops` (`CROPS.forBiome`). The
      palisade's run has no walkway; the west and east gates open on the floor, the bands' tracks out to their grounds
      come with P3c.
- [ ] **The town's buildings carry no furniture and no interiors**: the catalog's furniture files are not on the page
      (`build.py` `cat_fragment`; a building's `F.furn` notes the key and places nothing), as on the isle demo's city page.
      They come with the life (P4) or an export profile.
- [ ] **No level of detail for the town**: each of its ~60 prototypes is drawn in full for every copy (about 0.6 M
      triangles, ~800 instanced meshes). Massing far off (the isle demo's `DRAW.nearR`) is a follow-up if the frame rate asks.
- [ ] **The assembly hall is Girder's at Girder's size** (39 m across), where the plan says "larger"; the speakers'
      stones and the Crown's fires are not drawn yet (P4). The town's footings: a building stands at its footprint's
      highest corner on the cap (flat to a metre), with no plinth drawn under the low side.
- [ ] **The town's layout is new**: it was not drawn by the owner, but laid by `core/city` from the settled zones (the
      quarters, the Crown, the squares, the avenues in `54-pr-town.js`); a change to core/city's builder moves it, and the
      town check says what moved.
- [ ] **The far land is the model's 4 km cells**, smoothed and given the open world's jungle detail: no tree out there,
      a canopy surface 125-175 m over the ground; the hyperjungle's sky (read in place) still paints its own distant
      ridges on the horizon behind the real Inner Wall.
- [ ] **The red sandstone's bedded set** (`rock.sandstone.bedded.red`) is the necanyons page's materials, read in place
      (`biomes/necanyons/materials.json`): the mesa takes necanyons' wall, stack and top textures.
- [ ] **The debris slope's ground is necanyons' talus texture** (ochre litter grading to its talus set): from the floor
      it reads more yellow than the red rubble of the reference; the fallen blocks carry the red. A tint hook for the
      slope (or a red talus set) is a follow-up. The floor mesh's 11 m cells smooth the slope's 9 m ledge bands: its
      roughness is the blocks and the lumps, not the bands.
- [ ] **The Heart's gullies are seed-chosen** (`PR.HEART_MESA.seed` 2709) to miss the three pinnacles' feet; a change to
      KSTACKS' weathering can move them, and the stage then reports the pinnacle that lost its footing.
- [ ] **The roosts are drawn on the page, not from catalog entries.** A ring follows its stack's outline at its height,
      so the plan's `br_bldg_roost_ring` catalog entry (PLAN.md section 2) would be one fixed shape; the ring, the stalls,
      the shelters, the climbs, the bridges, the lifts and the gates are drawn from their records by `89-host-roosts.js`
      in Girder's vocabulary. The records (`43-pr-roosts.js`) are what Godot draws from; a Godot builder is owed.
- [ ] **The Stair's cut flights have no notch over them.** KSTACKS draws no notch into a wall, so a cut flight runs half
      into the face (the wall's surface crosses its tread) with masonry under it; there is no cut ceiling or back wall.
      Where a bed juts out over the flight, the flight stands out at its face on masonry (up to ~5.5 m off the recessed
      bed under it, two stretches); a notch in the rock mesh would let it cut in instead.
- [ ] **What hangs on the rock follows the DRAWN wall, not KSTACKS' outline** (`PRR.wallR`, from `KSTACKS.mesh` with the
      page's wall steps). The mesh's wall rings are capped at 160 segments (`core/terrain/37-core-stacks.js`), so on the
      mesa the drawn face stands up to 12 m inside the outline; a change to that cap, to `LAND.wallStep` or to KSTACKS'
      weathering moves the Stair and the climbs, and the checks (rays at the drawn rock) say where.
- [ ] **No walker yet on the roosts**: the climbs, the decks, the bridges and the Stair are drawn and recorded, not on a
      nav graph (Girder's `NAV`); a walker and the town's people come with P3 and P4. A climb comes up through a hatch
      in its deck's inner band; the lookout climbs pass the stall deck's walkway.
- [ ] **Plants on the stacks are not kept off the rings**: a necanyons plant on a fin's wall can show through a deck or
      a stall (the kit places before the roosts are planned). Keeping them off wants the plan before the kit's build.
- [ ] **The lift road ends at the palisade's line, where the north-west gate is to stand**: the palisade and its gates are
      P3's; the road does not yet go on into the farms. Its bench is cut into the debris slope's height and the floor
      mesh re-seated round it (`47b`), but the mesh's 11 m cells spread the cut over a cell or two either side, so the
      bench reads as a broad shelf with the road on it rather than a crisp cut.
- [ ] **The flyers keep over the forest's roof** where the forest stands (`flyers/20-world.js`, `FLY_CANOPY` 235 m by
      `PR.forest`), not by each tree; a remnant tree on the cleared ground can stand taller than that. The gorge run
      (a circuit along the dry gorge) finds no clear loop and is left out; some stalls have no clean approach
      and way out both and hold no traffic (ten of 113 at the last count).
- [ ] **Load time**: the roost plan takes about a second, the town's plan under one (and the two towns sealed in `CAT`
      run their engines at load, a few seconds), the flyers' setup (every bay proved both ways) about five on a GPU pane;
      the page opens in about 30 s. The page is 3.7 MB with its sidecars about 26 MB (the towns' maps 8 MB).
