# biomes/galvanic: the API (the Rift battery)

The kit on the biome core's contract (`core/biome/README.md`), registered as `BIO.kit('galvanic')`, its object `GALV`. A host reads its fragments in
place (the pooled-folder rule: name them in its `build.py`): `src/40-galvanic-cell.js` (`[G data]`), `src/50-galvanic-species.js`,
`src/60-galvanic-place.js`, `src/70-galvanic.js`. Its own page is station 1 (`dist/galvanic.html`, `PLAN.md` section 12).

## The physics (`GALV_PHYS`, also `GALV.PHYS`; `[G data]`, `tests/test-galvanic.js`)

| Call | Returns |
|---|---|
| `rest(mineral, pH, o2)` | a sulfide's rest potential, V (pyrite, chalcopyrite, galena, sphalerite; the table is at pH 2, 0.21 atm O2) |
| `cell({cathode, anode, pH, o2, T, wet, insul, pump})` | `{ocv, v, i, p, lost, alive}`: open circuit (V), the line (V, half the open circuit), current (mA/m2), power to the life (mW/m2), power lost to the rock's short circuit (the unsheathed share), alive when p is 2 mW/m2 or more |
| `yield(i, p, {eff, kJg, solid})` | a year of it: `{kJ, biomass (g/m2), eMol, feooh (g), crustMm, metreYears, zns (g), zinc (g), anodeMm}` |
| `acid({ore, flow, o2, T})` | pyrite's run-off: `{rate, H, pH, vsRioTinto}` (ore: m2 of exposed grain surface; flow: L/s) |
| `stream({pH0, Q0, q, s})`, `streamAtPH(stream, pH)` | down a stream at s m: `{pH, Q, terrace (0..1: the ochre's band, pH 2.8-4), colour (hex), acid}`; where it crosses a pH |
| `level(day, {amp, low})`, `season(day)` | the terminal sea against its mean (m): lowest day 70, highest ~252, a 1.2 m swing (default taken); `{level, wet, o2At(y)}` |
| `floodDays(y)`, `store(y, {cap, fill, day})` | the days a year a height lies under the sea; the store jar there: `{alive, charge, floodDays, min}` |

| `tide(t)`, `tidePhase(t)`, `pumpAt(u)`, `pumpHour(day)`, `TIDE` | the daily tidal pump (the owner, 2026-11-12), 0..1: t a clock in world days or `ATMOS.libration(t)`'s record (the same phase the Gills' breath reads); peak at the top of the giant's nod, mean 3/8; `cell({pump})` swells the current by 0.6 x it; `pumpHour(day)` the hour of the peak |

`GALV_SITES.strand` is the station's record (JSON: the survey's numbers, the strand, the Deep, the mounds, the streams).

## The species (`GALV.SPECIES`, `GALV.byKey`, `GALV.plantOfItem(item)`)

`crust` (wire crust: `gvcrust`), `runner` (sulfur runner: `gvrunner`), `mast` (brass mast: `gvmast`, `gvfrill`), `reef` (cell reef: `gvreef`), `jar`
(store jar: `gvjar`). Tags: the project's (climate, aridity, abyssal, riparian, Koppen) plus `native`, `alien`, `energy: 'galvanic'`, `partner`, `acid`
(the pH band), `harvest`.

## Placing it

```
GALV.build({R, quality, ph(x,z), flood(x,z), store(x,z), streams, mounds, deep, keep(x,z)})   // -> counts; GALV.PLACED: [kind, x, y, z, live, why]
```

- `ph` the pH of the ground's water (the life keeps under 4.6, where the minerals still carry current); `flood` the days a year under the sea (living
  skins only where it is 60 or fewer: the store's capacity); `store(x, z)` the jar's state on the page's day (`GALV_PHYS.store`).
- `streams` `[{F: {at(x,z) -> {d, s, a}, point(s), L, seg}, w, T: [{s0, s1, y, w}], tread(s), bed0(s), name}]`: masts stand in the water, reefs on
  the treads; `mounds` `[{x, z, r, h}]`: runners radiate from their feet, reefs ring their moats; `deep` `{x, z, r}`: reefs round its rim.
- Every cell is `KRAND.cell(seed, ix, iz)` or `KRAND.hash(seed, i, k, salt)`; reefs keep clear of each other through `KSPACE`.
- The host draws the ground, the water and the acid (`GALV.LOOKS.acid`, `GALV.LOOKS.ochre`: `core/water` looks as data, set by the page's
  `89w-host-water.js`).
