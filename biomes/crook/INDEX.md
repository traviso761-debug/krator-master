# biomes/crook: index

The Crook (`PLAN.md`, `CROOK-RIA-DECISIONS.md` §1.6): a `1,280 km` coastal-to-alpine mountain trough (`rmw4wknusgc7h` / `crookshore`, `rmwet8ethscuf` / `crookwash`, `rmwetb495tgzt` / `crookhead`) pairing an `85-90%` Olympic/Yakushima/Fiordland/Caucasus montane forest and tarn matrix with `10-15%` grounded physical and geochemical weirdness across three verified stations (`dist/crook.html`, `dist/crook-wash.html`, `dist/crook-head.html`). Verified: `build.py`, `tests/test-crook.js`, `verify.py --assert`. Read `BIOME-API.md`.

Docs: `BIOME-API.md`, `KNOWN_ISSUES.md`, `PLAN.md`, `PORT.md`

Built outputs (never open them; edit `src/` and rebuild): `dist/crook.html`, `dist/crook-wash.html`, `dist/crook-head.html`

Build: `python3 tools/build.py biomes/crook [--station wash|head]`. Fragments are concatenated in filename order.

From `core/terrain/` (shared; see `core/README.md`): `35-core-strata.js`, `38-core-relief.js`, `42-core-frost.js`, `43-core-ground.js`, `44-core-farfield.js`, `45-core-horizon.js`

## src/

| Fragment | KB | Responsibility |
|---|---|---|
| `00-head.html` | 1 | Self-contained HTML shell |
| `40-biome-crook-phys.js` | 12 | `CROOK_PHYS`, `CROOK_CROPS`, `CROOK_FAUNA` (`[G data]`, `tests/test-crook.js`) |
| `41-biome-crook-sites.js` | 5 | `CROOK_SITES` survey records for `shore`, `wash`, `head` + sub-sites (`[G data]`) |
| `45-host-stage.js` | 15 | Renderer, multi-station heightfields & hydrology, `KFROST`, `KSPACE`, `KHAZ`, `BIO.init` |
| `50-biome-crook-species.js` | 24 | `CROOK.SPECIES` (`24` species), `CROOK.HARVEST`, `100%` library materials (`CROOK.M`), `BIO.flareJoin` trees, `BIO.bamboo`, `BIO.fung`, octahedral impostors |
| `60-biome-crook-place.js` | 17 | Deterministic cell-seeded placement (`KRAND.hash`), `KSPACE` non-overlap, `KTAGS` registration |
| `70-biome-crook.js` | <1 | `BIO.kitEnd(CROOK)` closure (`[G data]`) |
| `84-host-ground.js` | 8 | `KGROUND` (4 library layers/station), `KSTRATA` lateral shading, `KDRAWN` warped grid |
| `85-host-far.js` | 3 | `KFAR` `14 km` textured horizon, sampler guard (`<= 14`), `KHORIZON` occlusion |
| `86-host-works.js` | 4 | `site:*` cultural reserves (`KTAGS`) & optional `?works=0` textured trail cairns / nephrite chimes |
| `88-host-place.js` | <1 | `STATION_BUILD` bridge |
| `89-host-sky.js` | 1 | `ATMOS.skyBiome` at exact `5.1` sky-frame coordinates and pressure |
| `89a-host-atmos.js` | 2 | `ATMOS.bindHost`, wind gusts, height fog, `snowCover`, `bindWeather` |
| `89w-host-water.js` | 6 | `WATER.open` ocean surf + plume, calm caldera lagoon, 16 monotone `WATER.still` rimstone pools, moraine tarn, `WATER.flow` torrents |
| `89z-host-build.js` | 3 | `WATER.fields`, `BIO.bake`, `BIO.bakeImpostors`, `KSHADOW` (off at load) |
| `99-host-take.js` | 13 | Preset views, interactive controls, inspector, `hostChecks`, `hostNegatives`, `KHOST.take` |
| `99-tail.html` | <1 | Closes `<script></body></html>` |

## stations/

| Station | Output | KB |
|---|---|---|
| `shore` *(default)* | `dist/crook.html` | <1 |
| `wash` | `dist/crook-wash.html` | <1 |
| `head` | `dist/crook-head.html` | <1 |
