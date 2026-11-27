#!/usr/bin/env python3
"""tools/verify_all.py, the Stage 8 verify driver, without a browser: its page list (every page port_baseline.py knows
and every target tools/build.py --all skips, each with a verify or a reason), the arguments each page takes (the biome
rule, the overrides, the documented gates, the main tier), the known list against the pages, the reading of a run's log,
and a run of fake jobs through the real loop (a stall rerun once, a resume that reruns nothing finished). Pages may be
LFS pointers: nothing here reads a page's content. tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_verify_all.py
"""
import argparse, fnmatch, json, os, shutil, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TMP = tempfile.mkdtemp(prefix='krator-test-verify-all-')
os.environ['KRATOR_VERIFY_ALL_DIR'] = TMP   # the durations file and runs go here, not to the owner's
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import port_baseline  # noqa: E402
import verify_all as VA  # noqa: E402

fails = []


def check(name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + (': ' + str(detail)[:600] if detail and not ok else ''))
    if not ok:
        fails.append(name)


cfg = VA.load_config()
inv = VA.inventory(cfg)
by_page = {r['page']: r for r in inv}
skips = [k for k in cfg['skip'] if k != 'what']

# 1. every page port_baseline.py lists is in the list, with a verify or a reason
pages = port_baseline.pages()
missing = [p for p in pages if p not in by_page]
check('every port_baseline page is listed', not missing, missing[:5])
noverify = [p for p in pages if p in by_page and not by_page[p]['script'] and not any(fnmatch.fnmatch(p, s) for s in skips)]
check('every listed page has a verify.py or check.py above it, or a skip with why', not noverify, noverify[:8])

# 2. the targets --all skips: each one listed (a page, a check.py job, or a no-page row)
for t in cfg['extra_targets']['targets']:
    d = t['dir']
    rows = [r for r in inv if r['page'] == d + '/' or r['page'].startswith(d + '/') or (t.get('page') and r['page'] == d + '/' + t['page'])]
    check('skipped target listed: ' + d, bool(rows))
check('14 targets --all skips (A-runbook step 21, C15)', len(cfg['extra_targets']['targets']) == 14, len(cfg['extra_targets']['targets']))
for d in ('core/host/example', 'core/host/underground', 'core/simulation/example'):
    r = by_page.get(d + '/check.py')
    check('a check.py folder is one check job: ' + d, r is not None and r['kind'] == 'check', r)
r = by_page.get('kits/post-apoc/sockets-example/sockets-example.html')
check("the socket sheet takes kits/post-apoc's verify", r is not None and r['script'] == 'kits/post-apoc/verify.py', r)

# 3. the plan with every page: arguments
a = argparse.Namespace(only=[], all=True, tier='auto', since='HEAD', limit=0)
jobs = VA.plan(cfg, a)
runj = [j for j in jobs if not j.get('status')]
byj = {j['page']: j for j in runj}
check('the plan holds over 400 jobs', len(runj) > 400, len(runj))
bad = [j['page'] for j in runj if j['kind'] == 'verify' and '--assert' not in j['args']]
check('every verify job runs --assert', not bad, bad[:5])
bad = [j['page'] for j in runj if j['page'].startswith('biomes/') and j['kind'] == 'verify' and '--all-views' not in j['args']]
check('every biome and station page runs --all-views (step 29)', not bad, bad[:5])
e = byj.get('settlements/xanadu/dist/erewhon.html')
check('Erewhon runs --interiors', e is not None and '--interiors' in e['args'], e and e['args'])
s = byj.get('kits/interiors/dist/interiors-sets.html')
check('the interiors sets page runs --sets', s is not None and '--sets' in s['args'], s and s['args'])
bad = [j['page'] for j in runj if any(x in ('--out', '--shots', '--no-cache') for x in j['args'])]
check('no job carries its own --out or --no-cache (the driver gives them)', not bad, bad[:5])
bad = [j['page'] for j in runj if any(x.split('=')[0] in VA.NARROW for x in j['args'])]
check('no job narrows its page (--page, --only, --query ...)', not bad, bad[:5])
ests = [j['est'] for j in runj]
check('longest first', ests == sorted(ests, reverse=True))
v = byj.get('settlements/voth/dist/voth-city.html')
check('Voth city is first (about 40 min)', runj[0]['page'] == 'settlements/voth/dist/voth-city.html', runj[0]['page'])

# 4. the documented gate: optional parts and comments dropped, the most views, narrowing commands left out
flags = {'--views': True, '--out': True, '--all-views': False, '--assert': False, '--query': True, '--seeds': True}
check('brackets and comments dropped', VA.parse_args_text(' --assert [--views "A|B"] [--out shots]   # the gate', flags) == ['--assert'])
check('a value flag keeps its value', VA.parse_args_text(' --assert --views "Overview,The Market" --out shots', flags)
      == ['--assert', '--views', 'Overview,The Market', '--out', 'shots'])
cmds = [('x/README.md:1', 'x/dist/p.html', ['--assert']),
        ('x/README.md:2', 'x/dist/p.html', ['--assert', '--views', 'A,B,C', '--out', 'shots']),
        ('x/README.md:3', 'x/dist/p.html', ['--assert', '--query', 'set=a', '--views', 'A,B,C,D']),
        ('x/KNOWN_ISSUES.md:4', 'x/dist/p.html', ['--assert', '--all-views']),
        ('x/README.md:5', 'x/dist/q.html', ['--assert', '--all-views'])]
args, src = VA.gate(cmds, 'x/dist/p.html', flags)
check('the gate: most views, no narrowing, --out dropped, README before KNOWN_ISSUES', args == ['--assert', '--views', 'A,B,C'] and src == 'x/README.md:2',
      (args, src))
check('the gate: KNOWN_ISSUES.md when nothing else says', VA.gate(cmds[3:4], 'x/dist/p.html', flags)[0] == ['--assert', '--all-views'])
check('the gate: none for a page no command names', VA.gate(cmds, 'x/dist/r.html', flags) == (None, None))

# 5. the main tier: the view flags out, the checks kept
check('main tier drops --all-views', VA.main_args(['--assert', '--all-views'], cfg, {}) == ['--assert'])
check('main tier drops --views and its value', VA.main_args(['--assert', '--views', 'A,B', '--size', '960x600'], cfg, flags)
      == ['--assert', '--size', '960x600'])
check('main tier keeps --sets', VA.main_args(['--sets', '--assert', '--seeds', '2'], cfg, flags) == ['--sets', '--assert', '--seeds', '2'])
row = {'page': 'biomes/rift/dist/rift.html', 'build': 'biomes/rift'}
check('auto tier with no proven item is full', VA.tier_for(row, 'auto', 'HEAD', cfg)[0] == 'full')
cfg2 = json.loads(json.dumps(cfg))
cfg2['no_look']['items'] = [{'path': 'core/biome/30-core-foliage.js', 'proof': 'test'}]
real = VA.changed_inputs
try:
    VA.changed_inputs = lambda r, s: ['core/biome/30-core-foliage.js']
    check('auto tier: only a proven no-look input moved -> main', VA.tier_for(row, 'auto', 'HEAD', cfg2)[0] == 'main')
    VA.changed_inputs = lambda r, s: ['core/biome/30-core-foliage.js', 'biomes/rift/src/50-x.js']
    check('auto tier: another input moved too -> full', VA.tier_for(row, 'auto', 'HEAD', cfg2)[0] == 'full')
    VA.changed_inputs = lambda r, s: None
    check('auto tier: no manifest -> full', VA.tier_for(row, 'auto', 'HEAD', cfg2)[0] == 'full')
    VA.changed_inputs = lambda r, s: []
    check('auto tier: moved with no input moved -> full', VA.tier_for(row, 'auto', 'HEAD', cfg2)[0] == 'full')
finally:
    VA.changed_inputs = real
for it in cfg['no_look']['items']:
    check('a no-look item names its proof: ' + it.get('path', '?'), bool(it.get('proof')))

# 6. the known list: D30's eighteen rows, every page entry reaching a listed page
ids = [k['id'] for k in cfg['known']['list']]
check("D30's rows are all there", all('D30-%d' % i in ids for i in range(1, 19)), ids)
for k in cfg['known']['list']:
    if k.get('page_verify') is False:
        continue
    hit = [p for p in by_page if any(fnmatch.fnmatch(p, g) for g in k['pages'])]
    check('known %s reaches a listed page' % k['id'], bool(hit), k['pages'])

# 7. reading a run's log
R = 'harness: renderer ANGLE (NVIDIA RTX 5060); lane rtx; KRATOR_GL=gpu\n'
P = 'settlements/voth/dist/voth-city.html'
cases = [
    ('pass', R + '...\nOK\n', 0, 'pass'),
    ('cached', 'harness: cached pass: settlements/voth/verify.py dist/voth-city.html --assert passed 2026-11-20T10:00:00 on the same bytes (lane rtx, NVIDIA); nothing rerun', 0, 'cached'),
    ('stale', R + 'OK, but a STALE PASS: x was built before its sources moved', 0, 'stale'),
    ('no renderer line on the GPU', 'OK\n', 0, 'no-renderer'),
    ('stalled', R + 'harness: STALLED: no output', 124, 'stalled'),
    ('crashed', R + 'harness: THE PAGE CRASHED (the renderer died)', 75, 'crashed'),
    ('lane timeout', 'FAILED: GPU lock (auto) still not free after 28800 s', 3, 'lane-timeout'),
    ('known: every item on the list', R + 'FAIL: embassies: Dalab, Yuni\n\nFAILED: embassies: Dalab, Yuni; terrace flights: Arena canton', 1, 'known'),
    ('fail: one item not on the list', R + '\nFAILED: embassies: Dalab; universal shader-errors', 1, 'fail'),
    ('fail: no FAILED line', R + 'Traceback ...', 1, 'fail'),
]
for name, text, code, want in cases:
    got = VA.classify(text, code, P, cfg, gpu=True)
    check('classify %s' % name, got['status'] == want, got)
got = VA.classify(R + '\nFAILED: embassies: Dalab; universal shader-errors', 1, P, cfg, gpu=True)
check('a fail names its unmatched item and the known one', got['unmatched'] == ['universal shader-errors'] and got['known'] == ['D30-1'], got)
got = VA.classify(R + '\nFAILED: universal instance-cap', 1, 'settlements/dalab/dist/dalab.html', cfg, gpu=True)
check('a universal assert on the list is known (Dalab instance-cap)', got['status'] == 'known' and got['known'] == ['D30-4'], got)
SOCK = 'kits/post-apoc/sockets-example/sockets-example.html'
txt = (R + 'PASS front-door-designated - 10 buildings\nFAIL front-door-not-default - on the default (+z edge centre): sock-demo\n'
       '  PASS  page-errors : none\nFAILED: kit checks (error panel, page errors or an assert)\n')
got = VA.classify(txt, 1, SOCK, cfg, gpu=True)
check('a generic FAILED summary yields to the FAIL line it sums up (sockets-example, HR-5)', got['status'] == 'known' and got['known'] == ['HR-5'], got)
got = VA.classify(txt.replace('FAILED: kit', '  FAIL  shader-errors : 2 programs\nFAILED: universal shader-errors; kit'), 1, SOCK, cfg, gpu=True)
check('... and a universal FAIL line beside it is its own item', got['status'] == 'fail' and got['unmatched'] == ['shader-errors : 2 programs'], got)
got = VA.classify(R + 'Error: kv-node: x.js is missing or an LFS pointer (git lfs pull)\nFAILED', 1, P, cfg, gpu=True)
check('a run that read an LFS pointer is a pointer, not a failure', got['status'] == 'pointer', got)
got = VA.classify(R + '  PASS  lfs : the page is not an LFS pointer\nFAILED: embassies: Dalab', 1, P, cfg, gpu=True)
check('... but not for a PASS line that says pointer', got['status'] == 'known', got)
iso = 'openworld/isle-demo/dist/isle-demo.html'
check('a software-only known failure is not known on the GPU', VA.classify(R + 'FAILED: page-errors', 1, iso, cfg, gpu=True)['status'] == 'fail')
check('... and is on software GL', VA.classify('FAILED: page-errors', 1, iso, cfg, gpu=False)['status'] == 'known')
check('no code: OK read as a pass', VA.classify(R + 'OK\n', None, P, cfg)['status'] == 'pass')
check('no code: nothing to read is unknown', VA.classify(R + 'loading...', None, P, cfg)['status'] == 'unknown')
check('a check.py needs no renderer line', VA.classify('all passed\n', 0, 'core/host/example/check.py', cfg, kind='check')['status'] == 'pass')

# 8. a run of fake jobs through the real loop: a pass, a check, a stall rerun once, a failure; then a resume reruns nothing
fake = os.path.join(TMP, 'fake')
os.makedirs(os.path.join(fake, 'dist'))
with open(os.path.join(fake, 'dist', 'p.html'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('<html></html>')
with open(os.path.join(fake, 'verify.py'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write("import sys, os\n"
             "print('harness: renderer FAKE GPU; lane arc; KRATOR_GL=' + os.environ.get('KRATOR_GL', ''))\n"
             "print('stall=' + os.environ.get('KRATOR_GPU_STALL_MIN', '-'))\n"
             "mode = sys.argv[sys.argv.index('--mode') + 1]\n"
             "cnt = os.path.join(os.path.dirname(os.path.abspath(__file__)), mode + '.count')\n"
             "n = int(open(cnt).read()) + 1 if os.path.exists(cnt) else 1\n"
             "open(cnt, 'w').write(str(n))\n"
             "if mode == 'ok': print('OK'); sys.exit(0)\n"
             "if mode == 'stall': print('harness: STALLED'); sys.exit(124)\n"
             "print('FAILED: something new'); sys.exit(1)\n")
with open(os.path.join(fake, 'check.py'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write("print('all passed')\n")
page = os.path.join(fake, 'dist', 'p.html').replace(os.sep, '/')


def job(i, mode, kind='verify'):
    return {'id': i, 'page': page if kind == 'verify' else fake.replace(os.sep, '/') + '/check.py', 'build': fake, 'vdir': fake,
            'script': fake + '/' + ('verify.py' if kind == 'verify' else 'check.py'), 'kind': kind, 'note': '', 'state': 'new',
            'page_arg': 'dist/p.html', 'args': ['--assert', '--mode', mode] if kind == 'verify' else [], 'full_args': [], 'why': 'test',
            'tier': 'full', 'tier_why': '', 'est': 10 - i, 'est_src': 'test', 'out_flag': None}


fjobs = [job(0, 'ok'), job(1, 'stall'), job(2, 'fail'), job(3, '', 'check')]
fjobs[0]['stall_min'] = 45   # verify_all.json "stall": the page's own watchdog reaches its job
meta = {'created': 'now', 'head': 'test', 'gpu': True, 'tier': 'auto', 'since': 'HEAD', 'select': 'test', 'lanes': ['arc'], 'workers': 1}
run = VA.Run(os.path.join(TMP, 'runs', 'r1'))
run.save_plan(meta, fjobs)
na = argparse.Namespace(lane='', retry_failed=False, no_retry=False, no_cache=False, workers=1)
VA.execute(run, meta, fjobs, na, cfg)
res = {r['id']: r for r in VA.results(run, fjobs)}
check('fake run: the pass', res[0]['status'] == 'pass', res[0].get('status'))
with open(res[0]['log'], encoding='utf-8') as fh:
    lg = fh.read()
check("a page's stall limit is its job's KRATOR_GPU_STALL_MIN", 'stall=45' in lg and 'stall=-' not in lg, lg[-300:])
cfgs = json.loads(json.dumps(cfg))
cfgs['stall']['pages'] = {'openworld/pinnacle/*': 60}
pj = [j for j in VA.plan(cfgs, argparse.Namespace(only=['openworld/pinnacle/'], all=True, tier='full', since='HEAD', limit=0)) if not j.get('status')]
check('verify_all.json "stall" reaches the plan by glob', pj and all(j['stall_min'] == 60 for j in pj), [(j['page'], j.get('stall_min')) for j in pj])
check('fake run: the stall rerun once, then left stalled', res[1]['status'] == 'stalled' and res[1]['attempts'] == 2, (res[1].get('status'), res[1].get('attempts')))
check('fake run: the failure, its item read', res[2]['status'] == 'fail' and res[2].get('items') == ['something new'], res[2])
check('fake run: the check.py', res[3]['status'] == 'pass', res[3].get('status'))
def counts(m):
    with open(os.path.join(fake, m + '.count'), encoding='utf-8') as fh:
        return int(fh.read())



before = (counts('ok'), counts('stall'), counts('fail'))
VA.execute(run, meta, fjobs, na, cfg)
check('resume: nothing finished is rerun', (counts('ok'), counts('stall'), counts('fail')) == before, ((counts('ok'), counts('stall'), counts('fail')), before))
na.retry_failed = True
VA.execute(run, meta, fjobs, na, cfg)
check('resume --retry-failed: the failure and the stall rerun, the pass not', (counts('ok'), counts('fail')) == (before[0], before[2] + 1)
      and counts('stall') > before[1], ((counts('ok'), counts('stall'), counts('fail')), before))
path, cn = VA.write_report(run, meta, fjobs, cfg)
txt = open(path, encoding='utf-8').read()
check('the report: counts and the D30 table', '## Failures' in txt and "Against the owner's list" in txt and cn.get('pass') == 2, cn)
check('the report: results.tsv and report.json beside it', os.path.isfile(os.path.join(run.dir, 'results.tsv')) and os.path.isfile(os.path.join(run.dir, 'report.json')))

shutil.rmtree(TMP, ignore_errors=True)
print('\n%d failed' % len(fails) if fails else '\nall passed')
sys.exit(1 if fails else 0)
