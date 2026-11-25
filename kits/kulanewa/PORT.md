# kits/kulanewa: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 20 (8%) | 9 (4%) | 0 (0%) | 31 (13%) | 185 (76%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, faction metadata, library families & palette |
| `src/27v-kl-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | Stage 5 M1-M4 & K1 uniform shader dedup, km1RoughAA, POM & base AO |
| `src/27z-kl-matfix.js` | 1.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR glaze & metal tuning on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/39-kl-furn.js` | 11.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 87 | 0 | 0 | 0 | 0 | 0 | bespoke Kulanewa Karum & Ikki furniture on KratorFurniture |
| `src/40-kl-kit.js` | 27.0 | [draw] | 4 | 0 | 0 | 0 | 0 | 84 | 0 | 0 | 0 | 0 | 0 | AF3 kura/udatsu/kiyomizu & Style A sanjhya/torana/wall/walk helpers |
| `src/42-kl-crowns.js` | 20.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 57 | 0 | 0 | 0 | 0 | 0 | AF4 hooped frustums/skywalks & AF1 Newar roofs, bell-cupolas & wheels |
| `src/52-kl-karum-civic.js` | 17.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Karum grand bank, clearing hall, treaty factor, mill-bridge & thermae (8101-8105) |
| `src/54-kl-karum-trades.js` | 13.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | Karum paktong mint, amber press, silk exchange, kura granary & pottery (8106-8110) |
| `src/56-kl-karum-mil-log.js` | 14.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Karum crane quay, caravanserai, chain boom, mercenary keep & watch frustum (8111-8115) |
| `src/58-kl-karum-dwellings.js` | 18.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Karum full dwelling classes: poor/middle/rich x single/multi (8116-8121) |
| `src/62-kl-ikki-covenant.js` | 16.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | Ikki covenant citadel, Mujinzo vault, debtor cloister, Otona hall & bath (8122-8126) |
| `src/64-kl-ikki-works.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | Ikki hydro-forge, bell foundry, coke kiln, sawmill & mason yard (8127-8130, 8136) |
| `src/66-kl-ikki-mil-log.js` | 14.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | Ikki covered weir, pack depot, twin drum-gate, armoury & moat bastion (8131-8135) |
| `src/68-kl-ikki-dwellings.js` | 16.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | Ikki full dwelling classes: poor/middle/rich x single/multi (8137-8142) |
| `src/70-kl-vocab.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KTAGS.VOCAB culture registration |
| `src/72-kl-trades.js` | 8.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KL_TRADES 44-row Voth census mapping for karum & ikki |
| `src/89-rows.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | four-row Kulanewa sheet layout (42 buildings) |
| `src/91r-kl-roomlight.js` | 7.4 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Stage 7 KROOMLIGHT room-graph daylight & 6-PointLight portal/lamp pool |
| `src/91z-kl-world.js` | 3.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water streams, furniture shader dedup & klDims |
| `src/99-host-tz-kl.js` | 19.1 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits (incl. vstackAudit & tradesAudit) |

## Notes

(none yet: the split lists and the overrides go here)
