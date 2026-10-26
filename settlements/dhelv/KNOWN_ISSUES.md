# settlements/dhelv: known issues

- [x] (2026-10-15) **Dhelv is on core/host** (ROADMAP.md section 10, stage 3 step 5; `core/host/README.md`). `build.py` takes the
      whole interface less `core/space` (core/biome's `40-core-place.js` takes its grid when it is on the page, which would move
      the kipuka's scatter) and `core/edits` (no editor world yet), and leaves out the kit's `92-camera.js` (`KIT_SKIP`; the kit's
      sheet keeps it). `src/92-dhelv-camera.js` keeps the slot (the world built, `VIEWS`) and the names the page and verify.py
      call (`ctl`, `setView`, `applyCam`, `WALK.on`, `toggleWalk`, `MARK.at`, `cutSet`), each a word to the host;
      `src/99-start.js` is the take: the floor (`camGroundY`, none in a void), the walk on the page's core/walk floors, the draw
      (the sky's scene, then the city), FRAME_HOOKS, the sun, the sky camera and the atmosphere in a 'view' subscriber (after
      the camera, the kit's loop's order), the inspector's words (the kit's: a piece, a site and its people), the buttons, and
      the probe as `api`. Proof: `verify.py --assert` 44 PASS, 0 FAIL, the error panel clean, as before; the scene census at
      four views (the rock streamed without a budget) equals the old page's but for 240 hidden triangles, the kit's hidden
      marker pin (the host's pin is its own), and the walkers' instanced bodies, which move (old against old: 112 triangles
      at the west mouth); the inspector names the Smithy (`bld_00027`) from its record, the minimap draws 169 records, a mark
      measures, 0 unknown tags, no errors; C and N and the buttons work; `node tests/test-layout.js` all passed.
- [x] (2026-10-15) **Keys changed with the host:** Dhelv's own map is K (M is the host's minimap; `93-dhelv-map.js`); T (the
      inspector) is I, the hover button; P (the polygon tool) is the host's marks, P; R (run) is gone (Shift is faster, the wheel
      sets the walking speed); the marker is the host's pin (double-click, G, F walks from it, Esc lifts it, as Esc still lets
      a followed walker go). The inspector's card is plain text (the kit's was coloured HTML). C, N, V, [ and ] are as before. - 2026-10-20: description of the port, nothing open.
- [x] (2026-10-15) `?t=` (verify.py loads `?t=4`) pins the host's motion time: FRAME_HOOKS and the atmosphere are handed dt 0
      (the kit's loop handed them real seconds; the shader clock was the only thing `?t` pinned). The ramblers keep their own
      clock (95), the stone door its own step. - 2026-10-20: description of the port, nothing open.
- [x] (2026-10-15) The marks file: core/host (94) reads `<build>/marks.json` only on a page served by `tools/edits/serve.py`
      (GET `/__file`, 204 when none was saved); anywhere else the browser's draft, so no 404 reaches the console. The take passes
      no `marksUrl`.

- [ ] **Meshing the rock is slow: about 7 ms a chunk** (16 m, 32 cells a side). The page meshes near the camera within a
      budget a frame, so a jump to a far view fills in over a few seconds. A worker (P5c) or coarser chunks far off would help.
- [ ] **The direct sun's beam is shadowed only by the meshed rock.** Its spot through an opening casts shadows from the
      cavern chunks near the camera; far from the camera the throat's rock is not meshed, so a low sun's beam can land on a
      floor the rock would hide. The sky's light (straight down each opening) is the larger share and needs no shadow.
- [x] **The Throne kit is not on the flows yet.** Done (P5b): its pioneers on the flows, its forest on the old cone, its
      ruffs on the kipuka's rim (`45-dhelv-bio.js`: Dhelv's own ages and fields, not its flow model).
- [ ] **The ground the cavern meshes at a well's rim is tuff** against the flow's basalt round it.
- [x] **The flows' ages are a noise, not a history.** Done (the shelf): the Throne's own model lays seven flows from vents
      up the flank over the layout's land (`48-dhelv-flows.js`), and the ground is the land plus the lava laid.
- [x] **The ground is one heightfield of 5 m squares, drawn from every view.** Done (the shelf): 50 m tiles at 5, 10 or
      25 m by what passes through them, about 125k triangles. It is still one mesh, drawn from every view.
- [ ] **The spur's walls are one material, darker than the cave's rock.** Columns and a weathered lip on the cave's shader;
      no texture of their own yet (a jointed basalt colonnade would suit; ask the owner for one before painting it in). Where
      a run of columns meets the west face's dressing or the decoy's, a thin dark seam shows between them.
- [ ] **The shelf's three hypertrees and three saplings are the same few trees.** Each is tinted a little and turned; up
      close the saplings read as a plantation. More variants cost load time (about 50 ms each).
- [ ] **The hills' walk floors are quads of 2.5 m** under a finer drawn hill: a walker's feet can sit a few centimetres
      in or over the turf, most near a pad's edge. Their plants are not walk blocks (as the forests').
- [ ] **The mirrors' light is a spot light down each way at the sun's strength**, fixed: the mirror does not turn with the
      hour (PLAN.md 13.5 says "by the hour"); and like the wells' beams it switches on and off with the camera's distance.
- [ ] **The decoy entrance is in no graph**: no walker goes there, and the scouts' patrol does not use it. Its passage is
      walkable (its floor is written) but the nav does not know it.
- [ ] **The rock round the outpost's mouths is kept meshed** (DH_STREAM.pin: about 20 chunks, some 150 ms at the start),
      so the mouths read from anywhere.
- [ ] **The far land has no young lava past the flow model's reach** (1.8 km round the city): from very high the flows end there,
      in lines across the land.
- [ ] **What is drawn is decided by distance and the site's frame, not by occlusion.** A carved interior seen through a long
      window from more than 32 m out shows empty; the inspector's ray still meets furniture that is not drawn.
- [ ] **Headroom is checked on the carved ways and the doors only** (the cavern's `ceilingAt` costs about 1 ms, every 2 m);
      the open floors' grids (the hall, the pits, the apron) are under the hall's dome or the sky.
- [ ] **The stacked-lookup check has one crossing to try** (the cistern's way under the braid); the ledge stands back in
      the wall, not over the square.
- [ ] **About 650 people, not 5,000** (PLAN.md 8.2's numbers are to confirm): the modelled homes hold them; about 170 are
      out at 10:00. `?pop=` scales the homes.
- [ ] **Door transit into carved apartments** (PLAN.md 8.3, 7): the ramblers stop at a building's door and are indoors;
      Dhelv's page has no `IX.life` for the rooms inside.
- [ ] **Only the apron's floor is walked on the surface**; the flows and the shelf's top are not. The forest's plants are
      not walk blocks (a walker passes through a trunk).
- [x] **The cut-away is not wired** for Dhelv's carved sites. Done (P5c): the 32 carved sites nearest the camera, refreshed
      every half second (`dhCutBoxes` in `90-dhelv-scene.js`; the rock's `CV_BOXCUT`). A site farther than the 32nd shows
      shut; past the cut the rock is not drawn, so the view shows the dark behind it.
- [ ] **The hall's wall curves; the carved fronts are flat.** A wide front (an estate, the temple) on the dome's foot stands
      up to a metre off the rock at its ends.
- [ ] **The layout's numbers are a proposal** (PLAN.md section 12); `layout-plan.svg` is drawn for the owner to tune by eye.
- [ ] **The spur's walls cast no shadow** (so large a caster's shadow was drawn only inside the shadow camera's box: a dark
      rectangle moving with the view). The apron is lit in the morning where the shelf would shade it.
- [ ] **The surface checks miss pieces on the defs' own built benches and niches** (lamps, figures): the page's float check
      reads the furniture's meshes only.
- [ ] **The outpost's carved fronts stand in square-cut recesses.** The ground's tile across the west face's step slanted over
      their lower half (the owner: "gallery entrances buried in wall"); over each front's width, between its floor and its top,
      the ground is not drawn and the cavern keeps its rock face instead (`DH_FRONTS`, `dhInFront`). The recess's edges are
      straight, the slant overhangs above its top, and the rock in it is the cave's paler tuff. Its rock is kept meshed as a
      mouth's (about 40 more chunks at the start).
- [ ] **The Godot case (P7) is stand-ins.** The cavern's rock is not meshed in Godot (cavern.json is KCAVERN's plan; its
      marching cubes are not ported, and the chunk meshes are not exported): the walk floors stand in. No furniture,
      interiors, materials or atmosphere are exported yet. The navmesh is baked over the gate-to-temple box only (about
      1.1 km by 300 m, 1 s); the whole city at 0.25 m cells is untried. Godot replays the baked tasks (`KSim`); it does not
      re-plan (`SIM.step` is not ported), so its ramblers stop where the snapshot's tasks end.
