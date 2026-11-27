# biomes/batteredisle: Biome API

`BATTER` (`BIO.kit('batteredisle')`) models **Battered Isle** (`rmwetgzft4x9d`), the deeply eroded skeletal core of an extinct cinder and scoria cone off Krator's Tsunami Coast (`17 km` WNW of `Shroudhills`).

## Public Surface (`[G data]` + `[draw]`)

- `BATTER_PHYS` (`src/40-biome-batter-phys.js`, `[G data]`):
  - `cinderConeAt({ px, py, localX, localZ, elevM, distPlugKm, azDeg })`
  - `tsunamiShadowAt({ azFromCenterDeg, coastSlope, shoalDepthM, tier })`
  - `blowholeAt({ dikeRib01, palagonite01, elevM, coastDistM, waveEnergy, swellPhase, exposedWNW, drawdownM })`
  - `springLineAt({ elevM, scoriaDepthM, palagonite01, upslopeCatchKm2 })`
  - `windShearAt({ elevM, azFromCenterDeg, gullyShelter01 })`
- `BATTER_SITES` (`src/41-biome-batter-sites.js`, `[G data]`):
  - `STATIONS`: `cove` (`438, 258`, default), `rampart` (`444, 244`), `strait` (`494, 250`), `plug` (`474, 248`)
  - `STRATA`: `worn-scoria-palagonite`, `olivine-plug-basalt`, `upturned-coal-collar`
- `BATTER.build({ R, quality, station, space, reserves })`:
  - Places all 8 own botanical species (`batteredlaurel`, `ironkneepodocarp`, `nickelmyrtle`, `scoriathrift`, `cindersedge`, `covepandan`, `tuffcress`, `soundkelp`), `BIO.kin` partners (`biomes/arch` nickel-hyperaccumulators & `biomes/farside` intertidal wrack), volcanic boulders/seams, and 6 coastal fauna cohorts into `BIO` buckets/items and `KSPACE`.
- `BATTER.canopyH(x, z)`: expected canopy height in metres.

## Reading in Place (`settlements/battered-port/` & `openworld/`)

Include `28-batter-mipvar.js`, `40-biome-batter-phys.js`, `41-biome-batter-sites.js`, `50-biome-batter-species.js`, `60-biome-batter-place.js`, and `70-biome-batteredisle.js` alongside `matlib_pack.fragment(BATTER_DIR, 'batteredisle', side=SIDE)`. Stamp `KCITY` footprints into `KSPACE` first and pass `{ space: citySpace }` to `BATTER.build(...)`.
