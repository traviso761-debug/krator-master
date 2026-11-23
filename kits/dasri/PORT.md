# kits/dasri: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 20 (11%) | 0 (0%) | 0 (0%) | 21 (12%) | 132 (76%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 3.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32-ds-plan.js` | 8.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/40-ds-kit.js` | 11.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-ds-ornament.js` | 18.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 54 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-ds-jabal-dwell.js` | 19.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | urban tower-house builders |
| `src/52d-ds-tags.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opt-in culture id registration |
| `src/54-ds-jabal-trade.js` | 18.9 | [draw] | 2 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | urban souq and workshop builders |
| `src/58-ds-jabal-civic.js` | 21.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | urban civic and landmark builders |
| `src/62-ds-village-dwell.js` | 14.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | village dwelling builders |
| `src/66-ds-village-works.js` | 22.6 | [draw] | 6 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 | village works and oasis qasr builders |
| `src/68-ds-trades.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Voth census trades table |
| `src/80-ds-host.js` | 5.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | DASRI / DS host API |
| `src/89-rows.js` | 1.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | standalone inspection row table |
| `src/91z-ds-sheet.js` | 12.9 | [web] | 25 | 3 | 0 | 0 | 0 | 7 | 0 | 5 | 0 | 0 | 0 | sheet scale figures, labels, and cliffside showcase |
| `src/96-ds-views.js` | 1.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | viewer camera presets |
| `src/99-host-tz-ds.js` | 5.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | window._api probe audits for verify.py |

## Notes

(none yet: the split lists and the overrides go here)
