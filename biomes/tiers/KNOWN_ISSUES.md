# biomes/tiers: known issues

Open items start `- [ ]`; the build prints their count.

## The owed textures (one `lib` change each when the sets land)

The Tiers' three sets were generated on 2026-11-12 (`core/materials/PROMPTS-NEEDED.md` section 50) and sit on the owner's
unpushed local branch, so they are not in the library yet. Each slot in `materials.json` names its stand-in in `lib` and the
owed id in `owed`. When a set lands: set `lib` to the `owed` id, delete `owed`, run `python3 tools/textures/check_cells.py
biomes/tiers --fix` (a card sheet's cells and stems are its own), `python3 tools/textures/pack.py biomes/tiers`, and
`python3 tools/build.py biomes/tiers --stations`.

- [ ] **`card.shelfoak`** (the shelf oak's tier plates, a 3x3 sheet): slot `oakplate` draws **`card.broadleaf.dry`**, keep 0, tinted
  the oak's leathery green (`TIERS.PAL.oakLeaf`). Its stems are the dry sheet's (three sprigs, `check_cells.py --fix`); the new
  sheet's sprigs replace them. `rise` .12 (the plates level) stays.
- [ ] **`bark.tiered`** (the shelf oak's grey bole with branch-collar rings): slot `bark.oak` draws **`bark.smooth`**, keep 0, tinted
  grey (`TIERS.PAL.oakBark`).
- [ ] **`rock.lichen.ledges`** (the band lichen on a riser's ledges): ground layer `ground.lichen` draws **`rock.lichen.circles`**
  (keep .6) on the riser's bedded rock in level bands every 7.5 m of height (45: `GLW` 'lichen', weight rock x strata x `lichenBand`). The lichen crusts on the boulders (60: item
  `lichen`) are procedural blobs in the lichen's palette, not a library card.

## Station 1, the Lake of the Tiers

- [ ] **Software GL only.** Built and verified in a cloud session with no GPU (2026-11-16): every `verify.py --assert` run so far is
  SwiftShader. The owner's machine GPU-verifies the page (`KRATOR_GL=gpu`, a lane) before it merges; shaders are judged there.
- [ ] **The sill is drawn in the far field, not on the model.** On the model the upper lake's level stands over 79 of its rim cells (the
  west shore falls to 284 m), so it would drain. Until the map edit (PLAN.md section 8a, item 1) puts the sill on the model, `44v`'s
  `MODEL.h` raises those cells to 1,180 m (the notch at 1246,531 held at 1,150 m) for the far field and the lake's mask. Nothing on the
  page moves (the nearest such cell is 9 km west). When the edit lands, rebake `44f` (`stations/bake_far.py --all`) and delete the
  `SILL` table: the model then carries it.
- [ ] **The page is centred off the plan's pin.** PLAN.md section 9 pins station 1 at 1262,512, 4 km from the water; the page is centred
  on the drawn shore at 1262,513.4 (PLAN.md section 10a) so the lake is on it.
- [ ] **The lake's bed is deepened threefold** under the level on the page (the model's bay lies within 20 m of the level across it): a
  sculpt, out of the model check (`LAND.sculpt`). The far bay is the model's own bed.
- [ ] **The village is stand-ins** (`86-host-village.js`): every record `pending` (`KHAMLET.pendingRow('coyote')`) until `kits/coyote`
  draws the Tierhounds' stepped mud-brick rooms. Owed with it: a `landing` row for the culture (the reed boats, the fish weirs), the
  village's books on `core/simulation`, a pin in `model/src/60-settlements.js`.
- [ ] **The terracettes are not in the ground.** The tiergrass stands in rows on their lips (60: a tuft where the height is in the top
  fifth of a 0.9 m step), but the ground has no steps of its own: amendment 3 (`KRELIEF.shape` form, kit work first) is T4's. The
  terraced fields' treads (2.4 m) are in the ground (44w), on the 10 m ground mesh: coarse up close.
- [ ] **The ground's grass is two library scans, not the plan's `ground.steppe`** (the owner, 2026-11-16: "a bit too brown, more varied"):
  `ground.withered_grass` (the dry side, keep .4) and `ground.leafy_grass` (the meadow: the wet ground and the swales of a ~300 m patch, keep
  .55), over a painted ground of golden and tawny grass, olive and green swales, red soil scars and pale stony rises. Judged in SwiftShader
  only; the GPU shot may want the keeps tuned.
- [ ] **The ground takes no wet-ground maps** (`LAND.wet` false): the ground's program reads 15 sampler units with four library
  layers (the Arc's ceiling), so rain does not darken or puddle it. Two layers instead of four would buy it back.
- [ ] **The ladder reed's whorls and the step moss's mats are procedural** (a strap and a blob drawn by the kit), not library cards:
  no set is owed for them in PLAN.md section 11 (the plan names `card.reed` and `card.wingreed`; `card.wingreed` is a winged alien
  plant, not a cane). `card.reed` draws the shore reeds.
## Station 2, Coyote Canyon (started 2026-11-16)

- [ ] **The town is not laid out: a question for the owner.** The seat's landmarks are on the page as records under the Coyote kit's keys
  (`86-host-seat.js`: `cy_spring_hall` over the spring, `cy_treasury`, `cy_council`, `cy_runner_shrine` at the road's foot, four `cy_rock_facade`
  on the walls, `cy_milestone`s), all pending stand-ins. The stepped town down the walls (Masuleh's rule) is not: a capital's lots belong on
  `core/city` (CLAUDE.md), which has no terraced mode, and the Coyote kit's plan (draft 2026-11-16, section 4, amendment 2) leaves that rule at a
  city's size to the city session. Waiting on the owner: wait for core/city's terraced mode, or lay a first cut on `core/hamlet`'s terraced
  fragment (`36-hamlet-terrace.js`, the Coyote kit's C5/C7) when it lands.
- [ ] **The canyon is the station's own landform.** The model draws a V four kilometres wide; the page fills the canyon's six cells north-east
  of the site and recuts it as nine `KRELIEF.stepcut` treads (the floor climbing 11% in ~39 m dry falls, the last ending in the head's bowl).
  Out of the model check (`LAND.sculpt`). The plan's "box canyon in the great riser ... the great tread's rim 1.8-2.3 km overhead, 20 km
  up-canyon": the page holds the canyon's lower 3.2 km, its head bowl ~600-850 m deep; the great tread's rim is the far field's.
- [ ] **The head's bowl is dim, not black** (was near black at 14:00 in SwiftShader). At this latitude the sun stands in the north
  (63 degrees at noon), so at 14:00 it was behind the bowl's west wall. The station's hour is now 11:00 (the sun at az ~30, running up the
  canyon's north-east axis) and `84-host-horizon.js` sets the horizon shade's sky term to .45 (`KHORIZON.uniforms`; `?hzsky=0..1` on the
  URL tries others), so the spring hall's walls read in a dim brown light. Judge the level on the GPU; the head's view now looks down from the
  bowl's rim.
- [ ] **The flash flood is a plain record** (`drown` on each tread's floor): the gorge flood on a cycle is the shared hazard amendment
  (PLAN.md section 10, item 4).
- [ ] **No contour carvings drawn**: the milestones and façades are boxes; the carving is the Coyote kit's `cyContour` (its C1).

## Station 3, the Lip (started 2026-11-16)

- [ ] **Built before the map edit's sill** (the owner, 2026-11-16: "do station 3"; PLAN.md section 9 says it waits on it). The sill is this kit's
  far field's (`44v` `SILL`: 1,180 m on the rim cells, the notch at the level) and the lip's top is the page's (`TOP`: a plateau at ~1,180 m
  wherever the model's lake cells are not). When the map edit lands: rebake `44f`, compare the lip's top with the model's new cells (the plan
  raises them to 1,160-1,200 m), and drop `SILL` from 44v.
- [ ] **The page's origin is the notch's cell, 1246,531**, not the plan's pin (1247,530 is a lake cell): the fall then stands near the page's middle.
- [ ] **The floor's rainforest is the north-western lowlands' trees**, read in place as Korona's fertile basin reads them, not Korona's own kit (its
  trees build on the necanyons kit's geometry, a heavier read); the plan says "Korona's, read in place". A Korona kin row is the swap.
- [ ] **The hot floor's ground is leaf litter** (45: `GLW` 'litter', `ground.litter` on **`leaf.forest_leaves_02`**, Korona's set, its mean darkened to .3 for a damp floor): the
  layer's weight is the `hot` field (over ~25 degC mean), and the treads' grasses give way to it. Only the Lip takes it (`groundLayers`); judged
  in SwiftShader only.
- [ ] **The floor's forest reads open from the Lip** (SwiftShader, 'Over the Lip'): the kin rows' cells (the north-western lowlands' trees)
  leave the litter showing between crowns; a rainforest wants a closed canopy (denser cells, or Korona's own trees: the row above).
- [ ] **The fall is ~40 m across** (the lake's whole outflow down the notch): a curtain drawn by `WATER.drawFall`, no mist volume of its own
  over the 900 m drop beyond the plunge's spray.
- [ ] **The kit's natives now refuse the hot floor** (55: zones times `temperate`, 1 under ~25 degC mean): stations 1 and 2 never reach it.

- [ ] **Not built yet (T4, T5):** the pagoda bush, the stack cushion and the whorl pine (records and tags in 50, no builder); station 2's
  town (above), station 4 (the Great Tread, `core/camp`); the `tiers` entry in
  `kits/crops`; `outposts.json`; the gorge flood (the shared hazard amendment).
