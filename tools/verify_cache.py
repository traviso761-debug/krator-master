#!/usr/bin/env python3
"""Run a build's verify.py unless the same check already passed on the same page (EFFICIENCY.md, part 2, item 1).

    python3 tools/verify_cache.py biomes/rift dist/rift.html --assert
    python3 tools/verify_cache.py --force biomes/rift dist/rift.html --assert    # run it whatever the cache says

Builds are deterministic, so a verify that passed on a page passes on the same bytes again. The key is the page's
sha256, the build's verify.py, tools/harness.py, the arguments and the GL mode (KRATOR_GL); a pass is recorded in
`.verify-pass.json` at the repo root (gitignored: a local cache, never committed; delete it to forget every pass).
A failing run records nothing. The verify's own output is printed as it runs; a skip prints one SKIP line.
"""
import hashlib, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.verify-pass.json')


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def key(build, page, args):
    d = os.path.join(ROOT, build)
    parts = [sha(os.path.join(d, page)), sha(os.path.join(d, 'verify.py')), sha(os.path.join(ROOT, 'tools', 'harness.py')),
             ' '.join(args), os.environ.get('KRATOR_GL', '')]
    return hashlib.sha256('\n'.join(parts).encode('utf-8')).hexdigest()


def load():
    try:
        with open(CACHE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def main(argv):
    force = '--force' in argv
    argv = [a for a in argv if a != '--force']
    if len(argv) < 2:
        print(__doc__)
        return 2
    build, page, args = argv[0].replace(os.sep, '/').rstrip('/'), argv[1], argv[2:]
    name = build + '/' + page + (' ' + ' '.join(args) if args else '')
    k = key(build, page, args)
    cache = load()
    if not force and cache.get(name) == k:
        print('SKIP  %s: passed before on this page, verify.py, harness and arguments (--force to rerun)' % name)
        return 0
    r = subprocess.run([sys.executable, 'verify.py', page] + args, cwd=os.path.join(ROOT, build))
    if r.returncode == 0:
        cache = load()   # another verify may have written meanwhile
        cache[name] = k
        with open(CACHE, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(cache, f, indent=1, sort_keys=True)
    return r.returncode


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
