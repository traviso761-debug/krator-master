#!/usr/bin/env python3
"""The Voth census check, once, for every build with a trades table (2026-10-19 audit; `tools/trades_census.json`
is the 46 trades of the Voth city, the yardstick). A build carries a fragment `src/NN-<p>-trades.js` with
`const <P>_TRADES = [ {trade, keys:[...], note?}, {trade, na:'why'}, {trade, keys:[], gap:'what is missing'} ... ]`:

  keys   the build's existing building keys that carry the trade (each must appear as a quoted literal in its src)
  na     the trade cannot or should not exist here, and why (embassy rows: 'tabled')
  gap    the trade has no building yet; a later session fills it (the build's KNOWN_ISSUES.md lists the gaps).
         A row may hold keys and a gap at once: partly carried.

    python3 tools/check_trades.py <build dir> [--table src/NN-x-trades.js]     # prints the report, exit 1 on a failure
    python3 tools/check_trades.py --all                                        # every build that has a table (test_all.py)

A verify.py calls `trades_check(build_dir)` -> (ok, detail) and prints it as its `voth-trades` assert. The table is read
with node (tools/_read_trades.js; the fragment is plain JS); the keys are looked up in the build's own `src/` text plus the extra `--src` dirs
the build reads in place (a kit's fragments), so a typo or a removed building fails the check.
"""
import glob, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CENSUS = os.path.join(ROOT, 'tools', 'trades_census.json')


def _node():
    n = shutil.which('node')
    if n:
        return n
    for p in ('C:/Program Files/nodejs/node.exe', '/usr/bin/node', '/usr/local/bin/node'):
        if os.path.exists(p):
            return p
    raise RuntimeError('node not found')


def find_table(build_dir):
    hits = sorted(glob.glob(os.path.join(build_dir, 'src', '*trades*.js')))
    for h in hits:
        with open(h, encoding='utf-8') as fh:
            if re.search(r'const\s+\w*_TRADES\s*=\s*\[', fh.read()):
                return h
    return None


def load_table(path):
    out = subprocess.run([_node(), os.path.join(ROOT, 'tools', '_read_trades.js'), '-', path], capture_output=True, text=True, encoding='utf-8')
    if out.returncode:
        raise RuntimeError('cannot read %s: %s' % (path, out.stderr.strip()))
    return json.loads(out.stdout)


def trades_check(build_dir, table=None, extra_src=()):
    """-> (ok, detail, report) for the build at build_dir."""
    table = table or find_table(build_dir)
    if not table:
        return False, 'no *_TRADES table in %s/src' % build_dir, {}
    T = load_table(table)
    with open(CENSUS, encoding='utf-8') as fh:
        census = [c['trade'] for c in json.load(fh)]
    text = ''
    srcs = [os.path.join(build_dir, 'src')] + [os.path.join(ROOT, e) if not os.path.isabs(e) else e for e in extra_src]
    for d in srcs:
        for f in glob.glob(os.path.join(d, '**', '*.js'), recursive=True):
            with open(f, encoding='utf-8', errors='replace') as fh:
                body = fh.read()
            if os.path.abspath(f) == os.path.abspath(table):
                body = body[:T['span'][0]] + body[T['span'][1]:]
            text += body + '\n'
    bad, rows = [], {}
    for r in T['rows']:
        t = r.get('trade')
        if t in rows:
            bad.append('duplicate row: %s' % t)
        rows[t] = r
        keys = list(r.get('keys') or [])
        for f, v in r.items():
            if f != 'keys' and isinstance(v, list) and all(isinstance(x, str) for x in v):
                keys += v        # a table that names keys per set (west / east, iziz ...) is read the same way
        na, gap = r.get('na'), r.get('gap')
        if na is not None and (not isinstance(na, str) or len(na.strip()) < 4):
            bad.append('%s: na needs a reason' % t)
        if na and (keys or gap):
            bad.append('%s: na with keys or a gap' % t)
        if gap is not None and (not isinstance(gap, str) or len(gap.strip()) < 4):
            bad.append('%s: gap needs a description' % t)
        if not na and not keys and not gap:
            bad.append('%s: no keys, na or gap' % t)
        for k in keys:
            if not re.search(r'[\'"`]' + re.escape(k) + r'[\'"`]', text) and not re.search(r'\b' + re.escape(k) + r'\b', text):
                bad.append('%s: key %s not found in src' % (t, k))
    for c in census:
        if c not in rows:
            bad.append('missing census trade: %s' % c)
    em = rows.get('envoys and embassy staff')
    if em and not (em.get('na') or any(isinstance(v, list) and v for v in em.values())):
        bad.append('embassy row must be na (tabled) or carried')
    haskeys = lambda r: any(isinstance(v, list) and v for v in r.values())
    carried = [t for t, r in rows.items() if haskeys(r) and not r.get('gap')]
    part = [t for t, r in rows.items() if haskeys(r) and r.get('gap')]
    gaps = [t for t, r in rows.items() if r.get('gap') and not haskeys(r)]
    nas = [t for t, r in rows.items() if r.get('na')]
    rep = {'table': T['name'], 'carried': carried, 'partial': part, 'gaps': gaps, 'na': nas}
    detail = ('%s: %d carried, %d partly, %d gaps, %d na of %d' % (T['name'], len(carried), len(part), len(gaps), len(nas), len(census))
              if not bad else '; '.join(bad[:8]))
    return not bad, detail, rep


def all_builds():
    out = []
    for pat in ('settlements/*', 'kits/*', 'biomes/*'):
        for d in sorted(glob.glob(os.path.join(ROOT, pat))):
            if os.path.isdir(os.path.join(d, 'src')) and find_table(d):
                out.append(d)
    return out


if __name__ == '__main__' and '--all' in sys.argv:
    fails = 0
    for d in all_builds():
        ok, detail, rep = trades_check(d)
        print(('PASS ' if ok else 'FAIL ') + os.path.relpath(d, ROOT).replace(os.sep, '/') + ' - ' + detail)
        fails += not ok
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'
    tb = sys.argv[sys.argv.index('--table') + 1] if '--table' in sys.argv else None
    ex = [sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == '--src']
    ok, detail, rep = trades_check(d, tb, ex)
    print(('PASS ' if ok else 'FAIL ') + 'voth-trades - ' + detail)
    if rep and '-v' in sys.argv:
        for k in ('gaps', 'partial', 'na'):
            print(k + ':', ', '.join(rep[k]))
    sys.exit(0 if ok else 1)
