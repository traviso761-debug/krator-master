#!/usr/bin/env python3
"""Build the isle demo's site planner: dist/isle-site.html (P4 of PLAN.md).

    python3 build.py              # writes dist/isle-site.html
    python3 build.py --accept     # also records the Voth files read as the ones the shim is known to fit

The planner is Voth's site editor, read IN PLACE from settlements/voth (never copied, never edited there): its page
shell (with this page's own words swapped in), the site model (10), the scene (50) and the tools (55). Voth's own
ground, cantons and start are left out. In their place:
  - the open world's ground: the isle demo's region (openworld/isle-demo/data) and the world's height and colour
    fragments (little-demo's 41 and 42, isle-demo's 43: the coast as terrain), so what is drawn here stands on the
    ground the open world draws;
  - src/10-isle-frame.js [G data]: a town's frame (local metres round its settlement, the sea at 0) and a VOTH object
    made from that ground, the names Voth's fragments read;
  - src/56-isle-tools.js [web]: the save (both towns in site/isle-site.json, through serve.py), the town buttons, the
    views and the words Voth's tools use for Voth's own things;
  - src/98-isle-start.js [web]: decode the region, raise the chosen town's ground, load its site.
The Voth files read are hashed into voth-sources.json; a build that finds one changed says so (re-check the page,
then --accept, or vendor the file and track its drift).
"""
import base64, glob, hashlib, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
VOTH = os.path.join(ROOT, 'settlements', 'voth')
VSITE = os.path.join(VOTH, 'targets', 'voth-site')
WORLD = os.path.join(ROOT, 'openworld', 'isle-demo')
LD = os.path.join(ROOT, 'openworld', 'little-demo', 'src')
DIST = os.path.join(HERE, 'dist')
SITE_JSON = os.path.join(HERE, 'site', 'isle-site.json')
REC = os.path.join(HERE, 'voth-sources.json')
NL = '\n'

# the engine page Voth's site editor runs on (scene, camera, renderer, controls), as Voth's build.py lists it
VENDOR = [os.path.join(VOTH, 'three.min.js'), os.path.join(ROOT, 'kits', 'catalog', 'krator-furniture-core.js'),
          os.path.join(ROOT, 'kits', 'catalog', 'krator-asset-engine.js'), os.path.join(VOTH, 'catalog', 'lod.js')]
# the open world's ground: the noise, the fields (heights, water, colour) and the isle's coast
GROUND = [os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'),
          os.path.join(LD, '41-world-fields.js'), os.path.join(LD, '42-world-roads.js'), os.path.join(WORLD, 'src', '43-world-isles.js')]
RASTERS = ['elev', 'wlev', 'clim', 'rain', 'temp', 'biome', 'mask', 'scarpl', 'scarpu', 'scarpw']
# the page: Voth's fragments read in place, this page's own between them
JS = [os.path.join(HERE, 'src', '10-isle-frame.js'), os.path.join(VSITE, '10-site-model.js'), os.path.join(VSITE, '50-site-scene.js'),
      os.path.join(VSITE, '55-site-tools.js'), os.path.join(HERE, 'src', '56-isle-tools.js'), os.path.join(HERE, 'src', '98-isle-start.js')]
HEAD = os.path.join(VSITE, '00-head.html')
TAIL = os.path.join(VSITE, '99-tail.html')
# this page's words in Voth's shell: each must be found exactly once
SWAP = [('<title>Voth Site Editor</title>', '<title>Isle Demo Site Planner</title>'),
        ('<h1>Voth site editor</h1>', '<h1>Isle demo site planner</h1>'),
        ("Voth's ground, lake and cantons, no roads.", "<span id=\"town\"></span>: the open world's ground at 1:1, the sea at 0 m."),
        ('<button id="m-ferry">B ferry stop</button>', '<button id="m-ferry">B canoe landing</button>'),
        ('<button id="m-strider">N elephant bug station</button>', '<button id="m-strider">N land stop</button>'),
        ('<button id="b-voth">add Voth\'s current districts</button>',
         '<button id="b-voth" style="display:none"></button><button id="t-Kautoa">Kautoa</button><button id="t-Valapo">Valapo</button>'),
        ("Raising Voth's ground...", 'Raising the isle...')]
# the Voth files this page reads, hashed (the shim is made to fit these)
VOTH_READ = [os.path.join(VOTH, 'tex', 'pack.json'), HEAD, TAIL, os.path.join(VSITE, '10-site-model.js'), os.path.join(VSITE, '50-site-scene.js'), os.path.join(VSITE, '55-site-tools.js')]


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def sha(p):
    """a file's hash with its line ends as LF (a checkout's CRLF must not read as a change)"""
    return hashlib.sha1(open(p, 'rb').read().replace(b'\r\n', b'\n')).hexdigest()


def sources(accept):
    now = {rel(p): sha(p) for p in VOTH_READ}
    old = json.load(open(REC, encoding='utf-8'))['files'] if os.path.isfile(REC) else None
    if accept or old is None:
        with open(REC, 'w', encoding='utf-8', newline=NL) as f:
            json.dump({'note': "the Voth files build.py reads in place; the shim (src/10, 56, 98) fits these", 'files': now}, f, indent=1)
            f.write(NL)
        return []
    return [k for k in now if old.get(k) != now[k]]


def data_fragment():
    meta = json.load(open(os.path.join(WORLD, 'data', 'region.json'), encoding='utf-8'))
    png = {k: base64.b64encode(open(os.path.join(WORLD, 'data', k + '.png'), 'rb').read()).decode('ascii') for k in RASTERS}
    return ('/* the isle demo region (openworld/isle-demo/data, made by tools/scale-model/extract_region.py) */' + NL +
            'var WORLD_DATA = {meta:' + json.dumps(meta, separators=(',', ':')) + ',png:' + json.dumps(png) + '};' + NL +
            '/* the world\'s kit registry (openworld/isle-demo/src/47-world-kits.js): empty, the planner grows no flora */' + NL +
            'var WORLD_KITS = [];' + NL)


def png_samples(p):
    """an 8-bit, non-interlaced grey (0) or RGB (2) PNG's samples, decoded here (zlib and the five row filters), not by a
    canvas: (width, height, channels, bytes)"""
    import struct, zlib
    b = open(p, 'rb').read()
    if b[:8] != b'\x89PNG\r\n\x1a\n':
        sys.exit('%s is not a PNG (a Git LFS pointer? git lfs pull it)' % rel(p))
    i, idat, w = 8, b'', None
    while i < len(b):
        n, t = struct.unpack('>I', b[i:i + 4])[0], b[i + 4:i + 8]
        if t == b'IHDR':
            w, h, bd, ct, _, _, il = struct.unpack('>IIBBBBB', b[i + 8:i + 21])
            if bd != 8 or ct not in (0, 2) or il:
                sys.exit('%s: only 8-bit grey or RGB, not interlaced (depth %d, type %d)' % (rel(p), bd, ct))
        elif t == b'IDAT':
            idat += b[i + 8:i + 8 + n]
        i += 12 + n
    ch = 1 if ct == 0 else 3
    raw, stride, out, prev = zlib.decompress(idat), w * ch, bytearray(), bytearray(w * ch)
    for r in range(h):
        f, row = raw[r * (stride + 1)], bytearray(raw[r * (stride + 1) + 1:(r + 1) * (stride + 1)])
        for x in range(stride):
            a = row[x - ch] if x >= ch else 0
            c = prev[x - ch] if x >= ch else 0
            up = prev[x]
            if f == 1: row[x] = (row[x] + a) & 255
            elif f == 2: row[x] = (row[x] + up) & 255
            elif f == 3: row[x] = (row[x] + (a + up) // 2) & 255
            elif f == 4:
                pp = a + up - c; pa, pb, pc = abs(pp - a), abs(pp - up), abs(pp - c)
                row[x] = (row[x] + (a if pa <= pb and pa <= pc else up if pb <= pc else c)) & 255
        out += row; prev = row
    return w, h, ch, bytes(out)


def raw_fragment():
    """the region's rasters as integers (WORLD_RAW, read by src/20-isle-ground.js ISLE.rasters): the city page decodes no
    image, so the plan reads the same numbers in node, the browser and Godot"""
    meta = json.load(open(os.path.join(WORLD, 'data', 'region.json'), encoding='utf-8'))
    px = {k: png_samples(os.path.join(WORLD, 'data', k + '.png')) for k in RASTERS}
    first = lambda k: list(px[k][3][::px[k][2]])
    hi16 = lambda k: [px[k][3][i * 3] << 8 | px[k][3][i * 3 + 1] for i in range(px[k][0] * px[k][1])]
    blue = lambda k: [1 if px[k][3][i * 3 + 2] > 127 else 0 for i in range(px[k][0] * px[k][1])]
    out = {'meta': meta, 'hw': px['elev'][0], 'hh': px['elev'][1], 'mw': px['biome'][0], 'mh': px['biome'][1],
           'elev': hi16('elev'), 'wflag': blue('elev'), 'wlev': hi16('wlev'), 'whas': blue('wlev'),
           'scarpl': hi16('scarpl'), 'scarpu': hi16('scarpu'), 'scarpw': first('scarpw')}
    for k in ('clim', 'rain', 'temp', 'biome', 'mask'):
        out[k] = first(k)
    return ('/* the isle demo region\'s rasters (openworld/isle-demo/data), decoded by build.py: integers, no image */' + NL +
            'var WORLD_RAW = ' + json.dumps(out, separators=(',', ':')) + ';' + NL +
            '/* the world fragments read the region settings from WORLD_DATA.meta (no PNGs on this page) */' + NL +
            'var WORLD_DATA = { meta: WORLD_RAW.meta, png: {} };' + NL +
            '/* the world\'s kit registry (openworld/isle-demo/src/47-world-kits.js): empty, the city page grows no flora */' + NL +
            'var WORLD_KITS = [];' + NL)


def dims_fragment():
    """every kit piece's declared box (the box each kit's verify holds its builds to), read from the kits' sources: the
    city plan places by these, so it needs none of the drawing bundles (node, the browser and Godot plan alike).
    verify.py checks them against the bundles' own registries on the page"""
    out, ves = {}, {}
    num = lambda s, n: (re.search(r'\b%s\s*:\s*([\d.]+)' % n, s) or [None, None])[1]
    strv = lambda s, n: (re.search(r"\b%s\s*:\s*['\"]([^'\"]*)['\"]" % n, s) or [None, None])[1]
    strs = lambda s, n: re.findall(r"['\"]([^'\"]+)['\"]", (re.search(r'\b%s\s*:\s*\[([^\]]*)\]' % n, s) or [None, ''])[1])
    rec = lambda b, kit, types, h=None: {'w': float(num(b, 'w')), 'd': float(num(b, 'd')), 'h': float(num(b, 'h') or h), 'kit': kit,
                                         'types': strs(b, types), 'role': strv(b, 'role'), 'job': strv(b, 'job'), 'wealth': strv(b, 'wealth'), 'family': strv(b, 'family')}
    for f in sorted(glob.glob(os.path.join(ROOT, 'kits', 'islanders', 'src', '*.js'))):
        s = read(f)
        for m in re.finditer(r"defBuilding\(\{\s*key\s*:\s*'([^']+)'(.*?)\bbuild\s*[:(]", s, re.S):
            b = m.group(2)
            if re.search(r"cls\s*:\s*'(life|flora)'", b) or not num(b, 'w'):
                continue
            out[m.group(1)] = rec(b, 'isk', 'types')
    for f in sorted(glob.glob(os.path.join(ROOT, 'settlements', 'iziz', 'src', '7*-vern-*.js'))):
        for m in re.finditer(r"VERN\.def\(\{key:'([^']+)'(.*?)build:", read(f)):
            out[m.group(1)] = rec(m.group(2), 'izv', 'type', 8)
            for tag, t in (('VTAG_SF', 'dwelling-single'), ('VTAG_MF', 'dwelling-multi')):   # settlements/iziz/src/70-vern-dwellings.js
                if tag in m.group(2):
                    out[m.group(1)]['types'] = [t]
    BRK = os.path.join(ROOT, 'kits', 'beast-riders')
    for m in re.finditer(r"ASSET\(\{\s*key:\s*'([^']+)'(.*?)\bbuild\s*:", read(os.path.join(BRK, 'src', '50-br-mounts.js')), re.S):
        out[m.group(1)] = rec(m.group(2), 'cat', 'types')
        out[m.group(1)]['wealth'] = None
    # the ports (kits/beast-riders src/60-br-ports.js): a key's box is the largest of its variants' declared boxes (DIMS),
    # its family and types the towns' port tables' (towns/<town>-ports.js), as the ASSET takes them
    dims = dict((k, json.loads(v)) for k, v in re.findall(r"\b(br_port_\w+):\s*(\[\[[\d.,\[\]]+\]\])", read(os.path.join(BRK, 'src', '60-br-ports.js'))))
    for f in ('girder-ports.js', 'mavs-ports.js'):
        for m in re.finditer(r"\{\s*key:\s*'(br_port_\w+)'(.*?)\bvariants\s*:", read(os.path.join(BRK, 'towns', f)), re.S):
            D = dims[m.group(1)]
            out[m.group(1)] = {'w': float(max(v[0] for v in D)), 'd': float(max(v[1] for v in D)), 'h': float(max(v[2] for v in D)), 'kit': 'cat',
                               'types': strs(m.group(2), 'types'), 'role': None, 'job': None, 'wealth': None, 'family': strv(m.group(2), 'family')}
    for f in sorted(glob.glob(os.path.join(ROOT, 'kits', 'ringsea', 'src', '*.js'))):
        for m in re.finditer(r"RS_VESSEL\(\{key:'([^']+)'(.*?)\bbuild\s*[:(]", read(f), re.S):
            b = m.group(2)
            if num(b, 'L'):
                ves[m.group(1)] = {'L': float(num(b, 'L')), 'B': float(num(b, 'B')), 'H': float(num(b, 'H')), 'culture': strv(b, 'culture'), 'name': strv(b, 'name')}
    return ('/* GENERATED by build.py: the kits\' declared boxes (kits/islanders, settlements/iziz, kits/beast-riders, kits/ringsea) */' + NL +
            'var ISLE_DIMS = ' + json.dumps(out, sort_keys=True, separators=(',', ':')) + ';' + NL +
            'var ISLE_VDIMS = ' + json.dumps(ves, sort_keys=True, separators=(',', ':')) + ';' + NL)


def tex_fragment(fams=('stone', 'ground', 'rock', 'sand')):
    """Voth's packed library textures (settlements/voth/tex, read in place), the detail albedos only, as data URLs:
    SL_TEX[family] = {map, scale}, as Voth's site editor takes them: grey detail under the ground's colours"""
    pack = json.loads(read(os.path.join(VOTH, 'tex', 'pack.json')))
    out = {}
    for fam in fams:
        e = pack['families'].get(fam)
        if not e or 'map' not in e['files']:
            continue
        with open(os.path.join(VOTH, 'tex', e['files']['map']), 'rb') as f:
            out[fam] = {'scale': e.get('scale', [1, 1]), 'lib': e.get('lib'), 'map': 'data:image/webp;base64,' + base64.b64encode(f.read()).decode('ascii')}
    return "/* Voth's detail textures (settlements/voth/tex, read in place) */" + NL + 'var SL_TEX = ' + json.dumps(out, sort_keys=True) + ';' + NL


def trades_fragment():
    """kits/islanders' census trades (src/68-is-trades.js IS_TRADES, read in place) as ISLE_TRADES: the sim's places carry
    the trade their key works (src/40-isle-sim.js ISLE.tradeOf), without the kit's drawing bundle"""
    s = read(os.path.join(ROOT, 'kits', 'islanders', 'src', '68-is-trades.js'))
    m = re.search(r'const IS_TRADES=(\[.*?\n\]);', s, re.S)
    if not m:
        sys.exit('kits/islanders/src/68-is-trades.js: IS_TRADES not found; update trades_fragment in build.py')
    return "/* kits/islanders/src/68-is-trades.js IS_TRADES, read in place by build.py */" + NL + 'var ISLE_TRADES = ' + m.group(1) + ';' + NL


def site_fragment():
    data = read(SITE_JSON) if os.path.isfile(SITE_JSON) else 'null'
    return '/* GENERATED by build.py from site/isle-site.json (the planner saves there) */' + NL + 'var SITE_INIT = ' + data.strip() + ';' + NL


def main():
    port = os.path.join(ROOT, 'tools', 'check_port.py')
    if os.path.isfile(port) and '--no-checks' not in sys.argv:
        if subprocess.call([sys.executable, port, '--quiet', HERE]) != 0:
            sys.exit('build.py: the port lint failed (tools/check_port.py)')
    changed = sources('--accept' in sys.argv)
    head = read(HEAD)
    for old, new in SWAP:
        if head.count(old) != 1:
            sys.exit("Voth's site page shell changed: '%s' is not found once; update SWAP in build.py" % old)
        head = head.replace(old, new)
    parts = [head]
    for p in VENDOR:
        parts.append('<script>/* %s */%s%s%s</script>%s' % (rel(p), NL, read(p), NL, NL))
    parts.append('<script>' + NL + data_fragment() + '</script>' + NL)
    for p in GROUND:
        parts.append('<script>/* ---- %s ---- */%s%s%s</script>%s' % (rel(p), NL, read(p), NL, NL))
    parts.append('<script>' + NL + tex_fragment() + site_fragment() + '</script>' + NL)
    body = ''.join('/* ---- %s ---- */%s%s%s' % (rel(p), NL, read(p), NL) for p in JS)
    parts.append('<script>' + NL + '"use strict";' + NL + body + '</script>' + NL)
    parts.append(read(TAIL))
    html = ''.join(parts)
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'isle-site.html')
    with open(out, 'w', encoding='utf-8', newline=NL) as f:
        f.write(html)
    note = 'syntax NOT CHECKED (no node)'
    node = os.environ.get('NODE') or shutil.which('node')
    if node:
        tmp = os.path.join(DIST, '.syntax-check.js')
        for i, js in enumerate(re.findall(r'<script>(.*?)</script>', html, re.S)):
            open(tmp, 'w', encoding='utf-8').write(js)
            r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
            if r.returncode:
                os.remove(tmp)
                sys.exit('SYNTAX ERROR in script %d:%s%s' % (i, NL, r.stderr[-3000:]))
        os.remove(tmp)
        note = 'syntax checked'
    print('built dist/isle-site.html  (%d KB)  %s' % (os.path.getsize(out) // 1024, note))
    for k in changed:
        print('VOTH CHANGED  %s: re-check the planner against it, then build.py --accept (or vendor it)' % k)
    city_page()


# ---------------------------------------------------------------- the city page (P6): dist/isle-city.html
# The two towns on core/city (src/32-isle-city.js), drawn with the kits read in place (bundles.py). Its scripts, in order:
#   the library packs beside the page (isle-city.tex.<key>.js: the Islanders', Iziz's and the Beast Riders' towns' maps, KMAT_SIDE)
#   three.js (Voth's copy, as the planner takes it)
#   the data: the region's rasters as integers, the kits' declared boxes, the Islanders' census trades, the site file
#   the shared modules and the world's ground: core/rand, core/space, core/tags, core/terrain's relief, the open world's
#     fields and the isle's coast, core/simulation, core/materials/record (KMAT) and the two packs' loaders
#   the bundles: KCITY, CAT (the Beast Riders' buildings: the kit's own and its ports), ISK (the Islanders), IZV (the Vernacular), RINGSEA
#   this page's own: 15 (the sim's tuning), 20 (ground), 30 (programme), 32 (the city plan), 34 (census, checks), 40-47 (the
#   towns on core/simulation, the canoe line) [G data]; 57 (the sim's run loop), 59 (citizens near the camera), 60 (draw), 61 (the canoe line's vessels), 98 (start) [web]
# The [G data] half (data, ground, core/simulation, KCITY, 15-48) is also written as dist/isle-city.plan.js, which the node
# tests run.
CITY_CORE = [os.path.join(ROOT, *p.split('/')) for p in (
    'core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js',
    'core/terrain/38-core-relief.js')] + [os.path.join(LD, '41-world-fields.js'), os.path.join(LD, '42-world-roads.js'),
                                          os.path.join(WORLD, 'src', '43-world-isles.js')]
CITY_MAT = [os.path.join(ROOT, 'core', 'materials', 'record', f) for f in ('23-mat-record.js', '24-tex-def.js', '25-matlib-host.js', '26-matlib-bind.js')]
# core/export (P6b, PLAN.md section 7): the container and its adapters, so the page exports and verify.py checks its profile
CITY_EXPORT = [os.path.join(ROOT, 'core', 'export', f) for f in ('07-core-export.js', '09-core-export-adapters.js')]
# core/simulation (P7b, PLAN.md section 9): every fragment, as Dhelv and Shade take it; the isle host is src/15 and 40-48
CITY_SIM = [os.path.join(ROOT, 'core', 'simulation', f) for f in sorted(os.listdir(os.path.join(ROOT, 'core', 'simulation'))) if re.match(r'77-sim-.*\.js$', f)]
CITY_DATA_JS = ['15-isle-tune.js', '20-isle-ground.js', '30-isle-programme.js', '32-isle-city.js', '34-isle-census.js',
                '40-isle-sim.js', '41-isle-nav.js', '42-isle-people.js', '43-isle-items.js', '44-isle-economy.js', '45-isle-sim-checks.js', '46-isle-stocks.js', '47-isle-trade.js', '48-isle-week.js']
CITY_WEB_JS = ['57-isle-run.js', '58-isle-protos.js', '59-isle-citizens.js', '60-isle-draw.js', '61-isle-canoes.js', '98-isle-city-start.js']
CITY_HEAD = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Isle Demo Towns</title>
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#a9c8d8;font:13px/1.4 system-ui,sans-serif;color:#eee}
canvas{display:block}
#ui{position:fixed;left:10px;top:10px;display:flex;flex-wrap:wrap;gap:6px;max-width:80vw;z-index:5}
#ui button{background:rgba(20,30,34,.82);color:#e8f2f0;border:1px solid #4f8a86;border-radius:4px;padding:5px 9px;cursor:pointer;font-size:12px}
#ui button:hover{background:#2f6a66}#ui button.on{background:#c8a24a;color:#1a1408;border-color:#f0d080}
#hud{position:fixed;right:10px;bottom:10px;background:rgba(0,0,0,.5);padding:6px 9px;border-radius:4px;font-family:ui-monospace,monospace;font-size:12px;z-index:5}
#loading{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.6);padding:10px 16px;border-radius:6px;z-index:6}
#errs{position:fixed;left:10px;bottom:10px;max-width:60vw;max-height:30vh;overflow:auto;background:rgba(120,0,0,.85);color:#fff;padding:6px 9px;border-radius:4px;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;display:none;z-index:9}
@media (max-width:700px){#ui{max-width:92vw}}
</style></head><body>
<div id="ui"></div><div id="hud"></div><div id="loading">Laying out the towns...</div><pre id="errs"></pre>
<script>
var ERRS0 = document.getElementById('errs');
window.onerror = function (m, s, l, c, e) { ERRS0.style.display = 'block'; ERRS0.textContent += ((e && e.stack) || (m + ' @' + l + ':' + c)) + '\\n'; };
</script>
'''


def syntax_check(html, what):
    node = os.environ.get('NODE') or shutil.which('node')
    if not node:
        return 'syntax NOT CHECKED (no node)'
    tmp = os.path.join(DIST, '.syntax-check.js')
    for i, js in enumerate(re.findall(r'<script>(.*?)</script>', html, re.S)):
        open(tmp, 'w', encoding='utf-8').write(js)
        r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
        if r.returncode:
            os.remove(tmp)
            sys.exit('SYNTAX ERROR in %s, script %d:%s%s' % (what, i, NL, r.stderr[-3000:]))
    os.remove(tmp)
    return 'syntax checked'


def city_page():
    sys.path.insert(0, HERE)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import bundles, matlib_pack
    side = {}
    izp = os.path.join(ROOT, 'settlements', 'iziz')
    izfams = json.load(open(os.path.join(izp, 'tex', 'pack.json'), encoding='utf-8')).get('families', {})
    packs = (matlib_pack.fragment(os.path.join(ROOT, 'kits', 'islanders'), 'islanders', side=side) +
             matlib_pack.fragment(izp, 'iziz', exclude=[k for k in izfams if k.startswith(('fauna', 'city'))], side=side))
    data = raw_fragment() + dims_fragment() + trades_fragment() + site_fragment()
    core = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(p), NL, read(p), NL, NL) for p in CITY_CORE + CITY_SIM)
    mats = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(p), NL, read(p), NL, NL) for p in CITY_MAT + CITY_EXPORT) + packs
    own = lambda L: ''.join('/* ---- settlements/isle-demo/src/%s ---- */%s%s%s' % (f, NL, read(os.path.join(HERE, 'src', f)), NL) for f in L)
    kc = bundles.kcity_bundle()
    cat, _ = bundles.cat_bundle(side)      # the towns' maps beside the page (isle-city.tex.brtowns.js)
    isk, _ = bundles.isk_bundle()
    izv, _ = bundles.izv_bundle()
    rs, _ = bundles.ringsea_fragment()
    sc = lambda s: '<script>' + NL + s + '</script>' + NL
    html = (CITY_HEAD + '<script>/* %s */%s%s%s</script>%s' % (rel(VENDOR[0]), NL, read(VENDOR[0]), NL, NL) +
            sc(data) + sc(core) + sc(mats) + sc(kc) + sc(cat) + sc(isk) + sc(izv) + sc(rs) + sc(own(CITY_DATA_JS)) + sc(own(CITY_WEB_JS)) +
            '</body></html>' + NL)
    os.makedirs(DIST, exist_ok=True)
    html = matlib_pack.write_sidecar(side, html, DIST, 'isle-city.tex.js')
    out = os.path.join(DIST, 'isle-city.html')
    with open(out, 'w', encoding='utf-8', newline=NL) as f:
        f.write(html)
    with open(os.path.join(DIST, 'isle-city.plan.js'), 'w', encoding='utf-8', newline=NL) as f:
        f.write('/* GENERATED by build.py: the city page\'s [G data] half, for the node test (tests/test-isle-city.js) */' + NL +
                data + core + kc + own(CITY_DATA_JS))
    print('built dist/isle-city.html  (%d KB, packs beside it)  %s' % (os.path.getsize(out) // 1024, syntax_check(html, 'isle-city.html')))


if __name__ == '__main__':
    main()
