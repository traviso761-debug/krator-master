#!/usr/bin/env python3
"""Headless check for the Eastern Abyssal kit's sheet (kits/eastern-abyssal/README.md, "Its own sheet");
kits/yuni/sheetverify.py has the asserts.

  python3 verify.py [dist/eastern-abyssal.html] [--assert] [--query "?interiors=1"] [--views "Whole sheet|..."] [--all-views]
                    [--eval "()=>..."] [--out shots] [--size 1280x800] [--no-cache]
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness  # noqa: F401  (at the top: the verify wrapper, the stall watchdog and the verify cache)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(os.path.dirname(HERE), 'yuni')]
import sheetverify, sheetbuild, abysskit

if __name__ == '__main__':
    sys.exit(sheetverify.main(HERE, 'eastern-abyssal.html', abysskit.FILES, sheetbuild.LOCUS_ENGINE))
