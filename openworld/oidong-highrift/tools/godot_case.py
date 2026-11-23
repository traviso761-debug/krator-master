#!/usr/bin/env python3
"""openworld/oidong-highrift as Godot's one-world case (GODOT-PLAN.md section 8, M7; the owner, 2026-11-16: "set up
oidong/high rift/strongbow as a godot test to fulfill the multi settlement godot plan step").

    python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py [--only chunks|places|index]

Writes godot/data/world-oidong-highrift/ from the built page (dist/oidong-highrift.html, with core/export and core/world
94 in it) and the baked plan (plan/sites.json):
  chunks/<id>/   the ground streamed: a CHUNK-metre cell of the region's grid on every cell the Sultanate's road from
                 Longsong to Strongbow passes within MARGIN of, each a krator-world box with the terrain section (WORLD.H
                 every STEP metres, WORLD.water, the page's probes) and the registry cropped to it (the sites' and the
                 bridges' records standing in it)
  places/<site>/ each site at 1:1: a PLACE-metre square round its pin, the page's camera set beside it and the page
                 settled first (the flora drawn round it), every section core/export fills (the villages' pieces as
                 buckets with the records they stand in, the bridges and the flora as items, the materials and maps,
                 the terrain every PLACE_STEP metres, the registry). Strongbow's has the ground and its record only: the
                 arcology is settlements/strongbow's, not drawn by the region
  index.json     krator-world-stream: the region, the plan's hash, the chunk grid and each chunk's box and case, each
                 place's site, pin, box and case, every road (the links and the villages' roads: their points, from the
                 plan) and the route the test walks (Longsong to Strongbow)
The sim's week is openworld/oidong-highrift/tools/export-sim.js (sim.json, golden.json in the same folder).
Deterministic: the same page and plan write the same files (the exports' own dates aside)."""
import json, math, os, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
REGION_DIR = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(REGION_DIR, '..', '..'))
PAGE = 'openworld/oidong-highrift/dist/oidong-highrift.html'
OUT = os.path.join(ROOT, 'godot', 'data', 'world-oidong-highrift')
ROUTE = ('sq80bzd7ep', 'sfgtxw10kr')   # Longsong to Strongbow, the Sultanate's road down the valley
CHUNK, STEP, MARGIN = 16000, 64, 2000   # metres: a streamed cell, its ground's grid, the reach of the road into a cell
PLACE, PLACE_STEP = 1600, 8             # metres: a place's square round its pin, its ground's grid
# a place's villages at full detail (the Xanadu kit's pieces, ~140k triangles a village: Longsong's, about 40 MB of glb) or
# as massing (a box a building, with its record), as the page draws them past FULL_V (88s: 4 km). The flora reaches
# 2.5 km (47-world-kits LOD.far), so a place drawn in full has its flora and a place in massing has none: the Order's
# houses in the High Rift grow none round their villages anyway, so they go in massing and the case stays small
FULL_PLACES = ('sq80bzd7ep', 'sfgtxw10kr')   # Longsong, Strongbow (no buildings in the region: its flora and ground)
MASS_CAM = 4600                               # metres: the camera's distance from a massing place's centre (past 88s FULL_V)


def plan():
    return json.load(open(os.path.join(REGION_DIR, 'plan', 'sites.json'), encoding='utf-8'))


def link(P, a, b):
    for L in P['links']:
        if (L['from'], L['to']) in ((a, b), (b, a)):
            return L
    sys.exit('godot_case: no link %s - %s in the plan' % (a, b))


def cells_along(pts):
    """the chunk cells (i, j) the road passes within MARGIN of, in the order it reaches them"""
    seen, order = set(), []
    for k in range(len(pts) - 1):
        (x0, z0), (x1, z1) = pts[k][:2], pts[k + 1][:2]
        n = max(1, int(math.hypot(x1 - x0, z1 - z0) // 250))
        for s in range(n + 1):
            x, z = x0 + (x1 - x0) * s / n, z0 + (z1 - z0) * s / n
            for dx in (-MARGIN, 0, MARGIN):
                for dz in (-MARGIN, 0, MARGIN):
                    c = (math.floor((x + dx) / CHUNK), math.floor((z + dz) / CHUNK))
                    if c not in seen:
                        seen.add(c)
                        order.append(c)
    return order


def cid(c):
    return 'c%+04d%+04d' % c


def export(out, box, before, sections=None):
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', PAGE, '--out', out,
           '--box=' + ','.join('%g' % v for v in box), '--before', before]
    if sections:
        cmd += ['--sections', sections]
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    tail = [l for l in r.stdout.splitlines() if l.startswith(('exported', 'sections', 'FAILED', 'wrote'))]
    print('  ' + os.path.relpath(out, ROOT).replace(os.sep, '/') + ': ' + ' | '.join(t[:160] for t in tail), flush=True)
    if r.returncode:
        sys.exit('godot_case: the export of %s failed\n%s\n%s' % (out, r.stdout[-2000:], r.stderr[-2000:]))


def places(P):
    out = []
    for S in P['sites']:
        half = PLACE / 2
        box = [S['x'] - half, S['z'] - half, S['x'] + half, S['z'] + half]
        out.append({'id': S['id'], 'name': S['name'], 'type': S.get('type'), 'pin': [S['x'], S['z']],
                    'detail': 'full' if S['id'] in FULL_PLACES else 'massing',
                    'box': box, 'case': 'places/' + S['id'], 'hamlets': [h['id'] for h in S.get('hamlets') or []]})
    return out


def roads(P):
    R = []
    for L in P['links']:
        R.append({'id': L['id'], 'kind': 'link', 'from': L['from'], 'to': L['to'], 'km': round(L['length_m'] / 1000, 2),
                  'pts': [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in L['pts']],
                  'spans': L.get('spans') or []})
    for S in P['sites']:
        for r in S.get('roads') or []:
            R.append({'id': r['id'], 'kind': 'village', 'from': r.get('from'), 'to': S['id'],
                      'pts': [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in r['pts']], 'spans': r.get('spans') or []})
    return R


def main():
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    P = plan()
    L = link(P, *ROUTE)
    pts = L['pts'] if L['from'] == ROUTE[0] else list(reversed(L['pts']))
    cells = cells_along(pts)
    os.makedirs(OUT, exist_ok=True)
    pl = places(P)
    if only in (None, 'places'):
        print('places (%d): a %d m square each, the camera beside it, the page settled' % (len(pl), PLACE), flush=True)
        for p in pl:
            b = p['box']
            cx, cz = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
            off = PLACE * 0.75 if p['id'] in FULL_PLACES else MASS_CAM
            p['detail'] = 'full' if p['id'] in FULL_PLACES else 'massing'
            before = ('(async()=>{window.WORLD_EXPORT.step=%d;CAM.setView(%.1f,%.1f,700,.78,-.3);return await _api.settle(240000);})()'
                      % (PLACE_STEP, cx, cz + off))
            d = os.path.join(OUT, 'places', p['id'])
            shutil.rmtree(d, ignore_errors=True)
            export(d, b, before)
    if only in (None, 'chunks'):
        print('chunks (%d): %d m cells on the road %s, the ground every %d m and the registry' % (len(cells), CHUNK, L['id'], STEP), flush=True)
        for c in cells:
            box = [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK]
            d = os.path.join(OUT, 'chunks', cid(c))
            shutil.rmtree(d, ignore_errors=True)
            export(d, box, '(()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.water=false;return true;})()' % STEP, 'terrain,registry')
    idx = {'format': 'krator-world-stream', 'version': 1, 'region': P['region'], 'plan': P['hash'],
           'source': PAGE, 'by': 'openworld/oidong-highrift/tools/godot_case.py',
           'convention': 'metres, +Y up, x east, z south, the region\'s frame (openworld/oidong-highrift/data/region.json: '
                         'x = (px - origin) * 2000); a chunk\'s and a place\'s case is a krator-world (core/export) in the same frame',
           'chunk': {'size': CHUNK, 'step': STEP, 'margin': MARGIN,
                     'list': [{'id': cid(c), 'cell': list(c), 'box': [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK],
                               'case': 'chunks/' + cid(c)} for c in cells]},
           'places': pl, 'roads': roads(P),
           'route': {'link': L['id'], 'from': ROUTE[0], 'to': ROUTE[1], 'km': round(L['length_m'] / 1000, 2)},
           'sim': {'sim': 'sim.json', 'golden': 'golden.json', 'by': 'openworld/oidong-highrift/tools/export-sim.js'}}
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(idx, f, separators=(',', ':'), ensure_ascii=False)
    print('wrote %s: %d chunks, %d places, %d roads (plan %s)' % (os.path.relpath(OUT, ROOT).replace(os.sep, '/'),
          len(cells), len(pl), len(idx['roads']), P['hash']))


if __name__ == '__main__':
    main()
