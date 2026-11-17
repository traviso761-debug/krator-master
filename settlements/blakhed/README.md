# settlements/blakhed: Blakhed, the Fellgangs' market town at the head of the Blak Riba

The rim's market and meeting town of **5,000** at the head of the Blak Riba (scale model 5.1, px 441,1400, 3,653 m), where the
south road tops out of the Chimes gorge and Dalab, the Fellgangs, the Travellers and Xanadu's Annual Great Caravan meet.
`PLAN.md` is the site plan and the owner's answers (2026-11-16); this folder builds steps B1-B5's first pass. Everything not
from the owner or the lore is *proposed* (`PLAN.md` says which).

## Build and verify

```
python3 ../../tools/build.py settlements/blakhed   # dist/blakhed.html (a plain python3 build.py comes through it)
node test-bk-town.js                               # the town, the Stairhead, the steadings and the 12 hamlets without a browser
node test-bk-economy.js                            # B5: Blakhed's year, Dalab's stair toll, and the Great Caravan join (W1/W3/W4)
KRATOR_GL=gpu python3 verify.py dist/blakhed.html --assert --views "Overview,The Market"
```

The town is a target on Xanadu's page, as Thalaba, Kirstabal and Lāiṭwāl are: `build.py` writes five closures into `gen/`
(`core/space` + `core/city` + `core/hamlet` with the Fellgang row; the Tungang kit sealed as `TG` with its maps beside the
page; the scale model 5.1's ground round the pin and the Blak Riba's vertices; today's `core/biome` with `biomes/riftrim`'s
veiled rim; and Dalab's trimmed texture pack) and runs `settlements/xanadu/build.py --kit settlements/blakhed`. The Fellgang
buildings draw through `TG.fg.draw` and `TG.fg.pieces`; the Golden Tears' compound draws in the Xanadu kit's pieces; Dalab's
toll post at the Stairhead reads the Dalab set (`settlements/dalab/src`) in place through `kit.json`. `core/atmos`,
`core/water` and `core/drawn` come in through `kit.json` `"files"`; the ground's eight library sets are this folder's own pack
(`materials.json`, `tex/`, bound by `src/89b0-bk-matlib.js`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/69bm-bk-ground.js` | [G data] | `BK_GROUND`: four scale-model grids blended round px 441,1400 (`gen/69bk3-bk-model.js`), the Blak Riba (`r116`) smoothed and cut in with its bed falling all its length, the leat and the six ice ponds |
| `src/69bn-bk-town.js` | [G data] | `BK_TOWN.make`: one `core/city` instance (`frontage-courts` on the house blocks, `KCITY.courts.place` on the quarters): the Market (both `fg-meethall` customs facing across it, the head's house, stores, halting houses), the Icegarth (14 ice houses, sledge sheds), the Ropewalk (12 rope houses end to end, 5 egg and honey stores), the Folds, the carriers' yard, the Fairfell, the cairn hall, the Golden Tears' walled Xanadu compound, and the Winterings' Traveller wagons and halts |
| `src/69bo-bk-ring.js` | [G data] | `BK_RING.make`: four river steadings, the Stairhead at the falls' lip (24 km downstream) and the twelve hamlets of the network (`PLAN.md` 3.2a) on `core/hamlet` (`BK_ROW`), plus Dalab's four-piece toll post, two gin-wheel hoists and the gorge stair's switchbacks |
| `src/89b0-bk-matlib.js` | [draw] | binds the `blakhed` ground pack (`bkTurf`, `bkDirt`, `bkFlag`, `bkTilled`, `bkPeat`, `bkYard`, `bkRuts`, `bkShingle`) |
| `targets/town/89z-rows.js` | [G data] | skips Xanadu's kit-sheet showcase (`window.CITY = true`) and names the page title |
| `targets/town/89zb-bk-site.js` | [G data] | sets `terrainH`, lays `BK_PLAN` and `BK_RINGS`, registers every Fellgang building and piece in `core/tags`, lays the irrigated in-field strips (`BK_FIELDS`) and builds the flora mask and climate fields |
| `targets/town/90b-bk-world.js` | [web] | the Krator sky (autumn Fair morning, 3,653 m / 1.01 atm), four ground meshes on `core/drawn` (town 10 m, Stairhead 12 m, country 50 m, far land 500 m to 60 km) painted from the records, the Blak Riba and leat (`WATER.flow`) and the six ice ponds (`WATER.still`) |
| `targets/town/90c-bk-build.js` | [web] | draws the town's and villages' Fellgang chunks (`TG.fg.draw`), the wagons/halts/lamps (`TG.fg.pieces`), the Golden Tears' compound and Dalab's toll post (`VERN.place`), and the page geometry for what the kit lacks (the Fair's ring rails, booths and cairn, the Market's booths and peace stone, the Winterings' fire ring, the Stairhead's gin wheels and stair steps) |
| `targets/town/90d-bk-flora.js` | [web] | grows `biomes/riftrim` (rim `w`, autumn) over the plan's mask: moor sponge, prism heath, mist cups, sedge, tussock and copper stones on the fells, sparse lobe larches along the river and mist frills at the Stairhead's cloud lip |
| `targets/town/91z-views.js` | [G data] | 14 views across the town, the Golden Tears, the ford and the Stairhead, and the budget |
| `sim/wr-blakhed.js` | [G data] | `WR_BLAKHED`: Blakhed's West Rift economy spec (`valley`) and its W3 join replacing `XAN_TUNE`'s `gate.dalab.blakhed` stand-in on the Annual Great Caravan |
| `test-bk-town.js`, `test-bk-economy.js` | | Node tests (`tools/ktest.js`): layout/overlap/roads/water/villages/determinism, and a full year of Blakhed's economy and the East Rift caravan join |
| `verify.py` | | Xanadu's verify plus `blakhed-laid`, `people`, `villages`, `golden-tears`, `toll-post`, `on-the-model`, `water-on-core` and `fell-flora` |

## Not here yet

`KNOWN_ISSUES.md`. The open-world region cut (B0), upstream Tungang town-scale pieces (B2), `core/camp` Traveller row, and interiors and citizen schedules (B6) are later steps.
