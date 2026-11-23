#!/usr/bin/env python3
"""tools/check_stale.py's false alarms (BUGS-2026-11-15.md T7: ten sessions chased them), each with its negative control, on a
made-up build in a throwaway git repo:
  - the audit hook (tools/_inputs/sitecustomize.py) records the folders a build lists, not the ones Python's importer lists;
  - an old manifest's listing of a folder the build only imported from (core/host) is DOCS-ONLY when a file is added there;
    a fragment folder's listing (src/), a folder whose module lists folders, and a listing in a manifest written since the
    hook fix stay STALE;
  - a `.py` input changed only in its docstrings or comments is DOCS-ONLY; a change to its code is STALE.

    python3 tools/tests/test_check_stale.py
"""
import json, os, shutil, stat, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
sys.path.insert(0, TOOLS)
import buildlib, check_stale  # noqa: E402

checks = []


def ok(name, cond):
    checks.append((name, bool(cond)))


def put(root, rel, text):
    p = os.path.join(root, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def git(root, *args):
    subprocess.run(['git', '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false'] + list(args), cwd=root,
                   check=True, capture_output=True)


HELPER = '"""A helper the build imports."""\nimport os\n\n\ndef frag():\n    """The fragment it names."""\n    return "10-a.js"  # by name\n'


def manifest(root, listed_by=None, helper='kits/fake/mod/helper.py'):
    B = 'kits/fake'
    inputs = {p: buildlib.file_hash(os.path.join(root, p)) for p in (helper, B + '/mod/90-host.js', B + '/src/10-a.js')}
    run = {'inputs': inputs, 'listings': {d: buildlib.listing_hash(d) for d in (B + '/mod', B + '/src')}, 'outputs': {}, 'outputs_raw': {}}
    if listed_by:
        run['listed_by'] = listed_by
    put(root, B + '/' + buildlib.MANIFEST, json.dumps({'runs': {'build.py': run}}))


def verdict(root):
    """'STALE', 'DOCS-ONLY' or 'clean' for the made-up build, as check_stale reads it now."""
    check_stale._hash.clear(); check_stale._old.clear(); check_stale._lists_py.clear()
    found = check_stale.check('kits/fake')
    if not found:
        return 'clean', []
    k, why, _ = found[0]
    return ('STALE' if ': STALE ' in k else 'DOCS-ONLY' if ': DOCS-ONLY ' in k else k), why


def rmtree(d):
    """shutil.rmtree that also takes git's read-only object files on Windows."""
    def again(fn, path, *_):
        os.chmod(path, stat.S_IWRITE)
        fn(path)
    try:
        shutil.rmtree(d, onexc=again)
    except TypeError:   # Python < 3.12
        shutil.rmtree(d, onerror=again)


def fresh(root, helper_text=HELPER, listed_by=None):
    if os.path.isdir(root):
        rmtree(root)
    os.makedirs(root)
    put(root, 'kits/fake/build.py', '# a build\n')
    put(root, 'kits/fake/mod/helper.py', helper_text)
    put(root, 'kits/fake/mod/90-host.js', 'const host=1;\n')   # a fragment the build reads by name, as core/host's
    put(root, 'kits/fake/src/10-a.js', 'const a=1;\n')
    git(root, 'init', '-q')
    git(root, 'add', '-A')
    git(root, 'commit', '-q', '-m', 'start')
    manifest(root, listed_by)


def test_manifests(base):
    root = os.path.join(base, 'repo')
    old_c, old_b = check_stale.ROOT, buildlib.ROOT
    check_stale.ROOT = buildlib.ROOT = root
    try:
        fresh(root)
        ok('negative control: nothing changed reads clean', verdict(root)[0] == 'clean')
        put(root, 'kits/fake/mod/95z-new.js', '')
        v, why = verdict(root)
        ok('a new file beside a module the build only imported (an old manifest) is DOCS-ONLY', v == 'DOCS-ONLY' and any('import-path listing' in w for w in why))
        os.remove(os.path.join(root, 'kits', 'fake', 'mod', '95z-new.js'))
        put(root, 'kits/fake/src/11-b.js', 'const b=2;\n')
        ok('negative control: a new fragment in src/ is STALE', verdict(root)[0] == 'STALE')

        fresh(root, HELPER.replace('import os\n', 'import os\nFRAGS = sorted(os.listdir(os.path.dirname(__file__)))\n'))
        put(root, 'kits/fake/mod/95z-new.js', '')
        ok('negative control: a new file beside a module that lists folders is STALE', verdict(root)[0] == 'STALE')

        fresh(root, listed_by='code')
        put(root, 'kits/fake/mod/95z-new.js', '')
        ok('negative control: in a manifest written since the hook fix, a listing change is STALE', verdict(root)[0] == 'STALE')

        fresh(root)
        put(root, 'kits/fake/mod/helper.py', HELPER.replace('A helper the build imports.', 'A helper the build imports, reworded.')
            .replace('# by name', '# by its name'))
        v, why = verdict(root)
        ok('a .py input changed only in its docstrings and comments is DOCS-ONLY', v == 'DOCS-ONLY' and any('docstrings or comments only' in w for w in why))
        put(root, 'kits/fake/mod/helper.py', HELPER.replace('"10-a.js"', '"10-b.js"'))
        ok('negative control: a .py input whose code changed is STALE', verdict(root)[0] == 'STALE')
        put(root, 'kits/fake/mod/helper.py', HELPER.replace('    """The fragment it names."""\n', ''))
        ok('...removing a docstring is DOCS-ONLY too', verdict(root)[0] == 'DOCS-ONLY')
        git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 'later')
        manifest(root)
        put(root, 'kits/fake/mod/helper.py', HELPER + '\nX = 1\n')
        ok('negative control: code added after a later commit is STALE (the old text is found at the right commit)', verdict(root)[0] == 'STALE')
    finally:
        check_stale.ROOT, buildlib.ROOT = old_c, old_b


def test_hook(base):
    """The audit hook in a child process, as tools/build.py runs a build: the importer's listing is not recorded."""
    root = os.path.join(base, 'hook')
    logs = os.path.join(base, 'logs')
    os.makedirs(logs)
    put(root, 'pkg/modx.py', 'X = 1\n')
    put(root, 'frags/10-a.js', '1;\n')
    put(root, 'run.py', 'import glob, os, sys\nsys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "pkg"))\n'
                        'import modx\nglob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "frags", "*.js"))\n')
    env = dict(os.environ, KRATOR_INPUTS_DIR=logs, KRATOR_ROOT=root,
               PYTHONPATH=os.path.join(TOOLS, '_inputs') + os.pathsep + os.environ.get('PYTHONPATH', ''))
    r = subprocess.run([sys.executable, os.path.join(root, 'run.py')], cwd=root, env=env, capture_output=True, text=True)
    lists = set()
    for f in os.listdir(logs):
        with open(os.path.join(logs, f), encoding='utf-8') as fh:
            lists.update(json.load(fh)['lists'])
    ok('negative control: the hook records the folder the build globbed (frags)', r.returncode == 0 and 'frags' in lists)
    ok("the hook does not record the folder Python's importer listed (pkg)", 'pkg' not in lists)


def main():
    base = tempfile.mkdtemp(prefix='krator-stale-')
    try:
        test_manifests(base)
        test_hook(base)
    finally:
        rmtree(base)
    bad = 0
    for name, good in checks:
        bad += not good
        print('%s  %s' % ('ok  ' if good else 'FAIL', name))
    print('%d checks, %d wrong' % (len(checks), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
