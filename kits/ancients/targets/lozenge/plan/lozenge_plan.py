#!/usr/bin/env python3
"""The Lozenge (the Arccube at a quarter height): a rough floor plan, by the palace-blueprint method (settlements/voth/palace).

The mass is classified cell by cell from the same numbers as kits/ancients/targets/lozenge/89d5-lozenge.js (the quarter-height
diamond, VS = 0.25), so a sheet cannot drift from the model:

  plan cuts    one sheet per level: what a horizontal cut at that height meets, zone by zone, with areas
  sections     two cuts across the diamond: between the wells (through a pier station) and down a light well
  population   the lit floor of every zone, the people it holds in three cases, intact and ruined

The zoning is the model's own. A home needs a window: the homes are the one-storey row behind every terrace riser
(the farmed upper faces) and every step of the lower faces that is 40 m or more over the plain, and the 10 m of
mass behind every other open wall (the light wells, the void, the end craters, the courts, the piers' faces).
Everything deeper is the unlit city: works, stores, plant, cisterns, lamp-lit farms, and the two civic bands of the
front elevation (the cultural centre and the city centre round the void).

    python3 lozenge_plan.py       # writes sheets/*.png and AREAS.md next to this file
"""
import math, os
import numpy as np
from scipy.ndimage import distance_transform_edt
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'
def font(size, bold=False):
    for name in ([('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]):
        try: return ImageFont.truetype(FONT_DIR + name, size)
        except OSError: pass
    return ImageFont.load_default()

# ---- the numbers (89d5-lozenge.js) ---------------------------------------------------------------------------
S = 1000.; RD = S / math.sqrt(2); VS = .25; RH = RD * VS; HTT = 375.; KY = HTT - 2 * RH; CY = KY + RH; HX = S / 2
BR = [RD, 560, 430, 300, 152]; DPX = [0, 24, 52, 86]; VX = HX - DPX[3]
WWX, WDEP = 40, 60; WQ = RD - WDEP / VS; WT0, WT1 = .036, .964; WX = [-420 + i * 140 for i in range(7)]
SPW2, PIERX = 30, 440
CQX0, CQX1, CQT0, CQT1, CQQ = 305, 432, .13, .30, RD - 24 / VS
FTA, FTE, FTD, TK = .036, .465, .56, .99576
PRZ, PHX, PHZ, PCHZ = 380, 52, 90, 75
PIERS = [(px, pz, PHZ) for pz in (-PRZ, PRZ) for px in (-420, -210, 0, 210, 420)] + [(px, 0., PCHZ) for px in (-420, 0, 420)]
STOREY = 25.6 / 7; TRD = STOREY / VS; LOWMIN = 40.; LITD = 10.
BX0, BRMAX = -HX - 20, 400; SPX, SPW, SPT, SPTH = 175, 135, .225, .12

# zone id: (name, colour, homes?)
Z = {
    0: ('outside', (255, 255, 255), 0),
    1: ('homes: the terrace rows (one storey under each field)', (232, 196, 120), 1),
    2: ('homes and works: the lower steps (40 m and more over the plain)', (222, 176, 150), 1),
    3: ('homes on the wells, the void, the ends and the courts (10 m deep)', (240, 214, 160), 1),
    4: ('homes in the piers (10 m behind their walls)', (226, 190, 140), 1),
    5: ('the spine: lifts and stairs', (150, 150, 150), 0),
    6: ('structure: the blind corner piers', (120, 116, 108), 0),
    7: ('deep works, stores, plant (living-working band)', (204, 204, 196), 0),
    8: ('deep: cisterns, lamp-lit farms, services (living band)', (196, 214, 196), 0),
    9: ('the cultural centre: halls under lamps', (200, 196, 226), 0),
    10: ('the city centre: markets and halls round the void', (226, 196, 214), 0),
    11: ('pier cores: lifts, freight, stores', (176, 168, 156), 0),
    20: ('the void (open)', (40, 40, 46), 0),
    21: ('a light well (open)', (176, 210, 236), 0),
    22: ('a civic court (open)', (214, 236, 250), 0),
    23: ('the ruin: gone (the broken corner, the spall)', (250, 236, 236), 0),
}


def classify(X, Y, Zc, ruin=False, cell=2.):
    """Zone of every cell of a regular grid (any two of X, Y, Zc varying)."""
    q = np.abs(Zc) + np.abs(Y - CY) / VS
    dpx = np.where(q >= BR[1], DPX[0], np.where(q >= BR[2], DPX[1], np.where(q >= BR[3], DPX[2], DPX[3])))
    with np.errstate(divide='ignore', invalid='ignore'):
        t = np.where(q > 0, (1 - (Y - CY) / (VS * q)) * .5, .5)
    env = (q <= RD) & (np.abs(X) <= HX - dpx)
    void = env & (q < BR[4])
    wellx = np.zeros(q.shape, bool)
    for i, wx in enumerate(WX):
        if i != 3: wellx |= np.abs(X - wx) < WWX / 2
    well = env & wellx & (t > WT0) & (t < WT1) & (q > WQ)
    court = env & (t > CQT0) & (t < CQT1) & (np.abs(X) > CQX0) & (np.abs(X) < CQX1) & (q > CQQ)
    gone = np.zeros(q.shape, bool)
    if ruin:
        f = np.clip((X - BX0) / (HX - BX0), 0, 1)
        gone = env & (Zc > 0) & (np.hypot(RD - Zc, (Y - CY) / VS) < BRMAX * (.7 + .3 * f ** 1.3))
        gone |= env & (Zc > 0) & (Y > CY) & (np.hypot((X - SPX) / SPW, (t - SPT) / SPTH) < 1) & (q > RD - 120)
    mass = env & ~void & ~well & ~court & ~gone
    pier = np.zeros(q.shape, bool)
    for px, pz, hz in PIERS:
        if ruin and px == 420 and pz > 0: continue
        pier |= (np.abs(X - px) < PHX) & (np.abs(Zc - pz) < hz) & (Y > 0) & (Y < CY) & (q > RD)
    zone = np.zeros(q.shape, np.int16)
    zone[void] = 20; zone[well] = 21; zone[court] = 22; zone[gone] = 23
    # the deep bands
    zone[mass & (q >= 560)] = 7; zone[mass & (q < 560) & (q >= 430)] = 8
    zone[mass & (q < 430) & (q >= 300)] = 9; zone[mass & (q < 300)] = 10
    # lit by the wells, the void, the craters, the courts, the ruin's break: 10 m (in this cut)
    other = (void | well | court | gone | (~env & (np.abs(X) > HX - dpx) & (q <= RD)))
    d = distance_transform_edt(~other, sampling=cell) if other.any() else np.full(q.shape, 1e9)
    zone[mass & (d <= LITD)] = 3
    # the face rows: one storey under the envelope (a tread deep), cut by the spine, the corner piers
    band = mass & ((RD - q) < TRD)
    up = Y >= CY
    rows_up = band & up & (t > FTA) & (t < FTE)
    rows_lo = band & ~up & (t > FTD) & (t < TK) & (CY - VS * (RD - np.abs(Zc)) >= LOWMIN)
    zone[rows_up] = 1; zone[rows_lo] = 2
    zone[mass & (np.abs(X) > PIERX) & ((RD - q) < 60)] = 6
    zone[mass & (np.abs(X) < SPW2) & ((RD - q) < 60)] = 5
    # the piers
    dp = distance_transform_edt(pier, sampling=cell) if pier.any() else np.zeros(q.shape)
    zone[pier & (dp <= LITD)] = 4; zone[pier & (dp > LITD)] = 11
    return zone


LEVELS = [
    ('L0', 12., 'Level 0 (+12 m): the undercroft and the piers',
     'Under the belly. The keel is 21 m over the plain and the lower faces rise 14 degrees to 198 m at the eaves; the plain under them is the covered city: the arrival from the west, the courts between the piers, markets. The thirteen piers are inhabited 10 m deep behind their walls; their cores carry the lifts and freight.'),
    ('L1', 70., 'Level 1 (+70 m): the belly',
     'The lower diamond is only 600 m wide here. Its outer step is the lower face: rows of homes and works looking out over the plain (40 m and more up). Behind them, the deep living-working band: works, stores, plant.'),
    ('L2', 150., 'Level 2 (+150 m): under the equator',
     'Wide now (1 220 m). The six light wells reach this far down as slots 40 m wide; the void is above. Homes on the well walls and the lower steps; the deep bands inward.'),
    ('L3', CY, 'Level 3 (+198 m): the equator, the widest floor',
     'The full 1 414 m. The light wells notch both long sides 240 m deep; the void runs the length of the city at its middle, 304 m across, with the city centre round it, then the cultural centre, then the deep works. The two end craters step in 24, 52 and 86 m.'),
    ('L4', 260., 'Level 4 (+260 m): under the terraces',
     'The upper diamond, 920 m wide. Its outer step is the terrace row: homes under the fields. The two civic courts at each end open to the sky; the heliport tower rises through the north-west.'),
    ('L5', 330., 'Level 5 (+330 m): the ridge',
     '360 m wide: terraces to the ridge band and the heliport deck above it, the last of the wells, the deep stores under the ridge.'),
]


def plan_cut(y, ruin=False, g=2.):
    xs = np.arange(-HX - 40, HX + 40, g) + g / 2; zs = np.arange(-RD - 30, RD + 30, g) + g / 2
    X, Zc = np.meshgrid(xs, zs, indexing='ij')
    return xs, zs, classify(X, np.full(X.shape, y), Zc, ruin, g)


def areas(zone, g):
    out = {}
    for k in Z:
        n = int((zone == k).sum())
        if n: out[k] = n * g * g
    return out


def legend(dr, x, y, used, ar, f, fb, width):
    dr.text((x, y), 'Key (area in this cut)', font=fb, fill=(0, 0, 0)); y += 32
    for k in sorted(used):
        if k == 0: continue
        nm, col, _ = Z[k]
        dr.rectangle([x, y + 2, x + 22, y + 22], fill=col, outline=(0, 0, 0))
        dr.text((x + 32, y), '%s  %.1f ha' % (nm, ar.get(k, 0) / 1e4), font=f, fill=(20, 20, 20)); y += 30
    return y


def draw_level(L, ruin=False, g=2.):
    lid, y, title, sub = L
    xs, zs, zone = plan_cut(y, ruin, g)
    ar = areas(zone, g)
    s = 1.6 / g                                 # px per m
    PW, PH = int(len(xs) * g * s), int(len(zs) * g * s)
    W = PW + 1060 + 90; header = 150
    img = Image.new('RGB', (W, header + PH + 80), (255, 255, 255)); dr = ImageDraw.Draw(img)
    f_t, f_s, f, fb = font(38, True), font(21), font(19), font(20, True)
    dr.text((30, 16), title + (' (the ruin)' if ruin else ''), font=f_t, fill=(20, 20, 20))
    words = sub.split(); line = ''; ly = 66
    for w in words:
        if dr.textlength(line + ' ' + w, font=f_s) > W - 60: dr.text((30, ly), line, font=f_s, fill=(70, 70, 70)); ly += 27; line = w
        else: line = (line + ' ' + w).strip()
    dr.text((30, ly), line, font=f_s, fill=(70, 70, 70))
    rgb = np.zeros(zone.shape + (3,), np.uint8)
    for k, (_, col, _) in Z.items(): rgb[zone == k] = col
    # x runs left to right (west at the left); north (-z) up
    pic = Image.fromarray(np.transpose(rgb, (1, 0, 2))).resize((PW, PH), Image.NEAREST)
    ox, oy = 30, header
    img.paste(pic, (ox, oy))
    X = lambda x: ox + (x - xs[0] + g / 2) * s
    Yp = lambda z: oy + (z - zs[0] + g / 2) * s
    dr.rectangle([X(-HX), Yp(-RD), X(HX), Yp(RD)], outline=(140, 140, 140), width=1)
    dr.text((X(-HX) + 4, Yp(-RD) - 24), 'north', font=f, fill=(90, 90, 90))
    dr.text((X(-HX) - 4, Yp(0) - 10), 'W', font=fb, fill=(90, 90, 90))
    for i, wx in enumerate(WX):
        dr.text((X(wx) - 10, Yp(RD) + 4), 'w%d' % (i + 1) if i != 3 else 'spine', font=font(15), fill=(90, 90, 90))
    bx, by = X(-HX), Yp(RD) + 34
    dr.line([(bx, by), (bx + 100 * s, by)], fill=(0, 0, 0), width=3); dr.text((bx + 100 * s + 8, by - 11), '100 m', font=f, fill=(0, 0, 0))
    lx = ox + PW + 50
    ly = legend(dr, lx, header, set(np.unique(zone).tolist()), ar, f, fb, 1000)
    homes = sum(a for k, a in ar.items() if Z[k][2])
    dr.text((lx, ly + 16), 'Floor in this cut: %.1f ha, of it homes %.1f ha' % (sum(a for k, a in ar.items() if k < 20 and k) / 1e4, homes / 1e4), font=fb, fill=(0, 0, 0))
    return img, ar


def draw_section(x0, name, ruin=False, g=1.):
    zs = np.arange(-RD - 60, RD + 60, g) + g / 2; ys = np.arange(0, HTT + 40, g) + g / 2
    Zc, Y = np.meshgrid(zs, ys, indexing='ij')
    zone = classify(np.full(Zc.shape, x0), Y, Zc, ruin, g)
    s = 1.55
    PW, PH = int(len(zs) * g * s), int(len(ys) * g * s)
    W, H = PW + 60, PH + 460
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    f_t, f_s, f, fb = font(38, True), font(21), font(18), font(19, True)
    dr.text((30, 16), name + (' (the ruin)' if ruin else ''), font=f_t, fill=(20, 20, 20))
    dr.text((30, 64), 'Across the diamond at x = %+d m, looking east; no vertical exaggeration. North at the left.' % x0, font=f_s, fill=(70, 70, 70))
    rgb = np.zeros(zone.shape + (3,), np.uint8)
    for k, (_, col, _) in Z.items(): rgb[zone == k] = col
    pic = Image.fromarray(np.flipud(np.transpose(rgb, (1, 0, 2)))).resize((PW, PH), Image.NEAREST)
    ox, oy = 30, 110
    img.paste(pic, (ox, oy))
    Xp = lambda z: ox + (z - zs[0]) * s
    Yp = lambda y: oy + PH - (y - ys[0]) * s
    dr.line([(ox, Yp(0)), (ox + PW, Yp(0))], fill=(90, 70, 40), width=3)
    # the terrace profile on the upper faces: risers and treads, inscribed
    if not (WX[0] - 20 < x0 < WX[-1] + 20 and any(abs(x0 - wx) < WWX / 2 for i, wx in enumerate(WX) if i != 3)):
        y = math.ceil((CY + RH * (1 - 2 * FTE)) / STOREY) * STOREY; ytop = CY + RH * (1 - 2 * FTA)
        while y + STOREY < ytop:
            zo, zi = RD - (y - CY) / VS, RD - (y + STOREY - CY) / VS
            for sg in (-1, 1):
                dr.line([(Xp(sg * zo), Yp(y)), (Xp(sg * zi), Yp(y)), (Xp(sg * zi), Yp(y + STOREY))], fill=(110, 80, 30), width=1)
            y += STOREY
    for yy, lab in [(KY, 'keel 21 m'), (CY, 'equator 198 m'), (HTT, 'ridge deck 375 m')]:
        dr.line([(ox + PW - 160, Yp(yy)), (ox + PW, Yp(yy))], fill=(150, 150, 150), width=1)
        dr.text((ox + PW - 158, Yp(yy) - 22), lab, font=f, fill=(90, 90, 90))
    used = set(np.unique(zone).tolist())
    lx, ly = 30, oy + PH + 30; col = 0
    for k in sorted(used):
        if k == 0: continue
        nm, c, _ = Z[k]; cx = lx + col * (W // 2)
        dr.rectangle([cx, ly + 2, cx + 20, ly + 20], fill=c, outline=(0, 0, 0)); dr.text((cx + 30, ly), nm, font=f, fill=(20, 20, 20))
        col ^= 1
        if col == 0: ly += 28
    dr.text((lx, ly + 40), 'Terrace: riser 3.66 m (one storey of homes), tread 14.6 m (the field). A well is 40 m wide and 60 m deep under the face.', font=f, fill=(70, 70, 70))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for L in LEVELS:
        for ruin in (False, True):
            img, ar = draw_level(L, ruin)
            nm = L[0] + ('-ruin' if ruin else '')
            if not ruin or L[0] in ('L3', 'L4'):
                img.save(os.path.join(OUT, nm + '.png')); print('drawing', nm)
            rows.append((nm, L[1], ar))
    draw_section(-210, 'Section A: between the wells, through a pier station').save(os.path.join(OUT, 'section-A.png'))
    draw_section(-280, 'Section B: down light well 2').save(os.path.join(OUT, 'section-B.png'))
    draw_section(330, 'Section C: through the broken corner', ruin=True).save(os.path.join(OUT, 'section-C-ruin.png'))
    lines = ['# The Lozenge: areas by level\n', 'Generated by `lozenge_plan.py`. Hectares met by a horizontal cut at each level (a cut, not a storey count).\n',
             '| Level | y (m) | ' + ' | '.join(Z[k][0] for k in sorted(Z) if k) + ' |', '|---|---|' + '---|' * (len(Z) - 1)]
    for nm, y, ar in rows:
        lines.append('| %s | %.0f | ' % (nm, y) + ' | '.join('%.1f' % (ar.get(k, 0) / 1e4) for k in sorted(Z) if k) + ' |')
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh: fh.write('\n'.join(lines) + '\n')
    print('wrote', len(LEVELS), 'levels, 3 sections, AREAS.md')


if __name__ == '__main__':
    main()
