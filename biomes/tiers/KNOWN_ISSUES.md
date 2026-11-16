# biomes/tiers: known issues

Open items start `- [ ]`; the build prints their count.

## The owed textures (one `lib` change each when the sets land)

The Tiers' three sets were generated on 2026-11-12 (`core/materials/PROMPTS-NEEDED.md` section 50) and sit on the owner's
unpushed local branch, so they are not in the library yet. Each slot in `materials.json` names its stand-in in `lib` and the
owed id in `owed`. When a set lands: set `lib` to the `owed` id, delete `owed`, run `python3 tools/textures/check_cells.py
biomes/tiers --fix` (a card sheet's cells and stems are its own), `python3 tools/textures/pack.py biomes/tiers`, and
`python3 tools/build.py biomes/tiers --all`.

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
- [ ] **Not built yet (T4, T5):** the pagoda bush, the stack cushion and the whorl pine (records and tags in 50, no builder); stations 2
  (Coyote Canyon, `core/city`), 3 (the Lip: waits on the map edit's sill) and 4 (the Great Tread, `core/camp`); the `tiers` entry in
  `kits/crops`; `outposts.json`; the gorge flood (the shared hazard amendment).
