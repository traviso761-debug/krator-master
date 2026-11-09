#!/usr/bin/env python3
"""Headless check for the Iziz Vernacular kit's own sheet (build.py; the checks are sheet_verify.py's, on tools/harness.py):

    python3 verify.py dist/iziz-vernacular.html --assert [--views "Opening|Overview"] [--all-views] [--only key1,key2] [--out shots]

The kit's trades table (src/74z-vern-trades.js) names two buildings of Iziz's foreign quarter (the Voth embassy, the Order's
chapterhouse: settlements/iziz/src/75-port-embassy.js, 76-port-chapterhouse.js), which are not the kit's, so the sheet does not
carry them: those two trades are reported, not failed (tools/check_trades.py looks them up in Iziz's src/ the same way)."""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sheet_verify   # noqa: E402

if __name__ == '__main__':
    sheet_verify.run('iziz-vernacular', foreign=('envoys and embassy staff', 'monks and lay brothers'))
