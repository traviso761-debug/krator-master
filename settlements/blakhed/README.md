# settlements/blakhed: Blakhed, the Fellgangs' market town at the head of the Blak Riba

The rim's market and meeting town of **5,000** at the head of the Blak Riba (scale model 5.1, px 441,1400, 3,653 m), where the
south road tops out of the Chimes gorge and Dalab, the Fellgangs, the Travellers and Xanadu's Annual Great Caravan meet.
`PLAN.md` is the site plan and the owner's answers (2026-11-16); this folder builds steps **B1-B5** and **B6 (interiors)**.
Everything not from the owner or the lore is *proposed* (`PLAN.md` says which).

## Build and verify

```
python3 ../../tools/build.py settlements/blakhed   # dist/blakhed.html (a plain python3 build.py comes through it)
node test-bk-town.js                               # the town, the Stairhead, the steadings and the 12 hamlets without a browser
node test-bk-economy.js                            # B5: Blakhed's year, Dalab's stair toll, and the Great Caravan join (W1/W3/W4)
KRATOR_GL=gpu python3 verify.py dist/blakhed.html --assert --views "Overview,The Market"
```

The town is a target on Xanadu's page, as Thalaba, Kirstabal and Lāiṭwāl are: `build.py` writes five closures into `gen/`
(`core/space` + `core/city` + `core/hamlet` with the Fellgang row; the Tungang kit sealed as `TG` with catalog furniture and its
maps beside the page; the scale model 5.1's ground round the pin and the Blak Riba's vertices; today's `core/biome` with
`biomes/riftrim`'s veiled rim; and Dalab's trimmed texture pack) and runs `settlements/xanadu/build.py --kit settlements/blakhed`.
The Fellgang buildings draw through `TG.fg.draw` and `TG.fg.pieces` (including step B2's town-scale `fg-doublehall`,
`fg-markethall`, `fg-booth`, `fg-halting-house`, `fg-ropewalk`, `fg-great-icehouse`, `fg-smithy`, `fg-tannery`, `fg-granary`,
`fg-fair-stand`, `fg-stair-hoist`, `fg-fair-hurdle`, `fg-cairn` and `fg-stone-sign`); the Golden Tears' compound draws in the
Xanadu kit's pieces with hollow interiors (`89b1-bk-interiors.js`, `89y-xa-interiors.js`); Dalab's toll post at the Stairhead
reads the Dalab set (`settlements/dalab/src`) in place through `kit.json`.

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/69bm-bk-ground.js` | [G data] | `BK_GROUND`: four scale-model grids blended round px 441,1400 (`gen/69bk3-bk-model.js`), the Blak Riba (`r116`) smoothed and cut in with its bed falling all its length, the leat and the six ice ponds |
| `src/69bn-bk-town.js` | [G data] | `BK_TOWN.make`: one `core/city` instance (`frontage-courts` on the house blocks, `KCITY.courts.place` on the quarters): the Market (`fg-doublehall` holding both customs in one, `fg-markethall`, the head's house, granary, smithy, halting houses, booths and the standing peace stone), the Icegarth (8 `fg-great-icehouse` + 4 `fg-icehouse`, sledge sheds), the Ropewalk (5 44-m `fg-ropewalk` ranges, egg stores, tanneries), the Folds, the carriers' yard, the Fairfell (pens, stalls, `fg-fair-stand`, `fg-fair-hurdle` ring), the cairn hall, the Golden Tears' walled Xanadu compound, and the Winterings' Traveller wagons and halts |
| `src/69bo-bk-ring.js` | [G data] | `BK_RING.make`: four river steadings, the Stairhead at the falls' lip (24 km downstream) and the twelve hamlets of the network (`PLAN.md` 3.2a) on `core/hamlet` (`BK_ROW`), plus Dalab's four-piece toll post, two `fg-stair-hoist` gin wheels and the gorge stair's switchbacks |
| `src/89b0-bk-matlib.js` | [draw] | binds the `blakhed` ground pack (`bkTurf`, `bkDirt`, `bkFlag`, `bkTilled`, `bkPeat`, `bkYard`, `bkRuts`, `bkShingle`) |
| `src/89b1-bk-interiors.js` | [G data] | enables Xanadu's hollow-wall and room-furnishing pass by default (`?interiors=0` turns it off) and adds the interior set item for `xa_serai` |
| `targets/town/89z-rows.js` | [G data] | skips Xanadu's kit-sheet showcase (`window.CITY = true`) and names the page title |
| `targets/town/89zb-bk-site.js` | [G data] | sets `terrainH`, lays `BK_PLAN` and `BK_RINGS`, registers every Fellgang building, road piece and Stairhead hoist in `core/tags`, lays the irrigated in-field strips (`BK_FIELDS`) and builds the flora mask and climate fields |
| `targets/town/90b-bk-world.js` | [web] | the Krator sky (autumn Fair morning, 3,653 m / 1.01 atm), four ground meshes on `core/drawn` (town 10 m, Stairhead 12 m, country 50 m, far land 500 m to 60 km) painted from the records, the Blak Riba and leat (`WATER.flow`) and the six ice ponds (`WATER.still`) |
| `targets/town/90c-bk-build.js` | [web] | draws the town's and villages' Fellgang chunks (`TG.fg.draw`, with `walk`, `doors`, `steps`, catalog `furniture` and `XA_CUT` cutaway on the town), the site/road pieces and Stairhead hoists (`TG.fg.pieces`), the Golden Tears' compound (with stone podiums, entry steps and hollow Xanadu interiors), Dalab's toll post, the compound wall, gorge stair steps and Winterings fire ring |
| `targets/town/90d-bk-flora.js` | [web] | grows `biomes/riftrim` (rim `w`, autumn) over the plan's mask: moor sponge, prism heath, mist cups, sedge, tussock and copper stones on the fells, sparse lobe larches along the river and mist frills at the Stairhead's cloud lip |
| `targets/town/91z-views.js` | [G data] | 16 views across the town, inside the double hall and caravanserai court, the Golden Tears, the ford and the Stairhead |
| `sim/wr-blakhed.js` | [G data] | `WR_BLAKHED`: Blakhed's West Rift economy spec (`valley`) and its W3 join replacing `XAN_TUNE`'s `gate.dalab.blakhed` stand-in on the Annual Great Caravan |
| `test-bk-town.js`, `test-bk-economy.js` | | Node tests (`tools/ktest.js`): layout/overlap/roads/water/villages/determinism, and a full year of Blakhed's economy and the East Rift caravan join |
| `verify.py` | | Xanadu's verify plus `blakhed-laid`, `people`, `villages`, `golden-tears`, `toll-post`, `ix-fellgang`, `ix-golden-tears`, `on-the-model`, `water-on-core` and `fell-flora` |

## Not here yet

`KNOWN_ISSUES.md`. The open-world region cut (B0), `core/camp` Traveller row, citizen actors/schedules on `core/simulation`, `core/hazard` zones and the Godot export are later steps.
