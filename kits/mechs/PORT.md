# kits/mechs: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 10 (26%) | 28 (74%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.7 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/80-sky-hash.js` | 0.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-sky.js` | 9.5 | [G native] | 23 | 4 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/90-sheet.js` | 15.7 | [web] | 22 | 6 | 8 | 2 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-hover.js` | 2.9 | [web] | 2 | 0 | 8 | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |  |
| `src/93-polygon.js` | 4.7 | [web] | 6 | 0 | 9 | 9 | 0 | 2 | 0 | 0 | 1 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

| File | Tag | Note |
|---|---|---|
| `mechs-core.js` | [draw] | split: MECH, the vocabularies, `mechData` and the rig records are [G data]; the frame and the merge draw |
| `mechs-parts.js` | [draw] | |
| `krator-mechs-iziz*.js` | [draw] | split: each entry's tags, data, gait, idle and attack keys are [G data] (a sim reads them); `build` draws |
| `mechs-runtime.js` | [draw] | the pose layers, the stepping and the two-bone IK are engine-neutral maths on bone transforms; the detail-map shader hook is [G shader] (triplanar is native in StandardMaterial3D); the banner painter is canvas |
| `mech_bundle.py`, `build.py`, `verify.py` | [web] | tooling |

For Godot: each mech is a Skeleton3D (the rig's bones, rest transforms as built) with up to six MeshInstance3D surfaces
of rigid weights (two weights on the stretching links); the attack keys become an Animation per mech; the gait and
the IK are a small script (or SkeletonIK3D per leg) driving the hip, knee and ankle from planted targets.
