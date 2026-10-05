# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 58 | 417 | 219 | 42 | 52 | 17 | 87 | 4 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 59 | 714 | 149 | 40 | 10 | 38 | 478 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 32 | 602 | 124 | 7 | 89 | 42 | 340 | 11 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 74 | 1078 | 216 | 19 | 13 | 77 | 753 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 82 | 787 | 158 | 23 | 42 | 47 | 517 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 417 | 7 | 20 | 10 | 34 | 347 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 60 | 925 | 94 | 0 | 16 | 161 | 654 | 11 | atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 29 | 632 | 56 | 0 | 14 | 265 | 298 | 4 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 20 | 212 | 110 | 0 | 5 | 64 | 34 | 4 | atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 112 | 760 | 42 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 37 | 340 | 53 | 33 | 0 | 26 | 227 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 76 | 569 | 19 | 19 | 27 | 44 | 460 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 28 | 320 | 75 | 15 | 13 | 74 | 142 | 3 |  | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 66 | 1798 | 411 | 0 | 106 | 107 | 1175 | 38 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 64 | 886 | 437 | 19 | 10 | 56 | 365 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 135 | 1917 | 307 | 52 | 104 | 104 | 1351 | 8 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 47 | 1024 | 105 | 13 | 16 | 142 | 748 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 207 | 2537 | 244 | 34 | 174 | 27 | 2057 | 11 |  | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 37 | 1353 | 11 | 0 | 10 | 55 | 1277 | 3 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 230 | 120 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 7 | 30 | 0 | 0 | 10 | 20 | 0 | 0 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 26 | 389 | 1 | 8 | 0 | 47 | 334 | 1 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 37 | 230 | 0 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 13 | 176 | 1 | 0 | 14 | 29 | 132 | 5 | biome | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 137 | 2 | 0 | 12 | 16 | 107 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 223 | 0 | 0 | 34 | 44 | 145 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 15 | 224 | 1 | 0 | 10 | 59 | 154 | 6 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 174 | 1 | 0 | 13 | 34 | 127 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 205 | 1 | 0 | 16 | 29 | 159 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 173 | 1 | 0 | 13 | 51 | 108 | 6 | biome | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 181 | 1 | 0 | 10 | 37 | 133 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 196 | 1 | 0 | 13 | 34 | 148 | 5 | biome | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 206 | 1 | 0 | 12 | 33 | 160 | 5 | biome | yes | yes |
| **all** | 1493 | 20063 | 2969 (15%) | 349 (2%) | 877 (4%) | 1955 (10%) | 13913 (69%) | 213 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 18 | 14 | 203 |
| `probe` | 16 | 13 | 51 |
| `sky` | 13 | 5 | 349 |
| `stats` | 11 | 1 | 13 |
| `host-stage` | 11 | 11 | 228 |
| `host-sky` | 11 | 9 | 161 |
| `host-build` | 11 | 11 | 13 |
| `host-camera` | 11 | 11 | 92 |
| `host-probe` | 11 | 11 | 64 |
| `host-tower` | 9 | 9 | 42 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `start` | 5 | 3 | 1 |
| `hover` | 3 | 3 | 11 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `polygon` | 2 | 2 | 9 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
| `host-polytool` | 1 | 1 | 6 |
