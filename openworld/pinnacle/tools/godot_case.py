#!/usr/bin/env python3
"""openworld/pinnacle as a Godot krator-world-stream case (Stack B dual-region trial alongside oidong-highrift):

    python3 tools/harness.py lock -- python3 openworld/pinnacle/tools/godot_case.py [--only chunks|places|index] [--micro=1|2|0]

Writes godot/data/world-pinnacle/ from the built page (dist/pinnacle.html, with core/export and core/world 94 in it) and
the baked plan (plan/sites.json):
  chunks/<id>/   16 km ground cells (64 m step + PBR terrain surface maps + cropped registry) spanning the Pinnacle Rock
                 ecotone between the savage hyperjungle (SW) and the abyssal savannah (NE), plus a SW hyperjungle transect
                 long enough to exercise KratorWorldStream's 4 km floating-origin rebase and chunk loading/unloading
  places/<id>/   non-overlapping lattice-snapped 1:1 places (8 m step):
                   - staiytii0y: 3,840 m square [-1920, -1920, 1920, 1920] covering Pinnacle Rock's mesa, all 9 Beast Rider
                     camps (CAT tents, corrals, thorn hedges, pastures), all 9 camp-to-rock tracks, and the hyperjungle/savannah
                     edge, settled across four quadrant views so hero/sapling/understory flora and camp pieces populate in full
                   - hj-canopy: 1,600 m square [-3840, 1280, -2240, 2880] deep inside the savage hyperjungle SW of the rock
                     for testing dense multi-tier jungle canopy, saplings, and understory floor in Godot Forward+
  index.json     krator-world-stream v1 index with chunks, places, the 9 camp roads, and a primary transect route"""
import json, math, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REGION_DIR = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(REGION_DIR, '..', '..'))
PAGE = 'openworld/pinnacle/dist/pinnacle.html'
OUT = os.path.join(ROOT, 'godot', 'data', 'world-pinnacle')
CHUNK, STEP, MARGIN = 16000, 64, 2000
RING_HALF = 1920          # 30 * 64 m -> 3,840 m square covering Pinnacle Rock + all 9 Beast Rider camps & tracks
CANOPY_BOX = [-3840, 1280, -2240, 2880]   # disjoint 1,600 m square (25 * 64 m) deep in the SW savage hyperjungle
PLACE_STEP = 8


def parse_micro(argv):
    for i, a in enumerate(argv):
        if a.startswith('--micro='):
            return int(a.split('=', 1)[1])
        if a == '--micro' and i + 1 < len(argv):
            return int(argv[i + 1])
    return None


def parse_out(argv):
    for i, a in enumerate(argv):
        if a.startswith('--out='):
            return os.path.abspath(a.split('=', 1)[1])
        if a == '--out' and i + 1 < len(argv):
            return os.path.abspath(argv[i + 1])
    return OUT


def plan():
    with open(os.path.join(REGION_DIR, 'plan', 'sites.json'), encoding='utf-8') as f:
        return json.load(f)


def cid(c):
    return 'c%+04d%+04d' % c


def cells_for_pinnacle():
    """6 cells of 16 km covering the central 2x2 around Pinnacle Rock (0, 0) plus the SW hyperjungle transect"""
    return [(-1, 0), (0, 0), (-1, -1), (0, -1), (-2, 0), (-2, 1)]


def snap_box(x0, z0, x1, z1):
    sn = lambda v, up: (math.ceil(v / STEP) if up else math.floor(v / STEP)) * STEP
    return [sn(x0, False), sn(z0, False), sn(x1, True), sn(z1, True)]


def places(P):
    S = P['sites'][0]
    box = snap_box(S['x'] - RING_HALF, S['z'] - RING_HALF, S['x'] + RING_HALF, S['z'] + RING_HALF)
    camps = [c['id'] for c in S.get('camps') or []]
    return [
        {'id': S['id'], 'name': S['name'], 'type': S.get('type'), 'pin': [S['x'], S['z']],
         'detail': 'full', 'box': box, 'case': 'places/' + S['id'], 'camps': camps,
         'settle_views': [[-1050.0, 750.0], [1050.0, 850.0], [-750.0, -450.0], [880.0, -320.0]]},
        {'id': 'hj-canopy', 'name': 'Savage Hyperjungle Stand', 'type': 'biome',
         'pin': [(CANOPY_BOX[0] + CANOPY_BOX[2]) // 2, (CANOPY_BOX[1] + CANOPY_BOX[3]) // 2],
         'detail': 'full', 'box': list(CANOPY_BOX), 'case': 'places/hj-canopy', 'camps': [],
         'settle_views': [[(CANOPY_BOX[0] + CANOPY_BOX[2]) / 2.0, (CANOPY_BOX[1] + CANOPY_BOX[3]) / 2.0 + 420.0]]},
    ]


def roads(P):
    R = []
    for S in P['sites']:
        for r in S.get('roads') or []:
            km = round(r.get('length_m', 0) / 1000.0, 2)
            R.append({'id': r['id'], 'kind': 'camp', 'from': r.get('from'), 'to': S['id'], 'km': km,
                      'pts': [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in r['pts']],
                      'spans': r.get('spans') or []})
    # Also add a 22 km SW-to-NE hyperjungle -> Pinnacle -> savannah transect link so road_perf / streaming walks cross multiple chunks
    transect_pts = [[-18000.0, 12000.0, 0.0], [-12000.0, 8000.0, 0.0], [-6000.0, 4000.0, 0.0],
                    [-3040.0, 2080.0, 0.0], [-958.5, 155.9, -1349.4], [118.8, -681.2, -1317.0],
                    [1131.5, 460.3, -1295.2], [5000.0, -3500.0, 0.0]]
    R.append({'id': 'pinnacle/transect', 'kind': 'link', 'from': 'hj-canopy', 'to': P['sites'][0]['id'],
              'km': 28.4, 'pts': transect_pts, 'spans': []})
    return R


def export(out, box, before, sections=None, micro=None):
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', PAGE, '--out', out,
           '--box=' + ','.join('%g' % v for v in box), '--before', before]
    if micro is not None:
        cmd += ['--query', '?micro=%d' % micro]
    if sections:
        cmd += ['--sections', sections]
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    tail = [l for l in r.stdout.splitlines() if l.startswith(('exported', 'sections', 'FAILED', 'wrote'))]
    print('  ' + os.path.relpath(out, ROOT).replace(os.sep, '/') + ': ' + ' | '.join(t[:160] for t in tail), flush=True)
    if r.returncode:
        sys.exit('godot_case (pinnacle): export of %s failed\n%s\n%s' % (out, r.stdout[-2000:], r.stderr[-2000:]))


def build_index(P, cells, pl, micro=None):
    rds = roads(P)
    idx = {'format': 'krator-world-stream', 'version': 1, 'region': P['region'], 'plan': P['hash'],
           'source': PAGE, 'by': 'openworld/pinnacle/tools/godot_case.py',
           'convention': "metres, +Y up, x east, z south, the region's frame (openworld/pinnacle/data/region.json: "
                         "Pinnacle Rock at 0, 0); each chunk and place case is a krator-world (core/export) in the same frame",
           'chunk': {'size': CHUNK, 'step': STEP, 'margin': MARGIN,
                     'list': [{'id': cid(c), 'cell': list(c),
                               'box': [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK],
                               'case': 'chunks/' + cid(c)} for c in cells]},
           'places': [{k: v for k, v in p.items() if k != 'settle_views'} for p in pl],
           'roads': rds,
           'route': {'link': 'staiytii0y/road/0', 'from': 'staiytii0y/camp/threehorn', 'to': P['sites'][0]['id'],
                     'km': round(P['sites'][0]['roads'][0]['length_m'] / 1000.0, 2)}}
    if micro is not None:
        idx['micro'] = micro
    return idx


def main():
    argv = sys.argv[1:]
    only = argv[argv.index('--only') + 1] if '--only' in argv else None
    if '--index-only' in argv:
        only = 'index'
    micro = parse_micro(argv)
    out_dir = parse_out(argv)
    if only != 'index' and os.environ.get('KRATOR_GL') != 'gpu':
        sys.exit('godot_case (pinnacle): set KRATOR_GL=gpu (the page needs the GPU; SwiftShader fails its start)')
    P = plan()
    cells = cells_for_pinnacle()
    pl = places(P)
    os.makedirs(out_dir, exist_ok=True)
    if only in (None, 'places'):
        print('places (%d): lattice-aligned 1:1 cases (step %d m), hyperjungle + camps settled' % (len(pl), PLACE_STEP), flush=True)
        for p in pl:
            steps_js = ';'.join('CAM.setView(%.1f,%.1f,320,.72,-.28);await _api.settle(180000)' % (vx, vz)
                                for vx, vz in p['settle_views'])
            before = '(async()=>{window.WORLD_EXPORT.step=%d;%s;return true;})()' % (PLACE_STEP, steps_js)
            d = os.path.join(out_dir, p['case'])
            shutil.rmtree(d, ignore_errors=True)
            export(d, p['box'], before, micro=micro)
    if only in (None, 'chunks'):
        print('chunks (%d): %d m cells round Pinnacle Rock & SW hyperjungle, ground every %d m + PBR surface + registry'
              % (len(cells), CHUNK, STEP), flush=True)
        for c in cells:
            box = [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK]
            d = os.path.join(out_dir, 'chunks', cid(c))
            shutil.rmtree(d, ignore_errors=True)
            export(d, box, '(()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.water=false;return true;})()' % STEP,
                   'terrain,registry', micro=micro)
    idx = build_index(P, cells, pl, micro=micro)
    with open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(idx, f, separators=(',', ':'), ensure_ascii=False)
    rel = os.path.relpath(out_dir, ROOT).replace(os.sep, '/')
    print('wrote %s: %d chunks, %d places, %d roads (plan %s%s)' % (
        rel, len(cells), len(pl), len(idx['roads']), P['hash'], ', micro=%d' % micro if micro is not None else ''))


if __name__ == '__main__':
    main()
