#!/usr/bin/env python3
"""The catalog engine's file list (core/catalog/README.md; MODULARITY-PLAN.md step 3). A build that reads the catalog by
name resolves each name here, the engine's and the kit's alike:

    sys.path.insert(0, os.path.join(ROOT, 'core', 'catalog'))
    import catalog as kcat
    kcat.path('krator-asset-engine.js')            # core/catalog/krator-asset-engine.js
    kcat.path('krator-master-furniture-iziz.js')   # kits/catalog/krator-master-furniture-iziz.js (a culture file)
    kcat.rel(f)                                    # the same, repo-relative with '/': a label or a script tag

The engine is here; the content (one file per culture, the harvested registry, the buildings, the plants, three.js r128)
stays in kits/catalog. The names are the ones the files had there, so lists of names keep their order."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KIT = os.path.join(ROOT, 'kits', 'catalog')
_FILES = json.load(open(os.path.join(HERE, 'files.json'), encoding='utf-8'))   # the list, shared with the node tools
ENGINE = _FILES['engine']
SYMBOLS = 'krator-symbols.js'        # the culture symbols: the name resolves to files.json "symbols", core/sockets/38-symbols.js
WHERE = {f: os.path.join(HERE, f) for f in ENGINE}
WHERE[SYMBOLS] = os.path.join(ROOT, *_FILES['symbols'].split('/'))


def path(f):
    return WHERE.get(f) or os.path.join(KIT, f)


def rel(f):
    return os.path.relpath(path(f), ROOT).replace(os.sep, '/')
