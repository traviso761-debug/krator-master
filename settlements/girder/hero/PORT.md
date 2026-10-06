# settlements/girder/hero: port notes

Girder Hero's files against `GODOT-PLAN.md`, in the tags of Girder's `PORT.md` (`[G data]` engine-neutral, export
as is · `[G native]` Godot has it, keep for the preview · `[web]` host code). `tools/audit_port.py` audits `src/`
only, so these are kept by hand here: keep them current when a file is split or moved.

| File | Tag | In Godot |
|---|---|---|
| `cast.json` | [G data] | The hero, the people (model, place, facing, conversation) and the dialogue. Loads as is, or as a `.tres` per conversation. The step shapes (`say`, `who`, `choose`, `go`) are the contract; `build_hero.py`'s `check_cast` is its validator |
| `styv.glb`, `phil.glb` | [G data] | Skinned meshes with their clips (`idle`, `walk`, `run`); Godot imports GLB directly. Import the full ones, not the `--slim` ones |
| `88-hero.js` | [G native] | The body is `CharacterBody3D` + `move_and_slide()` (slide, step-up, floor snap), routing is `NavigationAgent3D` on a mesh baked from Girder's walk solids (`83-walk.js`), the clips are an `AnimationTree` with a blend space on ground speed, the follow camera is a `SpringArm3D`. Carry over as data or rules: the speeds (walk 1.45, run 4.6 m/s), the no-drop rule (never off an edge over 1 m), the stride measurement that sets the clip rate, and `navAudit()`'s check of the graph against the solids |
| `89-talk.js` | [web] for its DOM, [G native] for the rest | The controls (right click walk, double right click run, raycast to the ground or to a person's `Area3D`), the name tags (`Label3D` or a projected `Control`), the dialogue box (`Control` UI) and the portrait (a `SubViewport` with a camera on the speaker's head). The dialogue runner (steps, speakers, choices, `go`) is the part to rewrite once in GDScript against `cast.json` |
| `slim_glb.py`, `prep_model.py`, `../build_hero.py` | tools | Not ported: `prep_model.py` packs a Meshy export (useful before a Godot import too); `--slim` exists only for the gallery's 16 MB file limit |

The graph and the solids: `navAudit()` (`window._hero.navAudit()`) lists the `NAV` nodes a body cannot stand on and
the edges it cannot walk straight along. `30-layout.js` was corrected against it on 2026-10-05 (810 bad edges and
184 bad nodes down to 132 and 16; `KNOWN_ISSUES.md` has what is left). A Godot port that bakes its navigation from
the walk solids does not need the graph for routing, but the villagers' schedules name its nodes (doors, stalls,
fields, roosts), so the graph stays the place list.
