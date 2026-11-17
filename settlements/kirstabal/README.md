# settlements/kirstabal: Kirstabal, the Scarp's barge port

The staging town of 3,000 at the head of the Lower Xanadu Lake, under the Oidong–Xanadu scarp, between Qiblai and
Strongbow's lift (scale model 5.1, pin `sl758m2396`, px 989,1600). `PLAN.md` is the site plan and the owner's answers
(2026-11-16); this folder is its steps K0-K4. Everything not from the owner or the lore is *proposed* (PLAN.md says which).

## Build and verify

```
python3 build.py                                   # dist/kirstabal.html (through tools/build.py)
python3 build.py --bake-model                      # rewrite src/39k-ks-model.js from the scale model
node test-ks-town.js                               # the town, the ring and the lake's villages, without a browser
KRATOR_GL=gpu python3 verify.py dist/kirstabal.html --assert --views "Overview,The harbour"
node ../../core/region/tests/test-xan-economy.js   # K1: the town in the Sultanate's economy
```

The town is a target on Xanadu's page, as Qiblai's city is: `build.py` writes `gen/69k-kcity-bundle.js` (core/space,
core/city and core/hamlet sealed in one closure, with `KCITY.lib` handing the town's site steps what core/city's own steps
use) and runs `settlements/xanadu/build.py --kit settlements/kirstabal`. Only the normal Xanadu kit draws it (the owner:
"it will use just the normal xanadu kit"), with the kit's opt-in lake trades (`kits/xanadu/src/87k-xa-lake-trades.js`: the
caravanserai, the latex house, the tea factory, the fermentary, the fish racks) read in place through `kit.json`. core/atmos, core/water and core/drawn come in through `kit.json` "files"; the
ground's six library sets are this folder's own pack (`materials.json`, `tex/`, bound by `src/89k0-ks-matlib.js`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/39k-ks-model.js` | [G data] | GENERATED (`--bake-model`): the scale model's heights above the lake (-1,685 m) and its water, px 925..1009 x 1580..1619 |
| `src/40-ks-ground.js` | [G data] | `KS_GROUND`: the page's frame (origin px 988.33,1599.4; y above the lake), the shore frame (u along the shore, v inland), the town's ground as designed (beach, apron, harbour basin) blended into the model north (the river's arm) and east (the scarp), Keb Riwa's line and channel, the cataract; the moat's trench (`setMoat`, from core/city's square: 3 m deep, its water's level `moatLevel`), `base` the ground without it |
| `src/41-ks-town.js` | [G data] | `KS_TOWN.make`: one core/city instance on core/city's irregular square (`KCITY.grid`: the walled square after Chiang Mai, 2026-11-17): its zone, its grid streets and avenues, the wall's records side by side (`KCITY.grid.wall`: four named gates, a bastion at each corner, buttresses), the landmarks in their grid cells, core/city's steps 6-11 in the blocks (no alleys); then the town's own records outside the wall: the harbour's quays, mole and lighthouse, the boat sheds and the barge, the latex house, the White Monastery's house, the Strongbow road and the bridge over Keb Riwa; `places` (the bazaar and the gates in the shore frame) and `wall` for the page |
| `src/42-ks-ring.js` | [G data] | `KS_RING.make`: Kirstabal's ring (three farming villages and a ranch), the fishing hamlet Jāl on the town's shore and the lake's nine villages on core/hamlet (`KHAMLET.village`); the lake's fish, on the Xanadu row extended with fishing works (`fishingRow`: boat sheds, fish racks, a quay at the shore); the ring and Jāl drawn, the lake's villages records for the open world (K6) |
| `targets/town/89zk-ks-site.js` | [G data] | the site on the page: `terrainH`, the town and the ring with the kit's boxes (VERN.defs), each record seated (Erewhon's stance: base at the highest corner, a footing to the lowest), the flora's mask from the records (the town's yards a third of the country's trees and plants), the climate's wetness (`ksWet`: the flora's `wet` field and the grass's tint); the town wall's pieces from the wall records (kind `wall`: the curtain in runs of at most 14 m, a gate at each gate node, a buttress at each tower, a bastion at each corner); `ksInWall` |
| `targets/town/90k-ks-world.js` | [web] | the Krator sky, the camera's reach (the cataract is 24 km off), four ground meshes registered with core/drawn (the town 6 m, Keb Riwa's last 4 km and the bridge 10 m, the country 50 m, the far field 500 m; each coarser one sunk under the finer), painted from the records, the lake (WATER.open) and Keb Riwa from the lip to its mouth (WATER.flow) ; the yards as garden plots (green garden, tilled beds or beaten earth by 9 m plot, `window._ksGardens`) |
| `targets/town/90l-ks-build.js` | [web] | the mole's rubble bank, every record by VERN.place in 400 m chunks with Qiblai's runtime LOD; the avenues' palms and the main streets' shade trees (xaPlant, every 14 or 20 m each side where the ground is clear), the kit's garden plants (the vendored biome's xaPlant) baked; with `?interiors=1` (K5) only the governor's house, the Two Horns' factor house, the serai, the tea factory and the latex house hollow and furnished (Xanadu's mode, 89y; the lake trades' items: kits/xanadu 87k1), then the doors' walk (`xaIxWalk`) |
| `targets/town/90m-ks-flora.js` | [web] | the Rift climate (the owner, 2026-11-16): the Rift kit (`biomes/rift`, with today's core/biome sealed in `gen/69k2-ks-flora-bundle.js`) built over the mask, its fields the climate (wet by the lake, Keb Riwa and the scarp's foot, dry inland: jungle and savannah), baked with impostors on the Rift page's diet (heroes to 800 m, the far floor to 1.6 km) and its impostor light (`impostorLook` gain 3.6, wrap 1) |
| `targets/town/91z-views.js` | [G data] | the views (no apostrophe or colon in a name) and the budget |
| `test-ks-town.js`, `test-ks-ring-checks.js` | | the node tests (tools/ktest.js): no overlap, nothing on a street or in the water but the harbour's, 3,000 people, the landmarks, the bridge over the river, the reruns; the villages are the tune's and lay out dry |
| `verify.py` | | Xanadu's verify plus the town's: `kirstabal-laid`, `people`, `ring-laid`, `water`; `--interiors` loads `?interiors=1` and runs the hollow walls' reachability audit on the five K5 buildings |

## Not here yet

`KNOWN_ISSUES.md`. Life is a later step. The site in the open world (K6) is `openworld/xanadu-oidong-highrift`'s: the ring, the
lake's nine villages and the roads to Strongbow's foot and Qiblai, planned on the world's ground; the town is this page's.
