# settlements/yuni: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 123 (12%) | 13 (1%) | 16 (2%) | 157 (15%) | 758 (71%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 9.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 13.4 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 55.6 | [web] | 64 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 33.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-ground.js` | 10.3 | [draw] | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-kit.js` | 30.9 | [draw] | 42 | 0 | 0 | 0 | 0 | 15 | 15 | 2 | 0 | 0 | 0 | REGISTER: every site but a building or fixture (51-fixtures.js has those) also a core/tags record (rid), 2026-10-15 |
| `src/47-texture.js` | 15.1 | [draw] | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/50-structure.js` | 15.4 | [draw] | 8 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-fixtures.js` | 12.7 | [web] | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/52-vault.js` | 14.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 19 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-assets.js` | 22.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 53 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws; 2026-10-15: buildFrom's site carries its turned box for its core/tags record; yuniVetoed (the owner's edits log) skips a moved or removed piece |
| `src/54-under.js` | 7.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 2 | 0 | 0 | 0 | 0 |  |
| `src/55-mid-example.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-mid.js` | 63.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 298 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-poor.js` | 28.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 153 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-rich.js` | 47.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 212 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-civic.js` | 19.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 88 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59a-civic-park.js` | 27.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 133 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59b-civic-library.js` | 28.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 163 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59c-civic-furniture.js` | 9.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-flora.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/61a-ancients-kit.js` | 28.3 | [draw] | 59 | 9 | 0 | 0 | 0 | 28 | 5 | 6 | 0 | 0 | 0 |  |
| `src/61a1-ancients-kit-helpers.js` | 20.1 | [draw] | 30 | 1 | 0 | 0 | 0 | 18 | 0 | 1 | 0 | 0 | 0 |  |
| `src/61a2-ancients-kit-civic.js` | 27.4 | [draw] | 28 | 0 | 0 | 0 | 0 | 35 | 0 | 2 | 0 | 0 | 0 |  |
| `src/61a3-ancients-kit-towers.js` | 26.3 | [draw] | 18 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61a4-ancients-kit-towers2.js` | 24.3 | [draw] | 23 | 2 | 0 | 0 | 0 | 13 | 0 | 1 | 0 | 0 | 0 |  |
| `src/61a5-ancients-kit-houses.js` | 25.1 | [draw] | 46 | 5 | 0 | 0 | 0 | 21 | 5 | 1 | 0 | 0 | 0 |  |
| `src/61a6-ancients-kit-works.js` | 29.6 | [draw] | 20 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61a7-ancients-kit-factory.js` | 26.0 | [draw] | 20 | 0 | 0 | 0 | 0 | 29 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61b-ancients-kit-tail.js` | 23.5 | [draw] | 14 | 1 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |  |
| `src/61c-ancients-glue.js` | 12.8 | [G shader] | 21 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 |  |
| `src/61d-ancients-assets.js` | 13.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/61e-ancients-furniture.js` | 20.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 140 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-plants.js` | 4.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/63-furniture.js` | 9.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 61 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-interiors.js` | 77.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 77 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/65-summit.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/66-canal.js` | 7.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68-place.js` | 39.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69b-yuni-biohost.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69z-yuni-badlands.js` | 2.6 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/70-sheet.js` | 3.0 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-catalog.js` | 3.6 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/72-lights.js` | 5.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 16.7 | [draw] | 32 | 1 | 0 | 0 | 0 | 5 | 5 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-doors.js` | 26.3 | [web] | 14 | 0 | 5 | 1 | 0 | 1 | 6 | 2 | 0 | 0 | 0 | split: data inside host code; 2026-10-15: its buttons (walk, doors, cutaway, export) in #ui, adopted by core/host's bar |
| `src/77-export.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Yuni's part of core/export (2026-10-18): the fixtures section from the core/tags records 51-fixtures.js makes, with their host, and the interiors section (the krator-interiors contract) from the interior plans. Reads plain data at export time only |
| `src/80-camera.js` | 11.9 | [web] | 2 | 0 | 2 | 6 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | on core/host (2026-10-15): ctl shim (theta from +x), setView capture, CAM_FREE and the walk in camClamp, VIEWS, the walker's keys, camFrame and camDraw |
| `src/81-glow.js` | 4.7 | [G native] | 12 | 2 | 0 | 0 | 0 | 2 | 3 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-life.js` | 29.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/85-probe.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Yuni's words for core/host's inspector (inspectDescribe(hit, rec)); SITES lookup |
| `src/87-pathviz.js` | 4.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-underview.js` | 3.2 | [web] | 3 | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88b-yuni-minimap.js` | 5.5 | [web] | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code (the KMAP records are the plan; the panel and camera hooks are host) |
| `src/89-sheetui.js` | 4.1 | [web] | 1 | 0 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/98-start.js` | 7.2 | [web] | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KHOST.take (2026-10-15): views, palette (Yuni's furniture and plants), editor world (YWORLD), cutaway units, F for Yuni's walk, the page's frame in a view subscriber |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Core modules (2026-10-05).** Yuni reads `core/lod`, `core/rand` (for `core/tags`' uid hash only), `core/tags`, `core/clock`, `core/sched`, `core/minimap` and `core/materials/record` (`build.py`). The clock (`KCLOCK`) is bound in `21-sky.js` as `YCLOCK`, which replaced the sky's own `SKY_T`: the sky, the lights, the life layer and the windows share one world clock that a port carries as `WorldClock.gd`. The volcano's cycle (`20-stage.js`) is `KSCHED.eruption` on the clock's motion time. `88b-yuni-minimap.js` feeds `KMAP`; `window._minimap.export()` is the plan as data. The material library: `window._materials` is the material table (`KMAT.table('yuni')`), every family a record with its library set or `TEX.def`.

Own copies kept: the PRNG (`rnd`, Park-Miller in `10-core.js`: an exception to `core/rand` by the owner's decision, `GODOT-PLAN.md` Phase 2 item 1), the noise (`h2`, `vn`, `fbm`, `phash` with `Math.sin`), `terrainH`, and the palette (`PAL`/`FAMMAT`).
