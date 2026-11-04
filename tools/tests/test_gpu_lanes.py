#!/usr/bin/env python3
"""The GPU lanes, the queue, the stall watchdog and the verify cache (tools/harness.py), on locks in a temp folder (the
real lanes are never touched): waiters take a lane first come first served; a dead waiter's ticket and a reused PID's are
dropped; a lock a live non-harness holder took is never taken and a dead harness's is; auto takes the free lane; a job
that stops writing is killed with its children, its lock released, exit 124, while one that keeps printing runs on; a
passing --assert verify is skipped on the same bytes and rerun when a byte, the arguments or --no-cache change, and a
failing one is never cached. tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_gpu_lanes.py
"""
import json, os, shutil, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = sys.executable
TMP = tempfile.mkdtemp(prefix='krator-lanes-test-')
ENV = dict(os.environ, KRATOR_GPU_LOCK=os.path.join(TMP, 'arc.lock'), KRATOR_GPU_LOCK_RTX=os.path.join(TMP, 'rtx.lock'),
           KRATOR_GPU_LOCK_POLL='0.2', KRATOR_VERIFY_CACHE_DIR=os.path.join(TMP, 'cache'), PYTHONIOENCODING='utf-8')
for k in ('KRATOR_GPU_LOCK_HELD', 'KRATOR_GPU_LANE_HELD', 'KRATOR_GPU_LANE', 'KRATOR_GL', 'KRATOR_VERIFY_CHILD', 'KRATOR_VERIFY_TOUCHED'):
    ENV.pop(k, None)
os.environ.clear()
os.environ.update(ENV)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness  # noqa: E402

HARNESS = os.path.join(ROOT, 'tools', 'harness.py')
fails = []


def check(name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + (': ' + detail if detail and not ok else ''))
    if not ok:
        fails.append(name)


def hold(lane, owner):
    os.mkdir(harness.LANES[lane])
    with open(os.path.join(harness.LANES[lane], 'owner'), 'w', encoding='utf-8') as fh:
        fh.write(owner + '\n')


def free(lane):
    shutil.rmtree(harness.LANES[lane], ignore_errors=True)


def dead_pid():
    p = subprocess.Popen([PY, '-c', 'pass'])
    p.wait()
    return p.pid


def test_queue_order():
    log = os.path.join(TMP, 'order.log')
    hold('arc', 'bash: a test holder')
    procs = []
    for name in 'ABC':
        procs.append(subprocess.Popen([PY, HARNESS, 'lock', '--lane', 'arc', '--stall', '0', '--', PY, '-c',
                                       'open(%r, "a").write("%s\\n")' % (log, name)], env=ENV, stdout=subprocess.DEVNULL))
        t0 = time.time()
        while len(harness.lane_queue('arc')) < len(procs) and time.time() - t0 < 20:
            time.sleep(0.1)
    check('three waiters queue', len(harness.lane_queue('arc')) == 3, str(harness.lane_queue('arc')))
    free('arc')
    for p in procs:
        p.wait(60)
    with open(log, encoding='utf-8') as fh:
        got = fh.read().split()
    check('first come, first served', got == ['A', 'B', 'C'], str(got))
    check('the lock and the tickets are gone', not os.path.isdir(harness.LANES['arc']) and not harness.lane_queue('arc'))


def test_stale_tickets():
    q = harness.LANES['arc'] + '.queue'
    os.makedirs(q, exist_ok=True)
    dp = dead_pid()
    with open(os.path.join(q, '%020d-%d.ticket' % (1, dp)), 'w', encoding='utf-8') as fh:
        json.dump({'pid': dp, 'start': 0}, fh)
    with open(os.path.join(q, '%020d-%d.ticket' % (2, os.getpid())), 'w', encoding='utf-8') as fh:
        json.dump({'pid': os.getpid(), 'start': 1.0}, fh)    # this PID, another start time: a reused PID
    if sys.platform != 'win32':
        os.remove(os.path.join(q, '%020d-%d.ticket' % (2, os.getpid())))   # start times are read on Windows only
    t0 = time.time()
    with harness.gpu_lock(timeout=10, what='stale test', lane='arc') as got:
        check('a dead and a reused waiter are passed over', got == 'arc' and time.time() - t0 < 5, '%s in %.1f s' % (got, time.time() - t0))
    check('their tickets are removed', not [n for n in os.listdir(q) if n.endswith('.ticket')], str(os.listdir(q)))


def test_holders():
    hold('arc', 'bash: an old-style client')
    try:
        with harness.gpu_lock(timeout=1, lane='arc'):
            check('a lock a live unknown holder took is never taken', False)
    except harness.GpuLockTimeout:
        check('a lock a live unknown holder took is never taken', True)
    with harness.gpu_lock(timeout=5, lane='auto') as got:
        check('auto takes the free lane', got == 'rtx', got)
        check('the held lane is in the environment', os.environ.get('KRATOR_GPU_LANE_HELD') == 'rtx')
        check('a launch on rtx asks for the RTX', '--force_high_performance_gpu' in harness.lane_args(harness.GPU_ARGS))
        check('a SwiftShader launch is left alone', harness.lane_args(harness.SWIFTSHADER_ARGS) == harness.SWIFTSHADER_ARGS)
    free('arc')
    hold('arc', 'harness pid=%d 2026-11-03T00:00:00 lane=arc a dead one' % dead_pid())
    with harness.gpu_lock(timeout=5, lane='arc') as got:
        check("a dead harness's lock is taken over", got == 'arc')
    check('the lock is released on the way out', not os.path.isdir(harness.LANES['arc']))
    check('timing runs stay on arc', harness.pick_lane() == 'auto' and harness.timing_run(['perf_views.py'])
          and harness.timing_run(['verify.py', '--timing']))


def test_watchdog():
    pidf = os.path.join(TMP, 'grandchild.pid')
    job = ('import subprocess, sys, time; p = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(120)"]); '
           'open(%r, "w").write(str(p.pid)); print("started", flush=True); time.sleep(120)' % pidf)
    t0 = time.time()
    r = subprocess.run([PY, HARNESS, 'lock', '--lane', 'rtx', '--stall', '0.05', '--', PY, '-c', job], env=ENV,
                       capture_output=True, text=True, encoding='utf-8', timeout=90)
    with open(pidf) as fh:
        gc = int(fh.read())
    check('a job that stops writing is stopped', r.returncode == 124 and 'STALLED' in r.stdout, '%s %s' % (r.returncode, r.stdout[-300:]))
    check('within the stall window', time.time() - t0 < 30, '%.0f s' % (time.time() - t0))
    time.sleep(1)
    check('its children are killed too', not harness.pid_alive(gc))
    check('its lock is released', not os.path.isdir(harness.LANES['rtx']))
    job = 'import time\nfor i in range(8):\n    print(i, flush=True); time.sleep(1)'
    r = subprocess.run([PY, HARNESS, 'lock', '--lane', 'rtx', '--stall', '0.05', '--', PY, '-c', job], env=ENV,
                       capture_output=True, text=True, encoding='utf-8', timeout=90)
    check('a job that keeps printing runs on', r.returncode == 0, '%s %s' % (r.returncode, r.stdout[-300:]))
    out = os.path.join(TMP, 'shots')
    os.makedirs(out, exist_ok=True)
    job = 'import time, os\nfor i in range(8):\n    open(os.path.join(%r, "s%%d.png" %% i), "w").write("x"); time.sleep(1)' % out
    r = subprocess.run([PY, HARNESS, 'lock', '--lane', 'rtx', '--stall', '0.05', '--', PY, '-c', job, '--out', out], env=ENV,
                       capture_output=True, text=True, encoding='utf-8', timeout=90)
    check('a job that writes files in --out runs on', r.returncode == 0, '%s %s' % (r.returncode, r.stdout[-300:]))


FAKE = '''import os, sys
sys.path.insert(0, %r)
import harness
page = sys.argv[1]
harness._touched(page)
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "runs.log"), "a") as fh:
    fh.write("run\\n")
print("ran", flush=True)
if os.environ.get("FAKE_SLEEP"):
    open(os.environ["FAKE_SLEEP"], "w").write(str(os.getpid()))
    import time
    for i in range(120):
        print(i, flush=True); time.sleep(1)
sys.exit(int(os.environ.get("FAKE_CODE", "0")))
'''


def test_cache():
    b = os.path.join(TMP, 'build')
    os.makedirs(b)
    with open(os.path.join(b, 'verify.py'), 'w', encoding='utf-8') as fh:
        fh.write(FAKE % os.path.join(ROOT, 'tools'))
    page = os.path.join(b, 'page.html')
    with open(page, 'w', encoding='utf-8') as fh:
        fh.write('<html>one</html>')

    def run(*args, code='0'):
        r = subprocess.run([PY, 'verify.py'] + list(args), cwd=b, env=dict(ENV, FAKE_CODE=code), capture_output=True,
                           text=True, encoding='utf-8')
        return r.returncode, r.stdout

    c1, o1 = run('page.html', '--assert')
    c2, o2 = run('page.html', '--assert')
    check('a pass runs, then is cached', c1 == 0 and 'ran' in o1 and c2 == 0 and 'cached pass' in o2 and 'ran' not in o2, o1 + o2)
    c, o = run('page.html', '--assert', '--no-cache')
    check('--no-cache reruns (and the verify never sees it)', c == 0 and 'ran' in o, o)
    c, o = run('page.html', '--assert', '--views', 'x')
    check('other arguments rerun', 'ran' in o, o)
    c, o = run('page.html')
    check('a run without --assert is not cached', 'ran' in o, o)
    with open(page, 'w', encoding='utf-8') as fh:
        fh.write('<html>two</html>')
    c, o = run('page.html', '--assert')
    check('a changed page reruns', 'ran' in o, o)
    with open(page, 'w', encoding='utf-8') as fh:
        fh.write('<html>three</html>')
    c1, o1 = run('page.html', '--assert', code='1')
    c2, o2 = run('page.html', '--assert', code='1')
    check('a failure is never cached', c1 == 1 and c2 == 1 and 'ran' in o2, o1 + o2)
    files = [os.path.join(b, 'verify.py'), page]
    k1 = harness.cache_hash(ROOT, files, ['page.html', '--assert'])
    check('the key is stable', k1 == harness.cache_hash(ROOT, files, ['page.html', '--assert']))
    check('the key moves with the arguments', k1 != harness.cache_hash(ROOT, files, ['page.html', '--assert', '--all-views']))
    check('a missing file is no key', harness.cache_hash(ROOT, files + [os.path.join(b, 'gone.js')], []) is None)
    e = json.load(open(next(os.path.join(ENV['KRATOR_VERIFY_CACHE_DIR'], f) for f in os.listdir(ENV['KRATOR_VERIFY_CACHE_DIR'])), encoding='utf-8'))
    pidf = os.path.join(TMP, 'child.pid')
    w = subprocess.Popen([PY, 'verify.py', 'page.html', '--assert'], cwd=b, env=dict(ENV, FAKE_SLEEP=pidf), stdout=subprocess.DEVNULL)
    t0 = time.time()
    while not os.path.isfile(pidf) and time.time() - t0 < 20:
        time.sleep(0.2)
    time.sleep(0.5)
    with open(pidf) as fh:
        child = int(fh.read())
    subprocess.run(['taskkill', '/F', '/PID', str(w.pid)] if sys.platform == 'win32' else ['kill', '-9', str(w.pid)], capture_output=True)
    t0 = time.time()
    while harness.pid_alive(child) and time.time() - t0 < 20:
        time.sleep(0.5)
    check('a verify whose wrapper is stopped stops too', not harness.pid_alive(child))
    check('a pass names its lane', e.get('lane') == 'swiftshader' and page.replace(os.sep, '/') in [f.replace(os.sep, '/') for f in e['files']], str(e))


if __name__ == '__main__':
    try:
        for t in (test_queue_order, test_stale_tickets, test_holders, test_watchdog, test_cache):
            t()
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
    print('\n%d failed' % len(fails) if fails else '\nOK')
    sys.exit(1 if fails else 0)
