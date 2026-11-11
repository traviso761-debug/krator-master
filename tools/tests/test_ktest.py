#!/usr/bin/env python3
"""tools/ktest.js, the node test helper (CORE-IMPROVEMENTS.md item 29), on its fixtures in tools/tests/ktest/: a clean test
passes; a local `ok`, a negative written backwards, a check that measures nothing and an ok( site that never runs each fail.

    python3 tools/tests/test_ktest.py
"""
import os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NODE = shutil.which('node')
# fixture -> (exit code, a phrase its output must hold)
CASES = {'good.js': (0, 'every one ran'), 'shadow.js': (1, 'declares its own `ok`'),
         'backwards.js': (1, 'written backwards'), 'nothing.js': (1, 'measures nothing'), 'unrun.js': (1, 'never ran (line 4)')}


def main():
    if not NODE:
        print('SKIP  no node')
        return 0
    bad = 0
    for f, (code, phrase) in CASES.items():
        r = subprocess.run([NODE, os.path.join(HERE, 'ktest', f)], capture_output=True, text=True, encoding='utf-8', errors='replace')
        ok = r.returncode == code and phrase in r.stdout
        bad += not ok
        print('%s  %-13s exit %d%s' % ('PASS' if ok else 'FAIL', f, r.returncode, '' if ok else ': ' + r.stdout[-300:]))
    print('%d cases, %d wrong' % (len(CASES), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
