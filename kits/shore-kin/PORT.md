# kits/shore-kin: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 31 (18%) | 9 (5%) | 0 (0%) | 35 (20%) | 97 (56%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 11.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | kit identity, Arch material table, rigging math & palette |
| `src/27v-sk-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | Stage 5 M1-M4 & K1 uniform shader dedup, km1RoughAA, POM & base AO |
| `src/27z-sk-matfix.js` | 1.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PBR sheen tuning & library map coverage on MAT |
| `src/31-alt-takes.js` | 0.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | seeded MAT_VAR material variations |
| `src/34-sk-trades.js` | 15.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | SK_BILLS structured Arch material bills & SK_TRADES 44-row Voth census table |
| `src/35-sk-head-geo.js` | 3.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | pure faceted closed-eyed ancestor door-mask generator |
| `src/39-sk-furn.js` | 10.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 73 | 0 | 0 | 0 | 0 | 0 | 14 bespoke Shore-kin furniture pieces on KratorFurniture |
| `src/40-sk-kit.js` | 36.0 | [draw] | 6 | 0 | 0 | 0 | 0 | 78 | 0 | 0 | 0 | 0 | 0 | Rian + Eternian + Hueru-Kuran + Fleet-born vernacular helpers |
| `src/50-sk-houses.js` | 22.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 | 8 Shore-kin dwellings, compounds & client moot hall |
| `src/58-sk-works.js` | 26.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 56 | 0 | 0 | 0 | 0 | 0 | 8 Shore-kin hinterland works, harbour sheds & tide shrine |
| `src/89-rows.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | three-row showcase sheet layout (16 buildings) |
| `src/90z-sk-atmos.js` | 3.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | ATMOS live gust wind binding on SV_CLOTH materials |
| `src/91r-sk-roomlight.js` | 6.6 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Stage 7 KROOMLIGHT room-graph daylight & 6-PointLight pool |
| `src/91z-sk-world.js` | 3.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water pools & flows, detail dedup & skDims |
| `src/99-host-tz-sk.js` | 20.5 | [web] | 4 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | preset views & window._api verification audits |

## Notes

(none yet: the split lists and the overrides go here)
