# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [x] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
  2026-10-01: ported. Roosts are centred between two gallery posts (30-layout); the landing lips are longer (main 3.0-3.6 m, hangar 3.6-4.2, satellite 2.2; 56-levels stores Ro.lipL); quetzals/archaeopteryx/dragonflies touch down on the lip ~2.5-3 m outside the post line, fold first, then walk in, and walk back out to the lip end to launch. Bats still fly in to hang from the ceiling, with shallow beats on the last 16 m (as Girder).
- [x] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
  2026-10-01: ported flyPursue / flyTryPeel / flyJoinRoute. Each circuit flyer gets a lap timer (Rookery circuits 150-420 s, patrols 260-700 s), then peels off onto a fresh arrival route (Rookery flyers home to the Rookery when it has room); perched beasts launch straight onto a short-handed circuit to refill it (one per circuit at night). Formations dissolve as flyers rotate, as in Girder.
- [x] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
  2026-10-01: ported. A bat launched in the evening or at night is owed a return 90-540 sim seconds later (flyBatDue); those still out at daybreak follow within ~2 minutes. The hour weights no longer favour bat arrivals at dawn. _flyers.batReturnHours / batsOut report it.
- [x] Flyers: rider lance stays on the saddle when the rider dismounts
  2026-10-01: the lance bone is parented to the rider's translate bone instead of the saddle, so it goes with him when he stands beside the beast and is hidden with him when only the saddle is left (same one-line fix made in Girder's copy of the model).
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [x] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
  2026-10-01: ported: the bark2 colour texture is pulled 30 % toward its luminance at load, and the far Prism gum trunks' palette tints 45 %.
- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
  2026-10-01: night floors cut (hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03) and the night fill turned cool blue-grey instead of a dimmed day colour (82-daynight); the giant's key 0.44 -> 0.18 x phase (21-sky); a full giant now cuts the lamps by 8 % instead of 28 %, so lamps, windows and fires are the main light. An eclipse keeps its own fill (DN_ECL_*) so it still reads as twilight. 21:00 lights: hemi 0.53 -> ~0.17, ambient 0.38 -> ~0.09, key 0.45 -> ~0.19. Same code in both builds.
- [x] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes) — fixed Oct 2026: it samples the flyers' legs against the REGISTER volumes, trunkR trunks, bridge segments and the ground, with two control legs that must hit (61 legs clear)

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
| Opening | 57 / 4.08 M | 66 / 3.50 M |
| Overview | 57 / 4.08 M | 57 / 2.83 M |
| Forest floor | 57 / 4.08 M | 65 / 3.59 M |

LOD adds up to 9 draw calls (simplified far versions of the canopy sets and the levels of the split meshes); verify's
opening view reads 66, inside the budget.

- [ ] Furniture triangles: the page now draws 4.98 M triangles (world 3.70 M + catalog furniture 1.28 M in 17 meshes,
  10,980 pieces). `BUDGET.triangles` guards the world without the furniture; the furniture has its own line,
  `BUDGET.furnitureTriangles` (1.47 M). The catalog pieces are heavier than the boxes Mav drew (tris each at
  setDetail .5, Mav's own drawing in brackets): br_fruit_stack 932 (~350), br_market_stall 680 (~210), br_well 552
  (~130), br_loom_frame 436, br_weapon_rack 424 (~85), br_lamppost 398 (~70), br_table 304 (~28), br_bench 256 (~26).
  By count the biggest totals are br_bench 791 x 256, br_lamppost 423 x 398, br_market_stall 164 x 680, the 2103
  hanging lanterns x 52, br_weapon_rack 192 x 424. Follow-up (kits/catalog): a low-detail variant, or a setDetail
  that also thins box-heavy pieces.
- [ ] Furniture look gaps (kits/catalog): the framed lantern (br_h_hanging_lantern v1) has no cool variant, so the
  Silk Loft's and the shrines' lanterns lost their blue-green core (their light is still cool); br_lamppost is one
  2.4 m post (LAMPPOST's h 2.6-4.2 is no longer honoured, the flame sits at 2.14 m); single barrels and crates are
  br_h_water_butt v0 / br_h_crate_stack v1 at one size (the old s scale is gone), so a few stacked ones overlap;
  the catalog frame's +x is the FRM frame's left, so asymmetric harvested pieces stand mirrored (the smithy forge
  is turned to keep its bellows' side).
- [ ] Still drawn as geometry though arguably furniture: the shop counters along the shopfronts (a curved built-in
  counter, no catalog piece; their goods are br_h_stall_goods), the shared kitchens' hearth and hood (built into the
  core wall), washing lines between gallery posts (lvlWashing) and the hut-side lines' posts, the hoists' hanging
  loads, the carpenter's half-built frame and leaning poles, the ropewalk trestles and ropes, the cooper's hoop,
  the potter's clay block, the weavers' hanging cloths, the scaffold's flag, the signal tower's drum and horn.
- [ ] To do (future, owner's call): the spiders, the spider nests' egg sacs and cocoons, and the other flyers go to a
  fauna kit, not the furniture catalog (`biomes/README.md` "To do: a fauna kit"). Not started.
- [ ] Interiors (?interiors=1): only 3 deck lots are furnished: the beast-rider set's items are the catalog's fixed
  rewrites (14 x 10 m deck lot, 9-post shrine ring, 12 m council ring, 12 x 3 m room fronts, 17 x 13 m roost gallery),
  and only the deck lot fits inside Mav's own walls, and only where it fits (API.md, Furniture). Sector-shaped items
  for Mav's lots, rooms and the council's annular hall would be needed in kits/interiors/sets/beast-rider.js.

Catalog verify pass (2026-10): kits/catalog recentred `br_market_stall` (and other harvested pieces) on their
footprint and raised some sizes. Mav's Refuge now places these pieces (53-furnish.js) and undoes the recentring
shift of the ones it places (`BRF_SHIFT`), so they stand where the old helpers drew; the raised sizes are the
catalog's.
