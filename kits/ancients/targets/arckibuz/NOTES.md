# Arckibuz — Desert Arcology (`targets/arckibuz`)

Paolo Soleri's **Plate 15: Arckibuz** (*Arcology: The City in the Image of Man*, 1969 — desert arcology for 2,500 people, 120 m total vertical section, 6.25 ha covered excavation perimeter, 319 people/ha), built for the Krator Ancients kit in three states (`DECAYS = [0, 1, 3]`) with full interior floor plates and settlement culture sockets planned from the ground up.

## Architectural Organs (from Soleri's Plate 15 Sheets 1 & 2)

1. **Sunken Rock-Cut Desert Pit & Subterranean Base (`y = 0.2 .. 28.0 m`, `250 x 250 m = 6.25 ha`)**
   - A `228 x 228 m` square desert sandstone cliff excavation (`27.8 m` deep below the `y = 28.0 m` desert rim, enclosed by a `250 x 250 m` retaining parapet) shelters a 3-storey subterranean base (`y = 0.2 .. 14.2 m`) housing **Crop Processing** (west), **Storage & Public Arcade** (south), and **Deep Warehousing & Production** (north-east).
   - Above the subterranean roof (`y = 14.2 m`), Soleri's stepped **Promenade** terraces climb the north and east quadrants up to the **Eastern Highway Rim Bridge**, cooled by the **Sunken Court Cistern** cascade (`WATER.fall` + `WATER.still`) and shaded perimeter moat channels.
   - Extending east beneath the cliff and beneath the sunken desert highway (`x = 154 m`) is the reinforced gallery tunnel to the subterranean **Shelter** (`cx = 216 m, cz = 0`), crowned by Soleri's flared hyperbolic ventilation and daylight shaft rising out through the eastern desert plateau (`y = 33.6 m`).

2. **Polygonal Irrigated Desert Apron (`VEGETABLE GARDENS`, `y = 28.0 m`)**
   - Five faceted Vauban-like polygonal agricultural bastions wrap the north, west, and south sides of the rim, divided by the **West Causeway** and **South Causeway**, enclosed by windbreak stone bunds, and watered by `core/water` aqueduct rills (`WATER.flow`) with two vaulted concrete seed and pump sheds (`shed-nw`, `shed-sw`).

3. **Central Trunk / Neck (`CITY CENTER` `y = 22.0 .. 38.0 m` & `COMMUNITY` `y = 38.0 .. 53.0 m`)**
   - Rising on four `14 x 14 m` corner mega-cores and eight cylindrical ring columns:
     - **City Center** (`96 x 88 m`, 3 civic storeys) bridges the rim causeways with a grand reception hall, clinic, library, school, and market concourse.
     - **Community Tier** (`128 x 116 m`, 2 grand levels) flares outward around Soleri's **Central Circular Stepped Council Amphitheater** (`r = 23.5 m`, open to the Sky Court oculus above) framed by **four rotational pinwheel square corner bastions** (`officers-hall`, `dining-hall`, `stern-lounge`, `gallery`).

4. **Cantilevered Upper Housing Crown (`y = 53.0 .. 120.2 m`, `184 m` E-W span)**
   - A `176 x 140 m` cantilevered sky-promenade (`y = 53.0 .. 55.5 m`) frames the `66 x 48 m` open **Public Sky Court**, surrounded by four 9-storey pinwheel **Housing** quadrants (`y = 55.5 .. 95.1 m`), flanked by `18 m` deep horizontal **Sun-Breaker Louver Wings** (`+/-92 m` = `184 m` span), and clad in Soleri's recessed cellular/hieroglyphic loggia cassettes.
   - Above the housing roof (`y = 95.1 m`) rise five peaked tensile **Tent Structure** shade canopies (`y = 105.0 m`) and the monumental North-East shoulder **Water Reservoir** tower (`y = 120.2 m` -> **120.0 m** above the `y = 0.2 m` pit base).

## Three States & Settlement Refurbishment Socket

- **`d = 0` (Intact, `x = -960`)**: Pristine Ancient desert arcology (`~2,500` capacity), ivory concrete, blue glass, cyan fascia strips, taut white PTFE roof tents, full water reservoir & irrigation rills, interiors furnished in `'ancient'`.
- **`d = 1` (Ruined, `x = +960`)**: Breached SE water reservoir & sheared SE cantilever housing/louver corner, fallen structural wrecks seated on `AKB_WATER.ground` (`KRUINS.watch` clean: `0` floating, `0` unseated wrecks), silted moat seepage pool, dry scrub gardens, broken interior partitions (`45%`).
- **`d = 3` (Refurbished Settlement Centerpiece, `x = 0`)**: Repaired shell, restored rooftop water reservoir & working garden irrigation rills, woven desert canvas shade sails, warm inhabited window lights across the active core (`~1,660` people across Pit Crop Works, Shelter, Trunk/Community Bowl, and North/South/West Housing Quadrants, immediately furnished in `'post-apoc'` / `'occupied'` settlement dress), while the **East Housing Quadrant & Deep Production Bay** (`arckibuz/3/dormant`, `~840` expansion capacity) are visibly sealed behind riveted bulkheads as an unfurnished `'rehab'` socket.
- **Culture Re-Dressing API**: `window._api.arckibuzSocket(culture, { includeDormant, seed })` re-furnishes Arckibuz in any settlement culture (`'pylon'`, `'iziz'`, `'nomad'`, `'eastabyss'`, `'xanadu'`, `'post-apoc'`, `'ancient'`).
- **Host Settlement Integration (`ARCKIBUZ.HULL` & `opts`)**:
  - `ARCKIBUZ.HULL` (also exposed as `buildArckibuz.hull` and `G.userData.hull`) exports `span` (`184 m`), `spanZ` (`140 m`), `H` (`120 m`), `rAt(y)`, `zAt(y)`, `zToe(x)` / `toeZ(x)`, `zUp(x)`, `levels`, `reservoir`, `cistern`, `moatChannels`, `canals`, and `docks` so host settlements and `AKB_WATER` share one source of truth with zero magic numbers.
  - `buildArckibuz(scene, gx, gz, d, opts)` accepts `{ noTerrain: true, ground: (x, z) => y }`: synthetic demo terrain (`L`) runs inside its own `reseed(12725 + d)` sub-block and `reseed(12720 + d)` resets unconditionally before the megastructure, so disabling demo terrain never shifts a single megastructure `rng()` draw.

## Fragment Map

| File | Tag | Role |
|---|---|---|
| `8aw0-arckibuz-plan.js` | `[G data]` | Deterministic geometry, `ARCKIBUZ.HULL`, organ records, garden polygons, cassettes, reachability & bulkhead cuts (`ARCKIBUZ`) |
| `8aw1-arckibuz-interiors.js` | `[G data]` | `kits/ancients-interiors` floor plates (`barPlate`, `hallPlate`, `gridPlate`, `ringPlate`) across all organs (`AKB_INTERIORS`) |
| `8aw2-arckibuz-water.js` | `[G data]` | `ARCKIBUZ.HULL`-driven `core/water` records (reservoir, cascade, cistern, moat channels, garden rills) & `KRUINS` ground twin (`AKB_WATER`) |
| `8aw2b-arckibuz-parts.js` | `[draw]` | Desert cliff/canvas textures, `MAT.akb*` materials, landscape, council bowl, cassettes, tents & wreck seating |
| `8aw3-arckibuz-draw.js` | `[draw]` | `buildArckibuz(scene, gx, gz, d, opts)` (`reseed(12720+d)`), `KTAGS`, `REGISTER`, merged superstructure |
| `8zz4-arckibuz-host.js` | `[draw]` | Wires `AKB_INTERIORS` into `AIK`, splits 6 organ sub-sites per decay, exposes `window._api.arckibuzSocket` |
| `89z-rows.js` | `[G data]` | `DECAYS = [0, 1, 3]`, `ROWS = { arckibuz: { z: 0, s: 960, r: 420 } }` |
| `90w-arckibuz-water.js` | `[draw]` | `ATMOS` skylight, `WATER` draw calls, `KRUINS.watch` on `d = 1` |
| `91z-views.js` | `[G data]` | `BUDGET.type.arckibuz = 'mega'` and 13 preset views (hero, pit, gardens, council bowl, shelter, night, 3 cutaways) |
| `test-arckibuz.js` | `[G data]` | Node `ktest.js` suite (determinism, scale, `HULL`, reachability, `AI.storeyAudit`, `AI.furnishPlan` audits, `AKB_WATER`) |
