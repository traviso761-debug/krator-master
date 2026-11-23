#!/usr/bin/env python3
"""Marr (Porta Marr): Iziz's foremost Ring Sea port and canal-quartered sister city.

Delegates to kits/marr/build.py (built on the shared Iziz/Vernacular/Marr engine) and copies
dist/marr.html and sidecar textures into settlements/marr/dist/.

    python3 settlements/marr/build.py
    python3 settlements/marr/verify.py settlements/marr/dist/marr.html --assert
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
KIT_DIR = os.path.join(ROOT, 'kits', 'marr')

rc = subprocess.call([sys.executable, os.path.join(KIT_DIR, 'build.py')] + sys.argv[1:], cwd=KIT_DIR)
sys.exit(rc)
