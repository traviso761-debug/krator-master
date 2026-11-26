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

## The catch-up pass (2026-11-03)

The owner asked for nwbay to be brought up to what landed on the core and the map after its pair-1 turn (`HANDOFF-REBUILD.md`, the owner's
decisions of 2026-11-03: limestone caverns at its next rebuild; `BACKPORT.md`'s universal set; map 5.1). Branch `claude/nwbay-catchup-cloud`
from `claude/biome-rebuild` (ffe594f9a). Built in a cloud session with no GPU: `verify.py --assert` passes on both pages under software GL (the showcase
triangles OVER 10 M, a warning: the joints; `HANDOFF-REBUILD.md`, nwbay's catch-up paragraph, has the numbers). The GPU run is the coordinator's. **Species: none added, removed or re-keyed; `NWBAY.SPECIES` keeps its 20 keys and indices.** Every look
change in the fragments k-guilin reads (`50`, `55`, `56`) is on only where nwbay's host asks (`NWBAY_LOOK.joints`, `NWBAY_LOOK.holds`), so
k-guilin draws as before until its turn (its page's text moves by the source bytes when it is rebuilt; a scratch build of it passes).

### The caverns station (`python3 build.py --station caverns` -> `dist/nwbay-caverns.html`)

**Why a station, not the main page.** The owner said "maybe as a new station". A station: (1) keeps the main page's budget (it stands at
9.7 M of 10 M triangles and 271 of 300 calls in its showcase); (2) keeps the main page's ground as it was: the karst's dolines reshape the
ground over the cave (50 bowls), which would move every plant standing on them; (3) lets the cave mesh lazily near the eye, which a
page judged by fixed views does not want. It is the main page's `src/` plus `stations/caverns/` (oidong's station pattern in `build.py`), so
the bay, the sinkholes and the flora are the same page's; folding it into the main page later is one flag (`NWBAY_KARST` defined there).

| Part | What | Where |
|---|---|---|
| The network | `KKARST.network` with site 1's bay call (`biomes/KARST-SITES-5.1.md`): `level L - 25`, `table L + 1` (L = 0, the sea), sinks every 150 m (p .5), gradient .006, chambers p .25 (8-22 m, 5-14 m high), thin 10. Box x -1150..1250, z -450..1400 (2.4 x 1.85 km: the three sinkholes, the shore, the spring), one system built once. 1,060 passages, 1,052 of them sumps: the karst is drowned | `stations/caverns/44k-host-karst.js` |
| The spring | a shore resurgence at the foot of stack 6 (the shore tower SW of the mouth) at the waterline, where the site puts the bay's springs: a riser from the network to under a spring pool on the beach, its boil and run into the bay (`WATER.karstSpring`, core/water ext/54) | `44k`, `89x` |
| The plain's branchwork to the shore | the owner's line says "the plain's branchwork draining to the lake shore": the plain and the lake are k-guilin's (the site's first call). nwbay's page has no lake: its branchwork drains to the bay's shore (the site's second, drowned call). **For the owner:** if a lake-shore spring was meant on this page, it has no lake to put it by | `44k` |
| The tiankeng | the page's hole is kept and the network runs under it (the site's second choice). Its alcove nearest the spring's bearing (45's alcoves, hashed the same way) is the mouth of a river passage that spirals a quarter turn round the tiankeng, a vadose canyon where it runs over the table, down into **the old river chamber under the floor** (34 x 28 m, 22 m high, its crown 8 m under the breakdown: the hall the roof fell into), and a sump on to the network | `44k`, the wall cut in `89x` |
| The cenotes (the two flooded shafts) | a **flooded chamber** under each bed (12-18 m, 8-12 m high), a shaft through the bed (the bed's middle fan cut out), a sump to the nearest node | `44k`, `89x` |
| The surface | the sinks kept on dry land off the page's features (the river and its terraces, the tsingy, the stacks, the lava, the basalt, the shelf pools, the sinkholes; a sink under the sea is dropped, its passage kept) with their dolines on KRELIEF (`KKARST.relief`, kind `doline`): 50 bowls, no cenote-form doline (no chamber's roof is thinner than 10 m) | `44k`; the stage's `groundBase` hook (`45`) |
| The drawing | one `KCAVERN` (1 m cells, 16 m chunks) over the page's own ground (`groundH`); the sinks' wells left out (the page's 11 m ground is not cut there: the shafts reach up under it). **KCAVERN has materials for basalt and tuff only**, so the rock is drawn here in the library's karst limestone (`rock.wall`); a vertex's sky (its depth under the ground) scales its direct and ambient light, and a lamp at the eye comes on underground. The chunks near the views are meshed at load (460), the rest near the eye, four a frame | `89x` |
| The dress | `KSPELEO.LIMESTONE` in the chambers and along the tiankeng's passage: 220 speleothems (dripstone, straws, curtains, flowstone, rimstone), drowned with the rest under the table | `89x` |
| The water inside | a still at the table where a passage or chamber crosses it (the face of a sump) | `89x` |
| Sumps are roads | every `drown` record of `KKARST.hazards` (1,074) is registered with `tags.road {for: ['water-breathers'], people: 'Hykkousoi', kind: 'sump'}` and its hazard's `spares: ['water-breathers']`: a hazard to a land-breather, the water-breathers' road. **core/hazard keeps only the fields it knows**: `KHAZ.make` drops `spares`, so a reader takes the road from `tags.road` beside the hazard. A `spares` (or `breathers`) field in core/hazard is the owed core item (`KARST-SITES-5.1.md`, "Notes for the module", proposes it); not done here because it reaches every page that takes core/hazard | `89x` |
| Records | the cave system and every chamber (class feature, kind `cave`), the hazards (sumps, shafts; a cenote's shaft is under its pool, a swim, not a fall) | `89x` |
| Views | the tiankeng's cave mouth, the river passage, the old river chamber, the cenote's flooded chamber, a drowned passage, the shore spring, the karst from above | `89x` |
| Checks | one system draining to the spring; a cave under the tiankeng and under each cenote, joined; every drown record a road (with a negative); the dolines on dry land; the cave drawn | `89x` `STATION_CHECKS` |

The eye may go down into the voids (`KHOST.take`'s `clampCam`: in the open and under the ground it is not lifted); elsewhere the page's own
floor holds it. The stage's hooks for a station (`99-host-take.js`): `STATION_VIEWS`, `STATION_CLAMP`, `STATION_CHECKS`; `45`'s
`NWBAY_KARST`. Switches: `?caves=lazy` (nothing meshed at load), `?speleo=0`, `?spring=0`.

### The rock (map 5.1: `kits/resources/REBAKE-PLAN.md`, `ROCK-PROPOSAL.md` "Where the biomes must change")

`src/44n-host-geology.js` (`NWBAY_GEO`, `[G data]`) holds what the 5.1 geology says at the page's anchor; `tests/test-geology.js`
recomputes every number from `kits/resources/data/geology.json` (node: `node biomes/nwbay/tests/test-geology.js`) and fails when the
data moves.

- **The anchor:** 5.1 px (757, 749), chosen where the page's own layout matches the data (a carbonate cell, the sea beside it to the S and
  SE, volcanic ground 4-8 km E across the water). KARST-SITES' (700, 800) fits the tsingy's dry climate but reads no marble, no tuff and
  no node in the page's box. Province carbonate, limestone 230, marble 207, tuff 0; the tuff (93-170) lies on the volcanic ground to the E.
  The NW bay polygon: water, carbonate, sedimentary, volcanic, impact, evaporite, granite (in that order of area).
- **The white marble band** (`?marble=0` off): a KGROUND layer (`groundMarble`, `rock.marble012`) on the limestone at the page's own
  volcanic contact, the outer margin of each old lava tongue and the basalt headland, and an outcrop (46 m) round each of the two marble
  nodes the field puts in the page's box. The stacks stay limestone.
- **The ash soils** (`?ash=0` off): a KGROUND layer (`groundAsh`, the delivered `ground.ash.soil`, untinted) on the volcanic ground itself (the old
  tongues, the basalt): at this anchor the tuff reaches none of the limestone. The andosol set came in the 2026-11-03 delivery (`core/materials/PLAN.md`, "Delivered 2026-11-03").
- **The nodes** (5 in the box: copper 1, sulfur 2, marble 2, from `KRES.nodesIn` at the anchor, not invented): each a core/tags record (kind
  `resource`, its field id) where it stands on dry ground. No node model is drawn (kits/resources' defs are not on this page).
- **Map 5.1's stations list** (`biomes/STATIONS-MAP-5.1.md`) flags nothing for nwbay; it quotes no river by name (the region's frozen
  river is r243, the **Stahr Rhyver**: a name for the page's river, if the owner wants it).

### The universal set (`BACKPORT.md` section 1 and 5), against what pair 1 had

| Item | State | Switch |
|---|---|---|
| `BIO.flareJoin` on limb joints | every bough, secondary branch and wand drawn by `BIO.tube` in `55` (16 calls), with its parent's radius; not the trunks, roots or B14's jointed stem (they rise from the ground) | `?joints=0` |
| `BIO.holdTo` (the attach audit's "jitter off a spot") | every bloom held within .3 m of the axil or tip it was scattered round; the umbrella thorn's crown clumps held to their boughs' ends (they were drawn at the crown's top, metres over wood that ends lower) | `?holds=0` |
| `onLeaf` | `bloom` (a flower inside a leaf card's body counts as held: audit only) | none |
| The attach audit | **was never run on this page**: nwbay's `verify.py` did not call `hostChecks`, where core/host puts the guards. It does now. Before the holds 8.56% (993 of 11,598; leaflet 656, bloom 224); after: `HANDOFF-REBUILD.md` | |
| `BIO.impostor` | taken at pair 1 (octahedral impostors for the far trees) | `?diet=0` |
| `WATER.mirrorSwitch` | on the bay (level 0, the largest still), **off at load**; the panel's "reflections" button | `?mirror=probe|live` |
| The plume (ext/61, `tintFlow`) | the travertine river's milky green carried out from the mouth into the turquoise bay over ~700 m (xanadu's shape) | `?plume=0` |
| `breakers:false` | **not taken on the bay**: it is a sea, and the rule keeps a sea's breakers. The bay's shore grid floods from its middle over `groundH`, which has no stacks in it, so the stacks are not islands to ring. For the owner's eye on the GPU: `?breakers=0` draws it without them | `?breakers=0` |
| `KSHADOW` | attached after every placement and **switched off at load** (the owner: toggleable, off by default); the panel's "shadows" button or `?shadow=1`. The on/off switch is core/shadow's own (`H.on()`, `H.off()`): no core change | `?shadow=1` |
| `KHOOK.warp` | **not taken**: `KWARP` is the Bend's warp (Ancient's Valley, `core/shader/README.md`); the page's one Ancient structure, the ruined Girder tower, stands in no Bend | |
| `KSTRATA`, `KGROUND`, `KFAR` | current files, read by name as before (KSTRATA's `nwbay-karst`; KKARST adds its own `karst` recipe on the station only) | |
| A fix on the way | the sinkholes' lip took `MAT_GROUND.onBeforeCompile`, which is KHOOK's composite once a layer is on: it compiled the ground's cloud shade and then its own, whose anchor was gone (`shader-programs`: `atmos-cloudshade-0.6: #include <lights_fragment_begin>`, and a dead frame wherever a lip was in view, the baseline's one failure). It takes the ground's own hook and `KHOOK.copy` now | |
