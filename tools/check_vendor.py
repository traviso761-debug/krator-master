#!/usr/bin/env python3
"""Vendored-file drift may only shrink (CORE-IMPROVEMENTS.md, item 19).

    python3 tools/check_vendor.py                   # fail on drift not in tools/check_vendor_baseline.json
    python3 tools/check_vendor.py --list            # every finding, baselined or not, with the report lines behind it
    python3 tools/check_vendor.py --write-baseline  # accept today's findings (after a re-vendor shrank them, or a deliberate case)
    python3 tools/check_vendor.py settlements/ys    # one build (the other builds' baseline keys are carried over untouched)
    python3 tools/check_vendor.py --quiet           # no per-build summary lines

Every build.py that implements `--vendor-check` (BUILDS below, found by grep) is run as `python3 build.py --vendor-check`
in its own directory, in parallel. Each of those exits before building and writes nothing (checked 2026-10-27: `git
status --porcelain` is unchanged after running all of them). Two kinds of build are handled differently:

  RUNPY    settlements/shade's main() builds the page FIRST and runs vendor_check() after it, so the flag cannot be used.
           Its build.py is loaded with runpy (the `__main__` guard does not fire; argv carries --no-checks so the top-level
           port lint is skipped) and its vendor_check() is called directly.
  SKIP     kits/crops and kits/resources name `--vendor-check` only to skip the port lint: they vendor nothing (they read
           kits/scyvoi in place), and the flag would run a full build.

The reports differ from build to build (the scyvoi family's `!`/`=` rows, the catalog family's `DRIFTED` rows, the
city settlements' `DRIFT in a, b - re-vendor ...` summaries, ringsea's `~ ... drifts (deliberate: reason)`, Ys's and
Highlands' `adapted on purpose (a, b)`). parse() reads all of them into a set of drifted files and a set of adapted
files per build. Lines after "OPEN ISSUES" (the KNOWN_ISSUES.md echo some builds print) are ignored.

Findings (each counts 1, so the ratchet means the SET may only shrink):
  <build>: DRIFT <file>              a vendored file differs from its upstream and is not declared adapted
  <build>: MISSING-UPSTREAM <file>   a vendored file whose upstream is gone
  <build>: ADAPTED-NO-REASON <file>  an adapted (deliberately drifted) file with no reason text: the build's ADAPTED /
                                     DELIBERATE dict gives an empty reason, or (ADAPTED is a set, or the build treats every
                                     shadowing file as adapted: IMPLICIT_ADAPTED) the build's KNOWN_ISSUES.md never names it
  <build>: ERROR                     the vendor check crashed, printed no vendor-check line, or exited nonzero while
                                     reporting no drift (the output's tail is the detail)

Informational rows (post-apoc's `~ forked from kits/ancients/src ... informational`, `= identical`) are not findings.
The shared ratchet (tools/ratchet.py) holds the baseline in tools/check_vendor_baseline.json.
"""
import ast, os, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ratchet

ROOT = ratchet.ROOT
NAME = 'check_vendor'
BUILD_GLOBS = ('biomes', 'kits', 'settlements', 'openworld')

RUNPY = {'settlements/shade': "main() builds the page before vendor_check(); call vendor_check() directly"}
SKIP = {'kits/crops': 'vendors nothing; --vendor-check only skips the port lint, the build would run',
        'kits/resources': 'vendors nothing (reads kits/scyvoi in place); the flag would run a full build'}
# builds whose every src/ file shadowing an upstream fragment is an adapted copy by design (their build.py docstring):
# their `DRIFT from ...` rows are adapted files, which need a KNOWN_ISSUES.md entry
IMPLICIT_ADAPTED = {'biomes/dambasins', 'settlements/hook'}

RUNPY_CODE = ("import runpy, sys; sys.argv = ['build.py', '--no-checks']; m = runpy.run_path('build.py'); "
              "r = m['vendor_check'](); sys.exit(1 if r else 0)")


def builds(only=None):
    out = []
    for top in BUILD_GLOBS:
        d = os.path.join(ROOT, top)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            bp = os.path.join(d, name, 'build.py')
            if os.path.isfile(bp) and '--vendor-check' in open(bp, encoding='utf-8', errors='replace').read():
                out.append(top + '/' + name)
    if only:
        only = os.path.relpath(os.path.abspath(only), ROOT).replace(os.sep, '/').rstrip('/')
        out = [b for b in out if b == only]
    return out


def run(build):
    cwd = os.path.join(ROOT, build)
    cmd = [sys.executable, '-c', RUNPY_CODE] if build in RUNPY else [sys.executable, 'build.py', '--vendor-check']
    env = dict(os.environ, PYTHONIOENCODING='utf-8', KRATOR_ALLOW_PLAIN_BUILD='1')   # a vendor check writes nothing (item 25)
    t = time.time()
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace',
                           timeout=300, env=env)
        out, rc = r.stdout + r.stderr, r.returncode
    except subprocess.TimeoutExpired:
        out, rc = 'timed out after 300 s', -1
    return out, rc, time.time() - t


def norm(f):
    f = f.strip().replace('\\', '/')
    return f[4:] if f.startswith('src/') else f


def split_list(s):
    s = s.split(' - ', 1)[0]
    return [x.strip() for x in s.split(',') if x.strip()]


def parse(out):
    """-> (drift {file: line}, adapted {file: reason or None}, missing {file: line}, saw_vendor_line)"""
    drift, adapted, missing, saw = {}, {}, {}, False
    for ln in out.splitlines():
        if 'OPEN ISSUES' in ln:
            break
        if 'vendor-check' in ln:
            saw = True
        s = ln.strip()
        m = re.match(r'!\s+(\S+)', s)                                   # scyvoi family, ringsea, post-apoc, dhelv
        if m:
            drift[norm(m.group(1))] = s; continue
        m = re.match(r'~\s+(\S+)\s+drifts \(deliberate: (.*)\)$', s)    # ringsea DELIBERATE
        if m:
            adapted[norm(m.group(1))] = m.group(2).strip() or None; continue
        if re.match(r'[~=?]\s', s):
            if s.startswith('?') and ('upstream missing' in s or 'no upstream' in s):
                missing[norm(s.split()[1])] = s
            continue
        m = re.match(r'vendor-check: (\S+)\s+DRIFTED\b', s)             # catalog family
        if m:
            drift[norm(m.group(1))] = s; continue
        m = re.match(r'vendor-check: (\S+): upstream (\S+) missing', s)
        if m:
            missing[norm(m.group(1))] = s; continue
        m = re.match(r'vendor-check: (\S+) drifts from \(deliberate: (.*?)\)', s)   # dalab's 63-anc-dalab
        if m:
            adapted[norm(m.group(1))] = m.group(2).strip() or None; continue
        m = re.match(r'vendor-check: missing upstream: (.*)', s)
        if m:
            for f in split_list(m.group(1)):
                missing[norm(f)] = s
            continue
        m = re.match(r'(\S+)\s+DRIFT from \S+', s)                      # dambasins, hook
        if m:
            drift[norm(m.group(1))] = s; continue
        m = re.search(r'adapted on purpose \(([^)]*)\)', s)             # highlands, reedlake, ys
        if m:
            for f in split_list(m.group(1)):
                if f != '-':
                    adapted.setdefault(norm(f), None)
        m = re.search(r'\b(?:BIOME )?DRIFT(?: vs \S+)? in (.*)', s) or re.search(r'\b(?:DRIFT|drift): (.*)', s)
        if m:
            for f in split_list(m.group(1)):
                if f.endswith(' (missing upstream)'):
                    missing[norm(f[:-len(' (missing upstream)')])] = s
                else:
                    drift[norm(f)] = s
    return drift, adapted, missing, saw


def declared(build):
    """{file: reason or None} from build.py's top-level ADAPTED / DELIBERATE literal (a dict gives reasons, a set none)."""
    try:
        tree = ast.parse(open(os.path.join(ROOT, build, 'build.py'), encoding='utf-8').read())
    except (SyntaxError, OSError):
        return {}
    out = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in ('ADAPTED', 'DELIBERATE') for t in node.targets):
            try:
                v = ast.literal_eval(node.value)
            except ValueError:
                continue
            if isinstance(v, dict):
                out.update({norm(k): (str(r).strip() or None) for k, r in v.items()})
            elif isinstance(v, (set, list, tuple)):
                out.update({norm(k): None for k in v})
    return out


def known_issues_names(build, f):
    p = os.path.join(ROOT, build, 'KNOWN_ISSUES.md')
    return os.path.isfile(p) and os.path.basename(f) in open(p, encoding='utf-8', errors='replace').read()


def check(build, out, rc):
    findings, detail = {}, {}

    def add(key, line):
        k = '%s: %s' % (build, key)
        findings[k] = 1
        detail.setdefault(k, []).append(line if len(line) <= 160 else line[:157] + '...')

    drift, adapted, missing, saw = parse(out)
    if build in IMPLICIT_ADAPTED:
        adapted.update({f: None for f in drift})
        drift = {}
    decl = declared(build)
    for f in adapted:
        reason = adapted[f] or decl.get(f)
        if not reason and not known_issues_names(build, f):
            add('ADAPTED-NO-REASON ' + f, 'adapted, but no reason in build.py and KNOWN_ISSUES.md does not name it')
    for f, ln in sorted(drift.items()):
        if f not in adapted:
            add('DRIFT ' + f, ln)
    for f, ln in sorted(missing.items()):
        add('MISSING-UPSTREAM ' + f, ln)
    crashed = 'Traceback (most recent call last)' in out
    if crashed or not saw or (rc != 0 and not drift and not missing):
        tail = [l for l in out.splitlines() if l.strip()][-8:]
        add('ERROR', 'exit %d%s' % (rc, '; traceback' if crashed else '' if saw else '; no vendor-check line'))
        detail['%s: ERROR' % build].extend(tail)
    return findings, detail, len(drift), len(adapted), len(missing)


def main(argv):
    only = next((a for a in argv if not a.startswith('--')), None)
    todo = builds(only)
    if only and not todo:
        print('check_vendor: %s has no --vendor-check' % only); return 2
    if only and '--write-baseline' in argv:
        print('check_vendor: --write-baseline needs the whole run (no build argument)'); return 2
    t0 = time.time()
    runs = [b for b in todo if b not in SKIP]
    with ThreadPoolExecutor(max_workers=min(8, os.cpu_count() or 4)) as ex:
        res = dict(zip(runs, ex.map(run, runs)))
    findings, detail = {}, {}
    for b in todo:
        if b in SKIP:
            if '--quiet' not in argv:
                print('  %-26s skipped (%s)' % (b, SKIP[b]))
            continue
        out, rc, dt = res[b]
        f, d, nd, na, nm = check(b, out, rc)
        findings.update(f); detail.update(d)
        if '--quiet' not in argv:
            print('  %-26s %2d drifted, %2d adapted, %d missing upstream%s  (exit %d, %.1f s%s)' % (
                b, nd, na, nm, ', ERROR' if b + ': ERROR' in f else '', rc, dt, ', runpy' if b in RUNPY else ''))
    print('check_vendor: %d builds checked in %.1f s' % (len(runs), time.time() - t0))
    if only:   # one build: keep the other builds' baseline keys as they are
        findings.update({k: v for k, v in ratchet.load(NAME).items() if not k.startswith(todo[0] + ': ')})
    return ratchet.main(NAME, findings, argv, detail)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
