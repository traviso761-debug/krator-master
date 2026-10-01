#!/usr/bin/env python3
"""Build kits/interiors: the engine-neutral interiors module and its demo sheet.

Outputs (both deterministic; build-manifest.json holds a sha1 per input):

  dist/interiors-core.js   src/10-49 only: ROOM(), furnishRoom(), planBuilding(), the life layer,
                           the walk grid, the audits.
                           No THREE, no DOM, no catalog. Load it by path or vendor it.
  dist/interiors.html      the demo: sample rooms furnished from the master catalog.

The page loads three.js r128, the catalog engine, the furniture registry and the click
inspector BY PATH from ../catalog (kits/catalog/README.md "Using catalog pieces in another
build"), so nothing of the catalog is copied. Then ONE inline <script>:

  src/10-49*.js                  the core (engine-neutral)
  adapters/catalog-adapter.js    the only file that knows kits/catalog
  src/50-59*.js                  THREE views: shells, planned buildings, outline debug view,
                                 cut-away and storey selector, walker figures
  src/70-98*.js                  the demo sheet, hover inspector, page audit, polygon tool
  src/80-sky-hash.js, 81-sky.js  VENDORED (see VENDORED below; --vendor-check)

Because the catalog's scripts share the page's global scope, build.py refuses a top-level
name that this script declares twice OR that the catalog files already declare, and runs
`node --check` on the script and the core, then loads the core in node.

Usage:  python3 build.py [--no-checks] [--vendor-check]
"""
import hashlib, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
CATALOG = os.path.join(ROOT, 'kits', 'catalog')
OUT = 'interiors'

ADAPTERS = ['adapters/catalog-adapter.js']
# the catalog files the page loads by path (00-head.html): our names must not clash with theirs
CATALOG_LOADED = ['krator-asset-engine.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js', 'inspector.js'] + sorted(
    f for f in os.listdir(CATALOG) if f.startswith('krator-master-furniture-') and f.endswith('.js'))
VENDORED = {
    '80-sky-hash.js': os.path.join(ROOT, 'kits', 'catalog', 'src', '80-sky-hash.js'),
    '81-sky.js': os.path.join(ROOT, 'settlements', 'iziz', 'src', '81-sky.js'),
}

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)


def read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def decls(body):
    out = set()
    for rx in (RE_DECL, RE_DECL_MULTI):
        out.update(m.group(1) for m in rx.finditer(body))
    return out


def check(parts):
    errs, seen = [], {}
    for name, body in parts:
        for d in decls(body):
            seen.setdefault(d, []).append(name)
    for d, fs in sorted(seen.items()):
        if len(fs) > 1:
            errs.append('top-level name `%s` declared in more than one file: %s' % (d, ', '.join(fs)))
    for f in CATALOG_LOADED:
        p = os.path.join(CATALOG, f)
        if not os.path.exists(p):
            errs.append('catalog file missing: kits/catalog/%s' % f)
            continue
        for d in sorted(decls(read(p)) & set(seen)):
            errs.append('top-level name `%s` (%s) clashes with kits/catalog/%s' % (d, ', '.join(seen[d]), f))
    return errs


def vendor_check():
    drift = 0
    for f, up in sorted(VENDORED.items()):
        if not os.path.exists(up):
            print('vendor-check: %s: upstream %s missing' % (f, os.path.relpath(up, ROOT)))
            drift += 1
            continue
        same = read(up) == read(os.path.join(SRC, f))
        drift += not same
        print('vendor-check: %-16s %s (%s)' % (f, 'identical' if same else 'DRIFTED', os.path.relpath(up, ROOT)))
    return drift


def node_check(name, text):
    chk = os.path.join(HERE, '.syntax-%s.js' % name)
    with open(chk, 'w', encoding='utf-8', newline='') as fh:
        fh.write(text)
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        return 'syntax NOT CHECKED (no node)'
    if r.returncode:
        print(r.stdout + r.stderr)
        sys.exit(1)
    return 'syntax OK'


def main():
    if '--vendor-check' in sys.argv:
        sys.exit(1 if vendor_check() else 0)
    frags = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    head = [f for f in frags if f.endswith('.html') and f < '50']
    tail = [f for f in frags if f.endswith('.html') and f >= '50']
    js = [f for f in frags if f.endswith('.js')]
    core = [f for f in js if f < '50']
    view = [f for f in js if f >= '50']
    core_parts = [('src/' + f, read(os.path.join(SRC, f))) for f in core]
    parts = core_parts + [(a, read(os.path.join(HERE, a))) for a in ADAPTERS] + [('src/' + f, read(os.path.join(SRC, f))) for f in view]
    if '--no-checks' not in sys.argv:
        errs = check(parts)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    def join(ps):
        return ''.join('/* ---------- %s ---------- */\n%s%s' % (n, b, '' if b.endswith('\n') else '\n') for n, b in ps)
    script = join(parts)
    core_js = ('/* kits/interiors/dist/interiors-core.js: GENERATED by build.py from src/10-49. Do not edit;\n'
               '   edit src/ and rebuild. Engine-neutral: no THREE, no DOM. See API.md. */\n' + join(core_parts))
    html = (''.join(read(os.path.join(SRC, f)) for f in head) + '<script>\n' + script +
            ''.join(read(os.path.join(SRC, f)) for f in tail))
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUT + '.html')
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(DIST, 'interiors-core.js'), 'w', encoding='utf-8', newline='') as fh:
        fh.write(core_js)
    manifest = {n: hashlib.sha1(b.encode()).hexdigest()[:12] for n, b in parts}
    for f in head + tail:
        manifest['src/' + f] = hashlib.sha1(read(os.path.join(SRC, f)).encode()).hexdigest()[:12]
    manifest['dist/interiors.html'] = hashlib.sha1(html.encode()).hexdigest()[:12]
    manifest['dist/interiors-core.js'] = hashlib.sha1(core_js.encode()).hexdigest()[:12]
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
        fh.write('\n')
    syn = node_check(OUT, script)
    node_check('core', core_js)
    load = ''
    try:
        r = subprocess.run(['node', '-e', 'const IX=require(process.argv[1]);'
                            'if(typeof IX.furnishRoom!=="function"||typeof IX.ROOM!=="function")process.exit(2);',
                            os.path.join(DIST, 'interiors-core.js')], capture_output=True, text=True)
        if r.returncode:
            print('core does not load in node:\n' + r.stdout + r.stderr)
            sys.exit(1)
        load = ', core loads in node'
    except FileNotFoundError:
        pass
    print('built %s (%d files, %.0f KB) and dist/interiors-core.js (%.0f KB)  %s%s' % (
        os.path.relpath(out, HERE), len(parts) + len(head) + len(tail), os.path.getsize(out) / 1024,
        len(core_js.encode()) / 1024, syn, load))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        opened = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if opened:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
            for l in opened:
                print('  ' + l[6:])


if __name__ == '__main__':
    main()
