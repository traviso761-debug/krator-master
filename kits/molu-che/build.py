#!/usr/bin/env python3
"""Concatenate src/* into dist/molu-che.html (the Molu-Che Fossorial Clans and Bonded Vaults Kit, kits/molu-che/PLAN.md).
Started from kits/kulanewa/build.py (standalone kit on core/engine), with buildlib.through_tools_build
so a plain python3 build.py re-runs itself through tools/build.py and always writes build-inputs.json.

Usage: python3 build.py [--no-checks]
       python3 build.py --vendor-check   (a core file shadowed by src/, the placeholder sky among them)
       python3 build.py --list-sources   (what the page is made of: tools/build_sources.py)

The page is one <script> made of, in filename order:
  src/*                 the kit (00-head.html ... 99-host-tz-mc.js); 26k-kit.js, 31-alt-takes.js, 70-mc-vocab.js, 72-mc-trades.js, 89-rows.js are [G data]
  core/engine           the engine (engine.py: 10-core ... 99-host-take, 99-tail.html), read in place
  core/shader           06-core-khook.js, 06b-core-kcolor.js, 07-core-kwarp.js (KHOOK, KCOLOR)
  core/rand             08-core-rand.js (KRAND: core/tags' uid is its hash)
  core/drawn            10-core-drawn.js (KDRAWN: the drawn ground grid for camera clearance checks)
  core/materials/record 23-mat-record.js, 24-tex-def.js, 25-matlib-host.js, 27-matlib-m1.js (KMAT + Stage 5 KMAT_M1)
  core/interiors        10-core-roomlight.js (Stage 7 KROOMLIGHT: room-graph daylight, portal pool & corner AO)
  core/tags             50/52/53-core-tags*.js (KTAGS: every placed thing is registered with its class and tags)
  core/furnish          50/52/53-core-furnish*.js (KFURN: the catalog furniture placement pass)
  core/host             the shell (CORE_HOST: khost.SHELL and core/engine's HOST, the polytool and the key map)
  core/atmos            89-atmos-*.js (ATMOS: skylight on PBR materials + live atmWind on treaty & clan banners)
  core/door             KDOOR, KGLASS, KDOORHOST (core/engine/36o-open.js draws them)
  core/walk             KWALK and KWALKBOX (the floors, walls, ramps, stairs and the reach audit)
  core/water            20/22/50/51-core-water*.js (WATER: karst seep-flumes & hydraulic-lime cistern channels)
  26-matlib-pack.js     GENERATED from tex/ (tools/textures/pack.py from materials.json): the library maps as data URLs
  38-furniture-bundle.js GENERATED (kits/catalog/furniture_bundle.py): the catalog as one closure, KratorFurniture
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
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
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
KIT_ID = 'molu-che'
OUT = os.path.join(DIST, KIT_ID + '.html')
TEX_DIR = os.path.join(HERE, 'tex')

READ_IN_PLACE = {}
sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky   # the placeholder sky (KratorSky), read in place
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine   # the building-kit engine, read in place
CORE_HOST = khost.SHELL + kengine.HOST
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in ('shader', 'rand', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box')]
assert set(kengine.CORE_DIRS) <= {'shader', 'rand', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box'}, \
    'core/engine/engine.py CORE_DIRS grew: list the new folder here'
_WATER = os.path.join(ROOT, 'core', 'water')
CORE_FILES = ([os.path.join(ROOT, 'core', 'drawn', '10-core-drawn.js'),
               os.path.join(ROOT, 'core', 'materials', 'record', '27-matlib-m1.js'),
               os.path.join(ROOT, 'core', 'interiors', '10-core-roomlight.js')] +
              [os.path.join(_WATER, f) for f in ('20-core-water.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js')])
VENDORED = {}
FURN_CULTURES = ['generic', 'generic-goods', 'jobs']
VIRTUAL = {'26-matlib-pack.js', '38-furniture-bundle.js'}
BUNDLE_GLOBALS = ('KratorFurniture',)

SIDE = None if '--inline-packs' in sys.argv else {}


def matlib_pack():
    """The library textures materials.json names, as data URLs (KMAT.pack), plus M2 mipVariance and M3 pom flags."""
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: the kit runs on vertex colours only */\nKMAT.pack('molu-che', {});\n"
    pack = json.load(open(pj, encoding='utf-8'))
    mv_file = os.path.join(HERE, 'mip-variance.json')
    mv_fams = json.load(open(mv_file, encoding='utf-8')).get('families', {}) if os.path.isfile(mv_file) else {}
    cfg_file = os.path.join(HERE, 'materials.json')
    cfg_fams = json.load(open(cfg_file, encoding='utf-8')).get('families', {}) if os.path.isfile(cfg_file) else {}
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        fc = cfg_fams.get(fam) or {}
        sz = e.get('size', 512)
        f = {'lib': e['lib'], 'scale': e['scale'], 'size': sz[0] if isinstance(sz, list) else int(sz),
             'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        if e.get('height'):
            f['height'] = True
        if fc.get('height'):
            f['pom'] = True
        if fam in mv_fams:
            f['mipVariance'] = mv_fams[fam]
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    body = '{\n' + ',\n'.join(out) + '\n}'
    if SIDE is not None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        SIDE[KIT_ID] = body
        return _mp.loader(KIT_ID)
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit; edit materials.json and repack. */\n'
            "KMAT.pack('" + KIT_ID + "', " + body + ');\n')


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return {'26-matlib-pack.js': matlib_pack(), '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES)}


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
           'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


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
    bodies.update({f: open(paths[f], encoding='utf-8', newline='').read() for f in files if f not in vb})
    BSRC.report(paths, vendored=VENDORED.values())
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST: continue
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
    if SIDE:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        html = _mp.write_sidecar(SIDE, html, os.path.dirname(OUT), KIT_ID + '.tex.js', prune=False)
    open(OUT, 'w', encoding='utf-8', newline='\n').write(html)
    json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in files}, open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n'), indent=1, sort_keys=True)
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8', newline='\n').write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    print('built dist/' + KIT_ID + '.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
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
        print('  %s  src/%-12s %s (%s)' % ('=' if same else '!', f, 'identical' if same else 'DRIFTS', os.path.relpath(up, ROOT).replace(os.sep, '/')))
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT).replace(os.sep, '/'))); bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv: sys.exit(0 if vendor_check() else 1)
    main()
