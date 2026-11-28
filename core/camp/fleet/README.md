# core/camp/fleet: sea-nomad `fleet` bands, Deep-Ward roadstead & macrotidal careening (opt-in)

`58-camp-fleet.js` extends `KCAMP` with the sea-nomad `fleet` band kind for the `cFlīt-qBōn` (Fleet-born) and Hueru-Kuran whaler
fleets sailing between **Deep-Ward Anchorage** (`px [148, 492]`, ~530 km SSW at `199°`, `1.9 m` diurnal `D1` tide) and
**Arcoforte / Fleetborn Cove** (`px [236, 242]`, `11 m` mean / `14.3 m` spring macrotidal drydock and Great Careening moot).

**Why a subfolder.** `core/camp` fragments at the top level are globbed by `kits/tents` and `test-camp.js`, so placing
`58-camp-fleet.js` in `core/camp/fleet/` changes 0 bytes on unrelated pages. List it after `core/camp/10-camp-cultures.js`:

```js
'core/camp/10-camp-cultures.js', 'core/camp/fleet/58-camp-fleet.js'
```

## Exports

- **`KCAMP.CULTURES.fleetborn` & `KCAMP.CULTURES['fleetborn-whaler']`:** sea-nomad culture rows mapping `kits/ringsea` hulls
  (`89g`/`ark_ward` `5.4 m`, `89c`/`ark_catamaran` `5.2 m`, `89d`/`smelt_barge` `4.8 m`, `89e`/`vent_tender` `2.0 m`,
  `89f`/`scout_trimaran` `1.5 m`, `89h`/`hk_whaler` `1.9 m`) with `crewCap`, `cargoCap`, exact `L/B/H` boxes, and
  `deepCareen: draft_m > 2.2`.
- **`KCAMP.PORTS`:** canonical scale-model port table (`arcoforte`, `deep_ward`, `farport`, `copper_tarn_landing`,
  `arch_trench`, `ria_sound`), plus `KCAMP.portDistanceKm` and `KCAMP.portBearingDeg`.
- **`KCAMP.DEFAULT_FLEETS`:** the 5 nomad fleets (`ward_ring`, `smelt_fleet`, `trench_fleet`, `outer_whalers`, `island_traders`)
  totalling `2,060` visiting Fleet-born/whaler citizens (`2,480` with Arcoforte's `420` resident caretakers).
- **`KCAMP.fleetMooring(spec)`:** deterministic non-overlapping harbour mooring ring / horseshoe (`89g` Ark-Wards in inner calm
  water, `89c`/`89d` mid-basin, tenders & trimarans outerward).
- **`KCAMP.fleetWorld(opts)`, `fleetTick(W, day)`, `fleetRun(W, d0, d1)`, `fleetsAt(W, portId, day)`:** world-level tidal
  simulator enforcing Deep-Ward's non-careening `1.9 m` diurnal tide (Law 1), spring-only `deepCradleOpen` careening for
  `draft_m > 2.2` in `W.careenLog` with neap-stretched stays (Law 2), and 5-fleet convergence at the Double Dark & Double Full
  Great Careening moots (Law 3).

**Test:** `node core/camp/test-camp-fleet.js`. Plain data, `[G data]`: no three.js, no DOM.
