#!/usr/bin/env python3
"""Span, the ruined Ancient arcology in Pan Riba's canyon (SW highlands): the rough floorplan. Sheets come from
settlements/voth/palace/blueprint.py (the shared generator: its circles, fills and lines are this plan's additions).

A ROUGH plan for the owner's approval (PLAN.md), at the scale of districts and buildings, not rooms (the Cross, sheet
S4, is the one building drawn to rooms, because Dalab lives in it). Every number here is an assumption for the station
session and the first build to settle; the list is PLAN.md section 3.

Frame: u runs DOWNSTREAM along the canyon's axis (the lake upstream at u < -1000, drawn left; the Deep Reach at u > 0),
v across (v > 0 the right bank looking downstream, drawn up), y from the tableland's rim (y = 0, ~2,600 m; the canyon
floor at the Deep Reach y = -180, Pan Riba's bed ~2,416 m on scale model 4.22). Metres. The station session turns the
frame onto the canyon it carves: u follows the river.

    python3 span_blueprint.py        # writes floors/*.png next to this file
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, C
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')

B.KIND_FILL.update({'water': (170, 214, 240), 'pad': (196, 200, 214), 'dome': (252, 252, 246), 'ringsite': (232, 236, 228),
                    'tank': (214, 214, 206), 'hangar': (150, 146, 140), 'works': (200, 194, 182), 'terrace': (244, 242, 234),
                    'bridge': (120, 120, 128), 'fallen': (178, 120, 104), 'outpost': (226, 178, 120), 'portal': (40, 40, 40),
                    'mound': (186, 150, 96), 'craft': (184, 196, 206), 'weir': (140, 160, 170), 'line': (160, 60, 40)})

# ------------------------------------------------------------------------------------------------ the shape (the data)
RIM, B1, B2, B3, FLOOR = 0, -40, -85, -130, -180          # the Deep Reach's levels: rim, three benches, the floor
HALF = {RIM: 150, B1: 128, B2: 105, B3: 85, FLOOR: 70}   # the half-width at each level (rim to rim 300 m, floor 140 m)
REACH = (-180, 820)                                        # the built Deep Reach along u
CROSS = (-300, -180, -230, 230)                            # the Cross: the habitable bridge, the Span proper
BAY = (-520, 0, 230, 160)                                  # the Upper Bay: centre u, v and the rim's semi-axes
APRON = (-520, 0, 185, 118)                                # its deck at y = -45 over the inner slot
LAKE_Y = -8

def oval(cu, cv, a, b, n=48, t0=0.0, t1=2 * math.pi):
    return [(cu + a * math.cos(t0 + (t1 - t0) * i / n), cv + b * math.sin(t0 + (t1 - t0) * i / n)) for i in range(n + 1)]

def ovalR(n, name, kind, cu, cv, a, b, decor, note=''):
    d = R(n, name, kind, cu - a, cu + a, cv - b, cv + b, decor, note); d['circ'] = True; return d

LAKE = [(-2560, -120), (-2480, -360), (-2200, -430), (-1900, -380), (-1600, -300), (-1300, -200), (-1100, -90), (-1050, 0),
        (-1100, 120), (-1350, 240), (-1700, 330), (-2050, 400), (-2350, 330), (-2540, 160)]
GREY, RED, BLUE, GREEN, BROWN = (90, 90, 90), (170, 40, 30), (40, 110, 200), (40, 130, 60), (130, 90, 50)

def rims(level, col=GREY, w=3, label=None):
    h = HALF[level]
    out = [([(REACH[0], h), (REACH[1], h)], col, w), ([(REACH[0], -h), (REACH[1], -h)], col, w)]
    if label: out[0] = out[0] + (label,)
    return out

HEAD = [([(-900, 60), (-750, 70)], GREY, 3), ([(-900, -60), (-750, -70)], GREY, 3)]   # the canyon head, the natural canyon
DOWN = [([(820, 150), (1200, 120)], GREY, 3, 'the natural canyon on, to the plunge fall and the pillar rim'), ([(820, -150), (1200, -120)], GREY, 3)]
BAYRIM = [(oval(*BAY), GREY, 3)]
RIVER = [([(-1050, 0), (-900, 0), (-750, 0), (-300, 0), (-180, -48), (820, -48), (1200, -40)], BLUE, 4)]
ROADS = [([(-240, 230), (-240, 800)], BROWN, 7, 'north highway (Ancient, to the tableland)'),
         ([(-240, -230), (-240, -800)], BROWN, 7, 'south highway'),
         ([(-180, 205), (820, 205)], BROWN, 5), ([(-180, -205), (1150, -205)], BROWN, 5, 'the rim road on: Dalab\'s way to the watch post'),
         ([(-760, 175), (-1700, 470)], BROWN, 5, 'to the Lake Quay'), ([(-760, -175), (-1380, -460)], BROWN, 5),
         ([(-240, 800), (300, 800)], BROWN, 4), ([(-240, -800), (-800, -800)], BROWN, 4)]

# ------------------------------------------------------------------------------------------------ S0 the site
FLOORS = []
SITE = dict(R=1958, rect=(-2650, 1250, -800, 800))
FLOORS.append(dict(SITE, id='S0', tier=0, title='Sheet S0: Span and its lake (the site, ~3.9 x 1.6 km)',
  sub='Pan Riba leaves the lake over the Ancients\' weir, falls into the canyon head, runs under the Upper Bay\'s deck and the Cross, and through the Deep Reach, the arcology\'s works down both walls. Two ring-walled outlying sites by the lake. The station session carves the canyon to this plan and turns u onto the river\'s course; the pillar rim and Dalab\'s watch post lie downstream (u > 1200, off the sheet).',
  axisnote='u downstream along Pan Riba ->   v across (the right bank up); y from the rim. Heights in the key are y.',
  fills=[(LAKE, B.KIND_FILL['water'], 'the lake (y -8, on the tableland; the biome kit makes it)'),
         ([(-180, 150), (820, 150), (820, -150), (-180, -150)], (214, 200, 180), 'the Deep Reach (rim to rim 300 m)')],
  lines=HEAD + DOWN + BAYRIM + RIVER + ROADS + rims(RIM),
  rooms=[
    R(1, 'The Lake Quay', 'ringsite', -2300, -1700, 470, 600, 1, 'outlying site: a long walled strip of slips and sheds by the north shore; worn, overgrown'),
    C(2, 'The Lake Ring', 'ringsite', -1500, -570, 150, 1, 'outlying site: a ring wall round a sunken court of six domes, a mole into the lake; ruined, drowned at one side'),
    R(3, 'The Weir', 'weir', -1070, -1030, -90, 90, 1, 'the Ancients\' sluice dam at the lake\'s outlet; it holds the lake up 8 m; sound'),
    C(4, 'Head Pad', 'pad', -880, 150, 32, 1, 'a landing pad on a drum at the canyon head, a walkway to the bay\'s ring road'),
    ovalR(5, 'The Upper Bay', 'terrace', BAY[0], BAY[1], BAY[2], BAY[3], 1, 'the canyon widened into an oval bay, domes on its terraces, a deck (the Apron) over the river; ruined'),
    R(6, 'The Cross (the Span)', 'outpost', CROSS[0], CROSS[1], CROSS[2], CROSS[3], 2, 'the great habitable bridge where the highways cross the canyon: Dalab\'s outpost'),
    R(7, 'The Deep Reach', 'works', 400, 401, -1, 1, 1, 'the canyon proper: terraces down both walls, hangars and works on the floor; the no man\'s land'),
    C(8, 'Lone dome', 'dome', -1200, 520, 16, 1, 'worn'),
    C(9, 'Lone dome', 'dome', -760, -560, 14, 1, 'toppled'),
    C(10, 'Dalab\'s mound', 'mound', -300, -430, 40, 2, 'an earth mound imitating the domes, facing the lab (south-west); the outpost\'s priest communes here'),
  ]))

# ------------------------------------------------------------------------------------------------ S1 the rims (y = 0)
CORE = dict(R=908, rect=(-950, 850, -500, 500))
BAYDOMES_IN = [C(20 + i, 'Bay terrace dome', 'dome', BAY[0] + 207 * math.cos(a), 139 * math.sin(a), 17, 1,
                 'ruined' if i % 3 else 'toppled into the bay') for i, a in enumerate([k * 2 * math.pi / 10 + .31 for k in range(10)])]
BAYDOMES_OUT = [C(30 + i, 'Ring-walled dome', 'dome', BAY[0] + 300 * math.cos(a), 232 * math.sin(a), 28, 1, n)
                for i, (a, n) in enumerate([(1.15, 'ruined'), (1.75, 'worn, overgrown'), (2.4, 'ruined'), (3.3, 'toppled'), (3.9, 'ruined'), (4.55, 'worn')])]
FLOORS.append(dict(CORE, id='S1', tier=0, title='Sheet S1: the rims (y = 0)',
  sub='The ring road round the Upper Bay with its domes inside and out; the Cross\'s roof where the two highways cross; the rim ranges (the white curved band) along both rims of the Deep Reach, ring-walled domes and round pads on them; the Middle Bridge. Dalab holds the Cross and the north range\'s first 420 m (the Sound Quarter).',
  axisnote='u downstream ->   v across (the right bank up)   y = 0, the rim',
  fills=[([(-180, 150), (820, 150), (820, -150), (-180, -150)], (214, 200, 180), 'open: the Deep Reach below'),
         (oval(*APRON), (225, 215, 196), 'the Apron (y -45) below')],
  lines=HEAD + BAYRIM + [(oval(BAY[0], 0, 262, 192), BROWN, 6, 'the bay\'s ring road')] + ROADS + rims(RIM),
  rooms=BAYDOMES_IN + BAYDOMES_OUT + [
    C(1, 'Head Pad', 'pad', -880, 150, 32, 1, 'worn; the walkway to the ring road stands'),
    C(2, 'Bay Pad', 'pad', -700, -240, 30, 1, 'ruined: a craft wrecked across it'),
    R(3, 'The Cross: the roof road and the gate towers', 'outpost', CROSS[0], CROSS[1], CROSS[2], CROSS[3], 2, 'rehabilitated: Dalab\'s; salvage parapets, the signal mast; rooms below (S4)'),
    R(4, 'North Range A: the Sound Quarter', 'outpost', -180, 240, 152, 190, 2, 'rehabilitated: Dalab\'s quarters, gardens on the roofs'),
    R(5, 'North Range B', 'terrace', 240, 520, 152, 190, 1, 'ruined, overgrown (drip cap, log crust)'),
    R(6, 'North Range C', 'fallen', 520, 820, 152, 190, 1, 'toppled: half its length slumped into the canyon with the pad'),
    R(7, 'South Range A', 'terrace', -180, 300, -190, -152, 1, 'ruined; Dalab patrols it'),
    R(8, 'South Range B', 'terrace', 300, 820, -190, -152, 1, 'ruined'),
    C(9, 'Rim Pad 1', 'pad', 120, 255, 32, 1, 'worn: Dalab\'s landing ground (no craft fly: a drill ground and lizard paddock)'),
    C(10, 'Rim Pad 2', 'pad', 300, -250, 36, 1, 'ruined'),
    C(11, 'Rim Pad 3', 'fallen', 560, 240, 28, 1, 'toppled into the canyon (its wreck on S3)'),
    C(12, 'Rim Pad 4', 'pad', 760, -240, 28, 1, 'ruined'),
    C(13, 'Rim dome', 'dome', 20, 245, 26, 2, 'rehabilitated: the genepriests\' house'),
    C(14, 'Rim dome', 'dome', 380, -245, 30, 1, 'ruined'),
    C(15, 'Rim dome', 'dome', 650, 250, 22, 1, 'worn'),
    R(16, 'The Middle Bridge', 'bridge', 255, 270, -150, 150, 1, 'a road bridge at the rim; ruined but passable; Dalab\'s forward barricade at its north end'),
  ]))

# ------------------------------------------------------------------------------------------------ S2 the walls (y -40 to -130) and the Apron
def bench(n, name, side, u0, u1, lvl, kind, note):
    hi, lo = HALF[{B1: RIM, B2: B1, B3: B2}[lvl]], HALF[lvl]
    return R(n, name, kind, u0, u1, lo, hi, 1, note) if side > 0 else R(n, name, kind, u0, u1, -hi, -lo, 1, note)

FLOORS.append(dict(CORE, id='S2', tier=1, title='Sheet S2: the walls (benches at y -40, -85, -130) and the Apron (y -45)',
  sub='The arcology\'s floors step down both walls on the sandstone\'s hard beds: a gallery building on each bench, its back cut into the rock, its front a white curved terrace. In the bay the Apron, a deck over the river\'s slot, with the derelict craft. Two lower bridges: the Low Bridge (fallen) and the Pipe Bridge with its hanging payloads (kits/ancients\' canyon target).',
  axisnote='u downstream ->   v across   bands: rim to -40, -40 to -85, -85 to -130 (outer to inner)',
  fills=[([(-180, 70), (820, 70), (820, -70), (-180, -70)], (200, 186, 166), 'the floor (y -180) below')],
  lines=HEAD + BAYRIM + rims(RIM) + rims(B1, (150, 150, 150), 2) + rims(B2, (150, 150, 150), 2) + rims(B3, (150, 150, 150), 2) + RIVER[:1],
  rooms=[
    ovalR(1, 'The Apron', 'terrace', APRON[0], APRON[1], APRON[2], APRON[3], 1, 'y -45: the bay\'s deck over the slot; Dalab\'s fields and lizard pens on its upstream half'),
    C(2, 'Derelict craft', 'craft', -560, 40, 24, 1, 'a lander, broken-backed'),
    C(3, 'Derelict craft', 'craft', -470, -50, 18, 1, ''),
    C(4, 'Derelict craft', 'craft', -620, -40, 14, 1, 'burnt out'),
    R(5, 'The Cross, floors -10 to -60', 'outpost', CROSS[0], CROSS[1], -150, 150, 2, 'the bridge body over the canyon (S4); its keel piers down to the sluice'),
    bench(6, 'North gallery, -40 (A)', 1, -180, 240, B1, 'outpost', 'rehabilitated: Dalab\'s stores and workshops'),
    bench(7, 'North gallery, -40 (B)', 1, 240, 820, B1, 'terrace', 'ruined'),
    bench(8, 'North gallery, -85', 1, -180, 820, B2, 'terrace', 'ruined; sealed off from Dalab\'s part by a salvage wall at u 0'),
    bench(9, 'North gallery, -130', 1, -180, 820, B3, 'terrace', 'ruined; mutant nests'),
    bench(10, 'South gallery, -40', -1, -180, 820, B1, 'terrace', 'ruined'),
    bench(11, 'South gallery, -85', -1, -180, 820, B2, 'terrace', 'ruined'),
    bench(12, 'South gallery, -130', -1, -180, 820, B3, 'terrace', 'ruined; its downstream half fallen to the floor'),
    R(13, 'The Low Bridge (north stub)', 'fallen', 475, 490, 40, 105, 1, 'y -85: toppled; its middle lies on the floor'),
    R(14, 'The Low Bridge (south stub)', 'fallen', 475, 490, -105, -30, 1, ''),
    R(15, 'The Pipe Bridge', 'bridge', 690, 712, -128, 128, 1, 'y -40: three sagging pipes, payloads slung under them on cables'),
    C(16, 'Hung pod', 'craft', 701, 70, 9, 1, 'drops to y -70'),
    C(17, 'Hung prison', 'craft', 701, 5, 13, 1, 'drops to y -75; one cable parted'),
    C(18, 'Hung drum', 'craft', 701, -65, 10, 1, 'fallen to the floor (S3)'),
  ]))

# ------------------------------------------------------------------------------------------------ S3 the floor (y -180)
FLOORS.append(dict(CORE, id='S3', tier=2, title='Sheet S3: the canyon floor (y -180) and the slot under the bay',
  sub='The river in its channel along the left bank; hangars cut into both walls under the benches; the tanks standing from the floor most of the way to the rim; the works. Dalab\'s Line (a salvage wall and the Cross\'s gun gallery above it) closes the Deep Reach at the Cross; the Outfall Gate at the downstream end. Proposed: the Under-Wall Portal, a side gallery of the Ancients\' route under the Inner Wall to the Valley, which the machines come out of.',
  axisnote='u downstream ->   v across   y = -180 in the Deep Reach; the slot under the Apron from y -60 to -110',
  fills=[([(-180, 70), (820, 70), (820, -70), (-180, -70)], (200, 186, 166), 'the floor'),
         ([(-900, 25), (-300, 25), (-300, -25), (-900, -25)], (190, 176, 156), 'the slot under the Apron'),
         ([(-180, -40), (820, -40), (820, -58), (-180, -58)], B.KIND_FILL['water'])],
  lines=HEAD + BAYRIM + rims(B3, (150, 150, 150), 2) + rims(FLOOR, GREY, 3) + RIVER,
  rooms=[
    R(1, 'Hangar 1', 'hangar', -150, -60, 70, 112, 1, 'ruined; a sealed hangar Dalab keeps its lizards out of'),
    R(2, 'Hangar 2', 'hangar', 0, 90, -112, -70, 1, 'ruined; flooded at the back'),
    R(3, 'Hangar 3', 'hangar', 150, 240, 70, 112, 1, 'ruined; a craft inside'),
    R(4, 'Hangar 4', 'hangar', 330, 420, -112, -70, 1, 'ruined'),
    R(5, 'Hangar 5', 'hangar', 430, 520, 70, 112, 1, 'ruined'),
    R(6, 'Hangar 6', 'hangar', 580, 670, -112, -70, 1, 'ruined; the machines\' den'),
    R(7, 'The Under-Wall Portal (proposed)', 'portal', 690, 760, 70, 124, 1, 'a tunnel mouth into the Ancients\' route to the Valley; half plugged'),
    C(8, 'Tank 1', 'tank', 40, 15, 22, 1, 'rises to y -20; worn'),
    C(9, 'Tank 2 (the great tank)', 'tank', 245, -5, 28, 1, 'rises to y -60; ruined, holed'),
    C(10, 'Tank 3', 'tank', 410, 30, 18, 1, 'rises to y -90; toppled at its top'),
    R(11, 'The Engine Works', 'works', 90, 205, -30, 45, 1, 'ruined'),
    R(12, 'The Foundry', 'works', 290, 380, 0, 55, 1, 'ruined'),
    R(13, 'The Yard', 'works', 530, 640, -30, 35, 1, 'derelict craft and machine wrecks'),
    R(14, 'The Low Bridge\'s middle', 'fallen', 462, 502, -25, 35, 1, 'fallen from y -85'),
    C(15, 'Rim Pad 3\'s wreck', 'fallen', 585, 55, 14, 1, 'fallen from the north rim'),
    R(16, 'Dalab\'s Line', 'line', -190, -176, -70, 70, 2, 'a salvage wall across the floor under the Cross\'s gun gallery; one gate, kept shut'),
    R(17, 'The Outfall Gate', 'weir', 800, 830, -70, 70, 1, 'the downstream barrage; the river leaves through its sluices; breached'),
    R(18, 'The Sluice Stair', 'weir', -300, -180, -25, 25, 1, 'under the Cross: the river steps down from y -110 to -180 in four sluices'),
    C(19, 'Wrecked craft', 'craft', -100, -5, 16, 1, 'inside the Line: Dalab strips it'),
  ]))

# ------------------------------------------------------------------------------------------------ S4 the Cross, main floor (y -10)
CR = dict(R=268, rect=(-330, -150, -260, 260))
FLOORS.append(dict(CR, id='S4', tier=0, title='Sheet S4: the Cross, the outpost\'s main floor (y -10): zones',
  sub='Dalab\'s outpost lives in the Cross: the bridge building over the canyon where the two highways meet, its gates at both abutments, its upstream face toward the bay (safe), its downstream face the Line toward the Deep Reach (the gun gallery). These are ZONES, not rooms: one floor of the Cross is ~55,000 m2, far more than a garrison of ~240 (proposed) can fill, so Dalab lives in partitioned corners of each zone and the rest stands empty, sealed or stripped. Rooms are cut later (blueprint step 6). Floors -20 to -60 below: cisterns, stores, sealed Ancient halls; the roof is the road.',
  axisnote='u downstream ->   v across (the right bank up)   the canyon under v -150..150',
  lines=[([(-330, 150), (-150, 150)], GREY, 2, 'north rim'), ([(-330, -150), (-150, -150)], GREY, 2, 'south rim')],
  rooms=[
    R(1, 'North Gate Hall', 'entrance', -300, -180, 190, 230, 2, 'the north highway\'s gate; salvage doors'),
    R(2, 'South Gate Hall', 'entrance', -300, -180, -230, -190, 2, 'the south highway\'s gate'),
    R(3, 'The Spine', 'passage', -250, -230, -190, 190, 1, 'the corridor end to end'),
    R(4, 'Captain\'s Hall', 'office', -300, -250, 150, 190, 2, 'on the north abutment'),
    R(5, 'Signal Room', 'beacon', -230, -180, 150, 190, 1, 'mirrors and the beacon: the watch post answers'),
    R(6, 'Barracks', 'barracks', -300, -250, -190, -150, 1, 'on the south abutment'),
    R(7, 'Stores', 'store', -230, -180, -190, -150, 0),
    R(8, 'Mess Hall', 'servants_hall', -300, -250, -150, -80, 1),
    R(9, 'Kitchen', 'kitchen', -300, -250, -80, -50, 1),
    R(10, 'Clinic (the genepriests\')', 'infirmary', -300, -250, -50, 0, 2, 'mods and mending'),
    R(11, 'Lizard Stalls', 'workshop', -300, -250, 0, 80, 0, 'the Dalab lizards; a ramp to the Apron'),
    R(12, 'Water Hoist', 'cistern', -300, -250, 80, 150, 0, 'draws from the river under the bay'),
    R(13, 'Armoury', 'armoury', -230, -195, -150, -90, 1),
    R(14, 'Ready Room (south)', 'guard', -230, -195, -90, -20, 1),
    R(15, 'The Lift Head (sealed)', 'stair', -230, -195, -20, 20, 0, 'the Ancients\' hoist to the floor, welded shut'),
    R(16, 'Ready Room (north)', 'guard', -230, -195, 20, 90, 1),
    R(17, 'Powder and Salvage', 'store', -230, -195, 90, 150, 0),
    R(18, 'Gun Gallery (the Line\'s upper face)', 'guard', -195, -180, -150, 150, 1, 'loopholes over the Deep Reach; salvaged Ancient guns where they still work'),
  ]))

# ------------------------------------------------------------------------------------------------ the sections
def long_section():
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2600, 1100; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Section along the canyon (u, at v = 0): the lake, the bay, the Cross, the Deep Reach (heights x3)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 62), 'y = 0 is the rim (~2,600 m, assumed); the Deep Reach floor y -180 (Pan Riba\'s bed ~2,416 m on the model). The far walls are drawn faint behind.', font=f, fill=(70, 70, 70))
    sx = 0.6; sy = 3 * sx; ox = 30 + 2650 * sx; top = 300
    X = lambda u: ox + u * sx
    Y = lambda y: top - y * sy
    # the ground at v = 0: tableland, lake, weir, head fall, slot under the bay, sluice stair, the floor
    g = [(-2650, 0), (-2560, 0), (-2550, -30), (-1100, -30), (-1070, 0), (-1030, 0), (-900, -8), (-900, -60), (-300, -110), (-180, -180), (820, -190), (830, -195), (1250, -205)]
    dr.polygon([(X(u), Y(y)) for u, y in g] + [(X(1250), Y(-260)), (X(-2650), Y(-260))], fill=(222, 200, 176), outline=(120, 100, 80))
    dr.polygon([(X(u), Y(y)) for u, y in [(-2550, LAKE_Y), (-1070, LAKE_Y), (-1070, -30), (-2550, -30)]], fill=B.KIND_FILL['water'])
    dr.line([(X(-2550), Y(LAKE_Y)), (X(-1070), Y(LAKE_Y))], fill=BLUE, width=3); dr.text((X(-2000), Y(LAKE_Y) + 8), 'the lake (the biome kit\'s)', font=fs, fill=BLUE)
    dr.text((X(-890), Y(-40)), 'Head Fall (~50 m)', font=fs, fill=(0, 0, 0))
    for u, y, t in [(-1070, 0, 'the Weir'), (-300, -110, 'the Sluice Stair'), (820, -190, 'the Outfall Gate')]:
        dr.text((X(u) + 4, Y(y) - 22), t, font=fs, fill=(0, 0, 0))
    # the far wall (rim at 0) behind the canyon
    dr.line([(X(-900), Y(0)), (X(1250), Y(0))], fill=(190, 190, 190), width=2)
    for y in (B1, B2, B3):
        dr.line([(X(-180), Y(y)), (X(820), Y(y))], fill=(214, 214, 214), width=1); dr.text((X(830), Y(y) - 9), 'bench %d' % y, font=fs, fill=(150, 150, 150))
    def blk(u0, u1, y0, y1, col, name, out=(30, 30, 30)):
        dr.rectangle([X(u0), Y(y1), X(u1), Y(y0)], fill=col, outline=out, width=2)
        if name: dr.text((X(u0) + 3, Y(y1) - 20), name, font=fs, fill=(0, 0, 0))
    blk(-705, -335, -48, -45, (225, 215, 196), None)
    dr.text((X(-700), Y(-48) + 6), 'the Apron (y -45); the river\'s slot under it', font=fs, fill=(0, 0, 0))
    blk(-300, -180, -60, 8, B.KIND_FILL['outpost'], 'the Cross (Dalab), roof road y 0')
    for u in (-290, -250, -210):
        blk(u, u + 8, -110 if u < -250 else -150, -60, (180, 160, 130), None)
    blk(255, 270, -4, 0, (120, 120, 128), 'Middle Bridge')
    blk(475, 490, -88, -85, B.KIND_FILL['fallen'], 'Low Bridge (fallen)')
    blk(690, 712, -42, -38, (120, 120, 128), 'Pipe Bridge')
    for v, d in [(701, -75), (690, -70)]:
        dr.line([(X(v), Y(-40)), (X(v), Y(d))], fill=(60, 60, 60), width=2)
    blk(694, 708, -75, -62, B.KIND_FILL['craft'], None)
    for u, r, ytop, name in [(40, 22, -20, 'Tank 1'), (245, 28, -60, 'Tank 2'), (410, 18, -90, 'Tank 3')]:
        blk(u - r, u + r, -184, ytop, B.KIND_FILL['tank'], name)
    blk(90, 205, -184, -165, B.KIND_FILL['works'], None); blk(530, 640, -186, -175, B.KIND_FILL['works'], 'the Yard')
    blk(-190, -176, -182, -160, B.KIND_FILL['line'], 'the Line')
    for u, r in [(-560, 24), (-470, 18)]:
        dr.ellipse([X(u - r), Y(-45 + 10), X(u + r), Y(-45)], fill=B.KIND_FILL['craft'], outline=(30, 30, 30))
    for u in (-880,):
        blk(u - 32, u + 32, 6, 9, B.KIND_FILL['pad'], 'Head Pad'); blk(u - 6, u + 6, 0, 6, (200, 200, 200), None)
    for u0, u1, name, col in [(-2300, -1700, 'the Lake Quay (behind, v +500)', B.KIND_FILL['ringsite']), (-1650, -1350, 'the Lake Ring (behind, v -570)', B.KIND_FILL['ringsite'])]:
        blk(u0, u1, 0, 7, col, name)
    dr.text((X(900), Y(-205) + 10), 'on to the plunge fall and the pillar rim (station 4)', font=fs, fill=(0, 0, 0))
    # scale
    dr.line([(X(-2600), Y(-240)), (X(-2100), Y(-240))], fill=(0, 0, 0), width=3); dr.text((X(-2600), Y(-240) + 6), '500 m (heights x3)', font=fs, fill=(0, 0, 0))
    return img

def cross_section():
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2000, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Section across the Deep Reach (v, at u = 245, through Tank 2 and the Middle Bridge; true scale)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 62), 'The walls step back on the pillar sandstone\'s hard beds; each bench carries a gallery building cut into the wall behind it. What the station session carves.', font=f, fill=(70, 70, 70))
    s = 3.4; ox = W / 2; top = 230
    X = lambda v: ox - v * s            # the right bank (v > 0) on the LEFT, as seen looking downstream
    Y = lambda y: top - y * s
    prof = [(320, 0), (150, 0), (150, B1), (128, B1), (128, B2), (105, B2), (105, B3), (85, B3), (85, FLOOR + 20), (70, FLOOR), (-70, FLOOR), (-85, FLOOR + 20),
            (-85, B3), (-105, B3), (-105, B2), (-128, B2), (-128, B1), (-150, B1), (-150, 0), (-320, 0)]
    dr.polygon([(X(v), Y(y)) for v, y in prof] + [(X(-320), Y(-230)), (X(320), Y(-230))], fill=(222, 200, 176), outline=(120, 100, 80))
    for k, y in enumerate(range(-20, -230, -22)):
        dr.line([(X(320), Y(y)), (X(-320), Y(y))], fill=(206, 150, 130) if k % 2 else (236, 226, 214), width=1)
    dr.polygon([(X(v), Y(y)) for v, y in prof] + [(X(-320), Y(60)), (X(320), Y(60))], fill=(255, 255, 255), outline=(120, 100, 80))
    def blk(v0, v1, y0, y1, col, name, dy=-20):
        dr.rectangle([X(v1), Y(y1), X(v0), Y(y0)], fill=col, outline=(30, 30, 30), width=2)
        if name: dr.text((X(v1) + 3, Y(y1) + dy), name, font=fs, fill=(0, 0, 0))
    for sg in (1, -1):
        blk(*(sorted([sg * 152, sg * 190])), 0, 24, B.KIND_FILL['outpost'] if sg > 0 else B.KIND_FILL['terrace'], 'rim range' if sg > 0 else 'rim range')
        for lv, hi, lo, h in [(B1, 150, 128, 26), (B2, 128, 105, 26), (B3, 105, 85, 26)]:
            a, b = sorted([sg * lo, sg * (hi + 6)])
            blk(a, b, lv, lv + h, B.KIND_FILL['terrace'], None)
        a, b = sorted([sg * 70, sg * 112])
        if sg < 0: blk(a, b, FLOOR, FLOOR + 22, B.KIND_FILL['hangar'], 'hangar (in the wall)', dy=4)
    blk(-150, 150, -4, 0, (120, 120, 128), 'the Middle Bridge (y 0)')
    blk(-33, 23, FLOOR, -60, B.KIND_FILL['tank'], 'Tank 2')
    dr.rectangle([X(-40), Y(FLOOR + 3), X(-58), Y(FLOOR)], fill=B.KIND_FILL['water']); dr.text((X(-40) + 4, Y(FLOOR) + 6), 'Pan Riba', font=fs, fill=BLUE)
    for v, t in [(150, 'right-bank rim (v +150)'), (-150, 'left-bank rim (v -150)')]:
        dr.text((X(v) - 80, Y(0) - 50), t, font=fs, fill=(0, 0, 0))
    for y in (B1, B2, B3, FLOOR):
        dr.text((X(-320) - 70, Y(y) - 9), 'y %d' % y, font=fs, fill=(90, 90, 90))
    dr.text((X(130) - 40, Y(-40) + 6), 'galleries on the benches: -40, -85, -130', font=fs, fill=(0, 0, 0))
    dr.line([(X(280), Y(-215)), (X(180), Y(-215))], fill=(0, 0, 0), width=3); dr.text((X(280), Y(-215) + 6), '100 m', font=fs, fill=(0, 0, 0))
    return img

def main():
    os.makedirs(OUT, exist_ok=True)
    for F in FLOORS:
        print('drawing', F['id'])
        B.draw_floor(F).save(os.path.join(OUT, F['id'] + '.png'))
    long_section().save(os.path.join(OUT, 'section-long.png'))
    cross_section().save(os.path.join(OUT, 'section-cross.png'))
    print('wrote', len(FLOORS), 'sheets and two sections to', OUT)

if __name__ == '__main__':
    main()
