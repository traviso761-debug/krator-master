# kits/tungang: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 9 (4%) | 0 (0%) | 0 (0%) | 6 (3%) | 214 (93%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 6.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the kit's identity, palette and TG.fg.BOX (riftrim's stand-in boxes: the contract) |
| `src/37-wk-rec.js` | 3.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-fg-kit.js` | 17.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-fg-mass.js` | 21.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-fg-dwell.js` | 9.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-fg-civic.js` | 7.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-fg-stores.js` | 8.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-fg-works.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-fg-road.js` | 16.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-gz-kit.js` | 27.4 | [draw] | 3 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | the Glaziers' boxes (TG.gz.BOX) and their void plans (TG.gz.plan: the one source, data) beside the tiered front's builders: split |
| `src/63-gz-homes.js` | 18.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | the homes' plans (data) and builders |
| `src/65-gz-civic.js` | 16.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | the civic rooms' plans (data) and builders |
| `src/67-gz-works.js` | 18.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 40 | 0 | 0 | 0 | 0 | 0 | the works' plans (data) and builders |
| `src/80-fg-host.js` | 10.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the host API: a world's records drawn dry into a group of their own; its seating (fgSeat) and checks are data |
| `src/84-gz-host.js` | 8.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | the host API: a world's sites drawn dry into a group of their own; TG.gz.voids, carve and the checks are data |
| `src/89-rows.js` | 3.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sheet's rows (data) and its state, read from the URL (?state=worn) |
| `src/91t-fg-sheet.js` | 8.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91z-gz-sheet.js` | 7.7 | [draw] | 2 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | the sheet's Glazier rock (KCAVERN carved from the plans) and the sample scarp, drawn through the host API |
| `src/96t-fg-views.js` | 0.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/96z-gz-views.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-sheet-fg.js` | 1.2 | [web] | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |

## Notes

(none yet: the split lists and the overrides go here)
