#!/usr/bin/env python3
"""Build the Iziz cluster region of the open world: dist/iziz-cluster.html (openworld/PLAN-SITES.md, the third region).

Girder, Mav's Refuge and Talia (openworld/SITES.json 'iziz-cluster', the owner, 2026-11-09: "the roads between them"):
each town's square on map 5.1 and a 10 km corridor between the towns (Mav's Refuge to Girder, Girder to Talia), cut by
tools/scale-model/cut_site.py at 500 m cells, on core/world at 1:1. The hyperjungle grows on the savage hyperjungle round
Girder and Mav's Refuge, the abyssal savannah's kit on the savannah rims round Talia. The sites are planned on that ground
(core/world/48s-world-sites.js, baked by core/world/bake_sites.py to plan/sites.json): Beast Rider bands camped round the
two Beast Rider towns (core/camp, kits/beast-riders) with a track from each to its town; Talia's farming and ranching
villages on core/hamlet's `iziz` row (21-hamlet-iziz.js), drawn with the Iziz Vernacular (IZV); and the roads between
the three towns, laid. The towns themselves are their pages' (settlements/girder, settlements/mavs-refuge, kits/talia).

  data/         region.json and the rasters (tools/scale-model/cut_site.py iziz-cluster), embedded as PNGs and decoded in
                the page (core/world/98-world-start.js), as the second region's are
  plan/         sites.json (python3 core/world/bake_sites.py iziz-cluster)
  src/          46 (config), 47 (kits), 48 (the sites' spec), 49 (the savannah kit as the world reads it)

  python3 build.py
  python3 build.py --no-checks
"""
import base64, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
PLAN = os.path.join(HERE, 'plan', 'sites.json')
DIST = os.path.join(HERE, 'dist')
OUT = 'iziz-cluster.html'
WORLD_SRC = os.path.join(ROOT, 'core', 'world')   # the world's fragments (core/world, read in place)
RASTERS = ['elev', 'wlev', 'clim', 'rain', 'temp', 'biome', 'mask', 'scarpl', 'scarpu', 'scarpw']

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# the kits: the hyperjungle (the savage hyperjungle and hyperjungle S), the eastern abyss's whole (the savannah borrows its
# species; its fauna fragment closes its registry) and the abyssal savannah's (the SE, E and NE savannah rims)
KIT_FRAGS = (
    [('biomes/hyperjungle/src', f) for f in ('50-biome-hyperjungle-species.js', '52-biome-hyperjungle-library.js', '54-biome-hyperjungle-lands.js',
                                             '55-biome-hyperjungle-trees.js', '56-biome-hyperjungle-savage.js', '57-biome-hyperjungle-north.js',
                                             '58-biome-hyperjungle-fauna.js', '60-biome-hyperjungle-floor.js', '65-biome-hyperjungle-dress.js',
                                             '70-biome-hyperjungle.js')]
    + [('biomes/eastabyss/src', f) for f in ('50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js', '60-biome-eastabyss-floor.js',
                                             '65-biome-eastabyss-dress.js', '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js')]
    + [('biomes/abyssal-savannah/src', f) for f in ('50-biome-absav-species.js', '55-biome-absav-trees.js', '60-biome-absav-floor.js',
                                                    '70-biome-absav.js')])
KIT_LAST = {'hyperjungle': '70-biome-hyperjungle.js', 'eastabyss': '75-biome-eastabyss-fauna.js', 'abyssal-savannah': '70-biome-absav.js'}
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp   # noqa: E402
PACK_KITS = ['hyperjungle', 'eastabyss', 'abyssal-savannah']
SIDE = None if '--inline-packs' in sys.argv else {}
def _fams(path):
    pj = os.path.join(path, 'tex', 'pack.json')
    return sorted(json.load(open(pj, encoding='utf8')).get('families', {})) if os.path.isfile(pj) else []
_DROP = lambda k: k.startswith('tower') or k.startswith('jetty') or k.startswith('ground')
PACK_EXCL = {k: [f for f in _fams(os.path.join(ROOT, 'biomes', k)) if _DROP(f)] for k in PACK_KITS}
LDF = lambda *fs: [('ld', f) for f in fs]
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31b-core-leafset.js', '31j-core-joint.js',
              '32-core-variants.js', '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '36-core-walker.js', '38-core-fire.js',
              '39-core-lean.js']
ORDER = (
    LDF('00-head.html') + [('gen', '05-world-data.js'),
     ('core/shader', '06-core-khook.js'), ('core/shader', '06b-core-kcolor.js'),
     ('core/rand', '08-core-rand.js'), ('core/clock', '20-core-clock.js'), ('core/terrain', '38-core-relief.js')]
    + [('core/biome', f) for f in CORE_BIOME]
    + [('core/space', '20-core-space.js'), ('core/biome', '40-core-place.js'), ('core/biome', '41-core-env.js'),
       ('core/tags', '50-core-tags.js'), ('core/tags', '52-core-tags-vocab.js'),
       ('core/atmos', '89-atmos-0-core.js'), ('core/atmos', '89-atmos-0p-presets.js'), ('core/atmos', '89-atmos-a-waves.js'),
       ('core/atmos', '89-atmos-b-skylight.js'), ('core/atmos', '89-atmos-8-export.js'),
       ('core/water', '20-core-water.js'), ('core/water', '21-core-water-shore.js'), ('core/water', '22-core-water-flow.js'),
       ('core/water', '50-core-water-draw.js'), ('core/water', '51-core-water-kinds.js'),
       ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'), ('core/materials/record', '25-matlib-host.js'),
       ('core/materials/record', '26-matlib-bind.js'),
       ('biomes/sedesert/src', '35-core-strata.js')]
    + LDF('41-world-fields.js', '42-world-roads.js')
    + LDF('45-world-host.js') + [('src', '46-world-config.js'), ('src', '47-world-kits.js'),
     ('biomes/hyperjungle/src', '41-hyperjungle-globals.js')]
    + [('pack', k) for k in PACK_KITS] + [('izpack', 'iziz')]
    + KIT_FRAGS
    # the sites: the Beast Riders' buildings with the kit's tent set (CAT), the Iziz Vernacular (IZV), the kit-piece
    # instancer the isle demo shares, core/camp and the Beast Riders' camp table, core/city's primitives, core/hamlet with
    # the Vernacular's row, the site planner, this region's spec and the savannah kit as the world reads it
    + [('bundle', 'cat'), ('bundle', 'izv'), ('settlements/isle-demo/src', '58-isle-protos.js'),
       ('core/camp', '10-camp-cultures.js'), ('core/camp', '20-camp-census.js'), ('core/camp', '30-camp-pitch.js'),
       ('kits/beast-riders/src', '79-br-camp.js'),
       ('core/city', '33-city-strategies.js'), ('core/city', '15-city-ground.js'),   # 15 after 33, which makes KCITY: the stance 33's strategies name
       ('core/hamlet', '10-hamlet-wood.js'), ('core/hamlet', '12-hamlet-gather.js'),
       ('core/hamlet', '14-hamlet-farmland.js'), ('core/hamlet', '16-hamlet-names.js'), ('core/hamlet', '18-hamlet-names.js'),
       ('core/hamlet', '20-hamlet-cultures.js'), ('core/hamlet', '21-hamlet-iziz.js'), ('core/hamlet', '30-hamlet-village.js'),
       ('ld', '48s-world-sites.js'), ('src', '48-world-site.js'), ('src', '49-world-absav.js')]
    + LDF('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '84-world-nursery.js',
          '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '88s-world-sites.js')
    + LDF('90-world-camera.js', '91-world-probe.js', '98-world-start.js', '99-tail.html')
)
HEAD = [('<title>Krator Little Demo</title>', '<title>Krator: the Iziz cluster</title>'),
        ("<b>Little Demo</b> · the scale model's eastern desert at 1:1",
         "<b>The Iziz cluster</b> · Girder, Mav's Refuge, Talia and the roads between them at 1:1")]
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']


def find_node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    return None


def data_fragment():
    """the region's meta and rasters (PNGs the page decodes), and the baked plan: WORLD_DATA.sites, and its roads (the
    camps' tracks, the villages' roads and the links between the towns) as the world's roads (the ground is shaped to them
    and the terrain draws them)"""
    if not os.path.isfile(PLAN):
        sys.exit('build.py: no plan/sites.json: run python3 core/world/bake_sites.py iziz-cluster')
    meta = json.load(open(os.path.join(DATA, 'region.json'), encoding='utf-8'))
    png = {k: base64.b64encode(open(os.path.join(DATA, k + '.png'), 'rb').read()).decode('ascii') for k in RASTERS}
    P = json.load(open(PLAN, encoding='utf-8'))
    roads = [dict(r, town=r['to']) for S in P['sites'] for r in S['roads']] + [dict(L, town=L['to']) for L in P.get('links', [])]
    return ('// ==================== 05-world-data.js (generated by build.py from data/ and plan/: do not edit)\n'
            'var WORLD_DATA={meta:' + json.dumps(meta, separators=(',', ':'), ensure_ascii=False) + ',png:' + json.dumps(png)
            + ',sites:' + json.dumps(P, separators=(',', ':'), ensure_ascii=False)
            + ',roads:' + json.dumps({'format': 'krator-openworld-roads', 'version': 1, 'roads': roads}, separators=(',', ':')) + '};\n')


def bundles():
    if os.path.join(ROOT, 'settlements', 'isle-demo') not in sys.path:
        sys.path.insert(0, os.path.join(ROOT, 'settlements', 'isle-demo'))
    import bundles as _bd
    return _bd


def main():
    out, bad = [], []
    for where, f in ORDER:
        if where == 'gen':
            out.append(data_fragment())
            continue
        if where == 'pack':
            out.append('\n// ==================== the library pack: %s\n' % f)
            out.append(_mp.fragment(os.path.join(ROOT, 'biomes', f), f, exclude=PACK_EXCL[f], side=SIDE))
            continue
        if where == 'izpack':    # the Iziz pack as the isle demo's pages take it (its Vernacular's families, no fauna, no city)
            izp = os.path.join(ROOT, 'settlements', 'iziz')
            out.append('\n// ==================== the library pack: settlements/iziz\n')
            out.append(_mp.fragment(izp, 'iziz', exclude=[k for k in _fams(izp) if k.startswith(('fauna', 'city'))], side=SIDE))
            continue
        if where == 'bundle':   # settlements/isle-demo/bundles.py: CAT (the Beast Riders' buildings and tents), IZV
            _bd = bundles()
            js, _ = _bd.izv_bundle() if f == 'izv' else _bd.cat_bundle(SIDE, tents=True)
            out.append('\n// ==================== the %s bundle (settlements/isle-demo/bundles.py)\n' % f.upper())
            out.append(js)
            continue
        path = os.path.join(WORLD_SRC, f) if where == 'ld' else os.path.join(ROOT if where != 'src' else HERE, where, f)
        s = open(path, encoding='utf8').read()
        if where == 'ld' and f == '00-head.html':
            for old, new in HEAD:
                if s.count(old) != 1:
                    sys.exit("core/world/00-head.html changed: '%s' not found once; update HEAD in build.py" % old)
                s = s.replace(old, new)
        if where.startswith('biomes/') and '-biome-' in f:
            for w in FORBID:
                if w in s:
                    bad.append('%s/%s: uses %s' % (where, f, w))
        out.append('\n// ==================== %s/%s\n' % (where, f) if f.endswith('.js') else '')
        out.append(s)
    if bad:
        sys.exit('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    for k, last in KIT_LAST.items():
        body = open(os.path.join(ROOT, 'biomes', k, 'src', last), encoding='utf8').read()
        if not re.search(r'^[^/\n]*BIO\.kitEnd\(', body, re.M):
            sys.exit('KIT %s: its last listed fragment (%s) does not call BIO.kitEnd: list the fragment that does' % (k, last))
    BSRC.report()
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    if SIDE:
        html = _mp.write_sidecar(SIDE, html, DIST, 'iziz-cluster.tex.js')
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
    print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(ORDER), len(html) // 1024, note))


if __name__ == '__main__':
    main()
