#!/usr/bin/env python3
"""Scale model 5.1, edit 2 (2026-11-09): Godshearth's vent records (the owner: "vent records can go on the model").

    python3 tools/scale-model/edit_512.py            # adds the records to model/data/vents.json, writes edit_512.report.json

biomes/godshearth/PLAN.md section 8, model amendment 1: the Hearths' sites and KTHERM's bakes come from `DATA.vents`, and the
caldera had none. Six records, each `region` Godshearth (rmw4wou2y1hhc), its `floor` the model's ground (or the lake's bed)
under it, read here from the heights, never typed in:
  - the hot lake's bed vents (spring), at the lake's middle;
  - the hot lake's shore vents (spring), in the lake 400 m off its east shore (station 1's page);
  - the shore geyser field (geyser), on the east shore (station 1);
  - the shore vent line (fumarole, `line`), 0.5-1 km inland of the field: station 1's hearth grove;
  - the grove's vent line (fumarole, `line`), at station 2 (836,1388): the discs merging into forest;
  - the spillway's head (fumarole), where the floor breaks south into the gorge (station 4's way up).
New fields, kept to these records: `name`, `kind` ('spring' and 'fumarole' join 'geyser': steam, no lava glow, on the model's
page: model/src/30-vents.js), `T` (the ground's temperature at the vent, degrees C), `reach_m` (where its heat reaches the
soil's: KTHERM's reach), `line` (a vent line's points, 5.1 px; `px` is its middle). Heights and every raster are untouched.
Refuses to run twice (the records' names are the marker).
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.page as P   # noqa: E402

GH_ID = 'rmw4wou2y1hhc'
VENTS = [
    dict(name="Godshearth: the hot lake's bed vents", kind='spring', px=[839.0, 1394.0], T=88, reach_m=900, scale=.3, radius=1.4),
    dict(name="Godshearth: the hot lake's shore vents", kind='spring', px=[841.62, 1393.78], T=80, reach_m=250, scale=.15, radius=.8),
    dict(name="Godshearth: the shore geyser field", kind='geyser', px=[842.02, 1394.06], T=94, reach_m=430, scale=.2, radius=1.0),
    dict(name="Godshearth: the shore vent line (station 1's hearth grove)", kind='fumarole', T=92, reach_m=100, scale=.12, radius=.6,
         line=[[842.19, 1393.62], [842.35, 1393.765], [842.48, 1393.925]]),
    dict(name="Godshearth: the grove's vent line (station 2)", kind='fumarole', T=92, reach_m=140, scale=.15, radius=.7,
         line=[[835.4, 1387.4], [836.0, 1388.0], [836.7, 1388.7]]),
    dict(name="Godshearth: the spillway's head", kind='fumarole', px=[845.0, 1396.5], T=90, reach_m=120, scale=.12, radius=.6),
]


def main():
    D = P.load()
    have = {v.get('name') for v in D['vents']}
    if any(v['name'] in have for v in VENTS):
        sys.exit('edit_512 has run already (Godshearth\'s vents are in vents.json)')
    E, _ = P.heights(D)
    su, sv = P.grid(D)

    def ground(px, py):
        x, y = px * su, py * sv
        i, j = int(x), int(y)
        fx, fy = x - i, y - j
        return float(E[j, i] * (1 - fx) * (1 - fy) + E[j, i + 1] * fx * (1 - fy) + E[j + 1, i] * (1 - fx) * fy + E[j + 1, i + 1] * fx * fy)

    out = []
    for v in VENTS:
        r = dict(v)
        if 'line' in r:
            L = r['line']
            r['px'] = [round(sum(p[0] for p in L) / len(L), 3), round(sum(p[1] for p in L) / len(L), 3)]
        r['floor'] = round(ground(*r['px']), 1)
        r['region'] = GH_ID
        out.append({k: r[k] for k in ('px', 'floor', 'scale', 'radius', 'kind', 'name', 'region', 'T', 'reach_m') if k in r}
                   | ({'line': r['line']} if 'line' in r else {}))
    path = os.path.join(P.DATA_DIR, 'vents.json')
    raw = open(path, encoding='utf-8').read()
    vents = json.loads(raw)
    assert '[\n' + ',\n'.join(json.dumps(v, ensure_ascii=False) for v in vents) + '\n]\n' == raw, 'vents.json would reformat'
    vents += out
    open(path, 'w', encoding='utf-8', newline='\n').write('[\n' + ',\n'.join(json.dumps(v, ensure_ascii=False) for v in vents) + '\n]\n')
    rep = {'edit': '5.1 edit 2', 'date': '2026-11-09', 'vents_added': out, 'vents_total': len(vents)}
    json.dump(rep, open(os.path.join(HERE, 'edit_512.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
