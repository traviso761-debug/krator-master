# biomes/nwbay-caves: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Notes

**The station's fragments** (`stations/cenote/`, the one page this build writes so far: PLAN.md). `tools/audit_port.py` and `tools/check_port.py`
read `src/` and `targets/` only, so these tags are kept here by hand; the two `[G data]` fragments were checked against `check_port.py`'s
browser rules and its `||` rule on 2026-11-09.

| Fragment | Tag | Note |
|---|---|---|
| `stations/cenote/00-head.html`, `99-tail.html` | [web] | page shell |
| `stations/cenote/44z-host-site.js` | [G data] | the site in nwbay's frame, the ground raster (decoded by hand: no `atob`), the network's arguments |
| `stations/cenote/48-nwbay-caves.js` | [G data] | the cave (KKARST, KCAVERN, the cenote), the dress (KSPELEO), the hazards' records |
| `stations/cenote/49-host-stage.js` | [web] | renderer, lights, the floor under the eye (KCAVERN.floorFn), `BIO.init` |
| `stations/cenote/84-host-rock.js` | [G shader] | the rock on KCAVERN.drawRock and KGROUND's layers |
| `stations/cenote/85-host-dress.js` | [draw] | the limestone dress (KSPELEO.mesh), one geometry |
| `stations/cenote/89x-host-air.js` | [G native] | core/atmos and core/water bound: the shaft of daylight, the cenote's surface, the haze by the eye's height |
| `stations/cenote/89z-host-build.js` | [web] | the registry, the hazards recorded, the bake |
| `stations/cenote/99-host-take.js` | [web] | the views, the inspector, the probe's checks |
