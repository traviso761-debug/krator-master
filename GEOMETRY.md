# Krator: geometry report

*Written by `tools/geometry_report.py`. Do not edit; rerun it. Opening view, headless Chromium (SwiftShader), 1280x800. "LOD off / on" is `LOD.measure()` where the page takes core/lod.*

| Page | Draw calls | Triangles drawn | LOD off: calls / tris | LOD on: calls / tris | Scene triangles | Furniture tris | Meshes | Instanced sets | Instances | Materials |
|---|---|---|---|---|---|---|---|---|---|---|
| `biomes/crater-drylands/dist/crater-drylands.html` | 50 | 18.48 M |  |  | 18.48 M |  | 52 | 38 | 1.26 M | 42 |
| `biomes/eastabyss/dist/eastabyss.html` | 62 | 11.34 M |  |  | 11.37 M |  | 68 | 50 | 865 k | 55 |
| `biomes/ebadlands/dist/ebadlands.html` | 366 | 5.53 M |  |  | 5.54 M |  | 371 | 356 | 259 k | 50 |
| `biomes/ehighlands/dist/ehighlands.html` | 32 | 15.87 M |  |  | 15.88 M |  | 74 | 22 | 663 k | 26 |
| `biomes/geyser/dist/geyser.html` | 96 | 5.90 M |  |  | 5.92 M |  | 94 | 45 | 376 k | 63 |
| `biomes/hyperjungle/dist/hyperjungle.html` | 43 | 3.94 M |  |  | 3.95 M |  | 44 | 28 | 320 k | 39 |
| `biomes/nhighlands/dist/nhighlands.html` | 234 | 5.33 M |  |  | 25.68 M |  | 1218 | 1026 | 2.03 M | 58 |
| `biomes/nwbay/dist/nwbay.html` | 277 | 11.37 M |  |  | 11.41 M |  | 298 | 218 | 708 k | 101 |
| `biomes/nwlowlands/dist/nwlowlands.html` | 279 | 6.42 M |  |  | 10.12 M |  | 970 | 798 | 669 k | 56 |
| `biomes/rift/dist/rift.html` | 520 | 13.75 M |  |  | 26.32 M |  | 1753 | 1603 | 1.70 M | 59 |
| `biomes/sedesert/dist/sedesert.html` | 94 | 12.70 M |  |  | 12.70 M |  | 60 | 43 | 546 k | 44 |
| `biomes/shighlands/dist/shighlands.html` | 96 | 19.03 M |  |  | 19.03 M |  | 69 | 38 | 404 k | 32 |
| `biomes/swbay/dist/swbay.html` | 172 | 5.70 M |  |  | 10.82 M |  | 676 | 515 | 540 k | 91 |
| `biomes/swlowlands/dist/swlowlands.html` | 299 | 6.70 M |  |  | 12.16 M |  | 1008 | 798 | 855 k | 57 |
| `biomes/throne/dist/throne-ash.html` | 130 | 17.91 M |  |  | 17.89 M |  | 132 | 118 | 278 k | 130 |
| `biomes/throne/dist/throne-caldera.html` | 19 | 5.55 M |  |  | 5.50 M |  | 17 | 6 | 49 k | 16 |
| `biomes/throne/dist/throne-cloud.html` | 75 | 22.53 M |  |  | 22.55 M |  | 84 | 56 | 1.71 M | 77 |
| `biomes/throne/dist/throne-frontier.html` | 92 | 7.67 M |  |  | 7.69 M |  | 95 | 69 | 443 k | 89 |
| `biomes/throne/dist/throne-glacier.html` | 42 | 6.31 M |  |  | 7.05 M |  | 51 | 31 | 151 k | 45 |
| `biomes/throne/dist/throne-isle.html` | 121 | 16.94 M |  |  | 17.31 M |  | 126 | 87 | 1.23 M | 106 |
| `biomes/throne/dist/throne-kipuka.html` | 101 | 9.17 M |  |  | 9.19 M |  | 104 | 81 | 725 k | 96 |
| `biomes/throne/dist/throne-savanna.html` | 73 | 17.97 M |  |  | 17.99 M |  | 84 | 58 | 786 k | 67 |
| `biomes/throne/dist/throne-tube.html` | 92 | 909 k |  |  | 913 k |  | 96 | 77 | 12 k | 89 |
| `biomes/throne/dist/throne-vents.html` | 185 | 19.15 M |  |  | 19.12 M |  | 188 | 152 | 288 k | 165 |
| `biomes/throne/dist/throne.html` | 186 | 19.06 M |  |  | 19.06 M |  | 185 | 168 | 532 k | 173 |
| `biomes/xanadu/dist/xanadu.html` | 116 | 3.70 M |  |  | 30.92 M |  | 1370 | 1164 | 1.42 M | 63 |
| `core/sockets/example/sockets-example.html` | 34 | 7120 |  |  | 8108 |  | 65 | 0 | 0 | 46 |
| `kits/ancients-interiors/dist/ancients-interiors.html` | 17397 | 625 k |  |  | 649 k | 619 k | 18388 | 0 | 0 | 976 |
| `kits/ancients/dist/alt-civic.html` | 350 | 525 k | 356 / 1.18 M | 350 / 382 k | 1.19 M |  | 367 | 52 | 46 k | 69 |
| `kits/ancients/dist/alt-domestic.html` | 180 | 563 k | 189 / 871 k | 180 / 459 k | 873 k |  | 192 | 46 | 29 k | 61 |
| `kits/ancients/dist/alt-towers.html` | 178 | 1.16 M | 184 / 2.46 M | 178 / 899 k | 2.53 M |  | 205 | 58 | 79 k | 72 |
| `kits/ancients/dist/ancients-kit.html` | 338 | 3.16 M | 384 / 12.09 M | 338 / 2.36 M | 17.11 M |  | 2056 | 112 | 400 k | 169 |
| `kits/ancients/dist/arcbeam.html` | 25 | 601 k | 34 / 742 k | 25 / 601 k | 1.07 M |  | 47 | 25 | 58 k | 36 |
| `kits/ancients/dist/arcoindian.html` | 49 | 351 k | 53 / 388 k | 49 / 351 k | 592 k |  | 73 | 26 | 18 k | 40 |
| `kits/ancients/dist/arcoindian2.html` | 33 | 386 k | 38 / 407 k | 33 / 386 k | 604 k |  | 58 | 23 | 15 k | 41 |
| `kits/ancients/dist/arcube.html` | 35 | 521 k | 36 / 625 k | 35 / 521 k | 733 k |  | 52 | 21 | 64 k | 44 |
| `kits/ancients/dist/blades.html` | 17 | 392 k | 21 / 650 k | 17 / 392 k | 801 k |  | 29 | 11 | 34 k | 29 |
| `kits/ancients/dist/canyon.html` | 27 | 85 k | 38 / 225 k | 27 / 85 k | 294 k |  | 74 | 20 | 3816 | 29 |
| `kits/ancients/dist/crescent.html` | 39 | 478 k | 40 / 615 k | 39 / 477 k | 615 k |  | 39 | 19 | 40 k | 39 |
| `kits/ancients/dist/dalab.html` | 22 | 547 k | 22 / 646 k | 22 / 547 k | 646 k |  | 22 | 17 | 18 k | 22 |
| `kits/ancients/dist/darco.html` | 15 | 327 k | 22 / 354 k | 15 / 327 k | 492 k |  | 28 | 17 | 17 k | 24 |
| `kits/ancients/dist/drum.html` | 19 | 305 k | 23 / 611 k | 19 / 305 k | 675 k |  | 32 | 12 | 36 k | 32 |
| `kits/ancients/dist/engines.html` | 80 | 238 k | 81 / 265 k | 80 / 238 k | 296 k |  | 98 | 19 | 12 k | 28 |
| `kits/ancients/dist/forest.html` | 36 | 801 k | 39 / 1.01 M | 36 / 801 k | 1.01 M |  | 38 | 27 | 47 k | 37 |
| `kits/ancients/dist/funicular.html` | 17 | 120 k | 17 / 120 k | 17 / 120 k | 120 k |  | 17 | 13 | 2124 | 17 |
| `kits/ancients/dist/hexahedron.html` | 78 | 2.42 M | 84 / 3.14 M | 79 / 2.39 M | 3.19 M |  | 90 | 66 | 202 k | 65 |
| `kits/ancients/dist/hill.html` | 251 | 1.38 M | 267 / 2.04 M | 251 / 1.05 M | 2.04 M |  | 267 | 56 | 77 k | 85 |
| `kits/ancients/dist/hosts.html` | 287 | 777 k | 297 / 1.24 M | 287 / 652 k | 1.25 M |  | 300 | 60 | 48 k | 81 |
| `kits/ancients/dist/interiors.html` | 288 | 1.36 M | 346 / 2.84 M | 288 / 781 k | 3.00 M |  | 410 | 73 | 80 k | 89 |
| `kits/ancients/dist/iziz-style.html` | 819 | 1.61 M | 1566 / 3.08 M | 819 / 761 k | 3.08 M |  | 1570 | 56 | 38 k | 437 |
| `kits/ancients/dist/iziz-variants.html` | 443 | 1.51 M | 457 / 3.25 M | 443 / 1.07 M | 3.29 M |  | 541 | 51 | 69 k | 142 |
| `kits/ancients/dist/launch.html` | 62 | 918 k | 66 / 1.08 M | 62 / 915 k | 1.08 M |  | 65 | 33 | 45 k | 48 |
| `kits/ancients/dist/ledge.html` | 29 | 524 k | 32 / 929 k | 28 / 514 k | 1.07 M |  | 47 | 16 | 56 k | 31 |
| `kits/ancients/dist/lighthouse.html` | 96 | 364 k | 99 / 422 k | 96 / 276 k | 422 k |  | 103 | 23 | 5556 | 45 |
| `kits/ancients/dist/monolith.html` | 23 | 525 k | 26 / 759 k | 23 / 525 k | 767 k |  | 30 | 19 | 64 k | 30 |
| `kits/ancients/dist/plymouth.html` | 32 | 632 k | 39 / 786 k | 32 / 632 k | 872 k |  | 44 | 33 | 108 k | 44 |
| `kits/ancients/dist/ring.html` | 42 | 924 k | 42 / 1.06 M | 42 / 922 k | 1.06 M |  | 41 | 29 | 48 k | 39 |
| `kits/ancients/dist/skyi.html` | 73 | 197 k | 73 / 210 k | 73 / 197 k | 235 k |  | 91 | 24 | 6123 | 40 |
| `kits/ancients/dist/skyj.html` | 59 | 511 k | 62 / 642 k | 59 / 394 k | 642 k |  | 62 | 20 | 5579 | 32 |
| `kits/ancients/dist/skyk.html` | 91 | 530 k | 91 / 614 k | 90 / 506 k | 749 k |  | 115 | 49 | 11 k | 61 |
| `kits/ancients/dist/spaceport.html` | 91 | 235 k | 95 / 305 k | 91 / 228 k | 306 k |  | 99 | 62 | 9530 | 76 |
| `kits/ancients/dist/spire.html` | 45 | 456 k | 57 / 825 k | 45 / 456 k | 919 k |  | 156 | 43 | 20 k | 60 |
| `kits/ancients/dist/theodiga.html` | 35 | 238 k | 44 / 281 k | 35 / 238 k | 343 k |  | 61 | 25 | 13 k | 39 |
| `kits/ancients/dist/trigon.html` | 28 | 352 k | 32 / 631 k | 28 / 352 k | 660 k |  | 63 | 15 | 37 k | 37 |
| `kits/ancients/dist/veladiga.html` | 28 | 203 k | 38 / 282 k | 28 / 203 k | 397 k |  | 52 | 22 | 11 k | 34 |
| `kits/ancients/dist/wheel.html` | 35 | 835 k | 37 / 1.05 M | 35 / 797 k | 1.08 M |  | 38 | 11 | 70 k | 38 |
| `kits/ancients/dist/wing.html` | 22 | 280 k | 27 / 513 k | 22 / 280 k | 636 k |  | 58 | 14 | 21 k | 37 |
| `kits/ancients/dist/worn.html` | 271 | 2.13 M | 312 / 4.20 M | 271 / 1.39 M | 5.72 M |  | 738 | 74 | 171 k | 99 |
| `kits/ancients/dist/yuni-variants.html` | 113 | 519 k | 117 / 745 k | 113 / 469 k | 745 k |  | 119 | 68 | 20 k | 81 |
| `kits/ash-nomads/dist/ash-nomads.html` | 590 | 1.01 M |  |  | 1.01 M | 654 k | 588 | 0 | 0 | 71 |
| `kits/catalog/dist/catalog.html` | 43032 | 1.30 M |  |  | 1.57 M | 1.55 M | 50819 | 0 | 0 | 4416 |
| `kits/desert-nomads/dist/desert-nomads.html` | 972 | 1.30 M |  |  | 1.30 M | 830 k | 971 | 0 | 0 | 54 |
| `kits/fauna/dist/fauna.html` | 2369 | 838 k |  |  | 903 k |  | 2562 | 0 | 0 | 324 |
| `kits/interiors/dist/interiors-sets.html` | 47108 | 1.18 M |  |  | 9.02 M | 8.39 M | 366943 | 0 | 0 | 8777 |
| `kits/interiors/dist/interiors-walk.html` | 3370 | 217 k |  |  | 310 k | 147 k | 8434 | 0 | 0 | 2150 |
| `kits/interiors/dist/interiors.html` | 2148 | 69 k |  |  | 181 k | 142 k | 7109 | 0 | 0 | 827 |
| `kits/islanders/dist/islanders.html` | 591 | 2.10 M |  |  | 2.10 M | 441 k | 589 | 0 | 0 | 81 |
| `kits/mechs/dist/mechs.html` | 153 | 176 k |  |  | 180 k |  | 166 | 0 | 0 | 91 |
| `kits/motor-vehicles/dist/motor-vehicles.html` | 128 | 120 k |  |  | 120 k |  | 125 | 0 | 0 | 42 |
| `kits/post-apoc/dist/post-apoc.html` | 30 | 1.26 M |  |  | 1.27 M | 319 k | 158 | 2 | 236 | 52 |
| `kits/ringsea/dist/ringsea.html` | 223 | 679 k |  |  | 753 k |  | 297 | 16 | 579 | 155 |
| `kits/scyvoi/dist/scyvoi.html` | 753 | 890 k |  |  | 890 k | 475 k | 752 | 0 | 0 | 80 |
| `kits/zeijani/dist/zeijani.html` | 460 | 1.57 M |  |  | 1.61 M | 712 k | 487 | 0 | 0 | 120 |
| `openworld/little-demo/dist/little-demo.artifact.html` | not ready |  |  |  |  |  |  |  |  |  |
| `openworld/little-demo/dist/little-demo.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/dalab/dist/dalab-set.html` | 73 | 284 k | 157 / 540 k | 73 / 284 k | 571 k |  | 166 | 154 | 25 k | 163 |
| `settlements/dalab/dist/dalab.html` | 176 | 9.81 M | 213 / 10.93 M | 182 / 9.39 M | 10.97 M |  | 232 | 184 | 697 k | 228 |
| `settlements/dhelv/dist/dhelv.html` | 234 | 553 k |  |  | 4.64 M | 1.30 M | 3229 | 1255 | 123 k | 220 |
| `settlements/girder/girder-hero.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/girder/girder.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/highlands/dist/highlands.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/highlands/dist/roketstad.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/iziz/dist/iziz-vernacular.html` | 61 | 243 k | 128 / 426 k | 61 / 243 k | 461 k |  | 167 | 124 | 17 k | 135 |
| `settlements/iziz/dist/iziz.html` | 858 | 4.96 M | 889 / 6.73 M | 858 / 4.53 M | 6.73 M |  | 930 | 342 | 232 k | 359 |
| `settlements/iziz/dist/w-a.html` | 71 | 54 k | 73 / 60 k | 71 / 54 k | 60 k |  | 73 | 50 | 2425 | 54 |
| `settlements/iziz/dist/w-b.html` | 49 | 46 k | 49 / 48 k | 49 / 46 k | 48 k |  | 49 | 45 | 1458 | 49 |
| `settlements/iziz/dist/w-c.html` | 83 | 239 k | 87 / 298 k | 83 / 239 k | 298 k |  | 87 | 60 | 8414 | 69 |
| `settlements/jimjam/dist/jimjam-kit.html` | 487 | 1.22 M | 532 / 1.78 M | 487 / 1.21 M | 1.78 M |  | 538 | 336 | 41 k | 348 |
| `settlements/locus/abyss-kit.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/locus/locus-kit.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/locus/locus-plants.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/locus/locus.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/mavs-refuge/mavs-refuge.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/mungo/dist/mungo.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/noahs-regret/dist/noahs-regret.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/port/dist/cgBox.html` | 111 | 409 k | 114 / 573 k | 111 / 405 k | 528 k |  | 114 | 56 | 8752 | 72 |
| `settlements/port/dist/cgCrane.html` | 149 | 424 k | 152 / 585 k | 149 / 419 k | 540 k |  | 152 | 56 | 8459 | 73 |
| `settlements/port/dist/cgEdges.html` | 108 | 392 k | 112 / 505 k | 108 / 381 k | 460 k |  | 112 | 26 | 6407 | 40 |
| `settlements/port/dist/cgStore.html` | 118 | 411 k | 120 / 590 k | 118 / 402 k | 545 k |  | 120 | 50 | 9179 | 68 |
| `settlements/port/dist/chHousing.html` | 86 | 607 k | 89 / 774 k | 86 / 607 k | 772 k |  | 140 | 60 | 22 k | 77 |
| `settlements/port/dist/ddDock.html` | 115 | 430 k | 120 / 747 k | 115 / 425 k | 702 k |  | 120 | 54 | 8583 | 77 |
| `settlements/port/dist/ddShed.html` | 123 | 435 k | 126 / 694 k | 123 / 427 k | 649 k |  | 126 | 61 | 8917 | 84 |
| `settlements/port/dist/ddYard.html` | 117 | 415 k | 121 / 612 k | 117 / 410 k | 567 k |  | 121 | 55 | 8328 | 74 |
| `settlements/port/dist/edges.html` | 146 | 605 k | 142 / 923 k | 147 / 578 k | 877 k |  | 144 | 35 | 15 k | 55 |
| `settlements/port/dist/harbour.html` | 431 | 1.08 M | 448 / 1.75 M | 419 / 933 k | 1.72 M |  | 455 | 123 | 32 k | 177 |
| `settlements/port/dist/hbEdges.html` | 106 | 528 k | 95 / 951 k | 109 / 461 k | 907 k |  | 95 | 34 | 9407 | 44 |
| `settlements/port/dist/hbFish.html` | 128 | 553 k | 130 / 1.03 M | 130 / 523 k | 982 k |  | 130 | 69 | 12 k | 82 |
| `settlements/port/dist/hbHaven.html` | 134 | 440 k | 133 / 732 k | 134 / 436 k | 688 k |  | 137 | 71 | 8254 | 86 |
| `settlements/port/dist/hbMarina.html` | 124 | 536 k | 127 / 924 k | 124 / 528 k | 879 k |  | 127 | 68 | 11 k | 83 |
| `settlements/port/dist/lbAuthority.html` | 98 | 391 k | 101 / 430 k | 98 / 390 k | 390 k |  | 103 | 60 | 8533 | 81 |
| `settlements/port/dist/lbBlocks.html` | 208 | 639 k | 212 / 854 k | 207 / 627 k | 813 k |  | 215 | 65 | 20 k | 94 |
| `settlements/port/dist/lbStores.html` | 94 | 394 k | 97 / 437 k | 94 / 392 k | 397 k |  | 97 | 54 | 7571 | 74 |
| `settlements/port/dist/lbTanks.html` | 98 | 391 k | 101 / 431 k | 98 / 389 k | 391 k |  | 103 | 54 | 7712 | 78 |
| `settlements/port/dist/segment.html` | 144 | 614 k | 144 / 990 k | 144 / 593 k | 947 k |  | 145 | 59 | 21 k | 81 |
| `settlements/port/dist/showcase.html` | 803 | 5.31 M | 886 / 9.08 M | 826 / 1.70 M | 9.07 M |  | 910 | 162 | 124 k | 243 |
| `settlements/port/dist/slBerth.html` | 136 | 561 k | 138 / 798 k | 135 / 549 k | 753 k |  | 138 | 59 | 15 k | 78 |
| `settlements/port/dist/slCarrier.html` | 118 | 455 k | 121 / 655 k | 118 / 434 k | 610 k |  | 121 | 56 | 12 k | 73 |
| `settlements/port/dist/slPen.html` | 129 | 473 k | 126 / 771 k | 129 / 459 k | 726 k |  | 126 | 55 | 13 k | 71 |
| `settlements/port/dist/slSub.html` | 106 | 384 k | 109 / 542 k | 106 / 371 k | 497 k |  | 109 | 48 | 7562 | 63 |
| `settlements/port/dist/spYard.html` | 202 | 627 k | 208 / 970 k | 191 / 618 k | 924 k |  | 210 | 61 | 18 k | 82 |
| `settlements/port/dist/tmEdges.html` | 101 | 461 k | 105 / 611 k | 101 / 453 k | 565 k |  | 105 | 39 | 12 k | 51 |
| `settlements/port/dist/tmHeli.html` | 133 | 426 k | 139 / 587 k | 133 / 423 k | 542 k |  | 139 | 77 | 8384 | 91 |
| `settlements/port/dist/tmPass.html` | 121 | 453 k | 123 / 639 k | 121 / 447 k | 594 k |  | 123 | 64 | 12 k | 79 |
| `settlements/port/dist/tmShip.html` | 119 | 419 k | 123 / 584 k | 119 / 416 k | 539 k |  | 123 | 65 | 9111 | 79 |
| `settlements/port/dist/vsFeeder.html` | 125 | 418 k | 128 / 593 k | 125 / 400 k | 548 k |  | 129 | 52 | 9676 | 76 |
| `settlements/port/dist/vsGiant.html` | 134 | 572 k | 138 / 779 k | 134 / 547 k | 735 k |  | 139 | 53 | 24 k | 77 |
| `settlements/port/dist/vsPanamax.html` | 126 | 452 k | 129 / 625 k | 126 / 429 k | 580 k |  | 130 | 51 | 12 k | 77 |
| `settlements/reedlake/dist/reedlake-village.html` | 148 | 241 k | 148 / 245 k | 148 / 241 k | 224 k |  | 149 | 65 | 5976 | 138 |
| `settlements/reedlake/dist/reedlake.html` | 101 | 482 k | 118 / 579 k | 101 / 482 k | 619 k |  | 356 | 66 | 15 k | 321 |
| `settlements/screamers/dist/furniture.html` | 17 | 13 k | 17 / 13 k | 17 / 13 k | 26 k |  | 18 | 13 | 251 | 18 |
| `settlements/screamers/dist/screamers.html` | 128 | 3.28 M | 149 / 3.58 M | 126 / 3.06 M | 3.60 M | 99 k | 151 | 70 | 258 k | 145 |
| `settlements/shade/dist/shade.html` | 48 | 3.25 M |  |  | 3.47 M |  | 82 | 32 | 109 k | 70 |
| `settlements/streetlab/dist/voth-city.html` | 1047 | 34.88 M |  |  | 40.95 M | 615 k | 3591 | 3147 | 657 k | 239 |
| `settlements/streetlab/dist/voth-site.html` | 132 | 600 k |  |  | 1.14 M | 762 k | 52 | 6 | 8308 | 8 |
| `settlements/verge/dist/verge.html` | 1012 | 18.22 M |  |  | 9.88 M | 439 k | 778 | 260 | 331 k | 352 |
| `settlements/voth/voth.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/xanadu/dist/erewhon.html` | 1029 | 9.53 M | 1255 / 20.95 M | 1031 / 9.36 M | 21.99 M |  | 1639 | 1579 | 1.02 M | 1435 |
| `settlements/xanadu/dist/xanadu.html` | 88 | 888 k | 174 / 5.41 M | 88 / 888 k | 5.42 M |  | 199 | 168 | 259 k | 196 |
| `settlements/ys/dist/kit.html` | 99 | 4.26 M |  |  | 4.26 M |  | 108 | 35 | 16 k | 58 |
| `settlements/ys/dist/mock.html` | 58 | 561 k |  |  | 502 k |  | 57 | 30 | 2328 | 46 |
| `settlements/ys/dist/ys.html` | 187 | 29.50 M |  |  | 29.49 M |  | 205 | 100 | 394 k | 180 |
| `settlements/yuni/yuni-assets.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/yuni/yuni-plants.html` | not ready |  |  |  |  |  |  |  |  |  |
| `settlements/yuni/yuni.html` | not ready |  |  |  |  |  |  |  |  |  |
