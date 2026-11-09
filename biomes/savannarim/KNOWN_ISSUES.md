# Krator biome kit — the savannah rims: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **J2-J6 (2026-11-08): the kit, built in a cloud session on CPU checks only** (`biomes/hyperjungle/PLAN-LANDS.md` section 13). Checked
      here: every page builds (`tools/build.py`), the lints pass (`check_core_use`, `check_assembly`, `check_port`, `check_source`,
      `check_cells`), and each page was loaded in Chromium on SwiftShader (no GPU) with its host checks, negatives and the core guards (the
      card guard, the attachment audit, one LOD key a tree) all passing. **Not checked: `verify.py` (none is written yet: the next session
      writes it on the shared harness, `tools/harness.py`), the look, the frame time, the draw calls past the default camera.**
  - **J4, the base and the north savannah** (`--station north`; the base also on station 1's map):
    - The base: red oat grass (`SAVRIM.grass`, by the burn's age: none on this season's ash, full from three years), blind grass
      (`SAVRIM.blindGrass`, with the raiders' lanes), the fan palm, the umbrella thorn, the gallery forest (the hyperjungle's six at 0.3-0.5
      of their size, its screwpines and gingers), the monsoon kapok and gate baobab outliers (the hyperjungle's, bare in the dry season:
      `HYPERJUNGLE_LOOK.deciduous`), the termite cathedrals (KSTACKS.mounds, H10, on earth.termite), the burn mosaic (KFIRE, H3: ages in
      every band, none in the gallery, the dambos or the river), the dambos' green, the seasons (H7: `BIO.bindSeason`).
    - The north: blind grass to the horizon (316k tussocks against 89k red oat), the hyperjungle's bone giants (106) and bloodwoods (114)
      read in place, its jungle's roof to the west past the map.
    - Measured on the CPU load: station 1 4.7M triangles, 179 calls at the default camera; the north 4.7M, 196 calls. The grass items carry
      instance caps with `capWhy` (red oat 700k, blind grass 900k): the savannah's grass is the page.
    - **The umbrella thorn is the kit's own** (`55`: the hyperjungle's shared tree), not swbay's read in place as PLAN-LANDS.md section 4
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
      `savannarim`: PLAN-LANDS.md section 8), a `verify.py`.
  - **J5, the e rim** (`--station east`; `src/52`, `stations/east/`): the old lines, seven cousins by BIO.kin of eastabyss's and the e
    highlands' builders read in place (the e highlands' registry is `ehigh`, so `ehigh.vigil` etc.): fire scale-trees on the old burns,
    the monsoon cycads flushing on burns 1-5 years old (brighter the younger), dambo horsetails, ember spikes (flowering on this season's and
    last year's burns, spent torches to three years: `EHIGH.vigilStage` wrapped on this page), monsoon ragbarks (deciduous), bolsters and
    glass wands on the ironstone; the comb tree and the elephant ear from the savage land by reach (H1, `LAND.home`), the abyss's horsetails
    and cycads thicker eastward. H4: `BIO.setGiant(66)` with `EHIGH.setGiant(BIO.GIANT_AZ)`, the pull a share of each cousin's lean fading
    west (measured: the ember spikes' mean lean east 2-3 times the west's). 8.1M triangles, 288 calls at the default camera on the CPU load.
    - **Page-local changes to a neighbour's items** (the source pages unchanged): ehighlands' `rag` and `cushion` materials take the season
      (H7: the ragbark drops, the bolster turns orange; `turn()` in `87e`), its `spire` item draws on a solid (the hyperjungle's `G.smat`)
      so the attachment audit sees what holds the florets (on its own leaf material the florets read as floating: 6% of the cards), and
      `EHIGH.vigilStage` keys the flowering to the burns. Worth taking back into ehighlands at its next turn (its spire as structure).
    - **For the GPU verify:** the lean of the spikes and ragbarks (view "Toward the giant"), the cycad flush's green against the char, the
      bolsters' orange in the dry season (`#day=`), the ragbark's drop, the page's size (7.6 MB: eastabyss's and the e highlands' packs).
    - Taken as proposed, owner to confirm: PLAN-LANDS.md section 14 question 4 (the abyss's lineages as fire-hardened relics; the
      highlands' pull fading west; the glass wand and Fridon's wormwick trade: LORE.md section 8, a proposal).
