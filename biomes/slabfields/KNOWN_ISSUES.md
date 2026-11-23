# biomes/slabfields: known issues

- [ ] **The life is Earth's stand-ins.** Void fern, seep reed, bench bunchgrass and block lichen are the kit's own Earth-type species, and the
      bench's cushions are Oidong's high country read in place. `PLAN.md` section 9 wants the neighbours' life read in place: move to the Siphon
      Pits' species (branch `claude/siphon-pits-biome`) and the Loom-Chasms' when they reach `main`.
- [ ] **No talus caves.** The big blocks' voids carry their gas hazard records, but `KCAVERN` does not cut them yet (`PLAN.md` section 14).
- [ ] **The hummocks are the stage's noise, not `KRUBBLE.heap`.** The apron's lobe, levees, rim and hummocks are one analytic thickness
      (`L.apronT`). Moving the hummocks onto `KRUBBLE` heaps gives them their surface function for Godot; a later pass.
- [ ] **The blocks show no beds.** A tumbled block's beds would lie at its own angle; KSTRATA draws in the world's frame, so the blocks are
      tinted by the flow they came from instead (`86-host-blocks.js`).
- [ ] **The model's `th` and `tl` are unset (-90) here.** The site's coldest night (-15 degC) is the kit's estimate (`40-biome-slab-sites.js`).
- [ ] **The apron is one collapse.** The model's apron (four cliff heights, 264 km2) is many; the page draws the last lobe (H/L 0.46). The older
      lobes beyond its toe are not drawn (they would lie under the bench's steppe north of the page).
- [ ] **The blocks' plan is a squared oval, not a broken polygon.** They are now one or two thick beds with columnar jointing
      (`o.columns`), squared corners (each bed's superellipse `sq` 6-12) and crisp edges, so they no longer read as stacked
      pancakes; but KSTACKS draws every footprint from an ellipse, so no block has a straight fractured side or a sharp re-entrant
      corner. The fix is an opt-in facet outline in `core/terrain/37-core-stacks.js` (`footR`: the min over a few half-planes), which
      reaches 105 pages (`tools/reach.py`): the owner's call.

- [ ] **Station 2: no cracked walls.** PLAN.md 3.6 and section 11 name cracked walls and floors laid level now sloping as the tilt's tell. Nobody
      lives on the Leaner and no ruin is placed, so the page shows the tilt in the water (the strandlines, the ponds) and the ground (the open
      cracks behind the lip) only. A ruined waystation by the road would carry it, on `core/ruins` (`KRUINS.watch`) and a building kit: the
      owner's call with the outlaws (section 12).
- [ ] **Station 2: the shelf's marl, travertine and sulfur are paint, not library layers.** Adding `ground.travertine.white` (and a lake marl)
      to `materials.json` changes the kit's one pack, which station 1 also takes (its page's bytes and baseline move): a ride-along for the next
      rebuild of both pages.
- [ ] **Station 2: the patera is brought to 1.6 km from the cliff** (the model: about 4 km); NOTES.md, "The compression". No map change asked.
- [ ] **Station 2: no `KTHERM`.** The warm springs' heat is a falloff from each pool (`HEAT_AT`); the sill under the patera deserves a ground-heat
      record (PLAN.md section 14) once a station shows vents.
- [ ] **Station 2: the springs that move at the ramp's foot** (`spr_slab_leaner_ramp`, 5.1 px 1604,1401.5) lie 10 km SSE, off the page; the
      page shows the moving outlet on the patera's shelf instead (the live springs low, the dead ones higher).
- [ ] **Station 2: the outlaws' view of the road** (PLAN.md section 12, "the Leaner is contested") is not drawn: their camps wait on core/camp's
      amendment 4 and the owner's answer on the outlaws.

- [ ] **Station 3: the outlaws' seat is not drawn.** PLAN.md section 12 makes the Halves the outlaws' seat (a default the owner is to confirm);
      their camps want core/camp's amendment 4 (a war-camp culture row, bands of 10-30, a lookout record and its siting rule). The page is the
      landform only.
- [ ] **Station 3: the halves, the pits and the patera's floor are brought close** (NOTES.md, "The compression"); the ramps fall from the nearest
      rim, so each half reads as a ridge from afar, not one tilted plane. A slab record with a ramp direction of its own (KRELIEF.slab's `dip`
      as a vector) would fix it: core/terrain, the owner's call (it reaches every page that takes 38d).
- [ ] **Station 3: the patera's floor crust and the pits' floors are paint.** The library's `ground.lava.crust` is not in the kit's pack (adding a
      family moves station 1's page, as station 2's travertine: a ride-along).

## Fixed (2026-11-12)

- The blocks read as stacked beds: now thick, jointed and square-cornered (above for what is left).
- The spring line's view hid its water: the camera stands on a hummock of the toe's rim, 6 m up, looking down into a seep.
- The bench's steppe was noisy close up: `ground.steppe` at 6.5 m a tile (`materials.json`; was 3).
- The scar was not painted: the ground reads `KRELIEF.at(...).fresh` into `aFr` (`84-host-ground.js`): paler, no lichen, no steppe.
- `KRELIEF.slab` had no Godot twin: `core/terrain/kslab.gd` on `KRELIEF.slabExport`, held to `golden-slab.json` by `kslab_test.gd`.
