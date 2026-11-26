#!/usr/bin/env python3
"""Take a site proposed in an open-world page (core/world/93-world-propose.js) into openworld/SITES.json and the scale model.

    python3 tools/scale-model/propose_site.py <file.json>                 # list the proposals in an exported file
    python3 tools/scale-model/propose_site.py --edits                     # ... in the edit queue (edits/pending, tools/edits)
    python3 tools/scale-model/propose_site.py <file.json|--edits> --accept <proposal id> [--region <region>] [--write]

A proposal ('krator-site-proposal': name, type, culture, reach_km, notes, px, py on the 5.1 canvas, the page's assessment)
becomes, with --accept:
  - a site of openworld/SITES.json, state 'proposed', its id the model's (`s` + nine base-36 digits of the proposal id's
    sha1: the same proposal always gets the same id), with `proposal` (where it came from, its notes, the assessment's
    summary); with --region, one of that region's sites too (cut_site.py <region> then takes it up);
  - a settlement of the scale model (tools/scale-model/model/src/60-settlements.js): appended to its default list, and to
    a new SETT_ADDED version ('5.1p<n>') so a browser holding a saved list receives it once.
Without --write it prints what it would change and writes nothing. The model's artifact and its shared database take the
new settlement when the model is next published (the owner's call).
"""
import argparse, glob, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SITES = os.path.join(ROOT, 'openworld', 'SITES.json')
SETTS = os.path.join(HERE, 'model', 'src', '60-settlements.js')
PENDING = os.path.join(ROOT, 'edits', 'pending')
MODEL_TYPES = ('city', 'outpost', 'village', 'cavern', 'arcology', 'ruin', 'ruined arcology')


def proposals(src):
    """[(proposal, where)] from an exported file ('krator-site-proposals'), one proposal, or the edit queue"""
    out = []
    if src == '--edits':
        for f in sorted(glob.glob(os.path.join(PENDING, '*.json'))):
            r = json.load(open(f, encoding='utf-8'))
            if isinstance(r.get('proposal'), dict):
                out.append((r['proposal'], os.path.relpath(f, ROOT).replace(os.sep, '/')))
        return out
    d = json.load(open(src, encoding='utf-8'))
    for p in d.get('proposals', [d] if d.get('format') == 'krator-site-proposal' else []):
        out.append((p, os.path.basename(src)))
    return out


def model_id(pid):
    h = int(hashlib.sha1(pid.encode('utf-8')).hexdigest(), 16)
    s = ''
    for _ in range(9):
        h, r = divmod(h, 36)
        s += '0123456789abcdefghijklmnopqrstuvwxyz'[r]
    return 's' + s


def summary(p):
    A = p.get('assessment') or {}
    bits = []
    if A.get('biome') or A.get('clim'):
        bits.append('%s, %s, %s mm, %s C, %s m' % (A.get('biome'), A.get('clim'), A.get('rain'), A.get('temp'), A.get('h')))
    if A.get('farm'):
        bits.append('farmland mean %d%%' % round(A['farm'].get('mean', 0) * 100))
    if A.get('top'):
        bits.append('best within reach: ' + ', '.join('%s %s' % (q['label'], q['max']) for q in A['top'][:4]))
    return '; '.join(bits)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('src', nargs='?', help='an exported proposals file')
    ap.add_argument('--edits', action='store_true', help='read the edit queue (edits/pending) instead of a file')
    ap.add_argument('--accept')
    ap.add_argument('--region')
    ap.add_argument('--write', action='store_true')
    a = ap.parse_args()
    if not a.edits and not a.src:
        ap.error('give an exported proposals file, or --edits')
    a.src = '--edits' if a.edits else a.src
    P = proposals(a.src)
    if not a.accept:
        if not P:
            print('no proposals in ' + a.src)
        for p, where in P:
            print('%-22s %-24s %-14s px %7.1f, %7.1f  reach %s km  model id %s  (%s)' % (p['id'], p['name'][:24], p['type'], p['px'], p['py'],
                  p.get('reach_km'), model_id(p['id']), where))
            if p.get('notes'):
                print('    ' + p['notes'][:160])
            s = summary(p)
            if s:
                print('    ' + s[:200])
        return
    hit = [q for q in P if q[0]['id'] == a.accept]
    if not hit:
        sys.exit('propose_site: no proposal %s in %s' % (a.accept, a.src))
    p, where = hit[0]
    mid = model_id(p['id'])
    S = json.load(open(SITES, encoding='utf-8'))
    if a.region and a.region not in S['regions']:
        sys.exit('propose_site: no region %s in openworld/SITES.json (%s)' % (a.region, ', '.join(S['regions'])))
    stype = p['type'] if p['type'] in ('city', 'village', 'outpost', 'camp') else 'outpost'
    site = {'name': p['name'], 'type': stype, 'region': a.region, 'reach_km': p.get('reach_km') or {'city': 30, 'village': 15}.get(stype, 8),
            'culture': p.get('culture'), 'page': None, 'state': 'proposed',
            'proposal': {'id': p['id'], 'from': where, 'region': p.get('region'), 'created': p.get('created'), 'notes': p.get('notes') or '',
                         'assessment': summary(p)}}
    mtype = p['type'] if p['type'] in MODEL_TYPES else 'outpost'
    rec = {'id': mid, 'name': p['name'], 'type': mtype, 'px': round(p['px']), 'py': round(p['py']),
           'notes': (p.get('notes') or '') + (' ' if p.get('notes') else '') + '(proposed in the open world, %s: openworld/SITES.json %s)' % (p.get('region'), mid),
           'createdAt': p.get('created') or ''}
    js = open(SETTS, encoding='utf-8').read()
    print('openworld/SITES.json: site %s %s' % (mid, json.dumps(site, ensure_ascii=False)))
    if a.region:
        print('  and one of region %s\'s sites' % a.region)
    print('model/src/60-settlements.js: %s' % json.dumps(rec, ensure_ascii=False))
    if mid in S['sites'] or ('"id": "%s"' % mid) in js:
        sys.exit('propose_site: %s is already in SITES.json or the model: nothing to do' % mid)
    if not a.write:
        print('(dry run: --write to apply)')
        return
    # SITES.json keeps its layout (a site a line): the site goes in as a line, the region's list in place
    txt = open(SITES, encoding='utf-8').read()
    end = txt.rstrip().rfind('\n }')
    if end < 0:
        sys.exit('propose_site: the sites table was not found in openworld/SITES.json')
    txt = txt[:end] + ',\n  %s: %s' % (json.dumps(mid), json.dumps(site, ensure_ascii=False)) + txt[end:]
    if a.region:
        m = re.search(r'("%s": \{\n(?:.*\n)*?\s*"sites": \[)([^\]]*)\]' % re.escape(a.region), txt)
        if not m:
            sys.exit('propose_site: region %s\'s sites were not found' % a.region)
        txt = txt[:m.start(2)] + m.group(2) + ', ' + json.dumps(mid) + txt[m.end(2):]
    json.loads(txt)   # still JSON
    with open(SITES, 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)
    line = json.dumps(rec, ensure_ascii=False)
    m = re.search(r'(const defSetts = \[.*)\];\n', js)
    if not m:
        sys.exit('propose_site: the default settlement list was not found in 60-settlements.js')
    js = js[:m.end(1)] + ', ' + line + js[m.end(1):]
    keys = re.findall(r"'5\.1p(\d+)'", js)
    v = '5.1p%d' % (max([int(k) for k in keys] or [0]) + 1)
    m2 = re.search(r"(const SETT_ADDED=\{\n(?:.*\n)*?)(  \};\n)", js)
    if not m2:
        sys.exit('propose_site: SETT_ADDED was not found in 60-settlements.js')
    body = m2.group(1).rstrip('\n')
    js = js[:m2.start(1)] + body + ",\n    '%s':[%s]\n" % (v, line) + m2.group(2) + js[m2.end(2):]
    with open(SETTS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js)
    print('written: SITES.json and 60-settlements.js (defSetts and SETT_ADDED[%r])' % v)
    if a.region:
        print('next: python3 tools/scale-model/cut_site.py %s   (the cut grows to the new site\'s square), then plan it in the '
              'region\'s src/48-world-site.js and python3 core/world/bake_sites.py %s' % (a.region, a.region))
    else:
        print('next: give it a region (--region, or a new one in openworld/SITES.json), then cut_site.py and bake_sites.py')


if __name__ == '__main__':
    main()
