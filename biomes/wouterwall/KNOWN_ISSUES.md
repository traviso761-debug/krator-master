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
- [x] **The flora was the NW outer wall's alone (W1).** Fixed 2026-11-10 (W3): the two natives are the kit's (50, 60, 46): the puya
      spike (`card.puya`: a rosette cell, the flower spike cut from the bottom rows; on the dry bench, a mean of -4.5 to +4.5 °C, stations
      2 and 3, 2.5% in bloom) and the dust tower (`KSTACKS` mounds by cell on `organic.dusttower`, on the yuan: stations 1 and 4). The
      lowlands' species are read in place by key (88k: `BIO.kitBuilder`, `BIO.kin`): crag pine, needle cypress and candle birch at station 1,
      tier cedar and ember manzanita at station 4.
- [ ] **Tussock and saltbush are not taken.** They are nwlowlands' floor pass's (its 60), not builders by key, so the bench's dry loess
      shows the NW outer wall's steppe grasses there. Taking them needs nwlowlands to name them in `api.builders` (core/biome 20,
      `BIO.kitBuilder`), or a floor-by-key in the core.
- [x] **The terraces carried no crop.** Fixed 2026-11-10 (the owner: "make up some crops for it"): `kits/crops` has the `wouterwall` entry
      (section 4's five zones) and seven made-up Hayrant crops on the Loess Plateau's habit (dustmillet, redstem buckwheat, terrace
      lentil, bench garlic, cave-date, wallhemp, cave madder); larch bark, birch tar and the rosette lichen are home here too, so the bench
      makes a plaid. Station 1's terraced fields grow them (88c, 60), one crop a field by a seeded rotation, a card every 2.4 m, by season.
- [ ] **The cave-date (jujube) is not drawn.** It is a tree; no tree builder on the page draws it (the plan's place: by the yaodong doors
      and on the risers).
- [ ] **The tier cedar is a kin, not the lowland tree.** Grown as swlowlands draws it, its crown's top clumps stand off the bole past
      core/biome's attach rule (2.7% of this page's raised cards, 2026-11-10; on its own page the rest of its flora dilutes them); on the
      bench it is `BIO.kin` with 0.85 of its height and 0.6 of its crown (`benchcedar`), which holds. Owed upstream: swlowlands' tiered
      tree's top clump nearer its bole.
- [x] **No `KFROST` at station 3.** Fixed 2026-11-10: station 3 takes core/terrain's KFROST (`station.json` "frost", `SITE.frost`; 47 lays it
      before the bake, 45's groundH adds it): solifluction lobes (26 m cells, 1.1 m risers) on the old lobe's flanks and the swells where the
      mean is under -1.2 °C and the slope gentle, none on the fresh rubble (a check and two negatives). Sorted polygons (a few metres) are
      under the 8 m ground grid and are not laid; rock glaciers want a cirque, which the page has not (the northern lobe, section 7's
      alternative, would).
- [x] **Every station's tab read "the loess bench".** Fixed 2026-11-10: 00-head's title is the kit's, and 99 sets the station's.
- [x] **Station 2's views** (GPU verify 2026-11-10): two views had no height (a NaN eye: the page's error panel), one stood in the trench
      lake, the sag-pond view outside the near box and the pinnacles' in a pond. The eyes now stand on the beach and dry ground inside
      the box (`SITE_DRY`). Station 4's plumegrass reached 292,749 of its 250,000 cap on the plateau: its floor band is [240, 480]
      (`SITE.floorBand`).
- [ ] **The model's trench lake is fitted, not carved** (station 2). Its 1 km cells sit in a bicubic ground that stands 150 m over the
      level at the west edge and 100 m under it on the block east; 45's `MODEL_LAKE_AT` caps the ground by a ramp to a 30 m gravel beach and
      lifts a bank round the cells, and the water is drawn and held only to 120 m out of them. Past ~2 km from the shore the bank is a plain
      levee on the mid ground. The model's own lake shore (a polygon, not cells) would do better.
- [ ] **Stations 2 and 4 stand off the plan's pixels.** Station 2's px 318,818 is the trench lake's middle: the page stands on its west
      shore, px 316,818. Station 4's 360,1010 is half way up the Waywater Ironblack valley's wall: the page stands on the plateau's rim,
      px 360,1010.75, so its box canyon runs from the plateau to the valley floor inside it. Both in `region/far.py`.
