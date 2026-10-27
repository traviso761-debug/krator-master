#!/usr/bin/env python3
"""Build the 'isle demo' open world: one self-contained page, dist/isle-demo.html (settlements/isle-demo/PLAN.md, P3).

The scale model's "isle demo" polygon (an archipelago in the East Ring Isles, about 128 x 250 km) at 1:1, on the open
world's machinery. The world's fragments live in src/world/ (moved from openworld/little-demo, now deprecated): the fields, terrain,
water, sky, nursery, flora, floor, places, towns, camera and probe. This build adds only what is the region's own:

  data/         region.json and the rasters, written by tools/scale-model/extract_region.py (README.md says how)
  src/          43-world-isles.js (the isles' fields: the climate classes as weights, the coast), 46-world-config.js
                (the settlements built here, the Go-to order and views), 47-world-kits.js (the kits that grow here)
  src/world/    the world (00-head.html with this region's title, 41, 42, 45, 80-99)
  ../../core/   rand, terrain, biome, space, atmos, water

  python3 build.py            # dist/isle-demo.html
  python3 build.py --no-checks
"""
import base64, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
DIST = os.path.join(HERE, 'dist')
OUT = 'isle-demo.html'
WORLD_SRC = os.path.join(SRC, 'world')   # the world's fragments

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# the biome kits this region grows (47-world-kits.js), as biomes/ringisles/build.py loads them: the geyser kit's layout,
# then each lending kit as one block (their fragments in order: BIO.kit .. BIO.kitEnd), then the Ring Sea isles kit
# itself (it grows the lenders' trees in their own registries; 66-biome-ringisles-world.js presents it to the world).
KIT_FRAGS = (
    [('biomes/geyser/src', '46-biome-geyser-layout.js')]
    + [('biomes/throne/src', f) for f in ('46-biome-throne-flows.js', '50-biome-throne-species.js', '55-biome-throne-trees.js',
                                          '60-biome-throne-floor.js', '70-biome-throne.js')]
    + [('biomes/swbay/src', f) for f in ('50-biome-swbay-species.js', '55-biome-swbay-trees.js', '60-biome-swbay-floor.js',
                                         '65-biome-swbay-dress.js', '70-biome-swbay.js', '75-biome-swbay-fauna.js')]
    + [('biomes/eastabyss/src', f) for f in ('50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js', '60-biome-eastabyss-floor.js',
                                             '65-biome-eastabyss-dress.js', '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js')]
    + [('biomes/sedesert/src', f) for f in ('50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
                                            '65-biome-sedesert-dress.js', '70-biome-sedesert.js', '75-biome-sedesert-fauna.js')]
    + [('biomes/geyser/src', f) for f in ('50-biome-geyser-species.js', '55-biome-geyser-trees.js', '57-biome-geyser-sinter.js',
                                          '60-biome-geyser-floor.js', '65-biome-geyser-show.js', '70-biome-geyser.js')]
    + [('biomes/ringisles/src', f) for f in ('50-biome-ringisles-species.js', '52-biome-ringisles-look.js', '55-biome-ringisles-trees.js',
                                             '56-biome-ringisles-crops.js', '57-biome-ringisles-gather.js', '60-biome-ringisles-floor.js', '62-biome-ringisles-gardens.js',
                                             '66-biome-ringisles-world.js', '70-biome-ringisles.js')])
# each kit's last listed fragment must close its registry (BIO.kitEnd), or every later kit's items land in its registry
KIT_LAST = {'throne': '70-biome-throne.js', 'swbay': '75-biome-swbay-fauna.js', 'eastabyss': '75-biome-eastabyss-fauna.js',
            'sedesert': '75-biome-sedesert-fauna.js', 'geyser': '70-biome-geyser.js', 'ringisles': '70-biome-ringisles.js'}
# THE LIBRARY'S MAPS (core/materials/record, tools/textures/matlib_pack.py): one pack per kit on the page, as
# biomes/ringisles/build.py makes them (the same trims: the Throne's isle and savanna species only, no lender's towers,
# jetties or ground layers: the world paints its own ground), written as sidecars beside the page
# (dist/isle-demo.tex.<kit>.js). Without them a kit's library-coloured bark and leaf cards draw white.
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp
PACK_KITS = ['ringisles', 'throne', 'swbay', 'eastabyss', 'sedesert', 'geyser']
SIDE = None if '--inline-packs' in sys.argv else {}
def _fams(kit):
    pj = os.path.join(ROOT, 'biomes', kit, 'tex', 'pack.json')
    return sorted(json.load(open(pj, encoding='utf8')).get('families', {})) if os.path.isfile(pj) else []
THRONE_KEEP = {'bark.armored', 'bark.palm', 'bark.mangrove', 'bark.twisted', 'bark.coir', 'card.frond.coconut', 'card.fractal',
               'card.treefern', 'card.aloeflower', 'card.ferngreen', 'card.bromeliad', 'card.mossclump', 'leaf.fern', 'cap.disc', 'cap.tier'}
_DROP = lambda k: k.startswith('tower') or k.startswith('jetty') or k.startswith('ground')
PACK_EXCL = {'ringisles': [f for f in _fams('ringisles') if f.startswith('ground')], 'throne': [f for f in _fams('throne') if f not in THRONE_KEEP],
             'swbay': [f for f in _fams('swbay') if _DROP(f)], 'eastabyss': [f for f in _fams('eastabyss') if _DROP(f)],
             'sedesert': [f for f in _fams('sedesert') if _DROP(f)], 'geyser': [f for f in _fams('geyser') if _DROP(f)]}
def pack_fragment(kit):
    return _mp.fragment(os.path.join(ROOT, 'biomes', kit), kit, exclude=PACK_EXCL[kit], side=SIDE)
LDF = lambda *fs: [('ld', f) for f in fs]
# the city page's [G data] half, as settlements/isle-demo/build.py lists it (CITY_DATA_JS)
ISLE_DATA_JS = ['15-isle-tune.js', '20-isle-ground.js', '30-isle-programme.js', '32-isle-city.js', '34-isle-census.js',
                '40-isle-sim.js', '41-isle-nav.js', '42-isle-people.js', '43-isle-items.js', '44-isle-economy.js', '45-isle-sim-checks.js',
                '46-isle-stocks.js', '47-isle-trade.js', '47h-isle-hamlets.js', '48-isle-week.js', '49-isle-govern.js', '50-isle-export.js']
def _isle_build():
    """settlements/isle-demo/build.py as a module (its data fragments: dims, trades, site), loaded once"""
    import importlib.util
    if '_isle_city_build' not in globals():
        spec = importlib.util.spec_from_file_location('_isle_city_build', os.path.join(ROOT, 'settlements', 'isle-demo', 'build.py'))
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); globals()['_isle_city_build'] = m
    return globals()['_isle_city_build']
ORDER = (
    LDF('00-head.html') + [('gen', '05-world-data.js'),
     ('core/rand', '08-core-rand.js'), ('core/clock', '20-core-clock.js'), ('core/terrain', '38-core-relief.js'),
     ('core/biome', '10-core-head.js'), ('core/biome', '20-core-kit.js'), ('core/biome', '30-core-foliage.js'),
     ('core/biome', '35-core-anim.js'), ('core/biome', '36-core-walker.js'), ('core/space', '20-core-space.js'), ('core/biome', '40-core-place.js'),
     ('core/tags', '50-core-tags.js'), ('core/tags', '52-core-tags-vocab.js'),
     ('core/atmos', '89-atmos-0-core.js'), ('core/atmos', '89-atmos-0p-presets.js'), ('core/atmos', '89-atmos-a-waves.js'),
     ('core/atmos', '89-atmos-b-skylight.js'), ('core/atmos', '89-atmos-8-export.js'),
     ('core/water', '20-core-water.js'), ('core/water', '21-core-water-shore.js'), ('core/water', '22-core-water-flow.js'),
     ('core/water', '50-core-water-draw.js'), ('core/water', '51-core-water-kinds.js'),
     ('core/water/geyser', '52-core-water-geyser.js'), ('core/water/geyser', '52b-core-water-geyser-draw.js'),
     ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'), ('core/materials/record', '25-matlib-host.js'),
     ('core/materials/record', '26-matlib-bind.js'),
     ('biomes/sedesert/src', '35-core-strata.js')]
    + LDF('41-world-fields.js', '42-world-roads.js') + [('src', '43-world-isles.js')]
    + LDF('45-world-host.js') + [('src', '46-world-config.js'), ('src', '47-world-kits.js'),
     ('biomes/hyperjungle/src', '41-hyperjungle-globals.js')]
    + [('pack', k) for k in PACK_KITS]
    + KIT_FRAGS
    # the hamlets (core/hamlet, H4): the Islanders' and the Beast Riders' buildings as bundles (settlements/isle-demo/
    # bundles.py, as the city page takes them), their packs, core/city's primitives, the village generator, the resource
    # fields, the kit-piece instancer the city page shares (58-isle-protos.js), and this world's hamlet specs
    + [('islpack', 'islanders'), ('bundle', 'isk'), ('bundle', 'cat'),
       ('core/city', '33-city-strategies.js'), ('core/hamlet', '10-hamlet-wood.js'), ('core/hamlet', '12-hamlet-gather.js'),
       ('core/hamlet', '20-hamlet-cultures.js'), ('core/hamlet', '30-hamlet-village.js'), ('core/hamlet', '40-hamlet-felling.js'), ('kits/resources/src', '43r-res-fields.js'),
       ('settlements/isle-demo/src', '58-isle-protos.js'), ('src', '48-world-hamlets.js')]
    # the camps (core/camp, PLAN.md section 10, "the first build"): the census and the pitch, the Beast Riders' camp table
    # (BR_CAMP, read in place: [G data]), and this world's bands; CAT carries the kit's tent set (cat_bundle(tents=True))
    + [('core/camp', '10-camp-cultures.js'), ('core/camp', '20-camp-census.js'), ('core/camp', '30-camp-pitch.js'),
       ('kits/beast-riders/src', '79-br-camp.js'), ('src', '48k-world-camps.js')]
    # M7 (settlements/isle-demo/PLAN.md section 7): the two towns planned live here, as the city page plans them: the city
    # page's data (the kits' boxes, the census trades, the site file), the Iziz Vernacular and its pack, core/city (KCITY),
    # the Ring Sea vessels, core/simulation, core/export (+ core/biome's stage), the city page's [G data] half (src/15-50),
    # then this world's towns (48t: planned on the world's ground, a registry each in its frame, the ground hook);
    # 88t draws them with the city page's 60 and exports one town with its 62 (both read in place as factories)
    # 88c runs the sim on the world's clock and draws its citizens (the city page's 59 for their colours) and the canoe line
    + [('isle', 'data'), ('izpack', 'iziz'), ('bundle', 'kcity'), ('bundle', 'izv'), ('bundle', 'ringsea')]
    + [('core/simulation', f) for f in sorted(os.listdir(os.path.join(ROOT, 'core', 'simulation'))) if re.match(r'77-sim-.*\.js$', f)]
    + [('core/export', '07-core-export.js'), ('core/export', '09-core-export-adapters.js'), ('core/export', '10-core-export-scene.js'),
       ('core/biome', '44-core-stage.js')]
    + [('settlements/isle-demo/src', f) for f in ISLE_DATA_JS] + [('src', '48t-world-towns.js')]
    + LDF('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '84-world-nursery.js',
          '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js')
    + [('src', '88h-world-hamlets.js'), ('isledraw', '60-isle-draw.js'), ('isleexport', '62-isle-export-scene.js'), ('src', '88a-world-atlas.js'), ('src', '88t-world-towns.js'), ('src', '88k-world-camps.js'),
       ('settlements/isle-demo/src', '59-isle-citizens.js'), ('src', '88c-world-life.js'), ('src', '89-world-geysers.js')]
    + LDF('90-world-camera.js', '91-world-probe.js', '98-world-start.js', '99-tail.html')
)
# the page's own words in the world's head (src/world/00-head.html) (its title and caption), replaced: each must be found exactly once
HEAD = [('<title>Krator Little Demo</title>', '<title>Krator Isle Demo</title>'),
        ("<b>Little Demo</b> · the scale model's eastern desert at 1:1", "<b>Isle Demo</b> · the scale model's Ring Sea isles at 1:1")]
# names a biome fragment must not use (a host engine's kit): the same list every kit's build.py checks
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
RASTERS = ['elev', 'wlev', 'clim', 'rain', 'temp', 'biome', 'mask', 'scarpl', 'scarpu', 'scarpw']


def find_node():
    """node for the syntax check: $NODE, then PATH. None when there is none: the build then says so."""
    import shutil
    env = os.environ.get('NODE')
    if env and (shutil.which(env) or os.path.isfile(env)):
        return shutil.which(env) or env
    return shutil.which('node')


def data_fragment():
    meta = json.load(open(os.path.join(DATA, 'region.json'), encoding='utf8'))
    png = {k: base64.b64encode(open(os.path.join(DATA, k + '.png'), 'rb').read()).decode('ascii') for k in RASTERS}
    # the baked parts (bake.py): the highways' lines and the towns' placements and ground grids, when baked
    extra = ''
    for k in ('roads', 'towns'):
        f = os.path.join(DATA, k + '.json')
        if os.path.isfile(f):
            extra += ',%s:%s' % (k, json.dumps(json.load(open(f, encoding='utf8')), separators=(',', ':')))
    return ('// ==================== 05-world-data.js (generated by build.py from data/: do not edit)\n'
            'var WORLD_DATA={meta:' + json.dumps(meta, separators=(',', ':')) + ',png:' + json.dumps(png) + extra + '};\n')


def main():
    out, bad = [], []
    for where, f in ORDER:
        if where == 'gen':
            out.append(data_fragment())
            continue
        if where == 'pack':
            out.append('\n// ==================== the library pack: %s\n' % f)
            out.append(pack_fragment(f))
            continue
        if where == 'islpack':   # a building kit's pack (the hamlets' Islanders), as the city page takes it
            out.append('\n// ==================== the library pack: kits/%s\n' % f)
            out.append(_mp.fragment(os.path.join(ROOT, 'kits', f), f, side=SIDE))
            continue
        if where == 'isle':      # the city page's data fragments (settlements/isle-demo/build.py)
            B = _isle_build()
            out.append('\n// ==================== the city page\'s data (settlements/isle-demo/build.py: dims, trades, site)\n')
            out.append(B.dims_fragment() + B.trades_fragment() + B.site_fragment())
            continue
        if where == 'izpack':    # the Iziz pack as the city page takes it (its Vernacular's families, no fauna, no city)
            izp = os.path.join(ROOT, 'settlements', 'iziz')
            fams = json.load(open(os.path.join(izp, 'tex', 'pack.json'), encoding='utf-8')).get('families', {})
            out.append('\n// ==================== the library pack: settlements/iziz\n')
            out.append(_mp.fragment(izp, 'iziz', exclude=[k for k in fams if k.startswith(('fauna', 'city'))], side=SIDE))
            continue
        if where == 'isledraw':  # the city page's drawing (60-isle-draw.js), once a town: a factory over the town's own group
            src = open(os.path.join(ROOT, 'settlements', 'isle-demo', 'src', f), encoding='utf8').read()
            out.append('\n// ==================== settlements/isle-demo/src/%s, as a factory (88t-world-towns.js calls it once a town)\n' % f)
            out.append('var ISLE_DRAW_FACTORY = function (scene) {\n' + src + '\nreturn DRAW;\n};\n')
            continue
        if where == 'isleexport':   # the city page's export contributors (62-isle-export-scene.js), as a factory over a town's group and DRAW
            src = open(os.path.join(ROOT, 'settlements', 'isle-demo', 'src', f), encoding='utf8').read()
            out.append('\n// ==================== settlements/isle-demo/src/%s, as a factory (88t-world-towns.js calls it for the town it exports)\n' % f)
            out.append('var ISLE_EXPORT_FACTORY = function (scene, DRAW) {\n' + src + '\n};\n')
            continue
        if where == 'bundle':    # settlements/isle-demo/bundles.py: ISK (the Islanders), CAT (the Beast Riders' buildings), IZV, KCITY, RINGSEA
            if os.path.join(ROOT, 'settlements', 'isle-demo') not in sys.path:
                sys.path.insert(0, os.path.join(ROOT, 'settlements', 'isle-demo'))
            import bundles as _bd
            if f == 'kcity':
                js = _bd.kcity_bundle()
            elif f == 'ringsea':
                js, _ = _bd.ringsea_fragment()
            elif f == 'izv':
                js, _ = _bd.izv_bundle()
            else:
                js, _ = _bd.isk_bundle() if f == 'isk' else _bd.cat_bundle(SIDE, tents=True)
            out.append('\n// ==================== the %s bundle (settlements/isle-demo/bundles.py)\n' % f.upper())
            out.append(js)
            continue
        path =os.path.join(WORLD_SRC, f) if where == 'ld' else os.path.join(ROOT if where != 'src' else HERE, where, f)
        s = open(path, encoding='utf8').read()
        if where == 'ld' and f == '00-head.html':
            for old, new in HEAD:
                if s.count(old) != 1:
                    sys.exit("src/world/00-head.html changed: '%s' not found once; update HEAD in build.py" % old)
                s = s.replace(old, new)
        if where.startswith('biomes/') and '-biome-' in f:
            for w in FORBID:
                if w in s:
                    bad.append('%s/%s: uses %s' % (where, f, w))
        out.append('\n// ==================== %s/%s\n' % (where, f) if f.endswith('.js') else '')
        out.append(s)
    if bad:
        sys.exit('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    # a kit's registry closes with BIO.kitEnd in its LAST fragment: if a kit moves it to a new fragment (eastabyss's
    # fauna, Oct 2026) and the list here misses that fragment, every later kit's items land in its registry
    for k, last in KIT_LAST.items():
        body = open(os.path.join(ROOT, 'biomes', k, 'src', last), encoding='utf8').read()
        if not re.search(r'^[^/\n]*BIO\.kitEnd\(', body, re.M):
            sys.exit('KIT %s: its last listed fragment (%s) does not call BIO.kitEnd: list the fragment that does' % (k, last))
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    if SIDE:   # the packs beside the page (dist/isle-demo.tex.<kit>.js), loaded by <script src> ahead of its code
        html = _mp.write_sidecar(SIDE, html, DIST, 'isle-demo.tex.js')
    dst = os.path.join(DIST, OUT)
    open(dst, 'w', encoding='utf8', newline='\n').write(html)
    node = find_node()
    note = 'syntax NOT CHECKED (no node: set NODE=/path/to/node)'
    if node:
        js = re.findall(r'<script>(.*?)</script>', html, re.S)
        tmp = os.path.join(DIST, '.syntax-check.js')
        open(tmp, 'w', encoding='utf8').write('\n'.join(js))
        r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
        os.remove(tmp)
        if r.returncode:
            sys.exit('SYNTAX ERROR:\n' + r.stderr[-3000:])
        note = 'syntax checked'
    # the artifact's copy: the Artifact service wraps a page in its own document skeleton, so this one is the page's
    # content without the doctype, html, head and body tags, and three.js as a plain script tag
    art = html.replace(html[:html.index('<title>')], '', 1).replace('</head><body>', '', 1).replace('</body></html>', '')
    m = re.search(r"<script>document\.write\('<script src=\"(https://cdnjs[^\"]+)\".*?</script>", art)
    art = art[:m.start()] + '<script src="%s"></script>' % m.group(1) + art[m.end():]
    open(os.path.join(DIST, OUT.replace('.html', '.artifact.html')), 'w', encoding='utf8', newline='\n').write(art)
    print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(ORDER), len(html) // 1024, note))


if __name__ == '__main__':
    main()
