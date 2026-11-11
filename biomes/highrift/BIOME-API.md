# biomes/highrift: the kit's surface (the `BIOME-API.md` contract of every biome kit)

`HRIFT` (`src/50-biome-hrift-species.js`, `60`, `70`), in its own registry (`BIO.kit('highrift')`):

| | |
|---|---|
| `HRIFT.SITES` | the five stations' site records (`src/40-biome-hrift-sites.js`, `[G data]`): 5.1 px, world metres, heights, the climate, the water's levels, the vents |
| `HRIFT.SOUND` | each station's sound sources as records for `core/audio` (not in core yet; `PLAN.md` section 8). The page exports them (`exporters.sound`) |
| `HRIFT.SPECIES` | `opalcane`, `beadcap`, `verdwort`, `steamheath`, `tussock` (keys and indices fixed from 2026-11-03), tagged by the project rule plus `heat` [degC band] |
| `HRIFT.buildRift(R, q, o)` | the rift's own life on a station's ground: `o.heat(x,z)` degC, `o.acid(x,z)` 0..1, `o.grass` 0..1, `o.keep(x,z)`; reads the fields `wet rock slope cold mist canyon` |
| `HRIFT.combs(list, q)` | the bladed quartz (the singing crystals) on wall points `{x, y, z, nx, nz, s}` |
| `HRIFT.build(opt)`, `HRIFT.plantOfItem(item)`, `HRIFT.canopyH` | as every kit |

Read in place (no copies): `HEARTH` (`biomes/hearths`, every page), `OIDONG.buildHigh` (`biomes/oidong`, every page; used on wedge, coulee, gjar),
`NHL`'s larch (`biomes/nhighlands`, the Mirror only) as `BIO.kin('nhighlands.larch')` keyed `riftlarch`.

A reader of this kit takes `src/40`, `50`, `60` (and `70` for `kitEnd`) and gives the host the field contract (`core/biome/README.md`) and a heat function.
