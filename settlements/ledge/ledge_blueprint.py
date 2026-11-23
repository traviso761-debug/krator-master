#!/usr/bin/env python3
"""Ledge, Dalab's half-ruined Ancient arcology on the West Rift's great lake: the blueprint sheets and AREAS.md.

Everything drawn comes from the layout (src/30-ledge-layout.js, the one source; its rules src/31-ledge-rules.js), read through
`node layout_dump.js`, and is drawn by the cliff city's sheets (kits/ancients/cliff/cliff_blueprint.py, on the shared generator
settlements/voth/palace/blueprint.py). Only Ledge's words and its sheet list are here: change the layout, never this file.

Frame (PLAN.md 9.2): x east along the face, z south out of it, y metres above sea level. On the plan sheets north is up (v = -z).

    python3 ledge_blueprint.py      # writes floors/*.png and AREAS.md next to this file (needs node)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'kits', 'ancients', 'cliff'))
import cliff_blueprint as CB

CFG = {'name': 'Ledge', 'script': 'ledge_blueprint.py', 'rules': 'LEDGE', 'test': 'settlements/ledge/test-ledge.js', 'census_ref': 'PLAN.md 9.7',
       'top': {'key': 'head', 'zone': 'Z0', 'label': 'the head', 'word': 'the head (%d m): Dalab\'s town, the road head, the Fellgang quarter'},
       'bottom': {'key': 'apron', 'zone': 'Z5', 'label': 'the apron', 'word': 'the apron (%d m): the foot, the harbour'},
       'datum': {'level': 297, 'label': 'the great lake'}, 'water': {'level': 297, 'quay': 180, 'label': 'the great lake (297 m)'},
       'holders': {'dalab': (238, 214, 150), 'fellgang': (196, 214, 236), 'lojfower': (170, 200, 150)},
       'people_note': 'sand: Dalab, blue: the Fellgangs, green: Loj Fower', 'inward': 'North', 'section_z': [-1000, 900],
       'elev_title': 'Elevation from the lake: the shell, deck by deck, by state (true scale)'}

if __name__ == '__main__':
    C = CB.load(HERE, CFG)
    G, L, LINE = C.G, C.L, C.LINE
    CB.site_sheet(C, 'S0: Ledge, the site (north up)',
                  'The site at 1:1 on Ledge\'s own ground (LEDGE.groundAt): the head\'s bench at %d m, the face dressed sheer for %d m, the apron at %d m out to '
                  'the quay, the lake at %d m. The shell\'s outline at its top layer (brown) and its lowest (grey); the wreck heaps; the road down the escarpment; '
                  'the Line\'s helix inside the escarpment and its approach to the station (%.1f km from %d m at %g %%, %.0f turns).'
                  % (G['head'], 2 * G['dressed'], G['apron'], G['lake'], LINE['total'] / 1000, L['line']['helix']['y0'], L['line']['helix']['grade'] * 100, LINE['turns']))
    CB.zone_sheet(C, 'S1-head', 'Z0', 'S1: the head (Z0), on the bench at %d m (north up)' % G['head'], [-840, 860, 0, 680], 'on the Ancients\' cut bench at %d m' % G['head'])
    CB.layer_sheet(C, 'S2-crown', 39, 'S2: the crown (Z1), layer 39', 'The gene bank\'s vault in the rock behind W1; the governor and the hall on E1; the centre gone with the prow.')
    CB.layer_sheet(C, 'S3-dead', 31, 'S3: the upper dead decks (Z2), layer 31', 'The prow gone from the centre; E2 pancaked; W2 and the gash\'s sides torn.')
    CB.layer_sheet(C, 'S4-middle', 20, 'S4: the middle decks (Z3), layer 20: the Line\'s station', 'The station in the rock behind C and E1, its concourse on the decks; Loj Fower\'s decks round it; the outer wings sealed by the loj.')
    CB.layer_sheet(C, 'S5-shear', 11, 'S5: the lower dead decks (Z4), layer 11: the shear', 'W1 and W2 sheared at the rock line (their decks heaped on the apron); the centre the salvagers\' (k 6-9).')
    CB.layer_sheet(C, 'S6-footdecks', 2, 'S6: the foot decks (Z5), layer 2', 'Dalab west and centre, the Fellgangs east; the great lifts\' lowest deck landings.')
    CB.zone_sheet(C, 'S7-foot', 'Z5', 'S7: the foot (Z5), on the apron at %d m (north up)' % G['apron'], [-720, 720, -700, 10], 'on the Ancients\' apron at %d m' % G['apron'])
    CB.elevation(C)
    CB.section(C, -100)
    CB.areas(C, 'section 0: half ruined')
