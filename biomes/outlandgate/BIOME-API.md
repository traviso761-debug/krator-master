# biomes/outlandgate: the kit's surface

The Outland Gate kit (`OGATE`) on the biome core, the Outlands' contract (`biomes/outlands/BIOME-API.md`) without the colony pass: the gap's
floor is the crater side's, and its trees are its neighbours', read in place.

## The pages

| Page | Build | What |
|---|---|---|
| `dist/outlandgate.html` | `python3 tools/build.py biomes/outlandgate` | station 1, **the Narrows and the Gate**: the gap's floor at 1.4 km, Hau-Gel braided, the Tierhounds' long wall, toll fort, water gate and shrine; the walls past the map on the scale model's heights |
| `dist/outlandgate-seeps.html` | `python3 tools/build.py biomes/outlandgate --station seeps` | station 2, **the West Bench: the warm seeps** (5.1 px 1416,312): the wall's 5 % slope at 2 km, three spring alcoves and their rimstone stairs, two dike ribs, the caravanserai, wind-trained woods |
| `dist/outlandgate-tarn.html` | `python3 tools/build.py biomes/outlandgate --station tarn` | station 3, **the Upper Gate Tarn** (1538,472): the tarn's north shore, three flood terraces, the outlet coulee with its giant ripples, erratics, the Outlands' young colonies, the god's road and the shrine |
| `dist/outlandgate-mouth.html` | `python3 tools/build.py biomes/outlandgate --station mouth` | station 4, **the Spider Lake Threshold** (1328,228): Hau-Gel's delta into Spider Lake, warm coves, the spiders' silk in the woods, Spider Lake's people's silk landing |

`verify.py dist/<page> --assert` checks each (station 1's checks are `src/98-host-views.js`'s, the others' `stations/_shared/98-host-views.js` and their STAGE's). Station 5, the Nursery Bench, is
the Outlands kit's page (`biomes/outlands --station nursery`).

## The kit: `OGATE`

| Name | What |
|---|---|
| `OGATE.SPECIES`, `byKey` | the kit's own species: the Gate reed (rods on BIO.fung's stalk) |
| `OGATE.KIN` | the neighbours' rows this page grows (`from`, `key`, `name`, `scale`, `where`, `tags`): ebadlands' cottonwood (twice: the gallery and the bars' pioneers), oak and maple |
| `OGATE.build({R, quality})` | the kin's woods on KRAND lattices by their ground and the reed beds; returns `{trees, reeds, kin}` |
| `OGATE.TREES` | after the build: every tree's `{key, x, z, y, H, crownR}` |

## What the host gives the kit

Fields through `BIO.field`: the biome core's names plus `bank` (cached) and `bankX` (exact: a channel's lip is narrower than the cache's
18 m cell), `bar` (the gravel bars), `floor` (the flat floor), `swale` (the old flood channels), `road`, `works` (the Gate's footprints:
nothing grows there). The host's mask keeps every root out of the water and the works.

## The host's wind, hazards and fauna (station 1)

| Name | What |
|---|---|
| `WIND` (89z) | `ATMOS.katabatic(...)`'s handle: `{night, day, wind}` now; `WIND_O` its options (`down` = `GAP_DOWN`, the river's line north; `speed` 2.6, `daySpeed` 1.1). `?wind=0` none |
| `BANNERS` (89z) | the cloth on each tower and the keep, turned downwind each frame; `window._wind` |
| `HAZ` (87) | `{drown: [records], flood: record, cycle, ambient}`: the river's `drown` cylinders, the outburst flood (a box over the floor on `cycle` `{period 900, warn 45, ramp 90, on 150, after 120, afterK .3}`), the heat provided (`KHAZ.provide('temperature')`). `?flood=now` / `?flood=0` |
| `floodT()`, `floodK(t)` (87) | the flood's clock (seconds since load) and its k; `FLOOD_DRAW` (89zw) the still surface raised with it; `window._flood` |
| `FAUNA` (87b) | `{groups, animals, drawn, people, plan}`: the land `outlandgate.narrows` planned and registered (FAUNALANDS); `OUTLANDGATE_FAUNA` the people's animals (runner birds on the road, the camp's camels and donkeys, the fort's goats), each a `fauna` record. `?fauna=0` none; `window._fauna` |

## The neighbours read in place (`build.py`, `KIN`)

`{"<kit>": [[its fragments], "<its API>", [its pack families]]}`: each kit's species and tree builders slot after the host stage (45) and
before this kit (50), in their own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with. A
station adds its own with `"kin"` in its `station.json`.

## The later stations (`stations/`)

Each station is a folder: its `station.json` (`use`: the shared host fragments from `stations/_shared/`; `drop`; `core`; `kin` and
`kinDrop`: the neighbours read in place and station 1's left off; `families`: the page's own three ground layers), its `44f-og-far-data.js`
(`tools/far_grid.py <station>`: the model round its own pixel), its `45-host-stage.js` (the land, the fields, `BIO.init` and the STAGE record:
`stations/_shared/44z-host-common.js` lists every key and which shared fragment reads it), its kit rows (`52-og-<station>.js`: `OGATE.KINX`,
and the mouth's `silk` item) and its placement (`60-og-floor.js`: `OGATE.build` for that page). The shared host draws the ground (84), the
rock bodies (84b: `STAGE.rocks`, KSTACKS), the far field (85), the works (86: `STAGE.works(W)`), the hazards (87: `STAGE.hazards(H)`,
`STAGE.heat`, `STAGE.flood`), the fauna (87b: `STAGE.fauna`), the sky (89), the air and the gap's wind with its banners (89z: `STAGE.down`,
`STAGE.wind`, `STAGE.banners`), the water (89zw: `STAGE.water`: lakes, flows, pools, terraces) and the views and checks (98: the shared
checks, then `STAGE.checks` and `STAGE.negatives`).

| Station | Its own fields | Its own records |
|---|---|---|
| seeps | `seep`, `sinter` (`sinterX` exact), `alcove`, `hi`, `dike` | the three alcoves and stairs, the dike ribs, the caravanserai, its gatehouse and cistern, the track; `slip` and `fall` hazards |
| tarn | `shore`, `coulee`, `ripple`, `bank` (`bankX` exact), `tread` | the tarn, the coulee, the ripples, the erratics, the shrine, the cairns, the god's road; `OGATE.COLONIES` (the young colonies); `drown`, `crush`, `fall`, the flood |
| mouth | `delta`, `levee`, `swamp`, `cove`, `rise`, `shore` (`bankX` exact) | the lake, the delta, the coves, the landing, its houses, jetty and reeling frames, the god's road; `OGATE.WEBS`; `drown`, `heat`, `hunter` (the spiders' zones) |
