# biomes/firebliss: known issues

Open items are `- [ ]`; build.py counts them.

## Owed in core or by other work

- [ ] **The branch's pieces.** `core/hazard/22-core-hazard-env.js` (KHAZ.crust, under, night, front; KHAZ.ENV) and
  `core/atmos/fx/89-atmos-fx-ashplume.js` (ATMOS.ashPlume) are on `origin/claude/core-plan-features-229d2a`, not on `main`. `build.py` reads
  them in place: from the working tree once that branch is merged, else by `git show` of the branch. A checkout that has neither stops the
  build with a message naming the branch. **Merge that branch before this kit, or with it**; then nothing changes here (the pages' bytes are
  the same either way). Its mud pots and fumaroles (`core/water/geyser/52c`, `52d`) are not taken: the geyser kit's own (its acid fields)
  draw them here.
- [ ] **The hunters' culture rows** (`fellgang-hunt`, `kimr-hunt`) are registered on `KCAMP.CULTURES` by this kit's `50`, as its data.
  They belong in `core/camp/10-camp-cultures.js` once the owner settles how the two peoples camp (PLAN.md section 9, "the two peoples").
- [ ] **Fauna** (`kits/fauna`): the Labyrinth's strays in summer (mammoth, woolly rhino, giant elk) at East Bliss Vale's water, the range's
  own (goats and ibex on the cliffs, marmots, raptors on the thermals) and Copper Glacier's ice worms on Mons wait for the fauna kit's
  Labyrinth and alpine sets. The gas hollows' dead birds are this kit's items (a sign, not an animal).
- [ ] **The fumarolic ice caves** on Mons (PLAN.md section 7, station 4): `KGLACIER.drawer`'s cave shells need a glacier's frame
  (`KGLACIER.create`), which a crater's ice is not. Owed: a cave shell that stands alone (core/terrain), or Mons' crater ice as a KGLACIER
  flowing out of the breach once the model resolves it (next item).
- [ ] **Mons' breach.** The plan has every crater breached south-east (130-140 deg); the model's 2 km cells show only a low notch between
  rim cells of 5,616 and 6,203 m. The page shows the floor and the south wall as the model has them.
- [ ] **The resource data predates the arc.** `kits/resources/data/geology.json` reads the range as crystalline (province `crystalline`,
  sulphur 0, tuff 0): the stations draw the data's nodes (iron, gold, tin, silver, saltpeter, copper), not the plan's sulphur, obsidian and
  pumice. Those are drawn as the kit's stones and the fumaroles' crusts, not as resource nodes, until a rebake gives the arc a volcanic
  province (for the owner: PLAN.md section 9).
- [ ] **The outpost registry.** `outposts.json` is written ahead of `openworld/outposts` (on `claude/outpost-registry-6c40e9`, unpushed);
  its field names are this kit's guess at the registry's shape: check them against its README when it is merged.
- [ ] **Acid rain.** The plume gives the rain's pH (`KHAZ.provide('ph')`), but nothing provides `'rain'` yet (no kit does: the weather's
  rain is not exported to core/hazard).
- [ ] **A texture is a stand-in:** `ground.snow.ash` (snow under the plume's ash) is drawn as the snow greyed by the ash-fall mask
  (`core/materials/PROMPTS-NEEDED.md` section 41).

- [ ] **The geyser kit's kanuka floats a little** (its `55-biome-geyser-trees.js`, read in place): at its hero tier its blooms are set up to
  .4 m off a crown point, not held to a limb (0.76 m from the nearest limb against a .6 m tolerance); at its mid tier its crown clumps have no
  limb rods. The core attach audit reads 0.80% on station 1 and 1.17% on station 3, so these pages take `guards: {maxShare: .013}` (`99`)
  in place of 1%. The fix is the geyser kit's (`BIO.holdTo` on both), owed at its turn; then the share goes back to 1%.

## The pages

- [ ] **Sub-cell features are the kit's.** The model's 2 km cells hold no gorge, bench, hollow or cove: East Bliss Vale's tuff bench and
  the Weyt Warra's gorge (~26-40 m), the hollows, the camps' pads and the shore's coves are drawn on the model's ground by the stage
  (`45-host-stage.js`), in keeping with it but not from it.
- [ ] **The Tlahn Warra on station 1** leaves the Great Vale's tarn 2-3 km off the page's north-east corner (the model's `r_fb_central`
  starts at 190,1319): the page has no river. Station 2 draws it coming into Solfatara Glen's tarn.
- [ ] **The flood's period** is a page's (90 minutes), not the range's (a lahar every few years): it shows the front; the world clock
  will set the real one.
- [ ] **Shadows** are off at load (`?shadow=1`): only the kin pines and tree ferns cast. Not measured on this kit yet.
