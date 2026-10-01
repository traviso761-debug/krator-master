#!/usr/bin/env python3
"""Build dist/catalog.html: the master catalog's contact sheet.

The registries stay where other builds load them from (settlements/voth/catalog
loads the engine, the Voth buildings and the inspector by path), so they are
NOT moved into src/. src/ holds only the page around them:

  src/00-head.html          page head, toolbar, error panel, three.js r128 loader
  <registries, in order>    SOURCES below (top-level .js files of this folder; a pattern
                            expands in filename order, so one file per culture just drops in)
  src/80-sky-hash.js        h3(), which KratorSky reads
  src/81-sky.js             KratorSky, VENDORED from settlements/iziz/src
  src/90-sheet.js           lays out every entry and variant in labelled rows
  src/92-hover.js           hover inspector (name, class, tags), toggled with T
  src/93-polygon.js         polygon tool (click the ground for world x,z), toggled with P
  src/99-tail.html

Everything between head and tail goes into ONE <script>, so a top-level name
declared in two files would clobber or throw. build.py refuses that, refuses a
key registered twice, and runs `node --check` on the script.

Every build is deterministic: build-manifest.json holds a sha1 per input.

Usage:  python3 build.py [--no-checks] [--vendor-check]
"""
import fnmatch, hashlib, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'catalog'

# The furniture kit loads after the engine, then the harvested furniture, then every
# interiors-phase culture file (krator-master-furniture-<culture>.js, in filename order).
# Not built here any more: krator-master-plants.js (plants live in their biome kits and
# in each build's own sheet), krator-master-buildings-voth.js (the Voth buildings have
# their own sheet, settlements/voth/catalog, which loads that file by path) and
# krator-master-buildings-beast-rider.js (the Beast Rider buildings). The files stay.
# The catalog is the furniture sheet.
SOURCES = [
    'krator-asset-engine.js',
    'krator-symbols.js',
    'krator-furniture-kit.js',
    'krator-master-furniture.js',
    'krator-master-furniture-*.js',
    'inspector.js',
]


def sources():
    out = []
    for s in SOURCES:
        if '*' in s:
            out += sorted(f for f in os.listdir(HERE) if fnmatch.fnmatch(f, s) and f not in out)
        else:
            out.append(s)
    return out
VENDORED = {'81-sky.js': os.path.join(ROOT, 'settlements', 'iziz', 'src', '81-sky.js'),
            # the culture symbols, shared with the socket packs; vendored here because other builds load the
            # catalog's files by relative path from kits/ and cannot reach core/. Re-copy after editing upstream.
            'krator-symbols.js': os.path.join(ROOT, 'core', 'sockets', '38-symbols.js')}

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)
RE_REG = re.compile(r'^(FURN|PLANT|ASSET)\(\s*\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]', re.M)


def read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def check(parts):
    errs, decl, keys = [], {}, {}
    for name, body in parts:
        if not name.endswith('.js'):
            continue
        for rx in (RE_DECL, RE_DECL_MULTI):
            for m in rx.finditer(body):
                decl.setdefault(m.group(1), set()).add(name)
        for kind, key in RE_REG.findall(body):
            keys.setdefault((kind, key), []).append(name)
    for name, fs in sorted(decl.items()):
        if len(fs) > 1:
            errs.append('top-level name `%s` declared in more than one file: %s' % (name, ', '.join(sorted(fs))))
    for (kind, key), fs in sorted(keys.items()):
        if len(fs) > 1:
            errs.append('%s key %r registered more than once: %s' % (kind, key, ', '.join(fs)))
    return errs


def vendor_check():
    drift = 0
    for f, up in sorted(VENDORED.items()):
        if not os.path.exists(up):
            print('vendor-check: %s: upstream %s missing' % (f, os.path.relpath(up, ROOT)))
            continue
        local = os.path.join(SRC, f) if os.path.exists(os.path.join(SRC, f)) else os.path.join(HERE, f)
        same = read(up) == read(local)
        drift += not same
        print('vendor-check: %-12s %s (%s)' % (f, 'identical' if same else 'DRIFTED', os.path.relpath(up, ROOT)))
    return drift


def main():
    if '--vendor-check' in sys.argv:
        sys.exit(1 if vendor_check() else 0)
    frags = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    head = [f for f in frags if f.endswith('.html') and f < '50']
    tail = [f for f in frags if f.endswith('.html') and f >= '50']
    js = [f for f in frags if f.endswith('.js')]
    parts = [(f, read(os.path.join(HERE, f))) for f in sources()] + [(f, read(os.path.join(SRC, f))) for f in js]
    if '--no-checks' not in sys.argv:
        errs = check(parts)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)
    script = ''.join('/* ---------- %s ---------- */\n%s%s' % (n, b, '' if b.endswith('\n') else '\n') for n, b in parts)
    html = (''.join(read(os.path.join(SRC, f)) for f in head) + '<script>\n' + script +
            ''.join(read(os.path.join(SRC, f)) for f in tail))
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUT + '.html')
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    manifest = {n: hashlib.sha1(b.encode()).hexdigest()[:12] for n, b in parts}
    for f in head + tail:
        manifest[f] = hashlib.sha1(read(os.path.join(SRC, f)).encode()).hexdigest()[:12]
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
    chk = os.path.join(HERE, '.syntax-%s.js' % OUT)
    with open(chk, 'w', encoding='utf-8') as fh:
        fh.write(script)
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syntax = '  syntax OK (node)'
    except FileNotFoundError:
        syntax = '  syntax NOT CHECKED (no node)'
    print('built %s (%d files, %.0f KB)%s' % (os.path.relpath(out, HERE), len(parts) + len(head) + len(tail),
                                             os.path.getsize(out) / 1024, syntax))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        opened = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if opened:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
            for l in opened:
                print('  ' + l[6:])


if __name__ == '__main__':
    main()
