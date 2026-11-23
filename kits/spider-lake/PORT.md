# kits/spider-lake: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 13 (8%) | 3 (2%) | 0 (0%) | 20 (12%) | 131 (78%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 5.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27z-sl-matfix.js` | 1.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-sl-trades.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/39-sl-furn.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 105 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-sl-kit.js` | 21.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 62 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-sl-houses.js` | 21.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | building builders calling 40-sl-kit.js |
| `src/54-sl-civic.js` | 14.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-sl-silkhead.js` | 15.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 29 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-sl-works.js` | 26.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 42 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-sl-waterfront.js` | 16.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-rows.js` | 1.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90z-sl-atmos.js` | 3.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS wind & gust shader hook on SV_CLOTH silk |
| `src/91z-sl-world.js` | 3.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/water canals, KDRAWN ground, furniture detail fallback: host code |
| `src/99-host-tz-sl.js` | 15.7 | [web] | 3 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | the probe fields for verify.py (window._api): host code |

## Notes

(none yet: the split lists and the overrides go here)
