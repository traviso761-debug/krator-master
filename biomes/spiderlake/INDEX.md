# biomes/spiderlake: index

Spider Lake (`PLAN.md`, `CROOK-RIA-DECISIONS.md` §2.5.5, Scale Model `5.1` polygon `rmvyj4v2ozgb1`): a `72,928 km²` highland-lacustrine secondary-impact basin (`66,688 km²` dry rim/bench land + `6,240 km²` open water at `+1,460.0 m` under unified `1.33 atm` / `0.28 atm O2` / `0.75 g` dense hyperoxic air) showcased across six verified stations (`dist/spiderlake.html`, `dist/spiderlake-narrows.html`, `dist/spiderlake-pavilion.html`, `dist/spiderlake-fen.html`, `dist/spiderlake-dolomite.html`, `dist/spiderlake-rampart.html`). Verified: `build.py`, `tests/test-spiderlake.js`, `verify.py --assert`. Read `BIOME-API.md`.

Docs: `BIOME-API.md`, `KNOWN_ISSUES.md`, `PLAN.md`, `PORT.md`

Built outputs (never open them; edit `src/` and rebuild): `dist/spiderlake.html`, `dist/spiderlake-narrows.html`, `dist/spiderlake-pavilion.html`, `dist/spiderlake-fen.html`, `dist/spiderlake-dolomite.html`, `dist/spiderlake-rampart.html`

Build: `python3 tools/build.py biomes/spiderlake [--station narrows|pavilion|fen|dolomite|rampart]`. Fragments are concatenated in filename order.

## src/

| Fragment | KB | Responsibility |
|---|---|---|
| `00-head.html` | 1 | Self-contained HTML shell |
| `40-biome-spider-phys.js` | 13 | `SPIDER_PHYS`, `slSilkMath`, `SILK_GRADES`, `CROPS`, `FAUNA`, `HAZARDS` (`[G data]`, `tests/test-spiderlake.js`) |
| `41-biome-spider-sites.js` | 8 | `SPIDER_SITES` survey records for `spillway`, `narrows`, `pavilion`, `fen`, `dolomite`, `rampart` (`[G data]`) |
| `45-host-stage.js` | 17 | Renderer, 6-station heightfields & hydrology, `SPIDER_PHYS` raster cache, `KSPACE`, `KHAZ`, `BIO.init` |
| `50-biome-spider-species.js` | 26 | `SPIDERLAKE.SPECIES` (`12` species), `SPIDERLAKE.HARVEST`, `100%` library materials (`SPIDERLAKE.M`), `BIO.flareJoin` trees, `ATMOS` wind-pinned silk batch builders |
| `60-biome-spider-place.js` | 19 | Deterministic cell-seeded placement (`KRAND.cell` / `KRAND.hash`), `KSPACE` non-overlap, `KTAGS` registration (`[G data]`) |
| `70-biome-spider.js` | <1 | `BIO.kitEnd(SPIDERLAKE)` closure (`[G data]`) |
| `84-host-ground.js` | 14 | `KGROUND` (4 library layers/station), `KSTRATA` ejecta-over-dolomite rock shading, `KDRAWN` warped grid, Station 5 `KCAVERN` + `KSPELEO.CALCITE` + `KCAVERN.cutLayer` crystal grotto |
| `85-host-far.js` | 4 | `KFAR` `14 km` textured horizon, sampler guard (`<= 13`), `KHORIZON` occlusion |
| `86-host-works.js` | 6 | `site:spider-lake-weirs` reserve (`KTAGS`) & optional `?works=0` removable cedar/porphyry `Silk-Weir` reeling frames, smudge-pots, and cocoon lanterns |
| `88-host-place.js` | <1 | `STATION_BUILD` bridge & `SILK_MESHES` finalizer |
| `89-host-sky.js` | 1 | `ATMOS.skyBiome` at exact `5.1` sky-frame coordinates and `1.33 atm` / `1.24 atm` pressures |
| `89a-host-atmos.js` | 5 | `ATMOS.bindHost`, `SPIDERLAKE.bindAtmosSilk` (`atmWind` pinned `aFlut`), height fog, smudge smoke, `300 m` dusk lake-smoke midge pillars |
| `89w-host-water.js` | 6 | `WATER.open` `+1,460.0 m` lake + `farBed`, `52`/`52c` alkaline degumming springs & fumaroles, `380 m3/s` spillway cataracts & `640 m3/s` `Hau-Gel` braids |
| `89z-host-build.js` | 3 | `WATER.fields`, `BIO.bake`, `BIO.bakeImpostors`, `KSHADOW` (off at load) |
| `99-host-take.js` | 16 | Preset views, `[Dawn Fog] / [Dusk Lake-Smoke] / [Smudge Harvest]` controls, inspector, `hostChecks`, `hostNegatives`, `KHOST.take` |
| `99-tail.html` | <1 | Closes `<script></body></html>` |

## stations/

| Station | Output | Pixel (`5.1`) |
|---|---|---|
| `spillway` *(default)* | `dist/spiderlake.html` | `(1272, 193)` |
| `narrows` | `dist/spiderlake-narrows.html` | `(1288, 220)` |
| `pavilion` | `dist/spiderlake-pavilion.html` | `(1308, 224)` |
| `fen` | `dist/spiderlake-fen.html` | `(1328, 228)` |
| `dolomite` | `dist/spiderlake-dolomite.html` | `(1256, 184)` |
| `rampart` | `dist/spiderlake-rampart.html` | `(1278, 166)` |
