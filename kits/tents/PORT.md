# kits/tents: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 21 (30%) | 0 (0%) | 0 (0%) | 10 (14%) | 40 (56%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/26k-kit.js` | 4.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the kit's identity, library families and palette |
| `src/33-tn-table.js` | 8.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | forms x sizes x roles: boxes and rooms; tests/test-tents.js loads it in node |
| `src/41-tn-dress.js` | 9.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the dresses; tests/test-tents.js loads it in node |
| `src/42-tn-parts.js` | 8.8 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | cloth, flaps (core/door leaves), finials, pennants; wraps the toolkit's tkStake and tkGuy |
| `src/44-tn-forms.js` | 16.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | one builder per form; the toolkit (kits/scyvoi/src/40-tk-tentkit.js) read in place |
| `src/46-tn-roles.js` | 6.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | gear by role (FURNISH) and the interiors (furnishRoom, buildRoom) at placement; tnTags and TN_WEALTH are data |
| `src/47-tn-defs.js` | 2.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the 25 defBuilding records; their table is 33-tn-table.js |
| `src/52-tn-camps.js` | 3.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the camps are laid out by core/camp (data: KCAMP.tentProgram, pitch, halt), then placed and dressed |
| `src/88-tn-emblem.js` | 1.2 | [draw] | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake (Godot: an ImageTexture painted the same way) |
| `src/89-rows.js` | 2.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the sheet's rows |
| `src/91t-tn-interiors.js` | 0.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the interiors' runtime adapter over the engine's furniture batch |
| `src/99-host-tn.js` | 5.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the probe (verify.py) |

## Notes

(none yet: the split lists and the overrides go here)
