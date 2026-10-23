# Girder — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [x] (2026-10-15) Girder on core/host (ROADMAP.md section 10, step 2; `core/host/README.md`): the camera, loop, panel and probe are
      the host's; the inspector (I, click) reads core/tags (every REGISTER()ed site and every interior piece is a record now);
      marks (P) replace the polygon tool; the picture menu, minimap (M), editor (B) and cutaway (X: a tower's thirty storeys,
      the houses, the hall) are new. Proof: `verify.py --assert` unchanged (every invariant, the same draw calls); a scene census
      (every mesh's name, visibility and triangles at four views, the camera to 4 decimals) matches the old page within the old
      page's own run-to-run difference (the interiors' merge and the life layer); chrome-hidden shots differ only where the
      wind, the water and the villagers move. The budget row `furn.calls 80 / 54` fails as it did on main before the move.
- [x] (2026-10-15) Keys changed with the host's one keymap: **F** walks (it was G), **G** flies to the pin (double-click the
      ground to drop one), Esc lifts it; I is the hover tip (the old Inspector button), P marks, B edits, X cuts, O is free. - 2026-10-20: description of the port, nothing open.
- [ ] (2026-10-15) The editor moves, removes and places **catalog pieces** only. A piece the page was made with is merged into
      the furniture batch, so moving or removing it is marked and applies on reload (`53-furnish.js gfVetoed`); a placed piece is
      drawn on its own at once. Plant mode offers the catalog's planters and shrine saplings: the hypertrees, saplings and
      undergrowth are woven into shared stores and cannot be edited one by one yet; the plant registry (krator-master-plants.js)
      needs the asset engine, which Girder does not load.
- [x] (2026-10-15) The world hour stays the sky's own clock (21-sky.js, the Time of day slider and Pause); the host's speed
      buttons (pause, 1x to 8x) set the motion time the sky, the wind and the life layer advance by. One clock is the host's
      (`KCLOCK`) once the sky takes an hour from it. - 2026-10-20: description of the port, nothing open.
- [x] (2026-10-05) The NAV walk graph against the walk solids (`navAudit()` in Girder Hero, `hero/PORT.md`): 810 of 2,958
      edges and 184 nodes could not be walked. Fixed in 30-layout.js: the gallery loops ran along the column line (now
      `GALLERY_WALK`, 20.2 m, inside the columns; 704 edges, 176 nodes), the roost-deck walk crossed the lift notch (its nodes
      step to the notch's outer side), the last flight climbed to the roof plate's open core (the graph now stops at floor 30's
      core), roost nodes stood among the stall's furniture (now at the stall's open back), the lift foot ran through the capstan
      (a node round it), fields and house yards reach the road through an apron node outside the gate. Left: the four below.
      `verify.py --assert` passes; the villagers now walk the galleries 1.8 m further in and tend the beasts from the stall's back.
- [x] (2026-10-05) NAV: 105 gallery edges and 16 gallery nodes run through furniture standing on the gallery lane (20.2 m).
      The furniture is placed after the graph (53-furnish.js, 56-interiors.js); either keep a lane clear there or repair the
      graph against the solids after furnishing. Girder Hero detours round them.
      2026-10-20: measured on core/walk (`_walk.navAudit()`, new in 83-walk.js; the hero's own audit stopped working with the 2026-10-19 port): 121 edges, 16 nodes.
      Cause: the water butt or planter a corner dwelling set before its door (55-arch.js `buildDwelling`, `zw+0.45`) stood a metre deep in the 1.2 m gallery.
      A home with no veranda now sets its front wall back 0.95 m (as a store already did), so those pieces stand in the recess: 0 nodes, 0 edges. `verify.py --assert` checks it (`nav-walkable`).
- [x] (2026-10-05) NAV: 17 field and 2 house links to the road cross a neighbouring plot's fence on the way to a road node up to
      43 m off (`navNearest`); they want to follow the lanes between the plots.
      2026-10-20: 17 field and 2 house links (the audit counted 19 again); now 0. `navLaneRoute` (30-layout.js) takes the nearest road or patrol node that no plot's or house yard's
      fence stands in the way of, else walks the apron's own lane between the plots (a node in the lane, either way) to the first point with a clear run.
- [x] (2026-10-05) NAV: on each roost deck the walk node moved out of the lift notch sits by a stall partition, so its link back
      to the walk line clips a post (4 edges).
      2026-10-20: the notch nodes stepped out to 3.4 m from the lift, the x of the stall's back posts (29.8 m from the tower centre); they now step to 3.0 m. 4 edges, now 0.
- [x] (2026-10-05) NAV: the lift-head nodes are inside the shaft; the edge to the deck walk is only walkable with the cage up
      (by design, but `navAudit()` lists it). - 2026-10-20: by design, nothing open.

- [x] (2026-10-05) Tree tints: roots take the trunk's tint at their height above the ground (colour band and moss) and limbs, boughs and twigs take the trunk's tint
      at the height where the limb leaves it (60-trees.js: `trunkPt(...)`, `lc`); the old lighter-base, darker-outer split along a limb is gone. Looked at in headless
      renders against the committed page (trunk base, root fan, a limb on the ironbark): the limb now reads as the trunk's colour where the old one was darker. Triangles
      moved by 1,700 to 3,000 over the committed page, not traced.
- [ ] (2026-10-05) The trunk's mossy base is a strongly olive skirt (the moss tint is up to 55% over the first ~20 m) with a sharp horizontal line about 9 m up where the lathe
      section changes its texture scale; the committed page has the same line at the same height, so it is not from the tint change. Roots now match the skirt, which makes the
      skirt the most visible tint step left on a hypertree. A softer moss fade, or one texture scale across the flare, would remove it.
- [x] (2026-10-05) Bark: `bark0` (ironbark) and `bark3` (baobab) use the generated `bark.ironbark` and `bark.baobab` instead of the borrowed willow and blue gum. The tint
      numbers (keep 0.15; mean 0.579 and 0.614 as before; contrast 1.3 and 1.5) are first guesses, judged on headless renders only: the ironbark reads red-brown with a braided
      relief up close; the baobab has not been looked at closely.
- [x] (2026-10-05) Dragonfly wing sheet: 84-flyers.js maps the library's `wing.dragonfly` (materials.json family `flywing`) over each wing's bounding box
      (`FlyGeo` took an optional UV for this; only the wing mesh carries UVs) and skips the hand-built vein quads while the sheet is set. A close-up of a dragonfly in a headless
      render shows the vein net and the dark tip spot on a translucent wing. The sheet is a tight crop stretched square (cards.py anchor `tight`), so it loses vertical
      resolution, and the fore and hind wings share one image.
- [x] (2026-10-05) The Beast Rider sets are in Girder (materials.json: 89 families). How each is used:
      - 48-detail.js: a DETAIL map by triplanar projection for meshes with no UVs, its mean brightness divided back out so the vertex colours keep their
        brightness. The catalog furniture's render families (f_<family>: wood.carved, wood.lamppost, wood.mahogany, fibre.rope, cloth.silk, hide.fur.brown,
        lantern-horn on the glow, leaf.understorey, rock face, thatch, earth.floor.packed, terracotta, metal.iron.pitted, fruit.skin.amber on food, bone.skull,
        basket-coil on wicker, metal.gold), the gatepods (fruit.husk), the draught millipedes (chitin.millipede) and the lift cages (fibre.cane).
      - The mounts: FlyGeo.slots maps each colour to a quadrant of a per-species 2x2 atlas (vertex attribute aDetS), sampled by triplanar projection of the
        BIND-POSE position, so the sheet rides on the flapping wing. Quetzal: hide.fuzz.pterosaur fuzz (2026-10-06; was hide.strider), membrane.pterosaur, the crest feathers, bone.horn; bat:
        fur.bat, membrane.bat, bone.antler; archaeopteryx: the raptor feathers, organic.scale.terracotta; dragonfly: organic.chitin.iridescent, chitin.spider
        legs (wings: wing.dragonfly); rider: the saddle blanket, leather, wood.lamppost lance, rope. One draw call per species, as before.
      - Village dressing (new FAMMAT families; 05-palette.js): rawhides and big-cat pelts on the workshop frames, the clan emblem on the upper galleries'
        banners and saddle blankets on the lower ones, claw tapestries in the common rooms, prayer flags and perch pennants (cloth-5), striped awnings, stall
        plaques, lamp posts (wood.lamppost), carved posts (the totem sheet: the hall colonnade, pavilions, shrines), the hall's lacquer-and-gilt frieze (trim),
        bone-inlaid sill band and lacquered door leaves, paper lanterns, reed floor mats in the pavilions, tar-sealed palisade stakes, orange-peel orchard
        fruit, gourds on the crop rows, seed capsules on the overgrown ledges, moss cushions (fur.sloth) and mahogany bark on the sub-canopy trees.
      - Cards: the undergrowth atlas's hanging-moss cell is card.vine; 64-cards.js adds bromeliads, screwpines and moss cushions round the hypertrees and
        along the brook, young mahoganies, flowering shrubs outside the palisade, maize along the plot fences and cargo nets in every second roost stall
        (its own generator: rnd is untouched).
      Every switch is behind KIT_LOOK / KMAT.mode, so ?mat=proc is the committed page. Not used in Girder: wax.tallow (no candle surface), the pennant sheet
      (a row of flags against sky, not a texture), and of the older sets cloth-1 to cloth-4 and cloth-6, cloth.plain and cloth.canvas.
- [ ] (2026-10-05) Girder's page is 12.5 MB (6.6 MB before): tex/ holds 89 packed families (8.5 MB). The new families are colour maps only and the
      detail maps 256 px; the cards are 512 px with lossless alpha. Draw calls 91 of 110 (83 world families before the last nine). 256 px cards would save ~1 MB.
- [ ] (2026-10-05) The detail maps' tile sizes and keep values (materials.json) are first guesses, judged only on headless close-ups: the dragonfly's chitin and the
      archaeopteryx feathers read as coarse patches from 15 m; the atlases fall back to texture2D (seams at quadrant edges) on WebGL1. The flat rosette cards
      (bromeliads, screwpines, moss) lie level and do not follow a slope, and cast no shadow.
- [ ] (2026-10-05) `tools/textures/pack.py settlements/girder` takes about two minutes and rewrites tex/ even when nothing changed (the bytes came out identical this time).
- [x] Library trees and the library look (2026-10-03): ghostwood and prism gum barks, the leaf mass on `leafy`, leaf
      and flower cards, two undergrowth cards, the break-up on every bark; fruit on the fruit-seller stalls and the
      gatepod harvest tag; tone mapping, contact shading, chamfered columns, 16-sided cylinders. Bundling the catalog's
      `generic-goods` (for the fruit colours) changed the interiors by one piece (3810 to 3811); budgets pass
      (68/110 world calls, 2.60 M triangles; furniture 41/45 calls). GPU cost on a real machine is not measured.
- [x] Z-fighting where the towers' columns met the floors (2026-10-03). The edge columns' outer faces, the perimeter
      spandrels' outer faces and the floor plates' edges sat at 24.00, 24.00 and 24.01 m from the tower centre, and
      neighbouring bays overlapped by 2 cm, so their tops fought along every seam. The bays now abut on the bay
      lines, the plates stand 6 cm proud of the columns (`PLATE_LIP`, 50-structure.js) and the spandrels 10 cm in.
      Only the concrete and rust box instances moved; nav, invariants and budgets pass.
- [ ] UNCONFIRMED BRIEF: "platforms protected by rope bridges" was read as "connected by rope bridges" — ask Travis
- [ ] Terrain: ground drops 4-12 m below brook water level in a hollow below the cascade; widen the vale in terrainH (10-core)
- [ ] "Girder from the brook" view was moved onto the footbridge after the last render — never re-shot
- [ ] Life: under the default 2-minute day, worker commutes fade instead of walking (pause/slow the clock to see real walks)
- [ ] Life: sentries never change shift; wall-walk pacers have no way up or down (no ladder/nav link to the ledge)
- [ ] Life: capstan bar is static and cannot turn with the millipede (30-layout / 50-structure). 2026-10-20: the lift-foot edge round the capstan is done (2026-10-05; the audit lists no lift-foot edge)
- [ ] Life: a lift queue does not steer round the sentry posted at the lift foot; hand lanterns do not light the ground
- [x] Life: 78-life still carries 12 private road links (_life.virtualLinks) now redundant with the crossing fix in 30-layout — remove and re-test. 2026-10-20: checked, not redundant and not 12: the four ring-to-avenue links are no longer made (the crossing fix joins them), the eight court-side tower-door links are 33 m shortcuts to the avenue where the ground-only path is 98 m. Kept.
- [x] Layout: gallery walk-loop corners at (+-22,+-22) sit inside the corner columns (20.8-24). 2026-10-20: stale, done 2026-10-05 (the loop is `GALLERY_WALK`, +-20.2 m); the audit finds no node or edge stopped by a column
- [ ] Flyers: the 12 court-side roost stalls are static residents (every approach crosses a bridge); quetzals use outer bays only
- [ ] Flyers: circuit joins fail ~25% (fall back to plain departure); formations dissolve; quetzal head clearance under the eave judged by eye
- [ ] Flyers: rider-lantern / bat-eye glints never confirmed in a night frame; re-run the obstacle audit against the real forest (it was run against placeholder crowns)
- [ ] Overgrowth: vine curtains are flat two-sided ribbons with no sway; blocky close up (58-overgrowth)
- [ ] Arch: house yards sparse, no animals in pens; dwellings under low slabs have no roofs
- [ ] Forest: no trodden-ground tone on gate tracks; fireflies hard to see; brook bed strip only inside |x|,|z|<1200; FAST-off (shadows) build never run
- [ ] Forest: 62-jungle hard-codes four camera positions from 80-camera to keep them clear — publish viewpoints from the layout instead
- [x] Night at 21:00 is too bright under the gas giant (shared with Mav's Refuge)
  2026-10-01: night floors cut (hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03) and the night fill turned cool blue-grey instead of a dimmed day colour (82-daynight); the giant's key 0.44 -> 0.18 x phase (21-sky); a full giant now cuts the lamps by 8 % instead of 28 %, so lamps, windows and fires are the main light. An eclipse keeps its own fill (DN_ECL_*) so it still reads as twilight. 21:00 lights: hemi 0.53 -> ~0.17, ambient 0.38 -> ~0.09, key 0.45 -> ~0.19. Same code in both builds.
- [ ] Interiors are furnished AFTER load (56-interiors.js): ~16 s of placer time in a desktop browser (118 s headless), nearest the camera first; frames drop while it runs. The interiors placer (kits/interiors 45-placer.js, its geometry tests) is the cost: a faster placer or cached plans would let it run at load
- [ ] Interior lamps, hearths and braziers are data only (their lights are on the placements, not in the night light volume): furnished rooms are lit at night only by the window spill
- [x] Furniture budget (BUDGET.furniture: measured 39 calls / 1.47 M tris + 15 %; 10 of the calls are painted-panel materials; 1331 outdoor pieces 0.10 M, 3809 interior pieces 1.37 M). The heavy pieces at setDetail(.5), count x tris: br_common_chair 246 x 704 (12 %), br_common_low_table 162 x 952 (11 %), br_common_stool 287 x 536 (11 %), br_common_table 116 x 1148 (9 %), br_common_bench 233 x 560 (9 %), br_common_bed 154 x 824 (9 %): the lashed legs and lashings of the Beast Rider common style sheet (kits/catalog FK, `legs: 'lashed'`); a lighter lashing at settlement detail in the catalog would cut ~0.4 M 2026-10-20: re-baselined by the owner: BUDGET.furniture.drawCalls is now 78 (measured 78; was 54), not merging materials. A later catalog detail variant may bring it down again.
- [ ] Walk mode: no head collisions (a lintel or a low beam is not a block); no ladders (watch posts, wall-walk and orchard ladders are not climbable). 2026-10-20: the rest is stale: the front doors are drawn open (55-arch.js `doorAt`: the leaf swung in against the jamb, no closed leaf anywhere), and the host's walker drops at most 1.4 m, so it keeps to a gallery or deck edge without a rail (2026-10-19)
- [ ] Woodpiles are the catalog's stave stack: the beast-rider culture file has no log pile (br_woodpile is only in the harvested registry, krator-master-furniture.js, which the bundle leaves out)
- [ ] Still geometry that is arguably furniture: 72-lights.js LAMPPOSTs on the roads and deck corners (planner-owned; the culture file has no lantern post), the hides hung across workshop fronts, gallery banners, prayer flags, roost pennants and plaques (kept as facade dressing)
- [ ] The Beast Rider set's Girder items (kits/interiors/sets/beast-rider.js) describe the catalog's buildings, not Girder's shells (sizes, door widths, floor heights differ; Girder sizes every slot and house itself): 56-interiors.js derives each building's item from its real shell instead. The roost deck item's keeper's shelter did not exist in Girder: 55-arch now draws one on each deck's outer corner apron

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Left out by default: the life layer (`userData.life`) and the flyers (`userData.flyers`, interleaved instance data).

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Opening | 54 / 2.69 M | 62 / 2.56 M |
| Overview | 54 / 2.69 M | 58 / 2.23 M |
| Forest floor | 54 / 2.69 M | 60 / 2.33 M |

LOD adds up to 8 draw calls; verify's opening view reads 64 of a budget of 110.

Catalog verify pass (2026-10), not synced back here: kits/catalog recentred `br_bldg_girder_palisade` by 0.40 m and
raised the sizes of the beast-rider hypertree plants. Girder's palisade is a ring of radius `PALISADE.R` built
in world coordinates (30-layout), not a 16 m section with an origin, and Girder declares no plant sizes. Nothing
here maps onto the catalog's correction. The catalog copy is the centred one.

## Walking (core/walk)

- [x] **Girder walks on core/walk** (2026-10-19). `src/83-walk.js` no longer moves a body: it writes the builders' solids (`gwBox`, `gwSeg`, `gwDisc`: by tag, floors
      or blocks) and the layout (floor plates, the switchback flights as strips, the plinth steps, the roost decks, the lift cages as floors that follow the cages,
      the rope bridges as strips along the sag with rope sides as blocks, the palisade ring with the gates open, the trunks) into `KWALK`, and the host's
      walker (`KHOST.take({walk: KWALK, walker: {step .55, drop 1.4, r .28, h 1.75}})`; F, W A S D, Shift) walks it. `window._walk` stays as a thin layer for
      `tools/harness.py walk` and scripts. Checked headless: the first flight of a tower climbs to its half landing, a core wall stops the walker, a bridge
      is crossed along its sag, the rope sides hold, the palisade stops the walker between the gates and a gate lets it out.
- [ ] Girder Hero (hero/88-hero.js, 89-talk.js) still calls the walker the 2026-10-19 port removed (`wkSupport`, `wkBlocked`, `wkPush`, `wkStops`, `WALKER`): `_hero.navAudit()` throws `wkSupport is not defined`, and its routing and body want porting onto `KWALK` (`floorBelow`, `blocked`, `push`). Use `_walk.navAudit()` (83-walk.js) for the graph meanwhile.
- [ ] No jump and no gravity any more (Space did both): the host keeps to a deck's edge instead of letting a walker fall (a design choice of the host; jump is not planned).
- [x] The lift ride (the cage floor follows the cage, a rider sends it) is written but I did not ride one. 2026-10-20: ridden headless: the walker set on lift 0's cage sent it after its wait, and the walker's feet followed the cage from 34.95 m to 43.7 m, within 0.15 m of the cage floor all the way; the top step-off and the stop at the head were not watched.


## Voth census trades (2026-10-19)

The table is `src/65-gi-trades.js` (`GI_TRADES`; checked by `tools/check_trades.py` and `verify.py --assert` as `voth-trades`). 11 trades carried, 3 partly, 17 gaps, 13 na (no coast, no electricity, no embassies, no palace).
- [ ] Gaps (a later session builds them; Girder's buildings are copied into `kits/beast-riders`, which already has most of these as `br_bldg_*`): bakery, butcher, brewhouse/mead hall (also innkeepers and servers), tannery, temple hall (priests, monks, undertakers' funerary court), barracks, school, toll house, house of healing, mine head, quarry, granary and mill, dairy shed, fungus house.
- [ ] Partly carried: weavers and dyers (stall only; no weaving house or dye works), innkeepers and grooms (roost keepers; no inn), swineherds and duck keepers (millipede pen; no sties or coops).
- [ ] (2026-10-20) `verify.py girder.html --assert` ends `FAILED: error panel not clean; budget furn.calls` on this Windows box, both also on a clean HEAD build (0002ec725), so not from the trades table or the nav fixes. (1) The error panel: `render: TypeError ... reading 'trim'` is three.js reading a null program log. A MeshStandardMaterial with the night glow (45-kit.js `applyNightGlow`; USE_MAP, USE_ENVMAP, DOUBLE_SIDED) fails to link in the headless SwiftShader run, the 163rd `linkProgram`, empty info log, context not lost; the same two shaders link when compiled alone in a blank page, `?interiors=0` is clean, Mav's Refuge is clean, and the page is clean on a real GPU (in-app browser, 90 s, `#errs` empty). It needs the interiors on, so it is the furnished interiors' materials (114 live programs when it fails, 88 in a clean run without them) meeting SwiftShader, not a shader error; check on the Linux CI image before spending time on it. (2) `furn.calls 78 / 54` (was 80 / 54 on 2026-10-15): the furniture's distinct materials, the open item above (BUDGET.furniture was measured at 39 calls). Re-baseline it or merge the painted-panel and family materials; the assert is not weakened. The new `nav-walkable`, `voth-trades` (GI_TRADES: 11 carried, 3 partly, 17 gaps, 13 na of 44) and every other invariant PASS.
- [x] (2026-10-20) `verify.py --assert` died at its last check with `ModuleNotFoundError: check_trades`: `tools/check_trades.py`, `tools/_read_trades.js` and `tools/trades_census.json` were missing from this checkout; taken from commit 49bee4d3a (Voth census tables for 19 builds), unchanged. core/furnish's girder fingerprint moved (records c0a5e129, geometry eeeccbf; 1331 pieces, same triangles) with the layout and terrain work of the same day; every other furnished page reads `same`.
