# `biomes/ricochetpeaks` — `BIOME-API.md`

Exports `window.RICOCHET` (`BIO.kit('ricochetpeaks')`), `window.RICOCHET_PHYS`, `window.RICOCHET_SITES`, `window.RICOCHET_CROPS` (`CROPS.BIOMES.ricochetpeaks`), and `window.RICOCHET_FAUNA`.

## Kit Contract

- `RICOCHET.ID`: `'ricochetpeaks'` (Scale Model 5.1 polygon `'rmwvsvyf1iqzg'`, `'Ricochet Peaks'`)
- `RICOCHET.SPECIES`: `9` native species (`crater_spruce`, `shatter_larch`, `glass_pine`, `ejecta_birch`, `vent_willow`, `nickel_heather`, `shock_lichen`, `frost_hollow_sedge`, `steam_moss`), each carrying `HV(wood, edible, medicinal, notes, fruit)` harvest tags and `kin` lineage links (`nwouterwall`, `nhighlands`, `highrift`, `geyser`)
- `RICOCHET.make(spIdx, x, y, z, seed, sc, opt)` & `RICOCHET.grow(T, lv)`: `BIO.kitBuilder` / `BIO.kin` single-tree builder contract (`RICOCHET.kinCousins()` exposes `rimLarch` and `notchPine` `BIO.kin` cousins)
- `RICOCHET.build(opt)` / `RICOCHET.placeAll(opt)`: deterministic cell-seeded crater-boreal placement on `KRAND.cell` + `KSPACE` obeying the inverted bowl treeline (`frost_hollow` -> `thermal_taiga` -> `rim_krummholz`), hydrothermal `heatAt`, and meteoritic `nickel_heather` indicator stands
- `RICOCHET.gatherOf(zones)`: `{pasture, fish, salt}` for `core/hamlet`
- `RICOCHET_PHYS`: `CRATER_SWARM` (`12` bowls), `pressureAtElev`, `orographicCatchAt`, `craterBowlAt`, `heatAt`, `snowBareMask`, `bowlTreelineAt`, `shatterConeAt`, `notchVenturiAt`, `meteoricAnomalyAt`, `hazardSpec` (`[G data]`)
