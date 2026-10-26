# kits/yeti: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 27 (14%) | 6 (3%) | 10 (5%) | 23 (12%) | 134 (67%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 2.7 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/26k-kit.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27-mat.js` | 6.4 | [G shader] | 12 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |  |
| `src/28-yt-mat.js` | 1.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 22.2 | [draw] | 44 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 5.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/37-wk-rec.js` | 2.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-yt-kit.js` | 17.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/41-yt-heat.js` | 5.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-yt-tunnel.js` | 12.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/43-yt-craft.js` | 1.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-yt-props.js` | 4.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-yt-dwell.js` | 11.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-yt-cluster.js` | 8.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-yt-rich.js` | 2.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/53-yt-balagan.js` | 7.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/55-yt-samples.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/56-yt-street.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/60-yt-state.js` | 8.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61-yt-works.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/62-yt-stores.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-yt-land.js` | 6.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/64-yt-war.js` | 5.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-yt-trades.js` | 4.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/89-rows.js` | 2.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 6.2 | [web] | 15 | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90y-yt-ground.js` | 4.3 | [draw] | 7 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91f-furnish.js` | 6.0 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 2.6 | [draw] | 6 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91y-yt-night.js` | 0.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-world.js` | 0.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/93-anim.js` | 2.5 | [draw] | 5 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 7.2 | [web] | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
