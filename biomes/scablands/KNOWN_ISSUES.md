# biomes/scablands: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **No pool flora yet** (PLAN.md, S1): the pothole pools' and the plunge lake's own plants (the overlay's flora:
  plants that mean nothing without the scour). The kit's margin plants answer the water's `wet` meanwhile. The erratics
  are in (2026-10-23).
- [ ] **The alkali flat round the plunge lake is wide**: the basin's floor lies within a few metres of the lake's level
  for hundreds of metres, and the `salt` field paints it all white (Dry Falls' Red Alkali Lake has such a flat; this one
  may read as more than intended).
- [ ] **One station.** The flood lake's high line over NW lowlands (station 2) needs NW lowlands' rock zone and its
  response to `bed` and `silt` (`biomes/nsemiarid/PLAN.md` section 8).
- [ ] **The coulee is drawn by the station, not the world.** In the open world the scale model's heights hold the
  channel at 4 km and `KSCOUR.land` adds what lies under a cell; the station cuts its own coulee (walls, the fall's
  cliff) so the falls can be seen at all. `WORLD_OVERLAYS` (PLAN.md, S3) is where the two meet.
- [ ] **The falls' cliff is a heightfield.** A real dry falls overhangs where the columns break away under the
  entablature; core/terrain's carve patches (`36-core-carve.js`) could add the undercut.
- [ ] **The probe and the merged erratics.** core/host's probe samples a merged mesh by its box, so the erratics'
  registered volumes read empty (`registered-volumes-non-empty`); `87-host-erratics.js` gives it a hidden instanced
  marker an erratic, with no triangles, which it does read (the dam bed's debris does the same: its KNOWN_ISSUES).
  Upstream fix: the probes take a merged mesh's own sample points (`userData.probePoints`); then drop the markers.
- [ ] **The giant current ripples barely read.** KSCOUR's ripples are 2 to 6 m high and ~90 m apart on the bars (the
  flood's depth sets them), which is right, and at this station's scale they are a faint swell under the plants. Lower
  sun, a crest tint stronger than the gravel's, or the bars' own gravel set (no library set yet) would show them.
