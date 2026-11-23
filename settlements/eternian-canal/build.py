#!/usr/bin/env python3
"""Shuang-Zha / Chi-Ma ("Twin-Locks", px 451, 782): Eternian canal infrastructure settlement.

Reads kits/transit/src (the shared post-Cataclysm canal, miter-lock, transit-kinematics & canal-vessel kit),
core/engine, kits/eternian/src (and kits/eternian/tex as a sidecar pack), core/host, core/water, core/atmos,
core/drawn, core/sched, core/mask, core/walk, core/door, core/furnish, core/tags, core/export, kits/crops,
core/space, core/city, core/hamlet, and biomes/nwlowlands (on buildlib.CORE_BIOME_MIN) in place.

Usage:
    python3 tools/build.py settlements/eternian-canal
    python3 build.py --bake-model      # regenerate src/39e-ec-model.js from tools/scale-model/model/data/h.png
    python3 build.py --vendor-check    # report any src/ fragment shadowing core, kits/eternian, or kits/transit
"""
import hashlib, io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                     # noqa: E402
if '--bake-model' not in sys.argv and '--vendor-check' not in sys.argv:
    buildlib.through_tools_build(__file__)
import build_sources as BSRC                        # noqa: E402

# Explicit Core Adoption list (checked by tools/check_core_use.py)
CORE_TAKEN = (
    'core/shader', 'core/rand', 'core/mask', 'core/drawn', 'core/sched',
    'core/materials', 'core/tags', 'core/furnish', 'core/water', 'core/atmos',
    'core/door', 'core/walk', 'core/export', 'core/host', 'core/engine',
    'core/space', 'core/city', 'core/hamlet', 'core/biome',
)

BUILD_ID = 'eternian-canal'
PACK_KEY = 'eternian'
OUT = os.path.join(DIST, BUILD_ID + '.html')
ET_DIR = os.path.join(ROOT, 'kits', 'eternian')
ET_SRC = os.path.join(ET_DIR, 'src')
ET_TEX_PACK = os.path.join(ET_DIR, 'tex', 'pack.json')
TR_DIR = os.path.join(ROOT, 'kits', 'transit')
MODEL_OUT = os.path.join(SRC, '39e-ec-model.js')

# Port lint (GODOT-PLAN.md, Phase 0): [G data] fragments must not touch DOM/THREE/browser APIs
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if (not BSRC.LISTING and '--bake-model' not in sys.argv and '--vendor-check' not in sys.argv
        and '--no-checks' not in sys.argv and os.path.isfile(_cp)):
    if subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
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


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def bake_model():
    """Bake a 40x40 pixel (80x80 km) window of Scale Model 5.1 around px 450.5, 782.0 (Shuang-Zha / Chi-Ma,
    SE shore of Jing-Hai +45.87 m ASL, Hak-Ma r012, Lok-Ma r305) into src/39e-ec-model.js in 0.1 m integer units."""
    from PIL import Image
    d_dir = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    im = Image.open(os.path.join(d_dir, 'h.png')).convert('RGB')
    px = im.load()
    x0, y0, nx, ny = 431, 762, 40, 40
    lake_asl = 45.87
    hs, wet = [], []
    for y in range(y0, y0 + ny):
        for x in range(x0, x0 + nx):
            r, g, b = px[x, y]
            h_asl = (r * 256 + g) / 65535.0 * 29600.0 - 2600.0
            hs.append(int(round(h_asl * 10.0)))
            wet.append('1' if b > 127 else '0')
    rows = ',\n '.join(','.join(str(v) for v in hs[i * nx:(i + 1) * nx]) for i in range(ny))
    js = (
        '// prefix: ec\n'
        '// ================================================================= SHUANG-ZHA — Scale Model 5.1 neighborhood (GENERATED)\n'
        '// [G data] `python3 build.py --bake-model` writes this from tools/scale-model/model/data/h.png (2 km/px, origin 1191, 1569):\n'
        '// heights in 0.1 m ASL units (divide by 10 for metres ASL) and standing-water flag, px %d..%d x %d..%d around 450.5, 782.0\n'
        '// (Jing-Hai / Mirror Sea lbl=102 standing water +45.87 m ASL).\n'
        'var EC_MODEL={px0:%d,py0:%d,nx:%d,ny:%d,cell:2000,cx:450.5,cy:782.0,lake:%.2f,\n hd:[%s],\n wet:"%s"};\n'
        % (x0, x0 + nx - 1, y0, y0 + ny - 1, x0, y0, nx, ny, lake_asl, rows, ''.join(wet))
    )
    os.makedirs(SRC, exist_ok=True)
    with io.open(MODEL_OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL_OUT, ROOT).replace(os.sep, '/'))


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost                                # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky                          # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine                            # noqa: E402
sys.path.insert(0, TR_DIR)
import transit as ktransit                          # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp                           # noqa: E402

CORE_DIRS = [
    os.path.join(ROOT, 'core', *d.split('/'))
    for d in ('shader', 'rand', 'mask', 'drawn', 'sched', 'materials/record', 'tags',
              'furnish', 'water', 'atmos', 'door', 'walk', 'walk/box')
]
EXPORT_FILES = ['core/export/07-core-export.js', 'core/export/09-core-export-adapters.js']
CORE_HOST = list(dict.fromkeys(khost.FULL + kengine.HOST + kengine.INTERIORS_HOST + khost.KEYS))
INTERIOR_SETS = ['eternian']
FURN_CULTURES = ['eternian', 'generic', 'generic-goods', 'jobs', 'scrap']

CITY_JS = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js',
    '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js',
]
HAMLET_JS = [
    '10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js',
    '16-hamlet-names.js', '18-hamlet-names.js', '20-hamlet-cultures.js', '30-hamlet-village.js',
]
CROPS_JS = ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '24-crop-vale-wild.js', '40-crop-query.js']
SPACE_REL = 'core/space/20-core-space.js'

FLORA_CORE = list(dict.fromkeys(list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js',
    'core/biome/33b-core-bamboo.js',
]))
NWLOW_JS = [
    'biomes/nwlowlands/src/50-biome-nwlowlands-species.js',
    'biomes/nwlowlands/src/55-biome-nwlowlands-trees.js',
    'biomes/nwlowlands/src/60-biome-nwlowlands-floor.js',
    'biomes/nwlowlands/src/65-biome-nwlowlands-dress.js',
    'biomes/nwlowlands/src/70-biome-nwlowlands.js',
]

ET_SKIP = {'00-head.html', '89-rows.js'}
TR_DATA_SET = set(ktransit.DATA_FILES)

SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {
    '26-matlib-pack.js', '38-furniture-bundle.js', kengine.INTERIORS_FRAGMENT,
    '38b-crops-bundle.js', '38c-kcity-bundle.js', '38f-flora-bundle.js',
}
BUNDLE_GLOBALS = ('KratorFurniture', 'CROPS', 'KCITY', 'KHAMLET', 'KSPACE', 'EC_FLORA') + kengine.INTERIORS_GLOBALS


def crops_bundle():
    body = ''.join('\n/* ---- kits/crops/src/%s ---- */\n%s\n' % (f, rd('kits/crops/src/' + f)) for f in CROPS_JS)
    return (
        '/* ---- 38b-crops-bundle.js ---- */\n'
        'var CROPS = (function(window){\n' + body + '\nreturn CROPS;\n})(Object.create(window));\n'
    )


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE_REL, rd(SPACE_REL))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    return (
        '/* ---- 38c-kcity-bundle.js ---- */\n'
        'var EC_CITY_CORE = (function(window){\n' + body +
        '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC,\n'
        '  obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly,\n'
        '  cg: function () { return CG; } };\n'
        'return { KSPACE: KSPACE, KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
        'var KSPACE = EC_CITY_CORE.KSPACE, KCITY = EC_CITY_CORE.KCITY, KHAMLET = EC_CITY_CORE.KHAMLET;\n'
    )


def flora_bundle():
    part = lambda rel: '\n/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = (
        'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
        '  ticks: function (fn) { FRAME_HOOKS.push(function (dt, now) { fn(Math.min(0.1, dt || 0.016), (now || 0) * 0.001); }); },\n'
        '  seed: 451782, origin: [[0, 0]], center: [0, 0], fields: {} });\n'
    )
    return (
        '/* ---- 38f-flora-bundle.js ---- */\n'
        'var EC_FLORA = (function (window) {\n'
        "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });\n" +
        ''.join(part(rel) for rel in FLORA_CORE) + boot +
        'var NWLOW = (function () {\n' + ''.join(part(rel) for rel in NWLOW_JS) + '\nreturn NWLOW;\n})();\n'
        'return { BIO: BIO, NWLOW: NWLOW };\n})(Object.create(window));\n'
    )


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return dict({
        '26-matlib-pack.js': _mp.fragment(ET_DIR, PACK_KEY, side=SIDE),
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
        '38b-crops-bundle.js': crops_bundle(),
        '38c-kcity-bundle.js': kcity_bundle(),
        '38f-flora-bundle.js': flora_bundle(),
    }, **kengine.interiors(INTERIOR_SETS))


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    for rel in EXPORT_FILES:
        f = os.path.basename(rel)
        paths[f] = os.path.join(ROOT, *rel.split('/'))
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY))
    paths.update(kengine.paths())
    core = dict(paths)
    for f in os.listdir(ET_SRC):
        if f[0].isdigit() and f not in ET_SKIP:
            paths[f] = os.path.join(ET_SRC, f)
    paths.update(ktransit.paths())
    upstream = dict(paths)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core, upstream


def sort_key(f):
    # Place kits/transit [G data] fragments (40-tr-canal, 41-tr-locks, 42-tr-transit) immediately after 39e-ec-model
    # and before 40-ec-ground / 41-ec-hydraulics / 42-ec-city so KCANAL is ready when Shuang-Zha's [G data] runs.
    if f in TR_DATA_SET:
        return ('39t-' + f, f)
    return (f, f)


def main():
    BSRC.note(
        *([SPACE_REL] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] +
          ['kits/crops/src/' + f for f in CROPS_JS] + FLORA_CORE + NWLOW_JS + ktransit.rel_paths(ROOT) +
          ([os.path.relpath(ET_TEX_PACK, ROOT).replace(os.sep, '/')] if os.path.isfile(ET_TEX_PACK) else []))
    )
    paths, core, upstream = sources()
    if BSRC.LISTING:
        BSRC.report(paths)
        return
    vb = virtual_bodies()
    files = sorted(list(paths) + list(vb), key=sort_key)
    bodies = dict(vb)
    for f in files:
        if f not in vb:
            with io.open(paths[f], encoding='utf-8', newline='') as fh:
                raw = fh.read()
            if f.endswith('.js'):
                rel = os.path.relpath(paths[f], ROOT).replace(os.sep, '/')
                bodies[f] = '/* ---- %s ---- */\n%s' % (rel, raw)
            else:
                bodies[f] = raw
    BSRC.report(paths)
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST or f in ('07-core-export.js', '09-core-export-adapters.js'):
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl:
                errs.append('top-level name `%s` in %s clashes with a generated bundle' % (n, ', '.join(sorted(decl[n]))))
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
            if not (re.match(r'[3-7]\d[a-z]?-', f) and f.endswith('.js')) or is_core(f) or f in VIRTUAL:
                continue
            if not re.match(r'[4-7]\d[a-z]?-', f):
                continue
            raw_body = re.sub(r'^/\* ---- [^\n]+ ---- \*/\n', '', bodies[f])
            m = re.match(r'// prefix: (\w+)', raw_body)
            if not m:
                errs.append('%s: 4x-7x fragments start with `// prefix: xx`' % f)
                continue
            for n in RE_DECL.findall(raw_body):
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
        html = _mp.write_sidecar(SIDE, html, DIST, BUILD_ID + '.tex.js', prune=False)
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    manifest = {f: hashlib.sha1(bodies[f].encode('utf-8')).hexdigest()[:12] for f in files}
    with io.open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
        fh.write('\n')
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        with io.open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        if os.path.exists(chk):
            os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node)'
    print('built dist/%s.html (%d fragments, %.0f KB)%s' % (BUILD_ID, len(files), os.path.getsize(OUT) / 1024.0, syn))


def vendor_check():
    paths, _, upstream = sources()
    bad = 0
    for f in sorted(upstream):
        if paths[f] != upstream[f]:
            print('  !  src/%-18s shadows %s' % (f, os.path.relpath(upstream[f], ROOT).replace(os.sep, '/')))
            bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'SHADOWS'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
