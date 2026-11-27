#!/usr/bin/env python3
"""The push shader's two copies against each other: the page's (the string pushOut builds in src/50-figure.js) and
Godot's (godot/krator/character/kchar_push.gdshaderinc). Every change to the push goes into both (HANDOFF-GARMENT-NEXT.md,
"Rules that bit"), and the twin drifted when it did not (REVIEW-GARMENTS-2026-11-06.md, section 1). build.py runs it.

Compared: the uniforms each declares (a mismatch fails), and the numeric literals in each push body (a threshold, a
pad, a fade: every tuned number), as a multiset. Literals in one copy and not the other are listed; the count of
those is held to tests/twin-baseline.json, so a change that widens the gap fails and one that closes it is asked to
lower the baseline.

  python3 tools/check_twin.py            # check
  python3 tools/check_twin.py --baseline # write the baseline from the copies as they stand
"""
import json, os, re, sys
from collections import Counter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
JS = os.path.join(HERE, 'src', '50-figure.js')
GD = os.path.join(ROOT, 'godot', 'krator', 'character', 'kchar_push.gdshaderinc')
BASE = os.path.join(HERE, 'tests', 'twin-baseline.json')
NUM = re.compile(r'(?<![\w.])(\d+\.\d+|\d+)(?![\w.])')


def page_shader():
    """the vertex-shader string pushOut builds: from its uniform declarations to the fragment shader's"""
    s = open(JS, encoding='utf-8').read()
    a = s.index("sh.vertexShader = 'uniform vec4 kcA[")
    b = s.index('sh.fragmentShader =', a)
    body = s[a:b]
    # the JS string pieces only: drop the comments between them, and the JS that glues them (' + NCAP + ')
    body = re.sub(r'//[^\n]*', '', body)
    parts = re.findall(r"'((?:[^'\\]|\\.)*)'", body)
    return '\n'.join(parts).replace('\\n', '\n').replace('\\t', '\t')


def godot_shader():
    s = open(GD, encoding='utf-8').read()
    return re.sub(r'//[^\n]*', '', s)


def uniforms(src):
    return set(re.findall(r'uniform\s+\w+\s+(\w+)', src))


def literals(src):
    """the numbers, as values: 0.30 and 0.3 and 0.300 are one literal, 1 and 1.0 too"""
    return Counter(('%.6g' % float(x)) for x in NUM.findall(src))


def main():
    js, gd = page_shader(), godot_shader()
    uj, ug = uniforms(js), uniforms(gd)
    fails = []
    if uj - ug:
        fails.append('uniforms the page has and Godot lacks: ' + ', '.join(sorted(uj - ug)))
    if ug - uj:
        fails.append('uniforms Godot has and the page lacks: ' + ', '.join(sorted(ug - uj)))
    lj, lg = literals(js), literals(gd)
    only_js = sorted((lj - lg).elements(), key=float)
    only_gd = sorted((lg - lj).elements(), key=float)
    gap = len(only_js) + len(only_gd)
    print('check_twin: page %d literals, Godot %d; only on the page: %s' % (sum(lj.values()), sum(lg.values()), ' '.join(only_js) or '-'))
    print('check_twin: only in Godot: %s' % (' '.join(only_gd) or '-'))
    if '--baseline' in sys.argv:
        json.dump({'gap': gap, 'note': 'literals in one push shader copy and not the other (tools/check_twin.py); lower it as the twin converges'},
                  open(BASE, 'w', encoding='utf-8', newline='\n'), indent=1)
        print('check_twin: baseline gap %d written' % gap)
        return 0
    base = json.load(open(BASE, encoding='utf-8'))['gap'] if os.path.exists(BASE) else 0
    if gap > base:
        fails.append('the two copies differ in %d literals, the baseline allows %d: port the change to the other copy' % (gap, base))
    elif gap < base:
        print('check_twin: the gap is %d, under the baseline %d: run --baseline to hold it there' % (gap, base))
    for f in fails:
        print('check_twin: FAIL ' + f)
    print('check_twin: %s (gap %d, baseline %d)' % ('ok' if not fails else 'FAILED', gap, base))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
