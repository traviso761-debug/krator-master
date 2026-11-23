#!/usr/bin/env python3
"""Concatenate src/*, kits/shumari, kits/construction, biomes/shighlands (--station shumar), and core/* into
dist/shumar.html (Amaro, canyon-lip capital of the Kingdom of Shumar: settlements/shumar/PLAN.md).

Built on core/engine, core/city, core/hamlet, core/water, core/terrain/43-core-ground.js, core/simulation, and
core/region in place. A plain `python3 settlements/shumar/build.py` re-runs itself through `tools/build.py settlements/shumar`
so build-inputs.json, fragment needs, and the page cap are always checked.

Usage: python3 tools/build.py settlements/shumar
       python3 build.py [--no-checks]
       python3 build.py --vendor-check
"""
import hashlib, json, os, re, subprocess, sys

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


PAGE_ID = 'shumar'
KIT_ID = 'shumari'
OUT = os.path.join(DIST, PAGE_ID + '.html')
KSM_DIR = os.path.join(ROOT, 'kits', 'shumari')
CONS_DIR = os.path.join(ROOT, 'kits', 'construction')

CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in (
    'shader', 'rand', 'drawn', 'materials/record', 'tags', 'furnish', 'atmos',
    'door', 'walk', 'walk/box', 'space', 'mask', 'clock')]
CORE_SOCKETS_SYM = os.path.join(ROOT, 'core', 'sockets', '38-symbols.js')

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost  # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky  # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine  # noqa: E402
sys.path.insert(0, KSM_DIR)
import shumari as ksm  # noqa: E402

CORE_HOST = khost.SHELL + kengine.HOST + kengine.INTERIORS_HOST
INTERIOR_SETS = ['shumari']
_B = lambda *p: os.path.join(ROOT, *p)

CITY_FILES = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js',
    '34-city-radial.js', '35-city-squares.js', '36-city-covered.js', '37-city-grid.js',
    '40-city-kcity.js'
]
CITY_PATHS = [_B('core', 'city', f) for f in CITY_FILES]

EXTRA_CORE = {
    '07-core-export.js': _B('core', 'export', '07-core-export.js'),
    '09-core-export-adapters.js': _B('core', 'export', '09-core-export-adapters.js'),
    '10e-core-export-scene.js': _B('core', 'export', '10-core-export-scene.js'),
    '20w-core-water.js': _B('core', 'water', '20-core-water.js'),
    '21w-core-water-shore.js': _B('core', 'water', '21-core-water-shore.js'),
    '22w-core-water-flow.js': _B('core', 'water', '22-core-water-flow.js'),
    '50w-core-water-draw.js': _B('core', 'water', '50-core-water-draw.js'),
    '51w-core-water-kinds.js': _B('core', 'water', '51-core-water-kinds.js'),
    '32b-city-54-construct.js': _B('core', 'city', '54-city-host-construct.js'),
    '32c-cons-10-site.js': _B('kits', 'construction', 'src', '10-cons-site.js'),
    '32d-cons-20-lib.js': _B('kits', 'construction', 'src', '20-cons-lib.js'),
    '33h-10-hamlet-wood.js': _B('core', 'hamlet', '10-hamlet-wood.js'),
    '33h-12-hamlet-gather.js': _B('core', 'hamlet', '12-hamlet-gather.js'),
    '33h-14-hamlet-farmland.js': _B('core', 'hamlet', '14-hamlet-farmland.js'),
    '33h-16-hamlet-names.js': _B('core', 'hamlet', '16-hamlet-names.js'),
    '33h-18-hamlet-names.js': _B('core', 'hamlet', '18-hamlet-names.js'),
    '33h-20-hamlet-cultures.js': _B('core', 'hamlet', '20-hamlet-cultures.js'),
    '33h-25-hamlet-shumari.js': _B('core', 'hamlet', 'shumari', '25-hamlet-shumari.js'),
    '33h-30-hamlet-village.js': _B('core', 'hamlet', '30-hamlet-village.js'),
    '33h-40-hamlet-felling.js': _B('core', 'hamlet', '40-hamlet-felling.js'),
    '34r-00-region-core.js': _B('core', 'region', '00-region-core.js'),
    '34r-50-region-valley.js': _B('core', 'region', '50-region-valley.js'),
    '34r-60-shumar-tune.js': _B('core', 'region', 'data', 'shumar-tune.js'),
    '43g-core-ground.js': _B('core', 'terrain', '43-core-ground.js'),
}
for _sf in sorted(os.listdir(_B('core', 'simulation'))):
    if re.match(r'^77-sim-.*\.js$', _sf):
        EXTRA_CORE['34a-' + _sf] = _B('core', 'simulation', _sf)

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
VIRTUAL = {
    '26-matlib-pack.js', '26b-shigh-matlib-pack.js', '26c-cons-matlib-pack.js',
    '32a-kcity-bundle.js', '38-furniture-bundle.js', kengine.INTERIORS_FRAGMENT
}
BUNDLE_GLOBALS = ('KratorFurniture', 'KCITY') + kengine.INTERIORS_GLOBALS
SIDE = None if '--inline-packs' in sys.argv else {}


def kcity_bundle():
    body = []
    for p in CITY_PATHS:
        rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
        with open(p, encoding='utf-8') as fh:
            body.append('\n/* ---- %s ---- */\n%s' % (rel, fh.read()))
    return (
        '/* KCITY: core/city in one closure (settlements/shumar/build.py). GENERATED: edit core/city. */\n'
        'var KCITY = (function(){\n' + ''.join(body) +
        '\nKCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, KSPACE: KSPACE, obb: obb, obbCorners: obbCorners,\n'
        '  inPoly: inPoly, offsetConvex: offsetConvex, plan: function(){ return PLAN; } };\n'
        'return KCITY;\n})();\n'
    )


def shigh_matlib_pack(mp):
    """Pack Southern Highlands library maps used by Shumar's terrain and highland flora."""
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
        '26-matlib-pack.js': _mp.fragment(KSM_DIR, KIT_ID, side=SIDE, own=True),
        '26b-shigh-matlib-pack.js': shigh_matlib_pack(_mp),
        '26c-cons-matlib-pack.js': _mp.fragment(CONS_DIR, 'construction', side=SIDE, own=True),
        '32a-kcity-bundle.js': kcity_bundle(),
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
    }, **kengine.interiors(INTERIOR_SETS))


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
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
    paths.update({f: p for f, p in ksm.paths().items() if f != '89-rows.js'})
    paths.update(EXTRA_CORE)
    paths.update(BIO_BAND)
    core = dict(paths)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core


def main():
    paths, core = sources()
    vb = virtual_bodies()
    BSRC.report(dict(paths, **{'core/city/' + f: _B('core', 'city', f) for f in CITY_FILES}), vendored=VENDORED.values())
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
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST or f in BIO_BAND or f in EXTRA_CORE:
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl:
                errs.append('top-level name `%s` in %s clashes with a generated bundle' % (
                    n, ', '.join(sorted(decl[n]))))
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (
                    n, ', '.join(sorted(fs))))
            if n in GENERIC and not all(is_core(f) for f in fs):
                errs.append('top-level name `%s` (%s) is too generic for a shared scope' % (
                    n, ', '.join(sorted(fs))))
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
        html = _mp.write_sidecar(SIDE, html, os.path.dirname(OUT), PAGE_ID + '.tex.js', prune=True)
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
    print('built dist/' + PAGE_ID + '.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
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
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT)))
            bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--list-sources' in sys.argv:
        paths, _ = sources()
        BSRC.report(dict(paths, **{'core/city/' + f: _B('core', 'city', f) for f in CITY_FILES}), vendored=VENDORED.values())
        sys.exit(0)
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
