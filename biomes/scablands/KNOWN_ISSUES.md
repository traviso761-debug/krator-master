# biomes/scablands: known issues

Open items are `- [ ]`; `build.py` counts them. Close an item when the fix is in and verified.

- [ ] **The high line's NW lowlands half is on the plan's ground, not the model's** (`stations/highline-nw`, 2026-11-10). Its sky's site (px 400,170)
  is approximate and its levels the plan's (834 and 430 m), as station 2's are; the strait through the spur is this station's own landform (a
  KSCOUR course where the rising lake poured through a gap), not a course in `DATA.floods`. The owner's eye on the site, the strait and the
  young forest's look (open stands of pioneers on a 30 m lattice, held to the budget: 13.9 M held; the strait's sunlit walls read pale).
- [ ] **The high line's site and levels are the plan's** (834 and 430 m), not scale model 5.1's, which moved the trough: the owner's eye on both.
- [ ] **The high line's flood lake bed is on the kit's desert, thinned** (`stations/highline/56`: `NSEMIARID.ZONE_HOOK`, two fifths): the
  crawler fields put the floor at 22.8 M triangles, over its 16 M budget. No salt on a fresh-water bed is the reason given; the look is the
  owner's to judge.
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

- [x] **The high line's lowlands half** (closed 2026-11-10). Built as `stations/highline-nw` on NW lowlands' new rock zone, bed and silt
  response and overlay build (`biomes/nwlowlands/src/57-biome-nwlowlands-overlay.js`, `build(overlay=...)`; PLAN.md section 8). GPU `--assert --all-views`.
- [x] **The high line's hulks** (closed 2026-11-10). Five of the dam lake's boats on the line (`stations/highline/`: records `HULKS` in `45b`, drawn by
  `87h`), the dam basins' wreck kind (`DBW`, `biomes/dambasins/src/50-db-wrecks.js`) read in place: in KBASIN's band `high`, laid along the line,
  heeled toward the bed, half sunk in its silt; registered and obstacles before the kit plants, out of the stage's mask. Checked with negatives (on the
  band, keel in and deck out, heeled downhill, no plant inside). Not the Ancient Port kit's great ships: those stayed in the dam bed's berths (the dam
  basins ground them there), and reading one here would mean sealing the whole port kit into this page (PLAN.md section 7). GPU `--assert --all-views`.

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
