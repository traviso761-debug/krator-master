#!/usr/bin/env python3
"""Every check the repo has, in one run (ROADMAP.md, stage 0a). CI runs this; so can anyone, from anywhere.

    python3 tools/test_all.py              # the push checks: lints, node tests, rebuild everything, hash baseline
    python3 tools/test_all.py --nightly    # also: the furniture fingerprint, verify.py --assert on the critical
                                           # builds, the Godot headless tests, the shot compare on the must-pass
                                           # cases (each skipped, and said so, when its tool is missing: playwright,
                                           # godot, numpy and Pillow)
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
    # the first Voth (voth.html) is retired (owner, 2026-10-14; archive/voth-first); Voth is settlements/voth's voth-city, whose
    # verify --assert runs simulated days (about 40 min alone) and so waits for a short mode before it joins the nightly list
    ('settlements/verge', 'dist/verge.html', ['--assert']),
    ('settlements/yuni', 'yuni.html', ['--assert']),   # its export profile (registry, fixtures, interiors) since 2026-10-18
]
GODOT_TESTS = ['res://tests/rand/krand_test.gd', 'res://tests/tags/ktags_test.gd',
               'res://tests/mask/kmask_test.gd', 'res://tests/atmos/atmos_test.gd',
               'res://tests/verge/verge_sim_test.gd', 'res://tests/dhelv/dhelv_sim_test.gd', 'res://tests/isle/isle_books_test.gd', 'res://tests/export/isle_test.gd', ('res://tests/export/isle_test.gd', '--case=world-isle-valapo', '--town=valapo'),
               'res://tests/dhelv/dhelv_nav_test.gd', 'res://tests/terrain/kfield_test.gd',
               'res://tests/terrain/field_import_test.gd', 'res://tests/tags/records_test.gd',
               'res://tests/export/world_test.gd', 'res://tests/export/iziz_test.gd', 'res://tests/export/yuni_test.gd', 'res://tests/export/yuni_interiors_test.gd', 'res://tests/water/water_test.gd',
               'res://tests/water/falls_case_test.gd',
               'res://tests/shaders/library_test.gd', 'res://tests/anim/anim_test.gd', 'res://tests/motion/motion_test.gd',
               # a test and its arguments (after Godot's --): Pylon's sheet on Iziz's page, through the city test (core/export/README.md)
               ('res://tests/export/iziz_test.gd', '--case=world-pylon', '--sheet'),
               ('res://tests/export/iziz_test.gd', '--case=world-talia', '--sheet'),
               # the Eternian kit's sheet (records, materials, ground: the Scyvoi engine's profile; kits/eternian P7)
               'res://tests/export/eternian_test.gd']
# The must-pass cases compare_shots.py scores in the nightly (M4, M5). COMPARE_ASSERT False: the step prints the table and
# passes whatever the scores (the owner reads the first numbers); True: a pair under compare_shots.py's threshold fails the nightly.
COMPARE_CASES = ['world-sedesert', 'world-iziz']
COMPARE_ASSERT = False
# The export size compare (tools/export_report.py --compare godot/data/export-report.json): its output ends with the list
# of what grew past EXPORT_TOLERANCE percent (bytes, instances, triangles, materials, textures, draws), new or vanished
# cases and sections fallen from ok. EXPORT_ASSERT False: a report, printed in full and never a failure (the owner reads
# the list, the last thing in the log); True: that list being non-empty fails the nightly (export_report.py --assert).
EXPORT_TOLERANCE = 10
EXPORT_ASSERT = False


# A build that reads another build's output builds after it: kits/ancients-interiors loads kits/interiors'
# dist/interiors-core.js in node (in CI that file is an LFS pointer until kits/interiors writes it).
BUILD_FIRST = ['kits/interiors']
# A node test that reads a build's output runs after the builds (in CI its input is an LFS pointer until the build
# writes it); with --no-build it runs with the other node tests, on the committed output.
NODE_AFTER_BUILD = ['settlements/isle-demo/tests/test-isle-city.js', 'settlements/isle-demo/tests/test-isle-sim.js',
                    'settlements/isle-demo/tests/test-isle-week.js', 'settlements/isle-demo/tests/test-isle-export.js']   # dist/isle-city.plan.js


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
    tests += [os.path.join(ROOT, 'tools', 'walk_audit', 'test_audit.js')]   # the geometry walk audit (tools/walk_audit/README.md)
    return [os.path.relpath(t, ROOT) for t in tests]


def steps(nightly, build):
    s = [('port lint (every build and core)', [PY, 'tools/check_port.py']),
         ('insulation (core never names host/)', [PY, 'tools/check_insulation.py']),
         ('build.py open() names its encoding', [PY, 'tools/check_encoding.py']),
         ('Voth census tables (every build with a *_TRADES)', [PY, 'tools/check_trades.py', '--all']),
         ('godot vendored core in step', [PY, 'godot/tools/sync_core.py', '--check']),
         ('core/rand GDScript transliteration', [PY, 'core/rand/test_rand.py'])]
    for t in sorted(glob.glob(os.path.join(ROOT, 'tools', 'tests', 'test_*.py'))):
        s.append(('tools ' + os.path.relpath(t, ROOT).replace(os.sep, '/'), [PY, t]))
    n = node()
    late = [t for t in node_tests() if build and t.replace(os.sep, '/') in NODE_AFTER_BUILD]
    for t in node_tests():
        if t not in late:
            s.append(('node ' + t, [n, t] if n else None))
    if build:
        for b in builds():
            s.append(('build ' + b, [PY, 'build.py'], b))
        s += extra_builds()
        for t in late:
            s.append(('node ' + t, [n, t] if n else None))
        s.append(('hash baseline (PORT-BASELINE.json)', [PY, 'tools/port_baseline.py']))
    if nightly:
        pw = importlib.util.find_spec('playwright') is not None
        s.append(('furniture fingerprint', [PY, 'core/furnish/fingerprint.py'] if pw else None))
        for b, page, args in NIGHTLY_VERIFY:
            ok = pw and os.path.isfile(os.path.join(ROOT, b, 'verify.py'))
            s.append(('verify ' + b, [PY, 'verify.py', page] + args if ok else None, b))
        # the scripted walk (ROADMAP.md stage 0j): real keys held for 20 frames from open ground; the walker must
        # cover 2 m forward, stay up, and leave the console clean
        s.append(('walk settlements/girder', [PY, 'tools/harness.py', 'walk', 'settlements/girder/girder.html', '--route', 'KeyW:20f',
                                               '--start', 'auto', '--min', '2', '--dir', '0,-1'] if pw else None))
        # the size of each exported case against godot/data/export-report.json, ending with the flagged-growth list; a
        # report until EXPORT_ASSERT is True (a refreshed baseline is simply the new reference)
        if os.path.isfile(os.path.join(ROOT, 'godot', 'data', 'export-report.json')):
            cmd = [PY, 'tools/export_report.py', '--compare', 'godot/data/export-report.json', '--tolerance', str(EXPORT_TOLERANCE)]
            s.append(('export sizes (assert, tools/export_report.py)', cmd + ['--assert']) if EXPORT_ASSERT
                     else ('report: export sizes (tools/export_report.py)', cmd))
        else:
            s.append(('report: export sizes (tools/export_report.py)', [PY, 'tools/export_report.py']))
        g = os.environ.get('GODOT') or shutil.which('godot')
        for t in GODOT_TESTS:
            t, targs = (t[0], list(t[1:])) if isinstance(t, tuple) else (t, [])
            s.append(('godot ' + ' '.join([t] + targs), [g, '--headless', '--path', 'godot', '--script', t] + (['--'] + targs if targs else []) if g else None))
        # the perf capture (ROADMAP.md section 11, item 4; godot/README.md "The perf capture") smoked headless: it must run and
        # write its files into shots/perf (gitignored); its numbers mean nothing here and are never checked
        s.append(('godot perf capture (headless smoke)', [g, '--headless', '--path', 'godot', '--script', 'res://tests/perf/perf_capture.gd', '--',
                                                           '--cases=world-sedesert,world-iziz', '--frames=10', '--out=res://shots/perf'] if g else None))
        # the perceptual compare (ROADMAP.md stage 4, section 11 item 4): the page and the spike shot from one camera on the
        # must-pass cases, scored by SSIM (godot/README.md "Scoring the pairs"). A report until COMPARE_ASSERT is True.
        img = pw and g and importlib.util.find_spec('numpy') is not None and importlib.util.find_spec('PIL') is not None
        s.append(('compare shots ' + ('(assert)' if COMPARE_ASSERT else '(report)'),
                  [PY, 'godot/tools/compare_shots.py'] + COMPARE_CASES + ['--assert' if COMPARE_ASSERT else '--report'] if img else None))
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
        if name.startswith('report:'):    # a report prints and never fails the run
            print('REPORT  %s  (%.1fs)' % (name[8:], time.time() - t), flush=True)
            for ln in r.stdout.splitlines():
                print('      ' + ln, flush=True)
            continue
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
