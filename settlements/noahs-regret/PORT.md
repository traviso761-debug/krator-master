# settlements/noahs-regret: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 30 (11%) | 14 (5%) | 10 (3%) | 71 (25%) | 156 (56%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.3 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/12-nr-world.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the frames, the hull transform, the ground: pure data |
| `src/14-nr-plan.js` | 24.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the plan: the ring, decks, zones, cabins, lots: pure data |
| `src/27-mat.js` | 8.4 | [G shader] | 13 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 22.2 | [draw] | 44 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 5.1 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-nr-hull.js` | 22.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/41-nr-piers.js` | 5.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-nr-decks.js` | 8.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | builder: draws the decks from the plan (NR); its geometry crosses over as meshes |
| `src/43-nr-fore.js` | 14.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-nr-atrium.js` | 7.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | builder: draws the atrium from NR.ATRIUM |
| `src/46-nr-rooms.js` | 9.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/47-nr-holds.js` | 3.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-nr-top.js` | 3.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/49-nr-arcology.js` | 2.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-nr-anc-kit.js` | 7.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-nr-anc-apt.js` | 6.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-nr-anc-office.js` | 4.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-nr-anc-lab.js` | 8.9 | [draw] | 2 | 2 | 0 | 0 | 0 | 5 | 1 | 0 | 0 | 0 | 0 |  |
| `src/62-nr-pirates.js` | 7.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-nr-flora.js` | 2.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | placeholder flora builders; replace with a biome kit's |
| `src/70-nr-interiors.js` | 37.0 | [web] | 4 | 0 | 0 | 0 | 3 | 2 | 0 | 4 | 0 | 0 | 0 | split: the room data (cabins, templates, records: data) and the instanced drawing and stream tick (web) |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/82-nr-water.js` | 5.2 | [G shader] | 12 | 0 | 0 | 0 | 0 | 2 | 6 | 0 | 0 | 0 | 0 |  |
| `src/89-nr-views.js` | 10.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-scene.js` | 4.6 | [web] | 15 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 1.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91f-furnish.js` | 7.0 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 2.7 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 14.1 | [web] | 13 | 0 | 23 | 14 | 4 | 2 | 0 | 0 | 3 | 0 | 0 |  |
| `src/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `12-nr-world.js` and `14-nr-plan.js` are the world as data: the hull frame (NR_HULL), the ground, and every position
  the arcology owns (the ring in arc-length coordinates, decks, zones, stair cores, cabins, lots). A port reads them.
- `70-nr-interiors.js` mixes the furnishing pass (rooms and records: data, through kits/interiors and core/furnish) with
  the instanced drawing and its stream tick: split it into a data pass and a draw pass when the port comes.
- `30-geo.js` and `81-sky.js` are vendored (kits/scyvoi, settlements/iziz): retag them where they live.
