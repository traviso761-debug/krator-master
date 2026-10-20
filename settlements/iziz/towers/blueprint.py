#!/usr/bin/env python3
"""The skyscrapers' blueprints: one sheet per tower (floors/<key>.png) from the plan the page builds them with.

    node towers/plan_dump.js [scale]      # runs src/78s-iziz-towers-plan.js with the kit's noise -> towers/plans.json
    python3 towers/blueprint.py           # -> towers/floors/skyA.png ... skyF.png

Each sheet: the section (the lining's half-width up the tower, every storey, the slum band and the junk band, the stair
shaft up to the body, the repaired and the ruined heights side by side), then four plans of the repaired tower: the first
slum storey, the twelfth, the first junk storey and one near the top. Walls: black whole, red stub (broken, a share of its
height kept), red dotted (gone). The stair core is hatched, its door marked; the corridor is grey.
"""
import json, math, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'


def font(size, bold=False):
    for name in [('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]:
        try:
            return ImageFont.truetype(FONT_DIR + name, size)
        except Exception:
            pass
    return ImageFont.load_default()


LOBBY, RUBBLE = (226, 214, 160), (178, 150, 128)
FILL = {}
INK, PAPER, RED, GREY, SLUM, JUNK, CORE = (30, 34, 44), (246, 242, 232), (196, 40, 40), (214, 210, 200), (238, 200, 150), (176, 186, 196), (120, 120, 130)
KINDFILL = {'lobby': LOBBY, 'slum': SLUM, 'junk': JUNK, 'rubble': RUBBLE}


def rot(p, r):
    c, s = math.cos(r), math.sin(r)
    return (p[0] * c - p[1] * s, p[0] * s + p[1] * c)


def draw_plan(dr, S, box, title, f, fs):
    """One storey's plan; S a storey or a list of them (a building of several masses: all its masses' storeys in one view)."""
    x0, y0, w, h = box
    Ss = S if isinstance(S, list) else [S]
    pts = [p for T in Ss for p in T['outline']]
    ax, bx = min(p[0] for p in pts), max(p[0] for p in pts)
    az, bz = min(p[1] for p in pts), max(p[1] for p in pts)
    mx, mz = (ax + bx) / 2, (az + bz) / 2
    ext = max(bx - ax, bz - az) / 2 + 1.5
    sc = min(w, h - 40) / (2 * ext)
    cx, cy = x0 + w / 2, y0 + 40 + (h - 40) / 2
    X = lambda p: (cx + (p[0] - mx) * sc, cy - (p[1] - mz) * sc)   # +z up the sheet
    dr.text((x0, y0), title, fill=INK, font=f)
    n = 0
    for S in Ss:
        n = _plan_one(dr, S, X, sc, fs, n)
    # the scale bar: 5 m (1 m on a small building)
    bar = 5 if ext > 6 else 1
    dr.line([(x0 + 10, y0 + h - 10), (x0 + 10 + bar * sc, y0 + h - 10)], fill=INK, width=3)
    dr.text((x0 + 14 + bar * sc, y0 + h - 22), '%d m' % bar, fill=INK, font=fs)


def _plan_one(dr, S, X, sc, fs, n0):
    dr.polygon([X(p) for p in S.get('floorOutline') or S['outline']], fill=(255, 252, 245), outline=INK)
    if S.get('floorOutline'):
        dr.polygon([X(p) for p in S['outline']], outline=(150, 140, 120))
    for c in S['cells']:
        dr.polygon([X(p) for p in c['poly']], fill=KINDFILL[S['kind']], outline=(150, 140, 120) if c.get('open') else None)
    r = S.get('rot', 0)
    at = S.get('at') or [0, 0]
    def rect(R, fill, outline=None, rr=r):
        q = [rot(p, rr) for p in [(R[0], R[2]), (R[1], R[2]), (R[1], R[3]), (R[0], R[3])]]
        dr.polygon([X((p[0] + at[0], p[1] + at[1])) for p in q], fill=fill, outline=outline)
    for q in S.get('corridorPolys') or []:
        dr.polygon([X(v) for v in q], fill=GREY)
    if S.get('core'):
        rect(S['core'], CORE, INK)
    for H in S.get('holes') or []:   # each well a stair rises through from below (C's sky lobby: the three legs')
        q = [rot(p, H['rot']) for p in [(H['r'][0], H['r'][2]), (H['r'][1], H['r'][2]), (H['r'][1], H['r'][3]), (H['r'][0], H['r'][3])]]
        dr.polygon([X((p[0] + H['at'][0], p[1] + H['at'][1])) for p in q], fill=(90, 90, 100), outline=RED)
    E = S.get('entrance')
    if E:
        p = X(E['at'])
        dr.rectangle([p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9], fill=(40, 120, 60), outline=INK)
        dr.text((p[0] + 12, p[1] - 8), 'street door', fill=INK, font=fs)
    for wl in S['walls']:
        a, b = X(wl['a']), X(wl['b'])
        if wl['kind'] == 'front':   # the door gap at the cell's door end
            dx, dy = b[0] - a[0], b[1] - a[1]
            L = math.hypot(dx, dy) or 1
            g = .45 * sc / L
            if wl.get('door') == 'b':
                b = (b[0] - dx * g, b[1] - dy * g)
            else:
                a = (a[0] + dx * g, a[1] + dy * g)
        br = wl['broken']
        if br == 0:
            dr.line([a, b], fill=INK, width=3 if wl['kind'] == 'core' else 2)
        elif br > 0:
            m = (a[0] + (b[0] - a[0]) * br, a[1] + (b[1] - a[1]) * br)
            dr.line([a, m], fill=RED, width=3)
            _dots(dr, m, b, RED)
        else:
            _dots(dr, a, b, RED)
    for i, c in enumerate(S['cells']):
        p = X(c['door'])
        dr.ellipse([p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2], fill=(40, 120, 60))
        q = c['poly']
        mx, mz = sum(v[0] for v in q) / len(q), sum(v[1] for v in q) / len(q)
        t = X((mx, mz))
        dr.text((t[0] - 6, t[1] - 6), str(n0 + i + 1), fill=INK, font=fs)
    return n0 + len(S['cells'])


def _gone(wl):
    return wl['broken'] == 0 and wl.get('gone')


def _dots(dr, a, b, col):
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    n = max(1, int(L / 6))
    for i in range(n):
        t = i / n
        p = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        dr.ellipse([p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1], fill=col)


def draw_section(dr, P3, P1, P2, box, f, fs):
    x0, y0, w, h = box
    dr.text((x0, y0), 'Sections: repaired, ruined, toppled (its stump)', fill=INK, font=f)
    top = max(P3['top'], P1['top']) + 6
    sy = (h - 60) / top
    base = y0 + h - 20
    half = w / 3
    for P, ox in [(P3, x0 + half * .5), (P1, x0 + half * 1.5), (P2, x0 + half * 2.5)]:
        ext = max([max(abs(p[0]) for p in S['outline']) for S in P['storeys']] + [abs(S['at'][0]) + S['r'] for sh in P.get('shafts') or [] for S in sh] + [1])
        sx = (half * .42) / max(ext, 1)
        for S in P['storeys']:
            e = max(abs(p[0]) for p in S['outline'])
            yb, yt = base - S['y'] * sy, base - (S['y'] + S['h']) * sy
            dr.rectangle([ox - e * sx, yt, ox + e * sx, yb], fill=KINDFILL[S['kind']], outline=INK)
            dr.rectangle([ox - 1.6 * sx, yt, ox + 1.6 * sx, yb], fill=CORE)
        for sh in P.get('shafts') or []:
            for S in sh:
                yb, yt = base - S['y'] * sy, base - (S['y'] + S['h']) * sy
                ax = ox + S['at'][0] * sx
                dr.rectangle([ax - S['r'] * sx, yt, ax + S['r'] * sx, yb], fill=LOBBY if S.get('lobby') else None, outline=INK)
                dr.rectangle([ax - 1.6 * sx, yt, ax + 1.6 * sx, yb], fill=CORE)
        dr.line([(ox - half * .45, base), (ox + half * .45, base)], fill=INK, width=2)
        n = len(P['storeys'])
        dr.text((ox - 50, base + 2), '%d storeys\n%d rooms' % (n, sum(len(S['cells']) for S in P['storeys'])), fill=INK, font=fs)
    for m in range(0, int(top) + 1, 20):
        yy = base - m * sy
        dr.line([(x0, yy), (x0 + 8, yy)], fill=INK)
        dr.text((x0 + 10, yy - 7), '%d m' % m, fill=INK, font=fs)


def sheet(key, P3, P1, P2):
    W, H = 2400, 1500
    im = Image.new('RGB', (W, H), PAPER)
    dr = ImageDraw.Draw(im)
    f, fb, fs = font(22), font(34, True), font(15)
    dr.text((30, 20), '%s  -  interiors blueprint (scale %.2f in the city)' % (P3['name'], P3['s']), fill=INK, font=fb)
    dr.text((30, 64), 'A lobby at the foot (C: a sky lobby the three legs\' stairs climb to). Then 12 storeys of slum (cells off a corridor round the stair core), then junk and scrap,' + chr(10) +
            'the Ancients\' partitions broken by the kit\'s hole rule. Ruined and toppled towers: every upright storey rubble.', fill=INK, font=f)
    draw_section(dr, P3, P1, P2, (30, 130, 620, 1340), f, fs)
    St = P3['storeys']
    first = lambda P, k: next((S for S in P['storeys'] if S['kind'] == k), None)
    lob = first(P3, 'lobby')
    if lob is None:   # A, B: the lobby is the shaft's foot, a ring round the core in the base cone or core
        f0 = P3['shafts'][0][0]
        n = 32
        ring = [[f0['r'] * math.cos(i / n * 2 * math.pi), f0['r'] * math.sin(i / n * 2 * math.pi)] for i in range(n)]
        lob = dict(kind='lobby', y=f0['y'], outline=ring, cells=f0.get('cells', []), walls=[], core=P3['stairs']['core'], corridorPolys=[], holes=[], entrance=f0.get('entrance'))
    ruined = next((S for S in P1['storeys'] if S['kind'] == 'rubble'), None) or St[-1]
    picks = [(lob, 'Lobby'), (first(P3, 'slum'), 'First slum storey'), (first(P3, 'junk') or St[-1], 'First junk storey'), (ruined, 'Ruined tower: a rubble storey')]
    for i, (S, t) in enumerate(picks):
        bx = (680 + (i % 2) * 860, 110 + (i // 2) * 690, 840, 670)
        k = St.index(S) if S in St else -1
        draw_plan(dr, S, bx, '%s  -  floor %.1f m, %d rooms, %d walls broken' % (t, S['y'], len(S['cells']), sum(1 for w in S['walls'] if w['broken'] != 0)), f, fs)
    # the legend
    lx, ly = 30, H - 30
    for col, txt in [(LOBBY, 'lobby'), (SLUM, 'slum cell'), (JUNK, 'junk cell'), (RUBBLE, 'rubble'), (GREY, 'corridor'), (CORE, 'stair core'), ((90, 90, 100), 'stairwell')]:
        dr.rectangle([lx, ly - 14, lx + 22, ly + 4], fill=col, outline=INK)
        dr.text((lx + 28, ly - 14), txt, fill=INK, font=fs)
        lx += 140
    dr.line([(lx, ly - 5), (lx + 30, ly - 5)], fill=INK, width=2); dr.text((lx + 36, ly - 14), 'wall', fill=INK, font=fs); lx += 110
    dr.line([(lx, ly - 5), (lx + 15, ly - 5)], fill=RED, width=3); _dots(dr, (lx + 15, ly - 5), (lx + 30, ly - 5), RED)
    dr.text((lx + 36, ly - 14), 'broken wall (stub / gone)', fill=INK, font=fs); lx += 260
    dr.ellipse([lx, ly - 9, lx + 8, ly - 1], fill=(40, 120, 60)); dr.text((lx + 14, ly - 14), 'cell door', fill=INK, font=fs)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, key + '.png'))


# ---- the other Ancient buildings (src/78w-iziz-ancients-plan.js; plans-ancients.json)
ANC = ['aptsA', 'aptsC', 'honey', 'houseD', 'houseE', 'houseF', 'fuel', 't_setback', 't_setback2', 't_pent', 't_hept', 't_wedge', 't_barrel', 't_midrise',
       'wave', 'bridge', 'fins', 'adlab', 'flat', 'hotel', 'cultural', 'aptsC2']


def draw_section_anc(dr, P3, P1, box, f, fs):
    """The building in elevation (its masses' storeys over their x extent), reclaimed and ruined side by side."""
    x0, y0, w, h = box
    dr.text((x0, y0), 'Sections (along x): reclaimed, ruined', fill=INK, font=f)
    Ps = [P for P in (P3, P1) if P]
    allS = [S for P in Ps for M in P['masses'] for S in M['plan']['storeys']] + \
           [st for P in Ps for M in P['masses'] for sh in M['plan']['shafts'] for st in sh]
    top = max(S['y'] + S['h'] for S in allS) + 2
    xs = [p[0] for P in Ps for M in P['masses'] for S in M['plan']['storeys'] for p in S['outline']]
    ax, bx = min(xs), max(xs)
    mid = (ax + bx) / 2
    half = w / 2
    sy = min((h - 70) / top, (half * .9) / max(1, bx - ax))
    sx = sy
    base = y0 + h - 30
    for P, ox in [(P3, x0 + half * .5), (P1, x0 + half * 1.5)]:
        if not P:
            continue
        for M in P['masses']:
            for S in M['plan']['storeys']:
                e0, e1 = min(p[0] for p in S['outline']), max(p[0] for p in S['outline'])
                yb, yt = base - S['y'] * sy, base - (S['y'] + S['h']) * sy
                dr.rectangle([ox + (e0 - mid) * sx, yt, ox + (e1 - mid) * sx, yb], fill=KINDFILL[S['kind']], outline=INK)
                if S.get('core'):
                    c = S.get('at') or [0, 0]
                    dr.rectangle([ox + (c[0] - .8 - mid) * sx, yt, ox + (c[0] + .8 - mid) * sx, yb], fill=CORE)
            for sh in M['plan']['shafts']:
                for st in sh:
                    yb, yt = base - st['y'] * sy, base - (st['y'] + st['h']) * sy
                    ax2 = ox + (st['at'][0] - mid) * sx
                    dr.rectangle([ax2 - 1.6 * sx, yt, ax2 + 1.6 * sx, yb], fill=CORE, outline=INK)
        dr.line([(ox - half * .45, base), (ox + half * .45, base)], fill=INK, width=2)
        n = sum(len(M['plan']['storeys']) for M in P['masses'])
        rooms = sum(len(S['cells']) for M in P['masses'] for S in M['plan']['storeys'])
        dr.text((ox - 90, base + 4), '%s: %d storeys, %d rooms' % ('reclaimed' if P['d'] == 3 else 'ruined', n, rooms), fill=INK, font=fs)
    step = 2 if top < 15 else 5 if top < 40 else 10 if top < 120 else 20
    for m in range(0, int(top) + 1, step):
        yy = base - m * sy
        dr.line([(x0, yy), (x0 + 8, yy)], fill=INK)
        dr.text((x0 + 10, yy - 7), '%d m' % m, fill=INK, font=fs)


def storeys_at(P, pick):
    """Each mass's storey chosen by pick(storeys) -> index or None: the list of them (one plan view)."""
    out = []
    for M in P['masses']:
        St = M['plan']['storeys']
        i = pick(St)
        if i is not None and 0 <= i < len(St):
            out.append(St[i])
    return out


def first_kind(k, after=0):
    def pick(St):
        ix = [i for i, S in enumerate(St) if S['kind'] == k]
        return ix[after] if len(ix) > after else None
    return pick


def sheet_anc(key, P3, P1):
    W, H = 2400, 1500
    im = Image.new('RGB', (W, H), PAPER)
    dr = ImageDraw.Draw(im)
    f, fb, fs = font(22), font(34, True), font(15)
    P = P3 or P1
    dr.text((30, 20), '%s  -  interiors blueprint (scale %.3f, as the city places it)' % (P['name'], P['s']), fill=INK, font=fb)
    dr.text((30, 64), 'A lobby at the foot; a reclaimed building slum cells (junk above the 12th storey), a ruined one rubble rooms; partitions broken by' + chr(10) +
            "the kit's hole rule (red), none in fallen parts. Storeys on the building's own window rhythm (the houses: their own floors).", fill=INK, font=f)
    draw_section_anc(dr, P3, P1, (30, 130, 620, 1340), f, fs)
    picks = []
    if P3:
        lob = storeys_at(P3, first_kind('lobby'))
        if lob:
            picks.append((lob, 'Lobby'))
        sl = storeys_at(P3, first_kind('slum'))
        if sl:
            picks.append((sl, 'First slum storey'))
        jk = storeys_at(P3, first_kind('junk'))
        if jk:
            picks.append((jk, 'First junk storey'))
        elif storeys_at(P3, first_kind('slum', 1)):
            picks.append((storeys_at(P3, first_kind('slum', 1)), 'Second slum storey'))
    if P1:
        rb = storeys_at(P1, first_kind('rubble'))
        if rb:
            picks.append((rb, 'Ruined: a rubble storey'))
    for i, (Ss, t) in enumerate(picks[:4]):
        bx = (680 + (i % 2) * 860, 110 + (i // 2) * 690, 840, 670)
        draw_plan(dr, Ss, bx, '%s  -  floor %.1f m, %d rooms, %d walls broken' % (t, Ss[0]['y'], sum(len(S['cells']) for S in Ss), sum(1 for S in Ss for w in S['walls'] if w['broken'] != 0)), f, fs)
    lx, ly = 30, H - 30
    for col, txt in [(LOBBY, 'lobby / hall'), (SLUM, 'slum cell'), (JUNK, 'junk cell'), (RUBBLE, 'rubble'), (GREY, 'corridor'), (CORE, 'stair core'), ((90, 90, 100), 'stairwell')]:
        dr.rectangle([lx, ly - 14, lx + 22, ly + 4], fill=col, outline=INK)
        dr.text((lx + 28, ly - 14), txt, fill=INK, font=fs)
        lx += 150
    dr.line([(lx, ly - 5), (lx + 15, ly - 5)], fill=RED, width=3)
    _dots(dr, (lx + 15, ly - 5), (lx + 30, ly - 5), RED)
    dr.text((lx + 36, ly - 14), 'broken wall (stub / gone)', fill=INK, font=fs)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, key + '.png'))


def main():
    with open(os.path.join(HERE, 'plans.json'), encoding='utf-8') as fh:
        plans = json.load(fh)
    for key in ['skyA', 'skyB', 'skyC', 'skyD', 'skyE', 'skyF']:
        sheet(key, plans[key + '_d3'], plans[key + '_d1'], plans[key + '_d2'])
        print('wrote floors/%s.png' % key)
    pa = os.path.join(HERE, 'plans-ancients.json')
    if os.path.exists(pa):
        with open(pa, encoding='utf-8') as fh:
            anc = json.load(fh)
        for key in ANC:
            P3, P1 = anc.get(key + '_d3'), anc.get(key + '_d1')
            if P3 or P1:
                sheet_anc(key, P3, P1)
                print('wrote floors/%s.png' % key)


if __name__ == '__main__':
    main()
