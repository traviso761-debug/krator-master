# openworld/isle-demo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 82 (31%) | 10 (4%) | 9 (3%) | 164 (62%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/43-world-isles.js` | 9.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46-world-config.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/47-world-kits.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/48-world-hamlets.js` | 5.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/48k-world-camps.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the bands' camps: the site, KCAMP.pitch and KCAMP.census (core/camp); no three.js, no geometry, no DOM |
| `src/48t-world-towns.js` | 8.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88a-world-atlas.js` | 10.2 | [G shader] | 12 | 1 | 0 | 0 | 0 | 1 | 10 | 0 | 0 | 0 | 0 | how the near pieces are drawn: texture arrays and merged geometry (a WebGL2 drawing step; Godot draws the pieces from the export) |
| `src/88c-world-life.js` | 12.5 | [web] | 8 | 0 | 5 | 1 | 5 | 1 | 0 | 3 | 0 | 0 | 0 | the sim stepped on the world's clock, its citizens and the canoe line drawn: host code; the sea route is data (48t seaPath) |
| `src/88h-world-hamlets.js` | 11.3 | [web] | 17 | 0 | 0 | 0 | 2 | 3 | 0 | 4 | 0 | 0 | 0 |  |
| `src/88k-world-camps.js` | 9.3 | [web] | 11 | 0 | 0 | 0 | 2 | 1 | 0 | 3 | 0 | 0 | 0 | draws 48k's records (CAT's tent set, the hedge cut by BR_RUN); core/tags; the keep-clear hook; window._camps checks |
| `src/88t-world-towns.js` | 24.6 | [web] | 18 | 1 | 0 | 0 | 8 | 3 | 0 | 9 | 0 | 0 | 0 | draws the towns 48t planned (the city page's 60, read in place as a factory) with an HLOD (full near, baked proxies, massing far; the bake is a drawing step) and binds the export to one town; the plans and the sim are data (48t) |
| `src/89-world-geysers.js` | 6.1 | [web] | 2 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | 0 | lays the geyser kit at the vents and builds each site near the camera; the layout (GEYSER.cluster) is data for the port |
| `src/world/00-head.html` | 4.9 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/world/41-world-fields.js` | 39.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/42-world-roads.js` | 10.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/45-world-host.js` | 5.1 | [web] | 9 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/80-world-sky.js` | 9.1 | [G native] | 15 | 1 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/world/81-world-terrain.js` | 11.3 | [web] | 10 | 1 | 0 | 0 | 3 | 2 | 5 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/world/83-world-water.js` | 2.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/world/83w-world-seas.js` | 3.9 | [web] | 2 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 0 | 0 | 0 |  |
| `src/world/84-world-nursery.js` | 13.0 | [web] | 8 | 0 | 0 | 0 | 6 | 1 | 10 | 0 | 0 | 0 | 0 |  |
| `src/world/85-world-flora.js` | 13.5 | [web] | 4 | 0 | 0 | 0 | 5 | 2 | 0 | 4 | 0 | 0 | 0 |  |
| `src/world/86-world-floor.js` | 6.0 | [web] | 5 | 0 | 0 | 0 | 5 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/87-world-places.js` | 2.7 | [web] | 6 | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/88-world-towns.js` | 9.0 | [web] | 20 | 0 | 0 | 0 | 2 | 2 | 0 | 3 | 0 | 0 | 2 |  |
| `src/world/90-world-camera.js` | 12.6 | [web] | 3 | 3 | 6 | 14 | 0 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `src/world/91-world-probe.js` | 12.1 | [web] | 0 | 0 | 1 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/world/98-world-start.js` | 5.8 | [web] | 0 | 1 | 2 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 1 |  |
| `src/world/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
