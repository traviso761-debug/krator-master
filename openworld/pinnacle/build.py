#!/usr/bin/env python3
"""Build the Pinnacle region of the open world: dist/pinnacle.html (openworld/PLAN-SITES.md, the first site).

The scale model round Pinnacle Rock (openworld/SITES.json 'pinnacle': a 60 km square on map 5.1, cut by
tools/scale-model/cut_site.py) at 1:1 on core/world, the rock on the savage hyperjungle's north-east edge since the owner's
move of 2026-11-10, with the hyperjungle and the NE rim's kit (biomes/abyssal-savannah) growing on it, and
the site planned on that ground (core/world/48s-world-sites.js, baked by core/world/bake_sites.py to plan/sites.json):
the nine bands that camp on the floor round the rock (core/camp, kits/beast-riders) and a track from each to the rock.
The town on the mesa is settlements/pinnacle-rock's own page.

  data/         region.json and the rasters (tools/scale-model/cut_site.py pinnacle)
  plan/         sites.json: the site's plan (python3 core/world/bake_sites.py pinnacle)
  src/          46-world-config.js (the site, "Go to", the first view), 47-world-kits.js (the kit that grows here),
                48-world-site.js (the site's spec: what is planned), 49-world-absav.js (the savannah kit as the world reads it)
  ../../core/   world (the runtime), rand, terrain, biome, space, tags, atmos, water, materials, camp

  python3 build.py            # dist/pinnacle.html
  python3 build.py --no-checks
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
PLAN = os.path.join(HERE, 'plan', 'sites.json')
DIST = os.path.join(HERE, 'dist')
OUT = 'pinnacle.html'
WORLD_SRC = os.path.join(ROOT, 'core', 'world')   # the world's fragments (core/world, read in place)
sys.path.insert(0, WORLD_SRC)
import world_data as WD   # noqa: E402  (core/world/world_data.py: the rasters decoded here, no canvas read in the page)

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# the kits: the eastern abyss's whole (the savannah borrows its species; its fauna fragment closes its registry), then the
# abyssal savannah's species, trees, floor and its kitEnd (biomes/abyssal-savannah/src 50-70)
KIT_FRAGS = (
    # the hyperjungle (the savage hyperjungle's overlay: the rock stands on its north-east edge since 2026-11-10)
    [('biomes/hyperjungle/src', f) for f in ('50-biome-hyperjungle-species.js', '52-biome-hyperjungle-library.js', '54-biome-hyperjungle-lands.js',
                                             '55-biome-hyperjungle-trees.js', '56-biome-hyperjungle-savage.js', '57-biome-hyperjungle-north.js',
                                             '58-biome-hyperjungle-fauna.js', '60-biome-hyperjungle-floor.js', '65-biome-hyperjungle-dress.js',
                                             '70-biome-hyperjungle.js')]
    +     [('biomes/eastabyss/src', f) for f in ('50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js', '60-biome-eastabyss-floor.js',
                                           '65-biome-eastabyss-dress.js', '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js')]
    + [('biomes/abyssal-savannah/src', f) for f in ('50-biome-absav-species.js', '55-biome-absav-trees.js', '60-biome-absav-floor.js',
                                                    '70-biome-absav.js')])
KIT_LAST = {'hyperjungle': '70-biome-hyperjungle.js', 'eastabyss': '75-biome-eastabyss-fauna.js', 'abyssal-savannah': '70-biome-absav.js'}
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp   # noqa: E402
PACK_KITS = ['hyperjungle', 'eastabyss', 'abyssal-savannah']
SIDE = None if '--inline-packs' in sys.argv else {}
def _fams(kit):
    pj = os.path.join(ROOT, 'biomes', kit, 'tex', 'pack.json')
    return sorted(json.load(open(pj, encoding='utf8')).get('families', {})) if os.path.isfile(pj) else []
_DROP = lambda k: k.startswith('tower') or k.startswith('jetty') or k.startswith('ground')
PACK_EXCL = {k: [f for f in _fams(k) if _DROP(f)] for k in PACK_KITS}
LDF = lambda *fs: [('ld', f) for f in fs]
# the biome core as the savannah's own page takes it (its leafsets, joints, variants, fire, lean, the env)
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31b-core-leafset.js', '31j-core-joint.js',
              '32-core-variants.js', '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '36-core-walker.js', '38-core-fire.js',
              '39-core-lean.js']
# the region's resources (core/world/world_data.py: the geology cropped to the box; kits/resources' field, read in place)
import importlib.util as _ilu   # noqa: E402
_wds = _ilu.spec_from_file_location('core_world_data', os.path.join(ROOT, 'core', 'world', 'world_data.py'))
_WD = _ilu.module_from_spec(_wds); _wds.loader.exec_module(_WD)
RES_FRAGS = _WD.RES_FRAGS
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
    + [('pack', k) for k in PACK_KITS]
    + KIT_FRAGS
    # the site: the Beast Riders' buildings with the kit's tent set (CAT), the kit-piece instancer the isle demo shares,
    # core/camp and the Beast Riders' camp table, the site planner and this region's spec
    + [('bundle', 'cat'), ('settlements/isle-demo/src', '58-isle-protos.js'),
       ('core/camp', '10-camp-cultures.js'), ('core/camp', '20-camp-census.js'), ('core/camp', '30-camp-pitch.js'),
       ('kits/beast-riders/src', '79-br-camp.js'), ('ld', '48s-world-sites.js'), ('src', '48-world-site.js'),
       ('src', '49-world-absav.js')]   # the savannah kit as the world reads it (its own trees and the eastern abyss's)
    + LDF('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '84-world-nursery.js',
          '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '88s-world-sites.js')
    + [('resgeo', 'geology')] + RES_FRAGS + [('ld', '49r-world-resources.js'), ('ld', '89r-world-resources-map.js')]   # the resources: census, layers, markers
    + LDF('90-world-camera.js', '91-world-probe.js', '93-world-propose.js', '98-world-start.js', '99-tail.html')   # 93: proposing a site
)
HEAD = [('<title>Krator Little Demo</title>', '<title>Krator: Pinnacle Rock</title>'),
        ("<b>Little Demo</b> · the scale model's eastern desert at 1:1", "<b>Pinnacle Rock</b> · the hyperjungle's edge round the rock at 1:1")]
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']


def find_node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    return None


def data_fragment():
    """the region's rasters decoded here (WORLD_R), its meta, and the baked plan: WORLD_DATA.sites, and its tracks as the
    world's roads (WORLD_DATA.roads: the ground is shaped to them and the terrain draws them)"""
    if not os.path.isfile(PLAN):
        sys.exit('build.py: no plan/sites.json: run python3 core/world/bake_sites.py pinnacle')
    P = json.load(open(PLAN, encoding='utf-8'))
    roads = [dict(r, town=r['to']) for S in P['sites'] for r in S['roads']]
    extra = {'sites': P, 'roads': {'format': 'krator-openworld-roads', 'version': 1, 'roads': roads}}
    return WD.fragment(DATA, '', '05-world-data.js (generated by build.py from data/ and plan/: do not edit)',
                       'openworld/pinnacle/data (tools/scale-model/cut_site.py) decoded by core/world/world_data.py; plan/sites.json (core/world/bake_sites.py)',
                       extra=extra)


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
            out.append('\n// ==================== the library pack: %s\n' % f)
            out.append(_mp.fragment(os.path.join(ROOT, 'biomes', f), f, exclude=PACK_EXCL[f], side=SIDE))
            continue
        if where == 'bundle':   # the Beast Riders' buildings and tents (settlements/isle-demo/bundles.py cat_bundle)
            if os.path.join(ROOT, 'settlements', 'isle-demo') not in sys.path:
                sys.path.insert(0, os.path.join(ROOT, 'settlements', 'isle-demo'))
            import bundles as _bd
            js, _ = _bd.cat_bundle(SIDE, tents=True)
            out.append('\n// ==================== the CAT bundle (settlements/isle-demo/bundles.py)\n')
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
        html = _mp.write_sidecar(SIDE, html, DIST, 'pinnacle.tex.js')
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
