#!/usr/bin/env python3
"""Headless check for the Highlands kit's own sheet (build.py; the checks are kits/iziz-vernacular/sheet_verify.py's, on
tools/harness.py):

    python3 verify.py dist/highlands.html --assert [--views "Opening|Overview"] [--all-views] [--only key1,key2] [--out shots]

The trades table (src/89-hl-trades.js, HL_TRADES) is checked against the Voth census by tools/check_trades.py, as Highlands'
verify.py did."""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'iziz-vernacular'))
import sheet_verify   # noqa: E402

if __name__ == '__main__':
    sheet_verify.run('highlands', census=True)
