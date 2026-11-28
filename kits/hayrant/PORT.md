# kits/hayrant: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 22 (7%) | 12 (4%) | 0 (0%) | 29 (9%) | 247 (80%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 7.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27v-hy-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO |
| `src/27z-hy-matfix.js` | 3.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | library fallback keys, screen alphaTest, alabaster/nephrite emissive translucency |
| `src/34-hy-trades.js` | 11.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | HY_TRADES and hyRigMath pure functions |
| `src/39-hy-furn.js` | 15.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 114 | 0 | 0 | 0 | 0 | 0 | bespoke Hayrant furniture defs on KratorFurniture |
| `src/40-hy-kit.js` | 34.3 | [draw] | 14 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 | nuraghe, loess vault, larch cruck, kaen crown, stepped pier & keyhole toolkit |
| `src/41-hy-formline.js` | 28.0 | [draw] | 27 | 0 | 0 | 0 | 0 | 65 | 0 | 0 | 0 | 0 | 0 | Sutar-Pira cyber-totem pylons, monumental central-square cyber-totems, PCB wing-boards, porcelain insulators & sleeping-eye relief |
| `src/41a-hy-portal-pu.js` | 11.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 | sleeping-eye formline friezes/tympanums, ovoid portals, gale-cobble roofs & pu stilt caches |
| `src/50-hy-dwell.js` | 25.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | poor, middle and rich residential matrix (34001-34010) |
| `src/54-hy-state.js` | 29.1 | [draw] | 5 | 0 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 | Pepar-Hom Prefectural Seat, Observatory Clock, State, Hueru-Kuran Legation |
| `src/54b-hy-cybertotem.js` | 5.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | Grand Central-Square Cyber-Totem Plaza & Market-Square Talking-Head Cyber-Totem Monument (34113-34114) |
| `src/58-hy-faith-def.js` | 29.0 | [draw] | 3 | 0 | 0 | 0 | 0 | 52 | 0 | 0 | 0 | 0 | 0 | keyhole spring chime-well, Withdrawn sanctuary, barrow & frontier nuraghi |
| `src/62-hy-works.js` | 21.8 | [draw] | 6 | 0 | 0 | 0 | 0 | 42 | 0 | 0 | 0 | 0 | 0 | saltpeter works, ore adit, insulator kiln, nephrite wire-saw, Sheritu flume |
| `src/66-hy-trades-land.js` | 36.6 | [draw] | 5 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 | highland census trades, granary-nuraghe, escarpment hoist & loess farms |
| `src/70-hy-street.js` | 8.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | Mixed Eternian-Hayrant vassal street & ancestor statuary ranks |
| `src/89-rows.js` | 2.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sheet rows, no three.js, no DOM |
| `src/90z-hy-atmos.js` | 3.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS katabatic wind & chime shader hook + Observatory Clock parade |
| `src/91z-hy-world.js` | 6.8 | [web] | 11 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water pools & flows, ore links, hyDims() |
| `src/99-host-tz-hy.js` | 20.7 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | verify.py probe fields (window._api) |

## Notes

(none yet: the split lists and the overrides go here)
