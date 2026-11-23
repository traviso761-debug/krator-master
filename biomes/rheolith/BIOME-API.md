# biomes/rheolith: the API (the Rheoliths)

The kit on the biome core's contract (`core/biome/README.md`), registered as `BIO.kit('rheolith')`, its object `RHEO`. A host reads its fragments in place (the pooled-folder rule: name them in its `build.py`): `src/40-rheolith-phys.js` (`[G data]`), `src/50-rheolith-species.js`, `src/60-rheolith-place.js`, `src/70-rheolith.js` (`[G data]`). Its showcase page is station 1 (`dist/rheolith.html`, *The Breached Throat*, `PLAN.md` §7.2).

## The physics (`RHEO_PHYS`, also `RHEO.PHYS`; `[G data]`, `tests/test-rheolith.js`)

| Call | Returns |
|---|---|
| `windowAt({tempC, waterActivity, acidPh})` | `{viable, state, k, tempC, waterActivity, acidPh}`: `state` in `'active'` (`180-550 °C`, `aw < 0.15`, `pH <= 3.8`), `'vitrified'`, `'hydrolysed'` (`< 140 °C` and `aw >= 0.25`), `'scorched'` (`550-600 °C`), or `'calcined'` (`> 600 °C`) |
| `choke(ventRec, tHours, doses)` | `{aperture, pressure, periodScale, heightScale, state, blast, frost, tell}`: conduit throttling under `gagCake`, rapid fluoride depolymerisation and phreatic surge under `fluxSalt`, pore-locking under `heavyDross`, or spontaneous blowout when `pressure >= 1` |
| `buoyancy(crustAgeDays, reefCover, doses)` | `{effCover, thicknessM, loadKg, ringPitchHz, state}`: safe load and shod-staff pitch (`~160 Hz` buoyant vs. `~65 Hz` foundering) of a cooling pahoehoe sill roof buoyed by `foamreef` vesicles |
| `seal(crackRec, tHours, doses)` | `{sealed01, gasLeakK, brittle, state}`: thermoelectric `wirevein` + `scarplug` bore/fracture sealing |
| `byproductAt({distM, tempC, windDot, recentFlux, slope, crust})` | `0..1` suitability weights for all eight surface byproducts (`throatcollar`, `throatskin`, `etchhalo`, `bismuthnest`, `scarplug`, `bellblister`, `combplate`, `staregg`) |
| `ranjViability({throatTempC, throatDistM, zeoliteMulch, rainMm})` | `{fruiting, vapour01, why}`: whether fugitive volatile siloxane and selenium vapours sustain Ranj fruiting (explaining Throne rifts, Voth ring-fault pockets, Hykkousoi geyser/mulch plantations, and Zey'danin monsoon washout; `PLAN.md` §6.3a) |

`RHEO_SITES.throat` holds the survey record for Station 1 (*The Breached Throat*). `RHEO_PHYS.REAGENTS` (`gagCake`, `fluxSalt`, `heavyDross`, `vitriolBath`) documents the four geological manipulation reagents.

## Subsurface guilds (`RHEO.SPECIES`) & surface byproducts (`RHEO.BYPRODUCTS`)

- **Subsurface guilds (`live === 1`, strictly inside `windowAt.viable`):** `chokecoral` (`rh_chokecoral`), `wirevein` (`rh_wirevein`), `foamreef` (`rh_foamreef`), `fluxcreeper` (`rh_fluxcreeper`).
- **Surface byproducts (`live === 0`, vitrified/quenched/dormant):** `staregg` (`rh_staregg_shell`, `rh_staregg_core`), `throatcollar` (`rh_collar`), `bismuthnest` (`rh_bismuthwire`), `scarplug` (`rh_scarplug`), `bellblister` (`rh_blister`), `combplate` (`rh_combplate`), `throatskin` (`rh_throatskin` + `rh_throatskin_flutter`), `etchhalo` (`rh_etchfrost`, `rh_selrime`).
- Lookup: `RHEO.byKey[key]`, `RHEO.speciesOfItem(item)` / `RHEO.plantOfItem(item)`. Nothing bioluminesces (`emissive` is `0x000000` on every `RHEO.M` material).

## Placing it

```js
RHEO.build({R, quality, temp3(x,y,z), aw(x,y,z), ph(x,z), pit, pitY, vents, bench, wind})
// -> counts per guild and byproduct; populates RHEO.PLACED: [kind, x, y, z, live, tempC, aw, pH]
```

`pitY` (default 0): the ground's height at the throat's rim. The throat's wall guilds are laid 5 to 19 m under it, so a host that cut the
breach into its own ground passes its rim's height (`biomes/throne/shared/44r-host-breach.js` cuts this page's profile into a station's ground).
