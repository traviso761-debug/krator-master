# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 80 | 752 | 436 | 77 | 52 | 61 | 126 | 5 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 60 | 730 | 151 | 40 | 10 | 38 | 492 | 9 |  | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 16 | 223 | 72 | 0 | 0 | 145 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 36 | 603 | 126 | 7 | 89 | 42 | 340 | 15 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 75 | 1095 | 219 | 19 | 13 | 78 | 767 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 84 | 882 | 199 | 23 | 52 | 47 | 561 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 429 | 7 | 23 | 10 | 34 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 64 | 950 | 94 | 0 | 16 | 161 | 678 | 11 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 35 | 705 | 56 | 0 | 15 | 321 | 313 | 4 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 212 | 110 | 0 | 5 | 64 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 33 | 280 | 30 | 13 | 10 | 71 | 156 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 114 | 764 | 43 | 4 | 0 | 33 | 683 | 4 | atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 39 | 358 | 55 | 33 | 0 | 27 | 243 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 78 | 581 | 23 | 19 | 27 | 44 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 29 | 323 | 76 | 15 | 14 | 74 | 144 | 3 |  | yes | yes |
| [`settlements/streetlab`](settlements/streetlab/PORT.md) | 28 | 602 | 383 | 0 | 0 | 187 | 32 | 0 |  |  | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 287 | 108 | 12 | 6 | 111 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 66 | 1803 | 412 | 0 | 106 | 107 | 1178 | 38 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 65 | 947 | 463 | 19 | 10 | 70 | 385 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 141 | 2009 | 334 | 57 | 105 | 116 | 1397 | 8 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 60 | 1049 | 114 | 13 | 16 | 153 | 754 | 13 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 222 | 2603 | 250 | 34 | 174 | 32 | 2113 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 24 | 173 | 27 | 6 | 10 | 33 | 96 | 2 | atmos | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 42 | 1865 | 42 | 0 | 10 | 59 | 1755 | 3 |  |  | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 25 | 167 | 30 | 6 | 10 | 33 | 88 | 2 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 234 | 121 | 0 | 10 | 66 | 37 | 1 |  |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 33 | 345 | 19 | 6 | 10 | 33 | 277 | 3 | atmos | yes | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 390 | 2 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 280 | 1 | 6 | 0 | 48 | 225 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 26 | 192 | 6 | 6 | 10 | 33 | 137 | 2 | atmos | yes | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 30 | 270 | 5 | 33 | 10 | 75 | 148 | 3 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 13 | 184 | 27 | 17 | 13 | 43 | 84 | 3 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 13 | 199 | 1 | 0 | 14 | 28 | 156 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 14 | 209 | 28 | 0 | 14 | 58 | 109 | 2 | biome | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 12 | 142 | 13 | 17 | 16 | 32 | 63 | 2 | biome | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 17 | 166 | 38 | 35 | 14 | 35 | 44 | 2 | biome, atmos | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 14 | 145 | 2 | 0 | 12 | 14 | 117 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 14 | 216 | 0 | 0 | 34 | 35 | 148 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 15 | 274 | 1 | 0 | 10 | 65 | 198 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 12 | 176 | 1 | 0 | 13 | 31 | 131 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 12 | 208 | 1 | 0 | 16 | 27 | 164 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 14 | 199 | 1 | 0 | 14 | 52 | 132 | 6 | biome | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 12 | 152 | 14 | 0 | 13 | 31 | 95 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 14 | 189 | 1 | 0 | 10 | 34 | 143 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 12 | 201 | 1 | 0 | 13 | 32 | 155 | 5 | biome | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 16 | 278 | 45 | 22 | 15 | 47 | 150 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 14 | 213 | 1 | 0 | 12 | 31 | 169 | 5 | biome | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 17 | 157 | 47 | 0 | 9 | 95 | 6 | 2 |  | yes | yes |
| **all** | 1949 | 25743 | 4333 (17%) | 573 (2%) | 1068 (4%) | 3214 (12%) | 16554 (64%) | 262 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 24 | 17 | 285 |
| `probe` | 22 | 16 | 86 |
| `sky` | 21 | 5 | 426 |
| `host-stage` | 17 | 17 | 341 |
| `host-sky` | 17 | 15 | 242 |
| `host-build` | 17 | 17 | 20 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 47 |
| `start` | 7 | 5 | 5 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `host-camera` | 3 | 3 | 31 |
| `host-probe` | 3 | 3 | 41 |
| `host-polytool` | 2 | 2 | 12 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
