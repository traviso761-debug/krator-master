# kits/painted-men: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 22 (12%) | 12 (6%) | 0 (0%) | 27 (14%) | 131 (68%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 7.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/27v-pm-vstack.js` | 8.9 | [G shader] | 4 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | K1 uniform dedup, M2 specular AA, M3 POM, M4 base AO |
| `src/27z-pm-matfix.js` | 2.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | library fallback keys, selenite translucency, feather sheen |
| `src/34-pm-trades.js` | 12.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | PM_TRADES and pmRigMath pure functions |
| `src/39-pm-furn.js` | 14.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 97 | 0 | 0 | 0 | 0 | 0 | 14 bespoke plateau painted_* furniture defs on KratorFurniture |
| `src/40-pm-kit.js` | 27.0 | [draw] | 7 | 0 | 0 | 0 | 0 | 59 | 0 | 0 | 0 | 0 | 0 | alcove roomblocks, keyhole doors, Dogon ladders, malocas, hung ledges |
| `src/41-pm-rarrk.js` | 11.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 43 | 0 | 0 | 0 | 0 | 0 | Arnhem rarrk, X-ray beasts, Yanta-Rringka hands, Wandjina & Pukamani poles |
| `src/50-pm-dwell.js` | 21.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | poor, middle & rich residential matrix (36001-36010) |
| `src/54-pm-sacred-def.js` | 18.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | warrior maloca, stone-circle kiva, Lorrkon ossuary, truce pavilion & cliff defence |
| `src/62-pm-works-salvage.js` | 28.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 34 | 0 | 0 | 0 | 0 | 0 | pigment quarry, pitch-basketry, woomera shop, Dogon granaries, seep garden & salvage |
| `src/70-pm-cliff-alcove.js` | 5.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | Tiered Seep-Alcove and Talus-Fan Cliff Settlement showcase |
| `src/89-rows.js` | 2.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sheet rows, no three.js, no DOM |
| `src/90z-pm-atmos.js` | 3.3 | [G shader] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | live ATMOS canyon-updraught wind shader hook |
| `src/91z-pm-world.js` | 7.5 | [web] | 7 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | sculpted KDRAWN danxia cliff ground, core/water seeps & rills, pmDims() |
| `src/99-host-tz-pm.js` | 17.8 | [web] | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | verify.py probe fields (window._api) |

## Notes

(none yet: the split lists and the overrides go here)
