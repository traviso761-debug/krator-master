# kits/construction: the Construction kit (KCONS)

A building site, generic to every culture: the gear of a building going up, sized from any footprint and vended to any
settlement, so a settlement's empty lots and works are drawn without its own building kit knowing about them (the owner,
2026-11-04: "make construction parts that are generic and modular so they can be their own kit vended to settlements
rather than a part of the islander kit").

**What it draws** (`src/10-cons-site.js`, `[draw]`, three.js; `API.md`): the cleared plot with its stakes and string line,
the bill's materials piled beside it (one pile a good, shrinking as the materials are built in: logs, a stack of planks on
stickers, stone blocks, a pallet of bricks, a heap of sand or lime, rolled bundles, rope coils, crates under a tarp), and the
scaffold round the building (poles, ledgers with the transoms a hand lower, board walks, a ladder leaning on it) rising
with the walls to the eaves while the work is under way. Every box and pole carries world-unit UVs, every mesh a name and
`userData.cons` (its palette key).

**The library's maps** (`src/20-cons-lib.js`, opt-in): `KCONS.libMats()` gives one table of standard materials with the
library's sets bound (`materials.json`, packed into `tex/` by `python3 tools/textures/pack.py kits/construction`): the
plot `ground.dirt`, poles and logs `bark.bark_brown_01`, the board walks and planks `wood.weathered_brown_planks`, stakes
and crates `wood.timber`, blocks `stone.cut`, bricks `brick.red`, bundles `reed.bundle`, rope and the string line
`fibre.rope`, the tarp `cloth.tarp`, sand `ground.park_sand` (the two neutral sets, `reed.bundle` and `cloth.tarp`, are
grey by design and are tinted in the pack: straw `#bea776`, weathered canvas `#b8a27e`; the rest keep their own colours); the sheet's ground `ground.sparse_grass` (its own). Pass the
table as `mats` to every site. A host that does not load this fragment keeps the plain palette colours.

**What it does not draw: the building.** The building is the settlement's own kit piece, revealed in build order by
core/city's `KCITY.constructMesh` (`core/city/54-city-host-construct.js`): footing first, then upward in bands with the
frame before the infill, the roof last, read off the piece's own triangles, so any kit's piece goes up without a line of
that kit changed. `node core/city/test-construct.js` proves the order.

**The sheet** (`dist/construction.html`, `python3 tools/build.py kits/construction`; `src/80-cons-sheet.js`): three cultures'
houses (the Islanders' rumah, the Iziz Vernacular's plaster townhouse, Xanadu's timber corner house) at six stages left to
right (cleared, footing, frame, infill, roof, built), each stage's share read off the piece's own build order. The pieces
come from the kits sealed for other pages and read in place (the isle demo's `bundles.py` ISK and IZV, `kits/xanadu/
kit_bundle.py` XAK, flattened by the isle demo's `58-isle-protos.js`); everything is registered in core/tags before it is
drawn; the page is core/host's (camera, panel, inspector, polygon tool, probe) under the placeholder sky. The packs go
beside the page (`dist/construction.tex.*.js`, about 15 MB: only the families the three pieces draw, `build.py` KEEP).

**Verify:** `python3 verify.py dist/construction.html --assert` (pieces, stages, piles, nothing floats, no shared face
planes, determinism, tags, the library bound; each with a negative), then the harness's universal asserts.
`--all-views` takes the shots (`shots/`).

**Who uses it:** the isle demo's empty lots and the streets outside its gates (`settlements/isle-demo/src/60-isle-draw.js`
`DRAW.lotWork`, both pages; the sim's projects: core/simulation `77-sim-6-build.js`, the isles' `47b`). A settlement reads
the fragment in place (its `build.py`), as the isle demo does (`10-cons-site.js` only: it does not take the library's maps
yet; to take them it loads `20-cons-lib.js`, carries this kit's pack and passes `mats: KCONS.libMats()`: `KNOWN_ISSUES.md`).

**Not yet:** site huts, cranes and carts; workers' poses at the scaffold (the citizens stand by the lot); the isle demo on
the library's maps (opt-in, above).
