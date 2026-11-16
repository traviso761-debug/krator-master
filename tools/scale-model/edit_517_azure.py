#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish for Grēṭ-Āil (2026-11-16): the Azure Dream's cove on the long isle's south shore.

    python tools/scale-model/edit_517_azure.py          # after edit_517_pher.py (dc15601bc); edits landforms; once
    python tools/scale-model/edit_517_azure.py --dry    # print the report, write nothing

The owner, 2026-11-16 (settlements/azure-dream/PLAN.md section 13, question 1 "agreed"; then "can you make the cove
landform here"): the head monastery of the Order of the Azure Dream stands on the long isle's south shore facing
Erehwon, its fishermonks' wharf in a cove under the shore cell 846,1508.

The shore there is steep: the cell 846,1508 stands ~190 m over the lake and the next one out, 846,1509, is 72 m under
it, so core/world's Catmull-Rom ground runs straight down a ~15 % slope into deep water with no shelter. A cove is
finer than the 2 km cells, so it is records, not a raster edit (Phēr's way, edit_517_pher.py):
- **Two headlands**, one `island` record each, either side of the cove, each a knob ~300 m across its waterline,
  joined to the shore slope behind it and running ~500 m out. The stamp only raises ground (Math.max), so the arms meet
  the slope without cutting it.
- **One record per arm, never a base and a tip**: core/world's stamper (41l-world-landforms.js, `find`) stamps a point
  with the FIRST record whose reach holds it, so two overlapping records of one arm would each blank part of the other.
  The two arms' own reaches overlap only over the cove's open water, where the first arm's skirt lifts the bed a few
  metres and the water stays.
- **The cove** is the water left between them: ~360 m across at its head, ~500 m deep, open to the south-south-west,
  Erehwon 19-20 km off on the line. Its head is the natural waterline (no cut): the wharf, the mole and the Lustral Steps
  are the page's (settlements/azure-dream), on its own ground.

The check below rebuilds the 1:1 ground from the cells with core/world's Catmull-Rom (without its per-biome detail and
the waterline's noise wobble) and stamps the two records with 41l's profile; it asserts the cove holds water, the arms
stand out of it, and the monastery's shore cell stays land. The region cut checks them at 1:1 (WLAND.check) and may move
them. No raster changes; no pin (the monastery's pin is a later step, PLAN.md step AD1). Writes edit_517_azure.report.json.
"""
import os, sys, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P   # noqa: E402

LAKE = -520.0
CELL = (846, 1508)                 # the shore cell the monastery climbs (~190 m over the lake)
COL = 846.0                        # the cove's centre line, due south down the column (the shore runs along row 1508)
ARM_D, ARM_S = 200.0, 480.0        # each arm's centre: 200 m out from the waterline, 480 m either side of the line
ARMS = [   # (id, side, r_m, crest_m): r_m the waterline's radius, crest over the lake 35-40 m
    ('lf_azure_cove_west', -1, 300.0, -485.0),
    ('lf_azure_cove_east', +1, 300.0, -480.0)]
# core/world 41l-world-landforms.js's island profile (its constants)
REACH, SKIRT = 1.8, 8.0


def cr(p0, p1, p2, p3, t):
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)


def H(E, x, y):
    """the cells' ground at (px x, y) by Catmull-Rom, as core/world reads it (cell centres on whole pixels)"""
    x0, y0 = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - x0, y - y0
    rows = [cr(*(float(E[y0 + j, x0 + i]) for i in (-1, 0, 1, 2)), fx) for j in (-1, 0, 1, 2)]
    return cr(*rows, fy)


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def stamp(L, d, h):
    """41l's island stamp at d m from the record's centre over the ground h (no wobble, no noise)"""
    u = d / L['r_m']
    if u >= REACH:
        return h
    rise = L['crest_m'] - L['water_m']
    cap = 1 - smooth(.15, 1, u)
    t = L['water_m'] + rise * cap - SKIRT * smooth(1, 1.6, u)
    return max(h, h + (t - h) * (1 - smooth(1.3, REACH, u)))


def ground(E, recs, x, y):
    """the stamped ground at (px x, y): the first record whose reach holds the point, as 41l's find does"""
    h = H(E, x, y)
    for L in recs:
        d = math.hypot((x - L['px']) * 2000, (y - L['py']) * 2000)
        if d < L['r_m'] * REACH * 1.15:
            return stamp(L, d, h)
    return h


def waterline(E, x, y0=CELL[1], y1=CELL[1] + 1):
    """where the 1:1 ground crosses the lake going south down column x, between the shore cell and the next"""
    a, b = y0 + 0.0, y1 + 0.0
    for _ in range(60):
        m = (a + b) / 2
        if H(E, x, m) > LAKE:
            a = m
        else:
            b = m
    return (a + b) / 2


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E, W = P.heights(D)
    lf = D['landforms']['landforms']
    if any(l_['id'] == ARMS[0][0] for l_ in lf):
        sys.exit('edit_517_azure has already run (%s is in the data)' % ARMS[0][0])
    cx, cy = CELL
    assert not W[cy, cx] and W[cy + 1, cx], 'the shore cell must be dry with the lake in the cell south of it'
    assert E[cy, cx] - LAKE > 150, 'the shore cell must stand well over the lake (the monastery climbs it)'
    wl = waterline(E, COL)                      # the cove's head on its centre line
    m = 1 / 2000.0                              # px a metre
    recs = []
    for i_, sd, r_, c_ in ARMS:
        recs.append({'id': i_, 'kind': 'island', 'px': round(COL + sd * ARM_S * m, 3), 'py': round(wl + ARM_D * m, 3),
                     'r_m': r_, 'crest_m': c_, 'water_m': LAKE,
                     'note': ('The %s headland of the Azure Dream\'s cove on Grēṭ-Āil (the owner, 2026-11-16: "can you make the '
                              'cove landform here"): one record per arm, joined to the shore slope under the monastery\'s cell '
                              '846,1508; the cove is the water between the arms, open toward Erehwon. '
                              'settlements/azure-dream/PLAN.md section 1, edit_517_azure.py.') % ('west' if sd < 0 else 'east')})
    rep = {'edit': '5.1 edit 7 polish: the Azure Dream\'s cove (Grēṭ-Āil)', 'date': '2026-11-16',
           'shore_cell': {'px': list(CELL), 'over_lake_m': round(float(E[cy, cx]) - LAKE, 1),
                          'south_cell_under_lake_m': round(LAKE - float(E[cy + 1, cx]), 1)},
           'cove_head_px': [COL, round(wl, 3)], 'landforms': []}
    for L in recs:
        rep['landforms'].append({'id': L['id'], 'px': [L['px'], L['py']], 'r_m': L['r_m'], 'crest_m': L['crest_m'],
                                 'cell_m': round(float(E[int(L['py']), int(L['px'])]), 1),
                                 'cell_wet': bool(W[int(L['py']), int(L['px'])]),
                                 'ground_before_m': round(H(E, L['px'], L['py']) - LAKE, 1),
                                 'top_after_m': round(ground(E, recs, L['px'], L['py']) - LAKE, 1)})
    # the cove down its centre line, every 50 m from the head: under the lake before and after the stamps
    line = []
    for k in range(1, 13):
        y = wl + k * 50 * m
        line.append({'out_m': k * 50, 'before_m': round(H(E, COL, y) - LAKE, 1), 'after_m': round(ground(E, recs, COL, y) - LAKE, 1)})
    rep['cove_centre_line'] = line
    # each arm down its own line: land from the shore out to how far
    arms = {}
    for L, (i_, sd, r_, c_) in zip(recs, ARMS):
        prof = [round(ground(E, recs, L['px'], wl + k * 50 * m) - LAKE, 1) for k in range(0, 17)]
        reach_m = next((k * 50 for k, g in enumerate(prof) if g <= 0), len(prof) * 50)
        arms[i_] = {'out_m_dry_to': reach_m, 'every_50m_m': prof}
    rep['arms'] = arms
    # across the cove at 200 m out: the water's width between the arms
    xs = [COL + s * m for s in range(-900, 901, 10)]
    wet = [ground(E, recs, x, wl + 200 * m) < LAKE for x in xs]
    best, cur = 0, 0
    for w in wet:
        cur = cur + 10 if w else 0
        best = max(best, cur)
    mid = wet[len(xs) // 2]
    rep['cove_width_200m_out_m'] = best if mid else 0
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    # the checks
    assert all(p['after_m'] < -3 for p in line[1:]), 'the cove holds water at least 3 m deep from 100 m out'
    for a in rep['landforms']:
        assert abs(a['top_after_m'] - (a['crest_m'] - LAKE)) < 8, 'each arm stands at its crest: %s' % a['id']
    for i_, a in arms.items():
        assert a['out_m_dry_to'] >= 400, 'each arm runs at least 400 m out from the head: %s' % i_
    assert 250 <= rep['cove_width_200m_out_m'] <= 600, 'the cove is 250-600 m across 200 m out'
    assert H(E, COL, wl - 600 * m) - LAKE > 40, 'the shore climbs behind the head (the monastery\'s slope)'
    if dry:
        return
    lf.extend(recs)
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_azure.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
