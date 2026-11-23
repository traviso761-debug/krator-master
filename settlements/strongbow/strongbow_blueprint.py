#!/usr/bin/env python3
"""Strongbow today: the floorplan sheets and AREAS.md, drawn from the layout.

Everything drawn comes from the layout (src/30-sb-layout.js; its rules src/31-sb-rules.js), read through `node layout_dump.js`:
a part is on a sheet when its `sheets` names it. The sheets are made on the shared generator settlements/voth/palace/blueprint.py;
only the drawing is here. Change a part in the layout, never in this file.

Frame (the kits/ancients target's): x east along the face, y up from the foot, z south out of the rock. A plan sheet draws
u = x and v = -z, so the cliff is at the top of the sheet. Fill = who holds the part and in what state (the key on each sheet).

    python3 strongbow_blueprint.py        # writes floors/*.png and AREAS.md next to this file (needs node)
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
    sys.exit('the layout fails its checks (node settlements/strongbow/test-strongbow-town.js):\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))
PARTS = {p['id']: p for p in L['parts']}
WAYS = {w['id']: w for w in L['ways']}

# the fills say who holds a part and in what state
STATE_FILL = {'reclaimed': (238, 200, 140), 'kept': (214, 184, 232), 'squatted': (196, 156, 112), 'damaged': (222, 218, 208),
              'sealed': (150, 142, 142), 'cutoff': (246, 226, 226), 'gone': (182, 124, 108)}
B.KIND_FILL.update(STATE_FILL)
STATE_WORD = {'reclaimed': 'Xanadu\'s, reclaimed', 'kept': 'the Order\'s', 'squatted': 'the outcasts\', squatted', 'damaged': 'damaged, empty',
              'sealed': 'sealed', 'cutoff': 'cut off', 'gone': 'gone'}
DECOR = {'reclaimed': 2, 'kept': 3, 'squatted': 1}

def room(n, p, du=0.0, dv=0.0):
    s = p['shape']
    note = '%s [%s; y %g%s%s]%s' % (STATE_WORD[p['state']], p['id'], round(p['y']), ('; %d storeys' % p['st']) if p['st'] else '',
                                     ('; %d people' % p['people']) if p['people'] else '', (' ' + p['note']) if p.get('note') else '')
    if s[0] == 'box':
        r = R(n, p['name'], p['state'], s[1] + du, s[2] + du, -s[4] + dv, -s[3] + dv, DECOR.get(p['state'], 0), note)
    else:
        a = s[3] if s[0] == 'circ' else s[4]
        r = R(n, p['name'], p['state'], s[1] - a + du, s[1] + a + du, -s[2] - a + dv, -s[2] + a + dv, DECOR.get(p['state'], 0), note); r['circ'] = True
    return r

def rooms_of(sid, shift=None, keep=None):
    out = []
    rad = lambda p: 0 if p['shape'][0] == 'box' else (p['shape'][3] if p['shape'][0] == 'circ' else p['shape'][4])
    # boxes first, then circles and rings from the largest down, so a small one is drawn over the big one round it
    for p in sorted([p for p in L['parts'] if sid in p.get('sheets', []) and (keep is None or keep(p))], key=lambda p: (p['shape'][0] != 'box', -rad(p))):
        du, dv = (shift(p) if shift else (0.0, 0.0))
        out.append(room(len(out) + 1, p, du, dv))
    return out

def ring_fill(cx, cz, r0, r1, col, label, zmax):
    """a ring round the foot, kept south of the face (z > zmax), as a filled polygon (v = -z)"""
    pts = []
    for i in range(0, 181):
        a = math.pi * i / 180
        pts.append((cx + r1 * math.cos(a), -(cz + r1 * math.sin(a))))
    for i in range(180, -1, -1):
        a = math.pi * i / 180
        pts.append((cx + r0 * math.cos(a), -(cz + r0 * math.sin(a))))
    pts = [(u, min(v, -zmax)) for u, v in pts]
    return (pts, col, label)

GREY, BROWN, BLUE, RED, PURPLE, GOLD = (90, 90, 90), (130, 90, 50), (40, 110, 200), (190, 60, 50), (120, 60, 150), (200, 140, 30)
LOB = L['lobby']; HALL = L['hall']; PZ = L['plaza']; BAY = L['bay']
FACE = [([(-1000, 8), (-BAY['w'] / 2, 8), (-BAY['w'] / 2, BAY['d']), (BAY['w'] / 2, BAY['d']), (BAY['w'] / 2, 8), (1000, 8)], GREY, 4, 'the face and the bay (the rock above)')]
ROCK = ([(-1000, 8), (1000, 8), (1000, 300), (-1000, 300)], (206, 190, 170), 'the cliff (the Oidong side, 900 m above)')

FLOORS = []
tc = LOB['at']
fills0 = [ROCK] + [ring_fill(tc[0], tc[2], r0, r1, c, lbl, 0) for r0, r1, c, lbl in [
    (600, 900, (226, 236, 210), 'the farms (crops owed to the foot\'s climate)'), (470, 600, (236, 226, 214), 'the outer ring: the poor (900)'),
    (330, 470, (240, 232, 220), 'the middle ring: panel houses, the granary, the craftsmen (1,400)'),
    (200, 330, (246, 238, 226), 'the inner ring: courtyard houses, guildhalls, the bath (900)')]]
roads0 = [([(PZ['x0'], -(PZ['z0'] + PZ['z1']) / 2), (-420, -330), (-800, -620)], BROWN, 6, 'the road down to the Xanadu floor'),
          ([(-200, -380), (-300, -150)], BROWN, 4, 'the quarry spoke'), ([(0, -(PZ['z1'])), (0, -900)], BROWN, 4, 'the fields spoke')]
FLOORS.append(dict(R=1000, rect=(-950, 950, -1000, 300), id='S0', tier=0, title='Sheet S0: Strongbow today, the site at the foot (~1.9 x 1.3 km)',
    sub='The town rings the foot of the arcology on the scarp\'s lower ground, the cliff behind it (the Oidong Valley 900 m above, at the lip). The foot\'s podium is the bazaar, the serai, the governor and the salvagers\' yards; the terminus hall\'s west half is crushed under the fallen lower hull, which the salvagers quarry. The outcasts\' rope ways come down to the scree west of the Spine. The rings and their people are PLAN.md section 7; their lots are core/city\'s.',
    axisnote='x east along the face ->   the cliff at the top of the sheet; y 0 the foot.  [id] is the layout record; fill = holder and state',
    fills=fills0, lines=FACE + roads0, rooms=rooms_of('S0')))
FLOORS.append(dict(R=300, rect=(-340, 200, -300, 110), id='S1', tier=0, title='Sheet S1: the foot, ground floor (y 0): the lobby, the serai, the wings, the plaza',
    sub='The lobby is the bazaar round the core (the Spine\'s dead lift shafts; L1 runs inside) and the great stair; the serai stands on the terminus hall\'s surviving platforms, its crushed west half beyond; the west wing the governor and customs, the east wing the Salvagers\' Guildhall, the cutting sheds and the stores; the back block the granary; the plaza the shrine, the Cistern Pavilion over the west pool and the girder gate.',
    axisnote='x east ->   the face at the top; y 0', lines=FACE, rooms=rooms_of('S1')))
FLOORS.append(dict(R=300, rect=(-200, 200, -260, 40), id='S2', tier=1, title='Sheet S2: the foot, upper floors (y 9 to 27)',
    sub='The lobby\'s three galleries (money changers and scribes; the cookshops; the stallkeepers\' homes, broken in places) round the core and the great stair; the garrison\'s barracks over the west wing; the hull-crafts\' workshops over the east wing (its two top floors burned, not drawn); homes over the back block\'s stores.',
    axisnote='x east ->   the face at the top', lines=FACE, rooms=rooms_of('S2')))
# the Spine's terraces side by side: each panel centred on its terrace, with the drums of the run below it
TER = L['terraces']
def spine_shift(order):
    def f(p):
        y = p['y']
        k = next((i for i, (t, lo, hi) in enumerate(order) if lo <= y < hi), 0)
        t = TER[str(order[k][0])]
        return (-t['at'][0] + 260 * k, t['at'][2] + 0.0)
    return f
S3_ORDER = [(1, 0, 109), (2, 109, 171), (3, 171, 260)]
FLOORS.append(dict(R=420, rect=(-160, 700, -200, 160), id='S3', tier=2, title='Sheet S3: the Spine held by Xanadu: T1, T2, T3 and the drums below each (y 36 to 230)',
    sub='Left to right, each terrace with the drums of the run below it, centred on the terrace (the runs step out from the rock, so the drums sit off-centre): T1, the market garden, L1\'s head and L2\'s foot; T2, homes in the pavilion ring and kitchen gardens, L2\'s landing; T3, the garden deck (half reclaimed: its pavilion ring gutted), L2\'s head, L3\'s gated foot and W1\'s bridge. The run from T2 to T3 is burned and sealed. The east galleries 1 and 2 (homes, by girder bridges from T2 and T3) are on S7.',
    axisnote='three panels, 260 m apart: T1 | T2 | T3 (each centred on its terrace; the face toward the top)', rooms=rooms_of('S3', spine_shift(S3_ORDER), lambda p: p['kind'] != 'gallery')))
S4_ORDER = [(4, 231, 291), (5, 291, 351), (5, 351, 440)]
FLOORS.append(dict(R=420, rect=(-160, 700, -200, 160), id='S4', tier=3, title='Sheet S4: the upper Spine, the outcasts\' (y 230 to 430): T4, T5 and the runs above them',
    sub='Left to right: T4, the outcasts\' wild garden, and the run below it, their soundest drums (squatted); T5, the salvagers\' landing at L3\'s head, and the run below it, the salvagers\' working faces; the run above T5, nearest the break where the Spine\'s head tore off, cut off and unsafe. The outcasts come and go by rope ways down the face to the scree.',
    axisnote='three panels, 260 m apart: T4 | T5 | the run above T5', rooms=rooms_of('S4', spine_shift(S4_ORDER))))
FLOORS.append(dict(R=260, rect=(-230, 230, -260, 60), id='S5', tier=4, title='Sheet S5: the Nock (y 520): the Order\'s balloon field and the elevator\'s transfer landing',
    sub='The Nock\'s centre leans with the tower and is cracked; the Order keeps it, launching hot-air balloons from the landing pad and signalling from the mast. The west wing still bridges to the rock: at its inner end the elevator\'s transfer landing (W2 up to W3), walled off from the Order\'s field. The east wing fell with the snapped east stays.',
    axisnote='x east ->   the face at the top; y 520', lines=FACE, rooms=rooms_of('S5')))
FLOORS.append(dict(R=460, rect=(-820, 360, -60, 360), id='S6', tier=5, title='Sheet S6: the top (y 900): the Sultanate\'s post at the lip and the Order\'s gate',
    sub='W5 lands at the Sultanate\'s toll post at the lip; the caravan yard and stables behind it, where the valley road from Longsong ends. Along the lip west, the rim gallery, empty, its east end the Order\'s gatehouse at the foot of the arc ramp to the tower\'s crown (the Order\'s sealed house). The plateau\'s pad and its craft stand to the east, among the heliostats.',
    axisnote='x east ->   the plateau at the top (north), the lip and the drop below; y 900',
    lines=[([(-1000, 25), (1000, 25)], GREY, 4, 'the lip (the drop to Xanadu below)')], rooms=rooms_of('S6')))

# ------------------------------------------------------------------------------------------------ the elevation (S7)
SUB7 = 'Looking at the face from Xanadu. The elevator (gold): L1 in the core, L2 up the Spine to T3, a girder bridge to the wall, then W1 to W5 up the face west of the bay to the lip. L3 (purple) is the salvagers\' gated lift into the outcasts\' drums; the rope ways (brown, dashed) are the outcasts\'. Fill = holder and state, as on the plans.'
def elevation():
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2200, 1540; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Sheet S7: the elevation from Xanadu (true scale): the ways up, and who holds what', font=f_t, fill=(20, 20, 20))
    for i, ln in enumerate(B.wrap(dr, SUB7, f, W - 60)): dr.text((30, 62 + 26 * i), ln, font=f, fill=(70, 70, 70))
    s = 1.25; ox = 1050; base = 1480
    X = lambda x: ox + x * s
    Y = lambda y: base - y * s
    dr.rectangle([X(-800), Y(900), X(800), Y(0)], fill=(222, 206, 186))
    dr.rectangle([X(-BAY['w'] / 2), Y(900), X(BAY['w'] / 2), Y(0)], fill=(196, 180, 160))
    dr.line([(X(-800), Y(900)), (X(800), Y(900))], fill=GREY, width=3); dr.text((X(-790), Y(900) - 26), 'the lip (y 900; ~1,400 m)', font=fs, fill=GREY)
    dr.line([(X(-800), Y(0)), (X(800), Y(0))], fill=GREY, width=3); dr.text((X(-790), Y(0) + 6), 'the foot (y 0)', font=fs, fill=GREY)
    def blk(x0, x1, y0, y1, col, name=None, side='r'):
        dr.rectangle([X(x0), Y(y1), X(x1), Y(y0)], fill=col, outline=(40, 40, 40), width=1)
        if name: dr.text((X(x1) + 4, Y(y1)) if side == 'r' else (X(x0) - dr.textlength(name, font=fs) - 4, Y(y1)), name, font=fs, fill=(0, 0, 0))
    for p in sorted(L['parts'], key=lambda p: p['kind'] != 'tower'):   # the tower first: the Nock and the drums are drawn over it
        sp, k = p['shape'], p['kind']
        if p['zone'] in ('town',) or k in ('ground', 'quarry', 'wall') or p['state'] == 'gone' and k != 'drum': continue
        if sp[0] == 'box': x0, x1 = sp[1], sp[2]
        else:
            r = sp[3] if sp[0] == 'circ' else sp[4]; x0, x1 = sp[1] - r, sp[1] + r
        h = max(p['h'], 3)
        if k in ('rim', 'pad') or p['zone'] == 'Z9' and k not in ('post', 'yard', 'gate'): continue
        name = None
        if k in ('terrace',) and not p.get('in'): name = p['name'].split(':')[0]
        if k in ('post', 'landing') and p['id'] in ('sb.lip.post', 'sb.nock.landing'): name = p['name']
        if k == 'tower': name = p['name'].split(':')[0]
        blk(x0, x1, p['y'], p['y'] + h, STATE_FILL[p['state']], name, 'l' if k == 'tower' or p['id'] == 'sb.nock.landing' else 'r')
    for w in L['ways']:
        if w['kind'] == 'lift':
            x = w['frame'][0] + (8 if w['id'].startswith('L2') else 0)
            col = PURPLE if w.get('gated') else GOLD
            dr.line([(X(x), Y(w['y0'])), (X(x), Y(w['y1']))], fill=col, width=6)
            dr.text((X(x) + 8, Y((w['y0'] + w['y1']) / 2) - 9), w['id'], font=fs, fill=col)
        elif w['kind'] == 'bridge' and w.get('pts'):
            a, b = PARTS[w['a']], PARTS[w['b']]
            dr.line([(X(w['pts'][0][0]), Y(a['y'])), (X(w['pts'][1][0]), Y(b['y']))], fill=GOLD if w['b'].startswith('sb.wl') else BROWN, width=3)
        elif w['kind'] == 'rope':
            a, b = PARTS[w['a']], PARTS[w['b']]
            xa, xb = -200, b['shape'][1] - 30
            for t in range(0, 20, 2):
                dr.line([(X(xa + (xb - xa) * t / 20), Y(b['y'] * t / 20)), (X(xa + (xb - xa) * (t + 1) / 20), Y(b['y'] * (t + 1) / 20))], fill=BROWN, width=3)
            dr.text((X(xa) - 160, Y(60)), 'the outcasts\' rope ways', font=fs, fill=BROWN)
    # the key
    kx, ky = 30, 120
    for st, col in STATE_FILL.items():
        dr.rectangle([kx, ky, kx + 18, ky + 18], fill=col, outline=(0, 0, 0)); dr.text((kx + 24, ky - 2), STATE_WORD[st], font=fs, fill=(0, 0, 0)); ky += 26
    dr.line([(X(400), Y(60)), (X(500), Y(60))], fill=(0, 0, 0), width=3); dr.text((X(400), Y(60) + 6), '100 m', font=fs, fill=(0, 0, 0))
    return img

# ------------------------------------------------------------------------------------------------ AREAS.md, from SB.area
ZNAME = {'Z0': 'Z0 the foot', 'Z1': 'Z1 the lower Spine', 'Z2': 'Z2 the middle Spine', 'Z3': 'Z3 the upper Spine (the outcasts)', 'Z4': 'Z4 the Spine\'s head (gone)',
         'Z5': 'Z5 the Nock', 'Z6': 'Z6 the tower (the Order)', 'Z7': 'Z7 the face', 'Z8': 'Z8 the quarry and the scree', 'Z9': 'Z9 the top'}

def areas_md():
    rows = {}
    for r in AREA['rows']:
        a = rows.setdefault(r['zone'], dict(n=0, fp=0, floor=0, people=0, held=0))
        a['n'] += 1; a['fp'] += r['footprint']; a['floor'] += r['floor']; a['people'] += r['people']
        if r['state'] in ('reclaimed', 'kept', 'squatted'): a['held'] += r['floor']
    f = lambda v: '{:,}'.format(int(round(v)))
    out = ['# Strongbow today: floor area and people', '',
           'Generated by `strongbow_blueprint.py` from the layout (`src/30-sb-layout.js`, `SB.area` in `src/31-sb-rules.js`): floor is each',
           'part\'s footprint x its storeys (25.6/7 m); "held" is the floor of parts reclaimed (Xanadu), kept (the Order) or squatted (the',
           'outcasts). People are the layout\'s, which match PLAN.md section 6 and the census (`test-strongbow-town.js` checks both). The town',
           '(3,500 people) is not counted here: its lots are core/city\'s.', '',
           '| Zone | Parts | Footprint m2 | Floor m2 | Held m2 | People |', '|---|---|---|---|---|---|']
    for z in sorted(rows):
        a = rows[z]
        out.append('| %s | %d | %s | %s | %s | %s |' % (ZNAME.get(z, z), a['n'], f(a['fp']), f(a['floor']), f(a['held']), f(a['people'])))
    out.append('| **Total** | | | **%s** m2 | | **%s** |' % (f(AREA['floor']), f(AREA['people'])))
    out.append('')
    return '\n'.join(out)

def main():
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh: fh.write(areas_md())
    print('floor %d m2, %d people in the arcology' % (AREA['floor'], AREA['people']))
    for Fl in FLOORS:
        print('drawing', Fl['id'], len(Fl['rooms']), 'parts')
        B.draw_floor(Fl).save(os.path.join(OUT, Fl['id'] + '.png'))
    elevation().save(os.path.join(OUT, 'S7-elevation.png'))
    print('wrote', len(FLOORS), 'plans and the elevation to', OUT)

if __name__ == '__main__':
    main()
