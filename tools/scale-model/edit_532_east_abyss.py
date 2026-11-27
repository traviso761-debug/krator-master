#!/usr/bin/env python3
"""Scale model 5.1, edit 32 (2026-11-25): East Abyss buildout Phase 3 records — renames (Sista Riba, Bissa),
7 new East Abyss settlements (Tafidda, Slice, The Arcades, Downback, Upsprings, Bir-Sakhr Reed, Braita Reed),
updated populations, and graded East Abyss Ancient/polity highways (Yuni maintains 1 grade better than Tabisti;
no E-W highway from The Arcades to Trickster's House).

    python3 tools/scale-model/edit_532_east_abyss.py          # 60-settlements.js, populations, net51
    python3 tools/scale-model/edit_532_east_abyss.py --dry    # print report, write nothing

Refuses to run twice ('5.1e32' in SETT_ADDED is its marker). Writes edit_532_east_abyss.report.json.
"""
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE]
import smodel.page as P   # noqa: E402

ADD_BATCH = '5.1e32'
MOVE_BATCH = '5.1e32'
SETTS_JS = os.path.join(HERE, 'model', 'src', '60-settlements.js')
POPS = os.path.join(REPO, 'openworld', 'populations-gemini.json')
NET51 = os.path.join(REPO, 'openworld', 'net51-gemini.json')

SISTA_ID = 'sr72acbono'
BISSA_ID = 'syuninrth1'

RENAMES = {
    SISTA_ID: {
        'name': 'Sista Riba',
        'notes': "Renamed from 'Sista Riba Village' to 'Sista Riba' (the owner, 2026-11-25). River-valley Tabisti "
                 "village below Slice and Quintagon on the Braita Riba.",
    },
    BISSA_ID: {
        'name': 'Bissa',
        'notes': "Renamed from 'Yuni North' to 'Bissa' (the owner, 2026-11-25). Locus Geomancer oil-and-coal "
                 "extraction outpost (-1,887 m) on the Bruk Lona delta between Lower Verge and Locus.",
    },
}

NEW_RECORDS = [
    {'id': 'stafidda01', 'name': 'Tafidda', 'type': 'city', 'px': 1293, 'py': 882,
     'notes': "Third independent Urban Tabisti city-state (the owner, 2026-11-25), on the -1,950 m bench above the "
              "middle salt lake (-2,045 m) between Mungo and Verge where Rvr Fdd (57.3 m3/s) and Rifar al-Dhahab "
              "(24.1 m3/s) enter. Built on kits/tabisti; zero salvage, zero domestic electricity.",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Tabisti: Tafidda'},
    {'id': 'sslice0001', 'name': 'Slice', 'type': 'inhabited ruin', 'px': 1309, 'py': 949,
     'notes': "Inhabited cliff arcology ruin (kits/ancients/targets/slice; the owner, 2026-11-25), sited directly "
              "downstream of Quintagon (1358,945) on r042 Braita Riba (97.4 m3/s, 348 m/2 km cliff niche).",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Tabisti: Liikofi'},
    {'id': 'sarcades01', 'name': 'The Arcades', 'type': 'ruined arcology', 'px': 1253, 'py': 628,
     'notes': "Uninhabited cliff arcology ruin (formerly Arcoindian 3, kits/ancients/targets/arcoindian3; the owner, "
              "2026-11-25) in the northern East Abyss wall (870 m/2 km cliff niche). Connected only by the north-south "
              "Ancient trunk toward Sfenops; no E-W highway to Trickster's House.",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Uninhabited'},
    {'id': 'sdownback1', 'name': 'Downback', 'type': 'village', 'px': 1250, 'py': 1065,
     'notes': "Yuni Emirate relay village on the south shore of Locus's salt lake along the Grade 1 Yuni-Locus "
              "highway (the owner, 2026-11-25).",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Yuni Emirate'},
    {'id': 'supspring1', 'name': 'Upsprings', 'type': 'village', 'px': 1280, 'py': 1106,
     'notes': "Yuni Emirate spring village where Yuni Valley meets Stalker Range and caravans assemble and depart "
              "(the owner, 2026-11-25).",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Yuni Emirate'},
    {'id': 'sbirsakhr1', 'name': 'Bir-Sakhr Reed', 'type': 'village', 'px': 1293, 'py': 727,
     'notes': "Floating Reed-Lake village (kits/reedlake; the owner, 2026-11-25) on the northern -1,612 m salt lake "
              "(36.8 m3/s inflow) between Sfenops and Middle Tabisti.",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Reed-Lake: Independent'},
    {'id': 'sbraitard1', 'name': 'Braita Reed', 'type': 'village', 'px': 1288, 'py': 969,
     'notes': "Floating Reed-Lake village (kits/reedlake; the owner, 2026-11-25) on the -2,339 m lower salt lake "
              "(145.9 m3/s inflow) below Slice and Sista Riba.",
     'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Reed-Lake: Independent'},
]

NEW_POPS = {
    'stafidda01': (4800, 'Independent middle-lake Tabisti city-state (Tafidda, 1293,882)'),
    'sslice0001': (1800, 'Inhabited cliff arcology ruin downstream of Quintagon (Slice, 1309,949)'),
    'sarcades01': (0,    'Uninhabited northern cliff arcology ruin (The Arcades, 1253,628)'),
    'sdownback1': (420,  'Yuni south-shore relay village on Locus lake road (Downback, 1250,1065)'),
    'supspring1': (380,  'Yuni Valley caravan-departure spring village (Upsprings, 1280,1106)'),
    'sbirsakhr1': (360,  'Northern floating Reed-Lake village (Bir-Sakhr Reed, 1293,727)'),
    'sbraitard1': (410,  'Lower-lake floating Reed-Lake village below Slice & Sista Riba (Braita Reed, 1288,969)'),
}


def sample_route(pts, E):
    out_px = []
    for i in range(len(pts) - 1):
        ax, ay = pts[i]
        bx, by = pts[i + 1]
        n = max(1, int(round(np.hypot(bx - ax, by - ay))))
        for k in range(n + (1 if i == len(pts) - 2 else 0)):
            t = k / float(n)
            out_px.append([round(ax + (bx - ax) * t, 1), round(ay + (by - ay) * t, 1)])
    km = round(sum(np.hypot(out_px[i + 1][0] - out_px[i][0], out_px[i + 1][1] - out_px[i][1])
                   for i in range(len(out_px) - 1)) * 2.0)
    return out_px, km


def table(s, name):
    m = re.search(r'const ' + name + r'=\{\n(.*?)\n  \};\n', s, re.S)
    assert m, 'no %s table' % name
    return m.start(1), m.end(1), m.group(1)


def patch_records(s, lo, hi, version, changes):
    seg = s[lo:hi]
    m = re.search(r"('" + re.escape(version) + r"':)(\[.*?\])(,?\n)", seg, re.S)
    assert m, 'no %r list' % version
    arr = json.loads(m.group(2))
    n = 0
    for item in arr:
        if item.get('id') in changes:
            item.update(changes[item['id']])
            n += 1
    seg = seg[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + seg[m.end():]
    return s[:lo] + seg + s[hi:], n


def main():
    dry = '--dry' in sys.argv
    s = open(SETTS_JS, encoding='utf-8').read()
    if ("'%s':" % ADD_BATCH) in table(s, 'SETT_ADDED')[2]:
        sys.exit('edit_532_east_abyss has run already (%s is in SETT_ADDED)' % ADD_BATCH)

    live = {d['id']: d for d in P.settlements()}
    assert SISTA_ID in live, '%s missing from defSetts' % SISTA_ID
    assert BISSA_ID in live, '%s missing from defSetts' % BISSA_ID
    for rec in NEW_RECORDS:
        assert rec['id'] not in live, '%s already on map' % rec['id']

    D = P.load()
    E, _ = P.heights(D)
    for rec in NEW_RECORDS:
        assert not np.isnan(E[rec['py'], rec['px']]), '%s on NaN' % rec['name']

    # Graded East Abyss highways (owner, 2026-11-25):
    # Grade 1: Yuni Ancient trunk (maintained 1 grade better than Tabisti)
    # Grade 2: Tabisti Ancient trunk & Yuni Medium highway
    # Grade 3: Tabisti Medium highway
    # Explicitly NO E-W highway from The Arcades (1253,628) to Trickster's House (1512,660).
    new_routes_spec = [
        ('abyss.trunk.arcades-verge', 'trunk', 'The Arcades', 'Verge',
         'East Abyss Ancient Trunk (Grade 2 Tabisti): The Arcades -> Sfenops -> Middle Tabisti -> Liikofi -> Mungo -> Tafidda -> Verge',
         [(1253, 628), (1282, 663), (1311, 761), (1316, 797), (1322, 828), (1293, 882), (1268, 949)],
         'maintained_g2', 'Ancient highway maintained at Grade 2 by the Tabisti polities (no E-W branch to Trickster\'s House).'),
        ('abyss.trunk.quintagon-slice-verge', 'trunk', 'Quintagon', 'Verge',
         'East Abyss Cliff Ancient Spur (Grade 2 Tabisti): Quintagon -> Slice -> Sista Riba -> Verge',
         [(1358, 945), (1309, 949), (1311, 982), (1268, 949)],
         'maintained_g2', 'Ancient cliff trunk descending from Quintagon through Slice and Sista Riba to Verge.'),
        ('abyss.yuni.verge-yuni', 'yuni', 'Verge', 'Yuni',
         'Yuni-Locus Graded Trunk (Grade 1 Yuni): Verge -> Bissa -> Locus -> Downback -> Upsprings -> Yuni',
         [(1268, 949), (1268, 994), (1267, 1043), (1250, 1065), (1280, 1106), (1358, 1085)],
         'maintained_g1', 'Yuni Emirate maintains its Ancient/highway corridor one full grade better than Tabisti (Grade 1).'),
        ('abyss.medium.reed-spurs', 'dirt', 'Bir-Sakhr Reed', 'Braita Reed',
         'East Abyss Reed-Lake Medium Spurs (Grade 3 Tabisti): Bir-Sakhr Reed & Braita Reed shore links',
         [(1282, 663), (1293, 727), (1311, 761)],
         'maintained_g3', 'Medium-grade Tabisti shore road linking Bir-Sakhr Reed to Sfenops and Middle Tabisti.'),
    ]
    new_routes = []
    for rid, cls, frm, to, name, pts, up_state, note in new_routes_spec:
        px, km = sample_route(pts, E)
        new_routes.append({
            'id': rid, 'class': cls, 'from': frm, 'to': to, 'name': name,
            'km': km, 'tunnel_km': 0, 'airless_open_km': 0, 'px': px,
            'form': ['open'] * len(px), 'up': [up_state] * len(px),
            'note': note, 'line': 'east.abyss',
        })

    rep = {
        'edit': '5.1 edit 32: East Abyss Phase 3 settlements, renames, and graded highways',
        'date': '2026-11-25',
        'batch': ADD_BATCH,
        'renames': [
            {'id': SISTA_ID, 'from': live[SISTA_ID]['name'], 'to': RENAMES[SISTA_ID]['name']},
            {'id': BISSA_ID, 'from': live[BISSA_ID]['name'], 'to': RENAMES[BISSA_ID]['name']},
        ],
        'added': [{'id': r['id'], 'name': r['name'], 'type': r['type'], 'px': [r['px'], r['py']],
                   'polity': r['polity'], 'ground_m': round(float(E[r['py'], r['px']]), 1),
                   'pop': NEW_POPS[r['id']][0]} for r in NEW_RECORDS],
        'routes_added': [{'id': r['id'], 'class': r['class'], 'from': r['from'], 'to': r['to'], 'km': r['km']}
                         for r in new_routes],
        'arcades_to_trickster_ew_highway': False,
        'raster_changed': False,
    }
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return

    # 1. 60-settlements.js: defSetts, SETT_ADDED, SETT_MOVED
    m = re.search(r'(const defSetts = )(\[.*?\])(;\n)', s, re.S)
    arr = json.loads(m.group(2))
    for item in arr:
        if item.get('id') in RENAMES:
            item.update(RENAMES[item['id']])
    arr.extend(NEW_RECORDS)
    s = s[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + s[m.end():]

    lo, hi, _ = table(s, 'SETT_ADDED')
    s, n1 = patch_records(s, lo, hi, '5.1e11', {SISTA_ID: RENAMES[SISTA_ID]})
    assert n1 == 1, 'patched %d in 5.1e11' % n1
    lo, hi, _ = table(s, 'SETT_ADDED')
    s, n2 = patch_records(s, lo, hi, '5.1e24', {BISSA_ID: RENAMES[BISSA_ID]})
    assert n2 == 1, 'patched %d in 5.1e24' % n2

    line = "      '%s':%s,\n" % (ADD_BATCH, json.dumps(NEW_RECORDS, ensure_ascii=False))
    s, n = re.subn(r'const SETT_ADDED=\{\n', lambda mm: mm.group(0) + line, s, count=1)
    assert n == 1
    moved = [dict(live[i], **RENAMES[i]) for i in (SISTA_ID, BISSA_ID)]
    line = "    '%s':%s,\n" % (MOVE_BATCH, json.dumps(moved, ensure_ascii=False))
    s, n = re.subn(r'const SETT_MOVED=\{\n', lambda mm: mm.group(0) + line, s, count=1)
    assert n == 1
    with open(SETTS_JS, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(s)

    # 2. openworld/populations-gemini.json
    pops = json.load(open(POPS, encoding='utf-8'))
    existing_ids = {r.get('id') for r in pops['settlements']}
    for r in pops['settlements']:
        if r.get('id') in RENAMES:
            r['name'] = RENAMES[r['id']]['name']
            r['pin_name'] = RENAMES[r['id']]['name']
    for rec in NEW_RECORDS:
        if rec['id'] in existing_ids:
            continue
        pop_val, note = NEW_POPS[rec['id']]
        pops['settlements'].append({
            'id': rec['id'], 'name': rec['name'], 'pin_name': rec['name'],
            'type': rec['type'], 'polity': rec['polity'],
            'px': rec['px'], 'py': rec['py'],
            'cur_pop': pop_val, 'on_screen_pop': pop_val, 'off_screen_mult': 1.0,
            'sim_urban_pop': pop_val, 'pop_known': True,
            'pop_source': '2026-11-25 East Abyss Phase 3 buildout (owner approved)',
            'note': note,
        })
    with open(POPS, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(pops, fh, ensure_ascii=False, indent=2)
        fh.write('\n')

    # 3. openworld/net51-gemini.json
    net = json.load(open(NET51, encoding='utf-8'))
    existing_rids = {r.get('id') for r in net['routes']}
    for nr in new_routes:
        if nr['id'] not in existing_rids:
            net['routes'].append(nr)
    with open(NET51, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(net, fh, ensure_ascii=False, indent=2)
        fh.write('\n')

    # 4. Report
    rep_path = os.path.join(HERE, 'edit_532_east_abyss.report.json')
    with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rep, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('Wrote', rep_path)


if __name__ == '__main__':
    main()
