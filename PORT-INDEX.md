# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 111 | 1186 | 756 | 101 | 52 | 142 | 135 | 6 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 62 | 725 | 154 | 40 | 10 | 30 | 492 | 9 |  | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 151 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 36 | 614 | 127 | 7 | 89 | 46 | 345 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 68 | 935 | 196 | 6 | 13 | 70 | 649 | 5 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 10 | 126 | 88 | 0 | 0 | 38 | 0 | 1 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 95 | 1111 | 345 | 24 | 52 | 88 | 601 | 7 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 36 | 423 | 9 | 23 | 10 | 26 | 355 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 65 | 965 | 94 | 5 | 16 | 165 | 685 | 9 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 35 | 715 | 56 | 0 | 15 | 325 | 319 | 2 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 210 | 110 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 34 | 274 | 30 | 13 | 10 | 66 | 156 | 4 | atmos | yes | yes |
| [`settlements/longsong`](settlements/longsong/PORT.md) | 24 | 380 | 109 | 0 | 0 | 79 | 192 | 1 | biome, atmos | yes | yes |
| [`settlements/pinnacle-rock`](settlements/pinnacle-rock/PORT.md) | 9 | 46 | 18 | 0 | 0 | 13 | 16 | 1 | biome | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 114 | 765 | 43 | 4 | 0 | 33 | 685 | 4 | atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 42 | 353 | 58 | 33 | 0 | 19 | 244 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 79 | 574 | 26 | 19 | 27 | 34 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 30 | 318 | 80 | 15 | 14 | 65 | 144 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 280 | 108 | 12 | 6 | 105 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2981 | 1190 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 68 | 943 | 465 | 19 | 10 | 62 | 387 | 6 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 144 | 2025 | 355 | 57 | 105 | 110 | 1397 | 8 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 61 | 1066 | 123 | 13 | 16 | 157 | 758 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 222 | 2603 | 250 | 34 | 174 | 32 | 2113 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 24 | 164 | 27 | 6 | 10 | 24 | 96 | 2 | atmos | yes | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 18 | 442 | 15 | 0 | 0 | 11 | 417 | 3 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 44 | 1974 | 42 | 0 | 10 | 59 | 1862 | 3 |  |  | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 47 | 41 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 25 | 159 | 30 | 6 | 10 | 24 | 88 | 2 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 234 | 121 | 0 | 10 | 66 | 37 | 1 |  |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 38 | 410 | 27 | 6 | 10 | 24 | 343 | 3 | atmos | yes | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 27 | 202 | 10 | 6 | 10 | 24 | 152 | 3 | atmos | yes | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 390 | 2 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 12 | 102 | 59 | 0 | 0 | 0 | 43 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 7 | 27 | 12 | 0 | 0 | 1 | 14 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 281 | 1 | 6 | 0 | 48 | 226 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 26 | 183 | 6 | 6 | 10 | 24 | 137 | 2 | atmos | yes | yes |
| [`kits/talia`](kits/talia/PORT.md) | 12 | 206 | 196 | 0 | 0 | 0 | 10 | 0 |  |  | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 31 | 258 | 5 | 33 | 10 | 63 | 148 | 3 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 13 | 184 | 27 | 17 | 13 | 43 | 84 | 3 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 13 | 199 | 1 | 0 | 14 | 28 | 156 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 14 | 209 | 28 | 0 | 14 | 58 | 109 | 2 | biome | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 12 | 142 | 13 | 17 | 16 | 32 | 63 | 2 | biome | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 17 | 166 | 38 | 35 | 14 | 35 | 44 | 2 | biome, atmos | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 14 | 149 | 2 | 0 | 12 | 15 | 120 | 6 | biome | yes | yes |
| [`biomes/korona`](biomes/korona/PORT.md) | 11 | 103 | 16 | 0 | 0 | 14 | 74 | 3 | biome | yes | yes |
| [`biomes/necanyons`](biomes/necanyons/PORT.md) | 12 | 99 | 33 | 0 | 0 | 10 | 56 | 3 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 14 | 243 | 0 | 0 | 34 | 36 | 173 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 15 | 274 | 1 | 0 | 10 | 65 | 198 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 12 | 176 | 1 | 0 | 13 | 31 | 131 | 5 | biome | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 11 | 180 | 1 | 0 | 12 | 13 | 154 | 2 | biome, atmos | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 12 | 208 | 1 | 0 | 16 | 27 | 164 | 5 | biome | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 19 | 188 | 64 | 14 | 14 | 39 | 57 | 2 | biome, atmos | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 208 | 1 | 0 | 14 | 59 | 135 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 12 | 152 | 14 | 0 | 13 | 31 | 95 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 14 | 190 | 1 | 0 | 10 | 34 | 145 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 12 | 201 | 1 | 0 | 13 | 32 | 155 | 5 | biome | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 14 | 301 | 53 | 22 | 15 | 37 | 175 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 14 | 213 | 1 | 0 | 12 | 31 | 169 | 5 | biome | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 6 | 36 | 18 | 0 | 0 | 17 | 0 | 0 |  |  | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 19 | 167 | 55 | 0 | 9 | 96 | 6 | 2 |  | yes | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 6 | 178 | 21 | 0 | 0 | 96 | 61 | 0 |  |  | yes |
| **all** | 2201 | 29060 | 5842 (20%) | 619 (2%) | 1103 (4%) | 3693 (13%) | 17803 (61%) | 273 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `sky` | 22 | 5 | 436 |
| `host-stage` | 22 | 22 | 397 |
| `host-build` | 22 | 22 | 29 |
| `camera` | 19 | 15 | 132 |
| `host-sky` | 19 | 17 | 267 |
| `probe` | 18 | 16 | 80 |
| `start` | 18 | 18 | 67 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 47 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 4 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
