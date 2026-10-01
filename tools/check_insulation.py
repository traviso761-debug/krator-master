#!/usr/bin/env python3
"""Fail if Krator's core reaches into the hosting layer or the World Menagerie.

The dependency runs one way: host/ reads Krator's built pages and the Menagerie's files; nothing a world is
built from may name host/, the synced Menagerie copy, or the WorldMenagerie checkout. Checks the sources
(src/, targets/, build.py, verify.py) of every build, and core/.

Usage:  python3 tools/check_insulation.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TREES = ['settlements', 'kits', 'biomes', 'core']
SKIP_DIRS = {'dist', 'shots', 'archive', '__pycache__', 'publish', 'catalog'}
SOURCE = ('.js', '.html', '.py', '.css', '.json', '.toml', '.glsl')
BAD = re.compile(r'WorldMenagerie|\bhost/(?:site|menagerie|server\.py|sync\.py)|\bmenagerie/(?:src|data|css|vendor)/'
                 r'|/scenes\.json|installMenagerie', re.I)


def sources():
    for tree in TREES:
        for d, subdirs, files in os.walk(os.path.join(ROOT, tree)):
            subdirs[:] = [s for s in subdirs if s not in SKIP_DIRS and not s.startswith(('.', 'shots'))]
            in_src = re.search(r'/(src|targets)(/|$)', d.replace(os.sep, '/'))
            for name in files:
                if (in_src and name.endswith(SOURCE)) or name in ('build.py', 'verify.py') or tree == 'core':
                    if not name.startswith('.') and name != 'three.min.js':
                        yield os.path.join(d, name)


def main():
    hits = 0
    for path in sources():
        try:
            text = open(path, encoding='utf-8', errors='replace').read()
        except OSError:
            continue
        for n, line in enumerate(text.splitlines(), 1):
            if BAD.search(line):
                hits += 1
                print('%s:%d: %s' % (os.path.relpath(path, ROOT), n, line.strip()[:120]))
    if hits:
        sys.exit('insulation: %d reference(s) from Krator core to host/ or the Menagerie' % hits)
    print('insulation: ok (Krator core names neither host/ nor the Menagerie)')


if __name__ == '__main__':
    main()
