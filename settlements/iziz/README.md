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
