# Jimjam City Kit

Jimjam is the exotic city of red and yellow brick with white marble trim: many domes, thick staged spires,
raised plazas, Tudor-style ornamental brick chimneys, and at its centre a temple whose arch frames the sun
at sunset on the summer solstice. This build is the **building kit**: every Jimjam building type, laid out
on one sheet for review. A city layout is a later phase.

```
python3 build.py                      # src/ + targets/kit/ -> dist/jimjam-kit.html (prints "syntax OK" when node is present)
python3 build.py --vendor-check       # vendored fragments still identical upstream?
python3 verify.py dist/jimjam-kit.html --assert --views "Opening,Overview" --out shots
python3 verify.py dist/jimjam-kit.html --views "Solstice — through the arch" --eval "()=>JSON.stringify(window._api.solsticeCheck())" --out shots
```

What is on the sheet: 39 buildings (9 houses in three wealth tiers, 8 shops, inn, tavern, caravanserai,
library, school, amphitheater, the solstice temple, Raja's palace and its sunray plaza, fortress,
barracks, four modular wall pieces plus a demo run, farm field, two farmhouses, granary, animated windmill,
two warehouses), plus the helper gallery, 9 furniture pieces and 2 placeholder plants. Every building has a
front view and an eye-level view in the view menu, every row has an aerial, and several have their own
(courts, the wall joints, the solstice sightline).

* `DESIGN.md`: the style brief as built (palette, materials, wealth tiers, lighting, the solstice rule).
* `API.md`: the contract: registry, layout, helpers, constants, how to add a building.
* `AGENT-BRIEF.md`: the brief the building agents worked from (helper conventions, materials, verification).
* `KNOWN_ISSUES.md`: what is weak or unfinished. `NOTES.md`: round by round.

Dev tools (project rule): inspector (hover: name · class · tags), polygon tool, walk mode (F), labels.
