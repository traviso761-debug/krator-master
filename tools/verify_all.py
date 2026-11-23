#!/usr/bin/env python3
"""The Stage 8 verify driver (STAGE-8/PLAN.md D5 and step 29; PERF-PLAN.md section 4): every built page, its
`verify.py --assert` command, run through tools/harness.py's GPU lanes, longest first, with one report of pass, fail and
known-fail against the owner's list (D30, STAGE-8/PLAN.md section 5).

    python tools/verify_all.py --dry-run                   # the plan: the pages that differ from PORT-BASELINE.json, each command
    python tools/verify_all.py --dry-run --all             # every page, changed or not
    python tools/verify_all.py --dry-run --all biomes/rift kits/crops   # only pages whose path holds one of these
    python tools/verify_all.py --all --workers 1 kits/crops   # run them (KRATOR_GL=gpu; one headless Chrome at a time)
    python tools/verify_all.py --resume                    # carry on the last run after a crash or a stop
    python tools/verify_all.py --resume --retry-failed     # and rerun what failed, stalled or crashed
    python tools/verify_all.py --report [RUN]              # write the report again from a run's state
    python tools/verify_all.py --detach ...                # the same, detached (a session restart does not kill it)

Where the list comes from:
  - the pages: tools/port_baseline.py's pages() (every dist/*.html, the Voth lineage's pages beside build.py, the socket
    sheet), plus the targets tools/build.py --all skips (tools/verify_all.json "extra_targets": A-runbook step 21, C15);
  - each page's verify: the nearest verify.py above it inside its build (a check.py where a folder has only that);
  - each page's arguments, the first that says: tools/verify_all.json "pages" (an override with its why), its "rules"
    (biome and station pages --all-views), the build's README.md and verify.py docstring (the documented gate: a
    `verify.py <this page> --assert ...` line, the one with the most views, optional [..] parts and --out dropped),
    then KNOWN_ISSUES.md, else plain --assert. --dry-run prints which one each page took.

Tiering (D5; PERF-PLAN 4 item 5): --tier full runs every page's full command; --tier main drops the view flags
(verify_all.json "main_tier_drops": --all-views, --views, --interiors, --rooms): the page's main view and every check;
--tier auto (the default) gives a page the main tier only when every input its build manifest says changed since --since
(default HEAD: <build>/build-inputs.json's inputs for the command that wrote the page, then and now) is a proven no-look
item (verify_all.json "no_look", each with its proof). A page that is new, has no manifest, or moved with no input moved
takes the full tier.

Running: KRATOR_GL=gpu (--software for SwiftShader), the lane `auto` unless --lane; each job is `python verify.py ...` in
its build folder, so the harness's own wrapper takes the lane's lock (arc, rtx, and the cloud lanes when
`harness.py cloud status` says a machine is on), queues first come first served, runs the 25-minute stall watchdog and the
verify cache ("cached pass": skipped on the same bytes; --no-cache reruns). --workers defaults to the lanes there are;
waiters hold no browser. A stalled (124) or crashed (75) run is rerun once. This driver never starts, stops or prewarms a
cloud machine: that is the owner's priced yes; when a run used a cloud lane its report says to tell the owner the queue is
empty (the machine bills by the hour; stop it, never destroy it). check.py folders (core/host/example ...) run in software
GL: they take no lane.

A run lives in %LOCALAPPDATA%/krator-verify-all/runs/<name>/ (KRATOR_VERIFY_ALL_DIR moves it): plan.json (frozen at the
start), state.jsonl (an event per start and end, appended), logs/, shots/, report.md, report.json, results.tsv.
--resume reads plan.json and state.jsonl: a job that ended is not rerun; one started by a driver that died is waited on
while its process lives, then read from its log; LFS pointer pages are looked at again (pull them, then resume).

Statuses: pass, cached (a cached pass), known (failed only on items the known list carries), fail, stale (STALE PASS:
the page is older than its sources; does not count), no-renderer (passed without the harness's renderer line on the
GPU; does not count), stalled, crashed, lane-timeout, pointer (the page is an LFS pointer: `tools/lfs_needs.py <build>
--pages --pull`), not-built (`tools/build.py <build>` first), no-verify, skipped.
"""
import argparse, concurrent.futures, fnmatch, functools, glob, json, os, re, shlex, subprocess, sys, threading, time

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
sys.path.insert(0, TOOLS)
import buildlib, port_baseline  # noqa: E402

CONFIG = os.path.join(TOOLS, 'verify_all.json')
HOME = os.environ.get('KRATOR_VERIFY_ALL_DIR') or os.path.join(os.environ.get('LOCALAPPDATA') or os.path.join(os.path.expanduser('~'), '.cache'),
                                                              'krator-verify-all')
DURATIONS = os.path.join(HOME, 'durations.json')
TOPS = ('settlements', 'kits', 'biomes', 'openworld')
FINAL = ('pass', 'cached', 'known', 'fail', 'stale', 'no-renderer', 'lane-timeout', 'no-verify', 'skipped')
COUNTS = ('pass', 'cached')   # what counts as verified on these bytes
RETRY_ONCE = ('stalled', 'crashed')
RETRY_FAILED = ('fail', 'stalled', 'crashed', 'lane-timeout', 'no-renderer', 'unknown')
# a flag that takes a value, for a verify whose argparse this file cannot read
VALUE_FLAGS = {'--views', '--out', '--shots', '--outdir', '--size', '--query', '--seeds', '--page', '--only', '--cam', '--cam-name',
               '--eval', '--culture', '--state', '--sheet', '--scenes', '--profile', '--baseline', '--save-baseline', '--hour', '--station',
               '--export', '--marks', '--shot', '--settle', '--wait', '--eval-out', '--ui-baseline'}
# a documented command with one of these looks at part of a page, or at something else: never the gate
NARROW = {'--page', '--only', '--query', '--culture', '--cam', '--cam-name', '--eval', '--state', '--list', '--rows', '--anim', '--march',
          '--dump', '--save-baseline', '--baseline', '--hash', '--export', '--marks', '--shot', '--shot-eval', '--eval-out', '--hour'}
DROP = {'--out': 1, '--shots': 1, '--outdir': 1, '--no-cache': 0}   # the driver gives its own


def load_config(path=CONFIG):
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def rel(p):
    return os.path.relpath(os.path.abspath(p), ROOT).replace(os.sep, '/')


# ----------------------------------------------------------------------------------------------------------------------
# The verify scripts and what they take

_SCRIPTS = None
_FLAGS = {}
_DOCS = {}


def verify_scripts():
    """Every verify script in the repo (repo-relative), the delegates the folder ones hand their page to included."""
    global _SCRIPTS
    if _SCRIPTS is None:
        out = []
        for top in TOPS + ('core', 'tools'):
            for f in glob.glob(os.path.join(ROOT, top, '**', '*verify*.py'), recursive=True):
                r = rel(f)
                if '/archive/' not in '/' + r and '/tests/' not in r and '/shots/' not in r:
                    out.append(r)
        _SCRIPTS = sorted(out)
    return _SCRIPTS


def _read(path):
    try:
        with open(os.path.join(ROOT, path), encoding='utf-8', errors='replace') as fh:
            return fh.read()
    except OSError:
        return ''


def _argparse_flags(text):
    """{flag: takes_value} from a script's add_argument calls."""
    out = {}
    calls = [m for m in re.finditer(r"add_argument\(\s*(['\"])(-[\w-]+)\1(?:\s*,\s*(['\"])(--[\w-]+)\3)?", text)]
    for i, m in enumerate(calls):
        end = calls[i + 1].start() if i + 1 < len(calls) else min(len(text), m.end() + 400)
        body = text[m.end():min(end, m.end() + 400)]
        boolean = re.search(r"action\s*=\s*['\"](store_true|store_false|count|store_const)['\"]", body) is not None
        for flag in (m.group(2), m.group(4)):
            if flag and flag.startswith('--'):
                out[flag] = not boolean
    for flag in re.findall(r"['\"](--[a-z][\w-]+)['\"]\s+(?:not\s+)?in\s+(?:sys\.)?argv", text):
        out.setdefault(flag, flag in VALUE_FLAGS)
    return out


def script_flags(script):
    """{flag: takes_value} a verify script takes: its own argparse, and that of a verify it hands its page to (runpy or an
    import: Pylon's settlements/iziz/verify.py, Gihon's settlements/xanadu/verify.py, the kits' sheet_verify.py)."""
    if script in _FLAGS:
        return _FLAGS[script]
    _FLAGS[script] = {}
    text = _read(script)
    flags = _argparse_flags(text)
    lits = set(re.findall(r"['\"]([\w.-]+)['\"]", text)) | set(re.findall(r"^\s*import\s+([\w]+)", text, re.M))
    for other in verify_scripts():
        if other == script:
            continue
        d, stem = os.path.basename(os.path.dirname(other)), os.path.splitext(os.path.basename(other))[0]
        named = (stem != 'verify' and stem in lits) or (stem == 'verify' and d in lits and ('verify.py' in lits or 'verify' in lits))
        if named:
            for k, v in script_flags(other).items():
                flags.setdefault(k, v)
    _FLAGS[script] = flags
    return flags


def takes_value(flag, flags):
    return flags.get(flag, flag in VALUE_FLAGS)


CMD = re.compile(r"verify\.py\s+((?:[\w./-]+/)?[\w.-]+\.html)([^`\n]*)")


def _strip_optional(s):
    while True:
        t = re.sub(r"\[[^\[\]]*\]", " ", s)
        if t == s:
            return s
        s = t


def parse_args_text(s, flags):
    """The arguments of a documented command's tail (after the page): optional [..] parts and comments dropped, stopping
    at the first word that is neither a flag nor a flag's value. None when the text does not split."""
    s = _strip_optional(s)
    s = re.split(r"\s#|\s\(|\\$", s)[0]
    try:
        toks = shlex.split(s)
    except ValueError:
        return None
    out, i = [], 0
    while i < len(toks):
        t = toks[i]
        if not t.startswith('--'):
            break
        if '=' in t:
            out.append(t)
        elif takes_value(t, flags) and i + 1 < len(toks) and not toks[i + 1].startswith('--'):
            out += [t, toks[i + 1]]
            i += 1
        else:
            out.append(t)
        i += 1
    return out


def docstring(text):
    m = re.match(r"(?:#![^\n]*\n)?(?:\s*#[^\n]*\n)*\s*[rRuU]?(\"\"\"|''')(.*?)\1", text, re.S)
    return m.group(2) if m else ''


def doc_commands(vdir, script):
    """[(source, page repo path, args)] of every `verify.py <page> ...` line in the folder's verify.py docstring,
    README.md and KNOWN_ISSUES.md (source 'file:line')."""
    key = (vdir, script)
    if key in _DOCS:
        return _DOCS[key]
    flags = script_flags(script) if script else {}
    out = []
    for name in (os.path.basename(script) if script else 'verify.py', 'README.md', 'KNOWN_ISSUES.md'):
        path = vdir + '/' + name
        text = _read(path)
        if name.endswith('.py'):
            body = docstring(text)
            off = text.find(body) if body else 0
            text, base = body, text[:off].count('\n')
        else:
            base = 0
        for m in CMD.finditer(text):
            p = m.group(1)
            page = os.path.normpath(vdir + '/' + p).replace(os.sep, '/')   # beside the verify, else repo-relative
            if not os.path.exists(os.path.join(ROOT, page)) and os.path.exists(os.path.join(ROOT, p)):
                page = os.path.normpath(p).replace(os.sep, '/')
            args = parse_args_text(m.group(2), flags)
            if page and args is not None:
                out.append(('%s:%d' % (path, base + text[:m.start()].count('\n') + 1), page, args))
    _DOCS[key] = out
    return out


def n_views(args):
    if '--all-views' in args:
        return 99
    if '--views' in args and args.index('--views') + 1 < len(args):
        return len([v for v in re.split(r"[|;,]", args[args.index('--views') + 1]) if v.strip()])
    return 0


def clean_args(args, flags):
    """The documented arguments without the ones the driver gives itself (--out and its value, --no-cache)."""
    out, i = [], 0
    while i < len(args):
        a = args[i]
        k = a.split('=', 1)[0]
        if k in DROP:
            i += 1 + (DROP[k] if '=' not in a else 0)
            continue
        out.append(a)
        i += 1
    return out


def gate(cmds, page, flags):
    """The documented gate for `page` among `cmds`: with --assert, nothing narrowing; the most views, then the fewest
    other flags, then the first written. README and verify.py first, KNOWN_ISSUES.md only when they say nothing."""
    best = None
    for tier in (('README.md', '.py'), ('KNOWN_ISSUES.md',)):
        cands = []
        for i, (src, p, args) in enumerate(cmds):
            if p != page or not src.split(':')[0].endswith(tier):
                continue
            a = clean_args(args, flags)
            keys = {x.split('=', 1)[0] for x in a}
            if '--assert' not in keys or keys & NARROW:
                continue
            extra = len([x for x in a if x.startswith('--') and x not in ('--assert', '--views', '--all-views')])
            cands.append(((-n_views(a), extra, i), src, a))
        if cands:
            best = min(cands)
            break
    return (best[2], best[1]) if best else (None, None)


# ----------------------------------------------------------------------------------------------------------------------
# The pages

def _globbed(path, pats):
    return next((p for p in pats if fnmatch.fnmatch(path, p)), None)


def find_verify(page, stop):
    """The nearest folder above `page` that holds a verify.py (else a check.py), not above `stop`."""
    d = os.path.dirname(page)
    while True:
        for s, kind in (('verify.py', 'verify'), ('check.py', 'check')):
            if os.path.isfile(os.path.join(ROOT, d, s)):
                return d, d + '/' + s, kind
        if d == stop or '/' not in d:
            return None, None, None
        d = os.path.dirname(d)


def extra_pages(t):
    """The pages of one of the targets --all skips: `page` if named, else dist/*.html, else the *.html beside its build
    (not the fragments 00-head.html ...)."""
    d = t['dir']
    if t.get('list_pages') is False:
        return []
    if t.get('page'):
        return [d + '/' + t['page']]
    out = [rel(f) for f in sorted(glob.glob(os.path.join(ROOT, d, 'dist', '*.html')))]
    if not out:
        out = [rel(f) for f in sorted(glob.glob(os.path.join(ROOT, d, '*.html'))) if not re.match(r"\d", os.path.basename(f))]
    if not out:   # not built here: the pages its manifest recorded, else the ones its verify's docs name
        man = buildlib.load_manifest(d) or {}
        out = sorted({o for run in man.get('runs', {}).values() for o in run.get('outputs', {}) if o.endswith('.html')})
    if not out and os.path.isfile(os.path.join(ROOT, d, 'verify.py')):
        out = sorted({p for _, p, _ in doc_commands(d, d + '/verify.py') if p.startswith(d + '/')})
    return out


def inventory(cfg):
    """[{page, build, vdir, script, kind, note}]: every page there is to verify, sorted by path."""
    rows = {}
    for p in port_baseline.pages():
        parts = p.split('/')
        build = '/'.join(parts[:2])
        rows[p] = {'page': p, 'build': build, 'note': ''}
    for t in cfg['extra_targets']['targets']:
        pages = extra_pages(t)
        for p in pages:
            r = rows.setdefault(p, {'page': p, 'build': t['dir'], 'note': '', 'extra': True})
            r['note'] = t.get('note', '')
            if t.get('verify'):
                r['vdir_hint'] = t['verify']
        if not pages:
            rows['%s/' % t['dir']] = {'page': '%s/' % t['dir'], 'build': t['dir'], 'note': t.get('note', ''), 'extra': True, 'nopage': True}
    out = []
    for p, r in sorted(rows.items()):
        if r.get('nopage'):
            r.update(vdir=None, script=None, kind=None)
        else:
            stop = r['build'] if not r.get('vdir_hint') else r['vdir_hint']
            vdir, script, kind = find_verify(p, stop)
            if r.get('vdir_hint') and not vdir:
                vdir, script, kind = r['vdir_hint'], r['vdir_hint'] + '/verify.py', 'verify'
            r.update(vdir=vdir, script=script, kind=kind)
        out.append(r)
    # a folder with only a check.py is one job, not one per page
    seen, folded = set(), []
    for r in out:
        if r['kind'] == 'check':
            if r['vdir'] in seen:
                continue
            seen.add(r['vdir'])
            r = dict(r, page=r['vdir'] + '/check.py')
        folded.append(r)
    return folded


def resolve_args(row, cfg):
    """(full args, why) for one inventory row."""
    page, script = row['page'], row['script']
    if row['kind'] == 'check':
        return [], 'check.py: its own checks, no page argument'
    ov = cfg['pages'].get(page)
    if isinstance(ov, dict):
        return list(ov['args']), 'tools/verify_all.json pages: ' + ov.get('why', '')
    for rule in cfg['rules']['list']:
        if re.search(rule['match'], page):
            return list(rule['args']), 'rule %s: %s' % (rule['match'], rule.get('why', ''))
    flags = script_flags(script)
    args, src = gate(doc_commands(row['vdir'], script), page, flags)
    if args is not None:
        return args, src
    return ['--assert'], 'default (no documented gate for this page)'


def main_args(args, cfg, flags):
    drops = set(cfg['main_tier_drops']['flags'])
    out, i = [], 0
    while i < len(args):
        a = args[i]
        k = a.split('=', 1)[0]
        if k in drops:
            i += 1 + (1 if '=' not in a and takes_value(k, flags) and k != '--all-views' else 0)
            continue
        out.append(a)
        i += 1
    return out


def page_arg(row):
    """The page as the verify takes it: relative to the verify's folder (`dist/rift.html`)."""
    return os.path.relpath(os.path.join(ROOT, row['page']), os.path.join(ROOT, row['vdir'])).replace(os.sep, '/')


# ----------------------------------------------------------------------------------------------------------------------
# What changed: the page against the baseline, its inputs against --since

@functools.lru_cache(maxsize=None)
def baseline():
    try:
        with open(port_baseline.OUT, encoding='utf-8') as fh:
            return json.load(fh)['pages']
    except (OSError, ValueError):
        return {}


def page_state(page, base):
    """'changed', 'same', 'new', 'pointer' (an LFS pointer whose oid differs from the baseline, or not in it),
    'pointer-same', or 'missing'."""
    f = os.path.join(ROOT, page)
    if not os.path.isfile(f):
        return 'missing'
    if buildlib.is_pointer(f):
        oid = buildlib.pointer_oid(f)
        return 'pointer-same' if page in base and oid == base[page]['sha256'] else 'pointer'
    if page not in base:
        return 'new'
    return 'same' if port_baseline.sha(f) == base[page]['sha256'] else 'changed'


_MAN = {}


def _manifest(build, ref):
    k = (build, ref)
    if k not in _MAN:
        if ref is None:
            _MAN[k] = buildlib.load_manifest(build)
        else:
            r = subprocess.run(['git', 'show', '%s:%s/%s' % (ref, build, buildlib.MANIFEST)], cwd=ROOT, capture_output=True)
            try:
                _MAN[k] = json.loads(r.stdout.decode('utf-8')) if r.returncode == 0 else None
            except ValueError:
                _MAN[k] = None
    return _MAN[k]


def _inputs_for(man, page):
    if not man:
        return None
    for cmd, run in sorted(man.get('runs', {}).items()):
        if page in run.get('outputs', {}):
            return run.get('inputs', {})
    return None


def changed_inputs(row, since):
    """The inputs of the command that wrote the page that moved since `since` (added, gone or rehashed); None when
    either manifest does not name the page."""
    build = row['build']
    now, then = _inputs_for(_manifest(build, None), row['page']), _inputs_for(_manifest(build, since), row['page'])
    if now is None or then is None:
        return None
    return sorted(p for p in set(now) | set(then) if now.get(p) != then.get(p))


def tier_for(row, mode, since, cfg):
    """(tier, why): full or main."""
    if mode in ('full', 'main'):
        return mode, '--tier ' + mode
    items = cfg['no_look']['items']
    if not items:
        return 'full', 'no proven no-look items listed'
    moved = changed_inputs(row, since)
    if moved is None:
        return 'full', 'no manifest names the page at %s and now' % since
    if not moved:
        return 'full', 'the page moved with no input moved since %s' % since
    pats = [it['path'] for it in items]
    other = [p for p in moved if not _globbed(p, pats)]
    if other:
        return 'full', '%d input(s) moved that are not proven no-look (%s)' % (len(other), ', '.join(other[:3]))
    return 'main', 'only proven no-look inputs moved: %s' % ', '.join(moved[:4])


# ----------------------------------------------------------------------------------------------------------------------
# The plan

def load_durations():
    try:
        with open(DURATIONS, encoding='utf-8') as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def job_key(page, args):
    return page + ' ' + ' '.join(args)


def estimate(row, args, cfg, durs):
    k = job_key(row['page'], args)
    if k in durs:
        return float(durs[k]), 'measured'
    if row['page'] in cfg['long']:
        return float(cfg['long'][row['page']]), 'verify_all.json long'
    try:
        mb = os.path.getsize(os.path.join(ROOT, row['page'])) / 1e6
    except OSError:
        mb = 0
    if mb < 0.01:   # a pointer: the baseline's size
        mb = baseline().get(row['page'], {}).get('bytes', 5e6) / 1e6
    views = n_views(args)
    return 60 + mb * 6 * (1 + (12 if views == 99 else views) / 3.0), 'guess'


def plan(cfg, a):
    base = baseline()
    durs = load_durations()
    jobs = []
    for row in inventory(cfg):
        page = row['page']
        if a.only and not any(s in page for s in a.only):
            continue
        j = {'id': len(jobs), 'page': page, 'build': row['build'], 'vdir': row['vdir'], 'script': row['script'], 'kind': row['kind'],
             'note': row.get('note', '')}
        st = 'no-page' if row.get('nopage') else 'check' if row['kind'] == 'check' else page_state(page, base)
        if not a.all and st in ('same', 'pointer-same'):
            continue   # the bytes the baseline holds: nothing to verify again
        sk = _globbed(page, [k for k in cfg['skip'] if k != 'what'])
        if row.get('nopage'):
            j.update(state=st, status='no-verify', why='no page to verify: ' + row.get('note', ''))
        elif sk:
            j.update(state=st, status='skipped', why=cfg['skip'][sk])
        elif not row['script']:
            j.update(state=st, status='no-verify', why='no verify.py or check.py above the page in its build')
        if 'status' in j:
            j.update(args=[], tier='', est=0, est_src='')
            jobs.append(j)
            continue
        full, why = resolve_args(row, cfg)
        if row['kind'] == 'verify' and '--assert' not in full:
            full = ['--assert'] + full
        flags = script_flags(row['script'])
        tier, twhy = ('full', 'check.py') if row['kind'] == 'check' else tier_for(row, a.tier, a.since, cfg)
        args = main_args(full, cfg, flags) if tier == 'main' else full
        est, esrc = estimate(row, args, cfg, durs)
        out_flag = '--out' if '--out' in flags else '--shots' if '--shots' in flags else None
        j.update(state=st, page_arg=page_arg(row) if row['kind'] == 'verify' else None, args=args, full_args=full, why=why,
                 tier=tier, tier_why=twhy, est=round(est), est_src=esrc, out_flag=out_flag)
        jobs.append(j)
    jobs.sort(key=lambda j: ('status' in j, -j['est'], j['page']))
    if a.limit:
        jobs = [j for j in jobs if 'status' not in j][:a.limit] + [j for j in jobs if 'status' in j]
    for i, j in enumerate(jobs):
        j['id'] = i
    return jobs


def command(j, run_dir=None, no_cache=False):
    """[argv], cwd for a job."""
    py = sys.executable
    if j['kind'] == 'check':
        return [py, 'check.py'], os.path.join(ROOT, j['vdir'])
    argv = [py, os.path.basename(j['script']), j['page_arg']] + j['args']
    if run_dir and j.get('out_flag'):
        argv += [j['out_flag'], os.path.join(run_dir, 'shots', slug(j))]
    if no_cache:
        argv.append('--no-cache')
    return argv, os.path.join(ROOT, j['vdir'])


def slug(j):
    return '%03d-%s' % (j['id'], re.sub(r"[^\w.-]+", "_", j['page'])[-90:])


def show_cmd(j):
    if j['kind'] == 'check':
        return 'cd %s; python check.py' % j['vdir']
    return 'cd %s; python %s %s' % (j['vdir'], os.path.basename(j['script']), ' '.join(shlex.quote(x) for x in [j['page_arg']] + j['args']))


# ----------------------------------------------------------------------------------------------------------------------
# Lanes

def lanes():
    """(local lanes, cloud lanes that answer now). Reads the cloud config only; never starts or stops a machine."""
    import harness
    local = list(harness.LANES)
    cloud = []
    try:
        cl = harness._cloud()
        if cl.load_config():
            cloud = cl.lanes_up()
    except Exception as e:   # a broken cloud config must not stop a local run
        print('verify_all: the cloud lanes could not be read (%s); local lanes only' % e)
    return local, cloud


# ----------------------------------------------------------------------------------------------------------------------
# Reading a run's log

RENDERER = re.compile(r"^harness: renderer (.*?); lane (\S+); KRATOR_GL=(\S+)", re.M)
CACHED = re.compile(r"^harness: cached (STALE )?pass: .*? passed (\S+) on the same bytes \(lane ([^,)]+)(?:, ([^)]*))?\)", re.M)
FAILED = re.compile(r"^\s*FAILED:? ?(.*)$", re.M)
FAIL_LINE = re.compile(r"^\s*FAIL[: ]\s*(.+)$", re.M)
FAIL_NAMED = re.compile(r"^\s*FAIL\s+(?!:)(\S.*)$", re.M)   # `FAIL  name : detail`, `FAIL name - detail`: one check each
POINTER_SIGN = re.compile(r"LFS pointer|version https://git-lfs|Unexpected identifier '?https'?", re.I)
CLOUD_LANE = re.compile(r"^vast\d+$")


def known_for(page, cfg, gpu):
    out = []
    for k in cfg['known']['list']:
        if k.get('page_verify') is False:
            continue
        if not _globbed(page, k.get('pages', [])):
            continue
        if k.get('gl') == 'software' and gpu:
            continue
        out.append(k)
    return out


def classify(text, code, page, cfg, gpu=True, kind='verify'):
    """{status, items, known, renderer, lane, detail} from a run's output and exit code (None: the code is not known, as
    for a job adopted after the driver died: read from the text)."""
    r = {'items': [], 'known': [], 'renderer': '', 'lane': ''}
    m = RENDERER.search(text)
    if m:
        r['renderer'], r['lane'] = m.group(1), m.group(2)
    c = CACHED.search(text)
    if c:
        r['lane'], r['renderer'] = c.group(3), c.group(4) or ''
    stale = 'STALE PASS' in text
    if code is None:
        if c or re.search(r"^OK\b", text, re.M):
            code = 0
        elif 'STALLED' in text:
            code = 124
        elif 'THE PAGE CRASHED' in text:
            code = 75
        elif FAILED.search(text) or FAIL_LINE.search(text):
            code = 1
        else:
            r['status'] = 'unknown'
            return r
    r['code'] = code
    if code == 0:
        if stale:
            r['status'] = 'stale'
        elif c:
            r['status'] = 'cached'
        elif kind == 'verify' and gpu and not m:
            r['status'] = 'no-renderer'
        else:
            r['status'] = 'pass'
        return r
    if code == 124 or 'STALLED' in text:
        r['status'] = 'stalled'
        return r
    if code == 75 or 'THE PAGE CRASHED' in text:
        r['status'] = 'crashed'
        return r
    if code == 3 and re.search(r"GPU lock|cloud lane", text):
        r['status'] = 'lane-timeout'
        r['detail'] = (re.findall(r"^FAILED: .*$", text, re.M) or [''])[-1][:300]
        return r
    # the failed checks: each `FAIL <name>` line, and each part of the last FAILED: line that is neither a summary of them
    # (verify_all.json "generic_failed": "kit checks (...)") nor a universal assert a FAIL line already names
    named = [re.sub(r"\s+", " ", x.strip()) for x in FAIL_NAMED.findall(text)]
    fl = FAILED.findall(text)
    parts = [x.strip() for x in fl[-1].split('; ') if x.strip()] if fl else []
    generic = cfg.get('generic_failed', {}).get('list', [])
    items = list(named)
    for x in parts:
        u = x[len('universal '):] if x.startswith('universal ') else None
        if u is not None and any(n.startswith(u) for n in named):
            continue
        if any(re.search(g, x, re.I) for g in generic) and named:
            continue
        items.append(x)
    if not items:
        items = [x.strip() for x in FAIL_LINE.findall(text)]
    r['items'] = items
    if any(POINTER_SIGN.search(ln) for ln in text.splitlines() if not re.match(r"\s*(PASS|REPORT|WARN|KNOWN)", ln)):
        r['status'] = 'pointer'
        r['detail'] = 'a file the run read is a Git LFS pointer: pull it (tools/lfs_needs.py), then --resume'
        return r
    ks = known_for(page, cfg, gpu)
    matched = set()
    unmatched = []
    for it in items:
        hit = [k['id'] for k in ks if any(re.search(p, it, re.I) for p in k.get('match', []))]
        if hit:
            matched.update(hit)
        else:
            unmatched.append(it)
    r['known'] = sorted(matched)
    r['unmatched'] = unmatched
    r['status'] = 'known' if items and not unmatched else 'fail'
    return r


# ----------------------------------------------------------------------------------------------------------------------
# A run

class Run:
    def __init__(self, path):
        self.dir = path
        self.lock = threading.Lock()
        os.makedirs(os.path.join(path, 'logs'), exist_ok=True)
        os.makedirs(os.path.join(path, 'shots'), exist_ok=True)

    @property
    def plan_path(self):
        return os.path.join(self.dir, 'plan.json')

    def save_plan(self, meta, jobs):
        with open(self.plan_path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump({'meta': meta, 'jobs': jobs}, fh, indent=1)

    def load_plan(self):
        with open(self.plan_path, encoding='utf-8') as fh:
            d = json.load(fh)
        return d['meta'], d['jobs']

    def event(self, ev):
        ev = dict(ev, t=round(time.time(), 1))
        with self.lock:
            with open(os.path.join(self.dir, 'state.jsonl'), 'a', encoding='utf-8', newline='\n') as fh:
                fh.write(json.dumps(ev) + '\n')

    def events(self):
        out = []
        try:
            with open(os.path.join(self.dir, 'state.jsonl'), encoding='utf-8') as fh:
                for ln in fh:
                    try:
                        out.append(json.loads(ln))
                    except ValueError:
                        pass   # a line cut short by a crash
        except OSError:
            pass
        return out

    def last(self):
        """{job id: its last start and last end event}."""
        st = {}
        for e in self.events():
            if 'id' in e:
                d = st.setdefault(e['id'], {})
                d[e['ev']] = e
                if e['ev'] == 'start':
                    d.pop('end', None)
                    d['attempts'] = d.get('attempts', 0) + 1
        return st


def runs_home():
    return os.path.join(HOME, 'runs')


def latest_run():
    d = runs_home()
    runs = [os.path.join(d, x) for x in os.listdir(d)] if os.path.isdir(d) else []
    runs = [r for r in runs if os.path.isfile(os.path.join(r, 'plan.json'))]
    return max(runs, key=os.path.getmtime) if runs else None


def git_head():
    r = subprocess.run(['git', 'rev-parse', '--short=9', 'HEAD'], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() or 'unknown'


def _alive(pid, start):
    import harness
    if not pid or not harness.pid_alive(pid):
        return False
    now = harness._proc_start(pid)
    return not (start and now and abs(now - start) > 2)


def execute(run, meta, jobs, a, cfg):
    """Run every job not ended yet, `workers` at a time, longest first; one retry for a stall or a crash."""
    import harness
    gpu = meta['gpu']
    env = dict(os.environ, PYTHONIOENCODING='utf-8', PYTHONUNBUFFERED='1')
    if gpu:
        env['KRATOR_GL'] = 'gpu'
    else:
        env.pop('KRATOR_GL', None)
    if a.lane:
        env['KRATOR_GPU_LANE'] = a.lane
    st = run.last()
    retry = set(RETRY_FAILED) if a.retry_failed else set()
    todo, adopt = [], []
    for j in jobs:
        if j.get('status'):            # decided at planning: no-verify, skipped
            if j['id'] not in st:
                run.event({'ev': 'end', 'id': j['id'], 'status': j['status'], 'why': j.get('why', ''), 'secs': 0})
            continue
        s = st.get(j['id'], {})
        end = s.get('end')
        if end and end['status'] in FINAL and end['status'] not in retry:
            continue
        if end and end['status'] in RETRY_ONCE and s.get('attempts', 0) >= 2 and not a.retry_failed:
            continue
        if not end and s.get('start') and _alive(s['start'].get('pid'), s['start'].get('pstart')):
            adopt.append((j, s['start']))
            continue
        todo.append(j)
    stop = threading.Event()
    running = {}
    durs = load_durations()
    dlock = threading.Lock()

    def finish(j, res, secs, log):
        ev = {'ev': 'end', 'id': j['id'], 'page': j['page'], 'secs': round(secs), 'log': log}
        ev.update({k: v for k, v in res.items() if k in ('status', 'code', 'items', 'known', 'unmatched', 'renderer', 'lane', 'detail')})
        run.event(ev)
        if res.get('status') in ('pass', 'known', 'fail') and secs > 5:
            with dlock:
                durs[job_key(j['page'], j['args'])] = round(secs)
                os.makedirs(HOME, exist_ok=True)
                tmp = DURATIONS + '.%d.tmp' % os.getpid()
                with open(tmp, 'w', encoding='utf-8', newline='\n') as fh:
                    json.dump(durs, fh, indent=1, sort_keys=True)
                os.replace(tmp, DURATIONS)
        print('%-12s %5ds  %s%s' % (res.get('status', '?').upper(), secs, j['page'],
                                     ('  [' + '; '.join(res.get('items', [])[:3])[:160] + ']') if res.get('items') else ''), flush=True)

    def one(j):
        for attempt in (1, 2):
            if stop.is_set():
                return
            if j['kind'] == 'verify':
                ps = page_state(j['page'], {})
                if ps in ('pointer', 'pointer-same', 'missing'):
                    res = {'status': 'pointer' if ps != 'missing' else 'not-built',
                           'detail': 'python tools/lfs_needs.py %s --pages --pull' % j['build'] if ps != 'missing'
                           else 'python tools/build.py %s' % j['build']}
                    run.event({'ev': 'end', 'id': j['id'], 'page': j['page'], 'secs': 0, **res})
                    print('%-12s        %s  (%s)' % (res['status'].upper(), j['page'], res['detail']), flush=True)
                    return
            argv, cwd = command(j, run.dir, a.no_cache)
            log = os.path.join(run.dir, 'logs', slug(j) + ('.log' if attempt == 1 else '.retry.log'))
            e = dict(env)
            if j['kind'] == 'check':
                e.pop('KRATOR_GL', None)   # a check.py takes no lane: software GL
            t0 = time.time()
            with open(log, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write('# %s\n# cwd %s\n# KRATOR_GL=%s KRATOR_GPU_LANE=%s\n' % (' '.join(argv), cwd, e.get('KRATOR_GL', ''), e.get('KRATOR_GPU_LANE', 'auto')))
                fh.flush()
                p = subprocess.Popen(argv, cwd=cwd, env=e, stdout=fh, stderr=subprocess.STDOUT)
                running[j['id']] = p
                run.event({'ev': 'start', 'id': j['id'], 'page': j['page'], 'pid': p.pid, 'pstart': harness._proc_start(p.pid),
                           'attempt': attempt, 'log': log, 'argv': argv})
                print('start        %s%s' % (show_cmd(j), '  (retry)' if attempt > 1 else ''), flush=True)
                code = p.wait()
                running.pop(j['id'], None)
            if stop.is_set():
                run.event({'ev': 'stopped', 'id': j['id']})
                return
            with open(log, encoding='utf-8', errors='replace') as fh:
                text = fh.read()
            res = classify(text, code, j['page'], cfg, gpu=bool(e.get('KRATOR_GL')), kind=j['kind'])
            finish(j, res, time.time() - t0, log)
            if res['status'] not in RETRY_ONCE or a.no_retry:
                return

    def adopted(j, start):
        print('waiting      %s (pid %s, started by an earlier driver)' % (j['page'], start.get('pid')), flush=True)
        while _alive(start.get('pid'), start.get('pstart')) and not stop.is_set():
            time.sleep(10)
        if stop.is_set():
            return
        try:
            with open(start['log'], encoding='utf-8', errors='replace') as fh:
                text = fh.read()
        except OSError:
            text = ''
        res = classify(text, None, j['page'], cfg, gpu=gpu, kind=j['kind'])
        if res['status'] == 'unknown':   # nothing to read: run it again, as one of the workers
            with sem:
                one(j)
            return
        finish(j, res, time.time() - start['t'], start['log'])

    workers = max(1, a.workers or meta['workers'])
    print('verify_all: %d to run, %d adopted from an earlier driver, %d worker(s); lanes %s; run %s' % (
        len(todo), len(adopt), workers, ', '.join(meta['lanes']) or 'none', run.dir), flush=True)
    sem = threading.Semaphore(workers)
    ex = concurrent.futures.ThreadPoolExecutor(max_workers=workers + len(adopt))
    futs = [ex.submit(adopted, j, s) for j, s in adopt]

    def gated(j):
        with sem:
            one(j)
    futs += [ex.submit(gated, j) for j in todo]
    try:
        while any(not f.done() for f in futs):
            time.sleep(0.5)
        for f in futs:
            f.result()
    except KeyboardInterrupt:
        stop.set()
        print('\nverify_all: stopping: the running verifies are stopped by PID (each closes its browser and gives its lane back); '
              '--resume carries on', flush=True)
        for p in list(running.values()):
            try:
                harness.kill_tree(p.pid)
            except Exception:
                p.kill()
        ex.shutdown(wait=False, cancel_futures=True)
        run.event({'ev': 'abort'})
        return 130
    ex.shutdown()
    return 0


# ----------------------------------------------------------------------------------------------------------------------
# The report

ORDER = ('fail', 'stalled', 'crashed', 'lane-timeout', 'unknown', 'no-renderer', 'stale', 'pointer', 'not-built', 'known', 'pass', 'cached',
         'no-verify', 'skipped', 'not-run')


def results(run, jobs):
    st = run.last()
    out = []
    for j in jobs:
        s = st.get(j['id'], {})
        end = s.get('end')
        r = dict(j)
        if end:
            r.update({k: v for k, v in end.items() if k not in ('ev', 't', 'id', 'page')})
        elif s.get('start'):
            r['status'] = 'not-run' if not _alive(s['start'].get('pid'), s['start'].get('pstart')) else 'running'
            r['log'] = s['start'].get('log')
        else:
            r.setdefault('status', 'not-run')
        r['attempts'] = s.get('attempts', 0)
        out.append(r)
    return out


def shown_dir(d):
    """A run folder as a report names it: under the runs' home or the repo, not the user's own path."""
    d = os.path.abspath(d)
    for base, name in ((HOME, '%LOCALAPPDATA%/krator-verify-all' if not os.environ.get('KRATOR_VERIFY_ALL_DIR') else '$KRATOR_VERIFY_ALL_DIR'), (ROOT, '.')):
        if os.path.normcase(d).startswith(os.path.normcase(os.path.abspath(base)) + os.sep):
            return name + '/' + os.path.relpath(d, base).replace(os.sep, '/')
    return d


def write_report(run, meta, jobs, cfg):
    res = results(run, jobs)
    counts = {}
    for r in res:
        counts[r['status']] = counts.get(r['status'], 0) + 1
    known = cfg['known']['list']
    lanes_used = sorted({r.get('lane') for r in res if r.get('lane')})
    cloud_used = [ln for ln in lanes_used if CLOUD_LANE.match(ln)]
    L = []
    L.append('# Stage 8 verify: %s' % os.path.basename(run.dir))
    L.append('')
    L.append('Written by `tools/verify_all.py` at %s from `%s` (plan of %s at `%s`, %s). KRATOR_GL=%s; tier %s; lanes at the start %s; '
             'lanes that ran a job %s.' % (time.strftime('%Y-%m-%d %H:%M'), shown_dir(run.dir),
                                           meta['created'], meta['head'], meta['select'], 'gpu' if meta['gpu'] else 'software',
                                           meta['tier'], ', '.join(meta['lanes']) or 'none', ', '.join(lanes_used) or 'none'))
    L.append('')
    counted = sum(counts.get(s, 0) for s in COUNTS)
    L.append('**%d jobs: %d verified on these bytes (%d run, %d cached), %d known failures, %d failures**; %s.' % (
        len(res), counted, counts.get('pass', 0), counts.get('cached', 0), counts.get('known', 0), counts.get('fail', 0),
        ', '.join('%d %s' % (counts[s], s) for s in ORDER if counts.get(s) and s not in ('pass', 'cached', 'known', 'fail')) or 'nothing else'))
    L.append('')
    if cloud_used:
        L.append('**The cloud lanes ran jobs (%s).** When the queue is empty, tell the owner: the machine bills by the hour; '
                 'stop it (`vastai stop instance <id>`), never destroy it.' % ', '.join(cloud_used))
        L.append('')
    L.append('| Status | Count | Counts as verified |')
    L.append('|---|---|---|')
    for s in ORDER:
        if counts.get(s):
            L.append('| %s | %d | %s |' % (s, counts[s], 'yes' if s in COUNTS else 'no'))
    L.append('')
    L.append("## Against the owner's list (D30, STAGE-8/PLAN.md section 5) and the carried list (HANDOFF-REBUILD.md:120-126)")
    L.append('')
    L.append('| Id | What | Pages run | Failing on it | Passing now | Note |')
    L.append('|---|---|---|---|---|---|')
    for k in known:
        if k.get('page_verify') is False:
            L.append('| %s | %s | | | | not a page verify (a node, Python or Godot test): see test_all |' % (k['id'], k['what']))
            continue
        mine = [r for r in res if _globbed(r['page'], k.get('pages', [])) and r['status'] not in ('no-verify', 'skipped', 'not-run')]
        hit = [r for r in mine if k['id'] in (r.get('known') or [])]
        ok = [r for r in mine if r['status'] in COUNTS]
        note = ''
        if ok and not hit:
            note = 'passes on every page run: the owner may drop it'
        if k.get('gl') == 'software' and meta['gpu']:
            note = 'software GL only: not looked for on the GPU'
        if k['source'] == 'HR':
            note = (note + '; ' if note else '') + 'outside D30: the owner rules on it'
        L.append('| %s | %s | %d | %d | %d | %s |' % (k['id'], k['what'], len(mine), len(hit), len(ok), note))
    L.append('')

    def table(title, rows, cols):
        if not rows:
            return
        L.append('## %s (%d)' % (title, len(rows)))
        L.append('')
        L.append('| ' + ' | '.join(c for c, _ in cols) + ' |')
        L.append('|' + '---|' * len(cols))
        for r in rows:
            L.append('| ' + ' | '.join(str(f(r)).replace('|', '/').replace('\n', ' ') for _, f in cols) + ' |')
        L.append('')
    logp = lambda r: os.path.relpath(r['log'], run.dir).replace(os.sep, '/') if r.get('log') else ''
    table('Failures', [r for r in res if r['status'] == 'fail'],
          [('Page', lambda r: '`%s`' % r['page']), ('Command', lambda r: '`%s`' % ' '.join(r['args'])),
           ('Failed', lambda r: '; '.join(r.get('unmatched') or r.get('items') or ['(no FAILED line: read the log)'])[:400]),
           ('Known items too', lambda r: ', '.join(r.get('known') or [])), ('Log', logp)])
    table('Not finished: stalled, crashed, lane timeouts, unread', [r for r in res if r['status'] in ('stalled', 'crashed', 'lane-timeout', 'unknown', 'running', 'not-run')],
          [('Page', lambda r: '`%s`' % r['page']), ('Status', lambda r: r['status']), ('Tries', lambda r: r.get('attempts', 0)),
           ('Detail', lambda r: r.get('detail', '')), ('Log', logp)])
    table("Passed but does not count (STALE PASS, no renderer line)", [r for r in res if r['status'] in ('stale', 'no-renderer')],
          [('Page', lambda r: '`%s`' % r['page']), ('Status', lambda r: r['status']), ('Log', logp)])
    table('LFS pointers and pages not built (pull or build, then --resume)', [r for r in res if r['status'] in ('pointer', 'not-built')],
          [('Page', lambda r: '`%s`' % r['page']), ('Status', lambda r: r['status']), ('Then', lambda r: '`%s`' % r.get('detail', ''))])
    table('Known failures', [r for r in res if r['status'] == 'known'],
          [('Page', lambda r: '`%s`' % r['page']), ('Known', lambda r: ', '.join(r.get('known') or [])),
           ('Items', lambda r: '; '.join(r.get('items') or [])[:300]), ('Log', logp)])
    table('Verified', [r for r in res if r['status'] in COUNTS],
          [('Page', lambda r: '`%s`' % r['page']), ('Tier', lambda r: r.get('tier', '')), ('Command', lambda r: '`%s`' % ' '.join(r['args'])),
           ('Status', lambda r: r['status']), ('Lane', lambda r: r.get('lane', '')), ('Renderer', lambda r: (r.get('renderer') or '')[:60]),
           ('Secs', lambda r: r.get('secs', ''))])
    table('No verify, skipped', [r for r in res if r['status'] in ('no-verify', 'skipped')],
          [('Page', lambda r: '`%s`' % r['page']), ('Status', lambda r: r['status']), ('Why', lambda r: r.get('why') or r.get('detail', ''))])
    with open(os.path.join(run.dir, 'report.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(L))
    with open(os.path.join(run.dir, 'report.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({'meta': meta, 'counts': counts, 'results': res}, fh, indent=1)
    with open(os.path.join(run.dir, 'results.tsv'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('page\tstatus\ttier\targs\tlane\trenderer\tsecs\tknown\titems\tlog\n')
        for r in res:
            fh.write('\t'.join(str(x) for x in (r['page'], r['status'], r.get('tier', ''), ' '.join(r.get('args', [])), r.get('lane', ''),
                                                 r.get('renderer', ''), r.get('secs', ''), ','.join(r.get('known') or []),
                                                 ' ;; '.join(r.get('items') or []), logp(r))) + '\n')
    return os.path.join(run.dir, 'report.md'), counts


# ----------------------------------------------------------------------------------------------------------------------

def dry_run(jobs, meta):
    torun = [j for j in jobs if not j.get('status')]
    print('%-6s %-5s %-8s %-62s %s' % ('est', 'tier', 'state', 'page', 'command  <- where the arguments come from'))
    for j in torun:
        print('%5dm %-5s %-8s %-62s %s' % (round(j['est'] / 60.0), j['tier'], j['state'], j['page'], show_cmd(j)))
        print('%s<- %s%s' % (' ' * 85, j['why'], ('; ' + j['tier_why']) if j['tier'] == 'main' else ''))
    rest = [j for j in jobs if j.get('status')]
    if rest:
        print('\nnot run:')
        for j in rest:
            print('  %-10s %-62s %s' % (j['status'], j['page'], j.get('why', '')))
    tot = sum(j['est'] for j in torun)
    w = max(1, meta['workers'])
    tiers = {}
    for j in torun:
        tiers[j['tier']] = tiers.get(j['tier'], 0) + 1
    print('\n%d jobs to run (%s), %d not run; estimated %.1f h of verify, about %.1f h on %d worker(s) (lanes: %s)' % (
        len(torun), ', '.join('%d %s' % (v, k) for k, v in sorted(tiers.items())), len(rest), tot / 3600.0, tot / 3600.0 / w, w,
        ', '.join(meta['lanes']) or 'none'))


def detach(argv, run_dir):
    os.makedirs(run_dir, exist_ok=True)
    log = open(os.path.join(run_dir, 'driver.log'), 'a', encoding='utf-8')
    argv = [a for a in argv if a != '--detach']
    if '--run' not in argv:
        argv += ['--run', run_dir]
    cmd = [sys.executable, os.path.abspath(__file__)] + argv
    io = dict(cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
    if sys.platform == 'win32':
        # a hidden console (CREATE_NO_WINDOW: the verify children share it, no window each), its own group, and out of the
        # session's job object when the job allows it (CREATE_BREAKAWAY_FROM_JOB), so closing the session does not stop it
        flags = 0x08000000 | 0x00000200
        try:
            p = subprocess.Popen(cmd, creationflags=flags | 0x01000000, **io)
        except OSError:
            p = subprocess.Popen(cmd, creationflags=flags, **io)
    else:
        p = subprocess.Popen(cmd, start_new_session=True, **io)
    print('verify_all: detached, pid %d; its log %s; the report lands in %s' % (p.pid, os.path.join(run_dir, 'driver.log'), run_dir))
    return 0


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0], formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument('only', nargs='*', help='only pages whose repo path holds one of these')
    ap.add_argument('--all', action='store_true', help='every page, not only the ones that differ from PORT-BASELINE.json')
    ap.add_argument('--dry-run', action='store_true', help='print the plan and stop')
    ap.add_argument('--json', action='store_true', help='with --dry-run: the plan as JSON')
    ap.add_argument('--tier', choices=('auto', 'full', 'main'), default='auto')
    ap.add_argument('--since', default='HEAD', help='the ref --tier auto compares each build manifest with (default HEAD)')
    ap.add_argument('--workers', type=int, default=0, help='jobs at once (default: the lanes there are)')
    ap.add_argument('--lane', default='', help='KRATOR_GPU_LANE for every job (arc, rtx, auto, cloud, vastN); default auto')
    ap.add_argument('--software', action='store_true', help='SwiftShader, not KRATOR_GL=gpu (counts for nothing in Stage 8)')
    ap.add_argument('--limit', type=int, default=0, help='at most this many jobs (the longest first)')
    ap.add_argument('--no-cache', action='store_true', help='rerun a verify that passed on the same bytes')
    ap.add_argument('--no-retry', action='store_true', help='do not rerun a stalled or crashed job')
    ap.add_argument('--run', default='', help='the run folder (a name under %s, or a path)' % runs_home())
    ap.add_argument('--resume', nargs='?', const='', default=None, metavar='RUN', help='carry on a run (default: the latest)')
    ap.add_argument('--retry-failed', action='store_true', help='with --resume: rerun what failed, stalled, crashed or timed out')
    ap.add_argument('--report', nargs='?', const='', default=None, metavar='RUN', help="write a run's report again and stop")
    ap.add_argument('--detach', action='store_true', help='run detached; the output goes to <run>/driver.log')
    a = ap.parse_args(argv)
    cfg = load_config()

    def run_path(name):
        if not name:
            return None
        return name if os.path.isabs(name) or os.sep in name or '/' in name else os.path.join(runs_home(), name)

    if a.report is not None:
        rp = run_path(a.report) or latest_run()
        if not rp:
            print('no run to report on'); return 2
        run = Run(rp)
        meta, jobs = run.load_plan()
        path, counts = write_report(run, meta, jobs, cfg)
        print('wrote %s: %s' % (path, ', '.join('%d %s' % (v, k) for k, v in sorted(counts.items()))))
        return 0
    if a.resume is not None:
        rp = run_path(a.resume) or run_path(a.run) or latest_run()
        if not rp:
            print('no run to resume'); return 2
        if a.detach:
            return detach(argv, rp)
        run = Run(rp)
        meta, jobs = run.load_plan()
        print('verify_all: resuming %s (%d jobs planned %s at %s)' % (rp, len(jobs), meta['created'], meta['head']))
    else:
        local, cloud = lanes()
        if a.lane and a.lane not in ('auto',):
            lns = [a.lane] if a.lane != 'cloud' else cloud
        else:
            lns = local + cloud
        jobs = plan(cfg, a)
        meta = {'created': time.strftime('%Y-%m-%dT%H:%M:%S'), 'head': git_head(), 'gpu': not a.software, 'tier': a.tier, 'since': a.since,
                'select': ('every page' if a.all else 'the pages that differ from PORT-BASELINE.json') + (' holding %s' % ', '.join(a.only) if a.only else ''),
                'lanes': lns, 'workers': a.workers or max(1, len(lns))}
        if a.dry_run:
            if a.json:
                print(json.dumps({'meta': meta, 'jobs': jobs}, indent=1))
            else:
                dry_run(jobs, meta)
            return 0
        rp = run_path(a.run) or os.path.join(runs_home(), time.strftime('%Y%m%d-%H%M%S') + '-' + meta['head'])
        if a.detach:
            return detach(argv, rp)
        run = Run(rp)
        if os.path.isfile(run.plan_path):
            print('%s holds a run already: --resume %s carries it on' % (rp, rp)); return 2
        run.save_plan(meta, jobs)
    code = execute(run, meta, jobs, a, cfg)
    path, counts = write_report(run, meta, jobs, cfg)
    print('\nverify_all: report %s: %s' % (path, ', '.join('%d %s' % (v, k) for k, v in sorted(counts.items()))))
    if any(CLOUD_LANE.match(str(r.get('lane', ''))) for r in results(run, jobs)):
        print('verify_all: cloud lanes ran jobs: tell the owner the queue is empty (stop the machine; never destroy it)')
    if code:
        return code
    bad = sum(counts.get(s, 0) for s in ('fail', 'stalled', 'crashed', 'lane-timeout', 'unknown', 'no-renderer', 'stale', 'not-run',
                                         'pointer', 'not-built'))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
