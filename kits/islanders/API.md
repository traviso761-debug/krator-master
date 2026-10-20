# kits/islanders: API

Units, frames, the def, `place()`, `FURNISH` and the probe are the Scyvoi kit's engine: read `kits/scyvoi/API.md`. The culture
tag is `islander` (`KIT.culture`); the faction in the life data is `Ring Sea Islanders`; the two subcultures are tags
`style: 'west'` (the rumah of the western Ring Sea) and `style: 'east'` (Kautoa), and the life layer's sub-faction is
`IS_SUB[style].band`.

Units are metres; x east, y up, z south (north is -z). A def's local frame: origin on the ground at its centre, **+z its
front**, x its right. `ry` is three.js rotation.y: the front (+z) turns to (sin ry, cos ry).

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `42r-res-ore.js`, `44r-res-nodes.js` | res | **read in place from kits/resources** (`build.py` `RESOURCES`): the resource rule and the 30 nodes (ten kinds, three grades) the mines work (`kits/resources/API.md`) |
| `26k-kit.js` | | `KIT`, `IS_SUB`, `SV_LIB` (the library families and the painted keys), `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `KIT_HAS(k)`, `SVPAL`, `P(k)` |
| `28-is-paint.js` | isp | the painted sheets as canvas STAND-INS while the library lacks them: `patGableW` (Batak spirals on red), `patGableE` (Ede/Sumba nested diamonds), `patBand` (kowhaiwhai koru), `patStory` (Palauan storyboard), `patWeave` (the East's twill), `patMat` (the East's plaited mat: black-edged ochre diamonds between red zigzags; the farmstead's and the ikat weaver's walls), `medMoon` (the white island moon) |
| `10-core` `27-mat` `30-geo` `36-def` `90-scene` `91f-furnish` `91n-night` `92-world` `93-anim` `99-host-take` `99-tail` | | VENDORED from `kits/scyvoi/src` (the sky `81-sky.js` from `settlements/iziz`) |
| `40-is-kit.js` | is | the toolkit: `isFace isSpan isNoCut isCutFloor isPiles isDeck isRail isWall isWalls isPatchWall isStair isLadder isLogLadder isPou isFigure isHorns isMoonDisc isBoard isDrum isTyre isTarp isScrapHeap isTomb isMenhir isFenceRun isPalisadeRun isFlag isLamp`; `IS_T` |
| `41-is-roof.js` | is | the roofs: `isSaddle` (the West: sagging ridge, horns, gable panels via its `gable()`), `isSpire` (the East: a rounded-rectangle profile roof), `isHip`, `isGabled`; `isShell` (a thick roof sheet), `isSheet`, `isPatchMk` (scrap patching: `patch` 0..1) |
| `43-is-yards.js` | is | the trades' shared outdoor gear: `isUmu` (earth oven), `isSmokeRack`, `isDryRack` (hides or tapa), `isSaltPans`, `isQuarryFace`, `isSulphurVent`, `isBeacon`, `isCargo`, `isPen`; `isFurn(list)` (FURNISH a list, both styles); the mine's workings `isAdit`, `isWindlass`, `isOrePile`, and `isOreLinks()` (each placed mine's source) |
| `42-is-dress.js` | is | `IS_FURN` (the furniture keys per tier), `isDim(key)`, `isFurnRoom(w, d, y, tier, o)` |
| `50-iw-west.js` | iw | `iwHouse(o)` (any West house from parameters), `iwOpen(L, n, doorX)`; the nine West houses |
| `52-iw-civic.js` | iw | the shared West helpers (`iwArch iwArcade iwPavilion iwSpikes iwShield iwGong iwUprightGong iwPaving iwGrandStair iwDrum`); the assembly hall (after hall.jpg), the ceremonial square, the school |
| `53-iw-trade.js` | iw | `iwSpinner` (geometry in its own buckets, flushed after the build into a group turned about a hub axis by a frame hook: the windmill's sails), `iwRangkiang` (a rice barn), `iwLesung`, `iwWoodpile`; the two farms, the two granaries, the windmill, the warehouse, the smithy, six shops (market hall, kava house, shophouse, weaver, potter, boat-chandler) |
| `54-iw-harbour.js` | iw | `iwFloorAt iwPier iwCanoe iwHull iwSlip iwShearLegs iwRingPier`; the fishing dock, the dockyard, the harbour warehouse |
| `55-iw-defence.js` | iw | `iwStakes iwLogTower`; the palisade, the gate, the watch tower, the barracks |
| `58-iw-trades.js` | iw | `iwPeak(rf, o)` (a Kautoa-style tower of black thatch out of a saddle's middle), `iwShed(o)` (an open work shed under a horned saddle); the peaked rumah, the spirit house (temple), and the West's trades after the Voth census: bakehouse, butcher's and smokehouse, tannery and tapa house, healer's house, guest longhouse, harbourmaster's house, beacon tower, coral quarry, sulphur diggings, salt works, stock pens, buffalo byre; on the shore the quay and cargo shed, the war-canoe shed, the ferry landing |
| `56-sa-beasts.js` | sa | the fauna kit's pig, hen, duck and water buffalo as `life` defs (`saHerd`), `saFlush` |
| `57-fl-flora.js` | fl | PLACEHOLDER flora (class `flora`, biome and harvest tags): `fl-coconut`, `fl-banana`, `fl-taro`, `fl-breadfruit`, `fl-paddy`; `flLeaf` |
| `60-ie-east.js` | ie | `ieHouse(o)` (any Kautoa house from parameters; `o.hall` puts the village hall's roof on it), `ieHallRoof(o)` (the village hall's crossed horned saddles and spire at any size); the twelve Kautoa houses: the nine, and the long house, the cross-roofed house and the chief's house under the hall's roof |
| `62-ie-civic.js` | ie | the shared East helpers (`ieRoofE` the East roof on its own, `ieRoofY`, `ieShed`, `ieCutWith`, `ieArch`, `ieSteps`, `ieFurn`, `ieGallery`, `ieSpireTower`, `ieFinial`); the village hall (after the owner's "plaza"), the ceremonial square (after "sumba - square"), the school |
| `63-ie-trade.js` | ie | `ieGranary`, `ieCanopy`, the turning sails (`IE_MILLS`, `ieMillSails`, `ieMillFlush`, `ieMillBuildWorld`); the farmstead, the smallholding, two granaries, the windmill, the warehouse, the smithy, six shops |
| `64-ie-harbour.js` | ie | `ieSeaFloor iePile ieWalk ieRing ieHull ieDouble ieCanoe ieSlip`; the fishing dock, the dockyard |
| `65-ie-defence.js` | ie | `ieWallRun`; the coral wall, the town gate, the watch tower, the barracks |
| `66-ip-palace.js` | ip | `ipWall ipPave ipSpire`, the hall's roof (`ipSweepF ipSweep ipSweepAt`); the palace of Kautoa (`ip-palace`) and the parts it nests: the great audience hall, the gatehouse, gates, towers, galleries, pavilions, the residence, the shrine, the treasury, the kitchens, granaries, the garden pavilion, the tusk monument |
| `67-ie-trades.js` | ie | Kautoa's trades after the Voth census: the ancestor temple, bakehouse, butcher's and smokehouse, tannery and tapa house, healer's house, guest house and harbourmaster's house (both under the hall's roof), beacon tower, coral quarry, sulphur diggings, salt works, stock pens, buffalo byre, the envoys' compound; on the shore the quay and cargo shed, the drua shed, the ferry landing |
| `69-ie-hamlet.js` | ie | the hamlet works (core/hamlet, H3, 2026-10-19): `ieLog ieLogStack iePlankStack ieHeap`; the sawpit and log yard (`ie-sawpit`, job carpentry), the charcoal kiln (`ie-kiln`, no job: the catalog's vocabulary has no charcoal burning), the corral (`ie-corral`, herding), the food store (`ie-store-food`, trading) and the bloomery (`ie-bloomery`, smithing). Library families added for them: `endgrain logbark banco turf charcoal ash clay` |
| `68-is-trades.js` | is | `IS_TRADES` (every Voth census trade: the Voth building, the defs that carry it in each set, or `na` and why not), `isDims()` (every building's declared box and tags by key: a city layout's `kit.dims`). [G data] |
| `89-rows.js` | | `FAMILIES` (the sheet's rows; a family with `shore: true` stands on the beach and must be LAST) |
| `90h-is-shore.js` | | the shore: under the shore row the drawn ground falls to the sea floor (`IS_SEA.floor`), the sand strip, the Ring Sea on the shared wave field; `IS_SEA` (`level` the waterline y = -0.9, `floor` -3.8, `shoreZ`) |

## The two styles

- **West** (`iw*`): `iwHouse({L, D, floorY, wallH, roof:{ridgeH, sag, hornRise, hornOut, taper, over, p, mk, col, patch, concave, th}, gableFront, wallMk, wallMkf(side), band, gableMk, lean, front/back/left/right openings, doorX, stair, finial, pou, porch, wings, tier, furn, extra(rf, top)})`. `taper: 1` gives gonjong spikes (Minangkabau), `0` open leaning gables (Batak, with `lean`), `hornOut` large with small `p` gives prow ends (Toraja). Black palm-fibre thatch (`thatch` tinted `thatchW`), dark piles (`tarred`), red-black-white paint (`patGableW`, `patBand`, `patStory`), carved posts in `carvedR`.
- **East** (`ie*`): `ieHouse({w, d, floorY, wallH, ver, verFront, roof:{over, skirtH, skirtS, towerH, towerS, topSx, topSz, sq, mk, col, patch}, towers:[[x, z, scale]], wallMk, facade, towerFacade, finial, posts, hornPosts, tombs:[[x, z, ry, s, figures]], stair, tier, furn, extra(top, sk, towerTop)})` returns `{top, sk, towerTop, W2, Dz0, Dz1}`. Golden reed thatch (`thatchR`, `thatchE`), woven walls (`bamboo`, `mat`, `patWeave`), the woven facades (`patGableE`), carved posts in `carved`, megalith tombs (`isTomb`).
- **Shared**: the white island moon (`isMoonDisc`, the teal-and-white `isFlag`), carved posts (`isPou`), buffalo horns (`isHorns`), figures (`isFigure`).
- **Scrap** (the poor, both styles): `roof.patch` (0..1: the share of the roof drawn in corrugated iron and tin; 1 a whole iron roof), `isPatchWall`, wall materials `reclaimed tin corr corrW tarp`, `isTyre` on the roof, `isTarp`, `isDrum`, `isScrapHeap`.

## Rules for a new fragment

- A building fragment (`4x`-`7x`) starts `// prefix: xx` and every top-level name starts with its prefix. Every
  `defBuilding` has a unique numeric `seed:` (West 5001-5499, East 6001-6499, the palace 6500-6599, flora 5700-5799, beasts 5600-5699).
- A def's `w d h` must contain everything it draws (the verifier allows 1.6 m), including roof horns, stairs, posts and piers.
- Every building is `cls: 'building'` with `tags: {types: [...], wealth, style: 'west' | 'east', role?}`; `cut: true` when it has an
  interior, and then 4+ catalog pieces (`FURNISH`, `isFurnRoom`); a front door (`door()` through `isWall`, or `front:`).
- **Openings and lights are recorded** (2026-10-20): `door(x, y, z, yaw, w, h)` and `windowAt(x, y, z, yaw, w, h, sill)`
  (36-def.js) note a doorway and a window in the local frame (they draw nothing); `isWall` calls them for every opening
  it cuts, so a wall built through `isWall`/`isWalls` needs nothing more. A building's record keeps them (`rec.doors`,
  `rec.windows`, world positions, yaw the way out), and every lit point a builder marks with `haloAt` (lamps, hearths,
  fires) is in `HALOS`. A doorway or window drawn without `isWall` is not recorded unless its builder calls `door()` or
  `windowAt()` itself. The isle demo's `ISK.proto` hands them over in the piece's frame (`userData.fixtures`: doors,
  windows, lamps), and its city page exports them as core/export fixtures (settlements/isle-demo 62).
- Furniture is never drawn by the kit: catalog keys only (`islander_common_*`, `islander_court_*`, `generic_*`, `generic_poor_*`,
  `generic_trade_*`, `scrap_*`, `pa_*`, `job_*`; `node` can list them from the bundle). Outdoor pieces take `{setting:'outdoor'}`.
- Plants are `fl-*` defs placed with `place()`, never drawn inside a building's builder.
- HARBOUR defs (on the shore row) keep their land at local z > 0 and build piers over local z < 0; the water is at
  `IS_SEA.level` (-0.9) and the sea floor at `IS_SEA.floor` (-3.8) from 9 m out: piles go down to it.

## The trades and the overlap (owner, 2026-10-14)

- **Every Voth trade, in both sets.** `IS_TRADES` lists the 44 trades of the Voth city's census (`settlements/voth/targets/voth-city/15-vc-tune.js`, `36-vc-census.js`); 40 are carried by at least one def in the West and one in Kautoa, 4 cannot exist on the isles (power houses, beetle ranches, fungus farms, elephant-bug stations). `verify.py --assert` checks it (`voth-trades`). The catalog's job vocabulary is fixed (core/tags), so a trade without a job there (bakers, healers, priests, customs, guards) is carried by the def's `role`.
- **The overlap.** Kautoa stays the taller, pointier set; its long house, cross-roofed house, chief's house, guest house, harbourmaster's house and envoys' hall take the village hall's broad crossed saddles (`ieHallRoof`). The West stays the lower, broad-roofed set; its peaked rumah, spirit house and beacon take Kautoa's pointed peak (`iwPeak`, `isSpire`).

## Mines and ore (owner, 2026-10-15)

A mine (`iw-mine`, `ie-mine`, role `mine`, job `mining`) takes its product from the nearest node of **kits/resources** it can
work (iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter; never oil, which takes a derrick) within 400 m; the node's
grade sets the miners' efficiency, the yield a worker-hour (0.025, 0.05, 0.1 lots). The nodes and the rule are that kit's
(`resSource`, `RES_ORE`), read in place; this kit draws the mines and their
workings and places the nodes in its sheet. `verify.py --assert` `mine-sources` checks every placed mine finds a node and the
rule's cases. `place('iw-mine', x, z, ry, {metal})` tints its ore heaps.

## Probe (`window._api`)

`footprints() doors() kitCoverage() nanSweep() furniture(all) tags() tagExport() materials() life() setNight(v) setCut(v)
setView(...)`, and `REG DEFS SITES ROWS SV_LIFE`. `window._build` holds the build's counters; `KTAGS.page` the tag registry.

## Build and verify

```
cd kits/islanders && python3 build.py                 # dist/islanders.html
python3 build.py --vendor-check                        # the engine against kits/scyvoi/src (must read OK)
python3 verify.py dist/islanders.html --assert         # invariants (headless Chromium)
python3 verify.py dist/islanders.html --only iw-house-rumah --views "Rumah (West) - eye level"
python3 ../../tools/textures/pack.py kits/islanders    # (from the repo root) after a change to materials.json
```
