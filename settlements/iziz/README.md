# Iziz

Iziz rebuilt: a new repo on the Krator Ancients kit's fragment contract, so the
city can hold the original Iziz wall/palace/spaceport, the Ancients kit (ruined
and reclaimed), the hyperjungle biome kit and the new **Iziz Vernacular** set in
one instanced page.

```
python build.py                                     # every target: dist/iziz.html (the city), dist/iziz-vernacular.html (the set), w-a/b/c (agent sheets)
python build.py --target city                       # just the city
python build.py --vendor-check                      # are the vendored Ancients fragments still identical upstream?
python jscheck.py .syntax-vernacular.js             # parse check on a machine without node
python verify.py dist/iziz-vernacular.html --assert --views "Overview,Middle — eye level" --out shots
python verify.py dist/iziz.html --assert --views "Overview,Palace hill,Arena hill" --out shots   # the city (~3.4 M tris, ~40 s build in SwiftShader)
python build.py --target palace                     # the palace citadel on its hill, furnished: dist/iziz-palace.html
python verify.py dist/iziz-palace.html --assert --views "Inside: the Aula Regia,Cut: the hall level" --out shots
node palace/test-palace.js                          # the blueprint's layout, headless: every room reached, every stair joined
```

## The palace citadel (2026-10-19: `targets/palace`, `dist/iziz-palace.html`)

The palace hill on its own page, the owner's blueprint (`palace/BLUEPRINT.md`, the sheets in `palace/floors/`) laid inside
it and furnished: the precinct inside the Ancient curtain wall (the palace, the barracks, the orb-bearer, the triumphal
plaza, the Praetorium, the Hall of Embassies, the kitchens, the mess and the stables), every storey of the palace block
from the Vestibule of the Orb to the Beacon Chamber, and the Depot and the Core in the mesa with the Mech Gate on the rear
face. 286 rooms on 36 storeys of twelve buildings (the two Praetorian barracks laid with rooms, 2026-10-19; three terrace
pavilions: the Orangery, the Summer Triclinium, the Belvedere of the Stars), about 6,300 pieces of furniture (Talia's in the
envoys' rooms and the libraries; the court's paintings, book spines and finishes laid on) and roof gardens of the empire's
exotic plants on the three terraces. X cuts a building away (] [ the storeys; the cut storey's rooms are named on the view,
N hides the names); the view list has the cuts and eye-level views inside the great rooms. How it is made: `API.md`, "The palace
citadel"; what is left: `KNOWN_ISSUES.md`. All of it is in `targets/palace/` (and the palace's own texture pack in
`palace/materials.json`, `palace/tex/`), so no other Iziz page changes; it moves into `src/` when the city is rebuilt.

* **`DESIGN.md`** — the Vernacular brief (materials, wealth tiers, lighting rule).
* **`API.md`** — the contract: registry, kit items, helpers, how to add a building.
* **`KNOWN_ISSUES.md`** — what is broken or unfinished. `build.py` prints the open ones.
* **`NOTES.md`** — round by round.

## The material library and the export (2026-10-13: the second material pilot, M5)

Iziz is the second pilot of the material library (after Girder): `materials.json` names a library set per material
family, `python3 ../../tools/textures/pack.py settlements/iziz` packs them into `tex/` (committed, in LFS), and
`src/88y-iziz-matlib.js` binds them onto `MAT` in place (`KMAT.bindMat`, `core/materials/record/`): the vernacular, the
Ancients MAT, the Voth embassy (2026-10-06) and now the city's own materials, the families named `city*` (the painting's
walls, its rock, the escarpments, the rust). Every material is a KMAT record (`window._materials`) naming its Godot
shader-library hook (`world-uv`, `breakup`, `glass`; `godot/krator/khooks.gd`). `?mat=proc` shows the look before the
library. Gaps and choices: `KNOWN_ISSUES.md`, "The second material pilot and M5".

The city exports through `core/export` (M5; `core/export/README.md`, "Iziz"): `targets/city/94-city-export.js` gives a
box's instances, meshes, materials, ground and records in the `KRATOR_EXPORT` shape (buildings, their doors, windows and
lamps, the kit's item sets, the furniture slots):

```
python3 ../../tools/harness.py export dist/iziz.html --out ../../godot/data/world-iziz --box=-120,292,120,532
godot --headless --path ../../godot --script res://tests/export/iziz_test.gd
```

Round 4 (Oct 1 2026): the wall moved out (20% more area) and the ring it gained is a farm belt with its own street
grid; the toppled F breaks in two; a second tripod market; the palace's grand entrance; the issue sweep. See
NOTES.md round 4.
Phase 2 (Sep 23 2026): the city, `targets/city/` — see NOTES.md round 3 and
`API.md` "The city target". Phase 1 (Sep 23 2026): the Vernacular set showcase — 8 dwellings across three
wealth tiers, shops, tavern, two workshops, scrap smithy, market canopy,
warehouse, school, hospital, barracks + drill yard, alchemist's compound, grain
silos, storage tank, electric generator; inspector with tags, polygon tool,
walk mode. Phase 2 will be the city target.

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

The city's atmosphere sets (`core/atmos`) are taken over too; LOD reads each set's own shape from
`userData.baseSphere`, since `ATMOS.cull` replaced the geometry's sphere with the whole set's. Rain, beams, sprites and
the glow layer are transparent or not meshes and stay as they are.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| city: opening | 837 / 6.51 M | 796 / 4.06 M |
| city: Overview | 858 / 6.52 M | 758 / 3.06 M |
| city: Settler streets, eye level | 523 / 5.32 M | 528 / 3.85 M |
