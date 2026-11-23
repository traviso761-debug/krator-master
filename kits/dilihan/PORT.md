# kits/dilihan: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 12 (9%) | 0 (0%) | 0 (0%) | 2 (2%) | 108 (89%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/69r-dil-mat.js` | 9.4 | [draw] | 15 | 3 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 | 0 | kiln-brick palette, deterministic fallback maps & kit items |
| `src/69s-dil-helpers.js` | 22.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | passive-cooling courtyard, jali, louver, shade-sail & monitor helpers |
| `src/70d-dil-dwell.js` | 25.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 7 dwellings (poor dogtrot/yard, mid courtyard/veranda/windwell, rich villa/manor) |
| `src/71d-dil-trade.js` | 32.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 12 markets, courtyard inns & ventilated monsoon workshops |
| `src/72d-dil-civic.js` | 17.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 civic cooling baths, customs loggia, guildhall, barracks & sun-court shrine |
| `src/73d-dil-trades.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Voth census trades table (DL_TRADES) & dlTradesAudit |
| `targets/sheet/88y-dlsheet-matlib.js` | 1.9 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | KMAT.bindMat & KMAT.adapter for the kit sheet |
| `targets/sheet/89z-rows.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 showcase rows including Mixed Street - Dilihan and Iziz Vernacular |
| `targets/sheet/91t-dlsheet-tags.js` | 2.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KTAGS.page registration of REG sites & IZFIX children |

## Notes

Read in place, not tagged here: `kits/ancients` runtime, `kits/iziz-vernacular` (`69b..74z` and `sheet.py` shell), and core modules (`core/rand`, `core/tags`, `core/walk`, `core/door`, `core/host`, `core/atmos/placeholder`, `core/materials`).
