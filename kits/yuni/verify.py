#!/usr/bin/env python3
"""Headless check for the Yuni kit's sheet (kits/yuni/README.md, "Its own sheet"); sheetverify.py has the asserts.

  python3 verify.py [dist/yuni.html] [--assert] [--views "Whole sheet|Wealthy compounds"] [--all-views] [--eval "()=>..."]
                    [--out shots] [--size 1280x800] [--no-cache]
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness  # noqa: F401  (at the top: the verify wrapper, the stall watchdog and the verify cache)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sheetverify, sheetbuild, yunikit

if __name__ == '__main__':
    sys.exit(sheetverify.main(HERE, 'yuni.html', yunikit.FILES, sheetbuild.YUNI_ENGINE))
