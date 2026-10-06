#!/usr/bin/env python3
"""Build the 'little demo' open world: one self-contained page, dist/little-demo.html.

The page is concatenated from an explicit list (not filename order): the region's data, the shared cores, the world's
fields and host, then each biome kit's fragments as ONE block in its own order (a kit's fragments run in its own
registry: BIO.kit at the top of its first, BIO.kitEnd at the end of its last, so two kits must never interleave), then
the world's streaming, sky, camera and probe.

  data/         region.json and the rasters, written by tools/scale-model/extract_region.py (README.md says how);
                roads.json and towns.json, written by bake.py (the highways, the towns' placements and ground)
  dist/towns/   each town's tile (bake.py), fetched by the page when the camera comes near
  src/          this world's fragments
  ../../core/   rand, terrain (relief), biome, atmos (the wave field)
  ../../biomes/ the kits, read in place: sedesert, eastabyss, hyperjungle, ebadlands

  python3 build.py            # dist/little-demo.html
  python3 build.py --no-checks
"""
import base64, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
DATA = os.path.join(HERE, 'data')
DIST = os.path.join(HERE, 'dist')
OUT = 'little-demo.html'

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# the biome kits this region grows, each a block of its own fragments in order. A kit's 41-*-globals (hyperjungle's
# top-level helper names) goes before every kit: it declares names at the top level, the others keep theirs local.
KITS = {
    'sedesert': ['50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
                 '70-biome-sedesert.js', '75-biome-sedesert-fauna.js'],
    'eastabyss': ['50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js', '60-biome-eastabyss-floor.js',
                  '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js'],
    'hyperjungle': ['50-biome-hyperjungle-species.js', '55-biome-hyperjungle-trees.js', '60-biome-hyperjungle-floor.js',
                    '70-biome-hyperjungle.js'],
    'ebadlands': ['50-biome-ebadlands-species.js', '55-biome-ebadlands-trees.js', '60-biome-ebadlands-floor.js',
                  '65-biome-ebadlands-dress.js', '70-biome-ebadlands.js'],
}
ORDER = (
    [('src', '00-head.html'), ('gen', '05-world-data.js'),
     ('core/rand', '08-core-rand.js'), ('core/terrain', '38-core-relief.js'),
     ('core/biome', '10-core-head.js'), ('core/biome', '20-core-kit.js'), ('core/biome', '30-core-foliage.js'),
     ('core/biome', '35-core-anim.js'), ('core/biome', '40-core-place.js'),
     ('core/atmos', '89-atmos-0-core.js'), ('core/atmos', '89-atmos-0p-presets.js'), ('core/atmos', '89-atmos-a-waves.js'),
     ('biomes/sedesert/src', '35-core-strata.js'),
     ('src', '41-world-fields.js'), ('src', '42-world-roads.js'), ('src', '45-world-host.js'), ('src', '47-world-kits.js'),
     ('biomes/hyperjungle/src', '41-hyperjungle-globals.js')]
    + [('biomes/%s/src' % k, f) for k, fs in KITS.items() for f in fs]
    + [('src', f) for f in ('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '84-world-nursery.js',
                            '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '90-world-camera.js',
                            '91-world-probe.js', '98-world-start.js', '99-tail.html')]
)
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
        path = os.path.join(ROOT if where != 'src' else HERE, where, f)
        s = open(path, encoding='utf8').read()
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
    for k, fs in KITS.items():
        last = open(os.path.join(ROOT, 'biomes', k, 'src', fs[-1]), encoding='utf8').read()
        if not re.search(r'^[^/\n]*BIO\.kitEnd\(', last, re.M):
            sys.exit('KIT %s: its last listed fragment (%s) does not call BIO.kitEnd: list the fragment that does' % (k, fs[-1]))
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    dst = os.path.join(DIST, OUT)
    open(dst, 'w', encoding='utf8').write(html)
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
    open(os.path.join(DIST, OUT.replace('.html', '.artifact.html')), 'w', encoding='utf8').write(art)
    print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(ORDER), len(html) // 1024, note))


if __name__ == '__main__':
    main()
