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
  DOCS-ONLY <command>   (item 24) every reason is a doc the build reads only to print a count (KNOWN_ISSUES.md, PORT.md) or a
                        listing of a folder the build read no fragment from (tools/: Python lists every folder on its import
                        path). Printed as "docs/listing only: rebuild, bytes unchanged" and never a ratchet failure: rebuild
                        at the next turn, nobody needs to chase it. A listing of a folder the build reads fragments from
                        (src/, core/water/) stays STALE: a fragment added there may be on the page.
                        Also DOCS-ONLY (BUGS-2026-11-15.md T7, ten sessions chased these):
                          - a `.py` input whose change is only to its docstrings and comments (its syntax tree is the
                            same; the old text is found in git by the recorded hash);
                          - in a manifest written before 2026-11-15 (no "listed_by"), the listing of a folder the run
                            imported a module from, when no module it read there lists a folder: Python's importer
                            listed it (one new file in core/host staled 87 builds). Manifests written since record only
                            the build's own listings, and those stay STALE.
The fix for each is `python3 tools/build.py <build> [args]`, then commit the pages and build-inputs.json together.

The baseline is the ratchet of tools/ratchet.py. A core change that leaves pages for their own rebuild turn on purpose
(the biome rebuild's "ride along") records that with --write-baseline and says so in its commit message.
"""
import ast, hashlib, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib, ratchet  # noqa: E402

ROOT = buildlib.ROOT
_hash = {}
LINTS = ('tools/check_',)   # a build runs tools/check_port.py as a lint; it writes no page bytes, so a change to it moves none
PAGES = ('.html', '.js')
DOCS = ('KNOWN_ISSUES.md', 'PORT.md')   # item 24: read for a printed count, never put on the page
QUIET_EXT = ('.py', '.pyc', '.md')      # a folder whose only inputs are these is on the import path, not a fragment folder
QUIET = 'docs/listing only: rebuild, bytes unchanged'


def quiet_listing(d, inputs):
    """A folder listing that cannot move page bytes: the run read no file in it but Python, notes and lints."""
    pre = (d + '/') if d else ''
    for p in inputs:
        if p.startswith(pre) and '/' not in p[len(pre):] and not (p.endswith(QUIET_EXT) or p.startswith(LINTS)):
            return False
    return True   # UNRECORDED looks at pages and bundles; a build's own bookkeeping (build-manifest.json) is not one


LISTS = re.compile(r'\b(listdir|scandir|glob|iglob|walk|iterdir|rglob)\b')
GIT_DEPTH = 60   # how far back git is searched for the text a recorded hash stands for
_lists_py, _old = {}, {}


def import_listing(d, inputs):
    """The listing of `d` is Python's importer's, in a manifest from before the hook skipped those: the run read a module
    in `d` and none of the modules it read there lists a folder (core/host/host.py names its fragments)."""
    pre = (d + '/') if d else ''
    mods = [p for p in inputs if p.startswith(pre) and '/' not in p[len(pre):] and p.endswith('.py')]
    if not mods:
        return False
    for p in mods:
        if p not in _lists_py:
            try:
                with open(os.path.join(ROOT, p), encoding='utf-8', errors='replace') as fh:
                    _lists_py[p] = bool(LISTS.search(fh.read()))
            except OSError:
                _lists_py[p] = True
        if _lists_py[p]:
            return False
    return True


def _git(args):
    try:
        r = subprocess.run(['git'] + args, cwd=ROOT, capture_output=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout if r.returncode == 0 else None


def old_text(p, v):
    """The text of `p` whose buildlib.file_hash is `v`, from the last GIT_DEPTH commits that touched it; None if not found."""
    if (p, v) not in _old:
        _old[(p, v)] = None
        log = _git(['log', '--format=%H', '-n', str(GIT_DEPTH), '--', p])
        for c in (log or b'').decode().split():
            data = _git(['show', '%s:%s' % (c, p)])
            if data is None:
                continue
            if hashlib.sha256(data.replace(b'\r\n', b'\n')).hexdigest() == v:
                _old[(p, v)] = data.decode('utf-8', 'replace')
                break
    return _old[(p, v)]


def _code_tree(text):
    """The syntax tree with every docstring dropped (comments are not in it): what the module does."""
    t = ast.parse(text)
    for n in ast.walk(t):
        if isinstance(n, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and n.body:
            b = n.body[0]
            if isinstance(b, ast.Expr) and isinstance(getattr(b, 'value', None), ast.Constant) and isinstance(b.value.value, str):
                n.body = n.body[1:] or [ast.Pass()]
    return ast.dump(t, include_attributes=False)


def docs_only_py(p, v):
    """A `.py` input changed only in its docstrings and comments (its old text found in git by the recorded hash)."""
    if not p.endswith('.py'):
        return False
    old = old_text(p, v)
    if old is None:
        return False
    try:
        with open(os.path.join(ROOT, p), encoding='utf-8') as fh:
            return _code_tree(fh.read()) == _code_tree(old)
    except (OSError, SyntaxError, ValueError):
        return False


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
        why, loud = [], 0
        for p, v in run.get('inputs', {}).items():
            if p.startswith(LINTS):
                continue
            now = h(p)
            if now != v:
                quiet = bool(now) and (os.path.basename(p) in DOCS or docs_only_py(p, v))
                why.append(('changed  ' if now else 'gone     ') + p + ('  (docstrings or comments only)' if quiet and p.endswith('.py') else ''))
                loud += not quiet
        outs = set(run.get('outputs', {}))
        trusted = run.get('listed_by') == 'code'   # written since the hook skips the importer's listings
        for d, v in run.get('listings', {}).items():
            if buildlib.listing_hash(d, outs) != v:
                imp = not trusted and import_listing(d, run.get('inputs', {}))
                why.append('listing  %s/ (a file added or removed%s)' % (d, '; an import-path listing' if imp else ''))
                loud += not (imp or quiet_listing(d, run.get('inputs', {})))
        if why:
            out.append(('%s: %s %s' % (build, 'STALE' if loud else 'DOCS-ONLY', cmd), why if loud else [QUIET] + why, line))
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
    quiet = [(k, why, line) for k, why, line in found if ': DOCS-ONLY ' in k]
    found = [f for f in found if ': DOCS-ONLY ' not in f[0]]
    if quiet and '--commands' not in argv:
        print('check_stale: %d docs/listing only (rebuild at the next turn, bytes unchanged; not a failure)%s' % (
            len(quiet), ':' if '--list' in argv or names else ' (--list names them)'))
        if '--list' in argv or names:
            for k, why, line in quiet:
                print('quiet ' + k)
                for w in why[1:6]:
                    print('    ' + w)
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
