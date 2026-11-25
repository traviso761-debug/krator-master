#!/usr/bin/env python3
"""Slice (after Paolo Soleri's 26. Theology): architectural floorplans, sagittal cliff section, and Modern Condition guide.

Reads 8av0-slice-plan.js directly in Node ([G data]), so the sheets and area tables can never drift from the 3D build:
  sheets/plan_levels.png       6 horizontal level cuts (+14, +32, +224, +320, +456, +508 m) coded by Work / Live / Recreation / Civic
  sheets/section_ns.png        North-South sagittal cliff section (x = 0, 1:1 scale): Hexagonal Skylight, Eye Dome, Fan, Shaft, Park, Industries
  sheets/modern_condition.png  East-West coronal elevation/section (matching image_2.png) showing Original State + Ruin Deltas -> Modern Zones
  AREAS.md                     Category-by-category, modern-zone, and unit-by-unit schedule (~13 000 citizens over 34 ha covered)
"""
import json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'


def font(size, bold=False):
    for name in [('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]:
        try:
            return ImageFont.truetype(FONT_DIR + name, size)
        except OSError:
            pass
    return ImageFont.load_default()


JS = r"""
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=process.argv[1];
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/slice/8av0-slice-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.SLICE=typeof SLICE!=="undefined"?SLICE:this.SLICE;',ctx);
const S=ctx.SLICE,P=S.plan({seed:12420}),RU=S.ruin(P),MG=S.modernGuide(P,RU);
const eyeCurve=[];
for(let x=-360;x<=360;x+=8)eyeCurve.push([x,S.eyeTopY(x),S.eyeBotY(x),S.eyeBackZ(x),S.eyeLipZ(x)]);
process.stdout.write(JSON.stringify({plan:P,ruin:RU,modern:MG,eyeCurve:eyeCurve}));
"""

CAT_COL = {
    'live': (224, 134, 104),       # warm terracotta-rose
    'work': (88, 130, 178),        # slate cobalt
    'recreation': (114, 176, 118), # lush garden sage
    'civic': (218, 176, 84),       # warm ecumenical gold
}
WATER_COL = (36, 150, 136)
ROCK_COL = (214, 196, 176)
STRAT_COL = (188, 162, 138)
CORE_COL = (188, 54, 50)


def load_data():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def draw_levels_sheet(data):
    P = data['plan']
    st = P['stats']
    W, H = 2480, 1760
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(35, True), font(19), font(18, True), font(15)

    dr.text((36, 20), 'Slice (after Soleri 26. Theology) — Interior Program Blueprint: Six Horizontal Level Cuts', font=ft, fill=(26, 24, 22))
    dr.text((36, 68), 'Surface covered: %.1f ha  |  Gross floor: %.1f ha (%.1f ha lit)  |  Population: %s (%d/ha)  |  Workplaces: %s  |  Rec cap: %s' % (
        st['surfaceCoveredHa'], st['grossFloorHa'], st['litFloorHa'],
        format(st['population'], ','), st['densityPerHa'],
        format(st['jobs'], ','), format(st['recreationCapacity'], ',')), font=fs, fill=(62, 58, 52))

    lx = 36
    for label, col in [('LIVE (Eye Honeycomb, Cave Arcs, Drums, Dwellings Wall)', CAT_COL['live']),
                       ('WORK (Automated Industries, Shaft, Research, Commercial)', CAT_COL['work']),
                       ('RECREATION (Front Amphitheatre Fan, Sunken Park, Courts)', CAT_COL['recreation']),
                       ('CIVIC (Coffered Dome, Cultural, Museums, Meeting Hall)', CAT_COL['civic']),
                       ('CANALS & REFLECTING POOLS', WATER_COL),
                       ('SHAFT CORES & STAIRS', CORE_COL)]:
        dr.rectangle([lx, 104, lx + 22, 124], fill=col, outline=(40, 40, 40))
        dr.text((lx + 28, 104), label, font=fm, fill=(35, 35, 35))
        lx += int(dr.textlength(label, font=fm)) + 44

    cuts = [
        (14,  'Level +14 m — Subterranean Automated Industries & Gorge Sluice'),
        (32,  'Level +32 m — Deep Sunken Canyon Park, Canal & Dwellings Wall Toe'),
        (224, 'Level +224 m — Stratified Bench Fieldhouse, Shaft & Dwellings Crest'),
        (320, 'Level +320 m — Collection Shaft & Rock-Cut Specimen Caverns'),
        (456, 'Level +456 m — Lenticular Eye Equator, Coffered Dome & Radial Park Fan'),
        (508, 'Level +508 m — Hexagonal Skylight Court, Drums, Meeting Hall & Portals'),
    ]

    cols, pw, ph = 3, 768, 690
    scale = pw / 890.0  # x in [-445, +445]
    for idx, (yc, title) in enumerate(cuts):
        ox = 36 + (idx % cols) * (pw + 46)
        oy = 154 + (idx // cols) * (ph + 84)
        X = lambda x: ox + (x + 445) * scale
        Z = lambda z: oy + 36 + (z + 520) * scale  # z in [-520, +370]

        dr.rectangle([ox, oy + 36, ox + pw, oy + 36 + ph], fill=(242, 238, 230), outline=(138, 130, 120), width=2)
        dr.text((ox, oy + 6), title, font=fb, fill=(25, 25, 25))

        # Cliff & plateau rock background (z < 0)
        dr.rectangle([X(-445), Z(-520), X(445), Z(0)], fill=ROCK_COL, outline=(130, 105, 85))
        if yc <= 225:
            dr.rectangle([X(-445), Z(0), X(-52), Z(186)], fill=STRAT_COL, outline=(120, 95, 75))
            dr.rectangle([X(178), Z(0), X(445), Z(186)], fill=STRAT_COL, outline=(120, 95, 75))
        dr.text((X(145), Z(-495)), 'COLUMNAR CLIFF / PLATEAU ROCK', font=fm, fill=(102, 78, 58))

        # Foreground Gorge River strip
        dr.rectangle([X(-445), Z(214), X(445), Z(370)], fill=(196, 226, 228), outline=(88, 138, 146))
        dr.text((X(-75), Z(275)), 'GORGE RIVER (+6 m)', font=fm, fill=(32, 90, 100))

        # Twin Diagonal Transport Portals on upper cuts
        if yc >= 470:
            for pt in P['portals']:
                dr.line([(X(pt['from'][0]), Z(pt['from'][1])), (X(pt['to'][0]), Z(pt['to'][1]))],
                        fill=CAT_COL['work'], width=max(5, int(pt['w'] * scale)))
            dr.text((X(-415), Z(-440)), 'INTER-CITY TRANSIT', font=fm, fill=(35, 55, 85))

        # Program units intersecting yc (or caverns near 320 m cut)
        for u in P['program']:
            in_cut = (u['y0'] - 4 <= yc <= u['y1'] + 4)
            if yc == 320 and u['zone'] == 'specimen_caverns' and u['y0'] >= 260:
                in_cut = True
            if not in_cut:
                continue
            col = CAT_COL.get(u['category'], (180, 180, 180))
            if u['shape'] == 'circle':
                r = u['r'] * scale
                cx, cz = X(u['cx']), Z(u['cz'])
                dr.ellipse([cx - r, cz - r, cx + r, cz + r], fill=col, outline=(45, 45, 45), width=2)
            else:
                dr.rectangle([X(u['x0']), Z(u['z0']), X(u['x1']), Z(u['z1'])], fill=col, outline=(45, 45, 45), width=1)

        # Semicircular Radial Buttress Piers at Eye cut
        if abs(yc - 456) < 20:
            fn = P['fan']
            for pr in P['fanPiers']:
                ang = pr['ang']
                x0p = fn['cx'] + math.sin(ang) * fn['r0']
                z0p = fn['cz'] + math.cos(ang) * fn['r0']
                x1p = fn['cx'] + math.sin(ang) * (fn['r1'] + 8)
                z1p = fn['cz'] + math.cos(ang) * (fn['r1'] + 8)
                dr.line([(X(x0p), Z(z0p)), (X(x1p), Z(z1p))], fill=(75, 65, 55), width=4)

        # Pools near this level
        for pl in P['pools']:
            if abs(pl['y'] - yc) < 18 or (yc == 508 and pl['zone'] == 'rear'):
                dr.rectangle([X(pl['x0']), Z(pl['z0']), X(pl['x1']), Z(pl['z1'])], fill=WATER_COL, outline=(20, 80, 68), width=1)

        # Cores
        for c in P['cores']:
            if c['y0'] <= yc + 6 and c['y1'] >= yc - 6:
                rr = max(4, c['r'] * scale)
                dr.ellipse([X(c['x']) - rr, Z(c['z']) - rr, X(c['x']) + rr, Z(c['z']) + rr], fill=CORE_COL, outline=(255, 255, 255))

    bx, by = 36, H - 26
    dr.line([(bx, by), (bx + 100 * scale, by)], fill=(20, 20, 20), width=4)
    dr.text((bx + 100 * scale + 12, by - 10), '100 m (North -z up into Cliff Plateau, South +z toward Sunken Trench & Gorge River)', font=fm, fill=(20, 20, 20))
    return img


def draw_section_sheet(data):
    P = data['plan']
    W, H = 2280, 1440
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(34, True), font(19), font(17, True), font(14)

    dr.text((36, 18), 'Slice — North-South Sagittal Section on Central Shaft & Dome Axis (x = 0, True 1:1 Scale)', font=ft, fill=(25, 25, 25))
    dr.text((36, 62), 'Shows the Hexagonal Skylight Court & Cave-Dwelling Arcs behind the Coffered Geodesic Dome, the cantilevered Amphitheatre Park Fan,', font=fs, fill=(62, 58, 52))
    dr.text((36, 88), 'the 384 m Vertical Learning & Collection Shaft, the 192 m-deep Sunken Park Canal, and Subterranean Automated Industries.', font=fs, fill=(62, 58, 52))

    # z from -380 to +660 (1040 m), y from -15 to +590 (605 m)
    s = 2.02
    ox, oy = 85, H - 78
    Z = lambda z: ox + (z + 380) * s
    Y = lambda y: oy - y * s

    # Upper Cliff & Plateau Rock Polygon
    rock_pts = [(Z(-380), Y(0)), (Z(-380), Y(560)), (Z(0), Y(560)), (Z(0), Y(536)),
                (Z(-205), Y(456)), (Z(-38), Y(412)), (Z(-38), Y(28)), (Z(-44), Y(28)), (Z(-44), Y(0))]
    dr.polygon(rock_pts, fill=ROCK_COL, outline=(120, 92, 72))
    dr.text((Z(-368), Y(536)), 'CAPROCK PLATEAU (+560 m)', font=fb, fill=(92, 66, 48))

    # Stratified Shoulder silhouette behind Sunken Park (dashed outline y = 220, z = 0..186)
    dr.rectangle([Z(0), Y(220), Z(186), Y(28)], outline=(145, 118, 95), width=2)
    dr.text((Z(68), Y(212)), 'Stratified Bench Profile (+220 m)', font=fm, fill=(115, 88, 66))

    # Automated Industries (y = 0..28, z = -44..186)
    dr.rectangle([Z(-44), Y(28), Z(186), Y(0)], fill=CAT_COL['work'], outline=(35, 45, 60), width=2)
    dr.text((Z(-36), Y(20)), 'SUBTERRANEAN AUTOMATED INDUSTRIES (0..+28 m)', font=fb, fill=(255, 255, 255))

    # Sunken Park & Reflecting Canal (y = 28, z = -36..182)
    dr.rectangle([Z(-28), Y(35), Z(182), Y(28)], fill=CAT_COL['recreation'], outline=(40, 75, 45), width=2)
    dr.rectangle([Z(-22), Y(29), Z(174), Y(26.2)], fill=WATER_COL)
    dr.text((Z(48), Y(48)), 'SUNKEN CANYON PARK & CANAL (+28 m)', font=fb, fill=(35, 88, 45))

    # Battered Dwellings Wall profile in background (y = 28..232)
    dr.rectangle([Z(-32), Y(232), Z(178), Y(35)], outline=CAT_COL['live'], width=2)
    dr.text((Z(68), Y(142)), 'Battered Dwellings Wall (26 storeys, East side)', font=fm, fill=(155, 72, 52))

    # Vertical Learning & Collection Shaft (z = -38..+18, y = 28..412)
    dr.rectangle([Z(-38), Y(412), Z(18), Y(28)], fill=(236, 224, 206), outline=(55, 50, 44), width=3)
    for bd in P['shaftBands']:
        col = CAT_COL['work'] if bd['role'] == 'learning' else (112, 152, 196)
        dr.rectangle([Z(-32), Y(bd['y1'] - 1.2), Z(15), Y(bd['y0'] + 0.8)], fill=col, outline=(60, 70, 85))
    dr.text((Z(24), Y(165)), 'LEARNING SHAFT (18 tiers)', font=fb, fill=(42, 72, 112))
    dr.text((Z(24), Y(335)), 'COLLECTION SHAFT (18 tiers)', font=fb, fill=(42, 72, 112))

    # Upper Lenticular Eye Cavity, Coffered Dome & Front Amphitheatre Park Fan
    eye_poly = [(Z(0), Y(536)), (Z(-95), Y(512)), (Z(-205), Y(456)), (Z(-58), Y(412)), (Z(28), Y(412)), (Z(36), Y(456))]
    dr.polygon(eye_poly, fill=(78, 68, 58), outline=(45, 40, 35))
    # Coffered Geodesic Apse Dome
    dr.pieslice([Z(-58), Y(512), Z(30), Y(400)], 180, 360, fill=CAT_COL['civic'], outline=(85, 65, 22), width=3)
    dr.text((Z(-48), Y(482)), 'COFFERED DOME', font=fb, fill=(35, 25, 10))
    # Belly Honeycomb
    dr.rectangle([Z(-46), Y(456), Z(32), Y(412)], fill=CAT_COL['live'], outline=(85, 45, 35), width=2)
    # Semicircular Front Amphitheatre Park Fan (z = 18..126, y = 416..454)
    fan_pts = [(Z(18), Y(454)), (Z(126), Y(424)), (Z(126), Y(416)), (Z(18), Y(404))]
    dr.polygon(fan_pts, fill=CAT_COL['recreation'], outline=(40, 75, 45))
    dr.text((Z(42), Y(458)), 'Front Amphitheatre Park Fan', font=fb, fill=(38, 88, 46))

    # Rear Horseshoe Cave Dwellings & Hexagonal Skylight Court (z = -273..-64, y = 456..562)
    dr.rectangle([Z(-158), Y(502), Z(-64), Y(456)], fill=CAT_COL['live'], outline=(85, 45, 35), width=2)
    dr.rectangle([Z(-273), Y(562), Z(-137), Y(464)], fill=(246, 240, 228), outline=(65, 58, 48), width=2)
    dr.rectangle([Z(-268), Y(496), Z(-229), Y(464)], fill=CAT_COL['work'])
    dr.rectangle([Z(-181), Y(496), Z(-142), Y(464)], fill=CAT_COL['work'])
    dr.rectangle([Z(-268), Y(556), Z(-236), Y(496)], fill=CAT_COL['live'])
    dr.rectangle([Z(-174), Y(556), Z(-142), Y(496)], fill=CAT_COL['live'])
    dr.text((Z(-258), Y(576)), 'HEXAGONAL SKYLIGHT COURT (-205 m)', font=fb, fill=(35, 30, 25))

    # Foreground Gorge River & Far Canyon Wall
    dr.rectangle([Z(214), Y(6), Z(520), Y(0)], fill=WATER_COL, outline=(20, 90, 80))
    dr.text((Z(318), Y(22)), 'FOREGROUND GORGE RIVER (+6 m)', font=fb, fill=(22, 102, 92))
    far_pts = [(Z(520), Y(0)), (Z(575), Y(195)), (Z(625), Y(330)), (Z(660), Y(400)), (Z(660), Y(0))]
    dr.polygon(far_pts, fill=(216, 196, 176), outline=(128, 100, 80))
    dr.text((Z(548), Y(148)), 'FAR CANYON WALL', font=fb, fill=(102, 76, 56))

    # Shaft Neck Breach Band (y = 226..264 m)
    for xdash in range(int(Z(-60)), int(Z(190)), 22):
        dr.line([(xdash, Y(245)), (xdash + 12, Y(245))], fill=(195, 42, 42), width=3)
    dr.text((Z(24), Y(256)), 'RUIN NECK BREACH (+226..+264 m)', font=fb, fill=(185, 36, 36))

    dr.line([(ox, H - 28), (ox + 100 * s, H - 28)], fill=(20, 20, 20), width=4)
    dr.text((ox + 100 * s + 12, H - 38), '100 m (1:1 horizontal and vertical scale)', font=fm, fill=(20, 20, 20))
    return img


def draw_modern_sheet(data):
    P, RU, MG, eye_curve = data['plan'], data['ruin'], data['modern'], data['eyeCurve']
    s_map = MG['summary']
    W, H = 2380, 1480
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(34, True), font(19), font(18, True), font(15)

    dr.text((36, 18), 'Slice — Coronal Elevation & Modern Reinhabitation Blueprint (after Soleri 26. Theology)', font=ft, fill=(25, 25, 25))
    dr.text((36, 62), 'East-West Cliff Elevation (looking North): Mid-Shaft Neck Blowout & West Brow Rockfall divide Slice into 3 active modern zones:', font=fs, fill=(60, 56, 52))
    dr.text((36, 90), '1. KEPT EYE & SKYLIGHT SANCTUARY (%d units; sustainable pop ~%s)   2. SUNKEN TRENCH & DWELLINGS TOWN (%d units)   3. ISOLATED WEST (%d units)' % (
        s_map['eye_sanctuary']['units'], format(s_map['eye_sanctuary']['sustainableModernPop'], ','),
        s_map['trench_town']['units'], s_map['isolated_west']['units']), font=fb, fill=(32, 82, 52))

    # Elevation transform: x in [-420, +420], y in [-10, 580]
    s = 2.08
    cx, oy = W // 2, H - 92
    X = lambda x: cx + x * s
    Y = lambda y: oy - y * s

    ZONE_COL = {
        'eye_sanctuary': (136, 198, 132),
        'trench_town': (222, 192, 134),
        'isolated_west': (184, 152, 198),
        'collapsed': (218, 102, 96),
    }

    # Columnar Upper Cliff (y = 220..560) with vertical joint lines!
    dr.rectangle([X(-410), Y(560), X(410), Y(220)], fill=(234, 222, 206), outline=(135, 112, 92), width=2)
    for col_x in range(-392, 400, 28):
        dr.line([(X(col_x), Y(560)), (X(col_x), Y(220))], fill=(196, 180, 162), width=1)

    # Stratified Lower Rock Shoulders (y = 0..220) left and right of central slot!
    dr.rectangle([X(-410), Y(220), X(-52), Y(0)], fill=STRAT_COL, outline=(115, 90, 70), width=2)
    dr.rectangle([X(178), Y(220), X(410), Y(0)], fill=STRAT_COL, outline=(115, 90, 70), width=2)
    for sy in range(12, 220, 14):
        dr.line([(X(-410), Y(sy)), (X(-52), Y(sy))], fill=(166, 140, 118), width=1)
        dr.line([(X(178), Y(sy)), (X(410), Y(sy))], fill=(166, 140, 118), width=1)

    # West Brow Rockfall Scar
    scar_pts = [(X(-360), Y(560)), (X(-225), Y(560)), (X(-245), Y(440)), (X(-355), Y(448))]
    dr.polygon(scar_pts, fill=(240, 196, 188), outline=(195, 48, 44))
    dr.text((X(-368), Y(538)), 'WEST BROW ROCKFALL', font=fb, fill=(185, 40, 36))

    # Subterranean Automated Industries (y = 0..28) & Sunken Park (y = 28)
    dr.rectangle([X(-48), Y(28), X(180), Y(0)], fill=ZONE_COL['trench_town'], outline=(45, 45, 45), width=2)
    dr.text((X(-24), Y(19)), 'AUTOMATED INDUSTRIES (0..+28 m)', font=fb, fill=(35, 30, 25))
    dr.rectangle([X(-28), Y(35), X(132), Y(28)], fill=(96, 168, 98), outline=(35, 70, 38))
    dr.text((X(34), Y(48)), 'SUNKEN PARK (+28 m)', font=fm, fill=(28, 78, 36))

    # Battered 26-Storey Dwellings Wall (x = 132..178 -> 160..178, y = 28..232)
    dw_pts = [(X(132), Y(28)), (X(160), Y(232)), (X(178), Y(232)), (X(178), Y(28))]
    dr.polygon(dw_pts, fill=ZONE_COL['trench_town'], outline=(50, 45, 40))
    for k in range(0, 26, 2):
        yk = 28 + k * (204.0 / 26.0)
        xk = 132 + (160 - 132) * (k / 26.0)
        dr.line([(X(xk), Y(yk)), (X(178), Y(yk))], fill=(120, 100, 75), width=1)
    dr.text((X(136), Y(112)), 'DWELLINGS', font=fm, fill=(30, 25, 20))

    # Diagonal Light-Veil Cables across the Slot
    for vx in range(36, 158, 10):
        t = (vx - 30) / 130.0
        y_top = 104 + t * 124 - 12 * math.sin(t * math.pi)
        dr.line([(X(vx), Y(y_top)), (X(vx), Y(35))], fill=(130, 125, 118), width=1)
    dr.line([(X(30), Y(104)), (X(160), Y(228))], fill=(95, 80, 62), width=3)

    # Vertical Learning & Collection Shaft (x = -30..+30, y = 28..412)
    dr.rectangle([X(-30), Y(226), X(30), Y(28)], fill=ZONE_COL['trench_town'], outline=(40, 40, 40), width=3)
    dr.rectangle([X(-30), Y(264), X(30), Y(226)], fill=ZONE_COL['collapsed'], outline=(185, 38, 38), width=3)
    dr.rectangle([X(-30), Y(412), X(30), Y(264)], fill=ZONE_COL['eye_sanctuary'], outline=(35, 65, 35), width=3)
    for bd in P['shaftBands']:
        dr.line([(X(-26), Y(bd['y0'])), (X(26), Y(bd['y0']))], fill=(70, 70, 70), width=1)
    dr.text((X(-24), Y(152)), 'LEARNING', font=fm, fill=(25, 25, 25))
    dr.text((X(-26), Y(342)), 'COLLECTION', font=fm, fill=(25, 25, 25))
    dr.text((X(38), Y(250)), 'MID-SHAFT NECK BREACH (+226..+264 m)', font=fb, fill=(185, 35, 35))

    # Four Horizontal Side Specimen Caverns & West Bench Pavilion
    for cv in P['caverns']:
        t, ch = cv['tunnel'], cv['chamber']
        zcol = ZONE_COL['trench_town'] if cv['key'] == 'pavilion' else (
            ZONE_COL['isolated_west'] if cv['key'] == 'anthro' else ZONE_COL['eye_sanctuary'])
        dr.rectangle([X(min(t['x0'], t['x1'])), Y(t['y1']), X(max(t['x0'], t['x1'])), Y(t['y0'])],
                     fill=zcol, outline=(50, 50, 50), width=2)
        dr.rectangle([X(ch['x0']), Y(ch['y1']), X(ch['x1']), Y(ch['y0'])],
                     fill=zcol, outline=(45, 45, 45), width=2)
        dr.text((X(ch['x0'] + 4), Y(ch['y0'] - 6)), cv['label'], font=fm, fill=(35, 35, 35))

    # Upper Lenticular "Slice" Eye Silhouette (x = -360..+360, y = 410..536)
    eye_top_pts = [(X(pt[0]), Y(pt[1])) for pt in eye_curve]
    eye_bot_pts = [(X(pt[0]), Y(pt[2])) for pt in reversed(eye_curve)]
    dr.polygon(eye_top_pts + eye_bot_pts, fill=(58, 52, 46), outline=(35, 30, 28))

    # Collapsed West Tip (-360..-262), Isolated West (-262..-56), Kept Sanctuary (-56..+360)
    dr.rectangle([X(-350), Y(472), X(-262), Y(446)], fill=ZONE_COL['collapsed'], outline=(185, 40, 38), width=2)
    dr.rectangle([X(-262), Y(492), X(-56), Y(422)], fill=ZONE_COL['isolated_west'], outline=(75, 55, 85), width=2)
    dr.rectangle([X(-56), Y(496), X(350), Y(414)], fill=ZONE_COL['eye_sanctuary'], outline=(35, 65, 35), width=2)

    # Central Coffered Geodesic Apse Dome (x = -56..+56, y = 456..512)
    dr.pieslice([X(-56), Y(512), X(56), Y(400)], 180, 360, fill=ZONE_COL['eye_sanctuary'], outline=(30, 55, 30), width=3)
    dr.pieslice([X(-44), Y(500), X(44), Y(412)], 180, 360, fill=(218, 176, 84), outline=(70, 52, 20), width=2)
    dr.text((X(-40), Y(476)), 'CITY CENTER', font=fb, fill=(30, 22, 10))
    dr.text((X(-215), Y(474)), 'CULTURAL CENTER', font=fb, fill=(40, 25, 50))
    dr.text((X(175), Y(474)), 'VAULTED LIVING', font=fb, fill=(25, 50, 25))

    # Wild Cascades in Ruin State (Anthro Breach -> West Bench -> Sunken Park)
    dr.line([(X(-118), Y(268)), (X(-118), Y(220)), (X(-40), Y(220)), (X(-40), Y(28))], fill=(42, 178, 220), width=6)
    dr.text((X(-265), Y(244)), '48 m + 192 m WILD CASCADES', font=fb, fill=(20, 112, 158))

    # Plateau Sanctuary Entry Arrow
    dr.line([(X(18), Y(560)), (X(18), Y(512))], fill=(32, 128, 52), width=5)
    dr.text((X(28), Y(544)), 'HEX SKYLIGHT & TRANSIT ENTRY (Kept Sanctuary)', font=fb, fill=(28, 105, 42))

    # Bottom Legend
    lx = 36
    for lbl, c in [('Kept Eye & Skylight Sanctuary (Watered, Defensible)', ZONE_COL['eye_sanctuary']),
                   ('Sunken Canyon Park & Dwellings Town (Gorge-Reachable)', ZONE_COL['trench_town']),
                   ('Isolated West Arcade & Flooded Anthro Cavern', ZONE_COL['isolated_west']),
                   ('Collapsed West Eye Tip & Mid-Shaft Breach', ZONE_COL['collapsed'])]:
        dr.rectangle([lx, H - 46, lx + 24, H - 22], fill=c, outline=(40, 40, 40))
        dr.text((lx + 32, H - 44), lbl, font=fm, fill=(30, 30, 30))
        lx += int(dr.textlength(lbl, font=fm)) + 52
    return img


def write_areas_md(data):
    P, MG = data['plan'], data['modern']
    st = P['stats']
    by_cat = st['byCategory']
    ms = MG['summary']
    lines = [
        '# Slice (Soleri 26. Theology) — Areas, Interior Program & Modern Reinhabitation Table',
        '',
        '*Generated by `slice_plan.py` directly from `../8av0-slice-plan.js` (`[G data]`).*',
        '',
        '## 1. Sheet & Program Summary (Original State, `d = 0`)',
        '',
        '- **Height**: `%d m` plateau rim (`+410..+536 m` Lenticular Eye, `+220 m` Stratified Bench, `+28 m` Sunken Park, `0 m` Automated Industries)',
        '- **Surface Covered**: `%.1f ha` (`83 acres` on Soleri sheet)',
        '- **Population**: **`%s` citizens** (`%d/ha`, matching Soleri sheet `13,000` at `378/ha`)',
        '',
        '| Category | Units | Gross Floor (ha) | Daylight-Lit Floor (ha) | Share of Gross | Capacity / Yield |',
        '|---|---:|---:|---:|---:|---|',
        '| **LIVE** (Eye Honeycomb, Vaulted Living, Cave Arcs, Drums, Battered Wall) | %d | %.2f | %.2f | %.1f%% | **%s residents** |' % (
            by_cat['live']['count'], by_cat['live']['gross'] / 1e4, by_cat['live']['lit'] / 1e4,
            100.0 * by_cat['live']['gross'] / st['grossFloorM2'], format(st['population'], ',')),
        '| **WORK** (Automated Industries, Learning/Collection Shaft, Research, Hex Souk, Transit) | %d | %.2f | %.2f | %.1f%% | **%s workplaces** |' % (
            by_cat['work']['count'], by_cat['work']['gross'] / 1e4, by_cat['work']['lit'] / 1e4,
            100.0 * by_cat['work']['gross'] / st['grossFloorM2'], format(st['jobs'], ',')),
        '| **RECREATION** (Front Amphitheatre Park Fan, Sunken Park, Skylight Courts) | %d | %.2f | %.2f | %.1f%% | **%s visitors** (%.2f ha parks, %d basins) |' % (
            by_cat['recreation']['count'], by_cat['recreation']['gross'] / 1e4, by_cat['recreation']['lit'] / 1e4,
            100.0 * by_cat['recreation']['gross'] / st['grossFloorM2'], format(st['recreationCapacity'], ','), st['openParkHa'], st['pools']),
        '| **CIVIC** (Coffered City Center Dome, Cultural, Museums, Anthro, Meeting Hall, Rotunda) | %d | %.2f | %.2f | %.1f%% | Ecumenical Assembly + Strata Museums |' % (
            by_cat['civic']['count'], by_cat['civic']['gross'] / 1e4, by_cat['civic']['lit'] / 1e4,
            100.0 * by_cat['civic']['gross'] / st['grossFloorM2']),
        '| **TOTAL** | **%d** | **%.2f** | **%.2f** | **100.0%%** | **%s citizens** |' % (
            st['programUnits'], st['grossFloorHa'], st['litFloorHa'], format(st['population'], ',')),
        '',
        '## 2. Modern Condition Breakdown (`d = 1` Ruin -> Reinhabitation Guide)',
        '',
        '| Modern Zone | Units | Original Housing Cap | Irrigated / Garden Area | Modern Role |',
        '|---|---:|---:|---:|---|',
        '| **Kept Eye & Skylight Sanctuary** (`+266..+562 m`, East Cistern) | %d | %s | %.2f ha | **~%s sustainable modern residents**; entered via Hex Skylight & Transit Portals |' % (
            ms['eye_sanctuary']['units'], format(ms['eye_sanctuary']['liveCap'], ','),
            ms['eye_sanctuary']['irrigatedHa'], format(ms['eye_sanctuary']['sustainableModernPop'], ',')),
        '| **Sunken Canyon Park & Dwellings Town** (`0..+232 m`, Gorge Entry) | %d | %s | — | Sheltered canyon park oasis, 26-storey Battered Dwellings Wall & salvage works |' % (
            ms['trench_town']['units'], format(ms['trench_town']['liveCap'], ',')),
        '| **Isolated West Arcade & Anthro Cavern** (`+266..+496 m`, West) | %d | %s | — | Scarred Cultural Center & spring-breached Anthropological Cavern (rope access) |' % (
            ms['isolated_west']['units'], format(ms['isolated_west']['liveCap'], ',')),
        '| **Collapsed West Eye Tip & Shaft Neck** (`x < -262 m`, `+226..+264 m`) | %d | — | — | Fallen honeycomb modules & basalt columns on the `+220 m` bench and shore |' % (
            ms['collapsed']['units']),
        '',
        '## 3. Complete 29-Unit Architectural Schedule',
        '',
        '| ID | Name | Cat | Elev (m) | Gross (m2) | Cap / Jobs | Modern Zone |',
        '|---|---|---|---:|---:|---:|---|',
    ]
    lines[6] = lines[6] % st['height']
    lines[7] = lines[7] % st['surfaceCoveredHa']
    lines[8] = lines[8] % (format(st['population'], ','), st['densityPerHa'])

    mod_by_id = {u['id']: u['zoneState'] for u in MG['units']}
    for u in P['program']:
        cj = ('%d cap' % u['capacity']) if u['category'] == 'live' else ('%d jobs' % u['jobs'])
        lines.append('| `%s` | %s | `%s` | `%d..%d` | %s | %s | `%s` |' % (
            u['id'], u['name'], u['category'], int(u['y0']), int(u['y1']),
            format(u['grossM2'], ','), cj, mod_by_id.get(u['id'], '')))
    lines.append('')
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines))


def main():
    os.makedirs(OUT, exist_ok=True)
    data = load_data()
    draw_levels_sheet(data).save(os.path.join(OUT, 'plan_levels.png'))
    draw_section_sheet(data).save(os.path.join(OUT, 'section_ns.png'))
    draw_modern_sheet(data).save(os.path.join(OUT, 'modern_condition.png'))
    write_areas_md(data)
    print('wrote sheets/plan_levels.png, sheets/section_ns.png, sheets/modern_condition.png, and AREAS.md')


if __name__ == '__main__':
    main()
