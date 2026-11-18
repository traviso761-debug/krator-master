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
import base64, json, math, os, struct, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
REGION_DIR = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(REGION_DIR, '..', '..'))
PAGE = 'openworld/oidong-highrift/dist/oidong-highrift.html'
OUT = os.path.join(ROOT, 'godot', 'data', 'world-oidong-highrift')
ROUTE = ('sq80bzd7ep', 'sfgtxw10kr')   # Longsong to Strongbow, the Sultanate's road down the valley
CHUNK, STEP, MARGIN = 16000, 64, 2000   # metres: a streamed cell, its ground's grid, the reach of the road into a cell
MARGIN_SITE = 8000                      # metres: surrounding chunk reach around off-route High Rift sites
PLACE, PLACE_STEP = 1600, 8             # metres: default place square round its pin, its ground's grid
# Custom lattice-snapped boxes (exact multiples of STEP = 64):
# - sfgtxw10kr (Strongbow): covers 100% of OHR_CUT (4,480 x 3,648 m) so 64 m chunk cells never slice Strongbow's cliff or spire
# - sq80bzd7ep (Longsong): covers Longsong pin + Shar + Nub + Dzo-ling + the Biruk al-Ghaym river bridge (2,432 x 2,432 m)
SITE_BOXES = {
    'sfgtxw10kr': [-612672, -77824, -608192, -74176],
    'sq80bzd7ep': [-155456, -26752, -153024, -24320],
}
# Export all 5 sites at full architectural detail (Xanadu & Order monastery kits + High Rift / Oidong floor and flora)
FULL_PLACES = ('sq80bzd7ep', 'sfgtxw10kr', 'ssinggjar01', 'smirrorgrange01', 'scaldronhouse01')
MASS_CAM = 4600                               # metres: the camera's distance from a massing place's centre (past 88s FULL_V)
# Strongbow's arcology (the owner, 2026-11-16: "Yes, far detail"): kits/ancients' strongbow-today page, built on
# settlements/strongbow's own branch, exported from that branch's worktree (KRATOR_STRONGBOW, default the sibling worktree)
# as what the page draws from 3.5 km (tools/strongbow-export.js: core/lod's drawn copies), into its own case. Its frame
# faces +z, the site faces west: the place's `arcology` seats the page's anchor (the lip at the bay's centre) on the pin,
# at the place's ground there, turned by RY about +Y (the page's +z to the region's -x)
ARCOLOGY = {'site': 'sfgtxw10kr', 'page': 'kits/ancients/dist/strongbow-today.html', 'case': 'places/sfgtxw10kr-arcology',
            'ry': -math.pi / 2, 'box': [-3000, -3000, 3000, 3000],
            'root': os.environ.get('KRATOR_STRONGBOW') or os.path.normpath(os.path.join(ROOT, '..', 'keen-swanson-68a311'))}


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


def cells_with_sites(route_cells, P):
    """route_cells plus surrounding 16 km chunks around off-route sites so every site has surrounding terrain"""
    seen = set(route_cells)
    order = list(route_cells)
    for S in P['sites']:
        sx, sz = S['x'], S['z']
        for dx in (-MARGIN_SITE, 0, MARGIN_SITE):
            for dz in (-MARGIN_SITE, 0, MARGIN_SITE):
                c = (math.floor((sx + dx) / CHUNK), math.floor((sz + dz) / CHUNK))
                if c not in seen:
                    seen.add(c)
                    order.append(c)
    return order


def cid(c):
    return 'c%+04d%+04d' % c


def parse_micro(argv):
    for i, a in enumerate(argv):
        if a.startswith('--micro='):
            return int(a.split('=', 1)[1])
        if a == '--micro' and i + 1 < len(argv):
            return int(argv[i + 1])
    return None


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
        sys.exit('godot_case: the export of %s failed\n%s\n%s' % (out, r.stdout[-2000:], r.stderr[-2000:]))
    for l in r.stdout.splitlines():   # what --before returned (harness.py prints it, cut at 300 characters)
        if l.startswith('before: '):
            try:
                return json.loads(l[8:])
            except ValueError:
                return None
    return None


def grid_h(case, x, z):
    """the place's ground (its terrain grid, bilinear) at (x, z)"""
    g = json.load(open(os.path.join(OUT, case, 'world.json'), encoding='utf-8'))['terrain']['grid']
    H = struct.unpack('<%df' % g['heights']['n'], base64.b64decode(g['heights']['b64']))
    fi, fj = (x - g['x0']) / g['step'], (z - g['z0']) / g['step']
    i, j = min(int(fi), g['nx'] - 2), min(int(fj), g['nz'] - 2)
    u, v = fi - i, fj - j
    h = lambda a, b: H[b * g['nx'] + a]
    return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v


def git(root, *a):
    r = subprocess.run(['git', '-C', root] + list(a), capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def arcology(pl):
    """Strongbow's place gains `arcology`: its case and where it stands (after the places and the arcology's case exist)"""
    A = ARCOLOGY
    w = os.path.join(OUT, A['case'], 'world.json')
    if not os.path.isfile(w):
        return
    p = next(q for q in pl if q['id'] == A['site'])
    x, z = p['pin']
    m = json.load(open(os.path.join(OUT, A['case'], 'meta.json'), encoding='utf-8'))
    # the anchor on the lip's level: the region's cut (src/48-world-site.js OHR_CUT) gives it; without it, the ground at the pin
    cp = os.path.join(OUT, p['case'], 'cut.json')
    cut = json.load(open(cp, encoding='utf-8')) if os.path.isfile(cp) else None
    if cut:   # the page's lip stands in front of the pin (OHR_CUT.spec.ahead), on the lip's level
        x, lip, z = cut['at']
    else:
        lip = grid_h(p['case'], x, z)
    p['arcology'] = {'case': A['case'], 'page': A['page'], 'branch': m.get('branch'), 'commit': m.get('commit'),
                     'at': [x, round(lip, 3), z], 'ry': A['ry'], 'cut': cut,
                     'note': "the case's meshes stand about the page's anchor (its world.json origin: the lip at the bay's centre); "
                             'a reader seats that anchor at `at` and turns the case by `ry` about +Y (the page faces +z, the site west)'}


def places(P):
    out = []
    for S in P['sites']:
        half = PLACE / 2
        # out to the chunks' ground lattice (STEP), so a chunk's cells are wholly inside a place's square or wholly out, and
        # the place's ground (PLACE_STEP, a divisor of STEP) meets the chunk's on the lattice's lines (world_stream.gd stitches
        # the place's edge to the chunk's straight cell edges)
        sn = lambda v, up: (math.ceil(v / STEP) if up else math.floor(v / STEP)) * STEP
        box = list(SITE_BOXES[S['id']]) if S['id'] in SITE_BOXES else [sn(S['x'] - half, False), sn(S['z'] - half, False), sn(S['x'] + half, True), sn(S['z'] + half, True)]
        hpois = []
        for h in S.get('hamlets') or []:
            st = h.get('site') or {}
            if 'x' in st and 'z' in st:
                hx, hz = float(st['x']), float(st['z'])
                if box[0] <= hx <= box[2] and box[1] <= hz <= box[3]:
                    hpois.append({'id': h['id'], 'name': h.get('name') or h['id'], 'focus': h.get('focus') or 'village',
                                  'x': round(hx, 1), 'z': round(hz, 1)})
        out.append({'id': S['id'], 'name': S['name'], 'type': S.get('type'), 'pin': [S['x'], S['z']],
                    'detail': 'full' if S['id'] in FULL_PLACES else 'massing',
                    'box': box, 'case': 'places/' + S['id'], 'hamlets': [h['id'] for h in S.get('hamlets') or []],
                    'hamlet_pois': hpois})
    return out


def roads(P):
    R = []
    for L in P['links']:
        R.append({'id': L['id'], 'kind': 'link', 'from': L['from'], 'to': L['to'], 'km': round(L['length_m'] / 1000, 2),
                  'pts': [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in L['pts']],
                  'spans': L.get('spans') or []})
    for S in P['sites']:
        for r in S.get('roads') or []:
            pts = [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in r['pts']]
            if r['id'] == 'sq80bzd7ep/road/4' and len(pts) >= 2:
                # Extend across the north half of Biruk al-Ghaym onto the dry bank terrace to match healed bridge/0
                pts.extend([[-154072.0, -25856.0, 2061.6], [-154084.4, -25826.6, 2063.8]])
            R.append({'id': r['id'], 'kind': 'village', 'from': r.get('from'), 'to': S['id'],
                      'pts': pts, 'spans': r.get('spans') or []})
    return R


def place_before_js(p):
    b = p['box']
    cx, cz = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    if p['id'] not in FULL_PLACES:
        return ('(async()=>{window.WORLD_EXPORT.step=%d;CAM.setView(%.1f,%.1f,700,.78,-.3);await _api.settle(240000);return OHR_CUT.info();})()'
                % (PLACE_STEP, cx, cz + MASS_CAM))
    if p['id'] == 'sq80bzd7ep':
        # Settle across Longsong's bridge/pin and all 3 core Xanadu villages (Shar, Nub, Dzo-ling)
        spots = [[-154060.0, -25900.0], [-153602.0, -25123.0], [-155041.0, -25909.0], [-154130.0, -24739.0]]
        anc = json.dumps(spots, separators=(',', ':'))
        steps = ''.join('CAM.setView(%.1f,%.1f,210,.78,-.35);await _api.settle(90000);' % (sx, sz + 240.0) for sx, sz in spots)
        return ('(async()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.floraAnchors=%s;%sreturn OHR_CUT.info();})()'
                % (PLACE_STEP, anc, steps))
    if p['id'] == 'sfgtxw10kr':
        spots = [[-611200.0, -76000.0], [-609500.0, -76000.0]]
        anc = json.dumps(spots, separators=(',', ':'))
        steps = ''.join('CAM.setView(%.1f,%.1f,420,.78,-.3);await _api.settle(120000);' % (sx, sz + 600.0) for sx, sz in spots)
        return ('(async()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.floraAnchors=%s;%sreturn OHR_CUT.info();})()'
                % (PLACE_STEP, anc, steps))
    # High Rift monasteries: settle within FLOOR's 380 m reach so hydrothermal & tussock groundcover builds around the house
    return ('(async()=>{window.WORLD_EXPORT.step=%d;CAM.setView(%.1f,%.1f,190,.78,-.35);await _api.settle(180000);return OHR_CUT.info();})()'
            % (PLACE_STEP, cx, cz + 240.0))


def main():
    global OUT
    argv = sys.argv[1:]
    only = argv[argv.index('--only') + 1] if '--only' in argv else None
    for i, a in enumerate(argv):
        if a == '--index-only':
            only = 'index'
        elif a.startswith('--only='):
            only = a.split('=', 1)[1]
        elif a.startswith('--out='):
            OUT = os.path.abspath(a.split('=', 1)[1])
        elif a == '--out' and i + 1 < len(argv):
            OUT = os.path.abspath(argv[i + 1])
    micro = parse_micro(argv)
    if only != 'index' and os.environ.get('KRATOR_GL') != 'gpu':   # under SwiftShader the page's start fails on a shader (CAM never made)
        sys.exit('godot_case: set KRATOR_GL=gpu (the page needs the GPU; SwiftShader fails its start)')
    P = plan()
    L = link(P, *ROUTE)
    pts = L['pts'] if L['from'] == ROUTE[0] else list(reversed(L['pts']))
    route_cells = cells_along(pts)
    cells = cells_with_sites(route_cells, P)
    os.makedirs(OUT, exist_ok=True)
    pl = places(P)
    if only in (None, 'places'):
        print('places (%d): lattice-snapped boxes, the camera settled at each site and village' % len(pl), flush=True)
        for p in pl:
            b = p['box']
            p['detail'] = 'full' if p['id'] in FULL_PLACES else 'massing'
            before = place_before_js(p)
            d = os.path.join(OUT, 'places', p['id'])
            shutil.rmtree(d, ignore_errors=True)
            cut = export(d, b, before, micro=micro)
            if p['id'] == ARCOLOGY['site'] and cut:   # the cut's lip level, where the arcology's anchor stands (src/48-world-site.js)
                with open(os.path.join(d, 'cut.json'), 'w', encoding='utf-8', newline='\n') as f:
                    json.dump(cut, f, separators=(',', ':'))
    if only in (None, 'arcology'):
        A = ARCOLOGY
        page = os.path.join(A['root'], A['page'])
        if not os.path.isfile(page):
            sys.exit("godot_case: no Strongbow page at %s (KRATOR_STRONGBOW: its branch's worktree, built)" % page)
        d = os.path.join(OUT, A['case'])
        shutil.rmtree(d, ignore_errors=True)
        cmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', page, '--root', A['root'], '--out', d,
               '--box=' + ','.join('%g' % v for v in A['box']), '--sections', 'items,buckets,materials,textures',
               '--inject', os.path.join(ROOT, 'core', 'export', '10-core-export-scene.js'), '--inject', os.path.join(HERE, 'strongbow-export.js'),
               '--before', '(async()=>{setView(0,1400,3500,0,450,0,false);await new Promise(r=>setTimeout(r,4000));return _sbExport;})()']
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
        print('  arcology: ' + ' | '.join(l[:160] for l in r.stdout.splitlines() if l.startswith(('exported', 'FAILED', 'wrote', 'OK'))), flush=True)
        if r.returncode:
            sys.exit("godot_case: the arcology's export failed\n%s\n%s" % (r.stdout[-2000:], r.stderr[-2000:]))
        mp = os.path.join(d, 'meta.json')
        m = json.load(open(mp, encoding='utf-8'))
        m['branch'], m['commit'] = git(A['root'], 'rev-parse', '--abbrev-ref', 'HEAD'), git(A['root'], 'rev-parse', 'HEAD')
        m['page'] = A['page']
        with open(mp, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(m, f, separators=(',', ':'))
    if only in (None, 'chunks'):
        print('chunks (%d: %d on road %s + %d site surroundings): %d m cells every %d m' % (len(cells), len(route_cells), L['id'], len(cells) - len(route_cells), CHUNK, STEP), flush=True)
        for c in cells:
            box = [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK]
            d = os.path.join(OUT, 'chunks', cid(c))
            shutil.rmtree(d, ignore_errors=True)
            export(d, box, '(()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.water=false;return true;})()' % STEP, 'terrain,registry', micro=micro)
    arcology(pl)
    idx = {'format': 'krator-world-stream', 'version': 1, 'region': P['region'], 'plan': P['hash'],
           'source': PAGE, 'by': 'openworld/oidong-highrift/tools/godot_case.py',
           'convention': 'metres, +Y up, x east, z south, the region\'s frame (openworld/oidong-highrift/data/region.json: '
                         'x = (px - origin) * 2000); a chunk\'s and a place\'s case is a krator-world (core/export) in the same frame',
           'chunk': {'size': CHUNK, 'step': STEP, 'margin': MARGIN,
                     'route_chunks': [cid(c) for c in route_cells],
                     'list': [{'id': cid(c), 'cell': list(c), 'box': [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK],
                               'case': 'chunks/' + cid(c)} for c in cells]},
           'places': pl, 'roads': roads(P),
           'route': {'link': L['id'], 'from': ROUTE[0], 'to': ROUTE[1], 'km': round(L['length_m'] / 1000, 2)},
           'sim': {'sim': 'sim.json', 'golden': 'golden.json', 'by': 'openworld/oidong-highrift/tools/export-sim.js'}}
    if micro is not None:
        idx['micro'] = micro
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(idx, f, separators=(',', ':'), ensure_ascii=False)
    print('wrote %s: %d chunks (%d route), %d places, %d roads (plan %s%s)' % (os.path.relpath(OUT, ROOT).replace(os.sep, '/'),
          len(cells), len(route_cells), len(pl), len(idx['roads']), P['hash'], ', micro=%d' % micro if micro is not None else ''))


if __name__ == '__main__':
    main()
