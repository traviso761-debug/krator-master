# settlements/mavs-refuge: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 56 (8%) | 0 (0%) | 15 (2%) | 325 (45%) | 319 (45%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.2 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 7.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.9 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 54.3 | [web] | 62 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 29.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-branches.js` | 7.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-kit.js` | 36.5 | [draw] | 40 | 0 | 0 | 0 | 0 | 13 | 15 | 2 | 0 | 0 | 0 | REGISTER: every site also a core/tags record (rid; queued until the vocabulary loads, regFlush), 2026-10-15 |
| `src/47-texture.js` | 10.3 | [draw] | 4 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/50-structure.js` | 17.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-furnish.js` | 9.5 | [draw] | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the draw adapter onto core/furnish (2026-10-05): the placement pass is core/furnish/50-core-furnish.js. Kept here: the seed rule (a hash of the spot), BRF_SHIFT (handed to core as its recentring table), brfIn/brfDone and the FRM frame, o.lamp lights, the Lambert tint per family at the flush; 2026-10-15: brfVetoed, the owner's edits log (KHOST_EDITS) vetoes a moved or removed piece at draw |
| `src/55-arch.js` | 63.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-levels.js` | 70.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57a-interiors.js` | 30.1 | [web] | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 1 | 0 | the interiors’ data: units, plans, piece records, the bake’s adoption, the edits overlay, the slots the simulation reads; no THREE (performance.now and TICKS only); 2026-10-15: mixTag registers each piece in core/tags as its unit's record is made; piecesNow leaves out a piece the edits log moves or removes |
| `src/57c-interiors-draw.js` | 26.5 | [web] | 18 | 1 | 0 | 0 | 10 | 12 | 0 | 0 | 0 | 2 | 0 | the interiors near the camera: geometry from 57a’s records, the light pool, the edits’ browser storage |
| `src/60-trees.js` | 40.4 | [web] | 35 | 2 | 0 | 0 | 2 | 8 | 8 | 5 | 0 | 0 | 0 |  |
| `src/62-jungle.js` | 45.3 | [draw] | 15 | 4 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-trails.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/65-mr-trades.js` | 5.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Voth census table MR_TRADES (2026-10-19): plain data, a row per census trade; checked by tools/check_trades.py |
| `src/72-lights.js` | 3.0 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 6.1 | [draw] | 16 | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78-life.js` | 50.8 | [web] | 21 | 0 | 0 | 0 | 7 | 42 | 4 | 5 | 0 | 0 | 0 | split: data inside host code |
| `src/79-spiders.js` | 60.0 | [draw] | 26 | 0 | 0 | 0 | 0 | 39 | 0 | 2 | 0 | 0 | 0 |  |
| `src/80-camera.js` | 6.7 | [web] | 1 | 0 | 2 | 3 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | on core/host (2026-10-15): ctl shim over the host's camera (theta from +x), setView capture for the presets, VIEWS, pickWorld, the day/night slider |
| `src/81-glow.js` | 5.8 | [G native] | 13 | 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-flyers.js` | 22.7 | [web] | 12 | 0 | 0 | 0 | 0 | 7 | 3 | 1 | 0 | 0 | 0 |  |
| `src/84a-flyers-routes.js` | 15.2 | [web] | 32 | 0 | 0 | 0 | 0 | 1 | 3 | 2 | 0 | 0 | 0 |  |
| `src/84b-flyers-animals.js` | 20.6 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84c-flyers-update.js` | 14.7 | [web] | 3 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84d-flyers-hooks.js` | 7.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-probe.js` | 0.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Mav's words for core/host's inspector (inspectDescribe(hit, rec)); SITES lookup |
| `src/87-pathviz.js` | 3.2 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/98-start.js` | 8.2 | [web] | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | KHOST.take (2026-10-15): views, palette, editor world (MWORLD), cutaway units, minimap, two-pass sky draw, the page's per-frame work in a view subscriber |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
