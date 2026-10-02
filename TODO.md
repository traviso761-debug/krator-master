# Krator: to do

A working list. Items marked *(Menagerie)* come from reading the World Menagerie embedded at
`host/WorldMenagerie/` (paths below are under it). Its code is read for ideas only: anything taken is
rewritten as a Krator fragment, never imported from `host/` (`tools/check_insulation.py`).

## Features

- **Minimap** *(Menagerie: `src/moria/walk.js:130-149`)*. A 2D canvas panel, drawn from data rather than from
  the rendered scene. A base layer is painted once into an offscreen canvas: every walkable floor, sorted by
  height so upper levels cover lower, coloured by level, with labels. Each update (at most 4 Hz, only while
  the panel is open) copies the base layer and draws the viewer's dot and view wedge. Hovering names the floor
  under the pointer; clicking walks there.
  - For Krator: a shared `core/` fragment that paints from each build's `PLACED` list (footprint, rotation,
    tag) plus hill shading sampled from `terrainH()`, and water. Colour by tag, click to fly or walk.
    Start with Voth, whose `PLACED` list is already exposed (`settlements/voth/src/85-probe.js:73`).
  - Optional: a one-time overhead orthographic bake to a texture as the background, for the painted look.
    Hide the sky, fog and inspector helpers during the bake.

## Underground and interiors *(Menagerie: Moria)*

- **The carver registers walkable floors and blockers as it builds** (`src/moria/carve.js`). `room()` and
  `passage()` write `{rect,y}` or `{a,b,w}` floors and `[x0,x1,z0,z1,y0,y1]` blocks as they build. The walker,
  the minimap and click-to-go all read that one list, so they can never disagree with the geometry. Krator's
  walk solids (girder `83-walk.js`) and its geometry are kept separately.
- **Walls are built split round their openings**, not cut afterwards: each wall is pieces left of, below,
  above and right of each opening (`carve.js:28-36`). No CSG is needed, and no hidden faces.
- **Draw underground only when you are under ground** (`src/moria/deep.js:15-24`). Everything built after a
  marker goes into one group. That group is drawn only when the camera is below the terrain or near a gate,
  and the terrain is hidden while you are under. It saved a laptop from crashing. Screamers' vaults and the
  dam tunnels could use this.
- **Fade to dark underground, and carry a lantern** (`deep.js:26-41`): ease a 0-to-1 "under" value. Scale the
  sun, hemisphere and ambient down from the values the day/night code just set, close the fog in to black,
  and move a camera lantern that already exists at intensity 0. Lights are never added or removed, because
  that recompiles every material.
- **Three moving lights for a whole city** (`src/moria/realm.js:31-44`). There are a few point lights, moved
  four times a second to the nearest of a list of light spots. Hundreds of lamp heads are one InstancedMesh
  of unlit material.
- **Shafts of daylight without lights** (`src/moria/halls.js:163-172`): an additive open cone from the window
  to the floor, an additive pool on the floor, and a bright sky card behind the opening.
- **"See inside": the mountain as glass** (`deep.js:46`): terrain at opacity 0.18 with depth write off. Hidden
  features (the Endless Stair) are drawn only in that mode.
- **Polished stone underground uses Phong** (per pixel) so lantern light runs in the walls. Lambert is per
  vertex and loses a small light on big planes.
- **One switch for lit and dark states** (`src/moria/city.js:259-262`): a whole city changes from inhabited to
  ruined by swapping colours and emissive intensity, never geometry. This fits Krator's ruins and inhabited
  variants.
- **The generator checks that every hall is covered by rock** (`tools/make-moria.py:20`). This could be an
  assert in `verify.py` for carved builds.

## Fixes *(Menagerie runtime)*

- Recover from a lost WebGL context: `preventDefault` on `webglcontextlost`, show a panel, restore. No Krator
  build does this (`src/core/shell.js:31-43`). One place for it is `gallery/krator-bar.js` `tune()`.
- Isolate errors per subsystem in the frame loop. In Voth, `updateLife`, `skyAdvance` and the HUD sit outside
  the try (`settlements/voth/src/80-camera.js:303-319`), so one throw means it never draws again.
- Input guards: clear held keys and pointers on blur and on hidden tabs; end a pointer when `buttons===0`;
  ignore keys while typing (`src/core/input.js`).
- Leave a cut plane installed and park it at `constant=1e7`, instead of swapping `clippingPlanes` and
  recompiling (`settlements/yuni/src/76-doors.js:259`, `kits/interiors/src-walk/70-walk.js:213`).
- Call `renderer.compile(scene,camera)` before hiding the loader.
- Redraw the shadow map only when the target moves or the sun turns.

## Rendering ideas *(Menagerie)*

- Cloud shadows and rain darkening through one shared shader chunk (`src/core/env.js:102-118`).
- Lit windows as an emissive texture for massed and distant facades (`src/engine/stages/03-blocks.js`).
- Lamp schedules computed per instance on the GPU (`env.js:82,192-197`).
- A dithered fade before LOD drops an object (`env.js:170-181`).
- Fill a cut solid by drawing its back faces as flat hatching (`src/blame/mats.js:166-176`).
- A per-frame bounding sphere for movers, so off-screen herds and boats are culled.
- One shared polygon-offset ladder, and a shared mitred ribbon helper.

## Worlds *(Menagerie)*

- One land-cover map per world, read by both the ground shader and plant placement
  (`tools/make-yellowstone.py:457-575`, `src/yellowstone/nature.js`).
- A warped-lattice field and hedgerow generator for the highlands and lowlands (`tools/make-shire.py:152-178`).
- Mountain height functions: range walls, junctions that don't double up, volcano cones
  (`tools/make-mordor.py:84-181`).
- Distant mountain ranges drawn at their true angular size as a backdrop (`src/minastirith/shadow.js`).
- River foam driven by slope, and a water surface that never climbs downstream (`src/rivendell/water.js`,
  `src/isengard/isen.js`).
- Pull a buried camera back along its line of sight (`src/blame/main.js:115-142`); a circle walker with corner
  push-out (`src/backrooms/level.js:395-419`); a lift you can ride.

## Testing *(Menagerie)*

- Layout fingerprints compared with saved goldens, which can prove a refactor changed nothing in the world.
  Refuse an empty fingerprint.
- Fail on WebGL and shader errors in the console.
- Voth: set `_ready`, and replace the fixed sleeps with "N frames since ready".
- `tools/test-all.py -j N`, running the `core/**/test-*.js` unit tests first; `build.py --check` for a stale
  `dist/`.
- One shared `tools/harness.py` instead of 25 copies inside the `verify.py` files.
