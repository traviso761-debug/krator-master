# Known Issues — `settlements/arcodiga/`

- Citizens are rendered via lightweight instanced multi-part cohorts driven by `SIM.pose` and `core/charactermodels/data/peoples.json` palettes (contrasting white-painted Eternal State officials against Hueru-Kuran whale-clans and cFlit-qBon divers) until `core/charactermodels` lands its low-VRAM settlement crowd batcher.
- Underwater salvage inside the `-95..-49 m` drowned Powerhouse turbine vaults is represented from the surface anchorage (`arkChainedWard` + `KTAGS` submerged organ records) rather than full free-swimming underwater interior traversal.
