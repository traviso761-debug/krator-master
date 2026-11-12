"""The last pass on the network's routes before net51.json is written (route51.py calls finish(); run alone it rewrites net51.json in place:
python legs51.py <folder holding net51.json and setts.json>).

1. The Rift line's Theodiga-Strongbow leg is split where it passes Qiblai and Longsong (pass-through points, not numbered stations), so an
   open-world link can follow the stretch it needs (the Oidong-High Rift session, 2026-11-11: the valley links Longsong-Strongbow).
2. Every route gets a UNIQUE id: a route id several legs share ('rift', 'rift.bowl', 'span') becomes id.<from>-<to> on each leg, and the
   shared id is kept as `line`. A route whose id is already unique keeps it (and `line` is its id)."""
import sys, json, math, re

SPLIT = {('Theodiga', 'Strongbow'): ['Qiblai', 'Longsong']}


def slug(n):
    n = re.sub(r'^the ', '', n.strip().lower())
    return re.sub(r'[^a-z0-9]+', '-', n).strip('-')


def _arc(px):
    return [0.0] + [sum(math.hypot(px[k][0] - px[k - 1][0], px[k][1] - px[k - 1][1]) for k in range(1, i + 1)) for i in range(1, len(px))]


def _split(r, at, places):
    """r cut at the points nearest each place in `at` (in order along it); km, tunnel_km and airless_open_km shared by length"""
    px, n = r['px'], len(r['px'])
    cuts, lo = [], 1
    for name in at:
        q = places[name]
        k = min(range(lo, n - 1), key=lambda i: math.hypot(px[i][0] - q[0], px[i][1] - q[1]))
        cuts.append((k, name)); lo = k + 1
    A = _arc(px); tot = A[-1] or 1.0
    tun = lambda i0, i1: sum(A[i + 1] - A[i] for i in range(i0, i1) if r['form'][i] == 'tunnel')
    T = tun(0, n - 1) or 1.0
    bounds = [(0, r['from'])] + cuts + [(n - 1, r['to'])]
    out = []
    for (i0, a), (i1, b) in zip(bounds, bounds[1:]):
        p = dict(r)
        p['px'], p['form'], p['up'] = r['px'][i0:i1 + 1], r['form'][i0:i1 + 1], r['up'][i0:i1 + 1]
        p['from'], p['to'] = a, b
        share = (A[i1] - A[i0]) / tot
        p['km'] = round(r['km'] * share)
        p['tunnel_km'] = round(r['tunnel_km'] * tun(i0, i1) / T) if r['tunnel_km'] else 0
        p['airless_open_km'] = round(r['airless_open_km'] * share) if r['airless_open_km'] else 0
        nm = r['name'].split(':')[0]
        num = lambda x: re.search(re.escape(x) + r' \(\d+\)', r['name'])
        lab = lambda x: num(x).group(0) if num(x) else x
        p['name'] = '%s: %s to %s' % (nm, lab(a), lab(b))
        out.append(p)
    return out


def finish(routes, places):
    rs = []
    for r in routes:
        key = (r.get('from'), r.get('to'))
        rs.extend(_split(r, SPLIT[key], places) if r['class'] == 'line' and key in SPLIT else [r])
    count = {}
    for r in rs: count[r['id']] = count.get(r['id'], 0) + 1
    for r in rs:
        base = r.get('line', r['id'])
        r['line'] = base
        if count.get(base, 0) > 1: r['id'] = '%s.%s-%s' % (base, slug(r['from']), slug(r['to']))
    ids = [r['id'] for r in rs]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup: raise SystemExit('legs51: ids still repeat: %s' % dup)
    return rs


if __name__ == '__main__':
    SP = sys.argv[1]
    d = json.load(open(SP + '/net51.json', encoding='utf8'))
    S = {s['name']: (s['px'], s['py']) for s in json.load(open(SP + '/setts.json', encoding='utf8'))}
    if any(r.get('line') for r in d['routes']): raise SystemExit('legs51: net51.json is already finished')
    d['routes'] = finish(d['routes'], S)
    json.dump(d, open(SP + '/net51.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(len(d['routes']), 'routes;', [r['id'] for r in d['routes'] if r['line'] != r['id']])
