#!/usr/bin/env python3
"""Cut one open-world region of sites off the scale model (openworld/PLAN-SITES.md section 2).

    python3 tools/scale-model/cut_site.py <region>          # openworld/<region>/source and data
    python3 tools/scale-model/cut_site.py <region> --dry    # print the polygons and the command, write nothing
    python3 tools/scale-model/cut_site.py --list            # the regions and sites in openworld/SITES.json

openworld/SITES.json names each region's sites by their ids in the model's settlement list (model/src/60-settlements.js,
the 5.1 canvas) and the model regions (by id) that join the cut. A site the model does not list yet is a SITES.json row
with "model": false and its own px, py (an outpost the owner placed before the model takes it). Each site becomes a square of its reach_km half-size round
its pixel (2 km a pixel), each named region its own polygon, and each corridor ({from, to, width_km: 10} in the region's
`corridors`) a strip from one site's pixel to another's, so the roads between sites have ground. A corridor with a `net`
(the id of an Ancient network route in openworld/network-proposal/net51.json, or a list of ids chained end to end, clipped
to the stretch between the two sites) or a `guide` (its own line in 5.1 px) follows that line instead: a quad a stretch, an
octagon a bend, and region.json's `cut.corridors` keeps the line, so the region's links follow it. The cut is their union:
  - the first polygon is written as the cut's named region into source/regions.json (with the model's regions, so the
    biome overlays are the model's own), with kind 'tool' so it is never read as a biome;
  - the rest are written to source/added-areas.json;
  - then extract_region.py reads the model's data (model/data, always the 5.1 canvas, never a saved page) with
    `model` for the settlements, so they keep their ids and current pixels.

A region row may pin its frame's origin (`origin_px`: [px, py]) so a cut that grows keeps its frame (the world's relief and
every coordinate are laid in it); otherwise the origin is the polygons' middle.

region.json then gains `sites`: [{id, name, type, culture, px, py, x, z, reach_km, page}], in the cut's frame (metres, x
east, z south, the origin at the box's centre pixel). Deterministic: the same SITES.json and model data give the same cut.
"""
import json, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SITES = os.path.join(ROOT, 'openworld', 'SITES.json')
sys.path.insert(0, HERE)
import extract_region as XR   # noqa: E402  (load_model_defaults: the model's own regions and settlements)

M_PER_PX = 2000.0


def load():
    return json.load(open(SITES, encoding='utf-8'))


def reach(row, region):
    """a site's reach in one region: its row's `reach_km_by` for that region (a site two regions list, each its own square),
    else its `reach_km`"""
    return (row.get('reach_km_by') or {}).get(region, row['reach_km'])


def square(px, py, reach_km):
    r = reach_km * 1000.0 / M_PER_PX
    return [[px - r, py - r], [px + r, py - r], [px + r, py + r], [px - r, py + r]]


def polygons(S, region):
    """the cut's polygons: [{name, map_px, kind: 'site'|'region', ref}] in SITES.json's order (sites, then regions)"""
    G = S['regions'][region]
    sett = {s['id']: s for s in XR.load_model_defaults('settlements')}
    # a site not on the model's list yet (SITES.json row with "model": false and its own px, py): planned before the model
    # takes it, so a region can hold an outpost the owner has placed but the scale model does not show
    for sid in G['sites']:
        row = S['sites'].get(sid, {})
        if sid not in sett and row.get('model') is False and row.get('px') is not None:
            sett[sid] = {'id': sid, 'name': row['name'], 'type': row.get('type', 'outpost'), 'px': row['px'], 'py': row['py']}
    regs = {r['id']: r for r in XR.load_model_defaults('regions')}
    out = []
    for sid in G['sites']:
        if sid not in sett:
            sys.exit('cut_site: site %s is not in the model\'s settlement list (model/src/60-settlements.js)' % sid)
        s, row = sett[sid], S['sites'][sid]
        out.append({'name': 'site %s (%s)' % (s['name'], sid), 'map_px': square(s['px'], s['py'], reach(row, region)),
                    'kind': 'site', 'ref': sid})
    for rid in G.get('polygons', []):
        if rid not in regs:
            sys.exit('cut_site: region %s is not in the model\'s region list (model/src/51-region-store.js)' % rid)
        out.append({'name': 'region %s (%s)' % (regs[rid]['name'], rid), 'map_px': [list(p) for p in regs[rid]['points']],
                    'kind': 'region', 'ref': rid})
    for c in G.get('corridors', []):
        a, b = c['from'], c['to']
        for sid in (a, b):
            if sid not in sett or sid not in G['sites']:
                sys.exit('cut_site: corridor end %s is not one of region %s\'s sites' % (sid, region))
        name = 'corridor %s - %s' % (sett[a]['name'], sett[b]['name'])
        if c.get('net') or c.get('guide'):
            # a corridor along a line (the Ancient network's route, `net`, or the region's own `guide`): a strip a piece a
            # stretch of the line and a disc a bend, each its own polygon (the cut is their union)
            pieces = corridor_line(line_px(c, sett[a], sett[b]), c.get('width_km', 10))
            for k, p in enumerate(pieces):
                out.append({'name': name + (' (%d/%d)' % (k + 1, len(pieces)) if k else ''), 'map_px': p, 'kind': 'corridor',
                            'ref': '%s-%s' % (a, b)})
            continue
        out.append({'name': name, 'map_px': corridor(sett[a], sett[b], c.get('width_km', 10)), 'kind': 'corridor', 'ref': '%s-%s' % (a, b)})
    return out, sett


def corridor(a, b, width_km):
    """a strip width_km wide from site a's pixel to site b's (so the roads between sites have the world's ground under them)"""
    dx, dy = b['px'] - a['px'], b['py'] - a['py']
    L = math.hypot(dx, dy) or 1.0
    h = width_km * 500.0 / M_PER_PX
    nx, ny = -dy / L * h, dx / L * h
    return [[a['px'] + nx, a['py'] + ny], [b['px'] + nx, b['py'] + ny], [b['px'] - nx, b['py'] - ny], [a['px'] - nx, a['py'] - ny]]


NET = os.path.join(ROOT, 'openworld', 'network-proposal', 'net51.json')


def line_px(c, a, b):
    """a corridor's line in 5.1 px from site a to site b: its `guide` (the region's own line), or its `net` (the id of a route
    of the Ancient network, openworld/network-proposal/net51.json, or a list of ids chained end to end) clipped to the
    stretch between the two sites; the sites' own pixels are its ends"""
    A, B = [float(a['px']), float(a['py'])], [float(b['px']), float(b['py'])]
    if c.get('guide'):
        P = [[float(p[0]), float(p[1])] for p in c['guide']]
    else:
        routes = {}
        for r in json.load(open(NET, encoding='utf-8'))['routes']:
            routes.setdefault(r['id'], []).append(r)
        P = []
        for rid in ([c['net']] if isinstance(c['net'], str) else c['net']):
            if len(routes.get(rid, [])) != 1:
                sys.exit('cut_site: net route %s names %d routes in net51.json' % (rid, len(routes.get(rid, []))))
            Q = [[float(p[0]), float(p[1])] for p in routes[rid][0]['px']]
            here = P[-1] if P else A   # each route in the chain runs on from where the last ended
            if math.hypot(Q[-1][0] - here[0], Q[-1][1] - here[1]) < math.hypot(Q[0][0] - here[0], Q[0][1] - here[1]):
                Q.reverse()
            P += Q
        near = lambda q: min(range(len(P)), key=lambda i: (math.hypot(P[i][0] - q[0], P[i][1] - q[1]), i))
        i, j = near(A), near(B)
        P = P[i:j + 1] if i <= j else P[j:i + 1][::-1]
    P = [A] + [p for p in P if math.hypot(p[0] - A[0], p[1] - A[1]) > 0.5 and math.hypot(p[0] - B[0], p[1] - B[1]) > 0.5] + [B]
    return simplify(P, 0.5)


def simplify(P, tol):
    """Douglas-Peucker in px (the ends kept)"""
    if len(P) < 3:
        return P
    a, b = P[0], P[-1]
    L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1e-9
    d = [abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L for p in P[1:-1]]
    k = max(range(len(d)), key=lambda i: d[i])
    if d[k] <= tol:
        return [a, b]
    return simplify(P[:k + 2], tol)[:-1] + simplify(P[k + 1:], tol)


def corridor_line(P, width_km):
    """a strip width_km wide along the line P (px): a quad a stretch, an octagon round each bend (the joints)"""
    h = width_km * 500.0 / M_PER_PX
    r = lambda v: round(v, 3)
    out = []
    for p, q in zip(P, P[1:]):
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / L * h, dx / L * h
        out.append([[r(p[0] + nx), r(p[1] + ny)], [r(q[0] + nx), r(q[1] + ny)], [r(q[0] - nx), r(q[1] - ny)], [r(p[0] - nx), r(p[1] - ny)]])
    for p in P[1:-1]:
        R = h / math.cos(math.pi / 8)   # the octagon's corners, so its sides touch the strip's edges
        out.append([[r(p[0] + R * math.cos(math.pi / 8 + k * math.pi / 4)), r(p[1] + R * math.sin(math.pi / 8 + k * math.pi / 4))] for k in range(8)])
    return out


def cut(region, dry=False):
    S = load()
    if region not in S['regions']:
        sys.exit('cut_site: no region %r in openworld/SITES.json (%s)' % (region, ', '.join(S['regions'])))
    G = S['regions'][region]
    P, sett = polygons(S, region)
    base = os.path.join(ROOT, 'openworld', region)
    src, data = os.path.join(base, 'source'), os.path.join(base, 'data')
    name = '%s cut' % region
    regs = XR.load_model_defaults('regions')
    named = {'id': 'cut-' + region, 'name': name, 'kind': 'tool', 'points': P[0]['map_px'],
             'notes': 'openworld/SITES.json %s: %s (tools/scale-model/cut_site.py)' % (region, P[0]['name'])}
    added = [{'name': p['name'], 'map_px': p['map_px']} for p in P[1:]]
    cmd = [sys.executable, os.path.join(HERE, 'extract_region.py'), os.path.join(HERE, 'model', 'data'),
           os.path.join(src, 'regions.json'), 'model', name, data, '--upsample', str(G.get('upsample', 'auto'))]
    if added:
        cmd += ['--add', os.path.join(src, 'added-areas.json')]
    if G.get('smooth'):   # the region opts into core/world's smoothing (core/world/README.md, "Smoothing")
        cmd += ['--smooth']
    if G.get('relief'):   # and into its relief (core/world/PLAN-RELIEF.md)
        cmd += ['--relief']
    if G.get('origin_px'):   # the region row pins its frame's origin: a region that grows keeps its frame (the world's relief is
        cmd += ['--origin', '%d,%d' % tuple(G['origin_px'])]   # laid in it), its sites and towns where they were

    for p in P:
        xs = [q[0] for q in p['map_px']]; ys = [q[1] for q in p['map_px']]
        print('  %-56s px %7.1f..%7.1f x %7.1f..%7.1f' % (p['name'][:56], min(xs), max(xs), min(ys), max(ys)))
    if dry:
        print(' '.join(cmd)); return
    os.makedirs(src, exist_ok=True)
    with open(os.path.join(src, 'regions.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(regs + [named], f, ensure_ascii=False, indent=0)
    with open(os.path.join(src, 'added-areas.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(added, f, ensure_ascii=False, indent=1)
    r = subprocess.call(cmd)
    if r:
        sys.exit('cut_site: extract_region.py failed (%d)' % r)
    rj = os.path.join(data, 'region.json')
    M = json.load(open(rj, encoding='utf-8'))
    cx, cy = M['frame']['origin_px']
    M['sites'] = []
    for sid in G['sites']:
        s, row = sett[sid], S['sites'][sid]
        M['sites'].append({'id': sid, 'name': s['name'], 'type': s['type'], 'culture': row.get('culture'),
                           'px': s['px'], 'py': s['py'], 'x': (s['px'] - cx) * M_PER_PX, 'z': (s['py'] - cy) * M_PER_PX,
                           'reach_km': reach(row, region), 'page': row.get('page')})
    M['cut'] = {'by': 'tools/scale-model/cut_site.py', 'sites_json': 'openworld/SITES.json', 'region': region,
                'map': S['map'], 'polygons': [{'name': p['name'], 'kind': p['kind'], 'ref': p['ref']} for p in P]}
    # a corridor along a line keeps it (5.1 px), so the region's links follow the line their ground was cut along
    # (a SITE_SPEC link's `guide`: openworld/<region>/src/48-world-site.js)
    lines = [{'from': c['from'], 'to': c['to'], 'net': c.get('net'), 'px': line_px(c, sett[c['from']], sett[c['to']])}
             for c in G.get('corridors', []) if c.get('net') or c.get('guide')]
    if lines:
        M['cut']['corridors'] = [dict(L, px=[[round(p[0], 3), round(p[1], 3)] for p in L['px']]) for L in lines]
    with open(rj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    print('cut %s: %d sites, origin px %s, box px %s' % (region, len(M['sites']), M['frame']['origin_px'], M['frame']['box_px']))
    if G.get('relief'):   # its small streams, traced on the land the page draws (core/world/bake_streams.py; PLAN-RELIEF.md P3)
        r = subprocess.call([sys.executable, os.path.join(ROOT, 'core', 'world', 'bake_streams.py'), region])
        if r:
            sys.exit('cut_site: core/world/bake_streams.py failed (%d)' % r)


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    if a[0] == '--list':
        S = load()
        for k, G in sorted(S['regions'].items(), key=lambda kv: kv[1].get('order', 99)):
            print('%-24s %s: %s' % (k, G['name'], ', '.join('%s (%s)' % (S['sites'][s]['name'], s) for s in G['sites'])))
        return
    cut(a[0], dry='--dry' in a)


if __name__ == '__main__':
    main()
