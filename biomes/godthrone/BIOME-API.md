# godthrone: the kit's surface (BIOME-API.md)

The Godthrone kit (`PLAN.md`) on the biome core: `GODT`, registered as `BIO.kit('godthrone')`. Station 1 (the summit vent)
is `src/`; the later stations replace host fragments from `stations/<name>/` (`build.py --station <name>`).

| Call | What |
|---|---|
| `GODT.build({R, quality, box, vent:[x,z]})` | the ground's loose stuff over the box: talus blocks at every scarp's foot, spatter bombs and spatter round the vent, stones, Pele's hair in the hollows (`60-biome-godthrone-ground.js`). Placement by `KRAND.hash(world, cell, index, salt)`. Returns the counts and `ms` |
| `GODT.groundAt(x, z, out)` | the ground's class weights at a point: `orange`, `black` (the halo's beads), `spatter`, `glass` (the pit's frozen lake), `sublimate` (round the vent), `frost` (shaded faces), for a host's painter |
| `GODT.GROUND` | the ground classes: `{col (sRGB), name}` each |
| `GODT.PAL` | the items' tints (the basalt's blacks, rubble, oxidised tops, the bombs' glass, the hair's gold) |
| `GODT.tagsOf(label)` | the inspector's words for an item |
| `GODT.dress()` | nothing grows on a structure at the summit: null |
| `GODT.SPECIES` | `[]`: no life at the summit (PLAN.md section 5) |
| `GODT.TAGS` | `{climate: 'polar', aridity: 'arid', abyssal: false, riparian: 'no', koppen: ['O']}` |

**What the host gives** (`BIO.init`): `terrainH` (the KFIELD field), `field`, `placeH`, `seed`, and the fields
`halo`, `orange`, `talus`, `rampart`, `hollow`, `vent`, `frost`, `slope`, `face`, `glass` (each `(x, z) -> 0..1`, cached on a
20 m lattice by `45-host-stage.js`).

**Items** (all `class: 'feature'`): `boulder` (talus blocks), `stone`, `bomb`, `splat` (spatter), `hair` (Pele's hair, a
card from `card.pele.hair`'s middle cell).
