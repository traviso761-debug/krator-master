# settlements/voth: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 164 (9%) | 0 (0%) | 6 (0%) | 378 (21%) | 1245 (69%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.8 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 25.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 |  |
| `src/10-core.js` | 10.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/15-shore.js` | 3.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/20-stage.js` | 24.7 | [web] | 21 | 6 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 52.9 | [web] | 61 | 0 | 14 | 5 | 0 | 9 | 24 | 0 | 0 | 0 | 0 |  |
| `src/30a-layout-districts.js` | 24.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30b-mainland-shore.js` | 18.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30c-roads.js` | 42.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30d-wall-stations.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-ground.js` | 11.3 | [draw] | 0 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-kit.js` | 30.0 | [draw] | 18 | 0 | 0 | 0 | 0 | 25 | 18 | 3 | 0 | 0 | 0 |  |
| `src/47-texture.js` | 15.7 | [draw] | 4 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50a-cantons.js` | 20.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 1 | 0 | 0 | 0 |  |
| `src/50b-palace.js` | 58.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 78 | 0 | 1 | 0 | 0 | 0 |  |
| `src/50c-canton-types.js` | 36.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50d-guild.js` | 59.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 80 | 0 | 7 | 0 | 0 | 0 |  |
| `src/50e-necropolis.js` | 35.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50f-spans-build.js` | 19.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/55-chinampa.js` | 23.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/60-land.js` | 59.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 32 | 0 | 1 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/61-monastery.js` | 50.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 71 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65a-smoke.js` | 21.2 | [web] | 7 | 0 | 0 | 0 | 4 | 4 | 1 | 3 | 0 | 0 | 0 |  |
| `src/65b-town-props.js` | 32.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 55 | 0 | 2 | 0 | 0 | 0 |  |
| `src/65c-flora.js` | 25.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 48 | 0 | 1 | 0 | 0 | 0 |  |
| `src/65d-canton-structures.js` | 30.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 44 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65e-docks-ferry-fishing.js` | 39.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 1 | 0 | 0 | 0 |  |
| `src/65f-shrines-barge-docks.js` | 15.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65g-coastguard-dock.js` | 36.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65h-showcase.js` | 23.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 41 | 0 | 1 | 0 | 0 | 0 |  |
| `src/65i-wall-gates.js` | 17.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 13 | 0 | 1 | 0 | 0 | 0 |  |
| `src/65j-tavern-healing.js` | 26.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65k-granary-mills-ranch.js` | 28.3 | [web] | 6 | 0 | 0 | 0 | 6 | 43 | 0 | 3 | 0 | 0 | 0 |  |
| `src/65l-arena-built.js` | 16.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 27 | 0 | 3 | 0 | 0 | 0 |  |
| `src/66-striders.js` | 11.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-props.js` | 9.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69-district-content.js` | 69.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 47 | 0 | 1 | 0 | 0 | 0 |  |
| `src/70-veg.js` | 35.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 23 | 0 | 1 | 0 | 0 | 0 |  |
| `src/71-industry.js` | 42.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 35 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lanterns.js` | 5.9 | [G native] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 8.5 | [draw] | 17 | 1 | 0 | 0 | 0 | 2 | 10 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78a-life-core.js` | 14.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78b-life-nav.js` | 41.0 | [web] | 32 | 0 | 0 | 0 | 1 | 13 | 0 | 3 | 0 | 0 | 0 | split: data inside host code |
| `src/78c-life-ships.js` | 70.5 | [draw] | 27 | 0 | 0 | 0 | 0 | 30 | 14 | 14 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78d-life-ferries-barges.js` | 62.8 | [draw] | 59 | 0 | 0 | 0 | 0 | 31 | 1 | 14 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78e-life-dhows.js` | 36.8 | [web] | 21 | 0 | 0 | 0 | 1 | 13 | 1 | 8 | 0 | 0 | 0 | split: data inside host code |
| `src/78f-life-citizens.js` | 44.4 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78g-life-monks.js` | 28.6 | [draw] | 11 | 0 | 0 | 0 | 0 | 4 | 0 | 3 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78h-life-temple.js` | 50.9 | [draw] | 22 | 0 | 0 | 0 | 0 | 9 | 0 | 2 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78i-life-trade.js` | 28.1 | [draw] | 37 | 0 | 0 | 0 | 0 | 23 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78j-life-arena.js` | 52.9 | [draw] | 81 | 0 | 0 | 0 | 0 | 58 | 0 | 9 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/79a-convoys.js` | 11.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |  |
| `src/79b-strider-nav.js` | 35.5 | [web] | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/79c-strider-model.js` | 42.3 | [draw] | 50 | 0 | 0 | 0 | 0 | 32 | 0 | 3 | 0 | 0 | 0 |  |
| `src/80-camera.js` | 20.9 | [web] | 10 | 0 | 10 | 13 | 1 | 2 | 0 | 1 | 3 | 0 | 0 |  |
| `src/82-daynight.js` | 46.9 | [web] | 49 | 6 | 3 | 4 | 3 | 6 | 0 | 12 | 0 | 0 | 0 |  |
| `src/83-weather.js` | 8.1 | [web] | 16 | 0 | 2 | 1 | 0 | 2 | 0 | 4 | 0 | 0 | 0 |  |
| `src/84-fauna.js` | 10.1 | [web] | 13 | 0 | 0 | 0 | 5 | 5 | 0 | 4 | 0 | 0 | 0 |  |
| `src/85-probe.js` | 5.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 15.4 | [web] | 2 | 0 | 8 | 2 | 1 | 0 | 0 | 8 | 2 | 0 | 0 |  |
| `src/87-pathviz.js` | 21.1 | [web] | 9 | 0 | 6 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88b-voth-minimap.js` | 3.0 | [web] | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
