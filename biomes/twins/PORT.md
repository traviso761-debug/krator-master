# biomes/twins: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (2%) | 0 (0%) | 6 (10%) | 32 (49%) | 25 (39%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 3.5 | [web] | 6 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45a5-host-region.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | REGION: the map's relief round the site (scale model 5.1), plain functions |
| `src/45c-host-field.js` | 8.5 | [web] | 0 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/50-biome-twins-species.js` | 6.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/60-biome-twins-ground.js` | 5.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-biome-twins.js` | 1.5 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/82-host-far.js` | 3.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the far country on KFAR (core/terrain 44): the mesh is drawn by core; the colour rule is data |
| `src/84-host-ground.js` | 14.1 | [web] | 11 | 3 | 0 | 0 | 2 | 4 | 7 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.5 | [web] | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-sky.js` | 1.4 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 1.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the page's binding of core/atmos (bindHost, bindWeather) and core/hazard's ambient fields: host code, not data |
| `src/89b-host-twins.js` | 2.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Twins' records (data) and their plumes and glow on core/atmos (drawn) |
| `src/89zz-host-shadow.js` | 1.0 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 10.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- Every page is a station: `stations/<name>/` holds the station's own fragments (44a the station, 45b its ground model: plain functions, [G data];
  87 its cavern and structures: KCAVERN's plan is data, its lit material and instancing are [draw]; 98 its views and checks: [web]). The audit
  scans `src/` only; the station rows are kept here by hand.
- `stations/pyroduct/45b-host-model.js` [G data]: the First Breath's ground (the map's slope, the coulee, the trench, the route), KFROST and KSTRATA.
- `stations/pyroduct/87-host-tube.js` [draw] (split): the tubes, the skylight and the portal as a KCAVERN plan (data, exportable: `C.export()`), then
  their lit ShaderMaterial, the drips and the breakdown blocks as InstancedMeshes (draw).
