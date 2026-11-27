# kits/hueru-kuran: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 15 (9%) | 12 (7%) | 0 (0%) | 20 (12%) | 124 (72%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 5.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27v-hk-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |  |
| `src/27z-hk-matfix.js` | 1.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-hk-trades.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/39-hk-furn.js` | 13.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 91 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-hk-kit.js` | 24.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 44 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-hk-houses.js` | 17.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | building builders calling 40-hk-kit.js |
| `src/54-hk-civic.js` | 18.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-hk-works.js` | 26.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 47 | 0 | 0 | 0 | 0 | 0 |  |
| `src/62-hk-waterfront.js` | 21.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 52 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-rows.js` | 2.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90z-hk-atmos.js` | 3.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS wind & gust shader hook on SV_CLOTH gutskin, kelp, nets & nephrite chimes |
| `src/91z-hk-world.js` | 4.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/water step-wells & millraces, KDRAWN ground, furniture detail fallback: host code |
| `src/99-host-tz-hk.js` | 15.0 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | the probe fields for verify.py (window._api): host code |

## Notes

(none yet: the split lists and the overrides go here)
