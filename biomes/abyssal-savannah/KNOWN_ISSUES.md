# Krator biome kit — the abyssal savannah: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **eastabyss does not read this kit yet** (PLAN.md S5, Q8). Its savannah passes (9, the umbrella trees; 17's savannah
      share) and its floor's `plantSav` sit in the middle of one random stream each, so swapping them for `ABSAV.grow` moves
      every plant eastabyss places after them. Do it as one deliberate change with eastabyss's `baseline.json` rewritten:
      keep its rng draws where the savannah was (or move its passes onto per-cell seeds first), call `ABSAV.zones` /
      `ABSAV.make` / `ABSAV.grow` for the `sav` zone, and add this kit's fragments and pack to its `build.py`.
- [ ] **The ground is not the scale model's.** The rim slope is an analytic profile on the survey's grade (KRAND noise),
      not KLAND (still not in this checkout). The risers, gullies and kopjes are the page's own (PLAN.md Q3). Map 5.1
      (2026-11-03): the site moved to px 1026,350 (-638 m, Aw); the page's foot to bench (-600 to -100 m) lies in the rim's upper
      bench band (-550 to -100 m on 5.1), and the far field runs west on 5.1's grade. The page's climb is about twice the model's
      grade (500 m over 6 km where 5.1 rises ~500 m over ~14 km, old px 1026-1033): the treads are the page's, not the model's.
- [ ] **5.1 made the climb wetter than the plan says** (for the owner): ~1,240 mm at the foot (Aw, +30 degC), ~1,100 mm on the
      bench (BSh, +27 degC), where the plan has 720-1,160 and 440-630 mm, and the foot is Aw, not Am. The flora is unchanged:
      the jungle still climbs out of the foot and the gullies (a wet Aw's gallery forest). Say if the parkland should close up.
- [ ] **Fire is a static mosaic** (`ABSAV.burn`): no front that moves, no smoke, no people who burn (PLAN.md S6). BACKPORT.md's
      row asks for `KFIRE` (core/biome 38): its `history` would replace the mosaic, which re-rolls every patch and so every plant,
      lily, charred stem and ground colour that reads it. Not taken in this turn: it is S6's, a deliberate placement change.
- [x] **The umbrella's crown plate** is `card.umbrella.plate` (delivered 2026-11-10: one flat crown seen from above, the whole
      sheet, keyed with `vlahos`), in place of one `card.acacia` sprig stretched over the disc. Its rim's sprays came half
      blended into the magenta and key to a dry tan, not green.
- [ ] **The caprock's talus assumes downslope is -x** (`60`, `caprock`): fine on this host; a world with the rim facing
      another way must hand the direction (add `rim.down`).
- [ ] **No fauna.** Grazers and the eastern abyss's frilled lizards on the rocks belong to `kits/fauna` (PLAN.md Q6).
- [ ] **No runtime LOD.** The trees and the floor are levelled by distance from the LOD spine, not the camera (the
      eastabyss kits' way); a free camera standing far off the spine sees the mid and far bands up close.
- [ ] **The bench reads thin.** Its bunchgrass (paired tussocks, `card.ichu` tinted) is a steppe from the ground but a
      scatter from above; the stub-lycopsid colonies carry it. A denser short-grass card or a second floor layer is a look pass.
- [ ] **Every view draws the whole scene** (~9.7M triangles, ~52 calls): the meshes are map-wide, so frustum culling
      saves nothing. The core's chunked LOD (`BIO.range`, as swbay's trees use) would cut it.
- [ ] **Stations 2 and 3** (the floor's belt, the bench's edge with ebadlands read in place) are planned, not built.

- [ ] **KSHADOW's cost is not measured** (the cloud turn had no GPU): the coordinator times `?shadow=0` against the default on
      the Arc. The Throne's isle and vents skipped it for its cost; oidong measured it within noise.
- [ ] **The scene's triangles rose** with the crowns held: 8.65M -> 9.67M at the opening view (software GL), over the kit's 9M
      showcase budget (`BUDGET` in `99-host-take.js`; a warning, not a failure); the tree pass 4.21M -> 5.22M of 6M (the heroes'
      twigs at 6 triangles, the joints' spans). The owner or the GPU run decides: raise the budget, or thin the twigs (one per
      two clumps, or none past ~500 m).
- [ ] **The savannah rims, stations `serim`, `erim`, `north` (J4-J6, 2026-11-08; built as `biomes/savannarim` in a cloud session on CPU checks only, folded in here the same day: PLAN.md section 14)** (`biomes/hyperjungle/PLAN-LANDS.md` section 13). Checked
      here: every page builds (`tools/build.py`), the lints pass (`check_core_use`, `check_assembly`, `check_port`, `check_source`,
      `check_cells`), and each page was loaded in Chromium on SwiftShader (no GPU) with its host checks, negatives and the core guards (the
      card guard, the attachment audit, one LOD key a tree) all passing. **GPU-verified 2026-11-09 after the fold-in** (`verify.py --assert --all-views`, rtx lane: serim, erim, north each pass, export profile on each station's box; the first run failed export-profile on the hazards section until `build_station()` took `core/biome/37-core-traps.js`, as crater-drylands did on 2026-11-08). **Not judged yet: the look and the frame time.**
  - **J4, the base and the north savannah** (`--station north`; the base also on station `serim`'s map):
    - The base: red oat grass (`SAVRIM.grass`, by the burn's age: none on this season's ash, full from three years), blind grass
      (`SAVRIM.blindGrass`, with the raiders' lanes), the fan palm, the umbrella thorn, the gallery forest (the hyperjungle's six at 0.3-0.5
      of their size, its screwpines and gingers), the monsoon kapok and gate baobab outliers (the hyperjungle's, bare in the dry season:
      `HYPERJUNGLE_LOOK.deciduous`), the termite cathedrals (KSTACKS.mounds, H10, on earth.termite), the burn mosaic (KFIRE, H3: ages in
      every band, none in the gallery, the dambos or the river), the dambos' green, the seasons (H7: `BIO.bindSeason`).
    - The north: blind grass to the horizon (316k tussocks against 89k red oat), the hyperjungle's bone giants (106) and bloodwoods (114)
      read in place, its jungle's roof to the west past the map.
    - Measured on the CPU load: station 1 4.7M triangles, 179 calls at the default camera; the north 4.7M, 196 calls. The grass items carry
      instance caps with `capWhy` (red oat 700k, blind grass 900k): the savannah's grass is the page.
    - **The umbrella thorn is the kit's own** (`src/rim/55`: the hyperjungle's shared tree), not swbay's read in place as PLAN-LANDS.md section 4
      says: swbay's thorn fails the attachment audit when read in place (its builder fills the crown's disc with cards away from its
      boughs: 2-10% floating on these pages, the same fault swbay's own page has in HANDOFF-REBUILD.md's west catch-up). Swap back when
      swbay's builder holds its cards.
    - **For the GPU verify:** the grass's density and colour by burn age (view "In the grass"), the blind grass's height against a person,
      the bone giants' white over it, the mounds' texture scale (uv in metres / 3), the dry-season bleach and the kapoks' drop (`#day=`).
    - **Stand-ins** (`core/materials/PROMPTS-NEEDED.md` section 37): the blind grass on card.rankgrass (card.grass.elephant owed), the red oat
      grass on card.grass.dry (card.grass.themeda owed), the umbrella thorn's leaflets painted (card.acacia is in the library: it wants its
      stems), its bark vertex colour.
    - **Not built here:** fauna (the savannah's herds: a later step with kits/fauna's lands, as the hyperjungle's stations have), the
      laterite pavements' ironstone as a KFIELD/C4 `pavement` (only the ground's paint; `ground.ironstone` owed), crops (`kits/crops`
      the rims: PLAN-LANDS.md section 8).
  - **J5, the e rim** (`--station erim`; `src/rim/52`, `stations/erim/`): the old lines, seven cousins by BIO.kin of eastabyss's and the e
    highlands' builders read in place (the e highlands' registry is `ehigh`, so `ehigh.vigil` etc.): fire scale-trees on the old burns,
    the monsoon cycads flushing on burns 1-5 years old (brighter the younger), dambo horsetails, ember spikes (flowering on this season's and
    last year's burns, spent torches to three years: `EHIGH.vigilStage` wrapped on this page), monsoon ragbarks (deciduous), bolsters and
    glass wands on the ironstone; the comb tree and the elephant ear from the savage land by reach (H1, `LAND.home`), the abyss's horsetails
    and cycads thicker eastward. H4: `BIO.setGiant(66)` with `EHIGH.setGiant(BIO.GIANT_AZ)`, the pull a share of each cousin's lean fading
    west (measured: the ember spikes' mean lean east 2-3 times the west's). 8.1M triangles, 288 calls at the default camera on the CPU load.
    - **Page-local changes to a neighbour's items** (the source pages unchanged): ehighlands' `rag` and `cushion` materials take the season
      (H7: the ragbark drops, the bolster turns orange; `turn()` in `stations/erim/87e`), its `spire` item draws on a solid (the hyperjungle's `G.smat`)
      so the attachment audit sees what holds the florets (on its own leaf material the florets read as floating: 6% of the cards), and
      `EHIGH.vigilStage` keys the flowering to the burns. Worth taking back into ehighlands at its next turn (its spire as structure).
    - **For the GPU verify:** the lean of the spikes and ragbarks (view "Toward the giant"), the cycad flush's green against the char, the
      bolsters' orange in the dry season (`#day=`), the ragbark's drop, the page's size (7.6 MB: eastabyss's and the e highlands' packs).
    - The owner's answer 4 (PLAN-LANDS.md section 14, 2026-11-08): yes, the abyss's lineages as fire-hardened relics, the highlands' pull
      fading west, the glass wand and Fridon's wormwick trade (LORE.md section 8) go in. Answer 5: Talia is in the e rim's climate; the
      owner will redraw `e savannah rim` on the map to take Talia (px 801,609), and the e rim's station sites and Talia's ground follow the
      redrawn polygon (not done: the map is not redrawn yet; `erim` stands near Fridon as built).
  - **J6, the se rim, the incense country** (`--station serim`, `dist/abyssal-savannah-serim.html`; `src/rim/56`, `src/rim/87e`): the zones from the Bowl's side to the
    wet face along the rise: incense trees and rain roses (on the kopjes) on the dry slopes with the Bowl's cardon and candelabra by reach
    (H1); rain bottles and rain dragons over the red oat grass; the rust miombo woods on the laterite; cloud avocados (their moss on the
    giant's side, H4: `BIO.GIANT`) and leaning tree ferns (`BIO.leanTo`, all tipped toward the giant) at the wet face's foot; the drylands'
    frill-tree and prism mallee by reach near Pylon (the west). 9.4M triangles, 339 calls at the default camera on the CPU load.
    - **The rust miombo is defined here** (`SAVRIM.builders.rustmiombo`, `BIO.kitBuilder('savannarim', 'rustmiombo')` for Godstep's redlands
      station): its crown on its own leaf material with the dry-season drop and the copper flush at the rains' start (H7: core/biome 30s,
      core/clock's flush, `BIO.bindFlush` in 99).
    - **The red guyed stalk is Godstep's** and Godstep has no kit yet (`biomes/godstep` holds only its PLAN.md): its row here is a reference
      (`kind: 'ref'`), none is drawn in the laterite's gullies until Godstep's D3 builds it; then this page reads it in place.
    - **Page-local, the neighbours' builders:** the Bowl's dragon, rose and bottle hang their strap tufts and blooms clear of their limbs at
      the rim's sizes; here they are held to the nearest limb (`held` in `src/rim/87e`: the builder's draws in its own order, only those cards
      moved); the drylands' `CRATERDRY.ageAt` (its own fire history, not on this page) is the page's burn age.
    - **For the GPU verify:** the copper flush (set `#day=` to the rains' start), the zones' sequence (views "The incense country", "The rust
      miombo", "The wet face's foot"), the rain bottles' size against the gate baobab, the page's size (7.9 MB: the Bowl's and the drylands'
      packs) and its triangles (9.4M of the 11M budget).
    - **Stand-ins:** the rust miombo's and the incense tree's leaflets are painted (card.leaf.miombo owed; PROMPTS-NEEDED.md section 40), the
      leaning fern's trunk and the miombo's bark vertex colour; the incense bark is the library's bark.paperbark (`incensebark`).
    - The owner's answers (PLAN-LANDS.md section 14, 2026-11-08): 6 yes (the rust miombo defined here and read by Godstep's redlands, the
      red guyed stalk Godstep's); 5 no incense or dragon's-blood trade for Talia (incense and dragon's blood stay the se rim's, the Bowl's
      lineage; LORE's "Talia's resins" was left out of the merge).

## Done

- [x] 2026-11-03, the final rebuild (pair 8): the universal set (PLAN.md section 11); the attach audit 28.39% -> 0.00% (software GL, `verify.py --assert`; a twig to each hero clump, mid clumps held);
      the textures `ground.savanna.litter` and `card.grass.thatch` were delivered and wired on 2026-10-26 (the open item was
      stale); the cycad frond's card is cut and based at its bottom (`check_cells.py --fix`: `cell`, `base: bottom`), not judged
      by eye; `PORT.md` written by `tools/audit_port.py`.

- [x] 2026-10-26: station 1 built to the plan's S0-S4 (`NOTES.md`).
