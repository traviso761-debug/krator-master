# Krator biome kit — the abyssal savannah: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **eastabyss does not read this kit yet** (PLAN.md S5, Q8). Its savannah passes (9, the umbrella trees; 17's savannah
      share) and its floor's `plantSav` sit in the middle of one random stream each, so swapping them for `ABSAV.grow` moves
      every plant eastabyss places after them. Do it as one deliberate change with eastabyss's `baseline.json` rewritten:
      keep its rng draws where the savannah was (or move its passes onto per-cell seeds first), call `ABSAV.zones` /
      `ABSAV.make` / `ABSAV.grow` for the `sav` zone, and add this kit's fragments and pack to its `build.py`.
- [ ] **The ground is not the scale model's.** The rim slope is an analytic profile on the survey's grade (KRAND noise),
      not KLAND (on another branch, not in this checkout). The risers, gullies and kopjes are the page's own (PLAN.md Q3).
- [ ] **Fire is a static mosaic** (`ABSAV.burn`): no front that moves, no smoke, no people who burn (PLAN.md S6).
- [ ] **Two textures owed** (`core/materials/PROMPTS-NEEDED.md` section 24): `ground.savanna.litter` (stand-in
      `ground.redsoil`) and `card.grass.thatch` (stand-in `card.grass.dry`, a knee-high bunchgrass drawn 3 m tall: the tufts
      read squat and too open up close).
- [ ] **The caprock's talus assumes downslope is -x** (`60`, `caprock`): fine on this host; a world with the rim facing
      another way must hand the direction (add `rim.down`).
- [ ] **The cycad fronds use `card.fern` whole**, its tip at the frond's base (the card loads unflipped): the fronds widen
      outward. The eastern abyss has the same with its `cycfrond` slot.
- [ ] **No fauna.** Grazers and the eastern abyss's frilled lizards on the rocks belong to `kits/fauna` (PLAN.md Q6).
- [ ] **No runtime LOD.** The trees and the floor are levelled by distance from the LOD spine, not the camera (the
      eastabyss kits' way); a free camera standing far off the spine sees the mid and far bands up close.
- [ ] **The bench reads thin.** Its bunchgrass (paired tussocks, `card.ichu` tinted) is a steppe from the ground but a
      scatter from above; the stub-lycopsid colonies carry it. A denser short-grass card or a second floor layer is a look pass.
- [ ] **PORT.md is hand-written** in a short shape: `tools/check_port.py` warns that it finds no rows (13 warnings, no
      failure). Rerun `tools/audit_port.py` (not run by this session, per its brief) to write the full table.
- [ ] **Every view draws the whole scene** (~9.2M triangles, ~50 calls): the meshes are map-wide, so frustum culling
      saves nothing. The core's chunked LOD (`BIO.range`, as swbay's trees use) would cut it.
- [ ] **Stations 2 and 3** (the floor's belt, the bench's edge with ebadlands read in place) are planned, not built.

## Done

- [x] 2026-10-26: station 1 built to the plan's S0-S4 (`NOTES.md`).
