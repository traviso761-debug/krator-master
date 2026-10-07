# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 58 | 418 | 219 | 42 | 52 | 17 | 88 | 4 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 59 | 727 | 149 | 40 | 10 | 38 | 490 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 32 | 602 | 124 | 7 | 89 | 42 | 340 | 11 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 74 | 1091 | 216 | 19 | 13 | 78 | 765 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 83 | 869 | 198 | 23 | 52 | 47 | 549 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 426 | 7 | 20 | 10 | 34 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 61 | 947 | 94 | 0 | 16 | 161 | 676 | 11 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 31 | 700 | 56 | 0 | 15 | 319 | 310 | 4 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 212 | 110 | 0 | 5 | 64 | 34 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 112 | 760 | 42 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 37 | 352 | 53 | 33 | 0 | 27 | 239 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 78 | 581 | 20 | 27 | 27 | 44 | 464 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 28 | 320 | 75 | 15 | 14 | 74 | 142 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 287 | 108 | 12 | 6 | 111 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 66 | 1798 | 411 | 0 | 106 | 107 | 1175 | 38 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 64 | 899 | 437 | 19 | 10 | 56 | 377 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 135 | 1917 | 307 | 52 | 104 | 104 | 1351 | 8 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 50 | 1049 | 114 | 13 | 16 | 153 | 754 | 13 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 210 | 2583 | 246 | 34 | 174 | 27 | 2102 | 11 |  | yes | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 24 | 172 | 27 | 6 | 10 | 33 | 96 | 2 | atmos | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 39 | 1702 | 11 | 0 | 10 | 55 | 1626 | 3 |  |  | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 25 | 167 | 30 | 6 | 10 | 33 | 88 | 2 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 230 | 121 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 26 | 389 | 1 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 37 | 230 | 0 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 26 | 192 | 6 | 6 | 10 | 33 | 137 | 2 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 15 | 187 | 27 | 16 | 13 | 53 | 78 | 3 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 14 | 199 | 1 | 0 | 14 | 31 | 153 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 16 | 220 | 28 | 0 | 14 | 69 | 109 | 2 | biome | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 138 | 2 | 0 | 12 | 16 | 108 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 223 | 0 | 0 | 34 | 44 | 145 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 16 | 271 | 1 | 0 | 10 | 81 | 179 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 175 | 1 | 0 | 13 | 34 | 127 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 205 | 1 | 0 | 16 | 29 | 159 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 193 | 1 | 0 | 14 | 52 | 126 | 6 | biome | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 13 | 155 | 14 | 0 | 13 | 40 | 88 | 2 | biome | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 181 | 1 | 0 | 10 | 37 | 133 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 196 | 1 | 0 | 13 | 34 | 148 | 5 | biome | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 207 | 1 | 0 | 12 | 33 | 160 | 5 | biome | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 17 | 157 | 47 | 0 | 9 | 95 | 6 | 2 |  | yes | yes |
| **all** | 1686 | 22553 | 3307 (15%) | 415 (2%) | 993 (4%) | 2566 (11%) | 15272 (68%) | 238 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 21 | 15 | 241 |
| `probe` | 19 | 14 | 56 |
| `sky` | 18 | 5 | 397 |
| `host-stage` | 14 | 14 | 294 |
| `host-sky` | 14 | 12 | 202 |
| `host-build` | 14 | 14 | 17 |
| `host-camera` | 14 | 14 | 125 |
| `host-probe` | 14 | 14 | 95 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 42 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `start` | 5 | 3 | 1 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `host-polytool` | 4 | 1 | 25 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
