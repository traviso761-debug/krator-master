# Arcoforte — API Contract (`kits/arcoforte`)

`kits/arcoforte` separates its pure `[G data]` layout, interior room plans, and validation rules (`src/30-af-plan.js`, `src/31-af-interiors.js`, `src/32-af-rules.js`) from Three.js drawing (`src/45`–`89z`) and the `core/host` viewer (`src/99-host-take.js`), so any coastal settlement can read the data fragments in place, map the complex onto `core/world` terrain, and socket its own culture into the refurbished rooms.

## `[G data]` Namespaces (Node & Godot clean)

### `ARCOFORTE` (`src/30-af-plan.js`)
- `ARCOFORTE.DIM` — canonical dimensions (metres; `H: 300`, `PLATEAU: 84`, `SEA: 0`).
- `ARCOFORTE.plan(opts)` — `{ seed = 14800, state = 'refurbished' | 'intact' | 'ruined' }` → deterministic layout record `P`:
  - `P.harbour` — multilevel lift platform decks, twin boat-lift gantries, vessels, West Marina mole & finger piers.
  - `P.subcliff` — refurbished `harbour_works`, sealed/ruined `auto_vaults`, twin inclined cliff lift shafts.
  - `P.bastions` — 9 battered trapezoidal `DWELLINGS` bastions (`4` West, `5` East) + radial buttresses.
  - `P.cityCenter` — West & East vaulted arcades + 13 square radial-oculus `skylights`.
  - `P.promenade` — `y = 144 m` garden ring + 6 mushroom-pier recreation `pavilions`.
  - `P.park` — terraced valley, `amphitheatre`, 2 arch viaduct `bridges`, planted groves & crop beds.
  - `P.linearCity` — West & East stepped live/work bars, transit/waterway spine, 3 circular `drums`.
  - `P.rotunda` — fluted `TOURIST CENTER` / residential drum (`R = 44 m`, `y = 70..222 m`), atrium shaft, 4 lift piers, ribbed oculus dome.
  - `P.towers` — 7 cellular H-plan sea-cliff skyscrapers (`T0..T6`, `y = 28..300 m`) + cantilevered cliff trays.
  - `P.skyCrown` — 300 m unifying canopy (`y = 258..300 m`), inverted-cone struts, Cultural Center vaults, comms mast, cantilevered `heliport`.
  - `P.parts`, `P.ways`, `P.links` — flat index of all parts by stable id (`af.*`), circulation ways, and walk-graph edges.
- `ARCOFORTE.HULL` (also `P.hull`, `window.ARCOFORTE_HULL`, `_api.hull()`) — exact concrete-face hull descriptor for external coastal terrain, water, tideline, and dock fragments (no magic numbers):
  - `span: 576`, `H: 300`, `cliffSpan: 332`, `harbourSpan: 152`, `subcliffSpan: 172`
  - `bounds: [-288, 288, -334, 468]`, `dockBox: [-86, 86, -242, -218]`, `harbourBox: [-76, 76, -334, -246]`, `marinaBox: [-296, -204, -256, -162]`
  - `toe(x)` — northern `z(x)` of the sub-cliff concrete dock face (`-242` for `|x| <= 86`) and sea-cliff toe (`cliffZ(x)` outside).
  - `waterlineZ(x)` — northernmost built face meeting open water at `x` (including Harbour Platform `-334` and NW Marina breakwater `-256`).
  - `plinth` (`{ cx: 0, cz: 10, y0: 84, y1: 144, rBase: 288, rTop: 264, rMid: 212, rInner: 146, rAt(y), towerHalfW(y, yBase), rotundaR(y) }`) and top-level alias `HULL.rAt(y)`.
- `ARCOFORTE.groundAt(P, x, z)` — terrain/seabed elevation in the complex's local frame (`y = 0` sea level, `-22 m` offshore seabed, `5.5 m` harbour bench, `68..82 m` central park, `84 m` inland plateau).
- `ARCOFORTE.toWorld(frame, x, y, z)` — rigid transform `{ x, z, ang, y0 }` into a host settlement's world coordinates.
- `ARCOFORTE.waterRecords(P, WATER, frame)` — builds `core/water` records (`still`, `flow`, `fall`).

### `AF_INT` (`src/31-af-interiors.js`)
- `AF_INT.SOCKETS` — 6 culture socket profiles (`refurbished`, `ancient`, `scrap`, `iziz`, `xanadu`, `republican`).
- `AF_INT.buildPlans(AI, state, P)` — returns `{ state, units: [{ id, name, sector, kept, x, z, w, d, r, storeys, buildings, plan }] }` compatible with `AI.furnishPlan` and `KHOST` cutaway.
- `AF_INT.areaSummary(P, built)` — returns exact floor-area (`m²`) and capacity totals broken down by `living`, `work`, `rec`, and `infra` for both peak intact (`19,291` residents) and refurbished settlement state (`~6,945` residents in the arcology core).
- `AF_INT.simPlaces(P, built, culture)` — plain place records (`SLEEP`, `WORK`, `LEISURE`, capacity) ready for `core/simulation`.

### `AF_RULES` (`src/32-af-rules.js`)
- `AF_RULES.checks(P, built)` — array of `{ name, pass, detail }` structural, geometric, walk-graph, water-grade, and interior-sector invariants.

## Runtime Host & Terrain Isolation (`window.ARCOFORTE_HOST` / `window.ARCOFORTE_OPTS`)
- `window.ARCOFORTE_OPTS = { noTerrain: true }` or URL `?noTerrain=1` — skips building the demo synthetic coastal cliff/terrain mesh (`AF_STAGE.buildRockTerrain(opts)`). All synthetic rock `rng()` draws live inside a dedicated `reseed(14802)` sub-block followed by `reseed(14810)`, so toggling `noTerrain` never shifts a single draw of the megastructure's PRNG stream.
- `ARCOFORTE_HOST.socket(culture)` — re-furnishes all inhabited `living`, `work`, and `rec` rooms in `culture` (`'refurbished' | 'ancient' | 'scrap' | 'iziz' | 'xanadu' | 'republican'`), refreshes `KFURN` records, and rebuilds any open cutaway batch.
- `KHOST.cut.to(unitId, storeyIdx)` / `KHOST.cut.off()` — opens/closes any of the 12 interior zones storey by storey.
