# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 203 | 2534 | 1503 | 407 | 83 | 228 | 314 | 8 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 64 | 740 | 159 | 40 | 10 | 30 | 501 | 9 |  | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 152 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 38 | 615 | 135 | 7 | 84 | 46 | 343 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 69 | 946 | 202 | 6 | 13 | 71 | 655 | 5 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 27 | 316 | 247 | 0 | 0 | 60 | 9 | 1 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 123 | 1582 | 485 | 24 | 54 | 129 | 890 | 8 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 37 | 429 | 14 | 23 | 10 | 26 | 357 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 66 | 972 | 101 | 5 | 16 | 165 | 685 | 9 | atmos | yes | yes |
| [`settlements/longsong`](settlements/longsong/PORT.md) | 30 | 531 | 162 | 0 | 0 | 98 | 270 | 1 | biome, atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 36 | 721 | 62 | 0 | 15 | 325 | 319 | 2 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 21 | 217 | 117 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 35 | 281 | 36 | 13 | 10 | 66 | 157 | 4 | atmos | yes | yes |
| [`settlements/pinnacle-rock`](settlements/pinnacle-rock/PORT.md) | 30 | 329 | 152 | 0 | 0 | 24 | 153 | 1 | biome, atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 115 | 773 | 49 | 4 | 0 | 35 | 685 | 4 | atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 43 | 361 | 63 | 33 | 0 | 19 | 247 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 80 | 580 | 32 | 19 | 27 | 34 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 31 | 324 | 86 | 15 | 14 | 65 | 144 | 3 |  | yes | yes |
| [`settlements/span`](settlements/span/PORT.md) | 9 | 108 | 74 | 0 | 0 | 15 | 19 | 0 | atmos |  | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 280 | 108 | 12 | 6 | 105 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2981 | 1190 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 69 | 956 | 474 | 19 | 10 | 62 | 391 | 6 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 145 | 2035 | 361 | 59 | 105 | 110 | 1400 | 8 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 62 | 1073 | 129 | 13 | 16 | 157 | 758 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 251 | 2929 | 355 | 39 | 176 | 33 | 2326 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 25 | 171 | 33 | 6 | 10 | 24 | 97 | 2 | atmos | yes | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 18 | 444 | 15 | 0 | 0 | 11 | 418 | 3 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 47 | 2193 | 42 | 0 | 10 | 59 | 2082 | 3 |  |  | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 62 | 55 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 26 | 165 | 36 | 6 | 10 | 24 | 89 | 2 | atmos | yes | yes |
| [`kits/eternian`](kits/eternian/PORT.md) | 44 | 284 | 31 | 6 | 10 | 24 | 213 | 4 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 24 | 246 | 122 | 0 | 10 | 77 | 37 | 1 |  |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 39 | 416 | 27 | 6 | 10 | 24 | 348 | 3 | atmos | yes | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 29 | 212 | 16 | 6 | 10 | 24 | 155 | 3 | atmos | yes | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 28 | 397 | 2 | 8 | 0 | 48 | 339 | 1 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 12 | 103 | 59 | 0 | 0 | 0 | 44 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 10 | 62 | 32 | 0 | 0 | 9 | 22 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 283 | 1 | 6 | 0 | 48 | 227 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 27 | 188 | 11 | 6 | 10 | 24 | 137 | 2 | atmos | yes | yes |
| [`kits/talia`](kits/talia/PORT.md) | 12 | 206 | 196 | 0 | 0 | 0 | 10 | 0 |  |  | yes |
| [`kits/yeti`](kits/yeti/PORT.md) | 36 | 211 | 27 | 6 | 10 | 23 | 144 | 4 | atmos | yes | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 32 | 264 | 10 | 33 | 10 | 62 | 149 | 3 | atmos | yes | yes |
| [`biomes/catch`](biomes/catch/PORT.md) | 19 | 89 | 1 | 0 | 0 | 44 | 44 | 4 | biome, atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 15 | 177 | 28 | 18 | 2 | 43 | 85 | 3 | biome, atmos | yes | yes |
| [`biomes/cut`](biomes/cut/PORT.md) | 17 | 104 | 13 | 0 | 0 | 37 | 54 | 4 | biome, atmos | yes | yes |
| [`biomes/dambasins`](biomes/dambasins/PORT.md) | 13 | 79 | 11 | 0 | 1 | 16 | 52 | 2 | atmos | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 18 | 228 | 7 | 11 | 2 | 40 | 168 | 5 | biome, atmos | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 19 | 251 | 61 | 0 | 2 | 71 | 117 | 1 | biome, atmos | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 14 | 137 | 15 | 15 | 7 | 33 | 67 | 2 | biome, atmos | yes | yes |
| [`biomes/farside`](biomes/farside/PORT.md) | 17 | 102 | 1 | 0 | 0 | 26 | 76 | 5 | biome, atmos | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 18 | 163 | 40 | 33 | 3 | 38 | 50 | 2 | biome, atmos | yes | yes |
| [`biomes/godthrone`](biomes/godthrone/PORT.md) | 19 | 116 | 15 | 0 | 5 | 46 | 50 | 5 | biome, atmos | yes | yes |
| [`biomes/guilin`](biomes/guilin/PORT.md) | 14 | 113 | 40 | 0 | 2 | 11 | 60 | 3 | biome, atmos | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 19 | 180 | 7 | 0 | 14 | 27 | 132 | 6 | biome, atmos | yes | yes |
| [`biomes/k-guilin`](biomes/k-guilin/PORT.md) | 17 | 137 | 46 | 0 | 0 | 18 | 72 | 3 | biome, atmos | yes | yes |
| [`biomes/korona`](biomes/korona/PORT.md) | 14 | 138 | 16 | 0 | 1 | 17 | 104 | 3 | biome, atmos | yes | yes |
| [`biomes/necanyons`](biomes/necanyons/PORT.md) | 18 | 154 | 38 | 0 | 2 | 21 | 93 | 3 | biome, atmos | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 18 | 249 | 3 | 0 | 13 | 41 | 192 | 6 | biome, atmos | yes | yes |
| [`biomes/nsemiarid`](biomes/nsemiarid/PORT.md) | 16 | 221 | 31 | 11 | 2 | 42 | 135 | 2 | biome, atmos | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 19 | 312 | 5 | 0 | 2 | 82 | 222 | 7 | biome, atmos | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 19 | 211 | 9 | 0 | 2 | 44 | 156 | 6 | biome, atmos | yes | yes |
| [`biomes/nwouterwall`](biomes/nwouterwall/PORT.md) | 15 | 126 | 23 | 0 | 0 | 28 | 75 | 4 | biome, atmos | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 15 | 228 | 4 | 0 | 14 | 23 | 187 | 1 | biome, atmos | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 19 | 237 | 12 | 21 | 2 | 13 | 188 | 5 | biome, atmos | yes | yes |
| [`biomes/riftrim`](biomes/riftrim/PORT.md) | 16 | 147 | 20 | 0 | 2 | 53 | 73 | 1 | biome, atmos | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 20 | 184 | 66 | 14 | 2 | 39 | 62 | 2 | biome, atmos | yes | yes |
| [`biomes/scablands`](biomes/scablands/PORT.md) | 5 | 44 | 23 | 0 | 0 | 16 | 5 | 0 |  |  | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 17 | 240 | 9 | 0 | 2 | 73 | 157 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 13 | 150 | 15 | 0 | 2 | 31 | 102 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 18 | 220 | 5 | 0 | 5 | 44 | 167 | 6 | biome, atmos | yes | yes |
| [`biomes/swhighlands`](biomes/swhighlands/PORT.md) | 20 | 201 | 0 | 0 | 1 | 63 | 137 | 8 | biome, atmos | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 18 | 247 | 5 | 3 | 2 | 54 | 183 | 5 | biome, atmos | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 22 | 323 | 55 | 21 | 3 | 51 | 192 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 22 | 260 | 27 | 0 | 2 | 28 | 203 | 5 | biome, atmos | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 29 | 275 | 89 | 10 | 9 | 167 | 0 | 1 |  | yes | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 2 | 6 | 6 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 7 | 284 | 23 | 0 | 0 | 107 | 154 | 0 |  |  | yes |
| **all** | 2819 | 35425 | 7957 (22%) | 997 (3%) | 989 (3%) | 4646 (13%) | 20836 (59%) | 324 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `host-sky` | 39 | 38 | 122 |
| `host-stage` | 35 | 35 | 593 |
| `host-build` | 33 | 33 | 91 |
| `sky` | 24 | 5 | 455 |
| `camera` | 20 | 16 | 149 |
| `probe` | 18 | 16 | 81 |
| `start` | 18 | 18 | 69 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 49 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `walk` | 2 | 2 | 26 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 6 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
