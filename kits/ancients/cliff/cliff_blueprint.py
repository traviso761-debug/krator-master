#!/usr/bin/env python3
"""The cliff city's blueprint sheets and AREAS.md, for any build on KCLIFF (kits/ancients/cliff): Ledge, Shelf.

Lifted from settlements/ledge/ledge_blueprint.py (2026-11-22) when Shelf took the same form. A build's own script names its words
(its grounds, its water, its zones, its sheets) in a config and calls the functions here; everything drawn comes from its layout, read
through its `node layout_dump.js` (which hands over the layout, the deck boxes, the area, the census, the Line, the checks and a ground
profile). The plan sheets are made on the shared generator settlements/voth/palace/blueprint.py; the elevation and the section are drawn
here on its fonts. Frame: x along the face, z out of it, y metres above sea level; on the plan sheets the face's back is up (v = -z).

    import cliff_blueprint as CB
    C = CB.load(here, cfg)          # runs layout_dump.js, fails on a layout that fails its checks
    CB.site_sheet(C); CB.zone_sheet(C, ...); CB.layer_sheet(C, ...); CB.elevation(C); CB.section(C, x); CB.areas(C)

cfg: name, test (its node test, for the failure message), top {key, zone, label, word, stop}, bottom {key, zone, label, word, stop} (stop: the lifts' name for it),
     datum {level, label} (what the heights are read against: the lake, the plain), water {level, quay, label} or None,
     holders {by: fill}, people_note (the holders' colours, in words), inward (the compass word for -z), section_z [z0, z1],
     elev_title, extra_site_lines(C) -> lines (optional)
"""
import json, math, os, re, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'settlements', 'voth', 'palace'))
import blueprint as B
from blueprint import R
from PIL import Image, ImageDraw

STATE_FILL = {'reclaimed': (238, 214, 150), 'kept': (170, 200, 150), 'squatted': (226, 196, 170), 'dead': (214, 214, 214), 'sealed': (176, 176, 186),
              'damaged': (214, 160, 130), 'sheared': (196, 120, 100), 'pancaked': (170, 100, 90), 'gone': (255, 255, 255)}
WATER = (186, 220, 242)
for _k, _v in STATE_FILL.items():
    B.KIND_FILL['st_' + _k] = _v
B.KIND_FILL.update({'yard': (232, 222, 196), 'halting': (210, 226, 240), 'terrace': (206, 226, 176), 'heap': (178, 140, 120), 'lift': (60, 60, 60),
                    'core': (120, 120, 130), 'vault': (120, 140, 190), 'station': (120, 150, 110), 'mole': (190, 190, 196), 'water': (170, 214, 240)})


class Ctx(object):
    pass


def load(here, cfg):
    C = Ctx(); C.here = here; C.cfg = cfg; C.out = os.path.join(here, 'floors')
    C.dump = json.loads(subprocess.run(['node', os.path.join(here, 'layout_dump.js')], capture_output=True, text=True, check=True, encoding='utf-8').stdout)
    bad = [c for c in C.dump['checks'] if not c['pass']]
    if bad:
        sys.exit('the layout fails its checks (node %s):\n  ' % cfg['test'] + '\n  '.join(c['name'] + ': ' + c['detail'] for c in bad))
    C.L, C.AREA, C.CENSUS, C.LINE = C.dump['layout'], C.dump['area'], C.dump['census'], C.dump['line']
    C.BOX = {b['id']: b for b in C.dump['boxes']}
    C.DECKS = C.L['decks']; C.S, C.G = C.L['stack'], C.L['ground']; C.ZONE = {z['id']: z for z in C.L['zones']}
    C.PROFILE = {int(float(k)): v for k, v in C.dump['profile'].items()}
    C.PSTEP = sorted(C.PROFILE)[1] - sorted(C.PROFILE)[0]
    for k, v in cfg['holders'].items():
        B.KIND_FILL['by_' + k] = v
    B.KIND_FILL['by_none'] = (214, 214, 214)
    os.makedirs(C.out, exist_ok=True)
    return C


def u(x): return x


def v(z): return -z


def ground(C, z):
    k = int(math.floor(z / C.PSTEP) * C.PSTEP)
    return C.PROFILE.get(k, C.PROFILE[min(C.PROFILE, key=lambda q: abs(q - k))])


def part_room(C, n, p):
    s = p['shape']
    kind = {'yard': 'yard', 'halting': 'halting', 'terrace': 'terrace', 'mole': 'mole', 'station': 'station', 'vault': 'vault'}.get(p['kind'], 'by_' + p['by'])
    note = '%s; %s%s%s' % (p['id'], p.get('key') or p['kind'], ('; %d people' % p['people']) if p['people'] else '', ('; ' + p['note']) if p.get('note') else '')
    return R(n, p['name'], kind, u(s[1]), u(s[2]), v(s[4]), v(s[3]), 1, note)


def deck_room(C, n, d):
    b = C.BOX[d['id']]
    note = '%s; %s%s; %d m2 at the peak%s' % (d['id'], d['state'], ('' if d['by'] == 'none' else ', ' + d['by']), b['floorM2'], ('; %d people' % d['people']) if d['people'] else '')
    return R(n, 'deck %d %s: %s' % (d['k'], d['wing'].upper(), d['use']), 'st_' + d['state'], u(b['x0']), u(b['x1']), v(b['z1']), v(b['z0']), 1, note)


def lift_rooms(C, n0):
    out = []
    for i, lf in enumerate(C.L['lifts']):
        out.append(R(n0 + i, lf['name'] + (' (runs)' if lf.get('runs') else ' (' + lf['state'] + ')'), 'lift' if lf['kind'] == 'car' else 'core',
                     u(lf['x'] - lf['w'] / 2), u(lf['x'] + lf['w'] / 2), v(lf['z'] + lf['d'] / 2), v(lf['z'] - lf['d'] / 2), 1,
                     lf['note'] + ('; car %gx%gx%g m, %d beasts, %d t' % (lf['car']['w'], lf['car']['d'], lf['car']['h'], lf['car']['beasts'], lf['car']['t']) if lf['kind'] == 'car' else '')))
    return out


def ellipse_pts(h, n=40):
    c, s0 = math.cos(h['ry']), math.sin(h['ry'])
    return [(h['x'] + h['rx'] * math.cos(t) * c - h['rz'] * math.sin(t) * s0, h['z'] + h['rx'] * math.cos(t) * s0 + h['rz'] * math.sin(t) * c)
            for t in [2 * math.pi * i / n for i in range(n)]]


def outline(C, k):
    ds = [C.BOX[d['id']] for d in C.DECKS if d['k'] == k]
    return [(ds[0]['x0'], 0)] + sum([[(b['x0'], -b['z1']), (b['x1'], -b['z1'])] for b in ds], []) + [(ds[-1]['x1'], 0)]


def sheet_plan(C, id_, title, sub, rect, rooms, fills=None, lines=None):
    F = dict(id=id_, R=max(rect[1] - rect[0], rect[3] - rect[2]) / 2, rect=rect, title=title, sub=sub, rooms=rooms, fills=fills or [], lines=lines or [],
             axisnote='x along the face ->   the face\'s back up the sheet; the face along the bottom of %s, the top of %s' % (C.cfg['top']['label'], C.cfg['bottom']['label']))
    B.draw_floor(F).save(os.path.join(C.out, id_ + '.png'))
    print('drew', id_, len(rooms), 'rooms')


def layer_sheet(C, id_, k, title, extra=None):
    decks = [d for d in C.DECKS if d['k'] == k]
    rooms = [deck_room(C, i + 1, d) for i, d in enumerate(decks)]
    n = len(rooms) + 1
    for p in C.L['parts']:
        if p.get('deck') and int(p['deck'].split('.')[1]) == k:
            if p.get('shape'):
                rooms.append(part_room(C, n, p))
            else:
                d = C.BOX[p['deck']]
                rooms.append(R(n, p['name'] + ' (on ' + p['deck'] + ')', 'by_' + p['by'], u(d['x0'] + 4), u(d['x0'] + 26), v(min(d['z1'] - 4, 30)), v(4), 1,
                               p['id'] + '; ' + p['key'] + '; ' + p.get('note', '')))
            n += 1
    rooms += lift_rooms(C, n)
    W = max(C.BOX[d['id']]['x1'] for d in decks) + 60
    zmax = max(C.BOX[d['id']]['z1'] for d in decks) + 40
    y = C.S['y0'] + C.S['pitch'] * k
    sub = ('Layer %d, its floor at %d m (%d m over %s); %s. %s Decks coloured by state: lived (%s), sound and empty (grey), sealed (blue-grey), '
           'broken (red-brown: damaged, sheared, pancaked), gone (white). The rock behind the face is grey; the great lifts\' shafts and the face cores in dark grey.'
           % (k, y, y - C.cfg['datum']['level'], C.cfg['datum']['label'], C.ZONE[decks[0]['zone']]['name'], extra or '', C.cfg['people_note']))
    sheet_plan(C, id_, title, sub, [-W, W, v(zmax), 200], rooms, fills=[([(x, -z) for x, z in [(-W, 0), (W, 0), (W, -200), (-W, -200)]], (200, 196, 190), 'the rock')])


def site_sheet(C, title, sub, ext=1500):
    L, G, S = C.L, C.G, C.S
    rooms, n = [], 1
    for p in L['parts']:
        if p.get('shape') and not p.get('in') and p['kind'] in ('lifthall', 'station', 'vault', 'mole', 'yard', 'halting', 'mound', 'gate'):
            rooms.append(part_room(C, n, p)); n += 1
    rooms += lift_rooms(C, n)
    fills = []
    W = C.cfg.get('water')
    if W:
        fills.append(([(x, -z) for x, z in [(-ext, W['quay']), (ext, W['quay']), (ext, ext), (-ext, ext)]], WATER, W['label']))
    for h in L['heaps']:
        fills.append(([(x, -z) for x, z in ellipse_pts(h)], B.KIND_FILL['heap'], h['id']))
    lines = road_lines(C, 4) + [
             ([(-G['dressed'], 0), (G['dressed'], 0)], (0, 0, 0), 6, 'the dressed face'),
             ([(p[0], -p[1]) for p in L['line']['approach']], (40, 110, 40), 5, 'the Line to the station')]
    if W:
        lines.append(([(-G['dressed'], -W['quay']), (G['dressed'], -W['quay'])], (60, 60, 140), 3, 'the quay'))
    for k, col in ((S['n'] - 1, (120, 80, 20)), (0, (60, 60, 60))):
        lines.append((outline(C, k), col, 3, 'layer %d' % k))
    hc = L['line']['helix']
    lines.append(([(hc['c'][0] + hc['r'] * math.cos(t), -(hc['c'][1] + hc['r'] * math.sin(t))) for t in [2 * math.pi * i / 48 for i in range(49)]], (40, 110, 40), 3, 'the helix (r %d m)' % hc['r']))
    if L.get('piers'):
        lines.append(([(p['x'], -p['z']) for p in L['piers']], (90, 90, 120), 2, 'the viaduct\'s stumps'))
    sheet_plan(C, 'S0-site', title, sub, [-ext, ext, -ext, ext], rooms, fills, lines)


def road_lines(C, wgt):
    """Dalab's road as drawn: the cut's path (its switchbacks; layout_dump.js gives it as 'road') or, failing that, every road way's
    record; a road tunnel's adits and its helix in grey (2026-11-22)."""
    L, out = C.L, []
    runs = C.dump.get('road') or [[(p[0], p[1]) for p in w['pts']] for w in L['ways'] if w['kind'] == 'road']
    for r in runs:
        out.append(([(p[0], -p[1]) for p in r], (150, 70, 30), wgt, "Dalab's road"))
    for w in L['ways']:
        if w['kind'] != 'tunnel':
            continue
        tp = w['pts']
        out.append(([(tp[0][0], -tp[0][1]), (tp[1][0], -tp[1][1])], (110, 110, 110), wgt - 1, ''))
        out.append(([(tp[2][0], -tp[2][1]), (tp[3][0], -tp[3][1])], (110, 110, 110), wgt - 1, ''))
        h = w.get('helix')
        if h:
            out.append(([(h['c'][0] + h['r'] * math.cos(t), -(h['c'][1] + h['r'] * math.sin(t))) for t in [2 * math.pi * i / 36 for i in range(37)]],
                        (110, 110, 110), wgt - 1, 'the road tunnel (r %d m, %.1f turns)' % (h['r'], h['turns'])))
    return out


def zone_sheet(C, id_, zone, title, rect, ground_word):
    L, G, S = C.L, C.G, C.S
    groups, order = {}, []
    for p in L['parts']:
        if p['zone'] == zone and p.get('shape') and not p.get('in') and not p.get('rock'):
            g = re.sub(r'_\d+$', '', p['id'])
            if g not in groups:
                groups[g] = []; order.append(g)
            groups[g].append(p)
    rooms, n, outl = [], 1, []
    for g in order:
        ps = groups[g]
        if len(ps) == 1:
            rooms.append(part_room(C, n, ps[0])); n += 1; continue
        x0 = min(p['shape'][1] for p in ps); x1 = max(p['shape'][2] for p in ps); z0 = min(p['shape'][3] for p in ps); z1 = max(p['shape'][4] for p in ps)
        keys = sorted(set(p.get('key') or p['kind'] for p in ps))
        rooms.append(R(n, ps[0]['name'] + ' (%d)' % len(ps), 'by_' + ps[0]['by'], u(x0), u(x1), v(z1), v(z0), 1,
                       '%s_0..%d; %s; %d people' % (g, len(ps) - 1, ', '.join(keys), sum(p['people'] for p in ps)))); n += 1
        for p in ps:
            s = p['shape']; outl.append(([(s[1], -s[3]), (s[2], -s[3]), (s[2], -s[4]), (s[1], -s[4]), (s[1], -s[3])], (60, 50, 40), 2))
    rooms += lift_rooms(C, n)
    fills, lines = [], outl
    if zone == C.cfg['bottom']['zone']:
        W = C.cfg.get('water')
        if W:
            fills.append(([(x, -z) for x, z in [(rect[0], W['quay']), (rect[1], W['quay']), (rect[1], 700), (rect[0], 700)]], WATER, 'the lake'))
        for h in L['heaps']:
            fills.append(([(x, -z) for x, z in ellipse_pts(h)], B.KIND_FILL['heap'], h['id']))
        for k, col in ((0, (60, 60, 60)), (S['n'] // 2, (40, 110, 40)), (S['n'] - 1, (120, 80, 20))):
            lines.append((outline(C, k), col, 2, 'layer %d overhead' % k))
        if L.get('piers'):
            lines.append(([(p['x'], -p['z']) for p in L['piers'][:8]], (90, 90, 120), 3, 'the viaduct\'s stumps'))
    else:
        fills.append(([(x, -z) for x, z in [(rect[0], 0), (rect[1], 0), (rect[1], 60), (rect[0], 60)]], (230, 230, 236), 'the face (the shell\'s crown below the edge)'))
        lines += road_lines(C, 4)
    lines.append(([(rect[0], 0), (rect[1], 0)], (0, 0, 0), 5, 'the face'))
    people = sum(p['people'] for p in L['parts'] if p['zone'] == zone)
    sub = ('%s, %s. %d buildings and yards, %d people in them (%s); buildings are their kit\'s def at its footprint '
           '(the Dalab set: VERN.place; the Fellgang set: TG.fg.draw). Fronts face the edge unless turned.'
           % (C.ZONE[zone]['name'].capitalize(), ground_word, len(rooms) - len(L['lifts']), people, C.cfg['people_note']))
    sheet_plan(C, id_, title, sub, rect, rooms, fills, lines)


def elevation(C):
    """the shell from in front: every deck as its width x its band, coloured by state; the face cores; the lifts' landings"""
    L, G, S, cfg = C.L, C.G, C.S, C.cfg
    top, bot, datum = G[cfg['top']['key']], G[cfg['bottom']['key']], cfg['datum']['level']
    half = max(C.BOX[d['id']]['x1'] for d in C.DECKS) + 120
    sx = sy = min(2400.0 / (2 * half), 1700.0 / (top + 170 - datum))   # one scale both ways: true scale
    W = int(2 * half * sx) + 1020; H = int((top + 120 - (datum - 50)) * sy) + 260
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    f_t = B.font(40, True); f = B.font(20); fs = B.font(16); fb = B.font(20, True)
    ox, base = 60 + half * sx, H - 80
    X = lambda x: ox + x * sx
    Y = lambda y: base - (y - (datum - 50)) * sy
    dr.text((30, 16), cfg['elev_title'], font=f_t, fill=(20, 20, 20))
    dr.text((30, 66), 'Broken decks %.1f %% of the shell\'s floor (%s m2 at the Ancients\' peak, ~%s people then); %d people at %s today.'
            % (C.AREA['brokenShare'] * 100, '{:,}'.format(round(C.AREA['floor'])), '{:,}'.format(C.AREA['peak']), C.CENSUS['total'], cfg['name']), font=f, fill=(70, 70, 70))
    if cfg.get('water'):
        dr.rectangle([0, Y(datum), W, H], fill=WATER)
    else:
        dr.rectangle([0, Y(datum), W, H], fill=(214, 206, 180))
    dr.rectangle([X(-half), Y(top), X(half), Y(bot)], fill=(206, 198, 186), outline=(150, 140, 130))
    dr.rectangle([X(-half), Y(bot), X(half), Y(datum + 1)], fill=(196, 190, 176))
    for d in C.DECKS:
        b = C.BOX[d['id']]
        dr.rectangle([X(b['x0']), Y(b['y1']), X(b['x1']), Y(b['y0'])], fill=STATE_FILL[d['state']], outline=(90, 90, 90))
        if d['state'] in ('sheared', 'pancaked', 'damaged'):
            for q in range(int(X(b['x0'])), int(X(b['x1'])), 10):
                dr.line([(q, Y(b['y0'])), (min(q + 8, X(b['x1'])), Y(b['y1']))], fill=(120, 60, 50), width=1)
    zx = half - 40
    for z in L['zones']:
        if not z['k']:
            continue
        y0, y1 = S['y0'] + S['pitch'] * z['k'][0] - S['slab'], S['y0'] + S['pitch'] * z['k'][1] + S['pitch'] - S['slab']
        dr.line([(X(zx), Y(y0)), (X(zx), Y(y1))], fill=(0, 0, 0), width=3)
        dr.text((X(zx) + 10, Y(y1) + 4), '%s %s (k %d-%d), %d people' % (z['id'], z['name'], z['k'][0], z['k'][1], C.CENSUS['zones'][z['id']]), font=fb, fill=(0, 0, 0))
    for lf in L['lifts']:
        col = (0, 0, 0) if lf['kind'] == 'car' else (90, 90, 140)
        dr.line([(X(lf['x']), Y(lf['y0'])), (X(lf['x']), Y(lf['y1']))], fill=col, width=4 if lf['kind'] == 'car' else 2)
        if lf.get('runs'):
            dr.line([(X(lf['x']) + 4, Y(lf['runs'][0])), (X(lf['x']) + 4, Y(lf['runs'][1]))], fill=(0, 150, 0), width=3)
        for s in lf['stops']:
            y = top if s == cfg['top'].get('stop', cfg['top']['key']) else bot if s == cfg['bottom'].get('stop', cfg['bottom']['key']) else C.BOX[s]['floor']
            dr.ellipse([X(lf['x']) - 6, Y(y) - 6, X(lf['x']) + 6, Y(y) + 6], fill=(0, 150, 0))
        dr.text((X(lf['x']) - 30, Y(lf['y1']) - 22), lf['id'], font=fs, fill=col)
    dr.text((X(-half) + 10, Y(top) - 26), cfg['top']['word'] % top, font=f, fill=(0, 0, 0))
    dr.text((X(-half) + 10, Y(bot) + 4), cfg['bottom']['word'] % bot, font=f, fill=(0, 0, 0))
    dr.text((X(-half) + 10, Y(datum) + 8), cfg['datum']['label'] + ' (%d m)' % datum, font=f, fill=(0, 60, 120))
    lx, ly = X(zx), Y(top + 60)
    for i, (k, c) in enumerate(STATE_FILL.items()):
        dr.rectangle([lx + 200 * (i % 5), ly + 26 * (i // 5) - 60, lx + 200 * (i % 5) + 18, ly + 26 * (i // 5) - 42], fill=c, outline=(0, 0, 0))
        dr.text((lx + 200 * (i % 5) + 24, ly + 26 * (i // 5) - 62), k, font=fs, fill=(0, 0, 0))
    stops = sorted(set(s for lf in L['lifts'] for s in lf['stops'] if s.startswith('d.')), key=lambda s: int(s.split('.')[1]))
    dr.text((30, H - 50), 'Green line: a lift that runs; green dots: its landings (%s, %s and the decks at k %s). Black: the great lifts\' shafts (in the rock behind '
            'the face, shown in front); blue: the face cores.' % (cfg['bottom']['label'], cfg['top']['label'], ', '.join(sorted(set(s.split('.')[1] for s in stops), key=int))),
            font=fs, fill=(60, 60, 60))
    img.save(os.path.join(C.out, 'elevation.png'))
    print('drew elevation')


def section(C, x=0):
    """through the cliff at x: the ground, every layer's reach and band by state, the shafts, what lies in the rock, the Line"""
    L, G, S, cfg = C.L, C.G, C.S, C.cfg
    z0, z1 = cfg['section_z']
    top, datum = G[cfg['top']['key']], cfg['datum']['level']
    lo = min(datum, min(ground(C, z) for z in range(z0, z1, C.PSTEP))) - 60
    hi = max(top, max(ground(C, z) for z in range(z0, z1, C.PSTEP))) + 120
    s = min(1900.0 / (z1 - z0), 1700.0 / (hi - lo)); W, H = int((z1 - z0) * s) + 100, int((hi - lo) * s) + 200
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    f_t = B.font(40, True); f = B.font(20); fs = B.font(16)
    ox, base = 50 - z0 * s, H - 80
    X = lambda z: ox + z * s
    Y = lambda y: base - (y - lo) * s
    dr.text((30, 16), 'Section through the cliff at x %d (true scale): the decks, the great lifts, the Line\'s station' % x, font=f_t, fill=(20, 20, 20))
    if cfg.get('water'):
        dr.rectangle([X(cfg['water']['quay']), Y(datum), W, H], fill=WATER)
    pts = [(X(zi), Y(ground(C, zi))) for zi in range(z0, z1, C.PSTEP)]
    dr.polygon(pts + [(X(z1), H), (X(z0), H)], fill=(206, 198, 186), outline=(120, 110, 100))
    for d in C.DECKS:
        b = C.BOX[d['id']]
        if not (b['x0'] <= x <= b['x1']):
            continue
        reach = b['z1'] if d['state'] not in ('gone', 'sheared') else (4 if d['state'] == 'gone' else 12)
        dr.rectangle([X(-S['root']), Y(b['floor']), X(reach), Y(b['y0'])], fill=(150, 150, 150), outline=(80, 80, 80))
        if d['state'] != 'gone':
            dr.rectangle([X(0), Y(b['floor'] + S['storey'] * S['storeys']), X(max(1, reach - S['gallery'])), Y(b['floor'])], fill=STATE_FILL[d['state']], outline=(110, 110, 110))
        if d['state'] in ('gone', 'sheared'):
            dr.rectangle([X(reach), Y(b['floor']), X(b['z1']), Y(b['y0'])], outline=(200, 120, 100), width=1)
    cars = [lf for lf in L['lifts'] if lf['kind'] == 'car']
    if cars:
        lf = cars[0]
        dr.rectangle([X(lf['z'] - lf['d'] / 2), Y(lf['y1']), X(lf['z'] + lf['d'] / 2), Y(lf['y0'])], outline=(0, 0, 0), width=2)
        lbl = 'the great lifts\' shafts (x %s), %d m; the stairs in their cores' % (', '.join('%d' % c['x'] for c in cars), lf['y1'] - lf['y0'])
        dr.text((X(lf['z'] - lf['d'] / 2) - 8 - dr.textlength(lbl, font=fs), Y((lf['y0'] + lf['y1']) / 2)), lbl, font=fs, fill=(0, 0, 0))
    for p in L['parts']:
        if p.get('rock'):
            sh = p['shape']
            dr.rectangle([X(sh[3]), Y(p['y'] + p['h']), X(sh[4]), Y(p['y'])], fill=B.KIND_FILL.get(p['kind'], (150, 150, 150)), outline=(0, 0, 0))
            lbl = p['name'][:60]; dr.text((X(sh[3]) - 8 - dr.textlength(lbl, font=fs), Y(p['y'] + p['h']) - 22), lbl, font=fs, fill=(0, 0, 0))
    ap = L['line']['approach']
    dr.line([(X(q[1]), Y(q[2])) for q in ap], fill=(40, 110, 40), width=5)
    dr.text((X(ap[0][1]) - 10, Y(ap[0][2]) - 26), 'the Line, from the helix (%d m) to the station (%d m)' % (ap[0][2], ap[-1][2]), font=fs, fill=(40, 110, 40))
    for z in L['zones']:
        if z['k']:
            ym = S['y0'] + S['pitch'] * (z['k'][0] + z['k'][1]) / 2.0
            dr.text((X(C.BOX['d.%d.%s' % (z['k'][1], S['wings'][len(S['wings']) // 2]['id'])]['z1']) + 40, Y(ym) - 10), '%s %s (k %d-%d)' % (z['id'], z['name'], z['k'][0], z['k'][1]), font=f, fill=(0, 0, 0))
    dr.text((X(z0) + 20, Y(top) - 28), cfg['top']['label'] + ' (%d m)' % top, font=f, fill=(0, 0, 0))
    dr.text((30, H - 50), '%s to the left. Grey: the slabs (their roots %d m into the rock); colour: the rooms by state; red outline: the plan\'s reach where a deck is sheared or gone.'
            % (cfg['inward'], S['root']), font=fs, fill=(60, 60, 60))
    img.save(os.path.join(C.out, 'section.png'))
    print('drew section')


def areas(C, intro):
    L, S, AREA, CENSUS, BOX, cfg = C.L, C.S, C.AREA, C.CENSUS, C.BOX, C.cfg
    rows = AREA['rows']
    out = ['# %s: the area and the people' % cfg['name'], '',
           'Generated by `%s` from the layout (`%s.area`, `%s.census`) on `kits/ancients/cliff/cliff_blueprint.py`. Do not edit; change the layout and rerun.'
           % (cfg['script'], cfg['rules'], cfg['rules']), '',
           '**The shell**: %d layers (%d m to %d m), %d decks; **%s m2** of floor at the Ancients\' peak (rooms on %d %% of each deck\'s footprint, %d storeys), '
           'about **%s people** then (homes on half the floor at 35 m2 a head, Span\'s rule). **Broken: %.1f %%** of the floor (%s); lived in today: %.1f %%.'
           % (S['n'], S['y0'], S['y0'] + S['pitch'] * (S['n'] - 1), len(C.DECKS), '{:,}'.format(round(AREA['floor'])), S['cover'] * 100, S['storeys'],
              '{:,}'.format(AREA['peak']), AREA['brokenShare'] * 100, intro, AREA['livedShare'] * 100), '',
           '| Zone | Layers | Decks | Floor (m2) | Broken (m2) | Lived (m2) | People on the decks |', '|---|---|---|---|---|---|---|']
    for z in L['zones']:
        if not z['k']:
            continue
        r = rows[z['id']]
        out.append('| %s %s | %d-%d | %d | %s | %s | %s | %d |' % (z['id'], z['name'], z['k'][0], z['k'][1], r['decks'], '{:,}'.format(round(r['floor'])),
                                                                  '{:,}'.format(round(r['broken'])), '{:,}'.format(round(r['lived'])), r['people']))
    out += ['', '**The %s** (`%s.census`; %s): %d people.' % ('{:,}'.format(L['census']['total']), cfg['rules'], cfg['census_ref'], CENSUS['total']), '', '| Zone | People |', '|---|---|']
    for z in L['zones']:
        out.append('| %s %s | %d |' % (z['id'], z['name'], CENSUS['zones'].get(z['id'], 0)))
    out += ['', '| People | Count |', '|---|---|'] + ['| %s | %d |' % (k, n) for k, n in sorted(CENSUS['by'].items())]
    out += ['', '## The decks by state', '', '| State | Decks | Floor (m2) |', '|---|---|---|']
    for st in STATE_FILL:
        ds = [d for d in C.DECKS if d['state'] == st]
        out.append('| %s | %d | %s |' % (st, len(ds), '{:,}'.format(round(sum(BOX[d['id']]['floorM2'] for d in ds)))))
    out += ['', '## The lived decks', '', '| Deck | Holder | Use | Floor (m2) | People | m2 a head |', '|---|---|---|---|---|---|']
    for d in C.DECKS:
        if d['people']:
            out.append('| %s | %s | %s | %s | %d | %d |' % (d['id'], d['by'], d['use'], '{:,}'.format(round(BOX[d['id']]['floorM2'])), d['people'], BOX[d['id']]['floorM2'] / d['people']))
    out += ['', '## The parts with people', '', '| Part | Zone | Holder | Key | People |', '|---|---|---|---|---|']
    for p in L['parts']:
        if p['people']:
            out.append('| %s | %s | %s | %s | %d |' % (p['id'], p['zone'], p['by'], p.get('key') or p['kind'], p['people']))
    with open(os.path.join(C.here, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(out) + '\n')
    print('wrote AREAS.md')
