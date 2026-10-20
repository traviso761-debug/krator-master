# kits/eternian: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 26 (10%) | 6 (2%) | 10 (4%) | 24 (9%) | 200 (75%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 3.4 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/26k-kit.js` | 4.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27-mat.js` | 6.4 | [G shader] | 12 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |  |
| `src/28-et-mat.js` | 1.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 22.2 | [draw] | 44 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 5.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/37-wk-rec.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/38-et-alt.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-et-kit.js` | 8.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 |  |
| `src/41-et-profile.js` | 8.0 | [draw] | 6 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-et-head.js` | 10.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-et-statue.js` | 4.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-et-roof.js` | 8.6 | [draw] | 15 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45-et-samples.js` | 5.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-et-civic-kit.js` | 3.6 | [draw] | 6 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-et-dwell.js` | 11.9 | [draw] | 8 | 0 | 0 | 0 | 0 | 29 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-et-dwell-mid.js` | 7.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-et-dwell-rich.js` | 8.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-et-court.js` | 5.3 | [draw] | 5 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-et-dwell-hex.js` | 3.2 | [draw] | 3 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-et-state.js` | 9.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61-et-defence.js` | 5.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-et-machine.js` | 10.4 | [draw] | 10 | 0 | 0 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-et-faith.js` | 8.7 | [draw] | 6 | 0 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-et-trade-kit.js` | 6.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-et-works.js` | 6.2 | [draw] | 5 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-et-trades.js` | 14.4 | [draw] | 12 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 |  |
| `src/67-et-land.js` | 6.6 | [draw] | 13 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/68-et-trades.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-et-canal.js` | 5.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 13 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71-et-harbour.js` | 11.0 | [draw] | 17 | 0 | 0 | 0 | 0 | 33 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/89-rows.js` | 2.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 6.2 | [web] | 15 | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91c-et-clock.js` | 2.9 | [draw] | 9 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91d-et-water.js` | 2.2 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91f-furnish.js` | 6.0 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 2.6 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-world.js` | 0.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/93e-et-export.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 7.2 | [web] | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
