# settlements/locus: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 101 (21%) | 5 (1%) | 18 (4%) | 170 (36%) | 176 (37%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.4 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 13.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.0 | [web] | 22 | 8 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 56.4 | [web] | 67 | 0 | 19 | 6 | 0 | 9 | 26 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 40.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-ground.js` | 7.4 | [draw] | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/45-kit.js` | 31.5 | [draw] | 42 | 0 | 0 | 0 | 0 | 14 | 15 | 2 | 0 | 0 | 0 | REGISTER: every site also a core/tags record (rid; queued until the vocabulary loads, regFlush; not in Verge's YKIT), 2026-10-15 |
| `src/47-texture.js` | 17.0 | [draw] | 4 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-structure.js` | 9.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-assets.js` | 23.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws; 2026-10-15: buildAsset's site carries key, family, culture and its turned box for its core/tags record |
| `src/60-flora.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/62-plants.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/63-furniture.js` | 9.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 61 | 0 | 0 | 0 | 0 | 0 |  |
| `src/66-locus-furnish.js` | 12.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the draw adapter onto core/furnish (2026-10-05): the placement pass is core/furnish/50-core-furnish.js. Kept here: the seed rule (frame seed and spot), the frame stack round every ASSET build, the open rooms deferred to the interiors, the interior-set item per variant, night lamps, inspector entries, the linear colours at the flush; 2026-10-15: locfVetoed (the owner's edits log vetoes a moved or removed piece at draw); interior pieces registered (ixf_) |
| `src/67-lo-trades.js` | 6.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Voth census table LO_TRADES (2026-10-19): plain data, a row per census trade; checked by tools/check_trades.py |
| `src/68-place.js` | 17.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/68c-locus-crossings.js` | 10.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/69b-locus-biohost.js` | 3.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69z-locus-flora.js` | 5.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/70-sheet.js` | 3.7 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-catalog.js` | 3.6 | [draw] | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/71g-locus-grid.js` | 9.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lights.js` | 5.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 14.2 | [draw] | 24 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/76-locus-anim.js` | 8.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 |  |
| `src/80-camera.js` | 10.0 | [web] | 2 | 0 | 3 | 3 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | on core/host (2026-10-15): ctl shim (theta from +x), setView capture and CAM_FREE, VIEWS, the world clock LCLOCK, camFrame and camDraw |
| `src/81-glow.js` | 6.9 | [G native] | 11 | 2 | 0 | 0 | 0 | 2 | 3 | 1 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-locus-fauna.js` | 12.4 | [draw] | 8 | 0 | 0 | 0 | 0 | 18 | 0 | 1 | 0 | 0 | 0 |  |
| `src/84-life.js` | 50.9 | [web] | 13 | 0 | 0 | 0 | 1 | 15 | 0 | 1 | 0 | 0 | 0 | split: data inside host code |
| `src/85-probe.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the page's words for core/host's inspector (inspectDescribe(hit, rec)); SITES lookup |
| `src/87-pathviz.js` | 4.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88b-locus-minimap.js` | 3.2 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-sheetui.js` | 4.1 | [web] | 1 | 0 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/90-atmos-host.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90w-lake.js` | 5.1 | [G shader] | 3 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | the open lake's binding of core/water (its shader is core/water's; the shoreline mask and the plume are the only GLSL here) |
| `src/95-locus-doors.js` | 5.0 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2026-11-03: core/door's host binding: each KDOOR leaf posed through its kit instance (KDOORHOST.posed), the walk blocks, the E tip, the probe's counts, LDOOR.reach (the audit). The records are core/door's |
| `src/98-start.js` | 7.1 | [web] | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KHOST.take (2026-10-15; Mungo reads it too): views, palette, editor world (LWORLD), cutaway units, the page's frame in a view subscriber |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
