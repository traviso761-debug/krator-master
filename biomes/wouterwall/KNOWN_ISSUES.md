# wouterwall — known issues

- [x] **The far land stopped at the region's box.** `region/far.py` cast the sky's ridges from the `w outer wall` cut, whose box
      ended at px 270 (5.1), short of the airless crest. Re-cut 2026-11-09 with `--add region/crest.json` (a box from px 190): the
      crest is in the data, 9.3 km at px 255 on the station's row. Station 1's profile did not change: from 3.7 km the crest, 194 km
      off, stands ~0.5 degrees up once the planet's curvature drops it ~3.9 km (R 4,813 km), under the bench's upper steps 120 km
      out (0.8 degrees), so it is hidden from here by the bench itself. Stations 2 and 3, 60-90 km nearer, will see it.
- [x] **The terraces were on an 8 m grid.** `KRELIEF.terraces` steps 3.2 m; on the 8 m grid a riser fell between two points and read as a
      slope, and the field texture's furrows lay any way the hex tiling turned them. Fixed 2026-11-09: each terrace patch is a 2 m
      `KFIELD` inset (`SITE.terraces.step`; terrainH reads it, so plants stand on the drawn treads), drawn as its own mesh with the base
      mesh's cells under it left out and its edge pinned to the base's lattice line; the furrows are the ground shader's, stripes of the
      pre-terrace height over a step (`aTP`), so they run along the contour; the field is tinted lighter.
- [x] **The loess's soil bands were a shader stand-in** (height noise). Fixed 2026-11-09: the walls, the pillars' ground and the cave
      hoods take core/terrain's strata path (`KSTRATA.shade` on the `loess` recipe: its loess, paleosol and calcrete beds) as a tint
      over the loess layer. Still flat beds: `KSTRATA.vary`/`drape` is CPU-only until the core's baked offset texture (PLAN.md section
      8, core amendment 1). On this bench (~2.5% slope over a few km) flat beds lie within a bed's thickness of a draped one.
- [x] **No cave-house mouths.** Fixed 2026-11-09: five yaodong mouths in the trunk gully's south wall (it faces north, into the sun),
      on its dry floor above the spring (`SITE.caves`): `KCARVE` alcoves folded into the bake, a 1 m inset round them, their hoods meshed
      on the ground's material (all loess, the beds on them), registered (`house.yaodong`), nothing growing in them (obstacles, the `cave`
      zone). The fronts (doors, lattice windows, the courtyard) are the settlement plan's (PLAN.md section 5).
- [x] **Over the instance cap.** The yuan is one wide steppe, and the NW outer wall's plumegrass and steppe grass (read in place, with
      their own caps: 250,000 and 350,000) reached 376k and 425k on five LOD-spine points with a 750 m floor band (verify's universal
      `instance-cap`; the first two commits were recorded as passing before that section of the run had been read). Fixed 2026-11-09:
      four spine points and a 600 m floor band, 242k and 275k. The caps stay nwouterwall's; this page places fewer.
- [x] **A view under the mid ground** (GPU verify, 2026-11-09, `claude/cloud-kits-verify`). 'The brook below the spring' stood on the
      trunk's floor at u .8, past the near box (`SITE.R`): the mid ground's 220 m cells do not hold a 150 m gully, so the eye was under
      the drawn mid mesh. Its eye is now on the thalweg up to 260 m below the spring, 250 m inside the near box (`SITE_BELOW_SPRING`).
      `verify.py --assert --all-views` then passes on the Arc lane (the RTX run before the fix failed on that eye alone). Under SwiftShader on Windows the page's Lambert programs
      sometimes fail to link with an empty log (one run in three); not seen on either GPU.
- [ ] **The flora is the NW outer wall's alone (W1).** The dust towers and the puya spikes (section 3, `card.puya` delivered) and the
      lowlands' species (crag pine, needle cypress, candle birch, tussock, saltbush; tier cedar, ember manzanita) are W3. The terraces
      carry no crop yet (section 6).
