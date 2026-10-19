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
the walled Khan, black tents, market stalls, cliff dwellings round the whole rim and two
watch towers (64 buildings, 6 draw calls). The basin's corners are round and uneven; three
alcoves overhang dwellings in the north and south walls, the hall and the shrine stand in true
niches, and the pool undercuts the lip behind the falls (carve patches, `core/terrain/36-core-carve.js`).
The rock is the core's bedded strata (`35-core-strata.js`), shared by the ground, the patches
and the carved stone. `API.md` is the builder contract, `KNOWN_ISSUES.md`
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
| `10..40-core-*` | biome core, vendored from `biomes/sedesert/src` (35: the bedded-rock strata shader); `36-core-carve.js`, the overhangs, is read from `core/terrain` (shared, not vendored) |
| `44-host-layout.js` | WHERE: the map, `terrainH`, `waterH`, the streams, the switchback, the traced foot and cliff runs, the carve patches, `PLACES`, `PORTS`, `SHADE_PLAN` (the seeded building plan) |
| `45-host-stage.js` | renderer, the climate fields, the flora mask (places reserved), `BIO.init`, the ground, the carve patches' meshes (baked occlusion and hood shadow), the water and the falls |
| `50..75-biome-sedesert-*` | the eastern high desert's flora and fauna, vendored |
| `77a-kit-nomad-core.js` | the kit's collector (planar metre UVs, vertex tints) and materials (strata-banded carved stone, adobe, tufa, goat-hair cloth, canvas, timber) |
| `77b..e-kit-nomad-*.js` | the builders: carved (Treasury, crow-step house, rock stair, gallery), pueblo compound, caravanserai, black tent, market stall, cliff pueblo, watch tower |
| `80-host-buildings.js` | builds `SHADE_PLAN`, sets each on the ground, registers it, pushes obstacles, merges all into one mesh per material; `NAV_BLOCK` for 84 |
| `82-host-sky.js` | the standard Krator sky (Inner Wall west, gas giant NE), vendored |
| `84-host-life.js` | the life layer declared into SIM (`core/simulation`, PLAN.md Phase 1): the walkable grid and its A* as SIM's `pedestrian` layer, building navigation shadows, the places and ports, the population; Shade's own audits. Factions, orgs, roles (schedules) and events are `world/*.json`, inlined by `build.py` as `83-host-world-json.js` |
| `86-host-overlay.js` | ribbons for the places and the routes |
| `87-host-views.js` | the preset views (their camera spots are reserved before the flora grows) |
| `88-host-build.js` | build order: the biome grows round the buildings' obstacles, then one bake |
| `89t-shade-tags.js` | the page's core/tags registry (`KTAGS.page`) from REG and `PLACES` |
| `91-shade-probe.js` | Shade's `window._api` fields: the checks and their negatives (handed to core/host's probe) |
| `99-shade-take.js` | the take (`KHOST.take`): views, ground, layers, the inspector's words, the probe's fields |
| core/host (`90..99-host-*`) | the camera, loop, panel, inspector, marks, minimap and probe (`core/host/README.md`) |

Compass: **x east, z south, north is −z**, metres.

## Dev tools

The dev tools are core/host's (`core/host/README.md`, "The keys").

- **Inspector** (a click; I or the hover button for the tip, on by default): the smallest core/tags record under the
  cursor (a building, a tree, the falls, the pool, a carve patch) with its class, culture, types and size; else the
  place (its activities and capacity), the switchback or the terrain zone.
- **Marks** (P): areas, lines and points on the ground, measured and saved (the old polygon tool).
- **Minimap** (M), from the records.
- **Places** and **Routes** (layers in the bar): the reserved places (coloured by kind) with labels,
  the switchback's centreline, the ports; the raider convoy's route and sample
  commutes, all found by A* on the ground.
