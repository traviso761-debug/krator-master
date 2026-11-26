#!/usr/bin/env python3
"""Arcodiga: architectural & interior blueprint generator, driven directly from 8av0-arcodiga-plan.js and 8av1-arcodiga-interiors.js.

Generates:
  sheets/master_plan.png         top-view site & refurbishment zone plan (after Soleri Plate 18, sheet 1)
  sheets/transverse_section.png  axial section through VTOL tower, dam, spine, stiffening wing & powerhouse (after sheet 2)
  sheets/organs_interiors.png    6-panel floor-plate rooms & doors plan across all 5 Soleri organs + dormant sockets
  AREAS.md                       organ-by-organ floor areas, room counts, and peak vs refurbished population

    python3 kits/ancients/targets/arcodiga/plan/arcodiga_blueprint.py
"""
import json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'


def font(size, bold=False):
    for name in (('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')):
        try:
            return ImageFont.truetype(FONT_DIR + name, size)
        except OSError:
            pass
    return ImageFont.load_default()


JS = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[1];
global.window = global;
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
load('core/rand/08-core-rand.js');
load('kits/ancients/targets/arcodiga/8av0-arcodiga-plan.js');
load('kits/interiors/dist/interiors-core.js');
load('kits/ancients-interiors/src/10-ai-core.js');
load('kits/ancients-interiors/src/35-ai-plates.js');
load('kits/ancients/targets/arcodiga/8av1-arcodiga-interiors.js');
const AI = global.KratorAncientsInteriors;
AI.IX = global.KratorInteriors;
AI.install(AI.IX);
const P = ARCODIGA.plan({ seed: 12700 });
const B = ADG_INTERIORS.buildings(AI);
const archCurve = [];
for (let i = 0; i <= 60; i++) {
  const x = -P.dim.SPAN / 2 + (P.dim.SPAN * i) / 60;
  archCurve.push([x, ARCODIGA.zUp(x), ARCODIGA.zDs(x, 0), ARCODIGA.zDs(x, P.dim.H)]);
}
const canyonCurve = [];
for (let i = 0; i <= 50; i++) {
  const z = P.dim.CANYON_Z0 + ((P.dim.CANYON_Z1 - P.dim.CANYON_Z0) * i) / 50;
  canyonCurve.push([z, ARCODIGA.canyonHalfW(z)]);
}
const wingCurve = [];
for (let i = 0; i <= 80; i++) {
  const x = -P.dim.WING.halfSpan + (2 * P.dim.WING.halfSpan * i) / 80;
  const pr = ARCODIGA.wingProfile(x);
  wingCurve.push([x, pr.zBack, pr.zNose, pr.yBot, pr.yHwy, pr.yTop]);
}
const wingSec = [];
for (let i = 0; i <= 40; i++) {
  const y = 62 + ((322 - 62) * i) / 40;
  const z0 = ARCODIGA.wingZAt(0, y), z6 = ARCODIGA.wingZAt(650, y);
  wingSec.push([y, z0, z6]);
}
process.stdout.write(JSON.stringify({
  plan: P, refurb: ARCODIGA.refurb(P), ruin: ARCODIGA.ruin(P),
  archCurve, canyonCurve, wingCurve, wingSec,
  buildings: B.map(b => ({
    id: b.id, name: b.name, area: b.area,
    storeys: b.storeys.map(s => ({
      id: s.id, y: s.y, h: s.h, outline: s.outline,
      rooms: s.rooms.map(r => ({ id: r.id, kind: r.kind, poly: r.poly, doors: r.doors, recipe: r.recipe || null, furnish: r.furnish })),
      walls: s.walls.map(w => ({ pts: w.pts, door: w.door }))
    }))
  }))
}));
"""


def load_data():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def master_plan_sheet(D):
    P = D['plan']
    st = P['stats']
    W, Hh = 2200, 1800
    img = Image.new('RGB', (W, Hh), (250, 248, 243))
    dr = ImageDraw.Draw(img)
    ft, fs, fl, fb = font(36, True), font(18), font(16), font(18, True)

    dr.text((40, 22), 'ARCODIGA — Site & Refurbished Centerpiece Master Plan', font=ft, fill=(22, 24, 28))
    dr.text((40, 68),
            'After Soleri Plate 18 (1:10,000 proportions): 360 m arch dam (432 m VTOL tower), 1 460 m arch chord, 2 040 m stiffening wing. '
            'Peak: %d people (%.0f ha floor); Refurbished: %d people across active cores, 12 outer ribs bulkheaded.'
            % (st['peakPop'], st['floor'] / 1e4, st['refurbPop']), font=fs, fill=(65, 68, 74))

    cx, cy, sc = W // 2, 825, 0.74
    X = lambda x: cx + x * sc
    Z = lambda z: cy + z * sc

    # Upstream Reservoir fill
    res_poly = [(X(-850), Z(-860)), (X(850), Z(-860))] + [(X(a[0]), Z(a[1])) for a in reversed(D['archCurve'])]
    dr.polygon(res_poly, fill=(192, 220, 236))
    dr.text((X(220), Z(-640)), 'WATER RESERVOIR (WL 324 m kept / 328 m full)', font=fb, fill=(32, 78, 108))

    # Downstream Park & Y-Waterways
    dr.polygon([(X(-820), Z(0)), (X(820), Z(0)), (X(980), Z(1040)), (X(-980), Z(1040))], fill=(229, 238, 220))
    dr.polygon([(X(-136), Z(92)), (X(136), Z(92)), (X(148), Z(152)), (X(-148), Z(152))], fill=(150, 198, 218))
    for s in (-1, 1):
        dr.line([(X(s * 116), Z(146)), (X(s * 14), Z(424))], fill=(110, 175, 205), width=int(22 * sc))
    dr.line([(X(0), Z(418)), (X(0), Z(980))], fill=(110, 175, 205), width=int(32 * sc))
    dr.text((X(28), Z(700)), 'LINEAR CITY & WATER WAYS', font=fb, fill=(40, 88, 110))

    # Circular Pumped-Silt Basins
    for sb in P['siltBeds']:
        r = sb['r'] * sc
        dr.ellipse([X(sb['x']) - r, Z(sb['z']) - r, X(sb['x']) + r, Z(sb['z']) + r], fill=(195, 224, 176), outline=(72, 104, 62), width=2)
        rc = r * 0.34
        dr.ellipse([X(sb['x']) - rc, Z(sb['z']) - rc, X(sb['x']) + rc, Z(sb['z']) + rc], fill=(135, 192, 216))
    dr.text((X(-370), Z(940)), 'PUMPED-SILT FARM BASINS', font=fl, fill=(56, 86, 48))

    # Canyon Rock Walls (left & right)
    for s in (-1, 1):
        wall_pts = [(X(s * c[1]), Z(c[0])) for c in D['canyonCurve']]
        outer = [(X(s * 1250), Z(P['dim']['CANYON_Z1'])), (X(s * 1250), Z(P['dim']['CANYON_Z0']))]
        dr.polygon(wall_pts + outer, fill=(214, 204, 190), outline=(90, 82, 74), width=2)
    dr.text((X(-1060), Z(-420)), 'CANYON WALL (640 m)', font=fb, fill=(85, 75, 65))
    dr.text((X(860), Z(-420)), 'CANYON WALL (640 m)', font=fb, fill=(85, 75, 65))

    # Power House & Automated Industries
    pw = P['dim']['POWER']
    dr.rectangle([X(-pw['w'] / 2), Z(pw['z0']), X(pw['w'] / 2), Z(pw['z1'])], fill=(224, 198, 152), outline=(60, 52, 42), width=2)
    for ch in pw['chutes']:
        dr.rectangle([X(ch - 8), Z(pw['z1'] - 24), X(ch + 8), Z(pw['z1'])], fill=(95, 165, 200))
    ind = P['dim']['IND']
    for s in (-1, 1):
        x0, x1 = sorted([s * ind['xIn'], s * ind['xOut']])
        dr.rectangle([X(x0), Z(ind['z0']), X(x1), Z(ind['z1'])], fill=(218, 204, 172), outline=(70, 64, 54), width=2)
    dr.text((X(-380), Z(58)), 'AUTOMATED INDUSTRIES', font=fl, fill=(55, 50, 42))

    # Arch Dam Footprint & Crest Promenade
    dam_poly = [(X(a[0]), Z(a[1])) for a in D['archCurve']] + [(X(a[0]), Z(a[2])) for a in reversed(D['archCurve'])]
    dr.polygon(dam_poly, fill=(232, 225, 212), outline=(55, 55, 58), width=2)
    crest_poly = [(X(a[0]), Z(a[1] - 4)) for a in D['archCurve']] + [(X(a[0]), Z(a[1] + 62)) for a in reversed(D['archCurve'])]
    dr.polygon(crest_poly, fill=(244, 218, 174), outline=(70, 58, 40), width=2)
    for oc in P['oculi']:
        ro = oc['r'] * sc
        dr.ellipse([X(oc['x']) - ro, Z(oc['z']) - ro, X(oc['x']) + ro, Z(oc['z']) + ro], fill=(182, 214, 232), outline=(60, 60, 65), width=2)

    # 16 Radial Living-Working Buttress Ribs (Active = warm amber, Dormant = cool slate)
    for rb in P['ribs']:
        nx, nz = rb['nx'], rb['nz']
        tx, tz = nz, -nx
        hw = rb['w'] * 0.5
        zB = -260 * (1 - (rb['x'] / 730.0) ** 2) + 95
        pts_local = [(-hw, -16), (-hw, rb['proj0']), (hw, rb['proj0']), (hw, -16)]
        poly = [(X(rb['x'] + tx * lx + nx * lz), Z(zB + tz * lx + nz * lz)) for lx, lz in pts_local]
        col = (172, 182, 192) if rb['dormant'] else (238, 188, 124)
        dr.polygon(poly, fill=col, outline=(52, 56, 62), width=2)
        if rb['dormant']:
            # Bulkhead bar across throat
            b0 = (X(rb['x'] - tx * hw), Z(zB - tz * hw))
            b1 = (X(rb['x'] + tx * hw), Z(zB + tz * hw))
            dr.line([b0, b1], fill=(185, 52, 42), width=4)

    # 4 Central Commercial / City Center Prows
    for pr in P['prows']:
        hw = pr['w'] * 0.5
        zB = pr['z0'] + 18
        poly = [(X(pr['x'] - hw), Z(zB - 14)), (X(pr['x'] - hw), Z(zB + pr['proj0'] - 16)),
                (X(pr['x']), Z(zB + pr['proj0'])), (X(pr['x'] + hw), Z(zB + pr['proj0'] - 16)), (X(pr['x'] + hw), Z(zB - 14))]
        dr.polygon(poly, fill=(242, 174, 108), outline=(50, 42, 34), width=2)

    # Axial City Spine & VTOL Airport Tower
    sp = P['dim']['SPINE']
    dr.rectangle([X(-sp['w'] / 2), Z(sp['z0']), X(sp['w'] / 2), Z(sp['z1'])], fill=(246, 202, 134), outline=(48, 40, 30), width=2)
    dr.text((X(56), Z(60)), 'POWER HOUSE', font=fl, fill=(45, 38, 28))
    vt = P['dim']['VTOL']
    dr.rectangle([X(-vt['deckW'] / 2), Z(vt['z'] - vt['deckW'] / 2), X(vt['deckW'] / 2), Z(vt['z'] + vt['deckW'] / 2)],
                 fill=(236, 214, 176), outline=(40, 42, 48), width=3)
    dr.text((X(-125), Z(vt['z'] - 92)), 'VERTICAL TAKE-OFF AIRPORT (432 m)', font=fb, fill=(30, 36, 46))

    # Colossal Horizontal Stiffening Wing
    wing_poly = [(X(w[0]), Z(w[1])) for w in D['wingCurve']] + [(X(w[0]), Z(w[2])) for w in reversed(D['wingCurve'])]
    dr.polygon(wing_poly, fill=(238, 194, 138), outline=(42, 38, 34), width=3)
    dr.line([(X(-1020), Z(288)), (X(1020), Z(288))], fill=(190, 68, 42), width=3)
    dr.text((X(-580), Z(202)), 'RESEARCH LABORATORIES', font=fb, fill=(42, 34, 28))
    dr.text((X(-75), Z(202)), 'CITY CENTER HUB', font=fb, fill=(42, 34, 28))
    dr.text((X(340), Z(202)), 'LEARNING CENTER', font=fb, fill=(42, 34, 28))
    dr.text((X(540), Z(296)), 'HIGHWAYS (y 176 m)', font=fl, fill=(165, 48, 30))

    # Legend & Scale bar
    ly = Hh - 85
    legend = [
        ((242, 188, 124), 'Refurbished active organs (~26.6k people)'),
        ((172, 182, 192), 'Dormant outer ribs (12 sectors behind red bulkheads)'),
        ((195, 224, 176), 'Irrigated pumped-silt farm basins & park terraces')
    ]
    lx = 40
    for col, txt in legend:
        dr.rectangle([lx, ly, lx + 28, ly + 22], fill=col, outline=(50, 50, 50))
        dr.text((lx + 38, ly + 1), txt, font=fs, fill=(35, 35, 38))
        lx += 570
    dr.line([(W - 450, ly + 12), (W - 450 + int(500 * sc), ly + 12)], fill=(20, 20, 20), width=4)
    dr.text((W - 450, ly + 22), '0                    500 m (North / Upstream is UP)', font=fl, fill=(20, 20, 20))
    return img


def section_sheet(D):
    P = D['plan']
    W, Hh = 2100, 1180
    img = Image.new('RGB', (W, Hh), (250, 248, 243))
    dr = ImageDraw.Draw(img)
    ft, fs, fl, fb = font(34, True), font(18), font(15), font(17, True)

    dr.text((40, 20), 'ARCODIGA — Transverse Axial Section (x = 0, looking west — after Soleri Plate 18, sheet 2)', font=ft, fill=(22, 24, 28))
    dr.text((40, 64), 'Upstream (-z) on the RIGHT, downstream (+z) on the LEFT, matching Soleri\'s transverse section orientation. No vertical exaggeration.',
            font=fs, fill=(65, 68, 74))

    base_y = Hh - 140
    sc = 1.25
    # Map z in [-720, +720]: right is upstream (-z), left is downstream (+z)
    Zp = lambda z: 1020 - z * sc
    Yp = lambda y: base_y - y * sc

    # Canyon background silhouette (640 m)
    dr.polygon([(Zp(680), Yp(0)), (Zp(680), Yp(580)), (Zp(220), Yp(640)), (Zp(-360), Yp(650)), (Zp(-700), Yp(620)), (Zp(-700), Yp(0))],
               fill=(235, 230, 222), outline=(150, 142, 132), width=2)
    dr.text((Zp(580), Yp(540)), 'CANYON RIM (640 m)', font=fl, fill=(110, 102, 92))

    # Reservoir water (WL 324 m kept)
    dr.rectangle([Zp(-260), Yp(324), Zp(-700), Yp(14)], fill=(186, 218, 236), outline=(85, 138, 168), width=2)
    dr.line([(Zp(-260), Yp(213)), (Zp(-700), Yp(213))], fill=(185, 70, 55), width=2)
    dr.text((Zp(-272), Yp(302)), 'RESERVOIR (324 m)', font=fb, fill=(28, 72, 102))
    dr.text((Zp(-272), Yp(232)), 'Breach WL (213 m)', font=fl, fill=(165, 55, 42))

    # Dam Arch cross-section at x = 0 (zUp = -260, zDs(0,0) = -100, zDs(0,360) = -212)
    dam_sec = [(Zp(-260), Yp(0)), (Zp(-260), Yp(360)), (Zp(-198), Yp(360)), (Zp(-100), Yp(0))]
    dr.polygon(dam_sec, fill=(224, 216, 202), outline=(48, 48, 52), width=3)

    # Central Prow & Living-Working steps
    prow_sec = [(Zp(-100), Yp(44)), (Zp(-100 + 104), Yp(44)), (Zp(-156 + 104), Yp(216)),
                (Zp(-185 + 87), Yp(292)), (Zp(-210 + 74), Yp(352)), (Zp(-212), Yp(352))]
    dr.polygon(prow_sec, fill=(238, 198, 148), outline=(55, 46, 36), width=2)
    for yy in range(60, 348, 16):
        z_f = -260 + 48 + 112 * (1 - yy / 360.0) + 74
        dr.line([(Zp(-245), Yp(yy)), (Zp(z_f), Yp(yy))], fill=(120, 105, 88), width=1)
    dr.text((Zp(-40), Yp(280)), 'LIVING - WORKING & LIGHT WELLS', font=fb, fill=(52, 42, 32))

    # Crest Promenade & Oculus
    dr.rectangle([Zp(-194), Yp(376), Zp(-264), Yp(360)], fill=(244, 212, 158), outline=(48, 42, 34), width=2)
    dr.text((Zp(-155), Yp(398)), 'PROMENADE & LIGHT WELLS (360-376 m)', font=fl, fill=(42, 38, 32))

    # Upstream VTOL Airport Tower & Causeway
    vt = P['dim']['VTOL']
    dr.rectangle([Zp(vt['z'] + 38), Yp(vt['yDeck0']), Zp(vt['z'] - 38), Yp(14)], fill=(232, 226, 216), outline=(45, 48, 54), width=2)
    dr.rectangle([Zp(vt['z'] + 68), Yp(vt['yDeck1']), Zp(vt['z'] - 68), Yp(vt['yDeck0'])], fill=(244, 206, 146), outline=(40, 42, 48), width=3)
    dr.rectangle([Zp(-256), Yp(364), Zp(vt['z'] + 38), Yp(356)], fill=(226, 212, 188), outline=(55, 52, 48), width=2)
    dr.text((Zp(vt['z'] + 95), Yp(456)), 'VERTICAL TAKE-OFF AIRPORT (432 m)', font=fb, fill=(28, 34, 44))

    # Power House & Automated Industries at the toe
    dr.rectangle([Zp(96), Yp(46), Zp(-86), Yp(0)], fill=(222, 192, 142), outline=(48, 40, 32), width=2)
    dr.text((Zp(88), Yp(26)), 'POWER HOUSE & AUTOMATED INDUSTRIES', font=fb, fill=(45, 36, 26))

    # Axial City Spine (Public — City Center — Commercial, y 152..204, z -452..+184)
    dr.rectangle([Zp(184), Yp(204), Zp(-452), Yp(152)], fill=(248, 198, 126), outline=(42, 34, 26), width=3)
    for dy in (166, 176, 186):
        dr.line([(Zp(184), Yp(dy)), (Zp(-220), Yp(dy))], fill=(140, 95, 50), width=1)
    dr.text((Zp(145), Yp(182)), 'PUBLIC  ·  CITY CENTER  ·  COMMERCIAL SPINE', font=fb, fill=(48, 32, 18))

    # Horizontal Stiffening Wing Trumpet Cross-Section (outer flare dashed/shaded, centre hub solid)
    outer_front = [(Zp(s[2][1]), Yp(s[0])) for s in D['wingSec'] if s[2]]
    outer_rear = [(Zp(s[2][0]), Yp(s[0])) for s in reversed(D['wingSec']) if s[2]]
    dr.polygon(outer_front + outer_rear, fill=(238, 182, 122), outline=(92, 58, 32), width=2)
    hub_front = [(Zp(s[1][1]), Yp(s[0])) for s in D['wingSec'] if s[1]]
    hub_rear = [(Zp(s[1][0]), Yp(s[0])) for s in reversed(D['wingSec']) if s[1]]
    dr.polygon(hub_front + hub_rear, fill=(248, 168, 96), outline=(42, 28, 18), width=3)
    dr.text((Zp(305), Yp(336)), 'RESEARCH / LEARNING FLARE (to 322 m)', font=fb, fill=(92, 48, 22))
    dr.text((Zp(415), Yp(182)), 'HIGHWAYS (176 m)', font=fb, fill=(165, 42, 28))

    # Ground baseline & scale bar
    dr.line([(40, Yp(0)), (W - 40, Yp(0))], fill=(60, 52, 44), width=3)
    dr.line([(80, Hh - 55), (80 + int(300 * sc), Hh - 55)], fill=(20, 20, 20), width=4)
    dr.text((80, Hh - 44), '0                  300 m (1:1 vertical & horizontal)', font=fl, fill=(20, 20, 20))
    return img


def interiors_sheet(D):
    W, Hh = 2200, 1520
    img = Image.new('RGB', (W, Hh), (252, 250, 246))
    dr = ImageDraw.Draw(img)
    ft, fs, fl, fb = font(34, True), font(18), font(14), font(18, True)

    dr.text((36, 18), 'ARCODIGA — Planned Interior Floor Plates & Culture Sockets (All 6 Organ Groups)', font=ft, fill=(22, 24, 28))
    total_rooms = sum(len(s['rooms']) for b in D['buildings'] for s in b['storeys'])
    dr.text((36, 62),
            'Every room is generated during construction via kits/ancients-interiors floor plates (%d units, %d rooms). '
            'Refurbished active organs furnish out-of-the-box and re-socket into any settlement culture.' % (len(D['buildings']), total_rooms),
            font=fs, fill=(65, 68, 74))

    KIND_COL = {
        'corridor': (236, 236, 234), 'core': (190, 192, 198),
        'hall': (246, 214, 162), 'study': (198, 224, 242), 'library': (184, 214, 238), 'school': (196, 232, 226),
        'bedroom': (214, 236, 196), 'kitchen': (246, 202, 176), 'bath': (188, 234, 238), 'barracks': (222, 214, 238),
        'workshop': (236, 208, 168), 'store': (222, 216, 198), 'tavern': (244, 192, 166),
        'sickbay': (210, 240, 222), 'chartroom': (194, 220, 244), 'strongroom': (216, 204, 188),
        'armoury': (232, 196, 192), 'brig': (204, 200, 208), 'sailloft': (234, 224, 190), 'laundry': (204, 228, 236)
    }

    panels = [
        ('wing', '1. Stiffening Wing (Highway Hub, Research & Learning)', 185),
        ('spine', '2. Axial City Spine (Civic, Council & Commercial)', 176),
        ('crest', '3. Crest Promenade & VTOL Airport Decks', None),
        ('ribs', '4. Active Living-Working Buttresses & Central Prows', None),
        ('dormant', '5. Dormant Outer Ribs (Unfurnished Rehab Sockets)', None),
        ('works', '6. Power House & Automated Industries', 3)
    ]

    pw, ph = 680, 610
    for idx, (area, title, pref_y) in enumerate(panels):
        ox = 36 + (idx % 3) * (pw + 42)
        oy = 115 + (idx // 3) * (ph + 65)
        dr.rectangle([ox, oy, ox + pw, oy + ph], fill=(255, 255, 255), outline=(120, 122, 128), width=2)
        dr.text((ox + 12, oy + 10), title, font=fb, fill=(25, 28, 34))

        bs = [b for b in D['buildings'] if b['area'] == area]
        storeys = []
        for b in bs:
            chosen = [s for s in b['storeys'] if pref_y is None or abs(s['y'] - pref_y) < 10]
            storeys.append((b, (chosen[0] if chosen else b['storeys'][0])))

        xs, zs = [], []
        for _, st in storeys:
            for p in st['outline']:
                xs.append(p[0]); zs.append(p[1])
        x0, x1 = min(xs), max(xs)
        z0, z1 = min(zs), max(zs)
        span_x = max(20.0, x1 - x0)
        span_z = max(20.0, z1 - z0)
        sc = min((pw - 48) / span_x, (ph - 84) / span_z)
        mx, mz = (x0 + x1) / 2.0, (z0 + z1) / 2.0
        PX = lambda x: ox + pw / 2.0 + (x - mx) * sc
        PZ = lambda z: oy + 46 + (ph - 62) / 2.0 + (z - mz) * sc

        room_cnt = sum(len(s['rooms']) for b in bs for s in b['storeys'])
        for _, st in storeys:
            for R in st['rooms']:
                if not R['poly']:
                    continue
                pts = [(PX(p[0]), PZ(p[1])) for p in R['poly']]
                col = (224, 228, 234) if area == 'dormant' and R['kind'] != 'corridor' else KIND_COL.get(R['kind'], (228, 224, 216))
                dr.polygon(pts, fill=col, outline=(120, 120, 124))
            for w in st['walls']:
                pts = [(PX(p[0]), PZ(p[1])) for p in w['pts']]
                if len(pts) >= 2:
                    dr.line(pts, fill=(35, 38, 44), width=2)
                if w['door']:
                    dx, dz = PX(w['door']['at'][0]), PZ(w['door']['at'][1])
                    dr.ellipse([dx - 2.5, dz - 2.5, dx + 2.5, dz + 2.5], fill=(210, 62, 42))

        dr.text((ox + 12, oy + ph - 26),
                '%d units · %d total rooms across storeys · span %.0f x %.0f m (red dots = core/door doorways)'
                % (len(bs), room_cnt, x1 - x0, z1 - z0), font=fl, fill=(75, 78, 84))

    return img


def write_areas(D):
    P = D['plan']
    st = P['stats']
    lines = [
        '# Arcodiga: floor areas, interior rooms and population by organ',
        '',
        'Generated by `arcodiga_blueprint.py` from `8av0-arcodiga-plan.js` and `8av1-arcodiga-interiors.js`.',
        '',
        '## 1. Structural Massing & Population Summary',
        '',
        '| Organ | Refurbished state | Gross floor (ha) | Roof / silt gardens (ha) | Notes |',
        '|---|---|---|---|---|'
    ]
    for org in P['organs']:
        lines.append('| %s | %s | %.1f | %.1f | `%s` |' % (
            org['name'], 'Active centerpiece' if org['refurbished'] else 'Bulk cellular shell',
            org['floor'] / 1e4, (org.get('garden') or 0) / 1e4, org['id']))
    prow_fl = sum(p['floor'] for p in P['prows'])
    prow_gd = sum(p['garden'] for p in P['prows'])
    act_ribs = [r for r in P['ribs'] if r['refurbished']]
    dor_ribs = [r for r in P['ribs'] if r['dormant']]
    lines.append('| 4 Central Commercial / City Center Prows | Active centerpiece | %.1f | %.1f | `arcodiga.prow.0..3` |' % (prow_fl / 1e4, prow_gd / 1e4))
    lines.append('| 4 Inner Living-Working Buttress Ribs | Active centerpiece | %.1f | %.1f | `W1..W2, E1..E2` |' % (
        sum(r['floor'] for r in act_ribs) / 1e4, sum(r['garden'] for r in act_ribs) / 1e4))
    lines.append('| 12 Outer Living-Working Buttress Ribs | Sealed behind bulkheads (dormant) | %.1f | %.1f | `W3..W8, E3..E8` |' % (
        sum(r['floor'] for r in dor_ribs) / 1e4, sum(r['garden'] for r in dor_ribs) / 1e4))
    lines.append('| 3 Downstream Pumped-Silt Farm Basins | Active irrigated farms | — | %.1f | `arcodiga.silt.0..2` |' % (st['siltArea'] / 1e4))
    lines.append('| **Total Arcodiga** | **Peak %d / Refurbished %d people** | **%.1f** | **%.1f** | **Active refurbished floor: %.1f ha** |' % (
        st['peakPop'], st['refurbPop'], st['floor'] / 1e4, st['garden'] / 1e4, st['refurbFloor'] / 1e4))

    lines += [
        '',
        '## 2. Planned Interior Sub-Sites (`ADG_INTERIORS` on `kits/ancients-interiors`)',
        '',
        '| Sub-site (`area`) | Units | Storeys | Rooms | Furnished in `d=0` | Furnished in `d=3` (Refurbished) |',
        '|---|---|---|---|---|---|'
    ]
    for area in ('wing', 'spine', 'crest', 'ribs', 'dormant', 'works'):
        bs = [b for b in D['buildings'] if b['area'] == area]
        n_st = sum(len(b['storeys']) for b in bs)
        n_rm = sum(len(s['rooms']) for b in bs for s in b['storeys'])
        lines.append('| `%s` | %d | %d | %d | Yes (`ancient`) | %s |' % (
            area, len(bs), n_st, n_rm,
            'Socketed (`rehab`, unfurnished until unsealed)' if area == 'dormant' else 'Yes (default `post-apoc`, live socketable)'))

    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')


def main():
    os.makedirs(OUT, exist_ok=True)
    D = load_data()
    master_plan_sheet(D).save(os.path.join(OUT, 'master_plan.png'))
    section_sheet(D).save(os.path.join(OUT, 'transverse_section.png'))
    interiors_sheet(D).save(os.path.join(OUT, 'organs_interiors.png'))
    write_areas(D)
    print('wrote sheets/master_plan.png, transverse_section.png, organs_interiors.png and AREAS.md')


if __name__ == '__main__':
    main()
