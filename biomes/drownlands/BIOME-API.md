# The Drownlands: `BIOME-API` (`window.DROWN`)

Two objects form the public API of `biomes/drownlands` (`rmwete7oza9d9` in Scale Model `5.1`):
- **`DROWN_PHYS`** (`src/40-biome-drown-phys.js`, `[G data]`): pure engine-neutral two-source megatsunami shoaling, Lost-City alkaline brucite-aragonite chimney precipitation, nickel-hyperaccumulating mangrove vs. `+48 m` refuge-crown partitioning, and subsided coal-measure snag-lagoon physics (zero `THREE`, zero `DOM`; verified in Node via `tests/test-drownlands.js`).
- **`window.DROWN`** (aliased as `DROWNLANDS`, `BIO.kit('drownlands')`, `src/50`–`70`): the 15-species ultramafic, marine-shoal, drowned-lagoon, and refuge-crown biome kit, `core/hamlet` gather contract, and deterministic `KRAND.cell` + `KSPACE` placement pass.

## `DROWN_PHYS` (`src/40-biome-drown-phys.js`, `[G data]`)

| Call / Property | Description |
|---|---|
| `DROWN_PHYS.tsunamiAt({px, py, elevM, depthM, seamountDistKm, trenchDistM, tier})` | Near-field `Steaming Seamounts` (`14–55 min`) + far-field `Farside Shield` Ghost Tsunami (`3.3–6.5 hr`) Green's Law shoaling, `+48.0 m` central trimline, and `arkEscapeOk` (`>= 80 m` trench) vs. `prouTorreReq` |
| `DROWN_PHYS.bruciteStackAt({ultramaficByte, faultDistM, waterDepthM, tidalRangeM, waveShearPa})` | Submarine-to-intertidal `pH 10.5–11.8` brucite-aragonite hydrothermal stack precipitation (`0.8–6.5 m` height, `turquoiseMilk01`) |
| `DROWN_PHYS.nickelMangroveAt({ultramaficByte, niByte, elevM, depthM, trimElevM, waveShearPa})` | Lithological & trimline gate (`propRootOk`, `coppiceShrubOk`, `refugeTreeOk` strictly `>= trimElevM`, `latexNiPct` `18.0–24.5%`) |
| `DROWN_PHYS.snagLagoonAt({sedimentary01, coalByte, elevM, subsidenceM, shelter01})` | Subsiding southeastern `coal = 214` drowned-valley snag density and `<= +1.80 m` visor-oyster collar ceiling |
| `DROWN_PHYS.shoalFloraAt({elevM, waveShearPa, sand01})` | Submarine `shoalkelp` (`elevM <= -0.5 m` down to `-28 m`), `ribbonseagrass`, `spongecoral`, and `tidefan` bathymetric envelope |
| `DROWN_PHYS.ecotoneAt(o)` | Six-zone bimodal classifier (`kelpchannel`, `bruciteflat`, `propwood`, `boulderbar`, `snaglagoon`, `refugeskerry`) |
| `DROWN_PHYS.tideState(mode)` | Live host tidal/tsunami states (`'Mean Tide' \| 'Low Water' \| 'Drawdown' \| 'Swell'`) |
| `DROWN_SITES` (`src/41`) | Four surveyed `5.1` stations: `shoal` `(145, 520)`, `bar` `(195, 420)`, `drowned` `(95, 545)`, `skerry` `(145, 495)` |
| `DROWN_FAUNA` (`src/40`) | Six amphibious hexapod, cetacean-commensal (`clickporpoise`), sirenian, seabird, and filter-whale `[G data]` records |

## `window.DROWN` (`src/50`, `src/60`, `src/70`)

| Call / Property | Description |
|---|---|
| `DROWN.SPECIES`, `DROWN.HARVEST`, `DROWN.PAL` | 15 species records (`verdigrismangrove`, `tealcoppice`, `brucitestack`, `spongecoral`, `tidefan`, `shoalkelp`, `ribbonseagrass`, `snaggrove`, plus `araucaria`, `pycnandra`, `gymnostoma`, `verdigris`, `limeshelf`, `seepcomb`, `stormwrack`) |
| `DROWN.build(opt)` | Builds the biome inside `BIO.kit('drownlands')` (`opt`: `{R, quality, space, site, trimElevM}`) |
| `DROWN.buildDrown(R, q, opt)` | Deterministic `KRAND.cell` + `KSPACE` placement pass; populates `DROWN.LOG` and `DROWN.VAPOUR` |
| `DROWN.canopyH(x, z)` | Canopy height (`15 m` on `>= +48 m` refuge skerry crown, `12 m` in snag lagoon, `8.5 m` in prop-wood, `1.8 m` on shoals) |
| `DROWN.gatherOf(zones)` / `DROWN.gather(x, z)` | `core/hamlet`-compliant `{pasture, fish, salt}` capacity tag |
| `DROWN.plantOfItem(item)` | Looks up the `SPECIES` record owning a `BIO.def` item key |
| `DROWN.tide.setMode(mode)` | Live preview of `'Mean Tide' \| 'Low Water' \| 'Drawdown' \| 'Swell'` |
