# The Great Double Delta: `BIOME-API` (`window.DOUBLEDELTA`)

Two objects form the public API of `biomes/doubledelta`:
- **`DDELTA_PHYS`** (`src/40-biome-ddelta-phys.js`, `[G data]`): pure engine-neutral hydro-elastic tsunami, estuarine mixing, trimline, and blue-clay amber/bitumen scour physics (zero `THREE`, zero `DOM`; verified in Node via `tests/test-doubledelta.js`).
- **`window.DOUBLEDELTA`** (aliased as `DDELTA`, `BIO.kit('doubledelta')`, `src/50`–`70`): the 22-species & biogenic-structure biome kit, gather contract, and deterministic `KRAND.cell` + `KSPACE` placement pass.

## `DDELTA_PHYS` (`src/40-biome-ddelta-phys.js`, `[G data]`)

| Call | Description |
|---|---|
| `DDELTA_PHYS.boreAt({x, z, elevM, oceanDistKm, wnwExposure01, tier})` | Tsunami bore hydraulics (`tier` `1 \| 2 \| 3`, default `2` for the `20–35 yr` Farside Shield Ghost Bore): `{crestM, depthM, velMs, shearPa, drawdownM, returnYrs, woodySurvival}` |
| `DDELTA_PHYS.trimlineAt({oceanDistKm, wnwExposure01})` | `{minWoodyElevM, safeTownElevM}` — elevation thresholds below which rigid woody trees and permanent buildings cannot survive |
| `DDELTA_PHYS.salinityAt({qLocalM3s, oceanDistKm, channelDistM, tide01, monsoon01})` | Estuarine mixing model (`0.2 -> 34.5 PSU` and `H4SiO4` `mg/L`): `{psu, silicaMgL, carbonateAlk, plankton01, silt01}` |
| `DDELTA_PHYS.elasticity({form, heightM, spongin01, spiculeSi01, tetherLenM, depthM, velMs})` | Vogel hydrodynamic reconfiguration & survival (`intact`) for `'woody-tree' \| 'sponge-bioherm' \| 'seapen-whip' \| 'tethered-mat' \| 'byssus-bivalve'` |
| `DDELTA_PHYS.scourExpose({elevM, backwashSlope, yearsSinceMega, coalByte, clayByte, oilByte, amberByte})` | Tsunami backwash incision exposing `{blueClay01, amberLag01, ligniteLedge01, bitumenSeep01, mireDanger01}` |
| `DDELTA_PHYS.ecotoneAt(c)` | Earthly–Kratorian ecotone zone & guild permissions (`{zone, woodyOk, spongeOk, seapenOk, byssusOk, archUltramaficOk, earthShare, kratorShare}`) |
| `DDELTA_PHYS.CROPS_BIOME` | `kits/crops` zone profile (`1.60 atm` `Am` delta braids/marshes + `Ria Sound` safe loess bluffs) |
| `DDELTA_PHYS.FAUNA` | Six vertebrate-grade hexapod, benthic ray, amphibious mudfish & wading-bird data records with 24h schedules |
| `DDELTA_SITES` (`src/41`) | Surveyed Scale Model `5.1` station records (`bioherm`/`braid`, `bitumen`/`scour`, `throat`, `bar`, `lip`) |

## `window.DOUBLEDELTA` (`src/50`, `src/60`, `src/70`)

| Call / Property | Description |
|---|---|
| `DOUBLEDELTA.SPECIES`, `DOUBLEDELTA.HARVEST`, `DOUBLEDELTA.PAL` | 22 species & biogenic records (17 wild `< +25 m` delta-bowl species/features + 5 safe `>= +38 m` `Ria Sound` bluff-forest woody species) with `HV` harvest and `gather` tags |
| `DOUBLEDELTA.build(opt)` | Builds the biome inside `BIO.kit('doubledelta')` (`opt`: `{R, quality, space, psu, silica, ecotone, minWoodyY, lag, peat, wrack, amber, bitumen, blueClay, mire, reserve}`) |
| `DOUBLEDELTA.buildDelta(R, q, opt)` | Deterministic cell-seeded (`KRAND.cell`) + `KSPACE` placement pass; populates `DOUBLEDELTA.LOG` and `DOUBLEDELTA.OSCULA` |
| `DOUBLEDELTA.canopyH(x, z)` | Canopy height (`14 m` in `Ria Sound` bluff woods above trimline; `3.5 m` across the sponge-and-reed bowl) |
| `DOUBLEDELTA.gatherOf(zones)` / `DOUBLEDELTA.gather(x, z)` | `core/hamlet`-compliant `{pasture, fish, salt}` field capacity tag |
| `DOUBLEDELTA.resourcesAt(x, z)` | Local `{amber, bitumen, blueClay, sponge, byssus}` prospectivity weights |
| `DOUBLEDELTA.plantOfItem(item)` | Looks up the `SPECIES` record owning a `BIO.def` item key (used by inspector) |
| `DOUBLEDELTA.surge.setMode('calm' \| 'drawdown' \| 'surge')` | Live preview of pre-bore channel drawdown and hydro-elastic sponge compression / sea-pen reconfiguration |
