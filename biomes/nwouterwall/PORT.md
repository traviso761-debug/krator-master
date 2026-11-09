# biomes/nwouterwall: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 23 (19%) | 0 (0%) | 0 (0%) | 28 (22%) | 75 (59%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/44s-host-site.js` | 6.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 6.4 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-biome-nwow-layout.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-host-land.js` | 30.8 | [draw] | 21 | 1 | 0 | 0 | 0 | 9 | 7 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/50-biome-nwow-species.js` | 25.5 | [draw] | 0 | 2 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-nwow-trees.js` | 15.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-biome-nwow-floor.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-nwow.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88-host-build.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89a-host-atmos.js` | 1.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos's bindings (bindHost, snowCover): host code |
| `src/89s-host-sky.js` | 4.8 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | the shared sky's host (ATMOS.sky, cloud shade, the weather, snow on the scene); its preset and ridges are data (region/far.py) |
| `src/89w-host-water.js` | 3.3 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 12.4 | [web] | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- `44s-host-site.js` is the station's DATA (its site, relief, landform spec and views); each station's own copy (`stations/<name>/44s-host-site.js`) replaces it. The relief and the landforms are plain functions on core/rand: a Godot port bakes the ground from them (or reads the export's krator-field: the near ground is baked on KFIELD).
- `47-host-land.js` splits: the stream, the landforms (core/terrain KFROST), the baked field and the fields record are data; the ground's shader, the meshes (near, mid, tors, aufeis, Leng) are drawing.
- `region/far.py` (not a fragment: a tool) writes each station's cut of the scale model, embedded by build.py as `44n-host-region.js` (data).
