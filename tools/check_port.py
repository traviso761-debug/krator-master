#!/usr/bin/env python3
"""The port lint (GODOT-PLAN.md, Phase 0): a fragment tagged [G data] in its build's PORT.md
must not touch the browser.

    python3 tools/check_port.py                    # every build with a PORT.md, and core/
    python3 tools/check_port.py settlements/voth   # one build (every build.py runs this)

The rule, one for now: a [G data] fragment contains no DOM access, canvas 2D, input events,
requestAnimationFrame, performance.now, storage or network. What it flags is listed below in
BROWSER. A [G data] row whose note starts with "split" is a fragment the audit has already
recorded as mixing data with host code: its browser lines are reported as warnings, not
failures, until it is split. Every other [G data] fragment with a browser line fails.

A fragment with no row in PORT.md is a warning that names the fix (rerun tools/audit_port.py).
A build with no PORT.md passes: the lint has nothing to check yet.

Exit code 1 on any failure. build.py calls this with its own folder before building and stops
on failure; `--no-checks` on the build skips it, like the other checks.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BROWSER = [
    ('DOM', r'\bdocument\.|\bwindow\.(document|innerWidth|innerHeight|addEventListener)|innerHTML|'
            r'getElementById|querySelector|\.style\.[a-zA-Z]+\s*='),
    ('canvas 2D', r'''getContext\(\s*['"]2d|createElement\(\s*['"]canvas'''),
    ('input', r'addEventListener|\bon(click|keydown|keyup|mousemove|mousedown|wheel)\s*=|[pP]ointer[lL]ock'),
    ('frame loop', r'requestAnimationFrame|performance\.now'),
    ('storage', r'localStorage|sessionStorage|indexedDB'),
    ('network', r'\bfetch\(|XMLHttpRequest|new Worker\(|WebSocket|AudioContext|new Audio\('),
]
ROW = re.compile(r'^\|\s*`([^`]+)`\s*\|\s*[0-9.]+\s*\|\s*(\[[^\]]+\])\s*\|(.*)\|\s*(.*?)\s*\|$')


def rows(port_md):
    out = {}
    for ln in open(port_md, encoding='utf-8'):
        m = ROW.match(ln.rstrip('\n'))
        if m:
            out[m.group(1)] = (m.group(2), m.group(4))
    return out


def fragments(build):
    """The same files audit_port.py tags: core/*/[0-9]*.js, or a build's src/ and targets/."""
    base = os.path.join(ROOT, build)
    out = []
    if build == 'core':
        for mod in sorted(os.listdir(base)):
            for dp, dn, fn in os.walk(os.path.join(base, mod)):
                dn[:] = sorted(x for x in dn if x not in ('example', 'demo', 'node_modules'))
                for f in sorted(fn):
                    if f.endswith('.js') and not f.startswith('test-') and not f.startswith('.'):
                        out.append(os.path.relpath(os.path.join(dp, f), base))
        return out
    if build == 'kits/catalog':
        out += [f for f in sorted(os.listdir(base)) if f.endswith('.js') and not f.startswith(('.', 'three'))]
    for sub in ('src', 'targets'):
        for dp, dn, fn in os.walk(os.path.join(base, sub)):
            dn[:] = sorted(dn)
            for f in sorted(fn):
                if (f.endswith('.js') or f.endswith('.html')) and not f.startswith('.') and not f.endswith('.min.js'):
                    out.append(os.path.relpath(os.path.join(dp, f), base))
    return out


def check(build):
    """(failures, warnings) for one build, each a list of printable lines."""
    port_md = os.path.join(ROOT, build, 'PORT.md')
    if not os.path.isfile(port_md):
        return [], ['%s: no PORT.md (run tools/audit_port.py); nothing to check' % build]
    tags = rows(port_md)
    fails, warns = [], []
    for name in fragments(build):
        if name not in tags:
            warns.append('%s/%s: not in PORT.md; rerun tools/audit_port.py' % (build, name))
            continue
        tag, note = tags[name]
        if tag != '[G data]':
            continue
        path = os.path.join(ROOT, build, name)
        hits = []
        for i, ln in enumerate(open(path, encoding='utf-8', errors='replace'), 1):
            for kind, rx in BROWSER:
                if re.search(rx, ln):
                    hits.append('%s/%s:%d: %s: %s' % (build, name, i, kind, ln.strip()[:100]))
                    break
        if not hits:
            continue
        if note.lower().startswith('split'):
            warns += [h + '   (tagged [G data], noted split: warning until it is split)' for h in hits]
        else:
            fails += hits
    return fails, warns


def main(argv):
    builds = [a.rstrip('/').replace(ROOT + '/', '') for a in argv if not a.startswith('--')]
    builds = [os.path.relpath(os.path.abspath(b), ROOT) if os.path.isabs(b) else b for b in builds]
    if not builds:
        builds = ['core']
        for top in ('settlements', 'kits', 'biomes'):
            d = os.path.join(ROOT, top)
            builds += ['%s/%s' % (top, n) for n in sorted(os.listdir(d))
                       if os.path.isfile(os.path.join(d, n, 'build.py'))]
    nf = nw = 0
    for b in builds:
        fails, warns = check(b)
        for w in warns:
            print('port lint WARN  ' + w)
        for f in fails:
            print('port lint FAIL  ' + f)
        nf += len(fails); nw += len(warns)
    if nf:
        print('port lint: %d failure(s), %d warning(s). A [G data] fragment touched the browser: move that '
              'code to the host, or retag the fragment in PORT.md and note why.' % (nf, nw))
        return 1
    if '--quiet' not in argv:
        print('port lint: ok (%d build(s), %d warning(s))' % (len(builds), nw))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
