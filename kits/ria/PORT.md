# kits/ria: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 19 (4%) | 9 (2%) | 0 (0%) | 34 (8%) | 373 (86%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 5.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, dynastic metadata, library families & palette |
| `src/27v-ra-vstack.js` | 9.1 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | Stage 5 M1-M4 & K1 uniform shader dedup, km1RoughAA, POM & base AO |
| `src/27z-ra-matfix.js` | 1.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR glaze & metal tuning on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/39-ra-furn.js` | 11.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 86 | 0 | 0 | 0 | 0 | 0 | bespoke Ria Dynasty furniture on KratorFurniture |
| `src/40-ra-kit.js` | 36.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 106 | 0 | 0 | 0 | 0 | 0 | structural masonry, arcades, water courts, walk & room helpers |
| `src/42-ra-crowns.js` | 23.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 63 | 0 | 0 | 0 | 0 | 0 | Prasat/Pyatthat/Lanna roofs, Prangs, Lotus Domes, Naga & Hongsa emblems |
| `src/52-ra-west-court.js` | 20.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | Lower Ria court & sanctuary monuments (1-4) |
| `src/54-ra-west-town.js` | 17.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | Lower Ria water-gate, helical beacon, mansion & Ruan-Thai house (5-8) |
| `src/56-ra-west-civic.js` | 18.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Lower Ria covered bazaar, thermae, scriptorium, serai inn & barracks (9-13) |
| `src/57-ra-west-sacred.js` | 31.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 84 | 0 | 0 | 0 | 0 | 0 | Lower Ria chancellery, Mondop library, Celadon Prang terrace & Bussabok gate (19-22) |
| `src/58-ra-west-trades.js` | 14.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 | Lower Ria glaze kiln, silk dyeworks, bronze smithy, granary & cottage (14-18) |
| `src/59-ra-west-dwellings.js` | 24.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | Lower Ria full dwelling classes: poor/middle/rich x single/multi (23-28) |
| `src/59m-ra-west-mil-log.js` | 32.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 24 | 0 | 0 | 0 | 0 | 0 | Lower Ria military bastions/arsenals/citadel & crane/relay/cistern/weigh logistics (29-38) |
| `src/62-ra-east-court.js` | 19.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 0 | 0 | Upper Ria Hongsa palace, Mandala cloister, Lotus Dome & Gopura gate (1-4) |
| `src/64-ra-east-town.js` | 17.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | Upper Ria boat-lift, Saffron Viharn, peristyle villa & townhouse (5-8) |
| `src/66-ra-east-civic.js` | 18.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Upper Ria stoa agora, karst thermae, pilgrim serai, watchfort & boathouse (9-13) |
| `src/67-ra-east-sacred.js` | 20.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 | Upper Ria royal Pantheon-Prasat, Kinnara dromos, Dicastery & Caryatid reliquary (19-22) |
| `src/68-ra-east-trades.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | Upper Ria zinc foundry, stone atelier, saffron press, granary & cottage (14-18) |
| `src/69-ra-east-dwellings.js` | 22.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | Upper Ria full dwelling classes: poor/middle/rich x single/multi (23-28) |
| `src/69m-ra-east-mil-log.js` | 29.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | Upper Ria military ramparts/drydock/citadel & crane/relay/cistern/toll logistics (29-38) |
| `src/70-ra-vocab.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KTAGS.VOCAB culture registration |
| `src/72-ra-trades.js` | 9.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | RA_TRADES 44-row Voth census mapping for lower-ria & upper-ria |
| `src/89-rows.js` | 2.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | six-row dynastic sheet layout (76 buildings) |
| `src/91r-ra-roomlight.js` | 8.1 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Stage 7 KROOMLIGHT room-graph daylight & 6-PointLight portal/lamp pool |
| `src/91z-ra-world.js` | 3.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water streams, furniture shader dedup & raDims |
| `src/99-host-tz-ra.js` | 21.2 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits (incl. vstackAudit & tradesAudit) |

## Notes

(none yet: the split lists and the overrides go here)
