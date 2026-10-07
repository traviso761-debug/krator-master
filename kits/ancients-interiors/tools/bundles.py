#!/usr/bin/env python3
"""Write the node test harness's bundles to tools/.cache/: fb.js (the catalog's furniture: the harvested registry, the
Ancient pieces among it, and post-apoc, scrap, generic, goods) and ib.js (kits/interiors with the noahs-regret set).
Rerun after a catalog or kits/interiors change.   python3 tools/bundles.py"""
import importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
fb = load('t_fb', os.path.join(ROOT, 'kits', 'catalog', 'furniture_bundle.py'))
ib = load('t_ib', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
out = os.path.join(HERE, '.cache'); os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'fb.js'), 'w', encoding='utf-8').write(fb.bundle(['post-apoc', 'scrap', 'generic', 'generic-goods'], harvested=True))
open(os.path.join(out, 'ib.js'), 'w', encoding='utf-8').write(ib.bundle(['noahs-regret']))
print('wrote tools/.cache/fb.js and ib.js')
