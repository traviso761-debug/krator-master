#!/usr/bin/env python3
"""Concatenate src/* and core/* into dist/dasri.html (the Dasri kit: Jabal urban & oasis/village vernacular, kits/dasri/PLAN.md).
Started from kits/coyote/build.py and tools/new_build/build.py.template: a plain `python3 build.py` re-runs itself through
`tools/build.py` so `build-inputs.json` is always written.

Usage: python3 build.py [--no-checks] [--inline-packs]
       python3 build.py --vendor-check   (checks that no core file is shadowed by src/)
       python3 build.py --list-sources   (what the page is made of: tools/build_sources.py)
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import base64, hashlib, json, re, subprocess

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and '--vendor-check' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install paths."""
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


try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
import build_sources as BSRC   # noqa: E402  (--list-sources: tools/dep_graph.py)

KIT_ID = 'dasri'
OUT = os.path.join(DIST, KIT_ID + '.html')
TEX_DIR = os.path.join(HERE, 'tex')

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost           # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky     # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine       # noqa: E402

CORE_HOST = khost.SHELL + kengine.HOST
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in (
    'shader', 'rand', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box'
)]
assert set(kengine.CORE_DIRS) <= {
    'shader', 'rand', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box'
}, 'core/engine/engine.py CORE_DIRS grew: list the new folder here'

CORE_FILES = [
    os.path.join(ROOT, 'core', 'drawn', '10-core-drawn.js'),
    os.path.join(ROOT, 'core', 'space', '20-core-space.js'),
]
READ_IN_PLACE = {}
VENDORED = {}
FURN_CULTURES = ['nomad', 'generic', 'generic-goods', 'jobs']
VIRTUAL = {'26-matlib-pack.js', '38-furniture-bundle.js'}
BUNDLE_GLOBALS = ('KratorFurniture',)
SIDE = None if '--inline-packs' in sys.argv else {}


def pack_body(tex_dir=TEX_DIR):
    """Read committed tex/pack.json and WebP files deterministically into a KMAT.pack JS object literal."""
    pj = os.path.join(tex_dir, 'pack.json')
    if not os.path.isfile(pj):
        return None
    with open(pj, encoding='utf-8') as fh:
        pack = json.load(fh)
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {
            'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
            'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
            'tint': e['tint']['keep'], 'mean': e['tint']['mean']
        }
        for k, name in sorted(e['files'].items()):
            with open(os.path.join(tex_dir, name), 'rb') as bf:
                f[k] = 'data:image/webp;base64,' + base64.b64encode(bf.read()).decode('ascii')
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return '{\n' + ',\n'.join(out) + '\n}'


def matlib_pack():
    body = pack_body()
    if body is None:
        return "/* no tex/pack.json: vertex colours only */\nKMAT.pack('dasri', {});\n"
    if SIDE is not None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        SIDE[KIT_ID] = body
        return _mp.loader(KIT_ID)
    return (
        '/* ============================== LIBRARY PACK (generated) ==============================\n'
        '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
        "KMAT.pack('" + KIT_ID + "', " + body + ');\n'
    )


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return {
        '26-matlib-pack.js': matlib_pack(),
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
    }


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {
    'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'
}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY))
    paths.update(kengine.paths())
    paths.update({os.path.basename(p): p for p in CORE_FILES})
    core = dict(paths)
    paths.update(READ_IN_PLACE)
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core


def main():
    paths, core = sources()
    vb = virtual_bodies()
    files = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in files:
        if f not in vb:
            with open(paths[f], encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
    BSRC.report(paths, vendored=VENDORED.values())
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST:
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl:
                errs.append('top-level name `%s` in %s clashes with generated bundle' % (n, ', '.join(sorted(decl[n]))))
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
            if n in GENERIC and not all(is_core(f) for f in fs):
                errs.append('top-level name `%s` (%s) is too generic for a shared scope' % (n, ', '.join(sorted(fs))))
        seeds = {}
        for f in files:
            if f in VIRTUAL or is_core(f):
                continue
            for m in RE_SEED.finditer(bodies[f]):
                seeds.setdefault(int(m.group(1)), []).append(f)
            keys = RE_KEY.findall(bodies[f])
            nseed = len(RE_SEED.findall(bodies[f]))
            if len(keys) != nseed:
                errs.append('%s: %d defBuilding keys but %d seeds' % (f, len(keys), nseed))
        for s, fs in seeds.items():
            if len(fs) > 1:
                errs.append('seed %d claimed twice: %s' % (s, ', '.join(fs)))
        for f in files:
            if not (re.match(r'[4-7]\d[a-z]?-', f) and f.endswith('.js')) or is_core(f) or f in VIRTUAL:
                continue
            m = re.match(r'// prefix: (\w+)', bodies[f])
            if not m:
                errs.append('%s: building fragments start with `// prefix: xx`' % f)
                continue
            for n in RE_DECL.findall(bodies[f]):
                if not n.lower().startswith(m.group(1).lower()):
                    errs.append('%s: top-level name `%s` does not start with prefix `%s`' % (f, n, m.group(1)))
    if errs:
        print('BUILD RULES FAILED:')
        for e in errs:
            print('  -', e)
        sys.exit(1)

    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    if SIDE:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        html = _mp.write_sidecar(SIDE, html, os.path.dirname(OUT), KIT_ID + '.tex.js', prune=False)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode('utf-8')).hexdigest()[:12] for f in files}, fh, indent=1, sort_keys=True)

    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node)'
    print('built dist/' + KIT_ID + '.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as fh:
            op = [l.rstrip() for l in fh if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op))
            for l in op:
                print('  ' + l[6:])


def vendor_check():
    bad = 0
    for f, up in sorted(VENDORED.items()):
        with open(up, 'rb') as f1, open(os.path.join(SRC, f), 'rb') as f2:
            same = f1.read() == f2.read()
        bad += not same
        print('  %s  src/%-12s %s (%s)' % ('=' if same else '!', f, 'identical' if same else 'DRIFTS', os.path.relpath(up, ROOT).replace(os.sep, '/')))
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT).replace(os.sep, '/')))
            bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
