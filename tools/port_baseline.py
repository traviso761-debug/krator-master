#!/usr/bin/env python3
"""The hash baseline (GODOT-PLAN.md, Phase 0): every built page's SHA-256, so a refactor
can prove it changed nothing.

    python3 tools/port_baseline.py --write     # rebuild nothing; hash dist/ as it is, write PORT-BASELINE.json
    python3 tools/port_baseline.py             # compare dist/ with PORT-BASELINE.json, exit 1 on any difference

Rebuild first (`cd <build> && python3 build.py`; every build is deterministic). A page whose
hash differs after a refactor needs a screenshot diff before the baseline is rewritten.
The file records every `dist/*.html` of every build plus `core/sockets/example/*.html`.
"""
import hashlib, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'PORT-BASELINE.json')


def pages():
    out = []
    for top in ('settlements', 'kits', 'biomes'):
        d = os.path.join(ROOT, top)
        for name in sorted(os.listdir(d)):
            dist = os.path.join(d, name, 'dist')
            if os.path.isdir(dist):
                for f in sorted(os.listdir(dist)):
                    if f.endswith('.html'):
                        out.append(os.path.relpath(os.path.join(dist, f), ROOT))
    ex = os.path.join(ROOT, 'core', 'sockets', 'example')
    if os.path.isdir(ex):
        out += [os.path.relpath(os.path.join(ex, f), ROOT) for f in sorted(os.listdir(ex)) if f.endswith('.html')]
    return out


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main(argv):
    now = {p: {'sha256': sha(os.path.join(ROOT, p)), 'bytes': os.path.getsize(os.path.join(ROOT, p))} for p in pages()}
    if '--write' in argv:
        json.dump({'what': 'SHA-256 of every built page; tools/port_baseline.py', 'pages': now},
                  open(OUT, 'w'), indent=1, sort_keys=True)
        print('wrote %s: %d pages' % (os.path.relpath(OUT, ROOT), len(now)))
        return 0
    if not os.path.isfile(OUT):
        print('no PORT-BASELINE.json; run with --write'); return 1
    base = json.load(open(OUT))['pages']
    bad = 0
    for p in sorted(set(base) | set(now)):
        if p not in base:
            print('NEW      %s' % p); bad += 1
        elif p not in now:
            print('MISSING  %s' % p); bad += 1
        elif base[p]['sha256'] != now[p]['sha256']:
            print('CHANGED  %s  (%d -> %d bytes)' % (p, base[p]['bytes'], now[p]['bytes'])); bad += 1
    print('%d pages, %d differ from the baseline' % (len(now), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
