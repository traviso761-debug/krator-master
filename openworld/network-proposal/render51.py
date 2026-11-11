"""Draw the proposed network (net51.json) over the 5.1 relief. python render51.py <scratchpad> <relief t.jpg> <out.jpg>"""
import sys, json, math
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
SP, TJ, OUT = sys.argv[1:4]
d = json.load(open(SP + '/net51.json', encoding='utf8'))
K = 2   # supersample
t = Image.open(TJ).convert('RGB'); W0, H0 = t.size
t = ImageEnhance.Brightness(ImageEnhance.Color(t).enhance(0.55)).enhance(0.62).resize((W0 * K, H0 * K), Image.LANCZOS)
dr = ImageDraw.Draw(t)
def F(sz):
    for f in ('seguisb.ttf', 'arialbd.ttf', 'arial.ttf'):
        try: return ImageFont.truetype(f, sz * K)
        except Exception: pass
    return ImageFont.load_default()
UP = {'kept': (70, 200, 105), 'partly': (230, 196, 70), 'lapsed': (236, 140, 52), 'decayed': (214, 72, 58)}
TUN, WAT, VIA = (186, 140, 255), (110, 196, 242), (150, 230, 235)
def P(p): return (p[0] * K, p[1] * K)
def dashed(pts, col, w, on=10, off=7):
    acc = 0.0; draw = True
    for a, b in zip(pts, pts[1:]):
        L = math.dist(a, b); s = 0.0
        while s < L:
            seg = min((on if draw else off) * K - acc, L - s)
            if draw:
                p0 = (a[0] + (b[0] - a[0]) * s / L, a[1] + (b[1] - a[1]) * s / L); s1 = s + seg
                p1 = (a[0] + (b[0] - a[0]) * s1 / L, a[1] + (b[1] - a[1]) * s1 / L)
                dr.line([p0, p1], fill=col, width=int(w * K))
            s += seg; acc += seg
            if acc >= (on if draw else off) * K - 1e-6: acc = 0.0; draw = not draw
def runs(r):
    pts = r['px']; fm = r['form']; up = r['up']; i = 0
    while i < len(pts) - 1:
        j = i; key = (fm[i], up[i])
        while j < len(pts) - 1 and (fm[j], up[j]) == key: j += 1
        yield [P(p) for p in pts[i:j + 1]], fm[i], up[i]
        i = j
order = ['extension', 'izani', 'trunk', 'possible', 'branch', 'line']
for cls in order:
    for r in d['routes']:
        if r['class'] != cls: continue
        allp = [P(p) for p in r['px']]
        if cls == 'extension':
            dashed(allp, (12, 14, 16), 5.5, 12, 8); dashed(allp, (225, 228, 232), 3, 12, 8); continue
        if cls == 'izani':
            dr.line(allp, fill=(12, 14, 16), width=5 * K); dr.line(allp, fill=(236, 96, 214), width=int(2.4 * K)); continue
        if cls == 'possible':
            dr.line(allp, fill=(12, 14, 16), width=8 * K); dashed(allp, (255, 214, 120), 4.5, 14, 8); continue
        w = 6.5 if cls in ('line', 'branch') else 4.2
        dr.line(allp, fill=(10, 12, 14), width=int((w + 3.2) * K), joint='curve')
        for seg, fm, up in runs(r):
            if fm == 'tunnel':
                if cls in ('line', 'branch'): dr.line(seg, fill=(245, 245, 250), width=int(w * K))
                dashed(seg, TUN, w * (0.6 if cls in ('line', 'branch') else 1), 9, 5)
            elif fm == 'causeway': dr.line(seg, fill=WAT, width=int(w * K))
            elif fm == 'viaduct': dr.line(seg, fill=VIA, width=int(w * K))
            else: dr.line(seg, fill=(245, 245, 250) if cls in ('line', 'branch') else UP[up], width=int(w * K), joint='curve')
        if cls in ('line', 'branch'):
            for seg, fm, up in runs(r):
                if fm != 'tunnel': dr.line(seg, fill=UP[up], width=int(2.2 * K))
f12, f14, f22, f30 = F(12), F(14), F(22), F(30)
for n in d['nodes']:
    x, y = P(n['px'])
    if n['kind'] == 'dock':
        r = 7 * K; dr.rectangle([x - r, y - r, x + r, y + r], fill=WAT, outline=(10, 12, 14), width=3 * K)
    elif n['kind'] == 'tbd':
        r = 10 * K; dr.polygon([(x, y - r), (x + r, y), (x, y + r), (x - r, y)], fill=(255, 214, 120), outline=(10, 12, 14), width=3 * K)
    else:
        r = (7 if ('arcology' in n['type'] or n['type'] == 'city') else 5) * K
        dr.ellipse([x - r, y - r, x + r, y + r], fill=(244, 242, 234), outline=(10, 12, 14), width=3 * K)
    dr.text((x + 11 * K, y - 9 * K), n['name'], font=f14, fill=(244, 242, 234), stroke_width=3 * K, stroke_fill=(10, 12, 14))
for nm, p in d['extra'].items():
    x, y = P(p); r = 5 * K
    dr.polygon([(x, y - r), (x + r, y), (x, y + r), (x - r, y)], fill=(186, 140, 255), outline=(10, 12, 14), width=2 * K)
# legend
leg = [('The Rift line, the Inner Wall and Stair lines: centre = keeper', 'line'), ('Trunk, coloured by keeper', 'trunk'), ('Kept (Iziz, the State, Voth, Republic, Tungangs)', UP['kept']),
       ('Partly kept (Yuni, Xanadu)', UP['partly']), ('Lapsed since the Empire broke', UP['lapsed']), ('Badly decayed', UP['decayed']), ('Tunnel (none open over 8 km)', 'tun'),
       ('Causeway / viaduct', 'wat'), ('Possible: the line on to Stair and the Bowl', 'pos'), ('Izani road to a fort or port (not Ancient)', 'iz'), ('Extension, lore to come', 'ext')]
x0, y0 = (W0 - 540) * K, 60 * K
dr.rectangle([x0, y0, x0 + 520 * K, y0 + (30 * len(leg) + 70) * K], fill=(14, 17, 16), outline=(70, 80, 76), width=2 * K)
dr.text((x0 + 14 * K, y0 + 12 * K), 'The proposed Ancient network, scale model 5.1', font=f22, fill=(244, 242, 234))
for k, (lab, s) in enumerate(leg):
    yy = y0 + (56 + 30 * k) * K; a, b = (x0 + 16 * K, yy + 9 * K), (x0 + 76 * K, yy + 9 * K)
    if s == 'line': dr.line([a, b], fill=(245, 245, 250), width=int(6.5 * K)); dr.line([a, b], fill=UP['kept'], width=int(2.2 * K))
    elif s == 'trunk': dr.line([a, b], fill=UP['lapsed'], width=int(4.2 * K))
    elif s == 'tun': dashed([a, b], TUN, 4.2, 9, 5)
    elif s == 'wat': dr.line([a, (a[0] + 30 * K, a[1])], fill=WAT, width=int(4.2 * K)); dr.line([(a[0] + 30 * K, a[1]), b], fill=VIA, width=int(4.2 * K))
    elif s == 'pos': dashed([a, b], (255, 214, 120), 4.5, 14, 8)
    elif s == 'iz': dr.line([a, b], fill=(236, 96, 214), width=int(2.4 * K))
    elif s == 'ext': dashed([a, b], (225, 228, 232), 3, 12, 8)
    else: dr.line([a, b], fill=s, width=int(4.2 * K))
    dr.text((x0 + 90 * K, yy), lab, font=f14, fill=(230, 232, 228))
tot = sum(r['km'] for r in d['routes'] if r['class'] in ('line', 'trunk', 'branch'))
tun = sum(r['tunnel_km'] for r in d['routes'] if r['class'] in ('line', 'trunk', 'branch'))
dr.text((18 * K, 14 * K), 'Ancient network, proposal (2026-11-11): %d sites, %s km of line and trunk, %s km in tunnel' % (len([n for n in d['nodes'] if n['kind'] == 'site']), format(tot, ','), format(tun, ',')),
        font=f22, fill=(244, 242, 234), stroke_width=3 * K, stroke_fill=(10, 12, 14))
t = t.resize((W0, H0), Image.LANCZOS)
t.save(OUT, quality=86)
print(OUT, tot, tun)
