# biomes/scablands: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **One station.** The flood lake's high line over NW lowlands (station 2) needs NW lowlands' rock zone and its
  response to `bed` and `silt` (`biomes/nsemiarid/PLAN.md` section 8).
- [ ] **The coulee is drawn by the station, not the world.** In the open world the scale model's heights hold the
  channel at 4 km and `KSCOUR.land` adds what lies under a cell; the station cuts its own coulee (walls, the fall's
  cliff) so the falls can be seen at all. `WORLD_OVERLAYS` (PLAN.md, S3) is where the two meet.
- [ ] **The falls' cliff is a heightfield.** A real dry falls overhangs where the columns break away under the
  entablature; core/terrain's carve patches (`36-core-carve.js`, kind `undercut`) are made for it, but a patch's pad must
  exceed the ground grid's cell diagonal, and this station's ground is 10 m cells (`STAGE_GROUND.N` 640 over 6.6 km): an
  undercut along a 2 km lip would be a patch kilometres long at half-metre cells, and crude at that grid. It wants a
  finer ground under the falls first (a second, local ground mesh round the horseshoe; the stage's ground hooks would
  take it).
- [ ] **The probe and the merged erratics.** core/host's probe samples a merged mesh by its box, so the erratics'
  registered volumes read empty (`registered-volumes-non-empty`); `87-host-erratics.js` gives it a hidden instanced
  marker an erratic, with no triangles, which it does read (the dam bed's debris does the same: its KNOWN_ISSUES).
  Upstream fix: the probes take a merged mesh's own sample points (`userData.probePoints`); then drop the markers. It
  touches core/host's probe, which 24 builds take: every one of their pages rebuilds (CLAUDE.md), most of them LFS pages
  this checkout has not fetched. Parked until a session can rebuild them all.

## Closed

- [x] **No pool flora** (closed 2026-10-23). The overlay's own flora (`72-biome-scablands-pools.js`, its own kit
  registry, placed from the stage's records by `87a-host-pools.js`): kolk lilies floating on every pothole's water (some
  in flower), pothole quills ringing the waterline, seep sedge on the wet rims and the plunge lake's shore, spray ferns
  in the seeps along the falls' foot and its first ledges; each tagged, from this overlay's own pack (whole sheets cut by
  cell). A pothole the plunge lake covers is the lake's, not a pool of its own (its flora had drowned under the lake).
  Checked: lilies on their water, quills on the waterline, ferns at the foot, most pools with lilies; negative, the
  lilies lifted off the water.
- [x] **The alkali flat round the plunge lake was wide** (closed 2026-10-23): painted by height alone, it whitened the
  basin's whole floor; now a band outside the lake's own shore (15 m full, gone by 55), on ground at most 3 m over it.
- [x] **The giant current ripples barely read** (closed 2026-10-23): their crests painted light and their troughs dark
  on the bars (`SC_TINT`); they read as bands across the bars from the ripples' view.
