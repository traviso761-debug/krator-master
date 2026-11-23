# kits/ria: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 7 (5%) | 0 (0%) | 0 (0%) | 17 (12%) | 123 (84%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 5.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, dynastic metadata, library families & palette |
| `src/27z-ra-matfix.js` | 1.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR glaze & metal tuning on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/39-ra-furn.js` | 11.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 86 | 0 | 0 | 0 | 0 | 0 | bespoke Ria Dynasty furniture on KratorFurniture |
| `src/40-ra-kit.js` | 23.9 | [draw] | 2 | 0 | 0 | 0 | 0 | 62 | 0 | 0 | 0 | 0 | 0 | structural masonry, arcades, water courts & walk helpers |
| `src/42-ra-crowns.js` | 20.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 52 | 0 | 0 | 0 | 0 | 0 | Prasat/Pyatthat/Lanna roofs, Prangs, Lotus Domes, Naga & Hongsa emblems |
| `src/52-ra-west-court.js` | 18.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | Lower Ria court & sanctuary monuments (1-4) |
| `src/54-ra-west-town.js` | 14.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | Lower Ria water-gate, helical beacon, mansion & Ruan-Thai house (5-8) |
| `src/62-ra-east-court.js` | 17.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 | Upper Ria Hongsa palace, Mandala cloister, Lotus Dome & Gopura gate (1-4) |
| `src/64-ra-east-town.js` | 15.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | Upper Ria boat-lift, Saffron Viharn, peristyle villa & townhouse (5-8) |
| `src/70-ra-vocab.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KTAGS.VOCAB culture registration |
| `src/89-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | two-row dynastic sheet layout |
| `src/91z-ra-world.js` | 2.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water streams & furniture detail guard |
| `src/99-host-tz-ra.js` | 13.1 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits |

## Notes

(none yet: the split lists and the overrides go here)
