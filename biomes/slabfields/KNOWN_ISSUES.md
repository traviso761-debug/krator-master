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
- [ ] **The blocks read as stacked beds, not broken basalt.** KSTACKS buttes round every bed's edge; a sturzstrom's blocks are angular and
      jointed (columns snapped across). Wants a jointed-block form (KSTACKS or KRUBBLE) with sharp, fractured faces.
- [ ] **The spring line's view hides its water.** From 1.8 m the seeps (7-20 m across) sit too low in the frame to read; move the camera onto
      the toe's rim or lower its target.
- [ ] **The bench's steppe looks noisy close up** (ground.steppe at a 3 m scale under the detail map): a larger scale or a softer detail.
- [ ] **The scar is not painted fresh.** `KRELIEF.at` names it (`part: 'scar'`, `fresh`), but the ground's masks do not read it yet: fresh
      rock should be paler, unweathered and bare of lichen and dust.
- [ ] **`KRELIEF.slab` has no Godot twin** (`core/terrain/LANDFORMS.md`).
