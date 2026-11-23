#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish for Grēṭ-Āil (2026-11-16): the Azure Dream's cove on the long isle's south shore.

    python tools/scale-model/edit_517_azure.py          # after edit_517_pher.py (dc15601bc); edits landforms; once
    python tools/scale-model/edit_517_azure.py --dry    # print the report, write nothing

The owner, 2026-11-16 (settlements/azure-dream/PLAN.md section 13, question 1 "agreed"; then "can you make the cove
landform here", and "build the page next"): the head monastery of the Order of the Azure Dream stands on the long isle's
south shore facing Erehwon, its fishermonks' wharf in a cove under the shore cell 846,1508.

**Placed against the 1:1 ground, not the cells.** The first take (5e5d46b88) placed the cove against the cells' Catmull-Rom,
which puts the waterline at py 1508.70 on column 846. The page (settlements/azure-dream, on the region cut of this line's model
through the open world's fields, WORLD.H) shows the 1:1 shore otherwise: a flat about 400 m wide at the lake's level, half
drowned, under a steep scarp whose toe is the real shore, at py 1508.49 on column 846.075 (world metres 150, 2986). The flat
is under water (3-11 m) in front of the toe between x -200 and +500 m, dry flats either side. So the cove is put there:
- **Two headlands**, one `island` record each, either side of the cove's head at the scarp's toe: `lf_azure_cove_west` at
  px 845.91,1508.568 and `lf_azure_cove_east` at 846.24,1508.568, each 220 m in radius at its waterline, 150 m out from the
  head and 330 m either side of its centre line, 30 and 34 m over the lake. They join the scarp's foot behind them.
- **One record per arm**: core/world's stamper (41l-world-landforms.js, `find`) stamps a point with the first record whose
  reach holds it, so two overlapping records of one arm would each blank part of the other.
- **The cove** is the drowned flat between them: about 250 m across at 120 m out, 7-11 m deep, open to the south-south-west,
  Erehwon 20 km off on the line. Its head is the scarp's toe; the wharf, the mole and the Lustral Steps are the page's.

The geometry is checked on the page (settlements/azure-dream/verify.py, `cove-water`: the water on the centre line 60-160 m
out, the headlands out of it), on this line's region cut; this script checks only what the cells can say (the shore cell is
dry with the lake south of it; the records stand in the shore cell's band over the lake). No raster changes; no pin (the
monastery's pin is a later step, PLAN.md step AD1b). Writes edit_517_azure.report.json.
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P   # noqa: E402

LAKE = -520.0
CELL = (846, 1508)                 # the shore cell the monastery climbs (~190 m over the lake)
HEAD = (846.075, 1508.493)         # the cove's head: the scarp's toe on the 1:1 ground (the page's origin)
ARMS = [   # (id, side, px, py, r_m, crest_m)
    ('lf_azure_cove_west', 'west', 845.91, 1508.568, 220.0, -490.0),
    ('lf_azure_cove_east', 'east', 846.24, 1508.568, 220.0, -486.0)]
# measured on the page (settlements/azure-dream, 2026-11-16), metres over the lake, with the two records stamped
ONE_TO_ONE = {
    'scarp_profile_up_from_head_m': {'0': -2, '25': 4, '50': 11, '75': 17, '100': 26, '125': 34, '150': 58, '200': 73, '300': 95,
                                     '400': 121, '500': 131, '600': 144},
    'cove_centre_line_out_from_head_m': {'0': -1.6, '30': -11, '60': -11, '100': -8.7, '150': -5.7, '200': -3.4, '300': -6.3},
    'across_120m_out_m': {'-300': 29.8, '-200': 13.3, '-150': 3.1, '-100': -0.2, '0': -8.1, '100': -7.5, '150': 3.6, '200': 15.1, '300': 33.7},
    'headland_lines_out_from_head_m': {'west': {'0': 9.5, '100': 29.3, '200': 29.3, '300': 9.5, '400': -1.1},
                                       'east': {'0': 10.7, '100': 33.2, '200': 33.2, '300': 10.7, '400': -1.1}}}


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
    recs, rep = [], {'edit': '5.1 edit 7 polish: the Azure Dream\'s cove (Grēṭ-Āil)', 'date': '2026-11-16',
                     'shore_cell': {'px': list(CELL), 'over_lake_m': round(float(E[cy, cx]) - LAKE, 1),
                                    'south_cell_under_lake_m': round(LAKE - float(E[cy + 1, cx]), 1)},
                     'cove_head_px': list(HEAD), 'page_origin_world_m': [round((HEAD[0] - 846) * 2000), round((HEAD[1] - 1507) * 2000)],
                     'one_to_one': ONE_TO_ONE, 'landforms': []}
    for i_, side, x_, y_, r_, c_ in ARMS:
        assert CELL[1] < y_ < CELL[1] + 1 and c_ > LAKE, 'each headland stands in the shore cell\'s band, over the lake: ' + i_
        recs.append({'id': i_, 'kind': 'island', 'px': x_, 'py': y_, 'r_m': r_, 'crest_m': c_, 'water_m': LAKE,
                     'note': ('The %s headland of the Azure Dream\'s cove on Grēṭ-Āil (the owner, 2026-11-16: "can you make the '
                              'cove landform here"): one record per arm, on the drowned flat at the scarp\'s toe under the '
                              'monastery\'s cell 846,1508, joined to the scarp behind; the cove is the water between the arms, '
                              'open toward Erehwon. settlements/azure-dream/PLAN.md section 1, edit_517_azure.py.') % side})
        rep['landforms'].append({'id': i_, 'px': [x_, y_], 'r_m': r_, 'crest_m': c_,
                                 'cell_m': round(float(E[int(y_), int(x_)]), 1), 'cell_wet': bool(W[int(y_), int(x_)])})
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return
    lf.extend(recs)
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_azure.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
