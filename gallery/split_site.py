#!/usr/bin/env python3
"""Split gallery/site/ (build_gallery.py) into artifacts that each fit one artifact version (256 MiB; owner, 2026-10-14).

    python3 gallery/split_site.py [--parts 2] [--cap 250] [--alone 'biome,objects=Krator Biomes and Objects'] [--link NAME=URL ...]

Writes gallery/site-1/, gallery/site-2/, ...: each an index.html and the worlds/ its cards open. A page goes with the
library-pack sidecars it loads (<script src="*.tex.*.js">), and pages that load the same pack (by content: Mungo's and
Verge's copy of Locus's pack is Locus's) go together, so a pack is published once: the copies are dropped and the pages'
tags point at the one kept. Groups are packed first-fit by size, largest first; part 1 is the one holding Voth (the
Krator Worlds artifact). Each index lists its own cards; --link NAME=URL adds a block naming another part (the parts
link to each other once they have URLs: publish 2 and 3, then rerun with their links and publish 1). --alone puts the
named sections in a part of their own, the last, under its own title (owner: the biomes and objects on their own page).
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
        page = open(os.path.join(W, e['slug'] + '.html'), encoding='utf-8').read()
        side[e['slug']] = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', page)
    alone = arg('--alone')
    alone_secs, alone_title = (alone.split('=', 1)[0].split(','), alone.split('=', 1)[1]) if alone else ([], None)
    lone = [e for e in entries if e['section'] in alone_secs]
    entries = [e for e in entries if e['section'] not in alone_secs]
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
        return sum(os.path.getsize(os.path.join(W, e['slug'] + '.html')) for e in g) + \
            sum(os.path.getsize(os.path.join(W, f)) for f in files)
    bins = [[] for _ in range(parts)]
    used = [0.0] * parts
    for g in sorted(groups.values(), key=lambda g: (-size(g), g[0]['slug'])):
        s = size(g)
        i = next((i for i in range(parts) if used[i] + s <= cap), None)
        if i is None:
            sys.exit('split_site: %s (%.0f MB) fits no part under %.0f MB: raise --parts' % (g[0]['slug'], s / 1e6, cap / 1e6))
        bins[i] += g; used[i] += s
    bins.sort(key=lambda b: (not any(e['slug'] == 'voth' for e in b), -len(b)))
    titles = TITLES[:len(bins)] + ([alone_title] if lone else [])
    if lone:
        bins.append(lone)
    for n, b in enumerate(bins, 1):
        out = os.path.join(HERE, 'site-%d' % n)
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(os.path.join(out, 'worlds'))
        keep = sorted({canon[body_key(os.path.join(W, f))] for e in b for f in side[e['slug']]})
        for f in keep:
            shutil.copy(os.path.join(W, f), os.path.join(out, 'worlds', f))
        for e in b:
            page = open(os.path.join(W, e['slug'] + '.html'), encoding='utf-8').read()
            page = re.sub(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>',
                          lambda mm: '<script src="%s"></script>' % canon[body_key(os.path.join(W, mm.group(1)))], page)
            open(os.path.join(out, 'worlds', e['slug'] + '.html'), 'w', encoding='utf-8', newline='').write(page)
        html = index[:m.start(1)] + json.dumps(b, ensure_ascii=False) + index[m.end(1):]
        title = titles[n - 1]
        html = html.replace('<title>Krator Worlds</title>', '<title>%s</title>' % title, 1)
        html = html.replace('<h1>Krator Worlds</h1>', '<h1>%s</h1>' % title, 1)
        blocks = ''.join('  <section class="scale">\n    <h2>%s</h2>\n    <p>More of Krator\'s worlds, kits and biomes: the gallery is '
                         'split in parts, each one artifact. <a href="%s" target="_blank" rel="noopener">Open %s &rarr;</a></p>\n'
                         '  </section>\n' % (name, url, name) for name, url in links if name != title)
        html = html.replace('  <main id="registers"></main>', blocks + '  <main id="registers"></main>', 1)
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
        print('site-%d  %-18s %2d pages  %3d files  %.1f MB' % (n, title, len(b), len(os.listdir(os.path.join(out, 'worlds'))),
                                                            sum(os.path.getsize(os.path.join(out, 'worlds', f)) for f in os.listdir(os.path.join(out, 'worlds'))) / 1e6))


if __name__ == '__main__':
    main()
