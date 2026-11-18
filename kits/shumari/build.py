#!/usr/bin/env python3
"""Concatenate src/* and core/* into dist/shumari.html (the Shumari kit: Kingdom of Shumar, kits/shumari/PLAN.md).
Built directly on core/engine in place (core/engine/README.md); --vendor-check reports any src/ copy as a shadow.
A plain `python3 kits/shumari/build.py` re-runs itself through `tools/build.py kits/shumari` so build-inputs.json is always written.

Usage: python3 tools/build.py kits/shumari
       python3 build.py [--no-checks]
       python3 build.py --vendor-check
"""
import base64, hashlib, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib  # noqa: E402
buildlib.through_tools_build(__file__)
import build_sources as BSRC  # noqa: E402

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and not any(a in ('--no-checks', '--vendor-check', '--list-sources', '--help', '-h') for a in sys.argv[1:]):
    if subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
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


KIT_ID = 'shumari'
OUT = os.path.join(DIST, KIT_ID + '.html')
TEX_DIR = os.path.join(HERE, 'tex')
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in (
    'shader', 'rand', 'drawn', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box', 'space', 'mask')]
CORE_SOCKETS_SYM = os.path.join(ROOT, 'core', 'sockets', '38-symbols.js')

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost  # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky  # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine  # noqa: E402

CORE_HOST = khost.SHELL + kengine.HOST + kengine.INTERIORS_HOST
INTERIOR_SETS = ['shumari']
_B = lambda *p: os.path.join(ROOT, *p)
BIO_BAND = {
    '93b-bio-10-core-head.js': _B('core', 'biome', '10-core-head.js'),
    '93b-bio-20-core-kit.js': _B('core', 'biome', '20-core-kit.js'),
    '93b-bio-30-core-foliage.js': _B('core', 'biome', '30-core-foliage.js'),
    '93b-bio-31b-core-leafset.js': _B('core', 'biome', '31b-core-leafset.js'),
    '93b-bio-31j-core-joint.js': _B('core', 'biome', '31j-core-joint.js'),
    '93b-bio-34-core-impostor.js': _B('core', 'biome', '34-core-impostor.js'),
    '93b-bio-40-core-place.js': _B('core', 'biome', '40-core-place.js'),
    '93b-bio-50-biome-shigh-species.js': _B('biomes', 'shighlands', 'src', '50-biome-shigh-species.js'),
    '93b-bio-55-biome-shigh-trees.js': _B('biomes', 'shighlands', 'src', '55-biome-shigh-trees.js'),
    '93b-bio-60-biome-shigh-floor.js': _B('biomes', 'shighlands', 'src', '60-biome-shigh-floor.js'),
    '93b-bio-62-biome-shigh-shumar.js': _B('biomes', 'shighlands', 'stations', 'shumar', '62-biome-shigh-shumar.js'),
    '93b-bio-70-biome-shigh.js': _B('biomes', 'shighlands', 'src', '70-biome-shigh.js'),
}
VENDORED = {}
FURN_CULTURES = ['shumari', 'generic', 'generic-goods', 'jobs', 'arms', 'scrap']
VIRTUAL = {'26-matlib-pack.js', '26b-shigh-matlib-pack.js', '38-furniture-bundle.js', kengine.INTERIORS_FRAGMENT}
BUNDLE_GLOBALS = ('KratorFurniture',) + kengine.INTERIORS_GLOBALS
SIDE = None if '--inline-packs' in sys.argv else {}


def shigh_matlib_pack(mp):
    """Pack Southern Highlands library maps used by the Shumar highland flora band (excluding other stations' own sets)."""
    sh_dir = os.path.join(ROOT, 'biomes', 'shighlands')
    sd = os.path.join(sh_dir, 'stations')
    other_fams = set()
    shumar_fams = set()
    if os.path.isdir(sd):
        for st in sorted(os.listdir(sd)):
            sj = os.path.join(sd, st, 'station.json')
            if os.path.isfile(sj):
                with open(sj, encoding='utf-8') as fh:
                    fams = json.load(fh).get('families', [])
                if st == 'shumar':
                    shumar_fams.update(fams)
                else:
                    other_fams.update(fams)
    excl = sorted(other_fams - shumar_fams)
    return mp.fragment(sh_dir, 'shigh', exclude=excl, side=SIDE, own=True)


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack as _mp
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return dict({
        '26-matlib-pack.js': _mp.fragment(HERE, KIT_ID, side=SIDE, own=True),
        '26b-shigh-matlib-pack.js': shigh_matlib_pack(_mp),
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
    }, **kengine.interiors(INTERIOR_SETS))


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
RE_PREFIX = re.compile(r'(?://|/\*)\s*prefix:\s*(\w+)')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    if os.path.isfile(CORE_SOCKETS_SYM):
        paths['38-symbols.js'] = CORE_SOCKETS_SYM
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY))
    paths.update(kengine.paths())
    paths.update(BIO_BAND)
    core = dict(paths)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core


def main():
    paths, core = sources()
    vb = virtual_bodies()
    BSRC.report(paths, vendored=VENDORED.values())
    files = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in files:
        if f not in vb:
            with open(paths[f], encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST or f in BIO_BAND:
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl:
                errs.append('top-level name `%s` in %s clashes with the generated furniture bundle' % (
                    n, ', '.join(sorted(decl[n]))))
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (
                    n, ', '.join(sorted(fs))))
            if n in GENERIC and not all(is_core(f) for f in fs):
                errs.append('top-level name `%s` (%s) is too generic for a shared scope' % (
                    n, ', '.join(sorted(fs))))
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
            m = RE_PREFIX.match(bodies[f])
            if not m:
                errs.append('%s: building fragments must start with `/* prefix: sm */` or `// prefix: sm`' % f)
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
        html = _mp.write_sidecar(SIDE, html, os.path.dirname(OUT), KIT_ID + '.tex.js', prune=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    manifest = {f.replace(os.sep, '/'): hashlib.sha1(bodies[f].encode('utf-8')).hexdigest()[:12] for f in files}
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
        fh.write('\n')
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
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
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
        print('  %s  src/%-12s %s (%s)' % ('=' if same else '!', f, 'identical' if same else 'DRIFTS', os.path.relpath(up, ROOT)))
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT)))
            bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
