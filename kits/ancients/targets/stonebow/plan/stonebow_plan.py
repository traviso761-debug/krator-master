#!/usr/bin/env python3
"""Stonebow architectural blueprint & interior floorplate generator.

Reads the live [G data] records directly from 8av0-stonebow-plan.js, 8av1-stonebow-interiors.js,
and kits/ancients-interiors via Node so the blueprint sheets and area tables can never drift from the 3D build:

  sheets/site-plan.png   1.52 x 1.52 km Ching-Ma Shut-In canyon site plan (highways, U-loops, wings, 9 spine wells, bulkheads)
  sheets/sections.png    True-scale longitudinal east-west section (z = 0) & transverse cross-section (x = 0)
  sheets/interiors.png   Detailed room-by-room floorplates for all 7 interior zones (5 refurbished kept + 2 delving ruins)
  AREAS.md               Zone-by-zone storey & room schedule, lit vs deep-vault m2, intact vs refurbished population
  BLUEPRINT.md           Settlement centerpiece architectural & delving-zone guide
"""
import json
import math
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'


def font(size, bold=False):
    names = ['arialbd.ttf', 'DejaVuSans-Bold.ttf'] if bold else ['arial.ttf', 'DejaVuSans.ttf']
    for name in names:
        try:
            return ImageFont.truetype(FONT_DIR + name, size)
        except OSError:
            pass
    return ImageFont.load_default()


JS_DUMP = r"""
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.argv[1];
const TARGET = path.join(ROOT, 'kits', 'ancients', 'targets', 'stonebow');
const AI_KIT = path.join(ROOT, 'kits', 'ancients-interiors');
const CACHE = path.join(AI_KIT, 'tools', '.cache');

global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
global.document = {
  createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }), width: 0, height: 0 })
};
(0, eval)(
  fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(CACHE, 'fb.js'), 'utf8') + ';\n' +
  fs.readFileSync(path.join(CACHE, 'ib.js'), 'utf8') + ';\n' +
  'global.KF = KratorFurniture; global.IX = KratorInteriors;\n'
);
const aiCore = fs.readdirSync(path.join(AI_KIT, 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort();
(0, eval)(aiCore.map(f => fs.readFileSync(path.join(AI_KIT, 'src', f), 'utf8')).join('\n') + ';\nglobal.AI = KratorAncientsInteriors;\n');
AI.install(IX);

(0, eval)(
  fs.readFileSync(path.join(TARGET, '8av0-stonebow-plan.js'), 'utf8') + ';\nglobal.STONEBOW = STONEBOW;\n' +
  fs.readFileSync(path.join(TARGET, '8av1-stonebow-interiors.js'), 'utf8') + ';\nglobal.STONEBOW_INT = STONEBOW_INT;\n'
);

const P = STONEBOW.plan({ seed: 12400 });
const RF = STONEBOW.refurb(P);
const RU = STONEBOW.ruin(P);

// Sample analytical curves for accurate section & canyon rendering
const riverPts = [];
const wallW0 = [], wallE0 = [], wallWRim = [], wallERim = [];
for (let z = -760; z <= 760; z += 20) {
  riverPts.push([STONEBOW.riverX(z), z, STONEBOW.riverW(z)]);
  wallW0.push([STONEBOW.canyonWallX(-1, z, 0), z]);
  wallE0.push([STONEBOW.canyonWallX(1, z, 0), z]);
  wallWRim.push([STONEBOW.canyonWallX(-1, z, P.dim.RY), z]);
  wallERim.push([STONEBOW.canyonWallX(1, z, P.dim.RY), z]);
}
const bowProfile = [], archProfile = [], canyonSecZ0 = [];
for (let x = -760; x <= 760; x += 8) {
  bowProfile.push([x, STONEBOW.bowTop(x)]);
  archProfile.push([x, STONEBOW.archSoffit(x)]);
  canyonSecZ0.push([x, STONEBOW.groundAt(x, 0)]);
}

AI.KIT.stonebowKept = STONEBOW_INT.entryRefurbKept(AI);
AI.KIT.stonebowDelve = STONEBOW_INT.entryRefurbDelve(AI);
const keptPlan = AI.kitPlan('stonebowKept', 0, { place: '0,0' });
const delvePlan = AI.kitPlan('stonebowDelve', 1, { place: '0,0' });
const allBuildings = keptPlan.buildings.concat(delvePlan.buildings).map(b => ({
  id: b.id, area: b.area, name: b.name, delve: !!b.delve,
  storeys: b.storeys.map(st => ({
    id: st.id, level: st.level, y: st.y, h: st.h, outline: st.outline,
    rooms: st.rooms.map(r => ({
      id: r.id, kind: r.kind, recipe: r.recipe || null, poly: r.poly, doors: r.doors || []
    })),
    walls: st.walls.map(w => ({ pts: w.pts, broken: !!w.broken, door: w.door || null }))
  }))
}));

process.stdout.write(JSON.stringify({
  site: STONEBOW.SITE, dim: P.dim, plan: P, refurb: RF, ruin: RU,
  riverPts, wallW0, wallE0, wallWRim, wallERim, bowProfile, archProfile, canyonSecZ0,
  zones: allBuildings
}));
"""


def load_data():
    r = subprocess.run(['node', '-e', JS_DUMP, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def wrap_text(dr, xy, text, f, maxw, fill=(55, 62, 70), lh=24):
    x, y = xy
    line = ''
    for w in text.split():
        cand = (line + ' ' + w).strip()
        if dr.textlength(cand, font=f) > maxw and line:
            dr.text((x, y), line, font=f, fill=fill)
            y += lh
            line = w
        else:
            line = cand
    if line:
        dr.text((x, y), line, font=f, fill=fill)
        y += lh
    return y


def poly_area(pts):
    if not pts or len(pts) < 3:
        return 0.0
    a = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return abs(a) * 0.5


def draw_site_plan(D):
    W, H = 1800, 1740
    img = Image.new('RGB', (W, H), (247, 245, 239))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(34, True), font(19), font(17, True), font(15)

    dr.text((40, 22), 'STONEBOW — Canyon-Bridge Site Plan (Ching-Ma Porphyry Shut-In, 5.1 px 1196, 179)', font=ft, fill=(24, 28, 34))
    st = D['plan']['stats']
    rf = D['refurb']['stats']
    wrap_text(
        dr, (40, 68),
        'Paolo Soleri "21. Stonebow" across the 900 m Ching-Ma gorge where the Ancient Outland Gate Highway enters the Ria Valley. '
        'Covered surface: %.1f ha | Span: %d m | Crown: +%d m above rim (%d m total height) | Peak: %s | Refurbished centerpiece: %s.'
        % (st['coveredHa'], st['spanM'], st['heightAboveRimM'], st['totalHeightM'],
           format(st['intactPop'], ','), format(rf['refurbPop'], ',')),
        fs, W - 80
    )

    ox, oy = W // 2, 910
    sc = 1.02  # px per metre (1520 m -> 1550 px)
    X = lambda x: ox + x * sc
    Y = lambda z: oy + z * sc

    # Plateau & canyon tint bands
    dr.rectangle([X(-780), Y(-760), X(780), Y(760)], fill=(231, 224, 208), outline=(160, 152, 138), width=2)
    canyon_rim_poly = [(X(p[0]), Y(p[1])) for p in D['wallWRim']] + [(X(p[0]), Y(p[1])) for p in reversed(D['wallERim'])]
    dr.polygon(canyon_rim_poly, fill=(198, 174, 156), outline=(132, 98, 82))
    canyon_flr_poly = [(X(p[0]), Y(p[1])) for p in D['wallW0']] + [(X(p[0]), Y(p[1])) for p in reversed(D['wallE0'])]
    dr.polygon(canyon_flr_poly, fill=(184, 198, 172), outline=(118, 132, 108))

    # River channel & cataract
    riv_l = [(X(rx - rw * 0.5), Y(rz)) for rx, rz, rw in D['riverPts']]
    riv_r = [(X(rx + rw * 0.5), Y(rz)) for rx, rz, rw in reversed(D['riverPts'])]
    dr.polygon(riv_l + riv_r, fill=(76, 144, 166), outline=(48, 102, 124))
    rx_cat = D['riverPts'][10][0]
    dr.line([(X(rx_cat - 22), Y(-568)), (X(rx_cat + 22), Y(-568))], fill=(235, 248, 252), width=5)
    dr.text((X(rx_cat + 28), Y(-578)), 'Ching-Ma Cataract (33.4 m drop)', font=fm, fill=(32, 82, 104))

    P = D['plan']
    # Cut-and-cover delving rim vaults (shaded slate-purple behind bulkheads)
    for v in P['vaults']:
        dr.rectangle([X(v['x0']), Y(v['z0']), X(v['x1']), Y(v['z1'])], fill=(166, 158, 174), outline=(92, 84, 104), width=1)

    # Splayed neighborhood wings & circular amphitheater bowls
    for wg in P['wings']:
        is_ruin_wing = wg['tag'] == 'ne'
        wcol = (188, 178, 172) if is_ruin_wing else (228, 198, 152)
        dr.polygon([(X(p[0]), Y(p[1])) for p in wg['poly']], fill=wcol, outline=(88, 74, 58), width=2)
        for bw in wg['bowls']:
            r = bw['r'] * sc
            dr.ellipse([X(bw['cx']) - r, Y(bw['cz']) - r, X(bw['cx']) + r, Y(bw['cz']) + r],
                       fill=(172, 204, 154) if not is_ruin_wing else (164, 168, 158), outline=(74, 88, 66), width=2)
        lx = X(wg['sx'] * 535) - 95
        ly = Y(wg['sz'] * 248) - 8
        dr.text((lx, ly), wg['name'] + (' [sealed ruin]' if is_ruin_wing else ' [kept]'), font=fm, fill=(45, 40, 35))

    # Semicircular U-loops & Twin Outland Gate Highways
    for ul in P['uloops']:
        r_out = (ul['r'] + ul['w'] * 0.5) * sc
        r_in = (ul['r'] - ul['w'] * 0.5) * sc
        a0, a1 = (-90, 90) if ul['sx'] > 0 else (90, 270)
        dr.pieslice([X(ul['cx']) - r_out, Y(ul['cz']) - r_out, X(ul['cx']) + r_out, Y(ul['cz']) + r_out], a0, a1, fill=(92, 98, 106))
        dr.pieslice([X(ul['cx']) - r_in, Y(ul['cz']) - r_in, X(ul['cx']) + r_in, Y(ul['cz']) + r_in], a0, a1, fill=(231, 224, 208))

    for hw in P['highways']:
        dr.rectangle([X(hw['x0']), Y(hw['z'] - hw['w'] * 0.5), X(hw['x1']), Y(hw['z'] + hw['w'] * 0.5)],
                     fill=(88, 94, 102), outline=(48, 52, 58))
    dr.text((X(-745), Y(-148)), '<- Outland Gate Highway (West to Outlands)', font=fb, fill=(48, 52, 58))
    dr.text((X(385), Y(-148)), 'Outland Gate Highway (East into Ria Valley) ->', font=fb, fill=(48, 52, 58))

    # Suspended Tourist Center & Upper Living-Working Bow
    tc = P['tourist']
    dr.rectangle([X(tc['x0']), Y(tc['z0'] - 16), X(tc['x1']), Y(tc['z1'] + 16)], outline=(44, 116, 136), width=2)
    dr.rectangle([X(-378), Y(-94), X(378), Y(94)], fill=(238, 214, 170), outline=(92, 68, 42), width=3)
    cr = P['crown']
    dr.rectangle([X(cr['x0']), Y(cr['z0']), X(cr['x1']), Y(cr['z1'])], fill=(246, 232, 194), outline=(142, 86, 36), width=3)

    # 9 Spine Light Wells & Twin Rosette Oculi
    for wl in P['wells']:
        if wl['kind'] == 'rosette':
            r = wl['r'] * sc
            dr.ellipse([X(wl['x']) - r, Y(wl['z']) - r, X(wl['x']) + r, Y(wl['z']) + r],
                       fill=(164, 216, 224), outline=(46, 118, 102), width=3)
        else:
            dr.rectangle([X(wl['x'] - wl['w'] * 0.5), Y(wl['z'] - wl['d'] * 0.5),
                          X(wl['x'] + wl['w'] * 0.5), Y(wl['z'] + wl['d'] * 0.5)],
                         fill=(204, 234, 244), outline=(64, 98, 116), width=2)

    # 4 Twin-Shaft Gate Pylons & Sealed Delving Bulkheads
    for py in P['pylons']:
        dr.rectangle([X(py['x'] - py['w0'] * 0.5), Y(py['z'] - py['d0'] * 0.5),
                      X(py['x'] + py['w0'] * 0.5), Y(py['z'] + py['d0'] * 0.5)],
                     fill=(124, 76, 58), outline=(42, 26, 20), width=2)
        for sh in py['shafts']:
            rr = sh['r'] * sc
            dr.ellipse([X(sh['x']) - rr, Y(sh['z']) - rr, X(sh['x']) + rr, Y(sh['z']) + rr], fill=(238, 232, 222), outline=(40, 40, 40))

    for bh in P['bulkheads']:
        bx = X(bh['x'])
        dr.line([(bx, Y(-98)), (bx, Y(98))], fill=(196, 42, 36), width=5)
        dr.text((bx - 76, Y(102)), 'SEALED BULKHEAD', font=fb, fill=(182, 34, 28))

    dr.text((X(-78), Y(56)), 'CULTURAL CENTER CROWN', font=fb, fill=(112, 62, 22))
    dr.text((X(-520), Y(-8)), 'WEST DELVING VAULTS', font=fb, fill=(68, 56, 82))
    dr.text((X(442), Y(-8)), 'EAST DELVING VAULTS', font=fb, fill=(68, 56, 82))

    # Scale bar & Legend
    bx, by = 50, H - 46
    dr.line([(bx, by), (bx + 200 * sc, by)], fill=(20, 20, 20), width=4)
    dr.line([(bx, by - 6), (bx, by + 6)], fill=(20, 20, 20), width=3)
    dr.line([(bx + 200 * sc, by - 6), (bx + 200 * sc, by + 6)], fill=(20, 20, 20), width=3)
    dr.text((bx + 200 * sc + 12, by - 10), '200 m   (North -z up, East +x right)', font=fb, fill=(20, 20, 20))
    return img


def draw_sections_sheet(D):
    W, H = 1860, 1460
    img = Image.new('RGB', (W, H), (249, 247, 242))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(32, True), font(18), font(17, True), font(14)

    dr.text((40, 20), 'STONEBOW — Longitudinal Section (z = 0) & Gorge Cross-Section (x = 0) [True 1:1 Scale]', font=ft, fill=(24, 28, 34))
    wrap_text(
        dr, (40, 64),
        'Top: East-West longitudinal section across the 900 m Ching-Ma Porphyry Shut-In showing the eye-shaped central canyon void, '
        'suspended Tourist Center (+168..198 m), City Center compression arch (+292..420 m), Living-Working Bow, Cultural Center Skylight Crown (+570 m), '
        'and sealed delving rim vaults. Bottom: North-South transverse cross-section at midspan (x = 0). No vertical exaggeration.',
        fs, W - 80
    )

    # ---- Top Panel: Longitudinal Section (x = -760..+760, y = 0..600) ----
    sc = 1.08
    ox, base_y = 660 + 210, 790
    X = lambda x: ox + x * sc
    Y = lambda y: base_y - y * sc

    # Sky backdrop for longitudinal section
    dr.rectangle([X(-760), Y(605), X(760), Y(0)], fill=(234, 241, 246), outline=(180, 188, 196))

    # Canyon ground section polygon (stratified porphyry base y < 155 + dolomite upper y >= 155)
    sec_pts = D['canyonSecZ0']
    rock_poly = [(X(-760), Y(0))] + [(X(x), Y(y)) for x, y in sec_pts] + [(X(760), Y(0))]
    dr.polygon(rock_poly, fill=(214, 198, 174), outline=(112, 92, 74))
    porph_poly = [(X(-760), Y(0))] + [(X(x), Y(min(155, y))) for x, y in sec_pts] + [(X(760), Y(0))]
    dr.polygon(porph_poly, fill=(168, 108, 96))

    # River at canyon throat
    dr.rectangle([X(-22), Y(3.5), X(22), Y(0)], fill=(58, 132, 158))

    P = D['plan']
    # Deep delving rim vaults (purple-grey) & Mechanical roots
    for v in P['vaults']:
        dr.rectangle([X(v['x0']), Y(v['y1']), X(v['x1']), Y(v['y0'])], fill=(164, 156, 174), outline=(88, 78, 98))
    for mr in P['mechRoots']:
        dr.rectangle([X(mr['x0']), Y(mr['y1']), X(mr['x1']), Y(mr['y0'])], fill=(154, 146, 164), outline=(78, 70, 88))

    # Diagonal cliff box-struts & stepped canyon cantilevers
    for st in P['struts']:
        a, b = st['a'], st['b']
        dr.line([(X(a[0]), Y(a[1])), (X(b[0]), Y(b[1]))], fill=(104, 96, 88), width=5)
    for ct in P['cantilevers']:
        dr.rectangle([X(ct['x0']), Y(ct['y1']), X(ct['x1']), Y(ct['y0'])], fill=(224, 204, 168), outline=(92, 76, 56))

    # Vertical gorge lifts
    for lf in P['park']['lifts']:
        dr.rectangle([X(lf['x'] - 5), Y(lf['y1']), X(lf['x'] + 5), Y(lf['y0'])], fill=(180, 212, 224), outline=(72, 98, 112))

    # Suspended Tourist Center + Refurbished Stabilizer Cables
    tc = P['tourist']
    dr.rectangle([X(tc['x0']), Y(tc['y1']), X(tc['x1']), Y(tc['y0'])], fill=(238, 212, 164), outline=(112, 74, 38), width=2)
    for cb in D['refurb']['stabilizerCables']:
        if cb['a'][2] > 0:
            dr.line([(X(cb['a'][0]), Y(cb['a'][1])), (X(cb['b'][0]), Y(cb['b'][1]))], fill=(56, 72, 88), width=2)

    # Main City Center Compression Arch & Concourse
    arch_pts = [(X(x), Y(y)) for x, y in D['archProfile'] if abs(x) <= 412]
    arch_poly = [(X(-412), Y(420))] + arch_pts + [(X(412), Y(420))]
    dr.polygon(arch_poly, fill=(232, 206, 162), outline=(96, 72, 46))

    # Upper Bow Megatruss & Spine Light Wells
    bow_pts = [(X(x), Y(y)) for x, y in D['bowProfile'] if abs(x) <= 378]
    bow_poly = [(X(-378), Y(420))] + bow_pts + [(X(378), Y(420))]
    dr.polygon(bow_poly, fill=(244, 224, 182), outline=(104, 74, 42))
    for tr in P['trusses']:
        if tr['sz'] > 0:
            dr.line([(X(tr['xa']), Y(tr['ya0'])), (X(tr['xb']), Y(tr['yb1']))], fill=(138, 116, 92), width=2)
            dr.line([(X(tr['xb']), Y(tr['yb0'])), (X(tr['xa']), Y(tr['ya1']))], fill=(138, 116, 92), width=2)
    for wl in P['wells']:
        dr.rectangle([X(wl['x'] - wl['w'] * 0.5), Y(wl['y1']), X(wl['x'] + wl['w'] * 0.5), Y(wl['y0'])],
                     fill=(212, 238, 248), outline=(96, 132, 152))

    # Cultural Center Skylight Crown
    cr = P['crown']
    dr.rectangle([X(cr['x0']), Y(536), X(cr['x1']), Y(cr['y0'])], fill=(248, 234, 192), outline=(138, 82, 34), width=2)
    dr.pieslice([X(-52), Y(570), X(52), Y(538)], 180, 360, fill=(166, 222, 236), outline=(64, 118, 138))

    # Sealed Bulkhead lines
    for sx in (-1, 1):
        bx = X(sx * 418)
        dr.line([(bx, Y(336)), (bx, Y(424))], fill=(196, 38, 32), width=4)

    # Section annotations
    dr.text((X(-98), Y(592)), 'CULTURAL CENTER CROWN (+570 m)', font=fb, fill=(118, 64, 24))
    dr.text((X(-82), Y(408)), 'CITY CENTER ARCH (+388..420 m)', font=fm, fill=(72, 52, 32))
    dr.text((X(-95), Y(292)), 'EYE-SHAPED CANYON VOID', font=fb, fill=(76, 96, 112))
    dr.text((X(-106), Y(188)), 'SUSPENDED TOURIST CENTER (+168..198 m)', font=fm, fill=(88, 54, 24))
    dr.text((X(-62), Y(26)), 'CHING-MA PARK (0 m = 1,215 m ASL)', font=fm, fill=(32, 78, 96))
    dr.text((X(-685), Y(384)), 'WEST DELVING VAULTS (sealed)', font=fb, fill=(72, 56, 88))
    dr.text((X(455), Y(384)), 'EAST DELVING VAULTS (sealed)', font=fb, fill=(72, 56, 88))

    # ---- Bottom Panel: Transverse Cross-Section at Midspan (x = 0, z = -180..+180, y = 150..585) ----
    sc2 = 1.15
    ox2, base2 = W // 2, H - 55
    Z2 = lambda z: ox2 + z * sc2
    Y2 = lambda y: base2 - (y - 140) * sc2

    dr.text((40, 828), 'Transverse Midspan Cross-Section (x = 0, looking East): Twin Highways (z = +/-118 m), Bow Spine & Suspended Tourist Center', font=fb, fill=(28, 32, 38))
    dr.rectangle([Z2(-220), Y2(585), Z2(220), Y2(145)], fill=(236, 242, 246), outline=(180, 188, 196))
    # Twin Highway viaducts at z = +/-118, y = 415.5..420
    for sz in (-1, 1):
        dr.rectangle([Z2(sz * 118 - 12), Y2(420), Z2(sz * 118 + 12), Y2(415.5)], fill=(88, 94, 102), outline=(40, 44, 48))
        dr.text((Z2(sz * 118 - 44), Y2(438)), ('North' if sz < 0 else 'South') + ' Highway', font=fm, fill=(44, 48, 54))
    # City Center & Upper Bow cross-section trapezoid
    bow_xsec = [(Z2(-94), Y2(388)), (Z2(-94), Y2(420)), (Z2(-52), Y2(536)), (Z2(52), Y2(536)), (Z2(94), Y2(420)), (Z2(94), Y2(388))]
    dr.polygon(bow_xsec, fill=(242, 220, 178), outline=(98, 72, 42))
    # Central Light Well shaft + Crown Skylight
    dr.rectangle([Z2(-18), Y2(536), Z2(18), Y2(420)], fill=(212, 238, 248), outline=(88, 124, 144))
    dr.pieslice([Z2(-28), Y2(570), Z2(28), Y2(538)], 180, 360, fill=(166, 222, 236), outline=(64, 118, 138))
    # Suspended Tourist Center below at y = 168..198
    dr.rectangle([Z2(-54), Y2(198), Z2(54), Y2(168)], fill=(238, 212, 164), outline=(112, 74, 38), width=2)
    dr.text((Z2(-72), Y2(216)), 'Tourist Center (108 m wide)', font=fm, fill=(88, 54, 24))

    # Elevation ruler on right
    for elev in [168, 292, 420, 496, 570]:
        dr.line([(Z2(225), Y2(elev)), (Z2(240), Y2(elev))], fill=(80, 80, 80), width=2)
        dr.text((Z2(246), Y2(elev) - 8), '+%d m' % elev, font=fm, fill=(60, 60, 60))

    return img


ROOM_COLORS = {
    'hall': (244, 218, 166),
    'bedroom': (196, 224, 188),
    'dormitory': (182, 214, 198),
    'study': (186, 212, 236),
    'library': (170, 198, 232),
    'kitchen': (242, 192, 164),
    'store': (216, 208, 194),
    'workshop': (198, 188, 214),
    'armoury': (226, 182, 182),
    'barracks': (218, 196, 178),
    'brig': (184, 178, 184),
    'strongroom': (204, 192, 158),
    'sickbay': (192, 232, 224),
    'corridor': (238, 236, 230),
    'core': (146, 152, 160),
}


def draw_interiors_sheet(D):
    W, H = 1920, 1620
    img = Image.new('RGB', (W, H), (250, 249, 245))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(32, True), font(18), font(17, True), font(13)

    dr.text((36, 18), 'STONEBOW — Planned Interior Floorplates Across All 7 Zones (Refurbished Kept vs Delving Ruins)', font=ft, fill=(24, 28, 34))
    wrap_text(
        dr, (36, 62),
        'Generated directly from 8av1-stonebow-interiors.js (kits/ancients-interiors floor plates). Zones 1-5 are whole, glazed & furnished in the '
        'refurbished settlement centerpiece (socketable to any culture via _api.stonebow.socketRefurb); Zones 6-7 lie behind the sealed pylon bulkheads '
        'with broken partitions (red dashed) as deep Automated Industry & Factory delving ruins.',
        fs, W - 72
    )

    zones = D['zones']
    # Layout 7 panels in a 2-column x 4-row grid (with legend in panel 8)
    pw, ph = 900, 340
    for idx, z in enumerate(zones):
        col_i, row_i = idx % 2, idx // 2
        px = 36 + col_i * (pw + 24)
        py = 132 + row_i * (ph + 24)
        bg = (242, 238, 246) if z['delve'] else (245, 248, 242)
        border = (146, 62, 78) if z['delve'] else (74, 118, 78)
        dr.rectangle([px, py, px + pw, py + ph], fill=bg, outline=border, width=2)

        # Pick richest representative level (e.g. level 1 in city & vaults-e) and frame to its own extents (NW pylon closeup for pylons)
        pref_lv = 1 if z['area'] in ('city', 'vaults-e') else min(st['level'] for st in z['storeys'])
        rep_storeys = [st for st in z['storeys'] if st['level'] == pref_lv]
        if z['area'] == 'pylons':
            rep_storeys = [st for st in z['storeys'] if '.nw.' in st['id']]
        all_pts = [q for st in rep_storeys for q in st['outline']]
        xs = [q[0] for q in all_pts]
        zs_c = [q[1] for q in all_pts]
        x0, x1 = min(xs), max(xs)
        z0, z1 = min(zs_c), max(zs_c)
        span_x = max(20.0, x1 - x0)
        span_z = max(20.0, z1 - z0)
        sc = min((pw - 56) / span_x, (ph - 84) / span_z)
        cx = px + pw * 0.5
        cy = py + 52 + (ph - 68) * 0.5
        mx, mz = (x0 + x1) * 0.5, (z0 + z1) * 0.5
        TX = lambda x: cx + (x - mx) * sc
        TY = lambda zz: cy + (zz - mz) * sc

        tot_rooms = sum(len(st['rooms']) for st in z['storeys'])
        ys_sorted = sorted(set(int(st['y']) for st in z['storeys']))
        badge = 'DELVING RUIN (sealed socket)' if z['delve'] else 'REFURBISHED KEPT (furnished)'
        shown_note = 'NW pylon closeup, x4 pylons' if z['area'] == 'pylons' else ('showing y = %d m plate' % int(rep_storeys[0]['y']))
        dr.text((px + 14, py + 10), '%d. %s  [%s]' % (idx + 1, z['name'], badge), font=fb, fill=border)
        dr.text((px + 14, py + 32), 'Levels y = %s m  |  %d storeys  |  %d planned rooms (%s)' % (
            '/'.join(str(y) for y in ys_sorted), len(ys_sorted), tot_rooms, shown_note), font=fm, fill=(70, 74, 80))

        for st in rep_storeys:
            if len(st['outline']) >= 3:
                dr.polygon([(TX(q[0]), TY(q[1])) for q in st['outline']], fill=(234, 232, 226), outline=(140, 140, 140))
            for r in st['rooms']:
                if not r['poly'] or len(r['poly']) < 3:
                    continue
                rc = ROOM_COLORS.get(r['kind'], (222, 222, 222))
                pts = [(TX(q[0]), TY(q[1])) for q in r['poly']]
                dr.polygon(pts, fill=rc, outline=(96, 96, 96))
                if r['recipe'] and sc * 20 > 24:
                    rcx = sum(p[0] for p in pts) / len(pts)
                    rcy = sum(p[1] for p in pts) / len(pts)
                    dr.text((rcx - 28, rcy - 6), r['recipe'], font=fm, fill=(45, 45, 45))
                for d_door in r['doors']:
                    dx, dz = TX(d_door['at'][0]), TY(d_door['at'][1])
                    dr.ellipse([dx - 2.5, dz - 2.5, dx + 2.5, dz + 2.5], fill=(32, 128, 72))
            for w in st['walls']:
                wpts = [(TX(q[0]), TY(q[1])) for q in w['pts']]
                if len(wpts) >= 2:
                    wcol = (198, 48, 48) if w['broken'] else (42, 46, 52)
                    dr.line(wpts, fill=wcol, width=2)

    # Panel 8: Room Kind Colour Key & Settlement Refurbishment Summary
    lx, ly = 36 + (pw + 24), 132 + 3 * (ph + 24)
    dr.rectangle([lx, ly, lx + pw, ly + ph], fill=(246, 245, 240), outline=(120, 120, 120), width=2)
    dr.text((lx + 16, ly + 12), 'Legend — Room Kinds, Cut-Away Controls & Culture Socket', font=fb, fill=(28, 32, 38))
    items = [
        ('hall', 'Civic / Dining / Gallery / Greenhouse Hall'),
        ('bedroom', 'Dwelling / Guest Suite / Dormitory'),
        ('study', 'Scholar Study / Library / Chart Deck'),
        ('kitchen', 'Kitchen / Crew Mess'),
        ('store', 'Market / Warehouse Store'),
        ('workshop', 'Automated Industry / Engine / Turbine'),
        ('armoury', 'Pylon Guard / Armoury / Barracks'),
        ('core', 'Vertical Lift & Stair Core'),
    ]
    for i, (k, desc) in enumerate(items):
        kx = lx + 20 + (i % 2) * 435
        ky = ly + 48 + (i // 2) * 34
        dr.rectangle([kx, ky, kx + 24, ky + 18], fill=ROOM_COLORS[k], outline=(70, 70, 70))
        dr.text((kx + 34, ky + 1), desc, font=fm, fill=(45, 48, 52))

    wrap_text(
        dr, (lx + 20, ly + 196),
        'Interactive Cut-Away on dist/stonebow.html: choose any of the 7 zones in the "Interior" dropdown, step storeys '
        'with `[` and `]`, press `E` on any refurbished doorway leaf, or call `_api.stonebow.socketRefurb("post-apoc")` '
        'to re-furnish all 5 kept zones for a settlement while leaving `vaults-w` and `vaults-e` as delving ruins.',
        fs, pw - 40, fill=(42, 52, 62), lh=24
    )
    return img


def write_docs(D):
    st = D['plan']['stats']
    rf = D['refurb']['stats']
    zones = D['zones']

    areas_lines = [
        '# Stonebow — Interior Zones & Area Schedule (`AREAS.md`)\n',
        'Generated from [`8av0-stonebow-plan.js`](../8av0-stonebow-plan.js) and [`8av1-stonebow-interiors.js`](../8av1-stonebow-interiors.js).\n',
        '## Macro Arcology Metrics (Soleri *21. Stonebow* vs Krator Build)\n',
        '| Metric | Soleri *21. Stonebow* | Stonebow (`intact`) | Stonebow (`refurbished` centerpiece) |',
        '|---|---|---|---|',
        '| Rim-to-rim canyon span | ~900 m | **%d m** | **%d m** |' % (st['spanM'], rf['spanM']),
        '| Height above canyon rim | 150 m | **%d m** (`y = 420 -> 570 m`) | **%d m** |' % (st['heightAboveRimM'], rf['heightAboveRimM']),
        '| Total structural height | 450 m | **%d m** (`y = 120 -> 570 m`) | **%d m** |' % (st['totalHeightM'], rf['totalHeightM']),
        '| Covered surface (footprint + park) | 129 ha (320 acres) | **%.1f ha** | **%.1f ha** |' % (st['coveredHa'], rf['coveredHa']),
        '| Gross lit residential/civic floor | — | **%s m²** | **%s m²** (kept core) |' % (format(st['litFloorM2'], ','), format(int(round(st['litFloorM2'] * 0.092)), ',')),
        '| Deep cut-and-cover vault floor | — | **%s m²** | **%s m²** (sealed delving ruins) |' % (format(st['deepUnlitM2'], ','), format(st['deepUnlitM2'], ',')),
        '| Resident population | 200,000 | **%s** | **%s** |' % (format(st['intactPop'], ','), format(rf['refurbPop'], ',')),
        '\n## Planned Cut-Away Interior Schedule (`STONEBOW_INT`)\n',
        '| Zone ID | Name | Refurbished State | Elevations `y` (m) | Storeys | Rooms | Sampled Plate Floor (m²) |',
        '|---|---|---|---|---:|---:|---:|',
    ]

    tot_rooms = 0
    tot_plate_m2 = 0.0
    for z in zones:
        ys = sorted(set(int(s['y']) for s in z['storeys']))
        rm_cnt = sum(len(s['rooms']) for s in z['storeys'])
        plate_m2 = sum(poly_area(r['poly']) for s in z['storeys'] for r in s['rooms'] if r['poly'])
        tot_rooms += rm_cnt
        tot_plate_m2 += plate_m2
        state_str = 'Sealed delving ruin (`d=1`, broken walls, socket)' if z['delve'] else 'Kept & furnished (`d=5`, whole walls, `core/door`)'
        areas_lines.append(
            '| `refurb/%s` | %s | %s | `%s` | %d | %d | %s |'
            % (z['area'], z['name'], state_str, ', '.join(str(y) for y in ys), len(ys), rm_cnt, format(int(round(plate_m2)), ','))
        )
    areas_lines.append('| **Total** | **7 cut-away zones** | **5 kept + 2 delving** | `174 .. 520` | **%d** | **%d** | **%s** |\n'
                       % (sum(len( set(int(s['y']) for s in z['storeys'])) for z in zones), tot_rooms, format(int(round(tot_plate_m2)), ',')))

    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(areas_lines))

    bp_lines = [
        '# Stonebow — Architectural & Settlement Centerpiece Blueprint (`BLUEPRINT.md`)\n',
        '## 1. Scale Model `5.1` Canyon Site: Chīng-Mā Porphyry Shut-In\n',
        '- **Coordinates:** `5.1 px (1196, 179)` (`2,000 m/px`, Neo-Ozarks / upper Ria Valley border)',
        '- **River:** Perennial karst-fed river `9109` (*Chīng-Mā* / Clear-Mirror River, `~330 m³/s`) at `1,215 m` ASL (`y = 0`), with a `33.4 m` upstream porphyry cataract at `z = -568 m`',
        '- **Canyon Relief:** `420 m` inner highway gorge rim (`1,635 m` ASL) rising into bilateral `1,938 / 1,960 m` purple-red rhyolite porphyry & Ria Valley cherty dolomite shoulders (`723 m` total gorge relief)',
        '- **Ancient Network Tie-In:** Carries the twin viaducts of the **Outland Gate Highway** (`route: outland` at `1192, 180` in `openworld/net51-gemini.json`) straight across the shut-in into the Ria Valley\n',
        '## 2. Generated Architectural Sheets\n',
        '- [`sheets/site-plan.png`](sheets/site-plan.png) — Full `1.52 × 1.52 km` canyon site plan (twin highways, hairpin U-loops, 4 twin-shaft pylons, 4 splayed wings with circular amphitheater bowls, 9 spine light wells + twin bronze Rosette Oculi, and sealed bulkhead lines)',
        '- [`sheets/sections.png`](sheets/sections.png) — True `1:1` longitudinal section (`z = 0`) and midspan cross-section (`x = 0`) showing the eye-shaped central canyon void, suspended Tourist Center, City Center arch, X-braced Living-Working Bow, and Cultural Center Skylight Crown',
        '- [`sheets/interiors.png`](sheets/interiors.png) — Room-by-room floorplate layouts across all 7 zones (`crown`, `bow`, `city`, `tourist`, `pylons`, `vaults-w`, `vaults-e`)\n',
        '## 3. Hosting Stonebow as an Arcology Settlement Centerpiece\n',
        'Stonebow is built from day one so a Ria Valley, Eternian, or frontier settlement can adopt `(0, 0)` (`buildStonebowRefurb`) directly:\n',
        '1. **Inhabited Core (`~18,500` people):** `refurb/crown`, `refurb/bow`, `refurb/city`, `refurb/tourist`, and `refurb/pylons` have continuous structural floor decks, hollow exterior shells, whole interior partitions with interactive `core/door` leaves, rooftop crop beds & greenhouses (`RF.crops`), tension stabilizer cables, and a salvage-braced truss across the old bay-4 breach.',
        '2. **Sealed Delving Ruins:** `refurb/vaults-w` (Automated Industries) and `refurb/vaults-e` (Factories, Utilities & Cliff Mechanical Roots) are physically isolated behind `stonebow.bulkhead.w` and `stonebow.bulkhead.e` (`STONEBOW.reach` verified in `test-stonebow.js`), retaining broken concrete partitions, rubble, and empty room sockets for expeditions or dungeon delving.',
        '3. **One-Call Culture Socket:** Call `window._api.stonebow.socketRefurb(culture, opts)` (e.g. `"post-apoc"`, `"generic"`, or `"ancient"`) to re-furnish all 5 kept zones on the fly while leaving the delving vaults untouched.\n',
    ]
    with open(os.path.join(HERE, 'BLUEPRINT.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(bp_lines))


def main():
    os.makedirs(OUT, exist_ok=True)
    D = load_data()
    draw_site_plan(D).save(os.path.join(OUT, 'site-plan.png'))
    draw_sections_sheet(D).save(os.path.join(OUT, 'sections.png'))
    draw_interiors_sheet(D).save(os.path.join(OUT, 'interiors.png'))
    write_docs(D)
    print('stonebow_plan.py: wrote sheets/site-plan.png, sheets/sections.png, sheets/interiors.png, AREAS.md, BLUEPRINT.md')


if __name__ == '__main__':
    main()
