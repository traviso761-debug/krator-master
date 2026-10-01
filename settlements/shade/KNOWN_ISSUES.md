# Shade: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] NO BUILDINGS YET. Every place is reserved and checked, and the builder contract is
      in `API.md`; the Petra facades, fairy chimneys, pueblo blocks and haircloth tents
      are the next pass.
- [ ] NO ONE WALKS YET. The life layer is data, a walkable grid and A*: 1,060 people
      with jobs and hourly schedules, the raider convoy routed leg by leg. Moving
      instanced people (Voth's `78f-life-citizens.js` is the model to port) come after
      the buildings, so they have doors to walk to.
- [ ] The walkable grid is 1.5 m cells with a 0.36 grade limit and no obstacles: once
      buildings stand, their footprints must be blocked in `LIFE.NAV` (84) and the
      reachability checks rerun.
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
      the terrain's steep blend, not retaining walls. Dry-stone retaining walls belong
      to the building pass.
- [ ] The sheer faces are 1.25 m mesh cells: vertical enough to carve against, but the
      ground mesh has no overhangs, so the plunge pool cannot undercut the lip.
- [ ] Vendored from `biomes/sedesert/src` with no local changes (`build.py --vendor-check`).
      The kit's budget note does not apply: Shade grows the biome over a 1.2 km radius,
      not 3.25 km.
