# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 61 | 492 | 268 | 60 | 52 | 17 | 95 | 5 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 60 | 730 | 151 | 40 | 10 | 38 | 492 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 32 | 602 | 125 | 7 | 89 | 42 | 340 | 11 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 75 | 1095 | 219 | 19 | 13 | 78 | 767 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 84 | 873 | 199 | 23 | 52 | 47 | 551 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 429 | 7 | 23 | 10 | 34 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 61 | 950 | 94 | 0 | 16 | 161 | 678 | 11 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 31 | 703 | 56 | 0 | 15 | 319 | 313 | 4 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 212 | 110 | 0 | 5 | 64 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 33 | 280 | 30 | 14 | 10 | 71 | 156 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 113 | 762 | 43 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 38 | 354 | 55 | 33 | 0 | 27 | 240 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 78 | 581 | 23 | 19 | 27 | 44 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 29 | 323 | 76 | 15 | 14 | 74 | 144 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 287 | 108 | 12 | 6 | 111 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 66 | 1802 | 412 | 0 | 106 | 107 | 1178 | 38 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 65 | 947 | 463 | 19 | 10 | 70 | 385 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 135 | 1919 | 307 | 52 | 104 | 104 | 1353 | 8 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 50 | 1049 | 114 | 13 | 16 | 153 | 754 | 13 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 215 | 2603 | 250 | 34 | 174 | 32 | 2113 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 40 | 1556 | 12 | 0 | 10 | 59 | 1475 | 3 |  |  | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 231 | 121 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 390 | 2 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 38 | 230 | 1 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 25 | 182 | 1 | 11 | 10 | 33 | 128 | 2 | atmos | yes | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 24 | 172 | 4 | 24 | 10 | 62 | 72 | 3 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 15 | 195 | 27 | 17 | 13 | 55 | 84 | 3 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 14 | 206 | 1 | 0 | 14 | 34 | 157 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 16 | 221 | 28 | 0 | 14 | 69 | 109 | 2 | biome | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 14 | 154 | 13 | 17 | 16 | 44 | 63 | 2 | biome | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 150 | 2 | 0 | 12 | 20 | 116 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 228 | 0 | 0 | 34 | 46 | 149 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 16 | 279 | 1 | 0 | 10 | 83 | 184 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 182 | 1 | 0 | 13 | 37 | 131 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 215 | 1 | 0 | 16 | 32 | 166 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 202 | 1 | 0 | 14 | 55 | 132 | 6 | biome | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 14 | 165 | 14 | 0 | 13 | 42 | 96 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 188 | 1 | 0 | 10 | 40 | 137 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 207 | 1 | 0 | 13 | 37 | 155 | 5 | biome | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 16 | 278 | 45 | 22 | 15 | 47 | 150 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 220 | 1 | 0 | 12 | 36 | 170 | 5 | biome | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 17 | 157 | 47 | 0 | 9 | 95 | 6 | 2 |  | yes | yes |
| **all** | 1753 | 23338 | 3531 (15%) | 497 (2%) | 1023 (4%) | 2795 (12%) | 15491 (66%) | 247 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 21 | 17 | 244 |
| `probe` | 19 | 16 | 75 |
| `sky` | 18 | 5 | 397 |
| `host-stage` | 16 | 16 | 322 |
| `host-sky` | 16 | 14 | 228 |
| `host-build` | 16 | 16 | 19 |
| `host-camera` | 16 | 16 | 149 |
| `host-probe` | 16 | 16 | 139 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 47 |
| `pathviz` | 6 | 5 | 40 |
| `host-polytool` | 6 | 1 | 37 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `start` | 5 | 3 | 1 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
