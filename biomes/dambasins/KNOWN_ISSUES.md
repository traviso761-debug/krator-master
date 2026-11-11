# The dam basins: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The kit's sky goes black under the horizon** (found 2026-11-08 on the graveyard's overview). `settlements/port/src/90-scene.js`'s
  dome takes `pow(h, .55)` of the view's height, negative below the horizon, and GLSL's `pow` of a negative is undefined (black on
  the GPU); the dome is also a 12 km sphere at the origin with a 14 km camera, so from a camera a few kilometres off the origin its
  far side fell past the far plane. This build clamps the height and keeps the dome on the eye (`src/91e-db-far.js`), and gives
  every station a KFAR far field past the ground grid. The fix belongs upstream in the port kit (the port, Hook and Ys pages
  rebuild): a shared change, not made here.
- [ ] **The stations' looks, for the owner's eye** (2026-11-08): the graveyard (the channel's walls are bare sand under the flora; the
  dam's ends are boxes in a stepped section, no rebar or torn edge; the pile's ships are the port kit's vessels as built, grounded,
  not crushed into one another), the east bed (Korona's wall carries forest colour, not trees, past the flora's 2.6 km window; the
  sky is the port kit's dusty one over a humid haze; no stream: Korona's western rivers reach the lake north and south of the
  station). Station 1 changed too: a far field past its grid and the sky's fix (its ground and placement did not move).
- [ ] **Station 1's bed has no flora** (D2 is on stations 2 and 3). Taking the n semiarid kit there is the graveyard's binding with
  station 1's window (`build.py` `TARGET_KITS`).
- [x] **The wind setting never took** (closed 2026-11-03, the final rebuild's pair 9). core/atmos's weather (91d) writes `ATMOS.windScale` every
  tick, so `DB_WIND`'s own write was undone and a calm blew as hard as the stiff wind (`db-dust-in-the-wind` failed: 0.031 in a calm, 0.039 in
  the stiff wind). The setting is a factor on the weather's wind now (`DB_WIND.k`, `src/91c-db-dust.js`; n semiarid's fix), and the check sets it.
- [ ] **The final rebuild's universal set is not taken here** (2026-11-03, pair 9). The page is the Ancient Port kit's (`kits/port`,
  read in place): its ground, sky and water are the kit's, and the flora that would take `BIO.flareJoin`, impostors and KGROUND is D2's, not
  built. What a port-kit page takes (the shared sky's height fog, KFAR) belongs to the port kit's own turn; this page rebuilds with it.

- [x] **The probe and the merged debris** (closed 2026-10-25). The kit's probe (`kits/port/src/91-probe.js`, `_probePoints`) samples at most 3000 vertices of a merged
  mesh, too few to find one plate among the flood's 1,400-odd pieces. Both probes now read a merged mesh's own sample
  points (`userData.probePoints`); the debris (`52-db-flotsam.js`) sets one a piece on its group and the hidden marker
  is gone (`registered-volumes-non-empty` passes, 1885 volumes). The port, Hook and Ys pages take the probe change at
  their next rebuild.
- [ ] **Two kit fragments are adapted copies.** `src/71-port-terrain.js` (the bed's ground and colours, no sea, no
      underwater fade, no port scrub) and `src/92-camera.js` (the camera's floor on a dry page) shadow the port kit's,
      each hook marked `[dambasins]`; Ys has its own copy of the terrain with the same kind of hooks (`YS_NAT`,
      `ysGroundTint`). They belong upstream as generic hooks in `kits/port` (a natural-ground function, a ground
      tint, a dry flag): a shared change that rebuilds the port and Hook pages (and lets Ys drop its copy). Until then
      `python3 build.py --vendor-check` reports the drift.
      Stays open (2026-10-25): the generic hooks belong upstream in kits/port (a shared change that rebuilds the port, Hook and Ys pages).
- [ ] **No hulk gardens yet** (PLAN.md, D3): the flora is in on stations 2 and 3 (D2, 2026-11-08); the rust vines on the hulks are not.
      Stays open (2026-10-25): a design task (PLAN.md D2/D3), not a fix.
- [ ] **The dress and the open world** (D4, D5): drowned villages, stumps, shell banks; `WORLD_OVERLAYS`. Stations 2 and 3 are
      built (2026-11-08).
      Stays open (2026-10-25): a design task (stations 2 and 3, the dress, the open world).
- [ ] **Segments that carry boats** (the fishing harbour, the marina) are left out: their small boats float at y = 0 over
      dry silt. Grounding them needs the same pose as the hulks, for the kit's small craft (they are segment props, not
      registered vessels).
      Stays open (2026-10-25): needs the grounding pose for the kit's small craft, a port-kit change (kits/port).
