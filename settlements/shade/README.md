# Shade

The Eastern Nomads' settlement in the eastern high desert: a sunken sandstone
basin where a stream falls off the plateau into a turquoise plunge pool, runs
across the basin floor and leaves down a slot canyon. About 1,000 people: half
in dwellings carved into the cliffs, half in pueblo blocks and tents on the
floor. The only way up to the plateau is a switchback cut into the north slope.

The world: the terrain and water, the flora and fauna (the `sedesert` biome kit,
vendored), the standard Krator sky, the reserved places, the life layer's data and
walkable grid, and the Eastern Nomad building kit: a rock-cut hall and shrine,
house fronts on two galleries with rock-cut stairs, four stepped pueblo compounds,
the walled Khan, black tents, market stalls and a field of fairy chimneys
(52 buildings, 7 draw calls). `API.md` is the builder contract, `KNOWN_ISSUES.md`
what remains open.

The concept started as a design page and four terrain drafts from Gemini; what
survived of them, and what changed, is in `DESIGN.md`.

## Build and verify

```
cd settlements/shade
python3 build.py                     # -> dist/shade.html; --vendor-check compares the vendored fragments
python3 verify.py dist/shade.html --assert --all-views --out /tmp/shade-shots
```

`verify.py` needs `pip install playwright` and a Chromium (`/opt/pw-browsers` in the
cloud container). `--assert` runs the kit's invariants, Shade's own checks, and
then the **negative controls**: each Shade check is fed a broken input (the falls
pushed into the rock, a stream lifted onto a dyke, a trail straight up the wall,
a place across a stream, a wall across the canyon...) and must fail. A check that
passes its negative cannot fail, and fails the run.

## Layout

| Fragment | What |
|---|---|
| `00-head.html`, `99-tail.html` | page shell (tools panel, polygon box, inspector, HUD, error panel) |
| `10..40-core-*` | biome core, vendored from `biomes/sedesert/src` |
| `44-host-layout.js` | WHERE: the map, `terrainH`, `waterH`, the streams, the switchback, `PLACES`, `PORTS`, `SHADE_PLAN` (the seeded building plan) |
| `45-host-stage.js` | renderer, the climate fields, the flora mask (places reserved), `BIO.init`, the ground, the water and the falls |
| `50..75-biome-sedesert-*` | the eastern high desert's flora and fauna, vendored |
| `77a-kit-nomad-core.js` | the kit's collector (planar metre UVs, vertex tints) and materials (strata-banded carved stone, adobe, tufa, goat-hair cloth, canvas, timber) |
| `77b..e-kit-nomad-*.js` | the builders: carved (Treasury, crow-step house, rock stair, gallery), pueblo compound, caravanserai, black tent, market stall, fairy chimney |
| `80-host-buildings.js` | builds `SHADE_PLAN`, sets each on the ground, registers it, pushes obstacles, merges all into one mesh per material; `NAV_BLOCK` for 84 |
| `82-host-sky.js` | the standard Krator sky (Inner Wall west, gas giant NE), vendored |
| `84-host-life.js` | factions, jobs, schedules, events, the walkable grid, A*, building navigation shadows |
| `86-host-overlay.js` | ribbons for the places and the routes |
| `87-host-views.js` | the preset views (their camera spots are reserved before the flora grows) |
| `88-host-build.js` | build order: the biome grows round the buildings' obstacles, then one bake |
| `90-host-camera.js` | views, orbit/WASD, hover inspector, polygon tool, overlay toggles |
| `91-host-probe.js` | `window._api`: the checks and their negatives |

Compass: **x east, z south, north is −z**, metres.

## Dev tools

- **Inspector (hover)**: names what is under the cursor, its class (flora, place,
  water, terrain, path) and its tags (a species' climate/aridity/riparian tags; a
  place's activities, capacity, culture and building types). A click does a full
  raycast as well, so a floor plant with no registered volume is named too.
- **Polygon tool**: click the ground to add points; the box holds `[[x,z],...]`
  and the same with heights; Undo, Clear, Copy.
- **Places** and **Routes**: the reserved places (coloured by kind) with labels,
  the switchback's centreline, the ports; the raider convoy's route and sample
  commutes, all found by A* on the ground.
