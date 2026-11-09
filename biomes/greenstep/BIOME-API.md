# Krator biome kits: the contract (Greenstep edition)

The Greenstep kit (`GSTEP`) is built on the shared biome core as `biomes/riftrim` is (its host was the starting point: the station
lands, the kin rows, the stage). `biomes/sedesert/BIOME-API.md` is the full contract (the host object, `waterH`, fields, `register`,
`lod`, `windows`, `BIO.strata`). This file says what differs and what the kit exports.

## What the kit owns, and what it reads in place

Greenstep grows **no tree of its own** (`PLAN.md` section 3): every tree is a neighbour's species, grown by that kit's own builder.

| | Own (`50`, `60`) | Read in place (`station.json` `kin`, `LAND.kin`) |
|---|---|---|
| Floor | ground fern, spray-moss cushions, hanging moss, sedge and reed, bench grass, escargot begonia, paddy rice; basalt boulders and fallen columns | |
| Lower benches (Cfa) | | `swlowlands`: sprawl oak, cork oak, red bay (`baylaurel`), veil willow |
| The Citadel Step, the rilles | | `shighlands`: coilbark, spiral trumpet, volute tree, crozier tree fern |
| The cloud deck | | `shighlands`: spiral frill tree, screw palm (and coilbark, volute) |

The borrowed species are never copied: a station's `station.json` names the kits (`build.py` slots their species and trees in their
own registries) and its `LAND.kin` names the rows; `87-host-kin.js` grows each with `BIO.kin` and the source kit's own builder: near
the LOD spine (`LAND.kinHero`) the hero form within `LAND.kinLT` of the camera and the source's far form past it; elsewhere the far
form only. Every tree is a record in `GSTEP.TREES` (`{x, z, y0, H, rb, crownR, key, ref, lv}`).

## The fields it reads

| field | from the world | how the kit uses it |
|---|---|---|
| `cold` | 0 at +16 °C mean .. 1 at -14 °C (riftrim's scale) | the belts: lower (Terraces I-II), spiral (Terrace III), cloud (Terrace IV) |
| `wet` | rain, the water's shore | the banks, moss, ferns |
| `rock`, `slope` | bare rock, gradient | the risers' colonnades (nothing roots), the talus' boulders and columns |
| `flow` | the water's shore (core/water's fields, 89z) | the bank zone, sedge |
| `fog` | **this kit's**: the falls' spray and the cloud deck | moss, crozier ferns, the cloud forest, hanging moss |
| `farm` | **this kit's**: the Free Giants' paddies | rice |
| `site` | **this kit's**: a settlement's footprint (Tallwalls' promontory) | nothing roots there: the settlement build's ground |
| `talus` | the risers' feet | boulders and fallen columns |

`fog`, `farm` and `site` are 0 where a host does not bind them (`BIO.field`).

## The zones (`GSTEP.zones(x,z)`)

`{wet, flow, slope, rock, cold, barren, fog, farm, site, cliff, live, gentle, lower, spiral, cloud, bank, tree}`; `cliff` is steep
bedded rock, `live` is `(1 - barren)(1 - cliff)(1 - site)`. A host binds the fields; the zones follow.

## Exports

| | |
|---|---|
| `GSTEP.build({R, quality})` | the floor (`greenstep/floor`), after the host has grown the kin (89z) |
| `GSTEP.zones(x, z)` | the zones above |
| `GSTEP.PLANTS`, `GSTEP.plantOfItem(item)` | the floor's plants, each with its items and tags (climate, aridity, abyssal, riparian, Koppen, harvest) |
| `GSTEP.TREES`, `GSTEP.nearestTree(key, x, z)` | the kin trees the host grew |
| `GSTEP.KOPPEN`, `GSTEP.BARREN`, `GSTEP.TAGS` | the polygon's classes |
| `GSTEP.canopyH(x, z)` | the canopy's top near a point |

## Sites (published as data)

A station's `LAND.build` registers the settlements it stands beside: a `core/tags` record (`class` feature, `kind` site, its key, place
and radius) and, on the host's registry entry, a `site` payload (`{id, type, px, footprint: [[x, z]], level}`), read as data through
`window._api.sites()`. Station 3 publishes **Tallwalls** (`key: 'site.tallwalls'`, `id: 'stallwalls01'`). The settlement build reads it;
the kit draws nothing there, and the probe checks that nothing roots on it.
