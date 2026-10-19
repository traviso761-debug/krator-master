# Pinnacle Rock — known issues

- [ ] **The town is not built yet** (P0-P2 are). The town, the Deep Root cavern, the farms and the camps (P3) are to come:
      the cleared ground round the mesa and the top between the stacks are bare until they are laid (`PLAN.md` section 3).
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
- [ ] **Load time**: the roost plan takes about a second and the flyers' setup (every bay proved both ways) about five on
      a GPU pane; the page opens in about 30 s.
