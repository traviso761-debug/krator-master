# biomes/twins: BIOME-API

The kit's surface, engine-independent (everything through `BIO`, `core/biome`). A host binds it with `BIO.init({tags:'twins', ...,
fields})` and provides these fields (`BIO.host.fields`): `slope`, `hollow`, `face`, `talus`, `scree`, `obsidian`, `lichen`, `snow`, `rime`,
`warm` (0..1 in a warm breath: a tube's skylight or mouth, an oasis), `path` (the trodden route), `blocks` (optional: a boulder field's density), and the core's `wet`, `salt`, `upland`,
`cold`, `rock`.

| Call | What |
|---|---|
| `TWINS.build({R, quality, box, route, warm})` | the ground's loose stuff over `box` (scree blocks, obsidian blocks, stones), the guides' cairns along `route` ([[x,z],...], every ~110 m), the warm collars (fumarole-ferns, cinder-cushions) over the `warm` boxes ([[x0,z0,x1,z1],...]); returns the counts |
| `TWINS.groundAt(x, z, o)` | the ground's class weights `{scree, obsidian, snow, rime, path, moss, lichen}` (the basalt where none), for a host's painter |
| `TWINS.GROUND` | the ground classes: `{col, name}` each (sRGB) |
| `TWINS.SPECIES` | the kit's own species (station 1: fumarole-fern, cinder-cushion) |
| `TWINS.PAL` | the items' tints |
| `TWINS.tagsOf(label)` | the inspector's words for an item |
| `TWINS.TAGS` | `{climate:'cold..polar', aridity:'semiarid', koppen:['ET','EF']}` |

Items (`BIO.def`): `boulder`, `block` (a boulder field's), `stone` (titanium basalt), `obsidian` (glass blocks), `cairnstone` (class `landmark`: culture-made), `fern`
(the library's fern card), `cushion`. Every placement draws from `KRAND.hash(world, i, j, salt)` and the index within the cell.
