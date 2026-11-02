#!/usr/bin/env python3
"""Pages behind their sources, without building anything (CORE-IMPROVEMENTS.md 5b; the rule CLAUDE.md calls "rebuild
what a shared change reaches").

    python3 tools/check_stale.py               # fail on a finding not in tools/check_stale_baseline.json
    python3 tools/check_stale.py --list        # every finding, baselined or not, with its reasons
    python3 tools/check_stale.py biomes/rift   # one build
    python3 tools/check_stale.py --commands    # print the rebuild command for every finding and exit 0

It reads each build's build-inputs.json (written by tools/build.py; tools/buildlib.py has its shape), hashes the inputs
and folders each build command recorded, and compares them with the tree. It reads no page bytes beyond a hash (a
pointer page counts as the oid it stands for, so CI's pointer checkout checks the same). Findings:
  STALE <command>       an input changed, vanished, or a folder it listed gained or lost a file since the page was built
  UNRECORDED <command>  an output page or bundle (.html, .js) differs from what the build wrote: rebuilt with a plain `python3 build.py` (or edited)
                        after the manifest was written. Rebuild with tools/build.py so the manifest is current
  NO-MANIFEST           a build with no build-inputs.json yet
The fix for each is `python3 tools/build.py <build> [args]`, then commit the pages and build-inputs.json together.

The baseline is the ratchet of tools/ratchet.py. A core change that leaves pages for their own rebuild turn on purpose
(the biome rebuild's "ride along") records that with --write-baseline and says so in its commit message.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib, ratchet  # noqa: E402

ROOT = buildlib.ROOT
_hash = {}
LINTS = ('tools/check_',)   # a build runs tools/check_port.py as a lint; it writes no page bytes, so a change to it moves none
PAGES = ('.html', '.js')   # UNRECORDED looks at pages and bundles; a build's own bookkeeping (build-manifest.json) is not one


def h(p):
    if p not in _hash:
        a = os.path.join(ROOT, p)
        _hash[p] = buildlib.file_hash(a) if os.path.isfile(a) else None
    return _hash[p]


def check(build):
    """[(key, reasons, command)] for one build."""
    m = buildlib.load_manifest(build)
    if m is None:
        return [('%s: NO-MANIFEST' % build, ['no %s/%s: python3 tools/build.py %s' % (build, buildlib.MANIFEST, build)],
                 'python3 tools/build.py %s' % build)]
    out = []
    for cmd, run in sorted(m.get('runs', {}).items()):
        args = cmd.split()
        line = 'python3 tools/build.py %s%s%s' % (build, '' if args[0] == 'build.py' else ' --script ' + args[0],
                                                   (' ' + ' '.join(args[1:])) if args[1:] else '')
        why = []
        for p, v in run.get('inputs', {}).items():
            if p.startswith(LINTS):
                continue
            now = h(p)
            if now != v:
                why.append(('changed  ' if now else 'gone     ') + p)
        outs = set(run.get('outputs', {}))
        for d, v in run.get('listings', {}).items():
            if buildlib.listing_hash(d, outs) != v:
                why.append('listing  %s/ (a file added or removed)' % d)
        if why:
            out.append(('%s: STALE %s' % (build, cmd), why, line))
            continue
        raw = run.get('outputs_raw', {})
        moved = [p for p, v in run.get('outputs', {}).items() if p.endswith(PAGES) and (raw.get(p) != buildlib.pointer_oid(os.path.join(ROOT, p)) if buildlib.is_pointer(os.path.join(ROOT, p))
                     else h(p) != v)]
        if moved:
            out.append(('%s: UNRECORDED %s' % (build, cmd), ['output differs from the recorded build: ' + p for p in moved], line))
    return out


def main(argv):
    names = [a.rstrip('/').replace(os.sep, '/') for a in argv if not a.startswith('--')]
    builds = names or buildlib.build_dirs()
    found = []
    for b in builds:
        found += check(b)
    if '--commands' in argv:
        for k, why, line in found:
            print('%-60s %s' % (k, line))
        return 0
    findings = {k: 1 for k, _, _ in found}
    detail = {k: why[:20] + (['... %d more' % (len(why) - 20)] if len(why) > 20 else []) + ['fix: ' + line]
              for k, why, line in found}
    if names:   # one build: compare against its part of the baseline only
        base = ratchet.load('check_stale')
        bad = [k for k in findings if k not in base]
        for k, why, line in found:
            print(('FAIL  ' if k in bad else 'known ') + k)
            for w in detail[k][:12]:
                print('    ' + w)
        print('check_stale: %d finding(s), %d new' % (len(found), len(bad)))
        return 1 if bad else 0
    return ratchet.main('check_stale', findings, argv, detail)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
