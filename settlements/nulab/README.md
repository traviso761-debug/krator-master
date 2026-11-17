# settlements/nulab: Nulab, the Realm of Dalab on the Great Lake

The Realm of Dalab's city of 20,000 on the south bay of the West Rift's great lake, and its near ring of villages in the
lake basin (scale model 5.1, pin `ssk1wsnjjd`, px 443,1359; Line station 5). `PLAN.md` is the site plan and the owner's
settled answers (2026-11-16); this folder builds steps N1 (data in `data/nulab-sim.js`), N2 (the ground, harbour and
river on the town page), N3 (the town on `core/city` with the Dalab set read in place), N4 (the sixteen Dalab lake,
harbour, copper-works, gene-farm, daughter-Halls and tithe-barn pieces in `settlements/dalab/opt/75-dalab-lake-works.js`,
the three Dalab lake watercraft on `kits/ringsea/opt/`, and `dist/nulab.tex.dalab.js` as a sidecar texture pack), the
near ring of N5 (on `core/hamlet`'s opt-in Dalab row, `core/hamlet/dalab`), and N6 (Station 5, the lake viaducts under
`KRUINS.watch`, the Nulab-Chimes tunnel portal and hoist shaft on `kits/ancient-transit/opt/`, and Loj Faiv carved on
`KCAVERN` and `kits/tungang/opt/`). Everything not from the owner or the lore is *proposed* (`PLAN.md` says which).

## Build and verify

```
python3 ../../tools/build.py settlements/nulab     # dist/nulab.html + sidecars (a plain python3 build.py runs through it)
python3 build.py --bake-model                      # rewrite src/39n-nl-model.js from the scale model
node test-nl-town.js                               # the town, the ring, Station 5 / Loj Faiv / KRUINS, and the sim's records
KRATOR_GL=gpu python3 verify.py dist/nulab.html --assert --all-views
```

The town is a target on Xanadu's page, as Kirstabal's and Thalaba's are: `build.py` writes `gen/69n-kcity-bundle.js`
(`core/space`, `core/city` and `core/hamlet` with `core/hamlet/dalab/23-hamlet-dalab.js` sealed in one closure, with
`KCITY.lib` handing the town's site steps what `core/city`'s own steps use), `gen/69n2-nl-flora-bundle.js` (`core/biome`
and `biomes/riftrim`'s veiled rim sealed in one closure), `gen/69n4-nl-ringsea-bundle.js` (`kits/ringsea`'s hull, rig,
deck and crew builders with `kits/ringsea/opt/90..92` sealed in one closure), `gen/69n5-nl-transit-bundle.js` (`KTRANSIT`
with `kits/ancient-transit/opt/`'s Rift `line` kind and `KratorTransitFurniture`), `gen/69n6-nl-tungang-bundle.js`
(`kits/tungang` with `kits/tungang/opt/`'s `tg` carved loj set), and sidecar texture packs (`nulab.tex.dalab.js`,
`nulab.tex.ancient-transit.js`, `nulab.tex.tungang.js` beside `xanadu.tex.nulab.js`, keeping `dist/nulab.html` ~5.5 MB
under the 16 MB page cap), then runs `settlements/xanadu/build.py --kit settlements/nulab`.
The buildings are the Dalab set's (`settlements/dalab/src` 69d, 69e, 70, 71, 71c, 72, 72b, 73, 74 and
`settlements/dalab/opt/75-dalab-lake-works.js`), read in place through `kit.json` `"external"` along with `core/ruins`
and `core/terrain`'s `KCAVERN`; zero stand-in boxes remain (`NL_TOWN.PENDING` is empty). `core/atmos`, `core/water` and
`core/drawn` come in through `kit.json` `"files"`; the ground's six library sets are this folder's own pack
(`materials.json`, `tex/`, bound by `src/89n0-nl-matlib.js`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/39n-nl-model.js` | [G data] | GENERATED (`--bake-model`): the scale model 5.1's heights (absolute m; lake 297.4 m) and water flag, px 405..485 x 1318..1399 |
| `src/40-nl-ground.js` | [G data] | `NL_GROUND`: the page's frame (origin px 443.45,1358.45), Catmull-Rom over `NL_MODEL`, the dredged harbour basin on the bay's west shore, the Chimes Riba's channel from the bay's head through the outlet and down the level reach |
| `src/41-nl-town.js` | [G data] | `NL_TOWN.make`: two `core/city` instances — the coastal town clustered by the bay round `(140, -1350)` (±1.08 km, ~33 % denser, surrounded from shore to shore by an outer earthen mound with four gates, its ceremonial mound set back inland inside a palisaded ring with the daughter Halls, vats and gene beds, and ~260 infill crop plots in the empty lots) and the copper works across the Chimes Riba at the outlet (±0.76 km round `(6050, 2450)`) — plus the granary yard's bank and tithe barns, the harbour's quays, mole, slips, sheds and watercraft, Dalab's Line quarter houses beside Station 5, the caravan ground and the roads; ~20,240 residents |
| `src/42-nl-ring.js` | [G data] | `NL_RING.townFarms` and `NL_RING.make`: three `KHAMLET.farmland` belts (~1,250 parcels) right outside Nulab's outer earthen mound, plus eight near-ring villages within 9 km on `core/hamlet`'s Dalab row (`core/hamlet/dalab/23-hamlet-dalab.js`: `farming`, `fishing`, `gene`, `ranch`, `clay`) |
| `src/43-nl-line.js` | [G data] | `NL_LINE.make`: Station 5 (`KTRANSIT.line`), `carveH` (the shore terrace, 37 m approach cutting, Loj Faiv benches and shaft collar), the 4-track Line lake viaduct and parallel Ancient highway viaduct with lowest-corner-seated fallen spans and seamark pier stubs, the Nulab-Chimes tunnel portal and hoist shaft, and **Loj Faiv** (~152 Tungangs in 22 carved `TG.tg` sites + 3 rim sheds) |
| `src/89n0-nl-matlib.js` | [draw] | binds this folder's six ground sets (`nulab`) and Dalab's 23-family sidecar pack (`dalab`) onto `MAT` |
| `data/nulab-sim.js` | [G data] | step W1's economy records as plain data (`NL_SIM`: the city of 20,000, the four basin districts of 50,000, the 135 villages by kind, the skarn and road posts, the six routes, the Great Caravan's stop, `foodBalance`) |
| `targets/town/89z-rows.js` | [G data] | skips the Xanadu kit sheet's showcase (`window.CITY = true`, `TITLE`) |
| `targets/town/89zn-nl-site.js` | [G data] | `NL_LPLAN`, `terrainH` (with `NL_LPLAN.carveH`), the town, boats and the ring, Erewhon's stance, the farmland parcels, the flora mask on `KSPACE`, the climate's wetness (`nlWet`) |
| `targets/town/90n-nl-world.js` | [web] | the Krator sky, `core/atmos` skylight, five ground meshes registered with `core/drawn` (town 6 m, Line quarter 6 m, river and works 10 m, country 40 m, far field 500 m out to 70 km) painted from the records, the great lake (`WATER.open`) and the Chimes Riba (`WATER.flow`) |
| `targets/town/90o-nl-build.js` | [web] | the made ground (quays, mole, earthwork rings, caravan fence), every record by `VERN.place` in 400 m chunks with runtime frustum/range LOD, and the Dalab ferries, grain barges and fishing skiffs riding `WATER.ride` |
| `targets/town/90p-nl-flora.js` | [web] | the veiled rim's shore zone (`biomes/riftrim`, `RRIM.biome('w')`) built 4.6 km round the origin over the mask, baked with octahedral impostors |
| `targets/town/90q-nl-line.js` | [web] | draws Station 5, both lake viaducts, the Nulab-Chimes portal and hoist shaft (`KTRANSIT`), Loj Faiv's `KCAVERN` rock walls and rooms (`TG.tg.draw`, `TG.fg.draw`), and watches every ruined structure with `KRUINS.watch` |
| `targets/town/91z-views.js` | [G data] | seventeen camera views (no apostrophe or colon in a name) and the town's budget |
| `test-nl-town.js` | | node tests (`tools/ktest.js`, 36/36): no overlap, nothing on a street or in the water, ~20,000 people, landmarks, zero pending stand-ins, the three Dalab watercraft hulls, Station 5 / Loj Faiv / `KRUINS` viaduct seating, both `core/city` instances, the ring's eight villages and fields, every focus on `core/hamlet/dalab`, determinism, the basin's 50,000 and food balance |
| `verify.py` | | Xanadu's verify plus `nulab-laid` (0 stand-ins), `line-laid`, `ruins: *` (`KRUINS.watch`), `on-the-model`, `people`, `ring-laid`, `water` and `pending` |

## Not here yet

`KNOWN_ISSUES.md`. The West Rift open-world region cut (N0/N2, `core/world`), the live West Rift sim (W1-W6), and
interiors and the life layer (N7) are later steps.
