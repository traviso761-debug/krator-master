# settlements/thalaba: Thalaba, the town at the mouth of Godshearth

The Xanadui town of about 2,400 on the bench where Godshearth's spillway gorge opens (pin `shvo49k0y2`, px 840,1463, scale
model 5.1e12; the owner, 2026-11-16). It lives on the summer road into the basin: the Rare Devisers' expedition and the Dalab
mission's party go up from here, and the vents' sulfur, wax and rarities come home here. `PLAN.md` is the site plan and the
owner's answers (sections 1-7); this page is its step T3, the town's ring on the open world is T2 and T4
(`openworld/xanadu-oidong-highrift`, below).

## Build and verify

```
python3 ../../tools/build.py settlements/thalaba                 # dist/thalaba.html, dist/thalaba-pieces.html (from the repo root: tools/build.py settlements/thalaba)
KRATOR_GL=gpu python3 verify.py dist/thalaba.html --assert --views "Overview,The market square,The Siteps from above"
KRATOR_GL=gpu python3 verify.py dist/thalaba-pieces.html --assert --views "Opening,Thalaba"
KRATOR_GL=gpu python3 verify.py dist/thalaba.html --assert --interiors --views "Overview"   # the walk-in houses (?interiors=1) and the hollow-wall audit
```

`build.py` writes `gen/69t-kcity-bundle.js` (core/city and core/space in one closure, as Qiblai seals them, with the raster's
class and its occupancy codes on `KCITY.lib` for the town's own steps) and `gen/69u-tb-ground.js` (the scale model's ground
round the pin: 4.8 km by 12.8 km at 40 m, from 2.4 km south of the pin to the gorge's mouth, and an 80 km square at 500 m,
bicubic on `h.png`, and the model's rivers within it),
then runs `settlements/xanadu/build.py --kit settlements/thalaba`: the town is a target on Xanadu's page as Erewhon and Qiblai
are. Its own ground sets are the Thalaba pack (`materials.json`, `tex/`: `python3 tools/textures/pack.py settlements/thalaba`).
core/atmos and core/water come in through `kit.json` `files`; the Dalab set's materials, helpers and three of its families
(`settlements/dalab/src` 69d, 69e, 70, 71, 73) through `external`, read in place, with Dalab's pack trimmed to the six families
they need (`gen/69v-dalab-pack.js`, build.py `DALAB_FAMILIES`).

## How the town is made

| Fragment | What |
|---|---|
| `src/89t0-tb-matlib.js` | the town's ground keys (`tGrass`, `tDirt`, `tCobble`, `tField`) bound onto the Thalaba pack |
| `src/89t2-tb-interiors.js` | the rooms of those pieces and of the mission's healers' hall, as a `kits/interiors` set (`IX.sets.add`, set `thalaba`), drawn hollow and furnished with `?interiors=1` |
| `src/89t1-tb-pieces.js` | Thalaba's own pieces on the Xanadu kit's contract (`XA.def`): `tb_devisers`, the Rare Devisers' house (the hall over the counting room, the strongroom, the sulfur shed and the wax store round the outfitting yard), `tb_calcarone`, a sulfur kiln, and `tb_watchhouse`, the road warden's watch house at Briḍj; seeds 34300-34399. They go upstream into `kits/xanadu` once the owner has seen them |
| `targets/pieces/` | the pieces sheet (`dist/thalaba-pieces.html`): Thalaba's two pieces and the Dalab mission's three, every variant |
| `targets/town/89z-rows.js` | `window.CITY`, the title, no sheet rows |
| `targets/town/89zt-tb-site.js` | the plan, as records: the model's ground (`tbModel`) with the town's work cut into it (`tbGround`: the Siṭēps' treads stepped into the riser's toe, the leat's cut, the springs' basins, the tank's steps); the ways (the Phēr road, the Bēnch road, the expedition road, the mule path south to Phēr, the contour and cross streets); the leat's falling line; the blocks; the core/city instance (its own steps: the raster, the ways clipped to it, then frontage-courts on the house blocks with the Xanadu kit's keys by wealth); the civic buildings round the square; the Dalab mission (the Dalab set's healers' hall, granaries and family compound); the fields, the Siṭēps on the riser below the leat; the flora's mask and climate; the people |
| `targets/town/90q-tb-world.js` | the Krator sky and its light, the near ground in two meshes (the town at 10 m, the riser to the gorge's mouth at 20 m), each wearing a canvas painted from the plan's records (the terraces' banks traced as contour lines), the far land out to 40 km (one coarse mesh coloured by height, slope and the rivers; `lodSkip`) |
| `targets/town/89zu-tb-people.js` | the people as data for core/simulation (`TBL`): every resident by household, the plan's shares of jobs drawn by a hash of (seed, household, person), the roles' days and weeks, the walk graph on the plan's ways, the places (houses, civic buildings, the square, the springs, the fields within 600 m of a way, two ways off the page) |
| `targets/town/90t-tb-life.js` | the people drawn: core/simulation stepped once a world minute from core/host's clock, the nearest 900 within 650 m posed by `SIM.pose` as placeholder figures coloured by role (`window._life`) |
| `targets/town/90r-tb-build.js` | every building, chunk by chunk (300 m), each baked into its own group and drawn while in view and range; the Dalab mission's yard wall; the Vale of Xanadu biome over the plan's mask |
| `targets/town/90w-tb-water.js` | core/water: the leat a flow, the seven springs and the tank still water; the tank's steps and the springs' rims |
| `targets/town/91z-views.js` | the views; the town as one budget |
| `verify.py` | Xanadu's verify plus the town's invariants: `thalaba-laid`, `on-the-model`, `people`, `water-on-core` |

**The ground is the model's.** At the pin the page draws the model's bicubic height (1,507.9 m against the cell's 1,507 m);
`on-the-model` holds it. The town's grid is laid on it unflattened: the buildings stand on the lowest ground under them
(core/city's foot), the slope here being 1-2 %.

**The people.** Residents per building are estimates (`TB_PEOPLE`): about 2,500 against the plan's 2,400 (within the
budget's 15 %), with the Devisers' house (40), the Two Horns' factor (20) and the Dalab mission (30) beside them.

## On the open world (T2, T4)

Thalaba is a site of `openworld/xanadu-oidong-highrift` (`openworld/SITES.json`, reach 22 km), cut into the Xanadu Sultanate
polygon the pin falls in (the owner). Its ring there (`src/48-world-site.js`, baked to `plan/sites.json`) is the plan's outworks
on core/hamlet's `xanadu` row: **Briḍj**, the bridge ward at the gorge's mouth (a ranch village: the road warden's watch and the
expeditions' muster corrals), **Salphar**, the diggers' hamlet on the town's small sulfur deposit at the cataract's foot (a
village of its own row, `xanadu-sulfur`: adits, calcaroni (pending boxes there) and a sorting shed), and two farm villages on
the **Bēnch**. The region's roads are bridged where they cross a named river (core/world 42b, in the Xanadu kit's stone):
Thalaba's road north crosses the Solṭ Siṭrīm by a 120 m arched bridge at the mouth.

## What is not here yet (`KNOWN_ISSUES.md`)

Salphar's resource record (stamped on the resource-nodes branch, 36f68df9c, not merged here yet), the expedition road's last 80 km to the Devisers' camp (T6: until the region's recut), the people's own bodies (core/charactermodels), the Godot export and the gallery.
