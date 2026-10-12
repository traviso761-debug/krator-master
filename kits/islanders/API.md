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
| `26k-kit.js` | | `KIT`, `IS_SUB`, `SV_LIB` (the library families and the painted keys), `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `KIT_HAS(k)`, `SVPAL`, `P(k)` |
| `28-is-paint.js` | isp | the painted sheets as canvas STAND-INS while the library lacks them: `patGableW` (Batak spirals on red), `patGableE` (Ede/Sumba nested diamonds), `patBand` (kowhaiwhai koru), `patStory` (Palauan storyboard), `patWeave` (the East's twill), `medMoon` (the white island moon) |
| `10-core` `27-mat` `30-geo` `36-def` `90-scene` `91-probe` `91f-furnish` `91n-night` `92-camera` `93-anim` `99-tail` | | VENDORED from `kits/scyvoi/src` (the sky `81-sky.js` from `settlements/iziz`) |
| `40-is-kit.js` | is | the toolkit: `isFace isSpan isNoCut isCutFloor isPiles isDeck isRail isWall isWalls isPatchWall isStair isLadder isLogLadder isPou isFigure isHorns isMoonDisc isBoard isDrum isTyre isTarp isScrapHeap isTomb isMenhir isFenceRun isPalisadeRun isFlag isLamp`; `IS_T` |
| `41-is-roof.js` | is | the roofs: `isSaddle` (the West: sagging ridge, horns, gable panels via its `gable()`), `isSpire` (the East: a rounded-rectangle profile roof), `isHip`, `isGabled`; `isShell` (a thick roof sheet), `isSheet`, `isPatchMk` (scrap patching: `patch` 0..1) |
| `42-is-dress.js` | is | `IS_FURN` (the furniture keys per tier), `isDim(key)`, `isFurnRoom(w, d, y, tier, o)` |
| `50-iw-west.js` | iw | `iwHouse(o)` (any West house from parameters), `iwOpen(L, n, doorX)`; the nine West houses |
| `56-sa-beasts.js` | sa | the fauna kit's pig, hen, duck and water buffalo as `life` defs (`saHerd`), `saFlush` |
| `57-fl-flora.js` | fl | PLACEHOLDER flora (class `flora`, biome and harvest tags): `fl-coconut`, `fl-banana`, `fl-taro`, `fl-breadfruit`, `fl-paddy`; `flLeaf` |
| `60-ie-east.js` | ie | `ieHouse(o)` (any Kautoa house from parameters); the nine Kautoa houses |
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
- Furniture is never drawn by the kit: catalog keys only (`islander_common_*`, `islander_court_*`, `generic_*`, `generic_poor_*`,
  `generic_trade_*`, `scrap_*`, `pa_*`, `job_*`; `node` can list them from the bundle). Outdoor pieces take `{setting:'outdoor'}`.
- Plants are `fl-*` defs placed with `place()`, never drawn inside a building's builder.
- HARBOUR defs (on the shore row) keep their land at local z > 0 and build piers over local z < 0; the water is at
  `IS_SEA.level` (-0.9) and the sea floor at `IS_SEA.floor` (-3.8) from 9 m out: piles go down to it.

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
