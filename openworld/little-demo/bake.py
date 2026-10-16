#!/usr/bin/env python3
"""Bake the parts of the open world that come from other builds or need the whole world to compute, in a headless
page (playwright, SwiftShader; bake/browser.py):

  python3 bake.py towns [Name ...]   each settlement in source/towns.json: open its build's page, cut its exteriors
                                     and streets out as a tile (bake/bake_town.js) -> dist/towns/<name>.ktile (gzip),
                                     and its placement and ground grid -> data/towns.json
  python3 bake.py roads              route the highways in source/highways.json over the world (src/42-world-roads.js),
                                     ending at each town's footprint -> data/roads.json
  python3 bake.py all                towns, build, roads, build

A town's page must be built first (its own build.py). Run `python3 build.py` after a bake: the page reads data/.
"""
import base64, gzip, json, math, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(HERE, 'bake'))
from browser import Page

SRC = os.path.join(HERE, 'source')
DATA = os.path.join(HERE, 'data')
TILES = os.path.join(HERE, 'dist', 'towns')


def region():
    return json.load(open(os.path.join(DATA, 'region.json'), encoding='utf8'))


def place_of(meta, name):
    for s in meta['settlements']:
        if s['name'] == name:
            return s['x'], s['z']
    raise SystemExit('no settlement named %s in region.json' % name)


def bake_towns(names):
    T = json.load(open(os.path.join(SRC, 'towns.json'), encoding='utf8'))
    meta = region()
    out_path = os.path.join(DATA, 'towns.json')
    old = {t['name']: t for t in json.load(open(out_path, encoding='utf8'))['towns']} if os.path.isfile(out_path) else {}
    js = open(os.path.join(HERE, 'bake', 'bake_town.js'), encoding='utf8').read()
    os.makedirs(TILES, exist_ok=True)
    for name, t in T['towns'].items():
        if names and name not in names:
            continue
        # a town whose build is not in this checkout yet can name another checkout to read its built page from
        root = os.path.normpath(os.path.join(ROOT, t['root'])) if t.get('root') else ROOT
        page = os.path.join(root, t['page'])
        with Page(root=root) as P:
            if not os.path.isfile(page):
                print('%s: %s is not built (run its build.py): skipped' % (name, t['page']))
                continue
            t0 = time.time()
            load = P.open(t['page'], t.get('query', ''))
            cfg = {'centre': t['centre'], 'R': t['R'], 'ground': t['ground'], 'step': 4, 'hstep': 10, 'tex': 512, 'groundTex': 2048,
                   'exKit': T['exKit'], 'exFam': T['exFam']}
            if 'site' in t:
                cfg['site'] = t['site']
                cfg['siteR'] = t.get('siteR', 1500)
            t1 = time.time()
            r = P.eval(js, cfg)
            t2 = time.time()
            CH = 8 << 20
            jtxt = ''.join(P.eval('(a)=>window.__bake.json.slice(a[0],a[1])', [i, i + CH]) for i in range(0, r['jsonLen'], CH))
            btxt = ''.join(P.eval('(a)=>window.__bake.bin.slice(a[0],a[1])', [i, i + CH]) for i in range(0, r['binLen'], CH))
            P.eval('()=>{window.__bake=null;}')
            print('   the bake on the page %.0f s (its own clock %.0f s); read back %.0f s' % (t2 - t1, r['ms'] / 1000, time.time() - t2))
            head = json.loads(jtxt)
            blob = base64.b64decode(btxt)
            hj = json.dumps({k: v for k, v in head.items() if k not in ('hgrid', 'why')}, separators=(',', ':')).encode('utf8')
            pad = (4 - (len(hj) + 12) % 4) % 4
            raw = b'KTWN' + (1).to_bytes(4, 'little') + (len(hj) + pad).to_bytes(4, 'little') + hj + b' ' * pad + blob
            fn = name.lower().replace(' ', '-') + '.ktile'
            with gzip.open(os.path.join(TILES, fn), 'wb', compresslevel=9) as fh:
                fh.write(raw)
            gz = os.path.getsize(os.path.join(TILES, fn))
            if t['at'] == 'canyon':
                c = meta['canyon_candidates'][name][0]
                x, z = c['x'], c['z']
            else:
                x, z = place_of(meta, t['at'])
            rec = {'name': name, 'x': x, 'z': z, 'rot': math.radians(t.get('rot', 0)), 'centre': [0, 0], 'R': t['R'],
                   'band': t.get('band', 400 if t['ground'] != 'flat' else 300), 'tile': 'towns/' + fn, 'build': t['page'],
                   'ground': t['ground'], 'stats': {'meshes': len(head['meshes']), 'tris': round(head['stats'].get('tris', 0)),
                   'instances': head['stats'].get('instances', 0), 'textures': len(head['textures']), 'raw_kb': len(raw) // 1024, 'gzip_kb': gz // 1024}}
            if head.get('hgrid'):
                rec['grid'] = head['hgrid']
            for k in ('anchor', 'onWater'):
                if k in t:
                    rec[k] = t[k]
            old[name] = rec
            print(flush=True)
            print('%s: page %.0f s, bake %.0f s; %d meshes, %.2f M triangles, %d instances, %d textures; tile %d KB (gzip %d KB)' % (
                name, load, time.time() - t0 - load, len(head['meshes']), head['stats'].get('tris', 0) / 1e6,
                head['stats'].get('instances', 0), len(head['textures']), len(raw) // 1024, gz // 1024))
            print('   left out / kept: %s' % json.dumps(head['why']))
            if P.errors:
                print('   page errors: %s' % P.errors[:3])
            # saved after every town: a long bake that stops keeps what it finished
            json.dump({'format': 'krator-openworld-towns', 'version': 1, 'towns': list(old.values())},
                      open(out_path, 'w', encoding='utf8'), separators=(',', ':'))
            print('   data/towns.json: %d towns' % len(old), flush=True)


def bake_roads():
    H = json.load(open(os.path.join(SRC, 'highways.json'), encoding='utf8'))
    meta = region()
    towns = {t['name']: t for t in json.load(open(os.path.join(DATA, 'towns.json'), encoding='utf8'))['towns']} \
        if os.path.isfile(os.path.join(DATA, 'towns.json')) else {}
    places = {}
    for s in meta['settlements']:
        t = towns.get(s['name'])
        # a built town: the road stops at its footprint's edge (its own streets take over); otherwise at a waystation
        # 150 m short of the settlement's marker
        places[s['name']] = {'x': t['x'], 'z': t['z'], 'r': t['R'] + 30} if t else {'x': s['x'], 'z': s['z'], 'r': 150}
    pairs = [[a, b] for a, L in H['links'].items() for b in L]
    if os.path.isfile(os.path.join(DATA, 'roads.json')):
        os.remove(os.path.join(DATA, 'roads.json'))      # route over the land without the old roads
    subprocess.check_call([sys.executable, os.path.join(HERE, 'build.py')])
    with Page() as P:
        P.open('openworld/little-demo/dist/little-demo.html', '', wait='window.WORLD&&WORLD.ready&&window.ROADS', timeout=600)
        t0 = time.time()
        r = P.eval('(a)=>JSON.stringify(ROADS.routeAll(a.pairs,a.places))', {'pairs': pairs, 'places': places})
        r = json.loads(r)
        if P.errors:
            print('page errors: %s' % P.errors[:3])
    json.dump(r, open(os.path.join(DATA, 'roads.json'), 'w', encoding='utf8'), separators=(',', ':'))
    print('routed %d roads in %.0f s; errors: %s' % (len(r['roads']), time.time() - t0, r['errors']))
    for x in r['roads']:
        print('  %-14s - %-14s %6.1f km, climb %5d m, max grade %.1f %%, cut %4d m, fill %4d m, %d points, %d ms' % (
            x['from'], x['to'], x['length_m'] / 1000, x['climb_m'], x['maxGrade'] * 100, x['cutMax_m'], x['fillMax_m'], len(x['pts']), x['ms']))


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if what in ('towns', 'all'):
        bake_towns(sys.argv[2:] if what == 'towns' else [])
    if what in ('roads', 'all'):
        bake_roads()
    if what == 'all' or what == 'roads':
        subprocess.check_call([sys.executable, os.path.join(HERE, 'build.py')])
