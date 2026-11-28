#!/usr/bin/env python3
"""tools/test_all.py keeps going (BUGS-2026-11-15.md T4, T5 and the skip-smudge SyntaxError): a step that times out, cannot
start or prints what the console cannot encode is a FAIL line and the run goes on; --help, --list, --from and an unknown
argument do not run the suite; a node failure on an LFS pointer names the file and the pull; a test whose own dist/ bundle
is not committed is found. Each rule has its negative control. No step of the real suite runs.

    python3 tools/tests/test_test_all.py
"""
import io, os, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import test_all, lfs_needs  # noqa: E402

PY = sys.executable
POINTER = 'version https://git-lfs.github.com/spec/v1\noid sha256:%s\nsize 1234\n' % ('ab' * 32)
checks = []


def ok(name, cond):
    checks.append((name, bool(cond)))


def run_main(argv, plan, enc='cp1252'):
    """test_all.main on a stand-in plan, its stdout a console of `enc`; (exit code, what it printed, the exception)."""
    raw = io.BytesIO()
    con = io.TextIOWrapper(raw, encoding=enc, errors='strict', newline='\n')
    old_out, old_steps = sys.stdout, test_all.steps
    sys.stdout = con
    test_all.steps = lambda nightly, build: plan
    err, code = None, None
    try:
        code = test_all.main(argv)
    except BaseException as e:   # noqa: B902: the point is that nothing escapes
        err = e
    finally:
        try:
            con.flush()
        except Exception:
            pass
        sys.stdout, test_all.steps = old_out, old_steps
    return code, raw.getvalue().decode(enc, 'replace'), err


HAWAII = 'print("Kaʻū hamlet: ʻōhiʻa"); raise SystemExit(1)'
PLAN = [('prints Hawaiian and fails', [PY, '-c', HAWAII]),
        ('sleeps past its limit', [PY, '-c', 'import time; print("started", flush=True); time.sleep(30)']),
        ('cannot start', [os.path.join(ROOT, 'no-such-interpreter.exe'), '-c', '1']),
        ('passes', [PY, '-c', 'print("fine")'])]


def main():
    # the bug the fixture stands on: a cp1252 console cannot take the Hawaiian okina
    try:
        'ʻ'.encode('cp1252')
        raw_fails = False
    except UnicodeEncodeError:
        raw_fails = True
    ok('negative control: cp1252 cannot encode the okina (what killed the run)', raw_fails)

    # T4: every step reports, the run reaches its end
    code, out, err = run_main(['--no-build', '--timeout', '3'], PLAN)
    ok('a run with a timeout, a step that cannot start and unencodable output ends with no exception', err is None)
    ok('...and every step has its line', all(('FAIL  ' + n) in out for n in [p[0] for p in PLAN[:3]]) and 'PASS  passes' in out)
    ok('...the timeout says so', 'timed out after 3s' in out)
    ok('...the step that cannot start says so', 'could not run' in out)
    ok('...exit 1, and the summary counts 3 failed', code == 1 and '4 steps, 3 failed' in out)
    ok('...and says where to resume', '--from 1' in out)
    ok_, _, note = test_all.run_step([PY, '-c', 'import os; os._exit(3)'], ROOT, 30)
    ok('a step that dies with no output says it may not have started', not ok_ and 'exited 3 with no output' in note)
    ok_, _, note = test_all.run_step([PY, '-c', 'print("3 != 4"); raise SystemExit(1)'], ROOT, 30)
    ok('negative control: a step that fails with output gets no such note', not ok_ and note == '')
    code, out, err = run_main(['--no-build'], [PLAN[3]])
    ok('negative control: a plan of passing steps exits 0', err is None and code == 0 and '1 steps, 0 failed' in out)

    # --help, --list, an unknown argument: nothing runs
    boom = [('must not run', [PY, '-c', 'raise SystemExit(7)'])]
    code, out, err = run_main(['--help'], boom)
    ok('--help prints the docstring and runs nothing', code == 0 and '--from' in out and 'must not run' not in out)
    code, out, err = run_main(['--list'], PLAN)
    ok('--list numbers the steps', code == 0 and '  1  prints Hawaiian' in out and '  4  passes' in out and 'PASS' not in out)
    code, out, err = run_main(['--no-bild'], boom)
    ok('an unknown argument exits 2 and runs nothing', code == 2 and 'unknown argument' in out and 'must not run' not in out)

    # --from
    code, out, err = run_main(['--from', '4'], PLAN)
    ok('--from 4 runs only the fourth step', code == 0 and 'PASS  passes' in out and 'Hawaiian' not in out.split('resuming')[-1].split('\n', 1)[1])
    code, out, err = run_main(['--from', 'PASSES'], PLAN)
    ok('--from <text> finds the step by name, any case', code == 0 and 'resuming at step 4' in out)
    code, out, err = run_main(['--from', '9'], PLAN)
    ok('negative control: --from past the end is an error, not a silent empty run', isinstance(err, SystemExit) and 'there are 4 steps' in str(err))
    code, out, err = run_main(['--from', 'nothing like it'], PLAN)
    ok('negative control: --from naming no step is an error', isinstance(err, SystemExit) and 'names no step' in str(err))

    # a pointer read as code: the file and the pull are named
    tmp = tempfile.mkdtemp(prefix='_test_all_', dir=os.path.join(ROOT, 'tools', 'tests'))
    try:
        dist = os.path.join(tmp, 'dist')
        os.makedirs(dist)
        ptr = os.path.join(dist, 'bundle.js')
        with open(ptr, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(POINTER)
        real = os.path.join(dist, 'real.js')
        with open(real, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write('module.exports = 1;\n')
        node_out = '%s:1\nversion https://git-lfs.github.com/spec/v1\n        ^^^^^\n\nSyntaxError: Unexpected identifier \'https\'' % ptr
        rel = os.path.relpath(ptr, ROOT).replace(os.sep, '/')
        note = test_all.pointer_note(node_out, 'x/tests/test-x.js')
        ok('a SyntaxError on a pointer names the file and the pull', rel in note and 'git lfs pull --include="%s"' % rel in note)
        ok('negative control: a real file named in a failure is not called a pointer',
           test_all.pointer_note('%s:3\nTypeError: x is not a function' % real) == '')
        ok("a bare 'https' SyntaxError with no file still says pointer and names lfs_needs",
           'lfs_needs.py --test x/tests/test-x.js' in test_all.pointer_note("SyntaxError: Unexpected identifier 'https'", 'x/tests/test-x.js'))
        ok('negative control: an ordinary failure has no pointer note', test_all.pointer_note('AssertionError: 3 != 4') == '')

        # T5: the test's own bundle not committed
        tests = os.path.join(tmp, 'tests')
        os.makedirs(tests)
        t = os.path.join(tests, 'test-x.js')
        with open(t, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write("const path = require('path');\nrequire(path.join(__dirname, '..', 'dist', 'zz-never-built-%s.js'));\n"
                     "require('../dist/real.js');\n" % os.path.basename(tmp))
        trel = os.path.relpath(t, ROOT).replace(os.sep, '/')
        miss = lfs_needs.test_missing(trel)
        ok('a test whose own dist/ bundle is not committed: that bundle is named', len(miss) == 1 and miss[0].endswith('/dist/zz-never-built-%s.js' % os.path.basename(tmp)))
        with open(os.path.join(dist, 'zz-never-built-%s.js' % os.path.basename(tmp)), 'w', encoding='utf-8') as fh:
            fh.write('1;\n')
        ok('negative control: once it is there, nothing is missing', lfs_needs.test_missing(trel) == [])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    bad = 0
    for name, good in checks:
        bad += not good
        print('%s  %s' % ('ok  ' if good else 'FAIL', name))
    print('%d checks, %d wrong' % (len(checks), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
