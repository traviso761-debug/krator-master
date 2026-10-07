# kits/ash-nomads: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 27 (16%) | 6 (4%) | 10 (6%) | 33 (20%) | 92 (55%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.4 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/26k-kit.js` | 4.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27-mat.js` | 6.4 | [G shader] | 12 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 22.2 | [draw] | 44 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 5.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-tk-tentkit.js` | 20.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40a-ak-ash.js` | 16.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/41-tk-dress.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-as-small.js` | 5.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-al-large.js` | 7.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/46-ac-chief.js` | 6.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/48-at-trade.js` | 8.4 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sa-beasts.js` | 8.4 | [draw] | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-ah-pens.js` | 4.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/89-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 6.2 | [web] | 15 | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 1.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91f-furnish.js` | 5.9 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 2.6 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 12.5 | [web] | 12 | 0 | 21 | 14 | 4 | 2 | 0 | 0 | 3 | 0 | 0 |  |
| `src/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
