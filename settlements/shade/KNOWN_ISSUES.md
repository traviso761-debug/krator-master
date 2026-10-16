# Shade: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [x] (2026-10-15) **Shade is on core/host** (ROADMAP.md section 10, stage 3 step 5; `core/host/README.md`). `build.py` takes
      the whole interface less `core/edits` (no editor world yet) and adds `core/rand` and `core/tags`: the camera, the loop,
      the panel, the inspector, marks, the minimap and the probe are the host's. `src/90-host-camera.js` is gone (its name
      would have overridden the shell's camera); `src/91-host-probe.js` is `src/91-shade-probe.js` (its `window._api`
      fields, handed to the host as `api`; setView, views and go are the host's); `src/89t-shade-tags.js` makes `KTAGS.page`
      from REG and PLACES (619 records: 63 buildings, 522 trees, 9 life volumes, 25 features; zero unknown tags; the culture
      `eastern-nomad` is the vocabulary's `nomad`, a building's place is its `district`); `src/99-shade-take.js` is the take.
      Proof: `verify.py --assert` 84 PASS, 0 FAIL, as before; the baseline delta is build time only (triangles 3254283,
      draw calls 48 unchanged); the scene census at four views equals the old page's exactly (old against old: also 0
      differences); the inspector names the Khan (`bld_00017`) and a tent from their records, the minimap draws 602 records,
      a mark measures, no errors.
- [ ] (2026-10-15) What changed with the host: the polygon tool and its panel are gone (the host's marks, P, measure and
      save areas, lines and points); the Inspector, Places and Routes boxes are the bar's hover button (on, as before) and
      its layers (places, routes, flora and fauna, buildings, sky); the HUD's camera line is the stats panel. The keys are
      the host's (W A S D, Q / E, F walk, G and double-click the pin, I hover, P marks, M minimap). The places are records
      but the inspector and minimap skip them (a place's box would hold the Khan's own building); they are in the tags export.
- [ ] (2026-10-15) The marks are read from `../marks.json` (where `tools/edits/serve.py` saves them) only when the page is served
      from the repo root; elsewhere (verify.py serves `dist/` alone) from an empty data URL, so the page reads this browser's
      draft. The host's default, `marks.json` beside the page, is `dist/marks.json` for a page in `dist/` (a core/host question).

- [x] BUILDINGS (second pass). 52 buildings in nine families from a seeded plan (44),
      built before the walkable grid (80), one mesh per material. Checked: inside their
      places, no overlap in plan and height, rock behind every carved front, every
      family and every plan placed, every entrance reachable (the upper row by its stair).
- [x] OVERHANGS, by carve patches (`core/terrain/36-core-carve.js`, shared; NOTES.md option 1): three alcoves with
      dwellings under them, true niches round the hall and the shrine, the undercut behind
      the falls. Checked: each void open under rock, nothing grows under a hood, the alcove
      dwellings clear their ceilings, no camera inside rock, the falls clear of the hood.
- [ ] **Trees and sun shades in the city** (Travis). Every built place is reserved in the
      flora mask (`RESERVED`, 45-host-stage), so the streets and courts are bare stone with
      no shade. Plant street and court trees: places marked `grows`, or the sedesert species
      one at a time (the kit has no single-tree entry yet; xanadu's 55-trees "one tree at a
      point" is the model, added upstream in biomes/sedesert and re-vendored). Hang sun shades (awnings, sails, reed mats)
      over doors, the market and the Khan court; `core/sockets` (awnings) and `core/atmos`
      (street dressing) are the shared candidates. Keep the walkable grid and the entrances
      clear.
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
- [ ] A camera orbiting into a hood's rock is lifted onto the cliff top above it (99-shade-take.js `clampCam`): correct,
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
- [x] The life layer is on SIM (core/simulation, Oct 2026) and SIM steps it: the probe
      decides all 1,060 residents at 2, 8, 13 and 20 h (none stuck, no route failed) and
      runs the raider convoy minute by minute through its legs (ford, Khan, Khan, out by
      the switchback), each with a negative. The convoy has its `raider` role; DEPART and
      IDLE are in `world/activities.json` (so `_life.OUT.activities` is 15, not 13).
- [ ] Nothing steps SIM per frame yet: the clock is held at noon and only the probe
      runs `LIFE.run(minutes)`. Stepping it in the frame loop belongs with drawing the
      people (the item above; PLAN.md Phase 3b), so the CPU is not spent on walkers no
      one sees.
- [x] Building navigation shadows are applied before the 1.5 m walkable grid is
      built. The door approaches and Khan court stay open; the probe checks every
      building entrance from the Khan.
- [ ] The convoy's REST stop resolves to the Khan (nearest place offering REST), not the
      tent grounds. Give the convoy its own preference if that matters.
- [ ] The raider convoy is routed at load, not scheduled: `every_days` is data that no
      clock reads yet (Shade has no day/night cycle; the sun is the sky's fixed WNW one).
- [ ] The places' polygons are rectangles typed by hand against the layout. The
      probe checks every one, but moving the basin means moving them.
- [ ] The inspector (core/host 93) names the smallest core/tags record holding the point (a building, a tree, the
      falls, the pool, a carve patch), else the place, the switchback or the terrain zone (99-shade-take.js); a floor
      plant has no record, so it is named by its mesh's label only.
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
      **Oct 2026:** the biome core moved to `core/biome/` (one copy for every kit) and the kits
      gained `BIO.kit` hooks, so `--vendor-check` reports the core and the hooked fragments as drift.
      The kit's geometry is unchanged (mesh fingerprints, `core/README.md`). Re-vendor, or read
      `core/biome` through a `CORE_BIOME` list, when this world is next rebuilt and verified.
- [ ] (2026-10-06) The nomad kit takes the material library as colour maps (materials.json; src/78b-host-matlib.js swaps NOMAD.MAT's maps; the kit stays Lambert, so no normal maps). The sedesert flora is not wired yet. verify --assert passes.
