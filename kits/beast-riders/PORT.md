# kits/beast-riders: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 0 (0%) | 10 (5%) | 181 (95%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/50-br-mounts.js` | 18.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 90 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-br-trades.js` | 55.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 228 | 0 | 0 | 0 | 0 | 0 | split: BR_TRADES (the census table) and BRT_CENTRE are data; the trades' helpers and the crafts are builders |
| `src/52-br-trades-b.js` | 44.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 262 | 0 | 0 | 0 | 0 | 0 | the works, the stock and the water's edge |
| `src/53-br-trades-c.js` | 33.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 168 | 0 | 0 | 0 | 0 | 0 | the civic, guard and signal trades |
| `src/54-br-houses.js` | 25.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 113 | 0 | 0 | 0 | 0 | 0 | the larger houses and the farmhouse |
| `src/60-br-ports.js` | 3.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the ports as ASSETs: copies of the sealed towns' groups (towns.py) |
| `src/90-br-sheet.js` | 6.1 | [web] | 1 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
