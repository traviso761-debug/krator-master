#!/usr/bin/env python3
"""Find and download Poly Haven textures for the material library: the step before ingest_polyhaven.py.

    python3 tools/textures/fetch_polyhaven.py gaps [--all]
    python3 tools/textures/fetch_polyhaven.py search WORD... [--id ID] [--limit N]
    python3 tools/textures/fetch_polyhaven.py fetch SLUG... --out DIR [--res 1k]

gaps     every library id in ingest_polyhaven.SUGGEST, how many library sets cover it and the best Poly Haven
         candidates for it (most downloaded first, already-adopted assets left out). Ids with no set come
         first; --all also lists the covered ids. A set covers an id when its folder is the id or starts with
         "<id>." (rock.rock_face covers rock).
search   assets whose slug, name, tags or categories contain every WORD (or whose suggested id is --id),
         with their real-world size, suggested id and whether the library already holds them.
fetch    downloads, per slug, exactly what the ingest reads: colour (diff, jpg), OpenGL normal (nor_gl, png)
         and roughness (rough, png; else the arm pack) into DIR/<slug>/, named as Poly Haven names them, so
         `ingest_polyhaven.py DIR OUT` picks them up unchanged. Files are checked against Poly Haven's md5 and
         skipped when already present. About 15 MB per asset at 1k. It also writes DIR/batch-stub.json: one
         adopt.py entry per slug with the suggested id, the tint guess and `scale` from Poly Haven's
         dimensions (metres per tile), which replaces the ingest's [2, 2] placeholder. Review it before use.

Then, as in core/materials/PLAN.md, "Poly Haven ingest":
    python3 tools/textures/ingest_polyhaven.py DIR ph-out --catalog-only     # judge the contact sheets
    python3 tools/textures/ingest_polyhaven.py DIR ph-out --only slug1,slug2
    python3 tools/textures/adopt.py --polyhaven ph-out tools/textures/batches/<name>.json

Every candidate is a suggestion. Judge the sets in the demo kit (core/materials/demo) before committing.
Poly Haven assets are CC0. Needs only the standard library plus what ingest_polyhaven.py imports (numpy, Pillow).
"""
import argparse, hashlib, json, os, re, sys, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ingest_polyhaven import SUGGEST, UNTINTED, suggest_id  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core/materials/library')
API = 'https://api.polyhaven.com'
UA = 'krator-texture-fetch/1'          # Poly Haven asks API users to send a distinctive User-Agent
WANT = (('Diffuse', 'jpg'), ('nor_gl', 'png'), ('Rough', 'png'))
FAMILY = {'steel': 'metal'}           # library ids are <family>.<slug>: metal.rusty_metal_04, rock.rock_face
FALLBACK = {'Rough': ('arm', 'png')}   # ingest reads roughness from the arm pack's green channel


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    return data if binary else json.loads(data)


def assets():
    return get(API + '/assets?t=textures')


def asset_id(slug, a):
    """Suggested library id: from the slug, else a vote over the tags and categories one at a time (at least
    two must agree; a lone tag misleads: "street" contains "tree"). A voted id ends in "?"."""
    sid = suggest_id(slug)
    if sid:
        return sid
    votes = {}
    for t in a.get('tags', []) + a.get('categories', []):
        v = suggest_id(t.strip().replace(' ', '_'))
        if v:
            votes[v] = votes.get(v, 0) + 1
    best = max(votes.items(), key=lambda kv: kv[1], default=(None, 0))
    return best[0] + '?' if best[1] >= 2 else ''


def size_m(a):
    d = a.get('dimensions') or []
    return [round(v / 1000, 2) for v in d[:2]] if len(d) >= 2 else None


def library():
    """(set ids, Poly Haven slugs already adopted)."""
    ids, slugs = [], set()
    for name in sorted(os.listdir(LIB)):
        meta = os.path.join(LIB, name, 'meta.json')
        if not os.path.isfile(meta):
            continue
        ids.append(name)
        with open(meta, encoding='utf-8') as f:
            src = json.load(f).get('source', {})
        if 'polyhaven' in str(src.get('url', '')).lower() or src.get('library') == 'Poly Haven':
            slugs.add(src.get('asset') or name.split('.', 1)[-1])
    return ids, slugs


def covers(ids, sid):
    """Library sets that fill the role sid: named sid (or sid.*), or a family.slug set whose slug suggests sid
    (metal.rusty_metal_04 fills steel.rust)."""
    return [i for i in ids if i == sid or i.startswith(sid + '.') or suggest_id(i.split('.', 1)[-1]) == sid]


def row(slug, a, have):
    sz = size_m(a)
    return '%-34s %-18s %-11s %8d  %s' % (slug, asset_id(slug, a) or '-', '%gx%g m' % tuple(sz) if sz else '?',
                                          a.get('download_count', 0), 'IN LIBRARY' if slug in have else '')


def cmd_gaps(args):
    data = assets()
    ids, have = library()
    by_id = {}
    for slug, a in data.items():
        if slug not in have:
            sid = asset_id(slug, a)
            by_id.setdefault(sid.rstrip('?'), []).append(slug + ('?' if sid.endswith('?') else ''))
    rows = []
    for sid, _ in SUGGEST:
        cands = sorted(by_id.get(sid, []), key=lambda s: -data[s.rstrip('?')].get('download_count', 0))
        rows.append((len(covers(ids, sid)), sid, cands))
    rows.sort(key=lambda r: (r[0] > 0, r[1]))
    print('%-18s %4s %5s  best candidates (most downloaded first; "?" = guessed from tags)' % ('id', 'sets', 'cands'))
    for n, sid, cands in rows:
        if n and not args.all:
            continue
        print('%-18s %4d %5d  %s' % (sid, n, len(cands), ', '.join(cands[:args.limit]) or '-'))
    if not args.all:
        print('\n(%d ids already have sets; --all lists them)' % sum(1 for r in rows if r[0]))


def cmd_search(args):
    data = assets()
    _, have = library()
    words = [w.lower() for w in args.words]
    hits = []
    for slug, a in data.items():
        hay = ' '.join([slug, a.get('name', '')] + a.get('tags', []) + a.get('categories', [])).lower()
        if all(w in hay for w in words) and (not args.id or asset_id(slug, a).rstrip('?') == args.id):
            hits.append(slug)
    hits.sort(key=lambda s: -data[s].get('download_count', 0))
    print('%-34s %-18s %-11s %8s' % ('slug', 'suggested id', 'size', 'downloads'))
    for slug in hits[:args.limit]:
        print(row(slug, data[slug], have))
    print('\n%d matches%s' % (len(hits), ' (showing %d)' % args.limit if len(hits) > args.limit else ''))


def pick(files, key, ext, res):
    f = files.get(key, {}).get(res, {}).get(ext)
    if not f and key in FALLBACK:
        k2, e2 = FALLBACK[key]
        f = files.get(k2, {}).get(res, {}).get(e2)
    return f


def cmd_fetch(args):
    data = assets()
    _, have = library()
    os.makedirs(args.out, exist_ok=True)
    stub, failed = [], []
    for slug in args.slugs:
        a = data.get(slug)
        if not a:
            print('%s: not a Poly Haven texture' % slug); failed.append(slug); continue
        if slug in have:
            print('%s: already in the library (fetching anyway)' % slug)
        files = get('%s/files/%s' % (API, slug))
        d = os.path.join(args.out, slug)
        os.makedirs(d, exist_ok=True)
        ok = True
        for key, ext in WANT:
            f = pick(files, key, ext, args.res)
            if not f:
                print('%s: no %s %s at %s' % (slug, key, ext, args.res)); ok = False; continue
            path = os.path.join(d, f['url'].rsplit('/', 1)[-1])
            if os.path.isfile(path) and md5(path) == f['md5']:
                print('%s: %s present' % (slug, os.path.basename(path))); continue
            blob = get(f['url'], binary=True)
            if hashlib.md5(blob).hexdigest() != f['md5']:
                print('%s: md5 mismatch on %s' % (slug, f['url'])); ok = False; continue
            with open(path, 'wb') as out:
                out.write(blob)
            print('%s: %s (%.1f MB)' % (slug, os.path.basename(path), len(blob) / 1e6))
        if not ok:
            failed.append(slug)
        sid = asset_id(slug, a)
        sz = size_m(a)
        fam = FAMILY.get(sid.split('.')[0], sid.split('.')[0]) if sid else ''
        stub.append(dict(slug=slug, id='%s.%s' % (fam, slug) if fam else slug, scale=sz or [2, 2],
                         tint=not UNTINTED.search(slug),
                         note='fetched by fetch_polyhaven.py; scale from Poly Haven dimensions%s; id suggested, check it'
                              % ('' if sz else ' (missing: placeholder)')))
    with open(os.path.join(args.out, 'batch-stub.json'), 'w', encoding='utf-8') as f:
        json.dump(stub, f, indent=1)
        f.write('\n')
    print('\nwrote %s (%d entries)' % (os.path.join(args.out, 'batch-stub.json'), len(stub)))
    if failed:
        print('incomplete: %s' % ', '.join(failed))
        sys.exit(1)


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    g = sub.add_parser('gaps'); g.add_argument('--all', action='store_true'); g.add_argument('--limit', type=int, default=6)
    s = sub.add_parser('search'); s.add_argument('words', nargs='*'); s.add_argument('--id'); s.add_argument('--limit', type=int, default=30)
    f = sub.add_parser('fetch'); f.add_argument('slugs', nargs='+'); f.add_argument('--out', required=True)
    f.add_argument('--res', default='1k', help='1k reads straight in at 1024 px; 2k only if a 1k map looks soft')
    args = ap.parse_args()
    {'gaps': cmd_gaps, 'search': cmd_search, 'fetch': cmd_fetch}[args.cmd](args)


if __name__ == '__main__':
    main()
