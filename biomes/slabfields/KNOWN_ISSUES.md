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

## Fixed (2026-11-12)

- The blocks read as stacked beds: now thick, jointed and square-cornered (above for what is left).
- The spring line's view hid its water: the camera stands on a hummock of the toe's rim, 6 m up, looking down into a seep.
- The bench's steppe was noisy close up: `ground.steppe` at 6.5 m a tile (`materials.json`; was 3).
- The scar was not painted: the ground reads `KRELIEF.at(...).fresh` into `aFr` (`84-host-ground.js`): paler, no lichen, no steppe.
- `KRELIEF.slab` had no Godot twin: `core/terrain/kslab.gd` on `KRELIEF.slabExport`, held to `golden-slab.json` by `kslab_test.gd`.
