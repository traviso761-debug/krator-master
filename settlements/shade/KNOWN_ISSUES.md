# Shade: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [x] BUILDINGS (second pass). 52 buildings in nine families from a seeded plan (44),
      built before the walkable grid (80), one mesh per material. Checked: inside their
      places, no overlap in plan and height, rock behind every carved front, every
      family and every plan placed, every entrance reachable (the upper row by its stair).
- [x] OVERHANGS, by carve patches (`core/terrain/36-core-carve.js`, shared; NOTES.md option 1): three alcoves with
      dwellings under them, true niches round the hall and the shrine, the undercut behind
      the falls. Checked: each void open under rock, nothing grows under a hood, the alcove
      dwellings clear their ceilings, no camera inside rock, the falls clear of the hood.
- [ ] Overhangs exist only where a patch is declared (a ~30 m box each, ~0.06 M triangles,
      ~0.8 s to mesh and bake at load); a cave system or an arch anywhere along the rim
      needs option 2 (a volumetric wall band). The walkable grid is still 2-D: a floor
      under a hood is walkable, the hood's top is the heightfield's (not walkable over the void).
- [ ] The world casts no shadows; the patches bake the HOOD's own shadow and occlusion
      (into the rock, the ground under it and the alcove dwellings' tints), so a cliff's
      shadow onto the floor beside an alcove is still missing. Shadows are fixed to the sun.
- [ ] Interiors are dark planes, not rooms (another session has the interiors).
- [ ] LOAD TIME: meshing and baking the six patches takes ~4 s at load, on the main thread
      (the occlusion and sun rays are most of it). Bake at build time, or move it to a worker.
- [ ] The hood's top (the plateau over an alcove) takes its ground paint and rock weight from
      the field cache, which reads the lowered heightfield of the recess, so from above it may
      be painted as floor rather than plateau. Not yet checked from an aerial view.
- [ ] The baked shadow and occlusion are per vertex (0.5 m on a patch, 1.25 m on the ground),
      so their edges are soft steps, and they are fixed to the sun's one direction.
- [ ] Only the alcove dwellings take the hood's shade, and from the analytic `floorOcc`/`floorSun`
      in their vertex tints, not marched: their top storeys are as dark as their foot. The hall
      and the shrine in their niches, and the run blocks beside an alcove, are not shaded at all.
- [ ] A camera orbiting into a hood's rock is lifted onto the cliff top above it (90): correct,
      but it pops. Pull it back along its view ray instead.
- [ ] The carve checks sample one point per patch (the void at mid depth, the rock 2 m over the
      ceiling), not the whole void; a hood thinner than 2 m somewhere would pass.
- [ ] A darker ring on the plateau round the basin shows in the overhead views ('Over the basin',
      'From afar'). Seen, not diagnosed: the ground paint or the flora mask's reserve.
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
- [ ] The sheer faces are 1.25 m mesh cells: vertical enough to carve against. Where a
      patch meets them the heightfield's recess runs 2 m behind the void's wall, inside the
      patch's rock, so no ground triangle spikes into the void.
- [ ] Vendored from `biomes/sedesert/src` with no local changes (`build.py --vendor-check`).
      The kit's budget note does not apply: Shade grows the biome over a 1.2 km radius,
      not 3.25 km.
