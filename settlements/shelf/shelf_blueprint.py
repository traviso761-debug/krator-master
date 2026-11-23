#!/usr/bin/env python3
"""Shelf, the Line's north station town on the Outer Wall: the blueprint sheets and AREAS.md.

Everything drawn comes from the layout (src/30-shelf-layout.js, the one source; its rules src/31-shelf-rules.js), read through
`node layout_dump.js`, and is drawn by the cliff city's sheets (kits/ancients/cliff/cliff_blueprint.py, on the shared generator
settlements/voth/palace/blueprint.py). Only Shelf's words and its sheet list are here: change the layout, never this file.

Frame (PLAN.md 5.2): x along the face (toward azimuth 125), z out of it (toward 35, Dalab's plain), y above sea level. On the plan
sheets the Wall is up (v = -z).

    python3 shelf_blueprint.py      # writes floors/*.png and AREAS.md next to this file (needs node)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'kits', 'ancients', 'cliff'))
import cliff_blueprint as CB

CFG = {'name': 'Shelf', 'script': 'shelf_blueprint.py', 'rules': 'SHELF', 'test': 'settlements/shelf/test-shelf.js', 'census_ref': 'PLAN.md 5.4',
       'top': {'key': 'head', 'stop': 'plateau', 'zone': 'Z0', 'label': 'the plateau', 'word': 'the plateau (%d m): the station, the caravan terminus, the fort, Dalab\'s town'},
       'bottom': {'key': 'shelf', 'zone': 'Z4', 'label': 'the shelf', 'word': 'the shelf (%d m): the shelf town, the yards, the prow\'s wreck'},
       'datum': {'level': 2780, 'label': 'the shelf\'s edge'}, 'water': None,
       'holders': {'dalab': (238, 214, 150), 'fellgang': (196, 214, 236), 'tungang': (170, 200, 150)},
       'people_note': 'sand: Dalab, blue: the Fellgang Travellers, green: the station\'s Tungangs', 'inward': 'The Wall (south-west)', 'section_z': [-1000, 3200],
       'elev_title': 'Elevation from the shelf: the shell, deck by deck, by state (true scale)'}

if __name__ == '__main__':
    C = CB.load(HERE, CFG)
    G, L, LINE = C.G, C.L, C.LINE
    CB.site_sheet(C, 'S0: Shelf, the site (the Wall up)',
                  'The site at 1:1 on Shelf\'s own ground (SHELF.groundAt): the plateau\'s cut at %d m, the face dressed sheer for %d m and 850 m tall, the shelf at %d m '
                  'out to %d m, the lower escarpment below it to Dalab\'s plain (~%d m, %.1f km out). The shell\'s outline at its top layer (brown) and its lowest '
                  '(grey); the wreck heaps; Dalab\'s road up to the shelf and the ramp at the north-west end; the Line\'s spirals inside the Wall and its approach '
                  'to the station (%.1f km from %d m at %g %%, %.0f turns). The face faces azimuth 35 (toward the sun at ~40 S, and Dalab, 111 km off).'
                  % (G['head'], 2 * G['dressed'], G['shelf'], G['shelfEdge'], G['plain'], G['plainZ'] / 1000, LINE['total'] / 1000, L['line']['portal']['y'],
                     L['line']['helix']['grade'] * 100, LINE['turns']), ext=1600)
    CB.zone_sheet(C, 'S1-plateau', 'Z0', 'S1: the plateau (Z0), on the cut at %d m (the Wall up)' % G['head'], [-1150, 1150, 0, 640], 'on the Ancients\' cut at %d m' % G['head'])
    CB.layer_sheet(C, 'S2-upper', 30, 'S2: the upper decks (Z1), layer 30', 'The governor, the genepriests and the rich either side of the gash; W1 and E1 torn beside it.')
    CB.layer_sheet(C, 'S3-pancake', 23, 'S3: the middle decks (Z2), layer 23: the pancaked wing', 'The town on the decks; the prow gone from the centre; W3 pancaked onto layer 19.')
    CB.layer_sheet(C, 'S4-shear', 15, 'S4: the middle decks (Z2), layer 15: the shear', 'E2 and E3 sheared at the rock line (their decks heaped on the shelf); the gash\'s foot.')
    CB.layer_sheet(C, 'S5-lower', 2, 'S5: the lower decks (Z3), layer 2', 'The poor\'s decks over the shelf (W1, C, E1); the rest dead or walled up; the great lifts\' lowest landings.')
    CB.zone_sheet(C, 'S6-shelf', 'Z4', 'S6: the shelf (Z4), on the bench at %d m (the Wall up)' % G['shelf'], [-1400, 1400, -900, 10], 'on the bench at %d m' % G['shelf'])
    CB.elevation(C)
    CB.section(C, -60)
    CB.areas(C, 'held and mended: 30-50 %')
