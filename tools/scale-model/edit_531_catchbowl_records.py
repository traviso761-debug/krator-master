#!/usr/bin/env python3
"""Scale model 5.1, edit 31 (2026-11-24): the catch-bowl queue's four non-blocking records - Ranger HQ's 500, the two
salt works landed, Esper named, Parabola typed as the Bowl arcology and its bore put in the network layer.

    python tools/scale-model/edit_531_catchbowl_records.py          # 60-settlements.js, populations, SITES.json, net51
    python tools/scale-model/edit_531_catchbowl_records.py --dry    # print the report, write nothing

`openworld/catch-bowl/MAP-EDITS.md` edits 3, 5, 6 and 7 (`PLAN.md` section 11 edits 3, 5, 7, 8 and 10). Every one is the
owner's of 2026-11-24. No raster changes.

**3. Ranger HQ (`sz85a8i5js`) is kept, with 500 people.** The owner: **500**, *"paid a salary and also a small cut of an
expeditions profits"*. The pin was Gemini's and was never put to the owner before; it is Yuni's fortified Stalker-watch
at 1,982 m on Lake Vapora's shore, the one habitable spot in 255,000 km2 of Stalker Range. A settlement record carries
no people field, so the number lives in `openworld/populations-gemini.json`, where Gemini had guessed 350 with 129
on-screen: it becomes 500 with `pop_known` true, since the owner has now said it. Its note takes the two incomes,
because they are the point - a salary from the Emirate (so a 500-strong garrison in a 0 mm province survives a bad
year) and a cut **of expeditions**, not of passing cargo.

**5. The two salt works land, in batch 5.1e10.** `core/simulation/PROPOSAL-CATCH.md` records them as "pins held in
batch 5.1e10, not yet on the map", and 5.1e10 is absent from every `SETT_*` table here, so the batch was reserved and
is used as reserved rather than renumbered. Both pins were checked against the ground before landing: Salt al-Ban
(`svhmyhf33w`, 1080,1428) reads 457.8 m dry with a pan 11 km off, and Solta (`s0zgu7u6yb`, 1169,1150) reads -1,114.9 m
dry with the great salt lake 7 km off - which is exactly what `openworld/SITES.json` claims for each (458 m / 11 km and
-1,115 m / 7 km), so the pins are right where their rows say. Their stage is **outpost**: `SETT_TYPES` has ten stages
and "works" is not one of them, and an outpost is what the other Catch stations (Kolli, Arfwai, Bitta, Lasso) are.
`SITES.json` carries each as `"model": false` with its own px; both flip to `"model": true`, which is that file's own
idiom for a pin the model now holds (46 of its 73 rows carry the field, some already true).

**6. `sq11desertw7` is Esper.** The owner named it; the map still read "Izani-Dasri village (to be named)".

**7. Parabola (`scyeauyek7`) is the Bowl arcology**, typed `arcology` in place of `inhabited ruin` (the owner: *"parabola
is the arcology now"*, consistent with their 2026-11-11 placement at 970,1186). The network layer's node list already
types it `arcology`; this is the settlement record catching up. And the **ruined Parabola-Stair bore** joins
`openworld/net51-gemini.json` as `rift.bowl.parabola-stair`, beside the kept `rift.bowl.theodiga-stair` on the same
`rift.bowl` line, as `ANCIENT-NETWORK.md`'s follow-up and `PLAN.md` answer M propose:

- Parabola (970,1186) to Stair (1106,1442) is 289.9 px = **580 km** straight, and the line passes down the Godsgate
  corridor (at 45 % and 50 % of its length it stands at px 1031,1301 and 1038,1314, both inside the carved trench) -
  checked here, not copied.
- `form` and `tunnel_km` are **derived from the model, not invented**: the bore is graded linearly between portals at
  1,716 m (Parabola) and 1,379 m (Stair), and each sampled px is `tunnel` where the ground stands over that grade and
  `open` where it does not. The report prints the resulting bored length and the deepest cover.
- `up` is `decayed` the whole way and the class is `possible`, as the sibling dead bore `rift.bowl.theodiga-stair`
  carries: the owner's word is "(ruined)", so it is a bore the Cataclysm broke, not one anybody shut.

**Nothing to remove from the network layer.** The queue also asks for "every trace of an Arcbeam-Stair one" to go.
`net51-gemini.json` has no Arcbeam-Stair tunnel: its four Arcbeam routes (to Parabola, Iziz, Yuni and the Izani highway
to Mantis) are all surface trunks, which is what the owner kept (*"There is no tunnel ti arcbeam but there is a
highway"*). The remaining traces are prose in five files and are renamed outside this script (see the README entry).

Refuses to run twice (`'5.1e10'` in `SETT_ADDED` is its marker). Writes `edit_531_catchbowl_records.report.json`.
"""
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE]
import smodel.page as P   # noqa: E402

SALT_BATCH = '5.1e10'         # reserved by core/simulation/PROPOSAL-CATCH.md
MOVE_BATCH = '5.1e28'
SETTS_JS = os.path.join(HERE, 'model', 'src', '60-settlements.js')
POPS = os.path.join(REPO, 'openworld', 'populations-gemini.json')
SITES = os.path.join(REPO, 'openworld', 'SITES.json')
NET51 = os.path.join(REPO, 'openworld', 'net51-gemini.json')

RANGER_ID, ESPER_ID, PARABOLA_ID = 'sz85a8i5js', 'sq11desertw7', 'scyeauyek7'
SALT_IDS = ('svhmyhf33w', 's0zgu7u6yb')
RANGER_PEOPLE = 500

RANGER_NOTE = (
    "Yuni's fortified Stalker-watch at 1,982 m on Lake Vapora's shore, the one habitable spot in 255,000 km2 of "
    "Stalker Range, astride the Stalker Gate's four-way pass network. KEPT by the owner 2026-11-24, with 500 people on "
    "two incomes: a salary from the Yuni Emirate and \"a small cut of an expeditions profits\" (their words) - of "
    "expeditions, not of passing cargo. It sells escort and Stalker salvage and posts the only standing bounty on "
    "Stalkers; the waystation network's anchor. From Gemini's trade model "
    "(openworld/world-pins-gemini.json, 2026-11-14)."
)
ESPER_NAME = 'Esper'
ESPER_NOTE = (
    "W7: the Bowl's one farming village, on the Bruk cedra at 895 m, 72 km from Arcbeam. Named Esper by the owner "
    "2026-11-24; it stood as \"Izani-Dasri village (to be named)\" until then. The owner, 2026-11-15 "
    "(openworld/TRADE-SCOPE.md 13)."
)
PARABOLA_TYPE = 'arcology'
PARABOLA_NOTE = (
    "THE BOWL ARCOLOGY (the owner, 2026-11-11, \"the Bowl arcology goes at 970,1186\", and 2026-11-24, \"parabola is "
    "the arcology now\"): an inhabited ruin of the Empire of Iziz at 1,716 m on the wall's flank, the north portal of "
    "the ruined Parabola-Stair bore (rift.bowl.parabola-stair), the end of the Ancient rail line's possible extension, "
    "and the north road's mustering ground. Typed arcology 2026-11-24, from inhabited ruin. From Gemini's trade model "
    "(openworld/world-pins-gemini.json, 2026-11-14)."
)
SALT_RECORDS = [
    {'id': 'svhmyhf33w', 'name': 'Ṣalṭ al-Bān', 'type': 'outpost', 'px': 1080, 'py': 1428,
     'notes': "The Catch's salt works at 458 m on the floor's flattest ground (9 m/km), a pan 11 km off: the Train of "
              "Jabal's, worked in the cool months by 100-150 seasonal hands. The map's richest unclaimed evaporites "
              'lie within 20 km (halite 239, gypsum 194, potash, soda, saltpeter). Held as a pin in batch 5.1e10 '
              '(core/simulation/PROPOSAL-CATCH.md) and landed with it 2026-11-24; core/region/data/catch-tune.js '
              'already declared it.',
     'createdAt': '2026-11-16T00:00:00.000Z', 'polity': 'Jabal Shiekdom'},
    {'id': 's0zgu7u6yb', 'name': 'Solta', 'type': 'outpost', 'px': 1169, 'py': 1150,
     'notes': "The Train of Jabal's Bowl salt works by the great salt lake (-1,115 m, the lake 7 km off): rock salt "
              '234 and gypsum 253, 112 km from Jabal by road. Mantis\'s Izani houses buy their salt here, which is the '
              'grievance they carry onto the Catch road (the owner, 2026-11-16: "Solta too"). Held as a pin in batch '
              '5.1e10 (core/simulation/PROPOSAL-CATCH.md) and landed with it 2026-11-24.',
     'createdAt': '2026-11-16T00:00:00.000Z', 'polity': 'Jabal Shiekdom'},
]

BORE_ID = 'rift.bowl.parabola-stair'
BORE_FROM, BORE_TO = (970, 1186), (1106, 1442)
BORE_PORTAL_M = (1716.0, 1379.0)


def table(s, name):
    m = re.search(r'const ' + name + r'=\{\n(.*?)\n  \};\n', s, re.S)
    assert m, 'no %s table' % name
    return m.start(1), m.end(1), m.group(1)


def patch_records(s, lo, hi, version, changes):
    """apply {id: {field: value}} to the version's list inside s[lo:hi]"""
    seg = s[lo:hi]
    m = re.search(r"('" + re.escape(version) + r"':)(\[.*?\])(,?\n)", seg, re.S)
    assert m, 'no %r list' % version
    arr = json.loads(m.group(2))
    n = 0
    for item in arr:
        if item.get('id') in changes:
            item.update(changes[item['id']]); n += 1
    seg = seg[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + seg[m.end():]
    return s[:lo] + seg + s[hi:], n


def main():
    dry = '--dry' in sys.argv
    s = open(SETTS_JS, encoding='utf-8').read()
    if ("'%s':" % SALT_BATCH) in table(s, 'SETT_ADDED')[2]:
        sys.exit('edit_531_catchbowl_records has run already (%s is in SETT_ADDED)' % SALT_BATCH)

    live = {d['id']: d for d in P.settlements()}
    for i in (RANGER_ID, ESPER_ID, PARABOLA_ID):
        assert i in live, '%s is not in defSetts' % i
    for i in SALT_IDS:
        assert i not in live, '%s is already on the map' % i
    assert live[ESPER_ID]['name'] == 'Izani-Dasri village (to be named)', 'Esper has been renamed already'
    assert live[PARABOLA_ID]['type'] == 'inhabited ruin', 'Parabola is not an inhabited ruin any more'

    D = P.load()
    E, _ = P.heights(D)
    for rec in SALT_RECORDS:
        assert not np.isnan(E[rec['py'], rec['px']])

    changes = {RANGER_ID: {'notes': RANGER_NOTE},
               ESPER_ID: {'name': ESPER_NAME, 'notes': ESPER_NOTE},
               PARABOLA_ID: {'type': PARABOLA_TYPE, 'notes': PARABOLA_NOTE}}

    # the bore's line, sampled a pixel at a time, and its form from the model
    n_px = int(round(np.hypot(BORE_TO[0] - BORE_FROM[0], BORE_TO[1] - BORE_FROM[1])))
    ts = np.linspace(0.0, 1.0, n_px + 1)
    px = [[round(BORE_FROM[0] + (BORE_TO[0] - BORE_FROM[0]) * t, 1),
           round(BORE_FROM[1] + (BORE_TO[1] - BORE_FROM[1]) * t, 1)] for t in ts]
    grade = [BORE_PORTAL_M[0] + (BORE_PORTAL_M[1] - BORE_PORTAL_M[0]) * t for t in ts]
    ground = [float(E[int(round(p[1])), int(round(p[0]))]) for p in px]
    form = ['tunnel' if g > gr + 1.0 else 'open' for g, gr in zip(ground, grade)]
    km = round(n_px * 2.0)
    bored = sum(1 for f in form if f == 'tunnel') / float(len(form)) * km
    cover = [g - gr for g, gr in zip(ground, grade)]
    bore = {'id': BORE_ID, 'class': 'possible', 'from': 'Parabola', 'to': 'Stair',
            'name': "Possible: the Ancients' ruined bore from Parabola (13) to Stair (12), under the Godsgate",
            'km': km, 'tunnel_km': round(bored), 'airless_open_km': 0, 'px': px, 'form': form,
            'up': ['decayed'] * len(px),
            'note': 'ruined, not shut by design (the owner, 2026-11-24: "there can be a (ruined) tunnel from stair to '
                    'parabola, but not to arcbeam"); sealed halfway, the northern half stripped by Yuni long ago, the '
                    "southern half from Stair the divers' prospect. Bab al-Hawa's 40 m shaft reaches its summit "
                    'section 1,400 m down',
            'line': 'rift.bowl'}

    pops = json.load(open(POPS, encoding='utf-8'))
    ranger_pop_before = next((dict(r) for r in pops['settlements'] if r.get('id') == RANGER_ID), None)
    sites = json.load(open(SITES, encoding='utf-8'))
    net = json.load(open(NET51, encoding='utf-8'))
    assert not any(r.get('id') == BORE_ID for r in net['routes']), '%s is in the network layer already' % BORE_ID
    arcbeam_tunnels = [r['id'] for r in net['routes']
                       if 'arcbeam' in str(r.get('id', '')).lower() + str(r.get('name', '')).lower()
                       and 'tunnel' in str(r.get('name', '')).lower()]

    rep = {
        'edit': "5.1 edit 31: the catch-bowl queue's four non-blocking records", 'date': '2026-11-24',
        'batches': {'salt_works_added': SALT_BATCH, 'moved_and_retyped': MOVE_BATCH},
        'ranger_hq': {'id': RANGER_ID, 'kept': True, 'people': RANGER_PEOPLE,
                      'populations_before': {k: ranger_pop_before.get(k) for k in
                                             ('cur_pop', 'on_screen_pop', 'sim_urban_pop', 'pop_known')},
                      'populations_after': {'cur_pop': RANGER_PEOPLE, 'on_screen_pop': RANGER_PEOPLE,
                                            'sim_urban_pop': RANGER_PEOPLE, 'pop_known': True},
                      'why': 'the owner, 2026-11-24: 500, "paid a salary and also a small cut of an expeditions profits"'},
        'salt_works': [{'id': r['id'], 'name': r['name'], 'px': [r['px'], r['py']], 'stage': r['type'],
                        'ground_m': round(float(E[r['py'], r['px']]), 1),
                        'sites_json_model_flag': 'false -> true'} for r in SALT_RECORDS],
        'salt_works_batch_reserved': 'core/simulation/PROPOSAL-CATCH.md names 5.1e10 for these two; no SETT_* table '
                                     'held that version, so it is used as reserved',
        'esper': {'id': ESPER_ID, 'from': live[ESPER_ID]['name'], 'to': ESPER_NAME},
        'parabola': {'id': PARABOLA_ID, 'type_from': live[PARABOLA_ID]['type'], 'type_to': PARABOLA_TYPE,
                     'network_node_already_arcology': True},
        'bore': {'id': BORE_ID, 'from_px': list(BORE_FROM), 'to_px': list(BORE_TO), 'km': km,
                 'tunnel_km': round(bored), 'points': len(px),
                 'portals_m': list(BORE_PORTAL_M),
                 'max_cover_m': round(max(cover)), 'median_cover_m': round(float(np.median(cover))),
                 'at_45_pct_px': px[int(0.45 * n_px)], 'at_50_pct_px': px[int(0.50 * n_px)],
                 'form_counts': {f: form.count(f) for f in sorted(set(form))},
                 'beside': 'rift.bowl.theodiga-stair', 'line': 'rift.bowl', 'up': 'decayed'},
        'arcbeam_stair_tunnels_in_network_layer': arcbeam_tunnels or 'none: its Arcbeam routes are surface trunks, '
                                                                     'which the owner kept',
        'raster_changed': False}
    print(json.dumps(rep, ensure_ascii=False, indent=1))

    assert km == 580, 'the bore measures %d km, not the 580 km the plan gives' % km
    # 2026-11-25: was `== [1031.2, 1301.2] or abs(x - 1031) <= 1`. The first arm was false on the run that produced the
    # committed report ([1031.0, 1300.8]), so the second was carrying it alone -- and the second checks only x, so the
    # line's y could drift arbitrarily far up or down the trench and still pass. Both axes now, at the same tolerance.
    bx, by = rep['bore']['at_45_pct_px']
    assert abs(bx - 1031) <= 1 and abs(by - 1301) <= 1, \
        'the line does not pass down the corridor where the plan says: %s' % ((bx, by),)
    assert rep['bore']['tunnel_km'] > 400, 'a base tunnel that is mostly not tunnel'
    assert not arcbeam_tunnels, 'an Arcbeam-Stair tunnel is in the network layer after all: %s' % arcbeam_tunnels
    if dry:
        return

    # 1. defSetts
    m = re.search(r'(const defSetts = )(\[.*?\])(;\n)', s, re.S)
    arr = json.loads(m.group(2))
    for item in arr:
        if item.get('id') in changes:
            item.update(changes[item['id']])
    arr.extend(SALT_RECORDS)
    s = s[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + s[m.end():]
    # 2. the add batch each of the three already sits in, so a browser mid-upgrade gets the new text too
    lo, hi, _ = table(s, 'SETT_ADDED')
    s, n_added = patch_records(s, lo, hi, '5.1e11', changes)
    assert n_added == 3, 'patched %d of 3 records in SETT_ADDED 5.1e11' % n_added
    # 3. the salt works as their reserved add batch, and the three changes as a move batch
    line = "      '%s':%s,\n" % (SALT_BATCH, json.dumps(SALT_RECORDS, ensure_ascii=False))
    s, n = re.subn(r'const SETT_ADDED=\{\n', lambda mm: mm.group(0) + line, s, count=1)
    assert n == 1
    moved = [dict(live[i], **changes[i]) for i in (RANGER_ID, ESPER_ID, PARABOLA_ID)]
    line = "    '%s':%s,\n" % (MOVE_BATCH, json.dumps(moved, ensure_ascii=False))
    s, n = re.subn(r'const SETT_MOVED=\{\n', lambda mm: mm.group(0) + line, s, count=1)
    assert n == 1
    open(SETTS_JS, 'w', encoding='utf-8', newline='\n').write(s)

    for r in pops['settlements']:
        if r.get('id') == RANGER_ID:
            r.update(cur_pop=RANGER_PEOPLE, on_screen_pop=RANGER_PEOPLE, off_screen_mult=1.0,
                     sim_urban_pop=RANGER_PEOPLE, pop_known=True,
                     pop_source='2026-11-24 the owner: 500, on a salary from the Yuni Emirate and a small cut of '
                                "expeditions' profits",
                     note="Yuni's fortified Stalker-watch on Lake Vapora's shore (1420,1242; 1,982 m), the Stalker "
                          "Gate's anchor and the waystation network's")
    with open(POPS, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(pops, f, ensure_ascii=False, indent=2); f.write('\n')

    for sid in SALT_IDS:
        assert sites['sites'][sid].get('model') is False, '%s is not a model: false row' % sid
        sites['sites'][sid]['model'] = True
    with open(SITES, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(sites, f, ensure_ascii=False, indent=1); f.write('\n')

    i = next(k for k, r in enumerate(net['routes']) if r.get('id') == 'rift.bowl.theodiga-stair')
    net['routes'].insert(i + 1, bore)
    with open(NET51, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(net, f, ensure_ascii=False, indent=2); f.write('\n')

    after = {d['id']: d for d in P.settlements()}
    assert after[ESPER_ID]['name'] == ESPER_NAME and after[PARABOLA_ID]['type'] == PARABOLA_TYPE
    assert all(i in after for i in SALT_IDS)
    json.dump(rep, open(os.path.join(HERE, 'edit_531_catchbowl_records.report.json'), 'w', encoding='utf-8',
                        newline='\n'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
