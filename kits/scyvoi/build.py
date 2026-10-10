#!/usr/bin/env python3
"""Concatenate src/* into dist/scyvoi.html (the Scyvoi kit: tents, the Baelu, salamanders, chariots and carts).

Usage: python3 build.py [--no-checks]
       python3 build.py --vendor-check   (the vendored sky against settlements/iziz/src; a core file shadowed by src/)

The page is one <script> made of, in filename order:
  src/*                 the kit (00-head.html ... 99-tail.html)
  core/rand             08-core-rand.js (KRAND: core/tags' uid is its hash)
  core/materials/record 23-mat-record.js, 24-tex-def.js, 25-matlib-host.js (KMAT: the material records and the library loader)
  core/tags             50/52/53-core-tags*.js (KTAGS: every placed thing is registered with its class and tags)
  core/furnish          50/52/53-core-furnish*.js (KFURN: the catalog furniture placement pass)
  core/atmos            89-atmos-*.js (ATMOS: the sky's light on the library materials, ATMOS.skylight)
  26-matlib-pack.js     GENERATED from tex/ (tools/textures/pack.py from materials.json): the library maps as data URLs
  38-furniture-bundle.js GENERATED (kits/catalog/furniture_bundle.py): the catalog as one closure, KratorFurniture
  39-fauna-bundle.js    GENERATED (kits/fauna/fauna_bundle.py): the animals (goats, salamanders) as one closure, KratorFauna
A src/ file with a core file's name overrides it (record why in KNOWN_ISSUES.md). src/81-sky.js is VENDORED from
settlements/iziz/src/81-sky.js (KratorSky, the standard Krator sky): --vendor-check reports drift.

Checks (fragments share one JS scope):
  1. no column-0 const/let/var/function/class name is declared in two fragments, or is a generic short name;
  2. every building fragment (4x-7x, not core) opens with `// prefix: xx` and declares only names starting with it (any case: TK_ROPE is tk's);
  3. every defBuilding({...}) has a unique numeric `seed:`;
  4. `node --check` on the script when node exists (otherwise the build says the syntax was NOT checked:
     verify.py's error panel is then the only syntax check).
"""
import base64, hashlib, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and '--vendor-check' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places
    (/opt/node*/bin, /usr/local/bin, ~/.nvm, ~/.volta; the newest first). None when
    there is none: the build then says plainly that the syntax was NOT checked.
    Every build.py carries this same function; a fix belongs in all of them."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
        print('NOTE: $NODE=%s is not a node binary; looking elsewhere' % env)
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(DIST, 'scyvoi.html')
TEX_DIR = os.path.join(HERE, 'tex')
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in ('rand', 'materials/record', 'tags', 'furnish', 'atmos')]
VENDORED = {'81-sky.js': os.path.join(ROOT, 'settlements', 'iziz', 'src', '81-sky.js')}
# GENERATED fragments, never written to src/
FURN_CULTURES = ['scyvoi', 'nomad', 'generic', 'generic-goods']   # the Scyvoi pieces, the Eastern Nomads' for fallbacks, the shared goods
VIRTUAL = {'26-matlib-pack.js', '38-furniture-bundle.js', '39-fauna-bundle.js'}
BUNDLE_GLOBALS = ('KratorFurniture', 'KratorFauna')
FAUNA_GROUPS = ['livestock', 'mounts', 'farm']   # kits/fauna: the goats, the salamanders, the bison and the cattle


def matlib_pack():
    """The library textures materials.json names, as data URLs (KMAT.pack). It reads the committed tex/ files
    only, never the library or an image encoder, so the build stays deterministic."""
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: the kit runs on vertex colours only */\nKMAT.pack('scyvoi', {});\n"
    pack = json.load(open(pj))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json): per family the library set\n'
            '   and its processed maps. Do not edit; edit materials.json and repack. */\n'
            "KMAT.pack('scyvoi', {\n" + ',\n'.join(out) + '\n});\n')


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'fauna'))
    import furniture_bundle, fauna_bundle
    return {'26-matlib-pack.js': matlib_pack(), '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
            '39-fauna-bundle.js': fauna_bundle.bundle(FAUNA_GROUPS)}


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
           'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    core = dict(paths)
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})   # a src/ copy overrides the core one
    return paths, core


def main():
    paths, core = sources()
    vb = virtual_bodies()
    files = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    bodies.update({f: open(paths[f], encoding='utf-8', newline='').read() for f in files if f not in vb})
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL: continue
            for m in RE_DECL.finditer(bodies[f]): decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl: errs.append('top-level name `%s` in %s clashes with the generated furniture bundle' % (n, ', '.join(sorted(decl[n]))))
        for n, fs in sorted(decl.items()):
            if len(fs) > 1: errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
            if n in GENERIC and not all(is_core(f) for f in fs): errs.append('top-level name `%s` (%s) is too generic for a shared scope' % (n, ', '.join(sorted(fs))))
        seeds = {}
        for f in files:
            if f in VIRTUAL or is_core(f): continue
            for m in RE_SEED.finditer(bodies[f]): seeds.setdefault(int(m.group(1)), []).append(f)
            keys = RE_KEY.findall(bodies[f]); nseed = len(RE_SEED.findall(bodies[f]))
            if len(keys) != nseed: errs.append('%s: %d defBuilding keys but %d seeds' % (f, len(keys), nseed))
        for s, fs in seeds.items():
            if len(fs) > 1: errs.append('seed %d claimed twice: %s' % (s, ', '.join(fs)))
        for f in files:
            if not (re.match(r'[4-7]\d[a-z]?-', f) and f.endswith('.js')) or is_core(f) or f in VIRTUAL: continue
            m = re.match(r'// prefix: (\w+)', bodies[f])
            if not m: errs.append('%s: building fragments start with `// prefix: xx`' % f); continue
            for n in RE_DECL.findall(bodies[f]):
                if not n.lower().startswith(m.group(1).lower()): errs.append('%s: top-level name `%s` does not start with prefix `%s`' % (f, n, m.group(1)))
    if errs:
        print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in files}, open(os.path.join(HERE, 'build-manifest.json'), 'w'), indent=1, sort_keys=True)
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    print('built dist/scyvoi.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]


def vendor_check():
    bad = 0
    for f, up in sorted(VENDORED.items()):
        same = open(up, 'rb').read() == open(os.path.join(SRC, f), 'rb').read()
        bad += not same
        print('  %s  src/%-12s %s (%s)' % ('=' if same else '!', f, 'identical' if same else 'DRIFTS', os.path.relpath(up, ROOT)))
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT))); bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv: sys.exit(0 if vendor_check() else 1)
    main()
