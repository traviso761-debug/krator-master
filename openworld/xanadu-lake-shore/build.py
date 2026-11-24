#!/usr/bin/env python3
"""Build the Lake Shore province of Erewhon's lake: dist/xanadu-lake-shore.html (settlements/xanadu/BUILD-OUT.md).

The sixth region (the owner, 2026-11-16: "One region per province. Can go ahead and cut region"): the Lake Shore
province (p1, Lēk-Shor, seat Erehwon; core/region/data/xan-tune.js T.provinces, T.lake): Erehwon and its ring, the
thirteen shore towns from Ālph-Hēḍ round the south and west shore to Siṭāq, and the three small isles (Wesṭ-Āil,
Lāiṭ-Hāus, Bē-Āil), on map 5.1 at 1:1 (cut by tools/scale-model/cut_site.py, openworld/SITES.json) on core/world. The
long isle (Grēṭ-Āil) is not a site here (settlements/azure-dream). The Xanadu kit grows on the 'xanadu' overlay (its pass
table as data, read in place from openworld/xanadu-oidong-highrift/src/49-world-xanadu.js, as is that region's 43: the
overlay's greening). The sites are planned on that ground (core/world/48s-world-sites.js, baked by
core/world/bake_sites.py to plan/sites.json): Erehwon's ring of farming villages and its ranch on core/hamlet's `xanadu`
row (the spec copied from xanadu-oidong-highrift's), drawn with the Xanadu building kit (XAK). The shore towns and isles
are sites with no hamlets yet; their towns go on core/city later. The city itself is its page's (settlements/xanadu).

  data/         region.json and the rasters (tools/scale-model/cut_site.py xanadu-lake-shore), embedded as PNGs and
                decoded in the page (core/world/98-world-start.js)
  plan/         sites.json (python3 core/world/bake_sites.py xanadu-lake-shore), resources.json (--resources)
  src/          46 (config), 47 (kits), 48 (the sites' spec)

  python3 tools/build.py openworld/xanadu-lake-shore
  python3 build.py --no-checks
"""
import base64, importlib.util, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
PLAN = os.path.join(HERE, 'plan', 'sites.json')
DIST = os.path.join(HERE, 'dist')
OUT = 'xanadu-lake-shore.html'
NAME = 'xanadu-lake-shore'
WORLD_SRC = os.path.join(ROOT, 'core', 'world')   # the world's fragments (core/world, read in place)
XOH = 'openworld/xanadu-oidong-highrift/src'      # the Xanadu overlay's greening (43) and the kit's pass table (49), read in place
RASTERS = ['elev', 'wlev', 'clim', 'rain', 'temp', 'biome', 'mask', 'scarpl', 'scarpu', 'scarpw']

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# the kit under the sites: the Xanadu kit (its pass table as data: XOH's 49)
KIT_FRAGS = [('biomes/xanadu/src', f) for f in ('50-biome-xanadu-species.js', '52-biome-xanadu-library.js', '55-biome-xanadu-trees.js',
                                                '60-biome-xanadu-floor.js', '65-biome-xanadu-dress.js', '70-biome-xanadu.js')]
KIT_LAST = {'xanadu': '70-biome-xanadu.js'}
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp   # noqa: E402
PACK_KITS = ['xanadu']
SIDE = None if '--inline-packs' in sys.argv else {}
def _fams(path):
    pj = os.path.join(path, 'tex', 'pack.json')
    return sorted(json.load(open(pj, encoding='utf8')).get('families', {})) if os.path.isfile(pj) else []
_DROP = lambda k: k.startswith('tower') or k.startswith('jetty')   # the ground sets stay: the near ground's S4 layers (core/world/81-world-terrain.js)
PACK_EXCL = {k: [f for f in _fams(os.path.join(ROOT, 'biomes', k)) if _DROP(f)] for k in PACK_KITS}
# the Xanadu building kit's library pack (still settlements/xanadu's), only the families the village buildings draw
# (settlements/longsong/build.py XA_FAMS, the same villages)
XA = os.path.join(ROOT, 'settlements', 'xanadu')
XA_FAMS = ('cloth', 'clothR', 'corrugate', 'plaster', 'stone', 'tarp', 'thatch', 'white', 'wood', 'woodV', 'xBandC', 'xEarth', 'xMosC',
           'xMosD', 'xPenbey', 'xRubble', 'xSun', 'xTiles', 'xValance', 'xWash')
LDF = lambda *fs: [('ld', f) for f in fs]
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31b-core-leafset.js', '31j-core-joint.js',
              '32-core-variants.js', '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '36-core-walker.js', '38-core-fire.js',
              '39-core-lean.js']
# the region's resources (core/world/world_data.py: the geology cropped to the box; kits/resources' field, read in place)
_wds = importlib.util.spec_from_file_location('core_world_data', os.path.join(ROOT, 'core', 'world', 'world_data.py'))
_WD = importlib.util.module_from_spec(_wds); _wds.loader.exec_module(_WD)
RES_FRAGS = _WD.RES_FRAGS
sys.path.insert(0, WORLD_SRC); import bake_sites as _BS   # the towns' records (towns_data), as the bake plans on them (as xanadu-north-shore)
ORDER = (
    LDF('00-head.html') + [('gen', '05-world-data.js'),
     ('core/shader', '06-core-khook.js'), ('core/shader', '06b-core-kcolor.js'),
     ('core/rand', '08-core-rand.js'), ('core/clock', '20-core-clock.js'), ('core/terrain', '38-core-relief.js'),
     ('core/shadow', '10-core-shadow.js'), ('core/shadow/host', '12-core-shadow-host.js'),
     ('core/terrain', '45-core-horizon.js'), ('core/terrain/host', '45-core-horizon-shade.js'), ('core/terrain', '43-core-ground.js')]
    + [('core/biome', f) for f in CORE_BIOME]
    + [('core/space', '20-core-space.js'), ('core/biome', '40-core-place.js'), ('core/biome', '41-core-env.js'),
       ('core/tags', '50-core-tags.js'), ('core/tags', '52-core-tags-vocab.js'),
       ('core/atmos', '89-atmos-0-core.js'), ('core/atmos', '89-atmos-0p-presets.js'), ('core/atmos', '89-atmos-a-waves.js'),
       ('core/atmos', '89-atmos-b-skylight.js'), ('core/atmos', '89-atmos-8-export.js'),
       ('core/water', '20-core-water.js'), ('core/water', '21-core-water-shore.js'), ('core/water', '22-core-water-flow.js'),
       ('core/water', '50-core-water-draw.js'), ('core/water', '51-core-water-kinds.js'), ('core/water/farbed', '53-core-water-farbed.js'),
       ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'), ('core/materials/record', '25-matlib-host.js'),
       ('core/materials/record', '26-matlib-bind.js'),
       ('biomes/sedesert/src', '35-core-strata.js')]
    + [('core/mask', '25-core-mask.js'), ('core/mask', '27-core-mask-distance.js'), ('core/coast', '30-core-coast.js')]   # core/coast (KCOAST): the natural coasts
    + LDF('41-world-fields.js', '41l-world-landforms.js', '42-world-roads.js', '42b-world-bridges.js') + [(XOH, '43-world-xoh.js')]
    + LDF('44c-world-coast.js')
    + LDF('45-world-host.js') + [('src', '46-world-config.js'), ('src', '47-world-kits.js'),
     ('biomes/hyperjungle/src', '41-hyperjungle-globals.js')]
    + [('pack', k) for k in PACK_KITS] + [('xapack', 'xanadu')]
    + KIT_FRAGS
    # the sites: the Xanadu building kit (XAK) and the kit-piece flattener the isle demo shares, core/city's primitives,
    # core/hamlet, the site planner, this region's spec and the Xanadu kit's pass table as data
    + [('xak', 'XAK'), ('settlements/isle-demo/src', '58-isle-protos.js'),
       ('core/city', '33-city-strategies.js'), ('core/city', '15-city-ground.js'),   # 15 after 33, which makes KCITY: the stance 33's strategies name
       ('core/hamlet', '10-hamlet-wood.js'), ('core/hamlet', '12-hamlet-gather.js'),
       ('core/hamlet', '14-hamlet-farmland.js'), ('core/hamlet', '16-hamlet-names.js'), ('core/hamlet', '18-hamlet-names.js'),
       ('core/hamlet', '20-hamlet-cultures.js'), ('core/hamlet', '30-hamlet-village.js'),
       ('ld', '48s-world-sites.js'), ('src', '48-world-site.js'), ('ld', '48v-world-sample.js'),   # 48v: the countryside sample (HAMLETS-PLAN 3, A9)
        (XOH, '49-world-xanadu.js'),
       # the pitched camps (settlements/xanadu/WORKS-PLAN.md W2): core/camp, the Tents kit's boxes, the tune, read in place; the
       # planner and the drawer are xanadu-oidong-highrift's (48t, 88t)
       ('core/camp', '10-camp-cultures.js'), ('core/camp', '20-camp-census.js'), ('core/camp', '30-camp-pitch.js'), ('core/camp', '50-camp-tents.js'),
       ('kits/tents/src', '33-tn-table.js'), ('core/region/data', 'xan-tune.js'), (XOH, '48t-world-camps.js')]
    + LDF('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '84-world-nursery.js',
          '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '88r-world-sample.js', '88s-world-sites.js', '88b-world-bridges.js') + [(XOH, '88t-world-camps.js')]
    + [('resgeo', 'geology')] + RES_FRAGS + [('ld', '49r-world-resources.js'), ('ld', '89r-world-resources-map.js')]   # the resources: census, layers, markers
    + LDF('90-world-camera.js', '91-world-probe.js', '93-world-propose.js', '98-world-start.js', '99-tail.html')   # 93: proposing a site
)
HEAD = [('<title>Krator Little Demo</title>', '<title>Krator: the Lake Shore of Erewhon\'s lake</title>'),
        ("<b>Little Demo</b> · the scale model's eastern desert at 1:1",
         "<b>The Lake Shore of Erewhon's lake</b> · Erehwon, its ring and the south and west shore's towns at 1:1")]
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']


def find_node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    return None


def data_fragment():
    """the region's meta (its landform records inside: region.json `landforms`, stamped by core/world 41l) and rasters
    (PNGs the page decodes), and the baked plan: WORLD_DATA.sites, and its roads (each village's road and the links,
    bridged over the named rivers: core/world 42b) as the world's roads"""
    if not os.path.isfile(PLAN):
        sys.exit('build.py: no plan/sites.json: run python3 core/world/bake_sites.py ' + NAME)
    meta = json.load(open(os.path.join(DATA, 'region.json'), encoding='utf-8'))
    png = {k: base64.b64encode(open(os.path.join(DATA, k + '.png'), 'rb').read()).decode('ascii') for k in RASTERS}
    P = json.load(open(PLAN, encoding='utf-8'))
    roads = [dict(r, town=r['to']) for S in P['sites'] for r in S['roads']] + [dict(L, town=L['to']) for L in P.get('links', [])]
    # the lake towns' own ground (openworld/SITES.json's "towns": settlements/xanadu-lake, core/world/bake_towns.py; 41 takes it
    # inside the footprint, and its water: 41's WTOWN): the same records core/world/bake_sites.py plans on (step L3, 2026-11-23)
    towns = _BS.towns_data(NAME)
    return ('// ==================== 05-world-data.js (generated by build.py from data/ and plan/: do not edit)\n'
            'var WORLD_DATA={meta:' + json.dumps(meta, separators=(',', ':'), ensure_ascii=False) + ',png:' + json.dumps(png)
            + ',sites:' + json.dumps(P, separators=(',', ':'), ensure_ascii=False)
            + ',roads:' + json.dumps({'format': 'krator-openworld-roads', 'version': 1, 'roads': roads}, separators=(',', ':'))
            + ',towns:' + json.dumps(towns, separators=(',', ':'), ensure_ascii=False) + '};\n'
            + _WD.net_fragment(os.path.join(SRC, '48-world-site.js')))   # the network routes the links follow (the page plans again)


def xak_bundle():
    spec = importlib.util.spec_from_file_location('xanadu_kit_bundle', os.path.join(ROOT, 'kits', 'xanadu', 'kit_bundle.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    js, _ = mod.bundle('XAK')
    return js


def main():
    out, bad = [], []
    for where, f in ORDER:
        if where == 'resgeo':   # the region's geology (core/world/world_data.py geology_fragment: kits/resources' data cropped to the box)
            out.append(_WD.geology_fragment(DATA))
            continue
        if where == 'gen':
            out.append(data_fragment())
            continue
        if where == 'pack':
            out.append('\n// ==================== the library pack: biomes/%s\n' % f)
            out.append(_mp.fragment(os.path.join(ROOT, 'biomes', f), f, exclude=PACK_EXCL[f], side=SIDE))
            continue
        if where == 'xapack':   # the Xanadu building kit's maps (settlements/xanadu's pack, the village families only)
            out.append('\n// ==================== the library pack: settlements/xanadu (the village buildings\' families)\n')
            out.append(_mp.fragment(XA, 'xanadu', exclude=[k for k in _fams(XA) if k not in XA_FAMS], side=SIDE))
            continue
        if where == 'xak':
            out.append('\n// ==================== the Xanadu building kit (kits/xanadu/kit_bundle.py, sealed as XAK)\n')
            out.append(xak_bundle())
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
        html = _mp.write_sidecar(SIDE, html, DIST, NAME + '.tex.js')
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
