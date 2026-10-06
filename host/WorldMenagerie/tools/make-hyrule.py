#!/usr/bin/env python3
"""Generate Hyrule, as The Legend of Zelda: Breath of the Wild has it, as a map file the OSM engine can read.

    python3 tools/make-hyrule.py

Writes data/cities/hyrule-osm.json (terrain grid, the sea with the land cut out of it, the roads, the villages'
houses, the woods) and data/cities/hyrule-plan.json (where the castle, the towers, the shrines, the Divine Beasts and
the rest stand, the lakes and rivers with their levels, and the regions the page paints the ground by).

This is fan work. Hyrule and Breath of the Wild belong to Nintendo; nothing from the game is used, copied or
redistributed. The country is laid out by reading the game's published map by eye - where the regions, mountains,
lakes, rivers, roads and places are - and every shape is built here from simple features (a peak, a plateau, a
volcano, a basin) placed at those positions. The map image is a reference for arrangement only: no height, colour
or pixel of it is used, and it is not in the repository.

Positions below are written in the map's pixels (a 1500 x 1250 picture of the whole country, north up) and turned
into metres at 8 m a pixel: Hyrule comes out about twelve kilometres across, Hyrule Field near the middle.
"""
import json
import math
import os
import random
from lib.geo import q, flat, rect, smoothstep, simplify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "cities", "hyrule-osm.json")
PLAN = os.path.join(ROOT, "data", "cities", "hyrule-plan.json")
R = random.Random(1987)

ORIGIN = (0.0, 0.0)
PX = 8.0                                    # metres per pixel of the reference
CX, CY = 760.0, 620.0                       # the pixel at the origin
X0, X1, Z0, Z1 = -6200.0, 6200.0, -5200.0, 5200.0
STEP = 24.0


def P(px, py):
    """A pixel of the reference to metres: x east, z south."""
    return ((px - CX) * PX, (py - CY) * PX)


def Pl(pts):
    return [P(a, b) for a, b in pts]


# ---------------------------------------------------------------- the coast
# The land is everything inside this outline: the sea is east and south-east (the Lanayru, Necluda and Faron seas);
# west and north the land runs on out of the map, into the mountains at the edge of the world.
COAST = Pl([(-80, -80), (1480, -80), (1440, 20), (1390, 70), (1340, 115), (1310, 145), (1330, 170), (1370, 172),
            (1400, 185), (1425, 210), (1428, 245), (1408, 275), (1395, 298), (1365, 305), (1352, 330), (1356, 360),
            (1372, 385), (1376, 420), (1373, 460), (1372, 500), (1376, 540), (1380, 580), (1385, 612),
            # Lanayru Bay: in by a narrow way between Zora's Domain and the cape east of Mount Lanayru
            (1366, 640), (1352, 665), (1346, 695), (1325, 703), (1290, 700), (1255, 697), (1225, 707), (1212, 725),
            (1218, 750), (1245, 766), (1290, 757), (1330, 765), (1348, 748), (1356, 712), (1368, 668), (1380, 648),
            (1393, 660), (1397, 720), (1398, 790), (1402, 860), (1400, 900), (1405, 935),
            # Hateno's three capes, and the bay below the village
            (1418, 960), (1415, 990), (1395, 995), (1380, 975), (1365, 955), (1352, 960), (1348, 985), (1336, 988),
            (1330, 960), (1318, 958), (1312, 985), (1300, 980), (1295, 955), (1270, 965), (1255, 980), (1238, 1000),
            (1225, 1030), (1228, 1060), (1250, 1078), (1272, 1088), (1250, 1100), (1228, 1105),
            # the hooked spit, Lurelin's inlet, and the long south coast of Faron
            (1215, 1125), (1225, 1150), (1260, 1150), (1290, 1118), (1297, 1124), (1270, 1162), (1225, 1168),
            (1190, 1160), (1180, 1145), (1172, 1112), (1160, 1110), (1155, 1140), (1120, 1160), (1080, 1162),
            (1040, 1175), (1000, 1172), (970, 1150), (930, 1160), (880, 1168), (830, 1172), (780, 1178), (730, 1172),
            (690, 1166), (660, 1178), (655, 1330), (-80, 1330)])
ISLANDS = [(P(1398, 1130), 27 * PX, "Eventide Island", 160.0)] + [(P(px, py), r * PX, "an islet", top) for px, py, r, top in
           [(1405, 440, 7, 26), (1413, 470, 5, 18), (1406, 506, 7, 30), (1412, 540, 5, 16), (1400, 560, 4, 14),
            (1405, 135, 16, 12)]]
LAKE_LEVEL = {}                                 # the levels worked out for lakes given as None (main fills it in)


def in_poly(x, z, poly):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, zi = poly[i]
        xj, zj = poly[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            c = not c
        j = i
    return c


def seg_dist(x, z, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L = dx * dx + dz * dz
    t = 0 if L == 0 else max(0.0, min(1.0, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
    return math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)


def coast_dist(x, z):
    return min(seg_dist(x, z, COAST[i], COAST[i + 1]) for i in range(len(COAST) - 1))


# ---------------------------------------------------------------- the land's features
# Two kinds. MASSIFS are the country's highlands, each an outline read off the map by eye (a few dozen points, in the
# map's pixels) with the height its top reaches and how wide the slope up to it is: like a contour map drawn by hand,
# nested outlines stepping up - the tan of a highland, then its snow. The ground takes the highest of them. FEATURES
# are the few things better made by rule: single peaks, the volcano, the plateaus with cliff walls, the desert's dunes.
# (name, top m, slope px, outline)
MASSIFS = [
    # the mountains at the edge of the world, north and west, beyond the low ground that rings the country
    ("the edge of the world, north", 1300, 40, [(-80, -80), (1340, -80), (1300, 20), (1250, 58), (1150, 62), (1080, 50), (1000, 48),
        (900, 40), (800, 45), (700, 45), (600, 42), (520, 35), (470, 42), (440, 75), (400, 100), (370, 95), (345, 65), (320, 25),
        (200, 20), (100, 25), (60, 45), (30, 60), (-80, 60)]),
    ("the edge of the world, west", 1300, 40, [(-80, 40), (30, 60), (25, 150), (28, 250), (45, 290), (70, 340), (95, 400), (130, 450),
        (145, 500), (135, 550), (110, 590), (70, 610), (40, 640), (15, 700), (5, 800), (-80, 820)]),
    # Hebra and Tabantha: one highland from Hebra's west wall to the tundra, Rito Village and the Tabantha Frontier
    ("Hebra and Tabantha", 330, 22, [(150, 110), (200, 108), (260, 100), (310, 108), (360, 125), (400, 152), (420, 160), (445, 138),
        (470, 118), (510, 106), (545, 112), (575, 128), (610, 122), (640, 128), (660, 123), (690, 135), (692, 162), (672, 182),
        (645, 195), (640, 218), (650, 240), (640, 258), (628, 262), (600, 285), (565, 318), (530, 360), (500, 380), (470, 400),
        (440, 410), (400, 405), (370, 410), (330, 430), (325, 500), (330, 560), (320, 600), (300, 620), (250, 625), (210, 615),
        (205, 560), (200, 500), (205, 440), (190, 410), (165, 395), (150, 370), (152, 330), (145, 280), (138, 220), (135, 170), (140, 130)]),
    ("the Tabantha Tundra", 460, 40, [(470, 125), (545, 112), (610, 124), (660, 124), (690, 138), (690, 165), (660, 192), (645, 220),
        (640, 255), (600, 285), (560, 318), (520, 345), (470, 330), (440, 290), (450, 200)]),
    ("the Hebra Mountains", 820, 45, [(250, 118), (300, 113), (340, 138), (390, 163), (425, 168), (455, 148), (485, 130), (520, 135),
        (560, 150), (595, 170), (600, 200), (585, 225), (545, 235), (500, 255), (450, 275), (400, 290), (355, 305), (320, 285),
        (290, 250), (262, 215), (248, 175)]),
    ("Hebra's western snows", 700, 30, [(160, 115), (225, 112), (235, 140), (215, 170), (180, 165), (160, 140)]),
    ("the Frontier's hills", 420, 30, [(225, 460), (270, 455), (300, 480), (310, 530), (300, 580), (260, 595), (225, 570), (215, 510)]),
    # Hyrule Ridge, and the Ridgeland running east past the Great Hyrule Forest under Death Mountain
    ("Hyrule Ridge", 300, 30, [(358, 420), (420, 415), (480, 420), (530, 430), (570, 440), (592, 470), (588, 520), (572, 560),
        (560, 600), (520, 625), (470, 630), (420, 625), (380, 615), (360, 580), (355, 520)]),
    ("the Ridgeland", 190, 35, [(655, 233), (680, 215), (700, 190), (712, 150), (728, 118), (780, 110), (860, 108), (950, 112),
        (1000, 118), (975, 200), (950, 260), (930, 330), (922, 400), (910, 440), (860, 448), (800, 445), (740, 445), (690, 448),
        (640, 440), (600, 438), (560, 440), (520, 432), (498, 405), (515, 375), (555, 335), (595, 295), (628, 268), (645, 250)]),
    # Eldin: a broad foot, the snow and ash above it, the volcano on top (a FEATURE)
    ("Eldin", 330, 40, [(905, 125), (1000, 118), (1080, 118), (1150, 116), (1210, 113), (1232, 150), (1228, 250), (1218, 350),
        (1205, 430), (1190, 500), (1150, 540), (1100, 560), (1050, 560), (1000, 540), (960, 500), (935, 445), (915, 390), (908, 300), (905, 200)]),
    ("Death Mountain's shoulders", 720, 70, [(950, 140), (1000, 122), (1080, 120), (1150, 115), (1190, 140), (1200, 190), (1205, 260),
        (1195, 330), (1180, 390), (1150, 428), (1100, 442), (1040, 438), (1000, 420), (975, 370), (962, 300), (955, 220)]),
    # Akkala, down to its coast; Zora's Domain on its height; Mount Lanayru and the Necluda hills
    ("Akkala", 210, 30, [(1210, 113), (1245, 118), (1285, 140), (1310, 150), (1330, 172), (1370, 175), (1400, 188), (1422, 212),
        (1425, 245), (1406, 275), (1390, 295), (1365, 305), (1352, 330), (1356, 360), (1370, 385), (1374, 420), (1372, 460),
        (1375, 500), (1340, 510), (1300, 505), (1250, 495), (1210, 480), (1195, 400), (1205, 300), (1225, 200)]),
    ("Zora's Domain", 380, 35, [(1150, 470), (1200, 460), (1260, 470), (1320, 490), (1360, 520), (1372, 560), (1370, 610),
        (1345, 640), (1330, 680), (1290, 694), (1250, 692), (1210, 690), (1180, 680), (1160, 652), (1140, 610), (1142, 540)]),
    ("Necluda", 250, 35, [(990, 668), (1060, 660), (1120, 668), (1160, 690), (1200, 700), (1218, 712), (1212, 742), (1240, 768),
        (1290, 757), (1345, 752), (1380, 800), (1398, 880), (1405, 935), (1418, 962), (1380, 992), (1290, 978), (1255, 985),
        (1228, 1030), (1232, 1080), (1210, 1110), (1180, 1112), (1150, 1092), (1100, 1072), (1060, 1045), (1035, 995),
        (1020, 945), (1045, 905), (1075, 860), (1065, 820), (1035, 800), (1005, 780), (985, 740), (982, 700)]),
    ("Mount Lanayru", 700, 60, [(1215, 775), (1260, 768), (1300, 762), (1340, 770), (1370, 790), (1392, 820), (1395, 880),
        (1385, 935), (1350, 948), (1300, 948), (1262, 935), (1232, 900), (1212, 860), (1205, 815)]),
    ("the hills over Kakariko", 360, 30, [(1010, 700), (1060, 690), (1130, 700), (1170, 730), (1180, 770), (1150, 800), (1100, 800),
        (1060, 792), (1030, 780), (1010, 750)]),
    ("East Necluda", 380, 40, [(1020, 960), (1080, 945), (1140, 950), (1200, 960), (1235, 990), (1230, 1060), (1200, 1080),
        (1150, 1080), (1100, 1075), (1060, 1060), (1030, 1030), (1015, 990)]),
    ("West Necluda", 220, 30, [(890, 845), (950, 835), (1000, 850), (1010, 900), (1000, 960), (960, 990), (915, 985), (890, 940), (880, 890)]),
    ("Faron's south hills", 110, 30, [(690, 1110), (760, 1100), (830, 1110), (900, 1120), (960, 1120), (1000, 1140), (1000, 1170),
        (930, 1160), (830, 1172), (730, 1172), (690, 1166)]),
    # the Gerudo Highlands and their long apron, the canyon running south-east from them, and the mesa at its end
    ("the Gerudo apron", 380, 60, [(0, 620), (130, 612), (200, 622), (330, 640), (362, 690), (372, 738), (420, 765), (470, 800),
        (490, 840), (470, 880), (430, 905), (330, 915), (250, 905), (180, 910), (100, 905), (30, 900), (0, 880)]),
    ("the Gerudo Highlands", 950, 70, [(20, 660), (60, 640), (120, 630), (190, 632), (250, 648), (310, 668), (360, 705), (378, 740),
        (420, 772), (445, 820), (440, 870), (400, 880), (340, 885), (280, 872), (220, 880), (150, 875), (90, 865), (40, 850), (15, 800)]),
    ("the Gerudo Canyon", 330, 30, [(420, 880), (470, 880), (505, 915), (525, 955), (548, 995), (578, 1028), (608, 1048), (618, 1100),
        (612, 1150), (590, 1168), (560, 1150), (540, 1110), (520, 1062), (490, 1032), (460, 1002), (440, 962), (425, 920)]),
    ("the southern mesa", 230, 18, [(490, 1180), (520, 1170), (600, 1172), (650, 1180), (662, 1260), (500, 1260), (480, 1220)]),
]
# ---------------------------------------------------------------- the biomes
# What grows and what the ground is, region by region, as outlines read off the map like the highlands: the page
# paints the ground and plants the flora by them. Later outlines win over earlier ones; outside them all is
# grassland (Hyrule Field, the plateau, the foothills). Keys: g grassland, H highland evergreens, F temperate woods,
# L the Lost Woods, J jungle, W wetland marsh, D desert dunes, C red-rock canyon, R arid highland, T tundra,
# S snowfield, A autumn woods, V volcanic ash.
BIOMES = [
    ("H", "the Tabantha Frontier", [(205, 440), (330, 430), (330, 560), (320, 600), (250, 625), (210, 615)]),
    ("H", "Hyrule Ridge", [(358, 420), (420, 415), (480, 420), (530, 430), (570, 440), (592, 470), (588, 520), (572, 560), (560, 600),
                           (520, 625), (470, 630), (420, 625), (380, 615), (360, 580), (355, 520)]),
    ("F", "the Ridgeland's woods", [(560, 330), (640, 262), (700, 240), (745, 280), (725, 330), (690, 400), (600, 425), (545, 400)]),
    ("F", "the woods west of Hateno", [(1040, 880), (1100, 860), (1180, 880), (1200, 940), (1120, 952), (1050, 932)]),
    ("F", "East Necluda's woods", [(1030, 960), (1110, 948), (1190, 962), (1215, 1010), (1180, 1060), (1100, 1060), (1040, 1030)]),
    ("T", "Hebra and the Tabantha Tundra", [(150, 110), (260, 100), (400, 152), (470, 118), (545, 112), (640, 128), (690, 135), (692, 162),
                                          (645, 195), (650, 240), (628, 262), (565, 318), (500, 380), (440, 410), (370, 410), (330, 430),
                                          (205, 440), (165, 395), (145, 280), (135, 170)]),
    ("R", "the Gerudo Highlands' apron", [(0, 620), (130, 612), (330, 640), (362, 690), (372, 738), (420, 765), (470, 800), (490, 840),
                                        (470, 880), (330, 915), (100, 905), (0, 880)]),
    ("D", "the Gerudo Desert", [(-80, 890), (150, 900), (300, 912), (420, 905), (440, 960), (470, 1010), (510, 1050), (540, 1110),
                                (560, 1160), (500, 1180), (480, 1220), (500, 1330), (-80, 1330)]),
    ("C", "the Gerudo Canyon", [(420, 880), (470, 880), (505, 915), (525, 955), (548, 995), (578, 1028), (608, 1048), (618, 1100),
                                (612, 1150), (590, 1168), (560, 1150), (540, 1110), (520, 1062), (490, 1032), (460, 1002), (440, 962), (425, 920)]),
    ("C", "the southern mesa", [(490, 1180), (520, 1170), (600, 1172), (650, 1180), (662, 1260), (500, 1260), (480, 1220)]),
    ("A", "Akkala", [(1210, 113), (1245, 118), (1285, 140), (1330, 172), (1400, 188), (1425, 245), (1390, 295), (1352, 330), (1374, 420),
                     (1375, 500), (1300, 505), (1210, 480), (1195, 400), (1205, 300), (1225, 200)]),
    ("V", "Eldin", [(905, 125), (1210, 113), (1232, 150), (1228, 250), (1218, 350), (1205, 430), (1190, 500), (1150, 540), (1100, 560),
                    (1050, 560), (1000, 540), (960, 500), (935, 445), (915, 390), (908, 300), (905, 200)]),
    ("W", "the Lanayru Wetlands", [(925, 610), (990, 600), (1060, 630), (1080, 680), (1060, 740), (1000, 750), (940, 730), (915, 680)]),
    ("W", "the marsh at Lake Hylia's head", [(690, 905), (740, 895), (790, 910), (800, 935), (760, 945), (700, 945)]),
    ("J", "Faron", [(830, 1000), (900, 960), (1000, 990), (1040, 1040), (1060, 1100), (1040, 1170), (930, 1160), (830, 1170), (760, 1140),
                    (740, 1080), (780, 1040)]),
    ("L", "the Lost Woods", [(745, 268), (800, 258), (870, 270), (898, 320), (895, 395), (850, 415), (780, 412), (742, 380), (735, 320)]),
    ("S", "the Hebra Mountains", [(250, 118), (300, 113), (340, 138), (390, 163), (425, 168), (455, 148), (485, 130), (520, 135), (560, 150),
                                  (595, 170), (600, 200), (585, 225), (545, 235), (500, 255), (450, 275), (400, 290), (355, 305), (320, 285),
                                  (290, 250), (262, 215), (248, 175)]),
    ("S", "the Gerudo Highlands", [(20, 660), (60, 640), (120, 630), (190, 632), (250, 648), (310, 668), (360, 705), (378, 740), (420, 772),
                                   (445, 820), (440, 870), (400, 880), (340, 885), (280, 872), (220, 880), (150, 875), (90, 865), (40, 850), (15, 800)]),
    ("S", "Mount Lanayru's summit", [(1240, 790), (1300, 778), (1360, 795), (1380, 850), (1360, 900), (1300, 915), (1250, 895), (1232, 840)]),
]
BIOME_KEYS = "gHFLJWDCRTSAV"

# (kind, pixel x, pixel y, radius x px, radius y px, height m, name)
FEATURES = [
    ("peak", 300, 150, 70, 45, 1250, "Hebra Peak"), ("peak", 450, 200, 90, 55, 1150, "Hebra's eastern summits"),
    ("peak", 590, 195, 35, 30, 800, "the Tundra's hill"), ("peak", 195, 140, 35, 25, 900, "Hebra's west summit"),
    ("plateau", 282, 384, 78, 66, 490, "the Rito highland"),
    ("peak", 110, 730, 55, 90, 1300, "Gerudo Summit"), ("peak", 330, 770, 90, 40, 1100, "the Gerudo Highlands' east end"),
    ("peak", 588, 1095, 22, 48, 650, "the canyon's snowy peak"),
    ("desert", 220, 1060, 330, 200, 70, "Gerudo Desert"),
    ("plateau", 472, 715, 92, 72, 240, "Great Plateau"), ("hill", 395, 520, 30, 35, 420, "Satori Mountain"),
    ("hill", 735, 495, 45, 38, 70, "Hyrule Castle's hill"),
    ("hill", 640, 860, 60, 50, 120, "Ruined hills"), ("hill", 580, 1010, 70, 70, 180, "Faron Grasslands hills"),
    ("plateau", 820, 338, 75, 72, 150, "Great Hyrule Forest"),
    ("volcano", 1120, 265, 105, 95, 1150, "Death Mountain"),
    ("hill", 1225, 168, 45, 38, 280, "Skull Lake's rim"),
    ("peak", 1300, 545, 40, 30, 650, "Ploymus Mountain"), ("hill", 1178, 668, 22, 20, 160, "the Great Spring's hill"),
    ("peak", 1300, 840, 75, 65, 1050, "Mount Lanayru"),
    ("peak", 936, 872, 24, 26, 440, "Dueling Peaks west"), ("peak", 966, 918, 24, 26, 430, "Dueling Peaks east"),   # split by the Squabble River
    ("hill", 960, 1050, 120, 70, 140, "Faron jungle"), ("hill", 1110, 1125, 40, 32, 220, "Lurelin hills"),
]


def biome_grid():
    """The biomes as a coarse raster for the page: a key per 48 m cell, the last outline containing it."""
    step = 48.0
    nx_, nz_ = int((X1 - X0) // step) + 1, int((Z1 - Z0) // step) + 1
    polys = [(k, Pl(poly)) for k, n, poly in BIOMES]
    boxes = [(k, poly, min(x for x, z in poly), max(x for x, z in poly), min(z for x, z in poly), max(z for x, z in poly)) for k, poly in polys]
    rows = []
    for j in range(nz_):
        z = Z0 + (j + 0.5) * step
        row = []
        for i in range(nx_):
            x = X0 + (i + 0.5) * step
            key = "g"
            for k, poly, a, b, c, d in boxes:
                if a <= x <= b and c <= z <= d and in_poly(x, z, poly):
                    key = k
            row.append(key)
        rows.append("".join(row))
    return {"step": step, "x0": X0, "z0": Z0, "nx": nx_, "nz": nz_, "keys": BIOME_KEYS, "rows": rows,
            "names": [[k, n] for k, n, p in BIOMES]}


def massif_grid(xs, zs):
    """The highest of the massifs over the whole terrain grid, at once (numpy): each outline's signed distance, then
    its top eased in over its slope, varied a little so no highland is a flat table, with ridges on the high ones."""
    import numpy as np
    GX, GZ = np.meshgrid(np.asarray(xs, float), np.asarray(zs, float))
    out = np.zeros(GX.shape)
    nz_ = (np.sin(GX / 431.0 + 0.7) * np.cos(GZ / 377.0 - 0.4) * 0.6 + np.sin(GX / 173.0 - GZ / 211.0) * 0.3
           + np.cos(GX / 89.0 + GZ / 97.0) * 0.12)
    n2 = np.sin(GX / 730.0 + 1.3) * np.cos(GZ / 610.0 - 0.2) * 0.5 + np.sin(GX / 1210.0 - GZ / 980.0) * 0.5   # broad swells across a top
    rd = np.maximum(1 - np.abs(np.sin(GX / 290.0 + np.sin(GZ / 410.0) * 1.6)), 1 - np.abs(np.sin(GZ / 330.0 + np.sin(GX / 520.0) * 1.3))) ** 2
    jit = 70 * (np.sin(GX / 213.0 + np.cos(GZ / 167.0) * 2.1) * 0.6 + np.sin(GZ / 241.0 - GX / 389.0) * 0.4)
    for name, top, ramp, poly in MASSIFS:
        pts = Pl(poly)
        d = np.full(GX.shape, np.inf)
        inside = np.zeros(GX.shape, bool)
        for k in range(len(pts)):
            (ax, az), (bx, bz) = pts[k], pts[(k + 1) % len(pts)]
            dx, dz = bx - ax, bz - az
            L = dx * dx + dz * dz or 1e-9
            t = np.clip(((GX - ax) * dx + (GZ - az) * dz) / L, 0, 1)
            d = np.minimum(d, np.hypot(GX - ax - t * dx, GZ - az - t * dz))
            if az != bz:
                inside ^= ((az > GZ) != (bz > GZ)) & (GX < dx * (GZ - az) / dz + ax)
        # the outline wanders a little (no straight facets), and the slope up is a long one: the map's highlands mostly
        # rise over a few hundred metres; the cliff-walled tables are FEATURES
        u = np.clip((np.where(inside, d, -d) + jit) / (ramp * PX * 1.6), 0, 1)
        k = u * u * (3 - 2 * u)
        v = top * k * (0.8 + 0.12 * nz_ + 0.12 * n2) + top * rd * k * (0.16 if top > 500 else 0.08)
        out = np.maximum(out, v)
    return out


def bump(x, z, c, rx, rz, inner=0.0, ragged=False):
    dx, dz = (x - c[0]) / rx, (z - c[1]) / rz
    d = math.sqrt(dx * dx + dz * dz)
    if ragged:                                               # a plateau's edge is ragged, not round
        a = math.atan2(dz, dx)
        d *= 1 + 0.07 * math.sin(3 * a + c[0] * 0.001) + 0.05 * math.sin(7 * a + c[1] * 0.002) + 0.03 * math.sin(13 * a)
    return d, max(0.0, 1.0 - smoothstep(inner, 1.0, d))


def noise(x, z):
    return (math.sin(x / 431.0 + 0.7) * math.cos(z / 377.0 - 0.4) * 0.6 + math.sin(x / 173.0 - z / 211.0) * 0.3
            + math.cos(x / 89.0 + z / 97.0) * 0.12)


def ridge(x, z):
    """0-1: sharp-crested ridges running out from the peaks, a few hundred metres apart (a low frequency: finer
    detail than the 24 m grid can hold only aliases into stripes)."""
    a = 1 - abs(math.sin(x / 290.0 + math.sin(z / 410.0) * 1.6))
    b = 1 - abs(math.sin(z / 330.0 + math.sin(x / 520.0) * 1.3))
    return max(a, b) ** 2


def feature_height(x, z):
    h = 0.0
    for kind, px, py, rx, ry, top, name in FEATURES:
        c = P(px, py)
        d, k = bump(x, z, c, rx * PX, ry * PX, ragged=kind in ('plateau', 'volcano'))
        if k <= 0:
            continue
        if kind == "peak":
            v = top * (1 - d) ** 1.35 * (0.86 + 0.1 * noise(x * 0.8 + 1000, z * 0.8) + 0.12 * ridge(x, z)) if d < 1 else 0   # ridged shoulders
        elif kind == "hill":
            v = top * k * (0.82 + 0.18 * noise(x * 0.9 + 300, z * 0.9))
        elif kind == "plateau":
            v = top * (1 - smoothstep(0.86, 1.0, d)) + 6 * noise(x * 1.2, z * 1.2) * (d < 0.86)
        elif kind == "volcano":
            v = top * (1 - d) ** 1.1 if d < 1 else 0
            v -= 220 * (1 - smoothstep(0.0, 0.16, d))                 # the crater
        elif kind == "desert":
            v = top * k + 9 * math.sin(x / 61.0 + math.sin(z / 140.0) * 2) * k   # dunes, running north-south
        else:
            v = top * k
        h = max(h, v)
    return h


# ---------------------------------------------------------------- water: lakes and rivers
# lakes: (name, pixel polygon or (centre, rx, ry), water level m)
def ellipse(cx, cy, rx, ry, n=28, rot=0.0):
    c, s_ = math.cos(rot), math.sin(rot)
    return [P(cx + (rx * math.cos(a)) * c - (ry * math.sin(a)) * s_, cy + (rx * math.cos(a)) * s_ + (ry * math.sin(a)) * c)
            for a in [i / n * math.tau for i in range(n)]]


# level None: worked out from the ground round the lake (the lowest point of its shore, less a metre), so a lake up in
# the hills sits where the hills put it. hot: a hot spring - teal and steaming (the page draws it so).
LAKES = [
    ("Lake Hylia", Pl([(683, 960), (700, 933), (750, 932), (752, 950), (770, 935), (790, 945), (805, 975), (822, 995), (828, 1015),
                      (810, 1018), (790, 1005), (775, 1000), (745, 1010), (725, 1030), (712, 1043), (700, 1030), (690, 1005), (682, 985)]), 12.0),
    ("Lanayru Wetlands", Pl([(950, 625), (985, 612), (1010, 630), (1045, 640), (1062, 660), (1050, 690), (1020, 705), (1000, 725),
                            (970, 728), (950, 712), (944, 680), (948, 650)]), 26.0),
    ("East Reservoir Lake", Pl([(1247, 590), (1265, 580), (1290, 585), (1300, 600), (1292, 618), (1282, 632), (1270, 647), (1255, 642),
                               (1243, 626), (1240, 605)]), None),
    ("the lake north of the forest", ellipse(808, 210, 22, 24), None),
    ("Rito Village's lake", ellipse(278, 385, 32, 26), None),   # up on the Rito highland
    ("Hyrule Ridge's lake", ellipse(478, 530, 22, 28, rot=0.3), None),
    ("Skull Lake", ellipse(1225, 168, 17, 14), None),
    ("Lake Akkala", Pl([(1285, 380), (1310, 375), (1318, 395), (1305, 410), (1302, 430), (1310, 450), (1330, 462), (1305, 468),
                        (1288, 450), (1282, 415)]), None),   # round the west of Tarrey Town's rock
    ("Akkala's long tarn", ellipse(1317, 215, 5, 20), None),
    ("the Lanayru Great Spring", ellipse(1178, 668, 9, 9), None),
    ("Necluda's long lake", ellipse(1132, 784, 30, 6, rot=-0.45), None),
    ("the lake by the plateau", ellipse(604, 905, 28, 14), None),
    ("the pool below the plateau", ellipse(522, 860, 15, 14), None),
    ("the lake north of Lake Hylia", ellipse(832, 915, 22, 30), None),
    ("Hebra's long lake", Pl([(232, 252), (245, 262), (238, 285), (222, 305), (205, 322), (190, 333), (185, 325), (200, 305), (215, 285), (226, 262)]), None),
    ("Hebra's eastern lake", Pl([(352, 322), (362, 328), (366, 348), (372, 362), (390, 368), (400, 378), (385, 382), (362, 376), (347, 352), (346, 332)]), None),
    ("Hebra's narrow lake", ellipse(394, 320, 4, 22, rot=-0.4), None),
    ("Tabantha's lake", ellipse(298, 452, 18, 15), None),
    ("a pond in the field", ellipse(700, 792, 14, 8, rot=0.3), None),
    ("a pond by the woods", ellipse(852, 716, 8, 8), None),
    ("a pond on the plain", ellipse(618, 690, 7, 6), None),
    ("Lurelin's tarn", ellipse(1110, 1128, 6, 8), None),
    ("the Goron hot springs", ellipse(1062, 448, 24, 8, rot=-0.3), None, True),
    ("the hot crater lake", ellipse(1130, 160, 13, 13), None, True),
]
LAKES = [l if len(l) == 4 else l + (False,) for l in LAKES]
# moats: (name, centre px, inner radius px, outer radius px, level)
MOATS = [("Hyrule Castle's moat", (730, 505), 46, 58, 34.0), ("the moat of the Great Hyrule Forest", (820, 338), 80, 92, 42.0)]
# the two rivers that frame Hyrule Field, from the castle's water down to Lake Hylia, and the one round the plateau
RIVERS = [
    ("Hylia River", [(792, 470), (833, 468), (876, 539), (881, 635), (857, 730), (824, 802), (800, 897), (772, 930)], 32),
    ("the western river", [(668, 470), (647, 530), (618, 601), (588, 640), (582, 690), (575, 735), (560, 775), (540, 800), (525, 830),
                           (530, 870), (565, 895), (610, 905), (650, 930), (690, 945), (712, 952)], 26),   # down the plateau's east side
    ("the plateau's river", [(368, 735), (372, 700), (400, 690), (425, 660), (450, 645), (480, 648), (520, 652), (560, 648), (588, 640)], 22),
    ("Lanayru River", [(1170, 640), (1080, 612), (1035, 640), (990, 600), (930, 575), (882, 590)], 30),   # into the Hylia River
    ("Faron River", [(750, 1000), (760, 1080), (768, 1180)], 26),
    ("Squabble River", [(1062, 962), (1010, 925), (951, 895), (905, 882), (860, 870), (824, 850)], 22),   # between the Dueling Peaks
    ("Zora River", [(1255, 640), (1210, 650), (1170, 640)], 26),
]


def lake_mask(x, z):
    for name, poly, lv, hot in LAKES:
        if in_poly(x, z, poly):
            return lv if lv is not None else LAKE_LEVEL.get(name, 30.0)
    for name, (px, py), r0, r1, lv in MOATS:
        c = P(px, py)
        d = math.hypot(x - c[0], z - c[1]) / PX
        if r0 <= d <= r1:
            return lv
    return None


def raw_height(x, z, massif=0.0):
    if not in_poly(x, z, COAST) and not any(math.hypot(x - c[0], z - c[1]) < r for c, r, n, t in ISLANDS):
        return None
    base = 24 + 14 * noise(x * 0.5, z * 0.5) + 10 * noise(x * 0.25 + 900, z * 0.27)
    for c, r, n, top in ISLANDS:
        d = math.hypot(x - c[0], z - c[1]) / r
        if d < 1:
            base = max(base, top * (1 - d) ** 1.5 + 2)
    return max(base, massif, feature_height(x, z))


def main():
    out = {"attribution": "Hyrule: fan geometry generated by tools/make-hyrule.py; nothing from the game is used",
           "units": "decimetres east (x) and south (z) of origin", "origin": list(ORIGIN), "seaLevelWater": True}
    mlat, mlon = 111132.0, 111320.0
    ll = lambda x, z: [round(ORIGIN[0] - z / mlat, 6), round(ORIGIN[1] + x / mlon, 6)]
    s0, w0 = ll(X0, Z1)
    n0, e0 = ll(X1, Z0)
    out["bounds"] = [s0, w0, n0, e0]

    # ---------- terrain: features, then the coast, then the lakes and rivers cut into it ----------
    nx = int((X1 - X0) // STEP) + 2
    nz = int((Z1 - Z0) // STEP) + 2
    H = [[0.0] * nx for _ in range(nz)]
    MG = massif_grid([X0 + i * STEP for i in range(nx)], [Z0 + j * STEP for j in range(nz)])
    for j in range(nz):
        z = Z0 + j * STEP
        for i in range(nx):
            x = X0 + i * STEP
            h = raw_height(x, z, float(MG[j][i]))
            if h is None:                                            # the sea: shelving away from the coast
                d = coast_dist(x, z)
                h = 0.7 - min(30.0, 1.5 + d * 0.02)
            else:
                d = coast_dist(x, z) if x > 3000 or z > 3000 else 999
                h = 1.2 + (h - 1.2) * smoothstep(0, 140, d)          # a beach before the land rises
            H[j][i] = h

    def carve(poly_pts, width, depth_below):
        """Cut a channel along a polyline: down to a smooth water level that only ever falls downstream."""
        pts = Pl([(a, b) for a, b in poly_pts])
        levels = []
        for x, z in pts:
            i, j = int((x - X0) / STEP), int((z - Z0) / STEP)
            levels.append(H[max(0, min(nz - 1, j))][max(0, min(nx - 1, i))])
        for k in range(1, len(levels)):
            levels[k] = min(levels[k], levels[k - 1])                 # a river never runs uphill
        river = []
        for k in range(len(pts) - 1):
            a, b = pts[k], pts[k + 1]
            la, lb = levels[k] - depth_below, levels[k + 1] - depth_below
            x0, x1 = min(a[0], b[0]) - width * 3, max(a[0], b[0]) + width * 3
            z0, z1 = min(a[1], b[1]) - width * 3, max(a[1], b[1]) + width * 3
            for j in range(max(0, int((z0 - Z0) / STEP)), min(nz, int((z1 - Z0) / STEP) + 2)):
                for i in range(max(0, int((x0 - X0) / STEP)), min(nx, int((x1 - X0) / STEP) + 2)):
                    x, z = X0 + i * STEP, Z0 + j * STEP
                    dx, dz = b[0] - a[0], b[1] - a[1]
                    L = dx * dx + dz * dz
                    t = 0 if L == 0 else max(0.0, min(1.0, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
                    d = math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)
                    bed = la + (lb - la) * t
                    if d < width * 3:
                        w = smoothstep(width * 3, width * 0.5, d)
                        H[j][i] = min(H[j][i], H[j][i] + (bed - H[j][i]) * w)
            river.append([round(a[0], 1), round(a[1], 1), round(la + depth_below - 1.0, 1)])
        river.append([round(pts[-1][0], 1), round(pts[-1][1], 1), round(levels[-1] - 1.0, 1)])
        return river

    # the lakes given without a level: the lowest ground round the shore, less a metre
    for name, poly, lv, hot in LAKES:
        if lv is None:
            rim = []
            for x, z in poly:
                i, j = int((x - X0) / STEP), int((z - Z0) / STEP)
                rim.append(H[max(0, min(nz - 1, j))][max(0, min(nx - 1, i))])
            LAKE_LEVEL[name] = round(min(rim) - 1.0, 1)
    CANYONS = []
    def gorge(poly_pts, floor_w, wall_w, depth, floor_min=8.0):
        """A canyon, not a valley: a flat floor floor_w across, walls rising sheer over wall_w either side, the floor
        depth metres under the lowest rim along the way (and never under floor_min), stepping down as it goes."""
        pts = Pl(poly_pts)
        CANYONS.append({"pts": [[round(x, 1), round(z, 1)] for x, z in pts], "floor": floor_w, "wall": wall_w})
        rims = []
        for x, z in pts:
            i, j = int((x - X0) / STEP), int((z - Z0) / STEP)
            rims.append(min(H[max(0, min(nz - 1, jj))][max(0, min(nx - 1, ii))] for ii in range(i - 3, i + 4) for jj in range(j - 3, j + 4)))
        beds = [max(floor_min, r - depth) for r in rims]
        for k in range(1, len(beds)):
            beds[k] = min(beds[k], beds[k - 1] + 2)        # the floor runs on level or down, not up a cliff
        for k in range(len(pts) - 1):
            a, b = pts[k], pts[k + 1]
            r = floor_w + wall_w
            for j in range(max(0, int((min(a[1], b[1]) - r - Z0) / STEP)), min(nz, int((max(a[1], b[1]) + r - Z0) / STEP) + 2)):
                for i in range(max(0, int((min(a[0], b[0]) - r - X0) / STEP)), min(nx, int((max(a[0], b[0]) + r - X0) / STEP) + 2)):
                    x, z = X0 + i * STEP, Z0 + j * STEP
                    dx, dz = b[0] - a[0], b[1] - a[1]
                    L = dx * dx + dz * dz
                    t = 0 if L == 0 else max(0.0, min(1.0, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
                    d = math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)
                    if d > r:
                        continue
                    bed = beds[k] + (beds[k + 1] - beds[k]) * t + 3 * math.sin(x / 37.0 + z / 53.0)
                    u = smoothstep(floor_w * 0.5, r, d)                  # 0 on the floor, 1 at the rim
                    wall = bed + (H[j][i] - bed) * (u ** 0.35 if u < 1 else 1)   # steep: most of the height in the last stretch
                    H[j][i] = min(H[j][i], wall)
    # the canyons, cut sheer: Tabantha's across the tundra under its great bridge; Tanagar between the Frontier and
    # Hyrule Ridge; the western canyon below the Frontier's wall; the Gerudo Canyon's pass down to the desert; the
    # gorge south of Death Mountain
    gorge([(500, 385), (530, 360), (565, 318), (600, 285), (628, 262), (650, 240)], 40.0, 34.0, 170.0)
    gorge([(342, 420), (338, 470), (343, 520), (338, 570), (330, 615)], 30.0, 30.0, 150.0)
    gorge([(178, 395), (182, 450), (178, 510), (172, 570), (160, 625)], 36.0, 34.0, 130.0)
    gorge([(535, 862), (505, 890), (472, 915), (445, 940), (420, 962)], 26.0, 30.0, 160.0)
    gorge([(1030, 470), (1060, 505), (1095, 540), (1130, 575)], 24.0, 30.0, 120.0)
    for j in range(nz):                                    # and never down below the sea: its floor stays dry
        for i in range(nx):
            x_, z_ = X0 + i * STEP, Z0 + j * STEP
            if H[j][i] < 8 and -2600 < x_ < -800 and -3400 < z_ < -1400:
                H[j][i] = 8.0 + (8 - H[j][i]) * 0.05
    rivers = []
    for name, pts, wpx in RIVERS:
        rivers.append({"name": name, "width": wpx * 1.0, "pts": carve(pts, wpx * 1.0, 3.0)})
    # the lakes: round each a shore that slopes down to the water, not a wall: within a couple of hundred metres the
    # ground comes no higher than the water plus a gentle rise (numpy over a box round each lake)
    import numpy as np
    HA = np.array(H)
    for name, poly, lv0, hot in LAKES:
        lv = lv0 if lv0 is not None else LAKE_LEVEL[name]
        xs_ = [x for x, z in poly]
        zs_ = [z for x, z in poly]
        i0, i1 = max(0, int((min(xs_) - 260 - X0) / STEP)), min(nx, int((max(xs_) + 260 - X0) / STEP) + 2)
        j0, j1 = max(0, int((min(zs_) - 260 - Z0) / STEP)), min(nz, int((max(zs_) + 260 - Z0) / STEP) + 2)
        GX, GZ = np.meshgrid(X0 + np.arange(i0, i1) * STEP, Z0 + np.arange(j0, j1) * STEP)
        d = np.full(GX.shape, np.inf)
        for k in range(len(poly)):
            (ax, az), (bx, bz) = poly[k], poly[(k + 1) % len(poly)]
            dx, dz = bx - ax, bz - az
            L = dx * dx + dz * dz or 1e-9
            t = np.clip(((GX - ax) * dx + (GZ - az) * dz) / L, 0, 1)
            d = np.minimum(d, np.hypot(GX - ax - t * dx, GZ - az - t * dz))
        shore = lv + 0.6 + d * 0.32 + (d / 60.0) ** 2 * 6
        HA[j0:j1, i0:i1] = np.minimum(HA[j0:j1, i0:i1], np.where(d < 260, shore, np.inf))
    for j in range(nz):                               # the water itself: re-cut below the level inside each lake
        z = Z0 + j * STEP
        for i in range(nx):
            lv = lake_mask(X0 + i * STEP, z)
            if lv is not None:
                HA[j][i] = min(HA[j][i], lv - 4.0)
    # the Lanayru Wetlands are a marsh, not open water: a scatter of low grassy islets stands just out of it
    WET_ISLETS = []
    wl_ = [l for l in LAKES if l[0] == "Lanayru Wetlands"][0]
    Rw = random.Random(1200)
    for _ in range(400):
        if len(WET_ISLETS) >= 34:
            break
        px_, py_ = Rw.uniform(944, 1062), Rw.uniform(612, 728)
        x_, z_ = P(px_, py_)
        if not in_poly(x_, z_, wl_[1]) or any(math.hypot(x_ - a, z_ - b) < 90 for a, b in WET_ISLETS):
            continue
        WET_ISLETS.append((x_, z_))
        r_ = Rw.uniform(26, 60)
        for j in range(max(0, int((z_ - r_ - Z0) / STEP)), min(nz, int((z_ + r_ - Z0) / STEP) + 2)):
            for i in range(max(0, int((x_ - r_ - X0) / STEP)), min(nx, int((x_ + r_ - X0) / STEP) + 2)):
                d = math.hypot(X0 + i * STEP - x_, Z0 + j * STEP - z_) / r_
                if d < 1:
                    HA[j][i] = max(HA[j][i], wl_[2] + 2.6 - max(0.0, d * d - 0.4) * 5.0)
    H = HA.tolist()
    hs = [int(round(H[j][i] * 10)) for j in range(nz) for i in range(nx)]
    out["terrain"] = {"step": STEP, "nx": nx, "nz": nz, "x0": q(X0), "z0": q(Z0), "datum": 0.0, "h": hs}

    def height(x, z):
        fi, fj = (x - X0) / STEP, (z - Z0) / STEP
        i, j = max(0, min(nx - 2, int(fi))), max(0, min(nz - 2, int(fj)))
        tx, tz = max(0.0, min(1.0, fi - i)), max(0.0, min(1.0, fj - j))
        return (H[j][i] * (1 - tx) + H[j][i + 1] * tx) * (1 - tz) + (H[j + 1][i] * (1 - tx) + H[j + 1][i + 1] * tx) * tz

    # ---------- the sea: one sheet with the land cut out of it (the coast, inside the box, and the island) ----------
    m = 9000
    # north and west the land runs on out of the map, so the hole runs out to the sheet's edge there
    coast_in = [(max(X0 - m + 50, min(X1 + 300, x)) if x < 0 else min(X1 + 300, x), max(Z0 - m + 50, min(Z1 + 300, z)) if z < 0 else min(Z1 + 300, z)) for x, z in COAST]
    coast_in = [(X0 - m + 50 if x <= X0 - 300 else x, Z0 - m + 50 if z <= Z0 - 300 else z) for x, z in coast_in]
    coast_in = [(x, Z1 + m - 50 if (z >= Z1 and x < -500) else z) for x, z in coast_in]   # and the desert runs on south
    holes = [flat(coast_in)] + [flat([(c[0] + math.cos(a) * r * 0.97, c[1] + math.sin(a) * r * 0.97) for a in [k / 24 * math.tau for k in range(24)]]) for c, r, n, t in ISLANDS]
    out["water"] = [{"o": flat([(X0 - m, Z0 - m), (X1 + m, Z0 - m), (X1 + m, Z1 + m), (X0 - m, Z1 + m)]), "i": holes, "n": "The sea"}]
    out["lake"], out["islands"], out["marina"], out["waterways"], out["pier"], out["beach"] = [], [], [], [], [], []

    # ---------- the places ----------
    def site(px, py, **kw):
        x, z = P(px, py)
        d = {"x": round(x, 1), "z": round(z, 1), "y": round(height(x, z), 1), "at": ll(x, z)}
        d.update(kw)
        return d
    S = {
        "castle": site(730, 505), "castletown": site(742, 575),
        "plateau": site(470, 705), "temple_of_time": site(490, 700), "resurrection": site(452, 668), "oldman": site(505, 735),
        "kakariko": site(1015, 782), "hateno": site(1258, 928), "techlab": site(1290, 912),
        "rito": site(275, 378), "zora": site(1225, 562), "goron": site(1000, 298), "gerudo_town": site(245, 1035),
        "lurelin": site(1150, 1092), "tarrey": site(1328, 425), "korok": site(820, 345), "akkala_citadel": site(1262, 318),
        "spiral": site(1392, 338), "eventide": site(1398, 1130),
        "lomei_north": site(660, 150), "lomei_south": site(520, 1095), "lomei_island": site(1405, 135),
        "ruta": site(1270, 612), "rudania": site(1080, 330), "medoh": site(275, 378), "naboris": site(190, 1010),
        "dueling": site(951, 895), "deathmountain": site(1120, 265),
        "hylia_bridge": site(770, 988), "fort_hateno": site(1170, 900),
        # more of the map: the bazaar at the desert's oasis, the Seven Heroines, the Coliseum's ruins, Lon Lon Ranch's,
        # the three goddess springs, three of the Great Fairies' fountains, the Akkala laboratory
        "kara_kara": site(300, 1000), "heroines": site(150, 1170), "coliseum": site(662, 672), "lonlon": site(845, 610),
        "spring_courage": site(965, 1040), "spring_wisdom": site(1300, 845), "spring_power": site(1365, 240),
        "fairy_tera": site(360, 1085), "fairy_mija": site(470, 235), "fairy_kaysa": site(1265, 250), "akkala_lab": site(1345, 285),
    }
    # the Sheikah towers, and the shrines: a few dozen, so every region has its lights
    TOWERS = {"Great Plateau Tower": (470, 718), "Central Tower": (705, 640), "Dueling Peaks Tower": (938, 850),
              "Hateno Tower": (1170, 870), "Lanayru Tower": (1012, 642), "Akkala Tower": (1232, 425), "Eldin Tower": (1000, 450),
              "Woodland Tower": (885, 430), "Ridgeland Tower": (450, 520), "Tabantha Tower": (500, 330), "Hebra Tower": (330, 185),
              "Gerudo Tower": (245, 700), "Wasteland Tower": (335, 950), "Lake Tower": (655, 950), "Faron Tower": (900, 1020)}
    towers = [dict(site(px, py), name=n) for n, (px, py) in TOWERS.items()]
    SHRINES = [(462, 645), (512, 712), (430, 700), (500, 760), (690, 610), (600, 720), (760, 700), (650, 810), (880, 600),
               (960, 720), (1000, 800), (1060, 790), (1210, 960), (1120, 920), (1270, 870), (1130, 640), (1250, 520), (1190, 470),
               (1300, 430), (1340, 300), (1000, 360), (1070, 470), (870, 470), (770, 380), (600, 420), (480, 470), (380, 420),
               (280, 320), (200, 250), (420, 260), (560, 260), (180, 700), (300, 800), (150, 1000), (320, 1100), (440, 950),
               (560, 1060), (680, 1060), (820, 1000), (960, 1080), (1060, 1040), (1180, 1080), (1390, 1110), (720, 860),
               (850, 760), (830, 540), (640, 540), (520, 610)]
    shrines = []
    for k, (px, py) in enumerate(SHRINES):
        s = site(px, py)
        if s["y"] < 2:
            continue
        shrines.append(dict(s, blue=R.random() < 0.55))
    STABLES = {"Outskirt Stable": (680, 780), "Dueling Peaks Stable": (895, 868), "Wetland Stable": (930, 625),
               "Riverside Stable": (620, 830), "Woodland Stable": (900, 455), "Serenne Stable": (560, 450),
               "Snowfield Stable": (360, 410), "Rito Stable": (420, 420), "Gerudo Canyon Stable": (480, 900),
               "Highland Stable": (620, 1000), "Lakeside Stable": (880, 1100), "Foothill Stable": (1060, 520),
               "East Akkala Stable": (1300, 480), "South Akkala Stable": (1170, 520)}
    stables = [dict(site(px, py), name=n) for n, (px, py) in STABLES.items()]
    # Bokoblin camps: out in the field, on the hills, by the roads but not on them, never in a village
    camps = []
    towns = [S[k] for k in ("kakariko", "hateno", "rito", "zora", "goron", "gerudo_town", "lurelin", "tarrey", "castle", "plateau")]
    for _ in range(400):
        if len(camps) >= 26:
            break
        px, py = R.uniform(300, 1300), R.uniform(250, 1100)
        x, z = P(px, py)
        h = height(x, z) if 'height' in dir() else 0
        if lake_mask(x, z) is not None or any(math.hypot(x - t["x"], z - t["z"]) < 700 for t in towns) or any(math.hypot(x - c["x"], z - c["z"]) < 600 for c in camps):
            continue
        camps.append(site(px, py))
    camps = [c for c in camps if 3 < c["y"] < 600]
    S["tabantha_bridge"] = site(578, 306)
    S["zora_falls"] = site(1163, 634)

    # ---------- level ground for the places: a pad at each, eased into the slope round it ----------
    # (site, flat radius m, blend m, lowest it may be). The page builds every town on its own; on a slope a town, a
    # maze or a shrine would hang off the hill.
    PADS = [("castletown", 200, 120, None), ("kakariko", 110, 90, None), ("hateno", 150, 110, None), ("lurelin", 70, 60, 3.0),
            ("tarrey", 42, 30, None), ("gerudo_town", 175, 80, None), ("goron", 110, 80, None), ("zora", 75, 40, None),
            ("lomei_north", 100, 50, None), ("lomei_south", 100, 50, None), ("lomei_island", 95, 30, 4.0),
            ("akkala_citadel", 115, 70, None), ("temple_of_time", 55, 40, None),
            ("kara_kara", 90, 50, None), ("heroines", 85, 50, None), ("coliseum", 80, 50, None), ("lonlon", 95, 60, None),
            ("spring_courage", 40, 30, None), ("spring_wisdom", 40, 30, None), ("spring_power", 40, 30, None),
            ("fairy_tera", 30, 25, None), ("fairy_mija", 30, 25, None), ("fairy_kaysa", 30, 25, None), ("akkala_lab", 30, 25, None), ("oldman", 12, 14, None), ("techlab", 16, 16, None)]
    pads = [(S[k]["x"], S[k]["z"], r, b, lo) for k, r, b, lo in PADS]
    pads += [(t["x"], t["z"], 22, 16, None) for t in towers] + [(t["x"], t["z"], 30, 22, None) for t in stables]
    pads += [(t["x"], t["z"], 9, 9, None) for t in shrines]
    for px_, pz_, r, b, lo in pads:
        target = height(px_, pz_)
        if lo is not None:
            target = max(target, lo)
        for j in range(max(0, int((pz_ - r - b - Z0) / STEP)), min(nz, int((pz_ + r + b - Z0) / STEP) + 2)):
            for i in range(max(0, int((px_ - r - b - X0) / STEP)), min(nx, int((px_ + r + b - X0) / STEP) + 2)):
                d = math.hypot(X0 + i * STEP - px_, Z0 + j * STEP - pz_)
                w = 1.0 - smoothstep(r, r + b, d)
                if w > 0 and lake_mask(X0 + i * STEP, Z0 + j * STEP) is None:
                    H[j][i] = H[j][i] + (target - H[j][i]) * w
    out["terrain"]["h"] = [int(round(H[j][i] * 10)) for j in range(nz) for i in range(nx)]
    for group_ in [list(S.values()), towers, stables, shrines, camps]:
        for d_ in group_:
            d_["y"] = round(height(d_["x"], d_["z"]), 1)

    # ---------- roads: the paths across the country, as the map draws them ----------
    roads = []
    def road(pts_px, name, cls="track", w=6.0):
        pts = []
        for k in range(len(pts_px) - 1):
            (a, b), (c, d) = P(*pts_px[k]), P(*pts_px[k + 1])
            n = max(1, int(math.hypot(c - a, d - b) // 40))
            for s in range(n):
                pts.append((a + (c - a) * s / n, b + (d - b) * s / n))
        pts.append(P(*pts_px[-1]))
        pts = [p for p in pts if lake_mask(*p) is None]
        if len(pts) > 1:
            roads.append({"c": cls, "w": w, "p": flat(simplify(pts, 2.0)), "n": name})
    ROADS = [
        ("The road to the castle", [(560, 520), (640, 560), (720, 600)]),
        ("The road south", [(720, 600), (705, 700), (680, 780)]),
        ("The road to Kakariko", [(680, 780), (760, 840), (880, 862), (960, 830), (1015, 782)]),
        ("The road to Hateno", [(1015, 782), (1060, 820), (1120, 870), (1170, 900), (1240, 930)]),
        ("The road to Akkala", [(720, 600), (860, 560), (980, 520), (1060, 520), (1180, 470), (1290, 420)]),
        ("The road to Zora's Domain", [(860, 560), (930, 625), (1050, 620), (1180, 605)]),
        ("The road to Rito Village", [(560, 520), (470, 470), (420, 420), (330, 400), (290, 385)]),
        ("The road to Gerudo", [(680, 780), (620, 900), (560, 960), (480, 900), (380, 960), (300, 1000), (245, 1035)]),
        ("The road to Lurelin", [(680, 780), (700, 880), (722, 958), (700, 1060), (800, 1100), (880, 1100), (1000, 1110), (1150, 1092)]),
        ("The road to the woods", [(720, 600), (770, 480), (885, 430), (900, 455)]),
        ("The road to Goron City", [(1060, 520), (1050, 420), (1040, 330)]),
        ("The Tabantha road", [(420, 420), (500, 330), (560, 260)]),
    ]
    # and the field's own network, as the map draws it: the paths that cross Hyrule Field between the castle's
    # roads, round the Central Tower and down to the stables
    ROADS += [
        ("The field road", [(638, 606), (676, 611), (735, 620), (776, 611), (809, 577)]),
        ("The west field road", [(628, 625), (623, 687), (647, 754), (652, 802), (647, 840)]),
        ("The middle road", [(735, 620), (747, 677), (714, 725), (666, 754)]),
        ("The east field road", [(776, 635), (790, 687), (776, 725), (762, 763), (771, 802), (800, 840)]),
        ("The south field road", [(714, 725), (704, 782), (714, 830), (781, 840)]),
        ("The road to the wetlands", [(790, 687), (809, 668), (857, 644), (930, 625)]),
        ("The ridge road", [(560, 520), (500, 560), (470, 600), (452, 640)]),
        ("The Tundra road", [(500, 330), (580, 300), (640, 250), (700, 230)]),
    ]
    for name, pts in ROADS:
        road(pts, name)
    out["roads"] = roads

    # ---------- the villages' houses: small, steep-roofed, close together; the page dresses the towns ----------
    buildings = []
    def village(key, n, r, roofc, wallc, floors=(1, 2), size=(7, 11), r0=0.0):
        c = S[key]
        placed = []
        for _ in range(n * 6):
            if len(placed) >= n:
                break
            a, d = R.uniform(0, math.tau), r0 + (r - r0) * math.sqrt(R.random())
            x, z = c["x"] + math.cos(a) * d, c["z"] + math.sin(a) * d
            if lake_mask(x, z) is not None or height(x, z) < 2 or any(math.hypot(x - u, z - v) < 15 for u, v in placed):
                continue
            w, dd = R.uniform(*size), R.uniform(*size)
            buildings.append({"p": flat(rect(x, z, w, dd, R.uniform(0, math.pi))), "h": round(3.2 * R.choice(floors), 1),
                              "t": "house", "c": R.choice(wallc), "r": "g"})
            placed.append((x, z))
    WOOD = ["#a8865a", "#9a7a50", "#b8956a", "#8a6a44"]
    WHITE = ["#ece4d2", "#e2d8c4", "#f2ead8"]
    # the villages themselves the page builds, each in its own style (villages.js, peoples.js); the engine draws only
    # the farmsteads out round Hateno, beyond its fields
    village("hateno", 10, 300, None, WHITE + WOOD, r0=190)
    for st in stables:
        pass
    out["buildings"] = buildings

    # ---------- the woods ----------
    # (centre px, radius px, density): the Great Hyrule Forest, Faron's jungle, the Hyrule Ridge woods, Necluda, Akkala's
    # autumn woods, the Lost Woods, Hebra's firs, and trees thinly everywhere green
    WOODS = [((805, 345), 85, 0.9), ((930, 1060), 130, 0.75), ((420, 570), 110, 0.35), ((1080, 900), 120, 0.4),
             ((1250, 380), 110, 0.45), ((560, 700), 60, 0.3), ((350, 300), 140, 0.25), ((860, 900), 80, 0.4),
             ((640, 980), 80, 0.3), ((1150, 700), 90, 0.35)]
    trees, tset = [], []
    BG = biome_grid()
    def biome_at(x, z):
        i, j = int((x - BG["x0"]) / BG["step"]), int((z - BG["z0"]) / BG["step"])
        return BG["rows"][j][i] if 0 <= i < BG["nx"] and 0 <= j < BG["nz"] else "g"
    # the engine's round broadleaves belong only where broadleaves grow: none in the desert, the canyon, on the ash,
    # the snow or the tundra (the page plants those biomes' own plants: flora.js)
    BIOME_TREES = {"g": 1.0, "H": 0.5, "F": 1.6, "L": 2.0, "J": 1.4, "W": 0.4, "A": 0.6, "R": 0.15, "D": 0.0, "C": 0.0, "V": 0.0, "S": 0.0, "T": 0.0}
    for _ in range(110000):
        x, z = R.uniform(X0 + 50, X1 - 50), R.uniform(Z0 + 50, Z1 - 50)
        h = height(x, z)
        if h < 3 or h > 900 or lake_mask(x, z) is not None or any(math.hypot(x - px_, z - pz_) < r * 0.9 for px_, pz_, r, b, lo in pads):
            continue                                                 # no trees in the towns, on the pads
        if any(min(seg_dist(x, z, c_["pts"][k], c_["pts"][k + 1]) for k in range(len(c_["pts"]) - 1)) < c_["floor"] + c_["wall"] for c_ in CANYONS):
            continue                                                 # nor in the canyons
        bk = BIOME_TREES[biome_at(x, z)]
        if bk == 0 or R.random() > min(1.0, bk):
            continue
        p_ = 0.09
        for (px, py), r, dens in WOODS:
            c = P(px, py)
            d = math.hypot(x - c[0], z - c[1]) / (r * PX)
            if d < 1:
                p_ = max(p_, dens * (1 - d * d))
        dz = (x - P(220, 1060)[0]) / (330 * PX), (z - P(220, 1060)[1]) / (200 * PX)
        if dz[0] ** 2 + dz[1] ** 2 < 1:
            p_ = 0.004                                             # the desert
        if h > 600:
            p_ *= 0.3                                               # few up in the snow
        if R.random() < p_ * max(1.0, bk):                        # and more where the woods are thick
            trees += [q(x), q(z)]
    out["trees"] = trees
    out["areas"], out["rail"], out["stations"], out["pois"] = [], [], [], []
    json.dump(out, open(OUT, "w"), separators=(",", ":"))

    # ---------- the plan ----------
    lakes = [{"name": n, "level": lv if lv is not None else LAKE_LEVEL[n], "hot": hot, "poly": [[round(x, 1), round(z, 1)] for x, z in poly]} for n, poly, lv, hot in LAKES]
    moats = [{"name": n, "x": P(px, py)[0], "z": P(px, py)[1], "r0": r0 * PX, "r1": r1 * PX, "level": lv} for n, (px, py), r0, r1, lv in MOATS]
    REGIONS = {"desert": [P(220, 1060), 330 * PX, 200 * PX], "deathmountain": [P(1095, 285), 170 * PX, 165 * PX],
               "lavafield": [P(1020, 290), 45 * PX, 110 * PX],
               "akkala": [P(1290, 300), 120 * PX, 190 * PX], "faron": [P(930, 1060), 150 * PX, 90 * PX],
               "hebra": [P(330, 230), 240 * PX, 170 * PX], "gerudo_high": [P(230, 760), 230 * PX, 130 * PX]}
    plan = {"_": "written by tools/make-hyrule.py: metres east (x) and south (z) of the origin; y is the ground",
            "pads": [[round(x_, 1), round(z_, 1), r] for x_, z_, r, b, lo in pads], "biomes": biome_grid(), "wetIslets": [[round(a, 1), round(b, 1)] for a, b in WET_ISLETS], "canyons": CANYONS, "sites": S, "towers": towers, "shrines": shrines, "stables": stables, "camps": camps, "lakes": lakes, "moats": moats,
            "rivers": rivers, "regions": REGIONS, "coast": [[round(x, 1), round(z, 1)] for x, z in COAST]}
    json.dump(plan, open(PLAN, "w"), indent=1)
    lo, hi = min(hs) / 10, max(hs) / 10
    print(f"terrain {nx}x{nz} at {STEP:g} m, ground {lo:.0f} to {hi:.0f} m; {len(buildings)} houses, {len(roads)} roads, "
          f"{len(trees) // 2} trees, {len(towers)} towers, {len(shrines)} shrines, {len(stables)} stables")


if __name__ == "__main__":
    main()
