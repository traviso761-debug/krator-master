# biomes/nwbay: plan

## Core adoption (the final rebuild, 2026-10-27)

The kit's turn in the all-biomes rebuild (`HANDOFF-REBUILD.md`, pair 1 with eastabyss; `BACKPORT.md` section 1, nwbay's row and
section 5). nwbay is a vendor: k-guilin reads `50`, `55` and `56` in place (`NWBAY.make`, `NWBAY.plantTrees`), so every look
change in those fragments is on only where nwbay's own host asks (`NWBAY_LOOK`, `NWBAY.IMPOSTORS`); k-guilin's page draws as before
until its own turn. No species was added, removed or re-keyed: `NWBAY.SPECIES` keeps its 20 keys and indices.

Taken, each with its switch for the owner's look pass (`?x=0` turns it off):

| Item | Where | Switch |
|---|---|---|
| `BIO.INDEX_ITEMS`; `BIO.LOD.merge/minTris/fade/cull` | `45-host-stage.js` | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| Octahedral impostors for the far trees (`34-core-impostor.js`, one set of 20 species), `BIO.impostorLook` gain 2.2, full wrap | `56` `plantTrees`, `88-host-build.js` | `?diet=0` (the blobs), `?impgain=`, `?impwrap=` |
| R8 wind (`BIO.bindAtmosWind`), R7 alpha-to-coverage | `89a-host-atmos.js` | none (nhighlands' defaults) |
| R9 wet ground and puddles (`WATER.hollows`, `WATER.wetGround`) | `89a-host-atmos.js` | `?wet=0` |
| R1 height fog, the sea fog (`ATMOS.fogBelt`, 0-60 m, windward the SE), R10 rain cover, lightning | `89s-host-sky.js`, `build.py` | `?hfog=0`, `?seafog=0` |
| Back-light on the broadleaf cards, R5 the floor's root in the ground's colour, H7 the dry season (`BIO.bindSeason`, grass yellows, acacia leaflets thin) | `50` (`NWBAY_LOOK`), `88`, `99` | `?backlit=0`, `?rootcol=0`, `?season=0` |
| `BIO.fung.bracket` for the bracket fungus (TODO.md's fungoid list), turned to face its wall | `50`, `65` | `?fung=0` |
| KSTRATA: a `nwbay-karst` recipe (thick grey limestone beds, marl partings, iron bands) on the stacks' and the sinkholes' walls | `45` | `?strata=0` |
| `KSTACKS.weather` on the drawn stacks | `45` | `?weather=0` |
| KGROUND: four library layers by zone (mulch, beach sand, black cinder grit on the black beach and thinly on the old lava, white travertine; `materials.json` groundLitter, groundSand, groundLava (`ground.cinder`), groundTrav) | `45` | `?kground=0` |
| The lava tongues are OLD flows (the owner, 2026-10-27: too far from the volcano for fresh rock): the paint a dark weathered soil under the mulch, the boulders weathered grey-brown basalt, and an understory pass of its own (shrubs, frond shrubs, young splay trees, ferns, grass; drawn last on its own seed, so nothing before it moves). The old pass's cinder cushions are smooth domes up close: a later pass could give them a leaf card | `45`, `60` | `NWBAY.LAVA_UNDER=false` (no understory) |
| The columnar basalt's edge (the owner, 2026-10-27): over the outer half of the headland the columns step down to stubs, thin out and lean; the rim weathers paler and mossy; fallen pieces lie past it; paler weathered caps. The page's random draws are kept | `45` | `?basaltedge=0` |
| KFAR: the far country on the lattice (50 m cells to 3.5 km, 6% wider to 13 km, curvature, crest pass) | `45` | `?kfar=0` |
| KHORIZON: terrain shadows over the map and the far lattice | `88` | `?horizon=0` |
| Water: the falls' plunge discs inside the pools' banks, fading out over 70 % of their radius (core/water ext 53/53b `plungeR`, `plungeFade`, new and opt-in; the owner, 2026-10-27), and lit (a core fix: the merged discs had no normals and drew dark grey); rain rings on every water, curtain margins and side fades (W1), per-pool gradients on the terrace and shelf pools (W4), comb-weed in the lowland reach (`ext/54` `W.weed`, look `clear`) | `89w-host-water.js` | `?poolgrad=0`, `?weed=0` |
| Card fit: `check_cells.py --fix` (19 slots: bases, tight cells, crown stems; hanging cards one strand, base top) | `materials.json`, `tex/pack.json` | none (approved by the owner) |

Dropped, and why:

- **A runtime range on the heroes** (`NWBAY.LOD.tree`, the impostor standing in past it): nwbay's heroes are ~210 variant items, and
  keyed by chunk each splits into a mesh a chunk (909 draw calls against 230, measured). The heroes keep the spine's static radii;
  `?herorange=800` turns it on to compare.
- **`KSTACKS.contour`**: its profile and joints move a face by metres, and the cliff figs' curtains and the rock figs (`55`, `57`) hang on
  the record's walls (`KSTACKS.wall`). It needs those plants moved onto the drawn mesh first.
- **KCARVE cave mouths**: KCARVE cuts a mouth into a heightfield hillside, and nwbay's ground has no scarp; its cliffs are the stacks'
  and the sinkholes' meshes. The stacks' caves stay the design task `KNOWN_ISSUES.md` names (Ys builds its own).
- **Kelp beds**: `W.weed` lays blades down a flow line; the bay is open water with no line. A bed kind for open water (seagrass, kelp)
  would be a new core kind.
- **Confluences and tall falls**: the river has no tributary, and its risers are 5 m steps (the terraces' own falls).
- **Spray by drop**: the page has no core/atmos particles (`ATMOS.smoke`).
- **Leafset (`31b`)**: the crowns' clumps take the card fit's `stems` instead (the owner's rule of 2026-10-27).
