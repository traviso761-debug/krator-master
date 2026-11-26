#!/usr/bin/env python3
"""Arcoforte: floorplan sheets (A0..A4), two cross-sections, AREAS.md, and BLUEPRINT.md.

Generated directly from `src/30-af-plan.js`, `src/31-af-interiors.js`, and `src/32-af-rules.js`
via `node layout_dump.js`, rendered on the shared `settlements/voth/palace/blueprint.py` generator.
Frame: u = x (east +), v = -z (north / sea up on the sheet, matching Soleri's Plate 1 orientation!).

    python3 kits/arcoforte/arcoforte_blueprint.py
"""
import json, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth', 'palace'))
import blueprint as B
from blueprint import R
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(['node', os.path.join(HERE, 'layout_dump.js')],
                                 capture_output=True, text=True, check=True, encoding='utf-8').stdout)
L, INT, AREA = DUMP['layout'], DUMP['interiors'], DUMP['area']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('arcoforte_blueprint: layout failed checks:\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))

B.KIND_FILL.update({
    'living_zone': (238, 214, 178),
    'work_zone': (188, 216, 236),
    'rec_zone': (198, 232, 188),
    'sealed_zone': (168, 146, 142),
    'water_fill': (168, 214, 242),
    'park_fill': (208, 232, 194),
    'cliff_fill': (210, 198, 182)
})

SECTOR_KIND = {'living': 'living_zone', 'work': 'work_zone', 'rec': 'rec_zone', 'infra': 'store'}


def part_room(n, p):
    """Map an ARCOFORTE part record into blueprint coordinates u = x, v = -z (north/sea at top)."""
    s = p['shape']
    kind = 'sealed_zone' if not p.get('kept', True) else ('court' if p['kind'] == 'court' else SECTOR_KIND.get(p.get('sector', 'work'), 'work_zone'))
    decor = 0 if not p.get('kept', True) else (3 if p.get('sector') == 'rec' else 2)
    note = '%s · %s · y %gm..%gm (%d st)%s' % (
        p.get('sector', 'work').upper(),
        'KEPT' if p.get('kept', True) else 'SEALED/RUINED',
        p['y'], p['y'] + p['h'], p['st'],
        (' — ' + p['note']) if p.get('note') else ''
    )
    if p.get('poly'):
        pts = [(pt[0], -pt[1]) for pt in p['poly']]
        cu = sum(pt[0] for pt in pts) / len(pts)
        cv = sum(pt[1] for pt in pts) / len(pts)
        d = R(n, p['name'], kind, cu - 16, cu + 16, cv - 11, cv + 11, decor, note)
        d['poly'] = pts
        d['real_area'] = 0.5 * abs(sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))))
    elif s[0] == 'box':
        x0, x1, z0, z1 = s[1], s[2], s[3], s[4]
        d = R(n, p['name'], kind, x0, x1, -z1, -z0, decor, note)
    else:
        cx, cz, rad = s[1], s[2], s[3]
        d = R(n, p['name'], kind, cx - rad, cx + rad, -cz - rad, -cz + rad, decor, note)
        d['circ'] = True
    return d


def sheet_bundle(sid, base_fills, base_lines):
    pts = [p for p in L['parts'] if sid in p.get('sheets', [])]
    rooms = [part_room(i + 1, p) for i, p in enumerate(pts)]
    poly_fills = [(r['poly'], B.KIND_FILL.get(r['kind'], B.DECOR_FILL[r['decor']])) for r in rooms if r.get('poly')]
    poly_outlines = [(r['poly'] + [r['poly'][0]], (35, 35, 35), 2) for r in rooms if r.get('poly')]
    return dict(fills=base_fills + poly_fills, lines=poly_outlines + base_lines, rooms=rooms)


SEA_POLY = [(-380, 380), (380, 380), (380, 215), (150, 215), (0, 244), (-150, 215), (-380, 215)]
PARK_POLY = [(140 * math.cos(2 * math.pi * i / 48), -10 + 140 * math.sin(2 * math.pi * i / 48)) for i in range(49)]
STREAM_LINE = [([(pt[0], -pt[1]) for pt in w['pts']], (38, 112, 200), 5, 'Park Waterway & Linear Canal')
               for w in L['ways'] if w['id'] == 'af.way.stream']
AVE_LINE = [([(pt[0], -pt[1]) for pt in w['pts']], (120, 88, 52), 6)
            for w in L['ways'] if w['id'] != 'af.way.stream']

SITE_RECT = dict(R=430, rect=(-380, 380, -490, 370))
RING_RECT = dict(R=330, rect=(-330, 330, -310, 350))

FLOORS = [
    dict(SITE_RECT, id='A0', tier=0,
         title='Sheet A0: Arcoforte Master Plan — Sea Cliff, Horseshoe Neocliff, Park & Linear City',
         sub='North (up) is the Ocean & Sea Cliff; South (down) is the Linear City throat. Synthesizes Soleri Plates 1–3: multilevel boat-lift harbour platform & NW marina, 7 cliff skyscrapers under the 300 m Sky-Crown, fluted Domed Rotunda, 9-bastion Horseshoe Neocliff with 13 oculus courts, sheltered Central Park & waterways, and twin Linear City bars.',
         axisnote='datum: sea y = 0 m, plateau y = 84 m, crown y = 300 m',
         **sheet_bundle('A0', [(SEA_POLY, B.KIND_FILL['water_fill'], 'Open Sea (y = 0 m)'),
                               (PARK_POLY, B.KIND_FILL['park_fill'])], STREAM_LINE + AVE_LINE)),
    dict(RING_RECT, id='A1', tier=0,
         title='Sheet A1: Sea Level & Sub-Cliff Works (y = 0..42 m) — Work & Sealed Vaults',
         sub='Multilevel fishing-fleet lift platform (y = 4.5, 13.5, 22.5 m) with twin boat-lift gantries, NW Marina piers (y = 3.5 m), active refurbished Fishing & Cold-Storage Works (y = 5.5..23.5 m), and gated/ruined Sub-Cliff Automated Industry Vaults (delve & salvage zone), linked upward by twin inclined cliff shafts.',
         axisnote='u = east (+x) ->    v = north (-z, ocean up)    harbour rock bench y = 5.5 m',
         **sheet_bundle('A1', [(SEA_POLY, B.KIND_FILL['water_fill'])], AVE_LINE)),
    dict(SITE_RECT, id='A2', tier=1,
         title='Sheet A2: Park, Rotunda Concourse, Vaulted City Center & Linear City (y = 68..112 m)',
         sub='Primary civic, commercial, craft-work, and public recreation horizon: East & West vaulted City Center arcades facing the Central Park, Park Amphitheatre & arched viaduct bridges, Domed Rotunda Tourist/Pilgrim Reception & Refectory, 7 skyscraper shafts, and Linear City customs/warehouses/flats.',
         axisnote='u = east (+x) ->    v = north (-z)    park y = 68..82 m, plateau & arcades y = 84..112 m',
         **sheet_bundle('A2', [(PARK_POLY, B.KIND_FILL['park_fill'])], STREAM_LINE + AVE_LINE)),
    dict(RING_RECT, id='A3', tier=2,
         title='Sheet A3: Battered Dwelling Bastions, 13 Oculus Skylights & Promenade Belvederes (y = 112..166 m)',
         sub='Primary residential & garden-recreation horizon: 9 outward-battered (68 deg) stepped Dwelling Bastions, 13 square courtyard skylight wells with radial oculi lighting the City Center below, continuous y = 144 m Garden Promenade, and 6 flared Mushroom-Pier public/recreation belvederes (taverns, baths, conservatories).',
         axisnote='u = east (+x) ->    v = north (-z)    promenade y = 144 m, belvederes y = 152..166 m',
         **sheet_bundle('A3', [(PARK_POLY, (235, 244, 228))], [])),
    dict(RING_RECT, id='A4', tier=3,
         title='Sheet A4: Seven Sea-Cliff Skyscrapers, Rotunda Dome & 300 m Complex Sky-Crown (y = 170..300 m)',
         sub='High cliff horizon: 7 cellular H-plan skyscrapers with cantilevered Living-Working & Sky-Garden trays, the Rotunda ribbed oculus dome (top 222 m), and the unifying 300 m Sky-Crown (Hanging Sky-Garden Conservatory, Cultural Assembly Hall, Sea-Watch Chart Observatory, Comms Mast & cantilevered Heliport).',
         axisnote='u = east (+x) ->    v = north (-z, ocean up)    sky-crown y = 258..300 m, heliport y = 274 m',
         **sheet_bundle('A4', [(SEA_POLY, B.KIND_FILL['water_fill'])], []))
]


def draw_ns_section():
    """North-South longitudinal cross-section from Ocean (-360) -> Harbour -> Cliff Towers & Crown -> Rotunda -> Park -> Linear City (+470)."""
    ft = B.font(34, True); f = B.font(18); fs = B.font(15)
    W, H = 2400, 1280
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Longitudinal Cross-Section (North Ocean z = -360 to South Linear City z = +480; vertical x1.3)', font=ft, fill=(20, 20, 20))
    dr.text((30, 58), 'Reconciling Soleri Plate 2 Fig. 1 & Plate 3 Fig. 1: Multilevel Harbour Platform + Sub-Cliff Works + 300 m Skyscraper & Crown + Domed Rotunda + Central Park + Horseshoe Ring + Linear City.', font=f, fill=(65, 65, 65))
    sx = 2.45; sy = 2.45 * 1.3
    ox = 980; base = H - 140
    X = lambda z: ox + z * sx
    Y = lambda y: base - y * sy

    # Ocean water
    dr.rectangle([X(-370), Y(0), X(-244), Y(-22)], fill=(168, 214, 242), outline=(60, 110, 160))
    dr.text((X(-355), Y(-16)), 'OCEAN (y = 0 m)', font=fs, fill=(25, 75, 135))

    # Rock cliff & ground profile
    prof = [(-370, -22), (-252, -10), (-244, 5.5), (-172, 5.5), (-146, 70), (-60, 71), (60, 77), (140, 82), (204, 84), (480, 84), (480, -30), (-370, -30)]
    dr.polygon([(X(z), Y(y)) for z, y in prof], fill=(214, 198, 178), outline=(110, 92, 74), width=2)

    def blk(z0, z1, y0, y1, col, label=None, dy=6):
        dr.rectangle([X(z0), Y(y1), X(z1), Y(y0)], fill=col, outline=(30, 30, 30), width=2)
        if label:
            dr.text((X(z0) + 5, Y(y1) + dy), label, font=fs, fill=(15, 15, 15))

    # Harbour platform (3 decks) + Sub-cliff works + Sealed auto vaults
    blk(-334, -246, 0, 24, (188, 216, 236), 'Harbour Boat-Lift Platform (WORK)', dy=-20)
    blk(-244, -210, 5.5, 23.5, (188, 216, 236), 'Fishing & Cold Store (KEPT WORK)', dy=4)
    blk(-206, -174, 5.5, 17.5, (172, 146, 142), 'Automated Vaults (SEALED)', dy=4)
    # Inclined cliff shaft
    dr.line([(X(-214), Y(9.5)), (X(-146), Y(84))], fill=(160, 70, 30), width=5)
    dr.text((X(-208), Y(48)), 'Inclined Cliff Lift', font=fs, fill=(140, 55, 20))

    # Central Cliff Skyscraper T3 + cantilevered trays + 300m Sky-Crown
    blk(-254, -226, 36, 258, (238, 214, 178), 'Cliff Skyscraper T4 (LIVING / WORK)', dy=8)
    for ty in (92, 128, 164, 200, 236):
        blk(-264, -254, ty, ty + 8, (198, 232, 188))
    blk(-262, -214, 258, 284, (198, 232, 188), '300m Sky-Crown: Gardens, Cultural Hall & Observatory (REC/WORK)', dy=-22)
    dr.line([(X(-240), Y(284)), (X(-240), Y(300))], fill=(30, 30, 30), width=4)

    # Domed Rotunda ("Tourist Center" & Atrium Dwellings)
    blk(-148, -68, 70, 198, (238, 214, 178), 'Domed Rotunda: Concourse, Refectory & Atrium Flats', dy=8)
    blk(-123, -93, 76, 196, (248, 248, 240), 'Sunlit Atrium', dy=40)
    dr.pieslice([X(-148), Y(222), X(-68), Y(174)], 180, 360, fill=(198, 232, 188), outline=(30, 30, 30), width=2)
    # Skybridge Rotunda <-> Tower
    blk(-226, -148, 142, 147, (210, 210, 216), 'Skybridge (y=144m)', dy=-18)

    # Central Park Amphitheatre & Bridges
    blk(-2, 34, 74, 90, (198, 232, 188), 'Park Amphitheatre (REC)', dy=-20)
    dr.text((X(-55), Y(76)), 'Sheltered Central Park & Waterway', font=fs, fill=(30, 100, 45))

    # Horseshoe Ring projected behind Park (y = 84..166)
    dr.rectangle([X(142), Y(144), X(204), Y(84)], fill=(188, 216, 236), outline=(40, 40, 40), width=2)
    dr.text((X(145), Y(118)), 'City Center', font=fs, fill=(20, 20, 20))
    blk(156, 192, 152, 166, (198, 232, 188), 'Mushroom-Pier Belvedere (REC)', dy=-20)

    # Linear City Spine
    blk(204, 468, 84, 112, (238, 214, 178), 'Southern Linear City Spine: Customs, Warehouses, Tavern & Upper Flats (WORK / LIVING)', dy=8)
    for dz in (248, 336, 424):
        blk(dz - 18, dz + 18, 92, 120, (198, 232, 188))

    # Scale bar
    dr.line([(60, H - 45), (60 + 100 * sx, H - 45)], fill=(0, 0, 0), width=4)
    dr.text((60, H - 70), '100 m horizontal (heights x1.3)', font=fs, fill=(0, 0, 0))
    return img


def draw_ew_section():
    """East-West cross-section at z = 10 through West Battered Bastion -> West City Center -> Sheltered Park -> East City Center -> East Battered Bastion."""
    ft = B.font(34, True); f = B.font(18); fs = B.font(15)
    W, H = 2200, 960
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    dr.text((30, 16), 'Transverse Cross-Section (West to East across Horseshoe Neocliff & Central Park at z = +10 m; vertical x2.0)', font=ft, fill=(20, 20, 20))
    dr.text((30, 58), 'Battered 68 deg Dwelling Bastions outside, vaulted City Center commercial/work halls & oculus skylights inside, Mushroom-Pier belvederes on the y = 144 m Promenade, sheltered Central Park in the middle.', font=f, fill=(65, 65, 65))
    sx = 3.1; sy = 3.1 * 2.0
    ox = W / 2; base = H - 120
    X = lambda x: ox + x * sx
    Y = lambda y: base - y * sy

    prof = [(-340, 84), (-146, 84), (-136, 75), (-12, 74), (0, 72.5), (12, 74), (136, 75), (146, 84), (340, 84), (340, 40), (-340, 40)]
    dr.polygon([(X(x), Y(y)) for x, y in prof], fill=(214, 198, 178), outline=(110, 92, 74), width=2)

    for sgn, side in [(-1, 'West'), (1, 'East')]:
        # Battered Dwelling Bastion (r = 212..288 at y=84, tapering to 264 at y=144)
        bpoly = [(sgn * 212, 84), (sgn * 288, 84), (sgn * 264, 144), (sgn * 212, 144)]
        dr.polygon([(X(x), Y(y)) for x, y in bpoly], fill=(238, 214, 178), outline=(30, 30, 30), width=2)
        dr.text((X(sgn * 248) - 48, Y(118)), side + ' Bastion\n(LIVING)', font=fs, fill=(20, 20, 20))
        # City Center Vaulted Arcade (r = 146..212, y = 84..144) with Oculus Skylight shaft
        cpoly = [(sgn * 146, 84), (sgn * 212, 84), (sgn * 212, 144), (sgn * 146, 144)]
        dr.polygon([(X(x), Y(y)) for x, y in cpoly], fill=(188, 216, 236), outline=(30, 30, 30), width=2)
        xa, xb = sorted([X(sgn * 170), X(sgn * 188)])
        dr.rectangle([xa, Y(144), xb, Y(102)], fill=(250, 252, 255), outline=(80, 100, 120), width=2)
        dr.text((X(sgn * 179) - 42, Y(96)), side + ' City Center (WORK)', font=fs, fill=(20, 20, 20))
        # Mushroom-Pier Promenade Belvedere (y = 144..166)
        dr.polygon([(X(sgn * 174), Y(144)), (X(sgn * 184), Y(144)), (X(sgn * 190), Y(152)), (X(sgn * 168), Y(152))],
                   fill=(170, 170, 176), outline=(30, 30, 30), width=2)
        pa, pb = sorted([X(sgn * 162), X(sgn * 196)])
        dr.rectangle([pa, Y(166), pb, Y(152)], fill=(198, 232, 188), outline=(30, 30, 30), width=2)
        dr.text((pa + 4, Y(164)), 'Belvedere (REC)', font=fs, fill=(20, 20, 20))

    # Amphitheatre & Waterway in the Park
    dr.rectangle([X(-6), Y(74.2), X(6), Y(72.5)], fill=(100, 170, 230))
    dr.rectangle([X(14), Y(90), X(56), Y(75)], fill=(198, 232, 188), outline=(30, 30, 30), width=2)
    dr.text((X(16), Y(88)), 'Amphitheatre', font=fs, fill=(20, 20, 20))
    dr.text((X(-78), Y(82)), 'Sheltered Central Park', font=fs, fill=(30, 100, 45))

    dr.line([(60, H - 40), (60 + 100 * sx, H - 40)], fill=(0, 0, 0), width=4)
    dr.text((60, H - 65), '100 m horizontal (heights x2.0)', font=fs, fill=(0, 0, 0))
    return img


def areas_md():
    sec = AREA['bySectorM2']
    lines = [
        '# Arcoforte — Floor Area, Program Breakdown & Capacity (`AREAS.md`)',
        '',
        '*Generated by `arcoforte_blueprint.py` from `src/30-af-plan.js` and `src/31-af-interiors.js`. Do not edit by hand.*',
        '',
        '| Program Sector | Gross Floor (`m²`) | Share | Primary Locations |',
        '|---|---:|---:|---|',
        '| **Living** | %s | %.1f%% | 9 Battered Neocliff Bastions, Rotunda Atrium Rings, 7 Skyscraper Housing Trays, Linear City Upper Flats |' % (
            format(sec['living'], ','), 100.0 * sec['living'] / max(1, AREA['grossM2'])),
        '| **Work** | %s | %.1f%% | Harbour Fishing & Boatyard Works, Vaulted City Center Markets/Workshops/Offices/Academy, Linear Customs & Warehouses, Tower Living-Working Studios |' % (
            format(sec['work'], ','), 100.0 * sec['work'] / max(1, AREA['grossM2'])),
        '| **Recreation & Civic** | %s | %.1f%% | Rotunda Grand Concourse/Refectory/Observatory, 6 Mushroom-Pier Promenade Belvederes, 300 m Sky-Crown Gardens & Cultural Hall, Park Amphitheatre |' % (
            format(sec['rec'], ','), 100.0 * sec['rec'] / max(1, AREA['grossM2'])),
        '| **Infrastructure & Circulation** | %s | %.1f%% | Corridors, Lift/Stair Cores, Sealed Sub-Cliff Automated Industry Vaults & Transit Bore |' % (
            format(sec['infra'], ','), 100.0 * sec['infra'] / max(1, AREA['grossM2'])),
        '| **Total Complex** | **%s** | **100.0%%** | **Peak capacity: %s residents · Refurbished centerpiece: ~%s residents, %s workplaces, %s rec capacity** |' % (
            format(AREA['grossM2'], ','), format(AREA['peakPopulation'], ','),
            format(AREA['refurbishedPopulation'], ','), format(AREA['workplaces'], ','), format(AREA['recCapacity'], ',')),
        '',
        '## Cutaway Interior Units (`AF_INT.buildPlans`)',
        '',
        '| Unit ID | Name | Primary Sector | Storeys Planned | Rooms | Refurbished Status |',
        '|---|---|---|---:|---:|---|'
    ]
    for u in INT['units']:
        rc = sum(len(s['rooms']) for s in u['storeys'])
        lines.append('| `%s` | %s | `%s` | %d | %d | %s |' % (
            u['id'], u['name'], u['sector'], len(u['storeys']), rc, 'Kept & furnished' if u['kept'] else 'Sealed / ruined'))
    lines.append('')
    return '\n'.join(lines)


def blueprint_md():
    return '\n'.join([
        '# Arcoforte — Architectural & Interior Blueprint (`BLUEPRINT.md`)',
        '',
        '*Generated by `arcoforte_blueprint.py` (`floors/A0.png`..`A4.png`, `floors/section-ns.png`, `floors/section-ew.png`).*',
        '',
        '## Sheet Index',
        '- **`floors/A0.png`** — Master top plan (`1:1` synthesis of Soleri Plate 1): sea cliff, harbour platform, NW marina, 7 cliff skyscrapers, domed rotunda, 9 battered dwelling bastions, 13 radial-oculus courtyard skylights, central park with bridges & amphitheatre, and southern linear city.',
        '- **`floors/A1.png`** — Sea level & sub-cliff (`y = 0..42 m`): multilevel boat-lift harbour, marina piers, active refurbished fishing/cold-storage works, and sealed automated industry vaults.',
        '- **`floors/A2.png`** — Park, Rotunda concourse, vaulted City Center & Linear City (`y = 68..112 m`).',
        '- **`floors/A3.png`** — Battered Dwelling Bastions, 13 Oculus Skylights & 6 Mushroom-Pier Promenade Belvederes (`y = 112..166 m`).',
        '- **`floors/A4.png`** — Seven Sea-Cliff Skyscrapers, Rotunda Dome & 300 m Sky-Crown Cultural Canopy + Heliport (`y = 170..300 m`).',
        '- **`floors/section-ns.png`** — Longitudinal North–South cross-section (Ocean to Linear City, matching Soleri Plate 2 Fig. 1 & Plate 3 Fig. 1).',
        '- **`floors/section-ew.png`** — Transverse East–West cross-section across the Horseshoe Neocliff & Sheltered Central Park.',
        ''
    ])


def main():
    os.makedirs(OUT, exist_ok=True)
    for F in FLOORS:
        B.draw_floor(F).save(os.path.join(OUT, F['id'] + '.png'))
    draw_ns_section().save(os.path.join(OUT, 'section-ns.png'))
    draw_ew_section().save(os.path.join(OUT, 'section-ew.png'))
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(areas_md())
    with open(os.path.join(HERE, 'BLUEPRINT.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(blueprint_md())
    print('wrote %d plan sheets, 2 cross-sections, AREAS.md, and BLUEPRINT.md (%s m2, peak %s, refurb %s)' % (
        len(FLOORS), format(AREA['grossM2'], ','), format(AREA['peakPopulation'], ','), format(AREA['refurbishedPopulation'], ',')))


if __name__ == '__main__':
    main()
