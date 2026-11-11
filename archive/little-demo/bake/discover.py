"""List every drawable a built town page makes (discover.js), to choose the bake's keep rules.
  python bake/discover.py <page relative to the repo root> [query] > out.json
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from browser import Page

rel, q = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
with Page() as P:
    t = P.open(rel, q)
    r = P.eval(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'discover.js'), encoding='utf8').read())
    r['load_s'] = round(t, 1)
    r['errors'] = P.errors[:10]
json.dump(r, sys.stdout, indent=0)
