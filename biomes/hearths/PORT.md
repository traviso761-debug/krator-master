# biomes/hearths: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 26 (100%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/50-biome-hearths-species.js` | 11.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/55-biome-hearths-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-biome-hearths-stills.js` | 8.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |

## Notes

**The stations' fragments** (`stations/crystals/`, and `stations/hold/` which takes them as its base: PLAN.md sections 18, 19). `tools/audit_port.py` and
`tools/check_port.py` read `src/` and `targets/` only, so these tags are kept here by hand; the two `[G data]` fragments were checked
against `check_port.py`'s browser rules and its `||` rule on 2026-11-03 (none).

| Fragment | Tag | Note |
|---|---|---|
| `stations/crystals/00-head.html`, `99-tail.html` | [web] | page shell |
| `stations/crystals/44z-host-site.js` | [G data] | the site, the network's arguments, the crystal kinds, the hold's numbers (both storeys) |
| `stations/crystals/44zs-host-station.js`, `stations/hold/44zs-host-station.js` | [G data] | the station: which storey the page looks at |
| `stations/crystals/48-hearths-hold.js` | [G data] | the cave, both storeys (KKARST, KCAVERN, KSPELEO, KTHERM), the hold's massing (`HOLD`), the hazards' and the water's records |
| `stations/crystals/85b-host-speleo.js` | [draw] | the active storey's hypogene dress (KSPELEO.mesh), one geometry |
| `stations/crystals/49-host-stage.js` | [web] | renderer, lights, the floor the eye stands on, `BIO.init` |
| `stations/crystals/84-host-rock.js` | [G shader] | the cavern's chunks on KGROUND's layers |
| `stations/crystals/85-host-crystals.js` | [draw] | the crystals instanced; the fake scattering (KHOOK 'selenite') is [G shader] |
| `stations/crystals/86-host-massing.js` | [draw] | the reserved volumes' outlines (`?massing=1`) |
| `stations/crystals/89x-host-air.js` | [G native] | core/atmos and core/water bound: the vents' light, the steam, the hot water |
| `stations/crystals/89z-host-build.js` | [web] | the registry, the hazards registered, the bake |
| `stations/crystals/98u-host-eye.js` | [web] | where a view may stand (eyeAt), the massing view's switch |
| `stations/crystals/98v-host-views.js`, `stations/hold/98v-host-views.js` | [web] | each station's views |
| `stations/crystals/99-host-take.js` | [web] | the inspector, the probe's checks |
