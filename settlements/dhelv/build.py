#!/usr/bin/env python3
"""Concatenate Dhelv's page: dist/dhelv.html (the Zeijani capital: kits/zeijani/PLAN.md sections 12 and 14, P5).

Usage: python3 build.py [--no-checks]
       python3 build.py --vendor-check   (a core or kit file shadowed by src/)

The page is one <script> made of, in filename order:
  core                  as the kit's: rand, walk, materials/record, tags, furnish, atmos, sockets; terrain/39-core-cavern.js
  kits/zeijani/src/*    the kit: every def, the cavern host, the furnishing, the night, the smoke, the sky, the camera and dev
                        tools; less its sheet's host (KIT_SKIP: the head, the test block, the rows, the scene, the probe)
  src/*                 Dhelv: the layout (41-dhelv-layout.js, [G data]) and its host (the head, the scene, the probe).
                        A src/ file with a kit or core file's name overrides it (record why in KNOWN_ISSUES.md)
  26-matlib-pack.js     GENERATED from the kit's tex/ (Dhelv has no materials.json of its own yet)
  38-furniture-bundle.js, 39-interiors-bundle.js   GENERATED, as the kit's
Checks: the kit's (one scope: no name declared twice; building fragments keep their prefix; unique def seeds; node --check).
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
OUT = os.path.join(DIST, 'dhelv.html')
KIT = os.path.join(ROOT, 'kits', 'zeijani')
KIT_SRC = os.path.join(KIT, 'src')
KIT_SKIP = {'00-head.html', '41-zj-block.js', '89-rows.js', '90-scene.js', '91-probe.js'}   # the kit sheet's host
TEX_DIR = os.path.join(KIT, 'tex')
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in ('rand', 'walk', 'materials/record', 'tags', 'furnish', 'atmos', 'sockets')]
CORE_FILES = [os.path.join(ROOT, 'core', 'terrain', '39-core-cavern.js')]   # one file of a core folder
# the biome core (BIO: the kits' registry, foliage, placement, the stage) for the kipuka's forest (P5b)
CORE_FILES += [os.path.join(ROOT, 'core', 'biome', f) for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js', '44-core-stage.js')]
# the HYPERJUNGLE kit, read in place and WRAPPED in one closure: its 41 declares the core's helpers (TAU, rng, fbm...) at top
# level for itself, which the Zeijani kit declares too; inside the closure they and its PRNG stream stay its own. Its fauna
# (58, which wants core/biome 35-core-anim) is left out
HJ = os.path.join(ROOT, 'biomes', 'hyperjungle')
HJ_FRAGS = ['41-hyperjungle-globals.js', '50-biome-hyperjungle-species.js', '55-biome-hyperjungle-trees.js', '60-biome-hyperjungle-floor.js',
            '65-biome-hyperjungle-dress.js', '70-biome-hyperjungle.js']
CLOSED = {'10-core-head.js'}   # its helpers are declared inside its closure (BIO.fn), not at top level: not scanned for clashes
SIDE = {}   # the hyperjungle's library maps, written beside the page (dist/dhelv.tex.js: tools/textures/matlib_pack.py)
VENDORED = {}
# GENERATED fragments, never written to src/
FURN_CULTURES = ['zeijani', 'nomad', 'generic', 'generic-goods']   # the Zeijani pieces, the Eastern Nomads' (pueblo) for fallbacks, the shared goods
VIRTUAL = {'26-matlib-pack.js', '38-furniture-bundle.js', '39-interiors-bundle.js', '46z-bio-matlib-pack.js', '47-hyperjungle.js'}
BUNDLE_GLOBALS = ('KratorFurniture', 'KratorInteriors', 'ROOM', 'furnishRoom')
INTERIOR_SETS = ['zeijani']   # kits/interiors/sets/zeijani.js: the defs' rooms, and the carved defs' void plans


def matlib_pack():
    """The library textures materials.json names, as data URLs (KMAT.pack). It reads the committed tex/ files
    only, never the library or an image encoder, so the build stays deterministic."""
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: the kit runs on vertex colours only */\nKMAT.pack('zeijani', {});\n"
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
            "KMAT.pack('zeijani', {\n" + ',\n'.join(out) + '\n});\n')


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import furniture_bundle, kit_bundle, matlib_pack as mp
    hj = ''.join('\n// ---- biomes/hyperjungle/src/%s\n' % f + open(os.path.join(HJ, 'src', f), encoding='utf-8').read() for f in HJ_FRAGS)
    return {'26-matlib-pack.js': matlib_pack(), '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
            '39-interiors-bundle.js': kit_bundle.bundle(INTERIOR_SETS),
            '46z-bio-matlib-pack.js': mp.fragment(HJ, 'hyperjungle', side=SIDE),
            '47-hyperjungle.js': '/* GENERATED: the HYPERJUNGLE kit (biomes/hyperjungle/src), wrapped */\n(function(){\n' + hj + '\nwindow.HYPERJUNGLE=HYPERJUNGLE;})();\n'}


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)(?!\d|\s*\+)', re.S)
RE_SEEDGEN = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)\s*\+\s*i\b', re.S)   # a generated family (47-zj-shops.js): base+i claims base..base+99
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
           'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    paths.update({os.path.basename(p): p for p in CORE_FILES})
    paths.update({f: os.path.join(KIT_SRC, f) for f in os.listdir(KIT_SRC) if f[0].isdigit() and f not in KIT_SKIP})
    core = dict(paths)   # core and the kit: shared code Dhelv reads from home
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})   # a src/ copy overrides
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
            if not f.endswith('.js') or f in VIRTUAL or f in CLOSED: continue
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
        gens = [(int(m.group(1)), f) for f in files if f not in VIRTUAL and not is_core(f) for m in RE_SEEDGEN.finditer(bodies[f])]
        for b, f in gens:
            for s, fs in seeds.items():
                if b <= s < b + 100: errs.append('seed %d (%s) inside the generated range %d+i of %s' % (s, ', '.join(fs), b, f))
            for b2, f2 in gens:
                if (b2, f2) != (b, f) and abs(b2 - b) < 100: errs.append('generated seed ranges %d+i (%s) and %d+i (%s) overlap' % (b, f, b2, f2))
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
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack as mp
    html = mp.write_sidecar(SIDE, html, DIST, 'dhelv.tex.js')
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
    print('built dist/dhelv.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]


def vendor_check():
    bad = 0
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT))); bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv: sys.exit(0 if vendor_check() else 1)
    main()
