#!/usr/bin/env python3
"""Ledge, Dalab's half-ruined Ancient arcology on the West Rift's great lake: the blueprint sheets and AREAS.md.

Everything drawn comes from the layout (src/30-ledge-layout.js, the one source; its rules src/31-ledge-rules.js), read through
`node layout_dump.js`. The plan sheets are made on the shared generator settlements/voth/palace/blueprint.py; the elevation from
the lake and the section through the cliff are drawn here on its fonts. Only the drawing is here: change the layout, never this file.

Frame (PLAN.md 9.2): x east along the face, z south out of it, y metres above sea level. On the plan sheets north is up (v = -z).

    python3 ledge_blueprint.py      # writes floors/*.png and AREAS.md next to this file (needs node)
"""
import json, math, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(['node', os.path.join(HERE, 'layout_dump.js')], capture_output=True, text=True, check=True, encoding='utf-8').stdout)
L, AREA, CENSUS, LINE = DUMP['layout'], DUMP['area'], DUMP['census'], DUMP['line']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('the layout fails its checks (node settlements/ledge/test-ledge.js):\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))
BOX = {b['id']: b for b in DUMP['boxes']}
DECKS = L['decks']
S, G = L['stack'], L['ground']
ZONE = {z['id']: z for z in L['zones']}

# the states' fills: lived warm, sound but empty grey, broken red-brown; the holders' fills for the buildings
STATE_FILL = {'reclaimed': (238, 214, 150), 'kept': (170, 200, 150), 'squatted': (226, 196, 170), 'dead': (214, 214, 214), 'sealed': (176, 176, 186),
              'damaged': (214, 160, 130), 'sheared': (196, 120, 100), 'pancaked': (170, 100, 90), 'gone': (255, 255, 255)}
BY_FILL = {'dalab': (238, 214, 150), 'fellgang': (196, 214, 236), 'lojfower': (170, 200, 150), 'none': (214, 214, 214)}
for k, v in STATE_FILL.items():
    B.KIND_FILL['st_' + k] = v
for k, v in BY_FILL.items():
    B.KIND_FILL['by_' + k] = v
B.KIND_FILL.update({'yard': (232, 222, 196), 'halting': (210, 226, 240), 'terrace': (206, 226, 176), 'heap': (178, 140, 120), 'lift': (60, 60, 60),
                    'core': (120, 120, 130), 'vault': (120, 140, 190), 'station': (120, 150, 110), 'mole': (190, 190, 196), 'water': (170, 214, 240)})
WATER = (186, 220, 242)


def u(x): return x


def v(z): return -z


def part_room(n, p):
    s = p['shape']
    kind = {'yard': 'yard', 'halting': 'halting', 'terrace': 'terrace', 'mole': 'mole', 'station': 'station', 'vault': 'vault'}.get(p['kind'], 'by_' + p['by'])
    note = '%s; %s%s%s' % (p['id'], p.get('key') or p['kind'], ('; %d people' % p['people']) if p['people'] else '', ('; ' + p['note']) if p.get('note') else '')
    return R(n, p['name'], kind, u(s[1]), u(s[2]), v(s[4]), v(s[3]), 1, note)


def deck_room(n, d, label=None):
    b = BOX[d['id']]
    note = '%s; %s%s; %d m2 at the peak%s' % (d['id'], d['state'], ('' if d['by'] == 'none' else ', ' + d['by']), b['floorM2'], ('; %d people' % d['people']) if d['people'] else '')
    return R(n, label or ('deck %d %s: %s' % (d['k'], d['wing'].upper(), d['use'])), 'st_' + d['state'], u(b['x0']), u(b['x1']), v(b['z1']), v(b['z0']), 1, note)


def lift_rooms(n0, k=None):
    out = []
    for i, lf in enumerate(L['lifts']):
        if lf['kind'] == 'core' and k is not None:
            pass
        out.append(R(n0 + i, lf['name'] + (' (runs)' if lf['state'] == 'runs' else ' (' + lf['state'] + ')'), 'lift' if lf['kind'] == 'car' else 'core',
                     u(lf['x'] - lf['w'] / 2), u(lf['x'] + lf['w'] / 2), v(lf['z'] + lf['d'] / 2), v(lf['z'] - lf['d'] / 2), 1,
                     lf['note'] + ('; car %gx%gx%g m, %d beasts, %d t' % (lf['car']['w'], lf['car']['d'], lf['car']['h'], lf['car']['beasts'], lf['car']['t']) if lf['kind'] == 'car' else '')))
    return out


def ellipse_pts(h, n=40):
    c, s0 = math.cos(h['ry']), math.sin(h['ry'])
    return [(h['x'] + h['rx'] * math.cos(t) * c - h['rz'] * math.sin(t) * s0, h['z'] + h['rx'] * math.cos(t) * s0 + h['rz'] * math.sin(t) * c)
            for t in [2 * math.pi * i / n for i in range(n)]]


def face_line(x0, x1):
    return [((x, 0)) for x in (x0, x1)]


def sheet_plan(id_, title, sub, rect, rooms, fills=None, lines=None):
    F = dict(id=id_, R=max(rect[1] - rect[0], rect[3] - rect[2]) / 2, rect=rect, title=title, sub=sub, rooms=rooms, fills=fills or [], lines=lines or [],
             axisnote='x east ->   north up the sheet; the face along the bottom of the head, the top of the apron')
    img = B.draw_floor(F)
    img.save(os.path.join(OUT, id_ + '.png'))
    print('drew', id_, len(rooms), 'rooms')


def layer_sheet(id_, k, title, extra=None):
    decks = [d for d in DECKS if d['k'] == k]
    rooms = [deck_room(i + 1, d) for i, d in enumerate(decks)]
    n = len(rooms) + 1
    for p in L['parts']:
        if p.get('deck') and int(p['deck'].split('.')[1]) == k and p.get('shape'):
            rooms.append(part_room(n, p)); n += 1
        elif p.get('deck') and int(p['deck'].split('.')[1]) == k:
            d = BOX[p['deck']]
            rooms.append(R(n, p['name'] + ' (on ' + p['deck'] + ')', 'by_' + p['by'], u(d['x0'] + 4), u(d['x0'] + 26), v(min(d['z1'] - 4, 30)), v(4), 1,
                           p['id'] + '; ' + p['key'] + '; ' + p.get('note', ''))); n += 1
    rooms += lift_rooms(n)
    W = max(BOX[d['id']]['x1'] for d in decks) + 60
    zmax = max(BOX[d['id']]['z1'] for d in decks) + 40
    rect = [-W, W, v(zmax), 200]
    rock = [((-W, 0), (W, 0), (W, 200), (-W, 200))]
    sub = ('Layer %d, its floor at %d m (%d m over the lake); %s. %s Decks coloured by state: lived (sand: Dalab and the Fellgangs, green: Loj Fower), '
           'sound and empty (grey), sealed (blue-grey), broken (red-brown: damaged, sheared, pancaked), gone (white). The rock behind the face is hatched grey; '
           'the great lifts\' shafts and the face cores in dark grey.' % (k, S['y0'] + S['pitch'] * k, S['y0'] + S['pitch'] * k - G['lake'],
                                                                         ZONE[decks[0]['zone']]['name'], extra or ''))
    sheet_plan(id_, title, sub, rect, rooms, fills=[([(x, -z) for x, z in [(-W, 0), (W, 0), (W, -200), (-W, -200)]], (200, 196, 190), 'the rock')])


def site_sheet():
    gr = DUMP['ground']
    rooms, n = [], 1
    for p in L['parts']:
        if p.get('shape') and not p.get('in') and p['kind'] in ('lifthall', 'station', 'vault', 'mole', 'yard', 'halting', 'mound', 'gate'):
            rooms.append(part_room(n, p)); n += 1
    rooms += lift_rooms(n)
    top = [d for d in DECKS if d['k'] == S['n'] - 1]
    fills = [([(x, -z) for x, z in [(-1500, 180), (1500, 180), (1500, 1500), (-1500, 1500)]], WATER, 'the great lake (297 m)')]
    for h in L['heaps']:
        fills.append(([(x, -z) for x, z in ellipse_pts(h)], B.KIND_FILL['heap'], h['id']))
    lines = [([(x, -z) for x, z, y in L['ways'][0]['pts']], (150, 70, 30), 4, "Dalab's road"),
             ([(-G['dressed'], 0), (G['dressed'], 0)], (0, 0, 0), 6, 'the dressed face'),
             ([(-G['dressed'], -G['quay']), (G['dressed'], -G['quay'])], (60, 60, 140), 3, 'the quay'),
             ([(p[0], -p[1]) for p in L['line']['approach']], (40, 110, 40), 5, 'the Line to the station')]
    # the shell's outlines: the top layer and the lowest
    for k, col in ((S['n'] - 1, (120, 80, 20)), (0, (60, 60, 60))):
        ds = [BOX[d['id']] for d in DECKS if d['k'] == k]
        pts = [(ds[0]['x0'], 0)] + sum([[(b['x0'], -b['z1']), (b['x1'], -b['z1'])] for b in ds], []) + [(ds[-1]['x1'], 0)]
        lines.append((pts, col, 3, 'layer %d' % k))
    hc = L['line']['helix']
    lines.append(([(hc['c'][0] + hc['r'] * math.cos(t), -(hc['c'][1] + hc['r'] * math.sin(t))) for t in [2 * math.pi * i / 48 for i in range(49)]], (40, 110, 40), 3, 'the helix (r %d m)' % hc['r']))
    lines.append(([(p['x'], -p['z']) for p in L['piers']], (90, 90, 120), 2, 'the viaduct\'s stumps toward Nulab'))
    sub = ('The site at 1:1 on Ledge\'s own ground (LEDGE.groundAt): the head\'s bench at %d m, the face dressed sheer for %d m, the apron at %d m out to '
           'the quay, the lake at %d m. The shell\'s outline at its top layer (brown) and its lowest (grey); the wreck heaps; the road down the escarpment; '
           'the Line\'s helix inside the escarpment and its approach to the station (%.1f km from %d m at %g %%, %.0f turns).'
           % (G['head'], 2 * G['dressed'], G['apron'], G['lake'], LINE['total'] / 1000, L['line']['helix']['y0'], L['line']['helix']['grade'] * 100, LINE['turns']))
    sheet_plan('S0-site', 'S0: Ledge, the site (north up)', sub, [-1500, 1500, -1500, 1500], rooms, fills, lines)


def zone_sheet(id_, zone, title, rect, ground_word):
    # a row of buildings is one key entry (its group box, lightly filled); each building is drawn as its own outline over it
    import re
    groups, order = {}, []
    for p in L['parts']:
        if p['zone'] == zone and p.get('shape') and not p.get('in') and not p.get('rock'):
            g = re.sub(r'_\d+$', '', p['id'])
            if g not in groups: groups[g] = []; order.append(g)
            groups[g].append(p)
    rooms, n, outl = [], 1, []
    for g in order:
        ps = groups[g]
        if len(ps) == 1:
            rooms.append(part_room(n, ps[0])); n += 1; continue
        x0 = min(p['shape'][1] for p in ps); x1 = max(p['shape'][2] for p in ps); z0 = min(p['shape'][3] for p in ps); z1 = max(p['shape'][4] for p in ps)
        keys = sorted(set(p.get('key') or p['kind'] for p in ps))
        rooms.append(R(n, ps[0]['name'] + ' (%d)' % len(ps), 'by_' + ps[0]['by'], u(x0), u(x1), v(z1), v(z0), 1,
                       '%s_0..%d; %s; %d people' % (g, len(ps) - 1, ', '.join(keys), sum(p['people'] for p in ps)))); n += 1
        for p in ps:
            s = p['shape']; outl.append(([(s[1], -s[3]), (s[2], -s[3]), (s[2], -s[4]), (s[1], -s[4]), (s[1], -s[3])], (60, 50, 40), 2))
    rooms += lift_rooms(n)
    fills, lines = [], outl
    if zone == 'Z5':
        fills.append(([(x, -z) for x, z in [(rect[0], G['quay']), (rect[1], G['quay']), (rect[1], 700), (rect[0], 700)]], WATER, 'the lake'))
        for h in L['heaps']:
            fills.append(([(x, -z) for x, z in ellipse_pts(h)], B.KIND_FILL['heap'], h['id']))
        for k, col in ((0, (60, 60, 60)), (20, (40, 110, 40)), (S['n'] - 1, (120, 80, 20))):
            ds = [BOX[d['id']] for d in DECKS if d['k'] == k]
            pts = [(ds[0]['x0'], 0)] + sum([[(b['x0'], -b['z1']), (b['x1'], -b['z1'])] for b in ds], []) + [(ds[-1]['x1'], 0)]
            lines.append((pts, col, 2, 'layer %d overhead' % k))
        lines.append(([(p['x'], -p['z']) for p in L['piers'][:8]], (90, 90, 120), 3, 'the viaduct\'s stumps'))
    else:
        fills.append(([(x, -z) for x, z in [(rect[0], 0), (rect[1], 0), (rect[1], 60), (rect[0], 60)]], (230, 230, 236), 'the face (the shell\'s crown below the edge)'))
        lines.append(([(p[0], -p[2]) for p in [(w[0], w[1], w[1]) for w in L['ways'][0]['pts']]], (150, 70, 30), 4, "Dalab's road"))
    lines.append(([(rect[0], 0), (rect[1], 0)], (0, 0, 0), 5, 'the face'))
    people = sum(p['people'] for p in L['parts'] if p['zone'] == zone)
    sub = ('%s, %s. %d buildings and yards, %d people in them (Dalab sand, the Fellgangs blue, Loj Fower green); buildings are their kit\'s def at its footprint '
           '(the Dalab set: VERN.place; the Fellgang set: TG.fg.draw). Fronts face the edge or the lake unless turned.'
           % (ZONE[zone]['name'].capitalize(), ground_word, len(rooms) - len(L['lifts']), people))
    sheet_plan(id_, title, sub, rect, rooms, fills, lines)


def elevation():
    """the shell from the lake (looking north): every deck as its width x its band, coloured by state; the face cores; the lifts' landings"""
    f_t = B.font(40, True); f = B.font(20); fs = B.font(16); fb = B.font(20, True)
    sx = 2.4; sy = 1.6; W = int(1600 * sx / 2) + 1100; H = int((G['head'] + 120 - 250) * sy) + 260
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ox, base = 120 + 800 * sx / 2, H - 80
    X = lambda x: ox + x * sx
    Y = lambda y: base - (y - 250) * sy
    dr.text((30, 16), 'Elevation from the lake: the shell, deck by deck, by state (true scale)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 66), 'Broken decks %.1f %% of the shell\'s floor (%s m2 at the Ancients\' peak, ~%s people then); %d people at Ledge today.'
            % (AREA['brokenShare'] * 100, '{:,}'.format(round(AREA['floor'])), '{:,}'.format(AREA['peak']), CENSUS['total']), font=f, fill=(70, 70, 70))
    dr.rectangle([0, Y(G['lake']), W, H], fill=WATER)
    dr.rectangle([X(-800), Y(G['head']), X(800), Y(G['apron'])], fill=(206, 198, 186), outline=(150, 140, 130))
    dr.rectangle([X(-800), Y(G['apron']), X(800), Y(G['lake'] - 4)], fill=(196, 190, 176))
    for d in DECKS:
        b = BOX[d['id']]
        dr.rectangle([X(b['x0']), Y(b['y1']), X(b['x1']), Y(b['y0'])], fill=STATE_FILL[d['state']], outline=(90, 90, 90))
        if d['state'] in ('sheared', 'pancaked', 'damaged'):
            for q in range(int(X(b['x0'])), int(X(b['x1'])), 10):
                dr.line([(q, Y(b['y0'])), (min(q + 8, X(b['x1'])), Y(b['y1']))], fill=(120, 60, 50), width=1)
    for z in L['zones'][1:]:
        y0, y1 = S['y0'] + S['pitch'] * z['k'][0] - S['slab'], S['y0'] + S['pitch'] * z['k'][1] + S['pitch'] - S['slab']
        dr.line([(X(380), Y(y0)), (X(380), Y(y1))], fill=(0, 0, 0), width=3)
        dr.text((X(390), Y(y1) + 4), '%s %s (k %d-%d), %d people' % (z['id'], z['name'], z['k'][0], z['k'][1], CENSUS['zones'][z['id']]), font=fb, fill=(0, 0, 0))
    for lf in L['lifts']:
        col = (0, 0, 0) if lf['kind'] == 'car' else (90, 90, 140)
        dr.line([(X(lf['x']), Y(lf['y0'])), (X(lf['x']), Y(lf['y1']))], fill=col, width=4 if lf['kind'] == 'car' else 2)
        if lf.get('runs'):
            dr.line([(X(lf['x']) + 4, Y(lf['runs'][0])), (X(lf['x']) + 4, Y(lf['runs'][1]))], fill=(0, 150, 0), width=3)
        for s in lf['stops']:
            y = G['head'] if s == 'head' else G['apron'] if s == 'apron' else BOX[s]['floor']
            dr.ellipse([X(lf['x']) - 6, Y(y) - 6, X(lf['x']) + 6, Y(y) + 6], fill=(0, 150, 0))
        dr.text((X(lf['x']) - 30, Y(lf['y1']) - 22), lf['id'], font=fs, fill=col)
    dr.text((X(-790), Y(G['head']) - 26), 'the head (%d m): Dalab\'s town, the road head, the Fellgang quarter' % G['head'], font=f, fill=(0, 0, 0))
    dr.text((X(-790), Y(G['apron']) + 4), 'the apron (%d m): the foot, the harbour' % G['apron'], font=f, fill=(0, 0, 0))
    dr.text((X(-790), Y(G['lake']) + 8), 'the great lake (%d m)' % G['lake'], font=f, fill=(0, 60, 120))
    lx, ly = X(380), Y(G['head'] + 60)
    for i, (k, c) in enumerate(STATE_FILL.items()):
        dr.rectangle([lx + 200 * (i % 5), ly + 26 * (i // 5) - 60, lx + 200 * (i % 5) + 18, ly + 26 * (i // 5) - 42], fill=c, outline=(0, 0, 0))
        dr.text((lx + 200 * (i % 5) + 24, ly + 26 * (i // 5) - 62), k, font=fs, fill=(0, 0, 0))
    dr.text((30, H - 50), 'Green line: a lift that runs; green dots: its landings (the great lifts at the foot, k 2, the station at k 20, the crown at k 39 and the head). '
            'Black: the great lifts\' shafts (in the rock behind the face, shown in front); blue: the face cores.', font=fs, fill=(60, 60, 60))
    img.save(os.path.join(OUT, 'elevation.png'))
    print('drew elevation')


def section(x=0):
    """through the cliff at x (looking east): the ground, every layer's reach and band by state, the shafts, the station, the vault"""
    f_t = B.font(40, True); f = B.font(20); fs = B.font(16)
    s = 1.05; W, H = 2000, int((G['head'] + 260 - 120) * s) + 200
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ox, base = 1100, H - 80
    X = lambda z: ox + z * s
    Y = lambda y: base - (y - 120) * s
    dr.text((30, 16), 'Section through the cliff at x %d (true scale): the decks, the great lifts, the Line\'s station' % x, font=f_t, fill=(20, 20, 20))
    dr.rectangle([X(G['quay']), Y(G['lake']), W, H], fill=WATER)
    # the ground's profile
    pts = []
    for zi in range(-1000, 900, 2):
        pts.append((X(zi), Y(groundAt(x, zi))))
    dr.polygon(pts + [(X(900), H), (X(-1000), H)], fill=(206, 198, 186), outline=(120, 110, 100))
    for d in DECKS:
        b = BOX[d['id']]
        if not (b['x0'] <= x <= b['x1']):
            continue
        reach = b['z1'] if d['state'] not in ('gone', 'sheared') else (4 if d['state'] == 'gone' else 12)
        dr.rectangle([X(-S['root']), Y(b['floor']), X(reach), Y(b['y0'])], fill=(150, 150, 150), outline=(80, 80, 80))
        if d['state'] not in ('gone',):
            dr.rectangle([X(0), Y(b['floor'] + S['storey'] * S['storeys']), X(max(1, reach - S['gallery'])), Y(b['floor'])], fill=STATE_FILL[d['state']], outline=(110, 110, 110))
        if d['state'] in ('gone', 'sheared'):
            dr.rectangle([X(reach), Y(b['floor']), X(b['z1']), Y(b['y0'])], outline=(200, 120, 100), width=1)
    for lf in L['lifts']:
        if lf['kind'] != 'car':
            continue
        dr.rectangle([X(lf['z'] - lf['d'] / 2), Y(lf['y1']), X(lf['z'] + lf['d'] / 2), Y(lf['y0'])], outline=(0, 0, 0), width=2)
        dr.text((X(lf['z'] - lf['d'] / 2) - 300, Y((lf['y0'] + lf['y1']) / 2) + 120), 'the great lifts\' shafts (x %d, %d), 1,250 m;' % (L['lifts'][0]['x'], L['lifts'][1]['x']), font=fs, fill=(0, 0, 0))
        dr.text((X(lf['z'] - lf['d'] / 2) - 300, Y((lf['y0'] + lf['y1']) / 2) + 140), 'the stairs in their cores (Loj Fower\'s)', font=fs, fill=(0, 0, 0))
        break
    for p in L['parts']:
        if p.get('rock'):
            sh = p['shape']
            dr.rectangle([X(sh[3]), Y(p['y'] + p['h']), X(sh[4]), Y(p['y'])], fill=B.KIND_FILL[p['kind']], outline=(0, 0, 0))
            lbl = p['name'][:60]; dr.text((X(sh[3]) - 8 - dr.textlength(lbl, font=fs), Y(p['y'] + p['h']) - 22), lbl, font=fs, fill=(0, 0, 0))
    ap = L['line']['approach']
    dr.line([(X(q[1]), Y(q[2])) for q in ap], fill=(40, 110, 40), width=5)
    dr.text((X(ap[0][1]) - 10, Y(ap[0][2]) - 26), 'the Line, from the helix (%d m) to the station (%d m)' % (ap[0][2], ap[-1][2]), font=fs, fill=(40, 110, 40))
    for z in L['zones'][1:]:
        ym = S['y0'] + S['pitch'] * (z['k'][0] + z['k'][1]) / 2.0
        dr.text((X(360), Y(ym) - 10), '%s %s (k %d-%d)' % (z['id'], z['name'], z['k'][0], z['k'][1]), font=f, fill=(0, 0, 0))
    dr.text((X(-980), Y(G['head']) - 28), 'the head\'s bench (%d m)' % G['head'], font=f, fill=(0, 0, 0))
    dr.text((X(G['quay']) + 10, Y(G['lake']) + 8), 'the lake (%d m)' % G['lake'], font=f, fill=(0, 60, 120))
    dr.text((30, H - 50), 'North to the left. Grey: the slabs (their roots 20 m into the rock); colour: the rooms by state; red outline: the plan\'s reach where a deck is sheared or gone.', font=fs, fill=(60, 60, 60))
    img.save(os.path.join(OUT, 'section.png'))
    print('drew section')


# the ground's height from the dumped grid (the section draws it at 2 m steps from the rules through node instead, below)
GROUND = json.loads(subprocess.run(['node', '-e', '''
const fs=require('fs'),path=require('path'),vm=require('vm');global.window=global;const ROOT=%r;
['core/rand/08-core-rand.js','core/space/20-core-space.js','settlements/ledge/src/30-ledge-layout.js','settlements/ledge/src/31-ledge-rules.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8')));
const o={};for(let z=-1000;z<900;z+=2)o[z]=LEDGE.groundAt(LEDGE_LAYOUT,0,z);process.stdout.write(JSON.stringify(o));''' % os.path.normpath(os.path.join(HERE, '..', '..')).replace(os.sep, '/')],
    capture_output=True, text=True, check=True, encoding='utf-8').stdout)


def groundAt(x, z):
    return GROUND[str(int(z))]


def areas():
    rows = AREA['rows']
    out = ['# Ledge: the area and the people', '',
           'Generated by `ledge_blueprint.py` from the layout (`LEDGE.area`, `LEDGE.census`). Do not edit; change `src/30-ledge-layout.js` and rerun.', '',
           '**The shell**: %d layers (%d m to %d m), %d decks; **%s m2** of floor at the Ancients\' peak (rooms on %d %% of each deck\'s footprint, %d storeys), '
           'about **%s people** then (homes on half the floor at 35 m2 a head, Span\'s rule). **Broken: %.1f %%** of the floor (section 0: half ruined); '
           'lived in today: %.1f %%.' % (S['n'], S['y0'], S['y0'] + S['pitch'] * (S['n'] - 1), len(DECKS), '{:,}'.format(round(AREA['floor'])), S['cover'] * 100, S['storeys'],
                                         '{:,}'.format(AREA['peak']), AREA['brokenShare'] * 100, AREA['livedShare'] * 100), '',
           '| Zone | Layers | Decks | Floor (m2) | Broken (m2) | Lived (m2) | People on the decks |', '|---|---|---|---|---|---|---|']
    for z in L['zones'][1:]:
        r = rows[z['id']]
        out.append('| %s %s | %d-%d | %d | %s | %s | %s | %d |' % (z['id'], z['name'], z['k'][0], z['k'][1], r['decks'], '{:,}'.format(round(r['floor'])),
                                                                  '{:,}'.format(round(r['broken'])), '{:,}'.format(round(r['lived'])), r['people']))
    out += ['', '**The 10,000** (`LEDGE.census`; PLAN.md 9.7): %d people.' % CENSUS['total'], '', '| Zone | People |', '|---|---|']
    for z in L['zones']:
        out.append('| %s %s | %d |' % (z['id'], z['name'], CENSUS['zones'].get(z['id'], 0)))
    out += ['', '| People | Count |', '|---|---|'] + ['| %s | %d |' % (k, n) for k, n in sorted(CENSUS['by'].items())]
    out += ['', '## The decks by state', '', '| State | Decks | Floor (m2) |', '|---|---|---|']
    for st in STATE_FILL:
        ds = [d for d in DECKS if d['state'] == st]
        out.append('| %s | %d | %s |' % (st, len(ds), '{:,}'.format(round(sum(BOX[d['id']]['floorM2'] for d in ds)))))
    out += ['', '## The lived decks', '', '| Deck | Holder | Use | Floor (m2) | People | m2 a head |', '|---|---|---|---|---|---|']
    for d in DECKS:
        if d['people']:
            out.append('| %s | %s | %s | %s | %d | %d |' % (d['id'], d['by'], d['use'], '{:,}'.format(round(BOX[d['id']]['floorM2'])), d['people'], BOX[d['id']]['floorM2'] / d['people']))
    out += ['', '## The parts with people', '', '| Part | Zone | Holder | Key | People |', '|---|---|---|---|---|']
    for p in L['parts']:
        if p['people']:
            out.append('| %s | %s | %s | %s | %d |' % (p['id'], p['zone'], p['by'], p.get('key') or p['kind'], p['people']))
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(out) + '\n')
    print('wrote AREAS.md')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    site_sheet()
    zone_sheet('S1-head', 'Z0', 'S1: the head (Z0), on the bench at %d m (north up)' % G['head'], [-840, 860, 0, 680], 'on the Ancients\' cut bench at %d m' % G['head'])
    layer_sheet('S2-crown', 39, 'S2: the crown (Z1), layer 39', 'The gene bank\'s vault in the rock behind W1; the governor and the hall on E1; the centre gone with the prow.')
    layer_sheet('S3-dead', 31, 'S3: the upper dead decks (Z2), layer 31', 'The prow gone from the centre; E2 pancaked; W2 and the gash\'s sides torn.')
    layer_sheet('S4-middle', 20, 'S4: the middle decks (Z3), layer 20: the Line\'s station', 'The station in the rock behind C and E1, its concourse on the decks; Loj Fower\'s decks round it; the outer wings sealed by the loj.')
    layer_sheet('S5-shear', 11, 'S5: the lower dead decks (Z4), layer 11: the shear', 'W1 and W2 sheared at the rock line (their decks heaped on the apron); the centre the salvagers\' (k 6-9).')
    layer_sheet('S6-footdecks', 2, 'S6: the foot decks (Z5), layer 2', 'Dalab west and centre, the Fellgangs east; the great lifts\' lowest deck landings.')
    zone_sheet('S7-foot', 'Z5', 'S7: the foot (Z5), on the apron at %d m (north up)' % G['apron'], [-720, 720, -700, 10], 'on the Ancients\' apron at %d m' % G['apron'])
    elevation()
    section(-100)
    areas()
