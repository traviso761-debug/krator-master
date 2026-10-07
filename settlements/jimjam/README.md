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

## Textures (the material library)

Since 2026-10-06 Jimjam takes its surfaces from the shared material library (`core/materials/PLAN.md`, "How a build
adopts the library"): `materials.json` maps each `JMAT` family (bricks, marble, ochre plaster, the three dome scales,
the sunray, the six shaft reliefs) to a library set in full colour; `python3 tools/textures/pack.py settlements/jimjam`
writes `tex/`, and `build.py` inlines it (generated fragment `46-matlib-pack.js`). The end of `src/60-jj-mat.js` swaps
the maps in; `?mat=proc` shows the procedural canvases. `window._materials` is the material table for the export.
Untextured materials (gold, iron, wood, canvas, glass, water) are unchanged.

## Level of detail

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into
frustum-culled chunks that switch to clustered proxies with distance; instanced sets keep one draw call and drop their
smallest instances by screen size. The originals stay the raycast targets, so the inspector and `_api` see full detail.
The `LOD` panel (bottom right; `l` toggles it, `measure` renders the view both ways) reads draw calls and triangles.
`LOD.enabled=false` (or `?lod=0`) puts back the exact scene the build made; `LOD.stats()` and `LOD.measure()` are
there for verify.

Measured 2026-10-01, 1000x640, SwiftShader on a shared 4-core machine (`LOD.flush()` then `LOD.measure()`; triangles and
draw calls as three.js counts them. Frame times were too noisy under the shared load to quote):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Overview | 538 / 1.78 M | 344 / 0.56 M |
| Furniture and flora, eye level | 537 / 1.78 M | 401 / 0.86 M |

The kit sheet is mostly instanced detail (furniture, ornament, plants) spread over a long sheet, so far rows drop their
small pieces and simplify their bigger ones. The eye-level view looks the same with LOD on and off.
