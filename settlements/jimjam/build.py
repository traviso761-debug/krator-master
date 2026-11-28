#!/usr/bin/env python3
"""Build Jimjam: both the expanded architectural/trade kit sheet (`dist/jimjam-kit.html`) and
the 1:1 Scale Model 5.1 Voth-sized 50,000-person city page (`dist/jimjam.html` + `.tex.*.js` sidecars).

    python3 tools/build.py settlements/jimjam           # builds dist/jimjam-kit.html AND dist/jimjam.html
    python3 tools/build.py settlements/jimjam --kit     # builds dist/jimjam-kit.html only
    python3 tools/build.py settlements/jimjam --city    # builds dist/jimjam.html only
    python3 settlements/jimjam/build.py --bake-model    # bakes targets/city/28-jj-model.js from Scale Model 5.1
    python3 settlements/jimjam/build.py --vendor-check  # checks vendored Ancients/sky/materials fragments
"""
import hashlib
import io
import json
import math
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
KIT_TARGET = os.path.join(HERE, 'targets', 'kit')
CITY_TARGET = os.path.join(HERE, 'targets', 'city')
DIST = os.path.join(HERE, 'dist')
MODEL_OUT = os.path.join(CITY_TARGET, '28-jj-model.js')
SITE_JSON = os.path.join(HERE, 'site', 'jimjam-site.json')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--bake-model' not in sys.argv and '--vendor-check' not in sys.argv:
    buildlib.through_tools_build(__file__)
import build_sources as BSRC                      # noqa: E402


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places."""
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


def bake_model():
    """Bake deterministic [G data] Scale Model 5.1 height/wet grid, 360-deg horizon profile, geology & corridors at (745, 546)."""
    from PIL import Image
    data_dir = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    im = Image.open(os.path.join(data_dir, 'h.png')).convert('RGB')
    W, H = im.size
    px_pin, py_pin = 745, 546

    def h_px(x, y):
        x = max(0, min(W - 1, x))
        y = max(0, min(H - 1, y))
        r, g, b = im.getpixel((x, y))
        return (r * 256 + g) / 65535.0 * 29600.0 - 2600.0, (b > 127)

    datum_raw, _ = h_px(px_pin, py_pin)
    datum = round(datum_raw, 1)   # +486.2 m ASL

    rx0, ry0, rnx, rny = px_pin - 15, py_pin - 15, 31, 31
    reg_dm, wet_bits = [], []
    for y in range(ry0, ry0 + rny):
        for x in range(rx0, rx0 + rnx):
            hv, wv = h_px(x, y)
            reg_dm.append(int(round((hv - datum) * 10.0)))
            wet_bits.append('1' if wv else '0')

    # 360-deg terrain horizon profile from the Great Solstice Temple observer eye (+514.0 + 13.7 = +527.7 m ASL) out to 160 km
    obs_asl = 514.0 + 13.7
    hz_alt, hz_dist = [], []
    for az in range(360):
        rad = math.radians(az)
        dx, dy = math.sin(rad), -math.cos(rad)
        best_a, best_d = -90.0, 0.0
        for step in range(4, 321):
            dkm = step * 0.5
            dm = dkm * 1000.0
            fx = px_pin + dx * (dkm / 2.0)
            fy = py_pin + dy * (dkm / 2.0)
            ix, iy = int(math.floor(fx)), int(math.floor(fy))
            u, v = fx - ix, fy - iy
            z00, _ = h_px(ix, iy)
            z10, _ = h_px(ix + 1, iy)
            z01, _ = h_px(ix, iy + 1)
            z11, _ = h_px(ix + 1, iy + 1)
            zh = (z00 * (1.0 - u) + z10 * u) * (1.0 - v) + (z01 * (1.0 - u) + z11 * u) * v
            alt = math.degrees(math.atan2(zh - obs_asl, dm))
            if alt > best_a:
                best_a = alt
                best_d = round(dkm, 1)
        hz_alt.append(round(best_a, 3))
        hz_dist.append(best_d)

    geo_path = os.path.join(ROOT, 'kits', 'resources', 'data', 'geology.json')
    geo_pin, geo_near = {}, {}
    keys = ('stone', 'wood', 'water', 'clay', 'gypsum', 'alabaster', 'emerald', 'iron',
            'copper', 'tin', 'marble', 'silica', 'saltpeter', 'halite', 'potash', 'coal', 'gold', 'silver')
    if os.path.isfile(geo_path):
        with io.open(geo_path, encoding='utf-8') as fh:
            gdoc = json.load(fh)
        gw, gh = gdoc['grid']['w'], gdoc['grid']['h']
        gx0, gy0 = px_pin // 2, py_pin // 2
        gi0 = gy0 * gw + gx0
        for k in keys:
            lay = gdoc.get('layers', {}).get(k)
            if isinstance(lay, list) and gi0 < len(lay):
                geo_pin[k] = lay[gi0]
                best = lay[gi0]
                for dy in range(-4, 5):
                    for dx in range(-4, 5):
                        if dx * dx + dy * dy > 16:
                            continue
                        nx, ny = max(0, min(gw - 1, gx0 + dx)), max(0, min(gh - 1, gy0 + dy))
                        val = lay[ny * gw + nx]
                        if val > best:
                            best = val
                geo_near[k] = best
    for k, fb_p, fb_n in (('stone', 60, 220), ('wood', 255, 255), ('water', 255, 255), ('clay', 230, 255),
                          ('gypsum', 94, 127), ('alabaster', 80, 102), ('emerald', 95, 130), ('iron', 90, 180),
                          ('copper', 0, 10), ('tin', 0, 0), ('marble', 0, 0), ('silica', 0, 0),
                          ('saltpeter', 40, 110), ('halite', 0, 20), ('potash', 0, 0), ('coal', 0, 62),
                          ('gold', 0, 40), ('silver', 0, 40)):
        geo_pin.setdefault(k, fb_p)
        geo_near.setdefault(k, fb_n)

    corridors = {
        'whitepass.north': {
            'name': 'Ria Sound / Arkerum -> White Pass (5,400 m) -> Whitelake -> Leng -> Veladiga -> Jimjam',
            'gate': 'gate.whitepass_north',
            'compound': 'jj_whitepass_compound'
        },
        'cut.south': {
            'name': 'Jimjam -> Tamarai-kuppam -> North Cut Sill -> Kotgeta -> Dilihan',
            'gate': 'gate.cut_south'
        },
        'lake.lbl77': {
            'name': 'Jimjam Lotus Harbour <-> Vellai-kal <-> Barada-Quay <-> Palewharf (Eternal State)',
            'gate': 'gate.lotus_water'
        },
        'ardent.serai.east': {
            'name': 'Jimjam <-> Ardent (Free Clans) & Serai (Dam 2 Soda Lake)',
            'gate': 'gate.serai_east'
        }
    }

    rows = ',\n '.join(','.join(str(v) for v in reg_dm[j * rnx:(j + 1) * rnx]) for j in range(rny))
    js = (
        '// ================================================================= JIMJAM — Scale Model 5.1 cut at (745, 546) (GENERATED)\n'
        '// [G data] `python3 settlements/jimjam/build.py --bake-model` writes this from tools/scale-model/model/data/h.png\n'
        '// and kits/resources/data/geology.json. Pin st5e01l76v (px 745, py 546), datum +%.1f m ASL above +429.78 m Great\n'
        '// Trough Lake (lbl=77), lat -34.34 deg S, subGiantLon 56.27 deg, 1.506 atm, 31x31 regional grid (60 x 60 km at\n'
        '// 2,000 m/px) in decimetres relative to datum, wet mask, and 360-deg horizon profile from the +527.7 m Solstice eye.\n'
        'var JJ_MODEL={\n'
        ' id:"st5e01l76v",name:"Jimjam",jamtokku:"Jimjam-Pattinam",polity:"Kingdom of Jimjam",\n'
        ' px:%d,py:%d,legacyPx:[473,216],datum:%.1f,lakeComponent:77,lakeAsl:429.78,\n'
        ' latitude:-34.34,subGiantLon:56.27,pressureAtm:1.506,koppen:"Am",\n'
        ' rx0:%d,ry0:%d,rnx:%d,rny:%d,cell:2000,\n'
        ' regDm:[\n %s],\n'
        ' wet:"%s",\n'
        ' horizonAlt:[%s],\n'
        ' horizonDistKm:[%s],\n'
        ' geologyPin:%s,\n'
        ' geologyNear15km:%s,\n'
        ' corridors:%s\n'
        '};\n'
        % (datum, px_pin, py_pin, datum, rx0, ry0, rnx, rny,
           rows,
           ''.join(wet_bits),
           ','.join(str(v) for v in hz_alt),
           ','.join(str(v) for v in hz_dist),
           json.dumps(geo_pin, separators=(',', ':'), sort_keys=True),
           json.dumps(geo_near, separators=(',', ':'), sort_keys=True),
           json.dumps(corridors, separators=(',', ':'), sort_keys=True))
    )
    os.makedirs(CITY_TARGET, exist_ok=True)
    with io.open(MODEL_OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL_OUT, ROOT).replace(os.sep, '/'))


# Core modules explicitly adopted across the city build (tools/check_core_use.py)
CORE_TAKEN = (
    'core/shader', 'core/rand', 'core/mask', 'core/drawn', 'core/space', 'core/city', 'core/hamlet', 'core/camp',
    'core/tags', 'core/furnish', 'core/interiors', 'core/door', 'core/walk', 'core/sched', 'core/simulation',
    'core/charactermodels', 'core/water', 'core/coast', 'core/terrain', 'core/atmos', 'core/materials',
    'core/biome', 'core/lod', 'core/clock', 'core/minimap', 'core/export', 'core/host'
)

CORE_MAT_DIR = os.path.join(ROOT, 'core', 'materials')
SHARED_MATERIALS = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
SOCKETS = os.path.join(ROOT, 'core', 'sockets')
LOD_DIR = os.path.join(ROOT, 'core', 'lod')
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[:1].isdigit())
RECORD_DIR = os.path.join(ROOT, 'core', 'materials', 'record')
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']
TEX_DIR = os.path.join(HERE, 'tex')
PACK_FRAGMENT = '46-matlib-pack.js'
TAGS_FILES = {f: os.path.join(ROOT, 'core', d, f) for d in ('rand', 'tags')
              for f in os.listdir(os.path.join(ROOT, 'core', d)) if f[:1].isdigit() and f.endswith('.js')}

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost                              # noqa: E402
KIT_CORE_HOST = [f for f in khost.FULL if f != '40-core-edits.js'] + khost.KEYS
SHARED_CORE = set(TAGS_FILES) | set(KIT_CORE_HOST)
MANIFEST_FILES = [
    '10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
    '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js',
    '81-sky.js', '37-sockets.js', '80-cultures.js', *SHARED_MATERIALS,
]
KIT_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
BUILDER = re.compile(r'^function\s+(buildJj\w*)\s*\([^)]*\)\s*\{(.{0,100})', re.M)
PREFIX_FILES = {'60-jj-mat.js', '61-jj-helpers.js'}
ALLOWED_TARGET_GLOBALS = {
    'TITLE', 'GROUND_C', 'SITES', 'VIEWS', 'JJ_FURN_SITES', 'JJ_FLORA_SITES',
    'JJ_ROW_ORDER', 'JJ_ROWS', 'JJ_ROW_Z', 'JJ_ROW_GAP'
}


def vendor_check():
    ancients = os.path.join(ROOT, 'kits', 'ancients', 'src')
    checks = [('placeholder', '81-sky.js', os.path.join(ROOT, 'core', 'atmos', 'placeholder', '81-sky.js'))]
    checks.extend(('materials', f, os.path.join(CORE_MAT_DIR, f)) for f in SHARED_MATERIALS)
    checks.extend(('sockets', f, os.path.join(SOCKETS, f)) for f in ('37-sockets.js', '80-cultures.js'))
    drift = []
    for kind, f, upstream in checks:
        local = os.path.join(SRC, f) if kind != 'materials' and kind != 'sockets' else os.path.join(CORE_MAT_DIR if kind == 'materials' else SOCKETS, f)
        if not os.path.exists(upstream) or not os.path.exists(local) or open(upstream, 'rb').read() != open(local, 'rb').read():
            drift.append(f'{kind}/{f}')
    for f in MANIFEST_FILES:
        if f in SHARED_MATERIALS or f in ('37-sockets.js', '80-cultures.js', '81-sky.js'):
            continue
        upstream = os.path.join(ancients, f)
        local = os.path.join(SRC, f)
        if os.path.exists(ancients) and (not os.path.exists(upstream) or open(upstream, 'rb').read() != open(local, 'rb').read()):
            drift.append(f'ancients/{f}')
    print('vendor-check: ' + ('all available upstream fragments match' if not drift else 'drift: ' + ', '.join(drift)))
    if drift:
        raise SystemExit(1)


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)
if '--vendor-check' in sys.argv:
    vendor_check()
    sys.exit(0)

# Port lint first (tools/check_port.py)
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and not BSRC.LISTING and '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


# ==============================================================================
# TARGET 1: KIT SHEET (dist/jimjam-kit.html)
# ==============================================================================
def kit_source_paths():
    files = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[:1].isdigit()}
    for f in SHARED_MATERIALS:
        if f not in files:
            files[f] = os.path.join(CORE_MAT_DIR, f)
    for f in LOD_FILES:
        if f not in files:
            files[f] = os.path.join(LOD_DIR, f)
    for f in RECORD_FILES:
        if f not in files:
            files[f] = os.path.join(RECORD_DIR, f)
    for f, p in TAGS_FILES.items():
        if f not in files:
            files[f] = p
    khost.resolve(files, KIT_CORE_HOST)
    files[PACK_FRAGMENT] = None
    target_files = {f: os.path.join(KIT_TARGET, f) for f in os.listdir(KIT_TARGET) if f[:1].isdigit()}
    overlap = set(files) & set(target_files)
    if overlap:
        raise SystemExit('target shadows source fragments: ' + ', '.join(sorted(overlap)))
    files.update(target_files)
    return dict(sorted(files.items()))


def kit_matlib_pack():
    import base64
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: Jimjam runs on its procedural textures */\nKMAT.pack('jimjam', {});\n"
    pack = json.load(open(pj, encoding='utf-8'))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return ("/* ============================== LIBRARY PACK (generated) ============================== */\n"
            "KMAT.pack('jimjam', {\n" + ',\n'.join(out) + '\n});\n')


def validate_kit(bodies):
    errors = []
    owners = {}
    for filename, body in bodies.items():
        if filename in SHARED_CORE:
            continue
        if filename.endswith('.js'):
            for match in BUILDER.finditer(body):
                if 'reseed(' not in match.group(2):
                    errors.append(f'{filename}: {match.group(1)} must open with reseed(seed)')
        for name in KIT_DECL.findall(body):
            if filename in PREFIX_FILES and not (name.lower().startswith('j') or name.startswith('buildJj')):
                errors.append(f'{filename}: top-level name {name!r} must use the JJ prefix')
            if filename.startswith('89z-') and name not in ALLOWED_TARGET_GLOBALS and name not in {'jj_helper_gallery'}:
                errors.append(f'{filename}: unexpected target global {name!r}')
            owners.setdefault(name, []).append(filename)
    for name, files in owners.items():
        if len(files) > 1:
            errors.append(f'top-level name {name!r} is declared in: {", ".join(files)}')
    if errors:
        raise SystemExit('BUILD RULES FAILED:\n  - ' + '\n  - '.join(errors))


def prepare_kit():
    paths = kit_source_paths()
    bodies = {}
    for f, path in paths.items():
        if path is None:
            bodies[f] = '' if BSRC.LISTING else kit_matlib_pack()
            continue
        with io.open(path, encoding='utf-8', newline='') as src:
            bodies[f] = src.read()
    if not BSRC.LISTING:
        validate_kit(bodies)
    return paths, bodies


def write_vendor_manifest():
    hashes = {}
    for f in MANIFEST_FILES:
        path = os.path.join(SRC, f)
        if not os.path.exists(path):
            path = os.path.join(CORE_MAT_DIR if f in SHARED_MATERIALS else SOCKETS, f)
        with open(path, 'rb') as src:
            hashes[f] = hashlib.sha1(src.read()).hexdigest()[:12]
    three = os.path.join(HERE, 'three.min.js')
    if os.path.exists(three):
        with open(three, 'rb') as src:
            hashes['three.min.js'] = hashlib.sha1(src.read()).hexdigest()[:12]
    with io.open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8', newline='\n') as out:
        json.dump(hashes, out, indent=2, sort_keys=True)
        out.write('\n')


def finish_kit(paths, bodies):
    html = ''.join(bodies.values())
    title_match = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if title_match:
        html = re.sub(r'<title>.*?</title>', '<title>' + title_match.group(1) + '</title>', html, count=1)
    os.makedirs(DIST, exist_ok=True)
    output = os.path.join(DIST, 'jimjam-kit.html')
    with io.open(output, 'w', encoding='utf-8', newline='') as dst:
        dst.write(html)
    with io.open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as dst:
        json.dump({f: hashlib.sha1(body.encode()).hexdigest()[:12] for f, body in bodies.items()}, dst, indent=2, sort_keys=True)
        dst.write('\n')
    write_vendor_manifest()
    node = find_node()
    script = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    scratch = os.path.join(HERE, '.syntax-jimjam-kit.js')
    with io.open(scratch, 'w', encoding='utf-8', newline='\n') as dst:
        dst.write(script)
    try:
        if node:
            result = subprocess.run([node, '--check', scratch], capture_output=True, text=True)
            if result.returncode:
                print(result.stdout + result.stderr)
                raise SystemExit(result.returncode)
            syntax = 'syntax OK'
        else:
            syntax = 'syntax not checked (Node.js not found)'
    finally:
        try:
            os.remove(scratch)
        except OSError:
            pass
    print(f'built dist/jimjam-kit.html ({len(paths)} fragments, {os.path.getsize(output)/1024:.1f} KB; {syntax})')


# ==============================================================================
# TARGET 2: 1:1 SCALE MODEL 5.1 METROPOLIS PAGE (dist/jimjam.html + sidecars)
# ==============================================================================
def rd_rel(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def safe_js(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js',
           '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '21-hamlet-iziz.js', '30-hamlet-village.js']
CAMP_JS = ['10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js']

CORE_BIOME = list(dict.fromkeys(list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31b-core-leafset.js', 'core/biome/31j-core-joint.js',
    'core/biome/32-core-variants.js', 'core/biome/33-core-fungoid.js', 'core/biome/33b-core-bamboo.js',
    'core/biome/34-core-impostor.js', 'core/biome/35-core-anim.js', 'core/biome/35b-core-anim-turn.js',
    'core/biome/41-core-env.js',
]))
NWLOW_JS = [
    'biomes/nwlowlands/src/50-biome-nwlowlands-species.js',
    'biomes/nwlowlands/src/55-biome-nwlowlands-trees.js',
    'biomes/nwlowlands/src/60-biome-nwlowlands-floor.js',
    'biomes/nwlowlands/src/70-biome-nwlowlands.js',
]


def jj_kcity_bundle():
    body = '\nvar KSPACE = window.KSPACE;\n'
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd_rel('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd_rel('core/hamlet/' + f))
    for f in CAMP_JS:
        body += '\n/* ---- core/camp/%s ---- */\n%s\n' % (f, rd_rel('core/camp/' + f))
    return safe_js(
        '/* KCITY, KHAMLET, KCAMP: core/city, core/hamlet, core/camp in one closure (settlements/jimjam/build.py). GENERATED. */\n'
        'var JJ_CITY_CORE = (function(window){\n' + body +
        '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE,\n'
        '  Raster: Raster, OCC: OCC, V: V, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist,\n'
        '  resample: resample, clamp: clamp, inPoly: inPoly, ryFacing: ryFacing, cg: function () { return CG; } };\n'
        'return { KCITY: KCITY, KHAMLET: KHAMLET, KCAMP: window.KCAMP };\n})(Object.create(window));\n'
        'var KCITY = JJ_CITY_CORE.KCITY, KHAMLET = JJ_CITY_CORE.KHAMLET, KCAMP = JJ_CITY_CORE.KCAMP;\n'
    )


def jj_flora_bundle():
    part = lambda rel: '\n/* ---- %s ---- */\n%s\n' % (rel, rd_rel(rel))
    boot = (
        '\nBIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, waterH: function () { return -1e9; },\n'
        '  mask: function () { return 0; }, obstacles: [],\n'
        '  ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },\n'
        '  seed: 745546, origin: [[0, 0]], center: [0, 0], fields: {} });\n'
    )
    return safe_js(
        '/* JJ_FLORA_BUNDLE: core/biome and biomes/nwlowlands in one closure. GENERATED. */\n'
        'var JJ_FLORA_BUNDLE = (function (window) {\n'
        "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });\n" +
        ''.join(part(f) for f in CORE_BIOME) + boot +
        'var NWLOW = (function () {\n' + ''.join(part(f) for f in NWLOW_JS) + '\nreturn NWLOW;\n})();\n' +
        '\nreturn { BIO: BIO, NWLOW: NWLOW };\n})(Object.create(window));\n'
    )


def prepare_city():
    core = lambda *p: os.path.join(ROOT, 'core', *p)
    PATH = {f: os.path.join(CITY_TARGET, f) for f in os.listdir(CITY_TARGET) if f[:1].isdigit()} if os.path.isdir(CITY_TARGET) else {}

    # 1. Core shader, export, rand, lod, mask, coast, space, drawn, terrain, walk, sched, kchar, stage, tags, furnish
    PATH['06-core-khook.js'] = core('shader', '06-core-khook.js')
    PATH['06b-core-kcolor.js'] = core('shader', '06b-core-kcolor.js')
    PATH['07-core-export.js'] = core('export', '07-core-export.js')
    PATH['08-core-rand.js'] = core('rand', '08-core-rand.js')
    PATH['09-core-export-adapters.js'] = core('export', '09-core-export-adapters.js')
    PATH['09a-core-export-scene.js'] = core('export', '10-core-export-scene.js')
    PATH['09b-lod.js'] = core('lod', '09-lod.js')
    PATH['97-lod-auto.js'] = core('lod', '97-lod-auto.js')
    PATH['10-core-drawn.js'] = core('drawn', '10-core-drawn.js')
    PATH['20-core-space.js'] = core('space', '20-core-space.js')
    PATH['20-core-walk.js'] = core('walk', '20-core-walk.js')
    PATH['20b-core-sched.js'] = core('sched', '20-core-sched.js')
    PATH['20c-core-kchar.js'] = core('charactermodels', 'src', '10-rig.js')
    PATH['44d-core-stage.js'] = core('biome', '44-core-stage.js')
    PATH['25-core-mask.js'] = core('mask', '25-core-mask.js')
    PATH['26-core-mask-xform.js'] = core('mask', '26-core-mask-xform.js')
    PATH['27-core-mask-distance.js'] = core('mask', '27-core-mask-distance.js')
    PATH['27d-core-coast.js'] = core('coast', '30-core-coast.js')
    PATH['27e-core-strata.js'] = core('terrain', '35-core-strata.js')
    PATH['27f-core-carve.js'] = core('terrain', '36-core-carve.js')
    PATH['27g-core-relief.js'] = core('terrain', '38-core-relief.js')
    PATH['27h-core-ground.js'] = core('terrain', '43-core-ground.js')
    for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
        PATH[f] = core('tags', f)
    for f in sorted(os.listdir(core('furnish'))):
        if f[:1].isdigit() and f.endswith('.js'):
            PATH['69d0-' + f] = core('furnish', f)

    # 2. Crops (CROPS) & Construction (KCONS)
    CROPS_JS = ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']
    for idx, cf in enumerate(CROPS_JS):
        PATH['23c%d-%s' % (idx, cf)] = os.path.join(ROOT, 'kits', 'crops', 'src', cf)
    PATH['54a-cons-site.js'] = os.path.join(ROOT, 'kits', 'construction', 'src', '10-cons-site.js')
    PATH['54b-city-host-construct.js'] = core('city', '54-city-host-construct.js')

    # 3. Ancients runtime + shared materials + doors + sockets + placeholder sky math (for 74-jj-sacred.js)
    ANC = os.path.join(ROOT, 'kits', 'ancients')
    ANC_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js',
                   '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js']
    for f in ANC_RUNTIME + SHARED_MATERIALS:
        p = os.path.join(ANC, 'src', f)
        PATH[f] = p if os.path.isfile(p) else core('materials', f)
    PATH['69a-world-uv.js'] = core('materials', 'opt', '69a-world-uv.js')
    for f in RECORD_FILES:
        PATH[f] = os.path.join(RECORD_DIR, f)
    for f in ('10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js'):
        PATH['69a1-' + f if f != '90-core-door-host.js' else f] = core('door', f)
    for f in ('37-sockets.js', '80-cultures.js'):
        PATH[f] = os.path.join(SOCKETS, f)
    PATH['81-sky.js'] = core('atmos', 'placeholder', '81-sky.js')

    # 4. Full Expanded Jimjam Kit (src/60..84 including 70b, 73b, 73c, 74b), read in place
    JJ_KIT_FILES = [
        '60-jj-mat.js', '61-jj-helpers.js', '62-jj-culture.js', '63-jj-zfix.js',
        '70-jj-housing.js', '70b-jj-housing-more.js', '71-jj-shops.js', '72-jj-hospitality.js',
        '73-jj-civic.js', '73b-jj-work.js', '73c-jj-economy.js',
        '74-jj-sacred.js', '74b-jj-celestial.js', '75-jj-palace.js', '76-jj-military.js',
        '77-jj-agri.js', '78-jj-trades.js', '84-jj-furniture.js'
    ]
    for f in JJ_KIT_FILES:
        PATH['65j-' + f if f[0] in ('7', '8') else f] = os.path.join(SRC, f)

    # 5. Iziz Vernacular (vern_*) + Dilihan Vassal Kit (dil_*), read in place for Former Izani Enclave & Factor Row
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
    import vernacular as kvern                    # noqa: E402
    IV_DIR = os.path.join(ROOT, 'kits', 'iziz-vernacular')
    for f in kvern.BUNDLE_BASE + [os.path.basename(p) for p in kvern.building_files()]:
        PATH[f] = kvern.path(f)

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'dilihan'))
    import dilihan as kdil                        # noqa: E402
    for f in kdil.BASE + kdil.BUILDINGS:
        PATH[f] = kdil.path(f)

    # 6. Core simulation (77-sim-*.js; 6d & 6p load after 77-sim-7-lod.js so SIM.level is wrapped) + water + atmos + host
    SIM_DIR = core('simulation')
    for sf in sorted(os.listdir(SIM_DIR)):
        if sf.startswith('77-sim-') and sf.endswith('.js'):
            skey = '77-sim-7z1-decrees.js' if sf == '77-sim-6d-decrees.js' else (
                   '77-sim-7z2-pilgrims.js' if sf == '77-sim-6p-pilgrims.js' else sf)
            PATH[skey] = os.path.join(SIM_DIR, sf)
    for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
        PATH[f] = core('water', f)
    for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
        PATH[f] = core('atmos', f)
    for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
        PATH[f] = core('atmos', 'host', f)
    for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
        PATH[f] = core('atmos', 'sky', f)
    khost.resolve(PATH, khost.FULL + khost.KEYS)

    # 7. Catalog furniture + PBR sidecar texture packs (jimjam + iziz-vernacular; dil_* aliases onto jimjam for 0 extra bytes!)
    for d in (('kits', 'catalog'), ('kits', 'interiors'), ('tools', 'textures')):
        sys.path.insert(0, os.path.join(ROOT, *d))
    import furniture_bundle, kit_bundle, matlib_pack  # noqa: E402

    FURN_CULTURES = ['jimjam', 'iziz', 'hykkousoi', 'order', 'eternian', 'khaayken', 'republican', 'generic', 'generic-goods']
    PEOPLES_JSON = os.path.join(ROOT, 'core', 'charactermodels', 'data', 'peoples.json')
    NWLOW_DIR = os.path.join(ROOT, 'biomes', 'nwlowlands')
    SIDE = {}
    BUNDLES = {
        '23p-jj-peoples.js': lambda: '/* core/charactermodels/data/peoples.json (GENERATED) */\nvar JJ_PEOPLES = ' + safe_js(rd_rel('core/charactermodels/data/peoples.json')) + ';\n',
        '24-jj-kcity-bundle.js': jj_kcity_bundle,
        '69d1-furniture-bundle.js': lambda: furniture_bundle.bundle(FURN_CULTURES, tex=True) + kit_bundle.bundle(['iziz']),
        '86z-jj-flora-bundle.js': jj_flora_bundle,
    }
    VIRTUAL = {
        '44a-matlib-pack-jimjam.js': matlib_pack.fragment(HERE, 'jimjam', side=SIDE),
        '44b-matlib-pack-vern.js': matlib_pack.fragment(IV_DIR, 'iziz-vernacular', side=SIDE),
        '44c-matlib-pack-nwlowlands.js': matlib_pack.fragment(NWLOW_DIR, 'nwlowlands', side=SIDE),
        '69b5-vern-matlib-bind.js': (
            'if (typeof KMAT !== "undefined" && KMAT.bindMat) KMAT.bindMat("iziz-vernacular", MAT, { tile: KMAT.ANCIENT_TILES });\n'
        ),
        '69r5-dil-matlib-bind.js': (
            'if (typeof KMAT !== "undefined" && KMAT.bindMat) KMAT.bindMat("jimjam", MAT, { alias: %s });\n'
            % json.dumps(kdil.JIMJAM_MAT_ALIAS, sort_keys=True)
        ),
        khost.EDITS_JS: khost.edits_js(HERE, 'jimjam'),
    }

    BSRC.note(*(
        ['core/city/' + f for f in CITY_JS] +
        ['core/hamlet/' + f for f in HAMLET_JS] +
        ['core/camp/' + f for f in CAMP_JS] +
        ['core/charactermodels/data/peoples.json'] +
        CORE_BIOME + NWLOW_JS +
        ([os.path.relpath(SITE_JSON, ROOT).replace(os.sep, '/')] if os.path.isfile(SITE_JSON) else [])
    ))
    if not BSRC.LISTING:
        VIRTUAL.update({f: fn() for f, fn in BUNDLES.items()})
    else:
        VIRTUAL.update({f: '' for f in BUNDLES})
    for f in VIRTUAL:
        PATH[f] = None

    missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
    if missing:
        sys.exit('missing city fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))

    frags = sorted(PATH)
    bodies = {}
    for f in frags:
        if PATH[f] is None:
            bodies[f] = VIRTUAL[f]
        else:
            with io.open(PATH[f], encoding='utf-8') as fh:
                bodies[f] = fh.read()

    if not BSRC.LISTING:
        DECL = re.compile(r'^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|;))', re.M)
        seen, clash = {}, []
        for f in frags:
            if not f.endswith('.js') or f in BUNDLES or f in VIRTUAL:
                continue
            s = bodies[f]
            code = re.sub(r'^\s*(//[^\n]*\n|/\*.*?\*/\s*)*', '', s, flags=re.S)
            if re.match(r'[;(]*\s*\(?\s*(function|\(\)\s*=>)', code):
                continue
            for m in DECL.finditer(s):
                n = m.group(1) or m.group(2)
                line_end = s.find('\n', m.start())
                stmt = s[m.start():line_end if line_end > 0 else len(s)]
                if re.match(r'^var\s+' + re.escape(n) + r'\s*=\s*(?:globalThis\.)?' + re.escape(n) + r'\s*\|\|', stmt):
                    continue
                if n in seen and seen[n] != f:
                    clash.append('%s (%s, %s)' % (n, seen[n], f))
                seen.setdefault(n, f)
        if clash:
            sys.exit('city top-level names declared twice: ' + '; '.join(clash))

    return PATH, frags, bodies, SIDE, matlib_pack


def finish_city(PATH, frags, bodies, SIDE, matlib_pack):
    out = []
    for f in frags:
        if f.endswith('.js'):
            rel_label = f if PATH[f] is None else os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')
            out.append('\n// ==================== %s\n' % rel_label)
        out.append(bodies[f])

    os.makedirs(DIST, exist_ok=True)
    html = ''.join(out)
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'jimjam.tex.js')
    out_path = os.path.join(DIST, 'jimjam.html')
    with io.open(out_path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)

    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    js = m.group(1) if m else ''
    chk = os.path.join(HERE, '.syntax-jimjam-city.js')
    with io.open(chk, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    node = find_node()
    r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
    try:
        os.remove(chk)
    except OSError:
        pass
    if r and r.returncode != 0:
        print('CITY SYNTAX ERROR\n' + r.stderr[:800])
        sys.exit(r.returncode)
    print('built dist/jimjam.html (%d fragments, %d KB; %s)' % (
        len(frags), len(html) // 1024,
        'syntax OK' if r else 'syntax NOT CHECKED'))


def main():
    only_kit = '--kit' in sys.argv
    only_city = '--city' in sys.argv
    do_kit = not only_city
    do_city = not only_kit

    kit_data = prepare_kit() if (do_kit or BSRC.LISTING) else None
    city_data = prepare_city() if (do_city or BSRC.LISTING) else None

    BSRC.report(
        [p for p in (kit_data[0].values() if kit_data else []) if p is not None],
        [city_data[0][f] for f in (city_data[1] if city_data else []) if city_data[0][f] is not None],
        vendor_check=vendor_check
    )

    if do_kit and kit_data:
        finish_kit(*kit_data)
    if do_city and city_data:
        finish_city(*city_data)


if __name__ == '__main__':
    main()
