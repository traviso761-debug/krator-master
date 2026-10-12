# core/edits: the edit log

One shape for every change made to a world after it is generated: the owner's edits in the preview's editor, later
the player's builds, and the simulation's off-screen operations (`core/simulation/PLAN.md` 8.9). `ROADMAP.md`
section 10. `[G data]`: no THREE, no DOM; Godot reads and writes the same log.

| File | What |
|---|---|
| `40-core-edits.js` | `KEDITS`: the log, the four ops (ADD, MOVE, SET, REMOVE), their inverses (undo), `apply` through a world adapter, target matching by core/tags uid or by position, and `fromStreetlab` (Streetlab's city-edits file as a log, read-only) |
| `test-edits.js` | `node core/edits/test-edits.js`, each check with a negative |

**A log** is `{format:'krator-edits', version:1, build, ops}`. **An op** carries `id` (`e<n>`, recording order),
`op`, `target` (`{uid?, class, key?, at}`), the op's own fields (`rec` for ADD and REMOVE, `at`/`ry`/`from` for MOVE,
`path`/`value`/`old` for SET), and optionally `cause` (`owner`, `player`, `sim:<event>`, `import:streetlab`) and
`thread` (the simulation's open, resolved or transformed). The header of `40-core-edits.js` has the whole contract.

**The rules** (README.md's furniture rule, "edits as an overlay"): ops apply in log order; an op whose target is not
found is skipped and reported, never applied to the nearest thing instead; a target is found by its core/tags uid,
else by class (and key) within 1.5 m of its position; every op records what undoing it needs, and its inverse is an op.

**A world adapter** is what a build gives `KEDITS.apply`: `find(target, tol)`, `add(rec)`, `move(h, at, ry)`,
`set(h, path, value, op)` (with `op.unset` the field is removed), `remove(h)`. The host's edit modes (`core/host`,
98) record ops and hand them to the same adapter to preview.

**Not yet:** the GDScript twin (`edits.gd`, with golden logs) arrives with the first Godot tool that writes edits; the
save route in `tools/edits/serve.py` arrives with the first build whose editor saves through it (Girder, ROADMAP.md
section 10, step 2).
