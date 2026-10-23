# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 112 | 1168 | 724 | 111 | 52 | 148 | 135 | 6 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 62 | 725 | 154 | 40 | 10 | 30 | 492 | 9 |  | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 151 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 38 | 615 | 135 | 7 | 84 | 46 | 343 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 68 | 935 | 196 | 6 | 13 | 71 | 649 | 5 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 10 | 126 | 88 | 0 | 0 | 38 | 0 | 1 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 95 | 1102 | 345 | 24 | 52 | 79 | 601 | 7 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 36 | 423 | 9 | 23 | 10 | 26 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 65 | 965 | 94 | 5 | 16 | 165 | 685 | 9 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 35 | 715 | 56 | 0 | 15 | 325 | 319 | 2 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 210 | 110 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 34 | 274 | 30 | 13 | 10 | 66 | 156 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 114 | 767 | 43 | 4 | 0 | 35 | 685 | 4 | atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 42 | 353 | 58 | 33 | 0 | 19 | 244 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 79 | 574 | 26 | 19 | 27 | 34 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 30 | 318 | 80 | 15 | 14 | 65 | 144 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 280 | 108 | 12 | 6 | 105 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2981 | 1190 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 68 | 944 | 465 | 19 | 10 | 62 | 387 | 6 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 144 | 2025 | 355 | 57 | 105 | 110 | 1397 | 8 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 61 | 1067 | 123 | 13 | 16 | 157 | 758 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 222 | 2603 | 250 | 34 | 174 | 32 | 2113 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 24 | 164 | 27 | 6 | 10 | 24 | 96 | 2 | atmos | yes | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 5 | 32 | 0 | 0 | 0 | 10 | 22 | 1 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 43 | 1961 | 42 | 0 | 10 | 59 | 1850 | 3 |  |  | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 45 | 38 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 25 | 159 | 30 | 6 | 10 | 24 | 88 | 2 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 24 | 246 | 122 | 0 | 10 | 77 | 37 | 1 |  |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 39 | 414 | 27 | 6 | 10 | 24 | 346 | 3 | atmos | yes | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 28 | 204 | 10 | 6 | 10 | 24 | 154 | 3 | atmos | yes | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 391 | 2 | 8 | 0 | 48 | 334 | 1 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 12 | 102 | 59 | 0 | 0 | 0 | 43 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 7 | 27 | 12 | 0 | 0 | 1 | 14 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 281 | 1 | 6 | 0 | 48 | 226 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 26 | 183 | 6 | 6 | 10 | 24 | 137 | 2 | atmos | yes | yes |
| [`kits/talia`](kits/talia/PORT.md) | 8 | 101 | 93 | 0 | 0 | 0 | 8 | 0 |  |  | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 31 | 257 | 5 | 33 | 10 | 62 | 148 | 3 | atmos | yes | yes |
| [`biomes/_b_nwlowlands`](biomes/_b_nwlowlands/PORT.md) | 13 | 177 | 2 | 0 | 13 | 31 | 131 | 5 | biome, atmos | yes | yes |
| [`biomes/_b_swlowlands`](biomes/_b_swlowlands/PORT.md) | 13 | 202 | 2 | 0 | 13 | 32 | 156 | 5 | biome, atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 14 | 185 | 28 | 17 | 13 | 43 | 84 | 3 | biome, atmos | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 15 | 202 | 2 | 0 | 14 | 25 | 161 | 5 | biome, atmos | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 16 | 209 | 29 | 0 | 14 | 55 | 111 | 2 | biome, atmos | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 13 | 145 | 14 | 17 | 16 | 33 | 63 | 2 | biome, atmos | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 17 | 161 | 38 | 29 | 14 | 35 | 44 | 2 | biome, atmos | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 16 | 151 | 3 | 0 | 12 | 15 | 122 | 6 | biome, atmos | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 244 | 1 | 0 | 34 | 38 | 172 | 6 | biome, atmos | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 16 | 275 | 2 | 0 | 10 | 65 | 199 | 7 | biome, atmos | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 14 | 179 | 2 | 0 | 13 | 29 | 135 | 5 | biome, atmos | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 12 | 180 | 2 | 0 | 11 | 13 | 154 | 2 | biome, atmos | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 14 | 210 | 2 | 0 | 16 | 24 | 168 | 5 | biome, atmos | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 19 | 190 | 64 | 14 | 14 | 39 | 59 | 2 | biome, atmos | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 206 | 1 | 0 | 14 | 55 | 136 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 12 | 152 | 14 | 0 | 13 | 31 | 95 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 16 | 192 | 2 | 0 | 10 | 31 | 149 | 6 | biome, atmos | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 14 | 204 | 2 | 0 | 13 | 29 | 160 | 5 | biome, atmos | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 15 | 302 | 54 | 22 | 15 | 37 | 175 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 214 | 2 | 0 | 12 | 31 | 169 | 5 | biome, atmos | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 23 | 196 | 70 | 0 | 9 | 117 | 0 | 1 |  | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 2 | 6 | 6 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 6 | 184 | 21 | 0 | 0 | 100 | 63 | 0 |  |  | yes |
| **all** | 2205 | 28678 | 5648 (20%) | 623 (2%) | 1124 (4%) | 3720 (13%) | 17563 (61%) | 273 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `sky` | 22 | 5 | 436 |
| `host-stage` | 21 | 21 | 391 |
| `host-sky` | 21 | 17 | 294 |
| `host-build` | 21 | 19 | 25 |
| `camera` | 19 | 15 | 134 |
| `probe` | 18 | 16 | 80 |
| `start` | 18 | 18 | 68 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 11 | 9 | 60 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `walk` | 2 | 2 | 26 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 4 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
