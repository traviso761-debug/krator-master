#!/usr/bin/env python3
"""The cloud GPU lanes (tools/cloud_lane.py, tools/CLOUD-LANE.md) end to end on this machine: a throwaway repo with an
LFS page, a "machine" that is a folder here, and an SSH that runs the remote command locally. A verify routed to vast0
sees the working tree's bytes (an uncommitted page), gets the LFS files it needs and only those (another page in its
folder is not sent; one it read and the machine lacked is sent and the run repeated), launches with the cloud lane's
ANGLE flags, streams its output, sends its shots back and is cached; auto takes a cloud lane when arc and rtx are held;
a machine that does not answer fails a named lane with exit 3 and drops out of auto; the runner stops a job when the
connection closes; `lanes` lists the cloud lanes. The real lanes, cache, config and machine are never touched.

    python3 tools/tests/test_cloud_lane.py
"""
import json, os, shutil, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = sys.executable
TMP = tempfile.mkdtemp(prefix='krator-cloud-test-')
REPO, WS, STATE = os.path.join(TMP, 'repo'), os.path.join(TMP, 'machine'), os.path.join(TMP, 'state')
CFG = os.path.join(TMP, 'cloud.json')
ENV = dict(os.environ, KRATOR_GPU_LOCK=os.path.join(STATE, 'arc.lock'), KRATOR_GPU_LOCK_RTX=os.path.join(STATE, 'rtx.lock'),
           KRATOR_GPU_LOCK_POLL='0.2', KRATOR_VERIFY_CACHE_DIR=os.path.join(TMP, 'cache'), KRATOR_CLOUD_CONFIG=CFG,
           KRATOR_CLOUD_STATE=STATE, KRATOR_LANE_RUN_AS='0', KRATOR_GL='gpu', PYTHONIOENCODING='utf-8',
           GIT_AUTHOR_NAME='t', GIT_AUTHOR_EMAIL='t@t', GIT_COMMITTER_NAME='t', GIT_COMMITTER_EMAIL='t@t')
for k in ('KRATOR_GPU_LOCK_HELD', 'KRATOR_GPU_LANE_HELD', 'KRATOR_GPU_LANE', 'KRATOR_VERIFY_CHILD', 'KRATOR_VERIFY_TOUCHED', 'KRATOR_VERIFY_WRAP'):
    ENV.pop(k, None)
os.environ.clear()
os.environ.update(ENV)
fails = []

FAKE_SSH = '''import shlex, subprocess, sys
sys.exit(subprocess.call(shlex.split(sys.argv[-1])))
'''
# The verify: reads its page and a shared texture outside its build (both LFS), says where it ran, writes a shot.
VERIFY = '''import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools'))
import harness
page = sys.argv[1]
tex = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'tex.html')
for f in (page, tex):
    harness._touched(f)
lane = os.environ.get('KRATOR_GPU_LANE_HELD', '-')
harness._touched({'lane': lane, 'renderer': 'fake NVIDIA'})
body = open(page, encoding='utf-8').read().strip()
print('page says: ' + body, flush=True)
print('lane %s args %s' % (lane, ' '.join(harness.lane_args(harness.GPU_ARGS))), flush=True)
os.makedirs('shots', exist_ok=True)
open(os.path.join('shots', 'view.txt'), 'w').write('shot of ' + body)
if os.environ.get('FAKE_SLEEP'):
    import time
    open(os.environ['FAKE_SLEEP'], 'w').write(str(os.getpid()))
    for i in range(300):
        print(i, flush=True); time.sleep(1)
if harness.is_lfs_pointer(tex):
    print('tex is a pointer', flush=True)
    sys.exit(1)
sys.exit(0)
'''


def check(name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + (': ' + detail[-1500:] if detail and not ok else ''), flush=True)
    if not ok:
        fails.append(name)


def git(*a, cwd=REPO):
    return subprocess.run(['git'] + list(a), cwd=cwd, env=ENV, capture_output=True, text=True, check=True).stdout.strip()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def config(**kw):
    c = {'on': True, 'ssh': [PY, os.path.join(TMP, 'fake_ssh.py')], 'git_remote': os.path.join(WS, 'krator.git'),
         'workspace': WS.replace(os.sep, '/'), 'python': PY, 'lanes': ['vast0', 'vast1'], 'instance': 'test'}
    c.update(kw)
    write(CFG, json.dumps(c))
    for f in os.listdir(STATE) if os.path.isdir(STATE) else []:   # the cached reachability answers
        if f.startswith('krator-cloud-status'):
            os.remove(os.path.join(STATE, f))


def setup():
    write(os.path.join(TMP, 'fake_ssh.py'), FAKE_SSH)
    os.makedirs(REPO)
    git('init', '-q', '-b', 'main')
    git('lfs', 'install', '--local')
    write(os.path.join(REPO, '.gitattributes'), '*.html filter=lfs diff=lfs merge=lfs -text\n')
    os.makedirs(os.path.join(REPO, 'tools'))
    for f in ('harness.py', 'cloud_lane.py'):
        shutil.copy(os.path.join(ROOT, 'tools', f), os.path.join(REPO, 'tools', f))
    write(os.path.join(REPO, 'build', 'verify.py'), VERIFY)
    write(os.path.join(REPO, 'build', 'page.html'), '<html>committed</html>\n')
    write(os.path.join(REPO, 'build', 'other.html'), '<html>another page</html>\n')
    write(os.path.join(REPO, 'assets', 'tex.html'), '<html>a texture</html>\n')
    write(os.path.join(REPO, '.gitignore'), 'shots/\n__pycache__/\n')
    git('add', '-A')
    git('commit', '-q', '-m', 'test repo')
    write(os.path.join(REPO, 'build', 'page.html'), '<html>edited, not committed</html>\n')
    subprocess.run(['git', 'init', '-q', '--bare', os.path.join(WS, 'krator.git')], env=ENV, capture_output=True, check=True)
    for d in ('objects', 'tmp'):
        os.makedirs(os.path.join(WS, 'krator.git', 'lfs', d))
    os.makedirs(STATE)
    config()


def verify(*args, lane='vast0', extra=None):
    env = dict(ENV, **(extra or {}))
    if lane:
        env['KRATOR_GPU_LANE'] = lane
    try:
        r = subprocess.run([PY, 'verify.py', 'page.html'] + list(args), cwd=os.path.join(REPO, 'build'), env=env, capture_output=True,
                           text=True, encoding='utf-8', timeout=float(os.environ.get('TEST_TIMEOUT') or 300))
    except subprocess.TimeoutExpired as e:
        return 'timeout', '%s%s\n(timed out)' % (e.stdout or '', e.stderr or '')
    return r.returncode, r.stdout + r.stderr


def store_has(text):
    import hashlib
    o = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return os.path.isfile(os.path.join(WS, 'krator.git', 'lfs', 'objects', o[:2], o[2:4], o))


def test_routed():
    c, o = verify('--assert')
    check('a verify on vast0 runs on the machine and passes', c == 0 and 'on the vast0 lane (the cloud machine)' in o, o)
    check('it sees the uncommitted page', 'page says: <html>edited, not committed</html>' in o, o)
    check("it launches with the cloud lane's ANGLE flags", '--use-gl=angle --use-angle=gl-egl' in o and 'd3d11' not in o.split('lane vast0 args')[-1].splitlines()[0], o)
    check('the page went up, the other page in its folder did not', store_has('<html>edited, not committed</html>\n')
          and not store_has('<html>another page</html>\n'), o)
    check('a file it read that the machine lacked is sent and the run repeated', 'running again' in o and store_has('<html>a texture</html>\n'), o)
    shot = os.path.join(REPO, 'build', 'shots', 'view.txt')
    check('its shots come back', os.path.isfile(shot) and open(shot, encoding='utf-8').read() == 'shot of <html>edited, not committed</html>', o)
    ent = [json.load(open(os.path.join(ENV['KRATOR_VERIFY_CACHE_DIR'], f), encoding='utf-8')) for f in os.listdir(ENV['KRATOR_VERIFY_CACHE_DIR'])
           if f.endswith('.json') and f != 'cloud-needs.json']
    check('the pass is cached here, lane vast0', len(ent) == 1 and ent[0]['lane'] == 'vast0' and 'build/page.html' in ent[0]['files']
          and 'assets/tex.html' in ent[0]['files'], str(ent))
    c, o = verify('--assert')
    check('the same bytes again: a cached pass', c == 0 and 'cached pass' in o and 'lane vast0' in o and 'page says' not in o, o)
    c, o = verify('--assert', '--no-cache')
    check('--no-cache reruns; the learned texture goes up front, no repeat', c == 0 and 'page says' in o and 'running again' not in o
          and 'sent' not in o, o)
    check('the session index and branch are untouched', git('status', '--porcelain') == 'M build/page.html' and git('rev-parse', '--abbrev-ref', 'HEAD') == 'main',
          git('status', '--porcelain'))


def test_auto_and_down():
    hold = []
    for k in ('KRATOR_GPU_LOCK', 'KRATOR_GPU_LOCK_RTX'):
        os.makedirs(ENV[k])
        write(os.path.join(ENV[k], 'owner'), 'bash: a test holder\n')
        hold.append(ENV[k])
    c, o = verify('--assert', '--no-cache', lane=None)
    check('auto takes a cloud lane while arc and rtx are held', c == 0 and 'the cloud machine' in o, o)
    for h in hold:
        shutil.rmtree(h)
    config(ssh=[PY, '-c', 'import sys; sys.stderr.write("ssh: connect to host: Connection refused\\n"); sys.exit(255)'])
    c, o = verify('--assert', '--no-cache')
    check('a machine that does not answer fails a named lane at once, exit 3', c == 3 and 'does not answer' in o and 'Connection refused' in o, o)
    c, o = verify('--assert', '--no-cache', lane=None)
    check('and drops out of auto: a local lane runs it', c == 0 and 'the cloud machine' not in o and ('lane arc' in o or 'lane rtx' in o), o)
    r = subprocess.run([PY, os.path.join(REPO, 'tools', 'harness.py'), 'lanes'], env=ENV, capture_output=True, text=True, encoding='utf-8')
    check('lanes lists the cloud lanes and says the machine is down', 'vast0' in r.stdout and 'vast1' in r.stdout and 'DOES NOT ANSWER' in r.stdout, r.stdout)
    config(on=False)
    r = subprocess.run([PY, os.path.join(REPO, 'tools', 'harness.py'), 'lanes'], env=ENV, capture_output=True, text=True, encoding='utf-8')
    check('switched off, lanes shows arc and rtx only', 'vast0' not in r.stdout.replace('cloud lanes: off', '') and 'cloud lanes: off' in r.stdout, r.stdout)
    config()


def test_two_machines():
    """The machines shape: each machine names its lanes; one that does not answer drops only its own."""
    good = {'on': True, 'ssh': [PY, os.path.join(TMP, 'fake_ssh.py')], 'git_remote': os.path.join(WS, 'krator.git'),
            'workspace': WS.replace(os.sep, '/'), 'python': PY, 'lanes': ['vast0', 'vast1']}
    dead = {'on': True, 'ssh': [PY, '-c', 'import sys; sys.stderr.write("ssh: connect to host: Connection refused\\n"); sys.exit(255)'],
            'workspace': '/workspace', 'python': PY, 'lanes': ['vast2', 'vast3']}
    write(CFG, json.dumps({'lanes': ['vast0', 'vast1', 'vast2', 'vast3'], 'machines': {'A': good, 'B': dead}}))
    for f in os.listdir(STATE):
        if f.startswith('krator-cloud-status'):
            os.remove(os.path.join(STATE, f))
    c, o = verify('--assert', '--no-cache', lane='vast2')
    check("a named lane on the machine that does not answer fails at once, exit 3", c == 3 and 'machine B does not answer' in o, o)
    c, o = verify('--assert', '--no-cache', lane='vast1')
    check('a lane on the other machine still runs', c == 0 and 'on the vast1 lane (the cloud machine)' in o, o)
    r = subprocess.run([PY, os.path.join(REPO, 'tools', 'harness.py'), 'lanes'], env=ENV, capture_output=True, text=True, encoding='utf-8')
    check('lanes lists both machines, B down and A answering', 'machine B DOES NOT ANSWER' in r.stdout and 'machine A answers' in r.stdout
          and 'vast3' in r.stdout, r.stdout)
    r = subprocess.run([PY, os.path.join(REPO, 'tools', 'harness.py'), 'cloud', 'off', '--machine', 'B'], env=ENV, capture_output=True, text=True)
    saved = json.load(open(CFG, encoding='utf-8'))
    check('cloud off --machine B switches off B alone, and the top-level lanes list follows', saved['lanes'] == ['vast0', 'vast1']
          and saved['machines']['B']['on'] is False and saved['machines']['A']['on'] is True, json.dumps(saved))
    r = subprocess.run([PY, os.path.join(REPO, 'tools', 'harness.py'), 'cloud', 'on', '--machine', 'C', '--host', 'h', '--port', '1',
                        '--key', 'k', '--lanes', 'vast1,vast9'], env=ENV, capture_output=True, text=True)
    check('a lane cannot belong to two machines', r.returncode == 2 and "vast1 is machine A's" in r.stdout, r.stdout)
    config()


def test_connection_closed():
    sys.path.insert(0, os.path.join(REPO, 'tools'))
    import cloud_lane
    cfg = cloud_lane.load_config()
    pidf = os.path.join(TMP, 'remote.pid')
    env = dict(ENV, FAKE_SLEEP=pidf)
    argv, src = cloud_lane.remote_argv(cloud_lane.machine_of('vast0'), 'run', 'vast0', 0, 'build', 'build/verify.py', 25, '--', 'page.html')
    p = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
    p.stdin.write(src)
    p.stdin.flush()
    t0 = time.time()
    while not os.path.isfile(pidf) and time.time() - t0 < 60:
        time.sleep(0.2)
    time.sleep(1)
    child = int(open(pidf).read())
    p.stdin.close()
    try:
        code = p.wait(30)
    except subprocess.TimeoutExpired:
        p.kill()
        code = None
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import harness
    t0 = time.time()
    while harness.pid_alive(child) and time.time() - t0 < 20:
        time.sleep(0.5)
    check('the runner stops the job when the connection closes', code == 130 and not harness.pid_alive(child), 'code %s, child alive %s' % (code, harness.pid_alive(child)))


if __name__ == '__main__':
    if subprocess.run(['git', 'lfs', 'version'], capture_output=True).returncode:
        print('SKIP: git-lfs is not installed')
        sys.exit(0)
    try:
        setup()
        for t in (test_routed, test_auto_and_down, test_two_machines, test_connection_closed):
            t()
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
    print('\n%d failed' % len(fails) if fails else '\nOK')
    sys.exit(1 if fails else 0)
