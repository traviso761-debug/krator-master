# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [ ] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
- [ ] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
- [ ] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
- [ ] Flyers: rider lance stays on the saddle when the rider dismounts
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [ ] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
- [ ] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
- [ ] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes)

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
  the potter's clay block, the weavers' hanging cloths, the scaffold's flag, the signal tower's drum and horn, the
  spider nests' sacs and cocoons.
- [ ] Interiors (?interiors=1): only 3 deck lots are furnished: the beast-rider set's items are the catalog's fixed
  rewrites (14 x 10 m deck lot, 9-post shrine ring, 12 m council ring, 12 x 3 m room fronts, 17 x 13 m roost gallery),
  and only the deck lot fits inside Mav's own walls, and only where it fits (API.md, Furniture). Sector-shaped items
  for Mav's lots, rooms and the council's annular hall would be needed in kits/interiors/sets/beast-rider.js.

Catalog verify pass (2026-10): kits/catalog recentred `br_market_stall` (and other harvested pieces) on their
footprint and raised some sizes. Mav's Refuge now places these pieces (53-furnish.js) and undoes the recentring
shift of the ones it places (`BRF_SHIFT`), so they stand where the old helpers drew; the raised sizes are the
catalog's.
