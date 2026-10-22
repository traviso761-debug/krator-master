# The dam basins: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **Two kit fragments are adapted copies.** `src/71-port-terrain.js` (the bed's ground and colours, no sea, no
      underwater fade, no port scrub) and `src/92-camera.js` (the camera's floor on a dry page) shadow the port kit's,
      each hook marked `[dambasins]`; Ys has its own copy of the terrain with the same kind of hooks (`YS_NAT`,
      `ysGroundTint`). They belong upstream as generic hooks in `settlements/port` (a natural-ground function, a ground
      tint, a dry flag): a shared change that rebuilds the port and Hook pages (and lets Ys drop its copy). Until then
      `python3 build.py --vendor-check` reports the drift.
- [ ] **No flora yet** (PLAN.md, D2): the n semiarid kit, read in place, its fields from `KBASIN.sample`; then the hulk
      gardens (D3).
- [ ] **One station.** The ship graveyard at the west notch (station 2) and the east bed inside Korona (3) are to come;
      so are the dress (drowned villages, stumps, shell banks: D4) and the overlay in the open world (D5).
- [ ] **Segments that carry boats** (the fishing harbour, the marina) are left out: their small boats float at y = 0 over
      dry silt. Grounding them needs the same pose as the hulks, for the kit's small craft (they are segment props, not
      registered vessels).
