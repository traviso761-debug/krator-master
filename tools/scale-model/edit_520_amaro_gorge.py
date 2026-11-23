#!/usr/bin/env python3
"""Scale model 5.1, edit 20 for Amaro (2026-11-18): the triple-confluence gorge and promontory pin.

    python tools/scale-model/edit_520_amaro_gorge.py          # edits h, tm/tw/tc/th/tl, rivers, 60-settlements.js; run once
    python tools/scale-model/edit_520_amaro_gorge.py --dry    # print the report, write nothing

The owner, 2026-11-18 (settlements/shumar/PLAN.md section 7, call 1: "1: A; 2 make 3rd sub district; 3. Terrace them
4. Skyline silhouette"): move Amaro (`ssgsv5zbd2`) 14 km south from (731, 1184) onto the dry triple-confluence
promontory at (731, 1192) (3,088.7 m, flanked by the 3,103.7 m Qappu al-Subaru citadel spur at 730,1193 and the
3,086.0 m Madinat al-Qubab east cliff crest at 732,1192) and un-flatten Betun-Narun's (r007) 3,026.9 m basin-breach
sill (v[7..18]) into a 241-262 m four-tier canyon falling monotonically from 3,060.7 m at v[6] (737,1189) through
2,848.0 m at the Amaro confluence (v[10], 731,1191) and 2,842.0 m at Qappu-Narun's mouth (v[11], 729,1193) down to
2,768.1 m at v[25] (705,1175), with the mouth ravines of tributaries r289, r288 (Payaru-Buruqu), r287 (Qappu-Narun),
r286 (Misu-Narun) and r285 (Nazaru-Narun) stepped downhill to meet it.

Also updates 60-settlements.js (plus rebuilds scale-model.html) and openworld/{populations,net51,roads-supplement}-gemini.json.
Writes edit_520_amaro_gorge.report.json.
"""
import json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.climate as C   # noqa: E402
from edit_517 import cells_along   # noqa: E402

OLD_PIN = (731, 1184)
NEW_PIN = (731, 1192)
AMARO_NOTE = (
    "Capital of the Shumari Kingdom (~12,850 across Greater Amaro, including Qappu al-Šubaru, Madīnat al-Qubab and "
    "Pāyaru-Gisr; LORE.md 6.18, settlements/shumar/PLAN.md). Moved 2026-11-18 (the owner: '1: A') 14 km south from "
    "731,1184 to the triple-confluence promontory at 731,1192 (3,089 m, flanked by 3,104 m at 730,1193 and 3,086 m at "
    "732,1192) overhanging the 2,848 m Bētun-Nārun / Pāyaru-Buruqu / Qappu-Nārun gorge (241-262 m cliff drop; "
    "tools/scale-model/edit_520_amaro_gorge.py)."
)

# Target elevations at r007 vertices v[6..25], strictly falling from 3,060.7 m into West Gorge (2,768.1 m at v[25])
R007_TARGETS = {
    6: 3060.7,
    7: 2872.0,
    8: 2864.0,
    9: 2856.0,
    10: 2848.0,   # Amaro confluence (730.6, 1191.2 -> cell 731, 1191)
    11: 2842.0,   # Qappu-Narun mouth (728.6, 1193.2 -> cell 729, 1193)
    12: 2836.0,
    13: 2830.0,
    14: 2824.0,   # Misu-Narun mouth (722.6, 1193.2 -> cell 723, 1193)
    15: 2818.0,
    16: 2812.0,
    17: 2806.0,
    18: 2801.0,
    19: 2796.0,   # Nazaru-Narun mouth (712.6, 1187.2 -> cell 713, 1187)
    20: 2791.0,
    21: 2786.0,
    22: 2781.0,
    23: 2776.0,
    24: 2772.0,
    25: 2768.1,
}

# Protected cliff-lip promontory cells around Amaro that the gorge cut must never lower
PROTECTED_RIM = {(1192, 731), (1192, 732), (1193, 730), (1193, 732), (1192, 733)}

# Tributary mouth ravines: (river_id, [(y, x, target_m), ...])
TRIB_CUTS = [
    ('r289', [(1193, 737, 2940.0), (1192, 737, 2904.0)]),
    ('r288', [(1189, 733, 2962.0), (1190, 732, 2902.0)]),
    ('r287', [(1193, 731, 2988.0)]),
    ('r286', [(1195, 725, 2955.0), (1194, 724, 2888.0)]),
    ('r285', [(1189, 713, 2860.0), (1188, 713, 2828.0)]),
]


def recompute_beds(r, En):
    b, m = [], 1e9
    for p in r['px']:
        gx, gy = int(round(p[0])), int(round(p[1]))
        m = min(m, float(En[gy, gx]))
        b.append(round(m, 1))
    # Enforce strict monotonic non-increasing bed_m (falling by at least 0.1 m where plateaued on same cell)
    for idx in range(1, len(b)):
        if b[idx] > b[idx - 1]:
            b[idx] = b[idx - 1]
    r['bed_m'] = b
    r['mouth_m'] = b[-1]
    r['source_m'] = b[0]


def update_settlements_js():
    p = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    s = open(p, encoding='utf-8').read()

    def patch_list(m):
        prefix, body, suffix = m.group(1), m.group(2), m.group(3)
        arr = json.loads(body)
        for item in arr:
            if item.get('id') == 'ssgsv5zbd2':
                item['px'] = NEW_PIN[0]
                item['py'] = NEW_PIN[1]
                item['notes'] = AMARO_NOTE
        return prefix + json.dumps(arr, ensure_ascii=False) + suffix

    s2, n1 = re.subn(r'(const defSetts = )(\[.*?\])(;\n)', patch_list, s, count=1)
    assert n1 == 1, 'defSetts not found in 60-settlements.js'
    s2, n2 = re.subn(r"('5\.1e11':)(\[.*?\])(,?\n)", patch_list, s2, count=1)
    assert n2 == 1, 'SETT_ADDED 5.1e11 not found in 60-settlements.js'

    moved_rec = json.dumps([{
        'id': 'ssgsv5zbd2',
        'name': 'Amaro',
        'type': 'city',
        'px': NEW_PIN[0],
        'py': NEW_PIN[1],
        'notes': AMARO_NOTE,
        'createdAt': '2026-11-13T05:02:47.997Z',
        'polity': 'Shumari',
    }], ensure_ascii=False)
    if "'5.1e20':" not in s2:
        s2, n3 = re.subn(
            r'(const SETT_MOVED=\{\n)',
            r"\1    '5.1e20':" + moved_rec + ",\n",
            s2,
            count=1,
        )
        assert n3 == 1, 'SETT_MOVED not found in 60-settlements.js'
    open(p, 'w', encoding='utf-8', newline='\n').write(s2)


def update_openworld_jsons():
    # 1. openworld/populations-gemini.json
    pop_path = os.path.join(REPO, 'openworld', 'populations-gemini.json')
    pop_doc = json.load(open(pop_path, encoding='utf-8'))
    for rec in pop_doc.get('settlements', []):
        if rec.get('id') == 'ssgsv5zbd2':
            rec['cur_pop'] = 12850
            rec['on_screen_pop'] = 12850
            rec['off_screen_mult'] = 1.0
            rec['sim_urban_pop'] = 12850
            rec['pop_known'] = True
            rec['pop_source'] = 'core/region/data/shumar-tune.js (10,600 city + 1,100 citadel + 300 necropolis + 850 gisr)'
            rec['note'] = (
                'Capital of the Shumari Kingdom at the Betun-Narun / Payaru-Buruqu / Qappu-Narun confluence lip '
                '(px 731,1192; 3,089 m rim above 2,848 m gorge)'
            )
    open(pop_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(pop_doc, indent=2, ensure_ascii=False) + '\n')

    # 2. openworld/net51-gemini.json
    net_path = os.path.join(REPO, 'openworld', 'net51-gemini.json')
    net_doc = json.load(open(net_path, encoding='utf-8'))
    for nd_rec in net_doc.get('nodes', []):
        if nd_rec.get('id') == 'new.amaro':
            nd_rec['px'] = [NEW_PIN[0], NEW_PIN[1]]
            nd_rec['note'] = (
                "Shumar's capital on the triple-confluence cliff lip (px 731,1192; 3,089 m over the 2,848 m gorge, "
                "7 degC); dirt road north across the plateau to the Ancient highway"
            )
    conn_int = [[731, 1192], [732, 1188], [733, 1185]]
    for rt in net_doc.get('routes', []):
        if rt.get('id') == 'dirt.amaro' and rt.get('px') and rt['px'][0] != [731, 1192]:
            rt['px'] = conn_int + rt['px']
            rt['km'] = round(float(rt.get('km', 102)) + 21, 1)
    open(net_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(net_doc, indent=2, ensure_ascii=False) + '\n')

    # 3. openworld/roads-supplement-gemini.json
    sup_path = os.path.join(REPO, 'openworld', 'roads-supplement-gemini.json')
    sup_doc = json.load(open(sup_path, encoding='utf-8'))
    conn_flt = [[731.0, 1192.0], [732.0, 1188.0], [733.0, 1185.0]]
    for rt in sup_doc.get('routes', []):
        if rt.get('id') == 'supp.ssgsv5zbd2' and rt.get('px') and rt['px'][0] != [731.0, 1192.0]:
            rt['px'] = conn_flt + rt['px']
            rt['km'] = round(float(rt.get('km', 92.0)) + 21.0, 1)
    open(sup_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(sup_doc, indent=2, ensure_ascii=False) + '\n')


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    setts = {s['id']: s for s in P.settlements()}
    am = setts.get('ssgsv5zbd2')
    r007 = next(r for r in D['rivers'] if r['id'] == 'r007')
    if am and (am['px'], am['py']) == NEW_PIN and float(E[1191, 731]) < 2900.0:
        sys.exit('edit_520_amaro_gorge has already run (ssgsv5zbd2 is at 731,1192 and 731,1191 is carved)')

    En = E.copy()
    gorge_cells = []
    # Carve each segment v[k] -> v[k+1] along 8-connected cells_along so the canyon has no 1-cell barriers
    for k in range(6, 25):
        seg = cells_along([r007['px'][k], r007['px'][k + 1]])
        z0, z1 = R007_TARGETS[k], R007_TARGETS[k + 1]
        n = max(1, len(seg) - 1)
        for idx, (cy, cx) in enumerate(seg):
            assert (cy, cx) not in PROTECTED_RIM, f'gorge segment {k} touched protected rim {(cy, cx)}'
            assert not whas[cy, cx], f'gorge segment {k} hit wet cell {(cy, cx)}'
            zt = z0 + (z1 - z0) * (idx / n)
            if zt < En[cy, cx]:
                En[cy, cx] = zt
                gorge_cells.append((cx, cy, round(float(E[cy, cx]), 1), round(float(zt), 1)))

    # Ensure strict step-by-step descent along full 8-connected course v[6..25]
    seen, full_course = set(), []
    for c in cells_along(r007['px'][6:26]):
        if c not in seen:
            seen.add(c)
            full_course.append(c)
    prev = float(En[full_course[0]])
    for c in full_course[1:]:
        if En[c] >= prev - 0.2:
            En[c] = prev - 0.2
        prev = float(En[c])

    # Step tributary mouth ravines
    trib_reports = {}
    for tid, cuts in TRIB_CUTS:
        tr = next(r for r in D['rivers'] if r['id'] == tid)
        old_last = tr['bed_m'][-1]
        for cy, cx, zt in cuts:
            assert (cy, cx) not in PROTECTED_RIM, f'trib {tid} touched protected rim {(cy, cx)}'
            if zt < En[cy, cx]:
                En[cy, cx] = zt
        recompute_beds(tr, En)
        trib_reports[tid] = {'name': tr['name'], 'bed_last_was': old_last, 'bed_last_now': tr['bed_m'][-1]}

    old_bed_10 = r007['bed_m'][10]
    recompute_beds(r007, En)
    if 'Amaro' not in r007.get('settlements', []):
        r007.setdefault('settlements', []).append('Amaro')

    # Verify strict river descent across ALL rivers (mirroring test_smodel.py check #6)
    for r in D['rivers']:
        bm = r.get('bed_m') or []
        assert not any(b2 > b1 + 1e-6 for b1, b2 in zip(bm, bm[1:])), f"non-monotonic bed_m in {r['id']}"
        pts_r = r.get('px') or []
        es_r = [float(En[int(round(py_r)), int(round(px_r))]) for px_r, py_r in pts_r]
        m_e = es_r[0] if es_r else 0.0
        for e_v in es_r:
            m_e = min(m_e, e_v)
            assert e_v - m_e <= 50.0, f"river {r['id']} climbs {e_v - m_e:.1f} m > 50 m"

    prom_h = round(float(En[NEW_PIN[1], NEW_PIN[0]]), 1)
    cit_h = round(float(En[1193, 730]), 1)
    qubab_h = round(float(En[1192, 732]), 1)
    conf_h = round(float(En[1191, 731]), 1)
    west_h = round(float(En[1193, 729]), 1)
    assert prom_h > 3085.0 and cit_h > 3100.0 and qubab_h > 3084.0
    assert 240.0 <= prom_h - conf_h <= 250.0
    assert 255.0 <= cit_h - west_h <= 270.0

    rep = {
        'edit': '5.1 edit 20: Amaro triple-confluence gorge and promontory pin',
        'date': '2026-11-18',
        'pin_was': list(OLD_PIN),
        'pin_now': list(NEW_PIN),
        'promontory_m': {
            'amaro_731_1192': prom_h,
            'citadel_730_1193': cit_h,
            'qubab_732_1192': qubab_h,
            'confluence_731_1191': conf_h,
            'qappu_mouth_729_1193': west_h,
            'cliff_drop_north_m': round(prom_h - conf_h, 1),
            'cliff_drop_citadel_west_m': round(cit_h - west_h, 1),
        },
        'r007_bed_at_amaro_was': old_bed_10,
        'r007_bed_at_amaro_now': r007['bed_m'][10],
        'r007_course_cells_carved': len(full_course),
        'tributaries': trib_reports,
    }
    print(json.dumps(rep, ensure_ascii=False, indent=2))
    if dry:
        return

    lap = C.lapse(D, E, En, whas, np.nan_to_num(wlev))
    for k in C.TEMPS:
        D[k] = lap[k]
    D['h'] = P.encode_heights(D, En)
    P.save(D)
    update_settlements_js()
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])
    update_openworld_jsons()
    with open(os.path.join(HERE, 'edit_520_amaro_gorge.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=2)
        f.write('\n')


if __name__ == '__main__':
    main()
