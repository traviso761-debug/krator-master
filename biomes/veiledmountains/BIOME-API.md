# biomes/veiledmountains: BIOME-API

Registered in `BIO.kit('veiledmountains')` (`window.VEIL`).

## Public Exports

- **`VEIL_PHYS` (`src/15-veil-phys.js`, `[G data]`):**
  - `VEIL_PHYS.pressureAtElev(elevM)` -> barometric pressure in `atm` (`~1.21 atm` on `+2,380 m` U-valley floors, `< 0.65 atm` above `+7,450 m` crags).
  - `VEIL_PHYS.mistAt(x, z, site, opt)` -> `{totalMist01, poolMist01, cloudBelt01, sprayMist01, wetness01, sightlineM, whiteout}` (`totalMist01 >= 0.22` and `wetness01 >= 0.55` across all hours and modes).
  - `VEIL_PHYS.zoneAt(elevAslM, slotConfinement01, chute01)` -> continuous weights across `mistfloor` (`Z1`), `gorge` (`Z2`), `cloudbelt` (`Z3`), `alderchute` (`Z4`), and `highcol` (`Z5`).
  - `VEIL_PHYS.nurseColonnadeAt(x, z, site)` -> straight fallen-giant nurse-log colonnade proximity & stilt-root lift.
  - `VEIL_PHYS.epiphyteLoadAt(elevAslM, mist01, canopyFrac01)` -> bryophyte branch bolster multiplier, `clubdrape` curtain length, `crimsonchalice`, `tankstrap`, and `veilcomb` tiering.
  - `VEIL_PHYS.hazardSpec(key)` -> validated `KHAZ.make` specs (`whiteout`, `chasm`, `torrent`, `avalanche`, `hypoxia`).
- **`VEIL_SITES` (`src/15-veil-phys.js`, `[G data]`):** Site records for `hall`, `gorge`, `kanopi`, `veilpass`, and `southvale`.
- **`VEIL_CROPS` (`src/22-veil-crops.js`, `[G data]`):** Registers `CROPS.BIOMES.veiledmountains` (`5` zones; `CROPS.canPlaid('veiledmountains') === true`).
- **`VEIL_FAUNA` (`src/24-veil-fauna.js`, `[G data]`):** `6` species (`veil_elk`, `kamuy_bear`, `crimson_salamander`, `mist_slug`, `oculus_swallow`, `veil_salmon`) with 24-hour schedules.
- **`VEIL` (`src/50-veil-species.js`..`src/70-veil.js`):**
  - `VEIL.SPECIES` / `VEIL.PLANTS` / `VEIL.byKey` / `VEIL.HARVEST` (`17` species records, every one carrying `HV(...)`).
  - `VEIL.build(opt)` / `VEIL.placeAll(opt)` / `VEIL.canopyH(x, z)` / `VEIL.gatherOf(Z)`.
