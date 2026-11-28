# kits/dzagh-vardzi: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 30 (14%) | 12 (6%) | 0 (0%) | 1 (1%) | 169 (80%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 6.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27v-dv-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |  |
| `src/28-dv-matfix.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/36p-dv-openfix.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-dv-kit.js` | 15.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| `src/41-dv-roof.js` | 10.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-dv-flume.js` | 12.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 31 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-dv-aul.js` | 13.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/55-sa-beasts.js` | 2.9 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-dv-civic.js` | 24.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56b-dv-wonders.js` | 12.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 48 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-dv-flumeworks.js` | 19.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-dv-hamlet.js` | 17.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-dv-flora.js` | 3.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-dv-census.js` | 5.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89-rows.js` | 2.8 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |  |
| `src/89v-dv-village-head.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90y-dv-terrain.js` | 7.2 | [draw] | 12 | 0 | 0 | 0 | 0 | 2 | 7 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/90z-dv-village.js` | 26.9 | [draw] | 13 | 0 | 0 | 0 | 0 | 53 | 7 | 0 | 0 | 0 | 0 |  |
| `src/91f2-dv-texguard.js` | 1.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-ms-audit.js` | 17.0 | [draw] | 12 | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 |  |

## Notes

(none yet: the split lists and the overrides go here)
