#!/usr/bin/env python3
"""The House of the Tempest's blueprint as data: writes tempest_plan.json from tempest_blueprint.py's rooms, for the
builders of step V2 (the fort asset's size:'monastery' in kits/xanadu round kits/qiblai's violet qb_monastery), F4 (the
interiors) and V3 (the open world). Plain JSON, no three.js: the [G data] fragment a build makes from it is that
build's to write.

    python export_tempest.py        # after editing tempest_blueprint.py (the sheets: python tempest_blueprint.py)

Frame: u from the Main Gate (east) west along the axis toward Komodo's side, v north, metres; y up from the outer
ward's ground. Sheet U's floors are drawn side by side on the sheet; here they are put back in the utse's real place.
Everything in this file is the blueprint's, and *proposed* unless BLUEPRINT.md says the owner fixed it."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tempest_blueprint as T

OUT = os.path.join(HERE, 'tempest_plan.json')

def r1(v):
    return round(float(v), 2)

def room(r, du=0.0, dv=0.0):
    return [r['n'], r['name'], r['kind'], r1(r['u0'] - du), r1(r['u1'] - du), r1(r['v0'] - dv), r1(r['v1'] - dv), r['decor']]

# the floor levels (y of each sheet's floor): the inner ward stands on a 4 m talus; the monastery's are the kit's
LEVELS = {
  'T0': {'y': 0, 'note': 'the crest'},
  'T1': {'y': 0, 'inner_y': 4, 'note': 'the outer ward at 0; the inner ward\'s rooms (u -55..55, v -48..48) at 4'},
  'T2': {'y': 4.5, 'inner_y': 8.5, 'note': 'the ranges\' upper storey; the infirmary\'s upper ward in the inner ward'},
  'M1': {'y': 5.2, 'note': 'the kit\'s plinth (1.2) on the inner ward; the hall\'s floor at 5.8 (its own 0.6 plinth)'},
  'M2': {'y': 8.6, 'hall_gallery_y': 10.8, 'note': 'the ranges\' upper floor; the hall\'s gallery a storey higher (the hall is 5 m)'},
  'MR': {'y': 11.6, 'hall_y': 14.8, 'note': 'the ranges\' roofs; the hall\'s third storey (vigil, light well, gonkhang)'},
}
UTSE_Y = {'U0': 0, 'U1': 5, 'U2': 9.5, 'U3': 14.5, 'U4': 18.5}

def main():
    sheets = {}
    for F in T.FLOORS:
        if F['id'] == 'U': continue
        S = dict(LEVELS[F['id']]); S['title'] = F['title']; S['rooms'] = [room(r) for r in F['rooms']]
        sheets[F['id']] = S
    U = [F for F in T.FLOORS if F['id'] == 'U'][0]
    utse = {'rect': [-63, -41, -11, 11], 'roof_y': 22.5, 'finial_y': 25.5, 'floors': {}}
    for pid, (c, rr) in T.UPAN.items():
        du = c * 30; dv = 16 if rr == 0 else -16
        utse['floors'][pid] = {'y': UTSE_Y[pid], 'rooms': [room(r, du, dv) for r in U['rooms'] if r['name'].startswith(pid + ':')]}
    plan = {
      'id': 'xan.tempest', 'name': 'The House of the Tempest', 'px': [886, 1619], 'blueprint': 'settlements/strongwall/tempest/BLUEPRINT.md',
      'frame': 'u from the Main Gate (east, toward Strongwall) west along the axis; v north; metres; y up from the outer ward',
      'owner': {'layout': 'concentric', 'prismarch': 'in the utse', 'novices': 'their own court', 'muster': 'horses inside, three gates'},
      'fort': {
        'size': 'monastery', 'dress': {'curtains': 'march, the twig band violet', 'utse_and_main_gate': 'royal'},
        'outer': {'poly': [list(p) for p in T.OUTER], 'h': 9, 't': 3.5, 'walk_h': 9, 'walk': [list(p) for p in T.WALK[0]]},
        'inner': {'poly': [list(p) for p in T.INNER_LINE[0][:4]], 'h': 12, 'talus_h': 4, 'talus': [list(p) for p in T.TALUS[0]]},
        'towers': [{'at': list(t['at']), 'kind': t['kind'], 'form': t['form'], 'r': t['r']} for t in T.TOWERS],
        'gates': [
          {'name': 'Main Gate', 'rect': [-138, -114, -9, 9], 'kind': 'iwan', 'bent': True, 'barbican': [-162, -138, -26, 26], 'gold': 'gilt pavilion'},
          {'name': 'North Sally Gate', 'rect': [-22, -10, 81, 101], 'kind': 'sally', 'to': 'the trough road'},
          {'name': 'South Sally Gate', 'rect': [-22, -10, -101, -81], 'kind': 'sally', 'to': 'the Kruk Warra road'},
          {'name': 'Inner Gate', 'rect': [-63, -41, -3, 3], 'kind': 'ramp', 'through': 'the utse', 'rise': 4},
          {'name': 'Founder\'s Way', 'from': [50, -23], 'to': [165, -25], 'kind': 'tunnel', 'hidden': True},
        ],
        'keep': 'utse', 'west_tower': {'name': 'Storm Tower', 'rect': [114, 140, -12, 12], 'h': 20},
        'gold': ['the Main Gate\'s pavilion', 'the utse\'s chapel finial', 'the Assembly Hall\'s holy crown (the kit\'s)'],
      },
      'hosted': {'key': 'qb_monastery', 'kit': 'kits/qiblai', 'o': {'v': 6}, 'rect': [-20, 32, -26, 26], 'y': 4,
                 'kit_frame': 'u = 6 - z, v = x (the gate tower faces east, the hall west)', 'clear_of_inner_curtain_m': 6},
      'utse': utse,
      'sheets': sheets,
      'stairs': {'monastery_north': T.MS_N, 'monastery_south': T.MS_S, 'monastery_back': T.MS_B, 'hall': T.MS_H,
                 'ne_corner': T.NE_ST, 'se_corner': T.SE_ST, 'sw_corner': T.SW_ST, 'novices': T.NV_ST, 'storm_tower': T.ST_ST,
                 'founders_way': T.FW_ST, 'utse': [T.US[0] - 63, T.US[1] - 63, T.US[2], T.US[3]]},
      'people': {'companies': 8, 'per_company': 40, 'captains': 8, 'chapter': 65, 'officers': 6, 'prismarch_and_secretary': 2,
                 'novices': 150, 'lay_brothers': 50},
      'horses': {'stalls_flanks': 292, 'stalls_gate': 35, 'remounts': 300},
      'fodder': FODDER,
    }
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(plan, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    n = sum(len(s['rooms']) for s in sheets.values()) + sum(len(f['rooms']) for f in utse['floors'].values())
    print('wrote', os.path.basename(OUT), len(sheets), 'sheets +', len(utse['floors']), 'utse floors,', n, 'rooms,', len(T.TOWERS), 'towers')

# *proposed* (the plan's recommended answer, relayed 2026-11-16 while the owner's question stays open): the duty rota
FODDER = {
  'answer': 'duty rota (proposed)',
  'rule': 'four companies\' horses and the gate stable stabled at a time, the other four at grass on the crest with the remounts; every stall kept for the wet months and the alarm',
  'stabled_avg': 181, 'hay_kg_day': 8, 'barley_kg_day_season': 2, 'season_days': 182,
  'hay_t_yr': 530, 'barley_t_yr': 66,
  'hay_from': 'the crest\'s meadows (no trade)', 'barley_from': 'up the Strongwall road with the grain (road.sw-tempest carries grain)',
  'for_the_tune': 'xan.tempest: a hay line local to the House and about 70 t of barley a year added to its grain draw; not yet in xan-tune.js',
}

if __name__ == '__main__':
    main()
