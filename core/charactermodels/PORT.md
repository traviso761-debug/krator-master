# core/charactermodels: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 21 (11%) | 0 (0%) | 0 (0%) | 96 (52%) | 69 (37%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 12.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/01-animlab.html` | 16.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-rig.js` | 20.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-figure.js` | 61.4 | [draw] | 59 | 0 | 0 | 1 | 0 | 1 | 8 | 0 | 0 | 0 | 0 |  |
| `src/60-crowd.js` | 7.4 | [draw] | 11 | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 |  |
| `src/90-editor.js` | 33.9 | [web] | 13 | 0 | 45 | 29 | 2 | 2 | 0 | 0 | 0 | 0 | 3 |  |
| `src/92-animlab.js` | 31.9 | [web] | 14 | 0 | 31 | 33 | 2 | 2 | 0 | 0 | 0 | 5 | 2 |  |

## Notes

- `50-figure.js` [draw]: the morph blend (KMR1 deltas over `_vidx`), the joint and inverse-bind deltas and the tint
  are what the Godot twin needs to match; its `shader` count is the cut-out hook (fragments that pass the alpha test
  are written opaque), which Godot's alpha scissor already does. Its two-handed hold (the left arm's two-bone solve onto
  a prop's support) and the live bow string are matched in `kchar_figure.gd` (`_two_hands`, `_bow_string`), and so
  is the cloth solver (`_cloth_rest`, `_cloth_step`; GDScript for parity: a game would hand the chains to Godot's own
  `SpringBoneSimulator3D` with capsule colliders).
- `90-editor.js` [web]: its `net` lines fetch the pieces (`pieces/<key>.txt`); Godot loads the GLBs as resources.
- `92-animlab.js` [web]: a review tool, not game code; its `store` lines keep review marks in the browser when the
  page has no shared store (the published lab keeps them in the artifact's db). Nothing of it ports.
