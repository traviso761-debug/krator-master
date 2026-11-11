#!/usr/bin/env python3
"""Cut one open-world region of sites off the scale model (openworld/PLAN-SITES.md section 2).

    python3 tools/scale-model/cut_site.py <region>          # openworld/<region>/source and data
    python3 tools/scale-model/cut_site.py <region> --dry    # print the polygons and the command, write nothing
    python3 tools/scale-model/cut_site.py --list            # the regions and sites in openworld/SITES.json

openworld/SITES.json names each region's sites by their ids in the model's settlement list (model/src/60-settlements.js,
the 5.1 canvas) and the model regions (by id) that join the cut. Each site becomes a square of its reach_km half-size round
its pixel (2 km a pixel), each named region its own polygon, and each corridor ({from, to, width_km: 10} in the region's\n`corridors`) a strip from one site's pixel to another's, so the roads between sites have ground. The cut is their union:
  - the first polygon is written as the cut's named region into source/regions.json (with the model's regions, so the
    biome overlays are the model's own), with kind 'tool' so it is never read as a biome;
  - the rest are written to source/added-areas.json;
  - then extract_region.py reads the model's data (model/data, always the 5.1 canvas, never a saved page) with
    `model` for the settlements, so they keep their ids and current pixels.

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


def square(px, py, reach_km):
    r = reach_km * 1000.0 / M_PER_PX
    return [[px - r, py - r], [px + r, py - r], [px + r, py + r], [px - r, py + r]]


def polygons(S, region):
    """the cut's polygons: [{name, map_px, kind: 'site'|'region', ref}] in SITES.json's order (sites, then regions)"""
    G = S['regions'][region]
    sett = {s['id']: s for s in XR.load_model_defaults('settlements')}
    regs = {r['id']: r for r in XR.load_model_defaults('regions')}
    out = []
    for sid in G['sites']:
        if sid not in sett:
            sys.exit('cut_site: site %s is not in the model\'s settlement list (model/src/60-settlements.js)' % sid)
        s, row = sett[sid], S['sites'][sid]
        out.append({'name': 'site %s (%s)' % (s['name'], sid), 'map_px': square(s['px'], s['py'], row['reach_km']),
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
        out.append({'name': 'corridor %s - %s' % (sett[a]['name'], sett[b]['name']),
                    'map_px': corridor(sett[a], sett[b], c.get('width_km', 10)), 'kind': 'corridor', 'ref': '%s-%s' % (a, b)})
    return out, sett


def corridor(a, b, width_km):
    """a strip width_km wide from site a's pixel to site b's (so the roads between sites have the world's ground under them)"""
    dx, dy = b['px'] - a['px'], b['py'] - a['py']
    L = math.hypot(dx, dy) or 1.0
    h = width_km * 500.0 / M_PER_PX
    nx, ny = -dy / L * h, dx / L * h
    return [[a['px'] + nx, a['py'] + ny], [b['px'] + nx, b['py'] + ny], [b['px'] - nx, b['py'] - ny], [a['px'] - nx, a['py'] - ny]]


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
                           'reach_km': row['reach_km'], 'page': row.get('page')})
    M['cut'] = {'by': 'tools/scale-model/cut_site.py', 'sites_json': 'openworld/SITES.json', 'region': region,
                'map': S['map'], 'polygons': [{'name': p['name'], 'kind': p['kind'], 'ref': p['ref']} for p in P]}
    with open(rj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    print('cut %s: %d sites, origin px %s, box px %s' % (region, len(M['sites']), M['frame']['origin_px'], M['frame']['box_px']))


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
