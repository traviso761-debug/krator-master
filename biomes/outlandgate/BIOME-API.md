# biomes/outlandgate: the kit's surface

The Outland Gate kit (`OGATE`) on the biome core, the Outlands' contract (`biomes/outlands/BIOME-API.md`) without the colony pass: the gap's
floor is the crater side's, and its trees are its neighbours', read in place.

## The pages

| Page | Build | What |
|---|---|---|
| `dist/outlandgate.html` | `python3 tools/build.py biomes/outlandgate` | station 1, **the Narrows and the Gate**: the gap's floor at 1.4 km, Hau-Gel braided, the Tierhounds' long wall, toll fort, water gate and shrine; the walls past the map on the scale model's heights |

`verify.py dist/outlandgate.html --assert` checks it (the station's checks are `src/98-host-views.js`'s). Station 5, the Nursery Bench, is
the Outlands kit's page (`biomes/outlands --station nursery`).

## The kit: `OGATE`

| Name | What |
|---|---|
| `OGATE.SPECIES`, `byKey` | the kit's own species: the Gate reed (rods on BIO.fung's stalk) |
| `OGATE.KIN` | the neighbours' rows this page grows (`from`, `key`, `name`, `scale`, `where`, `tags`): ebadlands' cottonwood (twice: the gallery and the bars' pioneers), oak and maple |
| `OGATE.build({R, quality})` | the kin's woods on KRAND lattices by their ground and the reed beds; returns `{trees, reeds, kin}` |
| `OGATE.TREES` | after the build: every tree's `{key, x, z, y, H, crownR}` |

## What the host gives the kit

Fields through `BIO.field`: the biome core's names plus `bank` (cached) and `bankX` (exact: a channel's lip is narrower than the cache's
18 m cell), `bar` (the gravel bars), `floor` (the flat floor), `swale` (the old flood channels), `road`, `works` (the Gate's footprints:
nothing grows there). The host's mask keeps every root out of the water and the works.

## The neighbours read in place (`build.py`, `KIN`)

`{"<kit>": [[its fragments], "<its API>", [its pack families]]}`: each kit's species and tree builders slot after the host stage (45) and
before this kit (50), in their own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with. A
station adds its own with `"kin"` in its `station.json`.
