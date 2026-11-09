# biomes/ancientsvalley: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 39 (19%) | 0 (0%) | 4 (2%) | 124 (62%) | 32 (16%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-av-field.js` | 13.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41b-av-wrecks.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46-av-feral.js` | 13.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46z-host-stage.js` | 29.3 | [web] | 0 | 0 | 2 | 1 | 3 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-host-land.js` | 8.5 | [web] | 14 | 2 | 1 | 0 | 0 | 3 | 5 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/70-host-city.js` | 40.7 | [web] | 32 | 0 | 0 | 0 | 6 | 9 | 2 | 21 | 0 | 0 | 0 |  |
| `src/71-host-creepers.js` | 5.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 3 | 0 | 2 | 0 | 0 | 0 |  |
| `src/72-host-keepers.js` | 6.4 | [web] | 0 | 0 | 0 | 2 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/73-host-wrecks.js` | 6.7 | [web] | 1 | 0 | 0 | 0 | 5 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/74-host-transit.js` | 10.3 | [web] | 1 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-host-extraplanar.js` | 14.3 | [web] | 1 | 0 | 0 | 0 | 2 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 6.8 | [web] | 1 | 0 | 0 | 0 | 2 | 2 | 0 | 1 | 0 | 0 | 0 | split: data inside host code |
| `src/89a-host-atmos.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89s-host-sky.js` | 2.8 | [G native] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89t-host-weather.js` | 0.6 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89u-host-steam.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89v-host-smog.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89w-host-water.js` | 3.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89x-host-xp-weather.js` | 0.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 21.6 | [draw] | 0 | 1 | 0 | 0 | 0 | 6 | 0 | 2 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
