# Arcoforte — API Contract (`kits/arcoforte`)

`kits/arcoforte` separates its pure `[G data]` layout, interior room plans, and validation rules (`src/30-af-plan.js`, `src/31-af-interiors.js`, `src/32-af-rules.js`) from Three.js drawing (`src/45`–`89z`) and the `core/host` viewer (`src/99-host-take.js`), so any coastal settlement can read the data fragments in place, map the complex onto `core/world` terrain, and socket its own culture into the refurbished rooms.

## `[G data]` Namespaces (Node & Godot clean)

### `ARCOFORTE` (`src/30-af-plan.js`)
- `ARCOFORTE.DIM` — canonical dimensions (metres; `H: 300`, `PLATEAU: 84`, `SEA: 0`).
- `ARCOFORTE.ZONES` — `['harbour', 'bastions', 'ring', 'towers_upper', 'vaults', 'crown']`:
  - `'harbour'`: harbour lift platform, NW marina, sub-cliff fishing/boatyard works (`60-af-draw-base.js`, `harbour_works`).
  - `'bastions'`: 9 lower perimeter dwelling bastions, Southern Linear City bars & gatehouse drums (`60-af-draw-base.js`, `62-af-draw-ring.js`, `linear_west/east`, `bastion_west/east`).
  - `'ring'`: vaulted City Center arcades, oculus skylights, garden promenade & belvederes, Domed Rotunda, and lower skyscraper storeys (`y < 148 m`).
  - `'towers_upper'`: the seven sea-cliff skyscrapers' upper storeys (`y >= 148 m`, `tower_central` L3–L5).
  - `'vaults'`: the sub-cliff automated industry vaults (`auto_vaults`, sealed behind gated bulkheads unless `'intact'`).
  - `'crown'`: the 300 m Sky-Crown canopy, Cultural Center halls, comms spire & cantilevered heliport (`64-af-draw-crown.js`, `sky_crown`).
- `ARCOFORTE.state(spec)` / `ARCOFORTE.zoneState(zone)` / `ARCOFORTE.isZoneHabitable(zone)`:
  - `'intact' | 'refurbished' | 'ruined'` — sets all 6 zones uniformly (default `'refurbished'` keeps `vaults` sealed unless explicitly `'intact'`).
  - `'marginal'` — shorthand for `{ default: 'ruined', harbour: 'refurbished', bastions: 'refurbished', ring: 'refurbished', towers_upper: 'ruined', vaults: 'ruined', crown: 'ruined' }` (lower bastions, ring halls & harbour boat-lift working and lit; upper towers, sealed vaults & Sky-Crown weathered/ruined).
  - `{ default?: 'ruined', harbour?: ..., bastions?: ..., ring?: ..., towers_upper?: ..., vaults?: ..., crown?: ... }` — sets custom per-zone states (`'intact' | 'refurbished' | 'ruined'`). Unknown state strings or zone keys throw.
- `ARCOFORTE.socket(spec)` / `ARCOFORTE.zoneSocket(zone)`:
  - Accepts either a single culture string (`'refurbished' | 'ancient' | 'scrap' | 'iziz' | 'xanadu' | 'republican' | 'fleetborn' | 'shorekin'`) or a per-zone culture map (`{ bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin' }`).
  - `'fleetborn'` — Fleet-born (`cFlit-qBon`) caretaker fittings placed **only** in habitable `'bastions'` and `'ring'` halls (catechu-red slung hammock galleries, free-dive stone-weight / bone-goggle / paktong-spear racks, suspended resonant stone lithophone bars, paktong cleats & oil lamps, spun sea-byssus partition curtains, clan tally boards).
  - `'shorekin'` — Shore-kin yard-crew fittings placed **only** in habitable `'harbour'` works & boat-lift crew rooms using Arch local & sea materials only (zero nephrite or red cypress: Araucaria & mangrove timber bunks, pierced brucite-travertine vent screens, shell-limewash tally slates, coir/pandanus sleeping mats, pitch pots, caulking mallets & rope coils).
  - Explicitly targeting a ruined or sealed zone (`vaults` when not `'intact'`, or `crown` in `'marginal'`) throws.
- `ARCOFORTE.plan(opts)` — `{ seed = 14800, state? }` → deterministic layout record `P` (`P.zones` holds the resolved per-zone state map):
  - `P.harbour` — multilevel lift platform decks, twin boat-lift gantries, vessels, West Marina mole & finger piers.
  - `P.subcliff` — `harbour_works`, `auto_vaults`, twin inclined cliff lift shafts.
  - `P.bastions` — 9 battered trapezoidal `DWELLINGS` bastions (`4` West, `5` East) + radial buttresses.
  - `P.cityCenter` — West & East vaulted arcades + 13 square radial-oculus `skylights`.
  - `P.promenade` — `y = 144 m` garden ring + 6 mushroom-pier recreation `pavilions`.
  - `P.park` — terraced valley, `amphitheatre`, 2 arch viaduct `bridges`, planted groves & crop beds.
  - `P.linearCity` — West & East stepped live/work bars, transit/waterway spine, 3 circular `drums`.
  - `P.rotunda` — fluted `TOURIST CENTER` / residential drum (`R = 44 m`, `y = 70..222 m`), atrium shaft, 4 lift piers, ribbed oculus dome.
  - `P.towers` — 7 cellular H-plan sea-cliff skyscrapers (`T0..T6`, `y = 28..300 m`) + cantilevered cliff trays (`lowerZone: 'ring'`, `zone: 'towers_upper'`).
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
- `AF_INT.SOCKETS` — 8 culture socket profiles (`refurbished`, `ancient`, `scrap`, `iziz`, `xanadu`, `republican`, `fleetborn`, `shorekin`), plus `AF_INT.PALETTES` and `AF_INT.SOCKET_PIECES` (37 declarative `[G data]` custom pieces for Fleet-born & Shore-kin).
- `AF_INT.installPieces(KF, adapter)` / `AF_INT.installDresses(AI, adapter)` — registers Fleet-born & Shore-kin palettes, `FURN` specs, and hall recipe dresses (`AI.DRESS.fleetborn`, `AI.DRESS.shorekin`).
- `AF_INT.buildPlans(AI, state, P)` — returns `{ state, zones, units: [{ id, name, zone, sector, kept, x, z, w, d, r, storeys, buildings, plan }] }` compatible with `AI.furnishPlan` and `KHOST` cutaway.
- `AF_INT.furnishAll(AI, built, adapter, sockSpec, seed)` — furnishes kept storeys across all habitable zones for either a single culture string or a per-zone socket map.
- `AF_INT.areaSummary(P, built)` — returns exact floor-area (`m²`) and capacity totals broken down by `living`, `work`, `rec`, and `infra` for both peak intact (`19,291` residents) and active kept zones (`~6,945` residents in full `'refurbished'`).
- `AF_INT.simPlaces(P, built, sockSpec)` — plain place records (`SLEEP`, `WORK`, `LEISURE`, zone, culture, capacity) ready for `core/simulation`.

### `AF_RULES` (`src/32-af-rules.js`)
- `AF_RULES.checks(P, built)` — array of `{ name, pass, detail }` structural, geometric, walk-graph, water-grade, and per-zone interior-state invariants.

## Runtime Host & Terrain Isolation (`window.ARCOFORTE_HOST` / `globalThis.ARCOFORTE_OPTS`)
- `globalThis.ARCOFORTE_OPTS = { state?, socket?, noTerrain? }` — load-time options read by `30-af-plan.js` and `45-host-stage.js` when a host settlement embeds Arcoforte. `noTerrain: true` (or URL `?noTerrain=1`) skips building the demo synthetic coastal cliff/terrain mesh (`AF_STAGE.buildRockTerrain(opts)`); synthetic rock `rng()` draws live inside an isolated `reseed(14802)` sub-block followed by `reseed(14810)`, so toggling `noTerrain` never shifts the megastructure's PRNG stream.
- URL parameters: `?state=refurbished|marginal|intact|ruined` and `?socket=fleetborn` (or per-zone `?socket=bastions:fleetborn,ring:fleetborn,harbour:shorekin`; legacy `?culture=` also supported).
- `ARCOFORTE.socket(spec)` / `ARCOFORTE_HOST.socket(spec)` — live-furnishes inhabited rooms by single culture or per-zone map, refreshes `KFURN` records in `AF_TAGS`, and rebuilds any open cutaway batch.
- `KHOST.cut.to(unitId, storeyIdx)` / `KHOST.cut.off()` — opens/closes any of the 12 interior zones storey by storey.
