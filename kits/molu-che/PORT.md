# kits/molu-che: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 18 (9%) | 9 (4%) | 0 (0%) | 31 (15%) | 145 (72%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 5.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, clan metadata, library families & palette |
| `src/27v-mc-vstack.js` | 8.9 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | Stage 5 M1-M4 & K1 uniform shader dedup, km1RoughAA, POM & base AO |
| `src/27z-mc-matfix.js` | 1.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR loess, stone & metal tuning on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/39-mc-furn.js` | 12.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 84 | 0 | 0 | 0 | 0 | 0 | bespoke Molu-Che Dikengyuan & Bonduwe furniture on KratorFurniture |
| `src/40-mc-kit.js` | 21.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 57 | 0 | 0 | 0 | 0 | 0 | sunken dikengyuan pads, Talpathere ramps, Yaodong portals, Cucuteni friezes & vault wings |
| `src/42-mc-props.js` | 10.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 71 | 0 | 0 | 0 | 0 | 0 | vent hoods, Seismic Way-Stones, cisterns, Talpathere stalls, sleds, capstan mills & kilns |
| `src/52-mc-clan-civic.js` | 15.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | Dikengyuan great pit, council hall, echo shrine, cistern bath & tavern (8301-8305) |
| `src/54-mc-clan-works.js` | 15.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dikengyuan Talpathere byre, claw smithy, tuber drift, grub cellar, fullery & kiln (8306-8311) |
| `src/56-mc-clan-mil-log.js` | 5.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Dikengyuan capstan mill-pit & steppe rim watch (8312-8313) |
| `src/58-mc-clan-dwellings.js` | 14.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | Dikengyuan full dwelling classes: poor/middle/rich x single/multi (8314-8319) |
| `src/62-mc-vault-civic.js` | 11.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Bonduwe silver strong-vault, famine-grain silo, scriptorium & bazaar trench (8320-8323) |
| `src/64-mc-vault-trades.js` | 7.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | Bonduwe karst mason yard, sledwright pit & halite/jerky cold vault (8324-8326) |
| `src/66-mc-vault-mil-log.js` | 16.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | Bonduwe customs gate, sled mansio, watch mound, redoubt, bastion & citadel (8327-8332) |
| `src/68-mc-vault-dwellings.js` | 14.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Bonduwe full dwelling classes: poor/middle/rich x single/multi (8333-8338) |
| `src/70-mc-vocab.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KTAGS.VOCAB culture registration |
| `src/72-mc-trades.js` | 9.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | MC_TRADES 44-row Voth census mapping for dikengyuan & bonduwe |
| `src/89-rows.js` | 1.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | four-row Molu-Che sheet layout (38 buildings) |
| `src/91r-mc-roomlight.js` | 7.4 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Stage 7 KROOMLIGHT room-graph daylight & 6-PointLight portal/lamp pool |
| `src/91z-mc-world.js` | 3.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water streams, furniture shader dedup & mcDims |
| `src/99-host-tz-mc.js` | 18.8 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits (incl. vstackAudit & tradesAudit) |

## Notes

(none yet: the split lists and the overrides go here)
