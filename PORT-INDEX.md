# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 59 | 424 | 219 | 46 | 52 | 17 | 89 | 4 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 60 | 730 | 150 | 40 | 10 | 38 | 492 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 32 | 602 | 124 | 7 | 89 | 42 | 340 | 11 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 75 | 1094 | 217 | 19 | 13 | 78 | 767 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 84 | 873 | 199 | 23 | 52 | 47 | 551 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 429 | 7 | 23 | 10 | 34 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 61 | 950 | 94 | 0 | 16 | 161 | 678 | 11 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 31 | 703 | 56 | 0 | 15 | 319 | 313 | 4 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 212 | 110 | 0 | 5 | 64 | 34 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 113 | 761 | 43 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 38 | 354 | 55 | 33 | 0 | 27 | 239 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 77 | 570 | 20 | 19 | 27 | 44 | 460 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 29 | 323 | 76 | 15 | 14 | 74 | 144 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 287 | 108 | 12 | 6 | 111 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 66 | 1801 | 411 | 0 | 106 | 107 | 1177 | 38 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 65 | 902 | 438 | 19 | 10 | 56 | 379 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 135 | 1919 | 307 | 52 | 104 | 104 | 1353 | 8 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 50 | 1049 | 114 | 13 | 16 | 153 | 754 | 13 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 211 | 2584 | 247 | 34 | 174 | 27 | 2102 | 11 |  | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 38 | 1450 | 11 | 0 | 10 | 55 | 1375 | 3 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 230 | 121 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 390 | 2 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 38 | 230 | 1 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 25 | 180 | 1 | 11 | 10 | 33 | 126 | 2 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 14 | 166 | 24 | 14 | 13 | 37 | 78 | 2 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 14 | 199 | 1 | 0 | 14 | 31 | 153 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 16 | 220 | 28 | 0 | 14 | 69 | 109 | 2 | biome | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 140 | 2 | 0 | 12 | 16 | 110 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 223 | 0 | 0 | 34 | 44 | 146 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 16 | 271 | 1 | 0 | 10 | 81 | 179 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 175 | 1 | 0 | 13 | 34 | 127 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 205 | 1 | 0 | 16 | 29 | 160 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 193 | 1 | 0 | 14 | 52 | 127 | 6 | biome | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 181 | 1 | 0 | 10 | 37 | 133 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 197 | 1 | 0 | 13 | 34 | 149 | 5 | biome | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 207 | 1 | 0 | 12 | 33 | 161 | 5 | biome | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 17 | 157 | 47 | 0 | 9 | 95 | 6 | 2 |  | yes | yes |
| **all** | 1624 | 21777 | 3241 (15%) | 403 (2%) | 951 (4%) | 2421 (11%) | 14760 (68%) | 231 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 19 | 15 | 216 |
| `probe` | 17 | 14 | 52 |
| `sky` | 15 | 5 | 369 |
| `host-stage` | 13 | 13 | 281 |
| `host-sky` | 13 | 11 | 189 |
| `host-build` | 13 | 13 | 16 |
| `host-camera` | 13 | 13 | 115 |
| `host-probe` | 13 | 13 | 85 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 42 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `start` | 5 | 3 | 1 |
| `hover` | 4 | 4 | 14 |
| `polygon` | 3 | 3 | 14 |
| `host-polytool` | 3 | 1 | 19 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
