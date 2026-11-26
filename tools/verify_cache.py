#!/usr/bin/env python3
"""Run a build's verify.py unless the same check already passed on the same page (EFFICIENCY.md, part 2, item 1).

    python3 tools/verify_cache.py biomes/rift dist/rift.html --assert
    python3 tools/verify_cache.py --force biomes/rift dist/rift.html --assert    # run it whatever the cache says

Since 2026-11-03 the cache lives in tools/harness.py (verify_wrap): every verify.py that imports the harness checks it
itself, keyed by the page and every file it loaded, the verify.py, the harness and the arguments, recorded in
%LOCALAPPDATA%/krator-verify-cache. This script stays for the nightly and older notes: it runs the verify from its
build folder, --force becoming the verify's --no-cache.
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(argv):
    force = '--force' in argv
    argv = [a for a in argv if a != '--force']
    if len(argv) < 2:
        print(__doc__)
        return 2
    build, page, args = argv[0].replace(os.sep, '/').rstrip('/'), argv[1], argv[2:]
    return subprocess.run([sys.executable, 'verify.py', page] + args + (['--no-cache'] if force else []),
                          cwd=os.path.join(ROOT, build)).returncode


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
