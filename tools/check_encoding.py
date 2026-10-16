#!/usr/bin/env python3
"""Every text-mode open() in a build.py names encoding= (README.md, "Building on
Windows": without it Python writes the local code page and a page's em dashes become byte 0x97).

    python3 tools/check_encoding.py      # exit 1 and name each call that lacks it
"""
import ast, glob, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [p for pat in ('settlements/*/build.py', 'kits/*/build.py', 'biomes/*/build.py', 'openworld/*/build.py')
         for p in glob.glob(os.path.join(ROOT, pat))]


def mode_of(call):
    if len(call.args) > 1 and isinstance(call.args[1], ast.Constant):
        return call.args[1].value
    for k in call.keywords:
        if k.arg == 'mode' and isinstance(k.value, ast.Constant):
            return k.value.value
    return 'r' if len(call.args) < 2 and not any(k.arg == 'mode' for k in call.keywords) else None


bad = []
for f in sorted(FILES):
    tree = ast.parse(open(f, encoding='utf-8').read(), f)
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == 'open':
            m = mode_of(n)
            if m is not None and 'b' in m:
                continue
            if not any(k.arg == 'encoding' for k in n.keywords):
                bad.append('%s:%d  open() without encoding=' % (os.path.relpath(f, ROOT), n.lineno))
for b in bad:
    print(b)
print('%d build.py files, %d text-mode open() without encoding' % (len(FILES), len(bad)))
sys.exit(1 if bad else 0)
