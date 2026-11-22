#!/usr/bin/env python3
"""Scale model 5.1, edit 21 (2026-11-22): Wave 0 Pre-Build Hygiene Batch (Parts 1, 3, and 4 of
`core/region/CONTINENTAL-SCOPE.md` section 3.9 and `core/region/RING-SEA-SCOPE.md` Ruling #28).

    python3 tools/scale-model/edit_521_wave0_hygiene.py            # edits model/data + 60-settlements.js + 51-region-store.js, writes report
    python3 tools/scale-model/edit_521_wave0_hygiene.py --dry-run  # runs every step and check in memory, writes nothing

1. Part 1a — Northern East Abyss `+900 m` Floor Lift (Ruling #43, `PROPOSAL-EAST-ABYSS-YUNI.md` section 1.2):
   Smoothly lifts the northern and central East Abyss floor (`e' = -1000 + 0.5625 * (e + 1000)` for `e < -1000`)
   so `Reed` (`-2,333 -> -1,750 m`), `Sfenops` (`-1,657 -> -1,370 m`), `Liikofi` (`-1,637 -> -1,358 m`),
   `Middle Tabisti` (`1311, 761`, `-1,707 -> -1,398 m`), and `Mungo` (`1322, 828`, `-1,770 -> -1,433 m`) stand in
   livable `1.90-1.99 atm` dense tropical air instead of lethal `49 C` wet-bulb floor heat. Tapers smoothly across
   the dry `Y = 851.5..861.5` horst sill so `Lower Verge` (`1268, 949`), `Yuni North` (`1268, 994`), and `Locus`
   (`1267, 1043`) change by `0.0 m`, while preserving monotonic river/basin/sump hydrology across all 18 northern
   East Abyss lakes (`lbl=103..161`) and their inflowing rivers.

2. Part 1b — `Silkhead` Southern Lake-Tongue Extension (`lbl=54`, Ruling #56, `PROPOSAL-IZIZ-EXCLAVES.md`):
   Extends the `-59.8 m` (`~-60 m`) southern finger of Soda Lake (`lbl=54`) down the `X = 911..914` Korona trough
   from `Y = 492` to `Y = 531` (`~80 km`), grading a dry shore bench at `(912, 532)` (`~-42 m`) for the Imperial
   (`Shell Province` exclave) lake-head port `Port Koron`, trimming `r045` (`Sing-Ham`) to mouth cleanly into the
   new lake-head (`[912.5, 531.0]`), and recording Soda Lake and the East Abyss sumps in `basins.json`.

3. Part 3 — Wet / Misplaced Pin Nudges & Newly Approved Pins (`model/src/60-settlements.js`, `SETT_VER = '5.1e21'`):
   Applies the 6 Ring Sea dry-ground coastal pin nudges + `Port Tobin` deduplication/shore snap, 4 continental dry
   shore/pass moves (`Lux`, `Jrrmiah`, `Silkhead`, `White Gills Hermitage`), verifies `Pit-Head 04` (`1687, 1555`),
   `Bab al-Hawa (Godsgate)` (`1028, 1246`), and `Singing Gjar Quartz` (`1572, 1643`) are unique and dry, marks
   `Dorado` (`483, 964`) `drowned: true` and `Tungang saltpeter works` (`492, 1255`) `layer: 'subterranean'`, and
   adds the 9 newly approved pins (`Sideros`, `Tauranga-Hikau`, `Wheel`, `Thera`, `Saltwhite Gate`, `Yuni North`,
   `Middle Tabisti`, `Port Koron`, `Wahat al-Shamal`).

4. Part 4 — Political Border Polygon Carve-Outs (`model/src/51-region-store.js`, `krator.regMerged.5.1e21`):
   Applies the 5 Ring Sea coastal polygon trims (`Region 87` off `Port Goto`/`Shell Province`, `Zeijani` carved from
   `League of Amphitriton` + new `Zeijani` polygon, `Screamer Country` SW vertex, `Talovolci Chiefs` off `Hook` and
   `Arcbeam`, `Vothic Kingdom` S-Throne coast back to `X = 828` keeping its exact 51 vertices) plus the 7 continental
   carve-outs/extensions (`Yusar` enclaves `Carcosa` & `Henge` carved from `Eternal State`, Farside N border at
   `Y = 515` leaving `Yith` outside, `Bastion` & `Palewharf` inside `Eternal State`, `Skywatch` & `Serai` inside
   `Jimjam`, `Leng` inside `Yeti Kingdom`, `Jimjam` & `dam 2` trimmed off the `Ardent` / `Free Clans` scarp, and
   `Nomad Country` trimmed along the `E = -700 m` East Abyss rim). Refuses to run twice.
"""
import copy
import heapq
import io
import json
import math
import os
import re
import sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.climate as C  # noqa: E402
import smodel.geom as G     # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
SETT_VER = '5.1e21'
DRY = ('--dry-run' in sys.argv) or ('--dry' in sys.argv)

EA_BOX = (610, 863, 1210, 1356)      # (y0, y1, x0, x1) strictly bounding northern/central East Abyss lift
KOR_BOX = (484, 542, 906, 922)       # (y0, y1, x0, x1) strictly bounding Korona trough lake-tongue extension

KORONA_TONGUE_PTS = [
    (912.5, 492.0),
    (912.6, 498.0),
    (911.8, 504.0),
    (911.7, 512.0),
    (911.8, 520.0),
    (912.4, 526.0),
    (912.4, 531.0),
]

# ---- Part 3: Settlement moves, tag updates, deduplications, and newly approved pins ----
REMOVED_SETT_IDS = ['skwl1d2hdu']  # Duplicate inland "Port  Tobin" (double-space) at (932, 973)

MOVED_SPECS = {
    's0w2mwd7xq': {
        'px': 701, 'py': 838, 'polity': 'League: Pontus',
        'notes': 'Nudged 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28) from wet coastal pixel 702,839 1 px NW onto dry Pontus shore (-1,424 m).',
    },
    's4t3y092qc': {
        'px': 994, 'py': 827, 'polity': 'Kautoa',
        'notes': 'Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28) from submerged 1000,816 onto dry SE Kautoa coast at 994,827 (-1,441 m).',
    },
    'syen8wxax5': {
        'px': 780, 'py': 787, 'polity': 'West Ring Islanders',
        'notes': 'West Islander (Hikau) northern confederacy seat (P6). Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Rulings #16, #28) from submerged shoal 752,781 onto the dry 212 km2 northern West Ring Isle at 780,787 (-1,270 m).',
    },
    'ski7uk8fjc': {
        'type': 'town', 'px': 920, 'py': 703, 'polity': 'Shell Province',
        'notes': 'Imperial naval station and customs harbour of Shell Province. Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28) from submerged 918,698 onto dry north Ring Sea shore at 920,703 (-1,460 m).',
    },
    'sxvb4k4024': {
        'px': 705, 'py': 1129, 'polity': 'Vothic Kingdom',
        'notes': 'Conquered Shim/Shumari iron-forging city of SW Vothic Kingdom. Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Rulings #8, #28) from wet highland tarn 725,1141 to dry valley floor inside Vothic Kingdom at 705,1129 (+589 m).',
    },
    'skzuw4a73a': {
        'px': 1057, 'py': 621, 'polity': 'Painted Men',
        'notes': 'PM3 Painted Canyon Cliff-Hold. Nudged 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28) from 1055,622 2 px ENE onto dry canyon rim inside Painted Men at 1057,621 (+2,616 m).',
    },
    's06eu913kl': {
        'px': 956, 'py': 944, 'polity': 'Empire of Iziz',
        'notes': 'Coastal port of Iziz on the SE Ring Sea; deduplicated against inland double-space duplicate skwl1d2hdu (932,973) and nudged 1 px south from wet 956,943 onto dry shore at 956,944 (-1,484 m) (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28).',
    },
    's1ugpi6uas': {
        'px': 498, 'py': 644, 'polity': 'Eternal State',
        'notes': 'Eastern industrial river-port of the Eternal State. Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3) from wet river/lake cell 495,645 onto dry bank at 498,644 (+164 m).',
    },
    'sfuf85wred': {
        'px': 555, 'py': 957, 'polity': 'Frogmen',
        'notes': 'Northern Frogman bog-fen village. Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3) from wet tarn 557,959 onto dry fen bank at 555,957 (+2,928 m).',
    },
    'slm5ul15lp': {
        'px': 934, 'py': 424, 'polity': 'Silkhead (Korona Gateway)',
        'notes': 'Autonomous silk-caravan gateway city on the NW shore of Soda Lake (lbl=54, -60 m). Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3) from wet lake cell 932,425 onto dry shore bench at 934,424 (+12 m).',
    },
    'sttkxo9ndy': {
        'px': 1015, 'py': 1430, 'polity': 'Order of Historians',
        'notes': 'Order of Historians glass-and-fungal scriptorium hermitage on the NW Catch / Twins margin. Moved 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3) from 1035,1535 to 1015,1430 (+3,746 m).',
    },
    'sbxpx1u95q': {
        'drowned': True,
        'notes': "The Drowned City in the 17.4 m blast-basin lake of Ancient's Valley (intentionally submerged ruin, marked drowned: true in Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3).",
    },
    's4i2tk5zvf': {
        'layer': 'subterranean', 'polity': 'Tungang Union',
        'notes': "Added 2026-11-12 (the owner: every polity something others lack; openworld/TRADE-GOODS.md): a subterranean bore and cave saltpeter works of the Tungang Union (layer: 'subterranean', CONTINENTAL-SCOPE.md Ruling #74 & section 3.9 #3), rich saltpeter (200) 75 km from Loj Twenny; with Rift-line salvage, the Union's export.",
    },
}

ADDED_SPECS = [
    {
        'id': 'ssideros01',
        'name': 'Sideros',
        'type': 'town',
        'px': 744,
        'py': 784,
        'notes': 'Hykkousoi mainland iron, coal and amphora-clay mining deme (~3,000, under Tethis H2), 28 km SE of Tethis on a dry coastal sedimentary pocket (-1,424 m; Fe=180, Coal=132, Clay=255). Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #5).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'League: Tethis',
    },
    {
        'id': 'stauranga1',
        'name': 'Tauranga-Hikau',
        'type': 'town',
        'px': 848,
        'py': 897,
        'notes': 'Sovereign Free West Rumah (Hikau) South-Throne council entrepot (~4,500) built in horned saddle-roofs over volcanic basalt piers (-1,438 m) between Vothic S2 and Hookfleet Port Mira. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #13).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'West Ring Islanders',
    },
    {
        'id': 'swheel0001',
        'name': 'Wheel',
        'type': 'ruined arcology',
        'px': 405,
        'py': 886,
        'notes': "Ruined ring-arcology and Cyberlich citadel on a dry +57 m pedestal in northern Ancient's Valley. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #11 & section 3.9 #3).",
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Cyberliches',
    },
    {
        'id': 'sthera0001',
        'name': 'Thera',
        'type': 'ruin',
        'stage': 'ruin',
        'px': 526,
        'py': 955,
        'notes': "Uninhabited blasted Ancient ruin (+1,653 m) on the eastern rim of Ancient's Valley (stage: 'ruin'). Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md section 3.9 #3).",
        'createdAt': '2026-11-22T00:00:00.000Z',
    },
    {
        'id': 'ssaltwhit1',
        'name': 'Saltwhite Gate',
        'type': 'fort',
        'px': 486,
        'py': 837,
        'notes': "Eternian southern quarantine and customs gate-fort (+1,573 m) on the rim pass above Ancient's Valley east of Veil. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #6 & section 3.9 #3).",
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Eternal State',
    },
    {
        'id': 'syuninrth1',
        'name': 'Yuni North',
        'type': 'outpost',
        'px': 1268,
        'py': 994,
        'notes': 'Locus Geomancer oil-and-coal extraction patch (-1,887 m) on the Bruk Lona delta between Lower Verge and Locus. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #42 & section 3.9 #3).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Yuni Emirate',
    },
    {
        'id': 'smidtabis1',
        'name': 'Middle Tabisti',
        'type': 'town',
        'px': 1311,
        'py': 761,
        'notes': 'Central East Abyss pure-strain Tabisti river-delta town (-1,398 m, 1.91 atm) at the mouth of the Rifar al-Rih, bridging Reed Lake and Liikofi. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #43 & section 3.9 #3).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Tabisti: Liikofi',
    },
    {
        'id': 'sportkoron',
        'name': 'Port Koron',
        'type': 'town',
        'px': 912,
        'py': 532,
        'notes': 'Imperial (Shell Province exclave) southern lake-head barge port (-42 m) at the Sing-Ham mouth on the extended -60 m southern finger of Soda Lake (lbl=54), cutting overland caravan haul from Shell to flatwater lake navigation up to Silkhead. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #56 & section 3.9 #3).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Shell Province',
    },
    {
        'id': 'swahatsham',
        'name': 'W\u0101\u1e25at al-Shamal',
        'type': 'village',
        'px': 1165,
        'py': 652,
        'notes': 'Northern Free Dasri oasis market village (+41 m, 1.59 atm) in Nomad Country N1, 323 km ENE of Pinnacle Rock alongside Shade and Furrow. Added 2026-11-22 (Wave 0 hygiene, edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #59 & section 3.9 #3).',
        'createdAt': '2026-11-22T00:00:00.000Z',
        'polity': 'Nomad Country',
    },
]

# ---- Part 4: Political border polygon carve-outs & enclave additions (51-region-store.js) ----
UPDATED_REGION_POINTS = {
    # 1. Region 87 (rmvlp5pd3ug40): pulled east of Shell Province (rmvlqffsaj2v0) & Port Goto (920, 703)
    'rmvlp5pd3ug40': [
        [944, 712], [957, 697], [985, 720], [1013, 751], [1015, 779], [1012, 814], [998, 851],
        [972, 858], [968, 870], [978, 898], [984, 901], [994, 891], [1014, 891], [1019, 880],
        [1044, 892], [1075, 904], [1080, 921], [1093, 912], [1099, 880], [1093, 844], [1094, 815],
        [1101, 790], [1070, 740], [1061, 726], [1067, 698], [1052, 674], [1020, 660], [958, 648],
        [944, 650],
    ],
    # 2. League of Amphitriton (rmuooc7krl9f8): northern Throne edge carved around Zeijani (Dhelv 840,776 & Silbaru 851,774)
    'rmuooc7krl9f8': [
        [684, 865], [687, 816], [712, 781], [701, 743], [718, 710], [742, 705], [776, 711],
        [800, 726], [861, 732], [892, 725], [909, 715], [946, 754], [915, 790], [896, 794],
        [876, 782], [858, 764], [832, 764], [806, 784], [795, 814], [795, 858], [750, 853],
    ],
    # 3. Screamer Country (rmuca1tm8hito): SW vertices pulled east of Dilihan Province (Port Visas 800,712 & Ys 788,741 outside)
    'rmuca1tm8hito': [
        [798, 648], [826, 622], [878, 621], [876, 708], [816, 718], [818, 690],
    ],
    # 4. Talovolci Chiefs (rmuhd0r5n1coe): off Hook peninsula (Y < 995) and off Arcbeam (1016, 1058)
    'rmuhd0r5n1coe': [
        [790, 1126], [737, 1121], [692, 1119], [674, 1083], [729, 1033], [789, 1022],
        [794, 998], [826, 998], [858, 1014], [932, 1058], [975, 1033], [998, 1056],
        [998, 1088], [921, 1163],
    ],
    # 5. Vothic Kingdom (rmw5rzefnfapk): S-Throne coast back to X = 828 (preserving exact 51 vertices for test_smodel.py)
    'rmw5rzefnfapk': [
        [588, 1035], [560, 1065], [550, 1098], [616, 1116], [628, 1138], [633, 1177], [639, 1196],
        [673, 1190], [702, 1171], [722, 1161], [738, 1155], [757, 1149], [788, 1134], [784, 1117],
        [747, 1109], [710, 1105], [696, 1081], [705, 1055], [718, 1049], [739, 1047], [765, 1045],
        [779, 1050], [788, 1034], [787, 1011], [789, 986], [795, 936], [800, 920], [813, 894],
        [824, 897], [828, 900], [828, 890], [823, 885], [810, 867], [800, 849], [797, 832],
        [788, 834], [783, 860], [751, 857], [723, 859], [682, 867], [655, 879], [655, 914],
        [637, 949], [659, 971], [661, 1013], [679, 1027], [680, 1050], [657, 1078], [639, 1081],
        [622, 1071], [626, 1050],
    ],
    # 6-8. Eternal State (rmvg89rejmqat): carve out Yusar enclaves Carcosa (395,812) & Henge (457,735),
    #      extend Farside N border to Y = 515 (Yith 346,418 outside), enclose Bastion (536,627) & Palewharf (565,604)
    'rmvg89rejmqat': [
        [503, 827], [492, 845], [465, 863], [426, 856],
        [416, 796], [378, 796], [360, 846],
        [309, 849], [292, 801], [296, 732], [309, 645], [276, 583],
        [292, 536], [304, 515], [332, 515], [323, 567], [323, 596],
        [391, 585], [427, 595], [441, 606], [461, 614], [497, 599],
        [545, 596], [570, 598], [571, 614], [546, 636], [519, 641],
        [555, 678], [572, 702], [534, 746], [493, 744],
        [478, 720], [442, 720], [442, 752], [478, 752],
        [512, 771], [499, 799],
    ],
    # 9 & 11a. Jimjam (rmv9g32xg2gqt): enclose Skywatch (776,470) & Serai (826,478), trim off Ardent / Free Clans scarp
    'rmv9g32xg2gqt': [
        [702, 566], [655, 498], [685, 480], [750, 476],
        [764, 460], [793, 460], [818, 446], [906, 440],
        [882, 476], [868, 470], [856, 485], [835, 540], [812, 558], [800, 548],
        [795, 521], [789, 525], [779, 549], [766, 574], [746, 583], [717, 572],
    ],
    # 11b. dam 2 (rmuwd2cwvipmq): trim off Ardent / Free Clans scarp
    'rmuwd2cwvipmq': [
        [799, 546], [786, 446], [811, 398], [850, 386], [906, 408], [919, 429],
        [907, 450], [880, 474], [868, 470], [856, 485], [835, 540], [812, 558],
    ],
    # 10. Yeti Kingdom (rmvkkra7o3ep4): enclose Leng (490, 554) & Qoold Lheek (410, 506)
    'rmvkkra7o3ep4': [
        [330, 588], [336, 515], [343, 508], [398, 451], [452, 404], [452, 385],
        [521, 354], [548, 387], [565, 426], [548, 434], [540, 479], [542, 502],
        [522, 530], [504, 562], [478, 564], [457, 555], [418, 587], [394, 583], [348, 590],
    ],
    # 12. Nomad Country (rmucc476rj9ie): trim along E = -700 m rim above East Abyss
    'rmucc476rj9ie': [
        [1177, 885], [1262, 912],
        [1269, 900], [1269, 845], [1275, 815], [1283, 795], [1299, 770], [1298, 755],
        [1284, 745], [1268, 730], [1257, 710], [1234, 695], [1223, 675], [1226, 655],
        [1234, 645], [1243, 633], [1268, 631], [1273, 645], [1281, 648],
        [1297, 656], [1303, 685], [1297, 705], [1313, 735], [1333, 762], [1340, 795],
        [1338, 825], [1332, 848], [1317, 875], [1307, 912],
        [1373, 899], [1386, 706], [1377, 620], [1259, 575],
        [1150, 614], [1125, 645], [1092, 655], [1063, 679],
    ],
}

ADDED_REGIONS = [
    {
        'id': 'rzeijani0001',
        'name': 'Zeijani',
        'color': '#8a6fc9',
        'points': [
            [800, 816], [808, 788], [832, 768], [858, 768], [878, 788], [878, 806],
            [874, 811], [870, 838], [876, 868], [849, 887], [830, 886], [812, 866], [802, 848],
        ],
        'notes': 'Subterranean lava-tube and tuff-chimney realm of the Zeijani on the Throne (Dhelv, Silbaru, Surpu-Dhelv, Qarnu-Tubu, Nuru-Saplu); carved from League of Amphitriton in Wave 0 hygiene (edit_521_wave0_hygiene.py; RING-SEA-SCOPE.md Ruling #28).',
        'kind': 'political',
        'createdAt': '2026-11-22T00:00:00.000Z',
    },
    {
        'id': 'ryusarcarco1',
        'name': 'Yusar (Carcosa)',
        'color': '#6fb5a8',
        'points': [[382, 800], [412, 800], [418, 848], [372, 842]],
        'notes': 'Autonomous western Yusar sanctuary enclave around Carcosa (395, 812); carved out of Eternal State in Wave 0 hygiene (edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #6 & section 3.9 #4).',
        'kind': 'political',
        'createdAt': '2026-11-22T00:00:00.000Z',
    },
    {
        'id': 'ryusarhenge1',
        'name': 'Yusar (Henge)',
        'color': '#6fb5a8',
        'points': [[445, 723], [475, 723], [475, 749], [445, 749]],
        'notes': 'Autonomous eastern Yusar sanctuary enclave around Henge (457, 735); carved out of Eternal State in Wave 0 hygiene (edit_521_wave0_hygiene.py; CONTINENTAL-SCOPE.md Ruling #6 & section 3.9 #4).',
        'kind': 'political',
        'createdAt': '2026-11-22T00:00:00.000Z',
    },
]


def bil(E_arr, x, y):
    x0 = max(0, min(E_arr.shape[1] - 2, int(math.floor(x))))
    y0 = max(0, min(E_arr.shape[0] - 2, int(math.floor(y))))
    fx, fy = x - x0, y - y0
    return float(
        (E_arr[y0, x0] * (1.0 - fx) + E_arr[y0, x0 + 1] * fx) * (1.0 - fy)
        + (E_arr[y0 + 1, x0] * (1.0 - fx) + E_arr[y0 + 1, x0 + 1] * fx) * fy
    )


def poly_len_km(pts):
    return round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])) * 2.0, 1)


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], dtype=float)


def interp_x_at_y(pts, y_val):
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        if y0 <= y_val <= y1:
            t = (y_val - y0) / max(y1 - y0, 1e-9)
            return x0 + t * (x1 - x0)
    return pts[-1][0] if y_val >= pts[-1][1] else pts[0][0]


def priority_fill_with_sinks(E_arr, whas_arr, wlev_arr, box):
    """Depression-fill dry cells in box (y0, y1, x0, x1) draining to box perimeter OR wet lake cells."""
    y0, y1, x0, x1 = box
    S_b = E_arr[y0:y1, x0:x1]
    W_b = whas_arr[y0:y1, x0:x1]
    L_b = wlev_arr[y0:y1, x0:x1]
    H_s, W_s = S_b.shape
    F_b = np.full(S_b.shape, np.inf)
    seen = np.zeros(S_b.shape, bool)
    q = []
    for j in range(H_s):
        for i in range(W_s):
            if W_b[j, i]:
                val = float(L_b[j, i]) + 1.5
                F_b[j, i] = val
                seen[j, i] = True
                heapq.heappush(q, (val, j, i))
            elif j in (0, H_s - 1) or i in (0, W_s - 1):
                val = float(S_b[j, i])
                F_b[j, i] = val
                seen[j, i] = True
                heapq.heappush(q, (val, j, i))
    while q:
        h, j, i = heapq.heappop(q)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                jj, ii = j + a, i + b
                if 0 <= jj < H_s and 0 <= ii < W_s and not seen[jj, ii]:
                    seen[jj, ii] = True
                    nv = max(float(S_b[jj, ii]), h)
                    F_b[jj, ii] = nv
                    heapq.heappush(q, (nv, jj, ii))
    return F_b


def relight_masked(D, Eo, En, mask, keys=('st', 't', 'rt', 'ct')):
    """Directional Lambertian relight restricted strictly to mask before JPEG encode."""
    FH, FW = D['fullH'], D['fullW']
    zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
    EoF, EnF = nd.zoom(Eo, zoom, order=1), nd.zoom(En, zoom, order=1)
    region = nd.binary_dilation(np.abs(EnF - EoF) > 1.0, iterations=3) & mask

    def lam(E_in, zf, az, alt=45.0):
        gy, gx = np.gradient(E_in / 1000.0 * zf, 2.0)
        a, l = np.radians(az), np.radians(alt)
        lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
        return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)

    out, fit_rep = {}, {}
    mfit = nd.binary_dilation(region, iterations=20)
    for k in keys:
        src = Image.open(io.BytesIO(P.base64.b64decode(D[k])))
        im = np.array(src.convert('RGB')).astype(float)
        Lm = im.mean(-1)
        Ll = nd.uniform_filter(Lm, 25) + 1.0
        y = (Lm / Ll - 1.0)[mfit]
        best = None
        for az in range(255, 390, 15):
            for zf in (1, 2, 3, 5, 10):
                so = lam(EoF, zf, az)
                x = (so - nd.uniform_filter(so, 25))[mfit]
                g = float((x * y).sum() / (x * x).sum())
                r = float(np.corrcoef(x, y)[0, 1])
                if best is None or r > best[0]:
                    best = (r, az, zf, g)
        r, az, zf, g = best
        f = np.clip(1.0 + g * (lam(EnF, zf, az) - lam(EoF, zf, az)), 0.55, 1.7)
        res = im.copy()
        res[region] = res[region] * f[region, None]
        q = getattr(src, 'quantization', None)
        out[k] = P.b64(
            Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)),
            'JPEG',
            **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}),
        )
        fit_rep[k] = {'az_deg': az, 'zf': zf, 'gain': round(g, 3), 'corr': round(r, 3)}
    return out, EoF, EnF, fit_rep


def has_self_intersection(pts):
    def ccw(p1, p2, p3):
        return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0])

    def seg_int(a, b, c, d):
        return (ccw(a, c, d) != ccw(b, c, d)) and (ccw(a, b, c) != ccw(a, b, d))

    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            c, d = pts[j], pts[(j + 1) % n]
            if seg_int(a, b, c, d):
                return (i, j)
    return None


def update_settlements_js(En, whas2, codes, cls2, rain2, tm2):
    path = os.path.join(SRC, '60-settlements.js')
    with open(path, 'r', encoding='utf-8') as fh:
        src = fh.read()

    if f"'{SETT_VER}':" in src:
        sys.exit(f'edit_521_wave0_hygiene has run already ({SETT_VER} is in 60-settlements.js)')

    m_def = re.search(r'const defSetts = (\[.*?\]);\n', src)
    assert m_def, 'defSetts array not found in 60-settlements.js'
    def_setts = json.loads(m_def.group(1))

    # 1. Remove duplicate Port  Tobin (skwl1d2hdu)
    before_count = len(def_setts)
    def_setts = [s for s in def_setts if s.get('id') not in REMOVED_SETT_IDS]
    assert len(def_setts) == before_count - len(REMOVED_SETT_IDS), 'Expected skwl1d2hdu to be removed from defSetts'

    by_id = {s['id']: s for s in def_setts}
    moved_records = []
    for sid, spec in MOVED_SPECS.items():
        assert sid in by_id, f'Settlement {sid} missing from defSetts'
        rec = by_id[sid]
        for k, v in spec.items():
            rec[k] = v
        moved_records.append(copy.deepcopy(rec))

    # Verify uniqueness of Bab al-Hawa, Singing Gjar Quartz, and Pit-Head 04
    for uniq_id, exp_px, exp_py in (
        ('gem_godsgate', 1028, 1246),
        ('s57rejd9iv', 1572, 1643),
        ('sk9e4psl4b', 1687, 1555),
    ):
        matches = [s for s in def_setts if s.get('id') == uniq_id]
        assert len(matches) == 1, f'Expected unique {uniq_id}, got {len(matches)}'
        assert (int(matches[0]['px']), int(matches[0]['py'])) == (exp_px, exp_py), f'{uniq_id} coords mismatch'
        assert not whas2[exp_py, exp_px], f'{uniq_id} stands on water at ({exp_px},{exp_py})'

    # 2. Add the 9 newly approved pins
    existing_ids = {s['id'] for s in def_setts}
    added_records = []
    for a in ADDED_SPECS:
        assert len(a['id']) == 10 and a['id'].startswith('s'), f"Bad 10-char settlement id: {a['id']}"
        assert a['id'] not in existing_ids, f"Duplicate settlement id: {a['id']}"
        added_records.append(copy.deepcopy(a))
    def_setts.extend(added_records)

    new_def_line = 'const defSetts = ' + json.dumps(def_setts, ensure_ascii=False) + ';\n'
    out = src[:m_def.start()] + new_def_line + src[m_def.end():]

    # Sync moved entries inside SETT_ADDED['5.1e9'] and SETT_ADDED['5.1e11'] so fresh/old browsers stay consistent
    for ver_key in ('5.1e9', '5.1e11'):
        m_ver = re.search(rf"('{re.escape(ver_key)}':)(\[.*?\])(,\n)", out)
        assert m_ver, f"SETT_ADDED['{ver_key}'] not found in 60-settlements.js"
        arr_v = json.loads(m_ver.group(2))
        for item in arr_v:
            sid = item.get('id')
            if sid in MOVED_SPECS:
                for k, v in MOVED_SPECS[sid].items():
                    item[k] = v
        out = out[:m_ver.start()] + m_ver.group(1) + json.dumps(arr_v, ensure_ascii=False) + m_ver.group(3) + out[m_ver.end():]

    # Append SETT_ADDED['5.1e21']
    m_added_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_ADDED\))', out)
    assert m_added_end, 'end of SETT_ADDED not found in 60-settlements.js'
    added_entry = f",\n    '{SETT_VER}':" + json.dumps(added_records, ensure_ascii=False)
    out = out[:m_added_end.start()] + added_entry + out[m_added_end.start():]

    # Append SETT_MOVED['5.1e21']
    m_moved_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_MOVED\))', out)
    assert m_moved_end, 'end of SETT_MOVED not found in 60-settlements.js'
    moved_entry = f",\n    '{SETT_VER}':" + json.dumps(moved_records, ensure_ascii=False)
    out = out[:m_moved_end.start()] + moved_entry + out[m_moved_end.start():]

    # Add SETT_REMOVED reconcile block right before `renderSett(); drawSettlements();` at bottom of reconcile section
    m_post_moved = re.search(r'(\n  renderSett\(\); drawSettlements\(\);\n\n  \(function\(\)\{ const k=document\.getElementById\(\'settKey\'\);)', out)
    assert m_post_moved, 'post-SETT_MOVED renderSett anchor not found in 60-settlements.js'
    removed_block = (
        f"\n  const SETT_REMOVED={{'{SETT_VER}':{json.dumps(REMOVED_SETT_IDS)}}};\n"
        "  Object.keys(SETT_REMOVED).forEach(v=>{\n"
        "    let done=false; try{ done=localStorage.getItem('krator.settRemoved.'+v)==='1'; }catch(e){}\n"
        "    if(done) return;\n"
        "    SETT_REMOVED[v].forEach(id=>settlements.delete(id));\n"
        "    try{ localStorage.setItem('krator.settRemoved.'+v,'1'); }catch(e){}\n"
        "    settLocalSave();\n"
        "  });"
    )
    out = out[:m_post_moved.start()] + removed_block + out[m_post_moved.start():]

    # Verify dry/drowned/layer rules on all moved + added pins
    gy, gx = np.gradient(En)
    slope = np.hypot(gx, gy) / 2000.0
    dist_wet_km = nd.distance_transform_edt(~whas2) * 2.0
    final_map = {s['id']: s for s in def_setts}
    assert 'skwl1d2hdu' not in final_map

    pin_rep = {'removed': REMOVED_SETT_IDS, 'moved_or_tagged': {}, 'added': {}}
    for sid in list(MOVED_SPECS.keys()) + [a['id'] for a in ADDED_SPECS]:
        st = final_map[sid]
        px, py = int(round(st['px'])), int(round(st['py']))
        is_wet = bool(whas2[py, px])
        if st.get('drowned'):
            assert is_wet, f"Drowned pin {st['name']} ({px},{py}) expected to be in water"
        else:
            assert not is_wet, f"Pin {st['name']} ({px},{py}) stands on water!"
        elev_m = float(En[py, px])
        entry = {
            'id': sid,
            'name': st['name'],
            'type': st['type'],
            'px': [px, py],
            'elev_m': round(elev_m, 1),
            'atm': round(1.6 * math.exp(-elev_m / 8000.0), 2),
            'slope': round(float(slope[py, px]), 3),
            'climate': codes[int(cls2[py, px])],
            'rain_mm': round(float(rain2[py, px])),
            'tm_C': round(float(tm2[py, px]), 1),
            'dist_water_km': round(float(dist_wet_km[py, px]), 1),
            'wet': is_wet,
        }
        if 'drowned' in st:
            entry['drowned'] = st['drowned']
        if 'layer' in st:
            entry['layer'] = st['layer']
        if 'stage' in st:
            entry['stage'] = st['stage']
        if 'polity' in st:
            entry['polity'] = st['polity']
        bucket = 'moved_or_tagged' if sid in MOVED_SPECS else 'added'
        pin_rep[bucket][st['name']] = entry

    return pin_rep, def_setts, (path, out)


def update_regions_js(Eo, En, def_setts):
    path = os.path.join(SRC, '51-region-store.js')
    with open(path, 'r', encoding='utf-8') as fh:
        src = fh.read()

    if f'krator.regMerged.{SETT_VER}' in src:
        sys.exit(f'edit_521_wave0_hygiene has run already (krator.regMerged.{SETT_VER} is in 51-region-store.js)')

    m_def = re.search(r'const defRegs = (\[.*?\]);\n', src)
    assert m_def, 'defRegs array not found in 51-region-store.js'
    def_regs = json.loads(m_def.group(1))
    by_id = {r['id']: r for r in def_regs}

    for rid, new_pts in UPDATED_REGION_POINTS.items():
        assert rid in by_id, f'Region {rid} not found in defRegs'
        si = has_self_intersection(new_pts)
        assert si is None, f'Region {rid} has self-intersection {si}'
        by_id[rid]['points'] = new_pts

    # Preserve test_smodel.py's exact 51-point assertion on Vothic Kingdom
    assert len(by_id['rmw5rzefnfapk']['points']) == 51, 'Vothic Kingdom must retain 51 points'

    for ar in ADDED_REGIONS:
        assert ar['id'] not in by_id, f"Region {ar['id']} already exists in defRegs"
        si = has_self_intersection(ar['points'])
        assert si is None, f"Added region {ar['id']} has self-intersection {si}"
        def_regs.append(copy.deepcopy(ar))
        by_id[ar['id']] = def_regs[-1]

    reconcile_ids = list(UPDATED_REGION_POINTS.keys()) + [ar['id'] for ar in ADDED_REGIONS]
    new_def_line = 'const defRegs = ' + json.dumps(def_regs, ensure_ascii=False) + ';\n'
    out = src[:m_def.start()] + new_def_line + src[m_def.end():]

    m_rec_anchor = re.search(r'(\n    \}catch\(e\)\{\}\n  \}\n  async function save\(r\)\{)', out)
    assert m_rec_anchor, 'localLoad reconcile closing anchor not found in 51-region-store.js'
    rec_block = (
        f"\n      if(localStorage.getItem('krator.regMerged.{SETT_VER}')!=='1'){{   /* {SETT_VER}: Wave 0 polygon hygiene (5 Ring Sea trims + 7 continental carve-outs & Zeijani/Yusar enclaves) */\n"
        f"        {json.dumps(reconcile_ids)}.forEach(id=>{{ const d=defMap.get(id); if(d) regions.set(id,d); }});\n"
        f"        localStorage.setItem('krator.regMerged.{SETT_VER}','1');\n"
        "        localSave();\n"
        "      }"
    )
    out = out[:m_rec_anchor.start()] + rec_block + out[m_rec_anchor.start():]

    # Verify all polygon containments and non-overlaps on full (1723, 1821) grid
    OH, OW = En.shape
    masks = {}
    for r in def_regs:
        if r.get('kind') == 'political' or r['id'] in ('rmuwd2cwvipmq',):
            masks[r['id']] = G.poly(r['points'], 1.0, 1.0, (OH, OW)) > 0.5

    assert masks['rmvlqffsaj2v0'][703, 920] and not masks['rmvlp5pd3ug40'][703, 920], 'Port Goto must be in Shell Province, not Region 87'
    assert int((masks['rmvlqffsaj2v0'] & masks['rmvlp5pd3ug40']).sum()) == 0, 'Shell Province and Region 87 must not overlap'

    assert masks['rzeijani0001'][776, 840] and not masks['rmuooc7krl9f8'][776, 840], 'Dhelv must be in Zeijani, not League'
    assert masks['rzeijani0001'][774, 851] and not masks['rmuooc7krl9f8'][774, 851], 'Silbaru must be in Zeijani, not League'
    for zx, zy in ((806, 818), (834, 882), (876, 802)):
        assert masks['rzeijani0001'][zy, zx], f'Zeijani cavern ({zx},{zy}) must be inside Zeijani'
    for lx, ly in ((788, 741), (744, 784), (701, 838), (762, 805), (884, 737), (919, 762), (898, 787)):
        assert masks['rmuooc7krl9f8'][ly, lx], f'League settlement ({lx},{ly}) must stay inside League'
    for nb in ('rmuooc7krl9f8', 'rmw5rzefnfapk', 'r_gem_andaru', 'rmwek559wleuj'):
        assert int((masks['rzeijani0001'] & masks[nb]).sum()) == 0, f'Zeijani overlaps {nb}'

    assert not masks['rmuca1tm8hito'][712, 800] and not masks['rmuca1tm8hito'][741, 788], 'Port Visas & Ys must be outside Screamer Country'
    assert masks['rmuca1tm8hito'][670, 817] and masks['rmuca1tm8hito'][693, 863], 'Hexahedron & Fort Kalor must stay inside Screamer Country'

    assert not masks['rmuhd0r5n1coe'][923, 809], 'Hook must be outside Talovolci Chiefs'
    assert masks['rmuhd0r5n1coe'][1017, 800] and masks['rmuhd0r5n1coe'][1068, 937], 'Spirladunon & Daridel must be inside Talovolci Chiefs'
    assert masks['rmukx6bccnznf'][1058, 1016] and not masks['rmuhd0r5n1coe'][1058, 1016], 'Arcbeam must be in Empire of Iziz, not Talovolci'

    assert not masks['rmw5rzefnfapk'][897, 848], 'Tauranga-Hikau (848, 897) must be outside Vothic Kingdom'
    assert masks['rmw5rzefnfapk'][860, 795] and masks['rmw5rzefnfapk'][1129, 705], 'Zeydanin & Driyan must be inside Vothic Kingdom'

    assert masks['ryusarcarco1'][812, 395] and not masks['rmvg89rejmqat'][812, 395], 'Carcosa must be in Yusar enclave, outside Eternal State'
    assert masks['ryusarhenge1'][735, 457] and not masks['rmvg89rejmqat'][735, 457], 'Henge must be in Yusar enclave, outside Eternal State'
    assert int(((masks['ryusarcarco1'] | masks['ryusarhenge1']) & (masks['rmvg89rejmqat'] | masks['rmufxti8qwcxy'])).sum()) == 0

    for ex, ey in ((536, 627), (565, 604), (498, 644), (486, 837), (448, 838), (368, 776), (520, 693), (409, 621), (294, 588)):
        assert masks['rmvg89rejmqat'][ey, ex], f'Eternal State settlement ({ex},{ey}) must be inside Eternal State'
    assert masks['rmvg89rejmqat'][516, 315] and not masks['rmvg89rejmqat'][513, 315], 'Farside northern border must stand at Y = 515'
    assert not masks['rmvg89rejmqat'][418, 346], 'Yith (346, 418) must remain independent outside Eternal State'
    assert int((masks['rmvg89rejmqat'] & masks['rmufxti8qwcxy']).sum()) == 0, 'Eternal State must not overlap Iron Republic'

    assert masks['rmv9g32xg2gqt'][470, 776] and masks['rmv9g32xg2gqt'][478, 826], 'Skywatch & Serai must be inside Jimjam'
    assert masks['rmumc5ov15a8k'][553, 830] and not masks['rmv9g32xg2gqt'][553, 830] and not masks['rmuwd2cwvipmq'][553, 830], 'Ardent must sit solely in Free Clans'
    assert int((masks['rmv9g32xg2gqt'] & masks['rmumc5ov15a8k']).sum()) == 0, 'Jimjam must not overlap Free Clans'
    assert int((masks['rmuwd2cwvipmq'] & masks['rmumc5ov15a8k']).sum()) == 0, 'dam 2 must not overlap Free Clans'

    assert masks['rmvkkra7o3ep4'][554, 490] and masks['rmvkkra7o3ep4'][506, 410], 'Leng & Qoold Lheek must be inside Yeti Kingdom'
    assert int((masks['rmvkkra7o3ep4'] & masks['rmvg89rejmqat']).sum()) == 0, 'Yeti Kingdom must not overlap Eternal State'

    for nx, ny in ((1276, 639), (1225, 646), (1165, 652), (1085, 683), (1270, 745), (1190, 671), (1243, 844), (1333, 886)):
        assert masks['rmucc476rj9ie'][ny, nx], f'Nomad Country settlement ({nx},{ny}) must stay inside Nomad Country'
    for ax, ay in ((1285, 655), (1282, 663), (1280, 678), (1297, 683), (1311, 761), (1316, 797), (1322, 828)):
        assert not masks['rmucc476rj9ie'][ay, ax], f'East Abyss settlement ({ax},{ay}) must be carved out of Nomad Country'

    reg_rep = {
        'updated_regions': {rid: {'name': by_id[rid]['name'], 'vertices': len(pts), 'km2': int(masks[rid].sum()) * 4}
                            for rid, pts in UPDATED_REGION_POINTS.items()},
        'added_regions': {ar['id']: {'name': ar['name'], 'vertices': len(ar['points']), 'km2': int(masks[ar['id']].sum()) * 4}
                          for ar in ADDED_REGIONS},
        'nomad_country_cells_below_minus_700m': int((masks['rmucc476rj9ie'] & (Eo < -700.0)).sum()),
    }
    return reg_rep, (path, out)


def main():
    D = P.load()
    if any(b.get('id') in ('B_korona_sodalake', 'B_ea_reed') for b in D.get('basins', [])):
        sys.exit('edit_521_wave0_hygiene has run already (B_korona_sodalake / B_ea_reed are in DATA.basins)')

    rep = {
        'edit': '5.1 edit 21 (Wave 0 Pre-Build Hygiene Batch: East Abyss +900 m lift, Soda Lake S tongue, pin nudges/adds, polygon carve-outs)',
        'version_tag': SETT_VER,
        'date': '2026-11-22',
        'dry_run': DRY,
    }

    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    assert Eo.shape == (D['fullH'], D['fullW']), '5.1 height grid must match full grid'
    OH, OW = Eo.shape
    yy, xx = np.mgrid[0:OH, 0:OW].astype(float)
    codes = [c['code'] for c in D['climate']['classes']]

    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    jpeg0 = {k: D[k] for k in ('st', 't', 'rt', 'ct')}
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    ea_mask = (xx >= EA_BOX[2]) & (xx < EA_BOX[3]) & (yy >= EA_BOX[0]) & (yy < EA_BOX[1])
    kor_mask = (xx >= KOR_BOX[2]) & (xx < KOR_BOX[3]) & (yy >= KOR_BOX[0]) & (yy < KOR_BOX[1])
    edit_mask = ea_mask | kor_mask

    En = Eo.copy()
    water2 = water0.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()

    # ---- 1a. Northern East Abyss +900 m Floor Lift (Ruling #43) ----
    w_ea = (
        G.sstep(1210.0, 1222.0, xx)
        * (1.0 - G.sstep(1342.0, 1355.0, xx))
        * G.sstep(610.0, 624.0, yy)
        * (1.0 - G.sstep(851.5, 861.5, yy))
    )
    w_ea[~ea_mask] = 0.0
    deep_ea = (Eo < -1000.0) & (w_ea > 0.0)
    En[deep_ea] = Eo[deep_ea] + w_ea[deep_ea] * 0.4375 * (-1000.0 - Eo[deep_ea])

    w_lbl0, _ = nd.label(whas0, structure=np.ones((3, 3), dtype=int))
    lifted_lake_levels = {}
    lifted_lakes_rep = []
    for lbl in np.unique(w_lbl0[(w_ea > 0.01) & whas0]):
        if lbl == 0:
            continue
        lm = w_lbl0 == lbl
        lw0 = float(np.nanmedian(wlev0[lm]))
        if lw0 >= -1000.0:
            continue
        assert not (lm & ~ea_mask).any(), f'East Abyss lake lbl={lbl} extends outside ea_mask'
        wm = float(np.median(w_ea[lm]))
        lw1 = lw0 + wm * 0.4375 * (-1000.0 - lw0)
        wlev2[lm] = lw1
        dep0 = np.maximum(lw0 - Eo[lm], 1.5)
        En[lm] = lw1 - dep0 * (1.0 - 0.4375 * wm)
        shore = nd.binary_dilation(lm, structure=np.ones((3, 3), dtype=bool)) & (~whas2) & ea_mask & (Eo >= lw0)
        En[shore] = np.maximum(En[shore], lw1 + 1.0)
        lifted_lake_levels[int(lbl)] = (lw0, lw1, lm)
        lifted_lakes_rep.append({
            'lbl': int(lbl),
            'cells': int(lm.sum()),
            'km2': int(lm.sum()) * 4,
            'before_wlev_m': round(lw0, 2),
            'after_wlev_m': round(lw1, 2),
        })

    # Verify zero newly introduced dry pits in East Abyss relative to pre-edit drainage
    F_ea_old = priority_fill_with_sinks(Eo, whas0, wlev0, EA_BOX)
    F_ea_new = priority_fill_with_sinks(En, whas2, wlev2, EA_BOX)
    y0_e, y1_e, x0_e, x1_e = EA_BOX
    old_pit = (F_ea_old - Eo[y0_e:y1_e, x0_e:x1_e]) > 1.0
    new_pit = (F_ea_new - En[y0_e:y1_e, x0_e:x1_e]) > 1.0
    added_ea_pits = new_pit & (~old_pit) & (~whas2[y0_e:y1_e, x0_e:x1_e]) & (w_ea[y0_e:y1_e, x0_e:x1_e] > 0.0)
    if added_ea_pits.any():
        En_sub = En[y0_e:y1_e, x0_e:x1_e]
        En_sub[added_ea_pits] = F_ea_new[added_ea_pits]

    # Assert southern East Abyss settlements are 0.0 m changed
    for s_nm, sx, sy in (('Lower Verge', 1268, 949), ('Yuni North', 1268, 994), ('Locus', 1267, 1043)):
        assert float(En[sy, sx]) == float(Eo[sy, sx]), f'{s_nm} ({sx},{sy}) changed elevation!'

    rep['east_abyss_lift'] = {
        'formula': "e' = -1000 + 0.5625 * (e + 1000) for e < -1000, tapered across dry horst sill Y = 851.5..861.5",
        'lifted_cells': int((np.abs(En[ea_mask] - Eo[ea_mask]) > 0.05).sum()),
        'lifted_lakes_count': len(lifted_lakes_rep),
        'lifted_lakes': lifted_lakes_rep,
        'benchmarks': {},
    }
    for b_nm, bx, by in (
        ('Tabist town', 1285, 655),
        ('Sfenops', 1282, 663),
        ('Reed', 1280, 678),
        ('Reed upriver', 1297, 683),
        ('Furrow', 1276, 639),
        ('Middle Tabisti', 1311, 761),
        ('Liikofi', 1316, 797),
        ('Mungo', 1322, 828),
        ('Lower Verge', 1268, 949),
        ('Yuni North', 1268, 994),
        ('Locus', 1267, 1043),
    ):
        el_b = float(Eo[by, bx])
        el_a = float(En[by, bx])
        rep['east_abyss_lift']['benchmarks'][b_nm] = {
            'px': [bx, by],
            'before_m': round(el_b, 1),
            'after_m': round(el_a, 1),
            'delta_m': round(el_a - el_b, 1),
            'atm_after': round(1.6 * math.exp(-el_a / 8000.0), 2),
            'wet': bool(whas2[by, bx]),
            'wlev_after_m': round(float(wlev2[by, bx]), 1) if whas2[by, bx] else None,
        }

    # ---- 1b. Silkhead Southern Lake-Tongue Extension (lbl=54, Ruling #56) ----
    lbl54_id = int(w_lbl0[425, 932])
    assert lbl54_id > 0, 'Soda Lake (lbl=54) not found at (932, 425)'
    m54_orig = w_lbl0 == lbl54_id
    wlev_54 = float(np.nanmedian(wlev0[m54_orig]))
    wl_rgb_54 = raw0['wl'][425, 932].copy()

    tongue_mask = np.zeros((OH, OW), dtype=bool)
    for bx_c, by_c in ((915, 487), (916, 488), (913, 491), (914, 492)):
        tongue_mask[by_c, bx_c] = True
        En[by_c, bx_c] = min(En[by_c, bx_c], wlev_54 - 22.0)
    for y_row in range(492, 532):
        xc = interp_x_at_y(KORONA_TONGUE_PTS, float(y_row))
        s_frac = (y_row - 492.0) / 39.0
        max_dep = 52.0 - 22.0 * (s_frac ** 1.6)  # ~52 m below surface in north, ~30 m at southern lake-head
        for x_col in range(911, 915):
            dx = abs(float(x_col) - xc)
            if dx <= 1.15:
                tongue_mask[y_row, x_col] = True
                prof = max(0.30, 1.0 - (dx / 1.35) ** 2)
                bed_target = wlev_54 - max_dep * prof
                En[y_row, x_col] = min(En[y_row, x_col], bed_target)

    # Guarantee wet port approach at (912, 531) and (913, 531), and dry harbour bench at Port Koron (912, 532)
    assert tongue_mask[531, 912] and tongue_mask[531, 913], 'Lake-head wet cells (912..913, 531) must be wet'
    whas2[tongue_mask] = True
    wlev2[tongue_mask] = wlev_54
    water2[tongue_mask] = True

    # Dry harbour bench at Y = 532 and smooth valley ramp Y = 532..537 up to existing +146.6 m at Y = 538
    whas2[532, 911:915] = False
    wlev2[532, 911:915] = np.nan
    water2[532, 911:915] = False
    ramp_targets = {
        532: {911: -28.0, 912: -42.0, 913: -38.0, 914: -24.0},
        533: {911: -4.0,  912: -18.0, 913: -14.0, 914: 2.0},
        534: {911: 26.0,  912: 12.0,  913: 15.0,  914: 32.0},
        535: {911: 58.0,  912: 46.0,  913: 49.0,  914: 66.0},
        536: {911: 90.0,  912: 80.0,  913: 82.0,  914: 98.0},
        537: {911: 122.0, 912: 112.0, 913: 114.0, 914: 128.0},
    }
    for ry, row_map in ramp_targets.items():
        for rx, r_el in row_map.items():
            En[ry, rx] = r_el

    # Ensure lateral shore banks around tongue stand cleanly above wlev_54 (-59.8 m)
    kor_shore = nd.binary_dilation(tongue_mask, structure=np.ones((3, 3), dtype=bool)) & (~whas2) & kor_mask
    En[kor_shore] = np.maximum(En[kor_shore], -44.0)
    En[532, 912] = -42.0  # Exact dry harbour bench at Port Koron (~17.8 m above -59.8 m lake)

    # Fill any dry depression inside KOR_BOX draining to tongue_mask
    F_kor = priority_fill_with_sinks(En, whas2, wlev2, KOR_BOX)
    yk0, yk1, xk0, xk1 = KOR_BOX
    kor_dry_pit = (F_kor - En[yk0:yk1, xk0:xk1]) > 0.5
    kor_dry = (~whas2[yk0:yk1, xk0:xk1]) & kor_dry_pit
    if kor_dry.any():
        En_ksub = En[yk0:yk1, xk0:xk1]
        En_ksub[kor_dry] = F_kor[kor_dry]

    # Verify single 4-connected water component from Silkhead shore (932, 425) to lake-head (912, 531)
    w_lbl4, _ = nd.label(whas2, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=int))
    assert w_lbl4[425, 932] == w_lbl4[531, 912], 'Extended Soda Lake tongue must be 4-connected to main Soda Lake!'
    assert not whas2[532, 912], 'Port Koron (912, 532) must be dry shore!'

    w_lbl2, _ = nd.label(whas2, structure=np.ones((3, 3), dtype=int))
    m54_new = w_lbl2 == w_lbl2[425, 932]
    tongue_new_water = tongue_mask & (~whas0)

    rep['korona_sodalake_extension'] = {
        'lake_wlev_m': round(wlev_54, 2),
        'orig_cells': int(m54_orig.sum()),
        'orig_km2': int(m54_orig.sum()) * 4,
        'added_tongue_cells': int(tongue_new_water.sum()),
        'added_tongue_km2': int(tongue_new_water.sum()) * 4,
        'new_total_cells': int(m54_new.sum()),
        'new_total_km2': int(m54_new.sum()) * 4,
        'port_koron_px': [912, 532],
        'port_koron_elev_m': round(float(En[532, 912]), 1),
        'lakehead_wet_px': [912, 531],
        'lakehead_bed_m': round(float(En[531, 912]), 1),
        'four_connected_to_silkhead_verified': True,
    }

    # ---- 2. Update East Abyss rivers and Korona river r045 ----
    ea_rivers_updated = []
    for r in D['rivers']:
        pts = r.get('px') or []
        if not pts:
            continue
        if r['id'] == 'r045':
            # Trim Sing-Ham (r045) to discharge cleanly at [912.5, 532.0] -> [912.5, 531.0] into extended lbl=54
            kept_pts = [p for p in pts if p[1] >= 534.0]
            kept_beds = list(r['bed_m'][:len(kept_pts)])
            new_tail_pts = [[912.6, 533.0], [912.5, 532.0]]
            new_tail_beds = [-20.0, -58.5]
            r['px'] = kept_pts + new_tail_pts
            beds = kept_beds + new_tail_beds
            for i in range(1, len(beds)):
                if beds[i] >= beds[i - 1]:
                    beds[i] = round(beds[i - 1] - 0.5, 1)
            r['bed_m'] = [round(float(b), 1) for b in beds]
            r['source_m'] = r['bed_m'][0]
            r['mouth_m'] = r['bed_m'][-1]
            r['length_km'] = poly_len_km(r['px'])
            r['to'] = {'lake_m': -60, 'at_px': [912.5, 531.0]}
            r['settlements'] = ['Port Koron']
            continue

        if r['id'] == 'r281' and len(pts) > 1 and pts[1] == [578.5, 857.5]:
            pts[1] = [578.0, 857.0]
            r['length_km'] = poly_len_km(pts)
            continue
        if r['id'] == 'r092' and len(pts) > 8 and pts[8] == [560.4, 766.6]:
            pts[8] = [561.0, 767.0]
            r['length_km'] = poly_len_km(pts)
            continue

        # Check if river enters East Abyss lift envelope
        if any(EA_BOX[2] <= p[0] < EA_BOX[3] and EA_BOX[0] <= p[1] < EA_BOX[1] for p in pts):
            beds = list(r.get('bed_m') or [])
            changed_r = False
            for i, (px_r, py_r) in enumerate(pts):
                ix = min(OW - 1, max(0, int(round(px_r))))
                iy = min(OH - 1, max(0, int(round(py_r))))
                w_here = float(w_ea[iy, ix])
                if w_here > 0.0 and i < len(beds) and beds[i] < -1000.0:
                    beds[i] = beds[i] + w_here * 0.4375 * (-1000.0 - beds[i])
                    changed_r = True
            if changed_r:
                for i in range(1, len(beds)):
                    if beds[i] > beds[i - 1]:
                        beds[i] = beds[i - 1]
                r['bed_m'] = [round(float(b), 1) for b in beds]
                r['source_m'] = r['bed_m'][0]
                r['mouth_m'] = r['bed_m'][-1]

            to_obj = r.get('to') or {}
            if to_obj.get('lake_m') is not None and to_obj.get('at_px'):
                tx = min(OW - 1, max(0, int(round(to_obj['at_px'][0]))))
                ty = min(OH - 1, max(0, int(round(to_obj['at_px'][1]))))
                lbl_hit = int(w_lbl0[ty, tx])
                if lbl_hit == 0:
                    # Check 3x3 neighborhood around at_px
                    sub_lbl = w_lbl0[max(0, ty - 1):min(OH, ty + 2), max(0, tx - 1):min(OW, tx + 2)]
                    nz = sub_lbl[sub_lbl > 0]
                    if nz.size:
                        lbl_hit = int(nz[0])
                if lbl_hit in lifted_lake_levels:
                    _, lw1, _ = lifted_lake_levels[lbl_hit]
                    to_obj['lake_m'] = int(round(lw1))
                    changed_r = True
            if changed_r:
                ea_rivers_updated.append(r['id'])

    rep['rivers_updated'] = {
        'korona_river': 'r045',
        'east_abyss_rivers_count': len(ea_rivers_updated),
        'east_abyss_rivers': ea_rivers_updated,
    }

    # ---- 3. Climate & temperature recomputation strictly inside edit_mask ----
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2=whas2, wlev2=wlev2)
    T = {k: P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90.0 for k in C.TEMPS}

    south_arm_54 = m54_orig & (yy >= 475)
    for k in C.TEMPS:
        T[k][tongue_new_water] = float(np.median(raw0[k][south_arm_54].astype(float) - 90.0))

    # Guarantee th >= tw and tl <= tc on all land cells inside edit_mask (test_smodel.py line 575)
    land_edit = edit_mask & (~whas2) & (T['tm'] > -89.0)
    T['th'][land_edit] = np.maximum(T['th'][land_edit], T['tw'][land_edit])
    T['tl'][land_edit] = np.minimum(T['tl'][land_edit], T['tc'][land_edit])

    for k in C.TEMPS:
        T_u8 = np.clip(np.round(T[k]) + 90.0, 0, 255).astype(np.uint8)
        T_u8[~edit_mask] = raw0[k][~edit_mask]
        D[k] = P.b64(Image.fromarray(T_u8, 'L'), optimize=True)

    rain2, cls2, zon2, _, crep = C.reclimate(D, Eo, En, whas2, tongue_new_water)
    rain0 = raw0['p'].astype(float) / 255.0 * 4000.0
    rain2[tongue_new_water] = float(np.median(rain0[south_arm_54]))
    cls2[tongue_new_water] = codes.index('WS')
    zon2[tongue_new_water] = 4

    p_u8 = np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8)
    p_u8[~edit_mask] = raw0['p'][~edit_mask]
    cls2 = cls2.astype(np.uint8)
    cls2[~edit_mask] = raw0['c'][~edit_mask]
    zon2 = zon2.astype(np.uint8)
    zon2[~edit_mask] = raw0['z'][~edit_mask]
    rep['reclimate'] = crep

    # ---- 4. Encode rasters and repaint / relight / retint JPEGs strictly inside edit_mask ----
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)

    h_now = P.raster(D, 'h')
    h_now[~edit_mask] = raw0['h'][~edit_mask]
    D['h'] = P.b64(Image.fromarray(h_now, 'RGB'), optimize=True)

    wl_now = P.raster(D, 'wl')
    wl_now[tongue_mask] = wl_rgb_54
    wl_now[~edit_mask] = raw0['wl'][~edit_mask]
    D['wl'] = P.b64(Image.fromarray(wl_now, 'RGB'), optimize=True)

    D['p'] = P.b64(Image.fromarray(p_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    cnow = P.raster(D, 'c', 'L')
    tm_now = P.raster(D, 'tm', 'L').astype(float) - 90.0

    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), (np.abs(rain_now - rain0) > 1.0) & edit_mask)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], (cnow != raw0['c']) & edit_mask)

    relit, EoF, EnF, relight_rep = relight_masked(D, Eo, En, edit_mask)
    for k, v in relit.items():
        D[k] = v
    for k in ('rt', 'ct'):
        arr_k = P.raster(D, k)
        arr_k[~edit_mask] = raw0[k][~edit_mask]
        D[k] = P.jpeg_like({k: jpeg0[k]}, k, arr_k)
    rep['relight'] = relight_rep

    moved = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    near = nd.binary_dilation(moved, iterations=3) & edit_mask
    donor_54 = south_arm_54 & (nd.distance_transform_edt(m54_orig) > 1.5)
    if not donor_54.any():
        donor_54 = south_arm_54

    for k in ('st', 't'):
        a0 = P.raster(D, k)
        a = PA.retint(a0, EoF, EnF, near & (~tongue_new_water) & (~whas2), (~near) & (~whas0), 150.0)
        af = a.astype(float)
        lum = af.mean(-1)
        det = np.clip((lum + 4.0) / (nd.gaussian_filter(lum, 3.0) + 4.0), 0.88, 1.12)[..., None]
        tgt = np.median(raw0[k][donor_54], axis=0)
        wgt = np.clip(nd.gaussian_filter(tongue_new_water.astype(float), 0.65) * 1.35, 0.0, 1.0)[..., None] * kor_mask[..., None]
        af = np.clip(af * (1.0 - wgt) + tgt * det * wgt, 0.0, 255.0)
        merged = af.round().astype(np.uint8)
        merged[~edit_mask] = raw0[k][~edit_mask]
        D[k] = P.jpeg_like({k: jpeg0[k]}, k, merged)

    # ---- 5. Update basins.json and climate.present ----
    added_basins = [
        {
            'id': 'B_korona_sodalake',
            'name': 'Soda Lake (Silkhead)',
            'at_px': [912.0, 520.0],
            'level_m': int(round(wlev_54)),
            'km2': int(m54_new.sum()) * 4,
            'depth_m': int(round(float(wlev_54 - En[m54_new].min()))),
            'kind': 'salt lake',
            'climate': 'BSh',
            'region': 'rmuqm3urh0mo6',
            'notes': 'Endorheic Korona soda lake (-60 m); southern finger extended ~80 km down X=911..914 to Port Koron (912, 532) in edit_521_wave0_hygiene (CONTINENTAL-SCOPE.md Ruling #56).',
        },
    ]
    for bid, bname, blbl, bclim in (
        ('B_ea_sarab', 'Sarab West Sump', 105, 'BWh'),
        ('B_ea_reed', 'Reed Lake', 111, 'BWh'),
        ('B_ea_mid_sump', 'Middle Abyss Sump', 131, 'BWh'),
        ('B_ea_liikofi', 'Liikofi-Rih Lake', 137, 'BWh'),
        ('B_ea_mungo', 'Mungo-Milh Lake', 142, 'BWh'),
    ):
        if blbl in lifted_lake_levels:
            _, lw1, lm = lifted_lake_levels[blbl]
            ly, lx = np.nonzero(lm)
            mx, my = float(np.median(lx)), float(np.median(ly))
            k_best = int(np.argmin(np.hypot(lx - mx, ly - my)))
            added_basins.append({
                'id': bid,
                'name': bname,
                'at_px': [round(float(lx[k_best]), 1), round(float(ly[k_best]), 1)],
                'level_m': int(round(lw1)),
                'km2': int(lm.sum()) * 4,
                'depth_m': int(round(float(lw1 - En[lm].min()))),
                'kind': 'salt lake',
                'climate': bclim,
                'region': 'rmuqltx63f4do',
                'notes': 'Northern/central East Abyss terminal salt sump lifted into livable 1.90-1.99 atm air in edit_521_wave0_hygiene (CONTINENTAL-SCOPE.md Ruling #43).',
            })
    D['basins'] = list(D.get('basins', [])) + added_basins
    rep['basins_added'] = [b['id'] for b in added_basins]

    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 6. Verify river monotonicity, climb <= 50 m, and th/tl invariants ----
    max_riv_climb = 0.0
    worst_riv = None
    for r in D['rivers']:
        b_m = r.get('bed_m') or []
        assert not any(b2 > b1 + 1e-6 for b1, b2 in zip(b_m, b_m[1:])), f"Non-monotonic bed_m in {r['id']}"
        pts_r = r.get('px') or []
        if len(pts_r) >= 2:
            es_r = [float(En[min(OH - 1, max(0, int(round(py_r)))), min(OW - 1, max(0, int(round(px_r))))]) for px_r, py_r in pts_r]
            m_e = es_r[0]
            for e_v in es_r:
                if e_v < m_e:
                    m_e = e_v
                if e_v - m_e > max_riv_climb:
                    max_riv_climb = e_v - m_e
                    worst_riv = r.get('id')
    assert max_riv_climb <= 50.0, f'River climb {max_riv_climb:.1f} m > 50 m on {worst_riv}'

    T15 = {k: P.raster(D, k, 'L').astype(int) - 90 for k in ('tm', 'th', 'tl', 'tw', 'tc')}
    land15 = (~whas2) & (cnow != codes.index('O')) & (T15['tm'] > -89)
    bad15 = land15 & ((T15['th'] <= -89) | (T15['tl'] <= -89) | (T15['th'] < T15['tw']) | (T15['tl'] > T15['tc']))
    assert int(bad15.sum()) == 0, f'Temperature th/tl invariant violated on {int(bad15.sum())} land cells!'

    # ---- 7. Update 60-settlements.js and 51-region-store.js ----
    pin_rep, def_setts, sett_write = update_settlements_js(En, whas2, codes, cnow, rain_now, tm_now)
    reg_rep, reg_write = update_regions_js(Eo, En, def_setts)
    rep['settlements'] = pin_rep
    rep['regions'] = reg_rep

    # ---- 8. Strict byte-identity verification outside edit_mask ----
    outside = ~edit_mask
    out_of_mask_diffs = {}
    inside_diffs = {}
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], axis=-1)
        out_cnt = int((diff & outside).sum())
        in_cnt = int((diff & edit_mask).sum())
        out_of_mask_diffs[k] = out_cnt
        inside_diffs[k] = in_cnt
        assert out_cnt == 0, f'STRICT MASK VIOLATION: {k} changed on {out_cnt} pixels outside edit_mask!'

    rep['strict_mask_check'] = {
        'outside_edit_mask_pixels_changed': out_of_mask_diffs,
        'inside_edit_mask_pixels_changed': inside_diffs,
        'zero_outside_diff_verified': True,
        'max_river_climb_m': round(max_riv_climb, 2),
        'worst_river_climb_id': worst_riv,
        'bad_th_tl_land_cells': int(bad15.sum()),
    }

    far = ~nd.binary_dilation(edit_mask, structure=np.ones((3, 3), dtype=bool), iterations=17)
    for k in ('st', 't', 'rt', 'ct'):
        b = P.jpeg_like({k: jpeg0[k]}, k, raw0[k])
        ref = P.raster({k: b}, k).astype(int)
        now = P.raster(D, k).astype(int)
        assert bool((now[far] == ref[far]).all()), f'{k} changed away from edit_mask beyond JPEG 1-pass codec re-encoding'

    if DRY:
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return

    P.save(D)
    for out_path, out_text in (sett_write, reg_write):
        with open(out_path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(out_text)
    rep_path = os.path.join(HERE, 'edit_521_wave0_hygiene.report.json')
    with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
