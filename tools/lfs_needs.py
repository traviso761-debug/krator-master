#!/usr/bin/env python3
"""Every Git LFS file a build or a node test reads, pulled in one go (CORE-IMPROVEMENTS.md item 23; the 2026-11-11 survey:
ten sessions found the pointers one at a time, and not only their own: a page reads other kits' tex/ packs in place, a
node test requires another build's dist/ bundle).

    python3 tools/lfs_needs.py biomes/rift                  # list what is still a pointer, and the one pull command
    python3 tools/lfs_needs.py biomes/rift --pull           # run that pull
    python3 tools/lfs_needs.py biomes/rift --pages          # also the build's own committed pages (to verify them unbuilt)
    python3 tools/lfs_needs.py --test settlements/isle-demo/tests/test-isle-city.js [--pull]   # what a node test requires
    python3 tools/lfs_needs.py biomes/rift --no-list        # skip `build.py --list-sources` (manifest and source scan only)

What a build reads, from:
  - its own tex/;
  - every input its build-inputs.json recorded (the last tools/build.py run), bundles from other builds included;
  - `build.py --list-sources` (tools/build_sources.py), when the build takes it, and the `needs` of each listed fragment in
    tools/fragment_needs.json;
  - the tex/ and dist/ folders its sources name by path (a page that reads another kit's pack in place: Locus reads
    motor-vehicles', a rim station four neighbours').
Only files that are still pointers are listed. The command is one `git lfs pull --include=...`; `git lfs checkout` restores
from the local store with no network when the objects are already fetched (a cloud lane). Exit 1 when something is
still a pointer (and not pulled), 0 when nothing is.
"""
import glob, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib  # noqa: E402

ROOT = buildlib.ROOT
TOPS = ('settlements', 'kits', 'biomes', 'openworld', 'core')
# a repo path to a tex/ or dist/ folder inside a source: kits/motor-vehicles/tex/, ../../biomes/yeti/dist/
PATH_RE = re.compile(r'((?:settlements|kits|biomes|openworld|core)/[\w.-]+(?:/[\w.-]+)*?/(?:tex|dist))(?:/|\b)')
# a node test's bundle: 'dist/x.js', or path.join(..., 'dist', 'x.js') with the folders before it
JOIN_RE = re.compile(r'''path\.(?:join|resolve)\(([^()]*?['"]dist['"]\s*,\s*['"][\w.-]+\.js['"])''')
STR_RE = re.compile(r'''['"]([\w./-]+)['"]''')
SLASH_RE = re.compile(r'''['"]((?:[\w.-]+/)*dist/[\w.-]+\.js)['"]''')


def _rel(p, root):
    return os.path.relpath(p, root).replace(os.sep, '/')


def _is_ptr(p, root):
    return buildlib.is_pointer(os.path.join(root, p))


def _folder_files(d, root):
    """The files of a tex/ folder (every file, recursively) or a dist/ folder (its *.js bundles)."""
    full = os.path.join(root, d)
    if not os.path.isdir(full):
        return []
    if d.endswith('/dist'):
        return [_rel(f, root) for f in glob.glob(os.path.join(full, '*.js'))]
    out = []
    for dp, _, fs in os.walk(full):
        out += [_rel(os.path.join(dp, f), root) for f in fs]
    return out


def list_sources(build, root=ROOT, timeout=300):
    """`build.py --list-sources` as repo paths ([] when the build does not take it or it fails)."""
    bp = os.path.join(root, build, 'build.py')
    if not os.path.isfile(bp):
        return []
    with open(bp, encoding='utf-8', errors='replace') as fh:
        if 'build_sources' not in fh.read():
            return []
    try:
        r = subprocess.run([sys.executable, 'build.py', '--list-sources'], cwd=os.path.join(root, build), capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=timeout,
                           env=dict(os.environ, KRATOR_ALLOW_PLAIN_BUILD='1'))
    except (OSError, subprocess.TimeoutExpired):
        return []
    if r.returncode != 0:
        return []
    return [ln.split('\t')[0].strip() for ln in r.stdout.splitlines() if ln.strip() and not ln.startswith(' ')]


def build_reads(build, root=ROOT, use_list=True, pages=False):
    """{repo path: why} of every file the build reads that could be in LFS (not filtered to pointers yet)."""
    build = build.replace(os.sep, '/').rstrip('/')
    out = {}

    def add(p, why):
        out.setdefault(p, why)

    for p in _folder_files(build + '/tex', root):
        add(p, 'its tex/')
    man = os.path.join(root, build, buildlib.MANIFEST)
    srcs = set()
    if os.path.isfile(man):
        with open(man, encoding='utf-8') as fh:
            m = json.load(fh)
        for run in m.get('runs', {}).values():
            for p in run.get('inputs', {}):
                add(p, 'build-inputs.json')
                srcs.add(p)
    if use_list:
        for p in list_sources(build, root):
            if os.path.isfile(os.path.join(root, p)):
                add(p, '--list-sources')
                srcs.add(p)
    needs_file = os.path.join(root, 'tools', 'fragment_needs.json')
    if os.path.isfile(needs_file):
        with open(needs_file, encoding='utf-8') as fh:
            needs = json.load(fh).get('fragments', {})
        for p in list(srcs):
            for n in needs.get(p, {}).get('needs', []):
                add(n, 'fragment_needs.json (%s)' % p)
                srcs.add(n)
    # what the sources name by path: another build's tex/ or dist/ read in place
    scan = set(srcs)
    for part in ('src', 'targets', 'stations'):
        scan.update(_rel(f, root) for f in glob.glob(os.path.join(root, build, part, '**', '*.js'), recursive=True))
    scan.add(build + '/build.py')
    for p in sorted(scan):
        if not p.endswith(('.js', '.py', '.html', '.json')) or _is_ptr(p, root):
            continue
        try:
            with open(os.path.join(root, p), encoding='utf-8', errors='replace') as fh:
                text = fh.read()
        except OSError:
            continue
        for d in sorted(set(PATH_RE.findall(text))):
            for f in _folder_files(d, root):
                add(f, 'named in %s' % p)
    if pages:
        for f in glob.glob(os.path.join(root, build, 'dist', '*.html')) + glob.glob(os.path.join(root, build, '*.html')):
            add(_rel(f, root), 'its page')
    return out


def test_reads(test, root=ROOT):
    """{repo path: why} of the dist/ bundles a node test requires."""
    test = test.replace(os.sep, '/')
    with open(os.path.join(root, test), encoding='utf-8', errors='replace') as fh:
        text = fh.read()
    here = os.path.dirname(test)
    own = here[:-len('/tests')] if here.endswith('/tests') else here
    out = {}
    wants = []   # (folders named before 'dist', file name)
    for args in JOIN_RE.findall(text):
        s = STR_RE.findall(args)
        wants.append(([x for x in s[:-2] if x not in ('..', '.')], s[-1]))
    for s in SLASH_RE.findall(text):
        parts = s.split('/')
        wants.append(([x for x in parts[:-2] if x not in ('..', '.')], parts[-1]))
    for folders, name in wants:
        cands = [own + '/dist/' + name] if os.path.isfile(os.path.join(root, own, 'dist', name)) else []
        if folders or not cands:
            found = []
            for top in TOPS:
                found += [_rel(f, root) for f in glob.glob(os.path.join(root, top, '**', 'dist', name), recursive=True)]
            found = [f for f in found if all(('/' + x + '/') in ('/' + f) for x in folders)] or found
            cands = found[:1] if folders else (cands or found[:1])
        for c in cands:
            out.setdefault(c, 'required by ' + test)
    return out


def pointers(reads, root=ROOT):
    return sorted(p for p in reads if _is_ptr(p, root))


def include(paths):
    """The --include list: a whole tex/ folder as <folder>/**, a bundle or page by name."""
    pats = set()
    for p in paths:
        m = re.match(r'(.*?/tex)/', p)
        pats.add(m.group(1) + '/**' if m else p)
    return sorted(pats)


def pull_command(paths):
    return 'git lfs pull --include="%s"' % ','.join(include(paths))


def main(argv):
    if not argv or argv[0] in ('-h', '--help'):
        print(__doc__)
        return 2
    pos = [a for i, a in enumerate(argv) if not a.startswith('--') and not (i and argv[i - 1] == '--test')]
    if '--test' in argv:
        t = argv[argv.index('--test') + 1]
        reads, what = test_reads(t), t
    elif pos:
        reads, what = build_reads(pos[0], use_list='--no-list' not in argv, pages='--pages' in argv), pos[0]
    else:
        print(__doc__)
        return 2
    ptr = pointers(reads)
    print('lfs_needs: %s reads %d LFS-tracked file(s) that could be pointers; %d still are' % (what, len(reads), len(ptr)))
    for p in ptr:
        print('  pointer  %s  (%s)' % (p, reads[p]))
    if not ptr:
        return 0
    cmd = pull_command(ptr)
    print(cmd)
    if '--pull' in argv:
        r = subprocess.run(['git', 'lfs', 'pull', '--include=' + ','.join(include(ptr))], cwd=ROOT)
        left = pointers(reads)
        print('lfs_needs: pulled; %d still a pointer' % len(left))
        return 1 if r.returncode or left else 0
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
