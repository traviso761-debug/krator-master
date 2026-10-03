# Girder — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

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
- [ ] Life: lift-foot nav edge runs through the capstan circle (walkers detour); capstan bar is static and cannot turn with the millipede (30-layout / 50-structure)
- [ ] Life: a lift queue does not steer round the sentry posted at the lift foot; hand lanterns do not light the ground
- [ ] Life: 78-life still carries 12 private road links (_life.virtualLinks) now redundant with the crossing fix in 30-layout — remove and re-test
- [ ] Layout: gallery walk-loop corners at (+-22,+-22) sit inside the corner columns (20.8-24)
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
- [ ] Furniture budget (BUDGET.furniture: measured 39 calls / 1.47 M tris + 15 %; 10 of the calls are painted-panel materials; 1331 outdoor pieces 0.10 M, 3809 interior pieces 1.37 M). The heavy pieces at setDetail(.5), count x tris: br_common_chair 246 x 704 (12 %), br_common_low_table 162 x 952 (11 %), br_common_stool 287 x 536 (11 %), br_common_table 116 x 1148 (9 %), br_common_bench 233 x 560 (9 %), br_common_bed 154 x 824 (9 %): the lashed legs and lashings of the Beast Rider common style sheet (kits/catalog FK, `legs: 'lashed'`); a lighter lashing at settlement detail in the catalog would cut ~0.4 M
- [ ] Walk mode: closed door leaves are drawn in the shells' doorways and the walker passes through them; no head collisions; no ladders (watch posts, wall-walk and orchard ladders are not climbable); no rail on the gallery or deck edges, so the walker can fall off (the stairwell at each half landing now has a rail, and the well an invisible wall)
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
