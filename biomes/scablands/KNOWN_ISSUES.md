# biomes/scablands: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **One station.** The flood lake's high line over NW lowlands (station 2) needs NW lowlands' rock zone and its
  response to `bed` and `silt` (`biomes/nsemiarid/PLAN.md` section 8).
  Stays open (2026-10-25): waits for NW lowlands' rock zone (a design task in another kit).
- [ ] **The coulee is drawn by the station, not the world.** In the open world the scale model's heights hold the
  channel at 4 km and `KSCOUR.land` adds what lies under a cell; the station cuts its own coulee (walls, the fall's
  cliff) so the falls can be seen at all. `WORLD_OVERLAYS` (PLAN.md, S3) is where the two meet.
  Stays open (2026-10-25): the open-world overlay hook (WORLD_OVERLAYS, PLAN.md S3) is a design task, not a fix.
- [ ] **The falls' cliff is a heightfield.** A real dry falls overhangs where the columns break away under the
  entablature; core/terrain's carve patches (`36-core-carve.js`, kind `undercut`) are made for it, but a patch's pad must
  exceed the ground grid's cell diagonal, and this station's ground is 10 m cells (`STAGE_GROUND.N` 640 over 6.6 km): an
  undercut along a 2 km lip would be a patch kilometres long at half-metre cells, and crude at that grid. It wants a
  finer ground under the falls first (a second, local ground mesh round the horseshoe; the stage's ground hooks would
  take it).
  Stays open (2026-10-25): needs a finer local ground under the falls first (a design task, past the hour budget); core/terrain's carve is not the gap.
- [x] **The probe and the merged erratics** (closed 2026-10-25). core/host's probe samples a merged mesh by its box; it
  now also reads a mesh's own sample points (`userData.probePoints`), which `87-host-erratics.js` sets one an erratic on
  its group, so the hidden marker is gone (`registered-volumes-non-empty` passes, 250 volumes).

- [ ] **The geodes' textures are reused sets.** The agate rind is `stone.onyx` toned, the druse `stone.geode.druze` (the Throne's)
  coloured by the material; a banded-agate set and an amethyst druse set of their own would read better close up. The ground's
  mesh is not cut round a wall geode: it stands half proud of the cliff with a druse disc for its cavity. GPU verify (`verify.py
  --assert`) deferred at the build (2026-11-09); the host checks and negatives pass in the browser pane. Aura and bismuth geodes, which no
  basalt grows, moved out on 2026-11-09 (`biomes/CRYSTAL-CAVES-5.1.md` site 3, "Aura and bismuth").

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
