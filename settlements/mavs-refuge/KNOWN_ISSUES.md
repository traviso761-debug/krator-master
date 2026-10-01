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

Catalog verify pass (2026-10), not synced back here: kits/catalog recentred `br_market_stall`,
`br_shopfront_display`, `br_storehouse_goods`, `br_roost_fittings` and `br_bldg_room_front`, and raised the sizes of
`br_well`, `br_fruit_stack`, `br_shrine_altar`, `br_roost_fittings`, `br_storehouse_goods`, `br_bldg_nature_shrine`,
`br_bldg_room_front` and the hypertree plants. Mav's Refuge declares none of these. `stall()`, `well()` and
`fruitStack()` (55-arch) are drawn in a frame from `FRM()`/`tryPlace()`, rejection-sampled per platform, and
`tryPlace`'s `ext` is a spacing radius, not a size. Raising `ext` or moving a piece's origin would re-run the rng
and reshuffle every later placement. The catalog pieces are rewrites of these builders, and the catalog copy is
the centred one.
