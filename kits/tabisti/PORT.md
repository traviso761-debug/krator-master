# kits/tabisti: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 14 (7%) | 9 (4%) | 0 (0%) | 31 (14%) | 165 (75%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 6.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, polities, Tabist lexicon, library families & palette |
| `src/27v-tb-vstack.js` | 9.1 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | Stage 5 M1-M4 & K1 uniform shader dedup, km1RoughAA, POM & base AO |
| `src/27z-tb-matfix.js` | 2.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR glaze, lacquer & verdigris-gilt metal tuning on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/39-tb-furn.js` | 12.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 86 | 0 | 0 | 0 | 0 | 0 | 16 bespoke Urban Tabisti furniture pieces on KratorFurniture |
| `src/40-tb-kit.js` | 30.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 111 | 0 | 0 | 0 | 0 | 0 | bioclimatic plinths, ustun ayvans, loggias, claustra, ganch & shadirvans |
| `src/42-tb-crowns.js` | 20.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 80 | 0 | 0 | 0 | 0 | 0 | Zsolnay roofs, escata spires, trencadis lanterns, solar wind-towers & pishtaqs |
| `src/50-tb-dwell.js` | 25.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | all 11 urban dwellings: poor/middle/rich x single/multi (10401-10411) |
| `src/54-tb-bazaar.js` | 16.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | souq, kashi kiln, abyss-lac refinery, distillery, foundry & potash works (10412-10421) |
| `src/58-tb-works.js` | 17.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | icehouse, tea tavern, caravanserai, windmill, waterworks & lake port (10422-10430) |
| `src/60-tb-sacred.js` | 7.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | Salt-Crystal Altar grand temple, wayside shrine, qubba & chapterhouse (10431-10434) |
| `src/62-tb-civic.js` | 11.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Tafalast di Ahedman palace, syndic guildhall, madrasa, bimaristan & embassy (10435-10439) |
| `src/64-tb-walls.js` | 10.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ventilated city wall curtain, bastions, Shah-i-Zinda gate & garrison (10440-10444) |
| `src/66-tb-periurban.js` | 9.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | orchard, salt-rice paddy, buffalo dairy, beetle kraal, fungus vault & fish pier (10445-10450) |
| `src/72-tb-trades.js` | 5.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | TB_TRADES 44/44 Voth census mapping |
| `src/89-rows.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | five-row Urban Tabisti sheet layout (50 buildings) |
| `src/91r-tb-roomlight.js` | 7.4 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Stage 7 KROOMLIGHT room-graph daylight & 6-PointLight portal/lamp pool |
| `src/91z-tb-world.js` | 3.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water shadirvans, furniture shader dedup & tbDims |
| `src/99-host-tz-tb.js` | 19.2 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits (incl. bioclimaticAudit & vstackAudit) |

## Notes

(none yet: the split lists and the overrides go here)
