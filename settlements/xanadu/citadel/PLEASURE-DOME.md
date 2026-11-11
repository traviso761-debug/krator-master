# The Pleasure Domes, built (2026-11-09 and 10)

**Read this first (2026-11-10, after the merge with the citadel).** Three sessions changed Xanadu and Erewhon, and the owner
asked for ONE rebuild after their merge, so this branch carries sources, docs and pictures only: no built page. The checks
below were run on local builds; "What the combined rebuild must verify" at the end is the list for the session that
rebuilds. Since the first record: both domes take the style with a BALANCE (the citadel's black over white, the Bay's white
over black); the Dome of the Bay is hollow too; the domes outside are the kit's turquoise again (the owner); the Dome's
site is pinned among the citadel's new buildings.

The interior of `xa_pleasure_dome` ("Garden Pleasure Dome", `kits/xanadu/src/78-xa-palace.js`), in Erewhon's citadel. The
brief is `refs/pleasure-dome/STYLE.md` (the owner's twelve references: 01 to 07 on 2026-11-09, 08 to 12 on 2026-11-10); the
plan is `BLUEPRINT.md`, sheets E3 and E4. This file records what was built, how it was checked, and how it stands against
the references. The Sultan's palace, the Vizier's palace, the Dome of the Bay and the rest of the citadel are untouched.

## What is where

| File | What |
|---|---|
| `kits/xanadu/src/78a-xa-pattern-data.js` | [G data] `XPAT`: the two stones and gold, each pattern's sizes, each kind of room's dress, the arch curves, the Greek key |
| `kits/xanadu/src/78b-xa-pattern.js` | the patterns as world-aligned materials, their kit items, the reusable helpers (`xpBox`, `xpVoussoirs`, `xpSpandrel`, `xpOrders`, `xpTunnel`, `xpGoreDome`, `xpShellDome`, `xpRings`, `xpRunner`, `xpBalustrade`, `xpChandelier`, `xpPlanter`, `xpOrb`, `xpBlackCol`, `xpTable`) |
| `kits/xanadu/src/78c-xa-dome-plan.js` | [G data] `XPDOME`: 31 rooms and 51 openings as records in the def's frame; `xdomePlan()` works out the 125 wall segments and the 190 windows the outside walls get |
| `kits/xanadu/src/78d-xa-dome-in.js` | `xdomeBuild`: draws the plan; writes core/walk and core/door; `xdomeReach()` the audit; `XA_CUT` the cutaway's unit |
| `kits/xanadu/src/78-xa-palace.js` | `buildXaPleasureDome`: the precinct, garden wall, gate, chahar bagh, roof kiosks; calls `xdomeBuild` |
| `kits/interiors/sets/xanadu.js` | the Dome's item: 21 explicit rooms for the furniture (`?interiors=1`) |
| `settlements/xanadu/targets/erewhon/87-er-layout.js`, `91z-views.js` | the site enlarged to 106 x 112 (14 x 14 garden cells); eight preset views, "Pleasure Dome — ..." |
| `settlements/xanadu/src/99-start.js` | the cutaway takes `XA_CUT` (X on the Dome: ground, upper, the clerestory and drum) |
| `kits/xanadu/materials.json`, `settlements/xanadu/materials.json`, `tex/xMarble.albedo.webp` | the vein map (`rock.marble012`) |

## The building

The precinct is the blueprint's 105 x 110 m inside the tiled garden wall. The frame is the def's: +x east, +z south (the
garden gate). Floors: ground 0.3 m, upper 8.3 m, the wings' ceilings 14.8 m, the hall's aisles 16.3 m, the clerestory to
24 m, the drum to 28 m, the dome's crown about 42 m inside and 43 m outside.

- **The Hall of Feasts** (E3.4; 40 x 40 m): a 28 m square under the dome, arcaded on four faces in two tiers (horseshoe
  arches below, round above, on banded piers 1.6 m square), 6 m aisles with the gallery over them on three sides (E4.2)
  and a double-height bay on the north; a chevron clerestory with five windows a face; a banded drum of twelve windows; the
  dome in 32 gores, black and white alternating, gold ribs, a glazed oculus. The floor is 24 concentric rings, each a hair
  above the last (the Sultan's dais at the centre), stripes in the aisles.
- **The checkered door** (E3.17, the North Door of the Golden Way): eight receding orders from an 11 m arch down to 4 m,
  every voussoir and jamb block a check, then a checkered barrel 11 m long to the litter-wide door; a Greek-key runner; the
  white marble table set before it (reference 01).
- **West wing**: the Cage of the Princes, the Valide's court (open, crazy paving with gold joints, a fountain, four trees
  in black planters) and her apartments, the consorts, the hospital; above them the cage's upper rooms, the Valide's
  upper rooms, the favourites. **The rotunda** between the consorts and the hospital is new (the blueprint has only the
  two gallery stairs): a 14 m drum banded floor to vault, a spiral stair of 48 black treads turning 250 degrees with white
  balusters and a gold rail, a gored vault, a tall west window, a chandelier (reference 05).
- **East wing**: the eunuchs' court (open) and dormitory, the school, the concubines' dormitories, **the stair hall**
  (new: one flight of 48 black treads between white balustrades, black columns under gold capitals, a skylight in a gold
  frame, trees in black planters, crazy paving: references 04 and 12), the baths' warm and hot rooms, **the great pool**
  (double height, checker everywhere, banded columns, three gored domes with gold bosses outside); above: the eunuchs,
  the Mistress of the Harem, the concubines, the rest rooms looking down on the pool.
- **North range**: the Hall of the Musicians and the kitchens either side of the checkered door, each with a gallery stair
  (four flights round a banded pier); the treasury; above, the musicians' box and the confectionery stores, each with an
  open balcony onto the hall.
- **Outside**: whitewash under a gold frieze and parapet, the mosaic drum, the turrets, the kiosks on the roofs. Since
  reference 08 every window has a black glazing bar (the reference's black gored domes under gold ribs were built and then
  put back to the kit's turquoise at the owner's word, 2026-11-10: `XPAT.dome = 'B'` brings them back), and black spheres on white fluted
  pedestals flank the hall's garden door. Variants 1 and 2 keep the kit's gilt and mosaic domes.
- **The balance** (the owner, 2026-11-09): the citadel's Dome is black over white, about two to one (`XPAT.balance.citadel`
  0.667): black courses twice the white ones' height, more black pieces in the paving, the private floors black with white
  diamonds, voussoirs, rings and gores two black to one white. The checker stays even, and the checkered door keeps its
  one-to-one checks.

## The Dome of the Bay

`xa_pleasure_dome_bay` (`87c-xa-erewhon.js`; `xbayBuild` in 78d), on Erewhon's island: the same helpers, WHITE over black
(`XPAT.balance.bay` 0.34), under its own skylight. The pavilion keeps its stepped platform, colonnade, gilt architrave and
turquoise dome; the solid drum is now a rotunda 27 m across and 8 m to the springing: 24 banded panels, eleven arched
windows with black bars, the black lacquer door to the dock (unlocked); a floor of 14 rings round a white-rimmed pool; a
Greek-key runner from the door; eight black columns under gold capitals; four trees in white planters; black orbs on white
pedestals outside the door. The dome is 32 gores: turquoise tile and GLASS by turns, the tile gores white inside with a
black one in four, gold ribs inside and out. The "caves of ice" sky sphere that stood inside the old drum is gone. The
platform, the flight and the rotunda are in core/walk; its cutaway unit and three views ("Pleasure Dome of the Bay — the
rotunda / under the dome / from the dock") are on `XA_CUT`. No catalog furniture: its set item is a skip that says so.

## The pattern system

Two stones and gold. `XPAT.pat`: `band` (0.5 m courses up a wall, stripes on a floor), `bandFine` (0.3 m), `checker`
(0.6 m), `chevron`, `pave` (crazy paving, gold joints), `op` (the op-art wallcovering), `diamond` (white with a small black
diamond: the calm floor of reference 09), `key` (the Greek-key runner) and `solid` (one stone per instance). The first
seven are WORLD-ALIGNED: the stone of a point comes from where it is in the world, so a course runs unbroken round a wall,
its piers, a drum and a column, and nothing slides when a block is resized. The arches (three curves: round, pointed,
horseshoe), voussoirs, orders, gores, rings and treads are geometry, one kit item each, instanced. `XPAT.room` gives each
kind of room its dress (STYLE.md rule 4): great, court, stair, passage, bath, private, service.

For Godot: 78a and 78c are plain data and pure functions; each pattern kind is one small fragment function of world
position (a `.gdshader` each); the walk, door and glass records are core's.

## Checked (cloud: Chromium on SwiftShader, no GPU)

**After the merge (2026-11-10), one local build of Erewhon, not committed:** error panel clean with the citadel's ten pinned
buildings and the Dome at [-344, -152]; `xdomeReach`: the citadel's Dome 78 of 78 floors, the Bay's 4 of 4; the citadel's Dome
186,272 triangles (231,464 before the savings), the Bay's 27,652 (15,706 solid); the scene 20.70M of 25M triangles, 1107 of
1800 draw calls at the opening view. Looked at: the Hall of Feasts (black over white), the Bay's rotunda and its dome from
below. Lints (`check_source`, `check_port`, `check_core_use`): nothing new. NOT run after the merge: `verify.py --assert` on
either page, the kit's sheet, `test_all.py` (the combined rebuild's job). The table below is the first Dome alone, before
the merge, at an even balance.

| Check | Result |
|---|---|
| `python3 verify.py dist/erewhon.html --assert` with the seven "Pleasure Dome — ..." views | exit 0; error panel clean; every invariant PASS; eye checks clear at all seven views. Scene 21.26M of 25M triangles (21.39M before: the larger Dome took 52 garden tiles' place), 1083 of 1800 draw calls at the opening view (1047 before); worst inside view (the sweeping stair) 1026 calls |
| The Dome itself | 231,464 triangles in Erewhon, 11,496 instances; on the kit's sheet, with each variant's own garden, 239,124, 229,124 and 221,684 of the sheets' 250,000 a def (close to the cap: a new feature has to pay for itself) (the old solid Dome: 29,164 and 736). Everything is instanced kit items: one draw call a pattern, a chunk |
| `xdomeReach(0)` (core/walk's `KWALK.reach` from inside the garden gate, the Dome's doors open) | 78 of 78 floors and stairs reached: both storeys, the gallery, every landing |
| core/door | 29 door records, unlocked, black lacquer leaves (E opens the one in reach); the garden gate's two stay locked |
| Glass | 241 KGLASS panes (windows, door heads, the clerestory, the drum, the skylight, the oculi) |
| `python3 verify.py dist/interiors-sets.html --sets --assert --query set=xanadu` (`kits/interiors`) | the Dome's item furnishes: overlap, door, clearance and reach ok. The run's one FAIL is `xa_workshop` (a counter that does not fit), not this work's |
| `python3 verify.py dist/xanadu.html --assert` in `kits/xanadu` (the kit's own sheet) | exit 0. Its `doors` check asserted every door locked ("every Xanadu body is solid"); the Dome is the kit's first hollow def, so the builder now declares its unlocked leaves (`window._hollowDoors`) and `kits/iziz-vernacular/sheet_verify.py` counts them: 683 doors, 596 locked, 87 unlocked in hollow defs |
| `python3 verify.py dist/xanadu.html --assert` in `settlements/xanadu` (Xanadu's sheet target) | exit 0, but only just: the sheet shows all three variants, and the scene is 5,988,213 of its 6,000,000 triangles (the three Domes are about 690,000 of them, where the solid ones were 87,000). The next thing added to that sheet will need the cap raised or a variant dropped from it |
| `python3 tools/check_core_use.py` | none new |
| `python3 tools/test_all.py --no-build` | 164 steps, 20 failed. The same 20 fail on the commit before this work, with two differences: `kits/interiors/tests/test-walk.js` now passes (its pages were rebuilt), and "page assembly" now fails on `kits/construction/dist/construction.html` (two kit bundles each bring the Ancients core: CLASH `_projectFire`, `onerror`, ORDER `KCITY`), which the check could not see before because the committed page was a Git LFS pointer. Nothing in the failures names a file of this work |

The full Erewhon run above (exit 0, seven views) was on the build before three last small changes (the vein mask's two
constants, the gallery view's camera, the line that declares the hollow doors). On the final bytes the error panel is clean and
all seven invariants PASS again (21,255,867 triangles, 1084 draw calls); that run's universal checks were cut off by a container
restart, twice in this session when a second browser shared the machine.

Not checked here: any GPU run (the cloud has none; no failure was GPU-only), `verify.py --interiors` on Erewhon (the town-wide
hollow-wall audit with `?interiors=1`), the Godot side, and the baseline (`PORT-BASELINE.json` and `DEPS.json` are untouched:
`tools/port_baseline.py` will report Xanadu's, Longsong's, the construction kit's and `kits/interiors`' pages as changed).

The Xanadu texture pack this branch carried (`dist/xanadu.tex.xanadu.js`, 27 KB) had been built from Git LFS pointers by an
earlier cloud session, so its surfaces were black; it is rebuilt from the real `tex/` here (14 MB), as are Longsong's and
the construction kit's packs.

Pictures (2560 x 1600, software GL), in `refs/pleasure-dome/built/`: `hall.jpg` (the Hall of Feasts), `arch.jpg` (the
checkered door), `spiral.jpg` (the rotunda), `baths.jpg` (the great pool), `gallery.jpg`, beside the references they answer. Those five are the first Dome at an even balance, under the black domes it had for a day. From the merged build (1280 x 800): `hall-black-over-white.jpg`, `bay-rotunda.jpg` (taken before its dome was opened: the dark top is the old cornice slab), `bay-dome.jpg`, `bay-dock.jpg`.

## The combined rebuild (2026-11-10)

Built once with the citadel, both Domes and the interiors merged (`ccr-55bd6ee1-p1si44-xarebuild`); Chromium on SwiftShader, no GPU.

| Check (the eight items below) | Result |
|---|---|
| 1. builds after `git lfs pull` of the `tex/` folders | Xanadu 121 fragments, Erewhon 122, the kit sheet 87; textures 169/169 decoded (235 with `?interiors=1`) |
| 2. `verify.py dist/erewhon.html --assert` | OK, error panel clean, no `citadel: no room for ...`, 1,108 draw calls at start. With `--interiors`: OK, 53,240 of 54,985 floors reached; 116 placements held inside the citadel wall (401 before: the citadel's own buildings and both Domes are no longer held) |
| 3. `xdomeReach` | the citadel's Dome 78 of 78, the Bay's 4 of 4, with and without `?interiors=1` (with the furniture on it read 72 of 78 at first: the set item's rooms, each a room's largest rectangle, walled the L-shaped rooms off in core/walk; the item now only furnishes, into a scratch walk registry, 89y) |
| 4. `window._xaDome`, `_xaBay` | rooms 31, segs 125, doors 29, unplaced 0, lib `rock.marble012`; the Bay's doors 1 |
| 5. the seam | the lots clear (the palace 2 m north; the Dome shifted 1.35 m south in its lot, its garden 2.5 m shorter: "The site among the citadel's buildings" above); the 18 m level step is recorded, not fixed (built since: "The Golden Way" below) |
| 6. budgets | the Dome 186,272 triangles a variant (v2 182,736) on Xanadu's sheet; the sheet 5,810,711 of its 6,000,000 (it was 9.53M with the citadel's nine buildings drawn at every variant: their builders read no `o.v`, so they are `nv:1` now, and Xanadu's sheet leaves them to the kit's own sheet, which takes them since this rebuild) |
| 7. `kits/xanadu` `verify.py --assert` | OK; doors: 849, 593 locked, 256 unlocked in hollow defs (the citadel's 78n now declares its leaves in `_hollowDoors` as 78d does) |
| 8. the views against the references | `refs/pleasure-dome/built/rebuild-2026-11-10/` (deviceScaleFactor 2, `?interiors=1`): the eight Dome views and the Bay's three frame as before (the views take the precinct's offset); the catalog furniture is back in the Dome's rooms (it had been held with the citadel); "from the garden" sees the shorter chahar bagh, the gate's wall 2.5 m nearer and the two front kiosks beside the parterres |

## Against the references

| Reference | Follows | Not yet |
|---|---|---|
| 01 checkered arch | receding orders with every voussoir a check, the checks carried down the jambs, banded wall round it, the white table before it, striped floor running into it | the voussoirs are boxes, not wedges: their outer corners overlap; the orders are round, the reference's slightly stilted |
| 02 banded nave | courses wrapping every curve (drum, rotunda, columns); the hall's concentric floor rings; glazed light from above (clerestory, oculus, skylight) | no tapering or curved plan: the rooms are the blueprint's rectangles; no cantilevered banded arc |
| 03 striped arcades | two tiers of arcades, every arch in alternating voussoirs, banded piers, chevrons where the wall meets the vault, arches seen through arches | no pierced white plaster tracery in the ceilings (the ceilings are chevron or band); the upper arches are round, not horseshoe |
| 04 crazy paving, stair, trees | paving of irregular black and white pieces with gold joints (courts, stair halls); a black stair between white balustrades; trees in black planters; a skylight | the balustrades are plain balusters, not pierced panels; the flight is straight, not sweeping in plan; the skylight is a rectangle, not an oval |
| 05 striped rotunda | banded drum, gored vault with gold ribs, spiral stair in black with white balusters and a gold rail, a chandelier, a tall arched window | one tall window, not a ring of them (the rotunda stands inside the wing); the stair's underside is stepped, not a smooth soffit; no chevrons on the drum |
| 06 Greek-key runner | gold fret border, black panels in gold frames between white bars: the north door's tunnel, the gallery, the hall's door | the fret is a simple interlocking key; the corners do not mitre |
| 07 op-art wallcovering | stripe bundles and half circles in 1.1 m cells on every private room's walls | the cells are picked by hash, not woven edge to edge as the reference's |
| 08 white palace, black domes | black gored domes under gold ribs, white walls, black spheres on white pedestals, black-leaved doors | no round windows; the door is a plain lacquer leaf, not a gold grille; the garden paving is the kit's |
| 09 black gothic hall | a black stair between gold rails, the diamond floor in the private rooms, galleries over arcades | no dark (black-ground) room; no iron-lace gallery fronts; no ribbed white vault |
| 10 black rib vault, tall windows | black glazing bars; white marble under the veining | one bar a window, no tracery; no rib vaults; the furniture is still the court set's colours |
| 11 stacked-slat arches | (the receding orders are its solid cousin) | no see-through slat arches |
| 12 black columns, gold stair | black columns under gold capitals down the stair hall, ring medallions at the stairs' feet | the balustrades are white with a gold rail, not gilt scrollwork; the medallions are rings, not starbursts |

## Deviations from the blueprint, and open points

- **Two stair halls are new.** The blueprint gives the Dome only the two 6 x 6 m gallery stairs. The rotunda takes 14 x 14 m
  from the consorts and the hospital; the stair hall takes a 12 m bay from the concubines' dormitories and the baths.
- **The baths' rest rooms** (E4.9) cover only the warm and hot rooms: the great pool is double height under its domes.
- **The eunuchs' upper floor** (E4.12) is over their dormitory only: E3 draws their court open, E4 draws a floor over it.
- **The north door** stood 2 m through the north garden wall (as E3 draws it, v 203 to 207); since the Golden Way (2026-11-10,
  below) it stands in the Dome's north face (z -53), the vestibule 13 m deep instead of 17, still 14 m wide to take the orders.
- **The Sultan's lattice box** (E4.2) is not drawn; the musicians' box is.
- **Furniture.** The kit draws the few objects STYLE.md rule 6 names (white tables and basins, black planters with trees,
  crystal, fountains, the heated platform), always. The manifest's pieces (`FURNITURE.md`) come from the catalog through
  the set item with `?interiors=1`, as everywhere in Xanadu, and are still the court set's own colours: recolouring them
  into the two stones and gold needs a tint in core/furnish's draw, which this work did not touch. The item's room kinds
  are the interiors core's (hall, bedroom, dormitory, school, bath, kitchen, store, study, living), not the blueprint's
  programmes (`feast_dome`, `harem_apartment`, `cage`).
- **Veining.** Both stones are one grey library marble read through the shader; the two real marbles are owed
  (`core/materials/PROMPTS-NEEDED.md`, section 41).
- **Water.** The pools are the kit's own water boxes (`xWaterB`, as every Xanadu pool), not `core/water`.
- **Trees indoors** are the Vale's whorl olive through `xaPlant`, about 3.5 m: its trunk is stout for a planter.
- **The site among the citadel's buildings** (the combined rebuild, 2026-11-10). Pinned 106 x 112 at [-344, -152] on the
  palace's axis, between the Vizier's lot (east edge x -401) and the guard's (west edge -286). The palace now stands 2 m
  north (the owner, commit 97282b12: its lot's south edge z -209, the Dome's north edge -208), so the lots no longer
  overlap. The Dome itself reached 1.33 m north of its lot (the North Door's range: the gold band, the wash, the door's
  leaf, z -57.33) and its gate 0.12 m short of the south edge. The precinct now stands `XPDOME.OZ` = 1.35 m south of the
  lot's centre (the def's frame moved as one: the group, the kit transform, VERN.cur; `xdomeShift`, 78-xa-palace.js) and
  the chahar bagh ends 2.5 m sooner (`XPDOME.GS` 52.5: the gate's wall, the fountain, the lamps, the walk floor and the
  cutaway box follow it; the two front kiosks moved in beside the parterres, x +-16, the wall's corners being the wings'
  now). The rooms keep their coordinates. Measured on the sheet (`kits/xanadu/tests/test-footprints.js`): z -55.98..54.73
  inside 112 m. In Erewhon that is z -207.98..-97.27: clear of the palace's lot (-209) and of the court temple's (north
  edge -97). The interior views (`91z-views.js`) and the furnished rooms (`89y`) take the same offset.
  **The seam with the palace: the Golden Way (2026-11-10, the owner's choice).** The citadel's ground gives the palace's block
  153 m and the Dome's 171 m (CIT_G levels each block at its cells' mean), so the ground stepped 18 m in the metre between the two
  lots and the North Door opened 18 m over the gate iwan, 1.3 m in front of it. The owner chose the Golden Way as a descending
  court; it is built (next section), and the step is now its masonry.


## The Golden Way (2026-11-10)

The owner's choice for the seam: the Golden Way (BLUEPRINT.md E0; principle 2, litter-wide) built as a court that descends the
18 m from the Dome's North Door to the palace. `kits/xanadu/src/78o-xa-golden-way.js` (`XGW`, `xgwPlan`: plain records; the
builder; `xgwReach`), read with the citadel's files by Erewhon's and the kit sheet's builds only (named in their `build.py`, not
in `xanadu.py`), so XAK, Longsong and kits/construction are unchanged. Placed by Erewhon on the
palace's block (`87-er-layout` GOLDEN_WAY, `90b`), its top the Dome's floor 18.3 m over it.

**Where it stands.** Neither lot has room for it: the palace's (to z -208, its back on the citadel wall) and the Dome's (from
-208, its gate against the court temple's lot) abut, and nothing can move. What is free is the slot between the two buildings'
faces, 7.45 m from the curtain's battered foot (z -211.4) to the Dome's north face (-203.95), 100 m long: the palace's apron
before its curtain and the Dome's garden margin inside its north garden wall. The Way takes that slot, x -391 to -293 (the
palace's front towers close it at both ends), and the ground there is cut to the palace's level (the terrain's 4 m vertices
chosen so the Dome's garden walls keep theirs; the grid's retaining wall across it is left out).

**What moved.** The North Door: the vestibule's 2 m tunnel through the garden wall stood 0.4 m from the gate iwan's face, so no
court could open before the iwan. It moves 4 m in, to the Dome's north face (z -53): the vestibule keeps its checkered orders
and barrel, 4 m shorter (`XPDOME` patched in 78o; while the Dome builds, the barrel, its runner and its roof are cut back to the
face). Where the Way is built (`o.gw`, Erewhon) the north garden wall's run east of the vestibule gives way to the Way's upper
lane. No room of either building changed; the postern did not move.

**The descent, from the top** (103 risers of 0.173 m, treads 0.32 m; levels over the palace's block):
1. the North Door's balcony at 18.3 (the Dome's floor), 2.4 m deep along the Dome's face, two black orbs on white pedestals by
   the door (ref 08), carried over the gate court on one pointed arch of black and white voussoirs, 19.5 m, and on east as a
   bridge over the Way's foot;
2. the Eunuchs' Walk, level at 18.3 for 21 m along the Dome's face past the eunuchs' court's door, to **the Eunuchs' Gate**
   (the first check: horseshoe arch in alternating voussoirs, a pair of black lacquer leaves);
3. two upper flights east (18 risers each, a landing between) down to the turn at 12.06, under a colonnade of black columns with
   gold capitals and a white balustrade with a gold rail (refs 09, 12), roofed;
4. the turn, a landing across both lanes at the east end, a black planter with its olive, a crystal chandelier;
5. four lower flights back west along the curtain (17, 17, 17, 16 risers, landings of 3.85 m) under diaphragm arches, each bay
   roofed at its own level, arches behind arches down the lane (STYLE.md rule 3);
6. the foot at 0.45 (the palace's floor) and **the Golden Gate** (the palace guard's check), then under the great arch into
7. **the gate court** before the gate iwan, 15 x 4.4 m, open to the sky but for the balcony, with a basin on the axis: the
   ceremonial door, where the Sultan's litter goes in (the iwan's door is 4.4 m wide); and west, round the iwan's pier,
8. **the postern court**, 37 m along the curtain under six cusped diaphragm arches, past **the Postern Gate** (the household on
   foot) to the Harem Postern (x -383), the Way's own private door.

It serves both doors: the gate iwan for the Sultan carried (the litter does not fit the postern's 1.8 m), the postern for the
household. The dress narrows as the Way comes down (refs/citadel/STYLE.md rule 5), by height: the upper third the Dome's own
(bands, crazy paving with gold joints, Greek-key runners, black treads with gold noses, alternating voussoirs), the middle black
and white marble under pointed arches with gold rings, the lowest third the palace's red sandstone under white marble and cusped
arches. Everything is drawn with 78a/78b's and 78l/78m's helpers; no new texture.

**Walkable.** Every floor and flight in core/walk (tag `interior:xa-goldenway`: 14 floors, 6 flight strips, the walls and
parapets as blocks); the three gates' leaves in core/door, unlocked. The audit `xgwReach()` (and `verify.py --assert`
`golden-way-descent`): from inside the North Door, the Way's 20 floors and flights reached, and the palace's door strips at the
gate iwan and the Harem Postern reached, with and without `?interiors=1`.

**Views** (`views/golden-way-2026-11-10/`, deviceScaleFactor 2, `?interiors=1`): `Citadel_-_the_gate_iwan` (the preset, from the
gate court 4 m before the iwan's face: the muqarnas hood framed again, its gilt tiers and the gold ring round the pishtaq's
arch), `Citadel_-_the_Golden_Way` (the new preset, from the turn down the lower flights: the pointed gold-ringed arches give way
to the cusped ones toward the palace, the runners on the landings), `Golden_Way_-_from_the_top` (down the upper flights past the
colonnade), `Golden_Way_-_from_the_bottom` (from the foot up the lower flights: red sandstone risers, the cusped arches, the black
and gold at the top), `Golden_Way_-_from_above` (the two lanes and their roofs
between the palace's curtain and the Dome's face).

**Not yet.** The arches are the kit's round-ended voussoirs, not the references' wedges; the colonnade's balusters stand on a
slope over the steps (they follow the flight's line, not each tread); the lanes are lit only from the open sides and the
chandelier at the turn (no lamps in niches); the ends of the slot, beyond the Way's end walls, keep the terrain's 4 m slope
between the two levels. The roofs are plain white slabs under a gold line.

## Textures asked for

`core/materials/PROMPTS-NEEDED.md` section 41 (the trunk's list): **`stone.marble.black`** and **`stone.marble.calacatta`**
(the two stones) and **`patterns/xanadu/op-art-arcs`** (the private rooms' wallcovering). Wired as optional families
`xMarbleB`, `xMarbleW` and `xOpArt` in both Xanadu `materials.json` files: `xpLib` takes the two marbles in place of
`xMarble` (`rock.marble012`, lifted and inverted) as soon as both are packed; the op-art sheet is not read yet (the
wallcovering is the shader's). No further surface was needed: the gold is the kit's gilt, the patterns are geometry or
shader. (My own two prompts, `stone.marble.nero` and `stone.marble.statuario`, were dropped for the trunk's.)

## What the combined rebuild must verify

1. `python3 tools/build.py settlements/xanadu` and `kits/xanadu` after `git lfs pull` of the `tex/` folders (the trunk's
   `dist/xanadu.tex.xanadu.js` was once built from LFS pointers: 27 KB means black surfaces).
2. `verify.py dist/erewhon.html --assert`: error panel clean, no `citadel: no room for ...`; the views "Pleasure Dome — the
   Hall of Feasts / the checkered door / the hall from its gallery / the Valide's court / the baths / the stair hall / the
   sweeping stair / from the garden" and "Pleasure Dome of the Bay — the rotunda / under the dome / from the dock", every
   eye check clear.
3. `--eval "()=>XA_CUT.map((u,i)=>[u.id,xdomeReach(i)])"`: the citadel's Dome 78 of 78 floors reached, the Bay's 4 of 4.
4. `window._xaDome`: rooms 31, segs 125, doors 29, unplaced 0, `lib` set; `window._xaBay`: doors 1.
5. The seam with the palace and the temple (above), and the Golden Way's door against the palace gate.
6. Budgets: the Dome under 250,000 triangles a variant on the sheets, and Xanadu's sheet target under its 6,000,000 (it
   stood at 5.99M with the first Dome alone; the spandrels are coarser and the small rooms' windows lost their voussoirs
   to pay for the Bay's interior: see the numbers in "Checked").
7. `kits/xanadu`: `verify.py dist/xanadu.html --assert` (its `doors` check: the unlocked leaves equal `window._hollowDoors`).
8. Compare with `refs/pleasure-dome/built/*.jpg` (the first Dome, even balance, before the merge) and the references.
