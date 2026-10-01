# Shade: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [x] BUILDINGS (second pass). 52 buildings in nine families from a seeded plan (44),
      built before the walkable grid (80), one mesh per material. Checked: inside their
      places, no overlap in plan and height, rock behind every carved front, every
      family and every plan placed, every entrance reachable (the upper row by its stair).
- [ ] The carved fronts stand proud of a heightfield cliff: the niche round the hall and
      the shrine is geometry (wedge cheeks and a hood), not a recess in the rock, because
      the ground mesh has no overhangs. Interiors are dark planes, not rooms.
- [ ] The upper row of house fronts is reached by the rock-cut stairs, but the walkable
      grid is 2-D: the stairs are blocked cells and the upper doors are "reached" through
      the stair's foot. A climbing route is the life layer's job when people walk.
- [ ] Buildings are merged per material at load: the inspector names each one by its
      registered volume, but a click's full raycast names only the merged mesh.
- [ ] NO ONE WALKS YET. The life layer is data, a walkable grid and A*: 1,060 people
      with jobs and hourly schedules, the raider convoy routed leg by leg. Moving
      instanced people (Voth's `78f-life-citizens.js` is the model to port) come after
      the buildings, so they have doors to walk to.
- [x] Building navigation shadows are applied before the 1.5 m walkable grid is
      built. The door approaches and Khan court stay open; the probe checks every
      building entrance from the Khan.
- [ ] The convoy's REST stop resolves to the Khan (nearest place offering REST), not the
      tent grounds. Give the convoy its own preference if that matters.
- [ ] The raider convoy is routed at load, not scheduled: `every_days` is data that no
      clock reads yet (Shade has no day/night cycle; the sun is the sky's fixed WNW one).
- [ ] The places' polygons are rectangles typed by hand against the layout. The
      probe checks every one, but moving the basin means moving them.
- [ ] Hover inspection names registered volumes (trees, the falls, the pool), places and
      terrain zones; a floor plant has no volume and is named only on a click (a full raycast).
- [ ] The switchback's legs are straight at a constant depth into the slope, so each leg
      is cut in at one end and built out at the other by ~4 m; the cut and fill faces are
      the terrain's steep blend, not retaining walls. Dry-stone retaining walls are
      still absent from this pass.
- [ ] The sheer faces are 1.25 m mesh cells: vertical enough to carve against, but the
      ground mesh has no overhangs, so the plunge pool cannot undercut the lip.
- [ ] Vendored from `biomes/sedesert/src` with no local changes (`build.py --vendor-check`).
      The kit's budget note does not apply: Shade grows the biome over a 1.2 km radius,
      not 3.25 km.
