#!/usr/bin/env python3
"""Span, the ruined Ancient arcology in Pan Riba's canyon (SW highlands): the floorplan sheets and AREAS.md.

Everything drawn comes from the layout (src/30-span-layout.js, the one source; its rules src/31-span-rules.js), read
through `node layout_dump.js`: a part is on a sheet when its `sheets` names it. The sheets are made on the shared
generator settlements/voth/palace/blueprint.py (its circles, fills and lines are this plan's additions). Only the
drawing is here: change a part in the layout, never in this file.

Frame (PLAN.md section 1): u runs DOWNSTREAM along the canyon's axis (the lake upstream, drawn left), v across (v > 0 the
right bank looking downstream, drawn up), y up from the tableland's rim (y 0, ~2,600 m assumed). Metres.

    python3 span_blueprint.py        # writes floors/*.png and AREAS.md next to this file (needs node)
"""
import json, math, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(['node', os.path.join(HERE, 'layout_dump.js')], capture_output=True, text=True, check=True, encoding='utf-8').stdout)
L, AREA = DUMP['layout'], DUMP['area']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('the layout fails its checks (node settlements/span/test-span.js):\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))
PARTS = {p['id']: p for p in L['parts']}
WAYS = {w['id']: w for w in L['ways']}
HALF = {int(k): v for k, v in L['half'].items()}
LV = L['levels']
REACH = L['reach']
BAYC, BAYRIM, APRON, RING = L['bay']['c'], L['bay']['rim'], L['bay']['apron'], L['bay']['ring']
LAKE_Y = -8

B.KIND_FILL.update({'water': (170, 214, 240), 'pad': (196, 200, 214), 'dome': (252, 252, 246), 'ringsite': (232, 236, 228),
                    'tank': (214, 214, 206), 'hangar': (150, 146, 140), 'works': (200, 194, 182), 'terrace': (244, 242, 234),
                    'bridge': (120, 120, 128), 'fallen': (178, 120, 104), 'outpost': (226, 178, 120), 'portal': (120, 60, 150),
                    'mound': (186, 150, 96), 'craft': (184, 196, 206), 'weir': (140, 160, 170), 'line': (160, 60, 40), 'ledge': (226, 222, 214)})
FILL_OF = {'ringsite': 'ringsite', 'weir': 'weir', 'dome': 'dome', 'mound': 'mound', 'pad': 'pad', 'bay': 'terrace', 'deck': 'terrace', 'craft': 'craft',
           'portal': 'portal', 'ramp': 'passage', 'dalab': 'outpost', 'cross': 'outpost', 'gate': 'outpost', 'range': 'terrace', 'bridge': 'bridge',
           'gallery': 'terrace', 'ledge': 'ledge', 'payload': 'craft', 'hangar': 'hangar', 'tank': 'tank', 'works': 'works', 'fallen': 'fallen', 'wall': 'line'}
STATE_WORD = {'intact': 'intact', 'ruined': 'ruined', 'toppled': 'toppled', 'rehab': 'rehabilitated', 'worn': 'worn'}

def room(n, p):
    """a layout part as a blueprint room: its fill says what it is (Dalab's, held, fallen), its note its state and id"""
    s = p['shape']
    if p.get('in') and p['kind'] not in ('dalab', 'craft'):
        kind = p['kind']                                     # a zone of the Cross: the generator's own room kinds
    elif p['by'] == 'dalab' and p['kind'] == 'wall':
        kind = 'line'
    elif p['by'] == 'dalab' or (p.get('held') and p['kind'] in ('cross', 'gate', 'range', 'gallery', 'dome', 'deck', 'dalab')):
        kind = 'mound' if p['kind'] == 'mound' else 'outpost'
    elif p['state'] == 'toppled' and p['kind'] not in ('tank',):
        kind = 'fallen'
    else:
        kind = FILL_OF.get(p['kind'], 'terrace')
    word = STATE_WORD[p['state']] + (', held by Dalab' if p.get('held') and p['by'] != 'dalab' else '') + (', Dalab\'s' if p['by'] == 'dalab' else '')
    extra = []
    if p['st']: extra.append('%d storeys' % p['st'])
    if p['y']: extra.append('y %g' % p['y'])
    note = '%s [%s; %s]%s' % (word, p['id'], ', '.join(extra) if extra else 'y 0', (' ' + p['note']) if p.get('note') else '')
    decor = 2 if p.get('held') else (0 if p['state'] == 'toppled' else 1)
    if s[0] == 'box':
        r = R(n, p['name'], kind, s[1], s[2], s[3], s[4], decor, note)
    else:
        a, b = (s[3], s[3]) if s[0] == 'circ' else (s[3], s[4])
        r = R(n, p['name'], kind, s[1] - a, s[1] + a, s[2] - b, s[2] + b, decor, note); r['circ'] = True
    return r

def sheet_rooms(sid):
    return [room(i + 1, p) for i, p in enumerate([p for p in L['parts'] if sid in p.get('sheets', [])])]

def oval(cu, cv, a, b, n=48):
    return [(cu + a * math.cos(2 * math.pi * i / n), cv + b * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]

LAKE = [(-2560, -120), (-2480, -360), (-2200, -430), (-1900, -380), (-1600, -300), (-1300, -200), (-1100, -90), (-1050, 0),
        (-1100, 120), (-1350, 240), (-1700, 330), (-2050, 400), (-2350, 330), (-2540, 160)]
GREY, BLUE, BROWN, PURPLE = (90, 90, 90), (40, 110, 200), (130, 90, 50), (120, 60, 150)

def rims(level, col=GREY, w=3, label=None):
    h = HALF[level]
    out = [([(REACH[0], h), (REACH[1], h)], col, w), ([(REACH[0], -h), (REACH[1], -h)], col, w)]
    if label: out[0] = out[0] + (label,)
    return out

def way(wid, col, width, label=True):
    w = WAYS[wid]
    q = ([(x[0], x[1]) for x in w['pts']], col, width)
    return q + (w['note'],) if label and w.get('note') else q

CH = L['canyon']
HEAD = [([tuple(CH['head'][0]), tuple(CH['head'][1])], GREY, 3), ([(CH['head'][0][0], -CH['head'][0][1]), (CH['head'][1][0], -CH['head'][1][1])], GREY, 3)]
DOWN = [([tuple(CH['down'][0]), tuple(CH['down'][1])], GREY, 3, 'the natural canyon on, to the plunge fall and the pillar rim'),
        ([(CH['down'][0][0], -CH['down'][0][1]), (CH['down'][1][0], -CH['down'][1][1])], GREY, 3)]
BAYLINE = [(oval(BAYC[0], BAYC[1], BAYRIM[0], BAYRIM[1]), GREY, 3)]
RIVER = [way('river', BLUE, 4, False)]
ROADS = [way(w['id'], BROWN, 7 if w['w'] >= 12 else 5) for w in L['ways'] if w['kind'] == 'road' and w['id'] != 'ring_road']
RINGROAD = [way('ring_road', BROWN, 6, False)]
TUNNELS = [way('basin_tunnel', PURPLE, 6), way('valley_tunnel', PURPLE, 6)]
REACH_FILL = [(REACH[0], 150), (REACH[1], 150), (REACH[1], -150), (REACH[0], -150)]
FLOOR_FILL = [(REACH[0], HALF[-180]), (REACH[1], HALF[-180]), (REACH[1], -HALF[-180]), (REACH[0], -HALF[-180])]

# ------------------------------------------------------------------------------------------------ the sheets
FLOORS = []
SITE = dict(R=1958, rect=(-2650, 1250, -800, 800))
CORE = dict(R=908, rect=(-950, 850, -500, 500))
FLOORS.append(dict(SITE, id='S0', tier=0, title='Sheet S0: Span and its lake (the site, ~3.9 x 1.6 km)',
  sub='Pan Riba leaves the lake over the Ancients\' weir, falls into the canyon head, runs under the Upper Bay\'s deck and the Cross, and through the Deep Reach, the arcology\'s works down both walls. Two outlying sites by the lake. Two Ancient road tunnels: the Basin Tunnel, intact and cleared, comes up inside the rock from the south-western lowlands to the bay (Dalab\'s way onto the plateau, its trading post on the Apron at the mouth); the Valley Tunnel, held by no one, opens on the Deep Reach\'s floor. The pillar rim and Dalab\'s watch post lie downstream (u > 1200).',
  axisnote='u downstream along Pan Riba ->   v across (the right bank up); y from the rim. [id] is the layout record.',
  fills=[(LAKE, B.KIND_FILL['water'], 'the lake (y -8, on the tableland; the biome kit makes it)'),
         (REACH_FILL, (214, 200, 180), 'the Deep Reach (rim to rim 300 m)')],
  lines=HEAD + DOWN + BAYLINE + RIVER + ROADS + RINGROAD + rims(0) + TUNNELS,
  rooms=sheet_rooms('S0')))
FLOORS.append(dict(CORE, id='S1', tier=0, title='Sheet S1: the rims (y = 0) and the bay\'s terraces (y -30)',
  sub='The ring road round the Upper Bay with its terrace domes inside (three of them Dalab\'s lodgings) and its ring-walled domes outside; the Cross\'s roof and gate towers where the two highways cross; the two-storey rim ranges (the white curved band) along both rims of the Deep Reach, ring-walled domes and round pads on them; the Middle Bridge. Dalab holds the Cross, its towers, the Sound Quarter, the genepriests\' dome and Pad 1.',
  axisnote='u downstream ->   v across (the right bank up)   y = 0, the rim',
  fills=[(REACH_FILL, (214, 200, 180), 'open: the Deep Reach below'), (oval(BAYC[0], BAYC[1], APRON[0], APRON[1]), (225, 215, 196), 'the Apron (y -45) below')],
  lines=HEAD + BAYLINE + RINGROAD + ROADS + rims(0),
  rooms=sheet_rooms('S1')))
FLOORS.append(dict(CORE, id='S2', tier=1, title='Sheet S2: the walls (benches at y -40, -85, -130) and the Apron (y -45): the trading post',
  sub='The arcology\'s floors step down both walls on the sandstone\'s hard beds: a three-storey gallery on the -40 and -85 benches, its back cut into the rock; the -130 bench a service ledge. In the bay the Apron, a deck over the river\'s slot, cleared by Dalab for its trading post: the Basin Tunnel comes out of the bay\'s left wall onto it, the plateau\'s traders come down the ring road into it. Two lower bridges: the Low Bridge (fallen) and the Pipe Bridge with its hung payloads (kits/ancients\' canyon target).',
  axisnote='u downstream ->   v across   bands: rim to -40, -40 to -85, -85 to -130 (outer to inner)',
  fills=[(FLOOR_FILL, (200, 186, 166), 'the floor (y -180) below')],
  lines=HEAD + BAYLINE + rims(0) + rims(-40, (150, 150, 150), 2) + rims(-85, (150, 150, 150), 2) + rims(-130, (150, 150, 150), 2) + RIVER + [way('basin_tunnel', PURPLE, 6)],
  rooms=sheet_rooms('S2')))
FLOORS.append(dict(CORE, id='S3', tier=2, title='Sheet S3: the canyon floor (y -180) and the slot under the bay',
  sub='The river in its channel along the left bank; six hangars cut into the walls under the benches; the Valley Tunnel\'s portal in the right wall, the machines\' and mutants\' way up; the tanks standing from the floor most of the way to the rim; the works. Dalab\'s Line (a salvage wall, the Cross\'s gun gallery above it) closes the Deep Reach at the Cross; the breached Outfall Gate at the downstream end.',
  axisnote='u downstream ->   v across   y = -180 in the Deep Reach; the slot under the Apron from y -60 to -110',
  fills=[(FLOOR_FILL, (200, 186, 166), 'the floor'), ([(-900, 25), (-300, 25), (-300, -25), (-900, -25)], (190, 176, 156), 'the slot under the Apron'),
         ([(REACH[0], -40), (REACH[1], -40), (REACH[1], -58), (REACH[0], -58)], B.KIND_FILL['water'])],
  lines=HEAD + BAYLINE + rims(-130, (150, 150, 150), 2) + rims(-180, GREY, 3) + RIVER + [way('valley_tunnel', PURPLE, 6)],
  rooms=sheet_rooms('S3')))
FLOORS.append(dict(R=268, rect=(-330, -150, -260, 260), id='S4', tier=0, title='Sheet S4: the Cross, the fort\'s main floor (y -10) and its gate towers: zones',
  sub='Dalab\'s fort is the Cross: the bridge building over the canyon where the two highways meet, its gate towers on both abutments, its upstream face toward the bay and the trading post (the lizard stalls\' ramp down to the caravan yard), its downstream face the Line toward the Deep Reach (the gun gallery). These are ZONES, not rooms: a floor of the Cross is 36,000 m2, more than a garrison of ~240 can fill, so Dalab lives in partitioned corners and the rest stands empty or sealed. Rooms are cut later (blueprints.md step 6).',
  axisnote='u downstream ->   v across (the right bank up)   the canyon under v -150..150',
  lines=[([(-330, 150), (-150, 150)], GREY, 2, 'right-bank rim'), ([(-330, -150), (-150, -150)], GREY, 2, 'left-bank rim')],
  rooms=sheet_rooms('S4')))

# ------------------------------------------------------------------------------------------------ the sections
def parts_of(kind):
    return [p for p in L['parts'] if p['kind'] == kind]

def u_span(p):
    s = p['shape']
    return (s[1], s[2]) if s[0] == 'box' else (s[1] - s[3], s[1] + s[3])

def long_section():
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2600, 1100; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Section along the canyon (u, at v = 0): the lake, the bay, the Cross, the Deep Reach (heights x3)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 62), 'y = 0 is the rim (~2,600 m, assumed); the Deep Reach floor y -180 (Pan Riba\'s bed ~2,416 m on the model). Parts off the axis are drawn where they stand along it.', font=f, fill=(70, 70, 70))
    sx = 0.6; sy = 3 * sx; ox = 30 + 2650 * sx; top = 300
    X = lambda u: ox + u * sx
    Y = lambda y: top - y * sy
    g = [(-2650, 0), (-2560, 0), (-2550, -30), (-1100, -30), (-1070, 0), (-1030, 0), (-900, -8), (-900, -60), (-300, -110), (-180, -180), (820, -190), (830, -195), (1250, -205)]
    dr.polygon([(X(u), Y(y)) for u, y in g] + [(X(1250), Y(-260)), (X(-2650), Y(-260))], fill=(222, 200, 176), outline=(120, 100, 80))
    dr.polygon([(X(u), Y(y)) for u, y in [(-2550, LAKE_Y), (-1070, LAKE_Y), (-1070, -30), (-2550, -30)]], fill=B.KIND_FILL['water'])
    dr.line([(X(-2550), Y(LAKE_Y)), (X(-1070), Y(LAKE_Y))], fill=BLUE, width=3); dr.text((X(-2000), Y(LAKE_Y) + 8), 'the lake (the biome kit\'s)', font=fs, fill=BLUE)
    dr.text((X(-890), Y(-40)), 'Head Fall (~50 m)', font=fs, fill=(0, 0, 0))
    dr.line([(X(-900), Y(0)), (X(1250), Y(0))], fill=(190, 190, 190), width=2)
    for y in (-40, -85, -130):
        dr.line([(X(REACH[0]), Y(y)), (X(REACH[1]), Y(y))], fill=(214, 214, 214), width=1); dr.text((X(REACH[1] + 10), Y(y) - 9), 'bench %d' % y, font=fs, fill=(150, 150, 150))
    def blk(u0, u1, y0, y1, col, name, dy=-20):
        dr.rectangle([X(u0), Y(y1), X(u1), Y(y0)], fill=col, outline=(30, 30, 30), width=2)
        if name: dr.text((X(u0) + 3, Y(y1) + dy), name, font=fs, fill=(0, 0, 0))
    def at(pid, name=None, col=None, dy=-20):
        p = PARTS[pid]; u0, u1 = u_span(p)
        blk(u0, u1, p['y'], p['y'] + max(p['h'], 2), col or B.KIND_FILL.get(room(0, p)['kind'], (220, 220, 220)), p['name'] if name is None else name, dy)
    at('weir'); at('apron', 'the Apron (y -45); the river\'s slot under it', dy=8); at('cross', 'the Cross (Dalab\'s fort), roof road y 0')
    at('basin_portal', None, PURPLE, dy=-40); at('sluice', None, (180, 160, 130), dy=8)
    for pid in ('middle_bridge', 'lowb_n', 'pipe_bridge', 'hang_prison', 'tank_1', 'tank_2', 'tank_3', 'engine_works', 'yard', 'line', 'outfall'):
        at(pid, PARTS[pid]['name'] if pid not in ('engine_works',) else None)
    at('valley_portal', 'the Valley Tunnel\'s portal (right wall)', PURPLE, dy=8)
    at('head_pad'); at('lake_quay', 'the Lake Quay (behind)'); at('lake_ring', 'the Lake Ring (behind)', dy=-40)
    dr.text((X(900), Y(-205) + 10), 'on to the plunge fall and the pillar rim (station 4)', font=fs, fill=(0, 0, 0))
    dr.line([(X(-2600), Y(-240)), (X(-2100), Y(-240))], fill=(0, 0, 0), width=3); dr.text((X(-2600), Y(-240) + 6), '500 m (heights x3)', font=fs, fill=(0, 0, 0))
    return img

def cross_section():
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2000, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Section across the Deep Reach (v, at u = 245, through Tank 2 and the Middle Bridge; true scale)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 62), 'The walls step back on the pillar sandstone\'s hard beds: a three-storey gallery on the -40 and -85 benches, a service ledge at -130. What the station session carves.', font=f, fill=(70, 70, 70))
    s = 3.4; ox = W / 2; top = 230; FL = LV['floor']
    X = lambda v: ox - v * s            # the right bank (v > 0) on the LEFT, as seen looking downstream
    Y = lambda y: top - y * s
    steps = [(0, -40), (-40, -85), (-85, -130), (-130, None)]
    prof = [(320, 0)]
    for y0, y1 in steps:
        prof.append((HALF[y0], y0))
        prof.append((HALF[y0], y1 if y1 is not None else FL + 20))
    prof += [(HALF[-130], FL + 20), (HALF[-180], FL)]
    prof = prof + [(-v, y) for v, y in reversed(prof)]
    dr.polygon([(X(v), Y(y)) for v, y in prof] + [(X(-320), Y(-230)), (X(320), Y(-230))], fill=(222, 200, 176), outline=(120, 100, 80))
    for k, y in enumerate(range(-20, -230, -22)):
        dr.line([(X(320), Y(y)), (X(-320), Y(y))], fill=(206, 150, 130) if k % 2 else (236, 226, 214), width=1)
    dr.polygon([(X(v), Y(y)) for v, y in prof] + [(X(-320), Y(60)), (X(320), Y(60))], fill=(255, 255, 255), outline=(120, 100, 80))
    def blk(v0, v1, y0, y1, col, name, dy=-20):
        dr.rectangle([X(v1), Y(y1), X(v0), Y(y0)], fill=col, outline=(30, 30, 30), width=2)
        if name: dr.text((X(v1) + 3, Y(y1) + dy), name, font=fs, fill=(0, 0, 0))
    u = 245
    for p in L['parts']:
        sp = p['shape']
        if sp[0] != 'box' or not (sp[1] <= u <= sp[2]) or p['kind'] not in ('range', 'gallery', 'ledge', 'hangar', 'bridge'): continue
        col = B.KIND_FILL['outpost'] if p.get('held') else B.KIND_FILL.get(FILL_OF.get(p['kind']), (240, 240, 240))
        blk(sp[3], sp[4], p['y'], p['y'] + max(p['h'], 2), col, p['name'] if p['kind'] in ('range', 'bridge', 'hangar') else None, dy=4 if p['kind'] == 'hangar' else -20)
    t2 = PARTS['tank_2']['shape']
    blk(t2[2] - t2[3], t2[2] + t2[3], FL, FL + PARTS['tank_2']['h'], B.KIND_FILL['tank'], 'Tank 2')
    dr.rectangle([X(-40), Y(FL + 3), X(-58), Y(FL)], fill=B.KIND_FILL['water']); dr.text((X(-40) + 4, Y(FL) + 6), 'Pan Riba', font=fs, fill=BLUE)
    for v, t in [(150, 'right-bank rim (v +150)'), (-150, 'left-bank rim (v -150)')]:
        dr.text((X(v) - 80, Y(0) - 50), t, font=fs, fill=(0, 0, 0))
    for y in (-40, -85, -130, FL):
        dr.text((X(-320) - 70, Y(y) - 9), 'y %d' % y, font=fs, fill=(90, 90, 90))
    dr.line([(X(280), Y(-215)), (X(180), Y(-215))], fill=(0, 0, 0), width=3); dr.text((X(280), Y(-215) + 6), '100 m', font=fs, fill=(0, 0, 0))
    return img

# ------------------------------------------------------------------------------------------------ AREAS.md, from the layout's SPAN.area
GROUPS = [('gal_', 'Wall galleries on the -40 and -85 benches, both walls'), ('rng_', 'Rim ranges along both rims'), ('cross', 'The Cross over the canyon'),
          ('gate_', 'The gate towers on the abutments'), ('bay_dome_', 'Bay terrace domes'), ('ring_dome_', 'Ring-walled domes round the bay'),
          ('rdome_', 'Rim domes'), ('dome_lone_', 'Lone domes on the tableland'), ('hangar_', 'Hangars cut into the walls'),
          ('engine_works', 'The works'), ('foundry', 'The works'), ('yard', 'The works'), ('lake_quay', 'The Lake Quay'), ('lake_ring', 'The Lake Ring')]

def areas_md():
    rows = {}
    for r in AREA['rows']:
        name = next((g[1] for g in GROUPS if r['id'].startswith(g[0])), r['name'])
        a = rows.setdefault(name, dict(fp=0, floor=0, people=0, ids=[], st=set()))
        a['fp'] += r['footprint']; a['floor'] += r['floor']; a['people'] += r['people']; a['ids'].append(r['id']); a['st'].add(r['st'])
    out = ['# Span: floor area and population at its peak', '',
           'Generated by `span_blueprint.py` from the layout (`src/30-span-layout.js`, `SPAN.area` in `src/31-span-rules.js`): floor is',
           'footprint x share built x storeys (the kit\'s 4.5 m storey); people are each part\'s home floor / %d m2 a head. The Apron (a' % L['m2PerHead'],
           'deck), the -130 service ledges, the tanks, bridges, pads and the zones inside the Cross (counted in the Cross) are not floor.',
           'The owner chose the trimmed size on 2026-10-27; `test-span.js` holds the total between 700,000 and 850,000 m2.', '',
           '| Part | Records | Footprint m2 | Storeys | Floor m2 | People |', '|---|---|---|---|---|---|']
    for name, a in rows.items():
        out.append('| %s | %d | %d | %s | %d | %d |' % (name, len(a['ids']), round(a['fp']), '/'.join(str(x) for x in sorted(a['st'])), round(a['floor']), round(a['people'])))
    out.append('| **Total** | | | | **%d** (%.1f million ft2) | **%d** |' % (round(AREA['floor']), AREA['floor'] * 10.764 / 1e6, round(AREA['people'])))
    out += ['', 'Today: Dalab\'s fort (~240) and the trading post at the Basin Tunnel\'s mouth (~500: traders, inn and caravan',
            'hands, porters, the tunnel\'s wardens, families): about 750 people, in the Cross, the Sound Quarter, three bay domes',
            'and on the Apron (PLAN.md section 4). The rest stands empty.', '']
    return '\n'.join(out)

def main():
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh: fh.write(areas_md())
    print('floor %d m2, peak population %d' % (AREA['floor'], AREA['people']))
    for F in FLOORS:
        print('drawing', F['id'], len(F['rooms']), 'parts')
        B.draw_floor(F).save(os.path.join(OUT, F['id'] + '.png'))
    long_section().save(os.path.join(OUT, 'section-long.png'))
    cross_section().save(os.path.join(OUT, 'section-cross.png'))
    print('wrote', len(FLOORS), 'sheets and two sections to', OUT)

if __name__ == '__main__':
    main()
