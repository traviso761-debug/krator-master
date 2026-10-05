#!/usr/bin/env python3
"""List the edit requests queued from the browser, with the fragments that likely hold each object.

    python3 tools/edits/pending.py [BUILD]          # e.g. settlements/girder; default: all builds
    python3 tools/edits/pending.py --show ID        # the full record
    python3 tools/edits/pending.py --done ID [...]  # move applied requests to edits/done/

For each request: the note, where it was clicked, what the inspector called the object, and the build's
src/ fragments that mention the most of the object's names and labels (a hint, not a proof: confirm by
reading the section). Standard library only.
"""
import argparse, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PENDING = os.path.join(ROOT, 'edits', 'pending')
DONE = os.path.join(ROOT, 'edits', 'done')
SKIP_KEYS = {'uuid', 'type', 'probeSkip'}
GENERIC = {'mesh', 'group', 'object', 'scene', 'instancedmesh', 'true', 'false', 'null', 'none', 'ground', 'terrain'}


def load(rid):
    p = os.path.join(PENDING, rid if rid.endswith('.json') else rid + '.json')
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def terms(rec):
    """Distinctive strings from the hit object chain and the inspector text."""
    out = []

    def walk(v, key=''):
        if key in SKIP_KEYS:
            return
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, dict):
            for k, x in v.items():
                walk(x, k)
        elif isinstance(v, list):
            for x in v:
                walk(x, key)
    for o in rec.get('object', []):
        walk(o.get('name', '')); walk(o.get('userData', {}))
    for x in rec.get('site') or []:
        out += x.split('|')            # Voth lineage: 'name|label'
    first = (rec.get('inspector') or rec.get('tooltip') or '').split('\n')[0]
    out += [w for w in re.split(r'[·|,:()]', first)]
    seen, keep = set(), []
    for t in out:
        t = t.strip()
        if 3 <= len(t) <= 60 and t.lower() not in GENERIC and t not in seen and not re.fullmatch(r'[\d.\s-]+', t):
            seen.add(t); keep.append(t)
    return keep[:20], set(t for x in rec.get('site') or [] for t in x.split('|'))


def fragments(build, ts, strong=()):
    src = os.path.join(ROOT, build, 'src')
    if not build or not os.path.isdir(src) or not ts:
        return []
    score = []
    for f in sorted(os.listdir(src)):
        if not f.endswith('.js'):
            continue
        with open(os.path.join(src, f), encoding='utf-8', errors='replace') as fh:
            s = fh.read()
        hit = [t for t in ts if t in s]
        if hit:
            score.append((sum(3 if t in strong else 1 for t in hit), f, hit))
    score.sort(key=lambda x: (-x[0], x[1]))
    return score[:4]


def show_one(rec):
    o = (rec.get('object') or [{}])[0]
    ud = o.get('userData') or {}
    what = (rec.get('inspector') or rec.get('tooltip') or o.get('name') or ud.get('inspectLabel')
            or ' '.join('%s=%s' % (k, ud[k]) for k in ('fam', 'kind', 'shape', 'biome') if k in ud) or o.get('type') or '(nothing hit)')
    print('== %s   [%s]' % (rec['id'], rec.get('build') or '?'))
    print('   note:   %s' % rec['note'])
    print('   object: %s' % ' '.join(what.split())[:160])
    if rec.get('site'):
        print('   site:   %s' % ' / '.join(dict.fromkeys(rec['site'])))
    print('   point:  %s   camera: %s' % (rec.get('point'), rec.get('camera', {}).get('position')))
    for n, f, hit in fragments(rec.get('build'), *terms(rec)):
        print('   likely: %s/src/%s  (%s)' % (rec['build'], f, ', '.join(hit[:5])))


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('build', nargs='?')
    ap.add_argument('--show')
    ap.add_argument('--done', nargs='+')
    a = ap.parse_args()
    if a.show:
        print(json.dumps(load(a.show), indent=1)); return
    if a.done:
        os.makedirs(DONE, exist_ok=True)
        for rid in a.done:
            n = rid if rid.endswith('.json') else rid + '.json'
            shutil.move(os.path.join(PENDING, n), os.path.join(DONE, n)); print('done: ' + rid)
        return
    names = sorted(os.listdir(PENDING)) if os.path.isdir(PENDING) else []
    recs = [load(n) for n in names if n.endswith('.json')]
    if a.build:
        recs = [r for r in recs if r.get('build') == a.build.strip('/').replace('\\', '/')]
    if not recs:
        print('no pending edits'); return
    for r in recs:
        show_one(r)
    print('\n%d pending. Apply each in src/, rebuild and verify, then: python3 tools/edits/pending.py --done ID' % len(recs))


if __name__ == '__main__':
    sys.exit(main())
