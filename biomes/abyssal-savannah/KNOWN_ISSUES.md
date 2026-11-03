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
- [ ] **The umbrella's crown plate shows one sprig** (for the owner): `check_cells.py --fix` (2026-11-03) cut the plate's
      `card.acacia` sheet to one plant, so one sprig is stretched over a disc 5-14 m across (before, all nine at once). A plate
      texture is owed: `card.umbrella.plate`, its prompt in `core/materials/PROMPTS-NEEDED.md` section 24.
- [ ] **The caprock's talus assumes downslope is -x** (`60`, `caprock`): fine on this host; a world with the rim facing
      another way must hand the direction (add `rim.down`).
- [ ] **No fauna.** Grazers and the eastern abyss's frilled lizards on the rocks belong to `kits/fauna` (PLAN.md Q6).
- [ ] **No runtime LOD.** The trees and the floor are levelled by distance from the LOD spine, not the camera (the
      eastabyss kits' way); a free camera standing far off the spine sees the mid and far bands up close.
- [ ] **The bench reads thin.** Its bunchgrass (paired tussocks, `card.ichu` tinted) is a steppe from the ground but a
      scatter from above; the stub-lycopsid colonies carry it. A denser short-grass card or a second floor layer is a look pass.
- [ ] **Every view draws the whole scene** (~9.2M triangles, ~50 calls): the meshes are map-wide, so frustum culling
      saves nothing. The core's chunked LOD (`BIO.range`, as swbay's trees use) would cut it.
- [ ] **Stations 2 and 3** (the floor's belt, the bench's edge with ebadlands read in place) are planned, not built.

- [ ] **KSHADOW's cost is not measured** (the cloud turn had no GPU): the coordinator times `?shadow=0` against the default on
      the Arc. The Throne's isle and vents skipped it for its cost; oidong measured it within noise.
- [ ] **The scene's triangles rose** with the crowns held (twig rods on the heroes, the joints' spans): see "The final rebuild".

## Done

- [x] 2026-11-03, the final rebuild (pair 8): the universal set (PLAN.md section 11); the attach audit 28.39% -> see below;
      the textures `ground.savanna.litter` and `card.grass.thatch` were delivered and wired on 2026-10-26 (the open item was
      stale); the cycad frond's card is cut and based at its bottom (`check_cells.py --fix`: `cell`, `base: bottom`), not judged
      by eye; `PORT.md` written by `tools/audit_port.py`.

- [x] 2026-10-26: station 1 built to the plan's S0-S4 (`NOTES.md`).
