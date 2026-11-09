# kits/construction: the Construction kit (KCONS)

A building site, generic to every culture: the gear of a building going up, sized from any footprint and vended to any
settlement, so a settlement's empty lots and works are drawn without its own building kit knowing about them (the owner,
2026-11-04: "make construction parts that are generic and modular so they can be their own kit vended to settlements
rather than a part of the islander kit").

**What it draws** (`src/10-cons-site.js`, `[web]`, three.js; `API.md`): the cleared plot with its stakes and string line,
the bill's materials piled beside it (logs, stone blocks, rolled bundles, crates: one pile a good, shrinking as the
materials are built in), and the scaffold round the building (poles, ledgers, board walks, a ladder) rising with the
walls to the eaves while the work is under way.

**What it does not draw: the building.** The building is the settlement's own kit piece, revealed in build order by
core/city's `KCITY.constructMesh` (`core/city/54-city-host-construct.js`): footing first, then upward in bands with the
frame before the infill, the roof last, read off the piece's own triangles, so any kit's piece goes up without a line of
that kit changed. `node core/city/test-construct.js` proves the order.

**Who uses it:** the isle demo's empty lots and the streets outside its gates (`settlements/isle-demo/src/60-isle-draw.js`
`DRAW.lotWork`, both pages; the sim's projects: core/simulation `77-sim-6-build.js`, the isles' `47b`). A settlement reads
the fragment in place (its `build.py`), as the isle demo does.

**Not yet:** its own demo page and verify; the library's textures for the piles and poles (plain colours now, a host may
pass a palette); site huts, cranes and carts; workers' poses at the scaffold (the citizens stand by the lot).
