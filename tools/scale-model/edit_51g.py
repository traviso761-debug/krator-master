#!/usr/bin/env python3
"""Scale model 5.1, the Gate edit (2026-11-11): the Hall of Heroes' pin and the Labyrinth's eastern corner (biomes/labyrinth/PLAN-GATE.md).

    python3 tools/scale-model/edit_51g.py            # edits model/src in place, writes edit_51g.report.json

A records-only edit: no raster moves (every raster of model/data is checked unchanged at the end).

1. The pin: the Hall of Heroes (`shallofheroes`, a ruined arcology) at px 376.5, 1473.5 (pins are whole px: 377, 1474), the
   neck of the Labyrinth's one eastern opening on the Gowd Warra (r331). The owner's answers of 2026-11-11: a ruin, the Kimr's
   necropolis, named the Hall of Heroes. Added to the page's defaults (`model/src/60-settlements.js` defSetts) and to
   SETT_ADDED under the reconcile key `5.1g1`, so a browser that already holds a saved list gets it once.
2. The Labyrinth's polygon (`rmw8bqrn3dnx4`): its diagonal east edge from (393,1513) to (345,1463) cut the floor 20 km short
   of the neck (the owner, 2026-11-11: keep the site and move the corner). Two points are inserted, (394,1484) and
   (384,1467), so the neck and the Hall stand inside it. Written to the page's defaults (`model/src/51-region-store.js`)
   with a merge key `krator.regMerged.5.1g1`, as edit 1 did for Region 99.

The reconcile keys 5.1e1-5.1e3 belong to the scale-model session's edits 1-3 (branch claude/dreamy-davinci-30f3c1); this
edit takes 5.1g1 so the two merge without a clash of keys (the files will want a textual merge: both append to the same
two tables). The live artifact's shared database is not written here: publish after merging (README, "Making an edit").
Refuses to run twice (the pin is the marker).
"""
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'model', 'src')
DATA = os.path.join(HERE, 'model', 'data')
KEY = '5.1g1'
PIN = {"id": "shallofheroes", "name": "Hall of Heroes", "type": "ruined arcology", "px": 377, "py": 1474,
       "notes": ("The Hall of Heroes: the Kimrs' ancestral arcology at the Labyrinth's one eastern opening, standing in its "
                 "reflecting pond on the Gowd Warra (r331), 1,131 m, Cfb. After Soleri's Arcvillage II: a hexagon 424 m across "
                 "and 400 m high on six columns, two topographies, a skylight well; five carved stacks bridged to it. A ruin: "
                 "the Kimr bury their dead in its broken cells and walk their funerals along its causeways "
                 "(biomes/labyrinth/PLAN-GATE.md; kits/ancients targets/gatearc; the Labyrinth's station 1, the Gate)."),
       "createdAt": "2026-11-11T12:00:00.000Z"}
REGION = 'rmw8bqrn3dnx4'
INSERT_AFTER, INSERT = [393, 1513], [[394, 1484], [384, 1467]]


def inside(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def data_hash():
    h = hashlib.sha1()
    for f in sorted(os.listdir(DATA)):
        h.update(f.encode()); h.update(open(os.path.join(DATA, f), 'rb').read())
    return h.hexdigest()


def main():
    rep = {'edit': 'scale model 5.1, the Gate edit (5.1g1)', 'date': '2026-11-11'}
    h0 = data_hash()
    sp = os.path.join(SRC, '60-settlements.js'); s = open(sp, encoding='utf-8', newline='').read()
    if '"shallofheroes"' in s:
        sys.exit('edit_51g.py: already applied (the Hall of Heroes is in 60-settlements.js)')
    pin = json.dumps(PIN, ensure_ascii=False)
    # 1a. the defaults: append to defSetts
    m = re.search(r'(const defSetts = \[)(.*?)(\];\n)', s, re.S)
    assert m and s.count('const defSetts = [') == 1, 'defSetts not found once'
    s = s[:m.end(2)] + ', ' + pin + s[m.end(2):]
    # 1b. SETT_ADDED: a new key, so a browser with a saved list takes it once
    a = "  const SETT_ADDED={\n"
    assert s.count(a) == 1, 'SETT_ADDED not found once'
    s = s.replace(a, a + "    '" + KEY + "':[" + pin + "],   // the Gate edit (edit_51g.py): the Hall of Heroes\n")
    open(sp, 'w', encoding='utf-8', newline='').write(s)
    # 2. the region's polygon in the page's defaults, and its merge key
    rp = os.path.join(SRC, '51-region-store.js'); r = open(rp, encoding='utf-8', newline='').read()
    m = re.search(r'\{"id": "' + REGION + r'", "name": "Labyrinth", "color": "[^"]+", "points": (\[\[.*?\]\])', r)
    assert m, 'the Labyrinth not found in defRegs'
    pts = json.loads(m.group(1)); old = [list(p) for p in pts]
    i = pts.index(INSERT_AFTER); pts = pts[:i + 1] + INSERT + pts[i + 1:]
    r = r[:m.start(1)] + json.dumps(pts) + r[m.end(1):]
    a = "      if(localStorage.getItem('krator.regMerged.5.1e1')!=='1'){"
    assert r.count(a) == 1, 'edit 1 merge block not found once'
    blk = ("      if(localStorage.getItem('krator.regMerged." + KEY + "')!=='1'){   // the Gate edit (edit_51g.py): the Labyrinth's east corner takes in the neck\n"
           "        [\"" + REGION + "\"].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
           "        localStorage.setItem('krator.regMerged." + KEY + "','1');\n"
           "        localSave();\n"
           "      }\n")
    r = r.replace(a, blk + a)
    open(rp, 'w', encoding='utf-8', newline='').write(r)
    site = [376.5, 1473.5]
    rep.update({'pin': PIN, 'region': REGION, 'points_before': old, 'points_after': pts,
                'site_inside_before': inside(site, old), 'site_inside_after': inside(site, pts),
                'pin_inside_after': inside([PIN['px'], PIN['py']], pts), 'reconcile_key': KEY})
    h1 = data_hash()
    rep['data_unchanged'] = h0 == h1
    assert h0 == h1, 'model/data changed: this edit is records only'
    assert rep['site_inside_after'] and rep['pin_inside_after'], 'the site is still outside the Labyrinth'
    json.dump(rep, open(os.path.join(HERE, 'edit_51g.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    print(json.dumps({k: rep[k] for k in ('site_inside_before', 'site_inside_after', 'pin_inside_after', 'data_unchanged', 'reconcile_key')}))


if __name__ == '__main__':
    main()
