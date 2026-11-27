#!/usr/bin/env python3
"""Build the East Abyss Basin & Near-Environs open-world region: dist/east-abyss.html.

The scale model's East Abyss basin, Yuni Valley, and East Rim near-environs (openworld/SITES.json 'east-abyss':
cut by tools/scale-model/cut_site.py east-abyss with --smooth --relief) at 1:1 on core/world, with
biomes/eastabyss growing on it, natural coastlines (core/coast), geology-driven landforms (43b/88l),
and resource/geology overlays (49r/89r).

  data/         region.json and the rasters (tools/scale-model/cut_site.py east-abyss)
  src/          46-world-config.js (16 East Abyss settlements & vantages), 47-world-kits.js, 49-world-eastabyss.js
  ../../core/   world, rand, terrain, biome, space, tags, atmos, water, coast, materials, shadow, export

  python3 tools/build.py openworld/east-abyss
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)
import importlib.util as _ilu, json, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
DIST = os.path.join(HERE, 'dist')
OUT = 'east-abyss.html'
WORLD_SRC = os.path.join(ROOT, 'core', 'world')
sys.path.insert(0, WORLD_SRC)
import world_data as WD   # noqa: E402

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

KIT_FRAGS = [('biomes/eastabyss/src', f) for f in (
    '50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js',
    '60-biome-eastabyss-floor.js', '65-biome-eastabyss-dress.js',
    '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js'
)]
KIT_LAST = {'eastabyss': '75-biome-eastabyss-fauna.js'}

sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp   # noqa: E402
PACK_KITS = ['eastabyss']
SIDE = None if '--inline-packs' in sys.argv else {}

def _fams(kit):
    pj = os.path.join(ROOT, 'biomes', kit, 'tex', 'pack.json')
    return sorted(json.load(open(pj, encoding='utf-8')).get('families', {})) if os.path.isfile(pj) else []

_DROP = lambda k: k.startswith('tower') or k.startswith('jetty')
PACK_EXCL = {k: [f for f in _fams(k) if _DROP(f)] for k in PACK_KITS}
LDF = lambda *fs: [('ld', f) for f in fs]

CORE_BIOME = [
    '10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js',
    '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '34-core-impostor.js', '35-core-anim.js', '36-core-walker.js', '38-core-fire.js', '39-core-lean.js'
]

_wds = _ilu.spec_from_file_location('core_world_data', os.path.join(ROOT, 'core', 'world', 'world_data.py'))
_WD = _ilu.module_from_spec(_wds); _wds.loader.exec_module(_WD)
RES_FRAGS = _WD.RES_FRAGS

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
       ('core/atmos', '89-atmos-4-weather.js'), ('core/atmos', '89-atmos-9-host.js'), ('core/atmos/host', '89-atmos-e-weatherhost.js'),
       ('core/atmos/fx', '89-atmos-fx-raincover.js'),
       ('core/water', '20-core-water.js'), ('core/water', '21-core-water-shore.js'), ('core/water', '22-core-water-flow.js'),
       ('core/water', '50-core-water-draw.js'), ('core/water', '51-core-water-kinds.js'), ('core/water/farbed', '53-core-water-farbed.js'),
       ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'), ('core/materials/record', '25-matlib-host.js'),
       ('core/materials/record', '26-matlib-bind.js'),
       ('biomes/sedesert/src', '35-core-strata.js'),
       ('core/export', '07-core-export.js'), ('core/export', '09-core-export-adapters.js'), ('core/export', '10-core-export-scene.js')]
    + [('core/mask', '25-core-mask.js'), ('core/mask', '27-core-mask-distance.js'), ('core/coast', '30-core-coast.js')]
    + LDF('40-world-smooth.js', '43-world-relief.js', '43m-world-micro.js', '44-world-streams.js')
    + [('core/terrain', '37-core-stacks.js')] + LDF('43b-world-landforms.js')
    + LDF('41-world-fields.js', '42-world-roads.js', '44c-world-coast.js')
    + LDF('45-world-host.js') + [('src', '46-world-config.js'), ('src', '47-world-kits.js')]
    + [('pack', k) for k in PACK_KITS]
    + KIT_FRAGS
    + [('src', '49-world-eastabyss.js')]
    + LDF('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '83s-world-streams.js',
          '84-world-nursery.js', '85-world-flora.js',
          '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '88l-world-landforms.js')
    + [('resgeo', 'geology')] + RES_FRAGS + [('ld', '49r-world-resources.js'), ('ld', '89r-world-resources-map.js')]
    + LDF('90-world-camera.js', '91-world-probe.js', '93-world-propose.js', '94-world-export.js', '98-world-start.js', '99-tail.html')
)

HEAD = [
    ('<title>Krator Little Demo</title>', '<title>Krator: East Abyss Basin</title>'),
    ("<b>Little Demo</b> · the scale model's eastern desert at 1:1",
     "<b>East Abyss Basin</b> · salt lakes, Carboniferous canopy & abyssal walls at 1:1")
]


def find_node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    return None


def data_fragment():
    return WD.fragment(
        DATA, '',
        '05-world-data.js (generated by build.py from data/: do not edit)',
        'openworld/east-abyss/data (tools/scale-model/cut_site.py east-abyss) decoded by core/world/world_data.py',
        extra={}
    )


def main():
    out = []
    for where, f in ORDER:
        if where == 'resgeo':
            out.append(_WD.geology_fragment(DATA))
            continue
        if where == 'gen':
            out.append(data_fragment())
            continue
        if where == 'pack':
            out.append('\n// ==================== the library pack: %s\n' % f)
            out.append(_mp.fragment(os.path.join(ROOT, 'biomes', f), f, exclude=PACK_EXCL[f], side=SIDE))
            continue
        p = os.path.join(WORLD_SRC if where == 'ld' else (SRC if where == 'src' else os.path.join(ROOT, where)), f)
        txt = open(p, encoding='utf-8').read()
        if where == 'ld' and f == '00-head.html':
            for a, b in HEAD:
                txt = txt.replace(a, b, 1)
        if f.endswith('.js'):
            out.append('\n// ==================== %s/%s\n' % (where, f))
        out.append(txt)

    BSRC.report()
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    if SIDE is not None:
        html = _mp.write_sidecar(SIDE, html, DIST, 'east-abyss.tex.js')
    out_path = os.path.join(DIST, OUT)
    with open(out_path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)

    node = find_node()
    status = 'syntax NOT CHECKED'
    if node:
        scripts = re.findall(r'<script>([\s\S]*?)</script>', html)
        chk = os.path.join(HERE, '.syntax.js')
        for i, sc in enumerate(scripts):
            with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(sc)
            r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print('script #%d syntax error:\n%s' % (i + 1, r.stdout + r.stderr))
                sys.exit(1)
        try:
            os.remove(chk)
        except OSError:
            pass
        status = 'syntax OK'
    print('built dist/%s  (%d fragments, %.0f KB)  %s' % (OUT, len(ORDER), os.path.getsize(out_path) / 1024, status))


if __name__ == '__main__':
    main()
