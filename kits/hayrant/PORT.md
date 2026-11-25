# kits/hayrant: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 19 (8%) | 12 (5%) | 0 (0%) | 25 (11%) | 169 (75%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 7.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27v-hy-vstack.js` | 8.8 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO |
| `src/27z-hy-matfix.js` | 2.6 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | library fallback keys, screen alphaTest, alabaster/nephrite emissive translucency |
| `src/34-hy-trades.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | HY_TRADES and hyRigMath pure functions |
| `src/39-hy-furn.js` | 11.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 77 | 0 | 0 | 0 | 0 | 0 | bespoke Hayrant furniture defs on KratorFurniture |
| `src/40-hy-kit.js` | 34.3 | [draw] | 14 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 | nuraghe, loess vault, larch cruck, kaen crown, stepped pier & keyhole toolkit |
| `src/50-hy-dwell.js` | 23.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | poor, middle and rich residential matrix (34001-34010) |
| `src/54-hy-state.js` | 22.7 | [draw] | 5 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 | Pepar-Hom Prefectural Seat, Observatory Clock, State, Hueru-Kuran Legation |
| `src/58-hy-faith-def.js` | 18.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 31 | 0 | 0 | 0 | 0 | 0 | keyhole spring chime-well, Withdrawn sanctuary, barrow & frontier nuraghi |
| `src/62-hy-works.js` | 15.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | saltpeter works, ore adit, insulator kiln, nephrite wire-saw, Sheritu flume |
| `src/66-hy-trades-land.js` | 32.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 60 | 0 | 0 | 0 | 0 | 0 | highland census trades, granary-nuraghe, escarpment hoist & loess farms |
| `src/70-hy-street.js` | 7.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | Mixed Eternian-Hayrant vassal street & ancestor statuary ranks |
| `src/89-rows.js` | 2.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sheet rows, no three.js, no DOM |
| `src/90z-hy-atmos.js` | 3.4 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS katabatic wind & chime shader hook + Observatory Clock parade |
| `src/91z-hy-world.js` | 6.5 | [web] | 11 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | KDRAWN ground, core/water pools & flows, ore links, hyDims() |
| `src/99-host-tz-hy.js` | 17.5 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | verify.py probe fields (window._api) |

## Notes

(none yet: the split lists and the overrides go here)
