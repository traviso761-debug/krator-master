#!/usr/bin/env python3
"""Mirabilis (Mirapiris / Sutar-Kotan, px 350, 726): Circuit E6 escarpment prefecture & Hayrant vassal kit showcase.

Reads kits/hayrant/src (and kits/hayrant/tex as a sidecar pack), kits/eternian/src (38 suzerain peer buildings),
kits/resources/src (RES_ORE nodes & resSource), kits/construction/src (KCONS rising scaffolds), kits/tents (sealed via
tools/kit_pack.py), kits/crops/src, biomes/wouterwall/src + biomes/nwouterwall/src (on buildlib.CORE_BIOME_MIN),
core/engine, core/host, core/terrain (KGROUND texture-array), core/water, core/atmos, core/drawn, core/sched,
core/mask, core/walk, core/door, core/furnish, core/tags, core/export, core/space, core/kits, core/city (multikit),
core/hamlet, and core/camp in place.

Usage:
    python3 tools/build.py settlements/mirabilis
    python3 build.py --bake-model      # regenerate src/39e-mb-model.js from tools/scale-model/model/data/h.png
    python3 build.py --vendor-check    # report any src/ fragment shadowing core or upstream kits
    python3 build.py --list-sources    # list every read-in-place file (tools/build_sources.py)
"""
import base64, hashlib, io, json, os, re, subprocess, sys

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
    'core/terrain', 'core/space', 'core/kits', 'core/city', 'core/hamlet',
    'core/camp', 'core/biome',
)

BUILD_ID = 'mirabilis'
PACK_KEY = 'hayrant'
OUT = os.path.join(DIST, BUILD_ID + '.html')
HY_DIR = os.path.join(ROOT, 'kits', 'hayrant')
HY_SRC = os.path.join(HY_DIR, 'src')
HY_TEX_PACK = os.path.join(HY_DIR, 'tex', 'pack.json')
ET_SRC = os.path.join(ROOT, 'kits', 'eternian', 'src')
MODEL_OUT = os.path.join(SRC, '39e-mb-model.js')

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
    """Bake a 40x40 pixel (80x80 km) window of Scale Model 5.1 around px 350.0, 725.6 (Mirabilis 350, 726 +3124.9 m ASL,
    and Yut-Ma 'Moon-Bridge River' r227 at 350.02, 725.33 +2922.4 m ASL) into src/39e-mb-model.js in 0.1 m integer units."""
    from PIL import Image
    d_dir = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    im = Image.open(os.path.join(d_dir, 'h.png')).convert('RGB')
    px = im.load()
    x0, y0, nx, ny = 330, 706, 40, 40
    hs, wet = [], []
    for y in range(y0, y0 + ny):
        for x in range(x0, x0 + nx):
            r, g, b = px[x, y]
            h_asl = (r * 256 + g) / 65535.0 * 29600.0 - 2600.0
            hs.append(int(round(h_asl * 10.0)))
            wet.append('1' if b > 127 else '0')
    rows = ',\n '.join(','.join(str(v) for v in hs[i * nx:(i + 1) * nx]) for i in range(ny))
    js = (
        '// prefix: mb\n'
        '// ================================================================= MIRABILIS — Scale Model 5.1 neighborhood (GENERATED)\n'
        '// [G data] `python3 build.py --bake-model` writes this from tools/scale-model/model/data/h.png (2 km/px, origin 1191, 1569):\n'
        '// heights in 0.1 m ASL units (divide by 10 for metres ASL) and standing-water flag, px %d..%d x %d..%d around 350.0, 725.6\n'
        '// (Mirabilis pin 350, 726 +3124.9 m ASL; Yut-Ma r227 canyon at 350.02, 725.33 +2922.4 m ASL).\n'
        'var MB_MODEL={px0:%d,py0:%d,nx:%d,ny:%d,cell:2000,cx:350.0,cy:725.6,pin:[350,726],elev:3124.9,air:1.08,temp:12.0,rain:627,\n hd:[%s],\n wet:"%s"};\n'
        % (x0, x0 + nx - 1, y0, y0 + ny - 1, x0, y0, nx, ny, rows, ''.join(wet))
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
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp                           # noqa: E402
import kit_pack as _kp                              # noqa: E402

CORE_DIRS = [
    os.path.join(ROOT, 'core', *d.split('/'))
    for d in ('shader', 'rand', 'mask', 'drawn', 'sched', 'materials/record', 'tags',
              'furnish', 'water', 'atmos', 'door', 'walk', 'walk/box')
]
TERRAIN_FILES = [
    'core/terrain/35-core-strata.js',
    'core/terrain/36-core-carve.js',
    'core/terrain/37-core-stacks.js',
    'core/terrain/38-core-relief.js',
    'core/terrain/38c-core-landforms.js',
    'core/terrain/43-core-ground.js',
]
EXPORT_FILES = ['core/export/07-core-export.js', 'core/export/09-core-export-adapters.js']
CORE_HOST = list(dict.fromkeys(khost.FULL + kengine.HOST + kengine.INTERIORS_HOST + khost.KEYS))
INTERIOR_SETS = ['eternian']
FURN_CULTURES = ['eternian', 'generic', 'generic-goods', 'jobs', 'scrap', 'arms']

HY_READ = (
    '26k-kit.js', '27v-hy-vstack.js', '27z-hy-matfix.js', '34-hy-trades.js',
    '39-hy-furn.js', '40-hy-kit.js', '50-hy-dwell.js', '54-hy-state.js',
    '58-hy-faith-def.js', '62-hy-works.js', '66-hy-trades-land.js', '70-hy-street.js',
)
ET_READ = (
    '38-et-alt.js', '40-et-kit.js', '41-et-profile.js', '42-et-head.js',
    '43-et-statue.js', '44-et-roof.js', '46-et-civic-kit.js',
    '50-et-dwell.js', '51-et-dwell-mid.js', '52-et-dwell-rich.js', '53-et-court.js',
    '60-et-state.js', '61-et-defence.js', '64-et-trade-kit.js', '65-et-works.js', '66-et-trades.js',
)
RES_READ = ('42r-res-ore.js', '44r-res-nodes.js')
CONS_REL = 'kits/construction/src/10-cons-site.js'

CITY_JS = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js',
    '33-city-strategies.js', '36-city-covered.js', '37-city-grid.js', '40-city-kcity.js',
    '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js', '54-city-host-construct.js',
]
HAMLET_JS = [
    '10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js',
    '16-hamlet-names.js', '18-hamlet-names.js', '20-hamlet-cultures.js', '30-hamlet-village.js',
]
CAMP_JS = [
    '10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js', '50-camp-tents.js',
]
CROPS_JS = ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '24-crop-vale-wild.js', '40-crop-query.js']
SPACE_REL = 'core/space/20-core-space.js'

FLORA_CORE = list(dict.fromkeys(list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js',
    'core/biome/33b-core-bamboo.js',
]))
NWOW_JS = [
    'biomes/nwouterwall/src/46-biome-nwow-layout.js',
    'biomes/nwouterwall/src/50-biome-nwow-species.js',
    'biomes/nwouterwall/src/55-biome-nwow-trees.js',
    'biomes/nwouterwall/src/60-biome-nwow-floor.js',
    'biomes/nwouterwall/src/70-biome-nwow.js',
]
WOW_JS = [
    'biomes/wouterwall/src/46-biome-wow-layout.js',
    'biomes/wouterwall/src/50-biome-wow-species.js',
    'biomes/wouterwall/src/60-biome-wow-natives.js',
    'biomes/wouterwall/src/70-biome-wow.js',
]

SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {
    '26-matlib-pack.js', '38-furniture-bundle.js', kengine.INTERIORS_FRAGMENT,
    '38b-crops-bundle.js', '38c-kcity-bundle.js', '38d-cons-bundle.js',
    '38f-flora-bundle.js',
}
BUNDLE_GLOBALS = (
    'KratorFurniture', 'CROPS', 'KCITY', 'KRATOR_KITS', 'KHAMLET', 'KCAMP', 'KSPACE',
    'KCONS', 'MB_FLORA',
) + kengine.INTERIORS_GLOBALS


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
        if f == '../kits/10-core-kits.js':
            body += 'var KRATOR_KITS = window.KRATOR_KITS;\n'
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    body += '\nvar KCAMP = window.KCAMP = window.KCAMP || {};\n'
    for f in CAMP_JS:
        body += '\n/* ---- core/camp/%s ---- */\n%s\n' % (f, rd('core/camp/' + f))
    return (
        '/* ---- 38c-kcity-bundle.js ---- */\n'
        'var MB_CITY_CORE = (function(window){\n' + body +
        '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC,\n'
        '  obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly,\n'
        '  cg: function () { return CG; } };\n'
        'return { KSPACE: KSPACE, KCITY: KCITY, KRATOR_KITS: KRATOR_KITS, KHAMLET: KHAMLET, KCAMP: KCAMP };\n})(Object.create(window));\n'
        'var KSPACE = MB_CITY_CORE.KSPACE, KCITY = MB_CITY_CORE.KCITY, KRATOR_KITS = MB_CITY_CORE.KRATOR_KITS,\n'
        '    KHAMLET = MB_CITY_CORE.KHAMLET, KCAMP = MB_CITY_CORE.KCAMP;\n'
        'window.KRATOR_KITS = KRATOR_KITS;\n'
    )


def cons_bundle():
    return (
        '/* ---- 38d-cons-bundle.js ---- */\n'
        'var KCONS = (function(window){\n/* ---- %s ---- */\n%s\nreturn window.KCONS || KCONS;\n})(Object.create(window));\n'
        % (CONS_REL, rd(CONS_REL))
    )


def flora_bundle():
    part = lambda rel: '\n/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = (
        'BIO.init({ tags: "wouterwall", THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
        '  ticks: function (fn) { FRAME_HOOKS.push(function (dt, now) { fn(Math.min(0.1, dt == null ? 0.016 : dt), (now == null ? 0 : now) * 0.001); }); },\n'
        '  seed: 350726, origin: [[0, 0]], center: [0, 0], fields: {} });\n'
    )
    return (
        '/* ---- 38f-flora-bundle.js ---- */\n'
        'var MB_FLORA = (function (window) {\n'
        "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });\n"
        "Object.defineProperty(window, 'CROPS', { get: function () { return CROPS; } });\n" +
        ''.join(part(rel) for rel in FLORA_CORE) + boot +
        ''.join(part(rel) for rel in NWOW_JS) +
        ''.join(part(rel) for rel in WOW_JS) +
        '\nreturn { BIO: BIO, WOW: WOW, NWOW: NWOW };\n})(Object.create(window));\n'
    )


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return dict({
        '26-matlib-pack.js': _mp.fragment(HY_DIR, PACK_KEY, side=SIDE),
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES),
        '38b-crops-bundle.js': crops_bundle(),
        '38c-kcity-bundle.js': kcity_bundle(),
        '38d-cons-bundle.js': cons_bundle(),
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
    for rel in TERRAIN_FILES + EXPORT_FILES:
        f = os.path.basename(rel)
        paths[f] = os.path.join(ROOT, *rel.split('/'))
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY))
    paths.update(kengine.paths())
    core = dict(paths)
    for f in RES_READ:
        paths[f] = os.path.join(ROOT, 'kits', 'resources', 'src', f)
    for f in ET_READ:
        paths[f] = os.path.join(ET_SRC, f)
    for f in HY_READ:
        paths[f] = os.path.join(HY_SRC, f)
    upstream = dict(paths)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core, upstream


def sort_key(f):
    # Ensure core/terrain 35..43 load right after core/shader & core/rand (before 40-mb-ground / 42-mb-city)
    if f in ('35-core-strata.js', '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js', '38c-core-landforms.js'):
        return ('34t-' + f, f)
    if f == '43-core-ground.js':
        return ('34u-' + f, f)
    # Run Mirabilis [G data] (39e, 40-mb-ground, 41-mb-hydraulics, 42-mb-city) AFTER all kit defs (50..70)
    # so DEFS holds all 48 hy_* + 38 et_* + 15 node-* footprints when KRATOR_KITS & KCITY.multikit lay out the city!
    if f in ('39e-mb-model.js', '40-mb-ground.js', '41-mb-hydraulics.js', '42-mb-city.js'):
        return ('75-' + f, f)
    return (f, f)


def main():
    BSRC.note(
        *([SPACE_REL, CONS_REL] +
          [os.path.normpath(os.path.join('core', 'city', f)).replace(os.sep, '/') for f in CITY_JS] +
          ['core/hamlet/' + f for f in HAMLET_JS] +
          ['core/camp/' + f for f in CAMP_JS] +
          ['kits/crops/src/' + f for f in CROPS_JS] +
          FLORA_CORE + NWOW_JS + WOW_JS +
          ([os.path.relpath(HY_TEX_PACK, ROOT).replace(os.sep, '/')] if os.path.isfile(HY_TEX_PACK) else []))
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
            if not (re.match(r'[4-7]\d[a-z]?-', f) and f.endswith('.js')) or is_core(f) or f in VIRTUAL:
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
