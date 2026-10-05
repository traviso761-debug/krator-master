# Reed Lake — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] No reclaimed-metal variants yet (the Highlands round-3 `88-hl-dress.js` pass is not vendored; the lake's only salvage is at the smithy).
- [ ] Boats and islands do not bob; only the water map moves (`94-rl-anim.js`).
- [ ] The loose-reed fringes stand across their edges instead of along them: `hnRLEaveFringe` and the island fringe in `hnRLIsland` (75-rl-helpers.js) turn the plane by `yaw = atan2(dx, dz)`, which lays a unit plane's width across the segment (the lattice in 78/79 adds `+ Math.PI/2`). Seen 2026-10-05 on the thatch hut's front eave: the fringe sticks out toward the viewer. `81-rl-tavern.js` lays its own fringe along the landing eaves. Fixing the helper changes every def's look: rebuild and look at every row.
- [ ] `81-rl-tavern.js` has no row in `PORT.md` yet (the port lint warns): it is `[draw]`, "split: the sign texture (canvas) and the builder" (rerun `tools/audit_port.py`, then set the tag).
- [ ] `--vendor-check` reports drift in `73-hl-carve.js` and `91-probe.js` from `../highlands/src` (upstream changed 2026-10-01; seen 2026-10-05, not re-vendored).
- [ ] The reed beds round a pad are placed by angle from the pad centre, so a boat moored just off the landing can stand in reeds on a very irregular outline.
- [ ] Row labels overlap in the whole-kit overview (the label atlas is the vendored Highlands one; per-row views are clean). 2026-10-01: the re-vendored `93-labels.js` brings Iziz's declutter (overlapping labels are hidden, landmarks and the nearest first); not yet checked against the whole-kit overview, so left open.
- [x] Vendored fragments had drifted behind `../highlands/src` (`--vendor-check` listed 30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage 69b-vern-mat 69c-vern-helpers 73-hl-carve 93-labels). — 2026-10-01: all re-vendored verbatim from Highlands, plus `71-hl-mat.js` (its `hWorldUV` fix); `--vendor-check`: all 23 identical. Brings the Iziz thatch dress, frame rails, `KIT.meshes`, the concrete topple fix, the `hnKryltso` run fix and the label declutter.
- [x] World-UV materials all drew at one K (the `vWorldUV` and `hWorldUV` closures gave every K the same shader program). — 2026-10-01: Reedlake takes the shared `vWorldUV` from `core/materials/opt/69a-world-uv.js` (`CORE_OPT_FILES` in build.py); its 69b no longer carries a copy, and `hWorldUV` (71-hl-mat) now calls the shared one with its second K.

## Level of detail (core/lod)

- [x] No LOD: `core/lod` now takes over both pages (README, "Level of detail"). The village is small: the overview
      drops from 223k to 78k triangles, close views by about 4%.
