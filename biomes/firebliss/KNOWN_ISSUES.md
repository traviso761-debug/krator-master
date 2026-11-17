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
- [ ] **Mons' notch.** Each rim's notch is 180 m deep on its south-west side (PLAN.md section 1); on Mons' page the wall is lowest toward
  the south-west corner, as the model has it. No crater glacier flows out of it yet (the caves' item above).
- [ ] **The valleys hold no sulphur in the resource data.** The rebaked `geology.json` (5.1 edit 3) puts sulphur at the vents: Mons'
  page draws four sulphur nodes, the valley pages none (the Glen's sulphur is its fumaroles' crusts, drawn, not a resource node). The
  plateau between the cones still reads sedimentary and granite (PLAN.md section 10, `VOLCANIC_REGIONS`).
- [ ] **The outpost registry.** `outposts.json` is written ahead of `openworld/outposts` (on `claude/outpost-registry-6c40e9`, unpushed);
  its field names are this kit's guess at the registry's shape: check them against its README when it is merged.
- [ ] **Acid rain.** The plume gives the rain's pH (`KHAZ.provide('ph')`), but nothing provides `'rain'` yet (no kit does: the weather's
  rain is not exported to core/hazard).
- [ ] **A texture is a stand-in:** `ground.snow.ash` (snow under the plume's ash) is drawn as the snow greyed by the ash-fall mask
  (`core/materials/PROMPTS-NEEDED.md` section 47).

- [ ] **The geyser kit's kanuka floats a little** (its `55-biome-geyser-trees.js`, read in place): at its hero tier its blooms are set up to
  .4 m off a crown point, not held to a limb (0.76 m from the nearest limb against a .6 m tolerance); at its mid tier its crown clumps have no
  limb rods. The core attach audit reads 0.80% on station 1 and 1.17% on station 3, so these pages take `guards: {maxShare: .013}` (`99`)
  in place of 1%. The fix is the geyser kit's (`BIO.holdTo` on both), owed at its turn; then the share goes back to 1%.

## The pages

- [ ] **Sub-cell features are the kit's.** The model's 2 km cells hold no gorge, bench, hollow or cove: East Bliss Vale's tuff bench and
  the Weyt Warra's gorge (~26-40 m, inside edit 3's 2 km outlet channel), the hollows, the camps' pads and the shore's coves are drawn on the model's ground by the stage
  (`45-host-stage.js`), in keeping with it but not from it.
- [ ] **The Tlahn Warra on station 1** leaves the Great Vale's lake on its east side (189,1318), 12 km off the page: the page has no river.
  Station 2 draws it coming into Solfatara Glen's lake.
- [ ] **Two stations stand off the plan's points** (PLAN.md section 7a): the Glen on the Tlahn Warra's mouth, East Bliss on the Weyt Warra's
  outlet (the gorge is its content).
- [ ] **The flood's period** is a page's (90 minutes), not the range's (a lahar every few years): it shows the front; the world clock
  will set the real one.
- [ ] **Shadows** are off at load (`?shadow=1`): only the kin pines and tree ferns cast. Not measured on this kit yet.

## Station 8, South Glass (2026-11-16)

- [ ] **The GPU verify is owed** (`KRATOR_GL=gpu python3 verify.py dist/firebliss-glass.html --assert --all-views` on the owner's machine). The
  session that built it had no GPU: what ran on SwiftShader is in the commit message.
- [ ] **The dome and the model** (2026-11-17). `model_site.py` reads the dome's record from the model's `DATA.domes` (scale model 5.1
  edit 8, `tools/scale-model/edit_518.py`, on `main`) when the model carries it, else `station.json`'s copy (this branch's model has no
  domes). With edit 8 the model's 37 dome cells are refilled from the land round them (a Laplace fill) and the page raises its own,
  sharper dome once: tested on main's model outside the page (the page's ground within ~5 m of this branch's off the dome; the moat
  unchanged). **Owed after the merge with main:** rebuild the page on edit 8's model and verify it. The moat's pit (a dome-dammed pond
  in the patera plan) has no water level on the model: a map change for the scale-model queue if the owner wants a pond there.
- [ ] **The spec's numbers are not the model's** (PLAN.md section 11.3): the spec's moat 2,890 m, top 3,290 m, 1.11-1.16 atm and Dfc/Cfb; here
  ~4,220 m, 5,053 m, 0.94 / 0.85 atm, ET. The wall is ~800 m to the moat (the spec's 380 m is its cliff part). The model was followed.
- [ ] **A texture is a stand-in:** the wall takes `rock.basalt.flowbanded` under KSTRATA's beds (the gap `rock.rhyolite.flowbanded`, entered in
  `core/materials/PROMPTS-NEEDED.md` on the patera branch, not on this one); the carapace takes `stone.obsidian` (the kit's solids' set) as a
  ground layer, the talus `ground.cinder` greyed.
- [ ] **The two views stand for the spec's one** (PLAN.md section 11.3): Mons' plume and the wall cannot share one frame from the moat.
  Golden hour is the clock's, not the load hour.
- [ ] **The ground's slots.** The dome's glass and pumice ride the ground's ice and meadow attributes (`SITE.groundAttr`): the ground already has 16
  vertex attributes, so a new one is not safe. A station with a tarn or ice that also wants them needs another way (a packed attribute).
- [ ] **Not drawn:** the tuff and tibasalt under the dome, an obsidian resource node (no such kind in `kits/resources`), the other four Glasses
  (past the far field).

