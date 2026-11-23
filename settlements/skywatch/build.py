#!/usr/bin/env python3
"""Skywatch (s8921htcjy, px 776, py 470, +3,745.5 m): Royal Observatory, Skarn-Brass Pass Citadel & Silent-Barter Moot.

Built from Scale Model 5.1 ground and five architectural tiers (PLAN.md):
  Tier I    Upper Observatory Crag, Raja's Eye brass dome, JJ_SOLSTICE sanctuary, 360-deg basalt horizon ring & beacons
  Tier II   Pass-Gate Citadel & sunny north-slope switchback town on KCITY + vaulted rock-cut step-cisterns + KHAMLET
  Tier III  Leeward Caravanserai, royal salt/grain vaults, KRUINS salvage assay yard & KCAMP convoy laagers
  Tier IV   Copper-zinc skarn adits (RES_ORE) & katabatic wind-furnace brass works
  Tier V    The Silent Moot (13 frost-split basalt monoliths sighting Equinox Sunrise Az 90.00 deg) & KCAMP Sasquatch camps

    python3 tools/build.py settlements/skywatch    # writes dist/skywatch.html, sidecar tex & build-inputs.json
    python3 settlements/skywatch/build.py --bake-model   # rewrite src/28-sw-model.js from Scale Model 5.1
"""
import io, json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'skywatch.html'
MODEL = os.path.join(SRC, '28-sw-model.js')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--bake-model' not in sys.argv:
    buildlib.through_tools_build(__file__)        # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)


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


def bake_model():
    """Bake deterministic [G data] Scale Model 5.1 height grid, 360-deg horizon profile, and geology at (776, 470)."""
    from PIL import Image
    data_dir = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    im = Image.open(os.path.join(data_dir, 'h.png')).convert('RGB')
    W, H = im.size
    px_pin, py_pin = 776, 470

    def h_px(x, y):
        x = max(0, min(W - 1, x))
        y = max(0, min(H - 1, y))
        r, g, _ = im.getpixel((x, y))
        return (r * 256 + g) / 65535.0 * 29600.0 - 2600.0

    datum = round(h_px(px_pin, py_pin), 1)   # +3745.5 m ASL
    # Regional 29 x 29 pixel window (px 762..790, py 456..484 -> 56 x 56 km at 2,000 m/px), decimetres above datum
    rx0, ry0, rnx, rny = px_pin - 14, py_pin - 14, 29, 29
    reg_dm = []
    for y in range(ry0, ry0 + rny):
        for x in range(rx0, rx0 + rnx):
            reg_dm.append(int(round((h_px(x, y) - datum) * 10.0)))

    # 360-degree horizon profile from (776, 470) + 18 m observatory podium out to 350 km (R_eff = 7,323 km)
    r_eff = 7323000.0
    obs_asl = h_px(px_pin, py_pin) + 18.0
    hz_alt, hz_dist = [], []
    for az in range(360):
        rad = math.radians(az)
        dx, dy = math.sin(rad), -math.cos(rad)
        best_a, best_d = -90.0, 0.0
        for dkm in range(2, 351):
            dm = dkm * 1000.0
            fx = px_pin + dx * (dkm / 2.0)
            fy = py_pin + dy * (dkm / 2.0)
            ix, iy = int(math.floor(fx)), int(math.floor(fy))
            u, v = fx - ix, fy - iy
            z00, z10 = h_px(ix, iy), h_px(ix + 1, iy)
            z01, z11 = h_px(ix, iy + 1), h_px(ix + 1, iy + 1)
            zh = (z00 * (1.0 - u) + z10 * u) * (1.0 - v) + (z01 * (1.0 - u) + z11 * u) * v
            drop = (dm * dm) / (2.0 * r_eff)
            alt = math.degrees(math.atan2(zh - drop - obs_asl, dm))
            if alt > best_a:
                best_a = alt
                best_d = float(dkm)
        hz_alt.append(round(best_a, 3))
        hz_dist.append(round(best_d, 1))

    # Geology values at (776, 470) -> 4 km/cell grid index (388, 235)
    geo_path = os.path.join(ROOT, 'kits', 'resources', 'data', 'geology.json')
    geo_out = {}
    if os.path.isfile(geo_path):
        with io.open(geo_path, encoding='utf-8') as fh:
            gdoc = json.load(fh)
        gw = gdoc['grid']['w']
        gx, gy = px_pin // 2, py_pin // 2
        gi = gy * gw + gx
        for k in ('copper', 'zinc', 'iron', 'saltpeter', 'turquoise', 'stone', 'limestone', 'wood', 'water', 'clay', 'coal', 'halite', 'marble', 'silica'):
            lay = gdoc.get('layers', {}).get(k)
            if isinstance(lay, list) and gi < len(lay):
                geo_out[k] = lay[gi]
    for k, fb in (('copper', 120), ('zinc', 96), ('iron', 60), ('saltpeter', 83), ('turquoise', 45),
                  ('stone', 150), ('limestone', 48), ('wood', 15), ('water', 82), ('clay', 0), ('coal', 0), ('halite', 20)):
        geo_out.setdefault(k, fb)

    rows = ',\n '.join(','.join(str(v) for v in reg_dm[j * rnx:(j + 1) * rnx]) for j in range(rny))
    js = (
        '// ================================================================= SKYWATCH — Scale Model 5.1 cut at (776, 470) (GENERATED)\n'
        '// [G data] `python3 settlements/skywatch/build.py --bake-model` writes this from tools/scale-model/model/data/h.png\n'
        '// and kits/resources/data/geology.json. Pin s8921htcjy (px 776, py 470), datum %.1f m ASL, regional 29x29 px\n'
        '// (56 x 56 km at 2,000 m/px) in decimetres above datum, and 360-deg horizon profile out to 350 km.\n'
        'var SW_MODEL={\n'
        ' id:"s8921htcjy",name:"Skywatch",polity:"Jimjam",px:%d,py:%d,datum:%.1f,cragAsl:%.1f,\n'
        ' worldX:-830000,worldZ:-2198000,pressureAtm:1.002,\n'
        ' rx0:%d,ry0:%d,rnx:%d,rny:%d,cell:2000,\n'
        ' regDm:[\n %s],\n'
        ' horizonAlt:[%s],\n'
        ' horizonDistKm:[%s],\n'
        ' geology:%s\n'
        '};\n'
        % (datum, px_pin, py_pin, datum, round(h_px(772, 468), 1), rx0, ry0, rnx, rny,
           rows,
           ','.join(str(v) for v in hz_alt),
           ','.join(str(v) for v in hz_dist),
           json.dumps(geo_out, separators=(',', ':'), sort_keys=True))
    )
    os.makedirs(SRC, exist_ok=True)
    with io.open(MODEL, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL, ROOT).replace(os.sep, '/'))


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)

# Port lint first (tools/check_port.py); also enforces recorded build check
if '--no-checks' not in sys.argv and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# Core modules explicitly adopted (PLAN.md §0 Core Adoption Table; tools/check_core_use.py)
CORE_TAKEN = ('core/rand', 'core/mask', 'core/drawn', 'core/space', 'core/city', 'core/hamlet', 'core/camp',
              'core/tags', 'core/furnish', 'core/door', 'core/walk', 'core/ruins', 'core/water', 'core/atmos',
              'core/materials', 'core/biome', 'core/lod', 'core/clock', 'core/minimap', 'core/host')

core = lambda *p: os.path.join(ROOT, 'core', *p)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[:1].isdigit()}

# 1. Core data, masks, drawn ground, ruins, walk, lod, tags, furnish
PATH['08-core-rand.js'] = core('rand', '08-core-rand.js')
PATH['09-lod.js'] = core('lod', '09-lod.js')
PATH['97-lod-auto.js'] = core('lod', '97-lod-auto.js')
PATH['25-core-mask.js'] = core('mask', '25-core-mask.js')
PATH['20-core-space.js'] = core('space', '20-core-space.js')
PATH['10-core-drawn.js'] = core('drawn', '10-core-drawn.js')
PATH['20-core-ruins.js'] = core('ruins', '20-core-ruins.js')
PATH['21-core-ruins-host.js'] = core('ruins', '21-core-ruins-host.js')
PATH['20-core-walk.js'] = core('walk', '20-core-walk.js')
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH[f] = core('tags', f)
for f in sorted(os.listdir(core('furnish'))):
    if f[:1].isdigit() and f.endswith('.js'):
        PATH['69d0-' + f] = core('furnish', f)

# 2. Resources (RES_ORE: copper, zinc, iron, saltpeter, turquoise) & Camp (KCAMP: convoy laagers & Sasquatch equinox bands)
PATH['27a-res-ore.js'] = os.path.join(ROOT, 'kits', 'resources', 'src', '42r-res-ore.js')
PATH['27b-res-ore-mined.js'] = os.path.join(ROOT, 'kits', 'resources', 'src', '42s-res-ore-mined.js')
PATH['10a-camp-cultures.js'] = core('camp', '10-camp-cultures.js')
PATH['20a-camp-census.js'] = core('camp', '20-camp-census.js')
PATH['27c-camp-pitch.js'] = core('camp', '30-camp-pitch.js')

# 3. Core city & hamlet sealed in one clean closure on Object.create(window) (as settlements/kirstabal/build.py)
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js',
           '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '30-hamlet-village.js']


def rd_rel(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\nvar KSPACE = window.KSPACE;\n'
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd_rel('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd_rel('core/hamlet/' + f))
    return (
        '/* KCITY, KHAMLET: core/city and core/hamlet in one closure (settlements/skywatch/build.py). GENERATED. */\n'
        'var SW_CITY_CORE = (function(window){\n' + body +
        '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE,\n'
        '  Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist,\n'
        '  resample: resample, clamp: clamp, inPoly: inPoly, cg: function () { return CG; } };\n'
        'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
        'var KCITY = SW_CITY_CORE.KCITY, KHAMLET = SW_CITY_CORE.KHAMLET;\n'
    )


# 4. Biome core (item 26: extend buildlib.CORE_BIOME_MIN, never list core/biome by hand) + biomes/nhighlands subalpine flora
CORE_BIOME = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js', 'core/biome/33-core-fungoid.js',
    'core/biome/35-core-anim.js', 'core/biome/35b-core-anim-turn.js',
]
NHL_JS = [
    'biomes/nhighlands/src/50-biome-nhighlands-species.js',
    'biomes/nhighlands/src/55-biome-nhighlands-trees.js',
    'biomes/nhighlands/src/60-biome-nhighlands-floor.js',
    'biomes/nhighlands/src/65-biome-nhighlands-dress.js',
    'biomes/nhighlands/src/70-biome-nhighlands.js',
]


def flora_bundle():
    part = lambda rel: '\n/* ---- %s ---- */\n%s\n' % (rel, rd_rel(rel))
    boot = (
        '\nBIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, waterH: function () { return -1e9; },\n'
        '  mask: function () { return 0; }, obstacles: [],\n'
        '  ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },\n'
        '  seed: 776470, origin: [[0, -900]], center: [0, -900], fields: {} });\n'
    )
    return (
        '/* SW_FLORA: core/biome (CORE_BIOME_MIN+) and biomes/nhighlands in one closure. GENERATED. */\n'
        'var SW_FLORA = (function (window) {\n'
        "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });\n" +
        ''.join(part(f) for f in CORE_BIOME) + boot +
        'var NHL = (function () {\n' + ''.join(part(f) for f in NHL_JS) + '\nreturn NHL;\n})();\n'
        'return { BIO: BIO, NHL: NHL };\n})(Object.create(window));\n'
    )


# 5. Ancients runtime + shared materials + sockets + placeholder sky math (for 74-jj-sacred.js jjTempleSolve)
ANC = os.path.join(ROOT, 'kits', 'ancients')
ANC_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js',
               '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js']
SHARED_MAT = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
for f in ANC_RUNTIME + SHARED_MAT:
    p = os.path.join(ANC, 'src', f)
    PATH[f] = p if os.path.isfile(p) else core('materials', f)
PATH['69a-world-uv.js'] = core('materials', 'opt', '69a-world-uv.js')
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = core('materials', 'record', f)
for f in ('37-sockets.js', '80-cultures.js'):
    PATH[f] = core('sockets', f)
PATH['81-sky.js'] = core('atmos', 'placeholder', '81-sky.js')

# 6. Jimjam set (settlements/jimjam/src), read in place
JIMJAM_DIR = os.path.join(ROOT, 'settlements', 'jimjam')
JJ_FILES = ['60-jj-mat.js', '61-jj-helpers.js', '62-jj-culture.js', '63-jj-zfix.js',
            '70-jj-housing.js', '71-jj-shops.js', '72-jj-hospitality.js', '73-jj-civic.js',
            '74-jj-sacred.js', '76-jj-military.js', '77-jj-agri.js', '84-jj-furniture.js']
for f in JJ_FILES:
    PATH[f] = os.path.join(JIMJAM_DIR, 'src', f)

# 7. Iziz Vernacular helpers + Highlands kit (rustic + Raja's Eye astro dome + smelter + stone circle), read in place
IV_DIR = os.path.join(ROOT, 'kits', 'iziz-vernacular')
for f in ('69b-vern-mat.js', '69c-vern-helpers.js'):
    PATH[f] = os.path.join(IV_DIR, 'src', f)

sys.path.insert(0, os.path.join(ROOT, 'kits', 'highlands'))
import highlands as khl                           # noqa: E402
for f, p in khl.OPENINGS.items():
    PATH[f] = p
for f, p in khl.HOLLOW.items():
    PATH[f] = p
PATH['90-core-door-host.js'] = core('door', '90-core-door-host.js')

for f, p in khl.paths().items():
    PATH[f] = p
HIGHLANDS_SETTLEMENT = os.path.join(ROOT, 'settlements', 'highlands')
PATH['88y-highlands-matlib.js'] = os.path.join(HIGHLANDS_SETTLEMENT, 'src', '88y-highlands-matlib.js')

# 8. Core water (step-cisterns & snowmelt spring troughs) + Core atmos (standard Krator skybox at 776, 470)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js',
              '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH[f] = core('water', f)

CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js',
              '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    PATH[f] = core('atmos', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = core('atmos', 'sky', f)

# 9. Core host FULL + KEYS + UNDERGROUND
sys.path.insert(0, core('host'))
import host as khost                              # noqa: E402
CORE_HOST = khost.FULL + khost.KEYS + khost.UNDERGROUND
khost.resolve(PATH, CORE_HOST)

# 10. Furniture & interiors bundle + sidecar PBR library packs (jimjam before 60-jj-mat.js; highlands before 88y)
for d in (('kits', 'catalog'), ('kits', 'interiors'), ('tools', 'textures')):
    sys.path.insert(0, os.path.join(ROOT, *d))
import furniture_bundle, kit_bundle, matlib_pack  # noqa: E402

FURN_CULTURES = ['republican', 'rustic', 'painted', 'iziz', 'generic', 'scrap', 'post-apoc']
SIDE = {}
BUNDLES = {
    '24-sw-kcity-bundle.js': kcity_bundle,
    '69d1-furniture-bundle.js': lambda: furniture_bundle.bundle(FURN_CULTURES, tex=True) + kit_bundle.bundle(['highlands']),
    '86z-sw-flora-bundle.js': flora_bundle,
}
VIRTUAL = {
    '46a-matlib-pack-jimjam.js': matlib_pack.fragment(JIMJAM_DIR, 'jimjam', side=SIDE),
    '88x-matlib-pack.js': matlib_pack.fragment(HIGHLANDS_SETTLEMENT, 'highlands', side=SIDE),
    khost.EDITS_JS: khost.edits_js(HERE, 'skywatch'),
}

BSRC.note(*(['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] + CORE_BIOME + NHL_JS))
if not BSRC.LISTING:
    VIRTUAL.update({f: fn() for f, fn in BUNDLES.items()})
else:
    VIRTUAL.update({f: '' for f in BUNDLES})
for f in VIRTUAL:
    PATH[f] = None

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))

SUBST = {
    '88y-highlands-matlib.js': [
        (r"window\._materials=KMAT\.table\('highlands'\);",
         "window._materials=window._materials?Object.assign({},window._materials,{build:'skywatch',records:window._materials.records.concat(KMAT.table('highlands').records)}):KMAT.table('highlands');")
    ]
}

frags = sorted(PATH)
bodies = {}
for f in frags:
    if PATH[f] is None:
        bodies[f] = VIRTUAL[f]
    else:
        with io.open(PATH[f], encoding='utf-8') as fh:
            s = fh.read()
        for pat, rep in SUBST.get(f, ()):
            s, n = re.subn(pat, rep, s)
            if not n:
                sys.exit('SUBST missed %r in %s' % (pat, f))
        bodies[f] = s

BSRC.report([PATH[f] for f in frags if PATH[f] is not None])   # --list-sources stops here before any write

# Top-level declaration clash check across non-closure fragments
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
        # Allow idempotent module extensions var X = X || ...
        line_end = s.find('\n', m.start())
        stmt = s[m.start():line_end if line_end > 0 else len(s)]
        if re.match(r'^var\s+' + re.escape(n) + r'\s*=\s*(?:globalThis\.)?' + re.escape(n) + r'\s*\|\|', stmt):
            continue
        if n in seen and seen[n] != f:
            clash.append('%s (%s, %s)' % (n, seen[n], f))
        seen.setdefault(n, f)
if clash:
    sys.exit('top-level names declared twice: ' + '; '.join(clash))

out = []
for f in frags:
    if f.endswith('.js'):
        rel_label = f if PATH[f] is None else os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')
        out.append('\n// ==================== %s\n' % rel_label)
    out.append(bodies[f])

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
html = matlib_pack.write_sidecar(SIDE, html, DIST, 'skywatch.tex.js')
with io.open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with io.open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
try:
    os.remove(chk)
except OSError:
    pass
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else
    'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
sys.exit(r.returncode if r else 0)
