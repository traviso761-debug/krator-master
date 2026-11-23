#!/usr/bin/env python3
"""Scale model 5.1, edit 20 (2026-11-22): The Crook impact-crater & dendritic fluvial pass + Dzagh-Vardzi & Hueru-Kuran seats.

    python3 tools/scale-model/edit_520_crook.py --preview-map <out.png>   # fast 3s terrain+river preview, nothing written
    python3 tools/scale-model/edit_520_crook.py --dry-run                 # full climate/paint/invariant check, nothing written
    python3 tools/scale-model/edit_520_crook.py                           # edits model/data & 60-settlements.js

What it does (owner decisions, CROOK-RIA-DECISIONS.md sections 1.1, 1.3, 1.6):
1. Crookshore's Four Drowned Secondary-Ejecta Impact Craters:
   - Reshapes Crookshore's bays and headlands into the four canonical drowned ejecta calderas with steep +95..+175 m
     basalt/tuff rim collars (above the +65 m tsunami scour bench) and narrow breached seaward/sound throats:
       (a) The Eye / Sentry-Caldera (104, 562; ~10 km across, -65 m floor, WNW breach),
       (b) Kopa-North (89, 604; ~13 km across, -95 m floor, WNW breach + prow wave-splitter record),
       (c) Kopa-South / Whale-Haven (81, 677; ~15 km across, -110 m floor, linked north via Kopa Strait),
       (d) Cascade-Caldera / Kopa-Tarn Mouth (123, 659; ~11 km across, -80 m floor, N breach; receives 9105 Kopa-Tarn Warra).
2. Dendritic Rain-Fed Tributary Network, Strike-Valley Doglegs & V-Gorge Erosion (+23 perennial rivers/forks, 9111..9133):
   - Routes every tributary via least-cost Dijkstra pathfinding over real mountain topography + multi-scale bedrock
     jointing potential, producing genuine winding strike-valley doglegs, bedrock elbows, and Y-branched 1st-order
     headwater forks (never straight E-W lines).
   - Carves incised valley amphitheaters, hanging-valley Flume-Gate gorge mouths, and sinuous interfluve spurs.
3. Settlements (model/src/60-settlements.js):
   - Places the 7 disunited Dzagh-Vardzi petty valley-kingdom seats (K1-K7: Khāi-Gēti, Rēd-Spāiri, Tīn-Flītsi,
     Āirn-Dzāghi, Rōzi-Vārdzi, Mīst-Khōpri, Dzēdi-Khrōsi) at real dendritic confluences/bends, the neutral confluence
     DV3 flume-forge hamlet Flūmi-Brīdzi, 2 Hueru-Kuran Nuraghe crater-rim villages (Kōpa-Hueru, Kāskēdi-Kuran),
     and renames svd298453u Yith -> Yonni.
"""
import heapq, json, math, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
DRY = '--dry-run' in sys.argv
PREVIEW_PNG = sys.argv[sys.argv.index('--preview-map') + 1] if '--preview-map' in sys.argv else None
MARGIN_PX = 4

# ---- 1. Crookshore's Four Drowned Secondary-Ejecta Impact Craters (5.1 px, 2 km/px)
CRATERS = [
    dict(id='lf_crook_eye', name='The Eye (Sentry-Caldera)', cx=104.0, cy=562.0, r_w=2.4, r_rim=4.2, r_out=6.8,
         floor_m=-65.0, rim_m=142.0, breach_az=275.0, breach_hw=24.0, breach_len=8.0, throat_m=-30.0,
         inlet_az=None, note='Northernmost drowned secondary-ejecta sentry caldera (~9.6 km water bowl, -65 m floor, +142 m basalt collar) breached WNW toward Steaming Seamounts.'),
    dict(id='lf_crook_kopa_north', name='Kopa-North Crater', cx=89.0, cy=604.0, r_w=3.1, r_rim=5.0, r_out=8.0,
         floor_m=-95.0, rim_m=158.0, breach_az=301.0, breach_hw=22.0, breach_len=8.5, throat_m=-38.0,
         inlet_az=192.0, inlet_hw=18.0, inlet_m=-36.0,
         note='Northern whale-slipway drowned ejecta caldera (~12.4 km bowl, -95 m floor, +158 m rim), guarded across its seaward throat by a cyclopean basalt wave-splitter.'),
    dict(id='lf_crook_kopa_south', name='Kopa-South (Whale-Haven)', cx=81.0, cy=677.0, r_w=3.6, r_rim=5.6, r_out=11.8,
         floor_m=-110.0, rim_m=168.0, breach_az=10.0, breach_hw=20.0, breach_len=11.5, throat_m=-44.0,
         inlet_az=None, trim_bay=True,
         note='Enclosed deep calving and Hueru-Kuran Nuraghe haven (~14.4 km bowl, -110 m floor, +168 m basalt/tuff collar), breached north via the Kopa Strait into Kopa-North.'),
    dict(id='lf_crook_cascade_caldera', name='Cascade-Caldera (Kopa-Tarn Mouth)', cx=123.0, cy=659.0, r_w=2.7, r_rim=4.5, r_out=7.2,
         floor_m=-80.0, rim_m=148.0, breach_az=355.0, breach_hw=25.0, breach_len=7.5, throat_m=-38.0,
         inlet_az=194.0, inlet_hw=18.0, inlet_m=2.0,
         note='Drowned ejecta caldera at the mouth of Kopa-Tarn Warra (~10.8 km bowl, -80 m floor, +148 m rim); hub of Hueru-Kuran water-powered nephrite pendulum wire-saws.'),
]

KOPA_STRAIT = [(81.5, 674.0), (84.2, 658.0), (83.0, 642.0), (86.8, 624.0), (89.0, 604.0), (81.5, 600.5), (73.5, 595.0)]

# ---- 2. Dendritic Rain-Fed Tributary Systems (15 Primary Lateral Rivers + 8 Branched 1st-Order Forks = 23 Rivers)
# Waypoints feature genuine oblique strike-valley doglegs & curved mountain arcs before Dijkstra terrain-routing!
# Format: (id, name, tongue, gloss, order, q0, q1, hw_val, depth_val, waypoints, target)
# target: ('sea', None) | ('river', parent_id, join_frac_if_trib)
RIVER_SPECS = [
    # --- Crookshore Coastal & Fjord Rain-Rivers (oblique strike bends & curved cedar gorges) ---
    (9111, 'Hueru-Bēnchi Kawa', 'hueru-kuran', 'Whale-Bench River: SSW-hooked coastal cedar stream into Whale-Haven',
     1, 18.0, 95.0, 3.0, 185.0, [(53.0, 650.0), (59.0, 663.0), (68.0, 676.0), (77.6, 677.5)], ('sea', None, None)),
    (9112, 'Fjōdu-Mīst Kawa', 'hueru-kuran', 'Fjord-Mist River: NNW-curving rainforest river into Cascade-Caldera',
     2, 28.0, 155.0, 3.5, 250.0, [(184.0, 696.0), (168.0, 676.0), (147.0, 675.0), (134.0, 663.0), (125.4, 659.6)], ('sea', None, None)),
    (9113, 'Sīda-Gōji Kawa', 'hueru-kuran', 'Cedar-Gorge River: winding SE Crookshore torrent with big northward bend',
     2, 34.0, 195.0, 3.9, 300.0, [(186.0, 738.0), (164.0, 718.0), (140.0, 726.0), (115.0, 706.0), (90.0, 709.0)], ('trunk', 9105, None)),
    (9114, 'Bāsaruto-Kawa', 'hueru-kuran', 'Basalt-Creek: SSE-arcing columnar-basalt torrent',
     1, 16.0, 86.0, 2.9, 180.0, [(51.0, 704.0), (63.0, 719.0), (74.0, 714.0), (89.0, 724.0)], ('trunk', 9105, None)),

    # --- Crookwash East Wall: 5 Branched Valley-Kingdom River Systems (K1, K2, K3, K5, K7) ---
    # K1 Khāi-Gēti: starts far SE at (172, 782), sweeps NW behind the granite spur, doglegs WSW past K1 into 9105!
    (9115, 'Khāi-Gēti Tskhali', 'dzagh-vardzi', 'High-Gate Water: dogleg granite gorge river of K1 Khāi-Gēti',
     2, 32.0, 185.0, 4.5, 390.0, [(172.0, 780.0), (154.0, 761.0), (134.0, 768.0), (118.0, 756.0), (104.0, 751.0)], ('trunk', 9105, None)),
    # K2 Rēd-Spāiri: starts NE at (170, 794), drops SSW along a strike trough, hooks WNW past K2, then SW to 9105!
    (9116, 'Rēd-Spāiri Tskhali', 'dzagh-vardzi', 'Red-Spire Water: giant red-cypress flume gorge of K2 Rēd-Spāiri',
     2, 30.0, 175.0, 4.5, 410.0, [(170.0, 794.0), (153.0, 813.0), (133.0, 801.0), (116.0, 808.0), (101.0, 796.0)], ('trunk', 9105, None)),
    # K3 Tīn-Flītsi: long S-curved cassiterite river starting SE at (164, 874), curving NNW then WSW to 9105!
    (9117, 'Tīn-Flītsi Tskhali', 'dzagh-vardzi', 'Tin-Fleece Water: S-curving cassiterite & golden-fleece river of K3 Tīn-Flītsi',
     2, 36.0, 210.0, 4.7, 435.0, [(164.0, 874.0), (149.0, 852.0), (131.0, 859.0), (115.0, 843.0), (99.0, 847.0)], ('trunk', 9105, None)),
    # K5 Rōzi-Vārdzi: hooks down from the Silent Vales divide (156, 892 -> 139, 916 -> 118, 903 -> 95, 911)!
    (9118, 'Rōzi-Vārdzi Tskhali', 'dzagh-vardzi', 'Rose-Ward Water: winding apricot-tuff gorge of K5 Rōzi-Vārdzi',
     2, 32.0, 180.0, 4.4, 395.0, [(156.0, 892.0), (141.0, 915.0), (122.0, 902.0), (107.0, 913.0), (94.0, 905.0)], ('trunk', 9105, None)),
    # K7 Dzēdi-Khrōsi: curves NNW out of the southern nephrite collar (152, 1006 -> 134, 984 -> 114, 990 -> 91, 976)!
    (9119, 'Dzēdi-Khrōsi Tskhali', 'dzagh-vardzi', 'Jade-Cross Water: curving nephrite-collar gorge of K7 Dzēdi-Khrōsi',
     2, 36.0, 205.0, 4.3, 380.0, [(152.0, 1006.0), (136.0, 984.0), (117.0, 991.0), (103.0, 976.0), (91.0, 980.0)], ('trunk', 9105, None)),

    # --- Crookwash West Wall: 4 Winding Skarn/Magnetite/Copper & Fog-Saddle Rivers (W1, K4, K6, W4) ---
    (9120, 'Nōrt-Khrāgi Tskhali', 'dzagh-vardzi', 'North-Crag Water: SSE-curving ironstone & cedar torrent',
     1, 20.0, 110.0, 3.8, 330.0, [(50.0, 756.0), (63.0, 774.0), (79.0, 767.0), (91.0, 780.0), (102.0, 775.0)], ('trunk', 9105, None)),
    # K4 Āirn-Dzāghi: sweeps NNE from the high skarn peak (46, 852 -> 61, 833 -> 77, 842 -> 90, 827 -> 100, 831)!
    (9121, 'Āirn-Dzāghi Tskhali', 'dzagh-vardzi', 'Iron-Jag Water: winding skarn-magnetite gorge of K4 Āirn-Dzāghi',
     2, 26.0, 140.0, 4.4, 400.0, [(46.0, 852.0), (61.0, 832.0), (76.0, 841.0), (89.0, 827.0), (100.0, 831.0)], ('trunk', 9105, None)),
    # K6 Mīst-Khōpri: sweeps ESE then NNE from the 3,070 m fog-saddle (40, 876 -> 56, 896 -> 74, 884 -> 86, 893 -> 96, 885)!
    (9122, 'Mīst-Khōpri Tskhali', 'dzagh-vardzi', 'Mist-Copper Water: fog-saddle & malachite-skarn river of K6 Mīst-Khōpri',
     2, 28.0, 150.0, 4.4, 390.0, [(40.0, 876.0), (56.0, 896.0), (74.0, 884.0), (86.0, 892.0), (96.0, 885.0)], ('trunk', 9105, None)),
    (9123, 'Sāut-Flūmi Tskhali', 'dzagh-vardzi', 'South-Flume Water: NNE-arcing hanging-flume torrent',
     1, 20.0, 108.0, 3.6, 315.0, [(48.0, 962.0), (63.0, 943.0), (77.0, 951.0), (93.0, 938.0)], ('trunk', 9105, None)),

    # --- Crookhead Subalpine Tarn & Silent-Threshold Rivers (2 main curved forks) ---
    (9124, 'Hārth-Tān Warra', 'tungang', 'Hearth-Tarn Water: NNW-sweeping thermogenic melt-well & malachite river',
     2, 30.0, 165.0, 4.1, 350.0, [(158.0, 1062.0), (138.0, 1039.0), (116.0, 1048.0), (98.0, 1031.0), (83.0, 1035.0)], ('trunk', 9105, None)),
    (9125, 'Hūsh-Pās Warra', 'tungang', 'Hush-Pass Water: winding fluted-chimney pass river below Silent Vales',
     2, 30.0, 160.0, 3.9, 325.0, [(174.0, 1084.0), (150.0, 1102.0), (126.0, 1089.0), (108.0, 1098.0), (95.0, 1090.0)], ('trunk', 9105, None)),

    # --- 8 Dendritic 1st-Order Headwater Forks (joining parent tributaries at real Y-confluences!) ---
    (9126, 'Nōrt-Fjōdu Kawa', 'hueru-kuran', 'North-Fjord Fork: cloud-forest branch of Sīda-Gōji Kawa',
     1, 14.0, 62.0, 2.6, 170.0, [(172.0, 702.0), (152.0, 708.0), (136.0, 722.0)], ('trib', 9113, 0.46)),
    (9127, 'Zēmo-Bēnihi Tskhali', 'dzagh-vardzi', 'Upper-Benihi Fork: northern cloud-cedar branch of Khāi-Gēti Tskhali',
     1, 15.0, 68.0, 2.8, 210.0, [(164.0, 744.0), (146.0, 751.0), (132.0, 766.0)], ('trib', 9115, 0.52)),
    (9128, 'Khwēla-Spāiri Tskhali', 'dzagh-vardzi', 'White-Spire Fork: quartz-crag branch of Rēd-Spāiri Tskhali',
     1, 14.0, 64.0, 2.8, 205.0, [(160.0, 826.0), (144.0, 819.0), (131.0, 803.0)], ('trib', 9116, 0.50)),
    (9129, 'Gōldi-Flītsi Tskhali', 'dzagh-vardzi', 'Gold-Fleece Fork: northern placer-gold branch of Tīn-Flītsi Tskhali',
     1, 16.0, 74.0, 3.0, 225.0, [(158.0, 838.0), (141.0, 843.0), (128.0, 856.0)], ('trib', 9117, 0.50)),
    (9130, 'Hūsh-Rīmi Tskhali', 'dzagh-vardzi', 'Hush-Rim Fork: SE acoustic-divide branch of Rōzi-Vārdzi Tskhali',
     1, 15.0, 66.0, 2.8, 200.0, [(152.0, 932.0), (136.0, 924.0), (122.0, 904.0)], ('trib', 9118, 0.54)),
    (9131, 'Skhārn-Khrāgi Tskhali', 'dzagh-vardzi', 'Skarn-Crag Fork: NW magnetite-skarn branch of Āirn-Dzāghi Tskhali',
     1, 14.0, 60.0, 2.8, 210.0, [(48.0, 820.0), (62.0, 825.0), (75.0, 839.0)], ('trib', 9121, 0.48)),
    (9132, 'Fōgi-Gēti Tskhali', 'dzagh-vardzi', 'Fog-Gate Fork: southern mist-pass branch of Mīst-Khōpri Tskhali',
     1, 14.0, 62.0, 2.8, 205.0, [(44.0, 912.0), (59.0, 904.0), (73.0, 886.0)], ('trib', 9122, 0.50)),
    (9133, 'Lāch-Mōrain Bruk', 'tungang', 'Larch-Moraine Brook: western krummholz fork into Kopa-Tarn Warra',
     1, 22.0, 112.0, 3.4, 275.0, [(48.0, 1012.0), (61.0, 1029.0), (73.0, 1019.0), (83.0, 1028.0)], ('trunk', 9105, None)),
]

# Curved interfluve spurs between adjacent valley watersheds
SPURS = [
    ([(166.0, 787.0), (138.0, 783.0), (109.0, 774.0)], 4.0, 175.0),
    ([(162.0, 832.0), (134.0, 825.0), (107.0, 821.0)], 4.2, 195.0),
    ([(158.0, 883.0), (132.0, 879.0), (104.0, 874.0)], 4.2, 185.0),
    ([(148.0, 944.0), (126.0, 936.0), (103.0, 934.0)], 3.8, 165.0),
    ([(50.0, 804.0), (71.0, 809.0), (93.0, 802.0)], 3.8, 170.0),
    ([(46.0, 864.0), (68.0, 860.0), (90.0, 858.0)], 4.0, 185.0),
    ([(48.0, 924.0), (69.0, 918.0), (89.0, 914.0)], 3.8, 165.0),
]

# ---- 3. Settlements placed right on the curved river confluences & crater rims
NEW_SETTS = [
    dict(id='sdv1khaigeti', name='Khāi-Gēti', type='town', px=129, py=765, polity='Dzagh-Vardzi: Khāi-Gēti',
         notes='High-Gate (K1): northernmost of the seven petty Dzagh-Vardzi valley-kingdoms (~1,150 people) in Vardzieti (Crookwash), at the confluence of Khāi-Gēti Tskhali (9115) and Zēmo-Bēnihi Fork (9127); taxes 30 m red-cypress log-booms floating north to Crookshore.'),
    dict(id='sdv2redspairi', name='Rēd-Spāiri', type='town', px=129, py=803, polity='Dzagh-Vardzi: Rēd-Spāiri',
         notes='Red-Spire (K2): petty Dzagh-Vardzi valley-kingdom (~1,050 people) at the Y-confluence of Rēd-Spāiri Tskhali (9116) and Khwēla-Spāiri Fork (9128), famed for giant benihi red-cypress gravity flumes and 5:1 white-quartz needle-towers.'),
    dict(id='sdv3tinflitsi', name='Tīn-Flītsi', type='town', px=127, py=855, polity='Dzagh-Vardzi: Tīn-Flītsi',
         notes='Tin-Fleece (K3): petty Dzagh-Vardzi valley-kingdom (~1,200 people) at the confluence of Tīn-Flītsi Tskhali (9117) and Gōldi-Flītsi Fork (9129); works cassiterite tin (200) and pans glacial torrents with sheepskin "golden fleeces" for placer gold (110).'),
    dict(id='sdv4airndzaghi', name='Āirn-Dzāghi', type='town', px=76, py=839, polity='Dzagh-Vardzi: Āirn-Dzāghi',
         notes='Iron-Jag (K4): West-Wall Dzagh-Vardzi valley-kingdom (~1,000 people) at the confluence of Āirn-Dzāghi Tskhali (9121) and Skhārn-Khrāgi Fork (9131) below the skarn-magnetite belt (skarn 200, iron 255, copper 130); waterwheel trip-hammer armourers of 300-year heirloom scale hauberks.'),
    dict(id='sdv5rozivardzi', name='Rōzi-Vārdzi', type='town', px=120, py=904, polity='Dzagh-Vardzi: Rōzi-Vārdzi',
         notes='Rose-Ward (K5): petty Dzagh-Vardzi valley-kingdom (~950 people) at the confluence of Rōzi-Vārdzi Tskhali (9118) and Hūsh-Rīmi Fork (9130); quarries warm apricot-rose volcanic ablaq tuff and guards the high eastern mule-track toward Silent Vales.'),
    dict(id='sdv6mistkhopri', name='Mīst-Khōpri', type='town', px=74, py=885, polity='Dzagh-Vardzi: Mīst-Khōpri',
         notes='Mist-Copper (K6): West-Wall Dzagh-Vardzi valley-kingdom (~850 people) at the confluence of Mīst-Khōpri Tskhali (9122) and Fōgi-Gēti Fork (9132) below the 3,070 m ocean fog-saddle; smelts malachite-skarn copper (130) into verdigris gumbat umbrella-spire sheets.'),
    dict(id='sdv7dzedikhrosi', name='Dzēdi-Khrōsi', type='town', px=115, py=988, polity='Dzagh-Vardzi: Dzēdi-Khrōsi',
         notes='Jade-Cross (K7): southernmost Dzagh-Vardzi valley-kingdom (~1,100 people) on the S-bend of Dzēdi-Khrōsi Tskhali (9119); works the northern nephrite boulder collar (jade 200) into cross-medallions and weighed sky-bridge duel weregild slabs.'),
    dict(id='sdv8flumibridzi', name='Flūmi-Brīdzi', type='outpost', px=94, py=966, polity='Dzagh-Vardzi Charter',
         notes='Flume-Bridge: chartered neutral DV3 Flume-Forge & Chasm-Bridge hamlet (~350 people) straddling the confluence of Kopa-Tarn Warra (9105) and Blek Warra (9110), where all seven valley-kings trade tin, copper, and nephrite on the summer trail to Copper Tarn.'),
    dict(id='shk1kopahueru', name='Kōpa-Hueru', type='town', px=75, py=679, polity='Hueru-Kuran Clans',
         notes='Main Hueru-Kuran trilobate basalt Nuraghe keep, Santa Cristina tsunami-drawdown well, and whale-rib Chise village (~4,200 people) perched safely at +205 m on the reshaped western ejecta rim of Kopa-South (Whale-Haven).'),
    dict(id='shk2kaskedi', name='Kāskēdi-Kuran', type='village', px=128, py=660, polity='Hueru-Kuran Clans',
         notes='Hueru-Kuran Nuraghe & water-powered nephrite pendulum wire-saw village (~2,600 people) on the eastern +175 m ejecta rim of Cascade-Caldera at the mouth of Kopa-Tarn Warra.'),
]


def regions_src():
    s = open(os.path.join(SRC, '51-region-store.js'), encoding='utf-8', newline='').read()
    m = re.search(r'const defRegs = (\[.*?\]);\n', s, re.S)
    return s, {r['id']: r for r in json.loads(m.group(1))}


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], float)


def ang_diff_deg(a, b):
    return np.abs((a - b + 180.0) % 360.0 - 180.0)


def bedrock_joint_field(xx, yy):
    """Deterministic multi-octave structural fracture/resistance field so Dijkstra routes weave naturally around hard ribs."""
    f = (
        0.50 * np.sin(0.21 * xx + 0.17 * yy + 1.1) * np.cos(0.14 * xx - 0.23 * yy + 0.4)
        + 0.32 * np.sin(0.43 * xx - 0.37 * yy + 2.3) * np.cos(0.31 * xx + 0.48 * yy - 0.8)
        + 0.18 * np.sin(0.89 * xx + 0.73 * yy - 1.7)
    )
    return f


def route_natural_course(E_surf, joint_f, wpts, seed=1):
    """Route a river through mountain waypoints via least-cost Dijkstra over terrain + bedrock joints, then smooth organically."""
    H, W = E_surf.shape
    pts = [np.array(p, float) for p in wpts]
    pad = 14
    x0 = max(1, int(math.floor(min(p[0] for p in pts))) - pad)
    x1 = min(W - 1, int(math.ceil(max(p[0] for p in pts))) + pad + 1)
    y0 = max(1, int(math.floor(min(p[1] for p in pts))) - pad)
    y1 = min(H - 1, int(math.ceil(max(p[1] for p in pts))) + pad + 1)
    subE = E_surf[y0:y1, x0:x1]
    subJ = joint_f[y0:y1, x0:x1]
    ny, nx = subE.shape
    yy_l, xx_l = np.mgrid[0:ny, 0:nx].astype(float)

    full_cells = []
    for seg_i in range(len(pts) - 1):
        pA, pB = pts[seg_i], pts[seg_i + 1]
        st = (int(np.clip(round(pA[1]) - y0, 0, ny - 1)), int(np.clip(round(pA[0]) - x0, 0, nx - 1)))
        gl = (int(np.clip(round(pB[1]) - y0, 0, ny - 1)), int(np.clip(round(pB[0]) - x0, 0, nx - 1)))
        if st == gl:
            continue
        # Distance from segment pA->pB softly guides path within corridor while letting bedrock ribs deflect it!
        dx_s, dy_s = pB[0] - pA[0], pB[1] - pA[1]
        l2 = max(1e-6, dx_s * dx_s + dy_s * dy_s)
        t_s = np.clip(((xx_l + x0 - pA[0]) * dx_s + (yy_l + y0 - pA[1]) * dy_s) / l2, 0.0, 1.0)
        cor_d = np.hypot((xx_l + x0) - (pA[0] + t_s * dx_s), (yy_l + y0) - (pA[1] + t_s * dy_s))

        dist = np.full((ny, nx), 1e18)
        prev_y = np.full((ny, nx), -1, dtype=np.int32)
        prev_x = np.full((ny, nx), -1, dtype=np.int32)
        dist[st] = 0.0
        pq = [(0.0, st[0], st[1])]
        while pq:
            d_u, uj, ui = heapq.heappop(pq)
            if (uj, ui) == gl:
                break
            if d_u > dist[uj, ui]:
                continue
            eu = subE[uj, ui]
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    if not dj and not di:
                        continue
                    vj, vi = uj + dj, ui + di
                    if 0 <= vj < ny and 0 <= vi < nx:
                        step = 1.41421356 if (dj and di) else 1.0
                        climb = max(0.0, subE[vj, vi] - eu)
                        # Strong bedrock joint + uphill avoidance + gentle corridor pull => realistic winding canyons!
                        w_cost = (
                            1.0
                            + climb / 22.0
                            + max(0.0, subE[vj, vi]) / 6500.0
                            + 1.35 * (subJ[vj, vi] + 1.0)
                            + 0.055 * (cor_d[vj, vi] ** 1.6)
                        )
                        nd_v = d_u + step * w_cost
                        if nd_v < dist[vj, vi]:
                            dist[vj, vi] = nd_v
                            prev_y[vj, vi], prev_x[vj, vi] = uj, ui
                            heapq.heappush(pq, (nd_v, vj, vi))
        seg_path = []
        cj, ci = gl
        while (cj, ci) != st and cj >= 0:
            seg_path.append([ci + x0, cj + y0])
            cj, ci = int(prev_y[cj, ci]), int(prev_x[cj, ci])
        seg_path.append([st[1] + x0, st[0] + y0])
        seg_path.reverse()
        if full_cells:
            full_cells.extend(seg_path[1:])
        else:
            full_cells.extend(seg_path)

    arr = np.array(full_cells, float)
    if len(arr) >= 5:
        sx = nd.gaussian_filter1d(arr[:, 0], sigma=1.45, mode='nearest')
        sy = nd.gaussian_filter1d(arr[:, 1], sigma=1.45, mode='nearest')
        arr = np.stack([sx, sy], axis=1)
        # Add continuous multi-harmonic perpendicular river bends (erases any 45-deg Moore-grid diagonals!)
        ds = np.concatenate([[0.0], np.cumsum(np.hypot(np.diff(arr[:, 0]), np.diff(arr[:, 1])))])
        tot = max(1e-6, ds[-1])
        u = ds / tot
        env = np.sin(np.pi * u) ** 0.85
        tang = np.gradient(arr, axis=0)
        tn = np.maximum(1e-6, np.hypot(tang[:, 0], tang[:, 1]))[:, None]
        tang /= tn
        nrm = np.stack([-tang[:, 1], tang[:, 0]], axis=1)
        ph1 = 1.73 * seed + 0.4
        ph2 = 2.91 * seed - 0.8
        wig = env * (
            1.65 * np.sin(2.0 * np.pi * (1.85 * u) + ph1)
            + 0.85 * np.sin(2.0 * np.pi * (4.30 * u) + ph2)
            + 0.38 * np.cos(2.0 * np.pi * (7.90 * u) - ph1)
        )
        arr = arr + nrm * wig[:, None]
    arr[0] = pts[0]
    arr[-1] = pts[-1]
    return arr


def densify_simple(wpts, step_px=0.9):
    pts = [np.array(p, float) for p in wpts]
    out = []
    for a, b in zip(pts, pts[1:]):
        n = max(3, int(math.ceil(float(np.hypot(*(b - a))) / step_px)))
        for k in range(n):
            t = k / float(n)
            out.append(a * (1.0 - t) + b * t)
    out.append(pts[-1])
    return np.array(out)


def seg_dist(xx, yy, p0, p1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    l2 = dx * dx + dy * dy
    if l2 < 1e-9:
        return np.hypot(xx - p0[0], yy - p0[1]), np.zeros_like(xx)
    t = np.clip(((xx - p0[0]) * dx + (yy - p0[1]) * dy) / l2, 0.0, 1.0)
    px, py = p0[0] + t * dx, p0[1] + t * dy
    return np.hypot(xx - px, yy - py), t


def polyline_field(xx, yy, curve, vals):
    H, W = xx.shape
    pad = 12
    x0 = max(0, int(math.floor(curve[:, 0].min())) - pad)
    x1 = min(W, int(math.ceil(curve[:, 0].max())) + pad + 1)
    y0 = max(0, int(math.floor(curve[:, 1].min())) - pad)
    y1 = min(H, int(math.ceil(curve[:, 1].max())) + pad + 1)
    sub_x, sub_y = xx[y0:y1, x0:x1], yy[y0:y1, x0:x1]
    best_d = np.full(sub_x.shape, 1e9)
    best_v = np.zeros(sub_x.shape)
    best_u = np.zeros(sub_x.shape)
    n = len(curve)
    for i in range(n - 1):
        d, t = seg_dist(sub_x, sub_y, curve[i], curve[i + 1])
        m = d < best_d
        if m.any():
            best_d = np.where(m, d, best_d)
            best_v = np.where(m, vals[i] * (1.0 - t) + vals[i + 1] * t, best_v)
            best_u = np.where(m, (i + t) / max(1, n - 1), best_u)
    return (y0, y1, x0, x1), best_d, best_v, best_u


def main():
    D = P.load()
    lf_obj = D.get('landforms') or {'format': 'krator-landforms', 'version': 1, 'landforms': []}
    if not PREVIEW_PNG and any(x.get('id') == 'lf_crook_kopa_north' for x in lf_obj.get('landforms', [])):
        sys.exit('edit_520_crook has run already (lf_crook_kopa_north is in DATA.landforms)')

    rep = {'edit': '5.1 edit 20 (The Crook craters, dendritic fluvial pass & valley-kingdoms)', 'date': '2026-11-22'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    joint_f = bedrock_joint_field(xx, yy)

    _, R = regions_src()
    crook_m = np.zeros(sh, bool)
    for rid in ('rmvthecrook', 'rmw4wknusgc7h', 'rmwet8ethscuf', 'rmwetb495tgzt'):
        crook_m |= G.poly(R[rid]['points'], 1.0, 1.0, sh) > 0.5
    drown_m = (G.poly(R['rmwete7oza9d9']['points'], 1.0, 1.0, sh) > 0.5) & (yy >= 542) & (xx <= 165)
    svales_floor = G.poly(R['rmvyk0ubpkdoy']['points'], 1.0, 1.0, sh) > 0.5
    own = (crook_m | drown_m) & ~svales_floor & (yy <= 1112) & (xx <= 226)
    inner = nd.binary_erosion(own, iterations=MARGIN_PX)

    En = Eo.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()

    # ---- 1. Sculpt Crookshore's Four Drowned Secondary-Ejecta Impact Craters
    rep['craters'] = []
    newly_drowned = np.zeros(sh, bool)
    newly_emerged = np.zeros(sh, bool)
    for cr in CRATERS:
        cx, cy = cr['cx'], cr['cy']
        dx, dy = xx - cx, yy - cy
        r = np.hypot(dx, dy)
        az = (np.degrees(np.arctan2(dx, -dy)) + 360.0) % 360.0
        max_r = max(cr['r_out'], cr['breach_len'])
        in_box = (r <= max_r + 1.5) & inner

        d_br = ang_diff_deg(az, cr['breach_az'])
        w_br = 1.0 - G.sstep(cr['breach_hw'] * 0.65, cr['breach_hw'] * 1.25, d_br)
        if cr.get('inlet_az') is not None:
            d_in = ang_diff_deg(az, cr['inlet_az'])
            w_in = 1.0 - G.sstep(cr['inlet_hw'] * 0.60, cr['inlet_hw'] * 1.20, d_in)
        else:
            w_in = np.zeros_like(r)

        bowl_prof = cr['floor_m'] + (-12.0 - cr['floor_m']) * G.sstep(cr['r_w'] * 0.55, cr['r_w'] * 1.02, r)
        is_bowl = in_box & (r <= cr['r_w'])
        En = np.where(is_bowl, bowl_prof, En)

        rise = G.sstep(cr['r_w'], cr['r_rim'], r)
        fall = 1.0 - G.sstep(cr['r_rim'], cr['r_out'], r)
        collar_h = 72.0 + (cr['rim_m'] - 72.0) * rise * fall + 42.0 * (1.0 - G.sstep(cr['r_rim'], cr['r_out'], r))
        intact = np.clip(1.0 - np.maximum(w_br, w_in), 0.0, 1.0)
        is_collar = in_box & (r > cr['r_w']) & (r <= cr['r_out']) & (intact > 0.15)
        if cr.get('trim_bay'):
            blend = intact * (1.0 - G.sstep(cr['r_out'] * 0.72, cr['r_out'], r))
            En = np.where(is_collar, np.where(Eo < collar_h, collar_h * blend + Eo * (1.0 - blend), Eo), En)
        else:
            blend = intact * (1.0 - G.sstep(cr['r_out'] * 0.70, cr['r_out'], r))
            En = np.where(is_collar & (En < collar_h), En * (1.0 - blend) + collar_h * blend, En)

        is_throat = in_box & (r > cr['r_w'] * 0.80) & (r <= cr['breach_len']) & (w_br > 0.15)
        w_core = G.sstep(0.15, 0.48, w_br)
        throat_prof = cr['throat_m'] * w_core + En * (1.0 - w_core)
        En = np.where(is_throat, np.minimum(En, throat_prof), En)

        if cr.get('inlet_az') is not None:
            is_inlet = in_box & (r > cr['r_w'] * 0.80) & (r <= cr['r_rim'] + 1.5) & (w_in > 0.15)
            w_inc = G.sstep(0.15, 0.48, w_in)
            in_prof = cr['inlet_m'] * w_inc + En * (1.0 - w_inc)
            En = np.where(is_inlet, np.minimum(En, in_prof), En)

        foot = in_box & (r <= max_r)
        drown_here = foot & (En < -1.0)
        En = np.where(foot & whas0 & (En >= -1.0) & (En < 8.0) & (intact > 0.4), 18.0, En)
        emerge_here = foot & whas0 & (En >= 4.0)

        whas2[drown_here] = True
        wlev2[drown_here] = 0.0
        whas2[emerge_here] = False
        newly_drowned |= drown_here & ~whas0
        newly_emerged |= emerge_here

        rim_band = in_box & (r > cr['r_w'] + 0.6) & (r <= cr['r_rim'] + 0.8) & (intact > 0.6)
        rep['craters'].append({
            'id': cr['id'], 'name': cr['name'], 'centre_px': [cx, cy],
            'water_cells': int((in_box & (r <= cr['r_w'] + 0.5) & whas2).sum()),
            'floor_min_m': round(float(En[is_bowl].min()), 1),
            'rim_median_m': round(float(np.median(En[rim_band])), 1),
            'rim_max_m': round(float(En[rim_band].max()), 1),
            'drowned_new_cells': int((drown_here & ~whas0).sum()),
            'emerged_new_cells': int(emerge_here.sum()),
        })

    st_curve = densify_simple(KOPA_STRAIT, step_px=0.8)
    st_vals = np.full(len(st_curve), -36.0)
    (sy0, sy1, sx0, sx1), st_d, st_v, _ = polyline_field(xx, yy, st_curve, st_vals)
    st_loc = inner[sy0:sy1, sx0:sx1]
    st_w = 1.0 - G.sstep(1.05, 2.35, st_d)
    st_prof = st_v * st_w + En[sy0:sy1, sx0:sx1] * (1.0 - st_w)
    En[sy0:sy1, sx0:sx1] = np.where(st_loc & (st_w > 0.15), np.minimum(En[sy0:sy1, sx0:sx1], st_prof), En[sy0:sy1, sx0:sx1])
    st_drown = st_loc & (st_d <= 1.55) & (En[sy0:sy1, sx0:sx1] < -2.0)
    whas2[sy0:sy1, sx0:sx1][st_drown] = True
    wlev2[sy0:sy1, sx0:sx1][st_drown] = 0.0
    newly_drowned[sy0:sy1, sx0:sx1] |= st_drown & ~whas0[sy0:sy1, sx0:sx1]

    sea_lab, _ = nd.label(whas2, structure=np.ones((3, 3)))
    ocean_id = int(sea_lab[562, 96])
    assert ocean_id > 0, 'reference ocean pixel (96, 562) is not water!'
    for cr in CRATERS:
        cy_i, cx_i = int(round(cr['cy'])), int(round(cr['cx']))
        assert sea_lab[cy_i, cx_i] == ocean_id, f"Crater {cr['id']} at ({cx_i},{cy_i}) is not connected to open ocean!"

    # ---- 2. Update 9105 Kopa-Tarn Warra mouth + add natural canyon sinuosity to 9105's middle course
    r9105 = next(r for r in D['rivers'] if r['id'] == 9105)
    pts_9105 = [p for p in r9105['px'] if p[1] >= 663.5]
    pts_9105.append([122.4, 662.4])
    r9105['px'] = pts_9105
    r9105['to'] = {'kind': 'sea', 'at_px': pts_9105[-1]}
    ck_arr = np.array(pts_9105, float)

    # ---- 3. Sculpt Sinuous Interfluve Spurs & +23 Dendritic Terrain-Routed Rivers
    for spur_pts, hw, boost in SPURS:
        scurve = densify_simple(spur_pts, step_px=1.0)
        u_s = np.linspace(0.0, 1.0, len(scurve))
        svals = boost * (np.sin(np.pi * np.clip(u_s, 0.05, 1.0)) ** 0.75) * (1.0 + 0.18 * np.sin(5.0 * np.pi * u_s))
        (by0, by1, bx0, bx1), d, v, _ = polyline_field(xx, yy, scurve, svals)
        w = 1.0 - G.sstep(0.0, hw, d)
        loc_m = inner[by0:by1, bx0:bx1] & ~whas2[by0:by1, bx0:bx1]
        En[by0:by1, bx0:bx1] += np.where(loc_m, v * w, 0.0)

    new_river_recs = []
    curves_by_id = {}
    recs_by_id = {}
    rep['tributaries'] = []

    for idx, (rid, rname, tongue, gloss, order, q0, q1, hw_val, depth_val, wpts, target) in enumerate(RIVER_SPECS):
        tkind, parent_id, join_frac = target
        pts_w = [list(p) for p in wpts]
        if tkind == 'trunk':
            d9 = np.hypot(ck_arr[:, 0] - pts_w[-1][0], ck_arr[:, 1] - pts_w[-1][1])
            ki = int(np.argmin(d9))
            pts_w[-1] = [float(ck_arr[ki, 0]), float(ck_arr[ki, 1])]
        elif tkind == 'trib':
            p_px = np.array(recs_by_id[parent_id]['px'], float)
            ki = int(np.clip(round(join_frac * (len(p_px) - 1)), 1, len(p_px) - 2))
            pts_w[-1] = [float(p_px[ki, 0]), float(p_px[ki, 1])]

        curve = route_natural_course(En, joint_f, pts_w, seed=idx + 1)
        curves_by_id[rid] = curve

        mx, my = int(round(curve[-1, 0])), int(round(curve[-1, 1]))
        e_mouth = 0.0 if tkind == 'sea' else float(En[my, mx])

        n_c = len(curve)
        u_arr = np.linspace(0.0, 1.0, n_c)
        d_prof = depth_val * (np.sin(np.pi * np.clip(u_arr, 0.03, 0.98)) ** 0.65)
        (by0, by1, bx0, bx1), dist, v_dep, u_grid = polyline_field(xx, yy, curve, d_prof)
        hw_grid = hw_val * (1.0 - 0.52 * G.sstep(0.76, 0.98, u_grid))
        w_broad = 1.0 - G.sstep(0.22, 1.0, dist / np.maximum(1.15, hw_grid))
        w_slot = 1.0 - G.sstep(0.0, 1.4, dist)
        carve = v_dep * (0.68 * w_broad + 0.32 * w_slot)

        loc_m = inner[by0:by1, bx0:bx1] & ~whas2[by0:by1, bx0:bx1]
        floor_guard = e_mouth + 5.0 + 30.0 * (1.0 - u_grid)
        cand = np.maximum(floor_guard, En[by0:by1, bx0:bx1] - carve)
        En[by0:by1, bx0:bx1] = np.where(loc_m & (cand < En[by0:by1, bx0:bx1]), cand, En[by0:by1, bx0:bx1])

        cells_seen, course_cells = set(), []
        for p in curve:
            c_ij = (int(round(p[1])), int(round(p[0])))
            if c_ij not in cells_seen:
                cells_seen.add(c_ij)
                course_cells.append(c_ij)

        prev_h = None
        for cj, ci in course_cells:
            if whas2[cj, ci] or not inner[cj, ci]:
                break
            if prev_h is not None and En[cj, ci] > prev_h - 1.5:
                En[cj, ci] = max(e_mouth + 0.5, prev_h - 1.5)
            prev_h = float(En[cj, ci])

        # Keep fine vertex spacing (~1.3 px) so every natural river bend renders smoothly!
        keep = np.linspace(0, len(curve) - 1, max(12, int(round(len(curve) / 1.35)))).round().astype(int)
        keep = np.unique(keep)
        px_list = [[round(float(curve[k, 0]), 1), round(float(curve[k, 1]), 1)] for k in keep]
        px_list[-1] = [round(pts_w[-1][0], 1), round(pts_w[-1][1], 1)]

        seg_l = sum(2.0 * math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(px_list, px_list[1:]))
        len_km = round(seg_l, 1)
        q_list = [round(q0 + (q1 - q0) * (i / max(1, len(px_list) - 1)), 1) for i in range(len(px_list))]
        beds, cur_b = [], 1e9
        for p in px_list:
            pi, pj = int(round(p[0])), int(round(p[1]))
            raw_b = 0.0 if whas2[pj, pi] else float(En[pj, pi])
            cur_b = min(cur_b - 0.5, raw_b) if beds else raw_b
            cur_b = max(e_mouth if tkind != 'sea' else 0.0, cur_b)
            beds.append(round(cur_b, 1))
        if tkind == 'sea':
            beds[-1] = 0.0

        if tkind == 'sea':
            to_obj = {'kind': 'sea', 'at_px': px_list[-1]}
        elif tkind == 'trunk':
            to_obj = {'kind': 'river', 'id': 9105, 'at_px': px_list[-1], 'name': 'Kopa-Tarn Warra (Crook River)'}
        else:
            to_obj = {'kind': 'river', 'id': parent_id, 'at_px': px_list[-1], 'name': recs_by_id[parent_id]['name']}

        rec = {
            'id': rid, 'name': rname, 'tier': 'trib', 'order': order, 'perennial': True,
            'len_km': len_km, 'length_km': round(len_km),
            'q_mouth': q1, 'q_mouth_m3s': q1, 'q_m3s': q_list,
            'px': px_list, 'to': to_obj,
            'bed_m': beds, 'source_m': beds[0], 'mouth_m': beds[-1],
            'kind': 'river', 'tongue': tongue, 'gloss': gloss, 'old_name': '(5.1 edit 20)',
        }
        new_river_recs.append(rec)
        recs_by_id[rid] = rec
        rep['tributaries'].append({'id': rid, 'name': rname, 'order': order, 'len_km': len_km, 'q_mouth_m3s': q1,
                                   'source_m': beds[0], 'mouth_m': beds[-1], 'to': to_obj.get('name', 'sea')})

    # Re-enforce monotonic fall along parent tributaries & trunk rivers (9105, 9110)
    for rec in new_river_recs:
        if rec['to']['kind'] == 'river' and rec['to']['id'] in recs_by_id:
            par = recs_by_id[rec['to']['id']]
            p_arr = np.array(par['px'], float)
            ki = int(np.argmin(np.hypot(p_arr[:, 0] - rec['px'][-1][0], p_arr[:, 1] - rec['px'][-1][1])))
            rec['bed_m'][-1] = min(rec['bed_m'][-1], par['bed_m'][ki])
            rec['mouth_m'] = rec['bed_m'][-1]

    for trunk_id in (9105, 9110):
        rv = next(r for r in D['rivers'] if r['id'] == trunk_id)
        seen_t, c_t = set(), []
        for p in rv['px']:
            ij = (int(round(p[1])), int(round(p[0])))
            if ij not in seen_t:
                seen_t.add(ij)
                c_t.append(ij)
        prev = None
        for cj, ci in c_t:
            if whas2[cj, ci]:
                break
            if inner[cj, ci] and prev is not None and En[cj, ci] > prev - 0.4:
                En[cj, ci] = max(0.5, prev - 0.4)
            prev = float(En[cj, ci])
        beds_t, cur_t = [], 1e9
        for p in rv['px']:
            pi, pj = int(round(p[0])), int(round(p[1]))
            val = 0.0 if whas2[pj, pi] else float(En[pj, pi])
            cur_t = min(cur_t, val)
            beds_t.append(round(cur_t, 1))
        if trunk_id == 9105:
            beds_t[-1] = 0.0
            n9 = len(rv['px'])
            rv['q_m3s'] = [round(120.0 + 1980.0 * ((i / max(1, n9 - 1)) ** 1.25), 1) for i in range(n9)]
            rv['q_mouth'] = rv['q_mouth_m3s'] = 2100.0
            seg9 = sum(2.0 * math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(rv['px'], rv['px'][1:]))
            rv['len_km'] = round(seg9, 1)
            rv['length_km'] = round(seg9)
        else:
            j_idx = int(np.argmin(np.hypot(ck_arr[:, 0] - rv['px'][-1][0], ck_arr[:, 1] - rv['px'][-1][1])))
            beds_t[-1] = min(beds_t[-1], round(float(En[int(round(ck_arr[j_idx, 1])), int(round(ck_arr[j_idx, 0]))]), 1))
        rv['bed_m'] = beds_t
        rv['source_m'] = beds_t[0]
        rv['mouth_m'] = beds_t[-1]

    D['rivers'].extend(new_river_recs)

    # Optional fast 3-second preview map render before expensive reclimate/relight!
    if PREVIEW_PNG:
        X0, X1, Y0, Y1, SC = 15, 275, 520, 1175, 3
        subE = En[Y0:Y1, X0:X1]
        subW = whas2[Y0:Y1, X0:X1]
        dy_g, dx_g = np.gradient(subE, 2000.0)
        az_l, alt_l = np.deg2rad(315.0), np.deg2rad(42.0)
        nx_g, ny_g, nz_g = -dx_g * 3.6, -dy_g * 3.6, np.ones_like(subE)
        nm_g = np.sqrt(nx_g*nx_g + ny_g*ny_g + nz_g*nz_g)
        shd = np.clip((nx_g*np.cos(alt_l)*np.sin(az_l) - ny_g*np.cos(alt_l)*np.cos(az_l) + nz_g*np.sin(alt_l)) / nm_g, 0.18, 1.0)
        stops_h = np.array([0, 250, 800, 1600, 2600, 3800, 5500, 8500], float)
        stops_c = np.array([[46,98,68],[68,122,76],[102,142,86],[146,158,102],[176,156,118],[164,146,134],[198,196,198],[242,246,252]], float)
        rgb = np.stack([np.interp(np.clip(subE, 0, 8500), stops_h, stops_c[:, c]) for c in range(3)], -1) * (0.45 + 0.68 * shd)[..., None]
        rgb[subW & (subE <= 50)] = [22, 58, 90]
        rgb[subW & (subE > 50)] = [42, 118, 146]
        im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize(((X1-X0)*SC, (Y1-Y0)*SC), Image.Resampling.BILINEAR)
        from PIL import ImageDraw
        dr = ImageDraw.Draw(im, 'RGBA')
        for rv in D['rivers']:
            if isinstance(rv['id'], int) and 9111 <= rv['id'] <= 9133:
                pts = [((p[0]-X0)*SC, (p[1]-Y0)*SC) for p in rv['px']]
                w_line = 3 if rv.get('order', 1) >= 2 else 2
                dr.line(pts, fill=(10, 35, 60, 215), width=w_line + 2, joint='curve')
                dr.line(pts, fill=(130, 238, 255, 255), width=w_line, joint='curve')
        for rv in D['rivers']:
            if rv['id'] in (9105, 9110):
                pts = [((p[0]-X0)*SC, (p[1]-Y0)*SC) for p in rv['px'] if X0-5 <= p[0] <= X1+5 and Y0-5 <= p[1] <= Y1+5]
                dr.line(pts, fill=(8, 40, 68, 240), width=6, joint='curve')
                dr.line(pts, fill=(45, 218, 255, 255), width=3, joint='curve')
        for st in NEW_SETTS:
            px_s, py_s = (st['px']-X0)*SC, (st['py']-Y0)*SC
            dr.ellipse([px_s-6, py_s-6, px_s+6, py_s+6], fill=(255, 130, 70, 255), outline=(255,255,255,255), width=2)
        im.save(PREVIEW_PNG)
        print('Saved preview:', PREVIEW_PNG)
        return

    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    water2 = whas2.copy()
    moved = (En != Eo) | (whas2 != whas0)
    assert not (moved & ~inner).any(), 'a moved cell lies within %d px of own edge or outside The Crook!' % MARGIN_PX
    for chk_nm, cx, cy in [('Copper Tarn', 148, 1148), ('Silent Lake N', 196, 928), ('Silent Lake S', 186, 1020), ('Farside Strand', 293, 573)]:
        assert not moved[cy - 6:cy + 7, cx - 6:cx + 7].any(), f'{chk_nm} window moved!'

    rep['moved_cells'] = int(moved.sum())
    rep['raised_m_max'] = round(float((En - Eo).max()), 1)
    rep['cut_m_max'] = round(float((Eo - En).max()), 1)

    lapsed = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k, v in lapsed.items():
        arr = P.raster({k: v}, k, 'L')
        arr[~own] = raw0[k][~own]
        D[k] = P.b64(Image.fromarray(arr, 'L'), optimize=True)

    rain2, cls2, zon2, _, crep = C.reclimate(D, Eo, En, whas0, newly_drowned)
    sea_cls = int(raw0['c'][585, 90])
    sea_zon = int(raw0['z'][585, 90])
    land_cls = int(codes.index('Cfa'))
    land_zon = int(raw0['z'][670, 105])
    cls2[newly_drowned] = sea_cls
    zon2[newly_drowned] = sea_zon
    cls2[newly_emerged] = land_cls
    zon2[newly_emerged] = land_zon

    rain0_f = raw0['p'].astype(float) / 255.0 * 4000.0
    rain_u8 = np.where(own, np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), raw0['p'])
    cls_u8 = np.where(own, cls2.astype(np.uint8), raw0['c'])
    zon_u8 = np.where(own, zon2.astype(np.uint8), raw0['z'])
    rep['reclimate'] = crep

    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(rain_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls_u8, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon_u8, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0_f), PA.ramp(rain_now), own & (np.abs(rain_now - rain0_f) > 1.0))
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cls_u8], own & (cls_u8 != raw0['c']))

    sea_donor = whas0 & (np.hypot(xx - 90.0, yy - 585.0) < 8.0)
    forest_donor = ~whas0 & (Eo > 65.0) & (Eo < 220.0) & (np.hypot(xx - 108.0, yy - 680.0) < 15.0)
    for k in ('st', 't'):
        a = P.raster(D, k).astype(float)
        sea_rgb = np.median(raw0[k][sea_donor], axis=0)
        for_rgb = np.median(raw0[k][forest_donor], axis=0)
        w_sea = np.clip(nd.gaussian_filter(newly_drowned.astype(float), 0.65) * 1.35, 0.0, 1.0)[..., None] * own[..., None]
        w_for = np.clip(nd.gaussian_filter(newly_emerged.astype(float), 0.65) * 1.35, 0.0, 1.0)[..., None] * own[..., None]
        a = a * (1.0 - w_sea) + sea_rgb * w_sea
        a = a * (1.0 - w_for) + for_rgb * w_for
        D[k] = P.jpeg_like(D, k, np.clip(a, 0, 255).round().astype(np.uint8))

    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v in relit.items():
        D[k] = v

    near = nd.binary_dilation(moved, iterations=3) & own
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near & ~whas2, ~near & ~whas2, 160.0)
        D[k] = P.jpeg_like(D, k, a)
        im = Image.fromarray(P.raster(D, k))
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        from PIL import ImageDraw, ImageFilter
        drw = ImageDraw.Draw(over)
        rcol = (54, 106, 132, 165) if k == 'st' else (63, 111, 134, 185)
        for rec in new_river_recs:
            drw.line([tuple(p) for p in rec['px']], fill=rcol, width=1, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(0.45))
        comp = np.array(Image.alpha_composite(im.convert('RGBA'), over).convert('RGB'))
        orig_after_retint = np.array(im)
        comp = np.where(own[..., None], comp, orig_after_retint)
        D[k] = P.jpeg_like(D, k, comp)

    dc = Counter(cls_u8.ravel().tolist())
    for pr in D['climate']['present']:
        k_i = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k_i, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k_i, 0) / cls_u8.size, 2)

    for cr in CRATERS:
        lf_obj['landforms'].append({
            'id': cr['id'], 'kind': 'drowned_ejecta_caldera', 'px': cr['cx'], 'py': cr['cy'],
            'r_m': round(cr['r_w'] * 2000.0), 'rim_m': cr['rim_m'], 'floor_m': cr['floor_m'],
            'water_m': 0.0, 'region': 'rmw4wknusgc7h', 'note': cr['note'],
        })
    lf_obj['landforms'].append({
        'id': 'lf_crook_kopa_splitter', 'kind': 'wave_splitter_islet', 'px': 90.0, 'py': 599.8,
        'r_m': 180.0, 'rx_m': 240.0, 'rz_m': 95.0, 'crest_m': 22.0, 'water_m': 0.0,
        'region': 'rmw4wknusgc7h',
        'note': 'Cyclopean prow-shaped columnar basalt wave-splitter across Kopa-North\'s 200 m seaward breach (CROOK-RIA-DECISIONS.md 1.1.3).',
    })
    D['landforms'] = lf_obj

    outside = ~own
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], -1)
        assert not (diff & outside).any(), f'{k} changed outside The Crook\'s own cells!'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in L_KEYS}

    sett_js_path = os.path.join(SRC, '60-settlements.js')
    s_txt = open(sett_js_path, encoding='utf-8', newline='').read()
    sett_summary = []
    created_ts = '2026-11-22T00:00:00.000Z'
    new_sett_objs = []
    for st in NEW_SETTS:
        sx, sy = int(st['px']), int(st['py'])
        assert not whas2[sy, sx], f"Settlement {st['id']} ({sx},{sy}) is on water!"
        el = round(float(En[sy, sx]))
        rn = round(float(rain_now[sy, sx]))
        obj = {
            'id': st['id'], 'name': st['name'], 'type': st['type'],
            'px': sx, 'py': sy, 'notes': st['notes'],
            'createdAt': created_ts, 'polity': st['polity'],
        }
        new_sett_objs.append(obj)
        sett_summary.append({'id': st['id'], 'name': st['name'], 'px': [sx, sy], 'elev_m': el, 'rain_mm': rn})
    rep['new_settlements'] = sett_summary

    yonni_note = ('Renamed Yonni from Yith (the owner, 2026-11-21; kits/yonni): coastal-montane citadel of the Twin-Born '
                  'Spear-Queens (Sfīra-Kandētæ, 90% identical-twin matriarchate; Mixed Kushitic-Sarmatian Yonni-Zāg), '
                  'controlling Scoured Hills southwest down the northern Farside coast to the Y = 515 Eternian frontier.')
    m_yith = re.search(r'\{"id": "svd298453u", "name": "[^"]*", "type": "[^"]*", "px": 346, "py": 418, "notes": "[^"]*", "createdAt": "([^"]*)"\}', s_txt)
    assert m_yith, 'svd298453u (Yith) not found in defSetts'
    yonni_rec = {'id': 'svd298453u', 'name': 'Yonni', 'type': 'town', 'px': 346, 'py': 418,
                 'notes': yonni_note, 'createdAt': m_yith.group(1), 'polity': 'Spear-Queens of Yonni'}
    s_txt = s_txt[:m_yith.start()] + json.dumps(yonni_rec, ensure_ascii=False) + s_txt[m_yith.end():]

    add_json = ', '.join(json.dumps(o, ensure_ascii=False) for o in new_sett_objs)
    m_def = re.search(r'(const defSetts = \[.*)\];\n', s_txt)
    assert m_def, 'defSetts not found in 60-settlements.js'
    s_txt = s_txt[:m_def.end(1)] + ', ' + add_json + s_txt[m_def.end(1):]

    m_add = re.search(r"(const SETT_ADDED=\{\n(?:.*\n)*?)(  \};\n)", s_txt)
    assert m_add, 'SETT_ADDED not found in 60-settlements.js'
    body_a = m_add.group(1).rstrip('\n')
    s_txt = s_txt[:m_add.start(1)] + body_a + ",\n    '5.1e20':[" + add_json + "]\n" + m_add.group(2) + s_txt[m_add.end(2):]

    m_mov = re.search(r"(const SETT_MOVED=\{\n(?:.*\n)*?)(  \};\n)", s_txt)
    assert m_mov, 'SETT_MOVED not found in 60-settlements.js'
    body_m = m_mov.group(1).rstrip('\n')
    s_txt = s_txt[:m_mov.start(1)] + body_m + ",\n    '5.1e20':[" + json.dumps(yonni_rec, ensure_ascii=False) + "]\n" + m_mov.group(2) + s_txt[m_mov.end(2):]

    rep['drainage_after'] = {}
    for rnm, rid in [('crookshore', 'rmw4wknusgc7h'), ('crookwash', 'rmwet8ethscuf'), ('crookhead', 'rmwetb495tgzt')]:
        rm = G.poly(R[rid]['points'], 1.0, 1.0, sh) > 0.5
        land_km2 = int((rm & ~whas2).sum()) * 4
        r_km, r_cnt = 0.0, 0
        for rv in D['rivers']:
            pts = rv.get('px', [])
            seg = 0.0
            hit = False
            for a_p, b_p in zip(pts, pts[1:]):
                mx_i, my_i = int(round(0.5 * (a_p[0] + b_p[0]))), int(round(0.5 * (a_p[1] + b_p[1])))
                if 0 <= mx_i < sh[1] and 0 <= my_i < sh[0] and rm[my_i, mx_i]:
                    seg += 2.0 * math.hypot(b_p[0] - a_p[0], b_p[1] - a_p[1])
                    hit = True
            if hit:
                r_cnt += 1
                r_km += seg
        rep['drainage_after'][rnm] = {'land_km2': land_km2, 'rivers': r_cnt, 'river_km': round(r_km, 1),
                                      'density_km_per_1000km2': round(1000.0 * r_km / max(1, land_km2), 2)}

    if DRY:
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return

    P.save(D)
    with open(sett_js_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s_txt)
    with open(os.path.join(HERE, 'edit_520_crook.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
