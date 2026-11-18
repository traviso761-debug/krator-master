#!/usr/bin/env python3
"""Basilisk's blueprint sheets: the site, the city, the precinct, a district, the works and the dock, the ley line,
the gate, the water and salt, and a section. Drawn by settlements/voth/palace/blueprint.py's draw_floor (the
generator the palace, citadel, monastery and Tempest sheets share; its polygon rooms, overfills, texts, key and bar
are opt-ins added for this sheet set, 2026-11-17) from basilisk_layout.py's numbers, so the sheets and
basilisk_plan.json cannot disagree.

    python basilisk_blueprint.py         # writes floors/*.png and BLUEPRINT.md next to this file

Every sheet is north up, to scale (its bar), u east and v north in metres from the proposed pin (the door of the Hall
of Intention). Everything is *proposed* (PLAN.md)."""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
import blueprint as B
import basilisk_layout as L
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')

# ------------------------------------------------------------------------------------------------ colours
C_CASTE = {1: (122, 168, 96), 2: (214, 150, 62), 3: (150, 108, 70), 4: (150, 42, 42), 5: (104, 72, 172), 6: (150, 42, 42)}
C_CIVIC = (70, 70, 74)
C_WELL = (60, 120, 220)
C_WATER = (178, 212, 238)
C_SEA = (160, 200, 232)
C_BAND = (240, 238, 228)
C_COURT = (244, 224, 214)
C_PREC = (246, 226, 168)
C_STREET = (30, 30, 30)
C_DSTREET = (190, 60, 50)
C_WALL = (50, 50, 54)
C_LEY = (0, 140, 70)
C_SHORE = (20, 90, 190)
C_FIELD = (214, 234, 196)
C_WORKS = (226, 214, 196)
C_PANS = (236, 236, 244)
AXIS = 'north up; u east, v north, metres from the proposed pin (the door of the Hall of Intention)'
KEY_CASTE = [(C_CASTE[1], 'Tenders (cell-warrens)'), (C_CASTE[5], 'Interpreters (towers)'), (C_CASTE[2], 'Makers (quarters)'),
             (C_CASTE[3], 'Drovers (rib houses)'), (C_CASTE[4], 'Line warriors and Bulwarks (lodges)'), (C_CIVIC, 'shared halls, nests, monuments'),
             (C_WELL, 'brick well'), (C_BAND, 'band (yards behind the row)'), (C_COURT, 'district court')]

def PR(n, name, kind, pts, decor, note='', fill=None, at=None, area=None):
    us = [p[0] for p in pts]; vs = [p[1] for p in pts]
    r = dict(n=n, name=name, kind=kind, u0=min(us), u1=max(us), v0=min(vs), v1=max(vs), decor=decor, note=note,
             pts=[tuple(p) for p in pts], area=L.poly_area(pts) if area is None else area)
    if fill: r['fill'] = fill
    if at: r['at'] = at
    return r

def bldg_fill(r):
    if r['key'] == 'gl-well': return C_WELL
    c = r.get('caste')
    if c and r['key'] in ('lk-warren', 'lk-makers', 'lz-makers', 'lk-longhouse', 'lk-lodge', 'lz-lodge', 'lk-tower', 'lz-tower'): return C_CASTE[c]
    return C_CIVIC

def water_cells(plan_f, u0, u1, v0, v1, step):
    """The water as squares (row runs merged) where the model's mask, read bilinear, is over one half."""
    out = []
    v = v0
    while v < v1:
        u = u0; run = None
        while u <= u1:
            wet = plan_f(u + step / 2, v + step / 2) >= 0.5
            if wet and run is None: run = u
            if (not wet or u + step > u1) and run is not None:
                e = u if not wet else u + step
                out.append(([(run, v), (e, v), (e, v + step), (run, v + step)], C_SEA)); run = None
            u += step
        v += step
    return out

def square(R):
    """The square the generator draws for a rect (its centre, the larger half plus 8 m), as u0, u1, v0, v1."""
    cu, cv = (R[0] + R[1]) / 2, (R[2] + R[3]) / 2; e = max(R[1] - R[0], R[3] - R[2]) / 2 + 8
    return (cu - e, cu + e, cv - e, cv + e)

def fit(pts, pad):
    us = [p[0] for p in pts]; vs = [p[1] for p in pts]
    return (min(us) - pad, max(us) + pad, min(vs) - pad, max(vs) + pad)

def inside(fp, rect):
    u0, u1, v0, v1 = rect
    return any(u0 <= p[0] <= u1 and v0 <= p[1] <= v1 for p in fp)

# ------------------------------------------------------------------------------------------------ the sheets
def sheets(p, f_w):
    S = []
    LD = p['_LD']; LA = math.atan2(LD[1], LD[0])
    placed = p['placed']; wall = p['wall']['line']
    dists = p['districts']; gq = p['gate_quarter']
    shore = [(l, C_SHORE, 3) for l in p['site']['shore_model']]
    coil = [(p['coil']['street'], C_STREET, 5)]
    wall_line = [(wall, C_WALL, 7)]
    dstreets = [(d['street'], C_DSTREET, 2) for d in dists + [gq]]
    mole = p['ley']['mole']; shore_t = p['ley']['shore_t']
    ley_line = [([(0, 0), (LD[0] * mole[1], LD[1] * mole[1])], C_LEY, 3)]
    city_rect = fit(wall, 60)
    by_where = lambda w: [r for r in placed if r['where'] == w]
    bfills = lambda rect: [(r['fp'], bldg_fill(r)) for r in placed if inside(r['fp'], rect)]
    res = p['water']['reservoirs']

    # ---- B0 the site
    R0 = (-13500, 9000, -21000, 6000)
    fills = water_cells(f_w, *square(R0), 150.0)
    for poly in p['country']['fields']: fills.append((poly, C_FIELD))
    lines = []
    for lv, ls in p['site']['contours'].items():
        for l in ls: lines.append((l, (150, 130, 110), 1))
    for k, rv in p['site']['rivers'].items():
        lines.append((rv['pts'], (40, 110, 210), 3 if rv['perennial'] else 2))
    for rd in p['country']['roads']: lines.append((rd['pts'], (120, 90, 50), 3))
    lines += [([(0, 0), (LD[0] * 9000, LD[1] * 9000)], C_LEY, 2)]
    lines += shore + wall_line
    op = p['site']['old_pin_uv']
    rooms = [
        PR(1, 'Basilisk, inside its wall', 'city', wall, 3, 'the Hall of Intention at the proposed pin, 5.1 px %.2f,%.2f: the sabkha at the sea\'s south-west shore, -2,600 m (the model\'s floor), level with the water; the city stands on brick platforms 4-6 m high, its precinct on a 12 m mound (after Mohenjo-daro)' % tuple(p['site']['pin_px']), fill=(230, 214, 176), area=L.poly_area(wall)),
        PR(2, 'The old pin (slrodrkrls, "Sauropolis")', 'void', [(op[0] - 180, op[1] - 180), (op[0] + 180, op[1] - 180), (op[0] + 180, op[1] + 180), (op[0] - 180, op[1] + 180)], 0, '5.1 px 765,1596: a water cell of the eastern terminal sea; the scale-model queue moves it ashore here and renames it Basilisk', fill=(220, 60, 60)),
        PR(3, 'Fields on the floor south of the city (bamboo rice, taro, shade-manioc)', 'garden', p['country']['fields'][1], 1, 'the jungle shore grows grain poorly: ~800 ha near the city; Iguana and the warrens send the rest (LZ_TUNE)', fill=C_FIELD),
        PR(4, 'Fields west of the city', 'garden', p['country']['fields'][2], 1, '', fill=C_FIELD),
        PR(5, 'Fields south-west', 'garden', p['country']['fields'][0], 1, '', fill=C_FIELD),
    ]
    tl = p['site']['rivers']['r762']['pts']; bb = p['site']['rivers']['r249']['pts']
    texts = [(op[0] + 90, op[1] + 40, 'old pin, in the sea', (180, 40, 40), 22),
             (-4000, 4600, 'the eastern terminal sea (9,272 km2, salt; "the Lizardman Rift Sea")', C_SHORE, 26),
             (tl[2][0] + 120, tl[2][1], 'Tlahn Gill (a wadi, r762)', (40, 110, 210), 22),
             (bb[1][0] + 120, bb[1][1], 'Blek Beck (perennial, r249, 15 m3/s)', (40, 110, 210), 22),
             (LD[0] * 5200 + 100, LD[1] * 5200, 'the ley line: the east reliquary, %.1f km at %.1f deg' % (p['ley']['to_reliquary_km'], p['ley']['bearing_deg']), C_LEY, 22),
             (-13000, -20000, 'contours (brown): +25, +100, +250, +500, +1,000 m over the floor. Due south the floor runs flat %.0f km (under +5 m), then rises: +25 m at %.0f km, +100 at %.0f, +250 at %.0f' % tuple(p['site']['flat_south_km'][k] for k in ('5', '25', '100', '250')), (120, 100, 80), 22)]
    for rd in p['country']['roads']:
        q = rd['pts'][1]; texts.append((q[0] - 2600 if q[0] > 0 else q[0] - 1800, q[1] + 500, rd['name'].split(' (')[0], (120, 90, 50), 22))
    S.append(dict(id='B0', R=6000, rect=R0, title='Sheet B0: the site: Basilisk on the sabkha at the western end of the eastern terminal sea',
        sub='The scale model\'s pin stands in the water (-2,600 m, the raster\'s floor). The city is proposed on the flat sabkha 4 km south-east of it (the nearest dry cell is 2 km south, too tight a corner for 15,000 between the shore and the bay), between the sea\'s south shore and the bay where Tlahn Gill comes in: level with the sea, so the city stands on platforms. The shore road north (round the sea\'s west end, to Tuatara and the east reliquary), the road west to Iguana and the Komodo road east all leave from the one gate; the ley line alone goes straight, north-east over the water. Water from the model\'s mask (squares, bilinear at one half), its shore line (blue), the contours read from h.png.',
        rooms=rooms, fills=fills, lines=lines, texts=texts, axisnote=AXIS, bar=1000,
        key=[(C_SEA, 'the sea (the model\'s mask)'), (C_FIELD, 'fields'), ((230, 214, 176), 'the city'), ((40, 110, 210), 'rivers'), ((120, 90, 50), 'roads'), (C_LEY, 'the ley line')]))

    # ---- B1 the city
    wx = max(q[0] for r in by_where('works') for q in r['fp'])
    R1 = (city_rect[0] - 40, max(city_rect[1], wx) + 80, city_rect[2] - 120, city_rect[3] + 700)
    fills = water_cells(f_w, *square(R1), 40.0)
    under = []
    for d in dists + [gq]:
        fills += [(bd['poly'], C_BAND) for bd in d['bands']] + [(d['court'], C_COURT)]
    rooms = [PR(1, 'The precinct of Intention, on the Mound', 'precinct', p['precinct']['poly'], 4, 'the Hall of Intention (its axis the ley line), the Interpreters\' college and its thirteen towers, the seer\'s hall, the Nest of Returns (B2)', fill=C_PREC),
             PR(2, 'The court of the First Turn', 'court', p['coil']['first_turn'], 3, 'where the Great Coil begins; the great tank', fill=(214, 236, 250))]
    for d in dists:
        pop = sum(d['placed_people'].values())
        rooms.append(marker(3 + d['j'], 'District %d (%s, %s)' % (d['j'] + 1, d['chirality'], ['south', 'east', 'north', 'west'][d['side']]), d, 60,
                            '%d winding%s, the first band %.0f m; ~%d people; its own stone nest hall in its court; its mouth onto the Great Coil faces the Hall%s' % (d['windings'], '' if d['windings'] == 1 else 's', d['band0'], pop, '; winds the same way as district 1: the seventh breaks the pairs (the city\'s flaw)' if d['j'] == 6 else '')))
    rooms.append(marker(10, 'The gate quarter (the Coil\'s last band, run on into the tongue)', gq, 60, 'the mustering ground in its court, the barracks, the seven granaries of the Allotment, the plunder warehouse, the bone hall; the garrison\'s lodges (B6)'))
    wr = by_where('works'); wpts = [q for r in wr for q in r['fp']]
    core = [q for r in wr if r['key'] != 'lz-weir' for q in r['fp']]
    rooms.append(PR(11, 'The works on the bay', 'works', list(L.rect_sk(*_bbox_sk(core, 15))), 2, 'the dock after Lothal, its store, the bronze hall, the charcoal and ore yard; the weirs in the bay (B4)', fill=C_WORKS))
    rooms.append(PR(12, 'The reservoirs (x7)', 'pool', res[0]['poly'], 1, 'seven, after Dholavira, each 1.25 times the last; fed by the leat from Tlahn Gill (B7)', fill=C_WATER))
    under += [(r['poly'], C_WATER, (40, 40, 40)) for r in res[1:]]
    lines = shore + [(d['outline'] + [d['outline'][0]], (150, 150, 150), 1) for d in dists + [gq]] + dstreets + coil + wall_line + ley_line
    texts = [(R1[0] + 60, R1[3] + 280, 'the eastern terminal sea', C_SHORE, 24), (p['wall']['gate'][0] + 30, p['wall']['gate'][1] - 40, 'the gate', (0, 0, 0), 22),
             (LD[0] * shore_t + 40, LD[1] * shore_t - 30, 'the ley mole', C_LEY, 22)]
    S.append(dict(id='B1', R=1600, rect=R1, title='Sheet B1: the city: the Great Coil, seven district spirals and the gate quarter',
        sub='One squared spiral street, the Great Coil (black), winds out from the precinct through two windings, its corners 75 and 105 degrees, each winding 1.25 times the last; it has thirteen segments and ends at the one gate in the tongue\'s foot. Between its turns lie seven districts, each its own spiral (red) wound in to its nest hall, every door facing in, each district\'s mouth opening on the Coil toward the Hall; their chirality alternates, cw and ccw, and the seventh breaks the pairing. The wall follows the Coil\'s last winding. The ley line (green) is the one straight thing: from the Hall\'s door through the Ley Slot to the mole. %d buildings; %d housed.' % (len(placed), p['census']['total_housed']),
        rooms=rooms, fills=fills, overfills=under + [(r['fp'], bldg_fill(r)) for r in placed], lines=lines, texts=texts, axisnote=AXIS, bar=200, key=KEY_CASTE + [(C_WATER, 'water')]))

    # ---- B2 the precinct
    pp = p['precinct']['poly']; R2 = fit(pp, 70)
    fills = [(pp, C_PREC), (p['coil']['first_turn'], (214, 236, 250)), (p['precinct']['court'], (236, 230, 214))]
    for d in dists:
        for bd in d['bands']: fills.append((bd['poly'], C_BAND))
    rooms, extra, n = grouped(by_where('precinct'), 1, lambda r: ('`%s`: ' % r['key']) + r.get('role', ''),
                              lambda r: 4 if r['key'] in ('lk-greathall', 'lk-college', 'lk-nest') else 3, bldg_fill)
    rooms.append(PR(n, 'The Court of Intention', 'court', p['precinct']['court'], 3, 'before the Hall\'s door, along the line: the seven obelisks either side (the fifth twists the other way), the ley stone', fill=(236, 230, 214))); n += 1
    rooms.append(PR(n, 'The court of the First Turn, the great tank', 'court', p['coil']['first_turn'], 3, 'the Great Coil begins at its north-east corner; a brick tank after Mohenjo-daro\'s Great Bath, its water a core/water still record', fill=(214, 236, 250))); n += 1
    lines = coil + dstreets + ley_line
    S.append(dict(id='B2', R=300, rect=R2, title='Sheet B2: the precinct of Intention: the Hall, the college and the Nest of Returns, on the Mound',
        sub='The Mound stands 12 m over the sabkha, its sides battered, faced in polygonal basalt. The Hall of Intention (lk-greathall) is the one building off the skew grid: its axis is the ley line, its door (the origin) facing the reliquary. Before it the Court of Intention, its seven twisted obelisks paired across the line, the fifth twisting the other way, the ley stone at 58 m. The Interpreters\' college (lk-college) faces the Hall from the west in a squared spiral of their towers; the seer\'s hall holds the model of the whole country, by which the Allotment is remembered; the Nest of Returns, where the Interpreters are reborn, stands north-east; the Hall\'s Tenders live along the south. No banners, drums or signal fires; the bells have no clappers.',
        rooms=rooms, fills=fills, overfills=extra + [(r['fp'], bldg_fill(r)) for r in placed if r['where'] != 'precinct' and inside(r['fp'], R2)], lines=lines, axisnote=AXIS, bar=50,
        key=[(C_PREC, 'the Mound'), (C_CASTE[5], 'Interpreters'), (C_CASTE[1], 'Tenders'), (C_CIVIC, 'halls and monuments'), (C_BAND, 'district bands'), (C_LEY, 'the ley line'), (C_STREET, 'the Great Coil')]))

    # ---- B3 a district: district 5 (south, two windings, cw)
    # the district is long (its band is ~4:1): the sheet shows its west half, from the spiral's end turns and its mouth to
    # just past the nest hall at the middle of its court
    d = dists[4]
    (ax0, ay0), (ax1, ay1) = d['court_axis']; Lc = math.hypot(ax1 - ax0, ay1 - ay0)
    end = min((ax0, ay0), (ax1, ay1)); far = max((ax0, ay0), (ax1, ay1))
    f3 = 0.27; c3 = (end[0] + (far[0] - end[0]) * f3, end[1] + (far[1] - end[1]) * f3); e3 = Lc * f3 + 190
    R3 = (c3[0] - e3, c3[0] + e3, c3[1] - e3, c3[1] + e3)
    fills = [(bd['poly'], (255, 236, 200) if i == d['flaw_band'] else C_BAND) for i, bd in enumerate(d['bands'])] + [(d['court'], C_COURT)]
    rooms = []; n = 1
    for r in placed:
        if r['where'] == d['id'] and r.get('role') == 'court':
            rooms.append(PR(n, L.KIT[r['key']]['name'], 'hall', r['fp'], 3, '`%s`' % r['key'], fill=C_CIVIC)); n += 1
    fb = d['bands'][d['flaw_band']]
    rooms.append(PR(n, 'The flaw: one band fronted on its outer edge', 'flaw', fb['poly'], 2, 'its doors face away from the nest: the district\'s one deliberate break, the Lie (DESIGN.md 2.2); chosen by the plan\'s own hash, kept in the manifest', fill=(255, 236, 200), at=centroid(fb['poly']))); n += 1
    mp = d['mouth']
    rooms.append(PR(n, 'The district\'s mouth', 'passage', [(mp[0] - 6, mp[1] - 6), (mp[0] + 6, mp[1] - 6), (mp[0] + 6, mp[1] + 6), (mp[0] - 6, mp[1] + 6)], 1, 'its spiral street\'s outer end, on the Great Coil, facing the Hall', fill=(255, 255, 255))); n += 1
    pop = d['placed_people']
    sub = ('District %d, the south band of the second winding: its own rectangular leiwen (%d windings, the first band %.0f m deep, each 1.25 times the last; corners 75 and 105 degrees), wound %s in to the stone nest hall in its long court. Every row fronts its band\'s inner edge, so every door faces the nest; the castes go from the nest outward in Gila\'s order: Tenders, Interpreters, Makers, Drovers, then the warriors\' and Bulwarks\' lodges. Wells (blue) stand in the yards behind each row. Housed: %s.' %
           (d['j'] + 1, d['windings'], d['band0'], 'clockwise' if d['chirality'] == 'cw' else 'counter-clockwise', ', '.join('%s %d' % (L.CASTE_NAME[c], v) for c, v in pop.items() if v)))
    S.append(dict(id='B3', R=600, rect=R3, title='Sheet B3: a district spiral (district 5, its west half): its nest hall, its castes, its flaw',
        sub=sub, rooms=rooms, fills=fills, overfills=[(r['fp'], bldg_fill(r)) for r in placed if r['where'] == d['id'] and r.get('role') != 'court'],
        lines=[(d['street'], C_DSTREET, 3)] + coil, axisnote=AXIS, bar=50, key=KEY_CASTE + [((255, 236, 200), 'the flaw band')]))

    # ---- B4 the works on the bay and the dock
    R4 = fit(wpts, 70)
    fills = water_cells(f_w, *square(R4), 8.0)
    rooms, extra, n = grouped(wr, 1, lambda r: '`%s`%s: %s' % (r['key'], ' (owed)' if L.KIT[r['key']].get('owed') else '', r.get('role', '')), lambda r: 2,
                              lambda r: C_WATER if r['key'] == 'lk-dock' else (150, 130, 100))
    S.append(dict(id='B4', R=400, rect=R4, title='Sheet B4: the works on the bay: the bronze hall, the dock after Lothal, the weirs',
        sub='Outside the east wall, between it and the bay where Tlahn Gill comes in. The Great Bronze Hall (lk-bronzehall) casts the country\'s bronze from Tuatara\'s copper (70 t) and Komodo and Iguana\'s tin (16 t capacity, nine to one: ~78 t capacity, ~73 t cast to plan), at seven furnaces fed with charcoal from the jungle shore; its ingots go out along the Coil as the outward gift. The dock is a brick basin after Lothal\'s, its sluice to the north, its stone store (lk-dockstore) on a ventilated podium beside it: the eleven-rib reed barges (lz-barge) bring the Coil\'s loads by water and carry relics straight out along the ley line. Every bulk load still marches round to the South Gate: there is no door in the east wall but the Ley Slot (lk-slot). Fish (LZ_TUNE: 600 t) from the weirs standing in the bay.',
        rooms=rooms, fills=fills, overfills=extra + [(r['fp'], bldg_fill(r)) for r in placed if r['where'] != 'works' and inside(r['fp'], R4)],
        lines=shore + wall_line + ley_line + coil + dstreets, axisnote=AXIS, bar=50,
        key=[(C_SEA, 'the bay (the model\'s mask)'), ((150, 130, 100), 'the works'), (C_WALL, 'the east wall'), (C_LEY, 'the ley line')]))

    # ---- B5 the ley line and the reliquary approach
    ends = [(LD[0] * -60, LD[1] * -60), (LD[0] * (mole[1] + 40), LD[1] * (mole[1] + 40))]
    R5 = fit(ends, 260)
    fills = water_cells(f_w, *square(R5), 20.0)
    w9 = p['ley']['corridor_w'] / 2
    def strip(t0, t1, half):
        nx, nv = -LD[1], LD[0]
        return [(LD[0] * t0 + nx * half, LD[1] * t0 + nv * half), (LD[0] * t1 + nx * half, LD[1] * t1 + nv * half),
                (LD[0] * t1 - nx * half, LD[1] * t1 - nv * half), (LD[0] * t0 - nx * half, LD[1] * t0 - nv * half)]
    rooms = [PR(1, 'The Hall of Intention', 'hall', [r for r in placed if r['key'] == 'lk-greathall'][0]['fp'], 4, 'its door the line\'s origin, facing the reliquary', fill=C_CIVIC),
             PR(2, 'The Court of Intention', 'court', p['precinct']['court'], 3, 'the seven obelisks, the ley stone (lz-ley) at 58 m', fill=(236, 230, 214)),
             PR(3, 'The Ley Way', 'passage', strip(120, p['ley']['slot_t'], w9), 2, 'a 9 m way kept clear straight through every band and court it crosses: the only short way across the spiral; at each of the Great Coil\'s %d crossings a twisted obelisk' % len(p['ley']['crossings']), fill=(200, 236, 206)),
             PR(4, 'The Ley Slot', 'entrance', [r for r in placed if r['key'] == 'lk-slot'][0]['fp'], 3, 'a Tender\'s 1.2 m triangular wicket through the east wall, the nested portal\'s smallest; no other door in the wall but the gate', fill=C_CIVIC),
             PR(5, 'The strand', 'court', strip(p['ley']['slot_t'] + 8, shore_t, 30), 1, 'the sabkha between the wall and the water, the line paved across it', fill=(240, 236, 220)),
             PR(6, 'The ley mole', 'passage', strip(shore_t, mole[1], 6), 3, 'a basalt mole %d m into the sea, straight on the line; the barge stair and a stela pair (the Coil and fracture glyphs) at its end; the relics go out from here by water to the east reliquary, the one load that goes straight' % (mole[1] - shore_t), fill=(150, 150, 150))]
    S.append(dict(id='B5', R=1400, rect=R5, title='Sheet B5: the ley line and the reliquary approach',
        sub='The kit\'s one straight thing (DESIGN.md 4), at the capital\'s scale: from the Hall\'s door on a bearing of %.1f degrees to the east reliquary, %.1f km away on the sea\'s north strand. It crosses the Great Coil %d times, leaves by the Ley Slot, crosses the strand and runs on as a mole into the sea. Its buildings stand back from the line; nothing is built on it.' % (p['ley']['bearing_deg'], p['ley']['to_reliquary_km'], len(p['ley']['crossings'])),
        rooms=rooms, fills=fills, overfills=[(r['fp'], bldg_fill(r)) for r in placed if inside(r['fp'], R5)],
        lines=shore + coil + dstreets + wall_line + ley_line, axisnote=AXIS, bar=100,
        key=[(C_SEA, 'the sea'), ((200, 236, 206), 'the Ley Way'), (C_LEY, 'the line'), (C_STREET, 'the Great Coil'), (C_WALL, 'the wall')] + KEY_CASTE[:6]))

    # ---- B6 the walls and the gate
    g = p['wall']['gate']; R6 = (g[0] - 420, g[0] + 300, g[1] - 140, g[1] + 520)
    rooms = []; n = 1
    gr = [r for r in placed if r['key'] == 'lk-gate'][0]
    rooms.append(PR(n, 'The gate (lk-gate)', 'entrance', gr['fp'], 4, 'one triangular passage sized for the Bulwarks (6 m high, 3.7 m wide), nested bronze frames seven deep at both mouths, a great spiral eye over the way; the Coil\'s mouth', fill=C_CIVIC)); n += 1
    for r in placed:
        if r['key'] == 'lk-watchtower' and inside(r['fp'], R6):
            rooms.append(PR(n, 'Watchtower %s' % r['role'].split()[1], 'guard', r['fp'], 3, r['role'], fill=C_CASTE[4])); n += 1
    rooms.append(marker(n, 'The tongue', dict(centre=(g[0] - 60, g[1] + 330), area=0), 24, 'the gate quarter\'s band run on past the south wall: the last 400 m of the Great Coil run down it between the garrison\'s lodges to the gate, under the wall on both hands')); n += 1
    S.append(dict(id='B6', R=400, rect=R6, title='Sheet B6: the walls and the gate',
        sub='The wall follows the city\'s outline, the Great Coil\'s last winding run on into a tongue past the south wall, so the way in is the spiral\'s own end. Seven runs (%.0f m; %d of the kit\'s 20 m lk-wall runs end to end), cyclopean basalt 8 m to the walk, leaning in on the outer face and out on the inner; thirteen twisted watchtowers, the ninth set off its spacing (the wall\'s flaw). One gate, in the tongue\'s foot, facing south toward the roads; the only other opening is the Ley Slot. No banners, drums or signal fires on the walk.' % (p['wall']['length'], p['wall']['lk_wall_runs']),
        fills=[(bd['poly'], C_BAND) for bd in gq['bands']] + [(gq['court'], C_COURT)],
        rooms=rooms, overfills=[(r['fp'], bldg_fill(r)) for r in placed if r['key'] not in ('lk-gate', 'lk-watchtower') and inside(r['fp'], R6)],
        lines=coil + dstreets + wall_line + [(rd['pts'], (120, 90, 50), 6) for rd in p['country']['roads']], axisnote=AXIS, bar=50, key=KEY_CASTE[:6] + [(C_WALL, 'the wall'), (C_STREET, 'the Great Coil'), ((120, 90, 50), 'the roads, all from the gate')]))

    # ---- B7 the water and the salt
    pr_ = by_where('pans'); ppts = [q for r in pr_ for q in r['fp']]
    rpts = [q for r in res for q in r['poly']] + [tuple(p['water']['check_dam'])]
    R7 = fit(ppts + rpts + wall, 120)
    fills = water_cells(f_w, *square(R7), 40.0)
    for d in dists + [gq]:
        for bd in d['bands']: fills.append((bd['poly'], C_BAND))
    rooms = []; n = 1
    for r in res:
        rooms.append(PR(n, 'Reservoir %d' % r['i'], 'pool', r['poly'], 1, 'its water %.1f m over the sabkha (a core/water still record)' % r['level_m'], fill=C_WATER)); n += 1
    more, extra, n = grouped(pr_, n, lambda r: '`%s`: %s' % (r['key'], r.get('role', '')), lambda r: 1,
                             lambda r: C_PANS if r['key'] == 'gl-pans' else (150, 130, 100))
    rooms += more
    dm = p['water']['check_dam']
    rooms.append(PR(n, 'The check dam on Tlahn Gill', 'works', [(dm[0] - 30, dm[1] - 8), (dm[0] + 30, dm[1] - 8), (dm[0] + 30, dm[1] + 8), (dm[0] - 30, dm[1] + 8)], 1, 'a basalt weir across the wadi; the leat (blue) fills the chain in the wet season, each reservoir spilling to the next', fill=C_CIVIC)); n += 1
    S.append(dict(id='B7', R=1600, rect=R7, title='Sheet B7: the water and the salt',
        sub='Fresh water after Dholavira, the Indus city on a salt flat that caught its seasonal streams: a check dam on Tlahn Gill (a wadi, dry half the year) and a leat to seven reservoirs outside the south wall, each 1.25 times the last; a cistern in every district court, a brick well in every yard (the rain is ~1,850-2,086 mm). The salt (LZ_TUNE: 55 t a year, scaled back from 115 t now that Skink carries the country) comes from three squared spirals of pans on the strand west of the city, two wet-season boiling floors (lk-boil: crusted bronze pans over jungle charcoal) and the salt store by the north-west corner.',
        rooms=rooms, fills=fills, overfills=extra + [(r['fp'], bldg_fill(r)) for r in placed if r['where'] not in ('pans',) and inside(r['fp'], R7)],
        lines=shore + coil + wall_line + [(p['water']['leat'], (40, 110, 210), 4)] + [(p['site']['rivers']['r762']['pts'], (40, 110, 210), 3)],
        axisnote=AXIS, bar=200, key=[(C_SEA, 'the sea'), (C_WATER, 'reservoirs'), (C_PANS, 'salt pans'), (C_BAND, 'the city\'s bands')]))
    return S

def marker(n, name, d, size, note):
    """A district's key entry drawn as a small numbered square at its centre (its outline a line, its bands under it),
    so the bands and the court stay visible; the key gives the whole district's area."""
    c = d['centre']; h = size / 2
    if d.get('court_axis'):          # a quarter of the way along the court, clear of the nest hall at its middle
        (x0, y0), (x1, y1) = d['court_axis']; c = (x0 + (x1 - x0) * 0.2, y0 + (y1 - y0) * 0.2)
    return PR(n, name, 'district', [(c[0] - h, c[1] - h), (c[0] + h, c[1] - h), (c[0] + h, c[1] + h), (c[0] - h, c[1] + h)], 2, note,
              fill=(255, 255, 255), area=d['area'])

def grouped(rs, n, note, decor, fill):
    """One key entry per kind of piece (named with its count), drawn once as a numbered room; its other copies are
    drawn as unnumbered overfills in the same colour."""
    rooms, extra, first = [], [], {}
    for r in rs:
        k = r['key']
        if k in first:
            extra.append((r['fp'], fill(r), (40, 40, 40))); continue
        cnt = sum(1 for q in rs if q['key'] == k)
        first[k] = n
        rkind = L.KIT[k].get('cls', 'hall')
        if rkind == 'building': rkind = 'hall'
        rooms.append(PR(n, L.KIT[k]['name'] + (' (x%d)' % cnt if cnt > 1 else ''), rkind, r['fp'], decor(r), note(r), fill=fill(r))); n += 1
    return rooms, extra, n

def clip_poly(pts, box):
    """Sutherland-Hodgman against an axis box (u0, u1, v0, v1)."""
    u0, u1, v0, v1 = box
    def cut(ps, inside, inter):
        out = []
        for i in range(len(ps)):
            a, b = ps[i - 1], ps[i]
            if inside(b):
                if not inside(a): out.append(inter(a, b))
                out.append(b)
            elif inside(a): out.append(inter(a, b))
        return out
    def ix(c):
        return lambda a, b: (c, a[1] + (b[1] - a[1]) * (c - a[0]) / ((b[0] - a[0]) or 1e-9))
    def iy(c):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (c - a[1]) / ((b[1] - a[1]) or 1e-9), c)
    ps = list(pts)
    for inside, inter in ((lambda p: p[0] >= u0, ix(u0)), (lambda p: p[0] <= u1, ix(u1)), (lambda p: p[1] >= v0, iy(v0)), (lambda p: p[1] <= v1, iy(v1))):
        if not ps: break
        ps = cut(ps, inside, inter)
    return ps

def clip_line(pts, box):
    """A polyline cut to the box: a list of polylines (Liang-Barsky per segment, joined where they continue)."""
    u0, u1, v0, v1 = box; out = []; cur = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]; dx, dy = x1 - x0, y1 - y0; t0, t1 = 0.0, 1.0; ok = True
        for p_, q_ in ((-dx, x0 - u0), (dx, u1 - x0), (-dy, y0 - v0), (dy, v1 - y0)):
            if p_ == 0:
                if q_ < 0: ok = False; break
            else:
                t = q_ / p_
                if p_ < 0: t0 = max(t0, t)
                else: t1 = min(t1, t)
        if not ok or t0 > t1:
            if len(cur) > 1: out.append(cur)
            cur = []; continue
        a = (x0 + dx * t0, y0 + dy * t0); b = (x0 + dx * t1, y0 + dy * t1)
        if not cur or abs(cur[-1][0] - a[0]) > 1e-6 or abs(cur[-1][1] - a[1]) > 1e-6:
            if len(cur) > 1: out.append(cur)
            cur = [a]
        cur.append(b)
    if len(cur) > 1: out.append(cur)
    return out

def framed(F):
    """Cut a sheet's polygons, lines and labels to the square the generator draws (its rect's centre, the larger half
    plus 8 m), so nothing spills into the title or the key."""
    q = F['rect']; cu, cv = (q[0] + q[1]) / 2, (q[2] + q[3]) / 2; ext = max(q[1] - q[0], q[3] - q[2]) / 2 + 8
    box = (cu - ext + 2, cu + ext - 2, cv - ext + 2, cv + ext - 2)
    F['rect'] = (cu - ext + 8, cu + ext - 8, cv - ext + 8, cv + ext - 8)
    # the water squares outlined in their own colour (a fill's outline is grey by default: stripes)
    F['fills'] = [(it[0], it[1], '', C_SEA) if it[1] == C_SEA else it for it in F.get('fills', [])]
    for k in ('fills', 'overfills'):
        out = []
        for it in F.get(k, []):
            ps = clip_poly(it[0], box)
            if len(ps) >= 3: out.append((ps,) + tuple(it[1:]))
        F[k] = out
    lines = []
    for it in F.get('lines', []):
        for seg in clip_line(it[0], box): lines.append((seg,) + tuple(it[1:3]))
    F['lines'] = lines
    F['texts'] = [t for t in F.get('texts', []) if box[0] <= t[0] <= box[1] - 300 and box[2] + 40 <= t[1] <= box[3]]
    rooms = []
    for r in F['rooms']:
        ps = clip_poly(r['pts'], box)
        if len(ps) < 3: continue
        r = dict(r); r['pts'] = ps
        r['u0'], r['u1'] = min(p[0] for p in ps), max(p[0] for p in ps); r['v0'], r['v1'] = min(p[1] for p in ps), max(p[1] for p in ps)
        rooms.append(r)
    F['rooms'] = rooms
    return F

def _bbox_sk(pts, pad):
    ab = [L.unsk(u, v) for u, v in pts]
    return (min(a for a, b in ab) - pad, max(a for a, b in ab) + pad, min(b for a, b in ab) - pad, max(b for a, b in ab) + pad)

def centroid(pts):
    return L.centroid(pts)

# ------------------------------------------------------------------------------------------------ the section
def section(p):
    """A section along the ley line, from the tongue's side of the city to the mole's end; heights x25."""
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2600, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the ley line (heights x25): the sabkha, the platforms, the Mound, the wall, the strand and the mole', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'The sabkha is the model\'s floor, -2,600 m, level with the sea (surface proposed -2,600.5). Districts on brick platforms 5 m high; the precinct\'s Mound 12 m; the wall 8 m to the walk over the platforms; reservoirs sunk 4 m (not in this plane). Metres along the line from the Hall\'s door.', font=f, fill=(70, 70, 70))
    back = -_back_wall(p)
    t0, t1 = back - 60, p['ley']['mole'][1] + 60
    sx = (W - 120) / (t1 - t0); sy = 25 * sx; base = H - 200
    X = lambda t: 60 + (t - t0) * sx
    Y = lambda h: base - h * sy
    LD = p['_LD']
    dr.rectangle([X(t0), Y(0), X(t1), H], fill=(226, 218, 196))
    shore_t = p['ley']['shore_t']
    dr.rectangle([X(shore_t), Y(-0.5), X(t1), H], fill=(160, 200, 232))
    dr.text((X(shore_t) + 10, Y(-0.5) + 10), 'the sea', font=f, fill=(20, 90, 190))
    # where the line is inside the wall (behind the origin it runs back through the precinct and district 3/4 to the west wall)
    slot = p['wall']['slot_t']
    dr.rectangle([X(back), Y(5), X(slot), Y(0)], fill=(206, 176, 140), outline=(80, 60, 40))
    dr.text((X(back) + 10, Y(5) - 26), 'district platforms, +5 m (baked brick, drains)', font=fs, fill=(80, 60, 40))
    m0, m1 = -150, 150
    dr.polygon([(X(m0 - 30), Y(5)), (X(m0), Y(12)), (X(m1), Y(12)), (X(m1 + 30), Y(5))], fill=(190, 180, 170), outline=(40, 40, 40))
    dr.text((X(m0) + 6, Y(12) - 26), 'the Mound, +12 m, battered, polygonal basalt', font=fs, fill=(40, 40, 40))
    dr.rectangle([X(-30), Y(12 + 15), X(0), Y(12)], fill=(70, 70, 74)); dr.text((X(-30) - 10, Y(27) - 24), 'Hall of Intention 15 m', font=fs, fill=(0, 0, 0))
    for tt in p['ley']['crossings']:
        dr.line([(X(tt), Y(5)), (X(tt), Y(5 + 11))], fill=(70, 70, 74), width=4); dr.text((X(tt) + 4, Y(16) - 20), 'obelisk', font=fs, fill=(0, 0, 0))
    for tt in (slot, back):
        dr.polygon([(X(tt - 5), Y(0)), (X(tt - 3), Y(13)), (X(tt + 3), Y(13)), (X(tt + 5), Y(0))], fill=(50, 50, 54))
        dr.text((X(tt) + 10, Y(13) - 22), 'the wall: 8 m to the walk over the platform, 13 m over the sabkha' + (' (the Ley Slot)' if tt == slot else ''), font=fs, fill=(0, 0, 0))
    mole = p['ley']['mole']
    dr.rectangle([X(shore_t), Y(1.5), X(mole[1]), Y(-0.5)], fill=(150, 150, 150), outline=(40, 40, 40))
    dr.text((X(shore_t) + 20, Y(1.5) - 24), 'the ley mole (basalt, 1.5 m over the water), %d m' % (mole[1] - shore_t), font=fs, fill=(0, 0, 0))
    dr.text((X(slot) + 20, Y(0) + 8), 'the strand (sabkha)', font=fs, fill=(80, 60, 40))
    # scale
    bx = X(t0) + 10; by = H - 60
    dr.line([(bx, by), (bx + 200 * sx, by)], fill=(0, 0, 0), width=3); dr.text((bx, by - 24), '200 m along the line; heights x25', font=fs, fill=(0, 0, 0))
    return img

def _back_wall(p):
    """How far behind the Hall's door, along the line, the line meets the wall."""
    LD = p['_LD']; wl = p['wall']['line']; best = None
    for i in range(len(wl) - 1):
        a, b = wl[i], wl[i + 1]
        ex, ev = b[0] - a[0], b[1] - a[1]; d = (-LD[0], -LD[1])
        den = d[0] * ev - d[1] * ex
        if abs(den) < 1e-9: continue
        tt = ((a[0]) * ev - (a[1]) * ex) / den
        ss = ((a[0]) * d[1] - (a[1]) * d[0]) / den
        if tt > 0 and 0 <= ss <= 1: best = tt if best is None else min(best, tt)
    return best or 900.0

# ------------------------------------------------------------------------------------------------ main
def main():
    p = L.build()
    _, bil = L.model_reader()
    f_w = lambda u, v: bil(*L.uv_px(u, v), 1)
    os.makedirs(OUT, exist_ok=True)
    md = ['# Basilisk: the blueprint sheets\n',
          'Generated by `basilisk_blueprint.py` from `basilisk_layout.py` (the same numbers as `basilisk_plan.json`); drawn by the shared sheet generator',
          '`settlements/voth/palace/blueprint.py`. Every sheet is north up and to scale (its bar); u east, v north, metres from the proposed pin, the door of',
          'the Hall of Intention. Everything is *proposed*: `PLAN.md` is the plan and the owner\'s questions.\n']
    for F in sheets(p, f_w):
        print('drawing', F['id'])
        img = B.draw_floor(framed(F)); img.save(os.path.join(OUT, F['id'] + '.png'), optimize=True)
        md.append('\n## %s\n' % F['title'])
        md.append('![%s](floors/%s.png)\n' % (F['id'], F['id']))
        md.append(F['sub'] + '\n')
        md.append('| # | Item | m2 | Note |'); md.append('|---|---|---|---|')
        seen = set()
        for r in F['rooms']:
            if (r['n'], r['name']) in seen: continue
            seen.add((r['n'], r['name']))
            md.append('| %d | %s | %d | %s |' % (r['n'], r['name'], r['area'], r['note'].replace('|', '/')))
    img = section(p); img.save(os.path.join(OUT, 'section.png'), optimize=True)
    md.append('\n## The section along the ley line\n\n![section](floors/section.png)\n')
    with open(os.path.join(HERE, 'BLUEPRINT.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(md) + '\n')
    print('wrote floors/B0-B7.png, floors/section.png, BLUEPRINT.md')

if __name__ == '__main__':
    main()
