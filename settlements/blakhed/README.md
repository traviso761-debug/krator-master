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
(`core/space` + `core/city` + `core/hamlet` with the Fellgang row + `core/camp`; the Tungang kit sealed as `TG` with catalog
furniture and its maps beside the page; the scale model 5.1's ground round the pin and the Blak Riba's vertices; today's
`core/biome` with `biomes/riftrim`'s veiled rim; and Dalab's trimmed texture pack) and runs
`settlements/xanadu/build.py --kit settlements/blakhed`. The Fellgang buildings draw through `TG.fg.draw` and `TG.fg.pieces`
(including step B2's town-scale pieces and the Traveller camp set `fg-wagon`, `fg-bender`, `fg-camp-hearth` and `fg-tinsmith`,
with continuous flush masonry gables and wall-head caps); **Dalab's mission** (~134 people right near the Market centre) and its
Stairhead toll post draw from `settlements/dalab/src` in place through `kit.json`; the Golden Tears' compound draws in the Xanadu
kit's pieces with hollow interiors (`89b1-bk-interiors.js`, `89y-xa-interiors.js`).

## How the town is made

| Fragment | Tag | What |
|---|---|---|
| `src/69bm-bk-ground.js` | [G data] | `BK_GROUND`: four scale-model grids blended round px 441,1400 (`gen/69bk3-bk-model.js`), the Blak Riba (`r116`) smoothed and cut in with a wide flat-bottomed wet trough falling all its length, the leat and the six ice ponds |
| `src/69bn-bk-town.js` | [G data] | `BK_TOWN.make`: a compact Fellgang town on `core/city` loosely clustered round the central 92 x 72 m Marketplace (marked as a sworn zone of truce and hospitality by 16 `fg-truce-post` boundary stones, a central Peace Ring, Hospitality Hearth and Market `fg-dugout-icehouse`), **Dalab's mission** near the centre of town (~134 people across 13 Dalab buildings), the Icegarth (great, barrow and dugout ice-houses), Ropewalk, Folds, carriers' yard, Fairfell, cairn hall, Golden Tears' Xanadui compound, and the **Winterings** pitched on `core/camp` (`KCAMP.pitch`, culture `traveller`) |
| `src/69bo-bk-ring.js` | [G data] | `BK_RING.make`: four river steadings, the Stairhead at the falls' lip (24 km downstream) and the twelve hamlets of the network (`PLAN.md` 3.2a) on `core/hamlet` (`BK_ROW`), plus Dalab's four-piece toll post, two `fg-stair-hoist` gin wheels and the gorge stair's switchbacks |
| `src/78-bk-sim.js` | [G data] | `BK_SIM`: presented site simulation on `core/simulation` — connected nav graph, 311 citizens & pack-sledges across 6 cultural dress presets (`fellgang`, `traveller`, `kradz`, `wildcat`, `dalab`, `tears`), needs (`eat`, `sleep`, `warmth`, `company`, `voice`), dugout/barrow ice-keeping (`77-sim-6-govern.js`), weekly Double Meeting (`fg-doublehall`), and Market Truce enforcement inside the 16 `fg-truce-post` stones |
| `src/89b0-bk-matlib.js` | [draw] | binds the `blakhed` ground pack (`bkTurf`..`bkShingle`) and `dalab` mission surfaces (`dRammed`, `dRelief`, murals, turquoise fretwork, banners) |
| `src/89b1-bk-interiors.js` | [G data] | enables Xanadu's hollow-wall and room-furnishing pass by default (`?interiors=0` turns it off) and adds the interior set item for `xa_serai` |
| `targets/town/89z-rows.js` | [G data] | skips Xanadu's kit-sheet showcase (`window.CITY = true`) and names the page title |
| `targets/town/89zb-bk-site.js` | [G data] | sets `terrainH`, lays `BK_PLAN` and `BK_RINGS`, registers every Fellgang building, road/camp piece and Stairhead hoist in `core/tags`, lays the irrigated in-field strips (`BK_FIELDS`) and builds the flora mask and climate fields |
| `targets/town/90b-bk-world.js` | [web] | the Krator sky (autumn Fair morning, 3,653 m / 1.01 atm), four ground meshes on `core/drawn` painted from the records (including circular worn wagon tracks and grassy greens for each Traveller family ring); the ground's eight library sets drawn by `core/terrain`'s KGROUND as one texture array (`BK_KGARRAY`: 5 samplers a ground program instead of 12; `?kgarray=0` the eight samplers, `core/terrain/GROUND.md`), the Blak Riba and leat (`WATER.flow`) and the six ice ponds (`WATER.still`) |
| `targets/town/90c-bk-build.js` | [web] | draws the town's and villages' Fellgang chunks (`TG.fg.draw`, with `walk`, `doors`, `steps`, catalog `furniture` and `XA_CUT` cutaway on the town), the site/camp pieces and Stairhead hoists (`TG.fg.pieces`), Dalab's central mission and rammed-earth gate wall, the Golden Tears' compound (with stone podiums, entry steps and hollow Xanadu interiors), and Dalab's Stairhead toll post and gorge stair |
| `targets/town/90d-bk-flora.js` | [web] | grows `biomes/riftrim` (rim `w`, autumn) over the plan's mask: moor sponge, prism heath, mist cups, sedge, tussock and copper stones on the fells, sparse lobe larches along the river and mist frills at the Stairhead's cloud lip |
| `targets/town/90e-bk-life.js` | [web] | `BK_LIFE`: browser host stepping `KCLOCK` and `SIM`, posing and rendering multi-part instanced Fellgang, Traveller, Kradz, Wildcat, Dalab & Golden Tears citizens and pack-sledges |
| `targets/town/91z-views.js` | [G data] | 18 views across the compact town, Marketplace truce zone, dugout ice-house, Dalab mission, Traveller family circles, inside the double hall and caravanserai court, Golden Tears, ford and Stairhead |
| `sim/wr-blakhed.js` | [G data] | `WR_BLAKHED`: Blakhed's economy adapter over `core/region/data/wr-tune.js` (`WR_TUNE`, covering all 12,250 Fellgangs across 25 groups + 12 West Rift neighbours) and its W3 join on the Annual Great Caravan |
| `test-bk-town.js`, `test-bk-economy.js` | | Node tests (`tools/ktest.js`): layout/clustering/Dalab mission/Travellers' camp/overlap/roads/water/villages/determinism/presented `BK_SIM`, and a full year of Blakhed's economy and the East Rift caravan join |
| `verify.py` | | Xanadu's verify plus `blakhed-laid`, `people`, `villages`, `dalab-mission`, `travellers-camp`, `golden-tears`, `toll-post`, `ix-fellgang`, `ix-golden-tears`, `on-the-model`, `water-on-core`, `fell-flora` and `bk-sim` |

## Not here yet

`KNOWN_ISSUES.md`. The open-world region cut (B0), MPFB `core/charactermodels` GLB garments, Dalab `kits/interiors` set, `core/hazard` zones and the Godot export are later steps.
