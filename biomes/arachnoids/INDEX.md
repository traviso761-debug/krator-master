# biomes/arachnoids: index

Arachnoid Canyons (`PLAN.md`): Core `Arachnoid Canyons` Proper (`own = rmvarachnoids & ~all_other_biomes` = `111,952 km²` / `27,988` cells, `+847–5,845 m`, incised by trunk river `9102` *Hām-Tsēk*), pairing an `85%` montane-gorge vascular guild matrix with `15%` grounded `0.75 g` volcano-tectonic & biophysical extremes across four verified stations strictly inside `own` (`dist/arachnoids.html`, `dist/arachnoids-fumarole.html`, `dist/arachnoids-ledges.html`, `dist/arachnoids-frostrim.html`). Verified: `build.py`, `tests/test-arachnoids.js`, `verify.py --assert`. Read `BIOME-API.md`.

Docs: `BIOME-API.md`, `KNOWN_ISSUES.md`, `PLAN.md`, `PORT.md`

Built outputs (never open them; edit `src/` and rebuild): `dist/arachnoids.html`, `dist/arachnoids-fumarole.html`, `dist/arachnoids-ledges.html`, `dist/arachnoids-frostrim.html`

Build: `python3 tools/build.py biomes/arachnoids [--station fumarole|ledges|frostrim]`. Fragments are concatenated in filename order.

From `core/terrain/` (shared; see `core/README.md`): `35-core-strata.js`, `37-core-stacks.js`, `38-core-relief.js`, `38d-core-slab.js`, `39-core-cavern.js`, `39b-core-speleo.js`, `39b2-core-speleo-cleft.js`, `42-core-frost.js`, `43-core-ground.js`, `44-core-farfield.js`, `45-core-horizon.js`, `47-core-therm.js`

## src/

| Fragment | KB | Responsibility |
|---|---|---|
| `00-head.html` | 1 | Self-contained HTML shell |
| `40-biome-arach-phys.js` | 12 | `ARACH_PHYS` (`fissureNetAt`, `inversionAt`, `webSpanAt`, `silkPinWeight`, `displaceSilk`, `fumaroleAt`, `krummholzShearAt`, `CROPS`, `FAUNA`, `HAZARDS`, `[G data]`, `tests/test-arachnoids.js`) |
| `41-biome-arach-sites.js` | 8 | `ARACH_SITES` verified `own`-polygon oracle & survey records for `nexus`, `fumarole`, `ledges`, `frostrim` (`[G data]`) |
| `45-host-stage.js` | 22 | Renderer, 4-station canyon/dike heightfields & hydrology, `KSTACKS`, `KRELIEF.slab`, `KFROST`, `KTHERM`, `KSPACE`, `BIO.init` |
| `50-biome-arach-species.js` | 25 | `ARACHNOIDS.SPECIES` (`11` species), `ARACHNOIDS.HARVEST`, `100%` packed library materials (`ARACHNOIDS.M`), `BIO.flareJoin` trees, `0.75 g` ATMOS wind-pinned communal Bridge-Web catenary builder, octahedral impostors |
| `60-biome-arach-place.js` | 16 | Deterministic cell-seeded placement (`KRAND.hash`), `KSPACE` non-overlap & dike pairing, `KTAGS` registration |
| `70-biome-arachnoids.js` | <1 | `BIO.kitEnd(ARACHNOIDS)` closure (`[G data]`) |
| `84-host-ground.js` | 16 | `KGROUND` (4 library layers/station), `KSTRATA` lateral colonnade shading, `KDRAWN` warped grid, `KSTACKS` dike fins, `KCAVERN` + `KSPELEO` (`HYPOGENE` saltpeter & `SMOKY` Kluft) |
| `85-host-far.js` | 4 | `KFAR` `14 km` textured horizon, sampler guard (`<= 14`), `KHORIZON` occlusion |
| `86-host-works.js` | 7 | `site:hum-*` cultural reserves, `KHAZ` registration, and optional `?works=0` textured Hum silk capstans, basalt wind-flutes, riffle-boxes & cairns |
| `88-host-place.js` | <1 | `STATION_BUILD` bridge |
| `89-host-sky.js` | 1 | `ATMOS.skyBiome` at exact `5.1` sky-frame coordinates and pressure (`1.47 -> 0.88 atm`) |
| `89a-host-atmos.js` | 2 | `ATMOS.bindHost`, ATMOS silk wind, inverted canyon height fog, `snowCover`, `bindWeather` |
| `89w-host-water.js` | 4 | `9102` *Hām-Tsēk* whitewater chutes, 9 monotone basalt-weir step-pools (`WATER.still`), ring-fault fumarole steam (`WATER.fumarole`) |
| `89z-host-build.js` | 3 | `WATER.fields`, `BIO.bake`, `BIO.bakeImpostors`, `KSHADOW` (off at load) |
| `99-host-take.js` | 14 | Preset views, `[Clear] / [Slot-Mist] / [Rim-Gale]` controls, inspector, `hostChecks`, `hostNegatives`, `KHOST.take` |
| `99-tail.html` | <1 | Closes `<script></body></html>` |

## stations/

| Station | Output | KB |
|---|---|---|
| `nexus` *(default)* | `dist/arachnoids.html` | <1 |
| `fumarole` | `dist/arachnoids-fumarole.html` | <1 |
| `ledges` | `dist/arachnoids-ledges.html` | <1 |
| `frostrim` | `dist/arachnoids-frostrim.html` | <1 |
