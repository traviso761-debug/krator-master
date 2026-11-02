#!/usr/bin/env python3
"""Module-level dependency graph of Krator's builds, and a check that no new backwards edge appears.

An edge A -> B means a build.py of module A names a path under module B (core/<m>, kits/<k>, biomes/<b>,
settlements/<s>, openworld/<o>). It is what a build READS, found from path strings in build*.py, not what runs.
Strings in comments count; fragment-level reads (a file listed from another build's src/) are named by the
build.py that lists them, so they show up here.

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
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = ('settlements', 'kits', 'biomes', 'openworld', 'core')
ALLOW = os.path.join(ROOT, 'tools', 'dep_allowlist.json')
DEPS = os.path.join(ROOT, 'DEPS.json')
PAT = re.compile(r"""\b(core|kits|biomes|settlements|openworld)\s*(?:/|\\\\|\\|['"]\s*,\s*['"])\s*([A-Za-z0-9_.-]+)""")


def modules():
    for g in GROUPS:
        for d in sorted(glob.glob(os.path.join(ROOT, g, '*', ''))):
            yield g + '/' + os.path.basename(d.rstrip('/\\'))


def build_files(mod):
    d = os.path.join(ROOT, *mod.split('/'))
    return sorted(glob.glob(os.path.join(d, 'build*.py')) + glob.glob(os.path.join(d, '*', 'build*.py')))


def edges():
    out = {}
    for mod in modules():
        found = set()
        for f in build_files(mod):
            if os.sep + 'dist' + os.sep in f:
                continue
            try:
                text = open(f, encoding='utf-8', errors='replace').read()
            except OSError:
                continue
            for g, n in PAT.findall(text):
                n = n.rstrip('.')
                tgt = g + '/' + n
                if n and tgt != mod and os.path.isdir(os.path.join(ROOT, *tgt.split('/'))):
                    found.add(tgt)
        if found:
            out[mod] = sorted(found)
    return out


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
    e = edges()
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
        write_json(DEPS, {'edges': e, 'backwards': back})
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
    print('dep graph ok: %d modules, %d edges, %d allow-listed backwards edges' % (len(e), sum(len(v) for v in e.values()), len(back)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
