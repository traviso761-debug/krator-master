# The Lozenge — notes

The Arccube at a quarter height (owner, 2026-10-27). Asked first as a change to the Arccube; the owner then moved the
Rift's ruined arcology to a pile of blocks (`targets/arcpile`) and kept this form as its own type, the Lozenge.
`src/89d-arcube.js` is Soleri's 1 500 m cube again, unchanged; the Lozenge's builder (`buildLozenge`, seed 9680) is a
fork of it in this target (`89d5-lozenge.js` and its parts `89d6`-`89d8`), using the cube's materials, maps, kit
pieces and `krShard` from `src/`. The plan, its sheets and the full method are in `plan/` (`BLUEPRINT.md`,
`lozenge_plan.py`, `lozenge_population.py`, `AREAS.md`, `sheets/`).

- **The form.** The diamond is squashed 4:1 in y (`VS = 0.25` in `89d5-lozenge.js`): length 1 000 m, width 1 414 m and
  the 141.4 ha footprint as on Soleri's sheet, height 375 m to the heliport deck, faces at 14 degrees, keel 21 m over
  the plain, outer pier rows 116 m to the belly. Every helper (`ZY`, `ARCL`, `TOFY`, `RAD`, `TAN`, `lowY`, the bite)
  takes `VS`; the bite's radius is in the squashed frame, so the broken corner keeps its shape.
- **The terraces.** The upper faces are 41 terraces to a face: a 3.66 m riser on the dwelling map (one storey of
  homes, one row of windows) under a 14.6 m tread (the field: instanced crop beds, orchards, a lip with its channel).
  Inscribed, so the outline is still the pure diamond. The ruin's fields are scrub. The treads' soil is a stand-in
  (`MAT.acSoil`); the texture is owed: `core/materials/PROMPTS-NEEDED.md` section 35.
- **The wells** are 60 m deep in height (240 m in plan) so they still light a mass this flat.
- **The population (low case): about 171 000 intact, 159 000 in the ruin's surviving fabric**, 1 210 a hectare of
  footprint. A home needs a window: the one-storey row behind every riser and every lower step 40 m or more up
  (125 ha), 10 m behind every other open wall (874 ha: the wells, the void, the craters, the courts) and inside the
  piers' walls (188 ha); 1 187 ha of lit floor, 65% dwellings, 45 m2 gross a person. Mid case 523 000, high 1.25 M.
  For Soleri's cube as built (1 500 m), the same method gave 391 000 low / 1.31 M mid / 3.08 M high: the sheet's
  400 000 is that cube's low case.

## Weaknesses

- The terrace treads are the concrete map tinted to earth (above).
- The lower faces' loggias and slot fins were tuned for 45 degrees; at 14 degrees they read as ribs on a soffit.
- The keel row of piers is only 21-40 m tall: squat blocks with small portals.
- A fork: a fix to the cube's shared parts (materials, `krShard`) reaches both, but a fix to the cube's builder does not
  reach this one.
