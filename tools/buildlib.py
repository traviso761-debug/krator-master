"""What every build shares on the Python side: Git LFS pointer refusal, the page-size cap, the input manifest
(CORE-IMPROVEMENTS.md items 2a, 3a, 3d, 5a). Tools import it; `tools/build.py` runs a build through it.

LFS pointers (2a). A fresh worktree holds 130-byte pointer files for the texture packs, the library and the pages until
`git lfs pull`. A build that packs a pointer writes a page whose surfaces are black and whose verify passes. So:
  is_pointer(path)        True for a file that starts with `version https://git-lfs`
  pointer_oid(path)       the sha256 a pointer stands for (None for a real file)
  refuse_pointer(path)    exit with the `git lfs pull --include=...` to run
  refusable(path)         a pointer read that must be refused: anything but a page or a bundle (dist/*.js, *.html),
                          which is an OUTPUT (CI checks pages out as pointers and rebuilds them)
  preflight(build)        the pointers a build is about to read: its tex/, and every input its last manifest lists.
                          tools/check_port.py calls it, so every plain `python3 build.py` refuses them too

The page cap (3a): the gallery's file limit is 16 MB. check_size(path) fails above the build's cap (BUDGETS.json
"pages", default 16 MB) and warns above 90%, so the split is planned, not discovered.

The input manifest (5a): `build-inputs.json` in each build folder, written by `tools/build.py` from what the build
actually opened (an audit hook in every Python process the build starts: tools/_inputs/sitecustomize.py). One entry per
build command (`build.py`, `build.py --station kipuka`, `build_hero.py`):
  inputs    repo path -> sha256 of the bytes (an LFS pointer counts as the oid it stands for)
  listings  repo dir -> sha256 of its sorted entry names (a fragment added to src/ is a change), see listing_hash
  outputs   repo path -> sha256 of what the build wrote, CRLF read as LF (file_hash)
  outputs_raw  the same, of the raw bytes: what an output's LFS pointer oid is once committed (a CI checkout)
Paths use '/'. Node's own reads are not seen (a build's `node --check` reads only what the build wrote).
"""
import hashlib, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = 'build-inputs.json'
POINTER = b'version https://git-lfs'
PAGE_CAP = 16 * 1024 * 1024        # the gallery's file limit (gallery/README.md)
WARN_AT = 0.9
SKIP_DIRS = ('.git', '__pycache__', 'node_modules', 'shots', '.claude')


def rel(path):
    """Repo-relative path with '/', or None outside the repo."""
    try:
        r = os.path.relpath(os.path.abspath(path), ROOT)
    except ValueError:                    # another drive on Windows
        return None
    if r.startswith('..'):
        return None
    return r.replace(os.sep, '/')


def is_pointer(path):
    try:
        if os.path.getsize(path) > 1024:
            return False
        with open(path, 'rb') as fh:
            return fh.read(len(POINTER)) == POINTER
    except OSError:
        return False


def pointer_oid(path):
    if not is_pointer(path):
        return None
    with open(path, 'rb') as fh:
        m = re.search(rb'oid sha256:([0-9a-f]{64})', fh.read(1024))
    return m.group(1).decode() if m else None


def refusable(r):
    """A repo path whose pointer must not be read as data: textures, the library, anything but an output page or bundle."""
    return not (r.endswith('.html') or ('/dist/' in r and r.endswith('.js')))


def pull_hint(paths):
    dirs = sorted({os.path.dirname(p) + '/*' for p in paths})
    return 'git lfs pull --include="%s"' % ','.join(dirs[:12])


def refuse_pointer(path, who='build'):
    r = rel(path) or path
    sys.exit('%s: %s is a Git LFS pointer, not the file (a checkout without `git lfs pull`); a page built from it has '
             'black surfaces. Run: %s' % (who, r, pull_hint([r])))


def file_hash(path):
    """sha256 of a file as Git stores it: an LFS pointer counts as its oid; a text file is hashed with CRLF as LF (a
    Windows build writes CRLF pages, port_baseline.read_lf does the same); a binary (a NUL in its first 8 KB) raw,
    so it matches the oid of its pointer in a checkout without it."""
    oid = pointer_oid(path)
    if oid:
        return oid
    with open(path, 'rb') as fh:
        data = fh.read()
    if b'\0' not in data[:8192]:
        data = data.replace(b'\r\n', b'\n')
    return hashlib.sha256(data).hexdigest()


def raw_hash(path):
    """sha256 of the bytes as they are (an LFS pointer: its oid). An output's raw hash is what its pointer's oid will be
    once the page is committed, so check_stale can compare a pointer checkout (CI) with the build that wrote it."""
    oid = pointer_oid(path)
    if oid:
        return oid
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def listing_hash(d, outputs=()):
    """The sorted names in a directory, without dot files, caches, the manifest, and what the build itself writes
    (an output, or a directory holding one), so building twice lists the same."""
    try:
        names = os.listdir(os.path.join(ROOT, d))
    except OSError:
        return None
    outs = set(outputs)
    keep = []
    for n in sorted(names):
        p = (d + '/' + n) if d else n
        if n.startswith('.') or n in SKIP_DIRS or n == MANIFEST or n.endswith('.pyc'):
            continue
        if p in outs or any(o.startswith(p + '/') for o in outs):
            continue
        keep.append(n)
    return hashlib.sha256('\n'.join(keep).encode('utf-8')).hexdigest()


def load_manifest(build):
    p = os.path.join(ROOT, build, MANIFEST)
    if not os.path.isfile(p):
        return None
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def write_manifest(build, command, run):
    m = load_manifest(build) or {}
    runs = m.get('runs', {})
    runs[command] = run
    out = {'what': 'the inputs each build command read and the pages it wrote; tools/build.py writes it, '
                   'tools/check_stale.py and tools/reach.py read it (tools/buildlib.py)',
           'runs': dict(sorted(runs.items()))}
    with open(os.path.join(ROOT, build, MANIFEST), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(out, fh, indent=1, sort_keys=False)
        fh.write('\n')


def budgets(build):
    p = os.path.join(ROOT, build, 'BUDGETS.json')
    if not os.path.isfile(p):
        return {}
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def page_cap(build, page):
    """The cap for one page: BUDGETS.json "pages" {<page file name>: {"bytes": n, "why": ..., "raised": ...}}, then
    the build's "*" entry, then 16 MB (the shape tools/harness.py verify_page reads too: tris, calls, bytes)."""
    b = budgets(build).get('pages', {})
    for key in (os.path.basename(page), '*'):
        e = b.get(key)
        if e and e.get('bytes') is not None:
            return e['bytes']
    return PAGE_CAP


def check_size(build, page):
    """(level, message): level 'fail' over the cap, 'warn' over 90% of it, None otherwise. A pointer is not checked."""
    if is_pointer(page) or not os.path.isfile(page):
        return None, ''
    n, cap = os.path.getsize(page), page_cap(build, page)
    r = rel(page) or page
    if n > cap:
        return 'fail', '%s is %.2f MB, over its cap of %.2f MB (split it, or raise the cap in %s/BUDGETS.json with a why)' % (
            r, n / 2 ** 20, cap / 2 ** 20, build)
    if n > WARN_AT * cap:
        return 'warn', '%s is %.2f MB, %d%% of its %.2f MB cap: plan the split now' % (r, n / 2 ** 20, 100 * n / cap, cap / 2 ** 20)
    return None, ''


def preflight(build):
    """The LFS pointers a build would read: its tex/ and the inputs its manifest recorded. [] when there are none."""
    bad = []
    tex = os.path.join(ROOT, build, 'tex')
    if os.path.isdir(tex):
        for d, _, fs in os.walk(tex):
            bad += [rel(os.path.join(d, f)) for f in fs if is_pointer(os.path.join(d, f))]
    m = load_manifest(build) or {}
    for run in m.get('runs', {}).values():
        for p in run.get('inputs', {}):
            if refusable(p) and is_pointer(os.path.join(ROOT, p)):
                bad.append(p)
    return sorted(set(bad))


def build_dirs():
    out = []
    for top in ('settlements', 'kits', 'biomes', 'openworld'):
        d = os.path.join(ROOT, top)
        out += ['%s/%s' % (top, n) for n in sorted(os.listdir(d)) if os.path.isfile(os.path.join(d, n, 'build.py'))]
    return out


def git_status():
    """Paths git reports as changed or untracked (repo-relative, '/')."""
    r = subprocess.run(['git', 'status', '--porcelain', '-uall'], cwd=ROOT, stdout=subprocess.PIPE, text=True,
                       encoding='utf-8', errors='replace')
    out = []
    for ln in r.stdout.splitlines():
        p = ln[3:]
        if ' -> ' in p:
            p = p.split(' -> ', 1)[1]
        out.append(p.strip('"'))
    return out
