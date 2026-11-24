#!/usr/bin/env python3
"""Marr (Porta Marr): Iziz's foremost Ring Sea port and canal-quartered sister city.

Delegates to kits/marr/build.py (built on the shared Iziz/Vernacular/Marr engine) and copies
dist/marr.html and sidecar textures into settlements/marr/dist/.

    python3 settlements/marr/build.py
    python3 settlements/marr/verify.py settlements/marr/dist/marr.html --assert
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KIT_DIR = os.path.join(ROOT, 'kits', 'marr')

# the settlement's page (dist/marr.html, the kit's city target) takes core/rand and core/tags, and Iziz's 91t-iziz-tags.js
# registers its buildings (REG) into core/tags; kits/marr/build.py checks every page, this checks the one mirrored here
CORE_TAKEN = ('rand', 'tags')

rc = subprocess.call([sys.executable, os.path.join(KIT_DIR, 'build.py')] + sys.argv[1:], cwd=KIT_DIR)
if not rc and '--list-sources' not in sys.argv:
    need = ['91t-iziz-tags.js']
    for mod in CORE_TAKEN:
        mdir = os.path.join(ROOT, 'core', mod)
        need += sorted(f for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js'))
    with open(os.path.join(KIT_DIR, 'build-manifest-city.json'), encoding='utf-8') as fh:
        listed = json.load(fh)
    missing = [f for f in need if f not in listed]
    if missing:
        sys.exit('build.py: marr.html does not take %s' % ', '.join(missing))
sys.exit(rc)
