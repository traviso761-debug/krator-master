#!/usr/bin/env python3
"""Every check the repo has, in one run (ROADMAP.md, stage 0a). CI runs this; so can anyone, from anywhere.

    python3 tools/test_all.py              # the push checks: lints, node tests, rebuild everything, hash baseline
    python3 tools/test_all.py --nightly    # also: the furniture fingerprint, verify.py --assert on the critical
                                           # builds, the Godot headless tests (each skipped, and said so, when its
                                           # tool is missing: playwright, godot)
    python3 tools/test_all.py --no-build   # skip the rebuild and the baseline (lints and tests only)
    python3 tools/test_all.py --list       # print the steps and exit

Exit code 1 if any step fails. Each step prints PASS, FAIL or SKIP with its time; failures print the tail of their
output. Nothing here edits a tracked file except the rebuild, which writes the pages every build.py writes: a clean
tree after a run is part of the proof (the push job checks it with `git status --porcelain`).
"""
import glob, importlib.util, os, shutil, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = sys.executable
TOPS = ('settlements', 'kits', 'biomes', 'openworld')

# The critical-path builds for the nightly verify (GODOT-PLAN.md 3.3): the page and the arguments verify.py takes.
NIGHTLY_VERIFY = [
    ('biomes/hyperjungle', 'dist/hyperjungle.html', ['--assert']),
    ('biomes/rift', 'dist/rift.html', ['--assert']),
    ('biomes/sedesert', 'dist/sedesert.html', ['--assert']),
    ('settlements/iziz', 'dist/iziz.html', ['--assert']),
    ('settlements/girder', 'girder.html', ['--assert']),
    ('settlements/voth', 'voth.html', ['--assert']),
    ('settlements/verge', 'dist/verge.html', ['--assert']),
]
GODOT_TESTS = ['res://tests/rand/krand_test.gd', 'res://tests/tags/ktags_test.gd',
               'res://tests/mask/kmask_test.gd', 'res://tests/atmos/atmos_test.gd',
               'res://tests/verge/verge_sim_test.gd', 'res://tests/dhelv/dhelv_sim_test.gd',
               'res://tests/dhelv/dhelv_nav_test.gd']


# A build that reads another build's output builds after it: kits/ancients-interiors loads kits/interiors'
# dist/interiors-core.js in node (in CI that file is an LFS pointer until kits/interiors writes it).
BUILD_FIRST = ['kits/interiors']


def builds():
    out = []
    for top in TOPS:
        for d in sorted(glob.glob(os.path.join(ROOT, top, '*', 'build.py'))):
            out.append(os.path.relpath(os.path.dirname(d), ROOT).replace(os.sep, '/'))
    return [b for b in BUILD_FIRST if b in out] + [b for b in out if b not in BUILD_FIRST]


def extra_builds():
    """Pages a build writes only when asked: the Throne's stations (build.py --station <name>) and Girder's hero
    page (build_hero.py). The baseline hashes them, so they are rebuilt too."""
    out = []
    for st in sorted(glob.glob(os.path.join(ROOT, 'biomes', 'throne', 'stations', '*', 'station.json'))):
        name = os.path.basename(os.path.dirname(st))
        out.append(('build biomes/throne --station ' + name, [PY, 'build.py', '--station', name], 'biomes/throne'))
    if os.path.isfile(os.path.join(ROOT, 'settlements', 'girder', 'build_hero.py')):
        out.append(('build settlements/girder hero', [PY, 'build_hero.py'], 'settlements/girder'))
    return out


def node():
    return shutil.which('node') or next(iter(sorted(glob.glob('/opt/node*/bin/node'), reverse=True)), None)


def node_tests():
    tests = sorted(glob.glob(os.path.join(ROOT, 'core', '**', 'test-*.js'), recursive=True))
    tests += sorted(glob.glob(os.path.join(ROOT, 'settlements', '*', 'tests', 'test-*.js')))
    tests += sorted(glob.glob(os.path.join(ROOT, 'kits', '*', 'tests', 'test-*.js')))
    return [os.path.relpath(t, ROOT) for t in tests]


def steps(nightly, build):
    s = [('port lint (every build and core)', [PY, 'tools/check_port.py']),
         ('insulation (core never names host/)', [PY, 'tools/check_insulation.py']),
         ('build.py open() names its encoding', [PY, 'tools/check_encoding.py']),
         ('godot vendored core in step', [PY, 'godot/tools/sync_core.py', '--check']),
         ('core/rand GDScript transliteration', [PY, 'core/rand/test_rand.py'])]
    n = node()
    for t in node_tests():
        s.append(('node ' + t, [n, t] if n else None))
    if build:
        for b in builds():
            s.append(('build ' + b, [PY, 'build.py'], b))
        s += extra_builds()
        s.append(('hash baseline (PORT-BASELINE.json)', [PY, 'tools/port_baseline.py']))
    if nightly:
        pw = importlib.util.find_spec('playwright') is not None
        s.append(('furniture fingerprint', [PY, 'core/furnish/fingerprint.py'] if pw else None))
        for b, page, args in NIGHTLY_VERIFY:
            ok = pw and os.path.isfile(os.path.join(ROOT, b, 'verify.py'))
            s.append(('verify ' + b, [PY, 'verify.py', page] + args if ok else None, b))
        g = os.environ.get('GODOT') or shutil.which('godot')
        for t in GODOT_TESTS:
            s.append(('godot ' + t, [g, '--headless', '--path', 'godot', '--script', t] if g else None))
    return s


def main(argv):
    nightly, build = '--nightly' in argv, '--no-build' not in argv
    plan = steps(nightly, build)
    if '--list' in argv:
        for st in plan:
            print(st[0])
        return 0
    fails, t0 = [], time.time()
    for st in plan:
        name, cmd = st[0], st[1]
        cwd = os.path.join(ROOT, st[2]) if len(st) > 2 else ROOT
        if cmd is None:
            print('SKIP  %s (tool missing)' % name, flush=True)
            continue
        t = time.time()
        r = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                           encoding='utf-8', errors='replace', timeout=1800)
        ok = r.returncode == 0
        print('%s  %s  (%.1fs)' % ('PASS' if ok else 'FAIL', name, time.time() - t), flush=True)
        if not ok:
            fails.append(name)
            print('\n'.join('      ' + ln for ln in r.stdout.splitlines()[-25:]), flush=True)
    print('\n%d steps, %d failed, %.0fs' % (len(plan), len(fails), time.time() - t0))
    for f in fails:
        print('  failed: ' + f)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
