#!/usr/bin/env python3
"""The hash baseline (GODOT-PLAN.md, Phase 0): every built page's SHA-256, so a refactor
can prove it changed nothing.

    python3 tools/port_baseline.py --write     # rebuild nothing; hash the pages as they are, write PORT-BASELINE.json
    python3 tools/port_baseline.py --write --prune   # the same, and drop entries for pages not built here
    python3 tools/port_baseline.py --update biomes/rift/dist/rift.html ...   # rewrite only these pages' entries
    python3 tools/port_baseline.py             # compare the pages with PORT-BASELINE.json, exit 1 on any difference

Rebuild first (`cd <build> && python3 build.py`; every build is deterministic). A page whose
hash differs after a refactor needs a screenshot diff before the baseline is rewritten.
The file records every `dist/*.html` of every build, the page a build without a dist/ writes beside
its build.py (the Voth lineage: yuni*.html, locus*.html, girder.html, mavs-refuge.html),
plus `kits/post-apoc/sockets-example/*.html` (the socket sheet; it was core/sockets/example until 2026-11-03).

--write keeps the entry of a page that is not built in this checkout (a gitignored dist/, such as
Port's and Ys's), so a partial rebuild never silently drops pages from the baseline; --prune drops them.

A page that is a Git LFS pointer (a checkout without `git lfs pull`) is not a page built here: the compare reports it
NOT BUILT HERE (LFS pointer) and does not fail on it, unless the oid it stands for differs from the baseline's hash
(then it is CHANGED like any page; CORE-IMPROVEMENTS.md 2b). --update refuses a pointer page.

--write rewrites every entry, so it refuses (5d) while pointer pages exist or while `git status` shows a change
outside the pages, PORT-BASELINE.json and the builds' build-inputs.json: other work in the tree (another session's,
or yours not yet committed) would be written into the baseline unseen. --update <pages> is the normal path;
--write --force overrides the guard when you have checked every page it will rewrite.
"""
import hashlib, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'PORT-BASELINE.json')


def pages():
    out = []
    for top in ('settlements', 'kits', 'biomes', 'openworld'):
        d = os.path.join(ROOT, top)
        for name in sorted(os.listdir(d)):
            dist = os.path.join(d, name, 'dist')
            if os.path.isdir(dist):
                for f in sorted(os.listdir(dist)):
                    if f.endswith('.html'):
                        out.append(os.path.relpath(os.path.join(dist, f), ROOT))
            elif os.path.isfile(os.path.join(d, name, 'build.py')):
                # no dist/: the build writes its pages beside build.py (the Voth lineage)
                for f in sorted(os.listdir(os.path.join(d, name))):
                    if f.endswith('.html') and not f.startswith('.'):
                        out.append(os.path.relpath(os.path.join(d, name, f), ROOT))
    ex = os.path.join(ROOT, 'kits', 'post-apoc', 'sockets-example')
    if os.path.isdir(ex):
        out += [os.path.relpath(os.path.join(ex, f), ROOT) for f in sorted(os.listdir(ex)) if f.endswith('.html')]
    return [p.replace(os.sep, '/') for p in out]   # the baseline's keys use '/'; relpath gives '\' on Windows


def read_lf(path):
    """A page's bytes with CRLF as LF: a Windows checkout (core.autocrlf) builds CRLF pages from CRLF fragments, and
    the same page built from LF fragments must hash the same. On an LF checkout this changes nothing."""
    with open(path, 'rb') as fh:
        return fh.read().replace(b'\r\n', b'\n')


def sha(path):
    return hashlib.sha256(read_lf(path)).hexdigest()


def main(argv):
    if '--update' in argv:   # rewrite only the named pages' entries (pages you rebuilt and verified), keep every other
        names = [a.replace(os.sep, '/') for a in argv[argv.index('--update') + 1:] if not a.startswith('--')]
        base = json.load(open(OUT))['pages']
        for n in names:
            f = os.path.join(ROOT, n)
            if not os.path.isfile(f):
                print('no page %s' % n); return 1
            if buildlib.is_pointer(f):
                print('%s is a Git LFS pointer, not a page built here: %s' % (n, buildlib.pull_hint([n]))); return 1
            old = base.get(n, {}).get('bytes')
            base[n] = {'sha256': sha(f), 'bytes': len(read_lf(f))}
            print('updated  %s  (%s -> %d bytes)' % (n, old, base[n]['bytes']))
        json.dump({'what': 'SHA-256 of every built page; tools/port_baseline.py', 'pages': base},
                  open(OUT, 'w'), indent=1, sort_keys=True)
        return 0
    ptr = {p: buildlib.pointer_oid(os.path.join(ROOT, p)) for p in pages() if buildlib.is_pointer(os.path.join(ROOT, p))}
    now = {p: {'sha256': sha(os.path.join(ROOT, p)), 'bytes': len(read_lf(os.path.join(ROOT, p)))} for p in pages() if p not in ptr}
    if '--write' in argv:
        if '--force' not in argv:
            pg = set(pages())
            other = [f for f in buildlib.git_status() if f not in pg and f != 'PORT-BASELINE.json'
                     and not f.endswith('/' + buildlib.MANIFEST)]
            if ptr or other:
                if ptr:
                    print('--write refused: %d page(s) are Git LFS pointers (%s); run %s, or use --update <pages>'
                          % (len(ptr), ', '.join(sorted(ptr)[:3]), buildlib.pull_hint(sorted(ptr))))
                if other:
                    print('--write refused: git status shows %d change(s) outside the pages (%s); commit or set them '
                          'aside, or use --update <pages> (--force if you have checked every page)' % (len(other), ', '.join(other[:5])))
                return 1
        if os.path.isfile(OUT) and '--prune' not in argv:
            kept = {p: v for p, v in json.load(open(OUT))['pages'].items() if p not in now}
            if kept:
                print('kept %d entries for pages not built here (--prune drops them)' % len(kept))
            now.update(kept)
        json.dump({'what': 'SHA-256 of every built page; tools/port_baseline.py', 'pages': now},
                  open(OUT, 'w'), indent=1, sort_keys=True)
        print('wrote %s: %d pages' % (os.path.relpath(OUT, ROOT), len(now)))
        return 0
    if not os.path.isfile(OUT):
        print('no PORT-BASELINE.json; run with --write'); return 1
    base = json.load(open(OUT))['pages']
    bad = missing = 0
    notbuilt = 0
    for p in sorted(set(base) | set(now) | set(ptr)):
        if p in ptr:
            if p in base and ptr[p] and ptr[p] != base[p]['sha256']:
                # the pointer's oid is the raw page's hash; the baseline's is of the LF page (the same for an LF page)
                print('NOT BUILT HERE (LFS pointer; its oid differs from the baseline)  %s' % p)
            else:
                print('NOT BUILT HERE (LFS pointer)  %s' % p)
            notbuilt += 1
        elif p not in base:
            print('NEW      %s' % p); bad += 1
        elif p not in now:
            print('MISSING  %s' % p); missing += 1
        elif base[p]['sha256'] != now[p]['sha256']:
            print('CHANGED  %s  (%d -> %d bytes)' % (p, base[p]['bytes'], now[p]['bytes'])); bad += 1
    print('%d pages, %d differ from the baseline, %d not built here, %d LFS pointers (git lfs pull to check them)'
          % (len(now), bad, missing, notbuilt))
    return 1 if bad or missing else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
