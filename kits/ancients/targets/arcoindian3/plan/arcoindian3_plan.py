#!/usr/bin/env python3
"""Arcoindian III: architectural floorplans, longitudinal cliff section, and Modern Condition guide.

Reads 8au0-arcoindian3-plan.js directly in Node ([G data]), so the sheets and area tables can never drift from the 3D build:
  sheets/plan_levels.png       6 horizontal level cuts (+14, +72, +188, +246, +364, +502 m) coded by Work / Live / Recreation / Civic
  sheets/section_ns.png        North-South cliff section (x = 0, 1:1 scale): deep galleries, stepped arch terraces, barrel vault, gorge
  sheets/modern_condition.png  East-West elevation diagram showing how the Original State + Cataclysm deltas govern the Modern Condition
  AREAS.md                     Zone-by-zone and category-by-category area, population, jobs, and modern reinhabitation tables
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
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/arcoindian3/8au0-arcoindian3-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.ARCO3=typeof ARCO3!=="undefined"?ARCO3:this.ARCO3;',ctx);
const A=ctx.ARCO3,P=A.plan({seed:12400}),RU=A.ruin(P),MG=A.modernGuide(P,RU);
const niche=[];for(let x=-360;x<=360;x+=8)niche.push([x,A.nicheBaseZ(x)]);
process.stdout.write(JSON.stringify({plan:P,ruin:RU,modern:MG,niche:niche}));
"""

CAT_COL = {
    'live': (224, 134, 104),       # warm terracotta-rose
    'work': (92, 132, 178),        # slate cobalt
    'recreation': (118, 178, 122), # lush garden sage
    'civic': (218, 178, 86),       # warm travertine gold
}
WATER_COL = (38, 152, 132)
ROCK_COL = (212, 188, 166)
CORE_COL = (188, 56, 52)


def load_data():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def draw_levels_sheet(data):
    P = data['plan']
    niche = data['niche']
    st = P['stats']
    W, H = 2460, 1740
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(36, True), font(19), font(18, True), font(15)

    dr.text((36, 20), 'Arcoindian III — Interior Program Blueprint: Six Horizontal Level Cuts (Original State)', font=ft, fill=(28, 26, 24))
    dr.text((36, 68), 'Total gross floor: %.1f ha (%.1f ha daylight-lit)  |  Population: %s  |  Workplaces: %s  |  Recreation cap: %s  |  24 Emerald Pools (%s m2)' % (
        st['grossFloorHa'], st['litFloorHa'], format(st['population'], ','), format(st['jobs'], ','),
        format(st['recreationCapacity'], ','), format(st['poolWaterM2'], ',')), font=fs, fill=(65, 60, 55))

    # Legend bar
    lx = 36
    for label, col in [('LIVE (Oculus & Arcade Housing)', CAT_COL['live']),
                       ('WORK (Guilds, Labs, Deep Hydroponics, Quays)', CAT_COL['work']),
                       ('RECREATION (Emerald Baths, Arch Pavilions, Groves)', CAT_COL['recreation']),
                       ('CIVIC (Great Barrel Vault, Seed Archive, Water Gate)', CAT_COL['civic']),
                       ('EMERALD POOLS & GORGE RIVER', WATER_COL),
                       ('LIFT CORES & GRAND STAIRS', CORE_COL)]:
        dr.rectangle([lx, 104, lx + 24, 124], fill=col, outline=(40, 40, 40))
        dr.text((lx + 32, 104), label, font=fm, fill=(35, 35, 35))
        lx += int(dr.textlength(label, font=fm)) + 60

    cuts = [
        (14,  'Level +14 m — Gorge River Quay, Barge Warehouses & Lower Courts'),
        (72,  'Level +72 m — Terrace 1, Lower Semicircular Arch Pavilion & Baths'),
        (188, 'Level +188 m — THE NECK: Terrace 3, Lower Skybridges & Fluted Bastions'),
        (246, 'Level +246 m — Terrace 4, Deep Hydroponic Tiers & Moon-Gate Courts'),
        (364, 'Level +364 m — Crown Barrel-Vault Nave, Conservatory & Crown Skybridges'),
        (502, 'Level +502 m — High Forest Arch Skybridge & Summit Woodland Crowns'),
    ]

    cols, pw, ph = 3, 760, 680
    scale = pw / 680.0  # x in [-340, +340]
    for idx, (yc, title) in enumerate(cuts):
        ox = 36 + (idx % cols) * (pw + 48)
        oy = 156 + (idx // cols) * (ph + 84)
        X = lambda x: ox + (x + 340) * scale
        Z = lambda z: oy + 36 + (z + 250) * scale  # z in [-250, +390]

        dr.rectangle([ox, oy + 36, ox + pw, oy + 36 + ph], fill=(242, 238, 230), outline=(140, 132, 122), width=2)
        dr.text((ox, oy + 6), title, font=fb, fill=(25, 25, 25))

        # Sheer cliff massif shaded behind niche contour
        cliff_poly = [(X(-340), Z(-250))] + [(X(nx), Z(nz)) for nx, nz in niche if -340 <= nx <= 340] + [(X(340), Z(-250))]
        dr.polygon(cliff_poly, fill=ROCK_COL, outline=(120, 92, 72))
        dr.text((X(-320), Z(-232)), 'SHEER SANDSTONE CLIFF MASSIF', font=fm, fill=(105, 78, 58))

        # Gorge river strip at bottom of plan if visible
        dr.rectangle([X(-340), Z(168), X(340), Z(385)], fill=(196, 226, 228), outline=(90, 140, 148))
        dr.text((X(-75), Z(245)), 'GORGE RIVER (+6 m)', font=fm, fill=(32, 92, 102))

        # Program units intersecting yc
        for u in P['program']:
            if not (u['y0'] - 2 <= yc <= u['y1'] + 3):
                continue
            col = CAT_COL.get(u['category'], (180, 180, 180))
            if u['shape'] == 'circle':
                r = u['r'] * scale
                cx, cz = X(u['cx']), Z(u['cz'])
                dr.ellipse([cx - r, cz - r, cx + r, cz + r], fill=col, outline=(45, 45, 45), width=2)
            else:
                dr.rectangle([X(u['x0']), Z(u['z0']), X(u['x1']), Z(u['z1'])], fill=col, outline=(45, 45, 45), width=1)

        # Sunken Emerald Pools on this level
        for pl in P['pools']:
            if abs(pl['y'] - yc) < 8:
                dr.rectangle([X(pl['x0']), Z(pl['z0']), X(pl['x1']), Z(pl['z1'])], fill=WATER_COL, outline=(20, 80, 68), width=1)

        # Skybridges near this cut
        for br in P['bridges']:
            if abs(br['y'] - yc) < 16:
                dr.line([(X(br['from'][0]), Z(br['from'][2])), (X(br['to'][0]), Z(br['to'][2]))],
                        fill=CAT_COL['recreation'], width=max(4, int(br['w'] * scale)))

        # Lift cores & Grand stairs
        for c in P['cores']:
            if c['y0'] <= yc + 2 and c['y1'] >= yc - 2:
                rr = max(4, c['r'] * scale)
                dr.ellipse([X(c['x']) - rr, Z(c['z']) - rr, X(c['x']) + rr, Z(c['z']) + rr], fill=CORE_COL, outline=(255, 255, 255))
        for st_side in P['stairs']:
            for fl in st_side['flights']:
                if fl['y0'] - 2 <= yc <= fl['y1'] + 2:
                    hw = fl['w'] * 0.5
                    dr.rectangle([X(fl['x'] - hw), Z(min(fl['z0'], fl['z1'])), X(fl['x'] + hw), Z(max(fl['z0'], fl['z1']))],
                                 fill=(155, 72, 145), outline=(40, 20, 40))

    # Scale bar
    bx, by = 36, H - 26
    dr.line([(bx, by), (bx + 100 * scale, by)], fill=(20, 20, 20), width=4)
    dr.text((bx + 100 * scale + 12, by - 10), '100 m (North -z up, South +z toward Gorge River)', font=fm, fill=(20, 20, 20))
    return img


def draw_section_sheet(data):
    P = data['plan']
    W, H = 2240, 1420
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(34, True), font(19), font(17, True), font(14)

    dr.text((36, 18), 'Arcoindian III — North-South Sagittal Section on Central Spine Axis (x = 0, True 1:1 Scale)', font=ft, fill=(25, 25, 25))
    dr.text((36, 62), 'Shows how daylight perimeter apartments & public arch pavilions step forward toward the canyon sun while windowless cliff-heart', font=fs, fill=(65, 60, 55))
    dr.text((36, 88), 'galleries hold turbines, cisterns, kilns, lamp-lit hydroponic farms, and the Seed Bank.', font=fs, fill=(65, 60, 55))

    # z from -320 to +660 (980 m), y from -20 to +590 (610 m)
    s = 2.05
    ox, oy = 90, H - 80
    Z = lambda z: ox + (z + 320) * s
    Y = lambda y: oy - y * s

    # Cliff rock polygon
    rock_pts = [(Z(-320), Y(0)), (Z(-320), Y(560)), (Z(-220), Y(560)), (Z(-220), Y(0)), (Z(96), Y(0))]
    dr.polygon(rock_pts, fill=ROCK_COL, outline=(120, 92, 72))
    dr.text((Z(-310), Y(530)), 'CAPROCK PLATEAU (+560 m)', font=fb, fill=(95, 68, 48))

    # Gorge river & Far Canyon Wall
    dr.rectangle([Z(168), Y(6), Z(510), Y(0)], fill=WATER_COL, outline=(20, 90, 80))
    dr.text((Z(285), Y(22)), 'GORGE RIVER (WSY +6 m)', font=fb, fill=(22, 102, 92))
    far_pts = [(Z(510), Y(0)), (Z(560), Y(210)), (Z(615), Y(380)), (Z(660), Y(480)), (Z(660), Y(0))]
    dr.polygon(far_pts, fill=(218, 198, 178), outline=(130, 102, 82))
    dr.text((Z(545), Y(160)), 'FAR CANYON WALL', font=fb, fill=(105, 78, 58))

    # Quay
    q = P['quay']
    dr.rectangle([Z(q['z0']), Y(q['y1']), Z(q['z1']), Y(0)], fill=CAT_COL['work'], outline=(40, 40, 40), width=2)
    dr.text((Z(q['z0'] + 4), Y(12)), 'Quay & Water Gate', font=fm, fill=(255, 255, 255))

    # Deep Galleries + Spine Terraces + Nested Pavilions
    for k, tr in enumerate(P['terraces']):
        dg = P['deepGalleries'][k]
        # Spine mass
        dr.rectangle([Z(tr['z0']), Y(tr['y1']), Z(tr['z1']), Y(tr['y0'])], fill=(236, 224, 204), outline=(70, 62, 52), width=2)
        # Daylight perimeter housing zone
        dr.rectangle([Z(tr['z1'] - 64), Y(tr['y1'] - 2), Z(tr['z1'] - 26), Y(tr['y0'])], fill=CAT_COL['live'], outline=(90, 50, 40))
        # Semicircular arch loggia + nested pavilion
        pv = tr['pavilion']
        dr.rectangle([Z(tr['z1'] - 26), Y(tr['arch']['crownY']), Z(tr['z1']), Y(tr['y0'])], fill=(248, 242, 232), outline=(110, 95, 78))
        dr.rectangle([Z(pv['z0']), Y(pv['y1']), Z(pv['z1']), Y(pv['y0'])], fill=CAT_COL['recreation'], outline=(40, 75, 45), width=2)
        # Roof orchard strip
        dr.rectangle([Z(tr['deckZ0']), Y(tr['y1'] + 3.5), Z(tr['z1']), Y(tr['y1'])], fill=(92, 162, 82))
        # Deep gallery
        dcol = CAT_COL[dg['category']]
        dr.rectangle([Z(dg['z0']), Y(dg['y1']), Z(dg['z1']), Y(dg['y0'] + 2)], fill=dcol, outline=(35, 45, 60), width=2)
        dr.text((Z(dg['z0'] + 3), Y(dg['y1'] - 6)), 'D%d: %s' % (k + 1, dg['name'][:30]), font=fm, fill=(255, 255, 255))
        dr.text((Z(tr['z1'] + 6), Y((tr['y0'] + tr['y1']) * 0.5 + 6)), 'T%d (+%.0f m)' % (k + 1, tr['y0']), font=fm, fill=(40, 40, 40))

    # Crown Barrel Vault
    V = P['vault']
    dr.rectangle([Z(V['z0']), Y(V['y1']), Z(V['z1']), Y(V['y0'])], fill=(238, 224, 198), outline=(60, 52, 42), width=3)
    dr.rectangle([Z(-214), Y(472), Z(-158), Y(364)], fill=CAT_COL['work'], outline=(40, 55, 80), width=2)
    dr.rectangle([Z(-158), Y(436), Z(-88), Y(364)], fill=CAT_COL['civic'], outline=(90, 70, 25), width=2)
    dr.rectangle([Z(-88), Y(485), Z(-68), Y(364)], fill=CAT_COL['recreation'], outline=(40, 80, 50), width=2)
    dr.text((Z(-208), Y(455)), 'Botanical Conservatory & Labs', font=fb, fill=(255, 255, 255))
    dr.text((Z(-154), Y(416)), 'Council Nave', font=fb, fill=(30, 25, 15))
    dr.text((Z(-148), Y(512)), 'CROWN BARREL VAULT (Apex +498 m)', font=fb, fill=(35, 30, 25))

    # High Forest Arch & Crown Drum silhouette behind
    dr.rectangle([Z(-172), Y(528), Z(-142), Y(502)], outline=(90, 145, 85), width=2)
    dr.text((Z(-175), Y(546)), 'High Forest Arch (+502 m) & Crown Drums (+528 m)', font=fm, fill=(52, 105, 52))

    # Cores
    for c in P['cores']:
        if abs(c['x']) < 95:
            dr.rectangle([Z(c['z'] - c['r']), Y(c['y1']), Z(c['z'] + c['r']), Y(c['y0'])], outline=CORE_COL, width=2)

    # Neck dashed line at y = 188 m
    for xdash in range(int(Z(-230)), int(Z(180)), 22):
        dr.line([(xdash, Y(188)), (xdash + 12, Y(188))], fill=(195, 45, 45), width=3)
    dr.text((Z(68), Y(198)), 'SANCTUARY NECK (+188 m)', font=fb, fill=(185, 38, 38))

    # Scale bar
    dr.line([(ox, H - 30), (ox + 100 * s, H - 30)], fill=(20, 20, 20), width=4)
    dr.text((ox + 100 * s + 12, H - 40), '100 m (1:1 horizontal and vertical scale)', font=fm, fill=(20, 20, 20))
    return img


def draw_modern_sheet(data):
    P, RU, MG = data['plan'], data['ruin'], data['modern']
    s_map = MG['summary']
    W, H = 2360, 1460
    img = Image.new('RGB', (W, H), (250, 248, 244))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fm = font(34, True), font(19), font(18, True), font(15)

    dr.text((36, 18), 'Arcoindian III — How the Original State Guides the Modern Ruin & Reinhabitation Condition', font=ft, fill=(25, 25, 25))
    dr.text((36, 62), 'East-West Front Elevation (looking North): West Brow rockfall & Neck cuts divide the arcology into 3 distinct modern gameplay/world zones:', font=fs, fill=(60, 56, 52))
    dr.text((36, 90), '1. KEPT UPPER SANCTUARY (%d intact East-Spring units; sustainable modern pop ~%s)   2. RIVER PORT & SALVAGE (%d units)   3. ISOLATED WEST RUINS (%d units)' % (
        s_map['sanctuary']['units'], format(s_map['sanctuary']['sustainableModernPop'], ','),
        s_map['river_salvage']['units'], s_map['isolated_west']['units']), font=fb, fill=(32, 82, 52))

    # Elevation coordinate transform: x in [-360, +360], y in [0, 580]
    s = 2.05
    cx, oy = W // 2, H - 90
    X = lambda x: cx + x * s
    Y = lambda y: oy - y * s

    ZONE_COL = {
        'sanctuary': (136, 196, 132),
        'river_salvage': (218, 192, 138),
        'isolated_west': (184, 152, 198),
        'collapsed': (215, 102, 96),
    }
    part_zone = {}
    for u in MG['units']:
        if u['partId'] not in part_zone or u['zoneState'] == 'sanctuary':
            part_zone[u['partId']] = u['zoneState']

    # Sheer cliff rim background
    dr.rectangle([X(-350), Y(560), X(350), Y(0)], fill=(232, 218, 204), outline=(140, 115, 95), width=2)
    # West Brow Rockfall Scar polygon
    scar_pts = [(X(-295), Y(560)), (X(-120), Y(560)), (X(-145), Y(360)), (X(-244), Y(292)), (X(-285), Y(380))]
    dr.polygon(scar_pts, fill=(238, 196, 188), outline=(195, 52, 48))
    dr.text((X(-282), Y(535)), 'WEST BROW ROCKFALL SCAR', font=fb, fill=(185, 42, 38))

    # Gorge River band at foot
    dr.rectangle([X(-350), Y(6), X(350), Y(-8)], fill=WATER_COL)
    dr.rectangle([X(-218), Y(14), X(218), Y(0)], fill=ZONE_COL['river_salvage'], outline=(60, 50, 40), width=2)

    # Fluted Chalice Towers
    tw_cuts = RU['towerCuts']
    for tw in P['towers']:
        zst = part_zone.get(tw['id'], 'isolated_west')
        cut_y = tw_cuts.get(tw['id'])
        top_y = cut_y if cut_y is not None else tw['y1']
        dr.rectangle([X(tw['cx'] - tw['r']), Y(top_y), X(tw['cx'] + tw['r']), Y(tw['y0'])],
                     fill=ZONE_COL[zst], outline=(45, 45, 45), width=2)
        if cut_y is not None:
            dr.rectangle([X(tw['cx'] - tw['r']), Y(tw['y1']), X(tw['cx'] + tw['r']), Y(cut_y)],
                         outline=(195, 55, 50), width=2)
            dr.text((X(tw['cx'] - 24), Y(tw['y1'] - 10)), 'W3 SHEARED', font=fm, fill=(185, 42, 38))
        else:
            dr.ellipse([X(tw['cx'] - tw['r'] * 0.9), Y(top_y + 16), X(tw['cx'] + tw['r'] * 0.9), Y(top_y - 2)],
                       fill=(68, 138, 64), outline=(35, 75, 35))
        dr.text((X(tw['cx'] - 14), Y((tw['y0'] + top_y) * 0.5)), tw['key'], font=fb, fill=(25, 25, 25))

    # Terracotta Oculus Courts
    dry_set = set(RU['dryCourts'])
    for ct in P['courts']:
        zst = 'isolated_west' if ct['id'] in dry_set and ct['k'] >= 2 else part_zone.get(ct['id'], 'river_salvage')
        dr.rectangle([X(ct['x0']), Y(ct['y0'] + ct['wallH']), X(ct['x1']), Y(ct['y0'])],
                     fill=ZONE_COL[zst], outline=(85, 52, 42), width=2)
        # Draw circular moon-gate oculi
        step_x = (ct['x1'] - ct['x0']) / 3.0
        for col in range(3):
            ox_c = ct['x0'] + (col + 0.5) * step_x
            for row in range(2):
                oy_c = ct['y0'] + 15 + row * 10.6
                rr = ct['oculusR'] * s
                dr.ellipse([X(ox_c) - rr, Y(oy_c) - rr, X(ox_c) + rr, Y(oy_c) + rr],
                           fill=(52, 42, 38) if ct['id'] in dry_set else (248, 212, 142), outline=(70, 40, 30))

    # Six Semicircular Spine Terraces
    for tr in P['terraces']:
        zst = 'sanctuary' if tr['k'] >= 2 else 'river_salvage'
        dr.rectangle([X(tr['x0']), Y(tr['y1']), X(tr['x1']), Y(tr['y0'])],
                     fill=ZONE_COL[zst], outline=(45, 45, 45), width=2)
        ar = tr['arch']['r'] * s
        acy = Y(tr['arch']['springY'])
        dr.pieslice([X(0) - ar, acy - ar, X(0) + ar, acy + ar], 180, 360, fill=(65, 58, 50), outline=(40, 35, 30))
        dr.rectangle([X(-tr['arch']['r']), acy, X(tr['arch']['r']), Y(tr['y0'])], fill=(65, 58, 50))
        # Nested pavilion
        pvw = tr['pavilion']['w'] * 0.5
        dr.rectangle([X(-pvw), Y(tr['pavilion']['y1']), X(pvw), Y(tr['y0'])], fill=(238, 224, 195), outline=(50, 45, 35))

    # Crown Barrel Vault
    V = P['vault']
    vw = V['x1'] - V['x0']
    vr = vw * 0.5 * s
    dr.rectangle([X(-vw * 0.5), Y(V['ySpring']), X(vw * 0.5), Y(V['y0'])], fill=ZONE_COL['sanctuary'], outline=(35, 65, 35), width=3)
    dr.pieslice([X(0) - vr, Y(V['ySpring']) - vr, X(0) + vr, Y(V['ySpring']) + vr], 180, 360, fill=ZONE_COL['sanctuary'], outline=(35, 65, 35), width=3)
    vir = V['innerR'] * s
    dr.pieslice([X(0) - vir, Y(V['ySpring']) - vir, X(0) + vir, Y(V['ySpring']) + vir], 180, 360, fill=(38, 56, 68))
    dr.rectangle([X(-V['innerR']), Y(V['ySpring']), X(V['innerR']), Y(V['y0'])], fill=(38, 56, 68))
    dr.text((X(-52), Y(416)), 'BARREL VAULT', font=fb, fill=(255, 245, 220))

    # Skybridges (solid if standing, dashed red if collapsed)
    gone_br = set(RU['goneBridges'])
    for br in P['bridges']:
        x0, x1, by = X(br['from'][0]), X(br['to'][0]), Y(br['y'])
        if br['id'] in gone_br:
            steps = 12
            for i in range(0, steps, 2):
                xa = x0 + (x1 - x0) * (i / steps)
                xb = x0 + (x1 - x0) * ((i + 1) / steps)
                dr.line([(xa, by), (xb, by)], fill=(205, 52, 48), width=5)
        else:
            dr.rectangle([min(x0, x1), by - 6, max(x0, x1), by + 6], fill=(92, 168, 96), outline=(35, 65, 35), width=2)

    # Water paths: Intact East Spring vs Breached West Cascade
    dr.line([(X(98), Y(386)), (X(108), Y(305)), (X(108), Y(14))], fill=(28, 158, 195), width=6)
    dr.text((X(116), Y(355)), 'INTACT EAST SPRING', font=fb, fill=(22, 118, 152))
    dr.line([(X(-98), Y(386)), (X(-146), Y(246))], fill=(28, 158, 195), width=5)
    dr.line([(X(-146), Y(246)), (X(-146), Y(6))], fill=(52, 188, 225), width=9)
    dr.text((X(-295), Y(232)), '238 m WILD CASCADE', font=fb, fill=(22, 118, 165))

    # Guarded Rim Stair entry arrow
    dr.line([(X(88), Y(560)), (X(88), Y(364))], fill=(195, 45, 45), width=5)
    dr.text((X(96), Y(542)), 'GUARDED RIM STAIR (Only Sanctuary Entry)', font=fb, fill=(175, 35, 35))

    # Sanctuary Neck line at +188 m
    for xd in range(int(X(-340)), int(X(340)), 24):
        dr.line([(xd, Y(188)), (xd + 14, Y(188))], fill=(195, 45, 45), width=4)
    dr.text((X(175), Y(198)), 'NECK CUT (+188 m: Stairs & Bridges Severed)', font=fb, fill=(185, 35, 35))

    # Legend at bottom
    lx = 36
    for lbl, c in [('Kept Upper Sanctuary (Watered, Defensible)', ZONE_COL['sanctuary']),
                   ('River Port & Salvage Zone (Boat-Reachable)', ZONE_COL['river_salvage']),
                   ('Isolated West Ruins (Dry / Rope-Access Explorer Zone)', ZONE_COL['isolated_west']),
                   ('Collapsed Bridges & Sheared Tower W3', ZONE_COL['collapsed'])]:
        dr.rectangle([lx, H - 46, lx + 26, H - 22], fill=c, outline=(40, 40, 40))
        dr.text((lx + 34, H - 44), lbl, font=fm, fill=(30, 30, 30))
        lx += int(dr.textlength(lbl, font=fm)) + 68
    return img


def write_areas_md(data):
    P, MG = data['plan'], data['modern']
    st = P['stats']
    by_cat = st['byCategory']
    ms = MG['summary']
    lines = [
        '# Arcoindian III — Areas, Interior Program & Modern Reinhabitation Table',
        '',
        '*Generated by `arcoindian3_plan.py` directly from `../8au0-arcoindian3-plan.js` (`[G data]`).*',
        '',
        '## 1. Summary by Program Category (Original State, `d = 0`)',
        '',
        '| Category | Units | Gross Floor (ha) | Daylight-Lit Floor (ha) | Share of Gross | Capacity / Yield |',
        '|---|---:|---:|---:|---:|---|',
        '| **LIVE** (Oculus Courts, Spine Arcades, Fluted Drums) | %d | %.2f | %.2f | %.1f%% | **%s residents** (45 m2 gross lit/person) |' % (
            by_cat['live']['count'], by_cat['live']['gross'] / 1e4, by_cat['live']['lit'] / 1e4,
            100.0 * by_cat['live']['gross'] / st['grossFloorM2'], format(st['population'], ',')),
        '| **WORK** (Quay, Guild Drums, Conservatory, Deep Hydroponics) | %d | %.2f | %.2f | %.1f%% | **%s workplaces** |' % (
            by_cat['work']['count'], by_cat['work']['gross'] / 1e4, by_cat['work']['lit'] / 1e4,
            100.0 * by_cat['work']['gross'] / st['grossFloorM2'], format(st['jobs'], ',')),
        '| **RECREATION** (Emerald Baths, Arch Pavilions, Groves, Walks) | %d | %.2f | %.2f | %.1f%% | **%s visitors** (%.2f ha open gardens, 24 pools) |' % (
            by_cat['recreation']['count'], by_cat['recreation']['gross'] / 1e4, by_cat['recreation']['lit'] / 1e4,
            100.0 * by_cat['recreation']['gross'] / st['grossFloorM2'], format(st['recreationCapacity'], ','), st['openGardenHa']),
        '| **CIVIC** (Barrel-Vault Council Nave, Deep Seed Bank, Water Gate) | %d | %.2f | %.2f | %.1f%% | Assembly 1,200 + Deep Seed Archive |' % (
            by_cat['civic']['count'], by_cat['civic']['gross'] / 1e4, by_cat['civic']['lit'] / 1e4,
            100.0 * by_cat['civic']['gross'] / st['grossFloorM2']),
        '| **TOTAL** | **%d** | **%.2f** | **%.2f** | **100.0%%** | **%s people** |' % (
            st['programUnits'], st['grossFloorHa'], st['litFloorHa'], format(st['population'], ',')),
        '',
        '## 2. Modern Condition Breakdown (`d = 1` Ruin -> Reinhabitation Guide)',
        '',
        '| Modern Zone | Units | Original Housing Cap | Irrigated / Farmed Area | Modern Role |',
        '|---|---:|---:|---:|---|',
        '| **Kept Upper Sanctuary** (`+188..+528 m`, East Spring) | %d | %s | %.2f ha | **~%s sustainable modern residents**; guarded via Plateau Rim Stair |' % (
            ms['sanctuary']['units'], format(ms['sanctuary']['liveCap'], ','),
            ms['sanctuary']['irrigatedHa'], format(ms['sanctuary']['sustainableModernPop'], ',')),
        '| **River Port & Salvage Shore** (`0..+130 m`, Gorge Quay) | %d | %s | — | River boat quay, salvage guild, anglers & ferry market below the Neck |' % (
            ms['river_salvage']['units'], format(ms['river_salvage']['liveCap'], ',')),
        '| **Isolated West Ruins** (`+130..+364 m`, Breached West) | %d | %s | — | Dry moon-gate courts & sealed Ancient institutes (rope/climb access) |' % (
            ms['isolated_west']['units'], format(ms['isolated_west']['liveCap'], ',')),
        '| **Collapsed in West Rockfall** (`W3` top, `B1/B2w/B3w`) | %d | — | — | Fallen fluted drums & bridge ribs on the west shore bench |' % (
            ms['collapsed']['units']),
        '',
    ]
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
