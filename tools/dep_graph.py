#!/usr/bin/env python3
"""Module-level dependency graph of Krator's builds, and a check that no new backwards edge appears.

An edge A -> B means a build of module A reads a file under module B (core/<m>, kits/<k>, biomes/<b>,
settlements/<s>, openworld/<o>). Where a build can say what it loads, the edges come from that:
  - a build*.py that imports tools/build_sources.py is run with `--list-sources` and prints every repo file it reads
    (the fragments it resolves, the Python it imports, the upstreams of its vendored copies, the build.py it hands
    over to), without building. Its edges are exactly that list. A read made by another module's code (a bundle,
    a helper) counts as loading that module, not as reading what that module reads.
  - any other build*.py falls back to the text scan: path strings in its text (a `#` comment does not count; a docstring still does), and not the
    paths it composes in code. Cover the build (tools/build_sources.py says how) to take it off the scan.
DEPS.json says which builds were listed and which were scanned ("listed", "scanned"), and which listed edges exist
only because the build vendors a copy of the other module's files ("vendored": --vendor-check reads the upstream).

The dependency runs one way (MODULARITY-PLAN.md):  settlements / openworld  ->  kits / biomes  ->  core.
A backwards edge is:
    core/*   -> anything outside core
    kits/*   -> settlements/* or openworld/*
    biomes/* -> settlements/* or openworld/*
KIT_FOLDERS classes a kit kept in another group's folder as a kit (none since the Ancient Port kit moved to kits/port, 2026-11-03).
A read of a pinned third-party library (THIRD_PARTY: three.js r128, the same bytes in every copy) is not an edge.
The ones that exist today are listed in tools/dep_allowlist.json. A new one fails; as the plan removes edges,
delete their lines (a listed edge that is gone is reported as stale). The file's `reasons` says why an edge that is
not debt stays: a demo's local copy of three.js, for one.

Two more lists keep it modular (MODULARITY-PLAN.md step 6), checked the same way (new fails, gone is stale):
  "lateral"   a settlement or open-world region reading another one (settlements/* or openworld/* -> settlements/*
              or openworld/*). Shared code goes to a kit or core; what stays are content links (the isle demo's two
              towns and its open-world region) and the reads the plan has not moved yet.
  "vendored"  a module that keeps copies of another module's files and checks them with --vendor-check. A new copy
              is an error: read the file in place (a kit's file list, core/) instead, or record why in the plan.

Usage:
    python3 tools/dep_graph.py                   check (what test_all.py runs)
    python3 tools/dep_graph.py --write           also write DEPS.json (every edge, sorted)
    python3 tools/dep_graph.py --init-allowlist  rewrite the allow-list to the backwards edges found now
    python3 tools/dep_graph.py --who <module>    what <module> reads, and what reads it
    python3 tools/dep_graph.py --scan-only ...   the old text scan for every build (to compare against the lists)
    python3 tools/dep_graph.py --files <module>  the files each of <module>'s builds lists (--list-sources)
"""
import glob, io, json, os, re, subprocess, sys, tokenize
from concurrent.futures import ThreadPoolExecutor


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = ('settlements', 'kits', 'biomes', 'openworld', 'core')
ALLOW = os.path.join(ROOT, 'tools', 'dep_allowlist.json')
DEPS = os.path.join(ROOT, 'DEPS.json')
# a module in another group's folder, with the group it is (its reason)
# third-party libraries several modules keep a byte-identical pinned copy of: reading one is not a dependency on the
# module that holds it (tools/harness.py local_three serves kits/ancients' three.js r128 to every core demo)
THIRD_PARTY = {'three.min.js'}
KIT_FOLDERS = {}   # {folder: group}: a kit kept outside kits/ (the Ancient Port kit was settlements/port until 2026-11-03)
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


def code_of(text):
    """A build.py without its # comments: its strings stay, so the paths it reads stay."""
    try:
        toks = list(tokenize.generate_tokens(io.StringIO(text).readline))
    except (tokenize.TokenError, IndentationError, SyntaxError):
        return text
    return ' '.join(t.string for t in toks if t.type != tokenize.COMMENT)


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
    if parts[-1] in THIRD_PARTY:   # a pinned copy of a library, not the module's code
        return None
    if len(parts) >= 2 and parts[0] in GROUPS and parts[1] and os.path.isdir(os.path.join(ROOT, parts[0], parts[1])):
        return parts[0] + '/' + parts[1]
    return None


def scan(f):
    """The fallback: every module a path string in the build's text names."""
    found = set()
    for g, n in PAT.findall(code_of(text(f))):
        n = n.rstrip('.')
        tgt = g + '/' + n
        if n and os.path.isdir(os.path.join(ROOT, *tgt.split('/'))):
            found.add(tgt)
    return found


def list_files(f):
    """([(repo file, vendored only?)] from `build.py --list-sources`, error or None)."""
    try:
        r = subprocess.run([sys.executable, f, '--list-sources'], cwd=os.path.dirname(f), capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=300,
                           env=dict(os.environ, KRATOR_ALLOW_PLAIN_BUILD='1'))   # a listing writes nothing (item 25)
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
    """({module: [modules it reads]}, {build file: 'listed' | 'scanned'}, [errors], {module: [vendored-only]},
    {module: [every module it vendors from]})."""
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
    vall = {m: sorted(v - {m}) for m, v in sorted(vout.items()) if v - {m}}
    return {m: sorted(v) for m, v in sorted(out.items())}, how, errs, vonly, vall


def group(m):
    return KIT_FOLDERS.get(m) or m.split('/')[0]


def backwards(a, b):
    ga, gb = group(a), group(b)
    if ga == 'core':
        return gb != 'core'
    if ga in ('kits', 'biomes'):
        return gb in ('settlements', 'openworld')
    return False


def back_edges(e):
    return sorted('%s -> %s' % (a, b) for a, bs in e.items() for b in bs if backwards(a, b))


def lateral(a, b):
    return group(a) in ('settlements', 'openworld') and group(b) in ('settlements', 'openworld')


def lateral_edges(e):
    return sorted('%s -> %s' % (a, b) for a, bs in e.items() for b in bs if lateral(a, b))


def vendored_edges(vall):
    """Every module -> upstream pair a build vendors from (DEPS.json "vendored" holds only the vendored-only ones)."""
    return sorted('%s -> %s' % (a, b) for a, bs in vall.items() for b in bs)


LISTS = (('backwards', 'backwards edge', 'The order is settlements -> kits/biomes -> core: move the shared code '
          'into core/ (MODULARITY-PLAN.md) instead of reading it from a build above it.'),
         ('lateral', 'settlement -> settlement edge', 'A settlement reads another only for content (lore, the isle demo\'s '
          'two towns): move shared code into a kit or core/ (MODULARITY-PLAN.md step 4, 6).'),
         ('vendored', 'vendored copy', 'Read the upstream in place (its kit\'s file list, or core/) instead of keeping a '
          'copy checked by --vendor-check (MODULARITY-PLAN.md step 6); if a copy must drift, record why in the plan.'))


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
    e, how, errs, vonly, vall = edges('--scan-only' in argv)
    for x in errs:
        print('ERROR ' + x)
    if errs:
        return 1
    back = back_edges(e)
    found = {'backwards': back, 'lateral': lateral_edges(e), 'vendored': vendored_edges(vall)}
    if '--init-allowlist' in argv:
        old = json.load(open(ALLOW, encoding='utf-8')) if os.path.isfile(ALLOW) else {}
        kept = set(x for v in found.values() for x in v)
        write_json(ALLOW, dict({'_note': 'Edges that exist today (tools/dep_graph.py): backwards, settlement -> settlement '
                                         '(lateral) and vendored copies. Delete a line when the edge is removed; never add '
                                         'one without a reason in MODULARITY-PLAN.md.'}, **found,
                               reasons={k: v for k, v in old.get('reasons', {}).items() if k in kept}))
        print('wrote %s (%s)' % (os.path.relpath(ALLOW, ROOT), ', '.join('%d %s' % (len(v), k) for k, v in found.items())))
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
        allow = json.load(open(ALLOW, encoding='utf-8'))
    except (OSError, ValueError):
        print('missing or unreadable %s; run with --init-allowlist' % os.path.relpath(ALLOW, ROOT))
        return 1
    bad = 0
    for key, what, advice in LISTS:
        allowed = set(allow.get(key, []))
        new = [x for x in found[key] if x not in allowed]
        for x in sorted(allowed - set(found[key])):
            print('stale allow-list entry (%s "%s": it is gone, delete the line): %s' % (os.path.basename(ALLOW), key, x))
        for x in new:
            print('NEW %s: %s' % (what, x))
        if new:
            print('\n%d new %s(s). %s\n' % (len(new), what, advice))
            bad += len(new)
    if bad:
        return 1
    nl = sum(1 for h in how.values() if h == 'listed')
    print('dep graph ok: %d modules, %d edges; allow-listed: %d backwards, %d settlement -> settlement, %d vendored '
          '(%d builds listed, %d scanned)' % (len(e), sum(len(v) for v in e.values()), len(back), len(found['lateral']),
                                              len(found['vendored']), nl, len(how) - nl))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
