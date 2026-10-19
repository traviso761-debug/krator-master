# kits/beast-riders: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 15 (3%) | 0 (0%) | 0 (0%) | 11 (2%) | 417 (94%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/50-br-mounts.js` | 18.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 90 | 0 | 0 | 0 | 0 | 0 |  |
| `src/51-br-trades.js` | 55.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 228 | 0 | 0 | 0 | 0 | 0 | split: BR_TRADES (the census table) and BRT_CENTRE are data; the trades' helpers and the crafts are builders |
| `src/52-br-trades-b.js` | 44.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 262 | 0 | 0 | 0 | 0 | 0 | the works, the stock and the water's edge |
| `src/53-br-trades-c.js` | 32.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 168 | 0 | 0 | 0 | 0 | 0 | the civic, guard and signal trades |
| `src/54-br-houses.js` | 25.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 113 | 0 | 0 | 0 | 0 | 0 | the larger houses and the farmhouse |
| `src/55-br-rockcut.js` | 76.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 179 | 0 | 0 | 0 | 0 | 0 | the rock-cut pieces as ASSETs and their carving vocabulary (wall frame, rim, portal, beasts in relief); the tribes' and offerings' tables are data |
| `src/56-br-rockcut-b.js` | 42.3 | [draw] | 3 | 0 | 0 | 0 | 0 | 103 | 0 | 0 | 0 | 0 | 0 | split: the Deep Root cavern's pieces; BR_ROCK's dims/face/onWall/onStack maths is data, backOf and the sheet's backdrop are host |
| `src/60-br-ports.js` | 3.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the ports as ASSETs: copies of the sealed towns' groups (towns.py) |
| `src/70-br-tent-kit.js` | 43.7 | [draw] | 3 | 0 | 0 | 0 | 0 | 74 | 0 | 0 | 0 | 0 | 0 | the tent kit's builders (hide dome, barrel pavilion, guys, awnings, corrals, thorn); meshes through the core's _surfGeo and _matDbl; choices hashed with KRAND |
| `src/71-br-tents-dwell.js` | 13.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 47 | 0 | 0 | 0 | 0 | 0 | the tents as ASSETs: dwellings, chief, council, shrine |
| `src/72-br-tents-trade.js` | 15.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 48 | 0 | 0 | 0 | 0 | 0 | the tents as ASSETs: the Scyvoi set's trades |
| `src/73-br-tents-pens.js` | 23.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 102 | 0 | 0 | 0 | 0 | 0 | the pens and trainer structures as ASSETs |
| `src/74-br-tents-bands.js` | 17.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 46 | 0 | 0 | 0 | 0 | 0 | the Dragonfly, Spider and Mammoth bands' grounds as ASSETs |
| `src/75-br-tents-bounds.js` | 4.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | the thorn hedge and rail fence, parametric pieces (F.span) |
| `src/79-br-camp.js` | 14.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | BR_CAMP (a band's camp by tribe), BR_RUN (a boundary along a polyline): plain data and pure functions; BR_SHEET_TENTS the sheet's rows |
| `src/90-br-sheet.js` | 6.8 | [web] | 1 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
