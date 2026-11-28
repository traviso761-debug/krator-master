#!/usr/bin/env python3
"""Arckibuz blueprint generator (modeled on kits/ancients/targets/arcpile/plan/arcpile_plan.py).

Reads 8aw0-arckibuz-plan.js and 8aw1-arckibuz-interiors.js live in Node so the sheets and AREAS.md cannot drift from
the model:
  - plan/sheets/general_plan.png       General site plan (gardens, pit, highway, shelter, housing crown)
  - plan/sheets/section_elevation.png  East-West transverse section (120 m vertical section, no exaggeration)
  - plan/sheets/community_cut.png      Community Center pinwheel & council bowl plan + d=3 bulkhead reachability
  - plan/AREAS.md                      Organ-by-organ area, room, and population table
"""
import json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'


def font(size, bold=False):
    for name in ([('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]):
        try:
            return ImageFont.truetype(FONT_DIR + name, size)
        except OSError:
            pass
    return ImageFont.load_default()


JS = r"""
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = process.argv[1];
const ctx = { Math, console, Object, Array, String, Number, Boolean, RegExp, Map, Set, Float32Array, Uint32Array, Int32Array, Uint8Array, Uint16Array };
ctx.globalThis = ctx; ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
for (const f of [
  'kits/interiors/dist/interiors-core.js',
  'kits/ancients-interiors/dist/ancients-interiors-core.js',
  'core/rand/08-core-rand.js',
  'kits/ancients/targets/arckibuz/8aw0-arckibuz-plan.js',
  'kits/ancients/targets/arckibuz/8aw1-arckibuz-interiors.js'
]) {
  const full = path.join(ROOT, f);
  if (fs.existsSync(full)) {
    vm.runInContext(fs.readFileSync(full, 'utf8') +
      '\n;this.ARCKIBUZ=typeof ARCKIBUZ!=="undefined"?ARCKIBUZ:this.ARCKIBUZ;' +
      '\n;this.AKB_INTERIORS=typeof AKB_INTERIORS!=="undefined"?AKB_INTERIORS:this.AKB_INTERIORS;', ctx, { filename: f });
  }
}
const AI = ctx.KratorAncientsInteriors, IX = ctx.KratorInteriors;
AI.install(IX);
AI.KIT.arckibuz = ctx.AKB_INTERIORS.entry(AI);
const P = ctx.ARCKIBUZ.plan();
const cutReach = ctx.ARCKIBUZ.reach(P, ctx.ARCKIBUZ.DORMANT_CUT);
const kp = AI.kitPlan('arckibuz', 0, { place: '0,0' });
const bSummary = kp.buildings.map(b => ({
  id: b.id, name: b.name, area: b.area, storeys: b.storeys.length,
  rooms: b.storeys.reduce((n, st) => n + st.rooms.length, 0),
  sampleRooms: b.storeys[0].rooms.filter(r => r.poly).map(r => ({ kind: r.kind, poly: r.poly })),
  sampleWalls: b.storeys[0].walls.map(w => w.pts)
}));
process.stdout.write(JSON.stringify({
  plan: P,
  reach: [...cutReach],
  buildings: bSummary
}));
"""


def load_data():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def draw_general_plan(data):
    P = data['plan']
    D = P['dim']
    W, H = 1500, 1280
    img = Image.new('RGB', (W, H), (249, 245, 236))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(32, True), font(18), font(16, True), font(14)

    dr.text((36, 22), '15. Arckibuz — General Site & Crown Plan (Soleri Plate 15)', font=ft, fill=(28, 24, 20))
    st = P['stats']
    dr.text((36, 64), 'Excavation: %.2f ha (250x250 m)  |  Height: %.0f m  |  Intact pop: %d  |  Refurbished core: %d (+%d dormant)' %
            (st['coveredHa'], st['height'], st['intactPop'], st['refurbPop'], st['dormantPop']), font=fs, fill=(75, 68, 58))

    s = 2.05
    ox, oy = 740, 680
    X = lambda x: ox + x * s
    Z = lambda z: oy + z * s

    # Polygonal vegetable gardens
    for g in P['gardens']:
        pts = [(X(p[0]), Z(p[1])) for p in g['poly']]
        dr.polygon(pts, fill=(184, 212, 148), outline=(78, 106, 56))
        for bd in g['beds']:
            dr.rectangle([X(bd['x'] - 3.5), Z(bd['z'] - 1.5), X(bd['x'] + 3.5), Z(bd['z'] + 1.5)],
                         fill=(146, 188, 108), outline=(112, 152, 82))
        dr.text((X(g['cx']) - 58, Z(g['cz']) - 8), g['name'].split()[0] + ' Gardens', font=fm, fill=(42, 68, 28))

    # East highway & causeways
    dr.rectangle([X(D['HWY_X'] - 11), Z(-245), X(D['HWY_X'] + 11), Z(245)], fill=(168, 162, 152), outline=(105, 98, 90))
    dr.text((X(D['HWY_X'] - 9), Z(-230)), 'DESERT HIGHWAY', font=fm, fill=(55, 50, 45))

    # 250x250 rim & 228x228 rock-cut pit
    rh, ph = D['RIM_HALF'], D['PIT_HALF']
    dr.rectangle([X(-rh), Z(-rh), X(rh), Z(rh)], fill=(214, 190, 158), outline=(92, 68, 46), width=3)
    dr.rectangle([X(-ph), Z(-ph), X(ph), Z(ph)], fill=(232, 224, 208), outline=(80, 60, 44), width=2)

    # Causeways & bridge
    dr.rectangle([X(-242), Z(-9), X(-48), Z(9)], fill=(212, 206, 194), outline=(90, 84, 76))
    dr.rectangle([X(-2), Z(44), X(14), Z(242)], fill=(212, 206, 194), outline=(90, 84, 76))
    dr.rectangle([X(88), Z(-11), X(176), Z(11)], fill=(212, 206, 194), outline=(90, 84, 76))

    # Stepped Promenade (NE sunken court)
    for ps in reversed(P['promenadeSteps']):
        dr.rectangle([X(ps['x0']), Z(ps['z0']), X(ps['x1']), Z(ps['z1'])], fill=(182, 174, 160), outline=(110, 102, 92))
        dr.rectangle([X(ps['eastX0']), Z(ps['z1']), X(ps['x1']), Z(ps['eastZ1'])], fill=(182, 174, 160), outline=(110, 102, 92))
    dr.text((X(18), Z(-82)), 'STEPPED PROMENADE', font=fm, fill=(65, 60, 52))

    # Subterranean Shelter & tunnel
    sh = D['SHELTER']
    dr.rectangle([X(sh['tunnelX0']), Z(-5), X(sh['tunnelX1']), Z(5)], fill=(210, 196, 178), outline=(110, 96, 82))
    dr.rectangle([X(sh['cx'] - sh['hx']), Z(sh['cz'] - sh['hz']), X(sh['cx'] + sh['hx']), Z(sh['cz'] + sh['hz'])],
                 fill=(226, 212, 190), outline=(80, 64, 48), width=2)
    r_sh = sh['shaftRTop'] * s
    dr.ellipse([X(sh['cx']) - r_sh, Z(sh['cz']) - r_sh, X(sh['cx']) + r_sh, Z(sh['cz']) + r_sh],
               fill=(165, 206, 220), outline=(55, 85, 98), width=2)
    dr.text((X(sh['cx'] - 24), Z(sh['cz'] + 22)), 'SHELTER', font=fb, fill=(50, 42, 34))

    # Cantilever deck & Sun-breaker louver wings
    dr.rectangle([X(-D['LOUV_OUT_X']), Z(-D['LOUV_HZ']), X(-D['HOUS_OUT_X']), Z(D['LOUV_HZ'])],
                 fill=(218, 198, 162), outline=(95, 80, 58), width=2)
    dr.rectangle([X(D['HOUS_OUT_X']), Z(-D['LOUV_HZ']), X(D['LOUV_OUT_X']), Z(D['LOUV_HZ'])],
                 fill=(218, 198, 162), outline=(95, 80, 58), width=2)

    # 4 Housing quadrants & Sky Court
    for b in P['blocks']:
        if not b['id'].startswith('housing-'):
            continue
        col = (228, 188, 166) if b['dormant'] else (238, 224, 192)
        dr.rectangle([X(b['x0']), Z(b['z0']), X(b['x1']), Z(b['z1'])], fill=col, outline=(62, 54, 44), width=2)
    dr.rectangle([X(-D['SKY_HX']), Z(-D['SKY_HZ']), X(D['SKY_HX']), Z(D['SKY_HZ'])],
                 fill=(244, 240, 228), outline=(90, 82, 70), width=2)
    dr.text((X(-28), Z(-6)), 'PUBLIC SKY COURT', font=fb, fill=(68, 60, 50))

    # Water Reservoir on NE shoulder
    rs = D['RESERVOIR']
    dr.rectangle([X(rs['x0']), Z(rs['z0']), X(rs['x1']), Z(rs['z1'])],
                 fill=(122, 178, 204), outline=(36, 76, 98), width=3)
    dr.text((X(rs['x0'] + 2), Z((rs['z0'] + rs['z1']) * 0.5 - 6)), 'RESERVOIR', font=fm, fill=(20, 48, 66))

    # Scale bar
    bx, by = 50, H - 45
    dr.line([(bx, by), (bx + 100 * s, by)], fill=(30, 30, 30), width=4)
    dr.text((bx + 100 * s + 12, by - 10), '100 m (East +x right, South +z down)', font=fb, fill=(30, 30, 30))
    return img


def draw_section(data):
    P = data['plan']
    D = P['dim']
    W, H = 1560, 760
    img = Image.new('RGB', (W, H), (250, 247, 240))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(30, True), font(17), font(15, True), font(13)

    dr.text((36, 20), '15. Arckibuz — Transverse Section (East-West, 1:1 Vertical Scale, Height = 120.0 m)', font=ft, fill=(28, 24, 20))
    dr.text((36, 58), 'Cut through Subterranean Crop Processing & Storage, Shelter Tunnel & Shaft, City Center, Council Bowl, Housing Crown, Tent Canopies & Reservoir.',
            font=fs, fill=(75, 68, 58))

    s = 2.75
    ox, base = 740, 660
    X = lambda x: ox + x * s
    Y = lambda y: base - y * s

    # Desert rock mass outside pit & below pit
    ph = D['PIT_HALF']
    dr.rectangle([40, Y(D['RIM_Y']), X(-ph), Y(-8)], fill=(214, 176, 138), outline=(120, 88, 58), width=2)
    dr.rectangle([X(ph), Y(D['RIM_Y']), W - 40, Y(-8)], fill=(214, 176, 138), outline=(120, 88, 58), width=2)
    dr.rectangle([X(-ph), Y(0.2), X(ph), Y(-8)], fill=(198, 160, 124), outline=(120, 88, 58))

    # Highway notch in east mesa
    dr.rectangle([X(D['HWY_X'] - 12), Y(D['RIM_Y'] + 2), X(D['HWY_X'] + 12), Y(D['HWY_Y'])], fill=(250, 247, 240))
    dr.line([(X(D['HWY_X'] - 12), Y(D['HWY_Y'])), (X(D['HWY_X'] + 12), Y(D['HWY_Y']))], fill=(80, 80, 80), width=3)

    # Subterranean pit base (3 levels)
    dr.rectangle([X(-84), Y(14.2), X(84), Y(0.2)], fill=(230, 222, 206), outline=(65, 58, 50), width=2)
    for y_st in (4.8, 9.3):
        dr.line([(X(-84), Y(y_st)), (X(84), Y(y_st))], fill=(110, 102, 92), width=2)

    # Shelter tunnel, chamber & flared light shaft
    sh = D['SHELTER']
    dr.rectangle([X(84), Y(5.0), X(sh['cx'] - sh['hx']), Y(0.5)], fill=(236, 228, 212), outline=(80, 70, 58), width=2)
    dr.rectangle([X(sh['cx'] - sh['hx']), Y(sh['y1']), X(sh['cx'] + sh['hx']), Y(sh['y0'])],
                 fill=(238, 232, 218), outline=(65, 58, 50), width=2)
    shaft_pts = [
        (X(sh['cx'] - sh['shaftR0']), Y(sh['y1'])),
        (X(sh['cx'] - sh['shaftRMin']), Y(20)),
        (X(sh['cx'] - sh['shaftRTop']), Y(sh['shaftY1'])),
        (X(sh['cx'] + sh['shaftRTop']), Y(sh['shaftY1'])),
        (X(sh['cx'] + sh['shaftRMin']), Y(20)),
        (X(sh['cx'] + sh['shaftR0']), Y(sh['y1']))
    ]
    dr.polygon(shaft_pts, fill=(244, 246, 248), outline=(70, 62, 54))
    dr.text((X(sh['cx'] - 15), Y(6.5)), 'SHELTER', font=fb, fill=(45, 38, 30))

    # Mega-cores rising through pit & court
    dr.rectangle([X(-45), Y(95.1), X(-31), Y(0.2)], fill=(208, 200, 186), outline=(80, 72, 64))
    dr.rectangle([X(31), Y(95.1), X(45), Y(0.2)], fill=(208, 200, 186), outline=(80, 72, 64))
    dr.text((X(-81), Y(7.5)), 'CROP PROCESSING', font=fm, fill=(45, 38, 30))
    dr.text((X(-24), Y(7.5)), 'STORAGE & PRODUCTION', font=fm, fill=(45, 38, 30))

    # City Center & Community tier + Council Bowl
    dr.rectangle([X(-48), Y(38.0), X(48), Y(22.0)], fill=(234, 226, 208), outline=(60, 52, 44), width=2)
    dr.text((X(-24), Y(31.5)), 'CITY CENTER', font=fb, fill=(45, 38, 30))
    dr.rectangle([X(-64), Y(53.0), X(64), Y(38.0)], fill=(224, 234, 214), outline=(60, 52, 44), width=2)
    dr.polygon([(X(-23.5), Y(38.4)), (X(-7.5), Y(35.6)), (X(7.5), Y(35.6)), (X(23.5), Y(38.4))],
               fill=(196, 188, 172), outline=(80, 72, 64))
    dr.text((X(-22), Y(48.0)), 'COMMUNITY', font=fb, fill=(38, 56, 36))

    # Cantilevered Sky Promenade, Housing Crown & Sun-Breaker Louver Wings
    dr.rectangle([X(-88), Y(55.5), X(88), Y(53.0)], fill=(198, 190, 176), outline=(55, 48, 40), width=2)
    dr.rectangle([X(-74), Y(95.1), X(-36), Y(55.5)], fill=(240, 230, 204), outline=(55, 48, 40), width=2)
    dr.rectangle([X(36), Y(95.1), X(74), Y(55.5)], fill=(232, 206, 188), outline=(55, 48, 40), width=2)
    for sgn in (-1, 1):
        xa, xb = (X(-92), X(-74)) if sgn < 0 else (X(74), X(92))
        dr.rectangle([xa, Y(93.0), xb, Y(55.5)], fill=(222, 212, 192), outline=(70, 62, 52), width=2)
        for lv in range(1, 8):
            ly = 56.8 + lv * 4.7
            dr.line([(xa + 3, Y(ly)), (xb - 3, Y(ly))], fill=(90, 80, 68), width=2)
    for st_i in range(1, 9):
        yy = 55.5 + st_i * 4.4
        dr.line([(X(-74), Y(yy)), (X(-36), Y(yy))], fill=(140, 130, 116), width=1)
        dr.line([(X(36), Y(yy)), (X(74), Y(yy))], fill=(140, 130, 116), width=1)
    dr.text((X(-67), Y(77)), 'HOUSING', font=fb, fill=(50, 42, 34))
    dr.text((X(41), Y(77)), 'DORMANT (d=3)', font=fm, fill=(110, 48, 36))

    # Peaked Tent Canopies & Water Reservoir
    for t in P['tents']:
        dr.polygon([(X(t['cx'] - t['rx']), Y(95.5)), (X(t['cx']), Y(t['yPeak'])), (X(t['cx'] + t['rx']), Y(95.5))],
                   fill=(246, 242, 230), outline=(95, 82, 64), width=2)
    rs = D['RESERVOIR']
    dr.rectangle([X(rs['x0']), Y(rs['y1']), X(rs['x1']), Y(rs['y0'])], fill=(226, 222, 212), outline=(50, 44, 38), width=3)
    dr.rectangle([X(rs['x0'] + 3), Y(rs['waterY']), X(rs['x1'] - 3), Y(rs['y0'] + 2.5)], fill=(122, 182, 208))
    dr.text((X(rs['x0'] + 2), Y(112)), 'WATER\nRESERVOIR', font=fm, fill=(24, 52, 70))

    # Elevation markers on left
    for elev, lbl in [(0.2, '+0.2 m Pit Base'), (14.2, '+14.2 m Court'), (28.0, '+28.0 m Desert Rim'),
                      (53.0, '+53.0 m Sky Deck'), (95.1, '+95.1 m Roof'), (120.2, '+120.2 m Reservoir')]:
        dr.line([(45, Y(elev)), (185, Y(elev))], fill=(150, 140, 128), width=1)
        dr.text((48, Y(elev) - 16), lbl, font=fm, fill=(65, 58, 50))

    bx, by = 50, H - 36
    dr.line([(bx, by), (bx + 100 * s, by)], fill=(30, 30, 30), width=4)
    dr.text((bx + 100 * s + 12, by - 10), '100 m (1:1 horizontal & vertical)', font=fb, fill=(30, 30, 30))
    return img


def draw_community_and_cut(data):
    P = data['plan']
    D = P['dim']
    reach_set = set(data['reach'])
    W, H = 1520, 820
    img = Image.new('RGB', (W, H), (249, 246, 238))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(28, True), font(17), font(16, True), font(13)

    dr.text((36, 20), 'Left: Community Center Level (+38.4 m, Sheet 2 Plan 1)   |   Right: Refurbished Bulkhead Cut (d = 3)', font=ft, fill=(28, 24, 20))
    dr.text((36, 56), 'Central circular stepped council amphitheater ringed by 8 columns + 4 pinwheel bastions; right panel shows green inhabited core vs sealed expansion wing.',
            font=fs, fill=(75, 68, 58))

    # Left panel: Community level plan
    s1 = 4.6
    ox1, oy1 = 385, 445
    X1 = lambda x: ox1 + x * s1
    Z1 = lambda z: oy1 + z * s1

    # Pinwheel connector decks between central ring and 4 corner bastions
    for b in P['bastions']:
        hs = 15.0
        dr.rectangle([X1(b['cx'] - hs), Z1(b['cz'] - hs), X1(b['cx'] + hs), Z1(b['cz'] + hs)],
                     fill=(235, 228, 210), outline=(72, 64, 52), width=2)
    dr.rectangle([X1(-37), Z1(-37), X1(37), Z1(37)], fill=(235, 228, 210), outline=(82, 74, 62), width=1)

    for b in data['buildings']:
        if b['area'] != 'community' or b['id'] == 'akb.trunk.city':
            continue
        for rm in b['sampleRooms']:
            pts = [(X1(p[0]), Z1(p[1])) for p in rm['poly']]
            dr.polygon(pts, fill=(224, 216, 194), outline=(95, 86, 74))
        for wl in b['sampleWalls']:
            pts = [(X1(p[0]), Z1(p[1])) for p in wl]
            if len(pts) >= 2:
                dr.line(pts, fill=(52, 46, 38), width=2)

    # Council bowl concentric steps
    for step_i in range(6, 0, -1):
        rr = (D['BOWL_R0'] + (D['BOWL_R'] - D['BOWL_R0']) * step_i / 6.0) * s1
        dr.ellipse([ox1 - rr, oy1 - rr, ox1 + rr, oy1 + rr], fill=(208, 200, 184), outline=(90, 82, 70))
    r0 = D['BOWL_R0'] * s1
    dr.ellipse([ox1 - r0, oy1 - r0, ox1 + r0, oy1 + r0], fill=(238, 232, 218), outline=(70, 62, 52), width=2)
    for rc in P['ringCols']:
        cr = rc['r'] * s1
        dr.ellipse([X1(rc['x']) - cr, Z1(rc['z']) - cr, X1(rc['x']) + cr, Z1(rc['z']) + cr], fill=(65, 58, 50))
    dr.text((ox1 - 46, oy1 - 8), 'COUNCIL BOWL', font=fm, fill=(45, 38, 30))

    # Right panel: d=3 Refurbished vs Bulkheaded Dormant Cut
    s2 = 2.4
    ox2, oy2 = 1090, 445
    X2 = lambda x: ox2 + x * s2
    Z2 = lambda z: oy2 + z * s2

    for b in P['blocks']:
        col = (158, 206, 146) if b['id'] in reach_set else (226, 152, 136)
        dr.rectangle([X2(b['x0']), Z2(b['z0']), X2(b['x1']), Z2(b['z1'])], fill=col, outline=(60, 54, 46), width=2)
        cx, cz = (b['x0'] + b['x1']) * 0.5, (b['z0'] + b['z1']) * 0.5
        dr.text((X2(cx) - 34, Z2(cz) - 7), b['id'], font=fm, fill=(30, 30, 30))

    for bh in P['bulkheads']:
        dr.rectangle([X2(bh['x'] - 4), Z2(bh['z'] - 5), X2(bh['x'] + 4), Z2(bh['z'] + 5)],
                     fill=(185, 42, 32), outline=(255, 255, 255), width=2)

    dr.text((660, H - 55), 'Green: Active Core (~1,660 people)  |  Coral: Sealed Dormant Wing (+840)  |  Red: Bulkheads',
            font=fb, fill=(45, 40, 34))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    data = load_data()
    draw_general_plan(data).save(os.path.join(OUT, 'general_plan.png'))
    draw_section(data).save(os.path.join(OUT, 'section_elevation.png'))
    draw_community_and_cut(data).save(os.path.join(OUT, 'community_cut.png'))

    P = data['plan']
    st = P['stats']
    b_map = {}
    for b in data['buildings']:
        b_map[b['area']] = b_map.get(b['area'], 0) + b['rooms']

    lines = [
        '# Arckibuz — Areas, Rooms & Population by Organ\n',
        'Generated by `arckibuz_blueprint.py` from `8aw0-arckibuz-plan.js` and `8aw1-arckibuz-interiors.js`.\n',
        '| Block ID | Organ | Levels | Gross Floor (m2) | Intact Pop (`d=0`) | Refurbished Pop (`d=3`) | State in `d=3` |',
        '|---|---|---|---|---|---|---|'
    ]
    for b in P['blocks']:
        state3 = 'Bulkheaded expansion socket (`rehab`)' if b['dormant'] else 'Inhabited & furnished (`intact`)'
        lines.append('| `%s` | `%s` | %d | %d | %d | %d | %s |' %
                     (b['id'], b['organ'], b['storeys'], b['floor'], b['pop0'], b['pop3'], state3))
    lines.append('| **Total** | **All organs** | | **%d** | **%d** | **%d** | **+%d dormant capacity** |' %
                 (st['totalFloor'], st['intactPop'], st['refurbPop'], st['dormantPop']))
    lines.append('\n## Interior Sub-Sites (`AIK`)\n')
    lines.append('| Sub-Site Organ | Rooms per Decay | `d=0` Intact | `d=1` Ruined | `d=3` Refurbished |')
    lines.append('|---|---|---|---|---|')
    for area, rooms in sorted(b_map.items()):
        d3_desc = '`rehab` socket (0 pieces, 20% broken)' if area == 'dormant' else '`intact` furnished in `post-apoc`'
        lines.append('| `%s` | %d | `intact` (`ancient`) | `ruined` (45%% broken) | %s |' % (area, rooms, d3_desc))

    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')
    print('wrote general_plan.png, section_elevation.png, community_cut.png, and AREAS.md')


if __name__ == '__main__':
    main()
