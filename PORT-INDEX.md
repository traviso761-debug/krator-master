# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 242 | 3190 | 1732 | 428 | 97 | 298 | 635 | 10 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 55 | 560 | 123 | 27 | 10 | 30 | 371 | 7 | atmos | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 152 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 39 | 636 | 135 | 7 | 91 | 47 | 356 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 42 | 320 | 46 | 6 | 13 | 73 | 182 | 3 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 33 | 441 | 361 | 0 | 0 | 70 | 9 | 1 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 94 | 1022 | 217 | 6 | 45 | 129 | 626 | 6 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 37 | 429 | 14 | 23 | 10 | 26 | 357 | 5 | atmos | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 41 | 471 | 101 | 5 | 18 | 170 | 176 | 7 | atmos | yes | yes |
| [`settlements/longsong`](settlements/longsong/PORT.md) | 30 | 531 | 162 | 0 | 0 | 98 | 270 | 1 | biome, atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 37 | 737 | 62 | 0 | 16 | 326 | 332 | 2 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 21 | 217 | 117 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 34 | 251 | 36 | 13 | 0 | 67 | 135 | 4 | atmos | yes | yes |
| [`settlements/pinnacle-rock`](settlements/pinnacle-rock/PORT.md) | 30 | 329 | 152 | 0 | 0 | 24 | 153 | 1 | biome, atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 43 | 364 | 63 | 33 | 0 | 19 | 249 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 81 | 581 | 32 | 19 | 27 | 34 | 469 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 19 | 164 | 51 | 0 | 0 | 65 | 48 | 1 | atmos | yes | yes |
| [`settlements/span`](settlements/span/PORT.md) | 9 | 108 | 74 | 0 | 0 | 15 | 19 | 0 | atmos |  | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 280 | 108 | 12 | 6 | 105 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2981 | 1190 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 47 | 645 | 282 | 19 | 10 | 64 | 270 | 5 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 134 | 1801 | 313 | 42 | 105 | 110 | 1231 | 6 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 54 | 867 | 130 | 13 | 18 | 167 | 539 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 252 | 2944 | 355 | 39 | 176 | 48 | 2326 | 13 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 13 | 123 | 107 | 0 | 0 | 16 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 14 | 99 | 34 | 0 | 0 | 1 | 64 | 0 | atmos |  | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 18 | 444 | 15 | 0 | 0 | 11 | 418 | 3 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 45 | 2160 | 31 | 0 | 0 | 25 | 2104 | 3 | atmos |  | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 63 | 56 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 15 | 93 | 36 | 0 | 0 | 1 | 56 | 0 | atmos |  | yes |
| [`kits/eternian`](kits/eternian/PORT.md) | 32 | 219 | 31 | 0 | 0 | 1 | 187 | 1 | atmos |  | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 5 | 23 | 0 | 0 | 0 | 23 | 0 | 0 | atmos |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 22 | 238 | 122 | 0 | 0 | 79 | 37 | 1 | atmos |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 28 | 344 | 28 | 0 | 0 | 1 | 315 | 1 | atmos |  | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 18 | 140 | 17 | 0 | 0 | 1 | 122 | 1 | atmos |  | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 5 | 28 | 0 | 0 | 0 | 28 | 0 | 0 | atmos |  | yes |
| [`kits/metropolis`](kits/metropolis/PORT.md) | 29 | 439 | 214 | 4 | 0 | 24 | 196 | 2 | biome, atmos | yes | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 13 | 146 | 0 | 10 | 0 | 20 | 116 | 6 | atmos |  | yes |
| [`kits/port`](kits/port/PORT.md) | 116 | 774 | 49 | 4 | 0 | 35 | 686 | 4 | atmos | yes | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 29 | 409 | 2 | 8 | 0 | 48 | 350 | 1 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 12 | 110 | 59 | 0 | 0 | 0 | 51 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 9 | 62 | 32 | 0 | 0 | 9 | 22 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 283 | 1 | 6 | 0 | 48 | 227 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 15 | 117 | 11 | 0 | 0 | 1 | 104 | 0 | atmos |  | yes |
| [`kits/talia`](kits/talia/PORT.md) | 12 | 211 | 199 | 0 | 0 | 0 | 12 | 0 |  |  | yes |
| [`kits/yeti`](kits/yeti/PORT.md) | 25 | 143 | 27 | 0 | 0 | 4 | 112 | 2 | atmos |  | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 31 | 256 | 10 | 33 | 0 | 63 | 150 | 3 | atmos | yes | yes |
| [`biomes/abyssal-savannah`](biomes/abyssal-savannah/PORT.md) | 31 | 188 | 43 | 0 | 4 | 59 | 82 | 7 | biome, atmos | yes | yes |
| [`biomes/ancientsvalley`](biomes/ancientsvalley/PORT.md) | 13 | 82 | 20 | 0 | 3 | 48 | 11 | 2 | biome, atmos | yes | yes |
| [`biomes/catch`](biomes/catch/PORT.md) | 21 | 102 | 1 | 0 | 0 | 54 | 48 | 4 | biome, atmos | yes | yes |
| [`biomes/copperglacier`](biomes/copperglacier/PORT.md) | 15 | 83 | 12 | 8 | 1 | 28 | 34 | 0 | biome, atmos |  | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 16 | 196 | 31 | 20 | 2 | 53 | 90 | 3 | biome, atmos | yes | yes |
| [`biomes/cut`](biomes/cut/PORT.md) | 19 | 126 | 14 | 0 | 3 | 50 | 59 | 4 | biome, atmos | yes | yes |
| [`biomes/dambasins`](biomes/dambasins/PORT.md) | 25 | 118 | 33 | 0 | 2 | 24 | 60 | 4 | atmos | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 18 | 229 | 7 | 11 | 2 | 41 | 168 | 5 | biome, atmos | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 19 | 252 | 61 | 0 | 2 | 72 | 117 | 1 | biome, atmos | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 20 | 195 | 43 | 21 | 6 | 27 | 97 | 2 | biome, atmos | yes | yes |
| [`biomes/farside`](biomes/farside/PORT.md) | 18 | 132 | 1 | 0 | 0 | 41 | 89 | 5 | biome, atmos | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 20 | 179 | 41 | 37 | 4 | 45 | 52 | 2 | biome, atmos | yes | yes |
| [`biomes/godthrone`](biomes/godthrone/PORT.md) | 22 | 132 | 18 | 0 | 7 | 53 | 54 | 5 | biome, atmos | yes | yes |
| [`biomes/guilin`](biomes/guilin/PORT.md) | 14 | 113 | 40 | 0 | 2 | 11 | 60 | 3 | biome, atmos | yes | yes |
| [`biomes/hearths`](biomes/hearths/PORT.md) | 3 | 26 | 26 | 0 | 0 | 0 | 0 | 0 | biome, atmos |  | yes |
| [`biomes/highrift`](biomes/highrift/PORT.md) | 17 | 94 | 13 | 11 | 2 | 29 | 39 | 1 | biome, atmos |  | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 22 | 233 | 7 | 0 | 14 | 28 | 184 | 6 | biome, atmos | yes | yes |
| [`biomes/k-guilin`](biomes/k-guilin/PORT.md) | 17 | 149 | 47 | 0 | 0 | 23 | 79 | 3 | biome, atmos | yes | yes |
| [`biomes/korona`](biomes/korona/PORT.md) | 16 | 163 | 17 | 0 | 1 | 31 | 114 | 3 | biome, atmos | yes | yes |
| [`biomes/necanyons`](biomes/necanyons/PORT.md) | 18 | 155 | 38 | 0 | 2 | 21 | 94 | 3 | biome, atmos | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 19 | 270 | 3 | 0 | 16 | 46 | 205 | 6 | biome, atmos | yes | yes |
| [`biomes/nsemiarid`](biomes/nsemiarid/PORT.md) | 18 | 245 | 31 | 15 | 2 | 57 | 139 | 2 | biome, atmos | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 20 | 328 | 8 | 0 | 2 | 89 | 228 | 7 | biome, atmos | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 19 | 212 | 9 | 0 | 2 | 45 | 156 | 6 | biome, atmos | yes | yes |
| [`biomes/nwouterwall`](biomes/nwouterwall/PORT.md) | 15 | 138 | 23 | 0 | 0 | 35 | 80 | 3 | biome, atmos | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 15 | 229 | 4 | 0 | 14 | 23 | 188 | 1 | biome, atmos | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 19 | 237 | 12 | 21 | 2 | 13 | 188 | 5 | biome, atmos | yes | yes |
| [`biomes/riftrim`](biomes/riftrim/PORT.md) | 16 | 149 | 20 | 0 | 2 | 54 | 73 | 1 | biome, atmos | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 23 | 202 | 71 | 17 | 2 | 47 | 64 | 2 | biome, atmos | yes | yes |
| [`biomes/scablands`](biomes/scablands/PORT.md) | 5 | 46 | 25 | 0 | 0 | 16 | 5 | 0 |  |  | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 17 | 246 | 9 | 0 | 2 | 75 | 159 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 14 | 171 | 15 | 0 | 2 | 47 | 106 | 1 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 18 | 223 | 5 | 0 | 5 | 45 | 169 | 6 | biome, atmos | yes | yes |
| [`biomes/swhighlands`](biomes/swhighlands/PORT.md) | 20 | 204 | 0 | 0 | 1 | 66 | 137 | 8 | biome, atmos | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 18 | 247 | 5 | 3 | 2 | 55 | 183 | 5 | biome, atmos | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 22 | 328 | 57 | 22 | 3 | 52 | 193 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 22 | 261 | 27 | 0 | 2 | 28 | 204 | 5 | biome, atmos | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 29 | 283 | 90 | 10 | 9 | 174 | 0 | 1 |  | yes | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 7 | 285 | 23 | 0 | 0 | 108 | 154 | 0 |  |  | yes |
| **all** | 2785 | 34277 | 7966 (23%) | 954 (3%) | 876 (3%) | 4931 (14%) | 19551 (57%) | 311 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `host-sky` | 45 | 44 | 118 |
| `host-stage` | 41 | 41 | 693 |
| `host-build` | 37 | 37 | 146 |
| `camera` | 20 | 16 | 148 |
| `probe` | 18 | 16 | 81 |
| `start` | 18 | 18 | 73 |
| `stats` | 11 | 1 | 13 |
| `sky` | 10 | 5 | 321 |
| `host-tower` | 9 | 9 | 49 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `walk` | 2 | 2 | 32 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 6 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
