#!/usr/bin/env python3
"""Split gallery/site/ (build_gallery.py) into artifacts that each fit one artifact version (256 MiB; owner, 2026-10-14).

    python3 gallery/split_site.py [--alpha | --parts 2] [--cap 250] [--alone 'biome,objects=Krator Biomes and Objects' ...]
        [--urls URL1,URL2,...] [--link NAME=URL ...]

--alpha (owner, 2026-10-16, the way the gallery is published now): the world parts by the alphabet, titled by their
range ('Krator Worlds A-H'); --urls names their artifacts in order. See alpha_parts().

Writes gallery/site-1/, gallery/site-2/, ...: each an index.html and the worlds/ its cards open. A page goes with the
library-pack sidecars it loads (<script src="*.tex.*.js">), and pages that load the same pack (by content: Mungo's and
Verge's copy of Locus's pack is Locus's) go together, so a pack is published once: the copies are dropped and the pages'
tags point at the one kept. Groups are packed first-fit by size, largest first; part 1 is the one holding Voth (the
Krator Worlds artifact). Each index lists its own cards; --link NAME=URL adds a block naming another part (the parts
link to each other once they have URLs: publish 2 and 3, then rerun with their links and publish 1). --alone puts the
named sections in a part of their own, the last, under its own title (owner: the biomes and objects on their own page).
--alone may be given more than once: each group is a part (or parts) of its own, after the world parts, in the order given.
With --alpha, a group over the cap is split by the alphabet like the world parts and each part titled by its range
('Krator Biomes A-G'; owner, 2026-11-09). --urls names every part's artifact in order: the world parts, then the --alone
parts.
"""
import hashlib, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, 'site')
TITLES = ['Krator Worlds', 'Krator Worlds II', 'Krator Worlds III', 'Krator Worlds IV']


def arg(name, d=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else d


def body_key(path):
    b = open(path, 'rb').read()
    return hashlib.sha1(b.split(b'\n', 1)[1]).hexdigest()   # the first line names the build that wrote it


def sort_name(e):
    """a card's name for the alphabet: a leading 'The' or 'A' ignored, as the index orders its sections"""
    n = re.sub(r'^(the|a)\s+', '', e['name'].strip(), flags=re.I)
    return n.lower()


def alpha_parts(entries, size, cap, prefix='Krator Worlds'):
    """--alpha (owner, 2026-10-16): the world parts by the alphabet, titled by their range ('Krator Worlds A-K').
    Pages in name order fill the parts one after another, balanced: as few parts as fit under the cap, each about an
    even share. A part keeps its own copy of every pack its pages load (a pack two parts share is in both), so no range
    bends to keep a pack together."""
    order = sorted(entries, key=lambda e: (sort_name(e), e['slug']))
    def fill(limit):
        bins, cur = [], []
        for e in order:
            if cur and size(cur + [e]) > limit:
                bins.append(cur); cur = []
            if size([e]) > cap:
                sys.exit('split_site: %s (%.0f MB) is over the cap alone' % (e['slug'], size([e]) / 1e6))
            cur.append(e)
        return bins + ([cur] if cur else [])
    k = len(fill(cap))
    total = sum(size([e]) for e in order)
    limit = total / k
    while True:   # the smallest even share that still makes k parts, each under the cap
        b = fill(min(cap, limit))
        if len(b) <= k:
            break
        limit *= 1.02
    letter = lambda e: sort_name(e)[:1].upper()
    titles = ['%s %s–%s' % (prefix, letter(p[0]), letter(p[-1])) if letter(p[0]) != letter(p[-1]) else '%s %s' % (prefix, letter(p[0]))
              for p in b]
    return b, titles


def main():
    parts, cap = int(arg('--parts', 2)), float(arg('--cap', 250)) * 1e6
    links = [a.split('=', 1) for i, a in enumerate(sys.argv) if sys.argv[i - 1] == '--link']
    index = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    m = re.search(r'const ENTRIES = (\[.*?\]);\n', index)
    entries = json.loads(m.group(1))
    W = os.path.join(SITE, 'worlds')
    side, canon = {}, {}   # slug -> its sidecars; content key -> the one file name kept (the first in sorted order)
    for f in sorted(os.listdir(W)):
        if '.tex.' in f:
            canon.setdefault(body_key(os.path.join(W, f)), f)
    for e in entries:
        if e.get('href'):   # a card for another artifact (build_gallery.py, LINKED): no page here, no weight
            side[e['slug']] = []
            continue
        page = open(os.path.join(W, e['slug'] + '.html'), encoding='utf-8').read()
        side[e['slug']] = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', page)
    alones = [a.split('=', 1) for i, a in enumerate(sys.argv) if sys.argv[i - 1] == '--alone']   # [[sections, title], ...]
    lones = [([e for e in entries if e['section'] in secs.split(',')], title) for secs, title in alones]
    gone = {s for secs, _ in alones for s in secs.split(',')}
    entries = [e for e in entries if e['section'] not in gone]
    # groups: pages that share a pack (by content) stay together
    parent = {e['slug']: e['slug'] for e in entries}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    owner = {}
    for e in entries:
        for f in side[e['slug']]:
            k = body_key(os.path.join(W, f))
            if k in owner:
                parent[find(e['slug'])] = find(owner[k])
            else:
                owner[k] = e['slug']
    groups = {}
    for e in entries:
        groups.setdefault(find(e['slug']), []).append(e)
    def size(g):
        files = {canon[body_key(os.path.join(W, f))] for e in g for f in side[e['slug']]}
        return sum(os.path.getsize(os.path.join(W, e['slug'] + '.html')) for e in g if not e.get('href')) + \
            sum(os.path.getsize(os.path.join(W, f)) for f in files)
    if '--alpha' in sys.argv:
        bins, titles = alpha_parts(entries, size, cap)
    else:
        bins = [[] for _ in range(parts)]
        used = [0.0] * parts
        for g in sorted(groups.values(), key=lambda g: (-size(g), g[0]['slug'])):
            s = size(g)
            i = next((i for i in range(parts) if used[i] + s <= cap), None)
            if i is None:
                sys.exit('split_site: %s (%.0f MB) fits no part under %.0f MB: raise --parts' % (g[0]['slug'], s / 1e6, cap / 1e6))
            bins[i] += g; used[i] += s
        bins.sort(key=lambda b: (not any(e['slug'] == 'voth' for e in b), -len(b)))
        titles = TITLES[:len(bins)]
    # --urls U1,U2,...: the world parts' artifacts in order; each index links to the others under their titles
    for lone, title in lones:   # the --alone groups, after the world parts: one part each, or by the alphabet (--alpha) if over the cap
        if not lone:
            continue
        if '--alpha' in sys.argv and size(lone) > cap:
            b, t = alpha_parts(lone, size, cap, title)
        else:
            b, t = [lone], [title]
        bins += b
        titles += t
    urls = [u for u in (arg('--urls') or '').split(',') if u]
    links = [[t, u] for t, u in zip(titles, urls)] + links
    for n, b in enumerate(bins, 1):
        out = os.path.join(HERE, 'site-%d' % n)
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(os.path.join(out, 'worlds'))
        keep = sorted({canon[body_key(os.path.join(W, f))] for e in b for f in side[e['slug']]})
        for f in keep:
            shutil.copy(os.path.join(W, f), os.path.join(out, 'worlds', f))
        for e in b:
            if e.get('href'):
                continue
            page = open(os.path.join(W, e['slug'] + '.html'), encoding='utf-8').read()
            page = re.sub(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>',
                          lambda mm: '<script src="%s"></script>' % canon[body_key(os.path.join(W, mm.group(1)))], page)
            open(os.path.join(out, 'worlds', e['slug'] + '.html'), 'w', encoding='utf-8', newline='').write(page)
        html = index[:m.start(1)] + json.dumps(b, ensure_ascii=False) + index[m.end(1):]
        title = titles[n - 1]
        html = html.replace('<title>Krator Worlds</title>', '<title>%s</title>' % title, 1)
        html = html.replace('<h1>Krator Worlds</h1>', '<h1>%s</h1>' % title, 1)
        blocks = ''.join('      <a class="btn" href="%s" target="_blank" rel="noopener"><b>%s<i aria-hidden="true">&nearr;</i></b>'
                         "<span>More of Krator's worlds, kits and biomes: the gallery is split in parts, each one artifact.</span></a>\n"
                         % (url, name) for name, url in links if name != title)
        html = html.replace('<div class="col" hidden>', '<div class="col">', 1).replace('<!--PARTS-->', blocks, 1)
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
        print('site-%d  %-18s %2d pages  %3d files  %.1f MB' % (n, title, len(b), len(os.listdir(os.path.join(out, 'worlds'))),
                                                            sum(os.path.getsize(os.path.join(out, 'worlds', f)) for f in os.listdir(os.path.join(out, 'worlds'))) / 1e6))


if __name__ == '__main__':
    main()
