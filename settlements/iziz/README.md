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
```

* **`DESIGN.md`** — the Vernacular brief (materials, wealth tiers, lighting rule).
* **`API.md`** — the contract: registry, kit items, helpers, how to add a building.
* **`KNOWN_ISSUES.md`** — what is broken or unfinished. `build.py` prints the open ones.
* **`NOTES.md`** — round by round.

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
