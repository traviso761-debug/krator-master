# settlements/nulab: Nulab, the Realm of Dalab on the Great Lake

The Realm of Dalab's city of 20,000 on the south bay of the West Rift's great lake, and its near ring of villages in the
lake basin (scale model 5.1, pin `ssk1wsnjjd`, px 443,1359; Line station 5). `PLAN.md` is the site plan and the owner's
settled answers (2026-11-16); this folder builds steps N1 (data in `data/nulab-sim.js`), N2 (the ground, harbour and
river on the town page), N3 (the town on `core/city` with the Dalab set read in place), N4 (the sixteen Dalab lake,
harbour, copper-works, gene-farm, daughter-Halls and tithe-barn pieces in `settlements/dalab/opt/75-dalab-lake-works.js`,
the three Dalab lake watercraft on `kits/ringsea/opt/`, and `dist/nulab.tex.dalab.js` as a sidecar texture pack) and the
near ring of N5 (on `core/hamlet`'s opt-in Dalab row, `core/hamlet/dalab`). Everything not from the owner or the lore is
*proposed* (`PLAN.md` says which).

## Build and verify

```
python3 ../../tools/build.py settlements/nulab     # dist/nulab.html + sidecars (a plain python3 build.py runs through it)
python3 build.py --bake-model                      # rewrite src/39n-nl-model.js from the scale model
node test-nl-town.js                               # the town, the ring, the Dalab row and the sim's records, without a browser
KRATOR_GL=gpu python3 verify.py dist/nulab.html --assert --all-views
```

The town is a target on Xanadu's page, as Kirstabal's and Thalaba's are: `build.py` writes `gen/69n-kcity-bundle.js`
(`core/space`, `core/city` and `core/hamlet` with `core/hamlet/dalab/23-hamlet-dalab.js` sealed in one closure, with
`KCITY.lib` handing the town's site steps what `core/city`'s own steps use), `gen/69n2-nl-flora-bundle.js` (`core/biome`
and `biomes/riftrim`'s veiled rim sealed in one closure), `gen/69n4-nl-ringsea-bundle.js` (`kits/ringsea`'s hull, rig,
deck and crew builders with `kits/ringsea/opt/90..92` sealed in one closure), and `dist/nulab.tex.dalab.js` (Dalab's full
23-family texture pack as a sidecar beside `dist/xanadu.tex.nulab.js`, keeping `dist/nulab.html` ~4.1 MB under the 16 MB
page cap), then runs `settlements/xanadu/build.py --kit settlements/nulab`.
The buildings are the Dalab set's (`settlements/dalab/src` 69d, 69e, 70, 71, 71c, 72, 72b, 73, 74 and
`settlements/dalab/opt/75-dalab-lake-works.js`), read in place through `kit.json` `"external"`; only `nl_line_station`
remains a single stand-in box (`NL_TOWN.PENDING`) for step N6. `core/atmos`, `core/water` and `core/drawn` come in
through `kit.json` `"files"`; the ground's six library sets are this folder's own pack (`materials.json`, `tex/`, bound
by `src/89n0-nl-matlib.js`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/39n-nl-model.js` | [G data] | GENERATED (`--bake-model`): the scale model 5.1's heights (absolute m; lake 297.4 m) and water flag, px 405..485 x 1318..1399 |
| `src/40-nl-ground.js` | [G data] | `NL_GROUND`: the page's frame (origin px 443.45,1358.45), Catmull-Rom over `NL_MODEL`, the dredged harbour basin on the bay's west shore, the Chimes Riba's channel from the bay's head through the outlet and down the level reach |
| `src/41-nl-town.js` | [G data] | `NL_TOWN.make`: two `core/city` instances — the coastal town clustered by the bay round `(140, -1350)` (±1.08 km, ~33 % denser, surrounded from shore to shore by an outer earthen mound with four gates, its ceremonial mound set back inland inside a palisaded ring with the daughter Halls, vats and gene beds, and ~200 infill crop plots in the empty lots) and the copper works across the Chimes Riba at the outlet (±0.76 km round `(6050, 2450)`) — plus the granary yard's bank and tithe barns, the harbour's quays, mole, slips, sheds and watercraft, the Line quarter on the main south shore, the caravan ground and the roads; ~20,240 residents |
| `src/42-nl-ring.js` | [G data] | `NL_RING.townFarms` and `NL_RING.make`: three `KHAMLET.farmland` belts (~1,250 parcels) right outside Nulab's outer earthen mound, plus eight near-ring villages within 9 km on `core/hamlet`'s Dalab row (`core/hamlet/dalab/23-hamlet-dalab.js`: `farming`, `fishing`, `gene`, `ranch`, `clay`) |
| `src/89n0-nl-matlib.js` | [draw] | binds this folder's six ground sets (`nulab`) and Dalab's 23-family sidecar pack (`dalab`) onto `MAT` |
| `data/nulab-sim.js` | [G data] | step W1's economy records as plain data (`NL_SIM`: the city of 20,000, the four basin districts of 50,000, the 135 villages by kind, the skarn and road posts, the six routes, the Great Caravan's stop, `foodBalance`) |
| `targets/town/89z-rows.js` | [G data] | skips the Xanadu kit sheet's showcase (`window.CITY = true`, `TITLE`) |
| `targets/town/89zn-nl-site.js` | [G data] | `terrainH`, the town, boats and the ring with `VERN.defs` and `NL_TOWN.PENDING`, Erewhon's stance, the farmland parcels, the flora mask on `KSPACE`, the climate's wetness (`nlWet`) |
| `targets/town/90n-nl-world.js` | [web] | the Krator sky, `core/atmos` skylight, four ground meshes registered with `core/drawn` (town 6 m, river and works 10 m, country 40 m, far field 500 m out to 70 km) painted from the records, the great lake (`WATER.open`) and the Chimes Riba (`WATER.flow`) |
| `targets/town/90o-nl-build.js` | [web] | the made ground (quays, mole, earthwork rings, caravan fence), every record by `VERN.place` (or stand-in box) in 400 m chunks with runtime frustum/range LOD, and the Dalab ferries, grain barges and fishing skiffs riding `WATER.ride` |
| `targets/town/90p-nl-flora.js` | [web] | the veiled rim's shore zone (`biomes/riftrim`, `RRIM.biome('w')`) built 4.2 km round the origin over the mask, baked with octahedral impostors |
| `targets/town/91z-views.js` | [G data] | fifteen camera views (no apostrophe or colon in a name) and the town's budget |
| `test-nl-town.js` | | node tests (`tools/ktest.js`): no overlap, nothing on a street or in the water, ~20,000 people, landmarks (including `nl.halls`), both `core/city` instances, the three Dalab watercraft hulls over water, the ring's eight villages and fields, every focus on `core/hamlet/dalab`, determinism, the basin's 50,000 and food balance |
| `verify.py` | | Xanadu's verify plus `nulab-laid`, `on-the-model`, `people`, `ring-laid`, `water` and `pending` (1 box for N6) |

## Not here yet

`KNOWN_ISSUES.md`. The West Rift open-world region cut (N0/N2, `core/world`), the live West Rift sim (W1-W6), Line
station 5's ruins and Loj Faiv (N6), and interiors and the life layer (N7) are later steps.
