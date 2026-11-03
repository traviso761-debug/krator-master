#!/usr/bin/env python3
"""Module-level dependency graph of Krator's builds, and a check that no new backwards edge appears.

An edge A -> B means a build of module A reads a file under module B (core/<m>, kits/<k>, biomes/<b>,
settlements/<s>, openworld/<o>). Where a build can say what it loads, the edges come from that:
  - a build*.py that imports tools/build_sources.py is run with `--list-sources` and prints every repo file it reads
    (the fragments it resolves, the Python it imports, the upstreams of its vendored copies, the build.py it hands
    over to), without building. Its edges are exactly that list. A read made by another module's code (a bundle,
    a helper) counts as loading that module, not as reading what that module reads.
  - any other build*.py falls back to the text scan: path strings in its text, comments included, and not the
    paths it composes in code. Cover the build (tools/build_sources.py says how) to take it off the scan.
DEPS.json says which builds were listed and which were scanned ("listed", "scanned"), and which listed edges exist
only because the build vendors a copy of the other module's files ("vendored": --vendor-check reads the upstream).

The dependency runs one way (MODULARITY-PLAN.md):  settlements / openworld  ->  kits / biomes  ->  core.
A backwards edge is:
    core/*   -> anything outside core
    kits/*   -> settlements/* or openworld/*
    biomes/* -> settlements/* or openworld/*
The ones that exist today are listed in tools/dep_allowlist.json. A new one fails; as the plan removes edges,
delete their lines (a listed edge that is gone is reported as stale).

Usage:
    python3 tools/dep_graph.py                   check (what test_all.py runs)
    python3 tools/dep_graph.py --write           also write DEPS.json (every edge, sorted)
    python3 tools/dep_graph.py --init-allowlist  rewrite the allow-list to the backwards edges found now
    python3 tools/dep_graph.py --who <module>    what <module> reads, and what reads it
    python3 tools/dep_graph.py --scan-only ...   the old text scan for every build (to compare against the lists)
    python3 tools/dep_graph.py --files <module>  the files each of <module>'s builds lists (--list-sources)
"""
import glob, json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = ('settlements', 'kits', 'biomes', 'openworld', 'core')
ALLOW = os.path.join(ROOT, 'tools', 'dep_allowlist.json')
DEPS = os.path.join(ROOT, 'DEPS.json')
PAT = re.compile(r"""\b(core|kits|biomes|settlements|openworld)\s*(?:/|\\\\|\\|['"]\s*,\s*['"])\s*([A-Za-z0-9_.-]+)""")
RE_LISTED = re.compile(r'^[^#\n]*\bimport build_sources\b', re.M)


def modules():
    for g in GROUPS:
        for d in sorted(glob.glob(os.path.join(ROOT, g, '*', ''))):
            yield g + '/' + os.path.basename(d.rstrip('/\\'))


def build_files(mod):
    d = os.path.join(ROOT, *mod.split('/'))
    fs = glob.glob(os.path.join(d, 'build*.py')) + glob.glob(os.path.join(d, '*', 'build*.py'))
    return sorted(f for f in fs if os.sep + 'dist' + os.sep not in f)


def text(f):
    try:
        return open(f, encoding='utf-8', errors='replace').read()
    except OSError:
        return ''


def listed(f):
    """True when the build reports its own reads (it imports tools/build_sources.py)."""
    return RE_LISTED.search(text(f)) is not None


def module_of(line):
    parts = line.strip().split('/')
    if len(parts) >= 2 and parts[0] in GROUPS and parts[1] and os.path.isdir(os.path.join(ROOT, parts[0], parts[1])):
        return parts[0] + '/' + parts[1]
    return None


def scan(f):
    """The fallback: every module a path string in the build's text names."""
    found = set()
    for g, n in PAT.findall(text(f)):
        n = n.rstrip('.')
        tgt = g + '/' + n
        if n and os.path.isdir(os.path.join(ROOT, *tgt.split('/'))):
            found.add(tgt)
    return found


def list_files(f):
    """([(repo file, vendored only?)] from `build.py --list-sources`, error or None)."""
    try:
        r = subprocess.run([sys.executable, f, '--list-sources'], cwd=os.path.dirname(f), capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=300)
    except (OSError, subprocess.TimeoutExpired) as e:
        return [], str(e)
    if r.returncode:
        tail = (r.stderr or r.stdout).strip().splitlines()[-3:]
        return [], 'exit %d: %s' % (r.returncode, ' | '.join(tail))
    out = []
    for l in r.stdout.splitlines():
        p, _, kind = l.strip().partition('\t')
        if p:
            out.append((p, kind == 'vendored'))
    return out, None


def edges(scan_only=False):
    """({module: [modules it reads]}, {build file: 'listed' | 'scanned'}, [errors], {module: [vendored-only]})."""
    jobs = [(mod, f, not scan_only and listed(f)) for mod in modules() for f in build_files(mod)]

    def run(job):
        mod, f, lst = job
        if not lst:
            return mod, f, lst, scan(f), set(), None
        files, err = list_files(f)
        reads = {module_of(p) for p, v in files if not v} - {None}
        vend = {module_of(p) for p, v in files if v} - {None}
        return mod, f, lst, reads, vend, err

    out, vout, how, errs = {}, {}, {}, []
    with ThreadPoolExecutor(max_workers=min(8, os.cpu_count() or 2)) as ex:
        for mod, f, lst, reads, vend, err in ex.map(run, jobs):
            rel = os.path.relpath(f, ROOT).replace(os.sep, '/')
            how[rel] = 'listed' if lst else 'scanned'
            if err:
                errs.append('%s --list-sources failed: %s' % (rel, err))
            out.setdefault(mod, set()).update(reads)
            vout.setdefault(mod, set()).update(vend)
    vonly = {}
    for mod in list(out):
        v = vout.get(mod, set()) - out[mod] - {mod}
        out[mod] = (out[mod] | v) - {mod}
        if v:
            vonly[mod] = sorted(v)
        if not out[mod]:
            del out[mod]
    return {m: sorted(v) for m, v in sorted(out.items())}, how, errs, vonly


def group(m):
    return m.split('/')[0]


def backwards(a, b):
    ga, gb = group(a), group(b)
    if ga == 'core':
        return gb != 'core'
    if ga in ('kits', 'biomes'):
        return gb in ('settlements', 'openworld')
    return False


def back_edges(e):
    return sorted('%s -> %s' % (a, b) for a, bs in e.items() for b in bs if backwards(a, b))


def write_json(path, obj):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(obj, f, indent=1, sort_keys=True)
        f.write('\n')


def main(argv):
    if '--files' in argv:
        m = argv[argv.index('--files') + 1]
        for f in build_files(m):
            rel = os.path.relpath(f, ROOT).replace(os.sep, '/')
            if not listed(f):
                print('%s: scanned (no --list-sources)' % rel)
                continue
            files, err = list_files(f)
            print('%s: %s' % (rel, err or '%d files' % len(files)))
            for x, v in files:
                print('  ' + x + ('  (vendored upstream)' if v else ''))
        return 0
    e, how, errs, vonly = edges('--scan-only' in argv)
    for x in errs:
        print('ERROR ' + x)
    if errs:
        return 1
    back = back_edges(e)
    if '--init-allowlist' in argv:
        write_json(ALLOW, {'_note': 'Backwards edges that exist today (tools/dep_graph.py). Delete a line when the edge is removed; '
                                    'never add one without a reason in MODULARITY-PLAN.md.', 'backwards': back})
        print('wrote %s (%d edges)' % (os.path.relpath(ALLOW, ROOT), len(back)))
        return 0
    if '--who' in argv:
        m = argv[argv.index('--who') + 1]
        print('%s reads:    %s' % (m, ', '.join(e.get(m, [])) or '-'))
        print('%s read by:  %s' % (m, ', '.join(sorted(a for a, bs in e.items() if m in bs)) or '-'))
        return 0
    if '--write' in argv:
        write_json(DEPS, {'edges': e, 'backwards': back, 'vendored': vonly,
                          'listed': sorted(f for f, h in how.items() if h == 'listed'),
                          'scanned': sorted(f for f, h in how.items() if h == 'scanned')})
        print('wrote DEPS.json (%d modules, %d edges)' % (len(e), sum(len(v) for v in e.values())))
    try:
        allowed = set(json.load(open(ALLOW, encoding='utf-8')).get('backwards', []))
    except (OSError, ValueError):
        print('missing or unreadable %s; run with --init-allowlist' % os.path.relpath(ALLOW, ROOT))
        return 1
    new = [x for x in back if x not in allowed]
    stale = sorted(allowed - set(back))
    for x in stale:
        print('stale allow-list entry (edge is gone, delete the line): ' + x)
    for x in new:
        print('NEW backwards edge: ' + x)
    if new:
        print('\n%d new backwards edge(s). The order is settlements -> kits/biomes -> core: move the shared code '
              'into core/ (MODULARITY-PLAN.md) instead of reading it from a build above it.' % len(new))
        return 1
    nl = sum(1 for h in how.values() if h == 'listed')
    print('dep graph ok: %d modules, %d edges, %d allow-listed backwards edges (%d builds listed, %d scanned)'
          % (len(e), sum(len(v) for v in e.values()), len(back), nl, len(how) - nl))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
