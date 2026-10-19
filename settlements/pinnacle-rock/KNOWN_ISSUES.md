# Pinnacle Rock — known issues

- [ ] **Only the rock and the site are built** (P0-P1). The roosts and the Stair (P2), the town, the Deep Root cavern, the
      farms and the camps (P3) are to come: the cleared ground round the mesa is bare until the farms and the grounds
      are laid (`PLAN.md` section 3).
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
