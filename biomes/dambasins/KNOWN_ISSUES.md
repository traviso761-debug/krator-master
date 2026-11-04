# The dam basins: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [x] **The wind setting never took** (closed 2026-11-03, the final rebuild's pair 9). core/atmos's weather (91d) writes `ATMOS.windScale` every
  tick, so `DB_WIND`'s own write was undone and a calm blew as hard as the stiff wind (`db-dust-in-the-wind` failed: 0.031 in a calm, 0.039 in
  the stiff wind). The setting is a factor on the weather's wind now (`DB_WIND.k`, `src/91c-db-dust.js`; n semiarid's fix), and the check sets it.
- [ ] **The final rebuild's universal set is not taken here** (2026-11-03, pair 9). The page is the Ancient Port kit's (`settlements/port`,
  read in place): its ground, sky and water are the kit's, and the flora that would take `BIO.flareJoin`, impostors and KGROUND is D2's, not
  built. What a port-kit page takes (the shared sky's height fog, KFAR) belongs to the port kit's own turn; this page rebuilds with it.

- [x] **The probe and the merged debris** (closed 2026-10-25). The kit's probe samples at most 3000 vertices of a merged
  mesh, too few to find one plate among the flood's 1,400-odd pieces. Both probes now read a merged mesh's own sample
  points (`userData.probePoints`); the debris (`52-db-flotsam.js`) sets one a piece on its group and the hidden marker
  is gone (`registered-volumes-non-empty` passes, 1885 volumes). The port, Hook and Ys pages take the probe change at
  their next rebuild.
- [ ] **Two kit fragments are adapted copies.** `src/71-port-terrain.js` (the bed's ground and colours, no sea, no
      underwater fade, no port scrub) and `src/92-camera.js` (the camera's floor on a dry page) shadow the port kit's,
      each hook marked `[dambasins]`; Ys has its own copy of the terrain with the same kind of hooks (`YS_NAT`,
      `ysGroundTint`). They belong upstream as generic hooks in `settlements/port` (a natural-ground function, a ground
      tint, a dry flag): a shared change that rebuilds the port and Hook pages (and lets Ys drop its copy). Until then
      `python3 build.py --vendor-check` reports the drift.
      Stays open (2026-10-25): the generic hooks belong upstream in settlements/port (a shared change that rebuilds the port, Hook and Ys pages).
- [ ] **No flora yet** (PLAN.md, D2): the n semiarid kit, read in place, its fields from `KBASIN.sample`; then the hulk
      gardens (D3).
      Stays open (2026-10-25): a design task (PLAN.md D2/D3), not a fix.
- [ ] **One station.** The ship graveyard at the west notch (station 2) and the east bed inside Korona (3) are to come;
      so are the dress (drowned villages, stumps, shell banks: D4) and the overlay in the open world (D5).
      Stays open (2026-10-25): a design task (stations 2 and 3, the dress, the open world).
- [ ] **Segments that carry boats** (the fishing harbour, the marina) are left out: their small boats float at y = 0 over
      dry silt. Grounding them needs the same pose as the hulks, for the kit's small craft (they are segment props, not
      registered vessels).
      Stays open (2026-10-25): needs the grounding pose for the kit's small craft, a port-kit change (settlements/port).
