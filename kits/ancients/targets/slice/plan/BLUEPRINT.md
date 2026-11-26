# Slice — Architectural & Modern-Condition Blueprint (`26. Theology`)

**Slice** (`kits/ancients/targets/slice` -> `kits/ancients/dist/slice.html`) translates Paolo Soleri's *26. Theology* (`reference/theology_plan.png`, `reference/theology_elevation.png`) into a self-contained Ancient cliff-slice arcology in both intact (`d = 0`) and ruined (`d = 1`) states.

## 1. Site & Vertical Section (`0..560 m`, `34 ha` covered, `~13,000` citizens)

1. **Upper Columnar-Jointed Escarpment & Lenticular "Slice" Eye (`y = 410..536 m`, `720 m` wide)**:
   - A razor-tipped biconvex horizontal slice carved across the tall vertical monolith columns of the upper cliff (`y = 220..560 m`), sheltered beneath a dark mineral-streaked rock vault.
   - **Central Coffered Geodesic Apse Dome (`CITY CENTER`, `R = 56 m` arch, `R = 44 m` coffered shell)** flanked on the west by the **Cultural Center** arcade and saucer dome, and on the east by the **City Center** forum and **Vaulted Living** hall with five lower-hull porthole oculi.
   - **Cantilevered Cellular Honeycomb Belly (`y = 410..456 m`)** and **Semicircular Radial-Buttressed Park & Recreation Amphitheatre Fan** (`5` planted semicircular steps on `7` tapered radial buttress piers with a reflecting pool).
   - **Excavated Plateau Chambers & Skylight Wells (`y = 456..562 m`)**: four concentric horseshoe `DWELLINGS` arcs, the six-sided **Hexagonal `SKYLIGHT` Commercial & Promenade Court** (`6` cylindrical `VERTICAL STRUCT` corner drums), West `RESIDENTIAL` and East `PUBLIC` circular skylight drums, the **Vaulted `MEETING AREAS` Hypostyle Hall**, and **Twin Diagonal `INTER-CITY TRANSPORTATION` Guideway Portals**.

2. **Vertical Learning & Collection Shaft + Four Rock-Cut Specimen Caverns (`y = 28..412 m`)**:
   - A `60 m`-wide, `36`-storey vertical pedagogical & stratigraphic archive tower dropping plumb from the Shaft Capital Collar (`y = 400..414 m`) straight into the sunken canyon trench.
   - Branches horizontally into the cliff wall to expose fossil and geological strata in situ: **Upper-West `RESEARCH` Cavern** (`+344 m`), **Mid-East `MUSEUMS` Double-Vaulted Cavern** (`+312 m`), **Mid-West `ANTHROPOLOGICAL COLLECTION` Cavern** (`+268 m`), plus the **West Stratified Bench Fieldhouse Pavilion** (`+220 m`).

3. **Deep Sunken Park Slot Canyon, Battered Dwellings Wall & Subterranean Automated Industries (`y = 0..232 m`)**:
   - Below the horizontally-stratified `+220 m` rock shoulders, a `192 m`-deep vertical slot plunges to a sheltered **`PARK`** (`y = 28 m`) watered by a turquoise-emerald reflecting canal (`core/water`).
   - On the east side rises the `26`-storey **Battered Stepped `DWELLINGS` Wall** (`y = 28..232 m`) capped by a rounded wind-hood and linked across the slot to the Learning Shaft by seven diagonal light-veil arch ribs and vertical sun-louvers.
   - Beneath the Park (`y = 0..28 m`) spans the air-tight **`AUTOMATED INDUSTRIES`** machine hall with six coronal turbine bays and a gorge cooling sluice.

## 2. How Original Plan + Cataclysm Deltas Govern the Modern Ruin (`d = 1`)

`SLICE.ruin(P)` and `SLICE.modernGuide(P, RU)` in `../8av0-slice-plan.js` compute reachability from `entry.gorge` (`+6 m`) and `entry.plateau` (`+560 m`):

- **Mid-Shaft Neck Blowout (`y = 226..264 m`)**: Severs `slice.core.shaft.neck` and both internal shaft stairs while the `5.6 m` monolithic outer concrete flange piers and rear cliff spine keep standing. Neither gorge raiders nor canyon floods can climb from the trench into the Eye.
- **West Brow Columnar Rockfall (`x < -262 m`) & Wild Cascades**: Shears off the outer-west cantilevered tip of the Eye (seating fallen honeycomb blocks and basalt column drums on the `+220 m` West Bench and `+8 m` Gorge Shore) and breaches an artesian spring in the Anthropological Cavern (`48 m` upper fall + `192 m` slot cascade into the Sunken Park).
- **Resulting Modern Zones**:
  1. **Kept Upper Eye & Skylight Sanctuary (`+266..+562 m`)**: Watered by the East Plateau Cistern, entered only via the guarded Hexagonal Skylight drums and Twin Diagonal Transport Portals; sustains ~`900` modern residents.
  2. **Sunken Canyon Park & Battered Dwellings Town (`0..+232 m`)**: Gorge-accessible oasis community farming the canyon park floor, inhabiting the 26-storey Battered Dwellings Wall, and working salvage in Automated Industries.
  3. **Isolated West Arcade & Flooded Anthropological Cavern**: Rope-access explorer zone.
