# `biomes/arcflow` — `BIOME-API.md`

Exports `window.ARCFLOW` (`BIO.kit('arcflow')`), `window.ARCFLOW_PHYS`, `window.ARCFLOW_SITES`, `window.ARCFLOW_CROPS` (`CROPS.BIOMES.arcflow`), and `window.ARCFLOW_FAUNA`.

## Kit Contract

- `ARCFLOW.ID`: `'arcflow'` (`rmwetn7jqgm9g`, endonym `'Kulaneva'`)
- `ARCFLOW.SPECIES`: 9 records (`nevabirch`, `klintspruce`, `mustaalder`, `klintlinden`, `cloudberryfen`, `carnelian_organpipe`, `erythra_veil`, `bladder_tether`, `agate_window`), each carrying `HV(wood, edible, medicinal, notes, fruit)` harvest tags
- `ARCFLOW.build(opt)` / `ARCFLOW.placeAll(opt)`: deterministic cell-seeded Crazy-Quilt placement on `KRAND.cell` + `KFRONTIER`
- `ARCFLOW.gatherOf(zones)`: `{pasture, fish, salt}` for `core/hamlet`
- `ARCFLOW_PHYS`: `ophioliteBeltAt`, `alkalineSeepAt`, `koskiHydraulicsAt`, `bogOreShoalAt`, `frontierQuiltAt`, `hazardSpec` (`[G data]`)
