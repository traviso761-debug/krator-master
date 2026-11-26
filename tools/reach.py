#!/usr/bin/env python3
"""Which pages a file reaches (CORE-IMPROVEMENTS.md 5a): run it before committing a shared change, to see what must
be rebuilt with it.

    python3 tools/reach.py core/terrain/37-core-stacks.js            # every build command that read it, and its pages
    python3 tools/reach.py core/biome/*.js --commands                # just the rebuild commands, one per line
    python3 tools/reach.py core/atmos/sky/new-fragment.js            # a new file: the builds that list its folder

It reads every build's build-inputs.json (tools/build.py writes them). A file reaches a build command when the command
read it, or listed the folder it is in (a fragment added to a folder a build globs). A build with no manifest yet
cannot be answered for: it is named at the end, so a clean answer is never silently partial.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import buildlib  # noqa: E402


def main(argv):
    files = [buildlib.rel(a) or a.replace(os.sep, '/') for a in argv if not a.startswith('--')]
    if not files:
        print(__doc__); return 2
    hits, unknown = [], []
    for b in buildlib.build_dirs():
        m = buildlib.load_manifest(b)
        if m is None:
            unknown.append(b); continue
        for cmd, run in sorted(m.get('runs', {}).items()):
            why = [f for f in files if f in run.get('inputs', {})]
            why += [f + ' (its folder)' for f in files if f not in why and os.path.dirname(f) in run.get('listings', {})]
            if why:
                pages = [p for p in run.get('outputs', {}) if p.endswith(('.html', '.js'))]
                args = cmd.split()
                line = 'python3 tools/build.py %s%s%s' % (b, '' if args[0] == 'build.py' else ' --script ' + args[0],
                                                           (' ' + ' '.join(args[1:])) if args[1:] else '')
                hits.append((b, cmd, why, pages, line))
    if '--commands' in argv:
        for h in hits:
            print(h[4])
        return 0
    for b, cmd, why, pages, line in hits:
        print('%s  (%s)' % (b, cmd))
        print('    reads  ' + ', '.join(why))
        for p in pages:
            print('    page   ' + p)
    print('%d build command(s) reached, %d page(s)' % (len(hits), sum(len(h[3]) for h in hits)))
    if unknown:
        print('no manifest (cannot say): ' + ', '.join(unknown))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
